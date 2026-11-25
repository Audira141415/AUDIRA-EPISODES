// EP31 TIKUS HANOI 1902: SKETCHFORGE. A pencil-on-cream diorama of Hanoi with Doumer's sewer cut open beneath it,
// the bounty office in front (tray of tails, 1-sen coins, ledger) and a rat farm on the edge of the page.
// A chain of paper tags grows link by link as each step of the rat bounty is named, then folds into a loop.
// Panels are sketchbook notes: typewriter kickers, handwritten headings, cream cards, one vermilion accent.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ACC = "#D9472B", ACCD = "#B5361E", INK = "#2E2C2B", PAPER = "#F1E8D4", DARK = "#1E1D20", BG = "#2A2729";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Courier+Prime:wght@400;700&display=block">
<div class="pre"><span style="font-family:Kalam,cursive;font-weight:700">HANOI 1902</span><span style="font-family:Kalam,cursive;font-weight:400">tikus</span><span style="font-family:'Courier Prime',monospace;font-weight:700">AUDIRA</span><span style="font-family:'Courier Prime',monospace;font-weight:400">a</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  ${kk("EP 31", "FAKTA SEJARAH NEGARA")}
  <div class="ttl"><div class="h1">Hadiah<br><em>Ekor Tikus</em></div><div class="sub">HANOI &middot; 1902</div></div>
  <div class="chips"><i class="ch" data-at="s1:membayar" data-fx="stampc">1 EKOR = 1 SEN</i><i class="ch2" data-at="s1:makin" data-fx="stampc">TIKUS MAKIN BANYAK</i></div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3">
  ${kk("01", "HANOI, 1902")}
  ${row("Ibu kota baru Indochina Prancis", "dipindah dari Saigon tahun itu", "s2:ibu")}
  ${row("Gubernur Jenderal Paul Doumer", "membangun got modern", "s2:Gubernur")}
  ${row("Saluran &gt; 19 km di bawah kota", "", "s2:lebih", "ac")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "GOT = JALAN TOL TIKUS")}
  ${row("Tanpa pemangsa", "tikus berkembang biak di got", "s3:Tanpa")}
  ${row("Naik ke Kawasan Eropa", "rumah-rumah elite kolonial", "s3:naik")}
  ${row("Dunia dilanda wabah pes", "disebarkan kutu tikus", "s3:wabah", "ac")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "APRIL 1902 &middot; PEMBURU BAYARAN")}
  <div class="cd row" data-at="s4:melaporkan" data-fx="card"><b><span class="ct" data-from="0" data-to="20112" data-a="s4:melaporkan" data-d="${(at("s4:dua") - at("s4:melaporkan") - 0.05).toFixed(2)}">20.112</span> tikus sehari</b><span>laporan 21 Juni 1902</span></div>
  ${row("Tapi tikusnya tidak berkurang", "", "s4:tidak", "ac")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "RENCANA BARU")}
  ${row("Siapa pun boleh berburu", "", "s5:Siapa")}
  ${row("1 sen per tikus", "", "s5:satu", "ac")}
  ${row("Bukti: cukup ekornya", "supaya kantor tidak penuh bangkai", "s5:Buktinya")}
</div>
<div class="p" data-in="s6" data-out="s6:Ada">
  ${kk("05", "PEMANDANGAN ANEH")}
  ${row("Tikus hidup tanpa ekor", "", "s6:hidup")}
  ${row("Ekor dipotong, tikus dilepas", "", "s6:memotong", "ac")}
  ${row("Beranak = ekor baru", "", "s6:beranak")}
</div>
<div class="p" data-in="s6:Ada" data-out="s7">
  ${kk("05", "BISNIS EKOR")}
  ${row("Tikus diselundupkan", "dari luar kota", "s6:menyelundupkan")}
  ${row("Peternakan tikus", "di pinggiran Hanoi", "s6:peternakan", "ac")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "HADIAH DIBATALKAN")}
  ${row("Tikus lebih banyak dari sebelumnya", "", "s7:lebih", "ac")}
  <div class="cd row" data-at="s7:menjangkiti" data-fx="card"><b>1903: <span class="ct" data-from="0" data-to="159" data-a="s7:menjangkiti" data-d="${(at("s7:159") - at("s7:menjangkiti") - 0.05).toFixed(2)}">159</span> orang terjangkit pes</b></div>
  <div class="cd row gy" data-at="s7:110" data-fx="card"><b>110 meninggal</b><span>sebagian besar warga Vietnam</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "EFEK TIKUS")}
  <div class="cd q" data-at="s8:kalau" data-fx="card">&ldquo;Kalau yang dibayar adalah buktinya, orang akan memproduksi buktinya.&rdquo;<span>istilah sejarawan Michael G. Vann</span></div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Aturan apa di sekitar kita yang mirip seperti ini? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:${PAPER};border-radius:3px;box-shadow:0 10px 26px rgba(0,0,0,.42)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:26px;letter-spacing:.1em;color:#F3EBDA;margin-bottom:16px;padding:7px 18px 7px 7px;background:rgba(30,29,32,.9);border-left:8px solid ${ACC}}
.kk i{font-style:normal;background:${ACC};color:#fff;padding:3px 10px}
.ttl{display:inline-block;background:rgba(30,29,32,.84);border-left:12px solid ${ACC};padding:14px 30px 18px 26px}
.h1{font-family:Kalam,'Comic Sans MS',cursive;font-weight:700;font-size:120px;line-height:.98;color:#F7F1E3}
.h1 em{font-style:normal;color:#FF7A5C}
.sub{margin-top:8px;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:34px;letter-spacing:.18em;color:#E8DCC2}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px;align-items:center}
.ch,.ch2{font-style:normal;font-family:Kalam,'Comic Sans MS',cursive;font-weight:700;font-size:52px;line-height:1;padding:12px 24px 6px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.ch{color:${INK};background:${PAPER};border:4px solid ${INK}}.ch2{color:#fff;background:${ACC};border:4px solid ${ACCD}}
.row{flex-direction:column;margin-top:14px;padding:10px 24px 10px 22px;border-left:14px solid ${INK};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:Kalam,'Comic Sans MS',cursive;font-weight:700;font-size:52px;line-height:1.08;color:${INK}}
.row span{display:block;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:25px;line-height:1.3;color:#5A5652}
.row b span{display:inline;font:inherit;color:inherit}
.row.ac{border-left-color:${ACC}}.row.ac b{color:${ACCD}}
.row.gy{border-left-color:#8A847C}.row.gy b{color:#4A4643}
.q{flex-direction:column;margin-top:6px;padding:16px 28px 16px;font-family:Kalam,'Comic Sans MS',cursive;font-weight:700;font-size:56px;line-height:1.1;color:${INK};border-left:14px solid ${ACC};max-width:880px}
.q span{display:block;margin-top:10px;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:24px;color:#5A5652}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP31_TIKUS_HANOI_1902",
  ep: "31", bg: BG, vig: 0.34, grain: 0.05, capfloor: 0.0, html, css, chipFont: `'Courier Prime','Courier New',monospace`, chipColor: "#F3EBDA",
  chip: "ILUSTRASI SKETSA &middot; BUKAN FOTO ARSIP",
  extraAt: ["s1:membayar", "s1:tikus", "s1:dibunuh", "s1:Hasilnya", "s1:banyak",
    "s2:Ini", "s2:Prancis", "s2:Gubernur", "s2:saluran", "s2:pembuangan", "s2:lebih",
    "s3:tol", "s3:Tanpa", "s3:berkembang", "s3:biak", "s3:naik", "s3:mewah", "s3:Padahal", "s3:wabah", "s3:kutu",
    "s4:pemburu", "s4:turun", "s4:got", "s4:satu", "s4:melaporkan", "s4:dua", "s4:sehari", "s4:Tapi",
    "s5:Siapa", "s5:satu", "s5:sen", "s5:Buktinya", "s5:bangkai",
    "s6:hidup", "s6:Pemburu", "s6:memotong", "s6:ekornya", "s6:melepas", "s6:beranak", "s6:Ada", "s6:menyelundupkan", "s6:Bahkan", "s6:peternakan",
    "s7:dibatalkan", "s7:dan", "s7:tikusnya", "s7:lebih", "s7:Tahun", "s7:menjangkiti", "s7:159", "s7:110",
    "s8:Sejarawan", "s8:kalau", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,y:26,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.38,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-40},{opacity:1,x:0,duration:.38,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:30,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Kalam,'Comic Sans MS',cursive;font-weight:700;font-size:74px;line-height:1.05;color:#fff;-webkit-text-stroke:10px ${DARK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.7)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"#FF7A5C",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tikus Hanoi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
