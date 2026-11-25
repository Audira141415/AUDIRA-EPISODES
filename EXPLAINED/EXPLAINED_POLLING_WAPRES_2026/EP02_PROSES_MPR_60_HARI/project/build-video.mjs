// EP02 PROSES MPR 60 HARI. DATAPHYSICAL in a cool archive room: panels are dark slate museum plates with a brass
// hairline, a Fraunces title, the beat's key number as a 128 px JetBrains Mono chip, and short Inter rows that light on
// their word. Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const SLATE = "#181B21", HUD = "#ECEFF4", BRASS = "#D2B07A", AMBER = "#F2B450", TEAL = "#9FD3D6", ORANGE = "#D4521C";
const TITLE = "Fraunces,Georgia,serif", MONOF = "'JetBrains Mono',Consolas,monospace", BODY = "Inter,'Segoe UI',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">UUD 1945 · WAPRES KOSONG</div>
  <div class="plate"><div class="ttl">Batas konstitusi</div>
  <div class="chip">60 <small>HARI</small></div>
  <div class="ln or" data-at="s1:pemilu" data-fx="lit">Tanpa pemilu</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">SKENARIO KURSI KOSONG</div>
  <div class="plate"><div class="ttl">Pasal 8 ayat 2</div>
  <div class="chip" data-at="s2:dua" data-fx="lit">2 <small>NAMA</small> → 1</div>
  <div class="ln" data-at="s2:Bukan" data-fx="lit">Bukan rakyat, bukan partai</div>
  <div class="ln te" data-at="s2:Presiden" data-fx="lit">Presiden ajukan 2 nama, MPR pilih 1</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">JADWAL · BATAS 60 HARI</div>
  <div class="plate"><div class="ttl">Ini jadwalnya</div>
  <div class="chip"><span data-at="s3:12" data-fx="lit">12</span><span data-at="s3:25" data-fx="lit"> → 25</span> <small>NOV</small></div>
  <div class="ln" data-at="s3:12" data-fx="lit">12 Nov: Gibran resmi mundur</div>
  <div class="ln te" data-at="s3:25" data-fx="lit">25 Nov: batas serahkan 2 nama</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">MAJELIS PERMUSYAWARATAN RAKYAT</div>
  <div class="plate"><div class="ttl">Sidang paripurna</div>
  <div class="chip" data-at="s4:9" data-fx="lit">9 DES <small>2026</small></div>
  <div class="ln te" data-at="s4:DPD" data-fx="lit">MPR = DPR + DPD</div>
  <div class="ln or" data-at="s4:dilantik" data-fx="lit">Suara terbanyak dilantik hari itu</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DUA JALUR KONSTITUSI</div>
  <div class="plate"><div class="ttl">Bukan pemakzulan</div>
  <div class="chip" data-at="s5:tiga" data-fx="lit">3 <small>LEMBAGA</small></div>
  <div class="ln" data-at="s5:DPR" data-fx="lit">Pemakzulan: DPR → MK → MPR</div>
  <div class="ln or" data-at="s5:Presiden" data-fx="lit">Penggantian: Presiden → MPR</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KOALISI MENYERAHKAN PILIHAN</div>
  <div class="plate"><div class="ttl">Keputusan satu orang</div>
  <div class="chip" data-at="s6:satu" data-fx="lit">1 <small>ORANG</small></div>
  <div class="ln" data-at="s6:PAN" data-fx="lit">PAN · Demokrat · PKS · Golkar</div>
  <div class="ln or" data-at="s6:Prabowo" data-fx="lit">Pilihan diserahkan ke Prabowo</div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">MASA JABATAN WAPRES BARU</div>
  <div class="plate"><div class="ttl">Bukan 5 tahun penuh</div>
  <div class="chip" data-at="s7:2029" data-fx="lit"><small>SAMPAI</small> 2029</div>
  <div class="ln" data-at="s7:sisa" data-fx="lit">Meneruskan sisa periode</div>
  <div class="ln or" data-at="s7:tiga" data-fx="lit">Hampir 3 tahun</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">PROSES MPR · 60 HARI</div>
  <div class="plate"><div class="ttl">Satu nama terpilih</div>
  <div class="chip">9 DES <small>2026</small></div>
  <div class="ln te" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA Explained</div></div>
</div>`;

const css = `
.tag{display:table;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.12em;color:${AMBER};background:rgba(24,27,33,.9);padding:9px 18px 8px;margin-bottom:10px;border-left:6px solid ${AMBER}}
.plate{display:table;background:linear-gradient(180deg,rgba(28,32,40,.86),rgba(20,23,29,.8));border:2px solid rgba(210,176,122,.55);padding:14px 30px 18px;box-shadow:0 18px 40px rgba(0,0,0,.4)}
.ttl{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:76px;line-height:1.04;color:${HUD};letter-spacing:-.005em;white-space:nowrap}
.chip{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:128px;line-height:1.05;color:#F0D9A6;margin:2px 0 6px;letter-spacing:-.02em;white-space:nowrap}
.chip small{font-size:52px;letter-spacing:.06em;color:${BRASS};vertical-align:.62em}
.ln{font-family:Inter,'Segoe UI',sans-serif;font-weight:600;font-size:42px;line-height:1.22;color:${HUD};padding:4px 0 4px 16px;border-left:6px solid rgba(236,239,244,.5);margin-top:8px;max-width:860px}
.ln.te{border-left-color:${TEAL}}
.ln.or{border-left-color:${ORANGE}}
#chip{background:rgba(24,27,33,.82);color:${HUD};padding:5px 12px;opacity:.9}
#outro .cr,#outro .cta{color:#F2F2F2}
#outro img{filter:brightness(.96)}
#sig{color:#ECEFF4}`;

// anchors used only inside world3d.js: scan "sN:word" strings
const w3 = readFileSync("world3d.js", "utf8");
const extraAt = [...new Set([...w3.matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: SLATE, vig: 0.16, grain: 0.03, capfloor: 0.4, html, css, chipFont: MONOF, chipColor: HUD, sig: "EP02_PROSES_MPR_60_HARI",
  chip: "ILUSTRASI, BUKAN CUPLIKAN ASLI",
  extraAt,
  // panels slide in along the film's axis (left to right, like reading the ruler), exit to the right
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-60,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:60,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.38},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});
// captions: fold stray punctuation tokens ("." after a {display|spoken} brace) into the previous word
const words = [];
for (const w of TL.words) { if (/^[.,:;!?]+$/.test(w.text) && words.length) { const p = words[words.length - 1]; words[words.length - 1] = { ...p, text: p.text + w.text, end: w.end }; } else words.push(w); }
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,'Segoe UI',sans-serif;font-weight:800;font-size:58px;line-height:1.2;color:${HUD};text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 3px rgba(0,0,0,.9)}
.w{display:inline-block;margin:0 .2em;padding:0 .1em;border-radius:6px}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(159,211,214,0)",color:"${HUD}",scale:1},{backgroundColor:"rgba(159,211,214,0.92)",color:"#14181E",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(159,211,214,0)",color:"${HUD}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Proses MPR 60 Hari", SLATE);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
