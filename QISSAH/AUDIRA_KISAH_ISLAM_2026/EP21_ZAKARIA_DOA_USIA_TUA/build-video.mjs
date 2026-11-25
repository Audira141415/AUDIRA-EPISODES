// EP21 ZAKARIA, DOA DI USIA TUA. STAINEDGLASS: a quiet stone mihrab chamber lit through coloured-glass windows.
// Panels are deep-indigo glass cards with a leaded multicolour glass strip on top (Cormorant Garamond titles, Inter text,
// Amiri Arabic). Transition: light through glass. A band of coloured light (ruby, amber, emerald, cobalt) sweeps across the
// card and the card is revealed behind it; on exit the band sweeps on and wipes it away. At s8 a full-frame glass sweep
// covers the cut from the dawn courtyard back to the niche. Arabic is read verbatim from the verse file.
// Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0b0e1a", CREAM = "#F6EEDC", AMB = "#F0B44C", INK = "#12162A", TQ = "#8FD8E0", CARD = "rgba(13,17,34,.88)";
const GLASS = "linear-gradient(90deg,transparent,rgba(196,36,58,.92) 16%,rgba(240,169,42,.95) 34%,rgba(255,236,196,.95) 50%,rgba(23,144,92,.92) 66%,rgba(31,69,181,.92) 84%,transparent)";

const QF = readFileSync("../_research/quran/EP21_zakaria.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V194 = verse("19:4"), V199 = verse("19:9");
if (V194.split(" ").length !== 14 || V199.split(" ").length !== 14) throw new Error("verse text changed");

const ref = (r) => `<span class="rf">${r}</span>`;
// sun/moon arc for the three nights + muted sound bar
const CYC = `<div class="cyc">
<svg viewBox="0 0 300 124" class="arc"><path d="M30 112A120 96 0 0 1 270 112" fill="none" stroke="rgba(246,238,220,.35)" stroke-width="2" stroke-dasharray="4 7"/><path d="M10 112H290" stroke="rgba(246,238,220,.5)" stroke-width="2"/><circle id="orb" cx="30" cy="112" r="15" fill="${AMB}"/><circle id="orbcut" cx="38" cy="106" r="13" fill="${CARD}" opacity="0"/></svg>
<div class="cycr"><div class="nights"><i class="nd"></i><i class="nd"></i><i class="nd"></i><span>MALAM</span></div>
<div class="mute"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><s></s></div></div></div>`;
// abstract gesture sign: a point with soft arcs (no hand)
const SIGN = `<svg class="sign" viewBox="0 0 120 120"><circle cx="34" cy="60" r="11" fill="${AMB}"/><path d="M54 36Q70 60 54 84" fill="none" stroke="${AMB}" stroke-width="6" stroke-linecap="round"/><path d="M72 24Q96 60 72 96" fill="none" stroke="${TQ}" stroke-width="5" stroke-linecap="round" opacity=".85"/><path d="M90 14Q120 60 90 106" fill="none" stroke="#E2607A" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;

const html = `
<div id="cut"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 21</div>
    <div class="h">DOA DI USIA TUA</div>
    <div class="tags"><span data-at="s1:lemah" data-fx="rise">Tulang melemah</span><span data-at="s1:uban" data-fx="rise">Rambut penuh uban</span><span data-at="s1:mandul" data-fx="rise">Istri mandul</span></div>
    <div class="sub" data-at="s1:Tapi" data-fx="rise">Tapi ia masih berdoa.</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:khawatir">
  <div class="card">
    <div class="k">SURAH MARYAM ${ref("QS 19:2-3")}</div>
    <div class="h m">Nabi Zakaria berdoa</div>
    <div class="sub" data-at="s2:lembut" data-fx="rise">dengan suara yang lembut, hampir berbisik</div>
    <div class="chipl" data-at="s2:mihrab" data-fx="rise">DI DALAM MIHRAB</div>
  </div>
</div>
<div class="p" data-in="s2:khawatir" data-out="s3">
  <div class="card">
    <div class="k">KEKHAWATIRANNYA ${ref("QS 19:5-6")}</div>
    <div class="h m">Tak ada penerus dakwah sepeninggalnya?</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card">
    <div class="k">DOA NABI ZAKARIA ${ref("QS MARYAM 19:4")}</div>
    <div class="ar">${V194}</div>
    <div class="tr">&ldquo;Ya Tuhanku, tulangku telah melemah, kepalaku dipenuhi uban, dan aku <em data-at="s3:belum" data-fx="hl">belum pernah kecewa</em> dalam berdoa kepada-Mu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k">KUNCINYA</div>
    <div class="h m">&ldquo;Belum pernah kecewa&rdquo;</div>
    <div class="vs">
      <div class="no" data-at="s4:keadaannya" data-fx="rise"><i>&times;</i><s>Yakin pada keadaannya</s></div>
      <div class="yes" data-at="s4:pengalamannya" data-fx="rise"><i>&#10003;</i>Yakin pada pengalamannya bersama Tuhan</div>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="k">KABAR GEMBIRA ${ref("QS 19:7")}</div>
    <div class="h m">Jawabannya datang</div>
    <div class="sub" data-at="s5:anak" data-fx="rise">Seorang anak bernama</div>
    <div class="name" data-at="s5:Yahya" data-fx="bloom">YAHYA</div>
    <div class="sub s2" data-at="s5:nama" data-fx="rise">nama yang belum pernah diberikan kepada siapa pun sebelumnya</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Jawabnya">
  <div class="card">
    <div class="k">ZAKARIA BERTANYA ${ref("QS 19:8")}</div>
    <div class="qt">&ldquo;Bagaimana mungkin? Aku sudah sangat tua dan istriku mandul.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6:Jawabnya" data-out="s7">
  <div class="card">
    <div class="k">FIRMAN ALLAH ${ref("QS MARYAM 19:9")}</div>
    <div class="ar">${V199}</div>
    <div class="tr">&ldquo;Hal itu mudah bagi-Ku. Engkau pun dulu Aku ciptakan, padahal engkau <em data-at="s6:belum" data-fx="hl">belum ada sama sekali</em>.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:keluar">
  <div class="card">
    <div class="k">TANDANYA ${ref("QS 19:10")}</div>
    <div class="h m">3 malam tidak bisa berbicara</div>
    ${CYC}
    <div class="sub" data-at="s7:sehat" data-fx="rise">padahal ia sehat</div>
  </div>
</div>
<div class="p" data-in="s7:keluar" data-out="s8">
  <div class="card">
    <div class="k">KELUAR DARI MIHRAB ${ref("QS 19:11")}</div>
    <div class="sg">${SIGN}<div class="h m">Memberi isyarat kepada kaumnya</div></div>
    <div class="qt s" data-at="s7:bertasbihlah" data-fx="rise">&ldquo;Bertasbihlah pagi dan petang.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="s8:Tidak">
  <div class="card">
    <div class="k">YAHYA ${ref("QS 19:12-14")}</div>
    <div class="h m">Kelak tumbuh</div>
    <div class="ls">
      <span data-at="s8:berbakti" data-fx="rise">berbakti kepada orang tuanya</span>
      <span data-at="s8:sombong" data-fx="rise">tidak sombong</span>
      <span data-at="s8:hikmah" data-fx="rise">diberi hikmah sejak kecil</span>
    </div>
  </div>
</div>
<div class="p" data-in="s8:Tidak" data-out="s8:Kisah">
  <div class="card">
    <div class="h m">Tidak ada kata terlambat untuk berdoa.</div>
    <div class="ask" data-at="s8:Doa" data-fx="rise">Doa apa yang sudah lama kamu simpan?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(11,14,26,0),rgba(11,14,26,.42) 45%,rgba(11,14,26,.42) 70%,rgba(11,14,26,0))}
#chip{background:rgba(13,17,34,.72);padding:5px 12px 4px;border:1px solid rgba(240,180,76,.55);font-size:19px;letter-spacing:.07em}
#cut{position:absolute;top:0;bottom:0;left:0;width:2600px;z-index:12;pointer-events:none;background:${GLASS};opacity:.96;transform:translateX(-2700px)}
.p{--s:1;--o:0;--b:0;--bo:0}
.p:after{content:"";position:absolute;top:0;bottom:0;width:170px;left:calc(var(--b) * 100% - 85px);background:${GLASS};filter:blur(5px);opacity:var(--bo);pointer-events:none;mix-blend-mode:screen}
.card{position:relative;background:${CARD};padding:34px 34px 28px;border:1.5px solid rgba(240,180,76,.5);box-shadow:0 22px 46px rgba(0,0,0,.45);
 clip-path:inset(0 calc((1 - var(--s)) * 100%) 0 calc(var(--o) * 100%))}
.card:before{content:"";position:absolute;left:0;right:0;top:0;height:10px;
 background:linear-gradient(90deg,#c4243a 0 16%,#14101c 16% 17%,#f0a92a 17% 33%,#14101c 33% 34%,#17905c 34% 50%,#14101c 50% 51%,#1f45b5 51% 67%,#14101c 67% 68%,#22b0b0 68% 84%,#14101c 84% 85%,#d8577a 85% 100%)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Inter,sans-serif;font-weight:700;font-size:24px;letter-spacing:.16em;color:${AMB};margin-bottom:10px}
.rf{display:inline-block;font-family:Inter,sans-serif;font-weight:700;font-size:21px;letter-spacing:.05em;color:${INK};background:${TQ};padding:4px 12px 3px;white-space:nowrap}
.h{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:92px;line-height:.98;color:${CREAM};letter-spacing:.01em}
.h.m{font-size:60px;line-height:1.06}
.sub{font-family:Inter,sans-serif;font-weight:600;font-size:34px;line-height:1.25;color:#DCD3C2;margin-top:12px}
.sub.s2{font-size:30px;color:#C9C1B2}
.tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.tags span{font-family:Inter,sans-serif;font-weight:600;font-size:29px;color:${CREAM};border:1.5px solid rgba(143,216,224,.6);background:rgba(143,216,224,.1);padding:6px 14px}
.chipl{display:inline-block;margin-top:14px;font-family:Inter,sans-serif;font-weight:700;font-size:24px;letter-spacing:.16em;color:${INK};background:${AMB};padding:7px 14px 6px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:52px;line-height:1.75;color:#F3D9A0}
.tr{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:600;font-size:38px;line-height:1.22;color:${CREAM};margin-top:8px}
.tr em{font-style:italic;color:#FFE7B0;background:linear-gradient(${AMB},${AMB}) left/0% 100% no-repeat;padding:0 4px}
.qt{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:56px;line-height:1.1;color:${CREAM}}
.qt.s{font-size:48px;margin-top:14px;color:#F3D9A0}
.vs{display:flex;flex-direction:column;gap:10px;margin-top:14px}
.vs div{display:flex;align-items:center;gap:14px;font-family:Inter,sans-serif;font-weight:600;font-size:33px;line-height:1.2;color:${CREAM}}
.vs i{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;font-style:normal;font-weight:700;font-size:30px}
.vs .no{color:#B9B0A2}.vs .no i{background:#5a2330;color:#ffb3bd}.vs .no s{text-decoration-color:#E2607A;text-decoration-thickness:4px}
.vs .yes i{background:${AMB};color:${INK}}
.name{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:150px;line-height:.95;letter-spacing:.08em;color:#FFE7B0;text-shadow:0 0 26px rgba(240,180,76,.55),0 0 60px rgba(34,176,176,.35)}
.cyc{display:flex;align-items:center;gap:22px;margin-top:14px}
.arc{width:300px;height:124px;flex:none}
.cycr{display:flex;flex-direction:column;gap:14px}
.nights{display:flex;align-items:center;gap:10px}
.nights .nd{width:30px;height:30px;border-radius:50%;border:2px solid #CFE0FF;box-sizing:border-box}
.nights span{font-family:Inter,sans-serif;font-weight:700;font-size:24px;letter-spacing:.16em;color:#CFE0FF;margin-left:6px}
.mute{position:relative;display:flex;align-items:center;gap:7px;height:44px;padding:0 6px}
.mute b{width:9px;height:6px;background:rgba(246,238,220,.6)}
.mute s{position:absolute;left:-4px;right:-4px;top:50%;height:4px;background:#E2607A;transform:rotate(-18deg)}
.sg{display:flex;align-items:center;gap:18px}
.sign{width:120px;height:120px;flex:none}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.ls span{font-family:Inter,sans-serif;font-weight:600;font-size:36px;line-height:1.2;color:${CREAM};padding-left:40px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.32em;width:18px;height:18px;background:${AMB};transform:rotate(45deg)}
.ask{display:inline-block;margin-top:16px;font-family:Inter,sans-serif;font-weight:700;font-size:36px;line-height:1.2;color:${INK};background:${AMB};padding:10px 18px}
#outro{--s:0;clip-path:inset(0 calc((1 - var(--s)) * 100%) 0 0)}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:rambutnya", "s1:uban", "s1:mandul", "s1:harapannya", "s1:habis", "s1:berdoa",
  "s2:kisah", "s2:berdoa", "s2:berbisik", "s2:mihrab", "s2:tidak",
  "s3:belum", "s3:kecewa", "s4:kuncinya", "s4:keadaannya", "s4:pengalamannya", "s4:mengecewakannya",
  "s5:datang", "s5:gembira", "s5:anak", "s5:Yahya",
  "s6:mandul", "s6:hal", "s6:dulu", "s6:ciptakan", "s6:sekali",
  "s7:tanda", "s7:tiga", "s7:manusia", "s7:sehat", "s7:keluar", "s7:memberi", "s7:bertasbihlah", "s7:petang",
  "s8:Yahya", "s8:hikmah", "s8:Tidak", "s8:Doa", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "21", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.42, html, css, signature: "EP21_ZAKARIA_DOA_USIA_TUA",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Inter,sans-serif", chipColor: CREAM,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:16},{opacity:1,y:0,duration:.4,ease:'power3.out'},t);},
 hl:(e,t)=>{tl.set(e,{opacity:1},0);tl.set(e,{color:'#FFE7B0'},0);tl.set(e,{color:'${INK}'},t+.15);tl.fromTo(e,{backgroundSize:'0% 100%'},{backgroundSize:'100% 100%',duration:.5,ease:'power2.out'},t);},
 bloom:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,scale:.82,filter:'brightness(2.4) blur(6px)'},{opacity:1,scale:1,filter:'brightness(1) blur(0px)',duration:.7,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--s':0,'--b':0,'--bo':1,opacity:1},{'--s':1,'--b':1,duration:.28,ease:'power2.out'},a-.1);tl.fromTo(p,{'--bo':1},{'--bo':0,duration:.12,ease:'none',immediateRender:false},a+.14);}`,
  panelOut: `(tl,p,b)=>{tl.fromTo(p,{'--o':0,'--b':0,'--bo':1},{'--o':1,'--b':1,duration:.24,ease:'power2.in',immediateRender:false},b-.26);}`,
  outroIn: `tl.fromTo('#outro',{'--s':0},{'--s':1,duration:.8,ease:'power2.inOut'},OUT-.25);`,
  hud: `(()=>{const cut=q('#cut'),orb=q('#orb'),oc=q('#orbcut'),nd=[...document.querySelectorAll('.nd')];
const T0=AT['s7:tiga']-.1,NP=1.45,TC=K.s8;
return (t)=>{const u=(t-(TC-.42))/.84;cut.style.transform='translateX('+(u<=0||u>=1?-2700:(-2600+u*(1080+2600))).toFixed(1)+'px)';
if(!orb)return;let ph=(t-T0)/NP;const done=ph>=3;ph=Math.max(0,Math.min(3,ph));
const psi=done||t<T0?0.25:((ph+0.25)%1);const day=psi<0.5;const a=Math.PI*(1-(day?psi:psi-0.5)/0.5);
const x=150+120*Math.cos(a),y=112-96*Math.sin(a);orb.setAttribute('cx',x.toFixed(1));orb.setAttribute('cy',y.toFixed(1));orb.setAttribute('fill',day?'${AMB}':'#DCE7FF');
oc.setAttribute('cx',(x+7).toFixed(1));oc.setAttribute('cy',(y-6).toFixed(1));oc.setAttribute('opacity',day?0:1);
const n=t<T0?0:Math.min(3,Math.floor(ph+0.5));nd.forEach((e,i)=>{e.style.background=i<n?'#DCE7FF':'transparent';});};})()`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Inter,sans-serif;font-weight:700;font-size:52px;line-height:1.34;color:${CREAM};background:rgba(13,17,34,.9);padding:12px 20px 10px;box-shadow:0 10px 26px rgba(0,0,0,.4)}
.capin:before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#c4243a 0 20%,#f0a92a 20% 40%,#17905c 40% 60%,#1f45b5 60% 80%,#22b0b0 80% 100%)}
.w{display:inline-block;margin:0 .06em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(240,180,76,0)"},0);tl.set("#${id}",{color:"${INK}",backgroundColor:"rgb(240,180,76)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(240,180,76,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Doa di Usia Tua", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
