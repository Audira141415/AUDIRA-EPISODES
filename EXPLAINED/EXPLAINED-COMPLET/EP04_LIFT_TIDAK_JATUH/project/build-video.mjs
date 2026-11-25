// EP04 LIFT TIDAK JATUH / URBANFORGE. A plaster-white architectural maquette city in low evening sun; the camera glides
// between four model stations (AUDIRA tower, 1852 factory, 1854 exhibition hall, 1857 store). Panels are architectural
// drawing title blocks that open with a section-cut wipe. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1f1e1c", OR = "#ff5a1f", PAPER = "#f4f1ea", WH = "#ffffff";

const row = (a, txt, cls = "") => `<b class="rw ${cls}" data-at="${a}" data-fx="lit" data-c="${cls === "wr" ? "#b2391a" : cls === "q" ? OR : INK}"><s class="sq"></s>${txt}</b>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="meta"><span>CARA KERJA BENDA</span><span class="r">EP 04 &middot; LIFT</span></div>
  <div class="ttl">TALI PUTUS,<br><em>LIFT TIDAK JATUH</em></div>
  <div class="rows">${row("s1:tidak", "Kabin tidak langsung jatuh")}${row("s1:dramatis", "Rahasianya dipamerkan tahun 1854")}</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="meta"><span>1852 &middot; PABRIK DI NEW YORK</span><span class="r">A-01</span></div>
  <div class="ttl sm">ELISHA OTIS</div>
  <div class="rows">${row("s2:butuh", "Pabrik butuh alat angkat mesin berat")}${row("s2:berbahaya", "Berbahaya kalau talinya putus", "wr")}</div>
</div>
<div class="p" data-in="s3" data-out="s3:Tahun">
  <div class="meta"><span>PENEMUAN OTIS</span><span class="r">A-02</span></div>
  <div class="ttl sm">ALAT <em>PENGAMAN</em></div>
  <div class="rows">${row("s3:otomatis", "Otomatis menghentikan lift")}${row("s3:pengangkatnya", "kalau tali pengangkatnya putus")}</div>
</div>
<div class="p" data-in="s3:Tahun" data-out="s4">
  <div class="meta"><span>CRYSTAL PALACE, NEW YORK</span><span class="r">A-03</span></div>
  <div class="ttl sm">PAMERAN <em>1854</em></div>
  <div class="rows">${row("s3:pameran", "Dipamerkan di pameran Crystal Palace")}${row("s3:menantang", "Aksi yang menantang maut", "wr")}</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="meta"><span>TIGA TAHUN KEMUDIAN</span><span class="r">A-04</span></div>
  <div class="ttl sm"><em>1857</em> &middot; TOKO</div>
  <div class="rows">${row("s4:penumpang", "Lift penumpang pertama dengan pengaman")}${row("s4:Prinsip", "Prinsipnya masih dipakai sampai sekarang")}</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="meta"><span>LIFT TRAKSI MODERN</span><span class="r">B-01</span></div>
  <div class="ttl sm">GESEKAN <em>PENGGERAKNYA</em></div>
  <div class="rows">${row("s5:puli", "Tali baja melintasi puli beralur")}${row("s5:pemberat", "Pemberat mengimbangi berat kabin")}${row("s5:rel", "Keduanya meluncur di rel pemandu")}</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="meta"><span>ALAT PENGAMAN</span><span class="r">B-02</span></div>
  <div class="ttl sm"><em>GOVERNOR</em></div>
  <div class="rows">${row("s6:temuan", "Juga temuan Otis")}${row("s6:bekerja", "Kabin jatuh bebas? Governor menghentikannya", "wr")}</div>
</div>
<div class="p" data-in="s7" data-out="s7:Tahun">
  <div class="meta"><span>REM MOTOR</span><span class="r">B-03</span></div>
  <div class="ttl sm">LISTRIK PADAM,<br><em>REM MENGUNCI</em></div>
  <div class="rows">${row("s7:terbuka", "Ditahan terbuka oleh listrik")}${row("s7:pegas", "Ditutup oleh pegas")}</div>
</div>
<div class="p" data-in="s7:Tahun" data-out="s8">
  <div class="meta"><span>2007 &middot; SEATTLE</span><span class="r">B-04</span></div>
  <div class="ttl sm">LIFT RUMAH <em>SAKIT ANAK</em></div>
  <div class="rows">${row("s7:putus", "Tali putus, kabin jatuh", "wr")}${row("s7:governor", "sampai governor menghentikannya")}</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="meta"><span>CARA KERJA BENDA</span><span class="r">EP 04</span></div>
  <div class="ttl sm">DIRANCANG UNTUK<br><em>BERHENTI</em></div>
  <div class="rows">${row("s8:salah", "Berhenti saat ada yang salah")}${row("s8:takut", "Kamu masih takut naik lift?", "q")}</div>
</div>`;

const css = `
.p{background:rgba(244,241,234,.94);border:3px solid ${INK};border-radius:4px;padding:22px 30px 26px;box-shadow:10px 12px 0 rgba(31,30,28,.18)}
.p:before,.p:after{content:"";position:absolute;width:26px;height:26px;border:3px solid ${OR}}
.p:before{left:-12px;top:-12px;border-right:none;border-bottom:none}
.p:after{right:-12px;bottom:-12px;border-left:none;border-top:none}
.meta{display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:30px;letter-spacing:.06em;color:#3a3835;border-bottom:2px solid ${INK};padding-bottom:10px;margin-bottom:12px}
.meta .r{color:${OR};font-weight:700}
.ttl{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:96px;line-height:.95;letter-spacing:.005em;color:${INK}}
.ttl.sm{font-size:82px}
.ttl em{font-style:normal;color:${OR}}
.rows{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.rw{display:block;font-family:'Barlow',sans-serif;font-weight:600;font-size:38px;line-height:1.16;color:${INK}}
.rw.q{font-weight:700}
.sq{display:inline-block;width:15px;height:15px;background:#8f8a83;margin-right:16px;vertical-align:5px}
#chip{font-family:'IBM Plex Mono',monospace;font-size:19px;font-weight:600;color:#fff;letter-spacing:.08em;background:rgba(31,30,28,.62);padding:5px 12px;border-radius:3px}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: "#c9b292", vig: 0.22, grain: 0.04, capfloor: 0.12, html, css, chipFont: "'IBM Plex Mono',monospace", chipColor: "#fff", sig: "EP04_LIFT_TIDAK_JATUH",
  extraAt: ["s1:putus", "s1:tidak", "s1:jatuh", "s1:dramatis",
    "s2:Elisha", "s2:butuh", "s2:berat", "s2:pabrik", "s2:mesin", "s2:putus",
    "s3:pengaman", "s3:otomatis", "s3:putus", "s3:Tahun", "s3:memamerkannya", "s3:Crystal", "s3:menantang", "s3:maut",
    "s4:penumpang", "s4:toko", "s4:Prinsip",
    "s5:ditarik", "s5:puli", "s5:Gesekan", "s5:menggerakkan", "s5:pemberat", "s5:rel",
    "s6:governor", "s6:temuan", "s6:jatuh", "s6:bekerja", "s6:menghentikannya",
    "s7:ditahan", "s7:terbuka", "s7:listrik", "s7:pegas", "s7:padam", "s7:mengunci", "s7:Tahun", "s7:Seattle", "s7:putus", "s7:governor", "s7:menghentikannya",
    "s8:salah", "s8:takut", "s8:Ikuti", "s8:AUDIRA"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0% 100% 0% 0%)',x:-24,opacity:1},{clipPath:'inset(0% 0% 0% 0%)',x:0,opacity:1,duration:.5,ease:'power3.out'},a-.1);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 0% 100%)',x:24,duration:.3,ease:'power2.in'},b-.3)`,
  fxExtra: `lit:(e,t)=>{tl.fromTo(e,{opacity:.88,color:'#2a2927'},{opacity:1,color:e.dataset.c||'#1f1e1c',duration:.3,ease:'power2.out'},t);const sq=e.querySelector('.sq');if(sq)tl.fromTo(sq,{backgroundColor:'#8f8a83',scale:1},{backgroundColor:'#ff5a1f',scale:1.25,duration:.25,ease:'back.out(2)'},t);},`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Barlow',sans-serif;font-weight:700;font-size:56px;line-height:1.16;color:${WH};background:rgba(22,21,20,.86);border-left:6px solid ${OR};border-radius:4px;padding:12px 28px 15px;box-shadow:0 14px 40px rgba(0,0,0,.22)}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WH}",scale:1},{color:"${OR}",scale:1.04,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WH}",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:10},{opacity:1,y:0,duration:.06,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Lift Tidak Jatuh", "#c9b292");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
