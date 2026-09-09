#!/usr/bin/env node
/**
 * 按日一行整理：
 * 1) 「覆盖」→「改价」
 * 2) 旧手填数字迁入「改价」后删除；删其他1/2、其他明细
 * 3) 视图按「早中晚→酒店→票→导→车→杂项」展示
 *
 *   npm run content:notion:tidy-day-sheet
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
const VIEW_VERSION = "2026-03-11";
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

async function notion(pathname, init = {}, ver = VERSION) {
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": ver,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || JSON.stringify(body)}`);
  return body;
}

async function queryAll(databaseId) {
  const out = [];
  let cursor;
  do {
    const body = await notion(`/databases/${dash(databaseId)}/query`, {
      method: "POST",
      body: JSON.stringify({ start_cursor: cursor, page_size: 100 }),
    });
    out.push(...(body.results || []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return out;
}

function numProp(page, name) {
  const p = page.properties?.[name];
  if (!p || p.type !== "number") return null;
  return typeof p.number === "number" ? p.number : null;
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const sheetId = dash(cfg.databases.pricingDaySheet);
if (!sheetId) throw new Error("缺少 pricingDaySheet");

let meta = await notion(`/databases/${sheetId}`);
let names = new Set(Object.keys(meta.properties || {}));
console.log("现有列数", names.size);

/** 先确保改价列存在（从覆盖改名，或新建） */
const renameMap = [
  ["早餐覆盖", "早餐改价"],
  ["中餐覆盖", "中餐改价"],
  ["晚餐覆盖", "晚餐改价"],
  ["房费覆盖", "房费改价"],
  ["车费A覆盖", "车费A改价"],
  ["车费B覆盖", "车费B改价"],
  ["导费覆盖", "导费改价"],
  ["门票1覆盖", "门票1改价"],
  ["门票2覆盖", "门票2改价"],
  ["小费覆盖", "小费改价"],
];

const patch1 = {};
for (const [from, to] of renameMap) {
  if (names.has(from) && !names.has(to)) {
    patch1[from] = { name: to };
    console.log(`改名 ${from} → ${to}`);
  }
}
// 若既无覆盖也无改价，建改价列
for (const [, to] of renameMap) {
  const from = renameMap.find((x) => x[1] === to)?.[0];
  if (!names.has(to) && !(from && names.has(from))) {
    patch1[to] = { number: { format: "number" } };
    console.log(`新建 ${to}`);
  }
}
if (Object.keys(patch1).length) {
  await notion(`/databases/${sheetId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patch1 }),
  });
  meta = await notion(`/databases/${sheetId}`);
  names = new Set(Object.keys(meta.properties || {}));
}

/** 旧数字 → 改价（改价空时才迁） */
const migratePairs = [
  ["早餐", "早餐改价"],
  ["中餐", "中餐改价"],
  ["晚餐", "晚餐改价"],
  ["餐费", "中餐改价"],
  ["门票1金额", "门票1改价"],
  ["门票2金额", "门票2改价"],
  ["小费", "小费改价"],
  // 若仍叫覆盖（改名失败时）
  ["早餐覆盖", "早餐改价"],
  ["中餐覆盖", "中餐改价"],
  ["晚餐覆盖", "晚餐改价"],
  ["房费覆盖", "房费改价"],
  ["车费A覆盖", "车费A改价"],
  ["车费B覆盖", "车费B改价"],
  ["导费覆盖", "导费改价"],
  ["门票1覆盖", "门票1改价"],
  ["门票2覆盖", "门票2改价"],
  ["小费覆盖", "小费改价"],
];

console.log("迁移旧数字 → 改价…");
const pages = await queryAll(sheetId);
let migrated = 0;
for (const page of pages) {
  const patch = {};
  for (const [from, to] of migratePairs) {
    if (!names.has(from) || !names.has(to)) continue;
    if (from === to) continue;
    const v = numProp(page, from);
    const cur = numProp(page, to);
    if (v == null) continue;
    if (cur != null) continue;
    patch[to] = { number: v };
  }
  if (!Object.keys(patch).length) continue;
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patch }),
  });
  migrated++;
}
console.log(`  ${migrated} 行写入了改价`);

/** 删除旧列 */
const remove = [
  "早餐",
  "中餐",
  "晚餐",
  "餐费",
  "门票1金额",
  "门票2金额",
  "小费",
  "早餐覆盖",
  "中餐覆盖",
  "晚餐覆盖",
  "房费覆盖",
  "车费A覆盖",
  "车费B覆盖",
  "导费覆盖",
  "门票1覆盖",
  "门票2覆盖",
  "小费覆盖",
  "其他1名称",
  "其他1金额",
  "其他1分摊",
  "其他2名称",
  "其他2金额",
  "其他2分摊",
  "其他明细",
  "Date",
  "date",
];

const patch2 = {};
meta = await notion(`/databases/${sheetId}`);
names = new Set(Object.keys(meta.properties || {}));
for (const n of remove) {
  if (!names.has(n)) continue;
  const t = meta.properties[n]?.type;
  if (n === "小费" && t !== "number") continue;
  patch2[n] = null;
  console.log(`删除 ${n}`);
}
if (Object.keys(patch2).length) {
  await notion(`/databases/${sheetId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patch2 }),
  });
}

meta = await notion(`/databases/${sheetId}`);
const p2 = meta.properties || {};
const idOf = (name) => p2[name]?.id;

const ORDER = [
  "标题",
  "线路",
  "日序",
  "日标题",
  "早餐产品",
  "早餐改价",
  "中餐产品",
  "中餐改价",
  "晚餐产品",
  "晚餐改价",
  "酒店",
  "间数",
  "房费改价",
  "门票1产品",
  "门票1改价",
  "门票1现付",
  "门票1名称",
  "门票2产品",
  "门票2改价",
  "门票2现付",
  "门票2名称",
  "导游",
  "导费改价",
  "车型A",
  "车费A改价",
  "车型B",
  "车费B改价",
  "小费产品",
  "小费改价",
  "杂项产品",
  "备注",
  "发布",
];

const displayPropertyIds = ORDER.map(idOf).filter(Boolean);

try {
  const listed = await notion(`/views?database_id=${sheetId}`, { method: "GET" }, VIEW_VERSION);
  for (const ref of listed.results || []) {
    const v = await notion(`/views/${ref.id}`, { method: "GET" }, VIEW_VERSION);
    const body = {
      sorts: [{ property: "日序", direction: "ascending" }],
    };
    if (v.filter) body.filter = v.filter;
    // 尝试设置展示列序（若 API 支持）
    if (displayPropertyIds.length) {
      body.display_properties = displayPropertyIds;
    }
    try {
      await notion(`/views/${ref.id}`, { method: "PATCH", body: JSON.stringify(body) }, VIEW_VERSION);
      console.log(`视图已更新：${v.name || ref.id}`);
    } catch (e) {
      await notion(
        `/views/${ref.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            sorts: [{ property: "日序", direction: "ascending" }],
            ...(v.filter ? { filter: v.filter } : {}),
          }),
        },
        VIEW_VERSION,
      );
      console.log(`视图排序已更新（列序需手拖）：${v.name || ref.id} · ${e.message}`);
    }
  }
} catch (e) {
  console.log("视图 API：", e.message);
}

console.log(`
推荐列序（表格「属性」里可拖）：
  早餐产品 → 中餐产品 → 晚餐产品 → 酒店 → 门票 → 导游 → 车型 → 杂项
「改价」仅当天价与产品库不同时才填。

下一步：npm run content:notion
`);
