// EP23 TEMBOK BERLIN SALAH UCAP: FILMNOIR. A noir night in three sets: the foggy Bornholmer Strasse crossing with
// searchlights and watchtowers, the 18.00 press room (clock, name card, slip of paper, SEGERA), and a flat where the
// TV glows at 20.00; then the crowd, the gate opening around 22.45 and a crane back over the wall.
// Panels are case-file cards: near-black glass, cream hairline, Playfair Display titles, Courier Prime times.
// Set changes happen under a venetian-blind wipe. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#B3122E", CREAM = "#F3E2B3", SILVER = "#C9CCD1", BLK = "#0A0A0A", BG = "#07080A";
const HEAD = `"Playfair Display",Georgia,serif`, TYPE = `"Courier Prime","Courier New",monospace`;

const blinds = (a) => `<div class="bl" data-at="${a}" data-fx="blinds">${Array.from({ length: 16 }, () => "<i></i>").join("")}</div>`;
const tag = (name, role, a) => `<div class="tag" data-at="${a}" data-fx="card"><i>NAMA</i><div><b>${name}</b><span>${role}</span></div></div>`;
const card = (b, s, a, cls = "") => `<div class="card ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const time = (hm, s, a, cls = "") => `<div class="tm ${cls}" data-at="${a}" data-fx="card"><b>${hm}</b><span>${s}</span></div>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=block">
<div class="pre"><span style="font-family:'Playfair Display',serif;font-weight:700">SEGERA ß</span><span style="font-family:'Playfair Display',serif;font-weight:900">1961</span><span style="font-family:'Playfair Display',serif;font-weight:700;font-style:italic">kecelakaan</span><span style="font-family:'Courier Prime',monospace;font-weight:700">18.53</span><span style="font-family:'Courier Prime',monospace;font-weight:400">catatan</span></div>
${blinds("s3:November")}${blinds("s6:Berita")}${blinds("s6:Warga")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 23</div>
  <div class="h1">Tembok Berlin terbuka karena <em>satu jawaban keliru</em></div>
  <div class="row"><div class="st" data-at="s1:perang" data-fx="stamp2">BUKAN KARENA PERANG</div></div>
  <div class="lb" data-at="s1:konferensi" data-fx="card" data-d="inline-block">BERLIN &middot; 9 NOVEMBER 1989</div>
</div>
<div class="p" data-in="s2" data-out="s3:November">
  <div class="kk">TEMBOK BERLIN &middot; SEJAK 13 AGUSTUS 1961</div>
  <div class="yr" data-at="s2:1961" data-fx="card"><b>1961</b><span>tembok beton<br>membelah Berlin</span></div>
  <div class="stats">
    <div class="sx" data-at="s2:empat" data-fx="card" data-d="flex"><b>4 m</b><span>tinggi beton</span></div>
    <div class="sx" data-at="s2:kilometer" data-fx="card" data-d="flex"><b><b class="ct" data-from="0" data-to="155" data-a="s2:kilometer" data-d="0.9">0</b> km</b><span>panjang</span></div>
    <div class="sx rd" data-at="s2:tiga" data-fx="card" data-d="flex"><b><b class="ct" data-from="0" data-to="302" data-a="s2:tiga" data-d="1.0">0</b></b><span>menara jaga</span></div>
  </div>
</div>
<div class="p" data-in="s3:November" data-out="s4:Sembilan">
  <div class="kk">NOVEMBER 1989 &middot; JERMAN TIMUR</div>
  ${card("Aturan perjalanan baru", "warga boleh mengajukan izin ke luar negeri, termasuk lewat Berlin", "s3:aturan")}
  <div class="row"><div class="st" data-at="s3:keesokan" data-fx="stamp2">BERLAKU BESOK</div></div>
</div>
<div class="p" data-in="s4:Sembilan" data-out="s5:Jam">
  <div class="kk">9 NOVEMBER 1989 &middot; KONFERENSI PERS</div>
  ${time("18.00", "siaran langsung TV &amp; radio", "s4:enam")}
  ${tag("Günter Schabowski", "juru bicara &middot; tidak ikut membahas aturan", "s4:Schabowski")}
  <div class="lb" data-at="s4:secarik" data-fx="card" data-d="inline-block">hanya diberi secarik catatan</div>
</div>
<div class="p" data-in="s5:Jam" data-out="s6:Berita">
  ${time("18.53", "pertanyaan soal aturan perjalanan", "s5:Jam", "big")}
  ${tag("Riccardo Ehrman", "wartawan Italia (ANSA)", "s5:wartawan")}
  <div class="qq" data-at="s5:Ditanya" data-fx="card">&ldquo;Kapan berlaku?&rdquo;</div>
  <div class="lb sub" data-at="s5:segera" data-fx="card" data-d="inline-block">&ldquo;&hellip; <u>segera</u>, tanpa penundaan.&rdquo;</div>
</div>
<div class="p" data-in="s6:Berita" data-out="s7:Tak">
  <div class="kk">BERITA MENYEBAR</div>
  ${time("20.00", "siaran berita Jerman Barat", "s6:Jam")}
  ${card("Ditonton hampir seluruh Jerman Timur", "", "s6:ditonton")}
  ${card("Warga mendatangi pos perbatasan", "", "s6:Warga", "rd")}
</div>
<div class="p" data-in="s7:Tak" data-out="s7:Sekitar">
  <div class="kk">POS BORNHOLMER STRA&szlig;E</div>
  ${card("Tak ada pejabat yang berani", "memerintahkan tembakan", "s7:pejabat")}
</div>
<div class="p" data-in="s7:Sekitar" data-out="s8">
  <div class="kk">9 NOVEMBER 1989 &middot; MALAM</div>
  ${time("&plusmn;22.45", "sumber lain: 23.30", "s7:sebelas")}
  ${tag("Harald Jäger", "komandan pos Bornholmer Straße", "s7:Harald")}
  <div class="row"><div class="st cr" data-at="s7:membuka" data-fx="stamp2">GERBANG DIBUKA</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">KATA SEJARAWAN</div>
  <div class="h2"><em>&ldquo;Sebuah kecelakaan.&rdquo;</em></div>
  <div class="lb" data-at="s8:dua" data-fx="card" data-d="inline-block">1961 &ndash; 1989 &middot; berdiri 28 tahun</div>
  <div class="row"><div class="seg sm" data-at="s8:segera" data-fx="stamp2">SEGERA</div></div>
  <div class="q" data-at="s8:Menurut" data-fx="card">Satu kalimat bisa mengubah sejarah?</div>
</div>`;

const glass = `linear-gradient(176deg,rgba(22,22,24,.9),rgba(10,10,11,.86))`;
const shadow = `0 18px 40px rgba(0,0,0,.6)`;
const css = `
.pre{position:absolute;left:-3000px;top:0;font-size:40px;opacity:0}
.bl{position:absolute;inset:0;z-index:14;pointer-events:none;opacity:0;display:flex;flex-direction:column}
.bl i{flex:1;background:linear-gradient(180deg,#141416,#050506 70%,#000);transform-origin:50% 0;box-shadow:0 2px 0 rgba(243,226,179,.18)}
.kk{display:inline-block;font-family:${TYPE};font-weight:700;font-size:28px;letter-spacing:.1em;color:${CREAM};background:rgba(10,10,10,.82);border:2px solid ${CREAM};padding:8px 18px 7px;margin-bottom:16px;box-shadow:${shadow}}
.kk::before{content:"";display:inline-block;width:12px;height:12px;border-radius:50%;background:${RED};margin-right:14px;vertical-align:2px}
.h1{background:${glass};padding:20px 30px 26px;box-shadow:${shadow};border-left:3px solid ${CREAM};font-family:${HEAD};font-weight:900;font-size:84px;line-height:1.04;color:#F4F1EA;letter-spacing:-.005em}
.h1 em,.h2 em{font-style:italic;font-weight:700;color:${CREAM}}
.h2{display:inline-block;background:${glass};padding:14px 30px 20px;box-shadow:${shadow};border-left:3px solid ${CREAM};font-family:${HEAD};font-weight:700;font-size:74px;line-height:1.08;color:#F4F1EA}
.row{display:block}
.st{display:inline-block;margin-top:16px;font-family:${TYPE};font-weight:700;font-size:46px;letter-spacing:.06em;line-height:1.1;padding:8px 24px;color:${RED};border:6px solid ${RED};background:rgba(8,8,9,.85);transform:rotate(-2deg);box-shadow:${shadow}}
.st.cr{color:${CREAM};border-color:${CREAM}}
.lb{display:inline-block;margin-top:14px;background:rgba(8,8,9,.88);padding:8px 20px 9px;font-family:${TYPE};font-weight:700;font-size:32px;color:${CREAM};border-left:6px solid ${RED};box-shadow:${shadow}}
.lb.sub{font-size:38px;font-style:italic}.lb u{text-decoration:none;color:#fff;background:${RED};padding:0 8px}
.yr{display:flex;align-items:center;gap:24px;width:max-content;padding:2px 30px 8px;background:${glass};border-left:3px solid ${CREAM};box-shadow:${shadow}}
.yr b{font-family:${HEAD};font-weight:900;font-size:150px;line-height:1.05;color:#F4F1EA}
.yr span{font-family:${TYPE};font-weight:700;font-size:32px;line-height:1.2;color:${SILVER}}
.stats{display:flex;gap:16px;margin-top:16px}
.sx{flex-direction:column;padding:10px 20px 14px;background:${glass};border-top:4px solid ${CREAM};box-shadow:${shadow};min-width:220px}
.sx b{font-family:${HEAD};font-weight:900;font-size:76px;line-height:1.05;color:#F4F1EA;white-space:nowrap}
.sx b .ct{font:inherit;color:inherit}
.sx span{font-family:${TYPE};font-weight:700;font-size:28px;color:${SILVER}}
.sx.rd{border-top-color:${RED}}
.card{display:flex;flex-direction:column;gap:4px;margin-top:14px;padding:14px 26px 16px;background:${glass};border-left:8px solid ${CREAM};box-shadow:${shadow};width:max-content;max-width:900px;box-sizing:border-box}
.card b{font-family:${HEAD};font-weight:700;font-size:52px;line-height:1.08;color:#F4F1EA}
.card span{font-family:${TYPE};font-weight:700;font-size:31px;line-height:1.22;color:${SILVER}}
.card.rd{border-left-color:${RED}}
.tm{display:flex;align-items:center;gap:22px;margin-top:6px;padding:4px 28px 8px;background:${glass};border-left:8px solid ${RED};box-shadow:${shadow};width:max-content;max-width:900px}
.tm b{font-family:${TYPE};font-weight:700;font-size:112px;line-height:1.05;color:${CREAM};letter-spacing:-.02em}
.tm span{font-family:${TYPE};font-weight:700;font-size:30px;line-height:1.2;color:${SILVER};max-width:330px}
.tm.big b{font-size:150px}
.tag{display:flex;align-items:center;gap:18px;margin-top:14px;padding:10px 26px 12px 12px;background:#E9E3D3;border-left:10px solid ${BLK};box-shadow:${shadow};width:max-content;max-width:900px;box-sizing:border-box}
.tag i{flex:none;font-style:normal;font-family:${TYPE};font-weight:700;font-size:22px;letter-spacing:.1em;color:#E9E3D3;background:${BLK};padding:28px 10px;writing-mode:vertical-rl;transform:rotate(180deg)}
.tag b{display:block;font-family:${HEAD};font-weight:700;font-size:50px;line-height:1.06;color:${BLK}}
.tag span{display:block;font-family:${TYPE};font-weight:700;font-size:28px;line-height:1.2;color:#3e3a33;margin-top:4px}
.qq{display:inline-block;margin-top:14px;font-family:${HEAD};font-style:italic;font-weight:700;font-size:56px;color:#F4F1EA;background:${glass};padding:8px 26px 14px;border-left:8px solid ${SILVER};box-shadow:${shadow}}
.seg{display:inline-block;margin-top:16px;font-family:${HEAD};font-weight:900;font-size:150px;line-height:1;letter-spacing:.04em;padding:10px 34px 18px;color:#fff;background:${RED};transform:rotate(-2deg);box-shadow:${shadow}}
.seg.sm{font-size:96px}
.q{margin-top:16px;font-family:${HEAD};font-weight:700;font-size:50px;line-height:1.12;padding:16px 26px;color:#F4F1EA;background:${glass};border-left:10px solid ${RED};box-shadow:${shadow};max-width:880px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP23_TEMBOK_BERLIN_SALAH_UCAP",
  ep: "23", bg: BG, vig: 0.5, grain: 0.08, capfloor: 0.35, html, css, chipFont: TYPE, chipColor: CREAM,
  chip: "ILUSTRASI SEJARAH &middot; BUKAN CUPLIKAN ASLI",
  extraAt: ["s1:konferensi", "s1:perang", "s2:1961", "s2:empat", "s2:Berlin", "s2:Panjangnya", "s2:dijaga", "s2:kilometer", "s2:tiga",
    "s3:November", "s3:Warga", "s3:Aturan", "s3:aturan", "s3:keesokan", "s4:Sembilan", "s4:jam", "s4:enam", "s4:konferensi", "s4:langsung", "s4:Schabowski", "s4:Ia",
    "s4:secarik", "s4:catatan", "s5:Jam", "s5:kurang", "s5:aturan", "s5:menit", "s5:wartawan", "s5:itu", "s5:Schabowski", "s5:membacakan", "s5:catatannya", "s5:Ditanya", "s5:ragu",
    "s5:menjawab", "s5:segera", "s5:tanpa", "s5:penundaan", "s6:Berita", "s6:Jam", "s6:ditonton", "s6:Warga", "s6:perbatasan", "s7:Tak", "s7:tembakan",
    "s7:Sekitar", "s7:sebelas", "s7:Bornholmer", "s7:Harald", "s7:membuka", "s7:gerbang", "s8:Sejarawan", "s8:kecelakaan", "s8:Tembok", "s8:dua", "s8:delapan", "s8:segera", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.card,.tag,.tm,.yr')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:26,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.45,ease:'power3.out',immediateRender:false},t);},
 stamp2:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.7,rotation:-7,opacity:0},{scale:1,rotation:-2,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 blinds:(e,t)=>{const s=[...e.children];tl.set(e,{opacity:1},t-.5);tl.fromTo(s,{scaleY:0},{scaleY:1,duration:.4,ease:'power2.in',stagger:.008,immediateRender:false},t-.48);tl.to(s,{scaleY:0,duration:.45,ease:'power2.out',stagger:.008},t+.06);tl.set(e,{opacity:0},t+.7);gsap.set(s,{scaleY:0});},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:20},{opacity:1,y:0,duration:.45,ease:'power3.out'},a+.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-16,duration:.26,ease:'power2.in'},b-.3)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Courier Prime","Courier New",monospace;font-weight:700;font-size:56px;line-height:1.16;color:#BFC2C7;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.9),0 0 4px #000}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#BFC2C7"},{color:"#FFE3A0",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.fromTo("#${id}",{y:0},{y:-4,duration:.08,yoyo:true,repeat:1},${w.start.toFixed(3)});tl.to("#${id}",{color:"#BFC2C7",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tembok Berlin Salah Ucap", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
