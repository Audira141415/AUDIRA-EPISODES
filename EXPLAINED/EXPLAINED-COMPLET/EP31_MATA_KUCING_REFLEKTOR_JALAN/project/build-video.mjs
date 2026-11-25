// EP31 MATA KUCING REFLEKTOR JALAN. STAINEDGLASS look: a night road under a leadlight sky, jewel-glass cat's eyes lit
// only by the car's headlights. Panels are leaded glass plaques: a dark came border, a jewel-tone pane behind serif
// text, a brass tag; they seat into place with a small back-ease like a pane set into lead, with a glint.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NIGHT = "#0B0E1A", LEAD = "#1A1B1E", CREAM = "#F5ECD8", AMBER = "#FFB340", BRASS = "#C79A3C", SAPPH = "#1F4FBF", RUBY = "#C02A42", EMER = "#1F9E6A", VIOL = "#5A2D9C";
const SF = "'Cormorant Garamond',serif", CZ = "Cinzel,serif", SN = "'Source Sans 3',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 31</div>
  <div class="card"><div class="big">Tanpa lampu.<br><span>Cahaya pinjaman.</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">INGGRIS &middot; 1934</div>
  <div class="ln s" data-at="s2:paku" data-fx="lit">Di Indonesia: paku jalan</div>
  <div class="ln a" data-at="s2:Percy" data-fx="lit">Percy Shaw, tukang jalan di Halifax</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">VERSI ASLI</div>
  <div class="ln e" data-at="s3:Kubah" data-fx="lit">Kubah karet putih</div>
  <div class="ln v" data-at="s3:besi" data-fx="lit">Wadah besi cor di aspal</div>
  <div class="ln a" data-at="s3:pasang" data-fx="lit">2 pasang kaca, 1 pasang tiap arah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SEPERTI MATA KUCING</div>
  <div class="ln a" data-at="s4:titik" data-fx="lit">Lensa memusatkan cahaya ke 1 titik</div>
  <div class="ln s" data-at="s4:pemantul" data-fx="lit">Di titik itu: lapisan pemantul</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">KEMBALI KE PENGEMUDI</div>
  <div class="card" data-at="s5:balik" data-fx="lit"><div class="big sm2">Pantulan <span>balik</span></div></div>
  <div class="ln a" data-at="s5:pengemudi" data-fx="lit">Sinar pulang ke mata pengemudi</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">DILINDAS TRUK</div>
  <div class="ln v" data-at="s6:turun" data-fx="lit">Kaca turun ke bawah permukaan</div>
  <div class="ln e" data-at="s6:disapu" data-fx="lit">Disapu karet pembersih</div>
  <div class="ln s" data-at="s6:membilas" data-fx="lit">Air hujan ikut membilas</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">PERANG DUNIA II</div>
  <div class="ln r" data-at="s7:ditutup" data-fx="lit">Pemadaman: lampu mobil ditutup</div>
  <div class="card" data-at="s7:juta" data-fx="lit"><div class="big sm2">&gt; 1 juta<br><span>per tahun</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:menatap" data-fx="lit"><div class="big sm2">Siapa yang<br><span>menatap balik?</span></div></div>
  <div class="ln a" data-at="s8:Episode" data-fx="lit">Berikutnya: peredam pukulan air di pipa</div>
</div>`;

const css = `
.tag{display:table;font-family:${CZ};font-weight:700;font-size:28px;letter-spacing:.14em;color:#2A1D10;background:${BRASS};padding:9px 20px 8px;margin-bottom:16px;border:3px solid ${LEAD};box-shadow:0 0 0 2px rgba(199,154,60,.35)}
.card{display:table;background:linear-gradient(160deg,rgba(31,79,191,.88),rgba(90,45,156,.88));border:7px solid ${LEAD};border-radius:6px;padding:14px 30px 20px;margin-bottom:16px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12),0 22px 44px rgba(0,0,0,.55)}
.big{font-family:${SF};font-weight:700;font-size:96px;line-height:1.0;color:${CREAM};letter-spacing:-.005em}
.big span{color:${AMBER}}.big.sm2{font-size:78px;line-height:1.04}
.ln{display:table;font-family:${SN};font-weight:700;font-size:41px;line-height:1.2;color:${CREAM};background:rgba(16,18,28,.9);padding:10px 24px 12px 20px;margin-bottom:12px;border:5px solid ${LEAD};border-left:16px solid ${AMBER};border-radius:4px;box-shadow:0 10px 26px rgba(0,0,0,.45);max-width:880px}
.ln.s{border-left-color:${SAPPH}}.ln.e{border-left-color:${EMER}}.ln.v{border-left-color:${VIOL}}.ln.r{border-left-color:${RUBY}}
#chip{font-family:${SN};font-size:25px;font-weight:700;color:${CREAM};opacity:.7;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "31", bg: NIGHT, vig: 0.5, grain: 0.05, capfloor: 0.3, html, css, chipFont: SN, chipColor: CREAM, sig: "EP31_MATA_KUCING_REFLEKTOR_JALAN",
  // every anchor read by world3d.js and mix.py
  extraAt: ["s1:lampu", "s1:pinjaman", "s1:mobilmu", "s2:paku", "s2:Inggris", "s2:Percy", "s2:Halifax", "s3:Kubah", "s3:besi", "s3:aspal", "s3:pasang", "s3:arah",
    "s4:mirip", "s4:Lensanya", "s4:membelokkan", "s4:titik", "s4:lapisan", "s4:pemantul", "s5:memantul", "s5:sama", "s5:pulang", "s5:melebar", "s5:pengemudi", "s5:balik",
    "s6:dilindas", "s6:Kubah", "s6:tertekan", "s6:turun", "s6:disapu", "s6:Air", "s6:membilas", "s6:membersihkannya",
    "s7:Perang", "s7:pemadaman", "s7:ditutup", "s7:juta", "s8:menyorot", "s8:menatap", "s8:AUDIRA", "s8:Episode"],
  // a pane seats into its lead: drops in with a small back-ease, then a glint passes
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-34,scale:1.04},{opacity:1,y:0,scale:1,duration:.48,ease:'back.out(1.6)'},a-.12);tl.fromTo(p,{filter:'brightness(1.6)'},{filter:'brightness(1)',duration:.5,ease:'power2.out'},a+.2);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:22,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45,filter:'brightness(.8)'},{opacity:1,filter:'brightness(1.25)',duration:.25,ease:'power2.out'},t).to(e,{filter:'brightness(1)',duration:.4},t+.25),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:800;font-size:58px;line-height:1.16;color:${CREAM};text-transform:uppercase;letter-spacing:.01em;background:rgba(16,18,28,.92);padding:10px 24px 14px;border:6px solid ${LEAD};border-radius:8px;box-shadow:inset 0 -6px 0 ${AMBER}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${CREAM}",scale:1},{color:"${AMBER}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CREAM}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Mata Kucing Reflektor Jalan", NIGHT);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
