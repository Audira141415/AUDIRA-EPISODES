// EP23 NASIHAT LUQMAN. SKETCHFORGE: a living pencil-sketch notebook. Panels are cream sketchbook notes with a
// hand-drawn double pencil border, a strip of ochre washi tape and Kalam handwriting (Nunito for labels, Amiri Arabic).
// Transition: page tear + pencil scribble. Each note is revealed behind a torn, jagged paper edge sweeping left to right
// while a graphite scribble races across it and fades; it leaves by tearing back off. The outro card tears in the same way.
// Arabic is read verbatim from the verse file. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#4a3324", PAPER = "#FBF6EA", INK = "#2E2C29", SOFT = "#4A3F35", OCHRE = "#E7B868", RUST = "#B9772E";

const QF = readFileSync("../_research/quran/EP23_luqman.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
// QS 31:12, first clause (bounded by the pause mark): "Telah Kami berikan hikmah kepada Luqman: bersyukurlah kepada Allah"
const V3112 = verse("31:12").split(" ۚ ")[0];
if (V3112.split(" ").length !== 7) throw new Error("31:12 clause cut wrong: " + V3112);
// QS 31:13, the spoken advice itself: from "Ya bunayya" to the end of the verse
const V3113a = verse("31:13");
const V3113 = V3113a.split(" ").slice(6).join(" ");
if (V3113a.split(" ").length !== 15 || V3113.split(" ").length !== 9) throw new Error("31:13 cut wrong: " + V3113);

// torn right edge driven by --r (0 hidden .. 1 fully shown)
const TEAR = (() => {
  const p = ["0 0", "calc(var(--r) * 116%) 0"];
  for (let i = 1; i < 14; i++) p.push(`calc(var(--r) * 116% - ${(i % 2 ? 30 : 6) + (i * 37) % 13}px) ${(i / 14 * 100).toFixed(1)}%`);
  p.push("calc(var(--r) * 116%) 100%", "0 100%");
  return p.join(",");
})();
const SCR = `<svg class="scr" viewBox="0 0 600 200" preserveAspectRatio="none"><path d="M10 150 C 80 20, 120 190, 170 80 S 260 10, 290 120 S 380 190, 420 60 S 520 20, 590 140 M30 60 C 120 130, 200 30, 300 90 S 470 160, 580 50"/></svg>`;
const ref = (r) => `<span class="rf">${r}</span>`;
const card = (inner) => `<div class="card"><i class="tape"></i>${inner}${SCR}</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s1:Ia">${card(`
  <div class="k">KISAH DALAM AL-QUR'AN &middot; 23</div>
  <div class="h">Nasihat Luqman</div>
  <div class="sub" data-at="s1:surahnya" data-fx="rise">Surahnya dinamai dengan namanya</div>`)}
</div>
<div class="p" data-in="s1:Ia" data-out="s2">${card(`
  <div class="h m"><s>raja</s> &middot; <s>panglima</s></div>
  <div class="sub" data-at="s1:hanya" data-fx="rise">hanya seorang ayah yang bijak</div>`)}
</div>
<div class="p" data-in="s2" data-out="s3">${card(`
  <div class="k">HIKMAH LUQMAN ${ref("QS LUQMAN 31:12")}</div>
  <div class="ar">${V3112}</div>
  <div class="h m" data-at="s2:bersyukurlah" data-fx="rise">Bersyukurlah kepada Allah</div>`)}
</div>
<div class="p" data-in="s3" data-out="s3:Wahai">${card(`
  <div class="k">NASIHAT PERTAMA</div>
  <div class="h m">Fondasi segalanya</div>`)}
</div>
<div class="p" data-in="s3:Wahai" data-out="s4">${card(`
  <div class="k">LUQMAN KEPADA ANAKNYA ${ref("QS LUQMAN 31:13")}</div>
  <div class="ar">${V3113}</div>
  <div class="tr">&ldquo;Wahai anakku, jangan mempersekutukan Allah&rdquo;</div>
  <div class="sub" data-at="s3:kezaliman" data-fx="rise">kezaliman yang besar</div>`)}
</div>
<div class="p" data-in="s4" data-out="s4:Bersyukurlah">${card(`
  <div class="k">PESAN TENTANG ORANG TUA ${ref("QS LUQMAN 31:14")}</div>
  <div class="ls">
    <span data-at="s4:ibu" data-fx="rise">Ibu mengandung: lemah bertambah-tambah</span>
    <span data-at="s4:menyapih" data-fx="rise">Menyapih dalam <b class="big2">2 tahun</b></span>
  </div>`)}
</div>
<div class="p" data-in="s4:Bersyukurlah" data-out="s5">${card(`
  <div class="k">${ref("QS LUQMAN 31:14")}</div>
  <div class="h m">Bersyukurlah kepada-Ku dan kepada kedua orang tuamu</div>`)}
</div>
<div class="p" data-in="s5" data-out="s5:Wahai">${card(`
  <div class="k">NASIHAT LUQMAN</div>
  <div class="h m">Tidak ada yang luput</div>`)}
</div>
<div class="p" data-in="s5:Wahai" data-out="s6">${card(`
  <div class="k">SEBERAT BIJI SAWI ${ref("QS LUQMAN 31:16")}</div>
  <div class="h m">Allah akan mendatangkannya</div>
  <div class="chips">
    <span data-at="s5:batu" data-fx="rise">dalam batu</span>
    <span data-at="s5:langit" data-fx="rise">di langit</span>
    <span data-at="s5:bumi" data-fx="rise">di bumi</span>
  </div>
`)}
</div>
<div class="p" data-in="s6" data-out="s7">${card(`
  <div class="k">${ref("QS LUQMAN 31:17")}</div>
  <div class="ls two">
    <span data-at="s6:Dirikan" data-fx="rise">Dirikan salat</span>
    <span data-at="s6:ajak" data-fx="rise">Ajak kepada kebaikan</span>
    <span data-at="s6:cegah" data-fx="rise">Cegah kemungkaran</span>
    <span data-at="s6:bersabarlah" data-fx="rise">Bersabarlah</span>
  </div>
  <div class="stamp" data-at="s6:penting" data-fx="rise">perkara yang penting</div>`)}
</div>
<div class="p" data-in="s7" data-out="s7:Sederhanakan">${card(`
  <div class="k">JANGAN ${ref("QS LUQMAN 31:18")}</div>
  <div class="ls">
    <span data-at="s7:memalingkan" data-fx="rise">memalingkan wajah karena sombong</span>
    <span data-at="s7:jangan" data-fx="rise">berjalan di bumi dengan angkuh</span>
  </div>`)}
</div>
<div class="p" data-in="s7:Sederhanakan" data-out="s8">${card(`
  <div class="k">${ref("QS LUQMAN 31:19")}</div>
  <div class="ls">
    <span>Sederhanakan langkahmu</span>
    <span data-at="s7:lunakkan" data-fx="rise">Lunakkan suaramu</span>
  </div>`)}
</div>
<div class="p" data-in="s8" data-out="@END">${card(`
  <div class="k">WARISAN SEORANG AYAH</div>
  <div class="h m">Dari tauhid sampai cara berjalan dan berbicara</div>
  <div class="ask" data-at="s8:Nasihat" data-fx="rise">Nasihat mana yang paling ingin kamu wariskan?</div>`)}
</div>`;

const css = `
#capfloor{display:none}
#chip{background:rgba(251,246,234,.9);padding:5px 12px 4px;border:1.5px solid rgba(58,54,51,.6);font-size:19px;letter-spacing:.07em}
.p{--r:1;filter:drop-shadow(0 12px 16px rgba(40,24,10,.38))}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:${PAPER};padding:26px 34px 26px;clip-path:polygon(${TEAR})}
.card:before{content:"";position:absolute;inset:9px;border:2.2px solid rgba(58,54,51,.62);border-radius:4px 9px 5px 11px;transform:rotate(-.35deg);pointer-events:none}
.card:after{content:"";position:absolute;inset:12px 10px 8px 13px;border:1.4px solid rgba(58,54,51,.3);border-radius:8px 3px 10px 4px;transform:rotate(.45deg);pointer-events:none}
.tape{position:absolute;left:34px;top:-2px;width:120px;height:24px;background:rgba(217,162,92,.55);transform:rotate(-3deg)}
.scr{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0}
.scr path{fill:none;stroke:#3A3633;stroke-width:6;stroke-linecap:round;stroke-dasharray:1600;stroke-dashoffset:1600}
.k{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:Nunito,sans-serif;font-weight:800;font-size:24px;letter-spacing:.14em;color:#6B5A48;margin:6px 0 8px}
.rf{display:inline-block;font-family:Nunito,sans-serif;font-weight:800;font-size:22px;letter-spacing:.06em;color:${INK};background:${OCHRE};padding:4px 12px 3px;border-radius:3px;white-space:nowrap}
.h{font-family:Kalam,cursive;font-weight:700;font-size:76px;line-height:1.02;color:${INK}}
.h.m{font-size:54px;line-height:1.12}
.h s{text-decoration-color:${RUST};text-decoration-thickness:5px}
.sub{font-family:Nunito,sans-serif;font-weight:700;font-size:35px;line-height:1.22;color:${SOFT};margin-top:10px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:52px;line-height:1.8;color:#3A2F25}
.tr{font-family:Nunito,sans-serif;font-weight:600;font-style:italic;font-size:31px;line-height:1.3;color:${SOFT}}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:2px}
.ls span{font-family:Kalam,cursive;font-weight:700;font-size:44px;line-height:1.15;color:${INK};padding-left:44px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.42em;width:20px;height:20px;border:3px solid ${RUST};border-radius:50% 45% 55% 48%}
.big2{font-size:60px;color:${RUST}}
.chips{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}
.chips span{font-family:Kalam,cursive;font-weight:700;font-size:40px;color:${INK};background:rgba(226,176,74,.35);border:2px solid rgba(58,54,51,.55);border-radius:6px 12px 8px 14px;padding:2px 16px}
.stamp{display:inline-block;margin-top:12px;font-family:Kalam,cursive;font-weight:700;font-size:38px;color:${RUST};border:3px solid ${RUST};border-radius:6px;padding:2px 16px}
.ask{display:inline-block;margin-top:14px;font-family:Nunito,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:${PAPER};background:${INK};padding:10px 18px;border-radius:4px}
#outro{--r:0;clip-path:polygon(${TEAR})}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:berharga", "s1:diabadikan", "s1:raja", "s1:panglima", "s1:bijak",
  "s2:hikmah", "s2:hikmah#2", "s2:bersyukurlah", "s3:fondasi", "s3:Wahai", "s3:Sesungguhnya", "s3:kezaliman",
  "s4:Allah", "s4:ibu", "s4:lemah", "s4:menyapih", "s4:dua", "s4:Bersyukurlah", "s4:kedua",
  "s5:luput", "s5:Wahai", "s5:biji", "s5:tersembunyi", "s5:batu", "s5:langit", "s5:bumi", "s5:Allah", "s5:mendatangkannya",
  "s6:Dirikan", "s6:ajak", "s6:cegah", "s6:bersabarlah", "s6:Semua", "s6:penting",
  "s7:memalingkan", "s7:sombong", "s7:jangan", "s7:angkuh", "s7:Sederhanakan", "s7:lunakkan", "s7:Seburuk-buruk", "s7:keledai",
  "s8:tauhid", "s8:Nasihat", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "23", bg: BG, vig: 0.3, grain: 0.05, capfloor: 0, html, css, signature: "EP23_LUQMAN_NASIHAT_ANAK",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Nunito,sans-serif", chipColor: INK,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:16},{opacity:1,y:0,duration:.4,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const sc=p.querySelector('.scr');const sp=p.querySelector('.scr path');tl.fromTo(p,{'--r':0,opacity:1,rotation:-1.4,y:0},{'--r':1,rotation:0,duration:.5,ease:'power2.out'},a-.12);if(sc){tl.fromTo(sc,{opacity:.9},{opacity:0,duration:.28,ease:'none'},a+.26);tl.fromTo(sp,{strokeDashoffset:1600},{strokeDashoffset:0,duration:.4,ease:'power1.inOut'},a-.16);}}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--r':0,rotation:1.6,y:-12,duration:.36,ease:'power2.in'},b-.38);}`,
  outroIn: `tl.fromTo('#outro',{'--r':0},{'--r':1,duration:.75,ease:'power2.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Nunito,sans-serif;font-weight:800;font-size:52px;line-height:1.32;color:#2B2722;background:${PAPER};padding:8px 20px 10px;border:2.5px solid #3A3633;border-radius:5px 12px 7px 14px;box-shadow:5px 7px 0 rgba(30,20,12,.35)}
.w{display:inline-block;margin:0 .06em;padding:0 .1em;border-radius:5px}`,
(id, w) => `tl.set("#${id}",{color:"#2B2722",backgroundColor:"rgba(231,169,79,0)"},0);tl.set("#${id}",{color:"#1E1C1A",backgroundColor:"rgb(231,169,79)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#2B2722",backgroundColor:"rgba(231,169,79,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nasihat Luqman", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
