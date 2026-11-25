// EP11 PULAU RUN DITUKAR MANHATTAN. SATELLITEBRIEFING: an OSINT briefing with two satellite feeds half a world apart.
// Analyst grey terrain on deep ocean, amber reticles, nutmeg green for the trees. Panels arrive behind a scan band that sweeps
// up the card and leave as it sweeps down. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
// The estimated timeline keeps "{17,|tujuh belas,}" markup split across words when it follows a prefix ("ke-"). Show the display form.
for (let i = 0; i < TL.words.length; i++) {
  const w = TL.words[i], m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (!m) continue;
  w.text = m[1] + m[2];
  if (!w.text.includes("}")) { let j = i + 1; while (j < TL.words.length && !TL.words[j - 1].text.includes("}") && !/\}/.test(TL.words[j].text)) j++; w.end = TL.words[j].end; TL.words.splice(i + 1, j - i); }
}
const at = anchors(TL);
const AMB = "#FFBE55", COLD = "#9FD3FF", CORAL = "#FF7A59", NUT = "#7CD992", INK = "#071017", BG = "#05090D", WHITE = "#EEF3F5", MUTE = "#9AA3A7";
const HF = 'font-family:"Barlow Semi Condensed",sans-serif', MF = 'font-family:"IBM Plex Mono",monospace';

// Generic code-drawn busts: a hat or a wig says "who", never a likeness.
const bust = (kind, col) => {
  const head = `<ellipse cx="50" cy="47" rx="13" ry="16"/><rect x="44" y="59" width="12" height="12"/><path d="M8 100 C10 80 29 71 50 71 C71 71 90 80 92 100 Z"/>`;
  const capt = `<path d="M22 37 C30 31 70 31 78 37 C72 41 28 41 22 37 Z"/><path d="M36 35 C36 20 64 20 64 35 Z"/><path d="M40 88 L50 74 L60 88" stroke="${col}" stroke-width="3" fill="none" opacity=".7"/>`;
  const duke = `<path d="M30 52 C24 70 28 84 36 86 L38 50 Z M70 52 C76 70 72 84 64 86 L62 50 Z"/><path d="M34 34 C36 22 64 22 66 34 C58 31 42 31 34 34 Z"/><path d="M61 25 C70 17 80 18 84 22 C76 22 70 25 64 30 Z" fill="${col}" opacity=".7"/>`;
  return `<div class="sil"><svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${INK}"/><g fill="#22313a">${head}${kind === "duke" ? duke : capt}</g><rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="${col}" stroke-width="3"/></svg><small>SILUET ILUSTRASI</small></div>`;
};

const html = `
<div id="scanl"></div>
<div id="mute"></div>
<div id="frm"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i></div>
<div id="hudr"><div id="hudloc">FEED B</div><div id="hudalt">ALT --</div></div>
<div id="seam"><i></i></div>
<div id="fa" class="feed">FEED A &middot; MANHATTAN &middot; 40,78&deg;LU 73,97&deg;BB</div>
<div id="fb" class="feed">FEED B &middot; PULAU RUN &middot; 4,55&deg;LS 129,68&deg;BT</div>
<svg id="lks" width="1080" height="1920" viewBox="0 0 1080 1920"><line id="lk" x1="0" y1="0" x2="0" y2="0"/></svg>
<div id="badge">DITUKAR?</div>
<div id="pband"></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">FAKTA SEJARAH NEGARA / EP 11 / BRIEFING SATELIT</div>
  <div class="h1">PULAU <em>RUN</em><br><i>&#8644;</i> MANHATTAN</div>
  <div class="row cold" data-at="s1:New" data-fx="left"><b>MANHATTAN</b><span>pulau tempat kota New York berdiri</span></div>
</div>
<div class="p" data-in="s2" data-out="s2:Panjangnya">
  <div class="tk">LAUT BANDA / MALUKU / INDONESIA</div>
  <div class="h2" data-at="s2:Run" data-fx="up">PULAU RUN</div>
  <div class="sub" data-at="s2:Banda" data-fx="left">KEPULAUAN BANDA &middot; PULAU PALING BARAT</div>
</div>
<div class="p" data-in="s2:Panjangnya" data-out="s3">
  <div class="meas" data-at="s2:tiga" data-fx="fade"><b>&plusmn;<b class="ct" data-from="0" data-to="3" data-a="s2:tiga" data-d=".7">0</b> KM</b><span>panjang<br><i>lebar &plusmn; 1 km</i></span></div>
  <div class="row" data-at="s2:abad" data-fx="left"><b>ABAD KE-17</b><span>penghasil pala &amp; fuli</span></div>
  <div class="row nut" data-at="s2:mahal" data-fx="left"><b>PALA</b><span>harganya luar biasa mahal di Eropa</span></div>
</div>
<div class="p" data-in="s3" data-out="s3:Kapten">
  <div class="date" data-at="s3:1616" data-fx="up">1616</div>
  <div class="row cold" data-at="s3:bersekutu" data-fx="left"><b>RUN + INGGRIS</b><span>warga Run memilih bersekutu</span></div>
  <div class="row coral" data-at="s3:takut" data-fx="left"><b>ALASANNYA</b><span>takut pada Belanda</span></div>
</div>
<div class="p" data-in="s3:Kapten" data-out="s4">
  <div class="card cold" data-at="s3:Kapten" data-fx="left">${bust("capt", COLD)}<div><em>KAPTEN &middot; EAST INDIA COMPANY</em><b>NATHANIEL COURTHOPE</b><span>tiba di Run, 25 Des 1616</span></div></div>
  <div class="row cold" data-at="s3:benteng" data-fx="left"><b>BENTENG</b><span>dibangun di Pulau Run</span></div>
</div>
<div class="p" data-in="s4" data-out="s4:Courthope">
  <div class="tk ct2">PENGEPUNGAN</div>
  <div class="h2 coral" data-at="s4:VOC" data-fx="up">VOC</div>
  <div class="sub coral" data-at="s4:VOC" data-fx="left">KONGSI DAGANG BELANDA</div>
  <div class="st coral" data-at="s4:mengepung" data-fx="stamp">RUN DIKEPUNG</div>
</div>
<div class="p" data-in="s4:Courthope" data-out="s5">
  <div class="tk">BERTAHAN</div>
  <div class="days"><b class="ct" data-from="0" data-to="1540" data-a="s4:bertahan" data-d="2.4">0</b><i>HARI</i></div>
  <div class="row cold" data-at="s4:pasukannya" data-fx="left"><b>COURTHOPE</b><span>+ 39 pembela Eropa &amp; sekutu lokal</span></div>
  <div class="st coral" data-at="s4:1620" data-fx="stamp">1620 &middot; COURTHOPE TEWAS</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk mt">SETELAH BELANDA MENGUASAI RUN</div>
  <div class="h3" data-at="s5:kelamnya" data-fx="up">SISI KELAM</div>
  <div class="mcard" data-at="s5:Laki-laki" data-fx="fade">
    <div class="mr" data-at="s5:Laki-laki" data-fx="fade"><b>laki-laki dewasa</b><span>dibunuh atau diperbudak</span></div>
    <div class="mr" data-at="s5:perempuan" data-fx="fade"><b>perempuan &amp; anak</b><span>diusir</span></div>
    <div class="mr" data-at="s5:pohon" data-fx="fade"><b>semua pohon pala</b><span>ditebang</span></div>
  </div>
  <div class="lb" data-at="s5:supaya" data-fx="fade">supaya Inggris tak bisa kembali</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk">SEMENTARA ITU / AMERIKA UTARA</div>
  <div class="date" data-at="s6:1664" data-fx="up">1664</div>
  <div class="card cold" data-at="s6:Inggris" data-fx="left">${bust("duke", COLD)}<div><em>PIHAK INGGRIS</em><b>DUKE OF YORK</b><span>merebut New Amsterdam dari Belanda</span></div></div>
  <div class="ren" data-at="s6:menamainya" data-fx="left"><s>NEW AMSTERDAM</s><i>&rarr;</i><b>NEW YORK</b></div>
</div>
<div class="p" data-in="s7" data-out="s7:Inggris">
  <div class="tk">AKHIR PERANG INGGRIS&ndash;BELANDA II</div>
  <div class="date" data-at="s7:1667" data-fx="up">1667</div>
  <div class="h3 w" data-at="s7:Breda" data-fx="up">PERJANJIAN BREDA</div>
  <div class="row" data-at="s7:mengesahkan" data-fx="left"><b>STATUS QUO</b><span>yang dikuasai, tetap dikuasai</span></div>
</div>
<div class="p" data-in="s7:Inggris" data-out="s8">
  <div class="tk">PERJANJIAN BREDA 1667 / HASIL</div>
  <div class="swap">
    <div class="bx" id="bxR"><em>PULAU</em><b>RUN</b><span class="pre">diklaim Inggris</span><span class="post coral" data-at="s7:dilepas" data-fx="pop">&rarr; BELANDA</span></div>
    <div class="arr" id="sarr">&#8644;</div>
    <div class="bx" id="bxM"><em>PULAU</em><b>MANHATTAN</b><span class="pre">dulu Belanda</span><span class="post cold" data-at="s7:memegang" data-fx="pop">&rarr; INGGRIS</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tk">HARI INI</div>
  <div class="row cold" data-at="s8:Manhattan" data-fx="left"><b>MANHATTAN</b><span>salah satu pusat dunia</span></div>
  <div class="row nut" data-at="s8:pohon" data-fx="left"><b>RUN</b><span>pohon pala masih tumbuh</span></div>
  <div class="qq" data-at="s8:Menurut" data-fx="pop">SIAPA YANG SEBENARNYA MENANG?</div>
</div>`;

const css = `
#scanl{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.2) 0 2px,rgba(0,0,0,0) 2px 4px);opacity:.28;z-index:8;pointer-events:none}
#mute{position:absolute;inset:0;background:#1a2024;mix-blend-mode:saturation;opacity:0;z-index:6;pointer-events:none}
#frm i{position:absolute;width:42px;height:42px;border-color:${AMB};border-style:solid;opacity:.5;z-index:9}
#frm .c1{left:26px;top:170px;border-width:3px 0 0 3px}#frm .c2{right:26px;top:170px;border-width:3px 3px 0 0}
#frm .c3{left:26px;top:1500px;border-width:0 0 3px 3px}#frm .c4{right:26px;top:1500px;border-width:0 3px 3px 0}
#hudr{position:absolute;right:56px;top:184px;z-index:11;text-align:right;${MF};font-weight:600;font-size:20px;line-height:1.3;color:${AMB};text-shadow:0 2px 8px #000}
#hudalt{color:${WHITE};opacity:.8}
#seam{position:absolute;left:0;right:0;top:0;height:0;z-index:9;opacity:0}
#seam i{position:absolute;left:0;right:0;top:-2px;height:4px;background:${AMB};box-shadow:0 0 18px 3px rgba(255,190,85,.45)}
#seam.mv i{top:-40px;height:80px;background:linear-gradient(180deg,rgba(255,190,85,0),rgba(255,190,85,.35) 40%,rgba(255,226,170,.95) 50%,rgba(255,190,85,.35) 60%,rgba(255,190,85,0));box-shadow:none}
.feed{position:absolute;right:56px;z-index:11;${MF};font-weight:600;font-size:19px;color:${INK};background:${AMB};padding:3px 10px;opacity:0}
#lks{position:absolute;left:0;top:0;z-index:9;pointer-events:none}
#lk{stroke:${AMB};stroke-width:4;stroke-dasharray:14 10;opacity:0;filter:drop-shadow(0 0 6px rgba(0,0,0,.9))}
#badge{position:absolute;z-index:11;transform:translate(-50%,-50%);${HF};font-weight:800;font-size:44px;letter-spacing:.02em;color:${INK};background:${AMB};padding:4px 18px 6px;white-space:nowrap;opacity:0;box-shadow:0 8px 28px rgba(0,0,0,.6)}
#pband{position:absolute;left:40px;width:960px;top:0;height:70px;z-index:12;opacity:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,190,85,.5) 0 2px,rgba(255,190,85,.12) 2px 5px);box-shadow:0 0 30px 4px rgba(255,190,85,.35);border-top:3px solid ${AMB};border-bottom:3px solid ${AMB}}
.p{color:${WHITE}}
.tk{display:inline-block;${MF};font-weight:600;font-size:25px;color:${AMB};letter-spacing:.02em;margin-bottom:10px;text-shadow:0 2px 10px #000;background:rgba(5,9,13,.6);padding:2px 8px}
.tk.ct2{color:${CORAL}}.tk.mt{color:${MUTE}}
.h1{${HF};font-weight:800;font-size:124px;line-height:.98;color:${WHITE};text-shadow:0 4px 26px #000;letter-spacing:.005em}.h1 em{font-style:normal;color:${NUT}}.h1 i{font-style:normal;color:${AMB}}
.h2{${HF};font-weight:800;font-size:150px;line-height:1;color:${WHITE};text-shadow:0 4px 26px #000}.h2.coral{color:${CORAL}}
.h3{${HF};font-weight:800;font-size:96px;line-height:1;color:${MUTE};text-shadow:0 4px 22px #000}.h3.w{color:${WHITE};font-size:84px;margin-top:6px}
.sub{display:inline-block;margin-top:8px;${MF};font-weight:600;font-size:27px;color:${INK};background:${AMB};padding:6px 14px}.sub.coral{background:${CORAL}}
.row{display:flex;gap:18px;align-items:center;margin-top:14px;padding:12px 18px;background:rgba(5,12,17,.84);border-left:7px solid ${AMB};width:fit-content;max-width:900px}
.row.cold{border-left-color:${COLD}}.row.coral{border-left-color:${CORAL}}.row.nut{border-left-color:${NUT}}
.row b{flex:none;${HF};font-weight:800;font-size:48px;line-height:1;color:${WHITE}}
.row.nut b{color:${NUT}}.row.coral b{color:${CORAL}}.row.cold b{color:${COLD}}
.row span{${MF};font-weight:500;font-size:26px;line-height:1.25;color:${WHITE}}
.meas{display:flex;gap:20px;align-items:flex-end}
.meas>b{${HF};font-weight:800;font-size:170px;line-height:.9;color:${AMB};text-shadow:0 4px 26px #000}.meas>b b{font-weight:800}
.meas span{${MF};font-weight:600;font-size:30px;line-height:1.25;color:${WHITE};padding-bottom:14px;text-shadow:0 2px 10px #000}.meas span i{font-style:normal;color:${MUTE};font-size:26px}
.date{${HF};font-weight:800;font-size:170px;line-height:.92;color:${AMB};text-shadow:0 0 30px rgba(255,190,85,.25),0 6px 26px #000}
.card{display:flex;gap:18px;align-items:center;margin-top:12px;padding:12px;background:rgba(5,12,17,.88);border-top:5px solid ${COLD};box-shadow:0 14px 40px rgba(0,0,0,.55);width:fit-content;max-width:910px}
.sil{flex:none;width:136px;text-align:center}.sil svg{width:136px;height:136px;display:block}
.sil small{display:block;margin-top:4px;${MF};font-size:13px;font-weight:500;color:${WHITE};opacity:.6}
.card em{display:block;font-style:normal;${MF};font-weight:600;font-size:21px;color:${COLD}}
.card b{display:block;${HF};font-weight:800;font-size:56px;line-height:1.02;color:${WHITE}}
.card span{display:block;margin-top:4px;${MF};font-weight:500;font-size:24px;line-height:1.25;color:${WHITE};opacity:.92}
.st{display:inline-block;margin-top:18px;${HF};font-weight:800;font-size:60px;line-height:1.05;padding:4px 22px 8px;color:${INK};box-shadow:0 10px 34px rgba(0,0,0,.6)}
.st.coral{background:${CORAL}}
.days{display:flex;align-items:flex-end;gap:18px}.days b{${HF};font-weight:800;font-size:210px;line-height:.88;color:${WHITE};text-shadow:0 6px 30px #000}.days i{font-style:normal;${MF};font-weight:600;font-size:40px;color:${AMB};padding-bottom:18px}
.mcard{margin-top:16px;background:rgba(14,18,21,.9);border:2px solid #3a4448;padding:8px 20px;width:fit-content}
.mr{display:flex;gap:16px;align-items:baseline;padding:10px 0;border-bottom:1px solid #2c3438}.mr:last-child{border-bottom:none}
.mr b{${MF};font-weight:600;font-size:28px;color:${WHITE};min-width:330px}.mr span{${MF};font-weight:500;font-size:28px;color:${MUTE}}
.lb{margin-top:12px;${MF};font-weight:500;font-size:26px;color:#C3CACD;text-shadow:0 2px 10px #000}
.ren{display:flex;align-items:center;gap:14px;margin-top:14px;padding:10px 18px;background:rgba(5,12,17,.86);width:fit-content}
.ren s{${HF};font-weight:700;font-size:40px;color:${CORAL};text-decoration-thickness:4px}.ren i{font-style:normal;${MF};font-size:36px;color:${AMB}}.ren b{${HF};font-weight:800;font-size:48px;color:${COLD}}
.swap{position:relative;display:flex;align-items:center;gap:0;margin-top:14px;width:900px;height:250px}
.bx{position:absolute;top:0;width:390px;height:240px;box-sizing:border-box;padding:16px 22px;background:rgba(5,12,17,.9);border:3px solid ${AMB}}
#bxR{left:0}#bxM{left:510px}
.bx em{display:block;font-style:normal;${MF};font-weight:600;font-size:21px;color:${AMB}}
.bx b{display:block;${HF};font-weight:800;font-size:66px;line-height:1.05;color:${WHITE}}
.bx .pre{display:block;${MF};font-weight:500;font-size:23px;color:${MUTE}}
.bx .post{display:inline-block;margin-top:8px;${HF};font-weight:800;font-size:44px;padding:0 12px 2px;color:${INK}}
.bx .post.coral{background:${CORAL}}.bx .post.cold{background:${COLD}}
.arr{position:absolute;left:400px;top:70px;width:100px;text-align:center;${HF};font-weight:800;font-size:80px;color:${AMB}}
.qq{display:inline-block;margin-top:18px;padding:10px 20px 12px;${HF};font-weight:800;font-size:62px;line-height:1.02;color:${INK};background:${AMB};max-width:860px}`;

// Scan-band wipe: a banded amber strip climbs the card and reveals it; on exit it falls and erases it. Time-driven.
const hud = `(()=>{let L=null;const ez=(u)=>u<=0?0:u>=1?1:1-Math.pow(1-u,3);const pb=document.getElementById('pband');
const bR=document.getElementById('bxR'),bM=document.getElementById('bxM'),ar=document.getElementById('sarr');
const MR=[...document.querySelectorAll('.mr')];
return (t)=>{
 for(const m of MR)m.style.display=t>=AT[m.dataset.at]-.05?'flex':'none';
 if(!L)L=[...document.querySelectorAll('#root .p')].map(p=>({p,first:p.dataset.first==='1',a:p.dataset.in==='@0'?0:(AT[p.dataset.in]??K[p.dataset.in]),b:p.dataset.out==='@END'?OUT-.1:(AT[p.dataset.out]??K[p.dataset.out])}));
 let band=-1,bo=0;
 for(const q of L){const H=q.p.offsetHeight+30,top=q.p.offsetTop-15;
  const ui=q.first?1:(t-(q.a-.14))/.45,uo=(t-(q.b-.3))/.3;
  if(uo>0&&uo<1){const u=ez(uo);q.p.style.clipPath='inset('+(u*100).toFixed(2)+'% -40px -40px -40px)';band=top+H*u;bo=Math.sin(Math.PI*uo);}
  else if(ui>0&&ui<1){const u=ez(ui);q.p.style.clipPath='inset('+((1-u)*100).toFixed(2)+'% -40px -40px -40px)';band=top+H*(1-u);bo=Math.sin(Math.PI*Math.min(1,ui*1.1));}
  else q.p.style.clipPath='none';}
 if(band>=0){pb.style.top=(band-35).toFixed(1)+'px';pb.style.opacity=bo.toFixed(3);}else pb.style.opacity=0;
 // Breda swap: the two boxes trade places on "Inggris"
 const s0=AT['s7:Inggris']+.15,u=Math.min(1,Math.max(0,(t-s0)/.9)),e=u*u*(3-2*u);
 if(bR){bR.style.transform='translate('+(510*e).toFixed(1)+'px,'+(-26*Math.sin(Math.PI*e)).toFixed(1)+'px)';bM.style.transform='translate('+(-510*e).toFixed(1)+'px,'+(26*Math.sin(Math.PI*e)).toFixed(1)+'px)';ar.style.transform='rotate('+(180*e).toFixed(1)+'deg)';}
};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP11_PULAU_RUN_DITUKAR_MANHATTAN",
  ep: "11", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.45, html, css, chipFont: '"IBM Plex Mono",monospace', chipColor: WHITE,
  chip: "ILUSTRASI &middot; PETA DISEDERHANAKAN",
  extraAt: ["s1:ditukar", "s1:Maluku", "s1:Manhattan", "s2:Panjangnya", "s2:kilometer", "s2:penghasil", "s2:tiga", "s2:abad", "s2:Banda", "s2:pala",
    "s3:warga", "s3:takut", "s3:Belanda", "s3:Courthope", "s3:membangun", "s3:benteng", "s3:tiba", "s3:Kapten", "s3:Inggris",
    "s4:VOC", "s4:mengepung", "s4:1620", "s4:bertahan", "s4:hari", "s4:Courthope", "s4:1.540", "s4:tewas",
    "s5:Laki-laki", "s5:ditebang", "s5:semua", "s5:dibunuh", "s5:diusir", "s5:Belanda",
    "s6:Amsterdam", "s6:Manhattan", "s6:menamainya", "s6:merebut", "s6:Inggris", "s6:Amerika",
    "s7:Breda", "s7:Run", "s7:Inggris", "s7:Belanda", "s8:pohon", "s8:jadi", "s8:dunia", "s8:Manhattan", "s8:pusat", "s8:Menurut", "s8:menang"],
  panelIn: `(tl,p,a)=>tl.set(p,{opacity:1},a-.14)`,
  panelOut: `(tl,p,b)=>tl.set(p,{opacity:1},b)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0% 0% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power2.inOut'},OUT-.1);`,
  hud,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:940px;text-align:center;font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:48px;line-height:1.24;color:#F2F6F8;background:rgba(5,10,14,.78);border-left:6px solid ${AMB};padding:10px 26px 14px;text-shadow:0 2px 8px #000}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"#F2F6F8"},{color:"${AMB}",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F2F6F8",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.2,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Pulau Run ditukar Manhattan", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
