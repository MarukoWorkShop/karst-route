import type { RouteId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { globYaml, numOf, strList, strOf, txOf } from "@/content/helpers";
import type { TravelerReview } from "@/data/reviews";
import { copy } from "@/i18n/copy";

const files = import.meta.glob("../../content/reviews/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const ROUTE_IDS: RouteId[] = ["r1", "r2", "r3"];

function routeLabel(id: RouteId): Tx {
  const c = copy.tours as unknown as Record<string, Tx>;
  return c[`${id}Tab`] ?? { en: id, zh: id };
}

export function overlayReviews(fallback: TravelerReview[]): TravelerReview[] {
  const loaded = globYaml(files)
    .map(({ id, data, src: fileSrc }) => {
      const routeId = ROUTE_IDS.includes(data.route as RouteId) ? (data.route as RouteId) : null;
      if (!routeId) return null;
      const fb = fallback.find((r) => r.id === id);
      const empty: Tx = { en: "", zh: "" };
      return {
        id,
        flag: strOf(data.flag, fb?.flag ?? ""),
        name: strOf(data.name, fb?.name ?? id),
        country: strOf(data.country, fb?.country ?? ""),
        route: routeLabel(routeId),
        rating: Math.min(5, Math.max(1, numOf(data.rating, fb?.rating ?? 5))),
        date: strOf(data.date, fb?.date ?? ""),
        short: txOf(data.short, fb?.short ?? empty, fileSrc),
        full: txOf(data.full, fb?.full ?? empty, fileSrc),
        photos: strList(data.photos, []).map((p) => asset(`/${p.replace(/^\//, "")}`)),
        _routeId: routeId,
      };
    })
    .filter((item): item is TravelerReview & { _routeId: RouteId } => Boolean(item));

  if (loaded.length === 0) return fallback;

  return loaded.map(({ _routeId: _id, ...rest }) => rest);
}

export function reviewRouteId(review: TravelerReview): RouteId | null {
  const c = copy.tours as unknown as Record<string, Tx>;
  for (const id of ROUTE_IDS) {
    if (review.route.zh === c[`${id}Tab`]?.zh || review.route.en === c[`${id}Tab`]?.en) return id;
  }
  if (review.route.zh.includes("一")) return "r1";
  if (review.route.zh.includes("二")) return "r2";
  if (review.route.zh.includes("三")) return "r3";
  return null;
}
