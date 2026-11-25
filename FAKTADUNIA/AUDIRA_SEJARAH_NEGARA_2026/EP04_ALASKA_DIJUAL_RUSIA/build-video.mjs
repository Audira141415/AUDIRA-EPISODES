// EP04 ALASKA DIJUAL RUSIA. VINTAGEFORGE + DATAPHYSICAL: a hand-inked 1867 map of the North Pacific on a parchment sheet,
// lit by candles on a writing desk. Panels arrive as an ink blot and leave like a turned page. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAR = "#E9D9B6", INK = "#3A2A1A", COP = "#B0643A", GRN = "#3E5B3A", NAVY = "#1F3550", GOLD = "#C9A24A", RED = "#8E2A1E", BG = "#120B06";

// Engraved oval vignette: a generic bust in silhouette, never a likeness.
const bust = (v) => `<svg viewBox="0 0 120 150" class="bust"><defs><radialGradient id="vg${v}" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#F3E6C8"/><stop offset="1" stop-color="#CDB486"/></radialGradient></defs>
<ellipse cx="60" cy="75" rx="56" ry="71" fill="url(#vg${v})" stroke="${INK}" stroke-width="3"/><ellipse cx="60" cy="75" rx="50" ry="65" fill="none" stroke="${INK}" stroke-width="1.2"/>
<g fill="${INK}"><path d="M60 34c-15 0-24 11-24 25 0 10 4 17 9 22-2 4-6 6-13 9-11 4-17 11-19 27 13 13 28 19 47 19s34-6 47-19c-2-16-8-23-19-27-7-3-11-5-13-9 5-5 9-12 9-22 0-14-9-25-24-25z"/>
${v === 1 ? `<path d="M41 58c-4 6-4 16 0 24l4-2c-2-6-2-14 0-20z M79 58c4 6 4 16 0 24l-4-2c2-6 2-14 0-20z"/>` : v === 2 ? `<path d="M48 72c6 4 18 4 24 0l2 4c-8 5-20 5-28 0z"/>` : `<path d="M38 44l6-12 8 6 8-9 8 9 8-6 6 12z"/>`}</g></svg>`;
const tag = (v, name, role, at, extra = "") => `<div class="tag" data-at="${at}" data-fx="ink">${bust(v)}<div><b>${name}</b><span>${role}</span>${extra}</div></div>`;
const sabers = `<svg viewBox="0 0 60 60" class="ic"><g stroke="${PAR}" stroke-width="5" stroke-linecap="round"><path d="M10 50L48 8M50 50L12 8"/><path d="M6 42l10 10M54 42L44 52" stroke-width="7"/></g></svg>`;

let html = `<div id="sep"></div>
<div class="blot" data-at="s6:18-0.4" data-fx="blot"></div><div class="blot b2" data-at="s7:Alaska-0.35" data-fx="blot"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 04</div>
  <div class="h1">Alaska,<br><em>dijual murah</em></div>
  <div class="card row" data-at="s1:satu" data-fx="ink"><b class="num"><b class="ct" data-from="0" data-to="1518800" data-a="s1:satu" data-d="1.7">0</b> km²</b><span>wilayah yang dilepas Rusia</span></div>
  <div class="card row cp" data-at="s1:Sekitar" data-fx="ink"><b class="num">&asymp; 2 sen</b><span>dolar per acre</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">ABAD KE-19 &middot; AMERIKA RUSIA</div>
  <div class="h2">Pos dagang bulu</div>
  <div class="card row" data-at="s2:berang-berang" data-fx="ink"><b class="num">&plusmn; 300.000</b><span>berang-berang laut sebelum diburu</span></div>
  <div class="st" data-at="s2:habis" data-fx="stamp">HAMPIR HABIS DIBURU</div>
  <div class="card row rd" data-at="s2:Krimea" data-fx="ink">${sabers}<span><b class="sm">KALAH PERANG KRIMEA</b><br>1853&ndash;1856, kas negara terkuras</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kk">MASALAH TERBESAR</div>
  <div class="h2">Sulit dipertahankan</div>
  <div class="card row rd" data-at="s3:Inggris" data-fx="ink"><b class="sm">INGGRIS</b><span>bisa merebutnya dari Kanada</span></div>
  ${tag(3, "Tsar Alexander II", "Kaisar Rusia: lebih baik dijual ke Amerika", "s3:dijual")}
</div>
<div class="p" data-in="s4" data-out="s4:Harganya">
  <div class="kk">WASHINGTON &middot; 30 MARET 1867</div>
  <div class="card row" data-at="s4:Jam" data-fx="ink"><b class="num big">04.00</b><span>pagi, setelah negosiasi semalam suntuk</span></div>
  <div class="tags">${tag(1, "William H. Seward", "Menlu AS", "s4:William")}${tag(2, "Eduard de Stoeckl", "Diplomat Rusia", "s4:Eduard")}</div>
</div>
<div class="p" data-in="s4:Harganya" data-out="s5">
  <div class="kk">HARGA PEMBELIAN</div>
  <div class="mega"><small>US$</small><b class="ct" data-from="0" data-to="7.2" data-dec="1" data-a="s4:7,2" data-d="1.2">0,0</b><small>juta</small></div>
  <div class="card row" data-at="s4:dolar" data-fx="ink"><b class="num sm">72 koin</b><span>1 koin di timbangan = US$100.000</span></div>
  <div class="lb" data-at="s4:dolar" data-fx="fade">dibayar dalam emas &middot; &asymp; US$4,74 per km²</div>
</div>
<div class="p" data-in="s5" data-out="s5:Ada">
  <div class="kk">SENAT AS &middot; 9 APRIL 1867</div>
  <div class="vote"><div data-at="s5:37" data-fx="pop"><b class="num nv">37</b><span>SETUJU</span></div><i data-at="s5:lawan" data-fx="fade">&ndash;</i><div data-at="s5:dua" data-fx="pop"><b class="num rd2">2</b><span>MENOLAK</span></div></div>
  <div class="lb" data-at="s5:dua" data-fx="fade">perjanjian diratifikasi</div>
</div>
<div class="p" data-in="s5:Ada" data-out="s6">
  <div class="kk">EJEKAN DI KORAN</div>
  <div class="h2"><em>&ldquo;Seward&rsquo;s Folly&rdquo;</em></div>
  <div class="lb">kebodohan Seward &middot; juga &ldquo;Seward&rsquo;s Icebox&rdquo;</div>
  <div class="card row" data-at="s5:penelusuran" data-fx="ink"><b class="sm">PULUHAN KORAN</b><span>ditelusuri ulang oleh sejarawan</span></div>
  <div class="card row" data-at="s5:mendukung" data-fx="ink"><b class="sm">MAYORITAS</b><span>koran mendukung atau netral (penelusuran 48 koran besar)</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">SITKA &middot; 18 OKTOBER 1867</div>
  <div class="h2">Bendera diturunkan</div>
  <div class="lb it" data-at="s6:Menurut" data-fx="fade">menurut catatan seorang saksi:</div>
  <div class="tries"><div data-at="s6:tiang" data-fx="pop"><b>I</b><span>gagal</span></div><div data-at="s6:tentara" data-fx="pop"><b>II</b><span>gagal</span></div><div class="ok" data-at="s6:berhasil" data-fx="pop"><b>III</b><span>berhasil</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s7:Tahun">
  <div class="kk">GANTI KALENDER</div>
  <div class="cal"><div data-at="s7:Julian" data-fx="ink"><span>JULIAN</span><b class="num">6 Okt</b></div><div class="nv" data-at="s7:Gregorian" data-fx="ink"><span>GREGORIAN</span><b class="num">18 Okt</b></div></div>
  <div class="st" data-at="s7:dua" data-fx="stamp">SELISIH 12 HARI</div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  <div class="kk">NEGARA BAGIAN</div>
  <div class="mega"><b class="num">1959</b></div>
  <div class="card row" data-at="s7:resmi" data-fx="ink"><b class="num sm">ke-49</b><span>Alaska resmi jadi negara bagian AS</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">HARI INI</div>
  <div class="card row cp" data-at="s8:Dua" data-fx="ink"><b class="num">2 sen</b><span>per acre, tahun 1867</span></div>
  <div class="card row" data-at="s8:terluas" data-fx="ink"><b class="sm">TERLUAS</b><span>negara bagian terbesar di Amerika Serikat</span></div>
  <div class="duo"><i data-at="s8:rugi" data-fx="pop">RUGI BESAR?</i><i data-at="s8:masuk" data-fx="pop">MASUK AKAL?</i></div>
</div>`;
// every digit run gets Georgia (serif display faces misdraw 1 as I)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<span class="g">$1</span>') + "<");

const SERIF = `"EB Garamond",Georgia,serif`, HEAD = `"Playfair Display",Georgia,serif`;
const css = `
#sep{position:absolute;inset:0;z-index:8;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(80,46,14,0) 46%,rgba(60,32,10,.38) 82%,rgba(30,14,4,.7) 100%);mix-blend-mode:multiply}
.p{transform-origin:0% 50%}
.g,.num,.ct{font-family:Georgia,serif!important;font-variant-numeric:lining-nums}
.p span.g{display:inline!important;font-size:inherit!important;font-weight:inherit!important;color:inherit!important;letter-spacing:inherit!important;margin:0!important;font-style:inherit!important;line-height:inherit!important}
.kk{display:inline-block;font-family:Georgia,serif;font-weight:700;font-size:26px;letter-spacing:.14em;color:${PAR};background:${INK};padding:7px 16px 6px;margin-bottom:14px;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.h1{display:inline-block;background:rgba(40,26,14,.86);padding:4px 22px 14px;box-shadow:0 14px 34px rgba(0,0,0,.45);font-family:${HEAD};font-weight:800;font-size:112px;line-height:.98;color:${PAR};text-shadow:0 4px 24px rgba(0,0,0,.85),0 0 2px #000}
.h1 em{font-style:italic;font-weight:700;color:#E8A877}
.h2{display:inline-block;background:rgba(40,26,14,.86);padding:2px 20px 10px;box-shadow:0 14px 34px rgba(0,0,0,.45);font-family:${HEAD};font-weight:800;font-size:82px;line-height:1.02;color:${PAR};text-shadow:0 4px 22px rgba(0,0,0,.85),0 0 2px #000;margin-bottom:6px}
.h2 em{font-style:italic;font-weight:700}
.card{background:linear-gradient(170deg,#F1E4C6,${PAR} 55%,#D9C499);color:${INK};border:2px solid ${INK};outline:1px solid ${INK};outline-offset:-8px;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.row{display:flex;gap:20px;align-items:center;margin-top:16px;padding:14px 22px}
.row b{flex:none;font-family:${HEAD};font-weight:800;font-size:64px;line-height:1;color:${INK}}
.row b.big{font-size:84px}.row b.sm{font-size:42px;color:${COP}}
.row span{font-family:${SERIF};font-weight:600;font-size:33px;line-height:1.16;color:${INK}}
.row.cp b{color:${COP}}
.row.rd{border-color:${RED};outline-color:${RED}}.row.rd b.sm,.row.rd span b.sm{color:${RED}}
.row .ic{flex:none;width:70px;height:70px;background:${RED};border-radius:50%;padding:10px;box-sizing:border-box}
.row span b.sm{font-family:${HEAD};font-size:38px}
.lb{display:inline-block;background:rgba(40,26,14,.8);padding:4px 16px 6px;font-family:${SERIF};font-weight:600;font-size:34px;line-height:1.2;color:${PAR};margin-top:12px;text-shadow:0 2px 12px rgba(0,0,0,.95)}
.lb.it{font-style:italic}
.st{display:inline-block;margin-top:18px;font-family:Georgia,serif;font-weight:700;font-size:44px;letter-spacing:.06em;padding:8px 20px;color:${RED};border:5px double ${RED};background:rgba(233,217,182,.92);transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.st.gr{color:${GRN};border-color:${GRN}}
.tag{display:flex;align-items:center;gap:20px;margin-top:16px;padding:12px 22px 12px 14px;background:linear-gradient(170deg,#F1E4C6,${PAR} 60%,#D9C499);border:2px solid ${INK};box-shadow:0 14px 34px rgba(0,0,0,.5)}
.tag .bust{flex:none;width:104px;height:130px}
.tags{display:flex;gap:12px}.tags .tag{flex:1;gap:10px;padding:10px 12px 10px 8px}.tags .bust{width:70px;height:88px}.tags .tag b{font-size:34px}.tags .tag span{font-size:25px}
.blot{position:absolute;left:-760px;top:-340px;width:2600px;height:2600px;border-radius:47% 53% 51% 49%/52% 46% 54% 48%;background:radial-gradient(circle at 50% 50%,#1C1108 62%,#2A190B 70%,rgba(28,17,8,0) 71%);z-index:9;pointer-events:none}.blot.b2{border-radius:53% 47% 45% 55%/48% 54% 46% 52%}
.tag b{display:block;font-family:${HEAD};font-weight:800;font-size:44px;line-height:1.04;color:${INK}}
.tag span{display:block;font-family:${SERIF};font-weight:600;font-style:italic;font-size:30px;line-height:1.15;color:${COP};margin-top:4px}
.mega{display:flex;align-items:baseline;gap:14px;color:${PAR};text-shadow:0 6px 26px rgba(0,0,0,.9),0 0 2px #000}
.mega b{font-family:Georgia,serif;font-weight:700;font-size:200px;line-height:.95;color:#F0C46A}
.mega small{font-family:Georgia,serif;font-weight:700;font-size:58px}
.vote{display:flex;align-items:center;gap:22px}
.vote>div{flex:1;text-align:center;padding:14px 8px 16px;background:linear-gradient(170deg,#F1E4C6,${PAR} 60%,#D9C499);border:2px solid ${INK};box-shadow:0 14px 34px rgba(0,0,0,.5)}
.vote b{display:block;font-weight:700;font-size:170px;line-height:1}.vote b.nv{color:${NAVY}}.vote b.rd2{color:${RED}}
.vote span{display:block;font-family:Georgia,serif;font-weight:700;font-size:30px;letter-spacing:.14em;color:${INK}}
.vote i{font-style:normal;font-family:Georgia,serif;font-size:90px;color:${PAR};text-shadow:0 2px 12px #000}
.tries{display:flex;gap:16px;margin-top:16px}
.tries>div{flex:1;text-align:center;padding:10px 4px 12px;background:linear-gradient(170deg,#F1E4C6,${PAR} 60%,#D9C499);border:2px solid ${INK};box-shadow:0 12px 28px rgba(0,0,0,.5)}
.tries b{display:block;font-family:Georgia,serif;font-weight:700;font-size:64px;line-height:1;color:${RED}}
.tries span{display:block;font-family:${SERIF};font-weight:700;font-size:30px;color:${INK}}
.tries .ok{border-color:${GRN};outline:3px solid ${GRN}}.tries .ok b{color:${GRN}}
.cal{display:flex;gap:18px}
.cal>div{flex:1;padding:12px 16px 14px;background:linear-gradient(170deg,#F1E4C6,${PAR} 60%,#D9C499);border:2px solid ${INK};border-top:14px solid ${COP};box-shadow:0 14px 34px rgba(0,0,0,.5)}
.cal>div.nv{border-top-color:${NAVY}}
.cal span{display:block;font-family:Georgia,serif;font-weight:700;font-size:28px;letter-spacing:.14em;color:${INK}}
.cal b{display:block;font-weight:700;font-size:96px;line-height:1.02;color:${INK}}
.duo{display:flex;gap:14px;margin-top:18px}
.duo i{flex:1;text-align:center;font-style:normal;font-family:${HEAD};font-weight:800;font-size:46px;padding:16px 4px;color:${PAR};background:${INK};border:2px solid ${GOLD};box-shadow:0 12px 28px rgba(0,0,0,.5)}
.duo i:last-child{background:${COP};color:#FFF4DE}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.5, grain: 0.11, capfloor: 0.0, html, css, chipFont: "Georgia,serif", chipColor: PAR,
  chip: "ILUSTRASI SEJARAH &middot; BUKAN DOKUMEN ASLI",
  extraAt: ["s1:kilometer", "s1:sen", "s2:Rusia", "s2:Alaska", "s2:bulu", "s2:hampir", "s3:Kanada", "s3:merebutnya", "s3:Amerika", "s4:semalam", "s4:menandatangani", "s4:perjanjian", "s4:7,2", "s5:Senat", "s5:menyetujui", "s5:Seward's", "s6:Sitka", "s6:diturunkan", "s6:tersangkut", "s6:dan", "s6:ketiga", "s6:menurunkannya", "s7:Alaska", "s7:serah", "s7:1959", "s8:Rusia", "s8:keputusannya"],
  fxExtra: `blot:(e,t)=>{tl.fromTo(e,{scale:0,opacity:1,rotation:-20},{scale:1,rotation:0,duration:.34,ease:"power2.in"},t);tl.to(e,{opacity:0,scale:1.15,duration:.4,ease:"power1.out"},t+.62);},
ink:(e,t)=>tl.fromTo(e,{clipPath:'circle(0% at 14% 50%)',opacity:1},{clipPath:'circle(150% at 14% 50%)',duration:.5,ease:'power2.out'},t),`,
  // an ink blot spreads from the top-left corner; the panel leaves like a page turned over its left edge
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'circle(0% at 6% 10%)',opacity:1,rotationY:-10,transformPerspective:1600},{clipPath:'circle(170% at 6% 10%)',rotationY:0,duration:.6,ease:'power2.inOut'},a-.2)`,
  panelOut: `(tl,p,b)=>tl.to(p,{rotationY:-92,transformPerspective:1600,opacity:0,duration:.34,ease:'power2.in'},b-.32)`,
});

// Captions: the estimate keeps the {display|spoken} markup on split words; join them for the strip.
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
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"EB Garamond",Georgia,serif;font-weight:700;font-size:60px;line-height:1.12;word-spacing:.08em;color:${INK};padding:14px 26px 16px;background:linear-gradient(175deg,#F3E7CB,${PAR} 50%,#D8C397);border-top:3px double ${INK};border-bottom:3px double ${INK};box-shadow:0 14px 34px rgba(0,0,0,.55)}
.w{display:inline-block}.w.n{font-family:Georgia,serif;font-size:56px}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${INK}"},{color:"${COP}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
const cp = "PROJECT/HyperFrames_Remotion/compositions/captions.html";
writeFileSync(cp, readFileSync(cp, "utf8").replace(/<span class="w" (id="w\d+")>([^<]*\d[^<]*)<\/span>/g, '<span class="w n" $1>$2</span>'));
writeIndex(".", TL, "Alaska Dijual Rusia", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
