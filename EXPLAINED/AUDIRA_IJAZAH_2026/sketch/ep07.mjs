// EP07: the witness list and the first witnesses, one face and one claim at a time. Run from EP07 folder: node ../sketch/ep07.mjs
import { buildFilm, court, COURT as C } from "./lib.mjs";
import { calendar, witness, crowd, ballot, big, g, line, rect, text, doc, mark, circleP, shape, ALL_COURT } from "./kit.mjs";

const GRN = "#2F6B3A";
buildFilm({
  title: "Parade Saksi", accent: GRN, quoteFont: '"Syne",sans-serif', quoteWeight: 800, quoteSize: 58, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; PARADE SAKSI",
  make: ({ OUT }) => {
    const hi = Array.from({ length: 26 }, (_, i) => 94 + i);
    let w = court({ wash: "#B7BE98", poses: { roy: { no: [[-260, -260], [260, -260]] } } });
    // A: the file, 94 + 26
    w += g("cr", big(1080, 2290, "94 SAKSI &middot; 26 AHLI", 120, { fill: GRN }) + crowd(250, 2420, 15, 8, 118, .62, hi) + text(1080, 3680, "berkas jaksa, total hingga 120", 46, { weight: 500 }));
    w += g("c28", calendar(330, 3800, "28", "OKTOBER", "2 saksi", GRN) + text(1150, 3980, "jaksa: relevansi", 58) + text(1150, 4060, "diperhatikan", 58));
    // B: Lechumanan
    w += g("le", witness("lech", 560, 4950, 1.15, "LECHUMANAN", "Peradi Bersatu, pelapor") + doc(1250, 4160, 520, 680, "IJAZAH") + text(1510, 4930, "mengaku pernah lihat asli", 40));
    w += g("le2", shape(circleP(700, 5560, 260, 120).slice(0, 25), { wash: "#D9CDB2", op: .9, w: 3 }) + shape(circleP(1460, 5560, 260, 120).slice(0, 25), { wash: "#D9CDB2", op: .9, w: 3 }) + text(700, 5580, "yakin asli", 44) + text(1460, 5580, "meragukan", 44) + line([[1080, 5420], [1060, 5500], [1100, 5600], [1075, 5700]], 8, "#B3261E") + text(1080, 5780, "organisasi terpecah, katanya", 42, { weight: 500 }));
    w += g("bal", [0, 1, 2, 3, 4].map((i) => ballot(240 + i * 340, 5950, String(i + 1), "pemilu")).join(""));
    // C: Maret Samuel Sueken and the clip length
    w += g("ms", witness("maret", 560, 7050, 1.1, "MARET SAMUEL S.", "ketum relawan JPKP"));
    w += g("vb", rect(1000, 6420, 980, 110, { wash: "#E7DCC4", op: 1, w: 4 }) + rect(1080, 6420, 70, 110, { wash: "#B3261E", op: .9, w: 3 }) + text(1490, 6390, "acara berjam-jam", 44) + text(1115, 6620, "7:33", 64, { fill: "#B3261E", font: "Oswald" }) + text(1500, 6740, "yang diunduh saksi, kata Roy", 40, { weight: 500 }));
    // D: Dumatno
    w += g("du", witness("dumat", 560, 8150, 1.1, "DUMATNO B. U.", "sepupu Jokowi") + calendar(1250, 7300, "22", "OKTOBER", "sidang Tifa", GRN));
    w += g("ai", rect(1120, 7300, 600, 520, { wash: "#FBF6E8", op: 1, w: 4 }) + rect(1200, 7360, 200, 260, { wash: "#D9CDB2", op: 1, w: 3 }) + text(1300, 7510, "FOTO", 40) + big(1560, 7520, "AI?", 110, { fill: "#B3261E" }) + text(1420, 7720, "klaim Roy: mirip Dumatno", 34));
    w += g("yr", big(1420, 8020, "lahir 1977", 92, { fill: GRN }) + text(1420, 8120, "Jokowi lulus 1985: umur 8", 42));
    // E: count versus proof
    w += g("sc", line([[1080, 8380], [1080, 8900]], 12) + line([[560, 8460], [1600, 8460]], 10) + rect(330, 8520, 460, 140, { wash: "#E7DCC4", op: 1, w: 4 }) + rect(1370, 8520, 460, 140, { wash: "#E7DCC4", op: 1, w: 4 }) + text(560, 8610, "JUMLAH", 60, { font: "Oswald" }) + text(1600, 8610, "BUKTI", 60, { font: "Oswald" }) + text(1080, 8960, "dinilai hakim", 46, { weight: 500 }));
    return {
      world: w, people: [...ALL_COURT, "lech", "maret", "dumat"],
      rot: [["sc", "s8:Jumlah", "s8:Menilainya", 0, -4, 1080, 8460]],
      shots: [
        [0, 1080, 2780, .55], ["s1:Itulah", 1080, 2920, .6], ["s2:Tanggal", 950, 3950, .66], ["s2:Hari", 700, 3930, .85],
        ["s3:Pertama", 1080, 4650, .6], ["s3:Ia", 1450, 4500, .9], ["s3:Soal", 600, 4500, 1.0],
        ["s4:Ia", 1080, 5560, .75], ["s4:Pandangannya", 1080, 6080, .62],
        ["s5:Kedua", 820, 6800, .72], ["s5:Roy", C.roy[0] - 120, C.roy[1] - 200, 1.3], ["s5:Menurut", 1400, 6560, .85],
        ["s6:Di", 950, 7700, .72], ["s6:Umurnya", 1000, 7800, .72],
        ["s7:Namanya", 1420, 7560, .95], ["s7:Jokowi", 1280, 7900, .8],
        ["s7b:Sementara", C.roy[0] - 200, C.roy[1] - 200, 1.0], ["s7b:hakim", 1080, 1000, .62],
        ["s8:Jumlah", 1080, 8640, .8], ["s8:Terdakwa", 1080, 1050, .53], [OUT, 1080, 1050, .53],
      ],
      reveals: [
        { id: "cr", at: 0, until: "s3:Pertama", fx: "fade" }, { id: "c28", at: "s2:Tanggal", until: "s3:Pertama", x: 800, y: 3950 },
        { id: "le", at: "s3:Pertama", until: "s5:Kedua", fx: "fade" }, { id: "le2", at: "s4:Ia", until: "s5:Kedua", x: 1080, y: 5560 }, { id: "bal", at: "s4:Pandangannya", until: "s5:Kedua", fx: "rise", y: 200 },
        { id: "ms", at: "s5:Kedua", until: "s6:Di", fx: "fade" }, { id: "vb", at: "s5:Menurut", until: "s6:Di", x: 1490, y: 6480 },
        { id: "du", at: "s6:Di", until: "s7:Namanya", fx: "fade" }, { id: "ai", at: "s7:Namanya", until: "s7b:Sementara", x: 1420, y: 7560 }, { id: "yr", at: "s7:1977", until: "s7b:Sementara", x: 1420, y: 8020 },
        { id: "sc", at: "s8:Jumlah", until: "s8:Terdakwa", fx: "fade" },
      ],
      speak: [["lech", "s3:Soal", "s4:Ia"], ["lech", "s4:Pandangannya", "s5:Kedua"], ["roy", "s5:Roy", "s5:Menurut"], ["dumat", "s6:Ia", "s7:Namanya"], ["roy", "s7b:Roy", "s7b:hakim"], ["hakim", "s7b:hakim", "s8:Jumlah"]],
      poses: [["roy", "no", "s7b:Roy", "s7b:hakim"]],
      cards: [
        { at: 0, until: "s1:Itulah", cls: "head", who: "BERKAS PERKARA ROY SURYO", text: "94 saksi, 26 ahli" },
        { at: "s2:jaksa", until: "s3:Pertama", who: "JAKSA, 28 OKTOBER", text: "Relevansi akan diperhatikan" },
        { at: "s3:Ia", until: "s3:Soal", who: "LECHUMANAN", text: "Pernah melihat langsung ijazah asli" },
        { at: "s3:Soal", until: "s4:Ia", who: "LECHUMANAN", text: "&ldquo;Saya tidak bisa tidur.&rdquo;" },
        { at: "s4:Pandangannya", until: "s5:Kedua", who: "PANDANGAN LECHUMANAN", text: "Lima kali pemilu, masa produk palsu?" },
        { at: "s5:Roy", until: "s5:Menurut", who: "ROY SURYO, TERDAKWA", text: "Menolak kesaksian Maret Samuel" },
        { at: "s6:Ia", until: "s6:Umurnya", who: "DUMATNO, 22 OKT", text: "Tahu dari obrolan keluarga" },
        { at: "s7:Jokowi", until: "s7b:Sementara", who: "JOKOWI, 5 NOV", text: "&ldquo;Dumatno lahir 1977.&rdquo;" },
        { at: "s7b:Sementara", until: "s8:Jumlah", who: "ROY SURYO, 5 NOV", text: "Menolak seluruh keterangan Jokowi. Hakim mencatat" },
        { at: "s8:Terdakwa", until: OUT, cls: "big", who: "STATUS 6 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
