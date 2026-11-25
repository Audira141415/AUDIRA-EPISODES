// EP35 CROWDSTRIKE LAYAR BIRU: GLITCHFORGE. A pale product studio whose feed corrupts: a curved wall of monitors
// flips to an original blue error screen, the update packet rides a cable, a layer stack shears at the crash,
// a bootloop ring, an impact cluster, a small technician fixing desk by desk, a 10x10 grid where one cube is the 1%.
// Panels are white studio cards with a signal-red bar; the batch chain (UPDATE > FILE 291 > CRASH > BOOTLOOP >
// BANDARA/BANK/RS) grows link by link above the captions. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#0B0C10", RED = "#FF1E56", CYAN = "#00E5FF", BLUE = "#1747C9", GREEN = "#14A85A", BG = "#D8D9DE";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const link = (txt, a, extra = "") => `<i class="lk" data-at="${a}" data-fx="link">${txt}${extra}</i>`;
const arr = (a) => `<b class="ar" data-at="${a}" data-fx="fade">›</b>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Space Grotesk',sans-serif;font-weight:700">UPDATE 2024</span><span style="font-family:'Space Grotesk',sans-serif;font-weight:500">layar</span><span style="font-family:'JetBrains Mono',monospace;font-weight:500">A 1</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700">AUDIRA</span></div>
<div id="st" class="ok">● SINYAL OK</div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 35", "FAKTA SEJARAH NEGARA")}
  <div class="hero">
    <div class="h1">SATU UPDATE.</div>
    <div class="big" data-at="s1:Delapan" data-fx="blk"><span class="ct nb" data-from="0" data-to="8.5" data-a="s1:Delapan" data-d="0.75" data-dec="1">8,5</span> JUTA</div>
    <div class="sub">komputer jadi <em>layar biru</em> · 19 Juli 2024</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("01", "JUMAT, 19 JULI 2024")}
  <div class="cd clock" data-at="s2:sebelas" data-fx="card"><b>11.09 <small>WIB</small></b><span>04.09 UTC</span></div>
  ${row("CROWDSTRIKE", "perusahaan keamanan siber Amerika", "s2:CrowdStrike")}
  ${row("UPDATE RUTIN → FALCON", "software pelindung komputer kantor", "s2:mengirim", "cy")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "DI DALAM WINDOWS")}
  ${row("FALCON DI KERNEL", "lapisan terdalam, untuk menangkap serangan", "s3:kernel", "cy")}
  ${row("CHANNEL FILE 291 RUSAK", "satu berkas konfigurasi di update itu", "s3:rusak", "rd")}
  ${row("BACA MEMORI DI LUAR BATAS", "Windows langsung crash", "s3:luar", "rd")}
</div>
<div class="p" data-in="s4" data-out="s4:Bank">
  ${kk("03", "REAKSI BERANTAI")}
  ${row("NYALA ULANG → CRASH LAGI", "bootloop", "s4:dinyalakan", "rd")}
  <div class="cd row bl" data-at="s4:seribu" data-fx="card"><b>DELTA: &gt; <span class="ct nb" data-from="0" data-to="1200" data-a="s4:seribu" data-d="0.6">1.200</span> PENERBANGAN BATAL</b><span>dalam satu hari itu</span></div>
</div>
<div class="p" data-in="s4:Bank" data-out="s5">
  ${kk("03", "IKUT TERGANGGU")}
  ${row("BANK · RUMAH SAKIT · LAYANAN DARURAT", "", "s4:Bank", "rd")}
  ${row("INDONESIA: CHECK-IN AIRASIA &amp; CITILINK", "terganggu", "s4:Indonesia")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "78 MENIT")}
  <div class="cd clock" data-at="s5:Tujuh" data-fx="card"><b>11.09 → 12.27 <small>WIB</small></b><span>+<span class="ct nb" data-from="0" data-to="78" data-a="s5:Tujuh" data-d="1.4">78</span> menit</span></div>
  ${row("UPDATE DITARIK", "komputer yang menyala setelahnya aman", "s5:ditarik", "gr")}
  ${row("YANG SUDAH CRASH TETAP MATI", "tidak bisa memperbaiki diri sendiri", "s5:tidak", "rd")}
</div>
<div class="p" data-in="s6" data-out="s6:Komputer">
  ${kk("05", "PERBAIKAN MANUAL")}
  ${row("DIDATANGI SATU PER SATU", "", "s6:satu")}
  ${row("1 · MASUK MODE AMAN", "", "s6:mode", "cy")}
  ${row("2 · HAPUS BERKAS RUSAK", "C-00000291*.sys", "s6:menghapus", "cy")}
</div>
<div class="p" data-in="s6:Komputer" data-out="s7">
  ${kk("05", "TERKUNCI BITLOCKER")}
  <div class="cd row" data-at="s6:kunci" data-fx="card"><b>KUNCI PEMULIHAN <span class="ct nb" data-from="0" data-to="48" data-a="s6:kunci" data-d="1.2">48</span> DIGIT</b><span>diketik untuk setiap mesin</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Kerugian">
  <div class="stamp" data-at="s7:bukan" data-fx="stampc">BUKAN SERANGAN HACKER</div>
  ${row("&lt; 1% PERANGKAT WINDOWS", "menurut Microsoft (±8,5 juta)", "s7:kurang", "bl")}
  ${row("…TAPI MENJALANKAN BANDARA &amp; BANK", "", "s7:bandara", "rd")}
</div>
<div class="p" data-in="s7:Kerugian" data-out="s8">
  ${kk("06", "KERUGIAN")}
  <div class="cd row gd" data-at="s7:sekitar" data-fx="card"><b>≈ US$<span class="ct nb" data-from="0" data-to="5.4" data-a="s7:sekitar" data-d="0.75" data-dec="1">5,4</span> MILIAR</b><span>500 perusahaan terbesar AS saja (perkiraan Parametrix)</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "PELAJARAN")}
  ${row("SATU KESALAHAN KECIL", "makin terhubung dunia, makin jauh ia merambat", "s8:kesalahan", "rd")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Perlukah update penting dikirim pelan-pelan? Tulis di komentar!</div>
</div>
<div id="chain">
  ${link("UPDATE", "s2:mengirim", `<em class="rv" data-at="s5:ditarik" data-fx="stampc">DITARIK</em>`)}${arr("s3:Channel")}
  ${link("FILE 291", "s3:Channel")}${arr("s3:crash")}
  ${link("CRASH", "s3:crash")}${arr("s4:crash")}
  ${link("BOOTLOOP", "s4:crash")}${arr("s4:Bank")}
  ${link("BANDARA · BANK · RS", "s4:Bank")}
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(250,250,252,.95);border-radius:4px;box-shadow:0 12px 30px rgba(20,24,34,.28)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:25px;letter-spacing:.08em;color:${INK};margin-bottom:16px;padding:6px 16px 6px 6px;background:rgba(250,250,252,.92);border-radius:4px}
.kk i{font-style:normal;background:${INK};color:#fff;padding:3px 10px;border-radius:2px}
.hero{background:rgba(250,250,252,.95);border-left:16px solid ${RED};padding:18px 28px 20px;box-shadow:0 16px 40px rgba(10,14,24,.35);width:max-content;max-width:900px}
.h1{font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:96px;line-height:.98;letter-spacing:-.02em;color:${INK}}
.big{display:block;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:168px;line-height:.92;letter-spacing:-.03em;color:${BLUE};text-shadow:-5px 0 0 rgba(255,30,86,.55),5px 0 0 rgba(0,229,255,.6)}
.sub{margin-top:8px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:30px;color:#3A3F4B}
.sub em{font-style:normal;color:#fff;background:${BLUE};padding:0 8px}
.clock{display:flex;flex-direction:column;margin-top:4px;padding:10px 26px 12px;border-left:14px solid ${CYAN};width:max-content}
.clock b{font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:84px;line-height:1;color:${INK};letter-spacing:-.02em}
.clock b small{font-size:40px;color:#5B6170}
.clock span{font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:28px;color:#5B6170}
.clock span span{font:inherit;color:${RED};font-weight:700}
.row{flex-direction:column;margin-top:12px;padding:9px 24px 11px 24px;border-left:14px solid ${INK};max-width:910px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:50px;line-height:1.04;letter-spacing:-.01em;color:${INK}}
.row span{display:block;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:25px;line-height:1.3;color:#4A5060}
.row b span{display:inline;font:inherit;color:inherit}
.row.rd{border-left-color:${RED}}.row.rd b{color:#D3123F}
.row.cy{border-left-color:${CYAN}}.row.gr{border-left-color:${GREEN}}.row.gr b{color:${GREEN}}
.row.bl{border-left-color:${BLUE}}.row.bl b{color:${BLUE}}.row.gd{border-left-color:#D6AA3E}.row.gd b{font-size:72px}
.stamp{display:inline-block;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:62px;line-height:1;color:#fff;background:${INK};padding:14px 24px 12px;border:5px solid ${RED};transform:rotate(-3deg);box-shadow:0 12px 30px rgba(0,0,0,.35);text-shadow:-3px 0 0 rgba(255,30,86,.8),3px 0 0 rgba(0,229,255,.8);margin-bottom:6px}
.q{margin-top:20px;padding:16px 26px 14px;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:56px;line-height:1.06;color:${INK};border-left:14px solid ${RED};max-width:860px}
#st{position:absolute;right:110px;top:184px;z-index:11;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:22px;letter-spacing:.06em;padding:5px 12px;background:${INK};color:#2BFF88;border-left:5px solid #2BFF88}
#st.er{color:#FF5C82;border-left-color:${RED}}#st.wa{color:#FFC94A;border-left-color:#FFC94A}
#chain{position:absolute;left:56px;right:40px;top:1236px;z-index:10;display:flex;flex-wrap:wrap;align-items:center;gap:6px 6px}
.lk{position:relative;font-style:normal;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:22px;letter-spacing:0;color:#fff;background:${INK};padding:7px 10px 6px;border-radius:3px;box-shadow:0 8px 20px rgba(0,0,0,.3);border-bottom:4px solid ${RED};white-space:nowrap}
.ar{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:32px;line-height:1;color:${RED};text-shadow:0 2px 6px rgba(255,255,255,.6)}
.rv{position:absolute;left:6px;top:-26px;font-style:normal;font-size:20px;color:#fff;background:${GREEN};padding:2px 8px;border-radius:2px;transform:rotate(-4deg)}`;

const extraAt = ["s1:software", "s1:Delapan", "s1:komputer", "s2:mengirim",
  "s3:lapisan", "s3:kernel", "s3:Channel", "s3:rusak", "s3:crash", "s3:membaca", "s3:luar",
  "s4:crash", "s4:berhenti", "s4:Penerbangan", "s4:Delta", "s4:Bank", "s4:rumah", "s4:layanan", "s4:AirAsia",
  "s5:ditarik", "s6:satu", "s6:mode", "s6:menghapus", "s6:Komputer", "s6:kunci", "s6:empat", "s6:digit", "s6:mesin",
  "s7:kurang", "s7:satu", "s7:bandara", "s7:bank", "s7:Kerugian", "s7:sekitar", "s7:lima#2", "s8:merambat", "s8:Menurut"];

const hud = `(()=>{const st=q('#st');const S=[[0,'SINYAL OK','ok'],[AT['s1:software'],'GALAT SISTEM','er'],[K.s2,'11.09 WIB · UPDATE','ok'],[AT['s3:rusak'],'BERKAS RUSAK','er'],[K.s4,'BOOTLOOP','er'],[AT['s5:ditarik'],'UPDATE DITARIK','wa'],[K.s6,'PEMULIHAN MANUAL','wa'],[K.s7,'BUKAN SERANGAN','ok'],[K.s8,'PULIH','ok']];let last='';return (t)=>{let s=S[0];for(const x of S)if(t>=x[0])s=x;if(s[1]!==last){last=s[1];st.textContent='● '+s[1];st.className=s[2];}};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP35_CROWDSTRIKE_LAYAR_BIRU",
  ep: "35", bg: BG, vig: 0.3, grain: 0.05, capfloor: 0.0, html, css, hud, extraAt,
  chipFont: `'JetBrains Mono',Consolas,monospace`, chipColor: INK,
  chip: "ILUSTRASI &middot; BUKAN TAMPILAN LAYAR ASLI",
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-40,skewX:-8},{opacity:1,x:0,skewX:0,duration:.32,ease:'power3.out',immediateRender:false},t);},
 link:(e,t)=>{tl.fromTo(e,{opacity:0,scale:1.5,x:-6},{opacity:1,scale:1,x:0,duration:.22,ease:'power4.in'},t);tl.fromTo(e,{backgroundColor:'${RED}'},{backgroundColor:'${INK}',duration:.6,ease:'none',immediateRender:false},t+1.1);},
 blk:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'block'},t);tl.fromTo(e,{opacity:0,scale:1.25},{opacity:1,scale:1,duration:.22,ease:'power4.in',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in'},t);},`,
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,x:24},{opacity:1,x:0,duration:.3,ease:'power3.out'},a-.02);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,x:-20,duration:.2,ease:'power2.in'},b-.22)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Space Grotesk','Segoe UI',sans-serif;font-weight:700;font-size:70px;line-height:1.06;letter-spacing:-.01em;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.5)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${CYAN}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "CrowdStrike Layar Biru", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
