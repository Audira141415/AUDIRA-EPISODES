// EP40 BALTIC WAY: VOXELVERSE. A voxel miniature of Estonia, Latvia and Lithuania at dusk plus a human-scale road
// diorama where thousands of voxel people hold hands from Vilnius through Riga to Tallinn. Panels are dusk-paper
// cards with a flag-stripe kicker; numbers in JetBrains Mono.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1B1712", DUSK = "#F2A65A", CREAM = "#F6EBD3", RED = "#B3121F", BG = "#151B33";
const EE = "#0072CE", LV = "#9E3039", LTY = "#FDB913", LTG = "#006A44", LTR = "#C1272D";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const flag = (cols, w = [1, 1, 1]) => `<i class="fl">${cols.map((c, i) => `<s style="background:${c};flex:${w[i]}"></s>`).join("")}</i>`;
const person = (cls) => `<i class="pp ${cls}"><u></u><em></em></i>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Space Grotesk',sans-serif;font-weight:700">BALTIC 675</span><span style="font-family:'Space Grotesk',sans-serif;font-weight:500">baltik</span><span style="font-family:'JetBrains Mono',monospace;font-weight:500">19.00</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  ${kk("EP 40", "FAKTA SEJARAH NEGARA")}
  <div class="h1">BALTIC <em>WAY</em></div>
  <div class="sub">23 AGUSTUS 1989 ${flag([EE, "#111", "#fff"])}${flag([LV, "#fff", LV], [2, 1, 2])}${flag([LTY, LTG, LTR])}</div>
  <div class="chips"><i class="ch" data-at="s1:juta" data-fx="stampc">± 2 JUTA ORANG</i><i class="ch2" data-at="s1:kilometer" data-fx="stampc">675 KM</i><i class="ch3" data-at="s1:damai" data-fx="stampc">DAMAI</i></div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3">
  ${kk("01", "TIGA NEGARA BALTIK")}
  <div class="cd row fr" data-at="s2:Estonia" data-fx="card"><b>${flag([EE, "#111", "#fff"])} ESTONIA</b></div>
  <div class="cd row fr" data-at="s2:Latvia" data-fx="card"><b>${flag([LV, "#fff", LV], [2, 1, 2])} LATVIA</b></div>
  <div class="cd row fr" data-at="s2:Lituania" data-fx="card"><b>${flag([LTY, LTG, LTR])} LITUANIA</b></div>
  ${row("1940–1989 · UNI SOVIET", "masih dikuasai pada tahun 1989", "s2:dikuasai", "rd")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "23 AGUSTUS 1939")}
  ${row("PAKTA MOLOTOV–RIBBENTROP", "", "s3:Pakta")}
  ${row("PROTOKOL RAHASIA", "membagi Eropa Timur: Uni Soviet × Jerman Nazi", "s3:Protokol", "rd")}
  ${row("LAMA DISANGKAL", "Uni Soviet bilang protokol itu tidak ada", "s3:menyangkal", "gy")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "23 AGUSTUS 1989")}
  ${row("TEPAT 50 TAHUN KEMUDIAN", "", "s4:lima")}
  ${row("VILNIUS → RIGA → TALLINN", "rantai disiapkan gerakan kemerdekaan 3 negara", "s4:Vilnius")}
  ${row("RUAS JALAN PER KOTA", "+ bus gratis untuk peserta", "s4:jatah", "am")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "WAKTU SETEMPAT")}
  <div class="clock" data-at="s5:Pukul" data-fx="card"><b>19.00</b><span>bergandengan<br><span class="ct" data-from="0" data-to="15" data-a="s5:bergandengan" data-d="1.6">15</span> MENIT</span></div>
  ${row("TEREKAM DARI UDARA", "pesawat &amp; helikopter: barisan hampir tak terputus", "s5:Rekaman")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "BERAPA ORANG?")}
  <div class="cd row big" data-at="s6:satu" data-fx="card"><b><span class="ct" data-from="0" data-to="1" data-a="s6:satu-0.3" data-d="0.3">1</span>–<span class="ct" data-from="0" data-to="2" data-a="s6:dua-0.5" data-d="0.5">2</span> JUTA</b><span>perkiraan peserta</span></div>
  <div class="cd row pop" data-at="s6:total" data-fx="card"><div class="ppl">${person("on")}${person("half")}${person("")}${person("")}${person("")}${person("")}${person("")}${person("")}</div><span>dari ± <span class="ct" data-from="0" data-to="8" data-a="s6:delapan-0.6" data-d="0.6">8</span> JUTA penduduk · 1 ikon = 1 juta</span></div>
  <div class="cd row am" data-at="s6:dibutuhkan" data-fx="card"><b>± <span class="ct" data-from="0" data-to="200000" data-a="s6:dua#2-0.4" data-d="0.9">200.000</span> / NEGARA</b><span>minimal agar rantai tersambung</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "SETELAH ITU")}
  ${row("MOSKOW: “HISTERIA”", "koran Pravda, Agustus 1989", "s7:histeria", "rd")}
  ${row("DES 1989 · PROTOKOL DIAKUI", "oleh Uni Soviet sendiri", "s7:Desember", "gn")}
  <div class="cd row lt" data-at="s7:sebelas" data-fx="card"><b>11 MARET 1990</b><span>Lituania: republik Soviet pertama yang menyatakan merdeka</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "TANGAN KOSONG")}
  ${row("MENGUBAH PETA EROPA", "aksi damai, 675 km, 15 menit", "s8:mengubah")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Apa yang membuat aksi damai bisa sekuat ini? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(246,235,211,.94);border-radius:10px;box-shadow:0 12px 30px rgba(20,10,30,.45)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:25px;letter-spacing:.08em;color:#F6EBD3;margin-bottom:16px;padding:7px 18px 7px 7px;background:rgba(21,27,51,.82);border-radius:8px;border-bottom:5px solid ${DUSK}}
.kk i{font-style:normal;background:${DUSK};color:${INK};padding:3px 10px;border-radius:4px}
.h1{font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:150px;line-height:.9;letter-spacing:-.02em;color:#FFF6E6;text-shadow:0 6px 26px rgba(30,15,40,.65)}
.h1 em{font-style:normal;color:${DUSK}}
.sub{display:flex;align-items:center;gap:14px;margin-top:14px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:34px;color:#FFF6E6;text-shadow:0 3px 12px rgba(30,15,40,.7)}
.fl{display:inline-flex;flex-direction:column;width:66px;height:42px;border-radius:4px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.4);vertical-align:middle;margin-right:4px}
.fl s{display:block;text-decoration:none}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:22px;align-items:center}
.ch,.ch2,.ch3{font-style:normal;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:52px;line-height:1;padding:12px 24px 10px;border-radius:8px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.4)}
.ch{color:${INK};background:${CREAM}}.ch2{color:${INK};background:${DUSK};font-family:'JetBrains Mono',monospace}.ch3{color:#fff;background:${LTG}}
.row{flex-direction:column;margin-top:14px;padding:10px 24px 12px 24px;border-left:14px solid ${DUSK};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:flex;align-items:center;gap:14px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:54px;line-height:1.04;letter-spacing:-.01em;color:${INK}}
.row span{display:block;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.3;color:#5B4A35;max-width:820px}
.row b span,.row span span{display:inline;font:inherit;color:inherit}
.row.fr b{font-size:58px}.row.fr .fl{width:84px;height:54px}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}
.row.gy{border-left-color:#6E6E6E}.row.am{border-left-color:${LTY}}
.row.gn{border-left-color:#1E7A46}.row.gn b{color:#1E7A46}
.row.lt{border-left:0;padding-left:38px;background:linear-gradient(90deg,${LTY} 0 6px,${LTG} 6px 12px,${LTR} 12px 18px,rgba(246,235,211,.95) 18px)}
.row.big b{font-family:'JetBrains Mono',monospace;font-size:84px;letter-spacing:-.02em}
.row.am b{font-family:'JetBrains Mono',monospace;font-size:52px}
.clock{display:flex;align-items:center;gap:24px;padding:10px 26px;border-left:14px solid ${DUSK};width:max-content;background:rgba(21,27,51,.88)!important}
.clock>b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:118px;line-height:1;color:#FFD9A0;letter-spacing:-.03em}
.clock>span{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:30px;line-height:1.25;color:#F6EBD3}
.ppl{display:flex;gap:10px;margin:4px 0 8px}
.pp{position:relative;display:block;width:44px;height:84px}
.pp u{position:absolute;left:12px;top:0;width:20px;height:20px;background:#9A8F7E;border-radius:3px}
.pp em{position:absolute;left:4px;top:24px;width:36px;height:58px;background:#9A8F7E;border-radius:4px}
.pp.on u,.pp.on em{background:${DUSK}}
.pp.half u,.pp.half em{background:repeating-linear-gradient(135deg,${DUSK} 0 7px,#C9B9A0 7px 13px)}
.q{margin-top:20px;padding:16px 26px 14px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:58px;line-height:1.06;color:${INK};border-left:14px solid ${DUSK};max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP40_BALTIC_WAY_1989",
  ep: "40", bg: BG, vig: 0.34, grain: 0.04, capfloor: 0.0, html, css, chipFont: `'JetBrains Mono',Consolas,monospace`, chipColor: "#F6EBD3",
  chip: "ILUSTRASI VOXEL &middot; BUKAN FOTO PESERTA",
  extraAt: ["s1:enam", "s1:tangan", "s1:rantai", "s2:Estonia", "s2:Latvia", "s2:Lituania", "s2:dikuasai", "s2:1940",
    "s3:Pakta", "s3:membagi", "s3:Jerman", "s3:Uni", "s3:menyangkal", "s3:1939",
    "s4:lima", "s4:Vilnius", "s4:Riga", "s4:Tallinn", "s4:jatah", "s4:bus", "s4:Agustus",
    "s5:Pukul", "s5:bergandengan", "s5:tangan", "s5:menit", "s5:Rekaman", "s5:pesawat", "s5:helikopter", "s5:menunjukkan", "s5:terputus",
    "s6:satu", "s6:dua", "s6:delapan", "s6:dua#2", "s6:Untuk", "s6:ribu",
    "s7:histeria", "s7:Desember", "s7:mengakui", "s7:protokol", "s7:sebelas", "s7:Lituania", "s7:merdeka",
    "s8:Tangan", "s8:Eropa", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-50},{opacity:1,x:0,duration:.36,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-30},{opacity:1,y:0,duration:.36,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-24,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:72px;line-height:1.04;letter-spacing:-.01em;color:#fff;-webkit-text-stroke:10px #1A1430;paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.6)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${DUSK}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Baltic Way", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
