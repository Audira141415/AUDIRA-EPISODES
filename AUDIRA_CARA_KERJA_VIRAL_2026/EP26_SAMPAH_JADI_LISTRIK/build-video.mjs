// EP26 SAMPAH JADI LISTRIK. CLAYWORLD panels: chunky plasticine slabs (mustard, teal, terracotta, cream) with soft
// rolled edges, an inner highlight and a pressed-down shadow, Baloo 2 lettering, little clay "beads" for steps.
// Panels PLOP in like a lump of dough dropped on the table (squashed wide, then springs up) and leave by being
// squashed flat into the table.
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
const BR = "#3B2A20", CREAM = "#F6EFE3", MUS = "#E8A838", TEAL = "#3B828A", TER = "#D95A3D", COR = "#E26D6A", LEAF = "#6FAE4A";
const dd = (a, b) => Math.max(0.4, at(b) - at(a)).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">CARA KERJA VIRAL &middot; EP 26</div>
  <div class="ttl"><span class="a">SAMPAH</span><span class="b">JADI LISTRIK</span></div>
  <div class="row">
    <div class="slab mus" data-at="s1:ton" data-fx="pop"><b class="nb">1.100 TON</b><span>sampah diangkut truk tiap hari</span></div>
    <div class="slab ter" data-at="s1:tungku" data-fx="pop"><b class="nb">850&deg;C</b><span>suhu tungku</span></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick">4 NOVEMBER 2026 &middot; PALEMBANG</div>
  <div class="slab cream wide" data-at="s2:PSEL" data-fx="pop"><b>PSEL KERAMASAN</b><span>pengolahan sampah jadi listrik</span></div>
  <div class="slab teal wide" data-at="s2:mengalirkan" data-fx="up"><b class="big nb"><span class="ct" data-from="0" data-to="18.6" data-dec="1" data-a="s2:mengalirkan" data-d="${dd("s2:mengalirkan", "s2:18,6")}">0</span> MW</b><span>mengalir ke PLN saat uji coba</span></div>
  <div class="pill mus" data-at="s2:Peresmian" data-fx="pop">Peresmian direncanakan 8 Desember</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">LANGKAH 1 &middot; BUNKER</div>
  <div class="steps">
    <div data-at="s3:menumpahkan" data-fx="left"><i>1</i>Truk menumpahkan sampah</div>
    <div data-at="s3:diperam" data-fx="left"><i class="t">2</i>Diperam <em>5&ndash;7 hari</em></div>
    <div data-at="s3:Airnya" data-fx="left"><i class="c">3</i>Air menetes, sampah kering</div>
    <div data-at="s3:Capit" data-fx="left"><i class="g">4</i>Capit angkat ke corong</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">LANGKAH 2 &middot; JERUJI BERGERAK</div>
  <div class="slab cream wide" data-at="s4:jeruji" data-fx="pop"><b>Jeruji miring terus bergeser</b><span>sampah turun perlahan, udara ditiup dari bawah</span></div>
  <div class="zones">
    <div class="z1" data-at="s4:atas" data-fx="up"><b>ATAS</b><span>mengering</span></div>
    <div class="z2" data-at="s4:tengah" data-fx="up"><b>TENGAH</b><span>menyala</span></div>
    <div class="z3" data-at="s4:ujung" data-fx="up"><b>UJUNG</b><span>tinggal abu</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">LANGKAH 3 &middot; UAP JADI LISTRIK</div>
  <div class="chain">
    <b class="c1" data-at="s5:merebus" data-fx="pop">AIR</b><i data-at="s5:uap" data-fx="fade">&rarr;</i>
    <b class="c2" data-at="s5:uap" data-fx="pop">UAP</b><i data-at="s5:turbin" data-fx="fade">&rarr;</i>
    <b class="c3" data-at="s5:turbin" data-fx="pop">TURBIN</b><i data-at="s5:generator" data-fx="fade">&rarr;</i>
    <b class="c4" data-at="s5:generator" data-fx="pop">GENERATOR</b>
  </div>
  <div class="row">
    <div class="slab mus" data-at="s5:Kapasitasnya" data-fx="up"><b class="nb">20 MW</b><span>kapasitas</span></div>
    <div class="slab teal" data-at="s5:dijual" data-fx="up"><b class="nb">17,7 MW</b><span>dijual ke PLN</span></div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">KENAPA HARUS SEPANAS ITU?</div>
  <div class="slab ter wide" data-at="s6:850" data-fx="pop"><b class="big nb">&ge; 850&deg;C</b><span>gas panas bertahan minimal 2 detik</span></div>
  <div class="stamp" data-at="s6:dioksin" data-fx="stamp">DIOKSIN DIPECAH</div>
  <div class="row tight">
    <div class="pill cream" data-at="s6:kapur" data-fx="pop">kapur</div>
    <div class="pill dark" data-at="s6:karbon" data-fx="pop">karbon aktif</div>
    <div class="pill sky" data-at="s6:kantong" data-fx="pop">kantong filter</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">HASILNYA</div>
  <div class="slab mus wide" data-at="s7:Pabriknya" data-fx="pop"><b class="big nb"><span class="ct" data-from="0" data-to="1000" data-a="s7:Pabriknya" data-d="${dd("s7:Pabriknya", "s7:1.000")}">0</span> TON</b><span>sampah sehari, kapasitas rancangan</span></div>
  <div class="slab cream wide" data-at="s7:setara" data-fx="up"><b>&asymp; listrik belasan ribu rumah</b></div>
  <div class="stamp grey" data-at="s7:Abunya" data-fx="stamp">ABU TETAP HARUS DITANGANI</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="ttl sm"><span class="a">DULU DITIMBUN</span><span class="b" data-at="s8:kini" data-fx="pop">KINI MENYALAKAN KOTA</span></div>
  <div class="srcl" data-at="s8:kota" data-fx="fade">Sumber: Pemkot Palembang, Kemenko Pangan, PLN, ANTARA, Kompas (4&ndash;6 Nov 2026); aturan 850&deg;C/2 detik: standar emisi insinerator (EU IED). Masih uji coba; peresmian direncanakan 8 Des 2026. Pabrik 3D adalah ilustrasi.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 14px rgba(40,22,12,.35))}
.kick{display:inline-block;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:31px;letter-spacing:.06em;color:${CREAM};background:${TEAL};padding:4px 22px 0;border-radius:999px;box-shadow:inset 0 5px 0 rgba(255,255,255,.22),inset 0 -6px 0 rgba(0,0,0,.18),0 7px 0 #24575d;margin-bottom:16px}
.ttl{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.ttl span{font-family:"Baloo 2",sans-serif;font-weight:800;line-height:.95;padding:14px 32px 2px;border-radius:44px;box-shadow:inset 0 8px 0 rgba(255,255,255,.3),inset 0 -10px 0 rgba(0,0,0,.16),0 12px 0 rgba(70,35,20,.55)}
.ttl .a{font-size:128px;color:${BR};background:${MUS};transform:rotate(-2deg)}
.ttl .b{font-size:104px;color:${CREAM};background:${TER};transform:rotate(1.5deg);margin-left:40px}
.ttl.sm .a{font-size:88px}.ttl.sm .b{font-size:80px;background:${LEAF};margin-left:20px}
.row{display:flex;gap:18px;margin-top:22px;width:900px;flex-wrap:wrap}
.row.tight{gap:12px;margin-top:16px}
.slab{border-radius:34px;padding:12px 26px 14px;box-shadow:inset 0 7px 0 rgba(255,255,255,.3),inset 0 -9px 0 rgba(0,0,0,.14),0 10px 0 rgba(70,35,20,.5);margin-top:16px}
.row .slab{margin-top:0}
.slab.wide{width:760px}
.slab b{display:block;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:52px;line-height:1.05;color:${BR}}
.slab b.big{font-size:118px;line-height:.95}
.slab b .ct{display:inline;font:inherit;color:inherit}
.slab span{display:block;font-family:"Nunito",sans-serif;font-weight:700;font-size:31px;line-height:1.2;color:#5a4334;margin-top:2px}
.slab.mus{background:${MUS}}.slab.ter{background:${TER}}.slab.ter b,.slab.ter span{color:${CREAM}}
.slab.teal{background:${TEAL}}.slab.teal b,.slab.teal span{color:${CREAM}}
.slab.cream{background:${CREAM}}
.pill{display:inline-block;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:40px;color:${BR};padding:8px 26px 2px;border-radius:999px;box-shadow:inset 0 5px 0 rgba(255,255,255,.3),inset 0 -6px 0 rgba(0,0,0,.15),0 8px 0 rgba(70,35,20,.5);margin-top:18px}
.pill.mus{background:${MUS}}.pill.cream{background:${CREAM}}.pill.dark{background:#3a3330;color:${CREAM}}.pill.sky{background:#7fc8ff}
.steps{width:820px}
.steps>div{display:flex;align-items:center;font-family:"Baloo 2",sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:${BR};background:${CREAM};border-radius:30px;padding:10px 22px 6px 12px;margin-top:12px;box-shadow:inset 0 5px 0 rgba(255,255,255,.5),inset 0 -7px 0 rgba(0,0,0,.1),0 8px 0 rgba(70,35,20,.45)}
.steps i{flex:none;font-style:normal;width:62px;height:62px;line-height:70px;text-align:center;border-radius:50%;margin-right:18px;background:${COR};color:#fff;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:42px;box-shadow:inset 0 4px 0 rgba(255,255,255,.35),inset 0 -5px 0 rgba(0,0,0,.2)}
.steps i.t{background:${TEAL}}.steps i.c{background:#4f97d9}.steps i.g{background:${MUS};color:${BR}}
.steps em{font-style:normal;color:${TER};margin-left:10px}
.zones{display:flex;gap:14px;margin-top:20px;width:840px}
.zones>div{flex:1;border-radius:30px;padding:10px 16px 12px;text-align:center;box-shadow:inset 0 6px 0 rgba(255,255,255,.3),inset 0 -8px 0 rgba(0,0,0,.16),0 9px 0 rgba(70,35,20,.5)}
.zones b{display:block;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:46px;line-height:1.05}
.zones span{display:block;font-family:"Nunito",sans-serif;font-weight:800;font-size:30px}
.z1{background:${MUS};color:${BR}}.z2{background:#ff7a2e;color:#fff}.z3{background:#b9b2a6;color:${BR}}
.chain{display:flex;align-items:center;flex-wrap:wrap;gap:10px;width:900px}
.chain b{font-family:"Baloo 2",sans-serif;font-weight:800;font-size:44px;padding:8px 22px 2px;border-radius:26px;color:${BR};box-shadow:inset 0 5px 0 rgba(255,255,255,.35),inset 0 -6px 0 rgba(0,0,0,.15),0 8px 0 rgba(70,35,20,.5)}
.chain .c1{background:#7fc8ff}.chain .c2{background:${CREAM}}.chain .c3{background:${MUS}}.chain .c4{background:${LEAF}}
.chain i{font-style:normal;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:50px;color:${CREAM};text-shadow:0 4px 0 rgba(70,35,20,.6)}
.stamp{display:inline-block;margin-top:20px;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:56px;letter-spacing:.02em;color:${CREAM};background:${LEAF};padding:8px 30px 0;border-radius:24px;box-shadow:inset 0 6px 0 rgba(255,255,255,.3),inset 0 -8px 0 rgba(0,0,0,.18),0 10px 0 rgba(40,60,20,.55)}
.stamp.grey{background:#8a8279}
.srcl{font-family:"Nunito",sans-serif;font-weight:700;font-size:25px;line-height:1.3;color:${BR};margin-top:24px;width:820px;background:${CREAM};border-radius:22px;padding:12px 18px;box-shadow:0 6px 0 rgba(70,35,20,.4)}
#chip{color:${CREAM}!important;background:rgba(59,42,32,.75);border-radius:999px;padding:4px 14px;opacity:.95!important;font-family:"Nunito",sans-serif!important;font-weight:800!important;font-size:21px!important}
#hud{position:absolute;right:56px;top:190px;z-index:11;display:flex;gap:9px}
#hud i{display:block;width:22px;height:22px;border-radius:50%;background:rgba(246,239,227,.35);box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
#hud i.on{background:${MUS}}#hud i.now{background:${TER};transform:scale(1.35)}`;

const hudHtml = `<div id="hud">${Array.from({ length: 8 }, (_, i) => `<i id="hd${i}"></i>`).join("")}</div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "26", sig: "EP26_SAMPAH_JADI_LISTRIK", chip: "ILUSTRASI", panelTop: 262,
  bg: "#2a201b", vig: 0.38, grain: 0.06, capfloor: 0.34, html: html + hudHtml, css,
  extraAt: ["s1:truk", "s1:Desember", "s1:dibakar", "s1:tungku", "s1:listrik",
    "s2:PSEL", "s2:uji", "s2:mengalirkan", "s2:PLN", "s2:Peresmian",
    "s3:Truk", "s3:menumpahkan", "s3:bunker", "s3:diperam", "s3:hari", "s3:Airnya", "s3:kering", "s3:Capit", "s3:mengangkatnya", "s3:corong",
    "s4:jeruji", "s4:bergeser", "s4:Udara", "s4:atas", "s4:tengah", "s4:ujung", "s4:abu",
    "s5:merebus", "s5:uap", "s5:turbin", "s5:generator", "s5:Kapasitasnya", "s5:dijual",
    "s6:Kenapa", "s6:gas", "s6:850", "s6:detik", "s6:dioksin", "s6:Asapnya", "s6:kapur", "s6:karbon", "s6:kantong",
    "s2:18,6", "s7:1.000", "s7:Pabriknya", "s7:setara", "s7:rumah", "s7:Tapi", "s7:Abunya",
    "s8:ditimbun", "s8:menyalakan", "s8:Ikuti"],
  // Dough plop: lands squashed wide from above, springs up to shape.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scaleX:1.28,scaleY:.3,y:-70,transformOrigin:'50% 100%'},{opacity:1,scaleX:1,scaleY:1,y:0,duration:.62,ease:'elastic.out(1,.55)'},a-.12);}`,
  // Pressed flat into the table.
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,scaleY:.12,scaleX:1.18,y:46,transformOrigin:'50% 100%',duration:.3,ease:'power2.in'},b-.3)`,
  hud: `(function(){const S=[K.s1,K.s2,K.s3,K.s4,K.s5,K.s6,K.s7,K.s8];const d=[...Array(8)].map((_,i)=>q('#hd'+i));let last=-1;return (t)=>{let k=0;for(let i=0;i<8;i++)if(t>=S[i]-.05)k=i;if(k!==last){d.forEach((e,i)=>{e.className=i<k?'on':i===k?'now':'';});last=k;}q('#hud').style.visibility=t>=OUT?'hidden':'visible';};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Baloo 2",sans-serif;font-weight:800;font-size:76px;line-height:1.08;color:#FFF6E6;text-shadow:0 6px 0 #3B2A20,4px 0 0 #3B2A20,-4px 0 0 #3B2A20,0 -4px 0 #3B2A20,3px 3px 0 #3B2A20,-3px 3px 0 #3B2A20,3px -3px 0 #3B2A20,-3px -3px 0 #3B2A20,0 10px 14px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .2em;transform-origin:50% 100%}`,
// Active word: turns mustard and squashes like pressed clay, then springs back.
(id, w) => `tl.fromTo("#${id}",{color:"#FFF6E6",scaleX:1,scaleY:1},{color:"#FFC94A",scaleX:1.05,scaleY:.9,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{scaleX:1,scaleY:1,duration:.22,ease:"elastic.out(1,.5)"},${(w.start + 0.08).toFixed(3)});tl.to("#${id}",{color:"#FFF6E6",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,scaleY:.5,y:20},{opacity:1,scaleY:1,y:0,duration:.24,ease:"back.out(2.2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sampah Jadi Listrik", "#2a201b");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
