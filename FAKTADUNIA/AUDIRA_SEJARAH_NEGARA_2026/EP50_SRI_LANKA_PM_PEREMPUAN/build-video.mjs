// EP50 SRI LANKA, PM PEREMPUAN PERTAMA DI DUNIA: KINTSUGI. A porcelain vase on a dark wooden table before a black-lacquer
// screen; cracks appear with the life story and fill with raised gold seams. Panels are porcelain cards with a gold rule;
// titles in Cormorant Garamond, dates in IBM Plex Mono.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2B2622", PORC = "#F2EFE8", GOLD = "#D4A63A", TEA = "#6B4F3A", MAROON = "#8D153A", BG = "#1c1612";
const SERIF = `'Cormorant Garamond',Georgia,serif`, MONO = `'IBM Plex Mono',Consolas,monospace`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,700&family=IBM+Plex+Mono:wght@500;600&display=block">
<div class="pre"><span style="font-family:'Cormorant Garamond',serif;font-weight:700">STATESWOMAN</span><span style="font-family:'Cormorant Garamond',serif;font-weight:600">Sirimavo</span><span style="font-family:'Cormorant Garamond',serif;font-weight:700;font-style:italic">janda</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">1960</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:600">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Namanya">
  ${kk("EP 50", "FAKTA SEJARAH NEGARA")}
  <div class="h1">PM PEREMPUAN<br><em>PERTAMA</em> DI DUNIA</div>
  <div class="sub"><i class="yr" data-at="s1:1960" data-fx="stampc">1960</i><span class="sl" data-at="s1:Sri" data-fx="card">SRI LANKA</span></div>
</div>
<div class="p" data-in="s2:Namanya" data-out="s3">
  ${kk("01", "CEYLON")}
  ${row("Sirimavo Bandaranaike", "1916–2000 · istri Perdana Menteri Ceylon", "s2:Sirimavo", "nm")}
  ${row("CEYLON = SRI LANKA", "nama lama negara pulau ini", "s2:nama", "mr")}
  ${row("PENASIHAT INFORMAL", "fokus membantu perempuan di desa", "s2:penasihat")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "DUKA")}
  ${row("25 SEPTEMBER 1959", "suaminya, sang perdana menteri, ditembak dan meninggal", "s3:September", "dt")}
  ${row("PARTAI GOYAH", "Sirimavo dibujuk untuk memimpin", "s3:goyah", "gy")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "DILANTIK")}
  ${row("21 JULI 1960", "partainya menang telak", "s4:Juli", "dt gd")}
  ${row("PM PEREMPUAN PERTAMA DI DUNIA", "", "s4:pertama", "nm")}
  ${row("+ MENTERI PERTAHANAN &amp; LUAR NEGERI", "", "s4:pertahanan", "sm")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "KATA BARU")}
  ${row("PERS INGGRIS BINGUNG", "statesman = negarawan laki-laki", "s5:Pers", "sm")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "TIGA KALI PM")}
  <div class="terms" data-at="s6:tiga" data-fx="card"><i>1960–65</i><i class="t2" data-at="s6:tiga+0.8" data-fx="pop">1970–77</i><i class="t3" data-at="s6:2000-0.3" data-fx="pop">1994–2000</i></div>
  ${row("MEI 1972", "Ceylon resmi menjadi Republik Sri Lanka", "s6:1972", "dt mr")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "IBU DAN PUTRI")}
  ${row("1994 · CHANDRIKA KUMARATUNGA", "presiden perempuan pertama Sri Lanka", "s7:Chandrika", "sm")}
  ${row("MENGANGKAT IBUNYA JADI PM", "", "s7:mengangkat", "sm gd")}
  ${row("10 OKTOBER 2000", "Sirimavo wafat, setelah memberi suara di pemilu", "s7:Oktober", "dt gy")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "KINTSUGI")}
  ${row("DARI DUKA, MENJADI SEJARAH DUNIA", "", "s8:Dari", "nm")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Siapa perempuan pemimpin yang paling menginspirasimu? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(242,239,232,.95);border-radius:6px;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:24px;letter-spacing:.1em;color:#F2EFE8;margin-bottom:14px;padding:7px 18px 7px 7px;background:rgba(20,15,11,.78);border-radius:6px;border-bottom:4px solid ${GOLD}}
.kk i{font-style:normal;background:${GOLD};color:${INK};padding:3px 10px;border-radius:3px}
.h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:90px;line-height:.92;letter-spacing:.005em;color:#FBF6EC;text-shadow:0 6px 26px rgba(0,0,0,.75)}
.h1 em{font-style:normal;color:#E8B954}
.sub{display:flex;align-items:center;gap:18px;margin-top:20px}
.yr{font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:62px;line-height:1;color:${INK};background:linear-gradient(135deg,#f3d27e,#c8922e);padding:10px 22px 8px;border-radius:6px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.5)}
.sl{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:36px;letter-spacing:.12em;color:#F2EFE8;padding:8px 18px;border:3px solid ${MAROON};background:rgba(141,21,58,.55);border-radius:6px}
.row{flex-direction:column;margin-top:12px;padding:10px 24px 12px 24px;border-left:12px solid ${GOLD};max-width:920px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:60px;line-height:1.02;color:${INK}}
.row span{display:block;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.32;color:#6B4F3A;max-width:840px}
.row.dt b{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:58px;letter-spacing:-.01em}
.row.gd b{color:#9A6A12}
.row.mr{border-left-color:${MAROON}}
.row.gy{border-left-color:#7d7369}
.row.sm b{font-size:48px}
.row.nm b{font-size:64px}
.terms{display:flex;gap:12px;padding:12px;background:rgba(20,15,11,.78)!important;width:max-content;border-radius:6px}
.terms i{font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:40px;color:${INK};background:linear-gradient(135deg,#f3d27e,#c8922e);padding:10px 16px 8px;border-radius:4px}
.q{margin-top:20px;padding:16px 26px 16px;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:62px;line-height:1.04;color:${INK};border-left:12px solid ${GOLD};max-width:880px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP50_SRI_LANKA_PM_PEREMPUAN",
  ep: "50", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.0, html, css, chipFont: MONO, chipColor: "#E8D9B8",
  chip: "ILUSTRASI KINTSUGI &middot; BUKAN POTRET TOKOH",
  extraAt: ["s1:kata", "s1:1960", "s1:Sri", "s2:Namanya", "s2:Sirimavo", "s2:Ceylon", "s2:nama", "s2:penasihat", "s2:desa",
    "s3:September", "s3:1959", "s3:ditembak", "s3:goyah", "s3:dibujuk",
    "s4:Juli", "s4:1960", "s4:menang", "s4:dilantik", "s4:pertama", "s4:pertahanan",
    "s5:Lawan", "s5:janda", "s5:Pers", "s5:statesman", "s5:berarti", "s5:baru", "s5:stateswoman",
    "s6:tiga", "s6:2000", "s6:keduanya", "s6:1972", "s6:Republik",
    "s7:1994", "s7:Chandrika", "s7:presiden", "s7:mengangkat", "s7:ibunya", "s7:Oktober", "s7:suara",
    "s8:Dari", "s8:sejarah", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:e.classList.contains('sl')?'inline-block':'flex'},t);tl.fromTo(e,{opacity:0,y:18},{opacity:1,y:0,duration:.4,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.7,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-26},{opacity:1,y:0,duration:.38,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-22,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:58px;line-height:1.1;letter-spacing:-.02em;color:#fff;-webkit-text-stroke:10px #1a120c;paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.6)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"#F0C25A",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sri Lanka PM Perempuan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
