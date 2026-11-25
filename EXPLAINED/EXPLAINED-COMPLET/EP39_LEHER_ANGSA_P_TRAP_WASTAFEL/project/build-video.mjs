// EP39 LEHER ANGSA / P-TRAP. STAINEDGLASS: panels are leadlight panes, a jewel glass tag, a dark lead-came frame with a
// thin gold inner line and a serif title; they seat like a pane pressed into its came (slight overshoot + glint sweep).
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const LEADC = "#1A1B1E", GLASS = "#13203f", GOLD = "#F6CF5A", SAPH = "#9CC4FF", RUBY = "#E0566D", OLIVE = "#C3D65A", CREAM = "#FBF1DC";
const TT = "Cinzel,serif", SN = "Spectral,serif", MN = "'IBM Plex Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 39</div>
  <div class="card"><div class="big">Penahan bau got:<br><span>genangan air</span></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">LEHER ANGSA &middot; P-TRAP</div>
  <div class="ln s" data-at="s2:Bentuknya" data-fx="lit">Huruf U + pipa mendatar</div>
  <div class="ln g" data-at="s2:samping" data-fx="lit">Dari samping: huruf P</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag ol">SALURAN GOT</div>
  <div class="ln o" data-at="s3:gas" data-fx="lit">Penuh gas busuk</div>
  <div class="ln r" data-at="s3:naik" data-fx="lit">Tanpa penghalang: naik ke rumah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SUMBAT AIR</div>
  <div class="card" data-at="s4:menembus" data-fx="lit"><div class="big sm2">Gas tak bisa<br><span>menembus air</span></div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SELALU DIGANTI</div>
  <div class="ln s" data-at="s5:mendorong" data-fx="lit">Air baru mendorong air lama</div>
  <div class="ln g" data-at="s5:cincin" data-fx="lit">Bonus: cincin tersangkut</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag rb">BISA JEBOL</div>
  <div class="ln r" data-at="s6:menyedot" data-fx="lit">Aliran deras menyedot air</div>
  <div class="ln s" data-at="s6:atap" data-fx="lit">Pipa udara terbuka ke atap</div>
  <div class="ln o" data-at="s6:menguap" data-fx="lit">Lama tak dipakai: air menguap</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KEDALAMAN AIR</div>
  <div class="ln s" data-at="s7:lima" data-fx="lit">Aturan Amerika: 5&ndash;10 cm</div>
  <div class="ln g" data-at="s7:setengah" data-fx="lit">Aturan Inggris: 7,5 cm (bak cuci piring)</div>
  <div class="card" data-at="s7:seribu" data-fx="lit"><div class="big sm2">1775 &middot; <span>huruf S</span></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:alirkan" data-fx="lit"><div class="big sm2">Wastafel bau?<br><span>Alirkan air</span></div></div>
  <div class="ln g" data-at="s8:Episode" data-fx="lit">Berikutnya: gigi baja jembatan</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.14em;color:${LEADC};background:${GOLD};padding:9px 18px 8px;margin-bottom:16px;border:5px solid ${LEADC};box-shadow:0 0 0 2px rgba(246,207,90,.5),0 10px 26px rgba(0,0,0,.5)}
.tag.ol{background:${OLIVE}}.tag.rb{background:${RUBY};color:${CREAM}}
.card{display:table;position:relative;overflow:hidden;background:linear-gradient(160deg,#1d3f9c,${GLASS} 70%);border:9px solid ${LEADC};border-radius:4px;padding:16px 30px 22px;margin-bottom:16px;box-shadow:inset 0 0 0 3px rgba(246,207,90,.75),0 18px 40px rgba(0,0,0,.55)}
.big{font-family:${TT};font-weight:800;font-size:86px;line-height:1.04;color:${CREAM};letter-spacing:.01em;text-shadow:0 2px 0 rgba(0,0,0,.35)}
.big span{color:${SAPH}}.big.sm2{font-size:68px;line-height:1.08}
.ln{display:table;font-family:${SN};font-weight:700;font-size:42px;line-height:1.2;color:${CREAM};background:rgba(19,32,63,.92);padding:10px 24px 12px 22px;margin-bottom:12px;border:5px solid ${LEADC};border-left:16px solid ${GOLD};box-shadow:0 10px 24px rgba(0,0,0,.45);max-width:880px}
.ln.s{border-left-color:#3D7DFF}.ln.g{border-left-color:${GOLD}}.ln.r{border-left-color:#C4253F}.ln.o{border-left-color:#A9C23A}
#chip{font-family:${MN};font-size:26px;font-weight:700;color:${CREAM};opacity:.75;letter-spacing:.06em;background:rgba(26,27,30,.6);padding:3px 10px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "39", bg: "#1C1612", vig: 0.42, grain: 0.06, capfloor: 0.35, html, css, chipFont: MN, chipColor: CREAM, sig: "EP39_LEHER_ANGSA_P_TRAP_WASTAFEL",
  extraAt: ["s1:genangan", "s1:Bau", "s2:leher", "s2:mendatar", "s3:saluran", "s3:Tanpa", "s3:rumah", "s3:busuk", "s4:dibuang", "s4:tertinggal", "s4:sumbatnya", "s4:Gas", "s4:tertahan",
    "s5:diganti", "s5:mencuci", "s5:baru", "s5:lama", "s5:terisi", "s5:cincin", "s5:tersangkut", "s6:jebol", "s6:deras", "s6:menyedot", "s6:udara", "s6:atap", "s6:tekanannya",
    "s6:Wastafel", "s6:menguap", "s7:Seberapa", "s7:lima", "s7:Inggris", "s7:setengah", "s7:Alexander", "s7:seribu", "s8:kosong", "s8:alirkan", "s8:AUDIRA", "s8:Episode"],
  // a pane pressed into its came: drops in slightly large and tilted, settles with a small overshoot
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:1.06,rotation:-1.5,y:-18},{opacity:1,scale:1,rotation:0,y:0,duration:.45,ease:'back.out(1.6)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:.97,y:14,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45,filter:'brightness(.7)'},{opacity:1,filter:'brightness(1.12)',duration:.32,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:1.04});tl.to('#outro',{opacity:1,scale:1,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:Spectral,serif;font-weight:800;font-size:58px;line-height:1.16;color:${CREAM};letter-spacing:.01em;background:rgba(19,32,63,.92);padding:10px 26px 14px;border:6px solid ${LEADC};border-radius:6px;box-shadow:inset 0 0 0 2px rgba(246,207,90,.6),0 12px 30px rgba(0,0,0,.5)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${CREAM}",scale:1},{color:"${GOLD}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CREAM}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12,opacity:.6},{y:0,opacity:1,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Leher Angsa P-Trap", "#1C1612");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
