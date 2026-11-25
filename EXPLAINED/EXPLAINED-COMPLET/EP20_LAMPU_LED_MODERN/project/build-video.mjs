// EP20 LAMPU LED MODERN — CIRCUITFORGE panels + build orchestration
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";
import { copyFileSync } from "node:fs";

const TL = loadTimeline(".");
const at = anchors(TL);

// CIRCUITFORGE palette
const BG   = "#0A1628";
const PCB  = "#1B5E20";
const COP  = "#CD7F32";
const BLUE = "#448AFF";
const GOLD = "#FFD600";
const GREY = "#9E9E9E";
const WHITE = "#FFFDE7";
const RED  = "#EF5350";
const GREEN = "#66BB6A";
const FONT = "'Fira Code',Consolas,monospace";
const BODY = "Outfit,sans-serif";

const html = `
<!-- s1: hook — LED putih = biru menyamar -->
<div class="p" data-first="1" data-in="@0" data-out="s2" style="top:260px;left:56px;right:110px">
  <div style="font-family:${FONT};font-weight:800;font-size:54px;color:${BLUE};line-height:1.1;text-shadow:0 0 24px rgba(41,98,255,.5)" data-at="s1:LED" data-fx="pop">LAMPU LED</div>
  <div style="margin-top:14px;font-family:${BODY};font-weight:600;font-size:30px;color:${WHITE};opacity:.85" data-at="s1:biru" data-fx="up">Cahaya biru yang menyamar jadi putih</div>
</div>

<!-- s2: lampu pijar — panas bukan cahaya -->
<div class="p" data-in="s2" data-out="s3" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:28px;color:${RED};letter-spacing:.03em" data-at="s2:kawat" data-fx="up">LAMPU PIJAR</div>
  <div style="margin-top:16px;font-family:${BODY};font-weight:700;font-size:44px;color:${WHITE}" data-at="s2:membara" data-fx="pop">95% Panas</div>
  <div style="margin-top:6px;font-family:${BODY};font-weight:500;font-size:26px;color:${GREY}" data-at="s2:panas" data-fx="fade">Hanya 5% energi → cahaya</div>
</div>

<!-- s3: LED = dioda pemancar cahaya -->
<div class="p" data-in="s3" data-out="s4" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:24px;color:${COP};letter-spacing:.06em" data-at="s3:LED" data-fx="left">LIGHT EMITTING DIODE</div>
  <div style="margin-top:16px;font-family:${BODY};font-weight:600;font-size:34px;color:${BLUE}" data-at="s3:chip" data-fx="up">Chip semikonduktor mungil</div>
  <div style="margin-top:8px;font-family:${BODY};font-weight:400;font-size:24px;color:${GREY}" data-at="s3:semikonduktor" data-fx="fade">Tanpa kawat membara</div>
</div>

<!-- s4: lapisan chip — N dan P -->
<div class="p" data-in="s4" data-out="s5" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:26px;color:${WHITE}" data-at="s4:Chip" data-fx="up">LAPISAN CHIP</div>
  <div style="margin-top:18px;display:flex;gap:16px">
    <div style="flex:1;background:rgba(21,101,192,.25);border:2px solid ${BLUE};border-radius:10px;padding:14px;text-align:center" data-at="s4:elektron" data-fx="left">
      <div style="font-family:${FONT};font-weight:700;font-size:22px;color:${BLUE}">TIPE-N</div>
      <div style="font-family:${BODY};font-size:18px;color:${GREY};margin-top:4px">Kelebihan elektron</div>
    </div>
    <div style="flex:1;background:rgba(198,40,40,.2);border:2px solid ${RED};border-radius:10px;padding:14px;text-align:center" data-at="s4:lubang" data-fx="left">
      <div style="font-family:${FONT};font-weight:700;font-size:22px;color:${RED}">TIPE-P</div>
      <div style="font-family:${BODY};font-size:18px;color:${GREY};margin-top:4px">Lubang (hole)</div>
    </div>
  </div>
</div>

<!-- s5: rekombinasi → foton -->
<div class="p" data-in="s5" data-out="s6" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:26px;color:${GOLD};letter-spacing:.04em" data-at="s5:elektron" data-fx="pop">REKOMBINASI</div>
  <div style="margin-top:14px;font-family:${BODY};font-weight:600;font-size:30px;color:${WHITE}" data-at="s5:cahaya" data-fx="up">Elektron + Lubang → Foton</div>
  <div style="margin-top:8px;font-family:${BODY};font-weight:400;font-size:22px;color:${GREY}" data-at="s5:semikonduktornya" data-fx="fade">Warna = bahan semikonduktor</div>
</div>

<!-- s6a: GaN + fosfor -->
<div class="p" data-in="s6" data-out="s6:driver-0.3" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:24px;color:${BLUE}" data-at="s6:galium" data-fx="left">GaN — GALIUM NITRIDA</div>
  <div style="margin-top:14px;display:flex;align-items:center;gap:12px" data-at="s6:fosfor" data-fx="up">
    <div style="width:32px;height:32px;border-radius:50%;background:${BLUE}"></div>
    <div style="font-family:${BODY};font-size:24px;color:${WHITE}">+ Fosfor →</div>
    <div style="width:32px;height:32px;border-radius:50%;background:${GOLD}"></div>
    <div style="font-family:${BODY};font-size:24px;color:${WHITE}">= Putih</div>
    <div style="width:32px;height:32px;border-radius:50%;background:${WHITE}"></div>
  </div>
</div>

<!-- s6b: driver + heatsink -->
<div class="p" data-in="s6:driver-0.3" data-out="s7" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:24px;color:${GREEN}" data-at="s6:driver" data-fx="up">DRIVER — AC → DC</div>
  <div style="margin-top:12px;font-family:${BODY};font-weight:500;font-size:24px;color:${GREY}" data-at="s6:panas" data-fx="fade">Heatsink logam membuang panas chip</div>
</div>

<!-- s7: Nobel Fisika 2014 -->
<div class="p" data-in="s7" data-out="s8" style="top:260px">
  <div style="font-family:${FONT};font-weight:800;font-size:30px;color:${GOLD};letter-spacing:.05em" data-at="s7:Akasaki" data-fx="stamp">NOBEL FISIKA 2014</div>
  <div style="margin-top:14px;font-family:${BODY};font-weight:600;font-size:24px;color:${WHITE};line-height:1.5" data-at="s7:Nobel" data-fx="up">Akasaki · Amano · Nakamura</div>
  <div style="margin-top:16px;display:flex;gap:24px" data-at="s7:lumen" data-fx="left">
    <div style="text-align:center">
      <div style="font-family:${FONT};font-weight:700;font-size:36px;color:${GREEN}">300+</div>
      <div style="font-family:${BODY};font-size:18px;color:${GREY}">lm/W LED</div>
    </div>
    <div style="font-family:${BODY};font-size:28px;color:${GREY};align-self:center">vs</div>
    <div style="text-align:center">
      <div style="font-family:${FONT};font-weight:700;font-size:36px;color:${RED}">16</div>
      <div style="font-family:${BODY};font-size:18px;color:${GREY}">lm/W pijar</div>
    </div>
  </div>
</div>

<!-- s8: kesimpulan -->
<div class="p" data-in="s8" data-out="@END" style="top:260px">
  <div style="font-family:${FONT};font-weight:700;font-size:28px;color:${WHITE}" data-at="s8:biru" data-fx="pop">BIRU + KUNING = PUTIH</div>
  <div style="margin-top:12px;font-family:${BODY};font-weight:500;font-size:24px;color:${GREY}" data-at="s8:AUDIRA" data-fx="fade">AUDIRA — Cara Kerja Benda</div>
</div>
`;

const css = `
.p{font-family:${BODY}}
`;

const panelIn = `(tl,p,a)=>tl.fromTo(p,{y:40,opacity:0},{y:0,opacity:1,duration:.35,ease:'power3.out'},a)`;
const panelOut = `(tl,p,b)=>tl.to(p,{y:-30,opacity:0,duration:.25,ease:'power2.in'},b)`;

copyFileSync("world3d.js", "hf/assets/lib/world3d.js");

const { K, AT } = writeWorld(TL, at, {
  ep: "20",
  bg: BG,
  vig: 0.45,
  grain: 0.04,
  capfloor: 0.5,
  html,
  css,
  chipFont: `${FONT}`,
  chipColor: COP,
  sig: "EP20_LAMPU_LED_MODERN",
  panelIn,
  panelOut,
});

// Captions
const capCSS = `.cap{position:absolute;left:72px;right:72px;bottom:420px;text-align:center;z-index:30}
.capin{display:inline-block;background:rgba(10,22,40,.82);border-radius:12px;padding:8px 18px;border:1px solid rgba(205,127,50,.25)}
.w{font-family:${BODY};font-weight:600;font-size:30px;color:rgba(255,253,231,.7);transition:color .08s}
.w.on{color:#FFD600;text-shadow:0 0 8px rgba(255,214,0,.4)}`;

writeCaptions(".", TL, capCSS,
  (id, w) => `tl.set('#${id}',{className:'+=on'},${w.start});tl.set('#${id}',{className:'-=on'},${w.end});\n`,
  (gid, s) => `tl.fromTo('#${gid}',{y:12,opacity:0},{y:0,opacity:1,duration:.2,ease:'power2.out'},${s});\n`
);

writeIndex(".", TL, "EP20 Lampu LED Modern — AUDIRA", BG);

console.log("EP20 build OK — scenes:", TL.scenes.length, "words:", TL.words.length);
