// EP05 BOLA GOLF. INNERWORKS: bright cream studio, cutaway balls with layer caps, white callout cards with a mint rule
// and orange dots (like the quality-bar cover). Panels slide in like a section plane sweeping across. Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const MINT = "#10B981", MINTD = "#0F766E", OR = "#F97316", INK = "#0F172A";
const HD = "'Space Grotesk',sans-serif", MO = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA PEMBUATAN &middot; EP 05</div>
  <div class="card"><div class="big">BOLA <span>GOLF</span></div></div>
  <div class="ln" data-at="s1:lubang" data-fx="lit"><b class="d"></b>Ratusan lubang kecil</div>
  <div class="ln o" data-at="s1:dua" data-fx="lit"><b class="d"></b>Terbang hampir 2&times; lebih jauh</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>SEJARAH SINGKAT</div>
  <div class="card" data-at="s2:pertengahan" data-fx="lit"><div class="big sm">PERTENGAHAN<br><span>ABAD KE-19</span></div></div>
  <div class="ln" data-at="s2:mulus" data-fx="lit"><b class="d"></b>Bola getah: awalnya mulus</div>
  <div class="ln" data-at="s2:tergores" data-fx="lit"><b class="d"></b>Bola tergores terbang lebih jauh</div>
  <div class="ln o" data-at="s2:dicetak" data-fx="lit"><b class="d"></b>Kini polanya dicetak di pabrik</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>LANGKAH 1 &middot; INTI</div>
  <div class="ln" data-at="s3:Karet" data-fx="lit"><b class="d"></b>Karet sintetis polybutadiene</div>
  <div class="ln" data-at="s3:zinc" data-fx="lit"><b class="d"></b>+ zinc diacrylate &rarr; kuat &amp; memantul</div>
  <div class="ln" data-at="s3:dipotong" data-fx="lit"><b class="d"></b>Adonan dipotong</div>
  <div class="ln o" data-at="s3:dipanggang" data-fx="lit"><b class="d"></b>Dipanggang di cetakan panas bertekanan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>LANGKAH 2 &middot; LAPISAN &amp; KULIT</div>
  <div class="ln" data-at="s4:lapisan" data-fx="lit"><b class="d"></b>Lapisan tengah: plastik kaku</div>
  <div class="ln" data-at="s4:setengah" data-fx="lit"><b class="d"></b>Inti di antara dua setengah cetakan</div>
  <div class="ln" data-at="s4:keras" data-fx="lit"><b class="d"></b>Plastik keras atau urethane mengisi rongga</div>
  <div class="card" data-at="s4:tiga" data-fx="lit"><div class="big sm"><span>300&ndash;500</span> DIMPLE</div><div class="sub">sekaligus, dari rongga cetakan</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>LANGKAH 3 &middot; RAPIKAN &amp; UJI</div>
  <div class="ln" data-at="s5:dibuang" data-fx="lit"><b class="d"></b>Sisa plastik sambungan dibuang</div>
  <div class="ln" data-at="s5:dicat" data-fx="lit"><b class="d"></b>Dicat sambil diputar</div>
  <div class="ln" data-at="s5:logo" data-fx="lit"><b class="d"></b>Logo dicetak, lalu pernis bening</div>
  <div class="ln" data-at="s5:memastikan" data-fx="lit"><b class="d"></b>Sinar-X: inti di tengah</div>
  <div class="ln o" data-at="s5:robot" data-fx="lit"><b class="d"></b>Robot pemukul menguji jarak</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>KENAPA ADA DIMPLE?</div>
  <div class="ln" data-at="s6:pusaran" data-fx="lit"><b class="d"></b>Mulus: pusaran besar, bola ditarik mundur</div>
  <div class="ln" data-at="s6:bergolak" data-fx="lit"><b class="d"></b>Dimple: udara bergolak, menempel lama</div>
  <div class="card" data-at="s6:separuh" data-fx="lit"><div class="big sm">HAMBATAN <span>&asymp; &frac12;</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>HASILNYA</div>
  <div class="ln" data-at="s7:setengah" data-fx="lit"><b class="d"></b>Bola mulus: kira-kira setengah jarak</div>
  <div class="ln" data-at="s7:kecepatan" data-fx="lit"><b class="d"></b>Batas kecepatan awal resmi</div>
  <div class="card" data-at="s7:sekitar" data-fx="lit"><div class="big"><span>&plusmn;<b class="ct nb" data-from="200" data-to="280" data-a="s7:sekitar" data-d="1.4">280</b></span> <small>KM/JAM</small></div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="lit"><div class="big sm">LUBANG KECIL,<br><span>BUKAN HIASAN</span></div></div>
  <div class="ln" data-at="s8:Ikuti" data-fx="lit"><b class="d"></b>Ikuti AUDIRA: cara pembuatan berikutnya</div>
</div>`;

const css = `
.tag{display:table;font-family:${MO};font-weight:700;font-size:28px;letter-spacing:.1em;color:#fff;background:${INK};padding:11px 22px 9px;border-radius:40px;margin-bottom:16px;box-shadow:0 10px 24px rgba(15,23,42,.18)}
.tag i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${MINT};box-shadow:0 0 0 4px rgba(16,185,129,.25);margin-right:14px;vertical-align:1px}
.card{display:table;background:rgba(255,255,255,.94);border-left:10px solid ${MINT};padding:14px 30px 18px 26px;margin-bottom:14px;border-radius:6px 22px 22px 6px;box-shadow:0 18px 40px rgba(15,23,42,.14)}
.big{font-family:${HD};font-weight:700;font-size:104px;line-height:.98;letter-spacing:-.02em;color:${INK}}
.big span{color:${OR}}.big.sm{font-size:70px;line-height:1.02}.big small{font-size:52px;letter-spacing:.02em;color:${MINTD}}
.sub{font-family:${MO};font-size:26px;color:${MINTD};margin-top:6px;letter-spacing:.04em}
.ln{display:table;font-family:${HD};font-weight:600;font-size:38px;line-height:1.18;color:${INK};background:rgba(255,255,255,.92);padding:10px 22px 10px 18px;margin-bottom:10px;border-radius:40px;max-width:880px;box-shadow:0 8px 22px rgba(15,23,42,.12)}
.ln .d{display:inline-block;width:16px;height:16px;border-radius:50%;background:${MINT};margin-right:14px;vertical-align:3px}
.ln.o .d{background:${OR}}
#chip{font-family:${MO};font-size:20px;color:${INK};opacity:.6;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: "#EEF1EA", vig: 0.18, grain: 0.04, capfloor: 0.0, html, css, chipFont: MO, chipColor: INK, sig: "EP05_BOLA_GOLF",
  chip: "ILUSTRASI, BUKAN REKAMAN PABRIK ASLI",
  extraAt: ["s2:tergores", "s2:dicetak", "s3:dicampur", "s3:memantul", "s3:dipotong", "s3:dipanggang",
    "s4:lapisan", "s4:kulit", "s4:ditaruh", "s4:menutup", "s4:rongganya", "s4:Rongga",
    "s5:dibuang", "s5:dicat", "s5:logo", "s5:pernis", "s5:memastikan", "s5:robot", "s5:jaraknya",
    "s6:mulus", "s6:pusaran", "s6:Dimple", "s6:bergolak", "s6:Pusarannya",
    "s7:Hasilnya", "s7:setengah", "s7:berdimple", "s7:kecepatan", "s8:hiasan", "s8:AUDIRA", "s1:lubang", "s1:golf", "s7:280"],
  // panels sweep in like a section plane crossing the frame, then slide out the other way
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-60,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:50,clipPath:'inset(0% 0% 0% 100%)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.38},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'inset(0% 100% 0% 0%)'});tl.to('#outro',{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:60px;line-height:1.15;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 4px 0 #0F172A,3px 0 0 #0F172A,-3px 0 0 #0F172A,0 -3px 0 #0F172A,0 0 22px rgba(15,23,42,.55)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"#FDBA74",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bola Golf", "#EEF1EA");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
