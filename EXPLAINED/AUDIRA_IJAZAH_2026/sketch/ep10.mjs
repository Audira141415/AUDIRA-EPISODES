// EP10: what the Supreme Court annulled (Gibran's SMA equivalence letter) and what can follow. Run from EP10 folder: node ../sketch/ep10.mjs
import { buildFilm } from "./lib.mjs";
import { stamp, wit2, bld2, node2, arrow, big, g, line, rect, text, doc, shape, circleP } from "./kit.mjs";

const PUR = "#5B2A86";
const row = (y, who, what) => text(340, y, who, 54, { anchor: "start", fill: PUR }) + text(340, y + 80, what, 56, { anchor: "start", font: "Oswald", weight: 500 });
buildFilm({
  title: "Surat yang Dibatalkan", accent: PUR, quoteFont: '"Oswald",sans-serif', quoteWeight: 700, quoteSize: 58, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; PUTUSAN MA", camY: 880, signature: "surat-yang-dibatalkan",
  make: ({ OUT }) => {
    let w = "";
    // A: the letter and the court
    w += g("sk", doc(560, 300, 760, 1000, "SURAT KETERANGAN") + text(940, 1400, "No. 9149/D.D1/KS/2019", 54) + text(940, 1470, "penyetaraan pendidikan, 6 Agustus 2019", 42, { weight: 600 }) + text(940, 1540, "arsip sketsa AUDIRA", 34, { fill: "#5B2A86" }));
    w += g("ma", bld2(1480, 520, 560, 340, "MAHKAMAH AGUNG", "putusan 742 K/TUN/2026", "#CBBBD8"));
    w += g("skS", stamp(940, 820, "BATAL DEMI HUKUM", "#B3261E", -9, 76));
    // B: what the letter says
    w += g("eq", node2(1080, 1800, 1300, 300, "UTS INSEARCH, SYDNEY", "Grade 12, tahun 2006") + big(1080, 2110, "=", 170, { fill: PUR }) + node2(1080, 2300, 1300, 300, "SETARA TAMAT SMK", "Akuntansi dan Keuangan", "#EFE6F5"));
    // C: who sued whom
    w += g("pt", wit2("subhan", 560, 3300, 1.0, "SUBHAN PALAL", "penggugat, advokat", { robe: "toga", hair: "neat" }) + text(1040, 3180, "VS", 100, { font: "Oswald", fill: PUR }) + bld2(1240, 3000, 760, 380, "KEMENDIKDASMEN", "tergugat, penerbit surat"));
    w += g("nb", stamp(760, 3870, "BUKAN GIBRAN", "#B3261E", -4, 62) + stamp(1540, 3870, "BUKAN KPU", "#B3261E", 4, 62));
    // D: three courts
    w += g("lad", node2(560, 4500, 840, 280, "PTUN JAKARTA", "tidak diterima") + node2(1600, 4500, 840, 280, "PT TUN", "banding: menguatkan") + arrow("la1", [[990, 4500], [1170, 4500]], "#7B7263", 8));
    w += g("kas", node2(1080, 4950, 1300, 300, "KASASI MA", "kabul gugatan seluruhnya", "#EFE6F5") + arrow("la2", [[1600, 4650], [1500, 4790]], PUR, 9));
    // E: the Constitutional Court
    w += g("mk", bld2(240, 5950, 800, 420, "MAHKAMAH KONSTITUSI", "6 Oktober 2026") + doc(1300, 5880, 520, 640, "IJAZAH LN?", { seal: false }) + shape(circleP(1700, 6380, 150).slice(0, 25), { wash: "#D8E4E6", op: .55, w: 9 }) + line([[1800, 6490], [1960, 6660]], 26));
    // F: experts split
    w += g("sp1", node2(1080, 7250, 1400, 300, "OTOMATIS GUGUR", "menurut sebagian pakar"));
    w += g("sp2", node2(1080, 7650, 1400, 300, "TIDAK OTOMATIS", "perkara TUN: yang dihukum penerbit surat", "#EFE6F5"));
    // G: the constitutional route
    w += g("path", node2(1080, 8350, 1200, 240, "DPR", "hak menyatakan pendapat") + node2(1080, 8700, 1200, 240, "MK", "memeriksa dan memutus") + node2(1080, 9050, 1200, 240, "MPR", "rapat paripurna memberhentikan") + arrow("pa1", [[1080, 8470], [1080, 8580]], PUR, 8) + arrow("pa2", [[1080, 8820], [1080, 8930]], PUR, 8));
    // H: status board
    w += g("st", rect(260, 9480, 1640, 960, { wash: "#FBF6E8", op: 1, w: 5 }) + text(1080, 9610, "SIKAP PER 8 NOVEMBER 2026", 58) + row(9760, "KPU", "tahapan Pemilu 2024 sudah selesai") + row(10020, "MENDIKDASMEN", "belum ada proses hukum lanjutan") + row(10280, "DPR", "tunggu salinan, masa sidang 10 Nov"));
    return {
      world: w, people: ["subhan"],
      shots: [
        [0, 940, 860, .62], ["s1:Mahkamah", 1180, 880, .58], ["s1:Tapi", 940, 860, .7],
        ["s2:Namanya", 940, 1000, .66], ["s2:Isinya", 1080, 2050, .72],
        ["s3:Penggugatnya", 560, 3260, .9], ["s3:Yang", 1150, 3300, .6], ["s3:Bukan", 1150, 3420, .6],
        ["s4:Di", 1080, 4520, .55], ["s4:Di#2", 1080, 4760, .6], ["s4:surat", 940, 880, .64],
        ["s5:Enam", 1080, 6240, .56],
        ["s6:Lalu", 1080, 7450, .7],
        ["s7:Undang-Undang", 1080, 8700, .7],
        ["s8:Sejauh", 1080, 9960, .62],
        ["s9:Satu", 940, 880, .62], [OUT, 1080, 900, .53],
      ],
      reveals: [
        { id: "sk", at: 0, until: "s2:Isinya", fx: "fade" }, { id: "ma", at: "s1:Mahkamah", until: "s2:Namanya", fx: "fade" },
        { id: "eq", at: "s2:Isinya", until: "s3:Penggugatnya", fx: "fade" },
        { id: "pt", at: "s3:Penggugatnya", until: "s4:Di", fx: "fade" }, { id: "nb", at: "s3:Bukan", until: "s4:Di", x: 1130, y: 3860 },
        { id: "lad", at: "s4:Di", until: "s4:surat", fx: "fade" }, { id: "kas", at: "s4:kasasi", until: "s4:surat", fx: "rise", y: 260 },
        { id: "sk", at: "s4:surat", until: "s5:Enam", fx: "fade" }, { id: "skS", at: "s4:batal", until: "s5:Enam", x: 940, y: 820 },
        { id: "mk", at: "s5:Enam", until: "s6:Lalu", fx: "fade" },
        { id: "sp1", at: "s6:Lalu", until: "s7:Undang-Undang", fx: "fade" }, { id: "sp2", at: "s6:Yang", until: "s7:Undang-Undang", fx: "rise", y: 200 },
        { id: "path", at: "s7:Undang-Undang", until: "s8:Sejauh", fx: "fade" },
        { id: "st", at: "s8:Sejauh", until: "s9:Satu", fx: "fade" },
        { id: "sk", at: "s9:Satu", until: 1e9, fx: "fade" }, { id: "skS", at: "s9:Satu", until: 1e9, x: 940, y: 820 },
      ],
      speak: [["subhan", "s3:Penggugatnya", "s3:Yang"]],
      poses: [],
      cards: [
        { at: 0, until: "s1:Tapi", cls: "head", who: "PUTUSAN MA, 30 OKT 2026", text: "Satu surat milik Wapres Gibran dibatalkan" },
        { at: "s2:Namanya", until: "s2:Isinya", who: "OBJEK PERKARA", text: "Surat keterangan penyetaraan, 6 Agustus 2019" },
        { at: "s3:Bukan", until: "s4:Di", who: "TERGUGAT", text: "Kemendikdasmen, bukan Gibran, bukan KPU" },
        { at: "s4:surat", until: "s5:Enam", who: "AMAR PUTUSAN MA", text: "Tidak sah, batal demi hukum, dimusnahkan" },
        { at: "s5:Enam", until: "s6:Lalu", who: "MK, 6 OKT 2026", text: "Tak menemukan bukti meyakinkan ijazah LN setara SMA" },
        { at: "s7:Undang-Undang", until: "s8:Sejauh", who: "PASAL 7A DAN 7B UUD 1945", text: "Pemberhentian: DPR, lalu MK, lalu MPR" },
        { at: "s8:Menteri", until: "s8:DPR", who: "ABDUL MU'TI, 6 NOV", text: "&ldquo;Belum ada proses hukum lebih lanjut.&rdquo;" },
        { at: "s9:Satu", until: OUT, cls: "big", who: "STATUS 8 NOV 2026", text: "Wapres belum diberhentikan" },
      ],
    };
  },
});
