// EP15 SAKLAR DI DADA. ANATOMIX clinical-hologram look: dark glass cards with teal hairlines, Chakra Petch headings,
// mono readouts, a live beta-wave oscilloscope. Panels arrive like an imaging scan (top-to-bottom wipe with a flash)
// and leave by collapsing to a single scan line. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const HOLO = "#3FE0D0", HOLOS = "#9FF5EC", AMBER = "#FFB547", VOID = "#03141A", HUD = "#E6FBF8";
const scope = (lbl) => `<div class="scw"><div class="scl"><span>${lbl}</span><span class="bmeter"><i></i></span></div><svg class="scope" viewBox="0 0 600 120" preserveAspectRatio="none"><path d="M0 60H600" class="mid"/><polyline points=""/></svg></div>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="st"><i></i>CARA KERJA VIRAL &middot; EP 15</div>
  <div class="h0">SAKLAR<br>DI DADA</div>
  <div class="sub">penghenti gemetar Parkinson</div>
  ${scope("GELOMBANG BETA")}
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="st"><i></i>3 NOV 2026 &middot; JAKARTA</div>
  <div class="ro" data-at="s2:Jakarta" data-fx="left"><b>LAYANAN DBS DIUMUMKAN</b><span>stimulasi otak dalam, untuk Parkinson</span></div>
  <div class="stp" data-at="s2:pertama" data-fx="stamp">BUKAN YANG PERTAMA</div>
  <div class="ro" data-at="s2:dekade" data-fx="left"><b>&gt; 1 DEKADE</b><span>DBS sudah dilakukan di Indonesia</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="st"><i></i>PETA TARGET &middot; MRI</div>
  <div class="ro" data-at="s3:Elektroda" data-fx="left"><b>ELEKTRODA TIPIS</b><span>masuk lewat lubang kecil di tengkorak</span></div>
  <div class="tag" data-at="s3:sadar" data-fx="pop">PASIEN SERING SADAR &middot; TREMOR DIUJI</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="st"><i></i>JALUR KABEL</div>
  <div class="h1" data-at="s4:Inilah" data-fx="up">ALAT PACU JANTUNG<br><em>UNTUK OTAK</em></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="st"><i></i>STIMULASI ON</div>
  <div class="du">
    <div data-at="s5:130" data-fx="pop"><small>&plusmn;</small><b class="ct" data-from="0" data-to="130" data-a="s5:130" data-d="1.1">0</b><span>denyut per detik</span></div>
    <div data-at="s5:60" data-fx="pop"><b>60</b><small>&micro;s</small><span>lebar tiap denyut</span></div>
  </div>
  <div class="tag" data-at="s5:Tremor" data-fx="pop">TREMOR MEREDA HAMPIR SEKETIKA</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="st"><i></i>KENAPA BERHASIL?</div>
  <div class="ro" data-at="s6:beta" data-fx="left"><b>GELOMBANG BETA 13&ndash;30 Hz</b><span>terkait gerakan lambat dan kaku</span></div>
  <div data-at="s6:serempak" data-fx="up">${scope("SINYAL BETA")}</div>
  <div class="tag q" data-at="s6:caranya" data-fx="pop">CARANYA BELUM SEPENUHNYA DIPAHAMI</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="st"><i></i>FEB 2025 &middot; FDA</div>
  <div class="ro" data-at="s7:adaptif" data-fx="left"><b>DBS ADAPTIF</b><span>mendengar sinyal beta, mengatur stimulasinya</span></div>
  <div class="tel" data-at="s7:orang" data-fx="up"><b>&gt;<span class="ct" data-from="0" data-to="200000" data-a="s7:orang" data-d="1.4">0</span></b><span>orang di dunia memakai DBS</span></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h1" data-at="s8:Bukan" data-fx="up">PENGENDALI GEJALA<br><em>BUKAN PENYEMBUH</em></div>
  <div class="srcl" data-at="s8:pengendali" data-fx="fade">Sumber: Koeglsperger dkk. 2019 (Front Neurol); K&uuml;hn dkk. 2008 (J Neurosci); AJMC 26 Feb 2025; Medtronic 4 Nov 2026; Media Indonesia &amp; Olenka 3 Nov 2026; detikNews 2015. Model 3D adalah ilustrasi. Konsultasikan dengan dokter saraf.</div>
</div>`;

const css = `
.p{filter:drop-shadow(0 10px 30px rgba(0,0,0,.45))}
.st{display:inline-flex;align-items:center;gap:12px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:25px;letter-spacing:.14em;color:${HOLO};background:rgba(3,20,26,.82);border:1px solid rgba(63,224,208,.45);border-radius:8px;padding:8px 16px;margin-bottom:14px}
.st i{width:12px;height:12px;border-radius:50%;background:${HOLO};box-shadow:0 0 12px ${HOLO}}
.h0{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:132px;line-height:.92;color:${HUD};letter-spacing:.01em;text-shadow:0 0 28px rgba(63,224,208,.45),0 6px 24px rgba(0,0,0,.7)}
.sub{font-family:"Chakra Petch",sans-serif;font-weight:600;font-size:42px;color:${AMBER};margin-top:12px;text-shadow:0 2px 14px rgba(0,0,0,.8)}
.h1{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:84px;line-height:1;color:${HUD};text-shadow:0 0 24px rgba(63,224,208,.4),0 4px 20px rgba(0,0,0,.8)}
.h1 em{font-style:normal;color:${HOLO}}
.ro{background:rgba(3,20,26,.84);border:1px solid rgba(63,224,208,.3);border-left:6px solid ${HOLO};border-radius:10px;padding:12px 20px;margin-top:12px;width:fit-content;max-width:860px}
.ro b{display:block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:50px;line-height:1.05;color:${HUD}}
.ro span{display:block;font-family:"JetBrains Mono",monospace;font-weight:500;font-size:25px;line-height:1.3;color:${HOLOS};margin-top:4px}
.stp{display:inline-block;margin-top:16px;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:54px;color:${AMBER};border:4px solid ${AMBER};border-radius:8px;padding:4px 18px;transform:rotate(-3deg);background:rgba(3,20,26,.7)}
.tag{display:inline-block;margin-top:14px;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:27px;letter-spacing:.06em;color:${VOID};background:${HOLO};border-radius:8px;padding:10px 16px}
.tag.q{background:${AMBER}}
.du{display:flex;gap:14px;width:900px}.du>div{flex:1;background:rgba(3,20,26,.86);border:1px solid rgba(63,224,208,.35);border-top:6px solid ${HOLO};border-radius:10px;padding:10px 18px}
.du b{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:118px;line-height:1;color:${HUD}}
.du small{font-family:"Chakra Petch",sans-serif;font-weight:600;font-size:52px;color:${HOLO};margin:0 6px}
.du span{display:block;font-family:"JetBrains Mono",monospace;font-size:25px;color:${HOLOS}}
.tel{margin-top:14px;background:rgba(3,20,26,.86);border:1px solid rgba(63,224,208,.35);border-top:6px solid ${AMBER};border-radius:10px;padding:10px 20px;width:640px}
.tel b{display:block;font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:110px;line-height:1;color:${HUD}}
.tel>span{display:block;font-family:"JetBrains Mono",monospace;font-size:26px;color:${HOLOS}}
.scw{margin-top:16px;width:620px;background:rgba(3,20,26,.86);border:1px solid rgba(63,224,208,.35);border-radius:10px;padding:10px 14px 6px}
.scl{display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:21px;letter-spacing:.12em;color:${HOLOS}}
.bmeter{display:inline-block;width:150px;height:12px;border:1px solid rgba(255,181,71,.6);border-radius:6px;overflow:hidden}
.bmeter i{display:block;height:100%;background:${AMBER};transform-origin:0 50%}
.scope{display:block;width:592px;height:110px}
.scope polyline{fill:none;stroke:${AMBER};stroke-width:3.5;filter:drop-shadow(0 0 6px rgba(255,181,71,.8))}
.scope .mid{stroke:rgba(63,224,208,.25);stroke-width:1.5}
.srcl{font-family:Inter,sans-serif;font-weight:500;font-size:23px;line-height:1.35;color:#d6efec;margin-top:16px;max-width:860px;text-shadow:0 2px 10px #000}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/hyperframes/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/hyperframes/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "15", sig: "EP15_DBS_PACU_OTAK", chip: "ILUSTRASI, BUKAN SARAN MEDIS", panelTop: 262,
  bg: VOID, vig: 0.4, grain: 0.035, capfloor: 0.45, html, css,
  extraAt: ["s1:menghentikan", "s1:detik", "s1:Bagaimana", "s3:MRI", "s3:subtalamikus", "s3:globus", "s3:cincin", "s3:masuk", "s3:diuji",
    "s4:Kabelnya", "s4:telinga", "s4:stimulator", "s5:dinyalakan", "s6:Kenapa", "s6:Stimulasi", "s7:FDA", "s7:mendengar", "s7:mengatur", "s8:pengendali"],
  // Scan in: the card is revealed top to bottom like an imaging pass, with a brief over-exposed flash.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0% 0% 100% 0%)',opacity:1,filter:'brightness(2.4) drop-shadow(0 10px 30px rgba(0,0,0,.45))'},{clipPath:'inset(0% 0% 0% 0%)',filter:'brightness(1) drop-shadow(0 10px 30px rgba(0,0,0,.45))',duration:.5,ease:'power3.out'},a-.16)`,
  // Scan out: the card collapses to a thin horizontal line, then is gone.
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(49.5% 0% 49.5% 0%)',duration:.26,ease:'power3.in'},b-.36).to(p,{opacity:0,duration:.06},b-.1)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Sora,sans-serif;font-weight:700;font-size:56px;line-height:1.24;color:#fff;text-wrap:balance;text-shadow:0 3px 12px rgba(0,0,0,.9),0 0 3px #000}
.w{display:inline-block;padding:0 4px;margin:0 .08em;border-radius:8px}`,
// Active word lights up hologram teal with a soft glow and a tiny lift.
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 12px rgba(0,0,0,.9)"},{color:"${HOLO}",y:-4,textShadow:"0 0 18px rgba(63,224,208,.85)",duration:.06,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",y:0,textShadow:"0 3px 12px rgba(0,0,0,.9)",duration:.14},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,clipPath:"inset(0% 0% 100% 0%)"},{opacity:1,clipPath:"inset(0% 0% 0% 0%)",duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Saklar di Dada", VOID);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
