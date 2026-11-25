// EP12: the Gibran photo taken down, the influencer boycott and two hoaxes. Run from EP12 folder: node ../sketch/ep12.mjs
import { buildFilm } from "./lib.mjs";
import { phone, post, stamp, wit2, bld2, node2, calendar, arrow, crowd, big, g, rect, text, shape, circleP } from "./kit.mjs";

const BLU = "#1E40AF";
const frame = (x, y, w, h, s1, s2) => rect(x, y, w, h, { wash: "#8C6A4A", op: .9, w: 5, hatch: true, gap: 18 }) + rect(x + 40, y + 40, w - 80, h - 80, { wash: "#EDE6D6", op: 1, w: 3 }) + shape(circleP(x + w / 2, y + h * .38, w * .16, w * .2).slice(0, 25), { wash: "#C9C2B4", op: 1, w: 3 }) + shape([[x + w * .2, y + h * .82], [x + w * .28, y + h * .58], [x + w * .72, y + h * .58], [x + w * .8, y + h * .82]], { wash: "#C9C2B4", op: 1, w: 3 }) + (s1 ? text(x + w / 2, y + h - 80, s1, 52) : "") + (s2 ? text(x + w / 2, y + h - 30, s2, 38, { weight: 600 }) : "");
const item = (x, y, s) => text(x, y, "&#8226; " + s, 66, { anchor: "start", font: "Anton", weight: 400 });
buildFilm({
  title: "Foto yang Diturunkan", accent: BLU, quoteFont: '"Anton",sans-serif', quoteWeight: 400, quoteSize: 60, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "POLEMIK WAPRES &middot; MEDIA SOSIAL", camY: 880, signature: "foto-diturunkan",
  make: ({ OUT }) => {
    let w = "";
    // A: hook, the frame on the wall
    w += g("wall", rect(300, 260, 1560, 1240, { wash: "#E3D6BC", op: .8, w: 3, hatch: true, gap: 34, ang: 1.5 }) + `<circle cx="1080" cy="330" r="14" fill="#2B2A28"/>` + rect(700, 380, 760, 960, { wash: "#D8CCB2", op: .6, w: 2 }));
    w += g("fr", frame(700, 380, 760, 960, "FOTO RESMI", "Wakil Presiden"));
    w += g("teriak", big(1080, 1660, "“turunkan berhala!”", 120, { fill: BLU, rot: -3 }));
    // B: DPRD DIY
    w += g("dprd", bld2(300, 1980, 1560, 460, "DPRD DIY", "Ruang Banggar, Rabu 4 Nov 2026") + crowd(330, 2760, 9, 2, 190, 1.05, [3, 4, 5]) + `<g transform="rotate(-8 1500 3260)">${frame(1360, 3180, 300, 380, "", "")}</g>` + text(1500, 3660, "diletakkan di lantai", 54));
    // C: who reached first
    w += g("chz", wit2("chirzin", 560, 4250, .95, "M. CHIRZIN", "pembina Forum Kebangsaan", { robe: "shirt", hair: "grey" }) + wit2("dewan", 1600, 4250, .95, "ANGGOTA DPRD DIY", "F-PDIP, menurut Chirzin", { robe: "batik", hair: "neutral" }) + arrow("chzA", [[860, 3900], [1300, 3900]], BLU, 9));
    w += g("chzS", stamp(1600, 4720, "BELUM DIJAWAB", "#B3261E", -6, 64));
    // D: PKB
    w += g("pkb", wit2("jazilul", 520, 5650, .95, "JAZILUL FAWAID", "Waketum PKB", { robe: "shirt", hair: "peci" }) + node2(1460, 5250, 800, 280, "“DE FACTO”", "dari putusan MA") + arrow("pk1", [[1300, 5400], [1140, 5640]], BLU, 8) + arrow("pk2", [[1460, 5400], [1460, 5640]], BLU, 8) + arrow("pk3", [[1620, 5400], [1780, 5640]], BLU, 8) + text(1460, 5760, "daerah lain?", 64, { fill: BLU }));
    // E: the madrasah
    w += g("kls", bld2(260, 6250, 1640, 420, "MA PLUS AL-HIDAYAH", "Grobogan, Jawa Tengah") + rect(560, 6920, 1040, 300, { wash: "#3E5A4A", op: .9, w: 4 }) + text(1080, 7050, "foto disimpan", 48, { fill: "#FBF6E8" }) + text(1080, 7130, "sampai ada kepastian hukum", 40, { fill: "#FBF6E8", weight: 600 }) + crowd(360, 7340, 8, 1, 210, .9, []));
    // F: boycott
    w += g("boi", phone(300, 7750, 560, 980, post(345, 7840, 470, "@warganet", { thumb: false, color: BLU }) + big(580, 8300, "#boikot", 84, { fill: BLU })) + calendar(1180, 7780, "29", "OKT 2026", "") + text(1330, 8220, "Sumpah Pemuda", 56) + text(1330, 8290, "Bundaran HI", 48, { weight: 600 }) + text(1330, 8420, "sehari setelah", 48, { fill: BLU }) + text(1330, 8485, "demo mahasiswa", 48, { fill: BLU }));
    // G: why, per Andina
    w += g("and", wit2("andina", 520, 9450, .9, "ANDINA DWIFATMA", "dosen Atma Jaya", { robe: "shirt", hair: "hijab" }) + item(980, 9020, "keracunan MBG") + item(980, 9200, "pengangguran") + item(980, 9380, "harga pangan") + text(1360, 9540, "akumulasi kekecewaan", 54, { fill: BLU }));
    // H: hoaxes
    w += g("hx1", phone(260, 9880, 640, 1000, rect(330, 9980, 500, 520, { wash: "#E9EEF0", op: 1, w: 2 }) + [0, 1, 2].map((i) => rect(420 + i * 30, 10320 - i * 46, 320, 70, { wash: "#5E8C5A", op: 1, w: 2.4 })).join("") + text(580, 10600, "“dana untuk", 42) + text(580, 10660, "mahasiswa”", 42)));
    w += g("hx1S", stamp(580, 10280, "HOAKS: BUATAN AI", "#B3261E", -10, 58));
    w += g("hx2", rect(1140, 9960, 800, 600, { wash: "#FBF6E8", op: 1, w: 4 }) + text(1540, 10110, "“SESKAB TEDDY", 56) + text(1540, 10200, "DIPERIKSA POM”", 56) + text(1540, 10320, "beredar di medsos", 44, { weight: 600 }) + text(1540, 10530, "cek fakta AUDIRA", 36, { fill: "#1E40AF" }));
    w += g("hx2S", stamp(1540, 10460, "HOAKS: MABES TNI", "#B3261E", 6, 58));
    return {
      world: w, people: ["chirzin", "dewan", "jazilul", "andina"],
      rot: [["fr", "s1:Yang", "s1:Yang+1.0", 0, -14, 700, 1340]],
      shots: [
        [0, 1080, 1000, .62], ["s1:Yang", 1080, 1000, .58],
        ["s2:Rabu", 1080, 2300, .6], ["s2:Massa", 1080, 3080, .6],
        ["s3:Pembina", 560, 4260, .82], ["s3:mengulurkan", 1080, 4320, .62],
        ["s4:Wakil", 520, 5660, .82], ["s4:ekspresi", 1150, 5560, .62],
        ["s5:Di", 1080, 6800, .6],
        ["s6:Di", 1080, 8240, .6],
        ["s6b:Menurut", 520, 9460, .82], ["s6b:boikot", 1080, 9360, .62],
        ["s7:Lalu", 580, 10380, .72], ["s7:Polri", 1080, 10380, .58],
        ["s8:Kabar", 1540, 10280, .8],
        ["s9:Foto", 1080, 1000, .6], [OUT, 1080, 1000, .53],
      ],
      reveals: [
        { id: "wall", at: 0, until: "s2:Rabu", fx: "fade" }, { id: "fr", at: 0, until: "s2:Rabu", fx: "fade" }, { id: "teriak", at: 0.2, until: "s2:Rabu", x: 1080, y: 1620 },
        { id: "dprd", at: "s2:Rabu", until: "s3:Pembina", fx: "fade" },
        { id: "chz", at: "s3:Pembina", until: "s4:Wakil", fx: "fade" }, { id: "chzS", at: "s3:Klaim", until: "s4:Wakil", x: 1600, y: 4720 },
        { id: "pkb", at: "s4:Wakil", until: "s5:Di", fx: "fade" },
        { id: "kls", at: "s5:Di", until: "s6:Di", fx: "fade" },
        { id: "boi", at: "s6:Di", until: "s6b:Menurut", fx: "fade" },
        { id: "and", at: "s6b:Menurut", until: "s7:Lalu", fx: "fade" },
        { id: "hx1", at: "s7:Lalu", until: "s9:Foto", fx: "fade" }, { id: "hx1S", at: "s7:Polri", until: "s9:Foto", x: 580, y: 10280 },
        { id: "hx2", at: "s8:Kabar", until: "s9:Foto", fx: "fade" }, { id: "hx2S", at: "s8:hoaks", until: "s9:Foto", x: 1540, y: 10460 },
        { id: "wall", at: "s9:Foto", until: 1e9, fx: "fade" },
      ],
      speak: [["chirzin", "s3:Pembina", "s3:Klaim"], ["jazilul", "s4:ekspresi", "s5:Di"], ["andina", "s6b:boikot", "s7:Lalu"]],
      poses: [],
      cards: [
        { at: 0, until: "s1:Yang", cls: "head", who: "DPRD DIY, 4 NOV 2026", text: "&ldquo;Turunkan berhala!&rdquo;" },
        { at: "s2:Ada", until: "s3:Pembina", who: "MASSA LAIN MENYAHUT", text: "&ldquo;Jangan dirusak.&rdquo;" },
        { at: "s3:mengulurkan", until: "s4:Wakil", who: "KLAIM MUHAMMAD CHIRZIN", text: "Yang pertama menurunkan: anggota dewan F-PDIP" },
        { at: "s4:ekspresi", until: "s5:Di", who: "JAZILUL FAWAID, 6 NOV", text: "&ldquo;Ekspresi de facto dari putusan MA&rdquo;" },
        { at: "s5:Katanya", until: "s6:Di", who: "KEPALA MA PLUS AL-HIDAYAH", text: "Sementara, sampai ada kepastian hukum" },
        { at: "s6:Seruan", until: "s6b:Menurut", who: "MEDIA SOSIAL", text: "Boikot influencer yang dianggap dekat pemerintah" },
        { at: "s7:Polri", until: "s8:Kabar", who: "CEK FAKTA", text: "Foto Gibran, Raffi, Willie: hasil AI" },
        { at: "s9:Foto", until: OUT, cls: "big", who: "SEBELUM MEMBAGIKAN", text: "Cek dulu sumbernya" },
      ],
    };
  },
});
