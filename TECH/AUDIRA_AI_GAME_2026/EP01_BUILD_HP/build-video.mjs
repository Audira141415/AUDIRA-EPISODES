// EP01 SATU KALIMAT. Sunlit toy-brick table, sticker cards that snap on like bricks. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1F2A44", YEL = "#FFC61A", RED = "#E5392F", BLU = "#1F7AE0", CRM = "#FFFBEF", BG = "#E9D2A6";
const F = "Fredoka,sans-serif", N = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">AI BIKIN GAME / EP 01</div>
  <div class="st big">1 KALIMAT<br><span>1 GAME</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">ROBLOX BUILD / JULI 2026</div>
  <div class="st h">Bikin game di aplikasi HP</div>
  <div class="row"><b class="st c" data-at="s2:Tidak#1" data-fx="pop">Tanpa komputer</b><b class="st c y" data-at="s2:Tidak#2" data-fx="pop">Tanpa coding</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">CONTOH PROMPT DARI ROBLOX</div>
  <div class="st h q">&ldquo;Game petualangan santai di hutan lebat, dengan banyak rintangan&rdquo;</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">YANG DIKERJAKAN AI</div>
  <div class="st h" data-at="s4:rencananya" data-fx="pop">1. Tulis rencana</div>
  <div class="st h" data-at="s4:kode" data-fx="pop">2. Baru dibuat:</div>
  <div class="chips"><b class="st c" data-at="s4:kode" data-fx="pop">kode</b><b class="st c y" data-at="s4:dunia" data-fx="pop">dunia</b><b class="st c b" data-at="s4:karakter" data-fx="pop">karakter</b><b class="st c" data-at="s4:tampilan" data-fx="pop">tampilan</b><b class="st c y" data-at="s4:suara" data-fx="pop">suara</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">PUTARANNYA</div>
  <div class="row"><b class="st c y" data-at="s5:mainkan" data-fx="pop">Main</b><b class="st c" data-at="s5:diubah" data-fx="pop">Ubah</b><b class="st c b" data-at="s5:uji" data-fx="pop">Uji lagi</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">PERCOBAAN AWAL, DATA ROBLOX</div>
  <div class="st big nb" data-at="s6:71" data-fx="pop"><span>71%</span></div>
  <div class="st h" data-at="s6:71" data-fx="pop">belum pernah pakai Roblox Studio</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">BATASNYA</div>
  <div class="st h" data-at="s7:dasar" data-fx="pop">&ldquo;Game dasar&rdquo;, titik awal</div>
  <div class="st h" data-at="s7:empat" data-fx="pop">Alpha: 4 negara</div>
  <div class="st h y" data-at="s7:enam" data-fx="pop">Game terbit: usia 16+</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="st big sm" data-at="s8:Jadi" data-fx="pop">AI memulai.<br><span>Ide serunya kamu.</span></div>
  <div class="st h y" data-at="s8:Kalau" data-fx="pop">Game apa yang kamu minta?</div>
</div>`;

const css = `
.st{display:block;background:${CRM};color:${INK};border:5px solid ${INK};border-radius:22px;box-shadow:0 9px 0 ${INK};font-family:${F}}
.tag{display:inline-block;font-family:${F};font-weight:600;font-size:27px;letter-spacing:.03em;color:#fff;background:${BLU};padding:6px 18px;border-radius:12px;margin-bottom:16px;border:4px solid ${INK}}
.big{font-weight:700;font-size:112px;line-height:1.02;padding:18px 26px 22px;margin-bottom:18px}.big span{color:${RED}}.big.sm{font-size:76px;line-height:1.06}
.h{font-weight:600;font-size:46px;line-height:1.14;padding:14px 22px 16px;margin-bottom:18px}.q{font-size:48px}
.y{background:${YEL}}.b{background:${BLU};color:#fff}
.row,.chips{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:18px}.c{font-weight:600;font-size:42px;line-height:1;padding:14px 20px 16px;border-radius:18px}
.nb{font-variant-numeric:tabular-nums}
#chip{font-weight:800;color:${INK};background:${CRM};padding:2px 12px;border-radius:8px;top:176px;font-size:21px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.22, grain: 0.03, capfloor: 0, html, css, chipFont: N, chipColor: INK,
  extraAt: ["s1:game", "s4:Baru", "s4:rencananya", "s4:kode", "s4:dunia", "s4:karakter", "s4:tampilan", "s4:suara", "s5:Hasilnya", "s5:mainkan", "s5:diubah", "s5:uji", "s6:71", "s7:Selandia", "s7:Singapura", "s7:Serbia", "s7:Thailand", "s7:Indonesia"],
  // Cards drop and seat like bricks.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-70,opacity:0},{y:0,opacity:1,duration:.34,ease:'back.out(1.8)'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-46,scale:.96,opacity:0,duration:.14,ease:'power2.in'},b-.14)`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{y:-44,scale:.86,opacity:0},{y:0,scale:1,opacity:1,duration:.3,ease:'back.out(2.2)'},t),`,
  // Closes as a stud-round iris from the phone.
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 50%)'});tl.to('#outro',{clipPath:'circle(125% at 50% 50%)',duration:.55,ease:'power3.in'},OUT-.25);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${F};font-weight:700;font-size:62px;line-height:1.14;color:#fff;-webkit-text-stroke:0;text-shadow:5px 0 0 ${INK},-5px 0 0 ${INK},0 5px 0 ${INK},0 -5px 0 ${INK},4px 4px 0 ${INK},-4px 4px 0 ${INK},4px -4px 0 ${INK},-4px -4px 0 ${INK},0 9px 0 ${INK}}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0},{color:"${YEL}",y:-7,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.16,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Satu Kalimat", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
