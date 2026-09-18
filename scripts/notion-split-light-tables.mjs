#!/usr/bin/env node
/**
 * 把藏在「轻体验」多源库里的 SKU 拆成侧栏可见的独立表「轻体验清单」，
 * 并把容器改回「轻体验栏目」。数据从 content/light-skus.yaml 写入。
 *
 * Usage: node scripts/notion-split-light-tables.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const VERSION = "2025-09-03";

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfgPath = path.join(root, "content/notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const doc = parseYaml(fs.readFileSync(path.join(root, "content/light-skus.yaml"), "utf8"));
const items = Array.isArray(doc.items) ? doc.items : [];

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "").replace(/.*\/([0-9a-f]{32}).*/i, "$1");
  const h = hex.match(/^[0-9a-f]{32}$/i)?.[0];
  if (!h) throw new Error(`bad id: ${raw}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function api(method, urlPath, body) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${data.message || res.statusText}`);
  return data;
}

function rt(v) {
  const s = String(v ?? "");
  const chunks = [];
  for (let i = 0; i < s.length; i += 1800) chunks.push(s.slice(i, i + 1800));
  if (!chunks.length) return { rich_text: [] };
  return { rich_text: chunks.map((content) => ({ text: { content } })) };
}
function sl(name) {
  return name ? { select: { name: String(name) } } : { select: null };
}
function num(v) {
  return v == null || v === "" || Number.isNaN(Number(v)) ? { number: null } : { number: Number(v) };
}
function priceCols(price) {
  if (!price || typeof price !== "object") {
    return {
      price_unit: sl(null),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(null),
      raft_cny: num(null),
      raft_seats: num(null),
      min_pax: num(null),
    };
  }
  if (price.unit === "raft") {
    return {
      price_unit: sl("raft"),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(null),
      raft_cny: num(price.raftCny),
      raft_seats: num(price.seats ?? 2),
      min_pax: num(null),
    };
  }
  if (price.unit === "flat") {
    return {
      price_unit: sl("flat"),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(null),
      raft_cny: num(null),
      raft_seats: num(null),
      min_pax: num(null),
    };
  }
  const bands = Array.isArray(price.bands) ? [...price.bands].sort((a, b) => a.max - b.max) : [];
  const low = bands.find((b) => b.max <= 3)?.cny ?? bands[0]?.cny ?? null;
  const high = bands.find((b) => b.max >= 4)?.cny ?? bands[bands.length - 1]?.cny ?? null;
  return {
    price_unit: sl("person"),
    price_cny_1_3: num(low),
    price_cny_4_plus: num(high),
    price_flat_cny: num(null),
    raft_cny: num(null),
    raft_seats: num(null),
    min_pax: num(price.minPax ?? null),
  };
}

const STATUS_ZH = { live: "在售", seasonal: "季节性", paused: "暂缓" };
const CATS = ["hike", "photo", "village", "foodfilm", "craft", "wellness"];
const catDbId = uuid(cfg.databases.lightExperiences);
const catMeta = await api("GET", `/databases/${catDbId}`);
const hubId = catMeta.parent?.page_id;
if (!hubId) throw new Error("找不到轻体验所在页面");

await api("PATCH", `/databases/${catDbId}`, {
  title: [{ type: "text", text: { content: "轻体验栏目" } }],
  description: [
    {
      type: "text",
      text: {
        content:
          "六大品类大卡介绍（一行一个栏目）→ content/experiences.yaml。可售 SKU 在旁边的独立表「轻体验清单」。改完跑 npm run content:notion。",
      },
    },
  ],
});
console.log("已把容器改名为「轻体验栏目」");

const schema = {
  标题: { title: {} },
  id: { rich_text: {} },
  category: { select: { options: CATS.map((name) => ({ name })) } },
  kind: {
    select: {
      options: [
        { name: "route", color: "green" },
        { name: "meal", color: "orange" },
      ],
    },
  },
  status: {
    select: {
      options: [
        { name: "在售", color: "green" },
        { name: "季节性", color: "yellow" },
        { name: "暂缓", color: "gray" },
      ],
    },
  },
  sort: { number: {} },
  title_zh: { rich_text: {} },
  title_en: { rich_text: {} },
  blurb1_zh: { rich_text: {} },
  blurb1_en: { rich_text: {} },
  blurb2_zh: { rich_text: {} },
  blurb2_en: { rich_text: {} },
  images: { rich_text: {} },
  price_unit: {
    select: {
      options: [
        { name: "person", color: "blue" },
        { name: "raft", color: "purple" },
        { name: "flat", color: "pink" },
      ],
    },
  },
  price_cny_1_3: { number: {} },
  price_cny_4_plus: { number: {} },
  price_flat_cny: { number: {} },
  raft_cny: { number: {} },
  raft_seats: { number: {} },
  min_pax: { number: {} },
  price_note_zh: { rich_text: {} },
  price_note_en: { rich_text: {} },
  note: { rich_text: {} },
};

let skuDbId = "";
{
  let cursor;
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await api("GET", `/blocks/${hubId}/children?${q}`);
    for (const b of kids.results ?? []) {
      if (b.type === "child_database" && b.child_database?.title === "轻体验清单") skuDbId = b.id;
    }
    cursor = kids.has_more ? kids.next_cursor : undefined;
  } while (cursor && !skuDbId);
}

if (!skuDbId) {
  const created = await api("POST", "/databases", {
    parent: { type: "page_id", page_id: hubId },
    is_inline: false,
    title: [{ type: "text", text: { content: "轻体验清单" } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "可售小产品 SKU（详情路线/餐食、桃心、参考价）→ content/light-skus.yaml。栏目介绍在「轻体验栏目」。改完跑 npm run content:notion。",
        },
      },
    ],
    properties: schema,
  });
  skuDbId = created.id;
  console.log("新建独立表「轻体验清单」", skuDbId);
} else {
  console.log("复用已有「轻体验清单」", skuDbId);
}

const skuMeta = await api("GET", `/databases/${skuDbId}`);
const skuSource = skuMeta.data_sources?.[0]?.id;
if (!skuSource) throw new Error("新表没有 data source");

const dsMeta = await api("GET", `/data_sources/${skuSource}`);
const existingProps = Object.keys(dsMeta.properties ?? {});
if (!existingProps.includes("id")) {
  const patch = { ...schema };
  delete patch.标题;
  if (existingProps.includes("Name")) patch.Name = { name: "标题" };
  else patch.标题 = { title: {} };
  await api("PATCH", `/data_sources/${skuSource}`, { properties: patch });
  console.log("已补上清单列");
}

const existingPages = [];
{
  let cursor;
  do {
    const body = await api("POST", `/data_sources/${skuSource}/query`, {
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    existingPages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
}
if (existingPages.length) {
  console.log(`清单已有 ${existingPages.length} 行，跳过重填`);
} else {
  let n = 0;
  for (const it of items) {
    if (!it?.id) continue;
    const blurbs = Array.isArray(it.blurb) ? it.blurb : [];
    const props = {
      标题: { title: [{ text: { content: `${it.id} · ${it.title?.zh ?? it.id}` } }] },
      id: rt(it.id),
      category: sl(it.category),
      kind: sl(it.kind === "meal" ? "meal" : "route"),
      status: sl(STATUS_ZH[it.status] ?? "在售"),
      sort: num(it.sort ?? null),
      title_zh: rt(it.title?.zh ?? ""),
      title_en: rt(it.title?.en ?? ""),
      blurb1_zh: rt(blurbs[0]?.zh ?? ""),
      blurb1_en: rt(blurbs[0]?.en ?? ""),
      blurb2_zh: rt(blurbs[1]?.zh ?? ""),
      blurb2_en: rt(blurbs[1]?.en ?? ""),
      images: rt((it.images ?? []).join("\n")),
      ...priceCols(it.price),
      price_note_zh: rt(it.priceNote?.zh ?? ""),
      price_note_en: rt(it.priceNote?.en ?? ""),
    };
    await api("POST", "/pages", {
      parent: { type: "data_source_id", data_source_id: skuSource },
      properties: props,
    });
    n++;
  }
  console.log(`已写入 ${n} 条 SKU`);
}

const compact = (id) => uuid(id).replace(/-/g, "");
let raw = fs.readFileSync(cfgPath, "utf8");
raw = raw.replace(/^(\s*lightSkus:\s*).+$/m, `$1${compact(skuDbId)}`);
if (/^\s*lightSkus:/m.test(raw) && raw.includes("dataSources:")) {
  raw = raw.replace(
    /(dataSources:\n(?:.*\n)*?\s*lightSkus:\s*).+$/m,
    `$1${compact(skuSource)}`,
  );
}
fs.writeFileSync(cfgPath, raw, "utf8");
console.log("notion.yaml lightSkus →", compact(skuDbId));
console.log("完成。侧栏应看到「轻体验栏目」和「轻体验清单」两张表。");
