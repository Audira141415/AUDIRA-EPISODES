// EP45 BANJIR MOLASE BOSTON 1919: FLUIDFORGE. A live molasses heightfield (glossy, depth-coloured, warm studio
// reflections) floods a 1:1 model of the 1919 Boston waterfront. Panels are dark-glass HUD cards with an amber
// "liquid" accent. Batch-9 ripple device: a steel rivet (the trigger) on a molasses drip line; every narrated
// consequence drops a glossy amber bead + card onto the line and sends a ring out from the rivet.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFB547", AMB2 = "#E07A1F", INK = "#0E0B08", RED = "#FF5A4A", CRE = "#F3E9D6", MUT = "#B9AC98", BG = "#0B0907";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d = 0.9, extra = "") => `<span class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" ${extra}>${to}</span>`;

// ripple cards: [label, sub, anchor]
const RIP = [
  ["PAKU KELING", "lepas", "s4:paku"],
  ["TANGKI", "terbelah", "s4:terbelah"],
  ["OMBAK 8 M", "56 km/jam", "s5:Gelombangnya"],
  ["REL &amp; RUMAH", "ditabrak", "s5:menabrak"],
  ["21 ORANG", "meninggal", "s6:meninggal"],
  ["119 WARGA", "menggugat", "s7:Gugatan"],
];
const rip = RIP.map(([b, s, a], i) => `<div class="rc" style="left:${112 + i * 136}px" data-at="${a}" data-fx="bead"><div class="rt"><b>${b}</b><span>${s}</span></div><i class="bd"></i><i class="pz" data-at="s8:Satu+${(i * 0.12).toFixed(2)}" data-fx="puls"></i></div>`).join("");
const rings = RIP.map(([, , a]) => `<i class="ring" data-at="${a}" data-fx="ring"></i>`).join("");

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&family=JetBrains+Mono:wght@500;700&family=DM+Serif+Display&display=block">
<div class="pre"><span style="font-family:'Inter';font-weight:900">MOLASE 1919</span><span style="font-family:'Inter';font-weight:800">a</span><span style="font-family:'Inter';font-weight:700">a</span><span style="font-family:'Inter';font-weight:500">a</span><span style="font-family:'JetBrains Mono';font-weight:700">A 1</span><span style="font-family:'JetBrains Mono';font-weight:500">A 1</span><span style="font-family:'DM Serif Display'">AUDIRA</span></div>
<div id="flash"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Lima">
  ${kk("EP 45", "FAKTA SEJARAH NEGARA")}
  <div class="h1"><span class="ln">GELOMBANG</span><span class="ln big">8 METER</span></div>
  <div class="chips"><i class="ch st1" data-at="s1:Bukan" data-fx="stampc">BUKAN AIR</i><i class="ch st2" data-at="s1:sirup" data-fx="stampc">SIRUP TEBU · MOLASE</i></div>
</div>
<div class="p" data-in="s2:Lima" data-out="s2:berdiri">
  ${kk("01", "LOKASI &amp; WAKTU")}
  ${row("15 JANUARI 1919", "", "s2:Januari", "am")}
  ${row("BOSTON, AMERIKA SERIKAT", "tepi pelabuhan, kawasan North End", "s2:Boston")}
</div>
<div class="p" data-in="s2:berdiri" data-out="s3">
  ${kk("02", "TANGKI BAJA")}
  ${row(`TINGGI ${ct(15, "s2:lima", 0.8)} M`, "", "s2:setinggi", "am")}
  ${row(`±${ct(12000, "s2:berisi", 1.9)} TON MOLASE`, "sirup kental sisa pembuatan gula", "s2:berisi")}
</div>
<div class="p" data-in="s3" data-out="s3:Tapi">
  ${kk("03", "UNTUK APA?")}
  ${row("MOLASE → ALKOHOL", "", "s3:alkohol", "am")}
  ${row("MINUMAN + BAHAN AMUNISI", "", "s3:minuman")}
</div>
<div class="p" data-in="s3:Tapi" data-out="s4">
  ${kk("04", "MASALAH SEJAK AWAL")}
  ${row("DINDINGNYA BOCOR", "molase merembes di sambungan", "s3:bocor", "rd")}
  ${row("&ldquo;SOLUSINYA&rdquo;: DICAT COKELAT", "supaya rembesan tidak kelihatan", "s3:dicat", "am")}
</div>
<div class="p" data-in="s4" data-out="s4:Siang">
  ${kk("05", "SEBELUM BENCANA")}
  <div class="cd row thermo" data-at="s4:udara" data-fx="card"><b>BEKU BERHARI-HARI → MENGHANGAT CEPAT</b><div class="bar"><i data-at="s4:menghangat" data-fx="grow"></i></div></div>
  ${row("SEHARI SEBELUMNYA", "kapal mengisi molase hangat ke dalam tangki", "s4:Sehari", "am")}
</div>
<div class="p" data-in="s4:Siang" data-out="s5">
  ${kk("06", "SIANG HARI · 15 JANUARI 1919")}
  ${row("PAKU KELINGNYA LEPAS", "satu per satu", "s4:paku", "am")}
  <div class="ban" data-at="s4:terbelah" data-fx="stampc">TANGKI TERBELAH</div>
</div>
<div class="p" data-in="s5" data-out="s5:menabrak">
  ${kk("07", "GELOMBANG MOLASE")}
  ${row("LEBIH BERAT DARI AIR", "", "s5:berat", "am")}
  <div class="cd row spd" data-at="s5:lima" data-fx="card"><b>±${ct(56, "s5:lima", 1.6)} <small>KM/JAM</small></b></div>
</div>
<div class="p" data-in="s5:menabrak" data-out="s6">
  ${kk("07", "YANG DITERJANG")}
  ${row("REL KERETA LAYANG DITABRAK", "", "s5:rel", "rd")}
  ${row("RUMAH BERGESER DARI FONDASINYA", "", "s5:menggeser")}
</div>
<div class="p" data-in="s6" data-out="s6:Dua">
  ${kk("08", "LALU MENGENTAL")}
  <div class="cd row thermo" data-at="s6:mendingin" data-fx="card"><b>MENDINGIN → KENTAL SEPERTI LEM</b><div class="bar visc"><i data-at="s6:mengental" data-fx="grow"></i></div><span>cepat menerjang, lalu menjebak</span></div>
</div>
<div class="p" data-in="s6:Dua" data-out="s7">
  ${kk("08", "KORBAN")}
  <div class="cd calm" data-at="s6:Dua" data-fx="fade"><b>21 orang meninggal</b><span>sekitar 150 orang terluka</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Tapi">
  ${kk("09", "TUDUHAN PERUSAHAAN")}
  ${row("&ldquo;ANARKIS MELEDAKKAN TANGKI&rdquo;", "versi perusahaan pemilik tangki", "s7:anarkis")}
</div>
<div class="p" data-in="s7:Tapi" data-out="s7:Gugatan">
  ${kk("10", "PUTUSAN SETELAH 3 TAHUN SIDANG")}
  <div class="vs">
    <div class="cd mm" data-at="s7:pengadilan" data-fx="card"><b>ANARKIS?</b><i class="stp" data-at="s7:menyatakan" data-fx="stampc">BUKAN</i></div>
    <div class="cd ff" data-at="s7:perusahaanlah" data-fx="card"><b>PERUSAHAAN LALAI</b></div>
  </div>
  ${row("BAJANYA TERLALU TIPIS", "", "s7:tipis", "rd")}
  ${row("TIDAK PERNAH DIUJI DENGAN BENAR", "", "s7:diuji", "rd")}
</div>
<div class="p" data-in="s7:Gugatan" data-out="s8">
  ${kk("11", "GUGATAN KELOMPOK")}
  ${row(`${ct(119, "s7:seratus", 1.4)} WARGA`, "", "s7:seratus", "am")}
  ${row("SALAH SATU YANG PERTAMA", "di negara bagian Massachusetts", "s7:pertama")}
</div>
<div class="p" data-in="s8" data-out="s8:Satu">
  ${kk("12", "KONON")}
  ${row("BAU MANIS DI HARI PANAS", "masih tercium selama puluhan tahun", "s8:bau", "am")}
</div>
<div class="p" data-in="s8:Satu" data-out="s8:Menurut">
  ${kk("13", "PEMICUNYA KECIL")}
  ${row("SATU TANGKI YANG DICAT", "untuk menutupi bocor, bukan memperbaikinya", "s8:Satu", "am")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Kebocoran apa yang sering kita tutupi, bukan diperbaiki? <em>Tulis di komentar!</em></div>
</div>
<div id="rip" data-at="s4:paku" data-fx="fade">
  <svg class="rg" viewBox="0 0 960 180" preserveAspectRatio="none"><defs><linearGradient id="tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B860"/><stop offset=".35" stop-color="#B8560E"/><stop offset="1" stop-color="#3A1503"/></linearGradient></defs><rect x="60" y="146" width="890" height="14" rx="7" fill="url(#tube)"/><rect x="70" y="148" width="870" height="3" rx="2" fill="rgba(255,240,210,.55)"/></svg>
  <div class="rings">${rings}</div>
  <div class="rv"><svg viewBox="0 0 80 80"><defs><radialGradient id="rvg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F2F5F7"/><stop offset=".45" stop-color="#9AA3AA"/><stop offset="1" stop-color="#3A4046"/></radialGradient></defs><circle cx="40" cy="40" r="30" fill="url(#rvg)" stroke="#15181b" stroke-width="4"/><circle cx="31" cy="30" r="7" fill="rgba(255,255,255,.75)"/></svg><span>PEMICU</span></div>
  ${rip}
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
#flash{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 55%,rgba(255,190,110,.55),rgba(255,140,40,0) 70%)}
.cd{position:relative;background:linear-gradient(180deg,rgba(24,19,14,.86),rgba(12,9,7,.86));border:1.5px solid rgba(255,181,71,.55);border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,236,200,.18)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'JetBrains Mono',Consolas,monospace;font-weight:700;font-size:26px;letter-spacing:.08em;color:${AMB};margin-bottom:16px;padding:7px 18px 7px 7px;background:rgba(10,8,6,.82);border:1.5px solid rgba(255,181,71,.6);border-radius:8px}
.kk i{font-style:normal;background:${AMB};color:${INK};padding:3px 12px;border-radius:5px}
.h1{display:flex;flex-direction:column;align-items:flex-start;gap:0}
.h1 .ln{font-family:Inter,'Segoe UI',sans-serif;font-weight:900;font-size:104px;line-height:.98;letter-spacing:-.01em;color:${CRE};text-shadow:0 6px 24px rgba(0,0,0,.6)}
.h1 .big{font-size:150px;line-height:1;background:linear-gradient(180deg,#FFF0C8 0%,#FFC566 38%,#F08A26 72%,#B4520E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 rgba(30,10,0,.9)) drop-shadow(0 8px 22px rgba(0,0,0,.7))}
.h1 .big .ct{font:inherit;color:inherit}
.chips{display:flex;gap:14px;margin-top:20px;flex-wrap:wrap}
.ch{font-style:normal;font-family:Inter,sans-serif;font-weight:900;font-size:44px;line-height:1;letter-spacing:.02em;padding:14px 22px 12px;border-radius:12px}
.st1{background:${RED};color:#fff;transform:rotate(-2deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.st2{background:linear-gradient(180deg,#FFC566,#D9741A);color:${INK};box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.5)}
.ban{display:inline-block;font-family:Inter,sans-serif;font-weight:900;font-size:76px;line-height:1;color:#fff;background:${RED};padding:16px 26px 14px;border-radius:12px;transform:rotate(-2deg);box-shadow:0 14px 34px rgba(0,0,0,.5);margin-top:18px}
.row{display:flex;flex-direction:column;margin-top:16px;padding:14px 26px 16px;border-left:12px solid ${AMB};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:Inter,sans-serif;font-weight:900;font-size:52px;line-height:1.05;letter-spacing:-.005em;color:${CRE}}
.row b .ct{display:inline;margin:0;font:inherit;color:${AMB}}
.row span{display:block;margin-top:6px;font-family:Inter,sans-serif;font-weight:500;font-size:32px;line-height:1.2;color:${MUT};max-width:820px}
.row.am b{color:${AMB}}.row.rd{border-left-color:${RED}}.row.rd b{color:#FF8A7A}
.spd b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:96px;color:${AMB}}.spd b small{font-size:44px;color:${CRE}}
.thermo .bar{position:relative;width:760px;height:22px;margin-top:14px;border-radius:11px;background:rgba(255,255,255,.08);overflow:hidden}
.thermo .bar i{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,#7FC4FF,#C9E4FF 30%,#FFD08A 70%,#FF8A3D)}
.thermo .bar.visc i{background:linear-gradient(90deg,#D2781E,#8A3A0A 50%,#2A0E03)}
.thermo b{font-size:44px}
.calm{padding:20px 30px 22px;border-left:12px solid ${MUT};border-color:rgba(185,172,152,.5);max-width:880px}
.calm b{display:block;font-family:Inter,sans-serif;font-weight:800;font-size:56px;line-height:1.1;color:${CRE}}
.calm span{display:block;margin-top:8px;font-family:Inter,sans-serif;font-weight:500;font-size:40px;color:${MUT}}
.vs{display:flex;gap:20px;align-items:stretch}
.mm,.ff{display:flex;align-items:center;padding:16px 24px;box-sizing:border-box}
.mm b,.ff b{font-family:Inter,sans-serif;font-weight:900;font-size:50px;line-height:1.05;color:${CRE}}
.mm{width:330px}.mm b{color:#8F8577;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:${RED}}
.ff{width:500px;background:linear-gradient(180deg,#FFC566,#D9741A);border-color:#FFD99A}.ff b{color:${INK}}
.stp{position:absolute;right:-22px;top:-30px;font-style:normal;font-family:Inter,sans-serif;font-weight:900;font-size:56px;line-height:1;color:#fff;background:${RED};border-radius:10px;padding:10px 16px 8px;transform:rotate(6deg);box-shadow:0 8px 20px rgba(0,0,0,.45)}
.q{margin-top:10px;padding:22px 30px 24px;font-family:Inter,sans-serif;font-weight:800;font-size:56px;line-height:1.12;color:${CRE};border-left:12px solid ${AMB};max-width:900px}
.q em{display:block;margin-top:12px;font-style:normal;color:${AMB};font-size:44px}
#rip{position:absolute;left:30px;top:1092px;width:960px;height:180px;z-index:10}
#rip .rg{position:absolute;left:0;top:0;width:960px;height:180px}
#rip .rings{position:absolute;left:0;top:0;width:960px;height:180px;overflow:hidden;pointer-events:none}
.ring{position:absolute;left:52px;top:153px;width:1200px;height:240px;margin:-120px 0 0 -600px;border-radius:50%;border:4px solid ${AMB};opacity:0;box-sizing:border-box}
.rv{position:absolute;left:12px;top:96px;width:84px;display:flex;flex-direction:column;align-items:center}
.rv svg{width:80px;height:80px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}
.rv span{margin-top:-4px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:17px;letter-spacing:.06em;color:${CRE};background:rgba(10,8,6,.8);padding:2px 6px;border-radius:4px}
.rc{position:absolute;top:0;width:128px;height:178px}
.rc .rt{position:absolute;left:0;top:0;width:128px;height:96px;box-sizing:border-box;padding:10px 8px 8px;background:linear-gradient(180deg,rgba(28,21,15,.92),rgba(12,9,7,.92));border:1.5px solid rgba(255,181,71,.65);border-top:5px solid ${AMB};border-radius:10px;text-align:center;box-shadow:0 10px 22px rgba(0,0,0,.5)}
.rc .rt b{display:block;font-family:Inter,sans-serif;font-weight:900;font-size:23px;line-height:1.02;color:${CRE}}
.rc .rt span{display:block;margin-top:5px;font-family:Inter,sans-serif;font-weight:700;font-size:19px;line-height:1.05;color:${AMB}}
.rc .bd{position:absolute;left:44px;top:120px;width:40px;height:50px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 34% 30%,#FFE7B8 0 9%,#E8902C 22%,#8A3A0A 60%,#2A0E03 100%);box-shadow:0 6px 12px rgba(0,0,0,.55)}
.rc .bd::before{content:"";position:absolute;left:18px;top:-18px;width:4px;height:20px;background:linear-gradient(#FFB547,#8A3A0A);border-radius:2px}
.rc .pz{position:absolute;left:-6px;top:-6px;width:140px;height:108px;border:4px solid ${AMB};border-radius:14px;opacity:0;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP45_BANJIR_MOLASE_BOSTON_1919",
  ep: "45", bg: BG, vig: 0.4, grain: 0.04, capfloor: 0.42, html, css, chipFont: `'JetBrains Mono',Consolas,monospace`, chipColor: "#F3E9D6",
  chip: "ILUSTRASI 3D &middot; BUKAN FOTO ASLI",
  extraAt: ["s1:delapan", "s2:Boston", "s2:berdiri", "s2:setinggi", "s2:dua", "s2:berisi", "s2:ton",
    "s3:Tapi", "s3:bocor", "s3:dicat", "s4:udara", "s4:menghangat", "s4:Sehari", "s4:kapal", "s4:mengisi", "s4:tangki", "s4:Siang", "s4:paku", "s4:lepas", "s4:terbelah",
    "s5:Gelombangnya", "s5:lima", "s5:menabrak", "s5:layang", "s5:menggeser", "s6:mengental", "s6:lem", "s6:Dua", "s6:terluka",
    "s7:anarkis", "s7:sidang", "s7:lalai", "s7:benar", "s7:Gugatan", "s7:seratus", "s7:warga", "s8:hari", "s8:tercium", "s8:Satu", "s8:menutupi", "s8:Menurut"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,y:34,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.42,ease:'power4.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 bead:(e,t)=>{gsap.set(e,{opacity:0});const b=e.querySelector('.bd'),c=e.querySelector('.rt');tl.set(e,{opacity:1},t-.01);tl.fromTo(b,{y:-110,scaleY:1.5,scaleX:.6},{y:0,scaleY:1,scaleX:1,duration:.45,ease:'power2.in',immediateRender:false},t);tl.to(b,{scaleY:.7,scaleX:1.3,duration:.09,yoyo:true,repeat:1,ease:'power1.out'},t+.45);tl.fromTo(c,{opacity:0,y:-18},{opacity:1,y:0,duration:.36,ease:'power3.out',immediateRender:false},t+.12);},
 ring:(e,t)=>{tl.fromTo(e,{opacity:.95,scale:.04},{opacity:0,scale:1,duration:1.3,ease:'power2.out',immediateRender:false},t+.4);},
 puls:(e,t)=>{tl.fromTo(e,{opacity:1,scale:.92},{opacity:0,scale:1.25,duration:.6,ease:'power2.out',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:40,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.4,ease:'power4.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-30,filter:'blur(6px)',duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{const f=q('#flash');const hits=[AT['s4:terbelah'],AT['s5:menabrak']];let k=0;for(const h of hits){const d=t-h;if(d>0&&d<0.7)k=Math.max(k,1-d/0.7);}f.style.opacity=k*0.8;const rp=q('#rip');if(rp)rp.style.visibility=(t>AT['s8:Menurut']-0.1)?'hidden':'visible';}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Inter,'Segoe UI',sans-serif;font-weight:800;font-size:64px;line-height:1.1;letter-spacing:-.005em;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.8),0 0 18px rgba(0,0,0,.75)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${AMB}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Banjir Molase Boston 1919", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
