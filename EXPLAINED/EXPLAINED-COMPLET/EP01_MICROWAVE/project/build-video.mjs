// EP01 MICROWAVE. ISOCRAFT: isometric comic-ink teardown on warm paper. Panels are comic stickers: thick ink border,
// hard offset shadow, yellow tags. They pop in with a slight tilt like a sticker slapped on the page.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1C1E21", PAPER = "#F5F2EB", CORAL = "#E06D53", YEL = "#F4C430", MINT = "#5FA084", BLUE = "#7A9BB8";
const HD = "'Archivo Black',sans-serif", MO = "'Space Mono',monospace", BD = "'Space Grotesk',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA / EP 01</div>
  <div class="card"><div class="big">MICROWAVE<br>TIDAK MEMANASKAN<br><span>PIRING</span></div></div>
  <div class="ln" data-at="s1:menggoyang" data-fx="lit">Ia menggoyang <b>air</b> di dalam makanan</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">AWALNYA</div>
  <div class="card" data-at="s2:seribu" data-fx="lit"><div class="big xl">1945</div></div>
  <div class="ln" data-at="s2:Percy" data-fx="lit">Percy Spencer, insinyur Raytheon</div>
  <div class="ln y" data-at="s2:permen" data-fx="lit">Dekat radar: permen di sakunya meleleh</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">PENYEBABNYA</div>
  <div class="ln" data-at="s3:gelombang" data-fx="lit">Gelombang mikro dari radar</div>
  <div class="card" data-at="s3:Dua" data-fx="lit"><div class="big xl">1947</div></div>
  <div class="ln y" data-at="s3:Radarange" data-fx="lit">RADARANGE: microwave komersial pertama</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">DI DALAM MICROWAVE</div>
  <div class="card" data-at="s4:magnetron" data-fx="lit"><div class="big">MAGNETRON</div></div>
  <div class="row"><b class="c" data-at="s4:dua" data-fx="lit">&plusmn; 2,45 GHz</b><b class="c y" data-at="s4:panjang" data-fx="lit">&lambda; = 12,2 cm</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">MEDAN LISTRIK</div>
  <div class="ln" data-at="s5:berbalik" data-fx="lit">Berbalik arah sangat cepat</div>
  <div class="ln" data-at="s5:Molekul" data-fx="lit">Molekul air ikut <b>berputar</b></div>
  <div class="card" data-at="s5:menghasilkan" data-fx="lit"><div class="big md">GERAKAN = <span>PANAS</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">BUKAN DARI DALAM</div>
  <div class="ln" data-at="s6:menembus" data-fx="lit">Gelombang menembus sekitar <b>1 cm</b></div>
  <div class="ln" data-at="s6:merambat" data-fx="lit">Panas merambat dari lapisan luar</div>
  <div class="ln y" data-at="s6:piring" data-fx="lit">Piring putar: panas lebih merata</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KENAPA TIDAK BOCOR?</div>
  <div class="card" data-at="s7:sangkar" data-fx="lit"><div class="big md">SANGKAR<br><span>FARADAY</span></div></div>
  <div class="ln" data-at="s7:lubang" data-fx="lit">Lubang jaring &lt;&lt; 12,2 cm</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:dipanaskan" data-fx="lit"><div class="big md">YANG DIPANASKAN:<br><span>AIR DI MAKANANMU</span></div></div>
  <div class="ln" data-at="s8:Kamu" data-fx="lit">Pernah iseng menonton piringnya berputar?</div>
</div>`;

const css = `
.tag{display:table;font-family:'Space Mono',monospace;font-weight:700;font-size:34px;letter-spacing:.03em;color:${INK};background:${YEL};padding:8px 18px 6px;border:4px solid ${INK};box-shadow:7px 7px 0 ${INK};margin-bottom:22px;transform:rotate(-1.2deg)}
.card{display:table;background:#fff;border:5px solid ${INK};box-shadow:12px 12px 0 ${INK};padding:14px 26px 18px;margin-bottom:22px}
.big{font-family:'Archivo Black',sans-serif;font-size:74px;line-height:1.0;letter-spacing:-.01em;color:${INK}}
.big span{color:${CORAL}}.big.md{font-size:64px}.big.xl{font-size:120px;line-height:.95}
.ln{display:table;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:40px;line-height:1.18;color:${INK};background:#fff;padding:9px 18px 9px;margin-bottom:14px;border:4px solid ${INK};box-shadow:7px 7px 0 ${INK};max-width:840px}
.ln b{color:${CORAL}}
.ln.y{background:${YEL}}
.row{display:flex;gap:16px;margin-top:2px}
.c{font-family:'Archivo Black',sans-serif;font-weight:400;font-size:40px;padding:10px 18px 8px;color:${INK};background:#fff;border:4px solid ${INK};box-shadow:7px 7px 0 ${INK}}
.c.y{background:${YEL}}.c.r{background:${CORAL};color:#fff}
#chip{font-family:'Space Mono',monospace;font-weight:700;font-size:30px;color:${INK};opacity:.85;top:180px;letter-spacing:.03em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: PAPER, vig: 0.1, grain: 0.07, capfloor: 0, html, css, chipFont: MO, chipColor: INK, sig: "EP01_MICROWAVE",
  extraAt: ["s1:menggoyang", "s1:panas", "s2:Percy", "s2:bekerja", "s2:meleleh", "s2:permen", "s2:radar", "s3:Dua", "s3:gelombang", "s3:radar",
    "s4:dua", "s4:frekuensi", "s4:gigahertz", "s4:magnetron", "s4:membuat", "s4:panjang", "s5:Molekul", "s5:berbalik", "s5:berputar",
    "s5:gerakan", "s5:listrik", "s5:medan", "s5:panas", "s6:Bagian", "s6:Gelombang", "s6:Tapi", "s6:luar", "s6:makanan", "s6:menembus",
    "s6:merambat", "s6:piring", "s6:putar", "s6:sentimeter", "s7:Faraday", "s7:Gelombang", "s7:Kaca", "s7:bocor", "s7:cahaya",
    "s7:gelombangnya", "s7:kecil", "s7:lewat", "s7:lubang", "s7:sangkar", "s7:tertahan", "s8:AUDIRA", "s8:piringnya", "s8:air", "s1:air", "s1:piringmu", "s2:Raytheon", "s3:dijual", "s7:masaknya"],
  // panels slap on like stickers: drop in tilted, settle flat; leave by sliding off left
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-30,rotation:-2.5,scale:1.04},{opacity:1,y:0,rotation:0,scale:1,duration:.4,ease:'back.out(1.6)'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:-120,rotation:-2,duration:.28,ease:'power2.in'},b-.28);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.88,boxShadow:'5px 5px 0 #1C1E21'},{opacity:1,boxShadow:'9px 9px 0 #E06D53',duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:1.06});tl.to('#outro',{opacity:1,scale:1,duration:.4,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Archivo Black',sans-serif;font-size:56px;line-height:1.2;color:#fff;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 5px 0 #1C1E21,4px 0 0 #1C1E21,-4px 0 0 #1C1E21,0 -4px 0 #1C1E21,3px 3px 0 #1C1E21,-3px -3px 0 #1C1E21,3px -3px 0 #1C1E21,-3px 3px 0 #1C1E21}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#ffffff",scale:1},{color:"${YEL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#ffffff",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Microwave", PAPER);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
