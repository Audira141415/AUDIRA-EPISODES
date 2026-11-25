// EP14 ESKALATOR TANGGA BERJALAN. FELTCRAFT: a warm needle-felted diorama showing how an escalator works —
// felt steps on yarn chains with bead wheels rolling on felt-strip rails, a cutaway felt motor, and stitched
// comb plates. Three zones: HISTORY (Coney Island / Paris), MECHANISM (cutaway escalator), ETYMOLOGY (word origin).
// Panels are cream felt-paper cards with stitched edges and a rust accent tag.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#4A2E1E", CREAM = "#FFF7E8", RUST = "#C9563A", TEAL = "#3E9C95", GOLD = "#F2B53B";
const SR = "Georgia,'Palatino Linotype',serif", MN = "'Courier New',monospace", SN = "Nunito,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 14</div>
  <div class="card"><div class="big">Anak tangga<br><span class="sm">tidak masuk</span> <span>lantai</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">CONEY ISLAND &middot; 1896</div>
  <div class="ln r" data-at="s2:Jesse" data-fx="stitch">Jesse Reno: tanjakan berjalan pertama</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">PAMERAN PARIS &middot; 1900</div>
  <div class="ln t" data-at="s3:Seeberger" data-fx="stitch">Seeberger + Otis: anak tangga sejati</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">ANATOMI ANAK TANGGA</div>
  <div class="ln r" data-at="s4:kereta" data-fx="stitch">Kereta kecil, 2 pasang roda, rantai</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DUA REL BERBEDA</div>
  <div class="card" data-at="s5:terangkat" data-fx="stitch"><div class="big sm2">Rel berjauhan &rarr; <span>undakan</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KEMBALI RATA</div>
  <div class="ln t" data-at="s6:merapat" data-fx="stitch">Rel merapat, pelat bergerigi, berbalik</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">ASAL KATA</div>
  <div class="card" data-at="s7:scala" data-fx="stitch"><div class="big sm2"><em>scala</em> &rarr; <span>eskalator</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:rantai" data-fx="stitch"><div class="big sm2">Satu rantai <span>berputar</span></div></div>
  <div class="ln t" data-at="s8:Episode" data-fx="stitch">Berikutnya: kompor induksi</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:28px;letter-spacing:.12em;color:${CREAM};background:${RUST};padding:9px 18px 8px;margin-bottom:16px;transform:rotate(-1.2deg);border-radius:4px;box-shadow:4px 4px 0 rgba(74,46,30,.3)}
.card{display:table;background:${CREAM};border-radius:8px;padding:14px 30px 20px;margin-bottom:16px;border:3px dashed ${RUST};box-shadow:8px 8px 0 rgba(62,156,149,.35),0 18px 36px rgba(74,46,30,.25)}
.big{font-family:${SR};font-weight:900;font-size:96px;line-height:1.0;color:${INK};letter-spacing:-.01em}
.big span{color:${RUST}}.big .sm{font-size:62px;color:${INK}}.big.sm2{font-size:68px;line-height:1.06}.big em{font-style:italic;color:${TEAL}}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${INK};background:${CREAM};padding:10px 24px 12px 22px;margin-bottom:12px;border-left:12px solid ${GOLD};border-radius:0 8px 8px 0;box-shadow:5px 5px 0 rgba(74,46,30,.2);max-width:880px}
.ln.r{border-left-color:${RUST}}.ln.t{border-left-color:${TEAL}}
#chip{font-family:${MN};font-size:27px;font-weight:700;color:${INK};opacity:.75;letter-spacing:.06em;background:rgba(255,247,232,.7);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "14", bg: "#BFD9E6", vig: 0.28, grain: 0.06, capfloor: 0.1, html, css, chipFont: MN, chipColor: INK, sig: "EP14_ESKALATOR_TANGGA_BERJALAN",
  extraAt: [
    "s1:eskalator", "s1:lantai", "s1:berbalik", "s1:kakimu",
    "s2:Jesse", "s2:Reno", "s2:Coney", "s2:tanjakan",
    "s3:Seeberger", "s3:Otis", "s3:Pameran", "s3:Paris",
    "s4:kereta", "s4:roda", "s4:rantai", "s4:motor",
    "s5:rel", "s5:berjauhan", "s5:terangkat", "s5:undakan", "s5:terbentuk",
    "s6:merapat", "s6:rata", "s6:bergerigi", "s6:berbalik", "s6:mesin", "s6:Pegangan", "s6:gigi",
    "s7:merek", "s7:Seeberger", "s7:scala", "s7:tangga", "s7:lepas", "s7:umum",
    "s8:rantai", "s8:berputar", "s8:AUDIRA", "s8:Episode"
  ],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:30,scale:.92,transformOrigin:'50% 100%'},{opacity:1,y:0,scale:1,duration:.5,ease:'back.out(1.2)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-20,scale:.95,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `stitch:(e,t)=>tl.fromTo(e,{opacity:.8,x:-8},{opacity:1,x:0,duration:.35,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${SN};font-weight:900;font-size:58px;line-height:1.16;color:${CREAM};text-transform:uppercase;letter-spacing:.01em;background:rgba(74,46,30,.88);padding:10px 24px 14px;border-radius:12px;box-shadow:6px 6px 0 rgba(201,86,58,.85)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${CREAM}",scale:1},{color:"#F2B53B",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CREAM}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Eskalator", "#BFD9E6");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
