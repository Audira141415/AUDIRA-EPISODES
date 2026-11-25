// EP01 SUARA OOF. RUANG REKAM: a night tape lab on one long studio desk. Panels are cassette labels that run in like tape and stop like a tape-stop. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CH = "#121014", OR = "#FF6B1A", AM = "#FFB000", CR = "#F3E9D2", RD = "#E8384F";
const D = "'Archivo Black',sans-serif", M = "'IBM Plex Mono',monospace";

const html = `
<div id="tc">REC 00:00:00</div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>FAKTA ROBLOX &middot; EP 01</div>
  <div class="lab big">SUARA <span>&ldquo;OOF&rdquo;</span></div>
  <div class="lab h" data-at="s1:ternyata" data-fx="pop">bukan buatan Roblox</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>SUARA MATI KLASIK</div>
  <div class="lab h" data-at="s2:jatuh" data-fx="pop">Jatuh, badan copot berantakan</div>
  <div class="row"><b class="c" data-at="s2:meme" data-fx="pop">MEME</b><b class="c" data-at="s2:video" data-fx="pop">VIDEO LUCU</b><b class="c" data-at="s2:remix" data-fx="pop">REMIX LAGU</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>ASAL-USUL</div>
  <div class="lab big" data-at="s3:Messiah" data-fx="pop"><span>MESSIAH</span></div>
  <div class="lab h" data-at="s3:2000" data-fx="pop">game komputer, rilis 2000</div>
  <div class="row"><b class="c" data-at="s3:mengaku" data-fx="pop">klaim hak: Tommy Tallarico</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>SENGKETA &amp; DAMAI</div>
  <div class="row"><b class="c r" data-at="s4:2019" data-fx="pop">2019 &middot; dipersoalkan</b><b class="c" data-at="s4:sepakat" data-fx="pop">2020 &middot; sepakat</b></div>
  <div class="lab big sm nb" data-at="s4:satu" data-fx="pop">$1 <span>/</span> 100 ROBUX</div>
  <div class="lab h" data-at="s4:satu" data-fx="pop">biaya pakai &ldquo;oof&rdquo; di game</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>26 JULI 2022</div>
  <div class="lab big red" data-at="s5:dihapus" data-fx="stamp">DIHAPUS</div>
  <div class="lab h" data-at="s5:lisensi" data-fx="pop">alasan: masalah lisensi</div>
  <div class="row"><b class="c g" data-at="s5:datar" data-fx="pop">pengganti: jauh lebih datar</b><b class="c r" data-at="s5:Banyak" data-fx="pop">pemain protes</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>18 JULI 2025</div>
  <div class="row"><b class="c g" data-at="s6:tiga" data-fx="pop">3 tahun cuma hidup di meme</b></div>
  <div class="lab q" data-at="s6:comeback" data-fx="pop">&ldquo;A comeback so good it hurts&rdquo;<em>akun resmi Roblox</em></div>
  <div class="row"><b class="c" data-at="s6:Creator" data-fx="pop">file audio dibagikan di Creator Hub</b></div>
</div>
<div class="p" data-in="s7" data-out="@END">
  <div class="tag"><i></i>PELAJARAN BUAT KREATOR</div>
  <div class="lab h" data-at="s7:cek" data-fx="pop">Cek dulu lisensi setiap suara</div>
  <div class="lab h amb" data-at="s7:Kamu" data-fx="pop">Tim &ldquo;oof&rdquo; lama, atau tim suara pengganti?</div>
</div>`;

const css = `
.p{transform-origin:100% 50%}
.tag{display:inline-flex;align-items:center;gap:12px;font-family:${M};font-weight:600;font-size:26px;letter-spacing:.08em;color:${CR};background:${CH};border:2px solid ${OR};padding:7px 16px 7px 14px;border-radius:6px;margin-bottom:14px}
.tag i{display:block;width:14px;height:14px;border-radius:50%;background:${RD};box-shadow:0 0 12px ${RD}}
.lab{display:block;width:fit-content;max-width:900px;box-sizing:border-box;background:${CR};color:${CH};font-family:${D};border-radius:10px;border-top:12px solid ${OR};margin-bottom:14px;box-shadow:0 16px 34px rgba(0,0,0,.5)}
.big{font-size:100px;line-height:1;padding:12px 26px 18px;letter-spacing:-.01em}.big span{color:${OR}}.big.sm{font-size:84px}
.h{font-size:42px;line-height:1.12;padding:12px 22px 15px}
.q{font-size:46px;line-height:1.12;padding:14px 24px 16px;border-top-color:${AM}}.q em{display:block;font-style:normal;font-family:${M};font-weight:600;font-size:24px;color:#6b6070;margin-top:8px}
.red{background:${RD};color:${CR};border-top-color:${CH}}
.amb{background:${AM}}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.c{font-family:${M};font-weight:700;font-size:31px;line-height:1;color:${AM};background:rgba(18,16,20,.92);border:2px solid ${AM};padding:11px 16px;border-radius:8px}
.c.r{color:${RD};border-color:${RD}}.c.g{color:#cfc6d2;border-color:#8a808e}
#chip{font-family:${M};font-weight:600;color:${CR};background:rgba(18,16,20,.78);padding:3px 12px;border-radius:6px;top:176px;font-size:20px;letter-spacing:.03em}
#tc{position:absolute;right:110px;top:176px;z-index:11;font-family:${M};font-weight:600;font-size:22px;color:${AM};background:rgba(18,16,20,.78);padding:3px 12px;border-radius:6px;letter-spacing:.06em;font-variant-numeric:tabular-nums}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: CH, vig: 0.5, grain: 0.06, capfloor: 0.42, html, css, chipFont: M, chipColor: CR,
  extraAt: ["s1:oof", "s2:Karakter", "s2:terdengar", "s2:oof", "s2:meme", "s2:video", "s2:remix", "s3:Messiah", "s3:2000", "s3:Tommy", "s3:Joey", "s4:2019", "s4:mempersoalkan", "s4:2020", "s4:sepakat", "s4:satu", "s4:seratus", "s5:Juli", "s5:dihapus", "s5:lisensi", "s5:Penggantinya", "s5:datar", "s5:Banyak", "s6:Juli", "s6:2025", "s6:comeback", "s6:Suara", "s6:kembali", "s6:file", "s7:cek", "s7:lisensi", "s7:suara#2", "s7:Kamu"],
  // Tape transport: the label runs in from the right with a stretch and blur, then stops like a tape-stop (slows, sags, goes dark).
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:260,scaleX:1.32,opacity:0,filter:'blur(12px)'},{x:0,scaleX:1,opacity:1,filter:'blur(0px)',duration:.46,ease:'expo.out'},a-.08)`,
  panelOut: `(tl,p,b)=>{tl.to(p,{x:-70,y:10,scaleX:.94,rotation:-1.2,filter:'blur(3px)',duration:.32,ease:'expo.out'},b-.3);tl.to(p,{opacity:0,duration:.22,ease:'power1.in'},b-.2);}`,
  fxExtra: `pop:(e,t)=>tl.fromTo(e,{x:70,scaleX:1.2,opacity:0,filter:'blur(6px)'},{x:0,scaleX:1,opacity:1,filter:'blur(0px)',duration:.32,ease:'expo.out'},t),`,
  hud: `(t)=>{const e=q('#tc');if(!e)return;const s=Math.floor(t),f=Math.floor((t-s)*30),p=(n)=>String(n).padStart(2,'0');e.textContent='REC '+p(Math.floor(s/60))+':'+p(s%60)+':'+p(f);}`,
  // Closes as a tape wipe from the right.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 0 100%)'});tl.to('#outro',{clipPath:'inset(0 0 0 0%)',duration:.5,ease:'power3.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,sans-serif;font-weight:800;font-size:60px;line-height:1.15;color:#fff;text-shadow:4px 0 0 ${CH},-4px 0 0 ${CH},0 4px 0 ${CH},0 -4px 0 ${CH},3px 3px 0 ${CH},-3px 3px 0 ${CH},3px -3px 0 ${CH},-3px -3px 0 ${CH},0 8px 14px rgba(0,0,0,.6)}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0},{color:"${OR}",y:-6,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:34,scaleX:1.12,opacity:0},{x:0,scaleX:1,opacity:1,duration:.18,ease:"expo.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Suara Oof", CH);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
