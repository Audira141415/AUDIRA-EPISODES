// EP31 NABI IBRAHIM DAN EMPAT BURUNG. UKIYOFORGE: a woodblock-print valley in 3D (see world3d.js).
// Panels are washi-paper cartouches (like the title cartouche of an ukiyo-e print): cream paper, a double indigo frame,
// a small vermilion seal in the corner, Shippori Mincho kickers/titles, Manrope text, Amiri Arabic in indigo.
// Transition: hanging-scroll unroll. A dark wooden roller rod rolls left-to-right and the paper unrolls behind it
// (clip-path follows the rod); on exit the rod rolls back and the scroll closes. Both moves finish within 0.3 s,
// and the outgoing scroll is closed before the next one starts.
// Arabic is cut verbatim from the verse file by word ranges (checked). Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#e9dcc0", INDIGO = "#24345A", BRICK = "#B8473A", WASHI = "#EFE3C8", MOSS = "#6F7F4E", GOLD = "#E2A84B", INK = "#1B2133";

const QF = readFileSync("../_research/quran/EP31_ibrahim_burung.txt", "utf8");
const V = QF.match(/^QS 2:260 \| (.+)$/m)[1].trim();
const VW = V.split(" ");
// 43 words incl. the pause marks at 8, 12, 18, 37
if (VW.length !== 43 || [8, 12, 18, 37].some((i) => VW[i].length > 2)) throw new Error("verse layout changed " + VW.length);
function cut(i, j) {
  const s = VW.slice(i, j + 1).join(" ");
  if (!V.includes(s)) throw new Error("not verbatim " + s);
  return s;
}
const A1 = cut(3, 7);   // rabbi arini kaifa tuhyil mauta
const A2 = cut(9, 11);  // qala awalam tu'min
const A3 = cut(13, 17); // qala bala walakin liyathma'inna qalbi
const A4 = cut(20, 25); // fakhudz arba'atan minath-thairi fashurhunna ilaika
const A5 = cut(26, 32); // tsummaj'al 'ala kulli jabalin minhunna juz'a
const A6 = cut(33, 36); // tsummad'uhunna ya'tinaka sa'ya
const A7 = cut(38, 42); // wa'lam annallaha 'azizun hakim

const ref = (r) => `<span class="rf">${r}</span>`;
const P = (inA, outA, body, first = false) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}"><div class="sc"><div class="card"><i class="seal"></i>${body}</div><div class="rod"></div></div></div>`;
const plumes = `<div class="plumes">${[INDIGO, BRICK, MOSS, GOLD].map((c, i) => `<b style="background:${c}" data-at="s4:${["empat", "ekor", "burung", "burung"][i]}${i === 3 ? "+0.25" : ""}" data-fx="rise"></b>`).join("")}</div>`;

const html = [
  P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 31</div>
    <div class="h">AGAR HATIKU TENANG</div>
    <div class="sub">Doa seorang nabi yang sudah yakin</div>
    <div class="ln" data-at="s1:perlihatkan" data-fx="rise">&ldquo;Perlihatkan kepadaku bagaimana Engkau menghidupkan yang mati.&rdquo;</div>`, true),
  P("s2", "s2:Sebagian", `<div class="k">SURAH AL-BAQARAH &middot; AYAT 260 ${ref("QS 2:260")}</div>
    <div class="ar">${A1}</div>
    <div class="tr">&ldquo;Ya Tuhanku, perlihatkanlah kepadaku bagaimana Engkau menghidupkan orang mati.&rdquo;</div>`),
  P("s2:Sebagian", "s3", `<div class="k">SEBAGIAN ULAMA MENYEBUT</div>
    <div class="h m">Doa ini datang setelah debatnya dengan sang raja</div>
    <div class="ln" data-at="s2:tentang" data-fx="rise">tentang menghidupkan dan mematikan.</div>
    <div class="src">Tafsir Ibnu Katsir, QS 2:260</div>`),
  P("s3", "s3:Ibrahim", `<div class="k">ALLAH BERTANYA ${ref("QS 2:260")}</div>
    <div class="ar c">${A2}</div>
    <div class="tr c">&ldquo;Belum percayakah engkau?&rdquo;</div>`),
  P("s3:Ibrahim", "s3:Ia", `<div class="k">IBRAHIM MENJAWAB ${ref("QS 2:260")}</div>
    <div class="ar c">${A3}</div>
    <div class="tr c">&ldquo;Aku percaya, tetapi agar hatiku tenang.&rdquo;</div>`),
  P("s3:Ia", "s4", `<div class="k">BUKAN KERAGUAN</div>
    <div class="h m">Ia tidak ragu.</div>
    <div class="ln" data-at="s3:ingin" data-fx="rise">Ia ingin keyakinannya menjadi sesuatu yang dilihat mata.</div>`),
  P("s4", "s4:Letakkan", `<div class="k">PERINTAHNYA ${ref("QS 2:260")}</div>
    <div class="ar">${A4}</div>
    <div class="tr">&ldquo;Ambillah empat ekor burung, lalu cincanglah olehmu.&rdquo;</div>${plumes}`),
  P("s4:Letakkan", "s5", `<div class="k">LALU ${ref("QS 2:260")}</div>
    <div class="ar">${A5}</div>
    <div class="tr">&ldquo;Letakkan di atas masing-masing bukit satu bagian.&rdquo;</div>
    <div class="ln" data-at="s4:berjauhan" data-fx="rise">Berjauhan satu sama lain.</div>`),
  P("s5", "s5:Ibrahim", `<div class="k">KEMUDIAN ${ref("QS 2:260")}</div>
    <div class="ar">${A6}</div>
    <div class="tr">&ldquo;Panggillah mereka, niscaya mereka datang kepadamu dengan segera.&rdquo;</div>`),
  P("s5:burung-burung", "s6", `<div class="k">DARI EMPAT BUKIT</div>
    <div class="h s">HIDUP SEPERTI SEMULA</div>`),
  P("s6", "s6:Ibrahim", `<div class="k">PENUTUP AYAT ${ref("QS 2:260")}</div>
    <div class="ar c">${A7}</div>
    <div class="tr c">&ldquo;Ketahuilah bahwa Allah Mahaperkasa, Mahabijaksana.&rdquo;</div>`),
  P("s6:Yang", "s7", `<div class="k">MAKNANYA</div>
    <div class="h m">Yang mengumpulkan kembali burung dari empat penjuru,</div>
    <div class="ln" data-at="s6:mudah" data-fx="rise">mudah bagi-Nya membangkitkan manusia.</div>`),
  P("s7", "s7:Para", `<div class="k">SABDA RASULULLAH ${ref("HR BUKHARI 3372")}</div>
    <div class="h m">&ldquo;Kita lebih pantas ragu daripada Ibrahim.&rdquo;</div>`),
  P("s7:Para", "s8", `<div class="k">PARA ULAMA MENJELASKAN</div>
    <div class="h m">Ibrahim tidak ragu sama sekali.</div>
    <div class="ln" data-at="s7:Yang" data-fx="rise">Yang ia cari adalah ketenangan hati.</div>
    <div class="src">Tafsir Ibnu Katsir, QS 2:260</div>`),
  P("s8", "s8:Kisah", `<div class="k">RENUNGAN</div>
    <div class="h m">Bertanya untuk menenangkan hati bukan tanda iman yang lemah.</div>
    <div class="ask" data-at="s8:Pertanyaan" data-fx="rise">Pertanyaan apa yang ingin kamu temukan jawabannya?</div>`),
].join("\n");

const css = `
#chip{background:${WASHI};padding:5px 12px 3px;border-left:4px solid ${BRICK};box-shadow:0 0 0 2px ${INDIGO};font-size:19px;letter-spacing:.07em;opacity:.95}
.p{--r:100;padding:0}
.sc{position:relative;display:inline-block;max-width:100%}
.card{position:relative;box-sizing:border-box;background:${WASHI};padding:22px 34px 24px;border:3px solid ${INDIGO};
 box-shadow:inset 0 0 0 5px ${WASHI},inset 0 0 0 7px ${INDIGO},0 16px 34px rgba(27,33,51,.35);
 background-image:linear-gradient(180deg,rgba(226,168,75,.14),rgba(239,227,200,0) 40%);
 clip-path:inset(-2px calc(100% - var(--r) * 1%) -2px 0)}
.seal{position:absolute;right:14px;top:14px;width:26px;height:26px;background:${BRICK};border-radius:3px;box-shadow:inset 0 0 0 3px rgba(239,227,200,.55)}
.rod{position:absolute;top:-12px;bottom:-12px;width:16px;left:calc(var(--r) * 1% - 8px);opacity:0;pointer-events:none;border-radius:8px;
 background:linear-gradient(90deg,#120c08,#5a3a26 40%,#2a1a10);box-shadow:0 0 0 2px ${INK},0 6px 12px rgba(0,0,0,.35)}
.rod:before,.rod:after{content:"";position:absolute;left:-3px;right:-3px;height:12px;background:${GOLD};border-radius:4px;box-shadow:0 0 0 2px ${INK}}
.rod:before{top:-6px}.rod:after{bottom:-6px}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Shippori Mincho",serif;font-weight:800;font-size:27px;letter-spacing:.12em;color:${BRICK};margin:0 34px 8px 0}
.h{font-family:"Shippori Mincho",serif;font-weight:800;font-size:80px;line-height:1.04;color:${INDIGO};letter-spacing:.02em}
.h.m{font-size:49px;line-height:1.2;letter-spacing:0}
.h.s{font-size:62px}
.c{text-align:center}
.sub{font-family:Manrope,sans-serif;font-weight:600;font-size:35px;line-height:1.24;color:#3a3326;margin-top:8px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.72;color:${INDIGO}}
.tr{font-family:Manrope,sans-serif;font-weight:600;font-style:italic;font-size:32px;line-height:1.3;color:#3a3326;margin-top:2px}
.rf{display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:21px;letter-spacing:.06em;color:${WASHI};background:${INDIGO};padding:4px 12px 3px;white-space:nowrap}
.ln{font-family:Manrope,sans-serif;font-weight:800;font-size:36px;line-height:1.22;color:${BRICK};margin-top:12px;padding-top:10px;border-top:2px solid ${INDIGO}}
.src{margin-top:12px;font-family:Manrope,sans-serif;font-weight:600;font-size:23px;letter-spacing:.03em;color:rgba(58,51,38,.8)}
.plumes{display:flex;gap:16px;margin-top:12px}
.plumes b{display:block;width:30px;height:62px;border:3px solid ${INK};border-radius:50% 50% 50% 50%/70% 70% 30% 30%;transform:rotate(18deg)}
.ask{display:inline-block;margin-top:16px;font-family:Manrope,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:${WASHI};background:${INDIGO};padding:10px 18px;border-left:6px solid ${BRICK}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:perlihatkan", "s2:berdoa", "s2:mati", "s2:Sebagian", "s2:raja", "s3:tenang", "s3:keyakinannya",
  "s4:ambillah", "s4:burung", "s4:cincanglah", "s4:Letakkan", "s4:bukit", "s4:lain",
  "s5:panggillah", "s5:memanggil", "s5:kembali", "s5:hidup", "s6:Ibrahim", "s6:Yang", "s6:penjuru", "s6:membangkitkan",
  "s7:Para", "s8:Pertanyaan", "s8:Kisah"];
const { AT, K } = writeWorld(TL, at, {
  ep: "31", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0, html, css, signature: "EP31_IBRAHIM_EMPAT_BURUNG",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Manrope,sans-serif", chipColor: INDIGO,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.26,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const r=p.querySelector('.rod');tl.set(p,{'--r':0,opacity:1},a);tl.set(r,{opacity:1},a);tl.to(p,{'--r':100,duration:.26,ease:'power2.out'},a);tl.to(r,{opacity:0,duration:.08},a+.2);}`,
  panelOut: `(tl,p,b)=>{const r=p.querySelector('.rod');tl.set(r,{opacity:1},b-.28);tl.to(p,{'--r':0,duration:.2,ease:'power2.in'},b-.28);tl.set(p,{opacity:0},b-.07);tl.set(r,{opacity:0},b-.07);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:53px;line-height:1.32;color:${WASHI};background:rgba(36,52,90,.93);padding:8px 22px 11px;border-top:4px solid ${BRICK};box-shadow:0 0 0 2px ${INK},0 12px 26px rgba(27,33,51,.35)}
.w{display:inline-block;margin:0 .07em;padding:0 .06em}`,
(id, w) => `tl.set("#${id}",{color:"${WASHI}"},0);tl.set("#${id}",{color:"${GOLD}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${WASHI}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:6},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nabi Ibrahim dan Empat Burung", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
