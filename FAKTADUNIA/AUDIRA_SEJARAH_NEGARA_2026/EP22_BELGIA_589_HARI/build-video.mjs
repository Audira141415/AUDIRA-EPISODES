// EP22 BELGIA 589 HARI: COMICFORGE. Belgian politics as a 3D pop comic page lying on a table. Seven panels are physical
// plates with thick ink rims: the day counter (hook + ending), the split map of Flandria and Wallonia, the 150-seat
// hemicycle, the negotiation table with mediators walking in and out, the budget calculator, the record track and
// the swearing-in stage. Stations change under a comic page-wipe (a halftone sheet with a sound-effect word).
// The ending pulls back until the whole comic page fills the frame. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const YEL = "#FFD23F", RED = "#E63946", INK = "#111111", BLUE = "#1D4E89", PAPER = "#FFF6E0";
const HEAD = `Bangers, 'Luckiest Guy', Impact, sans-serif`, BODY = `'Comic Neue', 'Comic Sans MS', sans-serif`;

// page-wipe: a halftone sheet slides in on a diagonal edge, the camera cuts underneath, the sheet leaves
const WORDS = { "s2:Ini": "WUSS!", "s3:Pemilu": "BRAK!", "s4:Negosiasi": "DUK!", "s5:Belgia": "SREET!", "s6:Hari": "TING!", "s7:Akhirnya": "JDER!", "s7:Kesepakatannya": "WUSS!", "s8:Hampir": "KLIK!" };
const cut = (a, i) => `<div class="cut c${i % 3}" data-at="${a}" data-fx="cut"><div class="sh"><div class="dots"></div><b>${WORDS[a]}</b></div></div>`;
const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const rec = (n, s, a, cls = "") => `<div class="cd rec ${cls}" data-at="${a}" data-fx="card"><b>${n}</b><span>${s}</span></div>`;

const html = `
${Object.keys(WORDS).map(cut).join("")}
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 22</div>
  <div class="cd h1">NEGARA TANPA<br><em>PEMERINTAHAN</em><br>TERPILIH</div>
  <div class="bl" data-at="s1:benar-benar" data-fx="balloon">INI BENAR-BENAR TERJADI!</div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3:Pemilu">
  <div class="kk">BELGIA &middot; TERBELAH DUA</div>
  ${row("FLANDRIA", "berbahasa Belanda &middot; di utara", "s2:Flandria", "yl")}
  ${row("WALLONIA", "berbahasa Prancis &middot; di selatan", "s2:Wallonia", "rd")}
</div>
<div class="p" data-in="s3:Pemilu" data-out="s3:Partai">
  <div class="kk">PEMILU 13 JUNI 2010</div>
  <div class="cd mega" data-at="s3:sebelas" data-fx="card"><b>11</b><small>PARTAI<br>MASUK PARLEMEN</small></div>
  ${row("TAK ADA YANG LEBIH DARI 20%", "kursi parlemen", "s3:lebih", "rd")}
</div>
<div class="p" data-in="s3:Partai" data-out="s4:Negosiasi">
  <div class="kk">PARTAI TERBESAR</div>
  ${row("N-VA", "nasionalis Flandria", "s3:nasionalis", "yl")}
  <div class="cd mega" data-at="s3:dua#2" data-fx="card"><b><b class="ct" data-from="0" data-to="27" data-a="s3:dua#2" data-d="1.0">0</b><i>/150</i></b><small>KURSI</small></div>
</div>
<div class="p" data-in="s4:Negosiasi" data-out="s4:Sementara">
  <div class="kk">NEGOSIASI KOALISI</div>
  <div class="bl shout" data-at="s4:buntu" data-fx="balloon">BUNTU!</div>
  ${row("RAJA ALBERT II", "menunjuk penengah demi penengah", "s4:Raja")}
  ${row("SATU PER SATU MUNDUR", "", "s4:mundur", "rd")}
</div>
<div class="p" data-in="s4:Sementara" data-out="s5:Belgia">
  <div class="kk">SEMENTARA ITU</div>
  ${row("YVES LETERME", "Perdana Menteri pemerintahan sementara", "s4:Yves")}
  ${row("WEWENANG TERBATAS", "", "s4:wewenang", "rd")}
</div>
<div class="p" data-in="s5:Belgia" data-out="s6:Hari">
  <div class="kk">ANGGARAN NEGARA</div>
  <div class="cd mega" data-at="s5:2011" data-fx="card"><small>TANPA<br>APBN</small><b>2011</b></div>
  ${row("ANGGARAN 2010 DIPERPANJANG", "dari bulan ke bulan", "s5:diperpanjang", "rd")}
</div>
<div class="p" data-in="s6:Hari" data-out="s7:Akhirnya">
  <div class="kk">MENGEJAR REKOR</div>
  ${rec("194", "<u>25 DES 2010</u>melewati rekor Belgia 2007", "s6:seratus", "bl2")}
  ${rec("353", "<u>1 JUNI 2011</u>menyamai rekor dunia Kamboja (2003&ndash;2004)", "s6:menyamai", "rd")}
</div>
<div class="p" data-in="s7:Akhirnya" data-out="s7:Kesepakatannya">
  <div class="kk">6 DESEMBER 2011</div>
  ${row("PEMERINTAHAN DI RUPO DILANTIK", "Elio Di Rupo, Perdana Menteri", "s7:dilantik")}
  <div class="cd mega" data-at="s7:lima" data-fx="card"><b><b class="ct" data-from="0" data-to="541" data-a="s7:lima" data-d="1.6">0</b></b><small>HARI<br>NEGOSIASI</small></div>
</div>
<div class="p" data-in="s7:Kesepakatannya" data-out="s8:Hampir">
  <div class="kk">ISI KESEPAKATAN</div>
  <div class="cd mega yel" data-at="s7:tujuh" data-fx="card"><b>&euro;17</b><small>MILIAR<br>KEWENANGAN</small></div>
  ${row("PINDAH DARI PUSAT KE WILAYAH", "", "s7:pusat", "rd")}
</div>
<div class="p" data-in="s8:Hampir" data-out="@END">
  <div class="cd h2">HAMPIR 2 TAHUN<br><em>TANPA PEMERINTAHAN BARU</em></div>
  ${row("NEGARA TETAP BERJALAN", "dijalankan pemerintahan sementara", "s8:dijalankan")}
  <div class="bl q" data-at="s8:Menurut" data-fx="balloon">Berapa lama negara bisa bertahan? Tulis di komentar!</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cut{position:absolute;inset:0;z-index:14;pointer-events:none;opacity:0}
.cut .sh{position:absolute;left:-120px;top:-60px;width:1320px;height:2040px;background:${YEL};border-left:16px solid ${INK};clip-path:polygon(14% 0,100% 0,100% 100%,0 100%);overflow:hidden}
.cut.c1 .sh{background:${RED}}.cut.c2 .sh{background:#4FB3E8}
.cut .dots{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(17,17,17,.22) 34%,transparent 36%);background-size:26px 26px}
.cut b{position:absolute;left:180px;top:840px;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:230px;letter-spacing:.04em;color:#fff;-webkit-text-stroke:14px ${INK};paint-order:stroke fill;text-shadow:14px 14px 0 ${INK};transform:rotate(-8deg)}
.cut.c0 b{color:${RED}}.cut.c1 b{color:${YEL}}
.cd{position:relative;background:#fff;border:6px solid ${INK};border-radius:4px;box-shadow:11px 11px 0 ${INK}}
.kk{display:inline-block;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:42px;line-height:1.1;letter-spacing:.06em;color:${INK};background:${YEL};padding:8px 22px 4px;border:5px solid ${INK};box-shadow:7px 7px 0 ${INK};margin-bottom:26px;transform:rotate(-1.5deg)}
.h1{display:inline-block;padding:18px 30px 8px;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:112px;line-height:.94;letter-spacing:.02em;color:${INK};background:${PAPER}}
.h1 em,.h2 em{font-style:normal;color:${RED}}
.h2{display:inline-block;padding:16px 28px 10px;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:70px;line-height:1;letter-spacing:.02em;color:${INK};background:${PAPER}}
.bl{position:relative;display:inline-block;margin-top:34px;margin-left:30px;padding:16px 30px 12px;background:#fff;border:6px solid ${INK};border-radius:46px;font-family:'Comic Neue','Comic Sans MS',sans-serif;font-weight:700;font-size:44px;line-height:1.12;color:${INK};box-shadow:9px 9px 0 ${INK};max-width:780px}
.bl:after{content:"";position:absolute;left:70px;bottom:-40px;width:44px;height:44px;background:#fff;border-right:6px solid ${INK};border-bottom:6px solid ${INK};transform:skewX(32deg) rotate(38deg)}
.bl.shout{font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:96px;letter-spacing:.04em;color:${RED};background:${YEL};border-radius:30px;padding:10px 40px 0;transform:rotate(-3deg);margin-bottom:12px}
.bl.shout:after{background:${YEL}}
.bl.q{font-size:46px;background:${YEL}}.bl.q:after{background:${YEL}}
.row{flex-direction:column;margin-top:24px;padding:12px 24px 14px;border-left:20px solid ${BLUE};max-width:860px;box-sizing:border-box}
.row b{display:block;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:58px;line-height:1.05;letter-spacing:.02em;color:${INK}}
.row span{display:block;font-family:'Comic Neue','Comic Sans MS',sans-serif;font-weight:700;font-size:34px;line-height:1.2;color:#333}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}
.row.yl{border-left-color:${YEL};background:${PAPER}}
.mega{display:flex;align-items:center;gap:24px;width:max-content;padding:4px 30px 0;margin-top:24px;background:${PAPER}}
.mega b{font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:168px;line-height:1.05;letter-spacing:.02em;color:${INK}}
.mega b i{font-style:normal;font-size:96px;color:#555}
.mega small{font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:46px;line-height:1.05;letter-spacing:.03em;color:${RED}}
.mega.yel{background:${YEL}}
.rec{display:flex;align-items:center;gap:22px;margin-top:22px;padding:4px 24px 6px 20px;max-width:860px;box-sizing:border-box}
.rec b{font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:118px;line-height:1.05;color:#fff;background:${BLUE};border:5px solid ${INK};padding:0 16px;flex:none}
.rec.rd b{background:${RED}}
.rec span{font-family:'Comic Neue','Comic Sans MS',sans-serif;font-weight:700;font-size:32px;line-height:1.18;color:${INK}}
.rec u{display:block;text-decoration:none;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:52px;letter-spacing:.03em;color:${INK}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP22_BELGIA_589_HARI",
  ep: "22", bg: "#5B3FA8", vig: 0.22, grain: 0.06, capfloor: 0.0, html, css, chipFont: BODY, chipColor: "#fff",
  chip: "ILUSTRASI KOMIK &middot; TANPA POTRET TOKOH",
  extraAt: ["s1:selama", "s1:589", "s1:hari", "s1:Ini", "s2:Belgia", "s2:terbelah", "s2:Flandria", "s2:Wallonia",
    "s3:2010", "s3:sebelas", "s3:parlemen", "s3:lebih", "s3:Partai", "s3:nasionalis", "s3:dua#2", "s3:seratus",
    "s4:buntu", "s4:Raja", "s4:menunjuk", "s4:mundur", "s4:Sementara", "s4:Yves", "s4:wewenang",
    "s5:tidak", "s5:2011", "s5:Anggaran", "s5:diperpanjang", "s5:bulan#2",
    "s6:Natal", "s6:memecahkan", "s6:seratus", "s6:Satu", "s6:menyamai", "s6:Kamboja",
    "s7:enam", "s7:dilantik", "s7:lima", "s7:Kesepakatannya", "s7:memindahkan", "s7:tujuh", "s7:pusat", "s7:wilayah",
    "s8:Hampir", "s8:dijalankan", "s8:Menurut", "s8:AUDIRA", ...Object.keys(WORDS)],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.rec')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,scale:.6,rotation:-3},{opacity:1,scale:1,rotation:0,duration:.3,ease:'back.out(2.2)',immediateRender:false},t);},
 balloon:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:.3,opacity:0,transformOrigin:'15% 100%'},{scale:1,opacity:1,duration:.32,ease:'back.out(2.6)',immediateRender:false},t);},
 cut:(e,t)=>{const s=e.querySelector('.sh');tl.set(e,{opacity:1},t-.5);
  tl.fromTo(s,{x:1300},{x:0,duration:.34,ease:'power3.in',immediateRender:false},t-.42);
  tl.fromTo(e.querySelector('b'),{scale:.4},{scale:1,duration:.3,ease:'back.out(3)',immediateRender:false},t-.12);
  tl.to(s,{x:-1500,duration:.42,ease:'power3.in'},t+.1);tl.set(e,{opacity:0},t+.56);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-40,rotation:-1.2},{opacity:1,y:0,rotation:0,duration:.34,ease:'back.out(1.8)'},a+.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-30,duration:.18,ease:'power2.in'},b-.3)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Bangers,'Luckiest Guy',Impact,sans-serif;font-weight:400;font-size:76px;line-height:1.08;letter-spacing:.03em;color:#fff;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:7px 8px 0 ${INK}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:28},{opacity:1,y:0,duration:.2,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Belgia 589 Hari", "#5B3FA8");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
