// EP28 PERANG COD: TACTICBOARD. A 3D naval tactics board: Iceland in the centre, fishing-zone rings painted from the
// real coastline (4, 12, 50, 200 nm), blue/red coast-guard pucks against grey Royal Navy tokens and ochre trawlers,
// a net-cutter cut, a ramming clash, the GIUK gap and a scoreboard that ends at 3-0. Panels are a coach-board HUD.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ISB = "#02529C", ISR = "#DC1E35", YEL = "#FFE27A", GOLD = "#FFC94A", INK = "#06111C", BG = "#070D16", STEEL = "#8D99A6";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:700">ISLANDIA 1976</span><span style="font-family:'Barlow Condensed',sans-serif;font-weight:600">islandia</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">A 1</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:700">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  ${kk("EP 28", "FAKTA SEJARAH NEGARA")}
  <div class="h1">PERANG <em>COD</em></div>
  <div class="vs"><i class="is">ISLANDIA</i><b>vs</b><i class="uk">INGGRIS</i><span>1958–1976</span></div>
  <div class="chips"><i class="ch" data-at="s1:menang" data-fx="stampc">MENANG 3 KALI</i><i class="ch2" data-at="s1:gunting" data-fx="stampc">✂ GUNTING JARING</i></div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3">
  ${kk("01", "ISLANDIA · ATLANTIK UTARA")}
  ${row("PERAIRAN KAYA IKAN", "ikan kod di sekeliling pulau", "s2:kaya")}
  ${row("SEJAK ABAD KE-14", "kapal ikan Inggris mencari kod di sini", "s2:Sejak", "rd")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "ZONA PERIKANAN ISLANDIA")}
  ${row("4 MIL LAUT · 1952", "", "s3:empat")}
  ${row("12 MIL · 1958", "", "s3:dua")}
  ${row("INGGRIS MENOLAK", "dan mengirim kapal perang", "s3:menolak", "rd")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "PERANG COD I · 1958–1961")}
  <div class="cd row gy" data-at="s4:puluhan" data-fx="card"><b><span class="ct" data-from="0" data-to="17" data-a="s4:puluhan" data-d="0.6">17</span> PERUSAK + <span class="ct" data-from="0" data-to="19" data-a="s4:puluhan" data-d="0.9">19</span> FREGAT</b><span>dikerahkan Inggris (total selama perang)</span></div>
  <div class="cd row" data-at="s4:enam" data-fx="card"><b>6 KAPAL PATROLI</b><span>seluruh kekuatan Islandia</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "PERANG COD II · 1972–1973")}
  ${row("ZONA 50 MIL", "", "s5:lima")}
  ${row("PEMOTONG JARING", "memutus jaring kapal Inggris dari belakang", "s5:pemotong")}
  ${row("SALING TABRAK", "", "s5:tabrak", "rd")}
</div>
<div class="p" data-in="s6" data-out="s6:mengancam">
  ${kk("05", "PERANG COD III · 1975–1976")}
  ${row("ZONA 200 MIL", "", "s6:dua")}
  ${row("HUBUNGAN DIPLOMATIK PUTUS", "19 Februari 1976", "s6:diplomatik", "rd")}
</div>
<div class="p" data-in="s6:mengancam" data-out="s7">
  ${kk("05", "KARTU TERAKHIR ISLANDIA")}
  ${row("ANCAMAN KELUAR NATO", "", "s6:NATO", "rd")}
  ${row("CELAH GIUK", "titik pantau kapal selam Perang Dingin", "s6:selam", "am")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "JUNI 1976 · MEDIASI NATO")}
  ${row("INGGRIS MENERIMA 200 MIL", "", "s7:menerima")}
  ${row("&gt; 500 TAHUN", "penangkapan bebas Inggris berakhir", "s7:Lebih")}
  ${row("RIBUAN NELAYAN INGGRIS", "kehilangan pekerjaan", "s7:ribuan", "rd")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "KINI")}
  ${row("ZEE 200 MIL", "standar dunia (UNCLOS, sejak 1982)", "s8:standar")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Apa kunci negara kecil bisa menang melawan negara besar? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(6,17,28,.88);border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.08em;color:#E8F0F8;margin-bottom:18px;padding:7px 18px 7px 7px;background:rgba(6,17,28,.85);border:2px solid ${YEL};border-radius:6px}
.kk i{font-style:normal;background:${YEL};color:${INK};padding:3px 10px;border-radius:3px}
.h1{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:150px;line-height:.9;letter-spacing:.01em;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.7)}
.h1 em{font-style:normal;color:${YEL}}
.vs{display:flex;align-items:center;gap:12px;margin-top:12px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:46px;color:#fff}
.vs i{font-style:normal;padding:4px 16px;border-radius:5px}.vs .is{background:${ISB};box-shadow:inset 0 -8px 0 ${ISR}}.vs .uk{background:#5E6A76}
.vs b{font-size:34px;color:#C9D6E2}.vs span{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:28px;color:${YEL};margin-left:8px;background:rgba(6,17,28,.85);padding:6px 12px;border-radius:5px}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px;align-items:center}
.ch,.ch2{font-style:normal;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:54px;line-height:1;letter-spacing:.04em;padding:10px 24px 8px;border-radius:6px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.ch{color:${INK};background:${GOLD}}.ch2{color:#fff;background:${ISB};border:4px solid ${ISR}}
.row{flex-direction:column;margin-top:14px;padding:9px 24px 11px 24px;border-left:14px solid ${ISB};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:56px;line-height:1.02;letter-spacing:.02em;color:#fff}
.row span{display:block;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.3;color:#BFD3E6}
.row b span{display:inline;font:inherit;color:inherit}
.row.rd{border-left-color:${ISR}}.row.rd b{color:#FF7486}
.row.gy{border-left-color:${STEEL}}.row.am{border-left-color:#FFB547}.row.am b{color:#FFC56E}
.q{margin-top:20px;padding:16px 26px 14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:58px;line-height:1.04;color:#fff;border-left:14px solid ${YEL};max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP28_PERANG_COD_ISLANDIA",
  ep: "28", bg: BG, vig: 0.36, grain: 0.045, capfloor: 0.0, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: "#BFD3E6",
  chip: "ILUSTRASI TAKTIS &middot; BIDAK, BUKAN REPLIKA KAPAL",
  extraAt: ["s1:kecil", "s1:melawan", "s1:menang", "s1:Angkatan", "s1:Inggris", "s1:Kerajaan", "s1:gunting", "s1:tiga#2", "s1:kali#2",
    "s2:Sejak", "s2:sana", "s2:abad", "s3:empat", "s3:dua", "s3:mengirim", "s3:1958", "s3:Inggris", "s3:perang",
    "s4:mengerahkan", "s4:enam", "s4:patroli", "s5:lima", "s5:pemotong", "s5:jaring#2", "s5:tabrak", "s5:Kapal-kapal", "s5:memutus", "s5:Penjaga", "s5:belakang",
    "s6:dua", "s6:Islandia", "s6:diplomatik", "s6:mengancam", "s6:keluar", "s6:NATO", "s6:Padahal", "s6:selam", "s6:mengawasi",
    "s7:mengalah", "s7:berakhir", "s7:ribuan", "s7:menerima", "s8:standar", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-50},{opacity:1,x:0,duration:.36,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-30},{opacity:1,y:0,duration:.36,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-24,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:76px;line-height:1.02;letter-spacing:.01em;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.7)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Perang Cod", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
