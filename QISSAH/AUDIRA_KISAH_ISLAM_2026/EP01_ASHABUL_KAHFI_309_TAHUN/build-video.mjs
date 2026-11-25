// EP01 ASHABUL KAHFI. PAPERWORLD: a layered cut-paper diorama of a mountain cave under an indigo paper sky.
// Panels are cream paper sheets with deckled edges that unfold down from a top crease and fold back up. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const TL = loadTimeline(".");
const at = anchors(TL);
const PAPER = "#F3E7CE", INK = "#2A1E17", OCHRE = "#C8873A", TERRA = "#A4532E", INDIGO = "#1E2150", GOLD = "#E2B04A", SILVER = "#C9CED6", BG = "#1B1D4A";

// deckled paper edge as a clip-path polygon, deterministic
function deckled(seed, n = 34, a = 0.9) {
  const q = mulberry(seed), p = [];
  const j = () => (q() * a).toFixed(2);
  for (let i = 0; i <= n; i++) p.push(`${(i / n * 100).toFixed(2)}% ${j()}%`);
  for (let i = 1; i <= n; i++) p.push(`${(100 - q() * a * 0.5).toFixed(2)}% ${(i / n * 100).toFixed(2)}%`);
  for (let i = n - 1; i >= 0; i--) p.push(`${(i / n * 100).toFixed(2)}% ${(100 - q() * a).toFixed(2)}%`);
  for (let i = n - 1; i > 0; i--) p.push(`${(q() * a * 0.5).toFixed(2)}% ${(i / n * 100).toFixed(2)}%`);
  return `clip-path:polygon(${p.join(",")})`;
}
let sd = 1;
const card = (inner, cls = "") => `<div class="card ${cls}" style="${deckled(sd++)}">${inner}</div>`;
const ref = (s) => `<div class="ref">${s}</div>`;

// Arabic copied exactly from _research/quran/EP01_kahfi.txt
const AR_1810 = "رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا";
const AR_1825 = "وَلَبِثُوا۟ فِى كَهْفِهِمْ ثَلَـٰثَ مِا۟ئَةٍ سِنِينَ وَٱزْدَادُوا۟ تِسْعًا";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${card(`<div class="k">KISAH DALAM AL-QUR'AN &middot; 01</div>
  <div class="h">Ashabul Kahfi</div>
  <div class="row"><span class="tagp" data-at="s1:sehari" data-fx="popd">&ldquo;baru sehari?&rdquo;</span></div>
  <div class="cal" data-at="s1:309" data-fx="unf"><b class="ct nb" data-from="1" data-to="309" data-a="s1:309" data-d="1.1">1</b><span>TAHUN</span></div>`)}
</div>
<div class="p" data-in="s2" data-out="s3">
  ${card(`${ref("QS AL-KAHF 18:9&ndash;26")}
  <div class="h m">Pemuda penghuni gua</div>
  <div class="ln" data-at="s2:menyembah" data-fx="unf">Kaum mereka menyembah selain Allah <i>QS 18:15</i></div>
  <div class="ln hi" data-at="s2:memilih" data-fx="unf">Mereka memilih tetap beriman <i>QS 18:13</i></div>`)}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${card(`${ref("DOA DI DALAM GUA &middot; QS AL-KAHF 18:10")}
  <div class="ar">${AR_1810}</div>
  <div class="tr">&ldquo;Ya Tuhan kami, berikan rahmat dari sisi-Mu, dan sempurnakan petunjuk bagi urusan kami.&rdquo;</div>
  <div class="ln" data-at="s3:menidurkan" data-fx="unf">Lalu Allah menidurkan mereka <i>QS 18:11</i></div>`, "tight")}
</div>
<div class="p" data-in="s4" data-out="s4:Anjing">
  ${card(`${ref("QS AL-KAHF 18:17&ndash;18")}
  <div class="sunrow"><span data-at="s4:terbit" data-fx="unf"><b>&#9728; TERBIT</b> condong ke kanan</span><span data-at="s4:terbenam" data-fx="unf"><b>TERBENAM</b> menjauh ke kiri</span></div>
  <div class="ln" data-at="s4:dibolak-balik" data-fx="unf">Dibolak-balik ke kanan dan ke kiri</div>`, "tight")}
</div>
<div class="p" data-in="s4:Anjing" data-out="s5">
  ${card(`${ref("QS AL-KAHF 18:18")}
  <div class="h m">Anjing berjaga</div>
  <div class="ln" data-at="s4:membentangkan" data-fx="unf">membentangkan kedua kaki depan di ambang pintu</div>`, "tight")}
</div>
<div class="p" data-in="s5" data-out="s5:Satu">
  ${card(`${ref("QS AL-KAHF 18:19")}
  <div class="h m">&ldquo;Sudah berapa lama?&rdquo;</div>
  <div class="row"><span class="tagp" data-at="s5:Sehari" data-fx="popd">Sehari</span><span class="tagp lt" data-at="s5:setengah" data-fx="popd">setengah hari</span></div>`, "tight")}
</div>
<div class="p" data-in="s5:Satu" data-out="s6">
  ${card(`${ref("QS AL-KAHF 18:19&ndash;20")}
  <div class="coin"><i></i><div><b>Uang perak</b><span>satu orang diutus ke kota membeli makanan</span></div></div>
  <div class="ln hi" data-at="s5:pesan" data-fx="unf">Pesan: jangan sampai ketahuan</div>`, "tight")}
</div>
<div class="p" data-in="s6" data-out="s6:Ibnu">
  ${card(`${ref("QS AL-KAHF 18:25")}
  <div class="ar big" data-at="s6:menyebut" data-fx="unf">${AR_1825}</div>
  <div class="calrow"><div class="cal sm"><b id="cnt" class="nb">1</b><span>TAHUN</span></div><span class="plus" data-at="s6:ditambah" data-fx="popd">+9</span></div>
  <div class="tr" data-at="s6:tiga" data-fx="unf">tiga ratus tahun, ditambah sembilan</div>`)}
</div>
<div class="p" data-in="s6:Ibnu" data-out="s7">
  ${card(`${ref("TAFSIR IBNU KATSIR &middot; QS 18:25")}
  <div class="eq"><span class="sun">300</span><small>tahun matahari</small></div>
  <div class="eq" data-at="s6:setara" data-fx="unf"><em>=</em><span class="moon">309</span><small>tahun bulan</small></div>`, "tight")}
</div>
<div class="p" data-in="s7" data-out="s7:Di">
  ${card(`${ref("QS AL-KAHF 18:22")}
  <div class="h m">Berapa jumlah mereka?</div>
  <div class="row"><span class="tagp" data-at="s7:tiga" data-fx="popd">3?</span><span class="tagp" data-at="s7:lima" data-fx="popd">5?</span><span class="tagp" data-at="s7:tujuh" data-fx="popd">7?</span></div>
  <div class="ln hi" data-at="s7:Tuhanku" data-fx="unf">&ldquo;Tuhanku lebih mengetahui.&rdquo;</div>`, "tight")}
</div>
<div class="p" data-in="s7:Di" data-out="s8">
  ${card(`${ref("QS AL-KAHF 18:23&ndash;24")}
  <div class="h m">Jangan berkata &ldquo;besok&rdquo;</div>
  <div class="ln hi" data-at="s7:kecuali" data-fx="unf">kecuali dengan <b>insya Allah</b></div>`, "tight")}
</div>
<div class="p" data-in="s8" data-out="@END">
  ${card(`<div class="k">ASHABUL KAHFI &middot; QS 18:9&ndash;26</div>
  <div class="h m">Dijaga melewati tiga abad</div>
  <div class="ln hi" data-at="s8:Menurut" data-fx="unf">Apa gua tempatmu berlindung hari ini?</div>`, "tight")}
</div>`;

const css = `
.p{filter:drop-shadow(0 16px 22px rgba(10,8,30,.55))}
.card{background:${PAPER};background-image:radial-gradient(rgba(120,90,50,.07) 1px,transparent 1.4px),linear-gradient(180deg,rgba(255,255,255,.35),rgba(200,160,100,.12));background-size:7px 7px,100% 100%;padding:30px 36px 34px;border-top:0}
.card.tight{padding:26px 34px 28px}
.k,.ref{font-family:"Work Sans",sans-serif;font-weight:700;font-size:25px;letter-spacing:.14em;color:${TERRA};padding-bottom:12px;border-bottom:2px dashed rgba(42,30,23,.35);margin-bottom:14px}
.h{font-family:Fraunces,serif;font-weight:800;font-size:104px;line-height:.95;color:${INDIGO};letter-spacing:-.01em}
.h.m{font-size:66px;line-height:1.02}
.ln{font-family:Fraunces,serif;font-weight:600;font-size:40px;line-height:1.18;color:${INK};margin-top:14px}
.ln i{font-family:"Work Sans",sans-serif;font-style:normal;font-weight:700;font-size:22px;letter-spacing:.08em;color:${TERRA};white-space:nowrap}
.ln.hi{background:${INDIGO};color:${PAPER};padding:10px 16px}
.ln.hi b{color:${GOLD}}
.tr{font-family:Fraunces,serif;font-style:italic;font-weight:500;font-size:36px;line-height:1.22;color:${INK};margin-top:10px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:50px;line-height:1.75;color:${INDIGO}}
.ar.big{font-size:60px;text-align:center}
.row{display:flex;flex-wrap:wrap;gap:14px;margin-top:18px}
.tagp{display:inline-block;font-family:Fraunces,serif;font-weight:700;font-size:44px;padding:6px 18px;background:${OCHRE};color:${PAPER};transform:rotate(-1.5deg)}
.tagp.lt{background:${TERRA}}
.cal{display:flex;align-items:baseline;gap:18px;margin-top:20px}
.cal b{font-family:Fraunces,serif;font-weight:900;font-size:200px;line-height:.85;color:${TERRA};background:#fbf3e2;padding:10px 26px 4px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.08),0 6px 0 ${INK};background-image:linear-gradient(180deg,transparent 49%,rgba(42,30,23,.25) 50%,transparent 51%)}
.cal span{font-family:"Work Sans",sans-serif;font-weight:800;font-size:44px;letter-spacing:.12em;color:${INK}}
.cal.sm b{font-size:150px}
.calrow{display:flex;align-items:center;gap:22px}
.plus{font-family:Fraunces,serif;font-weight:900;font-size:96px;color:${PAPER};background:${TERRA};padding:0 22px;transform:rotate(-4deg)}
.sunrow{display:flex;flex-direction:column;gap:10px}
.sunrow span{font-family:Fraunces,serif;font-weight:600;font-size:40px;color:${INK}}
.sunrow b{font-family:"Work Sans",sans-serif;font-weight:800;font-size:30px;letter-spacing:.08em;color:${PAPER};background:${OCHRE};padding:4px 12px;margin-right:10px}
.coin{display:flex;align-items:center;gap:22px}
.coin i{flex:none;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,${SILVER} 45%,#8f97a3);box-shadow:0 0 0 6px #aab2bd,0 6px 0 6px #7d8591}
.coin b{display:block;font-family:Fraunces,serif;font-weight:800;font-size:60px;color:${INDIGO};line-height:1}
.coin span{display:block;font-family:Fraunces,serif;font-weight:500;font-size:32px;color:${INK};margin-top:6px}
.eq{display:flex;align-items:baseline;gap:16px;margin-top:6px}
.eq span{font-family:Fraunces,serif;font-weight:900;font-size:120px;line-height:1}
.eq .sun{color:#B9862A}.eq .moon{color:#5A6274}
.eq small{font-family:Fraunces,serif;font-weight:600;font-size:40px;color:${INK}}
.eq em{font-family:Fraunces,serif;font-style:normal;font-weight:700;font-size:80px;color:${TERRA}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Padahal", "s1:309", "s2:Para", "s2:Mereka", "s2:memilih", "s3:berlindung", "s3:gua", "s3:berdoa", "s3:Ya", "s3:menidurkan",
  "s4:Matahari", "s4:kiri", "s4:kiri#2", "s4:Tubuh", "s4:Anjing", "s5:dibangunkan", "s5:Sehari", "s5:Satu", "s5:kota", "s5:uang", "s5:membeli", "s5:makanan", "s5:jangan",
  "s6:tiga", "s6:tahun", "s6:ditambah", "s6:sembilan", "s6:Ibnu", "s6:matahari", "s6:setara", "s7:tiga", "s7:lima", "s7:tujuh", "s7:Tuhanku", "s7:pesan", "s7:besok", "s7:insya", "s8:Menurut"];
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.5, grain: 0.07, capfloor: 0.55, html, css,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Work Sans,sans-serif", chipColor: PAPER,
  extraAt: WORLD_AT,
  // unf: a strip of paper unfolding down from its top crease
  fxExtra: `unf:(e,t)=>{gsap.set(e,{display:'none',transformPerspective:900,transformOrigin:'50% 0%'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{rotationX:-95,opacity:0},{rotationX:0,opacity:1,duration:.5,ease:'back.out(1.2)'},t);},
 popd:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{scale:.6,opacity:0},{scale:1,opacity:1,duration:.36,ease:'back.out(1.6)'},t);},`,
  // panels unfold down from a crease at the top edge, and fold back up when they leave
  panelIn: `(tl,p,a)=>tl.fromTo(p,{transformPerspective:1500,transformOrigin:'50% 0%',rotationX:-100,opacity:1},{rotationX:0,opacity:1,duration:.6,ease:'back.out(1.15)'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{transformPerspective:1500,transformOrigin:'50% 0%',rotationX:95,opacity:0,duration:.34,ease:'power2.in'},b-.34)`,
  // calendar counter: 1 to 300, then +9 to 309
  hud: `(t)=>{const c=q('#cnt');if(c){const a=AT['s6:tiga'],b=AT['s6:tahun']+.3,d=AT['s6:sembilan'];let v=t<a?1:t<b?Math.round(1+299*eout((t-a)/(b-a))):t<d?300:t<d+.6?300+Math.round(9*(t-d)/.6):309;c.textContent=v;c.style.color=v>300?'${INDIGO}':'${TERRA}';}}`,
  outroIn: `gsap.set('#outro',{transformPerspective:1600,transformOrigin:'50% 0%',rotationX:-90,opacity:0});tl.to('#outro',{rotationX:0,opacity:1,duration:.6,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Fraunces,serif;font-weight:700;font-size:58px;line-height:1.32;color:${PAPER};text-shadow:0 3px 14px rgba(10,8,30,.9)}
.w{display:inline-block;margin:0 .05em;padding:0 .12em;background:rgba(200,135,58,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"${PAPER}",backgroundColor:"rgba(200,135,58,0)",y:0},{color:"${INDIGO}",backgroundColor:"rgba(226,176,74,1)",textShadow:"0 0 0 rgba(0,0,0,0)",y:-4,duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${PAPER}",backgroundColor:"rgba(200,135,58,0)",textShadow:"0 3px 14px rgba(10,8,30,.9)",y:0,duration:.04},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{rotationX:-70,transformPerspective:700,transformOrigin:"50% 0%",opacity:0},{rotationX:0,opacity:1,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ashabul Kahfi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
