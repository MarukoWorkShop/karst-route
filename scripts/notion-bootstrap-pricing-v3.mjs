#!/usr/bin/env node
/**
 * 报价三层架构启动：
 * - 建 餐食 / 门票 / 杂项 产品库并灌种子
 * - 按日一行增加点选列（早中晚餐、门票、小费杂项）
 * - 旧「成本模块」表改名归档（不再同步）
 *
 *   npm run content:notion:bootstrap-v3
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

const title = (name) => ({ [name]: { title: {} } });
const rich = (name) => ({ [name]: { rich_text: {} } });
const num = (name) => ({ [name]: { number: { format: "number" } } });
const checkbox = (name) => ({ [name]: { checkbox: {} } });
const select = (name, options) => ({
  [name]: { select: { options: options.map((o) => ({ name: o, color: "default" })) } },
});
const relation = (name, databaseId) => ({
  [name]: { relation: { database_id: databaseId, single_property: {} } },
});

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "").slice(0, 2000) } }] });
const nb = (v) => ({
  number: v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v),
});
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });
const cb = (v) => ({ checkbox: !!v });
const ttl = (v) => ({ title: [{ text: { content: String(v ?? "").slice(0, 200) || "-" } }] });

const cfgPath = path.join(root, "content", "notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const dbs = cfg.databases || {};

const parentFrom = async (dbId) => {
  const meta = await notion(`/databases/${dash(dbId)}`);
  return meta.parent?.page_id;
};

const parentPageId = await parentFrom(dbs.pricingHotels || dbs.pricing);
if (!parentPageId) throw new Error("找不到父页面");

async function ensureCatalog(key, label, properties, rows) {
  if (dbs[key]) {
    console.log(`已有 ${key}，跳过建表`);
    return { id: dash(dbs[key]), created: false };
  }
  console.log(`建表：${label}…`);
  const db = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: label } }],
      properties,
    }),
  });
  for (const row of rows) {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: db.id }, properties: row }),
    });
  }
  console.log(`  ${rows.length} 条种子 · ${db.url}`);
  return { id: db.id, created: true, url: db.url };
}

const STATUS = ["启用", "停用"];
const MEAL_TYPES = ["早餐", "中餐", "晚餐", "通用"];
const MISC_CATS = ["小费", "接送", "签证", "打包体验", "其他"];
const SPLITS = ["per_person", "per_group_split", "per_vehicle_split", "per_room_split"];

const meals = await ensureCatalog(
  "pricingMeals",
  "报价·餐食产品",
  {
    ...title("标题"),
    ...rich("代号"),
    ...rich("名称英文"),
    ...select("餐型", MEAL_TYPES),
    ...num("成人价"),
    ...num("儿童价"),
    ...select("状态", STATUS),
    ...rich("备注"),
  },
  [
    {
      标题: ttl("通用早餐"),
      代号: rt("meal-breakfast"),
      名称英文: rt("Breakfast"),
      餐型: sl("早餐"),
      成人价: nb(50),
      儿童价: nb(30),
      状态: sl("启用"),
    },
    {
      标题: ttl("特色中餐"),
      代号: rt("meal-lunch"),
      名称英文: rt("Lunch"),
      餐型: sl("中餐"),
      成人价: nb(100),
      儿童价: nb(60),
      状态: sl("启用"),
    },
    {
      标题: ttl("海鲜小火锅晚餐"),
      代号: rt("meal-dinner-hotpot"),
      名称英文: rt("Seafood hotpot dinner"),
      餐型: sl("晚餐"),
      成人价: nb(100),
      儿童价: nb(60),
      状态: sl("启用"),
      备注: rt("下龙样例"),
    },
    {
      标题: ttl("皇帝餐晚餐"),
      代号: rt("meal-dinner-emperor"),
      名称英文: rt("Emperor dinner"),
      餐型: sl("晚餐"),
      成人价: nb(100),
      儿童价: nb(60),
      状态: sl("启用"),
    },
    {
      标题: ttl("莲花中餐"),
      代号: rt("meal-lunch-lotus"),
      名称英文: rt("Lotus lunch"),
      餐型: sl("中餐"),
      成人价: nb(150),
      儿童价: nb(80),
      状态: sl("启用"),
      备注: rt("河内样例"),
    },
  ],
);

const tickets = await ensureCatalog(
  "pricingTickets",
  "报价·门票产品",
  {
    ...title("标题"),
    ...rich("代号"),
    ...rich("名称英文"),
    ...num("成人价"),
    ...num("儿童价"),
    ...checkbox("默认可现付"),
    ...select("状态", STATUS),
    ...rich("备注"),
  },
  [
    {
      标题: ttl("德天瀑布门票"),
      代号: rt("ticket-detian"),
      名称英文: rt("Detian Falls"),
      成人价: nb(185),
      儿童价: nb(90),
      默认可现付: cb(false),
      状态: sl("启用"),
    },
    {
      标题: ttl("明仕观光"),
      代号: rt("ticket-mingshi"),
      名称英文: rt("Mingshi"),
      成人价: nb(100),
      儿童价: nb(50),
      默认可现付: cb(false),
      状态: sl("启用"),
    },
    {
      标题: ttl("建水小火车+普者黑柳叶舟"),
      代号: rt("ticket-jianshui-puzhehei"),
      名称英文: rt("Jianshui train + Puzhehei boat"),
      成人价: nb(320),
      儿童价: nb(160),
      默认可现付: cb(false),
      状态: sl("启用"),
    },
    {
      标题: ttl("东风韵+电瓶车+温泉"),
      代号: rt("ticket-mile-pack"),
      名称英文: rt("Mile pack"),
      成人价: nb(266),
      儿童价: nb(130),
      默认可现付: cb(false),
      状态: sl("启用"),
    },
  ],
);

const misc = await ensureCatalog(
  "pricingMisc",
  "报价·杂项产品",
  {
    ...title("标题"),
    ...rich("代号"),
    ...rich("名称英文"),
    ...select("类别", MISC_CATS),
    ...select("分摊口径", SPLITS),
    ...num("成人价"),
    ...num("儿童价"),
    ...num("整团价"),
    ...select("状态", STATUS),
    ...rich("备注"),
  },
  [
    {
      标题: ttl("司机导游住宿小费"),
      代号: rt("misc-tip-daily"),
      名称英文: rt("Daily tip"),
      类别: sl("小费"),
      分摊口径: sl("per_person"),
      成人价: nb(120),
      儿童价: nb(120),
      状态: sl("启用"),
    },
    {
      标题: ttl("南宁接机"),
      代号: rt("misc-airport-pickup"),
      名称英文: rt("Airport pickup"),
      类别: sl("接送"),
      分摊口径: sl("per_group_split"),
      整团价: nb(100),
      状态: sl("启用"),
    },
    {
      标题: ttl("五星游轮+吉婆缆车等打包"),
      代号: rt("misc-halong-pack"),
      名称英文: rt("Ha Long experience pack"),
      类别: sl("打包体验"),
      分摊口径: sl("per_person"),
      成人价: nb(969),
      儿童价: nb(969),
      状态: sl("启用"),
      备注: rt("样例 969/人"),
    },
  ],
);

// 按日一行补点选列
if (dbs.pricingDaySheet) {
  console.log("补列：按日一行点选餐/票/杂项…");
  await notion(`/databases/${dash(dbs.pricingDaySheet)}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        ...relation("早餐产品", meals.id),
        ...relation("中餐产品", meals.id),
        ...relation("晚餐产品", meals.id),
        ...relation("门票1产品", tickets.id),
        ...relation("门票2产品", tickets.id),
        ...relation("小费产品", misc.id),
        ...relation("杂项产品", misc.id),
      },
    }),
  });
}

// 当日其他表已废弃：杂项在按日一行点选「杂项产品」
if (dbs.pricingDayExtras) {
  console.log("删除旧「当日其他」表…");
  try {
    await notion(`/databases/${dash(dbs.pricingDayExtras)}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
  } catch (e) {
    console.log("  ", e.message);
  }
  delete dbs.pricingDayExtras;
}

// 删除旧表（Notion API = archived 进回收站）
async function trashDb(id, label) {
  if (!id) return;
  console.log(`删除 ${label}…`);
  try {
    await notion(`/databases/${dash(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });
    console.log("  → 已进回收站");
  } catch (e) {
    console.log("  ", e.message);
  }
}
await trashDb(dbs.pricingModules, "旧成本模块（七模块）");
await trashDb(dbs.pricingDays, "旧按日明细多行");

// 回写 notion.yaml
dbs.pricingMeals = uuid(meals.id);
dbs.pricingTickets = uuid(tickets.id);
dbs.pricingMisc = uuid(misc.id);
delete dbs.pricingModules;
delete dbs.pricingDays;

const header = `# Notion 数据库 ID（不是密钥）
# 报价三层：产品库 → 按日一行组合 → 人数验算
# 打开整页表格 → 分享 → 复制链接里 32 位 ID

`;

const out = {
  databases: {
    routes: dbs.routes,
    itineraries: dbs.itineraries,
    destinations: dbs.destinations,
    guidebooks: dbs.guidebooks,
    reviews: dbs.reviews,
    faqs: dbs.faqs,
    partners: dbs.partners,
    hero: dbs.hero,
    about: dbs.about,
    aboutCreds: dbs.aboutCreds,
    pricing: dbs.pricing,
    pricingAnchors: dbs.pricingAnchors,
    pricingHotels: dbs.pricingHotels,
    pricingVehicles: dbs.pricingVehicles,
    pricingGuides: dbs.pricingGuides,
    pricingMeals: dbs.pricingMeals,
    pricingTickets: dbs.pricingTickets,
    pricingMisc: dbs.pricingMisc,
    pricingDaySheet: dbs.pricingDaySheet,
    pricingValidate: dbs.pricingValidate,
  },
};

fs.writeFileSync(cfgPath, header + stringifyYaml(out, { lineWidth: 0 }));
console.log("已更新 content/notion.yaml");

console.log(`
完成三层产品库。
  餐食  ${meals.url || "(已有)"}
  门票  ${tickets.url || "(已有)"}
  杂项  ${misc.url || "(已有)"}

下一步：npm run content:notion
线路日上请点选：早餐/中餐/晚餐、门票、杂项（含小费）产品。
`);
