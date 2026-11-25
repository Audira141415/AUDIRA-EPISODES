// EP37 BATU BALAS (INNERWORKS): a sliced railway cross-section diorama on a studio plinth. Angular ballast stones
// interlock under steel rails and concrete sleepers; a cutaway shows load distribution. Panels are INNERWORKS
// callout cards: cream card, navy type, orange highlight, teal mono tag, slide-in along a leader line.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#14202B", CREAM = "#F6F1E7", ORANGE = "#F07B2D", TEAL = "#0F6E73";
const TT = "Archivo,sans-serif", MN = "'JetBrains Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 37</div>
  <div class="card"><div class="big">Batu tajam<br>di <span>rel kereta</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">BATU BALAS</div>
  <div class="ln" data-at="s2:balas" data-fx="lit">Nama: batu balas</div>
  <div class="ln o" data-at="s2:kapal" data-fx="lit">Istilah dari dunia kapal</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">SPESIFIKASI</div>
  <div class="card" data-at="s3:pecah" data-fx="lit"><div class="big sm2">2,5&ndash;6 <span>cm</span></div></div>
  <div class="ln" data-at="s3:tajam" data-fx="lit">Sudut banyak dan tajam</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">TUGAS 1: SEBAR BEBAN</div>
  <div class="ln" data-at="s4:Roda" data-fx="lit">Roda &rarr; rel &rarr; bantalan &rarr; batu</div>
  <div class="ln o" data-at="s4:tanah" data-fx="lit">30 cm batu menyebar ke tanah luas</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">TUGAS 2: KUNCI REL</div>
  <div class="ln" data-at="s5:mencengkeram" data-fx="lit">Sudut tajam saling mencengkeram</div>
  <div class="ln o" data-at="s5:kelereng" data-fx="lit">Kerikil bulat? Menggelinding</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">UJI PANAS &amp; HUJAN</div>
  <div class="ln" data-at="s6:memuai" data-fx="lit">Rel baja memuai ke samping</div>
  <div class="ln" data-at="s6:menahannya" data-fx="lit">Gundukan batu menahan</div>
  <div class="ln o" data-at="s6:hujan" data-fx="lit">Air hujan cepat turun lewat celah</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">BEBAN MAKSIMAL</div>
  <div class="card" data-at="s7:gandar" data-fx="lit"><div class="big sm2">18 ton <span>/ gandar</span></div></card>
  <div class="ln" data-at="s7:pemadat" data-fx="lit">Mesin pemadat: angkat &amp; jejalkan</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:fondasi" data-fx="lit"><div class="big sm2">Fondasi <span>yang bisa disetel</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: beton berkaki empat</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:800;font-size:28px;letter-spacing:.12em;color:#FFFFFF;background:${TEAL};padding:9px 18px 8px;margin-bottom:14px;border-radius:4px}
.card{display:table;background:${CREAM};border-radius:10px;padding:14px 30px 20px;margin-bottom:14px;border-top:8px solid ${ORANGE};box-shadow:0 24px 48px rgba(6,20,24,.45)}
.big{font-family:${TT};font-weight:900;font-size:104px;line-height:1.0;color:${NAVY};letter-spacing:-.02em}
.big span{color:${ORANGE}}.big.sm2{font-size:76px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${NAVY};background:${CREAM};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${TEAL};border-radius:0 8px 8px 0;box-shadow:0 14px 30px rgba(6,20,24,.38);max-width:880px}
.ln.o{border-left-color:${ORANGE}}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:#E6F4F5;opacity:.8;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "37", bg: "#10262A", vig: 0.38, grain: 0.06, capfloor: 0.3, html, css, chipFont: MN, chipColor: "#E6F4F5", sig: "EP37_BATU_BALAST_REL_KERETA_API",
  extraAt: ["s1:amblas", "s1:melengkung",
    "s2:balas", "s2:kapal", "s2:pemberat", "s2:stabil",
    "s3:pecah", "s3:sentimeter", "s3:sudut", "s3:tajam",
    "s4:menyebar", "s4:beban", "s4:Roda", "s4:bantalan", "s4:tekanan", "s4:tanah", "s4:luas",
    "s5:mengunci", "s5:mencengkeram", "s5:tembok", "s5:semen", "s5:bulat", "s5:menggelinding", "s5:kelereng",
    "s6:terik", "s6:memuai", "s6:samping", "s6:menahannya", "s6:melengkung", "s6:Celah", "s6:hujan", "s6:rumput",
    "s7:Kementerian", "s7:gandar", "s7:turun", "s7:pemadat", "s7:mengangkat", "s7:menjejalkan", "s7:rata",
    "s8:fondasi", "s8:disetel", "s8:AUDIRA", "s8:Episode"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,clipPath:'inset(0 100% 0 0)'},{opacity:1,x:0,clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:40,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;background:rgba(20,32,43,.92);padding:10px 24px 14px;border-radius:12px;border-bottom:6px solid ${ORANGE}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"#FFB46A",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Batu Balas Rel Kereta", "#10262A");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
