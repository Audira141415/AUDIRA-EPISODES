// EP38 TETRAPOD (BRUTALFORGE): a concrete breakwater wall of interlocking tetrapods. Massive brutalist blocks with rough
// aggregate texture, harsh directional light, deep shadows. Panels are BRUTALFORGE callout cards: dark concrete bg,
// white mono type, blue-ocean accent, heavy sans tag; they slam in with a concrete impact.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CONC = "#3A3C3E", WHITE = "#F0EFED", BLUE = "#2A7FCC", DARK = "#1A1C1E";
const TT = "'Bebas Neue',sans-serif", MN = "'Space Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 38</div>
  <div class="card"><div class="big">Beton 4 kaki<br><span>penjebak ombak</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">TETRAPOD</div>
  <div class="ln" data-at="s2:Yunani" data-fx="lit">Yunani: empat kaki</div>
  <div class="ln b" data-at="s2:Prancis" data-fx="lit">Pierre Danel &middot; Prancis &middot; &plusmn;1950</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">MASALAH: DINDING RATA</div>
  <div class="ln" data-at="s3:pukulan" data-fx="lit">Menerima pukulan ombak penuh</div>
  <div class="ln b" data-at="s3:memantulkannya" data-fx="lit">Memantulkan kembali ke laut</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">TUMPUK ACAK</div>
  <div class="ln" data-at="s4:lapis" data-fx="lit">Dua lapis, tanpa semen</div>
  <div class="ln b" data-at="s4:terkunci" data-fx="lit">Kaki saling mengait &amp; terkunci</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">RONGGA</div>
  <div class="card" data-at="s5:separuh" data-fx="lit"><div class="big sm2">&asymp;50% <span>ruang kosong</span></div></card>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">CARA KERJA</div>
  <div class="ln" data-at="s6:rongga" data-fx="lit">Air menyusup ke rongga</div>
  <div class="ln" data-at="s6:bergesekan" data-fx="lit">Bergesekan, energi habis</div>
  <div class="ln b" data-at="s6:terguling" data-fx="lit">Titik berat rendah, sulit terguling</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">RUMUS HUDSON</div>
  <div class="card" data-at="s7:delapan" data-fx="lit"><div class="big sm2">2&times; ombak<br><span>= 8&times; berat</span></div></card>
  <div class="ln" data-at="s7:Casablanca" data-fx="lit">Casablanca: 15 ton, 4 musim dingin</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:menjebak" data-fx="lit"><div class="big sm2">Menang<br><span>dengan menjebak</span></div></card>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: pipa U di bawah wastafel</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:${WHITE};background:rgba(26,28,30,.9);padding:9px 18px 8px;margin-bottom:14px;border-left:8px solid ${BLUE}}
.card{display:table;background:rgba(26,28,30,.92);border-radius:4px;padding:14px 30px 20px;margin-bottom:14px;border-left:10px solid ${BLUE};box-shadow:0 24px 50px rgba(0,0,0,.6)}
.big{font-family:${TT};font-weight:400;font-size:104px;line-height:1.0;color:${WHITE};letter-spacing:.03em;text-transform:uppercase}
.big span{color:${BLUE}}.big.sm2{font-size:78px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${WHITE};background:rgba(26,28,30,.88);padding:10px 24px 12px 22px;margin-bottom:10px;border-left:10px solid rgba(240,239,237,.5);max-width:880px}
.ln.b{border-left-color:${BLUE}}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:#a0a4a8;opacity:.75;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "38", bg: "#1A1C1E", vig: 0.45, grain: 0.05, capfloor: 0.35, html, css, chipFont: MN, chipColor: "#a0a4a8", sig: "EP38_TETRAPOD_BETON_PEMECAH_OMBAK",
  extraAt: ["s1:menahan", "s1:masuk",
    "s2:tetrapod", "s2:Yunani", "s2:Prancis", "s2:Danel",
    "s3:Masalahnya", "s3:pukulan", "s3:memantulkannya",
    "s4:lain", "s4:lapis", "s4:mengait", "s4:terkunci",
    "s5:rongga", "s5:Danel", "s5:separuh", "s5:kosong",
    "s6:menyusup", "s6:rongga", "s6:terpecah", "s6:bergesekan", "s6:habis", "s6:Pantulannya", "s6:terguling",
    "s7:Hudson", "s7:delapan", "s7:Casablanca", "s7:bergeser",
    "s8:menang", "s8:menjebak", "s8:AUDIRA", "s8:Episode"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:30,scale:.96},{opacity:1,y:0,scale:1,duration:.35,ease:'power4.out'},a-.08);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-20,duration:.22,ease:'power2.in'},b-.22);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.4,x:-12},{opacity:1,x:0,duration:.25,ease:'power3.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:.94});tl.to('#outro',{opacity:1,scale:1,duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:${WHITE};text-transform:uppercase;letter-spacing:.01em;background:rgba(26,28,30,.9);padding:10px 24px 14px;border-radius:4px;border-bottom:5px solid ${BLUE}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHITE}",scale:1},{color:"#5ABAFF",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHITE}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tetrapod Pemecah Ombak", "#1A1C1E");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
