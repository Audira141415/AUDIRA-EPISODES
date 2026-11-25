// EP17 SATU KILOMETER KE ATAS. URBANFORGE look: plaster massing model in a dark gallery, data projected as light.
// Panels are exhibition wall labels: black glass, cyan mono kicker, amber figures. They unfold like a drawing sheet from the
// top-left corner (a diagonal clip reveal with a cyan rule drawn first) and leave by folding up toward the top edge.
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
const CY = "#00E5FF", AM = "#FFB703";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="k">CARA KERJA VIRAL &middot; EP 17</div>
  <div class="hero"><b>1 KM</b><i>KE ATAS</i></div>
  <div class="tl">Cara membangun gedung <span>satu kilometer</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="k">2 NOVEMBER &middot; JEDDAH TOWER</div>
  <div class="card"><div class="two"><div data-at="s2:menembus" data-fx="up"><small>LANTAI</small><b class="nb am"><span class="ct" data-from="0" data-to="120" data-a="s2:menembus" data-d="1.6">0</span></b></div><div data-at="s2:480" data-fx="up"><small>TINGGI SEKARANG</small><b class="nb">&plusmn; 480 m</b></div></div></div>
  <div class="tline">
    <div data-at="s2:mangkrak" data-fx="left"><b>2018</b><span>mangkrak</span></div>
    <div data-at="s2:dilanjutkan" data-fx="left"><b>2025</b><span>dilanjutkan</span></div>
    <div data-at="s2:targetnya" data-fx="left"><b class="am">2028</b><span>target selesai</span></div>
  </div>
  <div class="row" data-at="s2:kilometer" data-fx="left"><b class="am">&gt; 1 KM</b><span>tinggi akhirnya</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="k">FONDASI &middot; BATU KARANG BERONGGA</div>
  <div class="card big" data-at="s3:tiang" data-fx="up"><b class="nb am"><span class="ct" data-from="0" data-to="270" data-a="s3:tiang" data-d="1.4">0</span></b><span>tiang bor</span></div>
  <div class="row" data-at="s3:sedalam" data-fx="left"><b class="nb">45&ndash;105 m</b><span>kedalaman tiang</span></div>
  <div class="row" data-at="s3:pelat" data-fx="left"><b class="nb">&plusmn; 5 m</b><span>pelat beton pengikat</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="k">DENAH HURUF Y</div>
  <div class="chips"><b class="am" data-at="s4:Inti" data-fx="pop">INTI SEGITIGA</b><b class="cy" data-at="s4:sayap" data-fx="pop">3 SAYAP</b></div>
  <div class="row" data-at="s4:dinding" data-fx="left"><b>DINDING, TANPA KOLOM</b><span>beban ditahan dinding beton</span></div>
  <div class="row" data-at="s4:Tiga" data-fx="left"><b><span class="am">3 KAKI</span> = MINIMUM</b><span>agar stabil</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="k">BETON ESTAFET &middot; RENCANA</div>
  <div class="relay" data-at="s5:pertama" data-fx="up">
    <div data-at="s5:pertama" data-fx="up"><small>POMPA 1</small><b class="nb am">&plusmn; 500 m</b></div>
    <i data-at="s5:kedua" data-fx="grow"></i>
    <div data-at="s5:kedua" data-fx="up"><small>POMPA 2</small><b class="cy">MENERUSKAN</b></div>
  </div>
  <div class="note" data-at="s5:Satu" data-fx="fade">Satu pompa tidak sanggup</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="k">MUSUH TERBESAR: ANGIN</div>
  <div class="card" data-at="s6:pusaran" data-fx="up"><b class="mid">PUSARAN BERGANTIAN</b><span>bisa mengayunkan gedung</span></div>
  <div class="row" data-at="s6:sayapnya" data-fx="left"><b class="cy">SAYAP MAKIN PENDEK</b><span>pusaran tidak sempat kompak</span></div>
  <div class="row" data-at="s6:terowongan" data-fx="left"><b>DIUJI DI TEROWONGAN ANGIN</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="k">LIFT SATU KILOMETER</div>
  <div class="ropes">
    <div class="rp" data-at="s7:baja" data-fx="up"><small>TALI BAJA</small><b class="rd">TERLALU BERAT</b><span>di atas &plusmn; 500 m</span></div>
    <div class="rp" data-at="s7:karbon" data-fx="up"><small>TALI SERAT KARBON</small><b class="cy nb">&gt; 630 m</b><span>ke dek pengamatan</span></div>
  </div>
  <div class="row" data-at="s7:sepuluh" data-fx="left"><b class="nb">10 m/s</b><span>kecepatan lift</span></div>
  <div class="row" data-at="s7:peredam" data-fx="left"><b class="am">PEREDAM MASSA</b><span>di ujung menara</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="trio"><b data-at="s8:Akar" data-fx="pop">AKAR DI KARANG</b><b data-at="s8:kaki" data-fx="pop" class="am">TIGA KAKI</b><b data-at="s8:pengecoh" data-fx="pop" class="cy">PENGECOH ANGIN</b></div>
  <div class="srcl" data-at="s8:Ikuti" data-fx="fade">Sumber: Kingdom Holding (2 Nov 2026), Newsweek, New Civil Engineer, KONE. Model 3D adalah ilustrasi, bukan gambar proyek asli.</div>
</div>`;

const css = `
.p{font-family:Archivo,sans-serif}
.k{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;letter-spacing:.14em;color:${CY};background:rgba(10,11,14,.88);border:1px solid rgba(0,229,255,.35);border-radius:8px;padding:8px 16px;margin-bottom:14px}
.hero{display:flex;flex-direction:column;background:rgba(10,11,14,.8);border-radius:16px;padding:10px 30px 18px;align-self:flex-start;width:max-content;border:1px solid rgba(255,255,255,.1)}
.hero b{font-family:Archivo,sans-serif;font-weight:900;font-size:210px;line-height:.92;letter-spacing:-.04em;color:#fff}
.hero i{font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:64px;letter-spacing:.22em;color:${AM};margin-top:2px}
.tl{font-family:Archivo,sans-serif;font-weight:600;font-size:38px;color:#fff;margin-top:14px;background:rgba(10,11,14,.82);display:inline-block;padding:8px 16px;border-radius:8px}
.tl span{font-weight:900;color:${CY}}
.card{background:rgba(10,11,14,.86);border:1px solid rgba(255,255,255,.12);border-left:5px solid ${CY};padding:14px 24px 16px;width:800px;border-radius:14px;box-shadow:0 20px 44px rgba(0,0,0,.35)}
.card b{display:block;font-weight:900;color:#fff;line-height:1}
.card.big b{font-size:150px;letter-spacing:-.03em}
.card b.mid{font-size:58px;letter-spacing:-.01em}
.card span{display:block;font-weight:500;font-size:31px;color:#B9C1CC;margin-top:6px}
.two{display:flex;gap:40px}
.two small,.relay small,.rp small{display:block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:22px;letter-spacing:.12em;color:#8FA0B2}
.two b{font-size:104px;letter-spacing:-.03em;margin-top:4px}
.am{color:${AM}!important}.cy{color:${CY}!important}.rd{color:#FF5A4E!important}
.tline{display:flex;gap:12px;width:850px;margin-top:12px}
.tline div{flex:1;background:rgba(10,11,14,.84);border-top:3px solid rgba(255,255,255,.4);border-radius:10px;padding:10px 14px}
.tline b{display:block;font-weight:900;font-size:52px;color:#fff;line-height:1}
.tline span{display:block;font-weight:500;font-size:26px;color:#B9C1CC}
.row{background:rgba(10,11,14,.86);border-left:5px solid ${AM};padding:10px 20px;margin-top:12px;width:760px;border-radius:10px}
.row b{display:block;font-weight:800;font-size:48px;line-height:1.08;color:#fff}
.row span{display:block;font-weight:500;font-size:29px;line-height:1.2;color:#B9C1CC}
.chips{display:flex;gap:14px}
.chips b{font-weight:900;font-size:58px;line-height:1;background:rgba(10,11,14,.88);border:1px solid rgba(255,255,255,.14);padding:14px 22px;border-radius:12px}
.relay{display:flex;align-items:center;gap:16px;width:870px;background:rgba(10,11,14,.86);border-radius:14px;padding:16px 22px;border:1px solid rgba(255,255,255,.12)}
.relay b{display:block;font-weight:900;font-size:62px;line-height:1.02;color:#fff;margin-top:4px}
.relay i{display:block;flex:0 0 70px;height:6px;background:linear-gradient(90deg,${AM},${CY});transform-origin:0 50%;border-radius:3px}
.note{display:inline-block;margin-top:12px;font-weight:600;font-size:32px;color:#fff;background:rgba(10,11,14,.8);padding:8px 16px;border-radius:8px}
.ropes{display:flex;gap:14px;width:880px}
.rp{flex:1;background:rgba(10,11,14,.86);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px 18px}
.rp b{display:block;font-weight:900;font-size:52px;line-height:1.05;color:#fff;margin-top:4px}
.rp span{display:block;font-weight:500;font-size:27px;color:#B9C1CC}
.card b .ct,.two b .ct{display:inline;font:inherit;color:inherit;margin:0}
.trio{display:flex;flex-direction:column;gap:10px}
.trio b{display:inline-block;align-self:flex-start;font-weight:900;font-size:84px;line-height:1;letter-spacing:-.02em;color:#fff;background:rgba(10,11,14,.86);padding:10px 22px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.12)}
.srcl{font-weight:500;font-size:24px;line-height:1.3;color:#DDE3EA;margin-top:16px;width:780px;background:rgba(10,11,14,.8);padding:10px 14px;border-radius:8px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "17", sig: "EP17_GEDUNG_1KM_JEDDAH", chip: "ILUSTRASI", panelTop: 262,
  bg: "#0b0c0f", vig: 0.32, grain: 0.035, capfloor: 0.55, html, css,
  extraAt: ["s1:kilometer", "s1:Tapi", "s1:atas", "s1:Bagaimana", "s1:berdiri", "s2:November", "s2:120", "s3:Fondasinya", "s3:berongga", "s3:Ada", "s3:105", "s3:diikat",
    "s4:Dari", "s4:Y", "s4:Bebannya", "s4:kolom", "s4:stabil", "s5:estafet", "s5:meneruskan", "s6:Musuh", "s6:Angin", "s6:mengayunkan", "s6:Karena", "s6:pendek", "s6:kompak", "s6:Semuanya",
    "s7:berat", "s7:Lift", "s7:630", "s7:Liftnya", "s7:ujung", "s7:goyangan"],
  // Drawing-sheet unfold from the top-left corner; leaves by folding up to the top edge.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'polygon(0% 0%,0% 0%,0% 0%,0% 0%)',opacity:1,x:-14},{clipPath:'polygon(0% 0%,220% 0%,0% 220%,0% 0%)',x:0,duration:.55,ease:'expo.out'},a-.16);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{transformOrigin:'50% 0%',scaleY:0.04,opacity:0,duration:.3,ease:'power3.in'},b-.32)`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:70px;right:120px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,sans-serif;font-weight:900;font-size:62px;line-height:1.2;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.9),0 0 3px #000}
.w{display:inline-block;margin:0 .1em;padding:0 2px}`,
// Active word: projected-light cyan with a glow, like data washed onto the model.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",textShadow:"0 3px 14px rgba(0,0,0,.9)"},{color:"#00E5FF",textShadow:"0 0 18px rgba(0,229,255,.75), 0 3px 10px rgba(0,0,0,.9)",scale:1.06,duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",textShadow:"0 3px 14px rgba(0,0,0,.9)",scale:1,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:16,clipPath:"inset(0% 0% 100% 0%)"},{opacity:1,y:0,clipPath:"inset(0% 0% 0% 0%)",duration:.2,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Satu Kilometer", "#0b0c0f");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
