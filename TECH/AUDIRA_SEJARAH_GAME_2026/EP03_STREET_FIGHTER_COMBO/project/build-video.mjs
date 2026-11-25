// EP03 STREET FIGHTER COMBO / TOONFORGE. Cel-shaded dusk street world (arena, arcade cabinets, bonus stage) with two original fighters.
// Panels are manga callout boxes (white, thick ink border, hard offset shadow) that snap in with a skew and whip out. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld, sceneKeys } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const K0 = sceneKeys(TL);
const INK = "#111116", RED = "#e63946", YEL = "#ffc93c", TEAL = "#16b3a6", WH = "#ffffff";

// hit schedule (all from scene keys / word anchors)
const h1 = [K0.s1 - 0.25, at("s1:jurus"), at("s1:berantai"), at("s1:game"), at("s1:fighting"), at("s1:awalnya")].map((x) => +x.toFixed(3));
const h3 = [at("s3:menghancurkan"), at("s3:mobil"), at("s3:poin")];
const h4 = [at("s4:pertama"), at("s4:kedua"), at("s4:berikutnya")];
const h6 = [at("s6:empat"), at("s6:pukulan"), at("s6:bisa"), at("s6:disambung"), at("s6:Ternyata"), at("s6:bisa#2"), at("s6:sampai"), at("s6:delapan")];
const big = [h1[5], h3[2], h6[7]];

const html = `
<div id="flash"></div>
<div id="vhs"><div class="scan"></div><div class="vl"><span id="vmode">&#9664;&#9664; REWIND</span></div><div class="vr" id="vtc">00:00:00</div></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <span class="tag">SEJARAH GAME &middot; EP 03</span>
  <div class="ttl">COMBO BERAWAL<br>DARI <em>BUG</em></div>
  <div class="hit"><b id="hc1">1</b><span>HIT<br>COMBO</span><b class="bug" data-at="s1:bug" data-fx="stamp">BUG?</b></div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <span class="tag">MESIN ARCADE</span>
  <div class="two"><div class="yr" data-at="s2:Tahun" data-fx="lit">1991</div>
  <div class="rows"><b class="r" data-at="s2:Capcom" data-fx="lit"><i>STUDIO</i>Capcom</b><b class="r" data-at="s2:Street" data-fx="lit"><i>GAME</i>Street Fighter II</b>
  <b class="r" data-at="s2:dua" data-fx="lit"><i>WAKTU</i>&plusmn; 2 tahun</b><b class="r" data-at="s2:tiga" data-fx="lit"><i>TIM</i>35&ndash;40 orang</b></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <span class="tag">BONUS STAGE</span>
  <div class="ttl sm">CEK <em>BUG</em></div>
  <div class="rows"><b class="r" data-at="s3:setiap" data-fx="lit"><i>MUNCUL</i>Setiap 3 pertandingan</b><b class="r" data-at="s3:menghancurkan" data-fx="lit"><i>MISI</i>Hancurkan mobil = poin tambahan</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <span class="tag">REKAMAN DIPUTAR ULANG</span>
  <div class="ttl sm">ADA YANG <em>ANEH</em></div>
  <div class="strip"><i data-at="s4:pertama" data-fx="lit">PUKULAN<br><b>1</b></i><i class="sl" data-at="s4:menyelipkan" data-fx="lit">MENYELIP<br><b>2</b></i><i data-at="s4:berikutnya" data-fx="lit">LALU<br><b>3</b></i></div>
  <div class="wnd" data-at="s4:kedua" data-fx="grow">JEDA SEMPIT DI ANTARA PUKULAN</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <span class="tag">MASALAHNYA</span>
  <div class="mlab">TIMING</div>
  <div class="meter"><i class="win" id="win5"></i><i class="cur" id="cur5"></i></div>
  <div class="mnote" data-at="s5:sulit" data-fx="lit">jendela hijau: <b>sangat sulit</b></div>
  <div class="rows"><b class="r" data-at="s5:mustahil" data-fx="lit"><i>TIM</i>Mustahil untuk pemain biasa</b>
  <b class="r" data-at="s5:dihapus" data-fx="lit"><i>DIHAPUS?</i><s>tidak</s></b><b class="r ok" data-at="s5:tersembunyi" data-fx="lit"><i>NASIB</i>Dibiarkan tersembunyi</b></div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <span class="tag">STREET FIGHTER II</span>
  <div class="rows"><b class="r" data-at="s6:mengira" data-fx="lit"><i>TIM MENGIRA</i>Paling banyak <span class="four">4<u data-at="s6:Ternyata" data-fx="grow"></u></span> pukulan</b></div>
  <div class="hit big"><b id="hc6">0</b><span>HIT<br>COMBO</span><b class="bug yel" data-at="s6:delapan" data-fx="stamp">SAMPAI 8!</b></div>
</div>
<div class="p" data-in="s7" data-out="s7:Gamenya">
  <span class="tag">GAME-GAME BERIKUTNYA</span>
  <div class="mlab">TIMING <span data-at="s7:longgar" data-fx="lit">LEBIH LONGGAR</span></div>
  <div class="meter"><i class="win" id="win7"></i><i class="cur" id="cur7"></i></div>
  <div class="row2"><b class="bug" data-at="s7:resmi" data-fx="stamp">FITUR RESMI</b><b class="r" data-at="s7:standar" data-fx="lit"><i>LALU</i>Standar game fighting</b></div>
</div>
<div class="p" data-in="s7:Gamenya" data-out="s8">
  <span class="tag">GAMENYA LARIS</span>
  <div class="ttl num"><b class="ct" data-from="0" data-to="200000" data-a="s7:dua" data-d="1.3" data-pre="&gt;"></b></div>
  <div class="rows"><b class="r" data-at="s7:mesin" data-fx="lit"><i>TERJUAL</i>mesin arcade</b><b class="r" data-at="s7:semua" data-fx="lit"><i>DARI</i>semua versinya, seluruh dunia</b></div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <span class="tag">JADI&hellip;</span>
  <div class="ttl sm">KESALAHAN BISA JADI<br><em>FITUR TERBAIK</em></div>
  <div class="q" data-at="s8:Combo" data-fx="pop">Combo terpanjangmu berapa pukulan?</div>
</div>`;

const css = `
.p{background:${WH};border:6px solid ${INK};border-radius:4px;padding:16px 26px 22px;box-shadow:12px 12px 0 ${INK}}
.tag{display:inline-block;font-family:'Rubik',sans-serif;font-weight:800;font-size:25px;letter-spacing:.08em;color:${WH};background:${RED};padding:5px 16px;transform:skewX(-10deg);margin-bottom:8px}
.ttl{font-family:'Bangers',sans-serif;font-size:104px;line-height:.92;letter-spacing:.02em;color:${INK}}
.ttl.sm{font-size:84px}.ttl em{font-style:normal;color:${RED}}
.ttl.num{font-size:150px;color:${RED};-webkit-text-stroke:4px ${INK};paint-order:stroke fill}
.hit{display:flex;align-items:center;gap:14px;margin-top:10px}
.hit b#hc1,.hit b#hc6{display:inline-block;font-family:'Bangers',sans-serif;font-size:118px;line-height:.9;color:${YEL};-webkit-text-stroke:5px ${INK};paint-order:stroke fill;transform-origin:50% 60%;min-width:80px;text-align:center}
.hit.big b#hc6{font-size:150px;min-width:120px}
.hit span{font-family:'Bangers',sans-serif;font-size:46px;line-height:.9;color:${INK}}
.bug{display:inline-block;margin-left:auto;font-family:'Bangers',sans-serif;font-size:72px;line-height:1;color:${WH};background:${RED};border:5px solid ${INK};padding:6px 20px 2px;box-shadow:6px 6px 0 ${INK}}
.bug.yel{background:${YEL};color:${INK};font-size:62px}
.two{display:flex;gap:22px;align-items:center}
.yr{font-family:'Bangers',sans-serif;font-size:150px;line-height:.9;color:${RED};-webkit-text-stroke:4px ${INK};paint-order:stroke fill}
.rows{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.r{display:block;font-family:'Rubik',sans-serif;font-weight:800;font-size:38px;line-height:1.1;color:${INK}}
.r i{display:inline-block;font-style:normal;font-size:20px;letter-spacing:.1em;color:${WH};background:${INK};padding:3px 10px;margin-right:12px;vertical-align:6px}
.r s{color:${RED};text-decoration-thickness:5px}.r.ok i{background:${TEAL}}
.four{position:relative;display:inline-block;font-family:'Bangers',sans-serif;font-size:64px;line-height:.8;color:${RED};padding:0 8px}
.four u{position:absolute;left:-4px;right:-4px;top:48%;height:7px;background:${INK};transform-origin:0 50%;transform:rotate(-12deg)}
.strip{display:flex;gap:10px;margin-top:12px;background:${INK};padding:14px 12px;background-image:repeating-linear-gradient(90deg,#fff 0 10px,transparent 10px 26px);background-size:100% 8px;background-repeat:repeat-x;background-position:0 3px}
.strip i{flex:1;font-style:normal;text-align:center;font-family:'Rubik',sans-serif;font-weight:800;font-size:22px;letter-spacing:.06em;color:${INK};background:#fff6d6;padding:10px 4px 6px;border:3px solid ${INK}}
.strip i b{display:block;font-family:'Bangers',sans-serif;font-size:62px;line-height:1;color:${RED}}
.strip i.sl{background:${YEL}}
.wnd{margin-top:10px;font-family:'Rubik',sans-serif;font-weight:800;font-size:26px;letter-spacing:.05em;color:${INK};background:#7ff0a0;border:4px solid ${INK};padding:6px 14px;transform-origin:0 50%}
.mlab{font-family:'Bangers',sans-serif;font-size:46px;color:${INK};letter-spacing:.04em}.mlab span{color:${TEAL}}
.meter{position:relative;height:54px;margin:6px 0 8px;background:repeating-linear-gradient(90deg,#ffd9d9 0 22px,#ffc2c2 22px 44px);border:5px solid ${INK}}
.meter .win{position:absolute;top:0;bottom:0;left:61%;width:3%;background:#3ddc84;border-left:4px solid ${INK};border-right:4px solid ${INK}}
.meter .cur{position:absolute;top:-14px;bottom:-14px;width:10px;margin-left:-5px;left:10%;background:${INK}}
.mnote{font-family:'Rubik',sans-serif;font-weight:700;font-size:30px;color:${INK}}.mnote b{color:#12a35a}
.row2{display:flex;gap:16px;align-items:center;margin-top:10px}.row2 .bug{margin-left:0;font-size:58px}.row2 .r{font-size:34px}
.q{display:inline-block;margin-top:14px;font-family:'Rubik',sans-serif;font-weight:800;font-size:38px;color:${INK};background:${YEL};border:5px solid ${INK};padding:8px 18px;box-shadow:6px 6px 0 ${INK}}
#chip{font-family:'Rubik',sans-serif;font-weight:800;font-size:20px;color:#fff;letter-spacing:.08em;text-shadow:0 2px 0 #111}
#flash{position:absolute;inset:0;background:#fff;mix-blend-mode:difference;opacity:0;z-index:6;pointer-events:none}
#vhs{position:absolute;inset:0;z-index:6;opacity:0;pointer-events:none}
#vhs .scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 2px,rgba(255,255,255,0) 2px 5px)}
#vhs .vl,#vhs .vr{position:absolute;top:1190px;font-family:'VT323',monospace;font-size:54px;color:#fff;text-shadow:3px 0 0 #ff2a6d,-3px 0 0 #2de2e6}
#vhs .vl{left:60px}#vhs .vr{right:120px}`;

copyFileSync("../../_tools/lib3d.js", "hf/assets/lib/lib3d.js");
copyFileSync("world3d.js", "hf/assets/lib/world3d.js");

const hud = `(t)=>{
 const cnt=(a,x)=>{let n=0;for(const h of a)if(x>=h)n++;return n;};
 const gb=AT['s1:bug'];
 let te=t;if(t>=gb&&t<K.s2){const fr=Math.floor((t-gb)*10);te=fr<6?K.h1[4]+0.04+(fr%3)*0.06:K.h1[4]+0.1;}
 const e1=q('#hc1');{const n=Math.max(1,cnt(K.h1,te));e1.textContent=n;const u=Math.min(1,Math.max(0,(te-K.h1[n-1])/0.18));e1.style.transform='scale('+(1.3-0.3*u)+') rotate('+(-6+6*u)+'deg)';}
 const e6=q('#hc6');{const n=cnt(K.h6,t);e6.textContent=n;const u=n?Math.min(1,Math.max(0,(t-K.h6[n-1])/0.18)):1;e6.style.transform='scale('+(1.3-0.3*u)+')';e6.style.color=n>4?'#e63946':'#ffc93c';}
 let f=0;for(const h of K.big)if(t>=h&&t<h+0.067)f=1;q('#flash').style.opacity=f;
 const tR=AT['s4:Adegannya'],tU=AT['s4:ulang']+0.4;
 const v=t>=tR&&t<K.s5-0.15?1:0;q('#vhs').style.opacity=v;
 if(v){q('#vmode').innerHTML=t<tU?'&#9664;&#9664; REWIND':'&#9654; PLAY x0.25';const s=t<tU?Math.max(0,(tU-t)*4):(t-tU)*0.25;const fr=Math.floor(s*30)%30,ss=Math.floor(s)%60;q('#vtc').textContent='00:'+String(ss).padStart(2,'0')+':'+String(fr).padStart(2,'0');}
 const c5=q('#cur5');c5.style.left=(50+44*Math.sin(t*3.4))+'%';
 const w7=q('#win7'),c7=q('#cur7');const lu=Math.min(1,Math.max(0,(t-AT['s7:longgar'])/0.8));const wd=3+27*(lu*lu*(3-2*lu));w7.style.width=wd+'%';w7.style.left=(61-wd/2+1.5)+'%';c7.style.left=(50+44*Math.sin(t*3.4))+'%';
 const gl=q('#gl');if(t>=gb&&t<gb+0.7){const fr=Math.floor(t*30);gl.style.transform='translateX('+(((fr*37)%9)-4)*4+'px)';gl.style.filter='hue-rotate('+((fr*53)%120)+'deg) saturate(1.5)';}else{gl.style.transform='';gl.style.filter='';}
}`;

const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: "#2a1650", vig: 0.3, grain: 0.035, capfloor: 0.3, html, css, chipFont: "'Rubik',sans-serif", chipColor: "#ffffff", sig: "EP03_STREET_FIGHTER_COMBO",
  K: { h1, h3, h4, h6, big },
  extraAt: ["s1:bug", "s1:awalnya", "s2:dikerjakan", "s2:orang", "s3:menghancurkan", "s3:pengembang", "s3:mengecek", "s3:Babak", "s4:aneh", "s4:Adegannya", "s4:direkam", "s4:ulang", "s4:Ternyata",
    "s5:dibiarkan", "s5:tersembunyi", "s5:dihapus", "s6:Ternyata", "s6:delapan", "s7:resmi", "s7:standar", "s7:Gamenya", "s7:dunia", "s7:longgar", "s8:fitur", "s8:AUDIRA"],
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{x:170,skewX:-14,opacity:0},{x:0,skewX:0,opacity:1,duration:.3,ease:'back.out(2.2)'},a-.06);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-220,skewX:14,opacity:0,duration:.2,ease:'power3.in'},b-.2)`,
  fxExtra: `lit:(e,t)=>{tl.fromTo(e,{opacity:.28},{opacity:1,duration:.18,ease:'power2.out'},t);tl.fromTo(e,{scale:1},{scale:1.05,duration:.09,yoyo:true,repeat:1,ease:'power2.out'},t);},`,
  hud,
  outroIn: `gsap.set('#outro',{clipPath:'polygon(0 0,0 0,0 100%,0 100%)'});tl.to('#outro',{clipPath:'polygon(0 0,130% 0,100% 100%,0 100%)',duration:.45,ease:'power4.out'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px;display:flex;justify-content:center;align-items:flex-end}
.capin{position:relative;max-width:880px;text-align:center;font-family:'Rubik',sans-serif;font-weight:800;font-size:56px;line-height:1.16;color:#fff;background:#111116;border:4px solid #fff;border-radius:6px;padding:10px 24px 14px;box-shadow:8px 8px 0 #e63946}
.w{display:inline-block;margin:0 .12em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#ffffff",y:0},{color:"${YEL}",y:-3,duration:.05,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#ffffff",y:0,duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:22,opacity:0},{y:0,opacity:1,duration:.16,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Street Fighter Combo", "#2a1650");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
