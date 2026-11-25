// EP23 LUBANG KECIL JENDELA PESAWAT. STAINEDGLASS: a stone cathedral chamber with a three-pane leadlight window.
// Panels are parchment cards on dark lead slabs with gold borders and serif text, entering with a stained-glass glow.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const LEAD = "#1A1B1E", PARCH = "#F1E6CF", GOLD = "#E8A33A", RUBY = "#B3122E", SAPPH = "#1F4FA8";
const TT = "Georgia,serif", MN = "'Courier New',monospace", SN = "'Segoe UI',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 23</div>
  <div class="card"><div class="big">Jendela pesawat<br><span class="sm">sengaja</span> <span>dilubangi</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">BREATHER HOLE</div>
  <div class="ln g" data-at="s2:kecil" data-fx="lit">Lubang sangat kecil di bawah jendela</div>
  <div class="ln r" data-at="s2:Namanya" data-fx="lit">Namanya: lubang napas</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">TIGA LAPIS</div>
  <div class="ln b" data-at="s3:tiga" data-fx="lit">Tiga lapis akrilik</div>
  <div class="ln g" data-at="s3:dalam" data-fx="lit">Lapisan dalam: pelindung goresan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">TEKANAN</div>
  <div class="ln r" data-at="s4:tipis" data-fx="lit">Udara luar sangat tipis</div>
  <div class="ln b" data-at="s4:Selisih" data-fx="lit">Selisih tekanan mendorong ke luar</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LAPISAN TENGAH</div>
  <div class="card" data-at="s5:Udara" data-fx="lit"><div class="big sm2">Tekanan <span>sama</span></div></div>
  <div class="ln g" data-at="s5:Akibatnya" data-fx="lit">Hanya lapisan luar menahan dorongan</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">CADANGAN</div>
  <div class="ln r" data-at="s6:gagal" data-fx="lit">Lapisan luar gagal? Tengah mengambil alih</div>
  <div class="ln g" data-at="s6:bocor" data-fx="lit">Sedikit bocor, sistem kabin menutupi</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">TUGAS KEDUA</div>
  <div class="ln b" data-at="s7:uap" data-fx="lit">Membuang uap air dari celah kaca</div>
  <div class="card" data-at="s7:bunga" data-fx="lit"><div class="big sm2">Bunga <span>es</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="ln g" data-at="s8:cari" data-fx="lit">Cari lubang kecil itu</div>
  <div class="ln b" data-at="s8:Episode" data-fx="lit">Berikutnya: bintik hitam di kaca mobil</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:26px;letter-spacing:.14em;color:${PARCH};background:${LEAD};padding:8px 18px 7px;margin-bottom:14px;border:2px solid ${GOLD};box-shadow:4px 4px 0 rgba(232,163,58,.35)}
.card{display:table;background:rgba(26,27,30,.88);border:3px solid ${GOLD};border-radius:4px;padding:14px 28px 18px;margin-bottom:14px;box-shadow:8px 8px 0 rgba(232,163,58,.25),0 20px 40px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:900;font-size:90px;line-height:1.05;color:${PARCH};letter-spacing:-.01em}
.big span{color:${GOLD}}.big .sm{font-size:60px;color:${PARCH}}.big.sm2{font-size:68px;line-height:1.08}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${PARCH};background:rgba(26,27,30,.85);padding:10px 22px 12px 20px;margin-bottom:10px;border-left:10px solid ${GOLD};border-radius:0 4px 4px 0;box-shadow:5px 5px 0 rgba(0,0,0,.35);max-width:880px}
.ln.r{border-left-color:${RUBY}}.ln.b{border-left-color:${SAPPH}}.ln.g{border-left-color:#1E7A4C}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:${PARCH};opacity:.7;letter-spacing:.08em;background:rgba(26,27,30,.65);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
copyFileSync("kit3d.js", L + "kit3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "23", bg: "#120D0A", vig: 0.35, grain: 0.05, capfloor: 0.1, html, css,
  chipFont: MN, chipColor: PARCH, sig: "EP23_LUBANG_KECIL_JENDELA_PESAWAT",
  extraAt: [
    "s1:aman", "s1:lubang",
    "s2:bawah", "s2:kecil", "s2:napas", "s2:Namanya",
    "s3:tiga", "s3:dalam", "s3:goresan",
    "s4:tipis", "s4:kabin", "s4:Selisih", "s4:mendorong", "s4:udara", "s4:luar",
    "s5:tengah", "s5:sama", "s5:Akibatnya", "s5:Udara",
    "s6:gagal", "s6:alih", "s6:bocor",
    "s7:uap", "s7:bunga",
    "s8:AUDIRA", "s8:cari", "s8:Episode",
  ],
  extraLib: ["kit3d.js"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:.92,y:20,filter:'brightness(1.8)'},{opacity:1,scale:1,y:0,filter:'brightness(1)',duration:.5,ease:'power3.out'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,filter:'brightness(.5)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.75,x:-5},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:56px;line-height:1.16;color:${PARCH};text-transform:uppercase;letter-spacing:.01em;background:rgba(26,27,30,.88);padding:10px 22px 14px;border-radius:8px;border:2px solid rgba(232,163,58,.4);box-shadow:6px 6px 0 rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${PARCH}",scale:1},{color:"${GOLD}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${PARCH}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lubang Kecil Jendela Pesawat", "#120D0A");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
