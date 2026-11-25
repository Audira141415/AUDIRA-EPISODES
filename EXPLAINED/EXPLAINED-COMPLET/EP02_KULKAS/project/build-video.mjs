// EP02 KULKAS. THERMALFORGE: a kitchen seen through a thermal camera (ironbow palette, HUD reticles, temperature
// scale bar, scanlines). Panels are sensor readout cards with a cyan rule that open like a scan line.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#00E5FF", YE = "#F7D038", VI = "#B9A2FF", INK = "#0A0A10";
const MONO = "'Share Tech Mono',monospace", DISP = "'Chakra Petch',sans-serif";

const hud = `
<div id="hudid"><i id="rec"></i>AUDIRA THERMAL</div>
<div class="brk tl"></div><div class="brk tr"></div><div class="brk bl"></div><div class="brk br"></div>
<div id="xh"><b class="h1"></b><b class="h2"></b><b class="v1"></b><b class="v2"></b></div>
<div id="scale"><div class="lab top">PANAS</div><div id="sbar"></div><div id="sptr"><span></span></div><div class="lab bot">DINGIN</div></div>`;

const html = `${hud}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA KERJA BENDA / EP 02</div>
  <div class="card"><div class="big">KULKAS TIDAK<br><span class="c">MEMBUAT DINGIN</span></div></div>
  <div class="ln" data-at="s1:memindahkan" data-fx="lit">Ia <b class="h">memindahkan panas</b>: dari dalam ke luar</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>PIPA BELAKANG KULKAS</div>
  <div class="card" data-at="s2:hangat" data-fx="lit"><div class="big md"><span class="h">TERASA HANGAT</span></div></div>
  <div class="ln" data-at="s2:dibuang" data-fx="lit">Panas dari makananmu dibuang ke udara ruangan</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>CAIRAN PENDINGIN</div>
  <div class="ln" data-at="s3:refrigeran" data-fx="lit">Refrigeran, misalnya <b class="c">R134a</b></div>
  <div class="ln" data-at="s3:berputar" data-fx="lit">Terus berputar lewat 4 komponen</div>
  <div class="row"><b class="k" data-at="s3:kompresor" data-fx="lit">KOMPRESOR</b><b class="k" data-at="s3:kondensor" data-fx="lit">KONDENSOR</b></div>
  <div class="row"><b class="k" data-at="s3:katup" data-fx="lit">KATUP EKSPANSI</b><b class="k" data-at="s3:evaporator" data-fx="lit">EVAPORATOR</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>EVAPORATOR</div>
  <div class="ln" data-at="s4:menguap" data-fx="lit">Refrigeran <b class="c">menguap</b></div>
  <div class="ln" data-at="s4:menyerap" data-fx="lit">Menyerap panas dari udara &amp; makanan</div>
  <div class="card" data-at="s4:Itulah" data-fx="lit"><div class="big sm"><span class="c">ISI KULKAS DINGIN</span></div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>KOMPRESOR &amp; KONDENSOR</div>
  <div class="ln" data-at="s5:ditekan" data-fx="lit">Uap <b class="h">ditekan sampai panas</b></div>
  <div class="ln" data-at="s5:bertekanan" data-fx="lit">Uap panas bertekanan tinggi</div>
  <div class="ln" data-at="s5:melepas" data-fx="lit">Melepas panas ke udara ruangan</div>
  <div class="ln" data-at="s5:mengembun" data-fx="lit">Mengembun jadi <b class="c">cair</b> lagi</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>KATUP EKSPANSI</div>
  <div class="ln" data-at="s6:Tekanannya" data-fx="lit">Tekanannya <b class="c">turun</b></div>
  <div class="ln" data-at="s6:siap" data-fx="lit">Siap menguap lagi di dalam kulkas</div>
  <div class="card" data-at="s6:Siklus" data-fx="lit"><div class="big sm">SIKLUS <span class="h">BERULANG</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>PRINSIP LAMA</div>
  <div class="card" data-at="s7:William" data-fx="lit"><div class="big md">WILLIAM CULLEN</div></div>
  <div class="ln" data-at="s7:mendidihkan" data-fx="lit">Mendidihkan eter di ruang hampir hampa udara</div>
  <div class="ln" data-at="s7:menyerap" data-fx="lit">Cairan itu <b class="c">menyerap panas</b> di sekitarnya</div>
  <div class="ln" data-at="s7:Kulkas" data-fx="lit">Kulkas rumah yang praktis: <b class="h">1915</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="lit"><div class="big sm">BUKAN PEMBUAT <span class="c">DINGIN</span></div></div>
  <div class="card" data-at="s8:pengangkut" data-fx="lit"><div class="big sm">TAPI PENGANGKUT <span class="h">PANAS</span></div></div>
  <div class="ln" data-at="s8:Kamu" data-fx="lit">Belakang kulkasmu hangat?</div>
</div>`;

const css = `
.tag{display:table;font-family:${MONO};font-size:30px;letter-spacing:.1em;color:${CY};background:rgba(8,6,18,.86);padding:9px 18px 7px;border:2px solid rgba(0,229,255,.55);margin-bottom:14px}
.tag i{display:inline-block;width:12px;height:12px;background:${YE};box-shadow:0 0 12px ${YE};margin-right:14px;vertical-align:1px}
.card{display:table;background:rgba(8,6,18,.9);border-left:8px solid ${CY};padding:14px 28px 16px 24px;margin-bottom:14px;box-shadow:0 18px 44px rgba(0,0,0,.6)}
.big{font-family:${DISP};font-weight:700;font-size:94px;line-height:.98;letter-spacing:.005em;color:#fff;text-transform:uppercase}
.big.md{font-size:84px}.big.sm{font-size:66px;line-height:1.02}
.c{color:${VI}}.h{color:${YE}}
.ln{display:table;font-family:${DISP};font-weight:600;font-size:40px;line-height:1.18;color:#EDEAF6;background:rgba(8,6,18,.9);padding:9px 20px 9px 20px;margin-bottom:10px;border-left:5px solid rgba(0,229,255,.8);max-width:880px}
.ln b{font-weight:700}
.row{display:flex;gap:12px;margin-bottom:10px}
.k{font-family:${MONO};font-weight:400;font-size:34px;letter-spacing:.06em;padding:10px 16px 8px;color:${INK};background:${CY}}
#chip{font-family:${MONO};font-size:34px;letter-spacing:.02em;color:#fff;opacity:1;top:178px;background:rgba(8,6,18,.88);padding:2px 10px}
#hudid{position:absolute;right:40px;top:178px;z-index:11;font-family:${MONO};font-size:34px;letter-spacing:.04em;color:${CY};background:rgba(8,6,18,.88);padding:2px 10px}
#rec{display:inline-block;width:12px;height:12px;border-radius:50%;background:#FF3B5C;margin-right:12px;vertical-align:1px}
.brk{position:absolute;width:64px;height:64px;z-index:11;border:0 solid rgba(0,229,255,.7);pointer-events:none}
.brk.tl{left:30px;top:150px;border-left-width:4px;border-top-width:4px}.brk.tr{right:30px;top:150px;border-right-width:4px;border-top-width:4px}
.brk.bl{left:30px;top:1470px;border-left-width:4px;border-bottom-width:4px}.brk.br{right:30px;top:1470px;border-right-width:4px;border-bottom-width:4px}
#xh{position:absolute;left:540px;top:960px;z-index:8;opacity:.5;pointer-events:none}
#xh b{position:absolute;background:${CY}}#xh .h1{left:-46px;top:-1px;width:26px;height:2px}#xh .h2{left:20px;top:-1px;width:26px;height:2px}
#xh .v1{left:-1px;top:-46px;width:2px;height:26px}#xh .v2{left:-1px;top:20px;width:2px;height:26px}
#scale{position:absolute;left:996px;top:300px;width:40px;height:840px;z-index:11;pointer-events:none}
#sbar{position:absolute;left:10px;top:36px;width:20px;height:760px;border:2px solid rgba(255,255,255,.5);background:linear-gradient(180deg,#FFFFFF 0%,#F7D038 18%,#EA5E28 40%,#9B1D8C 62%,#310E68 82%,#0A0A10 100%)}
#sptr{position:absolute;left:-22px;top:36px;width:0;height:0}
#sptr span{position:absolute;left:0;top:-11px;width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:20px solid #fff}
#scale .lab{position:absolute;left:-44px;width:120px;text-align:center;font-family:${MONO};font-size:30px;letter-spacing:0;color:#fff;background:rgba(8,6,18,.88)}
#scale .top{top:-8px}#scale .bot{top:802px}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#07060d", vig: 0.4, grain: 0.07, capfloor: 0.5, html, css, chipFont: MONO, chipColor: "#fff", sig: "EP02_KULKAS",
  extraAt: ["s1:panas", "s1:luar", "s2:dekatkan", "s2:pipa", "s2:dibuang", "s3:Kuncinya", "s3:Cairan", "s4:makanan", "s4:dingin",
    "s5:kompresor", "s5:panas", "s5:kondensor", "s5:mengalir", "s6:katup", "s6:turun", "s6:Siklus", "s7:sekitarnya", "s8:dingin", "s8:panas",
    "s2:hangat", "s4:menyerap", "s5:ditekan", "s5:bertekanan", "s5:melepas", "s5:mengembun", "s6:Tekanannya", "s7:William", "s7:mendidihkan", "s7:menyerap", "s7:Kulkas", "s8:Jadi", "s8:pengangkut", "s8:AUDIRA"],
  // panels open like a thermal scan line sweeping down, then settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-30,clipPath:'inset(0% 0% 100% 0%)'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:30,clipPath:'inset(100% 0% 0% 0%)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.88,borderLeftColor:'rgba(0,229,255,.45)'},{opacity:1,borderLeftColor:'#F7D038',duration:.3,ease:'power2.out'},t),`,
  hud: `(t)=>{const r=document.getElementById('rec');if(r)r.style.opacity=(Math.floor(t*1.6)%2)?'.25':'1';const h=document.getElementById('hudid');if(h)h.style.visibility=t>=K.outro?'hidden':'visible';}`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${DISP};font-weight:700;font-size:60px;line-height:1.14;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.95),3px 0 0 #000,-3px 0 0 #000,0 -3px 0 #000}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 0 #000,0 0 18px rgba(0,0,0,.95)"},{color:"${YE}",scale:1.04,textShadow:"0 3px 0 #000,0 0 22px rgba(234,94,40,.8)",duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 0 #000,0 0 18px rgba(0,0,0,.95)",duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kulkas Pengangkut Panas", "#07060d");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
