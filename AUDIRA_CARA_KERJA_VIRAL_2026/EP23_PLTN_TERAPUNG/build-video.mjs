// EP23 PLTN TERAPUNG. DRAFTFORGE look: drawing-sheet panels (navy title-block boxes, white 2px rule, gold sheet numbers in
// JetBrains Mono, light Space Grotesk headings, cyan sub-lines) over a live CAD line-art world.
// Panels arrive like a pen plotter: the box is ruled in left-to-right behind a gold pen line; they leave by collapsing
// to a single horizontal rule (like a drawing layer switched off).
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
const CY = "#4FC3F7", WH = "#F0F6FF", GOLD = "#FFCA28", RED = "#EF5350", NAVY = "#061327", MUT = "#6B8BB2";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="sh">LEMBAR 23 &middot; CARA KERJA VIRAL</div>
  <div class="h0">PLTN<br>terapung</div>
  <div class="sub">pembangkit nuklir di atas tongkang, untuk Halmahera</div>
  <div class="rule bad" data-at="s1:aturan" data-fx="plot"><b>ATURAN SAAT INI</b><span>lokasi nuklir = daratan</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="sh">16 OKTOBER &middot; KONTRAK LISTRIK</div>
  <div class="tb2">
    <div data-at="s2:Rosatom" data-fx="plot"><em>PIHAK 1</em><b>ROSATOM</b><span>Rusia</span></div>
    <div data-at="s2:swasta" data-fx="plot"><em>PIHAK 2</em><b>SWASTA</b><span>perusahaan Indonesia</span></div>
  </div>
  <div class="big" data-at="s2:dua" data-fx="plot"><b>2 KAPAL &middot; <span class="ct nb" data-from="0" data-to="200" data-a="s2:dua" data-d="1.4">0</span> MW</b><span>total dua unit pembangkit terapung</span></div>
  <div class="st"><div data-at="s2:Pemerintah" data-fx="left"><i></i>KEPUTUSAN PEMERINTAH: <b>BELUM</b></div><div data-at="s2:izin" data-fx="left"><i></i>IZIN OPERASI: <b>BELUM DIAJUKAN</b></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="sh">DETAIL A &middot; TERAS REAKTOR</div>
  <div class="rule" data-at="s3:Neutron" data-fx="plot"><b>NEUTRON &rarr; URANIUM</b><span>inti terbelah: panas + 2&ndash;3 neutron baru</span></div>
  <div class="rule cy" data-at="s3:Batang" data-fx="plot"><b>BATANG KENDALI</b><span>menyerap neutron berlebih &rarr; reaksi stabil</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="sh">SKEMA SIRKUIT 1 &amp; 2</div>
  <div class="rule gd" data-at="s4:dipompa" data-fx="plot"><b><i class="n g">1</i>TEKANAN TINGGI</b><span>air tidak mendidih walau ratusan derajat</span></div>
  <div class="rule" data-at="s4:sirkuit" data-fx="plot"><b><i class="n w">2</i>SIRKUIT TERPISAH</b><span>air berubah menjadi uap</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="sh">TURBIN &middot; GENERATOR &middot; KABEL</div>
  <div class="flow"><b data-at="s5:Uap" data-fx="pop">UAP</b><i data-at="s5:turbin" data-fx="fade">&rarr;</i><b data-at="s5:turbin" data-fx="pop">TURBIN</b><i data-at="s5:generator" data-fx="fade">&rarr;</i><b data-at="s5:generator" data-fx="pop" class="gd">GENERATOR</b></div>
  <div class="rule" data-at="s5:batu" data-fx="plot"><b>SAMA DENGAN PLTU</b><span>bedanya hanya sumber panas</span></div>
  <div class="rule gd" data-at="s5:kabel" data-fx="plot"><b>KABEL &rarr; DARATAN</b><span>listrik dialirkan ke darat</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="sh">SIRKUIT 3 &middot; AIR LAUT</div>
  <div class="rule sea" data-at="s6:kondensor" data-fx="plot"><b><i class="n s">3</i>KONDENSOR</b><span>air laut mendinginkan uap bekas</span></div>
  <div class="rule sea" data-at="s6:menyentuh" data-fx="plot"><b>TIDAK MENYENTUH AIR REAKTOR</b></div>
  <div class="rule gd" data-at="s6:hangat" data-fx="plot"><b>DAMPAK RUTIN</b><span>air laut kembali sedikit lebih hangat</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="sh">PETA RUTE &middot; BUKAN YANG PERTAMA</div>
  <div class="rule" data-at="s7:dirakit" data-fx="plot"><b>GALANGAN &rarr; KAPAL TUNDA</b><span>dirakit di galangan, lalu ditarik ke lokasi</span></div>
  <div class="big" data-at="s7:Akademik" data-fx="plot"><b>AKADEMIK LOMONOSOV</b><span>2 &times; 35 MW &middot; Arktik Rusia &middot; sejak 2020</span></div>
  <div class="rule cy" data-at="s7:Rencananya" data-fx="plot"><b>TIAP 12 TAHUN</b><span>rencananya ditarik pulang ke galangan</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="sh">REVISI ATURAN &middot; BAPETEN</div>
  <div class="rev"><b class="old" data-at="s8:Kini" data-fx="fade">LOKASI = DARATAN</b><b class="new" data-at="s8:perairan" data-fx="plot">+ PERAIRAN</b></div>
  <div class="srcl" data-at="s8:merevisi" data-fx="fade">Sumber: World Nuclear News (19 &amp; 30 Okt 2026), ANTARA (17 Okt 2026), Dunia Energi (31 Okt &amp; 3 Nov 2026), Kompas.id (4 Nov 2026), World Nuclear Association. Kapal, reaktor &amp; rute adalah ilustrasi generik.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 8px 26px rgba(0,0,0,.6))}
.sh{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:26px;letter-spacing:.18em;color:${GOLD};background:rgba(6,19,39,.85);padding:6px 14px;margin-bottom:12px;border-left:4px solid ${GOLD}}
.h0{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:142px;line-height:.92;letter-spacing:-.025em;color:${WH};text-shadow:0 0 26px rgba(79,195,247,.35),0 6px 26px rgba(0,0,0,.9)}
.sub{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:38px;color:${CY};margin-top:14px;background:rgba(6,19,39,.6);display:inline-block;padding:4px 12px}
.rule{position:relative;background:rgba(6,19,39,.88);border:2px solid rgba(240,246,255,.85);padding:10px 18px 12px;margin-top:12px;width:800px;box-sizing:border-box}
.rule:after{content:"";position:absolute;right:-2px;bottom:-2px;width:22px;height:22px;border-left:2px solid rgba(240,246,255,.85);border-top:2px solid rgba(240,246,255,.85)}
.rule b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:46px;line-height:1.08;color:${WH}}
.rule span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:26px;line-height:1.3;color:${CY};margin-top:4px}
.rule.bad{border-color:${RED}}.rule.bad b{color:#FFCDD2}
.rule.cy{border-color:${CY}}.rule.gd{border-color:${GOLD}}.rule.gd span{color:#FFE082}.rule.sea{border-color:#29B6F6}
.n{display:inline-block;font-style:normal;width:50px;height:50px;line-height:48px;text-align:center;font-family:"JetBrains Mono",monospace;font-size:34px;border:3px solid;margin-right:16px;vertical-align:4px}
.n.g{color:${GOLD}}.n.w{color:${WH}}.n.s{color:#29B6F6}
.tb2{display:flex;width:800px;border:2px solid rgba(240,246,255,.85);background:rgba(6,19,39,.88)}
.tb2>div{flex:1;padding:10px 16px}.tb2>div+div{border-left:2px solid rgba(79,195,247,.6)}
.tb2 em{display:block;font-style:normal;font-family:"JetBrains Mono",monospace;font-size:22px;letter-spacing:.14em;color:${MUT}}
.tb2 b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:52px;line-height:1.05;color:${WH}}
.tb2 span{display:block;font-family:"JetBrains Mono",monospace;font-size:24px;color:${CY}}
.big{background:rgba(6,19,39,.88);border:2px solid ${GOLD};padding:10px 18px 12px;margin-top:12px;width:800px;box-sizing:border-box}
.big b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:64px;line-height:1.04;color:${GOLD}}
.big b .ct{display:inline;font:inherit;color:inherit}
.big span{display:block;font-family:"JetBrains Mono",monospace;font-size:26px;color:${WH};margin-top:4px}
.st{margin-top:12px;width:800px}
.st>div{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:27px;color:${WH};background:rgba(6,19,39,.85);padding:8px 14px;margin-top:6px;border-left:3px solid ${RED}}
.st i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${RED};margin-right:12px;box-shadow:0 0 10px ${RED}}
.st b{color:#FFCDD2}
.flow{display:flex;align-items:center;gap:10px;width:820px;margin-top:4px}
.flow b{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:34px;color:${WH};border:2px solid ${WH};padding:8px 12px;background:rgba(6,19,39,.88)}
.flow b.gd{color:${GOLD};border-color:${GOLD}}
.flow i{font-style:normal;font-family:"JetBrains Mono",monospace;font-size:38px;color:${CY}}
.rev{display:flex;flex-direction:column;gap:10px}
.rev b{align-self:flex-start;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:58px;padding:8px 18px;background:rgba(6,19,39,.88)}
.rev .old{color:#FFCDD2;border:2px solid ${RED}}
.rev .new{color:${CY};border:3px solid ${CY};font-size:76px;box-shadow:0 0 24px rgba(79,195,247,.45)}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:21px;line-height:1.35;color:#DCE7F5;margin-top:16px;width:800px;background:rgba(6,19,39,.8);padding:8px 12px}
#hud{position:absolute;right:56px;top:186px;z-index:11;text-align:right;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:21px;letter-spacing:.12em;color:rgba(240,246,255,.7)}
#hud b{display:block;color:${GOLD};font-weight:700}`;

const hudHtml = `<div id="hud"><b id="hudz">TAMPAK ISOMETRI</b><span>AUDIRA &middot; SKALA NTS</span></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "23", sig: "EP23_PLTN_TERAPUNG", chip: "ILUSTRASI", panelTop: 262,
  bg: NAVY, vig: 0.4, grain: 0.04, capfloor: 0.45, html: html + hudHtml, css,
  extraAt: ["s1:Halmahera", "s1:Padahal", "s1:lokasi", "s1:daratan",
    "s2:Oktober", "s2:megawatt",
    "s3:Jantungnya", "s3:menabrak", "s3:terbelah", "s3:menyerap", "s3:stabil",
    "s4:Air", "s4:mendidih", "s4:Panasnya", "s4:uap",
    "s5:daratan", "s5:Listriknya",
    "s6:lautnya", "s6:kembali", "s6:rutinnya",
    "s7:galangan", "s7:ditarik", "s7:tunda", "s7:pertama", "s7:Lomonosov", "s7:Arktik", "s7:2020", "s7:pulang",
    "s8:BAPETEN", "s8:Ikuti"],
  fxExtra: `plot:(e,t)=>{tl.fromTo(e,{opacity:0,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power2.inOut'},t);},`,
  // Pen plotter: the panel is ruled in left-to-right; out: it collapses to one horizontal rule, then the layer switches off.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:1,clipPath:'inset(0% 100% 0% 0%)',x:-18},{clipPath:'inset(0% 0% 0% 0%)',x:0,duration:.55,ease:'power3.inOut'},a-.18);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{scaleY:.03,duration:.22,ease:'power3.in'},b-.36);tl.to(p,{opacity:0,scaleX:1.04,duration:.12,ease:'none'},b-.14);}`,
  hud: `(function(){const z=q('#hudz');const L=[[0,'TAMPAK ISOMETRI'],[K.s2,'DENAH LOKASI'],[K.s3,'SEKSI A\\u2013A \\u00b7 DETAIL A'],[K.s4,'SKEMA SIRKUIT 1\\u20132'],[K.s5,'TURBIN \\u00b7 GENERATOR'],[K.s6,'SIRKUIT 3 \\u00b7 AIR LAUT'],[K.s7,'PETA RUTE'],[K.s8,'TAMPAK ISOMETRI']];let last='';return (t)=>{let k=0;for(let i=0;i<L.length;i++)if(t>=L[i][0])k=i;if(L[k][1]!==last){z.textContent=L[k][1];last=L[k][1];}};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:62px;line-height:1.2;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .14em}`,
// Active word is inked in drafting gold with an underline stroke and a tiny lift.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,boxShadow:"inset 0 0 0 rgba(255,202,40,0)"},{color:"#FFCA28",y:-4,boxShadow:"inset 0 -6px 0 rgba(255,202,40,.85)",duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,boxShadow:"inset 0 0 0 rgba(255,202,40,0)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,clipPath:"inset(0% 100% 0% 0%)"},{opacity:1,clipPath:"inset(0% 0% 0% 0%)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "PLTN Terapung", NAVY);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
