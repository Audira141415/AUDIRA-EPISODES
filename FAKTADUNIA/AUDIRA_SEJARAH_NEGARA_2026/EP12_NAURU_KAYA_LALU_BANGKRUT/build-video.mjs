// EP12 NAURU: KAYA LALU BANGKRUT. DATAPHYSICAL: one museum data sculpture on a walnut plinth (see world3d.js).
// Panels are gallery placards that slide in along a brass rail from the left and slide out to the right.
// Captions sit on a dark plate with a brass active word. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#1C1D20", INK = "#1C1D20", BRASS = "#D2B07A", ORANGE = "#D4521C", ALU = "#C8CCD1", TEAL = "#9FD3D6", WAL = "#2A1B14", CARD = "#ECE9E2";
const HEAD = `"IBM Plex Sans Condensed",sans-serif`, MONO = `"IBM Plex Mono",monospace`;

const row = (b, s, a, cls = "") => `<div class="row ${cls}" data-at="${a}" data-fx="slide"><b>${b}</b><span>${s}</span></div>`;
const chip = (txt, a, cls = "") => `<i class="ch ${cls}" data-at="${a}" data-fx="slide" data-d="inline-block">${txt}</i>`;

const html = `<div id="rail"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 12</div>
  <div class="h1">Kaya raya,<br>lalu <em>bangkrut</em></div>
  ${row("TERKAYA", "warganya pernah termasuk<br>orang terkaya di dunia", "s1:terkaya")}
  <div class="duo">${chip("BANK TUTUP", "s1:tutup", "or")}${chip("uang tunai diterbangkan dari Australia", "s1:diterbangkan", "dk")}</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">PULAU KARANG &middot; SAMUDRA PASIFIK</div>
  <div class="h2">Nauru</div>
  <div class="big" data-at="s2:21" data-fx="slide"><b><b class="ct" data-from="0" data-to="21" data-a="s2:21" data-d="1">0</b> km&sup2;</b><span>luas seluruh negara</span></div>
  ${row("KE-3", "negara terkecil di dunia", "s2:ketiga")}
</div>
<div class="p" data-in="s3" data-out="s3:Sejak">
  <div class="kk">PENEMUAN</div>
  <div class="yr">1900</div>
  ${row("FOSFAT", "bahan pupuk yang sangat berharga", "s3:fosfat")}
</div>
<div class="p" data-in="s3:Sejak" data-out="s4">
  <div class="kk">TAMBANG DIBUKA &middot; DIKAPALKAN KE LUAR</div>
  <div class="yr">1906</div>
  <div class="lb" data-at="s3:bawah" data-fx="slide" data-d="block">di bawah kendali:</div>
  <div class="chips">${chip("Jerman", "s3:Jerman")}${chip("Australia", "s3:Australia")}${chip("Inggris", "s3:Inggris")}${chip("Selandia Baru", "s3:Selandia")}</div>
</div>
<div class="p" data-in="s4" data-out="s4:Uang">
  <div class="kk">31 JANUARI 1968</div>
  <div class="yr or">1968</div>
  <div class="h3" data-at="s4:merdeka" data-fx="slide" data-d="inline-block">Nauru merdeka</div>
  ${row("1970", "tambang fosfat dikelola sendiri", "s4:kemudian")}
</div>
<div class="p" data-in="s4:Uang" data-out="s5">
  <div class="kk">UANG MENGALIR DERAS</div>
  <div class="h2 sm">Fosfat jadi kekayaan</div>
  ${chip("termasuk terkaya di dunia", "s4:terkaya", "or")}
</div>
<div class="p" data-in="s5" data-out="s5:Yang">
  <div class="kk">HAMPIR SEABAD DITAMBANG</div>
  <div class="h2 sm">Bagian tengah pulau<br>dikeruk</div>
</div>
<div class="p" data-in="s5:Yang" data-out="s6">
  <div class="kk">YANG TERSISA</div>
  <div class="h2 sm">Tiang-tiang<br>batu karang</div>
  ${chip("tak bisa ditanami", "s5:ditanami", "dk")}
</div>
<div class="p" data-in="s6" data-out="s6:Dana">
  <div class="kk">TAHUN 1990-AN</div>
  <div class="h2 sm">Cadangan utama<br>habis</div>
</div>
<div class="p" data-in="s6:Dana" data-out="s6:Tahun">
  <div class="kk">DANA PERWALIAN UNTUK MASA DEPAN</div>
  ${row("TERGERUS", "belanja besar", "s6:tergerus")}
  ${row("+", "investasi yang buruk", "s6:investasi")}
</div>
<div class="p" data-in="s6:Tahun" data-out="s7">
  <div class="kk">2006</div>
  <div class="h2 sm">Bank Nauru<br>tutup</div>
  ${chip("ekonomi serba tunai", "s6:tutup", "dk")}
</div>
<div class="p" data-in="s7" data-out="s7:Tahun">
  <div class="kk">PEMASUKAN UTAMA KINI</div>
  ${row("1", "izin menangkap ikan", "s7:izin")}
  ${row("2", "pusat penahanan imigran<br><i>dibiayai Australia</i>", "s7:pusat")}
  <div class="nt" data-at="s7:pusat" data-fx="slide" data-d="block">porsi irisan tidak berskala</div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  <div class="kk">MEI &ndash; JUNI 2026</div>
  <div class="h2 sm"><s>Nauru</s></div>
  <div class="h2 sm or" data-at="s7:Republik" data-fx="slide" data-d="inline-block">Republik Naoero</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h1 sm">Kaya dari tanah sendiri,<br>lalu <em>tanahnya habis</em></div>
  <div class="q" data-at="s8:Menurut" data-fx="slide" data-d="block">Apa pelajarannya untuk negara yang kaya sumber daya alam?</div>
</div>`;

const css = `
#rail{position:absolute;left:0;right:0;top:222px;height:4px;background:linear-gradient(90deg,rgba(210,176,122,0),${BRASS} 12%,${BRASS} 88%,rgba(210,176,122,0));opacity:.75;z-index:9}
.p{color:${INK}}
.kk{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:25px;letter-spacing:.08em;color:${BRASS};background:${INK};padding:8px 16px;margin-bottom:10px;border-left:6px solid ${BRASS}}
.h1{display:inline-block;background:${CARD};padding:12px 26px 16px;border-top:6px solid ${BRASS};box-shadow:0 18px 36px rgba(0,0,0,.55);font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:92px;line-height:1.0;color:${INK}}
.h1 em{font-style:normal;color:${ORANGE}}
.h1.sm{font-size:70px;line-height:1.05}
.h2{display:inline-block;background:${CARD};padding:8px 24px 12px;border-top:6px solid ${BRASS};box-shadow:0 18px 36px rgba(0,0,0,.55);font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:96px;line-height:1.0;color:${INK}}
.h2.sm{font-size:66px;line-height:1.05}
.h2 s{text-decoration-thickness:6px;text-decoration-color:${ORANGE};color:#6B6E73}
.h2.or{display:inline-block;margin-top:10px;color:${ORANGE}}
.h3{display:inline-block;margin-top:10px;background:${CARD};padding:6px 22px 10px;box-shadow:0 14px 30px rgba(0,0,0,.5);font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:54px;color:${INK}}
.yr{display:inline-block;background:${CARD};padding:0 24px 4px;border-top:6px solid ${BRASS};box-shadow:0 18px 36px rgba(0,0,0,.55);font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:128px;line-height:1.08;color:${INK};letter-spacing:-.02em}
.yr.or{color:${ORANGE}}
.row{display:flex;gap:20px;align-items:center;margin-top:12px;padding:10px 24px 12px;background:${CARD};border-left:10px solid ${BRASS};box-shadow:0 14px 30px rgba(0,0,0,.5);width:fit-content;max-width:880px}
.row>b{flex:none;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:44px;line-height:1;color:${ORANGE}}
.row span{font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:600;font-size:36px;line-height:1.15;color:${INK}}
.row span i{font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:26px;color:#5A5E64}
.big{display:flex;align-items:baseline;gap:22px;margin-top:12px;padding:4px 26px 10px;background:${CARD};border-left:12px solid ${ORANGE};box-shadow:0 14px 30px rgba(0,0,0,.5);width:fit-content}
.big>b{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:112px;line-height:1.05;color:${ORANGE};white-space:nowrap}
.big>b b{font-weight:700}
.big span{font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:600;font-size:34px;color:${INK}}
.duo,.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;max-width:900px}
.ch{font-style:normal;font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:38px;padding:8px 20px 10px;background:${CARD};color:${INK};box-shadow:0 12px 26px rgba(0,0,0,.5);border-bottom:5px solid ${BRASS}}
.ch.or{background:${ORANGE};color:#F6EFE6;border-bottom-color:#8E3310}
.ch.dk{background:${INK};color:${CARD};border:2px solid ${BRASS};font-weight:600;font-size:34px}
.lb{margin-top:12px;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:27px;color:${CARD};background:rgba(28,29,32,.85);padding:6px 14px;width:fit-content}
.nt{margin-top:10px;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:23px;color:${ALU};background:rgba(28,29,32,.85);padding:4px 12px;width:fit-content}
.q{margin-top:14px;max-width:860px;font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:46px;line-height:1.12;padding:14px 24px 16px;color:${CARD};background:${INK};border-left:10px solid ${ORANGE};box-shadow:0 14px 30px rgba(0,0,0,.55)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP12_NAURU_KAYA_LALU_BANGKRUT",
  ep: "12", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0, html, css, chipFont: `"IBM Plex Mono",monospace`, chipColor: ALU,
  chip: "PATUNG DATA &middot; ILUSTRASI, SKALA KUALITATIF",
  extraAt: ["s1:terkaya", "s1:tutup", "s1:diterbangkan", "s2:21", "s3:fosfat", "s3:1906", "s3:Sejak", "s3:dikapalkan", "s3:Jerman",
    "s4:1968", "s4:kemudian", "s4:Uang", "s4:deras", "s4:terkaya", "s5:mengeruk", "s5:Yang", "s6:habis", "s6:sembilan", "s6:Dana", "s6:tergerus",
    "s6:investasi", "s6:buruk", "s6:Tahun", "s6:2006", "s7:izin", "s7:pusat", "s7:Australia", "s7:2026", "s7:berganti", "s7:Naoero", "s8:habis", "s8:Menurut"],
  fxExtra: `slide:(e,t)=>{const d=e.dataset.d||(e.classList.contains('row')||e.classList.contains('big')?'flex':'inline-block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-70},{opacity:1,x:0,duration:.4,ease:'power3.out',immediateRender:false},t);},`,
  // placards slide in from the left along the rail and slide off to the right
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,x:-1100},{x:0,duration:.55,ease:'power3.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:1100,duration:.36,ease:'power2.in'},b-.36)`,
});

// Captions: join any {display|spoken} split words back for the strip.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:920px;text-align:center;font-family:"IBM Plex Sans Condensed",sans-serif;font-weight:700;font-size:60px;line-height:1.14;word-spacing:.05em;color:#ECE9E2;padding:12px 30px 16px;background:rgba(28,29,32,.94);border-top:4px solid ${BRASS};box-shadow:0 14px 30px rgba(0,0,0,.55)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#ECE9E2"},{color:"${BRASS}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#ECE9E2",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nauru Kaya lalu Bangkrut", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
