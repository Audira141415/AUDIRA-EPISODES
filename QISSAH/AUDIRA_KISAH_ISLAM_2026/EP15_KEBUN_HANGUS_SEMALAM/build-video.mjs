// EP15 KEBUN YANG HANGUS SEMALAM. CLAYWORLD: a stop-motion plasticine orchard diorama.
// Panels are soft clay slabs (cream plasticine with a thick pressed edge). They arrive with a squash-and-stretch pop
// (flattened blob -> overshoot tall -> settle) and leave by squashing down and popping away. Reveals wobble in like clay.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#1a2238", INK = "#4A2A1A", TERRA = "#D9673A", LEAF = "#5E9A3A", CREAM = "#F6E9D2";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP15_kebun.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V18 = verse("68:18");
const V20 = verse("68:20");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="blob"` : ""}>${r}</span>`;
const basket = `<svg class="ico" viewBox="0 0 80 64"><circle cx="24" cy="22" r="10" fill="#E2552A"/><circle cx="40" cy="16" r="11" fill="#F2D03C"/><circle cx="56" cy="22" r="10" fill="#D7263D"/><path d="M6 26h68l-8 32H14z" fill="#C89048"/><path d="M14 36h52M18 46h44" stroke="#9a6a30" stroke-width="4" stroke-linecap="round"/></svg>`;
const sprout = `<svg class="ico s" viewBox="0 0 64 64"><path d="M32 60V30" stroke="${LEAF}" stroke-width="6" stroke-linecap="round"/><path d="M32 34C20 34 12 26 10 16c12 0 20 6 22 18z" fill="#6CC04A"/><path d="M32 30c2-12 10-18 22-18-2 10-10 18-22 18z" fill="#6CC04A"/><ellipse cx="32" cy="60" rx="16" ry="4" fill="#3a2a22"/></svg>`;

const html = `
<div id="fb"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 15</div>
    <div class="h">KEBUN YANG<br>HANGUS SEMALAM</div>
    <div class="row" data-at="s1:hitam" data-fx="blob"><b class="tag">HITAM SEPERTI MALAM</b>${ref("QS 68:20")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Menurut">
  <div class="card">
    <div class="k"><i></i>SURAH AL-QALAM ${ref("QS 68:17", "s2:Al-Qalam")}</div>
    <div class="h m" data-at="s2:pemilik" data-fx="blob">PARA PEMILIK KEBUN</div>
  </div>
</div>
<div class="p" data-in="s2:Menurut" data-out="s3">
  <div class="card ic">
    ${basket}
    <div>
      <div class="k"><i></i>KILAS BALIK</div>
      <div class="lab" data-at="s2:Ibnu" data-fx="blob">riwayat dikutip Tafsir Ibnu Katsir</div>
      <div class="h s">Sang ayah berbagi dengan orang miskin</div>
      <div class="sub" data-at="s2:ayah" data-fx="blob">menyisihkan sebagian panen</div>
    </div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Mereka">
  <div class="card">
    <div class="k"><i></i>SETELAH SANG AYAH WAFAT</div>
    <div class="lab" data-at="s3:sepakat" data-fx="blob">anak-anaknya sepakat</div>
    <div class="qt" data-at="s3:tahun" data-fx="blob">&ldquo;Tahun ini, jangan beri orang miskin apa pun.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3:Mereka" data-out="s4">
  <div class="card">
    <div class="k"><i></i>MEREKA BERSUMPAH ${ref("QS 68:17", "s3:bersumpah")}</div>
    <div class="sub" data-at="s3:memetik" data-fx="blob">memetik hasilnya pagi-pagi</div>
    <div class="ar" data-at="s3:tanpa" data-fx="blob">${V18}</div>
    <div class="row" data-at="s3:tanpa" data-fx="blob"><b class="big">tanpa insya Allah</b>${ref("QS 68:18")}</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k"><i></i>KETIKA MEREKA TIDUR ${ref("QS 68:19", "s4:bencana")}</div>
    <div class="ar xl" data-at="s4:Jadilah" data-fx="blob">${V20}</div>
    <div class="row" data-at="s4:hitam" data-fx="blob"><span class="sub">hitam seperti malam yang gelap gulita</span>${ref("QS 68:20")}</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="k"><i></i>BERANGKAT SAMBIL BERBISIK ${ref("QS 68:23", "s5:berbisik")}</div>
    <div class="qt" data-at="s5:hari" data-fx="blob">&ldquo;Hari ini jangan sampai ada orang miskin masuk.&rdquo; ${ref("QS 68:24")}</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Yang">
  <div class="card">
    <div class="k"><i></i>MELIHAT KEBUNNYA ${ref("QS 68:26", "s6:melihat")}</div>
    <div class="qt" data-at="s6:kita" data-fx="blob">&ldquo;Kita pasti tersesat.&rdquo;</div>
    <div class="qt" data-at="s6:Bukan" data-fx="blob">&ldquo;Kita memang tidak mendapat apa-apa.&rdquo; ${ref("QS 68:27")}</div>
  </div>
</div>
<div class="p" data-in="s6:Yang" data-out="s7">
  <div class="card">
    <div class="k"><i></i>YANG PALING BIJAK ${ref("QS 68:28", "s6:bijak")}</div>
    <div class="qt big">&ldquo;Kenapa kalian tidak bertasbih?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Semoga">
  <div class="card">
    <div class="k"><i></i>SALING MENYALAHKAN ${ref("QS 68:30", "s7:menyalahkan")}</div>
    <div class="qt" data-at="s7:Mahasuci" data-fx="blob">&ldquo;Mahasuci Tuhan kami, sungguh kami orang-orang yang zalim.&rdquo; ${ref("QS 68:29")}</div>
  </div>
</div>
<div class="p" data-in="s7:Semoga" data-out="s8">
  <div class="card ic">
    ${sprout}
    <div>
      <div class="k"><i></i>MEREKA BERHARAP ${ref("QS 68:32")}</div>
      <div class="h s">Semoga diganti yang lebih baik</div>
      <div class="ls"><span data-at="s7:ampunan" data-fx="blob">ampunan dari Tuhan kami</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>PELAJARAN</div>
    <div class="h s">Harta yang ditahan dari orang lain bisa hilang dalam semalam.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="blob">Kenapa memberi justru menjaga rezeki?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(30,18,10,0),rgba(30,18,10,.5) 40%,rgba(30,18,10,.5) 72%,rgba(30,18,10,0))}
#fb{position:absolute;inset:0;z-index:8;opacity:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(255,200,120,0) 46%,rgba(214,140,60,.55) 100%);mix-blend-mode:multiply}
.p{transform-origin:50% 100%}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:radial-gradient(120% 90% at 30% 18%,#FFF6E4 0%,${CREAM} 45%,#EAD6B4 100%);padding:20px 30px 24px;border-radius:34px;
 box-shadow:0 10px 0 #C49A6C,0 12px 0 #A87E52,0 26px 34px rgba(20,10,4,.42),inset 0 -8px 14px rgba(150,100,55,.22),inset 0 6px 10px rgba(255,255,255,.7)}
.card:after{content:"";position:absolute;inset:0;border-radius:34px;background:url(assets/img/grain.png);opacity:.16;mix-blend-mode:multiply;pointer-events:none}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Fredoka,sans-serif;font-weight:600;font-size:28px;letter-spacing:.08em;color:${TERRA};margin-bottom:6px}
.k i{display:block;width:18px;height:14px;border-radius:50%;background:${TERRA};box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
.h{font-family:Fredoka,sans-serif;font-weight:700;font-size:66px;line-height:1.02;color:${INK}}
.h.m{font-size:58px}
.h.s{font-family:Nunito,sans-serif;font-weight:800;font-size:44px;line-height:1.16}
.sub{font-family:Nunito,sans-serif;font-weight:800;font-size:38px;line-height:1.18;color:#7A4A2A}
.lab{font-family:Nunito,sans-serif;font-weight:700;font-style:italic;font-size:30px;color:#8a6a50;margin-bottom:4px}
.qt{font-family:Nunito,sans-serif;font-weight:800;font-size:44px;line-height:1.18;color:${INK};margin-top:4px}
.qt.big{font-size:54px}
.qt .rf{vertical-align:middle;margin-left:6px}
.rf{display:inline-block;font-family:Fredoka,sans-serif;font-weight:600;font-size:25px;letter-spacing:.04em;color:#FFF8E8;background:${LEAF};padding:5px 15px 4px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 0 #3F6E26,inset 0 2px 3px rgba(255,255,255,.35)}
.row{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap}
.tag{font-family:Fredoka,sans-serif;font-weight:700;font-size:38px;letter-spacing:.03em;color:#2B2422;background:#BFB2A6;padding:6px 18px;border-radius:999px;box-shadow:0 5px 0 #8a7e74}
.big{font-family:Fredoka,sans-serif;font-weight:700;font-size:52px;color:#FFF8E8;background:${TERRA};padding:6px 22px 8px;border-radius:999px;box-shadow:0 6px 0 #9E4320}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:64px;line-height:1.55;color:#3A2416;margin-top:2px}
.ar.xl{font-size:80px;line-height:1.5}
.ic{display:inline-flex;align-items:center;gap:22px}
.ico{flex:none;width:118px;height:94px}
.ico.s{width:96px;height:96px}
.ls{display:flex;flex-direction:column;gap:6px}
.ls span{font-family:Nunito,sans-serif;font-weight:800;font-size:42px;color:${INK};padding-left:34px;position:relative}
.ls span:before{content:"";position:absolute;left:0;top:.42em;width:20px;height:16px;border-radius:50%;background:#6CC04A;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
.ask{display:inline-block;margin-top:14px;font-family:Fredoka,sans-serif;font-weight:600;font-size:40px;line-height:1.15;color:#FFF8E8;background:${TERRA};padding:10px 22px 12px;border-radius:26px;box-shadow:0 6px 0 #9E4320}
`;

// HUD: warm flashback tint over s2 (the father's time).
const hud = `(t)=>{const e=document.getElementById('fb');if(!e)return;const sm=(a,b)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};
e.style.opacity=(sm(K.s2-.2,K.s2+.5)*(1-sm(K.s3-.4,K.s3+.2))).toFixed(3);}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Paginya", "s1:bersumpah", "s1:Tidak", "s2:ayah", "s2:menyisihkan", "s2:panen", "s2:Menurut", "s2:Ibnu", "s2:miskin",
  "s3:anak-anaknya", "s3:sepakat", "s3:bersumpah", "s3:memetik", "s3:tanpa", "s3:Allah", "s3:Mereka", "s3:wafat",
  "s4:bencana", "s4:tidur", "s4:hitam", "s4:Jadilah", "s4:gulita", "s4:ditimpa",
  "s5:memanggil", "s5:berbisik", "s5:hari", "s5:kebunmu",
  "s6:tersesat", "s6:Bukan", "s6:apa-apa", "s6:Yang", "s6:bukankah", "s6:bertasbih",
  "s7:saling", "s7:mengaku", "s7:Mahasuci", "s7:Semoga", "s7:ampunan", "s8:semalam", "s8:Menurut", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "15", bg: BG, vig: 0.38, grain: 0.07, capfloor: 0.5, html, css, hud, signature: "EP15_KEBUN_HANGUS_SEMALAM",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Fredoka,sans-serif", chipColor: "#FFF1DC",
  extraAt: WORLD_AT,
  fxExtra: `blob:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,scaleX:1.35,scaleY:.45,transformOrigin:'50% 100%'},{opacity:1,scaleX:1,scaleY:1,duration:.5,ease:'elastic.out(1,.55)'},t);},`,
  // Clay squash-and-stretch pop in: a flattened blob springs up, overshoots tall, settles. Out: squashes down, stretches up and pops away.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:0,scaleX:.5,scaleY:.12,y:24},a-.21);tl.to(p,{keyframes:[{opacity:1,scaleX:1.16,scaleY:.7,y:0,duration:.11,ease:'power2.out'},{scaleX:.9,scaleY:1.12,duration:.11,ease:'power1.inOut'},{scaleX:1.04,scaleY:.96,duration:.09,ease:'power1.inOut'},{scaleX:1,scaleY:1,duration:.1,ease:'power1.out'}]},a-.2);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{keyframes:[{scaleX:1.12,scaleY:.8,duration:.09,ease:'power1.in'},{scaleX:.72,scaleY:1.18,y:-18,duration:.09,ease:'power1.out'},{scaleX:.08,scaleY:.08,y:-30,opacity:0,duration:.12,ease:'power2.in'}]},b-.31);}`,
  outroIn: `gsap.set('#outro',{opacity:0,scaleX:.6,scaleY:.2,transformOrigin:'50% 60%'});tl.to('#outro',{keyframes:[{opacity:1,scaleX:1.08,scaleY:.86,duration:.16,ease:'power2.out'},{scaleX:.97,scaleY:1.04,duration:.14},{scaleX:1,scaleY:1,duration:.12}]},OUT-.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Fredoka,sans-serif;font-weight:600;font-size:60px;line-height:1.3;color:#FFF4E2;text-shadow:0 3px 0 #4A2A1A,0 0 10px rgba(40,20,8,.85),0 0 3px rgba(40,20,8,.9)}
.w{display:inline-block;margin:0 .14em;padding:0 .14em;border-radius:.45em;transform-origin:50% 100%}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF4E2",backgroundColor:"rgba(217,103,58,0)"},{color:"#FFFFFF",backgroundColor:"rgba(217,103,58,1)",duration:.06},${w.start.toFixed(3)});tl.fromTo("#${id}",{scaleX:1.18,scaleY:.8},{scaleX:1,scaleY:1,duration:.24,ease:"elastic.out(1,.5)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFE1B0",backgroundColor:"rgba(217,103,58,0)",duration:.16},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,scaleY:.6,transformOrigin:"50% 100%"},{opacity:1,scaleY:1,duration:.26,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kebun Hangus Semalam", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
