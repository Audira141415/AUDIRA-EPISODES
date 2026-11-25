// EP01 DARKSTEEL. Dark fantasy: forged-iron plates, teal ore light against ember. Panels drop like iron slabs. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ORE = "#46E0D0", EMB = "#FF7A2E", BONE = "#E9E3D2", RED = "#FF3B28", BG = "#05060A";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">MMORPG: MAIN GAME BISA JADI UANG? / EP 01</div>
  <div class="h1">BATU JADI<br><span>KRIPTO?</span></div>
  <div class="st rd" data-at="s1:disetop" data-fx="stamp">DISETOP SEJAK 30 OKT 2026</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">WEMADE / GLOBAL 2021</div>
  <div class="h2">MIR4</div>
  <div class="row" data-at="s2:Darksteel" data-fx="left"><b class="or">DARKSTEEL</b><span>mineral tambang, juga bahan klan dan PvP</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">SMELTING / ANGKA DASAR</div>
  <div class="eq"><div data-at="s3:100.000" data-fx="left"><b class="or nb">100.000</b><span>DARKSTEEL</span></div><i data-at="s3:DRACO" data-fx="fade">&rarr;</i><div data-at="s3:DRACO" data-fx="pop"><b class="em nb">1</b><span>DRACO</span></div></div>
  <div class="row" data-at="s3:Kursnya" data-fx="left"><b class="sm">KURS NAIK</b><span>makin banyak ditambang, makin banyak yang dibutuhkan. Ada batas harian.</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">SYARAT DAN BIAYA</div>
  <div class="ck" data-at="s4:40" data-fx="left"><b>LV 40</b><span>level minimum</span></div>
  <div class="ck" data-at="s4:WEMIX" data-fx="left"><b>WALLET</b><span>akun terhubung WEMIX</span></div>
  <div class="ck" data-at="s4:biaya" data-fx="left"><b>FEE</b><span>biaya transaksi</span></div>
  <div class="ck" data-at="s4:pajak" data-fx="left"><b>PAJAK</b><span>tambang wilayah klan</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">RANTAI NILAI</div>
  <div class="ch"><b data-at="s5:DRACO" data-fx="pop">DRACO</b><i data-at="s5:WEMIX" data-fx="fade">&rarr;</i><b data-at="s5:WEMIX" data-fx="pop">WEMIX</b><i data-at="s5:bursa" data-fx="fade">&rarr;</i><b data-at="s5:bursa" data-fx="pop">BURSA</b></div>
  <div class="row" data-at="s5:XDRACO" data-fx="left"><b class="sm">XDRACO</b><span>pasar karakter dan item</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk rd2">26 JULI 2026 / WEMIX$ DIBOBOL</div>
  <div class="v rd2 nb" data-at="s6:mencetak" data-fx="fade"><b class="ct" data-from="0" data-to="5225525" data-a="s6:mencetak" data-d="1.5">0</b></div>
  <div class="lb">WEMIX$ DICETAK PERETAS</div>
  <div class="st rd" data-at="s6:bridge" data-fx="stamp">SEMUA BRIDGE DIHENTIKAN</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">PENGUMUMAN RESMI MIR4 / MULAI 30 OKT 2026</div>
  <div class="h3" data-at="s7:blockchain" data-fx="up">SEMUA FITUR BLOCKCHAIN</div>
  <div class="st rd" data-at="s7:disetop" data-fx="stamp">SAMPAI ADA KABAR LANJUTAN</div>
  <div class="row" data-at="s7:Harga" data-fx="left"><b class="rd2 nb">&minus;99%</b><span>WEMIX: US$24,71 (Nov 2021) ke US$0,137 (4 Nov 2026). CoinGecko.</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h3" data-at="s8:Jadi" data-fx="up">NILAI ADA SELAMA<br><span>JALUR &amp; PEMBELI ADA</span></div>
  <div class="duo"><i data-at="s8:penghasilan" data-fx="pop">PENGHASILAN?</i><i data-at="s8:modal" data-fx="pop">MODAL BESAR?</i></div>
  <div class="lb" data-at="s8:Menurut" data-fx="fade">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
.tk{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:29px;color:${ORE};letter-spacing:.01em;margin-bottom:14px;text-shadow:0 2px 10px #000}
.tk.rd2,.rd2{color:${RED}!important}
.h1{font-family:Oswald,sans-serif;font-weight:700;font-size:128px;line-height:1.02;color:${BONE};text-shadow:0 4px 26px #000}.h1 span{color:${EMB}}
.h2{font-family:Oswald,sans-serif;font-weight:700;font-size:150px;line-height:1;color:${BONE};text-shadow:0 4px 26px #000}
.h3{font-family:Oswald,sans-serif;font-weight:700;font-size:78px;line-height:1.07;color:${BONE};text-shadow:0 4px 22px #000}.h3 span{color:${EMB}}
.v{font-family:Oswald,sans-serif;font-weight:700;font-size:126px;line-height:1;text-shadow:0 4px 22px #000}
.lb{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;line-height:1.25;color:${BONE};margin-top:8px;text-shadow:0 2px 10px #000}
.st{display:inline-block;margin-top:18px;font-family:Oswald,sans-serif;font-weight:700;font-size:48px;line-height:1.1;padding:8px 18px;color:#fff}
.st.rd{background:#C31B10;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.nb{font-variant-numeric:tabular-nums}
.or{color:${ORE}!important}.em{color:${EMB}!important}
.row{display:flex;gap:18px;align-items:center;margin-top:18px;padding:14px 18px;background:rgba(8,10,14,.78);border-left:7px solid ${EMB}}
.row b{flex:none;font-family:Oswald,sans-serif;font-weight:700;font-size:58px;line-height:1;color:${BONE}}.row b.sm{font-size:44px;color:${EMB}}
.row span{font-family:Inter,sans-serif;font-weight:700;font-size:30px;line-height:1.22;color:${BONE}}
.eq{display:flex;align-items:center;gap:16px;background:rgba(8,10,14,.78);padding:16px 18px;border-left:7px solid ${ORE}}
.eq b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:92px;line-height:1}.eq span{display:block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:27px;color:${BONE};margin-top:4px}.eq i{font-style:normal;font-family:Oswald,sans-serif;font-size:72px;color:${BONE}}
.ck{display:flex;align-items:center;gap:18px;background:rgba(8,10,14,.78);padding:8px 16px;margin-bottom:8px;border-left:7px solid ${ORE}}
.ck b{flex:none;width:190px;font-family:Oswald,sans-serif;font-weight:700;font-size:50px;line-height:1.1;color:${ORE}}.ck span{font-family:Inter,sans-serif;font-weight:700;font-size:31px;color:${BONE}}
.ch{display:flex;align-items:center;gap:8px}.ch b{flex:1;text-align:center;font-family:Oswald,sans-serif;font-weight:700;font-size:50px;padding:14px 2px;background:rgba(8,10,14,.82);color:${EMB};border-top:5px solid ${EMB}}.ch i{font-style:normal;font-family:Oswald,sans-serif;font-size:42px;color:${BONE}}
.duo{display:flex;gap:12px;margin-top:18px}.duo i{flex:1;text-align:center;font-style:normal;font-family:Oswald,sans-serif;font-weight:700;font-size:46px;padding:14px 2px;color:#120904;background:${EMB}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.62, grain: 0.09, capfloor: 0.58, html, css, chipFont: '"JetBrains Mono",monospace', chipColor: BONE,
  extraAt: ["s1:kripto", "s1:disetop", "s3:smelting", "s3:DRACO", "s6:dibobol", "s6:mencetak", "s6:bridge", "s7:disetop"],
  // Panels fall from above like iron slabs and leave downward.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-46,opacity:0},{y:0,opacity:1,duration:.26,ease:'power4.in'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:34,opacity:0,duration:.16,ease:'power2.in'},b-.16)`,
  // The closing card slams shut from both sides, the same way the gate just did.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 50% 0 50%)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0%)',duration:.38,ease:'power4.in'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Oswald,sans-serif;font-weight:600;font-size:68px;line-height:1.16;word-spacing:.12em;color:#fff;text-shadow:0 3px 14px #000}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"${ORE}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:.2},{y:0,opacity:1,duration:.12,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Darksteel", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
