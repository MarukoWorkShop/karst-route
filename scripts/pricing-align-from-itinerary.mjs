#!/usr/bin/env node
/**
 * 报价二期：行程 vs Notion 按日一行 对齐报告（只读）
 *   npm run content:pricing-align -- --route r1
 *   npm run content:pricing-align -- --route r2 --local   # 不读 Notion，只打行程骨架预览
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  dashUuid,
  loadDotenv,
  parseSheetTitle,
  planRouteStubs,
} from "./lib/pricing-from-itinerary.mjs";

loadDotenv();
const root = process.cwd();
const args = process.argv.slice(2);
const routeIdx = args.indexOf("--route");
const routeId = routeIdx >= 0 ? args[routeIdx + 1] : "";
const localOnly = args.includes("--local");

if (!/^r[123]$/.test(routeId || "")) {
  console.error("用法：npm run content:pricing-align -- --route r1|r2|r3 [--local]");
  process.exit(1);
}

const stubs = planRouteStubs(routeId);
console.log(`\n=== ${routeId} 行程骨架预览（${stubs.length} 天）===`);
for (const s of stubs) {
  const bits = [
    `D${s.day}`,
    s.cityZh,
    s.wantHotel ? `hotel=${s.hotelRef || "待选"}` : "hotel=—",
    s.vehicleARef ? `vanA=${s.vehicleARef}` : "vanA=—",
    s.vehicleBRef ? `vanB=${s.vehicleBRef}` : "",
    s.guideRef ? `guide=${s.guideRef}` : "guide=—",
  ].filter(Boolean);
  console.log(" ", bits.join(" · "));
  if (s.warnings.length) console.log("    !", s.warnings.join(", "));
}

if (localOnly) {
  console.log("\n(--local：未读 Notion)");
  process.exit(0);
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN；可用 --local 只看行程侧");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const dbId = cfg.databases?.pricingDaySheet;
if (!dbId) {
  console.error("notion.yaml 缺少 pricingDaySheet");
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
function relCount(page, name) {
  const p = page.properties?.[name];
  return p?.type === "relation" ? (p.relation || []).length : 0;
}

const pages = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;
  const r = await notion(`/databases/${dashUuid(dbId)}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  pages.push(...(r.results || []).filter((p) => !p.archived));
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

const existing = [];
for (const page of pages) {
  const title = textProp(page, "标题");
  const key = textProp(page, "幂等键");
  const routeCol = textProp(page, "线路");
  const dayCol = numProp(page, "日序");
  const placeCol = textProp(page, "日标题");
  const { route, day, place } = parseSheetTitle(title, routeCol, dayCol, placeCol);
  if (route !== routeId) continue;
  existing.push({
    pageId: page.id,
    day,
    place,
    title,
    key: key || `${routeId}|d${day}|day`,
    locked: page.properties?.["人工锁定"]?.checkbox === true,
    source: textProp(page, "生成来源"),
    hasHotel: relCount(page, "酒店") > 0,
    hasVan: relCount(page, "车型A") > 0 || relCount(page, "车型B") > 0,
    hasGuide: relCount(page, "导游") > 0,
  });
}

const stubDays = new Set(stubs.map((s) => s.day));
const existDays = new Set(existing.map((e) => e.day).filter((d) => d > 0));

const missing = stubs.filter((s) => !existDays.has(s.day));
const extra = existing.filter((e) => e.day > 0 && !stubDays.has(e.day));
const titleDrift = [];
for (const s of stubs) {
  const e = existing.find((x) => x.day === s.day);
  if (!e) continue;
  if (e.place && s.cityZh && e.place !== s.cityZh && !e.title.includes(s.cityZh)) {
    titleDrift.push({ day: s.day, itin: s.cityZh, sheet: e.place });
  }
}

console.log(`\n=== Notion 对齐（已有 ${existing.length} 行）===`);
console.log(`缺日（行程有、报价无）: ${missing.length ? missing.map((m) => `D${m.day}`).join(", ") : "无"}`);
console.log(`多余（报价有、行程无）: ${extra.length ? extra.map((e) => `D${e.day}`).join(", ") : "无"}`);
if (titleDrift.length) {
  console.log("日标题可能不一致:");
  for (const d of titleDrift) console.log(`  D${d.day}: 行程「${d.itin}」 vs 表「${d.sheet}」`);
}
const unmapped = stubs.filter((s) => s.warnings.some((w) => w.startsWith("unmapped")));
if (unmapped.length) {
  console.log("酒店未映射:");
  for (const s of unmapped) console.log(`  D${s.day} ${s.placeId}`);
}
const thin = existing.filter((e) => !e.hasHotel && !e.hasVan && !e.hasGuide);
if (thin.length) {
  console.log(`空产品行: ${thin.map((e) => `D${e.day}`).join(", ")}`);
}
console.log("");
