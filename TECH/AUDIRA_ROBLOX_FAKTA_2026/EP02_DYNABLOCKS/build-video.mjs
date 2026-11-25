// EP02 DYNABLOCKS. Retro computing lab, 1989 to 2006: a walnut desk, a beige computer with a 1-bit physics sim, a timeline rail. Panels are 1-bit windows that open with a stepped wipe. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#222222", BEIGE = "#D8D2C4", TEAL = "#1D3B3A", GRN = "#3FBF7F", RED = "#D94A38", PAPER = "#F4F1E8";
const SG = "'Space Grotesk',sans-serif", VT = "VT323,monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA ROBLOX / EP 02</div>
  <div class="win"><div class="bar"><i></i><span>NAMA_LAMA.TXT</span><i></i></div>
    <div class="st big">DYNABLOCKS?</div></div>
  <div class="st h tl" data-at="s1:akarnya" data-fx="px">akarnya: software pelajaran fisika</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">1989</div>
  <div class="win"><div class="bar"><i></i><span>PERUSAHAAN</span><i></i></div>
    <div class="st h" data-at="s2:Knowledge" data-fx="px">Knowledge Revolution</div>
    <div class="st m" data-at="s2:David" data-fx="px">David &amp; Greg Baszucki</div></div>
  <div class="row"><b class="st c g" data-at="s2:Interactive" data-fx="px">Interactive Physics</b><b class="st c" data-at="s2:dua" data-fx="px">2D, untuk sekolah</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">INSINYURNYA</div>
  <div class="win"><div class="bar"><i></i><span>TIM</span><i></i></div>
    <div class="st h" data-at="s3:Erik" data-fx="px">Erik Cassel</div>
    <div class="st m" data-at="s3:wakil" data-fx="px">wakil presiden bidang teknik</div></div>
  <div class="row"><b class="st c" data-at="s3:Desember" data-fx="px">DES 1998</b><b class="st c g" data-at="s3:MSC" data-fx="px">dibeli MSC Software</b><b class="st c r" data-at="s3:dua" data-fx="px">US$20 juta</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">PENGGUNANYA</div>
  <div class="st h" data-at="s4:populer" data-fx="px">Paling populer di pelajar muda</div>
  <div class="win" data-at="s4:Forbes" data-fx="px"><div class="bar"><i></i><span>FORBES, 2016</span><i></i></div>
    <div class="st m">Baszucki: kesuksesan itulah inspirasi Roblox</div></div>
  <div class="st h g" data-at="s4:pemainnya" data-fx="px">Pemainnya yang membangun</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">PROTOTIPE</div>
  <div class="row"><b class="st c" data-at="s5:Desember" data-fx="px">DES 2003</b><b class="st c" data-at="s5:Baszucki" data-fx="px">Baszucki + Cassel</b></div>
  <div class="row"><b class="st c g" data-at="s5:Januari" data-fx="px">JAN 2004</b><b class="st c" data-at="s5:robots" data-fx="px">ROBOTS + BLOCKS</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">RILIS</div>
  <div class="st h" data-at="s6:Awalnya" data-fx="px">Awalnya cuma berdua</div>
  <div class="st m" data-at="s6:lusin" data-fx="px">lalu beberapa lusin penguji</div>
  <div class="st big sm g" data-at="s6:September" data-fx="px">1 SEP 2006</div>
</div>
<div class="p quiet" data-in="s7" data-out="s8">
  <div class="tag dark">2013</div>
  <div class="st q" data-at="s7:meninggal" data-fx="fade">Erik Cassel meninggal karena kanker</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="win" data-at="s8:anak-anak" data-fx="px"><div class="bar"><i></i><span>PENGAMATAN</span><i></i></div>
    <div class="st h">Anak-anak lebih suka membangun</div></div>
  <div class="st h g" data-at="s8:Kamu" data-fx="px">Kamu: main, atau bikin game?</div>
</div>`;

const css = `
.st{display:block;color:${INK};font-family:'Space Grotesk',sans-serif}
.win{display:block;background:${PAPER};border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};margin-bottom:22px}
.bar{display:flex;align-items:center;gap:14px;height:44px;padding:0 12px;border-bottom:4px solid ${INK};background:${PAPER}}
.bar i{flex:1;height:22px;background:repeating-linear-gradient(180deg,${INK} 0 3px,transparent 3px 6px)}
.bar span{font-family:VT323,monospace;font-size:36px;line-height:1;color:${INK};letter-spacing:.04em}
.tag{display:inline-block;font-family:VT323,monospace;font-size:44px;line-height:1;letter-spacing:.06em;color:${PAPER};background:${TEAL};padding:6px 16px 4px;margin-bottom:16px;border:4px solid ${INK}}
.tag.dark{background:rgba(20,18,16,.55);border-color:rgba(244,241,232,.5);color:#f1e2c4}
.big{font-weight:700;font-size:118px;line-height:1;padding:22px 24px 26px;letter-spacing:-.01em}
.big.sm{font-size:92px;display:inline-block;border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:14px 24px 18px}
.h{font-weight:700;font-size:52px;line-height:1.1;padding:16px 22px 18px}
.m{font-weight:500;font-size:40px;line-height:1.15;padding:0 22px 18px}
.tl,.p>.h{display:inline-block;background:${PAPER};border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};margin-bottom:22px}
.p>.m{display:inline-block;background:${PAPER};border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:12px 22px 14px;margin-bottom:22px}
.win .h{background:none;border:0;box-shadow:none;margin:0}
.win>.m:first-of-type{padding-top:16px}
.g{background:${GRN}!important}.r{background:${RED}!important;color:${PAPER}!important}
.row{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:22px}
.c{font-weight:700;font-size:40px;line-height:1;padding:14px 20px 15px;background:${PAPER};border:4px solid ${INK};box-shadow:6px 6px 0 ${INK}}
.q{font-weight:500;font-size:46px;line-height:1.18;color:#f1e2c4;max-width:820px}
#chip{font-family:VT323,monospace;font-weight:400;font-size:27px;color:${PAPER};background:${INK};padding:2px 10px;top:176px;opacity:.86}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: BEIGE, vig: 0.3, grain: 0.05, capfloor: 0, html, css, chipFont: VT, chipColor: PAPER,
  extraAt: ["s1:DynaBlocks", "s1:akarnya", "s2:Interactive", "s3:Desember", "s3:dibeli", "s3:dolar", "s3:dua", "s3:MSC", "s4:pelajar", "s4:inspirasi", "s4:Dunianya",
    "s5:eBlocks", "s5:GoBlocks", "s5:DynaBlocks", "s5:Roblox", "s5:robots", "s5:blocks", "s6:Awalnya", "s6:membuat", "s6:lalu", "s6:lusin", "s6:September",
    "s8:Jadi", "s8:membangun", "s8:anak-anak", "s8:Kamu"],
  // 1-bit stepped wipe: the window opens left to right in eight hard steps and closes the same way.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.3,ease:'steps(8)'},a-.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 0% 100%)',duration:.2,ease:'steps(6)'},b-.2)`,
  // reveals blink on like a CRT: stepped opacity and a short stepped wipe
  fxExtra: `px:(e,t)=>tl.fromTo(e,{opacity:0,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.24,ease:'steps(6)'},t-.04),`,
  // Closes as stepped horizontal bands, top to bottom.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'steps(10)'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:60px;line-height:1.14;letter-spacing:-.005em;color:#fff;text-shadow:4px 0 0 ${INK},-4px 0 0 ${INK},0 4px 0 ${INK},0 -4px 0 ${INK},3px 3px 0 ${INK},-3px 3px 0 ${INK},3px -3px 0 ${INK},-3px -3px 0 ${INK},0 8px 0 ${INK}}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${GRN}",duration:.01,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.01},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.14,ease:"steps(5)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "DynaBlocks", BEIGE);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
