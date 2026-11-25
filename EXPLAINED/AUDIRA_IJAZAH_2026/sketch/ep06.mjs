// EP06: what the criminal court is actually examining (the indictment), and how both indictments survived challenges. Run from EP06 folder: node ../sketch/ep06.mjs
import { buildFilm, court, COURT as C } from "./lib.mjs";
import { calendar, stamp, witness, arrow, building, crowd, big, g, line, rect, text, doc, mark, circleP, ALL_COURT } from "./kit.mjs";

const RUST = "#8A3B12";
const tag = (x, y, w, s) => rect(x - w / 2, y - 60, w, 120, { wash: "#FBF6E8", op: 1, w: 4, ink: RUST }) + text(x, y + 22, s, 60, { font: "Oswald", fill: RUST });
buildFilm({
  title: "Yang Diadili", accent: RUST, quoteFont: '"Bebas Neue",sans-serif', quoteWeight: 400, quoteSize: 78, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; YANG DIADILI",
  make: ({ OUT }) => {
    const poses = { jaksa: { point: [null, [300, -240]] }, refly: { point: [[-300, -230], null] } };
    let w = court({ wash: "#C9A27A", poses });
    // A: what people think vs what is examined
    w += g("dA", doc(260, 2250, 620, 820, "UJI KEASLIAN", { seal: false }) + text(570, 3150, "yang dikira", 44, { weight: 500 }));
    w += mark("xA1", [[300, 2300], [840, 3030]], "#B3261E", 16) + mark("xA2", [[840, 2300], [300, 3030]], "#B3261E", 16);
    w += g("dB", doc(1280, 2250, 620, 820, "SURAT DAKWAAN", { seal: false }) + text(1590, 3150, "yang diperiksa hakim", 44, { weight: 500 }));
    w += mark("oB", circleP(1590, 2660, 380, 470), RUST, 10);
    // B: report and suspects
    w += g("pol", building(200, 3560, 640, 420, "POLDA METRO JAYA", "laporan Jokowi") + calendar(1000, 3460, "30", "APRIL 2025", "lapor", RUST));
    w += g("tsk", calendar(1520, 3460, "7", "NOV 2025", "tersangka", RUST) + crowd(560, 4250, 8, 1, 150, 1.4, [0, 1]) + text(1085, 4500, "8 TERSANGKA, 2 KINI TERDAKWA", 54));
    // C: Roy's charges
    w += g("rc", witness("roy2", 560, 5500, 1.1, "ROY SURYO", "terdakwa", { robe: "shirt", hair: "side" }));
    w += g("t1", tag(1450, 4950, 760, "FITNAH")) + g("t2", tag(1450, 5160, 760, "PENCEMARAN NAMA")) + g("t3", tag(1450, 5370, 760, "UU ITE"));
    // D: the articles
    w += g("ps", rect(240, 5960, 1680, 980, { wash: "#FBF6E8", op: 1, w: 5 }) + text(1080, 6080, "PASAL YANG DIDAKWAKAN", 54) + line([[340, 6120], [1820, 6120]], 3)
      + text(1080, 6250, "KUHP baru, UU 1/2023", 52, { weight: 500 }) + big(1080, 6420, "Pasal 433 &middot; 434", 120, { fill: RUST })
      + text(1080, 6560, "UU ITE", 52, { weight: 500 }) + big(1080, 6730, "Pasal 32 &middot; 35", 120, { fill: RUST })
      + text(1080, 6880, "urutan primer/subsider beda antar media", 38, { weight: 500, op: .8 }));
    // E: Tifa's indictment, failed then fixed
    w += g("tf", witness("tifa2", 330, 7860, .95, "DOKTER TIFA", "terdakwa", { robe: "shirt", hair: "hijab" }));
    w += g("tdA", doc(640, 7150, 400, 540, "DAKWAAN 1", { seal: false }) + text(840, 7760, "KUHP lama + baru", 38));
    w += g("tdS", stamp(840, 7420, "EKSEPSI DIKABULKAN", "#B3261E", -12, 44));
    w += arrow("tAr", [[1070, 7420], [1260, 7420]], RUST);
    w += g("tdB", doc(1290, 7150, 400, 540, "DAKWAAN 2", { seal: false }) + text(1490, 7760, "diperbaiki jaksa", 38) + calendar(1740, 7200, "17", "SEPTEMBER", "perlawanan", RUST));
    // F: Roy's pretrial win and the 19 Oct ruling
    w += g("pr", calendar(260, 8180, "7", "JULI", "PN Jaksel", RUST) + stamp(420, 8640, "DIKABULKAN SEBAGIAN", "#0B3D2E", -6, 40) + text(420, 8760, "praperadilan: geledah, tangkap, tahan", 32));
    w += g("pr2", calendar(1000, 8180, "19", "OKTOBER", "putusan sela", RUST) + stamp(1580, 8380, "DAKWAAN TIDAK GUGUR", "#B3261E", -6, 46) + text(1580, 8560, "perlawanan tidak dapat diterima", 34) + text(1580, 8620, "sidang lanjut", 34));
    w += g("q", rect(260, 2280, 1640, 700, { wash: "#FBF6E8", op: 1, w: 6 }) + text(1080, 2420, "PERTANYAAN HUKUMNYA", 52) + big(1080, 2600, "Unggahan memenuhi", 96) + big(1080, 2730, "unsur pasal?", 96, { fill: RUST }) + text(1080, 2890, "belum diputus", 44, { weight: 500 }));
    return {
      world: w, people: [...ALL_COURT, "roy2", "tifa2"],
      shots: [
        [0, 1080, 2700, .62], ["s1:Bukan", 570, 2650, .95], ["s1:Yang", 1590, 2650, .95],
        ["s1b:Awalnya", 820, 3800, .78], ["s1b:Tujuh", 1250, 3850, .62], ["s1b:Dua", 1085, 4150, .62],
        ["s2:Roy", 1160, 5150, .66], ["s2:Jaksa", C.jaksa[0] + 140, C.jaksa[1] - 200, 1.15],
        ["s3:Pasalnya", 1080, 6440, .62], ["s3:Media", 1080, 6700, .78],
        ["s4:Dokter", 950, 7500, .6], ["s4:Hakim", 720, 7450, .74], ["s4:Jaksa", 1500, 7400, .85],
        ["s5:Roy", 520, 8480, .85], ["s6:Tapi", 1350, 8420, .78], ["s6:Perlawanan", 1500, 8460, .9],
        ["s7:Jaksa", C.jaksa[0] + 140, C.jaksa[1] - 200, 1.15], ["s7:Kubu", C.refly[0] + 100, C.refly[1] - 180, 1.15],
        ["s8:Jadi", 1080, 2640, .62], ["s8:Hakim", 1080, 1050, .53], [OUT, 1080, 1050, .53],
      ],
      reveals: [
        { id: "dA", at: 0, until: "s1b:Awalnya", fx: "fade" }, { id: "xA1", at: "s1:Bukan", until: "s1b:Awalnya", fx: "draw" }, { id: "xA2", at: "s1:Bukan+.25", until: "s1b:Awalnya", fx: "draw" },
        { id: "dB", at: "s1:Yang", until: "s1b:Awalnya", x: 1590, y: 2660 }, { id: "oB", at: "s1:surat", until: "s1b:Awalnya", fx: "draw" },
        { id: "pol", at: "s1b:Awalnya", until: "s2:Roy", fx: "fade" }, { id: "tsk", at: "s1b:Tujuh", until: "s2:Roy", x: 1085, y: 4000 },
        { id: "rc", at: "s2:Roy", until: "s3:Pasalnya", fx: "fade" }, { id: "t1", at: "s2:fitnah", until: "s3:Pasalnya", x: 1450, y: 4950 }, { id: "t2", at: "s2:pencemaran", until: "s3:Pasalnya", x: 1450, y: 5160 }, { id: "t3", at: "s2:ITE", until: "s3:Pasalnya", x: 1450, y: 5370 },
        { id: "ps", at: "s3:Pasalnya", until: "s4:Dokter", fx: "fade" },
        { id: "tf", at: "s4:Dokter", until: "s5:Roy", fx: "fade" }, { id: "tdA", at: "s4:Tapi", until: "s5:Roy", x: 840, y: 7420 }, { id: "tdS", at: "s4:mengabulkan", until: "s5:Roy", x: 840, y: 7420 },
        { id: "tAr", at: "s4:Jaksa", until: "s5:Roy", fx: "fade" }, { id: "tArL", at: "s4:Jaksa", until: "s5:Roy", fx: "draw" }, { id: "tArH", at: "s4:Jaksa+.3", until: "s5:Roy", fx: "draw" }, { id: "tdB", at: "s4:memperbaiki", until: "s5:Roy", x: 1490, y: 7420 },
        { id: "pr", at: "s5:Roy", until: "s7:Jaksa", fx: "fade" }, { id: "pr2", at: "s6:Tapi", until: "s7:Jaksa", x: 1300, y: 8400 },
        { id: "q", at: "s8:Jadi", until: "s8:Hakim", fx: "fade" },
      ],
      speak: [["jaksa", "s2:Jaksa", "s3:Pasalnya"], ["jaksa", "s7:Jaksa", "s7:Kubu"], ["refly", "s7:Kubu", "s8:Jadi"], ["roy2", "s2:Roy", "s2:Jaksa"]],
      poses: [["jaksa", "point", "s2:Jaksa", "s3:Pasalnya"], ["refly", "point", "s7:Kubu", "s8:Jadi"]],
      cards: [
        { at: 0, until: "s1:Bukan", cls: "head", who: "SIDANG IJAZAH JOKOWI", text: "Yang diadili bukan ijazahnya" },
        { at: "s1b:Awalnya", until: "s1b:Tujuh", who: "30 APRIL 2025", text: "Jokowi melapor ke Polda Metro Jaya" },
        { at: "s1b:Dua", until: "s2:Roy", who: "7 NOVEMBER 2025", text: "8 tersangka, 2 kini terdakwa" },
        { at: "s2:Jaksa", until: "s3:Pasalnya", who: "JAKSA, DALAM DAKWAAN", text: "Menuduh ijazah palsu, tak bisa membuktikan" },
        { at: "s4:Hakim", until: "s4:Jaksa", who: "EKSEPSI TIFA DIKABULKAN", text: "Jaksa mencampur KUHP lama dan baru" },
        { at: "s5:Roy", until: "s6:Tapi", who: "PN JAKARTA SELATAN, 7 JULI", text: "Praperadilan Roy dikabulkan sebagian" },
        { at: "s6:Dakwaan", until: "s7:Jaksa", who: "HAKIM, 19 OKTOBER", text: "Dakwaan tidak gugur. Sidang lanjut" },
        { at: "s7:Jaksa", until: "s7:Kubu", who: "JAKSA", text: "Minta eksepsi ditolak" },
        { at: "s7:Kubu", until: "s8:Jadi", who: "KUBU ROY", text: "Dakwaan prematur, keaslian belum diuji forum resmi" },
        { at: "s8:Hakim", until: OUT, cls: "big", who: "STATUS 6 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
