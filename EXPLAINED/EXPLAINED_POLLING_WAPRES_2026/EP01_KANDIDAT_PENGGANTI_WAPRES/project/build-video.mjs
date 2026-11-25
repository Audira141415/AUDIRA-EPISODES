// EP01 KANDIDAT PENGGANTI WAPRES. DATAPHYSICAL: a data-sculpture gallery. Panels are museum wall labels: a dark plate,
// amber mono kicker, one big number chip (128 px) per beat with a brass rule, rows dimmed until their word.
// Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TXT = "#ECEFF4", AMB = "#F5B54F", BRS = "#D2B07A", TEAL = "#9FD3D6", PLATE = "rgba(22,23,27,.88)", SUB = "#B9BEC7";
const TITLE = "'Archivo Black',sans-serif", MONO = "'JetBrains Mono',monospace", BODY = "Inter,sans-serif";
const SRC = `<div class="src">Sumber: Survei LRP</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">POLLING WAPRES 2026 · EP 01</div>
  <div class="ttl">KURSI WAPRES<br>KOSONG</div>
  <div class="chip sm"><b class="nb" data-at="s1:12" data-fx="lit">12</b><span class="who" data-at="s1:12" data-fx="lit">nama</span><b class="arw" data-at="s1:2" data-fx="pop">→ 2</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">12 NOV 2026 · RESMI</div>
  <div class="chip"><b class="nb">12 NOV</b><span class="who">Gibran<br>mundur</span></div>
  <div class="ln" data-at="s2:Prabowo" data-fx="lit">Prabowo menerima, dengan berat hati</div>
  <div class="ln t" data-at="s2:klaster" data-fx="lit">4 klaster kandidat di survei nasional</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KLASTER 1 · KABINET</div>
  <div class="chip"><b class="ct nb" data-from="0" data-to="19.3" data-dec="1" data-suf="%" data-a="s3:Amran" data-d="1.3">19,3%</b><span class="who">Andi Amran Sulaiman<i>Menteri Pertanian</i></span></div>
  <div class="ln" data-at="s3:Yusril" data-fx="lit">Yusril Ihza Mahendra · <b>14,3%</b></div>
  <div class="ln" data-at="s3:Sjafrie" data-fx="lit">Sjafrie Sjamsoeddin · <b>10,2%</b></div>
  ${SRC}
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">KLASTER 2 · KEPALA DAERAH</div>
  <div class="chip"><b class="ct nb" data-from="0" data-to="33.7" data-dec="1" data-suf="%" data-a="s4:Dedi" data-d="1.3">33,7%</b><span class="who">Dedi Mulyadi<i>Gubernur Jawa Barat</i></span></div>
  <div class="ln" data-at="s4:Sherly" data-fx="lit">Sherly Tjoanda · <b>19,4%</b></div>
  <div class="ln" data-at="s4:Pramono" data-fx="lit">Pramono Anung · masuk daftar</div>
  ${SRC}
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">KLASTER 3 · PIMPINAN LEMBAGA</div>
  <div class="chip"><b class="ct nb" data-from="0" data-to="21.4" data-dec="1" data-suf="%" data-a="s5:Puan" data-d="1.3">21,4%</b><span class="who">Puan Maharani</span></div>
  <div class="ln" data-at="s5:Sultan" data-fx="lit">Sultan Bachtiar Najamudin · <b>17,8%</b></div>
  <div class="ln" data-at="s5:Muzani" data-fx="lit">Ahmad Muzani · <b>14,2%</b></div>
  ${SRC}
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">SURVEI BUKAN KEPUTUSAN</div>
  <div class="ln" data-at="s6:Presiden" data-fx="lit">Penentu: Presiden Prabowo</div>
  <div class="chip" data-at="s6:25" data-fx="lit"><b class="nb">25 NOV</b><span class="who">deadline 2 nama<i>ke MPR</i></span></div>
  <div class="ln t" data-at="s6:Demokrat" data-fx="lit">Koalisi PAN … Demokrat: ikut Prabowo</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">MENGUAT DARI DALAM</div>
  <div class="chip nm"><span class="name">Sufmi Dasco Ahmad</span><span class="who">Wakil Ketua Umum Gerindra<i>bukan dari survei</i></span></div>
  <div class="chip sm" data-at="s7:12" data-fx="lit"><b class="nb">12</b><span class="who">kandidat</span><b class="arw" data-at="s7:2" data-fx="pop">→ 2</b><span class="who" data-at="s7:MPR" data-fx="lit">ke MPR</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">25 NOVEMBER</div>
  <div class="chip"><b class="nb">2 NAMA</b></div>
  <div class="ln t" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA Explained</div>
</div>`;

const css = `
.tag{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:36px;letter-spacing:.08em;color:${AMB};background:${PLATE};padding:8px 20px 7px;margin-bottom:10px;border-left:8px solid ${AMB}}
.ttl{display:table;font-family:'Archivo Black',sans-serif;font-size:84px;line-height:1.02;color:${TXT};background:${PLATE};padding:10px 26px 14px;margin-bottom:10px;letter-spacing:.01em}
.chip{display:flex;align-items:center;gap:26px;width:max-content;max-width:914px;box-sizing:border-box;background:${PLATE};padding:8px 28px 10px 24px;margin-bottom:10px;border-left:8px solid ${BRS};box-shadow:0 14px 34px rgba(0,0,0,.35)}
.chip b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:128px;line-height:1.02;color:${TXT};letter-spacing:-.02em}
.chip.sm b{font-size:110px}
.chip b.arw{color:${BRS}}
.who{display:flex;flex-direction:column;font-family:Inter,sans-serif;font-weight:700;font-size:42px;line-height:1.15;color:${TXT}}
.who i{font-style:normal;font-weight:600;font-size:36px;color:${SUB};margin-top:4px}
.chip.nm{gap:10px;flex-direction:column;align-items:flex-start;padding:14px 28px 16px 24px}
.name{font-family:'Archivo Black',sans-serif;font-size:66px;line-height:1.05;color:${TXT}}
.ln{display:table;font-family:Inter,sans-serif;font-weight:600;font-size:42px;line-height:1.2;color:${TXT};background:${PLATE};padding:9px 22px 9px 18px;margin-bottom:8px;border-left:6px solid ${BRS};max-width:880px}
.ln.t{border-left-color:${TEAL}}
.ln b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:42px;color:${AMB}}
.src{display:table;font-family:Inter,sans-serif;font-weight:600;font-size:36px;color:${SUB};background:rgba(22,23,27,.7);padding:4px 16px}
#chip{background:rgba(22,23,27,.8);padding:5px 12px;color:${TXT}}
#outro .cr,#outro .cta{color:${TXT}}
#outro img{filter:brightness(.93)}`;

// anchors used only inside world3d.js
const w3 = readFileSync("world3d.js", "utf8");
const extraAt = [...new Set([...w3.matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: "#1C1D20", vig: 0.16, grain: 0.035, capfloor: 0.42, html, css, chipFont: "Inter,sans-serif", chipColor: TXT,
  sig: "EP01_KANDIDAT_PENGGANTI_WAPRES", chip: "ILUSTRASI DATA, BUKAN CUPLIKAN ASLI",
  extraAt,
  // wall labels rise out of the floor line like a plaque on a lift, then settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:40,clipPath:'inset(100% 0% 0% 0%)'},{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-30,clipPath:'inset(0% 0% 100% 0%)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.42},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:58px;line-height:1.2;color:${TXT};text-shadow:0 2px 0 rgba(10,10,12,.9),0 0 10px rgba(10,10,12,.85),0 0 22px rgba(10,10,12,.6)}
.w{display:inline-block;margin:0 .2em;padding:0 .1em;border-radius:6px}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(245,181,79,0)",color:"${TXT}",scale:1},{backgroundColor:"rgba(245,181,79,0.94)",color:"#17181B",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(245,181,79,0)",color:"${TXT}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kandidat Pengganti Wapres", "#1C1D20");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
