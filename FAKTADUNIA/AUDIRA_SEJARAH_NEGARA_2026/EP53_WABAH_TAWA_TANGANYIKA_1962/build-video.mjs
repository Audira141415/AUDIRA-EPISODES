// EP53 WABAH TAWA TANGANYIKA 1962: WATERCOLOR. A gentle storybook diorama on cold-press paper: a mission girls' boarding
// school on the shore of Lake Victoria, red-earth paths through banana groves to the village of Nshamba, and a painted map
// board. Laughter is shown as rose sound-arcs and ripple rings, never as open mouths; the tone stays calm and respectful.
// Panels are deckled paper slips; station changes hide under a watercolor page turn.
// Batch-11 device: a brushstroke ripple map in the y≈1100–1280 band that blooms one stop per beat:
// SEKOLAH → ASRAMA → DESA → SEKOLAH LAIN → 14 SEKOLAH TUTUP.
// Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PAPER = "#FAF6EF", EDGE = "#ECE4D6", GR = "#3C3733", COB = "#4E7B9C", SAGE = "#6F9779", PINE = "#3F6449", ROSE = "#D7837C", ROSED = "#B8605A", OCH = "#E8AB48", EARTH = "#B8643E", BG = "#EFE7DA";
const HEADF = `Fraunces,Georgia,serif`, BODY = `Nunito,'Segoe UI',sans-serif`;

const row = (b, s, a, cls = "") => `<div class="row ${cls}" data-at="${a}" data-fx="ink"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const ct = (to, a, d = 0.9) => `<span class="ct nb" data-from="0" data-to="${to}" data-a="${a}" data-d="${d}">${to.toLocaleString("de-DE")}</span>`;
const turn = (a) => `<div class="pg" data-at="${a}" data-fx="turn"><i class="sp"></i><i class="bl"></i><i class="bl b2"></i></div>`;
const ic = {
  tear: `<svg viewBox="0 0 40 40"><path d="M20 4C25 14 30 20 30 26a10 10 0 0 1-20 0c0-6 5-12 10-22z" fill="#6FA0C8" stroke="${GR}" stroke-width="1.6"/></svg>`,
  rest: `<svg viewBox="0 0 40 40" fill="none" stroke="${OCH}" stroke-width="3.2" stroke-linecap="round"><path d="M5 12l7-5 7 6 7-6 9 5"/><path d="M5 22l7-5 7 6 7-6 9 5"/><path d="M5 32l7-5 7 6 7-6 9 5"/></svg>`,
  faint: `<svg viewBox="0 0 40 40" fill="none" stroke="#9C7A8E" stroke-width="3" stroke-linecap="round"><path d="M20 20m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-9 0a8 8 0 1 1 15 0a11 11 0 1 1-20 0"/></svg>`,
  breath: `<svg viewBox="0 0 40 40" fill="none" stroke="${COB}" stroke-width="3" stroke-linecap="round"><path d="M4 12q6-6 12 0t12 0t10 0"/><path d="M4 21q6-6 12 0t12 0t10 0"/><path d="M4 30q6-6 12 0t12 0t10 0"/></svg>`,
};
const sym = (k, label, a) => `<i class="sy" data-at="${a}" data-fx="chip">${ic[k]}${label}</i>`;
const dots = Array.from({ length: 159 }, (_, i) => `<i class="dt" id="d${i}"></i>`).join("");

// device: brushstroke ripple map
const DEV = [["SEKOLAH", "3 siswi", "s3:tiga"], ["ASRAMA", "tawa menular", "s3:menular"], ["DESA", "Nshamba", "s5:desa"], ["SEKOLAH LAIN", "±1.000 orang", "s6:seribu"], ["14 SEKOLAH", "ditutup", "s6:ditutup"]];
const DX = [92, 282, 472, 662, 852];
const dev = DEV.map(([b, s, a], i) => `<div class="dn" style="left:${DX[i] - 80}px" data-at="${a}" data-fx="bloom"><div class="dl"><b>${b}</b><span>${s}</span></div><i class="db"></i><i class="dr"></i><i class="dr r2"></i></div>`).join("");
const devLine = DEV.slice(1).map(([, , a], i) => `<i class="seg" style="left:${DX[i]}px;width:${DX[i + 1] - DX[i]}px" data-at="${a}-0.35" data-fx="grow"></i>`).join("");

let html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700&family=Nunito:wght@600;700;800;900&display=block">
<div class="pre"><span style="font-family:Fraunces;font-weight:700">Wabah 1962</span><span style="font-family:Fraunces;font-style:italic;font-weight:700">tawa</span><span style="font-family:Nunito;font-weight:800">AUDIRA 159</span><span style="font-family:Nunito;font-weight:700">a</span><span style="font-family:Nunito;font-weight:900">a</span></div>
${turn("s2:Tanganyika-0.42")}${turn("s2:ada-0.42")}${turn("s5:Ketika-0.42")}${turn("s6:Total-0.42")}${turn("s7:Tidak-0.42")}
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="kk">FAKTA SEJARAH NEGARA &middot; EP 53</div>
  <div class="h1">Wabah <em>tawa</em><br>Tanganyika 1962</div>
  <div class="chips"><i class="ch st" data-at="s1:empat" data-fx="stampc">14 SEKOLAH TUTUP</i><i class="ch sf" data-at="s1:tertawa" data-fx="chip">gejala: tawa yang tak bisa berhenti</i></div>
</div>
<div class="p" data-in="s2" data-out="s2:ada">
  <div class="kk">01 &middot; DI MANA?</div>
  ${row("TANGANYIKA", "kini bagian dari Tanzania", "s2:Tanganyika", "big")}
  ${row("MERDEKA 9 DESEMBER 1961", "beberapa minggu sebelum wabah", "s2:merdeka", "rs")}
</div>
<div class="p" data-in="s2:ada" data-out="s3">
  <div class="kk">02 &middot; KASHASHA, TEPI DANAU VICTORIA</div>
  ${row("SEKOLAH ASRAMA PUTRI", "milik misi &middot; siswi usia 12&ndash;18 tahun", "s2:asrama", "big")}
</div>
<div class="p" data-in="s3" data-out="s3:Dalam">
  <div class="kk">03 &middot; AWALNYA</div>
  <div class="date" data-at="s3:Januari" data-fx="ink"><b>30 Januari 1962</b><span>di kelas, siang hari</span></div>
  ${row(`${ct(3, "s3:tiga", 0.5)} SISWI MULAI TERTAWA`, "dan tidak bisa berhenti", "s3:tiga")}
  ${row("LALU MENULAR", "dari satu meja ke meja lain", "s3:menular", "rs")}
</div>
<div class="p" data-in="s3:Dalam" data-out="s4">
  <div class="kk">04 &middot; DALAM BEBERAPA MINGGU</div>
  <div class="tally" data-at="s3:Dalam" data-fx="ink"><b>${ct(95, "s3:Dalam", 2.3)}</b><em>dari</em><b class="of">159</b><span>siswi ikut terkena</span></div>
  <div class="dots" data-at="s3:Dalam" data-fx="ink">${dots}</div>
</div>
<div class="p" data-in="s4" data-out="s4:Serangannya">
  <div class="kk">05 &middot; BUKAN TAWA YANG MENYENANGKAN</div>
  <div class="sys">${sym("tear", "menangis", "s4:menangis")}${sym("rest", "gelisah", "s4:gelisah")}${sym("faint", "pingsan", "s4:pingsan")}${sym("breath", "sesak napas", "s4:sesak")}</div>
</div>
<div class="p" data-in="s4:Serangannya" data-out="s5">
  <div class="kk">06 &middot; LAMA SERANGAN</div>
  <div class="dur" data-at="s4:Serangannya" data-fx="ink"><div class="ends"><b>beberapa jam</b><b class="r">sampai ${ct(16, "s4:enam", 0.4)} hari</b></div><div class="bar"><i data-at="s4:jam" data-fx="grow"></i></div></div>
  ${row("PARA GURU: TIDAK TERKENA", "sama sekali", "s4:guru", "ok")}
</div>
<div class="p" data-in="s5" data-out="s5:Di">
  <div class="kk">07 &middot; MARET 1962</div>
  <div class="st2" data-at="s5:ditutup" data-fx="stampc">SEKOLAH DITUTUP</div>
  ${row("SISWI PULANG KE DESA", "dan wabahnya ikut pulang", "s5:pulang", "rs")}
</div>
<div class="p" data-in="s5:Di" data-out="s5:Ketika">
  <div class="kk">08 &middot; DESA NSHAMBA</div>
  ${row(`${ct(217, "s5:Nshamba", 1.3)} ORANG`, "ikut terkena, kebanyakan anak muda", "s5:dua", "big")}
</div>
<div class="p" data-in="s5:Ketika" data-out="s6">
  <div class="kk">09 &middot; SEKOLAH DIBUKA LAGI</div>
  ${row(`${ct(57, "s5:Ketika", 2.3)} SISWI`, "kembali tertawa", "s5:lima", "big")}
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="kk">10 &middot; TOTALNYA</div>
  ${row(`&plusmn;${ct(1000, "s6:Total", 0.8)} ORANG`, "terdampak", "s6:seribu", "big")}
  ${row(`${ct(14, "s6:empat", 0.5)} SEKOLAH DITUTUP`, "", "s6:empat", "rs")}
  ${row(`&plusmn;${ct(18, "s6:delapan", 0.5)} BULAN`, "baru wabah mereda", "s6:delapan")}
</div>
<div class="p" data-in="s7" data-out="s7:Di">
  <div class="kk">11 &middot; PENYEBABNYA?</div>
  <div class="mm"><i class="no" data-at="s7:virus" data-fx="chip">virus? <s>tidak ditemukan</s></i><i class="no" data-at="s7:racun" data-fx="chip">racun? <s>tidak ditemukan</s></i></div>
  <div class="dx" data-at="s7:penyakit" data-fx="ink"><b>penyakit psikogenik massal</b>
    <div class="fl"><span class="c1">stres menumpuk</span><i>&rarr;</i><span class="c2">tubuh bereaksi nyata</span></div></div>
  <div class="nt" data-at="s7:nyata" data-fx="ink">bukan pura-pura, bukan &ldquo;kesurupan&rdquo;, bukan bahan lelucon</div>
</div>
<div class="p" data-in="s7:Di" data-out="s8">
  <div class="kk">12 &middot; TEKANAN DI NEGARA YANG BARU MERDEKA</div>
  ${row("HARAPAN TINGGI", "untuk generasi pertama yang bersekolah", "s7:harapan")}
  <div class="vs" data-at="s7:benturan" data-fx="ink"><span class="a">aturan sekolah misi</span><i>&harr;</i><span class="b">adat di rumah</span></div>
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  <div class="kk">PELAJARANNYA</div>
  <div class="h2">Tawa yang menular<br><em>bisa jadi sinyal tubuh</em></div>
  <div class="ch sf ss" data-at="s8:beres" data-fx="chip">&ldquo;ada yang tidak beres&rdquo;</div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="kk">GILIRAN KAMU</div>
  <div class="q">Bentuk stres apa yang menular di sekitar kita? <em>Tulis di komentar.</em></div>
</div>
<div id="dev" data-at="s3:tiga" data-fx="fade">
  <svg class="br" viewBox="0 0 960 40" preserveAspectRatio="none"><path d="M60 22 C 260 12, 520 30, 900 18" stroke="${EDGE}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".9"/></svg>
  ${devLine}${dev}
</div>`;

const paper = `linear-gradient(174deg,#FFFCF6,${PAPER} 55%,#F1E9DB)`;
const deckle = `clip-path:polygon(0 3%,4% 0,30% 2%,62% 0,96% 2%,100% 0,99% 50%,100% 97%,70% 100%,38% 98%,6% 100%,0 96%,1% 50%)`;
const sh = `box-shadow:0 14px 30px rgba(70,52,34,.28),0 2px 4px rgba(70,52,34,.18)`;
const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.pg{position:absolute;inset:0;z-index:14;pointer-events:none;overflow:hidden;background:${paper};backface-visibility:hidden;box-shadow:0 0 80px rgba(60,40,20,.5)}
.pg .sp{position:absolute;left:0;top:0;bottom:0;width:180px;background:linear-gradient(90deg,rgba(90,64,40,.32),rgba(90,64,40,0))}
.pg .bl{position:absolute;left:50%;top:44%;width:980px;height:980px;margin:-490px 0 0 -490px;border-radius:47% 53% 44% 56%/52% 45% 55% 48%;background:radial-gradient(circle at 46% 50%,rgba(184,100,62,0) 0 22%,rgba(184,100,62,.42) 48%,rgba(232,171,72,.22) 62%,rgba(232,171,72,0) 72%)}
.pg .b2{width:700px;height:700px;margin:-350px 0 0 -350px;top:58%;left:38%;background:radial-gradient(circle,rgba(111,151,121,0) 0 30%,rgba(111,151,121,.42) 52%,rgba(111,151,121,0) 70%)}
.kk{display:inline-block;font-family:${BODY};font-weight:800;font-size:25px;letter-spacing:.12em;color:${PAPER};background:${EARTH};padding:8px 18px 7px;margin-bottom:14px;${sh};${deckle}}
.h1{display:inline-block;background:${paper};padding:8px 32px 18px;${sh};font-family:${HEADF};font-weight:700;font-size:96px;line-height:1.0;color:${GR};${deckle}}
.h1 em{font-style:italic;color:${ROSED}}
.h2{display:inline-block;background:${paper};padding:6px 28px 14px;${sh};font-family:${HEADF};font-weight:700;font-size:70px;line-height:1.04;color:${GR};${deckle}}
.h2 em{font-style:italic;color:${ROSED};font-size:58px}
.chips{display:flex;flex-direction:column;align-items:flex-start;gap:12px;margin-top:16px}
.ch{font-style:normal;font-family:${BODY};font-weight:800;font-size:40px;padding:8px 22px 10px;${sh};display:inline-block}
.ch.st{color:${PAPER};background:${ROSED};transform:rotate(-2deg);font-weight:900;font-size:48px;letter-spacing:.03em}
.ch.sf{color:${GR};background:${paper};font-family:${HEADF};font-style:italic;font-weight:700;font-size:40px;${deckle}}
.ch.ss{margin-top:16px}
.row{display:flex;flex-direction:column;margin-top:14px;padding:12px 26px 14px;background:${paper};border-left:10px solid ${COB};${sh};width:max-content;max-width:900px;box-sizing:border-box;${deckle}}
.row b{font-family:${BODY};font-weight:900;font-size:50px;line-height:1.05;color:${COB};letter-spacing:.01em}
.row span{font-family:${HEADF};font-style:italic;font-weight:600;font-size:34px;line-height:1.2;color:${GR};margin-top:4px}
.row.big b{font-size:62px}.row.rs{border-left-color:${ROSED}}.row.rs b{color:${ROSED}}.row.ok{border-left-color:${SAGE}}.row.ok b{color:${PINE}}
.ct{font-variant-numeric:lining-nums tabular-nums}
.row b .ct,.tally b .ct,.dur b .ct{display:inline;font:inherit;color:inherit;margin:0;letter-spacing:inherit}
.date{display:block;margin-top:4px;padding:10px 26px 14px;background:${COB};color:${PAPER};${sh};width:max-content;${deckle}}
.date b{display:block;font-family:${HEADF};font-weight:700;font-size:58px;line-height:1.05}
.date span{display:block;font-family:${HEADF};font-style:italic;font-weight:600;font-size:30px;color:#E6EEF4}
.tally{display:flex;align-items:baseline;flex-wrap:wrap;gap:14px;background:${paper};padding:10px 28px 14px;${sh};width:max-content;${deckle}}
.tally b{font-family:${BODY};font-weight:900;font-size:120px;line-height:1;color:${ROSED}}.tally b.of{color:${COB};font-size:92px}
.tally em{font-family:${HEADF};font-style:italic;font-weight:600;font-size:46px;color:${GR}}
.tally span{flex-basis:100%;font-family:${HEADF};font-style:italic;font-weight:600;font-size:34px;color:${GR};margin-top:-4px}
.dots{display:flex;flex-wrap:wrap;gap:6px;width:810px;margin-top:14px;padding:16px 20px;background:rgba(250,246,239,.92);${sh};${deckle}}
.dt{display:block;width:21px;height:21px;border-radius:50%;border:2px solid rgba(78,123,156,.55);box-sizing:border-box}
.dt.on{background:radial-gradient(circle at 40% 35%,#E7A39C,${ROSED});border-color:${ROSED}}
.sys{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.sy{display:flex;align-items:center;gap:14px;font-style:normal;font-family:${HEADF};font-style:italic;font-weight:700;font-size:48px;color:${GR};background:${paper};padding:8px 26px 10px 14px;${sh};${deckle}}
.sy svg{width:56px;height:56px}
.dur{background:${paper};padding:14px 26px 20px;${sh};width:820px;box-sizing:border-box;${deckle}}
.dur .ends{display:flex;justify-content:space-between}.dur b{font-family:${BODY};font-weight:800;font-size:38px;color:${COB}}.dur b.r{color:${ROSED}}
.dur .bar{position:relative;height:22px;margin-top:12px;border-radius:11px;background:rgba(60,55,51,.1);overflow:hidden}
.dur .bar i{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,#9DB5C4,${ROSE} 60%,${ROSED})}
.st2{display:inline-block;font-family:${BODY};font-weight:900;font-size:58px;letter-spacing:.06em;padding:8px 24px;color:${ROSED};border:6px double ${ROSED};background:rgba(250,246,239,.95);transform:rotate(-3deg);${sh}}
.mm{display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.no{font-style:normal;font-family:${BODY};font-weight:800;font-size:40px;color:${GR};background:${paper};padding:6px 22px 8px;${sh};${deckle}}
.no s{color:${ROSED};text-decoration:none;font-family:${HEADF};font-style:italic;font-weight:700}
.dx{margin-top:14px;padding:14px 26px 18px;background:${COB};${sh};width:max-content;max-width:900px;${deckle}}
.dx b{display:block;font-family:${HEADF};font-style:italic;font-weight:700;font-size:56px;line-height:1.05;color:${PAPER}}
.dx .fl{display:flex;align-items:center;gap:14px;margin-top:12px}
.dx .fl span{font-family:${BODY};font-weight:800;font-size:34px;padding:6px 16px;border-radius:8px}
.dx .c1{background:${PAPER};color:${ROSED}}.dx .c2{background:${OCH};color:${GR}}.dx .fl i{font-style:normal;font-family:${BODY};font-weight:900;font-size:40px;color:${PAPER}}
.nt{margin-top:12px;font-family:${HEADF};font-style:italic;font-weight:600;font-size:32px;color:${GR};background:rgba(250,246,239,.94);padding:8px 20px;width:max-content;max-width:880px;${sh}}
.vs{display:flex;align-items:center;gap:14px;margin-top:16px}
.vs span{font-family:${BODY};font-weight:900;font-size:40px;padding:12px 22px;color:${PAPER};${sh};${deckle}}
.vs .a{background:${COB}}.vs .b{background:${ROSED}}.vs i{font-style:normal;font-family:${BODY};font-weight:900;font-size:54px;color:${GR}}
.q{margin-top:16px;font-family:${HEADF};font-style:italic;font-weight:700;font-size:56px;line-height:1.08;padding:16px 26px 20px;color:${PAPER};background:${ROSED};border-bottom:8px solid ${OCH};max-width:900px;${sh}}
.q em{display:block;margin-top:10px;font-size:42px;color:#FFE9C8}
#dev{position:absolute;left:30px;top:1100px;width:960px;height:180px;z-index:10}
#dev .br{position:absolute;left:0;top:118px;width:960px;height:40px}
#dev .seg{position:absolute;top:132px;height:10px;border-radius:6px;background:linear-gradient(90deg,${ROSE},${ROSED});transform-origin:0 50%;opacity:.85}
.dn{position:absolute;top:0;width:160px;height:180px}
.dn .dl{position:absolute;left:4px;top:0;width:152px;box-sizing:border-box;padding:8px 6px 9px;text-align:center;background:${paper};${sh};${deckle}}
.dn .dl b{display:block;font-family:${BODY};font-weight:900;font-size:22px;line-height:1.05;color:${GR};letter-spacing:.02em}
.dn .dl span{display:block;font-family:${HEADF};font-style:italic;font-weight:600;font-size:20px;line-height:1.1;color:${ROSED};margin-top:3px}
.dn .db{position:absolute;left:58px;top:110px;width:44px;height:44px;border-radius:47% 53% 41% 59%/55% 44% 56% 45%;background:radial-gradient(circle at 40% 36%,#F2B9AF 0 18%,${ROSE} 45%,${ROSED} 100%);box-shadow:0 0 0 3px rgba(250,246,239,.9),0 6px 12px rgba(70,52,34,.35)}
.dn .dr{position:absolute;left:30px;top:82px;width:100px;height:100px;border-radius:50%;border:4px solid ${ROSE};opacity:0;box-sizing:border-box}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("geo.js", "PROJECT/HyperFrames_Remotion/assets/lib/geo.js");
const { AT, K } = writeWorld(TL, at, {
  ep: "53", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0.0, html, css, chipFont: BODY, chipColor: GR, sig: "EP53_WABAH_TAWA_TANGANYIKA_1962",
  chip: "ILUSTRASI CAT AIR &middot; BUKAN FOTO SEJARAH",
  extraAt: ["s1:sekolah", "s1:tertawa", "s1:empat", "s2:Tanganyika", "s2:merdeka", "s2:Kashasha", "s2:Victoria", "s2:ada", "s2:asrama",
    "s3:tiga", "s3:menular", "s3:sembilan", "s3:Dalam", "s3:lima",
    "s4:menyenangkan", "s4:menangis", "s4:gelisah", "s4:pingsan", "s4:sesak", "s4:Serangannya", "s4:jam", "s4:enam", "s4:guru", "s4:sekali",
    "s5:ditutup", "s5:Para", "s5:pulang", "s5:desa", "s5:wabahnya", "s5:Di", "s5:Nshamba", "s5:dua", "s5:terkena", "s5:Ketika", "s5:lima",
    "s6:Total", "s6:sekitar", "s6:seribu", "s6:orang", "s6:empat", "s6:ditutup", "s6:delapan",
    "s7:virus", "s7:racun", "s7:penyakit", "s7:tubuh", "s7:nyata", "s7:menumpuk", "s7:Di", "s7:harapan", "s7:benturan", "s7:aturan", "s7:adat",
    "s8:beres", "s8:Menurut"],
  fxExtra: `ink:(e,t)=>{const d=e.dataset.d||(e.classList.contains('row')||e.classList.contains('tally')||e.classList.contains('vs')||e.classList.contains('dots')?'flex':'block');gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,y:18,filter:'blur(7px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.5,ease:'power2.out',immediateRender:false},t);},
 chip:(e,t)=>{const d=e.classList.contains('sy')?'flex':'inline-block';gsap.set(e,{display:'none'});tl.set(e,{display:d},t);tl.fromTo(e,{opacity:0,x:-24,filter:'blur(6px)'},{opacity:1,x:0,filter:'blur(0px)',duration:.45,ease:'power2.out',immediateRender:false},t);},
 stampc:(e,t)=>{tl.fromTo(e,{scale:1.9,rotation:-8,opacity:0},{scale:1,rotation:-2,opacity:1,duration:.22,ease:'power4.in',immediateRender:false},t);},
 bloom:(e,t)=>{gsap.set(e,{opacity:0});const b=e.querySelector('.db'),l=e.querySelector('.dl'),rs=e.querySelectorAll('.dr');tl.set(e,{opacity:1},t-.01);tl.fromTo(b,{scale:.1,opacity:0},{scale:1,opacity:1,duration:.55,ease:'back.out(1.6)',immediateRender:false},t);tl.fromTo(l,{opacity:0,y:-14},{opacity:1,y:0,duration:.4,ease:'power2.out',immediateRender:false},t+.12);rs.forEach((r,i)=>tl.fromTo(r,{scale:.3,opacity:.9},{scale:1.7,opacity:0,duration:1.3,ease:'power2.out',immediateRender:false},t+.1+i*.35));},
 turn:(e,t)=>{const b=e.querySelectorAll('.bl');gsap.set(e,{opacity:0,rotationY:86,transformPerspective:2600,transformOrigin:'0% 50%'});gsap.set(b,{scale:.25,opacity:0});
  tl.set(e,{opacity:1},t);tl.to(e,{rotationY:0,duration:.32,ease:'power2.in'},t);
  tl.to(b,{scale:1.3,opacity:1,duration:.6,ease:'power2.out',stagger:.06},t+.1);
  tl.to(e,{rotationY:-86,duration:.42,ease:'power2.inOut'},t+.41);tl.set(e,{opacity:0},t+.84);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:'power3.out'},a-.04)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-10,duration:.22,ease:'power2.in'},b-.22)`,
  hud: `(t)=>{const a=AT['s3:Dalam'],d=2.3;let n=t<AT['s3:tiga']?0:t<a?3:Math.round(95*(1-Math.pow(1-Math.min(1,Math.max(0,(t-a)/d)),3)));n=Math.max(n,t>=AT['s3:tiga']?3:0);for(let i=0;i<159;i++){const e=document.getElementById('d'+i);if(e)e.className=i<n?'dt on':'dt';}const dv=q('#dev');if(dv)dv.style.visibility=(t>AT['s8:Menurut']-0.1)?'hidden':'visible';}`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Nunito,'Segoe UI',sans-serif;font-weight:800;font-size:54px;line-height:1.16;word-spacing:.06em;color:${GR};padding:14px 28px 18px;background:linear-gradient(176deg,#FFFCF6,${PAPER} 50%,${EDGE});box-shadow:0 12px 26px rgba(70,52,34,.32);clip-path:polygon(0 6%,3% 0,22% 4%,48% 0,73% 5%,97% 0,100% 8%,99% 92%,100% 100%,76% 96%,51% 100%,26% 95%,2% 100%,0 90%)}
.w{display:inline-block}`,
  (id, w) => `tl.fromTo("#${id}",{color:"${GR}"},{color:"${ROSED}",duration:.03,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${GR}",duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:18},{opacity:1,y:0,duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Wabah Tawa Tanganyika 1962", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
