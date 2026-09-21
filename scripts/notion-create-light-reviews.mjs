#!/usr/bin/env node
/**
 * 在 Notion 建/刷新「轻体验评价」表，从 content/light-reviews.yaml 填入，
 * 更新「轻体验 · YAML 映射说明」，并把 database id 写进 content/notion.yaml。
 *
 * 用法：
 *   node scripts/notion-create-light-reviews.mjs
 *   node scripts/notion-create-light-reviews.mjs --refill
 *
 * photos 写 public 相对路径，如 light/reviews/hp-1.jpeg（与 COS 对象键一致）。
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
const VERSION_DS = "2025-09-03";
const root = process.cwd();
const refill = process.argv.includes("--refill");
const DB_TITLE = "轻体验评价";
const MAP_TITLE = "轻体验 · YAML 映射说明";
const CATS = ["hike", "photo", "village", "foodfilm", "craft", "wellness"];

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*NOTION_TOKEN\s*=\s*(.+?)\s*$/);
    if (m && !process.env.NOTION_TOKEN) {
      process.env.NOTION_TOKEN = m[1].replace(/^["']|["']$/g, "").trim();
    }
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfgPath = path.join(root, "content", "notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8")) ?? {};

const uuid = (v) => {
  const hex = String(v ?? "").replace(/-/g, "").trim();
  if (!/^[0-9a-f]{32}$/i.test(hex)) return "";
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

async function notion(url, init = {}, version = VERSION) {
  const res = await fetch(`https://api.notion.com/v1${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": version,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Notion ${res.status} ${body.message || res.statusText}`);
  }
  return body;
}

async function queryAll(dbId) {
  const out = [];
  let cursor;
  do {
    const body = await notion(`/databases/${dbId}/query`, {
      method: "POST",
      body: JSON.stringify({ start_cursor: cursor, page_size: 100 }),
    });
    out.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function parentOfDatabase(dbRaw) {
  const id = uuid(dbRaw);
  if (!id) return "";
  try {
    const db = await notion(`/databases/${id}`, {}, VERSION_DS);
    return db.parent?.page_id ?? "";
  } catch (e) {
    console.warn("读库父页失败：", e.message);
    return "";
  }
}

function rt(v) {
  const s = String(v ?? "");
  const chunks = [];
  for (let i = 0; i < s.length; i += 1800) chunks.push(s.slice(i, i + 1800));
  if (!chunks.length) chunks.push("");
  return { rich_text: chunks.map((content) => ({ text: { content } })) };
}
function sl(name) {
  return name ? { select: { name: String(name) } } : { select: null };
}
function num(v) {
  return v == null || v === "" || Number.isNaN(Number(v)) ? { number: null } : { number: Number(v) };
}

let parentPageId =
  (await parentOfDatabase(cfg.databases?.lightSkus)) ||
  (await parentOfDatabase(cfg.databases?.lightExperiences)) ||
  (await parentOfDatabase(cfg.databases?.routes));
if (!parentPageId) {
  console.error("拿不到父页面");
  process.exit(1);
}
console.log("父页面", parentPageId);

let dbId = cfg.databases?.lightReviews ? uuid(cfg.databases.lightReviews) : "";
if (dbId) {
  try {
    await notion(`/databases/${dbId}`);
    console.log("复用已有轻体验评价", dbId);
  } catch {
    dbId = "";
  }
}
if (!dbId) {
  let cursor;
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await notion(`/blocks/${parentPageId}/children?${q}`);
    for (const b of kids.results ?? []) {
      if (b.type === "child_database" && b.child_database?.title === DB_TITLE) {
        dbId = b.id;
      }
    }
    cursor = kids.has_more ? kids.next_cursor : undefined;
  } while (cursor && !dbId);
}

if (!dbId) {
  const schema = {
    标题: { title: {} },
    id: { rich_text: {} },
    category: {
      select: {
        options: CATS.map((name) => ({ name })),
      },
    },
    flag: { rich_text: {} },
    name: { rich_text: {} },
    country: { rich_text: {} },
    rating: { number: {} },
    date: { rich_text: {} },
    body_zh: { rich_text: {} },
    body_en: { rich_text: {} },
    photos: { rich_text: {} },
    src: {
      select: {
        options: [
          { name: "zh", color: "red" },
          { name: "en", color: "blue" },
        ],
      },
    },
    note: { rich_text: {} },
  };
  const payload = {
    title: [{ type: "text", text: { content: DB_TITLE } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "轻体验详情卡右侧「客人评价」。photos 一行一条，写 light/reviews/文件名.jpeg（与 COS / public 同路径）。改完跑 npm run content:notion → content/light-reviews.yaml。",
        },
      },
    ],
    properties: schema,
  };
  let created = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      parent: { type: "page_id", page_id: parentPageId },
    }),
  });
  dbId = created.id;
  console.log("建表：", DB_TITLE, dbId);
} else {
  console.log("使用表：", DB_TITLE, dbId);
}

const yamlPath = path.join(root, "content", "light-reviews.yaml");
const doc = parseYaml(fs.readFileSync(yamlPath, "utf8")) ?? {};
const srcLang = doc.src === "en" ? "en" : "zh";
const items = Array.isArray(doc.items) ? doc.items : [];

const existing = await queryAll(dbId);
const byId = new Map();
for (const page of existing) {
  const prop = page.properties?.id;
  const rid =
    prop?.rich_text?.map((t) => t.plain_text).join("").trim() ||
    page.properties?.标题?.title?.map((t) => t.plain_text).join("").trim();
  if (rid) byId.set(rid.split("·")[0].trim(), page.id);
}

if (refill) {
  for (const page of existing) {
    await notion(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
  }
  byId.clear();
  console.log(`已归档旧行 ${existing.length} 条`);
}

let n = 0;
for (const it of items) {
  if (!it?.id) continue;
  const body = it.body && typeof it.body === "object" ? it.body : {};
  const photos = Array.isArray(it.photos) ? it.photos : [];
  const label = `${it.id} · ${it.name || it.id}`;
  const props = {
    标题: { title: [{ text: { content: label.slice(0, 200) } }] },
    id: rt(it.id),
    category: sl(CATS.includes(it.category) ? it.category : null),
    flag: rt(it.flag ?? "✦"),
    name: rt(it.name ?? ""),
    country: rt(it.country ?? ""),
    rating: num(it.rating ?? 5),
    date: rt(it.date ?? ""),
    body_zh: rt(body.zh ?? ""),
    body_en: rt(body.en ?? ""),
    photos: rt(photos.join("\n")),
    src: sl(srcLang),
  };

  const pageId = byId.get(it.id);
  if (pageId && !refill) {
    await notion(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: props }),
    });
  } else {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: props,
      }),
    });
  }
  n++;
}
console.log(`已写入/更新 ${n} 条评价`);

let rawCfg = fs.readFileSync(cfgPath, "utf8");
const idFlat = uuid(dbId).replace(/-/g, "");
if (/^\s*lightReviews:/m.test(rawCfg)) {
  rawCfg = rawCfg.replace(/^(\s*lightReviews:\s*)(?:"[^"]*"|'[^']*'|[^\s#]*)/m, `$1${idFlat}`);
} else {
  rawCfg = rawCfg.replace(
    /^(\s*lightSkus:\s*[^\n]+)/m,
    `$1\n  # 轻体验详情右侧客人评价\n  lightReviews: ${idFlat}`,
  );
  if (!/^\s*lightReviews:/m.test(rawCfg)) {
    rawCfg = rawCfg.replace(
      /^(\s*lightExperiences:\s*[^\n]+)/m,
      `$1\n  lightReviews: ${idFlat}`,
    );
  }
}
fs.writeFileSync(cfgPath, rawCfg, "utf8");
console.log("已写入 content/notion.yaml → lightReviews");

let mapPageId = "";
{
  let cursor;
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await notion(`/blocks/${parentPageId}/children?${q}`);
    for (const b of kids.results ?? []) {
      if (b.type === "child_page" && b.child_page?.title === MAP_TITLE) mapPageId = b.id;
    }
    cursor = kids.has_more ? kids.next_cursor : undefined;
  } while (cursor && !mapPageId);
}

const h = (text) => ({
  object: "block",
  type: "heading_2",
  heading_2: { rich_text: [{ text: { content: text } }] },
});
const p = (text) => ({
  object: "block",
  type: "paragraph",
  paragraph: { rich_text: [{ text: { content: text } }] },
});
const b = (text) => ({
  object: "block",
  type: "bulleted_list_item",
  bulleted_list_item: { rich_text: [{ text: { content: text } }] },
});

const mapChildren = [
  p(
    "轻体验三张表：①「轻体验栏目」= 首页六张品类卡；②「轻体验清单」= 可售 SKU；③「轻体验评价」= 详情右侧客人评价。",
  ),
  h("一、轻体验栏目 → content/experiences.yaml"),
  b("一行一个栏目；id 只能是 hike / photo / village / foodfilm / craft / wellness"),
  b("badge / title_* / tagline_* / duration_* / group_* / season_* / cover / gallery / desc* / highlights_* / included_*"),
  b("栏目表不写 SKU 价格与小产品正文"),
  h("二、轻体验清单（SKU）→ content/light-skus.yaml"),
  b("id：SKU 稳定键（如 climb、raft），不要随意改名；网站桃心与计价靠它"),
  b("category：归属栏目（与栏目 id 一致）"),
  b("kind：route=活动小产品，meal=线路餐食"),
  b("status：在售 / 季节性 / 暂缓（非「在售」同步后网站不展示）"),
  b("images：一行一条，public/ 相对路径，如 light/hike/climb-1.jpeg"),
  b("价格列见原说明；note 不同步到网站"),
  h("三、轻体验评价 → content/light-reviews.yaml"),
  b("一行一条评价；按 category 出现在对应栏目详情右侧"),
  b("id：稳定键（如 hp-seed-box），不要随意改"),
  b("category：hike / photo / village / foodfilm / craft / wellness"),
  b("flag / name / country / rating / date：头像区展示"),
  b("body_zh / body_en：正文，各不超过约 999 字；src 指原文语言"),
  b("photos：一行一条，写 light/reviews/文件名.jpeg（本地 public + COS 同键；最多 4 张）"),
  b("与精品路线「客人评价」表无关；路线评价仍用 reviews/… 路径"),
  h("四、改完怎么生效"),
  b("本地：npm run content:notion（.env.local 里 NOTION_TOKEN）"),
  b("新评价图：放进 public/light/reviews/ → python3 scripts/cos-sync-public.py light/reviews → 再改 Notion/YAML"),
  b("线上：push 后 Actions 自动同步并部署"),
  h("五、注意事项"),
  b("图片只写 public 相对路径，不要贴 Notion 附件链接、不要写完整 COS URL"),
  b("COS 对象键必须与路径一致，例如 light/reviews/hp-1.jpeg"),
];

if (mapPageId) {
  let cursor;
  const old = [];
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await notion(`/blocks/${mapPageId}/children?${q}`);
    old.push(...(kids.results ?? []));
    cursor = kids.has_more ? kids.next_cursor : undefined;
  } while (cursor);
  for (const block of old) {
    await notion(`/blocks/${block.id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
  }
  for (let i = 0; i < mapChildren.length; i += 90) {
    await notion(`/blocks/${mapPageId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: mapChildren.slice(i, i + 90) }),
    });
  }
  console.log("已更新映射说明页", mapPageId);
} else {
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      properties: { title: { title: [{ text: { content: MAP_TITLE } }] } },
      children: mapChildren,
    }),
  });
  console.log("已新建映射说明页", page.url);
}

console.log(`
完成。
- Notion 表：${DB_TITLE}
- YAML：content/light-reviews.yaml
- 图：public/light/reviews/ ↔ COS light/reviews/
`);
