// EP46 PORTUGAL, IBU KOTA PINDAH KE RIO: MOSAICFORGE. An azulejo rotunda (cobalt on white glazed tiles, grout, ochre
// accents) holds eight painted panels; tiles rain in, flip and rattle on narrated words, glazed porcelain props stand off
// the wall. Panels are glazed-tile cards with a cobalt border; titles in Playfair Display, dates in IBM Plex Mono.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const COB = "#1F3F8F", COBD = "#152C66", OCH = "#D8A23A", WH = "#F4F1E8", BG = "#141A2E";
const GRN = "#009C3B", YEL = "#FFDF00";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const D322 = Math.max(0.6, at("s7:dua#2") - at("s7:mengakhiri")).toFixed(2);
const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=IBM+Plex+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Playfair Display',serif;font-weight:900">LISBON</span><span style="font-family:'Playfair Display',serif;font-weight:700">Rio</span><span style="font-family:'Playfair Display',serif;font-weight:700;font-style:italic">Rio</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">1807</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:700">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Pasukan">
  ${kk("EP 46", "FAKTA SEJARAH NEGARA")}
  <div class="tcard"><div class="h1">IBU KOTA<br>PINDAH KE <em>KOLONI</em></div>
  <div class="tsub" data-at="s1:Portugal" data-fx="fade">PORTUGAL &rarr; BRASIL &middot; <span class="y">1807</span></div></div>
</div>
<div class="p" data-in="s2:Pasukan" data-out="s3">
  ${kk("01", "NAPOLEON DATANG")}
  ${row("PASUKAN NAPOLEON MENYERBU", "", "s2:menyerbu", "rd")}
  ${row("PORTUGAL &middot; SEKUTU INGGRIS", "di daratan Eropa", "s2:Inggris")}
  ${row("MENYERAH ATAU PERGI?", "", "s2:memilih", "q2")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "KABUR DARI LISBON")}
  <div class="cd row big" data-at="s3:Hampir" data-fx="card"><b>± <span class="ct" data-from="0" data-to="10000" data-a="s3:ribu-0.9" data-d="0.9">10.000</span> ORANG</b><span>keluarga kerajaan, istana, pejabat</span></div>
  ${row("27&ndash;29 NOV 1807", "naik kapal di Lisbon", "s3:naik", "dt")}
  ${row("PASUKAN NAPOLEON MASUK", "beberapa hari kemudian", "s3:masuk", "rd")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "MENYEBERANGI ATLANTIK")}
  ${row("DIKAWAL KAPAL PERANG INGGRIS", "", "s4:dikawal")}
  ${row("± 2 BULAN DI LAUT", "", "s4:dua", "dt")}
  ${row("JAN 1808 &middot; TIBA DI BRASIL", "pelabuhan dibuka untuk perdagangan", "s4:Januari", "dt")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "IBU KOTA DI KOLONI")}
  <div class="cd row big" data-at="s5:tiga-0.8" data-fx="card"><b><span class="ct" data-from="0" data-to="13" data-a="s5:tiga-0.6" data-d="0.6">13</span> TAHUN</b><span>Rio de Janeiro, ibu kota seluruh kekaisaran</span></div>
  ${row("PEMBALIKAN", "koloni memerintah negeri induknya", "s5:pembalikan", "og")}
  ${row("± 15.000 PENDATANG", "", "s5:lima", "dt")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "RAJA PULANG")}
  ${row("1815 &middot; KERAJAAN BERSATU", "Brasil setara dengan Portugal", "s6:1815", "dt")}
  ${row("KRISIS POLITIK DI PORTUGAL", "", "s6:krisis", "rd")}
  ${row("APRIL 1821 &middot; JOÃO PULANG", "", "s6:April", "dt")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "BRASIL MERDEKA")}
  ${row("PEDRO TETAP TINGGAL", "di Rio sejak umur 9 &middot; menolak pulang", "s7:Pedro")}
    <div class="cd row br" data-at="s7:Tujuh" data-fx="card"><b>7 SEPTEMBER 1822</b><span>Brasil merdeka</span></div>
  <div class="cd row big" data-at="s7:mengakhiri" data-fx="card"><b><span class="ct" data-from="0" data-to="322" data-a="s7:mengakhiri" data-d="${D322}">322</span> TAHUN</b><span>penjajahan berakhir</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "SEBAB DAN AKIBAT")}
  ${row("LARI DARI NAPOLEON", "&rarr; lahir sebuah negara baru", "s8:melahirkan")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Apa jadinya kalau sang pangeran tidak pernah pergi? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(244,241,232,.95);border-radius:6px;box-shadow:0 0 0 3px ${COB},0 0 0 7px rgba(244,241,232,.95),0 0 0 9px ${OCH},0 14px 30px rgba(10,15,40,.5)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:700;font-size:25px;letter-spacing:.08em;color:${WH};margin-bottom:22px;padding:7px 18px 7px 7px;background:rgba(21,44,102,.9);border-radius:6px;border-bottom:5px solid ${OCH}}
.kk i{font-style:normal;background:${OCH};color:${COBD};padding:3px 10px;border-radius:4px}
#chip{background:rgba(19,48,111,.94);padding:6px 14px;border-radius:4px;opacity:1!important;border-left:5px solid ${OCH}}
.tcard{display:inline-block;margin-left:9px;padding:22px 34px 24px;background:#13306F;border-radius:8px;box-shadow:0 0 0 4px ${OCH},0 0 0 9px #13306F,0 18px 40px rgba(5,10,30,.6)}
.h1{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:108px;line-height:.98;letter-spacing:-.01em;color:#FFFDF6}
.tsub{margin-top:16px;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:36px;letter-spacing:.06em;color:#FFFDF6}.tsub .y{color:${OCH}}
.h1 em{font-style:italic;color:${OCH}}
.chips{display:flex;flex-wrap:wrap;gap:14px;margin-top:26px;align-items:center}
.ch,.ch2,.ch3,.ar{font-style:normal;font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:44px;line-height:1;padding:12px 22px 12px;border-radius:6px;transform:rotate(-2deg);box-shadow:0 0 0 3px ${COB},0 10px 24px rgba(0,0,0,.45)}
.ch,.ch2{color:${COB};background:${WH}}.ch3{color:${COBD};background:${OCH};font-family:'IBM Plex Mono',monospace;font-weight:700}
.ar{background:none;box-shadow:none;color:#FFFDF6;text-shadow:0 3px 10px rgba(0,0,0,.8);padding:0 4px}
.row{display:flex;flex-direction:column;margin-top:22px;margin-left:9px;padding:12px 26px 14px 26px;max-width:880px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:54px;line-height:1.04;color:${COB}}
.row span{display:block;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.3;color:#3E4A6E;max-width:820px;margin-top:4px}
.row b span,.row span span{display:inline;font:inherit;color:inherit;margin:0}
.row.rd b{color:#8F2430}
.row.dt b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:50px;letter-spacing:-.01em}
.row.og{background:${OCH}}.row.og b{color:${COBD};letter-spacing:.04em}.row.og span{color:${COBD}}
.row.q2 b{font-style:italic}
.row.big b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:86px;letter-spacing:-.03em}
.row.br{background:linear-gradient(90deg,${GRN} 0 12px,${YEL} 12px 22px,rgba(244,241,232,.96) 22px);padding-left:44px}
.row.br b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:60px;color:#0B5E2A}
.q{margin-top:24px;margin-left:9px;padding:18px 28px 16px;font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:58px;line-height:1.08;color:${COB};max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP46_PORTUGAL_IBU_KOTA_RIO",
  ep: "46", bg: BG, vig: 0.4, grain: 0.04, capfloor: 0.0, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: WH,
  chip: "ILUSTRASI UBIN AZULEJO &middot; BUKAN POTRET TOKOH",
  extraAt: ["s1:memindahkan", "s1:samudra", "s1:seberang", "s1:1807", "s2:bergerak", "s2:Portugal", "s2:Pangeran",
    "s3:Hampir", "s3:Lisbon", "s3:naik", "s3:Beberapa", "s3:pasukan",
    "s4:Atlantik", "s4:Januari", "s4:tiba", "s4:Brasil", "s4:membuka",
    "s5:ibu", "s5:tahun", "s5:induknya", "s5:pembalikan", "s5:menampung",
    "s6:bersatu", "s6:dinaikkan", "s6:setara", "s6:krisis", "s6:April",
    "s7:Pedro", "s7:menolak", "s7:Tujuh", "s7:merdeka",
    "s8:negara", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,rotationY:-80,transformPerspective:900,transformOrigin:'0% 50%'},{opacity:1,rotationY:0,duration:.42,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.7,opacity:0,rotation:-8},{scale:1,opacity:1,rotation:-2,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-28},{opacity:1,y:0,duration:.36,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-22,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:40px;right:40px;top:1280px;height:270px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;box-sizing:border-box;padding:12px 30px 18px;background:rgba(19,48,111,.88);border-radius:22px;box-shadow:0 0 0 3px rgba(216,162,58,.85),0 12px 30px rgba(5,10,30,.55);text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:66px;line-height:1.08;color:#fff;-webkit-text-stroke:4px ${COBD};paint-order:stroke fill}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${OCH}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ibu Kota Pindah ke Rio", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
