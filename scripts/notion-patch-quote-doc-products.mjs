#!/usr/bin/env node
/**
 * 按《14天+11天产品分列报价》确认项：更新产品库 + 线路参数 ops/reserve
 *   node scripts/notion-patch-quote-doc-products.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("需要 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const dash = (id) => {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${urlPath}: ${JSON.stringify(body)}`);
  return body;
}

function plain(rich) {
  return (rich || []).map((t) => t.plain_text || "").join("").trim();
}
function textProp(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return plain(p.title);
  if (p.type === "rich_text") return plain(p.rich_text);
  if (p.type === "select") return p.select?.name || "";
  return "";
}
function codeOf(page) {
  return textProp(page, "代号") || textProp(page, "code") || "";
}

async function queryAll(dbId) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`/databases/${dash(dbId)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    out.push(...(r.results || []).filter((p) => !p.archived));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

async function upsertByCode(dbId, code, propsBuilder) {
  const pages = await queryAll(dbId);
  const hit = pages.find((p) => codeOf(p) === code || textProp(p, "标题") === code);
  const properties = propsBuilder();
  if (hit) {
    await notion(`/pages/${hit.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("  update", code);
    return hit.id;
  }
  const created = await notion("/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: dash(dbId) }, properties }),
  });
  console.log("  create", code);
  return created.id;
}

const hotelsId = cfg.databases.pricingHotels;
const vehiclesId = cfg.databases.pricingVehicles;
const ticketsId = cfg.databases.pricingTickets;
const miscId = cfg.databases.pricingMisc;
const mealsId = cfg.databases.pricingMeals;
const pricingId = cfg.databases.pricing;
const daySheetId = cfg.databases.pricingDaySheet;

const hotelMeta = await notion(`/databases/${dash(hotelsId)}`);
const hProps = hotelMeta.properties || {};
const vehicleMeta = await notion(`/databases/${dash(vehiclesId)}`);
const vProps = vehicleMeta.properties || {};
const ticketMeta = await notion(`/databases/${dash(ticketsId)}`);
const tProps = ticketMeta.properties || {};
const miscMeta = await notion(`/databases/${dash(miscId)}`);
const mProps = miscMeta.properties || {};

function rt(s) {
  return { rich_text: [{ text: { content: String(s ?? "") } }] };
}
function title(s) {
  return { title: [{ text: { content: String(s ?? "") } }] };
}
function num(n) {
  return { number: n };
}
function sel(name) {
  return { select: { name } };
}

console.log("酒店…");
// 吉婆 700
{
  const pages = await queryAll(hotelsId);
  const catba = pages.find((p) => codeOf(p) === "catba-tbd" || /吉婆/.test(textProp(p, "标题")));
  if (!catba) throw new Error("找不到吉婆酒店");
  const properties = {};
  if (hProps["双人间含早价"]) properties["双人间含早价"] = num(700);
  if (hProps["标题"]) properties["标题"] = title("吉婆岛·参考酒店");
  if (hProps["名称英文"]) properties["名称英文"] = rt("Cat Ba hotel (ref)");
  if (hProps["城市"]) {
    if (hProps["城市"].type === "select") properties["城市"] = sel("吉婆岛");
    else properties["城市"] = rt("吉婆岛");
  }
  if (hProps["代号"]) properties["代号"] = rt("catba-tbd");
  await notion(`/pages/${catba.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
  console.log("  update catba-tbd → 700");
}

await upsertByCode(hotelsId, "guantang-view", () => {
  const properties = {
    标题: title("崇左·观堂酒店"),
  };
  if (hProps["代号"]) properties["代号"] = rt("guantang-view");
  if (hProps["双人间含早价"]) properties["双人间含早价"] = num(600);
  if (hProps["名称英文"]) properties["名称英文"] = rt("Guantang Hotel, Chongzuo");
  if (hProps["城市"]) {
    if (hProps["城市"].type === "select") properties["城市"] = sel("观堂");
    else properties["城市"] = rt("观堂");
  }
  if (hProps["状态"]?.type === "select") {
    const opt =
      hProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      hProps["状态"].select?.options?.[0]?.name;
    if (opt) properties["状态"] = sel(opt);
  }
  return properties;
});

console.log("车型（7座±30% + 线二国内1000）…");
const fleet = [
  { id: "car4-vn", title: "4座小车·越南段（≤3人）", maxPax: 3, dayRate: 770, segment: "越南" },
  { id: "car4-border", title: "4座小车·跨境（≤3人）", maxPax: 3, dayRate: 840, segment: "国内" },
  { id: "car4-gx", title: "4座小车·广西段（≤3人）", maxPax: 3, dayRate: 980, segment: "国内" },
  { id: "car4-cn", title: "4座小车·国内（≤3人）", maxPax: 3, dayRate: 1400, segment: "国内" },
  { id: "bus14-vn", title: "14座巴士·越南段参考", maxPax: 14, dayRate: 1430, segment: "越南" },
  { id: "bus14-border", title: "14座巴士·跨境参考", maxPax: 14, dayRate: 1560, segment: "国内" },
  { id: "bus14-gx", title: "14座巴士·广西段参考", maxPax: 14, dayRate: 1820, segment: "国内" },
  { id: "bus14-cn", title: "14座巴士·国内参考", maxPax: 14, dayRate: 2600, segment: "国内" },
  {
    id: "van-cn-1000",
    title: "国内用车·线路二参考",
    maxPax: 6,
    dayRate: 1000,
    segment: "国内",
  },
];

for (const bus of fleet) {
  await upsertByCode(vehiclesId, bus.id, () => {
    const properties = { 标题: title(bus.title) };
    if (vProps["代号"]) properties["代号"] = rt(bus.id);
    if (vProps["最大载客"]) properties["最大载客"] = num(bus.maxPax);
    if (vProps["日包价"]) properties["日包价"] = num(bus.dayRate);
    if (vProps["适用段"]?.type === "select") properties["适用段"] = sel(bus.segment);
    else if (vProps["适用段"]) properties["适用段"] = rt(bus.segment);
    if (vProps["备注"]) {
      properties["备注"] = rt(
        bus.id.startsWith("car4")
          ? "7座同段日包×0.7；人数≤3 自动降档"
          : bus.id.startsWith("bus14")
            ? "7座同段日包×1.3；人数>6 自动升级"
            : "线路二分列报价国内用车 1000/团·日",
      );
    }
    if (vProps["状态"]?.type === "select") {
      const opt =
        vProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
        vProps["状态"].select?.options?.[0]?.name;
      if (opt) properties["状态"] = sel(opt);
    }
    return properties;
  });
}

console.log("门票…");
await upsertByCode(ticketsId, "ticket-train-sleeper", () => {
  const properties = { 标题: title("米轨卧铺") };
  if (tProps["代号"]) properties["代号"] = rt("ticket-train-sleeper");
  if (tProps["成人价"]) properties["成人价"] = num(200);
  if (tProps["儿童价"]) properties["儿童价"] = num(200);
  if (tProps["名称英文"]) properties["名称英文"] = rt("Meter-gauge sleeper berth");
  if (tProps["状态"]?.type === "select") {
    const opt =
      tProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      tProps["状态"].select?.options?.[0]?.name;
    if (opt) properties["状态"] = sel(opt);
  }
  return properties;
});

await upsertByCode(ticketsId, "ticket-tianqin-bike", () => {
  const properties = { 标题: title("天琴壮寨+骑行蔗海") };
  if (tProps["代号"]) properties["代号"] = rt("ticket-tianqin-bike");
  if (tProps["成人价"]) properties["成人价"] = num(0);
  if (tProps["儿童价"]) properties["儿童价"] = num(0);
  if (tProps["名称英文"]) properties["名称英文"] = rt("Tianqin village + sugarcane cycling");
  if (tProps["备注"]) properties["备注"] = rt("价格暂 0，待补");
  if (tProps["状态"]?.type === "select") {
    const opt =
      tProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      tProps["状态"].select?.options?.[0]?.name;
    if (opt) properties["状态"] = sel(opt);
  }
  return properties;
});

console.log("杂项…");
const miscItems = [
  { id: "misc-dropoff", title: "送站/送机", adult: 100, child: 100, split: "per_person", group: 0 },
  { id: "misc-nanning-station", title: "南宁送动车站", adult: 100, child: 100, split: "per_person", group: 0 },
  { id: "misc-nanning-dongxing-train", title: "南宁-东兴动车", adult: 100, child: 100, split: "per_person", group: 0 },
  { id: "misc-dongxing-gate-transfer", title: "东兴站-关口用车(含二桥电瓶)", adult: 50, child: 50, split: "per_person", group: 0 },
  { id: "misc-youyiguan-escort", title: "友谊关送关员", adult: 100, child: 100, split: "per_person", group: 0 },
  { id: "misc-pingxiang-pickup", title: "凭祥接关", adult: 150, child: 150, split: "per_person", group: 0 },
  { id: "misc-pingxiang-photo", title: "凭祥相片费", adult: 5, child: 5, split: "per_person", group: 0 },
  { id: "misc-youyiguan-cart", title: "友谊关电瓶车", adult: 5, child: 5, split: "per_person", group: 0 },
];

for (const item of miscItems) {
  await upsertByCode(miscId, item.id, () => {
    const properties = { 标题: title(item.title) };
    if (mProps["代号"]) properties["代号"] = rt(item.id);
    if (mProps["成人价"]) properties["成人价"] = num(item.adult);
    if (mProps["儿童价"]) properties["儿童价"] = num(item.child);
    if (mProps["团价"]) properties["团价"] = num(item.group);
    if (mProps["分摊方式"]?.type === "select") properties["分摊方式"] = sel(item.split);
    else if (mProps["分摊方式"]) properties["分摊方式"] = rt(item.split);
    if (mProps["类别"]) {
      if (mProps["类别"].type === "select") properties["类别"] = sel("接送");
      else properties["类别"] = rt("接送");
    }
    if (mProps["名称英文"]) properties["名称英文"] = rt(item.title);
    if (mProps["状态"]?.type === "select") {
      const opt =
        mProps["状态"].select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
        mProps["状态"].select?.options?.[0]?.name;
      if (opt) properties["状态"] = sel(opt);
    }
    return properties;
  });
}

// 清理空 misc
{
  const pages = await queryAll(miscId);
  for (const p of pages) {
    const code = codeOf(p);
    const titleText = textProp(p, "标题");
    if (!code && !titleText) {
      await notion(`/pages/${p.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
      console.log("  archive empty misc");
    }
  }
}

// 早餐备注：含在房费
{
  const meals = await queryAll(mealsId);
  const bf = meals.find((p) => codeOf(p) === "meal-breakfast" || /早餐/.test(textProp(p, "标题")));
  if (bf) {
    const mealMeta = await notion(`/databases/${dash(mealsId)}`);
    const mp = mealMeta.properties || {};
    const properties = {};
    if (mp["备注"]) properties["备注"] = rt("含在酒店双人间含早价内；按日表不单独点选");
    if (Object.keys(properties).length) {
      await notion(`/pages/${bf.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
      console.log("  annotate meal-breakfast");
    }
  }
}

console.log("线路参数 ops=1000 reserve=1000（机动+越南操作，全线相同）…");
{
  const pages = await queryAll(pricingId);
  const meta = await notion(`/databases/${dash(pricingId)}`);
  const pp = meta.properties || {};
  for (const page of pages) {
    const route =
      textProp(page, "线路") ||
      textProp(page, "id") ||
      (textProp(page, "标题").match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
      "";
    if (!/^r[123]$/.test(route)) continue;
    const properties = {};
    if (pp["运营税费(元/团)"]) properties["运营税费(元/团)"] = num(1000);
    if (pp["储备金(元/团)"]) properties["储备金(元/团)"] = num(1000);
    // 兼容英文列
    if (pp.ops) properties.ops = num(1000);
    if (pp.reserve) properties.reserve = num(1000);
    await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log("  params", route);
  }
}

// 按日表：清空早餐产品（含在房费）
console.log("按日表清空早餐点选…");
{
  const pages = await queryAll(daySheetId);
  let n = 0;
  for (const page of pages) {
    const rel = page.properties?.["早餐产品"];
    if (rel?.type === "relation" && (rel.relation || []).length) {
      await notion(`/pages/${page.id}`, {
        method: "PATCH",
        body: JSON.stringify({ properties: { 早餐产品: { relation: [] } } }),
      });
      n++;
    }
  }
  console.log("  cleared breakfast on", n, "rows");
}

console.log("\n完成。请跑：npm run content:notion");
