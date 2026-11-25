// EP04 PAPAN SIRKUIT. Dark circuit board, amber copper, score readouts like instrument panels. Panels boot in by scan line. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFA726", GRN = "#39FF9C", RED = "#FF3B47", TXT = "#FFEFD2", BG = "#04100C";
const C = '"Chakra Petch",sans-serif', M = '"IBM Plex Mono",monospace';
const score = (lab, val, cls, a) => `<div class="sc" data-at="${a}" data-fx="left"><span>${lab}</span><b class="${cls}"><i class="ct" data-from="0" data-to="${val}" data-a="${a}" data-d="0.7"></i></b></div>`;

const html = `
<div id="scrim"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tp">AI BIKIN GAME / EP 04</div>
  <div class="two"><div><span>TES LOLOS</span><b class="g nb">9/9</b></div><div data-at="s1:desainnya" data-fx="pop"><span>DESAIN</span><b class="r nb">31</b></div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tp">SKYFORGE ASCENT / CONTOH RESMI ROBLOX</div>
  <div class="hd">1 PERINTAH,<br><em>SATU TIM KECIL</em></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tp">01 RENCANA</div>
  ${score("SPESIFIKASI", 91, "a", "s3:Skornya")}
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tp">02 BANGUN</div>
  ${score("TEKNIK", 98, "a", "s4:Penilai")}
  <div class="nt" data-at="s4:Satu-satunya" data-fx="up">Temuan: 2 fungsi tidak terpakai</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tp">03 TES, INPUT SEPERTI PEMAIN</div>
  ${score("PLAYTEST", 100, "g", "s5:Nol")}
  ${score("VISUAL", 86, "a", "s5:Tampilannya")}
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tp">DATA ROBLOX / 1 LED = 1 KREATOR TERATAS</div>
  ${score("PAKAI AI, APR 2026 (%)", 44, "a", "s6:44")}
  <div class="nt" data-at="s6:MCP" data-fx="up">Pengguna harian server MCP: hampir 5x</div>
  <div class="nt" data-at="s6:Waktu" data-fx="up">Waktu pakai AI kreator top: 3x</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tp">KENAPA CUMA 31</div>
  ${score("DESAIN", 31, "r", "s7:Lalu")}
  <div class="nt r" data-at="s7:nol" data-fx="up">Progres, main ulang, pilihan, daya tarik: 0</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tp">SOKET YANG MASIH KOSONG</div>
  <div class="hd"><em>SERU?</em><br>BELUM TENTU.</div>
  <div class="nt" data-at="s8:tugas" data-fx="up">Apa tugas developer ke depan?</div>
</div>`;

const css = `
#scrim{position:absolute;left:0;right:0;top:0;height:660px;background:linear-gradient(180deg,rgba(4,16,12,.92),rgba(4,16,12,.72) 66%,rgba(4,16,12,0));z-index:9;pointer-events:none}
.tp{font-family:${M};font-weight:600;font-size:26px;color:${AMB};margin-bottom:16px}
.hd{font-family:${C};font-weight:700;font-size:92px;line-height:1.02;color:${TXT};letter-spacing:-.01em}.hd em{font-style:normal;color:${AMB}}
.two{display:flex;gap:16px}.two>div{flex:1;border:2px solid ${AMB};background:rgba(4,16,12,.7);padding:12px 18px}.two span{display:block;font-family:${M};font-weight:600;font-size:28px;color:${TXT}}
.two b{display:block;font-family:${C};font-weight:700;font-size:150px;line-height:1}.g{color:${GRN}}.r{color:${RED}}.a{color:${AMB}}
.sc{display:flex;align-items:baseline;justify-content:space-between;gap:14px;border-bottom:2px solid rgba(255,167,38,.55);padding:2px 0 6px;margin-bottom:10px}.sc span{font-family:${M};font-weight:600;font-size:30px;color:${TXT};line-height:1.15}.sc b{font-family:${C};font-weight:700;font-size:112px;line-height:1;font-variant-numeric:tabular-nums}.sc i{font-style:normal}
.nt{font-family:${C};font-weight:600;font-size:36px;line-height:1.16;color:${TXT};margin-top:10px}.nt.r{color:#FF8A91}
.nb{font-variant-numeric:tabular-nums}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.5, grain: 0.05, capfloor: 0.62, html, css, chipFont: M, chipColor: TXT,
  extraAt: ["s1:desainnya", "s3:spesifikasi", "s4:Kode", "s5:Melompat", "s5:rintangan", "s5:jatuh", "s5:bangkit", "s5:Nol", "s7:progres", "s6:44", "s8:tugas"],
  // CRT-style boot: panel opens vertically from a bright line.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{scaleY:.02,opacity:1},{scaleY:1,duration:.2,ease:'power3.out'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{scaleY:.02,opacity:0,duration:.1,ease:'power2.in'},b-.1)`,
  outroIn: `gsap.set('#outro',{scaleY:.01,opacity:0,transformOrigin:'50% 50%'});tl.set('#outro',{opacity:1},OUT-.05);tl.to('#outro',{scaleY:1,duration:.32,ease:'power4.out'},OUT-.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:54px;right:104px;top:1310px;height:230px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${C};font-weight:700;font-size:62px;line-height:1.12;color:${TXT};text-shadow:0 2px 10px #000}
.w{display:inline-block}`,
(id, w) => `tl.set("#${id}",{color:"${GRN}"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${TXT}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:.25},{opacity:1,duration:.08,ease:"steps(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Papan Sirkuit", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
