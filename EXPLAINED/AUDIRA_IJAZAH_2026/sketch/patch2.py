"""Second pass after the three-film sheet. Run from AUDIRA_IJAZAH_2026/sketch."""
from pathlib import Path


def patch(name, pairs):
    f = Path(name)
    s = f.read_text(encoding="utf8")
    for a, b in pairs:
        if a not in s and b in s:
            continue
        if a not in s:
            raise SystemExit(f"{name} MISSING: {a[:80]}")
        s = s.replace(a, b)
    f.write_text(s, encoding="utf8")


patch("lib.mjs", [
    # arm width follows the arm direction, so a level arm keeps its thickness
    ("const arm = (a, b, sleeve) => shape([[a[0] - 26, a[1]], [b[0] - 20, b[1]], [b[0] + 20, b[1]], [a[0] + 26, a[1]]],", "const arm = (a, b, sleeve) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; return shape([[a[0] + nx * 28, a[1] + ny * 28], [b[0] + nx * 22, b[1] + ny * 22], [b[0] - nx * 22, b[1] - ny * 22], [a[0] - nx * 28, a[1] - ny * 28]],"),
    ('gap: 10 }) + hand(b[0], b[1]);\n', 'gap: 10 }) + hand(b[0], b[1]); };\n'),
    # one id may have several visible windows
    (" for(const r of rev){if(!r.e)continue;const on=t>=r.a&&t<r.b;", " const act={};for(const r of rev)if(t>=r.a&&t<r.b)act[r.id]=r;\n for(const r of rev){if(!r.e)continue;if(act[r.id]&&act[r.id]!==r)continue;const on=t>=r.a&&t<r.b;"),
])
patch("ep02.mjs", [
    ('    w += g("vd", rect(640, 330, 880, 200, { wash: "#FBF6E8", op: 1, w: 6, ink: "#B3261E" }) + text(1080, 460, "BELUM ADA PUTUSAN", 76, { fill: "#B3261E", font: "Playfair Display", weight: 800 }));\n', ''),
    ('w += line([[100, 3080], [2100, 3080]], 6) + text(1080, 2380, "SURAKARTA", 60, { font: "Playfair Display" });', 'w += g("road", line([[100, 3080], [2100, 3080]], 6) + text(1080, 2380, "SURAKARTA", 60, { font: "Playfair Display" }));'),
    ('{ id: "s1", at: "s3:SD", x: 380, y: 3080 }, { id: "s2", at: "s3:SMP", x: 1110, y: 3080 }, { id: "s3", at: "s3:SMA", x: 1800, y: 3080 }, { id: "ugm", at: "s3:Fakultas", x: 1080, y: 3840 },', '{ id: "road", at: "s3:Di", until: "s4:Lalu", fx: "fade" }, { id: "s1", at: "s3:SD", until: "s4:Lalu", x: 380, y: 3080 }, { id: "s2", at: "s3:SMP", until: "s4:Lalu", x: 1110, y: 3080 }, { id: "s3", at: "s3:SMA", until: "s4:Lalu", x: 1800, y: 3080 }, { id: "ugm", at: "s3:Fakultas", until: "s4:Lalu", x: 1080, y: 3840 },'),
    ('w += text(1080, 4300, "1985", 150, { font: "Playfair Display", weight: 800 });', 'w += g("yr", text(1080, 4300, "1985", 150, { font: "Playfair Display", weight: 800 }));'),
    ('{ id: "d1", at: "s4:Ujian", x: 360, y: 4560 }, { id: "d2", at: "s4:Ijazah", x: 1080, y: 4560 }, { id: "d3", at: "s4:Wisuda", x: 1800, y: 4560 },', '{ id: "yr", at: "s4:Lalu", until: "s5:Judul", fx: "fade" }, { id: "d1", at: "s4:Ujian", until: "s5:Judul", x: 360, y: 4560 }, { id: "d2", at: "s4:Ijazah", until: "s5:Judul", x: 1080, y: 4560 }, { id: "d3", at: "s4:Wisuda", until: "s5:Judul", x: 1800, y: 4560 },'),
    ('w += text(1080, 5800, "Ditunjukkan ke KPU", 92, { font: "Playfair Display", weight: 800 });', 'w += g("kpu", text(830, 5800, "Ditunjukkan ke KPU", 84, { font: "Playfair Display", weight: 800 }));'),
    ('{ id: "t1", at: "s5:tiga", x: 620, y: 5330 }, { id: "t2", at: "s5:tiga", x: 1080, y: 5330 }, { id: "t3", at: "s5:tiga", x: 1540, y: 5330 },', '{ id: "kpu", at: "s5:ditunjukkan", until: "s6:Kubu", fx: "fade" }, { id: "t1", at: "s5:tiga", until: "s5:ditunjukkan", x: 620, y: 5330 }, { id: "t2", at: "s5:tiga", until: "s5:ditunjukkan", x: 1080, y: 5330 }, { id: "t3", at: "s5:tiga", until: "s5:ditunjukkan", x: 1540, y: 5330 },'),
    ('{ id: `b${i}`, at: "s5:2005", x: 540 + i * 290, y: 6040 })), { id: "b3", at: "s5:2005", x: 685, y: 6390 }, { id: "b4", at: "s5:2019", x: 975, y: 6390 },', '{ id: `b${i}`, at: "s5:2005", until: "s6:Kubu", x: 540 + i * 290, y: 6040 })), { id: "b3", at: "s5:2005", until: "s6:Kubu", x: 685, y: 6390 }, { id: "b4", at: "s5:2019", until: "s6:Kubu", x: 975, y: 6390 },'),
    ('{ id: "n1", at: "s7:Refly", x: 1080, y: 8480 }, { id: "n2", at: "s7:Sejumlah", x: 1080, y: 8860 },', '{ id: "n1", at: "s7:Sejumlah", until: "s8:Yang", x: 1080, y: 8480 }, { id: "n2", at: "s7:mengizinkan", until: "s8:Yang", x: 1080, y: 8860 },'),
    ('[1080, 620, .95], [OUT, 1080, 620, .95]', '[1080, 1000, .54], [OUT, 1080, 1000, .54]') if False else ('["s8:Hakim", 1080, 620, .95], [OUT, 1080, 620, .95],', '["s8:Hakim", 1080, 1000, .54], [OUT, 1080, 1000, .54],'),
])
patch("ep03.mjs", [
    ('w += text(1080, 2240, "YANG DITANYAKAN REFLY", 58);\n', ''),
    ('w += g("cmpA", doc(250, 2340, 620, 840, "IJAZAH FISIK") + text(560, 3270, "FISIK", 80));', 'w += g("cmpA", text(1080, 2240, "YANG DITANYAKAN REFLY", 58) + doc(250, 2340, 620, 840, "IJAZAH FISIK") + text(560, 3270, "FISIK", 80));'),
    ('["s2:ijazah", 1020, 2860, .72],', '["s2:ijazah", 1080, 2840, .6],'),
    ('{ id: "cmpA", at: "s2:ijazah", x: 560, y: 2800 }, { id: "cmpB", at: "s2:file", x: 1570, y: 2800 }, { id: "vs", at: "s2:dibandingkan", x: 1040, y: 2780 },', '{ id: "cmpA", at: "s2:ijazah", until: "s3:Alasan", x: 560, y: 2800 }, { id: "cmpB", at: "s2:file", until: "s3:Alasan", x: 1570, y: 2800 }, { id: "vs", at: "s2:dibandingkan", until: "s3:Alasan", x: 1040, y: 2780 },\n        { id: "lab", at: "s3:Labfor", until: "s3:Dan", fx: "fade" }, { id: "lab", at: "s6:Mei", until: "s6:Tapi", fx: "fade" }, { id: "ela", at: "s4:Error", until: "s4:Jokowi", fx: "fade" }, { id: "out", at: "s7:Usai", until: "s8:Perhatikan", fx: "fade" }, { id: "apa", at: "s8:Perhatikan", until: "s8:Dari", fx: "fade" },'),
    ('w += person({ id: "jok2", x: 1080, y: 5760, s: 1.2, robe: "batik", hair: "peci" });\n    w += rect(160, 5100, 1840, 330, { wash: "#C4CDD3", op: .55, w: 3, hatch: true, gap: 30, ang: 1.5 }) + text(1080, 5200, "DI LUAR RUANG SIDANG", 58);', 'w += `<g id="out">` + rect(160, 4900, 1840, 300, { wash: "#C4CDD3", op: .55, w: 3, hatch: true, gap: 30, ang: 1.5 }) + text(1080, 5120, "DI LUAR RUANG SIDANG", 58);\n    w += person({ id: "jok2", x: 1080, y: 5760, s: 1.2, robe: "batik", hair: "peci" });'),
    ('w += nameTag(1080, 5990, "JOKOWI", "usai sidang");', 'w += nameTag(1080, 5990, "JOKOWI", "usai sidang") + `</g>`;'),
    ('["s7:Usai", 1080, 5400, 1],', '["s7:Usai", 1080, 5440, .95],'),
    ('g("ord", rect(620, 280, 920, 260, { wash: "#FBF6E8", op: 1, w: 6 }) + text(1080, 360, "PERINTAH UJI ULANG", 58) + text(1080, 470, "BELUM ADA", 80, { fill: "#B3261E", font: "EB Garamond", weight: 800 }))', 'g("ord", rect(620, 920, 920, 260, { wash: "#FBF6E8", op: 1, w: 6 }) + text(1080, 1000, "PERINTAH UJI ULANG", 58) + text(1080, 1110, "BELUM ADA", 80, { fill: "#B3261E", font: "EB Garamond", weight: 800 }))'),
    ('{ id: "ord", at: "s8:Dari", x: 1080, y: 410 },', '{ id: "ord", at: "s8:Dari", until: "s8:Refly", x: 1080, y: 1050 }, { id: "ord", at: "s8:Jadi", x: 1080, y: 1050 },'),
    ('["s8:Dari", 1080, 560, 1.05]', '["s8:Dari", 1080, 720, 1.05]'),
    ('["s8:Jadi", 1080, 560, 1.05], [OUT, 1080, 560, 1.05]', '["s8:Jadi", 1080, 720, 1.05], [OUT, 1080, 720, 1.05]'),
    ('["s2:Refly", C.refly[0], C.refly[1] - 180, 1.6]', '["s2:Refly", C.refly[0], C.refly[1] - 250, 1.45]'),
    ('["s5:Refly", C.refly[0], C.refly[1] - 180, 1.6]', '["s5:Refly", C.refly[0], C.refly[1] - 250, 1.45]'),
    ('["s8:Refly", C.refly[0], C.refly[1] - 180, 1.6]', '["s8:Refly", C.refly[0], C.refly[1] - 250, 1.45]'),
])
patch("ep04.mjs", [
    ('w += text(1080, 2240, "DI LUAR PN JAKARTA TIMUR", 58);', 'w += `<g id="outS">` + text(1080, 2240, "DI LUAR PN JAKARTA TIMUR", 58);'),
    ('    // the clock of the day\n    w += shape(circleP(1080, 3560, 420)', '    w += `</g>`;\n    // the clock of the day\n    w += `<g id="clk">` + shape(circleP(1080, 3560, 420)'),
    ('w += text(1080, 4080, "09.00 sampai 16.30", 76, { font: "Oswald" });', 'w += text(1080, 4080, "09.00 sampai 16.30", 76, { font: "Oswald" }) + `</g>`;'),
    ('w += rect(200, 4300, 1760, 240,', 'w += `<g id="shk">` + rect(200, 4300, 1760, 240,'),
    ('w += nameTag(780, 5270, "JOKOWI", "saksi") + nameTag(1380, 5270, "ROY SURYO", "terdakwa");', 'w += nameTag(780, 5270, "JOKOWI", "saksi") + nameTag(1380, 5270, "ROY SURYO", "terdakwa") + `</g>`;'),
    ('{ id: "cross", at: "s6:telunjuk", until: "s6:Unsur", x: 985, y: 1000 },', '{ id: "cross", at: "s6:telunjuk", until: "s6:Unsur", x: 1146, y: 962 }, { id: "outS", at: "s7:Di", until: "s7:Sidang", fx: "fade" }, { id: "clk", at: "s7:Sidang", until: "s7:Di#2", fx: "fade" }, { id: "shk", at: "s8:Lalu", until: "s8:Hakim", fx: "fade" },'),
    ('g("cross", line([[870, 880], [1100, 1120]], 22, RED, 3) + line([[1100, 880], [870, 1120]], 22, RED, 3))', 'g("cross", line([[1050, 866], [1242, 1058]], 24, RED, 3) + line([[1242, 866], [1050, 1058]], 24, RED, 3))'),
    ('["s6:Hakim", 1100, 760, .78], ["s6:Unsur"', '["s6:Hakim", C.hakim[0], C.hakim[1] - 120, 1.6], ["s6:telunjuk", 1270, 930, 1.05], ["s6:Unsur"'),
    ('["refly", "point", "s6:Refly", "s6:telunjuk"]', '["refly", "point", "s6:Refly", "s6:Mau"]'),
    ('["s8:Lalu", 1080, 4780, .7], ["s8:Panasnya", 1080, 4860, .84],', '["s8:Lalu", 1080, 4720, .82], ["s8:Panasnya", 1080, 4780, .92],'),
    ('top: 600, who: "HAKIM KETUA", text: "&ldquo;Suara jangan ditinggikan.&rdquo;"', 'top: 730, who: "HAKIM KETUA", text: "&ldquo;Suara jangan ditinggikan.&rdquo;"'),
    ('who: "HAKIM KETUA", text: "Yang ditegur lebih dari satu pihak"', 'who: "DI RUANG SIDANG", text: "Yang ditegur lebih dari satu pihak"'),
    ('text: "&ldquo;Berbicara melalui Majelis Hakim.&rdquo;"', 'text: "Keberatan: bicara lewat Majelis Hakim"'),
])
print("patched")
