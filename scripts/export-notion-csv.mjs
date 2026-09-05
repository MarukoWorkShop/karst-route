#!/usr/bin/env node
/**
 * Flatten content/*.yaml into UTF-8 CSV for Notion import.
 * Usage: node scripts/export-notion-csv.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = process.cwd();
const outDir = path.join(root, "content", "notion-import");
const BOM = "\uFEFF";

function loadYaml(rel) {
  return parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function tx(obj, lang) {
  if (!obj || typeof obj !== "object") return "";
  return typeof obj[lang] === "string" ? obj[lang] : "";
}

function lines(items, pick) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items.map(pick).filter(Boolean).join("\n");
}

function csvEscape(value) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function writeCsv(name, headers, rows) {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h] ?? "")).join(",")),
  ].join("\n");
  const file = path.join(outDir, name);
  fs.writeFileSync(file, BOM + body + "\n", "utf8");
  console.log(`wrote ${path.relative(root, file)}  (${rows.length} rows)`);
}

fs.mkdirSync(outDir, { recursive: true });

// --- 路线卡片 ---
const routeRows = [];
for (const id of ["r1", "r2", "r3"]) {
  const d = loadYaml(`content/routes/${id}.yaml`);
  routeRows.push({
    id,
    src: d.src ?? "zh",
    cover: d.cover ?? "",
    badge_zh: tx(d.badge, "zh"),
    badge_en: tx(d.badge, "en"),
    name_zh: tx(d.name, "zh"),
    name_en: tx(d.name, "en"),
    tagline_zh: tx(d.tagline, "zh"),
    tagline_en: tx(d.tagline, "en"),
    regions_zh: tx(d.regions, "zh"),
    regions_en: tx(d.regions, "en"),
    feature_zh: tx(d.feature, "zh"),
    feature_en: tx(d.feature, "en"),
    days_zh: tx(d.days, "zh"),
    days_en: tx(d.days, "en"),
    entry_zh: tx(d.entry, "zh"),
    entry_en: tx(d.entry, "en"),
    exit_zh: tx(d.exit, "zh"),
    exit_en: tx(d.exit, "en"),
    audience_zh: tx(d.audience, "zh"),
    audience_en: tx(d.audience, "en"),
    price_zh: tx(d.price, "zh"),
    price_en: tx(d.price, "en"),
    included: Array.isArray(d.included) ? d.included.join(",") : "",
    excluded: Array.isArray(d.excluded) ? d.excluded.join(",") : "",
  });
}
writeCsv(
  "01-路线卡片.csv",
  [
    "id",
    "src",
    "cover",
    "badge_zh",
    "badge_en",
    "name_zh",
    "name_en",
    "tagline_zh",
    "tagline_en",
    "regions_zh",
    "regions_en",
    "feature_zh",
    "feature_en",
    "days_zh",
    "days_en",
    "entry_zh",
    "entry_en",
    "exit_zh",
    "exit_en",
    "audience_zh",
    "audience_en",
    "price_zh",
    "price_en",
    "included",
    "excluded",
  ],
  routeRows,
);

// --- 逐日行程 ---
const dayRows = [];
for (const id of ["r1", "r2", "r3"]) {
  const d = loadYaml(`content/itineraries/${id}.yaml`);
  const src = d.src ?? "zh";
  for (const day of d.days ?? []) {
    const n = String(day.day).padStart(2, "0");
    const cityZh = tx(day.city, "zh") || `D${n}`;
    dayRows.push({
      标题: `${id}-D${n} ${cityZh}`,
      路线: id,
      day: day.day,
      src,
      stayKind: day.stayKind ?? "",
      placeId: day.placeId ?? "",
      themes: Array.isArray(day.themes) ? day.themes.join(",") : "",
      city_zh: tx(day.city, "zh"),
      city_en: tx(day.city, "en"),
      stay_zh: tx(day.stay, "zh"),
      stay_en: tx(day.stay, "en"),
      drive_zh: tx(day.drive, "zh"),
      drive_en: tx(day.drive, "en"),
      transport_zh: tx(day.transport, "zh"),
      transport_en: tx(day.transport, "en"),
      lodging_zh: tx(day.lodging, "zh"),
      lodging_en: tx(day.lodging, "en"),
      blurb_zh: tx(day.blurb, "zh"),
      blurb_en: tx(day.blurb, "en"),
      dining_zh: lines(day.dining, (x) => tx(x, "zh")),
      dining_en: lines(day.dining, (x) => tx(x, "en")),
      bullets_zh: lines(day.bullets, (x) => tx(x, "zh")),
      bullets_en: lines(day.bullets, (x) => tx(x, "en")),
      photos: Array.isArray(day.photos) ? day.photos.join("\n") : "",
    });
  }
}
writeCsv(
  "02-逐日行程.csv",
  [
    "标题",
    "路线",
    "day",
    "src",
    "stayKind",
    "placeId",
    "themes",
    "city_zh",
    "city_en",
    "stay_zh",
    "stay_en",
    "drive_zh",
    "drive_en",
    "transport_zh",
    "transport_en",
    "lodging_zh",
    "lodging_en",
    "blurb_zh",
    "blurb_en",
    "dining_zh",
    "dining_en",
    "bullets_zh",
    "bullets_en",
    "photos",
  ],
  dayRows,
);

// --- 目的地详情 ---
const destDir = path.join(root, "content", "destinations");
const destRows = fs.existsSync(destDir)
  ? fs
      .readdirSync(destDir)
      .filter((f) => f.endsWith(".yaml"))
      .sort()
      .map((file) => {
        const id = file.replace(/\.yaml$/, "");
        const d = loadYaml(`content/destinations/${file}`);
        return {
          标题: id,
          id,
          src: d.src ?? "zh",
          photo: d.photo ?? "",
          hotel_photo: d.hotel?.photo ?? "",
          tagline_zh: tx(d.tagline, "zh"),
          tagline_en: tx(d.tagline, "en"),
          experience_title_zh: tx(d.experience?.title, "zh"),
          experience_title_en: tx(d.experience?.title, "en"),
          experience_body_zh: tx(d.experience?.body, "zh"),
          experience_body_en: tx(d.experience?.body, "en"),
          cuisine_title_zh: tx(d.cuisine?.title, "zh"),
          cuisine_title_en: tx(d.cuisine?.title, "en"),
          cuisine_body_zh: tx(d.cuisine?.body, "zh"),
          cuisine_body_en: tx(d.cuisine?.body, "en"),
          hotel_title_zh: tx(d.hotel?.title, "zh"),
          hotel_title_en: tx(d.hotel?.title, "en"),
          hotel_body_zh: tx(d.hotel?.body, "zh"),
          hotel_body_en: tx(d.hotel?.body, "en"),
          culture_zh: tx(d.culture, "zh"),
          culture_en: tx(d.culture, "en"),
          slides: Array.isArray(d.slides) ? d.slides.join("\n") : "",
        };
      })
  : [];
writeCsv(
  "08-目的地详情.csv",
  [
    "标题",
    "id",
    "src",
    "photo",
    "hotel_photo",
    "tagline_zh",
    "tagline_en",
    "experience_title_zh",
    "experience_title_en",
    "experience_body_zh",
    "experience_body_en",
    "cuisine_title_zh",
    "cuisine_title_en",
    "cuisine_body_zh",
    "cuisine_body_en",
    "hotel_title_zh",
    "hotel_title_en",
    "hotel_body_zh",
    "hotel_body_en",
    "culture_zh",
    "culture_en",
    "slides",
  ],
  destRows,
);

// --- 评价 ---
const reviewDir = path.join(root, "content", "reviews");
const reviewRows = fs
  .readdirSync(reviewDir)
  .filter((f) => f.endsWith(".yaml"))
  .sort()
  .map((file) => {
    const slug = file.replace(/\.yaml$/, "");
    const d = loadYaml(`content/reviews/${file}`);
    return {
      slug,
      src: d.src ?? "zh",
      flag: d.flag ?? "",
      name: d.name ?? "",
      country: d.country ?? "",
      route: d.route ?? "",
      rating: d.rating ?? "",
      date: d.date ?? "",
      short_zh: tx(d.short, "zh"),
      short_en: tx(d.short, "en"),
      full_zh: tx(d.full, "zh"),
      full_en: tx(d.full, "en"),
      photos: Array.isArray(d.photos) ? d.photos.join("\n") : "",
    };
  });
writeCsv(
  "03-客人评价.csv",
  [
    "slug",
    "src",
    "flag",
    "name",
    "country",
    "route",
    "rating",
    "date",
    "short_zh",
    "short_en",
    "full_zh",
    "full_en",
    "photos",
  ],
  reviewRows,
);

// --- FAQ ---
const faqs = loadYaml("content/faqs.yaml");
const faqRows = [];
for (const group of faqs.groups ?? []) {
  for (const item of group.items ?? []) {
    faqRows.push({
      id: item.id ?? "",
      src: faqs.src ?? "zh",
      group_id: group.id ?? "",
      group_zh: tx(group.label, "zh"),
      group_en: tx(group.label, "en"),
      q_zh: tx(item.q, "zh"),
      q_en: tx(item.q, "en"),
      a_zh: tx(item.a, "zh"),
      a_en: tx(item.a, "en"),
    });
  }
}
writeCsv(
  "04-FAQ.csv",
  ["id", "src", "group_id", "group_zh", "group_en", "q_zh", "q_en", "a_zh", "a_en"],
  faqRows,
);

// --- 商家 ---
const partners = loadYaml("content/partners.yaml");
const partnerRows = (partners.list ?? []).map((p, i) => {
  const links = Array.isArray(p.links) ? p.links : [];
  const row = {
    名称: tx(p.name, "zh") || tx(p.name, "en") || `partner-${i + 1}`,
    src: partners.src ?? "zh",
    name_zh: tx(p.name, "zh"),
    name_en: tx(p.name, "en"),
    category_zh: tx(p.category, "zh"),
    category_en: tx(p.category, "en"),
    location_zh: tx(p.location, "zh"),
    location_en: tx(p.location, "en"),
    desc_zh: tx(p.desc, "zh"),
    desc_en: tx(p.desc, "en"),
    emoji: p.emoji ?? "",
    color: p.color ?? "",
  };
  for (let n = 0; n < 2; n++) {
    const L = links[n];
    row[`link${n + 1}_type`] = L?.type ?? "";
    row[`link${n + 1}_url`] = L?.url ?? "";
    row[`link${n + 1}_zh`] = tx(L?.label, "zh");
    row[`link${n + 1}_en`] = tx(L?.label, "en");
  }
  return row;
});
writeCsv(
  "05-合作商家.csv",
  [
    "名称",
    "src",
    "name_zh",
    "name_en",
    "category_zh",
    "category_en",
    "location_zh",
    "location_en",
    "desc_zh",
    "desc_en",
    "emoji",
    "color",
    "link1_type",
    "link1_url",
    "link1_zh",
    "link1_en",
    "link2_type",
    "link2_url",
    "link2_zh",
    "link2_en",
  ],
  partnerRows,
);

// --- Hero ---
const hero = loadYaml("content/hero.yaml");
const heroRows = (hero.slides ?? []).map((s, i) => ({
  id: s.id ?? `slide-${i + 1}`,
  src: hero.src ?? "zh",
  video: s.video ?? "",
  poster: s.poster ?? "",
  pos: s.pos ?? "",
  themeId: s.themeId ?? "",
  alt_zh: tx(s.alt, "zh"),
  alt_en: tx(s.alt, "en"),
  title_zh: tx(s.title, "zh"),
  title_en: tx(s.title, "en"),
  intro_zh: tx(s.intro, "zh"),
  intro_en: tx(s.intro, "en"),
}));
writeCsv(
  "06-首页轮播.csv",
  [
    "id",
    "src",
    "video",
    "poster",
    "pos",
    "themeId",
    "alt_zh",
    "alt_en",
    "title_zh",
    "title_en",
    "intro_zh",
    "intro_en",
  ],
  heroRows,
);

// --- About（一行公司介绍 + 资质拆行）---
const about = loadYaml("content/about.yaml");
writeCsv(
  "07-关于我们.csv",
  [
    "名称",
    "src",
    "kicker_zh",
    "kicker_en",
    "name_zh",
    "name_en",
    "role_zh",
    "role_en",
    "body1_zh",
    "body1_en",
    "body2Lead_zh",
    "body2Lead_en",
    "body2_zh",
    "body2_en",
    "points_zh",
    "points_en",
    "credsTitle_zh",
    "credsTitle_en",
    "credsSub_zh",
    "credsSub_en",
  ],
  [
    {
      名称: tx(about.name, "zh") || "有闲旅行",
      src: about.src ?? "zh",
      kicker_zh: tx(about.kicker, "zh"),
      kicker_en: tx(about.kicker, "en"),
      name_zh: tx(about.name, "zh"),
      name_en: tx(about.name, "en"),
      role_zh: tx(about.role, "zh"),
      role_en: tx(about.role, "en"),
      body1_zh: tx(about.body1, "zh"),
      body1_en: tx(about.body1, "en"),
      body2Lead_zh: tx(about.body2Lead, "zh"),
      body2Lead_en: tx(about.body2Lead, "en"),
      body2_zh: tx(about.body2, "zh"),
      body2_en: tx(about.body2, "en"),
      points_zh: lines(about.points, (x) => tx(x, "zh")),
      points_en: lines(about.points, (x) => tx(x, "en")),
      credsTitle_zh: tx(about.credsTitle, "zh"),
      credsTitle_en: tx(about.credsTitle, "en"),
      credsSub_zh: tx(about.credsSub, "zh"),
      credsSub_en: tx(about.credsSub, "en"),
    },
  ],
);

const credRows = (about.creds ?? []).map((c, i) => ({
  标题: `${i + 1}. ${tx(c, "zh") || tx(c, "en")}`,
  src: about.src ?? "zh",
  icon: c.icon ?? "",
  zh: tx(c, "zh"),
  en: tx(c, "en"),
}));
writeCsv("07b-关于我们-资质.csv", ["标题", "src", "icon", "zh", "en"], credRows);

// --- 线路路书 ---
let guideDoc = { src: "zh", routes: {} };
try {
  guideDoc = loadYaml("content/guidebooks.yaml") ?? guideDoc;
} catch {
  /* optional */
}
const guideRows = ["r1", "r2", "r3"].map((id) => {
  const row = guideDoc.routes?.[id] ?? {};
  return {
    标题: id,
    id,
    src: guideDoc.src ?? "zh",
    file: row.file ?? "",
    downloadName: row.downloadName ?? "",
    title_zh: tx(row.title, "zh"),
    title_en: tx(row.title, "en"),
  };
});
writeCsv(
  "09-线路路书.csv",
  ["标题", "id", "src", "file", "downloadName", "title_zh", "title_en"],
  guideRows,
);

// --- 定价（模块化估算器）---
// 源：content/pricing.yaml。三张表：参数（每线路一行）/ 成本模块（每模块一行）/ 报价锚点（校准用）
let pricing = { src: "zh", routes: {} };
try {
  pricing = loadYaml("content/pricing.yaml") ?? pricing;
} catch {
  /* optional */
}
const proutes = pricing.routes && typeof pricing.routes === "object" ? pricing.routes : {};

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

const bandAt = (r, i) => (Array.isArray(r.vehicleBands) && r.vehicleBands[i] ? r.vehicleBands[i] : {});
const paramRows = ["r1", "r2", "r3"].map((id) => {
  const r = proutes[id] ?? {};
  const tf = r.teamFixed ?? {};
  const b = [0, 1, 2, 3].map((i) => bandAt(r, i));
  return {
    标题: `${id} · 定价参数`,
    id,
    status: r.status ?? "none",
    source: r.source ?? "",
    band1Max: b[0].maxPax ?? "",
    band1Price: b[0].price ?? "",
    band2Max: b[1].maxPax ?? "",
    band2Price: b[1].price ?? "",
    band3Max: b[2].maxPax ?? "",
    band3Price: b[2].price ?? "",
    band4Max: b[3].maxPax ?? "",
    band4Price: b[3].price ?? "",
    leader: tf.leader ?? "",
    ops: tf.ops ?? "",
    reserve: tf.reserve ?? "",
    margin: r.margin ?? "",
    roundBase: r.roundBase ?? "",
    note: r.note ?? "",
  };
});
writeCsv(
  "10-定价参数.csv",
  [
    "标题",
    "id",
    "status",
    "source",
    "band1Max",
    "band1Price",
    "band2Max",
    "band2Price",
    "band3Max",
    "band3Price",
    "band4Max",
    "band4Price",
    "leader",
    "ops",
    "reserve",
    "margin",
    "roundBase",
    "note",
  ],
  paramRows,
);

const moduleRows = [];
for (const id of ["r1", "r2", "r3"]) {
  const r = proutes[id] ?? {};
  const mods =
    Array.isArray(r.modules) && r.modules.length
      ? r.modules
      : MODULE_TEMPLATE.map((m) => ({ id: m.id, name_zh: m.zh, name_en: m.en, basis: m.basis }));
  for (const m of mods) {
    moduleRows.push({
      标题: `${id} · ${m.name_zh || m.id}`,
      route: id,
      moduleId: m.id ?? "",
      name_zh: m.name_zh ?? "",
      name_en: m.name_en ?? "",
      basis: m.basis ?? "per_person",
      adult: m.adult ?? "",
      child: m.child ?? "",
      note: m.note ?? "",
    });
  }
}
writeCsv(
  "11-成本模块.csv",
  ["标题", "route", "moduleId", "name_zh", "name_en", "basis", "adult", "child", "note"],
  moduleRows,
);

const anchorRows = [];
for (const id of ["r1", "r2", "r3"]) {
  const r = proutes[id] ?? {};
  const list =
    Array.isArray(r.anchors) && r.anchors.length
      ? r.anchors
      : ANCHOR_TEMPLATE.map((n) => ({ n }));
  for (const a of list) {
    anchorRows.push({
      标题: `${id} · ${a.n} 人`,
      route: id,
      n: a.n ?? "",
      adult: a.adult ?? "",
      child: a.child ?? "",
      note: a.note ?? "",
    });
  }
}
writeCsv("12-报价锚点.csv", ["标题", "route", "n", "adult", "child", "note"], anchorRows);

console.log(`\nCSV 已放到 content/notion-import/ 。导入步骤见该目录 README。`);
