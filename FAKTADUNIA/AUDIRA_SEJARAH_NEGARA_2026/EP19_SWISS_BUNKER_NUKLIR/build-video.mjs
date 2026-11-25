// EP19 SWISS BUNKER NUKLIR: ISOCRAFT. An isometric comic teardown: a strip of Swiss chalets cut open along the front
// face with a concrete shelter under each, the 1963 law scroll on a Cold War desk, the 1978 blast-ring schematic,
// the Sonnenberg tunnel sliced open, and a board where 100 people icons fill 114 places. Stations change under a
// concrete panel slide-apart (two slabs meet on an angled seam, then part like a cutaway). Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#DA291C", INK = "#1C1E21", PAPER = "#F5F2EB", CON = "#B9BEC2", BLUE = "#7A9BB8", YEL = "#F4C430", BG = "#DFE6EA";
const HEAD = `Bangers, 'Luckiest Guy', sans-serif`, BODY = `Inter, sans-serif`;

// concrete panels close on an angled seam, then slide apart to reveal the next station
const cut = (a) => `<div class="cut" data-at="${a}" data-fx="cut"><div class="hw l"><div class="hv"><i class="st"></i><b>AUDIRA</b></div></div><div class="hw r"><div class="hv"><i class="st"></i></div></div></div>`;
const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b><span>${s}</span></div>`;

const html = `
${cut("s3:Dasar")}${cut("s4:Belakangan")}${cut("s5:Ada")}${cut("s6:Tahun")}${cut("s7:Kini")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 19</div>
  <div class="cd h1">Bunker nuklir<br>untuk <em>semua</em></div>
  <div class="chips"><i class="ch" data-at="s1:lebih" data-fx="stampc">BAHKAN LEBIH!</i></div>
</div>
<div class="p" data-in="s2" data-out="s3:Dasar">
  <div class="kk">SWISS</div>
  ${row("NEGARA NETRAL", "di tengah Eropa", "s2:netral")}
  ${row("SIAGA PERANG DINGIN", "bersiap untuk skenario terburuk", "s2:Perang", "rd")}
</div>
<div class="p" data-in="s3:Dasar" data-out="s4:Belakangan">
  <div class="kk">DASAR HUKUM PERTAMA</div>
  <div class="cd mega" data-at="s3:1963" data-fx="card"><b>1963</b><small>4<br>OKTOBER</small></div>
  ${row("WAJIB DI HUNIAN", "bangunan tempat tinggal harus punya tempat perlindungan nuklir", "s3:Bangunan", "rd")}
</div>
<div class="p" data-in="s4:Belakangan" data-out="s5:Ada">
  <div class="kk">STANDAR BUNKER RUMAH</div>
  <div class="cd mega" data-at="s4:1978" data-fx="card"><small>RUMAH<br>SETELAH</small><b>1978</b></div>
  <div class="cd spec" data-at="s4:megaton" data-fx="card"><b>12 MT</b><span>tahan ledakan<br><i data-at="s4:tujuh" data-fx="fade">dari jarak <u>700 m</u></i></span></div>
</div>
<div class="p" data-in="s5:Ada" data-out="s6:Tahun">
  <div class="kk">BUNKER UMUM RAKSASA</div>
  ${row("TEROWONGAN SONNENBERG", "jadi bunker umum", "s5:Terowongan")}
  <div class="cd mega" data-at="s5:lebih" data-fx="card"><b><b class="ct" data-from="0" data-to="4" data-a="s5:lebih" data-d="1.1">0</b>+</b><small>BULAN<br>stok makanan<br>&amp; bahan bakar</small></div>
</div>
<div class="p" data-in="s6:Tahun" data-out="s6:Totalnya">
  <div class="kk">DATA TAHUN 2006</div>
  ${row("&plusmn;300.000 BUNKER", "di rumah, institusi, dan rumah sakit", "s6:tiga")}
  ${row("+ 5.100 BUNKER UMUM", "tempat perlindungan bersama", "s6:5.100", "rd")}
</div>
<div class="p" data-in="s6:Totalnya" data-out="s7">
  <div class="kk">TOTAL TEMPAT</div>
  <div class="cd mega" data-at="s6:8,6" data-fx="card"><b>8,6</b><small>JUTA<br>tempat</small></div>
  <div class="cd mega red" data-at="s6:114" data-fx="card"><b><b class="ct" data-from="0" data-to="114" data-a="s6:114" data-d="1.0">0</b>%</b><small>dari<br>penduduk</small></div>
  <div class="note" data-at="s6:persen" data-fx="fade">1 ikon orang = 1% penduduk &middot; 114 tempat</div>
</div>
<div class="p" data-in="s7" data-out="s7:Kini">
  <div class="kk">PERBANDINGAN</div>
  <div class="cd bars">
    <div class="br" data-at="s7:Sebagai" data-fx="card" data-d="flex"><b>SWISS</b><div class="tr"><i class="fl ch" data-at="s7:Sebagai" data-fx="grow"></i></div><em>114%</em></div>
    <div class="br" data-at="s7:Jerman" data-fx="card" data-d="flex"><b>JERMAN</b><div class="tr"><i class="fl de" data-at="s7:Jerman" data-fx="grow"></i></div><em>3%</em></div>
  </div>
</div>
<div class="p" data-in="s7:Kini" data-out="s7:Setiap">
  <div class="kk">SEKARANG</div>
  ${row("JADI GUDANG &amp; RUANG OLAHRAGA", "banyak bunker rumah dialihfungsikan", "s7:gudang")}
  ${row("TETAP WAJIB DIRAWAT", "kewajibannya tidak dihapus", "s7:kewajiban", "rd")}
</div>
<div class="p" data-in="s7:Setiap" data-out="s8">
  <div class="kk">ATURANNYA</div>
  ${row("SETIAP PENDUDUK", "punya tempat di bunker dekat rumahnya", "s7:Setiap", "rd")}
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="cd h2">Bersiap untuk hal yang<br><em>semoga tak pernah terjadi</em></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Perlu ditiru di negara lain? Tulis di komentar!</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cut{position:absolute;inset:0;z-index:14;pointer-events:none;opacity:0}
.hw{position:absolute;inset:0;filter:drop-shadow(0 0 0 ${INK}) drop-shadow(10px 0 0 ${INK}) drop-shadow(-10px 0 0 ${INK})}
.hv{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(28,30,33,.16) 0 3px,transparent 3px 160px),radial-gradient(circle at 30% 30%,#C9CED2,${CON} 70%)}
.hw.l .hv{clip-path:polygon(0 0,71% 0,29% 100%,0 100%)}
.hw.r .hv{clip-path:polygon(71% 0,100% 0,100% 100%,29% 100%)}
.hv .st{position:absolute;left:0;right:0;top:880px;height:60px;background:${RED};border-top:6px solid ${INK};border-bottom:6px solid ${INK}}
.hv b{position:absolute;left:70px;top:1000px;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:120px;letter-spacing:.06em;color:rgba(28,30,33,.32)}
.cd{position:relative;background:#fff;border:5px solid ${INK};border-radius:6px;box-shadow:10px 10px 0 ${INK}}
.kk{display:inline-block;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:40px;line-height:1.1;letter-spacing:.06em;color:#fff;background:${RED};padding:8px 20px 4px;border:4px solid ${INK};border-radius:4px;box-shadow:6px 6px 0 ${INK};margin-bottom:26px;transform:rotate(-1.5deg)}
.h1{display:inline-block;padding:16px 30px 8px;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:124px;line-height:.95;letter-spacing:.02em;color:${INK}}
.h1 em,.h2 em{font-style:normal;color:${RED}}
.h2{display:inline-block;padding:16px 28px 10px;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:72px;line-height:1;letter-spacing:.02em;color:${INK}}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:30px;align-items:center}
.ch{font-style:normal;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:58px;line-height:1.1;letter-spacing:.04em;padding:10px 26px 4px;border:5px solid ${RED};color:${RED};background:rgba(255,255,255,.92);border-radius:6px;transform:rotate(-4deg);box-shadow:6px 6px 0 ${INK}}
.ch.big{font-size:80px}
.row{flex-direction:column;margin-top:24px;padding:12px 24px 14px;border-left:18px solid ${BLUE};max-width:860px}
.row b{display:block;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:56px;line-height:1.05;letter-spacing:.02em;color:${INK}}
.row span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:31px;line-height:1.25;color:#3a3f44}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}
.mega{display:flex;align-items:center;gap:24px;width:max-content;padding:4px 30px 0;margin-top:6px}
.mega b{font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:176px;line-height:1.05;letter-spacing:.02em;color:${INK}}
.mega small{font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:44px;line-height:1.05;letter-spacing:.03em;color:${RED}}
.mega.red{background:${RED};margin-top:24px}.mega.red b{color:#fff}.mega.red small{color:#fff}
.spec{display:flex;align-items:center;gap:22px;width:max-content;margin-top:24px;padding:6px 28px 6px;background:${YEL}}
.spec b{font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:120px;line-height:1.05;color:${INK}}
.spec span{font-family:Inter,sans-serif;font-weight:800;font-size:34px;line-height:1.2;color:${INK}}
.spec i{font-style:normal;display:inline-block}.spec u{text-decoration:none;color:${RED}}
.note{display:inline-block;margin-top:22px;font-family:Inter,sans-serif;font-weight:800;font-size:28px;color:${INK};background:${YEL};border:4px solid ${INK};padding:6px 14px}
.bars{padding:16px 24px 18px;width:860px;box-sizing:border-box}
.br{align-items:center;gap:16px;margin:8px 0}
.br b{width:190px;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:56px;color:${INK}}
.br .tr{flex:1;height:58px;border:4px solid ${INK};background:#EDEFF1;position:relative}
.br .fl{position:absolute;left:0;top:0;bottom:0;transform-origin:0 50%}
.br .fl.ch{width:100%;background:${RED};border:0;padding:0;box-shadow:none;transform:none;border-radius:0}
.br .fl.de{width:2.63%;background:${INK}}
.br em{width:150px;text-align:right;font-style:normal;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:64px;color:${RED}}
.q{margin-top:28px;padding:18px 28px 14px;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:58px;line-height:1.05;letter-spacing:.02em;color:#fff;background:${RED};max-width:820px}`;

for (const f of ["RoomEnvironment.js", "swiss.js"]) copyFileSync(`PROJECT/lib-extra/${f}`, `PROJECT/HyperFrames_Remotion/assets/lib/${f}`);
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP19_SWISS_BUNKER_NUKLIR",
  ep: "19", bg: BG, vig: 0.2, grain: 0.05, capfloor: 0.0, html, css, chipFont: BODY, chipColor: INK,
  chip: "ILUSTRASI SKEMATIK &middot; BUKAN FOTO",
  extraAt: ["s1:tempat", "s1:Bahkan", "s1:semua", "s2:Eropa", "s3:wajib", "s3:serangan", "s4:1978", "s4:bunker", "s4:menahan", "s5:Terowongan", "s5:disiapkan", "s5:bahan", "s5:empat",
    "s6:tiga", "s6:5.100", "s6:114", "s7:Jerman", "s7:olahraga", "s7:kewajiban", "s8:Negara", "s8:Menurut", "s4:tujuh", "s4:megaton"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.spec')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-70,rotation:-2},{opacity:1,x:0,rotation:0,duration:.3,ease:'back.out(2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:2,opacity:0,rotation:-12},{scale:1,opacity:1,rotation:-4,duration:.2,ease:'power4.in',immediateRender:false},t);},
 cut:(e,t)=>{const L=e.querySelector('.l'),R=e.querySelector('.r');tl.set(e,{opacity:1},t-.5);
  tl.fromTo(L,{x:-1150},{x:0,duration:.36,ease:'power3.in',immediateRender:false},t-.42);tl.fromTo(R,{x:1150},{x:0,duration:.36,ease:'power3.in',immediateRender:false},t-.42);
  tl.to(L,{x:-1150,y:-120,duration:.5,ease:'power3.out'},t+.08);tl.to(R,{x:1150,y:120,duration:.5,ease:'power3.out'},t+.08);tl.set(e,{opacity:0},t+.62);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-80,rotation:-1.5},{opacity:1,x:0,rotation:0,duration:.34,ease:'back.out(1.8)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:70,duration:.2,ease:'power2.in'},b-.2)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Bangers,'Luckiest Guy',sans-serif;font-weight:400;font-size:74px;line-height:1.08;letter-spacing:.03em;color:#fff;-webkit-text-stroke:11px ${INK};paint-order:stroke fill;text-shadow:6px 7px 0 ${INK}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${RED}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:28},{opacity:1,y:0,duration:.2,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bunker Nuklir Swiss", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
