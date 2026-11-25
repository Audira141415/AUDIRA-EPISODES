// EP30 BANDUL PEREDAM GEMPA GEDUNG. DISASTERSIM hazard-lab look: a sliced tower model on a slate plinth, a gold
// 41-plate ball with hydraulic dampers. Panels are slate instrument readouts with a coloured status strip that follows
// the warning ramp (teal, yellow, orange, red-orange); they slide in from the left like a lab monitor and lock.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const SLATE = "#1E252D", INK = "#EEF2F5", TEAL = "#2FB8A6", YEL = "#F2C94C", ORA = "#F2994A", RED = "#EB5A3C", GOLD = "#D8A33A";
const HD = "'Space Grotesk',sans-serif", MN = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag t">CARA KERJA BENDA &middot; EP 30</div>
  <div class="card"><div class="big">Bola baja<br><span>660 ton</span></div></div>
  <div class="ln t" data-at="s1:angin" data-fx="lit">Tugasnya: melawan angin</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag y">ANGIN KENCANG</div>
  <div class="ln y" data-at="s2:meter" data-fx="lit">Puncak goyang &gt; 1 meter</div>
  <div class="ln o" data-at="s2:mual" data-fx="lit">Penghuni bisa mual</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag t">TUNED MASS DAMPER</div>
  <div class="ln t" data-at="s3:tertala" data-fx="lit">Peredam massa tertala</div>
  <div class="ln g" data-at="s3:sembilan" data-fx="lit">Digantung dari lantai 92</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag y">IRAMA GOYANG</div>
  <div class="ln o" data-at="s4:besar" data-fx="lit">Didorong seirama: makin besar</div>
  <div class="ln t" data-at="s4:diatur" data-fx="lit">Irama bandul = irama gedung</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag t">ARAH BERLAWANAN</div>
  <div class="card" data-at="s5:melawan" data-fx="lit"><div class="big sm2">Bandul selalu<br><span>melawan</span> goyangan</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag o">PEREDAM HIDROLIK</div>
  <div class="ln o" data-at="s6:panas" data-fx="lit">Energi ayunan jadi panas</div>
  <div class="card" data-at="s6:persen" data-fx="lit"><div class="big sm2">Goyang turun<br><span>30&ndash;40%</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag y">41 LEMPENG &middot; &Oslash; 5,5 M</div>
  <div class="ln r" data-at="s7:topan" data-fx="lit">8 Agustus 2015: topan Soudelor</div>
  <div class="ln y" data-at="s7:terbesar" data-fx="lit">Ayunan &plusmn;1 m, terbesar tercatat</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:bandul" data-fx="lit"><div class="big sm2">Gedung tinggi<br>butuh <span>bandul</span></div></div>
  <div class="ln t" data-at="s8:Episode" data-fx="lit">Berikutnya: mata kucing reflektor jalan</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.14em;color:#0E1317;padding:9px 18px 8px;margin-bottom:16px;border-radius:4px}
.tag.t{background:${TEAL}}.tag.y{background:${YEL}}.tag.o{background:${ORA}}
.card{display:table;background:rgba(30,37,45,.92);border:2px solid rgba(238,242,245,.14);border-radius:10px;padding:16px 30px 22px;margin-bottom:16px;box-shadow:0 22px 44px rgba(0,0,0,.45)}
.big{font-family:${HD};font-weight:700;font-size:100px;line-height:1.0;color:${INK};letter-spacing:-.02em}
.big span{color:${GOLD}}.big.sm2{font-size:72px;line-height:1.06}
.ln{display:table;font-family:${HD};font-weight:700;font-size:42px;line-height:1.2;color:${INK};background:rgba(30,37,45,.92);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${TEAL};border-radius:0 8px 8px 0;box-shadow:0 10px 26px rgba(0,0,0,.4);max-width:880px}
.ln.y{border-left-color:${YEL}}.ln.o{border-left-color:${ORA}}.ln.r{border-left-color:${RED}}.ln.g{border-left-color:${GOLD}}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:${INK};opacity:.7;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "30", bg: SLATE, vig: 0.42, grain: 0.05, capfloor: 0.25, html, css, chipFont: MN, chipColor: INK, sig: "EP30_BANDUL_PEREDAM_GEMPA_GEDUNG",
  // every anchor read by world3d.js and mix.py
  extraAt: ["s1:ton", "s1:angin", "s2:kencang", "s2:meter", "s2:orang", "s2:mual", "s3:tertala", "s3:sembilan", "s3:pengunjung",
    "s4:mendorong", "s4:besar", "s4:diatur", "s5:miring", "s5:sebaliknya", "s5:melawan", "s6:hidrolik", "s6:panas", "s6:Hasilnya", "s6:berkurang", "s6:persen",
    "s7:lempeng", "s7:diameter", "s7:Tanggal", "s7:topan", "s7:berayun", "s7:terbesar", "s8:bandul", "s8:tenang", "s8:AUDIRA", "s8:Episode"],
  // panels slide in from the left like a lab monitor and lock with a short settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,skewX:-4},{opacity:1,x:0,skewX:0,duration:.42,ease:'power4.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:50,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45,x:-8},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${HD};font-weight:700;font-size:58px;line-height:1.16;color:${INK};text-transform:uppercase;letter-spacing:.01em;background:rgba(17,22,27,.9);padding:10px 24px 14px;border-radius:10px;border-bottom:6px solid ${TEAL}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${YEL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bandul Peredam Gedung", SLATE);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
