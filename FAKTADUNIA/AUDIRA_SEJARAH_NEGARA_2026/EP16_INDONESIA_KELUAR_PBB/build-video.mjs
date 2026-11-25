// EP16 INDONESIA KELUAR PBB. VISUALINVESTIGATION: a forensic archive desk (charcoal desk, archival paper #E4E0D4,
// red highlighter #FF4A2E). Evidence laid out in a 2-column grid so the payoff can crane up over the whole case:
// GA seat placard, membership register, Konfrontasi map, the 1965 letter (reconstruction), CONEFO clipping,
// the 1966 telegram, and the 1950/1966 calendar pair joined by a red thread.
// Stations change under a sliding archive sheet; the letter gets a punch-zoom onto its highlighted clause.
// Panels are archival paper cards with ink type. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#FF4A2E", PAPER = "#E4E0D4", INK = "#1D1D1B", CH = "#141619", HAIR = "#2E3238", BG = "#0B0C0E";
const HEAD = `"IBM Plex Serif",Georgia,serif`, TYPE = `"Courier Prime","Courier New",monospace`;

const tag = (name, role, a) => `<div class="tag" data-at="${a}" data-fx="card"><i>NAMA</i><div><b>${name}</b><span>${role}</span></div></div>`;
const card = (b, s, a, cls = "") => `<div class="card ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const date = (d, s, a) => `<div class="date" data-at="${a}" data-fx="card"><small>${s}</small><b>${d}</b></div>`;
const slide = (a) => `<div class="slide" data-at="${a}-0.5" data-fx="slide"><div class="sh"><i></i><i></i><i></i><i></i><i></i><i></i><b>ARSIP</b></div></div>`;

let html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=IBM+Plex+Serif:ital,wght@0,500;0,600;0,700;1,500&display=block">
<div class="pre"><span style="font-family:'IBM Plex Serif',serif;font-weight:700">PBB 60</span><span style="font-family:'Courier Prime',monospace;font-weight:700">TELEGRAM</span><span style="font-family:'Courier Prime',monospace;font-weight:400">surat</span></div>
${slide("s2:Indonesia")}
${slide("s3:Pertengahan")}
${slide("s4:Dalam")}
${slide("s5:Presiden")}
${slide("s6:Tapi")}
${slide("s7:28")}
${slide("s7:delegasi")}
<div class="p" data-first="1" data-in="@0" data-out="s2:Indonesia">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 16</div>
  <div class="h1">Satu-satunya negara yang pernah mencoba <em>keluar</em> dari PBB</div>
  <div class="st" data-at="s1:Indonesia" data-fx="stamp2">INDONESIA &middot; 1965</div>
</div>
<div class="p" data-in="s2:Indonesia" data-out="s3:Pertengahan">
  <div class="kk">BERKAS 01 &middot; KEANGGOTAAN</div>
  <div class="cnt" data-at="s2:keenam" data-fx="card"><small>anggota ke-</small><b><b class="ct" data-from="1" data-to="60" data-a="s2:keenam" data-d="0.9">1</b></b></div>
  ${date("28 September 1950", "resmi masuk PBB", "s2:September")}
  <div class="lb" data-at="s2:kurang" data-fx="card" data-d="inline-block">kurang dari setahun setelah pengakuan kedaulatan</div>
</div>
<div class="p" data-in="s3:Pertengahan" data-out="s4:Dalam">
  <div class="kk">BERKAS 02 &middot; PERTENGAHAN 1960-AN</div>
  ${card("KONFRONTASI", "Indonesia &times; Malaysia", "s3:berkonfrontasi", "rd")}
  ${card("Malaysia terpilih", "anggota tidak tetap Dewan Keamanan PBB", "s3:terpilih")}
</div>
<div class="p" data-in="s4:Dalam" data-out="s5:Presiden">
  <div class="kk">BERKAS 03 &middot; SURAT</div>
  ${date("20 Januari 1965", "surat Indonesia kepada PBB", "s4:Januari")}
  ${tag("U Thant", "Sekretaris Jenderal PBB &middot; penerima surat", "s4:U")}
  <div class="st" data-at="s4:keluar" data-fx="stamp2">MEMUTUSKAN KELUAR</div>
</div>
<div class="p" data-in="s5:Presiden" data-out="s6:Tapi">
  <div class="kk">BERKAS 04 &middot; TANDINGAN</div>
  ${tag("Sukarno", "Presiden RI &middot; penggagas tandingan PBB", "s5:Sukarno")}
  ${card("CONEFO", "Konferensi Kekuatan-Kekuatan Baru <em>(Conference of the New Emerging Forces)</em>", "s5:CONEFO", "rd")}
</div>
<div class="p" data-in="s6:Tapi" data-out="s7:28">
  <div class="kk">BERKAS 05 &middot; BERBALIK</div>
  ${tag("Soeharto", "Jenderal &middot; mengambil alih kendali", "s6:Soeharto")}
  ${date("19 September 1966", "telegram ke PBB", "s6:September")}
  ${card("Kembali bekerja sama penuh", "mulai Sidang Umum ke-21", "s6:kembali")}
</div>
<div class="p" data-in="s7:28" data-out="s7:delegasi">
  <div class="kk">BERKAS 06 &middot; TEPAT 16 TAHUN</div>
  <div class="pair">${date("28 Sep 1950", "masuk", "s7:28")}${date("28 Sep 1966", "kembali", "s7:September")}</div>
  <div class="big" data-at="s7:enam" data-fx="stamp2">16 TAHUN</div>
</div>
<div class="p" data-in="s7:delegasi" data-out="s8:Sampai">
  <div class="kk">SIDANG UMUM PBB &middot; 28 SEP 1966</div>
  ${card("Delegasi Indonesia duduk kembali", "", "s7:dipersilakan")}
  <div class="row"><div class="st x" data-at="s7:bukan" data-fx="stamp2">BUKAN KELUAR</div></div>
  <div class="st" data-at="s7:penghentian" data-fx="stamp2">PENGHENTIAN KERJA SAMA SEMENTARA</div>
</div>
<div class="p" data-in="s8:Sampai" data-out="@END">
  <div class="kk">SAMPAI HARI INI</div>
  <div class="h2">Belum ada negara lain yang mencoba keluar dari PBB</div>
  <div class="q" data-at="s8:Menurut" data-fx="card">Keputusan 1965: <em>berani</em> atau <em>terburu-buru</em>?</div>
</div>`;

const shadow = `0 16px 34px rgba(0,0,0,.55)`;
const paper = `linear-gradient(176deg,#ECE8DD,${PAPER} 55%,#D9D4C6)`;
const css = `
.pre{position:absolute;left:-3000px;top:0;font-size:40px;opacity:0}
.slide{position:absolute;left:0;top:-110px;width:1560px;height:2140px;z-index:14;pointer-events:none;opacity:0}
.slide .sh{position:absolute;inset:0;background:${paper};box-shadow:-30px 0 60px rgba(0,0,0,.55),30px 0 60px rgba(0,0,0,.55);transform:rotate(-2.2deg);padding:420px 0 0 300px;box-sizing:border-box}
.slide .sh i{display:block;height:20px;margin:0 0 42px;background:rgba(29,29,27,.28);width:820px}
.slide .sh i:nth-child(2n){width:690px}.slide .sh i:nth-child(3){width:760px;background:rgba(255,74,46,.55)}
.slide .sh b{position:absolute;left:520px;top:1240px;font-family:${TYPE};font-weight:700;font-size:150px;letter-spacing:.12em;color:${RED};border:12px solid ${RED};padding:6px 40px;transform:rotate(-8deg);opacity:.85}
.p .kk{display:inline-block;font-family:${TYPE};font-weight:700;font-size:28px;letter-spacing:.08em;color:${PAPER};background:${CH};border:2px solid ${HAIR};border-left:10px solid ${RED};padding:8px 18px 7px;margin-bottom:14px;box-shadow:${shadow}}
.h1{background:${paper};padding:18px 30px 24px;box-shadow:${shadow};font-family:${HEAD};font-weight:700;font-size:78px;line-height:1.06;color:${INK};letter-spacing:-.01em;border-top:6px solid ${RED}}
.h1 em{font-style:normal;color:${RED};text-decoration:underline;text-decoration-thickness:6px;text-underline-offset:8px}
.h2{background:${paper};padding:14px 28px 18px;box-shadow:${shadow};font-family:${HEAD};font-weight:700;font-size:60px;line-height:1.08;color:${INK};border-top:6px solid ${RED}}
.st{display:inline-block;margin-top:16px;font-family:${TYPE};font-weight:700;font-size:44px;letter-spacing:.05em;line-height:1.1;padding:8px 22px;color:${RED};border:6px solid ${RED};background:rgba(20,22,25,.82);transform:rotate(-2deg);box-shadow:${shadow};max-width:880px}
.st.x{color:${PAPER};border-color:${PAPER};text-decoration:line-through;text-decoration-thickness:5px}
.row{display:block}
.card{display:flex;flex-direction:column;gap:2px;margin-top:12px;padding:12px 24px 15px;background:${paper};border-left:12px solid ${INK};box-shadow:${shadow};width:max-content;max-width:880px;box-sizing:border-box}
.card b{font-family:${HEAD};font-weight:700;font-size:48px;line-height:1.08;color:${INK}}
.card span{font-family:${TYPE};font-weight:700;font-size:32px;line-height:1.2;color:#3A3833}
.card span em{font-style:italic;font-weight:400}
.card.rd{border-left-color:${RED}}.card.rd b{color:${RED}}
.cnt{display:flex;align-items:flex-end;gap:16px;margin-top:4px;padding:2px 30px 8px;background:${paper};border-left:12px solid ${RED};box-shadow:${shadow};width:max-content}
.cnt small{font-family:${TYPE};font-weight:700;font-size:40px;color:#3A3833;padding-bottom:28px}
.cnt>b{font-family:${HEAD};font-weight:700;font-size:150px;line-height:1.02;color:${RED}}
.cnt>b .ct{font:inherit;color:inherit}
.date{margin-top:12px;padding:8px 26px 12px;background:${paper};border-top:6px solid ${RED};box-shadow:${shadow};width:max-content}
.date small{display:block;font-family:${TYPE};font-weight:700;font-size:28px;letter-spacing:.04em;color:#5A564D}
.date b{display:block;font-family:${HEAD};font-weight:700;font-size:58px;line-height:1.08;color:${INK}}
.pair{display:flex;gap:18px}.pair .date b{font-size:50px}
.big{display:inline-block;margin-top:16px;font-family:${HEAD};font-weight:700;font-size:96px;line-height:1;padding:10px 30px 14px;color:#fff;background:${RED};transform:rotate(-2deg);box-shadow:${shadow}}
.lb{display:inline-block;margin-top:12px;background:rgba(20,22,25,.88);padding:7px 18px 9px;font-family:${TYPE};font-weight:700;font-size:30px;color:${PAPER};border-left:6px solid ${RED}}
.tag{display:flex;align-items:center;gap:18px;margin-top:12px;padding:10px 26px 12px 12px;background:${paper};border-left:12px solid ${INK};box-shadow:${shadow};width:max-content;max-width:880px;box-sizing:border-box}
.tag i{flex:none;font-style:normal;font-family:${TYPE};font-weight:700;font-size:22px;letter-spacing:.1em;color:${PAPER};background:${INK};padding:30px 10px;writing-mode:vertical-rl;transform:rotate(180deg)}
.tag b{display:block;font-family:${HEAD};font-weight:700;font-size:50px;line-height:1.06;color:${INK}}
.tag span{display:block;font-family:${TYPE};font-weight:700;font-size:29px;line-height:1.2;color:#4A463E;margin-top:4px}
.q{margin-top:14px;font-family:${HEAD};font-weight:700;font-size:48px;line-height:1.14;padding:16px 26px;color:${PAPER};background:${CH};border:2px solid ${HAIR};border-left:12px solid ${RED};box-shadow:${shadow}}
.q em{font-style:normal;color:${RED}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP16_INDONESIA_KELUAR_PBB",
  ep: "16", bg: BG, vig: 0.42, grain: 0.06, capfloor: 0.0, html, css, chipFont: TYPE, chipColor: PAPER,
  chip: "REKONSTRUKSI ARSIP &middot; ILUSTRASI SEJARAH",
  extraAt: ["s1:keluar", "s1:Indonesia", "s2:Indonesia", "s2:keenam", "s2:PBB", "s2:28", "s2:kurang", "s3:Pertengahan", "s3:berkonfrontasi", "s3:Malaysia",
    "s3:terpilih", "s3:Dewan", "s4:Dalam", "s4:surat", "s4:20", "s4:U", "s4:memutuskan", "s4:keluar", "s5:Presiden", "s5:Sukarno", "s5:menggagas", "s5:CONEFO",
    "s6:Tapi", "s6:Soeharto", "s6:telegram", "s6:19", "s6:menyatakan", "s6:kembali", "s6:penuh", "s7:28", "s7:September", "s7:tepat", "s7:enam", "s7:delegasi",
    "s7:dipersilakan", "s7:duduk", "s7:bukan", "s7:penghentian", "s8:Sampai", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.classList.contains('card')||e.classList.contains('tag')||e.classList.contains('cnt')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:46,rotation:1.5},{opacity:1,x:0,rotation:0,duration:.42,ease:'power3.out',immediateRender:false},t);},
 stamp2:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.7,rotation:-7,opacity:0},{scale:1,rotation:-2,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 slide:(e,t)=>{gsap.set(e,{x:1150});tl.set(e,{opacity:1},t);tl.fromTo(e,{x:1150},{x:-240,duration:.42,ease:'power3.out',immediateRender:false},t);tl.to(e,{x:-1700,duration:.36,ease:'power3.in'},t+.53);tl.set(e,{opacity:0},t+.92);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,x:40},{opacity:1,x:0,duration:.4,ease:'power3.out'},a+.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:-30,duration:.24,ease:'power2.in'},b-.3)`,
});

const words = TL.words.map((w) => ({ ...w }));
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Courier Prime","Courier New",monospace;font-weight:700;font-size:54px;line-height:1.16;color:#1D1D1B;padding:14px 26px 18px;background:linear-gradient(176deg,#ECE8DD,#E4E0D4 55%,#D9D4C6);border-left:10px solid #FF4A2E;box-shadow:0 14px 30px rgba(0,0,0,.55)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#1D1D1B"},{color:"#FF4A2E",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#1D1D1B",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Indonesia Keluar PBB", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
