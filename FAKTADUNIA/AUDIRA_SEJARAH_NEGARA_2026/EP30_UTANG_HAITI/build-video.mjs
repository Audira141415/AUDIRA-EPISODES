// EP30 UTANG KEMERDEKAAN HAITI: MARBLEMUSEUM. A quiet marble gallery; the camera walks along one wall from exhibit to
// exhibit and each warm spotlight comes up as it arrives: the 1825–1947 tablet and the "Pameran AUDIRA" donor plaque,
// a framed Caribbean map with Saint-Domingue, a slate board of 520 dots (1 dot = 1.000 people, 425 in bronze), a marble
// portal engraved 1804 whose bronze trade doors close, a vitrine with 14 warship tokens under a 150.000.000 FRANC frieze,
// a ledger (150 struck, 60, LUNAS 1883), an interest rail running on to 1947 (analisis New York Times 2022), a 2016
// stele (dicabut, tanpa ganti rugi) beside an empty tray, and a bronze balance tipped to one side.
// Panels are white museum wall-label cards. No portraits, no chains, no violence: the numbers carry the story.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#F4F0E8", INK = "#141414", GOLD = "#B8954A", BLUE = "#00209F", RED = "#9E1B2C", BG = "#0C0B0A";
const HEAD = `'Cormorant Garamond',Georgia,serif`, BODY = `'IBM Plex Serif',Georgia,serif`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d) => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}">0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 30", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Membayar<br>untuk <em>merdeka</em></div>
  <div class="cd mega" data-at="s1:lebih" data-fx="card"><small>lebih dari</small><b>${ct(120, "s1:lebih", 0.65)}</b><small>tahun</small></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("No. 02", "LAUT KARIBIA")}
  ${row("HAITI", "dulu bernama <u>Saint-Domingue</u>", "s2:Haiti")}
  ${row("KOLONI PRANCIS", "paling menguntungkan di dunia", "s2:koloni", "rd")}
  <div class="note" data-at="s2:diperbudak" data-fx="fade">dibangun dari kerja ratusan ribu orang yang diperbudak</div>
</div>
<div class="p" data-in="s3" data-out="s3:budak+0.5">
  ${kk("No. 03", "SAINT-DOMINGUE, 1790")}
  <div class="cd stat" data-at="s3:dari" data-fx="card"><b>${ct(520000, "s3:dari", 0.4)}</b><span>penduduk</span></div>
  <div class="cd stat rd" data-at="s3:penduduknya" data-fx="card"><b>${ct(425000, "s3:penduduknya", 0.7)}</b><span>diperbudak</span></div>
  <div class="note" data-at="s3:adalah" data-fx="fade">1 titik di papan = 1.000 orang</div>
</div>
<div class="p" data-in="s3:budak+0.5" data-out="s5">
  ${kk("No. 04", "REVOLUSI")}
  ${row("MEREKA MEMBERONTAK", "dan Haiti merdeka", "s3:Mereka")}
  <div class="cd mega" data-at="s3:1804" data-fx="card"><b>1804</b></div>
  <div class="stamp" data-at="s4:terkucil" data-fx="stampc">TERKUCIL</div>
  ${row("TAK DIAKUI", "hampir tak ada negara mau berdagang", "s4:mengakui", "rd")}
</div>
<div class="p" data-in="s5" data-out="s5:Tuntutannya">
  ${kk("No. 05", "3 JULI 1825")}
  <div class="cd stat" data-at="s5:empat-0.5" data-fx="card"><b>${ct(14, "s5:empat-0.5", 0.45)}</b><span>kapal perang Prancis</span></div>
  <div class="cd stat rd" data-at="s5:lima-0.45" data-fx="card"><b>${ct(528, "s5:lima-0.45", 0.45)}</b><span>meriam</span></div>
</div>
<div class="p" data-in="s5:Tuntutannya" data-out="s6">
  ${kk("No. 05", "TUNTUTAN PRANCIS")}
  <div class="cd mega" data-at="s5:Tuntutannya" data-fx="card"><b>${ct(150, "s5:Tuntutannya", 0.8)}</b><small>juta franc</small></div>
  ${row("GANTI RUGI", "atas &ldquo;properti&rdquo; yang hilang, termasuk para budak", "s5:ganti", "rd")}
  ${row("IMBALANNYA", "pengakuan sebagai negara", "s5:imbalan")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("No. 06", "BUKU BESAR")}
  ${row("CICILAN PERTAMA", "dibayar dengan berutang", "s6:berutang")}
  <div class="cd stat" data-at="s6:diturunkan" data-fx="card"><small>1838 &middot; sisa jadi</small><b>${ct(60, "s6:diturunkan", 1.0)}</b><span>juta franc</span></div>
  <div class="stamp" data-at="s6:1883" data-fx="stampc">LUNAS 1883</div>
</div>
<div class="p" data-in="s7" data-out="s7:Tahun">
  ${kk("No. 07", "BUNGA BERJALAN")}
  ${row("PINJAMANNYA", "terus berbunga", "s7:berbunga")}
  <div class="cd mega" data-at="s7:1947" data-fx="card"><small>lunas</small><b>1947</b></div>
  <div class="note" data-at="s7:analisis" data-fx="fade">menurut analisis New York Times, 2022</div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  ${kk("No. 08", "2016")}
  ${row("PARLEMEN PRANCIS", "mencabut aturan tahun 1825", "s7:mencabut")}
  <div class="stamp" data-at="s7:tanpa" data-fx="stampc">TANPA GANTI RUGI</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  ${kk("No. 09", "PAMERAN AUDIRA")}
  <div class="cd h2">Kemerdekaan yang<br><em>dibayar mahal</em></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Menurut kamu, pantaskah utang seperti ini dikembalikan? Tulis pendapatmu dengan sopan di komentar.</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CARD};border:1px solid rgba(20,20,20,.18);border-radius:3px;box-shadow:0 22px 46px rgba(0,0,0,.55),0 2px 0 rgba(255,255,255,.5) inset}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:27px;line-height:1;letter-spacing:.2em;color:#E4CC92;background:${INK};padding:13px 22px 12px;border:1px solid ${GOLD};margin-bottom:22px;box-shadow:0 10px 24px rgba(0,0,0,.5)}
.kk i{font-style:italic;font-weight:400;letter-spacing:.06em;color:#BFA46A;border-right:1px solid ${GOLD};padding-right:16px}
.h1{display:inline-block;padding:18px 34px 20px;border-left:12px solid ${GOLD};font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:104px;line-height:.96;color:${INK}}
.h1 em,.h2 em{font-style:italic;color:${RED}}
.h2{display:inline-block;padding:16px 32px 18px;border-left:12px solid ${GOLD};font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:76px;line-height:1.0;color:${INK}}
.row{flex-direction:column;margin-top:18px;padding:14px 28px 16px;border-left:12px solid ${GOLD};max-width:860px;box-sizing:border-box}
.row b{display:block;font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:44px;line-height:1.1;letter-spacing:.04em;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:44px;line-height:1.1;color:#3b342c}
.row u{text-decoration:none;color:${BLUE};font-weight:700}
.row.rd{border-left-color:${RED}}
.mega,.stat{display:flex;align-items:baseline;gap:20px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:18px;padding:4px 32px 10px;border-left:12px solid ${GOLD}}
.mega b,.stat b{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-variant-numeric:lining-nums tabular-nums;font-size:150px;line-height:1.02;color:${INK}}
.stat b{font-size:118px}
.stat.rd{border-left-color:${RED}}.stat.rd b{color:${RED}}
.mega small,.stat small,.stat span{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:50px;color:#3b342c}
.note{display:inline-block;margin-top:18px;font-family:'IBM Plex Serif',Georgia,serif;font-style:italic;font-weight:400;font-size:33px;line-height:1.25;color:#EDE3CC;background:rgba(14,13,12,.84);border-left:4px solid ${GOLD};padding:10px 20px;max-width:820px}
.stamp{display:inline-block;margin-top:22px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:46px;letter-spacing:.14em;color:#F4E9D2;background:${RED};padding:12px 28px 10px;border:2px solid #E4CC92;transform:rotate(-2deg);box-shadow:0 12px 28px rgba(0,0,0,.55)}
.q{margin-top:24px;padding:18px 30px 20px;font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:42px;line-height:1.22;color:#F4EEE2;background:${INK};border-left:12px solid ${RED};max-width:860px;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP30_UTANG_HAITI",
  ep: "30", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.45, html, css, chipFont: BODY, chipColor: "#E4CC92",
  chip: "ILUSTRASI &middot; PAMERAN REKA ULANG",
  extraAt: ["s1:seratus", "s2:Karibia", "s2:Saint-Domingue", "s2:menguntungkan", "s3:lima", "s3:empat", "s3:ribu#2", "s3:memberontak",
    "s4:mengakui", "s4:Haiti#2", "s4:terkucil", "s5:empat", "s5:kapal", "s5:lima", "s5:meriam", "s5:seratus", "s5:termasuk", "s5:pengakuan",
    "s6:diturunkan", "s6:enam", "s6:1838", "s7:pinjaman", "s7:1947", "s7:tanpa", "s8:mahal", "s8:dibayar", "s8:Menurut", "s8:AUDIRA", "s3:budak", "s3:dari", "s3:penduduknya", "s3:1804", "s2:Haiti", "s5:Tuntutannya", "s6:berutang", "s6:1883", "s7:berbunga", "s7:analisis", "s7:Tahun", "s7:mencabut"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.35,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.55,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.32,ease:'power2.in'},b-.32)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'IBM Plex Serif',Georgia,serif;font-weight:600;font-size:60px;line-height:1.16;color:#F4EEE2;text-shadow:0 3px 0 #0c0b0a,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F4EEE2"},{color:"#E4C277",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4EEE2",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Utang Kemerdekaan Haiti", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
