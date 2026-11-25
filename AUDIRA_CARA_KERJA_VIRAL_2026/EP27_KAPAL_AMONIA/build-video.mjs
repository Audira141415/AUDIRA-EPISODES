// EP27 KAPAL AMONIA. VOXELVERSE panels: dusk-teal slabs with chamfered (voxel) corners, a copper edge and amber accents,
// Silkscreen pixel kickers, Rubik headlines. Panels BUILD UP like voxels stacking (stepped bottom-up reveal) and leave by
// dropping into blocks (stepped top-down wipe + fall). Captions are chunky Rubik with a hard voxel drop shadow; the active
// word hops up one "voxel" and turns amber.
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
const SLAB = "rgba(29,44,46,.86)", CU = "#B36A40", AM = "#F2A33A", AMH = "#FFCF86", CR = "#E6D9BF", TP = "#B4CCC4", NB = "#5FA8FF", HW = "#F4F8FF", RD = "#E0553A";
const dd = (a, b) => Math.max(0.4, at(b) - at(a)).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">CARA KERJA VIRAL &middot; EP 27</div>
  <div class="h0"><span>TANPA KARBON</span><span class="ln2" data-at="s1:Tapi" data-fx="pop">TAPI BUTUH SOLAR</span></div>
  <div class="mol"><i class="n">N</i><i class="h">H</i><i class="h">H</i><i class="h">H</i><b>= NH&#8323;</b><s class="cx">C</s></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick">25&ndash;26 OKT 2026 &middot; ULSAN, KOREA SELATAN</div>
  <div class="slab" data-at="s2:diisi" data-fx="up"><b class="big nb">&plusmn;<span class="ct" data-from="0" data-to="800" data-a="s2:diisi" data-d="${dd("s2:diisi", "s2:ton")}">0</span> TON</b><span>amonia hijau, untuk uji coba pembakaran</span></div>
  <div class="stamp" data-at="s2:Bukan" data-fx="stamp">BUKAN KAPAL AMONIA PERTAMA</div>
  <div class="slab am" data-at="s2:raksasa" data-fx="up"><b class="l">TANKER AMONIA RAKSASA PERTAMA</b><span>yang mesinnya bisa membakar amonia</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">DIBUAT DI CHIFENG, TIONGKOK</div>
  <div class="steps">
    <div data-at="s3:listrik" data-fx="left"><i>1</i>Listrik angin &amp; matahari</div>
    <div data-at="s3:memecah" data-fx="left"><i class="w">2</i>Air &rarr; hidrogen <em class="hh">H</em></div>
    <div data-at="s3:udara" data-fx="left"><i class="b">3</i>Udara &rarr; nitrogen <em class="nn">N</em></div>
  </div>
  <div class="formula" data-at="s3:Satu" data-fx="pop"><em class="nn">1 N</em> + <em class="hh">3 H</em> = NH&#8323;</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">MENYIMPAN &amp; MENGISI</div>
  <div class="slab"><span class="pre">amonia mendidih di</span><b class="big nb ice">&minus;33 &deg;C</b></div>
  <div class="row"><i class="pill" data-at="s4:cair" data-fx="pop">CAIR</i><i class="pill ice" data-at="s4:dingin" data-fx="pop">DINGIN</i></div>
  <div class="slab am" data-at="s4:pipa" data-fx="up"><b class="l">PIPA DARAT &rarr; KAPAL</b></div>
</div>
<div class="p s5p" data-in="s5" data-out="s6">
  <div class="kick">DI DALAM SILINDER</div>
  <div class="slab"><b class="l">SULIT TERBAKAR</b><span>baru menyala sendiri di</span><b class="big nb hot" data-at="s5:menyala" data-fx="up"><span class="ct" data-from="0" data-to="651" data-a="s5:menyala" data-d="${dd("s5:menyala", "s5:651")}">0</span> &deg;C</b></div>
  <div class="steps">
    <div data-at="s5:disemprot" data-fx="left"><i class="b">1</i>Amonia cair disemprot</div>
    <div data-at="s5:pilot" data-fx="left"><i>2</i>Solar pilot = korek api</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">SALURAN BUANG</div>
  <div class="slab" data-at="s6:nitrogen" data-fx="up"><span class="pre">hasil ideal</span><b class="l"><em class="nn">N&#8322;</em> + <em class="hh">H&#8322;O</em></b></div>
  <div class="stamp" data-at="s6:nol" data-fx="stamp">BUKAN NOL EMISI</div>
  <div class="row"><i class="chip c1" data-at="s6:NOx" data-fx="pop">NOx</i><i class="chip c2" data-at="s6:N₂O" data-fx="pop">N&#8322;O</i><i class="chip c3" data-at="s6:sisa" data-fx="pop">SISA AMONIA</i></div>
  <div class="slab am" data-at="s6:Katalis" data-fx="up"><b class="l">KATALIS: NOx &rarr; N&#8322; + H&#8322;O</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">HARGA LAINNYA</div>
  <div class="bars">
    <div class="br" data-at="s7:per" data-fx="left"><em>SOLAR</em><div class="bar"><i class="bs"></i></div></div>
    <div class="br" data-at="s7:energi" data-fx="left"><em>AMONIA</em><div class="bar"><i class="ba" data-at="s7:sepertiga" data-fx="third"></i></div></div>
    <span class="cap2">energi per liter: amonia &plusmn; sepertiga solar</span>
  </div>
  <div class="slab am" data-at="s7:tiga" data-fx="up"><b class="big nb">&plusmn;3&times;</b><span>tangki lebih besar untuk jarak yang sama</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm"><span>MOLEKUL TANPA KARBON</span><span class="ln2" data-at="s8:dinyalakan" data-fx="pop">TETAP DINYALAKAN SOLAR</span></div>
  <div class="srcl" data-at="s8:Ikuti" data-fx="fade">Sumber: Ulsan Port Authority, Envision, EPS, Everllence (Okt&ndash;Nov 2026); sifat amonia: Wikipedia. Kapal, pelabuhan, pabrik &amp; mesin 3D adalah ilustrasi generik, bukan rekaman.</div>
</div>`;

const chamf = "clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)";
const css = `
.kick{display:inline-block;font-family:"Silkscreen",monospace;font-weight:700;font-size:26px;letter-spacing:.03em;color:#1D2224;background:${AM};padding:6px 16px 4px;${chamf};margin-bottom:14px;box-shadow:0 6px 0 ${CU}}
.h0{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.h0 span{font-family:"Rubik",sans-serif;font-weight:900;font-size:104px;line-height:.98;letter-spacing:-.01em;color:${CR};background:${SLAB};padding:10px 26px 12px;${chamf};text-shadow:0 6px 0 rgba(0,0,0,.35);border-bottom:8px solid ${CU}}
.h0 .ln2{font-size:76px;color:#1D2224;background:${AM};border-bottom-color:#7A4429;text-shadow:none}
.h0.sm span{font-size:72px}.h0.sm .ln2{font-size:68px}
.mol{display:inline-flex;align-items:center;gap:10px;margin-top:16px;background:${SLAB};padding:12px 18px;${chamf}}
.mol i{font-style:normal;display:inline-block;width:70px;height:70px;line-height:72px;text-align:center;font-family:"Rubik",sans-serif;font-weight:900;font-size:44px;${chamf}}
.mol i.n{background:${NB};color:#fff;width:84px;height:84px;line-height:86px;font-size:52px}.mol i.h{background:${HW};color:#1D2224}
.mol b{font-family:"Rubik",sans-serif;font-weight:900;font-size:58px;color:${CR};text-shadow:0 4px 0 rgba(0,0,0,.5);margin-left:6px}
.mol s{text-decoration:none;position:relative;margin-left:22px;display:inline-block;width:70px;height:70px;line-height:72px;text-align:center;background:#2a2a2a;color:#777;font-family:"Rubik",sans-serif;font-weight:900;font-size:44px;${chamf}}
.mol s::after{content:"";position:absolute;left:-8px;right:-8px;top:31px;height:9px;background:${RD};transform:rotate(-40deg)}
.slab{position:relative;background:${SLAB};${chamf};padding:14px 24px 16px;width:760px;margin-top:14px;border-bottom:8px solid ${CU}}
.slab.am{background:rgba(242,163,58,.95);border-bottom-color:#7A4429}
.slab b{display:block;font-family:"Rubik",sans-serif;font-weight:800;font-size:44px;line-height:1.08;color:${CR}}
.slab b.l{font-weight:900;font-size:54px;line-height:1.02}
.slab.am b,.slab.am span{color:#1D2224}
.slab b.big{font-weight:900;font-size:124px;line-height:.95;color:${AMH};text-shadow:0 7px 0 rgba(0,0,0,.4)}
.slab.am b.big{color:#1D2224;text-shadow:none}
.slab b.ice{color:#A8E6FF}.slab b.hot{color:#FF9A4A}
.slab b .ct{display:inline;font:inherit;color:inherit}
.slab span{display:block;font-family:"Rubik",sans-serif;font-weight:500;font-size:32px;line-height:1.2;color:${TP};margin-top:4px}
.slab span.pre{margin:0 0 2px}
.slab em,.formula em,.steps em{font-style:normal}
.nn{color:${NB}}.hh{color:${HW}}
.slab.am .nn{color:#123F8A}
.row{display:flex;align-items:center;gap:14px;margin-top:16px;flex-wrap:wrap;width:840px}
.pill,.chip{font-style:normal;font-family:"Rubik",sans-serif;font-weight:900;font-size:48px;color:#1D2224;background:${CR};padding:6px 22px 4px;${chamf};border-bottom:6px solid ${CU}}
.pill.ice{background:#A8E6FF}
.chip.c1{background:#FF7A2A}.chip.c2{background:#B05CFF;color:#fff}.chip.c3{background:#4FE3C6}
.stamp{display:inline-block;margin-top:16px;font-family:"Silkscreen",monospace;font-weight:700;font-size:36px;color:#fff;background:${RD};padding:8px 22px 6px;${chamf};box-shadow:0 7px 0 #7A2A1C}
.steps{width:780px}
.steps>div{font-family:"Rubik",sans-serif;font-weight:700;font-size:40px;line-height:1.15;color:${CR};background:${SLAB};${chamf};padding:10px 18px;margin-top:12px;display:flex;align-items:center;border-left:8px solid ${CU}}
.steps i{flex:none;display:inline-block;font-style:normal;width:58px;height:58px;line-height:60px;text-align:center;background:${AM};color:#1D2224;margin-right:16px;font-family:"Silkscreen",monospace;font-size:36px;${chamf}}
.steps i.b{background:${NB};color:#fff}.steps i.w{background:${HW}}
.steps em{margin-left:12px;font-weight:900}
.formula{display:inline-block;margin-top:16px;font-family:"Rubik",sans-serif;font-weight:900;font-size:80px;color:#1D2224;background:${AM};padding:8px 26px 6px;${chamf};border-bottom:8px solid #7A4429}
.formula .hh{color:#fff;text-shadow:0 0 0 #000,2px 2px 0 #1D2224,-2px -2px 0 #1D2224,2px -2px 0 #1D2224,-2px 2px 0 #1D2224}.formula .nn{color:#123F8A}
.bars{width:780px;background:${SLAB};${chamf};padding:14px 22px;border-bottom:8px solid ${CU}}
.br{display:flex;align-items:center;gap:14px;margin:8px 0}
.br em{font-style:normal;width:200px;font-family:"Silkscreen",monospace;font-weight:700;font-size:34px;color:${CR}}
.bar{flex:1;height:46px;background:rgba(0,0,0,.35);position:relative;overflow:hidden;${chamf}}
.bar i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;background:repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 42px,rgba(0,0,0,.25) 42px 46px)}
.bs{background-color:${AM}!important}.ba{background-color:#6FC6D8!important}
.cap2{display:block;font-family:"Rubik",sans-serif;font-weight:500;font-size:30px;color:${TP};margin-top:6px}
.srcl{font-family:"Rubik",sans-serif;font-weight:500;font-size:25px;line-height:1.3;color:${CR};margin-top:22px;width:800px;background:${SLAB};padding:10px 16px;${chamf}}
.s5p .slab{padding:10px 22px 12px}.s5p .slab b.big{font-size:92px}.s5p .slab b.l{font-size:46px}.s5p .steps>div{font-size:34px;padding:7px 16px;margin-top:8px}.s5p .steps i{width:48px;height:48px;line-height:50px;font-size:30px}
#chip{color:#1D2224!important;background:${CR};padding:4px 12px 2px;opacity:.92!important;font-family:"Silkscreen",monospace!important;font-weight:700!important;font-size:20px!important;${chamf}}
#hud{position:absolute;right:56px;top:180px;z-index:11;display:flex;gap:6px}
#hud i{display:block;width:26px;height:26px;background:rgba(29,44,46,.7);border-bottom:4px solid rgba(0,0,0,.4)}
#hud i.on{background:${AM};border-bottom-color:${CU}}`;

const hudHtml = `<div id="hud">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<i id="hd${i}"></i>`).join("")}</div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "27", sig: "EP27_KAPAL_AMONIA", chip: "ILUSTRASI, BUKAN REKAMAN ASLI", panelTop: 262,
  bg: "#2F4A55", vig: 0.34, grain: 0.06, capfloor: 0.34, html: html + hudHtml, css,
  extraAt: ["s1:karbon", "s1:Tapi", "s1:solar", "s2:Ulsan", "s2:diisi", "s2:ton", "s2:Bukan", "s2:raksasa",
    "s3:Chifeng", "s3:listrik", "s3:memecah", "s3:udara", "s3:Satu", "s4:mendidih", "s4:cair", "s4:pipa", "s4:langsung",
    "s5:sulit", "s5:651", "s5:disemprot", "s5:pilot", "s5:korek", "s6:nitrogen", "s6:nol", "s6:Masih", "s6:Katalis",
    "s7:energi", "s7:sepertiga", "s7:tangkinya", "s7:tiga", "s7:besar", "s8:Molekul", "s8:dinyalakan", "s8:Ikuti"],
  fxExtra: `third:(e,t)=>tl.fromTo(e,{scaleX:1,opacity:1},{scaleX:.3,opacity:1,duration:.9,ease:'steps(7)'},t),`,
  // Voxel build-up: the slab assembles bottom-up in stepped rows, then settles one voxel down.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:1,y:-26,clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.42,ease:'steps(7)'},a-.1);tl.to(p,{y:0,duration:.18,ease:'back.out(3)'},a+.32);}`,
  // Blocks drop away: stepped top-down wipe while the slab falls.
  panelOut: `(tl,p,b)=>{tl.to(p,{clipPath:'inset(0% 0% 100% 0%)',y:60,duration:.32,ease:'steps(6)'},b-.32);tl.to(p,{opacity:0,duration:.01},b-.01);}`,
  hud: `(function(){const S=[K.s1,K.s2,K.s3,K.s4,K.s5,K.s6,K.s7,K.s8];const els=S.map((_,i)=>q('#hd'+(i+1)));let last=-1;return (t)=>{let k=0;for(let i=0;i<S.length;i++)if(t>=S[i]-.05)k=i;if(k!==last){els.forEach((e,i)=>e.className=i<=k?'on':'');last=k;}els[0].parentNode.style.visibility=t>=OUT?'hidden':'visible';};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Rubik",sans-serif;font-weight:900;font-size:70px;line-height:1.14;letter-spacing:-.005em;color:#F4ECDC;text-shadow:0 5px 0 #1D2224,0 8px 0 rgba(29,34,36,.55),3px 0 0 #1D2224,-3px 0 0 #1D2224,0 -3px 0 #1D2224}
.w{display:inline-block;margin:0 .12em}`,
// Active word: hops up one voxel and turns amber (stepped ease, no smear).
(id, w) => `tl.fromTo("#${id}",{color:"#F4ECDC",y:0},{color:"#F2A33A",y:-10,duration:.08,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4ECDC",y:0,duration:.12,ease:"steps(2)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"steps(4)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kapal Amonia", "#2F4A55");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
