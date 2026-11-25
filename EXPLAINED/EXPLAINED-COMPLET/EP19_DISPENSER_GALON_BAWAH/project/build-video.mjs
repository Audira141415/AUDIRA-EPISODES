// EP19 — Dispenser Galon Bawah · NANOFORGE · build
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);

const BG   = "#06091a";
const CYAN = "#00e5ff";
const TEAL = "#00bcd4";
const GREEN = "#00e676";
const HOT  = "#ff6d00";
const COLD = "#448aff";
const DIM  = "#0d1b3e";
const WHITE = "#e0e0e0";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2" style="top:260px">
 <div data-at="s1:dispenser" data-fx="pop" style="font-size:52px;font-weight:800;color:${CYAN};text-transform:uppercase;letter-spacing:.06em">Dispenser Galon Bawah</div>
 <div data-at="s1:melawan" data-fx="up" style="margin-top:18px;font-size:28px;color:${WHITE};opacity:.85">Air melawan gravitasi</div>
 <div data-at="s1:pompa" data-fx="left" style="margin-top:14px;font-size:24px;color:${TEAL}">Diangkat pompa listrik kecil</div>
</div>

<div class="p" data-in="s2" data-out="s3" style="top:260px">
 <div data-at="s2:Dispenser" data-fx="up" style="font-size:30px;font-weight:700;color:${WHITE}">Dispenser Biasa</div>
 <div data-at="s2:terbalik" data-fx="left" style="margin-top:12px;font-size:24px;color:${TEAL}">Galon terbalik di atas</div>
 <div data-at="s2:Masalahnya" data-fx="up" style="margin-top:20px;font-size:28px;font-weight:700;color:${HOT}">Masalah:</div>
 <div data-at="s2:berat" data-fx="left" style="margin-top:8px;font-size:24px;color:${WHITE};opacity:.85">Galon penuh berat diangkat setinggi dada</div>
</div>

<div class="p" data-in="s3" data-out="s4" style="top:260px">
 <div data-at="s3:memindahkan" data-fx="pop" style="font-size:30px;font-weight:700;color:${CYAN}">Galon di Bawah</div>
 <div data-at="s3:mendorongnya" data-fx="up" style="margin-top:12px;font-size:24px;color:${WHITE}">Dorong masuk ke lemari bawah</div>
 <div data-at="s3:pipa" data-fx="left" style="margin-top:14px;font-size:24px;color:${TEAL}">Pipa penyedot masuk ke galon</div>
</div>

<div class="p" data-in="s4" data-out="s5" style="top:260px">
 <div data-at="s4:pompa" data-fx="pop" style="font-size:30px;font-weight:700;color:${GREEN}">Pompa Listrik</div>
 <div data-at="s4:menyedot" data-fx="up" style="margin-top:12px;font-size:24px;color:${WHITE}">Menyedot air dari galon</div>
 <div data-at="s4:tangki" data-fx="left" style="margin-top:14px;font-size:24px;color:${CYAN}">Mendorong naik ke tangki atas</div>
</div>

<div class="p" data-in="s5" data-out="s6" style="top:260px">
 <div data-at="s5:pelampung" data-fx="pop" style="font-size:30px;font-weight:700;color:${GREEN}">Pelampung Otomatis</div>
 <div data-at="s5:mematikan" data-fx="up" style="margin-top:12px;font-size:24px;color:${WHITE}">Air naik → pelampung naik → pompa mati</div>
 <div data-at="s5:menyala" data-fx="left" style="margin-top:14px;font-size:24px;color:${CYAN}">Air turun → pelampung turun → pompa nyala</div>
</div>

<div class="p" data-in="s6" data-out="s7" style="top:260px">
 <div data-at="s6:dibagi" data-fx="pop" style="font-size:30px;font-weight:700;color:${WHITE}">Dua Jalur</div>
 <div data-at="s6:dingin" data-fx="left" style="margin-top:14px;font-size:24px;color:${COLD}">Tangki dingin: kompresor / Peltier</div>
 <div data-at="s6:elemen" data-fx="left" style="margin-top:10px;font-size:24px;color:${HOT}">Tangki panas: elemen pemanas listrik</div>
 <div data-at="s6:pengunci" data-fx="up" style="margin-top:14px;font-size:22px;color:${WHITE};opacity:.8">Keran panas ada pengunci keamanan</div>
</div>

<div class="p" data-in="s7" data-out="s8" style="top:260px">
 <div data-at="s7:menekan" data-fx="pop" style="font-size:30px;font-weight:700;color:${CYAN}">Tekan Keran</div>
 <div data-at="s7:membuka" data-fx="up" style="margin-top:12px;font-size:24px;color:${WHITE}">Hanya membuka tangki atas</div>
 <div data-at="s7:diam-diam" data-fx="left" style="margin-top:14px;font-size:24px;color:${GREEN}">Pompa bekerja diam-diam</div>
 <div data-at="s7:sembilan" data-fx="up" style="margin-top:18px;font-size:38px;font-weight:800;color:${CYAN}"><b class="ct nb" data-from="0" data-to="19" data-a="s7:sembilan" data-d="1.2" data-suf=" L"></b></div>
 <div data-at="s7:kilogram" data-fx="fade" style="margin-top:6px;font-size:22px;color:${WHITE};opacity:.8">tidak perlu diangkat</div>
</div>

<div class="p" data-in="s8" data-out="@END" style="top:280px">
 <div data-at="s8:Pompa" data-fx="pop" style="font-size:28px;font-weight:700;color:${CYAN}">Pompa + Pelampung + 2 Tangki</div>
 <div data-at="s8:bergantian" data-fx="up" style="margin-top:12px;font-size:24px;color:${WHITE}">Bekerja bergantian untukmu</div>
</div>
`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
.p{font-family:Outfit,sans-serif;line-height:1.35}
`;

copyFileSync("world3d.js", "hf/assets/lib/world3d.js");

const PIN = (tl, el, t) => {
  tl.fromTo(el, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.38, ease: "power4.out" }, t);
};
const POUT = (tl, el, t) => {
  tl.to(el, { x: 60, opacity: 0, duration: 0.25, ease: "power2.in" }, t);
};

const { K, AT } = writeWorld(TL, at, {
  ep: "19",
  bg: BG,
  vig: 0.5,
  grain: 0.04,
  capfloor: 0.55,
  html,
  css,
  chipFont: "Outfit,sans-serif",
  chipColor: TEAL,
  sig: "EP19_DISPENSER_GALON_BAWAH",
  panelIn: PIN,
  panelOut: POUT,
  extraAt: []
});

writeCaptions(".", TL,
  `.cap{position:absolute;left:54px;right:54px;bottom:420px;text-align:center;font-family:Outfit,sans-serif;font-weight:700;font-size:38px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.85)}
   .capin{display:inline} .w{transition:color .12s} .w.on{color:${CYAN}}`,
  (id, w) => `tl.to('#${id}',{onStart(){document.getElementById('${id}').classList.add('on')},onReverseComplete(){document.getElementById('${id}').classList.remove('on')},duration:.01},${w.start.toFixed(3)});\n`,
  (id, t) => `tl.fromTo('#${id}',{y:18,opacity:0},{y:0,opacity:1,duration:.22,ease:'power2.out'},${t.toFixed(3)});\n`
);

writeIndex(".", TL, "EP19 Dispenser Galon Bawah — AUDIRA", BG);
console.log("EP19 build OK — beats.json written");
