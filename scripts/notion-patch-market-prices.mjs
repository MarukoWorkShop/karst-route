#!/usr/bin/env node
/**
 * 把 Word「网络卖价」写入 Notion 人数验算：成人市场报价 / 儿童市场报价
 * 并写入 content/pricing.yaml 的 marketTiers（网站加粗展示）
 *
 *   node scripts/notion-patch-market-prices.mjs
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
const dash = (raw) => {
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
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${pathname}: ${JSON.stringify(body)}`);
  return body;
}

function text(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name || "";
  if (p.type === "number") return p.number ?? "";
  return "";
}

/** Word「网络卖价」→ 验算人数行（2/4/6/8/10） */
const MARKET = {
  r1: {
    2: { adult: 32500, child: 27000 },
    4: { adult: 29500, child: 24000 },
    6: { adult: 29500, child: 24000 },
    8: { adult: 26500, child: 21000 },
    10: { adult: 26500, child: 21000 },
  },
  r2: {
    2: { adult: 23200, child: 18300 },
    4: { adult: 21200, child: 16400 },
    6: { adult: 21200, child: 16400 },
    8: { adult: 19200, child: 14400 },
    10: { adult: 19200, child: 14400 },
  },
  r3: {
    2: { adult: 25688, child: 13808 },
    4: { adult: 23688, child: 11808 },
    6: { adult: 23688, child: 11808 },
    8: { adult: 21688, child: 9808 },
    10: { adult: 21688, child: 9808 },
  },
};

const TIERS = {
  r1: [
    { maxN: 3, adult: 32500, child: 27000 },
    { maxN: 6, adult: 29500, child: 24000 },
    { maxN: 10, adult: 26500, child: 21000 },
  ],
  r2: [
    { maxN: 3, adult: 23200, child: 18300 },
    { maxN: 6, adult: 21200, child: 16400 },
    { maxN: 10, adult: 19200, child: 14400 },
  ],
  r3: [
    { maxN: 3, adult: 25688, child: 13808 },
    { maxN: 6, adult: 23688, child: 11808 },
    { maxN: 10, adult: 21688, child: 9808 },
  ],
};

const ADULT_COL = "成人市场报价";
const CHILD_COL = "儿童市场报价";

const validateId = cfg.databases.pricingValidate;
const meta = await notion(`/databases/${dash(validateId)}`);
const existing = meta.properties || {};
const toAdd = {};
if (!existing[ADULT_COL]) toAdd[ADULT_COL] = { number: { format: "number" } };
if (!existing[CHILD_COL]) toAdd[CHILD_COL] = { number: { format: "number" } };
if (Object.keys(toAdd).length) {
  await notion(`/databases/${dash(validateId)}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: toAdd }),
  });
  console.log("added columns", Object.keys(toAdd).join(", "));
} else {
  console.log("columns exist");
}

const pages = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;
  const r = await notion(`/databases/${dash(validateId)}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  pages.push(...(r.results || []).filter((p) => !p.archived));
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

function routeOf(page) {
  const fromCol = text(page, "线路");
  if (/^r[123]$/.test(fromCol)) return fromCol;
  const title = text(page, "标题") || "";
  return (title.match(/·\s*(r[123])\s*·/i) || title.match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() || "";
}

let n = 0;
for (const page of pages) {
  const rid = routeOf(page);
  const pax = Number(text(page, "人数") || text(page, "n") || 0);
  const price = MARKET[rid]?.[pax];
  if (!price) continue;
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [ADULT_COL]: { number: price.adult },
        [CHILD_COL]: { number: price.child },
      },
    }),
  });
  n++;
  console.log(rid, `n=${pax}`, price.adult, price.child);
}

const pricingPath = path.join(root, "content/pricing.yaml");
let yamlText = fs.readFileSync(pricingPath, "utf8");

function tiersYaml(rid) {
  return TIERS[rid]
    .map((t) => `      - maxN: ${t.maxN}\n        adult: ${t.adult}\n        child: ${t.child}\n`)
    .join("");
}

for (const rid of ["r1", "r2", "r3"]) {
  const block = `    marketTiers:\n${tiersYaml(rid)}`;
  const re = new RegExp(
    `(  ${rid}:\\n(?:(?:    |      ).*\\n)*?    maxPax: \\d+\\n)(?:    marketTiers:\\n(?:      - maxN: \\d+\\n        adult: \\d+\\n        child: \\d+\\n)*)?`,
  );
  if (!re.test(yamlText)) {
    console.warn(`warn: could not locate ${rid} maxPax for marketTiers insert`);
    continue;
  }
  yamlText = yamlText.replace(re, `$1${block}`);
}

fs.writeFileSync(pricingPath, yamlText);
console.log(`updated ${n} validate rows + pricing.yaml marketTiers`);
