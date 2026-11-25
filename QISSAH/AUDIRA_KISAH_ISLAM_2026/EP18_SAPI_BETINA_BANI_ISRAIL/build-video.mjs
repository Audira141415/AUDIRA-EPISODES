// EP18 SAPI BETINA BANI ISRAIL. MOSAICFORGE: a 3D courtyard of glazed tesserae; every figure is a tile mosaic.
// Panels are mosaic plaques: a lapis field inside a gold-and-terracotta tessellated border. They arrive and leave with a
// tile flip: the plaque breaks into grouted tiles while it turns over on its top edge, then the grout closes.
// Reveals inside a plaque flip in the same way, one row at a time, and only take space once they appear.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#c98e58", GOLD = "#E9C46A", CREAM = "#F7EEDB", LAPIS = "#13284A", TERRA = "#B4532F", YEL = "#F2C230";

// Arabic is cut from the verse file at the waqf marks, never retyped.
const QF = readFileSync("../_research/quran/EP18_sapi.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V74 = verse("2:74");
const SEG74 = V74.split(" ۚ ");
const BATU = SEG74[0];     // thumma qasat qulubukum ... aw ashaddu qaswah
const MAA = SEG74[2];      // wa inna minha lama yashshaqqaqu fayakhruju minhul-ma'
for (const ph of [BATU, MAA]) if (!V74.includes(ph) || ph.includes("ۚ") || ph.includes("ۗ")) throw new Error("phrase bound");

const STAFF = `<svg class="ic" viewBox="0 0 120 26" width="120" height="26"><path d="M4 18 L92 18 Q112 18 110 8 Q108 2 101 5" fill="none" stroke="#2a1608" stroke-width="9" stroke-linecap="round"/><path d="M4 18 L92 18 Q112 18 110 8 Q108 2 101 5" fill="none" stroke="#9a6534" stroke-width="5.5" stroke-linecap="round"/><rect x="2" y="14" width="9" height="8" fill="${GOLD}"/></svg>`;
const ref = (r) => `<span class="rf">${r}</span>`;
const card = (inner, cls = "") => `<div class="card ${cls}"><div class="in">${inner}</div></div>`;

// herd order matches world3d.js HERD; each dot greys at the filter that removes that cow
const HERD = "oY oB oK oW oG oR oT oY yY yY yB yB yK yW yR yT yG mY* mYp mYp mYw mYs mB mB mK mK mW mR mT mG".split(" ");
const HC = { Y: YEL, B: "#8A5530", K: "#3a322c", W: "#ECE4D4", G: "#9C978E", R: "#A9442D", T: "#C49A62" };
const fkey = (h) => h[0] === "o" ? "s3:tua" : h[0] === "y" ? "s3:muda" : h[1] !== "Y" ? "s3:Kuning" : h[2] === "p" ? "s4:membajak" : h[2] === "w" ? "s4:mengairi" : h[2] === "s" ? "s4:belang" : "";
const dots = `<div class="dots">${HERD.map((h) => `<i data-f="${fkey(h)}" style="background:${HC[h[1]]}"></i>`).join("")}</div>`;
const counter = `<div class="row cr"><span class="t s">sapi yang memenuhi syarat</span>${dots}</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${card(`<div class="k">KISAH DALAM AL-QUR'AN &middot; 18</div>
    <div class="h">AL-BAQARAH</div>
    <div class="row"><b class="big ct" data-from="0" data-to="286" data-a="s1" data-d="0.7">286</b><span class="t">ayat &middot; <em>surah terpanjang</em></span></div>
    <div class="row" data-at="s1:sapi" data-fx="tf"><span class="chip y">DINAMAI DARI SEEKOR SAPI</span></div>
    <div class="row" data-at="s1:bertanya" data-fx="tf"><span class="t">tentang yang terlalu banyak bertanya</span><span class="qq">?</span><span class="qq">?</span><span class="qq">?</span></div>`)}
</div>
<div class="p" data-in="s2" data-out="s2:Jawab">
  ${card(`<div class="k">AL-BAQARAH ${ref("QS 2:67")}</div>
    <div class="h m">AYAT 67</div>
    <div class="row" data-at="s2:Musa" data-fx="tf">${STAFF}<span class="t">Musa berkata kepada kaumnya</span></div>
    <div class="q" data-at="s2:Allah" data-fx="tf">&ldquo;Allah memerintahkan kalian menyembelih seekor sapi betina.&rdquo;</div>`)}
</div>
<div class="p" data-in="s2:Jawab" data-out="s3">
  ${card(`<div class="k">JAWAB MEREKA ${ref("QS 2:67")}</div>
    <div class="q big">&ldquo;Apakah engkau mengejek kami?&rdquo;</div>`, "slim")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${card(`<div class="k">PERTANYAAN 1 &amp; 2 ${ref("QS 2:68-69")}</div>
    ${counter}
    <div class="row chips" data-at="s3:tua" data-fx="tf"><span class="chip">TIDAK TUA</span><span class="chip" data-at="s3:muda" data-fx="tf">TIDAK MUDA</span><span class="chip ok" data-at="s3:pertengahan" data-fx="tf">PERTENGAHAN</span></div>
    <div class="row chips" data-at="s3:Kuning" data-fx="tf"><span class="chip y">KUNING CERAH</span><span class="t s">menyenangkan yang memandang</span></div>`)}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${card(`<div class="k">PERTANYAAN 3 ${ref("QS 2:70-71")}</div>
    ${counter}
    <div class="row chips" data-at="s4:membajak" data-fx="tf"><span class="chip">BELUM PERNAH MEMBAJAK</span></div>
    <div class="row chips" data-at="s4:mengairi" data-fx="tf"><span class="chip">TIDAK MENGAIRI TANAMAN</span></div>
    <div class="row chips" data-at="s4:sehat" data-fx="tf"><span class="chip ok">SEHAT</span><span class="chip ok" data-at="s4:belang" data-fx="tf">TANPA BELANG</span></div>`)}
</div>
<div class="p" data-in="s5" data-out="s5:nyaris">
  ${card(`<div class="k">SYARATNYA MAKIN SEMPIT</div>
    <div class="h s">Syarat makin sempit, tinggal satu sapi.</div>
    <div class="t" data-at="s5:Akhirnya" data-fx="tf">Akhirnya mereka menyembelihnya.</div>`, "slim")}
</div>
<div class="p" data-in="s5:nyaris" data-out="s6">
  ${card(`<div class="k">AYAT ITU MENCATAT ${ref("QS 2:71")}</div>
    <div class="h s">&ldquo;Nyaris mereka tidak melaksanakannya.&rdquo;</div>`, "slim")}
</div>
<div class="p" data-in="s6" data-out="s6:Allah">
  ${card(`<div class="k">TERNYATA ${ref("QS 2:72")}</div>
    <div class="h m">Sebuah pembunuhan</div>
    <div class="t" data-at="s6:dituduhkan" data-fx="tf">pelakunya saling dituduhkan</div>`, "slim")}
</div>
<div class="p" data-in="s6:Allah" data-out="s7">
  ${card(`<div class="k">ALLAH MEMERINTAHKAN ${ref("QS 2:73")}</div>
    <div class="q">&ldquo;Pukullah jenazah itu dengan bagian dari sapi tersebut.&rdquo;</div>
    <div class="row" data-at="s6:tersingkap" data-fx="tf"><span class="chip y">YANG DISEMBUNYIKAN TERSINGKAP</span></div>`)}
</div>
<div class="p" data-in="s7" data-out="s7:Padahal">
  ${card(`<div class="k">AYAT BERIKUTNYA ${ref("QS 2:74")}</div>
    <div class="ar">${BATU}</div>
    <div class="t">Hati menjadi keras seperti batu,</div>
    <div class="t gold" data-at="s7:bahkan" data-fx="tf">bahkan lebih keras.</div>`)}
</div>
<div class="p" data-in="s7:Padahal" data-out="s8">
  ${card(`<div class="k">PADAHAL ${ref("QS 2:74")}</div>
    <div class="ar">${MAA}</div>
    <div class="t">Ada pula yang terbelah lalu keluarlah mata air darinya.</div>`)}
</div>
<div class="p" data-in="s8" data-out="s8:Kisah">
  ${card(`<div class="k">PELAJARAN</div>
    <div class="h s">Perintah sederhana jadi berat karena kita sendiri yang mempersulitnya.</div>
    <div class="row" data-at="s8:Pernahkah" data-fx="tf"><span class="chip y">YANG MUDAH, JADI RUMIT?</span></div>`)}
</div>
<div class="p" data-in="s8:Kisah" data-out="@END">
  ${card(`<div class="k">KISAH DALAM AL-QUR'AN</div><div class="h s">bersama AUDIRA</div>`, "slim sign")}
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(14,26,52,0),rgba(14,26,52,.62) 38%,rgba(14,26,52,.62) 74%,rgba(14,26,52,0))}
.p[data-g="1"]{-webkit-mask-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect x='2' y='2' width='40' height='40'/></svg>`)}");-webkit-mask-size:44px 44px;mask-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect x='2' y='2' width='40' height='40'/></svg>`)}");mask-size:44px 44px}
.card{padding:10px;border-radius:4px;box-shadow:0 14px 30px rgba(20,10,4,.45);
 background:linear-gradient(#0f1f3d 2px,transparent 2px) 0 0/11px 11px,linear-gradient(90deg,#0f1f3d 2px,transparent 2px) 0 0/11px 11px,repeating-conic-gradient(#D4AA3E 0 25%,${TERRA} 0 50%) 0 0/22px 22px}
.in{padding:22px 30px 24px;border-radius:2px;
 background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/16px 16px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/16px 16px,linear-gradient(180deg,#1d3a6c,#142b52)}
.card.slim .in{padding:18px 28px 20px}
.card.sign .in{text-align:center}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Cinzel,serif;font-weight:700;font-size:23px;letter-spacing:.1em;color:${GOLD};margin-bottom:10px}
.card.sign .k{justify-content:center}
.h{font-family:Cinzel,serif;font-weight:700;font-size:74px;line-height:1.02;color:${CREAM};letter-spacing:.02em;text-shadow:0 3px 0 rgba(0,0,0,.35)}
.h.m{font-size:56px}
.h.s{font-family:Mulish,sans-serif;font-weight:900;font-size:42px;line-height:1.16;letter-spacing:0}
.t{font-family:Mulish,sans-serif;font-weight:800;font-size:34px;line-height:1.22;color:#EFE6D2}
.t.s{font-size:28px;color:#d9cfb8}
.t.gold{color:${YEL};margin-top:4px}
.t em{font-style:normal;color:${YEL}}
.q{font-family:Mulish,sans-serif;font-weight:800;font-style:italic;font-size:40px;line-height:1.2;color:${CREAM};margin-top:10px}
.q.big{font-size:52px;margin-top:2px}
.row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:12px}
.big{font-family:Cinzel,serif;font-weight:700;font-size:96px;line-height:.9;color:${YEL};font-variant-numeric:tabular-nums;text-shadow:0 4px 0 rgba(0,0,0,.35)}
.chip{display:inline-block;font-family:Mulish,sans-serif;font-weight:900;font-size:26px;letter-spacing:.03em;color:${LAPIS};background:#EFE3C6;padding:7px 14px 6px;border-radius:3px;box-shadow:0 4px 0 #8a6a2a}
.chip.y{background:${YEL};box-shadow:0 4px 0 #8a6412}
.chip.ok{background:#9fd3a0;box-shadow:0 4px 0 #3f7a44}
.qq{display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;font-family:Cinzel,serif;font-weight:700;font-size:30px;color:#fff;background:${TERRA};border-radius:3px;box-shadow:0 3px 0 #6e2c18}
.rf{display:inline-block;font-family:Mulish,sans-serif;font-weight:900;font-size:19px;letter-spacing:.04em;color:${CREAM};background:${TERRA};padding:5px 10px 4px;border-radius:3px}
.ic{display:block;flex:none}
.cr{margin-top:4px;gap:18px;flex-wrap:nowrap}
.cbox{display:flex;align-items:center;gap:12px;flex:none}
.cbox b{font-family:Cinzel,serif;font-weight:700;font-size:84px;line-height:.9;color:${YEL};min-width:104px;text-align:right;font-variant-numeric:tabular-nums}
.cbox span{font-family:Mulish,sans-serif;font-weight:900;font-size:20px;line-height:1.1;letter-spacing:.06em;color:#EFE6D2}
.dots{display:grid;grid-template-columns:repeat(10,26px);gap:5px}
.dots i{display:block;width:26px;height:26px;border-radius:2px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.28)}
.fun{gap:12px;margin-top:2px}
.fun .n{font-family:Cinzel,serif;font-weight:700;font-size:70px;line-height:1;color:${CREAM}}
.fun .n.y{color:${YEL};font-size:90px}
.fun .ar2{font-family:Mulish,sans-serif;font-weight:900;font-size:44px;color:${GOLD}}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:50px;line-height:1.8;color:#FFE7A8;margin:0 0 4px}
`;

// HUD: herd counter and the 30 cow dots, both stepped from the same filter anchors as the world.
const hud = `(t)=>{const S=[['s3:tua',22],['s3:muda',13],['s3:Kuning',5],['s4:membajak',3],['s4:mengairi',2],['s4:belang',1]];
let n=30,prev=30;for(const [k,v] of S){const a=AT[k]+.55;if(t>=a+.6){n=v;prev=v;}else if(t>=a){n=Math.round(prev+(v-prev)*(t-a)/.6);break;}else break;}
document.querySelectorAll('.dots i').forEach(e=>{const f=e.dataset.f;const g=f&&t>=AT[f]+.55;e.style.filter=g?'grayscale(1) brightness(.45)':'none';e.style.opacity=g?.55:1;e.style.outline=(!f&&t>=AT['s4:belang']+1)?'3px solid #fff3b0':'none';});}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
mkdirSync("PROJECT/HyperFrames_Remotion/assets/audio", { recursive: true });
mkdirSync("PROJECT/HyperFrames_Remotion/compositions", { recursive: true });
const WORLD_AT = ["s1:terpanjang", "s1:sapi", "s1:bertanya", "s2:Musa", "s2:sapi", "s2:Jawab", "s2:mengejek",
  "s3:Jawabnya", "s3:tua", "s3:muda", "s3:pertengahan", "s3:Kuning", "s4:Jawabnya", "s4:membajak", "s4:mengairi", "s4:belang",
  "s5:Setiap", "s5:Akhirnya", "s5:menyembelihnya", "s5:nyaris", "s6:pembunuhan", "s6:dituduhkan", "s6:pukullah", "s6:bagian", "s6:sembunyikan", "s6:tersingkap",
  "s7:hati", "s7:keras", "s7:batu", "s7:keras#2", "s7:Padahal", "s7:terbelah", "s7:memancarkan",
  "s8:sederhana", "s8:mempersulitnya", "s8:mudah", "s8:rumit", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "18", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.6, html, css, hud,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Mulish,sans-serif", chipColor: "#FFF4DA",
  signature: "EP18_SAPI_BETINA_BANI_ISRAIL",
  extraAt: WORLD_AT,
  fxExtra: `tf:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,rotationX:-90,transformPerspective:700,transformOrigin:'50% 0%'},{opacity:1,rotationX:0,duration:.34,ease:'back.out(1.5)'},t);},`,
  // Tile flip: the plaque turns over on its top edge while it shows as grouted tiles, then the grout closes.
  panelIn: `(tl,p,a)=>{tl.set(p,{attr:{'data-g':1}},a-.16);tl.fromTo(p,{opacity:0,rotationX:-86,transformPerspective:1100,transformOrigin:'50% 0%'},{opacity:1,rotationX:0,duration:.44,ease:'back.out(1.3)'},a-.16);tl.set(p,{attr:{'data-g':0}},a+.3);}`,
  panelOut: `(tl,p,b)=>{tl.set(p,{attr:{'data-g':1},transformOrigin:'50% 100%'},b-.32);tl.to(p,{rotationX:86,opacity:0,duration:.28,ease:'power2.in'},b-.32);}`,
  outroIn: `gsap.set('#outro',{opacity:0,rotationX:-80,transformPerspective:1400,transformOrigin:'50% 0%'});tl.to('#outro',{opacity:1,rotationX:0,duration:.5,ease:'power3.out'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Mulish,sans-serif;font-weight:900;font-size:58px;line-height:1.32;color:#FFF4DA;text-shadow:0 3px 0 #0f1f3d,2px 2px 0 #0f1f3d,-2px -2px 0 #0f1f3d,2px -2px 0 #0f1f3d,-2px 2px 0 #0f1f3d,0 0 14px rgba(0,0,0,.55)}
.w{display:inline-block;margin:0 .1em;padding:0 .12em;border-radius:4px}`,
(id, w) => `tl.set("#${id}",{color:"${LAPIS}",backgroundColor:"${YEL}",textShadow:"none",boxShadow:"0 4px 0 #8a6412",y:-3},${w.start.toFixed(3)});tl.set("#${id}",{color:"#FFF4DA",backgroundColor:"rgba(0,0,0,0)",textShadow:"0 3px 0 #0f1f3d,2px 2px 0 #0f1f3d,-2px -2px 0 #0f1f3d,2px -2px 0 #0f1f3d,-2px 2px 0 #0f1f3d",boxShadow:"none",y:0},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Sapi Betina Bani Israil", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
