// EP29 FIRE EXTINGUISHER BALL. NANOFORGE: dark microscopy void, glossy ball-and-stick chemistry,
// cyan/magenta/gold rim lights, teal-orange grade. Panels are dark HUD cards with cyan tags and gold accents.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#02050f", NAVY = "#0a192f", CYAN = "#00f5d4", GOLD = "#fbbf24", WHITE = "#e2e8f0", MAG = "#a855f7";
const MONO = "'Courier New', monospace", SANS = "'Arial Black', Arial, sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 29</div>
  <div class="card"><div class="big">Bola pemadam<br><span>≠ tabung pemadam</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">TANPA LISTRIK &middot; TANPA PIPA</div>
  <div class="ln" data-at="s2:digantung" data-fx="lit">Digantung di atas kompor &amp; panel listrik</div>
  <div class="ln" data-at="s2:digelindingkan" data-fx="lit">Bisa digelindingkan atau dilempar</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">&plusmn; 1880</div>
  <div class="ln" data-at="s3:granat" data-fx="lit">Granat kaca berisi air garam</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ANATOMI BOLA</div>
  <div class="ln" data-at="s4:cangkang" data-fx="lit">Cangkang busa keras + bubuk pemadam</div>
  <div class="ln" data-at="s4:sumbu" data-fx="lit">Sumbu menyala saat tersentuh api</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LEDAKAN</div>
  <div class="card" data-at="s5:memecahkan" data-fx="lit"><div class="big sm">Pecah dalam <span>hitungan detik</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KIMIA API</div>
  <div class="ln" data-at="s6:monoamonium" data-fx="lit">Monoamonium fosfat (ABC)</div>
  <div class="ln" data-at="s6:meleleh" data-fx="lit">Meleleh &rarr; menyelimuti &rarr; memutus reaksi</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">BATAS</div>
  <div class="ln" data-at="s7:kilogram" data-fx="lit">1,4 kg &rarr; hanya 2,5 m&sup3;</div>
  <div class="ln" data-at="s7:Kamar" data-fx="lit">Kamar 3&times;3 m = &gt;20 m&sup3;</div>
  <div class="ln" data-at="s7:awal" data-fx="lit">Api tahap awal, &plusmn;4 menit</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">KESIMPULAN</div>
  <div class="card" data-at="s8:bantuan" data-fx="lit"><div class="big sm">Bantuan <span>tambahan</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: bandul peredam gempa</div>
</div>`;

const css = `
.tag{display:table;font-family:${MONO};font-weight:700;font-size:26px;letter-spacing:.14em;color:${VOID};background:${CYAN};padding:7px 16px 6px;margin-bottom:14px;box-shadow:0 0 18px rgba(0,245,212,.45)}
.card{display:table;background:rgba(10,25,47,.92);border:2px solid ${CYAN};border-radius:4px;padding:12px 26px 18px;margin-bottom:14px;box-shadow:0 8px 32px rgba(0,0,0,.6),inset 0 1px 0 rgba(0,245,212,.15)}
.big{font-family:${SANS};font-weight:900;font-size:88px;line-height:1.05;color:${WHITE};letter-spacing:-.01em}
.big span{color:${GOLD}}.big.sm{font-size:64px;line-height:1.1}
.ln{display:table;font-family:${SANS};font-weight:800;font-size:38px;line-height:1.2;color:${WHITE};background:rgba(10,25,47,.88);padding:9px 22px 11px 20px;margin-bottom:10px;border-left:10px solid ${GOLD};border-radius:0 4px 4px 0;box-shadow:0 4px 16px rgba(0,0,0,.45);max-width:880px}
#chip{font-family:${MONO};font-size:26px;font-weight:700;color:${CYAN};opacity:.8;letter-spacing:.08em;background:rgba(2,5,15,.7);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "29", bg: VOID, vig: 0.38, grain: 0.08, capfloor: 0.1, html, css, chipFont: MONO, chipColor: CYAN, sig: "EP29_BOLA_PEMADAM_API_OTOMATIS",
  extraAt: [
    "s2:panel", "s2:mobil", "s2:tanpa", "s2:pipa", "s2:dilempar",
    "s3:melempar", "s3:garam", "s3:seribu",
    "s4:menyala", "s4:bubuk",
    "s5:sumbu",
    "s6:menyelimutinya", "s6:memutus", "s6:bahan",
    "s7:dua", "s7:kubik", "s7:volumenya", "s7:dua#2", "s7:bola", "s7:empat#2", "s7:pertama",
    "s8:standar", "s8:AUDIRA",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:18,scale:0.92},{opacity:1,y:0,scale:1,duration:.4,ease:'power2.out'},a-.08);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,scale:0.96,duration:.25,ease:'power2.in'},b-.25);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.75,x:-4},{opacity:1,x:0,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:0.9});tl.to('#outro',{opacity:1,scale:1,duration:.4,ease:'back.out(1.4)'},OUT-.08);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SANS};font-weight:900;font-size:56px;line-height:1.16;color:#e2e8f0;text-transform:uppercase;letter-spacing:.02em;background:rgba(2,5,15,.88);padding:10px 22px 14px;border-radius:8px;border:1px solid rgba(0,245,212,.25);box-shadow:0 4px 24px rgba(0,0,0,.5)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#e2e8f0",scale:1},{color:"#fbbf24",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#e2e8f0",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bola Pemadam Api Otomatis", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
