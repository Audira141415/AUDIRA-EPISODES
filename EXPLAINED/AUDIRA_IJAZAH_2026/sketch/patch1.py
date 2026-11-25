"""Look-dev fixes after the first EP02 sheet. Run from AUDIRA_IJAZAH_2026/sketch."""
from pathlib import Path


def patch(name, pairs):
    f = Path(name)
    s = f.read_text(encoding="utf8")
    for a, b in pairs:
        if a not in s:
            raise SystemExit(f"{name} MISSING: {a[:80]}")
        s = s.replace(a, b)
    f.write_text(s, encoding="utf8")


patch("lib.mjs", [
    # shade stays on the cheek edge, away from the eyes
    ("o += `<clipPath id=\"${cl}\"><ellipse cx=\"0\" cy=\"-305\" rx=\"70\" ry=\"88\"/></clipPath><path clip-path=\"url(#${cl})\" d=\"${hatchLines(28, -370, 80, -230, 1.1, 11)}\" stroke=\"${INK}\" stroke-width=\"1.6\" opacity=\".5\"/>`;",
     "o += `<clipPath id=\"${cl}\"><path d=\"M46 -385 L82 -385 L82 -225 L46 -225 Z\"/></clipPath><g clip-path=\"url(#${cl})\"><path d=\"${hatchLines(40, -385, 82, -225, 1.1, 10)}\" stroke=\"${INK}\" stroke-width=\"1.6\" opacity=\".45\"/></g>`;"),
    ("refly: [1550, 1110]", "refly: [1490, 1090]"),
    ('person({ id: "refly", x: 1530, y: 1090,', 'person({ id: "refly", x: 1490, y: 1090,'),
    ("rect(1380, 1200, 660, 170,", "rect(1280, 1200, 800, 170,"),
    ('nameTag(1530, 1240, "REFLY HARUN", "kuasa hukum Roy") + nameTag(1880, 1240, "ROY SURYO", "terdakwa")', 'nameTag(1480, 1240, "REFLY HARUN", "kuasa hukum Roy") + nameTag(1880, 1240, "ROY SURYO", "terdakwa")'),
    # rotating clock hands and stamps
    ("const REV = data.reveals", "const ROT = (data.rot || []).map(([id, a, b, d0, d1, cx, cy]) => [id, A(a), A(b), d0, d1, cx, cy]);\n  const REV = data.reveals"),
    ("CARDS=${JSON.stringify(CARDS.map(({ i, a, b }) => ({ i, a, b })))},", "CARDS=${JSON.stringify(CARDS.map(({ i, a, b }) => ({ i, a, b })))},ROT=${JSON.stringify(ROT)},"),
    (" F.style.opacity=Math.max", " for(const[id,a,b,d0,d1,cx,cy]of ROT){const e=q(id);if(e){const u=Math.max(0,Math.min(1,(t-a)/(b-a)));e.setAttribute('transform','rotate('+(d0+(d1-d0)*u).toFixed(2)+' '+cx+' '+cy+')')}}\n F.style.opacity=Math.max"),
])
patch("ep02.mjs", [
    # first "Jokowi" in s1 is the lift; the plea is the second
    ('["s1:Hakim", C.hakim[0], C.hakim[1] - 120, 1.62], ["s1:Jokowi", C.jokowi[0], C.jokowi[1] - 300, 1.5],', '["s1:Hakim", C.hakim[0], C.hakim[1] - 120, 1.62], ["s1:Jokowi#2", C.jokowi[0], C.jokowi[1] - 300, 1.5],'),
    ('["hakim", "s1:Hakim", "s1:Jokowi"], ["jokowi", "s1:Jokowi", "s2:Detail"]', '["hakim", "s1:Hakim", "s1:Jokowi#2"], ["jokowi", "s1:Jokowi#2", "s2:Detail"]'),
    ('{ at: "s1:Hakim", until: "s1:Jokowi", who', '{ at: "s1:Hakim", until: "s1:Jokowi#2", who'),
    ('{ at: "s1:Jokowi", until: "s2:Detail", who', '{ at: "s1:Jokowi#2", until: "s2:Detail", who'),
    ('poses: [["jokowi", "up", "s1:mengangkat", "s2:Detail"]],', 'poses: [["jokowi", "up", "s1:mengangkat", "s1:Hakim"]],'),
    ('{ id: "held", at: "s1:mengangkat", until: "s2:Detail", fx: "rise", y: 280 },', '{ id: "held", at: "s1:mengangkat", until: "s1:Hakim", fx: "rise", y: 280 },'),
    # thesis and ballots fill the frame
    ('g("t1", doc(330, 5150, 280, 390, "JUDUL 1", { tag: false, seal: false })) + g("t2", doc(940, 5150, 280, 390, "JUDUL 2", { tag: false, seal: false })) + g("t3", doc(1550, 5150, 280, 390, "JUDUL 3", { tag: false, seal: false }))', 'g("t1", doc(420, 5060, 400, 540, "JUDUL 1", { tag: false, seal: false })) + g("t2", doc(880, 5060, 400, 540, "JUDUL 2", { tag: false, seal: false })) + g("t3", doc(1340, 5060, 400, 540, "JUDUL 3", { tag: false, seal: false }))'),
    ('{ id: "t1", at: "s5:tiga", x: 470, y: 5340 }, { id: "t2", at: "s5:tiga", x: 1080, y: 5340 }, { id: "t3", at: "s5:tiga", x: 1690, y: 5340 },', '{ id: "t1", at: "s5:tiga", x: 620, y: 5330 }, { id: "t2", at: "s5:tiga", x: 1080, y: 5330 }, { id: "t3", at: "s5:tiga", x: 1540, y: 5330 },'),
    ('w += text(1080, 5780, "Ditunjukkan ke KPU", 60, { font: "Playfair Display" });', 'w += text(1080, 5800, "Ditunjukkan ke KPU", 92, { font: "Playfair Display", weight: 800 });'),
    ('[["2005", "Solo"], ["2010", "Solo"], ["2012", "Jakarta"], ["2014", "Pilpres"], ["2019", "Pilpres"]].forEach(([y, l], i) => { w += g(`b${i}`, ballot(120 + i * 400, 5990, y, l)); });', '[["2005", "Solo"], ["2010", "Solo"], ["2012", "Jakarta"], ["2014", "Pilpres"], ["2019", "Pilpres"]].forEach(([y, l], i) => { const c = i < 3 ? [290 + i * 290, 5950] : [435 + (i - 3) * 290, 6300]; w += g(`b${i}`, ballot(c[0] + 150, c[1], y, l)); });'),
    ('...[0, 1, 2, 3].map((i) => ({ id: `b${i}`, at: "s5:2005", x: 220 + i * 400, y: 6100 })), { id: "b4", at: "s5:2019", x: 1820, y: 6100 },', '...[0, 1, 2].map((i) => ({ id: `b${i}`, at: "s5:2005", x: 540 + i * 290, y: 6040 })), { id: "b3", at: "s5:2005", x: 685, y: 6390 }, { id: "b4", at: "s5:2019", x: 975, y: 6390 },'),
    ('["s5:Judul", 1080, 5300, .5], ["s5:ditunjukkan", 1080, 6000, .5],', '["s5:Judul", 1080, 5240, .92], ["s5:ditunjukkan", 830, 6100, 1.02],'),
    # disputed sheet appears only for its scene
    ('w += rect(620, 6480, 920, 1270, { wash: "#F7F1E2", op: 1, w: 4 })', 'w += `<g id="dd">` + rect(620, 6880, 920, 1270, { wash: "#F7F1E2", op: 1, w: 4 })'),
    ('text(1080, 6620, "ILUSTRASI", 66, { fill: "#9C3B24" }) + rect(720, 6700, 220, 280, { wash: "#D9CDB2", op: 1, w: 3 }) + text(830, 6850, "FOTO", 46);', 'text(1080, 7020, "ILUSTRASI", 66, { fill: "#9C3B24" }) + rect(720, 7100, 220, 280, { wash: "#D9CDB2", op: 1, w: 3 }) + text(830, 7250, "FOTO", 46);'),
    ('line([[1000, 6740 + i * 44], [1460 - (i % 2) * 90, 6740 + i * 44]], 3, "#7B7263");', 'line([[1000, 7140 + i * 44], [1460 - (i % 2) * 90, 7140 + i * 44]], 3, "#7B7263");'),
    ('w += text(1080, 7230, "WATERMARK", 92, { op: .22 });', 'w += text(1080, 7630, "WATERMARK", 92, { op: .22 });'),
    ('line([[640 + i * 50, 7750 - (i % 2) * 22], [690 + i * 50, 7750 - ((i + 1) % 2) * 22]], 3);', 'line([[640 + i * 50, 8150 - (i % 2) * 22], [690 + i * 50, 8150 - ((i + 1) % 2) * 22]], 3);'),
    ('w += mark("c1", circleP(1080, 7690, 400, 75)) + mark("c2", circleP(1080, 7200, 340, 90)) + mark("c3", circleP(830, 6840, 165, 190));', 'w += mark("m1", circleP(1080, 8090, 400, 75)) + mark("m2", circleP(1080, 7600, 340, 90)) + mark("m3", circleP(830, 7240, 165, 190)) + `</g>`;'),
    ('{ id: "c1", at: "s6:bawah", fx: "draw" }, { id: "c2", at: "s6:watermark", fx: "draw" }, { id: "c3", at: "s6:fotonya", fx: "draw" },', '{ id: "dd", at: "s6:beda", until: "s7:Refly", fx: "fade" }, { id: "m1", at: "s6:bawah", fx: "draw" }, { id: "m2", at: "s6:watermark", fx: "draw" }, { id: "m3", at: "s6:fotonya", fx: "draw" },'),
    ('["s6:bawah", 1080, 7400, .92], ["s6:watermark", 1080, 7100, .92], ["s6:fotonya", 1000, 6880, 1],', '["s6:bawah", 1080, 7900, .92], ["s6:watermark", 1080, 7560, .92], ["s6:fotonya", 1000, 7300, 1],'),
    # the two reports stack and fill the frame
    ('g("n1", rect(170, 8120, 840, 480, { wash: "#FBF6E8", op: 1, w: 4 }) + text(590, 8220, "KUBU ROY", 62, { font: "Playfair Display", weight: 800 }) + text(590, 8360, "Refly: tanpa", 62) + text(590, 8450, "izin hakim", 62) + line([[230, 8250], [950, 8250]], 3))', 'g("n1", rect(580, 8320, 1000, 330, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1080, 8400, "KUBU ROY", 62, { font: "Playfair Display", weight: 800 }) + text(1080, 8510, "Refly: tanpa izin", 62) + text(1080, 8595, "hakim", 62) + line([[640, 8425], [1520, 8425]], 3))'),
    ('g("n2", rect(1150, 8120, 840, 480, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1570, 8220, "BBC, KOMPAS", 62, { font: "Playfair Display", weight: 800 }) + text(1570, 8360, "Menulis hakim", 62) + text(1570, 8450, "mengizinkan", 62) + line([[1210, 8250], [1930, 8250]], 3))', 'g("n2", rect(580, 8700, 1000, 330, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1080, 8780, "BBC, KOMPAS", 62, { font: "Playfair Display", weight: 800 }) + text(1080, 8890, "Menulis hakim", 62) + text(1080, 8975, "mengizinkan", 62) + line([[640, 8805], [1520, 8805]], 3))'),
    ('{ id: "n1", at: "s7:Sejumlah", x: 590, y: 8360 }, { id: "n2", at: "s7:mengizinkan", x: 1570, y: 8360 },', '{ id: "n1", at: "s7:Refly", x: 1080, y: 8480 }, { id: "n2", at: "s7:Sejumlah", x: 1080, y: 8860 },'),
    ('["s7:Sejumlah", 1080, 8320, .5],', '["s7:Sejumlah", 1080, 8680, .98],'),
    ('["s8:Hakim", 1080, 700, .9], [OUT, 1080, 700, .9],', '["s8:Hakim", 1080, 620, .95], [OUT, 1080, 620, .95],'),
])
print("patched")
