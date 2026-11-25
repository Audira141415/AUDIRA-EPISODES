// EP47 LESOTHO, NEGARA DI ATAS AWAN: POLYVERSE. Three low-poly stations in one pastel dawn world.
//   PEAKS  : Lesotho's massif (real outline, Natural Earth) rising out of a sea of faceted clouds. A red-and-white
//            survey pole stands beside it with tags 1.000 / 1.400 / 1.800 m and an AUDIRA banner on top. A gold
//            crystal marks the lowest point (1.400 m). Level sheets (1.000 m, 1.800 m) slide through the terrain and
//            tint everything above them. Thaba Bosiu-like mesa fortress with huts, Basotho figures and the
//            RAJA MOSHOESHOE I name card. A dam fills with blue water, the Lesotho flag rises, a Basotho blanket unrolls.
//   MAP    : a floating low-poly island of southern Africa; Lesotho is a raised green massif fully ringed by
//            South Africa. In s6 the old western lands, Boer arrows, an 1868 protection dome and the 1869 cut.
//   ENCLAVE: three floating islands, Vatikan and San Marino (in Italia) and Lesotho (in Afrika Selatan), the largest.
// Cuts between stations hide under a cloud wipe. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#FFF8F0", INK = "#2B2540", LBLUE = "#00209F", LGREEN = "#009543", LAV = "#9C8FB8", PEACH = "#F6C7A1", MOSS = "#5E8C4A", BG = "#E9C9C4";
const MONO = `'JetBrains Mono',Consolas,monospace`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d, pre = "", suf = "") => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-pre="${pre}" data-suf="${suf}">${pre}0${suf}</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=block">
<div id="cw"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 47", "NEGARA DI ATAS AWAN")}
  <div class="cd h1">Titik terendahnya saja<br><em>1.400 m</em></div>
  <div class="stamp" data-at="s1:permukaan" data-fx="stampc">DI ATAS PERMUKAAN LAUT</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("No. 02", "KERAJAAN LESOTHO")}
  ${row("AFRIKA BAGIAN SELATAN", "ibu kota Maseru", "s2:Afrika")}
  ${row("DIKELILINGI PENUH", "oleh satu negara: Afrika Selatan", "s2:satu", "bl")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("No. 03", "NEGARA TERKURUNG")}
  <div class="cd stat" data-at="s3:tiga" data-fx="card"><b>3</b><span>negara merdeka dikelilingi penuh satu negara</span></div>
  ${row("VATIKAN &middot; SAN MARINO", "keduanya di dalam Italia", "s3:Vatikan", "lv")}
  ${row("LESOTHO TERBESAR", "satu-satunya di luar Eropa", "s3:terbesar", "gr")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("No. 04", "SERBA TINGGI")}
  <div class="cd stat" data-at="s4:tiga-0.2" data-fx="card"><b>${ct(30355, "s4:tiga-0.2", +(at("s4:kilometer") - at("s4:tiga") + 0.2).toFixed(2))}</b><span>km&sup2;</span></div>
  ${row("SELURUHNYA DI ATAS 1.000 m", "", "s4:seribu", "gr")}
  <div class="cd stat gd" data-at="s4:delapan-0.3" data-fx="card"><b>${ct(80, "s4:delapan-0.3", +(at("s4:persen") - at("s4:delapan") + 0.3).toFixed(2), "&gt;", "%")}</b><span>di atas 1.800 m</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("&plusmn; 1822&ndash;1824", "LAHIR DI GUNUNG")}
  <div class="cd name" data-at="s5:Raja" data-fx="card"><small>RAJA</small><b>MOSHOESHOE I</b><span>menyatukan suku Basotho</span></div>
  ${row("BERTAHAN DI PUNCAK GUNUNG", "dari serangan musuh", "s5:puncak", "lv")}
</div>
<div class="p" data-in="s6" data-out="s6:Setahun">
  ${kk("No. 06", "DIDESAK")}
  ${row("PEMUKIM BELANDA (BOER)", "terus mendesak", "s6:Pemukim", "or")}
  <div class="cd mega" data-at="s6:1868" data-fx="card"><b>1868</b><small>meminta perlindungan Inggris</small></div>
</div>
<div class="p" data-in="s6:Setahun" data-out="s7">
  ${kk("No. 06", "PERJANJIAN ALIWAL NORTH")}
  <div class="cd mega rd" data-at="s6:Setahun" data-fx="card"><b>1869</b><small>batas Inggris &ndash; Boer</small></div>
  <div class="stamp" data-at="s6:memotong" data-fx="stampc">KERAJAAN DIPOTONG SEPARUH</div>
</div>
<div class="p" data-in="s7" data-out="s7:Kini">
  ${kk("No. 07", "KEMERDEKAAN")}
  <div class="cd date" data-at="s7:Empat" data-fx="card"><b>4 OKTOBER 1966</b></div>
  ${row("KERAJAAN LESOTHO MERDEKA", "", "s7:merdeka", "bl")}
</div>
<div class="p" data-in="s7:Kini" data-out="s8">
  ${kk("No. 07", "KEKAYAAN UTAMA")}
  ${row("AIR PEGUNUNGAN", "Proyek Air Dataran Tinggi Lesotho", "s7:air", "bl")}
  ${row("SELIMUT BASOTHO", "dipakai sebagai pakaian adat", "s7:selimut", "or")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("No. 08", "AUDIRA")}
  <div class="cd h2">Kerajaan di atas awan,<br><em>di tengah negara lain</em></div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  ${kk("No. 08", "PERTANYAAN")}
  <div class="cd q">Enak tidak tinggal di negara yang seluruhnya pegunungan? Tulis di komentar.</div>
</div>`;

const css = `
#gl{filter:contrast(1.07) saturate(1.12)}
#cw{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 55%,#FFFFFF 0%,#F7EEF4 45%,#EBDCEA 100%)}
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CARD};border-radius:18px;box-shadow:0 16px 36px rgba(60,40,80,.28),0 2px 0 rgba(255,255,255,.9) inset}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:25px;line-height:1;letter-spacing:.14em;color:#FFF8F0;background:${INK};padding:14px 24px 13px;border-radius:12px;margin-bottom:18px;box-shadow:0 10px 24px rgba(40,30,70,.35)}
.kk i{font-style:normal;color:${PEACH};border-right:2px solid rgba(246,199,161,.5);padding-right:16px}
.h1{display:inline-block;padding:22px 36px 26px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:74px;line-height:1.02;letter-spacing:-.01em;color:${INK};max-width:900px;box-sizing:border-box}
.h1 em{display:inline-block;margin-top:6px;font-style:normal;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:128px;letter-spacing:-.03em;color:${LBLUE}}
.h2{display:inline-block;padding:22px 34px 24px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:62px;line-height:1.06;color:${INK}}
.h2 em{font-style:normal;color:${LGREEN}}
.row{flex-direction:column;margin-top:14px;padding:16px 30px 18px;max-width:880px;box-sizing:border-box;border-left:14px solid ${MOSS}}
.row b{display:block;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:44px;line-height:1.08;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:34px;line-height:1.14;color:#5D5675}
.row.bl{border-left-color:${LBLUE}}.row.gr{border-left-color:${LGREEN}}.row.lv{border-left-color:${LAV}}.row.or{border-left-color:#E08A3C}
.mega,.stat{display:flex;align-items:baseline;gap:22px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:14px;padding:4px 32px 12px;border-left:14px solid ${LBLUE}}
.mega b,.stat b{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-variant-numeric:tabular-nums;font-size:118px;line-height:1.05;letter-spacing:-.03em;color:${LBLUE}}
.stat b{font-size:96px}
.stat.gd{border-left-color:#D9A13B}.stat.gd b{color:#B9791C}
.mega.rd{border-left-color:#C8463A}.mega.rd b{color:#C8463A}
.mega small,.stat span{font-family:'Space Grotesk',Arial,sans-serif;font-weight:600;font-size:38px;color:#5D5675;max-width:420px;line-height:1.08}
.date{display:inline-block;margin-top:4px;padding:16px 32px 18px;border-left:14px solid ${LGREEN}}
.date b{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:78px;letter-spacing:-.02em;color:${LBLUE}}
.name{display:inline-block;margin-top:4px;padding:16px 34px 20px;border-left:14px solid ${LAV}}
.name small{display:block;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:28px;letter-spacing:.2em;color:#8A7FA6}
.name b{display:block;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:70px;line-height:1.02;color:${INK}}
.name span{display:block;margin-top:6px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:500;font-size:34px;color:#5D5675}
.stamp{display:inline-block;margin-top:18px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:36px;letter-spacing:.1em;color:#FFF8F0;background:#C8463A;padding:14px 28px 12px;border-radius:12px;transform:rotate(-2deg);box-shadow:0 12px 26px rgba(80,30,30,.35)}
.q{margin-top:18px;padding:22px 32px 24px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:600;font-size:42px;line-height:1.2;color:#FFF8F0;background:${INK};border-left:14px solid ${PEACH};border-radius:18px;max-width:880px;box-sizing:border-box}`;

for (const f of ["world3d.js", "geo.js", "RoomEnvironment.js"]) copyFileSync(f, `PROJECT/HyperFrames_Remotion/assets/lib/${f}`);
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP47_LESOTHO_NEGARA_DI_ATAS_AWAN",
  ep: "47", bg: BG, vig: 0.3, grain: 0.04, capfloor: 0.55, html, css, chipFont: MONO, chipColor: "#F3E9F7",
  chip: "ILUSTRASI &middot; TIDAK SESUAI SKALA",
  extraAt: ["s1:titik", "s1:rendahnya", "s1:seribu", "s1:meter", "s1:permukaan",
    "s2:Lesotho", "s2:Afrika", "s2:Seluruh", "s2:perbatasannya", "s2:Afrika#2", "s2:satu", "s2:Lesotho#2", "s2:dikelilingi",
    "s3:tiga", "s3:Vatikan", "s3:San", "s3:Italia", "s3:Lesotho", "s3:terbesar", "s3:Eropa",
    "s4:Luasnya", "s4:tiga", "s4:kilometer", "s4:seluruh", "s4:seribu", "s4:Lebih", "s4:delapan", "s4:seribu#2", "s4:meter#2",
    "s5:Kerajaan", "s5:gunung", "s5:Sekitar", "s5:Raja", "s5:Basotho", "s5:membawa", "s5:puncak", "s5:serangan",
    "s6:Pemukim", "s6:mendesak", "s6:1868", "s6:perlindungan", "s6:Setahun", "s6:perjanjian", "s6:Boer", "s6:memotong", "s6:separuh",
    "s7:Empat", "s7:1966", "s7:merdeka", "s7:Kini", "s7:air", "s7:selimut", "s7:Basotho",
    "s8:Kerajaan", "s8:awan", "s8:tengah", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.3,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.55,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.32,ease:'power2.in'},b-.32)`,
  // cloud wipe hides the cuts between stations (see CUTS in world3d.js)
  hud: `(t)=>{const C=[K.s2,K.s3,K.s4,K.s6,K.s7];let o=0;for(const c of C){o=Math.max(o,1-Math.abs(t-(c-0.1))/0.32);}q('#cw').style.opacity=(0.92*Math.max(0,o)).toFixed(3);}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:60px;line-height:1.16;color:#FFFFFF;text-shadow:0 3px 0 #2B2540,0 0 22px rgba(30,20,50,.95),0 0 6px rgba(30,20,50,1),0 0 2px #2B2540}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"#FFD36E",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lesotho Negara di Atas Awan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
