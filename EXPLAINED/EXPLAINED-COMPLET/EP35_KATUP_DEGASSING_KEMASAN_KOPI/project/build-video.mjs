// EP35 KATUP DEGASSING — FOODFORGE style: warm coffee-caramel kitchen world
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const COFFEE = "#3C2415", CREAM = "#F5E6D0", COPPER = "#B87333", WOOD = "#8B6B47", CARAMEL = "#D4A574", CERAMIC = "#E8DDD0", GREEN = "#4A6741";
const TT = "'DM Serif Display',serif", MN = "'JetBrains Mono',monospace", SN = "'Nunito',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 35</div>
  <div class="card"><div class="big">Satu tombol kecil<br><span class="sm">di kemasan</span> <span>kopi</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">KATUP SATU ARAH</div>
  <div class="ln r" data-at="s2:disangrai" data-fx="lit">Sangrai memicu reaksi kimia → CO₂</div>
  <div class="ln b" data-at="s2:pori-pori" data-fx="lit">Gas terperangkap di pori-pori biji</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">GAS KELUAR</div>
  <div class="ln r" data-at="s3:pelan-pelan" data-fx="lit">Gas keluar berminggu-minggu</div>
  <div class="ln b" data-at="s3:menggembung" data-fx="lit">Kantong menggembung, bisa pecah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ANCAMAN OKSIGEN</div>
  <div class="ln r" data-at="s4:Oksigen" data-fx="lit">Oksigen merusak minyak aroma biji</div>
  <div class="ln b" data-at="s4:apak" data-fx="lit">Kopi cepat apak</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">GOGLIO &middot; ITALIA 1968</div>
  <div class="ln r" data-at="s5:Goglio" data-fx="lit">Goglio mengembangkan katup satu arah</div>
  <div class="ln b" data-at="s5:mematenkannya" data-fx="lit">Dipatenkan tahun 1968</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">MEKANISME KATUP</div>
  <div class="ln r" data-at="s6:Piringan" data-fx="lit">Piringan karet + minyak silikon menutup lubang</div>
  <div class="ln b" data-at="s6:melengkung" data-fx="lit">Tekanan mendorong → piringan melengkung → gas lolos</div>
  <div class="ln g" data-at="s6:rapat" data-fx="lit">Minyak membuat segel rapat, udara luar tak bisa masuk</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">1 MILIAR KATUP / TAHUN</div>
  <div class="ln r" data-at="s7:Samo" data-fx="lit">Peneliti Samo Smrke: katup tidak memilih gas</div>
  <div class="ln b" data-at="s7:miliar" data-fx="lit">Goglio: 1 miliar+ katup setiap tahun</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:bernapas" data-fx="lit"><div class="big sm2">Kopi <span>bernapas</span><br>udara tak masuk</div></div>
  <div class="ln r" data-at="s8:Episode" data-fx="lit">Berikutnya: anoda korban di lambung kapal</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.12em;color:${CREAM};background:${COFFEE};padding:8px 16px 7px;margin-bottom:14px;border-radius:6px;box-shadow:4px 4px 0 rgba(60,36,21,.3)}
.card{display:table;background:${CREAM};border-radius:8px;padding:14px 28px 18px;margin-bottom:14px;border:3px solid ${COPPER};box-shadow:8px 8px 0 rgba(184,115,51,.3),0 18px 36px rgba(60,36,21,.3)}
.big{font-family:${TT};font-weight:900;font-size:90px;line-height:1.0;color:${COFFEE};letter-spacing:-.01em}
.big span{color:${COPPER}}.big .sm{font-size:58px;color:${WOOD}}.big.sm2{font-size:66px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:38px;line-height:1.2;color:${COFFEE};background:${CREAM};padding:9px 22px 11px 20px;margin-bottom:10px;border-left:10px solid ${COPPER};border-radius:0 6px 6px 0;box-shadow:5px 5px 0 rgba(60,36,21,.2);max-width:860px}
.ln.r{border-left-color:${COPPER}}.ln.b{border-left-color:${CARAMEL}}.ln.g{border-left-color:${GREEN}}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:${COFFEE};opacity:.7;letter-spacing:.06em;background:rgba(245,230,208,.7);padding:3px 10px;border-radius:4px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "35", bg: "#D8C8B0", vig: 0.25, grain: 0.05, capfloor: 0.1, html, css, chipFont: MN, chipColor: COFFEE, sig: "EP35_KATUP_DEGASSING_KEMASAN_KOPI",
  extraAt: [
    "s1:Sekilo", "s1:kopi", "s1:lima", "s1:gas", "s1:tombol",
    "s2:katup", "s2:disangrai", "s2:karbon", "s2:pori-pori",
    "s3:pelan-pelan", "s3:menggembung", "s3:pecah",
    "s4:dilubangi", "s4:Oksigen", "s4:merusak", "s4:aroma", "s4:apak",
    "s5:melubangi", "s5:Goglio", "s5:mematenkannya", "s5:delapan",
    "s6:Piringan", "s6:silikon", "s6:mendorong", "s6:melengkung", "s6:lolos", "s6:kembali", "s6:rapat",
    "s7:Samo", "s7:Smrke", "s7:miliar", "s7:Goglio",
    "s8:tombol", "s8:bernapas", "s8:AUDIRA", "s8:Episode", "s8:anoda",
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:18,scale:0.97},{opacity:1,y:0,scale:1,duration:.4,ease:'back.out(1.1)'},a-.08);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-12,scale:0.97,duration:.25,ease:'power2.in'},b-.25);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-4},{opacity:1,x:0,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:28});tl.to('#outro',{opacity:1,y:0,duration:.35,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:#FFF5E8;text-transform:uppercase;letter-spacing:.01em;background:rgba(60,36,21,.88);padding:10px 22px 13px;border-radius:10px;box-shadow:6px 6px 0 rgba(184,115,51,.8)}
.w{display:inline-block;margin:0 .18em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF5E8",scale:1},{color:"#B87333",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF5E8",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12},{y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Katup Degassing Kopi", "#D8C8B0");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
