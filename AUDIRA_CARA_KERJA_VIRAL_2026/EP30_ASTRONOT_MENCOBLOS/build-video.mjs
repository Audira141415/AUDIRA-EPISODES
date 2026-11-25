// EP30 ASTRONOT MENCOBLOS. PAPERWORLD panels: cream cardstock cards with a pale cut edge and a soft paper shadow,
// Fraunces italic headlines (the cover's storybook serif), Nunito body, coral / cobalt / gold paper tabs.
// Panels HANG IN from a crease at their top edge (fold down from -95 deg, small swing settle, like a hanging paper card)
// and leave by being LIFTED away (up and to the left with a slight tilt). Captions flutter in like a slip of paper.
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
  const lone = groups.filter((g) => g.length < 2);
  if (lone.length) console.log("WARNING lone caption words:", lone.length, lone.map((g) => g[0].text).join(" "));
  return groups.length;
}

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#3b2a22", CREAM = "#faf4e8", IVORY = "#f3ead9", CORAL = "#e3806a", COBALT = "#5f7cb6", GOLD = "#e7b54a", GOLDL = "#f2d58e", MINT = "#9dd1bb", WAX = "#b5382f";
const dd = (a, b) => Math.max(0.4, at(b) - at(a)).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">CARA KERJA VIRAL &middot; EP 30</div>
  <div class="h0"><span>Bilik suara</span><span class="ln2">paling jauh</span></div>
  <div class="row"><i class="tab gold nb" data-at="s1:400" data-fx="pop">400 km</i><i class="plain" data-at="s1:kepala" data-fx="left">di atas kepala kita</i></div>
  <div class="q" data-at="s1:pulang" data-fx="up">Bagaimana surat suaranya pulang?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick">3 NOVEMBER &middot; PEMILU SELA AMERIKA SERIKAT</div>
  <div class="cd"><b class="big" data-at="s2:Tiga" data-fx="pop">3 astronaut NASA</b><span data-at="s2:Stasiun" data-fx="fade">di Stasiun Luar Angkasa Internasional</span></div>
  <div class="stamp" data-at="s2:kabin" data-fx="stamp">bilik suara = kabin tidur</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">1 &middot; DIMULAI DARI BUMI</div>
  <div class="cd" data-at="s3:meminta" data-fx="up"><b>Minta surat suara</b><span>sebelum terbang, seperti warga Amerika di luar negeri</span></div>
  <div class="cd cob" data-at="s3:Bab" data-fx="up"><b>Bab 106 UU Pemilu Texas</b><span>tempat kebanyakan astronaut terdaftar</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">2 &middot; NAIK KE ORBIT</div>
  <div class="steps">
    <div data-at="s4:menyiapkan" data-fx="left"><i>a</i>Petugas pemilu: surat suara elektronik terenkripsi</div>
    <div data-at="s4:Mission" data-fx="left"><i class="c">b</i>Mission Control Houston kirim ke stasiun</div>
    <div data-at="s4:kunci" data-fx="left"><i class="g">c</i>Kunci akses khusus tiap astronaut</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">3 &middot; JALUR PULANG</div>
  <div class="route">
    <b data-at="s5:Jalur" data-fx="pop">Stasiun</b><em data-at="s5:naik" data-fx="fade">&rarr;</em>
    <b class="g" data-at="s5:TDRS" data-fx="pop">Satelit relay TDRS</b><em data-at="s5:turun" data-fx="fade">&rarr;</em>
    <b class="s" data-at="s5:White" data-fx="pop">White Sands, New Mexico</b><em data-at="s5:lewat" data-fx="fade">&rarr;</em>
    <b class="c" data-at="s5:lewat" data-fx="pop">Mission Control</b><em data-at="s5:petugas" data-fx="fade">&rarr;</em>
    <b class="r" data-at="s5:petugas" data-fx="pop">Petugas pemilu</b>
  </div>
  <div class="note" data-at="s5:Jalur" data-fx="fade">jalur yang biasa dijelaskan NASA</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">KENAPA MEMUTAR?</div>
  <div class="two">
    <div data-at="s6:melaju" data-fx="up"><em>Stasiun melaju</em><b class="nb"><span class="ct" data-from="0" data-to="28000" data-a="s6:melaju" data-d="${dd("s6:melaju", "s6:28.000")}">0</span> km/jam</b><span data-at="s6:antena" data-fx="fade">antena darat: beberapa menit</span></div>
    <div class="cob" data-at="s6:Satelit" data-fx="up"><em>Satelit relay</em><b class="nb">hampir 36.000 km</b><span data-at="s6:selalu" data-fx="fade">hampir selalu melihat stasiun</span></div>
  </div>
  <div class="note" data-at="s6:Satelit" data-fx="fade">ilustrasi, skala jarak tidak sebenarnya</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">TOTAL PERJALANAN</div>
  <div class="row"><i class="plain sm">kira-kira</i><b class="huge nb"><span class="ct" data-from="0" data-to="72000" data-a="s7:Total" data-d="${dd("s7:Total", "s7:72.000")}">0</span> km</b></div>
  <div class="row"><i class="tab gold" data-at="s7:seperempat" data-fx="pop">&plusmn; seperempat detik</i><i class="tab wax" data-at="s7:terkunci" data-fx="stamp">TERKUNCI</i></div>
  <div class="note" data-at="s7:hanya" data-fx="fade">hanya astronaut &amp; petugas pemilu yang bisa membukanya</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm"><span>Sejauh apa pun</span><span class="ln2">prosesnya sama</span></div>
  <div class="row chips"><i class="tab" data-at="s8:minta" data-fx="pop">minta</i><i class="tab cob" data-at="s8:isi" data-fx="pop">isi</i><i class="tab gold" data-at="s8:kirim" data-fx="pop">kirim</i><i class="tab wax" data-at="s8:rahasia" data-fx="pop">rahasia</i></div>
  <div class="srcl" data-at="s8:Ikuti" data-fx="fade">Sumber: NASA (2020, 2024), Texas Election Code Bab 106, Space.com &amp; TIME (3 Nov 2026). Jalur data: cara yang biasa dijelaskan NASA; jarak &amp; waktu perkiraan. Stasiun, astronaut &amp; lokasi: ilustrasi kertas generik.</div>
</div>`;

const card = `background:${CREAM};border-radius:6px;box-shadow:0 2px 0 #e5d8c1,0 3px 0 #d8c7a9,0 14px 22px rgba(40,25,15,.32)`;
const css = `
.p{transform-origin:50% 0%}
.kick{display:inline-block;font-family:"Nunito",sans-serif;font-weight:900;font-size:27px;letter-spacing:.12em;color:#fff;background:${CORAL};padding:7px 18px 6px;border-radius:4px;box-shadow:0 3px 0 #c4614f,0 8px 14px rgba(40,25,15,.3);margin-bottom:16px}
.h0{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.h0 span{font-family:"Fraunces",serif;font-style:italic;font-weight:700;font-size:104px;line-height:1.02;color:${INK};padding:6px 30px 14px;${card};transform:rotate(-1.2deg)}
.h0 .ln2{margin-left:70px;transform:rotate(1deg);background:${GOLDL}}
.h0.sm span{font-size:84px}
.row{display:flex;align-items:center;gap:16px;margin-top:20px;flex-wrap:wrap;width:900px}
.tab{font-style:normal;font-family:"Nunito",sans-serif;font-weight:900;font-size:46px;color:${INK};background:${CREAM};padding:6px 22px 8px;border-radius:5px;box-shadow:0 3px 0 #d8c7a9,0 10px 16px rgba(40,25,15,.3)}
.tab.gold{background:${GOLD}}.tab.cob{background:${COBALT};color:#fff;box-shadow:0 3px 0 #435e95,0 10px 16px rgba(40,25,15,.3)}.tab.wax{background:${WAX};color:#fff;box-shadow:0 3px 0 #7d1f19,0 10px 16px rgba(40,25,15,.3)}
.plain{font-style:normal;font-family:"Nunito",sans-serif;font-weight:800;font-size:44px;color:#fff;text-shadow:0 3px 8px rgba(20,15,35,.8)}
.plain.sm{font-size:38px}
.q{display:inline-block;margin-top:20px;font-family:"Fraunces",serif;font-style:italic;font-weight:600;font-size:48px;color:${INK};padding:8px 24px 12px;${card};background:${MINT};transform:rotate(-.8deg)}
.cd{width:860px;margin-top:16px;padding:14px 26px 18px;${card}}
.cd.cob{background:#dfe6f4}
.cd b{display:block;font-family:"Fraunces",serif;font-style:italic;font-weight:700;font-size:56px;line-height:1.08;color:${INK}}
.cd b.big{font-size:76px}
.cd span{display:block;font-family:"Nunito",sans-serif;font-weight:700;font-size:33px;line-height:1.25;color:#5a4636;margin-top:6px}
.stamp{display:inline-block;margin-top:20px;font-family:"Nunito",sans-serif;font-weight:900;font-size:46px;letter-spacing:.02em;color:#fff;background:${WAX};padding:8px 26px 10px;border-radius:50px;box-shadow:0 4px 0 #7d1f19,0 10px 16px rgba(40,25,15,.35)}
.steps{width:880px}
.steps>div{display:flex;align-items:center;font-family:"Nunito",sans-serif;font-weight:800;font-size:38px;line-height:1.2;color:${INK};padding:12px 18px;margin-top:12px;${card}}
.steps i{flex:none;font-style:normal;width:58px;height:58px;line-height:56px;text-align:center;border-radius:50%;background:${CORAL};color:#fff;font-family:"Fraunces",serif;font-weight:700;font-size:38px;margin-right:16px}
.steps i.c{background:${COBALT}}.steps i.g{background:${GOLD};color:${INK}}
.route{display:flex;flex-wrap:wrap;align-items:center;gap:10px 8px;width:900px}
.route b{font-family:"Nunito",sans-serif;font-weight:900;font-size:36px;color:${INK};padding:8px 18px 10px;${card}}
.route b.g{background:${GOLDL}}.route b.s{background:#ead2a0}.route b.c{background:#dfe6f4}.route b.r{background:${CORAL};color:#fff}
.route em{font-style:normal;font-family:"Nunito",sans-serif;font-weight:900;font-size:40px;color:#fff;text-shadow:0 2px 6px rgba(20,15,35,.8)}
.note{display:inline-block;margin-top:14px;font-family:"Fraunces",serif;font-style:italic;font-weight:500;font-size:30px;color:#fff;background:rgba(38,50,90,.72);padding:5px 16px;border-radius:4px}
.two{display:flex;gap:16px;width:900px}
.two>div{flex:1;padding:12px 18px 14px;${card}}
.two>div.cob{background:#dfe6f4}
.two em{display:block;font-style:normal;font-family:"Nunito",sans-serif;font-weight:800;font-size:28px;color:#7d5843}
.two b{display:block;font-family:"Fraunces",serif;font-style:italic;font-weight:700;font-size:50px;line-height:1.05;color:${INK};margin-top:2px}
.two b .ct{font:inherit;color:inherit}
.two span{display:block;font-family:"Nunito",sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:#5a4636;margin-top:6px}
.huge{font-family:"Fraunces",serif;font-style:italic;font-weight:800;font-size:128px;line-height:1;color:${INK};padding:4px 28px 14px;${card};background:${GOLDL}}
.huge .ct{font:inherit;color:inherit}
.chips .tab{font-size:50px}
.srcl{font-family:"Nunito",sans-serif;font-weight:600;font-size:24px;line-height:1.3;color:${INK};margin-top:22px;width:860px;padding:10px 16px;${card}}
#chip{font-family:"Nunito",sans-serif!important;font-weight:800!important;color:${INK}!important;background:${CREAM};padding:4px 12px;border-radius:4px;opacity:.92!important;box-shadow:0 3px 8px rgba(20,15,35,.35)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "30", sig: "EP30_ASTRONOT_MENCOBLOS", chip: "ILUSTRASI, BUKAN REKAMAN ASLI", panelTop: 262,
  bg: "#1c2547", vig: 0.4, grain: 0.06, capfloor: 0.42, html, css,
  extraAt: ["s1:400", "s1:kepala", "s1:pulang", "s2:Tiga", "s2:Stasiun", "s2:memilih", "s2:kabin",
    "s3:Dimulai", "s3:terbang", "s3:meminta", "s3:warga", "s3:Bab", "s3:Texas", "s3:terdaftar",
    "s4:menyiapkan", "s4:terenkripsi", "s4:Mission", "s4:Houston", "s4:mengirimnya", "s4:stasiun", "s4:kunci",
    "s5:mengisinya", "s5:Jalur", "s5:naik", "s5:TDRS", "s5:turun", "s5:White", "s5:Mexico", "s5:lewat", "s5:Mission", "s5:petugas",
    "s6:memutar", "s6:melaju", "s6:28.000", "s6:antena", "s6:menit", "s6:Satelit", "s6:geostasioner", "s6:selalu", "s6:melihatnya#2",
    "s7:Total", "s7:72.000", "s7:seperempat", "s7:Isinya", "s7:terkunci", "s7:hanya", "s7:petugas", "s7:membukanya",
    "s8:Sejauh", "s8:minta", "s8:isi", "s8:kirim", "s8:rahasia", "s8:Ikuti"],
  // Hanging card: unfolds down from the crease at its top edge, small swing settle.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,rotationX:-95,y:-30,transformPerspective:1600,transformOrigin:'50% 0%'},{opacity:1,rotationX:0,y:0,duration:.55,ease:'back.out(1.5)'},a-.16);}`,
  // Lifted away: up and to the left with a slight tilt, as if a hand picks the card off the diorama.
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-120,x:-50,rotation:-5,duration:.34,ease:'power2.in'},b-.34)`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px;perspective:900px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Nunito",sans-serif;font-weight:900;font-size:70px;line-height:1.14;color:#fff;transform-origin:50% 0%;text-shadow:0 3px 0 #3b2a22,0 -2px 0 #3b2a22,3px 0 0 #3b2a22,-3px 0 0 #3b2a22,2px 3px 0 #3b2a22,-2px 3px 0 #3b2a22,0 8px 16px rgba(10,8,25,.6)}
.w{display:inline-block;margin:0 .14em}`,
// Active word: turns gold paper and lifts a little.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,scale:1},{color:"#F2D58E",y:-6,scale:1.07,duration:.08,ease:"back.out(3)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,scale:1,duration:.16},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,rotationX:-55,y:-14},{opacity:1,rotationX:0,y:0,duration:.24,ease:"back.out(1.8)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Astronot Mencoblos", "#1c2547");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
