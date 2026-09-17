import { parse } from "yaml";
import type { RouteId } from "@/types";

/**
 * 三层报价：产品库 catalogs + 按日 days → estimateParty。
 * 无按日明细则询价（不回退旧七模块）。
 */

export type RoutePricingStatus = "none" | "demo" | "confirmed";

export type PriceAnchor = { n: number; adult: number; child: number };

/** Word「网络卖价」档位：出行人数 ≤ maxN 时用该档成人/儿童市场报价 */
export type MarketTier = { maxN: number; adult: number; child: number };

export type PricingLineSplit =
  | "per_room_split"
  | "per_vehicle_split"
  | "per_person"
  | "per_group_split";

export type PricingLineType =
  | "hotel"
  | "vehicle"
  | "guide"
  | "ticket"
  | "meal"
  | "tip"
  | "visa"
  | "other";

export type PricingHotel = {
  id: string;
  name?: { zh: string; en: string };
  twinRate: number;
  city?: string;
};

export type PricingVehicle = {
  id: string;
  name?: { zh: string; en: string };
  maxPax: number;
  dayRate: number;
  segment?: string;
};

export type PricingGuide = {
  id: string;
  name?: { zh: string; en: string };
  dayRate: number;
  split: "per_group" | "per_person";
};

export type PricingMeal = {
  id: string;
  name?: { zh: string; en: string };
  mealType?: string;
  adultRate: number;
  childRate: number;
};

export type PricingTicket = {
  id: string;
  name?: { zh: string; en: string };
  adultRate: number;
  childRate: number;
  payOnSiteDefault?: boolean;
};

export type PricingMisc = {
  id: string;
  name?: { zh: string; en: string };
  category?: string;
  split: PricingLineSplit | "per_group";
  adultRate: number;
  childRate: number;
  groupRate?: number;
};

export type PricingDayLine = {
  type: PricingLineType;
  ref?: string;
  label?: { zh: string; en: string };
  rooms?: number;
  qty?: number;
  amount?: number;
  payOnSite?: boolean;
  split: PricingLineSplit;
  adultApplicable?: boolean;
  childApplicable?: boolean;
};

export type PricingDay = {
  day: number;
  title?: { zh: string; en: string };
  lines: PricingDayLine[];
};

export type PricingCatalogs = {
  hotels: PricingHotel[];
  vehicles: PricingVehicle[];
  guides: PricingGuide[];
  meals: PricingMeal[];
  tickets: PricingTicket[];
  misc: PricingMisc[];
};

/** 领队费（元/团）；空/0 表示不计入。历史分档已废弃，仅兼容旧 YAML。 */
export type LeaderBands = {
  "1-2": number;
  "1-4": number;
  "5-10": number;
  "10+": number;
};

export type TeamFixedParts = {
  leader: number;
  /** @deprecated 仅兼容旧 YAML；估算一律用扁平 leader */
  leaderBands: LeaderBands;
  ops: number;
  reserve: number;
};

export type RoutePricing = {
  route: RouteId;
  status: RoutePricingStatus;
  source?: string;
  label?: { zh: string; en: string };
  brief?: { zh: string; en: string };
  teamFixed: number;
  teamFixedParts: TeamFixedParts;
  /** 卖价毛利率：卖价 = 成本 / (1 - margin)；0.3 → ÷0.70（对齐报价单） */
  margin: number;
  roundBase: number;
  anchors: PriceAnchor[];
  /** Word 市场报价档位（成人市场报价 / 儿童市场报价） */
  marketTiers: MarketTier[];
  /** 线路房差：各住宿日 双人间×间数÷同房人数 之和（附注儿童价=成人−房差） */
  roomDiff: number;
  occupancy: number;
  maxPax: number;
  catalogs: PricingCatalogs;
  days: PricingDay[];
};

export function resolveLeaderFee(parts: TeamFixedParts, _n?: number): number {
  return Number(parts.leader) || 0;
}

export function resolveTeamFixed(parts: TeamFixedParts, n: number): number {
  return resolveLeaderFee(parts, n) + parts.ops + parts.reserve;
}

const EMPTY_CATALOGS: PricingCatalogs = {
  hotels: [],
  vehicles: [],
  guides: [],
  meals: [],
  tickets: [],
  misc: [],
};

const EMPTY_LEADER_BANDS: LeaderBands = { "1-2": 0, "1-4": 0, "5-10": 0, "10+": 0 };

const UNSET: Omit<RoutePricing, "route"> = {
  status: "none",
  source: "",
  teamFixed: 0,
  teamFixedParts: { leader: 0, leaderBands: EMPTY_LEADER_BANDS, ops: 0, reserve: 0 },
  margin: 0,
  roundBase: 10,
  anchors: [],
  marketTiers: [],
  roomDiff: 0,
  occupancy: 2,
  maxPax: 0,
  catalogs: EMPTY_CATALOGS,
  days: [],
};

const FALLBACKS: Record<RouteId, Omit<RoutePricing, "route">> = {
  r1: UNSET,
  r2: UNSET,
  r3: UNSET,
};

const files = import.meta.glob("../../content/pricing.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

let yamlRoutes: Record<string, Record<string, unknown>> = {};
let yamlCatalogs: PricingCatalogs = EMPTY_CATALOGS;

try {
  const raw = Object.values(files)[0] ?? "";
  const doc = (parse(raw) ?? {}) as {
    routes?: Record<string, Record<string, unknown>>;
    catalogs?: Record<string, unknown>;
  };
  yamlRoutes = doc.routes && typeof doc.routes === "object" ? doc.routes : {};
  yamlCatalogs = catalogsOf(doc.catalogs, EMPTY_CATALOGS);
} catch (err) {
  console.warn("[content] content/pricing.yaml 解析失败，已回退到代码默认值", err);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function statusOf(v: unknown, fallback: RoutePricingStatus): RoutePricingStatus {
  return v === "none" || v === "demo" || v === "confirmed" ? v : fallback;
}

function txName(v: unknown): { zh: string; en: string } | undefined {
  if (!isObj(v)) return undefined;
  return {
    zh: typeof v.zh === "string" ? v.zh : "",
    en: typeof v.en === "string" ? v.en : "",
  };
}

function anchorsOf(v: unknown, fallback: PriceAnchor[]): PriceAnchor[] {
  if (!Array.isArray(v)) return fallback;
  const out: PriceAnchor[] = [];
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const n = num(raw.n, 0);
    if (n <= 0) continue;
    out.push({ n, adult: num(raw.adult, 0), child: num(raw.child, 0) });
  }
  return out;
}

function marketTiersOf(v: unknown, fallback: MarketTier[]): MarketTier[] {
  if (!Array.isArray(v)) return fallback;
  const out: MarketTier[] = [];
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const maxN = num(raw.maxN, 0);
    if (maxN <= 0) continue;
    out.push({ maxN, adult: num(raw.adult, 0), child: num(raw.child, 0) });
  }
  return out.length ? out.sort((a, b) => a.maxN - b.maxN) : fallback;
}

function catalogsOf(v: unknown, fallback: PricingCatalogs): PricingCatalogs {
  if (!isObj(v)) return fallback;
  const hotels: PricingHotel[] = [];
  const vehicles: PricingVehicle[] = [];
  const guides: PricingGuide[] = [];
  const meals: PricingMeal[] = [];
  const tickets: PricingTicket[] = [];
  const misc: PricingMisc[] = [];
  if (Array.isArray(v.hotels)) {
    for (const raw of v.hotels) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      hotels.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        twinRate: num(raw.twinRate, 0),
        ...(typeof raw.city === "string" ? { city: raw.city } : {}),
      });
    }
  }
  if (Array.isArray(v.vehicles)) {
    for (const raw of v.vehicles) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      vehicles.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        maxPax: num(raw.maxPax, 0),
        dayRate: num(raw.dayRate, 0),
        ...(typeof raw.segment === "string" ? { segment: raw.segment } : {}),
      });
    }
  }
  if (Array.isArray(v.guides)) {
    for (const raw of v.guides) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      guides.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        dayRate: num(raw.dayRate, 0),
        split: raw.split === "per_person" ? "per_person" : "per_group",
      });
    }
  }
  if (Array.isArray(v.meals)) {
    for (const raw of v.meals) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      const adultRate = num(raw.adultRate, 0);
      meals.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        ...(typeof raw.mealType === "string" ? { mealType: raw.mealType } : {}),
        adultRate,
        childRate: num(raw.childRate, adultRate),
      });
    }
  }
  if (Array.isArray(v.tickets)) {
    for (const raw of v.tickets) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      const adultRate = num(raw.adultRate, 0);
      tickets.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        adultRate,
        childRate: num(raw.childRate, adultRate),
        payOnSiteDefault: raw.payOnSiteDefault === true,
      });
    }
  }
  if (Array.isArray(v.misc)) {
    for (const raw of v.misc) {
      if (!isObj(raw) || typeof raw.id !== "string") continue;
      const adultRate = num(raw.adultRate, 0);
      const split =
        raw.split === "per_group_split" ||
        raw.split === "per_vehicle_split" ||
        raw.split === "per_room_split" ||
        raw.split === "per_person" ||
        raw.split === "per_group"
          ? raw.split
          : "per_person";
      misc.push({
        id: raw.id,
        ...(txName(raw.name) ? { name: txName(raw.name) } : {}),
        ...(typeof raw.category === "string" ? { category: raw.category } : {}),
        split,
        adultRate,
        childRate: num(raw.childRate, adultRate),
        groupRate: num(raw.groupRate, 0),
      });
    }
  }
  return {
    hotels: hotels.length ? hotels : fallback.hotels,
    vehicles: vehicles.length ? vehicles : fallback.vehicles,
    guides: guides.length ? guides : fallback.guides,
    meals: meals.length ? meals : fallback.meals,
    tickets: tickets.length ? tickets : fallback.tickets,
    misc: misc.length ? misc : fallback.misc,
  };
}

const LINE_TYPES: PricingLineType[] = [
  "hotel",
  "vehicle",
  "guide",
  "ticket",
  "meal",
  "tip",
  "visa",
  "other",
];

const SPLITS: PricingLineSplit[] = [
  "per_room_split",
  "per_vehicle_split",
  "per_person",
  "per_group_split",
];

function daysOf(v: unknown): PricingDay[] {
  if (!Array.isArray(v)) return [];
  const out: PricingDay[] = [];
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const day = num(raw.day, 0);
    if (day <= 0) continue;
    const lines: PricingDayLine[] = [];
    if (Array.isArray(raw.lines)) {
      for (const ln of raw.lines) {
        if (!isObj(ln)) continue;
        const type = LINE_TYPES.includes(ln.type as PricingLineType)
          ? (ln.type as PricingLineType)
          : null;
        if (!type) continue;
        const split = SPLITS.includes(ln.split as PricingLineSplit)
          ? (ln.split as PricingLineSplit)
          : type === "hotel"
            ? "per_room_split"
            : type === "vehicle"
              ? "per_vehicle_split"
              : type === "guide"
                ? "per_group_split"
                : "per_person";
        lines.push({
          type,
          ...(typeof ln.ref === "string" ? { ref: ln.ref } : {}),
          ...(txName(ln.label) ? { label: txName(ln.label) } : {}),
          rooms: num(ln.rooms, 1),
          qty: num(ln.qty, 1),
          ...(ln.amount != null && ln.amount !== "" ? { amount: num(ln.amount, 0) } : {}),
          payOnSite: ln.payOnSite === true,
          split,
          adultApplicable: ln.adultApplicable !== false,
          childApplicable: ln.childApplicable !== false,
        });
      }
    }
    out.push({
      day,
      ...(txName(raw.title) ? { title: txName(raw.title) } : {}),
      lines,
    });
  }
  return out.sort((a, b) => a.day - b.day);
}

function teamFixedPartsOf(
  raw: unknown,
  fb: TeamFixedParts,
): TeamFixedParts {
  if (!isObj(raw)) return fb;
  const ops = num(raw.ops, fb.ops);
  const reserve = num(raw.reserve, fb.reserve);
  const leaderRaw = raw.leader;
  if (isObj(leaderRaw)) {
    // 旧分档 YAML：不再按人数取档，一律视为未启用领队费（除非调用方已扁化为数字）
    const flat = num(leaderRaw["1-4"] ?? leaderRaw.band1to4, 0);
    return {
      leader: 0,
      leaderBands: {
        "1-2": num(leaderRaw["1-2"], 0),
        "1-4": flat,
        "5-10": num(leaderRaw["5-10"], 0),
        "10+": num(leaderRaw["10+"], 0),
      },
      ops,
      reserve,
    };
  }
  const flat = num(leaderRaw, fb.leader);
  return {
    leader: flat,
    leaderBands: EMPTY_LEADER_BANDS,
    ops,
    reserve,
  };
}

function build(id: RouteId): RoutePricing {
  const fb = FALLBACKS[id];
  const y = yamlRoutes[id];
  if (!isObj(y)) return { route: id, ...fb };

  const parts = teamFixedPartsOf(y.teamFixed, fb.teamFixedParts);
  const teamFixed = resolveTeamFixed(parts, 4);
  const routeCatalogs = catalogsOf(y.catalogs, yamlCatalogs);
  const catalogs: PricingCatalogs = {
    hotels: routeCatalogs.hotels.length ? routeCatalogs.hotels : yamlCatalogs.hotels,
    vehicles: routeCatalogs.vehicles.length ? routeCatalogs.vehicles : yamlCatalogs.vehicles,
    guides: routeCatalogs.guides.length ? routeCatalogs.guides : yamlCatalogs.guides,
    meals: routeCatalogs.meals.length ? routeCatalogs.meals : yamlCatalogs.meals,
    tickets: routeCatalogs.tickets.length ? routeCatalogs.tickets : yamlCatalogs.tickets,
    misc: routeCatalogs.misc.length ? routeCatalogs.misc : yamlCatalogs.misc,
  };
  const days = daysOf(y.days);
  const occupancy = num(y.occupancy, fb.occupancy) || 2;
  const fromYamlDiff = num(y.roomDiff, NaN);
  const roomDiff =
    Number.isFinite(fromYamlDiff) && fromYamlDiff >= 0
      ? fromYamlDiff
      : sumRoomDiff(days, catalogs, occupancy);

  return {
    route: id,
    status: statusOf(y.status, fb.status),
    source: typeof y.source === "string" ? y.source : fb.source,
    ...(txName(y.label) ? { label: txName(y.label) } : txName(fb.label) ? { label: txName(fb.label) } : {}),
    ...(txName(y.brief) ? { brief: txName(y.brief) } : txName(fb.brief) ? { brief: txName(fb.brief) } : {}),
    teamFixed,
    teamFixedParts: parts,
    margin: num(y.margin, fb.margin),
    roundBase: num(y.roundBase, fb.roundBase) || 10,
    anchors: anchorsOf(y.anchors, fb.anchors),
    marketTiers: marketTiersOf(y.marketTiers, fb.marketTiers),
    occupancy,
    maxPax: num(y.maxPax, fb.maxPax),
    catalogs,
    days,
    roomDiff,
  };
}

/** 线路房差：有酒店日 双人间×间数÷同房人数 */
export function sumRoomDiff(
  days: PricingDay[],
  catalogs: PricingCatalogs,
  occupancy = 2,
): number {
  const occ = occupancy > 0 ? occupancy : 2;
  const byId = new Map(catalogs.hotels.map((h) => [h.id, h]));
  let total = 0;
  for (const day of days) {
    for (const line of day.lines || []) {
      if (line.type !== "hotel" || !line.ref) continue;
      const twin =
        line.amount != null && Number.isFinite(line.amount)
          ? Number(line.amount)
          : byId.get(line.ref)?.twinRate ?? 0;
      const rooms = line.rooms && line.rooms > 0 ? line.rooms : 1;
      total += (twin * rooms) / occ;
    }
  }
  return total;
}

export const routePricing: Record<RouteId, RoutePricing> = {
  r1: build("r1"),
  r2: build("r2"),
  r3: build("r3"),
};

/** 按出行总人数取 Word「网络卖价」档位；无档位返回 null */
export function resolveMarketTier(id: RouteId, n: number): MarketTier | null {
  const tiers = routePricing[id].marketTiers;
  if (!tiers.length || n <= 0) return null;
  const hit = tiers.find((t) => n <= t.maxN);
  return hit ?? tiers[tiers.length - 1] ?? null;
}

/** 路线卡片：人数最少档价（贵）与最多档价（便宜）+ 档位人数文案 */
export function marketPriceRange(id: RouteId): {
  adultFrom: number;
  adultTo: number;
  childFrom: number;
  childTo: number;
  /** 低价对应档：如 7–10 */
  bandFrom: { minN: number; maxN: number };
  /** 高价对应档：如 ≤3 */
  bandTo: { minN: number; maxN: number };
} | null {
  const tiers = routePricing[id].marketTiers
    .filter((t) => t.adult > 0)
    .slice()
    .sort((a, b) => a.maxN - b.maxN);
  if (!tiers.length) return null;

  const bandOf = (i: number) => {
    const maxN = tiers[i].maxN;
    const minN = i === 0 ? 1 : tiers[i - 1].maxN + 1;
    return { minN, maxN };
  };

  let lowI = 0;
  let highI = 0;
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i].adult < tiers[lowI].adult) lowI = i;
    if (tiers[i].adult > tiers[highI].adult) highI = i;
  }

  return {
    adultFrom: tiers[lowI].adult,
    adultTo: tiers[highI].adult,
    childFrom: tiers[lowI].child,
    childTo: tiers[highI].child,
    bandFrom: bandOf(lowI),
    bandTo: bandOf(highI),
  };
}

/** 该线路是否已具备可对外/演示的定价结构（需有按日明细） */
export function pricingAvailable(id: RouteId): boolean {
  const p = routePricing[id];
  if (p.status === "none") return false;
  return p.days.some((d) => d.lines.length > 0);
}

/** 按日路径：人数是否超出车型/线路上限 */
export function dayPricingMaxPax(p: RoutePricing): number {
  if (p.maxPax > 0) return p.maxPax;
  let max = 0;
  const byId = new Map(p.catalogs.vehicles.map((v) => [v.id, v]));
  for (const day of p.days) {
    for (const line of day.lines) {
      if (line.type !== "vehicle" || !line.ref) continue;
      const v = byId.get(line.ref);
      if (v && v.maxPax > max) max = v.maxPax;
    }
  }
  return max;
}
