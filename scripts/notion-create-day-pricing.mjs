#!/usr/bin/env node
/**
 * 在 Notion 建「按日报价」四表：酒店 / 车型 / 导游 / 按日明细。
 * 默认从 content/notion-import/13–16 CSV 灌入种子。
 *
 * 用法：
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-day-pricing.mjs <父页面32位ID>
 *   npm run content:notion:init-days -- <父页面32位ID>
 *   只建空表：加 --empty
 *
 * 前置：父页面已连接该 Integration。
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

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

const args = process.argv.slice(2);
const empty = args.includes("--empty");
const pageArg = args.find((a) => a.startsWith("--page="));
const parentPageId = (pageArg ? pageArg.slice(7) : args.find((a) => !a.startsWith("--")) || "").trim();
const token = process.env.NOTION_TOKEN?.trim();

if (!token) {
  console.log("缺少 NOTION_TOKEN（.env.local 或环境变量）");
  process.exit(1);
}
if (!/^[0-9a-fA-F-]{32,36}$/.test(parentPageId)) {
  console.log("用法：npm run content:notion:init-days -- <父页面32位ID>");
  process.exit(1);
}

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
  if (!res.ok) {
    throw new Error(`Notion ${res.status} ${body.message || res.statusText}`);
  }
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

const ROUTES = ["r1", "r2", "r3"];
const LINE_TYPES = ["hotel", "vehicle", "guide", "ticket", "meal", "tip", "visa", "other"];
const SPLITS = ["per_room_split", "per_vehicle_split", "per_person", "per_group_split"];
const STATUS = ["启用", "停用"];
const GUIDE_SPLITS = ["per_group", "per_person"];
const SEGMENTS = ["国内", "越南", "全程"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cur = "";
    } else cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    if (row.some((x) => x.trim())) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const o = {};
    headers.forEach((h, i) => {
      o[h] = (cells[i] ?? "").trim();
    });
    return o;
  });
}

function loadCsv(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return [];
  return parseCsv(fs.readFileSync(abs, "utf8"));
}

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "").slice(0, 2000) } }] });
const nb = (v) => {
  if (v === "" || v == null) return { number: null };
  const n = Number(v);
  return { number: Number.isFinite(n) ? n : null };
};
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });
const cb = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return { checkbox: s === "是" || s === "true" || s === "1" || s === "yes" };
};
const ttl = (v) => ({
  title: [{ text: { content: String(v ?? "").slice(0, 200) || "-" } }],
});

const hotelsCsv = empty ? [] : loadCsv("content/notion-import/13-报价酒店主数据.csv");
const vehiclesCsv = empty ? [] : loadCsv("content/notion-import/14-报价车型主数据.csv");
const guidesCsv = empty ? [] : loadCsv("content/notion-import/15-报价导游主数据.csv");
const daysCsv = empty ? [] : loadCsv("content/notion-import/16-报价按日明细-r1.csv");

console.log("建表：报价·酒店主数据…");
const hotelsDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·酒店主数据" } }],
    properties: {
      ...title("标题"),
      ...rich("代号"),
      ...rich("名称英文"),
      ...rich("城市"),
      ...rich("星级备注"),
      ...num("双人间含早价"),
      ...select("状态", STATUS),
      ...rich("备注"),
    },
  }),
});

console.log("建表：报价·车型主数据…");
const vehiclesDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·车型主数据" } }],
    properties: {
      ...title("标题"),
      ...rich("代号"),
      ...num("最大载客"),
      ...num("日包价"),
      ...select("适用段", SEGMENTS),
      ...select("状态", STATUS),
      ...rich("备注"),
    },
  }),
});

console.log("建表：报价·导游主数据…");
const guidesDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·导游主数据" } }],
    properties: {
      ...title("标题"),
      ...rich("代号"),
      ...num("日费用"),
      ...select("分摊方式", GUIDE_SPLITS),
      ...select("状态", STATUS),
      ...rich("备注"),
    },
  }),
});

console.log("建表：报价·按日明细…");
const daysDb = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "报价·按日明细" } }],
    properties: {
      ...title("标题"),
      ...select("线路", ROUTES),
      ...num("日序"),
      ...rich("日标题"),
      ...select("费用类型", LINE_TYPES),
      ...relation("酒店", hotelsDb.id),
      ...relation("车型", vehiclesDb.id),
      ...relation("导游", guidesDb.id),
      ...rich("项目名称"),
      ...num("间数"),
      ...num("数量"),
      ...num("金额覆盖"),
      ...checkbox("现付"),
      ...select("分摊口径", SPLITS),
      ...checkbox("成人适用"),
      ...checkbox("儿童适用"),
      ...rich("备注"),
      ...select("状态", ["已发布", "草稿", "已下线"]),
    },
  }),
});

const hotelPagesByCode = {};
const vehiclePagesByCode = {};
const guidePagesByCode = {};

for (const row of hotelsCsv) {
  const code = row["代号"] || "";
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: hotelsDb.id },
      properties: {
        标题: ttl(row["标题"] || code),
        代号: rt(code),
        名称英文: rt(row["名称英文"]),
        城市: rt(row["城市"]),
        星级备注: rt(row["星级备注"]),
        双人间含早价: nb(row["双人间含早价"]),
        状态: sl(row["状态"] || "启用"),
        备注: rt(row["备注"]),
      },
    }),
  });
  if (code) hotelPagesByCode[code] = page.id;
}
if (hotelsCsv.length) console.log(`  酒店 ${hotelsCsv.length} 行`);

for (const row of vehiclesCsv) {
  const code = row["代号"] || "";
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: vehiclesDb.id },
      properties: {
        标题: ttl(row["标题"] || code),
        代号: rt(code),
        最大载客: nb(row["最大载客"]),
        日包价: nb(row["日包价"]),
        适用段: sl(row["适用段"] || "全程"),
        状态: sl(row["状态"] || "启用"),
        备注: rt(row["备注"]),
      },
    }),
  });
  if (code) vehiclePagesByCode[code] = page.id;
}
if (vehiclesCsv.length) console.log(`  车型 ${vehiclesCsv.length} 行`);

for (const row of guidesCsv) {
  const code = row["代号"] || "";
  const page = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: guidesDb.id },
      properties: {
        标题: ttl(row["标题"] || code),
        代号: rt(code),
        日费用: nb(row["日费用"]),
        分摊方式: sl(row["分摊方式"] || "per_group"),
        状态: sl(row["状态"] || "启用"),
        备注: rt(row["备注"]),
      },
    }),
  });
  if (code) guidePagesByCode[code] = page.id;
}
if (guidesCsv.length) console.log(`  导游 ${guidesCsv.length} 行`);

for (const row of daysCsv) {
  const hotelId = hotelPagesByCode[row["酒店代号"]];
  const vehicleId = vehiclePagesByCode[row["车型代号"]];
  const guideId = guidePagesByCode[row["导游代号"]];
  await notion("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: daysDb.id },
      properties: {
        标题: ttl(row["标题"]),
        线路: sl(row["线路"]),
        日序: nb(row["日序"]),
        日标题: rt(row["日标题"]),
        费用类型: sl(row["费用类型"]),
        酒店: { relation: hotelId ? [{ id: hotelId }] : [] },
        车型: { relation: vehicleId ? [{ id: vehicleId }] : [] },
        导游: { relation: guideId ? [{ id: guideId }] : [] },
        项目名称: rt(row["项目名称"]),
        间数: nb(row["间数"]),
        数量: nb(row["数量"]),
        金额覆盖: nb(row["金额覆盖"]),
        现付: cb(row["现付"]),
        分摊口径: sl(row["分摊口径"] || "per_person"),
        成人适用: cb(row["成人适用"] === "" ? "是" : row["成人适用"]),
        儿童适用: cb(row["儿童适用"] === "" ? "是" : row["儿童适用"]),
        备注: rt(row["备注"]),
        状态: sl("已发布"),
      },
    }),
  });
}
if (daysCsv.length) console.log(`  按日 ${daysCsv.length} 行`);

try {
  const cfgPath = path.join(root, "content", "notion.yaml");
  const cfg = fs.existsSync(cfgPath) ? parseYaml(fs.readFileSync(cfgPath, "utf8")) : {};
  const pricingId = cfg?.databases?.pricing;
  if (pricingId) {
    await notion(`/databases/${uuid(pricingId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          "同房人数(默认2)": { number: { format: "number" } },
          人数上限: { number: { format: "number" } },
          "线路名称·中文": { rich_text: {} },
          "线路名称·英文": { rich_text: {} },
          "行程总览·中文": { rich_text: {} },
          "行程总览·英文": { rich_text: {} },
        },
      }),
    });
    console.log("已为「线路定价参数」补列：同房人数(默认2)、人数上限");
  }
} catch (e) {
  console.log(`（跳过补列定价参数：${e.message}）`);
}

const h = uuid(hotelsDb.id);
const v = uuid(vehiclesDb.id);
const g = uuid(guidesDb.id);
const d = uuid(daysDb.id);

console.log(`
完成。链接：
  酒店主数据  ${hotelsDb.url}
  车型主数据  ${vehiclesDb.url}
  导游主数据  ${guidesDb.url}
  按日明细    ${daysDb.url}

把下面粘进 content/notion.yaml 的 databases:：
  pricingHotels: "${h}"
  pricingVehicles: "${v}"
  pricingGuides: "${g}"
  pricingDays: "${d}"

然后：npm run content:notion
`);
