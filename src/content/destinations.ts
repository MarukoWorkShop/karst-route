import type { PlaceId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { globYaml, strList, strOf, txOf } from "@/content/helpers";

export type PlaceDetail = {
  title: Tx;
  body: Tx;
};

export type Place = {
  id: PlaceId;
  tagline: Tx;
  photo: string;
  experience: PlaceDetail;
  cuisine: PlaceDetail;
  hotel: PlaceDetail & { photo: string };
};

const files = import.meta.glob("../../content/destinations/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const PLACE_IDS: PlaceId[] = [
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

function detailOf(
  raw: unknown,
  fallback: PlaceDetail,
  fileSrc: string,
): PlaceDetail {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    title: txOf(o.title, fallback.title, fileSrc),
    body: txOf(o.body, fallback.body, fileSrc),
  };
}

function photoOf(value: unknown, fallback: string): string {
  const rel = strOf(value, "").replace(/^\//, "");
  if (!rel) return fallback;
  return asset(`/${rel}`);
}

function overlayPlace(id: PlaceId, fallback: Place, data: Record<string, unknown>, fileSrc: string): Place {
  const hotelRaw = (data.hotel && typeof data.hotel === "object" ? data.hotel : {}) as Record<
    string,
    unknown
  >;
  return {
    id,
    tagline: txOf(data.tagline, fallback.tagline, fileSrc),
    photo: photoOf(data.photo, fallback.photo),
    experience: detailOf(data.experience, fallback.experience, fileSrc),
    cuisine: detailOf(data.cuisine, fallback.cuisine, fileSrc),
    hotel: {
      ...detailOf(data.hotel, fallback.hotel, fileSrc),
      photo: photoOf(hotelRaw.photo, fallback.hotel.photo),
    },
  };
}

export function overlayPlaces(fallback: Record<PlaceId, Place>): Record<PlaceId, Place> {
  const loaded = globYaml(files);
  const byId = Object.fromEntries(loaded.map((f) => [f.id, f]));
  const out = { ...fallback };
  for (const id of PLACE_IDS) {
    const doc = byId[id];
    if (!doc) continue;
    out[id] = overlayPlace(id, fallback[id], doc.data, doc.src ?? "zh");
  }
  return out;
}

export function overlayPlaceStories(
  fallback: Record<PlaceId, { culture: Tx; slides: string[] }>,
): Record<PlaceId, { culture: Tx; slides: string[] }> {
  const loaded = globYaml(files);
  const byId = Object.fromEntries(loaded.map((f) => [f.id, f]));
  const out = { ...fallback };
  for (const id of PLACE_IDS) {
    const doc = byId[id];
    if (!doc) continue;
    const fb = fallback[id];
    const slidesRel = strList(doc.data.slides, []).map((p) => p.replace(/^\//, ""));
    const slides =
      slidesRel.length > 0 ? slidesRel.map((p) => asset(`/${p}`)) : fb.slides;
    out[id] = {
      culture: txOf(doc.data.culture, fb.culture, doc.src ?? "zh"),
      slides,
    };
  }
  return out;
}
