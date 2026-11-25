// EP24 NEPAL BENDERA: DRAFTFORGE. A blueprint sheet where the Nepal flag is drawn step by step from its constitution.
// A row of generic rectangular flags gives way to the double pennon; callouts explain the colours and the 8 / 12 rays;
// the pre-1962 faced sun and moon are stamped out on 16 Dec 1962; the 2015 Schedule 1 construction is drawn line by
// line; the height : width ratio 1,219 is dimensioned. Stations change under a cyan plotter scan line.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#DC143C", WHT = "#E8F1FF", CYAN = "#62C6F2", GOLD = "#F2B33D", INK = "#061A33", BG = "#04142B";
const HEAD = `Rajdhani,'Arial Narrow',sans-serif`, MONO = `'JetBrains Mono',Consolas,monospace`;

const scan = (a) => `<div class="scan" data-at="${a}" data-fx="scan"><i></i></div>`;
const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>DET. ${n}</i>${s}</div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Rajdhani:wght@600;700&display=block">
<div class="pre"><span style="font-family:Rajdhani,sans-serif;font-weight:700">NEPAL 1962</span><span style="font-family:Rajdhani,sans-serif;font-weight:600">nepal</span><span style="font-family:'JetBrains Mono',monospace;font-weight:500">A B</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700">AUDIRA</span></div>
${scan("s2:Ini")}${scan("s3:Warnanya")}${scan("s4:Asalnya")}${scan("s5:Enam")}${scan("s6:Karena")}${scan("s7:Kalau")}${scan("s8:Tahun")}
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  ${kk("01", "FAKTA SEJARAH NEGARA &middot; EP 24")}
  <div class="h1">SATU BENDERA<br>YANG <em>TIDAK</em><br>PERSEGI PANJANG</div>
  <div class="chips"><i class="ch" data-at="s1:satu" data-fx="stampc">HANYA 1 DI DUNIA</i></div>
</div>
<div class="p" data-in="s2:Ini" data-out="s2:lebih">
  ${kk("02", "NEPAL &middot; HIMALAYA")}
  ${row("DUA PANJI SEGITIGA", "bertumpuk jadi satu bendera", "s2:dua")}
  ${row("SEGI LIMA CEKUNG", "satu sudutnya masuk ke dalam", "s2:segi")}
</div>
<div class="p" data-in="s2:lebih" data-out="s3">
  ${kk("02", "SATU-SATUNYA")}
  ${row("TINGGI &gt; LEBAR", "lebih tinggi daripada lebarnya", "s2:lebih", "rd")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("03", "MAKNA WARNA &amp; LAMBANG")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("04", "ASAL-USUL")}
  ${row("PANJI SEGITIGA", "lazim di Asia Selatan", "s4:panji")}
  ${row("DULU BERWAJAH", "matahari &amp; bulan punya wajah manusia", "s4:wajah", "rd")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("05", "STANDAR 1962")}
  ${row("WAJAH DIHAPUS", "bentuk distandarkan", "s5:Wajah", "rd")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("06", "KONSTITUSI NEPAL")}
  ${row("LANGKAH DEMI LANGKAH", "lengkap dengan garis &amp; ukuran", "s6:langkah")}
  ${row("2015 &middot; LAMPIRAN 1", "lampiran khusus cara membuat bendera", "s6:2015", "rd")}
  <div class="note" data-at="s6:garis" data-fx="fade">garis konstruksi di layar disederhanakan</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("07", "TINGGI : LEBAR")}
  <div class="cd mega" data-at="s7:kira-kira" data-fx="card"><b>&asymp; 1,219</b><small>: 1</small></div>
  ${row("BILANGAN IRASIONAL", "bukan angka bulat, desimalnya tak pernah berhenti", "s7:irasional", "rd")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut+1.6">
  ${kk("08", "REVISI")}
  ${row("USUL 2008", "ganti desain bendera", "s8:2008")}
  <div class="chips"><i class="ch" data-at="s8:ditolak" data-fx="stampc">DITOLAK</i></div>
</div>
<div class="p" data-in="s8:Menurut+1.6" data-out="@END">
  <div class="cd q">Bendera negara mana yang paling unik? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.scan{position:absolute;left:0;right:0;top:0;height:1920px;z-index:14;pointer-events:none;opacity:0}
.scan i{position:absolute;left:0;right:0;top:0;height:6px;background:${CYAN};box-shadow:0 0 18px 4px rgba(98,198,242,.55),0 -140px 160px rgba(98,198,242,.10)}
.cd{position:relative;background:rgba(4,18,40,.9);border:2px solid rgba(232,241,255,.85)}
.cd:before,.cd:after{content:"";position:absolute;width:16px;height:16px;border:3px solid ${CYAN}}
.cd:before{left:-9px;top:-9px;border-right:0;border-bottom:0}.cd:after{right:-9px;bottom:-9px;border-left:0;border-top:0}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:27px;letter-spacing:.08em;color:${WHT};margin-bottom:20px;padding:8px 18px 8px 8px;background:rgba(4,18,40,.82);border:2px solid rgba(98,198,242,.7)}
.kk i{font-style:normal;background:${CYAN};color:${INK};padding:4px 10px}
.h1{font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:122px;line-height:.9;letter-spacing:.01em;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.6)}
.h1 em{font-style:normal;color:${GOLD}}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px;align-items:center}
.ch{font-style:normal;font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:58px;line-height:1;letter-spacing:.05em;padding:12px 26px 8px;border:6px solid ${RED};color:#fff;background:rgba(220,20,60,.88);transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.row{flex-direction:column;margin-top:16px;padding:10px 24px 12px 26px;border-left:14px solid ${CYAN};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:54px;line-height:1.02;letter-spacing:.02em;color:#fff}
.row span{display:block;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:26px;line-height:1.3;color:#BFD8F5}
.row.rd{border-left-color:${RED}}.row.rd b{color:#FF5A78}
.mega{display:flex;align-items:baseline;gap:16px;width:max-content;padding:0 30px 4px;border-left:14px solid ${GOLD}}
.mega b{font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:168px;line-height:1.02;color:${GOLD}}
.mega small{font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:72px;color:${WHT}}
.note{display:inline-block;margin-top:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:23px;color:#BFD8F5;background:rgba(4,18,40,.8);padding:5px 12px;border-left:4px solid ${CYAN}}
.q{margin-top:20px;padding:16px 26px 14px;font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:54px;line-height:1.04;color:#fff;border-left:14px solid ${GOLD};max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP24_NEPAL_BENDERA",
  ep: "24", bg: BG, vig: 0.34, grain: 0.05, capfloor: 0.0, html, css, chipFont: MONO, chipColor: "#BFD8F5",
  chip: "ILUSTRASI SKEMATIK &middot; DIGAMBAR DARI ATURAN GEOMETRI",
  extraAt: ["s1:satu", "s2:Nepal", "s2:Himalaya", "s2:dua", "s2:panji", "s2:segi", "s2:cekung", "s2:satu-satunya", "s2:lebih", "s2:tinggi", "s2:lebarnya",
    "s3:Merah", "s3:Tepi", "s3:bulan", "s3:matahari", "s3:delapan", "s3:dua", "s4:panji", "s4:Gorkha", "s4:Shah", "s4:Dulu", "s4:wajah",
    "s5:1962", "s5:Raja", "s5:Shankar", "s5:Wajah", "s5:dihapus", "s6:Karena", "s6:ukurannya", "s6:Konstitusi", "s6:2015", "s6:lampiran",
    "s7:perbandingan", "s7:lebarnya", "s7:1,219", "s8:ditolak", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-50},{opacity:1,x:0,duration:.36,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},
 scan:(e,t)=>{const i=e.querySelector('i');tl.set(e,{opacity:1},t-.42);tl.fromTo(i,{y:120},{y:1800,duration:.7,ease:'power2.inOut',immediateRender:false},t-.42);tl.set(e,{opacity:0},t+.3);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-46},{opacity:1,x:0,duration:.38,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:40,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Rajdhani,'Arial Narrow',sans-serif;font-weight:700;font-size:72px;line-height:1.04;letter-spacing:.01em;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.7)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${GOLD}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bendera Nepal", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
