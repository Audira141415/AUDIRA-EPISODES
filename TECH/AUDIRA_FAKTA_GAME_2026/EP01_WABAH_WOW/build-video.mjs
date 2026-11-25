// EP01 PETA WABAH. Parchment outbreak map at night with a cyan lab layer; panels bleed in like ink, fade back into parchment. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAR = "#E8D9B5", INK = "#3B2A1A", RED = "#D7263D", CY = "#36C5F0", NB = "#101826";
const CZ = "Cinzel,serif", PL = "'IBM Plex Sans Condensed',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tg">FAKTA GAME / EP 01 &middot; PETA WABAH</div>
  <div class="cd"><div class="ti">WABAH<br><span>2005</span></div></div>
  <div class="cd l" data-at="s1:Sampai" data-fx="ink">Lembaga kesehatan Amerika ikut bertanya</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tg">13 SEP 2005 &middot; AREA BARU</div>
  <div class="row"><div class="cd h" data-at="s2:Zul'Gurub" data-fx="ink">Zul'Gurub</div><div class="cd l" data-at="s2:Hakkar" data-fx="ink">Bos: Hakkar</div></div>
  <div class="stp" data-at="s2:Corrupted" data-fx="stamp">CORRUPTED BLOOD</div>
  <div class="cd l" data-at="s2:menular" data-fx="ink">Menular ke pemain yang berdekatan</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tg">CELAH: HEWAN PELIHARAAN</div>
  <div class="cd l" data-at="s3:menyimpan" data-fx="ink">Pet disimpan di tengah pertarungan</div>
  <div class="stp" data-at="s3:lupa" data-fx="stamp">TANPA TOMBOL MATI</div>
  <div class="cd l" data-at="s3:dikeluarkan" data-fx="ink">Dilepas di kota yang ramai</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tg">DAMAGE KUTUKAN</div>
  <div class="cd" data-at="s4:dua" data-fx="ink"><div class="n">263&ndash;337</div><div class="l sm">poin / 2 detik</div></div>
  <div class="cd l" data-at="s4:Karakter" data-fx="ink">Level tertinggi: mati &le; 30 detik</div>
  <div class="stp" data-at="s4:NPC" data-fx="stamp">NPC: PEMBAWA TANPA GEJALA</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tg">REAKSI PEMAIN = DUNIA NYATA</div>
  <div class="cd l g" data-at="s5:healer" data-fx="ink">Healer jadi relawan</div>
  <div class="cd l o" data-at="s5:berjaga" data-fx="ink">Penjaga di pinggir kota</div>
  <div class="cd l r" data-at="s5:sengaja" data-fx="ink">Sengaja menularkan diri</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tg">RESPON BLIZZARD</div>
  <div class="row"><div class="cd l" data-at="s6:karantina" data-fx="ink">Karantina</div><div class="cd l" data-at="s6:restart" data-fx="ink">Restart server</div></div>
  <div class="stp" data-at="s6:muncul" data-fx="stamp">MUNCUL LAGI</div>
  <div class="cd l" data-at="s6:total" data-fx="ink">Reset total</div>
  <div class="cd l c" data-at="s6:Oktober" data-fx="ink">8 Okt: patch, pet kebal</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tg">CDC &middot; PENGENDALIAN PENYAKIT AMERIKA</div>
  <div class="cd l" data-at="s7:peneliti" data-fx="ink">Peneliti menulisnya di jurnal ilmiah</div>
  <div class="cd l" data-at="s7:manusia" data-fx="ink">Reaksi pemain = reaksi manusia</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="cd" data-at="s8:Jadi" data-fx="ink"><div class="h2">Bug game,<br><span>bahan riset wabah</span></div></div>
  <div class="cd l" data-at="s8:Kalau" data-fx="ink">Kamu: healer, atau kabur?</div>
</div>`;

const css = `
.tg{display:table;font-family:${PL};font-weight:600;font-size:26px;letter-spacing:.14em;color:${CY};background:rgba(16,24,38,.88);border:2px solid ${CY};padding:7px 16px 6px;margin-bottom:14px}
.cd{display:table;background:${PAR};color:${INK};border:3px solid ${INK};box-shadow:inset 0 0 0 6px ${PAR},inset 0 0 0 8px rgba(59,42,26,.5),0 14px 30px rgba(0,0,0,.5);padding:14px 26px 16px;margin-bottom:14px}
.ti{font-family:${CZ};font-weight:700;font-size:96px;line-height:1.0}.ti span{color:${RED}}
.h{font-family:${CZ};font-weight:700;font-size:46px;line-height:1.1}
.h2{font-family:${CZ};font-weight:700;font-size:58px;line-height:1.08}.h2 span{color:${RED}}
.l{font-family:${PL};font-weight:600;font-size:40px;line-height:1.15}.sm{font-size:34px}
.n{font-family:${PL};font-weight:700;font-size:100px;color:${RED};line-height:1}
.row{display:flex;gap:14px;align-items:stretch}.row .cd{margin-bottom:14px}
.g{border-left:16px solid #4FA65A}.o{border-left:16px solid #C99A2E}.r{border-left:16px solid ${RED}}.c{border-left:16px solid ${CY}}
.stp{display:table;font-family:${PL};font-weight:700;font-size:50px;letter-spacing:.04em;color:${RED};background:rgba(232,217,181,.94);border:5px solid ${RED};box-shadow:inset 0 0 0 4px rgba(232,217,181,.94),inset 0 0 0 6px ${RED};padding:6px 20px;margin:4px 0 16px 6px}
#chip{color:${PAR};background:rgba(16,24,38,.7);padding:3px 12px;top:176px;font-size:21px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: NB, vig: 0.5, grain: 0.06, capfloor: 0.3, html, css, chipFont: "'IBM Plex Sans Condensed',sans-serif", chipColor: PAR,
  extraAt: ["s2:Bosnya", "s2:dikalahkan", "s3:peliharaan", "s3:Developer", "s3:terinfeksi", "s5:memperingatkan", "s5:keramaian", "s6:server#2", "s7:CDC", "s7:bug", "s7:Tapi", "s7:jurnal"],
  // Ink bleeds out from the top-left corner like a blot on paper.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,clipPath:'circle(0% at 6% 4%)'},{clipPath:'circle(150% at 6% 4%)',duration:.6,ease:'power2.inOut'},a-.1)`,
  // Fades back into the parchment.
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,filter:'sepia(1) brightness(1.6) blur(3px)',duration:.32,ease:'power1.in'},b-.32)`,
  fxExtra: `ink:(e,t)=>tl.fromTo(e,{opacity:1,clipPath:'circle(0% at 4% 50%)'},{clipPath:'circle(150% at 4% 50%)',duration:.5,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 45%)'});tl.to('#outro',{clipPath:'circle(130% at 50% 45%)',duration:.6,ease:'power2.in'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'IBM Plex Sans Condensed',sans-serif;font-weight:700;font-size:66px;line-height:1.14;color:#fff;text-shadow:4px 0 0 ${NB},-4px 0 0 ${NB},0 4px 0 ${NB},0 -4px 0 ${NB},3px 3px 0 ${NB},-3px 3px 0 ${NB},3px -3px 0 ${NB},-3px -3px 0 ${NB},0 8px 14px rgba(0,0,0,.6)}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",scale:1},{color:"${RED}",scale:1.08,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",scale:1,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Peta Wabah", NB);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
