// EP55 BAU BUSUK LONDON 1858: INNERWORKS. A cutaway diorama block of the Thames bank: the river runs into depth,
// the front face is a cross-section through soil, river and (later) Bazalgette's egg-shaped intercepting sewer.
// Look: CINEMA_TEAL_ORANGE (exposure 1.0, envIntensity 0.55). Panels are dark teal "engineering drawing" cards with
// brass rules and a Victorian serif headline. Batch device: a pipe-flow strip in the y≈1100–1280 band; every narrated
// beat fills one pipe segment (LIMBAH → KOLERA → JOHN SNOW → BAU BUSUK → UU → SELOKAN → KOLERA BERHENTI).
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BR = "#E9A84C", TEAL = "#4FD1C5", INK = "#081418", CRE = "#F1E8D8", MUT = "#9FB3B0", RED = "#E5533D", GRN = "#B5D86A", MUD = "#8A5A2B", BG = "#071216";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d = 0.9, from = 0) => `<span class="ct nb" data-from="${from}" data-to="${to}" data-a="${a}" data-d="${d}">${to}</span>`;
const name = (n, r, a) => `<div class="cd nm" data-at="${a}" data-fx="card"><i class="tag">TOKOH</i><b>${n}</b><span>${r}</span></div>`;

// pipe-flow device: [label, colour class, anchor]
const DEV = [
  ["LIMBAH", "mud", "s2:limbah"],
  ["KOLERA", "mud", "s3:Kolera"],
  ["JOHN<br>SNOW", "brs", "s4:John"],
  ["BAU<br>BUSUK", "grn", "s5:mendidih"],
  ["UU", "brs", "s6:disahkan"],
  ["SELOKAN", "tl", "s7:selokan"],
  ["KOLERA<br>BERHENTI", "tl", "s7:berhenti"],
];
const SEGW = 132, SEG0 = 26;
const dev = DEV.map(([b, c, a], i) => `<div class="sg ${c}" style="left:${SEG0 + i * SEGW}px" data-at="${a}" data-fx="seg"><div class="lb"><em>${i + 1}</em><b>${b}</b></div><div class="tube"><i class="fl"></i></div></div>`).join("");

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Archivo:wght@500;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Playfair Display';font-weight:900">LONDON 1858</span><span style="font-family:'Playfair Display';font-weight:700">a</span><span style="font-family:'Archivo';font-weight:900">a</span><span style="font-family:'Archivo';font-weight:800">a</span><span style="font-family:'Archivo';font-weight:700">a</span><span style="font-family:'Archivo';font-weight:500">a</span><span style="font-family:'IBM Plex Mono';font-weight:700">A 1</span><span style="font-family:'IBM Plex Mono';font-weight:500">A 1</span></div>
<div id="heat"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 55", "FAKTA SEJARAH NEGARA")}
  <div class="h1"><span class="ln">BAU BUSUK</span><span class="ln big">LONDON 1858</span></div>
  <div class="chips"><i class="ch st1" data-at="s1:bau" data-fx="stampc">THE GREAT STINK</i><i class="ch st2" data-at="s1:parlemen" data-fx="stampc">PARLEMEN LUMPUH</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:Masalahnya">
  ${kk("01", "PENDUDUK LONDON")}
  <div class="cd row big2" data-at="s2:satu" data-fx="card"><b>±1 JUTA</b><b class="to" data-at="s2:tiga" data-fx="card">→ 3 JUTA</b><span>limbah ikut berlipat</span></div>
  ${row("TOILET SIRAM MULAI POPULER", "air bilasan menambah volume limbah", "s2:Toilet", "br")}
</div>
<div class="p" data-in="s2:Masalahnya" data-out="s3">
  ${kk("02", "MASALAHNYA")}
  ${row("SEMUA LIMBAH → SUNGAI THAMES", "selokan tua membuang langsung ke sungai", "s2:limbah", "md")}
  ${row("DI TENGAH KOTA", "sungai yang sama dipakai warga", "s2:tengah")}
</div>
<div class="p" data-in="s3" data-out="s3:Tahun">
  ${kk("03", "TEORI MIASMA")}
  ${row("PENYAKIT = BAU BUSUK?", "orang percaya penyakit menular lewat udara busuk", "s3:percaya", "gn")}
  ${row("KOLERA BERKALI-KALI MEWABAH", "", "s3:Kolera", "md")}
</div>
<div class="p" data-in="s3:Tahun" data-out="s4">
  ${kk("04", "WABAH KOLERA 1831 · LONDON")}
  <div class="cd row big2" data-at="s3:1831" data-fx="card"><b>${ct(6536, "s3:enam", 0.9)} <small>ORANG</small></b><span>meninggal dalam satu wabah</span></div>
</div>
<div class="p" data-in="s4" data-out="s4:Ia">
  ${kk("05", "SEORANG DOKTER")}
  ${name("JOHN SNOW", "dokter · London", "s4:John")}
  ${row("KOLERA MENYEBAR LEWAT AIR TERCEMAR", "bukan lewat bau", "s4:air", "tl")}
</div>
<div class="p" data-in="s4:Ia" data-out="s5">
  ${kk("06", "BROAD STREET · 1854")}
  ${row("GAGANG POMPA DICOPOT", "warga tak bisa lagi menimba air sumur itu", "s4:mencopot", "br")}
  ${row("KEMATIAN DI SEKITARNYA TURUN ↓", "", "s4:turun", "tl")}
  <div class="ban" data-at="s4:mendengarnya" data-fx="stampc">HAMPIR TAK DIDENGAR</div>
</div>
<div class="p" data-in="s5" data-out="s5:Gedung">
  ${kk("07", "JULI 1858 · MUSIM PANAS")}
  ${row("THAMES &ldquo;MENDIDIH&rdquo; OLEH LIMBAH", "panas mempercepat pembusukan", "s5:mendidih", "gn")}
</div>
<div class="p" data-in="s5:Gedung" data-out="s6">
  ${kk("08", "GEDUNG PARLEMEN")}
  ${row("BERDIRI TEPAT DI TEPI SUNGAI", "", "s5:Gedung")}
  ${row("TIRAI DIRENDAM KAPUR KLORIDA", "di sisi yang menghadap sungai", "s5:kapur", "br")}
  <div class="ban" data-at="s5:masuk" data-fx="stampc">BAU TETAP MASUK</div>
</div>
<div class="p" data-in="s6" data-out="s6:Dalam">
  ${kk("09", "KALI INI BERBEDA")}
  ${row("POLITISI MENCIUM MASALAHNYA SENDIRI", "", "s6:mencium", "gn")}
</div>
<div class="p" data-in="s6:Dalam" data-out="s7">
  ${kk("10", "DALAM HITUNGAN MINGGU")}
  <div class="cd row" data-at="s6:undang-undang" data-fx="card"><b>UNDANG-UNDANG</b><i class="stp" data-at="s6:disahkan" data-fx="stampc">DISAHKAN 2 AGUSTUS 1858</i></div>
  <div class="cd row big2 br" data-at="s6:dana" data-fx="card"><b>£${ct(3, "s6:dana", 0.45)} <small>JUTA</small></b><span>dana pinjaman disetujui</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Limbah">
  ${kk("11", "SISTEM BAZALGETTE")}
  ${name("JOSEPH BAZALGETTE", "insinyur", "s7:Bazalgette")}
  ${row(`${ct(132, "s7:seratus", 1.1)} KM SELOKAN UTAMA`, "", "s7:seratus", "tl")}
  ${row(`±${ct(1800, "s7:seribu", 1.0)} KM SELOKAN JALAN`, "", "s7:seribu", "br")}
</div>
<div class="p" data-in="s7:Limbah" data-out="s8">
  ${kk("12", "HASILNYA")}
  ${row("LIMBAH → KE TIMUR, JAUH DARI KOTA", "dipompa dan dialirkan ke hilir", "s7:timur", "tl")}
  ${row("WABAH KOLERA DI LONDON BERHENTI", "wabah 1866 hanya di area yang belum tersambung", "s7:berhenti", "tl")}
</div>
<div class="p" data-in="s8" data-out="s8:Selokan">
  ${kk("13", "IRONISNYA")}
  <div class="cd irn" data-at="s8:proyek" data-fx="card"><b>Dibangun melawan <s data-at="s8:bukan" data-fx="strike">BAU</s>,</b><b class="ok" data-at="s8:tepat" data-fx="card">menyelamatkan dari AIR KOTOR.</b></div>
</div>
<div class="p" data-in="s8:Selokan" data-out="s8:Menurut">
  ${kk("14", "HARI INI")}
  ${row("SELOKAN BAZALGETTE MASIH DIPAKAI", "melayani London dengan lebih dari 9 juta jiwa", "s8:dipakai", "tl")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Masalah apa yang baru diurus setelah pejabat merasakannya sendiri? <em>Tulis di komentar!</em></div>
</div>
<div id="dev" data-at="s2:limbah" data-fx="fade">
  <div class="rail"></div>
  ${dev}
  <div class="valve"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="none" stroke="#E9A84C" stroke-width="6"/><path d="M30 6V54M6 30H54M13 13L47 47M47 13L13 47" stroke="#E9A84C" stroke-width="4"/><circle cx="30" cy="30" r="7" fill="#E9A84C"/></svg></div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
#heat{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 60%,rgba(190,220,110,.22),rgba(140,170,60,0) 65%)}
.cd{position:relative;background:linear-gradient(180deg,rgba(10,30,34,.88),rgba(6,18,22,.9));border:1.5px solid rgba(233,168,76,.55);border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,236,200,.14)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.08em;color:${BR};margin-bottom:16px;padding:7px 18px 7px 7px;background:rgba(6,18,22,.84);border:1.5px solid rgba(233,168,76,.6);border-radius:4px}
.kk i{font-style:normal;background:${BR};color:${INK};padding:3px 12px;border-radius:3px}
.h1{display:flex;flex-direction:column;align-items:flex-start}
.h1 .ln{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:118px;line-height:.98;letter-spacing:-.005em;color:${CRE};text-shadow:0 6px 24px rgba(0,0,0,.7)}
.h1 .big{font-size:132px;line-height:1.02;background:linear-gradient(180deg,#FFE9BE 0%,#F2B65A 45%,#C9772A 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(20,8,0,.9)) drop-shadow(0 8px 22px rgba(0,0,0,.7))}
.chips{display:flex;gap:14px;margin-top:22px;flex-wrap:wrap}
.ch{font-style:normal;font-family:Archivo,sans-serif;font-weight:900;font-size:42px;line-height:1;letter-spacing:.02em;padding:14px 22px 12px;border-radius:6px}
.st1{background:${GRN};color:${INK};transform:rotate(-2deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.st2{background:${RED};color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.45)}
.ban{display:inline-block;font-family:Archivo,sans-serif;font-weight:900;font-size:62px;line-height:1;color:#fff;background:${RED};padding:16px 26px 14px;border-radius:6px;transform:rotate(-2deg);box-shadow:0 14px 34px rgba(0,0,0,.5);margin-top:18px}
.row{display:flex;flex-direction:column;margin-top:16px;padding:14px 26px 16px;border-left:12px solid ${BR};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:Archivo,sans-serif;font-weight:900;font-size:50px;line-height:1.05;color:${CRE}}
.row b .ct{display:inline;font:inherit;color:${BR}}
.row span{display:block;margin-top:6px;font-family:Archivo,sans-serif;font-weight:500;font-size:32px;line-height:1.2;color:${MUT};max-width:820px}
.row.br b{color:${BR}}.row.md{border-left-color:${MUD}}.row.md b{color:#E3B07A}.row.gn{border-left-color:${GRN}}.row.gn b{color:${GRN}}
.row.tl{border-left-color:${TEAL}}.row.tl b{color:#9FF0E6}.row.tl b .ct{color:${TEAL}}
.big2 b.to{display:block;margin-top:6px;color:#F1E8D8}
.big2 b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:92px;line-height:1;color:${BR}}.big2 b small{font-size:44px;color:${CRE}}.big2 b .ct{color:${BR}}
.nm{display:flex;flex-direction:column;padding:16px 28px 18px;border-left:12px solid ${CRE};width:max-content;max-width:900px;margin-top:6px}
.nm .tag{position:absolute;right:16px;top:14px;font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:20px;letter-spacing:.1em;color:${INK};background:${CRE};padding:3px 9px;border-radius:3px}
.nm b{font-family:'Playfair Display',serif;font-weight:900;font-size:64px;line-height:1;color:${CRE};padding-right:110px}
.nm span{margin-top:6px;font-family:Archivo,sans-serif;font-weight:700;font-size:32px;color:${BR}}
.stp{position:absolute;right:-24px;top:-34px;font-style:normal;font-family:Archivo,sans-serif;font-weight:900;font-size:34px;line-height:1;color:#fff;background:${RED};border:3px solid #fff;border-radius:6px;padding:10px 14px 8px;transform:rotate(5deg);box-shadow:0 8px 20px rgba(0,0,0,.45);white-space:nowrap}
.irn{flex-direction:column;padding:22px 30px 24px;border-left:12px solid ${GRN};max-width:910px}
.irn b{display:block;font-family:'Playfair Display',serif;font-weight:900;font-size:66px;line-height:1.1;color:${CRE}}
.irn s{text-decoration:none;position:relative;color:${GRN}}
.irn s::after{content:"";position:absolute;left:-6px;right:-6px;top:52%;height:8px;background:${RED};transform-origin:0 50%;transform:scaleX(var(--k,0))}
.irn .ok{margin-top:10px;color:#9FF0E6}
.q{margin-top:10px;padding:22px 30px 24px;font-family:Archivo,sans-serif;font-weight:800;font-size:54px;line-height:1.12;color:${CRE};border-left:12px solid ${BR};max-width:900px}
.q em{display:block;margin-top:12px;font-style:normal;color:${BR};font-size:44px}
#dev{position:absolute;left:30px;top:1104px;width:1000px;height:170px;z-index:10}
#dev .rail{position:absolute;left:${SEG0 - 6}px;top:108px;width:${DEV.length * SEGW + 12}px;height:46px;border-radius:23px;background:linear-gradient(180deg,#3B2B22,#1A120D);box-shadow:0 10px 24px rgba(0,0,0,.55),inset 0 2px 0 rgba(255,220,180,.18)}
#dev .valve{position:absolute;left:${SEG0 + DEV.length * SEGW - 2}px;top:99px;width:64px;height:64px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))}
#dev .valve svg{width:64px;height:64px}
.sg{position:absolute;top:0;width:${SEGW - 6}px;height:170px}
.sg .lb{position:absolute;left:0;right:0;top:0;height:92px;box-sizing:border-box;padding:8px 6px 6px;background:linear-gradient(180deg,rgba(10,30,34,.94),rgba(6,18,22,.94));border:1.5px solid rgba(233,168,76,.6);border-top:5px solid var(--c);border-radius:6px;text-align:center;box-shadow:0 8px 18px rgba(0,0,0,.5);display:flex;flex-direction:column;justify-content:center}
.sg .lb em{position:absolute;left:6px;top:4px;font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:16px;color:var(--c)}
.sg .lb b{display:block;font-family:Archivo,sans-serif;font-weight:900;font-size:22px;line-height:1.05;color:${CRE};letter-spacing:.01em}
.sg .tube{position:absolute;left:3px;right:3px;top:114px;height:34px;border-radius:17px;overflow:hidden;background:rgba(0,0,0,.35);box-shadow:inset 0 3px 6px rgba(0,0,0,.6)}
.sg .tube::after{content:"";position:absolute;left:0;right:0;top:3px;height:6px;border-radius:3px;background:rgba(255,255,255,.18)}
.sg .fl{position:absolute;inset:0;transform-origin:0 50%;background:repeating-linear-gradient(90deg,var(--c) 0 22px,var(--c2) 22px 34px);background-size:68px 100%}
.sg.mud{--c:#B27A3E;--c2:#7A4E22}.sg.brs{--c:#E9A84C;--c2:#B67A2A}.sg.grn{--c:#B5D86A;--c2:#7E9E3C}.sg.tl{--c:#4FD1C5;--c2:#1F8F86}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP55_BAU_BUSUK_LONDON_1858",
  ep: "55", bg: BG, vig: 0.42, grain: 0.045, capfloor: 0.42, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: "#F1E8D8",
  chip: "ILUSTRASI 3D &middot; BUKAN FOTO ASLI",
  extraAt: ["s1:1858", "s1:London", "s1:busuk", "s1:bekerja", "s2:naik", "s2:tiga", "s2:juta#2", "s2:siram", "s2:mengalir", "s2:Thames",
    "s3:orang", "s3:menular", "s3:bau", "s3:mewabah", "s3:ratus", "s3:meninggal",
    "s4:menemukan", "s4:menyebar", "s4:tercemar", "s4:gagang", "s4:pompa", "s4:kematian", "s4:Tapi",
    "s5:datang", "s5:Thames", "s5:limbah", "s5:parlemen", "s5:tepi", "s5:Tirainya", "s5:baunya",
    "s6:politisi", "s6:sendiri", "s6:hitungan", "s6:tiga", "s6:poundsterling", "s6:disetujui",
    "s7:Joseph", "s7:membangun", "s7:kilometer", "s7:utama", "s7:kilometer#2", "s7:jalan", "s7:dialirkan", "s7:jauh", "s7:Wabah", "s7:London",
    "s8:Ironisnya", "s8:melawan", "s8:air", "s8:Tapi", "s8:Bazalgette", "s8:hari", "s8:Ikuti"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:e.classList.contains('ok')?'block':'flex'},t);tl.fromTo(e,{opacity:0,y:34,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.42,ease:'power4.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 strike:(e,t)=>{gsap.set(e,{opacity:1});tl.fromTo(e,{'--k':0},{'--k':1,duration:.35,ease:'power2.out',immediateRender:false},t);},
 seg:(e,t)=>{gsap.set(e,{opacity:0});const f=e.querySelector('.fl'),l=e.querySelector('.lb');gsap.set(f,{scaleX:0});tl.set(e,{opacity:1},t-.01);tl.fromTo(l,{opacity:0,y:-22},{opacity:1,y:0,duration:.38,ease:'power3.out',immediateRender:false},t);tl.to(f,{scaleX:1,duration:.8,ease:'power2.inOut'},t+.1);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:-46,filter:'blur(8px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.4,ease:'power4.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:40,filter:'blur(6px)',duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{const h=q('#heat');const a=AT['s5:datang'],b=AT['s5:baunya']+1.2;let k=0;if(t>a-0.5&&t<b+0.8)k=Math.min(1,(t-a+0.5)/1.2,(b+0.8-t)/0.8);h.style.opacity=Math.max(0,k)*(0.75+0.25*Math.sin(t*2.3));document.querySelectorAll('#dev .fl').forEach(f=>f.style.backgroundPosition=(t*64%68)+'px 0');const d=q('#dev');if(d)d.style.visibility=(t>AT['s8:Menurut']-0.1)?'hidden':'visible';}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,'Segoe UI',sans-serif;font-weight:800;font-size:62px;line-height:1.1;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.8),0 0 18px rgba(0,0,0,.75)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${BR}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bau Busuk London 1858", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
