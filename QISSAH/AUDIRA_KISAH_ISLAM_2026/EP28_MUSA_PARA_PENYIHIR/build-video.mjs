// EP28 MUSA DAN PARA PENYIHIR. WAYANGFORGE: a wayang kulit screen lit by a blencong lamp (world3d.js). Panels are dark
// sogan-leather cards with a perforated gold dot strip (tatahan) along the top, Cinzel kickers, Nunito Sans text and
// Amiri Arabic in lamp gold. Transition: a gunungan sweep. A small gold gunungan rides the leading edge of the card's
// clip, revealing it left to right (0.28 s) and sweeping it away right to left (0.2 s). The outro is the shell default.
// Arabic is read verbatim from the verse file: whole short verses, or one clause cut at a word / pause-mark boundary.
// Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#090403", GOLD = "#E3B04B", PANEL = "rgba(30,13,7,.92)", TXT = "#FBF1DE", SOFT = "#E9D6B4", INK = "#1E0D06";

const QF = readFileSync("../_research/quran/EP28_musa_penyihir.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V58 = verse("20:58"), V65 = verse("20:65"), V67 = verse("20:67"), V68 = verse("20:68"), V70 = verse("20:70"), V72 = verse("20:72");
const A58 = V58.split(" ").slice(0, 3).join(" ");            // fa-lana'tiyannaka bi-sihrin mitslihi
const m72 = V72.indexOf(" ۖ ");
const A72 = V72.slice(m72 + 3);                               // faqdi ma anta qadin ... al-hayata ad-dunya (to the end of the verse)
for (const [n, s] of [["58", A58], ["72", A72]]) if (!QF.includes(s)) throw new Error("arabic cut " + n);
console.log("A58", A58, "| A72", A72);

const ref = (r) => `<span class="rf">${r}</span>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 28</div>
    <div class="h">MUSA &amp; PARA PENYIHIR</div>
    <div class="sub" data-at="s1:akhir" data-fx="rise">Di akhir hari itu, mereka semua bersujud.</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Waktunya">
  <div class="card">
    <div class="k">TANTANGAN FIRAUN ${ref("QS 20:57-58")}</div>
    <div class="h m">Sihir untuk mengusir kami dari negeri?</div>
    <div class="ar sm" data-at="s2:menantang" data-fx="rise">${A58}</div>
    <div class="tr" data-at="s2:menantang" data-fx="rise">&ldquo;Kami akan datangkan sihir yang sama.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s2:Waktunya" data-out="s3">
  <div class="card">
    <div class="k">PERJANJIAN ${ref("QS 20:59")}</div>
    <div class="h m">Waktunya disepakati:</div>
    <div class="ls">
      <span data-at="s2:hari" data-fx="rise">Hari raya</span>
      <span data-at="s2:pagi" data-fx="rise">Pagi hari</span>
      <span data-at="s2:orang" data-fx="rise">Di depan orang banyak</span>
    </div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Mereka">
  <div class="card">
    <div class="k">DATANG BERBARIS ${ref("QS 20:64")}</div>
    <div class="h m">Yakin akan menang</div>
    <div class="sub" data-at="s3:hadiah" data-fx="rise">bahkan membicarakan hadiah dari Firaun ${ref("QS 7:113")}</div>
  </div>
</div>
<div class="p" data-in="s3:Mereka" data-out="s4">
  <div class="card">
    <div class="k">MEREKA BERTANYA ${ref("QS 20:65")}</div>
    <div class="ar xs">${V65}</div>
    <div class="tr">&ldquo;Wahai Musa, kamu yang melempar dulu, atau kami?&rdquo;</div>
    <div class="re" data-at="s3:silakan" data-fx="rise"><b>MUSA</b><span>&ldquo;Silakan kalian dulu.&rdquo;</span>${ref("QS 20:66")}</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Surah">
  <div class="card">
    <div class="k">SIHIR MEREKA ${ref("QS 20:66")}</div>
    <div class="h m">Tali dan tongkat tampak merayap cepat</div>
  </div>
</div>
<div class="p" data-in="s4:Surah" data-out="s5">
  <div class="card">
    <div class="k">SURAH THAHA ${ref("QS 20:67")}</div>
    <div class="ar">${V67}</div>
    <div class="tr">&ldquo;Maka Musa merasa takut dalam hatinya.&rdquo;</div>
    <div class="ln" data-at="s4:Seorang" data-fx="rise">Seorang nabi pun bisa merasa takut.</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Tongkat">
  <div class="card">
    <div class="k">WAHYU TURUN ${ref("QS 20:68-69")}</div>
    <div class="ar">${V68}</div>
    <div class="tr">&ldquo;Jangan takut, sungguh kamulah yang unggul.&rdquo;</div>
    <div class="ln" data-at="s5:Lemparkan" data-fx="rise">Lemparkan apa yang ada di tangan kananmu.</div>
  </div>
</div>
<div class="p" data-in="s5:Tongkat" data-out="s6">
  <div class="card">
    <div class="k">TONGKAT ITU MENELAN ${ref("QS 7:117")}</div>
    <div class="h m">semua yang mereka buat</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Kini">
  <div class="card">
    <div class="k">MEREKA PAHAM</div>
    <div class="h m">Ini bukan sihir.</div>
    <div class="sub" data-at="s6:Hanya" data-fx="rise">Hanya beberapa saat sebelumnya, mereka adalah lawan.</div>
  </div>
</div>
<div class="p" data-in="s6:Kini" data-out="s7">
  <div class="card">
    <div class="k">MEREKA BERSUJUD ${ref("QS 20:70")}</div>
    <div class="ar">${V70}</div>
    <div class="tr">&ldquo;Kami beriman kepada Tuhannya Harun dan Musa.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Jawab">
  <div class="card">
    <div class="k">FIRAUN MURKA ${ref("QS 20:71")}</div>
    <div class="h m">Mengancam menghukum mereka dengan kejam</div>
  </div>
</div>
<div class="p" data-in="s7:Jawab" data-out="s8">
  <div class="card">
    <div class="k">JAWAB MEREKA ${ref("QS 20:72")}</div>
    <div class="ar xs">${A72}</div>
    <div class="tr">&ldquo;Putuskanlah apa yang hendak kau putuskan. Kau hanya berkuasa di kehidupan dunia ini.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">RENUNGAN</div>
    <div class="h m">Yang paling paham tipuan, paling cepat mengenali kebenaran.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="rise">Apa yang membuat mereka seberani itu?</div>
  </div>
</div>`;

const gsvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100"><path d="M30 2C40 18 58 40 57 62C57 72 52 80 46 84H14C8 80 3 72 3 62C2 40 20 18 30 2Z" fill="#6a1410" stroke="${GOLD}" stroke-width="3"/><path d="M30 84V14M30 70Q18 60 12 64M30 70Q42 60 48 64M30 52Q20 44 15 47M30 52Q40 44 45 47M30 36Q24 30 20 32M30 36Q36 30 40 32" fill="none" stroke="${GOLD}" stroke-width="2.4"/><rect x="18" y="84" width="24" height="13" fill="${GOLD}"/></svg>`)}`;
const css = `
#capfloor{background:linear-gradient(180deg,rgba(12,5,3,0),rgba(12,5,3,.45) 45%,rgba(12,5,3,.45) 70%,rgba(12,5,3,0))}
#chip{background:rgba(20,8,4,.8);padding:5px 12px 4px;border-left:3px solid ${GOLD};font-size:19px;letter-spacing:.06em}
.p{right:auto;max-width:914px;--r:100}
.p:after{content:"";position:absolute;top:-14px;bottom:-14px;width:62px;left:calc(var(--r) * 1% - 31px);background:url("${gsvg}") center/100% 100% no-repeat;opacity:calc(min(var(--r), 100 - var(--r)) / 4);filter:drop-shadow(0 0 10px rgba(255,180,80,.7))}
.card{position:relative;display:inline-block;max-width:100%;box-sizing:border-box;background:${PANEL};padding:30px 32px 26px;border:2px solid rgba(227,176,75,.75);box-shadow:0 20px 44px rgba(0,0,0,.5);clip-path:inset(-2px calc(100% - var(--r) * 1%) -2px -2px)}
.card:before{content:"";position:absolute;left:14px;right:14px;top:9px;height:9px;background:radial-gradient(circle,${GOLD} 0 2.4px,transparent 2.9px) 0 0/16px 9px repeat-x;opacity:.85}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Cinzel,serif;font-weight:700;font-size:25px;letter-spacing:.1em;color:${GOLD};margin-bottom:8px}
.h{font-family:Cinzel,serif;font-weight:700;font-size:62px;line-height:1.06;color:${TXT};letter-spacing:.02em}
.h.m{font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:48px;line-height:1.14;letter-spacing:0}
.sub{font-family:"Nunito Sans",sans-serif;font-weight:700;font-size:35px;line-height:1.24;color:${SOFT};margin-top:12px}
.tr{font-family:"Nunito Sans",sans-serif;font-weight:600;font-style:italic;font-size:33px;line-height:1.28;color:${SOFT};margin-top:4px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:56px;line-height:1.72;color:#F4C766}
.ar.sm{font-size:52px;margin-top:8px}
.ar.xs{font-size:45px;line-height:1.7}
.rf{display:inline-block;font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:21px;letter-spacing:.03em;color:${INK};background:${GOLD};padding:4px 11px 3px;white-space:nowrap;vertical-align:middle}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.ls span{font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:46px;line-height:1.14;color:${TXT};padding-left:48px;position:relative}
.ls span:before{content:"";position:absolute;left:4px;top:.3em;width:24px;height:24px;background:${GOLD};clip-path:polygon(50% 0,100% 100%,0 100%)}
.re{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(227,176,75,.45)}
.re b{font-family:Cinzel,serif;font-weight:700;font-size:24px;letter-spacing:.12em;color:${INK};background:${GOLD};padding:6px 12px 4px}
.re span{font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:38px;color:${TXT}}
.ln{font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:36px;line-height:1.22;color:#FFC860;margin-top:12px;padding-top:10px;border-top:1px solid rgba(227,176,75,.45)}
.ask{display:inline-block;margin-top:16px;font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:37px;line-height:1.2;color:${INK};background:${GOLD};padding:10px 18px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:bersujud", "s2:menantang", "s2:Waktunya", "s2:pagi", "s2:orang", "s3:bertanya", "s3:silakan", "s3:hadiah", "s3:Mereka",
  "s4:Musa", "s4:Seorang", "s5:wahyu", "s5:Lemparkan", "s5:Tongkat", "s5:buat", "s6:paham", "s6:merunduk",
  "s7:murka", "s7:mengancam", "s7:Jawab", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "28", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.45, html, css, signature: "EP28_MUSA_PARA_PENYIHIR",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Nunito Sans,sans-serif", chipColor: TXT,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.26,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--r':0,opacity:1},{'--r':100,duration:.24,ease:'power2.out'},a-.2);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--r':0,duration:.18,ease:'power2.in'},b-.42);}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"Nunito Sans",sans-serif;font-weight:800;font-size:54px;line-height:1.3;color:${TXT};background:rgba(26,11,6,.93);padding:8px 20px 10px;border-bottom:4px solid ${GOLD};box-shadow:0 10px 26px rgba(0,0,0,.45)}
.w{display:inline-block;margin:0 .06em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${TXT}",backgroundColor:"rgba(227,176,75,0)"},0);tl.set("#${id}",{color:"${INK}",backgroundColor:"rgb(227,176,75)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${TXT}",backgroundColor:"rgba(227,176,75,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Musa dan Para Penyihir", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
