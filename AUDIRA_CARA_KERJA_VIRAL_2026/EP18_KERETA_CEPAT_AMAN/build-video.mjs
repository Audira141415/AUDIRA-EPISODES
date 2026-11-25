// EP18 KERETA CEPAT AMAN. ISOCRAFT comic-plate look: warm paper cards with a heavy ink border and a hard offset shadow,
// yellow monospace tags, Space Grotesk headings. The news card (s2) drops the yellow for ink and grey (mourning tone).
// Panels unfold downward from their top edge like a comic panel being drawn, and leave sliding up-left along the iso axis.
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
    if (g.length < 4 || (g.length === 4 && chars(g) <= 26)) { out.push(g); return; }
    const k = Math.max(2, Math.ceil(g.length / 4), Math.ceil(chars(g) / 24));
    const kk = Math.max(2, Math.min(k, Math.floor(g.length / 2)));
    const base = Math.floor(g.length / kk), extra = g.length % kk;
    let i = 0;
    for (let j = 0; j < kk; j++) { const n = base + (j < extra ? 1 : 0); split(g.slice(i, i + n)); i += n; }
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
  if (lone) console.log("WARNING lone caption words:", lone);
  const long = groups.filter((g) => g.reduce((a, w) => a + w.text.length + 1, -1) > 28);
  if (long.length) console.log("NOTE long caption lines:", long.map((g) => g.map((w) => w.text).join(" ")).join(" | "));
  return groups.length;
}

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1C1E21", PAPER = "#FFFAF0", YEL = "#F4C430", MINT = "#7FB59A", SLATE = "#6B7A90", GREY = "#E3DED3";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 18</div>
  <div class="hero"><b>&plusmn; 5 km</b><span>untuk berhenti dari <em>300 km/jam</em></span></div>
  <div class="tl">Bagaimana kereta cepat dijaga aman?</div>
</div>
<div class="p mourn" data-in="s2" data-out="s3">
  <div class="st dk">KABAR DUKA &middot; SPANYOL</div>
  <div class="card" data-at="s2:Rabu" data-fx="up"><b class="mid">RABU, 28 OKTOBER</b><span>Dua kereta cepat bertabrakan dekat Toledo</span></div>
  <div class="row" data-at="s2:meninggal" data-fx="left"><b>69 orang meninggal</b></div>
  <div class="row" data-at="s2:Penyebabnya" data-fx="left"><b>Penyebab masih diselidiki</b><span>Spanyol minta bantuan ahli Uni Eropa</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">SINYAL TEPI REL TIDAK CUKUP</div>
  <div class="card" data-at="s3:jarak" data-fx="up"><b class="mid">JARAK BERHENTI &gt; PANDANGAN</b><span>masinis tak bisa melihat sejauh itu</span></div>
  <div class="row" data-at="s3:blok" data-fx="left"><b>1 BLOK = 1 KERETA</b>
    <div class="lg"><i style="background:${SLATE}"></i>TERISI<i style="background:${YEL}"></i>WASPADA<i style="background:${MINT}"></i>BEBAS</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">SINYAL PINDAH KE KABIN</div>
  <div class="row" data-at="s4:balise" data-fx="left"><b>BALISE &middot; SIRKUIT REL &middot; RADIO</b><span>mengirim data ke kereta</span></div>
  <div class="card" data-at="s4:izin" data-fx="up"><b class="mid">IZIN JALAN</b><span>sejauh mana boleh melaju + kecepatan target</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">KURVA PENGEREMAN</div>
  <div class="steps">
    <div data-at="s5:peringatan" data-fx="left"><i>1</i>Lewat batas &rarr; peringatan</div>
    <div data-at="s5:direm" data-fx="left"><i>2</i>Masih cepat &rarr; rem otomatis</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">JIKA SISTEMNYA MATI</div>
  <div class="row" data-at="s6:data" data-fx="left"><b>TANPA DATA &rarr; BERHENTI</b><span>desainnya memilih aman</span></div>
  <div class="row" data-at="s6:cadangan" data-fx="left"><b>MODE CADANGAN</b><span>jauh lebih lambat, aturan ketat</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">CONTOH: WHOOSH, INDONESIA</div>
  <div class="card" data-at="s7:memakai" data-fx="up"><b class="mid">CTCS-3 + RADIO GSM-R</b></div>
  <div class="chips"><b data-at="s7:angin" data-fx="pop">ANGIN</b><b data-at="s7:hujan" data-fx="pop">HUJAN</b><b data-at="s7:gempa" data-fx="pop">GEMPA</b><b data-at="s7:benda" data-fx="pop">BENDA DI REL</b></div>
  <div class="row" data-at="s7:rem" data-fx="left"><b>&rarr; REM OTOMATIS</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Keselamatan" data-fx="up">DIJAGA<br>BERLAPIS</div>
  <div class="row" data-at="s8:berlapis" data-fx="left"><b>SISTEM + ATURAN</b></div>
  <div class="mline" data-at="s8:Turut" data-fx="fade">Turut berduka untuk para korban di Spanyol.</div>
  <div class="srcl" data-at="s8:korban" data-fx="fade">Sumber: elDiario.es &amp; RTVE (laporan awal AITAT), BBC, CNN, Al Jazeera, NTVNews (28 Okt&ndash;7 Nov 2026); Wikipedia: LZB, ETCS, CTCS; AS &amp; 20minutos (data Renfe, jarak &plusmn;5 km); ANTARA, Satumedia (KCIC). Kereta 3D generik, bukan kereta aslinya.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:26px;letter-spacing:.06em;color:${INK};background:${YEL};padding:8px 16px;margin-bottom:16px;border:3px solid ${INK};box-shadow:5px 5px 0 ${INK}}
.st.dk{background:${INK};color:#F3EEE3;box-shadow:5px 5px 0 #8A8F96}
.hero{display:inline-flex;flex-direction:column;background:${PAPER};border:4px solid ${INK};box-shadow:9px 9px 0 ${INK};padding:6px 26px 16px;border-radius:4px}
.hero b{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:178px;line-height:1;letter-spacing:-.04em;color:${INK}}
.hero span{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:38px;color:#3A3F45}
.hero em{font-style:normal;font-weight:700;color:${INK};background:${YEL};padding:0 8px}
.tl{display:inline-block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:42px;line-height:1.15;color:${INK};margin-top:20px;background:${PAPER};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:8px 16px;max-width:820px}
.card{background:${PAPER};border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:12px 22px 14px;width:820px;border-radius:4px}
.card b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;color:${INK};line-height:1.05}
.card b.mid{font-size:58px;letter-spacing:-.01em}
.card span{display:block;font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:31px;color:#3A3F45;margin-top:6px}
.row{background:${PAPER};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};border-left:14px solid ${YEL};padding:10px 18px;margin-top:16px;width:760px;border-radius:3px}
.row b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:44px;line-height:1.08;color:${INK}}
.row span{display:block;font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:29px;line-height:1.2;color:#4A5058}
.mourn .card,.mourn .row{background:#F1EEE8;box-shadow:7px 7px 0 #5A5F66}
.mourn .row{border-left:14px solid #5A5F66}
.lg{display:flex;align-items:center;gap:10px;margin-top:8px;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:24px;color:${INK}}
.lg i{display:inline-block;width:46px;height:22px;border:3px solid ${INK};margin-left:10px}
.lg i:first-child{margin-left:0}
.steps{width:800px}
.steps>div{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:40px;color:${INK};background:${PAPER};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:10px 16px;margin-top:14px}
.steps i{display:inline-block;font-style:normal;width:50px;height:50px;line-height:46px;text-align:center;background:${YEL};border:3px solid ${INK};color:${INK};border-radius:50%;margin-right:16px;font-weight:700;box-sizing:border-box}
.chips{display:flex;flex-wrap:wrap;gap:12px;width:840px;margin-top:16px}
.chips b{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;color:${INK};background:${YEL};border:3px solid ${INK};box-shadow:4px 4px 0 ${INK};padding:6px 14px}
.h2{display:inline-block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:112px;line-height:.95;letter-spacing:-.03em;color:${INK};background:${PAPER};border:4px solid ${INK};box-shadow:9px 9px 0 ${INK};padding:10px 24px 14px}
.mline{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:34px;line-height:1.2;color:#F3EEE3;background:${INK};padding:10px 18px;margin-top:18px;width:760px}
.srcl{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:22px;line-height:1.3;color:${INK};margin-top:14px;width:800px;background:rgba(255,250,240,.9);border:2px solid ${INK};padding:8px 12px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "18", sig: "EP18_KERETA_CEPAT_AMAN", chip: "ILUSTRASI", panelTop: 262,
  bg: "#E6DFCF", vig: 0.16, grain: 0.04, capfloor: 0.22, html, css,
  extraAt: ["s1:berhenti", "s1:Bagaimana", "s1:terlihat", "s2:Toledo", "s2:Uni", "s3:sinyal", "s3:satu", "s4:kabin", "s4:Pemancar", "s4:sirkuit", "s4:radio", "s4:sejauh", "s4:kecepatan",
    "s5:Komputer", "s5:kurva", "s5:Masih", "s5:otomatis", "s6:mati", "s6:Desainnya", "s6:berhenti", "s6:Lalu", "s6:lambat", "s6:ketat",
    "s7:Whoosh", "s7:radio", "s7:Sensor", "s8:Keselamatan", "s8:Ikuti"],
  // Unfold: the panel is drawn downward from its top edge with a slight iso skew. Out: slides up-left along the iso axis.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{transformOrigin:'50% 0%',scaleY:.03,skewY:-7,opacity:1,y:-12},{scaleY:1,skewY:0,y:0,duration:.5,ease:'back.out(1.25)'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-80,y:-46,skewY:5,opacity:0,duration:.3,ease:'power2.in'},b-.32)`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:62px;line-height:1.25;color:#FFFAF0;text-shadow:-3px -3px 0 #1C1E21,3px -3px 0 #1C1E21,-3px 3px 0 #1C1E21,3px 3px 0 #1C1E21,0 7px 0 #1C1E21}
.w{display:inline-block;margin:0 .12em;padding:0 6px;border-radius:3px}`,
// Active word: a yellow comic chip with ink text and a hard offset shadow, tilted a hair.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFAF0",backgroundColor:"rgba(244,196,48,0)",rotation:0,boxShadow:"0 0 0 0 rgba(28,30,33,0)",textShadow:"-3px -3px 0 #1C1E21,3px -3px 0 #1C1E21,-3px 3px 0 #1C1E21,3px 3px 0 #1C1E21,0 7px 0 #1C1E21"},{color:"#1C1E21",backgroundColor:"rgba(244,196,48,1)",rotation:-2,boxShadow:"5px 5px 0 0 rgba(28,30,33,1)",textShadow:"0 0 0 rgba(0,0,0,0)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFAF0",backgroundColor:"rgba(244,196,48,0)",rotation:0,boxShadow:"0 0 0 0 rgba(28,30,33,0)",textShadow:"-3px -3px 0 #1C1E21,3px -3px 0 #1C1E21,-3px 3px 0 #1C1E21,3px 3px 0 #1C1E21,0 7px 0 #1C1E21",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:-14,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.18,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kereta Cepat Aman", "#E6DFCF");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
