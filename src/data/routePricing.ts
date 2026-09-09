import { parse } from "yaml";
import type { RouteId } from "@/types";

/**
 * 三层报价：产品库 catalogs + 按日 days → estimateParty。
 * 无按日明细则询价（不回退旧七模块）。
 */

export type RoutePricingStatus = "none" | "demo" | "confirmed";

export type PriceAnchor = { n: number; adult: number; child: number };

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

/** 领队费按团人数分档（元/团）。「10+」含 10 人；「5-10」用于 5–9。 */
export type LeaderBands = {
  "1-2": number;
  "1-4": number;
  "5-10": number;
  "10+": number;
};

export type TeamFixedParts = {
  /** 无分档时的扁平领队费；有分档时等于「1-4」档便于展示 */
  leader: number;
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
  /** 默认按 1-4 人档合计（仅展示/兼容）；估算请用 resolveTeamFixed */
  teamFixed: number;
  teamFixedParts: TeamFixedParts;
  margin: number;
  roundBase: number;
  anchors: PriceAnchor[];
  occupancy: number;
  maxPax: number;
  catalogs: PricingCatalogs;
  days: PricingDay[];
};

export function resolveLeaderFee(parts: TeamFixedParts, n: number): number {
  const b = parts.leaderBands;
  const hasBands = b["1-2"] > 0 || b["1-4"] > 0 || b["5-10"] > 0 || b["10+"] > 0;
  if (!hasBands) return parts.leader;
  if (n <= 2) return b["1-2"] > 0 ? b["1-2"] : b["1-4"];
  if (n <= 4) return b["1-4"];
  // 「10人以上」含 10；「5-10」档用于 5–9，避免与大团档抢 10 人
  if (n < 10) return b["5-10"];
  return b["10+"];
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
    const bands: LeaderBands = {
      "1-2": num(leaderRaw["1-2"] ?? leaderRaw.band1to2, fb.leaderBands["1-2"] || 0),
      "1-4": num(leaderRaw["1-4"] ?? leaderRaw.band1to4, fb.leaderBands["1-4"] || fb.leader),
      "5-10": num(leaderRaw["5-10"] ?? leaderRaw.band5to10, fb.leaderBands["5-10"] || fb.leader),
      "10+": num(leaderRaw["10+"] ?? leaderRaw.bandOver10, fb.leaderBands["10+"] || fb.leader),
    };
    return { leader: bands["1-4"], leaderBands: bands, ops, reserve };
  }
  const flat = num(leaderRaw, fb.leader);
  return {
    leader: flat,
    leaderBands: { "1-2": flat, "1-4": flat, "5-10": flat, "10+": flat },
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
    occupancy: num(y.occupancy, fb.occupancy) || 2,
    maxPax: num(y.maxPax, fb.maxPax),
    catalogs,
    days: daysOf(y.days),
  };
}

export const routePricing: Record<RouteId, RoutePricing> = {
  r1: build("r1"),
  r2: build("r2"),
  r3: build("r3"),
};

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
