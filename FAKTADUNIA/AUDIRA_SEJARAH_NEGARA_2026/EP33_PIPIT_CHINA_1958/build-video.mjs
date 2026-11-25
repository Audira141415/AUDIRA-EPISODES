// EP33 PIPIT CHINA 1958: RISOFORGE. A risograph zine whose printed paper layers stand up as a pop-up world: three spot
// inks (fluoro pink, blue, yellow) overprint by multiply blending, with halftone screens and jittering misregistration.
// Sparrows, locusts, rice, gong-beaters (tiny anonymous silhouettes) are riso cut-outs. The batch device is a chain of
// printed tokens (PIPIT -> SERANGGA -> BELALANG -> SAWAH -> PANEN -> KELAPARAN) that grows link by link in the lower band.
// Famine is stated as calm text only. Panels are riso paper slips. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#EFE6D2", INK = "#1D1A2A", PINK = "#FF48B0", BLUE = "#0078BF", YEL = "#FFE800", NAVY = "#0B4C86";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const chip = (txt, a, cls = "") => `<i class="ch ${cls}" data-at="${a}" data-fx="stampc">${txt}</i>`;

let html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@600;700;800&family=Space+Mono:wght@700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 33</div>
  <div class="h1">PERANG<br>MELAWAN PIPIT</div>
  <div class="chips">${chip("CHINA 1958", "s1:pipit", "bl")}${chip("MENANG&hellip;", "s1:menang")}${chip("KALAH OLEH BELALANG", "s1:belalang", "pk")}</div>
</div>
<div class="p" data-in="s2" data-out="s2:Pipit">
  <div class="kk">CHINA &middot; 1958</div>
  ${row("KAMPANYE EMPAT HAMA", "resmi dimulai 12 Februari 1958", "s2:Kampanye")}
  <div class="chips">${chip("TIKUS", "s2:tikus", "bl")}${chip("LALAT", "s2:lalat", "bl")}${chip("NYAMUK", "s2:nyamuk", "bl")}${chip("PIPIT", "s2:pipit", "pk")}</div>
</div>
<div class="p" data-in="s2:Pipit" data-out="s3">
  <div class="kk">TUDUHANNYA</div>
  <div class="cd mega" data-at="s2:dua" data-fx="card"><b>&plusmn; 2 KG</b><small>GABAH<br>PER EKOR / TAHUN</small></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kk">SEJAK 1956</div>
  ${row("AHLI BIOLOGI MENOLAK", "termasuk Zhu Xi", "s3:ahli")}
  <div class="cd q" data-at="s3:Pipit" data-fx="card">&ldquo;Pipit bukan hama.&rdquo;</div>
  <div class="chips">${chip("TIDAK DIDENGAR", "s3:tidak", "pk")}</div>
</div>
<div class="p" data-in="s4" data-out="s4:Sarang">
  <div class="kk">MARKAS PENUMPASAN PIPIT</div>
  ${row("GONG &amp; PANCI DIPUKUL", "pipit tak bisa hinggap", "s4:memukul")}
  ${row("SAMPAI JATUH KELELAHAN", "", "s4:jatuh", "pk")}
</div>
<div class="p" data-in="s4:Sarang" data-out="s5">
  <div class="kk">SARANG &amp; TELUR</div>
  ${row("SARANG DIRUSAK", "telurnya dipecahkan", "s4:Sarang", "pk")}
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kk">HASIL TAHUN 1958</div>
  <div class="cd mega" data-at="s5:sedikitnya" data-fx="card"><small>SEDIKITNYA</small><b class="ct" data-from="0" data-to="200" data-a="s5:sedikitnya" data-d="1.2">0</b><small>JUTA<br>PIPIT</small></div>
  <div class="note" data-at="s5:1958" data-fx="card">Sumber lain: sekitar 2,11 miliar. Angka resmi diragukan.</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">MASALAHNYA</div>
  ${row("PIPIT JUGA MAKAN SERANGGA", "bukan cuma gabah", "s6:serangga")}
  ${row("BELALANG TANPA LAWAN", "", "s6:belalang", "pk")}
  <div class="chips">${chip("MENYERBU SAWAH", "s6:menyerbu", "pk")}</div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  <div class="kk">MARET 1960</div>
  ${row("TSO-HSIN CHENG", "ahli burung: pipit juga makan serangga", "s7:Tso-hsin", "tag")}
  ${row("PIPIT DICORET DARI DAFTAR", "diganti kutu busuk", "s7:dicoret", "pk")}
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  <div class="kk">KERUSAKAN SUDAH TERJADI</div>
  <div class="chips">${chip("KEKERINGAN", "s7:kekeringan", "yl")}${chip("BANJIR", "s7:banjir", "bl")}${chip("KEBIJAKAN KELIRU", "s7:kebijakan")}${chip("KAMPANYE PIPIT", "s7:kampanye", "pk")}</div>
  ${row("KELAPARAN BESAR CHINA", "1959&ndash;1961 &middot; perkiraan 15&ndash;55 juta jiwa, dari semua sebab", "s7:Kelaparan", "dk")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  <div class="h2">Setiap makhluk<br>adalah mata rantai</div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Hewan apa yang sering dianggap hama, padahal punya peran penting? Tulis di komentar!</div>
</div>`;

const paper = `#F6F0E2`;
const css = `
.cd{position:relative;background:${paper};border:2px dashed rgba(29,26,42,.55);box-shadow:9px 9px 0 rgba(0,120,191,.82)}
.kk{display:inline-block;font-family:'Space Mono',monospace;font-weight:700;font-size:28px;line-height:1.1;letter-spacing:.12em;color:${INK};background:${YEL};padding:10px 20px 8px;margin-bottom:20px;box-shadow:6px 5px 0 rgba(255,72,176,.75)}
.h1{font-family:'Archivo Black',Arial,sans-serif;font-size:104px;line-height:.96;color:${NAVY};text-shadow:6px 5px 0 rgba(255,72,176,.9);letter-spacing:-.01em}
.h2{display:inline-block;font-family:'Archivo Black',Arial,sans-serif;font-size:70px;line-height:1.02;color:${NAVY};text-shadow:5px 4px 0 rgba(255,72,176,.9);background:rgba(246,240,226,.9);padding:16px 26px 14px;box-shadow:9px 9px 0 rgba(255,232,0,.95)}
.chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:22px;align-items:center;max-width:910px}
.ch{font-style:normal;font-family:'Archivo Black',Arial,sans-serif;font-size:40px;line-height:1.1;padding:10px 22px 8px;color:${INK};background:${paper};border:3px solid ${INK};box-shadow:6px 6px 0 rgba(0,120,191,.85)}
.ch.pk{background:${PINK};color:#fff;border-color:${PINK};box-shadow:6px 6px 0 rgba(0,120,191,.85)}
.ch.bl{background:${BLUE};color:#fff;border-color:${BLUE};box-shadow:6px 6px 0 rgba(255,72,176,.8)}
.ch.yl{background:${YEL};color:${INK};border-color:${YEL};box-shadow:6px 6px 0 rgba(255,72,176,.8)}
.row{margin-top:18px;padding:14px 28px 16px;border-left:18px solid ${BLUE};max-width:900px;box-sizing:border-box}
.row b{display:block;font-family:'Archivo Black',Arial,sans-serif;font-size:48px;line-height:1.08;color:${NAVY}}
.row span{display:block;margin-top:6px;font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:36px;line-height:1.2;color:${INK}}
.row.pk{border-left-color:${PINK}}.row.tag{border-left-color:${YEL}}
.row.dk{background:${INK};border:0;border-left:18px solid ${PINK};box-shadow:9px 9px 0 rgba(255,72,176,.8)}
.row.dk b{color:#F6F0E2}.row.dk span{color:#F2DDE9}
.mega{display:flex;align-items:center;gap:24px;width:max-content;padding:6px 32px 10px;margin-top:14px}
.mega b{font-family:'Archivo Black',Arial,sans-serif;font-size:128px;line-height:1.05;color:${PINK};text-shadow:6px 5px 0 rgba(0,120,191,.85)}
.mega small{font-family:'Archivo Black',Arial,sans-serif;font-size:34px;line-height:1.05;color:${NAVY}}
.note{display:inline-block;margin-top:18px;max-width:880px;font-family:Archivo,Arial,sans-serif;font-weight:700;font-size:32px;line-height:1.22;color:${INK};background:rgba(246,240,226,.94);border-left:10px solid ${YEL};padding:10px 20px}
.q{display:inline-block;margin-top:20px;padding:16px 28px;font-family:'Archivo Black',Arial,sans-serif;font-size:46px;line-height:1.14;color:${NAVY};max-width:900px;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP33_PIPIT_CHINA_1958",
  ep: "33", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0, html, css, chipFont: "'Space Mono',monospace", chipColor: INK,
  chip: "ILUSTRASI &middot; CETAK RISO ORISINAL",
  extraAt: ["s1:perang", "s1:burung", "s1:pipit", "s1:menang", "s1:kalah", "s1:belalang", "s2:China", "s2:1958", "s2:Kampanye", "s2:tikus", "s2:lalat",
    "s2:nyamuk", "s2:pipit", "s2:Pipit", "s2:dua", "s2:gabah", "s3:1956", "s3:ahli", "s3:Pipit", "s3:bukan", "s3:tidak", "s3:suara", "s3:didengar", "s4:markas",
    "s4:Warga", "s4:memukul", "s4:gong", "s4:panci", "s4:hinggap", "s4:jatuh", "s4:Sarang", "s4:telurnya", "s4:dipecahkan", "s5:sedikitnya", "s5:juta",
    "s5:1958", "s5:saja", "s6:pipit", "s6:gabah", "s6:serangga", "s6:Tanpa", "s6:belalang", "s6:berkembang", "s6:menyerbu", "s6:sawah", "s7:1960",
    "s7:Tso-hsin", "s7:peran", "s7:dicoret", "s7:kutu", "s7:Tapi", "s7:kerusakan", "s7:kekeringan", "s7:banjir", "s7:kebijakan", "s7:kampanye",
    "s7:Kelaparan", "s8:alam", "s8:musuh", "s8:teman", "s8:Setiap", "s8:makhluk", "s8:rantai", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.mega')?'flex':e.matches('.q,.note')?'inline-block':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-26,y:10},{opacity:1,x:0,y:0,duration:.4,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.5,rotation:-4,opacity:0},{scale:1,rotation:0,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-40},{opacity:1,x:0,duration:.4,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:40,duration:.22,ease:'power2.in'},b-.22)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,Arial,sans-serif;font-weight:800;font-size:62px;line-height:1.14;color:#1D1A2A;text-shadow:0 0 10px rgba(246,240,226,1),0 0 4px rgba(246,240,226,1),0 0 2px rgba(246,240,226,1)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#1D1A2A"},{color:"#E0208A",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#1D1A2A",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,x:-14},{opacity:1,x:0,duration:.2,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pipit China 1958", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
