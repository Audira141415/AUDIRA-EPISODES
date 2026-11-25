"""Cuts country outlines from world-atlas countries-50m (TopoJSON, Natural Earth) into a small JS module for one episode.
python _tools/geo.py <out.js> <lon0> <lat0> <lon1> <lat1> [--simplify 0.02]
Output: export const GEO = [{name, rings: [[[lon,lat],...], ...]}, ...] for every country touching the box, rings clipped to nothing
(whole rings are kept so coastlines never end in a cut). Project lon/lat yourself in world3d.js."""
import json, sys
from pathlib import Path

# seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>; cari workspace (folder yang punya shared/) ke atas
WS = next(p for p in Path(__file__).resolve().parents if (p / "shared").is_dir() and (p / "CHANNEL_BRAND").is_dir())
SRC = next(p for p in (WS / "EXPLAINED/karhutla-gambut-2026/_research/geo/countries-50m.json", WS / "karhutla-gambut-2026/_research/geo/countries-50m.json") if p.exists())
out, lon0, lat0, lon1, lat1 = sys.argv[1], *map(float, sys.argv[2:6])
tol = float(sys.argv[sys.argv.index("--simplify") + 1]) if "--simplify" in sys.argv else 0.02
topo = json.loads(SRC.read_text(encoding="utf8"))
sx, sy = topo["transform"]["scale"]
tx, ty = topo["transform"]["translate"]
arcs = []
for a in topo["arcs"]:
    x = y = 0
    pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def arc(i):
    return arcs[i] if i >= 0 else arcs[~i][::-1]


def ring(idx):
    pts = []
    for i in idx:
        a = arc(i)
        pts.extend(a if not pts else a[1:])
    return pts


def simplify(pts, eps):
    # Radial distance simplification: cheap and keeps small islands recognisable.
    if len(pts) < 8:
        return pts
    o = [pts[0]]
    for p in pts[1:]:
        if abs(p[0] - o[-1][0]) + abs(p[1] - o[-1][1]) >= eps:
            o.append(p)
    return o if len(o) >= 4 else pts


res = []
for g in topo["objects"]["countries"]["geometries"]:
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]] if g["type"] == "Polygon" else []
    rings = []
    for poly in polys:
        for r in poly[:1]:  # outer rings only
            pts = ring(r)
            if any(lon0 <= x <= lon1 and lat0 <= y <= lat1 for x, y in pts):
                rings.append([[round(x, 3), round(y, 3)] for x, y in simplify(pts, tol)])
    if rings:
        res.append({"name": g["properties"]["name"], "rings": rings})
Path(out).write_text("export const GEO = " + json.dumps(res, separators=(",", ":")) + ";\n", encoding="utf8")
print(out, len(res), "countries", sum(len(r) for c in res for r in c["rings"]), "points:", ", ".join(c["name"] for c in res))
