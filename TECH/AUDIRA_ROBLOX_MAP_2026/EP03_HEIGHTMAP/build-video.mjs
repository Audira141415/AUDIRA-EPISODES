// EP03 HEIGHTMAP. LIDARFORGE survey look: dark void, square point returns, laser fronts, mono HUD readouts. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#04070a", CY = "#00f0ff", AM = "#ffb703", INK = "#e6f6fb", LINE = "#1d4450";
const MONO = "JetBrains Mono,monospace", HEAD = "Sora,sans-serif";

const MATS = [["Aspal", "#3a3b3e"], ["Basal", "#2f2d33"], ["Bata", "#a2553f"], ["Batu Bulat", "#8a8577"], ["Beton", "#a7a7a2"], ["Lava Retak", "#e2572b", "s3:lava"], ["Gletser", "#9fd6e6"], ["Rumput", "#5d9c3c", "s3:rumput"], ["Tanah", "#7a5e3f"], ["Es", "#c4e4f2", "s3:es"], ["Rumput Daun", "#3f7f2a"], ["Batu Kapur", "#d6cfb6"], ["Lumpur", "#5b4636", "s3:lumpur"], ["Paving", "#8f9294"], ["Batu", "#6f6c68", "s3:batu"], ["Garam", "#ede8e2"], ["Pasir", "#d9c38c", "s3:pasir"], ["Batu Pasir", "#c48a5a"], ["Batu Sabak", "#4f5a5e"], ["Salju", "#f4f7fa", "s3:salju"], ["Air", "#2f7fc0", "s3:air"], ["Papan Kayu", "#9b6b3e"]];
const chips = MATS.map(([n, c, a], q) => `<div class="mc" data-at="s3:Dari" data-fx="fade"><i style="background:${c}"></i>${n.toUpperCase()}${a ? `<b class="lit" data-at="${a}" data-fx="lit"></b>` : ""}</div>`).join("");

const html = `
<div id="hud"><div class="hr1">AUDIRA SURVEY // EP 03</div><div class="hr2" id="mode">MODE: HEIGHTMAP</div><div class="hr3"><s></s>SCAN AKTIF</div></div>
<div id="legend"><div class="lt">ELEVASI</div><div class="lb"><i></i><div class="ln"><span>TINGGI</span><span>RENDAH</span></div></div></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">RAHASIA MAP ROBLOX // EP 03</div>
  <div class="h">1 gambar hitam-putih</div>
  <div class="big">JADI <span>PULAU</span></div>
  <div class="num" data-at="s1:empat" data-fx="stamp">&asymp; 4,6 KM</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag">TERRAIN = VOXEL</div>
  <div class="h" data-at="s2:Terrain">Tersusun dari kotak kecil</div>
  <div class="num" data-at="s2:Setiap" data-fx="stamp">4 &times; 4 &times; 4 STUD</div>
  <div class="row" data-at="s2:material">1 voxel = 1 material</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">KLASIFIKASI MATERIAL</div>
  <div class="hrow"><b class="n22" data-at="s3:dua" data-fx="stamp">22</b><span class="h sm" data-at="s3:udara">material, di luar udara</span></div>
  <div class="grid">${chips}</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">CARA LEBIH CEPAT</div>
  <div class="big sm" data-at="s4:heightmap">HEIGHTMAP</div>
  <div class="h" data-at="s4:Heightmap">Gambar dilihat dari atas</div>
  <div class="row w" data-at="s4:terang" data-fx="left"><i class="sw wh"></i>TERANG = TINGGI</div>
  <div class="row k" data-at="s4:gelap" data-fx="left"><i class="sw bk"></i>GELAP = RENDAH</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">GAMBAR KEDUA</div>
  <div class="big sm" data-at="s5:colormap">COLORMAP</div>
  <div class="row w" data-at="s5:bentuk" data-fx="left">HEIGHTMAP &rarr; BENTUK</div>
  <div class="row" data-at="s5:material" data-fx="left">COLORMAP &rarr; MATERIAL</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag">DOKUMENTASI ROBLOX</div>
  <div class="num" data-at="s6:piksel" data-fx="stamp">1 PIKSEL = 4 STUD</div>
  <div class="h" data-at="s6:Ukuran">Ukuran maksimal</div>
  <div class="num" data-at="s6:empat#2" data-fx="stamp">4096 &times; 4096</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">HITUNGAN KAMI</div>
  <div class="eq" data-at="s7:empat">4096 piksel</div>
  <div class="eq" data-at="s7:dikali">&times; 4 stud</div>
  <div class="eq res" data-at="s7:belas">= <b class="ct" data-from="0" data-to="16384" data-a="s7:belas" data-d="1.4">0</b> stud / sisi</div>
  <div class="eq dim" data-at="s7:Dengan">1 stud = 28 cm</div>
  <div class="num" data-at="s7:koma" data-fx="stamp">&asymp; 4,6 KM</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">AUDIRA SURVEY</div>
  <div class="h" data-at="s8:coba">Gambar dulu petanya</div>
  <div class="big sm" data-at="s8:Kamu">PULAU SEPERTI <span>APA?</span></div>
</div>`;

const css = `
.p{right:96px}
.tag{display:inline-block;font-family:${MONO};font-weight:700;font-size:25px;letter-spacing:.2em;color:${CY};padding:8px 14px 8px 16px;border-left:5px solid ${CY};background:rgba(4,7,10,.78);margin-bottom:14px}
.h{display:block;width:fit-content;font-family:${HEAD};font-weight:600;font-size:46px;line-height:1.12;color:${INK};background:rgba(4,7,10,.72);padding:10px 18px 12px;margin-bottom:12px;border:1px solid ${LINE}}
.h.sm{font-size:36px;display:inline-block;margin:0}
.big{display:block;width:fit-content;font-family:${HEAD};font-weight:800;font-size:104px;line-height:1;letter-spacing:-.01em;color:#fff;background:rgba(4,7,10,.72);padding:12px 22px 16px;margin-bottom:12px;border:1px solid ${LINE}}.big span{color:${CY}}.big.sm{font-size:78px}
.num{display:block;width:fit-content;font-family:${MONO};font-weight:800;font-size:66px;line-height:1;color:#04070a;background:${AM};padding:14px 22px;margin-bottom:12px;box-shadow:0 0 34px rgba(255,183,3,.45)}
.row{display:flex;align-items:center;gap:16px;width:fit-content;font-family:${MONO};font-weight:700;font-size:40px;color:${CY};background:rgba(4,7,10,.8);padding:12px 18px;margin-bottom:10px;border:1px solid ${LINE}}
.row.w{color:#fff}.row.k{color:#7aa7ff}.sw{display:inline-block;width:34px;height:34px;border:2px solid ${CY}}.sw.wh{background:#fff}.sw.bk{background:#000}
.hrow{display:flex;align-items:center;gap:18px;margin-bottom:12px}
.n22{font-family:${MONO};font-weight:800;font-size:70px;line-height:1;color:#04070a;background:${AM};padding:6px 18px;box-shadow:0 0 30px rgba(255,183,3,.45)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px 6px;width:900px;background:rgba(4,7,10,.82);border:1px solid ${LINE};padding:12px}
.mc{position:relative;display:flex;align-items:center;gap:10px;font-family:${MONO};font-weight:700;font-size:20px;letter-spacing:.02em;color:#cfe3ea;padding:3px 8px;height:26px}
.mc i{display:inline-block;width:20px;height:20px;flex:none;border:1px solid rgba(255,255,255,.35)}
.lit{position:absolute;inset:0;border:2px solid ${CY};background:rgba(0,240,255,.16);box-shadow:0 0 18px rgba(0,240,255,.6)}
.eq{display:block;width:fit-content;font-family:${MONO};font-weight:700;font-size:46px;color:#fff;background:rgba(4,7,10,.8);border-left:5px solid ${CY};padding:8px 18px;margin-bottom:8px}
.eq.res{color:${CY}}.eq.res b{font-weight:800}.eq.dim{font-size:40px;color:#9fb6bf}
#hud{position:absolute;right:56px;top:178px;z-index:11;text-align:right;font-family:${MONO};font-weight:700;font-size:20px;letter-spacing:.14em;color:${CY}}
#hud .hr2{color:${AM};margin-top:6px}#hud .hr3{color:rgba(230,246,251,.6);margin-top:6px}#hud s{display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff4d4d;margin-right:10px;text-decoration:none}
#legend{position:absolute;right:40px;top:820px;z-index:11;font-family:${MONO};font-weight:700;font-size:17px;letter-spacing:.12em;color:rgba(230,246,251,.7);background:rgba(4,7,10,.7);border:1px solid ${LINE};padding:12px 14px}
#legend .lb{display:flex;gap:10px;margin-top:8px}#legend i{display:block;width:14px;height:200px;background:linear-gradient(to top,#1e3a8a,#0e7490,#059669,#10b981,#f59e0b,#ef4444)}
#legend .ln{display:flex;flex-direction:column;justify-content:space-between}
#chip{font-family:${MONO};font-weight:700;font-size:19px;letter-spacing:.08em;color:rgba(230,246,251,.75);top:182px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const MODES = [["s1", "HEIGHTMAP"], ["s2", "VOXEL"], ["s3", "MATERIAL"], ["s4", "SCAN"], ["s5", "COLORMAP"], ["s6", "PIKSEL"], ["s7", "SKALA"], ["s8", "PUNCAK"]];
const { AT, K } = writeWorld(TL, at, {
  ep: "03", bg: BG, vig: 0.5, grain: 0.04, capfloor: 0.55, html, css, chipFont: MONO, chipColor: INK, sig: "EP03_HEIGHTMAP",
  extraAt: ["s2:Gunung", "s2:lembah", "s2:danau", "s2:voxel", "s2:empat", "s2:empat#2", "s2:empat#3", "s3:rumput", "s3:pasir", "s3:salju", "s3:es", "s3:batu", "s3:lumpur", "s3:lava", "s3:air", "s3:dicat", "s3:Dari",
    "s4:Area", "s4:heightmap", "s4:Heightmap", "s4:terang", "s4:gelap", "s5:colormap", "s5:menentukan", "s5:menentukan#2", "s6:piksel", "s6:stud", "s6:Ukuran", "s6:empat#2", "s7:belas", "s7:koma", "s8:Kamu"],
  // Panels are scanned in top to bottom like a laser pass, and scanned out upward.
  panelIn: `(tl,p,a)=>{tl.set(p,{opacity:1},a-.06);tl.fromTo(p,{clipPath:'inset(0% 0% 100% 0%)',filter:'brightness(2.2)'},{clipPath:'inset(0% 0% 0% 0%)',filter:'brightness(1)',duration:.42,ease:'power2.out'},a-.06);}`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(0% 0% 100% 0%)',opacity:.4,duration:.18,ease:'power2.in'},b-.18)`,
  fxExtra: `lit:(e,t)=>{tl.fromTo(e,{opacity:0},{opacity:1,duration:.12},t);tl.to(e,{opacity:.35,duration:.6},t+.7);},
 stamp:(e,t)=>tl.fromTo(e,{scaleX:0,opacity:1,transformOrigin:'0% 50%'},{scaleX:1,opacity:1,duration:.32,ease:'power3.out'},t),
 fade:(e,t)=>tl.fromTo(e,{opacity:0},{opacity:1,duration:.25,ease:'none',stagger:0},t+[...e.parentNode.children].indexOf(e)*.035),`,
  hud: `(t)=>{const M=${JSON.stringify(MODES)};let m=M[0][1];for(const [s,n] of M)if(t>=K[s]-.1)m=n;const e=q('#mode');if(e.textContent!=='MODE: '+m)e.textContent='MODE: '+m;
q('#legend').style.opacity=((t>1.4&&t<K.s3-.2)||(t>K.s4&&t<K.s5-.2))?1:0;q('#hud').style.opacity=t>=OUT?0:1;q('#hud s').style.opacity=Math.floor(t*2)%2?1:.25;}`,
  // A scan bar wipes the outro card down from the top.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 0% 100% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.55,ease:'power2.inOut'},OUT-.2);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Sora,sans-serif;font-weight:700;font-size:58px;line-height:1.16;color:#e6f6fb;text-shadow:0 0 2px #04070a,3px 3px 0 #04070a,-3px 3px 0 #04070a,3px -3px 0 #04070a,-3px -3px 0 #04070a,0 6px 14px rgba(0,0,0,.8)}
.w{display:inline-block;margin:0 .1em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#e6f6fb",textShadow:"0 0 2px #04070a,3px 3px 0 #04070a,-3px 3px 0 #04070a,3px -3px 0 #04070a,-3px -3px 0 #04070a"},{color:"${CY}",textShadow:"0 0 18px rgba(0,240,255,.8),3px 3px 0 #04070a,-3px 3px 0 #04070a,3px -3px 0 #04070a,-3px -3px 0 #04070a",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#e6f6fb",textShadow:"0 0 2px #04070a,3px 3px 0 #04070a,-3px 3px 0 #04070a,3px -3px 0 #04070a,-3px -3px 0 #04070a",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(0% 0% 100% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.16,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Heightmap Jadi Pulau", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
