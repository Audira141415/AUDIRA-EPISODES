// EP54 KOTA BERTEMBOK KOWLOON: ISOCRAFT. An isometric ink-comic megablock on one plot: a cutaway tower full of tiny
// lives, the 1847 fort, the 1898 lease map with the enclave cut out, wall stones flying to Kai Tak, floor-by-floor
// self-built growth under the 14-floor flight path, a sunless alley, demolition and the park, then a sci-fi ghost.
// Panels are white comic cards (Anton + Inter) with a coral tag. Batch device: a stacked floor-counter strip
// (1898 → PENGUNGSI → 14 LANTAI → 33.000 → DIBONGKAR → TAMAN) whose towers grow one step per narrated beat.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1C1E21", CORAL = "#E06D53", RED = "#D84A3A", YEL = "#F4C430", MINT = "#5FA084", BLUE = "#7A9BB8", PAPER = "#F5F2EB", BG = "#F1ECE2";
const HEAD = `Anton,Impact,sans-serif`, BODY = `Inter,Arial,sans-serif`, MONO = `'JetBrains Mono',Consolas,monospace`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (t) => `<div class="kk">${t}</div>`;
const ct = (to, a, d = 0.9, dec = 0) => `<span class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-dec="${dec}">${to}</span>`;

// device: [label, sub, anchor, floors, kind]
const DEV = [
  ["1898", "dikecualikan", "s2:dikecualikan", 1, "y"],
  ["PENGUNGSI", "berdatangan", "s4:pengungsi", 2, "c"],
  ["14 LANTAI", "batas pesawat", "s4:empat", 5, "b"],
  ["33.000", "jiwa", "s5:menempel", 6, "c"],
  ["DIBONGKAR", "1993–1994", "s7:dibongkar", 3, "x"],
  ["TAMAN", "kini", "s7:taman", 0, "g"],
];
const dev = DEV.map(([b, s, a, n, k], i) => {
  const fl = Array.from({ length: n }, (_, j) => `<i class="fl ${k}" style="bottom:${44 + j * 17}px;${k === "x" ? `transform:rotate(${(j % 2 ? 1 : -1) * (4 + j * 3)}deg) translateX(${(j % 2 ? 1 : -1) * j * 3}px)` : ""}"></i>`).join("");
  const park = k === "g" ? `<i class="pk"></i><i class="tr" style="left:30px"></i><i class="tr" style="left:66px;transform:scale(.8)"></i><i class="tr" style="left:98px;transform:scale(1.1)"></i>` : "";
  return `<div class="dc" style="left:${18 + i * 166}px" data-at="${a}" data-fx="dev"><div class="tw">${fl}${park}</div><div class="dl"><b>${b}</b><span>${s}</span></div></div>`;
}).join("");

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500;700;800;900&family=JetBrains+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:Anton">KOWLOON 14</span><span style="font-family:Inter;font-weight:900">a</span><span style="font-family:Inter;font-weight:800">a</span><span style="font-family:Inter;font-weight:700">a</span><span style="font-family:Inter;font-weight:500">a</span><span style="font-family:'JetBrains Mono';font-weight:700">A 1</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("FAKTA SEJARAH NEGARA &middot; EP 54")}
  <div class="cd mega"><b>${ct(33000, "s1:Tiga", 1.0)}</b><small>ORANG</small></div>
  ${row("DI LAHAN ±2,6 HEKTARE", "tidak sampai 4 lapangan bola", "s1:lahan")}
  <div class="chips"><i class="ch" data-at="s1:terpadat" data-fx="stampc">SALAH SATU TERPADAT DI BUMI</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:Tahun">
  ${kk("HONG KONG")}
  <div class="cd h2">Kota Bertembok<br><em>Kowloon</em></div>
  ${row("AWALNYA BENTENG KECIL CHINA", "benteng pantai, dibangun 1847", "s2:benteng")}
</div>
<div class="p" data-in="s2:Tahun" data-out="s3">
  ${kk("KONVENSI 1898")}
  ${row("INGGRIS MENYEWA WILAYAH SEKITARNYA", "sewa 99 tahun", "s2:Inggris")}
  <div class="chips"><i class="ch big" data-at="s2:dikecualikan" data-fx="stampc">BENTENG DIKECUALIKAN</i></div>
</div>
<div class="p" data-in="s3" data-out="s3:Saat">
  ${kk("HASILNYA")}
  ${row("SEPOTONG TANAH CHINA", "di tengah Hong Kong Inggris", "s3:sepotong", "rd")}
  ${row("KEDUA NEGARA ENGGAN MENGURUS", "", "s3:enggan")}
</div>
<div class="p" data-in="s3:Saat" data-out="s4">
  ${kk("PERANG DUNIA II")}
  ${row("JEPANG MEMBONGKAR TEMBOK", "", "s3:membongkar", "rd")}
  ${row("BATUNYA &rarr; BANDARA KAI TAK", "dipakai memperluas landasan", "s3:batunya")}
</div>
<div class="p" data-in="s4" data-out="s4:Tingginya">
  ${kk("SETELAH PERANG")}
  ${row("PENGUNGSI BERDATANGAN", "", "s4:pengungsi")}
  ${row("BANGUNAN DI ATAS BANGUNAN", "tanpa izin &middot; tanpa insinyur", "s4:membangun", "rd")}
</div>
<div class="p" data-in="s4:Tingginya" data-out="s5">
  ${kk("BATAS TINGGI")}
  ${row("PESAWAT TERBANG RENDAH KE KAI TAK", "", "s4:pesawat")}
  <div class="cd mega red" data-at="s4:Tak" data-fx="card"><b>${ct(14, "s4:Tak", 0.75)}</b><small>LANTAI<br>MAKSIMAL</small></div>
</div>
<div class="p" data-in="s5" data-out="s5:Lorong">
  ${kk("AKHIR 1980-AN")}
  <div class="cd mega" data-at="s5:sekitar" data-fx="card"><b>±${ct(300, "s5:sekitar", 0.8)}</b><small>GEDUNG<br>JADI SATU</small></div>
  <div class="cd mega red" data-at="s5:Kepadatannya" data-fx="card"><b>±${ct(1.2, "s5:Kepadatannya", 1.5, 1)}</b><small>JUTA ORANG<br>PER KM²</small></div>
</div>
<div class="p" data-in="s5:Lorong" data-out="s6">
  ${kk("LORONG BAWAH")}
  ${row("HAMPIR TAK PERNAH KENA MATAHARI", "gelap, pipa dan kabel di mana-mana", "s5:Lorong")}
</div>
<div class="p" data-in="s6" data-out="s6:Tapi">
  ${kk("1950-AN &ndash; 1970-AN")}
  ${row("GENG KRIMINAL SEMPAT BERKUASA", "", "s6:Geng", "rd")}
</div>
<div class="p" data-in="s6:Tapi" data-out="s7">
  ${kk("TAPI KEBANYAKAN WARGA HIDUP BIASA")}
  ${row("PABRIK KECIL", "", "s6:pabrik")}
  ${row("SEKOLAH", "", "s6:sekolah")}
  ${row("BANYAK DOKTER GIGI", "tanpa izin praktik", "s6:dokter", "rd")}
</div>
<div class="p" data-in="s7" data-out="s7:Antara">
  ${kk("INGGRIS + CHINA")}
  <div class="cd mega"><b>1987</b><small>DIUMUMKAN:<br>DIBONGKAR</small></div>
</div>
<div class="p" data-in="s7:Antara" data-out="s8">
  ${kk("PEMBONGKARAN")}
  <div class="cd mega red" data-at="s7:Antara" data-fx="card"><b>1993&ndash;94</b></div>
  ${row("SELURUH BANGUNAN DIRATAKAN", "", "s7:diratakan")}
  ${row("KINI MENJADI TAMAN", "dibuka Desember 1995", "s7:taman", "gr")}
</div>
<div class="p" data-in="s8" data-out="s8:Sanggupkah">
  ${kk("KOTA TANPA PEMERINTAH")}
  ${row("BENTUKNYA HIDUP TERUS", "di film dan game fiksi ilmiah", "s8:bentuknya")}
</div>
<div class="p" data-in="s8:Sanggupkah" data-out="@END">
  <div class="cd q">Sanggupkah kamu tinggal di sana? <em>Tulis di komentar!</em></div>
</div>
<div id="dev" data-at="s2:dikecualikan" data-fx="fade"><i class="base"></i>${dev}</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:#fff;border:5px solid ${INK};border-radius:6px;box-shadow:10px 10px 0 ${INK}}
.kk{display:inline-block;font-family:${MONO};font-weight:700;font-size:28px;line-height:1.1;letter-spacing:.04em;color:#fff;background:${CORAL};padding:9px 18px 7px;border:4px solid ${INK};border-radius:4px;box-shadow:6px 6px 0 ${INK};margin-bottom:22px}
.h2{display:inline-block;padding:14px 28px 12px;font-family:${HEAD};font-weight:400;font-size:96px;line-height:1.02;letter-spacing:.01em;color:${INK};text-transform:uppercase}
.h2 em{font-style:normal;color:${CORAL}}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:26px}
.ch{display:inline-block;font-style:normal;font-family:${HEAD};font-weight:400;font-size:52px;line-height:1.1;letter-spacing:.02em;padding:10px 24px 8px;border:5px solid ${INK};color:#fff;background:${RED};border-radius:6px;transform:rotate(-3deg);box-shadow:7px 7px 0 ${INK}}
.ch.big{font-size:64px}
.row{display:flex;flex-direction:column;margin-top:20px;padding:12px 24px 14px;border-left:18px solid ${BLUE};max-width:880px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:${HEAD};font-weight:400;font-size:54px;line-height:1.08;letter-spacing:.01em;color:${INK}}
.row span{display:block;margin-top:4px;font-family:${BODY};font-weight:700;font-size:31px;line-height:1.2;color:#3a3f44}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}.row.gr{border-left-color:${MINT}}.row.gr b{color:#2E7A5A}
.mega{display:flex;align-items:center;gap:22px;width:max-content;padding:4px 30px 6px;margin-top:6px}
.mega b{font-family:${HEAD};font-weight:400;font-size:168px;line-height:1.08;letter-spacing:.01em;color:${INK}}
.mega b .ct{font:inherit;color:inherit}
.mega small{font-family:${HEAD};font-weight:400;font-size:46px;line-height:1.05;letter-spacing:.02em;color:${CORAL}}
.mega.red{background:${RED};margin-top:22px}.mega.red b,.mega.red small{color:#fff}
.q{padding:18px 28px 16px;font-family:${HEAD};font-weight:400;font-size:66px;line-height:1.08;color:#fff;background:${RED};max-width:860px}
.q em{display:block;margin-top:8px;font-style:normal;font-size:46px;color:${YEL}}
#dev{position:absolute;left:24px;top:1086px;width:1010px;height:190px;z-index:10}
#dev .base{position:absolute;left:0;right:0;top:142px;height:7px;background:${INK};border-radius:3px}
.dc{position:absolute;top:0;width:150px;height:190px}
.dc .tw{position:absolute;left:0;top:0;width:150px;height:148px}
.fl{position:absolute;left:22px;width:100px;height:15px;border:3px solid ${INK};box-sizing:border-box;background:#fff;box-shadow:5px -4px 0 rgba(28,30,33,.85)}
.fl.y{background:${YEL}}.fl.c{background:#F1D3C2}.fl.b{background:#D3DCE4}.fl.x{background:#C9BBA0}
.fl::after{content:"";position:absolute;left:8px;top:3px;width:70px;height:3px;background:repeating-linear-gradient(90deg,${INK} 0 8px,transparent 8px 14px)}
.pk{position:absolute;left:12px;bottom:4px;width:120px;height:26px;border:3px solid ${INK};border-radius:60px 60px 0 0;background:${MINT};box-sizing:border-box}
.tr{position:absolute;bottom:24px;width:24px;height:40px}
.tr::before{content:"";position:absolute;left:9px;bottom:0;width:6px;height:16px;background:#7A5A3E;border:2px solid ${INK}}
.tr::after{content:"";position:absolute;left:0;bottom:14px;width:24px;height:24px;border-radius:50%;background:#7FB069;border:3px solid ${INK};box-sizing:border-box}
.dl{position:absolute;left:-4px;top:154px;width:158px;text-align:center}
.dl b{display:block;font-family:${HEAD};font-weight:400;font-size:27px;line-height:1;color:#fff;background:${INK};padding:4px 4px 3px;border-radius:3px}
.dl span{display:block;margin-top:2px;font-family:${BODY};font-weight:800;font-size:16px;color:${INK};background:rgba(255,255,255,.85)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP54_KOTA_BERTEMBOK_KOWLOON",
  ep: "54", bg: BG, vig: 0.18, grain: 0.05, capfloor: 0.0, html, css, chipFont: MONO, chipColor: INK,
  chip: "ILUSTRASI SKEMATIK &middot; BUKAN FOTO",
  extraAt: ["s1:lahan", "s1:lapangan", "s1:terpadat", "s1:Ini", "s1:Bumi", "s2:Kota", "s2:Awalnya", "s2:benteng", "s2:benteng#2", "s2:Tahun", "s2:Inggris", "s2:dikecualikan",
    "s3:sepotong", "s3:enggan", "s3:Saat", "s3:Perang", "s3:membongkar", "s3:batunya", "s3:bandara", "s3:Kai", "s3:Tak",
    "s4:Setelah", "s4:pengungsi", "s4:berdatangan", "s4:Mereka", "s4:membangun", "s4:insinyur", "s4:Tingginya", "s4:pesawat", "s4:rendah", "s4:maksimal", "s4:empat", "s4:belas", "s4:lantai",
    "s5:sekitar", "s5:ratus", "s5:juta", "s5:menempel", "s5:Kepadatannya", "s5:Lorong", "s5:hampir", "s5:matahari",
    "s6:Geng", "s6:sini", "s6:Tapi", "s6:warganya", "s6:hidup", "s6:pabrik", "s6:sekolah", "s6:dokter", "s6:izin",
    "s7:dibongkar", "s7:Antara", "s7:diratakan", "s7:kini", "s7:taman", "s8:bentuknya", "s8:fiksi", "s8:Sanggupkah"],
  fxExtra: `card:(e,t)=>{const d=e.matches('.row,.mega')?'flex':'block';gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-70,rotation:-2},{opacity:1,x:0,rotation:0,duration:.3,ease:'back.out(2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:2,opacity:0,rotation:-12},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},
 dev:(e,t)=>{gsap.set(e,{opacity:0});tl.set(e,{opacity:1},t-.01);const fl=e.querySelectorAll('.fl,.pk,.tr');fl.forEach((f,j)=>tl.fromTo(f,{y:-60,opacity:0},{y:0,opacity:1,duration:.22,ease:'power3.in',immediateRender:false},t+j*.09));tl.fromTo(e.querySelector('.dl'),{scale:.6,opacity:0},{scale:1,opacity:1,duration:.3,ease:'back.out(2)',immediateRender:false},t+.05);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-80,rotation:-1.5},{opacity:1,x:0,rotation:0,duration:.34,ease:'back.out(1.8)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:70,duration:.2,ease:'power2.in'},b-.2)`,
  hud: `(t)=>{const d=q('#dev');if(d)d.style.visibility=(t>AT['s8:Sanggupkah']-0.1)?'hidden':'visible';}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:70px;line-height:1.1;letter-spacing:.02em;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:6px 7px 0 ${INK};text-transform:uppercase}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:28},{opacity:1,y:0,duration:.2,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kota Bertembok Kowloon", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
