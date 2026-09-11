#!/usr/bin/env node
/**
 * 按《14天+11天产品分列报价》确认对照表，覆盖写入 r1/r2 按日产品点选。
 *   node scripts/notion-fill-quote-day-map.mjs
 *
 * 已确认：
 * 1. 国内日不挂 guide-cn-driver（司导含车）
 * 2. 线二 D9/D10 车用 van7-border（文档 1200）
 * 3. 大包 969：r1→D4，r2→D3
 * 4. 天琴+骑行挂 ticket-tianqin-bike（价 0）
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
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
    out.push(...(body.results || []).filter((p) => !p.archived));
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

function parseTitle(title) {
  const route = (title.match(/·(r[123])\s*·/) || title.match(/\b(r[123])\b/))?.[1] || "";
  const day = Number((title.match(/D(\d+)/i) || [])[1]) || 0;
  return { route, day };
}

function routeOf(page) {
  return text(page, "线路") || parseTitle(text(page, "标题")).route;
}

function dayOf(page) {
  const n = Number(text(page, "日序"));
  if (Number.isFinite(n) && n > 0) return n;
  return parseTitle(text(page, "标题")).day;
}

function rel(codes, map) {
  const ids = (codes || []).map((c) => map.get(c)).filter(Boolean);
  return { relation: ids.map((id) => ({ id })) };
}

function one(code, map) {
  if (!code) return { relation: [] };
  const id = map.get(code);
  if (!id) throw new Error(`找不到产品 ${code}`);
  return { relation: [{ id }] };
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const sheetId = cfg.databases.pricingDaySheet;
const sheetMeta = await notion(`/databases/${dash(sheetId)}`);
const sheetProps = new Set(Object.keys(sheetMeta.properties || {}));

const byCode = async (dbKey) => {
  const map = new Map();
  for (const p of await queryAll(cfg.databases[dbKey])) {
    const code = text(p, "代号") || text(p, "标题");
    if (code) map.set(code, p.id);
    const title = text(p, "标题");
    if (title) map.set(title, p.id);
  }
  return map;
};

const hotels = await byCode("pricingHotels");
const vehicles = await byCode("pricingVehicles");
const guides = await byCode("pricingGuides");
const meals = await byCode("pricingMeals");
const tickets = await byCode("pricingTickets");
const misc = await byCode("pricingMisc");

/** @type {Record<string, Record<number, object>>} */
const PLAN = {
  r1: {
    1: {
      title: "南宁",
      hotel: "nanning-nalian",
      vehicleA: null,
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: null,
      misc: ["misc-airport-pickup", "misc-sundry-1000", "misc-ops-overseas-1000"],
    },
    2: {
      title: "德天/明仕·崇左",
      hotel: "chongzuo-nali",
      vehicleA: "van7-gx",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: "ticket-detian",
      ticket2: "ticket-mingshi",
      tip: null,
      misc: [],
    },
    3: {
      title: "崇左→下龙",
      hotel: "halong-wason",
      vehicleA: "van7-border",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: "meal-dinner",
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    4: {
      title: "下龙湾游轮",
      hotel: "halong-wason",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: "meal-dinner-hotpot",
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: ["misc-halong-pack"],
    },
    5: {
      title: "下龙→吉婆",
      hotel: "catba-tbd",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    6: {
      title: "吉婆→河内",
      hotel: "hanoi-splendid",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: "meal-dinner-emperor",
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    7: {
      title: "河内市区",
      hotel: "hanoi-splendid",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: "meal-lunch-lotus",
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    8: {
      title: "河内→沙坝",
      hotel: "sapa-coupole",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    9: {
      title: "沙坝全天",
      hotel: "sapa-coupole",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    10: {
      title: "沙坝→建水",
      hotel: "jianshui-linan",
      vehicleA: "van7-vn",
      vehicleB: "van7-cn",
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    11: {
      title: "建水→普者黑",
      hotel: "puzhehei-xiyuan",
      vehicleA: "van7-cn",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: "ticket-jianshui-puzhehei",
      ticket2: null,
      tip: null,
      misc: [],
    },
    12: {
      title: "普者黑→弥勒",
      hotel: "mile-juren",
      vehicleA: "van7-cn",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: "ticket-mile-pack",
      ticket2: null,
      tip: null,
      misc: [],
    },
    13: {
      title: "弥勒→昆明",
      hotel: "kunming-kaichen",
      vehicleA: "van7-cn",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: null,
      misc: [],
    },
    14: {
      title: "昆明送机",
      hotel: null,
      vehicleA: "van7-cn",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: null,
      misc: [],
    },
  },
  r2: {
    1: {
      title: "南宁",
      hotel: "nanning-nalian",
      vehicleA: null,
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: null,
      misc: ["misc-airport-pickup", "misc-sundry-1000", "misc-ops-overseas-1000"],
    },
    2: {
      title: "南宁→下龙",
      hotel: "halong-wason",
      vehicleA: "van7-border",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: "meal-dinner",
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: ["misc-nanning-station", "misc-nanning-dongxing-train"],
    },
    3: {
      title: "下龙→吉婆",
      hotel: "catba-tbd",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: "meal-dinner-hotpot",
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: ["misc-halong-pack"],
    },
    4: {
      title: "吉婆→河内",
      hotel: "hanoi-splendid",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: "meal-lunch-lotus",
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    5: {
      title: "河内·米轨过夜",
      hotel: null,
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: "meal-lunch-lotus",
      dinner: null,
      ticket1: "ticket-train-sleeper",
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    6: {
      title: "老街→沙坝",
      hotel: "sapa-coupole",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    7: {
      title: "沙坝全天",
      hotel: "sapa-coupole",
      vehicleA: "van7-vn",
      vehicleB: null,
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [],
    },
    8: {
      title: "沙坝→友谊关→观堂",
      hotel: "guantang-view",
      vehicleA: "van7-border",
      vehicleB: "van-cn-1000",
      guide: "guide-vn",
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: "misc-tip-daily",
      misc: [
        "misc-youyiguan-escort",
        "misc-dongxing-gate-transfer",
        "misc-pingxiang-pickup",
        "misc-pingxiang-photo",
        "misc-youyiguan-cart",
      ],
    },
    9: {
      title: "天琴壮寨·观堂",
      hotel: "guantang-view",
      vehicleA: "van7-border",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: "ticket-tianqin-bike",
      ticket2: null,
      tip: null,
      misc: [],
    },
    10: {
      title: "德天/明仕·南宁",
      hotel: "nanning-nalian",
      vehicleA: "van7-border",
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: "ticket-detian",
      ticket2: "ticket-mingshi",
      tip: null,
      misc: [],
    },
    11: {
      title: "送站结束",
      hotel: null,
      vehicleA: null,
      vehicleB: null,
      guide: null,
      lunch: null,
      dinner: null,
      ticket1: null,
      ticket2: null,
      tip: null,
      misc: ["misc-dropoff"],
    },
  },
};

const sheet = await queryAll(sheetId);
let updated = 0;
const missing = [];

for (const page of sheet) {
  const route = routeOf(page);
  const day = dayOf(page);
  const plan = PLAN[route]?.[day];
  if (!plan) continue;

  try {
    const properties = {
      线路: { select: { name: route } },
      日序: { number: day },
      日标题: { rich_text: [{ text: { content: plan.title } }] },
      酒店: one(plan.hotel, hotels),
      车型A: one(plan.vehicleA, vehicles),
      车型B: one(plan.vehicleB, vehicles),
      导游: one(plan.guide, guides),
      早餐产品: { relation: [] },
      中餐产品: one(plan.lunch, meals),
      晚餐产品: one(plan.dinner, meals),
      门票1产品: one(plan.ticket1, tickets),
      门票2产品: one(plan.ticket2, tickets),
      小费产品: one(plan.tip, misc),
      杂项产品: rel(plan.misc, misc),
    };
    if (sheetProps.has("间数")) {
      properties["间数"] = { number: plan.hotel ? 1 : 0 };
    }

    // 校验杂项都存在
    for (const code of plan.misc) {
      if (!misc.get(code)) throw new Error(`找不到杂项 ${code}`);
    }

    await notion(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    updated++;
    console.log(`${route} D${day} ${plan.title}`);
  } catch (e) {
    missing.push(`${route} D${day}: ${e.message}`);
    console.error(`${route} D${day}`, e.message);
  }
}

console.log(`完成：更新 ${updated} 行`);
if (missing.length) {
  console.error("失败：", missing.join("; "));
  process.exit(1);
}
console.log("请跑：npm run content:notion");
