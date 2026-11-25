// EP02 THE POOL. Slanted neon HUD over a dusk archipelago; the camera orbits one tank and panels rise from below. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#29E7FF", GOLD = "#FFC83D", MAG = "#FF3D9A", VIO = "#6C3BFF", NIGHT = "#0B0730";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kick">DARI GAMER MENJADI PENGHASIL UANG &middot; EP 02</div>
  <div class="huge"><span class="nb">US$1</span> <em>MILIAR</em></div>
  <div class="ln" data-at="s1:Sejak" data-fx="up">dibayar Epic ke kreator UEFN sejak 2023</div>
  <div class="tagm" data-at="s1:Bukan" data-fx="pop">BUKAN KE PEMAIN</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kick" data-at="s2:Alatnya" data-fx="up">ALATNYA</div>
  <div class="h2">UNREAL EDITOR<br>FOR FORTNITE</div>
  <div class="hud" data-at="s2:island" data-fx="pop"><b>ISLAND</b><span>nama hasil karya kreator</span></div>
  <div class="hud gd" data-at="s2:75" data-fx="pop"><b class="nb">75 JUTA+</b><span>pemain per bulan, Juni 2026</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kick">ENGAGEMENT PAYOUT</div>
  <div class="huge gdt nb" data-at="s3:40" data-fx="pop">40%</div>
  <div class="ln" data-at="s3:40" data-fx="up">pendapatan bersih Item Shop masuk kolam</div>
  <div class="hud vi" data-at="s3:Island" data-fx="pop"><span>Island kreator dan island Epic berebut kolam yang sama</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="h2 lit">YANG DIHITUNG</div>
  <div class="chk" data-at="s4:waktu" data-fx="left"><i></i>Waktu main aktif</div>
  <div class="chk" data-at="s4:kembali" data-fx="left"><i></i>Pemain yang kembali</div>
  <div class="chk nw" data-at="s4:pemain#2" data-fx="left"><i></i>Pemain baru yang kamu bawa</div>
  <div class="hud gd" data-at="s4:75" data-fx="pop"><b class="nb">75% &middot; 6 BULAN</b><span>kontribusi pemain baru ke kolam</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kick">JUAL ITEM &middot; SEJAK JANUARI 2026</div>
  <div class="duo"><div class="dd" data-at="s5:74" data-fx="pop"><b class="nb gdt">74%</b><span>sekitar, dari belanja pemain, sampai akhir 2026</span></div>
  <div class="dd" data-at="s5:37" data-fx="pop"><b class="nb">37%</b><span>sekitar, setelah itu</span></div></div>
  <div class="hud vi" data-at="s5:3.000" data-fx="pop"><b class="nb">SEKITAR 3.000 ISLAND</b><span>item sudah mengalahkan payout, Juni 2026</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="h2 lit">SYARAT</div>
  <div class="chk" data-at="s6:18" data-fx="left"><i></i>Minimal 18 tahun</div>
  <div class="chk" data-at="s6:20" data-fx="left"><i></i>Belanja US$20 dalam 365 hari</div>
  <div class="chk sub" data-at="s6:atau" data-fx="left"><i></i>atau pembelian uang asli lewat Epic</div>
  <div class="hud gd" data-at="s6:30" data-fx="pop"><b class="nb">30 HARI</b><span>jeda bayar setelah bulan berakhir</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kick">DIBAGI KE SIAPA?</div>
  <div class="huge gdt nb" data-at="s7:empat" data-fx="pop">4%</div>
  <div class="ln" data-at="s7:empat" data-fx="up">kreator capai US$20.000+ setahun</div>
  <div class="srcl" data-at="s7:Analisis" data-fx="fade">estimasi analis, April 2024, bukan data Epic</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2 big2" data-at="s8:Jadi" data-fx="up">YANG DIJUAL:<br><em>WAKTU PEMAIN</em></div>
  <div class="duo"><div class="dd q" data-at="s8:baru" data-fx="pop"><b>PEMAIN BARU?</b></div><div class="dd q" data-at="s8:balik" data-fx="pop"><b>YANG BALIK?</b></div></div>
</div>`;

const css = `
.kick{font-family:Oswald,sans-serif;font-weight:600;font-size:36px;letter-spacing:.09em;color:${CY};transform:skewX(-8deg);transform-origin:0 100%;text-shadow:0 0 18px rgba(41,231,255,.55)}
.huge{font-family:"League Gothic",sans-serif;font-size:210px;line-height:.98;color:#fff;transform:skewX(-8deg);transform-origin:0 100%;text-shadow:0 0 30px rgba(108,59,255,.9),0 6px 0 rgba(11,7,48,.7)}
.huge em{font-style:normal;color:${GOLD}}
.gdt{color:${GOLD}!important}
.h2{font-family:"League Gothic",sans-serif;font-size:108px;line-height:1.02;color:#fff;transform:skewX(-8deg);transform-origin:0 100%;text-shadow:0 0 24px rgba(108,59,255,.9)}
.h2 em{font-style:normal;color:${GOLD}}.h2.lit{font-size:88px;color:${CY};text-shadow:0 0 20px rgba(41,231,255,.6)}.big2{font-size:120px}
.ln{font-family:Inter,sans-serif;font-weight:700;font-size:40px;line-height:1.2;color:#fff;margin-top:12px;text-shadow:0 2px 10px rgba(11,7,48,.95)}
.tagm{display:inline-block;margin-top:20px;font-family:Oswald,sans-serif;font-weight:700;font-size:50px;background:${MAG};color:#fff;padding:8px 26px;transform:skewX(-8deg)}
.hud{margin-top:20px;padding:16px 24px;background:linear-gradient(100deg,rgba(21,12,74,.88),rgba(21,12,74,.58));border:2px solid rgba(41,231,255,.75);border-left:10px solid ${CY};transform:skewX(-4deg)}
.hud b{display:block;font-family:"League Gothic",sans-serif;font-weight:400;font-size:82px;line-height:1;color:#fff}
.hud span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:32px;line-height:1.2;color:#D9E6FF;margin-top:4px}
.hud.gd{border-color:rgba(255,200,61,.8);border-left-color:${GOLD}}.hud.gd b{color:${GOLD}}
.hud.vi{border-color:rgba(255,61,154,.8);border-left-color:${MAG}}
.chk{display:flex;align-items:center;gap:20px;font-family:Oswald,sans-serif;font-weight:500;font-size:48px;line-height:1.1;color:#fff;margin-top:14px;text-shadow:0 2px 10px rgba(11,7,48,.95)}
.chk i{flex:none;width:30px;height:30px;background:${CY};transform:skewX(-10deg);box-shadow:0 0 16px ${CY}}
.chk.nw i{background:#7DFFB0;box-shadow:0 0 16px #7DFFB0}.chk.sub{font-size:38px}
.duo{display:flex;gap:18px;margin-top:18px}
.dd{flex:1;padding:16px 20px;background:rgba(21,12,74,.82);border:2px solid rgba(41,231,255,.7);transform:skewX(-4deg)}
.dd b{display:block;font-family:"League Gothic",sans-serif;font-weight:400;font-size:112px;line-height:1;color:#fff}
.dd span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:30px;line-height:1.16;color:#D9E6FF;margin-top:6px}
.dd.q b{font-size:66px;color:${GOLD}}
.srcl{font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:#D9E6FF;margin-top:10px;text-shadow:0 2px 8px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: NIGHT, vig: 0.42, grain: 0.06, capfloor: 0.32, html, css,
  extraAt: ["s2:pemain", "s3:40", "s3:Island", "s4:pemain#2", "s5:item", "s6:30"],
  // Elevation is this film's current: every panel rises from below and leaves upward, skewing with speed.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:520,skewY:3,opacity:0},{y:0,skewY:0,opacity:1,duration:.5,ease:'power4.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-420,skewY:-3,opacity:0,duration:.3,ease:'power3.in'},b-.26)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Oswald,sans-serif;font-weight:700;font-size:68px;line-height:1.14;word-spacing:.14em;color:#fff;text-transform:uppercase;text-shadow:0 3px 0 ${NIGHT},0 0 22px rgba(11,7,48,.95)}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 0 ${NIGHT},0 0 22px rgba(11,7,48,.95)"},{color:"${CY}",y:-6,textShadow:"0 3px 0 ${NIGHT},0 0 26px rgba(41,231,255,.95)",duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 0 ${NIGHT},0 0 22px rgba(11,7,48,.95)",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:34,opacity:.2},{y:0,opacity:1,duration:.15,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Pool", NIGHT);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
