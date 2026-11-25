// EP01 STUD ECONOMY. Sticker-pop cards over one long studded world; the camera only travels left to right. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#16181D", YEL = "#FFD21F", RED = "#E5322D", BLU = "#1F7FE0", GRN = "#1FA34A";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="chip">DARI GAMER MENJADI PENGHASIL UANG &middot; EP 01</div>
  <div class="hk">GAME ANAK-ANAK,<br><span>UANG SUNGGUHAN</span></div>
  <div class="card tilt" data-at="s1:Puncaknya" data-fx="pop"><div class="big nb"><b class="ct" data-from="0" data-to="22.3" data-a="s1:Puncaknya" data-d="3.2" data-dec="1">0</b> JUTA</div><div class="sm">pemain serentak, Grow a Garden, 23 Agustus 2025</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">EKONOMI ROBUX</div>
  <div class="row"><div class="mini blu" data-at="s2:Game" data-fx="pop"><b>GAME PASS</b><i>akses permanen</i></div><div class="mini org" data-at="s2:Developer" data-fx="pop"><b>DEVELOPER PRODUCT</b><i>bisa dibeli berulang</i></div></div>
  <div class="card" data-at="s2:70" data-fx="pop"><div class="split"><span class="sa">70%</span><span class="sb">30%</span></div><div class="sm">bagian umum penjualan Robux di dalam game. Belum jadi dolar.</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">DEVELOPER EXCHANGE</div>
  <div class="row"><div class="mini wht" data-at="s3:13" data-fx="pop"><b>13+ TAHUN</b><i>minimal usia</i></div><div class="mini wht" data-at="s3:30.000" data-fx="pop"><b>30.000</b><i>Earned Robux minimal</i></div></div>
  <div class="card tilt2" data-at="s3:114" data-fx="pop"><div class="big grn nb">US$114</div><div class="sm">untuk 30.000 Earned Robux. Kurs standar 0,0038, dokumen resmi Roblox.</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card" data-at="s4:1,5" data-fx="pop"><div class="big b2 nb">US$1,5 MILIAR+</div><div class="sm">diperoleh kreator sepanjang 2025, klaim Roblox</div></div>
  <div class="bars">
   <div class="bl" data-at="s4:Steal" data-fx="left"><span class="nm">Steal a Brainrot</span><span class="vv">74,3 miliar</span></div>
   <div class="bl" data-at="s4:Grow" data-fx="left"><span class="nm">Grow a Garden</span><span class="vv">36,0 miliar</span></div>
   <div class="bl" data-at="s4:Fisch" data-fx="left"><span class="nm">Fisch</span><span class="vv">5,1 miliar</span></div>
  </div>
  <div class="note" data-at="s4:Steal" data-fx="fade">kunjungan, dibaca dari data Roblox, 4 Nov 2026</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="hk2">KUNJUNGAN<br><span>&ne; PENDAPATAN</span></div>
  <div class="row"><div class="mini wht" data-at="s5:menolak" data-fx="pop"><b>TIDAK DIBUKA</b><i>pendapatan Grow a Garden</i></div><div class="mini grnb" data-at="s5:separuh" data-fx="pop"><b>50%</b><i>saham pembuat asli, dilaporkan</i></div></div>
</div>
<div class="p" data-in="s6" data-out="s6:Tapi">
  <div class="tag gold">PUNCAK PIRAMIDA</div>
  <div class="card" data-at="s6:1.000" data-fx="pop"><div class="big nb">US$1,3 JUTA</div><div class="sm">rata-rata 1.000 kreator teratas, 2025</div></div>
</div>
<div class="p" data-in="s6:Tapi" data-out="s7">
  <div class="tag">DASAR PIRAMIDA</div>
  <div class="card tilt" data-at="s6:1.440" data-fx="pop"><div class="big red nb">US$1.440</div><div class="sm">median setahun, 29.000+ peserta DevEx, 12 bulan sampai 30 Juni 2025</div></div>
  <div class="mini wht wide" data-at="s6:120" data-fx="pop"><b>US$120 per bulan</b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag dark">KUARTAL III 2026</div>
  <div class="row"><div class="mini redb" data-at="s7:turun" data-fx="pop"><b>-12%</b><i>bookings, US$1,7 miliar</i></div><div class="mini redb" data-at="s7:pengguna" data-fx="pop"><b>-9%</b><i>pengguna harian</i></div></div>
  <div class="note lt" data-at="s7:pengguna" data-fx="fade">Roblox menyebut pembanding 2025 sangat tinggi</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="hk2" data-at="s8:Jadi" data-fx="up">NYATA,<br><span>TAPI TIDAK RATA</span></div>
  <div class="row"><div class="mini blu" data-at="s8:garap" data-fx="pop"><b>GARAP SENDIRI?</b></div><div class="mini org" data-at="s8:jual" data-fx="pop"><b>JUAL KE STUDIO?</b></div></div>
</div>`;

const css = `
.chip{display:inline-block;font-family:"Archivo Black",sans-serif;font-size:27px;color:${INK};background:#fff;padding:10px 18px;border:5px solid ${INK};border-radius:14px;margin-bottom:20px}
.hk,.hk2{font-family:"Archivo Black",sans-serif;color:#fff;font-size:74px;line-height:1.03;letter-spacing:-.01em;text-shadow:0 7px 0 ${INK},4px 0 0 ${INK},-4px 0 0 ${INK},0 -4px 0 ${INK}}
.hk span,.hk2 span{color:${YEL}}
.hk2{font-size:92px}
.tag{display:inline-block;font-family:"Archivo Black",sans-serif;font-size:38px;background:${YEL};color:${INK};padding:9px 20px;border:6px solid ${INK};border-radius:16px;margin-bottom:20px;box-shadow:0 8px 0 ${INK}}
.tag.dark{background:#fff}
.card{background:#fff;border:7px solid ${INK};border-radius:30px;box-shadow:0 12px 0 ${INK};padding:24px 30px;margin-top:22px}
.tilt{transform:rotate(-1.5deg)}.tilt2{transform:rotate(1.2deg)}
.big{font-family:"Archivo Black",sans-serif;font-size:100px;line-height:1;color:${INK}}
.big.b2{font-size:78px}.big.grn{color:${GRN}}.big.red{color:${RED}}
.sm{font-family:Nunito,sans-serif;font-weight:800;font-size:33px;line-height:1.2;color:#333A45;margin-top:12px}
.row{display:flex;gap:18px;margin-top:6px}
.mini{flex:1;border:6px solid ${INK};border-radius:22px;box-shadow:0 8px 0 ${INK};padding:18px 18px;background:#fff}
.mini b{display:block;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:40px;line-height:1.05;color:${INK}}
.mini i{display:block;font-family:Nunito,sans-serif;font-style:normal;font-weight:800;font-size:29px;line-height:1.14;color:#2F3640;margin-top:8px}
.mini.blu{background:${BLU}}.mini.blu b,.mini.blu i{color:#fff}
.mini.org{background:#FF8A1F}
.mini.grnb{background:#37D36A}.mini.redb{background:${RED}}.mini.redb b,.mini.redb i{color:#fff}.mini.redb b{font-size:78px}
.mini.grnb b{font-size:78px}.mini.wide{margin-top:24px}.mini.wide b{font-size:56px;color:${RED}}
.split{display:flex;height:112px;border:6px solid ${INK};border-radius:20px;overflow:hidden;font-family:"Archivo Black",sans-serif;font-size:66px;line-height:100px;text-align:center}
.sa{width:70%;background:${YEL};color:${INK}}.sb{width:30%;background:#8B95A1;color:#fff;font-size:44px}
.bars{margin-top:20px}
.bl{display:flex;justify-content:space-between;align-items:baseline;background:rgba(255,255,255,.96);border:5px solid ${INK};border-radius:18px;padding:10px 20px;margin-top:10px}
.nm{font-family:Nunito,sans-serif;font-weight:900;font-size:38px;color:${INK}}.vv{font-family:"Archivo Black",sans-serif;font-size:46px;color:${INK}}
.note{font-family:Nunito,sans-serif;font-weight:800;font-size:29px;color:#fff;text-shadow:0 2px 0 ${INK},2px 0 0 ${INK},-2px 0 0 ${INK},0 -2px 0 ${INK};margin-top:14px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { K, AT } = writeWorld(TL, at, {
  ep: "01", extraAt: ["s2:Pemain"], bg: "#3FB4FF", vig: 0.1, grain: 0.03, capfloor: 0, html, css,
  // Panels ride the camera: they slide in from the right and leave to the left, the film's one current.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:1000,opacity:1,rotation:2},{x:0,opacity:1,rotation:0,duration:.52,ease:'power4.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-1100,rotation:-2,duration:.34,ease:'power3.in'},b-.3)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Archivo Black",sans-serif;font-size:60px;line-height:1.14;word-spacing:.24em;color:#fff;-webkit-text-stroke:9px ${INK};paint-order:stroke fill}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${YEL}",scale:1.08,duration:.05,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{scale:1,duration:.14,ease:"back.out(2)"},${(w.start + 0.05).toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.05},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:40,opacity:.2},{x:0,opacity:1,duration:.14,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Stud Economy", "#3FB4FF");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
