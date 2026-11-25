// EP05 RICE COOKER. FOODFORGE: a warm food-commercial kitchen, walnut counter, backlit steam, glossy rice.
// Panels are warm smoked-glass menu cards with a serif italic title and a mono "kitchen ticket" tag; they rise out
// of a blur like steam clearing. Run from project/: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../../_tools/hflib.mjs";
import { writeWorld } from "../../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const ACC = "#FF8A3D", CREAM = "#FFF4E2", AMB = "#FFB36B";
const TT = "'Playfair Display',serif", MN = "'IBM Plex Mono',monospace", SN = "Manrope,sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag"><i></i>CARA KERJA BENDA &middot; EP 05</div>
  <div class="card"><div class="big">Rice cooker<br><span>tahu nasi matang</span></div></div>
  <div class="ln" data-at="s1:Tapi" data-fx="lit">Tanpa mata. Lalu bagaimana?</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tag"><i></i>ISINYA SEDERHANA</div>
  <div class="row"><b class="c" data-at="s2:pemanas" data-fx="lit">PEMANAS</b><b class="c" data-at="s2:mangkuk" data-fx="lit">MANGKUK</b><b class="c" data-at="s2:termostat" data-fx="lit">TERMOSTAT</b></div>
  <div class="ln" data-at="s2:suhu" data-fx="lit">Termostat mengukur suhu mangkuk</div>
  <div class="card" data-at="s2:otaknya" data-fx="lit"><div class="big sm">Inilah <span>otaknya</span></div></div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag"><i></i>SEJARAHNYA</div>
  <div class="ln" data-at="s3:Mitsubishi" data-fx="lit">Mitsubishi Electric &middot; 1923</div>
  <div class="ln dim" data-at="s3:belum" data-fx="lit">Rice cooker listrik pertama, belum otomatis</div>
  <div class="ln" data-at="s3:Toshiba" data-fx="lit">Toshiba &middot; 10 Desember 1955</div>
  <div class="ln g" data-at="s3:diperkenalkan" data-fx="lit">Otomatis pertama untuk rumah</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag"><i></i>MASALAHNYA</div>
  <div class="card" data-at="s4:sembilan" data-fx="lit"><div class="big sm">98&nbsp;&deg;C <span>&middot; 20 menit</span></div></div>
  <div class="ln" data-at="s4:timer" data-fx="lit">Hanya pakai timer? Hasilnya kacau</div>
  <div class="ln dim" data-at="s4:mendidih" data-fx="lit">Waktu air mendidih selalu berbeda</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag"><i></i>JAWABANNYA: AIR</div>
  <div class="ln" data-at="s5:tertahan" data-fx="lit">Masih ada air: suhu tertahan di titik didih</div>
  <div class="ln g" data-at="s5:menguapkan" data-fx="lit">Panas dipakai untuk menguapkan air</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tag"><i></i>AIR HABIS</div>
  <div class="ln" data-at="s6:naik" data-fx="lit">Suhu mangkuk naik dengan cepat</div>
  <div class="ln g" data-at="s6:mematikan" data-fx="lit">Termostat mematikan pemanas</div>
  <div class="card" data-at="s6:Klik" data-fx="stamp"><div class="big"><span>Klik!</span></div></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag"><i></i>DI BALIK PENEMUANNYA</div>
  <div class="card" data-at="s7:sejak" data-fx="lit"><div class="big sm">Sejak <span>1951</span></div></div>
  <div class="ln" data-at="s7:percobaan" data-fx="lit">Banyak percobaan, termasuk oleh Fumiko</div>
  <div class="ln dim" data-at="s7:Yoshitada" data-fx="lit">istri penemunya, Yoshitada Minami</div>
  <div class="ln g" data-at="s7:perang" data-fx="lit">Memicu perang produksi di Jepang</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card" data-at="s8:membaca" data-fx="lit"><div class="big sm">Membaca <span>suhu,</span><br>bukan waktu</div></div>
  <div class="ln" data-at="s8:tombolnya" data-fx="lit">Rice cooker di rumahmu masih berbunyi klik?</div>
</div>`;

const css = `
.tag{display:table;font-family:${MN};font-weight:500;font-size:27px;letter-spacing:.14em;color:${AMB};background:rgba(20,11,6,.74);padding:9px 18px 8px;border:1px solid rgba(255,214,160,.38);border-radius:4px;margin-bottom:14px}
.tag i{display:inline-block;width:12px;height:12px;border-radius:50%;background:#FF6A2B;box-shadow:0 0 10px #FF6A2B;margin-right:12px;vertical-align:1px}
.card{display:table;background:linear-gradient(180deg,rgba(34,19,10,.92),rgba(20,11,6,.9));border:1px solid rgba(255,214,160,.45);border-radius:12px;padding:12px 30px 20px;margin-bottom:14px;box-shadow:0 24px 60px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,236,200,.25)}
.big{font-family:${TT};font-style:italic;font-weight:800;font-size:96px;line-height:1.0;color:${CREAM};letter-spacing:-.01em}
.big span{color:${AMB}}.big.sm{font-size:76px;line-height:1.04}
.ln{display:table;font-family:${SN};font-weight:700;font-size:40px;line-height:1.22;color:${CREAM};background:rgba(20,11,6,.9);padding:10px 22px 11px 22px;margin-bottom:10px;border-left:6px solid ${ACC};border-radius:0 8px 8px 0;max-width:880px}
.ln.g{border-left-color:#FFD27A;color:#FFE7C2}.ln.dim{font-weight:600;font-size:36px;border-left-color:rgba(255,179,107,.55)}
.row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.c{font-family:${MN};font-weight:600;font-size:34px;padding:10px 18px 9px;color:#1A0E07;background:#FFE2B8;border-radius:6px;box-shadow:0 10px 24px rgba(0,0,0,.4)}
#chip{font-family:${MN};font-size:21px;color:${CREAM};opacity:.7;letter-spacing:.06em}`;

const L = "hf/assets/lib/";
copyFileSync("../../_tools/lib3d.js", L + "lib3d.js");
copyFileSync("world3d.js", L + "world3d.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "05", bg: "#140C08", vig: 0.5, grain: 0.06, capfloor: 0.42, html, css, chipFont: MN, chipColor: CREAM, sig: "EP05_RICE_COOKER",
  extraAt: ["s1:tahu", "s1:matang", "s2:Isinya", "s2:Termostat", "s3:tahun", "s3:Yang", "s3:otomatis#2", "s3:Desember", "s4:Riset", "s4:gosong", "s4:belum",
    "s5:Selama", "s5:titik", "s5:Panas", "s6:habis", "s6:suhu", "s6:cepat", "s6:Termostat", "s6:mendeteksi", "s6:matang", "s6:pemanas",
    "s7:Fumiko", "s7:Keberhasilannya", "s7:Jepang", "s8:bukan", "s8:Rice", "s8:klik", "s8:AUDIRA", "s8:rice"],
  // panels rise out of a soft blur, like steam clearing off a glass
  panelIn: `(tl,p,a)=>{tl.fromTo(p,{opacity:0,y:30,filter:'blur(10px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.5,ease:'power3.out'},a-.12);}`,
  panelOut: `(tl,p,b)=>{tl.to(p,{opacity:0,y:-22,filter:'blur(8px)',duration:.32,ease:'power2.in'},b-.32);}`,
  fxExtra: `lit:(e,t)=>tl.fromTo(e,{opacity:.86},{opacity:1,duration:.3,ease:'power2.out'},t),`,
  outroIn: `gsap.set('#outro',{opacity:0,filter:'blur(12px)'});tl.to('#outro',{opacity:1,filter:'blur(0px)',duration:.5,ease:'power3.out'},OUT-.1);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${SN};font-weight:800;font-size:60px;line-height:1.16;color:#FFFFFF;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 3px 0 #1A0E07,0 0 18px rgba(0,0,0,.85),3px 0 0 #1A0E07,-3px 0 0 #1A0E07,0 -3px 0 #1A0E07}
.w{display:inline-block;margin:0 .2em}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFFFFF",scale:1},{color:"${ACC}",scale:1.04,duration:.08,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFFFFF",scale:1,duration:.15},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{y:14},{y:0,duration:.18,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Rice Cooker", "#140C08");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
