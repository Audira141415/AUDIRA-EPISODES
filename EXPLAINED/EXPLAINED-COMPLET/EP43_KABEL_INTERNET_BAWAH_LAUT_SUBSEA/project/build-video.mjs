// EP43 SUBSEA CABLE (ABYSSFORGE). Panels are dark sonar-glass readouts: ink glass card, thin cyan hairline, mono tag with a
// pulsing sonar dot, display type in Sora; they surface from below like something rising out of the deep (blur + lift)
// and sink back on exit. Run from project/: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#05162A", CY = "#5CF2FF", MG = "#FF4FD8", AM = "#FFB547", WH = "#E8FBFF";
const TT = "Sora,sans-serif", MN = "'JetBrains Mono',monospace";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA KERJA BENDA &middot; EP 43</div>
  <div class="card"><div class="big">Internetmu lewat<br><span>dasar laut</span></div></div>
  <div class="ln m" data-at="s1:satelit" data-fx="lit">Bukan lewat satelit</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>TELEGEOGRAPHY</div>
  <div class="ln" data-at="s2:enam" data-fx="lit">600+ kabel aktif &amp; direncanakan</div>
  <div class="ln" data-at="s2:kilometer" data-fx="lit">Total lebih dari 1,5 juta km</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>UKURAN KABEL</div>
  <div class="ln" data-at="s3:selang" data-fx="lit">Laut dalam: sebesar selang taman</div>
  <div class="ln a" data-at="s3:baja" data-fx="lit">Dekat pantai: lapisan baja, dikubur</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>INTI KABEL</div>
  <div class="ln" data-at="s4:serat" data-fx="lit">Serat kaca setipis rambut</div>
  <div class="ln m" data-at="s4:kedipan" data-fx="lit">Data jadi kedipan cahaya laser</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>MASALAHNYA</div>
  <div class="card" data-at="s5:redup" data-fx="lit"><div class="big sm">Cahaya <span class="d">makin redup</span></div></div>
  <div class="ln" data-at="s5:repeater" data-fx="lit">Penguat: repeater</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>DI DALAM REPEATER</div>
  <div class="ln m" data-at="s6:erbium" data-fx="lit">Serat dicampur unsur erbium</div>
  <div class="ln a" data-at="s6:energi" data-fx="lit">Laser kecil memberi energi</div>
  <div class="ln" data-at="s6:stasiun" data-fx="lit">Listrik dari stasiun di darat</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>PENYEBAB RUSAK</div>
  <div class="card" data-at="s7:setahun" data-fx="lit"><div class="big sm">&plusmn;200<span class="a">&times; setahun</span></div></div>
  <div class="ln a" data-at="s7:hiu" data-fx="stamp">Bukan hiu</div>
  <div class="ln pie" data-at="s7:pertiga" data-fx="lit"><b></b>2/3: kapal ikan &amp; jangkar</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:cahaya" data-fx="lit"><div class="big sm">Cahaya <span>menyeberangi samudra</span></div></div>
  <div class="ln" data-at="s8:Episode" data-fx="lit">Berikutnya: lensa Fresnel mercusuar</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:700;font-size:27px;letter-spacing:.14em;color:${CY};background:rgba(5,22,42,.78);border:2px solid rgba(92,242,255,.45);padding:9px 18px 8px;margin-bottom:16px;border-radius:4px}
.tag i{display:inline-block;width:14px;height:14px;border-radius:50%;background:${CY};margin-right:12px;box-shadow:0 0 14px ${CY},0 0 0 6px rgba(92,242,255,.18);vertical-align:1px}
.card{display:table;background:linear-gradient(160deg,rgba(9,40,64,.9),rgba(5,22,42,.92));border:2px solid rgba(92,242,255,.4);border-radius:14px;padding:16px 30px 22px;margin-bottom:16px;box-shadow:0 0 40px rgba(92,242,255,.18),0 24px 50px rgba(0,0,0,.55)}
.big{font-family:${TT};font-weight:800;font-size:92px;line-height:1.02;color:${WH};letter-spacing:-.015em}
.big span{color:${CY};text-shadow:0 0 26px rgba(92,242,255,.55)}.big span.d{color:#7FA8BC;text-shadow:none}.big span.a{color:${AM};text-shadow:0 0 22px rgba(255,181,71,.5);font-size:.7em}
.big.sm{font-size:70px;line-height:1.06}
.ln{display:table;font-family:${TT};font-weight:700;font-size:40px;line-height:1.2;color:${WH};background:rgba(5,22,42,.86);padding:11px 24px 13px 22px;margin-bottom:12px;border-left:8px solid ${CY};border-radius:0 10px 10px 0;box-shadow:0 12px 30px rgba(0,0,0,.45);max-width:880px}
.ln.m{border-left-color:${MG}}.ln.a{border-left-color:${AM}}
.ln.pie b{display:inline-block;width:44px;height:44px;border-radius:50%;background:conic-gradient(${AM} 0 240deg,rgba(232,251,255,.25) 240deg 360deg);vertical-align:-9px;margin-right:16px}
#chip{font-family:${MN};font-size:24px;font-weight:700;color:${CY};opacity:.7;letter-spacing:.06em}`;

// Every anchor used by world3d.js or mix.py is registered here automatically, so no frame silently repeats.
const used = (f, re) => [...readFileSync(f, "utf8").matchAll(re)].map((m) => m[1]);
const ANCHOR = /["'](s\d:[^"'\s]+)["']/g;
const extraAt = [...new Set([...used("world3d.js", ANCHOR), ...used("mix.py", ANCHOR)])];

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "43", bg: "#05162A", vig: 0.5, grain: 0.06, capfloor: 0.35, html, css, chipFont: MN, chipColor: CY, sig: "EP43_KABEL_INTERNET_BAWAH_LAUT_SUBSEA",
  extraAt,
  // panels rise out of the deep: blurred and low, then sharp; they sink on exit
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:60,filter:'blur(10px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.55,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:40,filter:'blur(8px)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.45,x:-8},{opacity:1,x:0,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,y:40});tl.to('#outro',{opacity:1,y:0,duration:.45,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:60px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:Sora,sans-serif;font-weight:800;font-size:56px;line-height:1.16;color:${WH};text-transform:uppercase;letter-spacing:.01em;background:rgba(5,22,42,.88);border:2px solid rgba(92,242,255,.35);padding:10px 24px 14px;border-radius:14px;box-shadow:0 0 30px rgba(92,242,255,.15)}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WH}",scale:1},{color:"${CY}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WH}",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14,opacity:.6},{y:0,opacity:1,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kabel Internet Bawah Laut", "#05162A");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
