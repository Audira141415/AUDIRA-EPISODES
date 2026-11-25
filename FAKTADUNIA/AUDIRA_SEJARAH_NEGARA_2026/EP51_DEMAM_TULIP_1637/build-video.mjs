// EP51 DEMAM TULIP 1637: TRADINGTERMINAL. A 17th-century trading terminal: walnut-and-brass desk, amber screens
// (ticker TULPEN, chart, order book), a 3D candlestick chart of glossy tulip-stem candles that climbs 1634 → Feb 1637
// and crashes, a striped "broken" tulip on a brass pedestal, a tavern diorama passing contracts and the Haarlem
// auction with no buyers. Panels are black terminal cards with amber headers. Batch-11 device: an order-book strip
// of tulip tokens at y≈1100–1280 that fills one ticket per narrated beat.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB000", GRN = "#2BE38A", RED = "#FF3B4E", CRE = "#F2E8D5", MUT = "#A9A196", BG = "#07090B";
const MONO = `'IBM Plex Mono',Consolas,monospace`, GROT = `'Space Grotesk','Segoe UI',sans-serif`, SERIF = `'Playfair Display',Georgia,serif`;

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
// counter that lands exactly on the word where the narrator says the number
const ct = (to, a, land, extra = "") => `<span class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${Math.max(0.3, at(land) - at(a)).toFixed(3)}" ${extra}>${to}</span>`;

// order-book device: [label, sub, anchor, kind]
const TOK = [
  ["BUNGA BARU", "dari Utsmani", "s2:tulip", "g"],
  ["GARIS VIRUS", "kelopak api", "s3:virus", "g"],
  ["KONTRAK", "umbi di tanah", "s4:kontrak", "g"],
  ["ƒ10.000", "Semper Aug.", "s5:gulden", "a"],
  ["LELANG GAGAL", "3 Feb 1637", "s6:pembeli", "r"],
  ["TULIP MANIA", "jadi istilah", "s8:mania", "a"],
];
const tok = TOK.map(([b, s, a, k], i) => `<div class="tk ${k}" style="left:${i * 160}px" data-at="${a}" data-fx="tick"><div class="tu"><svg viewBox="0 0 40 40"><path d="M20 36V20" stroke="#2f8a3a" stroke-width="3"/><path d="M8 8c0 10 4 14 12 14s12-4 12-14l-6 5-6-8-6 8z" fill="${k === "r" ? RED : k === "a" ? AMB : "#ff5a6a"}" stroke="#fff" stroke-width="1.5"/><path d="M14 9l3 10M26 9l-3 10" stroke="#fff" stroke-width="1.6" opacity=".85"/></svg></div><b>${b}</b><span>${s}</span><i class="bar" data-at="${a}+0.15" data-fx="grow"></i></div>`).join("");

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@500;600;700&family=Playfair+Display:wght@700;900&display=block">
<div class="pre"><span style="font-family:'Space Grotesk';font-weight:700">TULIP 1637</span><span style="font-family:'Space Grotesk';font-weight:500">a</span><span style="font-family:'IBM Plex Mono';font-weight:700">A 1 ƒ</span><span style="font-family:'IBM Plex Mono';font-weight:600">A 1</span><span style="font-family:'IBM Plex Mono';font-weight:500">A 1</span><span style="font-family:'Playfair Display';font-weight:700">AUDIRA</span><span style="font-family:'Playfair Display';font-weight:900">ƒ</span></div>
<div id="flash"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 51", "TULPEN · 1637")}
  <div class="h1"><span class="ln">1 UMBI TULIP</span><span class="ln sm">lebih mahal dari</span><span class="ln big">GAJI 10 TAHUN</span></div>
  <div class="chips"><i class="ch dn" data-at="s1:runtuh" data-fx="stampc">▼ RUNTUH DALAM 1 MINGGU</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:Dan">
  ${kk("01", "BELANDA · ABAD KE-17")}
  ${row("REPUBLIK BELANDA", "Zaman Keemasan", "s2:Belanda", "am")}
  ${row("PUSAT DAGANG TERKAYA DI DUNIA", "", "s2:pusat")}
</div>
<div class="p" data-in="s2:Dan" data-out="s3">
  ${kk("02", "BARANG BARU")}
  ${row("BUNGA TULIP", "", "s2:tulip", "am")}
  ${row("DARI KESULTANAN UTSMANI", "umbi dikirim ke Wina, 1554", "s2:Utsmani")}
</div>
<div class="p" data-in="s3" data-out="s3:Tapi">
  ${kk("03", "TULIP &ldquo;PECAH&rdquo;")}
  ${row("KELOPAK BERGARIS API", "merah-putih, paling langka", "s3:bergaris", "am")}
  ${row("PENYEBABNYA: VIRUS", "baru diketahui belakangan", "s3:virus", "vi")}
</div>
<div class="p" data-in="s3:Tapi" data-out="s4">
  ${kk("03", "SAAT ITU")}
  <div class="cd row big2" data-at="s3:garis" data-fx="card"><b>GARIS = HARGA <em class="up">▲</em></b><span>pola langka, harga melambung</span></div>
</div>
<div class="p" data-in="s4" data-out="s4:Umbinya">
  ${kk("04", "MULAI 1634")}
  ${row("DIJUAL DI KEDAI MINUM", "", "s4:kedai-kedai", "am")}
  <div class="vs">
    <div class="cd mm" data-at="s4:bukan" data-fx="card"><b>BUNGA</b></div>
    <div class="cd ff" data-at="s4:kontrak" data-fx="card"><b>KONTRAK</b></div>
  </div>
</div>
<div class="p" data-in="s4:Umbinya" data-out="s5">
  ${kk("04", "KONTRAK BERJANGKA")}
  ${row("UMBI MASIH DI DALAM TANAH", "", "s4:tanah", "am")}
  ${row("KERTASNYA BERPINDAH TANGAN", "berkali-kali, tanpa ada barang", "s4:berpindah")}
</div>
<div class="p" data-in="s5" data-out="s5:Beberapa">
  ${kk("05", "PUNCAK · FEBRUARI 1637")}
  ${row("SEMPER AUGUSTUS", "umbi termahal", "s5:Semper", "am")}
  <div class="cd row spd" data-at="s5:ditawar" data-fx="card"><b>${ct(10000, "s5:ditawar", "s5:gulden", 'data-pre="ƒ"')}</b><span>gulden &middot; &plusmn;€130.000 nilai 2024</span></div>
</div>
<div class="p" data-in="s5:Beberapa" data-out="s6">
  ${kk("05", "UMBI LAIN")}
  <div class="cd row spd" data-at="s5:dijual" data-fx="card"><b>&gt;${ct(10, "s5:dijual", "s5:sepuluh#2", 'data-suf="×"')}</b><span>penghasilan setahun seorang perajin</span></div>
</div>
<div class="p" data-in="s6" data-out="s6:Harga">
  ${kk("06", "HAARLEM · 3 FEBRUARI 1637")}
  ${row("SEBUAH LELANG DIBUKA", "", "s6:lelang", "am")}
  <div class="ban" data-at="s6:pembeli" data-fx="stampc">TIDAK ADA PEMBELI</div>
</div>
<div class="p" data-in="s6:Harga" data-out="s6:Dalam">
  ${kk("06", "LELANG HAARLEM")}
  <div class="cd row thermo" data-at="s6:diturunkan" data-fx="card"><b>HARGA DITURUNKAN <em class="dn2">▼</em></b><div class="steps"><i data-at="s6:diturunkan" data-fx="pop"></i><i data-at="s6:lagi" data-fx="pop"></i><i data-at="s6:lagi#2" data-fx="pop"></i></div></div>
  ${row("TETAP TIDAK ADA YANG MAU", "", "s6:Tetap", "rd")}
</div>
<div class="p" data-in="s6:Dalam" data-out="s7">
  ${kk("06", "BEBERAPA HARI KEMUDIAN")}
  <div class="ban" data-at="s6:total" data-fx="stampc">PASAR TULIP BERHENTI TOTAL</div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  ${kk("07", "200 TAHUN KEMUDIAN")}
  ${row("BUKU CHARLES MACKAY, 1841", "versi populer yang terkenal", "s7:buku", "am")}
  ${row("&ldquo;BANYAK ORANG BANGKRUT&rdquo;", "", "s7:bangkrut")}
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  ${kk("07", "SEJARAWAN MODERN")}
  <div class="vs">
    <div class="cd mm w2" data-at="s7:Tapi" data-fx="card"><b>BANYAK BANGKRUT?</b><i class="stp" data-at="s7:membantah" data-fx="stampc">DIBANTAH</i></div>
  </div>
  ${row("RUGI NYATA BAGI SEBAGIAN PEDAGANG", "", "s7:nyata", "rd")}
  ${row("EKONOMI BELANDA TETAP KUAT", "", "s7:kuat", "gr")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("08", "YANG TERSISA")}
  <div class="h1"><span class="ln big" data-at="s8:mania" data-fx="pop">TULIP MANIA</span></div>
  ${row("HARGA NAIK KARENA YAKIN", "besok akan lebih mahal", "s8:yakin", "am")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Apa &ldquo;tulip&rdquo; zaman sekarang? <em>Tulis di komentar!</em></div>
</div>
<div id="ob" data-at="s2:tulip" data-fx="fade">
  <div class="obh"><span>ORDER BOOK</span><span class="lv">TULPEN</span></div>
  <div class="obr">${tok}</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
#flash{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 50%,rgba(255,59,78,.35),rgba(255,59,78,0) 70%)}
.cd{position:relative;background:linear-gradient(180deg,rgba(10,12,14,.9),rgba(6,7,9,.9));border:1.5px solid rgba(255,176,0,.5);border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,220,150,.12)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:${MONO};font-weight:700;font-size:26px;letter-spacing:.06em;color:${AMB};margin-bottom:16px;padding:6px 18px 6px 6px;background:rgba(6,7,9,.86);border:1.5px solid rgba(255,176,0,.6);border-radius:4px}
.kk i{font-style:normal;background:${AMB};color:#07090B;padding:3px 12px;border-radius:2px}
.h1{display:flex;flex-direction:column;align-items:flex-start}
.h1 .ln{font-family:${GROT};font-weight:700;font-size:104px;line-height:1;letter-spacing:-.02em;color:${CRE};text-shadow:0 6px 24px rgba(0,0,0,.7)}
.h1 .sm{font-family:${MONO};font-weight:600;font-size:40px;color:${AMB};margin:8px 0 4px;letter-spacing:.02em}
.h1 .big{font-family:${SERIF};font-weight:900;font-size:118px;line-height:1.02;letter-spacing:-.01em;background:linear-gradient(180deg,#FFF2C8 0%,#FFC94A 45%,#E08A00 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(40,20,0,.9)) drop-shadow(0 10px 24px rgba(0,0,0,.7))}
.chips{display:flex;gap:14px;margin-top:22px}
.ch{font-style:normal;font-family:${MONO};font-weight:700;font-size:40px;line-height:1;padding:14px 22px 12px;border-radius:4px}
.ch.dn{background:${RED};color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.5)}
.ban{display:inline-block;font-family:${MONO};font-weight:700;font-size:64px;line-height:1.05;color:#fff;background:${RED};padding:16px 26px 14px;border-radius:4px;transform:rotate(-2deg);box-shadow:0 14px 34px rgba(0,0,0,.55);margin-top:18px;max-width:880px}
.row{display:flex;flex-direction:column;margin-top:14px;padding:14px 26px 16px;border-left:10px solid ${AMB};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:${GROT};font-weight:700;font-size:54px;line-height:1.05;letter-spacing:-.01em;color:${CRE}}
.row span{display:block;margin-top:6px;font-family:${MONO};font-weight:500;font-size:30px;line-height:1.2;color:${MUT}}
.row.am b{color:${AMB}}.row.rd{border-left-color:${RED}}.row.rd b{color:#FF8A94}.row.gr{border-left-color:${GRN}}.row.gr b{color:${GRN}}.row.vi{border-left-color:#B06CFF}.row.vi b{color:#D8B0FF}
.row em{font-style:normal}.up{color:${GRN}}.dn2{color:${RED}}
.big2 b{font-size:76px}
.spd b{white-space:nowrap;font-family:${MONO};font-weight:700;font-size:120px;line-height:1;color:${AMB};letter-spacing:-.02em}
.spd b .ct{display:inline;margin:0;font:inherit;color:inherit}
.steps{display:flex;gap:14px;margin-top:14px;align-items:flex-start;height:96px}
.steps i{display:block;width:150px;height:22px;background:${RED};border-radius:3px}
.steps i:nth-child(2){margin-top:36px}.steps i:nth-child(3){margin-top:72px}
.vs{display:flex;gap:20px;align-items:stretch;margin-top:14px}
.mm,.ff{display:flex;align-items:center;padding:18px 26px;box-sizing:border-box}
.mm b,.ff b{font-family:${GROT};font-weight:700;font-size:56px;line-height:1.05;color:${CRE}}
.mm b{color:#D4CABB;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:${RED}}
.mm.w2{padding-right:130px;background:rgba(6,7,9,.96)}
.ff{background:linear-gradient(180deg,#FFD266,#E08A00);border-color:#FFE2A0}.ff b{color:#07090B}
.stp{position:absolute;right:-26px;top:-30px;font-style:normal;font-family:${MONO};font-weight:700;font-size:52px;line-height:1;color:#fff;background:${RED};border-radius:4px;padding:10px 16px 8px;transform:rotate(6deg);box-shadow:0 8px 20px rgba(0,0,0,.5)}
.q{margin-top:10px;padding:22px 30px 24px;font-family:${GROT};font-weight:700;font-size:58px;line-height:1.1;color:${CRE};border-left:10px solid ${AMB};max-width:900px}
.q em{display:block;margin-top:12px;font-style:normal;color:${AMB};font-size:44px;font-family:${MONO}}
#ob{position:absolute;left:44px;top:1098px;width:992px;height:178px;z-index:10}
#ob .obh{display:flex;justify-content:space-between;font-family:${MONO};font-weight:700;font-size:20px;letter-spacing:.12em;color:${AMB};padding:0 6px 6px;border-bottom:2px solid rgba(255,176,0,.55)}
#ob .lv{color:${GRN}}
#ob .obr{position:relative;height:148px;margin-top:8px}
.tk{position:absolute;top:0;width:152px;height:144px;box-sizing:border-box;padding:8px 8px 0;background:linear-gradient(180deg,rgba(12,14,16,.94),rgba(6,7,9,.94));border:1.5px solid rgba(43,227,138,.6);border-radius:4px;text-align:center;box-shadow:0 10px 22px rgba(0,0,0,.55)}
.tk.a{border-color:rgba(255,176,0,.8)}.tk.r{border-color:rgba(255,59,78,.85)}
.tk .tu{width:40px;height:40px;margin:0 auto}
.tk b{display:block;margin-top:2px;font-family:${MONO};font-weight:700;font-size:21px;line-height:1.05;color:${CRE};white-space:nowrap}
.tk span{display:block;margin-top:3px;font-family:${MONO};font-weight:500;font-size:16px;line-height:1.1;color:${MUT}}
.tk .bar{position:absolute;left:8px;right:8px;bottom:8px;height:8px;background:${GRN};border-radius:2px;transform-origin:0 50%}
.tk.a .bar{background:${AMB}}.tk.r .bar{background:${RED}}
#ob.crash .tk.g .bar{background:${RED};opacity:.7}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP51_DEMAM_TULIP_1637",
  ep: "51", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.45, html, css, chipFont: MONO, chipColor: CRE,
  chip: "ILUSTRASI 3D &middot; BUKAN GAMBAR ASLI",
  extraAt: ["s1:mahal", "s1:Lalu", "s1:tukang", "s1:minggu", "s1:runtuh", "s2:abad", "s2:pusat", "s2:Dan", "s2:tulip",
    "s3:bergaris", "s3:virus", "s3:Tapi", "s4:1634", "s4:berdagang", "s4:minum", "s4:bukan", "s4:kontrak", "s4:Umbinya", "s4:tanah", "s4:sementara",
    "s5:Puncaknya", "s5:Februari", "s5:Semper", "s5:gulden", "s5:Beberapa", "s5:sepuluh#2",
    "s6:Haarlem", "s6:lelang", "s6:pembeli", "s6:diturunkan", "s6:lagi", "s6:lagi#2", "s6:Tetap", "s6:mau", "s6:Dalam", "s6:total",
    "s7:buku", "s7:bangkrut", "s7:Tapi", "s7:Kerugiannya", "s8:mania", "s8:Menurut"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-40,filter:'blur(5px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.36,ease:'power4.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 tick:(e,t)=>{tl.fromTo(e,{opacity:0,y:-26,scale:.9},{opacity:1,y:0,scale:1,duration:.35,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:60,filter:'blur(8px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.36,ease:'power4.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:-50,filter:'blur(6px)',duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{const f=q('#flash');const hits=[AT['s1:runtuh'],AT['s6:pembeli'],AT['s6:total']];let k=0;for(const h of hits){const d=t-h;if(d>0&&d<0.6)k=Math.max(k,1-d/0.6);}f.style.opacity=k*0.8;const ob=q('#ob');if(ob){ob.style.visibility=(t>AT['s8:Menurut']-0.1)?'hidden':'visible';ob.classList.toggle('crash',t>AT['s6:pembeli']&&t<AT['s8:mania']);}}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:64px;line-height:1.1;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.85),0 0 18px rgba(0,0,0,.8)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${AMB}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Demam Tulip 1637", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
