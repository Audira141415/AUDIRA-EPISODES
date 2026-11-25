// EP11 KOTAK HITAM. INNERWORKS cutaway look: dark teal glass spec-sheet panels with an orange hazard tab and cyan hairlines,
// condensed technical headings, mono data. Panels slide out of a rack like a recorder tray, and leave upward through a shutter.
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const OR = "#FF6A1A", CY = "#3FE6FF", INK = "#0B1418", PAPER = "#F6F1E7";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tab">CARA KERJA VIRAL &middot; EP 11</div>
  <div class="h0">KOTAK<br>HITAM</div>
  <div class="h0b" data-at="s1:oranye" data-fx="stamp">TAPI <b>ORANYE</b></div>
  <div class="sub" data-at="s1:bertahan" data-fx="up">dirancang bertahan saat pesawat hancur</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tab">BERITA MINGGU INI</div>
  <div class="nw" data-at="s2:penyelam" data-fx="left"><i>7 NOV &middot; SERUYAN</i><b>Penyelam TNI AL temukan perekam data heli Mi-17</b></div>
  <div class="nw dim" data-at="s2:Florida" data-fx="left"><i>1 NOV &middot; FLORIDA</i><b>Perekam suara Learjet: keberadaannya belum jelas</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tab">ADA <b class="nb">2</b> PEREKAM</div>
  <div class="two">
    <div class="cd" data-at="s3:data" data-fx="up"><i>PEREKAM DATA</i><b class="nb">&ge; <span class="ct" data-from="0" data-to="88" data-a="s3:minimal" data-d="1.2">0</span></b><span>parameter</span>
      <em data-at="s3:ketinggian" data-fx="pop">ketinggian</em><em data-at="s3:kecepatan" data-fx="pop">kecepatan</em><em data-at="s3:arah" data-fx="pop">arah</em></div>
    <div class="cd o" data-at="s3:Perekam#2" data-fx="up"><i>PEREKAM SUARA</i><b class="sm">KOKPIT</b><span>yang ditangkap:</span>
      <em data-at="s3:pilot" data-fx="pop">pilot</em><em data-at="s3:radio" data-fx="pop">radio</em><em data-at="s3:alarm" data-fx="pop">alarm</em></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tab">REKAMAN BERPUTAR</div>
  <div class="big" data-at="s4:jam" data-fx="up"><b class="nb"><span class="ct" data-from="0" data-to="25" data-a="s4:sekitar" data-d="1.1">0</span> JAM</b><span>terakhir, perekam data</span></div>
  <div class="ln" data-at="s4:ditimpa" data-fx="left"><i class="dotr"></i>data tertua ditimpa yang baru</div>
  <div class="ln" data-at="s4:ekor" data-fx="left"><i class="doto"></i>dipasang di ekor: bagian paling mungkin selamat</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tab">DIBUNGKUS BERLAPIS</div>
  <div class="stp" data-at="s5:Inilah" data-fx="stamp">MODUL MEMORI<br>TAHAN BENTURAN</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tab">UJI KETAHANAN</div>
  <div class="ts" data-at="s6:benturan" data-fx="left"><i>BENTURAN</i><b class="nb"><span class="ct" data-from="0" data-to="3400" data-a="s6:benturan" data-d="0.9">0</span> &times; gravitasi</b></div>
  <div class="ts" data-at="s6:api" data-fx="left"><i>API</i><b class="nb">1.100 &deg;C &middot; &plusmn; 1 jam</b></div>
  <div class="ts" data-at="s6:tekanan" data-fx="left"><i>TEKANAN AIR</i><b class="nb">20.000 kaki</b></div>
  <div class="ln" data-at="s6:oranye" data-fx="left"><i class="doto"></i>oranye: mudah terlihat di antara puing</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tab">PINGER</div>
  <div class="ts" data-at="s7:Sekali" data-fx="left"><i>DENYUT</i><b class="nb">1 kali / detik</b></div>
  <div class="ts" data-at="s7:nada" data-fx="left"><i>NADA</i><b class="nb">37,5 kHz</b><span>tak terdengar telinga manusia</span></div>
  <div class="bat" data-at="s7:selama" data-fx="up"><i>BATERAI</i><div class="bar"><div class="fill" data-at="s7:selama" data-fx="grow"></div></div><b class="nb">30 hari</b></div>
  <div class="bat e" data-at="s7:Aturan" data-fx="up"><i>ATURAN EROPA</i><div class="bar"><div class="fill" data-at="s7:Aturan" data-fx="grow"></div></div><b class="nb">90 hari</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tab">DIBACA DI LABORATORIUM</div>
  <div class="h2" data-at="s8:disusun" data-fx="up">DETIK TERAKHIR<br><b>DISUSUN ULANG</b></div>
  <div class="srcl" data-at="s8:Ikuti" data-fx="fade">Sumber: NTSB (CVR &amp; FDR); 14 CFR 91.609; ANTARA, Kompas.tv &amp; Media Indonesia (7 Nov 2026); CNN Indonesia (3 Nov 2026); Wikipedia (ULB, ED-112). Model 3D adalah ilustrasi generik.</div>
</div>`;

const css = `
.tab{display:inline-block;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:30px;letter-spacing:.14em;color:${INK};background:${OR};padding:5px 16px 4px;margin-bottom:14px;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%)}
.tab b{font-weight:800}
.h0{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:178px;line-height:.86;color:#fff;letter-spacing:.01em;text-shadow:0 8px 30px rgba(0,0,0,.6)}
.h0b{display:inline-block;margin-top:14px;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:96px;line-height:1;color:#fff;background:rgba(8,20,26,.78);border-left:8px solid ${OR};padding:6px 22px 4px}
.h0b b{color:${OR}}
.sub{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:30px;color:${CY};margin-top:14px;text-shadow:0 2px 10px #000}
.nw{background:rgba(8,20,26,.82);border-top:2px solid ${CY};padding:12px 20px;margin-top:12px;width:860px}
.nw.dim{border-top-color:${OR}}
.nw i{display:block;font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:27px;letter-spacing:.06em;color:${CY}}
.nw.dim i{color:${OR}}
.nw b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:54px;line-height:1.04;color:#fff}
.two{display:flex;gap:14px;width:900px}
.cd{flex:1;background:rgba(8,20,26,.82);border-top:4px solid ${CY};padding:12px 18px 16px}
.cd.o{border-top-color:${OR}}
.cd i{display:block;font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:25px;letter-spacing:.06em;color:${CY}}
.cd.o i{color:${OR}}
.cd b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:110px;line-height:1;color:#fff}
.cd b.sm{font-size:84px;line-height:1.3}
.cd>span{display:block;font-family:"IBM Plex Mono",monospace;font-size:24px;color:#cfe9ee;margin-bottom:8px}
.cd em{display:inline-block;font-style:normal;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:34px;color:${INK};background:${PAPER};border-radius:30px;padding:2px 14px;margin:4px 6px 0 0}
.big{background:rgba(8,20,26,.82);border-left:8px solid ${CY};padding:8px 22px 12px;width:720px}
.big b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:150px;line-height:1;color:#fff}
.big>span{display:block;font-family:"IBM Plex Mono",monospace;font-size:28px;color:${CY}}
.ln{font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:44px;line-height:1.1;color:#fff;margin-top:14px;text-shadow:0 2px 12px #000;display:flex;align-items:center;gap:14px;width:900px}
.ln i{flex:none;width:20px;height:20px;border-radius:50%}
.dotr{background:#ff4a3a;box-shadow:0 0 14px #ff4a3a}.doto{background:${OR};box-shadow:0 0 14px ${OR}}
.stp{display:inline-block;margin-top:6px;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:76px;line-height:.98;color:${OR};border:6px solid ${OR};padding:10px 22px;background:rgba(8,20,26,.72);transform:rotate(-3deg)}
.ts{background:rgba(8,20,26,.82);border-left:6px solid ${OR};padding:8px 20px;margin-top:10px;width:760px}
.ts i{display:block;font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:25px;letter-spacing:.08em;color:${OR}}
.ts b{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:72px;line-height:1.02;color:#fff}
.ts>span{display:block;font-family:"IBM Plex Mono",monospace;font-size:25px;color:#cfe9ee}
.bat{display:flex;align-items:center;gap:16px;background:rgba(8,20,26,.82);padding:10px 20px;margin-top:10px;width:760px;border-left:6px solid ${CY}}
.bat i{font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:24px;color:${CY};width:200px}
.bat .bar{flex:1;height:26px;border:2px solid ${CY};padding:3px}
.bat .fill{height:100%;width:33%;background:${CY};transform-origin:0 50%}
.bat.e{border-left-color:${OR}}.bat.e i{color:${OR}}.bat.e .bar{border-color:${OR}}.bat.e .fill{width:100%;background:${OR}}
.bat b{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:54px;color:#fff;width:170px;text-align:right}
.h2{font-family:"Barlow Condensed",sans-serif;font-weight:800;font-size:104px;line-height:.95;color:#fff;text-shadow:0 6px 26px rgba(0,0,0,.8)}
.h2 b{color:${CY}}
.srcl{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:21px;line-height:1.35;color:#e8f4f6;margin-top:14px;width:880px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/hyperframes/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "11", sig: "EP11_KOTAK_HITAM", chip: "ILUSTRASI", panelTop: 262,
  bg: INK, vig: 0.34, grain: 0.035, capfloor: 0.42, html, css,
  extraAt: ["s1:oranye", "s2:penyelam", "s2:Florida", "s3:dua", "s3:parameter", "s3:suara", "s3:alarm",
    "s4:Rekamannya", "s4:ditimpa", "s4:jam", "s4:Keduanya", "s4:ekor", "s5:chip", "s5:blok", "s5:insulasi", "s5:cangkang", "s5:Inilah",
    "s6:benturan", "s6:api", "s6:tekanan", "s6:Warnanya", "s6:puing", "s7:tercebur", "s7:pinger", "s7:Sekali", "s7:Aturan",
    "s8:laboratorium", "s8:dibaca", "s8:disusun"],
  // A panel slides out of a rack like a recorder tray: it moves in from the left while a clip opens from its left edge.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:-70,clipPath:'inset(0 100% 0 0)',opacity:1},{x:0,clipPath:'inset(0 0% 0 0)',duration:.48,ease:'power3.out'},a-.18)`,
  // It leaves through a shutter that closes from the bottom while drifting up.
  panelOut: `(tl,p,b)=>tl.to(p,{y:-40,clipPath:'inset(0 0 100% 0)',duration:.3,ease:'power2.in'},b-.32)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:70px;line-height:1.16;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 6px;margin:0 .1em;border-radius:6px}`,
// Active word: orange hazard tag behind dark text, like the stripe on the recorder.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(255,106,26,0)",textShadow:"0 3px 12px rgba(0,0,0,.95)"},{color:"#0B1418",backgroundColor:"rgba(255,106,26,1)",textShadow:"0 0 0 rgba(0,0,0,0)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(255,106,26,0)",textShadow:"0 3px 12px rgba(0,0,0,.95)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,x:-18},{opacity:1,x:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kotak Hitam", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
