#!/usr/bin/env node
/**
 * 在 Notion 建「轻体验栏目」数据库 + 「轻体验 · YAML 映射说明」文档页，
 * 并把 content/experiences.yaml 的现有内容填进去。跑完打印链接与待填 ID。
 *
 * 用法：
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-light.mjs
 *   NOTION_TOKEN=secret_xxx node scripts/notion-create-light.mjs --page=<32位父页面ID>
 *
 * 父页面默认取 content/notion.yaml 里 routes 表所在的页面。
 * 只建表不填数据：加 --empty
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const VERSION = "2022-06-28";
const root = process.cwd();

const args = process.argv.slice(2);
const empty = args.includes("--empty");
const pageArg = args.find((a) => a.startsWith("--page="));

const envFile = path.join(root, ".env.local");
let token = process.env.NOTION_TOKEN?.trim() || "";
if (!token && fs.existsSync(envFile)) {
  const m = fs.readFileSync(envFile, "utf8").match(/^\s*NOTION_TOKEN\s*=\s*(.+?)\s*$/m);
  if (m) token = m[1].replace(/^["']|["']$/g, "").trim();
}
if (!token) {
  console.log("\n缺少 NOTION_TOKEN。先建 Internal 集成并复制 Token，放到 .env.local 里。\n");
  process.exit(1);
}

const cfgPath = path.join(root, "content", "notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8")) ?? {};
const uuid = (v) => String(v ?? "").replace(/-/g, "").trim();

async function notion(url, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${url}`, {
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
          ? "找不到页面 —— 确认已在该页面 ⋯ → 连接 里勾选集成"
          : "";
    throw new Error(`Notion ${res.status} ${body.message || res.statusText}${hint ? ` · ${hint}` : ""}`);
  }
  return body;
}

// 父页面：优先 --page，其次用 routes 表所在页面
let parentPageId = pageArg ? pageArg.slice(7).trim() : "";
if (!parentPageId && cfg.databases?.routes) {
  const db = await notion(`/databases/${uuid(cfg.databases.routes)}`);
  parentPageId = db.parent?.page_id ?? "";
}
if (!/^[0-9a-fA-F-]{32,36}$/.test(parentPageId)) {
  console.log("拿不到父页面 ID，请用 --page=<32位ID> 指定。");
  process.exit(1);
}

// --- 1. 建数据库 ---
const title = (n) => ({ [n]: { title: {} } });
const rich = (n) => ({ [n]: { rich_text: {} } });
const select = (n, options) => ({ [n]: { select: { options: options.map((name) => ({ name })) } } });

const IDS = ["hike", "photo", "village", "foodfilm", "craft", "wellness"];

const db = await notion("/databases", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    title: [{ type: "text", text: { content: "轻体验栏目" } }],
    properties: {
      ...title("标题"),
      ...select("id", IDS),
      ...rich("badge"),
      ...rich("title_zh"),
      ...rich("title_en"),
      ...rich("tagline_zh"),
      ...rich("tagline_en"),
      ...rich("duration_zh"),
      ...rich("duration_en"),
      ...rich("group_zh"),
      ...rich("group_en"),
      ...rich("season_zh"),
      ...rich("season_en"),
      ...rich("cover"),
      ...rich("gallery"),
      ...rich("desc1_zh"),
      ...rich("desc1_en"),
      ...rich("desc2_zh"),
      ...rich("desc2_en"),
      ...rich("highlights_zh"),
      ...rich("highlights_en"),
      ...rich("included_zh"),
      ...rich("included_en"),
      ...rich("note"),
    },
  }),
});
console.log(`建表：轻体验栏目`);

// --- 2. 从 content/experiences.yaml 填数据 ---
let items = [];
try {
  const doc = parseYaml(fs.readFileSync(path.join(root, "content", "experiences.yaml"), "utf8")) ?? {};
  items = Array.isArray(doc.items) ? doc.items : [];
} catch {
  console.log("（未读到 content/experiences.yaml，只建空表）");
}

const rt = (v) => ({ rich_text: [{ text: { content: String(v ?? "") } }] });
const sl = (v) => (v ? { select: { name: String(v) } } : { select: null });

if (!empty) {
  let n = 0;
  for (const it of items) {
    if (!IDS.includes(it?.id)) continue;
    const d = Array.isArray(it.desc) ? it.desc : [];
    await notion("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: db.id },
        properties: {
          标题: { title: [{ text: { content: `${it.id} · ${it.title?.zh ?? it.id}` } }] },
          id: sl(it.id),
          badge: rt(it.badge ?? ""),
          title_zh: rt(it.title?.zh ?? ""),
          title_en: rt(it.title?.en ?? ""),
          tagline_zh: rt(it.tagline?.zh ?? ""),
          tagline_en: rt(it.tagline?.en ?? ""),
          duration_zh: rt(it.duration?.zh ?? ""),
          duration_en: rt(it.duration?.en ?? ""),
          group_zh: rt(it.group?.zh ?? ""),
          group_en: rt(it.group?.en ?? ""),
          season_zh: rt(it.season?.zh ?? ""),
          season_en: rt(it.season?.en ?? ""),
          cover: rt(it.cover ?? ""),
          gallery: rt((it.gallery ?? []).join("\n")),
          desc1_zh: rt(d[0]?.zh ?? ""),
          desc1_en: rt(d[0]?.en ?? ""),
          desc2_zh: rt(d[1]?.zh ?? ""),
          desc2_en: rt(d[1]?.en ?? ""),
          highlights_zh: rt((it.highlights ?? []).map((x) => x?.zh ?? "").join("\n")),
          highlights_en: rt((it.highlights ?? []).map((x) => x?.en ?? "").join("\n")),
          included_zh: rt((it.included ?? []).map((x) => x?.zh ?? "").join("\n")),
          included_en: rt((it.included ?? []).map((x) => x?.en ?? "").join("\n")),
        },
      }),
    });
    n++;
  }
  console.log(`  已填入 ${n} 行（来自 content/experiences.yaml）`);
}

// --- 3. 建映射说明文档页 ---
const h = (text) => ({ object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: text } }] } });
const p = (text) => ({ object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: text } }] } });
const b = (text) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ text: { content: text } }] } });

const docPage = await notion("/pages", {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: uuid(parentPageId) },
    properties: { title: { title: [{ text: { content: "轻体验 · YAML 映射说明" } }] } },
    children: [
      p("这张表对应仓库里的 content/experiences.yaml，也就是官网首页「让旅途真正改变你」区块的六张卡片，以及点开后的详情大卡。改完表跑一次同步，网站就更新。"),
      h("一、Notion 列 → YAML 字段 → 网页位置"),
      b("id（选择）→ id → 栏目标识，只能选 hike / photo / village / foodfilm / craft / wellness，不要新增或改名"),
      b("badge（文本）→ badge → 卡片右上角小标签、大卡顶部；中英共用同一串英文，如 HIKING & CYCLING"),
      b("title_zh / title_en → title → 卡片主标题、大卡标题"),
      b("tagline_zh / tagline_en → tagline → 卡片副标题、大卡标题下一行"),
      b("duration_zh / duration_en → duration → 大卡三格参数里的「时长」"),
      b("group_zh / group_en → group → 「成团人数」"),
      b("season_zh / season_en → season → 「最佳季节」"),
      b("cover（文本）→ cover → 卡片封面图；只写 public 下相对路径，如 destinations/sapa.jpg"),
      b("gallery（文本，一行一条）→ gallery → 大卡三张图：第一张是主图，后两张是小图"),
      b("desc1_zh / desc1_en、desc2_zh / desc2_en → desc → 大卡正文两段"),
      b("highlights_zh / highlights_en（一行一条）→ highlights → 大卡「体验内容」列表"),
      b("included_zh / included_en（一行一条）→ included → 大卡「费用包含」标签"),
      b("note（文本）→ 不同步到网站，留给内部备注"),
      h("二、双语规则"),
      b("源语言（src=zh，中文）一侧以 Notion 为准"),
      b("另一侧（英文）留空则保留仓库里现有译文，只有明确改过才覆盖 —— 避免误清掉翻译"),
      h("三、改完怎么生效"),
      b("本地：npm run content:notion（需要 .env.local 里的 NOTION_TOKEN）"),
      b("线上：push 之后 GitHub Actions 会自动跑同步并部署"),
      b("两边谁的时间戳新，谁生效；紧急改动也可以直接改仓库里的 content/experiences.yaml"),
      h("四、注意事项"),
      b("表里不写价格：网站统一显示「按人数与日期报价」，避免把未确认的报价放出去"),
      b("图片不要贴 Notion 附件链接，只写 public 下的相对路径"),
      b("一行 = 一个栏目；删掉某行等于该栏目从网站下架"),
      b("时长 / 成团人数 / 季节目前是建议值，主理人确认后再定稿"),
    ],
  }),
});
console.log("建文档：轻体验 · YAML 映射说明");

// --- 4. 回填 notion.yaml ---
const rawCfg = fs.readFileSync(cfgPath, "utf8");
const next = rawCfg.replace(
  /^(\s*lightExperiences:\s*)(?:"[^"]*"|'[^']*'|[^\s#]*)/m,
  `$1${uuid(db.id)}`,
);
if (next !== rawCfg) {
  fs.writeFileSync(cfgPath, next, "utf8");
  console.log("已把 ID 写进 content/notion.yaml");
} else {
  console.log(`未找到 lightExperiences 行，请手动填入：${uuid(db.id)}`);
}

console.log(`
完成。链接：
  轻体验栏目（数据表）  ${db.url}
  YAML 映射说明（文档）  ${docPage.url}

随后可跑：npm run content:notion   （Notion → content/experiences.yaml → 网站）
`);
