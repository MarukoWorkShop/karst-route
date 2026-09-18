#!/usr/bin/env node
/**
 * 把 content/experiences.yaml 里的 wellness 行写回 Notion「轻体验栏目」。
 * Usage: node scripts/push-notion-wellness.mjs
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
const doc = parseYaml(fs.readFileSync(path.join(root, "content/experiences.yaml"), "utf8"));
const item = (doc.items ?? []).find((x) => x && x.id === "wellness");
if (!item) {
  console.error("content/experiences.yaml 里找不到 wellness");
  process.exit(1);
}

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

const dbId = cfg.databases?.lightExperiences;
if (!dbId) {
  console.error("content/notion.yaml 缺少 databases.lightExperiences");
  process.exit(1);
}

const pages = await queryAll(dbId);
const page = pages.find((p) => plain(p.properties?.id) === "wellness");
if (!page) {
  console.error("Notion 轻体验栏目里找不到 id=wellness 的行");
  process.exit(1);
}

const gallery = Array.isArray(item.gallery) ? item.gallery.join("\n") : "";
const note = [
  "文档报价：太极 1–3人 300元/人；4–10人 200元/人。",
  "自然体验按场地时长询价。",
  "按摩：精油1.5h / 无油1h / 足浴肩部；提前一天预订（文档未标人民币单价）。",
].join(" ");

await api("PATCH", `https://api.notion.com/v1/pages/${page.id}`, {
  properties: {
    标题: title(`wellness · ${tx(item.title, "zh") || "疗愈与放松"}`),
    badge: rich(item.badge || "WELLNESS & SPA"),
    title_zh: rich(tx(item.title, "zh")),
    title_en: rich(tx(item.title, "en")),
    tagline_zh: rich(tx(item.tagline, "zh")),
    tagline_en: rich(tx(item.tagline, "en")),
    duration_zh: rich(tx(item.duration, "zh")),
    duration_en: rich(tx(item.duration, "en")),
    group_zh: rich(tx(item.group, "zh")),
    group_en: rich(tx(item.group, "en")),
    season_zh: rich(tx(item.season, "zh")),
    season_en: rich(tx(item.season, "en")),
    cover: rich(item.cover || ""),
    gallery: rich(gallery),
    desc1_zh: rich(tx(item.desc?.[0], "zh")),
    desc1_en: rich(tx(item.desc?.[0], "en")),
    desc2_zh: rich(tx(item.desc?.[1], "zh")),
    desc2_en: rich(tx(item.desc?.[1], "en")),
    highlights_zh: rich(lines(item.highlights, "zh")),
    highlights_en: rich(lines(item.highlights, "en")),
    included_zh: rich(lines(item.included, "zh")),
    included_en: rich(lines(item.included, "en")),
    note: rich(note),
  },
});

console.log(`已更新 Notion wellness：${page.url || page.id}`);
