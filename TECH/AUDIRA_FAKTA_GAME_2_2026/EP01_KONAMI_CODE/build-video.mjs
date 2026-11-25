// EP01 KONAMI CODE. ARCADECRT: midnight arcade, phosphor CRT panels that warm up from a bright line. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#07060F", MAG = "#FF2E88", CY = "#2EF2FF", YEL = "#FFD23F", WHT = "#F4F1FF", GRN = "#5CFF7A";
const PX = "'Press Start 2P',monospace", VT = "VT323,monospace";

const html = `
<div class="scan"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME 2 // EP 01</div>
  <div class="ttl">KODE CHEAT<br><span>YANG LUPA<br>DIHAPUS</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">SIAPA PEMBUATNYA?</div>
  <div class="h">Kazuhisa Hashimoto, Konami</div>
  <div class="row"><b class="c y" data-at="s2:Gradius" data-fx="blip">GRADIUS 1985</b><b class="c" data-at="s2:NES" data-fx="blip">&rarr; NES</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">MASALAHNYA</div>
  <div class="h">Terlalu sulit, tak tamat saat diuji</div>
  <div class="row"><b class="c m" data-at="s3:tamat" data-fx="stamp">GAME OVER</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">JALAN PINTAS</div>
  <div class="h" data-at="s4:kode" data-fx="blip">Kode saat game dijeda</div>
  <div class="row"><b class="c y" data-at="s4:semua" data-fx="blip">SEMUA POWER-UP</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DIPILIH CERMAT</div>
  <div class="ln g" data-at="s5:mudah" data-fx="blip">&#10003; Mudah diingat penguji</div>
  <div class="ln m" data-at="s5:sulit" data-fx="blip">&#10007; Sulit ditekan tanpa sengaja</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">RENCANA: DIHAPUS</div>
  <div class="row"><b class="c m" data-at="s6:terlewat" data-fx="stamp">TERLEWAT</b></div>
  <div class="ln" data-at="s6:membiarkannya" data-fx="blip">Dibiarkan: takut bug baru</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">NES // 1986</div>
  <div class="h">Rilis lengkap dengan kode</div>
  <div class="row"><b class="c y" data-at="s7:Contra" data-fx="blip">CONTRA: 30 NYAWA</b></div>
  <div class="ln" data-at="s7:Sekarang" data-fx="blip">Kini kejutan di banyak game &amp; situs</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">KAZUHISA HASHIMOTO // 2020</div>
  <div class="h" data-at="s8:tapi" data-fx="blip">Kodenya masih hidup</div>
  <div class="ln y" data-at="s8:Kamu" data-fx="blip">Kamu pernah coba di game apa?</div>
</div>`;

const css = `
.scan{position:absolute;inset:0;z-index:8;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 3px,rgba(0,0,0,.16) 3px,rgba(0,0,0,.16) 5px)}
.p{background:rgba(9,6,24,.84);border:3px solid ${CY};border-radius:20px;box-shadow:0 0 0 3px rgba(255,46,136,.55),0 0 34px rgba(46,242,255,.35),inset 0 0 40px rgba(46,242,255,.12);padding:26px 30px 24px;right:120px}
.tag{display:inline-block;font-family:'Press Start 2P',monospace;font-size:22px;line-height:1;letter-spacing:.04em;color:${BG};background:${MAG};padding:10px 14px 9px;margin-bottom:20px}
.ttl{font-family:'Press Start 2P',monospace;font-size:62px;line-height:1.18;color:${YEL};text-shadow:-3px 0 0 ${MAG},3px 0 0 ${CY},0 0 22px rgba(255,210,63,.55)}
.ttl span{color:${WHT};font-size:48px}
.h{font-family:VT323,monospace;font-size:72px;line-height:.98;color:${WHT};text-shadow:-2px 0 0 ${MAG},2px 0 0 ${CY};margin-bottom:14px}
.ln{font-family:VT323,monospace;font-size:62px;line-height:1.02;color:${WHT};text-shadow:-2px 0 0 ${MAG},2px 0 0 ${CY};margin-top:8px}
.ln.g{color:${GRN}}.ln.m{color:#FF7BB5}.ln.y{color:${YEL}}
.row{display:flex;flex-wrap:wrap;gap:16px;margin-top:6px}
.c{font-family:'Press Start 2P',monospace;font-weight:400;font-size:30px;line-height:1;padding:14px 16px 12px;color:${CY};border:3px solid ${CY};background:rgba(46,242,255,.1)}
.c.y{color:${YEL};border-color:${YEL};background:rgba(255,210,63,.1)}
.c.m{color:${MAG};border-color:${MAG};background:rgba(255,46,136,.12)}
#chip{font-family:VT323,monospace;font-weight:400;font-size:30px;color:${CY};top:176px;opacity:.9;letter-spacing:.06em}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.5, grain: 0.04, capfloor: 0.35, html, css, chipFont: VT, chipColor: CY, sig: "EP01_KONAMI_CODE",
  extraAt: ["s1:Atas", "s1:atas", "s1:bawah#1", "s1:bawah#2", "s1:kiri#1", "s1:kanan#1", "s1:kiri#2", "s1:kanan#2", "s1:B", "s1:A",
    "s2:Kazuhisa", "s2:Konami", "s2:memindahkan", "s2:Gradius", "s2:1985", "s2:Nintendo", "s2:NES",
    "s3:sanggup", "s4:kode", "s4:dijeda", "s4:Hasilnya", "s4:semua", "s4:langsung", "s4:padahal", "s4:sedikit#2",
    "s5:penguji", "s5:sulit", "s6:terlewat", "s6:diproduksi", "s6:membiarkannya", "s6:bug",
    "s7:Amerika", "s7:Contra", "s7:tiga", "s7:nyawa", "s7:Sekarang", "s7:kejutan", "s7:Bank", "s8:tapi", "s8:kodenya", "s8:AUDIRA"],
  // CRT warm-up: the panel opens from a bright horizontal line, and collapses back to a line and a dot.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scaleY:.015,scaleX:1.05,opacity:1,filter:'brightness(3.2)'},{scaleY:1,scaleX:1,filter:'brightness(1)',duration:.3,ease:'power3.out'},a-.04)`,
  panelOut: `(tl,p,b)=>{tl.to(p,{scaleY:.015,filter:'brightness(3.2)',duration:.12,ease:'power2.in'},b-.2);tl.to(p,{scaleX:0,opacity:0,duration:.08,ease:'power2.in'},b-.08);}`,
  fxExtra: `blip:(e,t)=>tl.fromTo(e,{opacity:0,x:-36},{opacity:1,x:0,duration:.2,ease:'steps(4)'},t),`,
  // Outro: the tube opens from the centre line.
  outroIn: `gsap.set('#outro',{clipPath:'inset(50% 0% 50% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.4,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:VT323,monospace;font-weight:400;font-size:84px;line-height:1;color:${WHT};text-shadow:4px 0 0 #000,-4px 0 0 #000,0 4px 0 #000,0 -4px 0 #000,3px 3px 0 #000,-3px 3px 0 #000,3px -3px 0 #000,-3px -3px 0 #000,0 0 18px rgba(46,242,255,.55)}
.w{display:inline-block;margin:0 .08em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHT}",y:0},{color:"${YEL}",y:-6,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHT}",y:0,duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scaleY:.1,opacity:0},{scaleY:1,opacity:1,duration:.12,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kode Konami", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
