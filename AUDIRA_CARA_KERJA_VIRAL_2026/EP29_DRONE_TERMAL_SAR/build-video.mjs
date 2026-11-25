// EP29 DRONE TERMAL SAR. THERMALFORGE panels: instrument read-outs on a cold-black glass with a thin ironbow edge,
// Space Grotesk numerals, JetBrains Mono labels in flir amber, hud cyan accents. Panels HEAT UP into view (a scan line
// reveals them top-down while they go from a blurred violet ghost to sharp) and COOL DOWN out (they sink, blur and
// fade to violet). A right-edge ironbow scale and a mode tag (CAHAYA / TERMAL) form the camera HUD.
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
const BK = "#0A0A10", VI = "#310E68", MG = "#9B1D8C", AM = "#EA5E28", YE = "#F7D038", CY = "#00E5FF";
const dd = (a, b) => Math.max(0.4, at(b) - at(a)).toFixed(2);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2:gabungan">
  <div class="kick">CARA KERJA VIRAL &middot; EP 29</div>
  <div class="h0"><span>DRONE TERMAL</span><span class="hot">MELIHAT PANAS</span></div>
  <div class="sub">lereng Semeru yang sedang erupsi</div>
  <div class="tag" data-at="s1:panas" data-fx="heat">BUKAN CAHAYA, TAPI PANAS</div>
</div>
<div class="p" data-in="s2:gabungan" data-out="s3">
  <div class="kick">PENCARIAN DI SEMERU</div>
  <div class="tl">
    <div data-at="s2:November" data-fx="left"><b class="nb">2 NOV</b><span>kabar terakhir dua pendaki muda</span></div>
    <div data-at="s2:dimulai" data-fx="left"><b class="nb">7 NOV</b><span>pencarian dimulai</span></div>
    <div data-at="s2:ketiga" data-fx="left"><b class="nb">HARI KE-3</b><span><em class="nb"><span class="ct" data-from="0" data-to="106" data-a="s2:ketiga" data-d="${dd("s2:ketiga", "s2:personel")}">0</span></em> personel, 6 regu</span></div>
  </div>
  <div class="regu"><i data-at="s2:regu" data-fx="pop"></i><i data-at="s2:regu+0.1" data-fx="pop"></i><i data-at="s2:regu+0.2" data-fx="pop"></i><i data-at="s2:regu+0.3" data-fx="pop"></i><i data-at="s2:regu+0.4" data-fx="pop"></i><i class="dr" data-at="s2:menerbangkan" data-fx="pop">DRONE</i></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">SEMUA BENDA MEMANCARKAN INFRAMERAH</div>
  <div class="spec" data-at="s3:Tubuh" data-fx="heat">
    <div class="axis"><i class="vis"></i><i class="win"></i><i class="pk"></i></div>
    <div class="lb"><span class="l1">cahaya tampak</span><span class="l2">TUBUH &asymp; 9,5 &micro;m</span></div>
    <div class="cap2">panjang gelombang &rarr;</div>
  </div>
  <div class="duo">
    <div class="no" data-at="s3:Kaca" data-fx="up"><b>KACA</b><span>menghalangi inframerah</span></div>
    <div class="ok" data-at="s3:germanium" data-fx="up"><b>GERMANIUM</b><span>bahan lensa termal</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kick">DI BALIK LENSA</div>
  <div class="h0 sm"><span>MIKROBOLOMETER</span></div>
  <div class="sub" data-at="s4:ratusan" data-fx="up">ratusan ribu piksel mungil</div>
  <div class="steps">
    <div data-at="s4:menghangatkan" data-fx="left"><i>1</i>inframerah menghangatkan piksel</div>
    <div data-at="s4:hambatan" data-fx="left"><i>2</i>hambatan listrik berubah <u class="rbar"><s data-at="s4:berubah" data-fx="shrink"></s></u></div>
    <div data-at="s4:Chip" data-fx="left"><i>3</i>dibaca puluhan kali per detik</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">SUHU JADI WARNA</div>
  <div class="grad" data-at="s5:warna" data-fx="grow"></div>
  <div class="gl"><span data-at="s5:dingin" data-fx="up">dingin: gelap</span><span data-at="s5:jingga" data-fx="up">hangat: jingga</span><span data-at="s5:putih" data-fx="up">terpanas: putih</span></div>
  <div class="big" data-at="s5:membedakan" data-fx="heat"><b class="nb">0,05&deg;C</b><span>selisih yang bisa dibedakan kamera yang baik</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kick">YANG DILIHAT: BEDA SUHU</div>
  <div class="sub">tidak tembus:</div>
  <div class="chips"><i data-at="s6:daun" data-fx="pop">DAUN</i><i data-at="s6:batu" data-fx="pop">BATU</i><i data-at="s6:kaca" data-fx="pop">KACA</i><i data-at="s6:air" data-fx="pop">AIR</i></div>
  <div class="tag rd" data-at="s6:palsu" data-fx="heat">SINYAL PALSU: BATU PANAS &amp; UAP FUMAROL</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">POLA PENCARIAN</div>
  <div class="steps">
    <div data-at="s7:menyapu" data-fx="left"><i>1</i>sapu sektor, jalur sejajar</div>
    <div data-at="s7:menandai" data-fx="left"><i>2</i>tandai titik panas</div>
    <div data-at="s7:mengunci" data-fx="left"><i>3</i>kunci koordinat</div>
    <div data-at="s7:darat" data-fx="left"><i>4</i>tim darat memastikan</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm"><span>DRONE MEMPERLUAS MATA</span><span class="hot" data-at="s8:memastikan" data-fx="heat">TIM DARAT MEMASTIKAN</span></div>
  <div class="sub" data-at="s8:mendaki" data-fx="up">Saat mendaki, patuhi jalur resmi.</div>
  <div class="srcl" data-at="s8:mendaki" data-fx="fade">Sumber: Kantor SAR Banyuwangi, Pos SAR Jember &amp; Balai Besar TNBTS via Kompas.id, Kompas.com, Antara, RRI (8&ndash;9 Nov 2026); fisika kamera termal: data teknis umum. Drone, tim SAR &amp; medan 3D adalah ilustrasi generik, bukan rekaman.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 26px rgba(0,0,0,.55))}
.kick{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:27px;letter-spacing:.12em;color:${AM};margin-bottom:12px;text-shadow:0 2px 8px rgba(0,0,0,.8)}
.h0{display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.h0 span{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:104px;line-height:.98;letter-spacing:-.02em;color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.7)}
.h0 .hot{background:linear-gradient(90deg,${MG},${AM} 45%,${YE} 80%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 0 18px rgba(234,94,40,.45))}
.h0.sm span{font-size:78px}
.sub{font-family:"Space Grotesk",sans-serif;font-weight:400;font-size:36px;color:#E9E4F2;margin-top:12px;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.tag{display:inline-block;margin-top:18px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:31px;letter-spacing:.04em;color:${BK};background:${YE};padding:8px 16px;box-shadow:0 0 28px rgba(247,208,56,.45)}
.tag.rd{background:#FF3B30;color:#fff;box-shadow:0 0 28px rgba(255,59,48,.45);font-size:28px}
.tl{width:820px;background:rgba(10,10,16,.78);border-left:4px solid ${AM};padding:6px 20px;backdrop-filter:blur(6px)}
.tl>div{display:flex;align-items:baseline;gap:18px;padding:9px 0;border-bottom:1px solid rgba(155,29,140,.45)}
.tl>div:last-child{border-bottom:0}
.tl b{flex:none;width:210px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:34px;color:${YE}}
.tl span{font-family:"Space Grotesk",sans-serif;font-size:33px;color:#fff;line-height:1.15}
.tl em{font-style:normal;font-weight:700;font-size:44px;color:${YE}}
.tl .ct{display:inline;font:inherit;color:inherit}
.regu{display:flex;gap:12px;margin-top:16px;align-items:center}
.regu i{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle,#fff 0%,${YE} 28%,${AM} 55%,${MG} 80%,${VI} 100%);box-shadow:0 0 18px rgba(234,94,40,.5)}
.regu i.dr{width:auto;height:58px;border-radius:29px;padding:0 20px;font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;line-height:58px;color:${BK};background:${CY};box-shadow:0 0 22px rgba(0,229,255,.6)}
.spec{width:820px;background:rgba(10,10,16,.8);border:1px solid rgba(0,229,255,.4);padding:18px 22px 14px}
.axis{position:relative;height:46px;background:linear-gradient(90deg,#120c22,#1a0f33);border-radius:4px}
.axis .vis{position:absolute;left:4%;width:7%;top:0;bottom:0;background:linear-gradient(90deg,#7b2cff,#2c6bff,#25d366,#ffe600,#ff7a00,#ff2a2a)}
.axis .win{position:absolute;left:58%;width:36%;top:0;bottom:0;background:linear-gradient(90deg,${VI},${MG},${AM},${YE},${AM},${MG})}
.axis .pk{position:absolute;left:73%;top:-12px;bottom:-12px;width:4px;background:#fff;box-shadow:0 0 12px #fff}
.lb{position:relative;height:44px;margin-top:10px}
.lb .l1{position:absolute;left:0;font-family:"JetBrains Mono",monospace;font-size:24px;color:#cfc8e0}
.lb .l2{position:absolute;left:55%;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:${YE}}
.cap2{font-family:"JetBrains Mono",monospace;font-size:21px;color:#8f86a8}
.duo{display:flex;gap:16px;margin-top:16px;width:860px}
.duo>div{flex:1;background:rgba(10,10,16,.8);padding:12px 18px;border-top:5px solid}
.duo .no{border-color:#5d6b80}.duo .ok{border-color:${YE}}
.duo b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:44px;color:#fff}
.duo .no b{color:#9fb0c6;text-decoration:line-through;text-decoration-thickness:4px}
.duo span{display:block;font-family:"Space Grotesk",sans-serif;font-size:29px;color:#ddd5ec;margin-top:4px}
.steps{width:840px;margin-top:8px}
.steps>div{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:37px;line-height:1.15;color:#fff;background:rgba(10,10,16,.78);border-left:4px solid ${AM};padding:10px 16px;margin-top:10px;display:flex;align-items:center}
.steps i{flex:none;font-style:normal;width:52px;height:52px;line-height:52px;text-align:center;margin-right:16px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:30px;color:${BK};background:${YE};border-radius:50%}
.rbar{display:inline-block;position:relative;width:120px;height:20px;margin-left:16px;border:2px solid ${CY};text-decoration:none}
.rbar s{position:absolute;left:0;top:0;bottom:0;width:100%;background:${CY};transform-origin:0 50%}
.grad{width:820px;height:56px;background:linear-gradient(90deg,${BK},${VI} 20%,${MG} 42%,${AM} 64%,${YE} 84%,#fff);transform-origin:0 50%;border:1px solid rgba(255,255,255,.3)}
.gl{display:flex;justify-content:space-between;width:820px;margin-top:10px}
.gl span{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;color:#fff;text-shadow:0 2px 8px #000}
.big{margin-top:22px;background:rgba(10,10,16,.8);padding:10px 22px 16px;width:780px;border-left:4px solid ${CY}}
.big b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:118px;line-height:1;color:#fff}
.big span{display:block;font-family:"Space Grotesk",sans-serif;font-size:30px;color:#ddd5ec}
.chips{display:flex;gap:12px;margin-top:10px}
.chips i{font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:34px;color:#fff;background:rgba(10,10,16,.82);border:2px solid ${CY};padding:6px 16px}
.chips i:before{content:"\\2715  ";color:#FF3B30}
.srcl{font-family:"Space Grotesk",sans-serif;font-size:23px;line-height:1.3;color:#cfc8e0;margin-top:22px;width:820px;background:rgba(10,10,16,.75);padding:10px 14px;border-left:3px solid ${MG}}
#chip{color:${YE}!important;font-family:"JetBrains Mono",monospace!important;font-size:21px!important;opacity:.9!important;letter-spacing:.06em}
#hud{position:absolute;inset:0;z-index:9;pointer-events:none}
#hud .mode{position:absolute;right:40px;top:186px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:22px;letter-spacing:.1em;color:#fff;padding:4px 10px;border:2px solid #fff}
#hud .mode.th{color:${BK};background:${YE};border-color:${YE}}
#hud .rec{position:absolute;right:40px;top:226px;font-family:"JetBrains Mono",monospace;font-size:20px;color:#FF3B30;letter-spacing:.1em}
#hud .scale{position:absolute;right:40px;top:420px;width:16px;height:620px;background:linear-gradient(0deg,${BK},${VI} 20%,${MG} 42%,${AM} 64%,${YE} 84%,#fff);border:2px solid rgba(255,255,255,.7)}
#hud .st,#hud .sb{position:absolute;right:30px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:18px;color:#fff;writing-mode:vertical-rl;transform:rotate(180deg)}
#hud .st{top:300px}#hud .sb{top:1050px}
#hud .xh{position:absolute;left:510px;top:930px;width:60px;height:60px}
#hud .xh:before,#hud .xh:after{content:"";position:absolute;background:rgba(255,255,255,.75)}
#hud .xh:before{left:29px;top:0;width:2px;height:60px}#hud .xh:after{top:29px;left:0;height:2px;width:60px}`;

const hudHtml = `<div id="hud"><div class="mode" id="hm">CAHAYA</div><div class="rec">&#9679; REC</div><div class="scale"></div><div class="st">PANAS</div><div class="sb">DINGIN</div><div class="xh" id="xh"></div></div>`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "29", sig: "EP29_DRONE_TERMAL_SAR", chip: "ILUSTRASI, BUKAN REKAMAN ASLI", panelTop: 262,
  bg: "#03040a", vig: 0.5, grain: 0.06, capfloor: 0.45, html: html + hudHtml, css,
  extraAt: ["s1:erupsi", "s1:cahaya", "s1:panas", "s2:November", "s2:dimulai", "s2:ketiga", "s2:regu", "s2:menerbangkan",
    "s3:inframerah", "s3:hangat", "s3:Tubuh", "s3:mikrometer", "s3:Kaca", "s3:germanium",
    "s4:mikrobolometer", "s4:piksel", "s4:menghangatkan", "s4:hambatan", "s4:Chip",
    "s5:warna", "s5:dingin", "s5:jingga", "s5:putih", "s5:membedakan", "s5:derajat",
    "s6:beda", "s6:daun", "s6:batu", "s6:air", "s6:Semeru", "s6:terpanggang", "s6:fumarol", "s6:palsu",
    "s7:menyapu", "s7:Operator", "s7:menandai", "s7:mengunci", "s7:darat", "s7:memastikan",
    "s8:memastikan", "s8:mendaki", "s8:Ikuti"],
  fxExtra: `shrink:(e,t)=>tl.fromTo(e,{scaleX:1,opacity:1},{scaleX:.35,opacity:1,duration:.8,ease:'power3.out'},t),
 heat:(e,t)=>tl.fromTo(e,{opacity:0,filter:'blur(10px) saturate(0) brightness(2.2)'},{opacity:1,filter:'blur(0px) saturate(1) brightness(1)',duration:.55,ease:'power2.out'},t),`,
  // Heat up: a scan line reveals the panel top-down while it sharpens from a violet ghost.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-18,clipPath:'inset(0% 0% 100% 0%)',filter:'blur(12px) hue-rotate(-60deg) brightness(.6)'},{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',filter:'blur(0px) hue-rotate(0deg) brightness(1)',duration:.55,ease:'power3.out'},a-.12);}`,
  // Cool down: sinks, blurs and drains to violet.
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:24,filter:'blur(10px) hue-rotate(-70deg) brightness(.5)',duration:.36,ease:'power2.in'},b-.36)`,
  hud: `(function(){const hm=q('#hm'),hud=q('#hud'),xh=q('#xh');const thAt=AT['s1:panas']-.1;let last='';return (t)=>{
const chip=t>K.s4-.05&&t<K.s6-.05;const th=t>=thAt&&!(t>AT['s8:mendaki']+.3);const tx=th?'TERMAL':'CAHAYA';
if(tx!==last){hm.textContent=tx;hm.className='mode'+(th?' th':'');last=tx;}
hud.style.visibility=(chip||t>=OUT)?'hidden':'visible';xh.style.opacity=(t<K.s2||(t>K.s6&&t<K.s7))?.8:0;};})()`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:66px;line-height:1.12;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 0 #0A0A10,0 0 14px rgba(10,10,16,.95),2px 2px 0 #0A0A10,-2px -2px 0 #0A0A10,2px -2px 0 #0A0A10,-2px 2px 0 #0A0A10}
.w{display:inline-block;margin:0 .12em}`,
// Active word heats up: white -> flir yellow with an amber glow.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 0 #0A0A10,0 0 14px rgba(10,10,16,.95)"},{color:"#F7D038",scale:1.08,textShadow:"0 3px 0 #0A0A10,0 0 26px rgba(234,94,40,.95)",duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,textShadow:"0 3px 0 #0A0A10,0 0 14px rgba(10,10,16,.95)",duration:.18},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14,filter:"blur(6px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Drone Termal SAR", "#03040a");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
