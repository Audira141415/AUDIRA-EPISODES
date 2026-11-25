// EP09 ONODA 29 TAHUN. PAPERWORLD + INKSTORY-adjacent house style: graphite pencil sketch with a warm watercolor wash on cold-press paper,
// staged as a 3D paper diorama of Lubang. Panels are field-notebook cards; a year tag in the corner keeps ticking 1945 -> 1974.
// Cuts between diorama sets hide under a pencil-hatching sweep. Tone: serious, victims shown with restraint. Run: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAPER = "#EFE8DA", GR = "#2E2E2E", SEP = "#8A6A45", RED = "#B23A2E", JD = "#5E7F4F", BG = "#EFE8DA";
const TYPE = `"Special Elite","Courier New",monospace`, HEAD = `"Libre Caslon Text",Georgia,serif`;

// hand-drawn field sketch for name cards: a generic figure, no face
const icon = (cap) => `<svg viewBox="0 0 100 120" class="ic"><rect x="3" y="3" width="94" height="114" fill="#F6F1E4" stroke="${GR}" stroke-width="2"/>
<path d="M50 30c-9 0-15 7-15 16s6 16 15 16 15-7 15-16-6-16-15-16z" fill="#D9C3A2" stroke="${GR}" stroke-width="2.2"/>
${cap === "hat" ? `<path d="M30 33h40l-4-14H34z" fill="#4A4A4A" stroke="${GR}" stroke-width="2"/><path d="M24 34h52" stroke="${GR}" stroke-width="4"/>` : cap === "bush" ? `<path d="M33 34c2-14 32-14 34 0" fill="#9A8A62" stroke="${GR}" stroke-width="2"/><path d="M22 35h56" stroke="${GR}" stroke-width="4"/>` : cap === "none" ? `<path d="M36 40c2-10 26-12 28 0" fill="#3E3E3E"/>` : cap === "field" ? `<path d="M34 36c2-15 30-15 32 0" fill="#7E7050" stroke="${GR}" stroke-width="2"/><path d="M34 38l-3 18M66 38l3 18" stroke="${GR}" stroke-width="2"/>` : `<path d="M36 40c2-10 26-12 28 0" fill="#BFBFBF"/>`}
<path d="M20 117c2-26 14-40 30-40s28 14 30 40" fill="${cap === "hat" ? "#5F6670" : cap === "bush" ? "#6F7A6E" : cap === "none" ? "#3E4650" : "#8A7A55"}" stroke="${GR}" stroke-width="2.2"/>
<g stroke="${GR}" stroke-width="1" opacity=".35">${Array.from({ length: 9 }, (_, i) => `<path d="M${56 + i * 4} ${80 + i}l-10 30"/>`).join("")}</g></svg>`;
const tag = (cap, name, role, a) => `<div class="tag" data-at="${a}" data-fx="up">${icon(cap)}<div><b>${name}</b><span>${role}</span></div></div>`;
const row = (head, txt, a, cls = "") => `<div class="card row ${cls}" data-at="${a}" data-fx="up"><b>${head}</b><span>${txt}</span></div>`;
// 30 strokes in groups of five, drawn one by one in red ink
const tally = Array.from({ length: 30 }, (_, i) => {
  const g = Math.floor(i / 5), k = i % 5, off = (0.1 * i).toFixed(2);
  return k < 4 ? `<i class="tk" style="left:${22 + g * 146 + k * 26}px" data-at="s5:menyerang+${off}" data-fx="growy"></i>`
    : `<i class="tk dg" style="left:${16 + g * 146}px" data-at="s5:menyerang+${off}" data-fx="growy"></i>`;
}).join("");

let html = `<div id="yr"><span>TAHUN</span><b id="yrn">1945</b></div>
${["s2:ia", "s2:Perintahnya", "s5:Selama", "s6", "s7", "s8"].map((a) => `<div class="sw" data-at="${a.includes(":") ? a : a + ":" + firstWord(a)}" data-fx="sweep"></div>`).join("\n")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 09</div>
  <div class="h1">Perang usai.<br><em>Ia tidak.</em></div>
  ${row("1945", "Perang Dunia II berakhir", "s1:berakhir")}
  ${row("1 TENTARA", "Jepang tetap bertempur di hutan Filipina", "s1:satu")}
  <div class="st" data-at="s1:1974" data-fx="stamp">SAMPAI 1974</div>
</div>
<div class="p" data-in="s2" data-out="s2:ia">
  <div class="kk">SIAPA DIA</div>
  ${tag("field", "Hiroo Onoda", "letnan dua, Angkatan Darat Kekaisaran Jepang", "s2:Hiroo")}
  ${row("AKHIR 1944", "ditugaskan bergerilya", "s2:Akhir")}
</div>
<div class="p" data-in="s2:ia" data-out="s2:Perintahnya">
  <div class="kk">26 DESEMBER 1944</div>
  ${row("PULAU LUBANG", "Filipina, tujuan tugas gerilya", "s2:Pulau")}
</div>
<div class="p" data-in="s2:Perintahnya" data-out="s3">
  <div class="kk">PERINTAH UNTUK ONODA</div>
  <div class="order" data-at="s2:jangan-0.25" data-fx="up"><div class="oh">PERINTAH</div>
    <div class="ol" data-at="s2:jangan" data-fx="type">JANGAN MENYERAH</div>
    <div class="ol" data-at="s2:jangan#2" data-fx="type">JANGAN BUNUH DIRI</div></div>
</div>
<div class="p" data-in="s3" data-out="s3:Onoda">
  <div class="kk">28 FEBRUARI 1945</div>
  <div class="h2">Lubang direbut</div>
  ${row("AS &amp; FILIPINA", "pasukan gabungan menguasai pulau", "s3:pasukan")}
</div>
<div class="p" data-in="s3:Onoda" data-out="s4">
  <div class="kk">LARI KE PEGUNUNGAN</div>
  ${row("4 ORANG", "Onoda, Akatsu, Shimada, Kozuka", "s3:tiga")}
</div>
<div class="p" data-in="s4" data-out="s4:Surat">
  <div class="kk">OKTOBER 1945</div>
  <div class="leaf" data-at="s4:selebaran" data-fx="up"><b>PERANG TELAH BERAKHIR</b><span>15 AGUSTUS 1945</span><i>ilustrasi selebaran</i></div>
  <div class="st" data-at="s4:propaganda" data-fx="stamp">DIANGGAP PROPAGANDA</div>
</div>
<div class="p" data-in="s4:Surat" data-out="s5">
  <div class="kk">DARI UDARA</div>
  ${row("SURAT &amp; FOTO", "keluarga dijatuhkan dari pesawat", "s4:Surat")}
  <div class="st" data-at="s4:tipuan" data-fx="stamp">DIANGGAP TIPUAN</div>
</div>
<div class="p" data-in="s5" data-out="s5:Selama">
  <div class="kk">SATU PER SATU</div>
  <div class="cnt"><div class="cn"><i data-at="s5:Satu" data-fx="fade" data-off="s5:menyerah">4</i><i data-at="s5:menyerah" data-fx="num" data-off="s5:1954">3</i><i data-at="s5:1954" data-fx="num" data-off="s5:1972">2</i><i class="r" data-at="s5:1972" data-fx="num">1</i></div><span>orang tersisa</span></div>
  ${row("AKATSU", "menyerah, Maret 1950", "s5:menyerah", "sm")}
  ${row("SHIMADA", "tewas dalam baku tembak, Mei 1954", "s5:1954", "sm rd")}
  ${row("KOZUKA", "tewas dalam baku tembak, Okt 1972", "s5:1972", "sm rd")}
</div>
<div class="p" data-in="s5:Selama" data-out="s6">
  <div class="kk">KORBAN WARGA LUBANG</div>
  <div class="tally" data-at="s5:Selama" data-fx="fade">${tally}</div>
  <div class="vict" data-at="s5:30" data-fx="up"><b>diduga hingga 30 warga tewas</b><span>dibunuh kelompok Onoda selama bersembunyi</span></div>
</div>
<div class="p" data-in="s6" data-out="s6:Maka">
  <div class="kk">20 FEBRUARI 1974</div>
  ${tag("bush", "Norio Suzuki", "petualang Jepang, menemukan Onoda", "s6:Norio")}
  <div class="st" data-at="s6:menolak" data-fx="stamp">MENOLAK MENYERAH</div>
  <div class="lb" data-at="s6:komandan" data-fx="fade">tanpa perintah komandannya</div>
</div>
<div class="p" data-in="s6:Maka" data-out="s7">
  <div class="kk">9 MARET 1974</div>
  ${tag("hat", "Mayor Yoshimi Taniguchi", "mantan atasan, kini penjual buku", "s6:Mayor")}
  ${row("PERINTAH", "dibacakan langsung di Lubang", "s6:membacakan")}
</div>
<div class="p" data-in="s7" data-out="s7:meski">
  <div class="kk">10 MARET 1974</div>
  <div class="h2">Onoda menyerah</div>
  ${row("DISERAHKAN", "pedang, senapan Type 99, 500 peluru, granat", "s7:menyerah", "sm")}
  ${tag("none", "Presiden Ferdinand Marcos", "memberi pengampunan penuh, 11 Maret", "s7:Presiden")}
</div>
<div class="p" data-in="s7:meski" data-out="s8">
  <div class="kk">DISAMBUT BAK PAHLAWAN, TAPI&hellip;</div>
  <div class="card hist" data-at="s7:sejarawan" data-fx="up"><b>Beatrice Trefalt</b><span>sejarawan, Monash University</span><q>klaim &ldquo;tidak tahu perang usai&rdquo; patut diragukan</q></div>
  ${row("RADIO TRANSISTOR", "dan akses ke koran", "s7:radio", "sm")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  <div class="kk">BERTAHAN SETELAH PERANG</div>
  <div class="mega"><b>28</b><span>tahun<br>6 bulan 8 hari</span></div>
  ${tag("field", "Teruo Nakamura", "prajurit, ditangkap 18 Des 1974 di Morotai, Indonesia", "s8:Prajurit")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="kk">MENURUT KAMU?</div>
  <div class="duo"><i data-at="s8:setia" data-fx="pop">SETIA?</i><i data-at="s8:keras" data-fx="pop">KERAS KEPALA, MEMAKAN KORBAN?</i></div>
</div>`;
function firstWord(sc) { return TL.words.find((w) => w.scene === sc).text.replace(/[.,:;?!]+$/, ""); }
// digits in panels use the typewriter face (Caslon text figures read oddly at display sizes)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<span class="g">$1</span>') + "<");

// pencil hatching tile for the sweep: jittered graphite strokes on paper
const hatchSvg = (() => {
  let s = 1234567; const q = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><rect width="420" height="420" fill="${PAPER}"/>`;
  for (let i = 0; i < 300; i++) { const x = q() * 520 - 50, y = q() * 470 - 25, l = 40 + q() * 110, a = 1.08 + (q() - 0.5) * 0.12; o += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * l).toFixed(1)} ${(-Math.sin(a) * l).toFixed(1)}" stroke="${GR}" stroke-opacity="${(0.25 + q() * 0.5).toFixed(2)}" stroke-width="${(0.8 + q() * 1.6).toFixed(1)}" stroke-linecap="round"/>`; }
  for (let i = 0; i < 70; i++) { const x = q() * 440 - 10, y = q() * 440, l = 30 + q() * 70; o += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${l.toFixed(1)} ${(l * 0.45).toFixed(1)}" stroke="${GR}" stroke-opacity="${(0.15 + q() * 0.25).toFixed(2)}" stroke-width="1"/>`; }
  return "data:image/svg+xml;utf8," + encodeURIComponent(o + "</svg>");
})();

const css = `
.p{top:300px}
#yr{position:absolute;right:110px;top:184px;z-index:11;display:flex;align-items:baseline;gap:12px;padding:4px 16px 6px;background:#F6F1E4;border:2px solid ${GR};box-shadow:0 6px 16px rgba(46,46,46,.22);transform:rotate(1.2deg)}
#yr span{font-family:"Special Elite","Courier New",monospace;font-size:22px;letter-spacing:.14em;color:${SEP}}
#yr b{font-family:"Special Elite","Courier New",monospace;font-weight:400;font-size:52px;line-height:1;color:${RED};font-variant-numeric:tabular-nums}
#chip{top:200px;background:rgba(246,241,228,.9);padding:4px 10px}
.sw{position:absolute;left:0;top:0;width:3000px;height:1920px;z-index:9;pointer-events:none;background:url("${hatchSvg}");background-size:420px 420px;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 19%,#000 81%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 19%,#000 81%,transparent 100%)}
.g{font-family:"Special Elite","Courier New",monospace!important;font-weight:400!important}
.p span.g{display:inline!important;font-size:inherit!important;color:inherit!important;letter-spacing:inherit!important;margin:0!important;line-height:inherit!important;font-style:normal!important}
.kk{display:inline-block;font-family:"Special Elite","Courier New",monospace;font-size:28px;letter-spacing:.12em;color:${PAPER};background:${GR};padding:7px 16px 5px;margin-bottom:12px;box-shadow:0 6px 16px rgba(46,46,46,.3);transform:rotate(-.6deg)}
.h1{display:inline-block;background:rgba(246,241,228,.94);padding:8px 24px 14px;border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25);font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:92px;line-height:1.02;color:${GR}}
.h1 em{font-style:italic;font-weight:400;color:${RED}}
.h2{display:inline-block;background:rgba(246,241,228,.94);padding:6px 22px 12px;border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25);font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:70px;line-height:1.05;color:${GR}}
.card{position:relative;background:linear-gradient(172deg,#F8F4EA,#F1EADB 60%,#E8DDC6);border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25)}
.card:before{content:"";position:absolute;left:24px;top:-12px;width:96px;height:24px;background:rgba(201,180,140,.7);transform:rotate(-4deg)}
.row{display:flex;gap:20px;align-items:center;margin-top:16px;padding:14px 22px}
.row b{flex:none;font-family:"Special Elite","Courier New",monospace;font-weight:400;font-size:46px;line-height:1.05;color:${GR}}
.row span{font-family:"Libre Caslon Text",Georgia,serif;font-size:33px;line-height:1.18;color:${GR}}
.row.sm{padding:10px 20px;margin-top:10px}.row.sm b{font-size:34px}.row.sm span{font-size:28px}
.row.rd b{color:${RED}}
.st{display:inline-block;margin-top:16px;font-family:"Special Elite","Courier New",monospace;font-size:44px;letter-spacing:.06em;padding:8px 20px 4px;color:${RED};border:5px double ${RED};background:rgba(246,241,228,.93);transform:rotate(-3deg);box-shadow:0 8px 20px rgba(46,46,46,.2)}
.lb{display:block;width:max-content;margin-top:12px;background:rgba(246,241,228,.93);padding:6px 16px;font-family:"Libre Caslon Text",Georgia,serif;font-style:italic;font-size:34px;color:${GR};border-left:6px solid ${RED}}
.tag{position:relative;display:flex;align-items:center;gap:20px;margin-top:16px;padding:12px 22px 12px 14px;background:linear-gradient(172deg,#F8F4EA,#F1EADB 60%,#E8DDC6);border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25)}
.tag .ic{flex:none;width:92px;height:110px}
.tag b{display:block;font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:42px;line-height:1.05;color:${GR}}
.tag span{display:block;font-family:"Special Elite","Courier New",monospace;font-size:27px;line-height:1.2;color:${SEP};margin-top:6px}
.order{position:relative;padding:20px 30px 24px;background:#F8F4EA;border:2px solid ${GR};box-shadow:0 14px 30px rgba(46,46,46,.28);transform:rotate(-.8deg)}
.order .oh{font-family:"Special Elite","Courier New",monospace;font-size:30px;letter-spacing:.3em;color:${SEP};border-bottom:2px dashed ${SEP};padding-bottom:8px;margin-bottom:10px}
.order .ol{font-family:"Special Elite","Courier New",monospace;font-size:66px;line-height:1.25;color:${GR};text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:4px;text-underline-offset:10px}
.leaf{display:block;width:max-content;max-width:900px;padding:22px 34px 16px;background:#EDE3C9;border:3px dashed ${GR};box-shadow:0 14px 30px rgba(46,46,46,.28);text-align:center;transform:rotate(1.5deg)}
.leaf b{display:block;font-family:"Special Elite","Courier New",monospace;font-weight:400;font-size:56px;color:${GR}}
.leaf span{display:block;font-family:"Special Elite","Courier New",monospace;font-size:46px;color:${RED};margin-top:4px}
.leaf i{display:block;font-family:"Special Elite","Courier New",monospace;font-style:normal;font-size:20px;color:${SEP};margin-top:8px}
.cnt{display:flex;align-items:center;gap:22px}
.cn{position:relative;width:150px;height:150px;border-radius:50%;background:#F8F4EA;border:4px solid ${GR};box-shadow:0 10px 24px rgba(46,46,46,.25)}
.cn i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-family:"Special Elite","Courier New",monospace;font-size:110px;line-height:1;color:${GR}}
.cn i.r{color:${RED}}
.cnt>span{font-family:"Libre Caslon Text",Georgia,serif;font-style:italic;font-size:40px;color:${GR};background:rgba(246,241,228,.92);padding:2px 14px}
.tally{position:relative;height:150px;background:#F8F4EA;border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25)}
.tk{position:absolute;top:24px;width:7px;height:102px;border-radius:4px;background:${RED};transform-origin:50% 100%;opacity:.9}
.tk.dg{top:22px;width:7px;height:128px;transform:rotate(62deg);transform-origin:50% 50%;margin-left:52px;margin-top:-14px}
.vict{margin-top:16px;padding:14px 22px;background:rgba(246,241,228,.95);border-left:8px solid ${RED};box-shadow:0 12px 28px rgba(46,46,46,.2)}
.vict b{display:block;font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:48px;line-height:1.08;color:${RED}}
.vict span{display:block;font-family:"Special Elite","Courier New",monospace;font-size:28px;color:${GR};margin-top:6px}
.hist{margin-top:6px;padding:16px 24px 18px}
.hist b{display:block;font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:46px;color:${GR}}
.hist span{display:block;font-family:"Special Elite","Courier New",monospace;font-size:27px;color:${SEP};margin-top:4px}
.hist q{display:block;margin-top:10px;font-family:"Libre Caslon Text",Georgia,serif;font-style:italic;font-size:38px;line-height:1.18;color:${RED};quotes:none}
.mega{display:flex;align-items:center;gap:18px;background:rgba(246,241,228,.94);border:2px solid ${GR};padding:6px 26px 10px;width:max-content;box-shadow:0 12px 28px rgba(46,46,46,.25)}
.mega b{font-family:"Special Elite","Courier New",monospace;font-weight:400;font-size:170px;line-height:1;color:${RED}}
.mega span{font-family:"Libre Caslon Text",Georgia,serif;font-size:42px;line-height:1.15;color:${GR}}
.duo{display:flex;gap:14px;margin-top:6px}
.duo i{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;font-style:normal;font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:42px;line-height:1.12;padding:18px 12px;color:${GR};background:#F8F4EA;border:2px solid ${GR};box-shadow:0 12px 28px rgba(46,46,46,.25)}
.duo i:last-child{color:${PAPER};background:${RED};border-color:${RED};flex:1.5}`;

// year tag: keeps ticking like a field notebook
const Y = [[0, 1945], ["s1:Tapi", 1945], ["s1:1974", 1974], ["s2:Akhir-0.01", 1974], ["s2:Akhir", 1944], ["s3:Februari-0.01", 1944], ["s3:Februari", 1945],
  ["s4:Mereka", 1945], ["s5:Satu", 1949], ["s5:menyerah-0.01", 1949], ["s5:menyerah", 1950], ["s5:Dua", 1950], ["s5:1954", 1954], ["s5:dan", 1954], ["s5:1972", 1972],
  ["s5:Selama", 1972], ["s6:Februari-0.01", 1972], ["s6:Februari", 1974]];
const yAnch = Y.filter(([a]) => typeof a === "string").map(([a]) => a);
const hud = `(()=>{const yn=q('#yrn');const Y=${JSON.stringify(Y)}.map(([a,v])=>[typeof a==='string'?AT[a]:a,v]);let ly=0,lt=-9;return (t)=>{let y=Y[0][1];for(let i=0;i<Y.length-1;i++){const [a,va]=Y[i],[b,vb]=Y[i+1];if(t>=a&&t<b){y=Math.floor(va+(vb-va)*(t-a)/Math.max(.001,b-a));break;}if(t>=b)y=vb;}
if(t>=AT['s5:Selama']&&t<AT['s6:Februari'])y='1945–1974';if(y!==ly){ly=y;lt=t;yn.textContent=y;}const k=Math.max(0,1-(t-lt)/.25);yn.style.transform='translateY('+(-6*k)+'px)';}})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const worldAnch = [...readFileSync("world3d.js", "utf8").matchAll(/A\("(s\d:[^"]+)"\)/g)].map((m) => m[1]);
const offAnch = [...html.matchAll(/data-off="([^"]+)"/g)].map((m) => m[1]);
const { AT, K } = writeWorld(TL, at, {
  ep: "09", bg: BG, vig: 0.14, grain: 0.06, capfloor: 0.0, html, css, chipFont: `"Special Elite","Courier New",monospace`, chipColor: GR,
  chip: "ILUSTRASI SEJARAH &middot; BUKAN FOTO ASLI",
  extraAt: [...new Set([...worldAnch, ...offAnch, ...yAnch])],
  hud,
  fxExtra: `sweep:(e,t)=>tl.fromTo(e,{x:-3000,opacity:1},{x:1080,duration:.9,ease:'none'},t-.45),
type:(e,t)=>tl.fromTo(e,{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 0% 0 0)',duration:.55,ease:'steps(14)'},t),
num:(e,t)=>tl.fromTo(e,{scale:1.5,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out'},t),`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:26,opacity:0,rotation:-.8},{y:0,opacity:1,rotation:0,duration:.42,ease:'power3.out'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-14,opacity:0,duration:.24,ease:'power2.in'},b-.24)`,
});
// count digits hide when the next one arrives
const wp = "PROJECT/HyperFrames_Remotion/compositions/world.html";
writeFileSync(wp, readFileSync(wp, "utf8").replace("const PIN=", "document.querySelectorAll('#root [data-off]').forEach(e=>tl.to(e,{opacity:0,duration:.15},AT[e.dataset.off]-.02));\nconst PIN="));

// Captions: graphite on a paper strip, red-ink active word; groups fade and rise in.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Libre Caslon Text",Georgia,serif;font-weight:700;font-size:56px;line-height:1.16;word-spacing:.06em;color:${GR};padding:14px 26px 16px;background:linear-gradient(176deg,#F8F4EA,#F1EADB 55%,#E6DBC3);border:2px solid ${GR};box-shadow:0 12px 30px rgba(46,46,46,.3)}
.w{display:inline-block}.w.n{font-family:"Special Elite","Courier New",monospace;font-weight:400;font-size:56px}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${GR}"},{color:"${RED}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${GR}",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{y:16,opacity:0},{y:0,opacity:1,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
const cp = "PROJECT/HyperFrames_Remotion/compositions/captions.html";
writeFileSync(cp, readFileSync(cp, "utf8").replace(/<span class="w" (id="w\d+")>([^<]*\d[^<]*)<\/span>/g, '<span class="w n" $1>$2</span>'));
writeIndex(".", TL, "Onoda 29 Tahun", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
