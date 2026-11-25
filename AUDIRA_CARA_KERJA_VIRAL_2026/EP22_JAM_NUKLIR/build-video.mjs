// EP22 JAM NUKLIR. GLASSCRAFT look: frosted dark-glass cards with rounded 30px corners, a 1px white hairline,
// soft inner highlight and backdrop blur, Manrope headings + JetBrains Mono telemetry, over a black studio
// with saturated light discs. Panels arrive like a glass pane sliding in on a gyroscopic tilt (rotateY + blur clearing,
// a light glint sweeping across) and leave by tilting away and frosting over.
// Run from this folder: node build-video.mjs
import { copyFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

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
    if (g.length <= 4 && (chars(g) <= 26 || g.length < 3 || (g.length === 3 && chars(g) <= 30))) { out.push(g); return; }
    const k = Math.max(2, Math.ceil(g.length / 4));
    const base = Math.floor(g.length / k), extra = g.length % k;
    let i = 0;
    for (let j = 0; j < k; j++) { const n = base + (j < extra ? 1 : 0); split(g.slice(i, i + n)); i += n; }
  };
  merged.forEach(split);
  return out;
}
function writeCaps(TL, css, wordTween, groupIn) {
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
  if (lone) console.log("WARNING lone caption words:", lone, groups.filter((g) => g.length < 2).map((g) => g[0].text).join(" "));
  return groups.length;
}

const TL = loadTimeline(".");
const at = anchors(TL);
const VIO = "#C9B6FF", GOLD = "#FFD27A", CY = "#7FE7FF", PINK = "#FF8FA8", GRN = "#86EFAC", INK = "#040406", MIST = "#D5DBE6";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 22</div>
  <div class="gc hero"><div class="h0">JAM<br><i>NUKLIR</i></div><div class="tl">yang berdetak: <b>inti atom</b></div></div>
  <div class="stamp" data-at="s1:tanpa" data-fx="stamp">TANPA REAKTOR</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">7 OKTOBER &middot; NATURE</div>
  <div class="gc"><b class="mid">TU WIEN + PTB</b><span>jam nuklir</span></div>
  <div class="gc row" data-at="s2:mengoreksi" data-fx="up"><b class="nb big2">&gt;<span class="ct" data-from="0" data-to="24" data-a="s2:mengoreksi" data-d="1.6">0</span> JAM</b><span>mengoreksi diri, pertama kalinya</span></div>
  <div class="pill" data-at="s2:Beijing" data-fx="pop">+ BEIJING, hari yang sama</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">AYUNAN + PENGHITUNG</div>
  <div class="lst">
    <div data-at="s3:Bandul" data-fx="left"><em class="gd">BANDUL</em><b>1&times;</b><span>per detik</span></div>
    <div data-at="s3:Kuarsa" data-fx="left"><em class="pk">KUARSA</em><b>32.768&times;</b></div>
    <div data-at="s3:atom" data-fx="left"><em class="cy">JAM ATOM</em><b class="sm">elektron cesium</b></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">ELEKTRON vs INTI</div>
  <div class="gc" data-at="s4:Inti" data-fx="up"><b class="big">10.000&times;</b><span>inti lebih kecil &amp; terlindung</span></div>
  <div class="duo">
    <div class="bad" data-at="s4:gamma" data-fx="up"><b>SINAR GAMMA</b><span>biasanya dibutuhkan</span></div>
    <div class="ok" data-at="s4:Thorium" data-fx="up"><b>THORIUM 229</b><span>cukup laser ultraviolet</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">KUNCI UMPAN BALIK</div>
  <div class="steps">
    <div data-at="s5:menyerap" data-fx="left"><i>1</i>Inti menyerap bila frekuensi pas</div>
    <div data-at="s5:Melenceng" data-fx="left"><i class="r">2</i>Melenceng &rarr; sensor membaca</div>
    <div data-at="s5:didorong" data-fx="left"><i class="g">3</i>Laser didorong kembali</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">DIRATA-RATA SEHARI</div>
  <div class="gc" data-at="s6:detik" data-fx="up"><b class="mid">1 detik meleset</b><span class="nb">dalam <strong><span class="ct" data-from="0" data-to="30" data-a="s6:juta" data-d="1.1">0</span> JUTA TAHUN</strong></span></div>
  <div class="stamp vi" data-at="s6:kestabilan" data-fx="stamp">KESTABILAN, BUKAN AKURASI</div>
  <div class="pill" data-at="s6:Beijing" data-fx="pop">BEIJING &plusmn;6&times; LEBIH STABIL</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">KENAPA HEBOH?</div>
  <div class="gc" data-at="s7:peka" data-fx="up"><b class="mid">BERPOTENSI LEBIH PEKA</b><span>pada perubahan konstanta alam</span></div>
  <div class="chips"><b data-at="s7:materi" data-fx="pop">MATERI GELAP: BELUM KETEMU</b><b class="gr" data-at="s7:navigasi" data-fx="pop">KELAK: NAVIGASI TANPA GPS?</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="gc hero"><div class="h1">DETIK MASA DEPAN</div><div class="tl">mungkin berdetak dari <b>inti</b></div></div>
  <div class="srcl" data-at="s8:inti" data-fx="fade">Sumber: Toscani De Col dkk. &amp; Huang dkk., Nature (7 Okt 2026); rilis PTB/TU Wien (EurekAlert, 6 Okt 2026); Morawetz dkk., Nature (Sep 2026); Tiedau dkk., PRL (2024). Kristal, laser &amp; inti 3D adalah ilustrasi.</div>
</div>`;

const css = `
.p{font-family:"Manrope",sans-serif}
.st{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:24px;letter-spacing:.14em;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);border-radius:40px;padding:8px 20px;margin-bottom:14px;backdrop-filter:blur(14px)}
.gc{position:relative;display:inline-block;max-width:820px;background:linear-gradient(150deg,rgba(40,44,54,.62),rgba(16,18,24,.55));border:1px solid rgba(255,255,255,.2);border-radius:30px;padding:16px 28px 18px;backdrop-filter:blur(22px);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 20px 50px rgba(0,0,0,.45);overflow:hidden}
.gc:after{content:"";position:absolute;inset:0;border-radius:30px;background:linear-gradient(115deg,rgba(255,255,255,.14),rgba(255,255,255,0) 40%);pointer-events:none}
.gc.row{display:block;width:fit-content;margin-top:12px}
.gc b{display:block;font-family:"Manrope",sans-serif;font-weight:800;color:#fff;line-height:1.02;letter-spacing:-.01em}
.gc b.big{font-size:112px;letter-spacing:-.03em}
.gc b.big2{font-size:92px;letter-spacing:-.02em;color:${CY}}
.gc b.big2 .ct{display:inline;font:inherit;color:inherit}
.gc b.mid{font-size:62px}
.gc span{display:block;font-family:"Manrope",sans-serif;font-weight:500;font-size:30px;color:${MIST};margin-top:6px}
.gc span strong{font-weight:800;color:${GOLD};font-size:44px}
.gc span strong .ct{display:inline;font:inherit;color:inherit}
.gc.hero{padding:18px 34px 22px}
.h0{font-family:"Manrope",sans-serif;font-weight:800;font-size:150px;line-height:.9;letter-spacing:-.045em;color:#fff}
.h0 i{font-style:normal;background:linear-gradient(90deg,#FFD27A,#E07FE8 55%,#7FE7FF);-webkit-background-clip:text;background-clip:text;color:transparent}
.h1{font-family:"Manrope",sans-serif;font-weight:800;font-size:86px;line-height:.95;letter-spacing:-.03em;color:#fff}
.tl{font-family:"Manrope",sans-serif;font-weight:500;font-size:38px;color:${MIST};margin-top:10px}
.tl b{font-weight:800;color:${GOLD}}
.stamp{display:block;width:fit-content;margin-top:14px;font-family:"Manrope",sans-serif;font-weight:800;font-size:46px;letter-spacing:.01em;color:#fff;background:rgba(244,63,94,.85);border-radius:40px;padding:8px 26px;box-shadow:0 0 34px rgba(244,63,94,.5)}
.stamp.vi{background:rgba(124,77,255,.82);box-shadow:0 0 34px rgba(124,77,255,.5);font-size:38px}
.pill{display:block;width:fit-content;margin-top:12px;font-family:"Manrope",sans-serif;font-weight:700;font-size:34px;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:40px;padding:8px 24px;backdrop-filter:blur(16px)}
.lst{display:flex;flex-direction:column;gap:10px;width:760px}
.lst>div{display:flex;align-items:baseline;gap:18px;background:linear-gradient(150deg,rgba(40,44,54,.6),rgba(16,18,24,.52));border:1px solid rgba(255,255,255,.18);border-radius:26px;padding:10px 24px;backdrop-filter:blur(20px)}
.lst em{font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:24px;letter-spacing:.1em;width:170px}
.lst em.gd{color:${GOLD}}.lst em.pk{color:#FFB3CF}.lst em.cy{color:${CY}}
.lst b{font-family:"Manrope",sans-serif;font-weight:800;font-size:58px;color:#fff;line-height:1.05}
.lst b.sm{font-size:40px}
.lst span{font-size:28px;color:${MIST}}
.duo{display:flex;gap:12px;width:820px;margin-top:12px}
.duo>div{flex:1;border-radius:26px;padding:12px 20px;background:rgba(18,20,26,.6);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(20px)}
.duo b{display:block;font-family:"Manrope",sans-serif;font-weight:800;font-size:44px;line-height:1.02;color:#fff}
.duo span{display:block;font-size:26px;color:${MIST};margin-top:4px}
.duo .bad{border-color:rgba(127,231,255,.45)}.duo .bad b{color:${CY}}
.duo .ok{border-color:rgba(201,182,255,.55)}.duo .ok b{color:${VIO}}
.steps{width:800px}
.steps>div{font-family:"Manrope",sans-serif;font-weight:700;font-size:36px;color:#fff;background:linear-gradient(150deg,rgba(40,44,54,.6),rgba(16,18,24,.52));border:1px solid rgba(255,255,255,.18);border-radius:26px;padding:10px 20px;margin-top:10px;backdrop-filter:blur(20px)}
.steps i{display:inline-block;font-style:normal;width:48px;height:48px;line-height:48px;text-align:center;background:${GOLD};color:${INK};border-radius:50%;margin-right:16px;font-weight:800;font-family:"JetBrains Mono",monospace;font-size:28px}
.steps i.r{background:${PINK}}.steps i.g{background:${GRN}}
.chips{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.chips b{display:block;width:fit-content;font-family:"Manrope",sans-serif;font-weight:800;font-size:36px;color:${VIO};background:rgba(18,20,26,.62);border:1px solid rgba(201,182,255,.5);border-radius:40px;padding:8px 24px;backdrop-filter:blur(16px)}
.chips b.gr{color:${GRN};border-color:rgba(134,239,172,.5)}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:21px;line-height:1.38;color:#E2E8F0;margin-top:14px;width:820px;background:rgba(18,20,26,.62);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:10px 16px}
#hud{position:absolute;right:56px;top:186px;z-index:11;text-align:right;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:20px;letter-spacing:.12em;color:rgba(255,255,255,.7)}
#hud b{display:block;color:${GOLD};font-weight:700}`;

const hudHtml = `<div id="hud"><b id="hudz">OSILATOR &middot; INTI</b><span>AUDIRA GLASSCRAFT</span></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "22", sig: "EP22_JAM_NUKLIR", chip: "ILUSTRASI", panelTop: 262,
  bg: INK, vig: 0.42, grain: 0.04, capfloor: 0.4, html: html + hudHtml, css,
  extraAt: ["s1:reaktor", "s1:inti", "s2:Oktober", "s2:Wien", "s2:mengoreksi", "s2:24", "s2:Beijing",
    "s3:Bandul", "s3:Kuarsa", "s3:atom", "s3:cesium",
    "s4:elektron", "s4:terganggu", "s4:Inti", "s4:terlindung", "s4:gamma", "s4:Thorium", "s4:ultraviolet",
    "s5:Triliunan", "s5:kristal", "s5:menyerap", "s5:pas", "s5:Melenceng", "s5:sensor", "s5:didorong", "s5:terkunci",
    "s6:detik", "s6:juta", "s6:kestabilan", "s6:optik", "s6:Beijing", "s6:stabil",
    "s7:heboh", "s7:peka", "s7:materi", "s7:belum", "s7:navigasi", "s8:Detik", "s8:inti"],
  // Glass pane: slides in on a gyroscopic tilt while its frost clears and a glint crosses it. Out: tilts away and frosts over.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,rotationY:24,transformPerspective:1400,filter:'blur(16px) brightness(1.6)'},{opacity:1,x:0,rotationY:0,filter:'blur(0px) brightness(1)',duration:.6,ease:'power3.out'},a-.18);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:60,rotationY:-18,transformPerspective:1400,filter:'blur(14px)',duration:.34,ease:'power2.in'},b-.36)`,
  hud: `(function(){const z=q('#hudz');const L=[[0,'INTI \\u00b7 TH-229'],[K.s3,'OSILATOR'],[K.s4,'ATOM \\u00b7 INTI'],[K.s5,'KUNCI LASER'],[K.s6,'KESTABILAN'],[K.s7,'MASA DEPAN'],[K.s8,'INTI \\u00b7 TH-229']];let last='';return (t)=>{let k=0;for(let i=0;i<L.length;i++)if(t>=L[i][0])k=i;if(L[k][1]!==last){z.textContent=L[k][1];last=L[k][1];}};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Manrope",sans-serif;font-weight:800;font-size:64px;line-height:1.18;color:#fff;letter-spacing:-.01em;text-shadow:0 3px 14px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .13em}`,
// Active word catches the light: warm gold with a prism glow and a small lift.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 14px rgba(0,0,0,.95)"},{color:"#FFD27A",y:-5,textShadow:"0 0 22px rgba(224,127,232,.75),0 3px 10px rgba(0,0,0,.9)",duration:.08,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 14px rgba(0,0,0,.95)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:16,filter:"blur(8px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Jam Nuklir", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
