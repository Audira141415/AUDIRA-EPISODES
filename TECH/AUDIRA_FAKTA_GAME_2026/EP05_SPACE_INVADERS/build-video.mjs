// EP05 DALAM MESIN 1978. Exploded arcade cabinet + workbench PCB, black-and-white CRT, CRT power-on panels.
// The alien game is simulated here once (kills, formation steps, music beats) and handed to world3d.js, the HUD and mix.py through K.
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld, sceneKeys } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const K0 = sceneKeys(TL);
const BLK = "#050505", WHT = "#F2F2F2", PCB = "#0F5132", CU = "#C77B30", SIG = "#39FF14", AMB = "#FFB020";
const D = '"Chakra Petch",sans-serif', MO = '"Share Tech Mono",monospace';

// ---------- game simulation (pure data, deterministic) ----------
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = mulberry(1978);
const COLS = 11, ROWS = 5, DX = 16, DY = 16, W = 224, X0 = 24, Y0 = 44;
const lin = (a, b, n) => Array.from({ length: n }, (_, i) => +(a + ((b - a) * i) / (n - 1)).toFixed(3));
const ALL = Array.from({ length: COLS * ROWS }, (_, i) => i);
const r3 = (x) => +x.toFixed(3);
const pauses = [[K0.s5, K0.s6]];
const tWave = r3(at("s6:ditembak") + 1.9);
const hitT = r3(at("s6:ditembak") + 0.12);
// Hook wave starts already thinned out to 30 aliens (no number on screen), 29 shots leave one alien zipping.
const holes = ALL.slice(); for (let i = holes.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [holes[i], holes[j]] = [holes[j], holes[i]]; }
const segDefs = [
  { t0: 0, tEnd: 5.65, alive0: holes.slice(0, 30).sort((a, b) => a - b), killT: lin(0.35, 4.25, 29), misses: [] },
  { t0: 5.65, tEnd: K0.s4, alive0: ALL, killT: [], misses: [] },
  { t0: K0.s4, tEnd: tWave, alive0: ALL, killT: [...lin(at("s4:Prosesor") + 0.2, at("s4:Musiknya") - 0.3, 54), hitT], misses: [r3(at("s6:terakhir") + 0.1), r3(at("s6:paling#2"))] },
  { t0: tWave, tEnd: TL.duration + 1, alive0: ALL, killT: [], misses: [] },
];
const pauseShift = (t0, t1) => { for (const [a, b] of pauses) if (t0 < a && t1 > a) return t1 + (b - a); return t1; };
const segs = segDefs.map((sd) => {
  const alive = new Set(sd.alive0);
  let X = X0, Y = Y0, dir = 1, f = 0, ki = 0;
  const steps = [], kills = [];
  let next = pauseShift(sd.t0, sd.t0 + alive.size / 60);
  for (;;) {
    const tk = ki < sd.killT.length ? sd.killT[ki] : Infinity;
    if (Math.min(next, tk) >= sd.tEnd) break;
    if (tk <= next) {
      const cols = [...new Set([...alive].map((i) => i % COLS))];
      const c = cols[Math.floor(R() * cols.length)];
      const idx = Math.max(...[...alive].filter((i) => i % COLS === c));
      kills.push([tk, idx, X + c * DX, Y + Math.floor(idx / COLS) * DY]);
      alive.delete(idx); ki++;
      if (!alive.size) next = Infinity;
      continue;
    }
    const t = next;
    const cs = [...alive].map((i) => i % COLS), rs = [...alive].map((i) => Math.floor(i / COLS));
    const minC = Math.min(...cs), maxC = Math.max(...cs), maxR = Math.max(...rs);
    if ((dir > 0 && X + maxC * DX + 12 + 2 > W - 6) || (dir < 0 && X + minC * DX - 2 < 6)) { if (Y + maxR * DY + 8 + 8 <= 196) Y += 8; dir = -dir; }
    else X += 2 * dir;
    f ^= 1;
    steps.push([r3(t), X, Y, f]);
    next = pauseShift(t, t + alive.size / 60);
  }
  return { t0: sd.t0, tEnd: sd.tEnd, alive0: sd.alive0, kills, steps, misses: sd.misses };
});
// Music pulse: one beat per period; the period follows the alien count (55 alive = 1.0 s, 1 alive = 0.13 s).
const aliveN = (sg, t) => sg.alive0.length - sg.kills.filter((k) => k[0] <= t).length;
const beats = [];
for (const sg of segs) {
  let t = sg.t0;
  while (t < Math.min(sg.tEnd, TL.duration)) {
    const p = pauses.find(([a, b]) => t >= a && t < b); if (p) { t = p[1]; continue; }
    const n = aliveN(sg, t); if (n <= 0) { t += 0.25; continue; }
    beats.push(r3(t)); t += 0.13 + (0.87 * (n - 1)) / 54;
  }
}
const SIM = { segs, pauses };

// ---------- curve for the difficulty graph: speed = 1/n as aliens fall from 55 to 1 ----------
const GW = 560, GH = 150;
const curve = Array.from({ length: 55 }, (_, i) => { const n = 55 - i; const x = ((55 - n) / 54) * GW, y = GH - GH * ((1 / n - 1 / 55) / (1 - 1 / 55)); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");

const dots = ALL.map((i) => `<i id="d${i}"></i>`).join("");
const ticks = Array.from({ length: 128 }, () => "<i></i>").join("");

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2"><div class="scr">
  <div class="tag">FAKTA GAME / EP 05 &middot; DALAM MESIN 1978</div>
  <div class="big">ALIEN MAKIN<br><span>CEPAT</span></div>
  <div class="chip am" data-at="s1:bukan" data-fx="stamp">BUKAN RANCANGAN AWAL</div>
  <div class="mono" data-at="s1:prosesor">&gt; PROSESOR KEWALAHAN<em>_</em></div>
</div></div>
<div class="p" data-in="s2" data-out="s2:Inspirasinya"><div class="scr">
  <div class="tag">ASAL-USUL</div>
  <div class="chip">SPACE INVADERS &middot; 1978 &middot; TAITO</div>
  <div class="h" data-at="s2:Tomohiro">Tomohiro Nishikado</div>
  <div class="mono" data-at="s2:sendiri">&gt; KERJA SENDIRI, SETAHUN</div>
  <div class="mono" data-at="s2:merancang">&gt; HARDWARE DIRANCANG SENDIRI</div>
  <div class="chip g" data-at="s2:Intel" data-fx="pop">CPU: INTEL 8080</div>
</div></div>
<div class="p" data-in="s2:Inspirasinya" data-out="s3"><div class="scr">
  <div class="tag">INSPIRASINYA</div>
  <div class="chip" data-at="s2:Breakout" data-fx="pop">GAME BREAKOUT &middot; ATARI</div>
  <div class="chip" data-at="s2:War" data-fx="pop">NOVEL THE WAR OF THE WORLDS</div>
</div></div>
<div class="p" data-in="s3" data-out="s3:Layarnya"><div class="scr">
  <div class="tag">MAUNYA NISHIKADO</div>
  <div class="h" data-at="s3:berwarna">&#9656; Grafis berwarna</div>
  <div class="h" data-at="s3:lebih">&#9656; Alien lebih cepat</div>
  <div class="chip am" data-at="s3:tidak" data-fx="stamp">PAPAN KENDALI TIDAK CUKUP KUAT</div>
</div></div>
<div class="p" data-in="s3:Layarnya" data-out="s4"><div class="scr">
  <div class="tag">KENYATAANNYA</div>
  <div class="h">Layar hitam putih</div>
  <div class="mono" data-at="s3:penuh">&gt; LAYAR PENUH = ALIEN PELAN</div>
</div></div>
<div class="p" data-in="s4" data-out="s5"><div class="scr hud">
  <div class="tag">TEMUANNYA &middot; MAKIN SEDIKIT ALIEN, MAKIN CEPAT</div>
  <div class="hr" data-at="s4:Prosesor" data-fx="fade"><span class="lb">ALIEN TERSISA</span><div id="dots">${dots}</div></div>
  <div class="hr" data-at="s4:menggambar" data-fx="fade"><span class="lb">WAKTU GAMBAR<br>PER FRAME</span><div class="bar"><i id="bFt"></i></div></div>
  <div class="hr" data-at="s4:posisi" data-fx="fade"><span class="lb">LANGKAH<br>ALIEN</span><div id="tape">${ticks}</div></div>
  <div class="hr" data-at="s4:Musiknya" data-fx="fade"><span class="lb">TEMPO MUSIK</span><div id="beats"><b></b><b></b><b></b><b></b></div></div>
</div></div>
<div class="p" data-in="s5" data-out="s6"><div class="scr">
  <div class="tag">PILIHANNYA</div>
  <div class="h" data-at="s5:menambalnya">Ditambal supaya kecepatannya stabil?</div>
  <div class="big2 am" data-at="s5:tidak" data-fx="pop">TIDAK.</div>
  <div class="chip g st" data-at="s5:mekanik" data-fx="stamp">JADI MEKANIK GAME</div>
</div></div>
<div class="p" data-in="s6" data-out="s6:Belakangan"><div class="scr">
  <div class="tag">HASILNYA</div>
  <div class="h" data-at="s6:ketegangan">Ketegangan naik sendiri</div>
  <div class="mono" data-at="s6:terakhir">&gt; ALIEN TERAKHIR = PALING CEPAT</div>
  <div class="mono am" data-at="s6:susah">&gt; PALING SUSAH DITEMBAK</div>
</div></div>
<div class="p" data-in="s6:Belakangan" data-out="s7"><div class="scr">
  <div class="tag">KATA NISHIKADO (DIRINGKAS)</div>
  <div class="h" style="font-size:40px">Belakangan Nishikado bilang, bagian ini:</div>
  <div class="qt"><span data-at="s6:menarik">&ldquo;lebih menarik</span> <b data-at="s6:sekaligus" data-fx="pop">+</b> <span data-at="s6:menutupi">menutupi keterbatasan hardware&rdquo;</span></div>
</div></div>
<div class="p" data-in="s7" data-out="s8"><div class="scr">
  <div class="tag">DARI JEPANG KE SELURUH DUNIA</div>
  <div class="big2 g" data-at="s7:hit" data-fx="pop">HIT DUNIA</div>
  <div class="gr" data-at="s7:kurva" data-fx="fade"><div class="gl">KURVA KESULITAN</div>
    <svg width="${GW + 70}" height="${GH + 46}" viewBox="-50 -10 ${GW + 70} ${GH + 46}"><path d="M0,0 V${GH} H${GW}" fill="none" stroke="${WHT}" stroke-width="3"/>
    <path d="${curve}" fill="none" stroke="${SIG}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" data-at="s7:kesulitan" data-fx="draw"/>
    <text x="${GW}" y="${GH + 32}" text-anchor="end" class="ax">ALIEN TERSISA &#8595;</text><text x="-14" y="16" text-anchor="end" class="ax" transform="rotate(-90 -14 16)">CEPAT</text></svg></div>
  <div class="mono" data-at="s7:lahir">&gt; LAHIR DARI PROSESOR YANG KEWALAHAN</div>
</div></div>
<div class="p" data-in="s8" data-out="@END"><div class="scr">
  <div class="h" data-at="s8:batasan">Batasan &rarr; desain terbaik</div>
  <div class="big2 g" data-at="s8:Kamu" data-fx="pop">Kamu pernah main Space Invaders?</div>
</div></div>`;

const css = `
.scr{position:relative;overflow:hidden;background:rgba(5,5,5,.86);border:3px solid ${WHT};border-radius:20px;padding:22px 28px 24px;box-shadow:0 0 0 7px ${BLK},0 0 40px rgba(57,255,20,.22),inset 0 0 70px rgba(242,242,242,.07)}
.scr::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0 2px,rgba(0,0,0,0) 2px 5px);pointer-events:none}
.tag{font-family:"Share Tech Mono",monospace;font-size:28px;letter-spacing:.08em;color:${SIG};margin-bottom:10px}
.big{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:96px;line-height:.96;color:${WHT};margin-bottom:12px}.big span{color:${SIG};text-shadow:0 0 26px rgba(57,255,20,.6)}
.big2{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:78px;line-height:1.02;color:${WHT};margin:8px 0}
.h{font-family:"Chakra Petch",sans-serif;font-weight:600;font-size:52px;line-height:1.1;color:${WHT};margin:6px 0}.hs{font-size:44px;margin-bottom:10px}
.mono{font-family:"Share Tech Mono",monospace;font-size:35px;line-height:1.2;color:${WHT};margin:8px 0}.mono em{font-style:normal;color:${SIG}}
.chip{display:inline-block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:40px;line-height:1.1;padding:8px 18px 9px;border:3px solid currentColor;border-radius:6px;color:${WHT};margin:8px 12px 6px 0}
.am{color:${AMB}}.g{color:${SIG}}.st{font-size:50px;border-width:5px}
.qt{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:50px;line-height:1.1;color:${WHT}}.qt span{display:inline-block}.qt b{display:inline-block;color:${SIG};font-size:74px}
.hr{display:flex;align-items:center;gap:20px;margin:6px 0}.lb{font-family:"Share Tech Mono",monospace;font-size:27px;line-height:1.1;color:${WHT};width:230px;flex:none}
#dots{display:grid;grid-template-columns:repeat(11,30px);gap:4px}#dots i{display:block;width:30px;height:13px;background:#1c1c1c;border-radius:2px}#dots i.on{background:${SIG};box-shadow:0 0 9px rgba(57,255,20,.8)}
.bar{width:420px;height:28px;border:3px solid ${WHT};padding:4px;box-sizing:border-box}.bar i{display:block;height:100%;width:100%;background:${AMB};transform-origin:0 50%;box-shadow:0 0 14px rgba(255,176,32,.7)}
#tape{position:relative;width:420px;height:38px;border:3px solid ${WHT};overflow:hidden;box-sizing:border-box}#tape i{position:absolute;left:0;top:5px;bottom:5px;width:4px;background:${SIG};opacity:0}
#beats{display:flex;gap:16px}#beats b{display:block;width:34px;height:34px;border:3px solid ${SIG};border-radius:50%;box-sizing:border-box}#beats b.on{background:${SIG};box-shadow:0 0 18px ${SIG}}
.gr{margin:6px 0}.gl{font-family:"Share Tech Mono",monospace;font-size:28px;color:${AMB};margin-bottom:4px}.ax{font-family:"Share Tech Mono",monospace;font-size:24px;fill:${WHT}}
#chip{font-family:"Share Tech Mono",monospace;color:${WHT};background:rgba(5,5,5,.7);padding:3px 12px;border:1px solid rgba(242,242,242,.5)}`;

// HUD: the s4 meters read the same simulation the CRT draws.
const hud = `(()=>{const S=K.sim,B=K.beats;const dots=[...document.querySelectorAll('#dots i')],tk=[...document.querySelectorAll('#tape i')],lamps=[...document.querySelectorAll('#beats b')],bFt=q('#bFt');let key='';
const segAt=(t)=>{let s=S.segs[0];for(const x of S.segs)if(t>=x.t0)s=x;return s;};
return (t)=>{if(t<K.s4-0.3||t>K.s5+0.3)return;const sg=segAt(t);const al=new Set(sg.alive0);for(const k of sg.kills)if(k[0]<=t)al.delete(k[1]);
 const k2=[...al].join(',');if(k2!==key){key=k2;dots.forEach((d,i)=>d.className=al.has(i)?'on':'');}
 bFt.style.transform='scaleX('+(al.size/55).toFixed(4)+')';
 let j=0;for(let i=sg.steps.length-1;i>=0&&j<tk.length;i--){const ts=sg.steps[i][0];if(ts>t)continue;if(t-ts>2.4)break;tk[j].style.transform='translateX('+(408-(t-ts)/2.4*408).toFixed(1)+'px)';tk[j].style.opacity=1;j++;}
 for(;j<tk.length;j++)tk[j].style.opacity=0;
 let b=-1;for(let i=0;i<B.length;i++){if(B[i]<=t)b=i;else break;}
 lamps.forEach((l,i)=>l.className=(b>=0&&i===b%4&&t-B[b]<0.5)?'on':'');};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BLK, vig: 0.5, grain: 0.06, capfloor: 0.3, html, css, chipFont: MO, chipColor: WHT,
  K: { sim: SIM, beats, tWave, hitT },
  extraAt: ["s2:1978", "s1:cepat", "s1:Itu#2", "s2:selama", "s2:setahun", "s2:Dia", "s2:Atari", "s3:Tapi", "s3:kuat", "s3:alien#2", "s4:sesuatu", "s4:frame#2", "s5:Developer", "s5:Nishikado", "s5:memilih", "s6:Alien", "s6:ditembak", "s6:paling#2", "s7:seluruh", "s8:Kamu"],
  // CRT power-on: a bright scan line stretches across, then opens vertically.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:1,scaleX:0,scaleY:.012,filter:'brightness(3.2)'},{scaleX:1,duration:.11,ease:'power2.out'},a-.12);tl.to(p,{scaleY:1,filter:'brightness(1)',duration:.24,ease:'power3.out'},a-.01);}`,
  // CRT power-off: collapses to a line, then to a dot.
  panelOut: `(tl,p,b)=>{tl.to(p,{scaleY:.012,filter:'brightness(3.2)',duration:.1,ease:'power2.in'},b-.22);tl.to(p,{scaleX:0,opacity:0,duration:.09,ease:'power2.in'},b-.11);}`,
  fxExtra: `draw:(e,t)=>{tl.set(e,{opacity:1},t);tl.fromTo(e,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.7,ease:'power1.inOut'},t);},`,
  hud,
  outroIn: `gsap.set('#outro',{clipPath:'inset(49.6% 50% 49.6% 50%)'});tl.to('#outro',{clipPath:'inset(49.6% 0% 49.6% 0%)',duration:.12,ease:'power2.out'},OUT-.12);tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.3,ease:'power3.out'},OUT);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:64px;line-height:1.14;color:#fff;transform-origin:50% 100%;text-shadow:5px 0 0 #000,-5px 0 0 #000,0 5px 0 #000,0 -5px 0 #000,4px 4px 0 #000,-4px 4px 0 #000,4px -4px 0 #000,-4px -4px 0 #000,0 0 18px rgba(0,0,0,.8)}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0},{color:"${SIG}",y:-6,duration:.05,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{scaleY:.15,opacity:0},{scaleY:1,opacity:1,duration:.13,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Dalam Mesin 1978", BLK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "steps", segs.map((s) => s.steps.length), "kills", segs.map((s) => s.kills.length), "beats", beats.length);
