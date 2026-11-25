// EP03 DAMPAK POLITIK EKONOMI. DATAPHYSICAL: a giant brass balance scale on a walnut plinth, PASAR vs RAKYAT.
// HUD = museum data cards: dark plate, amber kicker, Space Grotesk titles, JetBrains Mono number chips (~128 px).
// Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#141416", HUD = "#ECEFF4", AMB = "#F5B44E", TEAL = "#9FD3D6", ORG = "#D4521C", GOLD = "#E6C35C";
const TITLE = "'Space Grotesk',sans-serif", MONO = "'JetBrains Mono',monospace", BODY = "Inter,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">DAMPAK POLITIK &amp; EKONOMI</div>
  <div class="ttl">Wapres mundur.</div>
  <div class="ln" data-at="s1:bereaksi" data-fx="lit">Pasar langsung bereaksi</div>
  <div class="ln a" data-at="s1:kira" data-fx="lit">Tapi bukan seperti yang kamu kira</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">IHSG · HARI GIBRAN MUNDUR</div>
  <div class="chip t"><i class="up"></i><b class="ct nb" data-from="0" data-to="5250" data-a="s2:naik" data-d="${(at("s2:5.250") - at("s2:naik") + 0.6).toFixed(2)}">0</b></div>
  <div class="sub t" data-at="s2:naik" data-fx="lit">naik +<b class="ct nb" data-from="0" data-to="2.66" data-dec="2" data-a="s2:2,66" data-d="0.9">0,00</b>%</div>
  <div class="ln" data-at="s2:443,5" data-fx="lit">Net buy asing Rp <b class="ct nb" data-from="0" data-to="443.5" data-dec="1" data-a="s2:443,5" data-d="1.0">0,0</b> M</div>
  <div class="ln o" data-at="s2:bukan" data-fx="lit">Bukan karena wapres mundur</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KENAIKAN ITU BERTEPATAN DENGAN</div>
  <div class="chip t" data-at="s3:MSCI" data-fx="lit">MSCI</div>
  <div class="sub t" data-at="s3:rebalancing" data-fx="lit">rebalancing indeks</div>
  <div class="ln" data-at="s3:indeks" data-fx="lit">Acuan investasi global</div>
  <div class="ln" data-at="s3:jadwal" data-fx="lit">Dana asing ikut jadwal MSCI</div>
  <div class="ln o" data-at="s3:sinyal" data-fx="lit">Jangan salah baca sinyal</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">RUPIAH · BERPOTENSI MENEMBUS</div>
  <div class="chip o" data-at="s4:18.500" data-fx="lit"><i class="dn"></i><small>Rp</small>18.500<small>/USD</small></div>
  <div class="sub o" data-at="s4:berpotensi" data-fx="lit">berpotensi, belum pasti</div>
  <div class="chip2 g" data-at="s4:9.000" data-fx="lit"><i class="dn g"></i>Emas Antam −Rp 9.000/g</div>
  <div class="ln" data-at="s4:Ketidakpastian" data-fx="lit">Ketidakpastian menekan mata uang</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SISI POLITIK · KOALISI</div>
  <div class="ttl" data-at="s5:diam" data-fx="lit">Semua diam.</div>
  <div class="row"><span class="pill" data-at="s5:PAN" data-fx="lit">PAN</span><span class="pill" data-at="s5:Demokrat" data-fx="lit">DEMOKRAT</span><span class="pill" data-at="s5:PKS" data-fx="lit">PKS</span><span class="pill" data-at="s5:Golkar" data-fx="lit">GOLKAR</span></div>
  <div class="ln" data-at="s5:mengusulkan" data-fx="lit">Tak ada usulan nama calon wapres</div>
  <div class="ln" data-at="s5:Prabowo" data-fx="lit">Semua diserahkan ke Prabowo</div>
  <div class="stp" data-at="s5:ini" data-fx="stamp">KEHATI-HATIAN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">SUARA PUBLIK</div>
  <div class="ttl" data-at="s6:lantang" data-fx="lit">Lebih lantang.</div>
  <div class="ln" data-at="s6:Papua" data-fx="lit"><b>Tokoh Papua:</b> paham daerah</div>
  <div class="ln" data-at="s6:Kompas" data-fx="lit"><b>Kompas:</b> melampaui kompromi politik</div>
  <div class="ln" data-at="s6:ISEAI" data-fx="lit"><b>ISEAI:</b> aman bila transisi tertib</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">INI ANGKANYA</div>
  <div class="chip o" data-at="s7:18.500" data-fx="lit"><i class="dn"></i><small>Rp</small>18.500<small>/USD</small></div>
  <div class="sub o" data-at="s7:18.500" data-fx="lit">rupiah berpotensi</div>
  <div class="chip2 t" data-at="s7:MSCI" data-fx="lit"><i class="up"></i>IHSG naik karena MSCI</div>
  <div class="ln a" data-at="s7:rakyat" data-fx="lit">Rakyat ingin lebih dari sekadar nama</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">PASAR MENUNGGU · RAKYAT MENUNGGU</div>
  <div class="ttl">Pasar dan rakyat menunggu.</div>
  <div class="ln a" data-at="s8:Ikuti" data-fx="lit">Ikuti AUDIRA Explained</div>
</div>`;

const css = `
.p{padding:0}
.tag{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:27px;letter-spacing:.1em;color:${AMB};background:rgba(16,20,34,.86);padding:9px 18px 8px;margin-bottom:12px;border-left:7px solid ${AMB}}
.ttl{display:table;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:104px;line-height:1.02;letter-spacing:-.01em;color:${HUD};background:rgba(16,20,34,.8);padding:6px 26px 14px;margin-bottom:12px}
.chip{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:128px;line-height:1;color:${HUD};background:rgba(16,20,34,.84);padding:14px 26px 16px 22px;margin-bottom:10px;border-bottom:8px solid ${TEAL};white-space:nowrap}
.chip.o{border-bottom-color:${ORG}}.chip.t{color:${TEAL}}
.chip small{font-size:48px;margin:0 10px 0 4px;color:${HUD};opacity:.9}
.chip2{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:58px;line-height:1.05;color:${HUD};background:rgba(16,20,34,.84);padding:10px 22px 12px 18px;margin-bottom:10px;border-left:8px solid ${TEAL};white-space:nowrap}
.chip2.g{border-left-color:${GOLD};color:${GOLD}}.chip2.t{color:${TEAL}}
.sub{display:table;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:44px;color:${HUD};background:rgba(16,20,34,.8);padding:6px 18px;margin:-4px 0 12px}
.sub.t{color:${TEAL}}.sub.o{color:#F0A27E}
.ln{display:table;font-family:Inter,sans-serif;font-weight:600;font-size:42px;line-height:1.2;color:${HUD};background:rgba(26,18,40,.84);padding:9px 20px 9px 18px;margin-bottom:9px;border-left:6px solid #8A8F96;max-width:880px}
.ln b{font-weight:800;color:#E8C860}
.ln.o{border-left-color:${ORG}}.ln.a{border-left-color:${AMB}}
.up,.dn{display:inline-block;width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;margin:0 18px 12px 0;vertical-align:middle}
.up{border-bottom:44px solid ${TEAL}}.dn{border-top:44px solid ${ORG}}.dn.g{border-top-color:${GOLD}}
.chip2 .up,.chip2 .dn{border-left-width:20px;border-right-width:20px;margin-bottom:6px}.chip2 .up{border-bottom-width:30px}.chip2 .dn{border-top-width:30px}
.row{display:flex;gap:12px;margin-bottom:12px}
.pill{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:36px;color:#141416;background:#D9BE6E;padding:8px 16px;letter-spacing:.04em}
.stp{display:table;margin-top:6px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:54px;letter-spacing:.06em;color:${AMB};border:5px solid ${AMB};padding:4px 20px;background:rgba(16,20,34,.86)}
#chip{background:rgba(16,20,34,.82);color:${HUD};padding:5px 12px;opacity:.92}
#outro .cr,#outro .cta{color:${HUD}}
#outro img{filter:brightness(.94)}
#capfloor{background:linear-gradient(180deg,rgba(12,16,30,0),rgba(12,16,30,.5) 40%,rgba(12,16,30,.5) 70%,rgba(12,16,30,0))}`;

// anchors used only inside world3d.js: scan A("sN:word") calls
const w3 = readFileSync("world3d.js", "utf8");
const extraAt = [...new Set([...w3.matchAll(/"(s\d:[^"]+)"/g)].map((m) => m[1]))];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: BG, vig: 0.22, grain: 0.03, capfloor: 0.5, html, css, chipFont: MONO, chipColor: HUD,
  sig: "EP03_DAMPAK_POLITIK_EKONOMI",
  chip: "ILUSTRASI DATA, BUKAN CUPLIKAN ASLI",
  extraAt,
  // panels rise like a museum card sliding up its rail, then settle
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:46,clipPath:'inset(0% 0% 100% 0%)'},{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-34,duration:.3,ease:'power2.in'},b-.3);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.5},{opacity:1,duration:.3,ease:'power2.out'},t),`,
});

// captions: merge punctuation-only tokens ("MSCI" + ",") into the word before, so no lone commas show
const words = [];
for (const w of TL.words) {
  if (/^[.,:;?!—–-]+$/.test(w.text) && words.length && words[words.length - 1].scene === w.scene) {
    const p = words[words.length - 1];
    words[words.length - 1] = { ...p, text: w.text === "—" ? p.text + " —" : p.text + w.text, end: w.end };
  } else words.push({ ...w });
}
const TLc = { ...TL, words };
const n = writeCaptions(".", TLc, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:58px;line-height:1.2;color:${HUD};text-shadow:0 2px 0 #141416,0 0 10px rgba(20,20,22,.95),0 0 3px #141416}
.w{display:inline-block;margin:0 .2em;padding:0 .1em;border-radius:6px}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(245,180,78,0)",color:"${HUD}",scale:1},{backgroundColor:"rgba(245,180,78,0.95)",color:"#141416",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(245,180,78,0)",color:"${HUD}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Dampak Politik Ekonomi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
