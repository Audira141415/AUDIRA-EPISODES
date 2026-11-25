// EP02: who holds which document, what the witness said, what the defendant disputes. Run from EP02 folder: node ../sketch/ep02.mjs
import { buildFilm, court, doc, g, line, mark, circleP, rect, shape, text, COURT as C, INK } from "./lib.mjs";

const school = (x, y, w, h, wash, name, sub) => {
  let o = rect(x, y, w, h, { wash, op: .6, w: 3.4, hatch: true, gap: 26, ang: 1.5 });
  o += shape([[x - 30, y], [x + w / 2, y - h * .42], [x + w + 30, y]], { wash: "#9C5B3A", op: .75, hatch: true, gap: 14, w: 3.4 });
  o += rect(x + w / 2 - 38, y + h - 110, 76, 110, { wash: "#5A3B24", op: .85, w: 3 });
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) o += rect(x + w / 2 + s * (85 + i * 75) - 24, y + 40, 48, 60, { wash: "#E7DCC4", op: 1, w: 2.4 });
  o += text(x + w / 2, y + h + 66, name, 46) + text(x + w / 2, y + h + 110, sub, 30, { weight: 500 });
  return o;
};
const tree = (x, y, s) => line([[x, y], [x, y - 200 * s]], 12 * s, "#4B3423") + shape(circleP(x, y - 290 * s, 120 * s, 130 * s).slice(0, 25), { wash: "#5E7A4A", op: .75, hatch: true, gap: 14 });
const calendar = (x, y, day, mon, lab) => rect(x, y, 300, 330, { wash: "#FBF6E8", op: 1, w: 3.4 }) + rect(x, y, 300, 76, { wash: "#9C3B24", op: .9, w: 3 }) + text(x + 150, y + 54, mon, 40, { fill: "#FBF6E8" }) + text(x + 150, y + 210, day, 130, { font: "Playfair Display", weight: 800 }) + text(x + 150, y + 298, lab, 32);
const ballot = (x, y, yr, lab) => rect(x, y, 200, 180, { wash: "#C7A77A", op: .7, w: 3.4, hatch: true, gap: 22 }) + rect(x + 40, y - 8, 120, 16, { wash: INK, op: 1, w: 2 }) + shape([[x + 60, y - 8], [x + 140, y - 8], [x + 130, y - 70], [x + 70, y - 70]], { wash: "#F7F1E2", op: 1, w: 2.4 }) + text(x + 100, y + 112, yr, 58, { font: "Playfair Display", weight: 800 }) + text(x + 100, y + 232, lab, 30);

buildFilm({
  title: "Fakta Ruang Sidang", accent: "#B3261E", quoteFont: '"Playfair Display",serif', chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; FAKTA RUANG SIDANG",
  make: ({ K, OUT }) => {
    const poses = { jokowi: { up: [[-190, -430], [190, -430]], map: [[-60, -60], [60, -60]] } };
    let w = court({ poses });
    // the four documents he lifts
    const held = ["SD", "SMP", "SMA", "S1"].map((t, i) => doc(690 + i * 200, 810, 180, 250, t, { tag: i === 0 })).join("");
    w += g("held", held);
    // SMA and S1 sit with prosecutors
    w += g("evid", rect(200, 1040, 500, 170, { wash: "#8A6A44", op: .85, w: 3.6, hatch: true, gap: 18 }) + doc(240, 800, 190, 260, "SMA", { tag: false }) + doc(460, 800, 190, 260, "S1", { tag: false }) + text(450, 1140, "BARANG BUKTI", 44, { fill: "#FBF6E8" }));
    w += g("mapk", rect(820, 1280, 520, 170, { wash: "#7A4E2A", op: .92, w: 3.6 }) + doc(860, 1040, 190, 260, "SD", { tag: false }) + doc(1090, 1040, 190, 260, "SMP", { tag: false }) + text(1080, 1385, "MAP BATIK", 44, { fill: "#FBF6E8" }));
    // road of schools
    w += g("road", line([[100, 3080], [2100, 3080]], 6) + text(1080, 2380, "SURAKARTA", 60, { font: "Playfair Display" }));
    w += g("s1", school(120, 2720, 520, 360, "#D9C39A", "SD NEGERI 111", "Surakarta"));
    w += g("s2", school(830, 2640, 560, 440, "#CDB78F", "SMP NEGERI 1", "Surakarta"));
    w += g("s3", school(1540, 2580, 520, 500, "#C0A97F", "SMA NEGERI 6", "Surakarta"));
    w += g("ugm", tree(280, 3820, 1.1) + tree(620, 3840, 1.25) + tree(1560, 3840, 1.25) + tree(1880, 3820, 1.1) + rect(800, 3440, 560, 400, { wash: "#B79F76", op: .6, w: 3.6, hatch: true, gap: 26, ang: 1.5 }) + shape([[770, 3440], [1080, 3240], [1390, 3440]], { wash: "#7A4E2A", op: .8, hatch: true, gap: 14 }) + text(1080, 3920, "FAKULTAS KEHUTANAN UGM", 54) + text(1080, 3980, "mulai 1980", 42, { weight: 500 }));
    // three dates
    w += g("yr", text(1080, 4300, "1985", 150, { font: "Playfair Display", weight: 800 }));
    w += g("d1", calendar(210, 4400, "23", "OKTOBER", "ujian skripsi")) + g("d2", calendar(930, 4400, "5", "NOVEMBER", "ijazah terbit")) + g("d3", calendar(1650, 4400, "19", "NOVEMBER", "wisuda"));
    // thesis titles, then KPU
    w += g("t1", doc(420, 5060, 400, 540, "JUDUL 1", { tag: false, seal: false })) + g("t2", doc(880, 5060, 400, 540, "JUDUL 2", { tag: false, seal: false })) + g("t3", doc(1340, 5060, 400, 540, "JUDUL 3", { tag: false, seal: false }));
    w += g("kpu", text(830, 5800, "Ditunjukkan ke KPU", 84, { font: "Playfair Display", weight: 800 }));
    [["2005", "Solo"], ["2010", "Solo"], ["2012", "Jakarta"], ["2014", "Pilpres"], ["2019", "Pilpres"]].forEach(([y, l], i) => { const c = i < 3 ? [290 + i * 290, 5950] : [435 + (i - 3) * 290, 6300]; w += g(`b${i}`, ballot(c[0] + 150, c[1], y, l)); });
    // disputed details on an abstract sheet
    w += `<g id="dd">` + rect(620, 6880, 920, 1270, { wash: "#F7F1E2", op: 1, w: 4 }) + text(1080, 7020, "ILUSTRASI", 66, { fill: "#9C3B24" }) + rect(720, 7100, 220, 280, { wash: "#D9CDB2", op: 1, w: 3 }) + text(830, 7250, "FOTO", 46);
    for (let i = 0; i < 6; i++) w += line([[1000, 7140 + i * 44], [1460 - (i % 2) * 90, 7140 + i * 44]], 3, "#7B7263");
    w += text(1080, 7630, "WATERMARK", 92, { op: .22 });
    for (let i = 0; i < 18; i++) w += line([[640 + i * 50, 8150 - (i % 2) * 22], [690 + i * 50, 8150 - ((i + 1) % 2) * 22]], 3);
    w += mark("m1", circleP(1080, 8090, 400, 75)) + mark("m2", circleP(1080, 7600, 340, 90)) + mark("m3", circleP(830, 7240, 165, 190)) + `</g>`;
    // two reports on whether permission was given
    w += g("n1", rect(580, 8320, 1000, 330, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1080, 8400, "KUBU ROY", 62, { font: "Playfair Display", weight: 800 }) + text(1080, 8510, "Refly: tanpa izin", 62) + text(1080, 8595, "hakim", 62) + line([[640, 8425], [1520, 8425]], 3));
    w += g("n2", rect(580, 8700, 1000, 330, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1080, 8780, "BBC, KOMPAS", 62, { font: "Playfair Display", weight: 800 }) + text(1080, 8890, "Menulis hakim", 62) + text(1080, 8975, "mengizinkan", 62) + line([[640, 8805], [1520, 8805]], 3));
    // verdict field on the bench

    return {
      world: w,
      people: ["jokowi", "hakim", "h2", "h3", "jaksa", "jaksa2", "refly", "roy"],
      shots: [
        [0, 1080, 1080, 0.52], ["s1:Kamis", ...C.jokowi.map((v, i) => (i ? v - 260 : v)), 1.0], ["s1:mengangkat", 1080, 1040, 1.02],
        ["s1:Hakim", C.hakim[0], C.hakim[1] - 120, 1.62], ["s1:Jokowi#2", C.jokowi[0], C.jokowi[1] - 300, 1.5],
        ["s2:ijazah", 450, 900, 1.45], ["s2:SD", 1080, 1120, 1.45],
        ["s3:SD", 380, 2780, 1.3], ["s3:SMP", 1110, 2760, 1.3], ["s3:SMA", 1800, 2740, 1.3], ["s3:Fakultas", 1080, 3560, .76],
        ["s4:Lalu", 1080, 4480, .48], ["s4:Ujian", 360, 4520, 1.25], ["s4:Ijazah", 1080, 4520, 1.25], ["s4:Wisuda", 1800, 4520, 1.25],
        ["s5:Judul", 1080, 5240, .92], ["s5:ditunjukkan", 830, 6100, 1.02],
        ["s6:Roy", C.roy[0] - 100, C.roy[1] - 180, 1.5], ["s6:bawah", 1080, 7900, .92], ["s6:watermark", 1080, 7560, .92], ["s6:fotonya", 1000, 7300, 1],
        ["s7:Refly", C.refly[0], C.refly[1] - 180, 1.5], ["s7:Sejumlah", 1080, 8680, .98],
        ["s8:Yang", C.roy[0] - 100, C.roy[1] - 180, 1.5], ["s8:Menunjukkan", 1080, 1040, .62], ["s8:Hakim", 1080, 1000, .54], [OUT, 1080, 1000, .54],
      ],
      reveals: [
        { id: "held", at: "s1:mengangkat", until: "s1:Hakim", fx: "rise", y: 280 },
        { id: "evid", at: "s2:ijazah", until: "s3:Di", fx: "pop", x: 450, y: 1000 }, { id: "mapk", at: "s2:SD", until: "s3:Di", fx: "pop", x: 1080, y: 1250 },
        { id: "road", at: "s3:Di", until: "s4:Lalu", fx: "fade" }, { id: "s1", at: "s3:SD", until: "s4:Lalu", x: 380, y: 3080 }, { id: "s2", at: "s3:SMP", until: "s4:Lalu", x: 1110, y: 3080 }, { id: "s3", at: "s3:SMA", until: "s4:Lalu", x: 1800, y: 3080 }, { id: "ugm", at: "s3:Fakultas", until: "s4:Lalu", x: 1080, y: 3840 },
        { id: "yr", at: "s4:Lalu", until: "s5:Judul", fx: "fade" }, { id: "d1", at: "s4:Ujian", until: "s5:Judul", x: 360, y: 4560 }, { id: "d2", at: "s4:Ijazah", until: "s5:Judul", x: 1080, y: 4560 }, { id: "d3", at: "s4:Wisuda", until: "s5:Judul", x: 1800, y: 4560 },
        { id: "kpu", at: "s5:ditunjukkan", until: "s6:Kubu", fx: "fade" }, { id: "t1", at: "s5:tiga", until: "s5:ditunjukkan", x: 620, y: 5330 }, { id: "t2", at: "s5:tiga", until: "s5:ditunjukkan", x: 1080, y: 5330 }, { id: "t3", at: "s5:tiga", until: "s5:ditunjukkan", x: 1540, y: 5330 },
        ...[0, 1, 2].map((i) => ({ id: `b${i}`, at: "s5:2005", until: "s6:Kubu", x: 540 + i * 290, y: 6040 })), { id: "b3", at: "s5:2005", until: "s6:Kubu", x: 685, y: 6390 }, { id: "b4", at: "s5:2019", until: "s6:Kubu", x: 975, y: 6390 },
        { id: "dd", at: "s6:beda", until: "s7:Refly", fx: "fade" }, { id: "m1", at: "s6:bawah", fx: "draw" }, { id: "m2", at: "s6:watermark", fx: "draw" }, { id: "m3", at: "s6:fotonya", fx: "draw" },
        { id: "n1", at: "s7:Sejumlah", until: "s8:Yang", x: 1080, y: 8480 }, { id: "n2", at: "s7:mengizinkan", until: "s8:Yang", x: 1080, y: 8860 },
        
      ],
      speak: [["hakim", "s1:Hakim", "s1:Jokowi#2"], ["jokowi", "s1:Jokowi#2", "s2:Detail"], ["jokowi", "s3:Di", "s3:SD"], ["roy", "s6:Roy", "s6:bawah"], ["refly", "s7:Refly", "s7:Sejumlah"], ["roy", "s8:Yang", "s8:Menunjukkan"]],
      poses: [["jokowi", "up", "s1:mengangkat", "s1:Hakim"]],
      cards: [
        { at: 0, until: "s1:Kamis", cls: "head", who: "SIDANG 5 NOV 2026", text: "Jokowi akhirnya tunjukkan ijazah SD hingga S1" },
        { at: "s1:Hakim", until: "s1:Jokowi#2", who: "HAKIM KETUA", text: "&ldquo;Mungkin bisa setelah persidangan.&rdquo;" },
        { at: "s1:Jokowi#2", until: "s2:Detail", who: "JOKOWI", text: "&ldquo;Mohon, Yang Mulia.&rdquo;" },
        { at: "s2:ijazah", until: "s2:SD", who: "DI TANGAN JAKSA", text: "Ijazah SMA dan S1" },
        { at: "s2:SD", until: "s3:Di", who: "DIBAWA JOKOWI", text: "Ijazah SD dan SMP" },
        { at: "s3:Di", until: "s3:SD", who: "JOKOWI, DI BAWAH SUMPAH", text: "Riwayat sekolah menurut keterangannya" },
        { at: "s5:Judul", until: "s5:ditunjukkan", who: "KATA JOKOWI", text: "Judul skripsi diajukan tiga kali" },
        { at: "s6:Roy", until: "s6:bawah", who: "ROY SURYO, TERDAKWA", text: "Beda dengan yang saya lihat 15 Desember" },
        { at: "s6:bawah", until: "s7:Refly", who: "YANG DIPERSOALKAN ROY", text: "Bagian bawah, watermark, foto" },
        { at: "s7:Refly", until: "s7:Sejumlah", who: "REFLY HARUN", text: "&ldquo;Tidak ada izin hakim.&rdquo;" },
        { at: "s8:Yang", until: "s8:Menunjukkan", who: "ROY SURYO", text: "Menolak keterangan Jokowi. Hakim mencatat." },
        { at: "s8:Hakim", until: OUT, cls: "big", who: "STATUS 5 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
