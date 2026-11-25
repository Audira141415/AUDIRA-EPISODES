// EP05 INSPECT. A dark tactical product shoot: left-aligned mono readouts, an ember ticker, and a hard black shutter at every act. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const EMB = "#FF7A1A", BG = "#07080A", BLUE = "#5AA8FF", BONE = "#E7E3D8", RED = "#FF3B1F";

const html = `
<div id="shutter"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">DARI GAMER MENJADI PENGHASIL UANG / EP 05</div>
  <div class="v1 nb">US$1.000.000</div>
  <div class="lb">AK-47 CASE HARDENED, DILAPORKAN TERJUAL JUNI 2024</div>
  <div class="st" data-at="s1:Tanpa" data-fx="fade">+0 DAMAGE</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">STEAM WORKSHOP / CS2</div>
  <div class="v2 nb"><b class="ct" data-from="0" data-to="151133" data-a="s2:karya" data-d="1.4">0</b></div>
  <div class="lb">KARYA DIUNGGAH</div>
  <div class="v2 og nb" data-at="s2:442" data-fx="fade">442</div>
  <div class="lb" data-at="s2:442" data-fx="fade">DITERIMA / &lt;0,3% / 1 KOTAK = 100 KARYA</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">BAGIAN KREATOR</div>
  <div class="v1 og nb" data-at="s3:25" data-fx="fade">25%</div>
  <div class="lb" data-at="s3:25" data-fx="fade">DARI PENJUALAN LANGSUNG / STEAM</div>
  <div class="rw" data-at="s3:57" data-fx="fade"><b class="nb">US$57 JUTA</b><span>ke 1.500 kontributor, TF2 + Dota 2 + CS:GO, sampai Jan 2015</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">STEAM COMMUNITY MARKET</div>
  <div class="rw" data-at="s4:15" data-fx="fade"><b class="nb">~15%</b><span>potongan tiap penjualan antarpemain</span></div>
  <div class="rw" data-at="s4:Wallet" data-fx="fade"><b>WALLET</b><span>saldo tidak bisa ditarik ke bank</span></div>
  <div class="st" data-at="s4:transaksi" data-fx="fade">TRANSAKSI PEMAIN &ne; PENDAPATAN KREATOR</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">KENAPA MAHAL</div>
  <div class="ls" data-at="s5:Langka" data-fx="fade">01 LANGKA</div>
  <div class="ls" data-at="s5:polanya" data-fx="fade">02 POLA UNIK</div>
  <div class="ls og" data-at="s5:percaya" data-fx="fade">03 KEPERCAYAAN</div>
</div>
<div class="p plate" data-in="s6" data-out="s7">
  <div class="tk">22 OKTOBER 2025 / UPDATE</div>
  <div class="v3" data-at="s6:lima" data-fx="fade">5 COVERT &rarr; PISAU</div>
  <div class="v1 rd nb" data-at="s6:dua" data-fx="fade">-US$2 MILIAR</div>
  <div class="lb" data-at="s6:dua" data-fx="fade">ESTIMASI NILAI PASAR. SUMBER BERBEDA: 1,7 SAMPAI 2,4 MILIAR</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">PRICEMPIRE VIA PLEY.GG / KURVA ILUSTRATIF, DUA TITIK BERSUMBER</div>
  <div class="duo"><div data-at="s7:10,4" data-fx="fade"><b class="bl nb">US$10,4 MILIAR</b><span>OKT 2025</span></div><div data-at="s7:6,5" data-fx="fade"><b class="rd nb">US$6,5 MILIAR</b><span>SEP 2026</span></div></div>
  <div class="rw" data-at="s7:Jaksa" data-fx="fade"><b class="sm">FEB 2026</b><span>Jaksa Agung NY gugat Valve soal loot box. Valve menolak, minta gugatan dibatalkan.</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="v3 hd" data-at="s8:Jadi" data-fx="fade">HARGA ADA.<br><span>JAMINAN TIDAK.</span></div>
  <div class="tri"><i data-at="s8:koleksi" data-fx="fade">KOLEKSI?</i><i data-at="s8:investasi" data-fx="fade">INVESTASI?</i><i data-at="s8:judi" data-fx="fade">JUDI?</i></div>
  <div class="lb" data-at="s8:koleksi" data-fx="fade">BUKAN SARAN INVESTASI</div>
</div>`;

const css = `
#shutter{position:absolute;inset:0;z-index:12;background:#000;transform-origin:50% 0;pointer-events:none}
.plate{background:rgba(4,5,7,.84);padding:18px 22px;left:40px;right:90px}
.tk{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;color:${EMB};letter-spacing:.02em;margin-bottom:12px}
.v1{font-family:Oswald,sans-serif;font-weight:700;font-size:118px;line-height:1;color:${BONE};letter-spacing:-.01em}
.v2{font-family:Oswald,sans-serif;font-weight:700;font-size:112px;line-height:1;color:${BONE}}
.v3{font-family:Oswald,sans-serif;font-weight:700;font-size:82px;line-height:1.05;color:${BONE}}
.v3.hd{font-size:104px}.v3 span{color:${EMB}}
.og{color:${EMB}!important}.rd{color:${RED}!important}.bl{color:${BLUE}!important}
.lb{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:29px;line-height:1.2;color:${BONE};margin-top:8px;text-shadow:0 2px 8px #000}
.st{display:inline-block;margin-top:16px;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:35px;line-height:1.14;color:#000;background:${EMB};padding:8px 14px}
.rw{display:flex;gap:18px;align-items:center;border-top:3px solid ${EMB};padding:12px 0;margin-top:8px}
.rw b{flex:none;font-family:Oswald,sans-serif;font-weight:700;font-size:68px;line-height:1;color:${BONE}}.rw b.sm{font-size:48px;color:${EMB}}
.rw span{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:29px;line-height:1.18;color:${BONE};text-shadow:0 2px 8px #000}
.ls{font-family:Oswald,sans-serif;font-weight:700;font-size:88px;line-height:1.1;color:${BONE}}
.duo{display:flex;gap:18px}.duo>div{flex:1}.duo b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:62px;line-height:1}.duo span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:29px;color:${BONE};margin-top:4px}
.tri{display:flex;gap:12px;margin-top:18px}.tri i{flex:1;text-align:center;font-style:normal;font-family:Oswald,sans-serif;font-weight:700;font-size:44px;line-height:1;color:#000;background:${EMB};padding:14px 2px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const CUTS = TL.scenes.slice(1).map((s) => s.start);
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.55, grain: 0.08, capfloor: 0.5, html, css,
  extraAt: ["s2:karya", "s2:442", "s3:25", "s6:Valve", "s6:lima", "s6:pisau", "s6:Barang", "s7:puncak", "s7:Februari", "s7:10,4", "s7:6,5", "s4:15", "s4:Wallet", "s4:transaksi", "s5:Langka", "s5:polanya", "s5:percaya", "s3:57", "s1:Tanpa", "s6:dua", "s8:koleksi", "s8:investasi", "s8:judi"],
  // A black shutter closes across each act change, so the macro camera can jump behind it. Panels only hard-cut.
  panelIn: `(tl,p,a)=>tl.set(p,{opacity:1},a-.02)`,
  panelOut: `(tl,p,b)=>tl.set(p,{opacity:0},b-.08)`,
  hud: `(function(){const s=q('#shutter');const cuts=${JSON.stringify(CUTS)};return (t)=>{let v=0;for(const c of cuts){const d=t-c;if(d>-.16&&d<.14)v=d<0?1+d/.16:1-d/.14;}s.style.transform='scaleY('+Math.max(0,v).toFixed(3)+')';};})()`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:left;font-family:Oswald,sans-serif;font-weight:600;font-size:66px;line-height:1.16;word-spacing:.12em;color:#A9ACA7;text-shadow:0 3px 12px #000}
.w{display:inline-block}`,
// Spoken words stay lit: the line fills in from grey to bone, the current word is ember.
(id, w) => `tl.fromTo("#${id}",{color:"#A9ACA7"},{color:"${EMB}",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${BONE}",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-26,opacity:.2},{x:0,opacity:1,duration:.12,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Inspect", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
