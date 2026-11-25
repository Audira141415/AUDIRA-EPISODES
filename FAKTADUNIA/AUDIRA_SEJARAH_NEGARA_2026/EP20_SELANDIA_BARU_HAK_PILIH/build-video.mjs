// EP20 SELANDIA BARU: HAK PILIH PEREMPUAN 1893. WATERCOLOR: a European storybook painted in soft washes on cold-press paper,
// built as layered paper planes in Three.js. Stations: a painted globe, a Wellington street of the 1890s, a petition room,
// the Upper House chamber, the Governor's desk, a polling place and a paper timeline ribbon. Stations change under a
// full-screen page turn with a watercolor bloom on the turning sheet. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAPER = "#FAF6EF", EDGE = "#ECE4D6", GR = "#3C3733", COB = "#4E7B9C", SAGE = "#6F9779", PINE = "#3F6449", ROSE = "#D7837C", ROSED = "#B8605A", OCH = "#E8AB48", UMB = "#7B5943", BG = "#EFE7DA";

// camellia instead of portraits for the campaigners, a quill for the premier, a crown seal for the governor
const icon = (kind) => {
  const cam = `<g transform="translate(32 32)"><path d="M-6 14q-12 8-18 2q8-4 18-2z" fill="${SAGE}" opacity=".85"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="11" ry="15" transform="rotate(${a}) translate(0 -11)" fill="#FFFDF8" stroke="#B9AFA2" stroke-width="1.4"/>`).join("")}<circle r="6" fill="${OCH}"/></g>`;
  const quill = `<g fill="none" stroke="${GR}" stroke-width="2.6" stroke-linecap="round"><path d="M14 54L44 14"/><path d="M44 14q8 14-14 32q-4-22 14-32z" fill="${COB}" fill-opacity=".55"/></g><circle cx="14" cy="54" r="4" fill="${GR}"/>`;
  const crown = `<circle cx="32" cy="32" r="27" fill="${ROSED}"/><circle cx="32" cy="32" r="22" fill="none" stroke="#8E3E3A" stroke-width="2"/><path d="M17 40l3-16 7 8 5-12 5 12 7-8 3 16z" fill="#FBE9D6"/><rect x="17" y="42" width="30" height="4" fill="#FBE9D6"/>`;
  return `<svg viewBox="0 0 64 64" class="ic">${kind === "cam" ? cam : kind === "quill" ? quill : crown}</svg>`;
};
const tag = (kind, name, role, a) => `<div class="tag" data-at="${a}" data-fx="ink">${icon(kind)}<div><b>${name}</b><span>${role}</span></div></div>`;
const row = (b, s, a, cls = "") => `<div class="row ${cls}" data-at="${a}" data-fx="ink"><b>${b}</b><span>${s}</span></div>`;
const turn = (a) => `<div class="pg" data-at="${a}-0.37" data-fx="turn"><i class="sp"></i><i class="bl"></i><i class="bl b2"></i></div>`;

let html = `
${turn("s2:Di")}${turn("s4:Mereka")}${turn("s5:Di")}${turn("s6:19")}${turn("s6:Dua")}${turn("s7:Tapi")}${turn("s8:Semua")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 20</div>
  <div class="h1">Negara pertama<br><em>perempuan memilih</em></div>
  <div class="chips"><i class="ch no" data-at="s1:Eropa" data-fx="ink" data-d="inline-block">Eropa? bukan</i><i class="ch no" data-at="s1:Amerika" data-fx="ink" data-d="inline-block">Amerika? bukan</i><i class="ch ok" data-at="s1:Pasifik" data-fx="ink" data-d="inline-block">Pasifik ✓</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:Di">
  <div class="kk">SAMUDRA PASIFIK</div>
  <div class="h2">Selandia Baru</div>
  <div class="lb" data-at="s2:Selandia" data-fx="ink" data-d="inline-block">ibu kota: Wellington</div>
</div>
<div class="p" data-in="s2:Di" data-out="s3">
  <div class="kk">AKHIR ABAD KE-19</div>
  ${row("PEREMPUAN", "belum boleh ikut memilih di pemilu", "s2:perempuan", "rs")}
</div>
<div class="p" data-in="s3" data-out="s3:Rancangan">
  <div class="kk">&plusmn; 20 TAHUN KAMPANYE</div>
  ${tag("cam", "Kate Sheppard", "tokoh utama kampanye hak pilih perempuan", "s3:Kate")}
</div>
<div class="p" data-in="s3:Rancangan" data-out="s4">
  <div class="kk">RUU HAK PILIH PEREMPUAN</div>
  <div class="yrs">
    <div class="yr" data-at="s3:1878" data-fx="ink"><b>1878</b><span>kalah tipis</span></div>
    <div class="yr" data-at="s3:1879" data-fx="ink"><b>1879</b><span>kalah tipis</span></div>
    <div class="yr" data-at="s3:1887" data-fx="ink"><b>1887</b><span>kalah tipis</span></div>
  </div>
  <div class="st" data-at="s3:kandas" data-fx="stampc">KANDAS DI PARLEMEN</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="kk">PETISI TANDA TANGAN</div>
  <div class="pet">
    <div data-at="s4:sembilan" data-fx="ink"><i>1891</i><small>lebih dari</small><b><b class="ct" data-from="0" data-to="9000" data-a="s4:sembilan" data-d="1.2">0</b></b></div>
    <div data-at="s4:hampir" data-fx="ink"><i>1892</i><small>hampir</small><b><b class="ct" data-from="9000" data-to="20000" data-a="s4:hampir" data-d="1.4">0</b></b></div>
    <div class="big" data-at="s4:hampir#2" data-fx="ink"><i>1893</i><small>hampir</small><b><b class="ct" data-from="20000" data-to="32000" data-a="s4:hampir#2" data-d="1.8">0</b></b></div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Manuver">
  <div class="kk">MAJELIS TINGGI &middot; 8 SEPTEMBER 1893</div>
  ${tag("quill", "Richard Seddon", "Perdana Menteri, ingin RUU gagal", "s5:Richard")}
  ${row("1 ANGGOTA", "dibujuk berbalik menolak", "s5:satu", "rs")}
</div>
<div class="p" data-in="s5:Manuver" data-out="s6">
  <div class="kk">MAJELIS TINGGI &middot; 8 SEPTEMBER 1893</div>
  ${row("2 ANGGOTA", "marah, lalu berbalik mendukung", "s5:dua", "sg")}
  <div class="tally" data-at="s5:Lolos" data-fx="ink"><div><b>20</b><span>setuju</span></div><em>&ndash;</em><div class="r"><b>18</b><span>menolak</span></div></div>
  <div class="st ok" data-at="s5:Lolos" data-fx="stampc">LOLOS</div>
</div>
<div class="p" data-in="s6" data-out="s6:Dua">
  <div class="kk">PENGESAHAN</div>
  <div class="date" data-at="s6:September" data-fx="ink"><b>19 September 1893</b><span>disahkan menjadi undang-undang</span></div>
  ${tag("crown", "Lord Glasgow", "Gubernur Selandia Baru", "s6:Glasgow")}
  <div class="lb" data-at="s6:Māori" data-fx="ink" data-d="inline-block">termasuk perempuan Māori</div>
</div>
<div class="p" data-in="s6:Dua" data-out="s7">
  <div class="kk">PEMILU PERTAMA</div>
  <div class="date" data-at="s6:Dua" data-fx="ink"><b>28 November 1893</b><span>perempuan ikut memilih</span></div>
  <div class="lb sm" data-at="s6:pertama" data-fx="ink" data-d="inline-block">pemilih Māori: 20 Desember 1893</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="kk">HAK UNTUK DIPILIH</div>
  ${row("1919", "perempuan boleh mencalonkan diri ke parlemen", "s7:1919")}
  ${tag("cam", "Elizabeth McCombs", "anggota parlemen perempuan pertama, 1933", "s7:Elizabeth")}
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="kk">SEMUA BERAWAL DARI</div>
  <div class="h2">tanda tangan warga</div>
  <div class="q" data-at="s8:Menurut" data-fx="ink">Perubahan besar apa yang bisa dimulai dari petisi?</div>
</div>`;
// digits in Lora (Cormorant's old-style figures read small)
html = html.replace(/>([^<]+)</g, (m, s) => ">" + s.replace(/(\d[\d.,]*)/g, '<span class="g">$1</span>') + "<");

const HEAD = `'Cormorant Garamond',Georgia,serif`, BODY = `Lora,Georgia,serif`;
const paper = `linear-gradient(174deg,#FFFCF6,${PAPER} 55%,#F1E9DB)`;
const deckle = `clip-path:polygon(0 3%,4% 0,30% 2%,62% 0,96% 2%,100% 0,99% 50%,100% 97%,70% 100%,38% 98%,6% 100%,0 96%,1% 50%)`;
const sh = `box-shadow:0 14px 30px rgba(70,52,34,.28),0 2px 4px rgba(70,52,34,.18)`;
const css = `
.g,.ct{font-family:${BODY}!important;font-variant-numeric:lining-nums}
.p span.g{display:inline!important;font-size:inherit!important;font-weight:inherit!important;color:inherit!important;letter-spacing:inherit!important;margin:0!important;font-style:inherit!important;line-height:inherit!important}
.pg{position:absolute;inset:0;z-index:14;pointer-events:none;overflow:hidden;background:${paper};backface-visibility:hidden;box-shadow:0 0 80px rgba(60,40,20,.5)}
.pg .sp{position:absolute;left:0;top:0;bottom:0;width:180px;background:linear-gradient(90deg,rgba(90,64,40,.32),rgba(90,64,40,0))}
.pg .bl{position:absolute;left:50%;top:44%;width:980px;height:980px;margin:-490px 0 0 -490px;border-radius:47% 53% 44% 56%/52% 45% 55% 48%;background:radial-gradient(circle at 46% 50%,rgba(215,131,124,.0) 0 22%,rgba(215,131,124,.55) 48%,rgba(215,131,124,.22) 62%,rgba(215,131,124,0) 72%)}
.pg .b2{width:700px;height:700px;margin:-350px 0 0 -350px;top:58%;left:38%;background:radial-gradient(circle,rgba(78,123,156,.0) 0 30%,rgba(78,123,156,.42) 52%,rgba(78,123,156,0) 70%)}
.kk{display:inline-block;font-family:${BODY};font-weight:700;font-size:25px;letter-spacing:.14em;color:${PAPER};background:${COB};padding:8px 18px 7px;margin-bottom:14px;${sh};${deckle}}
.h1{display:inline-block;background:${paper};padding:6px 30px 16px;${sh};font-family:${HEAD};font-style:italic;font-weight:700;font-size:100px;line-height:.98;color:${GR};${deckle}}
.h1 em{font-style:italic;color:${ROSED}}
.h2{display:inline-block;background:${paper};padding:4px 26px 12px;${sh};font-family:${HEAD};font-style:italic;font-weight:700;font-size:84px;line-height:1.02;color:${GR};${deckle}}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
.ch{font-style:normal;font-family:${BODY};font-weight:700;font-size:36px;padding:8px 20px 10px;${sh}}
.ch.no{background:${paper};color:#8A8178;text-decoration:line-through;text-decoration-color:${ROSED};text-decoration-thickness:4px}
.ch.ok{background:${SAGE};color:${PAPER}}
.lb{display:inline-block;margin-top:12px;background:rgba(60,55,51,.88);padding:6px 18px 8px;font-family:${BODY};font-style:italic;font-weight:600;font-size:34px;color:${PAPER}}
.lb.sm{font-size:30px}
.row{display:flex;flex-direction:column;gap:2px;margin-top:14px;padding:12px 24px 14px;background:${paper};border-left:12px solid ${COB};${sh}}
.row b{font-family:${BODY};font-weight:700;font-size:42px;line-height:1.05;color:${COB};letter-spacing:.02em}
.row span{font-family:${BODY};font-weight:500;font-size:34px;line-height:1.2;color:${GR}}
.row.rs{border-left-color:${ROSED}}.row.rs b{color:${ROSED}}
.row.sg{border-left-color:${SAGE}}.row.sg b{color:${PINE}}
.tag{display:flex;align-items:center;gap:20px;margin-top:14px;padding:12px 26px 12px 14px;background:${paper};${sh};border-bottom:3px solid ${ROSE}}
.tag .ic{flex:none;width:88px;height:88px}
.tag b{display:block;font-family:${HEAD};font-style:italic;font-weight:700;font-size:56px;line-height:1;color:${GR}}
.tag span{display:block;font-family:${BODY};font-weight:500;font-size:30px;line-height:1.2;color:#6A6058;margin-top:4px}
.yrs{display:flex;gap:14px}
.yr{flex:1;text-align:center;padding:4px 6px 12px;background:${paper};border-top:10px solid ${ROSE};${sh}}
.yr b{display:block;font-family:${BODY};font-weight:700;font-size:70px;line-height:1.08;color:${GR}}
.yr span{display:block;font-family:${BODY};font-style:italic;font-weight:600;font-size:29px;color:${ROSED}}
.st{display:inline-block;margin-top:18px;font-family:${BODY};font-weight:700;font-size:38px;letter-spacing:.08em;padding:8px 22px;color:${ROSED};border:5px double ${ROSED};background:rgba(250,246,239,.94);transform:rotate(-3deg);${sh}}
.st.ok{color:${PINE};border-color:${PINE};margin-left:18px}
.pet{display:flex;flex-direction:column;gap:12px}
.pet>div{display:flex;align-items:baseline;gap:16px;padding:6px 24px 10px;background:${paper};border-left:12px solid ${SAGE};${sh}}
.pet>div.big{border-left-color:${ROSED}}
.pet i{font-style:normal;font-family:${BODY};font-weight:700;font-size:34px;color:${COB};width:90px}
.pet small{font-family:${BODY};font-style:italic;font-weight:500;font-size:30px;color:#6A6058;width:150px}
.pet>div>b{font-family:${BODY};font-weight:700;font-size:74px;line-height:1.05;color:${GR}}
.pet>div.big>b{color:${ROSED}}
.tally{display:flex;align-items:center;gap:18px;margin-top:14px;padding:4px 28px 10px;background:${paper};${sh};width:max-content}
.tally div{text-align:center}.tally b{display:block;font-family:${BODY};font-weight:700;font-size:120px;line-height:1.05;color:${PINE}}
.tally .r b{color:${ROSED}}.tally span{display:block;font-family:${BODY};font-weight:600;font-size:28px;letter-spacing:.1em;color:${GR}}
.tally em{font-family:${BODY};font-style:normal;font-size:80px;color:${GR}}
.date{margin-top:14px;padding:10px 26px 14px;background:${COB};color:${PAPER};${sh};width:max-content}
.date b{display:block;font-family:${BODY};font-weight:700;font-size:62px;line-height:1.05}
.date span{display:block;font-family:${BODY};font-style:italic;font-weight:500;font-size:31px;color:#E6EEF4}
.q{margin-top:16px;font-family:${HEAD};font-style:italic;font-weight:700;font-size:54px;line-height:1.08;padding:16px 26px;color:${PAPER};background:${ROSED};border-bottom:8px solid ${OCH};${sh}}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
copyFileSync("geo_nz.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo_nz.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "20", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0.0, html, css, chipFont: BODY, chipColor: GR, sig: "EP20_SELANDIA_BARU_HAK_PILIH",
  chip: "ILUSTRASI CAT AIR &middot; BUKAN FOTO SEJARAH",
  extraAt: ["s1:dunia", "s1:perempuan", "s1:memilih", "s1:Eropa", "s1:Amerika", "s1:Pasifik", "s2:Ini", "s2:Selandia", "s2:Di", "s2:perempuan", "s2:tidak",
    "s3:Kampanye", "s3:Kate", "s3:Rancangan", "s3:1878", "s3:1879", "s3:1887", "s3:kandas",
    "s4:Mereka", "s4:petisi", "s4:sembilan", "s4:1891", "s4:hampir", "s4:1892", "s4:hampir#2", "s4:1893",
    "s5:Di", "s5:Majelis", "s5:Richard", "s5:satu", "s5:berbalik", "s5:Manuver", "s5:marah", "s5:mendukung", "s5:Lolos", "s5:belas",
    "s6:19", "s6:Gubernur", "s6:Glasgow", "s6:mengesahkannya", "s6:termasuk", "s6:Māori", "s6:Dua", "s6:November", "s6:memilih", "s6:pertama",
    "s7:Tapi", "s7:dipilih", "s7:1919", "s7:Dan", "s7:perempuan", "s7:Elizabeth", "s7:terpilih", "s7:1933",
    "s8:Semua", "s8:tanda", "s8:Menurut", "s8:petisi", "s8:AUDIRA"],
  fxExtra: `ink:(e,t)=>{const d=e.dataset.d||(e.classList.contains('row')||e.classList.contains('tag')||e.classList.contains('tally')||(e.parentNode&&e.parentNode.classList.contains('pet'))?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:18,filter:'blur(7px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.5,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-block'},t);tl.fromTo(e,{scale:1.9,rotation:-8,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.2,ease:'power4.in',immediateRender:false},t);},
 turn:(e,t)=>{const b=e.querySelectorAll('.bl');gsap.set(e,{opacity:0,rotationY:86,transformPerspective:2600,transformOrigin:'0% 50%'});gsap.set(b,{scale:.25,opacity:0});
  tl.set(e,{opacity:1},t);tl.to(e,{rotationY:0,duration:.32,ease:'power2.in'},t);
  tl.to(b,{scale:1.3,opacity:1,duration:.6,ease:'power2.out',stagger:.06},t+.1);
  tl.to(e,{rotationY:-86,duration:.42,ease:'power2.inOut'},t+.41);tl.set(e,{opacity:0},t+.84);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:'power3.out'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-10,duration:.22,ease:'power2.in'},b-.22)`,
});

// Captions: join any {display|spoken} split words back for the strip.
const words = [];
for (const w of TL.words) {
  const prev = words[words.length - 1];
  if (prev && prev.open) { prev.end = w.end; if (w.text.includes("}")) delete prev.open; continue; }
  const m = w.text.match(/^(.*)\{([^|]*)\|/);
  if (m) words.push({ ...w, text: m[1] + m[2], open: !w.text.includes("}") });
  else words.push({ ...w });
}
const n = writeCaptions(".", { ...TL, words }, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Lora,Georgia,serif;font-weight:600;font-size:56px;line-height:1.16;word-spacing:.06em;color:${GR};padding:14px 28px 18px;background:linear-gradient(176deg,#FFFCF6,${PAPER} 50%,${EDGE});box-shadow:0 12px 26px rgba(70,52,34,.32);clip-path:polygon(0 6%,3% 0,22% 4%,48% 0,73% 5%,97% 0,100% 8%,99% 92%,100% 100%,76% 96%,51% 100%,26% 95%,2% 100%,0 90%)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${GR}"},{color:"${ROSED}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${GR}",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Selandia Baru Hak Pilih", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
