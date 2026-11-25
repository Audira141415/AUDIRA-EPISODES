// EP04 BATAS MESH. DRAFTFORGE: navy blueprint sheet, CAD wireframes, gold dimensions, crimson stamps.
// Panels are drawing sheets that a plotter draws top to bottom. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#061327", NAVY = "#091b36", CY = "#4fc3f7", WHT = "#f0f6ff", GOLD = "#ffca28", RED = "#ef5350", MUT = "#6b8bb2";

const html = `
<div class="frame"></div>
<div class="sec">SECTION A-A // BATAS MESH ROBLOX</div>
<div class="zone" id="zone">GRID ZONE [A-1]</div>
<div class="scale"><i></i><i class="o"></i><i></i><span>SKALA GRAFIS // STUD</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">RAHASIA MAP ROBLOX // EP 04</div>
  <div class="ttl">BATAS SEGITIGA<br><span>SATU MESH</span></div>
  <div class="cnt"><span class="k">SEGITIGA</span><b class="gt" data-at="s1:ditolak" data-fx="fade">&gt;</b><b class="ct" id="c1" data-from="0" data-to="20000" data-a="s1:Model" data-d="1.6"></b></div>
  <div class="stampx" data-at="s1:ditolak" data-fx="stamp">DITOLAK</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">01 // TOPOLOGI</div>
  <div class="h">Model 3D = segitiga kecil</div>
  <div class="meter"><i id="mf"></i><s></s></div>
  <div class="lim" data-at="s2:maksimal" data-fx="up">MAKS 20.000 SEGITIGA / MESH</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">02 // TEKSTUR</div>
  <div class="h">Maks 4096 &times; 4096 px</div>
  <div class="row" data-at="s3:lima" data-fx="left"><b>5 STUD</b><i>&rarr;</i><b class="y">256 px</b></div>
  <div class="row" data-at="s3:seribu" data-fx="left"><b>20 STUD</b><i>&rarr;</i><b class="y">1024 px</b></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">03 // JARAK DARI KAMERA</div>
  <div class="row rw" id="r0"><b>&lt; 250 STUD</b><b class="w">TERTINGGI</b></div>
  <div class="row rw" id="r1"><b>250&ndash;500 STUD</b><b class="c">SEDANG</b></div>
  <div class="row rw" id="r2"><b>&gt; 500 STUD</b><b class="m">TERENDAH</b></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">04 // BENTUK TABRAKAN</div>
  <div class="lg rw" id="l0"><u class="sol"></u>TERLIHAT</div>
  <div class="lg rw" id="l1"><u class="dsh"></u>vs DIHITUNG FISIKA</div>
  <div class="h y" data-at="s5:collision" data-fx="up">Collision fidelity</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">05 // COLLISION FIDELITY</div>
  <div class="opt" id="o0">BOX <em>kotak pembungkus</em></div>
  <div class="opt" id="o1">HULL <em>bungkus cembung</em></div>
  <div class="opt" id="o2">DEFAULT <em>bisa cekung</em></div>
  <div class="opt sm" id="o3">PRECISECONVEXDECOMPOSITION</div>
  <div class="opt" id="o4">TUNABLE <span class="sl"><span id="kn"></span></span></div>
  <div class="cost"><span>BEBAN HITUNG</span><div class="cb"><i id="cf"></i></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">06 // MENURUT DOKUMENTASI</div>
  <div class="h">Paling presisi pun <span class="r">tidak sama persis</span></div>
  <div class="lg" data-at="s7:menabrak" data-fx="left"><u class="red"></u>Karakter menabrak udara</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">07 // KESIMPULAN</div>
  <div class="h">Bukan paling detail,</div>
  <div class="h y" data-at="s8:tapi" data-fx="up">tapi paling pas</div>
  <div class="lg" data-at="s8:Kamu" data-fx="left"><u class="sol"></u>Pernah menabrak udara?</div>
</div>`;

const css = `
.frame{position:absolute;left:22px;top:22px;right:22px;bottom:22px;border:2px solid rgba(240,246,255,.7);z-index:6;pointer-events:none}
.sec{position:absolute;left:44px;top:44px;z-index:6;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:21px;letter-spacing:.12em;color:${WHT};opacity:.85}
.zone{position:absolute;right:44px;top:44px;z-index:6;font-family:'JetBrains Mono',monospace;font-weight:500;font-size:21px;letter-spacing:.08em;color:${MUT}}
.scale{position:absolute;left:44px;bottom:48px;z-index:6;display:flex;align-items:flex-end;gap:0;font-family:'JetBrains Mono',monospace;font-size:18px;color:${CY};letter-spacing:.08em}
.scale i{display:block;width:70px;height:8px;background:${WHT}}.scale i.o{background:#1d3d75}
.scale span{margin-left:18px}
.p{background:rgba(6,19,39,.9);border:2px solid ${WHT};outline:1px solid rgba(79,195,247,.55);outline-offset:-10px;padding:26px 32px 28px;right:110px}
.p:before,.p:after{content:'';position:absolute;width:26px;height:26px;border-color:${GOLD};border-style:solid}
.p:before{left:-9px;top:-9px;border-width:4px 0 0 4px}.p:after{right:-9px;bottom:-9px;border-width:0 4px 4px 0}
.tag{display:inline-block;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:23px;letter-spacing:.1em;color:${CY};border:2px solid ${CY};padding:7px 12px 6px;margin-bottom:18px}
.ttl{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:104px;line-height:.92;color:${WHT};letter-spacing:.01em;text-transform:uppercase}
.ttl span{color:${CY}}
.cnt{margin-top:18px;display:flex;align-items:baseline;gap:14px;font-family:'JetBrains Mono',monospace}
.cnt .k{font-size:26px;letter-spacing:.12em;color:${MUT}}
.cnt b{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:76px;color:${WHT};font-variant-numeric:tabular-nums}
.cnt b.gt{color:${RED}}
.stampx{position:absolute;right:26px;bottom:30px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:78px;line-height:1;letter-spacing:.06em;color:${RED};border:6px solid ${RED};padding:6px 18px 2px;background:rgba(239,83,80,.1);transform:rotate(-3deg)}
.h{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:74px;line-height:1;color:${WHT};margin-bottom:10px}
.h.y{color:${GOLD}}.h .r{color:${RED}}
.meter{position:relative;height:44px;border:2px solid ${WHT};margin-top:16px;background:repeating-linear-gradient(90deg,rgba(79,195,247,.12) 0 2px,transparent 2px 24px)}
.meter i{position:absolute;left:0;top:0;bottom:0;width:0;background:${CY}}
.meter s{position:absolute;left:80%;top:-14px;bottom:-14px;width:5px;background:${GOLD}}
.lim{margin-top:20px;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:33px;letter-spacing:.04em;color:${GOLD}}
.row{display:flex;align-items:center;gap:18px;margin-top:12px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:38px;color:${WHT}}
.row i{font-style:normal;color:${GOLD}}
.row b.y{color:${GOLD}}.row b.w{color:${WHT};border-left:4px solid ${WHT};padding-left:14px}.row b.c{color:${CY};border-left:4px solid ${CY};padding-left:14px}.row b.m{color:${MUT};border-left:4px solid ${MUT};padding-left:14px}
.lg{display:flex;align-items:center;gap:18px;margin:10px 0 6px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:34px;color:${WHT}}
.lg u{display:block;width:70px;height:0;border-top:6px solid ${CY}}
.lg u.dsh{border-top:6px dashed ${GOLD}}.lg u.red{border-top:6px dashed ${RED}}
.opt{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:36px;color:${MUT};margin:6px 0;display:flex;align-items:center;gap:16px;border-left:6px solid transparent;padding-left:12px}
.opt em{font-style:normal;font-weight:500;font-size:25px}
.opt.sm{font-size:29px}
.rw{opacity:.42;transition:none}.rw.on{opacity:1}
.opt.on{color:${GOLD};border-left-color:${GOLD}}
.sl{position:relative;display:inline-block;width:250px;height:6px;background:${MUT}}
.sl span{position:absolute;top:-11px;left:0;width:16px;height:28px;background:${GOLD}}
.cost{margin-top:16px;display:flex;align-items:center;gap:16px;font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.1em;color:${WHT}}
.cb{flex:1;height:22px;border:2px solid ${WHT}}.cb i{display:block;height:100%;width:0;background:${GOLD}}
#chip{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:21px;color:${CY};top:180px;letter-spacing:.06em}`;

// HUD: live counter colour, triangle meter, collision option highlight, cost bar, grid zone.
const hud = `(function(){
const c1=document.getElementById('c1'),mf=document.getElementById('mf'),cf=document.getElementById('cf'),kn=document.getElementById('kn'),zone=document.getElementById('zone');
const opts=[0,1,2,3,4].map(i=>document.getElementById('o'+i));
const SB=[["s2:Setiap",0],["s2:dari",1],["s2:kecil",3],["s2:Makin",7],["s2:halus",15],["s2:banyak",24],["s2:segitiganya",31]];
const OPT=["s6:Box","s6:Hull","s6:Default","s6:PreciseConvexDecomposition","s6:Tunable"],COST=[.14,.3,.5,1,.6];
const ZN=[["s1","A-1"],["s2","A-2"],["s3","B-3"],["s4","C-4"],["s5","D-5"],["s6","D-6"],["s7","D-7"],["s8","D-8"]];
const eo=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
return (t)=>{
 c1.style.color=t>=AT["s1:ditolak"]?'${RED}':'${WHT}';
 let d=0;SB.forEach(([a,v])=>{if(t>=AT[a])d=v;});const tri=20*(d+1)*(d+1);
 mf.style.width=(Math.min(1,tri/25000)*100).toFixed(2)+'%';mf.style.background=tri>20000?'${RED}':'${CY}';
 let k=-1;OPT.forEach((a,i)=>{if(t>=AT[a]-.1)k=i;});
 opts.forEach((e,i)=>e.classList.toggle('on',i===k));
 const sv=.5+.5*Math.sin((t-AT["s6:Tunable"])*2.4-1.57);
 kn.style.left=(k===4?sv*234:117)+'px';
 let v=0;if(k>=0){const prev=k?COST[k-1]:0,cur=k===4?.35+.55*(1-sv):COST[k];v=prev+(cur-prev)*eo((t-AT[OPT[k]])/.4);if(k===4)v=t-AT[OPT[4]]<.4?COST[3]+(cur-COST[3])*eo((t-AT[OPT[4]])/.4):cur;}
 cf.style.width=(v*100).toFixed(1)+'%';
 [['r0','s4:detailnya'],['r1','s4:sedang'],['r2','s4:terendah'],['l0','s5:lihat'],['l1','s5:dihitung']].forEach(([i,a])=>document.getElementById(i).classList.toggle('on',t>=AT[a]-.1));
 let z='A-1';ZN.forEach(([s,n])=>{if(t>=K[s])z=n;});zone.textContent='GRID ZONE ['+z+'] // STUD';
};})()`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.42, grain: 0.035, capfloor: 0.45, html, css, hud, chip: "ILUSTRASI, BUKAN CUPLIKAN ROBLOX", chipFont: "'JetBrains Mono',monospace", chipColor: CY, sig: "EP04_BATAS_MESH",
  extraAt: ["s1:Model", "s1:ditolak", "s2:Setiap", "s2:dari", "s2:kecil", "s2:Makin", "s2:halus", "s2:banyak", "s2:segitiganya", "s2:maksimal",
    "s3:Tapi", "s3:empat", "s3:objek#2", "s3:objek#3", "s3:dua", "s3:lima", "s3:seribu", "s3:stud#2",
    "s4:Di", "s4:dua", "s4:Dua", "s4:Lebih", "s4:detailnya", "s4:tertinggi", "s4:sampai", "s4:sedang", "s4:terendah",
    "s5:Bentuk", "s5:bentuk#2", "s5:lihat", "s5:dihitung", "s5:tabrakan", "s5:collision",
    "s6:Box", "s6:Hull", "s6:Default", "s6:PreciseConvexDecomposition", "s6:Tunable",
    "s7:tidak", "s7:Makanya", "s7:menabrak", "s7:udara", "s8:pas", "s8:tapi", "s8:Kamu", "s8:AUDIRA"],
  // Plotter pass: each sheet is drawn top to bottom, then wiped off to the right.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(0% 0% 100% 0%)',opacity:1},{clipPath:'inset(0% 0% 0% 0%)',duration:.36,ease:'power2.out'},a-.06)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 0% 100%)',duration:.2,ease:'power2.in'},b-.22)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.45,ease:'power2.inOut'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:84px;line-height:1.02;color:${WHT};text-shadow:3px 0 0 #061327,-3px 0 0 #061327,0 3px 0 #061327,0 -3px 0 #061327,3px 3px 0 #061327,-3px 3px 0 #061327,3px -3px 0 #061327,-3px -3px 0 #061327,0 0 16px rgba(79,195,247,.45)}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${WHT}",y:0},{color:"${GOLD}",y:-5,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${WHT}",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(-30% 110% -30% -10%)"},{clipPath:"inset(-30% -10% -30% -10%)",duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Batas Mesh Roblox", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
