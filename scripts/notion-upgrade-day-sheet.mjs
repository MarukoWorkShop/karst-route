#!/usr/bin/env node
/**
 * 改造「报价·按日一行」：
 * - 视图按日序升序（从第 1 天起）
 * - 餐费拆成 早餐 / 中餐 / 晚餐
 * - 新增「报价·当日其他」可无限加行，关联回当日
 *
 *   npm run content:notion:upgrade-day-sheet
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

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const sheetRaw = cfg.databases?.pricingDaySheet;
if (!sheetRaw) {
  console.error("content/notion.yaml 缺少 pricingDaySheet");
  process.exit(1);
}

const dash = (raw) => {
  const h = String(raw).replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const uuid = (id) => String(id).replace(/-/g, "");

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
  const pages = [];
  let cursor;
  do {
    const body = await notion(`/databases/${dash(databaseId)}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    pages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return pages;
}

const sheetId = dash(sheetRaw);
const sheetMeta = await notion(`/databases/${sheetId}`);
const parentPageId = sheetMeta.parent?.page_id;
if (!parentPageId) throw new Error("找不到按日一行表的父页面");

let extrasId = cfg.databases?.pricingDayExtras
  ? dash(cfg.databases.pricingDayExtras)
  : "";

if (!extrasId) {
  console.log("建表：报价·当日其他…");
  const extrasDb = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "报价·当日其他" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "挂在「按日一行」的其他费用，可无限新增。在当日行里打开「其他明细」添加。",
          },
        },
      ],
      properties: {
        标题: { title: {} },
        所属日: { relation: { database_id: sheetId, single_property: {} } },
        金额: { number: { format: "number" } },
        分摊口径: {
          select: {
            options: ["per_person", "per_group_split", "per_vehicle_split", "per_room_split"].map(
              (o) => ({ name: o, color: "default" }),
            ),
          },
        },
        现付: { checkbox: {} },
        备注: { rich_text: {} },
        状态: {
          select: {
            options: ["已发布", "草稿", "已下线"].map((o) => ({ name: o, color: "default" })),
          },
        },
      },
    }),
  });
  extrasId = extrasDb.id;
  console.log("  ", extrasDb.url);
} else {
  console.log("已有 pricingDayExtras，跳过建表");
}

console.log("补列：早餐/中餐/晚餐、其他明细…");
await notion(`/databases/${sheetId}`, {
  method: "PATCH",
  body: JSON.stringify({
    properties: {
      早餐: { number: { format: "number" } },
      中餐: { number: { format: "number" } },
      晚餐: { number: { format: "number" } },
      其他明细: { relation: { database_id: extrasId, single_property: {} } },
    },
  }),
});

// 迁移 餐费 → 中餐；其他1/2 → 当日其他行
const pages = await queryAll(sheetId);
const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "").slice(0, 2000) } }] });
const nb = (v) => ({ number: v == null || v === "" || Number.isNaN(Number(v)) ? null : Number(v) });
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });
const ttl = (v) => ({ title: [{ text: { content: String(v ?? "").slice(0, 200) || "-" } }] });

function propNum(page, name) {
  const p = page.properties?.[name];
  return p?.type === "number" ? p.number : null;
}
function propText(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name ?? "";
  return "";
}

let migratedMeal = 0;
let migratedOther = 0;
for (const page of pages) {
  const patch = {};
  const meal = propNum(page, "餐费");
  const lunch = propNum(page, "中餐");
  if (meal != null && lunch == null) {
    patch["中餐"] = nb(meal);
    migratedMeal++;
  }

  const extrasToCreate = [];
  for (const slot of [
    { nameKey: "其他1名称", amountKey: "其他1金额", splitKey: "其他1分摊" },
    { nameKey: "其他2名称", amountKey: "其他2金额", splitKey: "其他2分摊" },
  ]) {
    const amount = propNum(page, slot.amountKey);
    if (amount == null) continue;
    const name = propText(page, slot.nameKey) || "其他";
    const split = propText(page, slot.splitKey) || "per_person";
    extrasToCreate.push({ name, amount, split });
  }

  if (Object.keys(patch).length) {
    await notion(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: patch }),
    });
  }

  const existingExtras = page.properties?.["其他明细"]?.relation || [];
    if (extrasToCreate.length && existingExtras.length === 0) {
    const relIds = [];
    for (const ex of extrasToCreate) {
      const created = await notion("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: extrasId },
          properties: {
            标题: ttl(ex.name),
            所属日: { relation: [{ id: page.id }] },
            金额: nb(ex.amount),
            分摊口径: sl(ex.split),
            现付: { checkbox: false },
            状态: sl("已发布"),
          },
        }),
      });
      relIds.push({ id: created.id });
      migratedOther++;
    }
    await notion(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          其他明细: { relation: relIds },
          // 已迁到明细，清空快捷槽避免双计
          其他1名称: rt(""),
          其他1金额: nb(null),
          其他2名称: rt(""),
          其他2金额: nb(null),
        },
      }),
    });
  }
}
console.log(`  餐费→中餐 ${migratedMeal} 行；其他快捷→明细 ${migratedOther} 条`);

// 视图：日序升序
const sheet2026 = await notion(`/databases/${sheetId}`, { method: "GET" }, VIEW_VERSION);
const dataSourceId = sheet2026.data_sources?.[0]?.id;
if (dataSourceId) {
  const listed = await notion(`/views?database_id=${sheetId}`, { method: "GET" }, VIEW_VERSION);
  for (const ref of listed.results || []) {
    const v = await notion(`/views/${ref.id}`, { method: "GET" }, VIEW_VERSION);
    const filter = v.filter || null;
    await notion(
      `/views/${ref.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sorts: [{ property: "日序", direction: "ascending" }],
          ...(filter ? { filter } : {}),
        }),
      },
      VIEW_VERSION,
    );
    console.log(`  视图排序↑ ${v.name || ref.id}`);
  }
}

const extrasHex = uuid(extrasId);
console.log(`
完成。请确认 content/notion.yaml 含：
  pricingDayExtras: "${extrasHex}"

推荐列顺序（可在 Notion 表头拖拽）：
  日序 → 日标题 → 酒店 → 间数 → 房费覆盖 → 车型A/B → 车费覆盖 → 导游 → 导费覆盖
  → 早餐 → 中餐 → 晚餐 → 门票1/2 → 其他明细 → 小费 → 备注

新增其他：打开当日行 →「其他明细」→ 新建页面（可无限加）。

然后：npm run content:notion
`);
