import type { RouteId } from "@/types";
import {
  pricingAvailable,
  resolveTeamFixed,
  routePricing,
  type PricingDayLine,
  type PricingVehicle,
  type RoutePricing,
} from "@/data/routePricing";

/**
 * 按日报价纯函数（无 React 依赖）。
 * 仅 days 路径；无按日明细则返回 null（询价）。
 * 人数超过单车载客时：优先换更大车型，否则按 ceil(n/maxPax) 加车；
 * 人数偏少时：同段可换更便宜的小车（如 2 人 → 4 座）。
 */

export type EstimateResult = {
  route: RouteId;
  adults: number;
  children: number;
  n: number;
  /** 各日车费合计（整车，非人均） */
  vehiclePrice: number;
  fleetAdjusted: boolean;
  adultPerPerson: number;
  childPerPerson: number;
  subtotal: number;
};

export function mround(x: number, base: number): number {
  if (!(base > 0)) return Math.round(x);
  return Math.round(x / base) * base;
}

function resolveLineAmount(
  line: PricingDayLine,
  pricing: RoutePricing,
  who: "adult" | "child" = "adult",
): number {
  if (line.amount != null && Number.isFinite(line.amount)) return line.amount;
  if (line.type === "hotel" && line.ref) {
    return pricing.catalogs.hotels.find((x) => x.id === line.ref)?.twinRate ?? 0;
  }
  if (line.type === "vehicle" && line.ref) {
    return pricing.catalogs.vehicles.find((x) => x.id === line.ref)?.dayRate ?? 0;
  }
  if (line.type === "guide" && line.ref) {
    return pricing.catalogs.guides.find((x) => x.id === line.ref)?.dayRate ?? 0;
  }
  if (line.type === "meal" && line.ref) {
    const m = pricing.catalogs.meals.find((x) => x.id === line.ref);
    return who === "child" ? (m?.childRate ?? m?.adultRate ?? 0) : (m?.adultRate ?? 0);
  }
  if (line.type === "ticket" && line.ref) {
    const t = pricing.catalogs.tickets.find((x) => x.id === line.ref);
    return who === "child" ? (t?.childRate ?? t?.adultRate ?? 0) : (t?.adultRate ?? 0);
  }
  if ((line.type === "tip" || line.type === "other") && line.ref) {
    const m = pricing.catalogs.misc.find((x) => x.id === line.ref);
    if (!m) return 0;
    if (m.split === "per_group_split" || m.split === "per_group") return m.groupRate ?? 0;
    return who === "child" ? (m.childRate ?? m.adultRate ?? 0) : (m.adultRate ?? 0);
  }
  return 0;
}

function resolveSplit(line: PricingDayLine, pricing: RoutePricing): PricingDayLine["split"] {
  if (line.type === "guide" && line.ref) {
    const g = pricing.catalogs.guides.find((x) => x.id === line.ref);
    if (g?.split === "per_person") return "per_person";
    if (g?.split === "per_group") return "per_group_split";
  }
  if ((line.type === "tip" || line.type === "other") && line.ref) {
    const m = pricing.catalogs.misc.find((x) => x.id === line.ref);
    if (m?.split === "per_person") return "per_person";
    if (m?.split === "per_group" || m?.split === "per_group_split") return "per_group_split";
    if (m?.split === "per_vehicle_split") return "per_vehicle_split";
    if (m?.split === "per_room_split") return "per_room_split";
  }
  return line.split;
}

export function resolveVehicleGross(
  line: PricingDayLine,
  pricing: RoutePricing,
  n: number,
): { gross: number; adjusted: boolean } {
  const selected: PricingVehicle | undefined = line.ref
    ? pricing.catalogs.vehicles.find((x) => x.id === line.ref)
    : undefined;
  const baseRate =
    line.amount != null && Number.isFinite(line.amount)
      ? line.amount
      : (selected?.dayRate ?? 0);
  const cap = selected?.maxPax ?? 0;

  const fit = (list: PricingVehicle[]) =>
    list
      .filter((v) => v.maxPax >= n && v.dayRate > 0)
      .sort((a, b) => a.dayRate - b.dayRate || a.maxPax - b.maxPax);

  const allFit = fit(pricing.catalogs.vehicles);
  const sameSeg = selected?.segment
    ? fit(pricing.catalogs.vehicles.filter((v) => v.segment === selected.segment))
    : allFit;

  // 超载：同段优先升更大车；否则加车（按最小够用载客，其次日价）
  if (cap > 0 && n > cap) {
    const bySize = [...(sameSeg.length ? sameSeg : allFit)].sort(
      (a, b) => a.maxPax - b.maxPax || a.dayRate - b.dayRate,
    );
    const upgrade = bySize[0];
    if (upgrade) {
      return { gross: upgrade.dayRate, adjusted: true };
    }
    const units = Math.ceil(n / cap);
    return { gross: baseRate * units, adjusted: units > 1 };
  }

  // 仅 2 人小团：同段降到 4 座等更小车型（maxPax≤2），不跨档误用更便宜的 7 座
  if (n <= 2) {
    const small = sameSeg
      .filter((v) => v.maxPax <= 2 && v.dayRate < baseRate)
      .sort((a, b) => a.dayRate - b.dayRate)[0];
    if (small) {
      return { gross: small.dayRate, adjusted: true };
    }
  }

  return { gross: baseRate, adjusted: false };
}

export function lineCostPerPerson(
  line: PricingDayLine,
  pricing: RoutePricing,
  n: number,
): { adult: number; child: number; vehicleGross: number; fleetAdjusted: boolean } {
  if (line.payOnSite) return { adult: 0, child: 0, vehicleGross: 0, fleetAdjusted: false };
  if (n <= 0) return { adult: 0, child: 0, vehicleGross: 0, fleetAdjusted: false };

  const rooms = line.rooms && line.rooms > 0 ? line.rooms : 1;
  const qty = line.qty && line.qty > 0 ? line.qty : 1;
  const occupancy = pricing.occupancy > 0 ? pricing.occupancy : 2;
  const split = resolveSplit(line, pricing);
  const adultOk = line.adultApplicable !== false;
  const childOk = line.childApplicable !== false;

  let unitAdult = 0;
  let unitChild = 0;
  let vehicleGross = 0;
  let fleetAdjusted = false;

  if (split === "per_room_split") {
    const amount = resolveLineAmount(line, pricing, "adult");
    const perHead = (amount * rooms) / occupancy;
    if (adultOk) unitAdult = perHead;
  } else if (split === "per_vehicle_split") {
    const { gross, adjusted } = resolveVehicleGross(line, pricing, n);
    const perHead = gross / n;
    if (adultOk) unitAdult = perHead;
    if (childOk) unitChild = perHead;
    vehicleGross = gross;
    fleetAdjusted = adjusted;
  } else if (split === "per_group_split") {
    const amount = resolveLineAmount(line, pricing, "adult");
    const perHead = amount / n;
    if (adultOk) unitAdult = perHead;
    if (childOk) unitChild = perHead;
  } else {
    if (adultOk) unitAdult = resolveLineAmount(line, pricing, "adult") * qty;
    if (childOk) unitChild = resolveLineAmount(line, pricing, "child") * qty;
  }

  return { adult: unitAdult, child: unitChild, vehicleGross, fleetAdjusted };
}

export function sumDaysCost(
  pricing: RoutePricing,
  n: number,
): { adult: number; child: number; vehicleGross: number; fleetAdjusted: boolean } {
  let adult = 0;
  let child = 0;
  let vehicleGross = 0;
  let fleetAdjusted = false;
  for (const day of pricing.days) {
    for (const line of day.lines) {
      const c = lineCostPerPerson(line, pricing, n);
      adult += c.adult;
      child += c.child;
      vehicleGross += c.vehicleGross;
      if (c.fleetAdjusted) fleetAdjusted = true;
    }
  }
  return { adult, child, vehicleGross, fleetAdjusted };
}

export function estimateParty(
  route: RouteId,
  adults: number,
  children: number,
): EstimateResult | null {
  const pricing = routePricing[route];
  if (!pricing || !pricingAvailable(route)) return null;

  const n = adults + children;
  if (n <= 0) return null;
  if (!pricing.days.some((d) => d.lines.length > 0)) return null;

  const m = 1 + pricing.margin;
  const { adult, child, vehicleGross, fleetAdjusted } = sumDaysCost(pricing, n);
  const share = resolveTeamFixed(pricing.teamFixedParts, n) / n;
  const adultPerPerson = mround((adult + share) * m, pricing.roundBase);
  const childPerPerson = mround((child + share) * m, pricing.roundBase);
  const subtotal = adults * adultPerPerson + children * childPerPerson;
  return {
    route,
    adults,
    children,
    n,
    vehiclePrice: vehicleGross,
    fleetAdjusted,
    adultPerPerson,
    childPerPerson,
    subtotal,
  };
}

export function fmtCny(v: number): string {
  return `¥${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function estSummaryLine(
  est: EstimateResult,
  t: (s: { en: string; zh: string }) => string,
  locale: "en" | "zh",
): string {
  const tag = locale === "zh" ? "【参考】" : "[Reference] ";
  const and = locale === "zh" ? "＋" : " + ";
  const eq = locale === "zh" ? "≈" : "≈";
  const a = `${t({ en: "Adults", zh: "成人" })} ${fmtCny(est.adultPerPerson)}×${est.adults}`;
  const c = `${t({ en: "Child", zh: "儿童" })} ${fmtCny(est.childPerPerson)}×${est.children}`;
  return `${tag}${a}${and}${c} ${eq} ${fmtCny(est.subtotal)}`;
}
