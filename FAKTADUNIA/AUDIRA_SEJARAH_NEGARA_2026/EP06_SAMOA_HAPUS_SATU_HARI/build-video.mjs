// EP06 SAMOA HAPUS SATU HARI. GLASSCRAFT + TIMEFORGE: a Pacific globe at tropical dawn, the date line as a light curtain,
// frosted-glass calendar pages and a glass day-dial. Panels drop in like a calendar page and leave torn off along a jagged edge.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TEAL = "#19B6B0", DEEP = "#0B3A5B", CORAL = "#FF6F59", SAND = "#F3E3C3", SRED = "#CE1126", SBLUE = "#002B7F", BG = "#0B3A5B";

const crown = `<svg viewBox="0 0 64 64" class="ic"><path d="M10 46 L8 20 L22 32 L32 14 L42 32 L56 20 L54 46 Z" fill="${SAND}"/><rect x="10" y="49" width="44" height="6" rx="2" fill="${SAND}"/><circle cx="32" cy="12" r="3.5" fill="${CORAL}"/></svg>`;
const fale = `<svg viewBox="0 0 64 64" class="ic"><path d="M6 30 Q32 6 58 30 Z" fill="${SAND}"/><g fill="${SAND}"><rect x="12" y="32" width="4" height="20"/><rect x="22" y="32" width="4" height="20"/><rect x="30" y="32" width="4" height="20"/><rect x="38" y="32" width="4" height="20"/><rect x="48" y="32" width="4" height="20"/></g><rect x="8" y="52" width="48" height="5" rx="2" fill="${SAND}"/></svg>`;
const tag = (icon, name, role, a, bg = "") => `<div class="tag ${bg}" data-at="${a}" data-fx="row">${icon}<div><b>${name}</b><span>${role}</span></div></div>`;

const SAM = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"], AUS = ["SEL", "RAB", "KAM", "JUM", "SAB", "MIN", "SEN"];
const cell = (d, work, ov) => `<i class="${work ? "wk" : "we"}">${d}${ov ? `<u data-at="s4:empat" data-fx="fade"></u>` : ""}</i>`;
const week = `<div class="week">
  <div class="wr" data-at="s4:hari" data-fx="row"><em>SAMOA</em>${SAM.map((d, i) => cell(d, i < 5, i < 4)).join("")}</div>
  <div class="wr" data-at="s4:kerja" data-fx="row"><em>AUS/NZ</em>${AUS.map((d, i) => cell(d, i < 4 || i === 6, i < 4)).join("")}</div>
</div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 06</div>
  <div class="gl h1">Hari yang<br><em>tak pernah ada</em></div>
  <div class="row" data-at="s1:Jumat" data-fx="row"><b class="mono">JUMAT</b><span class="mono big">30 DES 2011</span></div>
  <div class="st" data-at="s1:tidak" data-fx="stamp">DIHAPUS DARI KALENDER</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">PASIFIK SELATAN &middot; 13&deg;50&prime; LS 171&deg;45&prime; BB</div>
  <div class="gl h2">Samoa</div>
  <div class="row" data-at="s2:garis" data-fx="row"><b class="dot"></b><span><strong>Garis Tanggal Internasional</strong><br>garis khayal, tempat hari berganti</span></div>
</div>
<div class="p" data-in="s3" data-out="s3:Caranya">
  <div class="kk">1892 &middot; KERAJAAN SAMOA</div>
  <div class="gl h2">Pindah ke<br><em>tanggal Amerika</em></div>
  <div class="row" data-at="s3:pedagang" data-fx="row"><b class="mono sm">PEDAGANG AS</b><span>membujuk sang raja</span></div>
  ${tag(crown, "Mālietoa Laupepa", "RAJA SAMOA", "s3:Mālietoa")}
</div>
<div class="p" data-in="s3:Caranya" data-out="s4">
  <div class="kk">CARANYA: SATU HARI DIULANG</div>
  <div class="gl h2"><span class="mono">SENIN, 4 JULI 1892</span></div>
  <div class="row" data-at="s3:diulang" data-fx="row"><b class="mono xl">&times;2</b><span>dijalani dua kali berturut-turut</span></div>
  <div class="st us" data-at="s3:kemerdekaan" data-fx="stamp">HARI KEMERDEKAAN AS</div>
</div>
<div class="p" data-in="s4" data-out="s4:Tertinggal">
  <div class="kk">2011 &middot; MITRA DAGANG TERBESAR</div>
  <div class="gl h2">Tetangga hidup<br><em>sehari lebih dulu</em></div>
  <div class="chips"><i data-at="s4:Australia" data-fx="pop">AUSTRALIA</i><i data-at="s4:Selandia" data-fx="pop">SELANDIA BARU</i></div>
</div>
<div class="p" data-in="s4:Tertinggal" data-out="s5">
  <div class="kk">SAMOA TERTINGGAL</div>
  <div class="mega"><b class="ct" data-from="0" data-to="21" data-a="s4:21" data-d="1.2">0</b><small>JAM</small></div>
  ${week}
  <div class="st tl" data-at="s4:empat" data-fx="stamp">HANYA 4 HARI KERJA SAMA</div>
</div>
<div class="p" data-in="s5" data-out="s5:Kamis">
  <div class="kk">PERDANA MENTERI SAMOA</div>
  ${tag(fale, "Tuilaepa Sailele Malielegaoi", "MEMUTUSKAN PINDAH", "s5:Tuilaepa")}
  <div class="row" data-at="s5:pindah" data-fx="row"><b class="mono sm">TUJUAN</b><span>sehari dengan Australia &amp; Selandia Baru</span></div>
</div>
<div class="p" data-in="s5:Kamis" data-out="s6">
  <div class="kk" id="clkd">KAMIS 29 DES 2011</div>
  <div class="gl clock"><span id="clk">23:59:55</span></div>
  <div class="row" data-at="s5:Sabtu" data-fx="row"><b class="mono sm">KAMIS 29</b><span class="arr">&rarr;</span><b class="mono sm cor">SABTU 31</b></div>
</div>
<div class="p" data-in="s6" data-out="s6:Tokelau">
  <div class="kk">JUMAT 30 DESEMBER 2011</div>
  <div class="gl h2">Hilang dari<br><em>kalender</em></div>
  <div class="zone"><b data-at="s6:UTC" data-fx="pop" class="old">UTC&minus;11</b><i data-at="s6:UTC#2" data-fx="fade">&rarr;</i><b data-at="s6:UTC#2" data-fx="pop" class="new">UTC+13</b></div>
</div>
<div class="p" data-in="s6:Tokelau" data-out="s7">
  <div class="kk">IKUT MELOMPAT</div>
  <div class="gl h2">Tokelau</div>
  <div class="row" data-at="s6:Selandia" data-fx="row"><b class="mono sm">WILAYAH NZ</b><span>gugus atol di utara Samoa</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Natal">
  <div class="kk">LAUT SEMPIT, BEDA TANGGAL</div>
  <div class="duo"><div data-at="s7:Samoa" data-fx="pop"><span>SAMOA</span><b class="mono">UTC+13</b></div><div class="am" data-at="s7:Amerika" data-fx="pop"><span>SAMOA AMERIKA</span><b class="mono">UTC&minus;11</b></div></div>
  <div class="st tl" data-at="s7:beda" data-fx="stamp">SELISIH 1 HARI</div>
</div>
<div class="p" data-in="s7:Natal" data-out="s7:Kini">
  <div class="kk">25 DESEMBER</div>
  <div class="gl h2">Natal datang<br><em>sehari lebih dulu</em></div>
</div>
<div class="p" data-in="s7:Kini" data-out="s8">
  <div class="kk">MATAHARI PERTAMA</div>
  <div class="gl h2">Termasuk yang pertama<br><em>menyambut hari baru</em></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">SATU NEGARA, DUA LOMPATAN</div>
  <div class="row" data-at="s8:mengulang" data-fx="row"><b class="mono sm blu">+1 HARI</b><span><strong>1892</strong> &middot; Senin, 4 Juli diulang</span></div>
  <div class="row" data-at="s8:menghapus" data-fx="row"><b class="mono sm cor">&minus;1 HARI</b><span><strong>2011</strong> &middot; Jumat, 30 Des dihapus</span></div>
  <div class="q" data-at="s8:Kalau" data-fx="row">Hari apa yang ingin kamu hapus?</div>
</div>`;

const css = `
.p{transform-origin:50% 0%}
.kk{display:block;width:fit-content;font-family:"DM Mono",monospace;font-weight:500;font-size:24px;letter-spacing:.14em;color:${SAND};background:rgba(11,58,91,.74);border:1.5px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 20px 7px;margin-bottom:16px;box-shadow:0 8px 24px rgba(4,20,34,.35)}
.gl{display:inline-block;background:linear-gradient(140deg,rgba(255,255,255,.24),rgba(255,255,255,.07) 60%),rgba(11,58,91,.42);border:1.5px solid rgba(255,255,255,.42);border-radius:30px;backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:0 22px 50px rgba(4,20,34,.38),inset 0 1px 0 rgba(255,255,255,.5)}
.h1{padding:14px 30px 22px;font-family:Sora,sans-serif;font-weight:800;font-size:96px;line-height:1.0;letter-spacing:-.02em;color:#fff;text-shadow:0 4px 22px rgba(4,20,34,.45)}
.h1 em,.h2 em{font-style:normal;color:${CORAL}}
.h2{padding:10px 28px 16px;font-family:Sora,sans-serif;font-weight:800;font-size:76px;line-height:1.04;letter-spacing:-.015em;color:#fff;text-shadow:0 4px 22px rgba(4,20,34,.45)}
.h2 .mono{font-family:"DM Mono",monospace;font-weight:500;font-size:62px;letter-spacing:.02em}
.row{display:flex;gap:22px;align-items:center;margin-top:16px;padding:16px 26px;background:linear-gradient(140deg,rgba(255,255,255,.26),rgba(255,255,255,.08) 60%),rgba(11,58,91,.68);border:1.5px solid rgba(255,255,255,.4);border-radius:26px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 18px 40px rgba(4,20,34,.34)}
.row b{flex:none;font-family:Sora,sans-serif;font-weight:800;font-size:52px;line-height:1;color:${CORAL}}
.row b.mono{font-family:"DM Mono",monospace;font-weight:500;letter-spacing:.06em}
.row b.sm{font-size:34px}.row b.xl{font-size:84px}
.row b.cor{color:#FF9483}.row b.blu{color:#9BE3FF}
.row b.dot{width:26px;height:26px;border-radius:50%;background:${CORAL};box-shadow:0 0 0 7px rgba(255,111,89,.3),0 0 24px ${CORAL}}
.row span{font-family:Sora,sans-serif;font-weight:500;font-size:32px;line-height:1.22;color:#fff}
.row span strong{font-weight:700;color:${SAND}}
.row span.mono{font-family:"DM Mono",monospace;font-weight:500;letter-spacing:.04em}
.row span.big{font-size:44px}
.row span.arr{font-size:44px;color:${SAND}}
.st{display:inline-block;margin-top:18px;font-family:"DM Mono",monospace;font-weight:500;font-size:34px;letter-spacing:.1em;padding:10px 22px;color:#fff;background:${CORAL};border-radius:14px;transform:rotate(-2deg);box-shadow:0 12px 30px rgba(255,111,89,.35),inset 0 0 0 3px rgba(255,255,255,.55)}
.st.us{background:${SBLUE};box-shadow:0 12px 30px rgba(0,43,127,.4),inset 0 0 0 3px ${SRED}}
.st.tl{background:${TEAL}}
.tag{display:flex;align-items:center;gap:22px;margin-top:16px;padding:14px 28px 14px 16px;background:linear-gradient(140deg,rgba(255,255,255,.26),rgba(255,255,255,.08) 60%),rgba(11,58,91,.55);border:1.5px solid rgba(255,255,255,.42);border-radius:26px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 18px 40px rgba(4,20,34,.34)}
.tag .ic{flex:none;width:96px;height:96px;padding:14px;box-sizing:border-box;border-radius:50%;background:${SBLUE};box-shadow:inset 0 0 0 4px ${SRED}}
.tag b{display:block;font-family:Sora,sans-serif;font-weight:700;font-size:42px;line-height:1.08;color:#fff}
.tag span{display:block;margin-top:6px;font-family:"DM Mono",monospace;font-weight:500;font-size:24px;letter-spacing:.14em;color:${CORAL}}
.chips{display:flex;gap:14px;margin-top:16px}
.chips i{font-style:normal;font-family:Sora,sans-serif;font-weight:700;font-size:32px;letter-spacing:.04em;color:#fff;padding:12px 24px;border-radius:999px;background:rgba(25,182,176,.82);border:1.5px solid rgba(255,255,255,.6);box-shadow:0 12px 28px rgba(4,20,34,.3)}
.mega{display:flex;align-items:baseline;gap:18px;color:#fff;text-shadow:0 8px 30px rgba(4,20,34,.55)}
.mega b{font-family:Sora,sans-serif;font-weight:800;font-size:170px;line-height:.92;letter-spacing:-.03em;color:#fff}
.mega small{font-family:"DM Mono",monospace;font-weight:500;font-size:60px;letter-spacing:.08em;color:${CORAL}}
.week{margin-top:10px}
.wr{display:flex;gap:8px;align-items:center;margin-top:10px}
.wr em{flex:none;width:150px;font-style:normal;font-family:"DM Mono",monospace;font-weight:500;font-size:24px;letter-spacing:.08em;color:${SAND};text-shadow:0 2px 10px rgba(4,20,34,.7)}
.wr i{position:relative;flex:1;text-align:center;font-style:normal;font-family:"DM Mono",monospace;font-weight:500;font-size:26px;padding:16px 0;border-radius:14px;border:1.5px solid rgba(255,255,255,.4);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.wr i.wk{color:#fff;background:rgba(25,182,176,.55)}
.wr i.we{color:rgba(255,255,255,.62);background:rgba(11,58,91,.55)}
.wr i u{position:absolute;inset:-4px;border-radius:16px;border:4px solid ${CORAL};box-shadow:0 0 18px rgba(255,111,89,.6)}
.clock{padding:6px 30px 12px}
.clock span{font-family:"DM Mono",monospace;font-weight:500;font-size:132px;line-height:1.05;letter-spacing:.02em;color:#fff;font-variant-numeric:tabular-nums}
.zone{display:flex;align-items:center;gap:18px;margin-top:18px}
.zone b{font-family:"DM Mono",monospace;font-weight:500;font-size:58px;padding:10px 22px;border-radius:20px;border:1.5px solid rgba(255,255,255,.45);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.zone b.old{color:rgba(255,255,255,.85);background:rgba(11,58,91,.6);text-decoration:line-through;text-decoration-color:${CORAL};text-decoration-thickness:5px}
.zone b.new{color:#fff;background:rgba(255,111,89,.88)}
.zone i{font-style:normal;font-family:Sora,sans-serif;font-size:58px;color:#fff}
.duo{display:flex;gap:14px}
.duo>div{flex:1;padding:16px 20px 18px;border-radius:26px;background:linear-gradient(140deg,rgba(255,255,255,.26),rgba(255,255,255,.08) 60%),rgba(0,43,127,.6);border:1.5px solid rgba(255,255,255,.45);box-shadow:inset 0 6px 0 ${SRED},0 18px 40px rgba(4,20,34,.34);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.duo>div.am{background:linear-gradient(140deg,rgba(255,255,255,.24),rgba(255,255,255,.06) 60%),rgba(70,86,100,.66);box-shadow:inset 0 6px 0 #9DB0BF,0 18px 40px rgba(4,20,34,.34)}
.duo span{display:block;font-family:Sora,sans-serif;font-weight:700;font-size:30px;letter-spacing:.04em;color:${SAND}}
.duo b{display:block;margin-top:6px;font-family:"DM Mono",monospace;font-weight:500;font-size:56px;color:#fff}
.q{display:block;margin-top:18px;padding:18px 28px;border-radius:26px;font-family:Sora,sans-serif;font-weight:800;font-size:50px;line-height:1.1;color:#fff;background:linear-gradient(140deg,rgba(255,255,255,.22),rgba(255,255,255,0) 60%),${CORAL};border:1.5px solid rgba(255,255,255,.6);box-shadow:0 18px 40px rgba(255,111,89,.35)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-world.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo-world.js");
copyFileSync("geo-samoa.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo-samoa.js");

// jagged calendar-tear edge for clip-path: the page is ripped off upward
const zz = (y) => { const p = ["0% 0%", "100% 0%"]; for (let i = 20; i >= 0; i--) p.push(`${i * 5}% ${(y + (i % 2 ? 3 : 0)).toFixed(1)}%`); return `polygon(${p.join(",")})`; };

const { AT, K } = writeWorld(TL, at, {
  ep: "06", bg: BG, vig: 0.32, grain: 0.06, capfloor: 0.22, html, css, chipFont: `"DM Mono",monospace`, chipColor: SAND,
  chip: "ILUSTRASI &middot; PETA DISEDERHANAKAN",
  extraAt: ["s1:tidak", "s1:ada", "s2:Samoa", "s2:garis", "s2:Garis", "s2:berganti", "s3:1892", "s3:pedagang", "s3:Mālietoa", "s3:memakai", "s3:Amerika#2", "s3:Caranya", "s3:Senin", "s3:diulang", "s3:kemerdekaan",
    "s4:Australia", "s4:Selandia", "s4:Tertinggal", "s4:21", "s4:hari", "s4:empat", "s5:Tuilaepa", "s5:Kamis", "s5:tepat", "s5:malam", "s5:melompat", "s5:Sabtu",
    "s6:Zona", "s6:minus", "s6:plus", "s6:Tokelau", "s6:ikut", "s7:Samoa", "s7:Amerika", "s7:Natal", "s7:Kini", "s8:mengulang", "s8:menghapus", "s8:Kalau"],
  fxExtra: `row:(e,t)=>{const d=e.dataset.d||'flex';gsap.set(e,{display:'none'});tl.set(e,{display:d},t-.001);tl.fromTo(e,{opacity:0,y:26,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.42,ease:'power3.out'},t);},`,
  // a fresh calendar page swings down from its top binding; the old one is torn off along a jagged edge and flies up
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,rotationX:-62,y:-30,transformPerspective:1500},{opacity:1,rotationX:0,y:0,duration:.52,ease:'power3.out'},a-.1)`,
  panelOut: `(tl,p,b)=>{tl.fromTo(p,{clipPath:${JSON.stringify(zz(104))}},{clipPath:${JSON.stringify(zz(-8))},duration:.32,ease:'power2.in'},b-.32);tl.to(p,{y:-90,rotation:-2.5,duration:.32,ease:'power2.in'},b-.32);tl.set(p,{clipPath:'none',y:0,rotation:0},b+.05);}`,
  hud: `(t)=>{const e=q('#clk');if(!e)return;const M=AT['s5:malam']+.3,d=q('#clkd');
    if(t<M){const s=Math.min(59,Math.ceil(M-t));e.textContent='23:59:'+String(60-s).padStart(2,'0');d.textContent='KAMIS 29 DES 2011';e.style.color='#fff';}
    else{e.textContent='00:00:'+String(Math.min(59,Math.floor(t-M))).padStart(2,'0');d.textContent=t<AT['s5:Sabtu']-.1?'JUMAT 30 DES 2011 · DILEWATI':'SABTU 31 DES 2011';e.style.color='${CORAL}';}}`,
});

// Captions: join any {display|spoken} split words the estimate left behind.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:914px;box-sizing:border-box;text-align:center;font-family:Sora,sans-serif;font-weight:600;font-size:54px;line-height:1.16;color:#fff;padding:14px 32px 18px;border-radius:36px;background:linear-gradient(140deg,rgba(255,255,255,.22),rgba(255,255,255,.06) 60%),rgba(11,58,91,.62);border:1.5px solid rgba(255,255,255,.45);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 44px rgba(4,20,34,.45),inset 0 1px 0 rgba(255,255,255,.5);text-shadow:0 2px 10px rgba(4,20,34,.35)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"${CORAL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:22},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Samoa Hapus Satu Hari", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
