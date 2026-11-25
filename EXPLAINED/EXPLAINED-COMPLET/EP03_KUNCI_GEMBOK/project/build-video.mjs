// EP03 KUNCI GEMBOK. INNERWORKS: a pin-tumbler lock cut open on a dark studio table, brushed brass and steel,
// teal-orange grade. Panels are engineering callout cards: a teal tag with corner ticks, a brass rule, rows that light on their word.
// Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TEAL = "#5CF2E3", BRASS = "#E8B85C", INK = "#0A0F13", RED = "#FF5A48", PAPER = "#FFFFFF";
const MONO = "'Chakra Petch',monospace", DISP = "'Saira Condensed',sans-serif", CAP = "'Barlow Condensed',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA KERJA BENDA / EP 03</div>
  <div class="card"><div class="big">GERIGI KUNCI<br><span>ADALAH KODE</span></div></div>
  <div class="ln" data-at="s1:lekuknya" data-fx="lit">Setiap lekuk = satu kode rahasia</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>KUNCI SILINDER</div>
  <div class="card" data-at="s2:pin" data-fx="lit"><div class="big md">PIN TUMBLER</div></div>
  <div class="ln" data-at="s2:Yale" data-fx="lit">Disebut juga kunci Yale</div>
  <div class="ln b" data-at="s2:Linus" data-fx="lit">Dari nama Linus Yale Jr.</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>BAGIAN DALAM</div>
  <div class="card" data-at="s3:plug" data-fx="lit"><div class="big">PLUG</div></div>
  <div class="ln" data-at="s3:tempat" data-fx="lit">Silinder kecil, tempat kunci dimasukkan</div>
  <div class="ln b" data-at="s3:berputar" data-fx="lit">Harus berputar supaya pintu terbuka</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>DERETAN LUBANG</div>
  <div class="card" data-at="s4:lima" data-fx="lit"><div class="big md">5 ATAU 6 PIN</div></div>
  <div class="ln" data-at="s4:pegas" data-fx="lit">Tiap pin didorong pegas</div>
  <div class="ln b" data-at="s4:panjang" data-fx="lit">Panjang pin berbeda-beda</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag r"><i></i>TANPA KUNCI / KUNCI SALAH</div>
  <div class="ln r" data-at="s5:menahan" data-fx="lit">Pin menahan plug: tidak bisa berputar</div>
  <div class="ln r" data-at="s5:sejajar" data-fx="lit">Kunci salah: pin tidak sejajar</div>
  <div class="stamp" data-at="s5:tertahan" data-fx="stamp">TERTAHAN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>KUNCI YANG BENAR</div>
  <div class="ln" data-at="s6:gerigi" data-fx="lit">Tiap gerigi mengangkat satu pin</div>
  <div class="ln b" data-at="s6:sejajar" data-fx="lit">Semua pin sejajar di garis batas plug</div>
  <div class="stamp t" data-at="s6:Klik" data-fx="stamp">KLIK!</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>IDE YANG SANGAT TUA</div>
  <div class="row3" data-at="s7:dua" data-fx="lit"><b>± 2000 SM</b><em>Mesir: kunci kayu, baut geser</em></div>
  <div class="row3" data-at="s7:Linus" data-fx="lit"><b>1848</b><em>Linus Yale Sr. mengembangkannya</em></div>
  <div class="row3" data-at="s7:menyempurnakannya" data-fx="lit"><b>1861</b><em>Anaknya menyempurnakannya</em></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:Jadi" data-fx="lit"><div class="big sm">SETIAP KUNCI<br><span>POLA PIN SENDIRI</span></div></div>
  <div class="ln" data-at="s8:Kamu" data-fx="lit">Pernah salah coba kunci di rumah sendiri?</div>
</div>`;

const css = `
.tag{display:table;font-family:${MONO};font-weight:600;font-size:29px;letter-spacing:.12em;color:${TEAL};background:rgba(6,12,15,.82);padding:10px 22px 9px;margin-bottom:14px;position:relative;border:1.5px solid rgba(92,242,227,.45)}
.tag:before,.tag:after{content:"";position:absolute;width:14px;height:14px;border:3px solid ${TEAL}}
.tag:before{left:-6px;top:-6px;border-right:0;border-bottom:0}.tag:after{right:-6px;bottom:-6px;border-left:0;border-top:0}
.tag i{display:inline-block;width:12px;height:12px;background:${BRASS};margin-right:14px;transform:rotate(45deg);vertical-align:2px}
.tag.r{color:${RED};border-color:rgba(255,90,72,.5)}.tag.r:before,.tag.r:after{border-color:${RED}}.tag.r i{background:${RED}}
.card{display:table;background:linear-gradient(180deg,rgba(14,20,24,.86),rgba(6,10,12,.86));border-top:5px solid ${BRASS};padding:14px 30px 20px;margin-bottom:14px;box-shadow:0 24px 60px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.08)}
.big{font-family:${DISP};font-weight:800;font-size:108px;line-height:.92;letter-spacing:.005em;color:${PAPER};text-transform:uppercase}
.big span{color:${BRASS}}.big.md{font-size:96px}.big.sm{font-size:80px;line-height:.96}
.ln{display:table;font-family:${MONO};font-weight:500;font-size:37px;line-height:1.2;color:${PAPER};background:rgba(4,7,9,.9);padding:10px 22px 10px 20px;margin-bottom:10px;border-left:6px solid ${TEAL};max-width:880px}
.ln.b{border-left-color:${BRASS}}.ln.r{border-left-color:${RED}}
.row3{display:flex;align-items:center;gap:20px;background:rgba(4,7,9,.92);border-left:6px solid ${BRASS};padding:10px 22px;margin-bottom:10px;max-width:900px}
.row3 b{font-family:${DISP};font-weight:800;font-size:64px;line-height:1;color:${BRASS};min-width:250px}
.row3 em{font-family:${MONO};font-style:normal;font-weight:600;font-size:34px;line-height:1.2;color:${PAPER}}
.stamp{display:inline-block;margin-top:12px;font-family:${DISP};font-weight:800;font-size:92px;letter-spacing:.06em;color:${RED};border:7px solid ${RED};padding:2px 30px 0;background:rgba(20,4,2,.55)}
.stamp.t{color:${TEAL};border-color:${TEAL};background:rgba(2,18,16,.55)}
#chip{font-family:${MONO};font-size:21px;color:${PAPER};opacity:.72;letter-spacing:.08em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: "#06080b", vig: 0.5, grain: 0.06, capfloor: 0.5, html, css, chipFont: MONO, chipColor: PAPER, sig: "EP03_KUNCI_GEMBOK",
  extraAt: ["s1:kode", "s2:Linus", "s3:silinder", "s3:Plug", "s3:dimasukkan", "s4:deretan", "s4:didorong", "s4:pin", "s5:Tanpa", "s5:tidak", "s5:Kalau", "s5:salah", "s5:tetap",
    "s6:Begitu", "s6:kunci", "s6:masuk", "s6:ketinggian", "s6:Semua", "s6:garis", "s6:berputar", "s6:Klik", "s7:Idenya", "s7:berupa", "s7:kayu", "s7:dengan",
    "s7:baut", "s7:geser", "s7:anaknya", "s7:Mesir", "s8:pola", "s8:AUDIRA", "s8:Ikuti"],
  // panels slide in like a part moving along its guide rail, a brass rule wipes ahead of them
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:-60,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.45,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:50,clipPath:'inset(0% 0% 0% 100%)',duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.86},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'inset(0% 50% 0% 50%)'});tl.to('#outro',{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${CAP};font-weight:700;font-size:66px;line-height:1.12;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.9),3px 0 0 #000,-3px 0 0 #000,0 -3px 0 #000}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${BRASS}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:.65,y:10},{opacity:1,y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kunci Gembok", "#06080b");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
