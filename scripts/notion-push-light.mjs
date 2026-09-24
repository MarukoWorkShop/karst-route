#!/usr/bin/env node
/**
 * 反向同步：content/experiences.yaml + content/light-skus.yaml → Notion
 *
 * 正常流程是 Notion → yaml（npm run content:notion）。当内容是在仓库里改的、
 * 或需要批量写入时，用本脚本把 yaml 推回 Notion，避免下次单向同步把改动冲掉。
 *
 * 用法：
 *   NOTION_TOKEN=secret_xxx node scripts/notion-push-light.mjs
 *   NOTION_TOKEN=secret_xxx node scripts/notion-push-light.mjs --only=skus
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const VERSION = "2022-06-28";
const VERSION_DS = "2025-09-03";
const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only=")) || "").split("=")[1] ?? "";
/** --prune：把 Notion 里有、但 yaml 已删除的行归档（默认只提示不删除） */
const prune = args.includes("--prune");

function token() {
  const env = process.env.NOTION_TOKEN?.trim();
  if (env) return env;
  const f = path.join(root, ".env.local");
  if (fs.existsSync(f)) {
    const m = fs.readFileSync(f, "utf8").match(/^\s*NOTION_TOKEN\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  return "";
}
const TOKEN = token();
if (!TOKEN) {
  console.log("\n缺少 NOTION_TOKEN（放 .env.local 或用环境变量传入）。\n");
  process.exit(1);
}

async function api(url, init = {}, version = VERSION) {
  const res = await fetch(`https://api.notion.com/v1${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": version,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || res.statusText}`);
  return body;
}

async function queryAll(dataSourceId) {
  const pages = [];
  let cursor;
  do {
    const body = await api(
      `/data_sources/${dataSourceId}/query`,
      { method: "POST", body: JSON.stringify({ page_size: 100, start_cursor: cursor }) },
      VERSION_DS,
    );
    pages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return pages;
}

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "") } }] });
const sel = (v) => (v ? { select: { name: String(v) } } : { select: null });
const num = (v) => ({ number: v == null || v === "" ? null : Number(v) });
const join = (arr, key) => (Array.isArray(arr) ? arr.map((x) => (key ? x?.[key] ?? "" : x ?? "")).join("\n") : "");

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const dsExp = cfg.dataSources?.lightExperiences;
const dsSkus = cfg.dataSources?.lightSkus;
const dbSkus = cfg.databases?.lightSkus;

// ---------- 栏目 ----------
async function pushExperiences() {
  const doc = parseYaml(fs.readFileSync(path.join(root, "content", "experiences.yaml"), "utf8"));
  const items = Array.isArray(doc?.items) ? doc.items : [];
  if (!items.length) return console.log("experiences.yaml 无内容");
  if (!dsExp) return console.log("缺少 dataSources.lightExperiences");

  const pages = await queryAll(dsExp);
  const byId = new Map();
  for (const p of pages) {
    const id = p.properties?.id?.select?.name ?? "";
    if (id) byId.set(id, p);
  }

  let created = 0;
  let updated = 0;
  for (const it of items) {
    if (!it?.id) continue;
    const d = Array.isArray(it.desc) ? it.desc : [];
    const props = {
      标题: { title: [{ text: { content: `${it.id} · ${it.title?.zh ?? it.id}` } }] },
      id: sel(it.id),
      badge: rt(it.badge ?? ""),
      title_zh: rt(it.title?.zh ?? ""),
      title_en: rt(it.title?.en ?? ""),
      tagline_zh: rt(it.tagline?.zh ?? ""),
      tagline_en: rt(it.tagline?.en ?? ""),
      duration_zh: rt(it.duration?.zh ?? ""),
      duration_en: rt(it.duration?.en ?? ""),
      group_zh: rt(it.group?.zh ?? ""),
      group_en: rt(it.group?.en ?? ""),
      season_zh: rt(it.season?.zh ?? ""),
      season_en: rt(it.season?.en ?? ""),
      cover: rt(it.cover ?? ""),
      gallery: rt(join(it.gallery)),
      desc1_zh: rt(d[0]?.zh ?? ""),
      desc1_en: rt(d[0]?.en ?? ""),
      desc2_zh: rt(d[1]?.zh ?? ""),
      desc2_en: rt(d[1]?.en ?? ""),
      highlights_zh: rt(join(it.highlights, "zh")),
      highlights_en: rt(join(it.highlights, "en")),
      included_zh: rt(join(it.included, "zh")),
      included_en: rt(join(it.included, "en")),
    };

    const hit = byId.get(it.id);
    if (hit) {
      await api(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties: props }) });
      updated++;
    } else {
      await createRow(dsExp, dbSkus && false ? dbSkus : null, props);
      created++;
    }
  }
  console.log(`栏目：更新 ${updated} · 新建 ${created}`);
}

// ---------- SKU ----------
async function pushSkus() {
  const doc = parseYaml(fs.readFileSync(path.join(root, "content", "light-skus.yaml"), "utf8"));
  const items = Array.isArray(doc?.items) ? doc.items : [];
  if (!items.length) return console.log("light-skus.yaml 无内容");
  if (!dsSkus) return console.log("缺少 dataSources.lightSkus");

  const pages = await queryAll(dsSkus);
  const byId = new Map();
  for (const p of pages) {
    const id = (p.properties?.id?.rich_text ?? []).map((t) => t.plain_text).join("").trim();
    if (id) byId.set(id, p);
  }
  // 沿用表内已有的 status / category / kind 取值，避免造出新选项
  const sample = pages[0]?.properties ?? {};
  const statusFallback = sample.status?.select?.name ?? "live";
  const kindFallback = sample.kind?.select?.name ?? "route";

  let created = 0;
  let updated = 0;
  let archived = 0;
  for (const it of items) {
    if (!it?.id) continue;
    const b = Array.isArray(it.blurb) ? it.blurb : [];
    const p = it.price ?? {};
    const props = {
      标题: { title: [{ text: { content: `${it.id} · ${it.title?.zh ?? it.id}` } }] },
      id: rt(it.id),
      category: sel(it.category ?? ""),
      kind: sel(it.kind ?? kindFallback),
      status: sel(it.status ?? statusFallback),
      sort: num(it.sort ?? 0),
      title_zh: rt(it.title?.zh ?? ""),
      title_en: rt(it.title?.en ?? ""),
      blurb1_zh: rt(b[0]?.zh ?? ""),
      blurb1_en: rt(b[0]?.en ?? ""),
      blurb2_zh: rt(b[1]?.zh ?? ""),
      blurb2_en: rt(b[1]?.en ?? ""),
      images: rt(join(it.images)),
      price_note_zh: rt(it.priceNote?.zh ?? ""),
      price_note_en: rt(it.priceNote?.en ?? ""),
    };
    if (p.unit) props.price_unit = sel(p.unit);
    if (p.flatCny != null) props.price_flat_cny = num(p.flatCny);
    if (p.raftCny != null) props.raft_cny = num(p.raftCny);
    if (p.seats != null) props.raft_seats = num(p.seats);
    if (p.minPax != null) props.min_pax = num(p.minPax);
    if (Array.isArray(p.bands) && p.bands.length) {
      const sorted = [...p.bands].sort((a, b2) => a.max - b2.max);
      props.price_cny_1_3 = num(sorted[0].cny);
      props.price_cny_4_plus = num(sorted[sorted.length - 1].cny);
    }

    const hit = byId.get(it.id);
    if (hit) {
      await api(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties: props }) });
      updated++;
    } else {
      await createRow(dsSkus, dbSkus, props);
      created++;
    }
  }

  // 归档：Notion 里有、但 yaml 已删除的行（需显式 --prune）
  const keep = new Set(items.map((i) => i.id));
  const stale = [...byId.entries()].filter(([id]) => !keep.has(id));
  if (stale.length) {
    if (prune) {
      for (const [, page] of stale) {
        await api(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
        archived++;
      }
    } else {
      console.log(
        `提示：Notion 里有 ${stale.length} 行已不在 yaml（${stale
          .map(([id]) => id)
          .join(", ")}）。加 --prune 才会归档。`,
      );
    }
  }
  console.log(`SKU：更新 ${updated} · 新建 ${created} · 归档 ${archived}`);
}

async function createRow(dataSourceId, databaseId, properties) {
  const attempts = [
    { parent: { type: "data_source_id", data_source_id: dataSourceId }, version: VERSION_DS },
    { parent: { database_id: databaseId }, version: VERSION },
  ];
  let lastErr;
  for (const a of attempts) {
    if (!a.parent.data_source_id && !a.parent.database_id) continue;
    try {
      return await api(
        "/pages",
        { method: "POST", body: JSON.stringify({ parent: a.parent, properties }) },
        a.version,
      );
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("创建行失败");
}

if (only !== "skus") await pushExperiences();
if (only !== "experiences") await pushSkus();
console.log("\n推送完成。可再跑 npm run content:notion 校验双向一致。");
