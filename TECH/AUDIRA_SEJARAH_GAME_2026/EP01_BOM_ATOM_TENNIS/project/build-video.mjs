// EP01 BOM ATOM TENNIS. FILMNOIR: black-and-white 1958 lab, venetian-blind light, the only colour is the oscilloscope's green phosphor.
// Panels are typed case-file cards that open like a light slit. Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PH = "#7CFFA0", INK = "#0A0A0A", PAPER = "#E9E6DC";
const TY = "'Special Elite',monospace", SE = "'Playfair Display',serif", CAP = "Oswald,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>SEJARAH GAME / EP 01</div>
  <div class="card"><div class="big">GAME DARI<br><span>ILMUWAN BOM ATOM?</span></div></div>
  <div class="ln" data-at="s1:pertama" data-fx="lit">salah satu video game pertama di dunia</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>BERKAS: FISIKAWAN</div>
  <div class="card" data-at="s2:William" data-fx="lit"><div class="big md">WILLIAM<br>HIGINBOTHAM</div></div>
  <div class="ln" data-at="s2:anggota" data-fx="lit">Tim bom nuklir pertama</div>
  <div class="ln" data-at="s2:pemimpin" data-fx="lit">Lalu memimpin gerakan membatasi senjata nuklir</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>BROOKHAVEN, NEW YORK</div>
  <div class="card" data-at="s3:Tahun" data-fx="lit"><div class="big">1958</div></div>
  <div class="ln" data-at="s3:instrumentasi" data-fx="lit">Kepala divisi instrumentasi</div>
  <div class="ln" data-at="s3:pajangan" data-fx="lit">Hari kunjungan: cuma tur &amp; pajangan diam</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>IDE</div>
  <div class="card" data-at="s4:dimainkan" data-fx="lit"><div class="big sm">SESUATU UNTUK<br><span>DIMAINKAN</span></div></div>
  <div class="ln" data-at="s4:rudal" data-fx="lit">Komputer analog: lintasan rudal</div>
  <div class="ln g" data-at="s4:memantul" data-fx="lit">...atau bola memantul + hambatan angin</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>PERMAINAN TENIS</div>
  <div class="ln" data-at="s5:samping" data-fx="lit">Lapangan dilihat dari samping</div>
  <div class="ln g" data-at="s5:osiloskop" data-fx="lit">Tampil di layar osiloskop</div>
  <div class="row"><b class="c" data-at="s5:kenop" data-fx="lit">KENOP = sudut</b><b class="c" data-at="s5:tombol" data-fx="lit">TOMBOL = pukul</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>DIRAKIT</div>
  <div class="card" data-at="s6:tiga" data-fx="lit"><div class="big">3 MINGGU</div></div>
  <div class="ln" data-at="s6:Delapan" data-fx="lit">18 Oktober 1958</div>
  <div class="ln g" data-at="s6:Tennis" data-fx="lit">TENNIS FOR TWO dipamerkan</div>
  <div class="ln" data-at="s6:Ratusan" data-fx="lit">Ratusan pengunjung antre</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>SETAHUN KEMUDIAN</div>
  <div class="ln" data-at="s7:dibongkar" data-fx="lit">Dibongkar, lalu dilupakan</div>
  <div class="card" data-at="s7:akhir" data-fx="lit"><div class="big sm">AKHIR 1970-AN</div></div>
  <div class="ln" data-at="s7:sengketa" data-fx="lit">Bersaksi dalam sengketa paten video game</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="lit"><div class="big sm">GAME HIBURAN<br><span>DARI TANGAN<br>ILMUWAN NUKLIR</span></div></div>
  <div class="ln" data-at="s8:Kamu" data-fx="lit">Kamu baru tahu fakta ini?</div>
</div>`;

const css = `
.tag{display:table;font-family:${TY};font-size:30px;letter-spacing:.08em;color:${PAPER};background:rgba(6,6,6,.86);padding:10px 20px 8px;border:2px solid rgba(233,230,220,.55);margin-bottom:14px}
.tag i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${PH};box-shadow:0 0 12px ${PH};margin-right:14px;vertical-align:1px}
.card{display:table;background:rgba(6,6,6,.8);border:2px solid rgba(233,230,220,.7);outline:1px solid rgba(233,230,220,.25);outline-offset:6px;padding:14px 28px 18px;margin-bottom:16px;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.big{font-family:${SE};font-weight:900;font-size:96px;line-height:.98;letter-spacing:-.01em;color:${PAPER}}
.big span{color:#fff;font-style:italic}.big.md{font-size:86px}.big.sm{font-size:72px;line-height:1.02}
.ln{display:table;font-family:${TY};font-size:40px;line-height:1.2;color:${PAPER};background:rgba(6,6,6,.8);padding:10px 20px 10px 22px;margin-bottom:10px;border-left:6px solid ${PAPER};max-width:860px}
.ln.g{border-left-color:${PH};color:#fff}
.row{display:flex;gap:12px;margin-top:4px}
.c{font-family:${TY};font-weight:400;font-size:36px;padding:12px 18px 10px;color:${INK};background:${PAPER};border:2px solid ${INK}}
#chip{font-family:${TY};font-size:21px;color:${PAPER};opacity:.7;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: "#030303", vig: 0.55, grain: 0.09, capfloor: 0.45, html, css, chipFont: TY, chipColor: PAPER, sig: "EP01_BOM_ATOM_TENNIS",
  extraAt: ["s1:fisikawan", "s1:bom", "s2:Setelah", "s3:Setiap", "s4:buku", "s4:analog", "s4:lintasan", "s4:bola", "s4:hambatan",
    "s5:dua", "s5:kenop", "s6:Delapan", "s6:Tennis", "s6:Ratusan", "s6:dirakit", "s7:dibongkar", "s7:dilupakan", "s7:Namanya", "s7:akhir",
    "s7:sengketa", "s7:bersaksi", "s8:Kamu", "s8:tangan", "s8:AUDIRA", "s5:memukul", "s3:diam"],
  // panels open like a slit of window light, then settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:18,clipPath:'inset(46% 0% 46% 0%)'},{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-14,clipPath:'inset(0% 0% 100% 0%)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.3},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'inset(50% 0% 50% 0%)'});tl.to('#outro',{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${CAP};font-weight:600;font-size:62px;line-height:1.15;color:#EDEBE4;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.9),3px 0 0 #000,-3px 0 0 #000,0 -3px 0 #000}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#EDEBE4",scale:1,textShadow:"0 3px 0 #000,0 0 18px rgba(0,0,0,.9)"},{color:"${PH}",scale:1.04,textShadow:"0 3px 0 #000,0 0 22px rgba(80,255,140,.65)",duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#EDEBE4",scale:1,textShadow:"0 3px 0 #000,0 0 18px rgba(0,0,0,.9)",duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bom Atom Tennis", "#030303");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
