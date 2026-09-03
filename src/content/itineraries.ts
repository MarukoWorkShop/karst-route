import type { DayStop, PlaceId, RouteId, StayKind, ThemeId } from "@/types";
import { asset } from "@/lib/asset";
import { globYaml, strList, txList, txOf, txOrEmpty } from "@/content/helpers";

const files = import.meta.glob("../../content/itineraries/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const STAY: StayKind[] = ["hotel", "train", "park", "base"];
const THEMES: ThemeId[] = ["wild", "flavors", "villages", "locals"];
const PLACES: PlaceId[] = [
  "nanning",
  "chongzuo",
  "halong",
  "catba",
  "hanoi",
  "sapa",
  "train",
  "jianshui",
  "puzhehei",
  "mile",
  "kunming",
  "guantang",
];

function parseDay(raw: Record<string, unknown>, fallback: DayStop, fileSrc: string): DayStop {
  const stayKind = STAY.includes(raw.stayKind as StayKind) ? (raw.stayKind as StayKind) : fallback.stayKind;
  const placeId = PLACES.includes(raw.placeId as PlaceId) ? (raw.placeId as PlaceId) : fallback.placeId;
  const themes = strList(raw.themes, fallback.themes).filter((id): id is ThemeId => THEMES.includes(id as ThemeId));
  const photos = strList(raw.photos, []).map((p) => asset(`/${p.replace(/^\//, "")}`));
  const empty: { en: string; zh: string } = { en: "", zh: "" };
  return {
    day: typeof raw.day === "number" ? raw.day : fallback.day,
    city: txOf(raw.city, fallback.city, fileSrc),
    stay: txOf(raw.stay, fallback.stay, fileSrc),
    stayKind,
    ...(placeId ? { placeId } : {}),
    ...(txOrEmpty(raw.drive, fileSrc) || fallback.drive
      ? { drive: txOf(raw.drive, fallback.drive ?? empty, fileSrc) }
      : {}),
    ...(txOrEmpty(raw.blurb, fileSrc) || fallback.blurb
      ? { blurb: txOf(raw.blurb, fallback.blurb ?? empty, fileSrc) }
      : {}),
    ...(photos.length > 0 || fallback.photos ? { photos: photos.length > 0 ? photos : fallback.photos } : {}),
    ...(txOrEmpty(raw.transport, fileSrc) || fallback.transport
      ? { transport: txOf(raw.transport, fallback.transport ?? empty, fileSrc) }
      : {}),
    ...(txOrEmpty(raw.lodging, fileSrc) || fallback.lodging
      ? { lodging: txOf(raw.lodging, fallback.lodging ?? empty, fileSrc) }
      : {}),
    dining: txList(raw.dining, fallback.dining ?? [], fileSrc),
    bullets: txList(raw.bullets, fallback.bullets, fileSrc),
    themes: themes.length > 0 ? themes : fallback.themes,
  };
}

export function overlayItineraries(
  fallback: Record<RouteId, { id: RouteId; days: DayStop[] }>,
): Record<RouteId, { id: RouteId; days: DayStop[] }> {
  const loaded = globYaml(files);
  const byId = Object.fromEntries(loaded.map((f) => [f.id, f]));
  const out = { ...fallback };
  for (const id of Object.keys(fallback) as RouteId[]) {
    const doc = byId[id];
    const daysRaw = doc?.data && Array.isArray(doc.data.days) ? doc.data.days : null;
    if (!daysRaw || daysRaw.length === 0) continue;
    const fbDays = fallback[id].days;
    const fileSrc = doc.src ?? "zh";
    out[id] = {
      id,
      days: daysRaw.map((item, i) => {
        const rec = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
        const fb = fbDays[i] ?? fbDays[fbDays.length - 1] ?? fbDays[0];
        return parseDay(rec, fb, fileSrc);
      }),
    };
  }
  return out;
}
