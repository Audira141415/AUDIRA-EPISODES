// EP04: who was warned, for what, in the order the hearing reports give. Argument cuts between faces; the room stays one room. Run from EP04 folder: node ../sketch/ep04.mjs
import { buildFilm, court, g, line, circleP, rect, shape, text, person, nameTag, COURT as C, INK } from "./lib.mjs";

const RED = "#A8321C";
const shoutLines = (id, x, y, flip = 1) => g(id, [0, 1, 2].map((i) => line([[x + flip * 10, y - 40 + i * 45], [x + flip * 90, y - 80 + i * 80]], 7, RED)).join(""));

buildFilm({
  title: "Sidang Memanas", accent: RED, quoteFont: "Oswald,sans-serif", quoteWeight: 700, quoteSize: 64, chip: "SKETSA ILUSTRASI, BUKAN POTRET", series: "KASUS IJAZAH &middot; SIDANG MEMANAS",
  make: ({ K, OUT }) => {
    const poses = { refly: { point: [[-300, -230], null] }, hakim: { gavel: [null, [220, -120]] } };
    let w = court({ wash: "#CFA08A", poses });
    w += shoutLines("sA", 1320, 830, -1) + shoutLines("sB", 790, 860, 1);
    // gavel on the bench
    w += g("gav", `<g id="gavR">` + rect(1230, 520, 170, 80, { wash: "#5A3B24", op: .95, w: 3.6, hatch: true, gap: 12 }) + line([[1400, 560], [1540, 590]], 16, "#5A3B24") + `</g>`);
    w += g("skors", rect(420, 170, 1320, 360, { wash: "#FBF6E8", op: 1, w: 12, ink: RED }) + text(1080, 440, "SKORS", 280, { fill: RED, font: "Oswald", weight: 700 }));
    w += g("cross", line([[1160, 800], [1340, 980]], 24, RED, 3) + line([[1340, 800], [1160, 980]], 24, RED, 3));
    // outside the court
    w += `<g id="outS">` + text(1080, 2240, "DI LUAR PN JAKARTA TIMUR", 58);
    for (let r = 0; r < 5; r++) for (let i = 0; i < 13 - (r % 2); i++) { const x = 130 + i * 155 + (r % 2) * 78, y = 2450 + r * 120; w += shape(circleP(x, y, 34, 38).slice(0, 25), { wash: "#3B3530", op: .85, hatch: "#000", gap: 8, w: 2.2 }) + shape([[x - 58, y + 84], [x - 50, y + 36], [x + 50, y + 36], [x + 58, y + 84]], { wash: "#EDE6D6", op: .95, w: 2.2 }); }
    w += `</g>`;
    // the clock of the day
    w += `<g id="clk">` + shape(circleP(1080, 3560, 420).slice(0, 25), { wash: "#FBF6E8", op: 1, w: 7 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; w += text(1080 + Math.sin(a) * 345, 3580 + -Math.cos(a) * 345, String(i || 12), 54, { font: "Oswald" }); }
    w += g("hH", line([[1080, 3560], [1080, 3360]], 18));
    w += g("hM", line([[1080, 3560], [1080, 3240]], 10, RED));
    w += text(1080, 4080, "09.00 sampai 16.30", 76, { font: "Oswald" }) + `</g>`;
    // the handshake
    w += `<g id="shk">` + rect(200, 4300, 1760, 240, { wash: "#E7DCC4", op: .8, w: 3, hatch: true, gap: 30, ang: 1.5 }) + text(1080, 4410, "AKHIR SIDANG ROY SURYO", 62, { font: "Oswald" });
    w += person({ id: "shJ", x: 780, y: 5040, s: 1.05, robe: "batik", hair: "peci", poses: { shake: [null, [300, -60]] } });
    w += person({ id: "shR", x: 1380, y: 5040, s: 1.05, robe: "shirt", hair: "side", poses: { shake: [[-300, -60], null] } });
    w += nameTag(780, 5270, "JOKOWI", "saksi") + nameTag(1380, 5270, "ROY SURYO", "terdakwa") + `</g>`;

    return {
      world: w,
      people: ["jokowi", "hakim", "h2", "h3", "jaksa", "jaksa2", "refly", "roy", "shJ", "shR"],
      shots: [
        [0, 1080, 1000, .52], ["s1:Tapi", C.hakim[0], C.hakim[1] - 120, 1.5],
        ["s2:Pertama", C.jokowi[0], C.jokowi[1] - 280, 1.45], ["s2:Hakim", C.hakim[0], C.hakim[1] - 120, 1.6],
        ["s3:Lalu", 1500, 1000, 1.05], ["s3:Jokowi", C.jokowi[0], C.jokowi[1] - 280, 1.45], ["s3:Hakim", C.hakim[0], C.hakim[1] - 120, 1.6], ["s3:Refly#2", 1000, 1010, .62],
        ["s4:Jaksa", 450, 900, 1.3], ["s4:Refly", 1400, 960, 1.15], ["s4:Jaksa#2", 450, 900, 1.3],
        ["s5:Hakim", 1080, 560, .88], ["s5:Setelah", 1080, 1000, .54],
        ["s6:Momen", 450, 900, 1.25], ["s6:Refly", 1120, 1000, .86], ["s6:Hakim", C.hakim[0], C.hakim[1] - 120, 1.6], ["s6:telunjuk", 1400, 880, 1.2], ["s6:Unsur", C.hakim[0], C.hakim[1] - 120, 1.6],
        ["s7:Di", 1080, 2600, .56], ["s7:Sidang", 1080, 3640, .9], ["s7:Di#2", C.hakim[0], C.hakim[1] - 120, 1.6],
        ["s8:Lalu", 1080, 4720, .82], ["s8:Panasnya", 1080, 4780, .92], ["s8:Hakim", 1080, 1000, .54], [OUT, 1080, 1000, .54],
      ],
      reveals: [
        { id: "sA", at: "s4:Suara", until: "s5:Hakim", fx: "fade" }, { id: "sB", at: "s4:Suara", until: "s5:Hakim", fx: "fade" },
        { id: "gav", at: "s2:Hakim", until: "s2:mohon", x: 1320, y: 560 }, { id: "skors", at: "s5:skors", until: "s5:Setelah", x: 1080, y: 350 },
        { id: "cross", at: "s6:telunjuk", until: "s6:Unsur", x: 1250, y: 890 }, { id: "outS", at: "s7:Di", until: "s7:Sidang", fx: "fade" }, { id: "clk", at: "s7:Sidang", until: "s7:Di#2", fx: "fade" }, { id: "shk", at: "s8:Lalu", until: "s8:Hakim", fx: "fade" },
      ],
      rot: [["hH", "s7:Sidang", "s7:Di#2", 270, 270 + 225, 1080, 3560], ["hM", "s7:Sidang", "s7:Di#2", 0, 2700, 1080, 3560]],
      speak: [["jokowi", "s2:Pertama", "s2:Hakim"], ["hakim", "s2:Hakim", "s3:Lalu"], ["refly", "s3:Lalu", "s3:Jokowi"], ["jokowi", "s3:Jokowi", "s3:Hakim"], ["hakim", "s3:Hakim", "s3:Refly#2"], ["refly", "s3:Refly#2", "s4:Jaksa"], ["jaksa", "s4:Jaksa", "s4:Refly"], ["refly", "s4:Refly", "s4:Jaksa#2"], ["jaksa", "s4:Jaksa#2", "s5:Hakim"], ["hakim", "s5:Hakim", "s5:Setelah"], ["jaksa", "s6:Jaksa", "s6:Refly"], ["refly", "s6:Refly", "s6:Hakim"], ["hakim", "s6:Hakim", "s7:Di"], ["hakim", "s7:Di#2", "s8:Lalu"]],
      poses: [["refly", "point", "s4:Refly", "s4:Jaksa#2"], ["refly", "point", "s6:Refly", "s6:Mau"], ["hakim", "gavel", "s5:skors", "s5:Suara"], ["shJ", "shake", "s8:bersalaman", 999], ["shR", "shake", "s8:bersalaman", 999]],
      cards: [
        { at: 0, until: "s1:Tapi", cls: "head", who: "SIDANG 5 NOV 2026", text: "Sidang ijazah memanas: hakim tegur Jokowi, Refly debat jaksa" },
        { at: "s1:Tapi", until: "s2:Pertama", who: "DI RUANG SIDANG", text: "Yang ditegur lebih dari satu pihak" },
        { at: "s2:Pertama", until: "s2:Hakim", who: "JOKOWI, SAKSI", text: "&ldquo;Untuk saya bukan peneliti.&rdquo;" },
        { at: "s2:Hakim", until: "s3:Lalu", who: "HAKIM KETUA MENEGUR JOKOWI", text: "&ldquo;Mohon dijawab saja pertanyaannya.&rdquo;" },
        { at: "s3:Lalu", until: "s3:Jokowi", who: "REFLY HARUN", text: "Tindakan mana yang dianggap fitnah?" },
        { at: "s3:Jokowi", until: "s3:Hakim", who: "JOKOWI", text: "Mengutip video Roy, 10 April 2025" },
        { at: "s3:Hakim", until: "s3:Refly#2", who: "HAKIM KETUA", text: "Sudah ditanyakan penuntut umum" },
        { at: "s3:Refly#2", until: "s4:Jaksa", who: "REFLY KE JAKSA", text: "&ldquo;Jangan mengganggu kami.&rdquo;" },
        { at: "s4:Jaksa", until: "s4:Refly", who: "JAKSA", text: "Keberatan: bicara lewat Majelis Hakim" },
        { at: "s4:Refly", until: "s4:Jaksa#2", who: "REFLY HARUN", text: "&ldquo;Dikeluarkan saja dia.&rdquo;" },
        { at: "s4:Jaksa#2", until: "s5:Hakim", who: "JAKSA", text: "&ldquo;Agar diperingatkan dulu.&rdquo;" },
        { at: "s5:Suara", until: "s5:Setelah", top: 730, who: "HAKIM KETUA", text: "&ldquo;Suara jangan ditinggikan.&rdquo;" },
        { at: "s6:Jaksa", until: "s6:Refly", who: "JAKSA", text: "Saksi tak bisa dipaksa mengingat pasal" },
        { at: "s6:Refly", until: "s6:Hakim", who: "REFLY HARUN", text: "&ldquo;Kami tidak pernah memotong!&rdquo;" },
        { at: "s6:Hakim", until: "s6:Unsur", who: "HAKIM KETUA MENEGUR REFLY", text: "&ldquo;Jangan pakai telunjuk.&rdquo;" },
        { at: "s6:Unsur", until: "s7:Di", who: "HAKIM KETUA", text: "Unsur pasal jangan ditanyakan ke saksi" },
        { at: "s7:Di#2", until: "s8:Lalu", who: "DICATAT HAKIM", text: "Roy menolak keterangan Jokowi" },
        { at: "s8:Hakim", until: OUT, cls: "big", who: "STATUS 5 NOV 2026", color: RED, text: "Belum ada putusan" },
      ],
    };
  },
});
void K_unused; var K_unused; void INK;
