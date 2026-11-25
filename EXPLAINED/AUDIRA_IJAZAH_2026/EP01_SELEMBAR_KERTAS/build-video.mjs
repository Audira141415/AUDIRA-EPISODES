// SELEMBAR KERTAS: paper case cards pinned over a pop-up diorama. Cards hinge down from their top edge like a flipped file. Run from this folder: node build-video.mjs
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#1E1B18", RED = "#C8321F", PAPER = "#F7F1E2", GREEN = "#1F6B4B", MUTE = "#6B604C", BG = "#C9AD85";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tk">SIDANG 5 NOV 2026 / PN JAKARTA TIMUR</div>
  <div class="q"><span class="who">HAKIM</span>&ldquo;Mungkin bisa setelah persidangan.&rdquo;</div>
  <div class="q r" data-at="s1:memohon" data-fx="up"><span class="who">JOKOWI, SAKSI</span>&ldquo;Mohon, Yang Mulia.&rdquo;</div>
</div>
<div class="p" data-in="s2" data-out="s3">
  <div class="tk">REAKSI DI RUANG SIDANG</div>
  <div class="q b"><span class="who">ROY SURYO, TERDAKWA</span>&ldquo;Wong palsu kok ditunjukkan.&rdquo;</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tk">PENGAMANAN 3 RING / 1 FIGUR = 10 PERSONEL</div>
  <div class="big" data-at="s3:6.770" data-fx="pop"><b class="ct nb" data-from="0" data-to="6770" data-a="s3:6.770" data-d="1.8">0</b><span>PERSONEL TNI-POLRI</span></div>
  <div class="big red" data-at="s3:80" data-fx="pop"><b>80</b><span>BATAS PENGUNJUNG RUANG SIDANG</span></div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tk">JEJAK TUDINGAN</div>
  <div class="row" data-at="s4:2019" data-fx="left"><b>2019</b><span>Beredar di Facebook, menyoal ijazah SMA</span></div>
  <div class="row" data-at="s4:2022" data-fx="left"><b>2022</b><span>Gugatan perdata di PN Jakpus, lalu dicabut</span></div>
  <div class="row" data-at="s4:2025" data-fx="left"><b>2025</b><span>Rismon Sianipar menyorot huruf pada dokumen UGM</span></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tk">KLAIM: FONT BELUM ADA PADA 1985</div>
  <div class="tnr">Times New Roman</div>
  <div class="row" data-at="s5:1932" data-fx="left"><b class="g">1932</b><span>Diperkenalkan untuk koran The Times, catatan Monotype</span></div>
  <div class="row" data-at="s5:ribuan" data-fx="left"><b class="sm">JOKOWI</b><span>Ribuan skripsi Percetakan Perdana serupa</span></div>
  <div class="nt" data-at="s5:ribuan" data-fx="fade">MENJAWAB KLAIM FONT, BUKAN SELURUH PERKARA</div>
</div>
<div class="p" data-in="s6" data-out="s7">
  <div class="tk">UJI LABFOR BARESKRIM / 22 MEI 2025</div>
  <div class="chips"><i data-at="s6:kertas" data-fx="pop">KERTAS</i><i data-at="s6:tinta" data-fx="pop">TINTA</i><i data-at="s6:stempel" data-fx="pop">STEMPEL</i><i data-at="s6:tanda" data-fx="pop">TANDA TANGAN</i></div>
  <div class="row" data-at="s6:identik" data-fx="left"><b class="g sm">IDENTIK</b><span>dengan pembanding 3 rekan seangkatan</span></div>
  <div class="row rr" data-at="s6:Roy" data-fx="left"><b class="sm">ROY</b><span>Tetap menyebut palsu, soroti tanda tangan skripsi</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tk">LAPORAN JOKOWI KE POLDA METRO JAYA</div>
  <div class="row" data-at="s7:8" data-fx="left"><b>8</b><span>Tersangka, diumumkan 7 Nov 2025</span></div>
  <div class="row" data-at="s7:berdamai" data-fx="left"><b class="g">3</b><span>Keadilan restoratif, penyidikan dihentikan</span></div>
  <div class="row rr" data-at="s7:terdakwa" data-fx="left"><b>2</b><span>Terdakwa di PN Jakarta Timur</span></div>
  <div class="nt" data-at="s7:terdakwa" data-fx="fade">3 LAINNYA: BERKAS DIPROSES, PER JULI 2026</div>
</div>
<div class="p" data-in="s8" data-out="s9">
  <div class="tk">KETERANGAN JOKOWI DI BAWAH SUMPAH</div>
  <div class="q r"><span class="who">JOKOWI, SAKSI</span>&ldquo;Belum lihat ijazah asli kok bilang ijazah palsu.&rdquo;</div>
  <div class="big red" data-at="s8:18" data-fx="pop"><b>18%</b><span>&plusmn;34 JUTA ORANG, SURVEI YANG DISEBUT JOKOWI, TANPA NAMA LEMBAGA</span></div>
</div>
<div class="p" data-in="s9" data-out="@END">
  <div class="tk">STATUS 5 NOV 2026</div>
  <div class="h">BELUM ADA<br><em>PUTUSAN</em></div>
  <div class="row" data-at="s9:bersalah" data-fx="left"><b class="sm">ASAS</b><span>Praduga tak bersalah berlaku bagi para terdakwa</span></div>
</div>`;

const css = `
#chip{background:${INK};color:${PAPER}!important;padding:5px 12px;opacity:1!important;font-family:"IBM Plex Mono",monospace!important}
.p{top:238px}
.tk{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:26px;line-height:1.2;color:${PAPER};background:${INK};padding:7px 14px;margin-bottom:10px}
.q{position:relative;background:${PAPER};color:${INK};padding:20px 24px 22px;margin-bottom:12px;font-family:"EB Garamond",serif;font-weight:800;font-size:58px;line-height:1.08;box-shadow:9px 10px 0 rgba(30,27,24,.28);border-left:12px solid ${INK}}
.q.r{border-left-color:${GREEN}}.q.b{border-left-color:${RED};font-size:76px}
.who{display:block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:25px;line-height:1.2;letter-spacing:.02em;color:${MUTE};margin-bottom:8px}
.big{background:${PAPER};padding:6px 24px 14px;margin-bottom:12px;box-shadow:9px 10px 0 rgba(30,27,24,.28);border-left:12px solid ${INK}}
.big.red{border-left-color:${RED}}
.big b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:128px;line-height:1.08;color:${INK};font-variant-numeric:tabular-nums lining-nums}
.big.red b{color:${RED}}
.big span{display:block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:26px;line-height:1.22;color:${MUTE}}
.row{display:flex;align-items:center;gap:18px;background:${PAPER};padding:10px 20px;margin-bottom:10px;box-shadow:7px 8px 0 rgba(30,27,24,.28);border-left:10px solid ${INK}}
.row.rr{border-left-color:${RED}}
.row b{flex:none;font-family:Oswald,sans-serif;font-weight:700;font-size:66px;line-height:1.08;color:${INK};font-variant-numeric:lining-nums}
.row b.g{color:${GREEN}}.row b.sm{font-size:42px}
.row span{font-family:"EB Garamond",serif;font-weight:700;font-size:37px;line-height:1.1;color:${INK}}
.tnr{background:${PAPER};color:${INK};padding:8px 22px;margin-bottom:10px;font-family:"Times New Roman",serif;font-weight:700;font-size:82px;line-height:1.1;box-shadow:7px 8px 0 rgba(30,27,24,.28)}
.nt{display:inline-block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:24px;line-height:1.2;color:${INK};background:rgba(247,241,226,.92);padding:6px 12px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.chips i{font-style:normal;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:31px;color:${INK};background:${PAPER};padding:10px 16px;box-shadow:5px 6px 0 rgba(0,0,0,.35)}
.h{background:${PAPER};padding:12px 24px 18px;margin-bottom:12px;font-family:"EB Garamond",serif;font-weight:800;font-size:104px;line-height:.98;color:${INK};box-shadow:9px 10px 0 rgba(0,0,0,.35);border-left:12px solid ${RED}}
.h em{font-style:normal;color:${RED}}
.nb{font-variant-numeric:tabular-nums}`;

const P = "PROJECT/HyperFrames_Remotion";
const AUDIO = `${P}/assets/audio/mix.wav`;
copyFileSync("../_tools/lib3d.js", `${P}/assets/lib/lib3d.js`);
copyFileSync("world3d.js", `${P}/assets/lib/world3d.js`);

const { AT, K } = writeWorld(TL, at, {
  ep: "01", series: "KASUS IJAZAH &middot; 5 NOVEMBER 2026", bg: BG, vig: 0.22, grain: 0.07, capfloor: 0, html, css,
  chip: "ILUSTRASI KERTAS &middot; SIDANG MASIH BERJALAN", chipFont: '"IBM Plex Mono",monospace', chipColor: PAPER,
  extraAt: ["s1:terangkat", "s2:tertawa", "s3:6.770", "s3:80", "s4:2019", "s4:2022", "s4:dicabut", "s4:2025", "s5:1932", "s5:ribuan", "s6:menguji", "s6:Hasilnya", "s6:tiga", "s6:identik", "s6:Roy", "s6:mempersoalkan", "s7:8", "s7:berdamai", "s7:terdakwa", "s8:18", "s9:Kertasnya", "s9:Putusannya"],
  panelIn: `(tl,p,a)=>tl.fromTo(p,{rotationX:-82,transformPerspective:1500,transformOrigin:'50% 0%',opacity:0},{rotationX:0,opacity:1,duration:.42,ease:'back.out(1.2)'},a-.1)`,
  panelOut: `(tl,p,b)=>tl.to(p,{rotationX:78,transformPerspective:1500,transformOrigin:'50% 0%',opacity:0,duration:.2,ease:'power2.in'},b-.2)`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:58px;right:112px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;background:${PAPER};padding:12px 18px 16px;font-family:"Archivo Black",sans-serif;font-weight:400;font-size:54px;line-height:1.16;color:${INK};box-shadow:8px 9px 0 rgba(30,27,24,.32)}
.w{display:inline-block}`,
(id, w) => `tl.fromTo("#${id}",{color:"${INK}",y:0},{color:"${RED}",y:-5,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{y:0,duration:.1},${(w.start + 0.05).toFixed(3)});tl.to("#${id}",{color:"${INK}",duration:.08},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{opacity:0,y:10},{opacity:1,y:0,duration:.1,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Selembar Kertas", BG);

// Silent until the script is approved: the draft carries a silent track so the render contract still holds.
if (!existsSync("AUDIO/VO_MASTER.wav")) execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(TL.duration), AUDIO]);
writeFileSync("PROJECT/draft.txt", existsSync("AUDIO/VO_MASTER.wav") ? "final" : "silent");
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
