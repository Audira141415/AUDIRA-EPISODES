// EP25 BENDUNGAN SABA', BANJIR. SATELLITEBRIEFING: an orbital imaging pass over a reconstructed Saba' valley (Ma'rib,
// Yaman) with a live satellite HUD (drawn by world3d.js on #hud). Panels are dark sensor-console cards with mint corner
// ticks (IBM Plex Mono kickers, IBM Plex Sans text, Amiri Arabic in warm sand).
// Transition: a satellite scanline sweep. A bright scan line runs down the card and reveals it row by row (clip follows
// the line); exit is the same sweep upward. The outro is revealed by one full-frame sweep. Arabic is read verbatim from
// the verse file and cut only at the Uthmani pause marks. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0a141a", MINT = "#7CF3C8", PANEL = "rgba(5,14,19,.9)", TXT = "#EEF6F2", SAND = "#F2DFB0", INK = "#06121A";

const QF = readFileSync("../_research/quran/EP25_saba.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
// exact substrings of the verse, split only at pause marks (ۖ ۚ)
const V15 = verse("34:15"), V19 = verse("34:19");
const marks = (v) => [...v.matchAll(/ [ۖۚ] /g)].map((m) => m.index);
const m15 = marks(V15), m19 = marks(V19);
const A15a = V15.slice(0, m15[1]);               // لَقَدْ كَانَ لِسَبَإٍ ... جَنَّتَانِ عَن يَمِينٍ وَشِمَالٍ
const A15b = V15.slice(m15[1] + 3, m15[2]);      // كُلُوا۟ مِن رِّزْقِ رَبِّكُمْ وَٱشْكُرُوا۟ لَهُۥ
const A15c = V15.slice(m15[2] + 3);              // بَلْدَةٌ طَيِّبَةٌ وَرَبٌّ غَفُورٌ
const A19z = V19.slice(m19[m19.length - 1] + 3); // إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍ لِّكُلِّ صَبَّارٍ شَكُورٍ
const A19d = V19.split(" ").slice(1, 5).join(" ");      // the quoted prayer: words 2-5 of 34:19 (rabbana ba'id baina asfarina)
for (const [n, s, end] of [["15a", A15a, "وَشِمَالٍ"], ["15b", A15b, "لَهُۥ"], ["15c", A15c, "غَفُورٌ"], ["19z", A19z, "شَكُورٍ"]]) if (!s.endsWith(end) || !QF.includes(s)) throw new Error("arabic cut " + n + ": " + s);
if (!V19.includes(A19d)) throw new Error("19 prayer not in file");

const ref = (r) => `<span class="rf">${r}</span>`;
const html = `
<canvas id="hud" width="1080" height="1920"></canvas>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 25</div>
    <div class="h">BENDUNGAN SABA'</div>
    <div class="sub" data-at="s1:banjir" data-fx="rise">Satu banjir besar mengubah semuanya</div>
    <div class="sub b" data-at="s1:berhenti" data-fx="rise">karena mereka berhenti bersyukur</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Makanlah">
  <div class="card">
    <div class="k">SURAH SABA' ${ref("QS 34:15")}</div>
    <div class="ar">${A15a}</div>
    <div class="tr">&ldquo;Bagi kaum Saba' ada tanda di tempat tinggal mereka: dua kebun, di kanan dan di kiri.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s2:Makanlah" data-out="s3">
  <div class="card">
    <div class="k">PERINTAH ${ref("QS 34:15")}</div>
    <div class="ar">${A15b}</div>
    <div class="tr">&ldquo;Makanlah dari rezeki Tuhanmu, dan bersyukurlah.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Mereka">
  <div class="card">
    <div class="k">NEGERI SABA' ${ref("QS 34:15")}</div>
    <div class="ar">${A15c}</div>
    <div class="tr">&ldquo;Negeri yang baik, dan Tuhan Yang Maha Pengampun.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3:Mereka" data-out="s4">
  <div class="card">
    <div class="k">JALUR PERJALANAN AMAN ${ref("QS 34:18")}</div>
    <div class="h m">Kampung-kampung yang berdekatan</div>
    <div class="sub" data-at="s3:sampai" data-fx="rise">sampai ke negeri yang diberkahi</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k">MEREKA BERPALING ${ref("QS 34:19")}</div>
    <div class="h m">Tapi mereka berpaling.</div>
    <div class="ar sm" data-at="s4:berdoa" data-fx="rise">${A19d}</div>
    <div class="tr" data-at="s4:berdoa" data-fx="rise">&ldquo;Ya Tuhan kami, jauhkanlah jarak perjalanan kami.&rdquo;</div>
    <div class="ln" data-at="s4:bosan" data-fx="rise">Bosan dengan kemudahan</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Kebun">
  <div class="card">
    <div class="k">SAIL AL-'ARIM ${ref("QS 34:16")}</div>
    <div class="h m">Maka datanglah banjir besar</div>
  </div>
</div>
<div class="p" data-in="s5:Kebun" data-out="s6">
  <div class="card">
    <div class="k">KEBUN DIGANTI ${ref("QS 34:16")}</div>
    <div class="h m kb">Kebun mereka diganti</div>
    <div class="ls">
      <span data-at="s5:pahit" data-fx="rise">pohon berbuah pahit</span>
      <span data-at="s5:atsl" data-fx="rise">pohon atsl</span>
      <span data-at="s5:sidr" data-fx="rise">sedikit pohon sidr</span>
    </div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k">CITRA HARI INI &middot; MA'RIB, YAMAN</div>
    <div class="h m">Reruntuhan bendungan kuno itu masih ada</div>
    <div class="row" data-at="s6:abad" data-fx="rise"><b>DIBANGUN PERTAMA</b><span>sekitar abad ke-8 SM</span></div>
    <div class="row" data-at="s6:2023" data-fx="rise"><b>WARISAN DUNIA UNESCO</b><span>sejak 2023</span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  <div class="card">
    <div class="k">CATATAN SEJARAH</div>
    <div class="h m">Sejarawan berbeda pendapat:</div>
    <div class="sub" data-at="s7:jebolan" data-fx="rise">jebolan yang mana yang dimaksud ayat ini?</div>
  </div>
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  <div class="card">
    <div class="k">PESAN AYAT ${ref("QS 34:19")}</div>
    <div class="ar">${A19z}</div>
    <div class="tr">&ldquo;Semua itu tanda, bagi setiap orang yang sabar dan bersyukur.&rdquo;</div>
    <div class="duo" data-at="s7:sabar" data-fx="rise"><span>SABAR</span><i>dan</i><span>BERSYUKUR</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">RENUNGAN</div>
    <div class="h m">Nikmat yang terlalu biasa sering lupa disyukuri.</div>
    <div class="ask" data-at="s8:Nikmat#2" data-fx="rise">Nikmat apa yang hari ini kamu anggap biasa?</div>
  </div>
</div>`;

const tick = (c) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path d="M2 28V2h26" fill="none" stroke="${c}" stroke-width="3"/></svg>`)}`;
const css = `
#hud{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:9;pointer-events:none}
#capfloor{background:linear-gradient(180deg,rgba(5,14,19,0),rgba(5,14,19,.42) 45%,rgba(5,14,19,.42) 70%,rgba(5,14,19,0))}
#chip{background:rgba(5,14,19,.78);padding:5px 12px 4px;border-left:3px solid ${MINT};font-size:19px;letter-spacing:.06em}
.p{--r:100;clip-path:inset(0 0 calc(100% - var(--r) * 1%) 0)}
.p:after{content:"";position:absolute;left:0;right:0;height:4px;top:calc(var(--r) * 1% - 4px);background:#C8FFE9;box-shadow:0 0 22px 4px rgba(124,243,200,.85);opacity:calc((100 - var(--r)) / 8)}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:${PANEL};padding:24px 32px 26px;border:1px solid rgba(124,243,200,.42);box-shadow:0 20px 44px rgba(0,0,0,.45)}
.card:before,.card:after{content:"";position:absolute;width:30px;height:30px;background:url("${tick(MINT)}") center/contain no-repeat}
.card:before{left:-7px;top:-7px}.card:after{right:-7px;bottom:-7px;transform:rotate(180deg)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:24px;letter-spacing:.12em;color:${MINT};margin-bottom:10px}
.h{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:76px;line-height:1.02;color:${TXT};letter-spacing:.01em}
.h.m{font-size:52px;line-height:1.12;letter-spacing:0}
.sub{font-family:"IBM Plex Sans",sans-serif;font-weight:500;font-size:37px;line-height:1.22;color:#C4DDD4;margin-top:12px}
.sub.b{color:${SAND};font-weight:600;margin-top:6px}
.tr{font-family:"IBM Plex Sans",sans-serif;font-weight:500;font-style:italic;font-size:34px;line-height:1.3;color:#D5E8E0;margin-top:6px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.75;color:${SAND}}
.ar.sm{font-size:52px;margin-top:8px}
.rf{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:21px;letter-spacing:.04em;color:${INK};background:${MINT};padding:4px 11px 3px;white-space:nowrap}
.ls{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.ls span{font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:44px;line-height:1.12;color:${TXT};padding-left:46px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.32em;width:22px;height:22px;border:3px solid #FFB347;box-sizing:border-box}
.kb{margin-bottom:2px}
.ln{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:38px;color:#FFB347;margin-top:12px;padding-top:10px;border-top:1px solid rgba(124,243,200,.4)}
.row{display:flex;flex-direction:column;margin-top:14px;padding:10px 0 0 18px;border-left:4px solid ${MINT}}
.row b{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:22px;letter-spacing:.1em;color:${MINT}}
.row span{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:${TXT}}
.duo{display:flex;align-items:center;gap:18px;margin-top:16px}
.duo span{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:40px;letter-spacing:.08em;color:${INK};background:${MINT};padding:8px 18px 6px}
.duo i{font-family:"IBM Plex Sans",sans-serif;font-style:italic;font-size:34px;color:#C4DDD4}
.ask{display:inline-block;margin-top:16px;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:38px;line-height:1.2;color:${INK};background:${MINT};padding:10px 18px}
#outro{--r:0;clip-path:inset(0 0 calc(100% - var(--r) * 1%) 0)}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:kanan", "s1:kiri", "s1:banjir", "s1:bersyukur",
  "s2:tanda", "s2:Dua", "s2:kanan", "s2:kiri", "s2:Makanlah",
  "s3:Negeri", "s3:Mereka", "s3:jalur", "s3:aman", "s3:kampung-kampung", "s3:diberkahi",
  "s4:berpaling", "s4:jauhkanlah", "s4:bosan",
  "s5:banjir", "s5:al-arim", "s5:Kebun", "s5:pahit", "s5:atsl", "s5:sidr",
  "s6:Ma'rib", "s6:abad", "s6:2023",
  "s7:jebolan", "s7:tanda", "s7:sabar", "s8:Nikmat#2", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "25", bg: BG, vig: 0.32, grain: 0.045, capfloor: 0.42, html, css, signature: "EP25_BENDUNGAN_SABA_BANJIR",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "IBM Plex Mono,monospace", chipColor: TXT,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:14},{opacity:1,y:0,duration:.32,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--r':0,opacity:1},{'--r':100,duration:.5,ease:'power1.inOut'},a-.16);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--r':0,duration:.2,ease:'power1.in'},b-.12);}`,
  outroIn: `tl.fromTo('#outro',{'--r':0},{'--r':100,duration:.7,ease:'power1.inOut'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:54px;line-height:1.3;color:${TXT};background:rgba(5,14,19,.92);padding:8px 20px 10px;border-left:5px solid ${MINT};box-shadow:0 10px 26px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .06em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${TXT}",backgroundColor:"rgba(124,243,200,0)"},0);tl.set("#${id}",{color:"${INK}",backgroundColor:"rgb(124,243,200)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${TXT}",backgroundColor:"rgba(124,243,200,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bendungan Saba'", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
