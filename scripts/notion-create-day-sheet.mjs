#!/usr/bin/env node
/**
 * 建「报价·按日一行」+「报价·人数验算」两表，并从 pricing.yaml 灌入 r1。
 * 一天一行；点开行即可在属性面板填酒店/车/导/票/餐/小费/其他。
 *
 *   npm run content:notion:init-day-sheet -- <父页面32位ID>
 *   默认父页可用：网站内容优化页（与定价表同级）
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { flattenDay, expandDaySheetRow } from "./lib/pricing-day-sheet.mjs";

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

const args = process.argv.slice(2);
const empty = args.includes("--empty");
const pageArg = args.find((a) => a.startsWith("--page="));
const parentPageId = (pageArg ? pageArg.slice(7) : args.find((a) => !a.startsWith("--")) || "").trim();
const token = process.env.NOTION_TOKEN?.trim();

if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}
if (!/^[0-9a-fA-F-]{32,36}$/.test(parentPageId)) {
  console.error("用法：npm run content:notion:init-day-sheet -- <父页面32位ID>");
  process.exit(1);
}

const uuid = (id) => String(id).replace(/-/g, "");
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

const title = (name) => ({ [name]: { title: {} } });
const rich = (name) => ({ [name]: { rich_text: {} } });
const num = (name) => ({ [name]: { number: { format: "number" } } });
const checkbox = (name) => ({ [name]: { checkbox: {} } });
const select = (name, options) => ({
  [name]: { select: { options: options.map((o) => ({ name: o, color: "default" })) } },
});
const relation = (name, databaseId) => ({
  [name]: { relation: { database_id: databaseId, single_property: {} } },
});

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "").slice(0, 2000) } }] });
const nb = (v) => {
  if (v === "" || v == null || Number.isNaN(Number(v))) return { number: null };
  return { number: Number(v) };
};
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });
const cb = (v) => ({ checkbox: !!v });
const ttl = (v) => ({ title: [{ text: { content: String(v ?? "").slice(0, 200) || "-" } }] });

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const hotelsDbId = cfg.databases?.pricingHotels;
const vehiclesDbId = cfg.databases?.pricingVehicles;
const guidesDbId = cfg.databases?.pricingGuides;
if (!hotelsDbId || !vehiclesDbId || !guidesDbId) {
  console.error("需要先有 pricingHotels / pricingVehicles / pricingGuides");
  process.exit(1);
}

const pricing = parseYaml(fs.readFileSync(path.join(root, "content", "pricing.yaml"), "utf8"));
const catalogs = pricing.catalogs || {};

async function codeMap(databaseId, codeProp = "代号") {
  const map = {};
  let cursor;
  do {
    const body = await notion(`/databases/${dash(databaseId)}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    for (const page of body.results || []) {
      const code = (page.properties?.[codeProp]?.rich_text || []).map((t) => t.plain_text).join("").trim();
      if (code) map[code] = page.id;
    }
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return map;
}

console.log("读取主数据代号…");
const hotelByCode = await codeMap(hotelsDbId);
const vehicleByCode = await codeMap(vehiclesDbId);
const guideByCode = await codeMap(guidesDbId);

const ROUTES = ["r1", "r2", "r3"];
const SPLITS = ["per_person", "per_group_split", "per_vehicle_split", "per_room_split"];
const ROUTE_BADGE = { r1: "路线一", r2: "路线二", r3: "路线三" };

console.log("建表：报价·按日一行…");
const sheetDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·按日一行" } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "一天一行。点开行在右侧/页面属性里填酒店、车、导、门票、餐、小费、其他。同步后网站按日汇总；下方见「报价·人数验算」。",
        },
      },
    ],
    properties: {
      ...title("标题"),
      ...select("线路", ROUTES),
      ...num("日序"),
      ...rich("日标题"),
      ...relation("酒店", dash(hotelsDbId)),
      ...num("间数"),
      ...num("房费覆盖"),
      ...relation("车型A", dash(vehiclesDbId)),
      ...num("车费A覆盖"),
      ...relation("车型B", dash(vehiclesDbId)),
      ...num("车费B覆盖"),
      ...relation("导游", dash(guidesDbId)),
      ...num("导费覆盖"),
      ...num("早餐"),
      ...num("中餐"),
      ...num("晚餐"),
      ...rich("门票1名称"),
      ...num("门票1金额"),
      ...checkbox("门票1现付"),
      ...rich("门票2名称"),
      ...num("门票2金额"),
      ...checkbox("门票2现付"),
      ...num("小费"),
      ...rich("备注"),
      ...select("状态", ["已发布", "草稿", "已下线"]),
    },
  }),
});

console.log("建表：报价·人数验算…");
const validateDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·人数验算" } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "填完按日一行后跑 npm run content:notion，脚本按同一套估算公式写入 2/4/6/8/10 人成人单价、儿童单价与全成人团总价。",
        },
      },
    ],
    properties: {
      ...title("标题"),
      ...select("线路", ROUTES),
      ...num("人数"),
      ...num("成人单价"),
      ...num("儿童单价"),
      ...num("全成人总价"),
      ...rich("口径说明"),
      ...select("状态", ["已发布", "草稿", "已下线"]),
    },
  }),
});

function sheetProps(routeId, flat) {
  const badge = ROUTE_BADGE[routeId] || routeId;
  const hotelId = flat.hotelRef ? hotelByCode[flat.hotelRef] : null;
  const va = flat.vehicleARef ? vehicleByCode[flat.vehicleARef] : null;
  const vb = flat.vehicleBRef ? vehicleByCode[flat.vehicleBRef] : null;
  const g = flat.guideRef ? guideByCode[flat.guideRef] : null;
  return {
    标题: ttl(`${badge}·${routeId} · D${flat.day} · ${flat.titleZh || "行程日"}`),
    线路: sl(routeId),
    日序: nb(flat.day),
    日标题: rt(flat.titleZh),
    酒店: { relation: hotelId ? [{ id: hotelId }] : [] },
    间数: nb(flat.rooms || 1),
    房费覆盖: nb(flat.hotelOverride),
    车型A: { relation: va ? [{ id: va }] : [] },
    车费A覆盖: nb(flat.vehicleAOverride),
    车型B: { relation: vb ? [{ id: vb }] : [] },
    车费B覆盖: nb(flat.vehicleBOverride),
    导游: { relation: g ? [{ id: g }] : [] },
    导费覆盖: nb(flat.guideOverride),
    早餐: nb(flat.breakfast),
    中餐: nb(flat.lunch ?? flat.meal),
    晚餐: nb(flat.dinner),
    门票1名称: rt(flat.ticket1Name),
    门票1金额: nb(flat.ticket1Amount),
    门票1现付: cb(flat.ticket1PayOnSite),
    门票2名称: rt(flat.ticket2Name),
    门票2金额: nb(flat.ticket2Amount),
    门票2现付: cb(flat.ticket2PayOnSite),
    小费: nb(flat.tip),
    备注: rt(flat.note || ""),
    状态: sl("已发布"),
  };
}

if (!empty) {
  let n = 0;
  for (const routeId of ROUTES) {
    const days = pricing.routes?.[routeId]?.days || [];
    for (const day of days) {
      const flat = flattenDay(day);
      await notion("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: sheetDb.id },
          properties: sheetProps(routeId, flat),
        }),
      });
      n++;
    }
  }
  console.log(`  已灌入 ${n} 个行程日（一天一行）`);
}

// 验算空行骨架 3路线 × 5人数
const NS = [2, 4, 6, 8, 10];
if (!empty) {
  for (const routeId of ROUTES) {
    for (const n of NS) {
      await notion("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: validateDb.id },
          properties: {
            标题: ttl(`${ROUTE_BADGE[routeId]}·${routeId} · ${n}人验算`),
            线路: sl(routeId),
            人数: nb(n),
            成人单价: nb(null),
            儿童单价: nb(null),
            全成人总价: nb(null),
            口径说明: rt("待同步后自动写入"),
            状态: sl("已发布"),
          },
        }),
      });
    }
  }
  console.log(`  验算骨架 ${ROUTES.length * NS.length} 行`);
}

// 视图
const sheetDs = (
  await notion(`/databases/${sheetDb.id}`, { method: "GET" }, VIEW_VERSION)
).data_sources?.[0]?.id;
const valDs = (
  await notion(`/databases/${validateDb.id}`, { method: "GET" }, VIEW_VERSION)
).data_sources?.[0]?.id;

if (sheetDs) {
  for (const [name, route] of [
    ["路线一·r1", "r1"],
    ["路线二·r2", "r2"],
    ["路线三·r3", "r3"],
  ]) {
    await notion(
      "/views",
      {
        method: "POST",
        body: JSON.stringify({
          database_id: sheetDb.id,
          data_source_id: sheetDs,
          name,
          type: "table",
          filter: { property: "线路", select: { equals: route } },
          sorts: [{ property: "日序", direction: "ascending" }],
        }),
      },
      VIEW_VERSION,
    );
  }
  console.log("  已建按日一行三线路视图");
}
if (valDs) {
  for (const [name, route] of [
    ["路线一·验算", "r1"],
    ["路线二·验算", "r2"],
    ["路线三·验算", "r3"],
  ]) {
    await notion(
      "/views",
      {
        method: "POST",
        body: JSON.stringify({
          database_id: validateDb.id,
          data_source_id: valDs,
          name,
          type: "table",
          filter: { property: "线路", select: { equals: route } },
          sorts: [{ property: "人数", direction: "ascending" }],
        }),
      },
      VIEW_VERSION,
    );
  }
  console.log("  已建验算三线路视图");
}

const sheetId = uuid(sheetDb.id);
const validateId = uuid(validateDb.id);

console.log(`
完成。
  按日一行  ${sheetDb.url}
  人数验算  ${validateDb.url}

粘进 content/notion.yaml：
  pricingDaySheet: "${sheetId}"
  pricingValidate: "${validateId}"

说明：旧「报价·按日明细」多行表可保留作归档；同步将优先读「按日一行」。
然后：npm run content:notion
`);
