#!/usr/bin/env node
/**
 * 去掉「当日其他」表：杂项一律点选产品库。
 * - 按日一行增加「杂项产品」多选关联
 * - 把旧「当日其他」里已关联的杂项迁回当日
 * - 删除当日其他表
 *
 *   npm run content:notion:drop-day-extras
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

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
const uuid = (id) => String(id).replace(/-/g, "");

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

function prop(page, name) {
  const p = page.properties?.[name];
  if (!p) return null;
  if (p.type === "relation") return (p.relation || []).map((r) => r.id);
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  if (p.type === "number") return p.number;
  if (p.type === "select") return p.select?.name || "";
  if (p.type === "checkbox") return p.checkbox;
  return null;
}

const cfgPath = path.join(root, "content", "notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const dbs = cfg.databases || {};

if (!dbs.pricingDaySheet || !dbs.pricingMisc) {
  console.error("缺少 pricingDaySheet / pricingMisc");
  process.exit(1);
}

const sheetId = dash(dbs.pricingDaySheet);
const miscId = dash(dbs.pricingMisc);

console.log("按日一行补列：杂项产品（多选）…");
try {
  await notion(`/databases/${sheetId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        杂项产品: {
          relation: { database_id: miscId, single_property: {} },
        },
      },
    }),
  });
} catch (e) {
  console.log("  （列可能已有）", e.message);
}

if (dbs.pricingDayExtras) {
  const extrasId = dash(dbs.pricingDayExtras);
  console.log("迁移当日其他 → 按日「杂项产品」…");
  const extras = await queryAll(extrasId);
  const byDay = new Map(); // dayPageId -> Set(miscPageId)
  const orphanNotes = [];

  for (const ep of extras) {
    const parents = prop(ep, "所属日") || [];
    const miscRels = prop(ep, "杂项产品") || [];
    const title = prop(ep, "标题") || "其他";
    const amount = prop(ep, "金额");
    if (!parents.length) continue;
    for (const pid of parents) {
      if (!byDay.has(pid)) byDay.set(pid, new Set());
      for (const mid of miscRels) byDay.get(pid).add(mid);
      if (!miscRels.length && (amount != null || title)) {
        orphanNotes.push({ day: pid, title, amount });
      }
    }
  }

  for (const [dayId, miscSet] of byDay) {
    if (!miscSet.size) continue;
    const page = await notion(`/pages/${dayId}`);
    const existing = new Set(prop(page, "杂项产品") || []);
    const tip = prop(page, "小费产品") || [];
    for (const t of tip) existing.add(t);
    for (const mid of miscSet) existing.add(mid);
    await notion(`/pages/${dayId}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          杂项产品: {
            relation: [...existing].map((id) => ({ id })),
          },
        },
      }),
    });
  }
  console.log(`  已回写 ${byDay.size} 个行程日的杂项关联`);
  if (orphanNotes.length) {
    console.log(`  注意：${orphanNotes.length} 条仅有手填金额、未关联产品（请改到产品库后在按日点选）`);
    for (const o of orphanNotes.slice(0, 8)) {
      console.log(`    · ${o.title} ¥${o.amount ?? "-"}`);
    }
  }

  console.log("删除「当日其他」表…");
  try {
    await notion(`/databases/${extrasId}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
    console.log("  → 已进回收站");
  } catch (e) {
    console.log("  ", e.message);
  }
  delete dbs.pricingDayExtras;
}

const header = `# Notion 数据库 ID（不是密钥）
# 报价树：报价 → 产品库 / 线路逐日明细 / 人数验算（pricingSections）
# 打开整页表格 → 分享 → 复制链接里 32 位 ID

`;

const out = { databases: { ...dbs }, ...(cfg.pricingSections ? { pricingSections: cfg.pricingSections } : {}) };
fs.writeFileSync(cfgPath, header + stringifyYaml(out, { lineWidth: 0 }));
console.log("已更新 content/notion.yaml（移除 pricingDayExtras）");
console.log("下一步：npm run content:notion");
