// EP01 CHAIN OF CUSTODY. Three.js world on a canvas, evidence panels on top, captions in front.
// Run from this folder: node build-video.mjs
import { writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex, collectAt } from "../_tools/hflib.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BLUE = "#2FA8FF", RED = "#FF2E3F", WHITE = "#F3F8FF", DIM = "#9FB7CC", INK = "#02050A";
const s = Object.fromEntries(TL.scenes.map((x) => [x.id, x]));

// keys the 3D world is cut to
const K = {
  bybit: at("s1:Bybit"), s2: s.s2.start, breach: at("s2:mengirim"), s2e: s.s2.end, s3: s.s3.start, s4: s.s4.start, s5: s.s5.start,
  frozen: at("s5:Sekitar"), rest: at("s5:Sisanya"), next: at("s5:FBI#2"), s6: s.s6.start, replace: at("s6:mengganti"), s6e: s.s6.end,
  s7: s.s7.start, s7e: s.s7.end, q: at("s8:Kalau"), end: TL.speech_end, dur: TL.duration,
  shakes: [[0.0, 0.05], [at("s2:mengirim"), 0.09], [at("s4:Korea"), 0.1], [at("s5:12.000"), 0.08], [at("s7:membantah"), 0.14]],
};

const panel = (inn, out, html, extra = "") => `<section class="p" data-in="${inn}" data-out="${out}" ${extra}>${html}</section>`;
const src = (t) => `<div class="src">${t}</div>`;
const row = (name, val, spec, c = WHITE) => `<div class="row" data-at="${spec}" data-fx="left"><span class="mono rn">${name}</span><span class="d rv" style="color:${c}">${val}</span></div>`;
const iceIcon = `<svg width="92" height="92" viewBox="0 0 100 100" fill="none" stroke="${WHITE}" stroke-width="7" stroke-linecap="round" aria-hidden="true"><path d="M50 8V92M14 29L86 71M14 71L86 29"/><path d="M38 16L50 28L62 16M38 84L50 72L62 84M10 45L26 37L22 20M90 55L74 63L78 80M10 55L26 63L22 80M90 45L74 37L78 20"/></svg>`;
const flowIcon = `<svg width="92" height="92" viewBox="0 0 100 100" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round" aria-hidden="true"><path d="M8 30C30 30 34 70 58 70H88M72 54L88 70L72 86"/><path d="M8 70C22 70 28 58 34 50M46 38C50 34 54 30 58 30H88M72 14L88 30L72 46"/></svg>`;

const panels = [
  // Frame 0 is the thumbnail: the number is already on screen.
  panel("@0", "s1:Angkanya", `<div class="band cen">
    <div class="mono kick">PENCURIAN ASET KRIPTO &middot; 29 OKT 2026</div>
    <div class="d hero">US$6,3</div><div class="d hero2">MILIAR</div>
    <div class="chip" style="color:${RED};border-color:${RED}" data-at="s1:terbesar" data-fx="pop">REKOR, MENURUT AP</div>
    ${src("Angka: estimasi Binance. Ilustrasi 3D.")}</div>`, `data-first="1"`),
  panel("s1:Angkanya", "s2:29", `<div class="band">
    <div class="d title" data-at="s1:Angkanya" data-fx="up">SEKITAR <span class="hl">4&times;</span> BYBIT</div>
    <div class="cmp"><div class="mono cl">BYBIT, FEB 2025 &middot; US$1,5 MILIAR</div><div class="bar" style="width:22.9%;background:${BLUE}" data-at="s1:kasus" data-fx="grow"></div>
    <div class="mono cl">BINANCE, OKT 2026 &middot; US$6,3 MILIAR</div><div class="bar" style="width:96%;background:${RED}" data-at="s1:Bybit" data-fx="grow"></div></div></div>`),
  panel("s2:29", "s2:Estimasi", `<div class="band top">
    <div class="glass"><div class="mono kick">TRM LABS &middot; WAKTU UTC</div>
    <div class="d clock" id="clock">20:05</div>
    <div class="track"><i id="clockbar"></i></div>
    <div class="note" data-at="s2:sebagian" data-fx="up">Sebagian besar keluar dalam sekitar 20 menit</div></div>
    <div class="chip" style="color:${RED};border-color:${RED}" data-at="s2:mengirim" data-fx="pop">DOMPET PANAS &#8594; PENYERANG</div></div>`),
  panel("s2:Estimasi", "s3:Bagaimana", `<div class="band"><div class="d title" data-at="s2:Estimasi" data-fx="up">TIGA HITUNGAN</div>
    <div class="glass tbl">${row("BINANCE", "6,3", "s2:Binance#2")}${row("TRM LABS", "6,36", "s2:Binance#2+0.25")}${row("ELLIPTIC", "6,43", "s2:Elliptic", RED)}
    <div class="mono tiny">US$ MILIAR. METODE VALUASI BERBEDA.</div></div></div>`),
  panel("s3:Bagaimana", "s4:31", `<div class="band">
    <div class="d title" data-at="s3:Bagaimana" data-fx="up">BAGAIMANA PENYERANG MASUK?</div>
    <div class="stamp" data-at="s3:Belum" data-fx="stamp">BELUM FINAL</div>
    <div class="ev" data-at="s3:laptop" data-fx="left"><span class="mono evk">KLAIM AWAL BINANCE</span><span class="evt">Laptop teknisi disusupi</span></div>
    <div class="ev" data-at="s3:menemukan" data-fx="left"><span class="mono evk">TEMUAN LANJUTAN BINANCE</span><span class="evt">Ada titik pembobolan lain</span></div>
    <div class="ev dim" data-at="s3:Laporan" data-fx="left"><span class="mono evk">LAPORAN TEKNIS</span><span class="evt">Masih ditunggu</span></div></div>`),
  panel("s4:31", "s5:FBI", `<div class="band">
    <div class="glass dossier" data-at="s4:FBI" data-fx="card"><div class="mono kick">PERNYATAAN FBI &middot; 31 OKT 2026</div>
    <div class="d title big" data-at="s4:FBI" data-fx="up">FBI:</div><div class="d title big" style="color:${RED}" data-at="s4:FBI#2" data-fx="up">KOREA UTARA</div>
    <div class="note" data-at="s4:bertanggung" data-fx="up">disebut bertanggung jawab atas pencurian</div>
    <div class="d title" data-at="s4:US$6" data-fx="up">&gt; US$6 MILIAR</div>
    <div class="mono tag" data-at="s4:TraderTraitor" data-fx="pop">AKTIVITAS: TRADERTRAITOR</div></div>
    ${src("Atribusi versi FBI. Korea Utara membantah.")}</div>`),
  panel("s5:FBI", "s5:Sekitar", `<div class="band">
    <div class="d title" data-at="s5:FBI" data-fx="up">DIKONVERSI KE <span style="color:${BLUE}">ETH</span></div>
    <div class="vs"><div class="vsc" data-at="s5:stablecoin" data-fx="left">${iceIcon}<div class="d vst">STABLECOIN</div><div class="note">Bisa dibekukan penerbit</div></div>
    <div class="vsc" data-at="s5:ETH" data-fx="left">${flowIcon}<div class="d vst" style="color:${RED}">ETH</div><div class="note">Tidak bisa</div></div></div>
    ${src("Pengamatan FBI. Penjelasan: Elliptic.")}</div>`),
  panel("s5:Sekitar", "s5:Sisanya", `<div class="band">
    <div class="glass"><div class="mono kick">ELLIPTIC &middot; DIBEKUKAN ATAU DISITA</div>
    <div class="d hero3" style="color:${WHITE}" data-at="s5:US$2,85" data-fx="up">US$2,85<br>MILIAR</div>
    <div class="track big"><i class="fill" style="width:44%;background:#BFE4FF" data-at="s5:miliar" data-fx="grow"></i></div>
    <div class="note">44% dari US$6,43 miliar. Tiap balok: 1%.</div></div></div>`),
  panel("s5:Sisanya", "s5:FBI#2", `<div class="band">
    <div class="d title" data-at="s5:Sisanya" data-fx="up"><span class="hl">SISANYA BERLARI</span></div>
    <div class="glass tbl"><div class="row"><span class="d rv" id="cnt-w">0</span><span class="mono rn">DOMPET</span></div>
    <div class="row" data-at="s5:lebih" data-fx="left"><span class="d rv" id="cnt-t">0</span><span class="mono rn">TRANSAKSI+</span></div>
    <div class="row" data-at="s5:tiga" data-fx="left"><span class="d rv">3,5</span><span class="mono rn">HARI</span></div></div>
    ${src("Elliptic. Jumlah titik 12.000, posisinya ilustrasi.")}</div>`),
  panel("s5:FBI#2", "s6:Binance", `<div class="band">
    <div class="mono kick cen2" data-at="s5:memperingatkan" data-fx="up">TAHAP BERIKUTNYA, MENURUT FBI</div>
    <div class="gates"><div class="gt" data-at="s5:DeFi" data-fx="pop"><div class="d gtt">DeFi</div></div><div class="gt" data-at="s5:instant" data-fx="pop"><div class="d gtt">INSTANT SWAP</div></div></div>
    <div class="note cen2" data-at="s5:layanan" data-fx="up">FBI merilis 628 alamat dan meminta industri memblokirnya</div></div>`),
  panel("s6:Binance", "s7:Korea", `<div class="band top">
    <div class="mono kick cen2">PERNYATAAN BINANCE</div>
    <div class="d hero4"><span id="cnt-p">0</span>%</div>
    <div class="d title cen2" data-at="s6:US$6" data-fx="up">&asymp; US$6 MILIAR DIGANTI</div>
    <div class="note cen2" data-at="s6:dana#2" data-fx="up">Dari dana perusahaan. Kerugian tidak ditanggung pengguna, kata Binance.</div></div>`),
  panel("s7:Korea", "s8:Menurut", `<div class="band">
    <div class="stamp" data-at="s7:membantah" data-fx="stamp">KOREA UTARA MEMBANTAH</div>
    <div class="glass quote" data-at="s7:Kim" data-fx="card"><div class="mono kick">KIM YO JONG, DIKUTIP AP</div><div class="d title" style="color:${WHITE}">&ldquo;PROVOKASI USANG&rdquo;</div></div>
    <div class="ev dim" data-at="s7:FBI" data-fx="left"><span class="mono evk">FBI</span><span class="evt">Tetap menyebut TraderTraitor</span></div></div>`),
  panel("s8:Menurut", "s8:Kalau", `<div class="band">
    <div class="glass"><div class="mono kick">ELLIPTIC &middot; PER 3 NOV 2026</div>
    <div class="d hero3" style="color:${RED}" data-at="s8:US$3,18" data-fx="up">US$3,18<br>MILIAR</div>
    <div class="note" data-at="s8:masih" data-fx="up">Masih di alamat terkait pencurian</div></div></div>`),
  panel("s8:Kalau", "@END", `<div class="band cen">
    <div class="d q" data-at="s8:seberapa" data-fx="up">SEBERAPA</div><div class="d q" style="color:${RED}" data-at="s8:aman" data-fx="up">AMAN</div><div class="d q" data-at="s8:aset" data-fx="up">ASET DIGITAL</div><div class="d q" data-at="s8:kita" data-fx="up">KITA?</div></div>`),
];
const panelsHtml = panels.join("\n");
const AT = collectAt(panelsHtml, at);

const css = `
#root{position:absolute;inset:0;overflow:hidden;background:${INK}}
#gl{position:absolute;left:0;top:0;width:1080px;height:1920px}
.p{position:absolute;inset:0;z-index:4;visibility:hidden;transform-origin:50% 40%;will-change:transform}
.band{position:absolute;left:84px;right:84px;top:296px;height:985px;display:flex;flex-direction:column;justify-content:center;gap:30px}
.band.top{justify-content:flex-start;padding-top:10px}.band.cen{align-items:center;text-align:center}
.d{font-family:"Archivo Black",sans-serif;line-height:1;letter-spacing:-1px;color:${WHITE}}
.mono{font-family:"JetBrains Mono",monospace;font-weight:700;letter-spacing:.5px}
.kick{font-size:31px;color:#6CC4FF;text-shadow:0 2px 10px #000}.cen2{text-align:center;align-self:center}
.hero{font-size:238px;text-shadow:0 0 60px rgba(255,46,63,.55),0 8px 0 rgba(0,0,0,.55)}.hero2{font-size:150px;color:${RED};text-shadow:0 0 44px rgba(255,46,63,.55)}
.hero3{font-size:150px;margin:14px 0 16px;letter-spacing:-3px}.hero4{font-size:290px;text-align:center;letter-spacing:-8px;text-shadow:0 6px 0 rgba(0,0,0,.45),0 0 50px rgba(0,0,0,.75)}
.hl{background:${RED};color:#fff;padding:0 16px 6px;display:inline-block;text-shadow:none}
.title{font-size:88px;line-height:1.02;text-shadow:0 4px 30px rgba(0,0,0,.85)}.title.big{font-size:124px;margin:16px 0 6px}
.q{font-size:136px;line-height:1.06;text-shadow:0 6px 40px rgba(0,0,0,.9)}
.src{font-family:Inter,sans-serif;font-weight:700;font-size:28px;color:#DCE8F2;background:rgba(2,5,10,.78);padding:8px 14px;align-self:flex-start;border-radius:4px}
.note{font-family:Inter,sans-serif;font-weight:700;font-size:38px;line-height:1.24;color:${WHITE};text-shadow:0 2px 14px rgba(0,0,0,.9)}
.tiny{font-size:28px;color:#C4D6E6;margin-top:10px}
.chip{font-family:"JetBrains Mono",monospace;font-weight:800;font-size:34px;padding:16px 26px;border:3px solid;border-radius:6px;background:rgba(2,5,10,.82);align-self:center}
.glass{background:linear-gradient(160deg,rgba(14,24,36,.88),rgba(5,10,18,.9));border:1px solid rgba(160,205,255,.3);border-radius:14px;padding:34px;box-shadow:0 34px 70px -16px rgba(0,0,0,.85),0 10px 26px -8px rgba(0,0,0,.65)}
.clock{font-size:190px;letter-spacing:-5px;margin:16px 0 22px;color:${RED};font-variant-numeric:tabular-nums}
.track{height:18px;background:rgba(160,205,255,.16);border-radius:3px;overflow:hidden;margin-bottom:22px}.track i{display:block;height:100%;width:100%;background:${RED};transform-origin:0 50%}.track.big{height:30px}.track .fill{transform-origin:0 50%}
.cmp{display:flex;flex-direction:column;gap:16px;background:rgba(3,7,13,.72);padding:30px;border-radius:12px;border:1px solid rgba(160,205,255,.22)}.cl{font-size:31px;color:${WHITE}}.bar{height:74px;transform-origin:0 50%;border-radius:2px;margin-bottom:16px}
.tbl{display:flex;flex-direction:column;gap:6px}.row{display:flex;align-items:baseline;justify-content:space-between;gap:20px;border-bottom:1px solid rgba(160,205,255,.2);padding:14px 0}.rn{font-size:36px;color:${DIM}}.rv{font-size:112px;letter-spacing:-3px;font-variant-numeric:tabular-nums}
.stamp{align-self:center;font-family:"Archivo Black",sans-serif;font-size:76px;line-height:1;color:${RED};border:7px solid ${RED};padding:16px 28px;border-radius:8px;background:rgba(2,5,10,.82);text-align:center}
.ev{display:flex;flex-direction:column;gap:8px;padding:22px 26px;background:rgba(5,10,18,.88);border-left:8px solid ${BLUE};border-radius:4px}.ev.dim{border-left-color:${DIM}}.evk{font-size:28px;color:${DIM}}.evt{font-family:Inter,sans-serif;font-weight:900;font-size:50px;color:${WHITE};line-height:1.12}
.dossier{display:flex;flex-direction:column;gap:12px}.tag{align-self:flex-start;font-size:36px;color:${INK};background:${WHITE};padding:12px 18px;margin-top:12px}
.vs{display:flex;gap:22px}.vsc{flex:1;display:flex;flex-direction:column;gap:18px;padding:30px 24px;background:rgba(5,10,18,.88);border:1px solid rgba(160,205,255,.3);border-radius:12px}.vst{font-size:62px;letter-spacing:-1px}
.gates{display:flex;flex-direction:column;gap:30px;align-items:stretch}.gt{padding:44px 20px;text-align:center;border:5px solid ${RED};background:rgba(2,5,10,.8);border-radius:12px;box-shadow:0 0 44px rgba(255,46,63,.34)}.gtt{font-size:96px}
.logo{width:520px;align-self:center}.cr{font-family:Inter,sans-serif;font-weight:700;font-size:44px;color:#fff}
#hud{position:absolute;left:84px;right:84px;top:190px;height:64px;z-index:8;display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:${WHITE};text-shadow:0 2px 10px #000}
#rec{display:inline-block;width:18px;height:18px;background:${RED};margin-right:14px;border-radius:50%}
#capshade{position:absolute;left:0;right:0;top:1230px;height:400px;z-index:6;background:linear-gradient(transparent,rgba(1,3,7,.9) 26%,rgba(1,3,7,.9) 82%,transparent)}
#vig{position:absolute;inset:0;z-index:3;background:radial-gradient(ellipse at center,transparent 46%,rgba(0,0,0,.66) 100%)}
#grain{position:absolute;inset:-100px;background:url(assets/img/grain.png);opacity:.08;z-index:9;mix-blend-mode:overlay}
#flash{position:absolute;inset:0;z-index:5;background:${RED};opacity:0}
#black{position:absolute;inset:0;z-index:10;background:#000;opacity:0}
#outro{position:absolute;inset:0;z-index:11;opacity:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:44px;padding-bottom:300px}
.cred{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:${DIM};text-align:center;line-height:1.5}
`;

const outroAt = +(TL.speech_end + 0.55).toFixed(3);
const world = `<template><style>${css}</style>
<div id="root" data-composition-id="world" data-width="1080" data-height="1920">
<canvas id="gl" width="1080" height="1920" data-layout-ignore></canvas>
<div id="vig" data-layout-ignore></div>
<div id="flash" data-layout-ignore></div>
${panelsHtml}
<div id="capshade" data-layout-ignore></div>
<div id="hud"><div><span id="rec"></span>AUDIRA TECH NEWS</div><div id="hudr">KASUS BINANCE</div></div>
<div id="grain" data-layout-ignore></div>
<div id="black" data-layout-ignore></div>
<div id="outro"><img class="logo" src="assets/brand/stacked-reversed.svg" alt="AUDIRA"><div class="cr">Created by Agus Dwi R.</div>
<div class="cred">Sumber: FBI, AP, TRM Labs, Elliptic,<br>Binance, The Guardian, SecurityWeek.<br>Data per 4 November 2026.</div></div>
</div>
<script>
(function(){
const DUR=${TL.duration},K=${JSON.stringify(K)},AT=${JSON.stringify(AT)},OUT=${outroAt};
const END=OUT-0.1;
const lbl=${JSON.stringify([[0, "KASUS BINANCE"], [K.s2, "BERKAS 01 / PENCURIAN"], [K.s3, "BERKAS 02 / JALUR MASUK"], [K.s4, "BERKAS 03 / ATRIBUSI"], [K.s5, "BERKAS 04 / PENCUCIAN"], [K.s6, "BERKAS 05 / PEMULIHAN"], [K.s7, "BERKAS 06 / BANTAHAN"], [K.frozen * 0 + at("s8:Menurut"), "BERKAS 07 / SISA ASET"]])};
const tl=gsap.timeline({paused:true});
const q=(s)=>document.querySelector(s);
const FX={
 up:(e,t)=>tl.fromTo(e,{y:60,opacity:0},{y:0,opacity:1,duration:.45,ease:'power4.out'},t),
 left:(e,t)=>tl.fromTo(e,{x:-80,opacity:0},{x:0,opacity:1,duration:.42,ease:'power4.out'},t),
 pop:(e,t)=>tl.fromTo(e,{scale:.74,opacity:0},{scale:1,opacity:1,duration:.4,ease:'back.out(1.4)'},t),
 card:(e,t)=>tl.fromTo(e,{y:110,rotationX:-12,opacity:0,transformPerspective:1200},{y:0,rotationX:0,opacity:1,duration:.58,ease:'power4.out'},t),
 stamp:(e,t)=>tl.fromTo(e,{scale:1.9,rotation:-7,opacity:0},{scale:1,rotation:-2,opacity:1,duration:.2,ease:'power4.in'},t),
 grow:(e,t)=>tl.fromTo(e,{scaleX:0},{scaleX:1,duration:.7,ease:'power3.out'},t)
};
document.querySelectorAll('#root [data-at]').forEach(e=>{const f=FX[e.dataset.fx];const a=AT[e.dataset.at];if(e.dataset.fx==='grow')gsap.set(e,{scaleX:0});else gsap.set(e,{opacity:0});f(e,a);});
// Panels travel on the film's single axis: they push toward camera, in and out.
document.querySelectorAll('#root .p').forEach(p=>{
  const first=p.dataset.first==='1';
  const a=p.dataset.in==='@0'?0:AT[p.dataset.in];
  const b=p.dataset.out==='@END'?END:AT[p.dataset.out];
  gsap.set(p,{visibility:'hidden',opacity:0});
  tl.set(p,{visibility:'visible'},first?0:Math.max(0,a-.14));
  if(first){tl.set(p,{opacity:1,scale:1},0);}
  else tl.fromTo(p,{scale:.84,opacity:0},{scale:1,opacity:1,duration:.34,ease:'power4.out'},a-.14);
  tl.to(p,{scale:1.2,opacity:0,duration:.24,ease:'power2.in'},b-.22);
  tl.set(p,{visibility:'hidden'},b+.03);
});
tl.to('#flash',{opacity:.34,duration:.06,ease:'none'},K.breach);
tl.to('#flash',{opacity:0,duration:.5,ease:'power2.out'},K.breach+.06);
tl.to('#black',{opacity:1,duration:.5,ease:'power2.in'},END-.1);
tl.to('#hud',{opacity:0,duration:.3},END-.1);
tl.to('#outro',{opacity:1,duration:.35,ease:'power2.out'},OUT+.1);
gsap.set('#outro',{opacity:0});
const clock=q('#clock'),cbar=q('#clockbar'),cw=q('#cnt-w'),ct=q('#cnt-t'),cp=q('#cnt-p'),rec=q('#rec'),hudr=q('#hudr'),grain=q('#grain');
const id=(n)=>Math.round(n).toLocaleString('de-DE');
const ease=(x)=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
let draw=null;
const tClock=[AT['s2:mengirim']-.9,AT['s2:Estimasi']-.25];
const tW=[K.rest+.45,K.rest+1.6],tT=[AT['s5:lebih'],AT['s5:lebih']+1.1],tP=[K.replace,AT['s6:US$6']];
function hud(t){
  const u=Math.max(0,Math.min(1,(t-tClock[0])/(tClock[1]-tClock[0])));
  const mins=u*20,mm=Math.floor(mins),ss=Math.floor((mins-mm)*60);
  clock.textContent='20:'+String(5+mm).padStart(2,'0');
  cbar.style.transform='scaleX('+u.toFixed(3)+')';
  cw.textContent=id(12000*ease((t-tW[0])/(tW[1]-tW[0])));
  ct.textContent=id(40000*ease((t-tT[0])/(tT[1]-tT[0])));
  cp.textContent=String(Math.round(95*ease((t-tP[0])/(tP[1]-tP[0]))));
  let l=lbl[0][1];for(const [a,b] of lbl){if(t>=a)l=b;}hudr.textContent=l;
  rec.style.opacity=(Math.floor(t*1.5)%2===0)?'1':'.3';
  const g=Math.floor(t*14);grain.style.transform='translate3d('+(-((g*37)%100))+'px,'+(-((g*61)%100))+'px,0)';
}
let last=0;
function renderAll(t){last=t;hud(t);if(draw)draw(t);}
const c={t:0};
tl.to(c,{t:DUR,duration:DUR,ease:'none',onUpdate:()=>renderAll(c.t)},0);
window.addEventListener('hf-seek',e=>renderAll(e.detail.time));
hud(0);
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
window.__hf.buildReady.world3d=import('./assets/lib/world3d.js').then(m=>{draw=m.create(q('#gl'),K);draw(last);});
window.__timelines["world"]=tl;
})();
</script></template>`;
writeFileSync("PROJECT/hyperframes/compositions/world.html", world);

const CY = "#39D0FF";
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:64px;right:104px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:64px;line-height:1.14;word-spacing:.14em;color:#fff;text-shadow:0 4px 0 #000,0 0 24px rgba(0,0,0,.95)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${CY}",scale:1.06,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{scale:1,duration:.12,ease:"power2.out"},${(w.start + 0.06).toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.05,ease:"none"},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{y:18,opacity:.2},{y:0,opacity:1,duration:.14,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Chain of Custody", INK);
writeFileSync("PROJECT/beats.json", JSON.stringify({ K, AT, outroAt }, null, 1));
console.log("panels", panels.length, "reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration);
