// EP20 METANOL. NANOFORGE look: microscope-readout panels (deep navy glass, cyan hairline, corner ticks, JetBrains Mono labels,
// Space Grotesk headings) over a fluorescent molecular world. Panels arrive like a microscope racking into focus
// (blur + slight zoom settling, with a scan line) and leave by dissolving out of focus.
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
const CY = "#00F5D4", BL = "#38BDF8", RED = "#F43F5E", GOLD = "#F59E0B", GRN = "#4ADE80", INK = "#02050F", MIST = "#C7D2FE";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 20</div>
  <div class="h0">MINUM<br><i>ALKOHOL</i></div>
  <div class="tl"><b class="bl">+ BENSIN</b> di tangki yang sama</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">3 NOVEMBER &middot; TIONGKOK</div>
  <div class="card"><b class="mid">XINGYAO 6 EF</b><span>diluncurkan Geely</span></div>
  <div class="chips"><b data-at="s2:listrik" data-fx="pop">LISTRIK</b><b class="bl" data-at="s2:metanol" data-fx="pop">METANOL</b><b class="gd" data-at="s2:bensin" data-fx="pop">BENSIN</b><b class="mx" data-at="s2:campurannya" data-fx="pop">CAMPURAN</b></div>
  <div class="stamp" data-at="s2:pertama" data-fx="stamp">BUKAN YANG PERTAMA</div>
  <div class="ro" data-at="s2:Indy" data-fx="left"><b>INDY 500</b><span>mobil balap pakai metanol sampai 2006</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">MOLEKUL METANOL</div>
  <div class="card"><b class="big">CH<sub>3</sub>OH</b><span>alkohol, cair seperti bensin</span></div>
  <div class="leg">
    <div data-at="s3:karbon" data-fx="left"><i class="dc"></i><b>1</b> karbon</div>
    <div data-at="s3:oksigen" data-fx="left"><i class="do"></i><b>1</b> oksigen</div>
    <div data-at="s3:hidrogen" data-fx="left"><i class="dh"></i><b>4</b> hidrogen</div>
  </div>
  <div class="ro" data-at="s3:Sensor" data-fx="left"><b>SENSOR &rarr; KOMPUTER</b><span>baca kadar, atur semprotan &amp; busi</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">ENERGI PER LITER</div>
  <div class="card" data-at="s4:separuh" data-fx="up"><b class="big">&frac12;</b><span>energi metanol dibanding bensin</span></div>
  <div class="inj" data-at="s4:injektor" data-fx="up">
    <div class="ir"><em>BENSIN</em><div class="bar"><i class="ib" data-at="s4:injektor" data-fx="grow"></i></div></div>
    <div class="ir"><em>METANOL</em><div class="bar"><i class="im" data-at="s4:dua" data-fx="grow"></i></div><strong>2&times;</strong></div>
    <span>injektor menyemprot dua kali lebih lama</span>
  </div>
  <div class="ro" data-at="s4:Injeksi" data-fx="left"><b>INJEKSI LANGSUNG</b><span>diklaim memudahkan start di cuaca beku</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">KENAPA TETAP EFISIEN?</div>
  <div class="card" data-at="s5:Oktannya" data-fx="up"><b class="big">OKTAN &plusmn;109</b><span>tahan ngelitik</span></div>
  <div class="steps">
    <div data-at="s5:piston" data-fx="left"><i>1</i>Piston memampatkan lebih keras</div>
    <div data-at="s5:menguap" data-fx="left"><i class="c">2</i>Menguap &rarr; silinder dingin</div>
    <div data-at="s5:Busi" data-fx="left"><i class="h">3</i>Busi &rarr; CO<sub>2</sub> + air</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">MUSUH MATERIAL</div>
  <div class="ro bad" data-at="s6:menyerang" data-fx="left"><b>ALUMINIUM &times;</b><span>diserang metanol</span></div>
  <div class="ro bad" data-at="s6:karet" data-fx="left"><b>KARET SEAL &times;</b><span>membengkak</span></div>
  <div class="ro ok" data-at="s6:baja" data-fx="left"><b>BAJA TAHAN KARAT &check;</b><span>+ seal khusus</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">HIJAU? BELUM TENTU</div>
  <div class="du">
    <div class="g" data-at="s7:batu" data-fx="up"><b>BATU BARA</b><span>kebanyakan metanol Tiongkok</span></div>
    <div class="gr" data-at="s7:tangkapan" data-fx="up"><b>CO<sub>2</sub> + H<sub>2</sub></b><span>baru disebut hijau</span></div>
  </div>
  <div class="ro id" data-at="s7:Indonesia" data-fx="left"><b class="nb"><span class="ct" data-from="0" data-to="1.4" data-dec="1" data-a="s7:Indonesia" data-d="1.2">0</span> JUTA TON</b><span>impor metanol Indonesia setahun, terutama untuk biodiesel</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="trio"><b data-at="s8:Satu" data-fx="pop">1 TANGKI</b><b data-at="s8:dua" data-fx="pop" class="bl">2 CAIRAN</b><b data-at="s8:mesin" data-fx="pop" class="cy">1 MESIN</b></div>
  <div class="srcl" data-at="s8:kimia" data-fx="fade">Sumber: Geely via GlobeNewswire, CnEVPost, Gasgoo, CarExpert (3&ndash;6 Nov 2026); Verhelst dkk., Prog. Energy Combust. Sci. (2019); Antara (3 Apr 2026). Mobil, mesin &amp; molekul 3D adalah ilustrasi generik.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 30px rgba(0,0,0,.55))}
.st{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;letter-spacing:.16em;color:${CY};background:rgba(2,5,15,.82);padding:7px 14px;margin-bottom:14px;border:1px solid rgba(0,245,212,.55);box-shadow:0 0 18px rgba(0,245,212,.25)}
.h0{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:150px;line-height:.9;letter-spacing:-.03em;color:#fff;text-shadow:0 0 30px rgba(56,189,248,.45),0 6px 28px rgba(0,0,0,.9)}
.h0 i{font-style:normal;color:${CY};text-shadow:0 0 34px rgba(0,245,212,.6),0 6px 28px rgba(0,0,0,.9)}
.tl{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:44px;color:#fff;margin-top:16px;background:rgba(2,5,15,.7);display:inline-block;padding:6px 16px;border-left:4px solid ${GOLD}}
.tl b{font-weight:700}
.tl b.bl,.chips b.gd{color:${GOLD}}
.card{position:relative;background:linear-gradient(135deg,rgba(4,13,33,.86),rgba(4,13,33,.62));border:1px solid rgba(0,245,212,.45);padding:12px 22px 14px;width:760px;box-shadow:inset 0 0 30px rgba(0,245,212,.08)}
.card:before,.card:after{content:"";position:absolute;width:18px;height:18px;border:3px solid ${CY}}
.card:before{left:-3px;top:-3px;border-right:0;border-bottom:0}
.card:after{right:-3px;bottom:-3px;border-left:0;border-top:0}
.card b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;color:#fff;line-height:1}
.card b.big{font-size:118px;letter-spacing:-.02em;color:#fff;text-shadow:0 0 26px rgba(0,245,212,.45)}
.card b.mid{font-size:76px;letter-spacing:-.01em}
.card sub,.steps sub,.du sub{font-size:.55em;vertical-align:-.12em}
.card span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:27px;color:${MIST};margin-top:8px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;width:800px}
.chips b{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:31px;letter-spacing:.06em;color:${CY};background:rgba(2,5,15,.82);border:1px solid currentColor;padding:7px 14px}
.chips b.bl{color:${BL}}.chips b.mx{color:#fff;background:linear-gradient(90deg,rgba(56,189,248,.45),rgba(245,158,11,.45))}
.stamp{display:inline-block;margin-top:16px;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:50px;letter-spacing:.02em;color:#fff;background:${RED};padding:8px 22px;box-shadow:0 0 30px rgba(244,63,94,.55)}
.ro{background:linear-gradient(90deg,rgba(4,13,33,.88),rgba(4,13,33,.55));border-left:5px solid ${CY};padding:10px 18px;margin-top:12px;width:780px}
.ro b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:48px;line-height:1.08;color:#fff}
.ro span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:26px;line-height:1.25;color:${MIST}}
.ro.bad{border-left-color:${RED}}.ro.bad b{color:#FFC9D2}
.ro.ok{border-left-color:${GRN}}.ro.ok b{color:#BBF7D0}
.ro.id{border-left-color:${GOLD}}.ro.id b{color:#FDE68A;font-size:64px}
.ro b .ct{display:inline;font:inherit;color:inherit}
.leg{display:flex;gap:10px;margin-top:12px;width:800px}
.leg>div{flex:1;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:27px;color:${MIST};background:rgba(2,5,15,.8);padding:10px 12px;border-top:2px solid rgba(255,255,255,.2);white-space:nowrap}
.leg b{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:40px;color:#fff;margin-right:6px}
.leg i{display:inline-block;width:26px;height:26px;border-radius:50%;margin-right:10px;vertical-align:-3px;box-shadow:inset -4px -5px 8px rgba(0,0,0,.45),inset 3px 3px 6px rgba(255,255,255,.35)}
.dc{background:#3a404c}.do{background:${RED}}.dh{background:#f1f5f9}
.inj{background:rgba(4,13,33,.84);border:1px solid rgba(56,189,248,.4);padding:12px 18px;margin-top:12px;width:760px}
.ir{display:flex;align-items:center;gap:14px;margin:6px 0}
.ir em{font-style:normal;width:150px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;color:${MIST}}
.bar{flex:1;height:26px;background:rgba(255,255,255,.06);position:relative}
.bar i{position:absolute;left:0;top:0;bottom:0;transform-origin:0 50%}
.ib{width:42%;background:linear-gradient(90deg,${GOLD},#FCD34D);box-shadow:0 0 14px rgba(245,158,11,.6)}
.im{width:84%;background:linear-gradient(90deg,#0EA5E9,${CY});box-shadow:0 0 14px rgba(0,245,212,.6)}
.ir strong{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:40px;color:${CY};width:60px}
.inj span{display:block;font-family:"JetBrains Mono",monospace;font-size:24px;color:${MIST};margin-top:4px}
.steps{width:780px;margin-top:6px}
.steps>div{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:36px;color:#fff;background:rgba(2,5,15,.8);padding:8px 16px;margin-top:8px;border-left:2px solid rgba(255,255,255,.18)}
.steps i{display:inline-block;font-style:normal;width:46px;height:46px;line-height:46px;text-align:center;background:${CY};color:${INK};border-radius:50%;margin-right:16px;font-weight:700;font-family:"JetBrains Mono",monospace}
.steps i.c{background:${BL}}.steps i.h{background:${GOLD}}
.du{display:flex;gap:12px;width:800px}
.du>div{flex:1;background:rgba(4,13,33,.86);padding:12px 16px;border-top:5px solid #9CA3AF}
.du>div.gr{border-top-color:${GRN}}
.du b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:52px;line-height:1;color:#E5E7EB}
.du .gr b{color:#BBF7D0}
.du span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:24px;color:${MIST};margin-top:6px}
.trio{display:flex;flex-direction:column;gap:8px}
.trio b{display:inline-block;align-self:flex-start;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:100px;line-height:1;letter-spacing:-.02em;color:#fff;background:rgba(2,5,15,.78);padding:6px 22px 10px;border-left:6px solid ${GOLD}}
.trio b.bl{border-left-color:${BL}}.trio b.cy{border-left-color:${CY};color:${CY}}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:22px;line-height:1.35;color:#E2E8F0;margin-top:16px;width:800px;background:rgba(2,5,15,.75);padding:8px 12px}
#hud{position:absolute;right:56px;top:186px;z-index:11;text-align:right;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:21px;letter-spacing:.12em;color:rgba(255,255,255,.7)}
#hud b{display:block;color:${CY};font-weight:700}
#hud .sb{display:inline-block;width:90px;height:3px;background:#fff;margin-top:8px;opacity:.75}`;

const hudHtml = `<div id="hud"><b id="hudz">SKALA &middot; MOBIL</b><span>AUDIRA NANOFORGE</span><br><i class="sb" id="hudsb"></i></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "20", sig: "EP20_MOBIL_METANOL", chip: "ILUSTRASI", panelTop: 262,
  bg: INK, vig: 0.5, grain: 0.05, capfloor: 0.45, html: html + hudHtml, css,
  extraAt: ["s1:minum", "s1:tangki", "s2:Geely", "s2:listrik", "s2:metanol", "s2:bensin", "s2:campurannya", "s2:pertama", "s2:Indy",
    "s3:alkohol", "s3:karbon", "s3:oksigen", "s3:hidrogen", "s3:Cair", "s3:bercampur", "s3:Sensor", "s3:komputer",
    "s4:separuh", "s4:injektor", "s4:dua", "s4:Injeksi", "s4:beku",
    "s5:Oktannya", "s5:piston", "s5:menguap", "s5:mendinginkan", "s5:Busi", "s5:karbon", "s5:air",
    "s6:menyerang", "s6:karet", "s6:membengkak", "s6:baja", "s6:khusus",
    "s7:Kebanyakan", "s7:batu", "s7:Baru", "s7:tangkapan", "s7:hidrogen", "s7:Indonesia", "s7:biodiesel",
    "s8:Satu", "s8:dua", "s8:mesin", "s8:kimia"],
  // Microscope focus rack: the panel settles from a soft, slightly zoomed blur while a scan line sweeps it in. Out: drifts out of focus.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:1.06,filter:'blur(14px)',clipPath:'inset(0% 0% 100% 0%)'},{opacity:1,scale:1,filter:'blur(0px)',clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power3.out'},a-.16);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,scale:.95,y:-24,filter:'blur(12px)',duration:.32,ease:'power2.in'},b-.34)`,
  hud: `(function(){const z=q('#hudz'),sb=q('#hudsb');const L=[[0,'SKALA \\u00b7 MOBIL',90],[K.s3,'SKALA \\u00b7 MOLEKUL',30],[K.s4,'SKALA \\u00b7 SILINDER',60],[K.s6,'SKALA \\u00b7 MATERIAL',45],[K.s7,'SKALA \\u00b7 PABRIK',120],[K.s8,'SKALA \\u00b7 MOBIL',90]];let last='';return (t)=>{let k=0;for(let i=0;i<L.length;i++)if(t>=L[i][0])k=i;if(L[k][1]!==last){z.textContent=L[k][1];sb.style.width=L[k][2]+'px';last=L[k][1];}};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:62px;line-height:1.2;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .14em}`,
// Active word fluoresces: cyan with a bioluminescent glow and a small micro-bounce.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 12px rgba(0,0,0,.95)"},{color:"#7FFFEA",scale:1.08,textShadow:"0 0 20px rgba(0,245,212,.9),0 3px 10px rgba(0,0,0,.9)",duration:.07,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 12px rgba(0,0,0,.95)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14,filter:"blur(6px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Mobil Metanol", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
