// EP04 BLOCK TOWN. Warm daylight storybook: cream stickers with ink type sit on the sky, unlike the dark episodes. Panels stack on like blocks. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2A2433", CREAM = "#FFF4DC", GOLD = "#F2B632", TEAL = "#157A8C", RED = "#C93A30", BG = "#F3C996";
const F = '"Archivo Black",sans-serif', N = 'Nunito,sans-serif';

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">MMORPG: MAIN GAME BISA JADI UANG? / EP 04</div>
  <div class="card big">GAME TANPA<br><span>SERVER</span></div>
  <div class="tag" data-at="s1:Setiap" data-fx="pop">SETIAP AKSI TERCATAT DI BLOCKCHAIN</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">PLANETARIUM LABS / 6 TAHUN</div>
  <div class="card">NINE<br>CHRONICLES</div>
  <div class="tag" data-at="s2:harga" data-fx="pop">HARGA = PERMINTAAN PEMAIN</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">ALUR PRODUKSI</div>
  <div class="fl"><b data-at="s3:Bertarung" data-fx="pop">BATTLE</b><i data-at="s3:material" data-fx="fade">&rarr;</i><b data-at="s3:material" data-fx="pop">MATERIAL</b><i data-at="s3:resep" data-fx="fade">&rarr;</i><b data-at="s3:resep" data-fx="pop">RESEP</b></div>
  <div class="row" data-at="s3:blok" data-fx="left"><b class="nb">~10 DETIK</b><span>per blok. Waktu crafting dihitung dalam blok.</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">SHOP ANTARPEMAIN</div>
  <div class="card mid">NCG</div>
  <div class="row" data-at="s4:pasang" data-fx="left"><b>HARGA</b><span>kamu yang pasang</span></div>
  <div class="row" data-at="s4:pajak" data-fx="left"><b class="rd">PAJAK</b><span>dipotong saat laku</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">DUA JALUR LAIN</div>
  <div class="row" data-at="s5:Arena" data-fx="left"><b>ARENA</b><span>hadiah dibagi sesuai jumlah medali</span></div>
  <div class="row" data-at="s5:Staking" data-fx="left"><b class="te nb">50 NCG</b><span>staking minimum. Imbalan: ramuan dan Hourglass.</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk">KELUAR KE KRIPTO</div>
  <div class="card mid">NCG &harr; WNCG</div>
  <div class="row" data-at="s6:seratus" data-fx="left"><b class="nb">100 NCG</b><span>minimum tiap transfer</span></div>
  <div class="row" data-at="s6:biaya" data-fx="left"><b class="rd nb">10 NCG</b><span>biaya, di bawah 1.000 NCG. Dokumen resmi.</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">ULANG TAHUN KE-6 / OKT 2026</div>
  <div class="card mid nb" data-at="s7:empat" data-fx="pop">&gt;4.000.000 NCG</div>
  <div class="row" data-at="s7:lima" data-fx="left"><b class="rd nb">~US$15.000</b><span>hitungan AUDIRA: 4 juta &times; WNCG US$0,00368, 4 Nov 2026</span></div>
  <div class="row" data-at="s7:Puncak" data-fx="left"><b class="nb">US$6,01</b><span>puncak Agt 2021. CoinGecko.</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="pop" style="font-size:66px">EKONOMI NYATA.<br><span>NILAINYA IKUT PASAR.</span></div>
  <div class="tag" data-at="s8:Bisakah" data-fx="pop">BISA MEMBANGUN EKONOMI SENDIRI?</div>
  <div class="tk" data-at="s8:Bisakah" data-fx="fade" style="margin-top:12px">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
.tk{display:inline-block;font-family:${N};font-weight:900;font-size:29px;color:${INK};margin-bottom:12px;background:rgba(255,244,220,.86);padding:2px 12px}
.card{font-family:${F};font-size:82px;line-height:1.06;color:${INK};background:${CREAM};padding:16px 22px;border:6px solid ${INK};box-shadow:10px 10px 0 ${INK}}.card span{color:${RED}}
.card.big{font-size:100px}.card.mid{font-size:64px;padding:10px 18px}
.tag{display:inline-block;margin-top:24px;font-family:${N};font-weight:900;font-size:36px;line-height:1.12;color:${INK};background:${GOLD};padding:10px 18px;border:5px solid ${INK}}
.fl{display:flex;align-items:center;gap:6px}.fl b{flex:1;text-align:center;font-family:${F};font-weight:400;font-size:34px;padding:16px 2px;background:${CREAM};color:${INK};border:5px solid ${INK}}.fl i{font-style:normal;font-family:${N};font-weight:900;font-size:36px;color:${INK}}
.row{display:flex;align-items:center;gap:16px;background:${CREAM};padding:10px 16px;margin-top:14px;border:5px solid ${INK}}
.row b{flex:none;font-family:${F};font-weight:400;font-size:42px;line-height:1.05;color:${INK}}.row b.rd{color:${RED}}.row b.te{color:${TEAL}}.row span{font-family:${N};font-weight:800;font-size:30px;line-height:1.16;color:${INK}}
.nb{font-variant-numeric:tabular-nums}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.12, grain: 0.03, capfloor: 0.0, html, css, chipFont: N, chipColor: INK,
  extraAt: ["s1:Setiap", "s3:Crafting", "s3:blok", "s4:Shop", "s4:laku", "s5:medali", "s5:Staking", "s6:WNCG", "s6:biaya", "s7:empat", "s7:lima"],
  // Panels drop and bounce like a block landing.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-120,opacity:0},{y:0,opacity:1,duration:.42,ease:'bounce.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-140,opacity:0,duration:.18,ease:'power3.in'},b-.18)`,
  // Close on a stepped wipe: twelve hard rows, like blocks filling.
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0 0 0)'});tl.to('#outro',{clipPath:'inset(0% 0 0 0)',duration:.5,ease:'steps(12)'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${N};font-weight:900;font-size:58px;line-height:1.16;color:${INK}}
.capin .w{background:${CREAM};padding:2px 8px;margin:2px 0;box-decoration-break:clone}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"${CREAM}"},{backgroundColor:"${GOLD}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"${CREAM}",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14,opacity:.2},{y:0,opacity:1,duration:.1,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Block Town", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
