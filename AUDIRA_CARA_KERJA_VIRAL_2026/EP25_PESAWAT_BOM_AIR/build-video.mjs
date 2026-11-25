// EP25 PESAWAT BOM AIR. COMICFORGE panels: newsprint caption boxes with heavy black ink borders and hard offset shadows,
// Bangers lettering, Oswald labels, CMYK accents, halftone dot fills. Panels SLAM in like a comic panel being stamped
// on the page (oversize + tilt, diagonal wipe, overshoot settle) and leave by a page-turn (rotateY away).
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
const INK = "#121014", PAPER = "#FFF6E0", CY = "#00A3E0", MG = "#E5007D", YE = "#FFE100", RD = "#ED1C24";
// counters end exactly on the number's word (style memory: lock counter end values to the word anchor)
const dd = (a, b) => Math.max(0.4, at(b) - at(a)).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">CARA KERJA VIRAL &middot; EP 25</div>
  <div class="h0"><span>15 TON AIR</span><span class="ln2">JATUH&hellip;</span></div>
  <div class="box hb"><b>&hellip;pesawatnya malah <em data-at="s1:melompat" data-fx="stamp">MELOMPAT!</em></b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick">6 NOVEMBER &middot; KALIMANTAN TIMUR</div>
  <div class="box"><b class="l">MAKROMAN, SAMARINDA</b><span>air dijatuhkan ke titik api, hingga pukul 15.00</span></div>
  <div class="row"><b class="dot" data-at="s2:tiga" data-fx="pop">1</b><b class="dot" data-at="s2:kali" data-fx="pop">2</b><b class="dot" data-at="s2:menjatuhkan" data-fx="pop">3</b><i data-at="s2:menjatuhkan" data-fx="left">KALI JATUHAN AIR</i></div>
  <div class="box cy" data-at="s2:Hercules" data-fx="left"><b class="l">HERCULES C-130 SIPIL</b><span>milik pemadam New South Wales, Australia</span></div>
  <div class="stamp" data-at="s2:militer" data-fx="stamp">BUKAN PESAWAT MILITER</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">DI BALIKPAPAN</div>
  <div class="stamp rd" data-at="s3:disendok" data-fx="stamp">TIDAK DISENDOK DARI SUNGAI</div>
  <div class="box" data-at="s3:selang" data-fx="up"><b class="big nb"><span class="ct" data-from="0" data-to="15000" data-a="s3:mengisi" data-d="${dd("s3:mengisi", "s3:liter")}">0</span> L</b><span>air masuk tangki di perut pesawat</span></div>
  <div class="row"><i class="pill" data-at="s3:ton" data-fx="pop">&asymp; 15 TON</i><i class="pill cy" data-at="s3:menit" data-fx="pop">ISI ULANG &plusmn; 20 MENIT</i></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">DUA PESAWAT, SATU TUGAS</div>
  <div class="duo">
    <div class="ye" data-at="s4:satu" data-fx="up"><b>TANKER</b><span>satu-satunya yang membawa air</span></div>
    <div class="mg" data-at="s4:pemandu" data-fx="up"><b>PEMANDU</b><span>terbang dulu, tandai jalur, cek bahaya</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">JALUR JATUHAN</div>
  <div class="steps">
    <div data-at="s5:puluhan" data-fx="left"><i>1</i>Rendah: puluhan meter di atas pohon</div>
    <div data-at="s5:Komputer" data-fx="left"><i class="m">2</i>Komputer buka pintu tangki</div>
    <div data-at="s5:hujan" data-fx="left"><i class="c">3</i>Hujan lebat di sisi api</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">KENAPA MELOMPAT?</div>
  <div class="box"><b class="l">15 TON HILANG<br>DALAM BEBERAPA DETIK</b></div>
  <div class="bars">
    <div class="br" data-at="s6:Gaya" data-fx="left"><em>GAYA ANGKAT</em><div class="bar"><i class="bm"></i></div><strong>TETAP</strong></div>
    <div class="br" data-at="s6:beratnya" data-fx="left"><em>BERAT</em><div class="bar"><i class="bk" data-at="s6:turun" data-fx="shrink"></i></div><strong>TURUN</strong></div>
  </div>
  <div class="stamp mg" data-at="s6:terdorong" data-fx="stamp">PESAWAT TERDORONG NAIK</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">SEPUPUNYA: PESAWAT AMFIBI</div>
  <div class="box cy" data-at="s7:amfibi" data-fx="up"><b class="l">MENYENDOK AIR DANAU</b><span>contoh tipe CL-415, bukan pesawat di Samarinda</span></div>
  <div class="row"><i class="pill big2 nb" data-at="s7:menyendok" data-fx="pop"><span class="ct" data-from="0" data-to="6137" data-a="s7:menyendok" data-d="${dd("s7:menyendok", "s7:6.137")}">0</span> L</i><i class="pill cy big2 nb" data-at="s7:dalam" data-fx="pop"><span class="ct" data-from="0" data-to="12" data-a="s7:dalam" data-d="${dd("s7:dalam", "s7:detik")}">0</span> DETIK</i></div>
  <div class="stamp rd" data-at="s7:gambut" data-fx="stamp">BARA GAMBUT: BUTUH TIM DARAT</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm"><span>BUKAN MEMADAMKAN</span><span class="ln2" data-at="s8:membeli" data-fx="pop">MEMBELI WAKTU</span></div>
  <div class="srcl" data-at="s8:darat" data-fx="fade">Sumber: BNPB (6 Nov 2026), ANTARA, RRI; data CL-415: spesifikasi pabrikan (via Wikipedia). Pesawat, api &amp; lokasi 3D adalah ilustrasi generik, bukan rekaman.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 8px 0 rgba(18,16,20,.25))}
.kick{display:inline-block;font-family:"Oswald",sans-serif;font-weight:700;font-size:30px;letter-spacing:.08em;color:${INK};background:${YE};padding:4px 16px;border:5px solid ${INK};box-shadow:6px 6px 0 ${INK};margin-bottom:16px;transform:rotate(-1.5deg)}
.h0{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.h0 span{font-family:"Bangers",sans-serif;font-size:128px;line-height:.92;letter-spacing:.02em;color:#fff;background:${MG};padding:4px 26px 0;border:7px solid ${INK};box-shadow:10px 10px 0 ${INK};transform:rotate(-2deg);text-shadow:5px 5px 0 ${INK}}
.h0 .ln2{font-size:84px;background:${CY};transform:rotate(1.5deg);margin-left:60px}
.h0.sm span{font-size:96px}.h0.sm .ln2{font-size:110px;background:${YE};color:${INK};text-shadow:4px 4px 0 #fff}
.box{position:relative;background:${PAPER};border:6px solid ${INK};box-shadow:9px 9px 0 ${INK};padding:12px 22px 14px;width:740px;margin-top:16px}
.box.cy{background:#D6F2FF}
.box b{display:block;font-family:"Oswald",sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:${INK}}
.box b.l{font-family:"Bangers",sans-serif;font-weight:400;font-size:62px;letter-spacing:.03em;line-height:1}
.box b.big{font-family:"Bangers",sans-serif;font-weight:400;font-size:132px;line-height:.95;letter-spacing:.02em;color:${CY};text-shadow:5px 5px 0 ${INK}}
.box b .ct,.pill .ct{display:inline;font:inherit;color:inherit}
.box span{display:block;font-family:"Oswald",sans-serif;font-weight:500;font-size:31px;line-height:1.2;color:#3A3440;margin-top:4px}
.box.hb{width:auto;display:inline-block;padding:8px 20px}.box.hb b{font-size:40px}.box.hb em{font-size:72px;vertical-align:-6px;margin-left:6px}
.box em{display:inline-block;font-style:normal;font-family:"Bangers",sans-serif;font-size:104px;line-height:1;letter-spacing:.03em;color:${YE};text-shadow:5px 5px 0 ${INK},-2px -2px 0 ${INK},2px -2px 0 ${INK},-2px 2px 0 ${INK};margin-top:4px}
.row{display:flex;align-items:center;gap:14px;margin-top:18px;flex-wrap:wrap;width:820px}
.row .dot{width:84px;height:84px;border-radius:50%;background:${YE};border:6px solid ${INK};box-shadow:5px 5px 0 ${INK};font-family:"Bangers",sans-serif;font-weight:400;font-size:66px;line-height:86px;text-align:center;color:${INK}}
.row i{font-style:normal;font-family:"Bangers",sans-serif;font-size:56px;letter-spacing:.03em;color:#fff;text-shadow:4px 4px 0 ${INK},-2px -2px 0 ${INK},2px -2px 0 ${INK},-2px 2px 0 ${INK}}
.row i.pill{font-size:52px;color:${INK};text-shadow:none;background:${YE};border:6px solid ${INK};box-shadow:7px 7px 0 ${INK};padding:4px 20px 0}
.row i.pill.cy{background:#BDEBFF}
.row i.big2{font-size:84px;line-height:1}
.stamp{display:inline-block;margin-top:18px;font-family:"Bangers",sans-serif;font-size:62px;letter-spacing:.04em;color:#fff;background:${RD};padding:6px 24px 2px;border:6px solid ${INK};box-shadow:8px 8px 0 ${INK}}
.stamp.rd{background:${RD}}.stamp.mg{background:${MG}}
.duo{display:flex;gap:16px;width:850px}
.duo>div{flex:1;border:6px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:12px 18px 14px;background:${PAPER}}
.duo>.ye{background:${YE}}.duo>.mg{background:#FFD1EA}
.duo b{display:block;font-family:"Bangers",sans-serif;font-weight:400;font-size:72px;line-height:1;letter-spacing:.03em;color:${INK}}
.duo span{display:block;font-family:"Oswald",sans-serif;font-weight:500;font-size:31px;line-height:1.2;color:${INK};margin-top:6px}
.steps{width:800px}
.steps>div{font-family:"Oswald",sans-serif;font-weight:600;font-size:40px;line-height:1.15;color:${INK};background:${PAPER};border:5px solid ${INK};box-shadow:7px 7px 0 ${INK};padding:8px 16px;margin-top:12px;display:flex;align-items:center}
.steps i{flex:none;display:inline-block;font-style:normal;width:58px;height:58px;line-height:62px;text-align:center;background:${YE};color:${INK};border:4px solid ${INK};border-radius:50%;margin-right:16px;font-family:"Bangers",sans-serif;font-size:44px}
.steps i.m{background:${MG};color:#fff}.steps i.c{background:${CY};color:#fff}
.bars{width:800px;margin-top:14px;background:${PAPER};border:6px solid ${INK};box-shadow:8px 8px 0 ${INK};padding:10px 18px}
.br{display:flex;align-items:center;gap:14px;margin:8px 0}
.br em{font-style:normal;width:210px;font-family:"Oswald",sans-serif;font-weight:700;font-size:32px;color:${INK}}
.bar{flex:1;height:38px;border:4px solid ${INK};background:#fff;position:relative;overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%}
.bm{background:${MG}}.bk{background:#3A4256}
.br strong{width:110px;font-family:"Bangers",sans-serif;font-weight:400;font-size:42px;color:${INK}}
.srcl{font-family:"Oswald",sans-serif;font-weight:500;font-size:25px;line-height:1.3;color:${INK};margin-top:22px;width:800px;background:${PAPER};border:4px solid ${INK};padding:8px 14px}
#chip{color:${INK}!important;background:${PAPER};border:4px solid ${INK};padding:3px 10px;opacity:.95!important;box-shadow:4px 4px 0 ${INK};font-family:"Oswald",sans-serif!important;font-size:22px!important}
#hud{position:absolute;right:56px;top:180px;z-index:11;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#hud b{font-family:"Bangers",sans-serif;font-weight:400;font-size:34px;letter-spacing:.06em;color:${INK};background:${YE};border:4px solid ${INK};box-shadow:4px 4px 0 ${INK};padding:2px 12px 0}
#hud i{font-style:normal;font-family:"Bangers",sans-serif;font-size:32px;letter-spacing:.06em;color:#fff;background:${MG};border:4px solid ${INK};padding:2px 12px 0;box-shadow:4px 4px 0 ${INK}}`;

const hudHtml = `<div id="hud"><b id="hudp">PANEL 1/8</b><i id="hudslow">GERAK LAMBAT</i></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "25", sig: "EP25_PESAWAT_BOM_AIR", chip: "ILUSTRASI, BUKAN REKAMAN ASLI", panelTop: 262,
  bg: "#7FD3F0", vig: 0.32, grain: 0.07, capfloor: 0.38, html: html + hudHtml, css,
  extraAt: ["s1:dijatuhkan", "s1:melompat", "s2:tiga", "s2:Makroman", "s2:Hercules", "s2:militer",
    "s3:sungai", "s3:Balikpapan", "s3:selang", "s3:mengisi", "s3:liter", "s3:menit",
    "s4:dua", "s4:pemandu", "s4:terbang", "s4:menandai", "s4:mengecek",
    "s5:puluhan", "s5:Komputer", "s5:pintu", "s5:Air", "s5:hujan", "s5:sisi",
    "s6:kenapa", "s6:hilang", "s6:Gaya", "s6:beratnya", "s6:terdorong", "s6:pilot",
    "s7:amfibi", "s7:menyendok", "s7:6.137", "s7:detik", "s7:Tapi", "s7:gambut", "s7:tim",
    "s8:membeli", "s8:Ikuti"],
  fxExtra: `shrink:(e,t)=>tl.fromTo(e,{scaleX:1,opacity:1},{scaleX:.45,opacity:1,duration:.8,ease:'power3.out'},t),`,
  // Comic panel SLAM: stamped on oversize and tilted, revealed by a diagonal wipe, settles with overshoot.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:1.22,rotation:-4,clipPath:'polygon(0% 0%,0% 0%,0% 0%,0% 0%)'},{opacity:1,scale:1,rotation:0,clipPath:'polygon(0% 0%,140% 0%,100% 140%,0% 100%)',duration:.42,ease:'back.out(1.6)'},a-.12);}`,
  // Page turn: swings away on the Y axis with perspective.
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,rotationY:-78,x:-60,transformPerspective:1400,transformOrigin:'0% 50%',duration:.34,ease:'power2.in'},b-.34)`,
  hud: `(function(){const hp=q('#hudp'),sl=q('#hudslow');const S=[K.s1,K.s2,K.s3,K.s4,K.s5,K.s6,K.s7,K.s8];const a=AT['s5:Air']-.3,b=AT['s6:pilot']+.6;let last='';return (t)=>{let k=0;for(let i=0;i<S.length;i++)if(t>=S[i]-.05)k=i;const tx='PANEL '+(k+1)+'/8';if(tx!==last){hp.textContent=tx;last=tx;}sl.style.opacity=(t>a&&t<b)?1:0;hp.parentNode.style.visibility=t>=OUT?'hidden':'visible';};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Bangers",sans-serif;font-weight:400;font-size:74px;line-height:1.12;letter-spacing:.03em;color:#fff;text-shadow:4px 5px 0 #121014,-3px -3px 0 #121014,3px -3px 0 #121014,-3px 3px 0 #121014,3px 3px 0 #121014,0 4px 0 #121014,0 -4px 0 #121014,4px 0 0 #121014,-4px 0 0 #121014}
.w{display:inline-block;margin:0 .16em}`,
// Active word: punches to process yellow with a magenta drop, slight tilt and pop.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1,rotation:0},{color:"#FFE100",scale:1.12,rotation:-3,duration:.07,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,rotation:0,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,scale:.82,rotation:2},{opacity:1,scale:1,rotation:0,duration:.18,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pesawat Bom Air", "#7FD3F0");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
