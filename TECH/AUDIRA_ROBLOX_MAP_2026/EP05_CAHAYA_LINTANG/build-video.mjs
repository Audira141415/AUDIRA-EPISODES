// EP05 CAHAYA & LINTANG / HD2D. A tilt-shift timber-town diorama with a sun placed by latitude and clock time.
// Panels are JRPG menu windows (navy, cream double frame, amber cursor) that open from a line and fold back into one.
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#0B0E14", NAVY = "#101626", CREAM = "#F3E6C4", AMBER = "#E5A93C", GOLD = "#FFD27A", SCAR = "#FF4A3D", SKY = "#7fd3ff", PINK = "#FFB0D0";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">RAHASIA MAP ROBLOX · EP 05</div>
  <div class="win"><div class="ttl">BAYANGAN<br><span>YANG HILANG</span></div></div>
  <div class="c" data-at="s1:kotak" data-fx="pop"><i>▶</i> dihitung pakai kotak</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">CAHAYA VOXEL</div>
  <div class="win" data-at="s2:empat" data-fx="pop"><div class="big">4 × 4 × 4 STUD</div><div class="sub">satu kotak cahaya</div></div>
  <div class="c" data-at="s2:lebih" data-fx="pop"><i>▶</i> objek harus lebih besar</div>
  <div class="c" data-at="s2:bergerak" data-fx="pop"><i>▶</i> bergerak = dihitung ulang</div>
  <div class="ex" data-at="s2:layanan" data-fx="pop"><div class="exh">EXPLORER</div><div class="row">Workspace</div><div class="row on">Lighting</div><div class="row">StarterGui</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">DULU · Lighting.Technology</div>
  <div class="opts">
    <div class="o" data-at="s3:Voxel" data-fx="pop"><b>VOXEL</b><small>kotak cahaya</small></div>
    <div class="o" data-at="s3:ShadowMap" data-fx="pop"><b>SHADOWMAP</b><small>bayangan tajam</small></div>
    <div class="o f" data-at="s3:Future" data-fx="pop"><b>FUTURE</b><small>paling canggih</small></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SEKARANG</div>
  <div class="win sm"><div class="old">Technology <em data-at="s4:usang" data-fx="stamp">USANG</em></div></div>
  <div class="win sm" data-at="s4:LightingStyle" data-fx="pop"><div class="new">LightingStyle</div>
  <div class="opts two"><div class="o s" data-at="s4:Soft" data-fx="pop"><b>SOFT</b><small>bergaya · kartun</small></div><div class="o r" data-at="s4:Realistic" data-fx="pop"><b>REALISTIC</b><small>alami · nyata</small></div></div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">PrioritizeLightingQuality</div>
  <div class="win sm"><div class="q">Perangkat lemah: mana yang turun duluan?</div></div>
  <div class="opts two"><div class="o" data-at="s5:kualitas" data-fx="pop"><b>BAYANGAN</b><small>dekat kamera</small></div><div class="o" data-at="s5:jarak" data-fx="pop"><b>JARAK</b><small>pandang</small></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">JARANG DIPAKAI</div>
  <div class="win sm" data-at="s6:GeographicLatitude" data-fx="pop"><div class="new">GeographicLatitude</div><div class="sub">lintang geografis map</div></div>
  <div class="c" data-at="s6:menggeser" data-fx="pop"><i>▶</i> posisi matahari bergeser</div>
  <div class="c" data-at="s6:ClockTime" data-fx="pop"><i>▶</i> ClockTime = jam</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">CONTOH LOKASI NYATA</div>
  <div class="win sm" data-at="s7:Jakarta" data-fx="pop"><div class="big">JAKARTA</div><div class="sub" data-at="s7:enam" data-fx="pop">≈ 6° di selatan khatulistiwa</div></div>
  <div class="c" data-at="s7:pagi" data-fx="pop"><i>▶</i> pagi atau senja terasa nyata</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">CAHAYA = SUASANA</div>
  <div class="opts two"><div class="o r" data-at="s8:realistis" data-fx="pop"><b>REALISTIS</b></div><div class="o s" data-at="s8:bergaya" data-fx="pop"><b>BERGAYA</b></div></div>
  <div class="c" data-at="s8:Kamu" data-fx="pop"><i>▶</i> pilih di komentar</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:Silkscreen,monospace;font-weight:400;font-size:27px;letter-spacing:.04em;color:${NAVY};background:${AMBER};padding:6px 16px 5px;margin-bottom:14px;box-shadow:0 0 0 4px ${VOID}}
.win{position:relative;background:rgba(16,22,38,.9);border:5px solid ${CREAM};box-shadow:0 0 0 5px ${VOID},inset 0 0 0 4px ${AMBER},10px 12px 0 rgba(0,0,0,.35);padding:20px 28px 22px;margin-bottom:14px;display:table}
.win.sm{padding:14px 24px 16px}
.ttl{font-family:'Pixelify Sans',monospace;font-weight:700;font-size:104px;line-height:.98;color:${CREAM};text-shadow:6px 6px 0 ${VOID}}
.ttl span{color:${GOLD}}
.big{font-family:'Pixelify Sans',monospace;font-weight:700;font-size:86px;line-height:1;color:${GOLD};text-shadow:5px 5px 0 ${VOID}}
.sub{font-family:'Pixelify Sans',monospace;font-weight:500;font-size:36px;color:${CREAM};margin-top:8px}
.new{font-family:'Pixelify Sans',monospace;font-weight:700;font-size:68px;color:${GOLD};text-shadow:4px 4px 0 ${VOID}}
.old{font-family:'Pixelify Sans',monospace;font-weight:700;font-size:62px;color:#8b93a7;position:relative}
.old em{font-style:normal;display:inline-block;margin-left:18px;font-size:54px;color:${SCAR};border:6px solid ${SCAR};padding:0 14px;transform:rotate(-4deg)}
.q{font-family:'Pixelify Sans',monospace;font-weight:600;font-size:42px;color:${CREAM};max-width:820px;line-height:1.15}
.c{display:table;font-family:'Pixelify Sans',monospace;font-weight:600;font-size:40px;color:${CREAM};background:rgba(16,22,38,.88);border:4px solid ${CREAM};box-shadow:0 0 0 4px ${VOID};padding:6px 18px 8px;margin-bottom:12px}
.c i{font-style:normal;color:${AMBER};margin-right:10px}
.opts{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px}
.opts.two .o{min-width:300px}
.o{background:rgba(16,22,38,.92);border:5px solid ${CREAM};box-shadow:0 0 0 4px ${VOID},inset 0 0 0 3px ${AMBER};padding:10px 18px 12px}
.o b{display:block;font-family:'Pixelify Sans',monospace;font-weight:700;font-size:46px;color:${GOLD}}
.o small{display:block;font-family:Silkscreen,monospace;font-size:21px;color:${CREAM};margin-top:4px}
.o.f b{color:#FFB347}.o.s b{color:${PINK}}.o.r b{color:${SKY}}
.ex{display:table;margin-top:4px;background:#1b2233;border:4px solid ${CREAM};box-shadow:0 0 0 4px ${VOID};font-family:'Pixelify Sans',monospace;font-size:34px;color:${CREAM};min-width:360px}
.exh{font-family:Silkscreen,monospace;font-size:22px;background:${CREAM};color:${NAVY};padding:4px 14px}
.row{padding:4px 18px 4px 40px}.row.on{background:${AMBER};color:${NAVY};font-weight:700}
#chip{font-family:Silkscreen,monospace;font-weight:400;font-size:19px;color:${CREAM};background:rgba(16,22,38,.85);padding:3px 10px;border:2px solid ${AMBER};top:176px;opacity:1}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: VOID, vig: 0.4, grain: 0.05, capfloor: 0.25, html, css, chipFont: "Silkscreen,monospace", chipColor: CREAM, sig: "EP05_CAHAYA_LINTANG",
  extraAt: ["s1:kotak", "s2:berukuran", "s2:Objek", "s2:dihitung", "s2:Saat", "s3:Technology", "s3:Voxel", "s3:ShadowMap", "s3:Future",
    "s4:usang", "s4:LightingStyle", "s4:Soft", "s4:Realistic", "s4:Soft#2", "s4:Realistic#2", "s5:kualitas", "s5:atau",
    "s6:GeographicLatitude", "s6:ClockTime", "s6:Jamnya", "s7:Jakarta", "s7:Ditambah", "s8:AUDIRA"],
  // JRPG menu window: opens from a thin horizontal line, then the contents settle; closes back to the line.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{scaleY:.04,scaleX:.6,opacity:1,transformOrigin:'0% 30%'},{scaleX:1,duration:.14,ease:'power2.out'},a-.05);tl.to(p,{scaleY:1,duration:.22,ease:'steps(5)'},a+.09);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{scaleY:.04,duration:.16,ease:'steps(4)'},b-.3);tl.to(p,{scaleX:0,opacity:0,duration:.12,ease:'power2.in'},b-.14);}`,
  // Outro: a lantern iris opens from the centre.
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 45%)'});tl.to('#outro',{clipPath:'circle(120% at 50% 45%)',duration:.7,ease:'power2.inOut'},OUT-.25);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-start}
.capin{position:relative;max-width:900px;text-align:center;font-family:'Pixelify Sans',monospace;font-weight:600;font-size:60px;line-height:1.12;color:${CREAM};background:rgba(11,14,20,.9);border:5px solid ${CREAM};box-shadow:0 0 0 5px ${VOID},inset 0 0 0 4px ${AMBER};padding:12px 26px 14px}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${CREAM}",y:0},{color:"${GOLD}",y:-7,duration:.06,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CREAM}",y:0,duration:.08,ease:"steps(2)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scaleY:.1,opacity:0},{scaleY:1,opacity:1,duration:.14,ease:"steps(4)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Cahaya dan Lintang", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
