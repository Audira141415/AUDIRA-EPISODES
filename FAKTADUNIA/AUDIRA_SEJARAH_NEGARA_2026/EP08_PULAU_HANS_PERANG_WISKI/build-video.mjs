// EP08 PERANG WISKI. Low-poly pastel Arctic (POLYVERSE): Hans Island sits in an icy Kennedy Channel; flags and bottles take turns
// on the rock. "War" beats get hard-edged BRUTALFORGE cards. Panels open and close behind an ice-crack wipe. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#E6F0F6", NAVY = "#16324A", CAR = "#D52B1E", DKR = "#C8102E", SEA = "#7FB8D6", DEEP = "#2B5C7A", ICE = "#E8F4FA";
const HF = "font-family:Fraunces,serif", BF = "font-family:Manrope,sans-serif";

// Mini flags drawn as SVG so they stay crisp at any size.
const LEAF = [[0, 1], [.12, .78], [.28, .84], [.22, .48], [.45, .62], [.52, .52], [.72, .58], [.62, .36], [.75, .3], [.42, .06], [.48, -.06], [.08, 0], [.05, -.32], [-.05, -.32], [-.08, 0], [-.48, -.06], [-.42, .06], [-.75, .3], [-.62, .36], [-.72, .58], [-.52, .52], [-.45, .62], [-.22, .48], [-.28, .84], [-.12, .78]];
const fCA = (w = 54) => { const h = w / 2, s = h * .42; const p = LEAF.map(([x, y]) => `${(w / 2 + x * s).toFixed(1)},${(h / 2 - (y - .34) * s).toFixed(1)}`).join(" "); return `<svg class="fl" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/><rect width="${w / 4}" height="${h}" fill="${CAR}"/><rect x="${w * .75}" width="${w / 4}" height="${h}" fill="${CAR}"/><polygon points="${p}" fill="${CAR}"/></svg>`; };
const fDK = (w = 54) => { const h = w * 28 / 37; return `<svg class="fl" width="${w}" height="${h.toFixed(1)}" viewBox="0 0 37 28"><rect width="37" height="28" fill="${DKR}"/><rect x="12" width="4" height="28" fill="#fff"/><rect y="12" width="37" height="4" fill="#fff"/></svg>`; };
const fGL = (w = 54) => { const h = w * 2 / 3; return `<svg class="fl" width="${w}" height="${h.toFixed(1)}" viewBox="0 0 18 12"><rect width="18" height="6" fill="#fff"/><rect y="6" width="18" height="6" fill="${DKR}"/><path d="M3 6 A4 4 0 0 1 11 6 Z" fill="${DKR}"/><path d="M3 6 A4 4 0 0 0 11 6 Z" fill="#fff"/></svg>`; };

const ad = (who, txt, cls) => `<div class="ad ${cls}"><div class="bar"><i></i><i></i><i></i><span>pencarian: hans island</span></div><div class="bd"><b>Iklan</b>${who}<p>${txt}</p></div></div>`;

const html = `<svg id="crk" width="1080" height="1920" viewBox="0 0 1080 1920"><polyline id="crk1" points="" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="bevel"/><polyline id="crk2" points="" fill="none" stroke="${SEA}" stroke-width="2" stroke-linejoin="bevel"/></svg>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">FAKTA SEJARAH NEGARA &middot; EP 08</div>
  <div class="h1">Dua negara,<br><em>satu pulau</em></div>
  <div class="row" data-at="s1:hampir" data-fx="left"><b>&plusmn;50</b><span>tahun bersengketa<br><i>1973 &ndash; 2022</i></span></div>
  <div class="duo"><i class="bru" data-at="s1:Bendera" data-fx="pop">BENDERA</i><i class="bru w" data-at="s1:sebotol" data-fx="pop">+ SEBOTOL MINUMAN</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:Luasnya">
  <div class="tk">SELAT NARES &middot; ARKTIK</div>
  <div class="h1">Pulau Hans</div>
  <div class="card" data-at="s2:batu" data-fx="up">batu gundul, tak berpenghuni<br><i>Inuit menyebutnya Tartupaluk: &ldquo;berbentuk ginjal&rdquo;</i></div>
</div>
<div class="p" data-in="s2:Luasnya" data-out="s3">
  <div class="row"><b><b class="ct" data-from="0" data-to="1.3" data-a="s2:1,3" data-d="1" data-dec="1">0,0</b> km&sup2;</b><span>luas pulau<br><i>&plusmn; 1.290 &times; 1.199 m</i></span></div>
  <div class="row" data-at="s2:35" data-fx="left"><b><b class="ct" data-from="0" data-to="35" data-a="s2:35" data-d="1.1">0</b> km</b><span>lebar selat<br><i>Kanada &harr; Greenland</i></span></div>
  <div class="st" data-at="s2:perairan" data-fx="stamp">MASUK PERAIRAN KEDUANYA</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">17 DES 1973 &middot; PERJANJIAN LANDAS KONTINEN</div>
  <div class="h2">1973</div>
  <div class="card" data-at="s3:menyepakati" data-fx="up">Kanada &amp; Denmark sepakat batas laut</div>
  <div class="vs" data-at="s3:mengklaim" data-fx="pop"><span>${fCA(48)} &ldquo;milik kami&rdquo;</span><span>${fDK(42)} &ldquo;milik kami&rdquo;</span></div>
  <div class="st" data-at="s3:titik" data-fx="stamp">TANPA TITIK TEMU</div>
</div>
<div class="p" data-in="s4" data-out="s4:Konon">
  <div class="tk">MENTERI DENMARK URUSAN GREENLAND</div>
  <div class="h2">1984</div>
  <div class="sign" data-at="s4:pesan" data-fx="pop"><div class="dk">&ldquo;Velkommen til den danske &oslash;&rdquo;</div><div class="id">Selamat datang di pulau Denmark</div></div>
</div>
<div class="p" data-in="s4:Konon" data-out="s5">
  <div class="st" data-at="s4:Konon" data-fx="stamp">KONON&hellip;</div>
  <div class="card" data-at="s4:sebotol" data-fx="up">ikut ditinggalkan: sebotol minuman keras Denmark<br><i>cerita yang beredar: brendi atau schnapps</i></div>
</div>
<div class="p" data-in="s5" data-out="s5:Media">
  <div class="tk">BALASAN KANADA</div>
  <div class="row r2" data-at="s5:benderanya" data-fx="left">${fCA(84)}<span>bendera Kanada</span></div>
  <div class="row r2" data-at="s5:wiski" data-fx="left"><b class="sm">WISKI</b><span>sebotol Canadian Club</span></div>
  <div class="tally" data-at="s5:Begitu" data-fx="up"><b>BERGANTIAN</b><span id="tal">${[fCA(52), fDK(46), fCA(52), fDK(46), fCA(52)].map((f, i) => `<em id="t${i}">${f}</em>`).join("")}</span></div>
</div>
<div class="p" data-in="s5:Media" data-out="s5:Tahun">
  <div class="war" data-at="s5:Media" data-fx="stamp"><small>JULUKAN MEDIA</small>PERANG<br>WISKI</div>
  <div class="st w" data-at="s5:sengketa" data-fx="stamp">sengketa paling ramah di dunia</div>
</div>
<div class="p" data-in="s5:Tahun" data-out="s6">
  <div class="tk">2005 &middot; PERANG PINDAH KE IKLAN DARING</div>
  ${ad(fDK(30), "Pulau Hans milik Denmark!", "a1").replace('class="ad a1"', 'class="ad a1" data-at="s5:perangnya" data-fx="pop"')}
  ${ad(fCA(34), "Bukan. Milik Kanada!", "a2").replace('class="ad a2"', 'class="ad a2" data-at="s5:iklan" data-fx="pop"')}
  <div class="lb" data-at="s5:iklan" data-fx="fade">ilustrasi iklan, bukan tangkapan layar asli</div>
</div>
<div class="p" data-in="s6" data-out="s6:pembagian">
  <div class="tk">SETELAH <b class="ct" data-from="0" data-to="17" data-a="s6:17" data-d=".8">0</b> TAHUN NEGOSIASI</div>
  <div class="h2 sm">14 Juni 2022</div>
  <div class="tag" data-at="s6:Kanada" data-fx="left">${fCA(60)}<div><b>M&eacute;lanie Joly</b><span>Menteri Luar Negeri Kanada</span></div></div>
  <div class="tag" data-at="s6:Denmark" data-fx="left">${fDK(52)}<div><b>Jeppe Kofod</b><span>Menteri Luar Negeri Denmark</span></div></div>
  <div class="tag" data-at="s6:Greenland" data-fx="left">${fGL(54)}<div><b>M&uacute;te B. Egede</b><span>Perdana Menteri Greenland</span></div></div>
</div>
<div class="p" data-in="s6:pembagian" data-out="s7">
  <div class="tk">PULAU DIBAGI DUA</div>
  <div class="h1">kira-kira<br><em>separuh-separuh</em></div>
  <div class="card" data-at="s6:mengikuti" data-fx="up">mengikuti retakan alami di permukaannya</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">PERBATASAN DARAT BARU</div>
  <div class="row"><b><b class="ct" data-from="0" data-to="1280" data-a="s7:1.280" data-d="1.4">0</b> m</b><span>panjang garis batas<br><i>di atas Pulau Hans</i></span></div>
  <div class="vs" data-at="s7:bertetangga" data-fx="pop"><span>${fCA(48)} Kanada</span><i>&harr;</i><span>${fDK(42)} Denmark</span></div>
  <div class="st" data-at="s7:paling" data-fx="stamp">PERBATASAN DARAT ANTARNEGARA PALING UTARA DI DUNIA</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h1 sm">Perang tanpa<br><em>pecundang</em></div>
  <div class="card q" data-at="s8:Menurut" data-fx="up">Sengketa perbatasan lain bisa sesantai ini?</div>
</div>`;

const css = `
#crk{position:absolute;left:0;top:0;z-index:12;pointer-events:none;filter:drop-shadow(0 0 6px rgba(127,184,214,.9))}
.p{color:${NAVY}}
.tk{display:inline-block;${BF};font-weight:800;font-size:25px;letter-spacing:.14em;color:${NAVY};background:rgba(255,255,255,.88);padding:9px 18px;border-radius:999px;box-shadow:0 8px 22px rgba(22,50,74,.16)}
.tk b{font-weight:800}
.h1{margin-top:14px;${HF};font-weight:800;font-size:100px;line-height:.98;color:${NAVY};text-shadow:0 2px 0 rgba(255,255,255,.75),0 0 28px rgba(232,244,250,.95)}
.h1 em{font-style:italic;font-weight:700;color:${CAR}}
.h1.sm{font-size:88px}
.h2{margin-top:10px;${HF};font-weight:800;font-size:150px;line-height:.9;color:${NAVY};text-shadow:0 2px 0 rgba(255,255,255,.75),0 0 30px rgba(232,244,250,.95)}
.h2.sm{font-size:96px;margin-top:14px}
.card{display:inline-block;margin-top:14px;max-width:880px;${BF};font-weight:700;font-size:32px;line-height:1.25;color:${NAVY};background:rgba(255,255,255,.92);padding:14px 22px;border-radius:22px;box-shadow:0 12px 28px rgba(22,50,74,.18)}
.card i{display:block;font-style:normal;font-weight:600;font-size:25px;color:${DEEP};margin-top:4px}
.card.q{font-size:36px}
.row{display:flex;gap:20px;align-items:center;margin-top:14px;padding:12px 24px;background:rgba(255,255,255,.92);border-radius:24px;border-left:10px solid ${SEA};box-shadow:0 12px 28px rgba(22,50,74,.18);width:fit-content;max-width:880px}
.row>b{flex:none;${HF};font-weight:800;font-size:68px;line-height:1;color:${NAVY}}.row>b.sm{font-size:50px;color:#9A5B14}
.row>b b{font-weight:800}
.row span{${BF};font-weight:700;font-size:30px;line-height:1.2;color:${NAVY}}.row span i{font-style:normal;font-weight:600;font-size:24px;color:${DEEP}}
.row.r2{border-left-color:${CAR}}
.fl{display:block;flex:none;border-radius:3px;box-shadow:0 0 0 2px rgba(22,50,74,.25)}
.duo{display:flex;gap:14px;margin-top:20px}
.bru{display:inline-block;font-style:normal;${BF};font-weight:800;font-size:38px;letter-spacing:.03em;padding:10px 18px;color:#fff;background:${CAR};border:5px solid ${NAVY};box-shadow:8px 8px 0 ${NAVY}}
.bru.w{background:#fff;color:${NAVY}}
.st{display:inline-block;margin-top:20px;${BF};font-weight:800;font-size:44px;line-height:1.08;letter-spacing:.02em;padding:10px 20px;color:#fff;background:${CAR};border:5px solid ${NAVY};box-shadow:9px 9px 0 ${NAVY};max-width:860px}
.st.w{background:#fff;color:${NAVY};font-size:40px}
.vs{display:flex;gap:14px;align-items:center;margin-top:14px}
.vs span{display:flex;gap:12px;align-items:center;${BF};font-weight:800;font-size:32px;color:${NAVY};background:rgba(255,255,255,.94);padding:10px 18px;border-radius:18px;box-shadow:0 10px 24px rgba(22,50,74,.18)}
.vs i{font-style:normal;${BF};font-weight:800;font-size:46px;color:${NAVY}}
.sign{display:inline-block;margin-top:16px;background:#fff;border:6px solid ${DKR};border-radius:10px;padding:14px 24px;box-shadow:0 14px 30px rgba(22,50,74,.22)}
.sign .dk{${HF};font-weight:800;font-style:italic;font-size:46px;color:${NAVY}}
.sign .id{${BF};font-weight:700;font-size:28px;color:${DEEP};margin-top:4px}
.tally{display:flex;gap:16px;align-items:center;margin-top:16px;padding:12px 20px;background:#fff;border:5px solid ${NAVY};box-shadow:8px 8px 0 ${NAVY};width:fit-content}
.tally b{${BF};font-weight:800;font-size:32px;letter-spacing:.06em;color:${NAVY}}
.tally span{display:flex;gap:10px;align-items:center}.tally em{display:none}
.war{display:inline-block;margin-top:6px;${BF};font-weight:800;font-size:132px;line-height:.9;letter-spacing:.01em;color:#fff;background:${CAR};padding:18px 34px 26px;border:7px solid ${NAVY};box-shadow:16px 16px 0 ${NAVY}}
.war small{display:block;font-size:26px;letter-spacing:.2em;margin-bottom:12px;color:#FFE3DF}
.ad{width:600px;background:#fff;border:5px solid ${NAVY};border-radius:16px;box-shadow:10px 10px 0 ${NAVY};overflow:hidden;margin-top:18px}
.ad.a2{margin-left:250px;margin-top:-6px}
.ad .bar{display:flex;gap:9px;align-items:center;height:42px;padding:0 16px;background:${ICE};border-bottom:4px solid ${NAVY}}
.ad .bar i{width:14px;height:14px;border-radius:50%;background:${SEA};border:2px solid ${NAVY}}
.ad .bar span{margin-left:12px;flex:1;${BF};font-weight:600;font-size:21px;color:${DEEP};background:#fff;border-radius:999px;padding:2px 14px;border:2px solid #BCD6E4}
.ad .bd{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:14px 20px 18px}
.ad .bd b{${BF};font-weight:800;font-size:20px;letter-spacing:.06em;background:#F9E27A;color:${NAVY};padding:2px 10px;border-radius:6px}
.ad .bd p{margin:0;width:100%;${HF};font-weight:800;font-size:44px;line-height:1.05;color:${NAVY}}
.lb{margin-top:14px;${BF};font-weight:600;font-size:22px;color:${DEEP}}
.tag{display:flex;gap:18px;align-items:center;margin-top:12px;padding:12px 22px;background:rgba(255,255,255,.94);border-radius:20px;box-shadow:0 10px 24px rgba(22,50,74,.18);width:fit-content}
.tag b{display:block;${HF};font-weight:800;font-size:40px;line-height:1.05;color:${NAVY}}
.tag span{display:block;${BF};font-weight:700;font-size:23px;color:${DEEP};margin-top:2px}`;

// Ice-crack wipe: a jagged vertical crack runs across the panel; the panel is revealed (in) or erased (out) behind it.
// Driven from timeline time, so seeking anywhere renders the same frame.
const hud = `(()=>{let L=null;const J=[0,-22,14,-10,24,-16,8,-20,12,0];const ez=(u)=>u<=0?0:u>=1?1:1-Math.pow(1-u,3);
const crk1=document.getElementById('crk1'),crk2=document.getElementById('crk2');
const SW=[AT['s5:benderanya']-.2,AT['s5:Begitu'],AT['s5:Begitu+0.45'],AT['s5:Begitu+0.9'],AT['s5:Begitu+1.35']];
return (t)=>{
 if(!L)L=[...document.querySelectorAll('#root .p')].map(p=>({p,first:p.dataset.first==='1',a:p.dataset.in==='@0'?0:(AT[p.dataset.in]??K[p.dataset.in]),b:p.dataset.out==='@END'?OUT-.1:(AT[p.dataset.out]??K[p.dataset.out])}));
 let line='',lo=0;
 for(const q of L){const W=q.p.offsetWidth,H=q.p.offsetHeight;
  const ui=q.first?1:(t-(q.a-.14))/.5,uo=(t-(q.b-.34))/.32;
  let mode=0,X=0;
  if(uo>0&&uo<1){mode=2;X=-40+(W+90)*ez(uo);}else if(ui>0&&ui<1){mode=1;X=-40+(W+90)*ez(ui);}
  if(mode===0){q.p.style.clipPath='none';continue;}
  const pts=J.map((j,k)=>[X+j,-30+(H+60)*k/(J.length-1)]);
  const edge=pts.map(([x,y])=>x.toFixed(1)+'px '+y.toFixed(1)+'px');
  q.p.style.clipPath=mode===1?'polygon(-60px -30px,'+edge.join(',')+',-60px '+(H+30)+'px)':'polygon('+edge.join(',')+','+(W+120)+'px '+(H+30)+'px,'+(W+120)+'px -30px)';
  const u=mode===1?ui:uo;lo=Math.max(lo,Math.sin(Math.PI*Math.min(1,u*1.15)));
  line=pts.map(([x,y])=>(56+x).toFixed(1)+','+(q.p.offsetTop+y).toFixed(1)).join(' ');}
 crk1.setAttribute('points',line);crk2.setAttribute('points',line);crk1.style.opacity=crk2.style.opacity=lo.toFixed(3);
 for(let i=0;i<5;i++){const e=document.getElementById('t'+i);if(e)e.style.display=t>=SW[i]?'block':'none';}
};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "08", bg: BG, vig: 0.16, grain: 0.035, capfloor: 0, html, css, chipFont: "Manrope,sans-serif", chipColor: DEEP,
  chip: "ILUSTRASI &middot; SKALA DISEDERHANAKAN",
  extraAt: ["s1:sebotol", "s1:Bendera", "s2:Selat", "s2:Nares", "s2:Kanada", "s2:Greenland", "s2:negara", "s2:kedua", "s2:pulau", "s2:Pulau",
    "s3:1973", "s3:batas", "s3:itu", "s3:Tapi", "s3:Hans", "s3:keduanya", "s3:temu", "s3:Kanada", "s3:Denmark",
    "s4:menteri", "s4:Denmark", "s4:Greenland", "s4:mendarat", "s4:menancapkan", "s4:bendera", "s4:selamat", "s4:sebotol", "s4:keras",
    "s5:membalas", "s5:Canadian", "s5:Perang", "s5:2005", "s5:Begitu+0.45", "s5:Begitu+0.9", "s5:Begitu+1.35", "s5:bergantian", "s5:dunia",
    "s6:empat", "s6:menandatangani", "s6:separuh-separuh", "s6:retakan", "s6:negosiasi", "s6:Kanada", "s6:Denmark", "s6:Greenland",
    "s7:perbatasan", "s7:Kanada", "s7:Denmark", "s7:darat", "s7:utara", "s7:dunia", "s7:meter",
    "s8:tanpa", "s8:pecundang", "s8:sesantai"],
  panelIn: `(tl,p,a)=>tl.set(p,{opacity:1},a-.14)`,
  panelOut: `(tl,p,b)=>tl.set(p,{opacity:1},b)`,
  hud,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:900px;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:56px;line-height:1.18;color:${NAVY};background:#FFFFFF;border-radius:40px;padding:12px 34px 16px;box-shadow:0 12px 30px rgba(22,50,74,.30),0 0 0 4px rgba(127,184,214,.55)}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"${NAVY}"},{color:"${CAR}",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${NAVY}",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:22,opacity:0},{y:0,opacity:1,duration:.2,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Perang Wiski", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
