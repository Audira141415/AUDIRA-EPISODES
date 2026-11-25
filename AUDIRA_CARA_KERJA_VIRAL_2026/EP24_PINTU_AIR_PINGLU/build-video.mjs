// EP24 PINTU AIR PINGLU. TOYDIORAMA look: kraft-paper exhibit tags (cream card, washi tape strip, dark ink,
// Fredoka headings, Courier Prime labels) pinned over a miniature canal theatre. Panels swing down from their tape
// like a tag hung on a pin and leave by dropping and tilting away like paper falling off the stage.
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
const PAPER = "#F6ECD6", KRAFT = "#E3CFA4", INK = "#2B2118", RUST = "#C2512B", TEAL = "#1E6F8C", GRN = "#2F7A4A", WATER = "#3B9EE0", BG = "#10131c";

const html = `
<div id="drL"></div><div id="drR"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag big">
    <div class="st">CARA KERJA VIRAL &middot; EP 24</div>
    <div class="h0">TURUN<br><em>10 LANTAI</em></div>
    <div class="sub">kapal 5.000 ton &middot; <b>tanpa satu pompa pun</b></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">
    <div class="st">16 SEPTEMBER 2026 &middot; TIONGKOK</div>
    <div class="h1">TERUSAN PINGLU</div>
    <div class="sub">dibuka untuk kapal niaga</div>
  </div>
  <div class="note" data-at="s2:CGTN" data-fx="left"><b>7 NOVEMBER</b><span>CGTN kembali menyorotnya</span></div>
  <div class="note blue" data-at="s2:enam" data-fx="left"><b class="nb">&plusmn;<span class="ct" data-from="0" data-to="65" data-a="s2:enam" data-d="1.1">0</span> METER</b><span>total turunan menuju laut</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">
    <div class="st">TANGGA AIR</div>
    <div class="h1">3 ANAK TANGGA</div>
  </div>
  <div class="stairs">
    <b data-at="s3:Madao" data-fx="pop">MADAO</b>
    <b class="s2" data-at="s3:Qishi" data-fx="pop">QISHI</b>
    <b class="s3" data-at="s3:Qingnian" data-fx="pop">QINGNIAN</b>
  </div>
  <div class="note" data-at="s3:pintu" data-fx="left"><b>TIAP ANAK TANGGA</b><span>= satu pintu air (kunci kapal)</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">
    <div class="st">MASUK KAMAR</div>
    <div class="h1"><span class="nb">300</span> METER</div>
    <div class="sub">panjang kamar pintu air</div>
  </div>
  <div class="note" data-at="s4:menutup" data-fx="left"><b>PINTU BELAKANG MENUTUP</b><span>dua daun raksasa</span></div>
  <div class="note rust" data-at="s4:V" data-fx="left"><b>BENTUK V &rarr; HULU</b><span>tekanan air menekannya makin rapat</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">
    <div class="st">TANPA POMPA</div>
    <div class="steps">
      <div data-at="s5:katup" data-fx="left"><i>1</i>Katup di lorong bawah dibuka</div>
      <div data-at="s5:mengalir" data-fx="left"><i>2</i>Air mengalir sendiri, tinggi &rarr; rendah</div>
      <div data-at="s5:turun" data-fx="left"><i>3</i>Kapal ikut turun</div>
    </div>
  </div>
  <div class="note blue" data-at="s5:29,6" data-fx="left"><b class="nb"><span class="ct" data-from="0" data-to="29.6" data-dec="1" data-a="s5:29,6" data-d="1.0">0</span> METER</b><span>maksimal satu tahap di Madao</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">
    <div class="st">KOLAM TABUNGAN AIR</div>
    <div class="h1">3 KOLAM BERTINGKAT</div>
  </div>
  <div class="note" data-at="s6:menabungnya" data-fx="left"><b>KAPAL TURUN &darr;</b><span>air kamar ditabung ke kolam</span></div>
  <div class="note blue" data-at="s6:mengembalikannya" data-fx="left"><b>KAPAL NAIK &uarr;</b><span>air kolam dikembalikan ke kamar</span></div>
  <div class="note grn" data-at="s6:enam" data-fx="left"><b class="nb">&gt; <span class="ct" data-from="0" data-to="60" data-a="s6:enam" data-d="1.0">0</span>%</b><span>air dipakai ulang</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">
    <div class="st">SATU KAMAR</div>
    <div class="h1 nb">&plusmn;<span class="ct" data-from="0" data-to="300000" data-a="s7:ribu" data-d="1.2">0</span> m&sup3;</div>
    <div class="sub" data-at="s7:menit" data-fx="fade">terisi &plusmn;15 menit</div>
  </div>
  <div class="note" data-at="s7:sama" data-fx="left"><b>AIR SAMA TINGGI</b><span>pintu depan terbuka, kapal keluar</span></div>
  <div class="stamp" data-at="s7:rekor" data-fx="stamp">REKOR KELAS PINTU AIR HEMAT AIR<small>klaim media pemerintah Tiongkok</small></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="trio"><b data-at="s8:Bukan" data-fx="pop" class="x">BUKAN POMPA</b><b data-at="s8:gravitasi" data-fx="pop">GRAVITASI</b><b data-at="s8:pintu" data-fx="pop" class="g">+ PINTU YANG TEPAT</b></div>
  <div class="srcl" data-at="s8:pintu" data-fx="fade">Sumber: CGTN (16 Sep &amp; 7 Nov 2026), Xinhua (7 Jun &amp; 15 Sep 2026), Beijing Daily (8 Mei 2026), The Cover (16 Sep 2026). Rekor = klaim pembangun/media pemerintah Tiongkok. Diorama, kapal &amp; tokoh adalah ilustrasi generik.</div>
</div>`;

const css = `
#drL,#drR{position:absolute;top:0;bottom:0;width:70px;z-index:6;filter:blur(3px);pointer-events:none;
 background:repeating-linear-gradient(90deg,#5e1420 0 10px,#8e2233 10px 22px,#6d1826 22px 30px);box-shadow:0 0 40px rgba(0,0,0,.7)}
#drL{left:-14px;border-radius:0 0 60px 0}#drR{right:-14px;border-radius:0 0 0 60px}
.p{filter:drop-shadow(0 12px 22px rgba(0,0,0,.5))}
.tag{position:relative;background:${PAPER};border-radius:14px;padding:22px 30px 22px;width:760px;box-sizing:border-box;border:2px solid rgba(43,33,24,.18)}
.tag:before{content:"";position:absolute;left:50%;top:-18px;width:190px;height:38px;margin-left:-95px;background:rgba(232,138,110,.72);transform:rotate(-2deg);box-shadow:0 2px 4px rgba(0,0,0,.12)}
.tag.big{width:800px}
.st{font-family:"Courier Prime",monospace;font-weight:700;font-size:26px;letter-spacing:.08em;color:${RUST};margin-bottom:8px}
.h0{font-family:"Fredoka",sans-serif;font-weight:700;font-size:132px;line-height:.92;color:${INK};letter-spacing:-.01em}
.h0 em{font-style:normal;color:${TEAL}}
.h1{font-family:"Fredoka",sans-serif;font-weight:700;font-size:84px;line-height:1;color:${INK}}
.h1 .ct{font:inherit;color:inherit}
.sub{font-family:"Courier Prime",monospace;font-weight:400;font-size:31px;color:#4a3b2e;margin-top:10px}
.sub b{font-weight:700;color:${RUST}}
.note{position:relative;background:${KRAFT};border-radius:10px;padding:10px 20px 12px;margin-top:16px;width:720px;box-sizing:border-box;border-left:10px solid ${INK};transform:rotate(-.6deg)}
.note:nth-of-type(even){transform:rotate(.5deg)}
.note b{display:block;font-family:"Fredoka",sans-serif;font-weight:700;font-size:48px;line-height:1.05;color:${INK}}
.note b .ct{display:inline;font:inherit;color:inherit}
.note span{display:block;font-family:"Courier Prime",monospace;font-weight:700;font-size:27px;line-height:1.25;color:#4a3b2e}
.note.blue{border-left-color:${WATER}}.note.blue b{color:${TEAL};font-size:64px}
.note.rust{border-left-color:${RUST}}
.note.grn{border-left-color:${GRN}}.note.grn b{color:${GRN};font-size:64px}
.stairs{position:relative;height:230px;width:760px;margin-top:14px}
.stairs b{position:absolute;font-family:"Fredoka",sans-serif;font-weight:700;font-size:44px;color:#fff;background:${TEAL};padding:8px 20px;border-radius:12px;border-bottom:8px solid #134a5e;left:0;top:0}
.stairs b.s2{left:230px;top:76px;background:#2a86a8}.stairs b.s3{left:440px;top:152px;background:${WATER};border-bottom-color:#1f6aa0}
.steps>div{font-family:"Fredoka",sans-serif;font-weight:600;font-size:36px;color:${INK};padding:6px 0;display:flex;align-items:center}
.steps i{display:inline-block;font-style:normal;width:50px;height:50px;line-height:50px;text-align:center;background:${RUST};color:#fff;border-radius:50%;margin-right:16px;font-family:"Fredoka",sans-serif;font-weight:700;flex:none}
.stamp{display:inline-block;margin-top:18px;font-family:"Fredoka",sans-serif;font-weight:700;font-size:40px;line-height:1.05;color:${RUST};background:rgba(246,236,214,.95);padding:10px 22px;border:5px solid ${RUST};border-radius:10px;max-width:700px}
.stamp small{display:block;font-family:"Courier Prime",monospace;font-weight:700;font-size:25px;color:#4a3b2e;margin-top:4px}
.trio{display:flex;flex-direction:column;gap:12px}
.trio b{align-self:flex-start;font-family:"Fredoka",sans-serif;font-weight:700;font-size:86px;line-height:1;color:${INK};background:${PAPER};padding:10px 26px 14px;border-radius:14px;border-bottom:8px solid ${KRAFT}}
.trio b.x{font-size:60px;color:#7a6a5a;text-decoration:line-through;text-decoration-color:${RUST};text-decoration-thickness:6px}
.trio b.g{color:${TEAL};font-size:70px}
.srcl{font-family:"Courier Prime",monospace;font-weight:700;font-size:22px;line-height:1.35;color:#3a2e24;margin-top:16px;width:780px;background:rgba(246,236,214,.92);padding:10px 14px;border-radius:8px}
#hud{position:absolute;right:86px;top:186px;z-index:11;text-align:right;font-family:"Courier Prime",monospace;font-weight:700;font-size:22px;letter-spacing:.08em;color:rgba(255,236,200,.85)}
#hud b{color:#F4C460}`;

const hudHtml = `<div id="hud"><span>PANGGUNG &middot; </span><b id="hudz">TERUSAN PINGLU</b></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "24", sig: "EP24_PINTU_AIR_PINGLU", chip: "ILUSTRASI", panelTop: 262,
  bg: BG, vig: 0.42, grain: 0.06, capfloor: 0.42, html: html + hudHtml, css,
  extraAt: ["s1:pompa", "s2:Terusan", "s2:CGTN", "s2:enam", "s2:laut",
    "s3:terjun", "s3:tangga", "s3:Madao", "s3:Qishi", "s3:Qingnian", "s3:pintu",
    "s4:masuk", "s4:menutup", "s4:V", "s4:Tekanan", "s4:rapat",
    "s5:katup", "s5:mengalir", "s5:turun", "s5:Madao", "s5:29,6",
    "s6:dibuang", "s6:kolam", "s6:menabungnya", "s6:mengembalikannya", "s6:enam", "s6:ulang",
    "s7:kamar", "s7:ribu", "s7:kubik", "s7:menit", "s7:sama", "s7:terbuka", "s7:rekor",
    "s8:Bukan", "s8:gravitasi", "s8:pintu"],
  // Tag hung on a pin: swings down from its tape strip with a damped overshoot. Out: drops and tilts away like falling paper.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{transformOrigin:'50% 0%',rotation:-14,y:-70,opacity:0},{rotation:0,y:0,opacity:1,duration:.62,ease:'elastic.out(1,.55)'},a-.18);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{transformOrigin:'0% 0%',rotation:9,y:90,opacity:0,duration:.34,ease:'power2.in'},b-.36)`,
  hud: `(function(){const z=q('#hudz');const L=[[0,'SIMPUL MADAO'],[K.s2,'TERUSAN PINGLU'],[K.s4,'SIMPUL MADAO'],[K.s6,'KOLAM HEMAT AIR'],[K.s7,'SIMPUL MADAO'],[K.s8,'TERUSAN PINGLU']];let last='';return (t)=>{let k=0;for(let i=0;i<L.length;i++)if(t>=L[i][0])k=i;if(L[k][1]!==last){z.textContent=L[k][1];last=L[k][1];}};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:70px;right:100px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Fredoka",sans-serif;font-weight:700;font-size:66px;line-height:1.18;color:#FFF7E8;text-shadow:0 4px 0 #2B2118,0 0 3px #2B2118,0 6px 16px rgba(0,0,0,.8)}
.w{display:inline-block;margin:0 .14em}`,
// Active word turns footlight-yellow with a toy hop.
(id, w) => `tl.fromTo("#${id}",{color:"#FFF7E8",y:0,scale:1},{color:"#FFC94A",y:-8,scale:1.1,duration:.08,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF7E8",y:0,scale:1,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:18,rotation:-2},{opacity:1,y:0,rotation:0,duration:.24,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pintu Air Pinglu", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
