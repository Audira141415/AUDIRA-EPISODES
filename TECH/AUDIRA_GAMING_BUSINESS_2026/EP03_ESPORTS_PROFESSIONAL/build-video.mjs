// EP03 THE BOWL. Broadcast graphics over a dark arena. The only motion axis is forward, so panels punch toward camera. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const MAG = "#FF1F6B", AMB = "#FFB020", ICE = "#DFF1FF", INK = "#03040A";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="sl">DARI GAMER MENJADI PENGHASIL UANG &middot; EP 03</div>
  <div class="h0 nb">US$75 JUTA</div>
  <div class="tl">ESPORTS WORLD CUP 2026, PARIS</div>
  <div class="st" data-at="s1:Tapi" data-fx="stamp">BUKAN UANG BAWA PULANG</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="sl">DIBAGI KE MANA</div>
  <div class="rw" data-at="s2:30" data-fx="left"><b class="nb">US$7 JT</b><span>juara klub, dari pos US$30 JT</span></div>
  <div class="rw alt" data-at="s2:dua" data-fx="left"><b class="nb">2.000+</b><span>pemain ikut berebut</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="sl">TOTAL HADIAH SEPANJANG SEJARAH</div>
  <div class="h2">EKONOMI TIAP GAME BEDA</div>
  <div class="srcl" data-at="s3:Counter-Strike" data-fx="fade">Esports Earnings, 4 Nov 2026. CS2 terpisah dari CS:GO.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="sl">M7 &middot; JAKARTA &middot; JANUARI 2026</div>
  <div class="rw" data-at="s4:Satu" data-fx="left"><b class="nb">US$1 JT</b><span>total hadiah</span></div>
  <div class="rw alt" data-at="s4:nol-empat" data-fx="left"><b class="nb">0-4</b><span>Alter Ego, Indonesia, di final</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="sl">CONTOH KONTRAK UMUM</div>
  <div class="duo"><div class="dv" data-at="s5:20" data-fx="pop"><b class="am nb">20%</b><span>organisasi</span></div><div class="dv" data-at="s5:sisanya" data-fx="pop"><b class="mg nb">80%</b><span>dibagi rata pemain</span></div></div>
  <div class="st" data-at="s5:kontrak" data-fx="stamp">KONTRAK, BUKAN ATURAN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="sl">GAJI LEC, LIGA EROPA &middot; 2024-2025</div>
  <div class="rw" data-at="s6:240.000" data-fx="left"><b class="nb">&euro;240K</b><span>rata-rata per tahun</span></div>
  <div class="rw alt" data-at="s6:165.000" data-fx="left"><b class="nb">&euro;165K</b><span>median per tahun</span></div>
  <div class="srcl" data-at="s6:165.000" data-fx="fade">Sheep Esports via Esports Insider. Termasuk bonus. Liga papan atas, bukan gambaran umum.</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="sl">PEMAIN INDONESIA, SEPANJANG MASA</div>
  <div class="h0 sm nb" data-at="s7:22,5" data-fx="pop">US$22,5 JT</div>
  <div class="rw" data-at="s7:Whitemon" data-fx="left"><b class="nb">US$1,1 JT</b><span>Whitemon, karier, Dota 2</span></div>
  <div class="srcl" data-at="s7:Whitemon" data-fx="fade">Hadiah tercatat Esports Earnings, 4 Nov 2026. Bukan gaji.</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h0 sm2" data-at="s8:Jadi" data-fx="pop">NYATA.<br><i>TAPI SEMPIT.</i></div>
  <div class="duo"><div class="dv q" data-at="s8:dukung" data-fx="pop"><b>DUKUNG PENUH?</b></div><div class="dv q" data-at="s8:cadangan" data-fx="pop"><b>RENCANA B?</b></div></div>
</div>`;

const css = `
.sl{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:31px;color:${INK};background:${ICE};padding:7px 14px;margin-bottom:14px}
.h0{font-family:"Archivo Black",sans-serif;font-size:124px;line-height:1;color:#fff;letter-spacing:-.02em;text-shadow:0 0 40px rgba(255,31,107,.7)}
.h0.sm{font-size:112px;color:${AMB};text-shadow:0 0 36px rgba(255,176,32,.55)}.h0.sm2{font-size:112px;line-height:1.02}.h0 i{font-style:normal;color:${MAG}}
.h2{font-family:"Archivo Black",sans-serif;font-size:74px;line-height:1.04;color:#fff}
.tl{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:36px;color:${ICE};margin-top:12px;text-shadow:0 2px 12px #000}
.st{display:inline-block;margin-top:20px;font-family:"Archivo Black",sans-serif;font-size:46px;color:#fff;background:${MAG};padding:10px 22px}
.rw{display:flex;align-items:center;gap:20px;background:rgba(5,7,16,.82);border-left:10px solid ${MAG};padding:12px 18px;margin-top:10px}
.rw.alt{border-left-color:${AMB}}
.rw b{flex:none;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:58px;line-height:1;color:#fff}
.rw span{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:30px;line-height:1.16;color:${ICE}}
.duo{display:flex;gap:14px;margin-top:6px}
.dv{flex:1;background:rgba(5,7,16,.84);border-top:10px solid ${AMB};padding:16px 18px}
.dv b{display:block;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:100px;line-height:1;color:#fff}.dv b.am{color:${AMB}}.dv b.mg{color:${MAG}}
.dv span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:29px;line-height:1.16;color:${ICE};margin-top:8px}
.dv.q{border-top-color:${MAG};margin-top:18px}.dv.q b{font-size:50px;line-height:1.04}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:28px;line-height:1.2;color:#fff;background:rgba(5,7,16,.65);padding:6px 10px;margin-top:12px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: INK, vig: 0.5, grain: 0.07, capfloor: 0.55, html, css,
  extraAt: ["s4:Hadiahnya", "s4:5,68", "s3:Valorant", "s3:Mobile", "s3:Free"],
  // Z forward is the current: a panel grows into view from deep and passes the lens on exit.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scale:.72,opacity:0,transformPerspective:1400},{scale:1,opacity:1,duration:.34,ease:'power3.out'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{scale:1.55,opacity:0,duration:.24,ease:'power3.in'},b-.22)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:900;font-size:60px;line-height:1.26;word-spacing:.12em;color:#fff}
.w{display:inline-block;padding:0 8px}`,
// Active word sits on a magenta block, like a broadcast lower-third.
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(255,31,107,0)",color:"#FFFFFF"},{backgroundColor:"rgba(255,31,107,1)",color:"#FFFFFF",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(255,31,107,0)",duration:.07},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scale:.94,opacity:.25},{scale:1,opacity:1,duration:.13,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Bowl", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
