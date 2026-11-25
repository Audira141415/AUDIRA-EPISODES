// EP03 JADI STUDIO. Daylight paper studio: cream, ink, record orange, a serif that reads like a call sheet. Panels are paper cards that drop with a soft tilt. Real audira-motion clips play as mounted prints. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";
import { TY } from "../_tools/fx.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1C1A17", ORG = "#FF6A3D", CREAM = "#F0E6D2", PAPER = "#FFFAF0", FOREST = "#0B3D2E", TOSCA = "#00B894";
const D = "'Fraunces',serif", M = "'DM Mono',monospace";
const sc = (id) => TL.scenes.find((s) => s.id === id);

// A mounted clip: DOM video with the timing HyperFrames needs. Showcase films end on a logo card, so each segment stops at 7 s and repeats.
const SEG = 7;
let vid = 0;
function seg(src, start, dur, x, y, w, rot) {
  const h = Math.round(w * 16 / 9), id = `v${vid++}`;
  return `<video id="${id}" class="clip" muted playsinline data-start="${start.toFixed(2)}" data-duration="${dur.toFixed(2)}" data-track-index="${5 + vid}" src="assets/video/${src}.mp4" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:12;object-fit:cover;outline:7px solid ${PAPER};box-shadow:0 18px 34px rgba(50,35,15,.34);transform:rotate(${rot}deg)"></video>`;
}
function clip(src, start, dur, x, y, w, rot = 0) {
  let out = "", t = start, left = dur;
  while (left > .05) { const d = Math.min(SEG, left); out += seg(src, t, d, x, y, w, rot); t += d; left -= d; }
  return out;
}
const s1 = sc("s1"), s3 = sc("s3"), s5 = sc("s5"), s6 = sc("s6"), s8 = sc("s8");
const hook = [["01-pixelstory", 56, 330, 300, -2.5], ["27-retrowave", 390, 310, 300, 1.8], ["11-clayworld", 724, 350, 300, -1.6]];
const nama = at("s3:Nama"), tonton = at("s5:tonton");
const clips = [
  ...hook.map(([c, x, y, w, r]) => clip(c, 0, s1.end - .02, x, y, w, r)),
  clip("05-innerworks", at("s3:cara"), nama - at("s3:cara") - .05, 610, 600, 370, 1.5),
  clip("09-cyberforge", nama, Math.min(3, s3.end - nama - .1) , 610, 600, 370, 1.5),
  clip("27-retrowave", nama + 3, Math.max(.1, s3.end - nama - 3.15), 610, 600, 370, 1.5),
  clip("05-innerworks", tonton, s5.end - tonton - .05, 380, 620, 320, 0),
  clip("05-innerworks", s6.start, s6.end - s6.start - .05, 250, 330, 540, 0),
  clip("04-paperworld", s8.start, 3.2, 56, 400, 300, -2),
  clip("09-cyberforge", s8.start + .35, 3, 390, 340, 300, 1.5),
  clip("18-circuitforge", s8.start + .7, 2.7, 724, 400, 300, -1.2),
];

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card ty1"><span class="ty" data-t="s1:Cara" data-c="32">/audira-motion ...</span></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="k">TIGA PEMAIN</div>
  <div class="r" data-at="s2:Claude"><b>Claude Code</b><span>yang mengerjakan</span></div>
  <div class="r" data-at="s2:audira-motion"><b class="or">audira-motion</b><span>menyutradarai 3D</span></div>
  <div class="r" data-at="s2:Mesh"><b class="to">mesh</b><span>alat + suara</span></div>
  <div class="h" data-at="s2:produsernya" data-fx="pop">Kamu: <em>produser.</em></div>
</div>
<div class="p w60" data-in="s3" data-out="s4">
  <div class="k">1. CERITAKAN</div>
  <div class="term"><span class="ty" data-t="s3:Ketik" data-c="34">/audira-motion cara kerja kotak musik, casing terbuka, pin memetik sisir baja</span></div>
  <div class="n" data-at="s3:Nama" data-fx="up">Tak perlu hafal gaya. Ada 29.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="k">2. SUARA</div>
  <div class="r" data-at="s4:Sudah"><b>Punya rekaman</b><span>kirim file-nya</span></div>
  <div class="term" data-at="s4:Belum"><i>Belum punya, minta ke Claude</i><span class="ty" data-t="s4:Minta" data-c="30">Buat suara dari naskah ini dengan audira_generate_voiceover</span></div>
  <div class="n" data-at="s4:Ini" data-fx="up">Hasil: file suara + waktu tiap kata. Butuh kunci Cartesia.</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="k">3. PREVIEW 540&times;960</div>
  <div class="bub" data-at="s5:kameranya" data-fx="up">"Kameranya perlambat di detik 5."</div>
  <div class="bub" data-at="s5:Warnanya" data-fx="up">"Warnanya lebih cerah."</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="k or">4. FINAL 1080&times;1920, 60 FPS</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="k">DI LUAR 3D</div>
  <div class="n big" data-at="s7:khusus" data-fx="up">audira-motion khusus film 3D.</div>
  <div class="term" data-at="s7:Minta"><i>Explainer datar, teks bergerak</i><span class="ty" data-t="s7:Minta" data-c="28">Pakai audira_auto_orchestrate untuk tugas ini</span></div>
  <div class="n" data-at="s7:HyperFrames" data-fx="up">Lalu minta Claude memuat skill <b>hyperframes</b>.</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h" data-at="s8:giliranmu" data-fx="pop"><em>Giliranmu.</em></div>
</div>
${clips.join("\n")}
`;

const css = `
#chip{color:${INK};font-size:24px;letter-spacing:.06em;opacity:.8}
.p.w60{right:110px}
.k{display:inline-block;font-family:${M};font-weight:500;font-size:29px;background:${INK};color:${PAPER};padding:7px 14px;margin-bottom:14px}.k.or{background:${ORG};color:#fff}
.card{background:${PAPER};box-shadow:0 8px 20px rgba(50,35,15,.2);padding:14px 20px;font-family:${M};font-weight:500;font-size:38px;color:${INK}}
.h{font-family:${D};font-weight:700;font-size:92px;line-height:1.05;letter-spacing:-.02em;color:${INK};margin-top:14px}.h em{font-style:italic;color:${ORG}}
.r{display:flex;justify-content:space-between;align-items:baseline;gap:18px;background:${PAPER};padding:13px 18px;margin-bottom:8px;box-shadow:0 5px 14px rgba(50,35,15,.14)}
.r b{font-family:${M};font-weight:500;font-size:37px;color:${FOREST};flex:none}.r b.or{color:#D9481F}.r b.to{color:#008a6e}.r span{font-family:${D};font-weight:500;font-size:40px;color:${INK};text-align:right}
.term{background:${INK};padding:16px 20px;margin-top:10px;font-family:${M};font-size:36px;line-height:1.3;color:#FDE9C8;overflow-wrap:anywhere;box-shadow:0 8px 20px rgba(50,35,15,.25)}
.term i{display:block;font-style:normal;font-family:${D};font-weight:500;font-size:30px;color:#FF9D7C;margin-bottom:8px}
.n{font-family:${D};font-weight:600;font-size:43px;line-height:1.14;color:${INK};background:rgba(255,250,240,.9);padding:10px 16px;margin-top:10px}.n b{font-family:${M};font-weight:500;font-size:37px;color:#D9481F}.n.big{font-size:52px}
.bub{display:block;font-family:${D};font-style:italic;font-weight:600;font-size:45px;line-height:1.1;color:${INK};background:${PAPER};padding:11px 17px;margin-bottom:8px;box-shadow:0 5px 14px rgba(50,35,15,.14)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "3", series: "PASANG AUDIRA &middot; EP 3 DARI 3", bg: CREAM, vig: .16, grain: .04, capfloor: 0, html, css, chipFont: M, chipColor: INK, chip: "AUDIRA MOTION &middot; EP 3/3",
  extraAt: ["s2:Claude", "s2:audira-motion", "s2:Mesh", "s4:Mesh", "s3:Ketik"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:-46,rotation:-1.6},{opacity:1,y:0,rotation:0,duration:.42,ease:'back.out(1.5)'},a-.08);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:36,rotation:1.2,duration:.2,ease:'power2.in'},b-.2)`,
  hud: TY,
  outroIn: `gsap.set('#outro',{opacity:0,y:50});tl.to('#outro',{opacity:1,y:0,duration:.4,ease:'power3.out'},OUT-.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;line-height:1.28;font-family:'Fraunces',serif;font-weight:700;font-size:52px;color:${INK}}
.w{display:inline-block;background:${PAPER};padding:1px 9px;margin:0 -1px}`,
(id, w) => `tl.set("#${id}",{backgroundColor:"${ORG}",color:"#fff"},${w.start.toFixed(3)});tl.set("#${id}",{backgroundColor:"${PAPER}",color:"${INK}"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:10},{opacity:1,y:0,duration:.1,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Jadi Studio", CREAM);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
