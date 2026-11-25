// EP12 RITSLETING. SULAMFORGE: a macro embroidery studio. A brass zipper sewn into linen in a beech hoop, the slider
// cut away to show the Y channel; embroidered satin figures for Judson and Sundback; a rubber boot for the name "zipper".
// Panels are linen labels with a dashed running-stitch border and a woven crimson tag; they are "sewn in" left to right.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2B1A14", LINEN = "#F3E9D6", CRIMSON = "#9E1B32", GOLD = "#C9A04A", LEAF = "#3E7D4F";
const TT = "'Playfair Display',serif", MN = "'Space Mono',monospace", SN = "'Work Sans',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 12</div>
  <div class="card"><div class="big">Gigi kembar,<br><span class="sm">siapa yang</span> <span>mengunci?</span></div></div>
  <div class="ln" data-at="s1:Y" data-fx="lit">Jalur kecil berbentuk huruf Y</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">WHITCOMB JUDSON &middot; 1893</div>
  <div class="ln" data-at="s2:clasp" data-fx="lit">Pengait sepatu: <i>clasp locker</i></div>
  <div class="ln r" data-at="s2:macet" data-fx="lit">Sering macet, terbuka sendiri</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">GIDEON SUNDBACK</div>
  <div class="ln" data-at="s3:Swedia" data-fx="lit">Insinyur kelahiran Swedia</div>
  <div class="ln g" data-at="s3:terbit" data-fx="lit">Paten diajukan 1914, terbit 1917</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">GIGI PER INCI</div>
  <div class="card" data-at="s4:sepuluh" data-fx="lit"><div class="big sm2">4 <span>&rarr; 10</span></div></div>
  <div class="ln g" data-at="s4:cekungan" data-fx="lit">Tonjolan di satu sisi, cekungan di sisi lain</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SALING MENGUNCI</div>
  <div class="ln" data-at="s5:masuk" data-fx="lit">Tonjolan masuk ke cekungan</div>
  <div class="ln g" data-at="s5:sendok" data-fx="lit">Mirip sendok yang ditumpuk</div>
  <div class="ln" data-at="s5:cukup" data-fx="lit">Satu jenis gigi untuk kedua sisi</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">SLIDER</div>
  <div class="ln g" data-at="s6:mengunci" data-fx="lit">Ke atas: jalur Y menekan gigi</div>
  <div class="ln r" data-at="s6:membelah" data-fx="lit">Ke bawah: baji membelah kuncian</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">1923 &middot; B. F. GOODRICH</div>
  <div class="card" data-at="s7:zipper" data-fx="lit"><div class="big sm2">Zip<span>per</span></div></div>
  <div class="ln" data-at="s7:meniru" data-fx="lit">Meniru bunyinya saat ditarik</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:aus" data-fx="lit"><div class="big sm2">Yang aus: <span>slider</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: pulpen</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:#FFF3E2;background:${CRIMSON};padding:9px 18px 8px;margin-bottom:16px;border:2px dashed rgba(242,182,50,.75);outline:4px solid ${CRIMSON};box-shadow:0 8px 20px rgba(20,10,14,.45)}
.card{display:table;background:${LINEN};border-radius:8px;padding:16px 32px 22px;margin-bottom:16px;outline:3px dashed ${GOLD};outline-offset:-12px;box-shadow:0 22px 44px rgba(20,10,14,.55)}
.big{font-family:${TT};font-weight:900;font-size:92px;line-height:1.02;color:${INK}}
.big span{color:${CRIMSON}}.big .sm{font-size:62px;color:${INK}}.big.sm2{font-size:76px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:700;font-size:40px;line-height:1.2;color:${INK};background:${LINEN};padding:11px 26px 13px 24px;margin-bottom:12px;border-left:12px solid ${GOLD};border-radius:0 8px 8px 0;outline:2px dashed rgba(158,27,50,.45);outline-offset:-7px;box-shadow:0 10px 24px rgba(20,10,14,.45);max-width:880px}
.ln.r{border-left-color:${CRIMSON}}.ln.g{border-left-color:${LEAF}}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:#F3E9D6;opacity:.8;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "12", bg: "#2a1219", vig: 0.4, grain: 0.06, capfloor: 0.25, html, css, chipFont: MN, chipColor: "#F3E9D6", sig: "EP12_RITSLETING_ZIPPER",
  extraAt: ["s1:kembar", "s1:jalur", "s1:Y", "s1:mengunci",
    "s2:Tahun", "s2:Judson", "s2:mematenkan", "s2:sepatu", "s2:clasp", "s2:macet", "s2:terbuka",
    "s3:Gideon", "s3:Swedia", "s3:memperbaikinya", "s3:diajukan", "s3:terbit",
    "s4:Sundback", "s4:empat", "s4:sepuluh", "s4:tonjolan", "s4:cekungan",
    "s5:dipasang", "s5:dirapatkan", "s5:masuk", "s5:sendok", "s5:kembar", "s5:cukup",
    "s6:slider", "s6:tarik", "s6:atas", "s6:cabang", "s6:menyatu", "s6:mengunci", "s6:bawah", "s6:baji", "s6:membelah",
    "s7:zipper", "s7:muncul", "s7:bot", "s7:Goodrich", "s7:meniru", "s7:Zip",
    "s8:lepas", "s8:aus", "s8:giginya", "s8:AUDIRA", "s8:Episode", "s8:pulpen"],
  // panels are sewn in left to right, then unpicked upward
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,clipPath:'inset(0% 100% 0% 0%)',y:10},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',y:0,duration:.55,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-20,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-6},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:800;font-size:58px;line-height:1.16;color:#FFF3E2;text-transform:uppercase;letter-spacing:.01em;background:rgba(43,20,24,.9);padding:10px 24px 14px;border-radius:12px;outline:2px dashed rgba(242,182,50,.6);outline-offset:-8px}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF3E2",scale:1},{color:"#F2B632",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF3E2",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ritsleting", "#2a1219");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
