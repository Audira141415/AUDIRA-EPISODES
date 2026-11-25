// EP13 TURKI GANTI ALFABET. TEXTVOYAGE: monumental extruded letters in brushed concrete and titanium under warm light.
// Ottoman-script tablets (real Arabic-script glyphs, Amiri) turn gently and give way to Latin monoliths (Archivo Black).
// Stations change under a letterform wipe: a giant Turkish letter sweeps across, a concrete slab covers the cut.
// Panels are graphite plates with titanium edges. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#E30A17", GOLD = "#D4AF37", IV = "#EDE7DC", GR = "#232427", TI = "#9AA0A8", BG = "#15120F";
const HEAD = `"Archivo Black","Arial Black",sans-serif`, BODY = `"Source Serif 4",Georgia,serif`;

const sil = `<svg viewBox="0 0 64 64" class="sil"><rect width="64" height="64" fill="#3A3D43"/><circle cx="32" cy="24" r="11" fill="${TI}"/><path d="M10 64c2-14 11-21 22-21s20 7 22 21z" fill="${TI}"/></svg>`;
const tag = (name, role, a) => `<div class="tag" data-at="${a}" data-fx="card">${sil}<div><b>${name}</b><span>${role}</span></div></div>`;
const card = (b, s, a, cls = "") => `<div class="card ${cls}" data-at="${a}" data-fx="card"><b>${b}</b><span>${s}</span></div>`;
const chip = (txt, a, c = "") => `<i class="ch ${c}" data-at="${a}" data-fx="card" data-d="inline-block">${txt}</i>`;
const date = (d, s, a) => `<div class="date" data-at="${a}" data-fx="card"><b>${d}</b><span>${s}</span></div>`;
const wipe = (a, l1, l2) => `<div class="wipe" data-at="${a}-0.5" data-fx="wipe"><b>${l1}</b><i></i><b>${l2}</b></div>`;

let html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Archivo+Black&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=block">
<div class="pre"><span style="font-family:Amiri,serif;font-weight:700">&#x643;&#x62A;&#x627;&#x628;</span><span style="font-family:Amiri,serif;font-weight:400">&#x642;&#x644;&#x645;</span><span style="font-family:'Archivo Black',sans-serif">AB</span></div>
${wipe("s2:Ini", "&#350;", "&#286;")}
${wipe("s4:Tahun", "&#220;", "&#199;")}
${wipe("s5:Komisi", "&#304;", "&#214;")}
${wipe("s6:Satu", "&#199;", "&#350;")}
${wipe("s7:Aturannya", "&#286;", "&#220;")}
${wipe("s8:Satu", "&#214;", "&#304;")}
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 13</div>
  <div class="h1">Satu negara<br>ganti <em>semua</em><br>hurufnya</div>
  <div class="sub" data-at="s1:bulan" data-fx="card" data-d="inline-block">dalam hitungan bulan</div>
  <div class="chips" data-at="s1:Koran" data-fx="card" data-d="flex">${chip("KORAN", "s1:Koran")}${chip("PAPAN NAMA", "s1:papan")}${chip("BUKU", "s1:buku", "r")}</div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3:Aksara">
  <div class="kk">TURKI &middot; ERA UTSMANI</div>
  <div class="h2">Ditulis dengan<br>aksara Arab</div>
  <div class="cnt" data-at="s2:seribu" data-fx="card"><b>1.000+</b><span>tahun<br>lebih</span></div>
  <div class="lb" data-at="s2:Utsmani" data-fx="card" data-d="inline-block"><span class="ar">&#x639;&#x62B;&#x645;&#x627;&#x646;&#x644;&#x6CC;&#x62C;&#x647;</span> Osmanl&#305;ca &middot; bahasa Turki Utsmani</div>
</div>
<div class="p" data-in="s3:Aksara" data-out="s3:Usulan">
  <div class="kk">MASALAHNYA</div>
  ${card("AKSARA ARAB", "kaya huruf mati (konsonan)", "s3:mati")}
  ${card("BAHASA TURKI", "kaya huruf vokal", "s3:vokal", "gd")}
  <div class="lb" data-at="s3:ditebak" data-fx="card" data-d="inline-block">vokal ditebak dari konteks &middot; contoh ilustratif</div>
</div>
<div class="p" data-in="s3:Usulan" data-out="s4:Tahun">
  <div class="kk">SEJAK ABAD KE-19</div>
  ${card("USULAN HURUF LATIN", "sudah muncul berkali-kali", "s3:Usulan")}
  <div class="st" data-at="s3:ditentang" data-fx="stamp2">DITENTANG KERAS</div>
  <div class="lb" data-at="s3:konservatif" data-fx="card" data-d="inline-block">oleh kelompok konservatif dan agama</div>
</div>
<div class="p" data-in="s4:Tahun" data-out="s4:Hasilnya">
  <div class="kk rd">1928</div>
  ${tag("Mustafa Kemal Atat&uuml;rk", "Presiden Turki &middot; umumkan rencana", "s4:Presiden")}
  ${card("KOMISI BAHASA", "dibentuk untuk merancang alfabet baru", "s4:Komisi")}
</div>
<div class="p" data-in="s4:Hasilnya" data-out="s5:Komisi">
  <div class="kk">HASILNYA</div>
  <div class="cnt" data-at="s4:29" data-fx="card"><b><b class="ct" data-from="0" data-to="29" data-a="s4:29" data-d="1.0">0</b></b><span>huruf<br>alfabet Latin</span></div>
  <div class="gold" data-at="s4:khusus" data-fx="card"><b>&#199; &#286; I &#304; &#214; &#350; &#220;</b><span>huruf khusus untuk bunyi Turki</span></div>
</div>
<div class="p" data-in="s5:Komisi" data-out="s5:berkeliling">
  <div class="kk">MASA TRANSISI</div>
  <div class="cd"><div class="old" data-at="s5:lima" data-fx="card"><small>usul komisi</small><b>5 TAHUN</b><i class="strike" data-at="s5:memangkasnya" data-fx="grow"></i></div>
  <div class="new" data-at="s5:tiga" data-fx="card"><small>keputusan Atat&uuml;rk</small><b>3 BULAN</b></div></div>
</div>
<div class="p" data-in="s5:berkeliling" data-out="s6:Satu">
  <div class="kk">MOBILISASI ALFABET</div>
  ${tag("Mustafa Kemal Atat&uuml;rk", "berkeliling negeri memperkenalkan huruf baru", "s5:berkeliling")}
  <div class="lb" data-at="s5:negeri" data-fx="card" data-d="inline-block">rute di peta: ilustrasi</div>
</div>
<div class="p" data-in="s6:Satu" data-out="s6:Mulai">
  <div class="kk rd">UNDANG-UNDANG</div>
  ${date("1 November 1928", "UU No. 1353 disahkan", "s6:November")}
</div>
<div class="p" data-in="s6:Mulai" data-out="s6:Mulai#2">
  <div class="kk">WAJIB HURUF BARU</div>
  ${date("1 Desember 1928", "mulai berlaku untuk:", "s6:Desember")}
  <div class="chips">${chip("koran", "s6:koran")}${chip("iklan", "s6:iklan")}${chip("papan nama", "s6:papan", "r")}</div>
</div>
<div class="p" data-in="s6:Mulai#2" data-out="s7:Aturannya">
  <div class="kk">WAJIB HURUF BARU</div>
  ${date("1 Januari 1929", "mulai berlaku untuk:", "s6:Januari")}
  <div class="chips">${chip("semua komunikasi resmi", "s6:komunikasi")}${chip("buku", "s6:buku", "r")}</div>
</div>
<div class="p" data-in="s7:Aturannya" data-out="s8:Satu">
  <div class="kk rd">ATURAN KETAT &middot; 1928&ndash;2013</div>
  <div class="qwx">${["Q", "W", "X"].map((c) => `<b data-at="s7:${c}" data-fx="card" data-d="inline-block">${c}</b>`).join("")}</div>
  <div class="lb" data-at="s7:tidak" data-fx="card" data-d="inline-block">tidak ada dalam alfabet Turki</div>
  <div class="st" data-at="s7:dilarang" data-fx="stamp2">DILARANG DI DOKUMEN RESMI &amp; PAPAN NAMA</div>
</div>
<div class="p" data-in="s8:Satu" data-out="@END">
  <div class="kk">SATU KEPUTUSAN</div>
  <div class="h2">Cara sebuah bangsa<br>menulis berubah</div>
  <div class="q" data-at="s8:Menurut" data-fx="card">Kalau Indonesia ganti huruf, berapa lama kita terbiasa?</div>
</div>`;

const plate = `linear-gradient(170deg,#2E3034,${GR} 60%,#1C1D20)`;
const shadow = `0 18px 36px rgba(0,0,0,.55)`;
const css = `
.pre{position:absolute;left:-3000px;top:0;font-size:40px;opacity:0}
.wipe{position:absolute;left:0;top:0;width:4000px;height:1920px;display:flex;z-index:14;pointer-events:none;opacity:0}
.wipe b{flex:none;width:1300px;height:1920px;display:flex;align-items:center;justify-content:center;font-family:"Archivo Black","Arial Black",sans-serif;font-weight:400;font-size:2100px;line-height:1;color:#CBC4B9;-webkit-text-stroke:16px #8A9099;text-shadow:0 0 60px rgba(0,0,0,.6)}
.wipe i{flex:none;width:1400px;height:1920px;background:linear-gradient(90deg,#8A9099 0 14px,#B9B2A7 14px,#D8D1C6 50%,#B0A99E calc(100% - 14px),#8A9099 calc(100% - 14px))}
.kk{display:inline-block;font-family:${HEAD};font-size:26px;letter-spacing:.14em;color:${IV};background:${GR};border-left:10px solid ${RED};padding:9px 18px 8px;margin-bottom:14px;box-shadow:${shadow}}
.kk.rd{background:${RED};border-left-color:${IV}}
.h1{display:inline-block;background:${plate};border-top:3px solid ${TI};padding:14px 28px 20px;box-shadow:${shadow};font-family:${HEAD};font-size:96px;line-height:1.02;color:${IV};letter-spacing:-.01em}
.h1 em{font-style:normal;color:${RED}}
.h2{display:inline-block;background:${plate};border-top:3px solid ${TI};padding:12px 24px 16px;box-shadow:${shadow};font-family:${HEAD};font-size:62px;line-height:1.06;color:${IV};margin-bottom:4px}
.sub{display:inline-block;margin-top:12px;background:${IV};color:${GR};font-family:${BODY};font-weight:700;font-style:italic;font-size:40px;padding:6px 20px 10px;box-shadow:${shadow}}
.card{display:flex;flex-direction:column;gap:2px;margin-top:14px;padding:12px 24px 15px;background:${plate};border-top:3px solid ${TI};border-left:12px solid ${TI};box-shadow:${shadow}}
.card b{font-family:${HEAD};font-weight:400;font-size:42px;line-height:1.08;color:${IV}}
.card span{font-family:${BODY};font-weight:600;font-size:34px;line-height:1.2;color:#D2CCC2}
.card.gd{border-left-color:${GOLD}}.card.gd b{color:${GOLD}}
.cnt{display:flex;align-items:center;gap:24px;margin-top:16px;padding:4px 28px 10px;background:${plate};border-top:3px solid ${TI};border-left:12px solid ${RED};box-shadow:${shadow};width:max-content}
.cnt>b{font-family:${HEAD};font-weight:400;font-size:132px;line-height:1.08;color:${IV}}
.cnt>b .ct{font:inherit;color:inherit}
.cnt span{font-family:${BODY};font-weight:600;font-size:36px;line-height:1.16;color:#D2CCC2}
.lb{display:inline-block;margin-top:14px;background:rgba(20,20,22,.88);padding:7px 18px 9px;font-family:${BODY};font-style:italic;font-weight:600;font-size:32px;color:${IV};border-left:6px solid ${GOLD}}
.lb .ar{font-family:Amiri,serif;font-style:normal;font-weight:700;font-size:40px;color:${GOLD};margin-right:10px}
.st{display:inline-block;margin-top:16px;font-family:${HEAD};font-size:40px;letter-spacing:.04em;line-height:1.1;padding:10px 22px;color:#fff;background:${RED};transform:rotate(-2deg);box-shadow:${shadow};max-width:860px}
.tag{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 26px 12px 12px;background:${plate};border-top:3px solid ${TI};box-shadow:${shadow}}
.tag .sil{flex:none;width:96px;height:96px;border:3px solid ${TI}}
.tag b{display:block;font-family:${HEAD};font-weight:400;font-size:40px;line-height:1.08;color:${IV}}
.tag span{display:block;font-family:${BODY};font-weight:600;font-style:italic;font-size:31px;line-height:1.18;color:#C9C3B8;margin-top:4px}
.gold{margin-top:16px;padding:10px 24px 14px;background:${plate};border-top:3px solid ${GOLD};box-shadow:${shadow};width:max-content}
.gold b{display:block;font-family:${HEAD};font-weight:400;font-size:70px;letter-spacing:.06em;color:${GOLD};line-height:1.1}
.gold span{display:block;font-family:${BODY};font-weight:600;font-size:32px;color:${IV}}
.cd{display:flex;flex-direction:column;gap:14px}
.cd>div{position:relative;width:max-content;padding:8px 28px 14px;background:${plate};border-top:3px solid ${TI};box-shadow:${shadow}}
.cd small{display:block;font-family:${BODY};font-weight:600;font-style:italic;font-size:30px;color:#C9C3B8}
.cd b{display:block;font-family:${HEAD};font-weight:400;font-size:100px;line-height:1.05;color:${IV}}
.cd .new{border-left:12px solid ${RED}}.cd .new b{color:${RED}}
.cd .strike{position:absolute;left:18px;right:18px;top:62%;height:12px;background:${RED};transform-origin:0 50%}
.date{margin-top:4px;padding:10px 26px 14px;background:${plate};border-top:3px solid ${TI};border-left:12px solid ${GOLD};box-shadow:${shadow};width:max-content}
.date b{display:block;font-family:${HEAD};font-weight:400;font-size:62px;line-height:1.08;color:${IV}}
.date span{display:block;font-family:${BODY};font-weight:600;font-size:32px;color:#C9C3B8}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px}
.ch{font-style:normal;font-family:${BODY};font-weight:700;font-size:38px;padding:8px 22px 11px;background:${IV};color:${GR};box-shadow:${shadow}}
.ch.r{background:${RED};color:#fff}
.qwx{display:flex;gap:16px}
.qwx b{width:120px;height:130px;display:inline-flex;align-items:center;justify-content:center;font-family:${HEAD};font-weight:400;font-size:96px;color:${IV};background:${plate};border:4px solid ${RED};box-shadow:${shadow};background-image:linear-gradient(135deg,transparent 46%,${RED} 46%,${RED} 54%,transparent 54%)}
.q{margin-top:16px;font-family:${HEAD};font-weight:400;font-size:46px;line-height:1.14;padding:16px 26px;color:${IV};background:${plate};border-left:12px solid ${RED};border-bottom:4px solid ${GOLD};box-shadow:${shadow}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP13_TURKI_GANTI_ALFABET",
  ep: "13", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.0, html, css, chipFont: `"Source Serif 4",Georgia,serif`, chipColor: IV,
  chip: "TIPOGRAFI 3D &middot; ILUSTRASI SEJARAH",
  extraAt: ["s1:mengganti", "s2:Ini", "s2:Utsmani", "s3:Aksara", "s3:vokal", "s3:Usulan", "s3:ditentang", "s4:Tahun", "s4:Presiden", "s4:Komisi",
    "s4:Hasilnya", "s4:29", "s4:khusus", "s5:Komisi", "s5:memangkasnya", "s5:tiga", "s5:berkeliling", "s6:Satu", "s6:November", "s6:undang-undangnya",
    "s6:Mulai", "s6:Mulai#2", "s6:Desember", "s6:Januari", "s6:koran", "s6:papan", "s6:buku", "s6:komunikasi", "s7:Aturannya", "s7:2013",
    "s7:Q", "s7:W", "s7:X", "s7:dilarang", "s8:Satu", "s8:Menurut"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.classList.contains('card')||e.classList.contains('tag')||e.classList.contains('cnt')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:26,rotationX:-35,transformPerspective:1400,transformOrigin:'50% 100%'},{opacity:1,y:0,rotationX:0,duration:.45,ease:'power3.out',immediateRender:false},t);},
 stamp2:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.6,rotation:-6,opacity:0},{scale:1,rotation:-2,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},
 wipe:(e,t)=>{gsap.set(e,{x:1080});tl.set(e,{opacity:1},t);tl.fromTo(e,{x:1080},{x:-1460,duration:.45,ease:'power3.out',immediateRender:false},t);tl.to(e,{x:-4100,duration:.36,ease:'power3.in'},t+.53);tl.set(e,{opacity:0},t+.9);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:30},{opacity:1,y:0,duration:.42,ease:'power3.out'},a+.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-20,duration:.25,ease:'power2.in'},b-.3)`,
});

// Captions: join any {display|spoken} split words back for the strip.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Source Serif 4",Georgia,serif;font-weight:700;font-size:56px;line-height:1.16;word-spacing:.06em;color:#FFFFFF;padding:14px 26px 18px;background:linear-gradient(170deg,#303236,#232427 60%,#1C1D20);border-top:3px solid #9AA0A8;box-shadow:0 14px 30px rgba(0,0,0,.55)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"#FF3B30",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Turki Ganti Alfabet", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
