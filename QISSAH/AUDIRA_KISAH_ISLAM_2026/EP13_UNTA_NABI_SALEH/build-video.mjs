// EP13 UNTA NABI SALEH. URBANFORGE: white architectural maquette of a sandstone valley city, moving sun, crisp shadows;
// a HISTORYMAP plaster survey map for Al-Hijr in s7. Panels are architect's drawing sheets (paper, ink, terracotta section red).
// Transition: an architectural section cut slides across each sheet (dash-dot cut line + hatched poche on the cut face).
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#EFE9DD", INK = "#1E2A33", RED = "#C4532F", PAPER = "#F7F4EE", SAND = "#D8C3A0", WATER = "#6FB2C4";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP13_unta_saleh.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V149 = verse("26:149");
const V9114 = verse("91:14");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;
const camelIc = `<svg class="ic" viewBox="0 0 120 90"><g fill="#7a5634"><ellipse cx="50" cy="44" rx="30" ry="15"/><ellipse cx="46" cy="30" rx="15" ry="12"/><path d="M74 40q16 2 18-22l9 0q0 30-22 32z"/><ellipse cx="99" cy="16" rx="11" ry="6"/></g><g stroke="#7a5634" stroke-width="6" stroke-linecap="round"><path d="M30 52l-2 32M40 54l0 30M62 54l2 30M72 52l3 32"/></g></svg>`;
const folkIc = `<svg class="ic" viewBox="0 0 120 90"><g fill="#2f5560"><circle cx="34" cy="22" r="9"/><path d="M21 84q-2-50 13-50t13 50z"/><circle cx="60" cy="18" r="10"/><path d="M45 84q-2-56 15-56t15 56z"/><circle cx="86" cy="22" r="9"/><path d="M73 84q-2-50 13-50t13 50z"/></g></svg>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 13</div>
    <div class="h">UNTA NABI SALEH</div>
    <div class="row" data-at="s1:dua" data-fx="cut"><b class="tag">SATU SUMBER AIR, DUA GILIRAN</b>${ref("QS 26:155")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Surah">
  <div class="card">
    <div class="k"><i></i>KAUM TSAMUD ${ref("QS 26:146-149")}</div>
    <div class="h m">HIDUP MAKMUR</div>
    <div class="ls">
      <span data-at="s2:memahat" data-fx="cut">Rumah dipahat di gunung</span>
      <span data-at="s2:kebun" data-fx="cut">Kebun dan mata air</span>
      <span data-at="s2:kurma" data-fx="cut">Kurma yang mayangnya lembut</span>
    </div>
  </div>
</div>
<div class="p" data-in="s2:Surah" data-out="s3">
  <div class="card">
    <div class="k"><i></i>SURAH ASY-SYU'ARA ${ref("QS 26:149", "s2:Asy-Syu'ara")}</div>
    <div class="ar">${V149}</div>
    <div class="tr">&ldquo;Dan kamu pahat dengan terampil sebagian gunung-gunung untuk dijadikan rumah-rumah&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Jawab">
  <div class="card">
    <div class="k"><i></i>AJAKAN NABI SALEH ${ref("QS 7:73", "s3:mengajak")}</div>
    <div class="h m">&ldquo;Sembahlah Allah!&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3:Jawab" data-out="s4">
  <div class="card">
    <div class="k"><i></i>JAWAB MEREKA ${ref("QS 26:154")}</div>
    <div class="qt" data-at="s3:kamu" data-fx="cut">&ldquo;Engkau hanyalah manusia seperti kami.&rdquo;</div>
    <div class="tag2" data-at="s3:Datangkan" data-fx="cut">Datangkanlah suatu mukjizat!</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Pesannya">
  <div class="card">
    <div class="k"><i></i>TANDA DARI ALLAH ${ref("QS 7:73", "s4:unta")}</div>
    <div class="h">UNTA BETINA</div>
    <div class="sub" data-at="s4:Allah" data-fx="cut">dari Allah sebagai tanda untukmu</div>
  </div>
</div>
<div class="p" data-in="s4:Pesannya" data-out="s5">
  <div class="card">
    <div class="k"><i></i>PEMBAGIAN AIR ${ref("QS 26:155")}</div>
    <div class="turn">
      <div class="tc" data-at="s4:unta#2" data-fx="cut">${camelIc}<b>GILIRAN UNTA</b></div>
      <div class="tc b" data-at="s4:kalian" data-fx="cut">${folkIc}<b>GILIRAN KALIAN</b></div>
    </div>
    <div class="warn" data-at="s4:Jangan" data-fx="cut"><b>Jangan sentuh dia dengan niat jahat</b>${ref("QS 26:156")}</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:lalu">
  <div class="card">
    <div class="k"><i></i>PENOLAKAN ${ref("QS 7:76")}</div>
    <div class="h m">Para pemuka yang sombong menolak</div>
    <div class="ln" data-at="s5:memanggil" data-fx="cut"><span>Memanggil kawannya</span>${ref("QS 54:29")}</div>
    <div class="ln" data-at="s5:celaka" data-fx="cut"><span>orang paling celaka di antara mereka</span>${ref("QS 91:12")}</div>
  </div>
</div>
<div class="p" data-in="s5:lalu" data-out="s6">
  <div class="card">
    <div class="k"><i></i>UNTA ITU DISEMBELIH ${ref("QS 7:77")}</div>
    <div class="qt" data-at="s5:Wahai" data-fx="cut">&ldquo;Wahai Saleh! Buktikanlah ancaman kamu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Surah">
  <div class="card">
    <div class="k"><i></i>GEMPA ${ref("QS 7:78", "s6:gempa")}</div>
    <div class="h m">Rumah pahatan menjadi reruntuhan</div>
  </div>
</div>
<div class="p" data-in="s6:Surah" data-out="s7">
  <div class="card">
    <div class="k"><i></i>SURAH ASY-SYAMS ${ref("QS 91:14", "s6:Asy-Syams")}</div>
    <div class="ar">${V9114}</div>
    <div class="tr" data-at="s6:Tuhan" data-fx="cut">&ldquo;Tuhan membinasakan mereka karena dosanya, lalu diratakan-Nya (dengan tanah).&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  <div class="card">
    <div class="k"><i></i>BARAT LAUT ARAB SAUDI</div>
    <div class="h">AL-HIJR <small>Mada'in Saleh</small></div>
    <div class="sub" data-at="s7:mengaitkan" data-fx="cut">Dikaitkan Al-Qur'an dengan kaum Tsamud</div>
  </div>
</div>
<div class="p" data-in="s7:Tapi" data-out="s8">
  <div class="card">
    <div class="k"><i></i>SITUS HARI INI</div>
    <div class="h m">Makam batu: Kerajaan Nabath</div>
    <div class="sub" data-at="s7:jauh" data-fx="cut">dipahat jauh setelah kaum Tsamud</div>
    <div class="stamp" data-at="s7:UNESCO" data-fx="cut"><small>WARISAN DUNIA</small>UNESCO 2008</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>PELAJARAN</div>
    <div class="h m">Ujiannya: kesediaan berbagi air</div>
    <div class="ask" data-at="s8:Menurut" data-fx="cut">Ujian berbagi apa yang paling sulit hari ini?</div>
  </div>
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(30,42,51,0),rgba(30,42,51,.14) 45%,rgba(30,42,51,.14) 70%,rgba(30,42,51,0))}
#chip{background:rgba(247,244,238,.9);padding:5px 12px 4px;border-radius:3px;font-size:20px;letter-spacing:.06em}
.p{--r:0;--l:0}
.card{position:relative;background:${PAPER};padding:22px 30px 24px;border:2px solid ${INK};box-shadow:10px 12px 0 rgba(30,42,51,.18),0 18px 36px rgba(0,0,0,.18);
 clip-path:inset(-4px calc(var(--r) * 1% - 4px) -4px calc(var(--l) * 1% - 4px))}
.card:before,.card:after{content:"";position:absolute;width:18px;height:18px;border:2px solid ${RED};pointer-events:none}
.card:before{left:8px;top:8px;border-right:0;border-bottom:0}
.card:after{right:8px;bottom:8px;border-left:0;border-top:0}
.p:before,.p:after{content:"";position:absolute;top:-14px;bottom:-14px;width:36px;pointer-events:none;
 background:linear-gradient(90deg,transparent 0 30px,${RED} 30px 34px,transparent 34px),repeating-linear-gradient(135deg,rgba(196,83,47,.55) 0 3px,transparent 3px 9px);
 background-size:36px 100%,30px 100%;background-repeat:no-repeat}
.p:before{left:calc((100 - var(--r)) * 1% - 34px);opacity:clamp(0,calc(var(--r) * .25),1)}
.p:after{left:calc(var(--l) * 1% - 34px);opacity:clamp(0,calc(var(--l) * .25),1);transform:scaleX(-1)}
.p[data-first="1"]:before{display:none}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:26px;letter-spacing:.14em;color:${RED};margin-bottom:8px}
.k i{display:block;width:22px;height:22px;border:3px solid ${RED};border-radius:50%;position:relative}
.k i:after{content:"";position:absolute;left:-6px;right:-6px;top:50%;height:2px;background:${RED}}
.h{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:70px;line-height:1.04;color:${INK};letter-spacing:-.01em}
.h.m{font-size:54px;line-height:1.08}
.h small{font-size:36px;font-weight:500;color:#5b6670;letter-spacing:0}
.sub{font-family:"IBM Plex Sans",sans-serif;font-weight:500;font-size:36px;line-height:1.2;color:#3b4852;margin-top:8px}
.tr{font-family:"IBM Plex Sans",sans-serif;font-weight:500;font-style:italic;font-size:31px;line-height:1.3;color:#3b4852;margin-top:6px}
.qt{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:48px;line-height:1.12;color:${INK}}
.rf{display:inline-block;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:24px;letter-spacing:.06em;color:${PAPER};background:${INK};padding:4px 12px 3px;white-space:nowrap}
.row{display:flex;align-items:center;gap:18px;margin-top:14px;flex-wrap:wrap}
.tag{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:36px;letter-spacing:.03em;color:${RED}}
.tag2{display:inline-block;margin-top:14px;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:40px;color:${PAPER};background:${RED};padding:6px 16px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:58px;line-height:1.6;color:${INK}}
.ls{display:flex;flex-direction:column;gap:4px;margin-top:6px}
.ls span{font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:38px;color:${INK};padding-left:34px;position:relative}
.ls span:before{content:"";position:absolute;left:0;top:.42em;width:18px;height:18px;border:3px solid ${RED};box-sizing:border-box}
.turn{display:flex;gap:16px;margin-top:4px}
.tc{flex:1;display:flex;align-items:center;gap:12px;border:2px solid ${INK};padding:8px 14px;background:#EADBC0}
.tc.b{background:#CFE3E8}
.tc .ic{width:86px;height:64px;flex:none}
.tc b{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:30px;line-height:1.05;color:${INK}}
.warn{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:2px dashed ${INK}}
.warn b{font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:34px;color:${RED}}
.ln{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid rgba(30,42,51,.25)}
.ln span:not(.rf){font-family:"IBM Plex Sans",sans-serif;font-weight:600;font-size:38px;line-height:1.15;color:${INK}}
.stamp{display:inline-block;margin-top:16px;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:46px;color:${RED};border:4px solid ${RED};padding:4px 18px 6px;transform-origin:30% 50%}
.stamp small{display:block;font-size:20px;letter-spacing:.2em}
.ask{display:inline-block;margin-top:14px;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:40px;line-height:1.15;color:${PAPER};background:${INK};padding:10px 18px}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Aturan", "s1:sehari", "s1:sehari#2", "s1:seekor", "s1:seluruh", "s1:ujian", "s1:Tsamud", "s1:unta", "s1:kaum",
  "s2:makmur", "s2:memahat", "s2:rumah", "s2:kebun", "s2:kurma", "s2:Surah", "s3:Nabi", "s3:Datangkan",
  "s4:Datanglah", "s4:Allah", "s4:Jangan", "s4:giliran", "s4:giliran#2", "s4:kalian",
  "s5:unta", "s5:disembelih", "s5:memanggil", "s5:lalu", "s5:Wahai", "s5:kata", "s5:celaka",
  "s6:gempa", "s6:Rumah-rumah", "s6:reruntuhan", "s6:Surah", "s6:Tuhan",
  "s7:Al-Hijr", "s7:Al-Qur'an", "s7:makam", "s7:Situs", "s7:UNESCO", "s7:Tapi", "s8:Menurut", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "13", bg: BG, vig: 0.28, grain: 0.05, capfloor: 0.14, html, css, signature: "EP13_UNTA_NABI_SALEH",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "IBM Plex Sans,sans-serif", chipColor: INK,
  extraAt: WORLD_AT,
  fxExtra: `cut:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.42,ease:'power3.out'},t);},`,
  // Section cut: a dash-dot cut line with a hatched poche slides left to right, revealing the sheet behind it; on exit a second cut sweeps it away.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{'--r':100,'--l':0,opacity:1},{'--r':0,duration:.4,ease:'power2.inOut'},a-.12);tl.fromTo(p,{x:-10},{x:0,duration:.4,ease:'power2.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{'--l':100,duration:.36,ease:'power2.in'},b-.38);}`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0 100% 0 0)'});tl.to('#outro',{clipPath:'inset(0 0% 0 0)',duration:.7,ease:'power2.inOut'},OUT-.12);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:"IBM Plex Sans",sans-serif;font-weight:700;font-size:54px;line-height:1.3;color:${INK};background:rgba(247,244,238,.95);padding:8px 20px 10px;border-left:8px solid ${RED};box-shadow:0 10px 26px rgba(0,0,0,.22)}
.w{display:inline-block;margin:0 .1em;padding:0 .1em}`,
(id, w) => `tl.set("#${id}",{color:"${INK}",backgroundColor:"rgba(196,83,47,0)"},0);tl.set("#${id}",{color:"#FFFFFF",backgroundColor:"rgb(196,83,47)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${INK}",backgroundColor:"rgba(196,83,47,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:8},{opacity:1,y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Unta Nabi Saleh", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
