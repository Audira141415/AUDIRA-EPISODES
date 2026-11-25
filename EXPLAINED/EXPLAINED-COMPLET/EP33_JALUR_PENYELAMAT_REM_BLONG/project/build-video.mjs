// EP33 JALUR PENYELAMAT REM BLONG. INNERWORKS: technical cutaway world (see world3d.js). Panels are dark machined
// glass plates with a cyan scan edge and a brass tag; they open with an x-ray scan wipe (left to right) and close by
// sliding out to the left. Captions: dark plate, cyan active word.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#00E5FF", BRASS = "#D4AF37", AMBER = "#F59E0B", INK = "#E6FAFF", PLATE = "rgba(9,13,22,.88)";
const TT = "Space Grotesk,sans-serif", MN = "JetBrains Mono,monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 33</div>
  <div class="card"><div class="big">Dibuat supaya<br>truk <span>tenggelam</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">JALUR PENYELAMAT</div>
  <div class="ln" data-at="s2:tiga" data-fx="lit">3 jalur di turunan Tol Cipularang</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag r">REM BLONG</div>
  <div class="ln a" data-at="s3:panas" data-fx="lit">Rem makin panas, gesekan melemah</div>
  <div class="ln r" data-at="s3:mendidih" data-fx="lit">Minyak rem bisa mendidih</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">BERCABANG DARI JALAN UTAMA</div>
  <div class="ln g" data-at="s4:kerikil" data-fx="lit">Bukan aspal: lapisan tebal kerikil bulat</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BAN AMBLAS</div>
  <div class="ln" data-at="s5:didorong" data-fx="lit">Kerikil didorong</div>
  <div class="ln a" data-at="s5:dipadatkan" data-fx="lit">Dipadatkan</div>
  <div class="ln g" data-at="s5:digeser" data-fx="lit">Digeser ke samping</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KENAPA KERIKIL BULAT?</div>
  <div class="ln a" data-at="s6:gravitasi" data-fx="lit">Menanjak: gravitasi ikut menahan</div>
  <div class="ln" data-at="s6:airnya" data-fx="lit">Mudah bergeser, air cepat turun</div>
  <div class="ln r" data-at="s6:mendadak" data-fx="lit">Pasir basah: bisa terlalu mendadak</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">PEDOMAN WASHINGTON, AS</div>
  <div class="card" data-at="s7:kali" data-fx="lit"><div class="big sm2">Hambatan <span>25&times;</span> aspal</div></div>
  <div class="ln" data-at="s7:seratus" data-fx="lit">80 km/jam &rarr; berhenti &plusmn; 100 m</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:jangan" data-fx="lit"><div class="big sm2">Jangan berhenti di <span>jalur penyelamat</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: vortex generator</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:#0B1220;background:${BRASS};padding:9px 18px 8px;margin-bottom:16px;box-shadow:0 0 0 2px rgba(212,175,55,.35),0 10px 24px rgba(0,0,0,.45)}
.tag.r{background:#EF4444;color:#fff}
.card{display:table;background:${PLATE};border:2px solid rgba(0,229,255,.55);border-left:10px solid ${CY};padding:14px 30px 20px;margin-bottom:16px;box-shadow:0 0 34px rgba(0,229,255,.18),0 22px 44px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:700;font-size:94px;line-height:1.0;color:${INK};letter-spacing:-.02em}
.big span{color:${CY}}.big.sm2{font-size:68px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${INK};background:${PLATE};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:10px solid ${CY};box-shadow:0 10px 26px rgba(0,0,0,.45);max-width:880px}
.ln.a{border-left-color:${AMBER}}.ln.r{border-left-color:#EF4444}.ln.g{border-left-color:${BRASS}}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${CY};opacity:.8;letter-spacing:.06em;background:rgba(9,13,22,.6);padding:3px 10px}`;

// every anchor used by world3d.js and mix.py (anchors only used there must be listed, or frames repeat)
const EXTRA = ["s1:gembur", "s1:tenggelam", "s2:penyelamat", "s2:tiga", "s2:Cipularang", "s3:turunan", "s3:mengerem", "s3:panas", "s3:kampas", "s3:melemah", "s3:mendidih", "s3:blong",
  "s4:bercabang", "s4:tikungan", "s4:aspal", "s4:kerikil", "s5:amblas", "s5:didorong", "s5:dipadatkan", "s5:digeser", "s5:menyedot",
  "s6:menanjak", "s6:gravitasi", "s6:Kerikil", "s6:airnya", "s6:Pasir", "s6:basah", "s6:mendadak",
  "s7:Washington", "s7:dua", "s7:kali", "s7:masuk", "s7:delapan", "s7:seratus", "s7:meter", "s8:jangan", "s8:nongkrong", "s8:AUDIRA", "s8:Episode"];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "33", bg: "#090D16", vig: 0.42, grain: 0.05, capfloor: 0.35, html, css, chipFont: MN, chipColor: CY, sig: "EP33_JALUR_PENYELAMAT_REM_BLONG",
  extraAt: EXTRA,
  // x-ray scan wipe in, slide out left
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:1,clipPath:'inset(0% 100% 0% 0%)',x:-14},{clipPath:'inset(0% 0% 0% 0%)',x:0,duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:-70,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.55,x:-6},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${TT};font-weight:700;font-size:58px;line-height:1.16;color:${INK};text-transform:uppercase;letter-spacing:.01em;background:rgba(9,13,22,.9);padding:10px 24px 14px;border:2px solid rgba(0,229,255,.45);box-shadow:0 0 26px rgba(0,229,255,.2)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${CY}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Jalur Penyelamat Rem Blong", "#090D16");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
