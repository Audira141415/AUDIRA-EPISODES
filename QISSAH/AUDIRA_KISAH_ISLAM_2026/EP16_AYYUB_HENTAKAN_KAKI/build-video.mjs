// EP16 AYYUB, HENTAKAN KAKI. TERRARIUM: a miniature world inside a glass bell jar in soft window light.
// Panels are cream specimen labels with a brass rule. They arrive fogged, as if breathed on, and the condensation is
// wiped off left to right; they leave by fogging over again. Reveals mist in. Arabic is copied from the verse file.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#1e1812", INK = "#2A2620", MOSS = "#4F6E32", TEAL = "#2C6E72", BRASS = "#A8843E", CREAM = "#F4EFE3";

// Arabic is taken from the verse file by word index, never retyped.
const QF = readFileSync("../_research/quran/EP16_ayyub.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const words = (ref) => verse(ref).split(/\s+/);
const V2183 = words("21:83").slice(5).join(" ");                       // the prayer itself: anni massaniya ad-durru ...
const V3842 = verse("38:42");                                           // whole verse
const w3844 = words("38:44"); const V3844 = w3844.slice(w3844.indexOf("ۗ") + 1).join(" "); // inna wajadnahu sabiran ... awwab
if (!V2183 || !V3842 || !V3844) throw new Error("arabic");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="mist"` : ""}>${r}</span>`;
const leaf = `<svg class="lf" viewBox="0 0 24 24"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill="${MOSS}"/><path d="M5 19L15 9" stroke="${CREAM}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const house = (lit) => `<svg class="hs${lit ? " on" : ""}" viewBox="0 0 34 30"><rect x="3" y="8" width="28" height="20" rx="1.5" fill="${lit ? "#D8BE8E" : "#8C7A62"}"/><rect x="1" y="6" width="32" height="4" fill="${lit ? "#C4A472" : "#6E5E4A"}"/><rect x="7" y="16" width="6" height="12" fill="${lit ? "#F2B544" : "#2A2018"}"/><rect x="18" y="14" width="5" height="6" fill="${lit ? "#F2B544" : "#2A2018"}"/><rect x="25" y="14" width="4" height="6" fill="${lit ? "#F2B544" : "#2A2018"}"/></svg>`;

const html = `
<div id="fogT"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">${leaf}KISAH DALAM AL-QUR'AN &middot; 16</div>
    <div class="h">Satu Hentakan Kaki</div>
    <div class="row" data-at="s1:air" data-fx="mist"><b class="tag">air yang sejuk</b>${ref("QS 38:42")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Ia#2">
  <div class="card">
    <div class="k">${leaf}NABI AYYUB</div>
    <div class="h m">Kisahnya di dua surah</div>
    <div class="row" data-at="s2:Al-Anbiya" data-fx="mist">${ref("Al-Anbiya 21:83&ndash;84")}<span class="rf" data-at="s2:Shad" data-fx="mist">Shad 38:41&ndash;44</span></div>
    <div class="sub" data-at="s2:penyakit" data-fx="mist">ditimpa penyakit dan penderitaan yang berat</div>
  </div>
</div>
<div class="p" data-in="s2:Ia#2" data-out="s3">
  <div class="card">
    <div class="k">${leaf}IA MENYEBUT KEADAANNYA ${ref("QS 38:41")}</div>
    <div class="qt">&ldquo;Sesungguhnya aku diganggu setan dengan penderitaan dan bencana.&rdquo;</div>
    <div class="fam" data-at="s2:keluarganya" data-fx="mist"><span class="ic">${house(0)}${house(0)}${house(0)}</span><span>keluarganya tak lagi bersamanya</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card">
    <div class="k">${leaf}DOANYA ${ref("QS Al-Anbiya 21:83")}</div>
    <div class="lab">bukan keluhan panjang, hanya satu kalimat</div>
    <div class="ar" data-at="s3:ya" data-fx="mist">${V2183}</div>
    <div class="qt s" data-at="s3:sungguh" data-fx="mist">&ldquo;(Ya Tuhanku), sungguh, aku telah ditimpa penyakit, padahal Engkau Tuhan Yang Maha Penyayang dari semua yang penyayang.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k">${leaf}PERHATIKAN</div>
    <div class="h s">Caranya berdoa</div>
    <div class="ls">
      <span class="no" data-at="s4:menuntut" data-fx="mist">tidak menuntut</span>
      <span class="no" data-at="s4:menyalahkan" data-fx="mist">tidak menyalahkan siapa pun</span>
      <span data-at="s4:keadaannya" data-fx="mist">menyebut keadaannya</span>
      <span data-at="s4:sifat" data-fx="mist">menyebut sifat Tuhannya</span>
      <span class="end" data-at="s4:berhenti" data-fx="mist">lalu berhenti, menyerahkan sisanya kepada Allah</span>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Kesembuhan">
  <div class="card">
    <div class="k">${leaf}JAWABANNYA ${ref("QS Shad 38:42", "s5:Shad")}</div>
    <div class="ar xl">${V3842}</div>
    <div class="qt" data-at="s5:Inilah" data-fx="mist">&ldquo;Hentakkanlah kakimu; inilah air yang sejuk untuk mandi dan untuk minum.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Kesembuhan" data-out="s6">
  <div class="card">
    <div class="k">${leaf}PELAJARAN</div>
    <div class="h s">Kesembuhan datang dari langkah kecil yang ia lakukan sendiri.</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k">${leaf}DOANYA DIKABULKAN ${ref("QS 21:84")}${ref("QS 38:43")}</div>
    <div class="tr"><b>penyakitnya dilenyapkan</b></div>
    <div class="tr" data-at="s6:dikembalikan" data-fx="mist"><b>keluarganya dikembalikan</b><span class="ic">${house(1)}${house(1)}${house(1)}</span></div>
    <div class="tr" data-at="s6:dilipatgandakan" data-fx="mist"><b>bahkan dilipatgandakan</b><span class="ic">${house(1)}${house(1)}${house(1)}${house(1)}${house(1)}${house(1)}</span></div>
    <div class="sub" data-at="s6:rahmat" data-fx="mist">sebagai rahmat dan pelajaran bagi orang-orang yang berpikir</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k">${leaf}TIGA PUJIAN ${ref("QS Shad 38:44")}</div>
    <div class="ar">${V3844}</div>
    <div class="pr">
      <b data-at="s7:sabar" data-fx="mist">sabar</b><i data-at="s7:sebaik-baik" data-fx="mist">&middot;</i>
      <b data-at="s7:sebaik-baik" data-fx="mist">sebaik-baik hamba</b><i data-at="s7:taat" data-fx="mist">&middot;</i>
      <b data-at="s7:taat" data-fx="mist">sangat taat</b>
    </div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">${leaf}PELAJARAN</div>
    <div class="h s">Sabar bukan diam tanpa doa.</div>
    <div class="sub b" data-at="s8:mengadu" data-fx="mist">Sabar adalah mengadu, hanya kepada-Nya.</div>
    <div class="ask" data-at="s8:Hal" data-fx="mist">Hal apa yang ingin kamu adukan kepada-Nya hari ini?</div>
  </div>
</div>`.replace(/<div class="card">/g, '<div class="card"><i class="fog"></i>');

const css = `
#capfloor{background:linear-gradient(180deg,rgba(20,16,10,0),rgba(20,16,10,.5) 40%,rgba(20,16,10,.5) 72%,rgba(20,16,10,0))}
#fogT{position:absolute;inset:0;z-index:12;opacity:0;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(226,233,229,.86) 0%,rgba(210,220,216,.8) 55%,rgba(186,198,194,.72) 100%)}
.card{position:relative;overflow:hidden;display:inline-block;max-width:100%;box-sizing:border-box;background:${CREAM};padding:20px 30px 24px;border-radius:10px;
 box-shadow:inset 0 0 0 2px ${BRASS},inset 0 0 0 7px ${CREAM},inset 0 0 0 8px rgba(168,132,62,.55),0 18px 40px rgba(10,8,4,.45)}
.fog{position:absolute;left:0;top:0;bottom:0;width:250%;z-index:5;pointer-events:none;background:linear-gradient(90deg,rgba(232,238,235,0) 0%,rgba(232,238,235,0) 40%,rgba(232,238,235,.96) 55%,rgba(226,233,230,.97) 100%)}
.k{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:Karla,sans-serif;font-weight:800;font-size:25px;letter-spacing:.13em;color:${MOSS};margin-bottom:8px}
.lf{width:26px;height:26px;flex:none}
.h{font-family:Lora,serif;font-weight:700;font-size:70px;line-height:1.04;color:${INK}}
.h.m{font-size:58px}
.h.s{font-size:46px;line-height:1.18}
.sub{font-family:Karla,sans-serif;font-weight:700;font-size:36px;line-height:1.22;color:#4A443A;margin-top:10px}
.sub.b{font-family:Lora,serif;font-style:italic;font-weight:600;color:${TEAL};font-size:40px}
.lab{font-family:Karla,sans-serif;font-weight:600;font-style:italic;font-size:30px;color:#7a6e5a;margin-bottom:2px}
.qt{font-family:Lora,serif;font-style:italic;font-weight:500;font-size:40px;line-height:1.24;color:${INK};margin-top:6px}
.qt.s{font-size:34px}
.rf{display:inline-block;font-family:Karla,sans-serif;font-weight:800;font-size:23px;letter-spacing:.05em;color:#fff;background:${TEAL};padding:5px 14px 4px;border-radius:999px;white-space:nowrap;margin-right:8px}
.k .rf{letter-spacing:.05em}
.row{display:flex;align-items:center;gap:14px;margin-top:14px;flex-wrap:wrap}
.tag{font-family:Lora,serif;font-style:italic;font-weight:600;font-size:40px;color:#fff;background:${TEAL};padding:4px 22px 8px;border-radius:999px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:60px;line-height:1.72;color:#2A2016;margin-top:38px}
.ar.xl{font-size:70px}
.fam{display:flex;align-items:center;gap:16px;margin-top:14px;font-family:Karla,sans-serif;font-weight:700;font-size:32px;color:#4A443A}
.ic{display:inline-flex;gap:6px;flex:none}
.hs{width:44px;height:39px;display:block}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:2px}
.ls span{position:relative;padding-left:36px;font-family:Karla,sans-serif;font-weight:700;font-size:38px;line-height:1.2;color:${INK}}
.ls span:before{content:"";position:absolute;left:4px;top:.42em;width:16px;height:16px;border-radius:50%;background:#E8A23C;box-shadow:0 0 0 4px rgba(232,162,60,.25)}
.ls span.no{color:#6e6656}
.ls span.no:before{background:#B8AE9C;box-shadow:none}
.ls span.end{font-family:Lora,serif;font-style:italic;font-weight:600;color:${TEAL}}
.tr{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:8px 0;border-top:2px solid rgba(168,132,62,.35)}
.tr b{font-family:Lora,serif;font-weight:700;font-size:40px;line-height:1.1;color:${INK}}
.tr .ic .hs{width:38px;height:34px}
.pr{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;margin-top:6px}
.pr b{font-family:Lora,serif;font-weight:700;font-size:42px;color:#fff;background:${MOSS};padding:4px 20px 8px;border-radius:999px}
.pr i{font-style:normal;font-family:Lora,serif;font-weight:700;font-size:40px;color:${BRASS}}
.ask{display:inline-block;margin-top:14px;font-family:Karla,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:#fff;background:${TEAL};padding:10px 20px 12px;border-radius:12px}
`;

// HUD: the glass fogs over at the s1 -> s2 reset (flash-forward back to the dry world).
const hud = `(t)=>{const e=document.getElementById('fogT');if(!e)return;const sm=(a,b)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};
e.style.opacity=(.72*sm(K.s2-.6,K.s2-.18)*(1-sm(K.s2+.3,K.s2+.95))).toFixed(3);}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:kesehatannya", "s1:keluarganya", "s1:kaki", "s1:memancarkan", "s2:penyakit", "s2:Ia#2", "s2:setan", "s2:bencana", "s2:keluarganya",
  "s3:keluhan", "s3:ya", "s4:berhenti", "s5:hentakkanlah", "s5:kakimu", "s5:Inilah", "s5:Kesembuhan", "s6:dilenyapkan", "s6:Keluarganya", "s6:dikembalikan",
  "s6:dilipatgandakan", "s6:rahmat", "s7:sabar", "s7:sebaik-baik", "s7:taat", "s7:Kami", "s8:mengadu", "s8:Hal", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "16", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.5, html, css, hud, signature: "EP16_AYYUB_HENTAKAN_KAKI",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Karla,sans-serif", chipColor: "#F4EFE3",
  extraAt: WORLD_AT,
  fxExtra: `mist:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:6},{opacity:1,y:0,duration:.1,ease:'power2.out'},t);},`,
  // Condensation wipe: the card arrives fogged and blurred, then the fog is wiped off left to right. Out: fog creeps back over it.
  panelIn: `(tl,p,a)=>{const f=p.querySelector('.fog'),c=p.querySelector('.card');tl.fromTo(p,{opacity:0},{opacity:1,duration:.08,ease:'none'},a-.3);tl.fromTo(c,{filter:'blur(5px)'},{filter:'blur(0px)',duration:.3,ease:'power2.out'},a-.3);tl.fromTo(f,{xPercent:-55},{xPercent:0,duration:.36,ease:'power2.out'},a-.3);}`,
  panelOut: `(tl,p,b)=>{const f=p.querySelector('.fog'),c=p.querySelector('.card');tl.to(f,{xPercent:-30,duration:.16,ease:'power2.in'},b-.24);tl.to(p,{opacity:0,duration:.1,ease:'none'},b-.1);}`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'blur(14px)'});tl.to('#outro',{opacity:1,filter:'blur(0px)',duration:.55,ease:'power2.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Karla,sans-serif;font-weight:800;font-size:58px;line-height:1.32;color:#FFFFFF;text-shadow:0 2px 0 #1a140c,0 0 12px rgba(14,10,6,.9),0 0 3px rgba(14,10,6,.95)}
.w{display:inline-block;margin:0 .12em;padding:0 .14em;border-radius:.3em}`,
(id, w) => `tl.set("#${id}",{color:"#10302E",backgroundColor:"#A6E4DA",textShadow:"0 0 0 rgba(0,0,0,0)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(166,228,218,0)",textShadow:"0 2px 0 #1a140c,0 0 12px rgba(14,10,6,.9),0 0 3px rgba(14,10,6,.95)"},${w.end.toFixed(3)});\n`,
(id, s) => `gsap.set("#${id}",{opacity:0});tl.set("#${id}",{opacity:1},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ayyub Hentakan Kaki", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
