// EP30 NABI DAUD, BESI LUNAK. ISOCRAFT: isometric ink-comic forge workshop on a mountain ledge (world3d.js).
// Panels are comic plates: warm paper cards with a heavy ink border and a hard offset ink shadow, Barlow Condensed kickers
// in rust, IBM Plex Sans text, Amiri Arabic in iron-brown, verse references as ink tags.
// Transition: isometric slide/tilt. A card slides in along the 30-degree iso axis while un-skewing from an iso side-face
// (skewY) and leaves along the same axis the other way. Both moves finish within 0.3 s.
// Arabic is read verbatim from the verse file and cut only at the Uthmani pause marks. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#efe3c8", INK = "#1C1712", PAPER = "#F6EEDC", RUST = "#B2452B", IRON = "#3B2C20", FORGE = "#E8892B";

const QF = readFileSync("../_research/quran/EP30_daud_besi.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const segs = (v) => v.split(/ [ۖۚ] /);
const V3410 = segs(verse("34:10")), V3411 = verse("34:11"), V2180 = segs(verse("21:80"));
const A10a = V3410[0].replace(/^۞ /, ""), A10b = V3410[1], A10c = V3410[2];
const A11a = segs(V3411)[0], A11z = V3411.slice(V3411.indexOf("وَٱعْمَلُوا۟"));
const A80a = V2180[0], A80b = V2180[1];
const A3818 = verse("38:18"), A3819 = verse("38:19"), A3820 = verse("38:20");
for (const [n, s] of Object.entries({ A10a, A10b, A10c, A11a, A11z, A80a, A80b })) if (!s || !QF.includes(s)) throw new Error("arabic cut " + n);
if (!A11z.startsWith("وَٱعْمَلُوا۟") || !A11z.endsWith("بَصِيرٌ")) throw new Error("A11z");

const ref = (r) => `<span class="rf">${r}</span>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 30</div>
    <div class="h">BESI LUNAK DI TANGAN NABI DAUD</div>
    <div class="sub" data-at="s1:Tapi" data-fx="rise">Tapi ia tetap makan dari hasil kerja tangannya sendiri.</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Wahai">
  <div class="card">
    <div class="k">SURAH SABA' ${ref("QS 34:10")}</div>
    <div class="ar">${A10a}</div>
    <div class="tr">&ldquo;Sungguh, telah Kami berikan kepada Dawud karunia dari Kami.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s2:Wahai" data-out="s3">
  <div class="card">
    <div class="k">SURAH SABA' ${ref("QS 34:10")}</div>
    <div class="ar">${A10b}</div>
    <div class="tr">&ldquo;Wahai gunung-gunung dan burung-burung! Bertasbihlah berulang-ulang bersama Dawud.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:burung-burung">
  <div class="card">
    <div class="k">SURAH SHAD ${ref("QS 38:18")}</div>
    <div class="ar">${A3818}</div>
    <div class="tr">&ldquo;Kami tundukkan gunung-gunung untuk bertasbih bersama dia pada waktu petang dan pagi.&rdquo;</div>
    <div class="chips"><span data-at="s3:pagi" data-fx="rise">PAGI</span><span class="d" data-at="s3:petang" data-fx="rise">PETANG</span></div>
  </div>
</div>
<div class="p" data-in="s3:burung-burung" data-out="s4">
  <div class="card">
    <div class="k">SURAH SHAD ${ref("QS 38:19")}</div>
    <div class="ar">${A3819}</div>
    <div class="tr">&ldquo;Dan burung-burung dalam keadaan terkumpul. Masing-masing sangat taat.&rdquo;</div>
    <div class="ln" data-at="s3:Alam" data-fx="rise">Alam pun ikut memuji bersamanya.</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Perintahnya">
  <div class="card">
    <div class="k">SURAH SABA' ${ref("QS 34:10")}</div>
    <div class="ar">${A10c}</div>
    <div class="tr">&ldquo;Dan Kami telah melunakkan besi untuknya.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Perintahnya" data-out="s4:Besi">
  <div class="card">
    <div class="k">PERINTAHNYA ${ref("QS 34:11")}</div>
    <div class="ar">${A11a}</div>
    <div class="tr">&ldquo;Buatlah baju besi yang besar-besar dan ukurlah anyamannya.&rdquo;</div>
    <div class="chips"><span data-at="s4:besar-besar" data-fx="rise">BESAR-BESAR</span><span class="d" data-at="s4:ukurlah" data-fx="rise">UKUR ANYAMANNYA</span></div>
  </div>
</div>
<div class="p" data-in="s4:Besi" data-out="s5">
  <div class="card">
    <div class="k">BIASANYA</div>
    <div class="h m">Besi biasanya:</div>
    <div class="ls">
      <span>dipanaskan</span>
      <span data-at="s4:dipukul" data-fx="rise">dipukul keras</span>
    </div>
    <div class="ln" data-at="s4:menjadi" data-fx="rise">Di tangannya: lunak.</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Lalu">
  <div class="card">
    <div class="k">SURAH AL-ANBIYA ${ref("QS 21:80")}</div>
    <div class="ar">${A80a}</div>
    <div class="tr">&ldquo;Dan Kami ajarkan kepada Dawud cara membuat baju besi untukmu, guna melindungi kamu dalam peperanganmu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Lalu" data-out="s6">
  <div class="card">
    <div class="k">LALU AYAT ITU BERTANYA ${ref("QS 21:80")}</div>
    <div class="ar">${A80b}</div>
    <div class="h q">Apakah kamu bersyukur?</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k">SABDA RASULULLAH ${ref("HR BUKHARI 2072")}</div>
    <div class="h m">&ldquo;Tidak ada makanan yang lebih baik daripada hasil kerja tangan sendiri.&rdquo;</div>
    <div class="ln" data-at="s6:Nabi" data-fx="rise">Nabi Daud makan dari hasil kerja tangannya.</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Ayatnya">
  <div class="card">
    <div class="k">SEORANG RAJA ${ref("QS 38:20")}</div>
    <div class="ar">${A3820}</div>
    <div class="tr">&ldquo;Dan Kami kuatkan kerajaannya dan Kami berikan hikmah kepadanya.&rdquo;</div>
    <div class="ln" data-at="s7:tetap" data-fx="rise">Tetap menempa besinya sendiri.</div>
  </div>
</div>
<div class="p" data-in="s7:Ayatnya" data-out="s8">
  <div class="card">
    <div class="k">PENUTUP AYAT ${ref("QS 34:11")}</div>
    <div class="ar">${A11z}</div>
    <div class="tr">&ldquo;Kerjakanlah kebajikan. Sungguh, Aku Maha Melihat apa yang kamu kerjakan.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">RENUNGAN</div>
    <div class="h m">Karunia besar tidak menghapus kerja keras.</div>
    <div class="sub" data-at="s8:Kerja" data-fx="rise">Kerja tangan sendiri adalah kemuliaan.</div>
    <div class="ask" data-at="s8:Hasil" data-fx="rise">Hasil tangan sendiri apa yang paling kamu banggakan?</div>
  </div>
</div>`;

const css = `
#chip{background:${PAPER};padding:5px 12px 3px;border:3px solid ${INK};box-shadow:4px 4px 0 ${INK};font-size:20px;letter-spacing:.07em;opacity:1}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:${PAPER};padding:20px 30px 24px;border:4px solid ${INK};box-shadow:10px 10px 0 ${INK}}
.card:before{content:"";position:absolute;left:-4px;top:-4px;width:26px;height:26px;background:${RUST};clip-path:polygon(0 0,100% 0,0 100%)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:31px;letter-spacing:.1em;color:${RUST};margin-bottom:6px}
.h{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:86px;line-height:.98;color:${INK};letter-spacing:.005em}
.h.m{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:48px;line-height:1.14;letter-spacing:0}
.h.q{font-size:72px;margin-top:4px;color:${RUST}}
.sub{font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:36px;line-height:1.22;color:#3b332a;margin-top:12px}
.tr{font-family:"IBM Plex Sans",sans-serif;font-weight:500;font-style:italic;font-size:33px;line-height:1.3;color:#3b332a;margin-top:4px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.72;color:${IRON}}
.rf{display:inline-block;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:25px;letter-spacing:.06em;color:${PAPER};background:${INK};padding:3px 12px 2px;white-space:nowrap}
.chips{display:flex;gap:14px;margin-top:14px;flex-wrap:wrap}
.chips span{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:40px;letter-spacing:.08em;color:${INK};background:${FORGE};border:3px solid ${INK};padding:4px 16px 2px}
.chips span.d{background:${INK};color:${PAPER}}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.ls span{font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:44px;line-height:1.12;color:${INK};padding-left:50px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.3em;width:24px;height:24px;border:4px solid ${INK};background:${FORGE};box-sizing:border-box;transform:skewY(-20deg)}
.ln{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:38px;line-height:1.2;color:${RUST};margin-top:12px;padding-top:10px;border-top:3px solid ${INK}}
.ask{display:inline-block;margin-top:16px;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:38px;line-height:1.2;color:${INK};background:${FORGE};border:3px solid ${INK};padding:10px 18px}
`;

// hammer strikes, hot strikes and ring links are shared with mix.py through beats.json (K)
const r3 = (x) => +x.toFixed(3);
const HOT = [39.0, 39.6, 40.2].map((x, i) => r3(at("s4:dipanaskan") + 0.2 + i * 0.6));
const STR = [2.5];
STR.push(...HOT);
for (let x = at("s7:menempa"); x < TL.scenes[6].end - 0.2; x += 0.72) STR.push(r3(x));
for (let x = TL.scenes[7].start + 0.4; x < at("s8:Kisah") - 1.0; x += 1.44) STR.push(r3(x));
const L0 = at("s4:Perintahnya") + 0.4, L1 = at("s4:Besi") - 0.5;
const LINKS = Array.from({ length: 20 }, (_, i) => r3(L0 + ((L1 - L0) * i) / 19));

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:lunak", "s1:makan", "s1:Tapi", "s2:Wahai", "s3:pagi", "s3:petang", "s3:burung-burung", "s3:berkumpul", "s3:taat", "s3:Alam",
  "s4:lunakkan", "s4:Perintahnya", "s4:ukurlah", "s4:Besi", "s4:dipanaskan", "s4:menjadi",
  "s5:ajarkan", "s5:besi", "s5:melindungi", "s6:makanan", "s7:raja", "s7:hikmah", "s7:tetap", "s7:menempa", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "30", bg: BG, vig: 0.16, grain: 0.06, capfloor: 0, html, css, signature: "EP30_DAUD_BESI_LUNAK",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Barlow Condensed,sans-serif", chipColor: INK,
  extraAt: WORLD_AT, K: { str: STR, hot: HOT, links: LINKS },
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.24,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{x:-130,y:75,skewY:-14,opacity:0},{x:0,y:0,skewY:0,opacity:1,duration:.28,ease:'power3.out'},a);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{x:130,y:-75,skewY:14,opacity:0,duration:.18,ease:'power2.in'},b-.2);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:54px;line-height:1.3;color:${PAPER};background:${INK};padding:8px 20px 10px;border:3px solid ${INK};box-shadow:6px 6px 0 ${RUST}}
.w{display:inline-block;margin:0 .06em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${PAPER}",backgroundColor:"rgba(232,137,43,0)"},0);tl.set("#${id}",{color:"${INK}",backgroundColor:"rgb(232,137,43)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${PAPER}",backgroundColor:"rgba(232,137,43,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nabi Daud, Besi Lunak", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "strikes", STR.length, "duration", TL.duration, "outro", K.outro);
