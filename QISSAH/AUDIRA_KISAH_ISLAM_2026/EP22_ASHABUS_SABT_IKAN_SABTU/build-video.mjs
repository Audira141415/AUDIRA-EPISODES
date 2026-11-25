// EP22 ASHABUS SABT, IKAN HARI SABAT. RISOFORGE: risograph print. Three spot inks (fluorescent pink, teal, yellow)
// on off-white paper; the 3D world is rendered as ink densities and screened into halftone plates (see world3d.js).
// Panels are printed paper slips: navy overprint type (DM Sans), Space Mono labels, a yellow reference chip,
// a pink halftone corner and two colour plates (pink, yellow) that sit slightly out of register behind the card.
// Transition: a misregistered print slide. The card slides in with its colour plates far out of register and they snap
// into (near) registration as it lands; it leaves sliding on with the plates splitting again.
// Arabic is read verbatim from the verse file (Amiri). Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAPER = "#F4EEE1", NAVY = "#14265C", PINK = "#FF48B0", TEAL = "#00838A", YEL = "#FFE800", GREEN = "#5E9E2E";

const QF = readFileSync("../_research/quran/EP22_sabt.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
// QS 7:163, last clause (after the pause mark): "Demikianlah Kami menguji mereka disebabkan mereka berlaku fasik"
const V163 = verse("7:163").split(" ۚ ").pop();
if (V163.split(" ").length !== 5 || V163.includes("ۚ")) throw new Error("7:163 clause cut wrong: " + V163);
// QS 7:164, the answer (after the pause mark): "Agar kami mempunyai alasan kepada Tuhanmu, dan agar mereka bertakwa"
const V164 = verse("7:164").split(" ۖ ").pop();
if (V164.split(" ").length !== 6 || V164.includes("ۖ")) throw new Error("7:164 clause cut wrong: " + V164);
const V266 = verse("2:66");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;
const dot = (c) => `<i class="dt" style="background:${c}"></i>`;
const fishSvg = `<svg class="ic" viewBox="0 0 64 32"><ellipse cx="26" cy="16" rx="22" ry="11" fill="${PINK}"/><path d="M44 16L62 4V28Z" fill="${PINK}"/><circle cx="14" cy="13" r="3" fill="${PAPER}"/></svg>`;
const waveSvg = `<svg class="ic" viewBox="0 0 64 32"><path d="M2 18Q10 8 18 18T34 18T50 18T64 18" fill="none" stroke="${TEAL}" stroke-width="5"/></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 22</div>
    <div class="h">IKAN HARI SABAT</div>
    <div class="sub" data-at="s1:Ujian" data-fx="rise">Ujian: menahan diri saat godaan paling dekat</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Penduduknya">
  <div class="card">
    <div class="k">SURAH AL-A'RAF ${ref("QS 7:163")}</div>
    <div class="h m">Sebuah negeri di dekat laut</div>
  </div>
</div>
<div class="p" data-in="s2:Penduduknya" data-out="s3">
  <div class="card">
    <div class="k">ATURAN HARI SABAT ${ref("QS 7:163")}</div>
    <div class="h m">Dilarang menangkap ikan pada hari Sabat</div>
    <div class="sub" data-at="s2:dikhususkan" data-fx="rise">hari yang dikhususkan untuk ibadah</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Ayatnya">
  <div class="card">
    <div class="k">UJIANNYA ${ref("QS 7:163")}</div>
    <div class="h m">Justru pada hari itu</div>
    <div class="row" data-at="s3:ikan-ikan" data-fx="rise">${fishSvg}<b>SABAT</b><span>ikan terapung di permukaan</span></div>
    <div class="row" data-at="s3:Pada" data-fx="rise">${waveSvg}<b>HARI LAIN</b><span>ikan menghilang</span></div>
  </div>
</div>
<div class="p" data-in="s3:Ayatnya" data-out="s4">
  <div class="card">
    <div class="k">AYATNYA MENYEBUT ${ref("QS AL-A'RAF 7:163")}</div>
    <div class="ar">${V163}</div>
    <div class="tr">&ldquo;Demikianlah Kami menguji mereka disebabkan mereka berlaku fasik.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k">KELOMPOK ${ref("QS 7:163-165")}</div>
    <div class="h m">Penduduk terbelah menjadi tiga</div>
    <div class="gl">
      <div data-at="s4:Sebagian" data-fx="rise">${dot(TEAL)}<b>MELANGGAR</b><span>mencari celah</span></div>
      <div data-at="s4:Sebagian#2" data-fx="rise">${dot(PINK)}<b>MENASIHATI</b><span>mengingatkan</span></div>
      <div data-at="s4:kelompok" data-fx="rise">${dot(GREEN)}<b>BERTANYA</b><span>&ldquo;untuk apa menasihati?&rdquo;</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="k">JAWABAN PARA PENASIHAT ${ref("QS AL-A'RAF 7:164")}</div>
    <div class="ar">${V164}</div>
    <div class="tr">&ldquo;Agar kami mempunyai alasan (lepas tanggung jawab) kepada Tuhanmu, dan agar mereka bertakwa.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Yang">
  <div class="card">
    <div class="k">PERINGATAN DILUPAKAN ${ref("QS 7:165")}</div>
    <div class="h m">${dot(PINK)}Yang melarang kejahatan diselamatkan</div>
  </div>
</div>
<div class="p" data-in="s6:Yang" data-out="s7">
  <div class="card">
    <div class="k">YANG ZALIM ${ref("QS 7:165-166")}</div>
    <div class="h m">Ditimpa siksaan yang keras</div>
    <div class="qt" data-at="s6:dijadikan" data-fx="rise">&ldquo;Jadilah kamu kera yang hina.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k">SURAH AL-BAQARAH ${ref("QS 2:66")}</div>
    <div class="ar c">${V266}</div>
    <div class="tr" data-at="s7:peringatan" data-fx="rise">Peringatan bagi orang-orang pada masa itu dan yang datang kemudian, serta pelajaran bagi orang yang bertakwa.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h m">Ujian sering datang tepat saat kita dilarang.</div>
    <div class="ask" data-at="s8:Kamu" data-fx="rise">Kamu di kelompok yang mana?</div>
    <div class="ch" data-at="s8:Kamu" data-fx="rise"><span>${dot(TEAL)}MELANGGAR</span><span>${dot(PINK)}MENASIHATI</span><span>${dot(GREEN)}BERTANYA</span></div>
  </div>
</div>`;

const HT = `radial-gradient(circle,${PINK} 34%,transparent 37%) 0 0/11px 11px`;
const css = `
#vig{background:radial-gradient(ellipse at 50% 42%,rgba(20,38,92,0) 58%,rgba(20,38,92,.16) 100%)}
#capfloor{background:none}
#chip{background:${PAPER};color:${NAVY};padding:5px 12px 4px;border:2px solid ${TEAL};font-size:18px;letter-spacing:.06em;opacity:.92;box-shadow:3px 2px 0 rgba(255,72,176,.7)}
#sig{color:${NAVY};text-shadow:0 0 6px rgba(244,238,225,.9)}
.p{--m:5}
.card{position:relative;background:${PAPER};padding:24px 32px 26px;border:3px solid ${NAVY};
 box-shadow:calc(var(--m) * 1.1px) calc(var(--m) * .8px) 0 rgba(255,72,176,.9),calc(var(--m) * -.9px) calc(var(--m) * 1.2px) 0 rgba(255,232,0,.95),0 18px 34px rgba(20,38,92,.22)}
.card:before{content:"";position:absolute;right:0;top:0;width:190px;height:120px;background:${HT};opacity:.5;pointer-events:none;
 -webkit-mask-image:linear-gradient(225deg,#000 0,rgba(0,0,0,.5) 35%,transparent 70%);mask-image:linear-gradient(225deg,#000 0,rgba(0,0,0,.5) 35%,transparent 70%)}
.k{position:relative;display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Space Mono",monospace;font-weight:700;font-size:24px;letter-spacing:.08em;color:${TEAL};margin-bottom:10px}
.h{position:relative;font-family:"DM Sans",sans-serif;font-weight:800;font-size:76px;line-height:1.0;color:${NAVY};letter-spacing:-.01em;
 text-shadow:calc(var(--m) * .6px) calc(var(--m) * .5px) 0 rgba(255,72,176,.55)}
.h.m{font-size:56px;line-height:1.08}
.sub{position:relative;font-family:"DM Sans",sans-serif;font-weight:600;font-size:36px;line-height:1.2;color:${TEAL};margin-top:12px}
.qt{position:relative;display:inline-block;margin-top:14px;font-family:"DM Sans",sans-serif;font-weight:700;font-style:italic;font-size:42px;line-height:1.15;color:${NAVY};background:${YEL};padding:6px 14px 8px}
.tr{position:relative;font-family:"DM Sans",sans-serif;font-weight:500;font-size:32px;line-height:1.3;color:${NAVY};margin-top:6px}
.ar{position:relative;font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.75;color:${NAVY}}
.ar.c{text-align:center;font-size:52px}
.rf{display:inline-block;font-family:"Space Mono",monospace;font-weight:700;font-size:22px;letter-spacing:.04em;color:${NAVY};background:${YEL};padding:3px 11px 2px;white-space:nowrap}
.row{position:relative;display:flex;align-items:center;gap:16px;margin-top:8px;font-family:"DM Sans",sans-serif}
.row .ic{width:76px;height:38px;flex:none}
.row b{font-family:"Space Mono",monospace;font-weight:700;font-size:30px;color:${NAVY};min-width:170px}
.row span{font-size:38px;font-weight:700;color:${NAVY};line-height:1.1}
.gl{position:relative;display:flex;flex-direction:column;gap:10px;margin-top:10px}
.gl div{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.gl b{font-family:"Space Mono",monospace;font-weight:700;font-size:34px;color:${NAVY}}
.gl span{font-family:"DM Sans",sans-serif;font-weight:600;font-size:34px;color:${TEAL}}
.dt{display:inline-block;width:26px;height:26px;border-radius:50%;margin-right:12px;vertical-align:baseline;flex:none;position:relative;top:2px}
.ask{position:relative;display:inline-block;margin-top:14px;font-family:"DM Sans",sans-serif;font-weight:800;font-size:42px;color:${NAVY};background:${YEL};padding:6px 16px 8px}
.ch{position:relative;display:flex;gap:12px;flex-wrap:wrap;margin-top:14px}
.ch span{display:inline-flex;align-items:center;font-family:"Space Mono",monospace;font-weight:700;font-size:24px;color:${NAVY};border:2px solid ${NAVY};padding:6px 12px 5px}
.ch .dt{width:18px;height:18px;margin-right:9px;top:0}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:ikan-ikan", "s1:Di", "s1:Ujian", "s1:godaan", "s2:negeri", "s2:Penduduknya", "s2:ibadah",
  "s3:ikan-ikan", "s3:Pada", "s3:Ayatnya", "s3:demikianlah", "s4:terbelah", "s4:Sebagian", "s4:celah", "s4:Sebagian#2", "s4:menasihati",
  "s4:kelompok", "s4:bertanya", "s4:untuk", "s6:dilupakan", "s6:diselamatkan", "s6:Yang", "s6:ditimpa", "s6:hina",
  "s7:peringatan", "s8:Kamu", "s8:Kisah", "s8:AUDIRA", "s5:alasan", "s5:bertakwa", "s8:menasihati"];
const { AT, K } = writeWorld(TL, at, {
  ep: "22", bg: PAPER, vig: 0.16, grain: 0.07, capfloor: 0, html, css, signature: "EP22_ASHABUS_SABT_IKAN_SABTU",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Space Mono,monospace", chipColor: NAVY,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:16},{opacity:1,y:0,duration:.32,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{x:-150,'--m':42,opacity:0},{x:0,'--m':5,opacity:1,duration:.5,ease:'power3.out'},a-.16);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{x:130,'--m':40,opacity:0,duration:.34,ease:'power2.in'},b-.36);}`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.fromTo('#outro',{opacity:0,x:-80},{opacity:1,x:0,duration:.45,ease:'power3.out'},OUT-.12);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"DM Sans",sans-serif;font-weight:700;font-size:54px;line-height:1.34;color:${NAVY};background:${PAPER};padding:8px 20px 12px;border:3px solid ${NAVY};box-shadow:5px 4px 0 rgba(255,72,176,.9),-4px 5px 0 rgba(255,232,0,.95)}
.w{display:inline-block;margin:0 .05em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${NAVY}",backgroundColor:"rgba(255,232,0,0)",boxShadow:"inset 0 0 0 rgba(255,72,176,0)"},0);tl.set("#${id}",{color:"${NAVY}",backgroundColor:"${YEL}",boxShadow:"inset 0 -7px 0 ${PINK}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${NAVY}",backgroundColor:"rgba(255,232,0,0)",boxShadow:"inset 0 0 0 rgba(255,72,176,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{x:-10},{x:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ikan Hari Sabat", PAPER);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
