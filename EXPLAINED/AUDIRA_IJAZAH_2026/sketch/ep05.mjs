// EP05: where the circulated diploma photo came from, told by who said what in the Tifa hearings. Run from EP05 folder: node ../sketch/ep05.mjs
import { buildFilm, court, COURT as C } from "./lib.mjs";
import { calendar, phone, post, stamp, witness, node, arrow, tv, big, g, rect, text, doc, ALL_COURT } from "./kit.mjs";

const TEAL = "#1F6F8B";
buildFilm({
  title: "Rantai Foto", accent: TEAL, quoteFont: '"Space Grotesk",sans-serif', quoteWeight: 700, quoteSize: 60, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; RANTAI FOTO",
  make: ({ OUT }) => {
    const poses = { jokowi: { read: [[-60, -90], [60, -90]] }, refly: { point: [[-300, -230], null] }, hakim: { out: [null, [320, -200]] } };
    let w = court({ wash: "#B9C3BC", poses, left: ["ALKATIRI", "kuasa hukum Tifa"], right: ["DOKTER TIFA", "terdakwa"], rightLook: { robe: "shirt", hair: "hijab" } });
    w += g("tvS", tv(150, 300, 520, 330, post(250, 330, 300, "@DokterTifa", { thumb: false }) + text(410, 560, "29 MARET 2025", 34)));
    w += g("door", rect(1960, 760, 180, 420, { wash: "#6B4A2E", op: .9, w: 4 }) + text(2050, 730, "KELUAR", 34, { fill: "#B3261E" })) + arrow("exA", [[1500, 940], [1750, 900], [1940, 940]]);
    // A: wall of phones
    let wall = "";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) wall += phone(170 + c * 380, 2200 + r * 560, 300, 520, doc(170 + c * 380 + 55, 2200 + r * 560 + 90, 190, 270, "IJAZAH", { tag: r === 1 && c === 2 }));
    w += g("wall", wall);
    // B: Andi Azwan
    w += g("azw", witness("azwan", 700, 4300, 1.15, "ANDI AZWAN", "saksi jaksa, sidang Tifa") + calendar(1200, 3560, "15", "OKTOBER", "sidang Tifa", TEAL));
    w += g("azwNo", stamp(1300, 4120, "TAK PERNAH LIHAT", "#B3261E", -6, 56));
    // C: Dian Sandi with the X post from @HyperPoison
    w += g("ds", witness("dsandi", 640, 5800, 1.15, "DIAN SANDI", "pengunggah gambar") + calendar(1150, 4900, "22", "OKTOBER", "sidang Tifa", TEAL));
    w += g("dsPh", phone(1300, 5300, 520, 900, post(1360, 5380, 400, "@HyperPoison")));
    // D: matching against UGM's published material
    w += g("mt", phone(220, 6500, 560, 900, post(280, 6580, 440, "@DianSandi")) + phone(1380, 6500, 560, 900, post(1440, 6580, 440, "medsos UGM", { color: "#0B3D2E" })) + big(1080, 6980, "&#8776;", 220, { fill: TEAL }) + text(1080, 7100, "dicocokkan", 46));
    w += g("noEd", stamp(1080, 7560, "TIDAK DIEDIT", TEAL, 5, 86) + text(1080, 7700, "menurut keterangan Dian Sandi", 40, { weight: 500 }));
    // E: the chain
    w += g("n1", node(1080, 7980, 720, 190, "@HyperPoison", "akun asal gambar")) + g("n2", node(1080, 8330, 720, 190, "DIAN SANDI", "mengunggah di X")) + g("n3", node(1080, 8680, 720, 190, "PUBLIK", "jutaan layar"));
    w += arrow("a1", [[1080, 8080], [1080, 8225]], TEAL) + arrow("a2", [[1080, 8430], [1080, 8575]], TEAL);
    // F: Labfor result, beside the bench at the end
    w += g("lab", rect(150, 1600, 540, 620, { wash: "#E9DFC9", op: 1, w: 4 }) + doc(240, 1650, 330, 440, "S1", { tag: true }) + stamp(420, 1960, "IDENTIK", "#0B3D2E", -10, 70) + text(420, 2150, "Labfor Bareskrim, Mei 2025", 34));
    return {
      world: w, people: [...ALL_COURT, "azwan", "dsandi"],
      shots: [
        [0, 1080, 2900, .5], ["s1:Tapi", 1080, 1000, .52], ["s1:saksi", C.jokowi[0], C.jokowi[1] - 250, .9],
        ["s2:Pertama", 1000, 4000, .8], ["s2:15", 1150, 3850, .9], ["s2:Ia", 1000, 3950, .88], ["s2:Yang", 1040, 4050, .8],
        ["s3:Seminggu", 1000, 5300, .85], ["s3:Dialah", 1050, 5500, .72], ["s3:Gambar", 1560, 5650, 1.0],
        ["s4:Sebelum", 1080, 6900, .62], ["s4:Ia", 1080, 7400, .9],
        ["s5:Dokter", C.roy[0] - 120, C.roy[1] - 200, 1.4], ["s5:Itu", 1500, 1000, .8],
        ["s6:Lalu", C.jokowi[0], C.jokowi[1] - 250, 1.0], ["s6:29", 420, 600, 1.15], ["s6:Kuasa", C.refly[0], C.refly[1] - 180, 1.3], ["s6:Menurut", 1600, 950, .78],
        ["s7:Jadi", 1080, 8200, .9], ["s7:Dari", 1080, 8150, .75],
        ["s8:Itu", 900, 1500, .62], ["s8:Mei", 420, 1880, 1.0], ["s8:Roy", C.roy[0] - 120, C.roy[1] - 200, 1.3], ["s8:Hakim", 1080, 1050, .53], [OUT, 1080, 1050, .53],
      ],
      reveals: [
        { id: "wall", at: 0, until: "s1:Tapi", fx: "fade" },
        { id: "azw", at: "s2:Pertama", until: "s3:Seminggu", fx: "fade" }, { id: "azwNo", at: "s2:Ia", until: "s3:Seminggu", x: 1300, y: 4120 },
        { id: "ds", at: "s3:Seminggu", until: "s4:Sebelum", fx: "fade" }, { id: "dsPh", at: "s3:Gambar", until: "s4:Sebelum", x: 1560, y: 5750 },
        { id: "mt", at: "s4:Sebelum", until: "s5:Dokter", fx: "fade" }, { id: "noEd", at: "s4:Ia", until: "s5:Dokter", x: 1080, y: 7560 },
        { id: "tvS", at: "s6:membacakan", until: "s7:Jadi", x: 410, y: 460 }, { id: "door", at: "s6:Menurut", until: "s7:Jadi", fx: "fade" }, { id: "exA", at: "s6:keluar", until: "s7:Jadi", fx: "fade" },
        { id: "n1", at: "s7:akun", until: OUT, x: 1080, y: 7980 }, { id: "n2", at: "s7:Dian", until: OUT, x: 1080, y: 8330 }, { id: "n3", at: "s7:publik", until: OUT, x: 1080, y: 8680 },
        { id: "a1L", at: "s7:Dian", fx: "draw" }, { id: "a1H", at: "s7:Dian+.3", fx: "draw" }, { id: "a2L", at: "s7:publik", fx: "draw" }, { id: "a2H", at: "s7:publik+.3", fx: "draw" },
        { id: "exAL", at: "s6:keluar", fx: "draw" }, { id: "exAH", at: "s6:keluar+.3", fx: "draw" },
        { id: "lab", at: "s8:Mei", until: OUT, x: 420, y: 1900 },
      ],
      speak: [["roy", "s5:Dokter", "s5:Itu"], ["jokowi", "s6:membacakan", "s6:Kuasa"], ["refly", "s6:Kuasa", "s6:Menurut"], ["hakim", "s6:hakim", "s7:Jadi"], ["azwan", "s2:Ia", "s3:Seminggu"], ["dsandi", "s3:Ia", "s5:Dokter"]],
      poses: [["jokowi", "read", "s6:membacakan", "s7:Jadi"], ["refly", "point", "s6:menyela", "s6:Menurut"], ["hakim", "out", "s6:hakim", "s7:Jadi"]],
      cards: [
        { at: 0, until: "s1:Tapi", cls: "head", who: "SIDANG DOKTER TIFA", text: "Siapa yang pernah lihat ijazah aslinya?" },
        { at: "s1:saksi", until: "s2:Pertama", who: "DI RUANG SIDANG", text: "Dua saksi mengaku belum pernah melihat aslinya" },
        { at: "s2:Ia", until: "s3:Seminggu", who: "ANDI AZWAN, 15 OKT", text: "Hanya tahu dari unggahan Dian Sandi" },
        { at: "s3:Ia", until: "s3:Gambar", who: "DIAN SANDI, 22 OKT", text: "Belum pernah melihat aslinya" },
        { at: "s3:Gambar", until: "s4:Sebelum", who: "ASAL GAMBAR, KATA DIAN SANDI", text: "Akun @HyperPoison" },
        { at: "s5:Dokter", until: "s5:Itu", who: "DOKTER TIFA, TERDAKWA", text: "&ldquo;Pengecohan.&rdquo; Pertimbangkan lapor polisi" },
        { at: "s5:Itu", until: "s6:Lalu", cls: "head", who: "CATATAN", text: "Penilaian terdakwa, bukan putusan" },
        { at: "s6:membacakan", until: "s6:Kuasa", who: "JOKOWI, 5 NOV", text: "Membacakan unggahan X Tifa, 29 Maret 2025" },
        { at: "s6:Kuasa", until: "s6:Menurut", who: "KUASA HUKUM TIFA", text: "&ldquo;Ini kami tidak akui sebagai bukti.&rdquo;" },
        { at: "s6:Menurut", until: "s7:Jadi", who: "MENURUT KOMPAS DAN AFU", text: "Hakim meminta kuasa hukum keluar" },
        { at: "s7:Dari", until: "s8:Itu", who: "DARI KETERANGAN DI SIDANG", text: "Pengunggah bukan pemotret dokumen asli" },
        { at: "s8:Roy", until: "s8:Hakim", who: "ROY SURYO", text: "Meragukan hasil labfor" },
        { at: "s8:Hakim", until: OUT, cls: "big", who: "STATUS 6 NOV 2026", text: "Belum ada putusan" },
      ],
    };
  },
});
