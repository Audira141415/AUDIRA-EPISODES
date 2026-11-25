// EP10 VATIKAN: GARDA SWISS. PAPERWORLD: a cardstock diorama of the Vatican, a folded paper map of the march over the Alps,
// and an oath courtyard, all on one desk under a warm lamp. Stations change under a full-screen paper fold;
// panels unfold from their top edge like a card being opened. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#F2EADB", TRAV = "#D9CBB0", BLUE = "#1F3A93", RED = "#C8102E", YEL = "#F2B705", SH = "#5A4A3A", INK = "#2B2118", BG = "#2A1D14";

// wax seals instead of portraits: cross keys for popes, crown for the emperor, halberd for commanders
const seal = (kind) => {
  const sym = kind === "pope" ? `<g stroke="#F6E2B0" stroke-width="5" stroke-linecap="round" fill="none"><path d="M18 46L46 18M18 18L46 46"/><circle cx="16" cy="48" r="5"/><circle cx="48" cy="48" r="5"/></g>`
    : kind === "crown" ? `<path d="M14 42l4-20 9 10 5-14 5 14 9-10 4 20z" fill="#F6E2B0"/><rect x="14" y="44" width="36" height="5" fill="#F6E2B0"/>`
    : `<g fill="#F6E2B0"><rect x="30" y="10" width="4" height="46"/><path d="M34 14l14 3 2 9-2 9-14-3z"/><path d="M32 4l4 9h-8z"/></g>`;
  return `<svg viewBox="0 0 64 64" class="seal"><circle cx="32" cy="32" r="30" fill="${RED}"/><circle cx="32" cy="32" r="25" fill="none" stroke="#8E0C20" stroke-width="2"/>${sym}</svg>`;
};
const tag = (kind, name, role, a) => `<div class="tag" data-at="${a}" data-fx="card">${seal(kind)}<div><b>${name}</b><span>${role}</span></div></div>`;
const card = (b, s, a, cls = "") => `<div class="card row ${cls}" data-at="${a}" data-fx="card"><b class="sm">${b}</b><span>${s}</span></div>`;
const chip = (txt, a, c) => `<i class="ch ${c}" data-at="${a}" data-fx="card" data-d="inline-block">${txt}</i>`;

let html = `
<div class="fold" data-at="s2:Kisahnya-0.32" data-fx="fold"><i class="ft"></i><i class="fb"></i></div>
<div class="fold" data-at="s4:Ujian-0.32" data-fx="fold"><i class="ft"></i><i class="fb"></i></div>
<div class="fold" data-at="s6:Hingga-0.32" data-fx="fold"><i class="ft"></i><i class="fb"></i></div>
<div class="fold" data-at="s8:Lima-0.32" data-fx="fold"><i class="ft"></i><i class="fb"></i></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 10</div>
  <div class="h1">Tentara <em>terkecil</em><br>di dunia</div>
  <div class="cnt" data-at="s1:135" data-fx="card"><b class="num">&plusmn;<b class="ct" data-from="0" data-to="135" data-a="s1:135" data-d="1.3">0</b></b><span>anggota<br>(data 2024)</span></div>
  <div class="st" data-at="s1:semuanya" data-fx="stampc">SEMUANYA ORANG SWISS</div>
</div>
<div class="p" data-in="s2" data-out="s2:Kisahnya">
  <div class="kk">VATIKAN &middot; ROMA</div>
  <div class="h2">Garda Swiss Kepausan</div>
  ${card("PENJAGA PAUS", "pengawal pribadi Paus di Vatikan", "s2:penjaga")}
  ${card("NEGARA TERKECIL", "Vatikan, negara terkecil di dunia", "s2:negara", "rd")}
</div>
<div class="p" data-in="s2:Kisahnya" data-out="s3">
  <div class="kk">AWAL KISAH</div>
  <div class="mega" data-at="s2:lima" data-fx="card"><b>500+</b><small>tahun<br>yang lalu</small></div>
</div>
<div class="p" data-in="s3" data-out="s3:150">
  <div class="kk">ROMA &middot; 1505</div>
  ${tag("pope", "Paus Julius II", "meminta pasukan tetap dari Swiss", "s3:Julius")}
  ${card("TENTARA BAYARAN", "prajurit Swiss terkenal tangguh", "s3:bayaran")}
</div>
<div class="p" data-in="s3:150" data-out="s4">
  <div class="kk">SEPT 1505 &ndash; JAN 1506 &middot; JALAN KAKI</div>
  <div class="cnt" data-at="s3:150" data-fx="card"><b class="num"><b class="ct" data-from="0" data-to="150" data-a="s3:150" data-d="1.0">0</b></b><span>prajurit<br>menyeberangi Alpen</span></div>
  ${tag("hal", "Kaspar von Silenen", "memimpin barisan ke Roma", "s3:berjalan")}
  <div class="date" data-at="s3:22" data-fx="card"><b>22 Januari 1506</b><span>tiba di Roma &middot; hari lahir Garda</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk rd">6 MEI 1527</div>
  <div class="h2" data-at="s4:Penjarahan" data-fx="card" data-d="inline-block">Penjarahan Roma</div>
  ${tag("crown", "Kaisar Karl V", "pasukannya menyerbu kota Roma", "s4:Karl")}
</div>
<div class="p" data-in="s5" data-out="s5:Sisanya">
  <div class="kk rd">DI DEKAT BASILIKA SANTO PETRUS</div>
  <div class="duo2"><div data-at="s5:189" data-fx="card"><b class="num">189</b><span>pengawal</span></div><div class="dead" data-at="s5:147" data-fx="card"><b class="num">147</b><span>gugur</span></div></div>
  ${tag("hal", "Kaspar R&ouml;ist", "komandan Garda, ikut gugur", "s5:gugur")}
</div>
<div class="p" data-in="s5:Sisanya" data-out="s6">
  <div class="kk">PELARIAN &middot; PASSETTO DI BORGO</div>
  <div class="cnt" data-at="s5:42" data-fx="card"><b class="num">42</b><span>pengawal tersisa<br>mengawal Paus</span></div>
  ${tag("pope", "Paus Klemens VII", "selamat ke Castel Sant&rsquo;Angelo", "s5:Klemens")}
</div>
<div class="p" data-in="s6" data-out="s6:Syaratnya">
  <div class="kk">SETIAP 6 MEI</div>
  <div class="h2">Sumpah rekrutan baru</div>
  <div class="lb" data-at="s6:enam" data-fx="card" data-d="inline-block">mengenang korban 6 Mei 1527</div>
</div>
<div class="p" data-in="s6:Syaratnya" data-out="s7">
  <div class="kk">SYARAT MASUK</div>
  <div class="chips">${chip("Pria", "s6:pria", "b")}${chip("Katolik", "s6:Katolik", "y")}${chip("Warga Swiss", "s6:berkewarganegaraan", "r")}${chip("Lajang", "s6:lajang", "b")}${chip("19&ndash;30 tahun", "s6:19", "y")}${chip("Tinggi &ge; 174 cm", "s6:174", "r")}${chip("Lulus latihan militer Swiss", "s6:latihan", "b")}</div>
</div>
<div class="p" data-in="s7" data-out="s7:dibuat">
  <div class="kk">SERAGAM BIRU &middot; MERAH &middot; KUNING</div>
  ${card("MICHELANGELO?", "sering disebut perancangnya", "s7:disebut")}
  <div class="st" data-at="s7:Faktanya" data-fx="stampc">MITOS</div>
</div>
<div class="p" data-in="s7:dibuat" data-out="s8">
  <div class="kk">FAKTANYA</div>
  ${tag("hal", "Jules Repond", "komandan Garda, perancang seragam kini", "s7:Jules")}
  <div class="mega" data-at="s7:1914" data-fx="card"><b>1914</b><small>diperkenalkan<br>penuh</small></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">LIMA ABAD LEBIH</div>
  <div class="h2">Tugasnya tetap sama</div>
  ${card("PENGECUALIAN", "Swiss melarang warganya jadi tentara asing, kecuali Garda Kepausan", "s8:Menurut")}
  <div class="q" data-at="s8:kenapa" data-fx="card">Kenapa penjaga dari negara lain?</div>
</div>`;
// every digit run gets Lora (Cinzel's numerals read as letters)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<span class="g">$1</span>') + "<");

const HEAD = `Cinzel,Georgia,serif`, BODY = `Lora,Georgia,serif`;
const paper = `linear-gradient(172deg,#F7F1E4,${CARD} 55%,#E4D8C0)`;
const css = `
.p{transform-origin:50% 0%}
.g,.num,.ct{font-family:Lora,Georgia,serif!important;font-variant-numeric:lining-nums}
.p span.g{display:inline!important;font-size:inherit!important;font-weight:inherit!important;color:inherit!important;letter-spacing:inherit!important;margin:0!important;font-style:inherit!important;line-height:inherit!important}
.fold{position:absolute;inset:0;z-index:14;pointer-events:none;perspective:2400px}
.fold i{position:absolute;left:0;right:0;height:50.2%;background:${paper};box-shadow:0 0 60px rgba(40,25,10,.55)}
.fold .ft{top:0;transform-origin:50% 0%;background:linear-gradient(180deg,#EFE6D2,${CARD} 70%,#D8CAB0)}
.fold .fb{bottom:0;transform-origin:50% 100%;background:linear-gradient(0deg,#EFE6D2,${CARD} 70%,#D8CAB0)}
.kk{display:inline-block;font-family:${HEAD};font-weight:700;font-size:26px;letter-spacing:.12em;color:${CARD};background:${BLUE};padding:8px 18px 7px;margin-bottom:14px;box-shadow:0 8px 18px rgba(30,20,10,.4)}
.kk.rd{background:${RED}}
.h1{display:inline-block;background:${paper};padding:10px 26px 16px;box-shadow:0 16px 34px rgba(30,20,10,.45),0 2px 0 #CDBFA4;font-family:${HEAD};font-weight:900;font-size:96px;line-height:1.02;color:${INK}}
.h1 em{font-style:normal;color:${RED}}
.h2{display:inline-block;background:${paper};padding:8px 22px 12px;box-shadow:0 14px 30px rgba(30,20,10,.45);font-family:${HEAD};font-weight:800;font-size:64px;line-height:1.05;color:${INK};margin-bottom:4px}
.card{background:${paper};color:${INK};border-left:12px solid ${BLUE};box-shadow:0 14px 30px rgba(30,20,10,.45)}
.row{display:flex;flex-direction:column;gap:2px;margin-top:14px;padding:12px 22px 14px}
.row b.sm{font-family:${HEAD};font-weight:800;font-size:40px;line-height:1.05;color:${BLUE}}
.row span{font-family:${BODY};font-weight:600;font-size:33px;line-height:1.2;color:${INK}}
.row.rd{border-left-color:${RED}}.row.rd b.sm{color:${RED}}
.cnt{display:flex;align-items:center;gap:22px;margin-top:16px;padding:6px 26px 10px;background:${paper};border-left:12px solid ${YEL};box-shadow:0 14px 30px rgba(30,20,10,.45)}
.cnt>b{font-family:${BODY};font-weight:700;font-size:136px;line-height:1.02;color:${RED}}
.cnt>b .ct{font-size:inherit;color:inherit}
.cnt span{font-family:${BODY};font-weight:600;font-size:34px;line-height:1.18;color:${INK}}
.st{display:inline-block;margin-top:18px;font-family:${HEAD};font-weight:800;font-size:42px;letter-spacing:.06em;padding:8px 22px;color:${RED};border:5px double ${RED};background:rgba(242,234,219,.95);transform:rotate(-3deg);box-shadow:0 10px 24px rgba(30,20,10,.45)}
.tag{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 24px 12px 14px;background:${paper};box-shadow:0 14px 30px rgba(30,20,10,.45);border-top:2px dashed #BBA98A;border-bottom:2px dashed #BBA98A}
.tag .seal{flex:none;width:92px;height:92px;filter:drop-shadow(0 4px 6px rgba(60,10,10,.35))}
.tag b{display:block;font-family:${HEAD};font-weight:800;font-size:42px;line-height:1.05;color:${INK}}
.tag span{display:block;font-family:${BODY};font-weight:500;font-style:italic;font-size:31px;line-height:1.18;color:${SH};margin-top:4px}
.date{margin-top:14px;padding:10px 24px 14px;background:${RED};color:${CARD};box-shadow:0 14px 30px rgba(30,20,10,.45)}
.date b{display:block;font-family:${BODY};font-weight:700;font-size:66px;line-height:1.05}
.date span{display:block;font-family:${BODY};font-weight:600;font-size:31px;color:#FBE7C6}
.mega{display:flex;align-items:center;gap:20px;margin-top:6px;padding:0 26px 6px;background:${paper};box-shadow:0 14px 30px rgba(30,20,10,.45);width:max-content}
.mega b{font-family:${BODY};font-weight:700;font-size:170px;line-height:1.05;color:${BLUE}}
.mega small{font-family:${BODY};font-weight:600;font-size:38px;line-height:1.15;color:${INK}}
.duo2{display:flex;gap:16px}
.duo2>div{flex:1;text-align:center;padding:6px 8px 14px;background:${paper};border-top:12px solid ${BLUE};box-shadow:0 14px 30px rgba(30,20,10,.45)}
.duo2 b{display:block;font-weight:700;font-size:140px;line-height:1.05;color:${BLUE}}
.duo2 span{display:block;font-family:${HEAD};font-weight:800;font-size:32px;letter-spacing:.1em;color:${INK}}
.duo2 .dead{border-top-color:${RED}}.duo2 .dead b{color:${RED}}
.lb{display:inline-block;margin-top:12px;background:rgba(43,33,24,.86);padding:6px 18px 8px;font-family:${BODY};font-style:italic;font-weight:600;font-size:34px;color:${CARD}}
.chips{display:flex;flex-wrap:wrap;gap:12px 12px}
.ch{font-style:normal;font-family:${BODY};font-weight:700;font-size:38px;padding:10px 22px 12px;box-shadow:0 10px 22px rgba(30,20,10,.45)}
.ch.b{background:${BLUE};color:${CARD}}.ch.y{background:${YEL};color:${INK}}.ch.r{background:${RED};color:${CARD}}
.q{margin-top:16px;font-family:${HEAD};font-weight:800;font-size:46px;line-height:1.12;padding:16px 24px;color:${CARD};background:${BLUE};border-bottom:10px solid ${YEL};box-shadow:0 14px 30px rgba(30,20,10,.45)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "10", bg: BG, vig: 0.42, grain: 0.09, capfloor: 0.0, html, css, chipFont: "Lora,Georgia,serif", chipColor: CARD,
  chip: "DIORAMA KERTAS &middot; ILUSTRASI SEJARAH",
  extraAt: ["s1:dunia", "s1:Swiss", "s2:Garda", "s2:Vatikan", "s2:Kisahnya", "s3:Swiss", "s3:prajurit", "s3:tiba", "s3:1506", "s3:lahir", "s4:Ujian", "s4:Penjarahan", "s4:Karl", "s4:Pasukan", "s4:menyerbu",
    "s5:147", "s5:gugur", "s5:Sisanya", "s5:42", "s5:mengawal", "s5:Klemens", "s6:Hingga", "s6:disumpah", "s6:Syaratnya", "s6:tinggi", "s6:174",
    "s7:biru", "s7:merah", "s7:kuning", "s7:Michelangelo", "s7:Faktanya", "s7:Jules", "s8:Lima"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.classList.contains('row')||e.classList.contains('tag')||e.classList.contains('cnt')||e.classList.contains('mega')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,rotationX:-80,transformPerspective:1400,transformOrigin:'50% 0%'},{opacity:1,rotationX:0,duration:.42,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,rotation:-8,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 fold:(e,t)=>{const a=e.querySelector('.ft'),b=e.querySelector('.fb');gsap.set(a,{rotationX:-92});gsap.set(b,{rotationX:92});tl.set(e,{opacity:1},t);
  tl.to(a,{rotationX:0,duration:.3,ease:'power2.in'},t);tl.to(b,{rotationX:0,duration:.3,ease:'power2.in'},t+.02);
  tl.to(a,{rotationX:-92,duration:.38,ease:'power2.out'},t+.4);tl.to(b,{rotationX:92,duration:.38,ease:'power2.out'},t+.42);tl.set(e,{opacity:0},t+.82);},`,
  // panels unfold from their top edge like a folded card, and fold back up to leave
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,rotationX:-88,transformPerspective:1800,transformOrigin:'50% 0%'},{rotationX:0,duration:.5,ease:'power3.out'},a-.12)`,
  panelOut: `(tl,p,b)=>tl.to(p,{rotationX:-88,transformPerspective:1800,transformOrigin:'50% 0%',opacity:0,duration:.3,ease:'power2.in'},b-.3)`,
});

// Captions: join any {display|spoken} split words back for the strip.
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
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Lora,Georgia,serif;font-weight:700;font-size:58px;line-height:1.14;word-spacing:.06em;color:${INK};padding:14px 26px 18px;background:linear-gradient(176deg,#F7F1E4,${CARD} 50%,#E2D5BC);box-shadow:0 12px 28px rgba(30,20,10,.5);clip-path:polygon(0 6%,3% 0,22% 4%,48% 0,73% 5%,97% 0,100% 8%,99% 92%,100% 100%,76% 96%,51% 100%,26% 95%,2% 100%,0 90%)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${INK}"},{color:"${RED}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Vatikan Garda Swiss", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
