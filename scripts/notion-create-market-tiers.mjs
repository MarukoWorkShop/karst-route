#!/usr/bin/env node
/**
 * 在「人数验算」分区下建「市场报价档」表（2–3 / 4–6 / 7–10），并灌入 Word 网络卖价。
 * 真源：本表 → npm run content:notion → pricing.yaml marketTiers → 官网卡片/测算。
 *
 *   node scripts/notion-create-market-tiers.mjs && npm run content:notion
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("需要 NOTION_TOKEN");
  process.exit(1);
}

const cfgPath = path.join(root, "content/notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const dash = (id) => {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${urlPath}: ${JSON.stringify(body)}`);
  return body;
}

const SEED = [
  { route: "r1", band: "2–3人", minN: 2, maxN: 3, adult: 32500, child: 27000 },
  { route: "r1", band: "4–6人", minN: 4, maxN: 6, adult: 29500, child: 24000 },
  { route: "r1", band: "7–10人", minN: 7, maxN: 10, adult: 26500, child: 21000 },
  { route: "r2", band: "2–3人", minN: 2, maxN: 3, adult: 23200, child: 18300 },
  { route: "r2", band: "4–6人", minN: 4, maxN: 6, adult: 21200, child: 16400 },
  { route: "r2", band: "7–10人", minN: 7, maxN: 10, adult: 19200, child: 14400 },
  { route: "r3", band: "2–3人", minN: 2, maxN: 3, adult: 25688, child: 13808 },
  { route: "r3", band: "4–6人", minN: 4, maxN: 6, adult: 23688, child: 11808 },
  { route: "r3", band: "7–10人", minN: 7, maxN: 10, adult: 21688, child: 9808 },
];

const badge = { r1: "路线一", r2: "路线二", r3: "路线三" };

const parentPageId = cfg.pricingSections?.validate;
if (!parentPageId) {
  console.error("notion.yaml 缺少 pricingSections.validate");
  process.exit(1);
}

try {
  const p = await notion(`/pages/${dash(parentPageId)}`);
  if (p.archived) {
    await notion(`/pages/${dash(parentPageId)}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: false }),
    });
  }
} catch (e) {
  console.warn("validate section:", e.message);
}

let dbId = cfg.databases?.pricingMarketTiers;
if (dbId) {
  try {
    await notion(`/databases/${dash(dbId)}`);
    console.log("已有 pricingMarketTiers", dbId);
  } catch {
    dbId = null;
  }
}

if (!dbId) {
  console.log("建表：市场报价档…");
  const db = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: dash(parentPageId) },
      title: [{ type: "text", text: { content: "人数验算 · 市场报价档" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "Word 网络卖价三档（2–3 / 4–6 / 7–10）。改价后跑 npm run content:notion → 官网路线卡片与测算。",
          },
        },
      ],
      properties: {
        标题: { title: {} },
        线路: {
          select: {
            options: [
              { name: "r1", color: "blue" },
              { name: "r2", color: "green" },
              { name: "r3", color: "orange" },
            ],
          },
        },
        人数档: {
          select: {
            options: [
              { name: "2–3人", color: "pink" },
              { name: "4–6人", color: "purple" },
              { name: "7–10人", color: "brown" },
            ],
          },
        },
        人数下限: { number: { format: "number" } },
        人数上限: { number: { format: "number" } },
        成人市场报价: { number: { format: "number" } },
        儿童市场报价: { number: { format: "number" } },
        备注: { rich_text: {} },
        状态: {
          select: {
            options: [
              { name: "已发布", color: "green" },
              { name: "草稿", color: "gray" },
            ],
          },
        },
      },
    }),
  });
  dbId = db.id.replace(/-/g, "");
  console.log("  created", dbId);

  try {
    await notion(`/blocks/${dash(parentPageId)}/children`, {
      method: "PATCH",
      body: JSON.stringify({
        children: [
          {
            type: "heading_3",
            heading_3: {
              rich_text: [{ type: "text", text: { content: "市场报价档" } }],
            },
          },
          {
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "2–3 / 4–6 / 7–10 三档网络卖价；官网路线卡片取 10 人→2 人区间。",
                  },
                },
              ],
            },
          },
          {
            type: "link_to_page",
            link_to_page: { type: "database_id", database_id: dash(dbId) },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn("  link_to_page 失败", e.message);
  }

  let text = fs.readFileSync(cfgPath, "utf8");
  if (/pricingMarketTiers:/.test(text)) {
    text = text.replace(/pricingMarketTiers:\s*\S+/, `pricingMarketTiers: ${dbId}`);
  } else {
    text = text.replace(
      /(pricingRoomDiff:\s*\S+|pricingValidate:\s*\S+)/,
      (m) => `${m}\n  pricingMarketTiers: ${dbId}`,
    );
  }
  fs.writeFileSync(cfgPath, text);
  console.log("  wrote notion.yaml");
}

async function queryAll(id) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`/databases/${dash(id)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    out.push(...(r.results || []).filter((p) => !p.archived));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function plain(rich) {
  return (rich || []).map((t) => t.plain_text || "").join("").trim();
}
function textProp(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return plain(p.title);
  if (p.type === "rich_text") return plain(p.rich_text);
  if (p.type === "select") return p.select?.name || "";
  return "";
}

const existing = await queryAll(dbId);
const keyOf = (route, band) => `${route}|${band}`;
const byKey = new Map(
  existing.map((p) => [keyOf(textProp(p, "线路"), textProp(p, "人数档")), p]),
);

for (const row of SEED) {
  const title = `${badge[row.route]}·${row.route} · ${row.band}`;
  const properties = {
    标题: { title: [{ text: { content: title } }] },
    线路: { select: { name: row.route } },
    人数档: { select: { name: row.band } },
    人数下限: { number: row.minN },
    人数上限: { number: row.maxN },
    成人市场报价: { number: row.adult },
    儿童市场报价: { number: row.child },
    备注: {
      rich_text: [{ text: { content: "Word 网络卖价；改价后 content:notion" } }],
    },
    状态: { select: { name: "已发布" } },
  };
  const hit = byKey.get(keyOf(row.route, row.band));
  if (hit) {
    await notion(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("  update", title, row.adult, row.child);
  } else {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: dash(dbId) }, properties }),
    });
    console.log("  create", title, row.adult, row.child);
  }
}

console.log("done — 跑 npm run content:notion 拉回 YAML");
