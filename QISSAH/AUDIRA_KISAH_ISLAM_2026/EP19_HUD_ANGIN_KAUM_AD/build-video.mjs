// EP19 HUD DAN ANGIN KAUM 'AD. DISASTERSIM: the story told as a calm scientific wind-disaster simulation over the dunes of Al-Ahqaf.
// Panels are slate HUD readout cards (cyan hairline, corner ticks, Rajdhani + Exo 2). They arrive by an HUD scan wipe:
// a bright scan line sweeps down and reveals the card behind it; they leave by the line sweeping back up and erasing it.
// A fixed HUD frame (corner brackets, wind and temperature meters, sim mode, "SIM · AUDIRA") and a day/night counter sit over the world.
// Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#1a2230", CY = "#5CE1E6", AMB = "#FFB547", INK = "#EAF6F8";

// Arabic is copied programmatically from the verse file so it is never retyped.
const QF = readFileSync("../_research/quran/EP19_hud_ad.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V89_7 = verse("89:7");
const V69_7 = verse("69:7");
const i0 = V69_7.indexOf("سَبْعَ"), END_W = "حُسُومًا", i1 = V69_7.indexOf(END_W);
if (i0 < 0 || i1 < 0) throw new Error("69:7 phrase");
const P69_7 = V69_7.slice(i0, i1 + END_W.length);   // "seven nights and eight days, continuously" (bounded phrase)

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="scan"` : ""}>${r}</span>`;
const card = (inner, cls = "") => `<div class="card ${cls}"><i class="sl"></i><i class="tk a"></i><i class="tk b"></i>${inner}</div>`;
const k = (txt, r) => `<div class="k"><b class="dot"></b><span>${txt}</span>${r || ""}</div>`;

const html = `
<div id="cold"></div>
<div id="hudf"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>
<div id="hudb">
  <div class="mt"><span>ANGIN</span><b><em id="mw"></em></b><span>SUHU</span><b><em id="mt"></em></b></div>
  <div class="st"><b class="rec"></b><span id="mode">PRATINJAU</span><span class="sep">|</span><span class="brand">SIM &middot; AUDIRA</span></div>
</div>
<div id="ctr"><div class="cr"><svg viewBox="0 0 24 24"><path d="M16 3a9 9 0 1 0 5 15A8 8 0 0 1 16 3z" fill="#9fc4ff"/></svg><span>MALAM</span><b id="cm">0</b></div>
<div class="cr"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="${AMB}"/><g stroke="${AMB}" stroke-width="2"><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M4 20l3-3M17 7l3-3"/></g></svg><span>HARI</span><b id="ch">1</b></div></div>

<div class="p" data-first="1" data-in="@0" data-out="s2">
  ${card(`${k("KISAH DALAM AL-QUR'AN &middot; 19")}
    <div class="h">AWAN YANG<br>DIKIRA HUJAN</div>
    <div class="row" data-at="s1:Ternyata" data-fx="scan"><b class="tag warn">TERNYATA: ANGIN</b>${ref("QS 46:24")}</div>`)}
</div>
<div class="p" data-in="s2" data-out="s2:Surah">
  ${card(`${k("KAUM 'AD &middot; AL-AHQAF", ref("QS 46:21"))}
    <div class="h m">Tinggal di bukit-bukit pasir</div>`)}
</div>
<div class="p" data-in="s2:Surah" data-out="s3">
  ${card(`${k("SURAH AL-FAJR", ref("QS 89:7-8"))}
    <div class="ar">${V89_7}</div>
    <div class="sub">Iram, dengan bangunan tinggi</div>
    <div class="lab" data-at="s2:belum" data-fx="scan">belum pernah dibangun di negeri lain</div>`)}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${card(`${k("NABI HUD BERTANYA", ref("QS 26:128-129"))}
    <div class="ls"><span>istana di setiap tanah tinggi, untuk bermegah</span><span data-at="s3:benteng-benteng" data-fx="scan">benteng, seolah akan hidup kekal?</span></div>`)}
</div>
<div class="p" data-in="s4" data-out="s4:Jawab">
  ${card(`${k("NIKMAT MEREKA", ref("QS 26:133-134"))}
    <div class="grid"><span>ternak</span><span data-at="s4:anak-anak" data-fx="scan">anak-anak</span><span data-at="s4:kebun" data-fx="scan">kebun</span><span data-at="s4:mata" data-fx="scan">mata air</span></div>`)}
</div>
<div class="p" data-in="s4:Jawab" data-out="s5">
  ${card(`${k("JAWAB MEREKA", ref("QS 26:136-138"))}
    <div class="qt">&ldquo;Sama saja, kau menasihati atau tidak.&rdquo;</div>
    <div class="qt" data-at="s4:Ini" data-fx="scan">&ldquo;Ini hanya adat orang-orang dahulu.&rdquo;</div>
    <div class="qt hl" data-at="s4:kami" data-fx="scan">&ldquo;Kami tidak akan diazab.&rdquo;</div>`)}
</div>
<div class="p" data-in="s5" data-out="s5:Hud">
  ${card(`${k("MEREKA MENANTANG", ref("QS 46:22"))}
    <div class="qt big">&ldquo;Datangkan azab yang kau ancamkan, kalau kau benar.&rdquo;</div>`)}
</div>
<div class="p" data-in="s5:Hud" data-out="s6">
  ${card(`${k("JAWABAN NABI HUD", ref("QS 46:23"))}
    <div class="qt big">&ldquo;Ilmu tentang itu hanya pada Allah.&rdquo;</div>
    <div class="sub" data-at="s5:Aku" data-fx="scan">Aku hanya menyampaikan.</div>`)}
</div>
<div class="p" data-in="s6" data-out="s6:Ternyata">
  ${card(`${k("AWAN MENDEKAT", ref("QS 46:24"))}
    <div class="h s">Menuju lembah-lembah mereka</div>
    <div class="row" data-at="s6:mengira" data-fx="scan"><b class="tag">DIKIRA: HUJAN</b></div>`)}
</div>
<div class="p" data-in="s6:Ternyata" data-out="s7">
  ${card(`${k("ANGIN SANGAT DINGIN", ref("QS 69:6"))}
    <div class="h s">Angin yang sangat dingin</div>
    <div class="ar" data-at="s6:berhembus" data-fx="scan">${P69_7}</div>
    <div class="row" data-at="s6:tujuh" data-fx="scan"><span class="sub">tujuh malam delapan hari, terus-menerus</span>${ref("QS 69:7")}</div>`, "cold")}
</div>
<div class="p" data-in="s7" data-out="s7:Pendengaran">
  ${card(`${k("SURAH AL-AHQAF", ref("QS 46:25"))}
    <div class="h s">Angin itu menghancurkan segala sesuatu</div>
    <div class="sub" data-at="s7:tersisa" data-fx="scan">tersisa hanya bekas tempat tinggal mereka</div>`)}
</div>
<div class="p" data-in="s7:Pendengaran" data-out="s8">
  ${card(`${k("TIDAK BERGUNA SEDIKIT PUN", ref("QS 46:26"))}
    <div class="grid three"><span>pendengaran</span><span data-at="s7:penglihatan" data-fx="scan">penglihatan</span><span data-at="s7:hati" data-fx="scan">hati</span></div>`)}
</div>
<div class="p" data-in="s8" data-out="s8:Kisah">
  ${card(`${k("PELAJARAN")}
    <div class="h s">Bangunan tertinggi tak bisa menahan angin yang diperintah.</div>
    <div class="ask" data-at="s8:Menurut" data-fx="scan">Apa yang sedang kita bangun agar terasa kekal?</div>`)}
</div>
<div class="p" data-in="s8:Kisah" data-out="@END">
  ${card(`${k("KISAH DALAM AL-QUR'AN")}
    <div class="h m">bersama AUDIRA</div>`)}
</div>`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(6,12,18,0),rgba(6,12,18,.55) 38%,rgba(6,12,18,.6) 72%,rgba(6,12,18,0))}
#cold{position:absolute;inset:0;z-index:8;opacity:0;pointer-events:none;background:linear-gradient(180deg,#2a4f86,#3d6ea8);mix-blend-mode:color}
#hudf{position:absolute;inset:0;z-index:9;pointer-events:none}
#hudf i{position:absolute;width:44px;height:44px;border-color:rgba(92,225,230,.7);border-style:solid;border-width:0}
#hudf .c1{left:30px;top:150px;border-left-width:3px;border-top-width:3px}
#hudf .c2{right:30px;top:150px;border-right-width:3px;border-top-width:3px}
#hudf .c3{left:30px;top:1240px;border-left-width:3px;border-bottom-width:3px}
#hudf .c4{right:30px;top:1240px;border-right-width:3px;border-bottom-width:3px}
#hudb{position:absolute;left:84px;right:84px;top:1246px;height:30px;z-index:11;display:flex;justify-content:space-between;align-items:center;font-family:Rajdhani,sans-serif;font-weight:700;font-size:22px;letter-spacing:.12em;color:#cfeff1}
#hudb .mt{display:flex;align-items:center;gap:10px}
#hudb .mt b{display:block;width:110px;height:10px;border:1.5px solid rgba(92,225,230,.8);margin-right:12px;position:relative}
#hudb .mt em{position:absolute;left:0;top:0;bottom:0;width:10%;background:${CY}}
#hudb .st{display:flex;align-items:center;gap:10px}
#hudb .rec{display:block;width:12px;height:12px;border-radius:50%;background:${AMB}}
#hudb .sep{opacity:.5}
#hudb .brand{color:${CY}}
#ctr{position:absolute;right:66px;top:1050px;z-index:11;opacity:0;padding:12px 20px 12px 18px;background:rgba(6,14,22,.8);border:2px solid rgba(143,184,255,.85);display:flex;flex-direction:column;gap:2px}
#ctr .cr{display:flex;align-items:center;gap:12px;font-family:Rajdhani,sans-serif;font-weight:700;font-size:34px;letter-spacing:.12em;color:#e4eefc;line-height:1.1}
#ctr svg{width:30px;height:30px}
#ctr b{font-size:46px;min-width:34px;text-align:right;color:#fff;font-variant-numeric:tabular-nums}
.p{top:290px;transform-origin:50% 0%}
.card{position:relative;display:block;width:fit-content;max-width:100%;box-sizing:border-box;background:linear-gradient(160deg,rgba(10,22,30,.88),rgba(8,16,24,.82));border:1.5px solid rgba(92,225,230,.55);border-left:6px solid ${CY};padding:18px 28px 22px 26px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.card.cold{border-color:rgba(143,184,255,.7);border-left-color:#8fb8ff}
.card .sl{position:absolute;left:-8px;right:-8px;top:0;height:4px;background:#d8fbff;box-shadow:0 0 14px 4px rgba(92,225,230,.9);opacity:0;z-index:3}
.card .tk{position:absolute;width:16px;height:16px;border-color:${CY};border-style:solid;border-width:0}
.card .tk.a{right:-1px;top:-1px;border-right-width:3px;border-top-width:3px}
.card .tk.b{right:-1px;bottom:-1px;border-right-width:3px;border-bottom-width:3px}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Rajdhani,sans-serif;font-weight:700;font-size:29px;letter-spacing:.14em;color:${CY};margin-bottom:6px}
.k .dot{display:block;width:12px;height:12px;background:${CY};transform:rotate(45deg)}
.h{font-family:Rajdhani,sans-serif;font-weight:700;font-size:78px;line-height:.98;color:#fff;letter-spacing:.01em}
.h.m{font-size:60px;line-height:1.04}
.h.s{font-family:'Exo 2',sans-serif;font-weight:700;font-size:46px;line-height:1.16}
.sub{font-family:'Exo 2',sans-serif;font-weight:600;font-size:38px;line-height:1.2;color:${INK}}
.lab{font-family:'Exo 2',sans-serif;font-weight:500;font-style:italic;font-size:32px;color:#b8dfe3;margin-top:4px}
.qt{font-family:'Exo 2',sans-serif;font-weight:700;font-size:40px;line-height:1.2;color:#fff;margin-top:6px}
.qt.big{font-size:50px}
.qt.hl{color:${AMB}}
.rf{display:inline-block;font-family:Rajdhani,sans-serif;font-weight:700;font-size:25px;letter-spacing:.08em;color:#06161a;background:${CY};padding:3px 12px 1px;white-space:nowrap}
.cold .rf{background:#8fb8ff}
.row{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap}
.tag{font-family:Rajdhani,sans-serif;font-weight:700;font-size:40px;letter-spacing:.08em;color:#06161a;background:${CY};padding:4px 16px 0}
.tag.warn{background:${AMB}}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:70px;line-height:1.6;color:#fff;margin-top:10px}
.ls{display:flex;flex-direction:column;gap:8px;margin-top:2px}
.ls span{font-family:'Exo 2',sans-serif;font-weight:700;font-size:42px;line-height:1.16;color:#fff;padding-left:34px;position:relative}
.ls span:before{content:"";position:absolute;left:2px;top:.4em;width:14px;height:14px;border:3px solid ${AMB};transform:rotate(45deg)}
.grid{display:grid;grid-template-columns:auto auto;gap:12px 14px;margin-top:6px}
.grid.three{grid-template-columns:auto}
.grid span{font-family:Rajdhani,sans-serif;font-weight:700;font-size:48px;letter-spacing:.04em;color:#fff;border:2px solid rgba(92,225,230,.6);padding:4px 18px 0 16px;background:rgba(92,225,230,.08)}
.ask{display:block;width:fit-content;margin-top:14px;font-family:'Exo 2',sans-serif;font-weight:700;font-size:40px;line-height:1.18;color:#06161a;background:${AMB};padding:10px 20px 12px}
`;

// HUD: cold tint, wind/temperature meters, sim mode label, and the 7-nights/8-days counter (same span as world3d.js).
const hud = `(t)=>{const sm=(a,b)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};
const C0=AT['s6:berhembus'],C1=AT['s7:tersisa']+.4;
const gust=sm(AT['s1:Ternyata'],AT['s1:menghancurkan']+.4)*(1-sm(K.s2-.05,K.s2+.5));
const storm=sm(AT['s6:Ternyata'],C0)*(1-sm(C1-1,AT['s7:Pendengaran']+1.2));
const wind=Math.max(.08,gust,.3*sm(K.s6,AT['s6:Ternyata']),storm);
document.getElementById('cold').style.opacity=(.34*storm).toFixed(3);
document.getElementById('mw').style.width=(wind*100).toFixed(1)+'%';
document.getElementById('mw').style.background=wind>.6?'${AMB}':'${CY}';
document.getElementById('mt').style.width=((.72-.6*storm-.25*gust)*100).toFixed(1)+'%';
document.getElementById('mt').style.background=storm>.4?'#8fb8ff':'${CY}';
let md='PRATINJAU';if(t>=K.s2-.05&&t<K.s2+1.6)md='\\u25C4\\u25C4 PUTAR ULANG';else if(t>=K.s2&&t<K.s6)md='PANTAU';else if(t>=K.s6&&t<AT['s6:Ternyata'])md='AWAN MENDEKAT';else if(t>=AT['s6:Ternyata']&&t<C1)md='BADAI';else if(t>=C1&&t<K.s8)md='PASCA BADAI';else if(t>=K.s8)md='TENANG';
const me=document.getElementById('mode');if(me.textContent!==md)me.textContent=md;
const ph=Math.min(14,Math.max(0,Math.floor((t-C0)/(C1-C0)*15)));
const cm=document.getElementById('cm'),ch=document.getElementById('ch');
const mv=String(t<C0?0:Math.floor((ph+1)/2)),hv=String(t<C0?1:Math.floor(ph/2)+1);if(cm.textContent!==mv)cm.textContent=mv;if(ch.textContent!==hv)ch.textContent=hv;
const ct=document.getElementById('ctr');ct.style.opacity=(sm(C0-.4,C0)*(1-sm(C1+1.4,C1+1.9))).toFixed(3);}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:awan", "s1:bersorak", "s1:Ternyata", "s1:menghancurkan", "s1:rumah",
  "s2:Al-Ahqaf", "s2:Iram", "s2:dibangun", "s3:apakah", "s3:istana", "s3:tanah", "s3:benteng-benteng", "s3:kekal",
  "s4:kebun", "s4:air", "s4:Jawab", "s4:sama", "s4:adat", "s4:kami", "s5:menantang", "s5:benar", "s5:Hud", "s5:menyampaikan",
  "s6:hujan", "s6:Ternyata", "s6:berhembus", "s6:mengira", "s7:tersisa", "s7:Pendengaran", "s7:menghancurkan", "s8:Menurut", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "19", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.55, html, css, hud, signature: "EP19_HUD_ANGIN_KAUM_AD",
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Rajdhani,sans-serif", chipColor: "#DDF6F8",
  extraAt: WORLD_AT,
  fxExtra: `scan:(e,t)=>{gsap.set(e,{display:'none',clipPath:'inset(0% 0% 100% 0%)'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:1,clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.26,ease:'power1.out'},t);tl.fromTo(e,{filter:'brightness(2.2)'},{filter:'brightness(1)',duration:.35,ease:'power1.out'},t);},`,
  // HUD scan wipe: a bright scan line sweeps down and reveals the card; out, it sweeps back up and erases it.
  panelIn: `(tl,p,a)=>{const s=p.querySelector('.sl');tl.set(p,{opacity:1,clipPath:'inset(0% -2% 100% -2%)'},a-.37);tl.to(p,{clipPath:'inset(0% -2% 0% -2%)',duration:.34,ease:'power1.inOut'},a-.36);if(s){tl.set(s,{opacity:1,top:'0%'},a-.37);tl.to(s,{top:'100%',duration:.34,ease:'power1.inOut'},a-.36);tl.to(s,{opacity:0,duration:.14},a-.02);}}`,
  panelOut: `(tl,p,b)=>{const s=p.querySelector('.sl');if(s){tl.set(s,{opacity:1,top:'100%'},b-.32);tl.to(s,{top:'0%',duration:.28,ease:'power1.in'},b-.31);}tl.to(p,{clipPath:'inset(0% -2% 100% -2%)',duration:.28,ease:'power1.in'},b-.31);tl.set(p,{opacity:0},b-.02);}`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'inset(0% 0% 100% 0%)'});tl.set('#outro',{opacity:1},OUT-.05);tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.4,ease:'power1.inOut'},OUT-.05);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Exo 2',sans-serif;font-weight:700;font-size:58px;line-height:1.32;color:#FFFFFF;text-shadow:0 3px 0 #04121a,0 0 12px rgba(2,8,14,.95),0 0 3px rgba(2,8,14,1)}
.w{display:inline-block;margin:0 .1em;padding:0 .14em;transform-origin:50% 100%}`,
(id, w) => `tl.set("#${id}",{color:"#04161A",backgroundColor:"#5CE1E6",textShadow:"none"},${w.start.toFixed(3)});tl.fromTo("#${id}",{y:-6},{y:0,duration:.18,ease:"power2.out"},${w.start.toFixed(3)});tl.set("#${id}",{color:"#FFFFFF",backgroundColor:"rgba(0,0,0,0)",textShadow:"0 3px 0 #04121a,0 0 12px rgba(2,8,14,.95),0 0 3px rgba(2,8,14,1)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:12},{opacity:1,y:0,duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Hud dan Angin Kaum Ad", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
