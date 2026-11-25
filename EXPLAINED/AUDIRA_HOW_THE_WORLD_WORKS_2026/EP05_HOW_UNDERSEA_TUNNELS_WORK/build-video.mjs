// EP05 THE RING. Site-signage panels, hazard-yellow accents, a circular iris on panel entry to echo the bore. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const YEL = "#F2B90F", INK = "#0B0A08", SEA = "#6FE0E3", CON = "#E7E3D9";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="sg">HOW THE WORLD WORKS &middot; EP 05</div>
  <div class="h0">TEROWONGAN<br>BAWAH LAUT</div>
  <div class="tl">Kenapa air tidak masuk?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="sg">TEKANAN AIR</div>
  <div class="vv" data-at="s2:sepuluh" data-fx="left"><b class="nb">&plusmn;10 M</b><span>turun = tambah 1 atmosfer (NOAA)</span></div>
  <div class="vv" data-at="s2:75" data-fx="left"><b class="nb">75 M &#8594; +7 ATM</b><span>perhitungan untuk kedalaman Terowongan Channel</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="sg">SURVEI GEOLOGI, ILUSTRASI</div>
  <div class="vv" data-at="s3:kapur" data-fx="left"><b>KAPUR MARL</b><span>kedap, kuat, mudah digali. Channel Tunnel</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="sg">TUNNEL BORING MACHINE</div>
  <div class="vv" data-at="s4:pemotongnya" data-fx="left"><b>KEPALA PEMOTONG</b><span>berputar, mengikis batuan</span></div>
  <div class="vv" data-at="s4:tekanan" data-fx="left"><b>TEKANAN MUKA</b><span>menahan tanah dan air di depan</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="sg">LAPISAN SEGMEN</div>
  <div class="vv" data-at="s5:segmen" data-fx="left"><b>BETON PRACETAK</b><span>tebal &plusmn;20&ndash;30 cm, dipasang di ekor TBM</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="sg">SAMBUNGAN &middot; DIPERBESAR</div>
  <div class="vv" data-at="s6:gasket" data-fx="left"><b>GASKET KARET</b><span>di setiap sisi segmen</span></div>
  <div class="vv" data-at="s6:Baut" data-fx="left"><b>BAUT + DORONGAN</b><span>menekan gasket sampai rapat</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="sg">TABUNG BENAM</div>
  <div class="vv" data-at="s7:ditenggelamkan" data-fx="left"><b>TURUN KE PARIT</b><span>pemberat dipakai saat elemen tenggelam</span></div>
  <div class="vv" data-at="s7:dirapatkan" data-fx="left"><b>SEAL GINA</b><span>rapat, lalu air sambungan dipompa keluar</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="sg">SAAT BEROPERASI</div>
  <div class="vv" data-at="s8:pompa" data-fx="left"><b>POMPA</b><span>membuang rembesan</span></div>
  <div class="vv" data-at="s8:Ventilasi" data-fx="left"><b>VENTILASI</b><span>menjaga udara dan arah asap</span></div>
  <div class="vv" data-at="s8:layanan" data-fx="left"><b>TEROWONGAN LAYANAN</b><span>jalur darurat di antara dua jalur kereta</span></div>
</div>`;

const css = `
.sg{display:inline-block;font-family:"Space Mono",monospace;font-weight:700;font-size:27px;letter-spacing:.03em;color:${INK};background:${YEL};padding:6px 12px;margin-bottom:12px}
.h0{font-family:"Archivo Black",sans-serif;font-size:92px;line-height:1.02;letter-spacing:-.015em;color:#fff;text-shadow:0 4px 26px rgba(0,16,30,.75)}
.tl{font-family:Inter,sans-serif;font-weight:700;font-size:40px;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.85);margin-top:8px}
.vv{background:rgba(11,10,8,.78);border-left:8px solid ${YEL};padding:12px 18px;margin-top:9px}
.vv b{display:block;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:50px;line-height:1.08;letter-spacing:-.01em;color:#fff}
.vv span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:30px;line-height:1.18;color:${CON}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: INK, vig: 0.42, grain: 0.05, capfloor: 0.4, html, css,
  extraAt: ["s2:tekanan", "s2:atmosfer", "s2:75", "s2:tujuh", "s3:menyelidiki", "s3:lapisan", "s3:kapur", "s4:TBM", "s4:pemotongnya", "s4:lunak", "s4:tekanan", "s5:segmen", "s5:cincin", "s6:gasket", "s6:Baut", "s6:rapat", "s7:tabung", "s7:darat", "s7:diapungkan", "s7:ditenggelamkan", "s7:dirapatkan", "s7:dipompa", "s8:pompa", "s8:Ventilasi", "s8:layanan", "s8:dikendalikan"],
  // The panel opens through a circle, like looking down the bore.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'circle(0% at 20% 10%)',opacity:1},{clipPath:'circle(150% at 20% 10%)',duration:.4,ease:'power3.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'circle(0% at 20% 10%)',duration:.2,ease:'power3.in'},b-.34)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:58px;line-height:1.28;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 6px}`,
// Active word is stamped on a hazard-yellow plate.
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(242,185,15,0)",color:"#FFFFFF"},{backgroundColor:"rgba(242,185,15,1)",color:"#0B0A08",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(242,185,15,0)",color:"#FFFFFF",duration:.07},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.09,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Ring", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
