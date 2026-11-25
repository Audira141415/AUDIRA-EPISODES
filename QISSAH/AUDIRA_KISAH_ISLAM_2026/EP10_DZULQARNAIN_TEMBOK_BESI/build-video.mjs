// EP10 DZULQARNAIN, TEMBOK BESI. FLUIDFORGE: basalt mountains, molten iron and copper with an iridescent sheen, steel-blue dusk.
// Panels are dark basalt plates edged in molten copper: they arrive with a molten pour (a glowing edge runs down the plate)
// and leave in a heat shimmer. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#0D1626", CU = "#E0894A", HOT = "#FFB55C", STEEL = "#9FC3E6", INK = "#0B0F17";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP10_dzulqarnain.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V96 = verse("18:96");
const V98 = verse("18:98");
const RAHMAH = V98.split(" ۖ")[0].replace(/^قَالَ /, "");          // "هَـٰذَا رَحْمَةٌ مِّن رَّبِّى"
const V83 = verse("18:83");
const DZQ = V83.match(/ذِى ٱلْقَرْنَيْنِ/)[0];                       // the name phrase as it stands in the verse
if (!V98.includes(RAHMAH) || !RAHMAH.startsWith("هَـٰذَا")) throw new Error("rahmah phrase");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;
const horns = `<svg class="horns" viewBox="0 0 120 60"><path d="M38 6a26 26 0 1 0 0 48a21 21 0 1 1 0-48z" fill="${HOT}"/><path d="M82 6a26 26 0 1 1 0 48a21 21 0 1 0 0-48z" fill="${HOT}"/></svg>`;
const scale = `<svg class="scale" viewBox="0 0 120 110"><g stroke="${HOT}" stroke-width="4" fill="none" stroke-linecap="round"><path d="M60 8v86M36 98h48M14 30h92"/><path d="M14 30l-12 30h24zM106 30l-12 30h24z"/></g><path d="M2 60a12 6 0 0 0 24 0zM94 60a12 6 0 0 0 24 0z" fill="${HOT}"/><circle cx="60" cy="8" r="6" fill="${HOT}"/></svg>`;
const xmark = `<svg class="xm" viewBox="0 0 40 40"><path d="M8 8l24 24M32 8L8 32" stroke="${HOT}" stroke-width="6" stroke-linecap="round"/></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 10</div>
    <div class="h">TEMBOK BESI<br>DI ANTARA DUA GUNUNG</div>
    <div class="row" data-at="s1:Pembangunnya" data-fx="melt"><b class="tag">PEMBANGUNNYA MENOLAK DIBAYAR</b>${ref("QS 18:95")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Siapa">
  <div class="card name">
    <div class="k"><i></i>SURAH AL-KAHF ${ref("QS 18:83", "s2:Al-Kahfi")}</div>
    <div class="ar" data-at="s2:menyebutnya" data-fx="melt">${DZQ}</div>
    <div class="h">DZULQARNAIN</div>
    <div class="sub" data-at="s2:pemilik" data-fx="melt">${horns}<span>pemilik dua tanduk</span></div>
  </div>
</div>
<div class="p" data-in="s2:Siapa" data-out="s3">
  <div class="card">
    <div class="k"><i></i>SIAPA DIA?</div>
    <div class="two">
      <div class="op" data-at="s2:Iskandar" data-fx="melt"><em>pendapat 1</em><b>ISKANDAR?</b></div>
      <div class="op" data-at="s2:Koresh" data-fx="melt"><em>pendapat 2</em><b>KORESH</b><small>dari Persia?</small></div>
    </div>
    <div class="note" data-at="s2:Al-Qur'an" data-fx="stamp">Al-Qur'an tidak menyebut nama aslinya</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Ia">
  <div class="card">
    <div class="k"><i></i>DIBERI KEDUDUKAN ${ref("QS 18:84", "s3:kedudukan")}</div>
    <div class="h m">KEDUDUKAN DI BUMI</div>
    <div class="sub" data-at="s3:jalan" data-fx="melt">dan jalan untuk mencapai segala sesuatu</div>
  </div>
</div>
<div class="p" data-in="s3:Ia" data-out="s4">
  <div class="card">
    <div class="k"><i></i>PERJALANAN 1 &middot; KE BARAT ${ref("QS 18:86", "s3:matahari")}</div>
    <div class="h m">TEMPAT MATAHARI TERBENAM</div>
    <div class="sub" data-at="s3:laut" data-fx="melt">terbenam di laut berlumpur hitam <span class="dim">(menurut penglihatannya)</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Di">
  <div class="card">
    <div class="k"><i></i>PERJALANAN 2 &middot; KE TIMUR ${ref("QS 18:90", "s4:terbit")}</div>
    <div class="h m">TEMPAT MATAHARI TERBIT</div>
    <div class="sub" data-at="s4:pelindung" data-fx="melt">kaum tanpa pelindung dari sinarnya</div>
  </div>
</div>
<div class="p" data-in="s4:Di" data-out="s5">
  <div class="card just">
    ${scale}
    <div class="jr">
      <div class="k"><i></i>ADIL DI SETIAP TEMPAT ${ref("QS 18:87-88")}</div>
      <div class="ln" data-at="s4:zalim" data-fx="melt"><span>yang zalim</span><b>DIHUKUM</b></div>
      <div class="ln" data-at="s4:berbuat" data-fx="melt"><span>yang berbuat baik</span><b>DIMUDAHKAN</b></div>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Sebuah">
  <div class="card">
    <div class="k"><i></i>PERJALANAN 3 ${ref("QS 18:93", "s5:antara")}</div>
    <div class="h m">ANTARA DUA GUNUNG</div>
  </div>
</div>
<div class="p" data-in="s5:Sebuah" data-out="s6">
  <div class="card">
    <div class="k"><i></i>KAUM ITU MENGADU ${ref("QS 18:94", "s5:mengadu")}</div>
    <div class="h s" data-at="s5:Ya'juj" data-fx="melt">Ya'juj dan Ma'juj berbuat kerusakan</div>
    <div class="qt" data-at="s5:Bolehkah" data-fx="melt">&ldquo;Bolehkah kami membayarmu?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Bawakan">
  <div class="card">
    <div class="k"><i></i>JAWABANNYA ${ref("QS 18:95", "s6:menjawab")}</div>
    <div class="qt big">&ldquo;Yang Tuhan berikan kepadaku lebih baik.&rdquo;</div>
    <div class="tag2" data-at="s6:Bantu" data-fx="melt">Bantu aku dengan tenaga</div>
  </div>
</div>
<div class="p" data-in="s6:Bawakan" data-out="s7">
  <div class="card build">
    <div class="k"><i></i>MEMBANGUN DINDING ${ref("QS 18:96")}</div>
    <div class="ar v">${V96}</div>
    <div class="st" data-at="s6:Bawakan" data-fx="melt"><b>1</b><span>POTONGAN BESI</span><div class="bar"><i id="bIron"></i></div><em data-at="s6:gunung" data-fx="pop">rata puncak</em></div>
    <div class="st" data-at="s6:Tiuplah" data-fx="melt"><b>2</b><span>TIUP API</span><div class="bar"><i id="bHeat"></i></div><em data-at="s6:menyala" data-fx="pop">merah menyala</em></div>
    <div class="st" data-at="s6:Lalu" data-fx="melt"><b>3</b><span>TEMBAGA MENDIDIH</span><div class="bar"><i id="bCu"></i></div><em data-at="s6:atasnya" data-fx="pop">dituang</em></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  <div class="card">
    <div class="k"><i></i>HASILNYA ${ref("QS 18:97", "s7:Hasilnya")}</div>
    <div class="ln2" data-at="s7:mendakinya" data-fx="melt">${xmark}<b>TIDAK BISA DIDAKI</b></div>
    <div class="ln2" data-at="s7:melubanginya" data-fx="melt">${xmark}<b>TIDAK BISA DILUBANGI</b></div>
  </div>
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  <div class="card">
    <div class="k"><i></i>TIDAK MENYOMBONGKANNYA ${ref("QS 18:98", "s7:ini")}</div>
    <div class="ar big">${RAHMAH}</div>
    <div class="qt" data-at="s7:rahmat" data-fx="melt">&ldquo;Ini rahmat dari Tuhanku.&rdquo;</div>
    <div class="sub sm" data-at="s7:Bila" data-fx="melt">Bila janji-Nya datang, tembok ini akan dihancurkan.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>TIGA PELAJARAN</div>
    <div class="ls"><span data-at="s8:Membangun" data-fx="melt">Membangun dengan kuat</span><span data-at="s8:menolak" data-fx="melt">Menolak upah</span><span data-at="s8:mengembalikan" data-fx="melt">Pujian kembali kepada Allah</span></div>
    <div class="ask" data-at="s8:Menurut" data-fx="melt">Tembok apa yang sedang kamu bangun hari ini?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(6,9,16,0),rgba(6,9,16,.62) 40%,rgba(6,9,16,.62) 72%,rgba(6,9,16,0))}
.p{--cp:100}
.p[data-first="1"]{--cp:0}
.card{position:relative;background:linear-gradient(160deg,rgba(18,22,30,.9),rgba(10,13,19,.86));padding:22px 30px 26px;border-radius:6px;
 box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 0 0 1px rgba(224,137,74,.55),inset 0 1px 0 rgba(255,200,140,.35);
 clip-path:inset(0 0 calc(var(--cp) * 1%) 0)}
.card:after{content:"";position:absolute;left:0;right:0;top:calc((100 - var(--cp)) * 1% - 3px);height:6px;background:linear-gradient(90deg,rgba(255,181,92,0),${HOT} 18%,#FFF1C8 50%,${HOT} 82%,rgba(255,181,92,0));box-shadow:0 0 18px 4px rgba(255,140,50,.75);opacity:calc(var(--cp) / 100 * 8);pointer-events:none}
.card:before{content:"";position:absolute;left:30px;right:30px;bottom:0;height:3px;background:linear-gradient(90deg,${CU},${HOT},#7FB6E0,${CU});opacity:.85}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Rajdhani,sans-serif;font-weight:700;font-size:27px;letter-spacing:.16em;color:${STEEL};margin-bottom:10px}
.k i{display:block;width:14px;height:14px;background:${HOT};box-shadow:0 0 10px ${HOT};transform:rotate(45deg)}
.h{font-family:"Cinzel Decorative",serif;font-weight:900;font-size:64px;line-height:1.08;color:#F6E6D0;text-shadow:0 0 22px rgba(255,140,60,.35)}
.h.m{font-size:56px}
.h.s{font-family:Rajdhani,sans-serif;font-weight:700;font-size:50px;line-height:1.1;color:#F6E6D0}
.sub{font-family:Rajdhani,sans-serif;font-weight:600;font-size:40px;line-height:1.2;color:${HOT};margin-top:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.sub.sm{font-size:34px;color:#D9C6B0}
.dim{color:#9fb0c4;font-size:30px}
.qt{font-family:Rajdhani,sans-serif;font-weight:600;font-style:italic;font-size:46px;line-height:1.15;color:#F6E6D0;margin-top:6px}
.qt.big{font-size:56px}
.rf{display:inline-block;font-family:Rajdhani,sans-serif;font-weight:700;font-size:24px;letter-spacing:.08em;color:${INK};background:linear-gradient(180deg,#FFD08A,${CU});padding:4px 12px 3px;border-radius:3px;white-space:nowrap}
.row{display:flex;align-items:center;gap:18px;margin-top:14px;flex-wrap:wrap}
.tag{font-family:Rajdhani,sans-serif;font-weight:700;font-size:36px;letter-spacing:.06em;color:${HOT}}
.tag2{display:inline-block;margin-top:14px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:38px;color:${INK};background:${HOT};padding:6px 16px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:66px;line-height:1.5;color:#FFD9A8;text-shadow:0 0 16px rgba(255,140,60,.45)}
.ar.v{font-size:33px;line-height:1.75;color:#F2D2AA;margin:2px 0 8px}
.ar.big{font-size:74px}
.name .h{font-size:70px}
.horns{width:96px;height:48px;filter:drop-shadow(0 0 8px rgba(255,160,60,.7))}
.two{display:flex;gap:18px;margin-top:4px}
.op{flex:1;border:1px solid rgba(159,195,230,.4);border-radius:5px;padding:12px 16px;background:rgba(159,195,230,.06)}
.op em{display:block;font-family:Rajdhani,sans-serif;font-style:normal;font-weight:600;font-size:24px;letter-spacing:.12em;color:${STEEL};text-transform:uppercase}
.op b{display:block;font-family:"Cinzel Decorative",serif;font-weight:900;font-size:44px;color:#F6E6D0}
.op small{display:block;font-family:Rajdhani,sans-serif;font-weight:600;font-size:30px;color:#D9C6B0}
.note{display:inline-block;margin-top:16px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:36px;color:${INK};background:linear-gradient(90deg,${HOT},#FFE0A8);padding:8px 16px;border-radius:3px}
.just{display:flex;align-items:center;gap:24px}
.scale{flex:none;width:150px;height:138px;filter:drop-shadow(0 0 10px rgba(255,150,60,.55))}
.jr{flex:1}
.ln{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid rgba(159,195,230,.25)}
.ln span{font-family:Rajdhani,sans-serif;font-weight:600;font-size:34px;color:#D9C6B0}
.ln b{font-family:Rajdhani,sans-serif;font-weight:700;font-size:40px;letter-spacing:.06em;color:${HOT}}
.build{padding-bottom:18px}
.st{display:grid;grid-template-columns:44px 1fr 200px;grid-template-rows:auto auto;column-gap:14px;align-items:center;padding:7px 0;border-top:1px solid rgba(159,195,230,.22)}
.st b{grid-row:1/3;font-family:"Cinzel Decorative",serif;font-weight:900;font-size:40px;color:${HOT};text-align:center}
.st span{font-family:Rajdhani,sans-serif;font-weight:700;font-size:30px;letter-spacing:.08em;color:#F6E6D0}
.st .bar{grid-column:2;height:10px;background:rgba(159,195,230,.18);border-radius:5px;overflow:hidden}
.st .bar i{display:block;height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#7a2a10,${CU},${HOT},#FFF0C0);box-shadow:0 0 10px ${HOT}}
.st em{grid-column:3;grid-row:1/3;font-family:Rajdhani,sans-serif;font-style:normal;font-weight:700;font-size:28px;color:${STEEL};text-align:right}
.ln2{display:flex;align-items:center;gap:18px;padding:10px 0}
.ln2 .xm{width:46px;height:46px;flex:none}
.ln2 b{font-family:"Cinzel Decorative",serif;font-weight:900;font-size:46px;color:#F6E6D0}
.ls{display:flex;flex-direction:column;gap:6px}
.ls span{font-family:Rajdhani,sans-serif;font-weight:700;font-size:40px;color:#F6E6D0;padding-left:26px;position:relative}
.ls span:before{content:"";position:absolute;left:0;top:.5em;width:12px;height:12px;background:${HOT};transform:rotate(45deg);box-shadow:0 0 8px ${HOT}}
.ask{margin-top:14px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:42px;line-height:1.15;color:${INK};background:linear-gradient(90deg,${HOT},#FFE0A8);padding:10px 18px;display:inline-block}
`;

// HUD: three progress bars in the build panel follow the 3D steps.
const hud = `(t)=>{const sm=(a,b)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};
const bi=document.getElementById('bIron'),bh=document.getElementById('bHeat'),bc=document.getElementById('bCu');if(!bi)return;
bi.style.transform='scaleX('+sm(AT['s6:Bawakan']+.3,AT['s6:gunung']+.25)+')';
bh.style.transform='scaleX('+sm(AT['s6:Tiuplah'],AT['s6:menyala']+.4)+')';
bc.style.transform='scaleX('+sm(AT['s6:tembaga']-.1,K.s7+1.8)+')';}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:mendidih", "s1:dibangun", "s1:gunung", "s1:Pembangunnya", "s2:Dzulqarnain", "s2:tanduk", "s2:Siapa", "s2:Koresh",
  "s3:jalan", "s3:Ia", "s3:matahari", "s3:terbenam", "s3:terbenam#2", "s4:terbit", "s4:kaum", "s4:sinarnya", "s4:Di",
  "s5:gunung", "s5:Sebuah", "s5:Ya'juj", "s5:kerusakan", "s5:Bolehkah", "s5:membayarmu",
  "s6:lebih", "s6:Bantu", "s6:Bawakan", "s6:Besi", "s6:gunung", "s6:Tiuplah", "s6:merah", "s6:menyala", "s6:Lalu", "s6:tembaga", "s6:dituangkan", "s6:atasnya",
  "s7:mendakinya", "s7:melubanginya", "s7:Tapi", "s7:menyombongkannya", "s7:rahmat", "s7:Bila", "s8:Menurut"];
const { AT, K } = writeWorld(TL, at, {
  ep: "10", bg: BG, vig: 0.5, grain: 0.06, capfloor: 0.55, html, css, hud,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Rajdhani,sans-serif", chipColor: STEEL,
  extraAt: WORLD_AT,
  fxExtra: `melt:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:-14,filter:'blur(6px) brightness(2.2) sepia(1)'},{opacity:1,y:0,filter:'blur(0px) brightness(1) sepia(0)',duration:.5,ease:'power3.out'},t);},`,
  // Molten pour in: the plate is revealed top-down behind a white-hot edge. Heat shimmer out: the plate wavers, brightens and evaporates upward.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--cp':100,opacity:1},{'--cp':0,duration:.62,ease:'power2.inOut'},a-.2);tl.fromTo(p,{filter:'brightness(1.8) saturate(1.4)'},{filter:'brightness(1) saturate(1)',duration:.7,ease:'power2.out'},a-.2);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{keyframes:[{skewX:1.6,scaleY:1.01,filter:'blur(1.5px) brightness(1.25)',duration:.09},{skewX:-1.8,filter:'blur(3px) brightness(1.45)',duration:.09},{skewX:1.2,filter:'blur(5px) brightness(1.7)',duration:.08},{skewX:0,y:-26,opacity:0,filter:'blur(12px) brightness(2)',duration:.12}],ease:'none'},b-.38);}`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.75,ease:'power2.inOut'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Rajdhani,sans-serif;font-weight:700;font-size:60px;line-height:1.28;color:#EDE3D6;text-shadow:0 3px 12px rgba(0,0,0,.9),0 0 3px rgba(0,0,0,.9)}
.w{display:inline-block;margin:0 .12em;padding:0 .1em;border-radius:.1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#EDE3D6",backgroundColor:"rgba(224,137,74,0)",y:0},{color:"#120A04",backgroundColor:"rgba(255,170,80,1)",y:-4,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFC47A",backgroundColor:"rgba(224,137,74,0)",y:0,duration:.16},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:10,filter:"blur(4px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Dzulqarnain Tembok Besi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
