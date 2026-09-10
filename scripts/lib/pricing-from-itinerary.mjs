/**
 * 报价二期：行程 → 按日一行骨架（共享逻辑）
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();

export function loadYaml(rel) {
  return parseYaml(fs.readFileSync(path.join(root, rel), "utf8"));
}

export function loadDotenv() {
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
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

export function dashUuid(id) {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export function idemKey(routeId, day) {
  return `${routeId}|d${day}|day`;
}

export function loadItinerary(routeId) {
  const doc = loadYaml(`content/itineraries/${routeId}.yaml`);
  const days = Array.isArray(doc?.days) ? doc.days : [];
  if (!days.length) throw new Error(`行程无 days：content/itineraries/${routeId}.yaml`);
  return days;
}

export function loadMaps() {
  const hotelMap = loadYaml("content/pricing-hotel-map.yaml");
  const defaults = loadYaml("content/pricing-defaults.yaml");
  return { hotelMap, defaults };
}

export function hotelIdFor(routeId, placeId, hotelMap) {
  if (!placeId) return "";
  const fromRoute = hotelMap.routes?.[routeId]?.[placeId];
  if (fromRoute) return fromRoute;
  return hotelMap.default?.[placeId] || "";
}

export function segmentFor(placeId, defaults) {
  return defaults.segmentByPlace?.[placeId] || "china";
}

function vehicleIdForSegment(seg, defaults) {
  const v = defaults.vehicles || {};
  if (seg === "vietnam") return v.vietnam || "";
  if (seg === "guangxi") return v.guangxi || v.china || "";
  if (seg === "border") return v.border || v.china || "";
  return v.china || "";
}

function guideIdForSegment(seg, defaults) {
  const g = defaults.guides || {};
  if (seg === "vietnam") return g.vietnam || "";
  return g.china || "";
}

function textOf(tx) {
  if (!tx) return "";
  if (typeof tx === "string") return tx;
  return tx.zh || tx.en || "";
}

function needsVehicle(day) {
  if (day.drive) return true;
  const t = `${textOf(day.transport)} ${textOf(day.drive)}`;
  return /专车|包车|用车|车程|口岸|入境|出境|轮渡|接机|送机|过境|private\s*car|transfer|drive/i.test(
    t,
  );
}

function isBorderDay(day) {
  const t = `${textOf(day.transport)} ${textOf(day.drive)} ${textOf(day.city)}`;
  return /口岸|入境|出境|过境|跨境|芒街|东兴|友谊关|border|cross/i.test(t);
}

function isDepartureOnly(day, maxDay) {
  if (day.day !== maxDay) return false;
  const t = `${textOf(day.city)} ${textOf(day.stay)} ${textOf(day.lodging)} ${day.placeId || ""}`;
  return /送机|返程|结束|departure|airport\s*drop|fly\s*out/i.test(t) || !day.placeId;
}

function wantsHotel(day, maxDay) {
  if (isDepartureOnly(day, maxDay)) return false;
  if (day.stayKind === "train") return false;
  return ["hotel", "park", "base"].includes(day.stayKind) || !day.stayKind;
}

/**
 * @returns {object} 目标按日一行骨架
 */
export function planDayStub(routeId, day, maxDay, hotelMap, defaults) {
  const placeId = day.placeId || "";
  const cityZh = textOf(day.city) || placeId || `D${day.day}`;
  const prefix = defaults.routeTitlePrefix?.[routeId] || routeId;
  const seg = segmentFor(placeId || (isDepartureOnly(day, maxDay) ? "nanning" : ""), defaults);
  const hotel = wantsHotel(day, maxDay) ? hotelIdFor(routeId, placeId, hotelMap) : "";
  const wantHotel = wantsHotel(day, maxDay);
  const wantVeh = needsVehicle(day) || isDepartureOnly(day, maxDay);
  const border = isBorderDay(day);

  let vehicleA = "";
  let vehicleB = "";
  if (wantVeh) {
    if (border) {
      vehicleA = defaults.vehicles?.border || vehicleIdForSegment("guangxi", defaults);
      vehicleB = defaults.vehicles?.vietnam || vehicleIdForSegment("vietnam", defaults);
    } else {
      vehicleA = vehicleIdForSegment(seg, defaults);
    }
  }

  const wantGuide = wantHotel || wantVeh;
  const guide = wantGuide ? guideIdForSegment(border ? "vietnam" : seg, defaults) : "";

  const warnings = [];
  if (wantHotel && placeId && !hotel) warnings.push(`unmapped_hotel:${placeId}`);
  if (wantHotel && !placeId) warnings.push("hotel_wanted_but_no_placeId");
  if (day.stayKind === "train") warnings.push("train_night_add_misc_manually");
  if ((day.dining || []).length) warnings.push("check_meals_manually");
  if ((day.bullets || []).length) warnings.push("check_tickets_manually");

  return {
    routeId,
    day: day.day,
    placeId,
    cityZh,
    title: `${prefix} · D${day.day} · ${cityZh}`,
    idempotencyKey: idemKey(routeId, day.day),
    stayKind: day.stayKind || "",
    hotelRef: hotel,
    wantHotel,
    vehicleARef: vehicleA,
    vehicleBRef: vehicleB,
    guideRef: guide,
    source: "itinerary_stub",
    warnings,
  };
}

export function planRouteStubs(routeId) {
  const days = loadItinerary(routeId);
  const { hotelMap, defaults } = loadMaps();
  const maxDay = Math.max(...days.map((d) => Number(d.day) || 0));
  return days
    .map((d) => planDayStub(routeId, d, maxDay, hotelMap, defaults))
    .sort((a, b) => a.day - b.day);
}

export function parseSheetTitle(title, routeCol, dayCol, placeCol) {
  const t = title || "";
  const route =
    routeCol ||
    (t.match(/·\s*(r[123])\s*·/i) || t.match(/\b(r[123])\b/i) || [])[1]?.toLowerCase() ||
    "";
  const day =
    dayCol > 0 ? dayCol : Number((t.match(/D(\d+)/i) || [])[1]) || 0;
  const place =
    placeCol ||
    t
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean)
      .pop() ||
    t;
  return { route, day, place };
}
