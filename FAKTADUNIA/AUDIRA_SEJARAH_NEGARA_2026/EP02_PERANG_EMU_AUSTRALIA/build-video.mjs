// EP02 PERANG EMU. Clay tabletop diorama of the WA wheatbelt; toy soldiers vs clay emus. Panels are paper cards taped
// onto the scene and land with a stop-motion squash. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const OCH = "#C8792E", WHT = "#E8C15A", NEWS = "#EFE6D2", INK = "#2A2118", RED = "#C2381E", ORG = "#FF8A1F";

// Australia outline from Natural Earth (geo.py), Campion district dot at 118.5E 30.9S
const GEO = JSON.parse(readFileSync("geo.js", "utf8").replace(/^export const GEO = /, "").replace(/;\s*$/, ""));
const prj = ([lon, lat]) => [((lon - 112) * 6.2).toFixed(1), ((-lat - 10) * 6.2).toFixed(1)];
const aus = GEO.find((g) => g.name === "Australia").rings.filter((r) => r.length > 25);
const mapPath = aus.map((r) => "M" + r.map((p) => prj(p).join(",")).join("L") + "Z").join("");
const [cx, cy] = prj([118.5, -30.9]);
const map = `<svg class="map" viewBox="0 0 270 215" width="270" height="215"><path d="${mapPath}" fill="${WHT}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="15" fill="none" stroke="${RED}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="6" fill="${RED}"/></svg>`;

const card = (inner, cls = "") => `<div class="card ${cls}"><div class="tape"></div>${inner}</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">${card(`
  <div class="kick">FAKTA SEJARAH NEGARA &middot; EP 02</div>
  <div class="h1">PERANG<br><span>EMU</span></div>
  <div class="row" data-at="s1:1932" data-fx="plop"><b>1932</b><span>Australia Barat: tentara vs burung</span></div>
  <div class="stamp" data-at="s1:menang" data-fx="stampc">PEMENANG: EMU?</div>`)}
</div>
<div class="p" data-in="s2" data-out="s3">${card(`
  <div class="kick">SETELAH PERANG DUNIA I</div>
  <div class="row" data-at="s2:veteran" data-fx="plop"><b>LAHAN</b><span>untuk para veteran di Australia Barat</span></div>
  <div class="row" data-at="s2:Depresi" data-fx="plop"><b>1929</b><span>Depresi Besar</span></div>
  <div class="chart" data-at="s2:harga" data-fx="plop"><div class="ct2">HARGA GANDUM <i>terus jatuh</i></div><svg viewBox="0 0 800 120" width="800" height="120"><polyline class="ln" points="10,18 120,30 210,26 320,52 420,48 520,78 620,74 790,108" fill="none" stroke="${RED}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`)}
</div>
<div class="p" data-in="s3" data-out="s4">${card(`
  <div class="kick">DISTRIK CAMPION &middot; AUSTRALIA BARAT</div>
  <div class="mapwrap" data-at="s3:Kemudian" data-fx="plop">${map}</div>
  <div class="big nb"><b class="ct" data-from="0" data-to="20000" data-a="s3:dua" data-d="1.3" data-pre="&asymp;">0</b></div>
  <div class="lb" data-at="s3:emu" data-fx="plop">EMU BERMIGRASI KE LADANG</div>
  <div class="chips"><i data-at="s3:dimakan" data-fx="plop">TANAMAN DIMAKAN</i><i data-at="s3:dirusak" data-fx="plop">PAGAR RUSAK</i><i data-at="s3:kelinci" data-fx="plop">KELINCI MASUK</i></div>`)}
</div>
<div class="p" data-in="s4" data-out="s5">${card(`
  <div class="kick">PERMINTAAN PARA VETERAN</div>
  <div class="h3">KIRIM SENAPAN MESIN!</div>
  <div class="stamp" data-at="s4:setuju" data-fx="stampc">DISETUJUI</div>
  <div class="row" data-at="s4:Lewis" data-fx="plop"><b>2</b><span>senapan mesin Lewis</span></div>
  <div class="row" data-at="s4:sepuluh" data-fx="plop"><b class="nb">10.000</b><span>butir peluru</span></div>`)}
</div>
<div class="p" data-in="s5" data-out="s5:Senapan">${card(`
  <div class="kick">2 NOVEMBER 1932 &middot; OPERASI DIMULAI</div>
  <div class="row" data-at="s5:berpencar" data-fx="plop"><b>PENCAR</b><span>emu memecah diri jadi kelompok kecil</span></div>
  <div class="row" data-at="s5:seribu" data-fx="plop"><b class="nb">1.000+</b><span>emu mendekat</span></div>
  <div class="jam" data-at="s5:senapannya" data-fx="plop"><b id="jamn" class="nb">0</b><span>EKOR, LALU&hellip;</span><div class="stamp in" data-at="s5:macet" data-fx="stampc">MACET!</div></div>`)}
</div>
<div class="p" data-in="s5:Senapan" data-out="s6">${card(`
  <div class="kick">RENCANA B</div>
  <div class="h3">SENAPAN DIPASANG<br>DI <span>TRUK</span></div>
  <div class="stamp" data-at="s5:kalah" data-fx="stampc">TRUK KALAH CEPAT</div>`)}
</div>
<div class="p" data-in="s6" data-out="s6:Sampai">${card(`
  <div class="mast">KLIPING BERITA &middot; ILUSTRASI</div>
  <div class="hl">PASUKAN KEWALAHAN<br>OLEH BURUNG</div>
  <div class="cols"><i></i><i></i><i></i><i></i><i class="s"></i></div>
  <div class="stamps2"><div class="stamp" data-at="s6:ditarik" data-fx="stampc">DITARIK &middot; 8 NOV</div><div class="stamp gr" data-at="s6:dikirim" data-fx="stampc">DIKIRIM LAGI &middot; 13 NOV</div></div>`, "news")}
</div>
<div class="p" data-in="s6:Sampai" data-out="s7">${card(`
  <div class="kick">10 DESEMBER 1932 &middot; KLAIM MEREDITH</div>
  <div class="duo2">
    <div class="st2" data-at="s6:986" data-fx="plop"><b class="ct nb" data-from="0" data-to="986" data-a="s6:986" data-d="1.2">0</b><span>EMU TEWAS</span></div>
    <div class="st2" data-at="s6:9.860" data-fx="plop"><b class="ct nb" data-from="0" data-to="9860" data-a="s6:9.860" data-d="1.6">0</b><span>PELURU <em>dari 10.000</em></span></div>
  </div>
  <div class="per" data-at="s6:Tepat" data-fx="plop">= <b>10</b> PELURU PER EKOR</div>
  <div class="stamp" data-at="s6:diragukan" data-fx="stampc">DIRAGUKAN SEJARAWAN</div>`)}
</div>
<div class="p" data-in="s7" data-out="s8">${card(`
  <div class="kick">KATA MEREDITH (PARAFRASE)</div>
  <div class="quote" data-at="s7:bilang" data-fx="plop">&ldquo;Emu menghadapi senapan mesin seperti <span>tank</span>.&rdquo;</div>
  <div class="stamp" data-at="s7:ditolak" data-fx="stampc">BANTUAN MILITER DITOLAK</div>
  <div class="row" data-at="s7:pagar" data-fx="plop"><b>PAGAR</b><span>petani beralih ke pagar penghalang</span></div>`)}
</div>
<div class="p" data-in="s8" data-out="@END">${card(`
  <div class="h3">MASALAH ALAM<br><span>JARANG SELESAI<br>DENGAN SENJATA</span></div>
  <div class="lb" data-at="s8:Kalau" data-fx="plop">KALAU KAMU PETANI SAAT ITU:</div>
  <div class="duo"><i data-at="s8:pagar" data-fx="plop">PAGAR?</i><i data-at="s8:tentara" data-fx="plop">TENTARA?</i></div>`)}
</div>`;

const css = `
.card{position:relative;background:${NEWS};border:5px solid ${INK};border-radius:36px;padding:30px 34px 32px;box-shadow:0 12px 0 rgba(42,33,24,.3),0 28px 50px rgba(42,33,24,.32)}
.tape{position:absolute;top:-26px;left:50%;width:210px;height:52px;margin-left:-105px;background:rgba(232,193,90,.85);transform:rotate(-3deg);border-left:4px dashed rgba(42,33,24,.2);border-right:4px dashed rgba(42,33,24,.2)}
.kick{font-family:Nunito,sans-serif;font-weight:900;font-size:29px;letter-spacing:.05em;color:${OCH};margin-bottom:8px}
.h1{font-family:Fredoka,sans-serif;font-weight:700;font-size:160px;line-height:.9;color:${INK};letter-spacing:-.01em}.h1 span{color:${OCH}}
.h3{font-family:Fredoka,sans-serif;font-weight:700;font-size:76px;line-height:1.02;color:${INK}}.h3 span{color:${OCH}}
.row{display:flex;align-items:center;gap:20px;margin-top:16px;padding:10px 20px;background:#FFF8E8;border:4px solid ${INK};border-radius:24px}
.row b{flex:none;font-family:Fredoka,sans-serif;font-weight:700;font-size:58px;line-height:1.05;color:${OCH}}
.row span{font-family:Nunito,sans-serif;font-weight:800;font-size:32px;line-height:1.18;color:${INK}}
.stamp{display:inline-block;margin-top:20px;font-family:Fredoka,sans-serif;font-weight:700;font-size:54px;line-height:1.1;color:${RED};border:7px solid ${RED};border-radius:18px;padding:6px 22px;letter-spacing:.02em;background:rgba(255,248,232,.7)}
.stamp.gr{color:#3f6b2a;border-color:#3f6b2a}
.lb{font-family:Nunito,sans-serif;font-weight:900;font-size:34px;color:${INK};margin-top:4px}
.nb{font-variant-numeric:tabular-nums}
.chart{margin-top:16px;padding:12px 18px 6px;background:#FFF8E8;border:4px solid ${INK};border-radius:24px;transform-origin:0 50%}
.chart svg{display:block;width:100%;height:auto}
.ct2{font-family:Fredoka,sans-serif;font-weight:700;font-size:44px;color:${INK}}.ct2 i{font-style:normal;font-family:Nunito,sans-serif;font-weight:800;font-size:30px;color:${RED}}
.mapwrap{position:absolute;right:28px;top:62px;transform-origin:50% 50%}.map{display:block}
.big{font-family:Fredoka,sans-serif;font-weight:700;font-size:150px;line-height:1;color:${OCH};margin-top:2px;}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.chips i{display:block;font-style:normal;font-family:Fredoka,sans-serif;font-weight:600;font-size:34px;padding:8px 18px;border-radius:40px;background:${INK};color:${NEWS}}
.jam{position:relative;display:flex;align-items:center;gap:18px;margin-top:16px;padding:6px 22px;background:#FFF8E8;border:4px solid ${INK};border-radius:24px}
.jam b{font-family:Fredoka,sans-serif;font-weight:700;font-size:120px;line-height:1;color:${INK};min-width:150px;text-align:center}
.jam span{font-family:Fredoka,sans-serif;font-weight:600;font-size:46px;color:${INK}}
.jam .stamp.in{position:absolute;right:20px;top:18px;margin:0;font-size:66px;transform:rotate(-6deg)}
.news{background:#E9DDC0;filter:sepia(.25)}
.mast{font-family:Nunito,sans-serif;font-weight:900;font-size:28px;letter-spacing:.14em;color:#6a5a44;border-bottom:4px double ${INK};padding-bottom:8px;margin-bottom:12px;text-align:center}
.hl{font-family:Fredoka,sans-serif;font-weight:700;font-size:74px;line-height:1.02;color:${INK};text-align:center}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px 26px;margin:18px 4px 4px}.cols i{display:block;height:16px;border-radius:8px;background:rgba(42,33,24,.22)}.cols i.s{width:60%}
.stamps2{display:flex;flex-wrap:wrap;gap:6px 16px}.stamps2 .stamp{font-size:44px}
.duo2{display:flex;gap:14px;margin-top:8px}
.st2{flex:1;padding:10px 16px;background:#FFF8E8;border:4px solid ${INK};border-radius:24px;text-align:center}
.st2 b{display:block;font-family:Fredoka,sans-serif;font-weight:700;font-size:96px;line-height:1.05;color:${OCH}}
.st2 span{display:block;font-family:Nunito,sans-serif;font-weight:900;font-size:28px;color:${INK}}.st2 em{font-style:normal;font-weight:700;color:#7a6a54}
.per{margin-top:16px;font-family:Fredoka,sans-serif;font-weight:700;font-size:58px;color:${INK}}.per b{font-size:84px;color:${OCH}}
.quote{font-family:Fredoka,sans-serif;font-weight:600;font-size:64px;line-height:1.1;color:${INK}}.quote span{color:${OCH}}
.duo{display:flex;gap:14px;margin-top:14px}.duo i{flex:1;display:block;text-align:center;font-style:normal;font-family:Fredoka,sans-serif;font-weight:700;font-size:56px;padding:12px 4px;border-radius:26px;border:5px solid ${INK};background:${WHT};color:${INK}}
.duo i+i{background:${OCH};color:${NEWS}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#8FD3F0", vig: 0.28, grain: 0.06, capfloor: 0.18, html, css,
  chip: "DIORAMA ILUSTRASI &middot; BUKAN FOTO ASLI", chipFont: "Nunito,sans-serif", chipColor: INK,
  extraAt: ["s1:tentara", "s1:burung", "s1:burungnya", "s1:menang", "s2:veteran", "s2:Depresi", "s2:jatuh", "s3:dimakan", "s3:dirusak", "s3:kelinci",
    "s4:George", "s4:setuju", "s4:Meredith", "s4:Lewis", "s4:sepuluh", "s5:berpencar", "s5:seribu", "s5:mendekat", "s5:macet", "s5:truk", "s5:kalah",
    "s6:ditarik", "s6:dikirim", "s6:Sampai", "s6:9.860", "s6:Tepat", "s6:diragukan", "s7:senapan", "s7:tank", "s7:ditolak", "s7:Petani", "s7:pagar", "s8:pagar", "s8:Kalau", "s8:tentara"],
  // Stop-motion "plop": three held poses at 12 fps, squash on landing, then rest.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1,scaleX:1.22,scaleY:.36,y:60,transformOrigin:'50% 100%'},a-.14);tl.set(p,{scaleX:.9,scaleY:1.12,y:-16},a-.06);tl.set(p,{scaleX:1.04,scaleY:.96,y:0},a+.02);tl.set(p,{scaleX:1,scaleY:1},a+.1);}`,
  panelOut: `(tl,p,b)=>{tl.set(p,{scaleX:1.06,scaleY:.92,transformOrigin:'50% 100%'},b-.2);tl.set(p,{scaleX:1.24,scaleY:.3,opacity:.7},b-.12);tl.set(p,{opacity:0},b-.04);}`,
  // Pending items stay out of the layout (display:none) so the card is always sized to what is on it; it grows as each item plops in.
  fxExtra: `plop:(e,t)=>{const d=(e.classList.contains('row')||e.classList.contains('jam'))?'flex':'block';gsap.set(e,{display:'none'});tl.set(e,{display:d,opacity:1,scaleX:1.3,scaleY:.4},t);tl.set(e,{scaleX:.9,scaleY:1.14},t+.083);tl.set(e,{scaleX:1.04,scaleY:.97},t+.167);tl.set(e,{scaleX:1,scaleY:1},t+.25);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,rotation:-7,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  hud: `(t)=>{const e=document.getElementById('jamn');if(!e)return;const a=AT['s5:seribu']+.25,st=(AT['s5:macet']-AT['s5:seribu']-.35)/12;e.textContent=String(Math.max(0,Math.min(12,Math.floor((t-a)/st)+1)));}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:900px;text-align:center;font-family:Fredoka,sans-serif;font-weight:600;font-size:64px;line-height:1.13;color:${NEWS};background:${INK};border:5px solid ${NEWS};border-radius:38px;padding:10px 30px 16px;box-shadow:0 9px 0 rgba(42,33,24,.4);transform-origin:50% 100%}
.w{display:inline-block;margin:0 5px;transform-origin:50% 90%}`,
(id, w) => `tl.fromTo("#${id}",{color:"${NEWS}",scale:1},{color:"${ORG}",scale:1.08,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{scale:1,duration:.1,ease:"power2.out"},${(w.start + 0.083).toFixed(3)});tl.to("#${id}",{color:"${NEWS}",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{scaleX:1.12,scaleY:.7},${s.toFixed(3)});tl.set("#${id}",{scaleX:.97,scaleY:1.06},${(s + 0.083).toFixed(3)});tl.set("#${id}",{scaleX:1,scaleY:1},${(s + 0.167).toFixed(3)});\n`);
writeIndex(".", TL, "Perang Emu", "#8FD3F0");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
