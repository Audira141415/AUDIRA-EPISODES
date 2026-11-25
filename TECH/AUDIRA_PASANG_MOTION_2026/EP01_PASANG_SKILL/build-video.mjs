// EP01 PASANG SKILL. Blueprint: navy paper, white draft line, lime for correct, orange for trap. Panels are engineering title blocks that draw in from a rule. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";
import { TY } from "../_tools/fx.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const LIME = "#A3E635", ORG = "#FF6A3D", W = "#EAF5FF", NAVY = "#0D2A4A";
const D = "'Barlow Condensed',sans-serif", M = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="k">LEMBAR 01 / PASANG SKILL</div>
  <div class="term"><span class="ty" data-t="s1:Satu" data-c="30">/audira-motion cara kerja kotak musik</span></div>
  <div class="h" data-at="s1:jadi" data-fx="up">1 KALIMAT,<br><em>FILM 3D</em></div>
  <div class="n" data-at="s1:folder" data-fx="up">Syaratnya: satu folder di tempat yang benar.</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="k">ISI SKILL</div>
  <div class="r" data-at="s2:arahan"><code>SKILL.md</code><span>arahan sutradara</span></div>
  <div class="r" data-at="s2:mesin"><code>kits/</code><span>mesin gaya</span></div>
  <div class="r" data-at="s2:kerangka"><code>starter/</code><span>kerangka proyek</span></div>
  <div class="warn" data-at="s2:Harus" data-fx="up">Wajib Claude Code. Chat di browser tidak bisa merender.</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="k">LANGKAH 1 / SIAPKAN</div>
  <div class="r" data-at="s3:Akses"><code>Claude Code</code><span>paket berbayar / API</span></div>
  <div class="r" data-at="s3:Node.js"><code>Node.js</code><span>22.13 ke atas</span></div>
  <div class="term" data-at="s3:ffmpeg"><i>PowerShell</i><span class="ty" data-t="s3:winget" data-c="28">winget install ffmpeg</span></div>
  <div class="n" data-at="s3:Tutup" data-fx="up">macOS: <code>brew install ffmpeg</code></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="k">LANGKAH 2 / SALIN FOLDER</div>
  <div class="term big"><i>Windows</i><span class="ty" data-t="s4:Salin" data-c="30">C:\\Users\\&lt;nama&gt;\\.claude\\skills\\audira-motion\\</span></div>
  <div class="term big" data-at="s4:Salin"><i>macOS</i>~/.claude/skills/audira-motion/</div>
  <div class="n" data-at="s4:Kalau" data-fx="up">Folder belum ada? Buat sendiri.</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="k or">JEBAKAN</div>
  <div class="term bad" data-at="s5:membuat"><i>SALAH</i>...\\audira-motion\\<b>Audira_Skill_Motion</b>\\SKILL.md</div>
  <div class="term good" data-at="s5:pastikan"><i>BENAR</i>...\\audira-motion\\SKILL.md</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="k">LANGKAH 3 / CEK</div>
  <div class="term big"><i>Claude Code, sesudah dibuka ulang</i><span class="ty" data-t="s6:Ketik" data-c="24">/audira-motion</span></div>
  <div class="r" data-at="s6:Muncul"><code class="ok">Muncul</code><span>skill terpasang</span></div>
  <div class="r" data-at="s6:Tidak"><code class="no">Tidak</code><span>cek letak SKILL.md</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="k">FILM PERTAMA</div>
  <div class="st"><div data-at="s7:mengunduh"><b>&plusmn;540</b>MB unduhan</div><div data-at="s7:Panduannya"><b>2&ndash;10</b>menit, kata panduan</div></div>
  <div class="smoke" data-at="s7:tes" data-fx="fade"><img src="assets/img/smoke.jpg" alt=""><span>Tes render asli dari instalasi bersih</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="k">LEMBAR 01 SELESAI</div>
  <div class="h sm"><em>SKILL</em> MASUK.</div>
  <div class="n" data-at="s8:episode" data-fx="up">Berikutnya, EP 2: sambungkan mesh.</div>
</div>`;

const css = `
#chip{color:${LIME};font-size:24px;letter-spacing:.14em}
.k{display:inline-block;font-family:${M};font-weight:700;font-size:28px;color:${NAVY};background:${LIME};padding:7px 14px;margin-bottom:18px}.k.or{background:${ORG};color:#fff}
.h{font-family:${D};font-weight:800;font-size:138px;line-height:.92;color:#fff;letter-spacing:-.005em}.h em{font-style:normal;color:${LIME}}.h.sm{font-size:120px}
.n{font-family:${D};font-weight:600;font-size:48px;line-height:1.14;color:${W};margin-top:18px}.n code{font-family:${M};font-size:37px;color:${LIME}}
.r{display:flex;justify-content:space-between;align-items:center;gap:20px;border-top:2px solid rgba(207,232,255,.45);padding:15px 2px}.r:last-of-type{border-bottom:2px solid rgba(207,232,255,.45)}
.r code{font-family:${M};font-weight:700;font-size:39px;color:#fff;flex:none}.r code.ok{color:${LIME}}.r code.no{color:${ORG}}.r span{font-family:${D};font-weight:600;font-size:43px;color:${W};text-align:right}
.term{background:#06182d;border:2px solid rgba(207,232,255,.6);padding:18px 20px;margin-top:16px;font-family:${M};font-weight:600;font-size:36px;line-height:1.3;color:${LIME};overflow-wrap:anywhere;min-height:47px}
.term i{display:block;font-style:normal;font-family:${D};font-weight:700;font-size:29px;letter-spacing:.05em;color:#9cc4e4;margin-bottom:8px}
.term.big{font-size:35px}.term.bad{border-color:${ORG};color:#ffd8ca}.term.bad i{color:${ORG}}.term.bad b{color:${ORG};font-weight:800}.term.good{border-color:${LIME}}.term.good i{color:${LIME}}
.warn{margin-top:20px;background:${ORG};color:#fff;font-family:${D};font-weight:700;font-size:44px;line-height:1.1;padding:14px 18px}
.st{display:flex;gap:18px}.st div{flex:1;border:2px solid rgba(207,232,255,.6);background:rgba(6,24,45,.82);padding:12px 16px;font-family:${D};font-weight:600;font-size:34px;color:${W}}.st b{display:block;font-weight:800;font-size:82px;line-height:1;color:${LIME}}
.smoke{margin-top:14px;background:#06182d;border:2px solid rgba(207,232,255,.6)}.smoke img{width:100%;display:block}.smoke span{display:block;font-family:${D};font-weight:600;font-size:31px;color:${W};padding:7px 14px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "1", series: "PASANG AUDIRA &middot; EP 1 DARI 3", bg: NAVY, vig: .42, grain: .035, capfloor: .3, html, css, chipFont: M, chipColor: LIME, chip: "AUDIRA MOTION &middot; EP 1/3",
  extraAt: ["s2:Isinya", "s2:Sekali", "s4:ekstrak", "s4:folder", "s4:titik", "s4:skills", "s4:audira-motion", "s5:Kalau", "s5:membuat", "s5:menemukannya", "s5:pastikan", "s5:terlihat", "s7:minta", "s7:mengunduh", "s7:Panduannya", "s7:tes", "s8:kita", "s8:skill", "s6:Ketik", "s6:Muncul"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0 0 100% 0)',opacity:1},{clipPath:'inset(0 -2% -4% -2%)',duration:.3,ease:'power3.out'},a-.08);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(100% -2% -4% -2%)',duration:.18,ease:'power3.in'},b-.18)`,
  hud: TY,
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0 0 0)'});tl.to('#outro',{clipPath:'inset(0% 0 0 0)',duration:.4,ease:'power3.inOut'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;line-height:1.22;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:62px;color:#fff;text-shadow:0 3px 0 rgba(6,24,45,.9),0 0 18px rgba(6,24,45,.9)}
.w{display:inline-block;padding:0 3px}`,
(id, w) => `tl.set("#${id}",{color:"${LIME}"},${w.start.toFixed(3)});tl.fromTo("#${id}",{y:0},{y:-7,duration:.09,yoyo:true,repeat:1},${w.start.toFixed(3)});tl.set("#${id}",{color:"#fff"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.08,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pasang Skill", NAVY);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
