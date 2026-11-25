// EP18 SAYAP PESAWAT (INNERWORKS): night wind-tunnel lab, cutaway wing section with real potential-flow smoke.
// Panels are dark glass instrument cards with a cyan rule, amber tag strip and condensed technical type; they slide in
// from the left like a readout and wipe out upward.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#E6F6FF", NAVY = "#0B1422", CYAN = "#22D3EE", AMBER = "#F59E0B", ROSE = "#FB7185";
const TT = "'Barlow Condensed',sans-serif", MN = "'JetBrains Mono',monospace", SN = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 18</div>
  <div class="card"><div class="big"><span class="sm">Penjelasan sayap di sekolah</span><br><em>keliru</em></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">VERSI SEKOLAH</div>
  <div class="ln a" data-at="s2:panjang" data-fx="lit">Jalan atas lebih panjang</div>
  <div class="ln" data-at="s2:bersamaan" data-fx="lit">harus tiba bersamaan?</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">TEROWONGAN ANGIN &middot; CAMBRIDGE</div>
  <div class="ln a" data-at="s3:dulu" data-fx="lit">Udara atas tiba lebih dulu</div>
  <div class="ln r" data-at="s3:lomba" data-fx="lit">Bukan lomba sampai</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">SUDUT SERANG</div>
  <div class="ln a" data-at="s4:menengadah" data-fx="lit">Sayap sedikit menengadah</div>
  <div class="ln" data-at="s4:cembung" data-fx="lit">Atas lebih cembung</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">ALIRAN DIBELOKKAN</div>
  <div class="card" data-at="s5:terlempar" data-fx="lit"><div class="big sm2">Udara <em>ke bawah</em></div></div>
</div>
<div class="p" data-in="s6" data-out="s6:Tapi">
  <div class="tag">TEKANAN</div>
  <div class="ln b" data-at="s6:turun" data-fx="lit">Atas: tekanan turun</div>
  <div class="ln r" data-at="s6:naik" data-fx="lit">Bawah: tekanan naik</div>
  <div class="card" data-at="s6:angkat" data-fx="lit"><div class="big sm2">Selisih = <em>gaya angkat</em></div></div>
</div>
<div class="p" data-in="s6:Tapi" data-out="s7">
  <div class="tag">BATAS SUDUT</div>
  <div class="ln r" data-at="s6:terlepas" data-fx="lit">Aliran atas terlepas</div>
  <div class="card" data-at="s6:stall" data-fx="lit"><div class="big"><em class="rs">STALL</em></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">BUKU PEGANGAN PILOT &middot; FAA</div>
  <div class="ln" data-at="s7:dua" data-fx="lit">2&times; lebih cepat</div>
  <div class="card" data-at="s7:empat" data-fx="lit"><div class="big sm2"><em>4&times;</em> gaya angkat</div></div>
  <div class="ln a" data-at="s7:sama" data-fx="lit">Sudut sama</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:membelokkan" data-fx="lit"><div class="big sm2">Membelokkan udara <em>ke bawah</em></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: dispenser galon bawah</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.14em;color:${NAVY};background:${AMBER};padding:8px 16px 7px;margin-bottom:14px;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);padding-right:30px}
.card{display:table;background:rgba(11,20,34,.88);border:2px solid rgba(34,211,238,.55);border-left:10px solid ${CYAN};border-radius:4px;padding:12px 28px 18px;margin-bottom:14px;box-shadow:0 0 40px rgba(34,211,238,.18),0 20px 44px rgba(0,0,0,.5)}
.big{font-family:${TT};font-weight:800;font-size:110px;line-height:.98;color:${INK};letter-spacing:.005em;text-transform:uppercase}
.big em{font-style:normal;color:${AMBER};display:inline-block}.big .sm{font-size:56px;color:#A5F3FC;letter-spacing:.02em}.big.sm2{font-size:76px;line-height:1.02}
.big em.rs{color:${ROSE};font-size:130px;letter-spacing:.06em}
.ln{display:table;font-family:${SN};font-weight:800;font-size:40px;line-height:1.2;color:${INK};background:rgba(11,20,34,.86);padding:10px 24px 12px 20px;margin-bottom:10px;border-left:8px solid ${CYAN};border-radius:0 4px 4px 0;box-shadow:0 12px 30px rgba(0,0,0,.45);max-width:880px}
.ln.a{border-left-color:${AMBER}}.ln.r{border-left-color:${ROSE}}.ln.b{border-left-color:#60A5FA}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:#A5F3FC;opacity:.75;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "18", bg: "#0E1726", vig: 0.42, grain: 0.06, capfloor: 0.35, html, css, chipFont: MN, chipColor: "#A5F3FC", sig: "EP18_SAYAP_PESAWAT_TERBANG",
  extraAt: [
    // world3d.js
    "s1:keliru", "s2:Udara", "s2:panjang", "s2:bersamaan", "s2:bawah", "s3:terowongan", "s4:menengadah", "s4:Sudut", "s4:cembung",
    "s5:membelokkan", "s5:terlempar", "s6:Tekanan", "s6:turun", "s6:naik", "s6:gaya", "s6:angkat", "s6:mendorong", "s6:mendorong#2",
    "s6:terlalu", "s6:curam", "s6:terlepas", "s6:anjlok", "s6:stall", "s7:dua", "s7:empat", "s8:membelokkan", "s8:bawah",
    // mix.py
    "s3:Cambridge", "s3:dulu", "s3:lomba", "s4:serang", "s5:mengikuti", "s6:Tapi", "s7:Kecepatan", "s7:FAA", "s7:sama", "s8:AUDIRA", "s8:Episode"],
  // readouts slide in from the left, wipe out upward
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-70,clipPath:'inset(0 100% 0 0)'},{opacity:1,x:0,clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-24,clipPath:'inset(0 0 100% 0)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.8,x:-6,filter:'brightness(.85)'},{opacity:1,x:0,filter:'brightness(1.12)',duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:${TT};font-weight:800;font-size:66px;line-height:1.08;color:${INK};text-transform:uppercase;letter-spacing:.02em;background:rgba(11,20,34,.9);padding:10px 26px 14px;border-radius:6px;border-bottom:6px solid ${CYAN}}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",scale:1},{color:"${AMBER}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sayap Pesawat", "#0E1726");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
