#!/usr/bin/env node
/**
 * 在 Notion 一键建「定价三表」，并回填 content/pricing.yaml 的现有数据。
 * 跑完会直接打印三个表格链接，以及要粘进 content/notion.yaml 的 ID。
 *
 * 前置：
 *   1. https://www.notion.so/my-integrations → New integration（Internal）→ 复制 Token
 *   2. 在 Notion 里打开一个父页面（例如「网站内容优化」）→ ⋯ → 连接 → 勾选该集成
 *   3. 复制该父页面链接里 ? 前的 32 位 ID
 *
 * 用法：
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-pricing.mjs 3d0d5dfd82c480b8b4a6e4e83fb2968e
 *   # 或
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-pricing.mjs --page=<32位ID>
 *
 * 只建表不填数据：加 --empty
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
const root = process.cwd();

const args = process.argv.slice(2);
const empty = args.includes("--empty");
const pageArg = args.find((a) => a.startsWith("--page="));
const parentPageId = (pageArg ? pageArg.slice(7) : args.find((a) => !a.startsWith("--")) || "").trim();
const token = process.env.NOTION_TOKEN?.trim();

if (!token) {
  console.log(`
缺少 NOTION_TOKEN。

1. https://www.notion.so/my-integrations → New integration → 复制 Token
2. Notion 里打开父页面 → ⋯ → 连接 → 勾选集成
3. 复制父页面链接 ? 前的 32 位 ID

然后：
  NOTION_TOKEN=secret_xxx node scripts/notion-create-pricing.mjs <父页面ID>
`);
  process.exit(1);
}
if (!/^[0-9a-fA-F-]{32,36}$/.test(parentPageId)) {
  console.log("用法：NOTION_TOKEN=secret_xxx node scripts/notion-create-pricing.mjs <父页面32位ID>");
  process.exit(1);
}

const uuid = (id) => id.replace(/-/g, "");

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
    const hint =
      res.status === 401
        ? "Token 无效"
        : res.status === 404
          ? "找不到页面 —— 确认已在父页面 ⋯ → 连接 里勾选了这个集成"
          : "";
    throw new Error(`Notion ${res.status} ${body.message || res.statusText}${hint ? ` · ${hint}` : ""}`);
  }
  return body;
}

const title = (name) => ({ [name]: { title: {} } });
const rich = (name) => ({ [name]: { rich_text: {} } });
const num = (name) => ({ [name]: { number: { format: "number" } } });
const select = (name, options) => ({
  [name]: { select: { options: options.map((o) => ({ name: o, color: "default" })) } },
});

const ROUTES = ["r1", "r2", "r3"];
const MODULE_IDS = ["stay", "tickets", "dining", "localTransport", "crossBorder", "insurance", "welcome"];
const BASES = ["per_person", "per_room_night", "per_group_per_head"];
const STATUSES = ["none", "demo", "confirmed"];

const DBS = [
  {
    key: "pricing",
    label: "线路定价参数",
    properties: {
      ...title("标题"),
      ...select("id", ROUTES),
      ...select("status", STATUSES),
      ...rich("source"),
      ...num("band1Max"),
      ...num("band1Price"),
      ...num("band2Max"),
      ...num("band2Price"),
      ...num("band3Max"),
      ...num("band3Price"),
      ...num("band4Max"),
      ...num("band4Price"),
      ...num("leader"),
      ...num("ops"),
      ...num("reserve"),
      ...num("margin"),
      ...num("roundBase"),
      ...rich("note"),
    },
  },
  {
    key: "pricingModules",
    label: "成本模块",
    properties: {
      ...title("标题"),
      ...select("route", ROUTES),
      ...select("moduleId", MODULE_IDS),
      ...rich("name_zh"),
      ...rich("name_en"),
      ...select("basis", BASES),
      ...num("adult"),
      ...num("child"),
      ...rich("note"),
    },
  },
  {
    key: "pricingAnchors",
    label: "报价锚点",
    properties: {
      ...title("标题"),
      ...select("route", ROUTES),
      ...num("n"),
      ...num("adult"),
      ...num("child"),
      ...rich("note"),
    },
  },
];

// --- 从 content/pricing.yaml 读现有数据 ---
const MODULE_TEMPLATE = [
  { id: "stay", zh: "住宿（双人一间均摊）", en: "Stay (twin share, per head)", basis: "per_room_night" },
  { id: "tickets", zh: "门票与体验", en: "Tickets & experiences", basis: "per_person" },
  { id: "dining", zh: "餐食", en: "Dining", basis: "per_person" },
  { id: "localTransport", zh: "境内交通（接驳 / 船票 / 用车）", en: "Local transport", basis: "per_person" },
  { id: "crossBorder", zh: "跨境交通", en: "Cross-border transport", basis: "per_person" },
  { id: "insurance", zh: "保险", en: "Insurance", basis: "per_person" },
  { id: "welcome", zh: "伴手礼与服务包", en: "Welcome kit & service pack", basis: "per_person" },
];
const ANCHOR_TEMPLATE = [2, 4, 6];

let routes = {};
try {
  const doc = parseYaml(fs.readFileSync(path.join(root, "content", "pricing.yaml"), "utf8")) ?? {};
  routes = doc.routes && typeof doc.routes === "object" ? doc.routes : {};
} catch {
  console.log("（未读到 content/pricing.yaml，只建空表）");
}

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "") } }] });
const nb = (v) => ({ number: v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v) });
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });

function rowsFor(key) {
  if (empty || !Object.keys(routes).length) return [];
  const out = [];
  if (key === "pricing") {
    for (const id of ROUTES) {
      const r = routes[id] ?? {};
      const tf = r.teamFixed ?? {};
      const b = [0, 1, 2, 3].map((i) => (Array.isArray(r.vehicleBands) ? r.vehicleBands[i] ?? {} : {}));
      out.push({
        标题: { title: [{ text: { content: `${id} · 定价参数` } }] },
        id: sl(id),
        status: sl(r.status ?? "none"),
        source: rt(r.source ?? ""),
        band1Max: nb(b[0].maxPax ?? ""),
        band1Price: nb(b[0].price ?? ""),
        band2Max: nb(b[1].maxPax ?? ""),
        band2Price: nb(b[1].price ?? ""),
        band3Max: nb(b[2].maxPax ?? ""),
        band3Price: nb(b[2].price ?? ""),
        band4Max: nb(b[3].maxPax ?? ""),
        band4Price: nb(b[3].price ?? ""),
        leader: nb(tf.leader ?? ""),
        ops: nb(tf.ops ?? ""),
        reserve: nb(tf.reserve ?? ""),
        margin: nb(r.margin ?? ""),
        roundBase: nb(r.roundBase ?? ""),
      });
    }
  }
  if (key === "pricingModules") {
    for (const id of ROUTES) {
      const r = routes[id] ?? {};
      const mods =
        Array.isArray(r.modules) && r.modules.length
          ? r.modules
          : MODULE_TEMPLATE.map((m) => ({ id: m.id, name_zh: m.zh, name_en: m.en, basis: m.basis }));
      for (const m of mods) {
        out.push({
          标题: { title: [{ text: { content: `${id} · ${m.name_zh || m.id}` } }] },
          route: sl(id),
          moduleId: sl(m.id ?? ""),
          name_zh: rt(m.name_zh ?? ""),
          name_en: rt(m.name_en ?? ""),
          basis: sl(m.basis ?? "per_person"),
          adult: nb(m.adult ?? ""),
          child: nb(m.child ?? ""),
        });
      }
    }
  }
  if (key === "pricingAnchors") {
    for (const id of ROUTES) {
      const r = routes[id] ?? {};
      const list =
        Array.isArray(r.anchors) && r.anchors.length ? r.anchors : ANCHOR_TEMPLATE.map((n) => ({ n }));
      for (const a of list) {
        out.push({
          标题: { title: [{ text: { content: `${id} · ${a.n} 人` } }] },
          route: sl(id),
          n: nb(a.n ?? ""),
          adult: nb(a.adult ?? ""),
          child: nb(a.child ?? ""),
        });
      }
    }
  }
  return out;
}

const created = {};
for (const db of DBS) {
  const db1 = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: uuid(parentPageId) },
      title: [{ type: "text", text: { content: db.label } }],
      properties: db.properties,
    }),
  });
  created[db.key] = db1;
  console.log(`建表：${db.label}`);
  const rows = rowsFor(db.key);
  for (const row of rows) {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: db1.id }, properties: row }),
    });
  }
  if (rows.length) console.log(`  已填入 ${rows.length} 行（来自 content/pricing.yaml）`);
}

console.log(`
完成。链接：
${DBS.map((d) => `  ${d.label.padEnd(8)} ${created[d.key].url}`).join("\n")}

把下面三行粘进 content/notion.yaml 的 databases: 下面：
  pricing: "${uuid(created.pricing.id)}"
  pricingModules: "${uuid(created.pricingModules.id)}"
  pricingAnchors: "${uuid(created.pricingAnchors.id)}"

然后：npm run content:notion   （Notion → content/pricing.yaml → 网站即时估算）
`);
