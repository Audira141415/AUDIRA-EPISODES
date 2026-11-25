// EP42 TAMBORA, TAHUN TANPA MUSIM PANAS: WORLDFORGE. A colossal 3D Sumbawa: Tambora erupting over the Sanggar
// peninsula, the cone collapsing from ±4.300 m to 2.851 m, pyroclastic clouds over the foot villages, ash on the sawah.
// Then a globe where the boom rings out to Batavia and the sulfur veil wraps the planet, a snowy June field and an
// empty grain market (1816), cholera out of Bengal, and a rain-lashed Swiss villa window where "Frankenstein" is
// written. Batch-9 signature: a topographic "ripple" band (contour rings from a volcano glyph, one survey pin per
// consequence) that grows as the narrator names each step. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const EMB = "#FF7A2F", CRE = "#FFF3E2", ICE = "#A9DBFF", SUL = "#E9D27A", INK = "#16110E", BG = "#2A1D16";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (from, to, a, d, dec = 0) => `<b class="ct nb" data-from="${from}" data-to="${to}" data-a="${a}" data-d="${d}" data-dec="${dec}">${from}</b>`;

// ripple band: contour rings from a volcano glyph, pins alternate top/bottom rows
const PINS = [
  ["01", "DENTUMAN", "s2:Dentumannya"], ["02", "ABU", "s4:Abu"], ["03", "BELERANG", "s5:belerang"], ["04", "SALJU JUNI", "s6:Salju"],
  ["05", "GAGAL PANEN", "s6:Panen"], ["06", "KOLERA", "s6:kolera"], ["07", "FRANKENSTEIN", "s7:Frankenstein"],
];
const CX = 46, CY = 80, R0 = 122, DR = 108;
const rings = PINS.map((p, i) => `<circle class="rg" cx="${CX}" cy="${CY}" r="${R0 + i * DR}" data-at="${p[2]}" data-fx="ring"/>`).join("");
const pins = PINS.map((p, i) => `<div class="pin ${i % 2 ? "lo" : "hi"}${i === 6 ? " fk" : ""}" style="left:${CX + R0 + i * DR}px" data-at="${p[2]}" data-fx="pin"><i>${p[0]}</i><b>${p[1]}</b></div>`).join("");

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@600;800&family=IBM+Plex+Mono:wght@500;600&display=block">
<div class="pre"><span style="font-family:'Anton',sans-serif">TAMBORA 1815</span><span style="font-family:'Archivo',sans-serif;font-weight:800">Sumbawa</span><span style="font-family:'Archivo',sans-serif;font-weight:600">Sumbawa</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:600">2.851 m</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">2.851 m</span></div>
<div id="ash"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:April">
  ${kk("EP 42", "FAKTA SEJARAH NEGARA")}
  <div class="h1"><span class="ln">GUNUNG MELETUS,</span><span class="ln b2">EROPA KEHILANGAN</span><span class="ln b2">MUSIM PANAS</span></div>
  <div class="chips"><i class="ch" data-at="s1:Indonesia" data-fx="stampc">TAMBORA &middot; SUMBAWA &middot; INDONESIA</i></div>
  <div class="chips"><i class="ch ice" data-at="s1:Eropa" data-fx="stampc">&#10052; 1816 &middot; TANPA MUSIM PANAS</i></div>
</div>
<div class="p" data-in="s2:April" data-out="s2:Dentumannya">
  ${kk("01", "APRIL 1815")}
  ${row("GUNUNG TAMBORA", "Pulau Sumbawa, Nusa Tenggara Barat", "s2:Tambora")}
  ${row("LETUSAN TERKUAT", "dalam sejarah yang tercatat &middot; skala VEI 7", "s2:terkuat", "em")}
</div>
<div class="p" data-in="s2:Dentumannya" data-out="s3">
  ${kk("01", "DENTUMANNYA TERDENGAR SAMPAI")}
  ${row("BATAVIA", "kini Jakarta", "s2:Batavia")}
  <div class="cd mega" data-at="s2:seribu-0.3" data-fx="card"><small>&gt;</small>${ct(0, 1260, "s2:seribu-0.3", 1.4)}<small>km</small></div>
</div>
<div class="p" data-in="s3" data-out="s3:Desa-desa">
  ${kk("02", "SEPERTIGA TUBUH GUNUNG LENYAP")}
  <div class="cd mega hgt" data-at="s3:Tingginya" data-fx="card"><small>&plusmn;</small>${ct(4300, 2851, "s3:menjadi", 2.6)}<small>m</small></div>
  <div class="cd hrow" data-at="s3:menjadi" data-fx="card"><s>&plusmn;4.300 m</s><em>&rarr;</em><b>2.851 m</b></div>
</div>
<div class="p" data-in="s3:Desa-desa" data-out="s4">
  ${kk("02", "KAKI GUNUNG")}
  ${row("DESA-DESA TERSAPU", "oleh awan panas (aliran piroklastik)", "s3:Desa-desa", "em")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "SUMBAWA &amp; LOMBOK")}
  ${row("ABU MENUTUP SAWAH", "panen hilang, kelaparan dan penyakit menyusul", "s4:Abu")}
  ${row("PULUHAN RIBU JIWA", "korban letusan, kelaparan, dan penyakit", "s4:puluhan", "calm")}
  ${row("SATU PERKIRAAN: SEDIKITNYA 71.000", "angka antarsumber berbeda", "s4:tujuh", "calm")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "TIDAK BERHENTI DI NUSANTARA")}
  ${row("GAS BELERANG NAIK", "ke lapisan atas atmosfer (stratosfer)", "s5:belerang", "su")}
  ${row("MENYEBAR KE SELURUH DUNIA", "", "s5:menyebar", "su")}
  ${row("MEMANTULKAN SINAR MATAHARI", "bumi menjadi lebih dingin", "s5:memantulkan", "su")}
</div>
<div class="p" data-in="s6" data-out="s6:Panen">
  ${kk("05", "SETAHUN KEMUDIAN")}
  <div class="cd yr" data-at="s6:1816" data-fx="card"><b>1816</b><span>TAHUN TANPA MUSIM PANAS</span></div>
  ${row("SALJU DI BULAN JUNI", "timur laut Amerika", "s6:Salju", "ic")}
</div>
<div class="p" data-in="s6:Panen" data-out="s6:Di">
  ${kk("05", "EROPA 1816")}
  ${row("PANEN GAGAL", "", "s6:Panen", "ic")}
  ${row("HARGA PANGAN MELONJAK", "", "s6:harga", "ic")}
  ${row("KERUSUHAN PANGAN", "pecah di banyak kota", "s6:kerusuhan", "ic")}
</div>
<div class="p" data-in="s6:Di" data-out="s7">
  ${kk("05", "INDIA 1816")}
  ${row("MUSIM HUJAN KACAU", "", "s6:India", "ic")}
  ${row("WABAH KOLERA", "menyebar dari Benggala", "s6:kolera", "ic")}
</div>
<div class="p" data-in="s7" data-out="s7:Dari">
  ${kk("06", "SWISS &middot; JUNI 1816")}
  ${row("HUJAN TAK BERHENTI", "sekelompok penulis terkurung di Villa Diodati, Jenewa", "s7:hujan", "ic")}
  ${row("LOMBA CERITA HANTU", "untuk mengisi waktu", "s7:berlomba")}
</div>
<div class="p" data-in="s7:Dari" data-out="s8">
  ${kk("06", "DARI LOMBA ITU")}
  ${row("MARY SHELLEY MENULIS", "", "s7:Mary")}
  <div class="cd fk" data-at="s7:Frankenstein" data-fx="card">Frankenstein</div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "SATU GUNUNG DI SUMBAWA")}
  <div class="tri"><i data-at="s8:cuaca" data-fx="stampc">CUACA</i><i data-at="s8:perut" data-fx="stampc">PERUT</i><i data-at="s8:sastra" data-fx="stampc">SASTRA</i></div>
  <div class="note" data-at="s8:dunia" data-fx="fade">ikut berubah di seluruh dunia</div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Kalau letusan sebesar ini terjadi hari ini, apa yang paling dulu terdampak? Tulis di komentar!</div>
</div>
<div id="ripple" data-at="s2:Dentumannya" data-fx="fade">
  <svg class="rings" viewBox="0 0 920 160" width="920" height="160">
    <defs><clipPath id="rc"><rect x="0" y="0" width="920" height="160" rx="18"/></clipPath></defs>
    <g clip-path="url(#rc)">${rings}<circle class="wv" cx="${CX}" cy="${CY}" r="40"/></g>
  </svg>
  <div class="vol"><svg viewBox="0 0 64 64"><path d="M4 56 L24 22 L28 26 L36 26 L40 22 L60 56 Z" fill="#5A4436" stroke="${CRE}" stroke-width="3" stroke-linejoin="round"/><path d="M26 24 C24 12 34 14 31 4 M33 24 C38 14 44 16 42 6" fill="none" stroke="${EMB}" stroke-width="4" stroke-linecap="round"/></svg><b>TAMBORA</b></div>
  ${pins}
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
#ash{position:absolute;inset:0;z-index:12;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 45%,#5B463A 0%,#2B1F19 55%,#120C09 100%)}
.cd{position:relative;background:rgba(22,17,14,.80);border:1.5px solid rgba(255,196,150,.30);border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.45)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:27px;letter-spacing:.08em;color:${CRE};margin-bottom:14px;padding:6px 18px 6px 6px;background:rgba(22,17,14,.78);border-radius:8px;border:1.5px solid rgba(255,196,150,.3)}
.kk i{font-style:normal;background:${EMB};color:${INK};padding:3px 12px;border-radius:5px}
.h1{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.h1 .ln{font-family:'Anton',Impact,sans-serif;font-size:124px;line-height:1.0;letter-spacing:.01em;color:${CRE};text-shadow:0 6px 30px rgba(0,0,0,.7),0 2px 0 rgba(0,0,0,.6)}
.h1 .b2{font-size:94px;color:${ICE};line-height:1.02}
.chips{display:flex;margin-top:16px}
.ch{font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:32px;letter-spacing:.05em;color:${INK};background:${EMB};padding:8px 18px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.45)}
.ch.ice{background:${ICE}}
.row{display:flex;flex-direction:column;margin-top:14px;padding:12px 24px 14px;border-left:10px solid ${EMB};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:'Archivo',sans-serif;font-weight:800;font-size:50px;line-height:1.06;color:${CRE};letter-spacing:-.005em}
.row span{display:block;font-family:'Archivo',sans-serif;font-weight:600;font-size:31px;line-height:1.2;color:#D9C6B4;max-width:840px;margin-top:2px}
.row.em b{color:#FFB27A}.row.calm{border-left-color:#B9A99A}.row.su{border-left-color:${SUL}}.row.su b{color:#F6E7AE}
.row.ic{border-left-color:${ICE}}
.mega{display:inline-flex;align-items:baseline;gap:12px;margin-top:14px;padding:6px 28px 12px;border-left:10px solid ${EMB}}
.mega b{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:170px;line-height:1;color:${CRE}}
.mega small{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:48px;color:#FFB27A}
.hgt b{color:#FFD2B0}
.hrow{display:inline-flex;align-items:center;gap:18px;margin-top:14px;padding:10px 24px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:40px;color:${CRE}}
.hrow s{color:#A9988A;text-decoration-thickness:3px;text-decoration-color:${EMB}}.hrow em{font-style:normal;color:${EMB}}.hrow b{color:${CRE}}
.yr{display:inline-flex;flex-direction:column;padding:4px 30px 16px;border-left:10px solid ${ICE};margin-top:6px}
.yr b{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:190px;line-height:1;color:${ICE}}
.yr span{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:34px;letter-spacing:.06em;color:${CRE}}
.fk{display:inline-block;margin-top:16px;padding:8px 30px 16px;font-family:'Anton',Impact,sans-serif;font-size:122px;line-height:1.05;color:#F4E9D6;border-left:10px solid ${EMB}}
.tri{display:flex;gap:16px;margin-top:6px}
.tri i{font-style:normal;font-family:'Anton',Impact,sans-serif;font-size:88px;line-height:1;color:${INK};background:${CRE};padding:10px 22px 12px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.tri i:nth-child(2){background:#FFB27A}.tri i:nth-child(3){background:${ICE}}
.note{margin-top:16px;font-family:'Archivo',sans-serif;font-weight:600;font-size:36px;color:${CRE};text-shadow:0 2px 12px rgba(0,0,0,.8)}
.q{margin-top:20px;padding:20px 28px 22px;font-family:'Archivo',sans-serif;font-weight:800;font-size:56px;line-height:1.1;color:${CRE};border-left:10px solid ${EMB};max-width:900px;box-sizing:border-box}
#ripple{position:absolute;left:56px;top:1108px;width:920px;height:160px;z-index:10}
#ripple .rings{position:absolute;left:0;top:0;border-radius:18px;background:linear-gradient(90deg,rgba(22,17,14,.82),rgba(22,17,14,.55));box-shadow:0 10px 30px rgba(0,0,0,.35)}
.rg{fill:none;stroke:rgba(255,196,150,.42);stroke-width:2;stroke-dasharray:6 7;transform-box:fill-box;transform-origin:center}
.wv{fill:none;stroke:${EMB};stroke-width:5;opacity:0;transform-box:fill-box;transform-origin:center}
#ripple .vol{position:absolute;left:6px;top:28px;width:80px;display:flex;flex-direction:column;align-items:center}
#ripple .vol svg{width:66px;height:66px}
#ripple .vol b{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:15px;letter-spacing:.06em;color:${CRE};margin-top:-2px}
.pin{position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;padding:4px 9px 5px;background:rgba(255,243,226,.96);border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.45);white-space:nowrap}
.pin.hi{top:10px}.pin.lo{top:86px}
.pin i{font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:16px;line-height:1;color:#9A5A30;letter-spacing:.06em}
.pin b{font-family:'Archivo',sans-serif;font-weight:800;font-size:21px;line-height:1.08;color:${INK}}
.pin.fk{background:${EMB}}.pin.fk i{color:${INK}}
.pin:before{content:"";position:absolute;left:50%;width:2px;height:14px;background:rgba(255,243,226,.8)}
.pin.hi:before{top:100%}.pin.lo:before{bottom:100%}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");

// set changes (island / globe / field / villa) happen under a short ash dip
const CUTS = ["s2", "s2:Dentumannya-0.3", "s3", "s5:Gas-0.35", "s6", "s6:Di-0.2", "s7", "s8"];
const { AT, K } = writeWorld(TL, at, { sig: "EP42_TAMBORA_TAHUN_TANPA_MUSIM_PANAS",
  ep: "42", bg: BG, vig: 0.34, grain: 0.05, capfloor: 0.32, html, css, chipFont: `'IBM Plex Mono',monospace`, chipColor: CRE,
  chip: "ILUSTRASI 3D &middot; BUKAN CUPLIKAN ASLI",
  extraAt: ["s1:gunung", "s1:meletus", "s1:Eropa", "s2:Gunung", "s2:Sumbawa", "s2:Letusannya", "s2:Batavia", "s2:seribu", "s2:kilometer",
    "s2:Dentumannya-0.3", "s3:Sepertiga", "s3:lenyap", "s3:Tingginya", "s3:empat", "s3:menjadi", "s3:meter#2", "s3:Desa-desa", "s3:tersapu", "s3:awan",
    "s4:Abu", "s4:sawah", "s4:Lombok", "s4:Korban", "s4:puluhan", "s4:tujuh",
    "s5:Tapi", "s5:Nusantara", "s5:Gas", "s5:Gas-0.35", "s5:naik", "s5:atmosfer", "s5:menyebar", "s5:dunia", "s5:memantulkan", "s5:matahari",
    "s6:1816", "s6:dijuluki", "s6:Salju", "s6:Juni", "s6:Amerika", "s6:Panen", "s6:Eropa", "s6:harga", "s6:melonjak", "s6:kerusuhan", "s6:kota",
    "s6:Di", "s6:Di-0.2", "s6:India", "s6:hujan", "s6:kacau", "s6:kolera", "s6:Benggala",
    "s7:Swiss", "s7:hujan", "s7:mengurung", "s7:penulis", "s7:vila", "s7:mengisi", "s7:berlomba", "s7:hantu", "s7:Dari", "s7:Mary", "s7:Frankenstein",
    "s8:Satu", "s8:Sumbawa", "s8:cuaca", "s8:perut", "s8:sastra", "s8:dunia", "s8:Menurut", "s8:letusan", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{tl.fromTo(e,{opacity:0,y:34},{opacity:1,y:0,duration:.42,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.35,opacity:0},{scale:1,opacity:1,duration:.26,ease:'power3.out',immediateRender:false},t);},
 ring:(e,t)=>{tl.fromTo(e,{scale:.05,opacity:0},{scale:1,opacity:1,duration:.9,ease:'power2.out',immediateRender:false},t-.1);const w=q('#ripple .wv');tl.fromTo(w,{scale:.4,opacity:.95},{scale:(+e.getAttribute('r'))/40*1.12,opacity:0,duration:1.0,ease:'power1.out',immediateRender:false},t-.15);},
 pin:(e,t)=>{tl.fromTo(e,{opacity:0,y:(e.classList.contains('hi')?-14:14),scale:.7},{opacity:1,y:0,scale:1,duration:.38,ease:'back.out(2)',immediateRender:false},t+.25);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:40},{opacity:1,y:0,duration:.42,ease:'power3.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-30,duration:.24,ease:'power2.in'},b-.24)`,
  hud: `(t)=>{const cs=${JSON.stringify(CUTS)}.map(k=>AT[k]??K[k]);let k=0;for(const c of cs){const d=Math.abs(t-c);if(d<0.32)k=Math.max(k,1-Math.pow(d/0.32,2));}q('#ash').style.opacity=k.toFixed(3);
   const pn=document.querySelectorAll('#ripple .pin');const w=AT['s8:Satu'];pn.forEach((p,i)=>{const d=t-(w+0.5+i*0.12);p.style.filter=(d>0&&d<0.5)?'brightness(1.25)':'none';});}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Archivo','Arial Black',sans-serif;font-weight:800;font-size:66px;line-height:1.1;color:${CRE};-webkit-text-stroke:10px ${INK};paint-order:stroke fill;text-shadow:0 4px 18px rgba(0,0,0,.7)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${CRE}"},{color:"${EMB}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${CRE}",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:20},{opacity:1,y:0,duration:.2,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Tambora 1815", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
