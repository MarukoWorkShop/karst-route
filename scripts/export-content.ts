/**
 * One-off dump: current TypeScript content → content/*.yaml
 * Run: npx tsx --tsconfig tsconfig.json scripts/export-content.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { copy } from "../src/i18n/copy.ts";
import { routeFacts } from "../src/data/tourFacts.ts";
import { routes } from "../src/data/itinerary.ts";
import { travelerReviews } from "../src/data/reviews.ts";
import { faqGroups } from "../src/data/faqs.ts";
import { partners } from "../src/data/partners.ts";
import { heroSlides } from "../src/data/heroPanels.ts";
import type { DayStop, RouteId } from "../src/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel: string, data: unknown, comment: string) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  const body = stringify(data, { lineWidth: 0, defaultKeyType: "PLAIN", defaultStringType: "QUOTE_DOUBLE" });
  writeFileSync(path, `${comment}\n${body}`);
  console.log("wrote", rel);
}

function photoPath(src: string) {
  const m = src.match(/((?:destinations|tours|literature|brand)\/[^/?#]+)$/);
  return m ? m[1] : src;
}

function videoPath(src: string) {
  const m = src.match(/(videos\/[^/?#]+)$/);
  return m ? m[1] : src;
}

function dayOut(d: DayStop) {
  return {
    day: d.day,
    city: d.city,
    stay: d.stay,
    stayKind: d.stayKind,
    ...(d.placeId ? { placeId: d.placeId } : {}),
    ...(d.drive ? { drive: d.drive } : {}),
    ...(d.blurb ? { blurb: d.blurb } : {}),
    ...(d.photos?.length ? { photos: d.photos.map(photoPath) } : {}),
    ...(d.transport ? { transport: d.transport } : {}),
    ...(d.lodging ? { lodging: d.lodging } : {}),
    ...(d.dining?.length ? { dining: d.dining } : {}),
    bullets: d.bullets,
    themes: d.themes,
  };
}

const routeMeta = (id: RouteId) => {
  const c = copy.tours as unknown as Record<string, { en: string; zh: string }>;
  const f = routeFacts[id];
  return {
    badge: c[`${id}Badge`],
    name: c[`${id}Name`],
    tagline: c[`${id}Tagline`],
    regions: c[`${id}Regions`],
    feature: c[`${id}Feature`],
    days: c[`${id}Days`],
    entry: c[`${id}Entry`],
    exit: c[`${id}Exit`],
    audience: c[`${id}For`],
    price: f.price,
    included: [...f.included],
    excluded: [...f.excluded],
  };
};

for (const id of ["r1", "r2", "r3"] as RouteId[]) {
  write(
    `content/routes/${id}.yaml`,
    routeMeta(id),
    `# 路线卡片 · ${id}\n# 改名称、价格、卖点等。逐日行程请改 content/itineraries/${id}.yaml\n`,
  );
  write(
    `content/itineraries/${id}.yaml`,
    { days: routes[id].days.map(dayOut) },
    `# 逐日行程 · ${id}\n# 每一天：城市、住宿、交通、餐饮、活动 bullets、主题 themes\n# photos 只写 public 下的相对路径，例如 destinations/nanning.jpg\n`,
  );
}

write(
  "content/about.yaml",
  {
    kicker: copy.about.kicker,
    name: copy.about.name,
    role: copy.about.role,
    body1: copy.about.body1,
    body2Lead: copy.about.body2Lead,
    body2: copy.about.body2,
    points: copy.about.points,
    credsTitle: copy.about.credsTitle,
    credsSub: copy.about.credsSub,
    creds: copy.about.creds,
  },
  "# 关于我们 About Us\n# 公司介绍、三点摘要、资质与保障\n",
);

const routeLabel: Record<string, "r1" | "r2" | "r3"> = {};
for (const r of travelerReviews) {
  const id = r.route.zh.includes("一") ? "r1" : r.route.zh.includes("二") ? "r2" : "r3";
  routeLabel[r.id] = id;
  write(
    `content/reviews/${r.id}.yaml`,
    {
      flag: r.flag,
      name: r.name,
      country: r.country,
      route: id,
      rating: r.rating,
      date: r.date,
      short: r.short,
      full: r.full,
      photos: r.photos.map(photoPath),
    },
    `# 用户评价 · ${r.name}\n# route 只能填 r1 / r2 / r3；photos 写 destinations/文件名.jpg\n`,
  );
}

write(
  "content/faqs.yaml",
  {
    groups: faqGroups.map((g) => ({
      id: g.id,
      label: g.label,
      items: g.items.map((item) => ({ id: item.id, q: item.q, a: item.a })),
    })),
  },
  "# 常见问题 FAQ\n# 按分组编辑。改 id 时请同步页面锚点（例如 #faq-cards）\n",
);

write(
  "content/partners.yaml",
  {
    list: partners.map((p) => ({
      name: p.name,
      category: p.category,
      location: p.location,
      desc: p.desc,
      emoji: p.emoji,
      color: p.color,
      links: p.links,
    })),
  },
  "# 合作商家\n# type 只能是 google 或 web\n",
);

write(
  "content/hero.yaml",
  {
    slides: heroSlides.map((s) => ({
      id: s.id,
      video: videoPath(s.video),
      poster: photoPath(s.poster),
      pos: s.pos,
      themeId: s.themeId,
      alt: s.alt,
      title: s.title,
      intro: s.intro,
    })),
  },
  "# 首页 Hero 轮播\n# video 填 COS 对象路径，例如 videos/1.mp4；poster 填 destinations/xxx.jpg\n# themeId 只能是 wild / flavors / villages / locals\n",
);
