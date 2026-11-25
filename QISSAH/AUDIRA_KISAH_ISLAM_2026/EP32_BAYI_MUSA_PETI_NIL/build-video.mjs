// EP32 BAYI MUSA DI PETI. MARBLEMUSEUM: carved limestone Nile diorama on a marble plinth in museum light (world3d.js).
// Panels are papyrus museum labels: warm fibrous papyrus cards with a lapis edge and a gold rule, Cormorant Garamond
// titles, Manrope text, Amiri Arabic in lapis, verse references as gold tags.
// Transition: papyrus unroll. A card unrolls left to right behind a rolled papyrus rod (clip-path follows the rod), and
// rolls back up right to left on exit. Each wipe takes 0.24 s; the outgoing card is gone before the next one starts.
// Arabic is read verbatim from the verse file and cut only at Uthmani pause marks or clearly bounded phrases.
// Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#15110d", PAP = "#EFE2C2", INK = "#2A2116", LAPIS = "#2B4C7E", GOLD = "#C9A04A", NILE = "#3E8C8C";

const QF = readFileSync("../_research/quran/EP32_bayi_musa_peti.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
// verse words i..j inclusive, verbatim from the file (word indices checked against the file layout)
const cut = (r, i, j, n) => { const w = verse(r).split(" "); if (w.length !== n) throw new Error("verse layout changed " + r + " " + w.length); return w.slice(i, j + 1).join(" "); };
const A7a = cut("28:7", 0, 5, 24), A7b = cut("28:7", 7, 16, 24), A7c = cut("28:7", 18, 20, 24); // susuilah dia | jika engkau khawatir ... jangan bersedih | inna radduhu ilaiki
const A39 = cut("20:39", 0, 6, 23); // letakkanlah dia di dalam peti, kemudian hanyutkanlah ke sungai
const A8 = cut("28:8", 0, 2, 14); // maka dia dipungut oleh keluarga Firaun
const A9 = cut("28:9", 3, 6, 19); // qurratu 'ainin li wa lak
const A10 = cut("28:10", 0, 4, 18), A11 = cut("28:11", 0, 2, 11);
const A12a = cut("28:12", 1, 5, 17), A12b = cut("28:12", 7, 13, 17);
const A13 = cut("28:13", 0, 5, 17);
if (!A39.endsWith(verse("28:7").split(" ")[12])) throw new Error("A39 should end at al-yamm: " + A39);
for (const [n, s] of Object.entries({ A7a, A7b, A7c, A39, A8, A9, A10, A11, A12a, A12b, A13 })) if (!s || !QF.includes(s)) throw new Error("arabic cut " + n);

const ref = (r) => `<span class="rf">${r}</span>`;
const P = (inA, outA, body, first = false) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}"><div class="card">${body}</div><div class="rod"></div></div>`;
const html = [
  P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 32</div>
    <div class="h">DILEPAS AGAR SELAMAT</div>
    <div class="ln" data-at="s1:Justru" data-fx="rise">Justru itulah cara bayinya diselamatkan.</div>`, true),
  P("s2", "s2:Tapi", `<div class="k">${ref("TAFSIR IBNU KATSIR")} QS 28:7</div>
    <div class="h m">Firaun memerintahkan bayi laki-laki Bani Israil dibunuh.</div>
    <div class="ln" data-at="s2:Para" data-fx="rise">Para bidan mendata setiap perempuan yang hamil.</div>`),
  P("s2:Tapi", "s3", `<div class="k">TAPI</div>
    <div class="h m">Kehamilan ibu Musa tidak tampak.</div>
    <div class="ln" data-at="s2:lahir" data-fx="rise">Musa lahir tepat di tahun itu.</div>`),
  P("s3", "s3:Jika", `<div class="k">SURAH AL-QASHASH ${ref("QS 28:7")}</div>
    <div class="ar">${A7a}</div>
    <div class="tr">Kami ilhamkan kepada ibu Musa, &ldquo;Susuilah dia.&rdquo;</div>`),
  P("s3:Jika", "s3:Kami#2", `<div class="k">SURAH AL-QASHASH ${ref("QS 28:7")}</div>
    <div class="ar">${A7b}</div>
    <div class="tr">&ldquo;Jika engkau khawatir, hanyutkanlah ia ke sungai. Jangan takut, jangan bersedih.&rdquo;</div>`),
  P("s3:Kami#2", "s4", `<div class="k">JANJI-NYA ${ref("QS 28:7")}</div>
    <div class="ar c">${A7c}</div>
    <div class="tr c">&ldquo;Kami akan mengembalikannya kepadamu.&rdquo;</div>`),
  P("s4", "s4:Arus", `<div class="k">SURAH THAHA ${ref("QS 20:39")}</div>
    <div class="ar">${A39}</div>
    <div class="tr">&ldquo;Letakkanlah dia di dalam peti, kemudian hanyutkanlah dia ke sungai.&rdquo;</div>`),
  P("s4:Arus", "s5", `<div class="k">ARUS MEMBAWANYA KE TEPI ${ref("QS 28:8")}</div>
    <div class="ar">${A8}</div>
    <div class="tr">&ldquo;Maka dia dipungut oleh keluarga Firaun.&rdquo;</div>
    <div class="ln" data-at="s4:rumah" data-fx="rise">Rumah musuhnya sendiri.</div>`),
  P("s5", "s5:Sementara", `<div class="k">ISTRI FIRAUN BERKATA ${ref("QS 28:9")}</div>
    <div class="ar c">${A9}</div>
    <div class="tr c">&ldquo;Penyejuk mata bagiku dan bagimu.&rdquo;</div>
    <div class="ln c" data-at="s5:jangan" data-fx="rise">&ldquo;Jangan kalian bunuh dia.&rdquo;</div>`),
  P("s5:Sementara", "s6", `<div class="k">SEMENTARA ITU ${ref("QS 28:10")}</div>
    <div class="ar">${A10}</div>
    <div class="tr">&ldquo;Dan hati ibu Musa menjadi kosong.&rdquo;</div>
    <div class="ln" data-at="s5:seandainya" data-fx="rise">Hampir membuka rahasianya, seandainya Allah tidak meneguhkan hatinya.</div>`),
  P("s6", "s6:Bayi", `<div class="k">KEPADA PUTRINYA ${ref("QS 28:11")}</div>
    <div class="ar c">${A11}</div>
    <div class="tr c">&ldquo;Ikutilah dia.&rdquo;</div>
    <div class="ln c" data-at="s6:Kakak" data-fx="rise">Kakak Musa memperhatikan dari jauh.</div>`),
  P("s6:Bayi", "s7", `<div class="k">DI ISTANA ${ref("QS 28:12")}</div>
    <div class="ar">${A12a}</div>
    <div class="tr">Bayi itu menolak menyusu kepada setiap perempuan yang didatangkan.</div>`),
  P("s7", "s7:Maka", `<div class="k">KAKAKNYA BERKATA ${ref("QS 28:12")}</div>
    <div class="ar">${A12b}</div>
    <div class="tr">&ldquo;Maukah aku tunjukkan keluarga yang akan memeliharanya?&rdquo;</div>`),
  P("s7:Maka", "s8", `<div class="k">JANJI DITEPATI ${ref("QS 28:13")}</div>
    <div class="ar">${A13}</div>
    <div class="tr">&ldquo;Maka Kami kembalikan dia kepada ibunya, agar senang hatinya.&rdquo;</div>
    <div class="ln" data-at="s7:janji" data-fx="rise">Dan agar ia tahu janji Allah itu benar.</div>`),
  P("s8", "@END", `<div class="k">RENUNGAN</div>
    <div class="h m">Kadang bagian tersulit dari percaya adalah melepaskan.</div>
    <div class="ask" data-at="s8:Pernahkah" data-fx="rise">Pernahkah kamu harus melepas sesuatu agar ia selamat?</div>`),
].join("\n");

const css = `
#capfloor{background:linear-gradient(180deg,rgba(21,17,13,0),rgba(21,17,13,.42) 45%,rgba(21,17,13,.42) 70%,rgba(21,17,13,0))}
#chip{background:rgba(239,226,194,.92);color:${INK};padding:5px 12px 3px;border-left:4px solid ${LAPIS};font-size:19px;letter-spacing:.07em;opacity:1}
.p{--r:100;padding:0}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;padding:22px 32px 24px 36px;color:${INK};
 background:repeating-linear-gradient(90deg,rgba(120,90,40,.07) 0 3px,rgba(255,255,255,0) 3px 9px),repeating-linear-gradient(0deg,rgba(120,90,40,.08) 0 2px,rgba(255,255,255,0) 2px 11px),${PAP};
 border-left:8px solid ${LAPIS};border-top:3px solid ${GOLD};box-shadow:0 18px 40px rgba(0,0,0,.45);
 clip-path:inset(0 calc(100% - var(--r) * 1%) 0 0)}
.rod{position:absolute;top:-6px;bottom:auto;height:calc(100% + 12px);width:22px;left:calc(var(--r) * 1% - 11px);opacity:0;pointer-events:none;border-radius:11px;
 background:linear-gradient(90deg,#8a6a38,#f3e2b8 40%,#c9a04a 60%,#6e5228);box-shadow:0 0 12px rgba(0,0,0,.4)}
.k{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-family:Manrope,sans-serif;font-weight:800;font-size:23px;letter-spacing:.16em;color:${LAPIS};margin-bottom:8px}
.h{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:84px;line-height:1.0;color:${INK};letter-spacing:.01em}
.h.m{font-size:54px;line-height:1.08}
.c{text-align:center}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:56px;line-height:1.7;color:${LAPIS}}
.ar.c{text-align:center}
.tr{font-family:Manrope,sans-serif;font-weight:600;font-style:italic;font-size:31px;line-height:1.28;color:#4a3c28;margin-top:2px}
.rf{display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:20px;letter-spacing:.06em;color:${INK};background:${GOLD};padding:4px 11px 3px;white-space:nowrap}
.ln{font-family:Manrope,sans-serif;font-weight:800;font-size:35px;line-height:1.2;color:${NILE};margin-top:12px;padding-top:10px;border-top:2px solid rgba(201,160,74,.7)}
.ask{display:inline-block;margin-top:14px;font-family:Manrope,sans-serif;font-weight:800;font-size:36px;line-height:1.18;color:${PAP};background:${LAPIS};padding:10px 18px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:melepasnya", "s1:diselamatkan", "s2:Firaun", "s2:dibunuh", "s2:Para", "s2:mendata", "s2:hamil", "s2:Tapi", "s2:lahir",
  "s3:hanyutkanlah", "s3:mengembalikannya", "s4:meletakkan", "s4:melepasnya", "s4:tepi", "s4:dipungut", "s4:rumah",
  "s5:penyejuk", "s5:jangan", "s5:Sementara", "s5:kosong", "s5:hampir", "s5:meneguhkan", "s6:ikutilah", "s6:Kakak", "s6:menolak",
  "s7:Kakaknya", "s7:Maka", "s7:senang", "s7:janji", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "32", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.42, html, css, signature: "EP32_BAYI_MUSA_PETI_NIL",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Manrope,sans-serif", chipColor: INK,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.26,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const r=p.querySelector('.rod');tl.set(p,{'--r':0,opacity:1},a);tl.set(r,{opacity:1},a);tl.to(p,{'--r':100,duration:.24,ease:'power2.out'},a);tl.to(r,{opacity:0,duration:.06},a+.2);}`,
  panelOut: `(tl,p,b)=>{const r=p.querySelector('.rod');tl.set(r,{opacity:1},b-.3);tl.to(p,{'--r':0,duration:.22,ease:'power2.in'},b-.3);tl.set(r,{opacity:0},b-.07);tl.set(p,{opacity:0},b-.06);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:53px;line-height:1.32;color:${PAP};background:rgba(20,28,44,.9);padding:8px 22px 11px;border-bottom:4px solid ${GOLD};box-shadow:0 12px 28px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .07em;padding:0 .06em}`,
(id, w) => `tl.set("#${id}",{color:"${PAP}"},0);tl.set("#${id}",{color:"#F2C86A"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${PAP}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:6},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bayi Musa di Peti", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
