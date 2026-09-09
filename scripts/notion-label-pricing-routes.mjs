#!/usr/bin/env node
/**
 * 为「线路定价参数」补：线路名称 / 行程总览；
 * 并把「报价·按日明细」标题改成「路线一·r1 · D1 · …」便于区分线路。
 *
 *   npm run content:notion:label-routes
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

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const uuid = (raw) => {
  const h = String(raw).replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

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
  if (!res.ok) throw new Error(`Notion ${res.status} ${body.message || res.statusText}`);
  return body;
}

async function queryAll(databaseId) {
  const pages = [];
  let cursor;
  do {
    const body = await notion(`/databases/${uuid(databaseId)}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    pages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return pages;
}

function propText(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name ?? "";
  if (p.type === "number") return p.number == null ? "" : String(p.number);
  return "";
}

const META = {
  r1: {
    badge: "路线一",
    labelZh: "路线一 · 三境溯游 · 秘境回响",
    labelEn: "Route 01 · The Three Realms Traverse",
    briefZh:
      "14 日 · 南宁进 / 昆明出。从北部湾到云贵高原的跨国人文线。\n城市链：南宁 → 崇左（德天/明仕）→ 下龙（2晚）→ 吉婆 → 河内（2晚）→ 沙坝（2晚）→ 建水 → 普者黑 → 弥勒 → 昆明送机。\n卖点摘要：下龙五星游轮、吉婆/米轨、沙坝番西邦与猫猫村、云南古城与普者黑荷塘。\n—— 以下为按日费用明细（筛「线路=r1」查看）。",
    briefEn:
      "14 days · Nanning in / Kunming out. Gulf → Yunnan plateau traverse.\nCities: Nanning → Chongzuo (Detian/Mingshi) → Ha Long (2n) → Cat Ba → Hanoi (2n) → Sapa (2n) → Jianshui → Puzhehei → Mile → Kunming transfer.\nHighlights: Ha Long cruise, Cat Ba/metre-gauge, Fansipan & Cat Cat, Yunnan old towns & lotus wetlands.\n—— Daily cost lines follow (filter 线路=r1).",
  },
  r2: {
    badge: "路线二",
    labelZh: "路线二 · 南境风土与城市人文",
    labelEn: "Route 02 · The Southern Loop",
    briefZh:
      "11 日 · 南宁进 / 南宁出（闭环）。蔗海、梯田与法式老街的慢节奏边境巡游。\n城市链：南宁 → 下龙 → 吉婆 → 河内 → 米轨过夜 → 沙坝（2晚）→ 观堂（2晚）→ 南宁收束。\n卖点摘要：下龙/吉婆、河内老街、米轨卧铺、沙坝梯田、观堂天琴与蔗海、德天/明仕后回邕。\n—— 按日费用明细待录入（筛「线路=r2」）；先维护本行总览。",
    briefEn:
      "11 days · Nanning loop. Slow borderlands culture circuit.\nCities: Nanning → Ha Long → Cat Ba → Hanoi → overnight train → Sapa (2n) → Guantang (2n) → Nanning.\nHighlights: bay & Cat Ba, Old Quarter, metre-gauge, Sapa terraces, Guantang & Detian/Mingshi.\n—— Daily cost lines TBD (filter 线路=r2); keep this brief first.",
  },
  r3: {
    badge: "路线三",
    labelZh: "路线三 · 崇左栖山 · 涠洲枕海",
    labelEn: "Route 03 · Chongzuo Karst · Weizhou Isle",
    briefZh:
      "7 日 · 南宁进 / 北海出。喀斯特秘境到火山海岛的短假山海线。\n城市链：南宁 → 崇左（2晚）→ 北海 → 涠洲岛（2晚）→ 返程。\n卖点摘要：崇左秘境丽世观瀑、涠洲方岛巨鲸悬崖、果冻海与观鲸节奏。\n—— 按日费用明细待录入（筛「线路=r3」）；先维护本行总览。",
    briefEn:
      "7 days · Nanning in / Beihai out. Karst peaks to volcanic isle.\nCities: Nanning → Chongzuo (2n) → Beihai → Weizhou (2n) → return.\nHighlights: LUX* Chongzuo falls, Weizhou cliff resort, jelly sea & whale watching.\n—— Daily cost lines TBD (filter 线路=r3); keep this brief first.",
  },
};

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const pricingId = cfg.databases?.pricing;
const daysId = cfg.databases?.pricingDays;
if (!pricingId) {
  console.error("content/notion.yaml 缺少 pricing");
  process.exit(1);
}

console.log("补列：线路名称 / 行程总览…");
await notion(`/databases/${uuid(pricingId)}`, {
  method: "PATCH",
  body: JSON.stringify({
    properties: {
      "线路名称·中文": { rich_text: {} },
      "线路名称·英文": { rich_text: {} },
      "行程总览·中文": { rich_text: {} },
      "行程总览·英文": { rich_text: {} },
    },
  }),
});

const rt = (v) => ({
  rich_text: [{ text: { content: String(v ?? "").slice(0, 2000) } }],
});
const ttl = (v) => ({
  title: [{ text: { content: String(v ?? "").slice(0, 200) || "-" } }],
});

const paramPages = await queryAll(pricingId);
for (const page of paramPages) {
  const rid =
    propText(page, "线路") ||
    propText(page, "id") ||
    (propText(page, "标题").match(/\b(r[123])\b/) || [])[1] ||
    "";
  const meta = META[rid];
  if (!meta) continue;
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        标题: ttl(`${meta.badge}·${rid} · 定价参数`),
        "线路名称·中文": rt(meta.labelZh),
        "线路名称·英文": rt(meta.labelEn),
        "行程总览·中文": rt(meta.briefZh),
        "行程总览·英文": rt(meta.briefEn),
      },
    }),
  });
  console.log(`  参数行：${rid} → ${meta.labelZh}`);
}

if (daysId) {
  console.log("重命名按日明细标题…");
  const dayPages = await queryAll(daysId);
  let n = 0;
  for (const page of dayPages) {
    const rid = propText(page, "线路");
    const meta = META[rid];
    if (!meta) continue;
    const day = propText(page, "日序") || "?";
    const type = propText(page, "费用类型") || "";
    const item = propText(page, "项目名称");
    const dayTitle = propText(page, "日标题");
    const tail = item || type || "费用";
    const title = `${meta.badge}·${rid} · D${day}${dayTitle ? `·${dayTitle}` : ""} · ${tail}`;
    await notion(`/pages/${page.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: { 标题: ttl(title) } }),
    });
    n++;
  }
  console.log(`  已更新 ${n} 条按日标题`);
}

console.log(`
完成。建议在 Notion「报价·按日明细」建三个视图：筛选 线路=r1 / r2 / r3，按日序排序。
先看「线路定价参数」里每行的「行程总览」，再进对应视图填每日费用。
然后：npm run content:notion
`);
