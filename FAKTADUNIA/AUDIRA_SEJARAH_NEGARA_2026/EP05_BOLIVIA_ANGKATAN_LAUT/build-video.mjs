// EP05 ALTIPLANO SURVEY. Dark-void Andes point cloud flown like a survey drone; panels wipe in behind a sweep of contour lines. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#05080C", RED = "#D52B1E", YEL = "#F9E300", GRN = "#00A04A", SNOW = "#EEF3F5", TEAL = "#7FF0F5", SLATE = "#A9C1E4", GOLD = "#F2C14E";
const HF = "font-family:'Barlow Condensed',sans-serif";

// Contour-line band used by every panel change: wavy topographic lines that sweep up the frame.
let paths = "";
for (let i = 0; i < 22; i++) {
  const y0 = 40 + i * 38, amp = 18 + (i % 5) * 7, ph = i * 0.9;
  let d = `M -20 ${y0}`;
  for (let x = 0; x <= 1120; x += 40) d += ` L ${x} ${(y0 + Math.sin(x / 140 + ph) * amp + Math.sin(x / 61 + ph * 2) * amp * 0.35).toFixed(1)}`;
  paths += `<path d="${d}" stroke="${i % 6 === 3 ? YEL : TEAL}" stroke-opacity="${i % 6 === 3 ? 0.9 : 0.55}" stroke-width="${i % 6 === 3 ? 3 : 1.6}" fill="none"/>`;
}
const topo = `<svg id="topo" width="1080" height="900" viewBox="0 0 1080 900">${paths}</svg>`;

const html = `${topo}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">FAKTA SEJARAH NEGARA / EP 05</div>
  <div class="h1">TANPA LAUT,<br><span>PUNYA ANGKATAN LAUT</span></div>
  <div class="row" data-at="s1:sekitar" data-fx="left"><b class="nb">&plusmn;<b class="ct" data-from="0" data-to="5000" data-a="s1:sekitar" data-d="1.3">0</b></b><span>PERSONEL<br><i>Armada Boliviana</i></span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">BOLIVIA MERDEKA</div>
  <div class="h2 gd" data-at="s2:1825" data-fx="pop">1825</div>
  <div class="row gdb" data-at="s2:pantai" data-fx="left"><b class="sm gd">PANTAI PASIFIK</b><span>lewat Gurun Atacama, Departemen Litoral</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">PERANG PASIFIK</div>
  <div class="h2">1879</div>
  <div class="vs" data-at="s3:Bolivia" data-fx="left"><b class="rd">BOLIVIA + PERU</b><i>vs</i><b class="sl">CHILE</b></div>
  <div class="st" data-at="s3:lepas" data-fx="stamp">PANTAI BOLIVIA LEPAS</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">PERJANJIAN DAMAI &amp; PERSAHABATAN</div>
  <div class="h2">1904</div>
  <div class="row gdb" data-at="s4:rel" data-fx="left"><b class="sm gd">REL KERETA</b><span>Arica &ndash; La Paz, dibangun Chile</span></div>
  <div class="row gdb" data-at="s4:berdagang" data-fx="left"><b class="sm gd">HAK DAGANG</b><span>lewat pelabuhan Chile</span></div>
</div>
<div class="p" data-in="s5" data-out="s5:Kini">
  <div class="tk">FUERZA FLUVIAL Y LACUSTRE</div>
  <div class="h2" data-at="s5:1963" data-fx="pop">1963</div>
  <div class="row" data-at="s5:sungai" data-fx="left"><b class="sm tl">PASUKAN</b><span>sungai dan danau</span></div>
</div>
<div class="p" data-in="s5:Kini" data-out="s6">
  <div class="tk">KINI BERPATROLI DI</div>
  <div class="row" data-at="s5:Amazon" data-fx="left"><b class="sm tl">SUNGAI</b><span>anak-anak sungai Amazon</span></div>
  <div class="row" data-at="s5:Titicaca" data-fx="left"><b class="sm tl">DANAU</b><span>Titicaca, berbagi dengan Peru</span></div>
  <div class="alt" data-at="s5:3.812" data-fx="up"><b class="ct" data-from="0" data-to="3812" data-a="s5:3.812" data-d="1.6">0</b><span>m<br>dpl</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk">SETIAP <b class="yl">23 MARET</b></div>
  <div class="h2" data-at="s6:Día" data-fx="up">DÍA DEL MAR</div>
  <div class="lb" data-at="s6:Hari" data-fx="fade">HARI LAUT &middot; PLAZA ABAROA, LA PAZ</div>
  <div class="st yb" data-at="s6:tuntutan" data-fx="stamp">TUNTUTAN: AKSES KE LAUT</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">MAHKAMAH INTERNASIONAL (ICJ)</div>
  <div class="row" data-at="s7:2013" data-fx="left"><b class="sm">2013</b><span>Bolivia menggugat Chile</span></div>
  <div class="row" data-at="s7:Oktober" data-fx="left"><b class="sm">1 OKT 2018</b><span>putusan dibacakan</span></div>
  <div class="st sb" data-at="s7:tidak" data-fx="stamp">12 HAKIM: CHILE TIDAK WAJIB BERUNDING</div>
  <div class="lb sm2" data-at="s7:berunding" data-fx="fade">Pengadilan tidak memutus soal kepemilikan wilayah.</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tk">1879 &rarr; 2026</div>
  <div class="h3">LAUT LEPAS<br>HAMPIR <span>150 TAHUN</span></div>
  <div class="row" data-at="s8:berlayar" data-fx="left"><b class="sm tl">TETAP</b><span>berlayar di danau dan sungai</span></div>
  <div class="duo"><i data-at="s8:keras" data-fx="pop">KERAS KEPALA?</i><i data-at="s8:kesetiaan" data-fx="pop">SETIA PADA SEJARAH?</i></div>
</div>`;

const css = `
#topo{position:absolute;left:0;top:0;z-index:12;pointer-events:none;transform:translateY(2000px)}
.p{clip-path:inset(0 0 0% 0)}
.tk{${HF};font-weight:700;font-size:32px;letter-spacing:.14em;color:${TEAL};margin-bottom:10px;text-shadow:0 2px 10px #000}
.tk .yl{color:${YEL};font-weight:700}
.h1{${HF};font-weight:800;font-size:104px;line-height:.98;color:${SNOW};text-shadow:0 4px 26px #000;letter-spacing:.005em}.h1 span{color:${YEL};font-size:84px}
.h2{${HF};font-weight:800;font-size:160px;line-height:.92;color:${SNOW};text-shadow:0 4px 26px #000}
.h3{${HF};font-weight:800;font-size:96px;line-height:1;color:${SNOW};text-shadow:0 4px 22px #000}.h3 span{color:${YEL}}
.gd{color:${GOLD}!important}.tl{color:${TEAL}!important}.rd{color:#FF5A4A!important}.sl{color:${SLATE}!important}
.lb{font-family:Barlow,sans-serif;font-weight:600;font-size:30px;line-height:1.25;color:${SNOW};margin-top:8px;text-shadow:0 2px 10px #000}
.lb.sm2{font-size:26px;opacity:.9;margin-top:12px}
.st{display:inline-block;margin-top:18px;${HF};font-weight:800;font-size:54px;line-height:1.05;padding:8px 20px;color:#fff;background:${RED};box-shadow:0 10px 30px rgba(0,0,0,.6);max-width:900px}
.st.yb{background:${YEL};color:#14100A}.st.sb{background:#3E5876;font-size:50px}
.row{display:flex;gap:18px;align-items:center;margin-top:16px;padding:12px 18px;background:rgba(5,8,12,.74);border-left:6px solid ${TEAL};backdrop-filter:blur(3px)}
.row.gdb{border-left-color:${GOLD}}
.row>b{flex:none;${HF};font-weight:800;font-size:76px;line-height:1;color:${SNOW}}.row>b.sm{font-size:46px}
.row>b b{font-weight:800}
.row span{font-family:Barlow,sans-serif;font-weight:600;font-size:31px;line-height:1.2;color:${SNOW}}.row span i{font-style:normal;color:${TEAL};font-size:27px}
.vs{display:flex;align-items:center;gap:16px;margin-top:6px}.vs b{${HF};font-weight:800;font-size:64px;line-height:1;padding:8px 14px;background:rgba(5,8,12,.78)}.vs i{font-style:normal;${HF};font-weight:600;font-size:44px;color:${SNOW}}
.alt{display:flex;align-items:flex-end;gap:12px;margin-top:14px}.alt b{${HF};font-weight:800;font-size:150px;line-height:.85;color:${TEAL};text-shadow:0 0 30px rgba(70,230,242,.45),0 4px 20px #000}.alt span{${HF};font-weight:700;font-size:40px;line-height:1;color:${SNOW};padding-bottom:6px}
.duo{display:flex;gap:12px;margin-top:20px}.duo i{flex:1;text-align:center;font-style:normal;${HF};font-weight:800;font-size:46px;padding:12px 4px;color:#14100A;background:${YEL}}.duo i+i{background:${SNOW}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.55, grain: 0.06, capfloor: 0.5, html, css, chipFont: "'Barlow Condensed',sans-serif", chipColor: "#CFE3E8",
  chip: "ILUSTRASI RELIEF, BUKAN DATA SURVEI",
  extraAt: ["s2:Bolivia", "s2:pantai", "s3:memicu", "s3:Pasifik", "s3:Bolivia", "s3:Peru", "s3:melawan", "s3:Chile", "s3:Chile#2", "s3:menang", "s3:seluruh", "s3:lepas",
    "s4:rel", "s4:Arica", "s4:La", "s4:Paz", "s5:sungai", "s5:berpatroli", "s5:Amazon", "s5:Danau", "s5:Titicaca", "s5:3.812",
    "s6:Setiap", "s6:berparade", "s7:putusannya", "s7:keluar", "s7:wajib", "s7:berunding", "s8:tetap", "s8:Menurut", "s5:Kini"],
  // Panels are revealed from the bottom up while a band of contour lines sweeps over them.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(100% 0 0 0)',opacity:1},{clipPath:'inset(0% 0 0 0)',duration:.55,ease:'power2.out',immediateRender:false},a-.18);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0 0 100% 0)',duration:.3,ease:'power2.in'},b-.3)`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.3,ease:'power2.out'},OUT);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:74px;line-height:1.12;word-spacing:.1em;color:#fff;text-shadow:0 3px 14px #000,0 0 4px #000}
.w{display:inline-block;border-bottom:4px solid rgba(213,43,30,0);padding-bottom:2px}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",borderBottomColor:"rgba(213,43,30,0)"},{color:"${YEL}",borderBottomColor:"rgba(213,43,30,1)",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",borderBottomColor:"rgba(213,43,30,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:16,opacity:.15},{y:0,opacity:1,duration:.14,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Altiplano Survey", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
