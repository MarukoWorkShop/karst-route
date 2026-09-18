#!/usr/bin/env node
/**
 * 在 Notion 建/刷新「轻体验清单」（SKU 可售小产品表），从 content/light-skus.yaml 填入，
 * 更新「轻体验 · YAML 映射说明」，并把 database id 写进 content/notion.yaml。
 *
 * 用法：
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-light-skus.mjs
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-light-skus.mjs --refill   # 已有表时清空后重填
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
const root = process.cwd();
const refill = process.argv.includes("--refill");

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

async function notion(url, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
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

function rt(v) {
  const s = String(v ?? "");
  // Notion rich_text max 2000 per chunk
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

function priceCols(price) {
  if (!price || typeof price !== "object") {
    return {
      price_unit: sl(null),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(null),
      raft_cny: num(null),
      raft_seats: num(null),
      min_pax: num(null),
    };
  }
  if (price.unit === "raft") {
    return {
      price_unit: sl("raft"),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(null),
      raft_cny: num(price.raftCny),
      raft_seats: num(price.seats ?? 2),
      min_pax: num(null),
    };
  }
  if (price.unit === "flat") {
    return {
      price_unit: sl("flat"),
      price_cny_1_3: num(null),
      price_cny_4_plus: num(null),
      price_flat_cny: num(price.flatCny),
      raft_cny: num(null),
      raft_seats: num(null),
      min_pax: num(null),
    };
  }
  const bands = Array.isArray(price.bands) ? [...price.bands].sort((a, b) => a.max - b.max) : [];
  const low = bands.find((b) => b.max <= 3)?.cny ?? bands[0]?.cny ?? null;
  const high = bands.find((b) => b.max >= 4)?.cny ?? bands[bands.length - 1]?.cny ?? null;
  return {
    price_unit: sl("person"),
    price_cny_1_3: num(low),
    price_cny_4_plus: num(high),
    price_flat_cny: num(null),
    raft_cny: num(null),
    raft_seats: num(null),
    min_pax: num(price.minPax ?? null),
  };
}

const STATUS_ZH = { live: "在售", seasonal: "季节性", paused: "暂缓" };
const CATS = ["hike", "photo", "village", "foodfilm", "craft", "wellness"];

// 父页面：轻体验栏目所在页
let parentPageId = "";
if (cfg.databases?.lightExperiences) {
  const db = await notion(`/databases/${uuid(cfg.databases.lightExperiences)}`);
  parentPageId = db.parent?.page_id ?? "";
}
if (!parentPageId && cfg.databases?.routes) {
  const db = await notion(`/databases/${uuid(cfg.databases.routes)}`);
  parentPageId = db.parent?.page_id ?? "";
}
if (!parentPageId) {
  console.error("拿不到父页面");
  process.exit(1);
}

// 若已有「轻体验清单」则复用
let dbId = cfg.databases?.lightSkus ? uuid(cfg.databases.lightSkus) : "";
if (dbId) {
  try {
    await notion(`/databases/${dbId}`);
    console.log("复用已有轻体验清单", dbId);
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
      if (b.type === "child_database" && b.child_database?.title === "轻体验清单") {
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
    kind: {
      select: {
        options: [
          { name: "route", color: "green" },
          { name: "meal", color: "orange" },
        ],
      },
    },
    status: {
      select: {
        options: [
          { name: "在售", color: "green" },
          { name: "季节性", color: "yellow" },
          { name: "暂缓", color: "gray" },
        ],
      },
    },
    sort: { number: {} },
    title_zh: { rich_text: {} },
    title_en: { rich_text: {} },
    blurb1_zh: { rich_text: {} },
    blurb1_en: { rich_text: {} },
    blurb2_zh: { rich_text: {} },
    blurb2_en: { rich_text: {} },
    images: { rich_text: {} },
    price_unit: {
      select: {
        options: [
          { name: "person", color: "blue" },
          { name: "raft", color: "purple" },
          { name: "flat", color: "pink" },
        ],
      },
    },
    price_cny_1_3: { number: {} },
    price_cny_4_plus: { number: {} },
    price_flat_cny: { number: {} },
    raft_cny: { number: {} },
    raft_seats: { number: {} },
    min_pax: { number: {} },
    price_note_zh: { rich_text: {} },
    price_note_en: { rich_text: {} },
    note: { rich_text: {} },
  };
  const payload = {
    title: [{ type: "text", text: { content: "轻体验清单" } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "运营/主理人用的可售小产品（SKU）货架。改完跑 npm run content:notion → content/light-skus.yaml → 网站。栏目级文案仍在「轻体验栏目」。",
        },
      },
    ],
    properties: schema,
  };
  let created;
  const catDb = cfg.databases?.lightExperiences
    ? uuid(cfg.databases.lightExperiences)
    : "";
  if (catDb) {
    try {
      created = await notion("/databases", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          parent: { type: "database_id", database_id: catDb },
        }),
      });
      console.log("建表挂在「轻体验栏目」下");
    } catch (e) {
      console.warn("挂栏目下失败，改挂父页面：", e.message);
    }
  }
  if (!created) {
    created = await notion("/databases", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        parent: { type: "page_id", page_id: parentPageId },
      }),
    });
  }
  dbId = created.id;
  console.log("建表：轻体验清单", dbId);
} else {
  console.log("使用表：轻体验清单", dbId);
}

const skusPath = path.join(root, "content", "light-skus.yaml");
const doc = parseYaml(fs.readFileSync(skusPath, "utf8")) ?? {};
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
  const blurbs = Array.isArray(it.blurb) ? it.blurb : [];
  const props = {
    标题: {
      title: [{ text: { content: `${it.id} · ${it.title?.zh ?? it.id}` } }],
    },
    id: rt(it.id),
    category: sl(it.category),
    kind: sl(it.kind === "meal" ? "meal" : "route"),
    status: sl(STATUS_ZH[it.status] ?? "在售"),
    sort: num(it.sort ?? null),
    title_zh: rt(it.title?.zh ?? ""),
    title_en: rt(it.title?.en ?? ""),
    blurb1_zh: rt(blurbs[0]?.zh ?? ""),
    blurb1_en: rt(blurbs[0]?.en ?? ""),
    blurb2_zh: rt(blurbs[1]?.zh ?? ""),
    blurb2_en: rt(blurbs[1]?.en ?? ""),
    images: rt((it.images ?? []).join("\n")),
    ...priceCols(it.price),
    price_note_zh: rt(it.priceNote?.zh ?? ""),
    price_note_en: rt(it.priceNote?.en ?? ""),
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
console.log(`已写入/更新 ${n} 条 SKU`);

// 回填 notion.yaml
let rawCfg = fs.readFileSync(cfgPath, "utf8");
if (/^\s*lightSkus:/m.test(rawCfg)) {
  rawCfg = rawCfg.replace(
    /^(\s*lightSkus:\s*)(?:"[^"]*"|'[^']*'|[^\s#]*)/m,
    `$1${uuid(dbId).replace(/-/g, "")}`,
  );
} else {
  rawCfg = rawCfg.replace(
    /^(\s*lightExperiences:\s*[^\n]+)/m,
    `$1\n  lightSkus: ${uuid(dbId).replace(/-/g, "")}`,
  );
}
fs.writeFileSync(cfgPath, rawCfg, "utf8");
console.log("已写入 content/notion.yaml → lightSkus");

// 更新映射说明页（同父页下）
const MAP_TITLE = "轻体验 · YAML 映射说明";
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
    "轻体验分两张表：①「轻体验栏目」= 首页六张品类卡；②「轻体验清单」= 可售小产品 SKU（详情里的路线/餐食、桃心、参考价、兴趣清单合计）。",
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
  b("sort：同栏目内排序，越小越靠前"),
  b("title_zh / title_en：卡片标题"),
  b("blurb1_* / blurb2_*：说明文案（报价句可写在这里，网站会剥掉「参考报价」避免与结构化价重复）"),
  b("images：一行一条，public/ 相对路径，如 light/hike/climb-1.jpeg"),
  b("price_unit：person=按人 / raft=按筏 / flat=一口价"),
  b("price_cny_1_3 / price_cny_4_plus：按人档位（元，十位取整）；只有一档时两格填同一数即可"),
  b("raft_cny / raft_seats：按筏计价"),
  b("price_flat_cny：一口价"),
  b("min_pax：起订人数（可选，展示用）"),
  b("price_note_zh / price_note_en：报价后补足信息，如「（2 人一车）· 驾驶约 50 分钟。」"),
  b("note：内部备注，不同步到网站"),
  h("三、改完怎么生效"),
  b("本地：npm run content:notion（.env.local 里 NOTION_TOKEN）"),
  b("线上：push 后 Actions 自动同步并部署"),
  b("紧急也可直接改仓库 content/light-skus.yaml / experiences.yaml"),
  h("四、注意事项"),
  b("儿童计入单价人数；3 岁以下免费只写在网站提示里，表里不必另设儿童价"),
  b("英文站美元/欧元用参考汇率换算，人民币以本表为准"),
  b("图片只写 public 相对路径，不要贴 Notion 附件链接"),
  b("删掉清单中的行或改成「暂缓」= 该 SKU 从网站下架"),
];

if (mapPageId) {
  // 清空旧块后追加
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
  // append in chunks of 100
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
  轻体验清单（数据表）  https://www.notion.so/${uuid(dbId).replace(/-/g, "")}
随后可跑：npm run content:notion
`);
