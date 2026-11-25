// EP36 SINGAPURA MERDEKA SAMBIL MENAHAN TANGIS: HISTORYMAP. A warm documentary map of the Malay Peninsula on an
// archive desk. Singapore island is its own paper piece that lifts and slides apart across the Johor Strait.
// Beats: 1963 federation (14 pins, 581,5 km², 1,82 juta) -> a crack between two party boards (riots 1964) ->
// the secret archive folder (ARSIP AUDIRA, Goh Keng Swee / Tun Razak, 15 JULI 1965) -> 126-0 and the 10.00 radio ->
// a faceless TV press table in black and white -> the archive opens: DIUSIR? struck, DIRUNDINGKAN stamped.
// Panels are cream archive cards. People are name cards and faceless silhouettes only.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CARD = "#F3EAD4", INK = "#1F1A14", RED = "#D7263D", BLUE = "#2A4D8F", GOLD = "#E0B85A", BG = "#120C08";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d, dec = 0) => `<b class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-dec="${dec}">0</b>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@500;600;700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 36", "FAKTA SEJARAH NEGARA")}
  <div class="cd h1">Merdeka sambil<br><em>menahan tangis</em></div>
  <div class="cd date" data-at="s1:sembilan" data-fx="card">9 AGUSTUS 1965</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  ${kk("1963", "PERSEKUTUAN MALAYSIA")}
  ${row("SINGAPURA BERGABUNG", "dengan Malaysia", "s2:bergabung", "bl")}
  <div class="cd stat bl" data-at="s2:Malaysia" data-fx="card"><b>${ct(14, "s2:Malaysia", 1.0)}</b><span>negara bagian</span></div>
  <div class="cd stat rd" data-at="s2:terkecil" data-fx="card"><small>terkecil</small><b class="sm">581,5</b><span>km²</span></div>
  <div class="cd stat rd" data-at="s2:penduduknya" data-fx="card"><small>penduduk terbanyak</small><b class="sm">${ct(1.82, "s2:penduduknya", 2.4, 2)}</b><span>juta</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("1963–1965", "HUBUNGAN MEMBURUK")}
  ${row("PAP &middot; LEE KUAN YEW", "vs pemerintah federal", "s3:Partai", "rd")}
  <div class="cd chips" data-at="s3:soal" data-fx="card"><i data-at="s3:politik" data-fx="fade">politik</i><i data-at="s3:ekonomi" data-fx="fade">ekonomi</i><i data-at="s3:ras" data-fx="fade">ras</i></div>
  <div class="stamp" data-at="s3:kerusuhan" data-fx="stampc">KERUSUHAN RAS 1964</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("KUALA LUMPUR", "PERUNDINGAN RAHASIA")}
  <div class="cd date" data-at="s4:Lima" data-fx="card">15 JULI 1965</div>
  ${row("GOH KENG SWEE", "menteri Singapura, menemui Tun Razak", "s4:Goh", "rd")}
  <div class="stamp" data-at="s4:dirahasiakan" data-fx="stampc">RAHASIA</div>
  <div class="note" data-at="s4:sebagian" data-fx="fade">Dua menteri Singapura baru diberi tahu 7 Agustus</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("9 AGUSTUS 1965", "PARLEMEN MALAYSIA")}
  <div class="cd vote" data-at="s5:seratus" data-fx="card"><b>${ct(126, "s5:seratus-0.4", 0.85)}</b><em>&ndash;</em><b class="z" data-at="s5:nol-0.1" data-fx="fade">0</b><span>setuju pemisahan</span></div>
  ${row("PROKLAMASI", "dibacakan di Radio Singapura, pukul 10.00", "s5:Proklamasi", "gd")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("KONFERENSI PERS TV", "9 AGUSTUS 1965")}
  ${row("LEE KUAN YEW", "menahan tangis dan sempat terdiam", "s6:Lee")}
  <div class="cd q" data-at="s6:sangat" data-fx="card">&ldquo;saat yang sangat pedih&rdquo;<small>&ldquo;a moment of anguish&rdquo;</small></div>
</div>
<div class="p" data-in="s7" data-out="s7:Malaysia">
  ${kk("ARSIP DIBUKA", "DIUSIR ATAU DIRUNDINGKAN?")}
  <div class="cd myth" data-at="s7:mengira" data-fx="card"><s class="x" data-at="s7:Tapi" data-fx="grow"></s>DIUSIR?</div>
  <div class="stamp" data-at="s7:dirundingkan" data-fx="stampc">DIRUNDINGKAN KEDUA PIHAK</div>
  <div class="note" data-at="s7:dibuka" data-fx="fade">Albatross File (Goh Keng Swee), dibuka penuh 2023</div>
</div>
<div class="p" data-in="s7:Malaysia" data-out="s8">
  ${kk("9 AGUSTUS 1965", "PENGAKUAN")}
  ${row("MALAYSIA", "negara pertama yang mengakui Singapura", "s7:Malaysia", "bl")}
</div>
<div class="p" data-in="s8" data-out="@END">
  ${kk("No. 36", "ARSIP AUDIRA")}
  <div class="cd h2">Lahir dari perpisahan<br>yang <em>dirundingkan</em></div>
  <div class="cd q2" data-at="s8:Menurut" data-fx="card">Menurut kamu, apakah perpisahan bisa menjadi awal yang baik?</div>
</div>`;

const css = `
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CARD};border:1px solid rgba(31,26,20,.2);border-radius:3px;box-shadow:0 22px 46px rgba(0,0,0,.55),0 2px 0 rgba(255,255,255,.5) inset}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:26px;line-height:1;letter-spacing:.14em;color:#F0E0B8;background:#1F1A14;padding:13px 22px 12px;border:1px solid ${GOLD};margin-top:26px;margin-bottom:20px;box-shadow:0 10px 24px rgba(0,0,0,.5)}
.kk i{font-style:normal;color:${GOLD};border-right:1px solid ${GOLD};padding-right:16px}
.h1{display:inline-block;padding:18px 34px 22px;border-left:12px solid ${RED};font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:92px;line-height:1.02;color:${INK}}
.h1 em,.h2 em{font-style:italic;color:${RED}}
.h2{display:inline-block;padding:16px 32px 20px;border-left:12px solid ${GOLD};font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:70px;line-height:1.06;color:${INK}}
.date{display:inline-block;margin-top:18px;padding:12px 28px 10px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:56px;letter-spacing:.08em;color:${INK};border-left:12px solid ${GOLD}}
.row{flex-direction:column;margin-top:16px;padding:14px 28px 16px;border-left:12px solid ${GOLD};max-width:880px;box-sizing:border-box}
.row b{display:block;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:44px;line-height:1.1;letter-spacing:.03em;color:${INK}}
.row span{display:block;margin-top:6px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:40px;line-height:1.15;color:#4a3a28}
.row.rd{border-left-color:${RED}}.row.bl{border-left-color:${BLUE}}.row.gd{border-left-color:${GOLD}}
.stat{display:flex;align-items:baseline;gap:18px;width:max-content;max-width:900px;box-sizing:border-box;margin-top:16px;padding:2px 30px 8px;border-left:12px solid ${GOLD}}
.stat b{font-family:'Playfair Display',Georgia,serif;font-weight:800;font-variant-numeric:lining-nums tabular-nums;font-size:120px;line-height:1.04;color:${INK}}
.stat b.sm{font-size:96px}
.stat.bl{border-left-color:${BLUE}}.stat.bl b{color:${BLUE}}
.stat.rd{border-left-color:${RED}}.stat.rd b{color:${RED}}
.stat small,.stat span{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:42px;color:#4a3a28}
.chips{display:flex;gap:14px;width:max-content;margin-top:16px;padding:0;background:none;border:0;box-shadow:none}
.chips i{font-style:normal;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;font-size:38px;color:#F0E0B8;background:rgba(215,38,61,.85);padding:8px 18px}
.vote{display:flex;align-items:baseline;gap:22px;width:max-content;margin-top:16px;padding:0 32px 10px;border-left:12px solid ${GOLD};flex-wrap:wrap;max-width:880px}
.vote b{font-family:'Playfair Display',Georgia,serif;font-weight:800;font-variant-numeric:lining-nums tabular-nums;font-size:150px;line-height:1.04;color:${INK}}
.vote em{font-style:normal;font-family:'Playfair Display',Georgia,serif;font-weight:800;font-size:110px;color:${RED}}
.vote span{flex-basis:100%;margin-top:-12px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:40px;color:#4a3a28}
.note{display:inline-block;margin-top:16px;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:32px;line-height:1.25;color:#F0E4C8;background:rgba(20,15,10,.86);border-left:4px solid ${GOLD};padding:10px 20px;max-width:840px}
.stamp{display:inline-block;margin-top:20px;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:44px;letter-spacing:.12em;color:#FBEFDC;background:${RED};padding:12px 28px 10px;border:3px solid #F0E0B8;transform:rotate(-2deg);box-shadow:0 12px 28px rgba(0,0,0,.55)}
.q{margin-top:18px;padding:16px 30px 20px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:58px;line-height:1.12;color:#F4EEE2;background:#1F1A14;border-left:12px solid ${RED};max-width:860px;box-sizing:border-box}
.q small{display:block;margin-top:8px;font-family:'IBM Plex Mono',Consolas,monospace;font-style:normal;font-weight:500;font-size:28px;color:${GOLD}}
.myth{position:relative;display:inline-block;margin-top:16px;padding:6px 34px 10px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:800;font-size:96px;color:${INK};background:#F2D45C;border-left:12px solid ${INK}}
.myth .x{position:absolute;left:24px;right:20px;top:54%;height:10px;background:${RED};transform-origin:0% 50%}
.q2{margin-top:22px;padding:18px 30px 20px;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:600;font-size:42px;line-height:1.22;color:#F4EEE2;background:#1F1A14;border-left:12px solid ${RED};max-width:860px;box-sizing:border-box}`;

// every anchor world3d.js reads
const WORLD_AT = ["s1:merdeka", "s1:Ini", "s1:Singapura", "s2:Malaysia", "s2:Singapura", "s2:bergabung", "s2:bagian", "s2:terkecil", "s2:penduduknya",
  "s3:memburuk", "s3:Partai", "s3:federal", "s3:berselisih", "s3:1964", "s3:kerusuhan",
  "s4:Lima", "s4:1965", "s4:menteri", "s4:Goh", "s4:Tun", "s4:menemui", "s4:Kuala", "s4:perpisahan", "s4:Perundingan", "s4:dirahasiakan",
  "s5:pemisahan", "s5:suara", "s5:seratus", "s5:enam", "s5:nol", "s5:Proklamasi", "s5:kemerdekaan", "s5:Singapura", "s5:radio", "s5:sepuluh",
  "s6:televisi", "s6:Lee", "s6:menahan", "s6:terdiam", "s7:diusir", "s7:Tapi", "s7:arsip", "s7:dibuka", "s7:dirundingkan", "s7:Malaysia", "s7:pertama", "s7:mengakui",
  "s8:lahir", "s8:perpisahan", "s8:minggu", "s8:AUDIRA"];

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP36_SINGAPURA_MERDEKA_1965",
  ep: "36", bg: BG, vig: 0.42, grain: 0.05, capfloor: 0.45, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: "#F0E0B8",
  chip: "ILUSTRASI &middot; PETA ARSIP REKA ULANG",
  extraAt: WORLD_AT,
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.stat,.vote,.chips')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.35,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power3.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:18},{opacity:1,y:0,duration:.55,ease:'power2.out'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-14,duration:.32,ease:'power2.in'},b-.32)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:58px;line-height:1.16;color:#F4EEE2;text-shadow:0 3px 0 #120c08,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F4EEE2"},{color:"${GOLD}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4EEE2",duration:.16},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.24,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Singapura Merdeka 1965", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
