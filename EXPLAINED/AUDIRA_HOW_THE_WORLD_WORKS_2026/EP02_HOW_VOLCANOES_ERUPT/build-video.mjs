// EP02 THE SECTION. Survey-sheet annotations over a sliced mountain. The film's axis is vertical: panels rise as magma rises. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const EMB = "#FF8A3D", INK = "#0B0705", SUL = "#F4D35E", BONE = "#F3E9DC";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">HOW THE WORLD WORKS &middot; EP 02</div>
  <div class="h0">GUNUNG<br>BERAPI</div>
  <div class="tl">Apa yang terjadi di bawah permukaan?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">PENAMPANG, ILUSTRASI &middot; TIDAK BERSKALA</div>
  <div class="row" data-at="s2:magma" data-fx="up"><b>MAGMA</b><span>batuan leleh di bawah tanah</span></div>
  <div class="row" data-at="s2:dapur" data-fx="up"><b>DAPUR MAGMA</b><span>tempat magma berkumpul</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">GAS TERLARUT</div>
  <div class="row" data-at="s3:gas" data-fx="up"><b>H&#8322;O &middot; CO&#8322; &middot; SO&#8322;</b><span>gas vulkanik utama, USGS</span></div>
  <div class="note" data-at="s3:tekanannya" data-fx="fade">Tekanan tinggi: gas tetap larut</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">DEKOMPRESI</div>
  <div class="meter"><div class="mtxt"><b>TEKANAN</b><i data-at="s4:tekanan" data-fx="fade">TURUN</i></div><div class="track"><div class="fill" id="pfill"></div></div></div>
  <div class="note" data-at="s4:gelembung" data-fx="fade">Gas lepas dari larutan: gelembung</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">MAGMA ENCER &middot; EFUSIF</div>
  <div class="row" data-at="s5:mengalir" data-fx="up"><b>LAVA MENGALIR</b><span>gas mudah lepas, contoh: Hawaii</span></div>
  <div class="note" data-at="s5:lambat" data-fx="fade">Umumnya &lt; 1 km/jam di lereng landai, USGS</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">MAGMA KENTAL &middot; EKSPLOSIF</div>
  <div class="note" data-at="s6:menjebak" data-fx="fade">Gelembung terjebak, tekanan menumpuk</div>
  <div class="row" data-at="s6:abu" data-fx="up"><b>ABU &amp; PECAHAN BATU</b><span>magma terpecah oleh gas</span></div>
  <div class="note" data-at="s6:St" data-fx="fade">Contoh: Gunung St. Helens, 1980</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">ALIRAN PIROKLASTIK</div>
  <div class="row big" data-at="s7:100" data-fx="up"><b class="nb">&plusmn;100 KM/JAM</b><span>rata-rata, bisa lebih cepat</span></div>
  <div class="row big" data-at="s7:ratusan" data-fx="up"><b class="nb">200&ndash;700 &deg;C</b><span>suhu material</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:gas" data-fx="up">GAS &middot; TEKANAN<br>&middot; KEKENTALAN</div>
  <div class="note" data-at="s8:kekentalan" data-fx="fade">Sumber: USGS Volcano Hazards Program</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:"Source Code Pro",monospace;font-weight:700;font-size:27px;letter-spacing:.04em;color:${INK};background:${SUL};padding:6px 12px;margin-bottom:14px}
.h0{font-family:"Playfair Display",serif;font-weight:900;font-size:150px;line-height:.98;color:${BONE};text-shadow:0 4px 30px rgba(0,0,0,.7)}
.h2{font-family:"Playfair Display",serif;font-weight:900;font-size:84px;line-height:1.08;color:${BONE};text-shadow:0 3px 22px rgba(0,0,0,.9)}
.tl{font-family:Lato,sans-serif;font-weight:700;font-size:42px;color:#fff;margin-top:12px;text-shadow:0 2px 14px rgba(0,0,0,.9)}
.row{background:rgba(11,7,5,.72);border-bottom:4px solid ${EMB};padding:12px 18px;margin-top:10px}
.row b{display:block;font-family:"Playfair Display",serif;font-weight:900;font-size:56px;line-height:1.1;color:${BONE}}
.row.big b{font-family:Lato,sans-serif;font-weight:900;font-size:66px;color:${SUL}}
.row span{display:block;font-family:Lato,sans-serif;font-weight:700;font-size:33px;line-height:1.16;color:#fff;margin-top:2px}
.note{display:inline-block;font-family:Lato,sans-serif;font-weight:700;font-size:32px;line-height:1.18;color:${SUL};margin-top:10px;background:rgba(11,7,5,.62);padding:4px 10px}
.meter{background:rgba(11,7,5,.72);border-bottom:4px solid ${EMB};padding:12px 18px}
.mtxt{display:flex;justify-content:space-between;align-items:baseline}
.mtxt b{font-family:Lato,sans-serif;font-weight:900;font-size:46px;color:${BONE}}
.mtxt i{font-style:normal;font-family:Lato,sans-serif;font-weight:900;font-size:46px;color:${EMB}}
.track{height:20px;background:rgba(255,255,255,.14);margin-top:8px}
.fill{height:100%;width:100%;background:linear-gradient(90deg,${EMB},${SUL});transform-origin:0 50%}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const PT = at("s4:tekanan"), PE = TL.scenes.find((x) => x.id === "s4").end;
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: INK, vig: 0.4, grain: 0.05, capfloor: 0.26, html, css,
  extraAt: ["s2:magma", "s3:soda", "s4:tekanan", "s4:gelembung", "s4:mengembang", "s5:Magma", "s5:Hawaii", "s6:Magma", "s6:ganas", "s6:abu", "s7:aliran", "s8:gas"],
  // The film's axis is up: panels rise out of the ground and keep rising on exit.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:70,opacity:0},{y:0,opacity:1,duration:.34,ease:'power4.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-70,opacity:0,duration:.2,ease:'power3.in'},b-.2)`,
  hud: `(t)=>{const f=document.getElementById('pfill');if(f){const u=Math.min(1,Math.max(0,(t-${PT})/(${PE}-${PT})));f.style.transform='scaleX('+(1-u*.82)+')';}}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Lato,sans-serif;font-weight:900;font-size:60px;line-height:1.24;color:${BONE};text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 4px;position:relative}`,
// Active word glows from within: it heats to ember, then cools back to bone.
(id, w) => `tl.fromTo("#${id}",{color:"${BONE}",y:0},{color:"#FFA63D",y:-5,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${BONE}",y:0,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14,opacity:0},{y:0,opacity:1,duration:.12,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Section", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
