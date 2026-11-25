// EP14 THALUT, UJIAN SUNGAI. HD2D: pixel-art sprites in a tilt-shift 3D diorama, warm low sun, bloom.
// Panels are JRPG message windows (deep indigo, cream pixel border, notched corners). They arrive and leave with a
// pixel dissolve: a 96 px tile of 8x8 blocks switches on in a seeded order. Reveals inside panels use the same dissolve.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2a2440", GOLD = "#F2C14E", CREAM = "#F3E2B4", INK = "#21161C", TEAL = "#7FD3D8";

// Arabic is cut programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP14_thalut_jalut.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const words = (v, i, j) => v.split(" ").slice(i, j + 1).join(" ");          // a bounded phrase, by word index
const V248 = verse("2:248"), V249 = verse("2:249"), V250 = verse("2:250");
const SAKINAH = words(V248, 9, 12);   // fihi sakinatun min rabbikum
const FIAH = words(V249, 51, 59);     // kam min fi'atin qalilatin ... bi-idhnillah
const DOA = words(V250, 5, 10);       // rabbana afrigh 'alayna sabran wa thabbit aqdamana
for (const [v, ph] of [[V248, SAKINAH], [V249, FIAH], [V250, DOA]]) if (!v.includes(ph) || ph.includes("ۖ") || ph.includes("ۗ")) throw new Error("phrase bound");

// Pixel icons for panels: same part format as the world sprites, drawn as crisp SVG rects with a dark outline.
const svgPix = (w, h, parts, s = 5, cls = "ic") => {
  let o = "", f = "";
  for (const p of parts) { if (!p[5]) o += `<rect x="${p[0] - 1}" y="${p[1] - 1}" width="${p[2] + 2}" height="${p[3] + 2}" fill="${INK}"/>`; f += `<rect x="${p[0]}" y="${p[1]}" width="${p[2]}" height="${p[3]}" fill="${p[4]}"/>`; }
  return `<svg class="${cls}" viewBox="-1 -1 ${w + 2} ${h + 2}" width="${(w + 2) * s}" height="${(h + 2) * s}" shape-rendering="crispEdges">${o}${f}</svg>`;
};
const ICROWN = svgPix(12, 10, [[1, 3, 10, 6, GOLD], [1, 1, 2, 3, GOLD], [5, 0, 2, 4, GOLD], [9, 1, 2, 3, GOLD], [1, 7, 10, 2, "#c98a2a"], [5, 4, 2, 2, "#d8463a"], [2, 4, 1, 1, "#fff2b0"]]);
const ISCROLL = svgPix(14, 10, [[2, 1, 10, 8, "#f3e2b4"], [0, 0, 3, 10, "#d6b878"], [11, 0, 3, 10, "#d6b878"], [4, 3, 6, 1, "#7a5a3a"], [4, 5, 6, 1, "#7a5a3a"], [4, 7, 4, 1, "#7a5a3a"]]);
const IARM = svgPix(12, 12, [[0, 7, 7, 4, "#d9a477"], [2, 5, 4, 3, "#e8b88a"], [6, 2, 4, 8, "#d9a477"], [5, 0, 5, 3, "#c99467"], [1, 10, 6, 1, "#b98260"]]);
const IDROP = svgPix(8, 11, [[3, 0, 2, 2, TEAL], [2, 2, 4, 2, TEAL], [1, 4, 6, 5, TEAL], [2, 9, 4, 1, "#4fa6b0"], [2, 5, 1, 2, "#e8fbff"]]);
const IHAND = svgPix(14, 9, [[1, 3, 12, 4, "#d9a477"], [0, 1, 2, 3, "#d9a477"], [12, 1, 2, 3, "#d9a477"], [2, 7, 10, 1, "#b98260"], [4, 3, 6, 2, TEAL], [5, 3, 2, 1, "#e8fbff"]]);
const ICHEST = svgPix(16, 11, [[1, 3, 14, 8, "#e0a93a"], [0, 1, 16, 3, "#f2c14e"], [1, 6, 14, 1, "#a8701e"], [7, 4, 2, 3, "#fff4c0"], [0, 0, 16, 1, "#ffe08a"]]);

// Pixel dissolve masks: 8x8 block tile (12 px blocks), revealed in a seeded order over 8 steps.
const ord = (() => { let a = 1414; const r = () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; const o = [...Array(64).keys()]; for (let i = 63; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; })();
const rank = []; ord.forEach((cell, k) => { rank[cell] = k; });
let maskCss = "";
for (let d = 1; d <= 7; d++) {
  let rects = "";
  for (let c = 0; c < 64; c++) if (rank[c] < d * 8) rects += `<rect x='${(c % 8) * 12}' y='${Math.floor(c / 8) * 12}' width='12' height='12'/>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' shape-rendering='crispEdges'>${rects}</svg>`)}")`;
  maskCss += `[data-d="${d}"]{-webkit-mask-image:${url};mask-image:${url}}\n`;
}

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="hop"` : ""}>${r}</span>`;
const meter = `<div class="meter">${[...Array(40).keys()].map((k) => `<i id="m${k}"></i>`).join("")}</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 14</div>
    <div class="h">UJIAN<br>SEBUAH SUNGAI</div>
    <div class="row" data-at="s1:minum" data-fx="pix">${IDROP}<span class="bad">MINUM SEPUASNYA</span><span class="t">tidak boleh ikut</span></div>
    <div class="row" data-at="s1:sedikit" data-fx="pix"><span class="good">YANG LOLOS</span><span class="t">hanya sedikit</span>${ref("QS 2:249")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Allah" data-d="8">
  <div class="card">
    <div class="k">SETELAH MASA MUSA ${ref("QS 2:246", "s2:pemuka")}</div>
    <div class="h m">Bani Israil meminta seorang raja</div>
    <div class="sub" data-at="s2:nabi" data-fx="pix">kepada nabi mereka</div>
  </div>
</div>
<div class="p" data-in="s2:Allah" data-out="s3" data-d="8">
  <div class="card">
    <div class="k">ALLAH MENGANGKAT ${ref("QS 2:247")}</div>
    <div class="h">THALUT</div>
    <div class="row" data-at="s2:protes" data-fx="pix"><span class="bad">PROTES</span><span class="qt">&ldquo;Dia tidak kaya.&rdquo;</span></div>
    <div class="row" data-at="s2:kelebihan" data-fx="pix"><span class="t">kelebihan</span><span class="chipi" data-at="s2:ilmu" data-fx="hop">${ISCROLL}ILMU</span><span class="chipi" data-at="s2:fisik" data-fx="hop">${IARM}FISIK</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4" data-d="8">
  <div class="card">
    <div class="k">TANDA KERAJAAN ${ref("QS 2:248", "s3:Tanda")}</div>
    <div class="row top">${ICHEST}<span class="h m">TABUT</span></div>
    <div class="ar" data-at="s3:berisi" data-fx="pix">${SAKINAH}</div>
    <div class="ls"><span data-at="s3:ketenangan" data-fx="pix">ketenangan dari Tuhan</span><span data-at="s3:peninggalan" data-fx="pix">peninggalan keluarga Musa dan Harun</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5" data-d="8">
  <div class="card">
    <div class="k">THALUT BERKATA ${ref("QS 2:249", "s4:berkata")}</div>
    <div class="qt big" data-at="s4:Allah" data-fx="pix">&ldquo;Allah akan menguji kalian dengan sebuah sungai.&rdquo;</div>
    <div class="row" data-at="s4:meminumnya" data-fx="pix">${IDROP}<span class="bad">MEMINUMNYA</span><span class="t">bukan pengikutku</span></div>
    <div class="row" data-at="s4:kecuali" data-fx="pix">${IHAND}<span class="good">KECUALI</span><span class="t">seciduk dengan tangan</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Melihat" data-d="8">
  <div class="card">
    <div class="k">DI TEPI SUNGAI ${ref("QS 2:249")}</div>
    ${meter}
    <div class="row" data-at="s5:minum" data-fx="pix"><span class="bad">HAMPIR SEMUA MINUM</span></div>
    <div class="row" data-at="s5:sebagian" data-fx="pix"><span class="good">SEBAGIAN KECIL</span><span class="t">menahan diri dan menyeberang</span></div>
  </div>
</div>
<div class="p" data-in="s5:Melihat" data-out="s6" data-d="8">
  <div class="card slim">
    <div class="k">PASUKAN JALUT</div>
    <div class="h s">Melihat besarnya pasukan Jalut</div>
    <div class="qt" data-at="s5:kami" data-fx="pix">&ldquo;Kami tidak kuat hari ini.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7" data-d="8">
  <div class="card">
    <div class="k">YANG YAKIN MENJAWAB ${ref("QS 2:249")}</div>
    <div class="ar big">${FIAH}</div>
    <div class="id" data-at="s6:betapa" data-fx="pix">Betapa banyak kelompok kecil mengalahkan kelompok besar dengan izin Allah.</div>
    <div class="sub" data-at="s6:bersama" data-fx="pix">Allah bersama orang-orang yang sabar.</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Lalu" data-d="8">
  <div class="card">
    <div class="k">MEREKA BERDOA ${ref("QS 2:250")}</div>
    <div class="ar">${DOA}</div>
    <div class="ls"><span data-at="s7:limpahkan" data-fx="pix">Limpahkan kesabaran</span><span data-at="s7:kokohkan" data-fx="pix">Kokohkan langkah kami</span></div>
  </div>
</div>
<div class="p" data-in="s7:Lalu" data-out="s8" data-d="8">
  <div class="card">
    <div class="k">DENGAN IZIN ALLAH ${ref("QS 2:251")}</div>
    <div class="h m" data-at="s7:menang" data-fx="pix">MEREKA MENANG</div>
    <div class="row" data-at="s7:Dawud" data-fx="pix"><span class="t">Dawud mengalahkan Jalut</span></div>
    <div class="row" data-at="s7:Kelak" data-fx="pix"><span class="t">diberi</span><span class="chipi" data-at="s7:kerajaan" data-fx="hop">${ICROWN}KERAJAAN</span><span class="chipi" data-at="s7:hikmah" data-fx="hop">${ISCROLL}HIKMAH</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="s8:Kisah" data-d="8">
  <div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h s">Kemenangan besar dimulai dari menahan diri pada hal kecil.</div>
    <div class="row" data-at="s8:seperti" data-fx="pix">${IDROP}<span class="t">seperti seteguk air</span></div>
    <div class="ask" data-at="s8:Kalau" data-fx="pix">Kamu minum, atau menahan diri?</div>
  </div>
</div>
<div class="p" data-in="s8:Kisah" data-out="@END" data-d="8">
  <div class="card slim sign">
    <div class="k">KISAH DALAM AL-QUR'AN</div>
    <div class="h s">bersama AUDIRA</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(20,16,36,0),rgba(20,16,36,.55) 40%,rgba(20,16,36,.55) 72%,rgba(20,16,36,0))}
[data-d]{-webkit-mask-size:96px 96px;mask-size:96px 96px;-webkit-mask-repeat:repeat;mask-repeat:repeat}
${maskCss}
.card{position:relative;background:linear-gradient(180deg,rgba(38,33,82,.94),rgba(20,18,46,.94));padding:24px 30px 26px;
 box-shadow:-6px 0 0 0 ${CREAM},6px 0 0 0 ${CREAM},0 -6px 0 0 ${CREAM},0 6px 0 0 ${CREAM},inset 0 0 0 4px #4a4290,inset 0 0 0 7px rgba(10,8,24,.6)}
.card.slim{padding:20px 28px 22px}
.card.sign{text-align:center}
.k{display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-family:"Press Start 2P",monospace;font-size:20px;line-height:1.4;letter-spacing:.02em;color:${GOLD};margin-bottom:14px}
.card.sign .k{justify-content:center}
.h{font-family:"Pixelify Sans",sans-serif;font-weight:700;font-size:78px;line-height:1.0;color:#FFF6E2;text-shadow:5px 5px 0 #120f2a}
.h.m{font-size:56px;line-height:1.05}
.h.s{font-size:44px;line-height:1.12}
.sub{font-family:Nunito,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:${TEAL};margin-top:10px}
.t{font-family:Nunito,sans-serif;font-weight:800;font-size:36px;color:#EDE6F6}
.qt{font-family:Nunito,sans-serif;font-weight:800;font-style:italic;font-size:40px;line-height:1.18;color:#FFF6E2}
.qt.big{font-size:46px;margin-bottom:6px}
.id{font-family:Nunito,sans-serif;font-weight:800;font-size:36px;line-height:1.22;color:#FFF6E2;margin-top:4px}
.row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px}
.row.top{margin-top:0}
.bad,.good{font-family:"Press Start 2P",monospace;font-size:20px;line-height:1.3;padding:8px 10px 6px}
.bad{background:#5a5a78;color:#E8E8F4}
.good{background:${GOLD};color:${INK}}
.rf{display:inline-block;font-family:"Press Start 2P",monospace;font-size:14px;color:${INK};background:${CREAM};padding:6px 8px 5px;white-space:nowrap;box-shadow:3px 3px 0 #120f2a}
.chipi{display:inline-flex;align-items:center;gap:10px;font-family:"Press Start 2P",monospace;font-size:20px;color:${INK};background:${CREAM};padding:6px 12px 6px 8px;box-shadow:4px 4px 0 #120f2a}
.ic{display:block;flex:none}
.chipi .ic{width:48px;height:auto}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:50px;line-height:1.75;color:#FFE7A8;text-shadow:3px 3px 0 #120f2a;margin:2px 0 4px}
.ar.big{font-size:56px}
.ls{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.ls span{font-family:Nunito,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:#EDE6F6;padding-left:32px;position:relative}
.ls span:before{content:"";position:absolute;left:0;top:.42em;width:14px;height:14px;background:${GOLD};box-shadow:3px 3px 0 #120f2a}
.meter{display:grid;grid-template-columns:repeat(20,1fr);gap:6px;margin:4px 0 4px}
.meter i{display:block;height:30px;background:#E9C77A;box-shadow:inset -4px -4px 0 rgba(0,0,0,.22)}
.ask{display:inline-block;margin-top:16px;font-family:"Pixelify Sans",sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:${INK};background:${GOLD};padding:10px 18px;box-shadow:5px 5px 0 #120f2a}
`;

// HUD: the 40-cell meter. Almost every cell turns grey on "minum"; a few stay lit and glow on "menyeberang".
const hud = `(t)=>{const L=[3,11,17,24,30,36];const e0=document.getElementById('m0');if(!e0)return;
const tg=AT['s5:minum']-.5,tc=AT['s5:menyeberang'];
for(let k=0;k<40;k++){const e=document.getElementById('m'+k);const lit=L.includes(k);
 const g=!lit&&t>tg+((k*7)%40)*.022;const glow=lit&&t>tc;
 e.style.background=g?'#4a4866':glow?'#FFE08A':'#E9C77A';e.style.boxShadow=glow?'0 0 12px 3px rgba(255,210,110,.85),inset -4px -4px 0 rgba(0,0,0,.18)':'inset -4px -4px 0 rgba(0,0,0,.22)';}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
mkdirSync("PROJECT/HyperFrames_Remotion/assets/audio", { recursive: true });
mkdirSync("PROJECT/HyperFrames_Remotion/compositions", { recursive: true });
const WORLD_AT = ["s1:minum", "s1:tidak", "s1:sedikit", "s2:Allah", "s2:Thalut", "s2:protes", "s2:Jawab", "s2:ilmu", "s2:fisik",
  "s3:Tabut", "s3:ketenangan", "s3:peninggalan", "s4:sungai", "s4:menciduk", "s4:seciduk", "s4:tangan",
  "s5:Hampir", "s5:minum", "s5:menahan", "s5:menyeberang", "s5:Melihat", "s5:Jalut", "s5:kami", "s6:sabar",
  "s7:berdoa", "s7:kokohkan", "s7:Dawud", "s7:mengalahkan", "s7:kerajaan", "s7:hikmah", "s8:seteguk", "s8:Kalau", "s8:Kisah"];
const STEP = 0.045;
const { AT, K } = writeWorld(TL, at, {
  ep: "14", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.5, html, css, hud,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Nunito,sans-serif", chipColor: "#FFF6E2",
  signature: "EP14_THALUT_UJIAN_SUNGAI",
  extraAt: WORLD_AT,
  fxExtra: `pix:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.set(e,{opacity:1,attr:{'data-d':1}},t);for(let k=2;k<=8;k++)tl.set(e,{attr:{'data-d':k}},t+(k-1)*.035);},
 hop:(e,t)=>tl.fromTo(e,{opacity:0,y:18},{opacity:1,y:0,duration:.24,ease:'steps(4)'},t),`,
  // Pixel dissolve: blocks switch on in a seeded order (in), and switch off in reverse (out).
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1,attr:{'data-d':1}},a-.14);for(let k=2;k<=8;k++)tl.set(p,{attr:{'data-d':k}},a-.14+(k-1)*${STEP});}`,
  panelOut: `(tl,p,b)=>{const s=b-.34;for(let k=1;k<=7;k++)tl.set(p,{attr:{'data-d':8-k}},s+(k-1)*${STEP});tl.set(p,{opacity:0},s+7*${STEP});}`,
  outroIn: `gsap.set('#outro',{opacity:0,attr:{'data-d':8}});tl.set('#outro',{opacity:1,attr:{'data-d':1}},OUT-.2);for(let k=2;k<=8;k++)tl.set('#outro',{attr:{'data-d':k}},OUT-.2+(k-1)*.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Nunito,sans-serif;font-weight:900;font-size:58px;line-height:1.3;color:#FFF6E2;text-shadow:3px 3px 0 #120f2a,-2px -2px 0 #120f2a,2px -2px 0 #120f2a,-2px 2px 0 #120f2a,0 0 10px rgba(0,0,0,.6)}
.w{display:inline-block;margin:0 .13em;padding:0 .12em}`,
(id, w) => `tl.set("#${id}",{textShadow:"none"},${w.start.toFixed(3)});tl.set("#${id}",{textShadow:"3px 3px 0 #120f2a,-2px -2px 0 #120f2a,2px -2px 0 #120f2a,-2px 2px 0 #120f2a"},${w.end.toFixed(3)});tl.fromTo("#${id}",{color:"#FFF6E2",backgroundColor:"rgba(242,193,78,0)",boxShadow:"0px 0px 0px rgba(18,15,42,0)",y:0},{color:"#1B1640",backgroundColor:"rgba(242,193,78,1)",boxShadow:"4px 4px 0px rgba(18,15,42,1)",y:-4,duration:.05,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFE08A",backgroundColor:"rgba(242,193,78,0)",boxShadow:"0px 0px 0px rgba(18,15,42,0)",y:0,duration:.1,ease:"steps(2)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.2,ease:"steps(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Thalut Ujian Sungai", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
