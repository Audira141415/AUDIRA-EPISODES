// EP12 GO-AROUND. Storm-documentary look: slate panels with an amber runway-light rule, DM Serif Display headings.
// Panels arrive the way the wind blows (a wipe from the right with a skew) and leave blown off to the left.
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
    if (g.length <= 4 && (chars(g) <= 26 || g.length < 4)) { out.push(g); return; }
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
    html += `<div class="cap clip" id="g${i}" data-start="${st}" data-duration="${dur}" data-track-index="2"><div class="capin" id="gi${i}">${ws}</div></div>
`;
    js += groupIn(`gi${i}`, st);
  });
  writeFileSync("PROJECT/hyperframes/compositions/captions.html", `<template><style>${css}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
<script>const tl=gsap.timeline({paused:true});
${js}window.__timelines["captions"]=tl;</script></template>`);
  const lone = groups.filter((g) => g.length < 2).length;
  if (lone) console.log("WARNING lone caption words:", lone);
  return groups.length;
}

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB547", SLATE = "#141B24", MIST = "#D7DEE6", RED = "#FF5A4E", GRN = "#5CE39A", INK = "#0E141B";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 12</div>
  <div class="h0">BATAL<br><i>MENDARAT</i></div>
  <div class="tl" data-at="s1:keputusan" data-fx="up">&hellip;dan itu keputusan yang benar</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">SABTU, 31 OKTOBER</div>
  <div class="ro" data-at="s2:Sabtu" data-fx="left"><b>SQ213 &middot; A350</b><span>mendekati Perth</span></div>
  <div class="tel" data-at="s2:angin" data-fx="up"><b><b class="ct" data-from="0" data-to="32" data-a="s2:angin" data-d="1.2">0</b> km/jam</b><span>angin, hembusan <em data-at="s2:hembusan" data-fx="pop">43</em></span></div>
  <div class="ch" data-at="s2:Kru" data-fx="up">go-around &#8594; lalu mendarat normal</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">CARA 1 &middot; CRAB</div>
  <div class="ro bad" data-at="s3:hanyut" data-fx="left"><b>ANGIN MENYILANG</b><span>pesawat bisa hanyut</span></div>
  <div class="ro" data-at="s3:moncong" data-fx="left"><b>MONCONG KE ARAH ANGIN</b><span>menyerong seperti kepiting, jalur tetap lurus</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">CARA 2 &middot; SAYAP TURUN</div>
  <div class="ro" data-at="s4:rudder" data-fx="left"><b>LURUSKAN DENGAN RUDDER</b><span>sesaat sebelum menyentuh</span></div>
  <div class="ro" data-at="s4:sayap" data-fx="left"><b>SAYAP SISI ANGIN TURUN</b><span>supaya tidak hanyut</span></div>
  <div class="ro bad" data-at="s4:Terlalu" data-fx="left"><b>TERLALU MIRING</b><span>ujung sayap makin dekat ke tanah</span></div>
  <div class="ch" data-at="s4:memadukan" data-fx="up">pilot memadukan keduanya</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">GERBANG STABIL</div>
  <div class="du"><div data-at="s5:seribu" data-fx="pop"><b>1.000</b><span>kaki, dalam awan</span></div><div data-at="s5:lima" data-fx="pop"><b>500</b><span>kaki, saat cerah</span></div></div>
  <div class="ck">
    <div data-at="s5:Kecepatan" data-fx="left"><i>&#10003;</i>Kecepatan</div>
    <div data-at="s5:turun" data-fx="left"><i>&#10003;</i>Laju turun &le; 1.000 kaki/menit</div>
    <div data-at="s5:konfigurasi" data-fx="left"><i>&#10003;</i>Konfigurasi</div>
  </div>
  <div class="stp" data-at="s5:batalkan" data-fx="stamp">SATU MELESET: BATALKAN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">STUDI FSF</div>
  <div class="tel g" data-at="s6:tiga" data-fx="up"><b>&#8776;<b class="ct" data-from="0" data-to="3" data-a="s6:tiga" data-d=".8">0</b>%</b><span>pendekatan tidak stabil yang berakhir go-around</span></div>
  <div class="ro bad" data-at="s6:Padahal" data-fx="left"><b>FAKTOR RISIKO NOMOR SATU</b><span>tidak batal mendarat</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">GO-AROUND</div>
  <div class="steps">
    <div data-at="s7:TOGA" data-fx="left"><i>1</i>TOGA &middot; daya penuh</div>
    <div data-at="s7:hidung" data-fx="left"><i>2</i>Hidung naik</div>
    <div data-at="s7:flap" data-fx="left"><i>3</i>Flap dikurangi</div>
    <div data-at="s7:roda" data-fx="left"><i>4</i>Roda dilipat</div>
  </div>
  <div class="ro" data-at="s7:satu" data-fx="left"><b>1&ndash;3 per 1.000</b><span>pendekatan berakhir go-around</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Batal" data-fx="up">BUKAN GAGAL,<br><i>RENCANA CADANGAN</i></div>
  <div class="srcl" data-at="s8:rencana" data-fx="fade">Sumber: The West Australian, Straits Times, detikTravel (31 Okt&ndash;2 Nov 2026); METAR Perth via IEM; FAA Airplane Flying Handbook; FSF ALAR &amp; Go-Around Study (2017); NASA Ames. Pesawat 3D generik, bukan pesawat aslinya.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:24px;letter-spacing:.2em;color:${INK};background:${AMB};padding:6px 14px;margin-bottom:14px;box-shadow:0 0 22px rgba(255,181,71,.45)}
.h0{font-family:"DM Serif Display",serif;font-weight:400;font-size:132px;line-height:.95;color:#fff;text-shadow:0 6px 34px rgba(5,10,16,.85)}
.h0 i{font-style:italic;color:${AMB};text-shadow:0 4px 24px rgba(5,10,16,.95)}
.h2{font-family:"DM Serif Display",serif;font-size:100px;line-height:1;color:#fff;text-shadow:0 4px 26px rgba(5,10,16,.9)}
.h2 i{font-style:italic;color:${AMB}}
.tl{font-family:"DM Serif Display",serif;font-style:italic;font-size:48px;color:${MIST};margin-top:14px;text-shadow:0 2px 14px rgba(0,0,0,.85)}
.tel{background:linear-gradient(90deg,rgba(20,27,36,.86),rgba(20,27,36,.55));border-left:6px solid ${AMB};padding:12px 22px;width:760px;margin-top:10px}
.tel>b{display:block;font-family:"DM Serif Display",serif;font-weight:400;font-size:110px;line-height:1;color:${AMB}}
.tel>b b{font-weight:400}
.tel.g{border-left-color:${GRN}}.tel.g>b{color:${GRN}}
.tel span{display:block;font-family:Manrope,sans-serif;font-weight:600;font-size:30px;color:${MIST}}
.tel em{font-style:normal;font-weight:800;color:#fff;display:inline-block}
.ro{background:linear-gradient(90deg,rgba(20,27,36,.86),rgba(20,27,36,.5));border-left:5px solid ${AMB};padding:10px 18px;margin-top:10px;width:820px}
.ro.bad{border-left-color:${RED}}.ro.bad b{color:#FFD2CC}
.ro b{display:block;font-family:"DM Serif Display",serif;font-weight:400;font-size:50px;line-height:1.08;color:#fff}
.ro span{display:block;font-family:Manrope,sans-serif;font-weight:600;font-size:29px;line-height:1.2;color:${MIST}}
.du{display:flex;gap:12px;width:820px}.du>div{flex:1;background:rgba(20,27,36,.82);padding:10px 16px;border-top:5px solid ${GRN};text-align:center}
.du b{display:block;font-family:"DM Serif Display",serif;font-weight:400;font-size:92px;line-height:1;color:#fff}
.du span{display:block;font-family:Manrope,sans-serif;font-weight:600;font-size:27px;color:${MIST}}
.ck{margin-top:12px;width:820px}.ck>div,.steps>div{font-family:Manrope,sans-serif;font-weight:700;font-size:34px;color:#fff;background:rgba(20,27,36,.78);padding:8px 16px;margin-top:6px;text-shadow:0 1px 4px #000}
.ck i{font-style:normal;color:${GRN};margin-right:14px}
.steps{width:700px}.steps i{display:inline-block;font-style:normal;width:44px;height:44px;line-height:44px;text-align:center;background:${AMB};color:${INK};border-radius:50%;margin-right:16px;font-weight:800}
.stp{display:inline-block;margin-top:16px;font-family:Manrope,sans-serif;font-weight:800;font-size:40px;letter-spacing:.06em;color:#fff;background:${RED};padding:10px 22px;box-shadow:0 0 30px rgba(255,90,78,.6)}
.ch{font-family:Manrope,sans-serif;font-weight:700;font-size:34px;line-height:1.2;color:#fff;margin-top:12px;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.srcl{font-family:Manrope,sans-serif;font-weight:500;font-size:24px;line-height:1.3;color:#fff;margin-top:16px;width:820px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "12", bg: INK, vig: 0.4, grain: 0.05, capfloor: 0.45, html, css, panelTop: 262,
  sig: "EP12_GO_AROUND_ANGIN", chip: "ILUSTRASI, BUKAN REKAMAN ASLI",
  extraAt: ["s1:batal", "s1:keputusan", "s2:angin", "s2:Kru", "s3:hanyut", "s3:moncong", "s3:kepiting", "s4:rudder", "s4:sayap", "s4:Terlalu", "s4:memadukan",
    "s5:Hembusan", "s5:seribu", "s5:lima", "s5:Kecepatan", "s5:turun", "s5:konfigurasi", "s5:meleset", "s5:batalkan", "s6:tiga", "s6:Padahal",
    "s7:TOGA", "s7:hidung", "s7:flap", "s7:roda", "s7:satu", "s8:rencana", "s8:AUDIRA"],
  // In with the wind: a skewed wipe from the right edge. Out: blown off to the left.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0 0 0 100%)',x:60,skewX:-8,opacity:1},{clipPath:'inset(0 0 0 0%)',x:0,skewX:0,duration:.55,ease:'expo.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-160,skewX:10,opacity:0,filter:'blur(6px)',duration:.32,ease:'power2.in'},b-.34)`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:60px;line-height:1.22;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .14em}`,
// Active word lights up like a runway light: amber with a soft glow and a small lift.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 12px rgba(0,0,0,.95)"},{color:"#FFC56B",y:-4,textShadow:"0 0 18px rgba(255,181,71,.85),0 3px 10px rgba(0,0,0,.9)",duration:.07,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 12px rgba(0,0,0,.95)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,x:24},{opacity:1,x:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Go-Around", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
