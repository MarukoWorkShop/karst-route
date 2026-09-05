#!/usr/bin/env node
/**
 * 路线卡片 Notion 表：为介绍字段注明首页「第一段」推荐字数，并加超限标红公式列。
 * 基准：路线二当前中文首段高度（约 71 字 / 英文约 204 字符）。
 *
 * Usage: node scripts/notion-routes-feature-limits.mjs
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

const ZH_MAX = 75;
const EN_MAX = 210;

const cfg = parseYaml(fs.readFileSync(path.join(root, "content", "notion.yaml"), "utf8"));
const VERSION = "2022-06-28";

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "").replace(/.*\/([0-9a-f]{32}).*/i, "$1");
  const h = hex.match(/^[0-9a-f]{32}$/i)?.[0];
  if (!h) throw new Error(`bad id: ${raw}`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.body = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

/** 取空行前的第一段字数；超限标红（emoji + style） */
function firstParaLenFormula(propName, max, unit, { stripSpaces = false } = {}) {
  const nExpr = stripSpaces
    ? `length(replaceAll(first, " ", ""))`
    : `length(first)`;
  return `lets(
  raw, prop("${propName}"),
  parts, split(raw, "\\n\\n"),
  first, if(empty(parts), "", parts.at(0)),
  n, ${nExpr},
  ifs(
    empty(raw), "—",
    n > ${max}, style("🔴 " + format(n) + " ${unit} · 上限 ${max}", "red"),
    style("✅ " + format(n) + " ${unit} · 上限 ${max}", "green")
  )
)`;
}

const dbId = uuid(cfg.databases.routes);

const descZh = `【首页只显示第一段】第一段中文不得超过 ${ZH_MAX} 字（基准：路线二约 71 字，约 4 行高度）。空一行后再写后续段落，展开后可见全文。`;
const descEn = `【Homepage shows 1st paragraph only】First paragraph English ≤ ${EN_MAX} characters (Route 2 ≈ 204 chars, ~same height as ZH). Add a blank line, then more paragraphs for the expand view.`;

const body = {
  properties: {
    feature_zh: {
      rich_text: {},
      description: descZh,
    },
    feature_en: {
      rich_text: {},
      description: descEn,
    },
    "首段字数·中": {
      description: `自动统计 feature_zh 第一段字数；超过 ${ZH_MAX} 变红。`,
      formula: {
        expression: firstParaLenFormula("feature_zh", ZH_MAX, "字", { stripSpaces: true }),
      },
    },
    "首段字数·英": {
      description: `自动统计 feature_en 第一段字符数（含空格）；超过 ${EN_MAX} 变红。`,
      formula: {
        expression: firstParaLenFormula("feature_en", EN_MAX, "字符"),
      },
    },
  },
};

try {
  await api("PATCH", `https://api.notion.com/v1/databases/${dbId}`, body);
  console.log(`已更新「路线卡片」：`);
  console.log(`  feature_zh 说明：中文第一段 ≤ ${ZH_MAX} 字`);
  console.log(`  feature_en 说明：英文第一段 ≤ ${EN_MAX} 字符`);
  console.log(`  新增公式列：首段字数·中 / 首段字数·英（超限红色）`);
} catch (e) {
  // style() 若库版本不支持，降级为纯 emoji
  if (e.body?.message && /formula|expression|style/i.test(String(e.body.message))) {
    console.warn("带 style() 的公式失败，改用纯 emoji 重试…", e.body.message);
    const plain = (prop, max, unit) =>
      `lets(raw, prop("${prop}"), parts, split(raw, "\\n\\n"), first, if(empty(parts), "", parts.at(0)), cleaned, replaceAll(first, " ", ""), n, length(cleaned), ifs(empty(raw), "—", n > ${max}, "🔴 " + format(n) + " ${unit} · 上限 ${max}", "✅ " + format(n) + " ${unit} · 上限 ${max}"))`;
    body.properties["首段字数·中"].formula.expression = plain("feature_zh", ZH_MAX, "字");
    body.properties["首段字数·英"].formula.expression = plain("feature_en", EN_MAX, "字符");
    await api("PATCH", `https://api.notion.com/v1/databases/${dbId}`, body);
    console.log("已用降级公式更新成功。");
  } else {
    console.error(e.message, e.body ? JSON.stringify(e.body, null, 2) : "");
    process.exit(1);
  }
}
