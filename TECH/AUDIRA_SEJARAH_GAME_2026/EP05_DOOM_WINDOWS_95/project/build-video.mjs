// EP05 DOOM vs WINDOWS 95. Y2KCHROME: liquid-chrome late-90s hardware floating in an aqua/lilac aero sky, glossy pill panels.
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#06306E", BLUE = "#1667D9", AQUA = "#00A3FF", LIL = "#7C5CF0", YEL = "#FFE35A", BG = "#7FD0FF";
const T = "'Exo 2',sans-serif", F = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">&#10022; SEJARAH GAME // EP 05</div>
  <div class="card"><div class="big">GAME INI<br><span>KALAHKAN<br>WINDOWS 95?</span></div></div>
  <div class="row"><b class="c" data-at="s1:Tahun" data-fx="lit">1995</b><b class="c v" data-at="s1:diperkirakan" data-fx="lit">diperkirakan</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">&#10022; 1993 // MS-DOS</div>
  <div class="card"><div class="big xl">DOOM</div></div>
  <div class="row"><b class="c" data-at="s2:studio" data-fx="lit">studio kecil: id Software</b></div>
  <div class="row"><b class="c" data-at="s2:tiga" data-fx="lit">1993</b><b class="c" data-at="s2:komputer" data-fx="lit">untuk MS-DOS</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">&#10022; MODEL SHAREWARE</div>
  <div class="ln ok" data-at="s3:gratis" data-fx="lit"><i>&#10003;</i>Episode 1: GRATIS, boleh disalin</div>
  <div class="ln bad" data-at="s3:Dua" data-fx="lit"><i>$</i>Episode 2 &amp; 3: harus dibeli</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">&#10022; PERKIRAAN PERUSAHAAN</div>
  <div class="card" data-at="s4:persen" data-fx="lit"><div class="big">&plusmn; 1%</div><div class="sm">pengunduh membeli versi lengkap</div></div>
  <div class="money" data-at="s4:seratus" data-fx="lit"><b class="ct nb" data-from="100000" data-to="100000" data-a="s4:seratus" data-d="1.6" data-pre="&plusmn; US$">100.000</b><small>per hari</small></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">&#10022; MEI 1994</div>
  <div class="card" data-at="s5:lebih" data-fx="lit"><div class="big md"><b class="ct nb" data-from="1000000" data-to="1000000" data-a="s5:lebih" data-d="1.8" data-pre="&gt; ">1.000.000</b></div><div class="sm">salinan versi gratis tersebar</div></div>
  <div class="ln ok" data-at="s5:Setiap" data-fx="lit"><i>&#8635;</i>Tiap salinan bisa disalin lagi</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">&#10022; AKHIR 1995</div>
  <div class="card"><div class="big md">DOOM<br><span>&gt; WINDOWS 95</span></div><div class="sm">terpasang di lebih banyak komputer</div></div>
  <div class="row"><b class="stamp" data-at="s6:diperkirakan" data-fx="stamp">DIPERKIRAKAN</b><b class="c" data-at="s6:Microsoft" data-fx="lit">OS baru Microsoft</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">&#10022; VIDEO PROMOSI WINDOWS 95</div>
  <div class="ln ok" data-at="s7:Bill" data-fx="lit"><i>&#9733;</i>Bill Gates disisipkan secara digital ke dalam game</div>
  <div class="row"><b class="stamp" data-at="s7:perkiraan" data-fx="stamp">PERKIRAAN, BUKAN HITUNGAN PASTI</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card"><div class="big md">YANG GRATIS<br><span>MENYEBAR PALING JAUH</span></div></div>
  <div class="ln ok" data-at="s8:Kamu" data-fx="lit"><i>?</i>Pernah main demo gratis yang bikin ketagihan?</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:${F};font-weight:900;font-size:27px;letter-spacing:.12em;color:#fff;text-shadow:0 2px 8px rgba(0,50,140,.55);margin:0 0 12px 6px}
.card{display:inline-block;border-radius:40px;padding:20px 36px 24px;margin-bottom:16px;background:linear-gradient(180deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.7) 48%,rgba(200,236,255,.72) 52%,rgba(255,255,255,.86) 100%);border:3px solid rgba(255,255,255,.98);box-shadow:0 14px 34px rgba(0,60,150,.28),inset 0 -6px 14px rgba(0,150,255,.18)}
.big{font-family:${T};font-weight:900;font-style:italic;font-size:94px;line-height:.98;letter-spacing:-.01em;background:linear-gradient(180deg,#0B3C9C 0%,${BLUE} 46%,${AQUA} 54%,#0B4FB8 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 2px #fff) drop-shadow(0 4px 6px rgba(0,50,140,.3));padding-right:.12em}
.big span{background:linear-gradient(180deg,#4B2BB8 0%,${LIL} 46%,#C04BFF 54%,#5A2FC8 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.big.md{font-size:80px}.big.xl{font-size:150px}
.sm{font-family:${F};font-weight:800;font-size:34px;color:${NAVY};margin-top:8px}
.row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;align-items:center}
.c{font-family:${F};font-weight:900;font-size:38px;line-height:1;padding:16px 28px 17px;color:${NAVY};border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.62) 48%,rgba(190,235,255,.66) 52%,rgba(255,255,255,.82) 100%);border:3px solid #fff;box-shadow:0 8px 22px rgba(0,70,160,.25)}
.c.v{color:${LIL}}
.ln{font-family:${F};font-weight:900;font-size:42px;line-height:1.14;color:${NAVY};padding:16px 28px 18px 92px;margin-bottom:14px;position:relative;border-radius:36px;background:linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.66) 48%,rgba(200,236,255,.7) 52%,rgba(255,255,255,.86) 100%);border:3px solid #fff;box-shadow:0 10px 26px rgba(0,70,160,.24)}
.ln i{position:absolute;left:20px;top:50%;margin-top:-28px;width:56px;height:56px;line-height:56px;border-radius:50%;text-align:center;font-style:normal;font-size:32px;color:#fff;box-shadow:inset 0 -6px 10px rgba(0,0,0,.18),inset 0 6px 8px rgba(255,255,255,.55)}
.ln.ok i{background:linear-gradient(180deg,#6FF0FF,#00A3FF)}.ln.bad i{background:linear-gradient(180deg,#D7A8FF,#7C5CF0)}
.money{display:inline-flex;align-items:baseline;gap:18px;font-family:${T};font-weight:900;font-style:italic;font-size:76px;color:${NAVY};padding:14px 34px 18px;border-radius:999px;background:linear-gradient(180deg,#FFF7C2 0%,#FFE35A 48%,#FFC930 52%,#FFE680 100%);border:3px solid #fff;box-shadow:0 12px 28px rgba(160,100,0,.3)}
.money small{font-family:${F};font-style:normal;font-size:36px;font-weight:900}
.stamp{display:inline-block;font-family:${F};font-weight:900;font-size:36px;letter-spacing:.04em;color:#FF3D7F;border:6px solid #FF3D7F;border-radius:16px;padding:10px 20px;background:rgba(255,255,255,.88);box-shadow:0 8px 20px rgba(120,0,60,.2)}
#chip{text-shadow:0 2px 6px rgba(0,50,140,.55)}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.22, grain: 0.035, capfloor: 0.26, html, css, chipFont: "Nunito,sans-serif", chipColor: "#fff", sig: "EP05_DOOM_WINDOWS_95",
  extraAt: ["s1:lebih", "s1:Windows", "s1:game", "s2:Doom", "s2:komputer", "s2:Software", "s3:disalin", "s3:Dua", "s3:dibeli", "s3:shareware",
    "s4:persen", "s4:menghasilkan", "s4:Tapi", "s5:versi", "s5:Setiap", "s5:juta", "s5:tersebar",
    "s6:lebih", "s6:diperkirakan", "s6:daripada", "s6:Microsoft",
    "s7:Bill", "s7:Gates", "s7:disisipkan", "s7:digital", "s7:Tapi", "s7:perkiraan",
    "s8:gratis", "s8:menyebar", "s8:jauh", "s8:Kamu", "s8:Ikuti", "s8:AUDIRA"],
  // panels float in like soap bubbles and pop away
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:.84,y:34},{opacity:1,scale:1,y:0,duration:.5,ease:'back.out(1.8)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:1.07,y:-18,duration:.2,ease:'power2.in'},b-.22);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.32,scale:.97},{opacity:1,scale:1,duration:.34,ease:'back.out(2.2)'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Nunito,sans-serif;font-weight:900;font-size:60px;line-height:1.16;color:#fff;text-shadow:4px 0 0 ${NAVY},-4px 0 0 ${NAVY},0 4px 0 ${NAVY},0 -4px 0 ${NAVY},3px 3px 0 ${NAVY},-3px 3px 0 ${NAVY},3px -3px 0 ${NAVY},-3px -3px 0 ${NAVY},0 8px 18px rgba(0,30,90,.4)}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",scale:1},{color:"${YEL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:26,opacity:0,scale:.92},{y:0,opacity:1,scale:1,duration:.24,ease:"back.out(1.8)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Doom vs Windows 95", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
