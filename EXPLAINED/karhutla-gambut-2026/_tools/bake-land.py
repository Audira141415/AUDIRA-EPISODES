"""Decodes Natural Earth 50m TopoJSON (world-atlas@2.0.2) into lon/lat rings for the Indonesia map. Usage: python bake-land.py <out.json>"""
import json, sys

T = json.load(open("F:/AUDIRA-VIDEO-MOTION/EXPLAINED/karhutla-gambut-2026/_research/geo/countries-50m.json", encoding="utf8"))
sx, sy = T["transform"]["scale"]
tx, ty = T["transform"]["translate"]
arcs = []
for a in T["arcs"]:
    x = y = 0
    pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring(idx):
    out = []
    for i in idx:
        p = arcs[i] if i >= 0 else arcs[~i][::-1]
        out += p[1:] if out else p
    return out


BOX = (84, 152, -36, 32)
res = {"id": [], "other": []}
for g in T["objects"]["countries"]["geometries"]:
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    for poly in polys:
        r = ring(poly[0])
        lo = [p[0] for p in r]; la = [p[1] for p in r]
        if max(lo) < BOX[0] or min(lo) > BOX[1] or max(la) < BOX[2] or min(la) > BOX[3]:
            continue
        key = "id" if g.get("properties", {}).get("name") == "Indonesia" else "other"
        res[key].append([[round(a, 3), round(b, 3)] for a, b in r])
open(sys.argv[1], "w").write("export default " + json.dumps(res, separators=(",", ":")) + ";\n")
print("indonesia rings", len(res["id"]), "other rings", len(res["other"]))
