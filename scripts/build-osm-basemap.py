#!/usr/bin/env python3
"""Rebuild src/data/osmBasemap.json (offline vector basemap).

See DESIGN.md §8.1. Run from repo root:
  python3 scripts/build-osm-basemap.py
"""
from __future__ import annotations

import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "osmBasemap.json"
BBOX = (102.25, 20.45, 110.35, 26.35)  # W S E N
CORE_ADMIN = {"Yunnan", "Guangxi"}
LAND_ADMIN = {"Yunnan", "Guangxi", "Guizhou", "Guangdong", "Hainan"}
NE = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson"
ATLAS = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"

PLACES = [
    {"id": "nanning", "lon": 108.3669, "lat": 22.8170, "kind": "city", "label": {"en": "Nanning", "zh": "南宁"}},
    {"id": "chongzuo", "lon": 107.3647, "lat": 22.3773, "kind": "city", "label": {"en": "Chongzuo", "zh": "崇左"}},
    {"id": "detian", "lon": 106.7219, "lat": 22.8564, "kind": "scenic", "label": {"en": "Detian", "zh": "德天"}},
    {"id": "longzhou", "lon": 106.8542, "lat": 22.3439, "kind": "city", "label": {"en": "Longzhou", "zh": "龙州"}},
    {"id": "catba", "lon": 107.0483, "lat": 20.7275, "kind": "scenic", "label": {"en": "Cat Ba", "zh": "吉婆岛"}},
    {"id": "halong", "lon": 107.0717, "lat": 20.9506, "kind": "scenic", "label": {"en": "Ha Long", "zh": "下龙"}},
    {"id": "hanoi", "lon": 105.8542, "lat": 21.0285, "kind": "city", "label": {"en": "Hanoi", "zh": "河内"}},
    {"id": "sapa", "lon": 103.8439, "lat": 22.3364, "kind": "city", "label": {"en": "Sapa", "zh": "沙坝"}},
    {"id": "hekou", "lon": 103.9394, "lat": 22.5292, "kind": "city", "label": {"en": "Hekou", "zh": "河口"}},
    {"id": "jianshui", "lon": 102.8264, "lat": 23.6347, "kind": "city", "label": {"en": "Jianshui", "zh": "建水"}},
    {"id": "puzhehei", "lon": 104.1930, "lat": 24.1400, "kind": "scenic", "label": {"en": "Puzhehei", "zh": "普者黑"}},
    {"id": "mile", "lon": 103.4150, "lat": 24.4080, "kind": "city", "label": {"en": "Mile", "zh": "弥勒"}},
    {"id": "kunming", "lon": 102.7183, "lat": 25.0389, "kind": "city", "label": {"en": "Kunming", "zh": "昆明"}},
    {"id": "guantang", "lon": 106.8600, "lat": 22.3600, "kind": "scenic", "label": {"en": "Guantang", "zh": "观堂"}},
]

ROUTES = {
    "r1": ["nanning", "detian", "halong", "catba", "hanoi", "sapa", "hekou", "jianshui", "puzhehei", "mile", "kunming"],
    # Nanning loop: last stop repeats nanning. Markers are fanned in routeStops().
    "r2": ["nanning", "catba", "hanoi", "sapa", "longzhou", "detian", "nanning"],
}

ZH_ADMIN = {"Yunnan": "云南", "Guangxi": "广西", "Guizhou": "贵州", "Guangdong": "广东", "Hainan": "海南"}
ZH_CTY = {"Vietnam": "越南", "Laos": "老挝", "Myanmar": "缅甸"}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "karst-route-basemap/0.1"})
    with urllib.request.urlopen(req, timeout=90) as res:
        return res.read()


def rdp(points, eps):
    if len(points) < 3:
        return points

    def dist(a, b, p):
        (x1, y1), (x2, y2), (x0, y0) = a, b, p
        dx, dy = x2 - x1, y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(x0 - x1, y0 - y1)
        t = max(0, min(1, ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)))
        return math.hypot(x0 - (x1 + t * dx), y0 - (y1 + t * dy))

    stack = [(0, len(points) - 1)]
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    while stack:
        i, j = stack.pop()
        maxd, idx = -1, i
        for k in range(i + 1, j):
            d = dist(points[i], points[j], points[k])
            if d > maxd:
                maxd, idx = d, k
        if maxd > eps:
            keep[idx] = True
            stack.append((i, idx))
            stack.append((idx, j))
    return [p for p, k in zip(points, keep) if k]


def in_bbox(lon, lat, pad=0.6):
    w, s, e, n = BBOX
    return (w - pad) <= lon <= (e + pad) and (s - pad) <= lat <= (n + pad)


def rings_of(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return c
    if t == "MultiPolygon":
        rings = []
        for poly in c:
            rings.extend(poly)
        return rings
    return []


def simplify_ring(ring, eps):
    pts = [(p[0], p[1]) for p in ring]
    if len(pts) > 4:
        pts = rdp(pts, eps)
    if not any(in_bbox(x, y) for x, y in pts):
        return None
    return [[round(x, 4), round(y, 4)] for x, y in pts]


def clip_line(coords):
    w, s, e, n = BBOX
    pad = 0.15
    out = []
    for lon, lat in coords:
        if (w - pad) <= lon <= (e + pad) and (s - pad) <= lat <= (n + pad):
            out.append((lon, lat))
    return out


def decode_topo(topo):
    scale = topo["transform"]["scale"]
    trans = topo["transform"]["translate"]
    decoded = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * scale[0] + trans[0], y * scale[1] + trans[1]))
        decoded.append(pts)
    return decoded


def assemble(arcs, decoded):
    pts = []
    for i in arcs:
        seg = decoded[i] if i >= 0 else list(reversed(decoded[~i]))
        pts.extend(seg[1:] if pts else seg)
    return pts


def geom_rings(g, decoded):
    rings = []
    if g["type"] == "Polygon":
        for ring_arcs in g["arcs"]:
            rings.append(assemble(ring_arcs, decoded))
    elif g["type"] == "MultiPolygon":
        for poly in g["arcs"]:
            for ring_arcs in poly:
                rings.append(assemble(ring_arcs, decoded))
    return rings


def main():
    admin = json.loads(fetch(f"{NE}/ne_50m_admin_1_states_provinces.geojson"))
    rivers_gj = json.loads(fetch(f"{NE}/ne_50m_rivers_lake_centerlines.geojson"))
    atlas = json.loads(fetch(ATLAS))

    core, land = [], []
    for f in admin["features"]:
        p = f["properties"]
        if p.get("adm0_a3") != "CHN":
            continue
        name = p.get("name_en") or p.get("name")
        if name not in LAND_ADMIN:
            continue
        rings = []
        for ring in rings_of(f["geometry"]):
            sm = simplify_ring(ring, 0.035 if name in CORE_ADMIN else 0.05)
            if sm and len(sm) >= 4:
                rings.append(sm)
        if not rings:
            continue
        rec = {"id": name.lower(), "name": {"en": name, "zh": ZH_ADMIN[name]}, "rings": rings}
        (core if name in CORE_ADMIN else land).append(rec)

    decoded = decode_topo(atlas)
    for g in atlas["objects"]["countries"]["geometries"]:
        name = (g.get("properties") or {}).get("name")
        if name not in ZH_CTY:
            continue
        rings = []
        for ring in geom_rings(g, decoded):
            sm = simplify_ring(ring, 0.05)
            if sm and len(sm) >= 4:
                rings.append(sm)
        if not rings:
            continue
        rec = {"id": name.lower(), "name": {"en": name, "zh": ZH_CTY[name]}, "rings": rings}
        (core if name == "Vietnam" else land).append(rec)

    rivers = []
    for f in rivers_gj["features"]:
        geom = f.get("geometry")
        if not geom:
            continue
        name = (f.get("properties") or {}).get("name") or (f.get("properties") or {}).get("name_en") or ""
        coords = []
        if geom["type"] == "LineString":
            coords = [geom["coordinates"]]
        elif geom["type"] == "MultiLineString":
            coords = geom["coordinates"]
        clipped = []
        for line in coords:
            c = clip_line([(p[0], p[1]) for p in line])
            if len(c) >= 2:
                c = rdp(c, 0.03)
                clipped.append([[round(x, 4), round(y, 4)] for x, y in c])
        if clipped:
            rivers.append({"name": name, "lines": clipped})
    rivers.sort(key=lambda r: -sum(len(l) for l in r["lines"]))
    rivers = rivers[:18]

    out = {
        "attribution": "© OpenStreetMap contributors · Natural Earth",
        "bbox": list(BBOX),
        "core": core,
        "land": land,
        "rivers": rivers,
        "places": PLACES,
        "routes": ROUTES,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
