// EP12 DUA PUTRA ADAM DAN SEEKOR GAGAK. FILMNOIR: black-and-white chiaroscuro, hard key light, film grain.
// Panels are silent-film intertitles (black card, double ivory rule, Cormorant SC + Libre Baskerville). They open and close
// with an iris; the same iris closes the whole picture at the killing in s5, so the act itself is never seen.
// No colour in the UI: the only colour in the film is the ember red of the offering fire in the 3D world.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0b0b0b", IV = "#ECE7DC", GR = "#9C978D", INK = "#0A0A0A";

// Arabic copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP12_habil_qabil.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V28 = verse("5:28").split(" ۖ")[0];                         // the whole conditional sentence, bounded by the pause mark
if (!V28.startsWith("لَئِنۢ") || !V28.endsWith("لِأَقْتُلَكَ")) throw new Error("5:28 phrase");
const V32core = verse("5:32").split(" ۚ")[0];
const V32from = V32core.slice(V32core.indexOf("مَن قَتَلَ"));
const cut = V32from.indexOf(" وَمَنْ أَحْيَاهَا");
const V32a = V32from.slice(0, cut), V32b = V32from.slice(cut + 1);
if (!V32a.startsWith("مَن قَتَلَ") || !V32a.endsWith("جَمِيعًا") || !V32b.startsWith("وَمَنْ أَحْيَاهَا") || !V32b.endsWith("جَمِيعًا")) throw new Error("5:32 phrase");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="flick"` : ""}>${r}</span>`;

const html = `
<div id="iris"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 12</div>
    <div class="h">PEMBUNUHAN<br>PERTAMA</div>
    <div class="sub" data-at="s1:belajar" data-fx="flick">Pelakunya belajar dari seekor burung gagak</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="card">
    <div class="k">SURAH AL-MA'IDAH ${ref("QS 5:27", "s2:ayat")}</div>
    <div class="h m">DUA PUTRA ADAM<br>BERKURBAN</div>
    <div class="two">
      <div class="op" data-at="s2:diterima" data-fx="flick"><b>DITERIMA</b></div>
      <div class="op dim" data-at="s2:tidak" data-fx="flick"><b>TIDAK DITERIMA</b></div>
    </div>
    <div class="note" data-at="s2:Tradisi" data-fx="flick">Tradisi menamai mereka <b>Habil</b> &amp; <b>Qabil</b></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card">
    <div class="k">ANCAMAN DAN JAWABAN ${ref("QS 5:27")}</div>
    <div class="ln" data-at="s3:marah" data-fx="flick"><em>QABIL</em><span class="qt">&ldquo;Aku pasti membunuhmu!&rdquo;</span></div>
    <div class="ln" data-at="s3:Allah" data-fx="flick"><em>HABIL</em><span class="qt">&ldquo;Allah hanya menerima dari orang-orang yang bertakwa.&rdquo;</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k">HABIL BERKATA ${ref("QS 5:28")}</div>
    <div class="ar" data-at="s4:kalau" data-fx="flick">${V28}</div>
    <div class="id" data-at="s4:tidak" data-fx="flick">&ldquo;Aku tidak akan menggerakkan tanganku kepadamu untuk membunuhmu.&rdquo;</div>
    <div class="id b" data-at="s4:takut" data-fx="flick">Aku takut kepada Allah, Tuhan seluruh alam.</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="k">${ref("QS 5:30")}</div>
    <div class="h m" data-at="s5:nafsu" data-fx="flick">NAFSU QABIL MENANG</div>
    <div class="id" data-at="s5:jadilah" data-fx="flick">Jadilah ia termasuk orang-orang yang rugi.</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k">${ref("QS 5:31", "s6:mengutus")}</div>
    <div class="h s" data-at="s6:gagak" data-fx="flick">SEEKOR GAGAK MENGGALI TANAH</div>
    <div class="id" data-at="s6:celaka" data-fx="flick">&ldquo;Celaka aku, mengapa aku tidak mampu seperti gagak ini?&rdquo;</div>
    <div class="stamp" data-at="s6:menyesal" data-fx="flick">IA PUN MENYESAL</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k">AYAT BERIKUTNYA ${ref("QS 5:32", "s7:ayat")}</div>
    <div class="ar s" data-at="s7:siapa" data-fx="flick">${V32a}</div>
    <div class="id" data-at="s7:membunuh" data-fx="flick">Siapa membunuh satu jiwa tanpa hak, seakan membunuh semua manusia.</div>
    <div class="ar s" data-at="s7:Dan" data-fx="flick">${V32b}</div>
    <div class="id b" data-at="s7:memelihara" data-fx="flick">Siapa memelihara satu jiwa, seakan memelihara semua manusia.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="s8:Kisah">
  <div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h m">IRI YANG DIBIARKAN</div>
    <div class="id" data-at="s8:berakhir" data-fx="flick">bisa berakhir dengan penyesalan seumur hidup.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="flick">Apa cara terbaik memadamkan iri sebelum membesar?</div>
  </div>
</div>
<div class="p" data-in="s8:Kisah" data-out="@END">
  <div class="card end">
    <div class="k">KISAH DALAM AL-QUR'AN</div>
    <div class="h s">BERSAMA AUDIRA</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.66) 40%,rgba(0,0,0,.66) 72%,rgba(0,0,0,0))}
#iris{position:absolute;inset:0;z-index:9;pointer-events:none;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 1400px,#000 1404px)}
.p{clip-path:circle(75% at 50% 50%)}
.card{position:relative;background:rgba(7,7,7,.88);padding:24px 34px 26px;border:2px solid ${IV};outline:1px solid rgba(236,231,220,.45);outline-offset:-10px;box-shadow:0 20px 50px rgba(0,0,0,.6)}
.card:before,.card:after{content:"";position:absolute;width:16px;height:16px;border:2px solid ${IV};transform:rotate(45deg);background:${INK};top:-10px}
.card:before{left:-10px}.card:after{right:-10px}
.k{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;font-family:"Cormorant SC",serif;font-weight:700;font-size:30px;letter-spacing:.18em;color:${GR};margin-bottom:8px;text-align:center}
.h{font-family:"Cormorant SC",serif;font-weight:700;font-size:78px;line-height:1.0;color:${IV};text-align:center;letter-spacing:.04em}
.h.m{font-size:62px}
.h.s{font-size:50px}
.sub{font-family:"Libre Baskerville",serif;font-style:italic;font-size:34px;line-height:1.3;color:${IV};text-align:center;margin-top:12px}
.rf{display:inline-block;font-family:"Libre Baskerville",serif;font-weight:700;font-size:22px;letter-spacing:.06em;color:${INK};background:${IV};padding:5px 12px 4px;white-space:nowrap}
.two{display:flex;gap:16px;margin-top:14px}
.op{flex:1;text-align:center;border-top:2px solid ${IV};border-bottom:2px solid ${IV};padding:8px 6px}
.op b{font-family:"Cormorant SC",serif;font-weight:700;font-size:40px;letter-spacing:.08em;color:${IV}}
.op.dim{border-color:rgba(156,151,141,.6)}
.op.dim b{color:${GR}}
.note{margin-top:14px;text-align:center;font-family:"Libre Baskerville",serif;font-size:30px;color:${GR}}
.note b{color:${IV}}
.ln{display:flex;align-items:baseline;gap:18px;padding:10px 0;border-top:1px solid rgba(236,231,220,.25)}
.ln em{flex:none;width:118px;font-family:"Cormorant SC",serif;font-style:normal;font-weight:700;font-size:32px;letter-spacing:.1em;color:${GR}}
.qt{font-family:"Libre Baskerville",serif;font-style:italic;font-size:36px;line-height:1.3;color:${IV}}
.ar{font-family:Amiri,serif;direction:rtl;text-align:center;font-size:50px;line-height:1.75;color:${IV}}
.ar.s{font-size:42px;line-height:1.7}
.id{font-family:"Libre Baskerville",serif;font-style:italic;font-size:31px;line-height:1.35;color:${IV};text-align:center;margin-top:8px}
.id.b{color:${GR};font-size:29px}
.stamp{display:block;width:max-content;margin:14px auto 0;font-family:"Cormorant SC",serif;font-weight:700;font-size:40px;letter-spacing:.14em;color:${INK};background:${IV};padding:4px 22px}
.ask{margin-top:14px;text-align:center;font-family:"Libre Baskerville",serif;font-weight:700;font-size:34px;line-height:1.3;color:${INK};background:${IV};padding:12px 18px}
.end{padding:18px 30px}
`;

// HUD: the picture iris. Closes on "membunuh", holds black, reopens on a world with one shadow fewer.
const hud = `(t)=>{const e=document.getElementById('iris');if(!e)return;const a=AT['s5:membunuh'],sh=a+.3,op=a+1.05;
let R=1400;if(t>a&&t<sh){const u=(t-a)/(sh-a);R=1400*(1-u*u);}else if(t>=sh&&t<op-.05)R=0;else if(t>=op-.05&&t<op+.6){const u=(t-op+.05)/.65;R=1400*u*u*(3-2*u);}
e.style.background=R>=1399?'none':'radial-gradient(circle at 50% 46%,rgba(0,0,0,0) '+R.toFixed(1)+'px,#000 '+(R+4).toFixed(1)+'px)';}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:gagak", "s1:mengubur", "s2:diterima", "s2:tidak", "s2:Tradisi", "s3:membunuhmu", "s3:tenang",
  "s4:menggerakkan", "s4:tidak", "s4:takut", "s5:nafsu", "s5:membunuh", "s5:rugi",
  "s6:gagak", "s6:menggali", "s6:celaka", "s6:gagak#2", "s6:menyesal",
  "s7:satu", "s7:semua", "s7:memelihara", "s7:satu#2", "s7:semua#2", "s8:Kisah"];
const { AT, K } = writeWorld(TL, at, {
  ep: "12", bg: BG, vig: 0.62, grain: 0.11, capfloor: 0.6, html, css, hud,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Libre Baskerville,serif", chipColor: GR,
  signature: "EP12_HABIL_QABIL_GAGAK",
  extraAt: WORLD_AT,
  // old-film flicker reveal
  fxExtra: `flick:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0},{keyframes:[{opacity:.7,duration:.06},{opacity:.15,duration:.05},{opacity:.9,duration:.06},{opacity:.5,duration:.04},{opacity:1,duration:.12}],ease:'none'},t);},`,
  // iris in, iris out
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'circle(0% at 50% 50%)',opacity:1},{clipPath:'circle(75% at 50% 50%)',duration:.55,ease:'power2.inOut'},a-.22);}`,
  panelOut: `(tl,p,b)=>{tl.fromTo(p,{clipPath:'circle(75% at 50% 50%)'},{clipPath:'circle(0% at 50% 50%)',duration:.36,ease:'power2.in',immediateRender:false},b-.38);}`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 45%)'});tl.to('#outro',{clipPath:'circle(120% at 50% 45%)',duration:.8,ease:'power2.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Libre Baskerville",serif;font-weight:700;font-size:50px;line-height:1.42;color:#E9E4D9;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px rgba(0,0,0,.95)}
.w{display:inline-block;margin:0 .1em;padding:0 .12em}`,
(id, w) => `tl.set("#${id}",{color:"#0A0A0A",backgroundColor:"#ECE7DC",textShadow:"none"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#E9E4D9",backgroundColor:"rgba(0,0,0,0)",textShadow:"0 3px 12px rgba(0,0,0,.95),0 0 3px rgba(0,0,0,.95)"},${w.end.toFixed(3)});
`,
(id, s) => `tl.set("#${id}",{opacity:0},0);tl.set("#${id}",{opacity:1},${s.toFixed(3)});
`);
writeIndex(".", TL, "Habil Qabil Gagak", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
