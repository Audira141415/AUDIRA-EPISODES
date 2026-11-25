// EP01 FREE MODEL VIRUS. GLITCHFORGE: clean white asset gallery, a hidden script corrupts the feed, "Disable Scripts" snaps it clean. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#0B0C10", RED = "#FF1E56", CY = "#00E5FF", GRN = "#2BFF88", BG = "#E8E9EE";
const F = "Inter,sans-serif", M = "'JetBrains Mono',monospace";

const html = `
<div id="stat"><i>&#9679;</i> REC <b>SINYAL OK</b></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">RAHASIA MAP ROBLOX / EP 01</div>
  <div class="card"><div class="big gx">FREE MODEL<br><span>BAWA VIRUS?</span></div></div>
  <div class="sub" data-at="s1:dokumentasi" data-fx="gl">Menurut dokumentasi resmi Roblox</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">TOOLBOX &amp; CREATOR STORE</div>
  <div class="card" data-at="s2:jutaan" data-fx="gl"><div class="big md gx">JUTAAN ASET</div></div>
  <div class="row"><b class="c" data-at="s2:model" data-fx="gl">model</b><b class="c" data-at="s2:material" data-fx="gl">material</b><b class="c" data-at="s2:plugin" data-fx="gl">plugin</b><b class="c" data-at="s2:audio" data-fx="gl">audio</b></div>
  <div class="row"><b class="c g" data-at="s2:klik" data-fx="gl">Tinggal klik, masuk map</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">DI DALAM MODEL</div>
  <div class="ln ok" data-at="s3:wajar" data-fx="gl"><i>&#10003;</i> Script wajar: gerak, suara</div>
  <div class="ln bad gx" data-at="s3:menunggu" data-fx="gl"><i>&#10005;</i> Menunggu game berjalan, lalu memanggil aset luar</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ATURAN CREATOR STORE</div>
  <div class="card" data-at="s4:larangan" data-fx="gl"><div class="big md gx"><span>DILARANG</span></div></div>
  <div class="sub" data-at="s4:jauh" data-fx="gl">Memuat aset lain dari jauh &amp; kode diacak</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">KENAPA DILARANG?</div>
  <div class="ln bad gx" data-at="s5:kodenya" data-fx="gl"><i>&#10005;</i> Tidak terbaca = tidak bisa dipastikan</div>
  <div class="ln ok" data-at="s5:rapi" data-fx="gl"><i>&#10003;</i> Rapi &amp; terbuka = mudah dipercaya</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">CEK HALAMAN ASET</div>
  <div class="row"><b class="c" data-at="s6:segitiga" data-fx="gl">segitiga</b><b class="c" data-at="s6:vertex" data-fx="gl">vertex</b><b class="c r" data-at="s6:script" data-fx="gl">script</b></div>
  <div class="ln bad gx" data-at="s6:banyak" data-fx="gl"><i>!</i> Pohon bawa banyak script? Curigai</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">JALAN AMAN</div>
  <div class="ln ok" data-at="s7:Disable" data-fx="gl"><i>&#10003;</i> Klik kanan &rsaquo; Disable Scripts</div>
  <div class="ln ok" data-at="s7:menyaring" data-fx="gl"><i>&#10003;</i> Toolbox: kreator terverifikasi</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="gl"><div class="big sm">BOLEH DIPAKAI,<br><span>ASAL DICEK DULU</span></div></div>
  <div class="sub" data-at="s8:Kamu" data-fx="gl">Pernah menemukan script aneh?</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:${M};font-weight:700;font-size:26px;letter-spacing:.06em;color:#fff;background:${INK};padding:9px 18px 8px;border-left:7px solid ${GRN};margin-bottom:14px}
.card{display:inline-block;background:rgba(255,255,255,.94);border-left:10px solid ${RED};box-shadow:0 12px 30px rgba(11,12,16,.14);padding:16px 28px 20px;margin-bottom:14px}
.big{font-family:${F};font-weight:900;font-size:104px;line-height:.95;letter-spacing:-.02em;color:${INK}}
.big span{color:${RED}}.big.md{font-size:92px}.big.sm{font-size:74px;line-height:1}
.sub{display:inline-block;font-family:${F};font-weight:700;font-size:38px;color:${INK};background:rgba(255,255,255,.9);padding:10px 20px;border-left:6px solid ${CY}}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px}
.c{font-family:${M};font-weight:700;font-size:36px;line-height:1;padding:13px 18px 12px;color:${INK};background:#fff;border:3px solid ${INK}}
.c.g{background:${INK};color:${GRN}}.c.r{background:${RED};color:#fff;border-color:${RED}}
.ln{font-family:${F};font-weight:800;font-size:46px;line-height:1.12;color:${INK};background:rgba(255,255,255,.94);padding:14px 22px 16px 78px;margin-bottom:12px;position:relative;box-shadow:0 8px 22px rgba(11,12,16,.1)}
.ln i{position:absolute;left:20px;top:14px;width:42px;height:42px;line-height:42px;text-align:center;font-style:normal;font-size:30px;color:#fff}
.ln.ok i{background:#0E9F5A}.ln.bad i{background:${RED}}.ln.bad{border-left:8px solid ${RED}}.ln.ok{border-left:8px solid #0E9F5A}
#chip{font-family:${M};font-weight:700;font-size:20px;color:${INK};opacity:.75;letter-spacing:.05em}
#stat{position:absolute;right:110px;top:184px;z-index:11;font-family:${M};font-weight:700;font-size:21px;letter-spacing:.06em;color:${INK}}
#stat i{font-style:normal;color:${RED}}
#outro{background:#0B3D2E}`;

// the HUD reads the same glitch schedule as the 3D post pass
const gsrc = readFileSync("gsched.js", "utf8").replace(/^\/\/.*$/gm, "").replace("export function", "function");
const hud = `(()=>{${gsrc}
const st=q('#stat b'),gx=[...document.querySelectorAll('.gx')];
return (t)=>{const g=gstate(t,K,AT);const a=Math.max(.12,g.hud);const j=g.hud>.3?((g.seed*37)%7-3)*1.5*g.hud:0;
const sh=(a*7).toFixed(1);for(const e of gx){e.style.textShadow=sh+'px 0 0 rgba(255,30,86,.85),-'+sh+'px 0 0 rgba(0,229,255,.85)';e.style.transform='translateX('+j.toFixed(1)+'px)';}
let s='SINYAL OK',c='${INK}';if(g.lost>0){s='NO SIGNAL';c='${RED}';}else if(t>=AT['s7:Scripts']){s='SCRIPT MATI · AMAN';c='#0E9F5A';}else if(g.hud>.3){s='ERR 0x'+Math.floor(g.seed*211).toString(16).toUpperCase().padStart(4,'0');c='${RED}';}
st.textContent=s;st.style.color=c;};})()`;

const L = "PROJECT/HyperFrames_Remotion/assets/lib/";
copyFileSync("../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
copyFileSync("gsched.js", L + "gsched.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.3, grain: 0.035, capfloor: 0, html, css, chipFont: M, chipColor: INK, sig: "EP01_FREE_MODEL_VIRUS", hud,
  extraAt: ["s1:Tapi", "s1:virus", "s1:berguna", "s2:jutaan", "s2:klik", "s2:masuk", "s2:map", "s2:Tinggal", "s2:Banyak",
    "s3:menunggu", "s3:memanggil", "s3:luar", "s3:bergerak", "s3:suara", "s3:wajar", "s3:memutar", "s3:aset",
    "s4:diacak", "s4:require", "s4:Kode", "s4:loadstring", "s4:larangan", "s4:jauh",
    "s5:kodenya", "s5:kreator", "s5:Kode", "s5:memastikan", "s5:rapi", "s5:dipercaya",
    "s6:dicurigai", "s6:segitiga", "s6:vertex", "s6:script", "s6:banyak",
    "s7:Scripts", "s7:Klik", "s7:Modelnya", "s7:modelnya", "s7:Kamu", "s7:kanan", "s7:Disable", "s7:menyaring",
    "s8:gratis", "s8:dicek", "s8:Kamu", "s8:AUDIRA"],
  // Panels arrive like a bad feed: clipped bands and stepped horizontal jumps, then lock.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1,x:28,clipPath:'inset(0% 0% 72% 0%)'},a-.06);tl.set(p,{x:-16,clipPath:'inset(0% 0% 34% 0%)'},a-.02);tl.set(p,{x:7,clipPath:'inset(0% 0% 0% 0%)'},a+.02);tl.set(p,{x:0},a+.06);}`,
  panelOut: `(tl,p,b)=>{tl.set(p,{x:-22,clipPath:'inset(18% 0% 0% 0%)'},b-.12);tl.set(p,{x:30,clipPath:'inset(55% 0% 0% 0%)'},b-.07);tl.set(p,{opacity:0},b-.02);}`,
  fxExtra: `gl:(e,t)=>{tl.set(e,{opacity:1,x:18,clipPath:'inset(0% 0% 60% 0%)'},t);tl.set(e,{x:-9,clipPath:'inset(0% 0% 20% 0%)'},t+.042);tl.set(e,{x:0,clipPath:'inset(0% 0% 0% 0%)'},t+.084);},`,
  // Outro: one last RGB tear, then the AUDIRA card locks in.
  outroIn: `gsap.set('#outro',{opacity:0});tl.set('#outro',{opacity:1,x:40,clipPath:'inset(0% 0% 60% 0%)'},OUT-.12);tl.set('#outro',{x:-20,clipPath:'inset(0% 0% 25% 0%)'},OUT-.06);tl.set('#outro',{x:0,clipPath:'inset(0% 0% 0% 0%)'},OUT);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:60px;line-height:1.14;color:${INK};text-shadow:4px 0 0 #fff,-4px 0 0 #fff,0 4px 0 #fff,0 -4px 0 #fff,3px 3px 0 #fff,-3px 3px 0 #fff,3px -3px 0 #fff,-3px -3px 0 #fff,0 8px 18px rgba(11,12,16,.18)}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",x:0},{color:"${RED}",x:3,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",x:0,duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-24,opacity:0},{x:0,opacity:1,duration:.1,ease:"steps(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Free Model Virus", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
