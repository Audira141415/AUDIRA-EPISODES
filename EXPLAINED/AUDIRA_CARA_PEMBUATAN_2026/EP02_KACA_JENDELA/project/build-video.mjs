// EP02 KACA JENDELA. GLASSCRAFT: a float-glass line in a dark optical studio, saturated light discs behind every glass hero,
// molten glass and tin lit orange-gold. Panels are frosted-glass pills that slide in with a de-blur, rows light on their word.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const GOLD = "#FFC56B", CYAN = "#2FE6FF", MAG = "#F27BFF", INK = "#EAF4FF";
const HEAD = "Outfit,sans-serif", BODY = "Inter,sans-serif", MONO = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA PEMBUATAN · EP 02</div>
  <div class="card hero"><div class="big">KACA<br><span>JENDELA</span></div></div>
  <div class="ln" data-at="s1:mengapung" data-fx="lit">dulu <b>mengapung</b> di atas logam cair</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>PENEMU · INGGRIS</div>
  <div class="ln" data-at="s2:Alastair" data-fx="lit">Alastair Pilkington</div>
  <div class="ln" data-at="s2:Kenneth" data-fx="lit">Kenneth Bickerstaff</div>
  <div class="row"><div class="chip" data-at="s2:1952" data-fx="lit"><em>1952</em>mulai eksperimen</div><div class="chip" data-at="s2:diumumkan" data-fx="lit"><em>1959</em>diumumkan</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>BAHAN BAKU</div>
  <div class="grid">
    <div class="chip" data-at="s3:Pasir" data-fx="lit">Pasir</div><div class="chip" data-at="s3:soda" data-fx="lit">Soda abu</div><div class="chip" data-at="s3:dolomit" data-fx="lit">Dolomit</div>
    <div class="chip" data-at="s3:batu" data-fx="lit">Batu kapur</div><div class="chip" data-at="s3:sodium" data-fx="lit">Sodium sulfat</div><div class="chip" data-at="s3:pecahan" data-fx="lit">Pecahan kaca bekas</div>
  </div>
  <div class="card num" data-at="s3:tungku" data-fx="lit"><small>TUNGKU</small><div class="big">±<b class="ct" data-from="0" data-to="1500" data-a="s3:1.500" data-d="1.2">0</b>°C</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>KOLAM TIMAH CAIR</div>
  <div class="ln" data-at="s4:seribu" data-fx="lit">Masuk pada <b>seribu derajat lebih</b></div>
  <div class="ln" data-at="s4:mengapung" data-fx="lit">Mengapung, menyebar, rata sendiri</div>
  <div class="ln c" data-at="s4:nitrogen" data-fx="lit">Selimut gas nitrogen + hidrogen</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>PITA KACA</div>
  <div class="ln c" data-at="s5:Rol" data-fx="lit">Rol tepi: tarik / tahan = tebal</div>
  <div class="row"><div class="card num sm" data-at="s5:600" data-fx="lit"><small>KELUAR KOLAM</small><div class="big">±600°C</div></div>
  <div class="card num sm" data-at="s5:100" data-fx="lit"><small>TEROWONGAN PENDINGIN</small><div class="big">±<b class="ct" data-from="0" data-to="100" data-a="s5:100" data-d=".8">0</b> m</div></div></div>
  <div class="ln" data-at="s5:dipotong" data-fx="lit">Lalu dipotong mesin</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>KENAPA TIMAH?</div>
  <div class="ln" data-at="s6:rapat" data-fx="lit">Lebih rapat dari kaca</div>
  <div class="ln" data-at="s6:menempel" data-fx="lit">Tidak menempel pada kaca</div>
  <div class="ln" data-at="s6:mendidih" data-fx="lit">Mendidih di atas <b>2.000°C</b></div>
  <div class="ln c" data-at="s6:Hasilnya" data-fx="lit">Dua sisi mulus tanpa digosok</div>
  <div class="ln" data-at="s6:Pendinginan" data-fx="lit">Dingin pelan = tidak pecah</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>TEBAL ALAMI</div>
  <div class="card num" data-at="s7:7" data-fx="lit"><small>DI ATAS TIMAH</small><div class="big">≈<b class="ct" data-from="0" data-to="7" data-a="s7:7" data-d=".7">0</b> mm</div></div>
  <div class="ln" data-at="s7:semua" data-fx="lit">Hampir semua kaca datar</div>
  <div class="ln c" data-at="s7:24" data-fx="lit">Nonstop <b>24 jam</b> sehari</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card hero" data-at="s8:jendela" data-fx="lit"><div class="big sm">JENDELAMU<br><span>PERNAH BERLAYAR</span><br>DI ATAS LOGAM</div></div>
  <div class="ln" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA: cara pembuatan berikutnya</div>
</div>`;

const glass = "background:linear-gradient(135deg,rgba(26,34,48,.72),rgba(10,14,22,.62));backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border:1.5px solid rgba(255,255,255,.28);box-shadow:0 18px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.35)";
const css = `
.tag{display:table;font-family:${MONO};font-weight:700;font-size:27px;letter-spacing:.08em;color:${INK};${glass};border-radius:999px;padding:10px 24px 9px 18px;margin-bottom:16px}
.tag i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${GOLD};box-shadow:0 0 14px ${GOLD};margin-right:14px;vertical-align:1px}
.card{display:table;${glass};border-radius:34px;padding:16px 34px 20px;margin-bottom:16px}
.card.hero{background:linear-gradient(135deg,rgba(70,48,22,.72),rgba(14,20,30,.66) 60%,rgba(12,40,48,.66));}
.big{font-family:${HEAD};font-weight:800;font-size:112px;line-height:.95;letter-spacing:-.02em;color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.35)}
.big span{color:${GOLD}}.big.sm{font-size:74px;line-height:1.02}
.num small{display:block;font-family:${MONO};font-size:30px;letter-spacing:.12em;color:${CYAN};margin-bottom:4px}
.num .big{font-size:96px;color:${GOLD}}.num.sm .big{font-size:64px}.num.sm{padding:14px 26px 16px;margin-right:14px}
.ln{display:table;font-family:${BODY};font-weight:600;font-size:40px;line-height:1.2;color:${INK};${glass};border-radius:22px;padding:12px 26px;margin-bottom:12px;max-width:880px}
.ln b{color:${GOLD};font-weight:800}.ln.c{border-color:rgba(47,230,255,.6)}
.row{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
.grid{display:flex;flex-wrap:wrap;gap:10px;max-width:900px;margin-bottom:14px}
.chip{font-family:${BODY};font-weight:600;font-size:34px;color:${INK};${glass};border-radius:999px;padding:10px 24px}
.chip em{font-style:normal;font-family:${HEAD};font-weight:800;color:${GOLD};margin-right:12px;font-size:38px}
#chip{font-family:${MONO};font-size:24px;color:${INK};opacity:.9;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#05070b", vig: 0.42, grain: 0.05, capfloor: 0.42, html, css, chipFont: MONO, chipColor: INK, sig: "EP02_KACA_JENDELA",
  chip: "ILUSTRASI, BUKAN REKAMAN PABRIK ASLI",
  extraAt: ["s2:Kenneth", "s2:diumumkan", "s2:Alastair", "s3:Pasir", "s3:soda", "s3:dolomit", "s3:batu", "s3:sodium", "s3:pecahan", "s3:tungku", "s3:meleleh",
    "s4:dialirkan", "s4:mengapung", "s4:menyebar", "s4:Selimut", "s5:Rol", "s5:pita", "s5:Saat", "s5:600", "s5:terowongan", "s5:100", "s5:dipotong",
    "s6:rapat", "s6:menempel", "s6:mendidih", "s6:Hasilnya", "s6:Pendinginan", "s7:milimeter", "s7:Kini", "s7:24", "s7:7", "s8:Ikuti", "s8:jendela"],
  // frosted panels slide up out of a blur, leave upward into a blur
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:40,scale:.97,filter:'blur(14px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.5,ease:'power4.out'},a-.14);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-26,filter:'blur(12px)',duration:.32,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.62},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'blur(20px)'});tl.to('#outro',{opacity:1,filter:'blur(0px)',duration:.55,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Outfit,sans-serif;font-weight:700;font-size:60px;line-height:1.16;color:#F4F8FF;text-shadow:0 3px 0 rgba(0,0,0,.85),0 0 20px rgba(0,0,0,.85)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#F4F8FF",scale:1},{color:"${GOLD}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4F8FF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kaca Jendela", "#05070b");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
