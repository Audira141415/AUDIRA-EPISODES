// EP43 GIMLI GLIDER 1983: PAPERWORLD. A folded-paper Boeing 767 among hung paper clouds, a paper studio table
// (map board, cutaway fuel tank, dripstick, calculator tape 1,77 vs 0,803), then the glide and the landing on the
// Gimli drag strip. Batch-9 signature: a paper RIPPLE strip above the captions. The trigger chip "1,77" sends out
// paper rings each time a new consequence card unfolds (pon != kg -> < 1/2 tangki -> 2 mesin mati -> 17 menit
// melayang -> mendarat di sirkuit). Cut changes hide under a sliding paper sheet.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#3A2E26", CORAL = "#E8735A", MINT = "#5DB28C", GOLD = "#E8B64A", COBALT = "#2F5DA8", PAPER = "#FBF6EA", BG = "#EADFC8";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const ICON = {
  lb: `<text x="32" y="30" font-family="Baloo 2,Arial" font-weight="800" font-size="22" text-anchor="middle" fill="${INK}">lb</text><path d="M14 38h36M14 44h36" stroke="${CORAL}" stroke-width="4"/><path d="M42 33L22 49" stroke="${CORAL}" stroke-width="4"/><text x="32" y="62" font-family="Baloo 2,Arial" font-weight="800" font-size="20" text-anchor="middle" fill="${INK}">kg</text>`,
  tank: `<rect x="16" y="8" width="32" height="48" rx="8" fill="#FBF6EA" stroke="${INK}" stroke-width="4"/><rect x="18" y="35" width="28" height="19" rx="5" fill="#6FA8D6"/><path d="M12 32h40" stroke="${CORAL}" stroke-width="3" stroke-dasharray="5 4"/><text x="56" y="30" font-family="Baloo 2,Arial" font-weight="800" font-size="14" fill="${CORAL}">½</text>`,
  engine: `<ellipse cx="32" cy="32" rx="22" ry="18" fill="${COBALT}" stroke="${INK}" stroke-width="4"/><circle cx="32" cy="32" r="10" fill="#2c2c33"/><path d="M14 14l36 36M50 14L14 50" stroke="${CORAL}" stroke-width="6" stroke-linecap="round"/>`,
  glider: `<path d="M6 34L58 16 30 44z" fill="#FFFDF8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M30 44l-2-12 30-16" fill="none" stroke="${CORAL}" stroke-width="3" stroke-dasharray="4 3"/><path d="M8 52c10-4 22-4 34 0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-dasharray="3 4"/>`,
  flag: `<path d="M14 8v50" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><g transform="translate(16 10)"><rect width="36" height="26" fill="#FBF6EA" stroke="${INK}" stroke-width="3"/><rect width="9" height="9" fill="${INK}"/><rect x="18" width="9" height="9" fill="${INK}"/><rect x="9" y="9" width="9" height="8" fill="${INK}"/><rect x="27" y="9" width="9" height="8" fill="${INK}"/><rect y="17" width="9" height="9" fill="${INK}"/><rect x="18" y="17" width="9" height="9" fill="${INK}"/></g>`,
};
const tok = (id, ic, label, a) => `<div class="tk" id="${id}" data-at="${a}" data-fx="tok"><div class="ic"><svg viewBox="0 0 64 64">${ICON[ic]}</svg></div><div class="tl">${label}</div><i class="fd"></i></div>`;
const lk = (a) => `<div class="lk" data-at="${a}" data-fx="grow"></div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@700;800&family=Patrick+Hand&display=block">
<div class="pre"><span style="font-family:'Baloo 2',sans-serif;font-weight:800">GIMLI 1,77</span><span style="font-family:'Baloo 2',sans-serif;font-weight:700">A</span><span style="font-family:'Nunito',sans-serif;font-weight:800">A</span><span style="font-family:'Nunito',sans-serif;font-weight:700">A</span><span style="font-family:'Patrick Hand',cursive">A</span></div>
<div id="alarm"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Juli">
  ${kk("EP 43", "FAKTA SEJARAH NEGARA")}
  <div class="h1"><span class="ln">JET KEHABISAN</span><span class="ln b2">BAHAN BAKAR!</span></div>
  <div class="chips"><i class="ch" data-at="s1:kilometer" data-fx="stampc">12 KM DI ATAS KANADA</i></div>
  <div class="chips"><i class="ch3" data-at="s1:angka" data-fx="stampc">GARA-GARA 1 ANGKA</i><i class="ch2" data-at="s1:salah" data-fx="stampc">SALAH SATUAN</i></div>
</div>
<div class="p" data-in="s2:Juli" data-out="s3">
  ${kk("01", "JULI 1983 · KANADA")}
  ${row("PON → KILOGRAM", "Kanada sedang beralih ke satuan metrik", "s2:beralih", "co")}
  ${row("BOEING 767 BARU", "pesawat pertama Air Canada yang memakai kilogram", "s2:Boeing")}
</div>
<div class="p" data-in="s3" data-out="s3:Untuk">
  ${kk("02", "ALAT UKUR RUSAK")}
  ${row("PENGUKUR BAHAN BAKAR RUSAK", "", "s3:rusak", "rd")}
  ${row("DIUKUR MANUAL", "pakai tongkat celup (dripstick)", "s3:tongkat", "co")}
</div>
<div class="p" data-in="s3:Untuk" data-out="s4">
  ${kk("03", "LITER → KILOGRAM")}
  <div class="vs">
    <div class="cd mm" data-at="s3:satu" data-fx="card"><b>× 1,77</b><span>angka untuk <u>pon</u> per liter</span><i class="st" data-at="s3:pon" data-fx="stampc">SALAH</i></div>
    <div class="cd ff" data-at="s3:pon" data-fx="card"><b>× 0,803</b><span>angka untuk kilogram per liter</span><i class="st ok" data-at="s3:pon+0.5" data-fx="stampc">BENAR</i></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Komputer">
  ${kk("04", "HASILNYA")}
  <div class="cd big" data-at="s4:dua" data-fx="card"><b><span class="ct nb" data-from="0" data-to="22300" data-a="s4:dua" data-d="1.6">22.300</span> kg</b><span>bahan bakar yang dibutuhkan</span></div>
  ${row("TERISI: KURANG DARI SEPARUH", "±10.100 kg (yang terisi 22.300 pon)", "s4:kurang", "rd")}
</div>
<div class="p" data-in="s4:Komputer" data-out="s5">
  ${kk("04", "KOMPUTER PESAWAT")}
  ${row("“TANGKI CUKUP” ✓", "komputer tetap percaya angka yang salah", "s4:percaya", "gn")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("05", "DI ATAS ONTARIO · 12 KM")}
  ${row("ALARM BERBUNYI", "", "s5:alarm", "rd")}
  ${row("2 MESIN MATI", "kiri, lalu kanan · layar kokpit padam", "s5:kiri", "rd")}
  ${row("<span class=\"ct nb\" data-from=\"0\" data-to=\"61\" data-a=\"s5:Enam\" data-d=\"0.9\">61</span> PENUMPANG", "di dalam jet tanpa mesin", "s5:Enam", "co")}
</div>
<div class="p" data-in="s6" data-out="s6:Ternyata">
  ${kk("06", "PESAWAT LAYANG")}
  ${row("KAPTEN BOB PEARSON", "juga pilot pesawat layang (glider)", "s6:Kapten", "co")}
  ${row("±<span class=\"ct nb\" data-from=\"0\" data-to=\"17\" data-a=\"s6:tujuh\" data-d=\"0.8\">17</span> MENIT MELAYANG", "tanpa mesin", "s6:tujuh", "gn")}
  ${row("KOPILOT MAURICE QUINTAL", "ingat bekas pangkalan udara di Gimli", "s6:Maurice")}
</div>
<div class="p" data-in="s6:Ternyata" data-out="s7">
  ${kk("06", "GIMLI · MANITOBA")}
  ${row("LANDASAN → SIRKUIT BALAP", "bekas pangkalan udara", "s6:sirkuit", "co")}
  ${row("SORE ITU: ADA LOMBA", "", "s6:lomba", "rd")}
</div>
<div class="p" data-in="s7" data-out="s7:Pesawat">
  ${kk("07", "PENDARATAN")}
  ${row("DIMIRINGKAN", "manuver pesawat layang untuk membuang ketinggian", "s7:memiringkan", "co")}
  ${row("RODA DEPAN TIDAK TERKUNCI", "hidung menyeret landasan, ikut mengerem", "s7:Roda", "rd")}
</div>
<div class="p" data-in="s7:Pesawat" data-out="s8">
  ${kk("07", "BERHENTI DI LANDASAN")}
  ${row("TIDAK ADA YANG TERLUKA PARAH", "", "s7:Tidak", "gn")}
</div>
<div class="p" data-in="s8" data-out="s8:Satu">
  ${kk("08", "JULUKANNYA")}
  <div class="ban" data-at="s8:Gimli" data-fx="stampc">GIMLI GLIDER</div>
  ${row("TERBANG LAGI SAMPAI 2008", "", "s8:2008", "gn")}
</div>
<div class="p" data-in="s8:Satu" data-out="s8:Menurut">
  ${kk("08", "SATU SATUAN TERTUKAR")}
  ${row("HAMPIR MENJATUHKAN PESAWAT", "pon dikira kilogram", "s8:hampir", "rd")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Pernah salah satuan bikin masalah di sekitarmu? Tulis di komentar!</div>
</div>
<div id="rip" data-at="s3:koma" data-fx="fade">
  <i class="rg"></i><i class="rg"></i><i class="rg"></i>
  <div class="row6">
    <div class="trig" data-at="s3:koma" data-fx="tok"><b>1,77</b><span>pon/liter</span></div>
    ${lk("s3:pon")}
    ${tok("t1", "lb", "PON ≠ KG", "s3:pon")}
    ${lk("s4:separuhnya")}
    ${tok("t2", "tank", "&lt; ½ TANGKI", "s4:separuhnya")}
    ${lk("s5:kanan")}
    ${tok("t3", "engine", "2 MESIN MATI", "s5:kanan")}
    ${lk("s6:menit")}
    ${tok("t4", "glider", "±17 MENIT LAYANG", "s6:menit")}
    ${lk("s7:berhenti")}
    ${tok("t5", "flag", "MENDARAT DI SIRKUIT", "s7:berhenti")}
  </div>
</div>
<div id="wipe"></div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:${PAPER};border-radius:12px;box-shadow:0 3px 0 #E0D3B8,0 16px 26px rgba(60,40,20,.24)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'Nunito',Arial,sans-serif;font-weight:800;font-size:28px;letter-spacing:.08em;color:${INK};margin-bottom:16px;padding:6px 18px 6px 6px;background:${PAPER};border-radius:10px;box-shadow:0 3px 0 #E0D3B8,0 10px 18px rgba(60,40,20,.2);transform:rotate(-1.2deg)}
.kk i{font-style:normal;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;letter-spacing:.03em;background:${CORAL};color:#FFF8EE;padding:0 12px;border-radius:7px}
.h1{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.h1 .ln{font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:104px;line-height:1.02;color:${INK};background:${PAPER};padding:6px 26px 0;border-radius:10px;box-shadow:0 4px 0 #E0D3B8,0 18px 30px rgba(60,40,20,.28);transform:rotate(-1.5deg)}
.h1 .b2{background:${CORAL};color:#FFF8EE;box-shadow:0 4px 0 #B9533E,0 18px 30px rgba(60,40,20,.3);transform:rotate(1.2deg);margin-left:24px}
.chips{display:flex;gap:14px;margin-top:16px}
.ch,.ch2,.ch3{font-style:normal;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:40px;line-height:1;padding:12px 20px 6px;border-radius:9px;box-shadow:0 3px 0 rgba(0,0,0,.12),0 10px 18px rgba(60,40,20,.22)}
.ch{background:${COBALT};color:#FFF8EE;transform:rotate(1deg)}
.ch3{background:${PAPER};color:${INK};transform:rotate(-1.5deg)}
.ch2{background:${GOLD};color:${INK};transform:rotate(2deg);border:4px dashed ${INK}}
.ban{display:inline-block;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:96px;line-height:1;color:${INK};background:${GOLD};padding:16px 30px 4px;border-radius:12px;box-shadow:0 4px 0 #B8892F,0 18px 30px rgba(60,40,20,.28);transform:rotate(-2deg);margin-bottom:6px}
.row{flex-direction:column;margin-top:16px;padding:12px 26px 14px 30px;border-left:16px solid ${GOLD};max-width:880px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:54px;line-height:1.02;color:${INK}}
.row span{display:block;font-family:'Nunito',Arial,sans-serif;font-weight:700;font-size:31px;line-height:1.2;color:#6A5A4C;max-width:800px}
.row b span{display:inline;font:inherit;color:inherit}
.row.rd{border-left-color:${CORAL}}.row.rd b{color:#C4513A}
.row.co{border-left-color:${COBALT}}.row.gn{border-left-color:${MINT}}.row.gn b{color:#2F7F5C}
.big{display:flex;flex-direction:column;padding:12px 28px 14px 30px;border-left:16px solid ${CORAL};width:max-content;margin-top:4px}
.big b{font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:110px;line-height:1;color:${INK}}
.big b span{font:inherit}
.big>span{font-family:'Nunito',Arial,sans-serif;font-weight:700;font-size:32px;color:#6A5A4C}
.vs{display:flex;gap:24px;align-items:stretch;margin-top:6px}
.mm,.ff{display:flex;flex-direction:column;padding:14px 22px 16px;width:410px;box-sizing:border-box}
.mm b,.ff b{display:block;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:86px;line-height:1;color:${INK}}
.mm span,.ff span{display:block;font-family:'Nunito',Arial,sans-serif;font-weight:700;font-size:30px;line-height:1.18;color:#6A5A4C}
.mm{border-top:14px solid ${CORAL}}.ff{border-top:14px solid ${MINT}}
.mm b{color:#C4513A}.ff b{color:#2F7F5C}
.st{position:absolute;right:-14px;top:-30px;font-style:normal;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:46px;line-height:1;color:#FFF8EE;background:${CORAL};border-radius:9px;padding:10px 16px 2px;transform:rotate(6deg);box-shadow:0 8px 14px rgba(60,40,20,.25)}
.st.ok{background:${MINT}}
.q{margin-top:20px;padding:20px 28px 18px;font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:58px;line-height:1.08;color:${INK};border-left:16px solid ${CORAL};max-width:880px}
#alarm{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:0;box-shadow:inset 0 0 160px 40px rgba(232,80,60,.75)}
#rip{position:absolute;left:58px;top:1112px;width:920px;height:150px;z-index:10}
#rip .rg{position:absolute;left:62px;top:84px;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;border:5px solid ${CORAL};opacity:0;box-sizing:border-box}
#rip .rg:nth-child(2){border-color:${GOLD}}#rip .rg:nth-child(3){border-color:${COBALT}}
#rip .row6{position:absolute;left:0;bottom:0;display:flex;align-items:center}
.trig{position:relative;width:124px;height:124px;border-radius:50%;background:${CORAL};box-shadow:0 4px 0 #B9533E,0 12px 20px rgba(60,40,20,.3);display:flex;flex-direction:column;align-items:center;justify-content:center}
.trig b{font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:46px;line-height:.9;color:#FFF8EE}
.trig span{font-family:'Nunito',Arial,sans-serif;font-weight:800;font-size:19px;color:#FFE9DC}
.tk{position:relative;width:130px;height:118px;box-sizing:border-box;background:${PAPER};border-radius:12px;box-shadow:0 3px 0 #E0D3B8,0 12px 20px rgba(60,40,20,.25);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow:hidden}
.tk .ic{width:58px;height:58px;margin-top:6px}.tk .ic svg{width:58px;height:58px;display:block}
.tk .tl{font-family:'Baloo 2',Arial,sans-serif;font-weight:800;font-size:22px;line-height:.98;color:${INK};text-align:center;width:118px}
.tk .fd{position:absolute;right:0;top:0;width:26px;height:26px;background:linear-gradient(225deg,${BG} 0 50%,#E2D4B8 50% 100%);box-shadow:-2px 2px 3px rgba(60,40,20,.2)}
.lk{width:20px;height:6px;background:repeating-linear-gradient(90deg,${INK} 0 6px,rgba(0,0,0,0) 6px 10px);transform-origin:0 50%;margin:0 2px}
#wipe{position:absolute;left:0;top:0;width:1500px;height:1920px;z-index:15;pointer-events:none;background:#F3E9D6 url(assets/img/grain.png);transform:translateX(1700px);clip-path:polygon(4% 0,1% 6%,5% 12%,2% 19%,6% 26%,1% 33%,4% 41%,0 49%,5% 57%,2% 64%,6% 72%,1% 80%,4% 88%,2% 95%,5% 100%,100% 100%,100% 0);box-shadow:none}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP43_GIMLI_GLIDER_1983",
  ep: "43", bg: BG, vig: 0.24, grain: 0.05, capfloor: 0.0, html, css, chipFont: `'Nunito',Arial,sans-serif`, chipColor: INK,
  chip: "ILUSTRASI KERTAS &middot; BUKAN CUPLIKAN ASLI",
  extraAt: ["s1:Penyebabnya", "s1:bakar", "s1:kehabisan", "s1:kilometer", "s2:1983", "s2:Air", "s2:Kanada", "s2:kilogram#2", "s2:pertamanya",
    "s3:Untuk", "s3:celup", "s3:koma", "s3:liter", "s3:pon", "s3:rusak", "s3:satu", "s3:tangki", "s3:tongkat", "s3:tujuh#2", "s3:tujuh",
    "s4:Komputer", "s4:cukup", "s4:dua", "s4:kilogram", "s4:kurang", "s4:membawa", "s4:separuhnya",
    "s5:Enam", "s5:Layar", "s5:alarm", "s5:kanan", "s5:kiri", "s5:padam",
    "s6:Gimli", "s6:balap", "s6:kopilot", "s6:layang", "s6:lomba", "s6:melayangkan", "s6:menit", "s6:sirkuit",
    "s7:Roda", "s7:Tidak", "s7:berhenti", "s7:hidung", "s7:ketinggian", "s7:membuang", "s7:mengerem", "s7:menyeret", "s7:terkunci",
    "s8:Gimli", "s8:Menurut", "s8:Satu", "s8:menjatuhkan", "s8:terbang", "s8:tertukar", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,y:-26,rotationX:-70,transformPerspective:900,transformOrigin:'50% 0%'},{opacity:1,y:0,rotationX:0,duration:.42,ease:'back.out(1.5)',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},
 tok:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t-.01);tl.fromTo(e,{opacity:0,rotationY:-90,transformPerspective:700,transformOrigin:'0% 50%'},{opacity:1,rotationY:0,duration:.45,ease:'back.out(1.6)',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-40,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.38,ease:'back.out(1.3)'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:70,rotation:1.5,duration:.22,ease:'power2.in'},b-.24)`,
  hud: `(()=>{const W=q('#wipe'),AL=q('#alarm'),R=[...document.querySelectorAll('#rip .rg')],TK=[...document.querySelectorAll('#rip .tk,#rip .trig')];
const cuts=[K.s2,K.s3,K.s5,AT['s8:Satu']];const pulses=[AT['s3:koma'],AT['s3:pon'],AT['s4:separuhnya'],AT['s5:kanan'],AT['s6:menit'],AT['s7:berhenti'],AT['s8:Satu']];
const wave=AT['s8:Satu'];
return (t)=>{let x=1700;for(const c of cuts){const u=(t-(c-0.38))/0.8;if(u>=0&&u<=1){const e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;x=1180-e*2900;}}W.style.transform='translateX('+x+'px)';
let a=0;if(t>AT['s5:alarm']-0.1&&t<K.s6-0.3){a=(Math.sin((t-AT['s5:alarm'])*9)>0?0.85:0.25)*Math.min(1,(K.s6-0.3-t)/0.5);}AL.style.opacity=a;
let tp=-99;for(const p of pulses)if(p<=t)tp=p;R.forEach((r,i)=>{const ph=(t-tp-i*0.16)/1.3;if(ph<0||ph>1){r.style.opacity=0;return;}const s=1+ph*(tp===wave?8.5:6.5);r.style.opacity=(1-ph)*0.8;r.style.transform='scale('+s+')';});
TK.forEach((k,i)=>{const d=t-(wave+i*0.09);k.style.translate=(d>0&&d<0.32)?'0 '+(-Math.sin(d/0.32*Math.PI)*20).toFixed(1)+'px':'0 0';});};})()`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Baloo 2','Arial Rounded MT Bold',sans-serif;font-weight:800;font-size:70px;line-height:1.06;color:#FFFDF6;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:0 6px 0 ${INK}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFDF6"},{color:"#FFC94D",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFDF6",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.22,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Gimli Glider 1983", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
