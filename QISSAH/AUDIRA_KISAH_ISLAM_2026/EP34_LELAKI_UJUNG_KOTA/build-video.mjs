// EP34 LELAKI DARI UJUNG KOTA. LIDARFORGE: point-cloud survey of an ancient town (see world3d.js).
// Panels are survey read-outs: near-black glass cards with a hairline cyan frame and four corner brackets,
// IBM Plex Mono kickers, Manrope text, Amiri Arabic in pale cyan, verse references as cyan tags. Amber marks the man.
// Transition: scan raster. A card appears as a bright thin scan line that widens, then opens vertically
// (scaleY) while its brightness settles; on exit it collapses back to a line and the line shrinks away.
// In 0.25 s, out 0.24 s, the outgoing card is gone before the next one starts.
// Arabic is read verbatim from the verse file and cut only at Uthmani pause marks or the clear speech boundary.
// Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0B0F14", CY = "#5FD3E0", AMB = "#F2A93B", LBL = "#E8EEF2", RED = "#C0504D", GLASS = "rgba(8,14,19,.9)";

const QF = readFileSync("../_research/quran/EP34_lelaki_ujung_kota.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V13 = verse("36:13"), V20 = verse("36:20"), V22 = verse("36:22"), V25 = verse("36:25"), V26 = verse("36:26");
const W = (v, i, j) => v.split(" ").slice(i, j + 1).join(" ");
// QS 36:20 has 10 words (qala = word 6); QS 36:26 has 8 words with the pause mark at word 3 and qala at word 4
if (V20.split(" ").length !== 10 || V26.split(" ").length !== 8 || V26.split(" ")[3].length !== 1) throw new Error("verse layout changed");
const A20a = W(V20, 0, 5);  // wa ja'a min aqshal madinati rajulun yas'a
const A20b = W(V20, 7, 9);  // ya qaumi-ttabi'ul mursalin
const A26a = W(V26, 0, 2);  // qiladkhulil jannah
const A26b = W(V26, 5, 7);  // ya laita qaumi ya'lamun
for (const [n, x] of Object.entries({ A20a, A20b, A26a, A26b })) if (!x || !QF.includes(x)) throw new Error("arabic cut " + n);

const ref = (r) => `<span class="rf">${r}</span>`;
const P = (inA, outA, body, first = false) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}"><div class="card">${body}</div></div>`;

const html = [
  P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 34</div>
    <div class="h">LELAKI DARI UJUNG KOTA</div>
    <div class="sub">Bukan nabi, bukan pula utusan.</div>
    <div class="ln a" data-at="s1:Al-Qur'an" data-fx="rise">Al-Qur'an mengabadikan kata-katanya.</div>`, true),
  P("s2", "s2:Sebuah", `<div class="k">SURAH YASIN ${ref("QS 36:13")}</div>
    <div class="ar">${V13}</div>
    <div class="tr">&ldquo;Buatlah suatu perumpamaan bagi mereka, yaitu penduduk suatu negeri, ketika utusan-utusan datang kepada mereka.&rdquo;</div>`),
  P("s2:Sebuah", "s3", `<div class="k">SEBUAH NEGERI ${ref("QS 36:14")}</div>
    <div class="h m">Dua utusan datang, lalu yang ketiga.</div>
    <div class="steps"><span data-at="s2:mendustakan" data-fx="rise">DIDUSTAKAN</span><span class="r" data-at="s2:menolak" data-fx="rise">TETAP MENOLAK</span></div>`),
  P("s3", "s4", `<div class="k r">KATA PENDUDUK ${ref("QS 36:15&ndash;18")}</div>
    <div class="q">&ldquo;Kalian hanyalah manusia seperti kami.&rdquo;</div>
    <div class="q" data-at="s3:Kami" data-fx="rise">&ldquo;Kami malah sial karena kalian.&rdquo;</div>
    <div class="q r" data-at="s3:Jika" data-fx="rise">&ldquo;Jika tidak berhenti, kami rajam kalian.&rdquo;</div>`),
  P("s4", "s4:Ia", `<div class="k a">DARI UJUNG KOTA ${ref("QS 36:20")}</div>
    <div class="ar">${A20a}</div>
    <div class="tr">&ldquo;Dan datanglah dari ujung kota, seorang laki-laki dengan bergegas.&rdquo;</div>`),
  P("s4:Ia", "s5", `<div class="k a">IA BERKATA ${ref("QS 36:20&ndash;21")}</div>
    <div class="ar">${A20b}</div>
    <div class="tr">&ldquo;Wahai kaumku! Ikutilah utusan-utusan itu.&rdquo;</div>
    <div class="ln a" data-at="s4:Ikutilah" data-fx="rise">Ikutilah orang yang tidak meminta imbalan darimu.</div>`),
  P("s5", "s5:Sungguh", `<div class="k a">IA BERKATA ${ref("QS 36:22")}</div>
    <div class="ar">${V22}</div>
    <div class="tr">&ldquo;Mengapa aku tidak menyembah Dia yang telah menciptakanku?&rdquo;</div>
    <div class="ln" data-at="s5:Mengapa" data-fx="rise">&ldquo;Mengapa aku menyembah tuhan lain, yang tak bisa menolongku sedikit pun?&rdquo; ${ref("QS 36:23")}</div>`),
  P("s5:Sungguh", "s6", `<div class="k a">PENGAKUANNYA ${ref("QS 36:25")}</div>
    <div class="ar c">${V25}</div>
    <div class="tr c">&ldquo;Sungguh, aku telah beriman kepada Tuhanmu, maka dengarkanlah aku.&rdquo;</div>`),
  P("s6", "s6:Qatadah", `<div class="k">MENURUT RIWAYAT</div>
    <div class="h m">Kaumnya membunuhnya saat itu juga.</div>
    <div class="src">Tafsir Ibnu Katsir, QS 36:20 &middot; riwayat Ibnu Ishaq</div>`),
  P("s6:Qatadah", "s6:Al-Qur'an", `<div class="k a">DOANYA &middot; RIWAYAT QATADAH</div>
    <div class="q a">&ldquo;Ya Allah, berilah petunjuk kepada kaumku, karena mereka tidak mengetahui.&rdquo;</div>
    <div class="src">Tafsir Ibnu Katsir, QS 36:20</div>`),
  P("s6:Al-Qur'an", "s7", `<div class="k">AYAT BERIKUTNYA ${ref("QS 36:26")}</div>
    <div class="sub b">Al-Qur'an tidak merinci kematiannya.</div>
    <div class="blk" data-at="s6:masuklah" data-fx="rise"><div class="ar c">${A26a}</div><div class="tr c">&ldquo;Masuklah ke surga.&rdquo;</div></div>`),
  P("s7", "s8", `<div class="k a">KALIMAT PERTAMANYA ${ref("QS 36:26&ndash;27")}</div>
    <div class="ar c" data-at="s7:alangkah" data-fx="rise">${A26b}</div>
    <div class="tr c">&ldquo;Alangkah baiknya sekiranya kaumku mengetahui, apa yang membuat Tuhanku mengampuniku.&rdquo;</div>`),
  P("s8", "@END", `<div class="k a">RENUNGAN</div>
    <div class="h m">Bahkan setelah disakiti, yang ia pikirkan tetap kaumnya.</div>
    <div class="ask" data-at="s8:Siapa" data-fx="rise">Siapa yang paling ingin kamu ajak pada kebaikan?</div>`),
].join("\n") + `
<div id="hud"><i></i><span>PINDAI LIDAR</span><b id="sec">SEKTOR UTARA</b></div>
<div id="sline"></div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(11,15,20,0),rgba(11,15,20,.5) 45%,rgba(11,15,20,.5) 70%,rgba(11,15,20,0))}
#chip{background:rgba(8,14,19,.78);padding:5px 12px 4px;border:1px solid rgba(95,211,224,.55);font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:18px;letter-spacing:.05em;opacity:1}
#hud{position:absolute;right:56px;top:188px;z-index:11;display:flex;align-items:center;gap:10px;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:17px;letter-spacing:.08em;color:${CY};opacity:.85}
#hud i{display:block;width:10px;height:10px;border-radius:50%;background:${CY};box-shadow:0 0 8px ${CY}}
#hud b{color:${LBL};font-weight:600}
#sline{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,rgba(95,211,224,0),rgba(95,211,224,.55),rgba(95,211,224,0));opacity:.12;z-index:6;pointer-events:none}
.p{padding:0}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:${GLASS};padding:24px 32px 26px;border:1px solid rgba(95,211,224,.45);transform-origin:50% 50%;
 box-shadow:0 22px 46px rgba(0,0,0,.5);
 background-image:linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY}),linear-gradient(${CY},${CY});
 background-size:26px 3px,3px 26px,26px 3px,3px 26px,26px 3px,3px 26px,26px 3px,3px 26px;
 background-position:0 0,0 0,100% 0,100% 0,0 100%,0 100%,100% 100%,100% 100%;background-repeat:no-repeat;background-color:${GLASS}}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:24px;letter-spacing:.12em;color:${CY};margin-bottom:8px}
.k.a{color:${AMB}}.k.r{color:#E07470}
.h{font-family:Manrope,sans-serif;font-weight:800;font-size:76px;line-height:1.02;color:${LBL};letter-spacing:-.01em}
.h.m{font-size:48px;line-height:1.15;letter-spacing:0}
.c{text-align:center}
.sub{font-family:Manrope,sans-serif;font-weight:600;font-size:36px;line-height:1.24;color:#BFD3DA;margin-top:10px}
.sub.b{margin-top:0}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:56px;line-height:1.72;color:#BDEFF5;text-shadow:0 0 14px rgba(95,211,224,.3)}
.ar.c{text-align:center}
.tr{font-family:Manrope,sans-serif;font-weight:600;font-style:italic;font-size:31px;line-height:1.3;color:#C9D8DE;margin-top:2px}
.q{font-family:Manrope,sans-serif;font-weight:700;font-size:38px;line-height:1.2;color:${LBL};margin-top:8px;padding-left:18px;border-left:3px solid rgba(224,116,112,.7)}
.q.r{color:#F08A85}.q.a{color:#FFD08A;border-left-color:${AMB};font-size:40px}
.rf{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:20px;letter-spacing:.04em;color:${BG};background:${CY};padding:4px 10px 3px;white-space:nowrap}
.ln{font-family:Manrope,sans-serif;font-weight:700;font-size:34px;line-height:1.22;color:#D7EEF2;margin-top:14px;padding-top:12px;border-top:1px solid rgba(95,211,224,.4)}
.ln.a{color:#FFD08A}
.ln .rf{font-size:17px;vertical-align:middle}
.steps{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px}
.steps span{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:28px;letter-spacing:.08em;color:${BG};background:${CY};padding:7px 14px 6px}
.steps span.r{background:${RED};color:#fff}
.src{margin-top:14px;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:21px;letter-spacing:.03em;color:rgba(191,211,218,.85)}
.blk{margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,227,176,.4)}
.blk .ar{color:#FFE3B0;text-shadow:0 0 16px rgba(255,200,120,.35)}
.ask{display:inline-block;margin-top:16px;font-family:Manrope,sans-serif;font-weight:800;font-size:37px;line-height:1.18;color:${BG};background:${AMB};padding:10px 18px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:lelaki", "s1:bergegas", "s2:dua", "s2:mendustakan", "s2:ketiga", "s2:menolak", "s3:penduduk", "s3:sial", "s3:rajam",
  "s4:datanglah", "s4:wahai", "s4:ikutilah", "s4:imbalan", "s5:menciptakanku", "s5:tuhan", "s5:menolongku", "s5:beriman", "s5:dengarkanlah",
  "s6:membunuhnya", "s6:berdoa", "s6:mengetahui", "s6:kematiannya", "s6:masuklah", "s7:kaumku", "s8:kaumnya", "s8:Kisah"];
const SEC = [["s1", "SEKTOR UTARA"], ["s2", "GERBANG SELATAN"], ["s3", "ALUN-ALUN"], ["s4", "JALUR UTARA"], ["s5", "ALUN-ALUN"], ["s6", "ALUN-ALUN"], ["s6:masuklah", "GERBANG CAHAYA"], ["s7", "GERBANG CAHAYA"], ["s8", "SELURUH KOTA"]];
const { AT, K } = writeWorld(TL, at, {
  ep: "34", bg: BG, vig: 0.5, grain: 0.05, capfloor: 0.5, html, css, signature: "EP34_LELAKI_UJUNG_KOTA",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "IBM Plex Mono,monospace", chipColor: LBL,
  extraAt: [...WORLD_AT, "s6:masuklah"],
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:10},{opacity:1,y:0,duration:.26,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const c=p.querySelector('.card');tl.set(c,{scaleX:.5,scaleY:.02,filter:'brightness(2.4)'},a-.001);tl.set(p,{opacity:1},a);tl.to(c,{scaleX:1,duration:.1,ease:'power2.out'},a);tl.to(c,{scaleY:1,filter:'brightness(1)',duration:.16,ease:'power3.out'},a+.09);}`,
  panelOut: `(tl,p,b)=>{const c=p.querySelector('.card');tl.to(c,{scaleY:.02,filter:'brightness(2.4)',duration:.13,ease:'power2.in'},b-.3);tl.to(c,{scaleX:0,duration:.1,ease:'power2.in'},b-.17);tl.set(p,{opacity:0},b-.06);}`,
  hud: `(()=>{const S=${JSON.stringify(SEC)}.map(([k,v])=>[AT[k]??K[k],v]);const e=q('#sec'),d=q('#hud i'),sl=q('#sline');return (t)=>{let v=S[0][1];for(const [a,s] of S)if(t>=a-.2)v=s;if(e.textContent!==v)e.textContent=v;d.style.opacity=(Math.floor(t*2)%2)?'.35':'1';const y=((t*260)%2300)-100;sl.style.transform='translateY('+y+'px)';};})()`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:53px;line-height:1.34;color:${LBL};background:rgba(8,14,19,.9);padding:9px 24px 12px;border:1px solid rgba(95,211,224,.5);border-left:4px solid ${CY};box-shadow:0 12px 28px rgba(0,0,0,.45)}
.w{display:inline-block;margin:0 .07em;padding:0 .06em}`,
(id, w) => `tl.set("#${id}",{color:"${LBL}",textShadow:"0 0 0 rgba(0,0,0,0)"},0);tl.set("#${id}",{color:"${AMB}",textShadow:"0 0 14px rgba(242,169,59,.55)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${LBL}",textShadow:"0 0 0 rgba(0,0,0,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{scaleY:.2},{scaleY:1,duration:.1,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lelaki dari Ujung Kota", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
