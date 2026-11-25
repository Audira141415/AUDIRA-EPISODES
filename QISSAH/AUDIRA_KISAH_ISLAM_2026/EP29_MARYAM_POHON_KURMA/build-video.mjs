// EP29 MARYAM DAN POHON KURMA. FELTCRAFT: a soft handmade felt diorama (world3d.js). Panels are cream felt patches
// (felt fibre overlay, rounded cut edges, a sewn-on saffron button) with a dashed running-stitch border.
// Transition: felt patch stitch-on. The patch drops onto the frame with a soft felt bounce, then its running stitch is
// sewn around from left to right (clip on the stitch layer); exit lifts the patch off. Both finish within 0.3 s.
// Fonts: Quicksand (kickers, headings, captions), Lora (translations, reflections), Amiri (Arabic, deep indigo).
// Arabic is read verbatim from the verse file; phrases are whole word runs checked against the file.
// Maryam, the angel and baby Isa are never shown; see world3d.js. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#141c3c", CREAM = "#F5EAD5", PLUM = "#3A2340", RUST = "#B4502F", SAFF = "#F4B942", INDIGO = "#2B3F7A", BLUE = "#6F9FD8";

const QF = readFileSync("../_research/quran/EP29_maryam_kurma.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V16 = verse("19:16"), V21 = verse("19:21"), V24 = verse("19:24");
const w21 = V21.split(" "), i21 = w21.indexOf("هُوَ");
const A21 = w21.slice(i21, i21 + 3).join(" ");           // هُوَ عَلَىَّ هَيِّنٌ  ("hal itu mudah bagi-Ku")
const A24 = V24.split(" ").slice(3).join(" ");            // أَلَّا تَحْزَنِى قَدْ جَعَلَ رَبُّكِ تَحْتَكِ سَرِيًّا
for (const [nm, s, nw] of [["21", A21, 3], ["24", A24, 7]]) if (i21 < 0 || s.split(" ").length !== nw || !QF.includes(s)) throw new Error("arabic cut " + nm + ": " + s);

const ref = (r) => `<span class="rf">${r}</span>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 29</div>
    <div class="h">Maryam dan Pohon Kurma</div>
    <div class="sub" data-at="s1:mustahil" data-fx="sew">Terdengar mustahil: <b>goyangkan pohon itu.</b></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Di">
  <div class="card">
    <div class="k">SURAH MARYAM ${ref("QS 19:16")}</div>
    <div class="ar">${V16}</div>
    <div class="tr">&ldquo;&hellip;ketika dia mengasingkan diri dari keluarganya ke suatu tempat di sebelah timur.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s2:Di" data-out="s3">
  <div class="card">
    <div class="k">KABAR GEMBIRA ${ref("QS 19:19")}</div>
    <div class="h m">Seorang anak laki-laki yang suci</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card lt">
    <div class="k">IA BERTANYA ${ref("QS 19:20-21")}</div>
    <div class="q">&ldquo;Bagaimana mungkin, tak pernah ada laki-laki yang menyentuhku?&rdquo;</div>
    <div class="ans" data-at="s3:Jawabnya" data-fx="sew"><span class="ar sm">${A21}</span><span class="tr">&ldquo;Hal itu mudah bagi-Ku.&rdquo;</span></div>
    <div class="duo" data-at="s3:tanda" data-fx="sew"><span>TANDA bagi manusia</span><span class="b" data-at="s3:rahmat" data-fx="sew">RAHMAT</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Saat">
  <div class="card">
    <div class="k">MENJAUH ${ref("QS 19:22")}</div>
    <div class="h m">Ke tempat yang terpencil</div>
  </div>
</div>
<div class="p" data-in="s4:Saat" data-out="s5">
  <div class="card">
    <div class="k">DI PANGKAL POHON KURMA ${ref("QS 19:23")}</div>
    <div class="h m">Rasa sakit melahirkan datang</div>
    <div class="quote" data-at="s4:alangkah" data-fx="sew">&ldquo;Alangkah baiknya aku mati sebelum ini.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="k">DISERU DARI TEMPAT YANG RENDAH ${ref("QS 19:24")}</div>
    <div class="ar">${A24}</div>
    <div class="tr">&ldquo;Janganlah engkau bersedih hati.</div>
    <div class="tr" data-at="s5:Tuhanmu" data-fx="sew">Tuhanmu telah menjadikan anak sungai di bawahmu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Maka">
  <div class="card">
    <div class="k">GOYANGLAH ${ref("QS 19:25")}</div>
    <div class="h m">Goyanglah pangkal pohon kurma itu ke arahmu</div>
    <div class="sub" data-at="s6:niscaya" data-fx="sew">niscaya ia menggugurkan kurma yang masak.</div>
  </div>
</div>
<div class="p" data-in="s6:Maka" data-out="s7">
  <div class="card">
    <div class="k">MAKA ${ref("QS 19:26")}</div>
    <div class="trio"><span>Makan</span><span data-at="s6:minum" data-fx="sew">Minum</span><span data-at="s6:bersenanghatilah" data-fx="sew">Bersenanghatilah</span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  <div class="card">
    <div class="k">BANYAK ULAMA MENGAMBIL PELAJARAN</div>
    <div class="h m">Pohon kurma tak akan bergoyang oleh tenaga seorang perempuan yang lemah.</div>
  </div>
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  <div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h m">Tapi ia tetap diminta bergerak,</div>
    <div class="ask" data-at="s7:pertolongan" data-fx="sew">dan pertolongan datang setelahnya.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">RENUNGAN</div>
    <div class="h m">Pertolongan datang, tapi kita tetap diminta melangkah.</div>
    <div class="ask" data-at="s8:Usaha" data-fx="sew">Usaha kecil apa yang sedang kamu tunda?</div>
  </div>
</div>`;

const btn = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="${SAFF}"/><circle cx="20" cy="20" r="14" fill="none" stroke="#C98A1E" stroke-width="2"/><g fill="#8A5A12"><circle cx="15.5" cy="15.5" r="2.4"/><circle cx="24.5" cy="15.5" r="2.4"/><circle cx="15.5" cy="24.5" r="2.4"/><circle cx="24.5" cy="24.5" r="2.4"/></g><path d="M15.5 15.5L24.5 24.5M24.5 15.5L15.5 24.5" stroke="#FFF3D6" stroke-width="1.6"/></svg>`)}`;
const css = `
#capfloor{background:linear-gradient(180deg,rgba(12,16,40,0),rgba(12,16,40,.32) 45%,rgba(12,16,40,.32) 70%,rgba(12,16,40,0))}
#chip{background:rgba(245,234,213,.9);color:${PLUM};padding:6px 14px 5px;border-radius:14px;font-size:19px;letter-spacing:.05em;box-shadow:0 4px 10px rgba(0,0,0,.25)}
.p{--st:100}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:url(assets/img/felt.png),${CREAM};background-blend-mode:overlay;padding:26px 36px 28px;border-radius:22px;box-shadow:0 3px 0 #D9C7A6,0 18px 36px rgba(10,10,30,.42)}
.card:before{content:"";position:absolute;inset:10px;border:3px dashed ${RUST};border-radius:15px;opacity:.75;clip-path:inset(0 calc(100% - var(--st) * 1%) 0 0)}
.card:after{content:"";position:absolute;right:-12px;top:-12px;width:46px;height:46px;background:url("${btn}") center/contain no-repeat;filter:drop-shadow(0 3px 3px rgba(0,0,0,.3))}
.card.lt{background:url(assets/img/felt.png),#FFF6E2;background-blend-mode:overlay;box-shadow:0 3px 0 #E8D6B0,0 0 46px rgba(255,214,140,.55),0 18px 36px rgba(10,10,30,.36)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Quicksand,sans-serif;font-weight:700;font-size:25px;letter-spacing:.1em;color:${RUST};margin-bottom:8px}
.h{font-family:Quicksand,sans-serif;font-weight:700;font-size:74px;line-height:1.04;color:${PLUM}}
.h.m{font-size:52px;line-height:1.14}
.sub{font-family:Lora,serif;font-weight:500;font-size:38px;line-height:1.25;color:#5A3E5E;margin-top:12px}
.sub b{font-family:Quicksand,sans-serif;font-weight:700;color:${RUST}}
.tr{font-family:Lora,serif;font-weight:500;font-style:italic;font-size:35px;line-height:1.3;color:#4A3550;margin-top:6px}
.q{font-family:Lora,serif;font-weight:600;font-style:italic;font-size:40px;line-height:1.26;color:${PLUM}}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.75;color:${INDIGO}}
.ar.sm{font-size:56px;line-height:1.5}
.ans{display:flex;align-items:baseline;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:3px dotted rgba(180,80,47,.45)}
.ans .tr{font-weight:700;font-style:normal;font-family:Quicksand,sans-serif;font-size:42px;color:${RUST};margin:0}
.rf{display:inline-block;font-family:Quicksand,sans-serif;font-weight:700;font-size:21px;letter-spacing:.04em;color:#fff;background:${BLUE};padding:5px 13px 4px;border-radius:20px;outline:2px dashed rgba(255,255,255,.75);outline-offset:-5px;white-space:nowrap}
.duo{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:16px}
.duo span{font-family:Quicksand,sans-serif;font-weight:700;font-size:34px;color:${PLUM};background:${SAFF};padding:8px 20px 7px;border-radius:24px;outline:2px dashed rgba(90,50,10,.45);outline-offset:-6px}
.duo span.b{background:${BLUE};color:#fff;outline-color:rgba(255,255,255,.7)}
.quote{font-family:Lora,serif;font-style:italic;font-weight:600;font-size:40px;line-height:1.25;color:${INDIGO};margin-top:14px;padding:12px 0 0 22px;border-left:5px solid ${BLUE}}
.trio{display:flex;flex-direction:column;align-items:flex-start;gap:12px;margin-top:6px}
.trio span{font-family:Quicksand,sans-serif;font-weight:700;font-size:46px;color:${PLUM};background:#fff;padding:8px 24px 9px;border-radius:30px;outline:3px dashed ${RUST};outline-offset:-8px;box-shadow:0 3px 0 #D9C7A6}
.trio span:nth-child(2){background:#D6E8FA}
.trio span:nth-child(3){background:${SAFF}}
.ask{display:inline-block;margin-top:16px;font-family:Quicksand,sans-serif;font-weight:700;font-size:38px;line-height:1.22;color:#fff;background:${RUST};padding:10px 22px 11px;border-radius:18px;outline:2px dashed rgba(255,240,220,.7);outline-offset:-6px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
// date drops (seconds): 12 ripe dates after "menggugurkan", 3 more after "pertolongan" (world3d.js + mix.py)
const tG = at("s6:menggugurkan"), tP = at("s7:pertolongan");
const drops = [...Array.from({ length: 12 }, (_, i) => +(tG - 0.1 + i * 0.17 + (i % 3) * 0.03).toFixed(3)), ...[0, 0.32, 0.6].map((d) => +(tP + d).toFixed(3))];
const WORLD_AT = ["s1:mustahil", "s1:goyangkan", "s2:mengasingkan", "s2:sebelah", "s2:timur", "s2:Di", "s2:suci",
  "s3:Jawabnya", "s3:tanda", "s3:rahmat", "s4:menjauh", "s4:Saat", "s4:alangkah",
  "s5:diseru", "s5:janganlah", "s5:Tuhanmu", "s5:sungai", "s5:bawahmu",
  "s6:goyanglah", "s6:menggugurkan", "s6:Maka", "s6:makan", "s6:minum", "s6:bersenanghatilah",
  "s7:bergoyang", "s7:lemah", "s7:Tapi", "s7:pertolongan", "s8:Usaha", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "29", bg: BG, vig: 0.34, grain: 0.04, capfloor: 0.32, html, css, signature: "EP29_MARYAM_POHON_KURMA",
  K: { drops },
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Quicksand,sans-serif", chipColor: PLUM,
  extraAt: WORLD_AT,
  fxExtra: `sew:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:10,scale:.96},{opacity:1,y:0,scale:1,duration:.26,ease:'back.out(1.8)'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:1.07,rotation:-1.6,y:-16},{opacity:1,scale:1,rotation:0,y:0,duration:.22,ease:'back.out(1.6)'},a-.14);tl.fromTo(p,{'--st':0},{'--st':100,duration:.2,ease:'none'},a-.06);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scale:.97,y:12,rotation:.8,duration:.18,ease:'power2.in'},b-.12);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Quicksand,sans-serif;font-weight:700;font-size:54px;line-height:1.32;color:${PLUM};background:url(assets/img/felt.png),${CREAM};background-blend-mode:overlay;padding:10px 22px 12px;border-radius:22px;box-shadow:0 3px 0 #D9C7A6,0 12px 28px rgba(10,10,30,.45);outline:3px dashed rgba(180,80,47,.55);outline-offset:-9px}
.w{display:inline-block;margin:0 .06em;padding:0 .12em;border-radius:12px}`,
(id, w) => `tl.set("#${id}",{color:"${PLUM}",backgroundColor:"rgba(244,185,66,0)"},0);tl.set("#${id}",{color:"#2A1630",backgroundColor:"rgb(244,185,66)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${PLUM}",backgroundColor:"rgba(244,185,66,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Maryam dan Pohon Kurma", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "drops", drops.length);
