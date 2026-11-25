// EP02 LAST BANNER. Royal serif over hologram HUD lines: an old kingdom fitted with a futuristic ledger, closing down. Panels open like a scanline. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RUBY = "#FF3D68", HOLO = "#38E8FF", GOLD = "#F5C451", IVORY = "#FBF3E2", BG = "#0B0A20";

const html = `
<div id="scrim"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">MMORPG: MAIN GAME BISA JADI UANG? / EP 02</div>
  <div class="h1">4 NOVEMBER<br>2026</div>
  <div class="stamp" data-at="s1:tutup" data-fx="pop">JADWAL TUTUP: KONVERSI GAME &harr; KRIPTO</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">R.O.H.A.N.2 GLOBAL / RILIS 30 SEP 2025</div>
  <div class="h2">ROHANomics</div>
  <div class="duo"><div data-at="s2:main" data-fx="left"><b>WEB2</b><span>main biasa, tanpa dompet</span></div><div data-at="s2:ubah" data-fx="left"><b class="ho">WEB3</b><span>hasil main jadi aset</span></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">TIGA TOKEN</div>
  <div class="tr" data-at="s3:RUBY" data-fx="left"><b class="ru">RUBY</b><span>mata uang dalam game</span></div>
  <div class="tr" data-at="s3:sRUBY" data-fx="left"><b class="si">sRUBY</b><span>diterima penjual, potong 10%</span></div>
  <div class="tr" data-at="s3:RUBYx" data-fx="left"><b class="ho">RUBYx</b><span>on-chain, bisa diperdagangkan</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">JALUR ASET / DIAGRAM ILUSTRASI</div>
  <div class="fl"><b data-at="s4:Jual" data-fx="pop">ITEM</b><i data-at="s4:sRUBY" data-fx="fade">&rarr;</i><b class="si" data-at="s4:sRUBY" data-fx="pop">sRUBY</b><i data-at="s4:RAMP" data-fx="fade">&rarr;</i><b class="ho" data-at="s4:RUBYx" data-fx="pop">RUBYx</b><i data-at="s4:DEX" data-fx="fade">&rarr;</i><b class="go" data-at="s4:DEX" data-fx="pop">DEX</b></div>
  <div class="note" data-at="s4:dibalik" data-fx="fade">CROSS RAMP, DUA ARAH</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">DASBOR RESMI RUBY / 4 NOV 2026, 00:40 UTC</div>
  <div class="v ru nb"><b class="ct" data-from="1000000000" data-to="15000000" data-a="s5:Hyper" data-d="2.4">1.000.000.000</b></div>
  <div class="lb">TOTAL PASOKAN RUBY SETELAH HYPER BURN</div>
  <div class="rw" data-at="s5:dasbor" data-fx="left"><b class="nb">1.382</b><span>RUBY terpakai dalam 24 jam</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk go2">PENGUMUMAN RESMI / 30 SEP 2026</div>
  <div class="h3" data-at="s6:berakhir" data-fx="up">LAYANAN BERAKHIR</div>
  <div class="rw" data-at="s6:Penjualan" data-fx="left"><b class="sm">STOP</b><span>penjualan berbayar</span></div>
  <div class="rw" data-at="s6:Refund" data-fx="left"><b class="sm">REFUND</b><span>pembelian Sep 2026. sRUBY hasil pasar tidak termasuk.</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk go2">JADWAL PENUTUPAN</div>
  <div class="dt" data-at="s7:Desember" data-fx="left"><b>30 DES 2026</b><span>server dan web shop tutup</span></div>
  <div class="dt" data-at="s7:Januari" data-fx="left"><b>13 JAN 2027</b><span>RUBYx keluar dari DEX</span></div>
  <div class="dt" data-at="s7:dompet" data-fx="left"><b class="ho">SETELAHNYA</b><span>RUBYx tetap di ONE Wallet</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h3" data-at="s8:Jadi" data-fx="up">TOKEN BERTAHAN.<br><span>NILAI BELUM TENTU.</span></div>
  <div class="q" data-at="s8:Menurut" data-fx="left">Kesempatan untuk pemain biasa?</div>
  <div class="lb" data-at="s8:Menurut" data-fx="fade">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
#scrim{position:absolute;left:0;right:0;top:0;height:700px;background:linear-gradient(180deg,rgba(8,6,26,.82),rgba(8,6,26,.66) 60%,rgba(8,6,26,0));z-index:9;pointer-events:none}
.h1,.h2,.h3,.dt b{font-variant-numeric:lining-nums}
.tk{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:${HOLO};margin-bottom:14px;text-shadow:0 2px 10px #000}
.tk.go2{color:${GOLD}}
.h1{font-family:"Playfair Display",serif;font-weight:900;font-size:116px;line-height:1.02;color:${IVORY};text-shadow:0 4px 24px rgba(0,0,0,.75)}
.h2{font-family:"Playfair Display",serif;font-weight:900;font-size:112px;line-height:1.05;color:${GOLD};text-shadow:0 4px 24px rgba(0,0,0,.75)}
.h3{font-family:"Playfair Display",serif;font-weight:900;font-size:76px;line-height:1.1;color:${IVORY};text-shadow:0 4px 22px #000}.h3 span{color:${GOLD}}
.stamp{display:inline-block;margin-top:18px;font-family:Inter,sans-serif;font-weight:900;font-size:34px;line-height:1.15;color:#08101c;background:${HOLO};padding:10px 18px}
.duo{display:flex;gap:12px;margin-top:16px}.duo>div{flex:1;background:rgba(10,10,30,.8);padding:12px 16px;border-top:4px solid ${GOLD}}.duo b{display:block;font-family:"Playfair Display",serif;font-weight:900;font-size:58px;line-height:1;color:${GOLD}}.duo b.ho{color:${HOLO}}.duo span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:${IVORY};margin-top:6px}
.tr{display:flex;align-items:center;gap:16px;background:rgba(10,10,30,.8);padding:8px 16px;margin-bottom:8px;border-left:6px solid ${GOLD}}
.tr b{flex:none;width:200px;font-family:"Playfair Display",serif;font-weight:900;font-size:54px;line-height:1.1}.tr span{font-family:Inter,sans-serif;font-weight:700;font-size:30px;line-height:1.18;color:${IVORY}}
.ru{color:${RUBY}!important}.si{color:#DDE3EC!important}.ho{color:${HOLO}!important}.go{color:${GOLD}!important}
.fl{display:flex;align-items:center;gap:5px}.fl b{flex:1;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:36px;padding:16px 0;background:rgba(10,10,30,.86);color:${IVORY};border-bottom:4px solid currentColor}.fl i{font-style:normal;font-size:30px;color:${IVORY};font-family:Inter,sans-serif}
.note{margin-top:14px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;color:${HOLO};text-shadow:0 2px 8px #000}
.v{font-family:"Playfair Display",serif;font-weight:900;font-size:92px;line-height:1.05;text-shadow:0 3px 20px #000}.nb{font-variant-numeric:tabular-nums lining-nums}
.lb{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:26px;line-height:1.25;color:${IVORY};margin-top:6px;text-shadow:0 2px 10px #000}
.rw{display:flex;align-items:center;gap:16px;background:rgba(10,10,30,.8);padding:10px 16px;margin-top:12px;border-left:6px solid ${RUBY}}
.rw b{flex:none;font-family:Inter,sans-serif;font-weight:900;font-size:50px;line-height:1;color:${IVORY}}.rw b.sm{font-size:36px;color:${RUBY}}.rw span{font-family:Inter,sans-serif;font-weight:700;font-size:29px;line-height:1.2;color:${IVORY}}
.dt{background:rgba(10,10,30,.82);padding:10px 16px;margin-bottom:8px;border-left:6px solid ${GOLD}}.dt b{display:block;font-family:"Playfair Display",serif;font-weight:900;font-size:50px;line-height:1.05;color:${GOLD}}.dt span{display:block;font-family:Inter,sans-serif;font-weight:700;font-size:28px;color:${IVORY};margin-top:2px}
.q{margin-top:16px;font-family:Inter,sans-serif;font-weight:900;font-size:44px;line-height:1.15;color:#08101c;background:${GOLD};padding:14px 18px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.62, html, css, chipFont: '"JetBrains Mono",monospace', chipColor: IVORY,
  extraAt: ["s1:tutup", "s3:RUBY", "s3:sRUBY", "s3:RUBYx", "s4:Jual", "s4:bursa", "s5:Hyper", "s5:Tapi", "s6:berakhir", "s7:server", "s7:dihapus"],
  // Panels open out of a thin holographic line.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(48% 0 48% 0)',opacity:0},{clipPath:'inset(-10% 0 -10% 0)',opacity:1,duration:.3,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(48% 0 48% 0)',opacity:0,duration:.16,ease:'power2.in'},b-.16)`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 8%)'});tl.to('#outro',{clipPath:'circle(130% at 50% 8%)',duration:.55,ease:'power2.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:58px;line-height:1.2;word-spacing:.04em;color:${IVORY};text-shadow:0 3px 14px #000}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"${IVORY}"},{color:"${GOLD}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${IVORY}",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:.1},{opacity:1,duration:.1,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Last Banner", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
