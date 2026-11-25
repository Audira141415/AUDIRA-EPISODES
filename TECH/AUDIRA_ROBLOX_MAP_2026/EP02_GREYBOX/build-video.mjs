// EP02 GREYBOX / URBANFORGE. A laser-tag map maquette on an obsidian plinth; the camera glides over it like an architect's crane.
// Panels are exhibition meta-blocks that a projector scans in from the left and wipes off to the right. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#0a0a0c", CY = "#00e6ff", AMB = "#ffb703", EM = "#00f59b", RED = "#ff5a66", WH = "#f5f5f2";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="meta"><span>PETA LASER TAG // MAQUETTE</span><span class="r">EP 02</span></div>
  <div class="ttl">MULAI DARI<br><em>KOTAK ABU-ABU</em></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="meta"><span>TAHAP PERTAMA // TATA LETAK</span></div>
  <div class="ttl sm">GREYBOX <i>/</i> BLOCKING</div>
  <div class="tools" data-at="s2:menyusun" data-fx="scan"><div class="tl"><b class="sh cube"></b>Blok</div><div class="tl"><b class="sh wedge"></b>Baji</div><div class="tl"><b class="sh cyl"></b>Silinder</div><div class="tl"><b class="sh ball"></b>Bola</div></div>
  <div class="row"><b class="ln" data-at="s2:mencoba" data-fx="scan">Uji rasa main dulu</b><b class="ln dim" data-at="s2:memoles" data-fx="scan">Poles aset nanti</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="meta"><span>UJI MAIN // MASALAH KETAHUAN</span></div>
  <div class="ls"><b class="bad" data-at="s3:susah" data-fx="scan">Susah dilewati</b><b class="bad" data-at="s3:keuntungan" data-fx="scan">Keuntungan tidak adil</b><b class="bad" data-at="s3:sebanding" data-fx="scan">Tidak sebanding karakter</b></div>
  <b class="stp" data-at="s3:Memperbaikinya" data-fx="stamp">PERBAIKI SEKARANG: JAUH LEBIH MUDAH</b>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="meta"><span>TUTORIAL RESMI ROBLOX // CONTOH</span></div>
  <div class="ttl sm">MAP LASER TAG<br><em>TIGA JALUR</em></div>
  <div class="row"><b class="ln" data-at="s4:Zona" data-fx="scan"><s class="dot r"></s><s class="dot b"></s>Zona spawn di sisi berlawanan</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="meta"><span>JALUR SILANG × JALUR TENGAH</span></div>
  <div class="ttl sm">PERSIMPANGAN =<br><em class="rd" data-at="s5:combat" data-fx="scan">COMBAT POCKET</em></div>
  <div class="row"><b class="ln" data-at="s5:keramaian" data-fx="scan">Keramaian di tengah memang dirancang</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="meta"><span>UKURAN // FILE CONTOH</span></div>
  <div class="ls"><b class="ok" data-at="s6:minimal" data-fx="scan">Pintu &amp; lorong ≥ 10 stud<small>dua pemain lewat bersamaan</small></b><b class="ok" data-at="s6:minimal#2" data-fx="scan">Dinding ≥ 10 stud<small>tidak bisa dilompati</small></b><b class="ok" data-at="s6:kamera" data-fx="scan">Kamera tidak tersangkut</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="meta"><span>TAHAP AKHIR // POLES</span></div>
  <div class="ttl sm">GANTI KE ASET<br><em>YANG DIPOLES</em></div>
  <div class="row"><b class="ch" data-at="s7:tembok" data-fx="pop">Tembok</b><b class="ch" data-at="s7:jendela" data-fx="pop">Jendela</b><b class="ch" data-at="s7:lampu" data-fx="pop">Lampu</b><b class="ch" data-at="s7:dekorasi" data-fx="pop">Dekorasi</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="meta"><span>RAHASIA BIKIN MAP</span></div>
  <div class="ttl sm">MAP SERU LAHIR<br>DARI <em>KOTAK POLOS</em></div>
  <div class="row"><b class="ln q" data-at="s8:Kamu" data-fx="scan">Langsung menghias, atau greybox dulu?</b></div>
</div>`;

const css = `
.p{background:rgba(10,10,12,.80);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:22px 30px 26px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
.p::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;border-radius:16px 0 0 16px;background:${CY}}
.meta{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:24px;letter-spacing:.12em;color:${CY};margin-bottom:12px}
.meta .r{color:${AMB}}
.ttl{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:96px;line-height:.98;letter-spacing:-.01em;color:${WH}}
.ttl.sm{font-size:72px}
.ttl em{font-style:normal;color:${AMB}}.ttl em.rd{color:${RED};display:inline-block}.ttl i{font-style:normal;color:${CY}}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.ln{display:inline-block;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:36px;color:${INK};background:${WH};border-radius:8px;padding:8px 18px 10px}
.ln.dim{background:#2a2d36;color:${WH}}.ln.q{background:${AMB}}
.dot{display:inline-block;width:22px;height:22px;border-radius:50%;margin-right:8px;vertical-align:-2px}.dot.r{background:#ff3b4e}.dot.b{background:#2f8bff;margin-right:14px}
.tools{display:flex;gap:12px;margin-top:18px}
.tl{flex:1;background:#16181d;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:14px 6px 10px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:22px;color:#c9ccd2}
.sh{display:block;margin:0 auto 10px;width:58px;height:58px;background:linear-gradient(135deg,#c4c8ce,#8d939b)}
.sh.wedge{clip-path:polygon(0 100%,100% 100%,100% 0)}.sh.cyl{border-radius:50%/22%}.sh.ball{border-radius:50%}
.ls{display:flex;flex-direction:column;gap:10px}
.ls b{display:block;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:${WH};padding:8px 0 8px 58px;position:relative}
.ls b small{display:block;font-weight:500;font-size:28px;color:#aeb3bb}
.ls b::before{position:absolute;left:0;top:10px;width:40px;height:40px;border-radius:8px;font-size:30px;line-height:40px;text-align:center;font-weight:800}
.ls b.bad::before{content:"!";background:${RED};color:${INK}}
.ls b.ok::before{content:"\\2713";background:${EM};color:${INK}}
.stp{display:inline-block;margin-top:16px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:${INK};background:${EM};padding:10px 18px;border-radius:8px;transform-origin:30% 50%}
.ch{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:30px;color:${INK};background:${AMB};border-radius:999px;padding:8px 20px}
#chip{font-family:'JetBrains Mono',monospace;font-size:20px;color:#c9ccd2;letter-spacing:.08em}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#0a0a0c", vig: 0.32, grain: 0.04, capfloor: 0.35, html, css, chipFont: "'JetBrains Mono',monospace", chipColor: "#c9ccd2", sig: "EP02_GREYBOX",
  extraAt: ["s1:cantik", "s2:Developer", "s2:mencoba", "s3:Area", "s3:Memperbaikinya", "s3:benda", "s3:dilewati", "s3:keuntungan", "s3:sebanding", "s3:susah", "s3:titik",
    "s4:Zona", "s4:berlawanan", "s4:eksterior", "s4:interior", "s4:tata", "s4:tengah", "s5:Jadi", "s5:Persimpangan", "s5:combat", "s5:keramaian", "s5:pertempuran", "s5:silang", "s5:tengah",
    "s6:Di", "s6:Setiap", "s6:Ukurannya", "s6:dilompati", "s6:dinding", "s6:dua", "s6:kamera", "s6:lebarnya", "s6:pintu", "s6:stud", "s6:stud#2", "s6:tingginya",
    "s7:dekorasi", "s7:diganti", "s7:jendela", "s7:lampu", "s7:tembok", "s8:Kamu", "s8:lahir", "s8:AUDIRA", "s1:abu-abu", "s2:Namanya"],
  // A projector scans each panel in from the left edge with a brief overexposure, then wipes it off to the right.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0% 100% 0% 0%)',opacity:1,filter:'brightness(2.4)'},{clipPath:'inset(0% 0% 0% 0%)',filter:'brightness(1)',duration:.5,ease:'power3.out'},a-.08);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 0% 100%)',duration:.24,ease:'power2.in'},b-.24)`,
  fxExtra: `scan:(e,t)=>tl.fromTo(e,{clipPath:'inset(0% 100% 0% 0%)',opacity:1},{clipPath:'inset(0% 0% 0% 0%)',duration:.38,ease:'power3.out'},t),`,
  // Outro: the projector raises the AUDIRA card from the plinth edge upward.
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0% 0% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.6,ease:'power3.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:58px;line-height:1.14;color:${WH};background:rgba(10,10,12,.78);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 26px 14px}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WH}",y:0},{color:"${AMB}",y:-4,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WH}",y:0,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Greybox", "#0a0a0c");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
