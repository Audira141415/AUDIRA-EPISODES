// EP03 KALENG MINUMAN / SATISFYFORGE. Pastel cyclorama factory: one aluminium can morphs disc > cup > tall wall > dome > neck.
// Panels are soft candy cards with a six-step progress rail (like the kit HUD); rows sit dimmed and light on their word.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#4B3F5C", PINK = "#F2558F", LIL = "#A98BF0", MINT = "#2FB98A", BUT = "#FFD96A";

const rail = (k) => `<div class="rail">${[0, 1, 2, 3, 4, 5].map((i) => `<b class="${i < k ? "on" : ""}${i === k - 1 ? " cur" : ""}"></b>`).join("")}</div>`;

const html = `
<div class="fg" data-k="0.9" data-x="-140" style="top:1700px;width:360px;height:420px;background:radial-gradient(circle at 40% 38%,#FFC2D8,#FF8DB6 60%,rgba(255,141,182,0) 72%)"></div>
<div class="fg" data-k="1.3" data-x="880" style="top:1760px;width:300px;height:360px;background:radial-gradient(circle at 40% 38%,#C8F5E3,#6FD8B0 60%,rgba(111,216,176,0) 72%)"></div>
<div class="fg" data-k="0.6" data-x="960" style="top:140px;width:240px;height:240px;filter:blur(22px);background:radial-gradient(circle at 40% 38%,#FFF0B0,#FFD96A 60%,rgba(255,217,106,0) 72%)"></div>
<div class="fg" data-k="1.1" data-x="1460" style="top:1720px;width:260px;height:300px;background:radial-gradient(circle at 40% 38%,#E2D8FF,#A98BF0 60%,rgba(169,139,240,0) 72%)"></div>

<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="eb"><i></i>CARA PEMBUATAN &middot; EP 03</div>
  <div class="ttl">KALENG<br><em>TANPA SAMBUNGAN</em></div>
  <div class="row" data-at="s1:cakram" data-fx="lit"><span class="ch mint">1</span>cakram aluminium datar</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="eb"><i></i>TAHAP 1 &middot; GULUNGAN</div>${rail(1)}
  <div class="ttl sm">2 JALUR <em>TERPISAH</em></div>
  <div class="row"><span class="ch pink" data-at="s2:Badan" data-fx="lit">BADAN</span><span class="ch sky" data-at="s2:tutup" data-fx="lit">TUTUP</span></div>
  <div class="row" data-at="s2:dilumasi" data-fx="lit">Lembaran aluminium dilumasi</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="eb"><i></i>TAHAP 2 &middot; MANGKUK</div>${rail(2)}
  <div class="row" data-at="s3:memotong" data-fx="lit">Potong cakram selebar telapak tangan</div>
  <div class="row" data-at="s3:menekannya" data-fx="lit">Tekan jadi <em>mangkuk pendek</em></div>
  <div class="row" data-at="s3:Ratusan" data-fx="lit"><span class="ch but">RATUSAN</span>mangkuk per menit</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="eb"><i></i>TAHAP 3 &middot; TARIK &amp; SETRIKA</div>${rail(3)}
  <div class="row" data-at="s4:cincin" data-fx="lit">1 cincin tarik + 3 cincin setrika</div>
  <div class="wall" data-at="s4:menipis" data-fx="lit"><span>DINDING</span><s class="w1"></s><s class="w2" data-at="s4:menipis" data-fx="grow"></s><span class="lb">menipis &amp; memanjang</span></div>
  <div class="row" data-at="s4:kubah" data-fx="lit">Dasar ditekan jadi <em>kubah</em></div>
  <div class="big" data-at="s4:seperlima" data-fx="lit">&plusmn; 1/5 <small>DETIK</small></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="eb"><i></i>TAHAP 4 &middot; PENYELESAIAN</div>${rail(4)}
  <div class="steps">
    <div class="ck" data-at="s5:dipotong" data-fx="lit"><i>1</i>Tepi dipotong rata &amp; dicuci</div>
    <div class="ck" data-at="s5:dicetak" data-fx="lit"><i>2</i>Cetak 4 warna, dipanggang</div>
    <div class="ck" data-at="s5:disemprot" data-fx="lit"><i>3</i>Lapisan dalam disemprot</div>
    <div class="ck" data-at="s5:gulungan" data-fx="lit"><i>4</i>Leher, bibir, tutup dikunci</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="eb"><i></i>KENAPA?</div>${rail(5)}
  <div class="ttl sm">LEHER <em>MENYEMPIT</em></div>
  <div class="row" data-at="s6:keras" data-fx="lit">Tutup: paduan lebih keras &amp; tebal</div>
  <div class="row" data-at="s6:hemat" data-fx="lit">Diameter diperkecil, hemat logam</div>
  <div class="row" data-at="s6:Dasar" data-fx="lit">Dasar kubah + dinding bawah tebal</div>
  <div class="row" data-at="s6:6" data-fx="lit"><span class="ch pinkf">&plusmn; 6 BAR</span><span data-at="s6:ban" data-fx="lit">&asymp; 3&times; ban mobil</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="eb"><i></i>HASILNYA</div>${rail(6)}
  <div class="big" data-at="s7:milimeter" data-fx="lit">&plusmn; 0,1 <small>mm dinding</small></div>
  <div class="row" data-at="s7:majalah" data-fx="lit">Lebih tipis dari 2 halaman majalah</div>
  <div class="row" data-at="s7:gram" data-fx="lit">Kaleng kosong <span class="ch but">13&ndash;15 gram</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="eb"><i></i>CARA PEMBUATAN &middot; EP 03</div>
  <div class="ttl sm">1 CAKRAM,<br><em>TANPA SAMBUNGAN</em></div>
  <div class="row" data-at="s8:detik" data-fx="lit">1 langkah pres &plusmn; 1/5 detik</div>
</div>`;

const css = `
.fg{position:absolute;left:0;border-radius:50%;filter:blur(30px);opacity:.42;z-index:6;pointer-events:none}
.p{background:rgba(255,255,255,.96);border-radius:34px;padding:24px 34px 28px;box-shadow:0 18px 46px rgba(120,90,160,.22),inset 0 0 0 2px rgba(255,255,255,.9)}
.eb{font-family:'Quicksand',sans-serif;font-weight:700;font-size:25px;letter-spacing:.2em;color:${PINK};margin-bottom:8px;display:flex;align-items:center}
.eb i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${PINK};margin-right:14px}
.rail{display:flex;gap:9px;margin:4px 0 12px}.rail b{display:block;width:22px;height:11px;border-radius:6px;background:rgba(75,63,92,.14)}
.rail b.on{background:#FF8DB6}.rail b.on:nth-child(2n){background:${LIL}}.rail b.on:nth-child(3n){background:#6FD8B0}.rail b.cur{width:66px}
.ttl{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:98px;line-height:.92;color:${INK};letter-spacing:-.01em}
.ttl.sm{font-size:64px;line-height:.98;margin-bottom:4px}
.ttl em,.row em{font-style:normal;color:${PINK}}
.row{font-family:'Quicksand',sans-serif;font-weight:700;font-size:38px;line-height:1.18;color:${INK};margin-top:10px;display:flex;align-items:center;flex-wrap:wrap;gap:12px}
.ch{display:inline-block;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:34px;border-radius:999px;padding:2px 20px 0;color:${INK}}
.ch.mint{background:#C8F2E2}.ch.pink{background:#FFD3E3}.ch.sky{background:#CFE6FB}.ch.but{background:${BUT}}.ch.pinkf{background:${PINK};color:#fff}
.wall{display:flex;align-items:center;gap:14px;margin-top:12px;font-family:'Quicksand',sans-serif;font-weight:700;font-size:30px;letter-spacing:.08em;color:#5E5270}
.wall s{display:block;height:30px;border-radius:8px;text-decoration:none}
.wall .w1{width:34px;background:#C9CED8}.wall .w2{width:150px;height:10px;background:linear-gradient(90deg,#C9CED8,#FF8DB6);transform-origin:0 50%}
.wall .lb{letter-spacing:0;font-size:34px;color:${INK}}
.big{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:92px;line-height:1;color:${LIL};margin-top:10px}
.big small{font-size:38px;color:${INK};letter-spacing:.06em}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin-top:4px}
.steps{display:flex;flex-direction:column;gap:16px;margin-top:10px}
.ck{font-family:'Quicksand',sans-serif;font-weight:700;font-size:44px;line-height:1.12;color:${INK};display:flex;align-items:center;gap:16px}
.ck i{font-style:normal;flex:none;display:inline-flex;width:50px;height:50px;border-radius:50%;align-items:center;justify-content:center;background:#6FD8B0;color:#fff;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:30px}
.ck:nth-child(2n) i{background:${LIL}}
#chip{font-family:'Quicksand',sans-serif;font-weight:700;font-size:21px;color:${INK};letter-spacing:.1em;opacity:.72}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
const extraAt = [...new Set([...(readFileSync("world3d.js", "utf8") + readFileSync("mix.py", "utf8")).matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: "#E9D6DC", vig: 0.38, grain: 0.03, capfloor: 0, html, css, chipFont: "'Quicksand',sans-serif", chipColor: INK, sig: "EP03_KALENG_MINUMAN",
  chip: "ILUSTRASI, BUKAN REKAMAN PABRIK ASLI",
  extraAt,
  // candy card presses down onto its mark with a tiny settle, lifts away like a press ram
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{y:-40,scaleY:1.06,scaleX:.97,opacity:0},{y:0,scaleY:1,scaleX:1,opacity:1,duration:.5,ease:'back.out(1.7)'},a-.1);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-34,scaleY:.94,opacity:0,duration:.24,ease:'power2.in'},b-.24)`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.74},{opacity:1,duration:.25,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 56%)'});tl.to('#outro',{clipPath:'circle(120% at 50% 56%)',duration:.7,ease:'power3.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Quicksand',sans-serif;font-weight:700;font-size:54px;line-height:1.18;color:${INK};background:rgba(255,255,255,.92);border-radius:30px;padding:12px 28px 16px;box-shadow:0 12px 30px rgba(120,90,160,.2)}
.w{display:inline-block;margin:0 .14em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",y:0,scale:1},{color:"${PINK}",y:-3,scale:1.04,duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",y:0,scale:1,duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.24,ease:"back.out(1.6)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kaleng Minuman", "#E9D6DC");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
