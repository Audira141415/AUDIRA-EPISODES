// EP09 MUSA & KHIDIR, TIGA KEJADIAN. KINTSUGI: glazed porcelain cards (cream, ink text, celadon kicker) over a porcelain diorama.
// Panel transition: a gold seam draws across the card first, then the card opens outward from that crack; on exit it closes back onto the seam.
// QS 18:82 phrase taken programmatically from the Uthmani source (Amiri). Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#16202A", CREAM = "#F2EBDC", CEL = "#4F7D6C", GOLD = "#B8862F", GOLDB = "#E9BC62", BG = "#0B141B";

// Arabic copied programmatically from the Uthmani source, never retyped: the bounded phrase between the two pause marks of QS 18:82.
const Q = readFileSync("../_research/quran/EP09_khidir.txt", "utf8").split("\n");
const ayah = (ref) => Q.find((l) => l.startsWith(`QS ${ref} |`)).split("|")[1].trim();
const PHRASE = ayah("18:82").split(" ۚ ")[1].trim();
if (PHRASE !== "وَمَا فَعَلْتُهُۥ عَنْ أَمْرِى") throw new Error("phrase mismatch: " + PHRASE);

// every panel gets its own crack line (x in %, y in %), used by the seam svg and the clip-path
let seed = 9;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
let pid = 0;
function P(inn, out, body, cls = "") {
  const xs = [0, 13, 27, 40, 54, 67, 81, 100];
  const ys = xs.map(() => +(40 + rnd() * 20).toFixed(1));
  const top0 = xs.map((x, i) => `${x}% ${ys[i]}%`), bot0 = xs.map((x, i) => `${x}% ${ys[i]}%`).reverse();
  const top1 = xs.map((x) => `${x}% -4%`), bot1 = xs.map((x) => `${x}% 104%`).reverse();
  const c0 = `polygon(${[...top0, ...bot0].join(",")})`, c1 = `polygon(${[...top1, ...bot1].join(",")})`;
  const line = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  pid++;
  return `<div class="p" ${inn === "@0" ? 'data-first="1" ' : ""}data-in="${inn}" data-out="${out}" data-c0="${c0}" data-c1="${c1}">
  <div class="card ${cls}">${body}</div>
  <svg class="seam" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${line}" pathLength="100"/></svg>
</div>`;
}
const row = (a, b, sp, cls = "") => `<div class="row" data-at="${a}" data-fx="seal"><b class="${cls}">${b}</b><span>${sp}</span></div>`;

const html = `
${P("@0", "s2", `<div class="k"><em>09</em>KISAH DALAM AL-QUR'AN</div>
  <div class="h">Musa &amp; Khidir</div>
  <div class="sub" data-at="s1:Sebanyak" data-fx="seal">Setetes di paruh burung: ilmu manusia dibanding ilmu Allah <b>· HR Bukhari 122</b></div>`, "slim")}
${P("s2", "s2:Allah", `<div class="k"><em>HR BUKHARI 122</em>SAHIH</div>
  <div class="h m">&ldquo;Siapa manusia paling berilmu?&rdquo;</div>
  ${row("s2:aku", "JAWAB", "&ldquo;Aku.&rdquo;", "rd")}`)}
${P("s2:Allah", "s3", `<div class="k"><em>HR BUKHARI 122 · QS 18:60</em></div>
  <div class="h m">Pertemuan dua laut</div>
  ${row("s2:menunjukkan", "DITUNJUKKAN", "seorang hamba yang lebih berilmu")}
  ${row("s2:Khidir", "KHIDIR", "nama dari hadis", "gd")}`)}
${P("s3", "s3:Musa#2", `<div class="k"><em>QS AL-KAHF 18:61-64</em></div>
  <div class="h m">Ikan melompat ke laut</div>
  <div class="quote" data-at="s3:situlah" data-fx="seal">&ldquo;Itulah (tempat) yang kita cari.&rdquo;</div>`)}
${P("s3:Musa#2", "s4", `<div class="k"><em>QS AL-KAHF 18:66-67</em></div>
  ${row("s3:ikut", "MUSA", "minta ikut untuk belajar")}
  <div class="quote" data-at="s3:kamu" data-fx="seal">&ldquo;Sungguh, engkau tidak akan sanggup sabar bersamaku.&rdquo;</div>`)}
${P("s4", "s4:Kedua", `<div class="k"><em>1</em>QS AL-KAHF 18:71</div>
  <div class="h m">Perahu dilubangi</div>
  ${row("s4:protes", "MUSA PROTES", "&ldquo;untuk menenggelamkan penumpangnya?&rdquo;", "rd")}`)}
${P("s4:Kedua", "s5", `<div class="k"><em>2</em>QS AL-KAHF 18:74</div>
  <div class="h m">Seorang anak muda</div>
  ${row("s4:protes#2", "MUSA PROTES", "lebih keras", "rd")}`)}
${P("s5", "s5:Musa", `<div class="k"><em>3</em>QS AL-KAHF 18:77</div>
  <div class="h m">Dinding hampir roboh</div>
  ${row("s5:menolak", "NEGERI", "menolak menjamu mereka")}
  ${row("s5:tanpa", "DITEGAKKAN", "tanpa upah", "gd")}`)}
${P("s5:Musa", "s6", `<div class="k"><em>QS AL-KAHF 18:78</em></div>
  ${row("s5:bertanya", "MUSA", "bertanya lagi")}
  <div class="quote" data-at="s5:berpisah" data-fx="seal">&ldquo;Inilah perpisahan antara aku dengan engkau.&rdquo;</div>`)}
${P("s6", "s6:Anak", `<div class="k"><em>1</em>QS 18:79 · TAFSIR IBNU KATSIR</div>
  <div class="h m">Perahu orang miskin</div>
  ${row("s6:raja", "RAJA", "merampas setiap perahu yang baik", "rd")}
  ${row("s6:baik", "QS 18:79", "&ldquo;aku bermaksud merusaknya&rdquo;", "gd")}`)}
${P("s6:Anak", "s6:Dan", `<div class="k"><em>2</em>QS AL-KAHF 18:80-81</div>
  <div class="h m">Orang tuanya beriman</div>
  ${row("s6:beriman", "DIGANTI", "dengan yang lebih baik dan lebih sayang", "gd")}`)}
${P("s6:Dan", "s7", `<div class="k"><em>3</em>QS AL-KAHF 18:82</div>
  <div class="h m">Harta dua anak yatim</div>
  ${row("s6:tersimpan", "DI BAWAH DINDING", "tersimpan harta", "gd")}
  ${row("s6:yatim", "AYAHNYA", "orang yang saleh")}`)}
${P("s7", "s8", `<div class="k"><em>QS AL-KAHF 18:82</em>PENUTUP</div>
  <div class="ar" data-at="s7:apa" data-fx="seal">${PHRASE}</div>
  <div class="tr" data-at="s7:kuperbuat" data-fx="seal">&ldquo;Apa yang kuperbuat bukan menurut kemauanku sendiri.&rdquo;</div>`, "arc")}
${P("s8", "@END", `<div class="k"><em>RENUNGAN</em></div>
  <div class="h m">Yang terlihat merugikan bisa jadi penyelamat</div>`, "slim")}`;

const css = `
.card{position:relative;background:linear-gradient(180deg,rgba(244,238,224,.96),rgba(234,226,208,.95));border:1.5px solid rgba(184,134,47,.55);border-radius:14px;padding:24px 32px 28px;box-shadow:0 26px 60px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.8),inset 0 -2px 0 rgba(120,100,70,.12)}
.card.slim{padding:22px 32px 24px}
.k{display:flex;align-items:center;gap:14px;font-family:"Noto Serif",serif;font-weight:700;font-size:25px;letter-spacing:.12em;color:${CEL};padding-bottom:12px;border-bottom:1px solid rgba(79,125,108,.35);margin-bottom:12px}
.k em{font-style:normal;color:${CREAM};background:${CEL};padding:2px 12px;letter-spacing:.06em;border-radius:20px}
.h{font-family:"Zen Old Mincho",serif;font-weight:900;font-size:96px;line-height:1.02;color:${INK};letter-spacing:-.01em}
.h.m{font-size:62px;line-height:1.1}
.sub{font-family:"Noto Serif",serif;font-weight:600;font-size:34px;line-height:1.28;color:${INK};margin-top:12px}
.sub b{color:${GOLD};font-weight:700}
.row{display:flex;align-items:baseline;gap:18px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(22,32,42,.12)}
.row b{flex:none;font-family:"Noto Serif",serif;font-weight:800;font-size:30px;letter-spacing:.08em;color:${CEL}}
.row b.gd{color:${GOLD}}.row b.rd{color:#8A3A2A}
.row span{font-family:"Noto Serif",serif;font-weight:600;font-size:35px;line-height:1.2;color:${INK}}
.quote{font-family:"Zen Old Mincho",serif;font-weight:700;font-size:48px;line-height:1.24;color:${INK};margin-top:12px;padding-left:20px;border-left:5px solid ${GOLD}}
.arc{text-align:center}
.ar{font-family:Amiri,serif;direction:rtl;text-align:center;font-size:96px;line-height:1.7;color:#7A5410;text-shadow:0 0 18px rgba(233,188,98,.55);padding:0 0 4px}
.tr{font-family:"Zen Old Mincho",serif;font-weight:700;font-size:44px;line-height:1.26;text-align:center;color:${INK};padding-top:12px;border-top:1px solid rgba(184,134,47,.4)}
.seam{position:absolute;left:-6px;top:0;width:calc(100% + 12px);height:100%;overflow:visible;pointer-events:none;opacity:0;filter:drop-shadow(0 0 6px rgba(233,188,98,.9))}
.seam polyline{fill:none;stroke:${GOLDB};stroke-width:4;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
// anchors used only inside the 3D world: collected straight from world3d.js
const WORLD_AT = [...new Set([...readFileSync("world3d.js", "utf8").matchAll(/A\("([^"]+)"\)/g)].map((m) => m[1]))];
writeWorld(TL, at, {
  ep: "09", bg: BG, vig: 0.4, grain: 0.05, capfloor: 0.55, html, css,
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: '"Noto Serif",serif', chipColor: "#F4EEDF",
  extraAt: WORLD_AT,
  fxExtra: `seal:(e,t)=>tl.fromTo(e,{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.6,ease:'power2.out'},t)&&tl.set(e,{clipPath:'none'},t+.62),`,
  // Crack-and-gold seam: the seam draws across the card, then the card opens out of the crack. Exit closes back onto the seam.
  panelIn: `(tl,p,a)=>{const c=p.querySelector('.card'),s=p.querySelector('.seam'),l=s.querySelector('polyline');
 tl.fromTo(p,{opacity:0},{opacity:1,duration:.01},a-.14);
 tl.fromTo(s,{opacity:0},{opacity:1,duration:.05},a-.14);
 tl.fromTo(l,{strokeDashoffset:100},{strokeDashoffset:0,duration:.28,ease:'power2.out'},a-.14);
 tl.fromTo(c,{clipPath:p.dataset.c0},{clipPath:p.dataset.c1,duration:.55,ease:'power3.inOut'},a+.08);
 tl.to(s,{opacity:0,duration:.4,ease:'power1.in'},a+.55);}`,
  panelOut: `(tl,p,b)=>{const c=p.querySelector('.card'),s=p.querySelector('.seam');
 tl.to(s,{opacity:1,duration:.12},b-.55);
 tl.to(c,{clipPath:p.dataset.c0,duration:.4,ease:'power3.in'},b-.5);
 tl.to(p,{opacity:0,duration:.14,ease:'none'},b-.12);}`,
  outroIn: `gsap.set('#outro',{opacity:0,clipPath:'polygon(0% 48%,25% 52%,50% 47%,75% 53%,100% 49%,100% 49%,75% 53%,50% 47%,25% 52%,0% 48%)'});tl.to('#outro',{opacity:1,duration:.2},OUT-.1);tl.to('#outro',{clipPath:'polygon(0% -2%,25% -2%,50% -2%,75% -2%,100% -2%,100% 102%,75% 102%,50% 102%,25% 102%,0% 102%)',duration:.9,ease:'power3.inOut'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Noto Serif",serif;font-weight:700;font-size:62px;line-height:1.16;color:#F4EEDF;text-shadow:0 3px 14px rgba(0,0,0,.95),0 0 3px #000}
.w{display:inline-block;margin:0 .15em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#F4EEDF",scale:1},{color:"${GOLDB}",scale:1.06,duration:.07,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#F4EEDF",scale:1,duration:.18},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,clipPath:"inset(0 50% 0 50%)"},{opacity:1,clipPath:"inset(0 0% 0 0%)",duration:.26,ease:"power2.out"},${s.toFixed(3)});tl.set("#${id}",{clipPath:"none"},${(s + 0.27).toFixed(3)});\n`);
writeIndex(".", TL, "Musa dan Khidir Tiga Kejadian", BG);
console.log("caption groups", n, "duration", TL.duration);
