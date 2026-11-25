// EP52 LEDAKAN HALIFAX 1917: DISASTERSIM. A sliced "harbour lab" diorama of Halifax harbour on a plinth in a slate
// lab; panels are slate HUD cards with teal mono kickers and the kit's warning ramp (TENANG → WASPADA → BAHAYA → LEDAKAN).
// Batch-11 device: a seismograph / pressure strip that records the film; each narrated event drops a pin
// (TABRAKAN → API → TELEGRAF → LEDAKAN → SALJU → POHON NATAL), with the 08.45 → 09.04.35 clock in its header.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const TEAL = "#3FC6D4", YEL = "#D9B23A", ORA = "#E07B2E", RED = "#E5533A", INK = "#0C1218", CRE = "#EAF4F6", MUT = "#9FB0BA", BG = "#101820";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const ct = (to, a, d = 0.9, extra = "") => `<span class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}" ${extra}>${to}</span>`;
const ramp = (lvl) => `<div class="ramp">${["TENANG", "WASPADA", "BAHAYA", "LEDAKAN"].map((s, i) => `<i class="r${i}${i === lvl ? " on" : ""}">${s}</i>`).join("")}</div>`;

// device pins: [label, anchor]
const PINS = [["TABRAKAN", "s4:bertabrakan"], ["API", "s4:api"], ["TELEGRAF", "s5:telegraf"], ["LEDAKAN", "s6:meledak"], ["SALJU", "s7:salju"], ["POHON NATAL", "s8:pohon"]];
const PX = (i) => 108 + i * 150;
const pins = PINS.map(([b, a], i) => `<div class="pin${i === 3 ? " big" : ""}" style="left:${PX(i) - 70}px" data-at="${a}" data-fx="pin"><i class="stem"></i><i class="dot"></i><b>${b}</b></div>`).join("");

const winIcon = `<svg viewBox="0 0 120 120" class="ico"><rect x="10" y="10" width="100" height="100" rx="6" fill="#1b2630" stroke="${TEAL}" stroke-width="6"/><path d="M60 10 V110 M10 60 H110" stroke="${TEAL}" stroke-width="5"/><path d="M58 52 L30 22 M58 52 L22 58 M58 52 L44 96 M58 52 L92 30 M58 52 L98 76 M58 52 L70 104" stroke="#BFE3EC" stroke-width="4" fill="none"/><circle cx="58" cy="52" r="5" fill="${RED}"/></svg>`;
const keyIcon = `<svg viewBox="0 0 200 110" class="key"><rect x="6" y="80" width="188" height="22" rx="5" fill="#5a4636"/><rect x="40" y="70" width="18" height="12" fill="#a8925a"/><rect x="128" y="62" width="26" height="20" fill="#a8925a"/><path d="M48 70 L150 52" stroke="#c9b06a" stroke-width="9" stroke-linecap="round"/><circle cx="150" cy="50" r="13" fill="#20262c" stroke="#c9b06a" stroke-width="4"/></svg>`;

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Archivo';font-weight:900">HALIFAX 1917</span><span style="font-family:'Archivo';font-weight:800">a</span><span style="font-family:'Archivo';font-weight:700">a</span><span style="font-family:'Archivo';font-weight:500">a</span><span style="font-family:'IBM Plex Mono';font-weight:700">A 1</span><span style="font-family:'IBM Plex Mono';font-weight:500">A 1</span></div>
<div id="flash"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Halifax">
  ${kk("EP 52", "HARBOUR LAB // HALIFAX 1917")}
  <div class="h1"><span class="ln">SENGGOLAN PELAN,</span><span class="ln big" id="hk">20:00</span></div>
  <div class="chips"><i class="ch st1" data-at="s1:ledakan" data-fx="stampc">LEDAKAN BUATAN MANUSIA TERBESAR</i><i class="ch st2" data-at="s1:saat" data-fx="stampc">SAAT ITU</i></div>
</div>
<div class="p" data-in="s2:Halifax" data-out="s2:Perang">
  ${kk("01", "LOKASI &amp; WAKTU")}
  ${row("HALIFAX, KANADA", "pelabuhan di selat sempit The Narrows", "s2:Halifax", "tl")}
  ${row("6 DESEMBER 1917", "", "s2:Desember")}
</div>
<div class="p" data-in="s2:Perang" data-out="s3">
  ${kk("02", "MASA PERANG")}
  ${row("PERANG DUNIA I", "", "s2:Perang", "tl")}
  ${row("TITIK KUMPUL KONVOI", "kapal berkumpul sebelum menyeberang ke Eropa", "s2:titik")}
</div>
<div class="p" data-in="s3" data-out="s3:Dari">
  ${kk("03", "MANIFES · MONT-BLANC (PRANCIS)")}
  <div class="man">
    <div class="cd hz r" data-at="s3:TNT" data-fx="card"><b>TNT</b><span>bahan peledak</span></div>
    <div class="cd hz y" data-at="s3:pikrat" data-fx="card"><b>ASAM PIKRAT</b><span>bahan peledak</span></div>
    <div class="cd hz o" data-at="s3:bensol" data-fx="card"><b>TONG BENSOL</b><span>di atas dek · mudah terbakar</span></div>
  </div>
</div>
<div class="p" data-in="s3:Dari" data-out="s4">
  ${kk("04", "IMO · KAPAL NORWEGIA")}
  ${row("KOSONG, MENJEMPUT BANTUAN", "untuk Belgia", "s3:Imo", "tl")}
  ${row("MELAJU TERLALU CEPAT", "", "s3:cepat", "rd")}
  ${row("TERDESAK KE SISI YANG SALAH", "", "s3:salah", "rd")}
</div>
<div class="p" data-in="s4" data-out="s4:Tapi">
  ${kk("05", "PUKUL 08.45")}
  <div class="ban" data-at="s4:bertabrakan" data-fx="stampc">TABRAKAN</div>
  <div class="cd row spd" data-at="s4:lambat" data-fx="card"><b>LEBIH LAMBAT DARI ORANG BERJALAN</b><div class="sbar"><i class="walk"></i><i class="ship" data-at="s4:lambat" data-fx="grow"></i></div><span>kapal ◀ &nbsp;&nbsp; ▶ pejalan kaki</span></div>
</div>
<div class="p" data-in="s4:Tapi" data-out="s5">
  ${kk("06", "LALU API")}
  ${row("TONG BENSOL PECAH", "", "s4:pecah", "or")}
  ${row("PERCIKAN → API DI DEK", "", "s4:percikan", "rd")}
  <div data-at="s4:api" data-fx="fade">${ramp(2)}</div>
</div>
<div class="p" data-in="s5" data-out="s5:Petugas">
  ${kk("07", "SAAT KAPAL TERBAKAR")}
  ${row("AWAK MELOMPAT KE SEKOCI", "mendayung ke sisi Dartmouth", "s5:sekoci", "tl")}
  <div class="cd row ic" data-at="s5:jendela" data-fx="card">${winIcon.replace('stroke="#BFE3EC"', 'stroke="none"').replace(/<circle[^>]*>/, "")}<div><b>RATUSAN WARGA DI JENDELA</b><span>menonton api</span></div></div>
</div>
<div class="p" data-in="s5:Petugas" data-out="s6">
  ${kk("08", "PETUGAS KERETA API")}
  <div class="cd name" data-at="s5:Vince" data-fx="card"><small>NAMA</small><b>VINCE COLEMAN</b><span>kembali ke posnya</span></div>
  <div class="cd tg" data-at="s5:telegraf" data-fx="card">${keyIcon}<div class="tick"><small>TELEGRAF</small><b id="tick">HENTIKAN KERETA</b></div></div>
  ${row("KERETA PENUMPANG AKAN DATANG", "", "s5:penumpang", "tl")}
</div>
<div class="p" data-in="s6" data-out="s6:Gelombang">
  ${kk("09", "PUKUL 09.04.35")}
  <div class="ban rd2" data-at="s6:meledak" data-fx="stampc">MONT-BLANC MELEDAK</div>
  <div class="cd row r8" data-at="s6:radius" data-fx="card"><b>RADIUS ${ct(800, "s6:dalam", 0.7)} M</b><span>hampir semua bangunan rata</span></div>
</div>
<div class="p" data-in="s6:Gelombang" data-out="s7">
  ${kk("10", "SETELAH LEDAKAN")}
  ${row("GELOMBANG MENYAPU PANTAI", "", "s6:Gelombang", "tl")}
  <div class="cd row ic" data-at="s6:kaca" data-fx="card">${winIcon}<div><b>KACA JENDELA PECAH</b><span>melukai mereka yang menonton</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s7:Vince">
  ${kk("11", "KORBAN")}
  <div class="cd calm" data-at="s7:Sedikitnya" data-fx="fade"><b>Sedikitnya 1.782 orang meninggal</b><span data-at="s7:sekitar" data-fx="fade">sekitar 9.000 terluka</span></div>
</div>
<div class="p" data-in="s7:Vince" data-out="s7:Keesokan">
  ${kk("12", "MENGENANG")}
  <div class="cd name mute" data-at="s7:Vince" data-fx="card"><small>NAMA</small><b>VINCE COLEMAN</b><span>termasuk yang gugur</span></div>
</div>
<div class="p" data-in="s7:Keesokan" data-out="s8">
  ${kk("13", "KEESOKAN HARINYA")}
  ${row("BADAI SALJU", "salju ±41 cm menghambat penyelamatan", "s7:salju", "tl")}
  ${row("BANTUAN DARI BOSTON", "kereta bantuan tiba", "s7:Boston", "or")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("14", "SETIAP TAHUN")}
  <div class="cd route" data-at="s8:mengirim" data-fx="card"><b>HALIFAX</b><i class="ar"><i data-at="s8:pohon" data-fx="grow"></i></i><b>BOSTON</b></div>
  ${row("POHON NATAL", "ucapan terima kasih", "s8:pohon", "gr")}
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Apa pelajaran dari 20 menit itu? <em>Tulis di komentar!</em></div>
</div>
<div id="dev">
  <div class="dh"><span class="dl">SEISMOGRAF · TEKANAN</span><span id="clk"><b id="cdn">T&minus;19:35</b><span id="tim">08.45.00</span></span></div>
  <canvas id="seis" width="960" height="96"></canvas>
  ${pins}
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
#flash{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 50%,rgba(255,170,90,.6),rgba(255,120,40,0) 72%)}
.cd{position:relative;background:linear-gradient(180deg,rgba(18,26,34,.9),rgba(10,15,20,.9));border:1.5px solid rgba(63,198,212,.45);border-radius:10px;box-shadow:0 16px 36px rgba(0,0,0,.45),inset 0 1px 0 rgba(200,240,250,.12)}
.kk{display:inline-flex;align-items:center;gap:14px;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:700;font-size:25px;letter-spacing:.1em;color:${TEAL};margin-bottom:14px;padding:6px 16px 6px 6px;background:rgba(8,12,16,.85);border:1.5px solid rgba(63,198,212,.6);border-radius:6px}
.kk i{font-style:normal;background:${TEAL};color:${INK};padding:3px 11px;border-radius:4px}
.h1{display:flex;flex-direction:column;align-items:flex-start}
.h1 .ln{font-family:Archivo,'Segoe UI',sans-serif;font-weight:900;font-size:86px;line-height:1;letter-spacing:-.01em;color:${CRE};text-shadow:0 6px 22px rgba(0,0,0,.6)}
.h1 .big{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:150px;line-height:1.02;color:${ORA};text-shadow:0 4px 0 rgba(40,10,0,.85),0 10px 26px rgba(0,0,0,.6);font-variant-numeric:tabular-nums}
.chips{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;max-width:900px}
.ch{font-style:normal;font-family:Archivo,sans-serif;font-weight:900;font-size:40px;line-height:1;letter-spacing:.01em;padding:13px 20px 11px;border-radius:8px}
.st1{background:${RED};color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.45)}
.st2{background:${CRE};color:${INK};transform:rotate(-2deg);box-shadow:0 10px 26px rgba(0,0,0,.45)}
.ban{display:inline-block;font-family:Archivo,sans-serif;font-weight:900;font-size:74px;line-height:1;color:${INK};background:${YEL};padding:14px 24px 12px;border-radius:8px;transform:rotate(-2deg);box-shadow:0 14px 34px rgba(0,0,0,.5)}
.ban.rd2{background:${RED};color:#fff;font-size:66px}
.row{display:flex;flex-direction:column;margin-top:14px;padding:13px 24px 15px;border-left:10px solid ${TEAL};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:block;font-family:Archivo,sans-serif;font-weight:900;font-size:50px;line-height:1.05;color:${CRE}}
.row b .ct{display:inline;font:inherit;color:${ORA}}
.row span{display:block;margin-top:6px;font-family:Archivo,sans-serif;font-weight:500;font-size:31px;line-height:1.2;color:${MUT};max-width:820px}
.row.tl b{color:${CRE}}.row.rd{border-left-color:${RED}}.row.rd b{color:#FF8E7A}.row.or{border-left-color:${ORA}}.row.or b{color:#FFB37A}.row.gr{border-left-color:#5FBF7A}
.man{display:flex;flex-direction:column;gap:12px}
.hz{display:flex;align-items:baseline;gap:20px;padding:14px 24px;width:max-content;border-left:10px solid ${RED}}
.hz b{font-family:Archivo,sans-serif;font-weight:900;font-size:58px;line-height:1;color:${CRE}}
.hz span{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:26px;color:${MUT}}
.hz.y{border-left-color:${YEL}}.hz.o{border-left-color:${ORA}}
.spd b{font-size:42px}
.sbar{position:relative;width:780px;height:26px;margin-top:14px;border-radius:13px;background:rgba(255,255,255,.08)}
.sbar .walk{position:absolute;left:0;top:0;bottom:0;width:100%;border-radius:13px;border:2px dashed rgba(217,178,58,.8);box-sizing:border-box}
.sbar .ship{position:absolute;left:0;top:4px;bottom:4px;width:62%;border-radius:9px;background:linear-gradient(90deg,${TEAL},#8fe2ea);transform-origin:0 50%}
.ramp{display:flex;gap:8px;margin-top:16px}
.ramp i{font-style:normal;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:22px;letter-spacing:.06em;padding:9px 14px;border-radius:6px;color:rgba(234,244,246,.55);opacity:.55}
.ramp .r0{background:#1f6a74}.ramp .r1{background:#7a6620}.ramp .r2{background:#7e4418}.ramp .r3{background:#7e2a1e}
.ramp i.on{opacity:1;color:${INK};box-shadow:0 0 0 3px rgba(255,255,255,.75)}.ramp .r2.on{background:${ORA}}
.ic{flex-direction:row;align-items:center;gap:22px}
.ic .ico{width:92px;height:92px;flex:none}
.ic div b{font-size:44px}
.name{display:inline-flex;flex-direction:column;padding:14px 26px 16px;border-left:10px solid ${YEL}}
.name small{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:22px;letter-spacing:.14em;color:${YEL}}
.name b{font-family:Archivo,sans-serif;font-weight:900;font-size:66px;line-height:1.02;color:${CRE}}
.name span{font-family:Archivo,sans-serif;font-weight:500;font-size:31px;color:${MUT};margin-top:4px}
.name.mute{border-left-color:${MUT}}.name.mute small{color:${MUT}}
.tg{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 22px;width:max-content}
.tg .key{width:170px;height:94px;flex:none}
.tick small{display:block;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:20px;letter-spacing:.14em;color:${TEAL}}
.tick b{display:block;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:44px;color:#FFE7B0;white-space:pre}
.calm{padding:20px 28px 22px;border-left:10px solid ${MUT};max-width:900px}
.calm b{display:block;font-family:Archivo,sans-serif;font-weight:800;font-size:56px;line-height:1.1;color:${CRE}}
.calm span{display:block;margin-top:10px;font-family:Archivo,sans-serif;font-weight:500;font-size:42px;color:${MUT}}
.route{display:flex;align-items:center;gap:18px;padding:18px 26px;width:max-content}
.route b{font-family:Archivo,sans-serif;font-weight:900;font-size:54px;color:${CRE}}
.route .ar{position:relative;display:block;width:260px;height:14px;border-radius:7px;background:rgba(255,255,255,.1)}
.route .ar i{position:absolute;inset:0;border-radius:7px;background:linear-gradient(90deg,#5FBF7A,${YEL});transform-origin:0 50%}
.route .ar::after{content:"";position:absolute;right:-16px;top:-11px;border-left:24px solid ${YEL};border-top:18px solid transparent;border-bottom:18px solid transparent}
.q{margin-top:10px;padding:22px 30px 24px;font-family:Archivo,sans-serif;font-weight:800;font-size:56px;line-height:1.12;color:${CRE};border-left:10px solid ${TEAL};max-width:900px}
.q em{display:block;margin-top:12px;font-style:normal;color:${ORA};font-size:44px}
#dev{position:absolute;left:30px;top:1094px;width:1020px;height:186px;z-index:10;background:linear-gradient(180deg,rgba(10,15,20,.88),rgba(10,15,20,.78));border:1.5px solid rgba(63,198,212,.45);border-radius:10px;box-sizing:border-box;opacity:0}
#dev .dh{position:absolute;left:14px;right:14px;top:6px;height:30px;display:flex;justify-content:space-between;align-items:center}
#dev .dl{font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:19px;letter-spacing:.12em;color:${TEAL}}
#clk{display:flex;gap:14px;align-items:baseline;font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums;opacity:0}
#clk b{font-weight:700;font-size:26px;color:${ORA}}
#clk span{font-weight:500;font-size:22px;color:${CRE}}
#seis{position:absolute;left:30px;top:36px;width:960px;height:96px}
.pin{position:absolute;top:36px;width:140px;height:146px}
.pin .stem{position:absolute;left:69px;top:0;width:2px;height:104px;background:rgba(234,244,246,.55)}
.pin .dot{position:absolute;left:62px;top:96px;width:16px;height:16px;border-radius:50%;background:${TEAL};box-shadow:0 0 0 3px rgba(10,15,20,.9)}
.pin b{position:absolute;left:0;right:0;top:116px;text-align:center;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:19px;letter-spacing:.04em;color:${CRE};white-space:nowrap}
.pin.big .dot{background:${RED}}.pin.big b{color:#FF9C88}`;

const pinT = PINS.map(([, a]) => a);
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP52_LEDAKAN_HALIFAX_1917",
  ep: "52", bg: BG, vig: 0.42, grain: 0.04, capfloor: 0.42, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: "#EAF4F6",
  chip: "SIMULASI 3D &middot; BUKAN FOTO ASLI",
  extraAt: ["s1:Dua#2", "s1:pelan", "s1:pelabuhan", "s1:ledakan", "s1:saat", "s2:Halifax", "s2:Desember", "s2:Perang", "s2:kapal", "s2:menyeberang",
    "s3:Mont-Blanc", "s3:Muatannya", "s3:TNT", "s3:pikrat", "s3:bensol", "s3:dek", "s3:Dari", "s3:Imo", "s3:melaju", "s3:terdesak", "s3:salah",
    "s4:bertabrakan", "s4:lambat", "s4:Tapi", "s4:pecah", "s4:percikan", "s4:api",
    "s5:Awak", "s5:sekoci", "s5:Ratusan", "s5:menonton", "s5:Petugas", "s5:mengirim", "s5:telegraf", "s5:menghentikan", "s5:penumpang", "s5:datang",
    "s6:meledak", "s6:Hampir", "s6:dalam", "s6:radius", "s6:meter", "s6:Gelombang", "s6:kaca",
    "s7:Vince", "s7:Keesokan", "s7:badai", "s7:salju", "s7:bantuan", "s7:Boston", "s8:Sejak", "s8:Halifax", "s8:mengirim", "s8:pohon", "s8:Boston", "s8:Menurut"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:e.classList.contains('row')&&!e.classList.contains('ic')?'flex':(e.classList.contains('name')?'inline-flex':'flex')},t);tl.fromTo(e,{opacity:0,y:30,filter:'blur(6px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.4,ease:'power4.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.7,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 pin:(e,t)=>{gsap.set(e,{opacity:0});tl.fromTo(e,{opacity:0,y:-26},{opacity:1,y:0,duration:.38,ease:'back.out(1.6)',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:36,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.4,ease:'power4.out'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-28,filter:'blur(6px)',duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{
 const f=q('#flash');const hits=[AT['s1:ledakan'],AT['s6:meledak']];let k=0;for(const h of hits){const d=t-h;if(d>0&&d<0.8)k=Math.max(k,1-d/0.8);}f.style.opacity=k*0.75;
 const pad=(n)=>String(Math.floor(n)).padStart(2,'0');
 const hk=q('#hk');if(hk){const a=AT['s1:Dua#2'],b=AT['s1:ledakan'];const u=Math.min(1,Math.max(0,(t-a)/(b-a)));const s=Math.round(1200*(1-u));hk.textContent=pad(s/60)+':'+pad(s%60);}
 const dev=q('#dev');const on=t>K.s3-0.2&&t<AT['s8:Menurut']-0.1;dev.style.opacity=on?Math.min(1,(t-K.s3+0.2)/0.5):0;
 const A0=AT['s4:bertabrakan'],B0=AT['s6:meledak'];const clk=q('#clk');const ck=t>A0-0.2&&t<AT['s6:Gelombang'];clk.style.opacity=ck?1:0;
 if(ck){const u=Math.min(1,Math.max(0,(t-A0)/(B0-A0)));const el=Math.round(1175*u);const rem=1175-el;q('#cdn').textContent='T\\u2212'+pad(rem/60)+':'+pad(rem%60);const sec=8*3600+45*60+el;q('#tim').textContent=pad(sec/3600)+'.'+pad((sec%3600)/60)+'.'+pad(sec%60);}
 const tick=q('#tick');if(tick){const a=AT['s5:telegraf'];const msg='HENTIKAN KERETA';const n=Math.max(0,Math.min(msg.length,Math.floor((t-a+0.1)/0.06)));tick.textContent=msg.slice(0,n)+(n<msg.length&&t>a?'\\u2588':'');}
 const cv=q('#seis');if(!on||!cv)return;const g=cv.getContext('2d');const W=960,Hh=96,mid=52;g.clearRect(0,0,W,Hh);
 g.strokeStyle='rgba(63,198,212,.13)';g.lineWidth=1;for(let x=0;x<=W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,Hh);g.stroke();}for(let y=12;y<Hh;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
 const T=[K.s3,${pinT.map((a) => `AT['${a}']`).join(",")}],X=[10,${PINS.map((_, i) => PX(i)).join(",")}];T.push(K.end);X.push(950);
 const xOf=(tt)=>{if(tt<=T[0])return X[0];for(let i=0;i<T.length-1;i++)if(tt<=T[i+1])return X[i]+(X[i+1]-X[i])*(tt-T[i])/(T[i+1]-T[i]);return X[X.length-1];};
 const tOf=(x)=>{for(let i=0;i<X.length-1;i++)if(x<=X[i+1])return T[i]+(T[i+1]-T[i])*(x-X[i])/(X[i+1]-X[i]);return T[T.length-1];};
 const EV=[[T[1],14,1.2,9],[T[2],22,3.5,5],[T[3],8,2.2,22],[T[4],44,4,6],[T[5],5,4,3],[T[6],9,2.5,4]];
 const amp=(tt)=>{let v=2.2*Math.sin(tt*21.3)+1.4*Math.sin(tt*37.1+1.3);for(const [te,A,dec,fr] of EV){const d=tt-te;if(d>0)v+=A*Math.exp(-d/dec)*Math.sin(d*fr*6.283*0.35+0.3)*(d<0.15?d/0.15:1);}if(tt>T[2]&&tt<T[4])v+=4*Math.min(1,(tt-T[2])/3)*Math.sin(tt*29);return Math.max(-44,Math.min(44,v));};
 const xc=Math.min(950,xOf(t));g.lineWidth=2.6;g.strokeStyle='${TEAL}';g.beginPath();for(let x=10;x<=xc;x+=1.5){const tt=tOf(x);const y=mid-amp(tt);if(x===10)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();
 g.fillStyle='${ORA}';g.beginPath();g.arc(xc,mid-amp(t),5,0,6.3);g.fill();
}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Archivo,'Segoe UI',sans-serif;font-weight:800;font-size:62px;line-height:1.1;letter-spacing:-.005em;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.8),0 0 18px rgba(0,0,0,.75)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${ORA}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Ledakan Halifax 1917", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "pins", pinT.join(","));
