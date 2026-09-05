#!/usr/bin/env node
/**
 * 用本地 YAML 替换 Notion「客人评价」里的 David 占位为郝蕊（r3）。
 * Usage: node scripts/push-notion-review-haorui.mjs
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const review = parseYaml(fs.readFileSync(path.join(root, "content/reviews/haorui.yaml"), "utf8"));

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
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "select") return prop.select?.name ?? "";
  if (prop.type === "relation") return (prop.relation ?? []).map((r) => r.id);
  return "";
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

function num(n) {
  return { number: Number(n) || null };
}

function tx(node, lang) {
  return String(node?.[lang] ?? "");
}

async function main() {
  const reviewsDb = uuid(cfg.databases.reviews);
  const routesDb = uuid(cfg.databases.routes);

  const routePages = await queryAll(routesDb);
  const r3 = routePages.find((p) => plain(p.properties.id) === "r3");
  if (!r3) throw new Error("找不到路线卡片 r3");

  const pages = await queryAll(reviewsDb);
  const bySlug = (slug) =>
    pages.find((p) => {
      const s = (plain(p.properties.slug) || plain(p.properties["标题"])).trim().toLowerCase();
      return s === slug;
    });

  const david = bySlug("david");
  const existing = bySlug("haorui");

  const props = {
    标题: title("haorui"),
    slug: rich("haorui"),
    src: select(review.src || "zh"),
    flag: rich(review.flag || "🇨🇳"),
    name: rich(review.name),
    country: rich(review.country),
    路线: { relation: [{ id: r3.id }] },
    rating: num(review.rating ?? 5),
    date: { date: { start: String(review.date || "2026-09-01").slice(0, 10).length >= 10
      ? String(review.date).slice(0, 10)
      : `${String(review.date || "2026-09").replace(/\/.*/, "")}-01` } },
    short_zh: rich(tx(review.short, "zh")),
    short_en: rich(tx(review.short, "en")),
    full_zh: rich(tx(review.full, "zh")),
    full_en: rich(tx(review.full, "en")),
    photos: rich(Array.isArray(review.photos) ? review.photos.join("\n") : ""),
  };

  // drop props that don't exist on DB
  const db = await api("GET", `https://api.notion.com/v1/databases/${reviewsDb}`);
  const allowed = new Set(Object.keys(db.properties || {}));
  for (const key of Object.keys(props)) {
    if (!allowed.has(key)) delete props[key];
  }
  // title may be "标题" or "slug" as title
  if (!allowed.has("标题") && allowed.has("slug") && db.properties.slug.type === "title") {
    props.slug = title("haorui");
  }

  if (existing) {
    await api("PATCH", `https://api.notion.com/v1/pages/${existing.id}`, { properties: props });
    console.log("updated existing haorui");
  } else if (david) {
    await api("PATCH", `https://api.notion.com/v1/pages/${david.id}`, { properties: props });
    console.log("replaced david → haorui on same page");
  } else {
    await api("POST", "https://api.notion.com/v1/pages", {
      parent: { database_id: reviewsDb },
      properties: props,
    });
    console.log("created haorui");
  }

  // if david still exists as separate page after creating haorui, archive it
  const again = await queryAll(reviewsDb);
  for (const p of again) {
    const s = (plain(p.properties.slug) || plain(p.properties["标题"])).trim().toLowerCase();
    const name = plain(p.properties.name);
    if (s === "david" || /^david/i.test(name)) {
      await api("PATCH", `https://api.notion.com/v1/pages/${p.id}`, { archived: true });
      console.log("archived leftover david page", p.id.slice(0, 8));
    }
  }

  console.log("OK · Notion 评价已换为郝蕊 / r3");
}

main().catch((e) => {
  console.error(e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
