#!/usr/bin/env node
/** 从「线路参数」删除车档整车包价列。npm run content:notion:drop-vehicle-bands */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

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
const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const id = dash(cfg.databases.pricing);
const remove = [
  "车档1·人数上限",
  "车档1·整车包价(元)",
  "车档2·人数上限",
  "车档2·整车包价(元)",
  "车档3·人数上限",
  "车档3·整车包价(元)",
  "车档4·人数上限",
  "车档4·整车包价(元)",
  "band1Max",
  "band1Price",
  "band2Max",
  "band2Price",
  "band3Max",
  "band3Price",
  "band4Max",
  "band4Price",
];
const meta = await fetch(`https://api.notion.com/v1/databases/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
  },
}).then((r) => r.json());
const existing = new Set(Object.keys(meta.properties || {}));
const toRemove = remove.filter((n) => existing.has(n));
if (!toRemove.length) {
  console.log("没有车档列可删（可能已删除）");
  process.exit(0);
}
const res = await fetch(`https://api.notion.com/v1/databases/${id}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ properties: Object.fromEntries(toRemove.map((n) => [n, null])) }),
});
const body = await res.json();
if (!res.ok) throw new Error(body.message || JSON.stringify(body));
const left = Object.keys(body.properties || {}).filter((n) => /车档|band/i.test(n));
console.log(`已删：${toRemove.join(" · ")}`);
console.log(left.length ? `仍有：${left.join(", ")}` : "车档列已全部删除");
console.log("测算逻辑不变：按日产品成本 + 团队固定分摊 → ×(1+margin) → 取整");
