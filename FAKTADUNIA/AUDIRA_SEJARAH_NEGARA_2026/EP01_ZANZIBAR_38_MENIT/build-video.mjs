// EP01 ZANZIBAR 38 MENIT. Tactical naval chart at dawn: teal sea, desaturated land, amber HUD, crimson for the sultan, cold white for the Royal Navy.
// Panels arrive with a scanline wipe like a satellite briefing refreshing. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const AMB = "#FFBE55", CRIM = "#E0384B", COLD = "#E8F1F6", INK = "#06171D", BG = "#081E25";

// Code-drawn busts. Deliberately generic shapes: they say "who" with headwear and side colour, never a likeness.
const bust = (kind, col) => {
  const head = `<ellipse cx="50" cy="46" rx="13" ry="16"/><rect x="44" y="58" width="12" height="13"/><path d="M8 100 C10 79 29 70 50 70 C71 70 90 79 92 100 Z"/>`;
  const turban = `<path d="M32 42 C29 22 41 15 50 15 C60 15 71 22 68 42 C61 35 39 35 32 42 Z"/><path d="M33 36 C44 30 56 30 67 36" stroke="${col}" stroke-width="2.4" fill="none" opacity=".75"/>`;
  const beardL = `<path d="M37 50 C38 67 46 73 50 73 C54 73 62 67 63 50 C58 59 42 59 37 50 Z"/>`;
  const beardS = `<path d="M39 54 C41 63 47 66 50 66 C53 66 59 63 61 54 C57 58 43 58 39 54 Z"/>`;
  const cap = `<path d="M33 34 L67 34 L69 26 C61 19 39 19 31 26 Z"/><path d="M34 35 L62 35 L57 40 L36 40 Z"/><rect x="46" y="27" width="8" height="4" fill="${col}" opacity=".8"/>`;
  const beardF = `<path d="M36 49 C36 69 46 75 50 75 C54 75 64 69 64 49 C58 61 42 61 36 49 Z"/>`;
  const epa = `<rect x="14" y="77" width="17" height="5" fill="${col}" opacity=".8"/><rect x="69" y="77" width="17" height="5" fill="${col}" opacity=".8"/>`;
  const parts = kind === "hamad" ? head + turban + beardL : kind === "khalid" ? head + turban + beardS : head + cap + beardF + epa;
  return `<div class="sil"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${INK}"/><g fill="#1d2f35">${parts}</g><rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="${col}" stroke-width="3"/></svg><small>SILUET ILUSTRASI</small></div>`;
};
const cup = `<svg class="cup" viewBox="0 0 64 64"><path d="M10 26 H46 V44 C46 52 40 56 34 56 H22 C16 56 10 52 10 44 Z" fill="none" stroke="${AMB}" stroke-width="4"/><path d="M46 31 C56 31 56 45 46 45" fill="none" stroke="${AMB}" stroke-width="4"/><path d="M20 20 C16 14 24 11 20 4 M30 20 C26 14 34 11 30 4 M40 20 C36 14 44 11 40 4" fill="none" stroke="${AMB}" stroke-width="3" opacity=".6"/></svg>`;

const html = `
<div id="scanl"></div>
<div id="frm"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>
<div id="hudr"><div id="hudloc">ZANZIBAR &middot; 6&deg;09&prime; LS 39&deg;11&prime; BT</div><div id="hudalt">ALT --</div></div>
<div id="scan"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">FAKTA SEJARAH NEGARA / EP 01</div>
  <div class="clk"><div id="bigclk" class="nb">00<i>:00</i></div><div class="clklb">DURASI PERANG &middot; 27 AGUSTUS 1896</div></div>
  <div class="h1" data-at="s1:perang" data-fx="up">PERANG TERSINGKAT<br><span>DALAM SEJARAH</span></div>
  <div class="cuprow" data-at="s1:kopimu" data-fx="left">${cup}<span>selesai sebelum kopimu dingin</span></div>
  <div class="st amb" data-at="s1:menit" data-fx="stamp">&plusmn; 38 MENIT</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">SAMUDRA HINDIA / LEPAS PANTAI AFRIKA TIMUR</div>
  <div class="h2" data-at="s2:Zanzibar" data-fx="up">ZANZIBAR</div>
  <div class="sub" data-at="s2:Tanzania" data-fx="left">KINI BAGIAN DARI TANZANIA</div>
  <div class="row cold" data-at="s2:1890" data-fx="left"><b class="nb">1890</b><span>jadi protektorat Inggris (perjanjian 14 Juni 1890)</span></div>
  <div class="row cold" data-at="s2:Artinya" data-fx="left"><b>SULTAN BARU</b><span>wajib mendapat restu Inggris</span></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="date" data-at="s3:25" data-fx="up"><b class="nb">25</b> AGUSTUS <b class="nb">1896</b></div>
  <div class="card crim" data-at="s3:Sultan" data-fx="left">${bust("hamad", CRIM)}<div><em>SULTAN ZANZIBAR</em><b>HAMAD BIN THUWAINI</b><span>wafat mendadak, pukul 11.40</span></div></div>
  <div class="card crim" data-at="s3:Khalid" data-fx="left">${bust("khalid", CRIM)}<div><em>UMUR 29 TAHUN</em><b>KHALID BIN BARGHASH</b><span>masuk istana tanpa restu Inggris</span></div></div>
</div>
<div class="p" data-in="s4" data-out="s4:Ultimatumnya">
  <div class="tk crimt">PIHAK SULTAN KHALID</div>
  <div class="v nb">&plusmn;<b class="ct" data-from="0" data-to="2800" data-a="s4:2.800" data-d="1.1">0</b></div>
  <div class="lb">ORANG BERJAGA DI ISTANA</div>
  <div class="card cold" data-at="s4:Inggris" data-fx="left">${bust("rawson", COLD)}<div><em>LAKSAMANA MUDA &middot; ARMADA INGGRIS</em><b>HARRY RAWSON</b><span>5 kapal perang membidik istana</span></div></div>
</div>
<div class="p" data-in="s4:Ultimatumnya" data-out="s5">
  <div class="tk">ULTIMATUM INGGRIS / 27 AGUSTUS 1896</div>
  <div class="ult"><div id="ultclk" class="nb">08:55<i>:00</i></div><div class="ubar"><i id="ultbar"></i></div></div>
  <div class="ck" data-at="s4:turunkan" data-fx="left"><b>01</b><span>TURUNKAN BENDERA</span></div>
  <div class="ck" data-at="s4:tinggalkan" data-fx="left"><b>02</b><span>TINGGALKAN ISTANA</span></div>
  <div class="st amb" data-at="s4:sembilan" data-fx="stamp">BATAS PUKUL 09.00</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk crimt">PELABUHAN ZANZIBAR / 27.08.1896</div>
  <div class="fire"><div id="fireclk" class="nb">09:00<i>:30</i></div></div>
  <div class="st crim" data-at="s5:menembak" data-fx="stamp">09.02 &middot; TEMBAKAN DIBUKA</div>
  <div class="row" data-at="s5:terbakar" data-fx="left"><b>ISTANA</b><span>sebagian besar dari kayu, terbakar</span></div>
  <div class="row" data-at="s5:ditenggelamkan" data-fx="left"><b>HHS GLASGOW</b><span>kapal kebanggaan sultan, tenggelam</span></div>
</div>
<div class="p" data-in="s6" data-out="s6:Korban">
  <div class="row" data-at="s6:jatuh" data-fx="left"><b>BENDERA JATUH</b><span>lalu tembakan berhenti</span></div>
  <div class="lb amt" data-at="s6:Tergantung" data-fx="fade">TERGANTUNG CARA MENGHITUNG</div>
  <div class="big" data-at="s6:38" data-fx="pop"><b class="nb">38</b><i class="nb" data-at="s6:45" data-fx="fade">&ndash;45</i></div>
  <div class="mn" data-at="s6:38" data-fx="fade">MENIT &middot; 09.02 &rarr; 09.40 / 09.46</div>
</div>
<div class="p" data-in="s6:Korban" data-out="s7">
  <div class="tk">KORBAN TEWAS DAN LUKA</div>
  <div class="side crim" data-at="s6:lima" data-fx="left"><em>PIHAK SULTAN</em><b class="nb">&plusmn;500</b><span>termasuk warga sipil</span><div class="bar"><i data-at="s6:lima" data-fx="grow"></i></div></div>
  <div class="side cold" data-at="s6:satu" data-fx="left"><em>PIHAK INGGRIS</em><b class="nb">1</b><span>pelaut terluka</span><div class="bar"><i class="one" data-at="s6:satu" data-fx="grow"></i></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="card crim" data-at="s7:Khalid" data-fx="left">${bust("khalid", CRIM)}<div><em>KHALID BIN BARGHASH</em><b>KABUR</b><span>ke konsulat Jerman, lalu ke daratan (Afrika Timur Jerman)</span></div></div>
  <div class="row cold" data-at="s7:mengangkat" data-fx="left"><b>SULTAN HAMOUD</b><span>diangkat sebagai pilihan Inggris</span></div>
  <div class="st cold" data-at="s7:berdaulat" data-fx="stamp">TIDAK LAGI BENAR-BENAR BERDAULAT</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="h3" data-at="s8:Jadi" data-fx="up">PERANG TERSINGKAT<br><span>BUKAN LELUCON</span></div>
  <div class="duo" data-at="s8:timpangnya" data-fx="up"><i class="cold">5 KAPAL PERANG</i><u>VS</u><i class="crim">ISTANA KAYU</i></div>
  <div class="lb" data-at="s8:kolonial" data-fx="fade">KETIMPANGAN KEKUATAN DI ZAMAN KOLONIAL</div>
  <div class="qq" data-at="s8:Menurut" data-fx="pop">APA YANG MEMBUAT KHALID<br>TETAP BERTAHAN?</div>
</div>`;

const OS = "Oswald,sans-serif", MONO = '"IBM Plex Mono",monospace';
const css = `
#scanl{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,rgba(0,0,0,0) 2px 5px);opacity:.32;z-index:8;pointer-events:none}
#frm i{position:absolute;width:46px;height:46px;border-color:${AMB};border-style:solid;opacity:.55;z-index:9}
#frm .c1{left:28px;top:172px;border-width:3px 0 0 3px}#frm .c2{right:28px;top:172px;border-width:3px 3px 0 0}
#frm .c3{left:28px;top:1238px;border-width:0 0 3px 3px}#frm .c4{right:28px;top:1238px;border-width:0 3px 3px 0}
#hudr{position:absolute;right:56px;top:184px;z-index:11;text-align:right;font-family:${MONO};font-weight:600;font-size:21px;line-height:1.3;color:${AMB};opacity:.9;text-shadow:0 2px 8px #000}
#hudalt{color:${COLD};opacity:.8}
#scan{position:absolute;left:0;right:0;top:0;height:4px;background:${AMB};box-shadow:0 0 24px 6px rgba(255,190,85,.55);opacity:0;z-index:12}
.tk{font-family:${MONO};font-weight:600;font-size:27px;color:${AMB};letter-spacing:.02em;margin-bottom:12px;text-shadow:0 2px 10px #000}
.tk.crimt,.crimt{color:${CRIM}}
.clk{margin:6px 0 4px}
#bigclk{font-family:${OS};font-weight:700;font-size:250px;line-height:.95;color:${AMB};text-shadow:0 0 40px rgba(255,190,85,.35),0 6px 30px #000;letter-spacing:.01em}
#bigclk i,#ultclk i,#fireclk i{font-style:normal;font-size:.45em;opacity:.85}
.clklb{font-family:${MONO};font-weight:600;font-size:24px;color:${COLD};opacity:.85;letter-spacing:.04em}
.h1{margin-top:28px;font-family:${OS};font-weight:700;font-size:96px;line-height:1.02;color:${COLD};text-shadow:0 4px 26px #000}.h1 span{color:${AMB}}
.cuprow{display:flex;align-items:center;gap:16px;margin-top:16px;font-family:${MONO};font-weight:600;font-size:30px;color:${COLD};text-shadow:0 2px 10px #000}
.cup{width:64px;height:64px;flex:none}
.st{display:inline-block;margin-top:20px;font-family:${OS};font-weight:700;font-size:58px;line-height:1.1;padding:6px 22px;color:${INK}}
.st.amb{background:${AMB};box-shadow:0 10px 34px rgba(0,0,0,.6)}
.st.crim{background:${CRIM};color:#fff;box-shadow:0 10px 34px rgba(0,0,0,.6)}
.st.cold{background:${COLD};font-size:46px;box-shadow:0 10px 34px rgba(0,0,0,.6)}
.h2{font-family:${OS};font-weight:700;font-size:150px;line-height:1;color:${COLD};letter-spacing:.02em;text-shadow:0 4px 26px #000}
.sub{display:inline-block;margin-top:6px;font-family:${MONO};font-weight:600;font-size:30px;color:${INK};background:${AMB};padding:6px 14px}
.row{display:flex;gap:18px;align-items:center;margin-top:16px;padding:12px 18px;background:rgba(6,23,29,.82);border-left:7px solid ${CRIM}}
.row.cold{border-left-color:${COLD}}
.row b{flex:none;font-family:${OS};font-weight:700;font-size:50px;line-height:1;color:${COLD}}
.row span{font-family:${MONO};font-weight:500;font-size:27px;line-height:1.25;color:${COLD}}
.date{font-family:${OS};font-weight:700;font-size:84px;line-height:1;color:${COLD};text-shadow:0 4px 22px #000;margin-bottom:14px}.date b{color:${AMB}}
.card{display:flex;gap:18px;align-items:center;margin-top:14px;padding:12px;background:rgba(6,23,29,.86);border-top:5px solid ${CRIM};box-shadow:0 14px 40px rgba(0,0,0,.55)}
.card.cold{border-top-color:${COLD}}
.sil{flex:none;width:150px;text-align:center}.sil svg{width:150px;height:150px;display:block}
.sil small{display:block;margin-top:4px;font-family:${MONO};font-size:14px;font-weight:500;color:${COLD};opacity:.6;letter-spacing:.03em}
.card em{display:block;font-style:normal;font-family:${MONO};font-weight:600;font-size:22px;color:${CRIM};letter-spacing:.03em}
.card.cold em{color:${COLD};opacity:.8}
.card b{display:block;font-family:${OS};font-weight:700;font-size:56px;line-height:1.04;color:${COLD}}
.card span{display:block;margin-top:4px;font-family:${MONO};font-weight:500;font-size:26px;line-height:1.25;color:${COLD};opacity:.92}
.v{font-family:${OS};font-weight:700;font-size:170px;line-height:1;color:${CRIM};text-shadow:0 4px 26px #000}
.lb{font-family:${MONO};font-weight:600;font-size:28px;line-height:1.3;color:${COLD};margin-top:6px;text-shadow:0 2px 10px #000}
.lb.amt{color:${AMB}}
.ult{display:flex;flex-direction:column;gap:10px;margin:4px 0 14px}
#ultclk{font-family:${OS};font-weight:700;font-size:180px;line-height:.95;color:${AMB};text-shadow:0 0 30px rgba(255,190,85,.3),0 6px 30px #000}
.ubar{width:760px;height:12px;background:rgba(255,190,85,.18)}.ubar i{display:block;height:100%;width:0;background:${AMB}}
.ck{display:flex;align-items:center;gap:18px;background:rgba(6,23,29,.82);padding:8px 16px;margin-bottom:8px;border-left:7px solid ${AMB}}
.ck b{flex:none;font-family:${MONO};font-weight:600;font-size:34px;color:${AMB}}.ck span{font-family:${OS};font-weight:700;font-size:50px;color:${COLD}}
.fire{margin:4px 0}
#fireclk{font-family:${OS};font-weight:700;font-size:200px;line-height:.95;color:${CRIM};text-shadow:0 0 34px rgba(224,56,75,.4),0 6px 30px #000}
.big{font-family:${OS};font-weight:700;font-size:300px;line-height:.9;color:${AMB};text-shadow:0 0 40px rgba(255,190,85,.3),0 6px 30px #000;margin-top:4px}.big i{font-style:normal;color:${COLD}}
.mn{font-family:${MONO};font-weight:600;font-size:30px;color:${COLD};text-shadow:0 2px 10px #000}
.side{margin-top:14px;padding:14px 18px;background:rgba(6,23,29,.84);border-left:8px solid ${CRIM}}
.side.cold{border-left-color:${COLD}}
.side em{display:block;font-style:normal;font-family:${MONO};font-weight:600;font-size:24px;color:${CRIM}}.side.cold em{color:${COLD}}
.side b{display:inline-block;font-family:${OS};font-weight:700;font-size:120px;line-height:1;color:${CRIM};margin-right:18px}.side.cold b{color:${COLD}}
.side span{font-family:${MONO};font-weight:500;font-size:28px;color:${COLD}}
.bar{margin-top:10px;height:16px;background:rgba(232,241,246,.1)}.bar i{display:block;height:100%;width:100%;background:${CRIM};transform-origin:0 50%}.bar i.one{width:4px;background:${COLD}}
.h3{font-family:${OS};font-weight:700;font-size:96px;line-height:1.03;color:${COLD};text-shadow:0 4px 22px #000}.h3 span{color:${AMB}}
.duo{display:flex;align-items:center;gap:14px;margin-top:18px}
.duo i{flex:1;text-align:center;font-style:normal;font-family:${OS};font-weight:700;font-size:46px;padding:12px 4px}
.duo i.cold{background:${COLD};color:${INK}}.duo i.crim{background:${CRIM};color:#fff}
.duo u{text-decoration:none;font-family:${MONO};font-weight:600;font-size:34px;color:${AMB}}
.qq{display:inline-block;margin-top:20px;padding:14px 20px;font-family:${OS};font-weight:700;font-size:54px;line-height:1.08;color:${INK};background:${AMB}}`;

// Shot schedule shared by the 3D world (flashes, tracers, impacts) and mix.py (booms). Seeded, so it never moves between builds.
let seed = 1896;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const fire0 = at("s5:meriam"), cease = at("s6:berhenti"), gl0 = at("s5:Kapal") - 0.5, glS = at("s5:ditenggelamkan");
const per = [2.3, 2.0, 2.2, 1.6, 1.7];
const shots = [];
for (let i = 0; i < 5; i++) {
  for (let s = fire0 + i * 0.13; s < cease - 0.7; s += per[i] * (0.75 + 0.5 * rnd())) {
    let tg = [0, 1, 2, 5, 1, 0][Math.floor(rnd() * 6)];
    if (s > gl0 && s < glS - 0.3 && i >= 3) tg = 3;
    shots.push([+s.toFixed(3), i, tg, Math.floor(rnd() * 1000)]);
  }
}
shots.push([+(at("s6:jatuh") - 0.65).toFixed(3), 0, 4, 7]);
shots.sort((a, b) => a[0] - b[0]);

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "01", bg: BG, vig: 0.55, grain: 0.07, capfloor: 0.55, html, css, chipFont: MONO, chipColor: COLD,
  chip: "REKONSTRUKSI ILUSTRASI",
  K: { shots },
  extraAt: ["s1:Kira-kira", "s2:Zanzibar#2", "s2:protektorat", "s3:1896", "s3:wafat", "s3:masuk", "s3:istana", "s4:lima", "s4:pelabuhan", "s4:membidik",
    "s5:Jam", "s5:dua", "s5:meriam", "s5:Istana", "s5:Kapal", "s5:Glasgow", "s6:Bendera", "s6:ditembak", "s6:berhenti", "s6:Inggris",
    "s7:konsulat", "s7:daratan", "s8:lelucon", "s8:timpangnya"],
  // Scanline wipe: the panel is revealed top-down behind one amber scan bar, like a briefing screen refreshing.
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{clipPath:'inset(0% 0% 100% 0%)',opacity:1},{clipPath:'inset(0% 0% 0% 0%)',duration:.38,ease:'power2.out'},a-.12);tl.fromTo('#scan',{y:200,opacity:.95},{y:1150,opacity:0,duration:.44,ease:'power2.out',immediateRender:false},a-.12);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(100% 0% 0% 0%)',duration:.2,ease:'power2.in'},b-.2)`,
  // The closing card opens like a radar contact growing from the centre.
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 42%)'});tl.to('#outro',{clipPath:'circle(150% at 50% 42%)',duration:.6,ease:'power3.inOut'},OUT-.15);`,
  hud: `(t)=>{
 const pad=n=>String(Math.floor(n)).padStart(2,'0');
 const f=(s)=>pad(s/3600)+':'+pad(s/60%60)+'<i>:'+pad(s%60)+'</i>';
 const c01=x=>x<0?0:x>1?1:x;
 const H=(h,m,s)=>h*3600+m*60+(s||0);
 // hook: an elapsed-time counter runs the whole war, 00:00 to 38:00, landing on the word menit
 let x=c01((t-.3)/(AT['s1:menit']-.3));x=x*x*(3-2*x);const el=38*60*x;
 q('#bigclk').innerHTML=pad(el/60)+'<i>:'+pad(el%60)+(x>=1?' MENIT':'')+'</i>';
 // ultimatum: 08:55 to 09:00 across the demand, then it holds and blinks
 const u0=AT['s4:Ultimatumnya'],u1=AT['s4:sembilan'],ux=c01((t-u0)/(u1-u0));
 q('#ultclk').innerHTML=f(H(8,55)+300*ux);q('#ultbar').style.width=(ux*100).toFixed(1)+'%';
 q('#ultclk').style.opacity=t>u1?(Math.floor((t-u1)*3)%2?.35:1):1;
 // firing: 09:00:30 to 09:02:00 on the words, then the clock keeps running through the shelling
 const d0=K.s5,d1=AT['s5:dua'];
 const fs=t<d1?H(9,0,30)+90*c01((t-d0)/(d1-d0)):H(9,2)+600*c01((t-d1)/(K.s5e-d1));
 q('#fireclk').innerHTML=f(fs);
 q('#hudr').style.opacity=t<K.s2-.2?0:.9;
}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:50px;line-height:1.24;letter-spacing:-.01em;color:#E8F1F6;text-shadow:0 3px 12px #000,0 0 3px #000}
.w{display:inline-block;padding:0 2px}`,
(id, w) => `tl.fromTo("#${id}",{color:"#E8F1F6",y:0},{color:"${AMB}",y:-4,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#E8F1F6",y:0,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:12,opacity:.35},{y:0,opacity:1,duration:.1,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Zanzibar 38 Menit", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "shots", shots.length, "duration", TL.duration, "outro", K.outro);
