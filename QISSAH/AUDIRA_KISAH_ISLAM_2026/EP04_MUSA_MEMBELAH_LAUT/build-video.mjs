// EP04 MUSA MEMBELAH LAUT. INKSTORY: sumi-e ink wash on rice paper, deep indigo water, vermilion seal stamps for verse references.
// Panels are rice-paper slips that arrive with a brush wipe and bleed out like wet ink. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#15161A", INDIGO = "#1C2A58", VERM = "#C23B2A", PAPER = "#F5EFE1", BG = "#EFE7D6";

const stamp = (ref, a) => `<span class="st" data-at="${a}" data-fx="stamp">${ref}</span>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="card">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 04</div>
    <div class="h">LAUT DI DEPAN,<br>PASUKAN DI BELAKANG</div>
    <div class="row" data-at="s1:sekali-kali" data-fx="ink"><div class="qt">&ldquo;Sekali-kali tidak.&rdquo;</div>${stamp("QS 26:62", "s1:tidak")}</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Allah">
  <div class="card">
    <div class="k"><i></i>MESIR</div>
    <div class="h m">BANI ISRAIL<br>HIDUP TERTINDAS</div>
  </div>
</div>
<div class="p" data-in="s2:Allah" data-out="s3">
  <div class="card">
    <div class="k"><i></i>WAHYU, PADA MALAM HARI ${stamp("QS 26:52", "s2:surah")}</div>
    <div class="ar sm">أَنْ أَسْرِ بِعِبَادِىٓ إِنَّكُم مُّتَّبَعُونَ</div>
    <div class="qt" data-at="s2:pergilah" data-fx="ink">&ldquo;Pergilah malam hari bersama hamba-hamba-Ku, karena kalian pasti dikejar.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Katanya">
  <div class="card">
    <div class="k"><i></i>FIRAUN MENGUMPULKAN PASUKAN ${stamp("QS 26:53", "s3:kota-kota")}</div>
    <div class="h m">DARI KOTA<br>KE KOTA</div>
  </div>
</div>
<div class="p" data-in="s3:Katanya" data-out="s3:Saat">
  <div class="card">
    <div class="k"><i></i>KATA FIRAUN ${stamp("QS 26:54", "s3:sekelompok")}</div>
    <div class="qt big">&ldquo;Mereka cuma sekelompok kecil.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3:Saat" data-out="s4">
  <div class="card">
    <div class="k"><i></i>PENGEJARAN ${stamp("QS 26:60", "s3:terbit")}</div>
    <div class="h m">SAAT MATAHARI<br>TERBIT</div>
    <div class="sub" data-at="s3:pasukan#2" data-fx="ink">pasukan itu berhasil menyusul</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Musa#2">
  <div class="card">
    <div class="k"><i></i>KEDUA GOLONGAN SALING MELIHAT ${stamp("QS 26:61", "s4:panik")}</div>
    <div class="qt big">&ldquo;Kita benar-benar akan tersusul.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4:Musa#2" data-out="s5">
  <div class="card">
    <div class="k"><i></i>JAWABAN YANG TENANG ${stamp("QS 26:62", "s4:sesungguhnya")}</div>
    <div class="ar sm" data-at="s4:sesungguhnya" data-fx="ink">كَلَّآ ۖ إِنَّ مَعِىَ رَبِّى سَيَهْدِينِ</div>
    <div class="qt" data-at="s4:Tuhanku" data-fx="ink">&ldquo;Sesungguhnya Tuhanku bersamaku, Dia akan memberi petunjuk kepadaku.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Laut">
  <div class="card">
    <div class="k"><i></i>WAHYU ${stamp("QS 26:63", "s5:pukullah")}</div>
    <div class="qt big">&ldquo;Pukullah laut itu dengan tongkatmu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s5:Laut" data-out="s5:Surah">
  <div class="card cal">
    <div class="k"><i></i>LAUT TERBELAH ${stamp("QS 26:63", "s5:Setiap")}</div>
    <div class="ar">فَٱنفَلَقَ فَكَانَ كُلُّ فِرْقٍ كَٱلطَّوْدِ ٱلْعَظِيمِ</div>
    <div class="qt" data-at="s5:seperti" data-fx="ink">Setiap belahan seperti gunung yang besar.</div>
  </div>
</div>
<div class="p" data-in="s5:Surah" data-out="s6">
  <div class="card">
    <div class="k"><i></i>SURAH THAHA ${stamp("QS 20:77", "s5:Thaha")}</div>
    <div class="h m">JALAN YANG<br>KERING</div>
    <div class="sub" data-at="s5:terbuka" data-fx="ink">terbuka di tengah laut</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Saat">
  <div class="card">
    <div class="k"><i></i>MENYEBERANG</div>
    <div class="ln"><b>Bani Israil selamat</b>${stamp("QS 26:65", "s6:selamat")}</div>
    <div class="ln" data-at="s6:ombak" data-fx="ink"><b>Firaun dan pasukannya digulung ombak</b>${stamp("QS 20:78", "s6:menggulung")}</div>
  </div>
</div>
<div class="p" data-in="s6:Saat" data-out="s7">
  <div class="card">
    <div class="k"><i></i>SAAT HAMPIR TENGGELAM ${stamp("QS 10:90", "s6:berkata")}</div>
    <div class="qt">&ldquo;Aku percaya tidak ada tuhan selain Tuhan yang dipercayai Bani Israil.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Menariknya">
  <div class="card">
    <div class="k"><i></i>PENGAKUAN YANG TERLAMBAT ${stamp("QS 10:92", "s7:berfirman")}</div>
    <div class="ar sm">فَٱلْيَوْمَ نُنَجِّيكَ بِبَدَنِكَ لِتَكُونَ لِمَنْ خَلْفَكَ ءَايَةً</div>
    <div class="qt" data-at="s7:hari" data-fx="ink">&ldquo;Hari ini Kami selamatkan jasadmu, agar menjadi pelajaran bagi orang-orang sesudahmu.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s7:Menariknya" data-out="s8">
  <div class="card nm">
    <div class="cart"><i></i></div>
    <div><div class="k"><i></i>MENARIKNYA</div>
    <div class="h s">Al-Qur'an tidak menyebut nama pribadi Firaun</div></div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="card">
    <div class="k"><i></i>LANGKAH PERTAMA</div>
    <div class="qt">Jalan keluar sering baru terlihat setelah langkah pertama diambil.</div>
    <div class="ask" data-at="s8:Kalau" data-fx="ink">Ikut panik, atau ikut yakin?</div>
  </div>
</div>`;

const css = `
#vig{background:radial-gradient(ellipse at 50% 45%,rgba(60,50,40,0) 55%,rgba(60,50,40,.28) 100%)}
#capfloor{background:linear-gradient(180deg,rgba(239,231,214,0),rgba(239,231,214,.78) 40%,rgba(239,231,214,.78) 72%,rgba(239,231,214,0))}
.p{--wp:0;mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.6) 44%,rgba(0,0,0,0) 56%);-webkit-mask-image:linear-gradient(100deg,#000 0 38%,rgba(0,0,0,.6) 44%,rgba(0,0,0,0) 56%);mask-size:300% 100%;-webkit-mask-size:300% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:calc(var(--wp) * 1%) 0;-webkit-mask-position:calc(var(--wp) * 1%) 0}
.card{position:relative;background:rgba(245,239,225,.93);padding:22px 30px 26px;box-shadow:0 14px 34px rgba(50,40,30,.16),inset 0 0 0 1.5px rgba(21,22,26,.55),inset 0 0 0 7px rgba(245,239,225,.93),inset 0 0 0 8px rgba(21,22,26,.25)}
.card:before{content:"";position:absolute;left:18px;right:40%;top:-7px;height:12px;background:${INK};border-radius:40% 60% 50% 45%/60% 40% 60% 40%;opacity:.88}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Shippori Mincho",serif;font-weight:700;font-size:25px;letter-spacing:.14em;color:#4a4a50;margin-bottom:12px}
.k i{display:block;width:16px;height:16px;background:${VERM};transform:rotate(45deg)}
.h{font-family:"Shippori Mincho",serif;font-weight:800;font-size:76px;line-height:1.02;color:${INK};letter-spacing:.01em}
.h.m{font-size:70px}
.h.s{font-size:52px;line-height:1.12}
.qt{font-family:"Cormorant Garamond",serif;font-weight:600;font-style:italic;font-size:44px;line-height:1.18;color:${INK}}
.qt.big{font-size:60px;line-height:1.08}
.sub{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:38px;color:${INDIGO};margin-top:8px}
.row{display:flex;align-items:center;gap:20px;margin-top:16px}
.st{display:inline-block;font-family:"Shippori Mincho",serif;font-weight:800;font-size:24px;letter-spacing:.06em;color:#FBF3E4;background:${VERM};padding:6px 12px 5px;border-radius:3px;box-shadow:inset 0 0 0 2px rgba(251,243,228,.5);transform:rotate(-3deg);white-space:nowrap}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:70px;line-height:1.55;color:${INDIGO};margin:4px 0 8px}
.ar.sm{font-size:54px;line-height:1.5}
.cal .qt{font-size:42px}
.ln{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-top:1.5px solid rgba(21,22,26,.22)}
.ln b{font-family:"Shippori Mincho",serif;font-weight:800;font-size:40px;line-height:1.15;color:${INK}}
.nm{display:flex;align-items:center;gap:26px}
.cart{flex:none;width:110px;height:230px;border:6px solid ${INK};border-radius:55px;position:relative}
.cart i{position:absolute;left:-14px;right:-14px;bottom:-22px;height:8px;background:${INK}}
.ask{margin-top:14px;font-family:"Shippori Mincho",serif;font-weight:800;font-size:46px;color:#FBF3E4;background:${INDIGO};padding:10px 18px;display:inline-block}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Pengikut", "s1:menjawab", "s1:sekali-kali", "s2:pergilah", "s2:dikejar", "s3:mengumpulkan", "s3:kecil", "s3:terbit", "s3:menyusul",
  "s4:Pengikut", "s4:tenang", "s4:petunjuk", "s5:tongkatmu", "s5:terbelah", "s5:belahan", "s5:gunung", "s5:besar", "s5:jalan", "s6:Firaun", "s6:menyusul",
  "s6:mereka", "s6:tuhan", "s7:terlambat", "s7:Kami", "s7:pelajaran", "s8:langkah", "s5:pukullah", "s3:Saat", "s3:kota-kota", "s3:Katanya", "s4:Musa#2", "s4:Tuhanku",
  "s6:ombak", "s6:Saat", "s6:selamat", "s7:Menariknya", "s8:Kalau", "s2:Allah"];
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.28, grain: 0.09, capfloor: 0, html, css, chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Shippori Mincho,serif", chipColor: INK,
  extraAt: WORLD_AT,
  fxExtra: `ink:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,filter:'blur(9px)',y:10},{opacity:1,filter:'blur(0px)',y:0,duration:.5,ease:'power2.out'},t);},`,
  // Brush wipe in (a soft-edged mask sweeps left to right, the ink still wet), bleed out (blur and fade like ink soaking into paper).
  panelIn: `(tl,p,a)=>tl.fromTo(p,{'--wp':100,opacity:1,filter:'blur(6px)'},{'--wp':0,opacity:1,filter:'blur(0px)',duration:.6,ease:'power2.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,filter:'blur(12px)',scale:1.02,duration:.34,ease:'power1.in'},b-.32)`,
  outroIn: `gsap.set('#outro',{clipPath:'circle(0% at 50% 42%)'});tl.to('#outro',{clipPath:'circle(150% at 50% 42%)',duration:.8,ease:'power2.inOut'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Shippori Mincho",serif;font-weight:800;font-size:58px;line-height:1.32;color:${INK};text-shadow:0 0 14px rgba(245,239,225,.95),0 0 4px rgba(245,239,225,.95)}
.w{display:inline-block;margin:0 .1em;padding:0 .12em;border-radius:.12em;background:rgba(28,42,88,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",backgroundColor:"rgba(28,42,88,0)"},{color:"#FBF3E4",backgroundColor:"rgba(28,42,88,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${INK}",backgroundColor:"rgba(28,42,88,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Musa Membelah Laut", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
