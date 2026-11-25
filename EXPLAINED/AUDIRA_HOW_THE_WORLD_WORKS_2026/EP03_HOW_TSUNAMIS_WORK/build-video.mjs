// EP03 THE COLUMN. Nautical-chart annotations. The film's current runs left to right, the way the wave travels to the coast. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const FOAM = "#E9F6F7", INK = "#03121C", BUOY = "#FF6A3D", TEAL = "#5FD9DC";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="cd">HOW THE WORLD WORKS &middot; EP 03</div>
  <div class="h0">TSUNAMI</div>
  <div class="tl">Melintasi samudra secepat pesawat jet</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="cd">ZONA SUBDUKSI, ILUSTRASI</div>
  <div class="ln" data-at="s2:lempeng" data-fx="left"><b>LEMPENG SAMUDRA</b><span>menyusup ke bawah lempeng benua</span></div>
  <div class="note" data-at="s2:Tegangan" data-fx="fade">Tegangan menumpuk di patahan</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="cd">PERPINDAHAN VERTIKAL</div>
  <div class="ln" data-at="s3:kolom" data-fx="left"><b>KOLOM AIR TERDORONG</b><span>dari dasar sampai permukaan</span></div>
  <div class="note" data-at="s3:menyebar" data-fx="fade">Gelombang menyebar ke segala arah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="cd">OMBAK vs TSUNAMI</div>
  <div class="ln" data-at="s4:Ombak" data-fx="left"><b>OMBAK ANGIN</b><span>hanya di permukaan</span></div>
  <div class="ln alt" data-at="s4:Tsunami" data-fx="left"><b>TSUNAMI</b><span>seluruh kedalaman, jarak puncak ratusan km</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="cd">LAUT DALAM &middot; c = &radic;(g &times; h)</div>
  <div class="nums"><div data-at="s5:4.600" data-fx="pop"><b class="nb">4.600 m</b><span>kedalaman</span></div><div data-at="s5:765" data-fx="pop"><b class="nb">765 km/j</b><span>kecepatan</span></div></div>
  <div class="ln" data-at="s5:tingginya" data-fx="left"><b class="nb">&lt; 1 M</b><span>tinggi di laut dalam, umumnya</span></div>
  <div class="srcl" data-at="s5:4.600" data-fx="fade">Tinggi gelombang pada penampang diperbesar</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="cd">PENDANGKALAN &middot; TIDAK BERSKALA</div>
  <div class="nums"><div data-at="s6:melambat" data-fx="pop"><b class="nb">30&ndash;50</b><span>km/jam di pantai</span></div><div data-at="s6:meninggi" data-fx="pop"><b class="up">&#8593; TINGGI</b><span>jarak memendek</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="cd">RUN-UP &middot; TIDAK BERSKALA</div>
  <div class="ln" data-at="s7:Sumatra" data-fx="left"><b class="nb">&plusmn;50 M</b><span>maksimum, Sumatra utara, 2004 (NOAA)</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:berseri" data-fx="left">GELOMBANG BERSERI</div>
  <div class="ln" data-at="s8:surut" data-fx="left"><b>LAUT SURUT?</b><span>segera lari ke tempat tinggi</span></div>
  <div class="srcl" data-at="s8:surut" data-fx="fade">Sumber: NOAA NWS, NOAA JetStream, tsunami.gov</div>
</div>`;

const css = `
.cd{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;letter-spacing:.03em;color:${FOAM};border-bottom:3px solid ${BUOY};padding:2px 2px 6px;margin-bottom:14px;text-shadow:0 1px 8px rgba(0,0,0,.9)}
.h0{font-family:Montserrat,sans-serif;font-weight:900;font-size:152px;line-height:1;letter-spacing:-.03em;color:#fff;text-shadow:0 4px 34px rgba(0,30,50,.65)}
.h2{font-family:Montserrat,sans-serif;font-weight:900;font-size:76px;line-height:1.05;letter-spacing:-.02em;color:#fff;text-shadow:0 3px 22px rgba(0,20,40,.9);margin-bottom:8px}
.tl{font-family:Montserrat,sans-serif;font-weight:700;font-size:39px;color:#fff;text-shadow:0 2px 14px rgba(0,20,40,.9);margin-top:6px}
.ln{background:rgba(3,18,28,.74);border-left:7px solid ${TEAL};padding:12px 18px;margin-top:10px}
.ln.alt{border-left-color:${BUOY}}
.ln b{display:block;font-family:Montserrat,sans-serif;font-weight:900;font-size:50px;line-height:1.08;letter-spacing:-.01em;color:#fff}
.ln span{display:block;font-family:Montserrat,sans-serif;font-weight:700;font-size:31px;line-height:1.16;color:${TEAL}}
.nums{display:flex;gap:12px}
.nums>div{flex:1;background:rgba(3,18,28,.74);border-top:6px solid ${BUOY};padding:12px 16px}
.nums b{display:block;font-family:Montserrat,sans-serif;font-weight:900;font-size:62px;line-height:1.06;letter-spacing:-.02em;color:#fff}
.nums b.up{color:${BUOY}}
.nums span{display:block;font-family:Montserrat,sans-serif;font-weight:700;font-size:30px;color:${TEAL}}
.note{font-family:Montserrat,sans-serif;font-weight:700;font-size:33px;line-height:1.16;color:#fff;margin-top:12px;text-shadow:0 2px 12px #000}
.srcl{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:25px;line-height:1.2;color:${FOAM};margin-top:10px;text-shadow:0 1px 8px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: INK, vig: 0.34, grain: 0.04, capfloor: 0.22, html, css,
  extraAt: ["s2:lepas", "s3:Gempa", "s3:kolom", "s3:menyebar", "s4:Ombak", "s4:Tsunami", "s5:Kecepatannya", "s5:Kapal", "s5:765", "s6:Mendekati", "s6:melambat", "s6:meninggi", "s7:darat", "s7:Sumatra", "s8:berseri", "s8:surut", "s2:lempeng"],
  // Current runs right: a panel slides in from the left and leaves to the right, like the wave.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:-110,opacity:0},{x:0,opacity:1,duration:.34,ease:'power4.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:110,opacity:0,duration:.2,ease:'power3.in'},b-.2)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Montserrat,sans-serif;font-weight:900;font-size:56px;line-height:1.28;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 12px rgba(0,10,20,.95),0 0 3px #000}
.w{display:inline-block;padding:0 5px;position:relative}`,
// Active word swells like a passing wave: buoy orange, lifting then settling.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0},{color:"#FF8C5C",y:-8,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,duration:.16,ease:"sine.inOut"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-26,opacity:0},{x:0,opacity:1,duration:.13,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Column", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
