// EP39 PERANG KUE: FOODFORGE. A long oiled-walnut patisserie table in a dark warm studio; the macro camera glides from
// plate to plate and the table slowly becomes the Gulf of Mexico battlefield.
// A hero croissant, macarons, an eclair and a tent card "Perang Kue"; a pastry box tied with an AUDIRA ribbon.
// B dough map of Mexico on a tilted board (1832), sugar-cube shops topple near the capital.
// C gingerbread shop "Patisserie Remontel, Tacubaya": a stack of 60 chocolate coins (60.000 peso) beside one coin (< 1.000).
// D giant invoice 600.000 PESO, a brass stamp lands "PRANCIS 1838".
// E Gulf tray: chocolate warships blockade, a layer-cake fortress San Juan de Ulua takes cocoa puffs, flags on Veracruz.
// F solemn: name card Jenderal Santa Anna, a single boot on a velvet cushion, a flag pick lowered to half-mast.
// G treaty 9 Maret 1839, an uncashed cheque, a piped chocolate arrow to 1861.
// H open pastry box AUDIRA, wide pull-back.
// Panels are patisserie menu cards. No portraits, no injury: food props and name cards only.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#F6E9D0", INK = "#3A2216", CAR = "#B5652B", BLUE = "#1F3D8A", RED = "#CE1126", GRN = "#006847", BG = "#140C08";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d) => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}">0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600;1,9..144,700&family=IBM+Plex+Mono:wght@500;600;700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 39", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Perang <em>Kue</em></div>
  ${row("Prancis vs Meksiko", "1838&ndash;1839", "s1:toko")}
  ${row("seorang jenderal", "kehilangan kakinya", "s1:jenderal", "rd")}
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("No. 01", "MEKSIKO &middot; 1832")}
  ${row("NEGARA BARU MERDEKA", "sering dilanda kerusuhan", "s2:Negara")}
  ${row("TOKO WARGA ASING", "kerap dijarah", "s2:dijarah", "rd")}
  <div class="note" data-at="s2:ganti" data-fx="fade">pemiliknya sulit mendapat ganti rugi</div>
</div>
<div class="p" data-in="s3" data-out="s3:Remontel#2">
  ${kk("No. 02", "TACUBAYA &middot; KOTA MEKSIKO")}
  ${row("MONSIEUR REMONTEL", "pembuat kue Prancis", "s3:Monsieur")}
  ${row("VERSI REMONTEL", "perwira Meksiko merusak tokonya", "s3:merusak", "bl")}
  ${row("VERSI MEKSIKO", "perwira cuma menolak membayar", "s3:Versi", "gr")}
</div>
<div class="p" data-in="s3:Remontel#2" data-out="s4">
  ${kk("No. 02", "NOTA REMONTEL")}
  <div class="cd stat" data-at="s3:menuntut" data-fx="card"><small>menuntut</small><b>${ct(60000, "s3:menuntut", 0.5)}</b><span>peso</span></div>
  <div class="cd stat rd" data-at="s3:kurang" data-fx="card"><small>nilai toko</small><b>&lt; 1.000</b><span>peso</span></div>
  <div class="note" data-at="s3:seribu" data-fx="fade">1 koin cokelat = 1.000 peso</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("No. 03", "PARIS &middot; 1838")}
  ${row("KELUHAN WARGA PRANCIS", "dikumpulkan jadi satu tagihan", "s4:keluhan")}
  <div class="cd mega" data-at="s4:menagih" data-fx="card"><b>${ct(600000, "s4:menagih", 0.5)}</b><small>peso</small></div>
  <div class="note" data-at="s4:ribu" data-fx="fade">setara 3 juta franc</div>
  <div class="stamp" data-at="s4:tidak" data-fx="stampc">TIDAK DIBAYAR</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("No. 04", "TELUK MEKSIKO &middot; 1838")}
  ${row("ARMADA PRANCIS", "memblokade pelabuhan Teluk", "s5:diblokade", "bl")}
  ${row("SAN JUAN DE ULÚA", "benteng dibombardir", "s5:dibombardir")}
  ${row("VERACRUZ", "kota pelabuhan direbut", "s5:direbut", "bl")}
  <div class="stamp gr" data-at="s5:menyatakan" data-fx="stampc">MEKSIKO MENYATAKAN PERANG</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("No. 05", "VERACRUZ &middot; DESEMBER 1838")}
  ${row("JENDERAL SANTA ANNA", "keluar dari masa pensiun", "s6:Santa", "gr")}
  ${row("KAKINYA TERKENA MERIAM", "dan harus diamputasi", "s6:terkena")}
  ${row("KAKI ITU DIMAKAMKAN", "dengan upacara militer penuh", "s6:dimakamkan")}
</div>
<div class="p" data-in="s7" data-out="s7:Dua">
  ${kk("No. 06", "9 MARET 1839")}
  ${row("PERJANJIAN DAMAI", "lewat mediasi Inggris", "s7:mediasi")}
  <div class="cd stat" data-at="s7:berjanji" data-fx="card"><small>dijanjikan</small><b>${ct(600000, "s7:berjanji", 0.6)}</b><span>peso</span></div>
  <div class="stamp" data-at="s7:tak" data-fx="stampc">TAK PERNAH DIBAYAR</div>
</div>
<div class="p" data-in="s7:Dua" data-out="s8">
  ${kk("No. 07", "22 TAHUN KEMUDIAN")}
  <div class="cd mega" data-at="s7:Dua" data-fx="card"><b>1861</b></div>
  ${row("PRANCIS MENYERBU LAGI", "tagihan lama jadi alasannya", "s7:menyerbu", "bl")}
</div>
<div class="p" data-in="s8" data-out="@END">
  ${kk("AUDIRA", "PATISERI SEJARAH")}
  <div class="cd h2">Semua bermula dari<br><em>tagihan toko kue</em></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Menurut kamu, apa tuntutan ganti rugi paling tidak masuk akal yang pernah kamu dengar?</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CARD};border:1px solid rgba(58,34,22,.22);border-radius:6px;box-shadow:0 22px 46px rgba(0,0,0,.55),0 2px 0 rgba(255,255,255,.55) inset}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:25px;line-height:1;letter-spacing:.16em;color:#F2C58A;background:#2A170E;padding:13px 22px 12px;border:1px solid ${CAR};border-radius:4px;margin-bottom:22px;box-shadow:0 10px 24px rgba(0,0,0,.5)}
.kk i{font-style:normal;font-weight:700;color:#F6E9D0;border-right:1px solid ${CAR};padding-right:16px}
.h1{display:inline-block;padding:14px 38px 22px;border-left:12px solid ${CAR};font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:700;font-size:132px;line-height:.98;color:${INK}}
.h1 em,.h2 em{font-style:italic;color:${CAR}}
.h2{display:inline-block;padding:16px 32px 20px;border-left:12px solid ${CAR};font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:700;font-size:74px;line-height:1.02;color:${INK}}
.row{flex-direction:column;margin-top:16px;padding:13px 28px 15px;border-left:12px solid ${CAR};max-width:860px;box-sizing:border-box}
.row b{display:block;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:38px;line-height:1.12;letter-spacing:.03em;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;font-size:44px;line-height:1.1;color:#5A3A26}
.row.rd{border-left-color:${RED}}.row.bl{border-left-color:${BLUE}}.row.gr{border-left-color:${GRN}}
.mega,.stat{display:flex;align-items:baseline;gap:18px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:16px;padding:6px 32px 12px;border-left:12px solid ${CAR}}
.mega b,.stat b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-variant-numeric:tabular-nums;font-size:132px;line-height:1.04;letter-spacing:-.02em;color:${INK}}
.stat b{font-size:104px}
.stat.rd{border-left-color:${RED}}.stat.rd b{color:${RED}}
.mega small,.stat small,.stat span{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;font-size:46px;color:#5A3A26}
.note{display:inline-block;margin-top:16px;font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:500;font-size:36px;line-height:1.22;color:#F6E9D0;background:rgba(32,18,11,.86);border-left:4px solid ${CAR};padding:10px 20px;max-width:820px}
.stamp{display:inline-block;margin-top:20px;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:44px;letter-spacing:.1em;color:#FBEFDC;background:${RED};padding:12px 26px 10px;border:3px double #FBEFDC;border-radius:4px;transform:rotate(-2deg);box-shadow:0 12px 28px rgba(0,0,0,.55)}
.stamp.gr{background:${GRN};font-size:36px}
.q{margin-top:22px;padding:18px 30px 20px;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:42px;line-height:1.22;color:#F6E9D0;background:#2A170E;border-left:12px solid ${RED};max-width:860px;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP39_PERANG_KUE_MEKSIKO",
  ep: "39", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.58, html, css, chipFont: `'IBM Plex Mono',monospace`, chipColor: "#F2C58A",
  chip: "ILUSTRASI &middot; DIORAMA MAKANAN",
  extraAt: ["s1:toko", "s1:kue", "s1:jenderal", "s1:kakinya",
    "s2:Meksiko", "s2:1832", "s2:kerusuhan", "s2:dijarah", "s2:ganti",
    "s3:Seorang", "s3:Monsieur", "s3:merusak", "s3:Tacubaya", "s3:Versi", "s3:menolak", "s3:Remontel#2", "s3:menuntut", "s3:enam", "s3:kurang", "s3:seribu",
    "s4:Prancis", "s4:keluhan", "s4:1838", "s4:menagih", "s4:enam", "s4:ribu", "s4:tidak",
    "s5:Armada", "s5:Pelabuhan", "s5:diblokade", "s5:benteng", "s5:dibombardir", "s5:Veracruz", "s5:direbut", "s5:menyatakan",
    "s6:Jenderal", "s6:Santa", "s6:pensiun", "s6:terkena", "s6:meriam", "s6:diamputasi", "s6:dimakamkan", "s6:upacara",
    "s7:Maret", "s7:1839", "s7:mediasi", "s7:berjanji", "s7:enam", "s7:tak", "s7:Dua", "s7:kemudian", "s7:menyerbu",
    "s8:Semua", "s8:tagihan", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.45,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.5,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.3,ease:'power2.in'},b-.3)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:60px;line-height:1.16;color:#FBF1E0;text-shadow:0 3px 0 #140c08,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FBF1E0"},{color:"#F2B45A",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FBF1E0",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Perang Kue Meksiko", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
