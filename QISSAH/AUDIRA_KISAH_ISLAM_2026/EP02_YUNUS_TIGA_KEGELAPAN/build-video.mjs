// EP02 YUNUS, TIGA KEGELAPAN. WORLDFORGE deep ocean at night: abyss navy, teal bioluminescence, one amber glow.
// Panels are dark water-glass cards; they sink into place and rise away blurred, like light seen through water.
// The doa of QS 21:87 rises word by word as light calligraphy (Amiri). Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB347", TEAL = "#5EF2DC", IVORY = "#F3EBDD", NAVY = "#03070D", BG = "#02050A";

// Arabic copied programmatically from the Uthmani source, never retyped.
const Q = readFileSync("../_research/quran/EP02_yunus.txt", "utf8").split("\n");
const ayah = (ref) => Q.find((l) => l.startsWith(`QS ${ref} |`)).split("|")[1].trim().split(" ");
const DOA = ayah("21:87").slice(-9);                       // لَّآ إِلَـٰهَ ... ٱلظَّـٰلِمِينَ
const YAQTHIN = ayah("37:146").slice(-1)[0];
const DOA_AT = ["s4:Lā", "s4:ilāha", "s4:illā", "s4:anta", "s4:subḥānaka", "s4:innī", "s4:kuntu", "s4:minaẓ-ẓālimīn", "s4:minaẓ-ẓālimīn"];
const arWords = DOA.map((w, i) => `<span class="aw" data-at="${DOA_AT[i]}${i === 8 ? "+0.25" : ""}" data-fx="rise">${w}</span>`).join(" ");

const html = `
<div id="L1" class="tag"><i></i>GELAP MALAM</div>
<div id="L2" class="tag"><i></i>GELAP LAUT</div>
<div id="L3" class="tag"><i></i>GELAP PERUT IKAN</div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card slim">
    <div class="k"><em>02</em>KISAH DALAM AL-QUR'AN</div>
    <div class="h">Tiga Kegelapan</div>
    <div class="sub" data-at="s1:satu" data-fx="sink">Satu doa pendek dari dalam perut ikan <b>· QS Al-Anbiya 21:87</b></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Seruannya">
  <div class="card">
    <div class="k"><em>QS 37:139</em>ASH-SHAFFAT</div>
    <div class="h m">Yunus, salah seorang rasul</div>
    <div class="row" data-at="s2:Niniwe" data-fx="sink"><b>NINIWE</b><span>dalam riwayat · kini wilayah Irak</span></div>
  </div>
</div>
<div class="p" data-in="s2:Seruannya" data-out="s3">
  <div class="card">
    <div class="k"><em>DAKWAH</em>KEPADA KAUMNYA</div>
    <div class="h m">Seruannya ditolak</div>
    <div class="row" data-at="s2:pergi" data-fx="sink"><b class="am">PERGI</b><span>dalam keadaan marah · QS Al-Anbiya 21:87</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Undian">
  <div class="card">
    <div class="k"><em>QS 37:140-141</em>ASH-SHAFFAT</div>
    <div class="h m">Kapal yang penuh muatan</div>
    <div class="row" data-at="s3:diundi" data-fx="sink"><b>DIUNDI</b><span>di tengah laut, penumpang diundi</span></div>
  </div>
</div>
<div class="p" data-in="s3:Undian" data-out="s4">
  <div class="card">
    <div class="k"><em>QS 37:141-142</em>ASH-SHAFFAT</div>
    <div class="h m">Undian jatuh pada Yunus</div>
    <div class="row" data-at="s3:Seekor" data-fx="sink"><b class="tl">IKAN BESAR</b><span>menelannya</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:berdoa">
  <div class="card">
    <div class="k"><em>TAFSIR</em>IBNU MAS'UD · IBNU KATSIR, QS 21:87</div>
    <div class="h m">Tiga kegelapan</div>
    <div class="row" data-at="s4:perut" data-fx="sink"><b class="n">1</b><span>gelap perut ikan</span></div>
    <div class="row" data-at="s4:laut" data-fx="sink"><b class="n">2</b><span>gelap laut</span></div>
    <div class="row" data-at="s4:malam" data-fx="sink"><b class="n">3</b><span>gelap malam</span></div>
  </div>
</div>
<div class="p" data-in="s4:berdoa" data-out="s5:Ia">
  <div class="card doa">
    <div class="k"><em>QS 21:87</em>AL-ANBIYA · DOA DZUN NUN</div>
    <div class="ar">${arWords}</div>
    <div class="tr" data-at="s4:Lā" data-fx="sink">Lā ilāha illā anta, subḥānaka, innī kuntu minaẓ-ẓālimīn</div>
    <div class="mean" data-at="s5:Artinya" data-fx="sink">&ldquo;Tidak ada tuhan selain Engkau, Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Ia" data-out="s6">
  <div class="card">
    <div class="k"><em>INTI DOA</em>PENGAKUAN</div>
    <div class="row" data-at="s5:menyalahkan" data-fx="sink"><b class="x">&times;</b><span>tidak menyalahkan kaumnya</span></div>
    <div class="row" data-at="s5:lautnya" data-fx="sink"><b class="x">&times;</b><span>tidak juga lautnya</span></div>
    <div class="own" data-at="s5:mengakui" data-fx="sink">Mengakui kesalahannya sendiri</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Doanya">
  <div class="card">
    <div class="k"><em>QS 37:143-144</em>ASH-SHAFFAT</div>
    <div class="h m">Banyak bertasbih</div>
    <div class="sub" data-at="s6:ia#2" data-fx="sink">Tanpa itu, ia tetap di perut ikan sampai hari kebangkitan.</div>
  </div>
</div>
<div class="p" data-in="s6:Doanya" data-out="s7">
  <div class="card">
    <div class="k"><em>QS 21:88 · 37:145-146</em></div>
    <div class="h m">Doanya dikabulkan</div>
    <div class="row" data-at="s6:dilemparkan" data-fx="sink"><b>DARATAN TANDUS</b><span>dalam keadaan sakit</span></div>
    <div class="row" data-at="s6:pohon" data-fx="sink"><b class="ar1">${YAQTHIN}</b><span>pohon dari jenis labu</span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Surah">
  <div class="card">
    <div class="k"><em>QS 37:147-148</em>ASH-SHAFFAT</div>
    <div class="big nb"><b class="ct" data-from="0" data-to="100000" data-a="s7:seratus" data-d="1.4">0</b></div>
    <div class="sub" data-at="s7:atau" data-fx="sink">orang, <b>atau lebih</b></div>
    <div class="row" data-at="s7:beriman" data-fx="sink"><b class="am">BERIMAN</b><span>kali ini mereka beriman</span></div>
  </div>
</div>
<div class="p" data-in="s7:Surah" data-out="s8">
  <div class="card">
    <div class="k"><em>QS 10:98</em>YUNUS</div>
    <div class="h m">Kaum Yunus, sebuah pengecualian</div>
    <div class="row" data-at="s7:bermanfaat" data-fx="sink"><b class="tl">IMAN</b><span>bermanfaat bagi mereka</span></div>
    <div class="row" data-at="s7:azab" data-fx="sink"><b class="tl">AZAB</b><span>diangkat dari mereka</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="s8:Kapan">
  <div class="card">
    <div class="k"><em>HR TIRMIDZI 3505</em>SAHIH</div>
    <div class="quote">&ldquo;Doa Yunus ini, tidaklah dibaca seorang muslim untuk urusan apa pun, kecuali Allah mengabulkannya.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8:Kapan" data-out="@END">
  <div class="card slim">
    <div class="k"><em>RENUNGAN</em></div>
    <div class="h m">Mengakui salah, tanpa kambing hitam</div>
  </div>
</div>`;

const css = `
.card{background:linear-gradient(180deg,rgba(6,20,32,.86),rgba(2,9,16,.8));border:1px solid rgba(94,242,220,.32);border-radius:6px;padding:26px 32px 30px;box-shadow:0 24px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(94,242,220,.18)}
.card.slim{padding:22px 32px 26px}
.k{display:flex;align-items:center;gap:14px;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:26px;letter-spacing:.14em;color:${TEAL};padding-bottom:12px;border-bottom:1px solid rgba(94,242,220,.28);margin-bottom:14px}
.k em{font-style:normal;color:${NAVY};background:${TEAL};padding:2px 12px;letter-spacing:.06em;border-radius:3px}
.h{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:104px;line-height:.98;color:${IVORY};letter-spacing:-.01em}
.h.m{font-size:70px;line-height:1.02}
.sub{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:38px;line-height:1.22;color:${IVORY};margin-top:12px}
.sub b{color:${AMB};font-weight:700}
.row{display:flex;align-items:baseline;gap:20px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(243,235,221,.12)}
.row b{flex:none;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:42px;letter-spacing:.06em;color:${IVORY}}
.row b.am{color:${AMB}}.row b.tl{color:${TEAL}}
.row b.n{width:52px;height:52px;border-radius:50%;border:2px solid ${TEAL};color:${TEAL};text-align:center;line-height:50px;font-size:34px;letter-spacing:0}
.row b.x{color:#7f8fa0;font-size:56px;line-height:.8}
.row b.ar1{font-family:Amiri,serif;direction:rtl;font-size:56px;letter-spacing:0;color:${AMB};text-shadow:0 0 16px rgba(255,179,71,.6)}
.row span{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:38px;line-height:1.15;color:${IVORY}}
.own{margin-top:18px;padding:14px 20px;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:52px;line-height:1.05;color:${NAVY};background:${AMB};border-radius:4px;box-shadow:0 0 40px rgba(255,179,71,.45)}
.doa{background:linear-gradient(180deg,rgba(4,14,24,.62),rgba(2,8,14,.5));border-color:rgba(255,179,71,.35)}
.ar{font-family:Amiri,serif;direction:rtl;text-align:center;font-size:74px;line-height:1.85;color:#FFE9C2;text-shadow:0 0 18px rgba(255,179,71,.85),0 0 46px rgba(255,150,40,.45);padding:4px 0 6px}
.aw{display:inline-block;margin:0 .1em}
.tr{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:600;font-size:38px;line-height:1.2;text-align:center;color:${TEAL};margin-top:4px}
.mean{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:38px;line-height:1.24;text-align:center;color:${IVORY};margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,179,71,.3)}
.big{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:170px;line-height:.9;color:${AMB};text-shadow:0 0 30px rgba(255,179,71,.35)}
.quote{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:600;font-size:52px;line-height:1.18;color:${IVORY}}
.tag{position:absolute;left:0;top:0;z-index:9;display:flex;align-items:center;gap:12px;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:34px;letter-spacing:.16em;color:${TEAL};text-shadow:0 2px 10px #000;white-space:nowrap;opacity:0;margin-top:-20px}
.tag i{display:block;width:16px;height:16px;border-radius:50%;border:2px solid ${TEAL};box-shadow:0 0 12px ${TEAL}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:malam", "s1:lautan", "s1:ikan", "s1:Dari", "s1:tiga", "s1:doa", "s2:diutus", "s2:kaumnya", "s2:Niniwe", "s2:Seruannya", "s2:ditolak", "s2:pergi",
  "s3:naik", "s3:muatan", "s3:Di", "s3:penumpang", "s3:diundi", "s3:Undian", "s3:Yunus", "s3:keluar", "s3:Seekor", "s3:menelannya",
  "s4:perut", "s4:laut", "s4:malam", "s4:sanalah", "s4:berdoa", ...new Set(DOA_AT),
  "s5:zalim", "s5:menyalahkan", "s5:mengakui", "s6:bertasbih", "s6:kebangkitan", "s6:Doanya", "s6:dilemparkan", "s6:sakit", "s6:tumbuh", "s6:menaunginya",
  "s7:diutus", "s7:seratus", "s7:lebih", "s7:beriman", "s7:Surah", "s7:azab", "s7:diangkat", "s8:Kapan"];
writeWorld(TL, at, {
  ep: "02", bg: BG, vig: 0.55, grain: 0.06, capfloor: 0.62, html, css,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: '"Cormorant Garamond",serif', chipColor: "#BFEFE6",
  extraAt: WORLD_AT,
  fxExtra: `sink:(e,t)=>tl.fromTo(e,{y:-26,opacity:0,filter:'blur(8px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.55,ease:'power2.out'},t),
 rise:(e,t)=>tl.fromTo(e,{y:46,opacity:0,filter:'blur(10px)',textShadow:'0 0 0 rgba(255,179,71,0)'},{y:0,opacity:1,filter:'blur(0px)',textShadow:'0 0 18px rgba(255,179,71,.9)',duration:.8,ease:'power2.out'},t),`,
  // Panels sink into place out of a blur and rise away dissolving, like light through deep water.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-70,opacity:0,filter:'blur(14px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.6,ease:'power2.out'},a-.15)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-90,opacity:0,filter:'blur(12px)',duration:.4,ease:'power2.in'},b-.4)`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'blur(20px)',y:80});tl.to('#outro',{opacity:1,filter:'blur(0px)',y:0,duration:.8,ease:'power2.out'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:66px;line-height:1.12;color:${IVORY};text-shadow:0 3px 14px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .14em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${IVORY}",textShadow:"0 3px 14px rgba(0,0,0,.95)"},{color:"${AMB}",textShadow:"0 0 22px rgba(255,179,71,.85)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${IVORY}",textShadow:"0 3px 14px rgba(0,0,0,.95)",duration:.18},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:30,opacity:0,filter:"blur(6px)"},{y:0,opacity:1,filter:"blur(0px)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Yunus Tiga Kegelapan", BG);
console.log("caption groups", n, "duration", TL.duration);
