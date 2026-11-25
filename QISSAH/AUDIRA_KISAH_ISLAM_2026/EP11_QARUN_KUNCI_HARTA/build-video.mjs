// EP11 QARUN, KUNCI HARTA. PRECISION: premium product-CGI, polished gold on black glass under studio softboxes.
// Panels are smoked black-glass plaques with a hairline gold edge. They arrive and leave with a glass sheen sweep
// (a diagonal highlight crosses the plaque). Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#040405", GOLD = "#E2B65C", GOLD2 = "#F6DFA0", INK = "#0B0906", PAPER = "#F2EEE6", MUTE = "#A9A39A";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP11_qarun.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V76 = verse("28:76"), V77 = verse("28:77");
const NAME = V76.replace(/^۞ /, "").split(" ۖ")[0];                 // إِنَّ قَـٰرُونَ كَانَ مِن قَوْمِ مُوسَىٰ فَبَغَىٰ عَلَيْهِمْ
const P77 = V77.split(" ۖ ");
const ADV = P77[0] + " ۖ " + P77[1];                                  // وَٱبْتَغِ ... ٱلْـَٔاخِرَةَ ۖ وَلَا تَنسَ نَصِيبَكَ مِنَ ٱلدُّنْيَا
if (!V76.includes(NAME) || !NAME.includes("قَـٰرُونَ")) throw new Error("name phrase");
if (!V77.startsWith(ADV) || P77.length < 3) throw new Error("advice phrase");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;
const keyIcon = `<svg class="ki" viewBox="0 0 64 24"><circle cx="11" cy="12" r="8" fill="none" stroke="${GOLD}" stroke-width="3.5"/><path d="M19 12h40M50 12v8M42 12v6" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round"/></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 11</div>
    <div class="h">Kunci Harta Qarun</div>
    <div class="row" data-at="s1:sekelompok" data-fx="gild">${keyIcon}<span class="lead">kuncinya berat dipikul orang-orang kuat</span>${ref("QS 28:76")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Allah">
  <div class="card">
    <div class="k"><i></i>SURAH AL-QASAS ${ref("QS 28:76", "s2:Al-Qasas")}</div>
    <div class="ar" data-at="s2:Al-Qasas" data-fx="gild">${NAME}</div>
    <div class="h">Qarun</div>
    <div class="pair"><span data-at="s2:kaum" data-fx="gild">dari kaum Musa</span><b data-at="s2:zalim" data-fx="gild">berlaku zalim</b></div>
  </div>
</div>
<div class="p" data-in="s2:Allah" data-out="s3">
  <div class="card">
    <div class="k"><i></i>ANUGERAH ${ref("QS 28:76")}</div>
    <div class="h m" data-at="s2:perbendaharaan" data-fx="gild">Perbendaharaan luar biasa</div>
    <div class="row" data-at="s2:kunci" data-fx="gild">${keyIcon}<span class="lead">kunci gudangnya pun menjadi beban</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card">
    <div class="k"><i></i>NASIHAT KAUMNYA ${ref("QS 28:76-77")}</div>
    <div class="qt" data-at="s3:jangan" data-fx="gild">&ldquo;Jangan terlalu bangga.&rdquo;</div>
    <div class="ar v" data-at="s3:Carilah" data-fx="gild">${ADV}</div>
    <div class="ls">
      <span data-at="s3:Carilah" data-fx="gild">Carilah akhirat dengan hartamu</span>
      <span data-at="s3:lupakan" data-fx="gild">Jangan lupakan bagianmu di dunia</span>
      <span data-at="s3:Berbuat" data-fx="gild">Berbuat baiklah</span>
    </div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Al-Qur'an">
  <div class="card">
    <div class="k"><i></i>JAWABAN QARUN ${ref("QS 28:78", "s4:aku")}</div>
    <div class="qt big" data-at="s4:aku" data-fx="gild">&ldquo;Aku diberi harta ini karena ilmuku sendiri.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Al-Qur'an" data-out="s5">
  <div class="card">
    <div class="k"><i></i>AL-QUR'AN MENGINGATKAN ${ref("QS 28:78", "s4:mengingatkan")}</div>
    <div class="h m" data-at="s4:umat" data-fx="gild">Umat sebelumnya</div>
    <div class="pair"><span data-at="s4:kuat" data-fx="gild">lebih kuat</span><span data-at="s4:banyak" data-fx="gild">lebih banyak hartanya</span></div>
    <div class="stamp" data-at="s4:dibinasakan" data-fx="stamp">sudah dibinasakan</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Orang-orang">
  <div class="card">
    <div class="k"><i></i>KELUAR KE TENGAH KAUMNYA ${ref("QS 28:79", "s5:keluar")}</div>
    <div class="h m" data-at="s5:segala" data-fx="gild">dengan segala kemegahannya</div>
  </div>
</div>
<div class="p" data-in="s5:Orang-orang" data-out="s6">
  <div class="card">
    <div class="k"><i></i>YANG MENGEJAR DUNIA ${ref("QS 28:79")}</div>
    <div class="qt big" data-at="s5:andai" data-fx="gild">&ldquo;Andai kita punya harta seperti Qarun.&rdquo;</div>
    <div class="sub" data-at="s5:beruntung" data-fx="gild">Dia sungguh beruntung.</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k"><i></i>YANG BERILMU MENJAWAB ${ref("QS 28:80", "s6:menjawab")}</div>
    <div class="qt big" data-at="s6:Pahala" data-fx="gild">&ldquo;Pahala Allah lebih baik.&rdquo;</div>
    <div class="sub" data-at="s6:beriman" data-fx="gild">bagi yang beriman dan beramal saleh</div>
    <div class="tag" data-at="s6:sabar" data-fx="gild">hanya didapat orang yang sabar</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Dan">
  <div class="card">
    <div class="k"><i></i>AKHIRNYA ${ref("QS 28:81", "s7:dibenamkan")}</div>
    <div class="h m" data-at="s7:dibenamkan" data-fx="gild">Dibenamkan ke dalam bumi</div>
    <div class="pair"><span data-at="s7:rumahnya" data-fx="gild">bersama rumahnya</span><b data-at="s7:golongan" data-fx="gild">tak ada yang menolong</b></div>
  </div>
</div>
<div class="p" data-in="s7:Dan" data-out="s8">
  <div class="card">
    <div class="k"><i></i>YANG KEMARIN IRI ${ref("QS 28:82", "s7:iri")}</div>
    <div class="qt big" data-at="s7:untung" data-fx="gild">&ldquo;Untung Allah tidak membenamkan kita juga.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>PELAJARAN</div>
    <div class="h m">Harta itu titipan,</div>
    <div class="sub" data-at="s8:bukan" data-fx="gild">bukan bukti kehebatan diri.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="gild">Kapan rasa bangga berubah menjadi sombong?</div>
    <div class="sign" data-at="s8:Kisah" data-fx="gild">Kisah dalam Al-Qur'an &middot; bersama AUDIRA</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(3,3,4,0),rgba(3,3,4,.6) 40%,rgba(3,3,4,.6) 72%,rgba(3,3,4,0))}
.p{--sh:-40}
.card{position:relative;overflow:hidden;background:linear-gradient(165deg,rgba(22,22,26,.88),rgba(7,7,9,.86));padding:22px 30px 24px;border-radius:14px;
 box-shadow:0 22px 50px rgba(0,0,0,.55),inset 0 0 0 1px rgba(226,182,92,.42),inset 0 1px 0 rgba(255,240,210,.22)}
.card:after{content:"";position:absolute;inset:-2px;pointer-events:none;
 background:linear-gradient(112deg,rgba(255,255,255,0) calc(var(--sh) * 1% - 16%),rgba(255,248,230,.30) calc(var(--sh) * 1% - 2%),rgba(255,255,255,.55) calc(var(--sh) * 1%),rgba(255,248,230,.22) calc(var(--sh) * 1% + 3%),rgba(255,255,255,0) calc(var(--sh) * 1% + 16%))}
.card:before{content:"";position:absolute;left:30px;right:30px;top:0;height:1px;background:linear-gradient(90deg,rgba(246,223,160,0),${GOLD2},rgba(246,223,160,0))}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Inter,sans-serif;font-weight:700;font-size:25px;letter-spacing:.2em;color:${GOLD};margin-bottom:8px}
.k i{display:block;width:26px;height:2px;background:${GOLD}}
.h{font-family:"Playfair Display",serif;font-weight:700;font-size:72px;line-height:1.06;color:${PAPER};letter-spacing:-.005em}
.h.m{font-size:56px;line-height:1.1}
.sub{font-family:Inter,sans-serif;font-weight:500;font-size:36px;line-height:1.25;color:${GOLD2};margin-top:8px}
.qt{font-family:"Playfair Display",serif;font-style:italic;font-weight:600;font-size:46px;line-height:1.16;color:${PAPER}}
.qt.big{font-size:54px}
.rf{display:inline-block;font-family:Inter,sans-serif;font-weight:700;font-size:22px;letter-spacing:.08em;color:${INK};background:linear-gradient(180deg,${GOLD2},${GOLD});padding:4px 12px 3px;border-radius:20px;white-space:nowrap}
.row{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap}
.lead{font-family:Inter,sans-serif;font-weight:600;font-size:34px;color:${GOLD2}}
.ki{width:70px;height:26px;flex:none}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:50px;line-height:1.55;color:${GOLD2};margin:2px 0 2px}
.ar.v{font-size:40px;line-height:1.7;margin:8px 0 6px;padding:6px 0;border-top:1px solid rgba(226,182,92,.25);border-bottom:1px solid rgba(226,182,92,.25)}
.pair{display:flex;gap:14px;flex-wrap:wrap;margin-top:12px}
.pair span,.pair b{font-family:Inter,sans-serif;font-weight:600;font-size:32px;color:${PAPER};padding:6px 16px;border-radius:24px;border:1px solid rgba(226,182,92,.5)}
.pair b{color:${INK};background:linear-gradient(180deg,${GOLD2},${GOLD});border-color:transparent}
.ls{display:flex;flex-direction:column;gap:4px}
.ls span{font-family:Inter,sans-serif;font-weight:600;font-size:33px;color:${PAPER};padding-left:28px;position:relative;line-height:1.3}
.ls span:before{content:"";position:absolute;left:2px;top:.52em;width:11px;height:11px;border:2px solid ${GOLD};transform:rotate(45deg)}
.stamp{display:inline-block;margin-top:14px;font-family:"Playfair Display",serif;font-weight:700;font-size:40px;color:${INK};background:linear-gradient(180deg,${GOLD2},${GOLD});padding:6px 20px;border-radius:6px}
.tag{display:inline-block;margin-top:12px;font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:${INK};background:linear-gradient(180deg,${GOLD2},${GOLD});padding:6px 16px;border-radius:24px}
.ask{margin-top:14px;font-family:"Playfair Display",serif;font-style:italic;font-weight:600;font-size:42px;line-height:1.18;color:${PAPER};border-left:3px solid ${GOLD};padding-left:18px}
.sign{margin-top:14px;font-family:Inter,sans-serif;font-weight:700;font-size:24px;letter-spacing:.16em;color:${GOLD};text-transform:uppercase}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:dipikul", "s1:Bayangkan", "s1:hartanya", "s1:semuanya", "s1:lenyap", "s1:sekejap",
  "s2:menyebut", "s2:Musa", "s2:zalim", "s2:Allah", "s2:perbendaharaan", "s2:kunci",
  "s3:Carilah", "s3:dunia",
  "s4:ilmuku", "s4:sendiri", "s4:Al-Qur'an", "s4:umat", "s4:lebih", "s4:dibinasakan",
  "s5:kemegahannya", "s5:Orang-orang", "s5:andai", "s5:beruntung",
  "s6:berilmu", "s6:Pahala", "s6:beriman", "s6:beramal",
  "s7:dibenamkan", "s7:rumahnya", "s7:golongan", "s7:Dan", "s7:untung", "s7:iri"];
const { AT, K } = writeWorld(TL, at, {
  ep: "11", bg: BG, vig: 0.42, grain: 0.045, capfloor: 0.55, html, css,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Inter,sans-serif", chipColor: GOLD2,
  signature: "EP11_QARUN_KUNCI_HARTA",
  extraAt: WORLD_AT,
  fxExtra: `gild:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,x:-14,filter:'brightness(2.4) blur(3px)'},{opacity:1,x:0,filter:'brightness(1) blur(0px)',duration:.5,ease:'power3.out'},t);},`,
  // Glass sheen sweep: the plaque fades up out of a soft blur while a diagonal highlight crosses it; on exit the highlight crosses back and the plaque dims away.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:18,scale:.985,filter:'blur(8px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.5,ease:'power3.out'},a-.2);tl.fromTo(p,{'--sh':-40},{'--sh':150,duration:.95,ease:'power2.inOut'},a-.22);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--sh':-40,duration:.5,ease:'power2.in'},b-.5);tl.to(p,{opacity:0,y:-10,scale:.99,filter:'blur(6px)',duration:.32,ease:'power2.in'},b-.32);}`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'brightness(2.2)'});tl.to('#outro',{opacity:1,filter:'brightness(1)',duration:.7,ease:'power2.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:700;font-size:56px;line-height:1.3;color:${PAPER};text-shadow:0 3px 14px rgba(0,0,0,.95),0 0 3px rgba(0,0,0,.9)}
.w{display:inline-block;margin:0 .14em;position:relative}
.w:after{content:"";position:absolute;left:0;right:0;bottom:-.06em;height:.08em;background:linear-gradient(90deg,${GOLD},${GOLD2});transform:scaleX(var(--u,0));transform-origin:0 50%}`,
(id, w) => `tl.fromTo("#${id}",{color:"${PAPER}",scale:1,"--u":0},{color:"${GOLD2}",scale:1.07,"--u":1,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${PAPER}",scale:1,"--u":0,duration:.18},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12,filter:"blur(5px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kunci Harta Qarun", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
