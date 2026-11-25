// EP03 TIME DUNGEON. Condensed poster type and terminal labels, amber on ultraviolet. Panels fly in from depth on the lens axis. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB020", MAG = "#FF2FA0", TEAL = "#2FF0D0", WHT = "#F4F1FF", RED = "#FF4030", BG = "#06040F";
const F = '"League Gothic",sans-serif', M = '"Space Mono",monospace';

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">MMORPG: MAIN GAME BISA JADI UANG? / EP 03</div>
  <div class="h1">LOOT<br><span>BISA DIJUAL?</span></div>
  <div class="st" data-at="s1:Tapi" data-fx="pop">TIDAK SEMUA. TIDAK DIJAMIN.</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">BIG TIME / FREE TO PLAY</div>
  <div class="h2">DUNGEON &rarr; <span data-at="s2:drop" data-fx="fade">DROP</span></div>
  <div class="lb" data-at="s2:Collectible" data-fx="fade">DROP LANGKA DISEBUT COLLECTIBLE</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">DUA JENIS COLLECTIBLE</div>
  <div class="two"><div data-at="s3:Kosmetik" data-fx="left"><b>KOSMETIK</b><span>tampilan, tanpa tambahan kekuatan</span></div><div data-at="s3:utilitas" data-fx="left"><b class="te">UTILITAS</b><span>tanah SPACE dan workshop</span></div></div>
  <div class="lb" data-at="s3:Jumlah" data-fx="fade">JUMLAH CETAK DIBATASI</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">SYARAT TOKEN</div>
  <div class="h2 sm">BIGTIME <span>BUTUH HOURGLASS</span></div>
  <div class="row" data-at="s4:Habis" data-fx="left"><b>RECHARGE</b><span>waktu aktif habis, isi ulang di Time Warden</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">RANTAI NILAI</div>
  <div class="fl"><b data-at="s5:Token" data-fx="pop">TOKEN</b><i data-at="s5:Forge" data-fx="fade">&rarr;</i><b data-at="s5:Forge" data-fx="pop">FORGE / ARMORY</b><i data-at="s5:Open" data-fx="fade">&rarr;</i><b data-at="s5:Open" data-fx="pop">OPEN LOOT</b></div>
  <div class="row" data-at="s5:BIGTIME" data-fx="left"><b class="rd">TOKEN</b><span>tidak dijual di marketplace, harus diekspor ke dompet kripto</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk">BIAYA</div>
  <div class="row" data-at="s6:gratis" data-fx="left"><b class="te">MAIN</b><span>gratis</span></div>
  <div class="row" data-at="s6:produksi" data-fx="left"><b>PRODUKSI</b><span>SPACE + workshop: beli, atau tunggu drop sangat langka</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">KURVA ILUSTRATIF, DUA TITIK BERSUMBER</div>
  <div class="row" data-at="s7:seratus" data-fx="left"><b>&gt;US$100 JT</b><span>pendapatan studio, Mar 2024. Bukan untung pemain.</span></div>
  <div class="v nb" data-at="s7:Harga" data-fx="up">US$0,977 &rarr; <span>US$0,0067</span></div>
  <div class="lb" data-at="s7:Harga" data-fx="fade">BIGTIME, DES 2023 KE 4 NOV 2026. COINGECKO</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2 sm" data-at="s8:Jadi" data-fx="up">ADA PEMBELI?<br><span>BARU ADA HARGA.</span></div>
  <div class="st" data-at="s8:pekerjaan" data-fx="pop">BERBURU LOOT = PEKERJAAN?</div>
  <div class="lb" data-at="s8:Kalau" data-fx="fade">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
#scrim{position:absolute;left:0;right:0;top:0;height:680px;background:linear-gradient(180deg,rgba(4,2,12,.78),rgba(4,2,12,.6) 60%,rgba(4,2,12,0));z-index:9;pointer-events:none}
.tk{font-family:${M};font-weight:700;font-size:28px;color:${TEAL};margin-bottom:12px}
.h1{font-family:${F};font-size:176px;line-height:.96;color:${WHT}}.h1 span{color:${AMB};font-size:128px}
.h2{font-family:${F};font-size:130px;line-height:1;color:${WHT}}.h2 span{color:${AMB}}.h2.sm{font-size:94px;line-height:1.02}
.st{display:inline-block;margin-top:16px;font-family:${F};font-size:58px;line-height:1.05;letter-spacing:.01em;color:#0a0616;background:${AMB};padding:8px 18px 6px}
.lb{font-family:${M};font-weight:700;font-size:27px;line-height:1.25;color:${WHT};margin-top:10px}
.two{display:flex;gap:12px}.two>div{flex:1;background:rgba(10,6,26,.84);padding:12px 14px;border-top:5px solid ${AMB}}.two>div:last-child{border-color:${TEAL}}.two b{display:block;font-family:${F};font-weight:400;font-size:72px;line-height:1;color:${AMB}}.two b.te{color:${TEAL}}.two span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:${WHT};margin-top:6px}
.row{display:flex;align-items:center;gap:16px;background:rgba(10,6,26,.84);padding:10px 16px;margin-top:12px;border-left:7px solid ${MAG}}
.row b{flex:none;font-family:${F};font-weight:400;font-size:68px;line-height:1;color:${AMB}}.row b.te{color:${TEAL}}.row b.rd{color:${RED}}.row span{font-family:Inter,sans-serif;font-weight:700;font-size:29px;line-height:1.2;color:${WHT}}
.fl{display:flex;align-items:center;gap:6px}.fl b{flex:1;text-align:center;font-family:${F};font-weight:400;font-size:50px;line-height:1.02;padding:14px 4px;background:rgba(10,6,26,.88);color:${AMB};border-bottom:5px solid ${AMB}}.fl i{font-style:normal;color:${WHT};font-family:Inter,sans-serif;font-size:30px}
.v{font-family:${F};font-size:84px;line-height:1.05;color:${WHT};margin-top:14px}.v span{color:${RED}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: BG, vig: 0.5, grain: 0.07, capfloor: 0.62, html: '<div id="scrim"></div>' + html, css, chipFont: M, chipColor: WHT,
  extraAt: ["s1:loot", "s2:melawan", "s2:drop", "s3:Kosmetik", "s3:SPACE", "s4:Token", "s4:Habis", "s5:Forge", "s5:Open", "s5:diekspor", "s6:produksi", "s7:Harga", "s7:Maret"],
  // Panels arrive from depth as the camera dives through a ring.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scale:.62,opacity:0},{scale:1,opacity:1,duration:.3,ease:'power4.out'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{scale:1.6,opacity:0,duration:.18,ease:'power2.in'},b-.18)`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 42%)'});tl.to('#outro',{clipPath:'circle(125% at 50% 42%)',duration:.6,ease:'power3.in'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${F};font-size:82px;line-height:1.08;letter-spacing:.012em;word-spacing:.1em;color:${WHT};text-shadow:0 3px 14px #000}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHT}",scale:1},{color:"${AMB}",scale:1.08,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHT}",scale:1,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scale:.9,opacity:.2},{scale:1,opacity:1,duration:.1,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Time Dungeon", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
