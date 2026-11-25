// EP26 IBRAHIM MENDEBAT RAJA. TEXTVOYAGE: monumental 3D typography in volumetric light (see world3d.js).
// Panels are slabs of dark basalt with a thin brass top edge, Cinzel titles, Manrope text, Amiri Arabic.
// Transition: a light-beam carve-in. A bright horizontal beam sweeps down the slab and the content is "carved" in
// behind it (clip-path follows the beam); on exit the beam sweeps back up and erases it. Both wipes take 0.24 s.
// Arabic is cut verbatim from the verse file by word ranges. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#07060a", BRASS = "#D6A85A", LIGHT = "#FFE2A8", IVORY = "#F5ECDC", SLAB = "rgba(14,11,10,.9)", INK = "#120c05";

const QF = readFileSync("../_research/quran/EP26_ibrahim_namrud.txt", "utf8");
const V = QF.match(/^QS 2:258 \| (.+)$/m)[1].trim();
const VW = V.split(" ");
// verse words i..j inclusive, verbatim from the file (45 words incl. the two pause marks at 23 and 39)
if (VW.length !== 45 || VW[23].length > 2 || VW[39].length > 2) throw new Error("verse layout changed " + VW.length);
function cut(i, j) {
  const s = VW.slice(i, j + 1).join(" ");
  if (!V.includes(s)) throw new Error("not verbatim " + s);
  return s;
}
const A1 = cut(15, 18); // rabbiya alladzi yuhyi wa yumit
const A2 = cut(20, 22); // ana uhyi wa umit
const A3 = cut(26, 35); // fa inna Allaha ya'ti bisy-syamsi minal masyriqi fa'ti biha minal maghrib
const A4 = cut(36, 38); // fabuhita alladzi kafar
const A5 = cut(40, 44); // wallahu la yahdil qaumazh zhalimin

const ref = (r) => `<span class="rf">${r}</span>`;
const P = (inA, outA, body, first = false) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}"><div class="card">${body}</div><div class="beam"></div></div>`;

const html = [
  P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 26</div>
    <div class="h">SATU KALIMAT</div>
    <div class="sub">untuk raja yang mengaku bisa menghidupkan dan mematikan</div>
    <div class="ln" data-at="s1:terdiam" data-fx="rise">Ia terdiam, tanpa jawaban.</div>`, true),
  P("s2", "s2:Para", `<div class="k">SURAH AL-BAQARAH ${ref("QS 2:258")}</div>
    <div class="h">AYAT 258</div>
    <div class="sub">Orang yang mendebat Ibrahim tentang Tuhannya</div>
    <div class="ln" data-at="s2:karena" data-fx="rise">karena Allah telah memberinya kerajaan</div>`),
  P("s2:Para", "s3", `<div class="k">SIAPA RAJA ITU?</div>
    <div class="h">NAMRUD</div>
    <div class="sub">(menurut mufasir) &middot; Tafsir Ibnu Katsir, QS 2:258</div>`),
  P("s3", "s3:Raja", `<div class="k">IBRAHIM BERKATA ${ref("QS 2:258")}</div>
    <div class="ar">${A1}</div>
    <div class="tr">&ldquo;Tuhanku ialah Yang menghidupkan dan mematikan.&rdquo;</div>`),
  P("s3:Raja", "s4", `<div class="k">SANG RAJA MENJAWAB ${ref("QS 2:258")}</div>
    <div class="ar">${A2}</div>
    <div class="tr">&ldquo;Aku pun dapat menghidupkan dan mematikan.&rdquo;</div>`),
  P("s4", "s4:Itulah", `<div class="k">MENURUT SEBAGIAN MUFASIR</div>
    <div class="sub b">Ia memanggil dua orang yang dihukum mati</div>
    <div class="steps"><span data-at="s4:dieksekusi" data-fx="rise">SATU DIEKSEKUSI</span><span data-at="s4:dibebaskan" data-fx="rise">SATU DIBEBASKAN</span></div>
    <div class="src">Riwayat dalam Tafsir Ibnu Katsir</div>`),
  P("s4:Itulah", "s5", `<div class="k">ITU YANG IA SEBUT &ldquo;MENGHIDUPKAN&rdquo;</div>
    <div class="h m">Ia memainkan kata,</div>
    <div class="ln" data-at="s4:bukan" data-fx="rise">bukan menjawab pertanyaan.</div>`),
  P("s5", "s5:Allah", `<div class="k">IBRAHIM PINDAH KE BUKTI</div>
    <div class="h m">Bukti yang tidak bisa dipalsukan</div>`),
  P("s5:Allah", "s6", `<div class="k">IBRAHIM BERKATA ${ref("QS 2:258")}</div>
    <div class="ar">${A3}</div>
    <div class="tr">&ldquo;Allah menerbitkan matahari dari timur, maka terbitkanlah ia dari barat.&rdquo;</div>`),
  P("s6", "s6:Kekuasaannya", `<div class="k">LALU ${ref("QS 2:258")}</div>
    <div class="ar c">${A4}</div>
    <div class="tr c">&ldquo;Maka bingunglah orang yang kafir itu.&rdquo;</div>`),
  P("s6:Kekuasaannya", "s7", `<div class="k">KUASA YANG TERBATAS</div>
    <div class="h m">Kuasanya atas manusia tidak berlaku untuk matahari.</div>
    <div class="ln" data-at="s6:menggesernya" data-fx="rise">Ia tak bisa menggesernya sedikit pun.</div>`),
  P("s7", "s7:Bukan", `<div class="k">PENUTUP AYAT ${ref("QS 2:258")}</div>
    <div class="ar c">${A5}</div>
    <div class="tr c">&ldquo;Allah tidak memberi petunjuk kepada orang-orang yang zalim.&rdquo;</div>`),
  P("s7:Bukan", "s8", `<div class="k">MENGAPA?</div>
    <div class="h m">Bukan karena kalah pintar,</div>
    <div class="ln" data-at="s7:menolak" data-fx="rise">tapi karena menolak kebenaran yang sudah jelas.</div>`),
  P("s8", "@END", `<div class="k">PELAJARAN</div>
    <div class="h m">Argumen terbaik bukan yang paling panjang, tapi yang paling jelas.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="rise">Kapan sebaiknya kita berhenti berdebat?</div>`),
].join("\n");

const css = `
#capfloor{background:linear-gradient(180deg,rgba(7,6,10,0),rgba(7,6,10,.45) 45%,rgba(7,6,10,.45) 70%,rgba(7,6,10,0))}
#chip{background:rgba(10,8,8,.7);padding:5px 12px 4px;border-left:3px solid ${BRASS};font-size:19px;letter-spacing:.07em}
.p{--r:100;padding:0}
.card{position:relative;background:${SLAB};padding:30px 34px 28px;border-top:2px solid ${BRASS};box-shadow:0 24px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,226,168,.25);
 clip-path:inset(0 0 calc(100% - var(--r) * 1%) 0)}
.beam{position:absolute;left:-14px;right:-14px;height:3px;top:calc(var(--r) * 1% - 1px);opacity:0;pointer-events:none;
 background:linear-gradient(90deg,rgba(255,226,168,0),#fff6e0 18%,#fff 50%,#fff6e0 82%,rgba(255,226,168,0));box-shadow:0 0 16px 5px rgba(255,190,110,.75),0 0 46px 12px rgba(255,160,80,.35)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Manrope,sans-serif;font-weight:700;font-size:24px;letter-spacing:.2em;color:${BRASS};margin-bottom:10px}
.h{font-family:Cinzel,serif;font-weight:800;font-size:82px;line-height:1.02;color:${IVORY};letter-spacing:.04em}
.h.m{font-size:50px;line-height:1.15;letter-spacing:.01em}
.c{text-align:center}
.sub{font-family:Manrope,sans-serif;font-weight:600;font-size:35px;line-height:1.24;color:#E6D7BC;margin-top:10px}
.sub.b{margin-top:0}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.75;color:${LIGHT};text-shadow:0 0 18px rgba(255,190,110,.35)}
.ar.c{text-align:center}
.tr{font-family:Manrope,sans-serif;font-weight:600;font-style:italic;font-size:31px;line-height:1.3;color:#E6D7BC;margin-top:2px}
.rf{display:inline-block;font-family:Manrope,sans-serif;font-weight:800;font-size:21px;letter-spacing:.06em;color:${INK};background:${BRASS};padding:4px 12px 3px;white-space:nowrap}
.ln{font-family:Manrope,sans-serif;font-weight:800;font-size:37px;line-height:1.2;color:${LIGHT};margin-top:14px;padding-top:12px;border-top:1px solid rgba(214,168,90,.45)}
.steps{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px}
.steps span{font-family:Manrope,sans-serif;font-weight:800;font-size:30px;letter-spacing:.06em;color:${INK};background:${BRASS};padding:8px 16px 7px}
.steps span+span{background:${LIGHT}}
.src{margin-top:14px;font-family:Manrope,sans-serif;font-weight:600;font-size:23px;letter-spacing:.04em;color:rgba(230,215,188,.8)}
.ask{display:inline-block;margin-top:16px;font-family:Manrope,sans-serif;font-weight:800;font-size:37px;line-height:1.18;color:${INK};background:${LIGHT};padding:10px 18px}
`;

for (const f of ["lib3d.js"]) copyFileSync(`../_tools/${f}`, `PROJECT/HyperFrames_Remotion/assets/lib/${f}`);
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
for (const f of ["cinzel-600.js", "cinzel-900.js"]) copyFileSync(`fonts/${f}`, `PROJECT/HyperFrames_Remotion/assets/lib/${f}`);
const WORLD_AT = ["s1:Satu", "s1:terdiam", "s2:kerajaan", "s3:Tuhanku", "s3:Yang", "s3:Raja", "s3:sombong", "s3:aku", "s3:pun", "s3:bisa",
  "s4:memanggil", "s4:dieksekusi", "s4:dibebaskan", "s4:memainkan", "s4:pertanyaan", "s5:matahari", "s5:timur", "s5:terbitkanlah", "s5:barat",
  "s6:bingunglah", "s6:Kekuasaannya", "s6:menggesernya", "s7:zalim", "s8:paling#2", "s8:jelas", "s8:Kisah"];
const { AT, K } = writeWorld(TL, at, {
  ep: "26", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.45, html, css, signature: "EP26_IBRAHIM_DEBAT_RAJA",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Manrope,sans-serif", chipColor: IVORY,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.3,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const b=p.querySelector('.beam');tl.set(p,{'--r':0,opacity:1},a-.06);tl.set(b,{opacity:1},a-.06);tl.to(p,{'--r':100,duration:.24,ease:'power2.inOut'},a-.06);tl.set(b,{opacity:0},a+.18);}`,
  panelOut: `(tl,p,b)=>{const m=p.querySelector('.beam');tl.set(m,{opacity:1},b-.3);tl.to(p,{'--r':0,duration:.24,ease:'power2.in'},b-.3);tl.set(m,{opacity:0},b-.06);tl.set(p,{opacity:0},b-.05);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:53px;line-height:1.34;color:${IVORY};background:rgba(9,7,8,.88);padding:9px 24px 12px;border-top:3px solid ${BRASS};box-shadow:0 12px 28px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .07em;padding:0 .06em}`,
(id, w) => `tl.set("#${id}",{color:"${IVORY}",textShadow:"0 0 0 rgba(0,0,0,0)"},0);tl.set("#${id}",{color:"#FFC85C",textShadow:"0 0 16px rgba(255,170,70,.6)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${IVORY}",textShadow:"0 0 0 rgba(0,0,0,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:5},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ibrahim Mendebat Raja", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
