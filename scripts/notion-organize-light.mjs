#!/usr/bin/env node
/**
 * 轻体验两层整理：
 * 1) 确认「轻体验清单」挂在「轻体验栏目」容器下（Notion 多 data source）
 * 2) 用 content/experiences.yaml 全量回写六行栏目介绍
 * 3) 刷新「轻体验 · YAML 映射说明」（覆盖栏目 + SKU 两层）
 *
 * Usage: node scripts/notion-organize-light.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const VERSION = "2025-09-03";

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
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const doc = parseYaml(fs.readFileSync(path.join(root, "content/experiences.yaml"), "utf8"));
const items = Array.isArray(doc.items) ? doc.items : [];

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "").replace(/.*\/([0-9a-f]{32}).*/i, "$1");
  const h = hex.match(/^[0-9a-f]{32}$/i)?.[0];
  if (!h) throw new Error(`bad id: ${raw}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function api(method, urlPath, body) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${data.message || res.statusText}`);
  return data;
}

async function querySource(sourceId) {
  const id = uuid(sourceId);
  const pages = [];
  let cursor;
  do {
    const body = await api("POST", `/data_sources/${id}/query`, {
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

function relPath(p) {
  const s = String(p ?? "").trim();
  if (!s) return "";
  const m = s.match(/(?:^|\/)((?:light|destinations|tours|reviews)\/[^\s?#]+)/);
  if (m) return m[1];
  return s.replace(/^\//, "");
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

const catDbId = uuid(cfg.databases.lightExperiences);
const catSourceId = uuid(cfg.dataSources?.lightExperiences || cfg.databases.lightExperiences);
const skuSourceId = uuid(cfg.dataSources?.lightSkus || cfg.databases.lightSkus);

// --- 1. 确认层级（清单应为栏目容器下的 data source） ---
const catMeta = await api("GET", `/databases/${catDbId}`);
const sources = Array.isArray(catMeta.data_sources) ? catMeta.data_sources : [];
const hasSku = sources.some((s) => uuid(s.id) === skuSourceId || /清单/i.test(s.name || ""));
const hasCat = sources.some((s) => uuid(s.id) === catSourceId || /栏目|文案/i.test(s.name || ""));
console.log(
  "容器：",
  catMeta.title?.map((t) => t.plain_text).join("") || catDbId,
  "→ sources:",
  sources.map((s) => `${s.name}(${s.id})`).join(", "),
);
if (hasSku && hasCat) {
  console.log("层级 OK：「轻体验清单」已在「轻体验栏目」容器下");
} else if (hasSku) {
  console.log("清单已挂在容器下；栏目源名称请在 Notion 侧核对");
} else {
  console.warn("未在栏目容器下找到清单 data source，请检查 content/notion.yaml");
}

// 容器标题 / 描述写清两层
try {
  await api("PATCH", `/databases/${catDbId}`, {
    title: [{ type: "text", text: { content: "轻体验" } }],
    description: [
      {
        type: "text",
        text: {
          content:
            "两层：① data source「轻体验栏目」= 六大品类介绍 → experiences.yaml；②「轻体验清单」= 可售 SKU → light-skus.yaml。改完跑 npm run content:notion。",
        },
      },
    ],
  });
  console.log("已更新容器标题/描述为「轻体验」");
} catch (e) {
  console.warn("更新容器描述失败：", e.message);
}

// --- 2. 回写六行栏目 ---
const pages = await querySource(catSourceId);
let n = 0;
for (const item of items) {
  if (!item?.id) continue;
  const page = pages.find((p) => plain(p.properties?.id) === item.id);
  if (!page) {
    console.warn(`跳过：Notion 无 id=${item.id}`);
    continue;
  }
  const gallery = Array.isArray(item.gallery) ? item.gallery.map(relPath).filter(Boolean).join("\n") : "";
  await api("PATCH", `/pages/${page.id}`, {
    properties: {
      标题: title(`${item.id} · ${tx(item.title, "zh") || item.id}`),
      badge: rich(typeof item.badge === "string" ? item.badge : tx(item.badge, "en") || ""),
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
      cover: rich(relPath(item.cover)),
      gallery: rich(gallery),
      desc1_zh: rich(tx(item.desc?.[0], "zh")),
      desc1_en: rich(tx(item.desc?.[0], "en")),
      desc2_zh: rich(tx(item.desc?.[1], "zh")),
      desc2_en: rich(tx(item.desc?.[1], "en")),
      highlights_zh: rich(lines(item.highlights, "zh")),
      highlights_en: rich(lines(item.highlights, "en")),
      included_zh: rich(lines(item.included, "zh")),
      included_en: rich(lines(item.included, "en")),
      note: rich(
        "栏目级介绍（大卡）。可售小产品与参考价请改同容器下「轻体验清单」SKU。改完跑 npm run content:notion。",
      ),
    },
  });
  n++;
  console.log(`栏目已同步：${item.id}`);
}
console.log(`栏目回写 ${n} 行`);

// 核对 SKU 行数
try {
  const skus = await querySource(skuSourceId);
  console.log(`清单 SKU 行数：${skus.length}`);
} catch (e) {
  console.warn("读取清单失败：", e.message);
}

// --- 3. 刷新映射说明 ---
const hubParent = catMeta.parent?.page_id;
const MAP_TITLE = "轻体验 · YAML 映射说明";
let mapPageId = "";
if (hubParent) {
  let cursor;
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await api("GET", `/blocks/${hubParent}/children?${q}`);
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
    "轻体验两层（同一 Notion 容器「轻体验」下两个 data source）：①「轻体验栏目」= 首页六张品类大卡介绍；②「轻体验清单」= 可售 SKU（详情小产品、桃心、参考价）。改完跑 npm run content:notion。",
  ),
  h("层级"),
  b("容器「轻体验」→ 内含两个表视图/数据源"),
  b("轻体验栏目（上）→ content/experiences.yaml → 首页六卡 + 详情右侧介绍"),
  b("轻体验清单（下，同容器）→ content/light-skus.yaml → 详情 SKU + 兴趣清单计价"),
  h("一、轻体验栏目（大块介绍）"),
  b("一行 = 一个栏目；id 只能选 hike / photo / village / foodfilm / craft / wellness，勿改名"),
  b("badge → 卡片右上角 / 大卡顶部小标签"),
  b("title_zh/en → 主标题"),
  b("tagline_zh/en → 副标题"),
  b("duration / group / season_* → 大卡三格参数"),
  b("cover → 首页卡片封面（public 相对路径，如 light/hike/hike-1.jpeg）"),
  b("gallery → 详情配图路径，一行一条（栏目级；SKU 另有 images）"),
  b("desc1_* / desc2_* → 大卡正文两段"),
  b("highlights_* →「体验内容」列表，一行一条"),
  b("included_* →「费用包含」标签，一行一条"),
  b("note → 内部备注，不同步"),
  b("本表不写 SKU 单价；价格在「轻体验清单」"),
  h("二、轻体验清单（SKU）"),
  b("id：SKU 键（climb、raft…），桃心与计价依赖它，勿随意改"),
  b("category：归属栏目，须与栏目 id 一致"),
  b("kind：route=活动小产品 · meal=线路餐食"),
  b("status：在售 / 季节性 / 暂缓（暂缓不上线）"),
  b("sort：同栏目排序"),
  b("title_* / blurb1_* / blurb2_*：标题与说明"),
  b("images：SKU 配图，一行一条 public 相对路径"),
  b("price_unit：person / raft / flat"),
  b("price_cny_1_3 · price_cny_4_plus：按人档位（元）"),
  b("raft_cny · raft_seats · price_flat_cny · min_pax：按筏 / 一口价 / 起订"),
  b("price_note_*：报价后补足信息（如 2 人一车、约 2 小时）"),
  h("三、改完怎么生效"),
  b("本地：npm run content:notion（.env.local 的 NOTION_TOKEN）"),
  b("线上：push 后 GitHub Actions 自动同步部署"),
  b("紧急可直接改仓库 experiences.yaml / light-skus.yaml"),
  h("四、注意"),
  b("儿童计入单价人数；3 岁以下免费只在网站提示"),
  b("英文站 USD/EUR 用参考汇率；人民币以清单为准"),
  b("图片只写 public 相对路径，不要贴 Notion 附件"),
];

if (mapPageId) {
  let cursor;
  const old = [];
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (cursor) q.set("start_cursor", cursor);
    const kids = await api("GET", `/blocks/${mapPageId}/children?${q}`);
    old.push(...(kids.results ?? []));
    cursor = kids.has_more ? kids.next_cursor : undefined;
  } while (cursor);
  for (const block of old) {
    await api("PATCH", `/blocks/${block.id}`, { archived: true });
  }
  for (let i = 0; i < mapChildren.length; i += 90) {
    await api("PATCH", `/blocks/${mapPageId}/children`, {
      children: mapChildren.slice(i, i + 90),
    });
  }
  console.log("已更新映射说明", mapPageId);
} else {
  console.warn("未找到映射说明页，跳过");
}

console.log("完成。");
