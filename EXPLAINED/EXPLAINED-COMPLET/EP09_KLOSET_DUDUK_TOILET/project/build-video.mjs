// EP09 KLOSET DUDUK. INNERWORKS: a sliced ceramic section model on a cut floor block. Panels are technical callout
// cards: cream card, navy type, orange highlight, a teal mono tag strip and a thin orange leader rule; they slide in
// along a short leader line like a label being pinned to a drawing.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#14202B", CREAM = "#F6F1E7", ORANGE = "#F07B2D", TEAL = "#0F6E73";
const TT = "Archivo,sans-serif", MN = "'JetBrains Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 09</div>
  <div class="card"><div class="big">Kloset ini<br><span>menyedot</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">DUA CARA SIRAM</div>
  <div class="ln o" data-at="s2:washdown" data-fx="lit">Washdown: didorong air tangki</div>
  <div class="ln" data-at="s2:Eropa" data-fx="lit">Banyak di Eropa dan Asia</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">JENIS KEDUA</div>
  <div class="card" data-at="s3:sifonik" data-fx="lit"><div class="big sm2"><span>Sifonik</span></div></div>
  <div class="ln" data-at="s3:naik" data-fx="lit">Saluran naik dulu, lalu turun</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SEKAT AIR</div>
  <div class="ln" data-at="s4:sekat" data-fx="lit">Air di lengkungan menahan bau</div>
  <div class="ln o" data-at="s4:terangkat" data-fx="lit">Tombol ditekan, katup terangkat</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SALURAN AGAK SEMPIT</div>
  <div class="ln" data-at="s5:melimpah" data-fx="lit">Air melimpah lewat puncak</div>
  <div class="ln o" data-at="s5:memenuhi" data-fx="lit">Seluruh saluran terisi</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">SIFON TERBENTUK</div>
  <div class="ln" data-at="s6:sedotan" data-fx="lit">Seperti menyedot lewat sedotan</div>
  <div class="card" data-at="s6:empat" data-fx="lit"><div class="big sm2">4&ndash;7 <span>detik</span></div></div>
  <div class="ln o" data-at="s6:gluguk" data-fx="lit">Udara masuk: sifon putus</div>
</div>
<div class="p" data-in="s7" data-out="s7:Kloset">
  <div class="tag">ISI ULANG</div>
  <div class="ln" data-at="s7:pelampung" data-fx="lit">Pelampung turun, keran terbuka</div>
</div>
<div class="p" data-in="s7:Kloset" data-out="s8">
  <div class="tag">AIR SEKALI SIRAM</div>
  <div class="ln" data-at="s7:tiga" data-fx="lit">Kloset tua: 13 liter atau lebih</div>
  <div class="ln" data-at="s7:enam" data-fx="lit">Batas Amerika Serikat 1994: 6 liter</div>
  <div class="ln o" data-at="s7:delapan" data-fx="lit">Model hemat: sekitar 4,8 liter</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:gluguk" data-fx="lit"><div class="big sm2">Gluguk = <span>sifon bekerja</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: rem ABS</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:800;font-size:28px;letter-spacing:.12em;color:#FFFFFF;background:${TEAL};padding:9px 18px 8px;margin-bottom:14px;border-radius:4px}
.card{display:table;background:${CREAM};border-radius:10px;padding:14px 30px 20px;margin-bottom:14px;border-top:8px solid ${ORANGE};box-shadow:0 24px 48px rgba(6,20,24,.45)}
.big{font-family:${TT};font-weight:900;font-size:104px;line-height:1.0;color:${NAVY};letter-spacing:-.02em}
.big span{color:${ORANGE}}.big.sm2{font-size:76px;line-height:1.06}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${NAVY};background:${CREAM};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${TEAL};border-radius:0 8px 8px 0;box-shadow:0 14px 30px rgba(6,20,24,.38);max-width:880px}
.ln.o{border-left-color:${ORANGE}}
#chip{font-family:${MN};font-size:25px;font-weight:700;color:#E6F4F5;opacity:.8;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "09", bg: "#10262A", vig: 0.38, grain: 0.06, capfloor: 0.3, html, css, chipFont: MN, chipColor: "#E6F4F5", sig: "EP09_KLOSET_DUDUK_TOILET",
  extraAt: ["s1:menyedotnya", "s1:mendorong", "s2:washdown", "s2:Eropa", "s2:dorongan", "s2:dua", "s3:melengkung", "s3:pembuangan", "s3:sifonik",
    "s4:sekat", "s4:bau", "s4:tombol", "s4:terangkat", "s4:menerjang", "s4:ditekan", "s4:katup",
    "s5:puncak", "s5:sempit", "s5:naik", "s5:melimpah", "s5:memenuhi",
    "s6:sedotan", "s6:habis", "s6:udara", "s6:khas", "s6:jatuh", "s6:putus", "s6:penuh", "s6:menarik", "s6:gluguk", "s6:terbentuklah", "s6:empat",
    "s7:penuh", "s7:Kloset", "s7:hemat", "s7:keran", "s7:pelampung", "s7:tiga", "s7:enam", "s7:empat#2", "s7:delapan", "s7:Amerika",
    "s8:gluguk", "s8:AUDIRA", "s8:Episode"],
  // panels slide in along a short leader rule, like a label pinned to a section drawing
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,clipPath:'inset(0 100% 0 0)'},{opacity:1,x:0,clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:40,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;background:rgba(20,32,43,.92);padding:10px 24px 14px;border-radius:12px;border-bottom:6px solid ${ORANGE}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"#FFB46A",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kloset Duduk", "#10262A");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
