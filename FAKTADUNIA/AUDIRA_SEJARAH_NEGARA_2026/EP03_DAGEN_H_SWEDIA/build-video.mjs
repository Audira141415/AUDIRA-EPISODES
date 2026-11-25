// EP03 DAGEN H. URBANFORGE: white maquette of a 1960s Stockholm crossroads at dawn, Swedish blue and yellow as the only accents.
// Swiss-grid paper cards; every panel swipes in from the left and leaves to the right, the way the traffic moved. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BLUE = "#006AA7", YEL = "#FECC02", INK = "#111214", PAPER = "#F4F2EC", BG = "#0D0E10";

const html = `
<div id="lane" class="kr"><i></i><b>LAJUR KIRI</b></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><em>03</em>FAKTA SEJARAH NEGARA</div>
    <div class="h">SATU NEGARA<br>PINDAH JALUR</div>
    <div class="ln"><div class="clk0 nb" data-at="s1:lima" data-fx="popd">05.00</div><div class="lr" data-at="s1:kiri" data-fx="lane"><span class="kiri">KIRI</span><i class="arr"></i><span class="kanan">KANAN</span></div></div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="card">
    <div class="k"><em>1967</em>SWEDIA, SEBELUM DAGEN H</div>
    <div class="h m">SETIR DI KIRI,<br>TETANGGA DI KANAN</div>
    <div class="tb">
      <div class="tr" data-at="s2:Swedia" data-fx="lane"><b>SWEDIA</b><span class="tag y">KIRI</span></div>
      <div class="tr" data-at="s2:Norwegia" data-fx="lane"><b>NORWEGIA</b><span class="tag">KANAN</span></div>
      <div class="tr" data-at="s2:Finlandia" data-fx="lane"><b>FINLANDIA</b><span class="tag">KANAN</span></div>
    </div>
    <div class="note" data-at="s2:90" data-fx="lane"><b class="nb">&gt;90%</b><span>mobil di Swedia justru bersetir kiri, cocok untuk lajur kanan</span></div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Tapi">
  <div class="card">
    <div class="k"><em>1955</em>REFERENDUM NASIONAL</div>
    <div class="big nb" data-at="s3:83" data-fx="popd">83%</div>
    <div class="sub">memilih tetap di lajur kiri</div>
    <div class="bar" data-at="s3:83" data-fx="lane"><i data-at="s3:83" data-fx="grow" style="width:83%"></i><span>100%</span></div>
  </div>
</div>
<div class="p" data-in="s3:Tapi" data-out="s3:Tahun">
  <div class="card">
    <div class="k"><em>MOBIL</em>JUMLAH KENDARAAN DI SWEDIA</div>
    <div class="big nb"><b class="ct" data-from="0.5" data-to="1.5" data-a="s3:jadi" data-d="1.5" data-dec="1">0,5</b><small> JUTA</small></div>
    <div class="sub">naik tiga kali lipat, dari setengah juta jadi satu setengah juta</div>
  </div>
</div>
<div class="p" data-in="s3:Tahun" data-out="s4">
  <div class="card">
    <div class="k"><em>1963</em>RIKSDAG, 10 MEI 1963</div>
    <div class="h m">PARLEMEN TETAP<br>MEMUTUSKAN PINDAH</div>
    <div class="nt" data-at="s3:parlemen" data-fx="lane"><i></i><div><b>TAGE ERLANDER</b><span>Perdana Menteri Swedia, pengusul pindah ke kanan</span></div></div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="card">
    <div class="k"><em>4 THN</em>PERSIAPAN NASIONAL</div>
    <div class="big nb" data-at="s4:350.000" data-fx="faded"><b class="ct" data-from="0" data-to="350000" data-a="s4:350.000" data-d="1.4">0</b></div>
    <div class="sub">rambu lalu lintas diganti (sekitar)</div>
    <div class="tb">
      <div class="tr" data-at="s4:plastik" data-fx="lane"><b>LAMPU BARU</b><span class="tx">dibungkus plastik hitam</span></div>
      <div class="tr" data-at="s4:selotip" data-fx="lane"><b>MARKA BARU</b><span class="tx">dicat, lalu ditutup selotip</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Jam">
  <div class="card">
    <div class="k"><em>MINGGU</em>3 SEPTEMBER 1967</div>
    <div class="dh" data-at="s5:Dagen" data-fx="popd">DAGEN <span>H</span></div>
    <div class="sub" data-at="s5:disebut" data-fx="lane">H = H&ouml;gertrafik, lalu lintas kanan</div>
  </div>
</div>
<div class="p" data-in="s5:Jam" data-out="s6">
  <div class="card">
    <div class="k"><em>JAM</em>SEMUA KENDARAAN, SERENTAK</div>
    <div class="clk nb" id="clk">04.50</div>
    <div class="steps">
      <span data-at="s5:berhenti" data-fx="lane">BERHENTI</span>
      <span class="b" data-at="s5:kanan" data-fx="lane">PINDAH KANAN</span>
      <span data-at="s5:berhenti#2" data-fx="lane">BERHENTI</span>
      <span class="y" data-at="s5:jalan" data-fx="lane">05.00 JALAN</span>
    </div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="card">
    <div class="k"><em>HASIL</em>KECELAKAAN LALU LINTAS</div>
    <div class="tb">
      <div class="tr" data-at="s6:157" data-fx="lane"><b class="nb bl">157</b><span class="tx">kecelakaan kecil di hari H</span></div>
      <div class="tr" data-at="s6:125" data-fx="lane"><b class="nb bl">125</b><span class="tx">Senin berikutnya</span></div>
    </div>
    <div class="cmp" data-at="s6:sebelumnya" data-fx="faded">
      <div class="axis"><i class="rng"></i><i class="mk"></i></div>
      <div class="lbls"><span class="nb">0</span><span class="nb r1">125</span><span class="nb r2">130&ndash;198 Senin sebelumnya</span></div>
    </div>
    <div class="note" data-at="s6:ekstra" data-fx="lane"><b>EKSTRA</b><span>orang menyetir jauh lebih hati-hati</span></div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card">
    <div class="k"><em>EFEK</em>KEWASPADAAN MEMUDAR</div>
    <div class="big nb" data-at="s7:1969" data-fx="popd">1969</div>
    <div class="sub">angka kecelakaan kembali seperti semula</div>
    <div class="note" data-at="s7:kereta" data-fx="lane"><b>KERETA</b><span>kereta api Swedia sampai sekarang tetap di kiri</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><em>PELAJARAN</em>DAGEN H, 1967</div>
    <div class="h m">SATU PAGI,<br>PERSIAPAN EMPAT TAHUN</div>
    <div class="q" data-at="s8:Indonesia" data-fx="lane">INDONESIA PINDAH KE KANAN, KITA SIAP?</div>
  </div>
</div>`;

const css = `
#lane{position:absolute;right:110px;top:178px;z-index:11;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;font-weight:800;font-size:23px;letter-spacing:.06em;color:#fff}
#lane i{display:block;width:22px;height:22px;background:#fff}
#lane.kn i{background:${YEL}}#lane.kn b{color:${YEL}}
.card{background:${PAPER};padding:24px 30px 30px;border-top:12px solid ${BLUE};box-shadow:0 22px 50px rgba(0,0,0,.5)}
.k{display:flex;align-items:center;gap:14px;font-family:Inter,sans-serif;font-weight:800;font-size:24px;letter-spacing:.1em;color:${INK};padding-bottom:14px;border-bottom:2px solid ${INK};margin-bottom:16px}
.k em{font-style:normal;background:${BLUE};color:#fff;padding:4px 10px;letter-spacing:.04em}
.h{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:112px;line-height:.9;color:${INK};letter-spacing:-.01em}
.h.m{font-size:80px;line-height:.94}
.ln{display:flex;align-items:center;gap:22px;margin-top:22px}
.clk0{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:96px;line-height:1;color:${BLUE}}
.lr{display:flex;align-items:center;gap:12px;font-family:Archivo,sans-serif;font-stretch:75%;font-weight:800;font-size:44px}
.lr .kiri{color:${INK};border:3px solid ${INK};padding:2px 12px}.lr .kanan{background:${YEL};color:${INK};padding:5px 14px}
.arr{display:block;width:46px;height:6px;background:${INK};position:relative}.arr:after{content:"";position:absolute;right:-6px;top:-9px;border-left:16px solid ${INK};border-top:12px solid transparent;border-bottom:12px solid transparent}
.tb{margin-top:16px}
.tr{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:10px 0;border-top:2px solid rgba(17,18,20,.18)}
.tr b{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:800;font-size:50px;line-height:1;color:${INK}}.tr b.bl{color:${BLUE};font-size:64px}
.tr .tx{font-family:Inter,sans-serif;font-weight:600;font-size:30px;color:${INK};text-align:right}
.tag{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:800;font-size:38px;padding:4px 14px;background:${BLUE};color:#fff}.tag.y{background:${YEL};color:${INK}}
.note{display:flex;align-items:center;gap:18px;margin-top:16px;padding:14px 16px;background:${YEL}}
.note b{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:52px;line-height:1;color:${INK};flex:none}
.note span{font-family:Inter,sans-serif;font-weight:700;font-size:29px;line-height:1.2;color:${INK}}
.big{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:180px;line-height:.9;color:${BLUE};letter-spacing:-.02em}
.big small{font-size:72px;color:${INK}}
.sub{font-family:Inter,sans-serif;font-weight:700;font-size:32px;line-height:1.25;color:${INK};margin-top:8px}
.bar{position:relative;height:40px;margin-top:20px;background:#DDD8CC}.bar i{position:absolute;left:0;top:0;bottom:0;background:${BLUE};transform-origin:0 50%}
.bar span{position:absolute;right:10px;top:4px;font-family:Inter,sans-serif;font-weight:800;font-size:24px;color:${INK}}
.nt{display:flex;align-items:stretch;gap:0;margin-top:20px;background:#fff;box-shadow:0 4px 0 ${INK}}
.nt i{width:16px;background:${BLUE}}.nt div{padding:14px 18px}.nt b{display:block;font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:52px;line-height:1;color:${INK}}
.nt span{display:block;margin-top:6px;font-family:Inter,sans-serif;font-weight:600;font-size:27px;color:${INK}}
.dh{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:150px;line-height:.9;color:${INK};white-space:nowrap}.dh span{display:inline-block;background:${BLUE};color:${YEL};padding:0 22px}
.clk{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:200px;line-height:.88;color:${INK};letter-spacing:-.01em}
.steps{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.steps span{font-family:Archivo,sans-serif;font-stretch:75%;font-weight:800;font-size:38px;padding:6px 14px;border:3px solid ${INK};color:${INK}}
.steps span.b{background:${BLUE};border-color:${BLUE};color:#fff}.steps span.y{background:${YEL};border-color:${YEL}}
.cmp{margin-top:18px}
.axis{position:relative;height:36px;background:#E6E2D8}
.axis .rng{position:absolute;left:65%;width:34%;top:0;bottom:0;background:repeating-linear-gradient(135deg,#9a978f 0 6px,#E6E2D8 6px 12px)}
.axis .mk{position:absolute;left:0;width:62.5%;top:8px;bottom:8px;background:${BLUE}}
.lbls{position:relative;height:34px;margin-top:6px;font-family:Inter,sans-serif;font-weight:700;font-size:23px;color:${INK}}
.lbls span{position:absolute;top:0}.lbls .r1{left:62.5%;transform:translateX(-100%);color:${BLUE}}.lbls .r2{right:0}
.q{margin-top:22px;font-family:Archivo,sans-serif;font-stretch:75%;font-weight:900;font-size:52px;line-height:1.05;padding:14px 18px;background:${BLUE};color:#fff}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("scandi-geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/scandi-geo.js");
const WORLD_AT = ["s1:Semua", "s1:kiri", "s1:kanan", "s2:Norwegia", "s2:Finlandia", "s3:83", "s3:Tapi", "s3:setengah", "s3:jadi", "s3:juta#2", "s3:Tahun", "s3:parlemen",
  "s4:350.000", "s4:diganti", "s4:lampu", "s4:plastik", "s4:Marka", "s4:dicat", "s4:selotip", "s5:Hari", "s5:Dagen", "s5:disebut", "s5:04.50", "s5:berhenti", "s5:pindah", "s5:kanan",
  "s5:berhenti#2", "s5:lima", "s5:tepat", "s5:jalan", "s6:157", "s6:125", "s6:ekstra", "s7:1969", "s7:Dan", "s7:kereta", "s8:Indonesia"];
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: BG, vig: 0.5, grain: 0.06, capfloor: 0.72, html, css, chip: "MAKET ILUSTRASI &middot; STOCKHOLM 1967", chipFont: "Inter,sans-serif", chipColor: "#fff",
  extraAt: WORLD_AT,
  // Card reveals take no space until their word: display is switched on the timeline, so cards grow row by row.
  fxExtra: `lane:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{x:-60,opacity:0,clipPath:'inset(0 100% 0 0)'},{x:0,opacity:1,clipPath:'inset(0 0% 0 0)',duration:.4,ease:'power3.out'},t);},
 popd:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{scale:.7,opacity:0,transformOrigin:'0% 50%'},{scale:1,opacity:1,duration:.38,ease:'back.out(1.5)'},t);},
 faded:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0},{opacity:1,duration:.3,ease:'none'},t);},`,
  // Panels drive in from the left lane and leave to the right, like the traffic on Dagen H.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{x:-160,opacity:1,clipPath:'inset(0 100% 0 0)'},{x:0,opacity:1,clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power3.out'},a-.12)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:180,clipPath:'inset(0 0% 0 100%)',duration:.3,ease:'power2.in'},b-.3)`,
  // Clock to 05.00 and the lane badge.
  hud: `(t)=>{const c=q('#clk');if(c){const a=AT['s5:04.50'],b=AT['s5:lima'];const m=t<b?50+Math.min(9,Math.floor(Math.max(0,t-a)/(b-a)*10)):60;c.textContent=m>=60?'05.00':'04.'+m;c.style.color=m>=60?'${BLUE}':'${INK}';}
const l=q('#lane');const kn=(t>AT['s1:kanan']&&t<K.s2-0.05)||t>AT['s5:kanan'];l.className=kn?'kn':'kr';l.lastChild.textContent=kn?'LAJUR KANAN':'LAJUR KIRI';l.style.opacity=t>K.outro-.2?0:1;}`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 100% 0 0)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0)',duration:.45,ease:'power3.inOut'},OUT-.12);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:60px;line-height:1.3;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.85)}
.w{display:inline-block;padding:0 .14em;border-radius:.2em;background:rgba(0,106,167,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(0,106,167,0)",textShadow:"0 3px 14px rgba(0,0,0,.85)"},{color:"${YEL}",backgroundColor:"rgba(0,106,167,1)",textShadow:"0 0 0 rgba(0,0,0,0)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(0,106,167,0)",textShadow:"0 3px 14px rgba(0,0,0,.85)",duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{x:-40,opacity:0},{x:0,opacity:1,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Dagen H", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
