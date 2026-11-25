// EP03 PASUKAN GAJAH. POLYVERSE low-poly desert at dusk + DRAFTFORGE map overlay: a relief tablet of the Arabian peninsula
// and the valley of Makkah as a sand table. Parchment drafting cards unfold like a folded map and leave in a sand wipe.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const SAND = "#F1E2C4", TERRA = "#B5532F", INK = "#2A1A12", GOLD = "#D9A441", BG = "#2a1d2e";

// Arabic and Kemenag text copied verbatim from the research file, never retyped
const Q = {};
for (const blk of readFileSync("../_research/quran/EP03_fil.txt", "utf8").split(String.fromCharCode(13)).join("").split(/\n\s*\n/)) {
  const m = blk.match(/QS 105:(\d) \|\s*(.+)\n\s*ID\(Kemenag\):\s*(.+)/);
  if (m) Q[m[1]] = { ar: m[2].trim(), id: m[3].replace(/<sup[^>]*>.*?<\/sup>/g, "").trim().replace(/[,.]$/, "") };
}
for (const k of ["3", "4", "5"]) if (!Q[k]) throw new Error("verse missing " + k);
const verse = (n, a) => `<div class="vs" data-at="${a}" data-fx="row"><div class="ar" dir="rtl" lang="ar">${Q[n].ar}</div><div class="tr"><b>105:${n}</b>${Q[n].id}</div></div>`;

const html = `
<div id="sw"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><em>EP 03</em>KISAH DALAM AL-QUR'AN</div>
    <div class="h">PASUKAN<br>BERGAJAH</div>
    <div class="ln">
      <span class="tg" data-at="s1:Ka'bah" data-fx="row">TARGET: KA'BAH</span>
      <span class="tg d" data-at="s1:kawanan" data-fx="row">QS AL-FIL 105</span>
    </div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Menurut">
  <div class="card">
    <div class="k"><em>± 570 M</em>SIAPA ABRAHAH?</div>
    <div class="h m">ABRAHAH</div>
    <div class="rw" data-at="s2:penguasa" data-fx="row"><b>PENGUASA</b><span>Yaman</span></div>
    <div class="rw" data-at="s2:Habasyah" data-fx="row"><b>ASAL</b><span>Habasyah (Ethiopia)</span></div>
    <div class="rw" data-at="s2:Prasasti" data-fx="row"><b>BUKTI</b><span>prasasti batu di Yaman mencatat namanya</span></div>
  </div>
</div>
<div class="p" data-in="s2:Menurut" data-out="s3">
  <div class="card">
    <div class="k"><em>IBNU ISHAQ</em>MENURUT RIWAYAT</div>
    <div class="h m">GEREJA MEGAH<br>DI SANA'A</div>
    <div class="nt" data-at="s2:berziarah" data-fx="row"><i></i><span>Agar orang Arab berziarah ke sana, bukan ke Ka'bah</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Kabilah-kabilah">
  <div class="card">
    <div class="k"><em>RUTE</em>SANA'A &rarr; MAKKAH</div>
    <div class="h s">PASUKAN BESAR<br>&amp; GAJAH PERANG</div>
    <div class="nt" data-at="s3:Mahmud" data-fx="row"><i></i><span><b>MAHMUD</b> gajah terdepan, menurut riwayat sirah</span></div>
  </div>
</div>
<div class="p" data-in="s3:Kabilah-kabilah" data-out="s4">
  <div class="card">
    <div class="k"><em>DI PERJALANAN</em>PERLAWANAN</div>
    <div class="h s">KABILAH PENGHADANG<br>DIKALAHKAN</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Ia">
  <div class="card">
    <div class="k"><em>PINGGIRAN MAKKAH</em>TERNAK DIRAMPAS</div>
    <div class="big nb"><b class="ct" data-from="0" data-to="200" data-a="s4:dua" data-d="1.3">0</b><small> UNTA</small></div>
    <div class="nt" data-at="s4:Abdul" data-fx="row"><i></i><span>milik <b>Abdul Muthalib</b>, kakek Nabi Muhammad</span></div>
  </div>
</div>
<div class="p" data-in="s4:Ia" data-out="s5">
  <div class="card">
    <div class="k"><em>PERTEMUAN</em>MENEMUI ABRAHAH</div>
    <div class="rw" data-at="s4:Bukan" data-fx="row"><b class="x">BUKAN</b><span class="st">membela Ka'bah</span></div>
    <div class="rw" data-at="s4:tapi" data-fx="row"><b>TAPI</b><span>meminta untanya kembali</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Lalu">
  <div class="card q">
    <div class="k"><em>RIWAYAT SIRAH</em>JAWABAN ABDUL MUTHALIB</div>
    <div class="qt"><span data-at="s5:aku" data-fx="row">&ldquo;Aku pemilik unta.</span> <span data-at="s5:Ka'bah" data-fx="row">Ka'bah punya pemiliknya sendiri.&rdquo;</span></div>
  </div>
</div>
<div class="p" data-in="s5:Lalu" data-out="s6">
  <div class="card">
    <div class="k"><em>WARGA MAKKAH</em>MENGUNGSI</div>
    <div class="h s">NAIK KE<br>BUKIT-BUKIT</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Lalu">
  <div class="card">
    <div class="k"><em>MENURUT RIWAYAT</em>DI GERBANG MAKKAH</div>
    <div class="h s">GAJAH TERDEPAN<br>BERHENTI</div>
    <div class="nt" data-at="s6:menolak" data-fx="row"><i></i><span>menolak masuk Makkah</span></div>
  </div>
</div>
<div class="p" data-in="s6:Lalu" data-out="s7">
  <div class="card v">
    <div class="k"><em>QS AL-FIL</em>105:3&ndash;5</div>
    ${verse("3", "s6:burung")}
    ${verse("4", "s6:melempari")}
    ${verse("5", "s6:dijadikan")}
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k"><em>KALENDER ARAB</em>DINAMAI DARI PERISTIWA</div>
    <div class="h s" data-at="s7:Tahun" data-fx="row">TAHUN GAJAH</div>
    <div class="rul" data-at="s7:570" data-fx="row">
      <div class="bar"><i class="early" data-at="s7:Sebagian" data-fx="fade"></i><i class="mk"></i></div>
      <div class="tk"><span style="left:0">540</span><span style="left:16.67%">550</span><span style="left:33.33%">560</span><span class="on" style="left:50%">± 570 M</span><span style="left:66.67%">580</span><span style="left:83.33%">590</span><span style="left:100%">600</span></div>
    </div>
    <div class="rw" data-at="s7:Nabi" data-fx="row"><b>570</b><span>tahun lahir Nabi Muhammad, menurut sumber Islam</span></div>
    <div class="nt soft" data-at="s7:Sebagian" data-fx="row"><i></i><span>sebagian peneliti: lebih awal</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><em>RENUNGAN</em>QS AL-FIL 105</div>
    <div class="h s">YANG TERKUAT<br>KALAH OLEH<br>YANG DIANGGAP KECIL</div>
    <div class="qq" data-at="s8:Menurut" data-fx="row">Dari mana ketenangan Abdul Muthalib datang?</div>
  </div>
</div>`;

const css = `
#sw{position:absolute;inset:0;z-index:12;pointer-events:none;background:radial-gradient(ellipse at 40% 50%,#e7c48e 0%,#d7a36a 55%,#b5774a 100%);clip-path:polygon(100% 0,100% 0,100% 100%,100% 100%)}
#sw:after{content:"";position:absolute;inset:0;background:url(assets/img/grain.png);opacity:.5;mix-blend-mode:multiply}
.p{--sw:140%;-webkit-mask-image:linear-gradient(100deg,#000 calc(var(--sw) - 30%),rgba(0,0,0,.4) calc(var(--sw) - 12%),transparent var(--sw));mask-image:linear-gradient(100deg,#000 calc(var(--sw) - 30%),rgba(0,0,0,.4) calc(var(--sw) - 12%),transparent var(--sw))}
.card{position:relative;background:${SAND};background-image:linear-gradient(rgba(181,83,47,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(181,83,47,.09) 1px,transparent 1px);background-size:28px 28px;padding:22px 30px 28px;border:2px solid ${INK};box-shadow:0 0 0 7px rgba(241,226,196,.35),0 26px 50px rgba(30,14,8,.55)}
.card:before,.card:after{content:"";position:absolute;width:26px;height:26px;border:3px solid ${TERRA}}
.card:before{left:-9px;top:-9px;border-right:0;border-bottom:0}.card:after{right:-9px;bottom:-9px;border-left:0;border-top:0}
.k{display:flex;align-items:center;gap:14px;font-family:Archivo,sans-serif;font-weight:800;font-size:24px;letter-spacing:.12em;color:${INK};padding-bottom:12px;border-bottom:2px dashed ${TERRA};margin-bottom:14px}
.k em{font-style:normal;background:${TERRA};color:#FBF1DC;padding:4px 10px;letter-spacing:.06em}
.h{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:124px;line-height:.88;color:${INK};letter-spacing:-.01em}
.h.m{font-size:92px}.h.s{font-size:70px;line-height:.95}
.ln{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap}
.tg{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:800;font-size:40px;padding:6px 14px;background:${INK};color:${GOLD}}.tg.d{background:${TERRA};color:#FBF1DC}
.rw{display:flex;align-items:baseline;gap:18px;padding:10px 0;border-top:1.5px solid rgba(42,26,18,.2)}
.rw:first-of-type{margin-top:8px}
.rw b{flex:none;min-width:150px;font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:44px;color:${TERRA}}
.rw b.x{color:${INK}}
.rw span{font-family:Archivo,sans-serif;font-weight:600;font-size:33px;line-height:1.2;color:${INK}}
.rw span.st{text-decoration:line-through;text-decoration-color:${TERRA};text-decoration-thickness:4px;opacity:.75}
.nt{display:flex;align-items:stretch;margin-top:16px;background:${INK}}
.nt i{width:14px;background:${GOLD};flex:none}
.nt span{padding:12px 18px;font-family:Archivo,sans-serif;font-weight:600;font-size:31px;line-height:1.22;color:#FBF1DC}
.nt span b{color:${GOLD};font-weight:900}
.nt.soft{background:transparent;border:2px dashed ${INK}}.nt.soft i{background:repeating-linear-gradient(135deg,${TERRA} 0 5px,transparent 5px 10px)}.nt.soft span{color:${INK};font-style:italic}
.big{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:190px;line-height:.86;color:${TERRA};letter-spacing:-.02em}
.big small{font-size:76px;color:${INK}}
.q .qt{font-family:Archivo,sans-serif;font-weight:800;font-size:60px;line-height:1.12;color:${INK}}
.q .qt span{display:inline}
.v{padding-bottom:20px}
.vs{padding:4px 0 10px;border-top:1.5px solid rgba(42,26,18,.2)}
.ar{font-family:Amiri,serif;font-size:62px;line-height:1.55;color:${INK};text-align:right;direction:rtl}
.vs .tr{font-family:Archivo,sans-serif;font-weight:600;font-size:25px;line-height:1.25;color:${INK};opacity:.9}
.vs .tr b{display:inline-block;margin-right:10px;padding:1px 7px;background:${TERRA};color:#FBF1DC;font-weight:800;font-size:21px}
.rul{margin:14px 0 6px}
.rul .bar{position:relative;height:26px;background:rgba(42,26,18,.12);border-top:3px solid ${INK}}
.rul .early{position:absolute;left:16.67%;width:31.5%;top:0;bottom:0;background:repeating-linear-gradient(135deg,rgba(181,83,47,.55) 0 6px,transparent 6px 12px)}
.rul .mk{position:absolute;left:50%;top:-16px;width:6px;margin-left:-3px;height:44px;background:${TERRA}}
.rul .tk{position:relative;height:40px;margin-top:6px;font-family:Archivo,sans-serif;font-weight:700;font-size:24px;color:${INK}}
.rul .tk span{position:absolute;top:0;transform:translateX(-50%)}
.rul .tk span:first-child{transform:none}.rul .tk span:last-child{transform:translateX(-100%)}
.rul .tk span.on{font-weight:900;font-size:30px;color:${TERRA};top:-2px}
.qq{margin-top:18px;padding:14px 18px;background:${TERRA};font-family:Archivo,sans-serif;font-weight:800;font-size:44px;line-height:1.1;color:#FBF1DC}
`;

mkdirSync("PROJECT/HyperFrames_Remotion/assets/audio", { recursive: true });
mkdirSync("PROJECT/HyperFrames_Remotion/compositions", { recursive: true });
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Ka'bah", "s1:kawanan", "s2:Yaman", "s2:Habasyah", "s2:Prasasti", "s2:gereja", "s2:Sana'a", "s2:berziarah", "s2:Ka'bah",
  "s3:gajah", "s3:Mahmud", "s3:Kabilah-kabilah", "s3:dikalahkan", "s3:perjalanan", "s4:merampas", "s4:dua", "s4:Abdul", "s4:datang", "s4:Abrahah", "s4:Bukan",
  "s5:aku", "s5:Lalu", "s5:mengungsi", "s6:berhenti", "s6:menolak", "s6:Makkah", "s6:burung", "s6:berbondong-bondong", "s6:melempari", "s6:Surah", "s6:dijadikan",
  "s7:Nabi", "s7:Sebagian"];
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: BG, vig: 0.42, grain: 0.07, capfloor: 0.6, html, css,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Archivo,sans-serif", chipColor: "#FBF1DC",
  extraAt: WORLD_AT,
  fxExtra: `row:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{y:18,opacity:0,clipPath:'inset(0 100% 0 0)'},{y:0,opacity:1,clipPath:'inset(0 0% 0 0)',duration:.45,ease:'power3.out'},t);},`,
  // map-fold in: the card unfolds downward from its top crease, like a map opened on the table
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{rotationX:-96,transformPerspective:1500,transformOrigin:'50% 0%',opacity:1,'--sw':'140%'},{rotationX:0,duration:.6,ease:'back.out(1.1)'},a-.14);}`,
  // sand wipe out: the card is blown away left to right behind a soft grainy edge
  panelOut: `(tl,p,b)=>tl.to(p,{'--sw':'-10%',x:40,duration:.4,ease:'power2.in'},b-.4)`,
  // world cuts (map <-> valley) hide behind a sweep of sand
  hud: `(t)=>{const s=q('#sw');let u=-1;for(const c of [K.s2-.04,K.s4-.04]){const v=(t-(c-.32))/.64;if(v>0&&v<1)u=v;}
if(u<0){s.style.clipPath='polygon(100% 0,100% 0,100% 100%,100% 100%)';return;}
const a=Math.min(1,u*2)*130,b=Math.max(0,u*2-1)*130;s.style.clipPath='polygon('+(110-a)+'% 0,'+(130-b)+'% 0,'+(110-b)+'% 100%,'+(90-a)+'% 100%)';}`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.55,ease:'power3.inOut'},OUT-.12);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,sans-serif;font-weight:800;font-size:58px;line-height:1.28;color:#FBF1DC;text-shadow:0 3px 14px rgba(20,8,4,.9)}
.w{display:inline-block;margin:0 .1em;padding:0 .1em;border-bottom:5px solid rgba(217,164,65,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FBF1DC",borderBottomColor:"rgba(217,164,65,0)"},{color:"${GOLD}",borderBottomColor:"rgba(181,83,47,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FBF1DC",borderBottomColor:"rgba(217,164,65,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:22,opacity:0},{y:0,opacity:1,duration:.2,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pasukan Gajah", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
