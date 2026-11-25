// EP04 BLOCK ASCENT. Wooden signboards and mono type; everything moves in whole-pixel steps. The world climbs one mountain, panels drop in like placed blocks. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const WOOD = "#3A2A18", PLK = "#C39A5E", GRASS = "#5FA83B", GOLD = "#F2C230", PAPER = "#F4EAD2", INK = "#20160C";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="sign"><div class="ks">DARI GAMER MENJADI PENGHASIL UANG &middot; EP 04</div>
  <div class="big">US$500 JUTA+</div>
  <div class="sm">pendapatan komunitas kreator, 2017 sampai Juni 2022</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="sign"><div class="ks">MINECRAFT MARKETPLACE</div>
  <div class="grid">
   <div class="ch rd" data-at="s2:skin" data-fx="block">SKIN PACK</div>
   <div class="ch bl" data-at="s2:adventure" data-fx="block">ADVENTURE MAP</div>
   <div class="ch pk" data-at="s2:texture" data-fx="block">TEXTURE PACK</div>
   <div class="ch tl" data-at="s2:add-on" data-fx="block">ADD-ON</div>
  </div>
  <div class="sm" data-at="s2:Minecoins" data-fx="block">dibayar dengan Minecoins</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="sign"><div class="ks">BUKAN TOKO TERBUKA</div>
  <div class="rq" data-at="s3:portofolio" data-fx="block"><i></i>Portofolio terbukti</div>
  <div class="rq" data-at="s3:bisnis" data-fx="block"><i></i>Bekerja seperti bisnis</div>
  <div class="rq" data-at="s3:key" data-fx="block"><i></i>Key art, trailer, deskripsi</div>
  <div class="rq au" data-at="s3:publisher" data-fx="block"><i></i>Pintu termudah: publisher resmi</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="sign"><div class="ks">BAGI HASIL, MICROSOFT 2022</div>
  <div class="big sm2" data-at="s4:separuh" data-fx="block">&gt; 50%</div>
  <div class="sm">dari sisa setelah jatah toko seperti App Store. Angka pasti tidak diumumkan.</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="sign"><div class="ks">PARTNER, JUNI 2022</div>
  <div class="trio"><div data-at="s5:295" data-fx="block"><b>295</b><span>partner</span></div><div data-at="s5:43" data-fx="block"><b class="au">43</b><span>di atas US$1 juta</span></div><div data-at="s5:252" data-fx="block"><b class="rd">252</b><span>belum</span></div></div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="sign"><div class="ks">GAMEMODE ONE, 2022</div>
  <div class="big sm2" data-at="s6:26" data-fx="block">26 STAF</div>
  <div class="sm">mayoritas penuh waktu</div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="sign warn"><div class="ks">CATATAN</div>
  <div class="sm lg" data-at="s7:Catatan" data-fx="block">Data US$500 juta: Juni 2022. Angka resmi lebih baru belum ditemukan.</div>
  <div class="rq au" data-at="s7:afiliasi" data-fx="block"><i></i>Juni 2026: program afiliasi pertama</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="sign"><div class="big sm3" data-at="s8:produk" data-fx="block">PRODUK. TIM. PASAR.</div>
  <div class="sm lg" data-at="s8:jual" data-fx="block">Kamu jual apa duluan?</div></div>
</div>`;

const css = `
.sign{background:${PLK};border:10px solid ${WOOD};padding:20px 24px;box-shadow:12px 12px 0 rgba(32,22,12,.65);background-image:repeating-linear-gradient(0deg,rgba(58,42,24,.16) 0 4px,transparent 4px 44px)}
.sign.warn{background:${PAPER}}
.ks{font-family:"Space Mono",monospace;font-weight:700;font-size:30px;line-height:1.1;color:${INK};margin-bottom:10px}
.big{font-family:"Space Mono",monospace;font-weight:700;font-size:98px;line-height:1;color:${INK};letter-spacing:-.05em}
.big.sm2{font-size:136px;color:#8A1F14}.big.sm3{font-size:80px;line-height:1.02}
.sm{font-family:Outfit,sans-serif;font-weight:700;font-size:35px;line-height:1.16;color:${INK};margin-top:10px}.sm.lg{font-size:42px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
.ch{font-family:"Space Mono",monospace;font-weight:700;font-size:34px;line-height:1.05;color:#fff;padding:18px 14px;border:6px solid ${INK};text-shadow:3px 3px 0 ${INK}}
.ch.rd{background:#C8362F}.ch.bl{background:#3B74C9}.ch.pk{background:#D85C96}.ch.tl{background:#209586}
.rq{display:flex;align-items:center;gap:16px;font-family:Outfit,sans-serif;font-weight:700;font-size:42px;line-height:1.08;color:${INK};margin-top:12px}
.rq i{flex:none;width:30px;height:30px;background:${GRASS};border:5px solid ${INK}}.rq.au i{background:${GOLD}}
.trio{display:flex;gap:14px}.trio>div{flex:1}
.trio b{display:block;font-family:"Space Mono",monospace;font-weight:700;font-size:92px;line-height:1;color:${INK};letter-spacing:-.05em}.trio b.au{color:#8F6A00}.trio b.rd{color:#8A1F14}
.trio span{display:block;font-family:Outfit,sans-serif;font-weight:700;font-size:30px;line-height:1.1;color:${INK};margin-top:6px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: "#7CC3F5", vig: 0.12, grain: 0.04, capfloor: 0, html, css,
  extraAt: ["s2:skin", "s2:adventure", "s2:texture", "s2:add-on", "s2:Minecoins", "s3:direview", "s3:key", "s4:App", "s4:separuh", "s5:295", "s5:43", "s6:perusahaan", "s6:26", "s7:afiliasi", "s8:Kalau", "s8:jual", "s3:bisnis", "s3:publisher", "s3:portofolio", "s5:252", "s7:Catatan", "s8:produk"],
  // Blocks are placed, not eased: stepped drop in, stepped lift out.
  fxExtra: `block:(e,t)=>tl.fromTo(e,{y:-36,opacity:0},{y:0,opacity:1,duration:.2,ease:'steps(4)'},t),`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-300,opacity:0},{y:0,opacity:1,duration:.32,ease:'steps(6)'},a-.14)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-420,opacity:0,duration:.24,ease:'steps(5)'},b-.22)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Outfit,sans-serif;font-weight:800;font-size:60px;line-height:1.3;word-spacing:.08em;color:#fff}
.w{display:inline-block;padding:0 10px;background:rgba(32,22,12,.82);margin:0 -2px}`,
// The lit word is a gold block, snapped on and off with no fade.
(id, w) => `tl.set("#${id}",{backgroundColor:"${GOLD}",color:"${INK}"},${w.start.toFixed(3)});tl.set("#${id}",{backgroundColor:"rgba(32,22,12,.82)",color:"#FFFFFF"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18},{y:0,duration:.1,ease:"steps(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Block Ascent", "#7CC3F5");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
