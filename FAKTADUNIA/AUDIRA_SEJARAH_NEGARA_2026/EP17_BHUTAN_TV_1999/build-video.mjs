// EP17 BHUTAN TV 1999. RETROWAVE: a neon night over a magenta grid, a wireframe Himalaya under a striped magenta sun,
// and one big curved-glass CRT television floating over the grid whose screen tells the story beat by beat.
// Stations change under a full-frame CRT power-off/on squeeze; panels switch on like a tube (squeeze in, squeeze out).
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const MAG = "#FF007F", CYAN = "#00F6FF", AMB = "#FF9E00", GRN = "#39FF14", SIL = "#E2E8F0", VOID = "#0C081A", RED = "#FF1F45";
const HEAD = "Audiowide,'Arial Black',sans-serif", MONO = "'Share Tech Mono','Courier New',monospace";

const row = (b, s, a, cls = "") => `<div class="row ${cls}" data-at="${a}" data-fx="crt"><b>${b}</b><span>${s}</span></div>`;
const chip = (txt, a, c = "") => `<i class="ch ${c}" data-at="${a}" data-fx="crt" data-d="inline-block">${txt}</i>`;
const sq = (a) => `<div class="sq" data-at="${a}" data-fx="sq"><i class="st"></i><i class="sb"></i><i class="ln"></i></div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Audiowide&family=Share+Tech+Mono&family=Monoton&display=block">
<div class="pre"><span style="font-family:Audiowide">AB19</span><span style="font-family:'Share Tech Mono'">AB19</span><span style="font-family:Monoton">AB19</span></div>
${sq("s3:Tahun-0.2")}
${sq("s3:Tahun#2-0.2")}
${sq("s4:Larangan-0.2")}
${sq("s6:Dua-0.2")}
${sq("s7:Televisi-0.2")}
${sq("s8:Bhutan-0.2")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 17</div>
  <div class="h1">Sampai <em>1999</em>,<br>belum ada<br>siaran TV</div>
  ${chip("&#10005; PUNYA TV PERNAH DILARANG", "s1:dilarang", "rd")}
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">HIMALAYA &middot; ASIA SELATAN</div>
  <div class="h2">Kerajaan <em>Bhutan</em></div>
  ${chip("di antara India &amp; Tiongkok", "s2:antara")}
</div>
<div class="p" data-in="s3" data-out="s3:Tahun#2">
  <div class="kk am">1980-AN &middot; SINYAL BOCOR</div>
  <div class="h2">Siaran tetangga<br>melewati gunung</div>
  <div class="chips">${chip("INDIA &middot; DOORDARSHAN", "s3:India", "am")}${chip("BANGLADESH &middot; BTV", "s3:Bangladesh")}</div>
</div>
<div class="p" data-in="s3:Tahun#2" data-out="s4">
  <div class="kk rd">LARANGAN</div>
  <div class="mega" data-at="s3:1989" data-fx="crt" data-d="block">1989</div>
  <div class="chips">${chip("&#10005; PESAWAT TV", "s3:pesawat", "rd")}${chip("&#10005; PARABOLA", "s3:parabola", "rd")}</div>
  ${row("ALASAN", "menjaga warisan budaya Bhutan", "s3:warisan")}
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">TAPI&hellip;</div>
  <div class="h2">Tidak sepenuhnya<br>dipatuhi</div>
  ${row("TV HITAM PUTIH", "beberapa tetap menyala", "s4:hitam", "gy")}
  ${row("FILM INDIA BAJAKAN", "beredar dari toko video", "s4:bajakan", "gy")}
</div>
<div class="p" data-in="s5" data-out="s5:Setelah">
  <div class="kk am">TITIK BALIK</div>
  <div class="h2">Final Piala<br>Dunia <em>1998</em></div>
  ${chip("siaran uji coba &middot; Thimphu", "s5:uji", "gn")}
</div>
<div class="p" data-in="s5:Setelah" data-out="s6">
  <div class="kk">SETELAH ITU</div>
  <div class="h2"><em>BBS</em> diizinkan</div>
  ${chip("membuka televisi nasional", "s5:membuka", "gn")}
</div>
<div class="p" data-in="s6" data-out="s6:Siarannya">
  <div class="kk mg">MENGUDARA</div>
  <div class="mega sm" data-at="s6:Dua" data-fx="crt" data-d="block">2 Juni 1999</div>
  ${row("BBS TELEVISION", "mulai siaran di Thimphu", "s6:BBS", "cy")}
  ${chip("25 tahun penobatan raja", "s6:dua", "am")}
</div>
<div class="p" data-in="s6:Siarannya" data-out="s7">
  <div class="kk">JADWAL SIARAN</div>
  <div class="h2">Belum ada<br>jam tetap</div>
  ${chip("biasanya mulai pukul 19.00", "s6:tujuh", "am")}
</div>
<div class="p" data-in="s7" data-out="s7:Beberapa">
  <div class="kk">TV KABEL IKUT MASUK</div>
  <div class="mega sm" data-at="s7:puluhan" data-fx="crt" data-d="block">45+ <small>saluran India</small></div>
  ${chip("data Desember 2000", "s7:India")}
</div>
<div class="p" data-in="s7:Beberapa" data-out="s8">
  <div class="kk rd">DILARANG</div>
  <div class="h2">Dianggap merusak<br>budaya</div>
  <div class="chips">${chip("<s>WWE</s>", "s7:WWE", "rd")}${chip("<s>Fashion TV</s>", "s7:Fashion", "rd")}${chip("<s>MTV</s>", "s7:MTV", "rd")}</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk mg">BHUTAN</div>
  <div class="h2">Disebut negara<br><em>terakhir</em> yang<br>mengenal TV</div>
  <div class="q" data-at="s8:Menurut" data-fx="crt">Melindungi budaya, atau membuat tertinggal?</div>
</div>`;

const glass = "background:linear-gradient(180deg,rgba(18,10,40,.86),rgba(10,6,26,.9));box-shadow:0 0 0 2px rgba(0,246,255,.55),0 0 26px rgba(0,246,255,.25),0 18px 40px rgba(0,0,0,.6)";
const css = `
.pre{position:absolute;left:-3000px;top:0;font-size:40px;opacity:0}
.p{transform-origin:50% 30%}
.kk{display:inline-block;font-family:${MONO};font-weight:400;font-size:30px;letter-spacing:.14em;color:${CYAN};background:rgba(10,6,26,.88);padding:7px 18px 6px;margin-bottom:14px;border-left:8px solid ${MAG};text-shadow:0 0 10px rgba(0,246,255,.7);box-shadow:0 0 0 1px rgba(0,246,255,.35)}
.kk.rd{color:#FF6A82;border-left-color:${RED};text-shadow:0 0 10px rgba(255,31,69,.8)}
.kk.am{color:${AMB};border-left-color:${AMB};text-shadow:0 0 10px rgba(255,158,0,.7)}
.kk.mg{color:#FF7AC0;border-left-color:${CYAN}}
.h1,.h2{display:inline-block;${glass};font-family:${HEAD};font-weight:400;color:#fff;text-shadow:0 0 6px rgba(255,0,127,.9),0 0 22px rgba(255,0,127,.55)}
.h1{font-size:76px;line-height:1.08;padding:14px 26px 18px}
.h2{font-size:60px;line-height:1.1;padding:12px 24px 16px;margin-bottom:4px}
.h1 em,.h2 em{font-style:normal;color:${CYAN};text-shadow:0 0 8px rgba(0,246,255,.9),0 0 24px rgba(0,246,255,.5)}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
.ch{font-style:normal;font-family:${MONO};font-size:36px;letter-spacing:.04em;color:#fff;padding:8px 18px 7px;margin-top:12px;background:rgba(10,6,26,.9);box-shadow:0 0 0 2px ${CYAN},0 0 18px rgba(0,246,255,.35)}
.chips .ch{margin-top:0}
.ch.rd{box-shadow:0 0 0 2px ${RED},0 0 18px rgba(255,31,69,.45);color:#FFD0D8}
.ch.am{box-shadow:0 0 0 2px ${AMB},0 0 18px rgba(255,158,0,.4);color:#FFE2B8}
.ch.gn{box-shadow:0 0 0 2px ${GRN},0 0 18px rgba(57,255,20,.35);color:#D8FFD0}
.ch s{text-decoration:line-through;text-decoration-color:${RED};text-decoration-thickness:5px}
.row{display:flex;flex-direction:column;gap:2px;margin-top:12px;padding:10px 22px 12px;${glass};border-left:10px solid ${MAG}}
.row b{font-family:${HEAD};font-weight:400;font-size:38px;line-height:1.1;color:${CYAN};text-shadow:0 0 10px rgba(0,246,255,.6)}
.row span{font-family:${MONO};font-size:34px;line-height:1.2;color:${SIL}}
.row.gy{border-left-color:#9A9AA6}.row.gy b{color:#E8E8EE;text-shadow:none}
.row.cy{border-left-color:${CYAN}}.row.cy b{color:#FF7AC0;text-shadow:0 0 10px rgba(255,0,127,.6)}
.mega{width:max-content;font-family:${HEAD};font-weight:400;font-size:150px;line-height:1.02;padding:4px 30px 10px;color:${AMB};${glass};text-shadow:0 0 10px rgba(255,158,0,.9),0 0 34px rgba(255,0,127,.6)}
.mega.sm{font-size:96px;color:#fff;text-shadow:0 0 8px rgba(255,0,127,.95),0 0 30px rgba(255,0,127,.6)}
.mega small{font-family:${MONO};font-size:38px;color:${CYAN};text-shadow:none;letter-spacing:.04em}
.q{margin-top:14px;font-family:${HEAD};font-size:42px;line-height:1.18;padding:16px 24px;color:#fff;${glass};border-bottom:8px solid ${MAG};text-shadow:0 0 10px rgba(255,0,127,.7)}
.sq{position:absolute;inset:0;z-index:15;pointer-events:none;opacity:0}
.sq i{position:absolute;left:0;right:0;background:#000}
.sq .st{top:0;height:50.2%;transform-origin:50% 0%}
.sq .sb{bottom:0;height:50.2%;transform-origin:50% 100%}
.sq .ln{top:50%;height:8px;margin-top:-4px;background:#F4F8FF;box-shadow:0 0 30px 8px rgba(200,240,255,.9),0 0 90px 20px rgba(255,0,127,.5)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const extraAt = ["s1:1999", "s1:dilarang", "s2:Bhutan", "s2:antara", "s3:India", "s3:Bangladesh", "s3:bocor", "s3:Tahun#2", "s3:1989", "s3:pesawat", "s3:parabola", "s3:dilarang", "s3:warisan",
  "s4:hitam", "s4:film", "s4:bajakan", "s4:toko", "s5:final", "s5:Ada", "s5:uji", "s5:Thimphu", "s5:Setelah", "s5:BBS", "s5:diizinkan",
  "s6:Dua", "s6:BBS", "s6:Thimphu", "s6:dua", "s6:Siarannya", "s6:jam", "s6:biasanya", "s6:tujuh",
  "s7:kabel", "s7:puluhan", "s7:saluran", "s7:India", "s7:Beberapa", "s7:dilarang", "s7:WWE", "s7:Fashion", "s7:MTV",
  "s8:terakhir", "s8:Menurut", "s8:melindungi", "s8:tertinggal", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "17", bg: VOID, vig: 0.4, grain: 0.07, capfloor: 0.35, html, css, chipFont: MONO, chipColor: CYAN, sig: "EP17_BHUTAN_TV_1999",
  chip: "ILUSTRASI RETRO &middot; BUKAN CUPLIKAN SIARAN ASLI",
  extraAt,
  fxExtra: `crt:(e,t)=>{const d=e.dataset.d||(e.classList.contains('row')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,scaleY:.04,scaleX:1.06,filter:'brightness(3)'},{opacity:1,scaleY:1,scaleX:1,filter:'brightness(1)',duration:.26,ease:'power3.out',immediateRender:false},t);},
 sq:(e,t)=>{const a=e.querySelector('.st'),b=e.querySelector('.sb'),l=e.querySelector('.ln');gsap.set([a,b],{scaleY:0});gsap.set(l,{scaleX:1,opacity:0});tl.set(e,{opacity:1},t);
  tl.to([a,b],{scaleY:1,duration:.15,ease:'power3.in'},t);tl.to(l,{opacity:1,duration:.04},t+.1);tl.to(l,{scaleX:0,duration:.1,ease:'power2.in'},t+.16);
  tl.to(l,{scaleX:1,duration:.08,ease:'power2.out'},t+.3);tl.to([a,b],{scaleY:0,duration:.24,ease:'power3.out'},t+.36);tl.to(l,{opacity:0,duration:.12},t+.4);tl.set(e,{opacity:0},t+.62);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,scaleY:.03,scaleX:1.08,filter:'brightness(3)'},{scaleY:1,scaleX:1,filter:'brightness(1)',duration:.32,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{scaleY:.02,scaleX:1.06,opacity:0,duration:.2,ease:'power3.in'},b-.2)`,
});

// Captions: join any {display|spoken} split words back for the strip.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Audiowide,'Arial Black',sans-serif;font-weight:400;font-size:54px;line-height:1.2;word-spacing:.08em;color:#fff;padding:10px 18px 14px;text-shadow:0 0 4px rgba(255,0,127,1),0 0 16px rgba(255,0,127,.85),0 3px 6px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"${CYAN}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bhutan TV 1999", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
