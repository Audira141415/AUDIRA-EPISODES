// EP08 YUSUF DAN TUJUH SAPI. DATAPHYSICAL x ancient Egypt: brass and aluminium data sculptures on a Nile-side sandstone plinth,
// lapis and gold. Panels are engraved brass plates: they rise like a year-column (clip from the base) and slide off like a plate
// pulled from a rack. Arabic is read verbatim from the quran file. Run from this folder: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const GOLD = "#E8C26A", LAPIS = "#1F3A8A", NIGHT = "#0E1634", SANDC = "#EAD7B0", BG = "#141c40";

// Uthmani text straight from the research file (never retyped)
const QF = readFileSync("../_research/quran/EP08_yusuf.txt", "utf8");
const verse = (ref) => { const m = QF.split(/\r?\n/).find((l) => l.startsWith(ref + " | ")); if (!m) throw new Error("verse " + ref); return m.slice(ref.length + 3).trim(); };
const V4 = verse("QS 12:4"), V55 = verse("QS 12:55"), V47 = verse("QS 12:47");
const V47P = V47.slice(V47.indexOf("فَمَا")); // the bounded phrase "what you reap, leave it in its ears, except a little you eat"
if (V47P.length < 20) throw new Error("phrase");

const ref = (r, a) => `<span class="rf"${a ? ` data-at="${a}" data-fx="pop"` : ""}>${r}</span>`;

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="pl">
    <div class="k"><i></i>KISAH DALAM AL-QUR'AN &middot; 08</div>
    <div class="h">7 SAPI GEMUK,<br>7 SAPI KURUS</div>
    <div class="sub" data-at="s1:Mimpi" data-fx="up">Mimpi seorang raja yang menyelamatkan satu negeri dari kelaparan</div>
  </div>
</div>
<div class="p" data-in="s2" data-out="s2:Para">
  <div class="pl">
    <div class="k"><i></i>MIMPI RAJA MESIR ${ref("QS 12:43", "s2:mimpinya")}</div>
    <div class="ln" data-at="s2:tujuh" data-fx="up"><b class="n">7</b><span>sapi gemuk dimakan <b class="n al">7</b> sapi kurus</span></div>
    <div class="ln" data-at="s2:tujuh#3" data-fx="up"><b class="n gr">7</b><span>tangkai gandum hijau, <b class="n dr">7</b> lainnya kering</span></div>
  </div>
</div>
<div class="p" data-in="s2:Para" data-out="s3">
  <div class="pl">
    <div class="k"><i></i>JAWABAN PARA PEMUKA ${ref("QS 12:44", "s2:angkat")}</div>
    <div class="qt">&ldquo;Itu mimpi-mimpi yang kosong.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s3" data-out="s3:Sejak">
  <div class="pl">
    <div class="k"><i></i>SEORANG MANTAN TAHANAN TERINGAT ${ref("QS 12:45", "s3:teringat")}</div>
    <div class="h m">PANDAI<br>MENAKWILKAN MIMPI</div>
    <div class="nm" data-at="s3:Namanya" data-fx="up">Namanya <b>Yusuf</b></div>
  </div>
</div>
<div class="p" data-in="s3:Sejak" data-out="s4">
  <div class="pl">
    <div class="k"><i></i>MIMPI MASA KECIL ${ref("QS 12:4", "s3:bermimpi")}</div>
    <div class="ar">${V4}</div>
    <div class="qt s" data-at="s3:sebelas" data-fx="up">&ldquo;Aku melihat sebelas bintang, matahari dan bulan; kulihat semuanya sujud kepadaku.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s4" data-out="s4:Hasil">
  <div class="pl">
    <div class="k"><i></i>SEBUAH RENCANA ${ref("QS 12:47", "s4:rencana")}</div>
    <div class="h m">BERCOCOK TANAM<br><b class="n">7</b> TAHUN</div>
    <div class="sub" data-at="s4:seperti" data-fx="up">seperti biasa</div>
  </div>
</div>
<div class="p" data-in="s4:Hasil" data-out="s5">
  <div class="pl">
    <div class="k"><i></i>SIMPAN DI TANGKAINYA ${ref("QS 12:47", "s4:biarkan")}</div>
    <div class="ar sm">${V47P}</div>
    <div class="qt s" data-at="s4:kecuali" data-fx="up">&hellip;kecuali sedikit untuk dimakan.</div>
  </div>
</div>
<div class="p" data-in="s5" data-out="s5:Karena">
  <div class="pl note">
    <div class="k"><i></i>CATATAN IBNU KATSIR ${ref("TAFSIR QS 12:47", "s5:Ibnu")}</div>
    <div class="h s">Kenapa di tangkainya?</div>
    <div class="qt s" data-at="s5:supaya" data-fx="up">Supaya gandum lebih awet dan tetap baik lebih lama.</div>
  </div>
</div>
<div class="p" data-in="s5:Karena" data-out="s6">
  <div class="pl cool">
    <div class="k"><i></i>LALU DATANG ${ref("QS 12:48", "s5:datang")}</div>
    <div class="h m"><b class="n al">7</b> TAHUN<br>SANGAT SULIT</div>
    <div class="sub" data-at="s5:menghabiskan" data-fx="up">menghabiskan simpanan, kecuali sedikit untuk bibit</div>
  </div>
</div>
<div class="p" data-in="s6" data-out="s6:Mimpi">
  <div class="pl rain">
    <div class="k"><i></i>TAHUN KE-15 ${ref("QS 12:49", "s6:hujan")}</div>
    <div class="h m">TAHUN<br>PENUH HUJAN</div>
    <div class="sub" data-at="s6:memeras" data-fx="up">orang kembali memeras anggur</div>
  </div>
</div>
<div class="p" data-in="s6:Mimpi" data-out="s7">
  <div class="pl">
    <div class="k"><i></i>MIMPI TENTANG SAPI ADALAH</div>
    <div class="eq"><b class="n">7</b><em>+</em><b class="n al">7</b><em>=</em><b class="n big ct" data-at="s6:empat" data-fx="pop" data-from="0" data-to="14" data-a="s6:empat" data-d="0.5">14</b></div>
    <div class="h s">TAHUN RENCANA</div>
  </div>
</div>
<div class="p" data-in="s7" data-out="s7:Setelah">
  <div class="pl">
    <div class="k"><i></i>RAJA INGIN BERTEMU ${ref("QS 12:50", "s7:menolak")}</div>
    <div class="h s">Yusuf menolak keluar sebelum namanya dibersihkan</div>
  </div>
</div>
<div class="p" data-in="s7:Setelah" data-out="s7:jadikan">
  <div class="pl">
    <div class="k"><i></i>NAMA DIBERSIHKAN ${ref("QS 12:51", "s7:terbukti")}</div>
    <div class="h m">TERBUKTI<br>TIDAK BERSALAH</div>
  </div>
</div>
<div class="p" data-in="s7:jadikan" data-out="s8">
  <div class="pl">
    <div class="k"><i></i>PERMINTAAN YUSUF ${ref("QS 12:55", "s7:bendaharawan")}</div>
    <div class="ar sm">${V55}</div>
    <div class="qt s" data-at="s7:bendaharawan" data-fx="up">&ldquo;Jadikanlah aku <span class="hl">bendaharawan negeri</span>; aku pandai menjaga dan berpengetahuan.&rdquo;</div>
  </div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="pl">
    <div class="k"><i></i>MUSIM PANEN, MUSIM KERING</div>
    <div class="qt">Mimpi diselesaikan dengan rencana, bukan sekadar harapan.</div>
    <div class="ask" data-at="s8:sudahkah" data-fx="up">Sudahkah kamu menyimpan untuk musim kering?</div>
  </div>
</div>`;

const css = `
.p{left:56px;right:96px}
.pl{position:relative;padding:22px 30px 26px;background:linear-gradient(165deg,rgba(20,34,82,.9),rgba(10,16,40,.9));box-shadow:0 18px 40px rgba(0,0,0,.35),inset 0 0 0 2px rgba(232,194,106,.85),inset 0 0 0 7px rgba(14,22,52,.9),inset 0 0 0 8px rgba(232,194,106,.35)}
.pl:before{content:"";position:absolute;left:0;right:0;top:0;height:8px;background:linear-gradient(90deg,#8a6a2a,#f5dc94 30%,#b88a3a 55%,#f0d488 80%,#8a6a2a)}
.pl:after{content:"";position:absolute;left:14px;bottom:12px;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff3c4,#a07a2a);box-shadow:calc(100% * 0) 0 0 #000}
.pl.cool{background:linear-gradient(165deg,rgba(52,62,80,.9),rgba(24,30,44,.9));box-shadow:0 18px 40px rgba(0,0,0,.35),inset 0 0 0 2px rgba(214,222,232,.85),inset 0 0 0 7px rgba(30,36,50,.9),inset 0 0 0 8px rgba(214,222,232,.35)}
.pl.cool:before{background:linear-gradient(90deg,#7a848e,#f2f6fa 30%,#9aa4ae 55%,#e6ecf2 80%,#7a848e)}
.pl.rain{background:linear-gradient(165deg,rgba(24,52,110,.9),rgba(12,26,60,.9))}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:"Josefin Sans",sans-serif;font-weight:700;font-size:25px;letter-spacing:.16em;color:${SANDC};margin-bottom:12px}
.k i{display:block;width:14px;height:14px;background:${GOLD};transform:rotate(45deg)}
.h{font-family:Cinzel,serif;font-weight:800;font-size:74px;line-height:1.04;letter-spacing:.01em;color:${GOLD};text-shadow:0 2px 0 rgba(90,60,10,.6)}
.h.m{font-size:64px}
.h.s{font-size:46px;line-height:1.14;color:#F6E6BC}
.n{font-family:Cinzel,serif;font-weight:900;color:${GOLD}}
.n.al{color:#DDE4EC}.n.gr{color:#8FD07A}.n.dr{color:#C9B27A}
.sub{font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:36px;line-height:1.2;color:#F2E2B8;margin-top:10px}
.qt{font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:46px;line-height:1.2;color:#FFF6DD}
.qt.s{font-size:36px;line-height:1.26;color:#F2E2B8;margin-top:6px}
.rf{display:inline-block;font-family:"Josefin Sans",sans-serif;font-weight:700;font-size:22px;letter-spacing:.08em;color:${NIGHT};background:linear-gradient(180deg,#f7e2a2,#c49a44);padding:6px 12px 4px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 0 #6a4a14}
.ln{display:flex;align-items:center;gap:20px;padding:10px 0;border-top:1.5px solid rgba(232,194,106,.35)}
.ln>b.n{font-size:84px;line-height:1;min-width:62px;text-align:center}
.ln span{font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:38px;line-height:1.18;color:#FFF6DD}
.ln span b.n{font-size:44px}
.nm{margin-top:10px;font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:40px;color:#F2E2B8}
.nm b{font-family:Cinzel,serif;font-weight:800;color:${GOLD};font-size:52px;margin-left:8px}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:52px;line-height:1.75;color:#F6E2A6;margin:2px 0 6px}
.ar.sm{font-size:48px;line-height:1.7}
.eq{display:flex;align-items:baseline;gap:22px;margin:4px 0 6px}
.eq .n{font-size:120px;line-height:1}
.eq .n.big{font-size:150px;text-shadow:0 0 30px rgba(232,194,106,.45)}
.eq em{font-family:Cinzel,serif;font-style:normal;font-weight:700;font-size:80px;color:#F6E6BC}
.hl{color:${GOLD};font-weight:700}
.ask{margin-top:14px;font-family:Cinzel,serif;font-weight:700;font-size:40px;line-height:1.2;color:${NIGHT};background:linear-gradient(180deg,#f7e2a2,#c49a44);padding:12px 18px;display:inline-block}
.note .h.s{color:${GOLD}}
`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:dimakan", "s1:kurus", "s1:menyelamatkan", "s2:menceritakan", "s2:sapi", "s2:kurus", "s2:dimakan", "s2:tangkai", "s2:lainnya", "s2:kering",
  "s2:Para", "s2:angkat", "s2:kosong", "s3:teringat", "s3:penjara", "s3:Namanya", "s3:sebelas", "s3:matahari", "s3:bulan", "s3:bersujud",
  "s4:rencana", "s4:Bercocok", "s4:Yusuf", "s4:tangkainya", "s4:dimakan", "s5:Ibnu", "s5:awet", "s5:Karena", "s5:datang", "s5:bibit", "s5:supaya", "s5:lama",
  "s6:hujan", "s6:memeras", "s6:kembali", "s6:anggur", "s6:Mimpi", "s6:empat", "s7:Raja", "s7:menolak", "s7:dibersihkan", "s7:terbukti", "s7:bersalah",
  "s7:meminta", "s7:jadikan", "s7:bendaharawan", "s7:negeri", "s7:menjaga", "s7:berpengetahuan", "s8:panen"];
const { AT, K } = writeWorld(TL, at, {
  ep: "08", bg: BG, vig: 0.4, grain: 0.06, capfloor: 0.45, html, css, chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Josefin Sans,sans-serif", chipColor: "#F2E2B8",
  extraAt: WORLD_AT,
  // Column rise in (clipped from the base upward, like a year-column filling), brass plate slide out (pulled sideways off the rack).
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(100% 0% 0% 0%)',y:46,opacity:1},{clipPath:'inset(0% 0% 0% 0%)',y:0,opacity:1,duration:.55,ease:'power3.out'},a-.16)`,
  panelOut: `(tl,p,b)=>tl.to(p,{x:-140,clipPath:'inset(0% 0% 0% 22%)',opacity:0,duration:.32,ease:'power2.in'},b-.3)`,
  outroIn: `gsap.set('#outro',{clipPath:'inset(100% 0% 0% 0%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.7,ease:'power3.inOut'},OUT-.15);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:100px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:"Josefin Sans",sans-serif;font-weight:700;font-size:58px;line-height:1.3;color:#FFF6DD;text-shadow:0 3px 10px rgba(0,0,0,.85),0 0 3px rgba(0,0,0,.9)}
.w{display:inline-block;margin:0 .08em;padding:.04em .12em 0;border-radius:.1em;background:rgba(31,58,138,0)}`,
(id, w) => `tl.fromTo("#${id}",{color:"#FFF6DD",backgroundColor:"rgba(31,58,138,0)"},{color:"${GOLD}",backgroundColor:"rgba(31,58,138,.92)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#FFF6DD",backgroundColor:"rgba(31,58,138,0)",duration:.12},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.24,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Yusuf dan Tujuh Sapi", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
