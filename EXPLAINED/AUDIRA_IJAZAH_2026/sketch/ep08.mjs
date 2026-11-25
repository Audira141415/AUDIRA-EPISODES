// EP08: the civil and other cases about the diploma, on a map, kept apart from the criminal trial. Run from EP08 folder: node ../sketch/ep08.mjs
import { buildFilm, court } from "./lib.mjs";
import { calendar, stamp, building, ballot, big, g, line, rect, text, doc, shape, circleP, ALL_COURT } from "./kit.mjs";

const SEA = "#0E5A6E";
const pin = (x, y, lab, sub) => shape([[x, y], [x - 40, y - 80], [x - 30, y - 120], [x, y - 140], [x + 30, y - 120], [x + 40, y - 80]], { wash: "#B3261E", op: .95, w: 3 }) + text(x, y + 70, lab, 56, { font: "Bitter", weight: 800 }) + text(x, y + 120, sub, 34, { weight: 500 });
const bar = (x, y, w, lab, c) => rect(x, y, w, 90, { wash: c, op: .85, w: 3 }) + text(x + 24, y + 60, lab, 44, { anchor: "start", fill: "#FBF6E8" });
buildFilm({
  title: "Tiga Perkara", accent: SEA, quoteFont: '"Bitter",serif', quoteWeight: 800, quoteSize: 60, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; PERKARA LAIN",
  make: ({ OUT }) => {
    let w = court({ wash: "#A9BFC2" });
    // A: Java map
    w += g("map", shape([[140, 2560], [420, 2440], [760, 2470], [1100, 2520], [1460, 2560], [1800, 2600], [2040, 2700], [2000, 2820], [1700, 2860], [1300, 2820], [900, 2780], [500, 2740], [200, 2700]], { wash: "#C9D3A6", op: .85, hatch: true, gap: 26, w: 4 }) + text(1080, 2300, "PULAU JAWA (SKETSA)", 48, { weight: 500 }));
    w += g("pJ", pin(430, 2620, "JAKARTA", "pidana Jaktim, perdata Jakpus")) + g("pS", pin(1520, 2700, "SOLO", "PN Surakarta"));
    // B: PN Surakarta
    w += g("sk", building(200, 3640, 620, 420, "PN SURAKARTA", "gugatan Sigit Pratomo") + calendar(1060, 3560, "29", "OKTOBER", "putusan", SEA) + text(1640, 3700, "turut tergugat:", 40, { weight: 500 }) + text(1640, 3780, "UGM", 52) + text(1640, 3850, "Polda Metro Jaya", 44));
    w += g("skS", stamp(1210, 4180, "DITOLAK", "#B3261E", -8, 90));
    w += g("cl", rect(240, 4760, 1680, 760, { wash: "#FBF6E8", op: 1, w: 5 }) + text(1080, 4870, "DALIL PENGGUGAT", 54, { font: "Bitter", weight: 800 }) + line([[340, 4910], [1820, 4910]], 3)
      + text(320, 5020, "1. tak tunjukkan ijazah ke publik", 50, { anchor: "start", weight: 500 }) + text(320, 5110, "2. tak tunjukkan di sidang", 50, { anchor: "start", weight: 500 }) + text(320, 5200, "3. langgar AD/ART Kagama", 50, { anchor: "start", weight: 500 }));
    w += g("clS", stamp(1300, 5390, "DITOLAK SELURUHNYA", "#B3261E", -5, 62));
    // C: Gus Nur
    w += g("gn", doc(260, 5700, 460, 620, "GANTI RUGI", { seal: false }) + big(490, 6080, "Rp 4,2 M", 86, { fill: SEA }) + text(1300, 5820, "PN SOLO, AKHIR SEPTEMBER", 50) + text(1300, 5900, "permohonan Gus Nur", 44, { weight: 500 }) + stamp(1300, 6120, "DITOLAK", "#B3261E", -6, 80));
    w += g("gb", text(240, 6480, "VONIS GUS NUR, KASUS TUDUHAN IJAZAH PALSU", 42, { anchor: "start" }) + bar(240, 6540, 1500, "6 tahun", "#5A3B24") + bar(240, 6660, 1000, "4 tahun, banding", "#7A5A3A") + bar(240, 6780, 600, "amnesti, Agt 2025", SEA));
    // D: PN Jakarta Pusat
    w += g("jp", building(200, 7120, 560, 380, "PN JAKARTA PUSAT", "Bonatua & Moeryono") + text(1420, 7120, "MENGGUGAT", 46, { weight: 500 }) + text(1420, 7210, "KPU", 64, { font: "Bitter", weight: 800 }) + text(1420, 7290, "BAWASLU", 64, { font: "Bitter", weight: 800 }) + text(1420, 7370, "pejabat UGM", 52));
    w += g("bl", [["2005", "pilwalkot"], ["2019", "pilpres"]].map(([y, l], i) => ballot(1140 + i * 340, 7520, y, l)).join("") + text(1480, 7860, "legalisir ijazah", 44));
    w += g("kip", doc(220, 8060, 560, 700, "SALINAN IJAZAH", { seal: false }) + stamp(500, 8460, "INFORMASI TERBUKA", SEA, -8, 40) + text(500, 8850, "KIP, Februari 2026", 40));
    w += g("c11", calendar(1150, 8160, "11", "NOVEMBER", "putusan sela", "#B3261E") + text(1600, 8560, "perkara Bonatua", 44));
    // E: two tracks
    w += g("tr", rect(160, 2150, 880, 960, { wash: "#D8E4E6", op: 1, w: 5 }) + rect(1120, 2150, 880, 960, { wash: "#EAD9C6", op: 1, w: 5 }) + big(600, 2300, "PERDATA", 92, { fill: SEA }) + big(1560, 2300, "PIDANA", 92, { fill: "#8A3B12" })
      + text(600, 2480, "melawan hukum?", 50) + text(600, 2560, "ganti rugi?", 50) + text(600, 2780, "Surakarta, Solo,", 42, { weight: 500 }) + text(600, 2840, "Jakarta Pusat", 42, { weight: 500 })
      + text(1560, 2480, "dakwaan fitnah", 50) + text(1560, 2560, "& UU ITE", 50) + text(1560, 2780, "Roy Suryo, Tifa", 42, { weight: 500 }) + text(1560, 2840, "PN Jakarta Timur", 42, { weight: 500 }));
    w += g("sal", doc(560, 4740, 1040, 800, "SALINAN PUTUSAN", { seal: false }) + stamp(1080, 5260, "BELUM KAMI BACA", "#B3261E", -6, 64));
    return {
      world: w, people: ALL_COURT,
      shots: [
        [0, 1080, 1000, .53], ["s1:Ada", 1080, 2650, .5],
        ["s2:Di", 1080, 3900, .56], ["s2:UGM", 1300, 3900, .66],
        ["s3:Penggugat", 1080, 5050, .6], ["s3:Majelis", 1080, 5200, .62],
        ["s4:Akhir", 1080, 6000, .6], ["s4b:Gus", 1000, 6650, .6],
        ["s5:Di", 1080, 7350, .6], ["s5:Yang", 1480, 7660, .82],
        ["s6:Latarnya", 520, 8420, .85], ["s7:Putusan", 1350, 8380, .9],
        ["s7b:Perlu", 1080, 2620, .58], ["s8:Menolak", 1080, 5100, .66], [OUT, 1080, 5150, .64],
      ],
      reveals: [
        { id: "map", at: "s1:Ada", until: "s2:Di", fx: "fade" }, { id: "pJ", at: "s1:perkara", until: "s2:Di", x: 430, y: 2620 }, { id: "pS", at: "s1:pengadilan", until: "s2:Di", x: 1520, y: 2700 },
        { id: "sk", at: "s2:Di", until: "s3:Penggugat", fx: "fade" }, { id: "skS", at: "s2:menolak", until: "s3:Penggugat", x: 1210, y: 4180 },
        { id: "cl", at: "s3:Penggugat", until: "s4:Akhir", fx: "fade" }, { id: "clS", at: "s3:Majelis", until: "s4:Akhir", x: 1300, y: 5390 },
        { id: "gn", at: "s4:Akhir", until: "s5:Di", fx: "fade" }, { id: "gb", at: "s4b:Gus", until: "s5:Di", fx: "rise", y: 160 },
        { id: "jp", at: "s5:Di", until: "s7b:Perlu", fx: "fade" }, { id: "bl", at: "s5:Yang", until: "s7b:Perlu", x: 1480, y: 7700 },
        { id: "kip", at: "s6:Latarnya", until: "s7b:Perlu", x: 500, y: 8400 }, { id: "c11", at: "s7:Putusan", until: "s7b:Perlu", x: 1300, y: 8330 },
        { id: "tr", at: "s7b:Perlu", until: "s8:Menolak", fx: "fade" }, { id: "sal", at: "s8:Menolak", until: OUT, fx: "fade" },
      ],
      speak: [], poses: [],
      cards: [
        { at: 0, until: "s1:Ada", cls: "head", who: "KASUS IJAZAH JOKOWI", text: "Bukan cuma sidang pidana" },
        { at: "s2:UGM", until: "s3:Penggugat", who: "PN SURAKARTA, 29 OKT", text: "Gugatan Sigit Pratomo ditolak" },
        { at: "s4:Kuasa", until: "s4b:Gus", who: "KUASA HUKUM GUS NUR", text: "Hakim salah menerapkan hukum" },
        { at: "s5:Di", until: "s5:Yang", who: "PN JAKARTA PUSAT", text: "Gugatan Bonatua soal legalisir" },
        { at: "s6:Bonatua", until: "s7:Putusan", who: "SETELAH PUTUSAN KIP", text: "Bonatua mendapat salinan ijazah" },
        { at: "s7:Putusan", until: "s7b:Perlu", who: "JADWAL", text: "Putusan sela Bonatua, 11 November" },
        { at: "s7b:Dua", until: "s8:Menolak", cls: "head", who: "PERLU DIBEDAKAN", text: "Dua jalur berbeda" },
        { at: "s8:Menolak", until: "s8:Alasan", who: "MENOLAK GUGATAN", text: "Dalil penggugat ditolak" }, { at: "s8:baca", until: OUT, cls: "big", who: "SIDANG PIDANA, 6 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
