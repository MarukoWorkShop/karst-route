#!/usr/bin/env node
/**
 * 按《14天+11天+7天产品分列报价》线路三：产品入库 + 写入按日表
 *   node scripts/notion-fill-r3-quote.mjs && npm run content:notion
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
  if (!res.ok) throw new Error(`Notion ${res.status} ${pathname}: ${JSON.stringify(body)}`);
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
  if (p.type === "number") return p.number ?? "";
  return "";
}
function codeOf(page) {
  return textProp(page, "代号") || textProp(page, "code") || "";
}

async function queryAll(dbId) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`/databases/${dash(dbId)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    out.push(...(r.results || []).filter((p) => !p.archived));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function rt(s) {
  return { rich_text: [{ text: { content: String(s ?? "").slice(0, 2000) } }] };
}
function title(s) {
  return { title: [{ text: { content: String(s ?? "").slice(0, 2000) } }] };
}
function num(n) {
  return { number: n };
}
function activeStatus(props) {
  if (props["状态"]?.type !== "select") return {};
  const opt =
    props["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
    props["状态"].select?.options?.[0]?.name;
  return opt ? { 状态: { select: { name: opt } } } : {};
}
function cityProp(props, city) {
  if (!props["城市"]) return {};
  if (props["城市"].type === "select") {
    const opts = props["城市"].select?.options || [];
    const hit = opts.find((o) => o.name === city) || opts.find((o) => o.name.includes(city.slice(0, 2)));
    if (hit) return { 城市: { select: { name: hit.name } } };
    return { 城市: { select: { name: city } } }; // may fail; caller can catch
  }
  return { 城市: rt(city) };
}

async function upsertByCode(dbId, code, propsBuilder) {
  const pages = await queryAll(dbId);
  const hit = pages.find((p) => codeOf(p) === code || textProp(p, "标题") === code);
  const properties = propsBuilder();
  if (hit) {
    await notion(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("  update", code);
    return hit.id;
  }
  const created = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: dash(dbId) }, properties }),
  });
  console.log("  create", code);
  return created.id;
}

const hotelsId = cfg.databases.pricingHotels;
const vehiclesId = cfg.databases.pricingVehicles;
const ticketsId = cfg.databases.pricingTickets;
const miscId = cfg.databases.pricingMisc;
const mealsId = cfg.databases.pricingMeals;
const sheetId = cfg.databases.pricingDaySheet;

const hProps = (await notion(`/databases/${dash(hotelsId)}`)).properties || {};
const vProps = (await notion(`/databases/${dash(vehiclesId)}`)).properties || {};
const tProps = (await notion(`/databases/${dash(ticketsId)}`)).properties || {};
const mProps = (await notion(`/databases/${dash(miscId)}`)).properties || {};
const mealProps = (await notion(`/databases/${dash(mealsId)}`)).properties || {};

console.log("酒店…");
const hotels = [
  {
    id: "nanning-shangri-la",
    title: "南宁·香格里拉",
    en: "Shangri-La Nanning",
    city: "南宁",
    twin: 1400,
  },
  {
    id: "chongzuo-lux",
    title: "崇左·秘境丽世",
    en: "LUX* Chongzuo",
    city: "崇左",
    twin: 5300,
    note: "报价单按 5300/间；周五六另+300 未进默认价",
  },
  {
    id: "beihai-marriott",
    title: "北海·万豪尊贵海景",
    en: "Beihai Marriott Ocean View",
    city: "北海",
    twin: 1364,
    note: "报价单 1516×0.9≈1364",
  },
  {
    id: "weizhou-whale",
    title: "涠洲岛·巨鲸海景房",
    en: "Weizhou Whale Ocean View",
    city: "涠洲岛",
    twin: 4200,
  },
];

for (const h of hotels) {
  try {
    await upsertByCode(hotelsId, h.id, () => {
      const properties = {
        标题: title(h.title),
        ...activeStatus(hProps),
      };
      if (hProps["代号"]) properties["代号"] = rt(h.id);
      if (hProps["双人间含早价"]) properties["双人间含早价"] = num(h.twin);
      if (hProps["名称英文"]) properties["名称英文"] = rt(h.en);
      Object.assign(properties, cityProp(hProps, h.city));
      if (h.note && hProps["备注"]) properties["备注"] = rt(h.note);
      return properties;
    });
  } catch (e) {
    // 城市 select 无选项时退回不写城市
    console.warn("  retry without city", h.id, e.message.slice(0, 80));
    await upsertByCode(hotelsId, h.id, () => {
      const properties = { 标题: title(h.title), ...activeStatus(hProps) };
      if (hProps["代号"]) properties["代号"] = rt(h.id);
      if (hProps["双人间含早价"]) properties["双人间含早价"] = num(h.twin);
      if (hProps["名称英文"]) properties["名称英文"] = rt(h.en);
      if (hProps["城市"]?.type === "rich_text") properties["城市"] = rt(h.city);
      if (h.note && hProps["备注"]) properties["备注"] = rt(h.note);
      return properties;
    });
  }
}

console.log("车型…");
await upsertByCode(vehiclesId, "van-r3-800", () => {
  const properties = {
    标题: title("线路三用车·日包800"),
    ...activeStatus(vProps),
  };
  if (vProps["代号"]) properties["代号"] = rt("van-r3-800");
  if (vProps["最大载客"]) properties["最大载客"] = num(6);
  if (vProps["日包价"]) properties["日包价"] = num(800);
  if (vProps["适用段"]?.type === "select") properties["适用段"] = { select: { name: "国内" } };
  else if (vProps["适用段"]) properties["适用段"] = rt("国内");
  if (vProps["备注"]) properties["备注"] = rt("报价单线路三车费 800/团·日");
  return properties;
});

console.log("餐…");
const meals = [
  { id: "meal-landong", title: "蓝洞简餐", adult: 100, child: 100 },
  { id: "meal-boji", title: "簸箕宴午餐", adult: 150, child: 150 },
  { id: "meal-cliff-dinner", title: "巨鲸悬崖晚餐", adult: 350, child: 350 },
  { id: "meal-r3-d6", title: "涠洲午餐+晚餐包", adult: 400, child: 400, note: "珊瑚石院子午餐100+春夏静也晚餐300" },
];
for (const m of meals) {
  await upsertByCode(mealsId, m.id, () => {
    const properties = { 标题: title(m.title), ...activeStatus(mealProps) };
    if (mealProps["代号"]) properties["代号"] = rt(m.id);
    if (mealProps["成人价"]) properties["成人价"] = num(m.adult);
    if (mealProps["儿童价"]) properties["儿童价"] = num(m.child);
    if (m.note && mealProps["备注"]) properties["备注"] = rt(m.note);
    if (mealProps["名称英文"]) properties["名称英文"] = rt(m.title);
    return properties;
  });
}

console.log("门票…");
const tickets = [
  {
    id: "ticket-r3-island-funa",
    title: "小岛简餐含饮+伏那秘境",
    adult: 450,
    child: 450,
    note: "250+200",
  },
  {
    id: "ticket-r3-detian-landong",
    title: "德天竹筏+蓝洞",
    adult: 221,
    child: 221,
    note: "153+68",
  },
  { id: "ticket-weizhou-v", title: "涠洲岛V仓", adult: 578, child: 578 },
  {
    id: "ticket-r3-fishing",
    title: "斜阳岛海钓+景交",
    adult: 540,
    child: 540,
    note: "海钓1000/2+景交40（2人口径）",
  },
];
for (const t of tickets) {
  await upsertByCode(ticketsId, t.id, () => {
    const properties = { 标题: title(t.title), ...activeStatus(tProps) };
    if (tProps["代号"]) properties["代号"] = rt(t.id);
    if (tProps["成人价"]) properties["成人价"] = num(t.adult);
    if (tProps["儿童价"]) properties["儿童价"] = num(t.child);
    if (t.note && tProps["备注"]) properties["备注"] = rt(t.note);
    if (tProps["名称英文"]) properties["名称英文"] = rt(t.title);
    return properties;
  });
}

console.log("杂项…");
const miscItems = [
  {
    id: "misc-r3-heishui-boat",
    title: "黑水河包船+伏那讲解",
    adult: 0,
    child: 0,
    group: 720,
    split: "per_group_split",
    note: "600+120；整团价分摊",
  },
  {
    id: "misc-r3-mingshi-cart",
    title: "名仕观光车（线三）",
    adult: 0,
    child: 0,
    group: 300,
    split: "per_group_split",
  },
];
for (const item of miscItems) {
  await upsertByCode(miscId, item.id, () => {
    const properties = { 标题: title(item.title), ...activeStatus(mProps) };
    if (mProps["代号"]) properties["代号"] = rt(item.id);
    if (mProps["成人价"]) properties["成人价"] = num(item.adult);
    if (mProps["儿童价"]) properties["儿童价"] = num(item.child);
    // sync-notion 读「整团价」「分摊口径」
    if (mProps["整团价"]) properties["整团价"] = num(item.group);
    else if (mProps["团价"]) properties["团价"] = num(item.group);
    const splitCol = mProps["分摊口径"] ? "分摊口径" : mProps["分摊方式"] ? "分摊方式" : null;
    if (splitCol) {
      if (mProps[splitCol].type === "select") {
        const opts = mProps[splitCol].select?.options || [];
        const hit =
          opts.find((o) => o.name === item.split) ||
          opts.find((o) => /group|团/i.test(o.name));
        properties[splitCol] = { select: { name: hit?.name || item.split } };
      } else properties[splitCol] = rt(item.split);
    }
    if (item.note && mProps["备注"]) properties["备注"] = rt(item.note);
    if (mProps["名称英文"]) properties["名称英文"] = rt(item.title);
    return properties;
  });
}

// maps
const byCode = async (dbKey) => {
  const map = new Map();
  for (const p of await queryAll(cfg.databases[dbKey])) {
    const code = codeOf(p) || textProp(p, "标题");
    if (code) map.set(code, p.id);
    const t = textProp(p, "标题");
    if (t) map.set(t, p.id);
  }
  return map;
};

const hotelMap = await byCode("pricingHotels");
const vehicleMap = await byCode("pricingVehicles");
const mealMap = await byCode("pricingMeals");
const ticketMap = await byCode("pricingTickets");
const miscMap = await byCode("pricingMisc");

function one(code, map) {
  if (!code) return { relation: [] };
  const id = map.get(code);
  if (!id) throw new Error(`缺少产品 ${code}`);
  return { relation: [{ id }] };
}
function many(codes, map) {
  const ids = (codes || []).map((c) => map.get(c)).filter(Boolean);
  if ((codes || []).length && ids.length !== codes.length) {
    throw new Error(`杂项缺失: ${(codes || []).filter((c) => !map.get(c)).join(",")}`);
  }
  return { relation: ids.map((id) => ({ id })) };
}

const PLAN = {
  1: {
    title: "南宁·香格里拉",
    hotel: "nanning-shangri-la",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: null,
    dinner: null,
    ticket1: null,
    ticket2: null,
    tip: null,
    misc: ["misc-sundry-1000"],
  },
  2: {
    title: "黑水河·丽世",
    hotel: "chongzuo-lux",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: null,
    dinner: null,
    ticket1: "ticket-r3-island-funa",
    ticket2: null,
    tip: null,
    misc: ["misc-r3-heishui-boat"],
  },
  3: {
    title: "德天·丽世",
    hotel: "chongzuo-lux",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: null,
    dinner: "meal-landong",
    ticket1: "ticket-r3-detian-landong",
    ticket2: null,
    tip: null,
    misc: [],
  },
  4: {
    title: "名仕→北海万豪",
    hotel: "beihai-marriott",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: "meal-boji",
    dinner: null,
    ticket1: null,
    ticket2: null,
    tip: null,
    misc: ["misc-r3-mingshi-cart"],
  },
  5: {
    title: "上岛·巨鲸",
    hotel: "weizhou-whale",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: null,
    dinner: "meal-cliff-dinner",
    ticket1: "ticket-weizhou-v",
    ticket2: null,
    tip: null,
    misc: [],
  },
  6: {
    title: "涠洲全天·巨鲸",
    hotel: "weizhou-whale",
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: "meal-r3-d6",
    dinner: null,
    ticket1: "ticket-r3-fishing",
    ticket2: null,
    tip: null,
    misc: [],
  },
  7: {
    title: "下岛送站",
    hotel: null,
    vehicleA: "van-r3-800",
    vehicleB: null,
    guide: null,
    lunch: null,
    dinner: null,
    ticket1: null,
    ticket2: null,
    tip: null,
    misc: [],
  },
};

console.log("按日表写入 r3…");
const sheetMeta = await notion(`/databases/${dash(sheetId)}`);
const sheetProps = new Set(Object.keys(sheetMeta.properties || {}));
const sheet = await queryAll(sheetId);

function routeOf(page) {
  return (
    textProp(page, "线路") ||
    (textProp(page, "标题").match(/·(r[123])\s*·/) || textProp(page, "标题").match(/\b(r[123])\b/))?.[1] ||
    ""
  );
}
function dayOf(page) {
  const n = Number(textProp(page, "日序"));
  if (Number.isFinite(n) && n > 0) return n;
  return Number((textProp(page, "标题").match(/D(\d+)/i) || [])[1]) || 0;
}

let updated = 0;
for (const page of sheet) {
  if (routeOf(page) !== "r3") continue;
  const day = dayOf(page);
  const plan = PLAN[day];
  if (!plan) continue;

  const properties = {
    线路: { select: { name: "r3" } },
    日序: { number: day },
    日标题: { rich_text: [{ text: { content: plan.title } }] },
    酒店: one(plan.hotel, hotelMap),
    车型A: one(plan.vehicleA, vehicleMap),
    车型B: one(plan.vehicleB, vehicleMap),
    导游: { relation: [] },
    早餐产品: { relation: [] },
    中餐产品: one(plan.lunch, mealMap),
    晚餐产品: one(plan.dinner, mealMap),
    门票1产品: one(plan.ticket1, ticketMap),
    门票2产品: one(plan.ticket2, ticketMap),
    小费产品: { relation: [] },
    杂项产品: many(plan.misc, miscMap),
  };
  if (sheetProps.has("间数")) properties["间数"] = { number: plan.hotel ? 1 : 0 };

  await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
  updated++;
  console.log(`r3 D${day} ${plan.title}`);
}

console.log(`完成按日 ${updated} 行`);
console.log("请跑：npm run content:notion");
