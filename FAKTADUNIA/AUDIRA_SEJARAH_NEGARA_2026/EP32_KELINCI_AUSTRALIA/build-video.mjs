// EP32 KELINCI AUSTRALIA: FELTCRAFT. A needle-felt tabletop: patchwork felt map of Australia on a quilted ocean, an
// embroidery hoop holding Barwon Park (Victoria) pinned to the map with red yarn. 24 felt rabbits leave a crate and
// become a carpet over the continent. The batch-7 chain is a row of sewn felt patches joined by stitched thread that
// grows link by link along the bottom of the picture. Panels are cream felt cards with a dashed rust stitch.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#4A2E1E", RUST = "#B5532F", CREAM = "#FFF6E6", GOLD = "#F2B53B", MOSS = "#5E8A4C", PLUM = "#7B4AA8", BG = "#CBD5CC";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const lk = (s, a, c) => `<i class="lk ${c}" data-at="${a}" data-fx="lk">${s}</i>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,800;1,9..144,800&family=Courier+Prime:wght@700&display=block">
<div class="pre"><span style="font-family:'Fraunces',serif;font-weight:800">AUDIRA 1859</span><span style="font-family:'Fraunces',serif;font-weight:800;font-style:italic">kelinci</span><span style="font-family:'Courier Prime',monospace;font-weight:700">VICTORIA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 32", "FAKTA SEJARAH NEGARA")}
  <div class="cd hero"><div class="h1">24 Kelinci,<br><em>1 Benua</em> Kewalahan</div>
  <div class="hk">${lk("24 EKOR · 1859", "s1:Dua", "c1")}${lk("RATUSAN JUTA", "s1:ratusan", "c2")}</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("01", "VICTORIA, AUSTRALIA · OKTOBER 1859")}
  ${row("Thomas Austin", "pemilik lahan asal Inggris", "s2:Thomas")}
  ${row("Rindu berburu kelinci", "hobi lamanya di Inggris", "s2:berburu")}
  ${row("Kelinci asli Australia: 0", "", "s2:tidak", "rd")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "BARWON PARK, DEKAT WINCHELSEA")}
  <div class="cd row" data-at="s3:dua" data-fx="card"><b><span class="ct" data-from="0" data-to="24" data-a="s3:dua" data-d="1.0">24</span> ekor dilepas</b><span>untuk diburu di lahannya sendiri</span></div>
  <div class="cd row qt" data-at="s3:Katanya" data-fx="card"><b>“Beberapa kelinci tidak akan banyak merugikan.”</b><span>parafrase ucapan Austin</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "IA KELIRU")}
  ${row("Liar + peliharaan", "kelinci pesanan bercampur", "s4:bercampur")}
  ${row("Keturunan yang tangguh", "cocok dengan alam Australia", "s4:tangguh", "rd")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "LEDAKAN POPULASI")}
  <div class="cd row" data-at="s5:lima" data-fx="card"><b>1866 · <span class="ct" data-from="0" data-to="50000" data-a="s5:lima" data-d="0.8">50.000</span> ditembak</b><span>laporan koran lokal (Geelong Advertiser)</span></div>
  ${row("2 juta per tahun", "ditembak, tanpa terasa bedanya", "s5:dua")}
  ${row("Penyebaran mamalia tercepat", "yang pernah tercatat di dunia", "s5:penyebaran", "rd")}
</div>
<div class="p" data-in="s6" data-out="s6:Tahun">
  ${kk("05", "KERUSAKAN")}
  ${row("Rumput habis", "", "s6:Rumput")}
  ${row("Pohon muda mati", "kulit batangnya dimakan", "s6:pohon")}
  ${row("Tanah tergerus erosi", "", "s6:tanah", "rd")}
</div>
<div class="p" data-in="s6:Tahun" data-out="s7">
  ${kk("06", "AUSTRALIA BARAT · 1901")}
  ${row("Pagar anti-kelinci", "dibangun sepanjang ratusan kilometer", "s6:pagar")}
  ${row("Kelincinya tetap lolos", "", "s6:lolos", "rd")}
</div>
<div class="p" data-in="s7" data-out="s7:Studi">
  ${kk("07", "1950 · VIRUS MYXOMA")}
  <div class="cd row" data-at="s7:enam" data-fx="card"><b><span class="ct" data-from="600" data-to="100" data-a="s7:menjadi" data-d="0.8">600</span> juta ekor</b><span>perkiraan populasi: 600 juta → 100 juta</span></div>
  ${row("Yang selamat beradaptasi", "dan jumlahnya naik lagi", "s7:beradaptasi", "rd")}
</div>
<div class="p" data-in="s7:Studi" data-out="s8">
  ${kk("08", "STUDI GENETIK 2022")}
  ${row("Berasal dari kelinci Austin", "kelinci liar Australia hari ini", "s7:berasal")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("EP 02", "INGAT EPISODE INI?")}
  ${row("Perang Emu · 1932", "Australia vs hewan, lagi", "s8:Perang")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Menurut kamu, siapa yang paling bersalah? Tulis di komentar!</div>
</div>
<div id="chain"><div id="chainin">
  ${lk("24 KELINCI", "s3:melepas", "c1")}${lk("BERCAMPUR", "s4:bercampur", "c3")}${lk("TANGGUH", "s4:tangguh", "c2")}${lk("50.000 DITEMBAK", "s5:lima", "c4")}${lk("2 JUTA/TAHUN", "s5:juta", "c1")}${lk("RUMPUT HABIS", "s6:Rumput", "c3")}${lk("EROSI", "s6:erosi", "c2")}${lk("PAGAR 1901", "s6:pagar", "c4")}${lk("LOLOS", "s6:lolos", "c1")}${lk("MYXOMA 1950", "s7:myxoma", "c5")}${lk("NAIK LAGI", "s7:naik", "c1")}
</div></div>`;

const FELTBG = `background:radial-gradient(ellipse at 30% 20%,#FFFBF2,${CREAM} 60%,#F6EAD2)`;
const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:20% 0%}
.cd{position:relative;${FELTBG};border-radius:22px;box-shadow:0 10px 26px rgba(60,35,15,.38),inset 0 -6px 0 rgba(120,80,40,.12)}
.cd::after{content:'';position:absolute;inset:9px;border:3px dashed ${RUST};border-radius:15px;pointer-events:none}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:26px;letter-spacing:.06em;color:${CREAM};margin-bottom:14px;padding:8px 20px 8px 8px;background:#3E6B4F;border-radius:14px;box-shadow:0 6px 14px rgba(40,25,10,.35);outline:2px dashed rgba(255,246,230,.7);outline-offset:-6px}
.kk i{font-style:normal;background:${GOLD};color:${INK};padding:3px 12px;border-radius:9px}
.hero{padding:26px 34px 30px;max-width:900px;box-sizing:border-box}
.h1{font-family:'Fraunces',Georgia,serif;font-weight:800;font-size:96px;line-height:.98;letter-spacing:-.01em;color:${INK}}
.h1 em{font-style:italic;color:${RUST}}
.hk{display:flex;align-items:center;margin-top:22px}
.row{display:flex;flex-direction:column;margin-top:14px;padding:16px 34px 18px;max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Fraunces',Georgia,serif;font-weight:800;font-size:54px;line-height:1.04;color:${INK}}
.row span{display:block;margin-top:4px;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:26px;line-height:1.3;color:#7A5A44}
.row b span{display:inline;font:inherit;color:inherit;margin:0}
.row.rd b{color:${RUST}}
.row.qt b{font-style:italic;font-size:46px;max-width:780px;white-space:normal}
.q{margin-top:20px;padding:22px 36px 24px;font-family:'Fraunces',Georgia,serif;font-weight:800;font-size:60px;line-height:1.05;color:${INK};max-width:880px;box-sizing:border-box}
#chain{position:absolute;left:0;top:1146px;width:1080px;height:110px;overflow:hidden;z-index:10;pointer-events:none}
#chainin{position:absolute;left:56px;top:14px;display:flex;align-items:center;white-space:nowrap}
.lk{position:relative;display:inline-flex;align-items:center;height:72px;padding:0 26px;margin-left:62px;border-radius:18px;font-style:normal;font-family:'Courier Prime','Courier New',monospace;font-weight:700;font-size:31px;letter-spacing:.03em;color:${CREAM};box-shadow:0 7px 14px rgba(40,20,5,.42),inset 0 -5px 0 rgba(0,0,0,.14)}
.lk:first-child{margin-left:0}
.lk::after{content:'';position:absolute;inset:6px;border:2.5px dashed rgba(255,246,230,.85);border-radius:13px}
.lk::before{content:'';position:absolute;left:-64px;top:31px;width:66px;height:0;border-top:5px dashed ${RUST};filter:drop-shadow(0 2px 1px rgba(0,0,0,.3))}
.lk:first-child::before{display:none}
.hk .lk{height:66px;font-size:30px}
.c1{background-color:${RUST}}.c2{background-color:${MOSS}}.c3{background-color:#C98A2E}.c4{background-color:#3E8C88}.c5{background-color:${PLUM}}`;

const hud = `(function(){const box=q('#chainin');const L=[...box.querySelectorAll('.lk')].map(e=>({e,a:AT[e.dataset.at]}));
const sm=(x)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
return (t)=>{let r=0,prev=0;for(const l of L){const right=l.e.offsetLeft+l.e.offsetWidth;const p=sm((t-l.a+0.05)/0.55);if(p<=0)break;r=prev+(right-prev)*p;prev=right;}
box.style.transform='translateX('+Math.min(0,912-r).toFixed(1)+'px)';};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP32_KELINCI_AUSTRALIA",
  ep: "32", bg: BG, vig: 0.3, grain: 0.05, capfloor: 0.18, html, css, hud, chipFont: `'Courier Prime','Courier New',monospace`, chipColor: INK,
  chip: "ILUSTRASI FLANEL &middot; BUKAN SKALA SEBENARNYA",
  extraAt: ["s1:Dua", "s1:ekor", "s1:kelinci", "s1:peternakan", "s1:Seratus", "s1:juta", "s1:benua", "s1:kewalahan",
    "s2:Victoria", "s2:Thomas", "s2:rindu", "s2:berburu", "s2:Padahal", "s2:tidak",
    "s3:melepas", "s3:dua", "s3:lahannya", "s3:Katanya", "s3:halaman",
    "s4:bercampur", "s4:peliharaan", "s4:keturunannya", "s4:Australia",
    "s5:lima", "s5:pemburu", "s5:Dalam", "s5:bedanya", "s5:penyebaran", "s5:dunia",
    "s6:Rumput", "s6:habis", "s6:pohon", "s6:kulitnya", "s6:dimakan", "s6:tanah", "s6:tergerus", "s6:Tahun", "s6:membangun", "s6:pagar", "s6:kilometer", "s6:lolos",
    "s7:virus", "s7:myxoma", "s7:turun", "s7:enam", "s7:menjadi", "s7:juta#2", "s7:Tapi", "s7:beradaptasi", "s7:jumlahnya", "s7:lagi", "s7:Studi", "s7:memastikan", "s7:berasal", "s7:Austin",
    "s8:Perang", "s8:Emu", "s8:Menurut", "s8:bersalah", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,y:26,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.4,ease:'back.out(1.6)',immediateRender:false},t);},
 lk:(e,t)=>tl.fromTo(e,{opacity:0,scale:.45,rotation:-9},{opacity:1,scale:1,rotation:0,duration:.38,ease:'back.out(2.2)'},t),`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-36,rotation:-1.2},{opacity:1,y:0,rotation:0,duration:.42,ease:'back.out(1.3)'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-26,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Fraunces',Georgia,serif;font-weight:800;font-size:70px;line-height:1.06;color:#FFF8EC;-webkit-text-stroke:11px #3A2416;paint-order:stroke fill;text-shadow:0 6px 16px rgba(30,15,5,.55)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFF8EC"},{color:"${GOLD}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF8EC",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kelinci Australia", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
