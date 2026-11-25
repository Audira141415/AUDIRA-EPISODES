// EP27 BIR TAWIL: SCALEFORGE. A measured desert plot (2.060 km², "TIDAK DIKLAIM") on a simplified map board of
// Egypt / Sudan / the Red Sea. Rulers measure the plot; the camera zooms continuously between plot and map.
// The 1899 line (red, straight on 22° LU) and the 1902 administrative line (blue dashes) draw in; claim tints show
// Egypt by 1899 and Sudan by 1902, so Halaib is claimed twice and Bir Tawil by no one. A balance weighs both plots at
// the same scale (Halaib ~10x, with coast). Invented micronation flags topple. HUD panels in SCALEFORGE dark cards.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#E04A3A", BLUE = "#2D6CDF", AMBER = "#F2973A", SAND = "#D9B98A", INK = "#0E1116", PURP = "#8D5BD8", BG = "#DFE4EA";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (dot, s) => `<div class="kk"><i style="background:${dot}"></i>${s}</div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Space Grotesk',sans-serif;font-weight:700">BIR TAWIL 2.060 km²</span><span style="font-family:'Space Grotesk',sans-serif;font-weight:500">abc</span><span style="font-family:'JetBrains Mono',monospace;font-weight:500">45 °C</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Namanya">
  ${kk(AMBER, "FAKTA SEJARAH NEGARA // EP 27")}
  <div class="h1">TANAH YANG <em>TIDAK</em><br>DIINGINKAN SIAPA PUN</div>
  <div class="cd mega" data-at="s1:lebih" data-fx="card"><small>LUAS</small><b><b class="ct" data-from="0" data-to="2060" data-a="s1:lebih" data-d="0.6">0</b></b><small>km²</small></div>
</div>
<div class="p" data-in="s2:Namanya" data-out="s2:Letaknya">
  ${kk(AMBER, "NAMA // ARTI")}
  <div class="h2">BIR TAWIL</div>
  ${row("BIR = SUMUR", "TAWIL = TINGGI / PANJANG", "s2:artinya")}
</div>
<div class="p" data-in="s2:Letaknya" data-out="s3">
  ${kk(AMBER, "LOKASI // IKLIM")}
  ${row("ANTARA MESIR &amp; SUDAN", "perbatasan, di tengah gurun", "s2:Mesir")}
  <div class="cd mega hot" data-at="s2:suhunya" data-fx="card"><small>SUHU HINGGA</small><b><b class="ct" data-from="24" data-to="45" data-a="s2:empat" data-d="0.7">24</b></b><small>°C</small></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk(RED, "19 JAN 1899 // PERJANJIAN INGGRIS–MESIR")}
  <div class="yr rd" data-at="s3:1899" data-fx="card">1899</div>
  ${row("GARIS LURUS 22° LU", "batas politik", "s3:lintang", "rd")}
  ${row("SELATAN GARIS = SUDAN", "", "s3:selatan")}
</div>
<div class="p" data-in="s4" data-out="s4:Bir">
  ${kk(BLUE, "4 NOV 1902 // GARIS KEDUA")}
  <div class="yr bl" data-at="s4:1902" data-fx="card">1902</div>
  ${row("BATAS ADMINISTRASI", "mengikuti wilayah gembala suku", "s4:batas", "bl")}
</div>
<div class="p" data-in="s4:Bir" data-out="s5">
  ${kk(BLUE, "1902 // SIAPA MENGURUS")}
  ${row("BIR TAWIL → DIURUS KAIRO", "", "s4:Kairo")}
  ${row("HALAIB → DIURUS SUDAN", "", "s4:Halaib")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk(PURP, "DUA KLAIM // DUA GARIS")}
  ${row("MESIR PAKAI GARIS 1899", "Halaib masuk Mesir", "s5:1899", "rd")}
  ${row("SUDAN PAKAI GARIS 1902", "Halaib masuk Sudan", "s5:1902", "bl")}
  <div class="chips"><i class="ch pu" data-at="s5:Sudan#2" data-fx="stampc">HALAIB DIKLAIM KEDUANYA</i></div>
</div>
<div class="p" data-in="s6" data-out="s6:Mengklaim">
  ${kk(AMBER, "MASALAHNYA")}
  ${row("BIR TAWIL SELALU JATUH KE PIHAK LAIN", "garis mana pun yang dipakai", "s6:Bir")}
</div>
<div class="p" data-in="s6:Mengklaim" data-out="s7">
  ${kk(AMBER, "TIMBANGAN // SKALA SAMA")}
  ${row("KLAIM BIR TAWIL = LEPAS HALAIB", "", "s6:melepas")}
  <div class="cd mega" data-at="s6:sepuluh" data-fx="card"><small>HALAIB &asymp;</small><b>10&times;</b><small>lebih luas<br>+ pantai</small></div>
  <div class="chips"><i class="ch" data-at="s6:mau" data-fx="stampc">TIDAK ADA YANG MAU</i></div>
</div>
<div class="p" data-in="s7" data-out="s7:Banyak">
  ${kk(AMBER, "KONDISI BIR TAWIL")}
  ${row("TANPA AIR PERMUKAAN", "", "s7:air")}
  ${row("TANPA PERMUKIMAN TETAP", "", "s7:permukiman")}
  ${row("&ge; 200 km DARI LAUT MERAH", "", "s7:laut")}
</div>
<div class="p" data-in="s7:Banyak" data-out="s8">
  ${kk(AMBER, "&quot;NEGARA MIKRO&quot;")}
  ${row("BANYAK YANG MENGAKU", "kebanyakan lewat internet, dari jauh", "s7:mendirikan")}
  <div class="chips"><i class="ch" data-at="s7:diakui" data-fx="stampc">TIDAK SATU PUN DIAKUI</i></div>
  <div class="note" data-at="s7:negara" data-fx="fade">bendera di layar rekaan, bukan bendera asli</div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut+1.4">
  ${kk(AMBER, "TANAH TAK BERTUAN")}
  <div class="lines"><span class="lr">GARIS 1899</span><span class="lb">GARIS 1902</span></div>
</div>
<div class="p" data-in="s8:Menurut+1.4" data-out="@END">
  <div class="cd q">Kalau kamu yang mengklaim Bir Tawil, negaramu diberi nama apa? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(14,17,22,.88);border:1px solid rgba(255,255,255,.14);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.1em;color:${AMBER};margin-bottom:16px;padding:12px 22px;background:rgba(14,17,22,.88);border:1px solid rgba(255,255,255,.14);border-radius:12px}
.kk i{display:block;width:14px;height:14px;border-radius:50%}
.h1{font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:84px;line-height:.98;letter-spacing:-.01em;color:#fff;background:rgba(14,17,22,.88);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:20px 28px 22px;width:max-content;max-width:880px}
.h1 em{font-style:normal;color:${AMBER}}
.h2{font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:110px;line-height:1;color:#fff;background:rgba(14,17,22,.88);border-radius:12px;padding:14px 28px 18px;width:max-content}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:18px;align-items:center}
.ch{font-style:normal;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:50px;line-height:1;letter-spacing:.03em;padding:14px 26px 12px;border:5px solid ${AMBER};color:#fff;background:rgba(194,65,12,.92);border-radius:8px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.35)}
.ch.pu{background:rgba(110,60,190,.94);border-color:#C9A8FF}
.row{margin-top:14px;padding:12px 26px 14px 26px;border-left:12px solid ${AMBER};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:50px;line-height:1.04;color:#fff}
.row span{display:block;margin-top:4px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.3;color:#C8CED8}
.row.rd{border-left-color:${RED}}.row.rd b{color:#FF7A6B}
.row.bl{border-left-color:${BLUE}}.row.bl b{color:#7FA8FF}
.mega{display:flex;align-items:center;gap:20px;width:max-content;margin-top:16px;padding:6px 30px 8px;border-left:12px solid ${AMBER}}
.mega b{font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:150px;line-height:1.02;color:#fff;font-variant-numeric:tabular-nums}
.mega small{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:34px;line-height:1.15;color:${AMBER};letter-spacing:.06em}
.mega.hot b{color:#FF7A6B}
.yr{display:inline-block;margin-top:4px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:150px;line-height:1;padding:4px 28px 10px;border-radius:12px;color:#fff}
.yr.rd{background:rgba(196,52,38,.94)}.yr.bl{background:rgba(36,92,200,.94)}
.note{display:inline-block;margin-top:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:23px;color:#E8ECF2;background:rgba(14,17,22,.82);padding:6px 14px;border-radius:8px}
.lines{display:flex;gap:16px;margin-top:4px}
.lines span{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:34px;color:#fff;padding:12px 20px;border-radius:10px}
.lr{background:rgba(196,52,38,.94)}.lb{background:rgba(36,92,200,.94)}
.q{margin-top:10px;padding:20px 28px 20px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:54px;line-height:1.08;color:#fff;border-left:12px solid ${AMBER};max-width:880px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP27_BIR_TAWIL",
  ep: "27", bg: BG, vig: 0.22, grain: 0.045, capfloor: 0.38, html, css, chipFont: `'JetBrains Mono',Consolas,monospace`, chipColor: "#1B1F25",
  chip: "PETA DISEDERHANAKAN &middot; PROPERTI TIDAK SESUAI SKALA",
  extraAt: ["s1:lebih", "s1:dua", "s1:kilometer", "s1:persegi", "s1:tidak",
    "s2:Bir", "s2:artinya", "s2:sumur", "s2:tinggi", "s2:Letaknya", "s2:Mesir", "s2:Sudan", "s2:suhunya", "s2:bisa", "s2:empat", "s2:derajat",
    "s3:1899", "s3:Inggris", "s3:garis", "s3:lintang", "s3:derajat", "s3:selatan", "s3:Sudan",
    "s4:1902", "s4:garis", "s4:batas", "s4:gembala", "s4:suku", "s4:setempat", "s4:Bir", "s4:Kairo", "s4:Segitiga", "s4:Halaib", "s4:Laut", "s4:Merah", "s4:Sudan",
    "s5:Mesir", "s5:memakai", "s5:1899", "s5:Halaib", "s5:Mesir#2", "s5:Sudan", "s5:memakai#2", "s5:1902", "s5:Halaib#2", "s5:Sudan#2",
    "s6:Bir", "s6:lain", "s6:Mengklaim", "s6:Tawil#2", "s6:melepas", "s6:Halaib", "s6:sepuluh", "s6:pantai", "s6:mau",
    "s7:air", "s7:permukiman", "s7:jauh", "s7:laut", "s7:Banyak", "s7:mendirikan", "s7:negara", "s7:internet", "s7:tidak#3", "s7:diakui",
    "s8:dua", "s8:garis", "s8:peta", "s8:Menurut", "s8:kalau", "s8:nama", "s8:Ikuti", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.mega')?'flex':e.matches('.yr')?'inline-block':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:30},{opacity:1,y:0,duration:.36,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-30},{opacity:1,y:0,duration:.38,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-24,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:66px;line-height:1.08;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.55)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${AMBER}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bir Tawil", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
