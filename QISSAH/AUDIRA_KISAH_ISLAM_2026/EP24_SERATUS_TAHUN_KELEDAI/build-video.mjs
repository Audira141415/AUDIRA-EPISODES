// EP24 SERATUS TAHUN, KELEDAI. TIMEFORGE: time-evolution diorama (ruined town on a hill, lone tree, brass year-dial).
// Panels are dark slate instrument plates with a brass rim and an engraved tick-ruler along the top (Cinzel titles,
// Work Sans text, Amiri Arabic). Transition: a clock-hand sweep. Each plate is revealed by a conic wipe that follows a
// glowing brass hand going once round clockwise, and is wound back counter-clockwise on exit. The outro uses the same
// sweep. Arabic is cut verbatim from the verse file by word index and pause marks. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2b2c33", BRASS = "#D2AA55", BRASS2 = "#F0D58E", IVORY = "#F4ECDA", SLATE = "rgba(15,19,27,.9)", INK = "#17120A";

const QF = readFileSync("../_research/quran/EP24_seratus_tahun.txt", "utf8");
const V = QF.match(/^QS 2:259 \| (.+)$/m)[1].trim();
const SEG = V.split(/ [ۖۚ] /);
if (SEG.length !== 8) throw new Error("2:259 segments " + SEG.length);
// "وَهِىَ خَاوِيَةٌ عَلَىٰ عُرُوشِهَا": words 5..8 of the first clause
const V2 = SEG[0].split(" ").slice(5, 9).join(" ");
// "وَٱنظُرْ إِلَى ٱلْعِظَامِ كَيْفَ نُنشِزُهَا ثُمَّ نَكْسُوهَا لَحْمًا": the whole clause between pause marks
const V6 = SEG.find((s) => s.includes("ٱلْعِظَامِ"));
// "أَعْلَمُ أَنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ": end of the verse after "qala"
const V7 = SEG[7].split(" ").slice(4).join(" ");
if (!V.includes(V2) || !V2.endsWith("عُرُوشِهَا") || V2.split(" ").length !== 4) throw new Error("V2 " + V2);
if (!V6 || !V6.endsWith("لَحْمًا")) throw new Error("V6 " + V6);
if (!V7.endsWith("قَدِيرٌ") || V7.split(" ").length !== 7) throw new Error("V7 " + V7);

const ref = (r) => `<span class="rf">${r}</span>`;
const sunArc = `<svg class="ic" viewBox="0 0 120 70"><path d="M10 62H110" stroke="${BRASS}" stroke-width="3"/><path d="M18 62A42 42 0 0 1 102 62" fill="none" stroke="${BRASS}" stroke-width="3" stroke-dasharray="6 6"/><circle cx="60" cy="20" r="11" fill="${BRASS2}"/></svg>`;
const miniDial = `<svg class="ic" viewBox="0 0 120 70"><circle cx="60" cy="36" r="30" fill="none" stroke="${BRASS}" stroke-width="3"/>${Array.from({ length: 20 }, (_, k) => { const a = k / 20 * Math.PI * 2; return `<path d="M${(60 + Math.sin(a) * 26).toFixed(1)} ${(36 - Math.cos(a) * 26).toFixed(1)}L${(60 + Math.sin(a) * 30).toFixed(1)} ${(36 - Math.cos(a) * 30).toFixed(1)}" stroke="${BRASS}" stroke-width="2"/>`; }).join("")}<path d="M60 36L60 12" stroke="${BRASS2}" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="36" r="4" fill="${BRASS2}"/></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="hand"></div><div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 24</div>
    <div class="h">SERATUS TAHUN</div>
    <div class="sub" data-at="s1:mengira" data-fx="rise">Ia mengira baru sehari.</div>
    <div class="yr" data-at="s1:seratus" data-fx="rise">Padahal <b class="ct nb" data-from="0" data-to="100" data-a="s1:seratus" data-d="1.6">0</b> tahun berlalu</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Seorang">
  <div class="hand"></div><div class="card">
    <div class="k">SURAH AL-BAQARAH ${ref("QS 2:259")}</div>
    <div class="h">AYAT 259</div>
    <div class="sub">Seorang laki-laki dan negeri yang runtuh</div>
  </div>
</div>
<div class="p" data-in="s2:Seorang" data-out="s3">
  <div class="hand"></div><div class="card">
    <div class="k">NEGERI YANG RUNTUH ${ref("QS AL-BAQARAH 2:259")}</div>
    <div class="ar">${V2}</div>
    <div class="tr">&ldquo;(bangunan-bangunannya) telah runtuh hingga menutupi (puing-puing) atap-atapnya&rdquo;</div>
    <div class="ln" data-at="s2:penghuni" data-fx="rise">Tak ada satu penghuni pun</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Lalu">
  <div class="hand"></div><div class="card">
    <div class="k">IA BERGUMAM ${ref("QS 2:259")}</div>
    <div class="sub b">Bukan karena ragu, tapi ingin melihat:</div>
    <div class="qt" data-at="s3:bagaimana" data-fx="rise">&ldquo;Bagaimana Allah menghidupkan kembali negeri ini setelah hancur?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3:Lalu" data-out="s4">
  <div class="hand"></div><div class="card row">
    <div class="col">
      <div class="k">DIMATIKAN ${ref("QS 2:259")}</div>
      <div class="big"><b class="ct nb" data-from="0" data-to="100" data-a="s3:mematikannya-0.2" data-d="3.4">0</b><span>TAHUN</span></div>
      <div class="ln" data-at="s3:membangkitkannya" data-fx="rise">lalu dibangkitkan kembali</div>
    </div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Tidak">
  <div class="hand"></div><div class="card">
    <div class="k">DITANYAKAN KEPADANYA ${ref("QS 2:259")}</div>
    <div class="qt">&ldquo;Berapa lama engkau tinggal di sini?&rdquo;</div>
    <div class="ans" data-at="s4:sehari" data-fx="rise">&ldquo;Sehari, atau setengah hari.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Tidak" data-out="s5">
  <div class="hand"></div><div class="card">
    <div class="k">TIDAK! ${ref("QS 2:259")}</div>
    <div class="split">
      <div class="half">${sunArc}<i>MENURUTNYA</i><b>SEHARI</b><span>atau setengah hari</span></div>
      <div class="half on">${miniDial}<i>SEBENARNYA</i><b data-at="s4:Tidak+0.3" data-fx="pop">100</b><span>TAHUN</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Tapi">
  <div class="hand"></div><div class="card">
    <div class="k">LIHATLAH ${ref("QS 2:259")}</div>
    <div class="h m">Makanan dan minumanmu belum berubah</div>
  </div>
</div>
<div class="p" data-in="s5:Tapi" data-out="s6">
  <div class="hand"></div><div class="card">
    <div class="k">TAPI LIHATLAH ${ref("QS 2:259")}</div>
    <div class="h m">Keledaimu sudah menjadi tulang belulang</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Agar">
  <div class="hand"></div><div class="card">
    <div class="k">DI DEPAN MATANYA ${ref("QS 2:259")}</div>
    <div class="ar">${V6}</div>
    <div class="tr">&ldquo;Lihatlah tulang belulang (keledai itu), bagaimana Kami menyusunnya kembali, kemudian Kami membalutnya dengan daging.&rdquo;</div>
    <div class="steps"><span data-at="s6:disusun" data-fx="rise">1 &middot; DISUSUN KEMBALI</span><span data-at="s6:dibalut" data-fx="rise">2 &middot; DIBALUT DAGING</span></div>
  </div>
</div>
<div class="p" data-in="s6:Agar" data-out="s7">
  <div class="hand"></div><div class="card">
    <div class="k">AGAR MENJADI TANDA ${ref("QS 2:259")}</div>
    <div class="h m">Tanda kekuasaan Allah bagi manusia</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Al-Qur'an">
  <div class="hand"></div><div class="card">
    <div class="k">IA BERKATA ${ref("QS 2:259")}</div>
    <div class="ar c">${V7}</div>
    <div class="h m c">Allah Mahakuasa atas segala sesuatu</div>
    <div class="tr c">&ldquo;Saya mengetahui (yakin) bahwa Allah Mahakuasa atas segala sesuatu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7:Al-Qur'an" data-out="s8">
  <div class="hand"></div><div class="card">
    <div class="k">SIAPA DIA?</div>
    <div class="h m">Al-Qur'an tidak menyebut namanya</div>
    <div class="note" data-at="s7:Menurut" data-fx="rise"><i>RIWAYAT</i>Menurut riwayat Ibnu Abbas (Ibnu Katsir): <b>Uzair</b></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="hand"></div><div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h m">Pertanyaan yang jujur bisa dijawab dengan cara yang tak terduga.</div>
    <div class="ask" data-at="s8:Pertanyaan#2" data-fx="rise">Pertanyaan apa yang sedang kamu bawa?</div>
  </div>
</div>`;

const SWEEP = (v) => `conic-gradient(from 0deg at 50% 50%,#000 calc(${v} * 1deg),transparent calc(${v} * 1deg))`;
const css = `
#capfloor{background:linear-gradient(180deg,rgba(15,19,27,0),rgba(15,19,27,.4) 45%,rgba(15,19,27,.4) 70%,rgba(15,19,27,0))}
#chip{background:rgba(15,19,27,.72);padding:5px 12px 4px;border:1px solid rgba(210,170,85,.65);font-size:19px;letter-spacing:.07em}
.p{--a:360;overflow:hidden;padding:4px}
.hand{position:absolute;left:50%;top:50%;width:5px;height:620px;margin:-620px 0 0 -2.5px;transform-origin:50% 100%;z-index:3;
 background:linear-gradient(0deg,${BRASS2},rgba(240,213,142,.15));box-shadow:0 0 14px rgba(240,213,142,.8);opacity:0;pointer-events:none}
.card{position:relative;background:${SLATE};padding:34px 34px 28px;border:1.5px solid ${BRASS};box-shadow:inset 0 0 0 6px rgba(15,19,27,0),inset 0 0 0 7.5px rgba(210,170,85,.35),0 22px 46px rgba(0,0,0,.45);
 -webkit-mask-image:${SWEEP("var(--a)")};mask-image:${SWEEP("var(--a)")}}
.card:before{content:"";position:absolute;left:12px;right:12px;top:8px;height:14px;
 background:repeating-linear-gradient(90deg,${BRASS} 0 2px,transparent 2px 12px),repeating-linear-gradient(90deg,${BRASS} 0 3px,transparent 3px 60px);background-size:100% 8px,100% 14px;background-repeat:no-repeat;opacity:.75}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Work Sans",sans-serif;font-weight:600;font-size:24px;letter-spacing:.18em;color:${BRASS};margin-bottom:10px}
.h{font-family:Cinzel,serif;font-weight:700;font-size:76px;line-height:1.04;color:${IVORY};letter-spacing:.03em}
.h.m{font-size:50px;line-height:1.14;letter-spacing:.01em}
.c{text-align:center}
.sub{font-family:"Work Sans",sans-serif;font-weight:500;font-size:36px;line-height:1.22;color:#E6D9BC;margin-top:12px}
.sub.b{margin-top:0;font-style:italic}
.yr{font-family:"Work Sans",sans-serif;font-weight:600;font-size:38px;color:${IVORY};margin-top:10px}
.yr b{font-family:Cinzel,serif;font-weight:700;font-size:56px;color:${BRASS2};display:inline-block;min-width:1.9em;text-align:center}
.qt{font-family:Cinzel,serif;font-weight:600;font-size:46px;line-height:1.18;color:${IVORY};margin-top:8px}
.ans{display:inline-block;margin-top:16px;font-family:"Work Sans",sans-serif;font-weight:700;font-size:40px;color:${INK};background:${BRASS};padding:8px 18px}
.tr{font-family:"Work Sans",sans-serif;font-weight:500;font-style:italic;font-size:31px;line-height:1.3;color:#E6D9BC;margin-top:4px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:60px;line-height:1.7;color:${BRASS2}}
.ar.c{text-align:center}
.rf{display:inline-block;font-family:"Work Sans",sans-serif;font-weight:700;font-size:22px;letter-spacing:.06em;color:${INK};background:${BRASS};padding:4px 12px 3px;white-space:nowrap}
.ln{font-family:"Work Sans",sans-serif;font-weight:700;font-size:38px;color:${IVORY};margin-top:14px;padding-top:12px;border-top:1px solid rgba(210,170,85,.45)}
.big{display:flex;align-items:baseline;gap:16px}
.big b{font-family:Cinzel,serif;font-weight:700;font-size:150px;line-height:1;color:${BRASS2};min-width:1.95em}
.big span{font-family:Cinzel,serif;font-weight:700;font-size:58px;letter-spacing:.12em;color:${IVORY}}
.split{display:flex;gap:16px;margin-top:8px}
.half{flex:1;display:flex;flex-direction:column;align-items:center;border:1px solid rgba(210,170,85,.5);padding:12px 8px 14px;background:rgba(210,170,85,.06)}
.half.on{background:rgba(210,170,85,.16);border-color:${BRASS}}
.half .ic{width:150px;height:88px}
.half i{font-style:normal;font-family:"Work Sans",sans-serif;font-weight:600;font-size:23px;letter-spacing:.16em;color:${BRASS}}
.half b{font-family:Cinzel,serif;font-weight:700;font-size:72px;line-height:1.1;color:${IVORY}}
.half.on b{color:${BRASS2};font-size:96px;line-height:1}
.half span{font-family:"Work Sans",sans-serif;font-weight:600;font-size:30px;color:#E6D9BC}
.steps{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px}
.steps span{font-family:"Work Sans",sans-serif;font-weight:700;font-size:30px;letter-spacing:.06em;color:${INK};background:${BRASS};padding:7px 14px 6px}
.note{margin-top:14px;padding-top:12px;border-top:1px solid rgba(210,170,85,.45);font-family:"Work Sans",sans-serif;font-weight:500;font-size:34px;line-height:1.25;color:#E6D9BC}
.note i{display:inline-block;font-style:normal;font-weight:700;font-size:21px;letter-spacing:.14em;color:${INK};background:${BRASS};padding:3px 10px 2px;margin-right:12px;vertical-align:5px}
.note b{color:${BRASS2};font-weight:700}
.ask{display:inline-block;margin-top:16px;font-family:"Work Sans",sans-serif;font-weight:700;font-size:38px;line-height:1.18;color:${INK};background:${BRASS};padding:10px 18px}
#outro{--a:0;-webkit-mask-image:${SWEEP("var(--a)")};mask-image:${SWEEP("var(--a)")}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:seratus", "s1:makanannya", "s1:keledainya", "s1:tulang", "s2:runtuh", "s2:atap-atapnya", "s3:bagaimana",
  "s3:mematikannya-0.2", "s3:membangkitkannya", "s4:sehari", "s4:Tidak", "s4:seratus", "s5:Tapi", "s5:keledaimu",
  "s6:tulang-tulang", "s6:disusun", "s6:dibalut", "s6:Agar", "s7:Mahakuasa", "s7:Uzair", "s8:Pertanyaan#2", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "24", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.4, html, css, signature: "EP24_SERATUS_TAHUN_KELEDAI",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Work Sans,sans-serif", chipColor: IVORY,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:16},{opacity:1,y:0,duration:.4,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const h=p.querySelector('.hand');tl.set(p,{'--a':0,opacity:1},a-.16);tl.to(p,{'--a':360,duration:.6,ease:'power1.inOut'},a-.16);tl.set(h,{opacity:1},a-.16);tl.fromTo(h,{rotation:0},{rotation:360,duration:.6,ease:'power1.inOut'},a-.16);tl.set(h,{opacity:0},a+.46);}`,
  panelOut: `(tl,p,b)=>{const h=p.querySelector('.hand');tl.set(h,{opacity:1},b-.42);tl.fromTo(h,{rotation:360},{rotation:0,duration:.4,ease:'power1.in'},b-.42);tl.to(p,{'--a':0,duration:.4,ease:'power1.in'},b-.42);tl.set(h,{opacity:0},b-.01);}`,
  outroIn: `gsap.set('#outro',{visibility:'hidden'});tl.set('#outro',{'--a':0},0);tl.set('#outro',{visibility:'visible'},OUT-.2);tl.to('#outro',{'--a':360,duration:.9,ease:'power1.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"Work Sans",sans-serif;font-weight:700;font-size:54px;line-height:1.34;color:${IVORY};background:rgba(15,19,27,.9);padding:8px 22px 12px;border-left:5px solid ${BRASS};box-shadow:0 10px 26px rgba(0,0,0,.35)}
.w{display:inline-block;margin:0 .06em;padding:0 .08em}`,
(id, w) => `tl.set("#${id}",{color:"${IVORY}",boxShadow:"inset 0 -6px 0 rgba(240,213,142,0)"},0);tl.set("#${id}",{color:"#FFD45E",boxShadow:"inset 0 -6px 0 ${BRASS}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${IVORY}",boxShadow:"inset 0 -6px 0 rgba(240,213,142,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{scale:.97},{scale:1,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Seratus Tahun", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "| V2", V2, "| V7", V7);
