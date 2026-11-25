// EP02 PONG KOIN PENUH / SATISFYFORGE. Pastel studio sweep, three diorama plinths (bar, factory, bank), satisfying coin physics.
// Panels are soft white candy cards that drop in and settle on their mark; rows sit dimmed and light up on their word.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld, sceneKeys } from "../../_tools/shell.mjs";
import { sched } from "./gsched.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#4B3F5C", PINK = "#F2558F", LIL = "#A98BF0", MINT = "#2FB98A", BUT = "#FFD96A", WH = "#FFFFFF";

const html = `
<div class="fg" data-k="0.9" data-x="-120" style="top:1520px;width:420px;height:420px;background:radial-gradient(circle at 40% 38%,#FFC2D8,#FF8DB6 60%,rgba(255,141,182,0) 72%)"></div>
<div class="fg" data-k="1.3" data-x="860" style="top:1610px;width:360px;height:360px;background:radial-gradient(circle at 40% 38%,#C8F5E3,#6FD8B0 60%,rgba(111,216,176,0) 72%)"></div>
<div class="fg" data-k="0.6" data-x="930" style="top:120px;width:260px;height:260px;filter:blur(22px);background:radial-gradient(circle at 40% 38%,#FFF0B0,#FFD96A 60%,rgba(255,217,106,0) 72%)"></div>
<div class="fg" data-k="1.1" data-x="1500" style="top:1450px;width:300px;height:300px;background:radial-gradient(circle at 40% 38%,#E2D8FF,#A98BF0 60%,rgba(169,139,240,0) 72%)"></div>

<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="eb"><i></i>SEJARAH GAME &middot; EP 02</div>
  <div class="ttl">MESIN PONG<br><em>RUSAK</em> KARENA<br>KOIN?</div>
  <div class="dots"><b></b><b></b><b></b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="eb"><i></i>AGUSTUS 1972 &middot; CALIFORNIA</div>
  <div class="row" data-at="s2:Atari" data-fx="lit">Atari, perusahaan baru</div>
  <div class="row"><span class="ch sky" data-at="s2:Nolan" data-fx="lit">Nolan Bushnell</span><span class="ch mint" data-at="s2:Allan" data-fx="lit">Allan Alcorn</span></div>
  <div class="big" data-at="s2:Andy" data-fx="lit">Andy Capp's Tavern</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="eb"><i></i>PROTOTIPE</div>
  <div class="row" data-at="s3:televisi" data-fx="lit">TV hitam-putih <span class="ch but" data-at="s3:dolar" data-fx="lit">$75</span></div>
  <div class="row" data-at="s3:lemari" data-fx="lit">Masuk lemari kayu</div>
  <div class="row" data-at="s3:jukebox" data-fx="lit">Dekat jukebox &amp; pinball</div>
  <div class="row" data-at="s3:dua" data-fx="lit">2 pemukul + 1 bola = <em>tenis meja di layar</em></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="eb"><i></i>MALAM PERTAMA</div>
  <div class="ttl sm" data-at="s4:ramai" data-fx="lit">LANGSUNG <em>RAMAI</em></div>
  <div class="row" data-at="s4:satu" data-fx="lit"><b class="nb">1,5</b>&nbsp;minggu berikutnya</div>
  <div class="bar"><s data-at="s4:satu" data-fx="grow"></s></div>
  <div class="row" data-at="s4:makin" data-fx="lit">Makin banyak yang datang</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="eb"><i></i>LALU...</div>
  <div class="ttl sm" data-at="s5:bermasalah" data-fx="lit">MESINNYA <em>BERMASALAH</em></div>
  <div class="row" data-at="s5:Pemilik" data-fx="lit">Pemilik bar menelepon Alcorn</div>
  <div class="row" data-at="s5:wadah" data-fx="lit">Wadah koin <b class="hl" data-at="s5:meluap" data-fx="stamp">PENUH SAMPAI MELUAP</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="eb"><i></i>KEPUTUSAN</div>
  <div class="ttl sm" data-at="s6:berubah" data-fx="lit">BUSHNELL <em>BERUBAH PIKIRAN</em></div>
  <div class="row x" data-at="s6:menjual" data-fx="lit"><span class="ic">&#10005;</span><span class="sk">Jual lisensi ke perusahaan lain<s data-at="s6:lain" data-fx="grow"></s></span></div>
  <div class="row v" data-at="s6:memutuskan" data-fx="lit"><span class="ic">&#10003;</span>Bikin mesinnya sendiri</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="eb"><i></i>MODAL</div>
  <div class="row x" data-at="s7:menolak" data-fx="lit"><span class="ic">&#10005;</span>Bank menolak memberi pinjaman</div>
  <div class="row sm2" data-at="s7:pinball" data-fx="lit">Pong dianggap sejenis pinball, dicap dekat mafia</div>
  <div class="row v" data-at="s7:kredit" data-fx="lit"><span class="ic">&#10003;</span>Akhirnya dapat kredit</div>
  <div class="date" data-at="s7:November" data-fx="lit"><small>PONG DIUMUMKAN</small>29 NOVEMBER 1972</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="eb"><i></i>SEJARAH GAME</div>
  <div class="ttl sm">KERUSAKAN PALING<br><em>MENGUNTUNGKAN</em></div>
  <div class="row q" data-at="s8:Kalau" data-fx="lit">Pemilik bar: senang atau panik?</div>
</div>`;

const css = `
.fg{position:absolute;left:0;border-radius:50%;filter:blur(30px);opacity:.62;z-index:6;pointer-events:none}
.p{background:rgba(255,255,255,.88);border-radius:34px;padding:26px 34px 30px;box-shadow:0 18px 46px rgba(120,90,160,.22),inset 0 0 0 2px rgba(255,255,255,.9)}
.eb{font-family:'Nunito',sans-serif;font-weight:800;font-size:26px;letter-spacing:.2em;color:${PINK};margin-bottom:10px;display:flex;align-items:center}
.eb i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${PINK};margin-right:14px}
.ttl{font-family:'Fredoka',sans-serif;font-weight:600;font-size:96px;line-height:.98;color:${INK};letter-spacing:-.01em}
.ttl.sm{font-size:64px;line-height:1.02;margin-bottom:8px}
.ttl em,.row em{font-style:normal;color:${PINK}}
.dots{display:flex;gap:10px;margin-top:18px}.dots b{display:block;width:22px;height:12px;border-radius:6px;background:#FF8DB6}.dots b:nth-child(2){background:${LIL}}.dots b:nth-child(3){width:70px;background:#6FD8B0}
.row{font-family:'Nunito',sans-serif;font-weight:800;font-size:40px;line-height:1.2;color:${INK};margin-top:12px;display:flex;align-items:center;flex-wrap:wrap;gap:12px}
.row.sm2{font-size:33px;font-weight:700}
.ch{display:inline-block;font-family:'Nunito',sans-serif;font-weight:800;font-size:36px;border-radius:999px;padding:6px 22px 8px;color:${INK}}
.ch.sky{background:#CFE6FB}.ch.mint{background:#C8F2E2}.ch.but{background:${BUT}}
.big{font-family:'Fredoka',sans-serif;font-weight:600;font-size:66px;color:${LIL};margin-top:14px;line-height:1}
.nb{font-family:'Fredoka',sans-serif;font-weight:600;font-size:58px;color:${PINK};min-width:80px}
.bar{height:16px;border-radius:8px;background:rgba(75,63,92,.12);margin-top:10px;overflow:hidden}.bar s{display:block;height:100%;width:100%;background:linear-gradient(90deg,#FF8DB6,#A98BF0,#6FD8B0);transform-origin:0 50%;text-decoration:none}
.hl{display:inline-block;background:${PINK};color:#fff;border-radius:14px;padding:4px 14px 6px;transform-origin:30% 50%}
.ic{display:inline-flex;width:46px;height:46px;border-radius:50%;align-items:center;justify-content:center;font-size:28px;color:#fff;flex:none}
.row.x .ic{background:${PINK}}.row.v .ic{background:${MINT}}
.sk{position:relative}.sk s{position:absolute;left:-4px;right:-4px;top:52%;height:5px;border-radius:3px;background:${PINK};transform-origin:0 50%}
.date{margin-top:16px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:62px;line-height:1;color:#fff;background:${LIL};border-radius:24px;padding:16px 24px 18px;display:inline-block;transform-origin:20% 50%}
.date small{display:block;font-family:'Nunito',sans-serif;font-weight:800;font-size:24px;letter-spacing:.18em;opacity:.9;margin-bottom:6px}
.row.q{display:inline-flex;background:${BUT};border-radius:999px;padding:8px 26px 10px}
#chip{font-family:'Nunito',sans-serif;font-weight:800;font-size:21px;color:${INK};letter-spacing:.1em;opacity:.7}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
copyFileSync("gsched.mjs", "hf/assets/lib/gsched.js");
// anchors used inside world3d.js / gsched.mjs are written A("sX:word"); collect them so every frame gets its value
const extraAt = [...new Set([...(readFileSync("world3d.js", "utf8") + readFileSync("gsched.mjs", "utf8")).matchAll(/A\("(s\d:[^"]+)"\)/g)].map((m) => m[1]))];
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#E8D3DC", vig: 0.14, grain: 0.03, capfloor: 0, html, css, chipFont: "'Nunito',sans-serif", chipColor: INK, sig: "EP02_PONG_KOIN_PENUH",
  extraAt,
  // candy card drops onto its mark with a tiny settle, leaves upward
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{y:-46,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:.5,ease:'back.out(1.6)'},a-.1);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-36,scale:.97,opacity:0,duration:.24,ease:'power2.in'},b-.24)`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.3},{opacity:1,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 58%)'});tl.to('#outro',{clipPath:'circle(120% at 50% 58%)',duration:.7,ease:'power3.inOut'},OUT-.3);`,
});
// coin schedule for the mix
const S = sched((k) => AT[k], K);
writeFileSync("coins.json", JSON.stringify(S));
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Nunito',sans-serif;font-weight:800;font-size:56px;line-height:1.16;color:${INK};background:rgba(255,255,255,.9);border-radius:30px;padding:12px 28px 16px;box-shadow:0 12px 30px rgba(120,90,160,.2)}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",y:0,scale:1},{color:"${PINK}",y:-3,scale:1.04,duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",y:0,scale:1,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.24,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pong Koin Penuh", "#E8D3DC");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
