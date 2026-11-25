// EP11: the wiretap case against the President, what police said and what is only claimed. Run from EP11 folder: node ../sketch/ep11.mjs
import { buildFilm } from "./lib.mjs";
import { phone, stamp, wit2, bld2, node2, calendar, arrow, big, g, line, rect, text, doc, mark } from "./kit.mjs";

const RED = "#9F1239";
const num = (x, y, s) => rect(x, y, 470, 92, { wash: "#FBF6E8", op: 1, w: 3 }) + text(x + 235, y + 62, s, 44, { font: "JetBrains Mono" });
const q = (x, y, s) => rect(x - 300, y, 600, 340, { wash: "#FBF6E8", op: 1, w: 4 }) + big(x, y + 170, "?", 140, { fill: RED }) + text(x, y + 290, s, 54);
buildFilm({
  title: "Server yang Menyadap", accent: RED, quoteFont: '"JetBrains Mono",monospace', quoteWeight: 700, quoteSize: 50, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS PENYADAPAN PRESIDEN", camY: 880, signature: "server-penyadap",
  make: ({ OUT }) => {
    let w = "";
    // A: hook, the phone
    w += g("ph", phone(700, 300, 620, 1100, text(1010, 640, "PRESIDEN", 64, { font: "JetBrains Mono" }) + text(1010, 730, "panggilan masuk", 42, { weight: 600 }) + [0, 1, 2].map((i) => line([[860 + i * 40, 900 - i * 30], [860 + i * 40, 1000 + i * 30]], 6, RED)).join("") + [0, 1, 2].map((i) => line([[1160 - i * 40, 900 - i * 30], [1160 - i * 40, 1000 + i * 30]], 6, RED)).join("")));
    w += g("tap", arrow("tapA", [[1340, 860], [1600, 860], [1920, 860]], RED, 12) + text(1640, 790, "DISADAP", 64, { fill: RED, font: "JetBrains Mono" }));
    // B: four suspects, 2 x 2
    w += g("sus", wit2("listyo", 560, 2500, .85, "LISTYO SIGIT P.", "mantan Kapolri", { robe: "shirt", hair: "neat" }) + wit2("ahrie", 1600, 2500, .85, "AHRIE SONTA N.", "Irjen Pol", { robe: "shirt", hair: "side" }) +
      wit2("eko", 560, 3300, .85, "EKO HADI S.", "Irjen Pol", { robe: "shirt", hair: "neutral" }) + wit2("slamet", 1600, 3300, .85, "SLAMET ULIANDI", "Irjen Pol, tak ditahan", { robe: "shirt", hair: "grey" }));
    // C: the server
    w += g("srv", rect(1180, 4000, 700, 900, { wash: "#3A3C40", op: 1, w: 5 }) + [0, 1, 2, 3, 4].map((i) => rect(1240, 4080 + i * 160, 580, 110, { wash: "#5A5D63", op: 1, w: 3 }) + `<circle cx="1300" cy="${4135 + i * 160}" r="14" fill="#7CFC9A"/>`).join("") + text(1530, 5010, "SERVER LIMS POLRI", 62) + text(1530, 5080, "sketsa ilustrasi AUDIRA", 36, { fill: "#9F1239" }) +
      num(200, 4060, "0812-xxxx-xxxx") + num(200, 4220, "0813-xxxx-xxxx") + num(200, 4380, "0811-xxxx-xxxx") + num(200, 4540, "0857-xxxx-xxxx") + arrow("srvA", [[700, 4330], [1150, 4330]], RED, 10));
    w += g("srvS", stamp(1080, 5190, "TANPA VERIFIKASI", "#B3261E", -5, 72));
    // D: October
    w += g("okt", calendar(320, 5520, "1", "OKT 2026", "") + text(470, 5960, "Listyo", 56) + text(470, 6030, "diberhentikan", 52) + doc(1100, 5500, 360, 460, "SADAPAN", { seal: false }) + doc(1520, 5540, 360, 460, "SADAPAN", { seal: false }));
    w += g("del", mark("d1", [[1080, 5500], [1900, 6040]], "#B3261E", 14) + mark("d2", [[1900, 5500], [1080, 6040]], "#B3261E", 14) + text(1490, 6150, "perintah hapus file", 60, { fill: "#B3261E" }));
    // E: makar?
    w += g("mk", bld2(240, 6600, 760, 380, "ISTANA", "Mensesneg Prasetyo Hadi") + bld2(1160, 6600, 760, 380, "BIN", "Kepala BIN Herindra", "#B8C4C9") + big(1080, 7400, "“mengarah ke makar”", 92, { fill: RED }));
    w += g("mkS", stamp(1080, 7620, "PASAL: KUHP + UU ITE", "#2B2A28", -3, 66));
    // F: why Jokowi's name comes up
    w += g("lnk", node2(1080, 8000, 1300, 260, "LISTYO SIGIT", "ajudan Jokowi 2014-2016") + line([[1080, 8130], [1080, 8270]], 9, RED) + node2(1080, 8400, 1300, 260, "JOKOWI", "presiden 2014-2024", "#F3E3E7"));
    w += g("akb", wit2("akbar", 560, 9300, .9, "AKBAR FAIZAL", "mantan anggota DPR") + doc(1180, 8850, 600, 760, "6.000+ NOMOR?", { seal: false }) + text(1480, 9720, "klaim, belum dikonfirmasi", 52, { fill: RED }));
    // G: what is not established
    w += g("chk", stamp(1080, 10000, "BELUM DIKONFIRMASI POLISI", "#B3261E", -4, 62) + stamp(1080, 10240, "43 NAMA: BUKAN RILIS RESMI", "#B3261E", 3, 62) + stamp(1080, 10480, "TAK DISEBUT TERLIBAT", "#2B2A28", -3, 62));
    // H: open questions (same paper as G, G is hidden by then)
    w += g("open", q(420, 9980, "MOTIF") + q(1080, 9980, "ISI SADAPAN") + q(1740, 9980, "PENERIMA"));
    return {
      world: w, people: ["listyo", "ahrie", "eko", "slamet", "akbar"],
      shots: [
        [0, 1010, 860, .68], ["s1:Tersangkanya", 1300, 860, .56],
        ["s2:Tiga", 1080, 2900, .55], ["s2:Listyo", 560, 2520, .82], ["s2:Ahrie", 1600, 2520, .82], ["s2:Eko", 560, 3320, .82], ["s2:Slamet", 1600, 3320, .82],
        ["s3:Menurut", 1050, 4560, .6], ["s3:tanpa", 1080, 4700, .6],
        ["s4:Satu", 1080, 5830, .6],
        ["s5:Istana", 1080, 7080, .58],
        ["s6:Lalu", 1080, 8200, .7], ["s6:Mantan", 1080, 9290, .6],
        ["s7:Klaim", 1080, 10220, .62],
        ["s8:Jokowi", 1080, 8200, .72],
        ["s9:Yang", 1080, 10150, .56], ["s9:Sampai", 1080, 2900, .55], [OUT, 1080, 2900, .5],
      ],
      reveals: [
        { id: "ph", at: 0, until: "s2:Tiga", fx: "fade" }, { id: "tap", at: "s1:Tersangkanya", until: "s2:Tiga", fx: "fade" },
        { id: "sus", at: "s2:Tiga", until: "s3:Menurut", fx: "fade" },
        { id: "srv", at: "s3:Menurut", until: "s4:Satu", fx: "fade" }, { id: "srvS", at: "s3:tanpa", until: "s4:Satu", x: 1080, y: 5190 },
        { id: "okt", at: "s4:Satu", until: "s5:Istana", fx: "fade" }, { id: "del", at: "s4:menghapus", until: "s5:Istana", fx: "fade" },
        { id: "mk", at: "s5:Istana", until: "s6:Lalu", fx: "fade" }, { id: "mkS", at: "s5:Tapi", until: "s6:Lalu", x: 1080, y: 7620 },
        { id: "lnk", at: "s6:Lalu", until: "s6:Mantan", fx: "fade" }, { id: "akb", at: "s6:Mantan", until: "s7:Klaim", fx: "fade" },
        { id: "chk", at: "s7:Klaim", until: "s8:Jokowi", fx: "fade" },
        { id: "lnk", at: "s8:Jokowi", until: "s9:Yang", fx: "fade" },
        { id: "open", at: "s9:Yang", until: "s9:Sampai", fx: "fade" },
        { id: "sus", at: "s9:Sampai", until: 1e9, fx: "fade" },
      ],
      speak: [["akbar", "s6:Mantan", "s7:Klaim"]],
      poses: [],
      cards: [
        { at: 0, until: "s1:Tersangkanya", cls: "head", who: "KASUS PENYADAPAN", text: "Telepon Presiden Prabowo disadap" },
        { at: "s2:Tiga", until: "s2:Listyo", who: "BARESKRIM, 3 NOV 2026", text: "4 tersangka penyadapan ilegal" },
        { at: "s3:Menurut", until: "s4:Satu", who: "KABARESKRIM ASEP SAFRUDIN", text: "Nomor masuk server LIMS tanpa verifikasi, 2025-2026" },
        { at: "s5:Istana", until: "s5:Kepala", who: "MENSESNEG, 4 NOV", text: "&ldquo;Mengarah ke perbuatan makar&rdquo;" },
        { at: "s5:Kepala", until: "s5:Tapi", who: "KEPALA BIN, 6 NOV", text: "&ldquo;Ilegal dan mengarah ke tindakan yang makar&rdquo;" },
        { at: "s6:Mantan", until: "s7:Klaim", who: "AKBAR FAIZAL (KLAIM)", text: "6.000+ nomor disadap, tak ada lingkar Solo" },
        { at: "s8:Jokowi", until: "s9:Yang", who: "JOKOWI, 5 NOV", text: "&ldquo;Kita menghormati proses hukum, nanti kita tunggu.&rdquo;" },
        { at: "s9:Sampai", until: OUT, cls: "big", who: "STATUS 8 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
