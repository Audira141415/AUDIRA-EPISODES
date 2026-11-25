"""Converts the cached Cinzel variable font (Google Fonts, OFL) into three.js typeface modules for the carved 3D words.
Run once from the episode folder: python fonts/make-font.py  ->  fonts/cinzel-600.js, fonts/cinzel-900.js
Each module exports the typeface JSON that three's Font class reads (outline commands m/l/q/b, y up, units per em)."""
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen

SRC = "fonts/cinzel-var.woff2"
CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,-'·:?!"


class TypefacePen(BasePen):
    def __init__(self, gs):
        super().__init__(gs)
        self.o = []

    def _moveTo(self, p):
        self.o += ["m", round(p[0]), round(p[1])]

    def _lineTo(self, p):
        self.o += ["l", round(p[0]), round(p[1])]

    def _qCurveToOne(self, c, p):
        self.o += ["q", round(p[0]), round(p[1]), round(c[0]), round(c[1])]

    def _curveToOne(self, c1, c2, p):
        self.o += ["b", round(p[0]), round(p[1]), round(c1[0]), round(c1[1]), round(c2[0]), round(c2[1])]

    def _closePath(self):
        pass


for w in (600, 900):
    f = instantiateVariableFont(TTFont(SRC), {"wght": w})
    cmap, gs, hmtx = f.getBestCmap(), f.getGlyphSet(), f["hmtx"]
    glyphs = {}
    for ch in CHARS:
        name = cmap.get(ord(ch))
        if not name:
            continue
        pen = TypefacePen(gs)
        gs[name].draw(pen)
        glyphs[ch] = {"ha": hmtx[name][0], "x_min": 0, "x_max": hmtx[name][0], "o": " ".join(str(v) for v in pen.o)}
    hh = f["hhea"]
    data = {"glyphs": glyphs, "familyName": f"Cinzel {w}", "ascender": hh.ascent, "descender": hh.descent,
            "underlinePosition": -100, "underlineThickness": 50, "resolution": f["head"].unitsPerEm,
            "boundingBox": {"xMin": f["head"].xMin, "yMin": f["head"].yMin, "xMax": f["head"].xMax, "yMax": f["head"].yMax},
            "original_font_information": {"license": "SIL Open Font License 1.1 (Cinzel, Natanael Gama)"}}
    open(f"fonts/cinzel-{w}.js", "w", encoding="utf8").write("export default " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(w, len(glyphs), "glyphs", sorted(glyphs))
