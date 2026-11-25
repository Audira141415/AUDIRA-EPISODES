// EP34 KUCING PARASUT SARAWAK: TOONFORGE. A cel-shaded toon Borneo: striped parachutes carrying cat crates over a
// longhouse village, a Borneo map board, DDT spraying, the gecko "chain" marked unproven, rats in the paddy and the
// RAF drop. Batch-7 signature: a manga-style chain strip (DDT -> serangga -> cicak? -> kucing -> tikus -> kucing terjun)
// that grows link by link above the captions. Panels are comic cards with hard ink shadows.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1A1626", RED = "#E8394A", YEL = "#FFD43B", ORA = "#FF8A3D", CYA = "#2FA8EE", GRN = "#3DB665", BG = "#7FD3FF";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;

const ICON = {
  spray: `<rect x="18" y="20" width="22" height="36" rx="5" fill="#9FB3C4" stroke="${INK}" stroke-width="4"/><rect x="22" y="12" width="12" height="9" fill="#5D6B78" stroke="${INK}" stroke-width="4"/><path d="M34 15h10" stroke="${INK}" stroke-width="4"/><circle cx="50" cy="10" r="3" fill="${CYA}"/><circle cx="55" cy="17" r="3" fill="${CYA}"/><circle cx="51" cy="24" r="3" fill="${CYA}"/><text x="29" y="44" font-family="Bangers,Impact" font-size="11" text-anchor="middle" fill="${INK}">DDT</text>`,
  bug: `<ellipse cx="32" cy="36" rx="13" ry="17" fill="#8A5530" stroke="${INK}" stroke-width="4"/><circle cx="32" cy="16" r="7" fill="#8A5530" stroke="${INK}" stroke-width="4"/><path d="M19 28l-10-6M19 38H7M20 47l-9 7M45 28l10-6M45 38h12M44 47l9 7M28 10l-5-7M36 10l5-7" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M32 22v30" stroke="${INK}" stroke-width="3"/>`,
  gecko: `<path d="M14 44c4-14 16-22 30-20 8 1 12 6 12 10" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M14 44c4-14 16-22 30-20 8 1 12 6 12 10" fill="none" stroke="#C8D68A" stroke-width="7" stroke-linecap="round"/><path d="M14 44c-4 6-2 12 6 14" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M24 30l-6-8M38 24l2-9M26 40l-8 6M44 30l8 4" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="53" cy="31" r="2.5" fill="${INK}"/>`,
  cat: `<path d="M12 26L16 6l13 12h6l13-12 4 20" fill="#F59A3C" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="32" cy="36" rx="22" ry="19" fill="#F59A3C" stroke="${INK}" stroke-width="4"/><ellipse cx="24" cy="34" rx="3.5" ry="5" fill="${INK}"/><ellipse cx="40" cy="34" rx="3.5" ry="5" fill="${INK}"/><path d="M29 43l3 3 3-3" fill="#FF9AAE" stroke="${INK}" stroke-width="2.5"/><path d="M8 40h12M8 46l12-3M56 40H44M56 46l-12-3" stroke="${INK}" stroke-width="2"/>`,
  rat: `<path d="M8 50c10 8 24 6 26-2" fill="none" stroke="#F2A0B0" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="38" rx="18" ry="12" fill="#857F8E" stroke="${INK}" stroke-width="4"/><path d="M48 30l12 8-12 6" fill="#857F8E" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="44" cy="26" r="6" fill="#F2A0B0" stroke="${INK}" stroke-width="3"/><circle cx="53" cy="35" r="2.2" fill="${INK}"/>`,
  chute: `<path d="M8 26C8 10 56 10 56 26z" fill="${ORA}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M24 26c0-10 16-10 16 0" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M10 26l14 20M54 26L40 46M32 26v20" stroke="${INK}" stroke-width="2.5"/><rect x="22" y="44" width="20" height="15" rx="2" fill="#D59A5A" stroke="${INK}" stroke-width="4"/><path d="M26 44l3-6 3 6M34 44l3-6 3 6" fill="#F59A3C" stroke="${INK}" stroke-width="2"/>`,
};
const tok = (id, ic, label, a, extra = "", cls = "") => `<div class="tk ${cls}" id="${id}" data-at="${a}" data-fx="tok"><div class="ic"><svg viewBox="0 0 64 64">${ICON[ic]}</svg></div><div class="tl">${label}</div>${extra}</div>`;
const lk = (a, cls = "") => `<div class="lk ${cls}" data-at="${a}" data-fx="grow"></div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=Lilita+One&family=Barlow+Condensed:wght@600;700&display=block">
<div class="pre"><span style="font-family:'Bangers',sans-serif">KUCING 1960</span><span style="font-family:'Lilita One',sans-serif">kucing</span><span style="font-family:'Barlow Condensed',sans-serif;font-weight:700">A 1</span><span style="font-family:'Barlow Condensed',sans-serif;font-weight:600">A 1</span></div>
<div id="speed"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Tempatnya">
  ${kk("EP 34", "FAKTA SEJARAH NEGARA")}
  <div class="h1"><span class="ln">KUCING</span><span class="ln b2">TERJUN PARASUT!</span></div>
  <div class="chips"><i class="ch" data-at="s1:1960" data-fx="stampc">SARAWAK · BORNEO · 1960</i></div>
  <div class="chips"><i class="ch2" data-at="s1:Angkatan" data-fx="stampc">RAF · ANGKATAN UDARA INGGRIS</i></div>
  <div class="chips"><i class="ch3" data-at="s1:lelucon" data-fx="stampc">BUKAN LELUCON!</i></div>
</div>
<div class="p" data-in="s2:Tempatnya" data-out="s3">
  ${kk("01", "DI MANA?")}
  ${row("SARAWAK", "bagian utara Pulau Kalimantan (Borneo)", "s2:Sarawak", "or")}
  ${row("KINI: MALAYSIA", "berbatasan langsung dengan Kalimantan Barat (Indonesia)", "s2:Malaysia")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "1950-AN · LAWAN MALARIA")}
  ${row("DDT &amp; INSEKTISIDA LAIN", "disemprotkan di Borneo", "s3:DDT")}
  ${row("SASARAN: NYAMUK", "pembawa malaria", "s3:membasmi", "cy")}
</div>
<div class="p" data-in="s4" data-out="s4:Kemungkinan">
  ${kk("03", "EFEK SAMPING")}
  ${row("KUCING KAMPUNG IKUT MATI", "", "s4:mati", "rd")}
  ${row("VERSI YANG SERING DICERITAKAN", "racun: serangga → cicak → kucing", "s4:racunnya")}
</div>
<div class="p" data-in="s4:Kemungkinan" data-out="s5">
  ${kk("03", "KEMUNGKINAN LAIN")}
  ${row("KONTAK LANGSUNG", "kucing kena dinding yang disemprot, lalu menjilati bulunya", "s4:langsung", "cy")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "1960 · WABAH TIKUS")}
  ${row("TANPA KUCING", "tikus berkembang biak", "s5:tikus")}
  ${row("TANAMAN WARGA RUSAK", "", "s5:merusak", "rd")}
</div>
<div class="p" data-in="s6" data-out="s6:dimasukkan">
  ${kk("05", "RAF · 1960")}
  <div class="ban" data-at="s6:Operation" data-fx="stampc">OPERATION CAT DROP</div>
  ${row("DARI SINGAPURA", "kucing diterbangkan ke Sarawak", "s6:Singapura")}
</div>
<div class="p" data-in="s6:dimasukkan" data-out="s7">
  ${kk("05", "OPERATION CAT DROP")}
  ${row("PETI + PARASUT", "dijatuhkan ke daerah terpencil", "s6:dijatuhkan", "or")}
  ${row("+ PERLENGKAPAN &amp; PERBEKALAN", "", "s6:bersama")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "BERAPA EKOR?")}
  <div class="vs">
    <div class="cd mm" data-at="s7:empat" data-fx="card"><b>14.000 KUCING?</b><span>versi yang beredar</span><i class="st" data-at="s7:mitos" data-fx="stampc">MITOS</i></div>
    <div class="cd ff" data-at="s7:dua" data-fx="card"><b><span class="ct" data-from="0" data-to="23" data-a="s7:dua" data-d="0.35">23</span> KUCING</b><span>menurut koran saat itu (1960)</span></div>
  </div>
  ${row("DILAPORKAN BERHASIL", "", "s7:berhasil", "gn")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "RANTAI SEBAB-AKIBAT")}
  ${row("SATU MATA RANTAI DISENTUH", "seluruh rantai ikut bergerak", "s8:Satu", "or")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Kucing parasut: solusi cerdas, atau tambal sulam? Tulis di komentar!</div>
</div>
<div id="chain" data-at="s3:DDT" data-fx="fade">
  <svg class="arc" viewBox="0 0 900 90" data-at="s4:langsung" data-fx="fade"><path d="M64 86 C 64 4, 490 4, 490 86" fill="none" stroke="${INK}" stroke-width="12" stroke-dasharray="20 14" stroke-linecap="round"/><path d="M64 86 C 64 4, 490 4, 490 86" fill="none" stroke="${CYA}" stroke-width="6" stroke-dasharray="20 14" stroke-linecap="round"/><path d="M476 66l14 22 14-22z" fill="${CYA}" stroke="${INK}" stroke-width="4"/><rect x="190" y="2" width="160" height="40" rx="8" fill="${CYA}" stroke="${INK}" stroke-width="5"/><text x="270" y="32" font-family="Bangers,Impact" font-size="30" text-anchor="middle" fill="#fff">LANGSUNG?</text></svg>
  <div class="row6">
    ${tok("t1", "spray", "DDT", "s3:DDT", `<i class="pz" data-at="s8:Semprot" data-fx="puls"></i>`)}
    ${lk("s4:serangga")}
    ${tok("t2", "bug", "SERANGGA", "s4:serangga", `<i class="pz" data-at="s8:nyamuk" data-fx="puls"></i>`)}
    ${lk("s4:cicak", "dash")}
    ${tok("t3", "gecko", "CICAK?", "s4:cicak", `<i class="qm">?</i><i class="bt" data-at="s4:belum" data-fx="stampc">BELUM TERBUKTI</i>`, "unsure")}
    ${lk("s4:kucing", "dash")}
    ${tok("t4", "cat", "KUCING", "s4:kucing", `<i class="mx" data-at="s4:memakannya" data-fx="stampc">MATI</i><i class="pz" data-at="s8:mati" data-fx="puls"></i>`)}
    ${lk("s5:tikus")}
    ${tok("t5", "rat", "TIKUS ↑", "s5:tikus", `<i class="pz" data-at="s8:datang" data-fx="puls"></i>`)}
    ${lk("s6:parasut")}
    ${tok("t6", "chute", "KUCING TERJUN", "s6:parasut", `<i class="pz" data-at="s8:terjun" data-fx="puls"></i>`, "hero")}
  </div>
  <div class="wave" data-at="s8:seluruh" data-fx="wave"></div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
#speed{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:repeating-conic-gradient(from 3deg at 50% 52%,rgba(255,255,255,0) 0deg 4deg,rgba(255,255,255,.85) 4deg 4.7deg);-webkit-mask-image:radial-gradient(ellipse at 50% 52%,rgba(0,0,0,0) 34%,rgba(0,0,0,1) 70%);mask-image:radial-gradient(ellipse at 50% 52%,rgba(0,0,0,0) 34%,rgba(0,0,0,1) 70%)}
.cd{position:relative;background:#FFFDF6;border:5px solid ${INK};border-radius:14px;box-shadow:8px 8px 0 ${INK}}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:30px;letter-spacing:.06em;color:#fff;margin-bottom:16px;padding:6px 18px 6px 6px;background:${INK};border-radius:10px;transform:rotate(-1.5deg)}
.kk i{font-style:normal;font-family:'Bangers',Impact,sans-serif;font-weight:400;letter-spacing:.05em;background:${YEL};color:${INK};padding:2px 12px;border-radius:6px}
.h1{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.h1 .ln{font-family:'Bangers',Impact,sans-serif;font-weight:400;font-size:128px;line-height:.95;letter-spacing:.03em;color:#fff;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:8px 8px 0 ${INK}}
.h1 .b2{font-size:96px;color:${YEL};background:${RED};-webkit-text-stroke:10px ${INK};padding:8px 22px 2px;border:6px solid ${INK};border-radius:12px;transform:rotate(-3deg);box-shadow:10px 10px 0 ${INK};text-shadow:none}
.chips{display:flex;margin-top:18px}
.ch,.ch2,.ch3{font-style:normal;font-family:'Bangers',Impact,sans-serif;font-weight:400;font-size:46px;line-height:1;letter-spacing:.05em;padding:10px 20px 6px;border:5px solid ${INK};border-radius:10px;box-shadow:6px 6px 0 ${INK}}
.ch{background:#fff;color:${INK};transform:rotate(1.5deg)}
.ch2{background:${CYA};color:#fff;-webkit-text-stroke:2px ${INK};transform:rotate(-1deg)}
.ch3{background:${YEL};color:${RED};font-size:64px;-webkit-text-stroke:2px ${INK};transform:rotate(-4deg)}
.ban{display:inline-block;font-family:'Bangers',Impact,sans-serif;font-size:88px;line-height:1;letter-spacing:.04em;color:#fff;background:${RED};-webkit-text-stroke:3px ${INK};padding:12px 26px 4px;border:6px solid ${INK};border-radius:12px;box-shadow:10px 10px 0 ${INK};transform:rotate(-2.5deg);margin-bottom:6px}
.row{flex-direction:column;margin-top:18px;padding:10px 24px 12px;border-left:18px solid ${YEL};max-width:880px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Lilita One','Arial Black',sans-serif;font-weight:400;font-size:52px;line-height:1.05;color:${INK}}
.row span{display:block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:32px;line-height:1.2;color:#4A4458;max-width:800px}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}
.row.or{border-left-color:${ORA}}.row.cy{border-left-color:${CYA}}.row.gn{border-left-color:${GRN}}.row.gn b{color:#1E8A43}
.vs{display:flex;gap:22px;align-items:stretch;margin-top:6px}
.mm,.ff{flex-direction:column;padding:12px 20px 14px;width:400px;box-sizing:border-box}
.mm b,.ff b{display:block;font-family:'Lilita One','Arial Black',sans-serif;font-weight:400;font-size:50px;line-height:1.05;color:${INK}}
.mm span,.ff span{display:block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:30px;line-height:1.15;color:#4A4458}
.ff{background:${YEL}}.ff b span{display:inline;font:inherit;color:inherit}
.mm b{color:#8A8496;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:${RED}}
.st{position:absolute;right:-18px;top:-26px;font-style:normal;font-family:'Bangers',Impact,sans-serif;font-size:64px;line-height:1;color:#fff;background:${RED};border:5px solid ${INK};border-radius:10px;padding:8px 16px 2px;box-shadow:6px 6px 0 ${INK}}
.q{margin-top:20px;padding:18px 26px 16px;font-family:'Lilita One','Arial Black',sans-serif;font-size:58px;line-height:1.08;color:${INK};border-left:18px solid ${RED};max-width:880px}
#chain{position:absolute;left:52px;top:1120px;width:920px;height:146px;z-index:10}
#chain .arc{position:absolute;left:0;top:-36px;width:861px;height:86px}
#chain .row6{position:absolute;left:0;bottom:0;display:flex;align-items:center}
.tk{position:relative;width:110px;height:100px;box-sizing:border-box;background:#FFFDF6;border:5px solid ${INK};border-radius:16px;box-shadow:6px 6px 0 ${INK};display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.tk .ic{width:54px;height:54px;margin-top:3px}.tk .ic svg{width:54px;height:54px;display:block}
.tk .tl{font-family:'Bangers',Impact,sans-serif;font-size:21px;line-height:.92;letter-spacing:.03em;color:${INK};text-align:center;width:104px}
.tk.unsure{border-style:dashed;background:#F1F4FA}
.tk.hero{background:${YEL}}
.tk .qm{position:absolute;right:-14px;top:-22px;font-style:normal;font-family:'Bangers',Impact,sans-serif;font-size:50px;line-height:1;color:${YEL};-webkit-text-stroke:3px ${INK};paint-order:stroke fill}
.tk .bt{position:absolute;left:-14px;top:-44px;white-space:nowrap;font-style:normal;font-family:'Bangers',Impact,sans-serif;font-size:28px;line-height:1;color:#fff;background:${RED};border:4px solid ${INK};border-radius:8px;padding:5px 9px 1px;transform:rotate(-4deg)}
.tk .mx{position:absolute;right:-12px;top:-20px;font-style:normal;font-family:'Bangers',Impact,sans-serif;font-size:26px;line-height:1;color:#fff;background:${RED};border:4px solid ${INK};border-radius:8px;padding:4px 8px 0}
.tk .pz{position:absolute;inset:-12px;border:6px solid ${ORA};border-radius:22px;opacity:0;font-style:normal}
.lk{width:36px;height:10px;background:${INK};transform-origin:0 50%;margin:0 -4px;position:relative;z-index:-1}
.lk.dash{background:repeating-linear-gradient(90deg,${INK} 0 8px,rgba(0,0,0,0) 8px 13px)}
.wave{position:absolute;left:0;bottom:0;width:110px;height:100px;border-radius:16px;background:rgba(255,212,59,.0);border:6px solid ${ORA};opacity:0;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP34_KUCING_PARASUT_SARAWAK",
  ep: "34", bg: BG, vig: 0.22, grain: 0.035, capfloor: 0.0, html, css, chipFont: `'Barlow Condensed','Arial Narrow',sans-serif`, chipColor: "#FFFFFF",
  chip: "ILUSTRASI KARTUN &middot; BUKAN CUPLIKAN ASLI",
  extraAt: ["s1:kucing", "s1:parasut", "s1:Borneo", "s2:Pulau", "s2:Kalimantan#2", "s2:berbatasan", "s3:nyamuk", "s3:nyamuk#2", "s3:membasmi",
    "s4:Versi", "s4:racunnya", "s4:serangga", "s4:cicak", "s4:kucing", "s4:belum", "s4:Kemungkinan", "s4:langsung", "s4:terkena", "s4:menjilati", "s4:mati",
    "s5:tikus", "s5:biak", "s5:merusak", "s6:Operation", "s6:diterbangkan", "s6:Singapura", "s6:dimasukkan", "s6:peti", "s6:dijatuhkan", "s6:parasut", "s6:bersama",
    "s7:empat", "s7:mitos", "s7:dua", "s7:Operasinya", "s7:berhasil", "s8:Semprot", "s8:kucing#2", "s8:terjun", "s8:langit", "s8:Satu", "s8:seluruh", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-60,rotation:-2},{opacity:1,x:0,rotation:0,duration:.34,ease:'back.out(1.6)',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.9,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 tok:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t-.01);tl.fromTo(e,{opacity:0,scale:.3,y:30},{opacity:1,scale:1,y:0,duration:.4,ease:'back.out(2.2)',immediateRender:false},t);},
 puls:(e,t)=>{tl.fromTo(e,{opacity:1,scale:.9},{opacity:0,scale:1.35,duration:.6,ease:'power2.out',immediateRender:false},t);tl.fromTo(e.parentNode,{y:0},{y:-16,duration:.14,yoyo:true,repeat:1,ease:'power2.out',immediateRender:false},t);},
 wave:(e,t)=>{document.querySelectorAll('#chain .tk').forEach((k,i)=>{tl.fromTo(k,{y:0,rotation:0},{y:-22,rotation:(i%2?4:-4),duration:.16,yoyo:true,repeat:1,ease:'power2.out',immediateRender:false},t+i*.09);});},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-80,rotation:-2},{opacity:1,x:0,rotation:0,duration:.34,ease:'back.out(1.4)'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:80,duration:.2,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{const sp=q('#speed');const hits=[AT['s1:lelucon']-0.15,AT['s6:parasut']-0.1,AT['s7:mitos']];let k=0;for(const h of hits){const d=t-h;if(d>0&&d<0.6)k=Math.max(k,1-d/0.6);}if(t<0.9)k=Math.max(k,0.55*(1-t/0.9));sp.style.opacity=k;}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Lilita One','Arial Black',sans-serif;font-weight:400;font-size:70px;line-height:1.08;letter-spacing:.01em;color:#fff;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:6px 6px 0 ${INK}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24,scale:.92},{opacity:1,y:0,scale:1,duration:.2,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kucing Parasut Sarawak", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
