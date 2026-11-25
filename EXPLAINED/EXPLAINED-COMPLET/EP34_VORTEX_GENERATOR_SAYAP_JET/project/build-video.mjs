// EP34 VORTEX GENERATOR — MANUSCRIPT style: parchment ink diagrams of wing aerodynamics
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2C1810", PARCH = "#F0E4CE", GOLD = "#C5933A", RED = "#8B3A2E", BLUE = "#2E4A6E", GREEN = "#3A5C3A";
const TT = "Playfair Display,serif", MN = "'Courier Prime',monospace", SN = "'Source Sans 3',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 34</div>
  <div class="card"><div class="big">Sirip kecil<br><span class="sm">yang menjaga</span> <span>sayap</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">VORTEX GENERATOR</div>
  <div class="ln r" data-at="s2:Siripnya" data-fx="lit">Pendek, setinggi lapisan udara lambat</div>
  <div class="ln b" data-at="s2:dipasang" data-fx="lit">Berderet di dekat tepi depan sayap</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">LAPISAN BATAS</div>
  <div class="ln r" data-at="s3:tertahan" data-fx="lit">Udara dekat kulit sayap tertahan gesekan</div>
  <div class="ln b" data-at="s3:lambat" data-fx="lit">Lapisan batas: udara paling lambat</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ALIRAN LEPAS</div>
  <div class="ln r" data-at="s4:tekanan" data-fx="lit">Tekanan naik di belakang sayap</div>
  <div class="ln b" data-at="s4:berhenti" data-fx="lit">Lapisan lambat kehabisan tenaga, berbalik</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BAHAYA STALL</div>
  <div class="ln r" data-at="s5:anjlok" data-fx="lit">Gaya angkat anjlok</div>
  <div class="ln b" data-at="s5:melemah" data-fx="lit">Bilah kemudi melemah di udara kacau</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">PUSARAN MINI</div>
  <div class="ln r" data-at="s6:miring" data-fx="lit">Sirip dipasang miring terhadap aliran</div>
  <div class="ln b" data-at="s6:menyendok" data-fx="lit">Menyendok udara cepat ke lapisan lambat</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">BOEING 707 &middot; 50+ TAHUN</div>
  <div class="ln r" data-at="s7:Boeing" data-fx="lit">Boeing 707 generasi pertama</div>
  <div class="ln b" data-at="s7:menurunkan" data-fx="lit">Stall turun 4–10 knot</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:cari" data-fx="lit"><div class="big sm2">Cari <span>sirip kecil</span> itu</div></div>
  <div class="ln r" data-at="s8:Episode" data-fx="lit">Berikutnya: katup di kemasan kopi</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.14em;color:${PARCH};background:${RED};padding:8px 16px 7px;margin-bottom:14px;box-shadow:4px 4px 0 rgba(44,24,16,.3)}
.card{display:table;background:${PARCH};border-radius:4px;padding:14px 28px 18px;margin-bottom:14px;border:3px solid ${GOLD};box-shadow:8px 8px 0 rgba(197,147,58,.35),0 18px 36px rgba(44,24,16,.3)}
.big{font-family:${TT};font-weight:900;font-size:92px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${RED}}.big .sm{font-size:60px;color:${INK}}.big.sm2{font-size:68px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:39px;line-height:1.2;color:${INK};background:${PARCH};padding:9px 22px 11px 20px;margin-bottom:10px;border-left:10px solid ${GOLD};border-radius:0 4px 4px 0;box-shadow:5px 5px 0 rgba(44,24,16,.2);max-width:860px}
.ln.r{border-left-color:${RED}}.ln.b{border-left-color:${BLUE}}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:${INK};opacity:.7;letter-spacing:.06em;background:rgba(240,228,206,.7);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "34", bg: "#DDD0B8", vig: 0.28, grain: 0.06, capfloor: 0.1, html, css, chipFont: MN, chipColor: INK, sig: "EP34_VORTEX_GENERATOR_SAYAP_JET",
  extraAt: [
    "s1:sirip", "s1:berputar", "s1:sayap", "s1:menjaga",
    "s2:vortex", "s2:Siripnya", "s2:pendek", "s2:lapisan", "s2:dipasang", "s2:tepi",
    "s3:Udara", "s3:kulit", "s3:tertahan", "s3:Lapisan", "s3:batas", "s3:lambat",
    "s4:belakang", "s4:tekanan", "s4:kehabisan", "s4:berhenti", "s4:berbalik", "s4:lepas",
    "s5:aliran", "s5:anjlok", "s5:stall", "s5:Bilah", "s5:melemah",
    "s6:Sirip", "s6:miring", "s6:memutar", "s6:pusaran", "s6:tornado", "s6:menyendok", "s6:menempel",
    "s7:Boeing", "s7:tujuh#2", "s7:menurunkan", "s7:stall", "s7:empat", "s7:sepuluh",
    "s8:duduk", "s8:cari", "s8:AUDIRA", "s8:Episode", "s8:katup",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:20,scale:0.96},{opacity:1,y:0,scale:1,duration:.45,ease:'back.out(1.2)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,scale:0.97,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-5},{opacity:1,x:0,duration:.28,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:30});tl.to('#outro',{opacity:1,y:0,duration:.4,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:#FFF8EC;text-transform:uppercase;letter-spacing:.01em;background:rgba(44,24,16,.88);padding:10px 22px 13px;border-radius:10px;box-shadow:6px 6px 0 rgba(139,58,46,.85)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF8EC",scale:1},{color:"#C5933A",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF8EC",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Vortex Generator", "#DDD0B8");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
