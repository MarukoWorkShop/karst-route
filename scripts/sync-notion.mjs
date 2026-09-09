#!/usr/bin/env node
/**
 * Pull Notion DBs and overwrite content/*.yaml when Notion is newer than Git.
 * Usage: NOTION_TOKEN=secret_... node scripts/sync-notion.mjs
 * Missing token/ids → skip (site keeps YAML).
 *
 * Bilingual fields use keepTx (scripts/lib/keepTx.mjs):
 * - src language ← Notion (fallback YAML)
 * - translation ← Notion when non-empty and different from YAML (intentional edit);
 *   if src changed but Notion translation is empty or still the old companion text,
 *   clear translation so deploy can re-translate. Empty Notion alone never clears
 *   translation when src is unchanged.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { keepTx, pair } from "./lib/keepTx.mjs";
import { expandDaySheetRow } from "./lib/pricing-day-sheet.mjs";
import { estimateRouteParty } from "./lib/estimate-from-yaml.mjs";

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
        const blurb = keepTx(fileSrc, text(page, "blurb_zh"), text(page, "blurb_en"), prevDay.blurb);
        if (blurb) day.blurb = blurb;
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
        `# 逐日行程 · ${id}\n# 每一天：城市、住宿、交通、餐饮、活动 bullets、主题 themes\n# blurb 为当日介绍段；体验/餐饮/住宿深度文案见 content/destinations/{placeId}.yaml\n# photos 只写 public 下的相对路径`,
        { src: fileSrc, days: dayObjs },
      );
      mark();
    }
  }

  // --- 目的地详情（体验 / 餐饮 / 住宿 + culture 兜底）---
  if (dbs.destinations) {
    const pages = await queryAll(token, dbs.destinations);
    const relDir = "content/destinations";
    for (const page of pages) {
      if (!published(page)) continue;
      const id = (text(page, "id") || text(page, "标题")).trim().toLowerCase();
      if (!id) continue;
      const rel = `${relDir}/${id}.yaml`;
      if (!takeNotion([page], rel)) continue;
      const prev = existingYaml(rel);
      const srcLang = text(page, "src") || prev.src || "zh";
      const slides = splitLines(text(page, "slides"));
      writeYaml(
        rel,
        `# 目的地详情 · ${id}\n# 每日详情「体验 / 餐饮 / 住宿」与 culture 兜底介绍\n# photo / hotel_photo / slides 只写 public 下相对路径`,
        {
          src: srcLang,
          tagline: keepTx(srcLang, text(page, "tagline_zh"), text(page, "tagline_en"), prev.tagline),
          photo: text(page, "photo") || prev.photo || "",
          experience: {
            title: keepTx(
              srcLang,
              text(page, "experience_title_zh"),
              text(page, "experience_title_en"),
              prev.experience?.title,
            ),
            body: keepTx(
              srcLang,
              text(page, "experience_body_zh"),
              text(page, "experience_body_en"),
              prev.experience?.body,
            ),
          },
          cuisine: {
            title: keepTx(
              srcLang,
              text(page, "cuisine_title_zh"),
              text(page, "cuisine_title_en"),
              prev.cuisine?.title,
            ),
            body: keepTx(
              srcLang,
              text(page, "cuisine_body_zh"),
              text(page, "cuisine_body_en"),
              prev.cuisine?.body,
            ),
          },
          hotel: {
            title: keepTx(
              srcLang,
              text(page, "hotel_title_zh"),
              text(page, "hotel_title_en"),
              prev.hotel?.title,
            ),
            body: keepTx(
              srcLang,
              text(page, "hotel_body_zh"),
              text(page, "hotel_body_en"),
              prev.hotel?.body,
            ),
            photo: text(page, "hotel_photo") || prev.hotel?.photo || "",
          },
          culture: keepTx(srcLang, text(page, "culture_zh"), text(page, "culture_en"), prev.culture),
          slides: slides.length ? slides : prev.slides || [],
        },
      );
      mark();
    }
  }

  // --- 线路路书 PDF ---
  if (dbs.guidebooks) {
    const pages = (await queryAll(token, dbs.guidebooks)).filter(published);
    const rel = "content/guidebooks.yaml";
    if (pages.length && takeNotion(pages, rel)) {
      const prev = existingYaml(rel);
      const prevRoutes =
        prev.routes && typeof prev.routes === "object" ? prev.routes : {};
      const srcLang = text(pages[0], "src") || prev.src || "zh";
      const routesOut = {};
      for (const id of ["r1", "r2", "r3"]) {
        const page = pages.find((p) => {
          const rid = text(p, "id").trim() || text(p, "标题").trim();
          return rid === id;
        });
        const prevRow = prevRoutes[id] ?? {};
        if (!page) {
          routesOut[id] = prevRow;
          continue;
        }
        routesOut[id] = {
          file: text(page, "file") || prevRow.file || "",
          title:
            keepTx(srcLang, text(page, "title_zh"), text(page, "title_en"), prevRow.title) ||
            pair("", ""),
          downloadName: text(page, "downloadName") || prevRow.downloadName || "",
        };
      }
      writeYaml(
        rel,
        `# 线路路书 PDF（官网「下载路书」按钮）\n# file 只写 public 下相对路径，例如 guidebooks/r3/xxx.pdf\n# 有 file 则直接下载；空则回退为页面即时生成`,
        { src: srcLang, routes: routesOut },
      );
      mark();
    }
  }

  // --- 定价：产品库 + 按日一行 + 验算 → content/pricing.yaml ---
  if (
    dbs.pricing ||
    dbs.pricingAnchors ||
    dbs.pricingHotels ||
    dbs.pricingVehicles ||
    dbs.pricingGuides ||
    dbs.pricingMeals ||
    dbs.pricingTickets ||
    dbs.pricingMisc ||
    dbs.pricingDaySheet ||
    dbs.pricingValidate
  ) {
    const rel = "content/pricing.yaml";
    /** 中文列名优先，兼容旧英文列名 */
    const COL = {
      id: ["线路", "id"],
      status: ["估算开关", "status"],
      source: ["数据口径说明", "source"],
      leader: ["领队成本(元/团)", "leader"],
      leader1to2: ["领队成本1-2人", "leader_1_2"],
      leader1to4: ["领队成本1-4人", "leader_1_4"],
      leader5to10: ["领队成本5-10人", "leader_5_10"],
      leaderOver10: ["领队成本10人以上", "leader_10_plus"],
      ops: ["运营税费(元/团)", "ops"],
      reserve: ["储备金(元/团)", "reserve"],
      margin: ["加成率(如0.2=加20%)", "margin"],
      roundBase: ["报价取整基数(元)", "roundBase"],
      occupancy: ["同房人数(默认2)", "occupancy"],
      maxPax: ["人数上限", "maxPax"],
      labelZh: ["线路名称·中文", "label_zh"],
      labelEn: ["线路名称·英文", "label_en"],
      briefZh: ["行程总览·中文", "brief_zh"],
      briefEn: ["行程总览·英文", "brief_en"],
      route: ["线路", "route", "路线", "id"],
      n: ["人数档(如2/4/6)", "n"],
      anchorAdult: ["成人发布价(元)", "adult"],
      anchorChild: ["儿童发布价(元)", "child"],
    };
    const firstText = (page, names) => {
      if (!page) return "";
      for (const n of names) {
        const v = text(page, n).trim();
        if (v) return v;
      }
      return "";
    };
    const firstNum = (page, names, dflt = 0) => {
      if (!page) return dflt;
      for (const n of names) {
        const v = prop(page, n);
        if (v === "" || v == null) continue;
        const num = Number(v);
        if (Number.isFinite(num)) return num;
      }
      return dflt;
    };
    /** 选择项可能是「stay·住宿」或中文开关文案 → 归一成代码 */
    const normStatus = (raw) => {
      const s = String(raw || "").trim();
      if (["none", "demo", "confirmed"].includes(s)) return s;
      if (/^关闭/.test(s) || s.includes("不显示")) return "none";
      if (/^演示/.test(s) || s.includes("参考")) return "demo";
      if (/^正式/.test(s) || s.includes("对外")) return "confirmed";
      return "";
    };
    const catalogActive = (p) => {
      const s = text(p, "状态");
      return !s || s === "启用" || s === "已发布";
    };
    const paramPages = dbs.pricing ? (await queryAll(token, dbs.pricing)).filter(published) : [];
    const anchorPages = dbs.pricingAnchors
      ? await (async () => {
          try {
            return (await queryAll(token, dbs.pricingAnchors)).filter(published);
          } catch (e) {
            console.warn("跳过报价锚点表:", e.message);
            return [];
          }
        })()
      : [];
    const hotelPages = dbs.pricingHotels ? (await queryAll(token, dbs.pricingHotels)).filter(catalogActive) : [];
    const vehiclePages = dbs.pricingVehicles
      ? (await queryAll(token, dbs.pricingVehicles)).filter(catalogActive)
      : [];
    const guidePages = dbs.pricingGuides ? (await queryAll(token, dbs.pricingGuides)).filter(catalogActive) : [];
    const mealPages = dbs.pricingMeals ? (await queryAll(token, dbs.pricingMeals)).filter(catalogActive) : [];
    const ticketPages = dbs.pricingTickets
      ? (await queryAll(token, dbs.pricingTickets)).filter(catalogActive)
      : [];
    const miscPages = dbs.pricingMisc ? (await queryAll(token, dbs.pricingMisc)).filter(catalogActive) : [];
    const daySheetPages = dbs.pricingDaySheet
      ? (await queryAll(token, dbs.pricingDaySheet)).filter(published)
      : [];
    const validatePages = dbs.pricingValidate
      ? (await queryAll(token, dbs.pricingValidate)).filter(published)
      : [];
    const all = [
      ...paramPages,
      ...anchorPages,
      ...hotelPages,
      ...vehiclePages,
      ...guidePages,
      ...mealPages,
      ...ticketPages,
      ...miscPages,
      ...daySheetPages,
      ...validatePages,
    ];
    if (all.length && takeNotion(all, rel)) {
      const prev = existingYaml(rel);
      const prevRoutes = prev.routes && typeof prev.routes === "object" ? prev.routes : {};
      const routeOf = (page) => {
        const r = firstText(page, COL.route);
        return /^r[123]$/.test(r) ? r : "";
      };
      const srcLang = firstText(paramPages[0], ["src"]) || prev.src || "zh";
      const codeOf = (page) => text(page, "代号").trim();
      const hotelByPageId = new Map();
      const vehicleByPageId = new Map();
      const guideByPageId = new Map();
      const mealByPageId = new Map();
      const ticketByPageId = new Map();
      const miscByPageId = new Map();
      const catalogs = {
        hotels: hotelPages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "名称英文")),
            twinRate: firstNum(p, ["双人间含早价", "twinRate"], 0),
            city: text(p, "城市"),
          };
          hotelByPageId.set(p.id, row);
          return row;
        }),
        vehicles: vehiclePages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "标题")),
            maxPax: firstNum(p, ["最大载客", "maxPax"], 0),
            dayRate: firstNum(p, ["日包价", "dayRate"], 0),
            segment: text(p, "适用段"),
          };
          vehicleByPageId.set(p.id, row);
          return row;
        }),
        guides: guidePages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const splitRaw = text(p, "分摊方式");
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "标题")),
            dayRate: firstNum(p, ["日费用", "dayRate"], 0),
            split: splitRaw === "per_person" ? "per_person" : "per_group",
          };
          guideByPageId.set(p.id, row);
          return row;
        }),
        meals: mealPages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const adultRate = firstNum(p, ["成人价"], 0);
          const childRaw = firstNum(p, ["儿童价"], NaN);
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "名称英文")),
            mealType: text(p, "餐型"),
            adultRate,
            childRate: Number.isFinite(childRaw) ? childRaw : adultRate,
          };
          mealByPageId.set(p.id, row);
          return row;
        }),
        tickets: ticketPages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const adultRate = firstNum(p, ["成人价"], 0);
          const childRaw = firstNum(p, ["儿童价"], NaN);
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "名称英文")),
            adultRate,
            childRate: Number.isFinite(childRaw) ? childRaw : adultRate,
            payOnSiteDefault: prop(p, "默认可现付") === true,
          };
          ticketByPageId.set(p.id, row);
          return row;
        }),
        misc: miscPages.map((p) => {
          const id = codeOf(p) || text(p, "标题").trim();
          const splitRaw = text(p, "分摊口径");
          const adultRate = firstNum(p, ["成人价"], 0);
          const childRaw = firstNum(p, ["儿童价"], NaN);
          const row = {
            id,
            name: pair(text(p, "标题"), text(p, "名称英文")),
            category: text(p, "类别"),
            split: ["per_person", "per_group_split", "per_vehicle_split", "per_room_split"].includes(splitRaw)
              ? splitRaw
              : "per_person",
            adultRate,
            childRate: Number.isFinite(childRaw) ? childRaw : adultRate,
            groupRate: firstNum(p, ["整团价"], 0),
          };
          miscByPageId.set(p.id, row);
          return row;
        }),
      };
      const daysByRoute = { r1: [], r2: [], r3: [] };
      const relIds = (page, name) => {
        const v = prop(page, name);
        return Array.isArray(v) ? v : [];
      };
      const refOf = (pageId, map) => (pageId && map.get(pageId) ? map.get(pageId).id : "");
      const optNum = (page, names) => {
        const n = firstNum(page, names, NaN);
        return Number.isFinite(n) ? n : null;
      };
      /** 标题如「路线一·r1 · D2 · 崇左」→ 线路/日序/日标题（列被删时仍可用） */
      const parseSheetTitle = (page) => {
        const title = text(page, "标题") || "";
        const fromCol = routeOf(page);
        const route =
          fromCol ||
          (title.match(/·\s*(r[123])\s*·/i) || title.match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
          "";
        const dayFromCol = firstNum(page, ["日序", "day"], 0);
        const day =
          dayFromCol > 0 ? dayFromCol : Number((title.match(/D(\d+)/i) || [])[1]) || 0;
        const placeCol = text(page, "日标题");
        const place =
          placeCol ||
          title
            .split("·")
            .map((s) => s.trim())
            .filter(Boolean)
            .pop() ||
          title;
        return { route, day, place };
      };
      for (const id of ["r1", "r2", "r3"]) {
        const sheetRows = daySheetPages.filter((x) => parseSheetTitle(x).route === id);
        if (!sheetRows.length) {
          daysByRoute[id] = [];
          continue;
        }
        const days = [];
        for (const page of sheetRows) {
          const { day: dayNum, place } = parseSheetTitle(page);
          if (dayNum <= 0) continue;
          const hotelRel = relIds(page, "酒店")[0];
          const va = relIds(page, "车型A")[0];
          const vb = relIds(page, "车型B")[0];
          const guideRel = relIds(page, "导游")[0];
          const breakfastRel = relIds(page, "早餐产品")[0];
          const lunchRel = relIds(page, "中餐产品")[0];
          const dinnerRel = relIds(page, "晚餐产品")[0];
          const ticket1Rel = relIds(page, "门票1产品")[0];
          const ticket2Rel = relIds(page, "门票2产品")[0];
          const tipRel = relIds(page, "小费产品")[0];
          const miscRels = [
            ...relIds(page, "杂项产品"),
            ...relIds(page, "小费产品"),
          ];
          const miscRefs = [];
          const seenMisc = new Set();
          for (const mid of miscRels) {
            const code = refOf(mid, miscByPageId);
            if (!code || seenMisc.has(code)) continue;
            seenMisc.add(code);
            miscRefs.push(code);
          }
          const flat = {
            day: dayNum,
            titleZh: place,
            titleEn: place,
            hotelRef: refOf(hotelRel, hotelByPageId),
            rooms: firstNum(page, ["间数"], 1) || 1,
            vehicleARef: refOf(va, vehicleByPageId),
            vehicleBRef: refOf(vb, vehicleByPageId),
            guideRef: refOf(guideRel, guideByPageId),
            breakfastRef: refOf(breakfastRel, mealByPageId),
            lunchRef: refOf(lunchRel, mealByPageId),
            dinnerRef: refOf(dinnerRel, mealByPageId),
            ticket1Ref: refOf(ticket1Rel, ticketByPageId),
            ticket2Ref: refOf(ticket2Rel, ticketByPageId),
            ticket1PayOnSite:
              prop(page, "门票1现付") === true ||
              (!!ticket1Rel && ticketByPageId.get(ticket1Rel)?.payOnSiteDefault === true),
            ticket2PayOnSite:
              prop(page, "门票2现付") === true ||
              (!!ticket2Rel && ticketByPageId.get(ticket2Rel)?.payOnSiteDefault === true),
            tipRef: refOf(tipRel, miscByPageId),
            miscRefs: miscRefs.filter((r) => r !== refOf(tipRel, miscByPageId)),
          };
          days.push(expandDaySheetRow(flat));
        }
        daysByRoute[id] = days.sort((a, b) => a.day - b.day);
      }
      const routesOut = {};
      for (const id of ["r1", "r2", "r3"]) {
        const p =
          paramPages.find((x) => firstText(x, COL.id) === id || routeOf(x) === id) ||
          paramPages.find((x) => routeOf(x) === id);
        const prevRow = prevRoutes[id] ?? {};
        const rawStatus = firstText(p, COL.status);
        const status = normStatus(rawStatus) || prevRow.status || "none";
        const anchors = anchorPages
          .filter((x) => routeOf(x) === id)
          .map((x) => ({
            n: firstNum(x, COL.n, 0),
            adult: firstNum(x, COL.anchorAdult, 0),
            child: firstNum(x, COL.anchorChild, 0),
          }))
          .filter((a) => a.n > 0)
          .sort((a, b) => a.n - b.n);
        const days = daysByRoute[id];
        const labelZh = firstText(p, COL.labelZh);
        const labelEn = firstText(p, COL.labelEn);
        const briefZh = firstText(p, COL.briefZh);
        const briefEn = firstText(p, COL.briefEn);
        const prevLabel =
          prevRow.label && typeof prevRow.label === "object" && !Array.isArray(prevRow.label)
            ? prevRow.label
            : {};
        const prevBrief =
          prevRow.brief && typeof prevRow.brief === "object" && !Array.isArray(prevRow.brief)
            ? prevRow.brief
            : {};
        routesOut[id] = {
          status,
          source: firstText(p, COL.source) || prevRow.source || "",
          label: pair(labelZh || prevLabel.zh || "", labelEn || prevLabel.en || ""),
          brief: pair(briefZh || prevBrief.zh || "", briefEn || prevBrief.en || ""),
          teamFixed: (() => {
            const flat = firstNum(p, COL.leader, 0);
            const prevL = prevRow.teamFixed?.leader;
            const prevBands =
              prevL && typeof prevL === "object"
                ? prevL
                : {
                    "1-2": Number(prevL) || flat,
                    "1-4": Number(prevL) || flat,
                    "5-10": Number(prevL) || flat,
                    "10+": Number(prevL) || flat,
                  };
            const b12 = firstNum(p, COL.leader1to2, NaN);
            const b14 = firstNum(p, COL.leader1to4, NaN);
            const b510 = firstNum(p, COL.leader5to10, NaN);
            const b10p = firstNum(p, COL.leaderOver10, NaN);
            const hasBandCols = [b12, b14, b510, b10p].some((x) => Number.isFinite(x));
            const fallbackFlat = flat || Number(prevL) || 0;
            return {
              leader: hasBandCols
                ? {
                    "1-2": Number.isFinite(b12) ? b12 : prevBands["1-2"] || 0,
                    "1-4": Number.isFinite(b14) ? b14 : prevBands["1-4"] || fallbackFlat,
                    "5-10": Number.isFinite(b510) ? b510 : prevBands["5-10"] || fallbackFlat,
                    "10+": Number.isFinite(b10p) ? b10p : prevBands["10+"] || fallbackFlat,
                  }
                : prevL && typeof prevL === "object"
                  ? prevL
                  : fallbackFlat,
              ops: firstNum(p, COL.ops, Number(prevRow.teamFixed?.ops) || 0),
              reserve: firstNum(p, COL.reserve, Number(prevRow.teamFixed?.reserve) || 0),
            };
          })(),
          margin: firstNum(p, COL.margin, Number(prevRow.margin) || 0),
          roundBase: firstNum(p, COL.roundBase, Number(prevRow.roundBase) || 10),
          occupancy: firstNum(p, COL.occupancy, Number(prevRow.occupancy) || 2) || 2,
          maxPax: firstNum(p, COL.maxPax, Number(prevRow.maxPax) || 0),
          anchors: anchors.length ? anchors : prevRow.anchors || [],
          days: days.length ? days : [],
        };
      }
      const hasCats =
        catalogs.hotels.length ||
        catalogs.vehicles.length ||
        catalogs.guides.length ||
        catalogs.meals.length ||
        catalogs.tickets.length ||
        catalogs.misc.length;
      writeYaml(
        rel,
        `# 线路定价 · 三层架构（产品库 → 按日一行 → 人数验算）
# 真源：Notion 产品库 +「报价·按日一行」→ npm run content:notion → 本文件 → 网站。
# 同步后写入「报价·人数验算」2/4/6/8/10 人单价与全成人总价。
# 无按日明细则不估算（询价）。status: none / demo / confirmed；anchors 不展示给客人`,
        {
          src: srcLang,
          ...(hasCats ? { catalogs } : prev.catalogs ? { catalogs: prev.catalogs } : {}),
          routes: routesOut,
        },
      );
      mark();

      if (dbs.pricingValidate && validatePages.length) {
        const cats = hasCats
          ? catalogs
          : prev.catalogs || { hotels: [], vehicles: [], guides: [], meals: [], tickets: [], misc: [] };
        const NS = [2, 4, 6, 8, 10];
        /** 验算行可能已删「线路」列：从标题「路线一·r1 · 2人验算」解析 */
        const validateRouteOf = (page) => {
          const fromCol = routeOf(page);
          if (/^r[123]$/.test(fromCol)) return fromCol;
          const title = text(page, "标题") || "";
          return (title.match(/·\s*(r[123])\s*·/i) || title.match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() || "";
        };
        let validateMetaProps = null;
        try {
          validateMetaProps = (
            await notionFetch(token, `https://api.notion.com/v1/databases/${uuid(dbs.pricingValidate)}`)
          ).properties;
        } catch {
          validateMetaProps = {};
        }
        let patched = 0;
        for (const page of validatePages) {
          const rid = validateRouteOf(page);
          const n = firstNum(page, ["人数", "n"], 0);
          if (!/^r[123]$/.test(rid) || !NS.includes(n)) continue;
          const est = estimateRouteParty(routesOut[rid], cats, n, 0);
          if (!est) continue;
          const properties = {};
          if (validateMetaProps["成人单价"]) properties["成人单价"] = { number: est.adultPerPerson };
          if (validateMetaProps["儿童单价"]) properties["儿童单价"] = { number: est.childPerPerson };
          if (validateMetaProps["全成人总价"]) properties["全成人总价"] = { number: est.subtotalAllAdults };
          if (validateMetaProps["口径说明"]) {
            properties["口径说明"] = {
              rich_text: [
                {
                  text: {
                    content: `按日×(1+margin=${routesOut[rid]?.margin ?? "?"})取整；同步 ${new Date().toISOString().slice(0, 16)}`,
                  },
                },
              ],
            };
          }
          if (!Object.keys(properties).length) continue;
          await notionFetch(token, `https://api.notion.com/v1/pages/${page.id}`, {
            method: "PATCH",
            body: JSON.stringify({ properties }),
          });
          patched++;
        }
        console.log(
          `updated Notion 报价·人数验算 ${patched} 行` +
            (patched
              ? `（r1 margin=${routesOut.r1?.margin}）`
              : " — 0 行：检查标题是否含 r1/r2/r3 与人数 2/4/6/8/10"),
        );
      }
    }
  }

  // --- 评价 ---
  if (dbs.reviews) {
    const routesPages = dbs.routes ? await queryAll(token, dbs.routes) : [];
    const titleByPageId = routeIdMap(routesPages);
    const pages = await queryAll(token, dbs.reviews);
    const relDir = "content/reviews";
    const wanted = new Set();
    /** slug 必须唯一；空 slug 或重名时用日期 / page id 后缀，避免互相覆盖。 */
    const reviewSlug = (page) => {
      let base = (text(page, "slug") || text(page, "标题")).trim().replace(/\s+/g, "-").toLowerCase();
      if (!base) {
        const name = text(page, "name").trim().replace(/\s+/g, "-").toLowerCase() || "review";
        const date = text(page, "date") || page.id.replace(/-/g, "").slice(0, 8);
        base = `${name}-${date}`;
      }
      let slug = base;
      if (wanted.has(slug)) {
        const date = text(page, "date") || page.id.replace(/-/g, "").slice(0, 8);
        slug = `${base}-${date}`;
      }
      if (wanted.has(slug)) slug = `${base}-${page.id.replace(/-/g, "").slice(0, 8)}`;
      if (slug !== base) console.log(`review slug 重名/空 → 使用 ${slug}.yaml`);
      return slug;
    };
    for (const page of pages) {
      const slug = reviewSlug(page);
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
        `# 用户评价 · ${text(page, "name") || slug}\n# route 只能填 r1 / r2 / r3；photos 写 reviews/文件名.jpg 或 .mp4（勿用 destinations）`,
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
