#!/usr/bin/env node
/** 修补 r3 杂项整团价/分摊口径 */
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
const dash = (raw) => {
  const h = String(raw).replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
async function notion(p, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${p}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`);
  return body;
}
function text(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  if (p.type === "select") return p.select?.name || "";
  return "";
}
function codeOf(page) {
  return text(page, "代号") || "";
}

const miscId = cfg.databases.pricingMisc;
const meta = await notion(`/databases/${dash(miscId)}`);
const props = meta.properties || {};
console.log(
  "misc cols",
  Object.keys(props).filter((k) => /团|分摊|价|口径|方式/.test(k)),
);

const pages = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;
  const r = await notion(`/databases/${dash(miscId)}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  pages.push(...(r.results || []).filter((p) => !p.archived));
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

const fixes = {
  "misc-r3-heishui-boat": { group: 720, split: "per_group_split" },
  "misc-r3-mingshi-cart": { group: 300, split: "per_group_split" },
};
for (const page of pages) {
  const code = codeOf(page) || text(page, "标题");
  const key = Object.keys(fixes).find((k) => code === k || code.includes(k) || text(page, "标题").includes(k.slice(5)));
  // match by 代号
  const fix =
    fixes[codeOf(page)] ||
    ( /黑水河/.test(text(page, "标题"))
      ? fixes["misc-r3-heishui-boat"]
      : /名仕观光车（线三）/.test(text(page, "标题"))
        ? fixes["misc-r3-mingshi-cart"]
        : null);
  if (!fix) continue;
  const properties = {};
  if (props["整团价"]) properties["整团价"] = { number: fix.group };
  if (props["团价"]) properties["团价"] = { number: fix.group };
  if (props["成人价"]) properties["成人价"] = { number: 0 };
  if (props["儿童价"]) properties["儿童价"] = { number: 0 };
  const splitCol = props["分摊口径"] ? "分摊口径" : props["分摊方式"] ? "分摊方式" : null;
  if (splitCol) {
    if (props[splitCol].type === "select") {
      const opts = props[splitCol].select?.options || [];
      const hit = opts.find((o) => o.name === fix.split) || opts.find((o) => /group|团/.test(o.name));
      if (!hit) console.warn("no split option", opts.map((o) => o.name));
      else properties[splitCol] = { select: { name: hit.name } };
    } else {
      properties[splitCol] = { rich_text: [{ text: { content: fix.split } }] };
    }
  }
  await notion(`/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
  console.log("fixed", codeOf(page) || text(page, "标题"), fix);
}
console.log("done");
