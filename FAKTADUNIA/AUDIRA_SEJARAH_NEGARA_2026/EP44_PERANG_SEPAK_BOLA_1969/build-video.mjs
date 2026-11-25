// EP44 PERANG SEPAK BOLA: TACTICBOARD. A football tactics board whose pitch, by a gold ripple from the ball, becomes a
// war map of Central America. El Salvador (teal edge) and Honduras (amber edge) are grass tiles; migrants are pawns;
// an LED 5x7 scoreboard counts 0-1, 3-0, 3-2 and later 100 JAM. Batch-9 ripple device: a row of tactic magnets
// (BOLA -> KERUSUHAN -> HUBUNGAN PUTUS -> PERANG 100 JAM -> PENGUNGSI -> PERANG SAUDARA), each sending a ring.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TEAL = "#2FD6C3", AMB = "#FFB23E", YEL = "#FFE27A", GOLD = "#FFC94A", COR = "#FF6B4A", INK = "#07101E", BG = "#070B14", NAVY = "#1B3C8C";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const BALL = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#F6F7F8" stroke="#15181D" stroke-width="2"/><path d="M20 12l7 5-3 8h-8l-3-8z" fill="#15181D"/><path d="M20 12V3M27 17l8-3M24 25l5 8M16 25l-5 8M13 17l-8-3" stroke="#15181D" stroke-width="2"/></svg>`;
const tok = (id, chip, label, a, cls = "", extra = "") => `<div class="tk ${cls}" id="${id}" data-at="${a}" data-fx="tok"><i class="rp" data-at="${a}" data-fx="rip"></i><i class="ck">${chip}</i><span>${label}</span>${extra}</div>`;
const ar = (a) => `<i class="ar" data-at="${a}" data-fx="arw"></i>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@700&display=block">
<div class="pre"><span style="font-family:'Anton',sans-serif">HONDURAS 1969</span><span style="font-family:'Barlow Condensed',sans-serif;font-weight:700">AUDIRA</span><span style="font-family:'Barlow Condensed',sans-serif;font-weight:600">honduras</span><span style="font-family:'JetBrains Mono',monospace;font-weight:700">AUDIRA 1</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Tahun">
  ${kk("EP 44", "FAKTA SEJARAH NEGARA")}
  <div class="h1">PERANG<br><em>SEPAK BOLA</em></div>
  <div class="vs"><i class="es">EL SALVADOR</i><b>vs</b><i class="hn">HONDURAS</i><span>1969</span></div>
  <div class="chips"><i class="ch" data-at="s1:berperang" data-fx="stampc">3 LAGA → PERANG</i><i class="ch2" data-at="s1:korek" data-fx="stampc">BOLA = KOREK API</i></div>
</div>
<div class="p" data-in="s2:Tahun" data-out="s3">
  ${kk("01", "AMERIKA TENGAH · 1969")}
  ${row("EL SALVADOR: KECIL, PADAT", "", "s2:kecil", "es")}
  ${row("HONDURAS: 5× LEBIH LUAS", "", "s2:lima", "hn")}
  <div class="cd row es" data-at="s2:Lebih" data-fx="card"><b>&gt; <span class="ct" data-from="0" data-to="300000" data-a="s2:tiga" data-d="1.0">300.000</span> WARGA EL SALVADOR</b><span>pindah ke Honduras untuk bertani dan bekerja</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "REFORMA AGRARIA HONDURAS")}
  ${row("TANAH PENDATANG DIAMBIL", "dibagikan ke warga asli", "s3:diambil", "hn")}
  ${row("RIBUAN KELUARGA TERUSIR", "", "s3:Ribuan", "rd")}
  ${row("KETEGANGAN MEMUNCAK", "", "s3:Ketegangan", "rd")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "KUALIFIKASI PIALA DUNIA")}
  ${row("LAGA 1 · HONDURAS MENANG 1–0", "di kandang, Tegucigalpa", "s4:satu", "hn")}
  ${row("LAGA 2 · EL SALVADOR MENANG 3–0", "di San Salvador", "s4:tiga", "es")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "LAGA PENENTU · MEKSIKO")}
  ${row("EL SALVADOR MENANG 3–2", "lewat perpanjangan waktu", "s5:dua", "es")}
  ${row("HUBUNGAN DIPLOMATIK PUTUS", "di hari yang sama", "s5:memutus", "rd")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "14 JULI 1969 · PERANG")}
  ${row("PESAWAT MENYERANG BANDARA", "pasukan El Salvador masuk ke Honduras", "s6:menyerang", "rd")}
  ${row("PERTEMPURAN UDARA TERAKHIR", "antar pesawat tempur baling-baling", "s6:terakhir", "am")}
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "PERANG ±100 JAM")}
  ${row("GENCATAN SENJATA", "Organisasi Negara-Negara Amerika (OAS)", "s7:gencatan", "wh")}
  ${row("RATUSAN SAMPAI RIBUAN TEWAS", "kebanyakan warga sipil", "s7:ratusan", "gy")}
  ${row("PULUHAN RIBU TERUSIR PULANG", "satu dekade kemudian: perang saudara", "s7:Puluhan", "rd")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "DAMAI BARU TAHUN 1980")}
  ${row("BOLA HANYA PEMICU", "", "s8:Bolanya", "yl")}
  ${row("BENSINNYA: TANAH · KEMISKINAN · MIGRASI", "", "s8:Bensinnya", "rd")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Kenapa rivalitas olahraga bisa sepanas itu? Tulis di komentar!</div>
</div>
<div class="p" id="chain" data-in="s4:kualifikasi" data-out="s8:Menurut">
  <div class="cap6">RIAK DARI SATU BOLA</div>
  <div class="row6">
    ${tok("t0", BALL, "BOLA<br>3 LAGA", "s4:kualifikasi", "ball", `<i class="pm" data-at="s8:pemicu" data-fx="stampc">PEMICU</i>`)}
    ${ar("s4:Kerusuhan")}
    ${tok("t1", "1", "KERUSUHAN", "s4:Kerusuhan")}
    ${ar("s5:memutus")}
    ${tok("t2", "2", "HUBUNGAN<br>PUTUS", "s5:memutus")}
    ${ar("s6:menyerang")}
    ${tok("t3", "3", "PERANG<br>100 JAM", "s6:menyerang", "war")}
    ${ar("s7:terusir")}
    ${tok("t4", "4", "PENGUNGSI<br>PULANG", "s7:terusir")}
    ${ar("s7:saudara")}
    ${tok("t5", "5", "PERANG<br>SAUDARA", "s7:saudara", "war")}
  </div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:rgba(7,16,30,.88);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:25px;letter-spacing:.06em;color:#E8F0F8;margin-bottom:16px;padding:7px 18px 7px 7px;background:rgba(7,16,30,.86);border:2px solid ${YEL};border-radius:8px}
.kk i{font-style:normal;background:${YEL};color:${INK};padding:3px 10px;border-radius:4px}
.h1{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:132px;line-height:.96;letter-spacing:.01em;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.75)}
.h1 em{font-style:normal;color:${YEL}}
.vs{display:flex;align-items:center;gap:12px;margin-top:14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:44px;color:#fff}
.vs i{font-style:normal;padding:4px 16px;border-radius:6px;background:${NAVY}}
.vs .es{box-shadow:inset 0 -9px 0 ${TEAL}}.vs .hn{box-shadow:inset 0 -9px 0 ${AMB}}
.vs b{font-size:32px;color:#C9D6E2}.vs span{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:30px;color:${YEL};margin-left:6px;background:rgba(7,16,30,.86);padding:6px 12px;border-radius:6px}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px;align-items:center}
.ch,.ch2{font-style:normal;font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:46px;line-height:1;letter-spacing:.03em;padding:12px 22px 10px;border-radius:8px;transform:rotate(-3deg);box-shadow:0 10px 26px rgba(0,0,0,.5)}
.ch{color:#fff;background:${COR}}.ch2{color:${INK};background:${YEL}}
.row{flex-direction:column;margin-top:14px;padding:9px 24px 11px 24px;border-left:14px solid ${YEL};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:54px;line-height:1.02;letter-spacing:.015em;color:#fff}
.row span{display:block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:31px;line-height:1.2;color:#BFD3E6}
.row b span{display:inline;font:inherit;color:inherit}
.row.es{border-left-color:${TEAL}}.row.hn{border-left-color:${AMB}}.row.am{border-left-color:${GOLD}}.row.am b{color:#FFD27A}
.row.rd{border-left-color:#FF5A48}.row.rd b{color:#FF8E7E}.row.wh{border-left-color:#F4F7F2}.row.gy{border-left-color:#8D99A6}.row.gy b{color:#DCE3EA}
.row.yl{border-left-color:${YEL}}.row.yl b{color:${YEL}}
.q{margin-top:20px;padding:16px 26px 14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:58px;line-height:1.04;color:#fff;border-left:14px solid ${YEL};max-width:860px}
#chain.p{top:1070px;left:48px;right:40px}
.cap6{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:20px;letter-spacing:.1em;color:${YEL};background:rgba(7,16,30,.86);padding:4px 10px;border-radius:5px;margin-bottom:8px}
.row6{display:flex;align-items:flex-start}
.tk{position:relative;width:140px;display:flex;flex-direction:column;align-items:center}
.ck{position:relative;width:92px;height:92px;border-radius:50%;box-sizing:border-box;background:${NAVY};border:6px solid #EEF1F4;box-shadow:0 7px 0 #9AA5B4,0 12px 18px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font-style:normal;font-family:'Anton',Impact,sans-serif;font-size:46px;color:#fff}
.tk.war .ck{border-color:#FF8E7E;background:#6E1C1C}
.tk.ball .ck{background:#0E1B30;border-color:${YEL}}.tk.ball .ck svg{width:70px;height:70px}
.tk span{margin-top:12px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:26px;line-height:1.0;letter-spacing:.03em;color:#fff;text-align:center;background:rgba(7,16,30,.86);padding:4px 8px;border-radius:5px}
.rp{position:absolute;left:24px;top:0;width:92px;height:92px;border-radius:50%;border:5px solid ${GOLD};box-sizing:border-box;opacity:0;font-style:normal;margin:0}
.ar{width:22px;height:92px;flex:none;font-style:normal;background:no-repeat center/22px 22px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath d='M3 4l12 7-12 7' fill='none' stroke='%23FFE27A' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");margin:0 -6px}
.pm{position:absolute;top:-26px;left:6px;font-style:normal;font-family:'Anton',Impact,sans-serif;font-size:26px;line-height:1;color:${INK};background:${YEL};padding:5px 10px 3px;border-radius:5px;transform:rotate(-6deg)}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP44_PERANG_SEPAK_BOLA_1969",
  ep: "44", bg: BG, vig: 0.34, grain: 0.04, capfloor: 0.0, html, css, chipFont: `'JetBrains Mono',Consolas,monospace`, chipColor: "#BFD3E6",
  chip: "ILUSTRASI TAKTIS &middot; BIDAK, BUKAN FOTO ASLI",
  extraAt: ["s1:Tiga", "s1:pertandingan", "s1:bola", "s1:dua", "s1:negara", "s1:berperang", "s1:korek", "s1:apinya",
    "s2:Amerika", "s2:El", "s2:kecil", "s2:Honduras", "s2:lima", "s2:kali", "s2:Lebih", "s2:tiga", "s2:bertani",
    "s3:diambil", "s3:terusir", "s3:Ketegangan",
    "s4:kualifikasi", "s4:Honduras", "s4:satu", "s4:El", "s4:tiga", "s4:membalas", "s4:Kerusuhan",
    "s5:digelar", "s5:Meksiko", "s5:dua", "s5:Di", "s5:memutus", "s5:diplomatik",
    "s6:pesawat", "s6:menyerang", "s6:bandara", "s6:pasukan", "s6:Ini", "s6:terakhir",
    "s7:seratus", "s7:gencatan", "s7:ratusan", "s7:Puluhan", "s7:terusir", "s7:memicu", "s7:saudara",
    "s8:Perjanjian", "s8:Bolanya", "s8:pemicu", "s8:Bensinnya", "s8:tanah", "s8:kemiskinan", "s8:migrasi", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,x:-50},{opacity:1,x:0,duration:.36,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.2,ease:'power4.in',immediateRender:false},t);},
 tok:(e,t)=>{tl.fromTo(e,{opacity:0,y:-60,scale:.6},{opacity:1,y:0,scale:1,duration:.38,ease:'back.out(2)',immediateRender:false},t);},
 rip:(e,t)=>{for(let k=0;k<2;k++)tl.fromTo(e,{opacity:.95,scale:.9},{opacity:0,scale:2.3,duration:.8,ease:'power2.out',immediateRender:false},t+.12+k*.32);},
 arw:(e,t)=>{tl.fromTo(e,{opacity:0,x:-14},{opacity:1,x:0,duration:.25,ease:'power2.out',immediateRender:false},t-.15);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-30},{opacity:1,y:0,duration:.36,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-24,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:76px;line-height:1.02;letter-spacing:.01em;color:#fff;-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 6px 18px rgba(0,0,0,.7)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Perang Sepak Bola", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
