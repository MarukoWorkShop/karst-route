#!/usr/bin/env node
/**
 * 团固定改产品：去掉线路参数「运营税费」「储备金」；
 * 产品库增加 杂费 1000/人、境外操作费 1000/人；
 * r1/r2（含越南）挂两项；r3（国内）只挂杂费。挂在各线 Day1 杂项。
 *
 *   node scripts/notion-patch-team-fees-to-misc.mjs && npm run content:notion
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

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
const dash = (id) => {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};

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
function codeOf(page) {
  return textProp(page, "代号") || textProp(page, "code") || "";
}
function prop(page, name) {
  const p = page.properties?.[name];
  if (!p) return null;
  if (p.type === "relation") return (p.relation || []).map((r) => r.id);
  if (p.type === "number") return p.number;
  return null;
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
  return { rich_text: [{ text: { content: String(s ?? "") } }] };
}
function title(s) {
  return { title: [{ text: { content: String(s ?? "") } }] };
}
function num(n) {
  return { number: n };
}
function sel(name) {
  return { select: { name } };
}

const miscId = cfg.databases.pricingMisc;
const pricingId = cfg.databases.pricing;
const sheetId = cfg.databases.pricingDaySheet;

const mProps = (await notion(`/databases/${dash(miscId)}`)).properties || {};
const FEE_PRODUCTS = [
  {
    id: "misc-sundry-1000",
    title: "杂费",
    titleEn: "Sundry / contingency",
    note: "原线路参数储备金；1000元/人（整团一次）",
  },
  {
    id: "misc-ops-overseas-1000",
    title: "境外操作费",
    titleEn: "Overseas operations fee",
    note: "原线路参数运营税费/越南操作；1000元/人；仅含越南段线路",
  },
];

console.log("1) 产品库…");
const miscPages = await queryAll(miscId);
const miscByCode = new Map();
for (const p of miscPages) {
  const c = codeOf(p);
  if (c) miscByCode.set(c, p);
}

for (const item of FEE_PRODUCTS) {
  const properties = { 标题: title(item.title) };
  if (mProps["代号"]) properties["代号"] = rt(item.id);
  if (mProps["名称英文"]) properties["名称英文"] = rt(item.titleEn);
  if (mProps["成人价"]) properties["成人价"] = num(1000);
  if (mProps["儿童价"]) properties["儿童价"] = num(1000);
  if (mProps["整团价"]) properties["整团价"] = num(0);
  else if (mProps["团价"]) properties["团价"] = num(0);
  const splitCol = mProps["分摊口径"] ? "分摊口径" : mProps["分摊方式"] ? "分摊方式" : null;
  if (splitCol && mProps[splitCol]?.type === "select") properties[splitCol] = sel("per_person");
  else if (splitCol) properties[splitCol] = rt("per_person");
  if (mProps["类别"]?.type === "select") {
    const opt =
      mProps["类别"].select?.options?.find((o) => /杂|其他|other|接送/i.test(o.name))?.name ||
      mProps["类别"].select?.options?.[0]?.name;
    if (opt) properties["类别"] = sel(opt);
  } else if (mProps["类别"]) properties["类别"] = rt("杂费");
  if (mProps["备注"]) properties["备注"] = rt(item.note);
  if (mProps["状态"]?.type === "select") {
    const opt =
      mProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      mProps["状态"].select?.options?.[0]?.name;
    if (opt) properties["状态"] = sel(opt);
  }
  const hit = miscByCode.get(item.id);
  if (hit) {
    await notion(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("  update", item.id);
    miscByCode.set(item.id, hit);
  } else {
    const created = await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: dash(miscId) }, properties }),
    });
    console.log("  create", item.id);
    miscByCode.set(item.id, created);
  }
}

const sundryId = miscByCode.get("misc-sundry-1000")?.id;
const overseasId = miscByCode.get("misc-ops-overseas-1000")?.id;
if (!sundryId || !overseasId) throw new Error("未能解析杂费/境外操作费 page id");

console.log("2) 线路参数清零并删除列…");
const OPS = "运营税费(元/团)";
const RES = "储备金(元/团)";
const paramMeta = await notion(`/databases/${dash(pricingId)}`);
const pProps = paramMeta.properties || {};
const paramPages = await queryAll(pricingId);

for (const page of paramPages) {
  const properties = {};
  if (pProps[OPS]) properties[OPS] = { number: 0 };
  if (pProps[RES]) properties[RES] = { number: 0 };
  // 兼容旧短名
  if (pProps["运营税费"]) properties["运营税费"] = { number: 0 };
  if (pProps["储备金"]) properties["储备金"] = { number: 0 };
  if (pProps.ops) properties.ops = { number: 0 };
  if (pProps.reserve) properties.reserve = { number: 0 };
  if (!Object.keys(properties).length) continue;
  await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
  console.log("  zeroed", textProp(page, "标题") || textProp(page, "线路") || page.id.slice(0, 8));
}

const drop = {};
if (pProps[OPS]) drop[OPS] = null;
if (pProps[RES]) drop[RES] = null;
if (pProps["运营税费"]) drop["运营税费"] = null;
if (pProps["储备金"]) drop["储备金"] = null;
if (Object.keys(drop).length) {
  await notion(`/databases/${dash(pricingId)}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: drop }),
  });
  console.log("  dropped columns", Object.keys(drop).join(", "));
} else {
  console.log("  columns already absent");
}

console.log("3) 按日 Day1 挂杂项…");
/** r1/r2 含越南：杂费+境外操作；r3 国内：仅杂费 */
const ROUTE_FEES = {
  r1: [sundryId, overseasId],
  r2: [sundryId, overseasId],
  r3: [sundryId],
};
const FEE_CODES = new Set(["misc-sundry-1000", "misc-ops-overseas-1000"]);

const sheet = await queryAll(sheetId);
const sheetMeta = await notion(`/databases/${dash(sheetId)}`);
const hasMiscCol = !!sheetMeta.properties?.["杂项产品"];

function routeOf(page) {
  return (
    textProp(page, "线路") ||
    (textProp(page, "标题").match(/·\s*(r[123])\s*·/i) || textProp(page, "标题").match(/\b(r[123])\b/i) || [])[1] ||
    ""
  ).toLowerCase();
}
function dayOf(page) {
  const n = Number(textProp(page, "日序"));
  if (Number.isFinite(n) && n > 0) return n;
  return Number((textProp(page, "标题").match(/D(\d+)/i) || [])[1]) || 0;
}

// code → page id for stripping old fee refs by reading misc catalog
const idToCode = new Map();
for (const [c, p] of miscByCode) idToCode.set(p.id, c);

for (const page of sheet) {
  const rid = routeOf(page);
  const day = dayOf(page);
  if (!ROUTE_FEES[rid] || day !== 1) continue;
  if (!hasMiscCol) {
    console.warn("  no 杂项产品 column");
    break;
  }
  const existing = prop(page, "杂项产品") || [];
  const kept = existing.filter((id) => {
    const code = idToCode.get(id);
    return !code || !FEE_CODES.has(code);
  });
  const next = [...kept];
  for (const id of ROUTE_FEES[rid]) {
    if (!next.includes(id)) next.push(id);
  }
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        杂项产品: { relation: next.map((id) => ({ id })) },
      },
    }),
  });
  console.log(`  ${rid} D1 misc →`, next.length, "items (+fees)");
}

console.log("done");
