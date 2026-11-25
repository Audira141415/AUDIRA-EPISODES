// EP37 TUVALU, NEGARA KECIL YANG HIDUP DARI DOMAIN .TV: Y2KCHROME. A late-1990s chrome internet world over a Pacific atoll.
// A chrome browser floats in an aqua sky; the ".tv" in its address bar detaches, falls and lands as giant liquid-chrome
// letters standing on Funafuti. The camera then circles the atoll past floating chrome stations (country-code plaques,
// the 1998 contract coin, the Twitch price tag and payment bar, the 8,4% revenue column and the GoDaddy bar), each tied
// to the atoll by a light cable carrying money pulses, and returns as the sea rises, a digital replica appears in a
// bubble and the Falepili arc points to Australia. Company names are plain text only, never logos.
// Panels are glossy Frutiger-aero pills. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const NAVY = "#06306E", BLUE = "#1667D9", AQUA = "#00A3FF", PINK = "#FF5FC4", BG = "#3FB8FF";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d, dec = 0) => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-dec="${dec}">0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@500;700;800&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 37", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Negara yang hidup<br>dari <em>.tv</em></div>
  <div class="cd addr" data-at="s1:negara" data-fx="card"><i>&#9679;</i>Samudra Pasifik</div>
</div>
<div class="p" data-in="s2" data-out="s2:Titik">
  ${kk("01", "TUVALU")}
  <div class="cd stat" data-at="s2:Sembilan" data-fx="card"><b>9</b><span>pulau karang</span></div>
  <div class="cd stat" data-at="s2:dua-0.45" data-fx="card"><small>&plusmn;</small><b>${ct(26, "s2:dua-0.45", 0.5)}</b><span>km&sup2; daratan</span></div>
  <div class="cd stat" data-at="s2:sepuluh-0.4" data-fx="card"><b>${ct(10643, "s2:sepuluh-0.4", 0.6)}</b><span>jiwa &middot; sensus 2022</span></div>
</div>
<div class="p" data-in="s2:Titik" data-out="s3">
  ${kk("01", "TITIK TERTINGGI")}
  <div class="cd mega" data-at="s2:empat-0.45" data-fx="card"><b>${ct(4.6, "s2:empat-0.45", 0.5, 1)}</b><small>meter</small></div>
  <div class="note" data-at="s2:atas" data-fx="fade">di atas permukaan laut</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "KODE INTERNET NEGARA")}
  ${row("2 HURUF", "untuk setiap negara", "s3:dua")}
  <div class="codes"><i class="cc" data-at="s3:.id" data-fx="stampc">.id <s>Indonesia</s></i><i class="cc" data-at="s3:.jp" data-fx="stampc">.jp <s>Jepang</s></i><i class="cc tv" data-at="s3:.tv" data-fx="stampc">.tv <s>Tuvalu</s></i></div>
  <div class="note" data-at="s3:televisi" data-fx="fade">kebetulan: tv = <b>televisi</b></div>
</div>
<div class="p" data-in="s4" data-out="s4:Kontraknya">
  ${kk("03", "TAHUN 1998")}
  ${row("PERUSAHAAN KANADA", "Information.CA, Toronto", "s4:perusahaan")}
  <div class="cd mega" data-at="s4:lima-0.45" data-fx="card"><small>US$</small><b>${ct(50, "s4:lima-0.45", 0.5)}</b><small>juta</small></div>
  <div class="note" data-at="s4:mengelola" data-fx="fade">untuk mengelola .tv</div>
</div>
<div class="p" data-in="s4:Kontraknya" data-out="s5">
  ${kk("03", "BERPINDAH TANGAN")}
  ${row("KONTRAK .tv", "pembayaran tertunda, kontrak beralih", "s4:Kontraknya")}
  ${row("VERISIGN", "membeli pengelola .tv, 2001", "s4:Verisign", "pk")}
</div>
<div class="p" data-in="s5" data-out="s5:Tuvalu">
  ${kk("04", "TAHUN 2014")}
  ${row("AMAZON MEMBELI TWITCH", "situs berakhiran .tv", "s5:Amazon")}
  <div class="cd mega" data-at="s5:satu-0.4" data-fx="card"><small>US$</small><b>${ct(1, "s5:satu-0.4", 0.4)}</b><small>miliar</small></div>
</div>
<div class="p" data-in="s5:Tuvalu" data-out="s6">
  ${kk("04", "KONTRAK DIRUNDINGKAN ULANG")}
  ${row("BAYARAN NAIK", "untuk Tuvalu", "s5:naik")}
  <div class="cd stat" data-at="s5:lima-0.45" data-fx="card"><small>&plusmn;US$</small><b>${ct(5, "s5:lima-0.45", 0.45)}</b><span>juta / tahun</span></div>
</div>
<div class="p" data-in="s6" data-out="s6:Lalu">
  ${kk("05", "TAHUN 2019")}
  <div class="cd mega" data-at="s6:delapan-0.45" data-fx="card"><b>${ct(8.4, "s6:delapan-0.45", 0.9, 1)}</b><small>%</small></div>
  ${row("PENDAPATAN PEMERINTAH", "disumbang royalti .tv", "s6:pendapatan")}
</div>
<div class="p" data-in="s6:Lalu" data-out="s7">
  ${kk("05", "TAHUN 2021")}
  ${row("GODADDY MENGAMBIL ALIH", "pengelola .tv sejak Desember 2021", "s6:GoDaddy")}
  <div class="cd stat pk" data-at="s6:sepuluh-0.45" data-fx="card"><small>US$</small><b>${ct(10, "s6:sepuluh-0.45", 0.45)}</b><span>juta / tahun</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Kalau">
  ${kk("06", "ANCAMAN TERBESAR")}
  ${row("LAUT TERUS NAIK", "titik tertinggi hanya 4,6 m", "s7:laut")}
  ${row("SALINAN DIGITAL", "rencana diumumkan 2022", "s7:salinan")}
  ${row("FALEPILI UNION", "perjanjian dengan Australia, 2023", "s7:perjanjian", "pk")}
</div>
<div class="p" data-in="s7:Kalau" data-out="s8">
  ${kk("06", "KALAU NEGARANYA HILANG")}
  <div class="stamp" data-at="s7:dihapus-0.3" data-fx="stampc">.tv bisa ikut dihapus</div>
  <div class="note" data-at="s7:hilang" data-fx="fade">kode negara bisa dipensiunkan ICANN</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  ${kk("07", "AUDIRA")}
  <div class="cd h2">Hidup dari<br><em>dua huruf</em></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Kode domain negara mana lagi yang artinya lucu? Tulis di komentar.</div>
</div>`;

const SY = `Syne,'Trebuchet MS',sans-serif`, JB = `'JetBrains Mono',Consolas,monospace`;
const gloss = `background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.72) 48%,rgba(205,240,255,.74) 52%,rgba(255,255,255,.86) 100%);border:3px solid rgba(255,255,255,.98);box-shadow:0 14px 34px rgba(0,60,150,.32),inset 0 -6px 14px rgba(0,150,255,.2)`;
const gradText = `background:linear-gradient(180deg,#0B3C9C 0%,#1667D9 46%,#00A3FF 54%,#0B4FB8 100%);-webkit-background-clip:text;background-clip:text;color:transparent`;
const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;${gloss};border-radius:34px}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:800;font-size:25px;line-height:1;letter-spacing:.12em;color:${NAVY};${gloss};border-radius:999px;padding:13px 26px 12px;margin-bottom:20px}
.kk i{font-style:normal;color:#fff;background:linear-gradient(180deg,#3FB8FF,#1259E8);border-radius:999px;padding:6px 14px;letter-spacing:.06em}
.h1{display:inline-block;padding:20px 36px 24px;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:800;font-size:88px;line-height:.98;letter-spacing:-.01em}
.h1,.h2{color:${NAVY}}
.h1 em,.h2 em{font-style:normal;${gradText};filter:drop-shadow(0 0 2px #fff)}
.h2{display:inline-block;padding:18px 34px 22px;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:800;font-size:80px;line-height:1.0}
.addr{display:inline-flex;align-items:center;gap:16px;margin-top:18px;padding:12px 28px;border-radius:999px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:38px;color:${NAVY}}
.addr i{font-style:normal;color:${AQUA};font-size:26px}
.row{flex-direction:column;margin-top:16px;padding:14px 32px 16px;max-width:880px;box-sizing:border-box;border-left:14px solid ${AQUA}}
.row b{display:block;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:800;font-size:44px;line-height:1.08;letter-spacing:.01em;color:${NAVY}}
.row span{display:block;margin-top:4px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:500;font-size:32px;line-height:1.2;color:#1d4f8c}
.row.pk{border-left-color:${PINK}}
.mega,.stat{display:flex;align-items:baseline;gap:18px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:16px;padding:6px 34px 12px;border-left:14px solid ${AQUA}}
.mega b,.stat b{font-family:'JetBrains Mono',Consolas,monospace;font-weight:800;font-variant-numeric:tabular-nums;font-size:138px;line-height:1.04;letter-spacing:-.03em;${gradText}}
.stat b{font-size:96px}
.stat.pk{border-left-color:${PINK}}
.mega small,.stat small,.stat span{font-family:Syne,'Trebuchet MS',sans-serif;font-weight:700;font-size:44px;color:${NAVY}}
.stat span{font-size:38px}
.codes{display:flex;gap:16px;margin-top:18px;flex-wrap:wrap}
.cc{display:inline-flex;align-items:baseline;gap:12px;font-style:normal;font-family:'JetBrains Mono',Consolas,monospace;font-weight:800;font-size:56px;color:${BLUE};${gloss};border-radius:26px;padding:8px 24px 10px}
.cc s{text-decoration:none;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:700;font-size:28px;color:${NAVY}}
.cc.tv{color:#fff;background:linear-gradient(180deg,#5FD0FF 0%,#1E7FE8 50%,#1259E8 52%,#3FA0FF 100%)}
.cc.tv s{color:#E9FBFF}
.note{display:inline-block;margin-top:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:32px;line-height:1.25;color:#fff;background:linear-gradient(180deg,rgba(18,89,232,.88),rgba(6,48,110,.88));border:2px solid rgba(255,255,255,.8);border-radius:22px;padding:10px 24px;max-width:860px}
.note b{color:#FFE45C}
.stamp{display:inline-block;margin-top:18px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:800;font-size:50px;color:#fff;background:linear-gradient(180deg,#FF8AD8 0%,#E8399E 50%,#C81E85 52%,#F05CB8 100%);border:3px solid #fff;border-radius:999px;padding:12px 34px;box-shadow:0 14px 30px rgba(120,0,80,.35)}
.q{margin-top:22px;padding:18px 32px 22px;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:700;font-size:42px;line-height:1.2;color:#fff;background:linear-gradient(180deg,#3FB8FF 0%,#1667D9 50%,#1259E8 52%,#2F8BFF 100%);border:3px solid #fff;max-width:880px;box-sizing:border-box}`;

for (const f of ["../_tools/lib3d.js", "world3d.js", "RoomEnvironment.js"]) copyFileSync(f, "PROJECT/HyperFrames_Remotion/assets/lib/" + f.split("/").pop());
const { AT, K } = writeWorld(TL, at, { sig: "EP37_TUVALU_DOMAIN_TV",
  ep: "37", bg: BG, vig: 0.16, grain: 0.035, capfloor: 0.22, html, css, chipFont: JB, chipColor: "#FFFFFF",
  chip: "ILUSTRASI 3D &middot; BUKAN SKALA PETA",
  extraAt: [".tv", "negara", "Pasifik"].map((w) => "s1:" + w)
    .concat(["Tuvalu", "Sembilan", "dua", "penduduk", "sepuluh", "Titik", "empat", "atas"].map((w) => "s2:" + w))
    .concat(["kode", ".id", ".jp", ".tv", "televisi", "Indonesia"].map((w) => "s3:" + w))
    .concat(["1998", "perusahaan", "lima", "Kontraknya", "berpindah", "Verisign", "mengelola"].map((w) => "s4:" + w))
    .concat(["2014", "Amazon", "Twitch", "satu", "Tuvalu", "naik", "lima", "per"].map((w) => "s5:" + w))
    .concat(["2019", ".tv", "delapan", "persen", "Lalu", "2021", "GoDaddy", "sepuluh"].map((w) => "s6:" + w))
    .concat(["Uang", "laut", "naik", "salinan", "perjanjian", "Australia", "Kalau", "hilang", ".tv", "dihapus"].map((w) => "s7:" + w))
    .concat(["Negara", "dua", "Menurut", "Ikuti", "AUDIRA"].map((w) => "s8:" + w)),
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.stat,.addr')?(e.matches('.addr')?'inline-flex':'flex'):'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:24,scale:.94},{opacity:1,y:0,scale:1,duration:.48,ease:'back.out(1.6)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-flex'},t);tl.fromTo(e,{scale:.6,opacity:0},{scale:1,opacity:1,duration:.4,ease:'back.out(2.2)',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:26,scale:.97},{opacity:1,y:0,scale:1,duration:.5,ease:'power3.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-18,duration:.3,ease:'power2.in'},b-.3)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Syne,'Trebuchet MS',sans-serif;font-weight:800;font-size:58px;line-height:1.16;color:#FFFFFF;text-shadow:0 4px 0 #06306E,0 0 16px rgba(6,48,110,.9),0 0 4px rgba(6,48,110,1)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"#FFE45C",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tuvalu dan Domain .tv", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
