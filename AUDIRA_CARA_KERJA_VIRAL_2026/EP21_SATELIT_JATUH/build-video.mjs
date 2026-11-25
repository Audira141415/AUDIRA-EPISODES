// EP21 SATELIT JATUH. DISASTERSIM look: simulation-lab readout panels (slate plates, thin teal hairline, IBM Plex Mono
// lab labels, heavy Archivo headings, the four-step warning ramp teal/yellow/orange/red-orange as the hazard state).
// Panels arrive like a sample slide pushed into a lab viewer (wipe from the left with a teal scan edge) and leave by
// sliding out to the right through a closing wipe.
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
const TEAL = "#4CC9D9", YEL = "#D9B84A", ORG = "#E07B39", RED = "#E5533D", AMB = "#F2A93B", INK = "#0B1220", SAND = "#E9DCB8", MIST = "#B9C6D6";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st"><i class="dot"></i>REENTRY LAB // SUMATERA UTARA</div>
  <div class="h0">TELESKOP<br>NASA<br><i>TERBAKAR</i></div>
  <div class="tl">di langit Sumatera Utara &middot; <b>hampir 1,5 ton</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st"><i class="dot"></i>4 NOVEMBER &middot; 19.39 WIB</div>
  <div class="card"><b class="mid">SWIFT</b><span>teleskop NASA masuk atmosfer</span></div>
  <div class="ro" data-at="s2:tahun" data-fx="left"><b class="nb">HAMPIR <span class="ct" data-from="0" data-to="22" data-a="s2:tahun" data-d="0.9">0</span> TAHUN</b><span>mengorbit Bumi</span></div>
  <div class="chips"><b data-at="s2:korban" data-fx="pop">TAK ADA LAPORAN KORBAN</b><b class="am" data-at="s2:puing" data-fx="pop">TAK ADA TEMUAN PUING</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st"><i class="dot"></i>CARA ORBIT BEKERJA</div>
  <div class="steps">
    <div data-at="s3:jatuh" data-fx="left"><i class="a">1</i>Satelit terus jatuh</div>
    <div data-at="s3:cepat" data-fx="left"><i>2</i>Begitu cepat, selalu meleset</div>
    <div data-at="s3:udara" data-fx="left"><i class="o">3</i>Sisa udara mencuri kecepatan</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st"><i class="dot"></i>MATAHARI MEMUNCAK</div>
  <div class="card" data-at="s4:mengembang" data-fx="up"><b class="mid">ATMOSFER<br>MENGEMBANG</b><span>udara lebih padat naik ke jalur Swift</span></div>
  <div class="ro bad" data-at="s4:mesin" data-fx="left"><b>TAK PUNYA MESIN</b><span>tak bisa naik lagi</span></div>
  <div class="ro bad" data-at="s4:robot" data-fx="left"><b>ROBOT PENYELAMAT</b><span>gagal mendekat</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st"><i class="dot"></i>ORBIT MENYUSUT</div>
  <div class="alt">
    <div class="ar y" data-at="s5:Oktober" data-fx="left"><em>20 OKTOBER</em><b>275 KM</b><span>misi diakhiri</span></div>
    <div class="ar o" data-at="s5:November" data-fx="left"><em>3 NOVEMBER</em><b>190 KM</b><span>terus turun</span></div>
  </div>
  <div class="ro" data-at="s5:rendah" data-fx="left"><b>MAKIN RENDAH</b><span>udara makin padat &rarr; makin cepat turun</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st"><i class="dot"></i>BATAS 120 KM</div>
  <div class="card" data-at="s6:lajunya" data-fx="up"><b class="big nb"><span class="ct" data-from="0" data-to="28000" data-a="s6:lajunya" data-d="1.2">0</span></b><span>kilometer per jam</span></div>
  <div class="ro hot" data-at="s6:termampatkan" data-fx="left"><b>UDARA TERMAMPATKAN</b><span>di depannya, sampai berpijar</span></div>
  <div class="stamp" data-at="s6:bukan" data-fx="stamp">BUKAN GESEKAN</div>
</div>
<div class="p" data-in="s7" data-out="s7:Risiko">
  <div class="st"><i class="dot"></i>PECAH DI UDARA</div>
  <div class="ro bad" data-at="s7:hancur" data-fx="left"><b>PANEL + ALUMINIUM</b><span>hancur duluan</span></div>
  <div class="ro hot" data-at="s7:Tungsten" data-fx="left"><b>TUNGSTEN + CERMIN</b><span>mungkin bertahan</span></div>
  <div class="ro am" data-at="s7:tenggara" data-fx="left"><b>MELESAT KE TENGGARA</b><span>Selat Karimata &ndash; Kalimantan</span></div>
</div>
<div class="p" data-in="s7:Risiko" data-out="s8">
  <div class="st"><i class="dot"></i>RISIKO MELUKAI ORANG</div>
  <div class="meter">
    <div class="bar"><i class="fill" data-at="s7:Risiko" data-fx="grow"></i></div>
    <div class="mk lim" data-at="s7:ambang" data-fx="fade"><b>1:10.000</b><span>ambang</span></div>
    <div class="mk nasa" data-at="s7:NASA" data-fx="pop"><b>1:2.100</b><span>menurut NASA</span></div>
    <div class="ends"><span>lebih aman</span><span>lebih berisiko</span></div>
  </div>
  <div class="du" data-at="s7:Prakiraan" data-fx="up">
    <div><em>PRAKIRAAN BRIN</em><b>19.42</b></div>
    <div class="ok" data-at="s7:nyatanya" data-fx="pop"><em>NYATANYA</em><b>19.39</b></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="st"><i class="dot"></i>HASIL SIMULASI</div>
  <div class="h1" data-at="s8:Bukan" data-fx="up">BUKAN MENIMPA KOTA</div>
  <div class="tl" data-at="s8:habis" data-fx="left"><b>sebagian besar habis di langit</b></div>
  <div class="srcl" data-at="s8:langit" data-fx="fade">Sumber: NASA Science blog Swift (23 Okt &amp; 4 Nov 2026), ESA Space Debris Office, BRIN via Kompas.id (4&ndash;5 Nov 2026), Spaceflight Now. Satelit, peta &amp; lab 3D adalah ilustrasi; skala tinggi orbit dilebihkan.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 28px rgba(0,0,0,.55))}
.st{display:inline-flex;align-items:center;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:26px;letter-spacing:.2em;color:${TEAL};background:rgba(11,18,32,.84);padding:8px 16px;margin-bottom:14px;border:1px solid rgba(76,201,217,.5)}
.st .dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:${TEAL};margin-right:14px;box-shadow:0 0 10px ${TEAL}}
.h0{font-family:"Archivo",sans-serif;font-weight:900;font-size:128px;line-height:.92;letter-spacing:-.01em;color:#F4F1EA;text-shadow:0 6px 26px rgba(0,0,0,.9)}
.h0 i{font-style:normal;color:${ORG};text-shadow:0 0 30px rgba(229,83,61,.55),0 6px 26px rgba(0,0,0,.9)}
.h1{font-family:"Archivo",sans-serif;font-weight:900;font-size:84px;line-height:1;color:#F4F1EA;background:rgba(11,18,32,.78);display:inline-block;padding:8px 20px 12px;border-left:8px solid ${TEAL}}
.tl{font-family:"Archivo",sans-serif;font-weight:600;font-size:40px;color:${SAND};margin-top:16px;background:rgba(11,18,32,.78);display:inline-block;padding:8px 18px;border-left:5px solid ${RED}}
.tl b{font-weight:800;color:#fff}
.card{background:rgba(14,23,38,.86);border:1px solid rgba(185,198,214,.28);border-radius:8px;padding:14px 22px 16px;width:760px}
.card b{display:block;font-family:"Archivo",sans-serif;font-weight:900;color:#F4F1EA;line-height:.98}
.card b.big{font-size:124px;letter-spacing:-.02em;color:${AMB}}
.card b .ct{display:inline;font:inherit;color:inherit;margin:0;letter-spacing:inherit}
.card b.mid{font-size:80px}
.card span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:27px;color:${MIST};margin-top:8px;letter-spacing:.02em}
.ro{background:rgba(14,23,38,.86);border-radius:6px;border-left:7px solid ${TEAL};padding:10px 18px;margin-top:12px;width:780px}
.ro b{display:block;font-family:"Archivo",sans-serif;font-weight:800;font-size:50px;line-height:1.06;color:#F4F1EA}
.ro span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:26px;line-height:1.3;color:${MIST}}
.ro.bad{border-left-color:${RED}}.ro.hot{border-left-color:${ORG}}.ro.am{border-left-color:${AMB}}
.ro b .ct{display:inline;font:inherit;color:${AMB}}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;width:820px}
.chips b{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:27px;letter-spacing:.06em;color:#0B1220;background:${TEAL};padding:9px 14px;border-radius:4px}
.chips b.am{background:${YEL}}
.steps{width:800px}
.steps>div{font-family:"Archivo",sans-serif;font-weight:700;font-size:42px;color:#F4F1EA;background:rgba(14,23,38,.86);padding:10px 18px;margin-top:10px;border-radius:6px}
.steps i{display:inline-block;font-style:normal;width:52px;height:52px;line-height:52px;text-align:center;background:${TEAL};color:#0B1220;border-radius:6px;margin-right:18px;font-family:"IBM Plex Mono",monospace;font-weight:700}
.steps i.a{background:${AMB}}.steps i.o{background:${ORG}}
.alt{width:800px}
.ar{display:grid;grid-template-columns:250px 1fr;grid-template-rows:auto auto;background:rgba(14,23,38,.86);border-radius:6px;padding:10px 18px;margin-top:10px;border-left:7px solid ${YEL}}
.ar.o{border-left-color:${ORG}}
.ar em{grid-row:1/3;align-self:center;font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:${MIST};letter-spacing:.06em}
.ar b{font-family:"Archivo",sans-serif;font-weight:900;font-size:76px;line-height:1;color:${YEL}}
.ar.o b{color:${ORG}}
.ar span{font-family:"IBM Plex Mono",monospace;font-size:25px;color:${MIST}}
.stamp{display:inline-block;margin-top:18px;font-family:"Archivo",sans-serif;font-weight:900;font-size:56px;color:#fff;background:${RED};padding:8px 24px;border-radius:4px;box-shadow:0 0 30px rgba(229,83,61,.5)}
.meter{position:relative;width:800px;height:250px;background:rgba(14,23,38,.88);border-radius:8px;padding:0;margin-top:4px}
.meter .bar{position:absolute;left:30px;right:30px;top:110px;height:30px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden}
.meter .fill{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,${TEAL} 0%,${TEAL} 30%,${YEL} 45%,${ORG} 70%,${RED} 100%)}
.mk{position:absolute;top:22px;text-align:center;transform:translateX(-50%)}
.mk b{display:block;font-family:"Archivo",sans-serif;font-weight:900;font-size:46px;line-height:1;color:#F4F1EA}
.mk span{display:block;font-family:"IBM Plex Mono",monospace;font-size:22px;color:${MIST}}
.mk:after{content:"";position:absolute;left:50%;top:84px;width:5px;height:58px;margin-left:-2px;background:#fff}
.mk.lim{left:200px}.mk.lim b{color:${TEAL}}
.mk.nasa{left:560px}.mk.nasa b{color:${ORG}}
.ends{position:absolute;left:30px;right:30px;top:160px;display:flex;justify-content:space-between;font-family:"IBM Plex Mono",monospace;font-size:22px;color:${MIST}}
.ends span:last-child{color:#FFC2B5}
.meter .mk{top:20px}
.du{display:flex;gap:12px;width:800px;margin-top:12px}
.du>div{flex:1;background:rgba(14,23,38,.88);padding:12px 18px;border-top:6px solid ${YEL};border-radius:6px}
.du>div.ok{border-top-color:${TEAL}}
.du em{display:block;font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:24px;letter-spacing:.08em;color:${MIST}}
.du b{display:block;font-family:"Archivo",sans-serif;font-weight:900;font-size:84px;line-height:1;color:#F4F1EA}
.du .ok b{color:${TEAL}}
.srcl{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:21px;line-height:1.38;color:#E2E8F0;margin-top:18px;width:820px;background:rgba(11,18,32,.8);padding:10px 14px;border-radius:4px}
#hud{position:absolute;right:56px;top:180px;z-index:11;text-align:right;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:19px;letter-spacing:.12em;color:rgba(244,241,234,.75)}
#hud .rp{display:flex;gap:4px;margin-top:8px;justify-content:flex-end}
#hud .rp i{display:block;width:62px;height:9px;border-radius:2px;opacity:.28}
#hud .rp i:nth-child(1){background:${TEAL}}#hud .rp i:nth-child(2){background:${YEL}}#hud .rp i:nth-child(3){background:${ORG}}#hud .rp i:nth-child(4){background:${RED}}
#hud b{display:block;margin-top:6px;font-weight:700;color:${TEAL}}`;

const hudHtml = `<div id="hud"><span>AUDIRA REENTRY LAB</span><div class="rp"><i id="r0"></i><i id="r1"></i><i id="r2"></i><i id="r3"></i></div><b id="hst">RE-ENTRY</b></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "21", sig: "EP21_SATELIT_JATUH", chip: "ILUSTRASI, BUKAN REKAMAN ASLI", panelTop: 262,
  bg: INK, vig: 0.42, grain: 0.05, capfloor: 0.45, html: html + hudHtml, css,
  extraAt: ["s1:NASA", "s1:terbakar", "s1:jatuh", "s2:Swift", "s2:tahun", "s2:dua", "s2:korban", "s2:puing",
    "s3:jatuh", "s3:cepat", "s3:meleset", "s3:udara", "s3:mencuri",
    "s4:Matahari", "s4:memanas", "s4:mengembang", "s4:padat", "s4:mesin", "s4:robot", "s4:gagal", "s4:mendekat",
    "s5:Oktober", "s5:diakhiri", "s5:November", "s5:rendah",
    "s6:batas", "s6:lajunya", "s6:Udara", "s6:termampatkan", "s6:berpijar", "s6:bukan", "s6:gesekan",
    "s7:Panel", "s7:hancur", "s7:Tungsten", "s7:cermin", "s7:melesat", "s7:tenggara", "s7:Risiko", "s7:NASA", "s7:ambang", "s7:Prakiraan", "s7:nyatanya",
    "s8:Bukan", "s8:habis", "s8:langit"],
  // Sample slide pushed into the lab viewer: wipe in from the left behind a teal scan edge; out: slides right through a closing wipe.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-40,clipPath:'inset(0% 100% 0% 0%)',boxShadow:'inset -6px 0 0 #4CC9D9'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'expo.out'},a-.16);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:46,clipPath:'inset(0% 0% 0% 100%)',duration:.32,ease:'power2.in'},b-.34)`,
  hud: `(function(){const st=q('#hst'),R=[q('#r0'),q('#r1'),q('#r2'),q('#r3')];const L=[[0,3,'RE-ENTRY'],[K.s3,0,'ORBIT STABIL'],[K.s4,1,'ORBIT MENURUN'],[K.s5,2,'KRITIS'],[K.s6,3,'RE-ENTRY']];const C=['#4CC9D9','#D9B84A','#E07B39','#E5533D'];let last=-1;return (t)=>{let k=0;for(let i=0;i<L.length;i++)if(t>=L[i][0])k=i;if(k!==last){R.forEach((e,i)=>{e.style.opacity=i===L[k][1]?1:.28;e.style.boxShadow=i===L[k][1]?'0 0 12px '+C[i]:'none';});st.textContent=L[k][2];st.style.color=C[L[k][1]];last=k;}};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Archivo",sans-serif;font-weight:800;font-size:62px;line-height:1.18;color:#F4F1EA;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .14em}`,
// Active word reads like a lab readout going live: warm amber with an underline bar and a small lift.
(id, w) => `tl.fromTo("#${id}",{color:"#F4F1EA",y:0,boxShadow:"inset 0 -0px 0 #F2A93B"},{color:"#FFC56A",y:-5,boxShadow:"inset 0 -7px 0 #E07B39",duration:.08,ease:"back.out(2.5)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4F1EA",y:0,boxShadow:"inset 0 -0px 0 #F2A93B",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,x:-18},{opacity:1,x:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Satelit Jatuh", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
