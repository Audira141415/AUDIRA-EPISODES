// EP05 ARKADE TIKET. Late-2000s arcade at night; panels are printed tickets fed from a slot. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PUR = "#1B1036", GOLD = "#F6C445", GRN = "#00B06F", PINK = "#FF4FA3", CRM = "#FFF4D6";
const FB = "Bungee,sans-serif", FP = "'Press Start 2P',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA ROBLOX / EP 05</div>
  <div class="tk big">DUA MATA UANG</div>
  <div class="tk h pk" data-at="s1:gratis" data-fx="pop">Satu gratis, tiap login</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">NAMANYA</div>
  <div class="tk big">TICKETS <span>alias TIX</span></div>
  <div class="tk h" data-at="s2:dirancang" data-fx="pop">Dirancang bareng Robux</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">EKONOMI ROBLOX</div>
  <div class="tk h g" data-at="s3:dibeli" data-fx="pop">ROBUX: dibeli pakai uang</div>
  <div class="tk h" data-at="s3:menghadiahi" data-fx="pop">TIX: hadiah buat yang aktif</div>
  <div class="tk h pk" data-at="s3:inflasi" data-fx="pop">Robux gratis = inflasi</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">CARA DAPAT TIX</div>
  <div class="tk h" data-at="s4:bonus" data-fx="pop">1. Bonus login harian</div>
  <div class="tk h" data-at="s4:Developer" data-fx="pop">2. Tempatmu dikunjungi</div>
  <div class="tk h g" data-at="s4:menukar" data-fx="pop">3. Tukar ke Robux di bursa</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">BASZUCKI, BLOG ROBLOX</div>
  <div class="tk h" data-at="s5:Tickets" data-fx="pop">Tickets dihentikan dalam <b>30 hari</b></div>
  <div class="tk h pk" data-at="s5:terbesar" data-fx="pop">&ldquo;Salah satu perubahan terbesar&rdquo;</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">3 ALASAN</div>
  <div class="tk h" data-at="s6:membingungkan" data-fx="pop">1. Bikin bingung pemain baru</div>
  <div class="tk h" data-at="s6:akun" data-fx="pop">2. Akun tambahan &amp; bot</div>
  <div class="tk h pk" data-at="s6:tidak" data-fx="pop">3. Bukan demi absen harian</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KATA BASZUCKI</div>
  <div class="tk h" data-at="s7:bukan" data-fx="pop">&ldquo;Bukan untuk cari uang lebih banyak&rdquo;</div>
  <div class="tk h g" data-at="s7:tiga" data-fx="pop">30 hari untuk habiskan Tix</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">SEJAK ITU</div>
  <div class="tk big g" data-at="s8:Robux" data-fx="pop">CUMA ROBUX</div>
  <div class="tk h pk" data-at="s8:Kalau" data-fx="pop">Kalau Tix masih ada, kamu rajin login?</div>
</div>`;

// Printed-ticket cards: notched sides, dashed perforation inside, hard drop shadow that follows the notches.
const notch = (c) => `radial-gradient(circle at 0 50%,transparent 15px,${c} 16px) left/51% 100% no-repeat,radial-gradient(circle at 100% 50%,transparent 15px,${c} 16px) right/51% 100% no-repeat`;
const css = `
.tk{display:block;width:max-content;max-width:100%;box-sizing:border-box;background:${notch(GOLD)};color:${PUR};font-family:Bungee,sans-serif;filter:drop-shadow(0 9px 0 ${PUR}) drop-shadow(0 0 18px rgba(246,196,69,.35));position:relative;margin-bottom:20px}
.tk::after{content:"";position:absolute;inset:10px 30px;border:3px dashed rgba(27,16,54,.45);pointer-events:none}
.tk.pk{background:${notch(PINK)};color:${CRM}}.tk.pk::after{border-color:rgba(255,244,214,.55)}
.tk.g{background:${notch(GRN)};color:${CRM}}.tk.g::after{border-color:rgba(255,244,214,.55)}
.tag{display:inline-block;font-family:'Press Start 2P',monospace;font-size:20px;line-height:1;color:${CRM};background:${PUR};border:3px solid ${PINK};padding:10px 14px 9px;margin-bottom:18px;box-shadow:0 0 16px rgba(255,79,163,.6)}
.big{font-size:88px;line-height:1.0;padding:26px 54px 28px}.big span{display:block;font-size:44px;color:${PINK};margin-top:8px}
.h{font-size:42px;line-height:1.12;padding:20px 50px 22px}.h b{color:${PINK};font-weight:400}.pk b,.g b{color:${GOLD}}
#chip{font-family:'Press Start 2P',monospace;font-weight:400;font-size:15px;color:${CRM};background:rgba(27,16,54,.75);padding:7px 10px;top:178px;letter-spacing:0}`;

const extraAt = ["s1:gratis", "s1:login",
  "s2:Tickets", "s2:Robux", "s2:David", "s2:Erik", "s2:John", "s2:Matt", "s2:Namanya",
  "s3:dibeli", "s3:Tix", "s3:tanpa", "s3:Kalau", "s3:dibagi", "s3:nilainya", "s3:turun", "s3:inflasi", "s3:bermain",
  "s4:Tix", "s4:harian", "s4:Developer", "s4:dikunjungi", "s4:Pemain", "s4:menukar", "s4:Robux", "s4:bursa",
  "s5:Maret", "s5:Baszucki", "s5:tiga", "s5:dihentikan", "s5:terbesar",
  "s6:membingungkan", "s6:Bonus", "s6:akun", "s6:bot", "s6:Roblox", "s6:absen",
  "s7:bukan", "s7:Pemain", "s7:menghabiskan", "s7:mereka", "s7:bursa", "s7:ditutup",
  "s8:Robux", "s8:jadi", "s8:Kalau", "s8:login"];

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: PUR, vig: 0.5, grain: 0.05, capfloor: 0.35, html, css, chipFont: FP, chipColor: CRM, extraAt,
  // Ticket feed: the card is printed out of a slot at the top in stepped jerks, then torn off sideways.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1,clipPath:'inset(-8% -8% 108% -8%)',y:-70},a-.13);tl.to(p,{clipPath:'inset(-8% -8% -8% -8%)',y:0,duration:.42,ease:'steps(8)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{rotation:-2.5,duration:.05,ease:'power1.out'},b-.26);tl.to(p,{x:900,rotation:9,opacity:0,duration:.2,ease:'power3.in'},b-.21);}`,
  fxExtra: `pop:(e,t)=>{tl.set(e,{opacity:1,clipPath:'inset(-8% -8% 108% -8%)',y:-26},t-.02);tl.to(e,{clipPath:'inset(-8% -8% -8% -8%)',y:0,duration:.3,ease:'steps(6)'},t);},`,
  // Outro is fed down like one last long ticket.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.6,ease:'steps(10)'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:46px;right:96px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Bungee,sans-serif;font-size:54px;line-height:1.18;color:${CRM};text-shadow:4px 0 0 ${PUR},-4px 0 0 ${PUR},0 4px 0 ${PUR},0 -4px 0 ${PUR},3px 3px 0 ${PUR},-3px 3px 0 ${PUR},3px -3px 0 ${PUR},-3px -3px 0 ${PUR},0 8px 0 ${PUR},0 0 22px rgba(255,79,163,.55)}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${CRM}",scale:1},{color:"${GOLD}",scale:1.08,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CRM}",scale:1,duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(-8% -8% 108% -8%)",y:-14},{clipPath:"inset(-8% -8% -8% -8%)",y:0,duration:.16,ease:"steps(4)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Arkade Tiket", PUR);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
