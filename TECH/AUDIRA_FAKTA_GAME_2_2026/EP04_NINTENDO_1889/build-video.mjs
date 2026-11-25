// EP04 NINTENDO 1889. UKIYOFORGE: a woodblock-print Kyoto on one emaki scroll; panels are washi cartouches that unroll
// like a hand-scroll, seals stamp the verdicts. Run from this folder: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const PD = "#0F2747", VE = "#D9472B", VD = "#A8301C", OC = "#D9A441", WA = "#EFE3C8", KL = "#1B1A1F", FO = "#F6F0E1", BG = "#E7DCC4";
const T = "'Zen Antique',serif", G = "'Zen Kaku Gothic New',sans-serif";

const html = `
<div class="p" data-first="1" data-in="@0" data-out="s2">
  <div class="tag">FAKTA GAME &middot; EP 04</div>
  <div class="st big">NINTENDO<br>LAHIR <span>1889</span></div>
  <div class="seal" data-at="s1:kartu" data-fx="stamp">bukan game, tapi kartu</div>
</div>
<div class="p" data-in="s2" data-out="s2:Arti">
  <div class="tag">AWAL MULA</div>
  <div class="st h dt">23 SEP 1889 &middot; KYOTO</div>
  <div class="st h" data-at="s2:Fusajiro" data-fx="unr">Fusajiro Yamauchi mendirikan Nintendo</div>
  <div class="st h y" data-at="s2:hanafuda" data-fx="unr">Kartu hanafuda buatan tangan</div>
</div>
<div class="p" data-in="s2:Arti" data-out="s3">
  <div class="tag">ARTI NAMA YANG SERING DISEBUT</div>
  <div class="st h q" data-at="s2:serahkan" data-fx="unr">&ldquo;Serahkan keberuntungan pada langit&rdquo;?</div>
  <div class="seal" data-at="s2:tidak" data-fx="stamp">BELUM TERBUKTI</div>
</div>
<div class="p" data-in="s3" data-out="s4">
  <div class="tag">1959</div>
  <div class="st h" data-at="s3:Disney" data-fx="unr">Kerja sama dengan Disney: kartu bergambar karakter</div>
  <div class="st h y" data-at="s3:melonjak" data-fx="unr">Penjualan melonjak</div>
  <div class="st h g" data-at="s3:jenuh" data-fx="unr">Lalu bisnis kartu jenuh</div>
</div>
<div class="p" data-in="s4" data-out="s5">
  <div class="tag">MENCOBA USAHA LAIN</div>
  <div class="st h" data-at="s4:1960" data-fx="unr">1960 &middot; Daiya Taxi, Kyoto</div>
  <div class="st h" data-at="s4:nasi" data-fx="unr">Nasi instan</div>
  <div class="st h" data-at="s4:Chiritory" data-fx="unr">Chiritory, penyedot debu</div>
  <div class="seal big2" data-at="s4:gagal" data-fx="stamp">GAGAL</div>
</div>
<div class="p" data-in="s5" data-out="s6">
  <div class="tag">SETELAH OLIMPIADE TOKYO 1964</div>
  <div class="st h">Harga saham Nintendo</div>
  <div class="row"><b class="st big n9" data-at="s5:sembilan" data-fx="unr">900</b><b class="arw" data-at="s5:ke" data-fx="fade">&rarr;</b><b class="st big n6" data-at="s5:enam" data-fx="stamp">60</b><b class="yen" data-at="s5:enam" data-fx="fade">YEN</b></div>
</div>
<div class="p" data-in="s6" data-out="s6:Ultra">
  <div class="tag">1966 &middot; PENYELAMAT TAK TERDUGA</div>
  <div class="st h" data-at="s6:mainan" data-fx="unr">Mainan lengan panjang, dibuat montir untuk iseng</div>
</div>
<div class="p" data-in="s6:Ultra" data-out="s7">
  <div class="tag">1966 &middot; DIJUAL SEBAGAI</div>
  <div class="st big uh">ULTRA HAND</div>
  <div class="st h y" data-at="s6:ratusan" data-fx="unr">Laku ratusan ribu unit</div>
  <div class="st h" data-at="s6:Yokoi#2" data-fx="unr">Yokoi pindah ke pengembangan produk</div>
</div>
<div class="p" data-in="s7" data-out="s8">
  <div class="tag">CERITA YANG BEREDAR</div>
  <div class="st h q" data-at="s7:love" data-fx="unr">Nintendo punya jaringan love hotel?</div>
  <div class="st h y" data-at="s7:tidak" data-fx="unr">Isao Yamazaki: tidak ada bukti</div>
</div>
<div class="p" data-in="s8" data-out="@END">
  <div class="tag">SEBELUM MARIO</div>
  <div class="row"><b class="st c" data-at="s8:kartu" data-fx="unr">kartu</b><b class="st c" data-at="s8:taksi" data-fx="unr">taksi</b><b class="st c" data-at="s8:nasi" data-fx="unr">nasi instan</b></div>
  <div class="st h y" data-at="s8:Menurutmu" data-fx="unr">Usaha mana yang paling aneh?</div>
</div>`;

const css = `
.p .st{display:block;width:fit-content;max-width:900px;box-sizing:border-box;background:${WA};color:${PD};border:4px solid ${KL};box-shadow:inset 0 0 0 7px ${WA},inset 0 0 0 10px ${VE},9px 11px 0 rgba(27,26,31,.38);font-family:${T};margin-bottom:16px}
.tag{display:inline-block;font-family:${G};font-weight:700;font-size:27px;letter-spacing:.12em;color:${FO};background:${VE};padding:7px 18px 8px;border:3px solid ${KL};margin-bottom:16px}
.big{font-size:118px;line-height:1.02;padding:22px 34px 18px;letter-spacing:.01em}.big span{color:${VE}}
.h{font-size:47px;line-height:1.16;padding:16px 28px 17px}.q{font-size:52px}.dt{font-size:56px;color:${VD}}
.y{background:${OC}!important;box-shadow:inset 0 0 0 7px ${OC},inset 0 0 0 10px ${KL},9px 11px 0 rgba(27,26,31,.38)!important}
.g{color:#5a5e66!important}
.seal{display:inline-block;font-family:${G};font-weight:900;font-size:44px;letter-spacing:.06em;color:${FO};background:${VE};border:5px solid ${VD};outline:3px solid ${FO};outline-offset:-12px;padding:14px 26px;transform:rotate(-3deg);box-shadow:6px 8px 0 rgba(27,26,31,.35);margin:4px 0 16px 6px}
.seal.big2{font-size:84px;padding:12px 40px;letter-spacing:.1em}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:16px}.row .st{margin-bottom:0}
.c{font-size:50px;padding:14px 26px}
.n9{font-size:104px;color:${PD}}.n6{font-size:104px;color:${VE}!important}
.arw{font-family:${G};font-weight:900;font-size:90px;color:${KL}}.yen{font-family:${T};font-size:70px;color:${PD};background:${WA};border:4px solid ${KL};padding:6px 18px}
.uh{font-size:84px;color:${VE}}
#chip{font-family:${G};font-weight:700;color:${FO};background:${PD};padding:3px 12px;top:176px;font-size:21px;letter-spacing:.06em}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const worldAt = ["s1:kartu", "s2:Arti", "s2:hanafuda", "s2:serahkan", "s3:Disney", "s3:Penjualannya", "s3:jenuh", "s3:melonjak", "s4:1960", "s4:Chiritory", "s4:Daiya", "s4:Semuanya", "s4:nasi", "s4:penyedot", "s5:enam", "s5:jatuh", "s5:saham", "s5:sembilan", "s6:Gunpei", "s6:Hiroshi", "s6:Ultra", "s6:Yokoi#2", "s6:iseng", "s6:laku", "s6:mainan", "s6:melihat", "s6:pengembangan", "s7:Isao", "s7:Ternyata", "s7:buktinya", "s7:koran", "s7:laporan", "s7:tidak", "s8:AUDIRA", "s8:Menurutmu", "s8:kartu", "s8:nasi", "s8:taksi", "s4:gagal", "s4:Taxi", "s6:Hand", "s6:ratusan", "s2:Kyoto"];
const { AT, K } = writeWorld(TL, at, {
  ep: "04", bg: BG, vig: 0.26, grain: 0.05, capfloor: 0.0, html, css, chipFont: G, chipColor: FO, sig: "EP04_NINTENDO_1889",
  extraAt: worldAt,
  // Hand-scroll: a cartouche unrolls left to right and rolls away to the left.
  panelIn: `(tl,p,a)=>tl.fromTo(p,{clipPath:'inset(-12% 100% -12% -6%)',x:-24,opacity:1},{clipPath:'inset(-12% -6% -12% -6%)',x:0,opacity:1,duration:.55,ease:'power2.inOut'},a-.08)`,
  panelOut: `(tl,p,b)=>tl.to(p,{clipPath:'inset(-12% -6% -12% 100%)',x:24,duration:.3,ease:'power2.in'},b-.3)`,
  fxExtra: `unr:(e,t)=>tl.fromTo(e,{clipPath:'inset(-12% 100% -12% -6%)',opacity:1},{clipPath:'inset(-12% -6% -12% -6%)',opacity:1,duration:.42,ease:'power2.out'},t),`,
  // Closes like a scroll unrolling from the centre outwards.
  outroIn: `gsap.set('#outro',{clipPath:'inset(0% 50% 0% 50%)'});tl.to('#outro',{clipPath:'inset(0% 0% 0% 0%)',duration:.6,ease:'power3.inOut'},OUT-.3);`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:50px;right:100px;top:1300px;height:240px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${G};font-weight:900;font-size:60px;line-height:1.18;color:${FO};text-shadow:4px 0 0 ${PD},-4px 0 0 ${PD},0 4px 0 ${PD},0 -4px 0 ${PD},3px 3px 0 ${PD},-3px 3px 0 ${PD},3px -3px 0 ${PD},-3px -3px 0 ${PD},0 8px 0 ${KL}}
.w{display:inline-block;margin:0 .06em}`,
(id, w) => `tl.fromTo("#${id}",{color:"${FO}",y:0},{color:"#F2C14E",y:-6,duration:.06,ease:"power2.out"},${w.start.toFixed(3)});tl.to("#${id}",{color:"${FO}",y:0,duration:.1},${w.end.toFixed(3)});\n`,
(id, s) => `tl.fromTo("#${id}",{clipPath:"inset(-12% 100% -12% -6%)"},{clipPath:"inset(-12% -6% -12% -6%)",duration:.22,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Nintendo 1889", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
