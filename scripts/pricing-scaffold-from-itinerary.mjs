#!/usr/bin/env node
/**
 * 报价二期：按行程生成 / 更新 Notion「按日一行」骨架
 *   npm run content:pricing-scaffold -- --route r2
 *   npm run content:pricing-scaffold -- --route r3 --dry-run
 *   npm run content:pricing-scaffold -- --route r2 --sync
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  dashUuid,
  idemKey,
  loadDotenv,
  parseSheetTitle,
  planRouteStubs,
} from "./lib/pricing-from-itinerary.mjs";

loadDotenv();
const root = process.cwd();
const args = process.argv.slice(2);
const routeIdx = args.indexOf("--route");
const routeId = routeIdx >= 0 ? args[routeIdx + 1] : "";
const dryRun = args.includes("--dry-run");
const doSync = args.includes("--sync");

if (!/^r[123]$/.test(routeId || "")) {
  console.error("用法：npm run content:pricing-scaffold -- --route r1|r2|r3 [--dry-run] [--sync]");
  process.exit(1);
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("需要 NOTION_TOKEN（.env.local）");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const dbId = cfg.databases?.pricingDaySheet;
const hotelsId = cfg.databases?.pricingHotels;
const vehiclesId = cfg.databases?.pricingVehicles;
const guidesId = cfg.databases?.pricingGuides;
if (!dbId || !hotelsId || !vehiclesId || !guidesId) {
  console.error("notion.yaml 缺少 pricingDaySheet / Hotels / Vehicles / Guides");
  process.exit(1);
}

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${urlPath}: ${JSON.stringify(body)}`);
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
  return "";
}
function numProp(page, name) {
  const p = page.properties?.[name];
  if (p?.type === "number" && p.number != null) return Number(p.number);
  return 0;
}
function relIds(page, name) {
  const p = page.properties?.[name];
  return p?.type === "relation" ? (p.relation || []).map((r) => r.id) : [];
}

async function queryAll(db) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`/databases/${dashUuid(db)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    out.push(...(r.results || []).filter((p) => !p.archived));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function codeOf(page) {
  return textProp(page, "代号") || textProp(page, "code") || "";
}

console.log(dryRun ? "DRY-RUN（不写 Notion）" : "写入 Notion 按日一行…");

const stubs = planRouteStubs(routeId);
const [meta, hotelPages, vehiclePages, guidePages, sheetPages] = await Promise.all([
  notion(`/databases/${dashUuid(dbId)}`),
  queryAll(hotelsId),
  queryAll(vehiclesId),
  queryAll(guidesId),
  queryAll(dbId),
]);

const props = meta.properties || {};
const has = (name) => !!props[name];

const hotelByCode = new Map();
for (const p of hotelPages) {
  const c = codeOf(p) || textProp(p, "标题");
  if (c) hotelByCode.set(c, p.id);
}
const vehicleByCode = new Map();
for (const p of vehiclePages) {
  const c = codeOf(p) || textProp(p, "标题");
  if (c) vehicleByCode.set(c, p.id);
}
const guideByCode = new Map();
for (const p of guidePages) {
  const c = codeOf(p) || textProp(p, "标题");
  if (c) guideByCode.set(c, p.id);
}

const existingByDay = new Map();
const existingByKey = new Map();
for (const page of sheetPages) {
  const title = textProp(page, "标题");
  const key = textProp(page, "幂等键");
  const routeCol = textProp(page, "线路");
  const dayCol = numProp(page, "日序");
  const placeCol = textProp(page, "日标题");
  const { route, day } = parseSheetTitle(title, routeCol, dayCol, placeCol);
  if (route !== routeId) continue;
  const k = key || (day > 0 ? idemKey(routeId, day) : "");
  const row = {
    page,
    day,
    key: k,
    locked: page.properties?.["人工锁定"]?.checkbox === true,
  };
  if (day > 0) existingByDay.set(day, row);
  if (k) existingByKey.set(k, row);
}

function selectProp(name, value) {
  if (!has(name) || !value) return {};
  const t = props[name].type;
  if (t === "select") return { [name]: { select: { name: value } } };
  if (t === "rich_text") return { [name]: { rich_text: [{ text: { content: value } }] } };
  return {};
}

function buildProperties(stub, { fillEmptyOnly, page }) {
  const properties = {
    标题: { title: [{ text: { content: stub.title } }] },
  };
  if (has("日序")) properties["日序"] = { number: stub.day };
  if (has("日标题")) {
    properties["日标题"] = { rich_text: [{ text: { content: stub.cityZh } }] };
  }
  if (has("线路")) {
    const t = props["线路"].type;
    if (t === "select") properties["线路"] = { select: { name: stub.routeId } };
    else if (t === "rich_text") {
      properties["线路"] = { rich_text: [{ text: { content: stub.routeId } }] };
    }
  }
  if (has("幂等键")) {
    properties["幂等键"] = { rich_text: [{ text: { content: stub.idempotencyKey } }] };
  }
  Object.assign(properties, selectProp("生成来源", "itinerary_stub"));

  const hotelId = stub.hotelRef ? hotelByCode.get(stub.hotelRef) : null;
  const vaId = stub.vehicleARef ? vehicleByCode.get(stub.vehicleARef) : null;
  const vbId = stub.vehicleBRef ? vehicleByCode.get(stub.vehicleBRef) : null;
  const gId = stub.guideRef ? guideByCode.get(stub.guideRef) : null;

  const canFill = (col) => {
    if (!fillEmptyOnly || !page) return true;
    return relIds(page, col).length === 0;
  };

  if (has("酒店") && hotelId && canFill("酒店")) {
    properties["酒店"] = { relation: [{ id: hotelId }] };
  }
  if (has("车型A") && vaId && canFill("车型A")) {
    properties["车型A"] = { relation: [{ id: vaId }] };
  }
  if (has("车型B") && vbId && canFill("车型B")) {
    properties["车型B"] = { relation: [{ id: vbId }] };
  }
  if (has("导游") && gId && canFill("导游")) {
    properties["导游"] = { relation: [{ id: gId }] };
  }
  if (has("间数") && stub.wantHotel && (!page || numProp(page, "间数") <= 0)) {
    properties["间数"] = { number: 1 };
  }

  return properties;
}

let created = 0;
let updated = 0;
let skipped = 0;

for (const stub of stubs) {
  const hit = existingByKey.get(stub.idempotencyKey) || existingByDay.get(stub.day);
  if (hit?.locked) {
    console.log(`  skip locked D${stub.day}`);
    skipped++;
    continue;
  }

  if (!hit) {
    const properties = buildProperties(stub, { fillEmptyOnly: false, page: null });
    console.log(`  create D${stub.day} ${stub.title}`);
    if (!dryRun) {
      await notion("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: dashUuid(dbId) },
          properties,
        }),
      });
    }
    created++;
    continue;
  }

  // 更新：标题/日序/幂等键；产品仅填空
  const properties = buildProperties(stub, { fillEmptyOnly: true, page: hit.page });
  // 已有行：若生成来源是 manual，不改来源
  if (textProp(hit.page, "生成来源") === "manual" && has("生成来源")) {
    delete properties["生成来源"];
  }
  console.log(`  update D${stub.day} ${stub.title}`);
  if (!dryRun) {
    await notion(`/pages/${hit.page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
  }
  updated++;
}

console.log(`\n完成：create=${created} update=${updated} skipLocked=${skipped}${dryRun ? " (dry-run)" : ""}`);
if (!has("幂等键") || !has("生成来源") || !has("人工锁定")) {
  console.log(
    "提示：建议先跑 npm run content:notion:patch-scaffold-cols 补齐 幂等键/生成来源/人工锁定",
  );
}

if (doSync && !dryRun) {
  console.log("\n运行 content:notion…");
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("npm", ["run", "content:notion"], { stdio: "inherit", cwd: root });
  process.exit(r.status || 0);
}
