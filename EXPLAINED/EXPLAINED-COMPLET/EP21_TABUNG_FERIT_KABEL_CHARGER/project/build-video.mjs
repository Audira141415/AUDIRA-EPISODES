// EP21 TABUNG FERIT (CIRCUITFORGE). Panels are dark solder-mask diagnostic cards with a copper edge, a cyan clock
// line and gold pin dots; they slide in from the right like a chip seating into a socket.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const MASK = "#0A1F18", CU = "#C87533", GOLD = "#D9AE4F", CY = "#39D5FF", AMB = "#FFB547", TXT = "#E9EFE9";
const HD = "'Space Grotesk',sans-serif", MN = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 21</div>
  <div class="card"><div class="big">Tabung kecil<br><span>di kabel charger</span></div></div>
  <div class="ln x" data-at="s1:baterai" data-fx="lit">Bukan baterai</div>
  <div class="ln x" data-at="s1:sekring" data-fx="lit">Bukan sekring</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">INTI FERIT</div>
  <div class="ln" data-at="s2:keramik" data-fx="lit">Isinya: cincin keramik padat</div>
  <div class="ln" data-at="s2:chip" data-fx="lit">Tanpa kabel lain, tanpa chip</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KABEL PANJANG = ANTENA</div>
  <div class="ln c" data-at="s3:memancarkan" data-fx="lit">Memancarkan gangguan</div>
  <div class="ln a" data-at="s3:menangkap" data-fx="lit">Menangkap gangguan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SUMBER: CHARGER</div>
  <div class="card" data-at="s4:ratusan" data-fx="lit"><div class="big sm2">Ratusan ribu kali<br><span>per detik</span></div></div>
  <div class="ln a" data-at="s4:derau" data-fx="lit">Derau frekuensi tinggi</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BAHAN FERIT</div>
  <div class="ln" data-at="s5:oksida" data-fx="lit">Oksida besi + nikel / seng / mangan</div>
  <div class="ln c" data-at="s5:magnetis" data-fx="lit">Magnetis, hampir tak menghantar listrik</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">CARA KERJANYA</div>
  <div class="ln c" data-at="s6:meniadakan" data-fx="lit">Arus pengisian: berlawanan, lolos</div>
  <div class="ln a" data-at="s6:menumpuk" data-fx="lit">Derau: searah, menumpuk</div>
  <div class="ln h" data-at="s6:panas" data-fx="lit">Dibuang jadi panas kecil</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">TOKYO &middot; 1930</div>
  <div class="ln" data-at="s7:Yogoro" data-fx="lit">Yogoro Kato &amp; Takeshi Takei</div>
  <div class="card" data-at="s7:berdirilah" data-fx="lit"><div class="big sm2">1935: <span>TDK</span> berdiri</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:pemancar" data-fx="lit"><div class="big sm2">Bukan <span>pemancar</span><br>radio dadakan</div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: bola penanda kabel SUTET</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:800;font-size:28px;letter-spacing:.14em;color:${MASK};background:${GOLD};padding:8px 18px 7px;margin-bottom:16px;clip-path:polygon(0 0,100% 0,100% 70%,94% 100%,0 100%)}
.card{display:table;background:rgba(10,31,24,.92);border:3px solid ${CU};border-radius:4px;padding:14px 30px 20px;margin-bottom:16px;box-shadow:0 0 0 1px rgba(57,213,255,.25),0 22px 44px rgba(0,0,0,.5);position:relative}
.card:before{content:"";position:absolute;left:18px;right:18px;top:-3px;height:3px;background:${CY};box-shadow:0 0 12px ${CY}}
.big{font-family:${HD};font-weight:700;font-size:90px;line-height:1.0;color:${TXT};letter-spacing:-.02em}
.big span{color:${CY}}.big.sm2{font-size:70px;line-height:1.06}
.ln{display:table;font-family:${MN};font-weight:700;font-size:38px;line-height:1.22;color:${TXT};background:rgba(10,31,24,.9);padding:10px 24px 12px 22px;margin-bottom:12px;border-left:10px solid ${GOLD};border-radius:0 4px 4px 0;max-width:900px}
.ln.c{border-left-color:${CY}}.ln.a{border-left-color:${AMB}}.ln.h{border-left-color:#FF6A2A}
.ln.x{text-decoration:line-through;text-decoration-color:#FF5A4A;text-decoration-thickness:5px;border-left-color:#FF5A4A}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${TXT};opacity:.7;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("kit3d.js", L + "kit3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "21", bg: "#06110D", vig: 0.5, grain: 0.05, capfloor: 0.35, html, css, chipFont: MN, chipColor: TXT, sig: "EP21_TABUNG_FERIT_KABEL_CHARGER",
  extraAt: ["s2:cangkang", "s2:membungkus", "s3:antena", "s3:menangkap", "s3:alat", "s4:Sumber", "s4:Rangkaian", "s4:menyala", "s4:ratusan", "s4:derau",
    "s4:merambat", "s5:oksida", "s5:nikel", "s5:seng", "s5:mangan", "s5:magnetis", "s5:menghantarkan", "s6:Arus", "s6:Medan", "s6:meniadakan", "s6:Derau",
    "s6:searah", "s6:menumpuk", "s6:panas", "s7:Yogoro", "s7:Takeshi", "s7:Lima", "s7:berdirilah", "s8:AUDIRA", "s8:Episode", "s1:charger", "s2:ferit",
    "s3:memancarkan", "s5:sinilah", "s6:membiarkannya", "s7:Tokyo", "s7:TDK", "s8:pemancar"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:120,filter:'brightness(2.2)'},{opacity:1,x:0,filter:'brightness(1)',duration:.42,ease:'power4.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:-80,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.55},{opacity:1,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.4,ease:'power2.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${HD};font-weight:700;font-size:58px;line-height:1.16;color:${TXT};text-transform:uppercase;letter-spacing:.01em;background:rgba(6,17,13,.88);padding:10px 24px 14px;border-radius:6px;border-bottom:4px solid ${CU}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${TXT}",scale:1},{color:"${CY}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${TXT}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tabung Ferit", "#06110D");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
