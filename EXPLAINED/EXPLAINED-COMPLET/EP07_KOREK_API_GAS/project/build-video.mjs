// EP07 KOREK API GAS. COMICFORGE: a printed comic book. Panels are yellow narration boxes with a heavy ink border and a
// hard offset shadow; they slam in with a small overshoot and tilt like a stamped panel. Numbers sit dimmed and print
// on their spoken word. Run from project/: node build-video.mjs
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const YEL = "#FFE100", INK = "#121014", MAG = "#E5007D", CY = "#00A3E0", RED = "#ED1C24", PAPER = "#FFF6E0";
const TT = "Bangers,cursive", SN = "'Roboto Condensed',sans-serif";

const card = (inn, out, l1, l2, a2, big = false) => `<div class="p" data-in="${inn}" data-out="${out}"${inn === "@0" ? ' data-first="1"' : ""}><div class="card"><div class="l1">${l1}</div><div class="l2${big ? " big" : ""}" data-at="${a2}" data-fx="pin">${l2}</div></div></div>`;
const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">CARA KERJA BENDA &middot; EP 07</div>
  <div class="card"><div class="ttl">KOREK API GAS</div></div><div class="l2 hook" data-at="s1:logam" data-fx="pin">BATU APINYA LOGAM!</div>
</div>
${card("s2", "s2:Campuran", "FERROCERIUM", "BESI + CERIUM", "s2:besi")}
${card("s2:Campuran", "s3", "CARL AUER VON WELSBACH", "AUSTRIA &middot; 1903", "s2:seribu", true)}
${card("s3", "s4", "ISINYA BUTANA CAIR", "TEKANAN &gt; 2&times; UDARA LUAR", "s3:dua")}
${card("s4", "s5", "KATUP TERBUKA, BUTANA MENDIDIH", "SEKITAR 0 &deg;C", "s4:nol", true)}
${card("s5", "s6", "GAS + UDARA", "KURANG: PERCIKAN!", "s5:percikan")}
${card("s6", "s6:Pada#2", "RODA BAJA MENGGORES", "CERIUM MENYALA SEKITAR 150 &deg;C", "s6:sekitar")}
${card("s6:Pada#2", "s7", "KOREK ELEKTRIK: KRISTAL PIEZO", "PERCIKAN LISTRIK!", "s6:percikan")}
${card("s7", "s8", "MENURUT BEBERAPA SUMBER", "LEBIH DARI 1.600 &deg;C", "s7:seribu", true)}
${card("s8", "s8:Ini", "PENGAMAN ANAK DI AS", "GAGALKAN MIN. 85% ANAK", "s8:delapan")}
${card("s8:Ini", "@END", "EDISI BERIKUTNYA", "AIRBAG MOBIL", "s8:airbag", true)}
<div class="wipe" data-at="s3:Tapi" data-fx="wipe"></div>
<div class="wipe" data-at="s7:Serpihan" data-fx="wipe"></div>`;

const css = `
.tag{display:table;font-family:${SN};font-weight:800;font-size:36px;letter-spacing:.05em;color:${INK};background:#FFFFFF;border:5px solid ${INK};padding:6px 18px 5px;margin-bottom:16px;transform:rotate(-1.5deg);box-shadow:6px 6px 0 ${INK}}
.card{display:table;background:${YEL};border:8px solid ${INK};padding:10px 30px 16px;box-shadow:14px 14px 0 ${INK};transform:rotate(-1deg);max-width:900px}
.ttl{font-family:${TT};font-size:96px;line-height:.95;color:${INK};letter-spacing:.02em}
.l1{font-family:${TT};font-size:58px;line-height:1.05;color:${INK};letter-spacing:.03em}
.card{position:relative}
.card .l2{position:absolute;left:22px;top:calc(100% + 4px);white-space:nowrap}
.l2{display:block;width:max-content;margin-top:10px;font-family:${TT};font-size:66px;line-height:1.02;color:${INK};letter-spacing:.03em;background:#FFFFFF;border:6px solid ${INK};padding:4px 18px 2px;box-shadow:7px 7px 0 ${INK}}
.l2.big{font-size:104px}
.l2.hook{margin:22px 0 0 22px}
.wipe{position:absolute;top:-200px;bottom:-200px;left:-300px;width:760px;z-index:12;background:radial-gradient(circle,${INK} 34%,transparent 36%) 0 0/26px 26px,${YEL};border-left:26px solid ${INK};border-right:26px solid ${INK};transform:skewX(-14deg);pointer-events:none}
#chip{font-family:${SN};font-weight:800;font-size:22px;color:#fff;opacity:.9;letter-spacing:.06em;background:${INK};padding:4px 10px;top:178px}`;

// anchors used only inside world3d.js / mix.py are collected from their A("...") / AT["..."] calls
const worldSrc = readFileSync("world3d.js", "utf8");
const mixSrc = readFileSync("mix.py", "utf8");
const extraAt = [...new Set([...[...worldSrc.matchAll(/A\("([^"]+)"\)/g)].map((m) => m[1]), ...[...mixSrc.matchAll(/AT\["([^"]+)"\]/g)].map((m) => m[1])])];


// Captions: same markup as hflib.writeCaptions, but spoken numbers ("seratus lima puluh derajat") never split across
// two caption groups, and groups wrap to at most 2 lines inside the safe width.
const NUM = new Set(["seribu", "sembilan", "ratus", "tiga", "dua", "kali", "nol", "seratus", "lima", "puluh", "enam", "delapan", "derajat", "celsius", "persen"]);
const bare = (w) => w.text.toLowerCase().replace(/[.,:;?!]+$/, "");
function capGroups(words) {
  const gs = []; let cur = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((s, x) => s + x.text.length + 1, 0) + w.text.length;
    const glue = prev && NUM.has(bare(prev)) && NUM.has(bare(w)) && !/[.?:;!,]$/.test(prev.text) && chars <= 44;
    const split = prev && !glue && (prev.scene !== w.scene || /[.?:;!]$/.test(prev.text) || (/,$/.test(prev.text) && cur.length >= 2) || cur.length >= 6 || chars > 30);
    if (split) { gs.push(cur); cur = []; }
    cur.push(w);
  }
  gs.push(cur); return gs;
}
function writeCaps(TL, css, wordTween, groupIn) {
  const groups = capGroups(TL.words); let html = "", js = "", wid = 0;
  groups.forEach((g, i) => {
    const s = +(g[0].start - 0.04).toFixed(3);
    const nextS = i < groups.length - 1 ? groups[i + 1][0].start - 0.04 : g[g.length - 1].end + 0.35;
    const dur = +Math.max(nextS - s, 0.3).toFixed(3);
    const words = g.map((w) => { const id = `w${wid++}`; js += wordTween(id, w); return `<span class="w" id="${id}">${w.text}</span>`; }).join(" ");
    html += `<div class="cap clip" id="g${i}" data-start="${s}" data-duration="${dur}" data-track-index="2"><div class="capin" id="gi${i}">${words}</div></div>
`;
    js += groupIn(`gi${i}`, s);
  });
  writeFileSync("hf/compositions/captions.html", `<template><style>${css}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
<script>const tl=gsap.timeline({paused:true});
${js}window.__timelines["captions"]=tl;</script></template>`);
  return groups.length;
}

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "07", bg: "#FFE100", vig: 0.18, grain: 0.05, capfloor: 0.38, html, css, chipFont: SN, chipColor: "#fff", sig: "EP07_KOREK_API_GAS",
  extraAt,
  // panels slam in like a stamped comic panel and slide out to the left
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,scale:1.14,rotation:-3},{opacity:1,scale:1,rotation:0,duration:.24,ease:'back.out(2)'},a-.1);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,x:-120,rotation:-2,duration:.22,ease:'power2.in'},b-.22);}`,
  fxExtra: `pin:(e,t)=>tl.fromTo(e,{opacity:0,scale:1.5,rotation:-6},{opacity:1,scale:1,rotation:-1,duration:.22,ease:'back.out(2.2)'},t),wipe:(e,t)=>tl.fromTo(e,{x:-900,skewX:-14,opacity:1},{x:1500,skewX:-14,opacity:1,duration:.5,ease:'power2.inOut'},t-.3),`,
  outroIn: `gsap.set('#outro',{opacity:0,scale:1.08});tl.to('#outro',{opacity:1,scale:1,duration:.35,ease:'power3.out'},OUT-.05);`,
});
const n = writeCaps(TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:880px;box-sizing:border-box;background:${INK};border:5px solid ${YEL};padding:8px 20px 6px;box-shadow:8px 8px 0 rgba(0,0,0,.5);text-align:center;overflow-wrap:break-word;font-family:${TT};font-size:72px;line-height:1.08;color:#FFFFFF;letter-spacing:.03em;-webkit-text-stroke:3px ${INK};text-shadow:5px 5px 0 ${INK},0 0 14px rgba(0,0,0,.55)}
.w{display:inline-block;margin:0 .16em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${YEL}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:16,rotation:-1.5},{y:0,rotation:0,duration:.18,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Korek Api Gas", "#FFE100");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
