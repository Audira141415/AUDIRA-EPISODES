// EP07 SULAIMAN, SEMUT DAN HUD-HUD. WATERCOLOR storybook: warm paper, soft pigment washes, pencil lines, macro ant valley,
// a painted map with pop-up dioramas. Panels are deckled paper cards that bloom in like wet pigment and bleed out.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#3A2A20", SIENNA = "#9A4A2C", INDIGO = "#2E3A6E", PAPER = "#F1E3C6", BG = "#F2E6CF";

// Arabic is cut by word index straight from the Uthmani file (never retyped).
const QV = {};
for (const l of readFileSync("../_research/quran/EP07_sulaiman.txt", "utf8").split(/\r?\n/)) {
  const m = l.match(/^QS (27:\d+) \| (.*)$/);
  if (m) QV[m[1]] = m[2].trim().split(" ");
}
const ar = (v, a, b) => QV[v].slice(a, b).join(" ");

const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const PAPER_BG = svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' preserveAspectRatio='none'><defs><filter id='f' x='-5%' y='-5%' width='110%' height='110%'><feTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='3' seed='4'/><feDisplacementMap in='SourceGraphic' scale='22'/></filter><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='2'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.10 0'/><feComposite in2='SourceGraphic' operator='in'/></filter></defs><g filter='url(#f)'><rect x='14' y='14' width='872' height='572' rx='10' fill='${PAPER}'/><rect x='14' y='14' width='872' height='572' rx='10' fill='none' stroke='rgba(154,74,44,.28)' stroke-width='10'/></g><rect x='14' y='14' width='872' height='572' fill='white' filter='url(#g)'/></svg>`);
const WASH = (c) => svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' seed='9'/><feDisplacementMap in='SourceGraphic' scale='60'/><feGaussianBlur stdDeviation='3'/></filter></defs><ellipse cx='300' cy='100' rx='260' ry='70' fill='${c}' fill-opacity='.35' stroke='${c}' stroke-opacity='.5' stroke-width='8' filter='url(#f)'/></svg>`);

const kick = (txt) => `<div class="k"><span>${txt}</span></div>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    ${kick("KISAH DALAM AL-QUR'AN &middot; 07")}
    <div class="h">Seekor semut<br>berteriak</div>
    <div class="hand" data-at="s1:tersenyum" data-fx="wash">&hellip;dan seorang nabi tersenyum.</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Bala">
  <div class="card">
    ${kick("QS AN-NAML 27:16")}
    <div class="h">Mewarisi Dawud</div>
    <div class="hand" data-at="s2:diajari" data-fx="pen">diajari bahasa burung</div>
  </div>
</div>
<div class="p" data-in="s2:Bala" data-out="s3">
  <div class="card">
    ${kick("BALA TENTARA &middot; QS AN-NAML 27:17")}
    <div class="h s">Bala tentaranya</div>
    <div class="chips"><span class="chip" data-at="s2:jin" data-fx="popd">jin</span><span class="chip" data-at="s2:manusia" data-fx="popd">manusia</span><span class="chip" data-at="s2:burung#2" data-fx="popd">burung</span></div>
    <div class="hand" data-at="s2:berbaris" data-fx="pen">berbaris dengan tertib</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:wahai">
  <div class="card">
    ${kick("LEMBAH SEMUT")}
    <div class="h m">Saat mereka tiba<br>di lembah semut</div>
    <div class="hand" data-at="s3:berkata" data-fx="wash">seekor semut berkata&hellip;</div>
  </div>
</div>
<div class="p" data-in="s3:wahai" data-out="s4">
  <div class="card">
    ${kick("QS AN-NAML 27:18")}
    <div class="ar" data-at="s3:wahai" data-fx="penr">${ar("27:18", 8, 19)}</div>
    <div class="qt" data-at="s3:masuklah" data-fx="wash">&ldquo;Wahai semut-semut! Masuklah ke dalam sarang-sarangmu, agar kamu tidak diinjak oleh Sulaiman dan bala tentaranya, sedangkan mereka tidak menyadari.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Kekuasaan">
  <div class="card">
    ${kick("TERSENYUM, LALU BERDOA &middot; QS AN-NAML 27:19")}
    <div class="h s">Sulaiman tersenyum</div>
    <div class="ar" data-at="s4:berdoa" data-fx="penr">${ar("27:19", 5, 10)}</div>
    <div class="qt" data-at="s4:ilhamkan" data-fx="wash">&ldquo;Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Kekuasaan" data-out="s5">
  <div class="card">
    <div class="hand big">Kekuasaan sebesar itu,</div>
    <div class="h m" data-at="s4:minta" data-fx="wash">yang ia minta justru <em>rasa syukur.</em></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Tak">
  <div class="card">
    ${kick("QS AN-NAML 27:20")}
    <div class="h m">Ia memeriksa<br>burung-burung</div>
    <div class="hand" data-at="s5:Hud-hud" data-fx="pen">Hud-hud tidak ada.</div>
  </div>
</div>
<div class="p" data-in="s5:Tak" data-out="s6">
  <div class="card">
    ${kick("KABAR DARI SABA &middot; QS AN-NAML 27:22-24")}
    <div class="h s">Hud-hud datang membawa kabar</div>
    <div class="ln" data-at="s5:ratu" data-fx="wash"><i></i>seorang ratu memerintah</div>
    <div class="ln" data-at="s5:singgasana" data-fx="wash"><i></i>punya singgasana besar</div>
    <div class="ln" data-at="s5:menyembah" data-fx="wash"><i></i>kaumnya menyembah matahari</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Sang">
  <div class="card">
    ${kick("SURAT YANG MULIA &middot; QS AN-NAML 27:30")}
    <div class="h s">Sulaiman mengirim surat</div>
    <div class="ar big" data-at="s6:bismillah" data-fx="penr">${ar("27:30", 4, 8)}</div>
    <div class="qt" data-at="s6:bismillah" data-fx="wash">&ldquo;Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6:Sang" data-out="s6:Sulaiman#2">
  <div class="card">
    ${kick("MUSYAWARAH &middot; QS AN-NAML 27:32-35")}
    <div class="h s">Sang ratu bermusyawarah dengan para pembesarnya</div>
    <div class="hand" data-at="s6:hadiah" data-fx="pen">lalu mengirim hadiah</div>
  </div>
</div>
<div class="p" data-in="s6:Sulaiman#2" data-out="s7">
  <div class="card">
    ${kick("HADIAH DITOLAK &middot; QS AN-NAML 27:36")}
    <div class="h s">Sulaiman menolak</div>
    <div class="ar" data-at="s6:apa" data-fx="penr">${ar("27:36", 6, 12)}</div>
    <div class="qt" data-at="s6:Allah" data-fx="wash">&ldquo;Apa yang Allah berikan kepadaku lebih baik daripada apa yang Allah berikan kepadamu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Lalu">
  <div class="card">
    ${kick("QS AN-NAML 27:40")}
    <div class="h s">Seorang yang berilmu dari Kitab memindahkan singgasana</div>
    <div class="hand" data-at="s7:sebelum" data-fx="pen">sebelum mata sempat berkedip</div>
  </div>
</div>
<div class="p" data-in="s7:Lalu" data-out="s8">
  <div class="card">
    ${kick("LANTAI ISTANA &middot; QS AN-NAML 27:44")}
    <div class="h s">Sang ratu masuk istana</div>
    <div class="hand" data-at="s7:kolam" data-fx="wash">dikira kolam air&hellip;</div>
    <div class="ar" data-at="s7:Ternyata" data-fx="penr">${ar("27:44", 14, 19)}</div>
    <div class="qt" data-at="s7:lantai" data-fx="wash">&ldquo;Sesungguhnya ini hanyalah lantai istana yang dilapisi kaca.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="s8:Kekuasaan">
  <div class="card">
    ${kick("BERSERAH DIRI &middot; QS AN-NAML 27:44")}
    <div class="h s">Di akhir kisah</div>
    <div class="ar" data-at="s8:berserah" data-fx="penr">${ar("27:44", 25, 31)}</div>
    <div class="qt" data-at="s8:Allah" data-fx="wash">&ldquo;Aku berserah diri bersama Sulaiman kepada Allah, Tuhan seluruh alam.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8:Kekuasaan" data-out="@END">
  <div class="card">
    <div class="hand big">Kekuasaan sebesar itu dipakai untuk bersyukur.</div>
    <div class="ask" data-at="s8:Kalau" data-fx="wash">Kalau kamu diberi kelebihan, apa yang pertama kamu lakukan?</div>
  </div>
</div>`;

const css = `
#vig{background:radial-gradient(ellipse at 50% 45%,rgba(90,60,30,0) 58%,rgba(90,60,30,.22) 100%)}
#capfloor{background:linear-gradient(180deg,rgba(246,238,220,0),rgba(246,238,220,.8) 40%,rgba(246,238,220,.8) 72%,rgba(246,238,220,0))}
.p{--r:170;-webkit-mask-image:radial-gradient(ellipse 120% 95% at 18% 22%,#000 calc(var(--r) * 1% - 12%),rgba(0,0,0,.55) calc(var(--r) * 1%),rgba(0,0,0,0) calc(var(--r) * 1% + 16%));mask-image:radial-gradient(ellipse 120% 95% at 18% 22%,#000 calc(var(--r) * 1% - 12%),rgba(0,0,0,.55) calc(var(--r) * 1%),rgba(0,0,0,0) calc(var(--r) * 1% + 16%))}
.card{position:relative;z-index:0;padding:30px 40px 34px;background-image:${PAPER_BG};background-size:100% 100%;filter:drop-shadow(0 10px 16px rgba(90,60,30,.2))}
.card:before{content:"";position:absolute;z-index:-1;left:-10px;top:-16px;width:62%;height:110px;background-image:${WASH("#C9874C")};background-size:100% 100%}
.k{font-family:Lora,serif;font-weight:700;font-size:25px;letter-spacing:.12em;color:${SIENNA};margin-bottom:12px}
.k span{background:linear-gradient(transparent 62%,rgba(201,135,76,.32) 62%,rgba(201,135,76,.32) 92%,transparent 92%)}
.h{font-family:Lora,serif;font-weight:700;font-size:70px;line-height:1.06;color:${INK}}
.h.m{font-size:58px;line-height:1.1}
.h.s{font-size:46px;line-height:1.14}
.h em{font-family:Caveat,cursive;font-style:normal;font-weight:700;font-size:1.25em;color:${SIENNA}}
.hand{font-family:Caveat,cursive;font-weight:700;font-size:54px;line-height:1.1;color:${SIENNA};margin-top:8px}
.hand.big{font-size:68px;color:${INDIGO};margin:0 0 6px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:54px;line-height:1.75;color:${INDIGO};margin:2px 0 6px}
.ar.big{font-size:74px;text-align:center}
.qt{font-family:Lora,serif;font-style:italic;font-weight:500;font-size:35px;line-height:1.3;color:${INK}}
.chips{display:flex;gap:18px;flex-wrap:wrap;margin:6px 0 8px}
.chip{font-family:Caveat,cursive;font-weight:700;font-size:60px;color:${INK};padding:2px 26px 6px;background-image:${WASH("#C9874C")};background-size:100% 100%}
.ln{display:flex;align-items:center;gap:16px;font-family:Lora,serif;font-weight:600;font-size:40px;color:${INK};padding:9px 0;border-top:2px dashed rgba(154,74,44,.3)}
.ln i{flex:none;width:18px;height:18px;border-radius:50%;background:${SIENNA};opacity:.8}
.ask{margin-top:16px;font-family:Lora,serif;font-weight:700;font-size:42px;line-height:1.2;color:${PAPER};background:${INDIGO};padding:14px 22px;border-radius:6px 18px 8px 14px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:berteriak", "s1:memperingatkan", "s1:tersenyum", "s3:lembah", "s3:berkata", "s3:wahai", "s3:masuklah", "s3:terinjak", "s3:menyadari",
  "s4:tersenyum", "s4:berdoa", "s4:Kekuasaan", "s5:memeriksa", "s5:Hud-hud", "s5:Tak", "s5:hud-hud", "s5:kabar", "s5:Saba", "s5:ratu", "s5:singgasana", "s5:menyembah", "s5:matahari",
  "s6:surat", "s6:dibuka", "s6:bismillah", "s6:Sang", "s6:bermusyawarah", "s6:hadiah", "s6:menolak", "s6:Allah", "s7:Sebelum", "s7:memindahkan", "s7:berkedip", "s7:masuk",
  "s7:kolam", "s7:Ternyata", "s7:kaca", "s8:berserah", "s8:Kekuasaan", "s8:Kalau"];
const { AT, K } = writeWorld(TL, at, {
  ep: "07", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0, html, css, chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Lora,serif", chipColor: INK,
  extraAt: WORLD_AT,
  fxExtra: `wash:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'blur(0px)',duration:.32,ease:'power2.out'},t);},
 pen:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:1,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.6,ease:'power1.inOut'},t);},
 penr:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:1,clipPath:'inset(0 0 0 100%)'},{opacity:1,clipPath:'inset(0 0 0 0%)',duration:.9,ease:'power1.inOut'},t);},
 popd:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{scale:.7,opacity:0},{scale:1,opacity:1,duration:.3,ease:'back.out(1.5)'},t);},`,
  // Watercolor bleed: the card blooms out from its top-left corner like wet pigment, then blurs and spreads away.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{'--r':0,opacity:1,filter:'blur(5px) saturate(1.4)'},{'--r':170,opacity:1,filter:'blur(0px) saturate(1)',duration:.4,ease:'power2.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,filter:'blur(16px) saturate(1.8)',scale:1.035,duration:.36,ease:'power1.in'},b-.34)`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'blur(24px)'});tl.to('#outro',{opacity:1,filter:'blur(0px)',duration:.7,ease:'power2.out'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:250px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:100%;box-sizing:border-box;padding:6px 20px 10px;border-radius:14px 22px 12px 26px;background:rgba(246,238,220,.9);box-shadow:0 0 0 2px rgba(154,74,44,.18),0 6px 22px rgba(70,45,25,.28);text-align:center;font-family:Lora,serif;font-weight:700;font-size:56px;line-height:1.34;color:${INK};text-shadow:0 0 14px rgba(246,238,220,.98),0 0 5px rgba(246,238,220,.98)}
.w{display:inline-block;margin:0 .1em;padding:0 .14em;border-radius:.35em .2em .4em .25em;background:rgba(201,135,76,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",backgroundColor:"rgba(201,135,76,0)"},{color:"#2B1508",backgroundColor:"rgba(226,168,104,.9)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",backgroundColor:"rgba(201,135,76,0)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:.55,y:8},{opacity:1,y:0,duration:.12,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sulaiman, Semut dan Hud-hud", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
