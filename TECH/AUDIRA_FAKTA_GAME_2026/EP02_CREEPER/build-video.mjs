// EP02 BENGKEL VOXEL. Voxel modelling workshop on a floating island at dusk; panels build in from voxel tiles and break apart on exit. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const SKY = "#2E2A5A", GRS = "#5DBB4A", PNK = "#F4A6B8", LEF = "#3FA34D", ORG = "#FF7A1A", CRM = "#FFF6E5", INK = "#1B1838";
const SK = "Silkscreen,monospace", RB = "Rubik,sans-serif";

// Every card is backed by six tiles (3x2) so it can assemble and shatter.
const card = (inner, cls = "", attrs = "") => `<div class="card ${cls}" ${attrs}><div class="tiles"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="inner">${inner}</div></div>`;

const html = `
<div id="fl1" class="fl" data-at="s1:bug" data-fx="flash"></div>
<div id="fl2" class="fl warm" data-at="s6:meledak" data-fx="flash"></div>
<div id="fl3" class="fl blue" data-at="s6:Charged-0.15" data-fx="flash"></div>
<div id="fl4" class="fl blue" data-at="s6:tersambar" data-fx="flash"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME &middot; EP 02</div>
  ${card(`<div class="big">CREEPER<br><span>= BUG</span></div>`)}
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">VERSI AWAL</div>
  ${card(`<div class="h1 nb">20 AGU 2009</div>`, "", 'data-at="s2:Agustus" data-fx="snap"')}
  <div class="row">${card(`<div class="c">PRE-ALPHA</div>`, "o", 'data-at="s2:awal" data-fx="snap"')}</div>
  ${card(`<div class="c">Markus Persson &middot; <b>Notch</b></div>`, "dk", 'data-at="s2:Markus" data-fx="snap"')}
  <div class="row">${card(`<div class="c">membuat: model babi</div>`, "pk", 'data-at="s2:babi" data-fx="snap"')}</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">BUG-NYA</div>
  ${card(`<div class="h1">PANJANG <span class="sw">&#8644;</span> TINGGI</div>`, "", 'data-at="s3:menukar" data-fx="snap"')}
  <div class="row">${card(`<div class="c">cuma <b>dua angka</b> tertukar</div>`, "o", 'data-at="s3:kode" data-fx="snap"')}</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">KATA NOTCH</div>
  ${card(`<div class="q">&ldquo;Aku simpan saja, untuk makhluk yang menyeramkan.&rdquo;</div>`, "", 'data-at="s4:aku" data-fx="snap"')}
  <div class="row">${card(`<div class="c">creepy creature</div>`, "dk", 'data-at="s4:creepy" data-fx="snap"')}${card(`<div class="c">&rarr; CREEPER</div>`, "g", 'data-at="s4:Nama" data-fx="snap"')}</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">JADI MONSTER</div>
  <div class="row">${card(`<div class="c">hijau: tekstur daun</div>`, "g", 'data-at="s5:hijau" data-fx="snap"')}${card(`<div class="c">AI agresif</div>`, "o", 'data-at="s5:AI" data-fx="snap"')}</div>
  ${card(`<div class="h1 nb">1 SEP 2009</div>`, "", 'data-at="s5:September" data-fx="snap"')}
  ${card(`<div class="mono">0.24_SURVIVAL_TEST</div>`, "dk", 'data-at="s5:bernama" data-fx="snap"')}
</div>
<div class="p" data-in="s6" data-out="s6:Belakangan">
  <div class="tag">CARA MENYERANG</div>
  <div class="row">${card(`<div class="c">diam-diam</div>`, "dk", 'data-at="s6:mendekat" data-fx="snap"')}${card(`<div class="c">mendesis</div>`, "", 'data-at="s6:mendesis" data-fx="snap"')}</div>
  <div class="row">${card(`<div class="h1">MELEDAK</div>`, "o", 'data-at="s6:meledak" data-fx="stamp"')}</div>
</div>
<div class="p" data-in="s6:Belakangan" data-out="s7">
  <div class="tag">VERSI LAIN</div>
  ${card(`<div class="h1 cy">CHARGED CREEPER</div>`, "dk", 'data-at="s6:Charged" data-fx="snap"')}
  <div class="row">${card(`<div class="c">tersambar petir</div>`, "", 'data-at="s6:tersambar" data-fx="snap"')}</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">IKON MINECRAFT</div>
  <div class="row">${card(`<div class="c">merchandise</div>`, "g", 'data-at="s7:merchandise" data-fx="snap"')}${card(`<div class="c">iklan</div>`, "pk", 'data-at="s7:iklan" data-fx="snap"')}</div>
  ${card(`<div class="h1 nb">TOP 50 PENJAHAT GAME</div><div class="sub">GUINNESS WORLD RECORDS GAMER'S EDITION</div>`, "gold", 'data-at="s7:lima" data-fx="snap"')}
</div>
<div class="p" data-in="s8" data-out="@END">
  ${card(`<div class="big sm">Kesalahan jadi<br><span>ide terbaik</span></div>`, "", 'data-at="s8:Jadi" data-fx="snap"')}
  ${card(`<div class="c">Kamu pernah bikin salah yang malah keren?</div>`, "g", 'data-at="s8:Kamu" data-fx="snap"')}
</div>`;

const css = `
.tag{display:inline-block;font-family:Silkscreen,monospace;font-weight:700;font-size:28px;letter-spacing:.04em;color:${CRM};background:${LEF};padding:8px 18px 6px;margin-bottom:14px;box-shadow:0 6px 0 ${INK}}
.card{position:relative;display:block;margin-bottom:16px;color:${INK}}
.row{display:flex;flex-wrap:wrap;gap:14px}.row .card{display:inline-block}
.card .tiles{position:absolute;inset:0;z-index:0}
.card .tiles i{position:absolute;width:33.6%;height:50.4%;background:${CRM};box-shadow:inset 0 0 0 3px rgba(46,42,90,.16),0 8px 0 ${INK}}
.card .tiles i:nth-child(1){left:0;top:0}.card .tiles i:nth-child(2){left:33.2%;top:0}.card .tiles i:nth-child(3){left:66.4%;top:0}
.card .tiles i:nth-child(4){left:0;top:49.6%}.card .tiles i:nth-child(5){left:33.2%;top:49.6%}.card .tiles i:nth-child(6){left:66.4%;top:49.6%}
.card .inner{position:relative;z-index:1;padding:16px 26px 18px}
.card.o .tiles i{background:${ORG}}.card.o{color:${CRM}}
.card.g .tiles i{background:${LEF}}.card.g{color:${CRM}}
.card.pk .tiles i{background:${PNK}}
.card.dk .tiles i{background:${INK};box-shadow:inset 0 0 0 3px rgba(255,246,229,.18),0 8px 0 #0d0b20}.card.dk{color:${CRM}}
.card.gold .tiles i{background:#F2B632}
.big{font-family:Rubik,sans-serif;font-weight:800;font-size:124px;line-height:.98;letter-spacing:-.01em}.big span{color:${ORG}}.big.sm{font-size:80px;line-height:1.04}
.h1{font-family:Rubik,sans-serif;font-weight:800;font-size:66px;line-height:1.04}
.h1 .sw{color:${ORG}}.h1.cy{color:#7FD8FF}
.c{font-family:Rubik,sans-serif;font-weight:800;font-size:42px;line-height:1.1}.c b{color:${ORG}}.card.dk .c b{color:${GRS}}.card.o .c b{color:${INK}}
.q{font-family:Rubik,sans-serif;font-weight:800;font-size:52px;line-height:1.12}
.mono{font-family:Silkscreen,monospace;font-weight:700;font-size:44px;line-height:1.1;color:${GRS}}
.sub{font-family:Silkscreen,monospace;font-weight:400;font-size:24px;margin-top:8px;letter-spacing:.02em}
.fl{position:absolute;inset:0;background:#fff;z-index:12;pointer-events:none}.fl.warm{background:#FFD9A0}.fl.blue{background:rgba(190,232,255,.45)}
#chip{font-family:Silkscreen,monospace;font-weight:400;color:${CRM};background:rgba(27,24,56,.75);padding:4px 12px;top:176px;font-size:20px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const TX = "[-110,0,110,-110,0,110]", TY = "[-70,-90,-70,70,90,70]", TR = "[-22,14,-9,18,-14,24]";
const { AT, K } = writeWorld(TL, at, {
  ep: "02", bg: SKY, vig: 0.38, grain: 0.035, capfloor: 0.35, html, css, chipFont: "Silkscreen", chipColor: CRM,
  extraAt: ["s1:bug", "s2:Minecraft", "s2:babi", "s3:menukar", "s3:malah", "s3:empat", "s3:kode", "s4:Hasilnya", "s4:creepy", "s5:hijau", "s5:game", "s5:AI", "s5:agresif", "s5:Satu", "s6:Creeper", "s6:Dia", "s6:mendesis", "s6:meledak", "s6:terluka", "s6:mati", "s6:Charged", "s6:tersambar", "s7:merchandise", "s7:iklan", "s7:lima", "s8:Kamu"],
  // Block assemble: the six tiles step in from scattered positions, then the text appears.
  panelIn: `(tl,p,a)=>{const ts=p.querySelectorAll('.tiles i');tl.set(p,{opacity:1},a-.14);
    tl.fromTo(p.querySelectorAll('.tag'),{x:-60,opacity:0},{x:0,opacity:1,duration:.2,ease:'steps(3)'},a-.14);
    if(ts.length)tl.fromTo(ts,{x:(i)=>${TX}[i%6],y:(i)=>${TY}[i%6],scale:.4,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:.24,ease:'steps(4)',stagger:.03},a-.12);
    tl.fromTo(p.querySelectorAll('.inner'),{opacity:0},{opacity:1,duration:.08,ease:'none'},a+.1);}`,
  // Exit: the card breaks into its tiles, which fall away.
  panelOut: `(tl,p,b)=>{const ts=p.querySelectorAll('.tiles i');
    tl.to(p.querySelectorAll('.inner,.tag'),{opacity:0,duration:.08,ease:'none'},b-.24);
    if(ts.length)tl.to(ts,{x:(i)=>${TX}[i%6]*1.3,y:(i)=>160+(i%6)*24,rotation:(i)=>${TR}[i%6],opacity:0,duration:.22,ease:'power2.in',stagger:.015},b-.22);}`,
  fxExtra: `snap:(e,t)=>tl.fromTo(e,{scale:.35,opacity:0},{scale:1,opacity:1,duration:.24,ease:'steps(4)'},t),
 flash:(e,t)=>{tl.fromTo(e,{opacity:0},{opacity:.92,duration:.04,ease:'none'},t);tl.to(e,{opacity:0,duration:.5,ease:'power2.out'},t+.06);},`,
  // Outro assembles in six block rows.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 0 100% 0)'});tl.to('#outro',{clipPath:'inset(0 0 0% 0)',duration:.48,ease:'steps(6)'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Rubik,sans-serif;font-weight:800;font-size:62px;line-height:1.16;color:#fff;text-shadow:5px 0 0 ${INK},-5px 0 0 ${INK},0 5px 0 ${INK},0 -5px 0 ${INK},4px 4px 0 ${INK},-4px 4px 0 ${INK},4px -4px 0 ${INK},-4px -4px 0 ${INK},0 9px 0 ${INK}}
.w{display:inline-block;margin:0 .14em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#fff",y:0},{color:"${LEF}",y:-8,duration:.06,ease:"steps(2)"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:16,opacity:0},{y:0,opacity:1,duration:.14,ease:"steps(3)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Bengkel Voxel", SKY);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
