#!/usr/bin/env node
/**
 * 把报价相关表排布成三大项目（侧栏清晰）：
 *   报价
 *   ├─ 产品库
 *   ├─ 线路逐日明细
 *   └─ 人数验算
 *
 * Notion API 无法改数据库/页面父级，因此：
 * 1) 建/复用枢纽页与三个分区页，页内 link_to_page 挂子表
 * 2) 子表标题改成「大类 · 子项」
 * 3) 整理「网站内容优化」上「二、报价模块」的标题与入口，使三层一目了然
 *
 *   npm run content:notion:organize-sections
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const VERSION = "2022-06-28";
const root = process.cwd();

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const dash = (raw) => {
  const h = String(raw).replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const uuid = (id) => String(id).replace(/-/g, "");

async function notion(pathname, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || JSON.stringify(body)}`);
  return body;
}

const cfgPath = path.join(root, "content", "notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const dbs = cfg.databases || {};

/** 网站内容优化（总表格） */
const CONTENT_PAGE = "3d0d5dfd-82c4-8082-878d-c4aed3ab577f";
/** 二、报价模块 */
const QUOTE_H2 = "3d2d5dfd-82c4-803b-afbd-e439075f18e8";
/** 旧：1）供应链…（其下挂了三层分区页） */
const OLD_H3_SUPPLY = "3d6d5dfd-82c4-8046-9468-ccbad94021ae";
/** 旧：2）产品管理… */
const OLD_H3_PRODUCT = "3d6d5dfd-82c4-807d-8f72-f9537b2c9b8b";
/** 旧：3）市场管理…（人数验算表挂在这里，且曾落在「二」之外） */
const OLD_H3_MARKET = "3d6d5dfd-82c4-80db-b4c9-ddc49238b0db";

async function listChildren(pageId) {
  const out = [];
  let cursor;
  do {
    const q = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
    const body = await notion(`/blocks/${dash(pageId)}/children${q}`);
    out.push(...(body.results || []));
    cursor = body.has_more ? body.next_cursor : null;
  } while (cursor);
  return out;
}

async function setHeadingText(blockId, type, text, { toggleable } = {}) {
  const payload = {
    rich_text: [{ type: "text", text: { content: text } }],
  };
  if (typeof toggleable === "boolean") payload.is_toggleable = toggleable;
  await notion(`/blocks/${dash(blockId)}`, {
    method: "PATCH",
    body: JSON.stringify({ [type]: payload }),
  });
}

async function appendAfter(parentId, afterBlockId, children) {
  await notion(`/blocks/${dash(parentId)}/children`, {
    method: "PATCH",
    body: JSON.stringify({
      children,
      ...(afterBlockId ? { after: dash(afterBlockId) } : {}),
    }),
  });
}

async function setPageTitle(pageId, title) {
  await notion(`/pages/${dash(pageId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      archived: false,
      properties: {
        title: { title: [{ type: "text", text: { content: title } }] },
      },
    }),
  });
}

async function findOrCreateChildPage(parentId, title, blurb) {
  const kids = await listChildren(parentId);
  const existing = kids.find((b) => b.type === "child_page" && b.child_page?.title === title);
  if (existing) {
    await notion(`/pages/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: false }),
    }).catch(() => {});
    return existing.id;
  }
  // 也认 yaml 里已有的分区页（可能挂在标题块下，不在 parent 直系）
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: dash(parentId) },
      properties: {
        title: { title: [{ type: "text", text: { content: title } }] },
      },
      children: [
        {
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: blurb } }],
          },
        },
      ],
    }),
  });
  return page.id;
}

async function resolveSectionPage(preferredId, parentId, title, blurb) {
  if (preferredId) {
    try {
      await setPageTitle(preferredId, title);
      return dash(preferredId);
    } catch (e) {
      console.warn(`  复用 ${title} 失败，将新建:`, e.message);
    }
  }
  return findOrCreateChildPage(parentId, title, blurb);
}

async function clearPageBody(pageId) {
  const kids = await listChildren(pageId);
  for (const b of kids) {
    // 保留子页与内嵌数据库本体；清掉说明/链接等可重建块
    if (b.type === "child_page" || b.type === "child_database") continue;
    try {
      await notion(`/blocks/${b.id}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
  }
}

async function renameDb(dbId, title) {
  await notion(`/databases/${dash(dbId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: [{ type: "text", text: { content: title } }],
    }),
  });
}

async function appendChildren(parentId, children) {
  // Notion 单次最多 100 块
  for (let i = 0; i < children.length; i += 90) {
    const chunk = children.slice(i, i + 90);
    await notion(`/blocks/${dash(parentId)}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: chunk }),
    });
  }
}

function rt(content, annotations = {}) {
  return [{ type: "text", text: { content }, annotations }];
}

function para(content) {
  return { type: "paragraph", paragraph: { rich_text: rt(content) } };
}

function h3(content) {
  return { type: "heading_3", heading_3: { rich_text: rt(content), is_toggleable: false } };
}

function bullet(content) {
  return {
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: rt(content) },
  };
}

function linkDb(databaseId) {
  return {
    type: "link_to_page",
    link_to_page: { type: "database_id", database_id: dash(databaseId) },
  };
}

function linkPage(pageId) {
  return {
    type: "link_to_page",
    link_to_page: { type: "page_id", page_id: dash(pageId) },
  };
}

/** @type {{ section: string, blurb: string, items: { key: string, name: string, note: string }[] }[]} */
const TREE = [
  {
    section: "产品库",
    blurb: "维护可售产品与基准价。停用即可下线，不同步进站。",
    items: [
      { key: "pricingHotels", name: "酒店", note: "双人间含早价" },
      { key: "pricingVehicles", name: "车型", note: "日包价 · 最大载客" },
      { key: "pricingGuides", name: "导游", note: "日费用 · 分摊方式" },
      { key: "pricingMeals", name: "餐食", note: "早/中/晚餐成人·儿童价" },
      { key: "pricingTickets", name: "门票", note: "成人·儿童价 · 现付默认" },
      { key: "pricingMisc", name: "杂项", note: "小费 / 接送 / 打包体验等" },
    ],
  },
  {
    section: "线路逐日明细",
    blurb: "按线路组合产品：参数 → 一天一行。",
    items: [
      { key: "pricing", name: "线路参数", note: "加成率 · 团队固定 · 线路名称/总览" },
      { key: "pricingDaySheet", name: "按日一行", note: "点选房/车/导/餐/票/杂项（产品库）" },
    ],
  },
  {
    section: "人数验算",
    blurb: "同步后自动刷新；与官网同一公式。含验算表、房差、市场报价档。",
    items: [
      { key: "pricingValidate", name: "人数验算表", note: "2/4/6/8/10 成人单价 · 儿童单价 · 全成人总价" },
      {
        key: "pricingRoomDiff",
        name: "房差算法表",
        note: "双人间÷2（对齐附注）· 按日 + 线路合计",
      },
      {
        key: "pricingMarketTiers",
        name: "市场报价档",
        note: "2–3 / 4–6 / 7–10 网络卖价 · 官网卡片区间",
      },
    ],
  },
];

console.log("内容父页（网站内容优化）", CONTENT_PAGE);

// ——— 1) 枢纽页「报价」———
let hubPageId = cfg.pricingSections?.hub ? dash(cfg.pricingSections.hub) : null;
if (hubPageId) {
  try {
    await setPageTitle(hubPageId, "报价");
  } catch (e) {
    console.warn("既有枢纽页不可用，将新建:", e.message);
    hubPageId = null;
  }
}
if (!hubPageId) {
  hubPageId = await findOrCreateChildPage(
    CONTENT_PAGE,
    "报价",
    "三层：产品库 → 线路逐日明细 → 人数验算",
  );
}
console.log("枢纽页", hubPageId);

const sectionIds = {};
const prev = cfg.pricingSections || {};

for (const group of TREE) {
  const pref =
    group.section === "产品库"
      ? prev.products
      : group.section === "线路逐日明细"
        ? prev.daySheet
        : prev.validate;
  const pageId = await resolveSectionPage(pref, hubPageId, group.section, group.blurb);
  sectionIds[group.section] = pageId;
  await clearPageBody(pageId);

  const children = [para(group.blurb)];
  for (const item of group.items) {
    const id = dbs[item.key];
    if (!id) {
      console.log(`  跳过缺失 ${item.key}`);
      continue;
    }
    const fullTitle = `${group.section} · ${item.name}`;
    await renameDb(id, fullTitle);
    console.log(`  改名 ${fullTitle}`);
    children.push(h3(item.name));
    children.push(para(item.note));
    children.push(linkDb(id));
  }

  await appendChildren(pageId, children);
  console.log(`✓ ${group.section}（${group.items.length} 个子项）`);
}

await clearPageBody(hubPageId);
await appendChildren(hubPageId, [
  para("对内报价 CMS。按三层打开分区；侧栏子表标题为「大类 · 子项」。"),
  bullet("① 产品库 — 卖什么、什么价"),
  bullet("② 线路逐日明细 — 按日点选组合"),
  bullet("③ 人数验算 — 标杆价 / 房差 / 市场档"),
  h3("① 产品库"),
  para("酒店 · 车型 · 导游 · 餐食 · 门票 · 杂项"),
  linkPage(sectionIds["产品库"]),
  h3("② 线路逐日明细"),
  para("线路参数 · 按日一行"),
  linkPage(sectionIds["线路逐日明细"]),
  h3("③ 人数验算"),
  para("人数验算表 · 房差算法表 · 市场报价档"),
  linkPage(sectionIds["人数验算"]),
]);
console.log("✓ 枢纽「报价」已写三层入口");

// ——— 2) 整理总表格「二、报价」：只保留一份三层，不再复制人数验算入口 ———
console.log("整理「网站内容优化 → 二、报价（三层）」…");

await setHeadingText(QUOTE_H2, "heading_2", "二、报价（三层）", { toggleable: true });
await setHeadingText(OLD_H3_SUPPLY, "heading_3", "〇 三层分区页", { toggleable: true });
await setHeadingText(OLD_H3_PRODUCT, "heading_3", "② 线路逐日明细", { toggleable: true });
await setHeadingText(OLD_H3_MARKET, "heading_3", "③ 人数验算", { toggleable: true });

// 清掉「二」下脚本生成的重复导航（保留子页、库、固定标题 〇/②）
{
  const keepHeading = new Set([uuid(OLD_H3_SUPPLY), uuid(OLD_H3_PRODUCT)]);
  const kids = await listChildren(QUOTE_H2);
  for (const b of kids) {
    if (b.type === "child_page" || b.type === "child_database") continue;
    if (b.type === "heading_3" && keepHeading.has(uuid(b.id))) continue;
    const text =
      b.type === "paragraph"
        ? (b.paragraph?.rich_text || []).map((t) => t.plain_text).join("")
        : b.type === "heading_3"
          ? (b.heading_3?.rich_text || []).map((t) => t.plain_text).join("")
          : "";
    // 保留「① 产品库」标题；删掉旧的枢纽/入口/重复说明
    if (b.type === "heading_3" && text === "① 产品库") continue;
    if (
      b.type === "heading_3" ||
      b.type === "paragraph" ||
      b.type === "link_to_page" ||
      b.type === "bulleted_list_item"
    ) {
      try {
        await notion(`/blocks/${b.id}`, { method: "DELETE" });
      } catch {
        /* ignore */
      }
    }
  }
}

// 确保有「① 产品库」标题（在 〇 之后）
{
  const kids = await listChildren(QUOTE_H2);
  const hasProductHeading = kids.some(
    (b) =>
      b.type === "heading_3" &&
      (b.heading_3?.rich_text || []).map((t) => t.plain_text).join("") === "① 产品库",
  );
  if (!hasProductHeading) {
    await appendAfter(QUOTE_H2, OLD_H3_SUPPLY, [h3("① 产品库")]);
  }
  // 一句总说明（避免重复）
  const hasIntro = kids.some(
    (b) =>
      b.type === "paragraph" &&
      (b.paragraph?.rich_text || []).map((t) => t.plain_text).join("").includes("产品库 → 线路逐日明细 → 人数验算"),
  );
  if (!hasIntro) {
    await appendAfter(QUOTE_H2, OLD_H3_SUPPLY, [
      para("结构：产品库 → 线路逐日明细 → 人数验算。每层只保留一份入口。"),
    ]);
  }
}

// ③ 人数验算：只留验算表本体 + 一条分区页链接（房差/市场档在分区页内，不在总表再挂一套）
{
  const kids = await listChildren(OLD_H3_MARKET);
  for (const b of kids) {
    if (b.type === "child_database") continue;
    try {
      await notion(`/blocks/${b.id}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
  }
  await appendChildren(OLD_H3_MARKET, [
    para("验算表在下；房差与市场报价档在「人数验算」分区页内。"),
    linkPage(sectionIds["人数验算"]),
  ]);
  console.log("✓ ③ 人数验算（单套）");
}

// 〇 分区页说明
{
  const kids = await listChildren(OLD_H3_SUPPLY);
  for (const b of kids) {
    if (b.type === "paragraph") {
      try {
        await notion(`/blocks/${b.id}`, { method: "DELETE" });
      } catch {
        /* ignore */
      }
    }
  }
  await appendChildren(OLD_H3_SUPPLY, [
    para("点进三个分区页看完整子表。下方 ①②③ 是同层数据表快捷入口。"),
  ]);
}

const outSections = {
  hub: uuid(hubPageId),
  products: uuid(sectionIds["产品库"]),
  daySheet: uuid(sectionIds["线路逐日明细"]),
  validate: uuid(sectionIds["人数验算"]),
};

// 保留 notion.yaml 里非 databases/pricingSections 的其它键（若有）
const { databases: _d, pricingSections: _p, ...rest } = cfg;
const header = `# Notion 数据库 ID（不是密钥）
# 报价树：报价 → 产品库 / 线路逐日明细 / 人数验算（pricingSections）
# 打开整页表格 → 分享 → 复制链接里 32 位 ID

`;

fs.writeFileSync(
  cfgPath,
  header + stringifyYaml({ databases: dbs, pricingSections: outSections, ...rest }, { lineWidth: 0 }),
);

console.log(`
完成排布。

总表格「网站内容优化」：
  https://www.notion.so/${uuid(CONTENT_PAGE)}

结构：
  一、网站内容更新
  二、报价（三层）
    ├─ 〇 三层分区页 → 产品库 / 线路逐日明细 / 人数验算
    ├─ ① 产品库（六表）
    ├─ ② 线路逐日明细（两表）
    └─ ③ 人数验算（验算表 + 分区页；房差/市场档只在分区页）

枢纽「报价」：
  https://www.notion.so/${uuid(hubPageId)}
`);
