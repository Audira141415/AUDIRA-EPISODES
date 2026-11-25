// EP01 THE LID. Briefing-room look: amber survey brackets, mono telemetry, panels scanned in top to bottom. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFBE55", COLD = "#6FD3FF", WARM = "#FF7A45", INK = "#0E0A07";

// Sounding chart: height up, temperature right. Normal air cools with height; the inversion is the kink where it warms.
const chart = (id, path, label, ly = 112) => `<svg class="snd" id="${id}" viewBox="0 0 440 300">
<line x1="40" y1="270" x2="430" y2="270" class="ax"/><line x1="40" y1="270" x2="40" y2="12" class="ax"/>
<text x="430" y="294" class="tx" text-anchor="end">SUHU &#8594;</text><text x="48" y="22" class="tx">TINGGI</text>
<rect x="40" y="118" width="390" height="46" class="band"/>
<path d="${path}" class="ln"/>
<text x="424" y="${ly}" class="tx am" text-anchor="end">${label}</text></svg>`;
const NORMAL = "M330 262 L270 200 L210 140 L150 80 L90 20";
const INV = "M330 262 L270 200 L238 166 L300 122 L240 62 L180 20";
const WEAK = "M330 262 L270 200 L242 162 L250 126 L190 66 L130 18";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 01</div>
  <div class="h0">ES KERING<br><i>vs</i> KABUT ASAP</div>
  <div class="tl">Kenapa es ditabur dari pesawat?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">PALEMBANG &middot; OKT 2026</div>
  <div class="tel" data-at="s2:50" data-fx="up"><span>JARAK PANDANG</span><b class="ct" data-from="1000" data-to="50" data-a="s2:50" data-d="1.4" data-suf=" m">1.000 m</b></div>
  <div class="ro" data-at="s2:BMKG" data-fx="left"><b>BMKG &middot; BNPB &middot; TNI</b><span>penyemaian es kering dari udara</span></div>
  <div class="ro" data-at="s2:800" data-fx="left"><b>&#8776; 800 KG / SORTI</b><span>pelet kecil, ditabur dari pesawat</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">PROFIL SUHU UDARA</div>
  <div class="cw">
    <div class="ly" data-at="s3:Biasanya" data-fx="fade">${chart("c1", NORMAL, "NORMAL: MAKIN TINGGI MAKIN DINGIN", 40)}</div>
    <div class="ly" data-at="s3:hangat" data-fx="fade">${chart("c2", INV, "INVERSI: LAPISAN HANGAT")}</div>
  </div>
  <div class="ch" data-at="s3:panci" data-fx="up">&#8776; 5.000&ndash;7.000 kaki &middot; asap terkurung di bawahnya</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">ES KERING = CO&#8322; PADAT</div>
  <div class="big" data-at="s4:minus" data-fx="pop">&minus;78,5&nbsp;&deg;C</div>
  <div class="ro" data-at="s4:gas" data-fx="left"><b>PADAT &#8594; GAS</b><span>sublimasi, tanpa jadi cair</span></div>
  <div class="ro" data-at="s4:kilogram" data-fx="left"><b>1 KG &#8594; &#8776; 500 L GAS</b><span>hitungan gas ideal, kubus 79 cm</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">PENYEMAIAN &middot; DIPERCEPAT</div>
  <div class="tel" data-at="s5:menyerap" data-fx="up"><span>PANAS YANG DISERAP</span><b>571 kJ / kg</b></div>
  <div class="ro" data-at="s5:ditabur" data-fx="left"><b>TEPAT DI LAPISAN TUTUP</b><span>&#8776; 1,5&ndash;2 km di atas tanah</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">SKEMA &middot; TIDAK BERSKALA</div>
  <div class="cw">
    <div class="ly">${chart("c3", INV, "SEBELUM", 40)}</div>
    <div class="ly" data-at="s6:mendingin" data-fx="fade">${chart("c4", WEAK, "TUTUP MENDINGIN, INVERSI MELEMAH")}</div>
  </div>
  <div class="ch" data-at="s6:naik" data-fx="up">udara bawah naik &middot; asap bercampur &amp; menyebar</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">HARI PERTAMA &middot; LAPORAN SEMENTARA BNPB</div>
  <div class="tel" data-at="s7:pertama" data-fx="up"><span>JARAK PANDANG</span><b class="ct" data-from="650" data-to="2800" data-a="s7:pertama" data-d="2.2" data-suf=" m">650 m</b></div>
  <div class="ro" data-at="s7:jam" data-fx="left"><b>EFEK &#8776; 3&ndash;5 JAM</b><span>asap bisa kembali menebal</span></div>
  <div class="warn" data-at="s7:hipotesis" data-fx="stamp">BRIN: MASIH HIPOTESIS ILMIAH</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Es" data-fx="up">ES MEMBUKA TUTUP.<br><i>API DIPADAMKAN DI DARAT.</i></div>
  <div class="srcl" data-at="s8:darat" data-fx="fade">Sumber: BMKG, BNPB, BRIN via Kompas, detik, InfoPublik (Okt 2026); Wikipedia &ldquo;Dry ice&rdquo;. Visual 3D adalah simulasi.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:26px;letter-spacing:.08em;color:${INK};background:${AMB};padding:6px 12px;margin-bottom:14px}
.h0{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:150px;line-height:.9;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6)}
.h0 i{font-style:normal;color:${AMB};font-size:90px}
.h2{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:96px;line-height:.98;color:#fff;text-shadow:0 4px 26px rgba(0,0,0,.8)}
.h2 i{font-style:normal;color:${AMB}}
.tl{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:36px;color:#fff;margin-top:12px;text-shadow:0 2px 12px #000}
.tel{position:relative;background:rgba(14,10,7,.72);padding:14px 22px;border:2px solid rgba(255,190,85,.0);margin-top:6px}
.tel:before,.tel:after{content:"";position:absolute;width:30px;height:30px;border:4px solid ${AMB}}
.tel:before{left:-4px;top:-4px;border-right:0;border-bottom:0}.tel:after{right:-4px;bottom:-4px;border-left:0;border-top:0}
.tel span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:28px;letter-spacing:.1em;color:${AMB}}
.tel b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:120px;line-height:1;color:#fff}
.ro{background:rgba(14,10,7,.7);border-left:6px solid ${AMB};padding:10px 18px;margin-top:10px}
.ro b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:58px;line-height:1.02;color:#fff}
.ro span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:28px;line-height:1.2;color:#F3DDBB}
.big{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:190px;line-height:.95;color:${COLD};text-shadow:0 0 40px rgba(111,211,255,.55)}
.cw{position:relative;width:700px;height:478px;background:rgba(14,10,7,.74);border:2px solid rgba(255,190,85,.5)}
.ly{position:absolute;inset:0;padding:12px}
.snd{width:676px;height:454px}
.snd .ax{stroke:#F3DDBB;stroke-width:2.5}.snd .tx{font-family:"IBM Plex Mono",monospace;font-size:15px;font-weight:600;fill:#F3DDBB}
.snd .am{fill:${AMB}}.snd .band{fill:rgba(255,122,69,.22)}.snd .ln{fill:none;stroke:${AMB};stroke-width:6;stroke-linejoin:round}
#c1 .ln{stroke:#F3DDBB}#c1 .band{fill:none}#c4 .ln{stroke:${COLD}}#c4 .band{fill:rgba(111,211,255,.2)}
.ch{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:30px;line-height:1.22;color:#fff;margin-top:12px;text-shadow:0 2px 10px #000}
.warn{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:34px;color:${INK};background:${WARM};padding:8px 16px;margin-top:16px}
.srcl{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:24px;line-height:1.3;color:#fff;margin-top:14px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: INK, vig: 0.42, grain: 0.05, capfloor: 0.4, html, css,
  extraAt: ["s2:50", "s3:inversi", "s3:hangat", "s3:panci", "s4:gas", "s4:kilogram", "s5:ditabur", "s6:mendingin", "s6:naik", "s6:menyebar", "s7:pertama", "s7:jam", "s8:darat"],
  // Panels are scanned in top to bottom like a sensor sweep, and wiped out upward.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0 0 100% 0)',opacity:1},{clipPath:'inset(0 0 0% 0)',duration:.4,ease:'power2.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0 0 100% 0)',duration:.22,ease:'power2.in'},b-.32)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:70px;line-height:1.18;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 6px}`,
// Active word turns amber with a survey bracket underneath.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,190,85,0)"},{color:"#FFBE55",boxShadow:"inset 0 -6px 0 0 rgba(255,190,85,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(255,190,85,0)",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.14,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Lid", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
