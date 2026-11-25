// EP49 NAYPYIDAW: URBANFORGE. A white plaster maquette of Naypyidaw on a dark plinth in a dark exhibition room.
// Model is matter, data is light: cyan/amber projections light the 20 lanes, the route Yangon -> Naypyidaw on a
// site-plan board, the fortress envelope, the scale scan, the 11 KM dimension line and the tunnel section, and the red
// wash of the 2025 earthquake on 80% of the government blocks. The golden pagoda is the only strong colour on the model,
// one tiny red car drives the empty boulevard, and the sun moves from morning to dusk.
// Panels are dark projector HUD cards. AUDIRA is a road sign on the gantry and a brass plaque on the plinth.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0D1118", CYAN = "#3FD8EA", AMBER = "#FFB627", RED = "#C0392B", INK = "#F4F2ED", MUTE = "#A9B4C4";
const MONO = `'JetBrains Mono',Consolas,monospace`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d, o = "") => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" ${o}>0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 49", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Ibu kota yang <em>sepi</em></div>
  <div class="cd stat" data-at="s1:dua-0.4" data-fx="card"><b>${ct(20, "s1:dua-0.4", 0.5)}</b><span>lajur jalan raya</span></div>
  <div class="stamp" data-at="s1:kosong" data-fx="stampc">HAMPIR SELALU KOSONG</div>
</div>
<div class="p" data-in="s2" data-out="s2:Kota">
  ${kk("No. 02", "IBU KOTA MYANMAR")}
  ${row("NAYPYIDAW", "", "s2:Naypyidaw")}
  ${row("ARTI NAMANYA", "&ldquo;kediaman raja&rdquo;", "s2:kediaman", "am")}
</div>
<div class="p" data-in="s2:Kota" data-out="s3">
  ${kk("No. 02", "DIBANGUN DARI NOL")}
  ${row("DEKAT PYINMANA", "lahan kosong", "s2:dibangun")}
  <div class="cd stat" data-at="s2:tiga-0.5" data-fx="card"><b>${ct(320, "s2:tiga-0.5", 0.5)}<small> km</small></b><span>di utara Yangon</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("No. 03", "PEMBANGUNAN")}
  <div class="cd stat" data-at="s3:2002" data-fx="card"><b>2002</b><span>mulai dibangun</span></div>
  <div class="cd stat am" data-at="s3:empat-0.4" data-fx="card"><b>US$${ct(4, "s3:empat-0.4", 0.4)}<small> MILIAR</small></b><span>perkiraan biaya</span></div>
  <div class="stamp" data-at="s3:korupsi" data-fx="stampc">KORUPSI &amp; NEPOTISME</div>
</div>
<div class="p" data-in="s4" data-out="s4:Namanya">
  ${kk("No. 04", "IBU KOTA PINDAH")}
  <div class="cd mega" data-at="s4:Enam" data-fx="card"><b>6 NOVEMBER 2005</b></div>
  ${row("YANGON &rarr; NAYPYIDAW", "dipindah pemerintahan militer", "s4:memindahkan")}
</div>
<div class="p" data-in="s4:Namanya" data-out="s5">
  ${kk("No. 04", "27 MARET 2006")}
  ${row("NAMA DIUMUMKAN", "beberapa bulan kemudian", "s4:diumumkan")}
  <div class="cd stat am" data-at="s4:dua-0.5" data-fx="card"><b>${ct(12000, "s4:dua-0.5", 0.6)}<small>+</small></b><span>tentara dalam parade</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("No. 05", "KENAPA PINDAH?")}
  <div class="cd row off" data-at="s5:Alasan" data-fx="card"><b><i class="tg">RESMI</i>YANGON TERLALU PADAT</b></div>
  <div class="sub" data-at="s5:dugaan" data-fx="fade">DUGAAN LAIN</div>
  <div class="cd mini cy" data-at="s5:tengah" data-fx="card">Lokasi lebih di tengah</div>
  <div class="cd mini am" data-at="s5:bergolak" data-fx="card">Dekat wilayah yang bergolak</div>
  <div class="cd mini cy" data-at="s5:benteng" data-fx="card">Dirancang seperti benteng</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("No. 06", "SKALA KOTA")}
  <div class="cd stat" data-at="s6:tujuh-0.5" data-fx="card"><b>${ct(7054, "s6:tujuh-0.5", 0.5)}<small> km&sup2;</small></b><span>luas wilayah</span></div>
  <div class="cd stat am" data-at="s6:sembilan-0.5" data-fx="card"><b>${ct(924608, "s6:sembilan-0.5", 0.5)}</b><span>penduduk resmi</span></div>
  <div class="stamp" data-at="s6:tapi" data-fx="stampc">JALANNYA LENGANG</div>
</div>
<div class="p" data-in="s7" data-out="s7:Lalu">
  ${kk("No. 07", "KOMPLEKS MILITER")}
  <div class="cd stat am" data-at="s7:sebelas-0.4" data-fx="card"><b>${ct(11, "s7:sebelas-0.4", 0.4)}<small> km</small></b><span>dari pegawai biasa</span></div>
  ${row("TERTUTUP UNTUK PUBLIK", "konon ada terowongan dan bunker", "s7:tertutup", "rd")}
</div>
<div class="p" data-in="s7:Lalu" data-out="s8">
  ${kk("No. 07", "28 MARET 2025")}
  ${row("GEMPA BESAR", "", "s7:gempa", "rd")}
  <div class="cd stat rd" data-at="s7:delapan-0.5" data-fx="card"><b>${ct(80, "s7:delapan-0.5", 0.5)}<small>%</small></b><span>gedung pemerintahan rusak</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("No. 08", "MAKET AUDIRA")}
  <div class="cd h2">Dibangun untuk bertahan,<br><em>tapi sepi</em></div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  ${kk("No. 08", "PERTANYAAN")}
  <div class="cd q">Menurut kamu, kenapa pemerintah mau membangun kota sebesar ini? Tulis di komentar.</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(11,14,19,.86);border:1px solid rgba(255,255,255,.13);border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.45);backdrop-filter:blur(6px)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:25px;line-height:1;letter-spacing:.16em;color:${CYAN};background:rgba(11,14,19,.86);border:1px solid rgba(63,216,234,.35);padding:13px 22px 12px;border-radius:10px;margin-bottom:18px}
.kk i{font-style:normal;color:${AMBER};border-right:2px solid rgba(255,182,39,.5);padding-right:16px}
.h1{display:inline-block;padding:20px 36px 26px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:92px;line-height:.98;letter-spacing:-.02em;color:${INK};max-width:900px;box-sizing:border-box}
.h1 em,.h2 em{font-style:normal;color:${AMBER}}
.h2{display:inline-block;padding:20px 34px 24px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:66px;line-height:1.04;color:${INK}}
.row{flex-direction:column;margin-top:14px;padding:16px 30px 18px;max-width:880px;box-sizing:border-box;border-left:10px solid ${CYAN}}
.row b{display:block;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:48px;line-height:1.06;letter-spacing:.01em;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:36px;line-height:1.12;color:${MUTE}}
.row.am{border-left-color:${AMBER}}.row.am span{color:#FFD27A}.row.rd{border-left-color:${RED}}
.row.off b{display:flex;align-items:center;gap:18px;font-size:44px}
.tg{font-style:normal;font-family:'JetBrains Mono',Consolas,monospace;font-size:24px;letter-spacing:.14em;color:#0B0E13;background:${INK};padding:7px 12px 5px;border-radius:6px}
.sub{display:table;margin-top:18px;margin-bottom:2px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.18em;color:${AMBER};background:rgba(11,14,19,.9);border:1px solid rgba(255,182,39,.45);padding:11px 18px 10px;border-radius:10px}
.mini{display:block;width:max-content;margin-top:10px;padding:12px 24px 13px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:38px;line-height:1.1;color:${INK};border:2px dashed rgba(63,216,234,.6);white-space:nowrap}
.mini.am{border-color:rgba(255,182,39,.7)}
.mega,.stat{display:flex;align-items:baseline;gap:22px;width:max-content;max-width:920px;box-sizing:border-box;margin-top:14px;padding:6px 32px 12px;border-left:10px solid ${CYAN}}
.mega b,.stat b{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-variant-numeric:tabular-nums;font-size:84px;line-height:1.08;color:${INK};white-space:nowrap}
.mega b{font-size:76px;color:${AMBER}}
.stat b small{font-size:.5em;color:${MUTE};font-weight:500}
.stat.am{border-left-color:${AMBER}}.stat.am b{color:${AMBER}}
.stat.rd{border-left-color:${RED}}.stat.rd b{color:#FF6B5B}
.stat span{font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:36px;color:${MUTE};max-width:380px;line-height:1.1}
.stamp{display:inline-block;margin-top:18px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:36px;letter-spacing:.12em;color:#fff;background:${RED};padding:13px 26px 11px;border-radius:8px;transform:rotate(-2deg);box-shadow:0 12px 28px rgba(0,0,0,.5)}
.q{margin-top:18px;padding:20px 30px 22px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:42px;line-height:1.2;color:${INK};border-left:10px solid ${AMBER};max-width:880px;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP49_NAYPYIDAW_IBU_KOTA_SEPI",
  ep: "49", bg: BG, vig: 0.5, grain: 0.04, capfloor: 0.68, html, css, chipFont: MONO, chipColor: CYAN,
  chip: "ILUSTRASI &middot; MAKET REKA ULANG",
  extraAt: ["s1:dua", "s1:lajur", "s1:kosong",
    "s2:Naypyidaw", "s2:kediaman", "s2:Kota", "s2:dibangun", "s2:tiga", "s2:Yangon",
    "s3:dimulai", "s3:2002", "s3:empat", "s3:miliar", "s3:korupsi", "s3:nepotisme",
    "s4:Enam", "s4:memindahkan", "s4:baru", "s4:Namanya", "s4:diumumkan", "s4:parade", "s4:dua", "s4:ribu",
    "s5:Alasan", "s5:dugaan", "s5:tengah", "s5:bergolak", "s5:benteng", "s5:diserbu", "s5:rakyat",
    "s6:Wilayahnya", "s6:tujuh", "s6:sembilan", "s6:Gedungnya", "s6:tapi", "s6:lengang",
    "s7:sebelas", "s7:kompleks", "s7:tertutup", "s7:terowongan", "s7:bunker", "s7:Lalu", "s7:Maret", "s7:gempa", "s7:delapan",
    "s8:megah", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.35,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.55,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.32,ease:'power2.in'},b-.32)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:60px;line-height:1.14;color:#F4F2ED;text-shadow:0 3px 0 #0b0e13,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F4F2ED"},{color:"${AMBER}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4F2ED",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Naypyidaw Ibu Kota Sepi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
