#!/usr/bin/env node
/**
 * 按日一行收口：只保留「点选产品」；删改价/默认价/备注等。
 * 价格只在产品库维护（可新建产品）。
 *
 *   npm run content:notion:day-sheet-products-only
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
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

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
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || JSON.stringify(body)}`);
  return body;
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const sheetId = dash(cfg.databases.pricingDaySheet);
const meta = await notion(`/databases/${sheetId}`);
const names = Object.keys(meta.properties || {});

const KEEP = new Set([
  "标题",
  "早餐产品",
  "中餐产品",
  "晚餐产品",
  "酒店",
  "门票1产品",
  "门票2产品",
  "门票1现付",
  "门票2现付",
  "导游",
  "车型A",
  "车型B",
  "小费产品",
  "杂项产品",
  // 可选（有则保留；无则从标题解析 r1/D1）
  "线路",
  "日序",
  "日标题",
  "间数",
  "发布",
]);

const patch = {};
for (const n of names) {
  if (KEEP.has(n)) continue;
  // 标题列不能删
  if (meta.properties[n]?.type === "title") continue;
  patch[n] = null;
  console.log(`删除 ${n}`);
}

if (!Object.keys(patch).length) {
  console.log("已是产品点选模式，无需删列");
} else {
  await notion(`/databases/${sheetId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patch }),
  });
  console.log(`已删 ${Object.keys(patch).length} 列`);
}

console.log(`
保留列：${[...KEEP].join(" · ")}

用法：只点选产品；要改价 → 去产品库改，或新建一个产品再点选。
然后：npm run content:notion
`);
