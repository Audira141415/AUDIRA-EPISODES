// EP26 PULAU PHEASANT, PULAU YANG GANTI NEGARA TIAP 6 BULAN: TERRARIUM. The island lives in a corked glass jar on a
// walnut plinth; a calendar dial around the jar turns under a brass "HARI INI" pointer and every turn flips the flag
// (Spain 1 Feb-31 Jul, France 1 Aug-31 Jan) and the island tint. Beats: Bidasoa + 200 x 40 m rulers, the 1659
// conference (de Haro, Mazarin, 24 meetings, treaty + monolith), Louis XIV and Maria Theresa, the viceroy badge +
// Pierre Loti, Irun and Hendaye, no-entry sign + cleaner + patrol boat, a struck-through pheasant, dusk payoff.
// Panels are moss-green glass labels with a brass edge. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2A1A10", CREAM = "#F6EBD2", BRASS = "#C9A04A", MOSS = "#4F7A3A";
const ES = `<i class="fl es"></i>`, FRF = `<i class="fl fr"></i>`;
const row = (b, s, a, cls = "", flag = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card">${flag}<div><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div></div>`;

const html = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=IBM+Plex+Mono:wght@600;700&display=block">
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 26</div>
  <div class="cd h1">Pulau yang <em>ganti negara</em> tiap 6 bulan</div>
  <div class="chips"><i class="ch es" data-at="s1:Spanyol" data-fx="stampc">${ES}SPANYOL</i><i class="ch fr" data-at="s1:Prancis" data-fx="stampc">${FRF}PRANCIS</i></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="kk">PULAU PHEASANT &middot; SUNGAI BIDASOA</div>
  ${row("PERBATASAN PRANCIS&ndash;SPANYOL", "", "s2:perbatasan")}
  <div class="cd dims" data-at="s2:dua" data-fx="card"><b>&plusmn;200 m</b><small>&times;</small><b class="w2" data-at="s2:empat" data-fx="fade">&plusmn;40 m</b></div>
  <div class="note" data-at="s2:tidak" data-fx="fade">tidak berpenghuni</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="kk">PERJANJIAN PYRENEES</div>
  <div class="cd mega" data-at="s3:1659" data-fx="card"><b>1659</b></div>
  <div class="cd mega sm" data-at="s3:dua" data-fx="card"><b><b class="ct" data-from="0" data-to="24" data-a="s3:dua" data-d="1.2">0</b>&times;</b><small>BERTEMU</small></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">MILIK BERSAMA</div>
  ${row("DUA NEGARA, SATU PULAU", "kondominium sejak 1659", "s4:bersama")}
  ${row("LOUIS XIV", "Raja Prancis", "s4:Louis", "fr", FRF)}
  ${row("MARIA THERESA", "putri Spanyol", "s4:Maria", "es", ES)}
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="kk">JADWAL BERGILIR</div>
  ${row("1 FEB &ndash; 31 JUL", "di bawah Spanyol", "s5:Februari", "es mono", ES)}
  ${row("1 AGU &ndash; 31 JAN", "di bawah Prancis", "s5:Agustus", "fr mono", FRF)}
</div>
<div class="p" data-in="s6" data-out="s6:Dalam">
  <div class="kk">JABATAN PRANCIS</div>
  <div class="cd h2" data-at="s6:raja" data-fx="card">&ldquo;Raja muda Pulau Pheasant&rdquo;</div>
  ${row("PIERRE LOTI", "penulis, pernah memegangnya", "s6:Pierre", "fr", FRF)}
</div>
<div class="p" data-in="s6:Dalam" data-out="s7">
  <div class="kk">DIURUS BERGANTIAN</div>
  ${row("WALI KOTA IRUN", "Spanyol", "s6:Irun", "es", ES)}
  ${row("WALI KOTA HENDAYE", "Prancis", "s6:Hendaye", "fr", FRF)}
</div>
<div class="p" data-in="s7" data-out="s7:Lucunya">
  <div class="kk">KONDOMINIUM TERKECIL DI DUNIA</div>
  ${row("DILARANG BERKUNJUNG", "", "s7:Tidak", "rd")}
  ${row("PETUGAS KEBERSIHAN", "tiap 6 bulan", "s7:petugas")}
  ${row("PATROLI ANGKATAN LAUT", "tiap 5 hari", "s7:patroli")}
</div>
<div class="p" data-in="s7:Lucunya" data-out="s8">
  <div class="kk">PULAU BURUNG PEGAR</div>
  <div class="cd h2" data-at="s7:tidak" data-fx="card">&hellip;tanpa burung pegar</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="cd h2">Satu pulau, <em>dua negara</em></div>
  <div class="cd mega sm" data-at="s8:tiga" data-fx="card"><b><b class="ct" data-from="0" data-to="360" data-a="s8:tiga" data-d="1.3">0</b>+</b><small>TAHUN DAMAI</small></div>
  <div class="cd q" data-at="s8:Menurut" data-fx="card">Wilayah sengketa mana yang sebaiknya dibagi seperti ini? Tulis di komentar!</div>
</div>`;

const glass = `linear-gradient(160deg,rgba(38,58,30,.93),rgba(22,34,18,.94))`;
const css = `
.cd{position:relative;background:${glass};border:2px solid ${BRASS};border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.18)}
.kk{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:28px;line-height:1.1;letter-spacing:.1em;color:#2A1A08;background:linear-gradient(180deg,#EED38A,#C9A04A 60%,#9E7A30);padding:10px 20px 8px;border-radius:8px;margin-bottom:22px;box-shadow:0 8px 20px rgba(0,0,0,.45)}
.h1{display:inline-block;padding:16px 30px 18px;font-family:Fraunces,Georgia,serif;font-weight:800;font-size:84px;line-height:1.02;color:${CREAM};max-width:900px;box-sizing:border-box}
.h1 em,.h2 em{font-style:italic;color:#F1C24A}
.h2{display:inline-block;padding:14px 28px 16px;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:62px;line-height:1.08;color:${CREAM};max-width:880px;box-sizing:border-box}
.chips{display:flex;gap:16px;margin-top:22px}
.ch{display:flex;align-items:center;gap:14px;font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:40px;padding:10px 22px 8px;border-radius:10px;color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.45);border:2px solid ${BRASS}}
.ch.es{background:#9A0E22}.ch.fr{background:#22408E}
.fl{flex:none;display:inline-block;width:54px;height:36px;border-radius:4px;box-shadow:0 0 0 2px rgba(255,255,255,.7)}
.fl.es{background:linear-gradient(180deg,#C8102E 25%,#F1BF00 25%,#F1BF00 75%,#C8102E 75%)}
.fl.fr{background:linear-gradient(90deg,#2B4BA0 33.3%,#fff 33.3%,#fff 66.6%,#E1000F 66.6%)}
.row{display:flex;align-items:center;gap:20px;width:max-content;max-width:880px;box-sizing:border-box;margin-top:16px;padding:12px 26px 14px;border-left:12px solid ${MOSS}}
.row b{display:block;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:46px;line-height:1.08;color:${CREAM}}
.row span{display:block;margin-top:4px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:28px;color:#C8D9A8}
.row.mono b{font-family:'IBM Plex Mono',monospace;font-size:50px}
.row.es{border-left-color:#C8102E}.row.fr{border-left-color:#2B4BA0}.row.rd{border-left-color:#E1000F}.row.rd b{color:#FF8A7A}
.dims{display:flex;align-items:baseline;gap:18px;width:max-content;margin-top:18px;padding:6px 28px 10px}
.dims b{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:84px;color:#F1C24A}
.dims small{font-family:Fraunces,Georgia,serif;font-size:56px;color:${CREAM}}
.mega{display:flex;align-items:baseline;gap:20px;width:max-content;padding:0 30px 6px;margin-top:16px}
.mega b{font-family:Fraunces,Georgia,serif;font-weight:800;font-size:140px;line-height:1.05;color:#F1C24A}
.mega.sm b{font-size:96px}
.mega small{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:40px;color:${CREAM}}
.note{display:inline-block;margin-top:16px;font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:700;font-size:38px;color:${CREAM};background:rgba(20,14,8,.82);border:2px solid ${BRASS};border-radius:10px;padding:6px 18px}
.q{margin-top:22px;padding:16px 28px;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:46px;line-height:1.15;color:#2A1A08;background:linear-gradient(180deg,#EED38A,#C9A04A);max-width:860px;box-sizing:border-box}`;

for (const f of ["world3d.js", "RoomEnvironment.js"]) copyFileSync(f, `PROJECT/HyperFrames_Remotion/assets/lib/${f}`);
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP26_PULAU_PHEASANT",
  ep: "26", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.45, html, css, chipFont: "'IBM Plex Mono',monospace", chipColor: CREAM,
  chip: "ILUSTRASI &middot; PULAU DALAM TOPLES",
  extraAt: ["s1:berganti", "s1:Prancis", "s1:Spanyol", "s2:Bidasoa", "s2:Spanyol", "s2:Prancis", "s2:Pheasant", "s2:Panjangnya", "s2:dua", "s2:empat", "s2:tidak",
    "s3:Luis", "s3:Mazarin", "s3:dua", "s3:kali", "s3:Hasilnya", "s3:Perjanjian", "s4:bersama", "s4:Raja", "s4:Louis", "s4:putri",
    "s5:Februari", "s5:Agustus", "s5:Spanyol", "s5:Prancis", "s6:raja", "s6:Salah", "s6:Pierre", "s6:Dalam", "s6:wali", "s6:Irun", "s6:Hendaye",
    "s7:Tidak", "s7:petugas", "s7:patroli", "s7:Lucunya", "s7:burung", "s7:tidak", "s7:kondominium", "s8:Satu", "s8:dua", "s8:berbagi", "s8:tiga", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.mega,.dims')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:30,scale:.94},{opacity:1,y:0,scale:1,duration:.4,ease:'power3.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{scale:1.6,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:36},{opacity:1,y:0,duration:.42,ease:'power3.out'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-26,duration:.24,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:64px;line-height:1.12;color:#F6EBD2;text-shadow:0 3px 0 #1a0f08,0 0 18px rgba(0,0,0,.9),0 0 4px rgba(0,0,0,.9)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#F6EBD2"},{color:"#F1C24A",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F6EBD2",duration:.14},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pulau Pheasant", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
