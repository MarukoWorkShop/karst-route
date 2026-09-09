/**
 * 线路参数：领队费三档列；产品库：补 14 座巴士（7座×1.4）。
 *   node scripts/notion-patch-leader-buses.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("需要 NOTION_TOKEN（.env.local）");
  process.exit(1);
}

const cfg = yaml.parse(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const pricingId = cfg.databases?.pricing;
const vehiclesId = cfg.databases?.pricingVehicles;
if (!pricingId || !vehiclesId) {
  console.error("notion.yaml 缺少 pricing / pricingVehicles");
  process.exit(1);
}

const NOTION_VER = "2022-06-28";

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VER,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${urlPath}: ${JSON.stringify(body)}`);
  }
  return body;
}

function dash(id) {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

async function allPages(dbId) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`/databases/${dash(dbId)}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    out.push(...(r.results || []));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function plain(rich) {
  return (rich || []).map((t) => t.plain_text || "").join("").trim();
}

function propText(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return plain(p.title);
  if (p.type === "rich_text") return plain(p.rich_text);
  if (p.type === "select") return p.select?.name || "";
  return "";
}

const BUSES = [
  { id: "car4-vn", title: "4座小车·越南段（2人小团）", maxPax: 2, dayRate: 900, segment: "越南" },
  { id: "car4-border", title: "4座小车·跨境（2人小团）", maxPax: 2, dayRate: 950, segment: "国内" },
  { id: "car4-gx", title: "4座小车·广西段（2人小团）", maxPax: 2, dayRate: 1100, segment: "国内" },
  { id: "car4-cn", title: "4座小车·国内（2人小团）", maxPax: 2, dayRate: 1600, segment: "国内" },
  { id: "bus14-vn", title: "14座巴士·越南段参考", maxPax: 14, dayRate: 1540, segment: "越南" },
  { id: "bus14-border", title: "14座巴士·跨境参考", maxPax: 14, dayRate: 1680, segment: "国内" },
  { id: "bus14-gx", title: "14座巴士·广西段参考", maxPax: 14, dayRate: 1960, segment: "国内" },
  { id: "bus14-cn", title: "14座巴士·国内参考", maxPax: 14, dayRate: 2800, segment: "国内" },
];

const LEADER = { "1-2": 12000, "1-4": 18000, "5-10": 45000, "10+": 63000 };

console.log("扩展线路参数：领队分档列…");
const pricingDb = await notion(`/databases/${dash(pricingId)}`);
const existing = pricingDb.properties || {};
const toAdd = {};
if (!existing["领队成本1-2人"]) toAdd["领队成本1-2人"] = { number: {} };
if (!existing["领队成本1-4人"]) toAdd["领队成本1-4人"] = { number: {} };
if (!existing["领队成本5-10人"]) toAdd["领队成本5-10人"] = { number: {} };
if (!existing["领队成本10人以上"]) toAdd["领队成本10人以上"] = { number: {} };
if (Object.keys(toAdd).length) {
  await notion(`/databases/${dash(pricingId)}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: toAdd }),
  });
  console.log("  已加列", Object.keys(toAdd).join(", "));
} else {
  console.log("  分档列已存在");
}

const routePages = await allPages(pricingId);
for (const page of routePages) {
  const route =
    propText(page, "线路") ||
    propText(page, "id") ||
    (propText(page, "标题").match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
    "";
  if (!/^r[123]$/.test(route)) continue;
  await notion(`/pages/${page.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        "领队成本1-2人": { number: LEADER["1-2"] },
        "领队成本1-4人": { number: LEADER["1-4"] },
        "领队成本5-10人": { number: LEADER["5-10"] },
        "领队成本10人以上": { number: LEADER["10+"] },
        ...(existing["领队成本(元/团)"] || existing.leader
          ? { "领队成本(元/团)": { number: LEADER["1-4"] } }
          : {}),
        ...(existing["人数上限"] || existing.maxPax
          ? route === "r1"
            ? { "人数上限": { number: 14 } }
            : {}
          : {}),
      },
    }),
  });
  console.log(`  更新 ${route} 领队分档`);
}

console.log("产品库车型：确保 14 座巴士…");
const vehiclePages = await allPages(vehiclesId);
const byCode = new Map();
for (const p of vehiclePages) {
  const code = propText(p, "代号") || propText(p, "code");
  if (code) byCode.set(code, p);
}

const vMeta = await notion(`/databases/${dash(vehiclesId)}`);
const vProps = vMeta.properties || {};
const statusProp = vProps["状态"] || vProps.status;
const statusName =
  statusProp?.type === "select"
    ? statusProp.select?.options?.find((o) => /启用|active/i.test(o.name))?.name ||
      statusProp.select?.options?.[0]?.name
    : null;

for (const bus of BUSES) {
  const props = {
    标题: { title: [{ text: { content: bus.title } }] },
  };
  if (vProps["代号"]) props["代号"] = { rich_text: [{ text: { content: bus.id } }] };
  if (vProps["最大载客"]) props["最大载客"] = { number: bus.maxPax };
  if (vProps["日包价"]) props["日包价"] = { number: bus.dayRate };
  if (vProps["适用段"]?.type === "select") {
    props["适用段"] = { select: { name: bus.segment } };
  } else if (vProps["适用段"]?.type === "rich_text") {
    props["适用段"] = { rich_text: [{ text: { content: bus.segment } }] };
  }
  if (statusName && vProps["状态"]) props["状态"] = { select: { name: statusName } };
  if (vProps["备注"]) {
    props["备注"] = {
      rich_text: [
        {
          text: {
            content: bus.id.startsWith("car4")
              ? "2人小团专用；日包约 7 座同段 8 折；估算人数≤2 自动降档"
              : "7座同段日包价×1.4；人数>6 时估算自动升级",
          },
        },
      ],
    };
  }

  const existingPage = byCode.get(bus.id);
  if (existingPage) {
    await notion(`/pages/${existingPage.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: props }),
    });
    console.log(`  更新 ${bus.id}`);
  } else {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: dash(vehiclesId) }, properties: props }),
    });
    console.log(`  新建 ${bus.id}`);
  }
}

console.log("\n完成。请跑：npm run content:notion");
