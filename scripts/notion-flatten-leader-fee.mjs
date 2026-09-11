#!/usr/bin/env node
/** 线路参数：领队费仅保留单列「领队成本(元/团)」，删除分档列并清空数值 */
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

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const pricingId = cfg.databases?.pricing;
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

const DROP = [
  "领队成本1-2人",
  "领队成本1-4人",
  "领队成本5-10人",
  "领队成本10人以上",
  // 实际 Notion 列名（带括注）
  "领队成本1-2人（独立小团）",
  "领队成本2-4人（精品小团）",
  "领队成本5-10人（中等团）",
  "领队成本10人以上（大团）",
];
const KEEP = "领队成本(元/团)";

const meta = await notion(`/databases/${dash(pricingId)}`);
const existing = meta.properties || {};
const toPatch = {};
for (const name of DROP) {
  if (existing[name]) toPatch[name] = null;
}
if (!existing[KEEP]) toPatch[KEEP] = { number: {} };

if (Object.keys(toPatch).length) {
  await notion(`/databases/${dash(pricingId)}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: toPatch }),
  });
  console.log("schema:", Object.keys(toPatch).map((k) => (toPatch[k] === null ? `drop ${k}` : `add ${k}`)).join(", "));
} else {
  console.log("schema already flat");
}

const pages = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;
  const r = await notion(`/databases/${dash(pricingId)}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  pages.push(...(r.results || []).filter((p) => !p.archived));
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

for (const page of pages) {
  const route =
    textProp(page, "线路") ||
    textProp(page, "id") ||
    (textProp(page, "标题").match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
    "";
  if (!/^r[123]$/.test(route)) continue;
  const properties = {};
  // 默认空：Notion number null
  if (existing[KEEP] || toPatch[KEEP]) properties[KEEP] = { number: null };
  await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
  console.log("cleared leader", route);
}

console.log("完成。请 npm run content:notion");
