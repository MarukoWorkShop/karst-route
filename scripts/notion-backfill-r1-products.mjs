#!/usr/bin/env node
/**
 * 为 r1 按日一行补挂默认餐/票/小费/杂项产品，并恢复 线路/日序/日标题。
 *   node scripts/notion-backfill-r1-products.mjs
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

async function queryAll(id) {
  const out = [];
  let cursor;
  do {
    const body = await notion(`/databases/${dash(id)}/query`, {
      method: "POST",
      body: JSON.stringify({ start_cursor: cursor, page_size: 100 }),
    });
    out.push(...(body.results || []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return out;
}

function text(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name || "";
  if (p.type === "number") return p.number ?? "";
  return "";
}

function rel(page, name) {
  const p = page.properties?.[name];
  return p?.type === "relation" ? (p.relation || []).map((r) => r.id) : [];
}

function parseTitle(title) {
  const route = (title.match(/·(r[123])\s*·/) || title.match(/\b(r[123])\b/))?.[1] || "";
  const day = Number((title.match(/D(\d+)/i) || [])[1]) || 0;
  const place = title.split("·").pop()?.trim() || title;
  return { route, day, place };
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const sheetId = cfg.databases.pricingDaySheet;

const sheetMeta = await notion(`/databases/${dash(sheetId)}`);
const propNames = Object.keys(sheetMeta.properties || {});
const needProps = {};
if (!propNames.includes("线路")) {
  needProps["线路"] = { select: { options: [{ name: "r1" }, { name: "r2" }, { name: "r3" }] } };
}
if (!propNames.includes("日序")) needProps["日序"] = { number: { format: "number" } };
if (!propNames.includes("日标题")) needProps["日标题"] = { rich_text: {} };
if (Object.keys(needProps).length) {
  await notion(`/databases/${dash(sheetId)}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: needProps }),
  });
  console.log("恢复列", Object.keys(needProps).join(", "));
}

const byCode = async (dbKey) => {
  const map = new Map();
  for (const p of await queryAll(cfg.databases[dbKey])) {
    const code = text(p, "代号") || text(p, "标题");
    map.set(code, p.id);
    map.set(text(p, "标题"), p.id);
  }
  return map;
};

const meals = await byCode("pricingMeals");
const misc = await byCode("pricingMisc");
const tickets = await byCode("pricingTickets");
const mealBreakfast = meals.get("meal-breakfast") || meals.get("通用早餐");
const mealLunch = meals.get("meal-lunch") || meals.get("特色中餐");
const mealDinner = meals.get("meal-dinner-hotpot") || meals.get("海鲜小火锅晚餐");
const mealDinner2 = meals.get("meal-dinner-emperor") || meals.get("皇帝餐晚餐");
const mealLotus = meals.get("meal-lunch-lotus") || meals.get("莲花中餐");
const tip = misc.get("misc-tip-daily") || misc.get("司机导游住宿小费");
const pickup = misc.get("misc-airport-pickup") || misc.get("南宁接机");
const pack =
  misc.get("misc-halong-pack") ||
  [...misc.keys()].map((k) => [k, misc.get(k)]).find(([k]) => /游轮|吉婆/.test(k))?.[1];
const detian = tickets.get("ticket-detian") || tickets.get("德天瀑布门票");
const mingshi = tickets.get("ticket-mingshi") || tickets.get("明仕观光");
const jianshui = tickets.get("ticket-jianshui-puzhehei");
const mile = tickets.get("ticket-mile-pack");

const sheet = await queryAll(sheetId);
let updated = 0;
for (const page of sheet) {
  const title = text(page, "标题");
  const { route, day, place } = parseTitle(title);
  if (route !== "r1" || day <= 0) continue;

  const patch = {
    线路: { select: { name: "r1" } },
    日序: { number: day },
    日标题: { rich_text: [{ text: { content: place.slice(0, 200) } }] },
  };

  if (tip && !rel(page, "小费产品").length && day >= 3 && day <= 12) {
    patch["小费产品"] = { relation: [{ id: tip }] };
  }
  if (mealBreakfast && !rel(page, "早餐产品").length && day >= 2 && day <= 13) {
    patch["早餐产品"] = { relation: [{ id: mealBreakfast }] };
  }
  if (!rel(page, "中餐产品").length) {
    if (day === 1 && mealLotus) patch["中餐产品"] = { relation: [{ id: mealLotus }] };
    else if (day >= 2 && day <= 13 && mealLunch) patch["中餐产品"] = { relation: [{ id: mealLunch }] };
  }
  if (!rel(page, "晚餐产品").length && day >= 1 && day <= 13) {
    const d = day === 5 || day === 8 ? mealDinner2 || mealDinner : mealDinner || mealDinner2;
    if (d) patch["晚餐产品"] = { relation: [{ id: d }] };
  }

  const miscIds = new Set(rel(page, "杂项产品"));
  let miscChanged = false;
  if (day === 1 && pickup) {
    miscIds.add(pickup);
    miscChanged = true;
  }
  if (/下龙|吉婆|游轮/.test(place) && pack) {
    miscIds.add(pack);
    miscChanged = true;
  }
  if (miscChanged) patch["杂项产品"] = { relation: [...miscIds].map((id) => ({ id })) };

  if (day === 2) {
    if (detian && !rel(page, "门票1产品").length) patch["门票1产品"] = { relation: [{ id: detian }] };
    if (mingshi && !rel(page, "门票2产品").length) patch["门票2产品"] = { relation: [{ id: mingshi }] };
  }
  if (/建水|普者黑/.test(place) && jianshui && !rel(page, "门票1产品").length) {
    patch["门票1产品"] = { relation: [{ id: jianshui }] };
  }
  if (/弥勒|东风/.test(place) && mile && !rel(page, "门票1产品").length) {
    patch["门票1产品"] = { relation: [{ id: mile }] };
  }

  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: patch }),
  });
  updated++;
  console.log(`D${day} ${place}`);
}
console.log(`完成：已更新 ${updated} 行。请跑 npm run content:notion`);
