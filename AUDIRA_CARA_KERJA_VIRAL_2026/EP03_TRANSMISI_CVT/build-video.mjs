// EP03 THE SLIDING CIRCLE. Product-studio look: graphite cyc, machined steel, orange for mechanics and cyan for electronics. Panels slide in like a spec sheet. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const OR = "#FF6B2C", CY = "#38E1FF", INK = "#101215";

const gauge = (id, a, b) => `<div class="ga" id="${id}"><span>RINGAN</span><div class="tr"><i style="left:${a}%"></i><em style="left:${b}%"></em></div><span>BERAT</span></div>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 03</div>
  <div class="h0">MATIC TANPA<br><i>PINDAH GIGI</i></div>
  <div class="tl">Dua puli. Satu sabuk.</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">CVT &middot; CONTINUOUSLY VARIABLE TRANSMISSION</div>
  <div class="ro" data-at="s2:YECVT" data-fx="left"><b>YECVT</b><span>Yamaha NMAX Turbo &middot; puli digerakkan motor listrik</span></div>
  <div class="ro" data-at="s2:D-CVT" data-fx="left"><b>D-CVT</b><span>Daihatsu, dipakai Avanza &middot; sabuk + roda gigi</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">ANATOMI</div>
  <div class="du"><div data-at="s3:depan" data-fx="pop"><b>PULI DEPAN</b><span>diputar mesin</span></div><div data-at="s3:belakang" data-fx="pop"><b>PULI BELAKANG</b><span>memutar roda</span></div></div>
  <div class="ch" data-at="s3:kerucut" data-fx="up">2 piringan kerucut per puli &middot; jaraknya bisa berubah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">SAAT BERANGKAT</div>
  <div class="ro" data-at="s4:renggang" data-fx="left"><b>DEPAN RENGGANG</b><span>sabuk di lingkaran kecil</span></div>
  <div class="ro" data-at="s4:rapat" data-fx="left"><b>BELAKANG RAPAT</b><span>sabuk di lingkaran besar</span></div>
  <div class="gw" data-at="s4:satu" data-fx="up">${gauge("g1", 88, 88)}<div class="cap2">&#8776; GIGI SATU</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">PUTARAN NAIK</div>
  <div class="ro" data-at="s5:roller" data-fx="left"><b>ROLLER TERLEMPAR</b><span>gaya sentrifugal mendorong piringan merapat</span></div>
  <div class="gw" data-at="s5:mulus" data-fx="up">${gauge("g2", 88, 10)}<div class="cap2">RASIO BERGESER MULUS</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st cy">YECVT &middot; ELEKTRONIK</div>
  <div class="ro c" data-at="s6:motor" data-fx="left"><b>ROLLER &#8594; MOTOR LISTRIK</b><span>menggeser puli depan</span></div>
  <div class="ro c" data-at="s6:sensor" data-fx="left"><b>TCU + 2 SENSOR PULI</b><span>T-Mode &middot; S-Mode</span></div>
  <div class="lv" data-at="s6:tiga" data-fx="pop"><span>Y-SHIFT</span><b>1</b><b>2</b><b>3</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">D-CVT &middot; DAIHATSU</div>
  <div class="du"><div data-at="s7:gigi" data-fx="pop"><b>SABUK</b><span>kecepatan rendah</span></div><div class="c" data-at="s7:dibagi" data-fx="pop"><b>SABUK + GIGI</b><span>kecepatan tinggi</span></div></div>
  <div class="tel" data-at="s7:persen" data-fx="up"><b>&#8776; +8%</b><span>efisiensi di kecepatan tinggi, klaim Daihatsu</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Jadi" data-fx="up">BUKAN MEMILIH GIGI.<br><i>MENGGESER LINGKARAN.</i></div>
  <div class="srcl" data-at="s8:pas" data-fx="fade">Sumber: Yamaha Indonesia; detikOto (YIMM); Daihatsu (rilis Tanto 2019); Toyota Raize; Wikipedia &ldquo;CVT&rdquo;. Model 3D adalah ilustrasi, bukan replika.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:Inter,sans-serif;font-weight:800;font-size:25px;letter-spacing:.1em;color:${INK};background:${OR};padding:6px 12px;margin-bottom:14px}
.st.cy{background:${CY}}
.h0{font-family:Syne,sans-serif;font-weight:800;font-size:100px;line-height:.95;letter-spacing:-.02em;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6)}
.h0 i{font-style:normal;color:${OR}}
.h2{font-family:Syne,sans-serif;font-weight:800;font-size:74px;line-height:1;letter-spacing:-.02em;color:#fff;text-shadow:0 4px 26px rgba(0,0,0,.8)}
.h2 i{font-style:normal;color:${OR}}
.tl{font-family:Inter,sans-serif;font-weight:700;font-size:40px;color:#E8EAED;margin-top:10px}
.ro{background:rgba(16,18,21,.78);border-left:6px solid ${OR};padding:10px 18px;margin-top:10px}
.ro.c{border-color:${CY}}
.ro b{display:block;font-family:Inter,sans-serif;font-weight:900;font-size:52px;letter-spacing:-.01em;line-height:1.04;color:#fff}
.ro span{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:29px;line-height:1.2;color:#C9CED4}
.du{display:flex;gap:12px;width:880px}.du>div{flex:1;background:rgba(16,18,21,.78);padding:10px 18px;border-top:8px solid ${OR}}
.du>div.c{border-color:${CY}}
.du b{display:block;font-family:Inter,sans-serif;font-weight:900;font-size:46px;line-height:1.02;color:#fff}
.du span{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:28px;color:#C9CED4}
.ch{font-family:Inter,sans-serif;font-weight:700;font-size:32px;line-height:1.2;color:#fff;margin-top:12px;text-shadow:0 2px 10px #000}
.gw{margin-top:14px;background:rgba(16,18,21,.78);padding:14px 18px;width:760px}
.ga{display:flex;align-items:center;gap:14px;font-family:Inter,sans-serif;font-weight:800;font-size:24px;letter-spacing:.08em;color:#C9CED4}
.ga .tr{position:relative;flex:1;height:14px;background:linear-gradient(90deg,${CY},#4a4f57,${OR})}
.ga i,.ga em{position:absolute;top:-10px;width:10px;height:34px;margin-left:-5px;background:#fff}
.ga i{opacity:.25}
#g2 em{animation:none}
.cap2{font-family:Inter,sans-serif;font-weight:900;font-size:44px;color:#fff;margin-top:8px}
.lv{display:flex;align-items:center;gap:12px;margin-top:14px}
.lv span{font-family:Inter,sans-serif;font-weight:800;font-size:30px;letter-spacing:.1em;color:${CY};margin-right:8px}
.lv b{display:block;width:76px;height:76px;line-height:76px;text-align:center;font-family:Syne,sans-serif;font-weight:800;font-size:48px;color:${INK};background:${CY}}
.tel{margin-top:12px;background:rgba(16,18,21,.78);padding:10px 18px;width:760px}
.tel b{display:block;font-family:Syne,sans-serif;font-weight:800;font-size:110px;line-height:1;color:${CY}}
.tel span{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:28px;color:#C9CED4}
.srcl{font-family:Inter,sans-serif;font-weight:600;font-size:24px;line-height:1.3;color:#fff;margin-top:14px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: INK, vig: 0.38, grain: 0.035, capfloor: 0.42, html, css,
  extraAt: ["s2:YECVT", "s2:D-CVT", "s3:depan", "s3:belakang", "s3:kerucut", "s3:Sabuk", "s4:renggang", "s4:rapat", "s4:satu", "s5:roller", "s5:mulus", "s6:motor", "s6:sensor", "s6:mode", "s6:tiga", "s7:gigi", "s7:dibagi", "s7:persen"],
  // Spec-sheet slide: the panel glides in from the right with a short skew, exits left.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:140,skewX:-8,opacity:0},{x:0,skewX:0,opacity:1,duration:.42,ease:'expo.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-120,skewX:6,opacity:0,duration:.24,ease:'power3.in'},b-.3)`,
  fxExtra: "",
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:60px;line-height:1.24;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 5px}`,
// Active word: orange text that tilts forward a touch, like a gear tooth engaging.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"#FF6B2C",scale:1.08,duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,x:30},{opacity:1,x:0,duration:.14,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Sliding Circle", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
