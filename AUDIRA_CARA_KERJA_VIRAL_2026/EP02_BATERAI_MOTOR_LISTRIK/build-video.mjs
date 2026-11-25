// EP02 THE CHAIN. Thermal-lab look: ironbow heat scale, crosshair telemetry, panels that come into focus like a thermal camera locking on. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const HOT = "#FF7A1A", CYAN = "#38E1FF", INK = "#07060B", PALE = "#F5E9DA";

const scale = `<div class="scale"><i></i><span>&deg;C</span></div>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st">CARA KERJA VIRAL &middot; EP 02</div>
  <div class="h0">KENAPA MOTOR LISTRIK<br><i>BISA TERBAKAR?</i></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st">BEKASI &middot; VIRAL 5 NOV 2026</div>
  <div class="warn" data-at="s2:Penyebab" data-fx="stamp">PENYEBAB BELUM DIPASTIKAN</div>
  <div class="ro" data-at="s2:kontrolernya" data-fx="left"><b>KONTROLER DI-REMAP</b><span>menurut bengkel yang menangani</span></div>
  <div class="ro" data-at="s2:BMS-nya" data-fx="left"><b>BMS AFTERMARKET</b><span>sel baterai disebut masih bawaan pabrik</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st">ANATOMI SEL LITHIUM-ION</div>
  <div class="tags">
    <div class="tg a" data-at="s3:anoda" data-fx="pop"><b>ANODA</b><span>grafit</span></div>
    <div class="tg k" data-at="s3:katoda" data-fx="pop"><b>KATODA</b><span>oksida logam</span></div>
    <div class="tg e" data-at="s3:elektrolit" data-fx="pop"><b>ELEKTROLIT</b><span>cair, mudah terbakar</span></div>
    <div class="tg s" data-at="s3:sekat" data-fx="pop"><b>SEPARATOR</b><span>sekat plastik tipis</span></div>
  </div>
  <div class="srcl" data-at="s3:sekat" data-fx="fade">Potongan sel diperbesar, lapisan disederhanakan.</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st">SAAT DICAS</div>
  <div class="flow" data-at="s4:dicas" data-fx="up"><span class="k">KATODA</span><em>Li&#8314; &#8594;</em><span class="sp">SEKAT</span><em>&#8594;</em><span class="a">GRAFIT</span></div>
  <div class="ro" data-at="s4:BMS" data-fx="left"><b>BMS = OTAK BATERAI</b><span>jaga tegangan &amp; suhu tiap sel</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st">SAAT SEL DISALAHGUNAKAN</div>
  <div class="tel" data-at="s5:berlebih" data-fx="up"><span>SUHU SEL</span><b class="ct" data-from="35" data-to="130" data-a="s5:berlebih" data-d="11" data-suf=" &deg;C">35 &deg;C</b>${scale}</div>
  <div class="ro" data-at="s5:90" data-fx="left"><b>&#8776; 90 &deg;C</b><span>lapisan pelindung grafit (SEI) terurai</span></div>
  <div class="ro" data-at="s5:130" data-fx="left"><b>&#8776; 130 &deg;C</b><span>separator meleleh &#8594; korsleting dalam</span></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st">THERMAL RUNAWAY</div>
  <div class="tel" data-at="s6:runaway" data-fx="up"><span>SUHU SEL</span><b class="ct" data-from="130" data-to="500" data-a="s6:runaway" data-d="9" data-suf=" &deg;C">130 &deg;C</b>${scale}</div>
  <div class="loop" data-at="s6:reaksi" data-fx="pop">PANAS &#8635; REAKSI</div>
  <div class="ro" data-at="s6:sebelahnya" data-fx="left"><b>MERAMBAT SEL KE SEL</b><span>efek domino di dalam paket</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st">CARA AMAN</div>
  <div class="ck" data-at="s7:charger" data-fx="left"><i>&#10003;</i>Pakai charger asli</div>
  <div class="ck" data-at="s7:kontroler" data-fx="left"><i>&#10005;</i>Jangan ubah kontroler / BMS</div>
  <div class="ck" data-at="s7:menggembung" data-fx="left"><i>&#10005;</i>Baterai gembung / berbau: stop</div>
  <div class="ck hot" data-at="s7:pemadam" data-fx="left"><i>!</i>Terbakar: menjauh, hubungi pemadam</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h2" data-at="s8:Baterai" data-fx="up">ENERGI BESAR,<br><i>RUANG KECIL.</i></div>
  <div class="srcl" data-at="s8:jinak" data-fx="fade">Sumber: Kompas 6 Nov 2026; Liu dkk. 2018 (Science Advances); Battery University BU-304a; NFPA; NTSB SR-20/01. Visual 3D adalah ilustrasi.</div>
</div>`;

const css = `
.st{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:26px;letter-spacing:.08em;color:${INK};background:${HOT};padding:6px 12px;margin-bottom:14px}
.h0{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:104px;line-height:.98;letter-spacing:-.02em;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.7)}
.h0 i{font-style:normal;color:${HOT}}
.h2{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:110px;line-height:.98;letter-spacing:-.02em;color:#fff;text-shadow:0 4px 26px rgba(0,0,0,.8)}
.h2 i{font-style:normal;color:${CYAN}}
.warn{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:36px;color:#fff;border:3px solid ${HOT};background:rgba(255,122,26,.18);padding:8px 16px;margin-bottom:6px}
.ro{background:rgba(7,6,11,.74);border-left:6px solid ${HOT};padding:10px 18px;margin-top:10px}
.ro b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:54px;line-height:1.05;color:#fff}
.ro span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:27px;line-height:1.22;color:${PALE}}
.tags{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:820px}
.tg{background:rgba(7,6,11,.76);padding:10px 16px;border-top:7px solid}
.tg b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:50px;line-height:1.02;color:#fff}
.tg span{display:block;font-family:"JetBrains Mono",monospace;font-size:26px;color:${PALE}}
.tg.a{border-color:#9BE15D}.tg.k{border-color:#FFB547}.tg.e{border-color:#3FA9FF}.tg.s{border-color:#F2F2F2}
.flow{display:flex;align-items:center;gap:10px;width:900px}
.flow span{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:46px;padding:10px 14px;background:rgba(7,6,11,.8);color:#fff}
.flow .k{border-bottom:6px solid #FFB547}.flow .a{border-bottom:6px solid #9BE15D}.flow .sp{border-bottom:6px solid #F2F2F2}
.flow em{font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:36px;color:${CYAN}}
.tel{position:relative;background:rgba(7,6,11,.76);padding:12px 22px 22px;width:600px}
.tel span{display:block;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:28px;letter-spacing:.1em;color:${HOT}}
.tel b{display:block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:118px;line-height:1;color:#fff}
.scale{display:flex;align-items:center;gap:10px;margin-top:8px}
.scale i{display:block;width:480px;height:16px;background:linear-gradient(90deg,#05000F,#5A0372,#D11F3F,#FF8C0A,#FFF3C4)}
.scale span{font-family:"JetBrains Mono",monospace;font-size:24px;color:${PALE}}
.loop{display:inline-block;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:44px;color:${INK};background:${HOT};padding:8px 18px;margin-top:12px}
.ck{display:flex;align-items:center;gap:16px;background:rgba(7,6,11,.76);padding:12px 18px;margin-top:10px;width:860px;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:42px;color:#fff}
.ck i{display:inline-block;width:52px;height:52px;line-height:52px;text-align:center;font-style:normal;font-family:"JetBrains Mono",monospace;font-weight:800;color:${INK};background:${CYAN}}
.ck.hot i{background:${HOT}}
.srcl{font-family:"JetBrains Mono",monospace;font-weight:500;font-size:23px;line-height:1.3;color:#fff;margin-top:14px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: INK, vig: 0.5, grain: 0.06, capfloor: 0.45, html, css,
  extraAt: ["s2:kontrolernya", "s2:BMS-nya", "s2:masuk", "s3:anoda", "s3:katoda", "s3:elektrolit", "s3:sekat", "s4:dicas", "s4:Sekat", "s4:BMS", "s5:berlebih", "s5:90", "s5:130", "s5:bertemu", "s6:runaway", "s6:oksigen", "s6:menyala", "s6:500", "s6:sebelahnya", "s7:charger", "s7:menggembung", "s7:pemadam", "s8:jinak"],
  // A panel focuses in like a thermal camera locking on, and blurs away on exit.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,filter:'blur(14px)',scale:1.05},{opacity:1,filter:'blur(0px)',scale:1,duration:.38,ease:'power3.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,filter:'blur(14px)',duration:.22,ease:'power2.in'},b-.3)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:62px;line-height:1.22;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;padding:0 7px;border-radius:4px}`,
// Active word heats up: an orange chip behind dark text.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(255,122,26,0)",textShadow:"0 3px 12px rgba(0,0,0,.95)"},{color:"#07060B",backgroundColor:"rgba(255,122,26,1)",textShadow:"0 0 0 rgba(0,0,0,0)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(255,122,26,0)",textShadow:"0 3px 12px rgba(0,0,0,.95)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0},{opacity:1,duration:.1,ease:"none"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Chain", INK);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
