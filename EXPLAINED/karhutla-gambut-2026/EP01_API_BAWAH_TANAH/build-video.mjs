// API BAWAH TANAH. Panels read like field notes from a thermal survey; they wipe downward because the story digs. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CHAR = "#120C09", EMB = "#FF6A1F", HAZE = "#F2B84B", WAT = "#6FDCEC", BONE = "#F4EBDD";

const html = `
<div class="pl" id="pl0"><i></i><b>Sumsel</b><span>170.775 ha</span></div>
<div class="pl" id="pl1"><i></i><b>Kalbar</b><span>277.127 ha</span></div>
<div class="pl" id="pl2"><i></i><b>Kalteng</b><span>220.330 ha</span></div>
<div class="pl" id="pl3"><i></i><b>NTT</b><span>223.193 ha</span></div>
<div class="pl" id="pl4"><i></i><b>Papua Selatan</b><span>319.120 ha</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">REKONSTRUKSI 3D &middot; BUKAN REKAMAN ASLI</div>
  <div class="h0">TANAHNYA<br><em>MENDIDIH?</em></div>
</div>
<div class="p" data-in="s2" data-out="s2:bukan">
  <div class="tag">PALANGKA RAYA &middot; OKTOBER 2026</div>
  <div class="row" data-at="s2:viral" data-fx="up"><b>LUBANG API</b><span>direkam relawan, viral di media sosial</span></div>
</div>
<div class="p" data-in="s2:bukan" data-out="s3">
  <div class="tag">BNPB</div>
  <div class="h1"><s>LAVA</s></div>
  <div class="row" data-at="s2:api" data-fx="up"><b>GROUND FIRE</b><span>api di bawah permukaan gambut</span></div>
</div>
<div class="p" data-in="s3" data-out="s3:Bara">
  <div class="tag">PENAMPANG &middot; ILUSTRASI, TIDAK BERSKALA</div>
  <div class="row" data-at="s3:tumpukan" data-fx="up"><b>GAMBUT</b><span>sisa tumbuhan, terkumpul ribuan tahun</span></div>
  <div class="note wat" data-at="s3:basah" data-fx="fade">Basah: menyimpan air</div>
  <div class="note" data-at="s3:kering" data-fx="fade">Kering: bahan bakar</div>
</div>
<div class="p" data-in="s3:Bara" data-out="s3:ambles">
  <div class="tag">PENAMPANG &middot; ILUSTRASI, TIDAK BERSKALA</div>
  <div class="row" data-at="s3:Bara" data-fx="up"><b>MEMBARA TANPA NYALA</b><span>smouldering combustion, merambat dalam lapisan</span></div>
</div>
<div class="p" data-in="s3:ambles" data-out="s4">
  <div class="tag">PENAMPANG &middot; ILUSTRASI, TIDAK BERSKALA</div>
  <div class="row" data-at="s3:ambles" data-fx="up"><b>TANAH AMBLES</b><span>rongga terbuka, keluar asap dan pijar</span></div>
</div>
<div class="p" data-in="s4" data-out="s4:kanal-.2">
  <div class="tag">KENAPA KERING?</div>
  <div class="row" data-at="s4:proyek" data-fx="up"><b class="nb">1 JUTA HEKTARE</b><span>lumbung pangan era Soeharto, Kalteng, 1990-an. Gagal, gambutnya telanjur kering.</span></div>
</div>
<div class="p" data-in="s4:kanal-.2" data-out="s5">
  <div class="tag">MUKA AIR TURUN</div>
  <div class="row" data-at="s4:kanal" data-fx="up"><b>KANAL KEBUN</b><span>di Kalsel, Pantau Gambut pernah baru bertemu air di kedalaman 70 cm</span></div>
  <div class="note" data-at="s4:El" data-fx="fade">+ El Ni&ntilde;o dan kemarau panjang</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">DRONE TERMAL &middot; ILUSTRASI</div>
  <div class="row" data-at="s5:mata" data-fx="up"><b>MATA: PADAM</b></div>
  <div class="row hot" data-at="s5:sensor" data-fx="up"><b>SENSOR: BARA</b><span>WWF Indonesia, lanskap Sebangau-Katingan</span></div>
  <div class="note" data-at="s5:satelit" data-fx="fade">Sulit terdeteksi satelit biasa, BNPB</div>
</div>
<div class="p" data-in="s6" data-out="s6:Menurut">
  <div class="tag">JAN-SEP 2026 &middot; NUSANTARA ATLAS</div>
  <div class="row" data-at="s6:mencatat" data-fx="up"><b class="nb"><b class="ct" data-from="0" data-to="1.9" data-dec="1" data-a="s6:mencatat" data-d="1.4">0</b> JUTA HEKTARE</b><span>17-23% di gambut. Data lain: MapBiomas 1,1 juta ha (Jan-Sep), SiPongi 202 ribu ha (Jan-Jul)</span></div>
</div>
<div class="p" data-in="s6:Menurut" data-out="s7">
  <div class="tag">SEPTEMBER 2026 &middot; ESTIMASI CREA</div>
  <div class="row" data-at="s6:juta" data-fx="up"><b class="nb"><b class="ct" data-from="0" data-to="57.8" data-dec="1" data-a="s6:juta" data-d="1.1">0</b> JUTA ORANG</b><span>udara tidak sehat hingga berbahaya</span></div>
  <div class="row" data-at="s6:diperkirakan" data-fx="up"><b class="nb">&asymp;3.560 KEMATIAN</b><span>hasil model PM2.5, bukan data tercatat. BNPB minta metodologinya dijelaskan.</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Tiga">
  <div class="tag">KAB. BANJAR, KALSEL</div>
  <div class="row wat" data-at="s7:titik" data-fx="up"><b>TITIK PANAS: NIHIL</b><span>setelah beberapa hari hujan</span></div>
</div>
<div class="p" data-in="s7:Tiga" data-out="s8">
  <div class="tag">KAB. BANJAR, KALSEL</div>
  <div class="row hot" data-at="s7:lima" data-fx="up"><b class="nb">3 NOV: 5 LOKASI</b><span>sedikitnya. Yang terbakar: semak, sawah kering, jerami.</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Api-.1">
  <div class="tag">BNPB &middot; ILUSTRASI, TIDAK BERSKALA</div>
  <div class="row wat" data-at="s8:disuntik" data-fx="up"><b>SUNTIK AIR</b><span>pipa tekanan tinggi menembus gambut</span></div>
  <div class="row wat" data-at="s8:disekat" data-fx="up"><b>SEKAT KANAL</b></div>
  <div class="row wat" data-at="s8:sumur" data-fx="up"><b>SUMUR BOR</b></div>
</div>
<div class="p" data-in="s8:Api-.1" data-out="@END">
  <div class="h2" data-at="s8:Api" data-fx="up">TIDAK PADAM<br>SAAT ASAP HILANG</div>
  <div class="h2 wat" data-at="s8:Ia" data-fx="up">PADAM SAAT<br>GAMBUT BASAH</div>
</div>`;

const css = `
.tag{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;letter-spacing:.03em;color:${CHAR};background:${HAZE};padding:6px 12px;margin-bottom:14px}
.h0{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:158px;line-height:.94;color:${BONE};text-shadow:0 4px 30px rgba(0,0,0,.75)}
.h0 em{font-style:normal;color:${EMB}}
.h1{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:112px;line-height:1;color:${BONE};text-shadow:0 3px 22px rgba(0,0,0,.9)}
.h1 s{text-decoration-color:${EMB};text-decoration-thickness:10px}
.h2{width:fit-content;background:rgba(18,12,9,.72);padding:8px 18px;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:88px;line-height:1.02;color:${BONE};margin-bottom:12px}
.h2.wat{color:${WAT}}
.row{background:rgba(18,12,9,.76);border-left:8px solid ${EMB};padding:10px 18px;margin-top:10px}
.row b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:68px;line-height:1.04;color:${BONE}}
.row b b{display:inline;font-size:inherit}
.row span{display:block;font-family:"Barlow",sans-serif;font-weight:600;font-size:33px;line-height:1.18;color:#fff;margin-top:2px}
.row.hot b{color:${EMB}}
.row.wat{border-left-color:${WAT}}
.row.wat b{color:${WAT}}
.note{display:block;width:fit-content;font-family:"Barlow",sans-serif;font-weight:700;font-size:33px;line-height:1.18;color:${HAZE};margin-top:10px;background:rgba(18,12,9,.68);padding:4px 10px}
.note.wat{color:${WAT}}
.pl{position:absolute;left:0;top:0;z-index:5;opacity:0;padding:6px 14px 8px 16px;white-space:nowrap;background:rgba(18,12,9,.78)}
.pl i{position:absolute;left:0;top:0;bottom:0;width:5px;background:${EMB}}
.pl b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:46px;line-height:1;color:${BONE};}
.pl span{display:block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:26px;color:${HAZE}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  series: "API BAWAH TANAH", bg: CHAR, vig: 0.42, grain: 0.05, capfloor: 0.34, html, css,
  extraAt: ["s1:Air", "s1:Tapi", "s1:bergolak", "s2:Relawan", "s2:bukan", "s3:Bara", "s3:kering", "s3:ambles", "s3:lapisannya", "s4:kanal", "s5:sensor", "s5:mata", "s6:juta", "s6:Menurut", "s6:orang", "s6:sekitar", "s6:hampir", "s6:mencatat", "s6:diperkirakan", "s4:proyek", "s4:El", "s3:tumpukan", "s7:Banjar", "s7:Tiga", "s7:terbakar", "s7:lokasi", "s7:lima", "s8:disuntik", "s8:disekat", "s8:sumur", "s8:dibor", "s8:Api", "s8:Ia", "s8:basah"],
  // The story digs: panels unroll downward and sink when they leave.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0 0 100% 0)',opacity:1},{clipPath:'inset(0 0 -6% 0)',duration:.32,ease:'power3.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:46,opacity:0,duration:.18,ease:'power2.in'},b-.18)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:72px;line-height:1.1;color:${BONE};text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 5px;position:relative}`,
// Active word smoulders: it heats to ember from below, then cools to ash.
(id, w) => `tl.fromTo("#${id}",{color:"${BONE}",y:0},{color:"${EMB}",y:-5,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${BONE}",y:0,duration:.16},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:-14,opacity:0},{y:0,opacity:1,duration:.12,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Api Bawah Tanah", CHAR);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
