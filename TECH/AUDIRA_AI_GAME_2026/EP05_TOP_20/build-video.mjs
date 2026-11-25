// EP05 PAPAN ATAS. A newspaper over a white city model: serif headlines, a rule-and-column grid, one orange. Panels slide like a printing plate. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1B1A18", PAP = "#F7F4EC", ORG = "#E5471B", GRN = "#2D8A57", RED = "#C7321F", BG = "#E9E5DC";
const P = '"Playfair Display",serif', S = '"IBM Plex Sans",sans-serif';
const stat = (val, txt, a, cls = "") => `<div class="st" data-at="${a}" data-fx="up"><b class="${cls}">${val}</b><span>${txt}</span></div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="np"><div class="mast"><span>AI BIKIN GAME</span><span>EP 05</span></div>
  <div class="hl">Dua Game AI Tembus <em>Top 20</em></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="np"><div class="mast"><span>SURAT PEMEGANG SAHAM</span><span>Q3 2026</span></div>
  <div class="hl sm" data-at="s2:Break" data-fx="fade">Break and Steal an Egg</div>
  <div class="hl sm" data-at="s2:Huss" data-fx="fade">Huss Valley</div>
  <div class="by" data-at="s2:Klaim" data-fx="fade">&ldquo;created almost entirely with AI&rdquo;, klaim Roblox</div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="np"><div class="mast"><span>KUNJUNGAN</span><span>GOSUGAMERS</span></div>
  ${stat('<i class="ct" data-from="0" data-to="289" data-a="s3:289"></i> jt', "Break and Steal an Egg", "s3:289", "o")}
  ${stat('<i class="ct" data-from="0" data-to="217" data-a="s3:217"></i> jt', "Huss Valley", "s3:217", "o")}</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="np"><div class="mast"><span>DATA ROBLOX</span><span>Q3 2026</span></div>
  ${stat("80%+", "dari top 100 memakai alat AI", "s4:80", "o")}
  ${stat("500.000+", "pengguna Build", "s4:500.000")}
  ${stat("70.000+", "game diterbitkan lewat Build", "s4:70.000")}</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="np"><div class="mast"><span>BACA DENGAN HATI-HATI</span><span>TINGGI MENARA: ILUSTRASI</span></div>
  ${stat("Top 20", "pemain bersamaan", "s5:Dua")}
  ${stat("Top 100", "jam main", "s5:Seratus")}
  <div class="by" data-at="s5:memakai" data-fx="fade">Memakai AI &ne; seluruhnya dibuat AI</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="np"><div class="mast"><span>YANG TIDAK DIJELASKAN</span></div>
  <div class="hl sm" data-at="s6:bagian" data-fx="fade">Bagian mana kerja <em>manusia?</em></div>
  <div class="hl sm" data-at="s6:Build" data-fx="fade">Dibuat dengan <em>Build?</em></div>
  <div class="by" data-at="s6:internal" data-fx="fade">Sumber: data internal perusahaan</div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="np"><div class="mast"><span>BISNIS Q3 2026</span><span>GRAFIK ILUSTRASI</span></div>
  ${stat("+16%", "pendapatan, US$1,6 miliar", "s7:Pendapatan", "g")}
  ${stat("&minus;12%", "bookings, US$1,7 miliar", "s7:pemesanan", "r")}
  ${stat("&minus;19%", "saham, setelah bursa tutup", "s7:saham", "r")}</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="np"><div class="mast"><span>PENUTUP SERI</span></div>
  <div class="hl sm" data-at="s8:Dari" data-fx="fade">Yang menentukan tetap <em>pemain.</em></div>
  <div class="by" data-at="s8:Kalau" data-fx="fade">Kalau tahu buatan AI, kamu masih main?</div></div>
</div>`;

const css = `
.np{background:${PAP};border-top:7px double ${INK};border-bottom:3px solid ${INK};padding:10px 20px 14px;box-shadow:0 18px 38px rgba(40,34,24,.2)}
.mast{display:flex;justify-content:space-between;gap:12px;font-family:${S};font-weight:700;font-size:23px;letter-spacing:.04em;color:${INK};border-bottom:2px solid ${INK};padding-bottom:7px;margin-bottom:10px}
.hl{font-family:${P};font-weight:900;font-size:92px;line-height:1.02;color:${INK};letter-spacing:-.015em}.hl em{font-style:italic;color:${ORG}}.hl.sm{font-size:56px;line-height:1.08;margin-bottom:8px}
.by{font-family:${S};font-weight:500;font-size:30px;line-height:1.2;color:#4A4640;margin-top:8px}
.st{display:flex;align-items:baseline;gap:16px;border-bottom:1px solid rgba(27,26,24,.4);padding:6px 0 8px;flex-wrap:wrap}.st:last-child{border:0}
.st b{font-family:${P};font-weight:900;font-size:66px;line-height:1;color:${INK};font-variant-numeric:lining-nums tabular-nums}.st b i{font-style:normal}.st b.o{color:${ORG}}.st b.g{color:${GRN}}.st b.r{color:${RED}}
.st span{font-family:${S};font-weight:500;font-size:29px;line-height:1.18;color:${INK}}
#chip{color:${INK};font-size:21px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.12, grain: 0.04, capfloor: 0, html, css, chipFont: S, chipColor: INK, chip: "ILUSTRASI MODEL DATA, BUKAN CUPLIKAN ROBLOX",
  extraAt: ["s1:besar", "s2:Break", "s2:Huss", "s2:Klaim", "s3:289", "s3:217", "s4:80", "s5:Seratus", "s5:Dua", "s6:tidak#2", "s6:bagian", "s6:Build", "s7:Pendapatan", "s7:pemesanan", "s7:saham", "s8:Dari"],
  // Unrevealed rows sit dim like a page still being inked, so a panel is never an empty box.
  fxExtra: `up:(e,t)=>{gsap.set(e,{opacity:.16});tl.fromTo(e,{opacity:.16,y:0},{opacity:1,duration:.25,ease:'none'},t);},fade:(e,t)=>{gsap.set(e,{opacity:.16});tl.fromTo(e,{opacity:.16},{opacity:1,duration:.25,ease:'none'},t);},`,
  // Plate slides up from the page.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:60,opacity:0},{y:0,opacity:1,duration:.4,ease:'power3.out'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:-40,opacity:0,duration:.2,ease:'power2.in'},b-.2)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0 0 0)'});tl.to('#outro',{clipPath:'inset(0% 0 0 0)',duration:.6,ease:'power3.inOut'},OUT-.25);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${S};font-weight:700;font-size:54px;line-height:1.2;color:${PAP};background:rgba(27,26,24,.9);padding:12px 18px 14px;box-sizing:border-box}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"#FFA46E"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${PAP}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:8,opacity:.2},{y:0,opacity:1,duration:.14,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Papan Atas", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
