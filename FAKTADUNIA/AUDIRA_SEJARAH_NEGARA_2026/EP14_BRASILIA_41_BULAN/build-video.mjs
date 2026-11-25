// EP14 BRASÍLIA 41 BULAN. BUILDFORGE: a capital assembles itself on red cerrado earth at golden hour.
// Survey map (coast vs interior), then the site: bulldozers, the cross of axes, cranes, the lake over the workers' village.
// Stations change under a construction-tape wipe; panels are concrete site cards. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#B5472B", CONC = "#ECE9E2", SKY = "#5E9ED6", GRN = "#009C3B", YEL = "#FFDF00", INK = "#1F2326", BG = "#EEC192";
const HEAD = "Montserrat,Arial,sans-serif", BODY = "'Work Sans',Arial,sans-serif";

// generic role icons, no portraits
const ICON = {
  plan: `<path d="M14 50L50 14M20 44l6 6M30 34l6 6M40 24l6 6" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  pres: `<path d="M16 50c2-10 8-16 16-16s14 6 16 16z" fill="#fff"/><circle cx="32" cy="22" r="9" fill="#fff"/><path d="M22 38l20 12" stroke="${YEL}" stroke-width="5"/>`,
  arch: `<path d="M32 12L18 52M32 12l14 40M22 40h20" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="32" cy="12" r="4" fill="#fff"/>`,
  idea: `<path d="M20 14h20l6 6v32H20z" fill="#fff"/><path d="M25 28h16M25 36h16M25 44h10" stroke="${RED}" stroke-width="3"/>`,
};
const tag = (ic, name, role, a, col = RED) => `<div class="tag" data-at="${a}" data-fx="card"><svg viewBox="0 0 64 64" class="ic"><circle cx="32" cy="32" r="31" fill="${col}"/>${ICON[ic]}</svg><div><b>${name}</b><span>${role}</span></div></div>`;
const card = (b, s, a, cls = "") => `<div class="card row ${cls}" data-at="${a}" data-fx="card"><b class="sm">${b}</b><span>${s}</span></div>`;
const tape = (a) => `<div class="tape" data-at="${a}" data-fx="tape"><div class="tin">${[...Array(9)].map((_, i) => `<i class="${i % 2 ? "c" : "y"}">${i % 2 ? "" : "<span>PROYEK IBU KOTA BARU &middot; AREA KONSTRUKSI &middot; PROYEK IBU KOTA BARU &middot; AREA KONSTRUKSI</span>"}</i>`).join("")}</div></div>`;
const mon = (a, b, big = "") => `<div class="mon ${big}" data-at="${a}" data-fx="card"><span>BULAN KE</span><b class="mn" data-a="${a}" data-b="${b}">0</b><small>dari 41</small></div>`;
const plane = `<svg viewBox="0 0 64 40" class="pl"><path d="M32 2v36M4 22c10-8 18-9 28-9s18 1 28 9M24 34h16" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`;

const C1 = "s2:Sebelumnya-0.25";
let html = `
${tape(C1)}
${tape("s4:Lalu-0.12")}
<div class="p" data-first="1" data-in="@0" data-out="${C1}">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 14</div>
  <div class="h1">Ibu kota<br>dalam <em>41 bulan</em></div>
  ${mon("s1:Sebuah", "s1:bulan")}
  ${card("BRASÍLIA", "ibu kota Brasil, dibangun dari nol", "s2:ibu")}
</div>
<div class="p" data-in="${C1}" data-out="s3">
  <div class="kk">SEBELUM 1960</div>
  ${card("RIO DE JANEIRO", "ibu kota lama, di pesisir", "s2:Rio")}
  ${card("PESISIR", "penduduk &amp; kekayaan menumpuk", "s2:penduduk", "bl")}
</div>
<div class="p" data-in="s3" data-out="s3:Konstitusi">
  <div class="kk">IDE PERTAMA</div>
  <div class="mega" data-at="s3:1827" data-fx="card"><b>1827</b><small>pindah ke<br>pedalaman</small></div>
  ${tag("idea", "José Bonifácio", "pencetus ide ibu kota di pedalaman", "s3:muncul")}
</div>
<div class="p" data-in="s3:Konstitusi" data-out="s4">
  <div class="kk">KONSTITUSI 1891</div>
  ${card("WAJIB PINDAH", "ibu kota ke dataran tengah", "s3:mewajibkan")}
  <div class="st" data-at="s3:kunjung" data-fx="stampc">PULUHAN TAHUN: TAK DIBANGUN</div>
</div>
<div class="p" data-in="s4" data-out="s4:Janjinya">
  <div class="kk">1956</div>
  ${tag("pres", "Juscelino Kubitschek", "Presiden Brasil 1956&ndash;1961", "s4:Juscelino")}
</div>
<div class="p" data-in="s4:Janjinya" data-out="s5">
  <div class="kk">JANJI KAMPANYE</div>
  <div class="duo"><div data-at="s4:lima" data-fx="card"><b>50</b><span>tahun kemajuan</span></div><div class="vs" data-at="s4:dalam" data-fx="card"><b>5</b><span>tahun saja</span></div></div>
  ${card("IBU KOTA BARU", "langsung dimulai", "s4:memulai", "bl")}
</div>
<div class="p" data-in="s5" data-out="s5:Rancangan">
  <div class="kk">1957</div>
  <div class="h2" data-at="s5:sayembara" data-fx="card" data-d="inline-block">Sayembara rancangan kota</div>
</div>
<div class="p" data-in="s5:Rancangan" data-out="s5:Arsitek">
  ${tag("plan", "Lúcio Costa", "pemenang sayembara, perencana kota", "s5:Costa")}
  <div class="chip" data-at="s5:pesawat" data-fx="card">${plane}<span>kota berbentuk <b>pesawat</b></span></div>
  ${card("SUMBU MONUMENTAL", "jalan lurus = badan pesawat", "s5:sumbu", "bl")}
</div>
<div class="p" data-in="s5:Arsitek" data-out="s6">
  ${tag("arch", "Oscar Niemeyer", "arsitek gedung-gedung putih", "s5:Niemeyer", SKY)}
  ${mon("s5:Arsitek", "s6:kemudian")}
</div>
<div class="p" data-in="s6" data-out="s6:Danau">
  ${mon("s6:Empat", "s6:kemudian", "big")}
  <div class="date" data-at="s6:21" data-fx="card"><b>21 April 1960</b><span>Brasília diresmikan</span></div>
</div>
<div class="p" data-in="s6:Danau" data-out="s7">
  <div class="kk bl">DANAU PARANOÁ &middot; BUATAN</div>
  ${card("KAMPUNG PEKERJA PERTAMA", "Vila Amaury, kini di dasar danau", "s6:kampung")}
  <div class="st" data-at="s6:tenggelam" data-fx="stampc">TENGGELAM</div>
</div>
<div class="p" data-in="s7" data-out="s7:Kini">
  <div class="mega" data-at="s7:1987" data-fx="card"><b>1987</b><small>diakui<br>dunia</small></div>
  <div class="st bl" data-at="s7:UNESCO" data-fx="stampc">WARISAN DUNIA UNESCO</div>
</div>
<div class="p" data-in="s7:Kini" data-out="s8">
  <div class="kk">BRASÍLIA KINI</div>
  <div class="cnt" data-at="s7:2,8" data-fx="card"><b class="num">&plusmn;<b class="ct" data-from="0" data-to="2.8" data-dec="1" data-a="s7:2,8" data-d="1.1">0</b></b><span>juta<br>jiwa</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">DATARAN TINGGI &middot; &plusmn;1.000 M DPL</div>
  <div class="h2">41 bulan, dari tanah merah</div>
  <div class="q" data-at="s8:Menurut" data-fx="card">Pelajaran apa untuk ibu kota baru Indonesia?</div>
</div>`;

const concrete = `linear-gradient(170deg,#F6F4EF,${CONC} 55%,#DDD8CE)`;
const css = `
.p{transform-origin:50% 0%}
.tape{position:absolute;inset:0;z-index:14;pointer-events:none;opacity:0}
.tin{position:absolute;left:-900px;top:-700px;width:2900px;height:3400px;transform:rotate(-13deg);display:flex;flex-direction:column}
.tin i{flex:1;display:flex;align-items:center;overflow:hidden;white-space:nowrap}
.tin i.y{background:repeating-linear-gradient(-45deg,${YEL} 0 60px,${INK} 60px 120px)}
.tin i.y span{display:inline-block;margin-left:700px;background:${YEL};padding:10px 30px;font-family:${HEAD};font-weight:900;font-size:58px;letter-spacing:.14em;color:${INK}}
.tin i.c{background:linear-gradient(180deg,#8E8A84,#77736D)}
.kk{display:inline-block;font-family:${HEAD};font-weight:800;font-size:26px;letter-spacing:.12em;color:#fff;background:${RED};padding:8px 18px 7px;margin-bottom:14px;box-shadow:0 8px 18px rgba(40,20,10,.35)}
.kk.bl{background:${SKY}}
.h1{display:inline-block;background:${concrete};padding:12px 28px 14px;box-shadow:0 16px 34px rgba(40,20,10,.4);font-family:${HEAD};font-weight:900;font-size:92px;line-height:1.02;color:${INK};border-bottom:16px solid transparent;border-image:repeating-linear-gradient(-45deg,${YEL} 0 16px,${INK} 16px 32px) 16}
.h1 em{font-style:normal;color:${RED}}
.h2{display:inline-block;background:${concrete};padding:10px 24px 12px;box-shadow:0 14px 30px rgba(40,20,10,.4);font-family:${HEAD};font-weight:800;font-size:56px;line-height:1.08;color:${INK}}
.card{background:${concrete};color:${INK};border-left:12px solid ${RED};box-shadow:0 14px 30px rgba(40,20,10,.4)}
.row{display:flex;flex-direction:column;gap:2px;margin-top:14px;padding:12px 22px 14px;width:max-content;max-width:880px}
.row b.sm{font-family:${HEAD};font-weight:800;font-size:40px;line-height:1.05;color:${RED};letter-spacing:.02em}
.row span{font-family:${BODY};font-weight:600;font-size:33px;line-height:1.2;color:${INK}}
.row.bl{border-left-color:${SKY}}.row.bl b.sm{color:#2F6FA8}
.tag{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 26px 12px 14px;background:${concrete};box-shadow:0 14px 30px rgba(40,20,10,.4);width:max-content;max-width:900px;border-top:6px solid ${INK}}
.tag .ic{flex:none;width:92px;height:92px}
.tag b{display:block;font-family:${HEAD};font-weight:800;font-size:42px;line-height:1.05;color:${INK}}
.tag span{display:block;font-family:${BODY};font-weight:500;font-size:30px;line-height:1.18;color:#4A4642;margin-top:4px}
.mega{display:flex;align-items:center;gap:20px;margin-top:4px;padding:0 26px 6px;background:${concrete};box-shadow:0 14px 30px rgba(40,20,10,.4);width:max-content;border-left:12px solid ${RED}}
.mega b{font-family:${HEAD};font-weight:900;font-size:150px;line-height:1.1;color:${RED}}
.mega small{font-family:${BODY};font-weight:600;font-size:36px;line-height:1.15;color:${INK}}
.mon{display:flex;align-items:center;gap:20px;margin-top:14px;padding:6px 26px 8px;background:#2B2E31;box-shadow:0 14px 30px rgba(40,20,10,.45);width:max-content;border-left:12px solid ${YEL}}
.mon span{font-family:${HEAD};font-weight:800;font-size:28px;letter-spacing:.12em;color:#fff;writing-mode:horizontal-tb;width:110px;line-height:1.1}
.mon b{font-family:${HEAD};font-weight:900;font-size:120px;line-height:1.08;color:#fff;min-width:150px;text-align:right;font-variant-numeric:tabular-nums}
.mon small{font-family:${BODY};font-weight:600;font-size:30px;color:#C9C4BB}
.mon.big b{font-size:170px;min-width:210px}
.date{margin-top:14px;padding:10px 26px 14px;background:${GRN};color:#fff;box-shadow:0 14px 30px rgba(40,20,10,.4);width:max-content;border-bottom:10px solid ${YEL}}
.date b{display:block;font-family:${HEAD};font-weight:900;font-size:64px;line-height:1.08}
.date span{display:block;font-family:${BODY};font-weight:600;font-size:32px}
.st{display:inline-block;margin-top:18px;font-family:${HEAD};font-weight:900;font-size:40px;letter-spacing:.06em;padding:8px 22px;color:${RED};border:6px solid ${RED};background:rgba(236,233,226,.95);transform:rotate(-3deg);box-shadow:0 10px 24px rgba(40,20,10,.4)}
.st.bl{color:#2F6FA8;border-color:#2F6FA8}
.duo{display:flex;gap:16px;width:860px}
.duo>div{flex:1;text-align:center;padding:4px 8px 14px;background:${concrete};border-top:12px solid #8E8A84;box-shadow:0 14px 30px rgba(40,20,10,.4)}
.duo b{display:block;font-family:${HEAD};font-weight:900;font-size:140px;line-height:1.08;color:#6B6660}
.duo span{display:block;font-family:${BODY};font-weight:700;font-size:32px;color:${INK}}
.duo .vs{border-top-color:${RED}}.duo .vs b{color:${RED}}
.chip{display:flex;align-items:center;gap:16px;margin-top:14px;padding:10px 24px;background:${YEL};width:max-content;box-shadow:0 12px 26px rgba(40,20,10,.4)}
.chip .pl{width:84px;height:54px}
.chip span{font-family:${BODY};font-weight:600;font-size:36px;color:${INK}}
.chip span b{font-family:${HEAD};font-weight:900}
.cnt{display:flex;align-items:center;gap:22px;margin-top:6px;padding:4px 28px 8px;background:${concrete};border-left:12px solid ${GRN};box-shadow:0 14px 30px rgba(40,20,10,.4);width:max-content}
.cnt>b{font-family:${HEAD};font-weight:900;font-size:150px;line-height:1.1;color:${INK}}
.cnt>b .ct{font-size:inherit;color:inherit}
.cnt span{font-family:${BODY};font-weight:600;font-size:38px;line-height:1.15;color:${INK}}
.q{margin-top:16px;font-family:${HEAD};font-weight:800;font-size:46px;line-height:1.14;padding:16px 24px;color:#fff;background:${RED};border-bottom:10px solid ${YEL};box-shadow:0 14px 30px rgba(40,20,10,.4);max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP14_BRASILIA_41_BULAN",
  ep: "14", bg: BG, vig: 0.32, grain: 0.06, capfloor: 0.0, html, css, chipFont: BODY, chipColor: "#fff",
  chip: "ILUSTRASI &middot; BENTUK GEDUNG DISEDERHANAKAN",
  extraAt: ["s2:Sebelumnya", "s2:Rio", "s2:penduduk", "s2:kekayaan", "s3:pedalaman", "s3:muncul", "s3:1827", "s3:Konstitusi", "s3:mewajibkan", "s3:dataran", "s3:Tapi", "s3:dibangun",
    "s4:Juscelino", "s4:Janjinya", "s4:memulai", "s5:Costa", "s5:pesawat", "s5:sumbu", "s5:badannya", "s5:Arsitek", "s5:putihnya", "s5:sayembara",
    "s6:21", "s6:diresmikan", "s6:Danau", "s6:tenggelam", "s6:kampung", "s7:UNESCO", "s7:Kini", "s7:juta", "s1:bulan", "s8:Menurut", "s6:kemudian", "s1:Sebuah", "s6:Empat"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(/row|tag|mega|mon|cnt|chip|duo/.test(e.className)?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:-60,transformOrigin:'50% 0%'},{opacity:1,y:0,duration:.42,ease:'back.out(1.2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,rotation:-8,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 tape:(e,t)=>{tl.set(e,{opacity:1},t-.5);tl.fromTo(e,{x:-2700},{x:0,duration:.46,ease:'power3.in',immediateRender:false},t-.46);tl.to(e,{x:2700,duration:.5,ease:'power3.out'},t+.06);tl.set(e,{opacity:0},t+.6);},`,
  // panels drop in like a slab lowered by a crane, and lift out
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-90},{opacity:1,y:0,duration:.5,ease:'back.out(1.1)'},a-.12)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-70,opacity:0,duration:.28,ease:'power2.in'},b-.28)`,
  hud: `(t)=>{document.querySelectorAll('.mn').forEach(e=>{const a=AT[e.dataset.a],b=AT[e.dataset.b];e.textContent=String(Math.max(0,Math.min(41,Math.floor(41*Math.min(1,Math.max(0,(t-a)/(b-a)))+(t>=b?0:0)))));});}`,
});

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
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Work Sans',Arial,sans-serif;font-weight:700;font-size:56px;line-height:1.16;word-spacing:.06em;color:#fff;padding:22px 26px 18px;background:linear-gradient(176deg,#6E6B66,#57544F 60%,#4C4945);box-shadow:0 12px 28px rgba(30,15,8,.5);border-top:10px solid transparent;border-image:repeating-linear-gradient(-45deg,${YEL} 0 14px,${INK} 14px 28px) 10 0 0 0;text-shadow:0 2px 0 rgba(0,0,0,.25)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Brasilia 41 Bulan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
