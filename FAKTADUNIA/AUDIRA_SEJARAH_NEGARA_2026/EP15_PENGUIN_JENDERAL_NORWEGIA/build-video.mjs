// EP15 PENGUIN JENDERAL: BRICKCRAFT. A sunny tabletop of studded toy bricks: the Edinburgh zoo enclosure with a pool,
// a brick king penguin on a parade podium, a brick Norwegian guard platoon, and a 1961 Military Tattoo esplanade.
// Each promotion snaps an insignia brick onto the penguin; a rank badge counts the ranks. Stations change under a
// brick-snap wipe (bricks tile across the frame). Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#BA0C2F", NAVY = "#00205B", TB = "#0A57C2", YEL = "#FFC21A", WH = "#FFFDF7", GRN = "#3FA34D", ORG = "#F28C28", BG = "#EAD7BA";
const HEAD = `'Baloo 2',sans-serif`, BODY = `'Nunito Sans',sans-serif`;

// brick-snap wipe: 6 x 11 bricks tile the frame in a diagonal sweep
const PAL = [RED, NAVY, YEL, TB, WH, GRN, ORG];
const wipe = (a) => {
  let b = "";
  for (let r = 0; r < 11; r++) for (let c = 0; c < 6; c++) {
    const d = ((c / 5) * 0.4 + (r / 10) * 0.6).toFixed(3);
    b += `<i data-d="${d}" style="left:${c * 180}px;top:${r * 175}px;background-color:${PAL[(r * 3 + c * 2 + (r % 2)) % PAL.length]}"></i>`;
  }
  return `<div class="wipe" data-at="${a}" data-fx="wipe">${b}</div>`;
};
// people are name tags with a plain icon, no portraits
const ICON = {
  hat: `<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="8" fill="${NAVY}"/><rect x="20" y="22" width="24" height="18" rx="3" fill="#111"/><rect x="14" y="38" width="36" height="5" rx="2" fill="#111"/><ellipse cx="18" cy="22" rx="6" ry="11" fill="#2b2b2b"/><rect x="29" y="27" width="6" height="6" fill="${YEL}"/></svg>`,
  crown: `<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="8" fill="${RED}"/><path d="M15 44l3-22 9 10 5-14 5 14 9-10 3 22z" fill="${YEL}"/><rect x="15" y="45" width="34" height="6" fill="${YEL}"/></svg>`,
  peng: `<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="8" fill="${TB}"/><rect x="21" y="14" width="22" height="40" rx="4" fill="#1C2230"/><rect x="25" y="26" width="14" height="26" rx="3" fill="#fff"/><rect x="25" y="24" width="14" height="5" fill="${ORG}"/><rect x="31" y="18" width="12" height="3" fill="${ORG}"/></svg>`,
};
const tag = (ic, name, role, a) => `<div class="pl tag" data-at="${a}" data-fx="card">${ICON[ic]}<div><b>${name}</b><span>${role}</span></div></div>`;
const row = (b, s, a, cls = "") => `<div class="pl row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b><span>${s}</span></div>`;
const lad = (y, n, a, cls = "") => `<div class="pl lad ${cls}" data-at="${a}" data-fx="card"><b>${y}</b><span>${n}</span></div>`;

const html = `
${wipe("s3:Ceritanya")}${wipe("s3:pada")}${wipe("s4:Tahun")}${wipe("s6:Tahun")}${wipe("s8:Tradisi")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 15</div>
  <div class="pl h1" style="--c:${WH}">Penguin<br><em>mayor jenderal</em></div>
  <div class="chips"><i class="ch b" data-at="s1:Skotlandia" data-fx="card" data-d="inline-block">SKOTLANDIA</i><i class="ch r" data-at="s1:ksatria" data-fx="stampc">+ GELAR KSATRIA</i></div>
</div>
<div class="p" data-in="s2" data-out="s3:Ceritanya">
  <div class="kk b">KEBUN BINATANG EDINBURGH</div>
  ${tag("peng", "Sir Nils Olav", "penguin raja", "s2:Sir")}
  ${row("MASKOT + KOLONEL KEHORMATAN", "Garda Raja Norwegia", "s2:maskot", "rd")}
</div>
<div class="p" data-in="s3:Ceritanya" data-out="s3:dan">
  <div class="kk">EDINBURGH &middot; SKOTLANDIA</div>
  <div class="pl mega" data-at="s3:1961" data-fx="card" style="--c:${YEL}"><b>1961</b><small>awal<br>kisah</small></div>
  ${row("FESTIVAL MILITER", "Garda Raja Norwegia tampil di Edinburgh Military Tattoo", "s3:festival")}
</div>
<div class="p" data-in="s3:dan" data-out="s4:Tahun">
  <div class="kk b">SANG LETNAN</div>
  ${tag("hat", "Nils Egelien", "letnan, Garda Raja Norwegia", "s3:letnan")}
  ${row("TERTARIK PADA PENGUIN", "koloni penguin Kebun Binatang Edinburgh", "s3:tertarik", "yl")}
</div>
<div class="p" data-in="s4:Tahun" data-out="s4:Namanya">
  <div class="kk">KEMBALI KE EDINBURGH</div>
  <div class="pl mega" data-at="s4:1972" data-fx="card" style="--c:${YEL}"><b>1972</b><small>diadopsi<br>resimen</small></div>
  ${row("SEEKOR PENGUIN RAJA", "diadopsi Garda Raja Norwegia", "s4:mengadopsi", "rd")}
</div>
<div class="p" data-in="s4:Namanya" data-out="s5">
  <div class="kk b">ASAL NAMA</div>
  <div class="nm"><div class="pl nt" data-at="s4:Nils#2" data-fx="card" style="--c:${YEL}"><b>NILS</b><span>Nils Egelien<br>letnan</span></div><div class="plus" data-at="s4:Olav#2" data-fx="pop">+</div><div class="pl nt" data-at="s4:Olav#2" data-fx="card" style="--c:${YEL}"><b>OLAV</b><span>Olav Siggerud<br>komandan kontingen</span></div></div>
</div>
<div class="p" data-in="s5" data-out="s5:Saat">
  <div class="kk">SETIAP GARDA RAJA DATANG</div>
  <div class="pl h2" style="--c:${WH}">Pangkatnya naik</div>
  ${lad("1982", "KOPRAL", "s5:Kopral")}
  ${lad("1987", "SERSAN", "s5:sersan")}
  ${lad("1993", "SERSAN MAYOR RESIMEN", "s5:sersan#2")}
</div>
<div class="p" data-in="s5:Saat" data-out="s6:Tahun">
  <div class="kk">1987 &middot; GENERASI BERGANTI</div>
  <div class="gen"><div class="pl gt" data-at="s5:mati" data-fx="card" style="--c:${WH}"><b>I</b><span>mati 1987</span></div><div class="plus" data-at="s5:penggantinya" data-fx="pop">&rarr;</div><div class="pl gt" data-at="s5:penggantinya" data-fx="card" style="--c:${YEL}"><b>II</b><span>penerus</span></div></div>
  ${row("NAMA &amp; PANGKAT DIWARISKAN", "Nils Olav II meneruskan semuanya", "s5:meneruskan")}
</div>
<div class="p" data-in="s6:Tahun" data-out="s6:Tahun#2">
  <div class="kk b">NAIK KE PERWIRA</div>
  <div class="pl mega" data-at="s6:2005" data-fx="card" style="--c:${YEL}"><b>2005</b><small>kolonel<br>kehormatan</small></div>
</div>
<div class="p" data-in="s6:Tahun#2" data-out="s7">
  <div class="kk">15 AGUSTUS 2008</div>
  <div class="pl h2" style="--c:${WH}">Gelar <em>ksatria</em></div>
  ${tag("crown", "Raja Harald V", "Raja Norwegia, menyetujui gelar", "s6:Harald")}
  <div class="pl cnt" data-at="s6:130" data-fx="card" style="--c:${NAVY}"><b class="ct" data-from="0" data-to="130" data-a="s6:130" data-d="1.1">0</b><span>prajurit<br>berparade</span></div>
</div>
<div class="p" data-in="s7" data-out="s7:Guinness">
  <div class="kk b">NILS OLAV III</div>
  ${lad("2016", "BRIGADIR", "s7:brigadir")}
  ${lad("2023", "MAYOR JENDERAL", "s7:jenderal", "rd")}
</div>
<div class="p" data-in="s7:Guinness" data-out="s7:Pangkatnya">
  <div class="kk">GUINNESS WORLD RECORDS</div>
  <div class="pl h2" style="--c:${YEL}">Penguin berpangkat<br>tertinggi</div>
</div>
<div class="p" data-in="s7:Pangkatnya" data-out="s8:Tradisi">
  <div class="kk b">SEJAK 2005</div>
  ${row("MELAMPAUI SANG LETNAN", "pangkatnya di atas Nils Egelien, sampai Egelien wafat 2020", "s7:melampaui", "rd")}
</div>
<div class="p" data-in="s8:Tradisi" data-out="@END">
  <div class="kk">TRADISI SEJAK 1972</div>
  <div class="pl mega" data-at="s8:lima" data-fx="card" style="--c:${YEL}"><b>50+</b><small>tahun<br>dijaga</small></div>
  <div class="pl q" data-at="s8:Menurut" data-fx="card" style="--c:${TB}">Hewan apa yang pantas jadi maskot tentara Indonesia?</div>
</div>
<div id="rank"><div class="pl rk" style="--c:${NAVY}"><div class="ry">1972</div><div class="rt"><span class="rg">NILS OLAV I</span><b class="rn">VISEKORPORAL</b><div class="pp">${"<i></i>".repeat(8)}</div></div></div></div>`;

const css = `
.p{transform-origin:50% 0%}
.wipe{position:absolute;inset:0;z-index:14;pointer-events:none;overflow:hidden}
.wipe i{position:absolute;width:180px;height:175px;border-radius:6px;background-image:radial-gradient(circle at 28% 22%,rgba(255,255,255,.42) 0 22px,rgba(0,0,0,.12) 23px 27px,transparent 28px),radial-gradient(circle at 72% 22%,rgba(255,255,255,.42) 0 22px,rgba(0,0,0,.12) 23px 27px,transparent 28px);box-shadow:inset 0 -12px 0 rgba(0,0,0,.2),inset 0 5px 0 rgba(255,255,255,.3),inset -4px 0 0 rgba(0,0,0,.1)}
.pl{position:relative;--c:${WH};background:var(--c);border-radius:10px;box-shadow:inset 0 -8px 0 rgba(0,0,0,.16),inset 0 4px 0 rgba(255,255,255,.45),0 16px 30px rgba(80,45,10,.35)}
.pl::before{content:"";position:absolute;left:16px;right:16px;top:-12px;height:13px;background:radial-gradient(15px 13px at 50% 100%,var(--c) 96%,transparent 100%) 0 0/46px 13px repeat-x}
.kk{display:inline-block;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:30px;line-height:1.25;letter-spacing:.07em;color:#fff;background:${RED};padding:6px 20px 3px;border-radius:8px;margin-bottom:26px;box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),0 8px 18px rgba(80,40,0,.3)}
.kk.b{background:${NAVY}}
.h1{display:inline-block;padding:18px 30px 8px;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:112px;line-height:.92;color:${NAVY}}
.h1 em,.h2 em{font-style:normal;color:${RED}}
.h2{display:table;padding:14px 26px 6px;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:66px;line-height:1;color:${NAVY};margin-bottom:6px}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:26px;align-items:center}
.ch{font-style:normal;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:40px;line-height:1.2;padding:8px 22px 4px;border-radius:9px;color:#fff;box-shadow:inset 0 -6px 0 rgba(0,0,0,.2),0 10px 20px rgba(80,40,0,.3)}
.ch.b{background:${NAVY}}.ch.r{background:${RED};transform:rotate(-3deg)}
.row{flex-direction:column;gap:0;margin-top:30px;padding:14px 24px 16px;border-left:14px solid ${TB}}
.row b{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:44px;line-height:1.08;color:${TB}}
.row span{font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:32px;line-height:1.2;color:#27304a}
.row.rd{border-left-color:${RED}}.row.rd b{color:${RED}}.row.yl{border-left-color:${YEL}}.row.yl b{color:#B07800}
.tag{align-items:center;gap:22px;margin-top:30px;padding:14px 26px 14px 16px}
.tag svg{flex:none;width:96px;height:96px}
.tag b{display:block;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:50px;line-height:1.05;color:${NAVY}}
.tag span{display:block;font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:31px;line-height:1.2;color:#4a5068}
.mega{align-items:center;gap:22px;width:max-content;padding:4px 30px 0}
.mega b{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:178px;line-height:1.08;color:${NAVY}}
.mega small{font-family:'Nunito Sans',sans-serif;font-weight:800;font-size:38px;line-height:1.15;color:${NAVY}}
.lad{align-items:center;gap:22px;margin-top:28px;padding:10px 24px 10px 12px;width:max-content;max-width:880px}
.lad b{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:44px;line-height:1.1;color:#fff;background:${TB};padding:6px 16px 2px;border-radius:8px}
.lad span{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:50px;line-height:1.08;color:${NAVY}}
.lad.rd b{background:${RED}}
.nm,.gen{display:flex;align-items:center;gap:18px}
.nt,.gt{flex-direction:column;padding:14px 24px 14px;text-align:center}
.nt b,.gt b{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:96px;line-height:1;color:${NAVY}}
.nt span,.gt span{font-family:'Nunito Sans',sans-serif;font-weight:800;font-size:28px;line-height:1.2;color:${NAVY}}
.gt{min-width:200px}
.plus{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:90px;color:${RED};text-shadow:0 6px 12px rgba(80,40,0,.3)}
.cnt{align-items:center;gap:22px;width:max-content;margin-top:30px;padding:2px 30px 0}
.cnt b{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:150px;line-height:1.1;color:${YEL}}
.cnt span{font-family:'Nunito Sans',sans-serif;font-weight:800;font-size:38px;line-height:1.15;color:#fff}
.q{margin-top:30px;padding:18px 28px 16px;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:52px;line-height:1.08;color:#fff}
#rank{position:absolute;right:110px;top:1212px;z-index:11;transform-origin:100% 100%;opacity:0}
.rk{display:flex;align-items:stretch;gap:0;padding:0}
.ry{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:58px;line-height:1;color:${NAVY};background:${YEL};border-radius:10px 0 0 10px;padding:30px 20px 18px;display:flex;align-items:center;box-shadow:inset 0 -8px 0 rgba(0,0,0,.16)}
.rt{padding:8px 26px 12px 22px}
.rg{display:block;font-family:'Nunito Sans',sans-serif;font-weight:800;font-size:24px;letter-spacing:.1em;color:#9DB8FF}
.rn{display:block;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:52px;line-height:1.05;color:#fff;transform-origin:0% 60%}
.pp{display:flex;gap:9px;margin-top:6px}
.pp i{width:30px;height:13px;border-radius:4px;background:rgba(255,255,255,.18)}
.pp i.on{background:${YEL}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const RANKS = [["s4:kopral", "VISEKORPORAL", "1972"], ["s5:Kopral", "KOPRAL", "1982"], ["s5:sersan", "SERSAN", "1987"], ["s5:sersan#2", "SERSAN MAYOR", "1993"],
  ["s6:kolonel", "KOLONEL KEHORMATAN", "2005"], ["s6:ksatria", "KSATRIA (SIR)", "2008"], ["s7:brigadir", "BRIGADIR", "2016"], ["s7:jenderal", "MAYOR JENDERAL", "2023"]];
const { AT, K } = writeWorld(TL, at, { sig: "EP15_PENGUIN_JENDERAL_NORWEGIA",
  ep: "15", bg: BG, vig: 0.22, grain: 0.04, capfloor: 0.0, html, css, chipFont: BODY, chipColor: NAVY,
  chip: "DIORAMA BALOK MAINAN &middot; ILUSTRASI SEJARAH",
  extraAt: [...RANKS.map((r) => r[0]), "s1:jenderal", "s2:Olav", "s2:Edinburgh", "s2:Garda", "s3:Garda", "s3:Nils", "s3:Egelien", "s3:koloni", "s4:Siggerud",
    "s5:naik", "s5:penggantinya", "s5:meneruskan", "s6:2008", "s6:dengan", "s6:dianugerahi", "s7:ketiga", "s7:tradisinya", "s7:tertinggi", "s8:Menurut", "s3:militer", "s4:resimen"],
  fxExtra: `card:(e,t)=>{const d=e.dataset.d||(e.matches('.row,.tag,.mega,.lad,.cnt,.nt,.gt')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:-60,scale:1.06},{opacity:1,y:0,scale:1,duration:.34,ease:'back.out(2.2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.8,opacity:0},{scale:1,opacity:1,duration:.22,ease:'back.out(2)',immediateRender:false},t);},
 wipe:(e,t)=>{tl.set(e,{opacity:1},t-.6);e.querySelectorAll('i').forEach(b=>{const d=+b.dataset.d;gsap.set(b,{opacity:0});
  tl.fromTo(b,{y:-130,opacity:0,scale:1.1},{y:0,opacity:1,scale:1,duration:.16,ease:'back.out(2.4)',immediateRender:false},t-.5+d*.3);
  tl.to(b,{y:120,opacity:0,scale:.92,duration:.16,ease:'power2.in'},t+.06+d*.3);});tl.set(e,{opacity:0},t+.6);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:-70,scale:1.04},{opacity:1,y:0,scale:1,duration:.38,ease:'back.out(2)'},a-.05)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:50,duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(()=>{const R=${JSON.stringify(RANKS)}.map(r=>[AT[r[0]],r[1],r[2]]);const el=q('#rank'),nm=q('#rank .rn'),yr=q('#rank .ry'),gn=q('#rank .rg'),pp=[...document.querySelectorAll('#rank .pp i')];let cur=-1;
  return (t)=>{const t0=R[0][0]-.05,t1=AT['s8:Tradisi']-.3;if(t<t0||t>=t1){el.style.opacity=0;return;}
   let k=0;for(let i=0;i<R.length;i++)if(t>=R[i][0])k=i;
   if(k!==cur){cur=k;nm.textContent=R[k][1];yr.textContent=R[k][2];pp.forEach((p,i)=>p.className=i<=k?'on':'');}
   const a=Math.min(1,(t-t0)/.35),out=Math.min(1,Math.max(0,(t-(t1-.25))/.25));const h0=AT['s6:dianugerahi']-.6,h1=AT['s6:ksatria']-.05,hid=Math.min(Math.max(0,Math.min(1,(t-h0)/.2)),Math.max(0,Math.min(1,(h1-t)/.15)));el.style.opacity=Math.min(a,1-out,1-hid);
   el.style.transform='translateY('+((1-a)*80+out*40)+'px)';
   const u=Math.min(1,Math.max(0,(t-R[k][0])/.4));nm.style.transform='scale('+(1+.18*Math.sin(u*Math.PI)*(1-u))+')';
   gn.textContent='NILS OLAV '+(t<AT['s5:penggantinya']?'I':t<AT['s7:ketiga']?'II':'III')+' \\u00b7 PANGKAT '+(k+1)+'/8';};})()`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:60px;line-height:1.08;color:#fff;padding:20px 26px 12px;background:${TB};border-radius:12px;box-shadow:inset 0 -9px 0 rgba(0,0,0,.22),inset 0 4px 0 rgba(255,255,255,.3),0 14px 28px rgba(0,20,60,.4)}
.capin::before{content:"";position:absolute;left:18px;right:18px;top:-12px;height:13px;background:radial-gradient(15px 13px at 50% 100%,${TB} 96%,transparent 100%) 0 0/46px 13px repeat-x}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff"},{color:"${YEL}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:26},{opacity:1,y:0,duration:.22,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Penguin Jenderal Norwegia", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
