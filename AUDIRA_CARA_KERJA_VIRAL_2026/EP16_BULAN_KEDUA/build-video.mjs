// EP16 BULAN KEDUA. SCALEFORGE look: deep-space black and a white measuring studio, ruler-orange accent, graphite instrument panels,
// Archivo Black headlines over JetBrains Mono readouts, a live log gauge (10^x m) on the right edge.
// Panels unroll left to right like a measuring tape and leave by shrinking away (a zoom-out). Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
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

const TL = loadTimeline(".");
const at = anchors(TL);
const ACC = "#FF6B2C", INK = "#080B12", INKL = "#E8EEF6", COOL = "#3AA8FF", MUT = "#9AA6B6";

// zoom keys shared with mix.py
const ZOOM = JSON.parse(readFileSync("zoom.json", "utf8")).keys;
writeFileSync("PROJECT/hyperframes/assets/lib/zoomkeys.js", `export default ${JSON.stringify(ZOOM)};\n`);

const ticks = Array.from({ length: 14 }, (_, i) => `<i style="top:${((1 - i / 13) * 820).toFixed(1)}px"><em>${i}</em></i>`).join("");
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st"><u></u>CARA KERJA VIRAL // EP 16</div>
  <div class="card hero"><b>BULAN KEDUA</b><span>dimiliki Bumi sejak Mei</span><div class="rowi" data-at="s1:Tak" data-fx="left">baru ketahuan <em>Agustus</em></div></div>
</div>
<div class="p" data-in="s2" data-out="s2:Teleskop">
  <div class="st"><u></u>MINOR PLANET CENTER</div>
  <div class="card" data-at="s2:Minor" data-fx="up"><small>DIUMUMKAN 29 OKTOBER</small><b class="big">2026 QQ8</b></div>
</div>
<div class="p" data-in="s2:Teleskop" data-out="s2:Ukurannya">
  <div class="st"><u></u>PENEMUAN</div>
  <div class="card" data-at="s2:Teleskop" data-fx="up"><b class="mid">TELESKOP DI HUNGARIA</b><span>ditemukan malam 19 Agustus</span></div>
</div>
<div class="p" data-in="s2:Ukurannya" data-out="s3">
  <div class="st"><u></u>UKURAN</div>
  <div class="card" data-at="s2:satu" data-fx="up"><b class="big">1&ndash;2 m</b><span>setinggi manusia</span></div>
</div>
<div class="p" data-in="s3" data-out="s3:Jadi">
  <div class="st"><u></u>ORBIT MENGELILINGI MATAHARI</div>
  <div class="card" data-at="s3:Matahari" data-fx="up"><b class="big"><span class="ct" data-from="0" data-to="359" data-a="s3:Matahari" data-d="1.4">0</span> <small>HARI</small></b><span>nyaris kembar dengan Bumi</span></div>
</div>
<div class="p" data-in="s3:Jadi" data-out="s4">
  <div class="st"><u></u>BUKAN MENYAMBAR</div>
  <div class="card" data-at="s3:Jadi" data-fx="up"><b class="mid">MENDEKAT PELAN</b><span>dua pelari di lintasan sama</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st"><u></u>BOLA HILL</div>
  <div class="card" data-at="s4:berjari-jari" data-fx="up"><small>JARI-JARI</small><b class="big"><span class="ct" data-from="0" data-to="1.5" data-dec="1" data-a="s4:berjari-jari" data-d="1.2">0</span> <small>JUTA km</small></b></div>
  <div class="row" data-at="s4:dalamnya" data-fx="left"><b>DI DALAMNYA</b><span><em class="c">tarikan Bumi</em> &gt; <em>tarikan Matahari</em></span></div>
</div>
<div class="p" data-in="s5" data-out="s5:Agustus">
  <div class="st"><u></u>ENERGI TERHADAP BUMI</div>
  <div class="card meter" data-at="s5:Batu" data-fx="up"><div class="scale"><span>&minus;</span><i class="mid0"></i><span>+</span></div><div class="track"><i class="needle" data-at="s5:energinya" data-fx="needle"></i></div></div>
  <div class="row" data-at="s5:negatif" data-fx="left"><b>NEGATIF = TERTANGKAP</b><span>berputar-putar tak beraturan</span></div>
</div>
<div class="p" data-in="s5:Agustus" data-out="s6">
  <div class="st"><u></u>18 AGUSTUS // PALING DEKAT</div>
  <div class="card" data-at="s5:paling" data-fx="up"><b class="big"><span class="ct" data-from="0" data-to="537000" data-a="s5:paling" data-d="1.4">0</span> <small>km</small></b></div>
</div>
<div class="p" data-in="s6" data-out="s6:Pengiring">
  <div class="st"><u></u>BATU ATAU SAMPAH ROKET?</div>
  <div class="card test" data-at="s6:Cahaya" data-fx="up"><small>DORONGAN CAHAYA MATAHARI</small>
    <div class="bar"><em>BERONGGA</em><i class="b1" data-at="s6:berongga" data-fx="grow"></i></div>
    <div class="bar"><em>BATU INI</em><i class="b2" data-at="s6:kecil" data-fx="grow"></i></div></div>
  <div class="stamp" data-at="s6:padat" data-fx="stamp">BATU PADAT ALAMI</div>
</div>
<div class="p" data-in="s6:Pengiring" data-out="s7">
  <div class="st"><u></u>BEDA DENGAN KAMO'OALEWA</div>
  <div class="card" data-at="s6:Pengiring" data-fx="up"><b class="mid">HANYA SEIRAMA</b><span>tidak tertangkap Bumi</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st"><u></u>MATAHARI TERUS MENARIK</div>
  <div class="card" data-at="s7:Desember" data-fx="up"><small>SEKITAR</small><b class="big">DESEMBER</b><span>lepas dari Bumi</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="st"><u></u>BULAN KEDUA</div>
  <div class="card" data-at="s8:tamu" data-fx="up"><b class="big">TAMU</b><span>datang pelan, lalu pergi</span></div>
  <div class="srcl" data-at="s8:Bulan" data-fx="fade">Sumber: Minor Planet Center (MPEC 2026-U95, 29 Okt 2026), NASA/JPL Small-Body Database, detikInet (8 Nov 2026). Ilustrasi: ukuran Bumi, Bulan, dan Matahari diperbesar; jarak disesuaikan.</div>
</div>
<div id="gauge"><div class="gl"></div>${ticks}<div id="gdot"></div></div>
<div id="gread"><span>BINGKAI</span><b id="gval">10<sup>9</sup> m</b></div>`;

const css = `
.p{transform-origin:0% 0%}
.st{display:inline-flex;align-items:center;gap:12px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;letter-spacing:.14em;color:${ACC};background:rgba(8,11,18,.88);border:1px solid rgba(232,238,246,.16);border-radius:8px;padding:9px 16px;margin-bottom:12px}
.st u{display:block;width:12px;height:12px;border-radius:50%;background:${ACC};text-decoration:none}
.card{background:rgba(8,11,18,.88);border:1px solid rgba(232,238,246,.16);border-left:6px solid ${ACC};border-radius:10px;padding:16px 26px 18px;width:800px;box-shadow:0 18px 44px rgba(0,0,0,.35)}
.card b{display:block;font-family:"Archivo Black",sans-serif;font-weight:400;color:#fff;line-height:1.02;letter-spacing:-.01em}
.card b.big{font-size:118px}
.card b.mid{font-size:64px}
.card b small{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:42px;color:${ACC};letter-spacing:.02em}
.card small{display:block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:26px;letter-spacing:.12em;color:${MUT};margin-bottom:6px}
.card span{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:33px;color:#C9D2DE;margin-top:8px}
.card b .ct{display:inline;font:inherit;color:inherit;margin:0}
.hero b{font-size:112px;color:#fff}
.hero span{font-size:36px}
.rowi{margin-top:12px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:34px;color:#fff;letter-spacing:.02em}
.rowi em,.row em{font-style:normal;color:${ACC}}
.row em.c{color:${COOL}}
.row{background:rgba(8,11,18,.88);border:1px solid rgba(232,238,246,.14);border-radius:8px;padding:12px 20px;margin-top:12px;width:760px}
.row b{display:block;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:42px;line-height:1.1;color:#fff}
.row span{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:30px;line-height:1.25;color:#C9D2DE;margin-top:4px}
.meter .scale{display:flex;justify-content:space-between;align-items:center;font-family:"Archivo Black",sans-serif;font-size:64px;color:#fff;line-height:1}
.meter .scale span{display:inline;font-family:"Archivo Black",sans-serif;font-size:64px;color:#fff;margin:0}
.meter .scale span:first-child{color:${ACC}}
.meter .track{position:relative;height:40px;margin-top:10px;border-radius:20px;background:linear-gradient(90deg,${ACC},rgba(255,107,44,.15) 50%,rgba(58,168,255,.15) 50%,${COOL})}
.meter .needle{position:absolute;top:-10px;width:12px;height:60px;margin-left:-6px;border-radius:6px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.8)}
.test .bar{display:flex;align-items:center;gap:16px;margin-top:12px}
.test .bar em{font-style:normal;width:210px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:#fff}
.test .bar i{display:block;height:34px;border-radius:6px;transform-origin:0 50%}
.test .b1{width:500px;background:linear-gradient(90deg,#FFD27A,${ACC})}
.test .b2{width:56px;background:${ACC}}
.stamp{display:inline-block;margin-top:16px;font-family:"Archivo Black",sans-serif;font-size:50px;color:${INK};background:${ACC};padding:10px 24px;border-radius:6px;box-shadow:0 0 30px rgba(255,107,44,.55)}
.srcl{font-family:Inter,sans-serif;font-weight:500;font-size:23px;line-height:1.35;color:${INKL};margin-top:14px;width:790px;background:rgba(8,11,18,.82);padding:10px 14px;border-radius:8px}
#gauge{position:absolute;left:1008px;top:300px;width:60px;height:820px;z-index:10;pointer-events:none}
#gauge .gl{position:absolute;left:14px;top:0;width:3px;height:820px;background:rgba(232,238,246,.45);border-radius:2px}
#gauge i{position:absolute;left:8px;width:15px;height:2px;background:rgba(232,238,246,.7)}
#gauge i em{position:absolute;left:21px;top:-11px;font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:17px;color:rgba(232,238,246,.85);text-shadow:0 1px 4px rgba(0,0,0,.8)}
#gdot{position:absolute;left:3px;top:-12px;width:25px;height:25px;border-radius:50%;background:${ACC};box-shadow:0 0 16px rgba(255,107,44,.9)}
#gread{position:absolute;right:20px;top:1140px;z-index:10;font-family:"JetBrains Mono",monospace;font-weight:700;color:#fff;background:rgba(8,11,18,.82);border:1px solid rgba(232,238,246,.16);border-radius:8px;padding:6px 12px;text-align:right}
#gread span{display:block;font-size:16px;letter-spacing:.16em;color:${MUT}}
#gread b{display:block;font-size:30px}
#gread sup{font-size:.6em;color:${ACC}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const zoomAt = ZOOM.map((k) => k[0]).filter((s) => s.includes(":"));
const { AT, K } = writeWorld(TL, at, {
  ep: "16", sig: "EP16_BULAN_KEDUA", chip: "ILUSTRASI, SKALA DISESUAIKAN", panelTop: 262,
  bg: "#03050B", vig: 0.32, grain: 0.035, capfloor: 0.5, html, css,
  extraAt: [...new Set([...zoomAt, "s1:Agustus", "s2:QQ8", "s2:Teleskop", "s2:Hungaria", "s2:menemukannya", "s2:Agustus", "s2:Ukurannya", "s2:meter", "s2:satu", "s2:setinggi", "s2:manusia",
    "s3:Matahari", "s3:Bumi", "s3:mendekat", "s3:pelari", "s4:Hill", "s4:juta", "s4:tarikan", "s5:masuk", "s5:energinya", "s5:negatif", "s5:tertangkap", "s5:Agustus", "s5:paling",
    "s6:Astronom", "s6:sampah", "s6:roket", "s6:Cahaya", "s6:mendorong", "s6:berongga", "s6:Dorongan", "s6:kecil", "s6:padat", "s6:alami", "s6:Pengiring", "s6:seirama",
    "s7:Tapi", "s7:Matahari", "s7:Desember", "s7:lepas", "s7:sendirian", "s8:tamu", "s8:pergi", "s8:Ikuti"])],
  fxExtra: `needle:(e,t)=>{tl.fromTo(e,{left:'82%',opacity:1},{left:'82%',opacity:1,duration:.01},t-1.0);tl.to(e,{left:'14%',duration:1.5,ease:'power2.inOut'},t+.2);},`,
  // Measuring tape: the panel unrolls left to right behind an orange edge. Out: it shrinks away like the view zooming out.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0% 100% 0% 0%)',opacity:1,x:-28},{clipPath:'inset(0% 0% 0% 0%)',x:0,duration:.5,ease:'power3.out'},a-.16);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{scale:.84,y:-26,opacity:0,filter:'blur(5px)',duration:.32,ease:'power2.in'},b-.34)`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:60px;line-height:1.22;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .12em;padding:0 4px}`,
// Active word: ruler-orange with a measuring tick under it.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,107,44,0)"},{color:"#FF8A4C",boxShadow:"inset 0 -6px 0 0 #FF6B2C",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,107,44,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bulan Kedua", "#03050B");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
