// EP03 BERKAS KASUS. Noir case file on an investigator's desk, database cyan as the cold truth layer. Run from this folder: node build-video.mjs
import { copyFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NOIR = "#0B0B0D", MAN = "#D9C49A", RED = "#C1272D", INK = "#1A1A1A", CY = "#6FE3FF", LAMP = "#FFD38A";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tab">BERKAS KASUS &middot; EP 03</div>
  <div class="sheet"><div class="hl red flick">18 MARET</div>
  <div class="tw" data-at="s1:Siapa" data-fx="type">Siapa sebenarnya John Doe?</div></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tab">ARSIP AKUN</div>
  <div class="sheet"><div class="hl sm">Setiap akun punya nomor ID</div>
  <div class="row"><b class="chip" data-at="s2:satu" data-fx="drop">#1 Roblox</b><b class="chip" data-at="s2:dua" data-fx="drop">#2 John Doe</b><b class="chip" data-at="s2:tiga" data-fx="drop">#3 Jane Doe</b></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tab">KAMUS</div>
  <div class="sheet"><div class="hl sm" data-at="s3:samaran" data-fx="type">John Doe = nama samaran</div>
  <div class="tw" data-at="s3:Fulan" data-fx="type">mirip &ldquo;si Fulan&rdquo;</div>
  <div class="stamp" data-at="s3:contoh" data-fx="stamp">NAMA CONTOH</div></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tab cy">API PUBLIK ROBLOX</div>
  <div class="sheet db"><div class="mono" data-at="s4:Ketiga" data-fx="type">#1 #2 #3: detik yang sama</div>
  <div class="hl md nb" data-at="s4:Februari" data-fx="drop">27.02.2006</div>
  <div class="mono big nb" data-at="s4:UTC" data-fx="type">21:06:40 UTC</div>
  <div class="tw redt" data-at="s4:Tidak" data-fx="type">#4 dan #5: tidak ada</div></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tab">PEMBANDING</div>
  <div class="sheet"><div class="hl sm" data-at="s5:builderman" data-fx="type">builderman</div>
  <div class="tw" data-at="s5:David" data-fx="type">pendiri Roblox, David Baszucki</div>
  <div class="hl nb"><span class="dim">ID #</span><b class="ct" data-from="3" data-to="156" data-a="s5:seratus" data-d="2.2">3</b></div>
  <div class="tw" data-at="s5:delapan" data-fx="type">dibuat 08.03.2006</div></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tab">ASAL RUMOR</div>
  <div class="sheet"><div class="hl nb" data-at="s6:2017" data-fx="drop">&plusmn; 2017</div>
  <div class="tw" data-at="s6:YouTuber" data-fx="type">disebar beberapa YouTuber</div>
  <div class="glitch" data-at="s6:rumor" data-fx="drop">&ldquo;JOHN DOE HACK 18 MARET&rdquo;</div>
  <div class="tw" data-at="s6:TikTok" data-fx="type">diulang tiap tahun, sampai TikTok</div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tab">KESIMPULAN</div>
  <div class="sheet"><div class="stamp big" data-at="s7:bukti" data-fx="stamp">HOAKS</div>
  <div class="tw" data-at="s7:diblokir" data-fx="type">Status akun: tidak diblokir</div>
  <div class="hl sm redt" data-at="s7:penipuan" data-fx="drop">Minta password = PENIPUAN</div></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tab">KASUS DITUTUP</div>
  <div class="sheet"><div class="hl sm" data-at="s8:Jadi" data-fx="type">John Doe = akun #2</div>
  <div class="tw" data-at="s8:hacker" data-fx="type">Bukan hacker.</div>
  <div class="hl sm redt" data-at="s8:Kamu" data-fx="drop">Kamu pernah termakan rumor ini?</div></div>
</div>`;

const css = `
.p{right:96px}
.tab{display:inline-block;font-family:Oswald,sans-serif;font-weight:600;font-size:26px;letter-spacing:.14em;color:${INK};background:${MAN};padding:8px 22px 6px;border-radius:10px 10px 0 0;margin-left:22px}
.tab.cy{background:${CY}}
.sheet{background:${MAN};color:${INK};padding:22px 30px 24px;border-radius:4px 10px 10px 10px;box-shadow:0 18px 40px rgba(0,0,0,.6),0 2px 0 rgba(0,0,0,.4);background-image:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.06))}
.sheet.db{background:#0f1a1f;color:${CY};border:2px solid rgba(111,227,255,.55)}
.hl{font-family:Oswald,sans-serif;font-weight:700;font-size:104px;line-height:1.02;letter-spacing:.01em;margin:0 0 6px}
.hl.md{font-size:80px}
.hl.sm{font-size:58px;line-height:1.1}
.hl .dim{font-weight:500;font-size:60px;opacity:.6}
.red{color:${RED}}.redt{color:${RED}}
.db .redt{color:#ff6b6b}
.tw{font-family:"Special Elite",monospace;font-size:38px;line-height:1.25;margin:4px 0 6px}
.mono{font-family:"Special Elite",monospace;font-size:34px;line-height:1.25;margin:2px 0 8px}
.mono.big{font-size:52px;color:#fff}
.db .hl{color:#fff}
.row{display:block;margin-top:8px}
.chip{display:inline-block;font-family:Oswald,sans-serif;font-weight:600;font-size:40px;color:#fff;background:${INK};padding:6px 16px 8px;border-radius:6px;margin:6px 10px 4px 0}
.stamp{display:inline-block;font-family:Oswald,sans-serif;font-weight:700;font-size:52px;letter-spacing:.08em;color:${RED};border:6px solid ${RED};padding:2px 18px;border-radius:8px;margin-top:10px}
.stamp.big{font-size:118px;padding:0 30px;border-width:9px;letter-spacing:.1em}
.glitch{font-family:Oswald,sans-serif;font-weight:700;font-size:46px;color:#fff;background:${INK};padding:6px 14px;display:inline-block;margin:6px 0 8px;text-shadow:3px 0 0 ${RED},-3px 0 0 ${CY}}
.nb{font-variant-numeric:tabular-nums}
#chip{color:${MAN};font-family:"Special Elite",monospace;font-weight:400;font-size:22px;top:182px;opacity:.75}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
mkdirSync("PROJECT/HyperFrames_Remotion/compositions", { recursive: true });
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: "#0B0B0D", vig: 0.62, grain: 0.07, capfloor: 0.42, html, css, chipFont: "Special Elite,monospace", chipColor: MAN,
  extraAt: ["s1:John", "s2:Doe", "s2:Jane", "s3:John", "s3:Jane", "s4:API", "s4:dibuat", "s4:detik", "s4:sama", "s4:empat", "s4:lima", "s7:Kalau", "s7:password", "s8:Dia"],
  // A case sheet lands like paper dropped on the desk, then slides down off it.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{y:-120,rotation:-5,opacity:0},{y:0,rotation:-.7,opacity:1,duration:.46,ease:'back.out(1.25)'},a-.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{y:170,rotation:1.8,opacity:0,duration:.24,ease:'power2.in'},b-.24)`,
  fxExtra: `type:(e,t)=>{tl.set(e,{opacity:1},t);tl.fromTo(e,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:Math.min(.9,.04*e.textContent.length),ease:'steps('+Math.max(4,e.textContent.length)+')'},t);},
 drop:(e,t)=>tl.fromTo(e,{y:-36,rotation:-3,opacity:0},{y:0,rotation:0,opacity:1,duration:.3,ease:'back.out(1.6)'},t),`,
  // 18 MARET flickers like a bad screen.
  hud: `(()=>{const f=document.querySelector('.flick');return (t)=>{if(!f)return;const k=Math.floor(t*14);const h=((k*2654435761)>>>0)%100;f.style.opacity=t<1.2?Math.min(1,t/0.3):(h<12?.25:1);f.style.transform=h<6?'translateX(6px)':'none';};})()`,
  // The case closes: a manila folder slides down over the frame.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.5,ease:'power3.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Oswald,sans-serif;font-weight:600;font-size:64px;line-height:1.18;color:#fff;text-shadow:0 4px 0 #000,3px 3px 0 #000,-3px 3px 0 #000,3px -3px 0 #000,-3px -3px 0 #000,0 0 18px rgba(0,0,0,.8)}
.w{display:inline-block;padding:0 4px}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0,boxShadow:"inset 0 0px 0 ${RED}"},{color:"#ffd9d9",y:-5,boxShadow:"inset 0 -12px 0 ${RED}",duration:.07,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,boxShadow:"inset 0 0px 0 ${RED}",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:20,opacity:0,rotation:-1},{y:0,opacity:1,rotation:0,duration:.18,ease:"back.out(1.8)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Berkas Kasus John Doe", NOIR);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
