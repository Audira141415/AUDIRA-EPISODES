// EP04 KOREK API / NANOFORGE. Microscope-specimen look: dark glass cards with a cyan hairline, mono telemetry,
// panels focus-pull in (blur to sharp) like a microscope finding focus. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const CY = "#00f5d4", GD = "#f59e0b", RB = "#f43f5e", VI = "#a855f7", WH = "#ffffff";

const html = `
<div id="hud"><div class="h1">AUDIRA &middot; NANO-SEM</div><div class="h2" id="hudS">SKALA &middot; MAKRO</div></div>
<div id="sb"><div id="sbar"></div><div id="sbl">MAKRO</div></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="meta"><span>CARA PEMBUATAN</span><span class="r">EP 04</span></div>
  <div class="ttl">KOREK API<br><em>CUMA NYALA DI KOTAK</em></div>
  <div class="grid"><b class="x" data-at="s1:dinding" data-fx="lit">&#10005; Dinding</b><b class="x" data-at="s1:batu" data-fx="lit">&#10005; Batu</b><b class="x" data-at="s1:sepatu" data-fx="lit">&#10005; Sepatu</b><b class="ok" data-at="s1:kotak" data-fx="lit">&#10003; Kotak</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="meta"><span>SEJARAH</span><span class="r">FOSFOR PUTIH</span></div>
  <div class="ttl sm">DULU: NYALA<br><em class="rb">DI MANA SAJA</em></div>
  <div class="rows"><b class="rw" data-at="s2:racunnya" data-fx="lit"><s class="d r"></s>Racunnya merusak rahang pekerja</b><b class="rw" data-at="s2:Pasch" data-fx="lit"><s class="d c"></s><span class="yr">1844</span>Pasch, Swedia: bahan dipisah</b></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="meta"><span>LANGKAH 1</span><span class="r">KAYU</span></div>
  <div class="ttl sm">DIKUPAS <em>BERPUTAR</em></div>
  <div class="rows"><b class="rw" data-at="s3:aspen" data-fx="lit"><s class="d g"></s>Aspen atau pinus</b><b class="rw" data-at="s3:dipotong" data-fx="lit"><s class="d g"></s>Lembaran tipis &rarr; batang kecil</b></div>
  <div class="big" data-at="s3:370.000" data-fx="lit">&plusmn;<b class="ct nb" data-from="370000" data-to="370000" data-a="s3:370.000" data-d="1.3">370.000</b><span>korek / 1 gelondong aspen</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="meta"><span>LANGKAH 2</span><span class="r">BATANG</span></div>
  <div class="ttl sm">RENDAM, TANCAP, <em>CELUP</em></div>
  <div class="rows"><b class="rw" data-at="s4:amonium" data-fx="lit"><s class="d c"></s>Amonium fosfat: tidak membara</b><b class="rw" data-at="s4:parafin" data-fx="lit"><s class="d g"></s>Parafin: api merambat ke kayu</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="meta"><span>LANGKAH 3</span><span class="r">KEPALA &amp; KOTAK</span></div>
  <div class="ttl sm">ADONAN <em class="rb">KEPALA</em></div>
  <div class="chips"><b class="chip" data-at="s5:kalium" data-fx="lit">Kalium klorat</b><b class="chip" data-at="s5:belerang" data-fx="lit">Belerang</b><b class="chip" data-at="s5:bubuk" data-fx="lit">Bubuk kaca</b></div>
  <div class="rows"><b class="rw" data-at="s5:Kotaknya" data-fx="lit"><s class="d r"></s>Kotak: fosfor merah + bubuk kaca</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="meta"><span>KENAPA MENYALA?</span><span class="r">SKALA MOLEKUL</span></div>
  <div class="ttl sm">MERAH DI KEPALA<br><span class="strk">= FOSFOR?</span> <b class="no" data-at="s6:pewarna" data-fx="stamp">PEWARNA</b></div>
  <div class="rows"><b class="rw" data-at="s6:reaktif" data-fx="lit"><s class="d r"></s>Sedikit fosfor merah jadi reaktif</b><b class="rw" data-at="s6:bereaksi" data-fx="lit"><s class="d v"></s>+ kalium klorat &rarr; <em>API</em></b></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="meta"><span>MESIN MODERN</span><span class="r">1 SHIFT</span></div>
  <div class="big tall" data-at="s7:10" data-fx="lit"><b class="ct nb" data-from="0" data-to="10000000" data-a="s7:10" data-d="1.4">0</b><span>korek per shift 8 jam</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="meta"><span>CARA PEMBUATAN</span><span class="r">EP 04</span></div>
  <div class="ttl sm">DUA BAGIAN <em>BERTEMU</em></div>
  <div class="rows"><b class="rw" data-at="s8:dua" data-fx="lit"><s class="d v"></s>Kepala: kalium klorat</b><b class="rw" data-at="s8:bagian" data-fx="lit"><s class="d r"></s>Kotak: fosfor merah</b></div>
</div>`;

const css = `
.p{background:linear-gradient(160deg,rgba(6,18,40,.93),rgba(2,6,16,.91));border:1px solid rgba(0,245,212,.42);border-radius:20px;padding:24px 32px 28px;box-shadow:0 22px 60px rgba(0,0,0,.5),0 0 34px rgba(0,245,212,.10),inset 0 1px 0 rgba(160,255,240,.25);backdrop-filter:blur(10px)}
.meta{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:24px;letter-spacing:.14em;color:${CY};margin-bottom:12px}
.meta .r{color:rgba(255,255,255,.8)}
.ttl{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:78px;line-height:1.0;letter-spacing:-.02em;color:${WH}}
.ttl.sm{font-size:62px}
.ttl em{font-style:normal;color:${GD}}.ttl em.rb{color:${RB}}
.rows{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.rw{display:block;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:40px;line-height:1.2;color:#f2fbff}
.rw em{font-style:normal;color:${GD};font-weight:700}
.yr{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:28px;color:${CY};margin-right:14px}
.d{display:inline-block;width:16px;height:16px;border-radius:50%;margin-right:16px;vertical-align:4px;box-shadow:0 0 12px currentColor}
.d.c{background:${CY};color:${CY}}.d.g{background:${GD};color:${GD}}.d.r{background:${RB};color:${RB}}.d.v{background:${VI};color:${VI}}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.grid b{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;border-radius:14px;padding:10px 18px;border:1px solid rgba(255,255,255,.18)}
.grid .x{color:#ffb4c0;background:rgba(244,63,94,.14)}.grid .ok{color:#06121f;background:${CY}}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.chip{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:33px;color:#f2fbff;border:1px solid rgba(0,245,212,.5);background:rgba(0,245,212,.10);border-radius:999px;padding:7px 18px}
.big{margin-top:16px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:84px;line-height:1;color:${GD};letter-spacing:-.02em}
.big span{display:block;font-size:34px;font-weight:600;color:#f2fbff;letter-spacing:0;margin-top:6px}
.big.tall{font-size:118px;margin-top:4px}
.strk{color:rgba(255,255,255,.75);text-decoration:line-through;text-decoration-color:${RB};text-decoration-thickness:6px}
.no{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:38px;font-weight:700;color:#06121f;background:${RB};border-radius:10px;padding:4px 14px;vertical-align:12px;letter-spacing:.06em}
#chip{font-family:'JetBrains Mono',monospace;font-size:18px;color:#bff;letter-spacing:.1em;background:rgba(2,10,24,.6);border:1px solid rgba(0,245,212,.35);padding:5px 12px;border-radius:8px}
#hud{position:absolute;right:56px;top:184px;z-index:11;text-align:right;font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.14em}
#hud .h1{font-size:17px;color:${CY};opacity:.9}#hud .h2{font-size:17px;color:rgba(255,255,255,.7);margin-top:4px}
#sb{position:absolute;left:56px;top:1238px;z-index:11;display:flex;align-items:center;gap:12px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:17px;letter-spacing:.14em;color:rgba(255,255,255,.75)}
#sbar{height:3px;width:90px;background:#fff;box-shadow:0 0 8px ${CY}}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: "#02050f", vig: 0.42, grain: 0.05, capfloor: 0.35, html, css, chip: "ILUSTRASI, BUKAN REKAMAN PABRIK ASLI",
  chipFont: "'JetBrains Mono',monospace", chipColor: "#bff", sig: "EP04_KOREK_API",
  extraAt: ["s1:Setengah", "s1:kotak", "s2:menyala", "s2:racunnya", "s2:memisahkan", "s2:bahannya", "s2:bersaudara", "s2:massal",
    "s3:dikupas", "s3:dipotong", "s4:amonium", "s4:ditancapkan", "s4:parafin", "s4:sabuk", "s4:direndam", "s4:membara", "s4:merambat",
    "s5:dicelup", "s5:kalium", "s5:belerang", "s5:bubuk", "s5:lem", "s5:pewarna", "s5:Sabuk", "s5:jam", "s5:kering", "s5:Kotaknya", "s5:fosfor", "s5:kaca#2",
    "s6:Merah", "s6:digesek", "s6:panas", "s6:mengubah", "s6:reaktif", "s6:bereaksi", "s6:kalium", "s6:menyala",
    "s7:Mesin", "s7:10", "s7:juta", "s7:shift", "s8:api", "s8:bertemu", "s8:Ikuti", "s8:AUDIRA"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{scale:.965,opacity:0,filter:'blur(14px)'},{scale:1,opacity:1,filter:'blur(0px)',duration:.6,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{scale:1.02,opacity:0,filter:'blur(10px)',duration:.3,ease:'power2.in'},b-.3)`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.62},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  hud: `(t)=>{const m=t>AT['s6:panas']+0.45&&t<K.s7+0.55;q('#hudS').textContent=m?'SKALA \\u00b7 MOLEKUL':'SKALA \\u00b7 MAKRO';q('#sbl').textContent=m?'MOLEKUL':'MAKRO';q('#sbar').style.width=(m?150:90)+'px';}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:54px;line-height:1.18;color:${WH};background:rgba(2,8,20,.82);border:1px solid rgba(0,245,212,.35);border-radius:20px;padding:12px 28px 15px;box-shadow:0 14px 40px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .13em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WH}",scale:1},{color:"${CY}",scale:1.04,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WH}",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:14},{opacity:1,y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Korek Api", "#02050f");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
