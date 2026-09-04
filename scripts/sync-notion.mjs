#!/usr/bin/env node
/**
 * Pull Notion DBs and overwrite content/*.yaml when Notion is newer than Git.
 * Usage: NOTION_TOKEN=secret_... node scripts/sync-notion.mjs
 * Missing token/ids → skip (site keeps YAML).
 *
 * Bilingual fields use keepTx (scripts/lib/keepTx.mjs):
 * - src language ← Notion (fallback YAML)
 * - translation ← YAML unless Notion text is non-empty and differs from YAML
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { keepTx, pair } from "./lib/keepTx.mjs";

const root = process.cwd();
const VERSION = "2022-06-28";
const cfgPath = path.join(root, "content", "notion.yaml");

function loadDotenv() {
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
}

function uuid(raw) {
  const hex = String(raw).replace(/-/g, "").replace(/.*\/([0-9a-f]{32}).*/i, "$1");
  const h = hex.match(/^[0-9a-f]{32}$/i)?.[0];
  if (!h) return "";
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function splitLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function linesToTx(zhBlock, enBlock) {
  const zh = splitLines(zhBlock);
  const en = splitLines(enBlock);
  const n = Math.max(zh.length, en.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push(pair(zh[i] ?? "", en[i] ?? ""));
  return out;
}

function githubTime(rel) {
  try {
    const out = execSync(`git log --format=%cI%x09%s -- "${rel}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    for (const line of out.trim().split("\n")) {
      if (!line) continue;
      const tab = line.indexOf("\t");
      const iso = tab === -1 ? line : line.slice(0, tab);
      const msg = tab === -1 ? "" : line.slice(tab + 1);
      if (/sync from Notion/i.test(msg)) continue;
      const t = Date.parse(iso);
      if (Number.isFinite(t)) return t;
    }
  } catch {
    /* new file */
  }
  return 0;
}

function notionTime(pages) {
  let max = 0;
  for (const p of pages) {
    const t = Date.parse(p.last_edited_time);
    if (t > max) max = t;
  }
  return max;
}

function takeNotion(pages, relYaml) {
  const n = notionTime(pages);
  if (!n) return false;
  const g = githubTime(relYaml);
  return n > g + 1000;
}

function prop(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  switch (p.type) {
    case "title":
      return p.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return p.rich_text.map((t) => t.plain_text).join("");
    case "select":
      return p.select?.name ?? "";
    case "multi_select":
      return p.multi_select.map((o) => o.name);
    case "number":
      return p.number;
    case "date":
      return p.date?.start ?? "";
    case "url":
      return p.url ?? "";
    case "checkbox":
      return p.checkbox;
    case "relation":
      return p.relation.map((r) => r.id);
    default:
      return "";
  }
}

function text(page, name) {
  const v = prop(page, name);
  if (Array.isArray(v)) return v.join(",");
  if (v == null) return "";
  return String(v);
}

function list(page, name) {
  const v = prop(page, name);
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
    return v.filter(Boolean);
  }
  return splitLines(String(v ?? "").replace(/,/g, "\n"));
}

function statusOf(page) {
  return text(page, "状态") || text(page, "status");
}

function published(page) {
  const s = statusOf(page);
  if (!s || s === "已发布") return true;
  if (s === "已下线" || s === "草稿") return false;
  return true;
}

async function notionFetch(token, url, init = {}) {
  const res = await fetch(url, {
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
    const msg = body.message || res.statusText;
    throw new Error(`Notion ${res.status} ${url}: ${msg}`);
  }
  return body;
}

async function queryAll(token, databaseId) {
  const id = uuid(databaseId);
  if (!id) return [];
  const pages = [];
  let cursor;
  do {
    const body = await notionFetch(token, `https://api.notion.com/v1/databases/${id}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    pages.push(...(body.results ?? []));
    cursor = body.has_more ? body.next_cursor : undefined;
  } while (cursor);
  return pages;
}

function writeYaml(rel, header, data) {
  const doc = stringifyYaml(data, { lineWidth: 0 });
  const text = `${header.trim()}\n\n${doc}`;
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text, "utf8");
  console.log(`updated ${rel}`);
}

function keepTxLines(srcLang, notionZhBlock, notionEnBlock, prevArr) {
  const zhLines = splitLines(notionZhBlock);
  const enLines = splitLines(notionEnBlock);
  const prev = Array.isArray(prevArr) ? prevArr : [];
  const n = Math.max(zhLines.length, enLines.length, prev.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = keepTx(srcLang, zhLines[i] ?? "", enLines[i] ?? "", prev[i]);
    if (p) out.push(p);
  }
  return out;
}

function dumpTxMap(page, keys, prev, srcLang) {
  const out = {};
  for (const key of keys) {
    const p = keepTx(srcLang, text(page, `${key}_zh`), text(page, `${key}_en`), prev?.[key]);
    if (p) out[key] = p;
  }
  return out;
}

function routeIdMap(routesPages) {
  const map = new Map();
  for (const p of routesPages) {
    const id = text(p, "id").trim();
    if (!id) continue;
    map.set(p.id, id);
    map.set(p.id.replace(/-/g, ""), id);
  }
  return map;
}

function resolveRoute(page, titleByPageId, names = ["路线", "route"]) {
  for (const name of names) {
    const raw = text(page, name).trim();
    if (/^r[123]$/.test(raw)) return raw;
    const rels = prop(page, name);
    const first = Array.isArray(rels) ? rels[0] : "";
    if (!first) continue;
    const id = titleByPageId.get(first) || titleByPageId.get(String(first).replace(/-/g, ""));
    if (/^r[123]$/.test(id)) return id;
  }
  return "";
}

function existingYaml(rel) {
  const abs = path.join(root, rel);
  let doc = {};
  if (fs.existsSync(abs)) {
    try {
      doc = parseYaml(fs.readFileSync(abs, "utf8")) ?? {};
    } catch {
      doc = {};
    }
  }
  if (!doc.date) {
    try {
      const committed = parseYaml(execSync(`git show HEAD:${rel}`, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })) ?? {};
      if (committed.date) doc.date = committed.date;
      if (!doc.route && committed.route) doc.route = committed.route;
    } catch {
      /* no committed copy */
    }
  }
  return doc;
}

function daysPair(page, prev, srcLang) {
  let notionZh = text(page, "days_zh");
  let notionEn = text(page, "days_en");
  if (!notionZh && !notionEn) {
    const n = prop(page, "days");
    if (n != null && n !== "") {
      notionZh = `${n} 日`;
      notionEn = `${n} days`;
    }
  }
  if (/^\d+$/.test(notionZh)) notionZh = `${notionZh} 日`;
  if (/^\d+$/.test(notionEn)) notionEn = `${notionEn} days`;
  return keepTx(srcLang, notionZh, notionEn, prev?.days);
}

async function main() {
  loadDotenv();
  const token = process.env.NOTION_TOKEN?.trim();
  const cfg = fs.existsSync(cfgPath) ? parseYaml(fs.readFileSync(cfgPath, "utf8")) : {};
  const dbs = cfg.databases ?? {};
  const filled = Object.values(dbs).filter((v) => String(v ?? "").trim());
  if (!token || filled.length === 0) {
    console.log(`
跳过 Notion 同步（尚未配置）。

请在 Notion 完成：
1. https://www.notion.so/my-integrations → 新内部集成 → 复制 Token
2. 打开「网站内容优化」→ ⋯ → 连接 → 勾选该集成
3. 每个表格打开整页，复制链接，把 32 位 ID 填进 content/notion.yaml
4. 本地：.env.local 写 NOTION_TOKEN=secret_...
   GitHub：Settings → Secrets → NOTION_TOKEN

然后运行：npm run content:notion
`);
    return;
  }

  let changed = false;
  const mark = () => {
    changed = true;
  };

  // --- 路线 ---
  if (dbs.routes) {
    const pages = (await queryAll(token, dbs.routes)).filter(published);
    const byId = new Map();
    for (const page of pages) {
      const id = text(page, "id").trim() || text(page, "标题").trim();
      if (/^r[123]$/.test(id)) byId.set(id, page);
    }
    for (const id of ["r1", "r2", "r3"]) {
      const page = byId.get(id);
      if (!page) continue;
      const rel = `content/routes/${id}.yaml`;
      if (!takeNotion([page], rel)) continue;
      const prev = existingYaml(rel);
      const srcLang = text(page, "src") || prev.src || "zh";
      const days = daysPair(page, prev, srcLang);
      writeYaml(
        rel,
        `# 路线卡片 · ${id}\n# 改名称、价格、卖点、封面。逐日行程请改 content/itineraries/${id}.yaml\n# cover 只写 public 下的相对路径`,
        {
          src: srcLang,
          cover: text(page, "cover"),
          ...dumpTxMap(
            page,
            ["badge", "name", "tagline", "regions", "feature", "entry", "exit", "audience", "price"],
            prev,
            srcLang,
          ),
          ...(days ? { days } : {}),
          included: list(page, "included"),
          excluded: list(page, "excluded"),
        },
      );
      mark();
    }
  }

  // --- 行程 ---
  if (dbs.itineraries) {
    const routesPages = dbs.routes ? await queryAll(token, dbs.routes) : [];
    const titleByPageId = routeIdMap(routesPages);
    const days = await queryAll(token, dbs.itineraries);
    const grouped = { r1: [], r2: [], r3: [] };
    for (const page of days) {
      if (!published(page)) continue;
      const route = resolveRoute(page, titleByPageId);
      if (!grouped[route]) continue;
      grouped[route].push(page);
    }
    for (const id of ["r1", "r2", "r3"]) {
      let pages = grouped[id];
      if (!pages.length) continue;
      const rel = `content/itineraries/${id}.yaml`;
      if (!takeNotion(pages, rel)) continue;
      const prevDoc = existingYaml(rel);
      const prevByDay = new Map((Array.isArray(prevDoc.days) ? prevDoc.days : []).map((d) => [Number(d.day), d]));
      pages.sort((a, b) => Number(prop(a, "day") ?? 0) - Number(prop(b, "day") ?? 0));
      const deduped = new Map();
      for (const page of pages) {
        const dayNum = Number(prop(page, "day")) || 0;
        const prev = deduped.get(dayNum);
        if (!prev || Date.parse(page.last_edited_time) >= Date.parse(prev.last_edited_time)) {
          deduped.set(dayNum, page);
        }
      }
      pages = [...deduped.values()].sort((a, b) => Number(prop(a, "day") ?? 0) - Number(prop(b, "day") ?? 0));
      const fileSrc = text(pages[0], "src") || prevDoc.src || "zh";
      const dayObjs = pages.map((page) => {
        const dayNum = Number(prop(page, "day")) || 0;
        const prevDay = prevByDay.get(dayNum) ?? {};
        const day = {
          day: dayNum,
          city: keepTx(fileSrc, text(page, "city_zh"), text(page, "city_en"), prevDay.city) || pair("", ""),
          stay: keepTx(fileSrc, text(page, "stay_zh"), text(page, "stay_en"), prevDay.stay) || pair("", ""),
          stayKind: text(page, "stayKind") || prevDay.stayKind || "hotel",
        };
        const placeId = text(page, "placeId");
        if (placeId) day.placeId = placeId;
        const drive = keepTx(fileSrc, text(page, "drive_zh"), text(page, "drive_en"), prevDay.drive);
        if (drive) day.drive = drive;
        const transport = keepTx(fileSrc, text(page, "transport_zh"), text(page, "transport_en"), prevDay.transport);
        if (transport) day.transport = transport;
        const lodging = keepTx(fileSrc, text(page, "lodging_zh"), text(page, "lodging_en"), prevDay.lodging);
        if (lodging) day.lodging = lodging;
        const dining = keepTxLines(fileSrc, text(page, "dining_zh"), text(page, "dining_en"), prevDay.dining);
        if (dining.length) day.dining = dining;
        const bullets = keepTxLines(fileSrc, text(page, "bullets_zh"), text(page, "bullets_en"), prevDay.bullets);
        if (bullets.length) day.bullets = bullets;
        else day.bullets = [];
        const themes = list(page, "themes");
        day.themes = themes.length ? themes : [];
        const photos = splitLines(text(page, "photos"));
        if (photos.length) day.photos = photos;
        return day;
      });
      writeYaml(
        rel,
        `# 逐日行程 · ${id}\n# 每一天：城市、住宿、交通、餐饮、活动 bullets、主题 themes\n# photos 只写 public 下的相对路径`,
        { src: fileSrc, days: dayObjs },
      );
      mark();
    }
  }

  // --- 评价 ---
  if (dbs.reviews) {
    const routesPages = dbs.routes ? await queryAll(token, dbs.routes) : [];
    const titleByPageId = routeIdMap(routesPages);
    const pages = await queryAll(token, dbs.reviews);
    const relDir = "content/reviews";
    const wanted = new Set();
    for (const page of pages) {
      const slug = (text(page, "slug") || text(page, "标题")).trim().replace(/\s+/g, "-").toLowerCase();
      if (!slug) continue;
      wanted.add(slug);
      const rel = `${relDir}/${slug}.yaml`;
      if (!published(page)) {
        if (takeNotion([page], rel) && fs.existsSync(path.join(root, rel))) {
          fs.unlinkSync(path.join(root, rel));
          console.log(`removed ${rel} (已下线)`);
          mark();
        }
        continue;
      }
      if (!takeNotion([page], rel)) continue;
      const prev = existingYaml(rel);
      const srcLang = text(page, "src") || prev.src || "zh";
      const route = resolveRoute(page, titleByPageId) || prev.route || "r1";
      writeYaml(
        rel,
        `# 用户评价 · ${text(page, "name") || slug}\n# route 只能填 r1 / r2 / r3；photos 写 destinations/文件名.jpg`,
        {
          src: srcLang,
          flag: text(page, "flag"),
          name: text(page, "name"),
          country: text(page, "country"),
          route,
          rating: Number(prop(page, "rating")) || 5,
          date: text(page, "date") || prev.date || "",
          short: keepTx(srcLang, text(page, "short_zh"), text(page, "short_en"), prev.short),
          full: keepTx(srcLang, text(page, "full_zh"), text(page, "full_en"), prev.full),
          photos: splitLines(text(page, "photos")),
        },
      );
      mark();
    }
    const dirAbs = path.join(root, relDir);
    if (fs.existsSync(dirAbs)) {
      for (const name of fs.readdirSync(dirAbs)) {
        if (!name.endsWith(".yaml")) continue;
        const slug = name.slice(0, -5);
        if (wanted.has(slug)) continue;
        const rel = `${relDir}/${name}`;
        fs.unlinkSync(path.join(root, rel));
        console.log(`removed ${rel} (Notion 中已无此条)`);
        mark();
      }
    }
  }

  // --- FAQ ---
  if (dbs.faqs) {
    const pages = (await queryAll(token, dbs.faqs)).filter(published);
    const rel = "content/faqs.yaml";
    if (pages.length && takeNotion(pages, rel)) {
      const groups = new Map();
      for (const page of pages) {
        const gid = text(page, "group_id") || "misc";
        if (!groups.has(gid)) {
          groups.set(gid, {
            id: gid,
            label: pair(text(page, "group_zh"), text(page, "group_en")),
            items: [],
          });
        }
        groups.get(gid).items.push({
          id: text(page, "id"),
          q: pair(text(page, "q_zh"), text(page, "q_en")),
          a: pair(text(page, "a_zh"), text(page, "a_en")),
        });
      }
      writeYaml(
        rel,
        `# 常见问题 FAQ\n# 按分组编辑。改 id 时请同步页面锚点`,
        { src: text(pages[0], "src") || "zh", groups: [...groups.values()] },
      );
      mark();
    }
  }

  // --- 商家 ---
  if (dbs.partners) {
    const pages = (await queryAll(token, dbs.partners)).filter(published);
    const rel = "content/partners.yaml";
    if (pages.length && takeNotion(pages, rel)) {
      const listRows = pages.map((page) => {
        const item = {
          name: pair(text(page, "name_zh"), text(page, "name_en")),
          category: pair(text(page, "category_zh"), text(page, "category_en")),
          location: pair(text(page, "location_zh"), text(page, "location_en")),
          desc: pair(text(page, "desc_zh"), text(page, "desc_en")),
          emoji: text(page, "emoji"),
          color: text(page, "color"),
          links: [],
        };
        for (const n of [1, 2]) {
          const url = text(page, `link${n}_url`);
          if (!url) continue;
          item.links.push({
            label: pair(text(page, `link${n}_zh`), text(page, `link${n}_en`)),
            url,
            type: text(page, `link${n}_type`) === "web" ? "web" : "google",
          });
        }
        return item;
      });
      writeYaml(
        rel,
        `# 合作商家\n# type 只能是 google 或 web`,
        { src: text(pages[0], "src") || "zh", list: listRows },
      );
      mark();
    }
  }

  // --- Hero ---
  if (dbs.hero) {
    const pages = (await queryAll(token, dbs.hero)).filter(published);
    const rel = "content/hero.yaml";
    if (pages.length && takeNotion(pages, rel)) {
      const slides = pages.map((page) => ({
        id: text(page, "id"),
        video: text(page, "video"),
        poster: text(page, "poster"),
        pos: text(page, "pos") || "center 50%",
        themeId: text(page, "themeId") || "wild",
        alt: pair(text(page, "alt_zh"), text(page, "alt_en")),
        title: pair(text(page, "title_zh"), text(page, "title_en")),
        intro: pair(text(page, "intro_zh"), text(page, "intro_en")),
      }));
      writeYaml(
        rel,
        `# 首页 Hero 轮播\n# video 填 COS 对象路径；poster 填 destinations/xxx.jpg\n# themeId 只能是 wild / flavors / villages / locals`,
        { src: text(pages[0], "src") || "zh", slides },
      );
      mark();
    }
  }

  // --- About ---
  if (dbs.about) {
    const pages = (await queryAll(token, dbs.about)).filter(published);
    const creds = dbs.aboutCreds ? (await queryAll(token, dbs.aboutCreds)).filter(published) : [];
    const rel = "content/about.yaml";
    const all = [...pages, ...creds];
    if (pages.length && takeNotion(all, rel)) {
      const page = pages[0];
      const pointsZh = splitLines(text(page, "points_zh"));
      const pointsEn = splitLines(text(page, "points_en"));
      const n = Math.max(pointsZh.length, pointsEn.length);
      const points = [];
      for (let i = 0; i < n; i++) points.push(pair(pointsZh[i] ?? "", pointsEn[i] ?? ""));
      const credItems = creds.map((c) => ({
        icon: text(c, "icon"),
        ...pair(text(c, "zh"), text(c, "en")),
      }));
      writeYaml(
        rel,
        `# 关于我们 About Us\n# 公司介绍、三点摘要、资质与保障`,
        {
          src: text(page, "src") || "zh",
          kicker: pair(text(page, "kicker_zh"), text(page, "kicker_en")),
          name: pair(text(page, "name_zh"), text(page, "name_en")),
          role: pair(text(page, "role_zh"), text(page, "role_en")),
          body1: pair(text(page, "body1_zh"), text(page, "body1_en")),
          body2Lead: pair(text(page, "body2Lead_zh"), text(page, "body2Lead_en")),
          body2: pair(text(page, "body2_zh"), text(page, "body2_en")),
          points,
          credsTitle: pair(text(page, "credsTitle_zh"), text(page, "credsTitle_en")),
          credsSub: pair(text(page, "credsSub_zh"), text(page, "credsSub_en")),
          creds: credItems,
        },
      );
      mark();
    }
  }

  if (!changed) console.log("Notion 无更新（GitHub yaml 更新或内容相同），未改文件。");
}

main().catch((err) => {
  console.error(err.message || err);
  if (process.env.GITHUB_ACTIONS) {
    console.warn("Notion 同步失败，已回退为仓库里的 yaml 继续构建。");
    process.exit(0);
  }
  process.exit(1);
});
