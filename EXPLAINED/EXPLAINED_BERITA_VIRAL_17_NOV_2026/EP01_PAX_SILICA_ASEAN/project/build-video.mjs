// EP01 PAX SILICA ASEAN. DATAPHYSICAL: a semiconductor geopolitics arena. Two rival data-monuments (Pax Silica blue-alu,
// WAICO red-gold) flank 10 ASEAN pillar-nations on a terrazzo map floor. A giant silicon wafer rotates in the hook.
// Dark studio, brass name plates, acrylic teal accents, no faces, no logos — name plates only (rule 15).
// Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TXT = "#ECEFF4", AMB = "#F5B54F", BRS = "#D2B07A", TEAL = "#9FD3D6", RED = "#CC5A5A", PLATE = "rgba(22,23,27,.88)", SUB = "#B9BEC7";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">PERANG CHIP 2026 · EP 01</div>
  <div class="ttl">PAX<br>SILICA</div>
  <div class="ln" data-at="s1:ASEAN" data-fx="lit">Seluruh ASEAN jadi taruhan</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">PAX SILICA · INISIATIF AS</div>
  <div class="ln" data-at="s2:chip" data-fx="lit">Chip semikonduktor</div>
  <div class="ln" data-at="s2:kecerdasan" data-fx="lit">Kecerdasan buatan (AI)</div>
  <div class="ln t" data-at="s2:mineral" data-fx="lit">Mineral tanah jarang</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">SILIKA → SILIKON → CHIP</div>
  <div class="ln" data-at="s3:fondasi" data-fx="lit">Fondasi seluruh industri chip</div>
  <div class="ln t" data-at="s3:memutus" data-fx="lit">AS ingin putus ketergantungan pada China</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">AI SPARK · ASIA TENGGARA</div>
  <div class="chip"><b class="nb">AI SPARK</b><span class="who">Pendanaan + dukungan teknis<i>Layanan publik berbasis AI AS</i></span></div>
  <div class="ln" data-at="s4:Juli" data-fx="lit">Diluncurkan Juli 2026</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DUA KUBU TEKNOLOGI</div>
  <div class="row"><div class="col us"><div class="colh">PAX SILICA</div><div class="coli">Singapura</div><div class="coli">Filipina</div></div><div class="col cn"><div class="colh">WAICO</div><div class="coli">Kamboja</div><div class="coli">Malaysia</div><div class="coli">Laos</div><div class="coli">Myanmar</div><div class="coli" data-at="s5:Indonesia" data-fx="lit">Indonesia</div></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">KTT ASEAN MANILA · 17 NOV 2026</div>
  <div class="chip"><b class="nb">ID</b><span class="who">Indonesia disebut akan meneken<i>Satu kaki di WAICO, satu di Pax Silica</i></span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">SATU PERTANYAAN</div>
  <div class="chip lg"><b class="ct nb" data-from="0" data-to="10" data-dec="0" data-a="s7:10" data-d="1.0">10</b><span class="who">negara ASEAN</span></div>
  <div class="chip sm"><b class="nb">2</b><span class="who">blok teknologi</span></div>
  <div class="ln t" data-at="s7:dipaksa" data-fx="lit">Bisakah tidak memilih — atau dipaksa?</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">PERANG CHIP</div>
  <div class="ln" data-at="s8:aturan" data-fx="lit">Siapa menulis aturan dunia berikutnya</div>
  <div class="ln t" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA Explained</div>
</div>`;

const css = `
.tag{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:36px;letter-spacing:.08em;color:${AMB};background:${PLATE};padding:8px 20px 7px;margin-bottom:10px;border-left:8px solid ${AMB}}
.ttl{display:table;font-family:'Archivo Black',sans-serif;font-size:84px;line-height:1.02;color:${TXT};background:${PLATE};padding:10px 26px 14px;margin-bottom:10px;letter-spacing:.01em}
.chip{display:flex;align-items:center;gap:26px;width:max-content;max-width:914px;box-sizing:border-box;background:${PLATE};padding:8px 28px 10px 24px;margin-bottom:10px;border-left:8px solid ${BRS};box-shadow:0 14px 34px rgba(0,0,0,.35)}
.chip b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:128px;line-height:1.02;color:${TXT};letter-spacing:-.02em}
.chip.sm b{font-size:96px}
.chip.lg b{font-size:140px}
.who{display:flex;flex-direction:column;font-family:Inter,sans-serif;font-weight:700;font-size:42px;line-height:1.15;color:${TXT}}
.who i{font-style:normal;font-weight:600;font-size:36px;color:${SUB};margin-top:4px}
.ln{display:table;font-family:Inter,sans-serif;font-weight:600;font-size:42px;line-height:1.2;color:${TXT};background:${PLATE};padding:9px 22px 9px 18px;margin-bottom:8px;border-left:6px solid ${BRS};max-width:880px}
.ln.t{border-left-color:${TEAL}}
.ln b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:42px;color:${AMB}}
.row{display:flex;gap:16px;margin-bottom:10px}
.col{flex:1;background:${PLATE};padding:10px 16px 14px;border-top:6px solid ${BRS}}
.col.us{border-top-color:#4A8FCC}
.col.cn{border-top-color:${RED}}
.colh{font-family:'Archivo Black',sans-serif;font-size:36px;color:${TXT};margin-bottom:8px}
.coli{font-family:Inter,sans-serif;font-weight:600;font-size:34px;color:${SUB};line-height:1.4}
.col.us .colh{color:#4A8FCC}
.col.cn .colh{color:${RED}}
#chip{background:rgba(22,23,27,.8);padding:5px 12px;color:${TXT}}
#outro .cr,#outro .cta{color:${TXT}}
#outro img{filter:brightness(.93)}`;

const w3 = readFileSync("world3d.js", "utf8");
const extraAt = [...new Set([...w3.matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: "#1C1D20", vig: 0.16, grain: 0.035, capfloor: 0.42, html, css, chipFont: "Inter,sans-serif", chipColor: TXT,
  sig: "EP01_PAX_SILICA_ASEAN", chip: "ILUSTRASI, BUKAN CUPLIKAN ASLI",
  extraAt,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:40,clipPath:'inset(100% 0% 0% 0%)'},{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-30,clipPath:'inset(0% 0% 100% 0%)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.42},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:58px;line-height:1.2;color:${TXT};text-shadow:0 2px 0 rgba(10,10,12,.9),0 0 10px rgba(10,10,12,.85),0 0 22px rgba(10,10,12,.6)}
.w{display:inline-block;margin:0 .2em;padding:0 .1em;border-radius:6px}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(245,181,79,0)",color:"${TXT}",scale:1},{backgroundColor:"rgba(245,181,79,0.94)",color:"#17181B",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(245,181,79,0)",color:"${TXT}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pax Silica ASEAN", "#1C1D20");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
