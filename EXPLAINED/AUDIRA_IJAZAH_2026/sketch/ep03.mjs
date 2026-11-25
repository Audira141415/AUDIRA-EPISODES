// EP03: the exact question, the two reasons, why the defence wants the test, and what the judge has not done yet. Run from EP03 folder: node ../sketch/ep03.mjs
import { buildFilm, court, doc, g, line, mark, circleP, rect, shape, text, person, nameTag, COURT as C, INK } from "./lib.mjs";

const laptop = (x, y, w, h, inner) => rect(x, y, w, h, { wash: "#2F3A44", op: .95, w: 4 }) + inner + shape([[x - 60, y + h], [x + w + 60, y + h], [x + w + 110, y + h + 70], [x - 110, y + h + 70]], { wash: "#7D8790", op: .9, hatch: true, gap: 16, w: 3.6 });
const scope = (x, y) => rect(x, y + 470, 460, 60, { wash: "#3F4A52", op: .95, w: 3.6 }) + rect(x + 70, y + 80, 56, 400, { wash: "#55616B", op: .9, hatch: true, gap: 14 }) + shape([[x + 80, y + 70], [x + 310, y + 20], [x + 340, y + 110], [x + 110, y + 170]], { wash: "#55616B", op: .92, hatch: true, gap: 14 }) + shape([[x + 290, y + 110], [x + 340, y + 100], [x + 350, y + 230], [x + 310, y + 240]], { wash: "#2F3A44", op: .95 }) + rect(x + 190, y + 300, 230, 26, { wash: "#3F4A52", op: .95 });

const cells = () => {
  let o = "", n = 0;
  for (let r = 0; r < 11; r++) for (let c = 0; c < 13; c++) { n = (n * 31 + r * 7 + c * 13 + 11) % 97; const hot = n % 7 === 0; o += `<rect id="e${r}_${c}" x="${660 + c * 66}" y="${3970 + r * 56}" width="60" height="50" fill="${hot ? "#E8B23A" : n % 3 ? "#3F7CA0" : "#2E5F80"}"/>`; }
  return o;
};

buildFilm({
  title: "Uji Labfor", accent: "#14567E", quoteFont: '"EB Garamond",serif', quoteSize: 62, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; UJI ULANG LABFOR",
  make: ({ OUT }) => {
    let w = court({ wash: "#A9B8C2" });
    // the comparison being asked for
        w += g("cmpA", text(1080, 2240, "YANG DITANYAKAN REFLY", 58) + doc(250, 2340, 620, 840, "IJAZAH FISIK") + text(560, 3270, "FISIK", 80));
    w += g("cmpB", laptop(1190, 2420, 760, 560, doc(1420, 2460, 300, 450, "FILE", { seal: false, tag: false })) + text(1570, 3270, "FILE DIGITAL", 80));
    w += g("vs", shape(circleP(1040, 2780, 90).slice(0, 25), { wash: "#B3261E", op: .9, w: 4 }) + text(1040, 2808, "VS", 76, { fill: "#FBF6E8" }));
    // Labfor Polri
    w += text(1080, 3440, "", 10);
    w += g("lab", scope(250, 3300) + doc(1000, 3330, 340, 480, "UJI") + text(1170, 3880, "LABFOR POLRI", 66) + doc(1420, 3380, 240, 340, "A", { seal: false, tag: false }) + doc(1680, 3380, 240, 340, "B", { seal: false, tag: false }) + text(1560, 3780, "PEMBANDING", 44));
    // compression map, abstract and labelled
    w += g("ela", laptop(590, 3920, 980, 760, cells()) + text(1080, 4860, "Error Level Analysis", 76, { font: "EB Garamond", weight: 800 }) + text(1080, 4930, "peta beda kompresi, ilustrasi", 42, { weight: 500 }));
    w += `<g id="out">` + rect(160, 4900, 1840, 300, { wash: "#C4CDD3", op: .55, w: 3, hatch: true, gap: 30, ang: 1.5 }) + text(1080, 5120, "DI LUAR RUANG SIDANG", 58);
    w += person({ id: "jok2", x: 1080, y: 5760, s: 1.2, robe: "batik", hair: "peci" });
    for (const [x, y, a] of [[700, 5640, .6], [860, 5560, .35], [1300, 5560, -.35], [1460, 5640, -.6]]) w += line([[x, y], [x + 200 * Math.sin(a) + (x < 1080 ? 90 : -90), y + 420]], 10, "#2F3A44") + shape(circleP(x, y, 30, 40).slice(0, 25), { wash: "#2F3A44", op: .95 });
    w += nameTag(1080, 5990, "JOKOWI", "usai sidang") + `</g>`;
    // the word that matters and the empty order
    w += g("apa", text(1080, 6600, "APABILA", 240, { font: "EB Garamond", weight: 800 }) + mark("apaM", [[420, 6660], [800, 6680], [1240, 6650], [1740, 6670]], "#B3261E", 12));
    w += g("ord", rect(620, 920, 920, 260, { wash: "#FBF6E8", op: 1, w: 6 }) + text(1080, 1000, "PERINTAH UJI ULANG", 58) + text(1080, 1110, "BELUM ADA", 80, { fill: "#B3261E", font: "EB Garamond", weight: 800 }));

    return {
      world: w,
      people: ["jokowi", "hakim", "h2", "h3", "jaksa", "jaksa2", "refly", "roy", "jok2"],
      shots: [
        [0, 1080, 1000, .52], ["s1:jawaban", C.jokowi[0], C.jokowi[1] - 280, 1.45],
        ["s2:Refly", C.refly[0], C.refly[1] - 250, 1.45], ["s2:ijazah", 1080, 2840, .6],
        ["s3:Alasan", C.jokowi[0], C.jokowi[1] - 280, 1.45], ["s3:Labfor", 1090, 3580, .62], ["s3:Dan", C.jokowi[0], C.jokowi[1] - 280, 1.45],
        ["s4:Kenapa", C.roy[0] - 40, C.roy[1] - 180, 1.5], ["s4:Error", 1080, 4340, .92], ["s4:Jokowi", C.jokowi[0], C.jokowi[1] - 280, 1.45],
        ["s5:Refly", C.refly[0], C.refly[1] - 250, 1.45], ["s5:Jawabnya", C.jokowi[0], C.jokowi[1] - 280, 1.45],
        ["s6:Mei", 1090, 3580, .62], ["s6:Tapi", C.roy[0] - 40, C.roy[1] - 180, 1.5],
        ["s7:Usai", 1080, 5440, .95],
        ["s8:Perhatikan", 1080, 6520, .62], ["s8:Dari", 1080, 720, 1.05], ["s8:Refly", C.refly[0], C.refly[1] - 250, 1.45], ["s8:Kubu", C.roy[0] - 40, C.roy[1] - 180, 1.5], ["s8:Jadi", 1080, 720, 1.05], [OUT, 1080, 720, 1.05],
      ],
      reveals: [
        { id: "cmpA", at: "s2:ijazah", until: "s3:Alasan", x: 560, y: 2800 }, { id: "cmpB", at: "s2:file", until: "s3:Alasan", x: 1570, y: 2800 }, { id: "vs", at: "s2:dibandingkan", until: "s3:Alasan", x: 1040, y: 2780 },
        { id: "lab", at: "s3:Labfor", until: "s3:Dan", fx: "fade" }, { id: "lab", at: "s6:Mei", until: "s6:Tapi", fx: "fade" }, { id: "ela", at: "s4:Error", until: "s4:Jokowi", fx: "fade" }, { id: "out", at: "s7:Usai", until: "s8:Perhatikan", fx: "fade" }, { id: "apa", at: "s8:Perhatikan", until: "s8:Dari", fx: "fade" },
        { id: "apaM", at: "s8:apabila", fx: "draw" }, { id: "ord", at: "s8:Dari", until: "s8:Refly", x: 1080, y: 1050 }, { id: "ord", at: "s8:Jadi", x: 1080, y: 1050 },
      ],
      speak: [["jokowi", "s1:saya", "s2:Refly"], ["refly", "s2:Refly", "s2:ijazah"], ["jokowi", "s3:Alasan", "s3:Labfor"], ["jokowi", "s3:Dan", "s4:Kenapa"], ["jokowi", "s4:Jokowi", "s5:Refly"], ["refly", "s5:Refly", "s5:Jawabnya"], ["jokowi", "s5:Jawabnya", "s6:Mei"], ["roy", "s6:Tapi", "s7:Usai"], ["jok2", "s7:Usai", "s8:Perhatikan"], ["refly", "s8:Refly", "s8:Kubu"]],
      poses: [],
      cards: [
        { at: 0, until: "s1:jawaban", cls: "head", who: "SIDANG 5 NOV 2026", text: "Jokowi tolak uji ijazah ulang di labfor. Apa alasannya?" },
        { at: "s1:jawaban", until: "s2:Refly", who: "JOKOWI", text: "&ldquo;Saya keberatan, Yang Mulia.&rdquo;" },
        { at: "s2:Refly", until: "s2:ijazah", who: "REFLY HARUN, KUASA HUKUM ROY", text: "Apabila hakim memerintahkan, bersediakah?" },
        { at: "s3:Alasan", until: "s3:Labfor", who: "JOKOWI", text: "Alasan pertama:" },
        { at: "s3:Labfor", until: "s3:Dan", who: "ALASAN 1", text: "Sudah diuji Labfor Polri" },
        { at: "s3:Dan", until: "s4:Kenapa", who: "ALASAN 2", text: "&ldquo;Dokumen pribadi saya.&rdquo; Keberatan ditenteng-tenteng." },
        { at: "s4:Kenapa", until: "s4:Error", who: "KUBU ROY SURYO", text: "Analisis bertumpu pada file digital" },
        { at: "s4:Jokowi", until: "s5:Refly", who: "JOKOWI", text: "&ldquo;Saya tidak meneliti sampai sedetail itu.&rdquo;" },
        { at: "s5:Refly", until: "s5:Jawabnya", who: "REFLY HARUN", text: "Pernah diperlihatkan ke terdakwa?" },
        { at: "s5:Jawabnya", until: "s6:Mei", who: "JOKOWI", text: "&ldquo;Tidak. Yang menuduh itu yang membuktikan.&rdquo;" },
        { at: "s6:Mei", until: "s6:Tapi", who: "BARESKRIM, MEI 2025", text: "Identik dengan tiga pembanding" },
        { at: "s6:Tapi", until: "s7:Usai", who: "ROY SURYO, TERDAKWA", text: "Minta uji independen" },
        { at: "s7:Usai", until: "s8:Perhatikan", who: "JOKOWI, USAI SIDANG", text: "&ldquo;Masa diuji-uji. Sudah selesai.&rdquo;" },
        { at: "s8:Refly", until: "s8:Kubu", who: "REFLY HARUN", text: "Menduga berbeda, tapi &ldquo;baru perasaan&rdquo;" },
        { at: "s8:Kubu", until: "s8:Jadi", who: "KUBU ROY", text: "Akan terus meminta pengujian" },
      ],
    };
  },
});
void INK;
