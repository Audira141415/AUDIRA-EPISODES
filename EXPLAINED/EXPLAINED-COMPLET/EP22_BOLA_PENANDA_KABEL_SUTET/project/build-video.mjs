// EP22 BOLA PENANDA SUTET (TACTICBOARD). Panels are a broadcast coach-board HUD: a navy score-bug tag, white chips with
// a team-colour edge, and a yellow telestrator underline that draws itself under the lit row. They slide down from the
// top edge like a broadcast lower-third flipped to the top.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#0F1B2D", WHITE = "#F6F7F9", TELE = "#FFE27A", CORAL = "#FF5A3C", COBALT = "#2F7BFF", ORANGE = "#FF7A1A", GOLD = "#FFC94A";
const HD = "'Barlow Condensed',sans-serif", BD = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 22</div>
  <div class="card"><div class="big">Bola oranye<br><span>untuk pilot</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">SUTET</div>
  <div class="ln" data-at="s2:bandara" data-fx="lit">Melintasi sungai, lembah, bandara</div>
  <div class="ln o" data-at="s2:terlihat" data-fx="lit">Dari kokpit: nyaris tak terlihat</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">TERBANG RENDAH</div>
  <div class="ln r" data-at="s3:menabraknya" data-fx="lit">Risiko menabrak kabel</div>
  <div class="ln o" data-at="s3:mencolok" data-fx="lit">Penanda siang: bola mencolok</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">DI KAWAT PALING ATAS</div>
  <div class="ln x" data-at="s4:bertegangan" data-fx="lit">Bukan di kabel bertegangan</div>
  <div class="ln g" data-at="s4:petir" data-fx="lit">Kawat tanah: pelindung petir</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">AMERIKA &amp; KANADA</div>
  <div class="ln o" data-at="s5:bergantian" data-fx="lit">Oranye &middot; putih bergantian (+ kuning)</div>
  <div class="ln o" data-at="s5:Kedua" data-fx="lit">Kedua ujung: oranye</div>
  <div class="ln o" data-at="s5:semuanya" data-fx="lit">Kurang dari 4 bola: semua oranye</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">UKURAN &middot; PEDOMAN AMERIKA</div>
  <div class="card" data-at="s6:sembilan" data-fx="lit"><div class="big sm2">min. <span>91 cm</span></div></div>
  <div class="ln" data-at="s6:enam" data-fx="lit">Jarak antarbola &plusmn; 60 m</div>
  <div class="ln b" data-at="s6:rapat" data-fx="lit">Kanada: lebih kecil, lebih rapat</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">MALAM HARI</div>
  <div class="ln r" data-at="s7:merah" data-fx="lit">Penanda menyala merah</div>
  <div class="ln g" data-at="s7:kabel" data-fx="lit">Tanpa baterai: energi dari kabel</div>
  <div class="ln x" data-at="s7:dimatikan" data-fx="lit">Saluran dimatikan = lampu padam</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:rambu" data-fx="lit"><div class="big sm2">Rambu lalu lintas<br><span>di udara</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: lubang kecil di jendela pesawat</div>
</div>`;

const css = `
.tag{display:table;font-family:${HD};font-weight:800;font-size:34px;letter-spacing:.1em;color:${WHITE};background:${NAVY};padding:8px 20px 6px 16px;margin-bottom:14px;border-left:10px solid ${ORANGE};border-radius:4px}
.card{display:table;background:${WHITE};border-radius:14px;padding:12px 30px 18px;margin-bottom:16px;box-shadow:0 16px 38px rgba(0,0,0,.45);border-bottom:8px solid ${TELE}}
.big{font-family:${HD};font-weight:800;font-size:110px;line-height:.95;color:${NAVY};text-transform:uppercase;letter-spacing:-.005em}
.big span{color:${ORANGE}}.big.sm2{font-size:84px;line-height:.98}
.ln{display:table;position:relative;font-family:${BD};font-weight:800;font-size:38px;line-height:1.2;color:${NAVY};background:${WHITE};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:10px solid ${COBALT};border-radius:0 10px 10px 0;box-shadow:0 8px 20px rgba(0,0,0,.35);max-width:900px}
.ln.o{border-left-color:${ORANGE}}.ln.r{border-left-color:${CORAL}}.ln.g{border-left-color:${GOLD}}.ln.b{border-left-color:${COBALT}}
.ln.x{border-left-color:${CORAL};text-decoration:line-through;text-decoration-color:${CORAL};text-decoration-thickness:5px}
#chip{font-family:${HD};font-size:28px;font-weight:700;color:${WHITE};opacity:.75;letter-spacing:.08em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("kit3d.js", L + "kit3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "22", bg: "#0B1118", vig: 0.42, grain: 0.04, capfloor: 0.3, html, css, chipFont: HD, chipColor: WHITE, sig: "EP22_BOLA_PENANDA_KABEL_SUTET",
  extraAt: ["s1:pilot", "s2:Kabel", "s2:sungai", "s2:bandara", "s2:kokpit", "s3:Helikopter", "s3:menabraknya", "s3:sadar", "s3:Karena", "s4:bertegangan",
    "s4:dijepit", "s4:petir", "s5:Amerika", "s5:kuning", "s5:Kedua", "s5:kurang", "s6:Ukurannya", "s6:sembilan", "s6:Jarak", "s6:enam", "s6:Aturan",
    "s6:Kanada", "s6:rapat", "s7:Malam", "s7:menyala", "s7:energinya", "s7:kabel", "s7:dimatikan", "s8:AUDIRA", "s8:Episode", "s1:Bola", "s3:mencolok",
    "s5:Warnanya", "s5:bergantian", "s5:semuanya", "s7:baterai", "s7:padam", "s8:rambu"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-70},{opacity:1,y:0,duration:.4,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-50,duration:.26,ease:'power2.in'},b-.26);}`,
  fxExtra: `lit:(e,t)=>{tl.fromTo(e,{opacity:.6,scale:.98,transformOrigin:'0% 50%'},{opacity:1,scale:1,duration:.25,ease:'back.out(2)'},t);},`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${HD};font-weight:800;font-size:66px;line-height:1.1;color:${WHITE};text-transform:uppercase;letter-spacing:.01em;background:rgba(15,27,45,.9);padding:8px 26px 12px;border-radius:10px;border-left:10px solid ${ORANGE}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHITE}",scale:1},{color:"${TELE}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHITE}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bola Penanda SUTET", "#0B1118");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
