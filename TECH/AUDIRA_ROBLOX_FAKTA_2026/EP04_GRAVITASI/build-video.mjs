// EP04 GRAVITASI: "LAB UJI LOMPAT". Pastel low-poly jump test field, cards that fall in under gravity, squash, and leave by jumping. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#1E2A4A", MAG = "#E0457B", ORG = "#FF8A3D", BLU = "#3B82F6", SKY = "#BFE3FF", CRM = "#FFFDF7";

// ---- physics schedule shared by world3d.js (K.J, K.X) and mix.py (beats.json)
const GR = 196.2, GE = 35, GM = 5.79, V = Math.sqrt(2 * GR * 7.2); // 53.15 studs/s
const X = [[0, 0]], J = [];
let cx = 0;
const r3 = (v) => +v.toFixed(3);
const go = (t0, t1, x1) => { X.push([r3(t0), cx]); X.push([r3(t1), x1]); cx = x1; };
// J row: [takeoff, v, g, kind(0 roblox, 1 realistic, 2 moon), trailKeepUntil, landing]
const jump = (t0, v, g, dx, kind, keep) => { const air = (2 * v) / g; J.push([r3(t0), r3(v), g, kind, r3(keep), r3(t0 + air)]); go(t0, t0 + air, r3(cx + dx)); };
const s2 = TL.scenes[1].start, s4 = TL.scenes[3].start, s5 = TL.scenes[4].start, s6 = TL.scenes[5].start, s7 = TL.scenes[6].start;
[0.3, 1.1, 1.9, 2.7, at("s1:enam") - 0.05, at("s1:bumi") - 0.1].forEach((t, i) => jump(t, V, GR, i % 2 ? -1.6 : 1.6, 0, s2 + 0.6));
go(5.75, 5.75 + 37 / 16, 37);
go(17.3, 17.3 + 40 / 16, 77);
jump(at("s3:Hampir") - 0.05, V, GR, 0, 0, s4 + 0.3);
jump(at("s4:nyata") - 0.1, V, GR, 0, 0, s5);
go(41.75, 41.75 + 40 / 16, 117);
jump(at("s5:Tinggi"), V, GR, 4, 0, s6 + 0.4);
jump(at("s5:pintu") - 0.15, V, GR, -4, 0, s6 + 0.4);
jump(at("s5:setengah"), V, GR, 4, 0, s6 + 0.4);
go(54.75, 54.75 + 39 / 16, 160);
jump(at("s6:melambung") - 0.3, V, GE, 1.8, 1, s7 + 0.4);
jump(64.6, V, GE, -1.8, 1, s7 + 0.4);
go(67.9, 79.9, 352);
jump(80.25, 10, GM, 1.5, 2, 99);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA ROBLOX #04 &middot; LAB UJI LOMPAT</div>
  <div class="cd h">Gravitasi Roblox</div>
  <div class="row"><b class="chip b mono" data-at="s1:gravitasinya" data-fx="drop">BUMI 9,8 m/s²</b><b class="chip m mono" data-at="s1:hampir" data-fx="drop">ROBLOX 54,9 m/s²</b></div>
  <div class="cd big" data-at="s1:enam" data-fx="drop">&asymp; 6&times; <span>BUMI</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">SATUAN RESMI ROBLOX</div>
  <div class="cd big mono" data-at="s2:satu" data-fx="drop">1 stud <span class="o">= 28 cm</span></div>
  <div class="chip w" data-at="s2:Dari" data-fx="drop">semua angka bisa diubah ke meter</div>
</div>
<div class="p" data-in="s3" data-out="s3:Bumi">
  <div class="tag">GRAVITASI BAWAAN ROBLOX</div>
  <div class="cd h mono" data-at="s3:seratus" data-fx="drop">196,2 stud/s²</div>
  <div class="cd h mono m" data-at="s3:lima" data-fx="drop">= 54,9 m/s²</div>
</div>
<div class="p" data-in="s3:Bumi" data-out="s4">
  <div class="tag">BUMI CUMA 9,8 m/s²</div>
  <div class="cd big" data-at="s3:Hampir" data-fx="drop">&asymp; 6&times; <span>LIPAT</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">DOKUMEN YANG SAMA</div>
  <div class="chip w" data-at="s4:realistis" data-fx="drop">Gravitasi realistis:</div>
  <div class="cd big mono" data-at="s4:tiga" data-fx="drop"><span class="o">35</span> stud/s²</div>
  <div class="chip w" data-at="s4:Jadi" data-fx="drop">bawaan jauh dari dunia nyata</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">LOMPATAN BAWAAN</div>
  <div class="cd h mono" data-at="s5:tujuh" data-fx="drop">7,2 stud <span class="o">&asymp; 2 m</span></div>
  <div class="row"><b class="chip w" data-at="s5:pintu" data-fx="drop">setinggi pintu</b><b class="chip m mono" data-at="s5:setengah" data-fx="drop"><i class="sw"></i><b class="swc" data-a="s5:setengah" data-d="${((2 * V) / GR).toFixed(4)}" data-dec="2">0,00 dtk</b></b></div>
</div>
<div class="p" data-in="s6" data-out="s6:Hitungan">
  <div class="tag">GRAVITASI DIGANTI REALISTIS</div>
  <div class="row"><b class="chip o mono" data-at="s6:realistis" data-fx="drop">g = 35 stud/s²</b><b class="chip w" data-at="s6:tetap" data-fx="drop">tenaga lompat tetap</b></div>
</div>
<div class="p" data-in="s6:Hitungan" data-out="s7">
  <div class="tag">HITUNGAN KAMI</div>
  <div class="cd big mono" data-at="s6:empat" data-fx="drop">&asymp; 40 stud</div>
  <div class="row"><b class="chip o mono" data-at="s6:sebelas" data-fx="drop">&asymp; 11 m</b><b class="chip m mono" data-at="s6:melambung" data-fx="drop"><i class="sw"></i><b class="swc" data-a="s6:melambung-0.3" data-d="${((2 * V) / GE).toFixed(4)}" data-dec="1">0,0 dtk</b></b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">KECEPATAN JALAN BAWAAN</div>
  <div class="cd h mono" data-at="s7:enam" data-fx="drop">16 stud/dtk</div>
  <div class="row" data-at="s7:kilometer" data-fx="drop"><div class="gauge"><div class="arc"></div><div class="needle" data-at="s7:kilometer+0.2" data-fx="needle"></div><div class="hub"></div></div><b class="chip o mono">&asymp; 16 km/jam</b></div>
  <div class="chip w" data-at="s7:berlari" data-fx="drop">setara lari cukup kencang</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">DEVELOPER BEBAS MENGUBAH</div>
  <div class="chip w" data-at="s8:bulan" data-fx="drop">misalnya level di bulan</div>
  <div class="cd h" data-at="s8:Kalau" data-fx="drop">Kamu pilih gravitasi <span>berapa?</span></div>
  <div class="row"><b class="chip m mono" data-at="s8:berapa" data-fx="drop">196,2</b><b class="chip o mono" data-at="s8:yang" data-fx="drop">35</b><b class="chip w mono" data-at="s8:pilih" data-fx="drop">?</b></div>
</div>`;

const css = `
.p{display:flex;flex-direction:column;align-items:flex-start;gap:14px;transform-origin:50% 100%}
.tag{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:25px;letter-spacing:.04em;color:#fff;background:${NAVY};padding:7px 16px;border-radius:10px}
.cd{display:inline-block;background:${CRM};color:${NAVY};border:5px solid ${NAVY};border-radius:24px;box-shadow:0 10px 0 ${NAVY};font-family:Syne,sans-serif;font-weight:800;transform-origin:50% 100%}
.big{font-size:92px;line-height:1.02;padding:12px 26px 16px;letter-spacing:-.01em}.big span{color:${MAG}}
.h{font-size:52px;line-height:1.08;padding:12px 22px 14px}.h span{color:${MAG}}
.mono{font-family:'JetBrains Mono',monospace;font-weight:800;letter-spacing:-.02em}
.big.mono{font-size:84px}
span.o{color:${ORG}}
.cd.m{background:${MAG};color:#fff}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:14px;transform-origin:50% 100%}
.chip{display:inline-flex;white-space:nowrap;align-items:center;gap:10px;font-family:Syne,sans-serif;font-weight:800;font-size:36px;line-height:1;padding:12px 20px 14px;border-radius:18px;border:4px solid ${NAVY};box-shadow:0 7px 0 ${NAVY};transform-origin:50% 100%}
.chip.mono{font-family:'JetBrains Mono',monospace}
.chip.b{background:${BLU};color:#fff}.chip.m{background:${MAG};color:#fff}.chip.o{background:${ORG};color:${NAVY}}.chip.w{background:${CRM};color:${NAVY}}
.sw{display:inline-block;width:30px;height:30px;border:5px solid currentColor;border-radius:50%;position:relative;box-sizing:border-box}
.sw:after{content:'';position:absolute;left:50%;top:3px;width:4px;height:9px;margin-left:-2px;background:currentColor;border-radius:2px}
.swc{font-variant-numeric:tabular-nums}
.gauge{position:relative;width:200px;height:112px;background:${CRM};border:4px solid ${NAVY};border-radius:110px 110px 18px 18px;box-shadow:0 7px 0 ${NAVY};overflow:hidden}
.gauge .arc{position:absolute;left:18px;top:18px;width:156px;height:156px;border-radius:50%;background:conic-gradient(from -90deg,${MAG} 0deg,${ORG} 90deg,${SKY} 180deg,transparent 180deg);-webkit-mask:radial-gradient(circle,transparent 52px,#000 53px);mask:radial-gradient(circle,transparent 52px,#000 53px)}
.gauge .needle{position:absolute;left:98px;bottom:8px;width:7px;height:76px;margin-left:-3px;background:${NAVY};border-radius:4px;transform-origin:50% 100%}
.gauge .hub{position:absolute;left:84px;bottom:-8px;width:30px;height:30px;border-radius:50%;background:${NAVY}}
#chip{font-family:'JetBrains Mono',monospace;font-weight:800;color:${NAVY};background:rgba(255,253,247,.85);padding:3px 12px;border-radius:8px;top:176px;font-size:20px;opacity:1}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
// needle: 0..40 km/jam over 180 degrees, 16 km/jam sits at -90 + 72 = -18 deg
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: SKY, vig: 0.16, grain: 0.03, capfloor: 0, html, css, chipFont: "JetBrains Mono", chipColor: NAVY,
  K: { X, J },
  extraAt: ["s1:gravitasinya", "s1:enam", "s1:bumi", "s2:satu", "s2:dua", "s2:Dari", "s3:seratus", "s3:lima", "s3:Bumi", "s3:Hampir", "s4:Dokumen", "s4:tiga", "s4:nyata", "s5:tujuh", "s5:Tinggi", "s5:pintu", "s5:setengah", "s6:realistis", "s6:melambung", "s6:empat", "s6:Hitungan", "s7:enam", "s7:kilometer", "s8:bulan"],
  // Cards fall in under gravity (accelerating), squash on landing, and leave by jumping up (decelerating).
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{y:-1000,opacity:1},{y:0,duration:.32,ease:'power2.in'},a-.32);tl.fromTo(p,{scaleY:.8,scaleX:1.07},{scaleY:1,scaleX:1,duration:.5,ease:'elastic.out(1,.42)',immediateRender:false},a);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{scaleY:.84,scaleX:1.06,duration:.09,ease:'power1.out'},b-.42);tl.to(p,{y:-1100,scaleY:1.1,scaleX:.95,duration:.3,ease:'power2.out'},b-.32);}`,
  fxExtra: `drop:(e,t)=>{tl.fromTo(e,{y:-220,opacity:0},{y:0,opacity:1,duration:.26,ease:'power2.in'},t-.2);tl.fromTo(e,{scaleY:.72,scaleX:1.1},{scaleY:1,scaleX:1,duration:.45,ease:'elastic.out(1,.4)',immediateRender:false},t+.06);},
 needle:(e,t)=>{tl.fromTo(e,{rotation:-90,opacity:1},{rotation:-18,duration:.9,ease:'back.out(2.2)'},t);},`,
  hud: `(t)=>{document.querySelectorAll('.swc').forEach(e=>{const a=AT[e.dataset.a],d=+e.dataset.d,dec=+e.dataset.dec,v=Math.min(Math.max(t-a,0),d);e.textContent=v.toLocaleString('de-DE',{minimumFractionDigits:dec,maximumFractionDigits:dec})+' dtk';});}`,
  // Outro card drops from the top and bounces like the avatar lands.
  outroIn: `gsap.set('#outro',{yPercent:-102});tl.to('#outro',{yPercent:0,duration:.7,ease:'bounce.out'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Syne,sans-serif;font-weight:800;font-size:58px;line-height:1.16;color:#fff;text-shadow:5px 0 0 ${NAVY},-5px 0 0 ${NAVY},0 5px 0 ${NAVY},0 -5px 0 ${NAVY},4px 4px 0 ${NAVY},-4px 4px 0 ${NAVY},4px -4px 0 ${NAVY},-4px -4px 0 ${NAVY},0 9px 0 ${NAVY}}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0,scaleY:1},{color:"${MAG}",y:-8,duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.12,ease:"bounce.out"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:-40,opacity:0},{y:0,opacity:1,duration:.18,ease:"power2.in"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lab Uji Lompat", SKY);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "jumps", J.length, "v", V.toFixed(2));
