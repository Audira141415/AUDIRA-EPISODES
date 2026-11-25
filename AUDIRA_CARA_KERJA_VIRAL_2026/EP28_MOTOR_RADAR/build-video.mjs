// EP28 MOTOR RADAR. TOONFORGE panels: manga action callouts. Slanted ink-black banners with white heavy italic type
// (Dela Gothic One), sky-cyan / sakura-pink accent slabs, hard offset ink shadows and halftone-free flat cel fills.
// Panels SNAP in like an anime smash-zoom (skewed smear from the left, overshoot settle) and leave on a diagonal
// slash wipe (clip-path cut + skew to the right).
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
const esc = (s) => s.replace(/&/g, "&amp;");
function writeCaps(TL, css, wordTween, groupIn) {
  const groups = capGroups(TL.words);
  let html = "", js = "", wid = 0;
  groups.forEach((g, i) => {
    const st = +(g[0].start - 0.04).toFixed(3);
    const nextS = i < groups.length - 1 ? groups[i + 1][0].start - 0.04 : g[g.length - 1].end + 0.35;
    const dur = +Math.max(nextS - st, 0.3).toFixed(3);
    const ws = g.map((w) => { const id = `w${wid++}`; js += wordTween(id, w); return `<span class="w" id="${id}">${esc(w.text)}</span>`; }).join(" ");
    html += `<div class="cap clip" id="g${i}" data-start="${st}" data-duration="${dur}" data-track-index="2"><div class="capin" id="gi${i}">${ws}</div></div>\n`;
    js += groupIn(`gi${i}`, st);
  });
  writeFileSync("PROJECT/hyperframes/compositions/captions.html", `<template><style>${css}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
<script>const tl=gsap.timeline({paused:true});
${js}window.__timelines["captions"]=tl;</script></template>`);
  const lone = groups.filter((g) => g.length < 2);
  if (lone.length) console.log("WARNING lone caption words:", lone.length, lone.map((g) => g[0].text).join(" "));
  return groups.length;
}

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#111116", CY = "#45B6FE", PK = "#FF7597", OR = "#FF9F1C", RD = "#E63946", YE = "#FFD23F";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">CARA KERJA VIRAL &middot; EP 28</div>
  <div class="h0"><span>MOTOR INI</span><span class="ln2">BISA MELIHAT</span></div>
  <div class="tag2"><i class="dc">RADAR DEPAN</i><i class="dp">RADAR BELAKANG</i></div>
  <div class="slam" data-at="s1:pertama" data-fx="slam">BUKAN YANG PERTAMA DI DUNIA</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick">3 NOVEMBER &middot; EICMA, MILAN</div>
  <div class="ban"><b>HONDA SENSING RIDE</b><span>diperkenalkan di pameran motor Milan</span></div>
  <div class="note pk" data-at="s2:Ducati" data-fx="whip"><b>DUCATI</b> sudah memakai radar sejak <b>2020</b></div>
  <div class="ban cy" data-at="s2:Africa" data-fx="whip"><b class="m">MOTOR HONDA PERTAMA DENGAN RADAR</b><span>Africa Twin Adventure Sports, versi DCT</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">MATA #1 &middot; WAKTU PANTUL</div>
  <div class="tag2" data-at="s3:Matanya" data-fx="whip"><i class="dc">RADAR DEPAN</i><i class="dp">RADAR BELAKANG</i></div>
  <div class="note" data-at="s3:menembakkan" data-fx="whip">gelombang radio <b>keluar</b> &rarr; tunggu <b>pantulan</b></div>
  <div class="ban yl" data-at="s3:sepertiga" data-fx="slam"><b class="m">&frac13; SEPERSEJUTA DETIK</b><span>waktu gema dari mobil 50 m di depan</span></div>
  <div class="eq" data-at="s3:situ" data-fx="pop">WAKTU = JARAK</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">MATA #2 &middot; FREKUENSI BERGESER</div>
  <div class="wv">
    <div class="wr"><em>DIKIRIM</em><svg viewBox="0 0 560 70"><path d="M0 35 Q 35 0 70 35 T 140 35 T 210 35 T 280 35 T 350 35 T 420 35 T 490 35 T 560 35" fill="none" stroke="${CY}" stroke-width="9"/></svg></div>
    <div class="wr" data-at="s4:terjepit" data-fx="whip"><em class="r">PANTULAN</em><svg viewBox="0 0 560 70"><path d="M0 35 Q 20 0 40 35 T 80 35 T 120 35 T 160 35 T 200 35 T 240 35 T 280 35 T 320 35 T 360 35 T 400 35 T 440 35 T 480 35 T 520 35 T 560 35" fill="none" stroke="${RD}" stroke-width="9"/></svg></div>
  </div>
  <div class="note pk" data-at="s4:sirene" data-fx="whip">seperti <b>sirene ambulans</b> yang mendekat</div>
  <div class="eq" data-at="s4:selisih" data-fx="pop">SELISIH = LAJU MENDEKAT</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">DATA RADAR DIPAKAI UNTUK&hellip;</div>
  <div class="li" data-at="s5:cruise" data-fx="whip"><i class="c">1</i><div><b>CRUISE CONTROL ADAPTIF</b><span>menjaga jarak</span></div></div>
  <div class="li" data-at="s5:spion" data-fx="whip"><i class="y">2</i><div><b>LAMPU SPION</b><span>kendaraan di titik buta</span></div></div>
  <div class="li" data-at="s5:mengedipkan" data-fx="whip"><i class="o">3</i><div><b>SEIN BERKEDIP</b><span>peringatkan pengemudi di belakang</span></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">KENAPA HARUS DCT?</div>
  <div class="li" data-at="s6:macet" data-fx="whip"><i class="c">1</i><div><b>STOP &amp; GO</b><span>melambat sampai berhenti</span></div></div>
  <div class="li" data-at="s6:Transmisi" data-fx="whip"><i class="p">2</i><div><b>KOPLING GANDA</b><span>lepas kopling sendiri, tanpa tuas</span></div></div>
  <div class="li" data-at="s6:jalan" data-fx="whip"><i class="y">3</i><div><b>JALAN LAGI?</b><span>pengendara yang memberi perintah</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">SAAT BAHAYA DI DEPAN</div>
  <div class="note" data-at="s7:layar" data-fx="whip"><b>LAYAR</b> memberi peringatan</div>
  <div class="note pk" data-at="s7:mengerem" data-fx="whip">kamu <b>mengerem</b>,<br>sistem <b>menambah tenaga rem</b></div>
  <div class="slam" data-at="s7:sendiri" data-fx="slam">MOTOR TIDAK MENGEREM DARURAT SENDIRI</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm"><span>KEMAMPUANNYA</span><span class="ln2">TERBATAS</span></div>
  <div class="ban" data-at="s8:menyetir" data-fx="whip"><b class="m">YANG MENYETIR TETAP KAMU</b><span>radar membantu melihat</span></div>
  <div class="srcl" data-at="s8:Ikuti" data-fx="fade">Sumber: Honda Global (3 Nov 2026), CNN Indonesia (5 Nov 2026), rilis Ducati 2020. Motor, pengendara &amp; mobil 3D adalah ilustrasi generik, bukan motor asli.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 0 rgba(17,17,22,.28))}
.kick{display:inline-block;font-family:"Dela Gothic One",sans-serif;font-size:30px;letter-spacing:.06em;color:#fff;background:${INK};padding:8px 22px 6px;transform:skewX(-14deg);box-shadow:8px 8px 0 ${CY};margin-bottom:18px}
.h0{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.h0 span{font-family:"Dela Gothic One",sans-serif;font-size:106px;line-height:1;color:#fff;background:${INK};padding:10px 30px 14px;transform:skewX(-12deg);box-shadow:12px 12px 0 ${PK}}
.h0 .ln2{background:${CY};color:${INK};box-shadow:12px 12px 0 ${INK};margin-left:40px}
.h0.sm span{font-size:72px}.h0.sm .ln2{background:${YE}}
.tag2{display:flex;gap:16px;margin-top:22px}
.tag2 i{font-style:normal;font-family:"Kanit",sans-serif;font-weight:800;font-size:34px;letter-spacing:.04em;padding:6px 18px;border:5px solid ${INK};transform:skewX(-12deg);box-shadow:6px 6px 0 ${INK}}
.tag2 .dc{background:${CY};color:${INK}}.tag2 .dp{background:${PK};color:#fff}
.slam{display:inline-block;margin-top:22px;font-family:"Dela Gothic One",sans-serif;font-size:54px;line-height:1.08;color:#fff;background:${RD};padding:12px 26px 14px;border:6px solid ${INK};transform:rotate(-2.5deg) skewX(-8deg);box-shadow:10px 10px 0 ${INK};max-width:860px}
.ban{position:relative;background:#fff;border:6px solid ${INK};box-shadow:10px 10px 0 ${INK};padding:12px 24px 14px;width:820px;margin-top:16px;transform:skewX(-6deg)}
.ban.cy{background:#D7F0FF}.ban.yl{background:${YE}}
.ban b{display:block;font-family:"Dela Gothic One",sans-serif;font-size:66px;line-height:1.02;color:${INK}}
.ban b.m{font-size:50px}
.ban span{display:block;font-family:"Kanit",sans-serif;font-weight:600;font-size:34px;line-height:1.2;color:#2B2D3A;margin-top:6px}
.note{display:inline-block;margin-top:16px;font-family:"Kanit",sans-serif;font-weight:600;font-size:40px;line-height:1.15;color:#fff;background:${INK};padding:10px 22px;transform:skewX(-10deg);box-shadow:8px 8px 0 ${CY};max-width:860px}
.note.pk{box-shadow:8px 8px 0 ${PK}}
.note b{font-weight:800;color:${YE}}
.eq{display:inline-block;margin-top:18px;font-family:"Dela Gothic One",sans-serif;font-size:52px;color:${INK};background:${CY};padding:8px 24px 10px;border:6px solid ${INK};box-shadow:8px 8px 0 ${INK};transform:skewX(-10deg)}
.wv{width:840px;background:#fff;border:6px solid ${INK};box-shadow:10px 10px 0 ${INK};padding:10px 20px;transform:skewX(-5deg)}
.wr{display:flex;align-items:center;gap:14px;margin:6px 0}
.wr em{font-style:normal;width:210px;font-family:"Kanit",sans-serif;font-weight:800;font-size:34px;color:${INK}}
.wr em.r{color:${RD}}
.wr svg{flex:1;height:70px}
.li{display:flex;align-items:center;gap:18px;width:840px;background:#fff;border:6px solid ${INK};box-shadow:9px 9px 0 ${INK};padding:10px 18px;margin-top:14px;transform:skewX(-6deg)}
.li>i{flex:none;font-style:normal;width:70px;height:70px;line-height:74px;text-align:center;font-family:"Dela Gothic One",sans-serif;font-size:44px;border:5px solid ${INK};color:${INK}}
.li>i.c{background:${CY}}.li>i.y{background:${YE}}.li>i.o{background:${OR}}.li>i.p{background:${PK};color:#fff}
.li b{display:block;font-family:"Dela Gothic One",sans-serif;font-size:42px;line-height:1.05;color:${INK}}
.li span{display:block;font-family:"Kanit",sans-serif;font-weight:600;font-size:32px;line-height:1.15;color:#2B2D3A}
.srcl{font-family:"Kanit",sans-serif;font-weight:500;font-size:25px;line-height:1.3;color:${INK};margin-top:22px;width:800px;background:#fff;border:4px solid ${INK};padding:8px 14px}
#chip{color:#fff!important;background:${INK};padding:4px 12px;opacity:.92!important;font-family:"Kanit",sans-serif!important;font-weight:700!important;font-size:22px!important;transform:skewX(-10deg)}
#hud{position:absolute;right:56px;top:180px;z-index:11;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#hud b{font-family:"Kanit",sans-serif;font-weight:800;font-size:26px;letter-spacing:.06em;padding:3px 12px;border:4px solid ${INK};transform:skewX(-10deg);box-shadow:4px 4px 0 ${INK};transition:none}
#hudf{background:${CY};color:${INK}}#hudb{background:${PK};color:#fff}`;

const hudHtml = `<div id="hud"><b id="hudf">&#9679; MATA DEPAN</b><b id="hudb">&#9679; MATA BELAKANG</b></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "28", sig: "EP28_MOTOR_RADAR", chip: "ILUSTRASI", panelTop: 262,
  bg: "#8CCAFF", vig: 0.22, grain: 0.04, capfloor: 0.34, html: html + hudHtml, css,
  extraAt: ["s1:melihat", "s1:macet", "s1:pertama", "s2:EICMA", "s2:Ducati", "s2:Africa",
    "s3:Matanya", "s3:menembakkan", "s3:lima", "s3:gema", "s3:sepertiga", "s3:situ",
    "s4:melambat", "s4:terjepit", "s4:sirene", "s4:selisih",
    "s5:cruise", "s5:Radar", "s5:spion", "s5:titik", "s5:mengedipkan", "s5:pengemudi",
    "s6:kenapa", "s6:macet", "s6:berhenti", "s6:Transmisi", "s6:melepas", "s6:tuas", "s6:jalan", "s6:perintah",
    "s7:bahaya", "s7:layar", "s7:mengerem", "s7:menambah", "s7:Tapi", "s7:sendiri",
    "s8:Kemampuannya", "s8:menyetir", "s8:Ikuti"],
  fxExtra: `whip:(e,t)=>tl.fromTo(e,{x:-140,skewX:-30,opacity:0},{x:0,skewX:0,opacity:1,duration:.26,ease:'expo.out'},t),
 slam:(e,t)=>tl.fromTo(e,{scale:2.2,rotation:-9,opacity:0},{scale:1,rotation:0,opacity:1,duration:.16,ease:'power4.in'},t),`,
  // Anime smash-zoom: the panel smears in from the left, skewed and oversized, then settles with a small overshoot.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-260,skewX:-28,scale:1.12},{opacity:1,x:0,skewX:0,scale:1,duration:.3,ease:'back.out(2.2)'},a-.1);}`,
  // Slash out: a diagonal clip-path cut sweeps across while the panel skews off to the right.
  panelOut: `(tl,p,b)=>tl.fromTo(p,{clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)'},{clipPath:'polygon(100% 0%,100% 0%,100% 100%,100% 100%)',x:180,skewX:22,opacity:0,duration:.26,ease:'power3.in'},b-.26)`,
  hud: `(function(){const hf=q('#hudf'),hb=q('#hudb');const sc=[K.s1,K.s2,K.s3,K.s4,K.s5,AT['s5:Radar'],K.s6,K.s7,K.s8];const st=[[1,1],[.35,.35],[1,.35],[1,.35],[1,.35],[.35,1],[1,.35],[1,.35],[1,1]];const blink=(a,b)=>{};return (t)=>{let k=0;for(let i=0;i<sc.length;i++)if(t>=sc[i]-.05)k=i;let f=st[k][0],b=st[k][1];if(t>=AT['s5:Radar']&&t<K.s6){b=(Math.floor(t*4)%2)?1:.55;}hf.style.opacity=f;hb.style.opacity=b;hf.parentNode.style.visibility=t>=K.s8-.1?'hidden':'visible';};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Kanit",sans-serif;font-weight:800;font-style:italic;font-size:72px;line-height:1.12;color:#fff;text-shadow:5px 6px 0 #111116,-3px -3px 0 #111116,3px -3px 0 #111116,-3px 3px 0 #111116,3px 3px 0 #111116,0 4px 0 #111116,0 -4px 0 #111116,4px 0 0 #111116,-4px 0 0 #111116}
.w{display:inline-block;margin:0 .14em}`,
// Active word: flashes sky cyan with an anime snap (skew + pop), then cools back to white.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1,skewX:0},{color:"#45B6FE",scale:1.13,skewX:-10,duration:.06,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,skewX:0,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,x:-40,skewX:-20},{opacity:1,x:0,skewX:0,duration:.18,ease:"expo.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Motor Radar", "#8CCAFF");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
