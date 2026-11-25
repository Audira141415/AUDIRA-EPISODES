// EP41 EVER GIVEN, SUEZ 2021: TOYDIORAMA. A tabletop canal model ("MAKET AUDIRA" km 151 sign): a toy container ship
// wedges across a resin-blue canal, a tiny yellow excavator digs at its bow, a toy queue fills the canal and ripple
// rings spread to three crate pedestals (chip, sheep, garden gnome). Panels are cargo stickers (cream label, colour
// band, barcode strip; Titan One headlines, Space Mono data). Batch-9 ripple device: a row of round toy tokens on
// concentric dashed rings, from one wind swirl outwards, one token per narrated consequence. Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#22324A", RED = "#C2462F", ORA = "#F08A2E", YEL = "#F2B51E", BLU = "#2F6DB5", TEA = "#2A9D8F", CREAM = "#FFF8EA", BG = "#E9CFA2";
const HEAD = `'Titan One','Arial Black',sans-serif`, MONO = `'Space Mono','Courier New',monospace`;

const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const big = (num, unit, sub, a, cls = "") => `<div class="cd big ${cls}" data-at="${a}" data-fx="card"><b>${num}</b><div><em>${unit}</em>${sub ? `<span>${sub}</span>` : ""}</div></div>`;
const ct = (to, a, d = 1.0, dec = 0, pre = "", suf = "") => `<span class="ct" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" data-dec="${dec}" data-pre="${pre}" data-suf="${suf}">${pre}0${suf}</span>`;

const ICON = {
  wind: `<path d="M6 22h30c8 0 10-12 2-12-4 0-6 3-6 6" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M6 34h40c9 0 11 13 2 13-5 0-7-3-7-6" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M10 46h16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  ship: `<path d="M6 40l6 12h40l6-12z" fill="${INK}"/><rect x="14" y="26" width="8" height="12" fill="${RED}"/><rect x="23" y="22" width="8" height="16" fill="${BLU}"/><rect x="32" y="26" width="8" height="12" fill="${YEL}"/><rect x="41" y="18" width="8" height="20" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M4 46l56-26" stroke="${RED}" stroke-width="4" stroke-dasharray="5 4"/>`,
  queue: `<path d="M4 26l3 6h18l3-6zM34 26l3 6h18l3-6zM14 46l3 6h18l3-6z" fill="${INK}"/><rect x="9" y="19" width="12" height="7" fill="${RED}"/><rect x="39" y="19" width="12" height="7" fill="${TEA}"/><rect x="19" y="39" width="12" height="7" fill="${ORA}"/>`,
  chip: `<rect x="16" y="16" width="32" height="32" rx="4" fill="${INK}"/><rect x="25" y="25" width="14" height="14" fill="${YEL}"/><path d="M22 10v6M30 10v6M38 10v6M22 48v6M30 48v6M38 48v6M10 22h6M10 30h6M10 38h6M48 22h6M48 30h6M48 38h6" stroke="#8A939C" stroke-width="3"/>`,
  sheep: `<g fill="#fff" stroke="${INK}" stroke-width="3"><circle cx="24" cy="30" r="9"/><circle cx="34" cy="26" r="9"/><circle cx="42" cy="32" r="8"/><circle cx="30" cy="36" r="9"/></g><rect x="46" y="22" width="11" height="13" rx="4" fill="${INK}"/><path d="M24 44v8M34 44v8M42 40v10" stroke="${INK}" stroke-width="4"/><path d="M4 54h56" stroke="${BLU}" stroke-width="5"/>`,
  gnome: `<path d="M32 4L20 26h24z" fill="${RED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="30" r="8" fill="#F3C6A0" stroke="${INK}" stroke-width="3"/><path d="M24 33c2 12 14 12 16 0l-8 10z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M20 58l4-16h16l4 16z" fill="${BLU}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
};
const tok = (id, ic, label, a, cls = "") => `<div class="tk ${cls}" id="${id}" data-at="${a}" data-fx="tok"><div class="ic"><svg viewBox="0 0 64 64">${ICON[ic]}</svg></div><div class="tl">${label}</div><i class="pz" data-at="${a}" data-fx="puls"></i></div>`;
const arcs = [140, 280, 420, 560, 700, 840].map((r, i) => `<circle class="rg" cx="62" cy="82" r="${r}" data-at="${["s4:kandas", "s5:menunggu", "s6:cip", "s6:domba", "s6:kurcaci", "s8:Satu"][i]}" data-fx="ring"/>`).join("");

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Titan+One&family=Space+Mono:wght@400;700&family=Outfit:wght@400;600&display=block">
<div class="pre"><span style="font-family:'Titan One',sans-serif">EVER GIVEN</span><span style="font-family:'Space Mono',monospace;font-weight:700">2021</span><span style="font-family:'Space Mono',monospace;font-weight:400">suez</span><span style="font-family:Outfit,sans-serif;font-weight:600">AUDIRA</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${kk("EP 41", "FAKTA SEJARAH NEGARA")}
  <div class="cd ttl"><small>TERUSAN SUEZ &middot; MESIR &middot; 2021</small><b>1 KAPAL<br><em>MENYUMBAT</em><br>DUNIA</b><div class="bc"></div></div>
  <div class="stk" data-at="s1:enam" data-fx="stampc">${ct(6, "s1:enam", 0.5)} HARI MACET</div>
</div>
<div class="p" data-in="s2" data-out="s2:dan">
  ${kk("01", "MARET 2021")}
  ${row("TERUSAN SUEZ, MESIR", "jalan pintas Laut Mediterania &ndash; Laut Merah", "s2:Terusan", "bl")}
  ${big(`&plusmn;${ct(12, "s2:dua", 0.8)}%`, "PERDAGANGAN", "dunia lewat sini", "s2:dua", "or")}
</div>
<div class="p" data-in="s2:dan" data-out="s3">
  ${kk("01", "JALUR SEMPIT")}
  ${row("BANYAK RUAS CUMA 1 JALUR", "hanya muat satu kapal", "s2:hanya", "bl")}
</div>
<div class="p" data-in="s3" data-out="s3:Badai">
  ${kk("02", "23 MARET 2021 &middot; PAGI")}
  ${row("EVER GIVEN", "kapal kontainer raksasa", "s3:Ever", "rd")}
  ${big(`${ct(400, "s3:empat", 0.9)} m`, "PANJANG", "&asymp; 4 lapangan bola", "s3:empat", "rd")}
</div>
<div class="p" data-in="s3:Badai" data-out="s4">
  ${kk("02", "BADAI PASIR")}
  ${big(`&gt;${ct(70, "s3:tujuh", 0.9)}`, "KM/JAM", "kecepatan angin", "s3:tujuh", "or")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "KANDAS")}
  ${row("KONTAINER = LAYAR", "tumpukan kontainer menangkap angin", "s4:menangkap", "or")}
  ${row("KANDAS MELINTANG", "haluan dan buritan menancap di dua tepi", "s4:kandas", "rd")}
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "ANTREAN")}
  ${big(ct(369, "s5:tiga", 1.6), "KAPAL", "menunggu (per 28 Maret)", "s5:tiga", "bl")}
  ${big(`US$${ct(9.6, "s5:sembilan#2", 0.9, 1)}`, "MILIAR", "barang tertahan setiap hari", "s5:sembilan#2", "rd")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "EFEK RIAK")}
  ${row("MERAMBAT KE MANA-MANA", "dari satu kanal ke seluruh dunia", "s6:merambat", "or")}
</div>
<div class="p" data-in="s7" data-out="s7:Dua">
  ${kk("06", "PENYELAMATAN")}
  ${row("KAPAL KERUK", "mengisap pasir di bawah haluan", "s7:keruk", "bl")}
  ${row("RIBUAN TON AIR PEMBERAT", "dibuang agar kapal lebih ringan", "s7:ribuan", "bl")}
  ${row("1 EKSKAVATOR KECIL", "menggali haluan", "s7:ekskavator", "or")}
</div>
<div class="p" data-in="s7:Dua" data-out="s8">
  ${kk("06", "29 MARET 2021")}
  ${big(ct(14, "s7:empat", 0.7), "KAPAL TUNDA", "menarik bersama", "s7:empat", "bl")}
  <div class="stk gn" data-at="s7:lepas" data-fx="stampc">LEPAS!</div>
</div>
<div class="p" data-in="s8" data-out="s8:Satu">
  ${kk("07", "SETELAH LEPAS")}
  ${big(`&gt;${ct(100, "s8:seratus", 0.9)}`, "HARI", "kapal ditahan Mesir", "s8:seratus", "rd")}
  ${big(`US$${ct(540, "s8:lima", 0.9)}`, "JUTA", "ganti rugi yang disepakati", "s8:lima", "or")}
</div>
<div class="p" data-in="s8:Satu" data-out="s8:Menurut">
  ${kk("07", "PEMICU KECIL, DAMPAK RAKSASA")}
  ${row("1 KAPAL", "", "s8:Satu", "bl sm")}
  ${row("1 EMBUSAN ANGIN", "", "s8:satu", "or sm")}
  ${row("1 DUNIA IKUT BERHENTI", "", "s8:satu#2", "rd sm")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Barang apa di rumahmu yang mungkin pernah lewat Suez? Tulis di komentar!</div>
</div>
<div id="ripple" data-at="s4:angin" data-fx="fade">
  <svg class="arcs" viewBox="0 0 960 170">${arcs}</svg>
  <div class="row6">
    ${tok("t0", "wind", "ANGIN", "s4:angin", "hero")}
    ${tok("t1", "ship", "KANDAS", "s4:kandas")}
    ${tok("t2", "queue", "369 KAPAL", "s5:menunggu")}
    ${tok("t3", "chip", "CIP", "s6:cip")}
    ${tok("t4", "sheep", "130.000 DOMBA", "s6:domba")}
    ${tok("t5", "gnome", "KURCACI TAMAN", "s6:kurcaci")}
  </div>
  <div class="wave" data-at="s8:Satu" data-fx="wave"></div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CREAM};border:5px solid ${INK};border-radius:18px;box-shadow:0 8px 0 rgba(34,50,74,.85),0 14px 26px rgba(60,40,10,.35)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:${MONO};font-weight:700;font-size:26px;letter-spacing:.08em;color:#fff;margin-bottom:14px;padding:6px 18px 6px 6px;background:${INK};border-radius:999px}
.kk i{font-style:normal;font-family:${HEAD};font-weight:400;letter-spacing:.03em;background:${YEL};color:${INK};padding:3px 14px;border-radius:999px}
.ttl{display:inline-block;padding:18px 30px 22px 34px;border-left:22px solid ${RED}}
.ttl small{display:block;font-family:${MONO};font-weight:700;font-size:26px;letter-spacing:.06em;color:${RED};margin-bottom:6px}
.ttl b{display:block;font-family:${HEAD};font-weight:400;font-size:104px;line-height:.98;color:${INK}}
.ttl b em{font-style:normal;color:${RED};font-size:96px}
.ttl .bc{margin-top:12px;height:22px;width:380px;background:repeating-linear-gradient(90deg,${INK} 0 4px,transparent 4px 7px,${INK} 7px 9px,transparent 9px 14px,${INK} 14px 20px,transparent 20px 23px)}
.stk{display:inline-block;margin-top:18px;font-family:${HEAD};font-size:64px;line-height:1;color:#fff;background:${RED};border:5px solid ${INK};border-radius:999px;padding:12px 30px 10px;transform:rotate(-3deg);box-shadow:0 7px 0 ${INK}}
.stk.gn{background:${TEA};font-size:84px}
.row{display:flex;flex-direction:column;margin-top:16px;padding:10px 26px 12px;border-left:20px solid ${YEL};max-width:880px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:${HEAD};font-weight:400;font-size:52px;line-height:1.06;color:${INK}}
.row span{display:block;font-family:${MONO};font-weight:400;font-size:28px;line-height:1.25;color:#4D5566;max-width:800px}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}
.row.or{border-left-color:${ORA}}.row.bl{border-left-color:${BLU}}
.row.sm b{font-size:58px}
.big{display:flex;align-items:center;gap:20px;margin-top:16px;padding:10px 28px 12px 24px;border-left:20px solid ${YEL};width:max-content;max-width:880px;box-sizing:border-box}
.big>b{font-family:${HEAD};font-weight:400;font-size:104px;line-height:1;color:${INK};font-variant-numeric:tabular-nums}
.big em{display:block;font-style:normal;font-family:${HEAD};font-size:44px;line-height:1;color:${INK}}
.big>div>span{display:block;font-family:${MONO};font-size:26px;line-height:1.2;color:#4D5566;margin-top:6px}
.big.rd{border-left-color:${RED}}.big.rd>b{color:${RED}}
.big.or{border-left-color:${ORA}}.big.or>b{color:#D06A12}
.big.bl{border-left-color:${BLU}}.big.bl>b{color:${BLU}}
.q{margin-top:20px;padding:20px 28px 18px;font-family:${HEAD};font-size:60px;line-height:1.1;color:${INK};border-left:22px solid ${RED};max-width:880px}
#ripple{position:absolute;left:44px;top:1098px;width:960px;height:170px;z-index:10}
#ripple .arcs{position:absolute;left:0;top:0;width:960px;height:170px;overflow:hidden}
#ripple .rg{fill:none;stroke:${CREAM};stroke-width:5;stroke-dasharray:4 12;stroke-linecap:round;opacity:.9;transform-origin:62px 82px;filter:drop-shadow(0 2px 0 rgba(34,50,74,.6))}
#ripple .row6{position:absolute;left:0;top:14px;display:flex;align-items:center;gap:22px}
.tk{position:relative;width:132px;height:132px;box-sizing:border-box;background:${CREAM};border:5px solid ${INK};border-radius:50%;box-shadow:0 7px 0 ${INK};display:flex;flex-direction:column;align-items:center;justify-content:center}
.tk .ic{width:58px;height:58px;margin-top:-6px}.tk .ic svg{width:58px;height:58px;display:block}
.tk .tl{font-family:${HEAD};font-size:19px;line-height:.98;color:${INK};text-align:center;width:112px;margin-top:2px}
.tk.hero{background:${YEL}}
.tk .pz{position:absolute;inset:-12px;border:6px solid ${ORA};border-radius:50%;opacity:0;font-style:normal}
.wave{position:absolute;left:0;top:14px;width:132px;height:132px;border-radius:50%;border:6px solid ${ORA};opacity:0;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo-src.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP41_EVER_GIVEN_SUEZ_2021",
  ep: "41", bg: BG, vig: 0.28, grain: 0.04, capfloor: 0.28, html, css, chipFont: MONO, chipColor: "#FFFFFF",
  chip: "DIORAMA MAINAN &middot; ILUSTRASI, BUKAN CUPLIKAN ASLI",
  extraAt: ["s1:Selama", "s2:Terusan", "s2:dan", "s2:hanya", "s3:Ever", "s3:Panjangnya", "s3:empat#2", "s3:Badai", "s3:tujuh",
    "s4:Tumpukan", "s4:angin", "s4:kehilangan", "s4:kandas", "s4:Haluannya", "s4:buritannya", "s5:antrean", "s5:tiga", "s5:menunggu", "s5:Barang",
    "s6:Efeknya", "s6:cip", "s6:domba", "s6:kurcaci", "s6:Seratus", "s7:keruk", "s7:air", "s7:ekskavator", "s7:Dua", "s7:empat", "s7:menarik", "s7:lepas",
    "s8:menahan", "s2:Mesir", "s8:ganti", "s8:Satu", "s8:Menurut", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:e.classList.contains('big')||e.classList.contains('row')?'flex':'block'},t);tl.fromTo(e,{opacity:0,y:-40,rotation:-2},{opacity:1,y:0,rotation:0,duration:.42,ease:'back.out(1.7)',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},
 tok:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t-.01);tl.fromTo(e,{opacity:0,scale:.3,y:40},{opacity:1,scale:1,y:0,duration:.45,ease:'back.out(2.2)',immediateRender:false},t);},
 puls:(e,t)=>{tl.fromTo(e,{opacity:1,scale:.85},{opacity:0,scale:1.5,duration:.7,ease:'power2.out',immediateRender:false},t+.05);},
 ring:(e,t)=>{tl.fromTo(e,{opacity:0,scale:.2},{opacity:.9,scale:1,duration:.8,ease:'power3.out',immediateRender:false},t);},
 wave:(e,t)=>{document.querySelectorAll('#ripple .tk').forEach((k,i)=>{tl.fromTo(k,{y:0},{y:-24,duration:.16,yoyo:true,repeat:1,ease:'power2.out',immediateRender:false},t+i*.1);});},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-60},{opacity:1,y:0,duration:.4,ease:'back.out(1.5)'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-40,duration:.2,ease:'power2.in'},b-.22)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Titan One','Arial Black',sans-serif;font-weight:400;font-size:68px;line-height:1.1;color:#fff;-webkit-text-stroke:12px ${INK};paint-order:stroke fill;text-shadow:0 7px 0 ${INK}}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:26},{opacity:1,y:0,duration:.22,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ever Given Suez 2021", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
