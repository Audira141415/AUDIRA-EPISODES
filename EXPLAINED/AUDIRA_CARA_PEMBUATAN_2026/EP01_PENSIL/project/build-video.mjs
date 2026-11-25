// EP01 PENSIL. SKETCHFORGE: a graphite-drawn sketchbook world; panels are taped sketchbook notes on cream paper,
// graphite ink, one accent (pencil yellow) used as a highlighter. Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2F3034", PAPER = "#FBF7EF", CREAM = "#F3EBDD", Y = "#F2B31B";
const HANDF = "Caveat,cursive", MONOF = "'JetBrains Mono',monospace", BODY = "Kalam,cursive";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA PEMBUATAN · EP 01</div>
  <div class="card"><div class="big">PENSIL</div><div class="sub">isinya tidak pernah <span class="hl">timbal</span></div></div>
  <div class="ln" data-at="s1:Sama" data-fx="lit">Sama sekali.</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">ABAD KE-16 · INGGRIS</div>
  <div class="card"><div class="big md">Grafit dikira timbal</div></div>
  <div class="ln" data-at="s2:keliru" data-fx="lit">Namanya keliru sampai sekarang</div>
  <div class="ln y" data-at="s2:cat" data-fx="lit">Yang dulu bisa mengandung timbal: catnya</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">LANGKAH 1 · ISI PENSIL</div>
  <div class="card"><div class="big sm">Grafit + tanah liat + air</div></div>
  <div class="ln" data-at="s3:didorong" data-fx="lit">Dipres lewat lubang kecil</div>
  <div class="ln" data-at="s3:spageti" data-fx="lit">Jadi batang seperti spageti</div>
  <div class="ln" data-at="s3:dipotong" data-fx="lit">Dipotong, lalu dikeringkan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">LANGKAH 2 · BAKAR</div>
  <div class="card"><div class="big md">Dibakar seperti keramik</div></div>
  <div class="ln y" data-at="s4:derajat" data-fx="lit">Sekitar 1.000 derajat</div>
  <div class="ln" data-at="s4:oksigen" data-fx="lit">Tanpa oksigen</div>
  <div class="ln" data-at="s4:direndam" data-fx="lit">Direndam lilin panas</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LANGKAH 3 · KAYU</div>
  <div class="card"><div class="big md">Roti lapis kayu</div></div>
  <div class="ln" data-at="s5:diletakkan" data-fx="lit">Papan cedar beralur: lem + isi</div>
  <div class="ln" data-at="s5:ditutup" data-fx="lit">Ditutup papan kedua, dipres</div>
  <div class="ln y" data-at="s5:pisau" data-fx="lit">Dipotong jadi beberapa pensil</div>
  <div class="stp" data-at="s5:dibor" data-fx="stamp">TIDAK DIBOR</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KERAS ATAU LUNAK?</div>
  <div class="card"><div class="big md">Kuncinya rasio</div></div>
  <div class="row">
    <div class="hb" data-at="s6:H" data-fx="lit"><b>H</b><span>lebih banyak tanah liat</span><span>keras, terang</span></div>
    <div class="hb dk" data-at="s6:B" data-fx="lit"><b>B</b><span>lebih banyak grafit</span><span>lunak, hitam</span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">LANGKAH 4 · CAT</div>
  <div class="card"><div class="big md">Diampelas, dicat berlapis</div></div>
  <div class="ln y" data-at="s7:dicat" data-fx="lit">Sampai <b class="ct nb" data-from="0" data-to="8" data-a="s7:dicat" data-d="1.4">0</b> lapis, bahkan lebih</div>
  <div class="ln" data-at="s7:cincin" data-fx="lit">Cincin logam + karet penghapus</div>
  <div class="ln" data-at="s7:miliar" data-fx="lit">Lebih dari 2 miliar pensil/tahun</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">JADI...</div>
  <div class="card"><div class="big md">Keramik di dalam kayu</div></div>
  <div class="ln y" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA untuk cara pembuatan berikutnya</div>
</div>`;

const css = `
.p{transform:rotate(-1.2deg)}
.tag{display:table;font-family:${MONOF};font-weight:700;font-size:26px;letter-spacing:.12em;color:${CREAM};background:${INK};padding:9px 18px 8px;margin-bottom:12px;border-left:8px solid ${Y}}
.card{display:table;position:relative;background:${PAPER};padding:6px 30px 12px;margin-bottom:14px;box-shadow:0 14px 34px rgba(30,25,20,.35);border:2px solid ${INK}}
.card:before{content:"";position:absolute;left:38%;top:-16px;width:120px;height:30px;background:rgba(242,179,27,.72);transform:rotate(-3deg)}
.big{font-family:${HANDF};font-weight:700;font-size:150px;line-height:1;color:${INK};letter-spacing:.01em}
.big.md{font-size:92px;line-height:1.02}.big.sm{font-size:80px;line-height:1.02}
.sub{font-family:${BODY};font-weight:700;font-size:44px;color:${INK};margin-top:-4px}
.hl{background:linear-gradient(transparent 55%,rgba(242,179,27,.85) 55%);padding:0 6px}
.ln{display:table;font-family:${BODY};font-weight:700;font-size:42px;line-height:1.2;color:#1d1e21;background:rgba(251,247,239,.97);padding:8px 20px 8px 18px;margin-bottom:9px;border-left:6px solid ${INK};max-width:880px;box-shadow:0 6px 16px rgba(30,25,20,.22)}
.ln.y{border-left-color:${Y};background:linear-gradient(90deg,rgba(242,179,27,.42),rgba(251,247,239,.93) 60%)}
.ln b{font-family:${MONOF};font-size:42px}
.stp{display:table;margin-top:10px;font-family:${MONOF};font-weight:800;font-size:46px;letter-spacing:.08em;color:${INK};border:6px solid ${INK};padding:6px 20px;background:rgba(242,179,27,.92)}
.row{display:flex;gap:16px}
.hb{flex:1;background:${PAPER};border:3px solid ${INK};padding:10px 18px 14px;box-shadow:0 10px 24px rgba(30,25,20,.3)}
.hb b{display:block;font-family:${MONOF};font-weight:800;font-size:96px;line-height:1;color:#9a9ba1}
.hb.dk b{color:#1d1e21}
.hb span{display:block;font-family:${BODY};font-weight:700;font-size:36px;line-height:1.2;color:${INK}}
#chip{background:rgba(47,48,52,.82);color:${CREAM};padding:5px 12px;opacity:.9}
#capfloor{background:linear-gradient(180deg,rgba(243,235,221,0),rgba(243,235,221,.62) 40%,rgba(243,235,221,.62) 70%,rgba(243,235,221,0))}`;

// anchors used only inside world3d.js: scan A("sN:word") calls
const w3 = readFileSync("world3d.js", "utf8");
const extraAt = [...new Set([...w3.matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: "#2A2826", vig: 0.32, grain: 0.07, capfloor: 0.5, html, css, chipFont: MONOF, chipColor: CREAM, sig: "EP01_PENSIL",
  chip: "ILUSTRASI, BUKAN REKAMAN PABRIK ASLI",
  extraAt,
  // panels are drawn in: a wipe from the left like a pencil stroke, then settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-30,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:40,clipPath:'inset(0% 0% 0% 100%)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.64},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${BODY};font-weight:700;font-size:62px;line-height:1.18;color:${INK};text-shadow:0 0 3px ${PAPER},0 0 8px ${PAPER},2px 2px 0 ${PAPER},-2px -2px 0 ${PAPER},2px -2px 0 ${PAPER},-2px 2px 0 ${PAPER}}
.w{display:inline-block;margin:0 .2em;padding:0 .08em;border-radius:4px}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(242,179,27,0)",scale:1},{backgroundColor:"rgba(242,179,27,0.9)",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(242,179,27,0)",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Cara Pembuatan Pensil", "#2A2826");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
