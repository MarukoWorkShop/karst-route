/**
 * 从 pricing.yaml 形态估算（与 src/lib/estimate.ts 按日路径对齐）。
 */

function mround(x, base) {
  if (!(base > 0)) return Math.round(x);
  return Math.round(x / base) * base;
}

function catalogRate(line, catalogs, who) {
  if (line.type === "hotel" && line.ref) {
    return catalogs.hotels?.find((h) => h.id === line.ref)?.twinRate ?? 0;
  }
  if (line.type === "vehicle" && line.ref) {
    return catalogs.vehicles?.find((v) => v.id === line.ref)?.dayRate ?? 0;
  }
  if (line.type === "guide" && line.ref) {
    return catalogs.guides?.find((g) => g.id === line.ref)?.dayRate ?? 0;
  }
  if (line.type === "meal" && line.ref) {
    const m = catalogs.meals?.find((x) => x.id === line.ref);
    return who === "child" ? (m?.childRate ?? m?.adultRate ?? 0) : (m?.adultRate ?? 0);
  }
  if (line.type === "ticket" && line.ref) {
    const t = catalogs.tickets?.find((x) => x.id === line.ref);
    return who === "child" ? (t?.childRate ?? t?.adultRate ?? 0) : (t?.adultRate ?? 0);
  }
  if ((line.type === "tip" || line.type === "other") && line.ref) {
    const m = catalogs.misc?.find((x) => x.id === line.ref);
    if (!m) return 0;
    if (m.split === "per_group_split" || m.split === "per_group") return m.groupRate ?? 0;
    return who === "child" ? (m.childRate ?? m.adultRate ?? 0) : (m.adultRate ?? 0);
  }
  return 0;
}

function resolveAmount(line, catalogs, who = "adult") {
  if (line.amount != null && Number.isFinite(line.amount)) return line.amount;
  return catalogRate(line, catalogs, who);
}

function resolveSplit(line, catalogs) {
  if (line.type === "guide" && line.ref) {
    const g = catalogs.guides?.find((x) => x.id === line.ref);
    if (g?.split === "per_person") return "per_person";
    if (g?.split === "per_group") return "per_group_split";
  }
  if ((line.type === "tip" || line.type === "other") && line.ref) {
    const m = catalogs.misc?.find((x) => x.id === line.ref);
    if (m?.split) return m.split === "per_group" ? "per_group_split" : m.split;
  }
  return line.split;
}

function resolveVehicleGross(line, catalogs, n) {
  const selected = line.ref ? catalogs.vehicles?.find((v) => v.id === line.ref) : null;
  const baseRate =
    line.amount != null && Number.isFinite(line.amount) ? line.amount : (selected?.dayRate ?? 0);
  const cap = selected?.maxPax ?? 0;
  const vehicles = catalogs.vehicles || [];

  const fit = (list) =>
    list
      .filter((v) => v.maxPax >= n && v.dayRate > 0)
      .sort((a, b) => a.dayRate - b.dayRate || a.maxPax - b.maxPax);

  const allFit = fit(vehicles);
  const sameSeg = selected?.segment
    ? fit(vehicles.filter((v) => v.segment === selected.segment))
    : allFit;

  if (cap > 0 && n > cap) {
    const bySize = [...(sameSeg.length ? sameSeg : allFit)].sort(
      (a, b) => a.maxPax - b.maxPax || a.dayRate - b.dayRate,
    );
    const upgrade = bySize[0];
    if (upgrade) return upgrade.dayRate;
    return baseRate * Math.ceil(n / cap);
  }

  // 仅 2 人小团降到 maxPax≤2 的 4 座小车
  if (n <= 2) {
    const small = sameSeg
      .filter((v) => v.maxPax <= 2 && v.dayRate < baseRate)
      .sort((a, b) => a.dayRate - b.dayRate)[0];
    if (small) return small.dayRate;
  }

  return baseRate;
}

function lineCost(line, catalogs, n, occupancy) {
  if (line.payOnSite || n <= 0) return { adult: 0, child: 0 };
  const rooms = line.rooms > 0 ? line.rooms : 1;
  const qty = line.qty > 0 ? line.qty : 1;
  const adultOk = line.adultApplicable !== false;
  const childOk = line.childApplicable !== false;
  const split = resolveSplit(line, catalogs);

  if (split === "per_room_split") {
    const amount = resolveAmount(line, catalogs, "adult");
    const per = (amount * rooms) / (occupancy > 0 ? occupancy : 2);
    return { adult: adultOk ? per : 0, child: 0 };
  }
  if (split === "per_vehicle_split") {
    const gross = resolveVehicleGross(line, catalogs, n);
    const per = gross / n;
    return { adult: adultOk ? per : 0, child: childOk ? per : 0 };
  }
  if (split === "per_group_split") {
    const amount = resolveAmount(line, catalogs, "adult");
    const per = amount / n;
    return { adult: adultOk ? per : 0, child: childOk ? per : 0 };
  }
  const adultUnit = resolveAmount(line, catalogs, "adult") * qty;
  const childUnit = resolveAmount(line, catalogs, "child") * qty;
  return {
    adult: adultOk ? adultUnit : 0,
    child: childOk ? childUnit : 0,
  };
}

function resolveLeaderFee(tf, n) {
  const leader = tf?.leader;
  if (leader != null && typeof leader === "object") {
    const b12 = Number(leader["1-2"] ?? leader.band1to2) || 0;
    const b14 = Number(leader["1-4"] ?? leader.band1to4) || 0;
    if (n <= 2) return b12 > 0 ? b12 : b14;
    if (n <= 4) return b14;
    // 「10人以上」含 10；「5-10」档用于 5–9
    if (n < 10) return Number(leader["5-10"] ?? leader.band5to10) || 0;
    return Number(leader["10+"] ?? leader.bandOver10) || 0;
  }
  return Number(leader) || 0;
}

export function estimateRouteParty(routeRow, catalogs, adults, children) {
  const n = adults + children;
  if (n <= 0) return null;
  const days = routeRow.days || [];
  if (!days.some((d) => (d.lines || []).length)) return null;

  const occupancy = routeRow.occupancy > 0 ? routeRow.occupancy : 2;
  const margin = Number(routeRow.margin) || 0;
  const roundBase = Number(routeRow.roundBase) || 10;
  const tf = routeRow.teamFixed || {};
  const teamFixed =
    resolveLeaderFee(tf, n) + (Number(tf.ops) || 0) + (Number(tf.reserve) || 0);

  let adult = 0;
  let child = 0;
  for (const day of days) {
    for (const line of day.lines || []) {
      const c = lineCost(line, catalogs, n, occupancy);
      adult += c.adult;
      child += c.child;
    }
  }
  const share = teamFixed / n;
  const m = 1 + margin;
  const adultPerPerson = mround((adult + share) * m, roundBase);
  const childPerPerson = mround((child + share) * m, roundBase);
  return {
    n,
    adultPerPerson,
    childPerPerson,
    subtotalAllAdults: adultPerPerson * n,
    teamFixed,
    leaderFee: resolveLeaderFee(tf, n),
  };
}
