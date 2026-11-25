// EP05 THE BLOOM. Architectural-documentary look: lapis panels with gold rules, serif headings, panels that open like a canopy (circle reveal from centre). Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const GOLD = "#D4AF37", LAPIS = "#13294B", SAND = "#EFE3CB", INK = "#0C1626";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 05</div>
  <div class="h0"><b class="ct" data-from="0" data-to="250" data-a="s1:mekar" data-d="2.4">0</b> PAYUNG<br><i>MEKAR BERSAMA</i></div>
  <div class="tl">Masjid Nabawi, Madinah</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">SEJAK 2010</div>
  <div class="tel" data-at="s2:meter" data-fx="up"><b class="ct" data-from="0" data-to="143000" data-a="s2:meter" data-d="1.6">0</b><span>m&sup2; area teduh, sekitar</span></div>
  <div class="ro" data-at="s2:dibahas" data-fx="left"><b>RAMAI LAGI, NOV 2026</b><span>laporan SPA menjelang musim hujan</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">SAAT TERLIPAT</div>
  <div class="tel" data-at="s3:tingginya" data-fx="up"><b>21,7 m</b><span>tinggi tiang terlipat (SL Rasch)</span></div>
  <div class="ro" data-at="s3:mozaik" data-fx="left"><b>SELUBUNG MOZAIK</b><span>panel komposit serat kaca, menyimpan kain</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">MEKANISME LENGAN LIPAT</div>
  <div class="grid3">
    <div data-at="s4:diagonal" data-fx="pop"><b>4</b><span>lengan diagonal</span></div>
    <div data-at="s4:tengah" data-fx="pop"><b>4</b><span>lengan tengah</span></div>
    <div data-at="s4:pendukung" data-fx="pop"><b>16</b><span>lengan pendukung</span></div>
  </div>
  <div class="ch" data-at="s4:kelopak" data-fx="up">membuka &#8776; 3 menit &middot; dibuat Liebherr</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">MEMBRAN</div>
  <div class="ro" data-at="s5:PTFE" data-fx="left"><b>KAIN PTFE &middot; SEFAR</b><span>&#8776; 25,5 &times; 25,5 m per payung</span></div>
  <div class="ro" data-at="s5:pasir" data-fx="left"><b>WARNA PASIR</b><span>putih murni dianggap terlalu silau di bawahnya</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">DUA TINGGI</div>
  <div class="du"><div data-at="s6:empat" data-fx="pop"><b>14,4 m</b></div><div data-at="s6:lima" data-fx="pop"><b>15,3 m</b></div></div>
  <div class="ch" data-at="s6:menumpuk" data-fx="up">tepi kain saling menumpuk &#8594; satu atap</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">TIM &amp; SISTEM</div>
  <div class="ro" data-at="s7:arsitek" data-fx="left"><b>SL RASCH &middot; LIEBHERR</b><span>arsitek &middot; pembuat payung &amp; sistem kendali</span></div>
  <div class="ro" data-at="s7:kontrol" data-fx="left"><b>RUANG KONTROL PUSAT</b><span>ratusan payung bergerak serempak</span></div>
  <div class="ro" data-at="s7:kipas" data-fx="left"><b>KIPAS KABUT &amp; LAMPU</b><span>menurut laporan SPA</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Arsitektur" data-fx="up">ARSITEKTUR<br><i>YANG BERGERAK</i></div>
  <div class="srcl" data-at="s8:kembali" data-fx="fade">Sumber: SL Rasch; Architect Magazine/SEFAR; SPA via detikHikmah &amp; Elharamain (3 Nov 2026); Wikipedia. Model 3D adalah ilustrasi, bukan replika masjid.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:Outfit,sans-serif;font-weight:700;font-size:25px;letter-spacing:.16em;color:${LAPIS};background:${GOLD};padding:6px 14px;margin-bottom:14px}
.h0{font-family:"Playfair Display",serif;font-weight:800;font-size:108px;line-height:1;color:#fff;text-shadow:0 6px 30px rgba(10,20,40,.6)}
.h0 b{font-weight:800;color:${GOLD}}
.h0 i{font-style:italic;font-weight:700;color:#FFE7A8;font-size:88px;text-shadow:0 3px 18px rgba(10,20,40,.95),0 0 4px rgba(10,20,40,.9)}
.h2{font-family:"Playfair Display",serif;font-weight:800;font-size:104px;line-height:1;color:#fff;text-shadow:0 4px 26px rgba(10,20,40,.8)}
.h2 i{font-style:italic;color:${GOLD};text-shadow:0 3px 18px rgba(10,20,40,.95)}
.tl{font-family:Outfit,sans-serif;font-weight:600;font-size:38px;color:#fff;margin-top:10px;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.tel{background:rgba(19,41,75,.82);border-top:3px solid ${GOLD};border-bottom:3px solid ${GOLD};padding:12px 22px;width:740px}
.tel b{display:block;font-family:"Playfair Display",serif;font-weight:800;font-size:116px;line-height:1;color:${GOLD}}
.tel span{display:block;font-family:Outfit,sans-serif;font-weight:500;font-size:30px;color:${SAND}}
.ro{background:rgba(19,41,75,.82);border-left:5px solid ${GOLD};padding:10px 18px;margin-top:10px}
.ro b{display:block;font-family:"Playfair Display",serif;font-weight:800;font-size:50px;line-height:1.08;color:#fff}
.ro span{display:block;font-family:Outfit,sans-serif;font-weight:500;font-size:29px;line-height:1.2;color:${SAND}}
.grid3{display:flex;gap:12px;width:900px}.grid3>div{flex:1;background:rgba(19,41,75,.84);padding:10px 16px;border-top:6px solid ${GOLD};text-align:center}
.grid3 b{display:block;font-family:"Playfair Display",serif;font-weight:800;font-size:110px;line-height:1;color:${GOLD}}
.grid3 span{display:block;font-family:Outfit,sans-serif;font-weight:600;font-size:28px;color:${SAND}}
.du{display:flex;gap:12px;width:760px}.du>div{flex:1;background:rgba(19,41,75,.84);padding:10px 16px;border-top:6px solid ${GOLD};text-align:center}
.du b{display:block;font-family:"Playfair Display",serif;font-weight:800;font-size:96px;line-height:1;color:#fff}
.ch{font-family:Outfit,sans-serif;font-weight:600;font-size:33px;line-height:1.2;color:#fff;margin-top:12px;text-shadow:0 2px 10px rgba(0,0,0,.8)}
.srcl{font-family:Outfit,sans-serif;font-weight:500;font-size:24px;line-height:1.3;color:#fff;margin-top:14px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: INK, vig: 0.32, grain: 0.03, capfloor: 0.4, html, css,
  extraAt: ["s1:mekar", "s2:dibahas", "s2:meter", "s3:terlipat", "s3:mozaik", "s4:perintah", "s4:diagonal", "s4:tengah", "s4:pendukung", "s4:kelopak", "s5:PTFE", "s5:pasir", "s6:menumpuk", "s6:atap", "s7:kontrol", "s7:kipas", "s7:lampu", "s8:Menutup", "s8:membukanya"],
  // A panel opens like a canopy: a circle grows from its centre, and closes the same way.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'circle(0% at 30% 40%)',opacity:1},{clipPath:'circle(150% at 30% 40%)',duration:.5,ease:'power2.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'circle(0% at 30% 40%)',duration:.28,ease:'power2.in'},b-.34)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Outfit,sans-serif;font-weight:700;font-size:60px;line-height:1.24;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.9),0 0 3px #000}
.w{display:inline-block;padding:0 5px}`,
// Active word turns gold under a thin gold rule, like a line of inlay.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(212,175,55,0)"},{color:"#F2D27A",boxShadow:"inset 0 -4px 0 0 rgba(212,175,55,1)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",boxShadow:"inset 0 0 0 0 rgba(212,175,55,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:10},{opacity:1,y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Bloom", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
