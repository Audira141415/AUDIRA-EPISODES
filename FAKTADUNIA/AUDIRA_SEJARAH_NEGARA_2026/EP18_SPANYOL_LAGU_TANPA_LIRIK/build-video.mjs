// EP18 SPANYOL, LAGU TANPA LIRIK: MEMPHISDIORAMA. An 80s Milan tabletop: a toy stadium where a staff of chunky notes
// plays over a row of EMPTY speech bubbles; three flag blocks without official lyrics; the 1761 document with fife and
// drum; the 1770 crown; lyric sheets stamped TIDAK RESMI that sink at 1978; the 2007 contest ballot box that overflows,
// crowns a winner and slams shut five days later. Stations change under a geometric shape wipe (circles, triangles,
// zigzags); panels are Memphis cards with hard purple shadows. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const YEL = "#FFD234", COR = "#FF5A5F", MINT = "#5EDFB0", SKY = "#5CC8FF", PUR = "#705890", IND = "#25214A", PAPER = "#FFFCF6";
const HEAD = `Righteous,sans-serif`, BODY = `'Work Sans',sans-serif`;

// shape wipe: a 4 x 7 grid of discs covers the frame, with triangles and zigzag strips riding on top
const WPAL = [YEL, COR, MINT, SKY, PUR, IND, "#F59FB5"];
const wipe = (a) => {
  let b = "";
  for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) {
    const d = ((c / 3) * 0.45 + (r / 6) * 0.55).toFixed(3);
    b += `<i class="dc" data-d="${d}" style="left:${c * 270 + 135 - 215}px;top:${r * 274 + 137 - 215}px;background:${WPAL[(r * 2 + c * 3) % WPAL.length]}"></i>`;
  }
  const tri = [[120, 300, YEL, 18], [760, 640, MINT, -24], [240, 1180, COR, 40], [700, 1540, SKY, -10]];
  tri.forEach(([x, y, col, rot], i) => { b += `<i class="tr" data-d="${(0.15 + i * 0.2).toFixed(2)}" style="left:${x}px;top:${y}px;--r:${rot}deg;border-bottom-color:${col}"></i>`; });
  [[60, 820, -12], [520, 260, 14], [380, 1420, -6]].forEach(([x, y, rot], i) => { b += `<svg class="zz" data-d="${(0.25 + i * 0.25).toFixed(2)}" style="left:${x}px;top:${y}px;--r:${rot}deg" viewBox="0 0 520 90"><path d="M10 70 L60 20 L110 70 L160 20 L210 70 L260 20 L310 70 L360 20 L410 70 L460 20 L510 70" fill="none" stroke="${IND}" stroke-width="22" stroke-linejoin="miter"/></svg>`; });
  return `<div class="wipe" data-at="${a}" data-fx="wipe">${b}</div>`;
};
// people are name tags with a plain geometric icon
const ICON = {
  crown: `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="28" fill="${YEL}" stroke="${IND}" stroke-width="4"/><path d="M15 43l3-20 8 9 6-13 6 13 8-9 3 20z" fill="${COR}" stroke="${IND}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  quill: `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="28" fill="${MINT}" stroke="${IND}" stroke-width="4"/><circle cx="25" cy="42" r="6" fill="${IND}"/><rect x="29" y="16" width="4" height="27" fill="${IND}"/><path d="M33 16 q12 4 10 14 q-6-5-10-5z" fill="${IND}"/></svg>`,
  pen: `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="28" fill="${SKY}" stroke="${IND}" stroke-width="4"/><path d="M19 45l4-12 18-18 8 8-18 18z" fill="#fff" stroke="${IND}" stroke-width="3" stroke-linejoin="round"/></svg>`,
};
const tag = (ic, name, role, a) => `<div class="mc tag" data-at="${a}" data-fx="card">${ICON[ic]}<div><b>${name}</b><span>${role}</span></div></div>`;
const row = (b, s, a, cls = "") => `<div class="mc row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b><span>${s}</span></div>`;
const chip = (txt, a, c) => `<i class="ch ${c}" data-at="${a}" data-fx="card" data-d="inline-block">${txt}</i>`;

const html = `
${wipe(`s2:Ini`)}${wipe(`s3:Lagu`)}${wipe(`s5:Lirik`)}${wipe(`s6:Tahun`)}${wipe(`s8:Lebih`)}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 18</div>
  <div class="mc h1">Lagu kebangsaan<br><em>tanpa lirik</em></div>
  <div class="st" data-at="s1:resmi" data-fx="stampc">TIDAK ADA LIRIK RESMI</div>
</div>
<div class="p" data-in="s2" data-out="s2:Bersama">
  <div class="kk co">SPANYOL &middot; ESPA&Ntilde;A</div>
  <div class="mc h2" data-at="s2:Marcha" data-fx="card" data-d="table">Marcha Real</div>
  ${row("MARS KERAJAAN", "nama lagu kebangsaan Spanyol", "s2:Mars", "co")}
</div>
<div class="p" data-in="s2:Bersama" data-out="s3">
  <div class="kk">HANYA 3 DI DUNIA</div>
  <div class="chips">${chip("Spanyol", "s2:Bersama", "co")}${chip("Bosnia &amp; Herzegovina", "s2:Bosnia", "mi")}${chip("Kosovo", "s2:Kosovo", "sk")}</div>
  <div class="st" data-at="s2:tanpa" data-fx="stampc">TANPA LIRIK RESMI</div>
</div>
<div class="p" data-in="s3" data-out="s3:dengan">
  <div class="kk">SALAH SATU YANG TERTUA</div>
  <div class="mc mega" data-at="s3:1761" data-fx="card"><b>1761</b><small>pertama<br>tercetak</small></div>
</div>
<div class="p" data-in="s3:dengan" data-out="s4">
  <div class="kk co">NAMA AWAL</div>
  ${row("MARCHA GRANADERA", "mars pasukan granadir", "s3:Granadera")}
  ${tag("quill", "Manuel de Espinosa", "penyusun mars, 1761", "s3:Manuel")}
</div>
<div class="p" data-in="s4" data-out="s4:Pada">
  <div class="kk">MARS KEHORMATAN RESMI</div>
  <div class="mc mega" data-at="s4:1770" data-fx="card"><b>1770</b><small>jadi mars<br>resmi</small></div>
  ${tag("crown", "Raja Carlos III", "menetapkan mars kehormatan resmi", "s4:Carlos")}
</div>
<div class="p" data-in="s4:Pada" data-out="s5">
  <div class="kk co">NAIK STATUS</div>
  ${tag("crown", "Ratu Isabel II", "di masanya jadi lagu kebangsaan", "s4:Isabel")}
  ${row("LAGU KEBANGSAAN", "Marcha Real resmi jadi lagu negara", "s4:kebangsaan", "mi")}
</div>
<div class="p" data-in="s5" data-out="s5:Sejak">
  <div class="kk">LIRIK PERNAH ADA</div>
  ${row("TAK PERNAH RESMI", "beberapa versi lirik dipakai, tak satu pun disahkan", "s5:resmi", "co")}
  ${row("ERA FRANCO", "satu versi dipakai di masa diktator Franco", "s5:Franco", "pu")}
</div>
<div class="p" data-in="s5:Sejak" data-out="s6">
  <div class="kk">SEJAK</div>
  <div class="mc mega" data-at="s5:1978" data-fx="card"><b>1978</b><small>dimainkan<br>tanpa kata</small></div>
</div>
<div class="p" data-in="s6" data-out="s6:Sayembara">
  <div class="kk">2007 &middot; KOMITE OLIMPIADE SPANYOL</div>
  <div class="mc h2" data-at="s6:memberi" data-fx="card" data-d="table">Cari lirik resmi</div>
  ${row("PENCALONAN MADRID", "tuan rumah Olimpiade 2016", "s6:Madrid", "co")}
</div>
<div class="p" data-in="s6:Sayembara" data-out="s7">
  <div class="kk co">SAYEMBARA TERBUKA</div>
  <div class="mc h2" data-at="s6:ribuan" data-fx="card" data-d="table">Ribuan naskah<br>masuk</div>
</div>
<div class="p" data-in="s7" data-out="s7:ditarik">
  <div class="kk">JURI MEMILIH 1 PEMENANG</div>
  ${tag("pen", "Paulino Cubero", "penulis lirik pemenang", "s7:pemenang")}
  <div class="st" data-at="s7:dikritik" data-fx="stampc">DIKRITIK HABIS</div>
</div>
<div class="p" data-in="s7:ditarik" data-out="s8">
  <div class="kk co">DITARIK</div>
  <div class="mc mega" data-at="s7:lima" data-fx="card"><b>5</b><small>hari<br>kemudian</small></div>
  <div class="st" data-at="s7:dibatalkan" data-fx="stampc">DIBATALKAN TANPA BATAS WAKTU</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">SEJAK 1761</div>
  <div class="mc mega" data-at="s8:tahun" data-fx="card"><b>260+</b><small>tahun<br>tanpa kata</small></div>
  <div class="mc q" data-at="s8:Menurut" data-fx="card">Lebih kuat dengan lirik, atau tanpa lirik?</div>
</div>`;

const SH = `10px 12px 0 ${PUR}`;
const css = `
.p{transform-origin:0% 0%}
.wipe{position:absolute;inset:0;z-index:14;pointer-events:none;overflow:hidden;opacity:0}
.wipe .dc{position:absolute;width:430px;height:430px;border-radius:50%}
.wipe .tr{position:absolute;width:0;height:0;border-left:150px solid transparent;border-right:150px solid transparent;border-bottom:260px solid ${YEL};transform:rotate(var(--r));filter:drop-shadow(8px 10px 0 ${PUR})}
.wipe .zz{position:absolute;width:520px;height:90px;transform:rotate(var(--r))}
.mc{position:relative;background:#fff;border:5px solid ${IND};box-shadow:${SH}}
.kk{display:inline-block;font-family:Righteous,sans-serif;font-size:30px;line-height:1.25;letter-spacing:.06em;color:#fff;background:${IND};padding:7px 20px 5px;margin-bottom:22px;box-shadow:6px 7px 0 ${PUR}}
.kk.co{background:${COR}}
.h1{display:inline-block;padding:14px 30px 18px;background:${YEL};font-family:Righteous,sans-serif;font-size:100px;line-height:1.0;color:${IND}}
.h1 em,.h2 em{font-style:normal;color:${COR}}
.h2{display:table;padding:10px 26px 14px;background:${YEL};font-family:Righteous,sans-serif;font-size:72px;line-height:1.02;color:${IND};margin-bottom:6px}
.st{display:inline-block;margin-top:26px;font-family:Righteous,sans-serif;font-size:44px;letter-spacing:.04em;padding:8px 24px 6px;color:#fff;background:${COR};border:5px solid ${IND};transform:rotate(-3deg);box-shadow:${SH}}
.row{flex-direction:column;margin-top:26px;padding:12px 24px 14px;border-left:18px solid ${SKY}}
.row b{font-family:Righteous,sans-serif;font-weight:400;font-size:46px;line-height:1.08;color:${IND}}
.row span{font-family:'Work Sans',sans-serif;font-weight:600;font-size:32px;line-height:1.22;color:#3A3560}
.row.co{border-left-color:${COR}}.row.mi{border-left-color:${MINT}}.row.pu{border-left-color:${PUR}}
.tag{align-items:center;gap:22px;margin-top:26px;padding:12px 26px 12px 14px}
.tag svg{flex:none;width:96px;height:96px}
.tag b{display:block;font-family:Righteous,sans-serif;font-weight:400;font-size:48px;line-height:1.05;color:${IND}}
.tag span{display:block;font-family:'Work Sans',sans-serif;font-weight:600;font-size:31px;line-height:1.2;color:#3A3560;margin-top:4px}
.mega{align-items:center;gap:24px;width:max-content;padding:2px 30px 4px;background:${YEL}}
.mega b{font-family:Righteous,sans-serif;font-weight:400;font-size:176px;line-height:1.08;color:${COR};-webkit-text-stroke:5px ${IND};paint-order:stroke fill}
.mega small{font-family:'Work Sans',sans-serif;font-weight:800;font-size:40px;line-height:1.12;color:${IND}}
.chips{display:flex;flex-wrap:wrap;gap:18px 18px}
.ch{font-style:normal;font-family:Righteous,sans-serif;font-size:46px;line-height:1.15;padding:8px 24px 6px;border:5px solid ${IND};box-shadow:${SH};color:${IND}}
.ch.co{background:${COR};color:#fff}.ch.mi{background:${MINT}}.ch.sk{background:${SKY}}
.q{margin-top:26px;padding:16px 26px 18px;font-family:Righteous,sans-serif;font-size:52px;line-height:1.1;color:#fff;background:${COR}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP18_SPANYOL_LAGU_TANPA_LIRIK",
  ep: "18", bg: PAPER, vig: 0.12, grain: 0.035, capfloor: 0.0, html, css, chipFont: BODY, chipColor: IND,
  chip: "DIORAMA MEMPHIS &middot; ILUSTRASI SEJARAH",
  extraAt: ["s1:resmi", "s1:dinyanyikan", "s2:Spanyol", "s2:Real", "s2:Bosnia", "s2:Kosovo", "s2:tanpa", "s3:1761", "s3:Granadera", "s3:Manuel",
    "s4:1770", "s4:Carlos", "s4:Isabel", "s4:kebangsaan", "s5:resmi", "s5:Franco", "s5:1978", "s5:dimainkan", "s6:Madrid", "s6:Sayembara", "s6:ribuan",
    "s7:pemenang", "s7:dikritik", "s7:lima", "s7:ditarik", "s7:dibatalkan", "s8:kata", "s8:Menurut"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.tag,.mega')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-40,y:30,boxShadow:'0px 0px 0 ${PUR}'},{opacity:1,x:0,y:0,boxShadow:'${SH}',duration:.34,ease:'back.out(2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,rotation:-10,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.22,ease:'back.out(2)',immediateRender:false},t);},
 wipe:(e,t)=>{tl.set(e,{opacity:1},t-.62);e.querySelectorAll('.dc,.tr,.zz').forEach(b=>{const d=+b.dataset.d;const big=b.classList.contains('dc');gsap.set(b,{scale:0});
  tl.fromTo(b,{scale:0},{scale:1,duration:big?.2:.24,ease:'back.out(1.6)',immediateRender:false},t-.56+d*.36);
  tl.to(b,{scale:0,duration:.18,ease:'power2.in'},t+.06+d*.36);});tl.set(e,{opacity:0},t+.64);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-60},{opacity:1,x:0,duration:.34,ease:'back.out(1.8)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:50,duration:.2,ease:'power2.in'},b-.2)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Work Sans',sans-serif;font-weight:800;font-size:56px;line-height:1.14;color:${IND};padding:16px 34px 18px;background:${YEL};border:5px solid ${IND};border-radius:60px;box-shadow:9px 11px 0 ${PUR}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${IND}"},{color:"${COR}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${IND}",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.22,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Spanyol Lagu Tanpa Lirik", PAPER);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
