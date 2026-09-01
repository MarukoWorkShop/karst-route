import type { RouteId, Tx } from "@/types";
import basemap from "@/data/osmBasemap.json";

export type MapPlace = {
  id: string;
  lon: number;
  lat: number;
  kind: "city" | "scenic";
  label: Tx;
};

export type MapRegion = {
  id: string;
  name: Tx;
  rings: number[][][];
};

export type OsmBasemap = {
  attribution: string;
  bbox: [number, number, number, number];
  core: MapRegion[];
  land: MapRegion[];
  rivers: { name: string; lines: number[][][] }[];
  places: MapPlace[];
  routes: Record<RouteId, string[]>;
};

export const osmBasemap = basemap as OsmBasemap;

const W = 760;
const H = 520;
const [west, south, east, north] = osmBasemap.bbox;

export const mapView = { w: W, h: H };

export function project(lon: number, lat: number) {
  return {
    x: ((lon - west) / (east - west)) * W,
    y: ((north - lat) / (north - south)) * H,
  };
}

export function ringPath(ring: number[][]) {
  return (
    ring
      .map(([lon, lat], i) => {
        const { x, y } = project(lon, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export function linePath(line: number[][]) {
  return line
    .map(([lon, lat], i) => {
      const { x, y } = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export type RouteStop = MapPlace & { x: number; y: number; num: string };

/** Repeat visits (r2 returns to Nanning) get a small offset so numbers do not stack. */
function spreadOverlaps(stops: RouteStop[]): RouteStop[] {
  return stops.map((stop, i, all) => {
    const hits = all
      .slice(0, i)
      .filter((prev) => Math.hypot(prev.x - stop.x, prev.y - stop.y) < 18).length;
    if (!hits) return stop;
    return {
      ...stop,
      x: stop.x + 40 * hits,
      y: stop.y - 26 * hits,
    };
  });
}

export function routeStops(routeId: RouteId): RouteStop[] {
  const ids = osmBasemap.routes[routeId];
  const byId = new Map(osmBasemap.places.map((p) => [p.id, p]));
  const raw = ids
    .map((id, i) => {
      const p = byId.get(id);
      if (!p) return null;
      const { x, y } = project(p.lon, p.lat);
      return { ...p, x, y, num: String(i + 1) };
    })
    .filter((s): s is RouteStop => Boolean(s));
  return spreadOverlaps(raw);
}

/** Draw stop 1 → 2 → 3… (equal time per hop). `p` is 0–1. */
export function walkRoute(stops: RouteStop[], p: number) {
  const first = stops[0];
  if (!first) return { d: "", x: 0, y: 0, idx: 0 };
  if (stops.length === 1 || p <= 0) {
    return { d: `M${first.x.toFixed(1)},${first.y.toFixed(1)}`, x: first.x, y: first.y, idx: 0 };
  }
  const segs = stops.length - 1;
  const t = Math.min(1, p) * segs;
  const i = Math.min(segs - 1, Math.floor(t));
  const f = Math.min(1, t - i);
  const a = stops[i];
  const b = stops[i + 1];
  const x = a.x + (b.x - a.x) * f;
  const y = a.y + (b.y - a.y) * f;
  let d = `M${stops[0].x.toFixed(1)},${stops[0].y.toFixed(1)}`;
  for (let k = 1; k <= i; k++) {
    d += `L${stops[k].x.toFixed(1)},${stops[k].y.toFixed(1)}`;
  }
  d += `L${x.toFixed(1)},${y.toFixed(1)}`;
  const idx = f < 0.5 ? i : i + 1;
  return { d, x, y, idx };
}
