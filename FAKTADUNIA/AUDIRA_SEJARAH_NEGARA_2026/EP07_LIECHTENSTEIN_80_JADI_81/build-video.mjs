// EP07 LIECHTENSTEIN, 80 JADI 81. HD2D: pixel sprites in a tilt-shift Alpine diorama (world3d.js + terrain.js).
// Pixel cards in Liechtenstein blue/red/gold, Silkscreen + Rubik; stations change under a pixel-dissolve wipe. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BLUE = "#002B7F", RED = "#CE1126", GOLD = "#FFD83D", SNOW = "#EEF3F8", FOG = "#1B2440", INK = "#0C132A";

// ---------- maps from Natural Earth (geo.py), modern borders
const GEO = JSON.parse(readFileSync("alps-geo.js", "utf8").replace(/^export const GEO = /, "").replace(/;\s*$/, ""));
const FILL = { Switzerland: "#C9D4E3", Austria: "#8FA3C8", Italy: "#4E7A5E", Germany: "#2A3766", Liechtenstein: GOLD };
function mapSvg({ l0, l1, b0, b1, w, extra }) {
  const kx = Math.cos((((b0 + b1) / 2) * Math.PI) / 180), sc = w / ((l1 - l0) * kx), h = Math.round((b1 - b0) * sc);
  const P = ([lo, la]) => [+((lo - l0) * kx * sc).toFixed(1), +((b1 - la) * sc).toFixed(1)];
  const shapes = GEO.map((c) => `<path d="${c.rings.map((r) => "M" + r.map((p) => P(p).join(",")).join("L") + "Z").join("")}" fill="${FILL[c.name] || "#22305A"}" stroke="${INK}" stroke-width="${c.name === "Liechtenstein" ? 2 : 3}" stroke-linejoin="round"/>`);
  const li = shapes.splice(GEO.findIndex((c) => c.name === "Liechtenstein"), 1);
  return `<svg class="map" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges"><rect width="${w}" height="${h}" fill="#101A3A"/>${shapes.join("")}${li.join("")}${extra(P)}</svg>`;
}
const lab = (x, y, t, s = 26, col = INK, bg = SNOW, extra = "") => {
  const w = Math.round(t.length * s * 0.86 + 18);
  return `<g ${extra}><rect x="${x - w / 2}" y="${y - s * 0.78}" width="${w}" height="${s * 1.42}" fill="${bg}"/><text x="${x}" y="${y + s * 0.42}" text-anchor="middle" font-family="Silkscreen" font-size="${s}" fill="${col}">${t}</text></g>`;
};
const map1 = mapSvg({ l0: 6.6, l1: 16.4, b0: 45.95, b1: 48.65, w: 850, extra: (P) => {
  const [x, y] = P([9.55, 47.15]);
  return `${lab(...P([8.15, 46.72]), "SWISS", 30, INK, SNOW)}${lab(...P([13.6, 47.4]), "AUSTRIA", 30, SNOW, BLUE)}
${lab(...P([9.6, 48.45]), "JERMAN", 20, "#8FA3C8", "#101A3A")}${lab(...P([12.3, 46.15]), "ITALIA", 22, SNOW, "#3B6248")}
<g data-at="s2:Liechtenstein" data-fx="pfade"><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${RED}" stroke-width="6"/><rect x="${x - 3}" y="${y - 92}" width="6" height="66" fill="${GOLD}"/>${lab(x + 70, y - 100, "LIECHTENSTEIN", 28, INK, GOLD)}</g>`;
} });
const map2 = mapSvg({ l0: 8.4, l1: 12.6, b0: 46.3, b1: 47.35, w: 850, extra: (P) => {
  const [vx, vy] = P([9.52, 47.14]), [sx, sy] = P([10.45, 46.53]), [ax, ay] = P([9.85, 46.33]);
  const star = (cx, cy, r) => { let d = ""; for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; d += (k ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1); } return `<path d="${d}Z" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>`; };
  return `<line x1="${vx}" y1="${vy}" x2="${sx}" y2="${sy}" stroke="${SNOW}" stroke-width="6" stroke-dasharray="14 10"/>
<rect x="${vx - 9}" y="${vy - 9}" width="18" height="18" fill="${RED}" stroke="${INK}" stroke-width="3"/>${lab(vx - 95, vy - 8, "VADUZ", 26)}
${star(sx, sy, 24)}${lab(sx + 175, sy - 26, "STILFSER JOCH", 26, INK, GOLD)}
<g data-at="s4:Italia" data-fx="pfade"><path d="M${ax - 60},${ay + 40} L${sx - 46},${sy + 18}" stroke="${RED}" stroke-width="14" stroke-dasharray="20 10"/><path d="M${sx - 30},${sy + 10} l-34,-6 l14,30 Z" fill="${RED}"/>${lab(ax - 20, ay - 2, "ITALIA", 24, SNOW, RED)}</g>
${lab(...P([11.9, 47.2]), "AUSTRIA", 24, INK, SNOW)}${lab(...P([8.95, 46.75]), "SWISS", 22, INK, SNOW)}`;
} });

const html = `
<canvas id="pxw" width="1080" height="1920"></canvas>
<div id="tagJ" class="tag"><div class="in"><b>PANGERAN JOHANN II</b><span>penguasa Liechtenstein</span></div></div>
<div id="tagR" class="tag"><div class="in"><b>PETER RHEINBERGER</b><span>komandan pasukan</span></div></div>
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><em>EP 07</em>FAKTA SEJARAH NEGARA</div>
    <div class="duo80">
      <div class="cnt" data-at="s1:Delapan" data-fx="pix"><b class="nb">80</b><span>BERANGKAT</span></div>
      <div class="cnt q" data-at="s1:delapan" data-fx="pix"><b class="nb">81</b><span>PULANG?</span></div>
    </div>
    <div class="stamp" data-at="s1:konon" data-fx="pstamp">KONON &middot; LEGENDA</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Tahun">
  <div class="card">
    <div class="k"><em>ALPEN</em>EROPA TENGAH</div>
    <div class="mapw">${map1}</div>
    <div class="sub" data-at="s2:kecil" data-fx="pix">negara kecil di antara Swiss dan Austria</div>
    <div class="note">peta batas negara modern</div>
  </div>
</div>
<div class="p" data-in="s2:Tahun" data-out="s3">
  <div class="card">
    <div class="k"><em>1866</em>EROPA BERPERANG</div>
    <div class="huge nb" data-at="s2:1866" data-fx="pix">1866</div>
    <div class="vs" data-at="s2:pecah" data-fx="pix" data-d="flex"><i>AUSTRIA</i><span class="x">VS</span><i class="r">PRUSIA</i></div>
    <div class="sub" data-at="s2:Austria-Prusia" data-fx="pix">Perang Austria-Prusia</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Parlemennya">
  <div class="card">
    <div class="k"><em>1866</em>KEPUTUSAN DI VADUZ</div>
    <div class="h">PASUKAN<br>DISERAHKAN</div>
    <div class="sub" data-at="s3:Konfederasi" data-fx="pix">ke Konfederasi Jerman, dengan syarat:</div>
    <div class="row" data-at="s3:hanya" data-fx="pix" data-d="flex"><b>1</b><span>hanya untuk menjaga Tirol</span></div>
    <div class="row" data-at="s3:melawan" data-fx="pix" data-d="flex"><b>2</b><span>tidak melawan sesama orang Jerman</span></div>
  </div>
</div>
<div class="p" data-in="s3:Parlemennya" data-out="s4">
  <div class="card">
    <div class="k"><em>LANDTAG</em>PARLEMEN LIECHTENSTEIN</div>
    <div class="h">TIDAK DIAJAK<br>BICARA</div>
    <div class="stamp r" data-at="s3:populer" data-fx="pstamp">PERANG TIDAK POPULER</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Mereka">
  <div class="card">
    <div class="k"><em>1866</em>PASUKAN LIECHTENSTEIN</div>
    <div class="row" data-d="flex"><b class="nb">80</b><span>tentara berangkat ke selatan</span></div>
  </div>
</div>
<div class="p" data-in="s4:Mereka" data-out="s4:Dua">
  <div class="card">
    <div class="k"><em>POS JAGA</em>CELAH GUNUNG</div>
    <div class="mapw">${map2}</div>
    <div class="sub" data-at="s4:mengawasi" data-fx="pix">mengawasi kemungkinan serangan pasukan Italia di bawah Garibaldi</div>
  </div>
</div>
<div class="p" data-in="s4:Dua" data-out="s5">
  <div class="card">
    <div class="k"><em>VADUZ</em>YANG TINGGAL DI RUMAH</div>
    <div class="row" data-at="s4:Dua" data-fx="pix" data-d="flex"><b class="nb">2</b><span>orang menjaga Kastil Vaduz</span></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:dan">
  <div class="card">
    <div class="k"><em>HASIL</em>DI CELAH GUNUNG</div>
    <div class="h">TAK ADA<br>PERTEMPURAN BESAR</div>
    <div class="row" data-at="s5:22" data-fx="pix" data-d="flex"><b class="nb">22 JULI</b><span>1866, perang berakhir</span></div>
  </div>
</div>
<div class="p" data-in="s5:dan" data-out="s6">
  <div class="card">
    <div class="k"><em>PULANG</em>KE VADUZ</div>
    <div class="h g">DISAMBUT<br>UPACARA</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Siapa">
  <div class="card">
    <div class="k"><em>KONON</em>LEGENDA POPULER</div>
    <div class="duo80">
      <div class="cnt" data-at="s6:Delapan" data-fx="pix"><b class="nb">80</b><span>BERANGKAT</span></div>
      <div class="cnt q" data-at="s6:delapan" data-fx="pix"><b class="nb" id="c81">80</b><span>PULANG</span></div>
    </div>
  </div>
</div>
<div class="p" data-in="s6:Siapa" data-out="s7">
  <div class="card">
    <div class="k"><em>KONON</em>ORANG TAMBAHAN</div>
    <div class="h">SIAPA ORANG<br>KE-81?</div>
    <div class="cand">
      <div data-at="s6:perwira" data-fx="pix"><b>PERWIRA<br>PENGHUBUNG<br>AUSTRIA?</b><span>versi pertama</span></div>
      <div data-at="s6:petani" data-fx="pix"><b>PETANI<br>ITALIA?</b><span>versi kedua</span></div>
    </div>
    <div class="stamp" data-at="s6:legenda" data-fx="pstamp">LEGENDA POPULER</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Sampai">
  <div class="card">
    <div class="k"><em>12 FEB 1868</em>KEPUTUSAN BESAR</div>
    <div class="row" data-d="flex"><b class="nb"><span class="ct" data-from="80" data-to="0" data-a="s7:membubarkan" data-d="2.2">80</span></b><span>tentara dibubarkan</span></div>
    <div class="stamp" data-at="s7:netral" data-fx="pstamp">NETRAL PERMANEN</div>
  </div>
</div>
<div class="p" data-in="s7:Sampai" data-out="s8">
  <div class="card">
    <div class="k"><em>SAMPAI</em>HARI INI</div>
    <div class="zero" data-at="s7:tidak" data-fx="pix" data-d="flex"><b class="nb">0</b><span>TENTARA<br>TETAP</span></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><em>EP 07</em>RINGKASNYA</div>
    <div class="chip" data-at="s8:pertempuran" data-fx="pix">PERANG TANPA PERTEMPURAN</div>
    <div class="chip" data-at="s8:bertambah" data-fx="pix">TENTARA KONON BERTAMBAH</div>
    <div class="chip" data-at="s8:dibubarkan" data-fx="pix">LALU DIBUBARKAN</div>
    <div class="sub" data-at="s8:Menurut" data-fx="pix">Negara tanpa tentara itu&hellip;</div>
    <div class="vs" data-at="s8:berani" data-fx="pix" data-d="flex"><i>BERANI?</i><span class="x">/</span><i class="r" data-at="s8:naif" data-fx="pix">NAIF?</i></div>
  </div>
</div>`;

const css = `
#pxw{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:12;pointer-events:none}
.card{position:relative;background:rgba(12,19,42,.94);border:6px solid ${SNOW};box-shadow:0 0 0 6px ${BLUE},14px 14px 0 6px rgba(4,7,18,.5);padding:20px 26px 24px}
.k{display:flex;align-items:center;gap:16px;font-family:Silkscreen,monospace;font-size:26px;color:${GOLD};letter-spacing:.03em;margin-bottom:14px}
.k em{font-style:normal;display:inline-block;padding:5px 12px 7px;background:linear-gradient(${BLUE} 50%,${RED} 50%);color:#fff}
.h{font-family:Silkscreen,monospace;font-size:60px;line-height:1.04;color:${SNOW}}.h.g{color:${GOLD};font-size:72px}
.sub{font-family:Rubik,sans-serif;font-weight:600;font-size:32px;line-height:1.25;color:#C9D4E3;margin-top:12px}
.note{font-family:Rubik,sans-serif;font-weight:500;font-size:22px;color:#8FA3C8;margin-top:6px}
.row{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 18px;background:${FOG};border-left:10px solid ${GOLD}}
.row b{font-family:Silkscreen,monospace;font-size:58px;color:${GOLD};flex:none;line-height:1;font-weight:400}
.row span{font-family:Rubik,sans-serif;font-weight:700;font-size:33px;color:${SNOW};line-height:1.2}
.duo80{display:flex;gap:18px}
.cnt{flex:1;background:${FOG};padding:12px 20px 16px;border:4px solid #2A3766}
.cnt b{display:block;font-family:Silkscreen,monospace;font-weight:400;font-size:176px;line-height:.95;color:${GOLD};text-shadow:9px 9px 0 ${RED}}
.cnt span{font-family:Silkscreen,monospace;font-size:34px;color:${SNOW}}
.cnt.q b{color:${SNOW};text-shadow:9px 9px 0 ${BLUE}}
#c81.on{color:${GOLD};text-shadow:9px 9px 0 ${RED}}
.stamp{display:inline-block;margin-top:18px;font-family:Silkscreen,monospace;font-size:46px;color:${GOLD};border:6px solid ${GOLD};padding:6px 18px 8px;background:rgba(206,17,38,.3);transform:rotate(-4deg)}
.stamp.r{color:#FF6A78;border-color:${RED}}
.huge{font-family:Silkscreen,monospace;font-size:190px;line-height:.95;color:${GOLD};text-shadow:10px 10px 0 ${RED}}
.vs{display:flex;align-items:stretch;gap:14px;margin-top:16px}
.vs i{flex:1;display:block;font-style:normal;font-family:Silkscreen,monospace;font-size:42px;text-align:center;padding:14px 8px;color:#fff;background:${BLUE}}
.vs i.r{background:${RED}}
.vs .x{flex:none;align-self:center;font-family:Silkscreen,monospace;font-size:46px;color:${GOLD}}
.mapw{border:4px solid #2A3766;line-height:0}.map{display:block;width:100%;height:auto}
.cand{display:flex;gap:14px;margin-top:16px}
.cand div{flex:1;background:${FOG};border:4px solid #2A3766;padding:14px 16px}
.cand b{display:block;font-family:Silkscreen,monospace;font-weight:400;font-size:36px;line-height:1.12;color:${GOLD}}
.cand span{display:block;margin-top:8px;font-family:Rubik,sans-serif;font-weight:600;font-size:26px;color:#C9D4E3}
.zero{display:flex;align-items:center;gap:30px}
.zero b{font-family:Silkscreen,monospace;font-weight:400;font-size:220px;line-height:.9;color:${GOLD};text-shadow:10px 10px 0 ${RED}}
.zero span{font-family:Silkscreen,monospace;font-size:64px;line-height:1.05;color:${SNOW}}
.chip{margin-top:12px;font-family:Silkscreen,monospace;font-size:38px;color:${SNOW};padding:10px 16px;background:${FOG};border-left:10px solid ${RED}}
.tag{position:absolute;left:0;top:0;z-index:10;opacity:0;pointer-events:none}
.tag .in{position:absolute;left:0;bottom:16px;transform:translateX(-50%);white-space:nowrap;background:${INK};border:5px solid ${GOLD};padding:8px 16px 10px;text-align:center}
.tag .in:after{content:"";position:absolute;left:50%;bottom:-17px;margin-left:-10px;border-left:10px solid transparent;border-right:10px solid transparent;border-top:12px solid ${GOLD}}
.tag b{display:block;font-family:Silkscreen,monospace;font-weight:400;font-size:30px;color:${GOLD}}
.tag span{display:block;font-family:Rubik,sans-serif;font-weight:600;font-size:24px;color:${SNOW};margin-top:2px}
`;

for (const f of ["world3d.js", "terrain.js"]) copyFileSync(f, "PROJECT/HyperFrames_Remotion/assets/lib/" + f);
copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
const WORLD_AT = ["s1:konon", "s4:Mereka", "s4:Dua", "s4:Peter", "s4:Italia", "s4:Garibaldi", "s5:dan", "s5:berakhir", "s5:disambut", "s6:satu", "s6:Siapa", "s6:perwira", "s6:Ada#2", "s6:petani",
  "s6:Sejarawan", "s3:menyerahkan", "s3:syarat", "s3:Parlemennya", "s2:Tahun", "s7:membubarkan", "s7:netral", "s7:Sampai"];
const { AT, K } = writeWorld(TL, at, {
  ep: "07", bg: FOG, vig: 0.42, grain: 0.05, capfloor: 0.35, html, css,
  chip: "DIORAMA ILUSTRASI &middot; BUKAN GAMBAR ASLI", chipFont: "Silkscreen,monospace", chipColor: SNOW,
  extraAt: WORLD_AT,
  // Reveals take no layout space until their word, so every card is sized to what it shows. Steps keep the motion pixel-chunky.
  fxExtra: `pix:(e,t)=>{const d=e.dataset.d||'block';gsap.set(e,{display:'none'});tl.set(e,{display:d},t-.001);tl.fromTo(e,{opacity:0,scale:.84},{opacity:1,scale:1,duration:.25,ease:'steps(4)',immediateRender:false},t);},
 pstamp:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t-.001);tl.fromTo(e,{scale:2,rotation:-9,opacity:0},{scale:1,rotation:-4,opacity:1,duration:.2,ease:'steps(4)',immediateRender:false},t);},
 pfade:(e,t)=>tl.fromTo(e,{opacity:0},{opacity:1,duration:.25,ease:'steps(4)'},t),`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:1,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 -40px 0)',duration:.3,ease:'steps(6)'},a-.12)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(100% 0 -40px 0)',duration:.22,ease:'steps(5)'},b-.22)`,
  // pixel-dissolve wipe over the whole frame at each station change, plus the 80 -> 81 tick
  hud: `(()=>{const cv=q('#pxw'),cx=cv.getContext('2d'),B=60,NB=18,R=[],C=[];let s=7;const rr=()=>{s=(s*16807)%2147483647;return s/2147483647;};
for(let j=0;j<32;j++)for(let i=0;i<NB;i++){R.push(.6*rr()+.4*((i/NB+j/32)/2));const v=rr();C.push(v<.76?'${FOG}':v<.93?'${BLUE}':'#2A3766');}
const WP=[K.s2,K.s3,K.s4,AT['s4:Mereka'],AT['s4:Dua'],K.s5,AT['s5:dan'],K.s6,K.s7];let lc=-1;
return (t)=>{let c=0;for(const T of WP){const d=Math.abs(t-T);if(d<.3)c=Math.max(c,1-d/.3);}
 const cq=Math.round(c*20)/20;if(cq!==lc){cx.clearRect(0,0,1080,1920);if(cq>0)for(let k=0;k<R.length;k++)if(R[k]<cq*1.12-.06){cx.fillStyle=C[k];cx.fillRect((k%NB)*B,Math.floor(k/NB)*B,B,B);}lc=cq;}
 const e=q('#c81');if(e){const on=t>=AT['s6:satu'];e.textContent=on?'81':'80';e.className=on?'nb on':'nb';}
};})()`,
  outroIn: `gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.3,ease:'steps(5)'},OUT);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:56px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:920px;text-align:center;font-family:Rubik,sans-serif;font-weight:800;font-size:60px;line-height:1.16;color:#FFFFFF;background:${INK};border:5px solid ${SNOW};box-shadow:0 0 0 5px ${BLUE},8px 8px 0 5px rgba(4,7,18,.5);padding:10px 28px 14px}
.w{display:inline-block;margin:0 4px}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF"},{color:"${GOLD}",duration:.04,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:18,opacity:0},{y:0,opacity:1,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Liechtenstein 80 jadi 81", FOG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
