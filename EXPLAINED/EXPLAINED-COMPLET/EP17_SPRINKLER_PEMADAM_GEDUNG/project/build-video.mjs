import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";
import { copyFileSync } from "node:fs";

const TL = loadTimeline(".");
const at = anchors(TL);

// DISASTERSIM palette
const C = {
  bg: "#1A1A1A",
  fire: "#FF4500",
  warn: "#FF6600",
  alarm: "#FFD700",
  water: "#0066CC",
  red: "#FF2200",
  text: "#FFFFFF",
  muted: "#AAAAAA",
  panel: "rgba(15,5,5,0.82)",
  border: "#FF4500",
};

const FONT = "'Share Tech Mono',monospace";
const TITLE_FONT = "'Outfit',sans-serif";

const html = `
<div class="p" data-in="@0" data-out="s1e" data-first="1">
  <div class="hud-box hook-title">
    <div class="hud-line" data-at="s1:sprinkler" data-fx="left">SPRINKLER PEMADAM</div>
    <div class="hud-sub" data-at="s1:gedung" data-fx="up">KACA KECIL DI PLAFON YANG MENAHAN BANJIR</div>
  </div>
</div>

<div class="p" data-in="s2" data-out="s2e">
  <div class="hud-box">
    <div class="hud-tag" data-at="s2:katup" data-fx="pop">KATUP KECIL</div>
    <div class="hud-detail" data-at="s2:air" data-fx="up">AIR BERTEKANAN · SIAP 24/7</div>
  </div>
</div>

<div class="p" data-in="s3" data-out="s3e">
  <div class="hud-box">
    <div class="hud-tag" data-at="s3:tabung" data-fx="pop">TABUNG KACA</div>
    <div class="hud-detail" data-at="s3:sumbat" data-fx="up">CAIRAN → SUMBAT → TUTUP LUBANG AIR</div>
  </div>
</div>

<div class="p" data-in="s4" data-out="s4e">
  <div class="hud-box temp-box">
    <div class="hud-warn" data-at="s4:api" data-fx="stamp">⚠ SUHU NAIK</div>
    <div class="hud-temp" data-at="s4:memuai" data-fx="fade"><b class="ct nb" data-from="20" data-to="68" data-a="s4:memuai" data-d="4" data-dec="0" data-suf="°C"></b></div>
    <div class="hud-detail" data-at="s4:naik" data-fx="up">TEKANAN MEMUAI → KACA RETAK</div>
  </div>
</div>

<div class="p" data-in="s5" data-out="s5e">
  <div class="hud-box alert-box">
    <div class="hud-alert" data-at="s5:pecah" data-fx="stamp">PECAH!</div>
    <div class="hud-detail" data-at="s5:deflektor" data-fx="left">DEFLEKTOR → SEMPROTAN PAYUNG</div>
  </div>
</div>

<div class="p" data-in="s6" data-out="s6e">
  <div class="hud-box">
    <div class="hud-tag" data-at="s6:sendiri" data-fx="pop">BEKERJA MANDIRI</div>
    <div class="hud-detail" data-at="s6:panas" data-fx="up">PEMICU: PANAS · BUKAN ASAP</div>
    <div class="hud-detail" data-at="s6:tombol" data-fx="fade">TANPA TOMBOL · OTOMATIS</div>
  </div>
</div>

<div class="p" data-in="s7" data-out="s7e">
  <div class="hud-box">
    <div class="hud-tag" data-at="s7:kode" data-fx="pop">KODE WARNA SUHU</div>
    <div class="hud-detail" data-at="s7:merah" data-fx="left">MERAH = 68°C · PALING UMUM</div>
    <div class="hud-stat" data-at="s7:sembilan" data-fx="pop"><b class="ct nb" data-from="0" data-to="90" data-a="s7:sembilan" data-d="1.5" data-dec="0" data-suf="%"></b> KEBAKARAN CUKUP 1 SPRINKLER</div>
  </div>
</div>

<div class="p" data-in="s8" data-out="@END">
  <div class="hud-box conclusion-box">
    <div class="hud-tag" data-at="s8:termometer" data-fx="pop">TERMOMETER + KUNCI AIR</div>
    <div class="hud-detail" data-at="s8:AUDIRA" data-fx="fade">AUDIRA · CARA KERJA BENDA</div>
  </div>
</div>
`;

const css = `
.hud-box{background:${C.panel};border-left:3px solid ${C.border};padding:22px 28px;border-radius:0 8px 8px 0}
.hook-title .hud-line{font-family:${TITLE_FONT};font-weight:800;font-size:52px;color:${C.alarm};letter-spacing:.03em;line-height:1.15}
.hook-title .hud-sub{font-family:${FONT};font-weight:400;font-size:22px;color:${C.muted};margin-top:10px;letter-spacing:.06em}
.hud-tag{font-family:${TITLE_FONT};font-weight:700;font-size:38px;color:${C.alarm};letter-spacing:.02em}
.hud-detail{font-family:${FONT};font-size:21px;color:${C.text};margin-top:8px;letter-spacing:.04em;opacity:.88}
.hud-warn{font-family:${FONT};font-weight:700;font-size:30px;color:${C.red};letter-spacing:.06em}
.hud-temp{font-family:${FONT};font-weight:700;font-size:62px;color:${C.fire};margin:6px 0;letter-spacing:.02em}
.hud-alert{font-family:${TITLE_FONT};font-weight:900;font-size:56px;color:${C.red};letter-spacing:.04em;text-shadow:0 0 24px rgba(255,34,0,.5)}
.alert-box{border-color:${C.red};background:rgba(40,5,5,.88)}
.temp-box{border-color:${C.warn}}
.hud-stat{font-family:${FONT};font-weight:700;font-size:28px;color:${C.alarm};margin-top:10px}
.conclusion-box{border-color:${C.alarm};background:rgba(20,15,5,.85)}
`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");

const { K, AT } = writeWorld(TL, at, {
  ep: "17",
  bg: C.bg,
  vig: 0.5,
  grain: 0.06,
  capfloor: 0.55,
  html,
  css,
  chipFont: FONT,
  chipColor: C.muted,
  sig: "EP17_SPRINKLER_PEMADAM_GEDUNG",
  panelIn: `(tl,p,t)=>tl.fromTo(p,{x:-60,opacity:0},{x:0,opacity:1,duration:.35,ease:'power3.out'},t)`,
  panelOut: `(tl,p,t)=>tl.to(p,{x:40,opacity:0,duration:.28,ease:'power2.in'},t)`,
  fxExtra: "",
});

const CAP_CSS = `.cap{position:absolute;left:52px;right:52px;bottom:420px;text-align:center;z-index:30}
.capin{display:inline;line-height:1.55}
.w{font-family:${TITLE_FONT};font-weight:700;font-size:38px;color:rgba(255,255,255,.5);transition:color .08s}
.w.on{color:#fff;text-shadow:0 1px 8px rgba(255,68,0,.45)}`;

writeCaptions(".", TL, CAP_CSS,
  (id, w) => `tl.to('#${id}',{className:'+=on',duration:.01},${(w.start - 0.04).toFixed(3)});tl.to('#${id}',{className:'-=on',duration:.01},${(w.end + 0.06).toFixed(3)});`,
);

writeIndex(".", TL, "EP17 — Sprinkler Pemadam Gedung", C.bg);
console.log("build OK — EP17 DISASTERSIM");
