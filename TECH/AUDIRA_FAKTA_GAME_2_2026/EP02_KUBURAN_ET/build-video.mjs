// EP02 KUBURAN E.T. Forensic evidence desk (VISUALINVESTIGATION): charcoal cutting mat under a warm lamp, archival paper,
// evidence red. Panels are case cards that scan in like a document. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const VOID = "#0B0C0E", RED = "#FF4A2E", PAPER = "#E9DFC8", INK = "#1D1D1B", BONE = "#F1EBDD", GRN = "#10B981", HAIR = "#2E3238";
const H = "Archivo,sans-serif", MONO = "IBM Plex Mono,monospace";

const html = `
<div id="tc">TC 00:00:00:00</div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="meta">&#9679; CASE FILE // FAKTA GAME EP 02</div>
    <div class="h">EXHIBIT:<br>ALAMOGORDO 1983</div>
    <div><b class="chip" data-at="s1:belasan" data-fx="snap">BELASAN TRUK</b><b class="chip k" data-at="s1:beton" data-fx="stamp">DITUTUP BETON</b></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="card">
    <div class="meta">&#9679; KRONOLOGI // GAME E.T. (1982)</div>
    <div class="h sm" data-at="s2:dijadikan" data-fx="up">Film &rarr; game Atari</div>
    <div class="row"><div class="h big" data-at="s2:lima" data-fx="snap">5 MINGGU</div><div class="mini" data-at="s2:lima" data-fx="up">waktu<br>pembuatan</div></div>
    <b class="chip" data-at="s2:liburan" data-fx="snap">TARGET: LIBURAN AKHIR 1982</b>
  </div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="card">
    <div class="meta">&#9679; HASIL // PRODUKSI VS PENJUALAN</div>
    <div class="h sm">Hasilnya terburu-buru</div>
    <b class="chip" data-at="s3:terburuk" data-fx="stamp">&ldquo;SALAH SATU GAME TERBURUK&rdquo;</b>
    <div class="br" data-at="s3:lima" data-fx="up"><span class="bl">DIBUAT</span><span class="bt" style="width:440px" data-at="s3:lima" data-fx="grow"></span><span class="bv">5 juta</span></div>
    <div class="br" data-at="s3:satu#2" data-fx="up"><span class="bl">TERJUAL</span><span class="bt r" style="width:132px" data-at="s3:satu#2" data-fx="grow"></span><span class="bv">1,5 juta</span></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Mulai">
  <div class="card paper">
    <div class="meta k">&#9679; KLIPING // KORAN LOKAL ALAMOGORDO, NEW MEXICO</div>
    <div class="h ink">SEPTEMBER 1983</div>
    <div class="h ink big2" data-at="s4:sepuluh" data-fx="snap">10&ndash;20 TRUK</div>
    <div class="mini ink" data-at="s4:El" data-fx="up">dari gudang El Paso &rarr; TPA kota</div>
  </div>
</div>
<div class="p" data-in="s4:Mulai" data-out="s5">
  <div class="card">
    <div class="meta">&#9679; REKONSTRUKSI // PENUTUPAN</div>
    <div class="stamp" data-at="s4:Mulai" data-fx="stamp">29 SEP 1983: BETON</div>
    <div class="mini" data-at="s4:jarang" data-fx="up">jarang dilakukan untuk sampah</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="card">
    <div class="meta">&#9679; STATUS KASUS // BERTAHUN-TAHUN</div>
    <div class="stamp" data-at="s5:legenda" data-fx="stamp">LEGENDA URBAN?</div>
    <b class="chip k" data-at="s5:jutaan" data-fx="snap">RUMOR: JUTAAN COPY E.T.</b>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="meta">&#9679; PENGGALIAN // 26.04.2014</div>
    <div class="h sm">Tim film dokumenter menggali</div>
    <b class="chip g" data-at="s6:Gamenya" data-fx="stamp">TERBUKTI ADA</b>
    <div class="cnt" data-at="s6:Sekitar" data-fx="up"><b>&plusmn;<b class="ct" data-from="0" data-to="1300" data-a="s6:Sekitar" data-d="1.6">0</b></b><span>cartridge diangkat</span></div>
    <div class="cnt" data-at="s6:total" data-fx="up"><b class="rd">&plusmn;<b class="ct" data-from="0" data-to="700000" data-a="s6:total" data-d="1.8">0</b></b><span>dikubur, berbagai game<br><i>menurut pejabat Atari</i></span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="meta">&#9679; LELANG // KOTA ALAMOGORDO</div>
    <div class="h sm">Hasil galian dilelang</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="meta">&#9679; KESIMPULAN KASUS</div>
    <div class="h sm2" data-at="s8:Jadi" data-fx="snap">Dibuang sebagai sampah,<br><span class="rdt">kini benda bersejarah</span></div>
    <b class="chip" data-at="s8:Kamu" data-fx="snap">KAMU MAU PUNYA SATU?</b>
  </div>
</div>`;

const css = `
.card{background:rgba(13,14,16,.9);border:2px solid ${HAIR};border-left:9px solid ${RED};padding:22px 30px 26px;box-shadow:0 22px 44px rgba(0,0,0,.5)}
.card.paper{background:${PAPER};border-color:#b9ad92;border-left-color:${INK}}
.meta{font-family:IBM Plex Mono,monospace;font-weight:600;font-size:25px;letter-spacing:.05em;color:${RED};margin-bottom:12px}
.meta.k{color:#7a2a1c}
.h{font-family:Archivo,sans-serif;font-weight:800;font-size:72px;line-height:1.0;color:${BONE};text-transform:uppercase;letter-spacing:-.01em}
.h.sm{font-size:50px;margin-bottom:6px}.h.sm2{font-size:56px;line-height:1.04}.rdt{color:${RED}}
.h.big{font-size:104px;line-height:.92;color:${BONE};white-space:nowrap}
.h.big2{font-size:112px;color:${RED};margin-top:4px}
.ink{color:${INK}}
.row{display:flex;align-items:flex-end;gap:22px;margin:8px 0 4px}
.mini{font-family:IBM Plex Mono,monospace;font-weight:600;font-size:30px;line-height:1.2;color:#cfc6b4;padding-bottom:12px}
.mini.ink{color:${INK};padding-bottom:0;margin-top:8px}
.chip{display:inline-block;font-family:IBM Plex Mono,monospace;font-weight:700;font-size:30px;color:#fff;background:${RED};padding:7px 16px;margin:14px 12px 0 0}
.chip.k{background:${BONE};color:${INK}}.chip.g{background:${GRN};color:${VOID}}
.stamp{display:inline-block;border:7px solid ${RED};color:${RED};font-family:Archivo,sans-serif;font-weight:900;font-size:80px;line-height:1;padding:10px 22px 12px;background:rgba(255,74,46,.08);margin:6px 0 4px}
.br{display:flex;align-items:center;gap:18px;margin-top:16px}.bl{font-family:IBM Plex Mono,monospace;font-weight:600;font-size:27px;color:#cfc6b4;width:150px}
.bt{display:block;height:40px;background:${PAPER};transform-origin:0 50%}.bt.r{background:${RED}}.bv{font-family:Archivo,sans-serif;font-weight:800;font-size:46px;color:${BONE}}
.cnt{display:flex;align-items:center;gap:20px;margin-top:14px}.cnt>b{font-family:Archivo,sans-serif;font-weight:900;font-size:70px;color:${BONE};font-variant-numeric:tabular-nums;min-width:330px}.cnt>b.rd{color:${RED}}
.cnt span{font-family:IBM Plex Mono,monospace;font-weight:600;font-size:27px;line-height:1.2;color:#cfc6b4}.cnt i{font-style:normal;color:#8d8678;font-size:23px}
#tc{position:absolute;right:56px;top:186px;z-index:11;font-family:IBM Plex Mono,monospace;font-weight:600;font-size:23px;letter-spacing:.04em;color:${RED};opacity:.9}
#chip{font-family:IBM Plex Mono,monospace;font-weight:600;color:${BONE};top:186px;font-size:21px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: "#0B0C0E", vig: 0.5, grain: 0.06, capfloor: 0.45, html, css, chipFont: MONO, chipColor: BONE, sig: "EP02_KUBURAN_ET",
  extraAt: ["s1:Atari", "s2:Steven", "s2:Howard", "s2:lima", "s2:liburan", "s3:lima", "s3:satu#2", "s4:sepuluh", "s4:El", "s4:Mulai", "s4:dicor", "s5:legenda", "s5:Rumornya", "s5:jutaan", "s6:Sekitar", "s6:Menurut", "s6:total", "s6:berbagai", "s7:melelang", "s7:delapan", "s7:seratus", "s7:dolar", "s7:dolar#2", "s7:Satu", "s8:Jadi"],
  // Case cards scan in left to right like a document under a copier bar, and fold up like a closed file.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0% 100% 0% 0%)',opacity:1,x:-24},{clipPath:'inset(0% 0% 0% 0%)',x:0,duration:.42,ease:'power3.out'},a-.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 100% 0%)',y:-20,duration:.18,ease:'power2.in'},b-.18)`,
  // Camera-shutter reveal for evidence: a white flash settles into the item.
  fxExtra: `snap:(e,t)=>tl.fromTo(e,{opacity:0,scale:1.06,filter:'brightness(3.2)'},{opacity:1,scale:1,filter:'brightness(1)',duration:.32,ease:'power2.out'},t),`,
  hud: `(t)=>{const e=q('#tc');if(!e)return;const f=Math.floor(t*30)%30,s=Math.floor(t)%60,m=Math.floor(t/60);e.textContent='TC 00:'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+':'+String(f).padStart(2,'0');}`,
  // Closes like a camera shutter: two blades open from the centre line.
  outroIn: `gsap.set('#outro',{clipPath:'inset(50% 0% 50% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,sans-serif;font-weight:800;font-size:58px;line-height:1.2;color:#fff;text-transform:none;text-shadow:0 3px 0 #000,0 0 14px rgba(0,0,0,.9),3px 0 0 #000,-3px 0 0 #000,0 -3px 0 #000}
.w{display:inline-block;margin:0 .1em;padding:0 .08em}`,
(id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(255,74,46,0)",y:0},{backgroundColor:"rgba(255,74,46,1)",y:-5,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(255,74,46,0)",y:0,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Kuburan E.T.", "#0B0C0E");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
