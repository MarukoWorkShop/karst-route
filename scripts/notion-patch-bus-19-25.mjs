#!/usr/bin/env node
/**
 * 入库 19座 / 25座包车：日包 = 同段 7座 + 500
 * 测算规则（estimate）：≥14 人按 19座（当日车日包+500）；≥20 人按 25座（同价）
 *
 *   node scripts/notion-patch-bus-19-25.mjs && npm run content:notion
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
const vehiclesId = cfg.databases?.pricingVehicles;
if (!vehiclesId) {
  console.error("notion.yaml 缺少 pricingVehicles");
  process.exit(1);
}

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

const vehicleMeta = await notion(`/databases/${dash(vehiclesId)}`);
const vProps = vehicleMeta.properties || {};

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

/** 参考挂价：国内 7座 van7-cn 2000 + 500；测算时按当日点选车日包 +500 */
const BUSES = [
  {
    id: "bus19",
    title: "19座包车",
    titleEn: "19-seat coach charter",
    maxPax: 19,
    dayRate: 2500,
    segment: "国内",
    note: "整车日包=同段7座+500；测算：14人及以上按此车型（相对当日点选车+500）",
  },
  {
    id: "bus25",
    title: "25座包车",
    titleEn: "25-seat coach charter",
    maxPax: 25,
    dayRate: 2500,
    segment: "国内",
    note: "整车日包=同段7座+500；测算：20人及以上按此车型（相对当日点选车+500）",
  },
];

const pages = await queryAll(vehiclesId);
for (const bus of BUSES) {
  const hit = pages.find((p) => codeOf(p) === bus.id);
  const properties = { 标题: title(bus.title) };
  if (vProps["代号"]) properties["代号"] = rt(bus.id);
  if (vProps["最大载客"]) properties["最大载客"] = num(bus.maxPax);
  if (vProps["日包价"]) properties["日包价"] = num(bus.dayRate);
  if (vProps["名称英文"]) properties["名称英文"] = rt(bus.titleEn);
  if (vProps["适用段"]?.type === "select") properties["适用段"] = sel(bus.segment);
  else if (vProps["适用段"]) properties["适用段"] = rt(bus.segment);
  if (vProps["备注"]) properties["备注"] = rt(bus.note);
  if (vProps["状态"]?.type === "select") {
    const opt =
      vProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      vProps["状态"].select?.options?.[0]?.name;
    if (opt) properties["状态"] = sel(opt);
  }
  if (hit) {
    await notion(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("update", bus.id, bus.dayRate, `maxPax=${bus.maxPax}`);
  } else {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: dash(vehiclesId) }, properties }),
    });
    console.log("create", bus.id, bus.dayRate, `maxPax=${bus.maxPax}`);
  }
}

console.log("done — 可跑 npm run content:notion 拉回 YAML");
