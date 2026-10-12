#!/usr/bin/env node
/**
 * 在 Notion 建/更新「管家联系方式」列表，从 content/concierge.yaml 填入现有通道，
 * 并把 database id 写进 content/notion.yaml。
 *
 * 用法：node scripts/notion-create-concierge.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const VERSION = "2022-06-28";
const root = process.cwd();
const cfgPath = path.join(root, "content", "notion.yaml");
const yamlPath = path.join(root, "content", "concierge.yaml");
const LINKS_PAGE = "3f7d5dfd-82c4-8181-b42f-f579497c1d2b";
const GH = "https://github.com/MarukoWorkShop/karst-route/blob/main/content/concierge.yaml";

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8")) ?? {};
const doc = parseYaml(fs.readFileSync(yamlPath, "utf8")) ?? {};

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "");
  const h = hex.match(/[0-9a-f]{32}/i)?.[0];
  if (!h) throw new Error(`bad id: ${raw}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function bare(raw) {
  return String(raw).replace(/-/g, "");
}

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status} ${urlPath}: ${body.message || res.statusText}`);
  return body;
}

function rt(content) {
  const text = String(content ?? "");
  if (!text) return { rich_text: [] };
  return { rich_text: [{ type: "text", text: { content: text } }] };
}

const note = doc.note && typeof doc.note === "object" ? doc.note : {};
const rows = [
  {
    title: "兜底说明",
    channel: "说明",
    sort: 0,
    account: "",
    qr: "",
    noteZh: String(note.zh ?? ""),
    noteEn: String(note.en ?? ""),
    src: String(doc.src || "zh"),
  },
  {
    title: "微信",
    channel: "微信",
    sort: 1,
    account: String(doc.wechatId ?? ""),
    qr: String(doc.wechatQr ?? ""),
    noteZh: "",
    noteEn: "",
    src: "zh",
  },
  {
    title: "WhatsApp",
    channel: "WhatsApp",
    sort: 2,
    account: String(doc.whatsapp ?? ""),
    qr: "",
    noteZh: "",
    noteEn: "",
    src: "zh",
  },
  {
    title: "邮箱",
    channel: "邮箱",
    sort: 3,
    account: String(doc.email ?? ""),
    qr: "",
    noteZh: "",
    noteEn: "",
    src: "zh",
  },
];

function propsOf(row) {
  return {
    标题: { title: [{ type: "text", text: { content: row.title } }] },
    通道: { select: { name: row.channel } },
    账号: rt(row.account),
    二维码: rt(row.qr),
    note_zh: rt(row.noteZh),
    note_en: rt(row.noteEn),
    排序: { number: row.sort },
    src: { select: { name: row.src || "zh" } },
    状态: { select: { name: "已发布" } },
  };
}

const description = [
  {
    type: "text",
    text: {
      content:
        "询单发送失败时的兜底联系方式。一行一个通道：说明、微信、WhatsApp、邮箱。留空或标「已下线」则网站不显示。二维码只写 public 相对路径。改完跑 npm run content:notion → ",
    },
  },
  {
    type: "text",
    text: { content: "content/concierge.yaml", link: { url: GH } },
  },
  { type: "text", text: { content: "。" } },
];

let dbId = cfg.databases?.concierge ? uuid(cfg.databases.concierge) : "";
if (dbId) {
  try {
    await notion(`/databases/${dbId}`);
  } catch {
    dbId = "";
  }
}

if (!dbId) {
  const routes = await notion(`/databases/${uuid(cfg.databases.routes)}`);
  const parentPageId = routes.parent?.page_id;
  if (!parentPageId) throw new Error("找不到内容页，无法建表");
  const created = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "管家联系方式" } }],
      description,
      properties: {
        标题: { title: {} },
        通道: {
          select: {
            options: [
              { name: "说明", color: "gray" },
              { name: "微信", color: "green" },
              { name: "WhatsApp", color: "blue" },
              { name: "邮箱", color: "orange" },
            ],
          },
        },
        账号: { rich_text: {} },
        二维码: { rich_text: {} },
        note_zh: { rich_text: {} },
        note_en: { rich_text: {} },
        排序: { number: { format: "number" } },
        src: {
          select: {
            options: [
              { name: "zh", color: "red" },
              { name: "en", color: "blue" },
            ],
          },
        },
        状态: {
          select: {
            options: [
              { name: "已发布", color: "green" },
              { name: "草稿", color: "yellow" },
              { name: "已下线", color: "red" },
            ],
          },
        },
      },
    }),
  });
  dbId = created.id;
  console.log("已建表", created.url);
} else {
  await notion(`/databases/${dbId}`, {
    method: "PATCH",
    body: JSON.stringify({ description }),
  });
  console.log("表已存在，更新说明", dbId);
}

const existing = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;
  const q = await notion(`/databases/${dbId}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  existing.push(...(q.results ?? []));
  cursor = q.has_more ? q.next_cursor : undefined;
} while (cursor);

function channelOf(page) {
  return page.properties?.通道?.select?.name ?? "";
}

for (const row of rows) {
  const hit = existing.find((page) => channelOf(page) === row.channel);
  if (hit) {
    await notion(`/pages/${hit.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: propsOf(row) }),
    });
    console.log("更新", row.channel);
  } else {
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: propsOf(row),
      }),
    });
    console.log("新增", row.channel);
  }
}

const idHex = bare(dbId);
const rawCfg = fs.readFileSync(cfgPath, "utf8");
let next = rawCfg;
if (/^\s*concierge:/m.test(rawCfg)) {
  next = rawCfg.replace(/^(\s*concierge:\s*)(?:"[^"]*"|'[^']*'|\S+)/m, `$1${idHex}`);
} else {
  next = rawCfg.replace(
    /^(\s*lightReviews:\s*\S+)/m,
    `$1\n  # 询单发送失败时的兜底联系方式（一行一个通道）\n  concierge: ${idHex}`,
  );
}
if (next === rawCfg) {
  console.log(`未写入 notion.yaml，请手动加上 concierge: ${idHex}`);
} else {
  fs.writeFileSync(cfgPath, next, "utf8");
  console.log("已写入 content/notion.yaml → concierge");
}

let linkCursor;
let bulletId = "";
do {
  const q = new URLSearchParams({ page_size: "100" });
  if (linkCursor) q.set("start_cursor", linkCursor);
  const kids = await notion(`/blocks/${LINKS_PAGE}/children?${q}`);
  for (const block of kids.results ?? []) {
    if (block.type !== "bulleted_list_item") continue;
    const text = (block.bulleted_list_item.rich_text ?? []).map((t) => t.plain_text).join("");
    if (text.includes("concierge.yaml") || text.includes("管家联系方式")) bulletId = block.id;
  }
  linkCursor = kids.has_more ? kids.next_cursor : undefined;
} while (linkCursor && !bulletId);

const linkRich = [
  { type: "text", text: { content: "发送失败时的管家联系方式 → 表「管家联系方式」，一行一个通道 → " } },
  { type: "text", text: { content: "content/concierge.yaml", link: { url: GH } } },
];
if (bulletId) {
  await notion(`/blocks/${bulletId}`, {
    method: "PATCH",
    body: JSON.stringify({ bulleted_list_item: { rich_text: linkRich } }),
  });
  console.log("已更新 YAML 文件链接");
} else {
  console.warn("未找到 YAML 文件链接里的管家那一行");
}

console.log("完成。接着跑 npm run content:notion 可把表同步回 content/concierge.yaml");
