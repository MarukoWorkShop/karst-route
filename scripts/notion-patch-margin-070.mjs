#!/usr/bin/env node
/**
 * 线路参数加成率：成本上加 30%（margin = 0.30）
 *   卖价 = 成本 × (1 + 0.30)
 *   node scripts/notion-patch-margin-070.mjs && npm run content:notion
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
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

const MARGIN = 0.3;
const COL_CANDIDATES = ["加成率(如0.2=加20%)", "margin"];

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const dash = (raw) => {
  const h = String(raw).replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

async function notion(pathname, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || JSON.stringify(body)}`);
  return body;
}

function text(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name || "";
  return "";
}

const pricingId = cfg.databases.pricing;
const meta = await notion(`/databases/${dash(pricingId)}`);
const props = meta.properties || {};
const marginKey = COL_CANDIDATES.find((k) => props[k]);
if (!marginKey) {
  console.error("找不到加成率列");
  process.exit(1);
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
    text(page, "线路") ||
    text(page, "id") ||
    (text(page, "标题").match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
    "";
  if (!/^r[123]$/.test(route)) continue;
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: { [marginKey]: { number: MARGIN } } }),
  });
  console.log(route, marginKey, MARGIN);
}

console.log("完成。请 npm run content:notion（会回写验算）");
