// EP14 FIVE HUNDRED. PRECISION product-CGI look: graphite hypercar, warm sand studio horizon, ceramic-white spec cards with a laser-orange hairline.
// Panels open through a thin horizontal slit (like a calibration shutter) and leave by wiping off to the right. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const OR = "#FF6B00", INK = "#121315", CER = "#F7F7F9", GR = "#5E636B";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 14</div>
  <div class="hero"><b>140 m</b><i>SETIAP DETIK</i></div>
  <div class="tl">Cara kerja mobil <span>500 km/jam</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">1 NOVEMBER &middot; ABU DHABI</div>
  <div class="card big" data-at="s2:mencapai" data-fx="up"><b class="nb"><span class="ct" data-from="0" data-to="503.17" data-dec="2" data-a="s2:mencapai" data-d="2.2">0</span><small>km/jam</small></b><span>jalan raya tertutup</span></div>
  <div class="row" data-at="s2:diakui" data-fx="left"><b>DIAKUI FIA</b><span>untuk satu arah</span></div>
  <div class="row" data-at="s2:Inilah" data-fx="left"><b>MOBIL PRODUKSI PERTAMA</b><span>yang menembus 500 km/jam</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">HAMBATAN UDARA</div>
  <div class="card" data-at="s3:hambatan" data-fx="up"><b class="mid">TENAGA &prop; KECEPATAN<sup>3</sup></b><span>naik pangkat tiga</span></div>
  <div class="bars">
    <div class="bc"><div class="bw"><i class="b1"></i><i class="b2" data-at="s3:Dua" data-fx="growy"></i></div><b>2&times;</b><span>lebih cepat</span></div>
    <div class="bc"><div class="bw"><i class="b1"></i><i class="b3" data-at="s3:delapan" data-fx="growy"></i></div><b class="or">8&times;</b><span>tenaga</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">4 MOTOR &middot; 1 DI TIAP RODA</div>
  <div class="card big" data-at="s4:kilowatt" data-fx="up"><b class="nb">4 &times; 555<small>kW</small></b><span>masing-masing</span></div>
  <div class="row" data-at="s4:total" data-fx="left"><b class="nb"><span class="ct" data-from="0" data-to="2220" data-a="s4:total" data-d="1.4">0</span> kW TOTAL</b><span>hampir 3.000 tenaga kuda</span></div>
  <div class="row" data-at="s4:berputar" data-fx="left"><b class="nb"><span class="ct" data-from="0" data-to="30000" data-a="s4:berputar" data-d="1.8">0</span> /menit</b><span>putaran tiap motor</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">SISTEM LISTRIK</div>
  <div class="card big" data-at="s5:Listriknya" data-fx="up"><b class="nb">1.200<small>V</small></b><span>tegangan tinggi</span></div>
  <div class="row" data-at="s5:tegangan" data-fx="left"><b>TENAGA SAMA &rarr; ARUS KECIL</b><span>tegangan naik, arus turun</span></div>
  <div class="row" data-at="s5:Panas" data-fx="left"><b>PANAS &prop; ARUS<sup>2</sup></b><span>kabel lebih dingin dan ringan</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">BATAS SEBENARNYA: BAN</div>
  <div class="card" data-at="s6:gravitasi" data-fx="up"><b class="mid">RIBUAN &times; GRAVITASI</b><span>gaya sentrifugal di tapak ban</span></div>
  <div class="row" data-at="s6:selebar" data-fx="left"><b class="nb">325 mm</b><span>ban semi-slick khusus</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">BATERAI DIKURAS</div>
  <div class="card" data-at="s7:penuh" data-fx="up"><b class="mid">&plusmn; 2 MENIT</b><span>tenaga penuh sampai isi habis</span><div class="batt"><i data-at="s7:dua" data-fx="drain"></i></div></div>
  <div class="row" data-at="s7:tujuh" data-fx="left"><b>7 km LURUS</b><span>dilahap kurang dari 1 menit</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="trio"><b data-at="s8:udara" data-fx="pop">UDARA</b><b data-at="s8:listrik" data-fx="pop">LISTRIK</b><b data-at="s8:karet" data-fx="pop" class="or">KARET</b></div>
  <div class="srcl" data-at="s8:Lima" data-fx="fade">Sumber: FIA (6 Nov 2026), Top Gear, Electrek, evo, CarNewsChina. Mobil 3D adalah ilustrasi generik, bukan model aslinya.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:25px;letter-spacing:.12em;color:#fff;background:${INK};padding:7px 14px;margin-bottom:14px;border-left:6px solid ${OR}}
.hero{display:flex;flex-direction:column}
.hero b{font-family:Manrope,sans-serif;font-weight:800;font-size:200px;line-height:.9;letter-spacing:-.04em;color:${INK};text-shadow:0 2px 0 rgba(255,255,255,.4)}
.hero i{font-style:normal;font-family:Manrope,sans-serif;font-weight:800;font-size:76px;letter-spacing:.06em;color:${OR};margin-top:4px}
.tl{font-family:Manrope,sans-serif;font-weight:600;font-size:38px;color:${INK};margin-top:14px;background:rgba(247,247,249,.82);display:inline-block;padding:6px 14px}
.tl span{font-weight:800}
.card{background:rgba(247,247,249,.9);border-top:3px solid ${OR};padding:14px 22px 16px;width:780px;box-shadow:0 18px 40px rgba(18,19,21,.22);border-radius:6px}
.card b{display:block;font-family:Manrope,sans-serif;font-weight:800;color:${INK};line-height:1}
.card.big b{font-size:124px;letter-spacing:-.03em}
.card b small{font-size:44px;font-weight:700;margin-left:12px;color:${GR};letter-spacing:0}
.card b.mid{font-size:60px;letter-spacing:-.01em}
.card sup,.row sup{font-size:.55em;color:${OR}}
.card span{display:block;font-family:Manrope,sans-serif;font-weight:500;font-size:30px;color:${GR};margin-top:6px}
.row{background:rgba(18,19,21,.86);border-left:5px solid ${OR};padding:10px 18px;margin-top:12px;width:740px;border-radius:4px}
.row b{display:block;font-family:Manrope,sans-serif;font-weight:800;font-size:46px;line-height:1.08;color:#fff}
.row span{display:block;font-family:Manrope,sans-serif;font-weight:500;font-size:29px;line-height:1.2;color:#C9CCD2}
.bars{display:flex;gap:14px;width:780px;margin-top:12px}
.bc{flex:1;background:rgba(18,19,21,.86);padding:12px 16px;border-radius:4px;text-align:center}
.bw{position:relative;height:190px;display:flex;align-items:flex-end;justify-content:center;gap:18px;border-bottom:2px solid #5E636B}
.bw i{display:block;width:62px;transform-origin:50% 100%}
.b1{height:22px;background:#8B8982}
.b2{height:44px;background:#D8DADF}
.b3{height:176px;background:${OR}}
.bc b{display:block;font-family:Manrope,sans-serif;font-weight:800;font-size:64px;line-height:1;color:#fff;margin-top:8px}
.bc b.or,.trio b.or{color:${OR}}
.bc span{display:block;font-family:Manrope,sans-serif;font-weight:500;font-size:28px;color:#C9CCD2}
.batt{margin-top:12px;height:34px;border:3px solid ${INK};border-radius:6px;padding:4px;position:relative}
.batt:after{content:"";position:absolute;right:-12px;top:8px;width:7px;height:16px;background:${INK};border-radius:0 3px 3px 0}
.batt i{display:block;height:100%;background:linear-gradient(90deg,${OR},#FFB070);transform-origin:0 50%;border-radius:2px}
.card b .ct,.row b .ct{display:inline;font:inherit;color:inherit;margin:0}
.trio{display:flex;flex-direction:column;gap:6px}
.trio b{display:inline-block;align-self:flex-start;font-family:Manrope,sans-serif;font-weight:800;font-size:112px;line-height:1;letter-spacing:-.03em;color:${INK};background:rgba(247,247,249,.86);padding:4px 20px 8px;border-radius:6px}
.srcl{font-family:Manrope,sans-serif;font-weight:500;font-size:24px;line-height:1.3;color:${INK};margin-top:16px;width:760px;background:rgba(247,247,249,.8);padding:8px 12px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/hyperframes/assets/lib/RoomEnvironment.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "14", sig: "EP14_MOBIL_LISTRIK_500", chip: "ILUSTRASI", panelTop: 262,
  bg: "#D9CBB5", vig: 0.26, grain: 0.03, capfloor: 0.5, html, css,
  extraAt: ["s1:detik", "s2:Abu", "s3:Musuh", "s3:hambatan", "s3:Dua", "s3:delapan", "s4:empat", "s4:roda", "s4:Tiap", "s4:berputar", "s5:volt", "s5:Panas", "s5:dingin", "s6:Tapi", "s6:Karet", "s6:sentrifugal", "s6:selebar", "s7:Baterainya", "s7:penuh", "s7:Lintasan", "s7:kurang", "s8:udara", "s8:listrik", "s8:karet"],
  fxExtra: `drain:(e,t)=>tl.fromTo(e,{scaleX:1,opacity:1},{scaleX:.04,duration:2.4,ease:'power1.in'},t),`,
  // Slit shutter: a thin horizontal line opens to the full card; exit wipes right.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(49% 0% 49% 0%)',opacity:1,y:10},{clipPath:'inset(0% 0% 0% 0%)',y:0,duration:.46,ease:'expo.out'},a-.14);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 0% 100%)',x:40,duration:.3,ease:'power2.in'},b-.32)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:70px;right:120px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Manrope,sans-serif;font-weight:800;font-size:60px;line-height:1.22;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.85),0 0 3px #000}
.w{display:inline-block;margin:0 .08em;padding:0 4px;border-radius:6px}`,
// Active word: ceramic-white chip with graphite text and an orange underline, like a spec highlight.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(247,247,249,0)",textShadow:"0 3px 12px rgba(0,0,0,.85)"},{color:"#121315",backgroundColor:"rgba(247,247,249,1)",textShadow:"0 0 0 rgba(0,0,0,0)",boxShadow:"inset 0 -5px 0 0 #FF6B00",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(247,247,249,0)",textShadow:"0 3px 12px rgba(0,0,0,.85)",boxShadow:"inset 0 0 0 0 rgba(255,107,0,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Five Hundred", "#D9CBB5");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
