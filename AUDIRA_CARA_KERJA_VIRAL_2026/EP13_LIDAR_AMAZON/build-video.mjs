// EP13 LASER UNDER THE CANOPY. Survey-HUD look: near-black panels with an amber scan rule, Chakra Petch headings, DM Mono readouts.
// Panels arrive like a laser scan line (left-to-right reveal with a flash) and leave by collapsing to a horizontal line. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB347", LEAF = "#7EE081", CORAL = "#FF6B4A", VOID = "#07090A", CREAM = "#F3E6C8";

const wave = `<svg class="wv" viewBox="0 0 860 200" width="860" height="200">
  <line x1="20" y1="170" x2="840" y2="170" stroke="#5a4a30" stroke-width="3"/>
  <path d="M20 170 L140 170 Q170 170 185 60 Q200 170 230 170 L360 170 Q385 170 400 104 Q415 170 440 170 L640 170 Q660 170 675 128 Q690 170 710 170 L840 170" fill="none" stroke="#3b3324" stroke-width="5"/>
  <path class="pk" data-at="s4:puncak" data-fx="fade" d="M140 170 Q170 170 185 60 Q200 170 230 170" fill="none" stroke="${LEAF}" stroke-width="7"/>
  <path class="pk" data-at="s4:ranting" data-fx="fade" d="M360 170 Q385 170 400 104 Q415 170 440 170" fill="none" stroke="${AMB}" stroke-width="7"/>
  <path class="pk" data-at="s4:tanah" data-fx="fade" d="M640 170 Q660 170 675 128 Q690 170 710 170" fill="none" stroke="${CORAL}" stroke-width="7"/>
  <text x="185" y="40" text-anchor="middle" class="wl" fill="${LEAF}" data-at="s4:puncak" data-fx="fade">PUNCAK DAUN</text>
  <text x="400" y="86" text-anchor="middle" class="wl" fill="${AMB}" data-at="s4:ranting" data-fx="fade">RANTING</text>
  <text x="675" y="110" text-anchor="middle" class="wl" fill="${CORAL}" data-at="s4:tanah" data-fx="fade">TANAH</text>
</svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 13</div>
  <div class="h0">LASER<br><i>DI BAWAH HUTAN</i></div>
  <div class="vs"><span class="a">FOTO SATELIT: HIJAU</span><span class="b" data-at="s1:laser" data-fx="left">LASER: RATUSAN LINGKARAN</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">STUDI NATURE &middot; JULI LALU</div>
  <div class="ro" data-at="s2:BBC" data-fx="left"><b>BBC INDONESIA</b><span>mengangkatnya pekan ini</span></div>
  <div class="ro" data-at="s2:Acre" data-fx="left"><b>ACRE &amp; AMAZONAS</b><span>Brasil &middot; survei pesawat 2024</span></div>
  <div class="du"><div data-at="s2:432" data-fx="pop"><b class="ct" data-from="0" data-to="432" data-a="s2:432" data-d="1.4">0</b><span>struktur tanah</span></div><div class="kn" data-at="s2:36" data-fx="pop"><b>36</b><span>sudah dikenal</span></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">PESAWAT SURVEI</div>
  <div class="tel" data-at="s3:1,1" data-fx="up"><b>1,1 km</b><span>di atas hutan, bolak-balik</span></div>
  <div class="tel" data-at="s3:1,6" data-fx="up"><b>1,6 juta</b><span>pulsa laser per detik</span></div>
  <div class="ch" data-at="s3:kiri" data-fx="up">disapu ke kiri &amp; kanan</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">SATU PULSA, BANYAK PANTULAN</div>
  <div class="card">${wave}</div>
  <div class="ch" data-at="s4:celah" data-fx="up">lewat celah daun, bukan menembus daun</div>
  <div class="ch" data-at="s4:Waktu" data-fx="up">waktu pantul &rarr; jarak</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">TIAP TITIK PUNYA ALAMAT</div>
  <div class="ro" data-at="s5:GNSS" data-fx="left"><b>GNSS</b><span>posisi pesawat</span></div>
  <div class="ro" data-at="s5:IMU" data-fx="left"><b>IMU</b><span>kemiringan: roll &middot; pitch &middot; yaw</span><div class="bars"><i id="b0"></i><i id="b1"></i><i id="b2"></i></div></div>
  <div class="tel" data-at="s5:31" data-fx="up"><b>31 titik</b><span>per m&sup2;, rata-rata</span></div>
  <div class="stamp" data-at="s5:dibuang" data-fx="stamp">TITIK POHON DIBUANG</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">KENAPA SATELIT TAK MELIHAT?</div>
  <div class="ro" data-at="s6:atap" data-fx="left"><b>FOTO SATELIT</b><span>hanya atap hutan</span></div>
  <div class="ro" data-at="s6:temuan" data-fx="left"><b>TEMUAN LAMA</b><span>hampir semua di lahan gundul</span></div>
  <div class="ch" data-at="s6:Laser" data-fx="up">laser: cukup segelintir pulsa sampai tanah</div>
  <div class="ch co" data-at="s6:terlewat" data-fx="up">sebagian tetap terlewat</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">MODEL TANAH TELANJANG</div>
  <div class="ro" data-at="s7:matahari" data-fx="left"><b>BAYANGAN MATAHARI BUATAN</b><span>hillshade membuat parit menonjol</span></div>
  <div class="tel" data-at="s7:Parit" data-fx="up"><b>9&ndash;13 m</b><span>lebar parit</span></div>
  <div class="tel big" data-at="s7:Totalnya" data-fx="up"><b>24.000&ndash;30.000</b><span>struktur, diperkirakan</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Tersembunyi" data-fx="up">TERSEMBUNYI<br>DARI PETA ILMUWAN</div>
  <div class="h3" data-at="s8:bukan" data-fx="up">bukan dari ingatan masyarakat adat</div>
  <div class="srcl" data-at="s8:adat" data-fx="fade">Sumber: P&auml;rssinen dkk., Nature (Juli 2026); BBC News Indonesia; NEON; NOAA. Visual 3D adalah ilustrasi, bukan data survei asli.</div>
</div>
<div id="hud"><div class="hl">AUDIRA &middot; LIDAR SURVEY</div><div class="hr" id="hudpts">TITIK 0</div></div>`;

const css = `
.st{display:inline-block;font-family:"DM Mono",monospace;font-weight:500;font-size:25px;letter-spacing:.14em;color:${VOID};background:${AMB};padding:6px 14px;margin-bottom:14px}
.h0{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:118px;line-height:.98;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.65)}
.h0 i{font-style:normal;color:${AMB};font-size:84px}
.vs{margin-top:16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.vs span{font-family:"DM Mono",monospace;font-weight:500;font-size:31px;padding:6px 14px;background:rgba(7,9,10,.78)}
.vs .a{color:${LEAF};border-left:5px solid ${LEAF}}.vs .b{color:${AMB};border-left:5px solid ${AMB}}
.ro{background:rgba(7,9,10,.8);border-left:5px solid ${AMB};padding:10px 18px;margin-top:10px;width:max-content;max-width:880px}
.ro b{display:block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:50px;line-height:1.05;color:#fff}
.ro span{display:block;font-family:"DM Mono",monospace;font-weight:400;font-size:28px;line-height:1.25;color:${CREAM}}
.du{display:flex;gap:12px;width:780px;margin-top:12px}.du>div{flex:1;background:rgba(7,9,10,.82);padding:8px 16px;border-top:5px solid ${AMB};text-align:center}
.du .kn{border-top-color:#fff}
.du b{display:block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:104px;line-height:1;color:${AMB}}.du .kn b{color:#fff}
.du span{display:block;font-family:"DM Mono",monospace;font-size:27px;color:${CREAM}}
.tel{background:rgba(7,9,10,.8);border-top:3px solid ${AMB};border-bottom:3px solid ${AMB};padding:8px 22px;width:660px;margin-top:10px}
.tel b{display:block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:100px;line-height:1;color:${AMB}}
.tel span{display:block;font-family:"DM Mono",monospace;font-size:28px;color:${CREAM}}
.tel.big{width:820px}.tel.big b{font-size:96px}
.ch{font-family:"Chakra Petch",sans-serif;font-weight:600;font-size:36px;line-height:1.2;color:#fff;margin-top:12px;text-shadow:0 2px 10px #000,0 0 3px #000}
.ch.co{color:${CORAL}}
.card{background:rgba(7,9,10,.82);border:2px solid #3b3324;padding:10px 4px;width:870px}
.wl{font-family:"DM Mono",monospace;font-size:26px;font-weight:500}
.bars{display:flex;gap:10px;margin-top:8px}.bars i{display:block;height:12px;width:150px;background:linear-gradient(90deg,${CORAL},${AMB});transform-origin:0 50%}
.stamp{display:inline-block;margin-top:26px;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:44px;color:${LEAF};border:4px solid ${LEAF};padding:6px 16px;background:rgba(7,9,10,.7)}
.h2{display:inline-block;background:rgba(7,9,10,.62);padding:8px 18px;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:86px;line-height:1.02;color:#fff;text-shadow:0 4px 26px rgba(0,0,0,.8)}
.h3{display:inline-block;background:rgba(7,9,10,.62);padding:6px 18px;font-family:"Chakra Petch",sans-serif;font-weight:600;font-size:46px;color:${AMB};margin-top:12px;text-shadow:0 3px 14px #000}
.srcl{background:rgba(7,9,10,.5);padding:8px 14px;font-family:"DM Mono",monospace;font-size:22px;line-height:1.35;color:#fff;margin-top:16px;text-shadow:0 2px 10px #000;max-width:860px}
#hud{position:absolute;left:56px;right:110px;top:226px;height:30px;z-index:11;display:flex;justify-content:space-between;font-family:"DM Mono",monospace;font-size:22px;letter-spacing:.08em;color:${AMB};opacity:.85}
#chip{left:auto!important;right:110px;top:186px!important;font-family:"DM Mono",monospace!important;color:${CREAM}!important}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const X = ["s1:laser", "s1:lingkaran", "s2:Acre", "s2:Ditemukan", "s2:432", "s2:36", "s3:terbang", "s3:kilometer", "s3:juta", "s3:kiri",
  "s4:pulsa", "s4:puncak", "s4:ranting", "s4:celah", "s4:tanah", "s4:Waktu", "s5:GNSS", "s5:mencatat", "s5:IMU", "s5:pantulan", "s5:31", "s5:pohon",
  "s6:Kenapa", "s6:atap", "s6:gundul", "s6:Laser", "s6:tanah", "s6:terlewat", "s7:matahari", "s7:Parit", "s7:lingkaran", "s7:persegi", "s7:Totalnya", "s8:adat"];
const { AT, K } = writeWorld(TL, at, {
  ep: "13", sig: "EP13_LIDAR_AMAZON", chip: "ILUSTRASI", panelTop: 262, bg: VOID, vig: 0.4, grain: 0.035, capfloor: 0.45, html, css, extraAt: X,
  // Scan-line arrival: clip opens left to right with a brightness flash; exit collapses to a horizontal line.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0 100% 0 0)',opacity:1,filter:'brightness(2.2)'},{clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power2.out'},a-.16);tl.to(p,{filter:'brightness(1)',duration:.3},a+.2);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(48% 0 48% 0)',opacity:0,duration:.26,ease:'power3.in'},b-.32)`,
  hud: `(t)=>{const s=K,A=AT;const pe=document.getElementById('hudpts');if(pe){let n=0;const r=(x,a,b)=>Math.max(0,Math.min(1,(x-a)/(b-a)));
    n=Math.round(1e6*(r(t,.8,5.3)*0.4+r(t,s.s3,s.s4)*0.6+r(t,s.s5,s.s6)*1.5+r(t,s.s6,s.s7)*0.5));pe.textContent='TITIK '+n.toLocaleString('de-DE');}
    const rl=0.035*Math.sin(t*0.7)+(t>=s.s5&&t<s.s6?0.1*Math.sin((t-A['s5:IMU'])*2.1):0);
    const b=[Math.abs(rl)*6,Math.abs(0.02*Math.sin(t*0.9))*20,0.4+0.3*Math.sin(t*0.5)];
    for(let i=0;i<3;i++){const e=document.getElementById('b'+i);if(e)e.style.transform='scaleX('+Math.max(.08,Math.min(1,b[i])).toFixed(3)+')';}}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:62px;line-height:1.22;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 4px;margin:0 .1em}`,
// Active word lights amber and a thin scan line passes under it.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,179,71,0)"},{color:"#FFC56B",boxShadow:"inset 0 -5px 0 0 rgba(255,107,74,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,179,71,0)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,clipPath:"inset(0 100% 0 0)"},{opacity:1,clipPath:"inset(0 0% 0 0)",duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Laser Under the Canopy", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
