#!/usr/bin/env node
/**
 * 按日一行：点选产品后 Lookup 带出默认价（只读）。
 * 「改价」仍手填；空 = 用默认价。Notion 无法按蓝/橙自动染色单元格。
 *
 *   npm run content:notion:day-sheet-lookups
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
const props = meta.properties || {};

const relId = (name) => {
  const p = props[name];
  if (!p || p.type !== "relation") throw new Error(`缺少关联列：${name}`);
  return p.id;
};

/** relation 列名 → 目标库上的价字段名 → 新建 Lookup 列名 */
const LOOKUPS = [
  { rel: "早餐产品", target: "成人价", name: "早餐默认价" },
  { rel: "中餐产品", target: "成人价", name: "中餐默认价" },
  { rel: "晚餐产品", target: "成人价", name: "晚餐默认价" },
  { rel: "酒店", target: "双人间含早价", name: "房费默认价" },
  { rel: "车型A", target: "日包价", name: "车费A默认价" },
  { rel: "车型B", target: "日包价", name: "车费B默认价" },
  { rel: "导游", target: "日费用", name: "导费默认价" },
  { rel: "门票1产品", target: "成人价", name: "门票1默认价" },
  { rel: "门票2产品", target: "成人价", name: "门票2默认价" },
  { rel: "小费产品", target: "成人价", name: "小费默认价" },
];

const patch = {};
for (const row of LOOKUPS) {
  if (!props[row.rel]) {
    console.log(`跳过（无 ${row.rel}）`);
    continue;
  }
  if (props[row.name]) {
    console.log(`已有 ${row.name}`);
    continue;
  }
  // Notion API：用 rollup 拉关联产品上的价（单选关联时 sum/show_unique 均可）
  patch[row.name] = {
    rollup: {
      relation_property_name: row.rel,
      rollup_property_name: row.target,
      function: "sum",
    },
  };
  console.log(`+ ${row.name} ← ${row.rel}.${row.target}`);
}

if (!Object.keys(patch).length) {
  console.log("无需新建");
  process.exit(0);
}

await notion(`/databases/${sheetId}`, {
  method: "PATCH",
  body: JSON.stringify({ properties: patch }),
});
console.log("已写入默认价列（rollup）");

console.log(`
用法：
  点选「中餐产品」→「中餐默认价」自动显示产品库价（只读）
  「中餐改价」平时留空；只有当天要改才填
  同步：有改价用改价，否则用产品库价

Notion 不能给数字格自动染成深蓝/橙红；
  · 默认价 = 只读 rollup（系统价）
  · 改价 = 手填且与默认不同时才写
即同一套逻辑。
`);
