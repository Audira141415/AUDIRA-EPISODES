// EP20 SYU'AIB, TIMBANGAN MADYAN. ISLAMICDOCUMENTARY: warm golden-hour documentary of an ancient caravan market (Madyan),
// arabesque 8-point-star geometry, dome and arch silhouettes, dust motes. Panels are dark umber documentary cards with a
// double gold rule and star corner ornaments (Marcellus titles, Source Sans 3 text, Amiri Arabic).
// Transition: an arabesque star iris. Each card opens from its centre through an expanding 8-point star (a gold star outline
// rides the iris edge) and closes back into the star. Arabic is read verbatim from the verse file. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2a1a10", GOLD = "#D9A64A", CREAM = "#F6E9D0", UMBER = "rgba(26,17,10,.88)", INK = "#1A1009";

const QF = readFileSync("../_research/quran/EP20_syuaib.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
// QS 11:85, first clause (bounded by the pause mark): "Penuhilah takaran dan timbangan dengan adil"
const V1185 = verse("11:85").split(" ۖ ")[0];
const V831 = verse("83:1");
if (!V1185.endsWith("بِٱلْقِسْطِ")) throw new Error("11:85 clause cut wrong: " + V1185);

// 8-point star polygon for the iris: 16 vertices, radius var(--s) px around the card centre
const STAR = Array.from({ length: 16 }, (_, k) => {
  const a = k * Math.PI / 8 - Math.PI / 2, rr = k % 2 ? 0.7654 : 1;
  const cx = (Math.cos(a) * rr).toFixed(4), cy = (Math.sin(a) * rr).toFixed(4);
  return `calc(50% + var(--s) * ${cx}px) calc(50% + var(--s) * ${cy}px)`;
}).join(",");
const starPts = (R, cx = 0, cy = 0, rot = 0) => Array.from({ length: 16 }, (_, k) => { const a = rot + k * Math.PI / 8 - Math.PI / 2, rr = k % 2 ? R * 0.7654 : R; return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; }).join(" ");
const starSvg = (stroke, sw) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-510 -510 1020 1020"><polygon points="${starPts(500)}" fill="none" stroke="${stroke}" stroke-width="${sw}"/><polygon points="${starPts(470)}" fill="none" stroke="${stroke}" stroke-width="${sw / 2.5}" opacity=".6"/></svg>`)}`;
const cornerSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 40 40"><polygon points="${starPts(18)}" fill="none" stroke="${GOLD}" stroke-width="2.4"/><polygon points="${starPts(7)}" fill="${GOLD}"/></svg>`)}`;
// girih-style overlay (8-point stars on a lattice), drawn once as an inline SVG
let geo = "";
for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
  const cx = x * 180 + (y % 2 ? 90 : 0), cy = y * 180;
  geo += `<polygon points="${starPts(70, cx, cy)}"/><polygon points="${starPts(32, cx, cy, Math.PI / 8)}"/><path d="M${cx + 70} ${cy}L${cx + 110} ${cy}M${cx} ${cy + 70}L${cx} ${cy + 110}"/>`;
}
const GEO = `<svg viewBox="-640 -640 1280 1280" width="1280" height="1280"><g fill="none" stroke="${GOLD}" stroke-width="2.2">${geo}</g></svg>`;

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;
const miniScale = (tilt, leftLbl, rightLbl, heavy) => {
  const a = tilt * Math.PI / 180, L = 62, cx = 90, cy = 30;
  const lx = cx - L * Math.cos(a), ly = cy - L * Math.sin(a), rx = cx + L * Math.cos(a), ry = cy + L * Math.sin(a);
  const pan = (x, y, full) => `<path d="M${x} ${y}L${x - 22} ${y + 36}M${x} ${y}L${x + 22} ${y + 36}" stroke="${GOLD}" stroke-width="2"/><path d="M${x - 26} ${y + 36}Q${x} ${y + 52} ${x + 26} ${y + 36}Z" fill="${GOLD}"/>${full ? `<path d="M${x - 18} ${y + 36}Q${x} ${y + 18} ${x + 18} ${y + 36}Z" fill="#E8C47A"/>` : `<circle cx="${x}" cy="${y + 33}" r="5" fill="#E8C47A"/>`}`;
  return `<svg class="ms" viewBox="-26 -14 232 136"><path d="M${cx} ${cy}L${cx} 112M${cx - 24} 112L${cx + 24} 112" stroke="${GOLD}" stroke-width="4"/><path d="M${lx} ${ly}L${rx} ${ry}" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="${CREAM}"/>${pan(lx, ly, heavy === "l")}${pan(rx, ry, heavy === "r")}<text x="${lx}" y="${ly - 8}" text-anchor="middle" font-size="13" font-family="Source Sans 3" font-weight="700" fill="${CREAM}">${leftLbl}</text><text x="${rx}" y="${ry - 8}" text-anchor="middle" font-size="13" font-family="Source Sans 3" font-weight="700" fill="${CREAM}">${rightLbl}</text></svg>`;
};

const html = `
<div id="geo">${GEO}</div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k">KISAH DALAM AL-QUR'AN &middot; 20</div>
    <div class="h">TIMBANGAN MADYAN</div>
    <div class="sub" data-at="s1:timbangan" data-fx="rise">Kejahatan terbesar terjadi di atas timbangan pasar</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Nabi">
  <div class="card">
    <div class="k">PENDUDUK MADYAN ${ref("QS 11:84")}</div>
    <div class="h m">Hidup makmur dan ramai berdagang</div>
  </div>
</div>
<div class="p" data-in="s2:Nabi" data-out="s3">
  <div class="card">
    <div class="k">PESAN UNTUK MADYAN ${ref("QS 7:85")}</div>
    <div class="h m">Nabi Syu'aib diutus</div>
    <div class="ls">
      <span data-at="s2:sembahlah" data-fx="rise">Sembahlah Allah</span>
      <span data-at="s2:jangan" data-fx="rise">Jangan kurangi takaran dan timbangan</span>
    </div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Sisa">
  <div class="card">
    <div class="k">SERUAN NABI SYU'AIB ${ref("QS HUD 11:85")}</div>
    <div class="ar">${V1185}</div>
    <div class="tr">&ldquo;Penuhilah takaran dan timbangan dengan adil&rdquo;</div>
    <div class="ln" data-at="s3:Jangan" data-fx="rise">Jangan rugikan hak orang lain</div>
  </div>
</div>
<div class="p" data-in="s3:Sisa" data-out="s4">
  <div class="card">
    <div class="k">SISA YANG HALAL ${ref("QS 11:86")}</div>
    <div class="qt">&ldquo;Sisa yang halal dari Allah lebih baik bagimu.&rdquo;</div>
    <div class="seal" data-at="s3:surah" data-fx="pop">SURAH HUD &middot; AYAT 85&ndash;86</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Bagi">
  <div class="card">
    <div class="k">JAWAB MEREKA ${ref("QS 11:87")}</div>
    <div class="qt">&ldquo;Apakah agamamu melarang kami mengelola harta sesuka kami?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Bagi" data-out="s5">
  <div class="card">
    <div class="k">CARA PIKIR MEREKA</div>
    <div class="h m">Curang di timbangan: &ldquo;urusan pribadi&rdquo;</div>
    <div class="strike" data-at="s4:bukan" data-fx="rise"><s>bukan urusan agama</s></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Syu'aib">
  <div class="card">
    <div class="k">ANCAMAN ${ref("QS 11:91")}</div>
    <div class="qt">&ldquo;Kalau bukan karena keluargamu, kami sudah merajammu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Syu'aib" data-out="s6">
  <div class="card">
    <div class="k">JAWAB NABI SYU'AIB ${ref("QS 11:92")}</div>
    <div class="qt">&ldquo;Apakah keluargaku lebih terhormat bagimu daripada Allah?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Saat">
  <div class="card">
    <div class="k">TUNGGULAH ${ref("QS 11:93")}</div>
    <div class="qt">&ldquo;Berbuatlah menurut kemampuanmu, dan tunggulah.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6:Saat" data-out="s6:Yang">
  <div class="card">
    <div class="k">KEPUTUSAN DATANG ${ref("QS 11:94")}</div>
    <div class="h m">Syu'aib dan orang-orang beriman diselamatkan</div>
  </div>
</div>
<div class="p" data-in="s6:Yang" data-out="s7">
  <div class="card">
    <div class="k">SUARA YANG MENGGUNTUR ${ref("QS 11:94-95")}</div>
    <div class="h m">Yang zalim dibinasakan</div>
    <div class="sub" data-at="s6:seolah" data-fx="rise">seolah mereka tidak pernah tinggal di sana</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k">SURAH AL-MUTHAFFIFIN ${ref("QS 83:1-3")}</div>
    <div class="ar c">${V831}</div>
    <div class="tr c" data-at="s7:celakalah" data-fx="rise">&ldquo;Celakalah orang-orang yang curang&rdquo;</div>
    <div class="split" data-at="s7:Minta" data-fx="rise">
      <div class="half">${miniScale(-14, "MEREKA", "ORANG LAIN", "l")}<b>MENERIMA</b><span>minta dicukupkan</span></div>
      <div class="half b">${miniScale(14, "ORANG LAIN", "MEREKA", "r")}<b>MENAKAR</b><span>dikurangi</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k">PELAJARAN</div>
    <div class="h m">Timbangan yang jujur adalah ibadah.</div>
    <div class="ask" data-at="s8:pekerjaanmu" data-fx="rise">Di pekerjaanmu, timbangan apa yang harus kamu jaga?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(26,17,10,0),rgba(26,17,10,.38) 45%,rgba(26,17,10,.38) 70%,rgba(26,17,10,0))}
#chip{background:rgba(26,17,10,.72);padding:5px 12px 4px;border:1px solid rgba(217,166,74,.6);font-size:19px;letter-spacing:.07em}
#geo{position:absolute;left:-100px;top:120px;width:1280px;height:1280px;z-index:6;opacity:0;pointer-events:none;
 -webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0,rgba(0,0,0,.6) 38%,transparent 66%);mask-image:radial-gradient(circle at 50% 50%,#000 0,rgba(0,0,0,.6) 38%,transparent 66%)}
.p{--s:1100}
.p:after{content:"";position:absolute;left:50%;top:50%;width:1000px;height:1000px;margin:-500px 0 0 -500px;pointer-events:none;
 background:url("${starSvg(GOLD, 9)}") center/contain no-repeat;transform:scale(calc(var(--s) / 500)) rotate(calc(var(--s) * .04deg));opacity:calc(1 - var(--s) / 900)}
.card{position:relative;background:${UMBER};padding:26px 34px 28px;border:1.5px solid ${GOLD};
 box-shadow:inset 0 0 0 7px rgba(26,17,10,.0),inset 0 0 0 8.5px rgba(217,166,74,.45),0 22px 46px rgba(0,0,0,.45);clip-path:polygon(${STAR})}
.card:before,.card:after{content:"";position:absolute;width:34px;height:34px;background:url("${cornerSvg}") center/contain no-repeat}
.card:before{left:-17px;top:-17px}.card:after{right:-17px;bottom:-17px}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:25px;letter-spacing:.16em;color:${GOLD};margin-bottom:10px}
.h{font-family:Marcellus,serif;font-weight:400;font-size:74px;line-height:1.04;color:${CREAM};letter-spacing:.02em}
.h.m{font-size:54px;line-height:1.12;letter-spacing:.01em}
.sub{font-family:"Source Sans 3",sans-serif;font-weight:600;font-size:36px;line-height:1.22;color:#E9D3A8;margin-top:12px}
.qt{font-family:Marcellus,serif;font-size:50px;line-height:1.16;color:${CREAM}}
.tr{font-family:"Source Sans 3",sans-serif;font-weight:500;font-style:italic;font-size:33px;line-height:1.3;color:#E9D3A8;margin-top:4px}
.tr.c,.ar.c{text-align:center}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:60px;line-height:1.7;color:#F1D9A0}
.rf{display:inline-block;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:23px;letter-spacing:.06em;color:${INK};background:${GOLD};padding:4px 12px 3px;white-space:nowrap}
.ls{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.ls span{font-family:Marcellus,serif;font-size:46px;line-height:1.12;color:${CREAM};padding-left:48px;position:relative}
.ls span:before{content:"";position:absolute;left:0;top:.2em;width:30px;height:30px;background:url("${cornerSvg}") center/contain no-repeat}
.ln{font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:38px;color:${CREAM};margin-top:14px;padding-top:12px;border-top:1px solid rgba(217,166,74,.45)}
.seal{display:inline-block;margin-top:16px;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:26px;letter-spacing:.14em;color:${GOLD};border:2px solid ${GOLD};padding:8px 16px 6px}
.strike{margin-top:14px;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:40px;color:#E9D3A8}
.strike s{text-decoration-color:#E0603A;text-decoration-thickness:5px}
.split{display:flex;gap:16px;margin-top:14px}
.half{flex:1;display:flex;flex-direction:column;align-items:center;border:1px solid rgba(217,166,74,.55);padding:10px 8px 12px;background:rgba(217,166,74,.08)}
.half .ms{width:250px;height:166px}
.half b{font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:28px;letter-spacing:.14em;color:${GOLD};margin-top:2px}
.half span{font-family:Marcellus,serif;font-size:36px;color:${CREAM}}
.ask{display:inline-block;margin-top:16px;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:38px;line-height:1.18;color:${INK};background:${GOLD};padding:10px 18px}
#outro{--s:0;clip-path:polygon(${STAR})}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:perang", "s1:timbangan", "s1:sedikit", "s1:sedikit#2", "s1:setiap",
  "s2:ramai", "s2:Nabi", "s2:Syu'aib", "s2:mereka", "s2:sembahlah", "s2:timbangan",
  "s3:Penuhilah", "s3:adil", "s3:Sisa", "s3:bagimu", "s3:surah",
  "s4:apakah", "s4:Bagi", "s5:mengancam", "s5:merajammu", "s5:Syu'aib", "s5:Allah",
  "s6:berbuatlah", "s6:tunggulah", "s6:Saat", "s6:diselamatkan", "s6:Yang", "s6:suara", "s6:seolah", "s6:tinggal",
  "s7:Minta", "s8:pekerjaanmu", "s8:Kisah", "s8:AUDIRA"];
// girih overlay strength per scene (stronger behind verses), as [time, opacity] keys
const { AT, K } = writeWorld(TL, at, {
  ep: "20", bg: BG, vig: 0.42, grain: 0.06, capfloor: 0.38, html, css, signature: "EP20_SYUAIB_TIMBANGAN_MADYAN",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Source Sans 3,sans-serif", chipColor: CREAM,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:18,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.45,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--s':0,opacity:1},{'--s':1100,duration:.62,ease:'power2.in'},a-.16);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--s':0,duration:.42,ease:'power2.out'},b-.44);}`,
  outroIn: `tl.fromTo('#outro',{'--s':0},{'--s':1500,duration:.9,ease:'power2.in'},OUT-.2);`,
  hud: `(()=>{const g=q('#geo');const KS=[[0,0],[K.s2,.0],[K.s2+1,.07],[K.s3-.4,.07],[K.s3+.4,.17],[K.s4-.4,.15],[K.s4+.4,.04],[K.s7-.4,.04],[K.s7+.5,.13],[K.s8-.3,.1],[K.s8+.6,.15],[OUT-.2,.15],[OUT,0],[DUR,0]];
return (t)=>{let i=0;while(i<KS.length-2&&KS[i+1][0]<=t)i++;const a=KS[i],b=KS[i+1],u=Math.min(1,Math.max(0,(t-a[0])/Math.max(.001,b[0]-a[0])));g.style.opacity=a[1]+(b[1]-a[1])*u;g.style.transform='rotate('+(t*.6).toFixed(2)+'deg) scale('+(1+t*.0015).toFixed(4)+')';};})()`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"Source Sans 3",sans-serif;font-weight:700;font-size:54px;line-height:1.32;color:${CREAM};background:rgba(26,17,10,.9);padding:8px 20px 10px;border-top:2px solid ${GOLD};border-bottom:2px solid ${GOLD};box-shadow:0 10px 26px rgba(0,0,0,.35)}
.w{display:inline-block;margin:0 .06em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(217,166,74,0)"},0);tl.set("#${id}",{color:"${INK}",backgroundColor:"rgb(226,176,79)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(217,166,74,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:8},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Timbangan Madyan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
