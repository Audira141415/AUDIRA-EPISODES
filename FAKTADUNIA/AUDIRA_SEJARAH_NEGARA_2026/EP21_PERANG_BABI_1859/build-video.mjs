// EP21 PERANG BABI 1859: TOYDIORAMA. The Pig War as a toy theatre ("TEATER AUDIRA"): red velvet curtains close and
// open between acts, a toy pig is the star, blue US toy soldiers face red British toy warships. Panels are kraft-paper
// tags pinned with washi tape (Bungee titles, IBM Plex Mono data); they drop in like hung cards. Run: node build-video.mjs
import { copyFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VEL = "#B3262E", USB = "#2F5DA8", UKR = "#C8322B", INK = "#2A1E17", KRAFT = "#DCC093", CREAM = "#FFF6E2", BG = "#120F16";
const HEAD = `Bungee, 'Arial Black', sans-serif`, MONO = `'IBM Plex Mono', 'Courier New', monospace`;

const tag = (name, role, a, cls = "") => `<div class="k tag ${cls}" data-at="${a}" data-fx="card"><i>NAMA</i><div><b>${name}</b><span>${role}</span></div></div>`;
const row = (b, s, a, cls = "") => `<div class="k row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const date = (s, d, a) => `<div class="k date" data-at="${a}" data-fx="card"><small>${s}</small><b>${d}</b></div>`;
const ct = (to, a, d = 1.0, pre = "") => `<b class="ct" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-pre="${pre}">${pre}0</b>`;
const vsRow = (num, lab, a) => `<div class="vr" data-at="${a}" data-fx="card"><b>${num}</b><span>${lab}</span></div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=IBM+Plex+Mono:wght@500;700&family=Outfit:wght@400;600&display=block">
<div class="pre"><span style="font-family:Bungee,sans-serif">PERANG BABI</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:700">1859</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">babi</span><span style="font-family:Outfit,sans-serif;font-weight:600">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 21</div>
  <div class="k ttl"><small>AMERIKA SERIKAT vs INGGRIS &middot; 1859</small><b>PERANG<br><em>BABI</em></b></div>
  <div class="stamp" data-at="s1:babi" data-fx="stamp2">PEMICUNYA: SEEKOR BABI</div>
</div>
<div class="p" data-in="s2" data-out="s2:Perjanjian">
  <div class="kk">BABAK II &middot; PETA</div>
  ${row("KEPULAUAN SAN JUAN", "di antara Amerika dan Pulau Vancouver", "s2:Kepulauan", "gr")}
</div>
<div class="p" data-in="s2:Perjanjian" data-out="s2:Masalahnya">
  ${date("PERJANJIAN OREGON", "15 JUNI 1846", "s2:Perjanjian")}
  ${row("BATAS DI &lsquo;TENGAH SELAT&rsquo;", "garis 49&deg; LU ditarik sampai ke laut", "s2:menarik")}
</div>
<div class="p" data-in="s2:Masalahnya" data-out="s3">
  <div class="kk">MASALAHNYA: ADA DUA SELAT</div>
  ${row("SELAT HARO", "klaim AS: batas di barat pulau-pulau", "s2:dua", "us")}
  ${row("SELAT ROSARIO", "klaim Inggris: batas di timur pulau-pulau", "s2:selat#2", "uk")}
  <div class="stamp" data-at="s2:mengklaim" data-fx="stamp2">SAMA-SAMA MENGKLAIM</div>
</div>
<div class="p" data-in="s3" data-out="s3:Pemiliknya">
  ${date("KEBUN DI PULAU SAN JUAN", "15 JUNI 1859", "s3:Lima")}
  ${tag("LYMAN CUTLAR", "petani Amerika", "s3:Lyman", "us")}
  ${row("MENEMBAK SEEKOR BABI", "yang memakan umbi di kebunnya", "s3:menembak", "uk")}
</div>
<div class="p" data-in="s3:Pemiliknya" data-out="s4">
  <div class="kk">PEMILIK BABINYA</div>
  ${tag("CHARLES GRIFFIN", "pegawai Hudson's Bay Company, perusahaan Inggris", "s3:Charles", "uk")}
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">GANTI RUGI</div>
  <div class="pair">
    <div class="k money us" data-at="s4:sepuluh" data-fx="card"><b>$10</b><span>TAWARAN<br>CUTLAR</span></div>
    <div class="k money uk" data-at="s4:seratus" data-fx="card"><b>$100</b><span>TUNTUTAN<br>GRIFFIN</span></div>
  </div>
  <div class="stamp" data-at="s4:membesar" data-fx="stamp2">CEPAT MEMBESAR!</div>
</div>
<div class="p" data-in="s5" data-out="s5:Sepuluh">
  ${tag("KAPTEN GEORGE PICKETT", "dikirim Amerika ke pulau", "s5:Kapten", "us")}
  <div class="k cnt us" data-at="s5:enam" data-fx="card">${ct(66, "s5:enam", 1.0)}<small>TENTARA</small></div>
  ${row("INGGRIS MEMBALAS", "dengan kapal perang", "s5:kapal", "uk")}
</div>
<div class="p" data-in="s5:Sepuluh" data-out="s6">
  <div class="kk">10 AGUSTUS 1859 &middot; BERHADAPAN</div>
  <div class="vs">
    <div class="col us"><div class="hd">AMERIKA</div>${vsRow(ct(461, "s5:461", 1.1), "tentara", "s5:461")}${vsRow("14", "meriam", "s5:empat")}</div>
    <div class="col uk"><div class="hd">INGGRIS</div>${vsRow("5", "kapal perang", "s5:lima")}${vsRow("70", "meriam", "s5:tujuh")}${vsRow(ct(2140, "s5:2.140", 1.2), "orang", "s5:2.140")}</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  ${tag("ROBERT BAYNES", "Laksamana Muda, Angkatan Laut Inggris", "s6:Laksamana", "uk")}
  <div class="k q" data-at="s6:menolak" data-fx="card">Menolak memulai perang <em>&ldquo;gara-gara ribut soal babi&rdquo;</em></div>
</div>
<div class="p" data-in="s7" data-out="s7:Tahun">
  <div class="kk">PENDUDUKAN BERSAMA</div>
  ${row("KAMP INGGRIS &middot; UTARA", "paling banyak 100 orang", "s7:masing-masing", "uk")}
  ${row("KAMP AS &middot; SELATAN", "paling banyak 100 orang", "s7:masing-masing+0.35", "us")}
  <div class="k cnt" data-at="s7:dua" data-fx="card">${ct(12, "s7:dua", 0.9, "&plusmn;")}<small>TAHUN</small></div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  ${date("ARBITRASE", "1872", "s7:1872")}
  ${tag("KAISAR WILHELM I", "Kaisar Jerman, penengah sengketa", "s7:Kaisar")}
  <div class="stamp blue" data-at="s7:memenangkan" data-fx="stamp2">AMERIKA MENANG</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="k cnt" data-at="s8:Perang" data-fx="card"><small>KORBAN<br>MANUSIA</small><b>0</b></div>
  <div class="k cnt uk" data-at="s8:Satu-satunya" data-fx="card"><small>SATU-SATUNYA<br>KORBAN</small><b>1 BABI</b></div>
  <div class="k q" data-at="s8:Menurut" data-fx="card">Masalah kecil apa yang paling sering <em>membesar tanpa perlu?</em></div>
</div>`;

const shadow = "0 12px 26px rgba(0,0,0,.5), 0 2px 0 rgba(0,0,0,.25)";
const kraft = `background:linear-gradient(172deg,#E6CDA0,${KRAFT} 45%,#CFB07C);box-shadow:${shadow};border-radius:10px`;
const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:.01}
.p{transform-origin:50% 0%}
.k{position:relative;${kraft}}
.k::before{content:"";position:absolute;top:-13px;left:50%;width:128px;height:28px;margin-left:-64px;background:repeating-linear-gradient(90deg,rgba(126,196,178,.85) 0 14px,rgba(150,214,196,.85) 14px 22px);transform:rotate(-3deg);box-shadow:0 2px 4px rgba(0,0,0,.18)}
.k.us::before{background:repeating-linear-gradient(90deg,rgba(150,190,240,.88) 0 14px,rgba(175,208,246,.88) 14px 22px)}
.k.uk::before{background:repeating-linear-gradient(90deg,rgba(240,165,165,.88) 0 14px,rgba(246,190,190,.88) 14px 22px)}
.kk{display:inline-block;font-family:${MONO};font-weight:700;font-size:27px;letter-spacing:.06em;color:${CREAM};background:${INK};padding:8px 18px;border-radius:6px;margin-bottom:26px;box-shadow:0 6px 14px rgba(0,0,0,.4)}
.ttl{display:inline-block;padding:30px 40px 22px;transform:rotate(-1.5deg)}
.ttl small{display:block;font-family:${MONO};font-weight:700;font-size:28px;letter-spacing:.04em;color:#5A3A1A}
.ttl b{display:block;font-family:${HEAD};font-weight:400;font-size:132px;line-height:.98;color:${INK};margin-top:8px}
.ttl em{font-style:normal;color:${VEL}}
.stamp{display:inline-block;margin-top:28px;font-family:${HEAD};font-weight:400;font-size:46px;line-height:1.1;letter-spacing:.02em;color:${VEL};border:6px solid ${VEL};padding:10px 22px 6px;background:rgba(255,246,226,.94);border-radius:8px;transform:rotate(-3deg);box-shadow:0 8px 18px rgba(0,0,0,.35)}
.stamp.blue{color:${USB};border-color:${USB}}
.row{flex-direction:column;margin-top:26px;padding:16px 28px 18px;border-left:16px solid #6FA35A;width:max-content;max-width:900px;box-sizing:border-box}
.row b{display:block;font-family:${HEAD};font-weight:400;font-size:46px;line-height:1.08;color:${INK}}
.row span{display:block;font-family:${MONO};font-weight:700;font-size:28px;line-height:1.3;color:#4A3420;margin-top:4px}
.row.us{border-left-color:${USB}}.row.uk{border-left-color:${UKR}}.row.us b{color:#1E3F7A}.row.uk b{color:#8E1F1A}
.date{margin-top:22px;padding:16px 30px 16px;border-top:10px solid ${VEL};width:max-content}
.date small{display:block;font-family:${MONO};font-weight:700;font-size:27px;letter-spacing:.05em;color:#5A3A1A}
.date b{display:block;font-family:${HEAD};font-weight:400;font-size:74px;line-height:1.05;color:${INK}}
.tag{align-items:center;gap:20px;margin-top:26px;padding:14px 28px 16px 14px;width:max-content;max-width:900px;box-sizing:border-box}
.tag i{flex:none;font-style:normal;font-family:${MONO};font-weight:700;font-size:21px;letter-spacing:.12em;color:${CREAM};background:${INK};padding:24px 9px;writing-mode:vertical-rl;transform:rotate(180deg);border-radius:4px}
.tag.us i{background:${USB}}.tag.uk i{background:${UKR}}
.tag b{display:block;font-family:${HEAD};font-weight:400;font-size:46px;line-height:1.08;color:${INK}}
.tag span{display:block;font-family:${MONO};font-weight:700;font-size:27px;line-height:1.28;color:#4A3420;margin-top:4px}
.cnt{align-items:center;gap:22px;margin-top:26px;padding:6px 32px 8px;width:max-content}
.cnt>b,.cnt .ct{font-family:${HEAD};font-weight:400;font-size:120px;line-height:1.08;color:${INK}}
.cnt small{font-family:${MONO};font-weight:700;font-size:32px;line-height:1.15;color:#4A3420}
.cnt.us>b,.cnt.us .ct{color:${USB}}.cnt.uk>b{color:${VEL}}
.pair{display:flex;gap:26px;margin-top:6px}
.money{align-items:center;gap:18px;padding:12px 28px 14px}
.money b{font-family:${HEAD};font-weight:400;font-size:96px;line-height:1.05}
.money.us b{color:${USB}}.money.uk b{color:${VEL}}
.money span{font-family:${MONO};font-weight:700;font-size:25px;line-height:1.2;color:#4A3420}
.vs{display:flex;gap:22px}
.col{flex:1;display:flex;flex-direction:column;gap:14px}
.col .hd{font-family:${HEAD};font-weight:400;font-size:40px;color:${CREAM};padding:8px 18px 4px;border-radius:8px;box-shadow:${shadow}}
.col.us .hd{background:${USB}}.col.uk .hd{background:${UKR}}
.vr{align-items:baseline;gap:14px;padding:4px 20px 8px;${kraft}}
.vr b,.vr .ct{font-family:${HEAD};font-weight:400;font-size:70px;line-height:1.1;color:${INK}}
.col.us .vr b,.col.us .vr .ct{color:${USB}}.col.uk .vr b,.col.uk .vr .ct{color:#8E1F1A}
.vr span{font-family:${MONO};font-weight:700;font-size:26px;color:#4A3420}
.q{margin-top:26px;padding:20px 30px 22px;font-family:${HEAD};font-weight:400;font-size:44px;line-height:1.16;color:${CREAM};background:${INK};max-width:880px;box-sizing:border-box}
.q em{font-style:normal;color:#FFC93C}`;

mkdirSync("PROJECT/HyperFrames_Remotion/assets/audio", { recursive: true });
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP21_PERANG_BABI_1859",
  ep: "21", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.0, html, css, chipFont: MONO, chipColor: CREAM,
  chip: "DIORAMA MAINAN &middot; ILUSTRASI SEJARAH",
  extraAt: ["s1:Pemicunya", "s1:babi", "s2:Kepulauan", "s2:Vancouver", "s2:menarik", "s2:tengah", "s2:Masalahnya", "s2:dua", "s2:selat#2", "s2:mengklaim",
    "s3:Lyman", "s3:menembak", "s3:Pemiliknya", "s3:Charles", "s4:menawarkan", "s4:sepuluh", "s4:seratus", "s4:membesar", "s4:Perselisihan",
    "s5:Kapten", "s5:Pickett", "s5:enam", "s5:kapal", "s5:461", "s5:empat", "s5:lima", "s5:tujuh", "s5:2.140",
    "s6:Laksamana", "s6:Baynes", "s6:menolak", "s6:babi", "s7:bersama", "s7:masing-masing", "s7:selama", "s7:1872", "s7:arbitrase", "s7:Kaisar", "s7:memenangkan",
    "s8:korban", "s8:Satu-satunya", "s8:Menurut", "s8:Ikuti", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.tag,.cnt,.money,.vr')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:-26,rotation:-2.5},{opacity:1,y:0,rotation:0,duration:.45,ease:'back.out(1.7)',immediateRender:false},t);},
 stamp2:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,rotation:-9,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-40,rotation:-1.5},{opacity:1,y:0,rotation:0,duration:.5,ease:'back.out(1.5)'},a+.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-36,duration:.26,ease:'power2.in'},b-.32)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Bungee,'Arial Black',sans-serif;font-weight:400;font-size:56px;line-height:1.16;letter-spacing:.01em;color:#FFF6E2;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 0 ${INK},0 10px 18px rgba(0,0,0,.5)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFF6E2"},{color:"#FFC93C",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF6E2",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.22,ease:"back.out(1.8)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Perang Babi 1859", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
