#!/usr/bin/env node
/**
 * 把本地 YAML 写回 Notion：路线二卡片 + 逐日行程（11 日）。
 * Usage: node scripts/push-notion-r2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const VERSION = "2022-06-28";

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN（.env.local）");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const routeYaml = parseYaml(fs.readFileSync(path.join(root, "content/routes/r2.yaml"), "utf8"));
const itinYaml = parseYaml(fs.readFileSync(path.join(root, "content/itineraries/r2.yaml"), "utf8"));

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "").replace(/.*\/([0-9a-f]{32}).*/i, "$1");
  const h = hex.match(/^[0-9a-f]{32}$/i)?.[0];
  if (!h) throw new Error(`bad id: ${raw}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.body = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

async function queryAll(dbRaw) {
  const id = uuid(dbRaw);
  const pages = [];
  let cursor;
  do {
    const body = await api("POST", `https://api.notion.com/v1/databases/${id}/query`, {
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return pages;
}

function plain(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("");
    case "select":
      return prop.select?.name ?? "";
    case "number":
      return prop.number;
    case "relation":
      return (prop.relation ?? []).map((r) => r.id);
    default:
      return "";
  }
}

function tx(node, lang) {
  if (!node || typeof node !== "object") return "";
  return String(node[lang] ?? "");
}

function lines(arr, lang) {
  if (!Array.isArray(arr)) return "";
  return arr.map((x) => tx(x, lang)).filter(Boolean).join("\n");
}

function rich(text) {
  const s = String(text ?? "");
  if (!s) return { rich_text: [] };
  const chunks = [];
  for (let i = 0; i < s.length; i += 1900) {
    chunks.push({ type: "text", text: { content: s.slice(i, i + 1900) } });
  }
  return { rich_text: chunks };
}

function title(text) {
  return { title: [{ type: "text", text: { content: String(text).slice(0, 2000) } }] };
}

function select(name) {
  if (!name) return { select: null };
  return { select: { name: String(name) } };
}

function multi(names) {
  return { multi_select: (names ?? []).filter(Boolean).map((name) => ({ name: String(name) })) };
}

function num(n) {
  const v = Number(n);
  return { number: Number.isFinite(v) ? v : null };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureBlurbCols(dbId) {
  const db = await api("GET", `https://api.notion.com/v1/databases/${dbId}`);
  const props = {};
  if (!db.properties?.blurb_zh) {
    props.blurb_zh = { rich_text: {}, description: "当日介绍段（中文）" };
  }
  if (!db.properties?.blurb_en) {
    props.blurb_en = { rich_text: {}, description: "当日介绍段（英文）" };
  }
  if (Object.keys(props).length) {
    await api("PATCH", `https://api.notion.com/v1/databases/${dbId}`, { properties: props });
    console.log("added Notion columns:", Object.keys(props).join(", "));
  }
}

function dayProps(day, routePageId, src) {
  const n = String(day.day).padStart(2, "0");
  const cityZh = tx(day.city, "zh") || `D${n}`;
  return {
    标题: title(`r2-D${n} ${cityZh}`),
    路线: { relation: [{ id: routePageId }] },
    day: num(day.day),
    src: select(src || "zh"),
    stayKind: select(day.stayKind || "hotel"),
    placeId: select(day.placeId || null),
    themes: multi(day.themes),
    city_zh: select(tx(day.city, "zh") || null),
    city_en: select(tx(day.city, "en") || null),
    stay_zh: rich(tx(day.stay, "zh")),
    stay_en: rich(tx(day.stay, "en")),
    drive_zh: rich(tx(day.drive, "zh")),
    drive_en: rich(tx(day.drive, "en")),
    transport_zh: rich(tx(day.transport, "zh")),
    transport_en: rich(tx(day.transport, "en")),
    lodging_zh: rich(tx(day.lodging, "zh")),
    lodging_en: rich(tx(day.lodging, "en")),
    blurb_zh: rich(tx(day.blurb, "zh")),
    blurb_en: rich(tx(day.blurb, "en")),
    dining_zh: rich(lines(day.dining, "zh")),
    dining_en: rich(lines(day.dining, "en")),
    bullets_zh: rich(lines(day.bullets, "zh")),
    bullets_en: rich(lines(day.bullets, "en")),
    photos: rich(Array.isArray(day.photos) ? day.photos.join("\n") : ""),
  };
}

async function main() {
  const routesDb = uuid(cfg.databases.routes);
  const itinDb = uuid(cfg.databases.itineraries);

  await ensureBlurbCols(itinDb);

  const routePages = await queryAll(routesDb);
  const r2Page = routePages.find((p) => plain(p.properties.id) === "r2");
  if (!r2Page) throw new Error("Notion 找不到路线卡片 id=r2");
  const routePageId = r2Page.id;

  // days in Notion are numbers
  const daysNum = 11;
  await api("PATCH", `https://api.notion.com/v1/pages/${routePageId}`, {
    properties: {
      src: select(routeYaml.src || "zh"),
      cover: rich(routeYaml.cover || ""),
      badge_zh: rich(tx(routeYaml.badge, "zh")),
      badge_en: rich(tx(routeYaml.badge, "en")),
      name_zh: rich(tx(routeYaml.name, "zh")),
      name_en: rich(tx(routeYaml.name, "en")),
      tagline_zh: rich(tx(routeYaml.tagline, "zh")),
      tagline_en: rich(tx(routeYaml.tagline, "en")),
      regions_zh: rich(tx(routeYaml.regions, "zh")),
      regions_en: rich(tx(routeYaml.regions, "en")),
      feature_zh: rich(tx(routeYaml.feature, "zh")),
      feature_en: rich(tx(routeYaml.feature, "en")),
      days_zh: num(daysNum),
      days_en: num(daysNum),
      entry_zh: select(tx(routeYaml.entry, "zh")),
      entry_en: select(tx(routeYaml.entry, "en")),
      exit_zh: rich(tx(routeYaml.exit, "zh")),
      exit_en: rich(tx(routeYaml.exit, "en")),
      audience_zh: rich(tx(routeYaml.audience, "zh")),
      audience_en: rich(tx(routeYaml.audience, "en")),
      price_zh: rich(tx(routeYaml.price, "zh")),
      price_en: rich(tx(routeYaml.price, "en")),
      included: multi(routeYaml.included),
      excluded: multi(routeYaml.excluded),
    },
  });
  console.log("updated route card r2 →", daysNum, "days");

  const titleBy = Object.fromEntries(
    routePages.map((p) => [p.id, plain(p.properties.id) || plain(p.properties["标题"])]),
  );
  const dayPages = await queryAll(itinDb);
  const r2Days = dayPages.filter((p) => {
    const rel = p.properties["路线"] || p.properties.route;
    const ids = rel?.relation?.map((r) => r.id) || [];
    return ids.some((id) => titleBy[id] === "r2") || plain(p.properties["标题"]).startsWith("r2-");
  });

  const byDay = new Map();
  for (const p of r2Days) {
    const d = Number(p.properties.day?.number ?? 0);
    const prev = byDay.get(d);
    if (!prev || Date.parse(p.last_edited_time) >= Date.parse(prev.last_edited_time)) {
      byDay.set(d, p);
    }
  }

  const src = itinYaml.src || "zh";
  for (const day of itinYaml.days ?? []) {
    const props = dayProps(day, routePageId, src);
    const existing = byDay.get(Number(day.day));
    if (existing) {
      await api("PATCH", `https://api.notion.com/v1/pages/${existing.id}`, { properties: props });
      console.log(`patched day ${day.day} ${tx(day.city, "zh")}`);
    } else {
      await api("POST", "https://api.notion.com/v1/pages", {
        parent: { database_id: itinDb },
        properties: props,
      });
      console.log(`created day ${day.day} ${tx(day.city, "zh")}`);
    }
    await sleep(350);
  }

  // archive stray r2 days beyond 11 (if any)
  for (const [d, page] of byDay) {
    if (d > 11) {
      await api("PATCH", `https://api.notion.com/v1/pages/${page.id}`, { archived: true });
      console.log("archived stray day", d);
    }
  }

  console.log("OK · Notion 路线二已与本地 YAML 对齐（11 日）");
}

main().catch((e) => {
  console.error(e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
