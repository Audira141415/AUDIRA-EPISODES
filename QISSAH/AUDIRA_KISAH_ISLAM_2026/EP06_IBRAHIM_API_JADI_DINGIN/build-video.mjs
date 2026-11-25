// EP06 IBRAHIM, API JADI DINGIN. VINTAGEFORGE: antique copper engraving on sepia parchment, copper and gold patina.
// Panels are engraved plates: they arrive as a hatch-line reveal under a press (lines thicken until the plate is solid)
// and leave by being lifted off the paper. Arabic comes from _research/quran/EP06_ibrahim.txt by word slices, never retyped.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2B1B10", COPPER = "#9A5527", GOLD = "#B8862E", PATINA = "#4F7F6E", PARCH = "#F1E4C6", BG = "#EADCC0";

// exact Uthmani text from the verse file; a phrase is a contiguous slice of the verse's words
const QURAN = readFileSync("../_research/quran/EP06_ibrahim.txt", "utf8");
const verse = (ref) => { const m = QURAN.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const ar = (ref, a, b) => verse(ref).split(" ").slice(a, b).join(" ");

const ref = (txt, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="press"` : ""}>${txt}</span>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 06</div>
    <div class="h">API YANG<br>TIDAK MEMBAKAR</div>
    <div class="row" data-at="s1:wahai" data-fx="hatch"><div class="qt">&ldquo;Wahai api, jadilah dingin.&rdquo;</div>${ref("QS 21:69")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Ia">
  <div class="card">
    <div class="k"><i></i>KAUM PENYEMBAH PATUNG ${ref("QS 6:74", "s2:ayahnya")}</div>
    <div class="h m">TERMASUK<br>AYAHNYA SENDIRI</div>
  </div>
</div>
<div class="p" data-in="s2:Ia" data-out="s2:Jawab">
  <div class="card">
    <div class="k"><i></i>IBRAHIM BERTANYA ${ref("QS 21:52", "s2:bertanya")}</div>
    <div class="ar sm">${ar("21:52", 4)}</div>
    <div class="qt" data-at="s2:patung" data-fx="hatch">&ldquo;Patung apa yang kalian sembah dengan tekun ini?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s2:Jawab" data-out="s3">
  <div class="card">
    <div class="k"><i></i>JAWAB MEREKA ${ref("QS 21:53", "s2:mereka")}</div>
    <div class="qt big">&ldquo;Kami mendapati nenek moyang kami menyembahnya.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Bintang">
  <div class="card">
    <div class="k"><i></i>SURAH AL-AN'AM ${ref("QS 6:76&ndash;79", "s3:mencatat")}</div>
    <div class="h m">MENGAJAK<br>BERPIKIR</div>
  </div>
</div>
<div class="p" data-in="s3:Bintang" data-out="s3:Yang">
  <div class="card led">
    <div class="ln" data-at="s3:Bintang" data-fx="hatch"><b>Bintang</b><em>terbenam</em>${ref("6:76")}</div>
    <div class="ln" data-at="s3:Bulan" data-fx="hatch"><b>Bulan</b><em>terbenam</em>${ref("6:77")}</div>
    <div class="ln" data-at="s3:Matahari" data-fx="hatch"><b>Matahari</b><em>terbenam</em>${ref("6:78")}</div>
  </div>
</div>
<div class="p" data-in="s3:Yang" data-out="s4">
  <div class="card">
    <div class="ar sm">${ar("6:76", -3)}</div>
    <div class="qt">Yang tenggelam tidak pantas disembah.</div>
    <div class="sub" data-at="s3:menghadap" data-fx="hatch">Menghadap Pencipta langit dan bumi ${ref("QS 6:79")}</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:kenapa">
  <div class="card">
    <div class="k"><i></i>SUATU HARI ${ref("QS 37:90", "s4:pergi")}</div>
    <div class="h m">KAUMNYA<br>PERGI</div>
    <div class="sub" data-at="s4:mendatangi" data-fx="hatch">Ibrahim mendatangi berhala-berhala ${ref("QS 37:91")}</div>
  </div>
</div>
<div class="p" data-in="s4:kenapa" data-out="s4:Lalu">
  <div class="card">
    <div class="k"><i></i>IA BERTANYA ${ref("QS 37:91&ndash;92", "s4:kenapa")}</div>
    <div class="qt big">&ldquo;Kenapa kalian tidak makan?&rdquo;</div>
    <div class="ar sm" data-at="s4:Kenapa" data-fx="rtl">${verse("37:92")}</div>
    <div class="qt" data-at="s4:Kenapa" data-fx="hatch">&ldquo;Kenapa tidak menjawab?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Lalu" data-out="s5">
  <div class="card">
    <div class="k"><i></i>DIHANCURKAN ${ref("QS 21:58", "s4:menghancurkan")}</div>
    <div class="h m">SEMUANYA</div>
    <div class="sub big" data-at="s4:kecuali" data-fx="hatch">kecuali yang paling besar</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Ibrahim">
  <div class="card">
    <div class="k"><i></i>KAUMNYA MARAH ${ref("QS 21:59", "s5:siapa")}</div>
    <div class="qt big">&ldquo;Siapa yang melakukan ini?&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Ibrahim" data-out="s5:Mereka">
  <div class="card">
    <div class="k"><i></i>IBRAHIM MENJAWAB ${ref("QS 21:63", "s5:menjawab")}</div>
    <div class="ar sm">${ar("21:63", -4)}</div>
    <div class="qt" data-at="s5:tanyakan" data-fx="hatch">&ldquo;Tanyakan saja pada patung yang besar itu, kalau mereka bisa bicara.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Mereka" data-out="s6">
  <div class="card">
    <div class="k"><i></i>MEREKA TERTUNDUK ${ref("QS 21:65", "s5:tertunduk")}</div>
    <div class="h s">Patung tidak bisa bicara.</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Sebuah">
  <div class="card">
    <div class="k"><i></i>KALAH BERDEBAT ${ref("QS 21:68", "s6:Bakarlah")}</div>
    <div class="ar">${ar("21:68", 1, 2)}</div>
    <div class="qt big" data-at="s6:Bakarlah" data-fx="hatch">&ldquo;Bakarlah dia.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6:Sebuah" data-out="s7">
  <div class="card">
    <div class="k"><i></i>SEBUAH BANGUNAN ${ref("QS 37:97", "s6:bangunan")}</div>
    <div class="h m">API<br>DINYALAKAN</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Yang">
  <div class="card cal">
    <div class="k"><i></i>ALLAH BERFIRMAN ${ref("QS AL-ANBIYA 21:69", "s7:surah")}</div>
    <div class="ar gold" data-at="s7:wahai" data-fx="rtl">${verse("21:69")}</div>
    <div class="qt" data-at="s7:jadilah" data-fx="hatch">&ldquo;Wahai api, jadilah dingin, dan keselamatan bagi Ibrahim.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7:Yang" data-out="s8">
  <div class="card">
    <div class="k"><i></i>YANG HENDAK MENCELAKAINYA ${ref("QS 21:70", "s7:mencelakainya")}</div>
    <div class="h s">Menjadi orang-orang yang paling rugi.</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>RENUNGAN</div>
    <div class="qt">Keyakinan yang lahir dari berpikir tidak padam oleh api.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="hatch">Kebiasaan apa yang masih kita ikuti hanya karena semua orang melakukannya?</div>
  </div>
</div>`;

const css = `
#vig{background:radial-gradient(ellipse at 50% 45%,rgba(70,45,20,0) 55%,rgba(70,45,20,.3) 100%)}
#capfloor{background:linear-gradient(180deg,rgba(241,228,198,0),rgba(241,228,198,.72) 40%,rgba(241,228,198,.72) 72%,rgba(241,228,198,0))}
.p{--hp:10;--lift:0;-webkit-mask-image:repeating-linear-gradient(-35deg,#000 0 calc(var(--hp) * 1px),rgba(0,0,0,0) calc(var(--hp) * 1px) 10px);mask-image:repeating-linear-gradient(-35deg,#000 0 calc(var(--hp) * 1px),rgba(0,0,0,0) calc(var(--hp) * 1px) 10px)}
[data-fx=hatch]{--hq:9;-webkit-mask-image:repeating-linear-gradient(-35deg,#000 0 calc(var(--hq) * 1px),rgba(0,0,0,0) calc(var(--hq) * 1px) 9px);mask-image:repeating-linear-gradient(-35deg,#000 0 calc(var(--hq) * 1px),rgba(0,0,0,0) calc(var(--hq) * 1px) 9px)}
#chip{text-shadow:0 0 6px rgba(43,27,16,.95),0 0 2px rgba(43,27,16,.95)}
.card{position:relative;background:linear-gradient(180deg,rgba(243,232,205,.95),rgba(234,219,186,.95));padding:24px 32px 28px;box-shadow:0 16px 34px rgba(60,35,15,.22),inset 0 0 0 2px rgba(43,27,16,.7),inset 0 0 0 8px rgba(243,232,205,.0),inset 0 0 0 9px rgba(154,85,39,.55)}
.card:before{content:"";position:absolute;inset:14px;border:1px solid rgba(43,27,16,.28);pointer-events:none}
.card:after{content:"";position:absolute;right:22px;top:-12px;width:46px;height:24px;background:radial-gradient(circle at 50% 50%,${GOLD} 0 42%,${COPPER} 44% 60%,rgba(0,0,0,0) 62%);opacity:.9}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"IM Fell English SC",serif;font-weight:400;font-size:29px;letter-spacing:.08em;color:${COPPER};margin-bottom:10px}
.k i{display:block;width:30px;height:2px;background:${COPPER};box-shadow:0 5px 0 ${COPPER}}
.h{font-family:"IM Fell English SC",serif;font-weight:400;font-size:80px;line-height:1.0;color:${INK};letter-spacing:.01em}
.h.m{font-size:74px}
.h.s{font-family:"IM Fell English",serif;font-size:56px;line-height:1.1}
.qt{font-family:"IM Fell English",serif;font-style:italic;font-size:45px;line-height:1.2;color:${INK}}
.qt.big{font-size:60px;line-height:1.08}
.sub{font-family:"Cormorant Garamond",serif;font-weight:700;font-size:38px;line-height:1.2;color:${PATINA};margin-top:10px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.sub.big{font-size:48px}
.row{display:flex;align-items:center;gap:20px;margin-top:14px}
.rf{display:inline-block;font-family:"Cormorant Garamond",serif;font-weight:700;font-size:26px;letter-spacing:.06em;color:#FBF1DA;background:linear-gradient(180deg,#B56A34,#86461F);padding:4px 13px 5px;border-radius:2px;box-shadow:inset 0 0 0 1.5px rgba(251,241,218,.45),0 2px 0 rgba(43,27,16,.4);white-space:nowrap}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:74px;line-height:1.6;color:${COPPER};margin:2px 0 6px}
.ar.sm{font-size:52px;line-height:1.55}
.ar.gold{font-size:66px;line-height:1.75;color:${GOLD};filter:drop-shadow(0 2px 0 rgba(43,27,16,.55));text-align:center}
.cal{padding-top:18px}
.led{padding:14px 32px 16px}
.ln{display:flex;align-items:baseline;gap:18px;padding:10px 0;border-bottom:1.5px dashed rgba(43,27,16,.3)}
.ln:last-child{border-bottom:0}
.ln b{font-family:"IM Fell English SC",serif;font-weight:400;font-size:54px;color:${INK};min-width:250px}
.ln em{font-family:"IM Fell English",serif;font-style:italic;font-size:42px;color:${COPPER};flex:1}
.ask{margin-top:16px;font-family:"IM Fell English",serif;font-size:42px;line-height:1.2;color:#FBF1DA;background:linear-gradient(180deg,#5C8B79,#3E6A5A);padding:12px 20px;box-shadow:inset 0 0 0 2px rgba(251,241,218,.35)}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:kaumnya", "s1:Satu", "s1:wahai", "s2:patung", "s2:ayahnya", "s2:Ia", "s2:bertanya", "s2:tekun", "s2:Jawab", "s2:nenek",
  "s3:Ibrahim", "s3:berpikir", "s3:Bintang", "s3:terbenam", "s3:Bulan", "s3:terbenam#2", "s3:Matahari", "s3:terbenam#3", "s3:Yang", "s3:menghadap",
  "s4:kaumnya", "s4:pergi", "s4:Ibrahim", "s4:berhala-berhala", "s4:bertanya", "s4:makan", "s4:Kenapa", "s4:menjawab", "s4:Lalu", "s4:menghancurkan", "s4:kecuali", "s4:besar",
  "s5:marah", "s5:Ibrahim", "s5:menjawab", "s5:tanyakan", "s5:besar", "s5:Mereka", "s5:tertunduk", "s5:tahu",
  "s6:Bakarlah", "s6:Sebuah", "s6:bangunan", "s6:api", "s6:dilemparkan",
  "s7:Allah", "s7:wahai", "s7:dingin", "s7:keselamatan", "s7:surah", "s7:Yang", "s7:mencelakainya", "s7:rugi",
  "s8:padam", "s8:Menurut"];
const { AT, K } = writeWorld(TL, at, {
  ep: "06", bg: BG, vig: 0.3, grain: 0.1, capfloor: 0, html, css, chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "IM Fell English SC,serif", chipColor: PARCH,
  extraAt: WORLD_AT,
  fxExtra: `hatch:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{'--hq':0,opacity:1},{'--hq':9,opacity:1,duration:.5,ease:'power2.out'},t);},
 press:(e,t)=>tl.fromTo(e,{scale:1.6,opacity:0,y:-6},{scale:1,opacity:1,y:0,duration:.22,ease:'power4.in'},t),
 rtl:(e,t)=>{tl.fromTo(e,{clipPath:'inset(0 0 0 100%)',opacity:1},{clipPath:'inset(0 0 0 0%)',opacity:1,duration:1.1,ease:'power1.inOut'},t);},`,
  // Plate press in: hatch lines thicken from hairlines to a solid plate while the plate settles from a slight lift.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--hp':0,opacity:1,scale:1.035,y:-8},{'--hp':10,opacity:1,scale:1,y:0,duration:.55,ease:'power2.out'},a-.16);}`,
  // Lift off: the plate rises and its lines thin back to hairlines.
  panelOut: `(tl,p,b)=>tl.to(p,{'--hp':0,y:-14,scale:1.02,duration:.36,ease:'power1.in'},b-.34)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.75,ease:'power2.inOut'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"IM Fell English",serif;font-weight:400;font-size:60px;line-height:1.3;color:${INK};text-shadow:0 0 14px rgba(241,228,198,.98),0 0 5px rgba(241,228,198,.98)}
.w{display:inline-block;margin:0 .1em;padding:0 .12em;border-radius:.08em;background:rgba(154,85,39,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",backgroundColor:"rgba(154,85,39,0)"},{color:"#FBF1DA",backgroundColor:"rgba(154,85,39,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",backgroundColor:"rgba(154,85,39,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:8},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ibrahim, Api Jadi Dingin", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
