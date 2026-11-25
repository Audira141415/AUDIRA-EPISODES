// EP19 TAKSI TERBANG. POLYVERSE look: pastel low-poly lake base, cream "paper-facet" cards with a teal mono tag and a coral facet corner.
// Panels unfold from their top-left corner like a low-poly facet opening, and fold away into the bottom-right corner.
// Run from this folder: node build-video.mjs
import { copyFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2A3342", CRM = "#FFF8EE", COR = "#FF7A6B", TEA = "#2BB5A6", BUT = "#F4C55A", RED = "#E8574A";

// Caption groups: phrases split at punctuation, at most 4 words and ~26 characters, balanced, never a lone word.
function capGroups(words) {
  const phrases = [];
  let cur = [];
  for (const w of words) {
    if (cur.length && cur[0].scene !== w.scene) { phrases.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;?!]$/.test(w.text)) { phrases.push(cur); cur = []; }
  }
  if (cur.length) phrases.push(cur);
  const merged = [];
  for (let i = 0; i < phrases.length; i++) {
    const ph = phrases[i], prev = merged[merged.length - 1];
    if (ph.length === 1 && prev && prev[0].scene === ph[0].scene && prev.length <= 3) { prev.push(...ph); continue; }
    if (ph.length === 1 && i + 1 < phrases.length && phrases[i + 1][0].scene === ph[0].scene) { phrases[i + 1] = [...ph, ...phrases[i + 1]]; continue; }
    if (ph.length === 1 && prev) { prev.push(...ph); continue; }
    merged.push([...ph]);
  }
  const chars = (g) => g.reduce((a, w) => a + w.text.length + 1, -1);
  const out = [];
  const split = (g) => {
    if (g.length <= 4 && (chars(g) <= 26 || g.length < 4)) { out.push(g); return; }
    const k = Math.max(2, Math.ceil(g.length / 4));
    const base = Math.floor(g.length / k), extra = g.length % k;
    let i = 0;
    for (let j = 0; j < k; j++) { const n = base + (j < extra ? 1 : 0); split(g.slice(i, i + n)); i += n; }
  };
  merged.forEach(split);
  return out;
}
function writeCaps(css, wordTween, groupIn) {
  const groups = capGroups(TL.words);
  let html = "", js = "", wid = 0;
  groups.forEach((g, i) => {
    const st = +(g[0].start - 0.04).toFixed(3);
    const nextS = i < groups.length - 1 ? groups[i + 1][0].start - 0.04 : g[g.length - 1].end + 0.35;
    const dur = +Math.max(nextS - st, 0.3).toFixed(3);
    const ws = g.map((w) => { const id = `w${wid++}`; js += wordTween(id, w); return `<span class="w" id="${id}">${w.text}</span>`; }).join(" ");
    html += `<div class="cap clip" id="g${i}" data-start="${st}" data-duration="${dur}" data-track-index="2"><div class="capin" id="gi${i}">${ws}</div></div>\n`;
    js += groupIn(`gi${i}`, st);
  });
  writeFileSync("PROJECT/hyperframes/compositions/captions.html", `<template><style>${css}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
<script>const tl=gsap.timeline({paused:true});
${js}window.__timelines["captions"]=tl;</script></template>`);
  const lone = groups.filter((g) => g.length < 2).length;
  if (lone) console.log("WARNING lone caption words:", lone);
  return groups.length;
}

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 19</div>
  <div class="hero"><i>lebih dari</i><b class="nb">133<small>km</small></b></div>
  <div class="chips"><span class="c1">5 PESAWAT</span><span class="c2" data-at="s1:Tanpa" data-fx="stamp">0 PILOT</span></div>
  <div class="tl">Cara kerja pesawat listrik <span>lepas landas tegak</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">31 OKT &amp; 1 NOV &middot; KUNSHAN, TIONGKOK</div>
  <div class="card" data-at="s2:menerbangkan" data-fx="up"><b>5 eVTOL</b><span>pesawat listrik lepas landas tegak</span></div>
  <div class="row" data-at="s2:Empat" data-fx="left"><b class="nb"><span class="ct" data-from="0" data-to="47" data-a="s2:Empat" data-d="1.3">0</span> MENIT</b><span>sepenuhnya otomatis</span></div>
  <div class="row" data-at="s2:Pesawatnya" data-fx="left"><b>KARGO &amp; PEMADAM</b><span>bukan taksi penumpang</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">2 SISTEM DORONG &middot; 1: ROTOR ANGKAT</div>
  <div class="row" data-at="s3:diputar" data-fx="left"><b>1 ROTOR = 1 MOTOR</b><span>masing-masing motor listrik sendiri</span></div>
  <div class="row" data-at="s3:Udara" data-fx="left"><b>NAIK TEGAK</b><span>udara ditiup ke bawah</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">2: BALING-BALING PENDORONG</div>
  <div class="row" data-at="s4:melaju" data-fx="left"><b>PESAWAT MELAJU</b><span>udara mengalir di atas sayap</span></div>
  <div class="row tea" data-at="s4:berhenti" data-fx="left"><b>ROTOR ANGKAT BERHENTI</b><span>sayap jauh lebih hemat</span></div>
</div>
<div class="p" data-in="s5" data-out="s5:Navigasi">
  <div class="st">OTAK: KOMPUTER KENDALI</div>
  <div class="row" data-at="s5:mengatur" data-fx="left"><b>ATUR PUTARAN TIAP MOTOR</b><span>terus-menerus, otomatis</span></div>
  <div class="row red" data-at="s5:mati" data-fx="left"><b>1 MOTOR MATI</b><span>yang lain menambah dorongan</span></div>
</div>
<div class="p" data-in="s5:Navigasi" data-out="s6">
  <div class="st">NAVIGASI FORMASI</div>
  <div class="card sm" data-at="s5:Navigasi" data-fx="up"><b>TIDAK DIPUBLIKASIKAN</b><span>penjelasan umum, bukan data AutoFlight</span></div>
  <div class="row" data-at="s5:satelit" data-fx="left"><b>SATELIT + RADIO</b><span>posisi dibagi antarpesawat</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">BATAS: BATERAI</div>
  <div class="card" data-at="s6:puluhan" data-fx="up"><b>PULUHAN &times;</b><span>energi per kilo: bahan bakar jet vs baterai</span></div>
  <div class="row" data-at="s6:Jangkauan" data-fx="left"><b class="nb">&plusmn; 200 km</b><span>jangkauan maksimal CarryAll</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">KUNSHAN &middot; RUTE ILUSTRASI</div>
  <div class="row" data-at="s7:Kunshan" data-fx="left"><b class="nb">&gt;133 km &middot; 47 MENIT</b><span>lima pesawat, satu formasi</span></div>
  <div class="row" data-at="s7:memimpin" data-fx="left"><b class="nb">1 &times; 5 TON</b><span>memimpin 4 pesawat &times; 2 ton</span></div>
  <div class="stamp" data-at="s7:Indonesia" data-fx="stamp"><b>VALIDASI INDONESIA</b><span>sertifikat tipe CarryAll &middot; 3 Juni</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="trio"><b data-at="s8:Naik" data-fx="pop"><small>naik seperti</small>HELIKOPTER</b><b data-at="s8:terbang" data-fx="pop"><small>terbang seperti</small>PESAWAT</b><b data-at="s8:komputer" data-fx="pop" class="cor"><small>dikemudikan</small>KOMPUTER</b></div>
  <div class="srcl" data-at="s8:Naik" data-fx="fade">Sumber: rilis AutoFlight (5 Nov 2026), Xinhua, AeroTime, sUAS News, China Daily. Pesawat 3D adalah ilustrasi generik, bukan model aslinya.</div>
</div>`;

const css = `
#gl{filter:contrast(1.07) saturate(1.12)}
.st{display:inline-block;font-family:"DM Mono",monospace;font-weight:500;font-size:25px;letter-spacing:.1em;color:#fff;background:${TEA};padding:8px 18px;border-radius:999px;margin-bottom:14px;box-shadow:0 6px 16px rgba(42,51,66,.18)}
.hero{display:flex;flex-direction:column;margin-top:2px}
.hero i{font-style:normal;font-family:Sora,sans-serif;font-weight:700;font-size:44px;color:${INK};background:${CRM};align-self:flex-start;padding:2px 16px;border-radius:14px 14px 0 0}
.hero b{font-family:Sora,sans-serif;font-weight:800;font-size:196px;line-height:.92;letter-spacing:-.05em;color:${INK};background:${CRM};align-self:flex-start;padding:4px 26px 14px 20px;border-radius:0 26px 26px 26px;box-shadow:0 18px 40px rgba(42,51,66,.2);position:relative}
.hero b small{font-size:70px;letter-spacing:-.01em;color:${COR};margin-left:14px}
.chips{display:flex;gap:14px;margin-top:14px}
.chips span{font-family:Sora,sans-serif;font-weight:800;font-size:46px;padding:6px 22px;border-radius:16px;color:#fff}
.chips .c1{background:${INK}}
.chips .c2{background:${COR};box-shadow:0 0 0 4px ${CRM}}
.tl{font-family:Sora,sans-serif;font-weight:600;font-size:36px;color:${INK};margin-top:16px;background:rgba(255,248,238,.9);display:inline-block;padding:8px 18px;border-radius:14px}
.tl span{font-weight:800;color:${TEA}}
.card{position:relative;background:${CRM};padding:16px 26px 18px;width:780px;border-radius:26px;box-shadow:0 18px 40px rgba(42,51,66,.2)}
.card:after,.row:after{content:"";position:absolute;right:0;top:0;width:54px;height:54px;background:${COR};clip-path:polygon(0 0,100% 0,100% 100%);border-top-right-radius:22px}
.card b{display:block;font-family:Sora,sans-serif;font-weight:800;font-size:92px;line-height:1;letter-spacing:-.03em;color:${INK}}
.card.sm b{font-size:54px;letter-spacing:-.01em}
.card span{display:block;font-family:Sora,sans-serif;font-weight:500;font-size:30px;color:#5d6676;margin-top:6px}
.row{position:relative;background:rgba(255,248,238,.95);border-left:10px solid ${BUT};padding:12px 70px 14px 20px;margin-top:12px;width:700px;border-radius:20px;box-shadow:0 12px 28px rgba(42,51,66,.16)}
.row:after{width:40px;height:40px;background:${BUT};border-top-right-radius:18px}
.row.tea{border-left-color:${TEA}}.row.tea:after{background:${TEA}}
.row.red{border-left-color:${RED}}.row.red:after{background:${RED}}
.row b{display:block;font-family:Sora,sans-serif;font-weight:800;font-size:48px;line-height:1.08;color:${INK}}
.row span{display:block;font-family:Sora,sans-serif;font-weight:500;font-size:29px;line-height:1.25;color:#5d6676}
.card b .ct,.row b .ct{display:inline;font:inherit;color:inherit;margin:0;padding:0;border:0}
.stamp{display:inline-block;margin-top:16px;background:${COR};color:#fff;padding:12px 24px 14px;border-radius:20px;border:4px dashed rgba(255,255,255,.85);box-shadow:0 14px 30px rgba(232,87,74,.35)}
.stamp b{display:block;font-family:Sora,sans-serif;font-weight:800;font-size:46px;letter-spacing:.02em;line-height:1.05}
.stamp span{display:block;font-family:"DM Mono",monospace;font-weight:500;font-size:27px;margin-top:4px}
.trio{display:flex;flex-direction:column;gap:12px}
.trio b{display:inline-block;align-self:flex-start;font-family:Sora,sans-serif;font-weight:800;font-size:96px;line-height:1;letter-spacing:-.03em;color:${INK};background:${CRM};padding:10px 26px 14px;border-radius:24px;box-shadow:0 14px 30px rgba(42,51,66,.18)}
.trio b small{display:block;font-size:30px;font-weight:600;letter-spacing:0;color:#5d6676;margin-bottom:4px}
.trio b.cor{background:${COR};color:#fff}.trio b.cor small{color:#ffe9e4}
.srcl{font-family:Sora,sans-serif;font-weight:500;font-size:23px;line-height:1.35;color:${INK};margin-top:18px;width:780px;background:rgba(255,248,238,.88);padding:10px 16px;border-radius:14px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const { AT, K } = writeWorld(TL, at, {
  ep: "19", sig: "EP19_TAKSI_TERBANG", chip: "ILUSTRASI", panelTop: 262,
  bg: "#BFDDEB", vig: 0.2, grain: 0.03, capfloor: 0.36, html, css,
  extraAt: ["s1:pilot", "s2:menerbangkan", "s2:eVTOL", "s2:otomatis", "s2:bukan", "s3:Kuncinya", "s3:rotor", "s3:naik", "s4:Kedua", "s4:pendorong", "s4:udara", "s4:mengangkat", "s4:Begitu", "s4:hemat",
    "s5:Otaknya", "s5:menambah", "s5:radio", "s6:Kenapa", "s6:Baterai", "s6:kilo", "s6:energi", "s6:dua", "s7:empat", "s7:CarryAll", "s7:Indonesia", "s8:terbang", "s8:komputer"],
  // Facet unfold: the card opens from a small corner triangle to the full shape; leaves by folding into the opposite corner.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'polygon(0% 0%, 16% 0%, 0% 20%, 0% 20%)',opacity:1,y:16,rotation:-1.5},{clipPath:'${FULL}',y:0,rotation:0,duration:.55,ease:'expo.out'},a-.16);tl.set(p,{clipPath:'none'},a+.42);}`,
  panelOut: `(tl,p,b)=>{tl.set(p,{clipPath:'${FULL}'},b-.36);tl.to(p,{clipPath:'polygon(100% 100%, 100% 100%, 100% 82%, 84% 100%)',y:-8,rotation:1.2,duration:.32,ease:'power2.in'},b-.35);}`,
});
const n = writeCaps(`#root{position:absolute;inset:0}
.cap{position:absolute;left:64px;right:116px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Sora,sans-serif;font-weight:800;font-size:58px;line-height:1.24;color:#fff;text-shadow:0 3px 12px rgba(30,40,60,.9),0 0 3px rgba(20,25,40,.9)}
.w{display:inline-block;margin:0 .14em;padding:0 6px;border-radius:12px}`,
// Active word: a butter-yellow facet pill with ink text, lifted a touch.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(244,197,90,0)",y:0,textShadow:"0 3px 12px rgba(30,40,60,.9)"},{color:"#2A3342",backgroundColor:"rgba(244,197,90,1)",y:-4,textShadow:"0 0 0 rgba(0,0,0,0)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(244,197,90,0)",y:0,textShadow:"0 3px 12px rgba(30,40,60,.9)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:18,scale:.96},{opacity:1,y:0,scale:1,duration:.18,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Taksi Terbang", "#BFDDEB");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
