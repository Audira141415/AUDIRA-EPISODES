// EP09: what is scheduled for Wednesday 11 November and what is still open. Run from EP09 folder: node ../sketch/ep09.mjs
import { buildFilm, court, COURT as C } from "./lib.mjs";
import { calendar, phone, stamp, witness, building, crowd, big, g, line, rect, text, doc, shape, circleP, ALL_COURT } from "./kit.mjs";

const ORG = "#C2410C";
const check = (x, y, s) => rect(x, y - 60, 90, 90, { wash: "#FBF6E8", op: 1, w: 5 }) + text(x + 130, y, s, 58, { anchor: "start", font: "Archivo Black", weight: 400 });
buildFilm({
  title: "Rabu 11 November", accent: ORG, quoteFont: '"Archivo Black",sans-serif', quoteWeight: 400, quoteSize: 56, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; 11 NOVEMBER",
  make: ({ OUT }) => {
    const poses = { jokowi: { up: [[-190, -430], [190, -430]] }, roy: { no: [[-260, -260], [260, -260]] } };
    let w = court({ wash: "#D6B38A", poses });
    w += g("held", ["SD", "SMP", "SMA", "S1"].map((t, i) => doc(690 + i * 200, 810, 180, 250, t, { tag: i === 0 })).join(""));
    w += g("clk", shape(circleP(1840, 420, 150).slice(0, 25), { wash: "#FBF6E8", op: 1, w: 5 }) + line([[1840, 420], [1840, 320]], 10) + line([[1840, 420], [1760, 420]], 14) + text(1840, 640, "sampai ± 22.00", 40));
    // A: the day
    w += g("day", rect(640, 2160, 880, 900, { wash: "#FBF6E8", op: 1, w: 5 }) + rect(640, 2160, 880, 180, { wash: ORG, op: .92, w: 4 }) + text(1080, 2280, "RABU", 90, { fill: "#FBF6E8", font: "Archivo Black", weight: 400 }) + big(1080, 2760, "11", 380) + text(1080, 2980, "NOVEMBER 2026", 64));
    w += g("two", building(100, 3260, 480, 300, "PN JAKARTA TIMUR", "09.00, sidang Roy") + building(1580, 3260, 480, 300, "PN JAKARTA PUSAT", "putusan sela Bonatua"));
    // B: three witnesses
    w += g("wit", text(1080, 3800, "HAKIM KETUA CHRISTINA ENDARWATI MENJADWALKAN", 40) + witness("syarif", 400, 4420, 1.0, "AKBP SYARIF", "ajudan Jokowi", { robe: "shirt", hair: "neat" }) + witness("dsandi", 1080, 4420, 1.0, "DIAN SANDI", "pengunggah gambar") + witness("dumat", 1760, 4420, 1.0, "DUMATNO", "sepupu Jokowi", { robe: "shirt", hair: "grey" }));
    // C: Yasena's questions
    w += g("ya", witness("yasena", 480, 5700, 1.0, "YASENA", "kuasa hukum Roy", { robe: "toga", hair: "neat" }) + phone(1180, 4980, 520, 880, doc(1260, 5080, 360, 480, "IJAZAH") + text(1440, 5680, "foto digital", 36)) + big(1830, 5200, "izin?", 90, { fill: ORG, rot: 8 }));
    // D: Jakpus and UGM
    w += g("jp", building(160, 6260, 640, 420, "PN JAKARTA PUSAT", "gugatan legalisir") + stamp(480, 6230, "PUTUSAN SELA", ORG, -6, 54));
    w += g("ugm", building(1260, 6260, 700, 420, "UGM", "jubir I Made Andi Arsana", "#C9B88F"));
    // E: the retest question
    w += g("rt", doc(300, 7080, 520, 680, "S1") + shape(circleP(760, 7420, 170).slice(0, 25), { wash: "#D8E4E6", op: .55, w: 9 }) + line([[880, 7540], [1060, 7740]], 26) + big(1500, 7260, "UJI ULANG?", 100, { fill: ORG }) + text(1500, 7380, "diminta kubu Roy", 44, { weight: 500 }) + text(1500, 7470, "Labfor Polri: sudah diperiksa", 40));
    w += g("rtS", stamp(1500, 7680, "BELUM DIPERINTAHKAN", "#B3261E", -5, 52));
    // F: list still long
    w += g("cr", crowd(250, 7060, 10, 3, 185, 1.0, Array.from({ length: 8 }, (_, i) => 22 + i)) + big(1080, 7820, "hingga 94 saksi, 26 ahli", 80, { fill: ORG }));
    // G: what to watch
    w += g("ck", rect(200, 2160, 1760, 1000, { wash: "#FBF6E8", op: 1, w: 5 }) + text(1080, 2290, "3 HAL YANG LAYAK DITONTON", 56) + check(300, 2500, "Siapa yang ditanya") + check(300, 2720, "Bukti yang diterima") + check(300, 2940, "Uji ulang dikabulkan?"));
    w += g("v1", text(345, 2470, "&#10003;", 90, { fill: ORG })) + g("v2", text(345, 2690, "&#10003;", 90, { fill: ORG })) + g("v3", text(345, 2910, "?", 90, { fill: ORG }));
    return {
      world: w, people: [...ALL_COURT, "syarif", "dsandi", "dumat", "yasena"],
      shots: [
        [0, 1080, 2660, .6], ["s1:Dua", 1080, 2900, .5],
        ["s1b:Kamis", C.jokowi[0], C.jokowi[1] - 300, .95], ["s1b:sampai", 1500, 700, .8], ["s1b:Ia", 1080, 1050, .9], ["s1b:Roy", C.roy[0] - 120, C.roy[1] - 200, 1.3], ["s1b:Jumat", C.jokowi[0], C.jokowi[1] - 250, 1.2],
        ["s2:Rabu", 1080, 3420, .6], ["s2:Hakim", 1080, 4250, .54], ["s2:AKBP", 400, 4200, .9], ["s2:Dian", 1080, 4200, .9], ["s2:Dumatno", 1760, 4200, .9],
        ["s3:Kuasa", 1080, 5400, .6], ["s3:Menurut", 1350, 5350, .78],
        ["s4:Di", 520, 6420, .85], ["s4b:Jumat", 1580, 6420, .85],
        ["s5:Yang", 1080, 7400, .6], ["s5:Usai", 1080, 1000, .95], ["s5:Menurutnya", 1080, 7420, .62], ["s5:Hakim", 1450, 7550, .85],
        ["s6:Daftar", 1080, 7380, .66], ["s7:Tiga", 1080, 2660, .62], ["s8:Sampai", 1080, 1050, .53], [OUT, 1080, 1050, .53],
      ],
      reveals: [
        { id: "day", at: 0, until: "s1b:Kamis", x: 1080, y: 2600 }, { id: "two", at: "s1:Dua", until: "s1b:Kamis", fx: "fade" },
        { id: "held", at: "s1b:Ia", until: "s1b:Roy", fx: "rise", y: 280 }, { id: "clk", at: "s1b:sampai", until: "s2:Rabu", fx: "fade" },
        { id: "wit", at: "s2:Rabu", until: "s3:Kuasa", fx: "fade" },
        { id: "ya", at: "s3:Kuasa", until: "s4:Di", fx: "fade" },
        { id: "jp", at: "s4:Di", until: "s5:Yang", fx: "fade" }, { id: "ugm", at: "s4b:Jumat", until: "s5:Yang", x: 1610, y: 6680 },
        { id: "rt", at: "s5:Yang", until: "s6:Daftar", fx: "fade" }, { id: "rtS", at: "s5:Hakim", until: "s6:Daftar", x: 1500, y: 7680 },
        { id: "cr", at: "s6:Daftar", until: "s7:Tiga", fx: "fade" },
        { id: "ck", at: "s7:Tiga", until: "s8:Sampai", fx: "fade" }, { id: "v1", at: "s7:siapa", until: "s8:Sampai", x: 345, y: 2440 }, { id: "v2", at: "s7:bukti", until: "s8:Sampai", x: 345, y: 2660 }, { id: "v3", at: "s7:apakah", until: "s8:Sampai", x: 345, y: 2880 },
      ],
      speak: [["roy", "s1b:Roy", "s1b:Jumat"], ["hakim", "s1b:hakim", "s1b:Jumat"], ["jokowi", "s1b:capek", "s2:Rabu"], ["yasena", "s3:Kuasa", "s4:Di"], ["jokowi", "s5:Usai", "s5:Menurutnya"]],
      poses: [["jokowi", "up", "s1b:Ia", "s1b:Roy"], ["roy", "no", "s1b:Roy", "s1b:Jumat"]],
      cards: [
        { at: 0, until: "s1:Dua", cls: "head", who: "JADWAL SIDANG IJAZAH", text: "Rabu, 11 November: dua pengadilan" },
        { at: "s1b:Kamis", until: "s1b:Ia", who: "KAMIS, 5 NOV", text: "Jokowi bersaksi di dua sidang" },
        { at: "s1b:Roy", until: "s1b:Jumat", who: "ROY SURYO", text: "Menolak keterangan Jokowi. Hakim mencatat" },
        { at: "s1b:Jumat", until: "s2:Rabu", who: "JOKOWI, SOLO, 6 NOV", text: "&ldquo;Capek.&rdquo;" },
        { at: "s3:Menurut", until: "s4:Di", who: "MENURUT YASENA", text: "Jokowi mengaku tak pernah memberi izin" },
        { at: "s4b:menyatakan", until: "s5:Yang", who: "UGM, 6 NOV", text: "Menghormati proses hukum, bukti sudah diberikan" },
        { at: "s5:Usai", until: "s5:Menurutnya", who: "JOKOWI, USAI SIDANG", text: "&ldquo;Masa mau diuji lagi, diuji mana lagi?&rdquo;" },
        { at: "s8:Sampai", until: OUT, cls: "big", who: "STATUS 6 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
