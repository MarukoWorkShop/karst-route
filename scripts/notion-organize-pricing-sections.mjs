#!/usr/bin/env node
/**
 * 把报价相关表排布成三大项目（侧栏清晰）：
 *   报价
 *   ├─ 产品库
 *   ├─ 线路逐日明细
 *   └─ 人数验算
 *
 * Notion API 无法改数据库父页面，因此：
 * 1) 建/复用三个分区页，页内 link_to_page 挂子表
 * 2) 子表标题改成「大类 · 子项」，根目录侧栏也能辨认
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

const parentFrom = async (dbId) => {
  const meta = await notion(`/databases/${dash(dbId)}`);
  const p = meta.parent;
  if (p?.type === "page_id") return p.page_id;
  if (p?.page_id) return p.page_id;
  console.error("unexpected parent", dbId, p);
  return null;
};
// 网站内容优化页（历史父页）；取不到时回退
const CONTENT_FALLBACK = "3d0d5dfd-82c4-8082-878d-c4aed3ab577f";
let contentPageId = null;
try {
  contentPageId = await parentFrom(dbs.pricingHotels || dbs.pricing);
} catch (e) {
  console.error("读父页失败:", e.message);
}
if (!contentPageId) contentPageId = CONTENT_FALLBACK;
console.log("内容父页", contentPageId);

async function listChildren(pageId) {
  const out = [];
  let cursor;
  do {
    const q = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
    const body = await notion(`/blocks/${pageId}/children${q}`);
    out.push(...(body.results || []));
    cursor = body.has_more ? body.next_cursor : null;
  } while (cursor);
  return out;
}

async function findOrCreateChildPage(parentId, title, blurb) {
  const kids = await listChildren(parentId);
  const existing = kids.find((b) => b.type === "child_page" && b.child_page?.title === title);
  if (existing) return existing.id;
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId },
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

async function clearPageBody(pageId) {
  const kids = await listChildren(pageId);
  for (const b of kids) {
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
    blurb: "按线路组合产品：参数 → 一天一行 → 无限其他。",
    items: [
      { key: "pricing", name: "线路参数", note: "加成率 · 团队固定 · 线路名称/总览" },
      { key: "pricingDaySheet", name: "按日一行", note: "点选房/车/导/餐/票/杂项（产品库）" },
    ],
  },
  {
    section: "人数验算",
    blurb: "同步后自动刷新；与官网同一公式。",
    items: [
      { key: "pricingValidate", name: "人数验算表", note: "2/4/6/8/10 成人单价 · 儿童单价 · 全成人总价" },
    ],
  },
];

console.log("建「报价」枢纽与三大分区…");
const hubId = cfg.pricingSections?.hub
  ? dash(cfg.pricingSections.hub)
  : await findOrCreateChildPage(contentPageId, "报价", "三层：产品库 → 线路逐日明细 → 人数验算");

// 确保枢纽页存在且标题正确
try {
  await notion(`/pages/${hubId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        title: { title: [{ type: "text", text: { content: "报价" } }] },
      },
    }),
  });
} catch {
  /* hub may be new below */
}

const hubPageId = await (async () => {
  const kids = await listChildren(contentPageId);
  const hit = kids.find((b) => b.type === "child_page" && b.child_page?.title === "报价");
  if (hit) return hit.id;
  return findOrCreateChildPage(contentPageId, "报价", "三层：产品库 → 线路逐日明细 → 人数验算");
})();

await clearPageBody(hubPageId);
await notion(`/blocks/${hubPageId}/children`, {
  method: "PATCH",
  body: JSON.stringify({
    children: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "对内报价 CMS。打开下方三个分区进入对应子表；侧栏里子表也带「大类 · 子项」前缀。",
              },
            },
          ],
        },
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "产品库 — 卖什么、什么价" } }],
        },
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "线路逐日明细 — 按日点选组合" } }],
        },
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "人数验算 — 2/4/6/8/10 标杆价" } }],
        },
      },
    ],
  }),
});

const sectionIds = {};

for (const group of TREE) {
  const pageId = await findOrCreateChildPage(hubPageId, group.section, group.blurb);
  sectionIds[group.section] = pageId;
  await clearPageBody(pageId);

  const children = [
    {
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: group.blurb } }],
      },
    },
  ];

  for (const item of group.items) {
    const id = dbs[item.key];
    if (!id) {
      console.log(`  跳过缺失 ${item.key}`);
      continue;
    }
    const fullTitle = `${group.section} · ${item.name}`;
    await renameDb(id, fullTitle);
    console.log(`  改名 ${fullTitle}`);
    children.push({
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: item.name } }],
      },
    });
    children.push({
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: item.note } }],
      },
    });
    children.push({
      type: "link_to_page",
      link_to_page: { type: "database_id", database_id: dash(id) },
    });
  }

  await notion(`/blocks/${pageId}/children`, {
    method: "PATCH",
    body: JSON.stringify({ children }),
  });
  console.log(`✓ ${group.section}（${group.items.length} 个子项）`);
}

const outSections = {
  hub: uuid(hubPageId),
  products: uuid(sectionIds["产品库"]),
  daySheet: uuid(sectionIds["线路逐日明细"]),
  validate: uuid(sectionIds["人数验算"]),
};

const header = `# Notion 数据库 ID（不是密钥）
# 报价树：报价 → 产品库 / 线路逐日明细 / 人数验算（pricingSections）
# 打开整页表格 → 分享 → 复制链接里 32 位 ID

`;

fs.writeFileSync(
  cfgPath,
  header + stringifyYaml({ databases: dbs, pricingSections: outSections }, { lineWidth: 0 }),
);

console.log(`
完成排布。
  打开 Notion 页面「报价」：
    ${hubPageId.replace(/-/g, "")}
  三大分区下已挂子表链接；表名已改为「大类 · 子项」。
  若侧栏仍有空的旧「报价 / 产品库 / …」页，进回收站删掉即可。
`);
