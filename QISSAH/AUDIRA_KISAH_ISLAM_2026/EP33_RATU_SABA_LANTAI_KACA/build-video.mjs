// EP33 RATU SABA DAN LANTAI KACA. GLASSCRAFT: spatial glassmorphism at purple dusk (see world3d.js).
// Panels are frosted glass tiles: deep dusk-violet glass with an ice hairline border, a gold top bevel, Marcellus titles,
// Manrope text, Amiri Arabic in pale gold, verse references as gold glass tags.
// Transition: refraction pane. A card refracts open from a vertical glint (clip opens from the centre while the blur and a
// slight horizontal stretch settle) and an ice sheen crosses it; on exit it blurs and folds back into the glint.
// Each move finishes within 0.3 s and the outgoing card is gone before the next one opens.
// Arabic is read verbatim from the verse file and cut only at pause marks or clause starts. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2a2350", ICE = "#D9ECF2", TEAL = "#3FA7A3", GOLD = "#D4A84A", DUSK = "#4B3F72", WHITE = "#F7FAFB", PALEGOLD = "#F3DDA2";

const QF = readFileSync("../_research/quran/EP33_ratu_saba_lantai_kaca.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const segs = (v) => v.split(/ [ۖۚۗ] /);
const from = (s, w) => { const i = s.indexOf(w); if (i < 0) throw new Error("cut " + w); return s.slice(i); };
const upto = (s, w) => { const i = s.indexOf(w); if (i < 0) throw new Error("cut " + w); return s.slice(0, i + w.length); };
const A30 = from(verse("27:30"), "بِسْمِ");
const A31 = verse("27:31");
const A34 = upto(verse("27:34"), "أَفْسَدُوهَا");
const A40a = from(segs(verse("27:40"))[0], "قَبْلَ");
const A40b = from(segs(verse("27:40"))[1], "هَـٰذَا");
const A42 = segs(verse("27:42"))[1];
const A44 = from(verse("27:44"), "وَأَسْلَمْتُ");
for (const [n, s] of Object.entries({ A30, A31, A34, A40a, A40b, A42, A44 })) if (!s || !QF.includes(s)) throw new Error("arabic cut " + n);
if (!A42.startsWith("قَالَتْ") || !A40a.endsWith("طَرْفُكَ") || !A40b.endsWith("أَكْفُرُ") || !A44.endsWith("ٱلْعَـٰلَمِينَ")) throw new Error("arabic bounds");

const ref = (r) => `<span class="rf">${r}</span>`;
const P = (inA, outA, body, first = false) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}"><div class="card">${body}<div class="sh"></div></div></div>`;

const html = [
  P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 33</div>
    <div class="h">DIKIRA AIR</div>
    <div class="ln" data-at="s1:Ternyata" data-fx="rise">Ternyata itu kaca.</div>`, true),
  P("s2", "s2:dengan", `<div class="k">SURAH AN-NAML ${ref("QS 27:29-30")}</div>
    <div class="h m">Surat untuk Ratu Saba</div>
    <div class="sub" data-at="s2:Nabi" data-fx="rise">dari Nabi Sulaiman</div>`),
  P("s2:dengan", "s2:Janganlah", `<div class="k">SURAT ITU DIBUKA DENGAN ${ref("QS 27:30")}</div>
    <div class="ar c">${A30}</div>
    <div class="tr c">&ldquo;Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.&rdquo;</div>`),
  P("s2:Janganlah", "s3", `<div class="k">ISI SURAT ${ref("QS 27:31")}</div>
    <div class="ar c">${A31}</div>
    <div class="tr c">&ldquo;Janganlah kalian sombong, datanglah dengan berserah diri.&rdquo;</div>`),
  P("s3", "s3:Mereka", `<div class="k">MUSYAWARAH ${ref("QS 27:32")}</div>
    <div class="h m">Ia tidak tergesa.</div>
    <div class="ln" data-at="s3:bermusyawarah" data-fx="rise">Ia bermusyawarah dengan para pembesarnya.</div>`),
  P("s3:Mereka", "s3:Ia#3", `<div class="k">PARA PEMBESAR ${ref("QS 27:33")}</div>
    <div class="h m">&ldquo;Kita kuat dan berani berperang.&rdquo;</div>`),
  P("s3:Ia#3", "s3:Maka", `<div class="k">JAWABAN SANG RATU ${ref("QS 27:34")}</div>
    <div class="ar">${A34}</div>
    <div class="tr">&ldquo;Raja-raja, bila memasuki sebuah negeri, merusaknya.&rdquo;</div>`),
  P("s3:Maka", "s4", `<div class="k">PILIHANNYA ${ref("QS 27:35")}</div>
    <div class="h m">Ia memilih mengirim hadiah,</div>
    <div class="ln" data-at="s3:menunggu" data-fx="rise">lalu menunggu.</div>`),
  P("s4", "s4:Lalu", `<div class="k">HADIAH DITOLAK ${ref("QS 27:36")}</div>
    <div class="h m">&ldquo;Apa yang Allah berikan kepadaku lebih baik.&rdquo;</div>`),
  P("s4:Lalu", "s5", `<div class="k">SULAIMAN BERTANYA ${ref("QS 27:38")}</div>
    <div class="h m">&ldquo;Siapa yang sanggup membawa singgasana ratu itu kemari?&rdquo;</div>`),
  P("s5", "s5:Singgasana", `<div class="k">YANG MEMILIKI ILMU DARI KITAB ${ref("QS 27:40")}</div>
    <div class="ar c">${A40a}</div>
    <div class="tr c">&ldquo;Aku membawanya sebelum matamu berkedip.&rdquo;</div>`),
  P("s5:Sulaiman", "s6", `<div class="k">SULAIMAN BERKATA ${ref("QS 27:40")}</div>
    <div class="ar">${A40b}</div>
    <div class="tr">&ldquo;Ini termasuk karunia Tuhanku untuk mengujiku, apakah aku bersyukur atau mengingkari (nikmat-Nya).&rdquo;</div>`),
  P("s6", "s6:serupa", `<div class="k">UJIAN KECERDASAN ${ref("QS 27:41")}</div>
    <div class="h m">Singgasana itu diubah.</div>
    <div class="ln" data-at="s6:datang" data-fx="rise">Lalu sang ratu datang.</div>`),
  P("s6:serupa", "s6:Tidak", `<div class="k">IA DITANYA ${ref("QS 27:42")}</div>
    <div class="h m">&ldquo;Serupa inikah singgasanamu?&rdquo;</div>
    <div class="ans" data-at="s6:seakan-akan" data-fx="rise"><div class="ar c">${A42}</div><div class="tr c">&ldquo;Seakan-akan itulah dia.&rdquo;</div></div>`),
  P("s6:Tidak", "s7", `<div class="k">JAWABAN YANG CERDAS <span class="src">Tafsir Ibnu Katsir</span></div>
    <div class="h m">Tidak terburu membenarkan,</div>
    <div class="ln" data-at="s6:tidak" data-fx="rise">tidak terburu menyangkal.</div>`),
  P("s7", "s7:Ia", `<div class="k">LANTAI ISTANA ${ref("QS 27:44")}</div>
    <div class="h">DIKIRA KOLAM AIR</div>
    <div class="ln" data-at="s7:ternyata" data-fx="rise">ternyata lantai yang dilapisi kaca.</div>`),
  P("s7:Ia", "s8", `<div class="k">IA BERKATA ${ref("QS 27:44")}</div>
    <div class="ar c">${A44}</div>
    <div class="tr c">&ldquo;Aku berserah diri bersama Sulaiman kepada Allah, Tuhan seluruh alam.&rdquo;</div>`),
  P("s8", "@END", `<div class="k">HIKMAH</div>
    <div class="h m">Ia tunduk pada kebenaran yang ia lihat sendiri.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="rise">Apa yang membuatnya berubah?</div>`),
].join("\n");

const css = `
#capfloor{background:linear-gradient(180deg,rgba(26,20,52,0),rgba(26,20,52,.4) 45%,rgba(26,20,52,.4) 70%,rgba(26,20,52,0))}
#chip{background:rgba(32,26,66,.72);padding:5px 12px 4px;border:1px solid rgba(217,236,242,.55);border-radius:6px;font-size:19px;letter-spacing:.07em}
.p{padding:0}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;overflow:hidden;border-radius:22px;padding:24px 32px 26px;
 background:linear-gradient(160deg,rgba(64,54,118,.88),rgba(30,25,66,.9) 55%,rgba(22,44,62,.88));
 border:1.5px solid rgba(217,236,242,.6);box-shadow:0 24px 54px rgba(10,6,30,.5),inset 0 2px 0 rgba(243,221,162,.75),inset 0 0 0 1px rgba(255,255,255,.06)}
.card:before{content:"";position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,0));pointer-events:none}
.sh{position:absolute;top:-20%;bottom:-20%;left:0;width:34%;transform:skewX(-18deg);background:linear-gradient(90deg,rgba(217,236,242,0),rgba(236,250,252,.55),rgba(217,236,242,0));opacity:0;pointer-events:none}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Manrope,sans-serif;font-weight:800;font-size:23px;letter-spacing:.18em;color:${PALEGOLD};margin-bottom:8px}
.h{font-family:Marcellus,serif;font-weight:400;font-size:84px;line-height:1.02;color:${WHITE};letter-spacing:.03em}
.h.m{font-size:54px;line-height:1.14;letter-spacing:0}
.c{text-align:center}
.sub{font-family:Manrope,sans-serif;font-weight:600;font-size:36px;line-height:1.24;color:${ICE};margin-top:8px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.72;color:${PALEGOLD};text-shadow:0 0 16px rgba(243,221,162,.3)}
.ar.c{text-align:center}
.tr{font-family:Manrope,sans-serif;font-weight:600;font-style:italic;font-size:32px;line-height:1.3;color:${ICE};margin-top:2px}
.ans{margin-top:12px;padding-top:6px;border-top:1px solid rgba(217,236,242,.4)}
.rf{display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:21px;letter-spacing:.06em;color:#1d1636;background:linear-gradient(180deg,#f3dda2,${GOLD});border-radius:6px;padding:4px 12px 3px;white-space:nowrap}
.src{font-weight:700;font-size:19px;letter-spacing:.06em;color:#1d1636;background:${ICE};border-radius:6px;padding:4px 10px 3px}
.ln{font-family:Manrope,sans-serif;font-weight:800;font-size:38px;line-height:1.2;color:#8fe3dc;margin-top:12px;padding-top:10px;border-top:1px solid rgba(217,236,242,.4)}
.ask{display:inline-block;margin-top:16px;font-family:Manrope,sans-serif;font-weight:800;font-size:38px;line-height:1.18;color:#1d1636;background:linear-gradient(180deg,#e9f6f9,${ICE});border-radius:12px;padding:10px 18px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:menyingkap", "s1:air", "s1:Ternyata", "s2:Saba", "s2:surat", "s2:dengan", "s2:Janganlah",
  "s3:bermusyawarah", "s3:pembesarnya", "s3:kuat", "s3:berperang", "s3:raja-raja", "s3:memasuki", "s3:merusaknya", "s3:Maka", "s3:memilih", "s3:mengirim", "s3:lalu",
  "s4:menolak", "s4:Allah", "s4:baik", "s4:bertanya", "s4:singgasana",
  "s5:membawanya", "s5:berkedip", "s5:Singgasana", "s5:hadapannya", "s5:Sulaiman", "s5:mengujiku", "s5:bersyukur",
  "s6:diubah", "s6:sang", "s6:serupa", "s6:seakan-akan", "s6:itulah", "s6:Tidak",
  "s7:diminta", "s7:istana", "s7:kolam", "s7:air", "s7:ternyata", "s7:kaca", "s7:berserah", "s7:Sulaiman", "s7:Allah", "s7:alam",
  "s8:kebenaran", "s8:Menurut", "s8:Kisah"];
const { AT, K } = writeWorld(TL, at, {
  ep: "33", bg: BG, vig: 0.4, grain: 0.045, capfloor: 0.4, html, css, signature: "EP33_RATU_SABA_LANTAI_KACA",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Manrope,sans-serif", chipColor: WHITE,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.28,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const s=p.querySelector('.sh');tl.fromTo(p,{opacity:0,scaleX:1.07,filter:'blur(10px)',clipPath:'inset(0% 47% 0% 47% round 22px)'},{opacity:1,scaleX:1,filter:'blur(0px)',clipPath:'inset(0% 0% 0% 0% round 22px)',duration:.26,ease:'power3.out'},a);tl.fromTo(s,{xPercent:-120,opacity:1},{xPercent:320,opacity:0,duration:.28,ease:'power2.out'},a+.02);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,scaleX:.95,filter:'blur(9px)',clipPath:'inset(0% 49% 0% 49% round 22px)',duration:.2,ease:'power2.in'},b-.28);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:53px;line-height:1.32;color:${WHITE};background:linear-gradient(170deg,rgba(52,44,100,.92),rgba(24,20,54,.92));border:1.5px solid rgba(217,236,242,.55);border-radius:18px;padding:9px 24px 12px;box-shadow:0 14px 30px rgba(8,5,24,.45),inset 0 2px 0 rgba(243,221,162,.6)}
.w{display:inline-block;margin:0 .07em;padding:0 .06em}`,
(id, w) => `tl.set("#${id}",{color:"${WHITE}",textShadow:"0 0 0 rgba(0,0,0,0)"},0);tl.set("#${id}",{color:"#F3D27A",textShadow:"0 0 16px rgba(243,210,122,.6)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${WHITE}",textShadow:"0 0 0 rgba(0,0,0,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:6},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ratu Saba dan Lantai Kaca", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
