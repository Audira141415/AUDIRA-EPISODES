// EP05 BAHTERA NUH. BUILDFORGE + stormy WORLDFORGE: weathered timber, tar black, olive hills, slate storm sky, then teal flood
// water and a golden break in the clouds. Panels are tarred timber boards with a plank strip on top; each one slides in like a
// plank and lands with a hammer-hit snap. Arabic is cut word-exact from _research/quran/EP05_nuh.txt. Run: node build-video.mjs
import { copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TAR = "#15110D", TIMB = "#9A7550", TIMBL = "#C9A273", BONE = "#EFE6D2", GOLD = "#E9B44C", TEAL = "#3FB3A6", OLIVE = "#8E9B4F", BG = "#2A323A";

// Arabic: whole words sliced from the Uthmani line, never retyped.
const QF = readFileSync("../_research/quran/EP05_nuh.txt", "utf8").split(/\r?\n/);
const ar = (ref, a, b) => {
  const l = QF.find((x) => x.startsWith(`QS ${ref} |`));
  if (!l) throw new Error("verse " + ref);
  return l.split(" | ")[1].trim().split(" ").slice(a, b + 1).join(" ");
};
const AR = { a2914: ar("29:14", 5, 11), a5413: ar("54:13", 0, 4), a1141: ar("11:41", 2, 7), a1144: ar("11:44", 0, 5), a1144b: ar("11:44", 10, 12) };
for (const [k, v] of Object.entries(AR)) console.log(k, v);

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><em>05</em>KISAH DALAM AL-QUR'AN</div>
    <div class="cnt"><b class="ct nb" data-from="1000" data-to="950" data-a="s1:lima" data-d="0.9">1.000</b><span class="yr">TAHUN</span><span class="minus nb" data-at="s1:lima" data-fx="stamp">&minus;50</span></div>
    <div class="ref">QS AL-'ANKABUT 29:14 &middot; SERIBU TAHUN KURANG LIMA PULUH</div>
    <div class="row g" data-at="s1:sedikit" data-fx="nail"><b>HANYA SEDIKIT</b><span>yang beriman &middot; QS Hud 11:40</span></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Nuh">
  <div class="card">
    <div class="k"><em>29:14</em>SURAH AL-'ANKABUT</div>
    <div class="ar" data-at="s2:Al-'Ankabut" data-fx="nail">${AR.a2914}</div>
    <div class="id">"...maka dia tinggal bersama mereka seribu tahun kurang lima puluh tahun."</div>
  </div>
</div>
<div class="p" data-in="s2:Nuh" data-out="s3">
  <div class="card">
    <div class="k"><em>71:5&ndash;9</em>SURAH NUH</div>
    <div class="h m">NUH MENYERU</div>
    <div class="row" data-at="s2:siang" data-fx="nail"><b>SIANG &amp; MALAM</b></div>
    <div class="row" data-at="s2:terang-terangan" data-fx="nail"><b>TERANG-TERANGAN</b><span>dan diam-diam</span></div>
    <div class="row r" data-at="s2:menyumbat" data-fx="nail"><b>JARI DI TELINGA</b><span>baju menutup wajah</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Nuh">
  <div class="card">
    <div class="k"><em>11:27</em>PARA PEMUKA MENGEJEK</div>
    <div class="q" data-at="s3:kamu" data-fx="nail">"Kamu cuma manusia biasa."</div>
    <div class="q" data-at="s3:pengikutmu" data-fx="nail">"Pengikutmu orang-orang rendahan."</div>
  </div>
</div>
<div class="p" data-in="s3:Nuh" data-out="s4">
  <div class="card">
    <div class="k"><em>11:29</em>JAWABAN NUH</div>
    <div class="q" data-at="s3:aku" data-fx="nail">"Aku tidak meminta harta darimu."</div>
    <div class="h m gold" data-at="s3:Upahku" data-fx="nail">UPAHKU HANYA<br>DARI ALLAH</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Surah">
  <div class="card">
    <div class="k"><em>11:37&ndash;38</em>PERINTAH MEMBUAT KAPAL</div>
    <div class="h m" data-at="s4:buatlah" data-fx="nail">BUATLAH KAPAL</div>
    <div class="id">di bawah pengawasan Kami</div>
    <div class="row r" data-at="s4:Setiap" data-fx="nail"><b>DIEJEK</b><span>setiap kali pemuka kaumnya lewat</span></div>
  </div>
</div>
<div class="p" data-in="s4:Surah" data-out="s5">
  <div class="card">
    <div class="k"><em>54:13</em>SURAH AL-QAMAR</div>
    <div class="ar">${AR.a5413}</div>
    <div class="pp"><span data-at="s4:papan" data-fx="stamp2">PAPAN</span><i data-at="s4:dan" data-fx="fade">&amp;</i><span data-at="s4:pasak" data-fx="stamp2">PASAK</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Nuh">
  <div class="card">
    <div class="k"><em>54:11&ndash;12</em>KETIKA PERINTAH DATANG</div>
    <div class="row t" data-at="s5:langit" data-fx="nail"><b>PINTU LANGIT TERBUKA</b><span>air tercurah</span></div>
    <div class="row t" data-at="s5:menyemburkan" data-fx="nail"><b>BUMI MENYEMBUR</b><span>mata air</span></div>
  </div>
</div>
<div class="p" data-in="s5:Nuh" data-out="s6">
  <div class="card">
    <div class="k"><em>11:40&ndash;41</em>NAIK KE KAPAL</div>
    <div class="row" data-at="s5:sepasang" data-fx="nail"><b>SEPASANG</b><span>dari setiap jenis hewan</span></div>
    <div class="ar sm" data-at="s5:Naiklah" data-fx="nail">${AR.a1141}</div>
    <div class="id" data-at="s5:Naiklah" data-fx="nail">"Naiklah, dengan nama Allah, saat berlayar dan berlabuh."</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Nuh">
  <div class="card">
    <div class="k"><em>11:42</em>SURAH HUD</div>
    <div class="h m" data-at="s6:gelombang" data-fx="nail">GELOMBANG<br>SETINGGI GUNUNG</div>
  </div>
</div>
<div class="p" data-in="s6:Nuh" data-out="s7">
  <div class="card">
    <div class="k"><em>11:42&ndash;43</em>NUH DAN ANAKNYA</div>
    <div class="q" data-at="s6:naiklah" data-fx="nail">"Naiklah bersama kami."</div>
    <div class="q dim" data-at="s6:aku" data-fx="nail">"Aku akan berlindung ke gunung."</div>
    <div class="row t" data-at="s6:Gelombang" data-fx="nail"><b>GELOMBANG MEMISAHKAN</b></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Kapal">
  <div class="card">
    <div class="k"><em>11:44</em>SURAH HUD</div>
    <div class="ar" data-at="s7:wahai" data-fx="nail">${AR.a1144}</div>
    <div class="id" data-at="s7:wahai" data-fx="nail">"Wahai bumi, telanlah airmu. Wahai langit, berhentilah."</div>
    <div class="row g" data-at="s7:Judi" data-fx="nail"><b>BUKIT JUDI</b><span class="arw">${AR.a1144b}</span></div>
  </div>
</div>
<div class="p" data-in="s7:Kapal" data-out="s8">
  <div class="card">
    <div class="k"><em>54:15</em>SURAH AL-QAMAR</div>
    <div class="h m gold">DIJADIKAN TANDA</div>
    <div class="q" data-at="s7:Adakah" data-fx="nail">Adakah yang mau mengambil pelajaran?</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><em>950</em>TAHUN MENYERU</div>
    <div class="h m">TIDAK BERHENTI<br>WALAU DITERTAWAKAN</div>
    <div class="q gold" data-at="s8:Menurut" data-fx="nail">Berapa lama kamu sanggup bertahan pada hal yang benar?</div>
  </div>
</div>`;

const css = `
.card{position:relative;background:linear-gradient(180deg,rgba(26,21,16,.93),rgba(17,13,10,.93));border:2px solid rgba(201,162,115,.32);box-shadow:0 26px 60px rgba(0,0,0,.55);padding:26px 30px 28px;margin-top:20px}
.card:before{content:"";position:absolute;left:-14px;right:-14px;top:-22px;height:24px;border-radius:3px;background:repeating-linear-gradient(90deg,#8C6A46 0 3px,#9A7550 3px 40px,#86643f 40px 43px,#A47F58 43px 97px);box-shadow:0 5px 0 #3b2a1a}
.card:after{content:"";position:absolute;top:-15px;left:14px;width:10px;height:10px;border-radius:50%;background:#2a1d12;box-shadow:874px 0 0 #2a1d12,430px 0 0 #2a1d12}
.k{display:flex;align-items:center;gap:14px;font-family:Oswald,sans-serif;font-weight:600;font-size:25px;letter-spacing:.13em;color:${TIMBL};padding-bottom:12px;border-bottom:2px solid rgba(201,162,115,.3);margin-bottom:14px}
.k em{font-style:normal;background:${GOLD};color:${TAR};padding:2px 12px;letter-spacing:.04em}
.cnt{display:flex;align-items:flex-end;gap:18px;position:relative}
.cnt .ct{font-family:Oswald,sans-serif;font-weight:700;font-size:210px;line-height:.86;color:${BONE};letter-spacing:-.01em}
.cnt .yr{font-family:Oswald,sans-serif;font-weight:600;font-size:64px;line-height:1;color:${GOLD};padding-bottom:14px}
.minus{position:absolute;right:0;top:0;font-family:Oswald,sans-serif;font-weight:700;font-size:64px;color:${TAR};background:${GOLD};padding:2px 16px;transform-origin:50% 50%}
.ref{margin-top:14px;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:28px;letter-spacing:.06em;color:${TEAL}}
.h{font-family:Oswald,sans-serif;font-weight:700;font-size:96px;line-height:.98;color:${BONE};text-transform:uppercase}
.h.m{font-size:76px;line-height:1.02}
.gold{color:${GOLD}}
.row{display:flex;align-items:baseline;justify-content:space-between;gap:18px;padding:12px 0 6px;border-top:2px dashed rgba(201,162,115,.3);margin-top:10px}
.row b{font-family:Oswald,sans-serif;font-weight:700;font-size:50px;line-height:1;color:${BONE};flex:none}
.row span{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:32px;color:#d6c9ae;text-align:right}
.row.g b{color:${GOLD}}.row.r b{color:#D98A5B}.row.t b{color:${TEAL}}
.row .arw{font-family:Amiri,serif;font-size:44px;direction:rtl;color:${BONE};font-weight:400}
.ar{font-family:Amiri,serif;font-weight:400;font-size:62px;line-height:1.75;direction:rtl;text-align:right;color:${BONE}}
.ar.sm{font-size:52px;margin-top:8px}
.id{font-family:'Barlow Condensed',sans-serif;font-weight:500;font-size:36px;line-height:1.22;color:#d9cdb4;margin-top:6px}
.q{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:50px;line-height:1.12;color:${BONE};padding:8px 0 8px 22px;border-left:8px solid ${TIMB};margin-top:12px}
.q.dim{color:#bcae94;border-left-color:#5f5446}.q.gold{color:${GOLD};border-left-color:${GOLD}}
.pp{display:flex;align-items:center;gap:22px;margin-top:10px}
.pp span{font-family:Oswald,sans-serif;font-weight:700;font-size:92px;line-height:1;color:${TAR};background:${TIMBL};padding:4px 22px;box-shadow:0 6px 0 #5b4127}
.pp i{font-style:normal;font-family:Oswald,sans-serif;font-weight:600;font-size:64px;color:${GOLD}}
#chip{background:rgba(21,17,13,.6);padding:4px 10px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
mkdirSync("PROJECT/HyperFrames_Remotion/assets/audio", { recursive: true });
mkdirSync("PROJECT/HyperFrames_Remotion/compositions", { recursive: true });

// Shared beats for world3d.js and mix.py: hammer strikes on the 25 pegs, lightning strikes.
const H0 = at("s4:Setiap") + 2.05, HI = 0.215;
const HS = Array.from({ length: 25 }, (_, i) => +(H0 + i * HI).toFixed(3));
const LT = [at("s5:langit") + 0.1, at("s5:tercurah") + 0.2, at("s5:menyemburkan") + 0.6, at("s5:Naiklah") - 0.5, at("s6:gelombang") + 0.2, at("s6:gunung") + 0.1, at("s6:Gelombang") + 0.3, at("s7:Lalu") + 0.4].map((x) => +x.toFixed(3));
const WORLD_AT = ["s1:lima", "s1:Selama", "s1:kaumnya", "s1:sedikit", "s2:Tapi", "s2:menyumbat", "s2:menutupi", "s3:Nuh", "s3:mengejek", "s3:Upahku",
  "s4:buatlah", "s4:pengawasan", "s4:membangun", "s4:Setiap", "s4:mengejeknya", "s4:Surah", "s4:papan", "s4:pasak",
  "s5:langit", "s5:terbuka", "s5:tercurah", "s5:bumi", "s5:menyemburkan", "s5:mata", "s5:sepasang", "s5:orang-orang", "s5:Naiklah", "s5:berlabuh",
  "s6:gelombang", "s6:gunung", "s6:Nuh", "s6:anaknya", "s6:menjawab", "s6:Gelombang", "s7:Lalu", "s7:berhentilah", "s7:Air", "s7:berlabuh", "s7:Judi", "s7:Kapal", "s8:Menurut"];
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: BG, vig: 0.5, grain: 0.06, capfloor: 0.62, html, css, chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "'Barlow Condensed',sans-serif", chipColor: BONE,
  extraAt: WORLD_AT, K: { HS, LT },
  fxExtra: `nail:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{x:-70,opacity:0},{x:0,opacity:1,duration:.24,ease:'power3.in'},t);tl.fromTo(e,{y:-5},{y:0,duration:.18,ease:'bounce.out'},t+.24);},
 stamp2:(e,t)=>{gsap.set(e,{opacity:0});tl.fromTo(e,{y:-60,scale:1.15,opacity:0},{y:0,scale:1,opacity:1,duration:.2,ease:'power4.in'},t);tl.fromTo(e,{rotation:-3},{rotation:0,duration:.3,ease:'elastic.out(1,.4)'},t+.2);},`,
  // Plank slide from the left, then a hammer-hit snap: a short drop and a tilt that settles.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{x:-1150,rotation:-1.6,opacity:1},{x:0,rotation:-1.6,duration:.3,ease:'power3.in'},a-.14);tl.fromTo(p,{y:-14,rotation:-1.6},{y:0,rotation:0,duration:.34,ease:'bounce.out'},a+.16);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:1150,rotation:1.2,duration:.28,ease:'power2.in'},b-.28)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 100% 0 0)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power4.in'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:66px;line-height:1.22;color:${BONE};text-shadow:0 3px 14px rgba(0,0,0,.9)}
.w{display:inline-block;padding:0 .1em;margin:0 .06em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${BONE}",scale:1},{color:"${GOLD}",scale:1.08,duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{scale:1,duration:.14,ease:"back.out(3)"},${(w.start + 0.06).toFixed(3)});tl.to("#${id}",{color:"${BONE}",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-36,opacity:0},{x:0,opacity:1,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bahtera Nuh", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "HS", HS[0], HS[24]);
