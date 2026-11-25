// EP17 ASHABUL UKHDUD: PEMUDA DAN PARIT BERAPI. MANUSCRIPT: an illuminated leporello on a candlelit scriptorium table.
// Panels are vellum leaves with a gold-lapis-vermilion rule. They arrive by a page turn (hinged on the right edge, like an
// Arabic codex) and leave by turning away on the left hinge. Reveals are "inked": the line is drawn on by a quill stroke
// (clip from the reading direction: left-to-right for Latin, right-to-left for the Arabic).
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#120c08", INK = "#2A1D14", VERM = "#A8301E", LAPIS = "#1F3F8F", GOLD = "#C9A044", VEL = "#F3E7CB";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP17_ukhdud.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V4 = verse("85:4"), V5 = verse("85:5");
const V9 = verse("85:9");
const V9b = V9.split("ۚ")[1].trim();   // the clearly bounded closing phrase of 85:9
if (V9b.split(" ").length !== 5) throw new Error("85:9 split " + V9b);

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="ink"` : ""}>${r}</span>`;
const codex = `<svg class="ico" viewBox="0 0 90 70"><path d="M45 14C33 6 16 6 6 10v52c10-4 27-4 39 4z" fill="${VEL}" stroke="${INK}" stroke-width="2.5"/><path d="M45 14c12-8 29-8 39-4v52c-10-4-27-4-39 4z" fill="#E8D7AE" stroke="${INK}" stroke-width="2.5"/><path d="M45 14v52" stroke="${GOLD}" stroke-width="3"/><path d="M14 22h22M14 30h22M14 38h18M54 22h22M54 30h22M54 38h18" stroke="${INK}" stroke-opacity=".45" stroke-width="2"/><circle cx="25" cy="50" r="5" fill="${GOLD}"/><circle cx="65" cy="50" r="5" fill="${VERM}"/></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 17</div>
    <div class="h">PEMUDA DAN<br>PARIT BERAPI</div>
    <div class="row" data-at="s1:beriman" data-fx="ink"><span class="sub">rakyatnya justru beriman</span>${ref("HR Muslim 3005")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Kisah">
  <div class="card">
    <div class="k"><i></i>SURAH AL-BURUJ ${ref("QS 85:4-5", "s2:Al-Buruj")}</div>
    <div class="ar">${V4}</div>
    <div class="ar" data-at="s2:parit" data-fx="inkr">${V5}</div>
    <div class="sub" data-at="s2:berapi" data-fx="ink">para pembuat parit berapi</div>
    <div class="row" data-at="s2:hanya" data-fx="ink"><span class="tag">hanya karena beriman kepada Allah</span>${ref("QS 85:8")}</div>
  </div>
</div>
<div class="p" data-in="s2:Kisah" data-out="s3">
  <div class="card ic">
    ${codex}
    <div>
      <div class="k"><i></i>KISAH LENGKAPNYA</div>
      <div class="h s">Hadis riwayat Muslim</div>
      <div class="row" data-at="s2:Muslim" data-fx="ink"><span class="sub">dari Shuhaib</span>${ref("HR Muslim 3005")}</div>
    </div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Di">
  <div class="card">
    <div class="k"><i></i>DI ISTANA SEORANG RAJA</div>
    <div class="ls">
      <span>penyihir istana yang sudah tua</span>
      <span data-at="s3:pemuda" data-fx="ink">seorang pemuda diajari sihir</span>
    </div>
  </div>
</div>
<div class="p" data-in="s3:Di" data-out="s4">
  <div class="card">
    <div class="k"><i></i>DI PERJALANAN</div>
    <div class="h s">bertemu seorang rahib</div>
    <div class="row" data-at="s3:iman" data-fx="ink"><span class="tag">mulai belajar iman</span>${ref("HR Muslim 3005")}</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Ia">
  <div class="card">
    <div class="k"><i></i>SUATU HARI</div>
    <div class="h s">Binatang besar menghalangi jalan</div>
    <div class="sub" data-at="s4:melempar" data-fx="ink">melempar batu sambil berdoa</div>
    <div class="row" data-at="s4:terbuka" data-fx="ink"><span class="tag">jalan kembali terbuka</span></div>
  </div>
</div>
<div class="p" data-in="s4:Ia" data-out="s5">
  <div class="card">
    <div class="k"><i></i>IA MULAI MENYEMBUHKAN</div>
    <div class="h s">orang buta dan orang sakit</div>
    <div class="qt" data-at="s4:bukan" data-fx="ink">&ldquo;Bukan aku yang menyembuhkan, Allah yang menyembuhkan.&rdquo; ${ref("HR Muslim 3005")}</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Lalu">
  <div class="card">
    <div class="k"><i></i>RAJA MURKA</div>
    <div class="h s">mencoba menyingkirkan pemuda itu</div>
    <div class="ls">
      <span data-at="s5:gunung" data-fx="ink">dari puncak gunung</span>
      <span data-at="s5:laut" data-fx="ink">di tengah laut</span>
    </div>
    <div class="row" data-at="s5:gagal" data-fx="ink"><b class="big">DUA KALI GAGAL</b></div>
  </div>
</div>
<div class="p" data-in="s5:Lalu" data-out="s6">
  <div class="card">
    <div class="k"><i></i>PEMUDA ITU BERKATA</div>
    <div class="qt">&ldquo;Kamu tidak akan bisa membunuhku, kecuali dengan satu cara.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Raja">
  <div class="card">
    <div class="k"><i></i>SATU CARA</div>
    <div class="sub">kumpulkan orang di satu lapangan</div>
    <div class="qt" data-at="s6:dengan" data-fx="ink">&ldquo;Dengan nama Allah, Tuhan pemuda ini.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6:Raja" data-out="s7">
  <div class="card">
    <div class="k"><i></i>DENGAN NAMA ALLAH</div>
    <div class="h s">Raja melakukannya</div>
    <div class="sub" data-at="s6:wafat" data-fx="ink">dan pemuda itu wafat</div>
    <div class="qt" data-at="s6:Orang-orang" data-fx="ink">&ldquo;Kami beriman kepada Tuhan pemuda ini.&rdquo; ${ref("HR Muslim 3005")}</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Al-Qur'an">
  <div class="card">
    <div class="k"><i></i>PARIT-PARIT BERAPI ${ref("QS 85:4-7")}</div>
    <div class="h s">Raja menggali parit berapi</div>
    <div class="sub" data-at="s7:memaksa" data-fx="ink">untuk memaksa mereka kembali</div>
    <div class="row" data-at="s7:teguh" data-fx="ink"><b class="big">MEREKA TETAP TEGUH</b></div>
  </div>
</div>
<div class="p" data-in="s7:Al-Qur'an" data-out="s8">
  <div class="card">
    <div class="k"><i></i>AL-QUR'AN MENUTUPNYA ${ref("QS 85:9")}</div>
    <div class="ar xl">${V9b}</div>
    <div class="sub" data-at="s7:Menyaksikan" data-fx="ink">Allah Maha Menyaksikan segala sesuatu.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>PELAJARAN</div>
    <div class="h s">Kemenangan tidak selalu berarti selamat di dunia.</div>
    <div class="sub" data-at="s8:keyakinan" data-fx="ink">keyakinan yang menular ke ribuan orang</div>
    <div class="ask" data-at="s8:Menurut" data-fx="ink">Apa yang membuat pemuda itu begitu teguh?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(18,10,4,0),rgba(18,10,4,.55) 40%,rgba(18,10,4,.55) 72%,rgba(18,10,4,0))}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;padding:24px 34px 26px;border-radius:6px;
 background:radial-gradient(130% 100% at 30% 15%,#FBF2DC 0%,${VEL} 50%,#E4D0A4 100%);border:4px solid ${GOLD};
 box-shadow:inset 0 0 0 5px ${VEL},inset 0 0 0 8px ${LAPIS},inset 0 0 0 10px ${VEL},inset 0 0 0 11px ${VERM},0 20px 40px rgba(0,0,0,.55),0 4px 0 #8a6a2a}
.card:after{content:"";position:absolute;inset:0;background:url(assets/img/grain.png);opacity:.14;mix-blend-mode:multiply;pointer-events:none}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:'EB Garamond',serif;font-weight:700;font-size:27px;letter-spacing:.12em;color:${VERM};margin-bottom:6px}
.k i{display:block;width:16px;height:16px;background:${LAPIS};transform:rotate(45deg);box-shadow:0 0 0 3px ${GOLD}}
.h{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:72px;line-height:.98;color:${INK};letter-spacing:.01em}
.h.s{font-size:52px;line-height:1.06}
.sub{font-family:'EB Garamond',serif;font-weight:600;font-style:italic;font-size:38px;line-height:1.2;color:#4A3424}
.qt{font-family:'Cormorant Garamond',serif;font-weight:700;font-style:italic;font-size:50px;line-height:1.12;color:${INK};margin-top:4px}
.qt .rf{vertical-align:middle;margin-left:6px;font-style:normal}
.rf{display:inline-block;font-family:'EB Garamond',serif;font-weight:700;font-size:24px;letter-spacing:.05em;color:#FFE3A0;background:${LAPIS};padding:4px 14px 5px;border-radius:3px;white-space:nowrap;box-shadow:0 0 0 2px ${GOLD}}
.row{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap}
.tag{font-family:'EB Garamond',serif;font-weight:700;font-size:36px;color:${INK};border-bottom:3px solid ${VERM};padding-bottom:2px}
.big{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:50px;letter-spacing:.04em;color:#FFF3D6;background:${VERM};padding:4px 20px 6px;border-radius:3px;box-shadow:0 0 0 3px ${GOLD}}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:60px;line-height:1.6;color:${INK}}
.ar.xl{font-size:76px;line-height:1.55;color:#1A2F6A}
.ic{display:inline-flex;align-items:center;gap:24px}
.ico{flex:none;width:120px;height:94px}
.ls{display:flex;flex-direction:column;gap:6px}
.ls span{font-family:'EB Garamond',serif;font-weight:600;font-size:42px;color:${INK};padding-left:36px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.5em;width:14px;height:14px;background:${GOLD};transform:rotate(45deg)}
.ask{display:inline-block;margin-top:14px;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:44px;line-height:1.1;color:#FFF3D6;background:${LAPIS};padding:10px 22px 12px;border-radius:4px;box-shadow:0 0 0 3px ${GOLD}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:pemuda", "s1:beriman", "s2:parit", "s2:menyiksa", "s2:beriman", "s2:Kisah", "s2:Al-Buruj",
  "s3:pemuda", "s3:diajari", "s3:Di", "s3:rahib", "s3:iman",
  "s4:binatang", "s4:melempar", "s4:batu", "s4:berdoa", "s4:terbuka", "s4:Ia", "s4:menyembuhkan", "s4:Allah",
  "s5:murka", "s5:gunung", "s5:laut", "s5:gagal", "s5:Lalu", "s5:satu",
  "s6:Kumpulkan", "s6:lapangan", "s6:panah", "s6:dengan", "s6:Raja", "s6:wafat", "s6:Orang-orang", "s6:beriman",
  "s7:menggali", "s7:parit-parit", "s7:memaksa", "s7:teguh", "s7:Al-Qur'an",
  "s8:keyakinan", "s8:ribuan", "s8:Menurut", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "17", bg: BG, vig: 0.42, grain: 0.06, capfloor: 0.55, html, css, signature: "EP17_ASHABUL_UKHDUD_PEMUDA",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "'EB Garamond',serif", chipColor: "#F6E7C4",
  extraAt: WORLD_AT,
  // inked reveals: drawn on along the reading direction
  fxExtra: `ink:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:1,clipPath:'inset(-20% 100% -20% 0)'},{clipPath:'inset(-20% 0% -20% 0)',duration:.55,ease:'power1.inOut'},t);},
 inkr:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:1,clipPath:'inset(-20% 0 -20% 100%)'},{clipPath:'inset(-20% 0 -20% 0%)',duration:.8,ease:'power1.inOut'},t);},`,
  // page turn: the leaf swings in on its right hinge and leaves by turning over on its left hinge
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1,rotationY:-100,transformOrigin:'100% 50%',transformPerspective:1500,filter:'brightness(.55)'},a-.36);tl.to(p,{rotationY:0,filter:'brightness(1)',duration:.52,ease:'power2.out'},a-.35);}`,
  panelOut: `(tl,p,b)=>{tl.set(p,{transformOrigin:'0% 50%'},b-.4);tl.to(p,{rotationY:100,filter:'brightness(.5)',duration:.36,ease:'power2.in'},b-.4);tl.set(p,{opacity:0},b-.03);}`,
  outroIn: `gsap.set('#outro',{opacity:0,rotationY:-90,transformOrigin:'100% 50%',transformPerspective:1800});tl.set('#outro',{opacity:1},OUT-.2);tl.to('#outro',{rotationY:0,duration:.6,ease:'power2.out'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'EB Garamond',serif;font-weight:700;font-size:60px;line-height:1.32;color:#FBF1D8;text-shadow:0 3px 0 #1a0f06,0 0 12px rgba(10,5,0,.95),0 0 4px rgba(10,5,0,.95)}
.w{display:inline-block;margin:0 .1em;padding:0 .16em;border-radius:4px;transform-origin:50% 100%}`,
(id, w) => `tl.set("#${id}",{color:"#FFE29A",backgroundColor:"${LAPIS}",boxShadow:"0 0 0 3px ${GOLD}",textShadow:"none"},${w.start.toFixed(3)});tl.fromTo("#${id}",{scale:1.12},{scale:1,duration:.2,ease:"power2.out"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#FBF1D8",backgroundColor:"rgba(0,0,0,0)",boxShadow:"0 0 0 0 rgba(0,0,0,0)",textShadow:"0 3px 0 #1a0f06,0 0 12px rgba(10,5,0,.95),0 0 4px rgba(10,5,0,.95)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pemuda dan Parit Berapi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
