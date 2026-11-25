// EP01 THE ANVIL. Data strips sit over a volumetric storm; panels strobe in like a flash. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BLU = "#8FD6FF", INK = "#04060E", RED = "#FF7A66";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="sl">HOW THE WORLD WORKS &middot; EP 01</div>
  <div class="h0">PETIR</div>
  <div class="tl">Pelepasan listrik di atmosfer</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="sl">TIME-LAPSE, ILUSTRASI</div>
  <div class="ch" data-at="s2:udara" data-fx="fade">Udara hangat &amp; lembap naik</div>
  <div class="h2" data-at="s2:kumulonimbus" data-fx="up">KUMULONIMBUS</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="sl">DI DALAM AWAN</div>
  <div class="key" data-at="s3:kristal" data-fx="left"><i class="hex"></i><span>Kristal es, ringan, terbawa naik</span></div>
  <div class="key" data-at="s3:graupel" data-fx="left"><i class="ball"></i><span>Graupel, berat, tertahan atau jatuh</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="sl">PEMISAHAN MUATAN</div>
  <div class="key" data-at="s4:Kristal" data-fx="left"><b class="pl">+</b><span>Kristal es, ke puncak awan</span></div>
  <div class="key" data-at="s4:Butiran" data-fx="left"><b class="mi">&minus;</b><span>Butiran berat, tengah hingga bawah</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="sl">SIMULASI DIPERLAMBAT</div>
  <div class="ch" data-at="s5:penghalang#2" data-fx="fade">Isolasi udara runtuh</div>
  <div class="kv" data-at="s5:45" data-fx="up"><b class="nb">&plusmn;45 m</b><span>per langkah, stepped leader</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="sl">ARUS BALIK</div>
  <div class="kv" data-at="s6:100" data-fx="pop"><b class="nb">100 JT &ndash; 1 M</b><span>volt, batas yang dicatat NOAA</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="sl">JALUR PETIR, DIPERBESAR</div>
  <div class="kv" data-at="s7:panas" data-fx="up"><b class="nb"><b class="ct" data-from="20" data-to="27000" data-a="s7:panas" data-d="1.4" data-suf=" &deg;C">0</b></b><span>&#8776; 50.000 &deg;F, 5&times; permukaan Matahari</span></div>
  <div class="ch" data-at="s7:guntur" data-fx="fade">Gelombang tekanan &#8594; guntur</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2 am" data-at="s8:guntur" data-fx="up">DENGAR GUNTUR?</div>
  <div class="tl" data-at="s8:Segera" data-fx="up">Segera masuk ke tempat aman</div>
  <div class="srcl" data-at="s8:Segera" data-fx="fade">Sumber: NOAA National Weather Service, NSSL</div>
</div>`;

const css = `
.sl{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;letter-spacing:.06em;color:${BLU};border:2px solid ${BLU};padding:5px 12px;margin-bottom:12px;background:rgba(4,6,14,.45)}
.h0{font-family:Oswald,sans-serif;font-weight:700;font-size:210px;line-height:1;letter-spacing:.015em;color:#fff;text-shadow:0 0 42px rgba(143,214,255,.75),0 6px 26px rgba(0,0,0,.8)}
.h2{font-family:Oswald,sans-serif;font-weight:700;font-size:104px;line-height:1.05;color:#fff;letter-spacing:.015em;text-shadow:0 0 30px rgba(143,214,255,.55),0 4px 20px rgba(0,0,0,.8)}
.h2.am{color:#FFE27A;text-shadow:0 0 30px rgba(255,210,100,.45),0 4px 20px rgba(0,0,0,.9)}
.tl{font-family:Inter,sans-serif;font-weight:700;font-size:42px;color:#fff;text-shadow:0 2px 14px #000;margin-top:6px}
.ch{font-family:Inter,sans-serif;font-weight:700;font-size:40px;color:#fff;text-shadow:0 2px 14px #000;margin-bottom:10px}
.key{display:flex;align-items:center;gap:18px;background:rgba(4,6,14,.62);border-left:5px solid ${BLU};padding:12px 18px;margin-top:10px;box-shadow:0 12px 34px rgba(0,0,0,.4)}
.key span{font-family:Inter,sans-serif;font-weight:700;font-size:34px;line-height:1.16;color:#fff}
.key b{flex:none;width:58px;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:66px;line-height:1}.key b.pl{color:${BLU}}.key b.mi{color:${RED}}
.key i{flex:none;display:block;width:50px;height:50px}
.hex{background:#DFF0FF;clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)}
.ball{background:radial-gradient(circle at 35% 30%,#E7EDF4,#7D8794);border-radius:50%}
.kv{background:rgba(4,6,14,.62);border-left:5px solid ${BLU};padding:12px 18px;box-shadow:0 12px 34px rgba(0,0,0,.4)}
.kv>b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:92px;line-height:1.05;color:#fff;text-shadow:0 0 24px rgba(143,214,255,.5)}
.kv>b b{font-weight:700}
.kv span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:32px;line-height:1.16;color:${BLU};margin-top:4px}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:25px;line-height:1.2;color:#D8E9F6;margin-top:12px;text-shadow:0 1px 8px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: INK, vig: 0.42, grain: 0.06, capfloor: 0.42, html, css,
  extraAt: ["s1:pelepasan", "s2:kumulonimbus", "s3:bertumbukan", "s5:Jalur", "s5:Dari", "s6:bertemu", "s6:arus", "s7:panas", "s7:mengembang", "s7:menyusut", "s7:guntur", "s8:Segera", "s4:Kristal", "s4:Butiran", "s3:kristal", "s3:graupel", "s6:100"],
  // A panel strikes on: two quick opacity pulses, like a flash in cloud.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1},a-.14);tl.set(p,{opacity:.15},a-.09);tl.set(p,{opacity:.9},a-.05);tl.set(p,{opacity:.3},a-.015);tl.set(p,{opacity:1},a+.03);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,duration:.16,ease:'none'},b-.16)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:60px;line-height:1.24;word-spacing:.1em;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 5px}`,
// Active word charges up: it snaps to electric blue with a hard glow, then cools back to white.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"#8FE1FF",scale:1.09,duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.08,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Anvil", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
