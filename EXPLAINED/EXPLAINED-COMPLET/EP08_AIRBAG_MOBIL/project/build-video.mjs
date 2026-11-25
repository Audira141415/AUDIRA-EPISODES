// EP08 AIRBAG MOBIL. PRECISION: photoreal product studio / crash-test lab. Panels are graphite spec cards with a
// Swiss grotesk headline, a mono "test sheet" tag and a laser-orange hairline; they slide in on a measured line
// (clip wipe left to right, like a plotter). Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ACC = "#FF5A1F", INK = "#F4F4F1", SUB = "#AEB4BC";
const TT = "'Inter Tight',sans-serif", MN = "'JetBrains Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA KERJA BENDA &middot; EP 08</div>
  <div class="card"><div class="big">Airbag<br><span>bukan berisi udara</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>01 &middot; SENSOR PERCEPATAN</div>
  <div class="ln" data-at="s2:mengukur" data-fx="lit">Mengukur seberapa cepat<br>mobil melambat</div>
</div>
<div class="p" data-in="s3" data-out="s3:Patokannya">
  <div class="tag"><i></i>02 &middot; UNIT KENDALI AIRBAG</div>
  <div class="ln" data-at="s3:memutuskan" data-fx="lit">Benturannya cukup keras?</div>
</div>
<div class="p" data-in="s3:Patokannya" data-out="s4">
  <div class="tag"><i></i>SETARA TEMBOK KOKOH</div>
  <div class="card" data-at="s3:tiga" data-fx="lit"><div class="big sm">13&ndash;23 <span>km/jam</span></div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>03 &middot; TABUNG PENGISI</div>
  <div class="ln" data-at="s4:pemantik" data-fx="lit">Pemantik menyalakan bahan kimia padat<br>&rarr; banyak gas yang tidak beracun</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>04 &middot; KANTONG NILON</div>
  <div class="card" data-at="s5:penuh" data-fx="lit"><div class="big sm">Mengembang <span>penuh</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s6:Kantong">
  <div class="tag"><i></i>05 &middot; TIDAK UNTUK TETAP KERAS</div>
  <div class="ln" data-at="s6:lubang" data-fx="lit">Gas keluar lewat lubang kecil<br>di kainnya</div>
</div>
<div class="p" data-in="s6:Kantong" data-out="s7">
  <div class="tag"><i></i>DIREDAM, BUKAN DIHENTIKAN</div>
  <div class="card gr">
    <svg viewBox="0 0 860 250" width="860" height="250">
      <line x1="40" y1="220" x2="840" y2="220" stroke="#5c636c" stroke-width="3"/>
      <line x1="40" y1="20" x2="40" y2="220" stroke="#5c636c" stroke-width="3"/>
      <text x="56" y="50" fill="#F4F4F1" font-family="JetBrains Mono" font-size="34">gaya pada tubuh</text>
      <text x="520" y="70" fill="#FF5A1F" font-family="Inter" font-weight="700" font-size="36">diredam</text>
      <text x="236" y="110" fill="#AEB4BC" font-family="Inter" font-weight="700" font-size="36">mendadak</text>
      <path class="ab" d="M60,218 L200,218 L214,34 L232,218 L840,218" fill="none" stroke="#8a919a" stroke-width="7" stroke-linejoin="round"/>
      <path class="sf" d="M60,218 L180,218 C260,218 280,120 360,120 C470,120 520,130 620,170 C700,200 760,214 840,216" fill="none" stroke="#FF5A1F" stroke-width="8" stroke-linecap="round"/>
    </svg>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Menurut">
  <div class="tag"><i></i>06 &middot; LEBIH CEPAT DARI KEDIPAN MATA</div>
  <div class="card" data-at="s7:seperdua" data-fx="lit"><div class="big">&lt; 1/20 <span>detik</span></div></div>
</div>
<div class="p" data-in="s7:Menurut" data-out="s8">
  <div class="tag"><i></i>NHTSA &middot; AIRBAG DEPAN</div>
  <div class="card" data-at="s7:lima" data-fx="lit"><div class="big sm">&gt; 50.000 <span>nyawa</span><br><span>dalam 30 tahun</span></div></div>
</div>
<div class="p" data-in="s8" data-out="s8:AUDIRA">
  <div class="tag"><i></i>07 &middot; HANYA PELENGKAP SABUK</div>
  <div class="ln" data-at="s8:pakai" data-fx="lit">Tetap pakai sabuk pengaman<br>Anak duduk di kursi belakang</div>
</div>
<div class="p" data-in="s8:AUDIRA" data-out="@END">
  <div class="tag"><i></i>AUDIRA &middot; CARA KERJA BENDA</div>
  <div class="card"><div class="big sm">Berikutnya:<br><span>kloset duduk</span></div></div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:34px;letter-spacing:.12em;color:${INK};background:rgba(17,19,22,.86);padding:9px 18px 8px;border-left:4px solid ${ACC};margin-bottom:14px}
.tag i{display:inline-block;width:12px;height:12px;background:${ACC};margin-right:14px;vertical-align:1px}
.card{display:table;color:${INK};background:rgba(17,19,22,.94);border-top:3px solid ${ACC};padding:14px 30px 22px;margin-bottom:14px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.card.gr{padding:16px 18px 10px}
.big{font-family:${TT};font-weight:800;font-size:100px;line-height:.98;color:inherit;letter-spacing:-.025em}
.big span{color:${ACC};font-weight:700}.big.sm{font-size:78px;line-height:1.02}
.big br+span{font-size:.62em;letter-spacing:-.01em}
.ln{display:table;font-family:${SN};font-weight:700;font-size:40px;line-height:1.2;color:${INK};background:rgba(17,19,22,.94);padding:11px 22px 12px 22px;margin-bottom:10px;border-left:6px solid ${ACC};max-width:880px}
.ln.g{border-left-color:#FFFFFF}.ln.dim{font-weight:700;font-size:40px;border-left-color:#FFFFFF}
.ln b.o{color:${ACC};margin-right:10px}.ln b.gy{color:#8a919a;margin-right:10px}
#chip{font-family:${MN};font-size:28px;color:#1a1c1f;background:rgba(255,255,255,.72);padding:4px 10px;opacity:.85;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "08", bg: "#DCDCDA", vig: 0.28, grain: 0.04, capfloor: 0.4, html, css, chipFont: MN, chipColor: "#1a1c1f", sig: "EP08_AIRBAG_MOBIL",
  extraAt: ["s1:gas", "s1:listrik", "s2:percepatan", "s2:mengukur", "s2:melambat", "s3:membaca", "s3:memutuskan", "s3:benturannya", "s3:keras",
    "s3:Patokannya", "s3:tembok", "s3:tiga", "s4:arus", "s4:pemantik", "s4:tabung", "s4:Bahan", "s4:bereaksi", "s4:menghasilkan", "s4:gas",
    "s5:mendorong", "s5:dasbor", "s5:penuh", "s6:kepalamu", "s6:sebagian", "s6:lubang", "s6:Kantong", "s6:diredam", "s6:mendadak",
    "s7:selesai", "s7:detik", "s7:kedipan", "s7:Menurut", "s8:sabuk", "s8:sabuk#2", "s8:anak", "s8:dudukkan", "s8:belakang", "s8:Ini", "s8:AUDIRA", "s6:bukan", "s7:lima", "s3:setara", "s1:reaksi", "s3:atau", "s4:tidak"],
  // panels wipe in left to right like a plotter line, and leave by sliding up a hair
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,clipPath:'inset(0 100% 0 0)',x:-16},{opacity:1,clipPath:'inset(0 0% 0 0)',x:0,duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-18,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:1,color:'#C3C8CE'},{opacity:1,color:'#F4F4F1',duration:.25,ease:'power2.out'},t),`,
  hud: `(()=>{const sf=document.querySelector('.sf'),ab=document.querySelector('.ab');if(!sf)return (t)=>{};const L=sf.getTotalLength(),L2=ab.getTotalLength();sf.style.strokeDasharray=L;ab.style.strokeDasharray=L2;
    const a=AT['s6:diredam']-.2,b=AT['s6:bukan']-.1;return (t)=>{const u=Math.min(1,Math.max(0,(t-a)/1.6)),v=Math.min(1,Math.max(0,(t-b)/0.7));sf.style.strokeDashoffset=L*(1-u);ab.style.strokeDashoffset=L2*(1-v);};})()`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.4,ease:'power2.out'},OUT-.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:-20px;right:-20px;bottom:0;text-align:center;background:rgba(12,13,15,.78);border-radius:12px;padding:12px 10px 14px;font-family:${SN};font-weight:800;font-size:60px;line-height:1.16;color:#FFFFFF;text-transform:uppercase;letter-spacing:.005em;text-shadow:0 3px 0 #111316,0 0 18px rgba(0,0,0,.8),3px 0 0 #111316,-3px 0 0 #111316,0 -3px 0 #111316}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${ACC}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Airbag Mobil", "#DCDCDA");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
