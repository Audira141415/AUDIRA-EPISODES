// EP25 BANGKOK, NAMA TEMPAT TERPANJANG: MANUSCRIPT. A royal parchment scroll unrolls on a candle-lit desk while a quill
// writes the ceremonial name of Bangkok word by word in gold ink (Latin transliteration only) and a counter climbs to
// 168 huruf. Then: the BANGKOK tag struck through as a nickname, an ink sketch of a river village, the Chao Phraya map
// with the 1782 east-bank move, an illuminated panel of meanings with nine gems, a brass record plaque, an abstract
// record + sound-wave motif for the 1989 song (no lyrics), the short forms on tile racks, and the AUDIRA wax seal.
// Panels unfold like a scroll (scaleY from the top edge). Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PARCH = "#F1E3C2", INK = "#3B2412", GOLD = "#C9A227", LAC = "#8E1B1B", BG = "#140C07";
const HEAD = `Cinzel,Georgia,serif`, BODY = `'EB Garamond',Georgia,serif`;
const NAME = "Krung Thep Maha Nakhon Amon Rattanakosin Mahintharayutthaya Mahadilok Phop Noppharat Ratchathani Burirom Udomratchaniwet Mahasathan Amon Phiman Awatan Sathit Sakkathattiya Witsanukam Prasit".split(" ");

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const mm = (txt, a) => `<div class="cd mm" data-at="${a}" data-fx="card"><i></i>${txt}</div>`;

let html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 25</div>
  <div class="cd h1">Nama asli <em>Bangkok</em></div>
  <div class="cd cnt"><b id="cnt" class="nb">0</b><span>HURUF</span></div>
  <div class="stamp" data-at="s1:bukan" data-fx="stampc">BUKAN &ldquo;BANGKOK&rdquo;</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">THAILAND</div>
  ${row("BANGKOK", "nama yang dikenal dunia", "s2:Bangkok")}
  ${row("BANG", "kemungkinan: desa di tepi sungai", "s2:bang", "rd")}
  <div class="note" data-at="s2:meski" data-fx="fade">asal pastinya tidak jelas</div>
</div>
<div class="p" data-in="s3" data-out="s3:Sejak">
  <div class="kk">IBU KOTA BARU</div>
  ${row("RAJA RAMA I", "memindahkan ibu kota ke tepi timur Sungai Chao Phraya", "s3:Rama")}
  <div class="cd mega" data-at="s3:1782" data-fx="card"><b>1782</b></div>
</div>
<div class="p" data-in="s3:Sejak" data-out="s4">
  <div class="kk">NAMA UPACARA</div>
  ${row("SEJAK RAJA MONGKUT", "Rama IV", "s3:Mongkut")}
  <div class="chips"><i class="ch" data-at="s3:Pali" data-fx="stampc">PALI</i><i class="ch rd" data-at="s3:Sanskerta" data-fx="stampc">SANSKERTA</i></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">NAMA LENGKAP &middot; ALIH AKSARA LATIN</div>
  <div class="cd h2">Dimulai seperti ini&hellip;</div>
  <div class="chips"><i class="ch rd" data-at="s4:berlanjut" data-fx="stampc">&hellip;DAN MASIH BERLANJUT</i></div>
</div>
<div class="p" data-in="s5" data-out="s5:takhta">
  <div class="kk">ARTINYA, KIRA-KIRA</div>
  ${mm("kota para malaikat", "s5:malaikat")}
  ${mm("kota agung para abadi", "s5:abadi")}
  ${mm("kota megah <u>sembilan permata</u>", "s5:permata")}
</div>
<div class="p" data-in="s5:takhta" data-out="s6">
  <div class="kk">ARTINYA, KIRA-KIRA</div>
  ${mm("takhta raja, istana kerajaan", "s5:takhta")}
  ${mm("rumah para dewa yang menjelma", "s5:dewa")}
  ${mm("didirikan <u>Wishwakarma</u> atas titah <u>Dewa Indra</u>", "s5:Wishwakarma")}
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">GUINNESS WORLD RECORDS</div>
  ${row("NAMA TEMPAT TERPANJANG DI DUNIA", "", "s6:terpanjang")}
  <div class="cd mega" data-at="s6:seratus" data-fx="card"><b><b class="ct" data-from="0" data-to="168" data-a="s6:seratus" data-d="1.4">0</b></b><small>HURUF</small></div>
</div>
<div class="p" data-in="s7" data-out="s7:Sehari-hari">
  <div class="kk">SEBUAH LAGU ROCK</div>
  <div class="cd mega" data-at="s7:1989" data-fx="card"><b>1989</b></div>
  ${row("LIRIKNYA HANYA NAMA KOTA INI", "banyak orang Thailand jadi hafal nama lengkapnya", "s7:liriknya", "rd")}
</div>
<div class="p" data-in="s7:Sehari-hari" data-out="s8">
  <div class="kk">SEHARI-HARI</div>
  ${row("KRUNG THEP", "&ldquo;Kota Malaikat&rdquo;", "s7:Krung")}
  ${row("KO THO MO", "singkatan tiga huruf Thai", "s7:Singkatannya", "rd")}
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="cd h2">Bangkok cuma<br><em>nama panggilan</em></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Kalau nama kotamu sepanjang ini, bunyinya seperti apa? Tulis di komentar!</div>
</div>`;
// digit runs get EB Garamond (Cinzel numerals read as letters)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<span class="g">$1</span>') + "<");

const parch = `linear-gradient(172deg,#F8EED6,${PARCH} 55%,#E3CC9C)`;
const css = `
.p{transform-origin:50% 0%}
.g{font-family:'EB Garamond',Georgia,serif;font-weight:700}
.cd{position:relative;background:${parch};border:3px solid ${GOLD};outline:2px solid ${INK};outline-offset:3px;border-radius:4px;box-shadow:0 18px 40px rgba(0,0,0,.55)}
.kk{display:inline-block;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:30px;line-height:1.1;letter-spacing:.12em;color:#F6E7BF;background:${LAC};padding:10px 22px 8px;border:2px solid ${GOLD};margin-bottom:24px;box-shadow:0 8px 20px rgba(0,0,0,.5)}
.h1{display:inline-block;padding:14px 32px 12px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:92px;line-height:1.02;color:${INK}}
.h1 em,.h2 em{font-style:normal;color:${LAC}}
.h2{display:inline-block;padding:14px 30px 12px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:64px;line-height:1.08;color:${INK}}
.cnt{display:flex;align-items:baseline;gap:22px;width:max-content;margin-top:22px;padding:0 30px 4px}
.cnt b{font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:170px;line-height:1;color:${LAC};min-width:270px;text-align:right}
.cnt span{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:58px;color:${INK};letter-spacing:.06em}
.stamp{display:inline-block;margin-top:22px;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:50px;letter-spacing:.06em;color:#F6E7BF;background:${LAC};padding:10px 26px 8px;border:3px solid ${GOLD};transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.55)}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:24px;align-items:center}
.ch{font-style:normal;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:46px;line-height:1.1;letter-spacing:.06em;padding:10px 24px 8px;color:${INK};background:${parch};border:3px solid ${GOLD};outline:2px solid ${INK};outline-offset:3px;transform:rotate(-2deg);box-shadow:0 10px 24px rgba(0,0,0,.5)}
.ch.rd{color:#F6E7BF;background:${LAC}}
.row{flex-direction:column;margin-top:20px;padding:12px 26px 14px;border-left:14px solid ${GOLD};max-width:850px;box-sizing:border-box}
.row b{display:block;font-family:Cinzel,Georgia,serif;font-weight:700;font-size:48px;line-height:1.1;color:${INK}}
.row span{display:block;margin-top:4px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:38px;line-height:1.2;color:#5a3a1e}
.row.rd{border-left-color:${LAC}}.row.rd b{color:${LAC}}
.mm{display:flex;align-items:center;gap:18px;width:max-content;max-width:860px;box-sizing:border-box;margin-top:16px;padding:10px 26px 12px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:44px;line-height:1.15;color:${INK}}
.mm i{flex:none;width:18px;height:18px;background:${GOLD};border:2px solid ${INK};transform:rotate(45deg)}
.mm u{text-decoration:none;color:${LAC};font-weight:700}
.mega{display:flex;align-items:baseline;gap:22px;width:max-content;padding:0 32px 6px;margin-top:20px}
.mega b{font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:150px;line-height:1.05;color:${LAC}}
.mega small{font-family:Cinzel,Georgia,serif;font-weight:700;font-size:54px;color:${INK}}
.note{display:inline-block;margin-top:18px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:700;font-size:36px;color:#F6E7BF;background:rgba(30,18,10,.82);border:2px solid ${GOLD};padding:6px 18px}
.q{margin-top:26px;padding:16px 28px 16px;font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:48px;line-height:1.15;color:#F6E7BF;background:${LAC};max-width:840px;box-sizing:border-box}`;

// counter during the hook: letters already written, scaled to the 168 letters Guinness counts
const LENS = NAME.map((w) => w.length), TOT = LENS.reduce((a, b) => a + b, 0);
const hud = `(()=>{const e=document.getElementById('cnt');const L=${JSON.stringify(LENS)},T=${TOT};const t0=0.3,t1=AT['s1:huruf']-0.05,dw=(t1-t0)/L.length;
return (t)=>{let s=0;for(let i=0;i<L.length;i++){const u=Math.min(1,Math.max(0,(t-t0-i*dw)/(dw*0.92)));s+=L[i]*u;}const n=s>=T-0.01?168:Math.floor(168*s/T);e.textContent=n;};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP25_BANGKOK_NAMA_PANJANG",
  ep: "25", bg: BG, vig: 0.42, grain: 0.06, capfloor: 0.42, html, css, chipFont: HEAD, chipColor: "#F1E3C2",
  chip: "ILUSTRASI &middot; ALIH AKSARA LATIN",
  hud,
  extraAt: ["s1:huruf", "s1:Bangkok", "s2:Bangkok", "s2:Kata", "s3:ibu", "s3:Sungai", "s3:timur", "s3:Mongkut", "s4:Krung", "s4:Thep", "s4:Maha", "s4:Nakhon", "s4:Amon",
    "s4:Rattanakosin", "s4:Mahintharayutthaya", "s4:dan", "s5:kota", "s5:malaikat", "s5:abadi", "s5:sembilan", "s5:istana", "s5:Indra",
    "s6:Guinness", "s6:huruf", "s7:lagu", "s7:Ko", "s7:Tho", "s7:Mo", "s8:panggilan", "s8:Bangkok"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.mm')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:26,scaleY:.6,transformOrigin:'50% 0%'},{opacity:1,y:0,scaleY:1,duration:.38,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,scaleY:.7,y:-20},{opacity:1,scaleY:1,y:0,duration:.42,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-30,duration:.24,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'EB Garamond',Georgia,serif;font-weight:700;font-size:66px;line-height:1.12;color:#F6EBD0;text-shadow:0 3px 0 #1a0f08,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F6EBD0"},{color:"${"#F2C14E"}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F6EBD0",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nama Asli Bangkok", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
