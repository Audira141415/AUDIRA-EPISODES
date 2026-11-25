// EP02 THE TAPE. A broadsheet-grey market report: one long strip of paper tape travels left past the camera,
// real photographs behind it, real figures on it. Run from this folder: node build-video.mjs
import { writeFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex, collectAt } from "../_tools/hflib.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const RED = "#E5252A", INK = "#0F1113", GRAPH = "#1A1D20", SILVER = "#C7CCD1", WHITE = "#F4F5F6", GREEN = "#3FA66B", GREY = "#747B82";
const scene = Object.fromEntries(TL.scenes.map((x) => [x.id, x]));

// ---------- intraday chart: only sourced points; segments between them are straight on purpose ----------
const CH = { x0: 30, w: 840, top: 20, h: 500, lo: 4860, hi: 5170 };
const T0 = 9, T1 = 16; // session hours WIB
const px = (h) => CH.x0 + ((h - T0) / (T1 - T0)) * CH.w;
const py = (v) => CH.top + (1 - (v - CH.lo) / (CH.hi - CH.lo)) * CH.h;
const POINTS = [[9.0, 5126.53], [9.25, 5143.58], [10.95, 5000], [11.98, 4963.06], [15.4, 4895.6], [15.98, 4904.29]];
const pathD = POINTS.map(([h, v], i) => `${i ? "L" : "M"}${px(h).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
const hourTicks = [9, 11, 13, 16].map((h) => `<line x1="${px(h)}" x2="${px(h)}" y1="${CH.top}" y2="${CH.top + CH.h}" stroke="#2B3035" stroke-width="2"/><text x="${px(h)}" y="${CH.top + CH.h + 44}" text-anchor="middle" class="axis">${String(h).padStart(2, "0")}.00</text>`).join("");
const levelTicks = [5100, 5000, 4900].map((v) => `<line x1="${CH.x0}" x2="${CH.x0 + CH.w}" y1="${py(v)}" y2="${py(v)}" stroke="${v === 5000 ? "#F4F5F6" : "#2B3035"}" stroke-width="${v === 5000 ? 5 : 2}"${v === 5000 ? ' id="l5000"' : ""}/>`).join("");

const mark = (h, v, title, value, spec, up = true, c = WHITE, anchor = "middle", dx = 0) => {
  const x = px(h), y = py(v), dy = up ? -96 : 52;
  return `<g data-at="${spec}" data-fx="fade"><circle cx="${x}" cy="${y}" r="13" fill="${c}"/>
  <text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" class="ml">${title}</text><text x="${x + dx}" y="${y + dy + 66}" text-anchor="${anchor}" class="mv" fill="${c}">${value}</text></g>`;
};
const chart = `<svg id="chart" width="912" height="580" viewBox="0 0 912 580" aria-hidden="true"><defs><linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED}" stop-opacity=".34"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></linearGradient></defs>${levelTicks}${hourTicks}
<text x="${CH.x0 + CH.w}" y="${py(5000) - 14}" text-anchor="end" class="ml" fill="#fff">LEVEL 5.000</text><path id="area" d="${pathD} L${px(15.98)} ${CH.top + CH.h} L${px(9)} ${CH.top + CH.h} Z" fill="url(#fillg)"/>
<path id="line-g" d="${pathD}" fill="none" stroke="${RED}" stroke-opacity=".3" stroke-width="26" stroke-linejoin="round"/>
<path id="line" d="${pathD}" fill="none" stroke="${RED}" stroke-width="9" stroke-linejoin="round"/>
${mark(9, 5126.53, "BUKA", "5.126", "s2:dibuka", false, WHITE, "start", 80)}${mark(10.95, 5000, "JEBOL", "5.000", "s2:jebol", true, RED, "start", 16)}${mark(11.98, 4963.06, "JEDA SIANG", "4.963", "s2:4.963", false, WHITE, "start", -60)}${mark(15.98, 4904.29, "TUTUP", "4.904,29", "s2:4.904,29", true, RED, "end", 10)}
</svg>`;

// ---------- breadth wall: exactly 718 dots, 624 + 57 + 37 ----------
const COUNTS = [624, 57, 37], COLS = 36;
let dotsHtml = "";
{
  let k = 0;
  COUNTS.forEach((c, g) => { for (let i = 0; i < c; i++, k++) dotsHtml += `<i class="dt g${g}" data-i="${k}"></i>`; });
}

// ---------- sectors: Infobank closing values ----------
const SECT = [["Barang baku", 6.0], ["Energi", 4.38], ["Transportasi", 3.9], ["Industri", 3.8], ["Properti", 3.78], ["Infrastruktur", 3.61], ["Siklikal", 3.59], ["Kesehatan", 2.83], ["Non-siklikal", 2.61], ["Keuangan", 2.07], ["Teknologi", 1.92]];
const sectHtml = SECT.map(([n, v], i) => `<div class="sr"><span class="sn">${n}</span><span class="sb"><i style="width:${(v / 6) * 100}%" data-at="s3:sektor${i ? "+" + (i * 0.05).toFixed(2) : ""}" data-fx="grow"></i></span><span class="sv">-${v.toFixed(2).replace(".", ",")}</span></div>`).join("");

// ---------- year chart ----------
const YR = [[0.05, 8646], [0.055, 9174.47], [0.075, 8320.56], [0.165, 8016.83], [0.17, 7577.06], [0.83, 5057], [0.836, 5096.83], [0.84, 4904.29]];
const yx = (u) => 40 + u * 980 / 0.84;
const yy = (v) => 30 + (1 - (v - 4400) / (9500 - 4400)) * 560;
const yrD = YR.slice(1).map(([u, v], i) => `${i ? "L" : "M"}${yx(u).toFixed(1)} ${yy(v).toFixed(1)}`).join(" ");
const yrChart = `<svg width="1000" height="640" viewBox="0 0 1060 640" aria-hidden="true">
<line x1="40" x2="1020" y1="${yy(5000)}" y2="${yy(5000)}" stroke="#F4F5F6" stroke-width="3" stroke-dasharray="10 10"/>
<path id="yrline" d="${yrD}" fill="none" stroke="${RED}" stroke-width="8" stroke-linejoin="round"/>
<circle cx="${yx(0.055)}" cy="${yy(9174.47)}" r="14" fill="${WHITE}"/><text x="${yx(0.055) + 28}" y="${yy(9174.47) + 10}" class="ml" fill="#fff">REKOR 9.174, 20 JAN</text>
<g data-at="s8:IHSG" data-fx="fade"><circle cx="${yx(0.84)}" cy="${yy(4904.29)}" r="14" fill="${RED}"/><text x="${yx(0.84)}" y="${yy(4904.29) + 66}" text-anchor="end" class="mv" fill="${RED}">4.904</text></g></svg>`;

const shards = Array.from({ length: 22 }, (_, i) => `<polygon class="shard" data-k="${i}" points="0,0 ${16 + (i * 37) % 34},${(i * 53) % 18} ${(i * 29) % 30},${20 + (i * 41) % 30}" fill="#F4F5F6"/>`).join("");
// ---------- the tape: station spacing is fixed, the camera eases from one to the next ----------
const ST = 1080, V = 5;
// Moves first, so each station sits where the slowly advancing camera is when it arrives.
const moves = [
  [at("s2:Selasa") - 0.1, 1], [scene.s3.start, 2], [at("s3:Seluruh"), 3], [scene.s4.start, 4], [scene.s5.start, 5], [scene.s6.start, 6],
  [scene.s7.start, 7], [scene.s8.start, 8], [at("s8:Pantau"), 9],
];
const stopAt = [0, ...moves.map((m) => m[0]), TL.duration];
const left = (i) => Math.round(i * ST + (V * (stopAt[i] + stopAt[i + 1])) / 2);
const station = (i, html) => `<section class="st" style="left:${left(i)}px">${html}</section>`;
const asia = [["IHSG", -3.78], ["Shanghai", -0.82], ["Straits Times", -0.53], ["Nikkei 225", -0.33], ["Hang Seng", 0.57]];
const asiaHtml = asia.map(([n, v], i) => `<div class="ar"><span class="an${i ? "" : " hot"}">${n}</span><span class="ab"><i class="${v > 0 ? "pos" : ""}" style="width:${(Math.abs(v) / 3.78) * 100}%" data-at="s6:Bursa+${(i * 0.12).toFixed(2)}" data-fx="grow"></i></span><span class="av${i ? "" : " hot"}">${v > 0 ? "+" : ""}${v.toFixed(2).replace(".", ",")}</span></div>`).join("");

const stations = [
  // 0 hook: the real building, the number already on screen at frame 0
  station(0, `<div class="band hk"><div class="kick">IHSG, PENUTUPAN 3 NOV 2026</div>
    <div class="f hook">TERJUN<br>BEBAS</div>
    <div class="num red big" id="idx">-3,78%</div></div>`),
  station(1, `<div class="band tight"><div class="kick">IHSG, SELASA 3 NOV 2026</div><div class="num bigidx" id="bigidx">5.096,83</div>
    <div class="chartw">${chart}<svg id="shards" viewBox="0 0 912 580" width="912" height="580" aria-hidden="true">${shards}</svg></div>
    <div class="f sub lost" data-at="s2:Hilang" data-fx="up"><b class="red">-192,54</b> poin dalam sehari</div>
    <div class="capt">Enam titik bersumber, garis disederhanakan.</div></div>`),
  station(2, `<div class="band tight"><div class="f t2" data-at="s3:Tekanannya" data-fx="up">Tekanannya merata</div>
    <div class="wall" id="wall">${dotsHtml}</div>
    <div class="trio"><div class="tc" data-at="s3:624" data-fx="up"><b class="red">624</b><span>MELEMAH</span></div><div class="tc" data-at="s3:57" data-fx="up"><b style="color:${GREEN}">57</b><span>MENGUAT</span></div><div class="tc" data-at="s3:37" data-fx="up"><b style="color:${SILVER}">37</b><span>STAGNAN</span></div></div></div>`),
  station(3, `<div class="band tight"><div class="f t2" data-at="s3:Seluruh" data-fx="up">11 dari 11 sektor merah</div><div class="sects">${sectHtml}</div>
    <div class="phone" data-at="s3:Asing" data-fx="left"><div class="ph-t">JUAL BERSIH ASING, 3 NOV</div><div class="num red ph-v">Rp575 miliar</div></div></div>`),
  station(4, `<div class="band cen"><div class="f t1" data-at="s4:Itu" data-fx="up">Itu datanya.</div><div class="rule" data-at="s4:Soal" data-fx="grow"></div><div class="f t1 red" data-at="s4:Soal" data-fx="up">Soal penyebab,<br>jawabannya tidak tunggal.</div></div>`),
  station(5, `<div class="band tight"><div class="kick" data-at="s5:evaluasi" data-fx="up">SENTIMEN 1 &middot; EVALUASI MSCI</div>
    <div class="f t2" data-at="s5:Penyedia" data-fx="up">Status pasar Indonesia sedang dikonsultasikan</div>
    <div class="lane"><div class="ln on" data-at="s5:emerging" data-fx="left"><span class="lnk">SEKARANG</span><span class="f lnv">Emerging market</span></div>
    <svg class="arrow" width="60" height="84" viewBox="0 0 60 84" aria-hidden="true" data-at="s5:menjadi" data-fx="fade"><path d="M30 4V72M10 52L30 76L50 52" fill="none" stroke="${RED}" stroke-width="8"/></svg>
    <div class="ln" data-at="s5:standalone" data-fx="left"><span class="lnk red">BISA TURUN KE</span><span class="f lnv">Standalone market</span></div></div>
    <div class="dates"><div class="dt2" data-at="s5:Keputusannya" data-fx="up"><b>30 JUN 2027</b><span>batas keputusan status</span></div><div class="dt2" data-at="s5:Hasil" data-fx="up"><b>11 NOV 2026</b><span>hasil review November</span></div></div></div>`),
  station(6, `<div class="band tight"><div class="f t2" data-at="s6:Tapi" data-fx="up">MSCI bukan satu-satunya</div>
    <div class="fc" data-at="s6:81" data-fx="left"><b>81 saham HSC</b><span>Keluar dari hitungan IHSG. Belum bisa disebut penyebab langsung.</span></div>
    <div class="fc" data-at="s6:Pilarmas" data-fx="left"><b>Inflasi pangan</b><span>Disorot Pilarmas Investindo Sekuritas</span></div>
    <div class="asia">${asiaHtml}</div></div>`),
  station(7, `<div class="band tight"><div class="f t2" data-at="s7:Tafsirnya" data-fx="up">Tafsirnya beda</div>
    <div class="vw" data-at="s7:OJK" data-fx="left"><div class="vwk">OJK</div><div class="f vwt">&ldquo;Konsekuensi logis&rdquo; reformasi pasar modal</div></div>
    <div class="vw alt" data-at="s7:Analis" data-fx="left"><div class="vwk">ELANDRY, PANIN SEKURITAS</div><div class="f vwt">Krisis kepercayaan, bukan fundamental semua emiten</div></div>
    <div class="fx" data-at="s7:Rupiah" data-fx="up"><span class="fxk">RUPIAH, 3 NOV</span><span class="num fxv">Rp18.160</span><span class="fxd">-0,02%</span></div></div>`),
  station(8, `<div class="band tight">${yrChart}<div class="num big red yrn" data-at="s8:turun" data-fx="up">-46,5%</div><div class="capt" data-at="s8:Dari" data-fx="up">Puncak intraday ke penutupan. Titik data terpilih.</div></div>`),
  station(9, `<div class="band tight"><div class="f t1" data-at="s8:Pantau" data-fx="up">Pantau tiga hal</div>
    <div class="ck" data-at="s8:hasil" data-fx="left"><i>1</i><b>Hasil MSCI, 11 November</b></div><div class="ck" data-at="s8:arus" data-fx="left"><i>2</i><b>Arus dana asing</b></div><div class="ck" data-at="s8:rupiah" data-fx="left"><i>3</i><b>Rupiah</b></div>
    <div class="stamp" data-at="s8:bukan" data-fx="stamp">BUKAN REKOMENDASI BELI ATAU JUAL</div></div>`),
].join("\n");
const AT = collectAt(stations + chart + yrChart, at);

const BG = [
  // photo windows on the far plane: [start, end, id]
  [0, scene.s2.start + 0.4, "ph-idx"], [at("s8:Pantau") - 0.4, TL.duration, "ph-jkt"],
];

const css = `
#root{position:absolute;inset:0;overflow:hidden;background:${INK}}
.far{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;opacity:0;transform-origin:50% 45%}
#bgfield{position:absolute;inset:0;background:linear-gradient(180deg,#191C1F,#101214 62%)}
#phshade{position:absolute;left:0;top:0;width:1080px;height:900px;background:linear-gradient(180deg,#101214 12%,rgba(16,18,20,.82) 58%,transparent)}
#gridp{position:absolute;left:-200px;top:0;width:3000px;height:1920px;background-image:linear-gradient(rgba(199,204,209,.05) 2px,transparent 2px),linear-gradient(90deg,rgba(199,204,209,.05) 2px,transparent 2px);background-size:120px 120px}
#tape{position:absolute;left:0;top:0;width:11600px;height:1920px;will-change:transform}
.st{position:absolute;top:0;width:1080px;height:1920px}
.chartw{position:relative;width:912px;height:580px}
.bigidx{font-size:150px;color:#fff}.lost{font-size:62px}.lost b{font-family:"Oswald",sans-serif;font-weight:700}
.band{position:absolute;left:84px;right:84px;top:230px;height:1040px;display:flex;flex-direction:column;justify-content:center;gap:30px}
.band.hk{justify-content:flex-start;gap:12px;top:262px}.band.tight{gap:22px}.band.cen{text-align:center;align-items:center}
.f{font-family:"Playfair Display",serif;font-weight:900;line-height:1.04;color:${WHITE}}
.num{font-family:"Oswald",sans-serif;font-weight:700;line-height:1;letter-spacing:-1px;font-variant-numeric:tabular-nums}
.big{font-size:150px}.red{color:${RED}}
#idx{color:#FF3338;text-shadow:0 4px 0 rgba(0,0,0,.8),0 0 30px rgba(0,0,0,.8)}
.kick{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:31px;color:${SILVER};letter-spacing:.4px;text-shadow:0 2px 10px #000}
.hook{font-size:128px;text-shadow:0 8px 40px rgba(0,0,0,.8)}
.capt{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;color:${SILVER};text-shadow:0 2px 10px #000}
.sub{font-size:58px}.t1{font-size:104px}.t2{font-size:74px}
.rule{width:320px;height:8px;background:${RED};transform-origin:0 50%}
.axis{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;fill:${SILVER}}
.ml{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:33px;fill:${SILVER}}.mv{font-family:"Oswald",sans-serif;font-weight:700;font-size:60px}
#shards{position:absolute;left:0;top:0;width:912px;height:580px}
.wall{display:grid;grid-template-columns:repeat(${COLS},1fr);gap:6px 6px;padding:18px;background:rgba(8,9,10,.72);border:1px solid rgba(199,204,209,.22);border-radius:6px}
.dt{display:block;width:100%;aspect-ratio:1;border-radius:50%;background:#30353A}
.trio{display:flex;justify-content:space-between;gap:16px}.tc{flex:1;text-align:center;border-top:6px solid #30353A;padding-top:12px}.tc b{display:block;font-family:"Oswald",sans-serif;font-weight:700;font-size:120px;line-height:1}.tc span{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:30px;color:${SILVER}}
.sects{display:flex;flex-direction:column;gap:9px;background:rgba(8,9,10,.72);padding:20px 22px;border-radius:6px;border:1px solid rgba(199,204,209,.2)}
.sr{display:flex;align-items:center;gap:14px;height:42px}.sn{width:232px;font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:${WHITE}}.sb{flex:1;height:24px;background:rgba(199,204,209,.1)}.sb i{display:block;height:100%;background:${RED};transform-origin:0 50%}.sv{width:96px;text-align:right;font-family:"Oswald",sans-serif;font-weight:700;font-size:36px;color:${WHITE}}
.phone{background:#E9EAEB;border-radius:14px;padding:18px 26px;box-shadow:0 26px 54px -14px rgba(0,0,0,.8)}.ph-t{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:#3A3F44}.ph-v{font-size:72px;margin-top:4px}
.lane{display:flex;flex-direction:column;align-items:center;gap:8px}.ln{align-self:stretch;padding:20px 26px;background:rgba(8,9,10,.8);border:1px solid rgba(199,204,209,.28);border-radius:6px}.ln.on{border-left:8px solid ${SILVER}}.lnk{display:block;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:${SILVER}}.lnk.red{color:#FF6A6D}.lnv{font-size:72px}
.dates{display:flex;gap:18px}.dt2{flex:1;padding:18px 20px;background:#E9EAEB;border-radius:6px}.dt2 b{display:block;font-family:"Oswald",sans-serif;font-weight:700;font-size:56px;color:${INK}}.dt2 span{font-family:Inter,sans-serif;font-weight:700;font-size:28px;color:#33383C}
.fc{padding:20px 24px;background:rgba(8,9,10,.82);border-left:8px solid ${RED};border-radius:4px}.fc b{display:block;font-family:"Playfair Display",serif;font-weight:900;font-size:58px;color:#fff}.fc span{font-family:Inter,sans-serif;font-weight:700;font-size:32px;line-height:1.22;color:${SILVER}}
.asia{display:flex;flex-direction:column;gap:9px;padding:18px 22px;background:rgba(8,9,10,.72);border-radius:6px;border:1px solid rgba(199,204,209,.2)}.ar{display:flex;align-items:center;gap:12px;height:44px}.an{width:220px;font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:${WHITE}}.hot{color:#FF5A5E}.ab{flex:1;height:26px}.ab i{display:block;height:100%;background:${RED};transform-origin:0 50%}.ab i.pos{background:${GREEN}}.av{width:102px;text-align:right;font-family:"Oswald",sans-serif;font-weight:700;font-size:38px;color:${WHITE}}
.vw{padding:24px 26px;background:rgba(8,9,10,.84);border-top:6px solid ${SILVER};border-radius:4px}.vw.alt{border-top-color:${RED}}.vwk{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:29px;color:${SILVER};margin-bottom:10px}.vwt{font-size:62px}
.fx{display:flex;align-items:baseline;justify-content:space-between;gap:14px;background:#E9EAEB;padding:16px 24px;border-radius:6px}.fxk{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:#33383C}.fxv{font-size:74px;color:${INK}}.fxd{font-family:"Oswald",sans-serif;font-weight:700;font-size:44px;color:#B01A1E}
.yrn{font-size:170px;align-self:flex-start;margin-top:-104px}
.ck{display:flex;align-items:center;gap:26px;padding:20px 24px;background:rgba(8,9,10,.82);border-radius:6px}.ck i{font-family:"Oswald",sans-serif;font-weight:700;font-style:normal;font-size:72px;color:${RED};width:50px}.ck b{font-family:Inter,sans-serif;font-weight:900;font-size:48px;color:#fff}
.stamp{align-self:center;font-family:"Oswald",sans-serif;font-weight:700;font-size:48px;color:#fff;background:${RED};padding:18px 26px;border-radius:4px;text-align:center;margin-top:10px}
#rail{position:absolute;left:84px;right:84px;top:178px;z-index:8;display:flex;justify-content:space-between;align-items:baseline;font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:${WHITE};border-bottom:2px solid rgba(244,245,246,.42);padding-bottom:10px;text-shadow:0 2px 10px #000}
#tick{color:#FF5A5E;font-family:"Oswald",sans-serif;font-size:40px}
#blur{position:absolute;left:0;top:1076px;z-index:3;font-family:"Oswald",sans-serif;font-weight:700;font-size:230px;line-height:1;color:rgba(229,37,42,.12);white-space:nowrap;filter:blur(9px)}
#capshade{position:absolute;left:0;right:0;top:1240px;height:390px;z-index:6;background:linear-gradient(transparent,rgba(9,10,11,.93) 26%,rgba(9,10,11,.93) 82%,transparent)}
#vig{position:absolute;inset:0;z-index:5;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.6) 100%)}
#grain{position:absolute;inset:-100px;background:url(assets/img/grain.png);opacity:.075;z-index:9;mix-blend-mode:overlay}
#black{position:absolute;inset:0;z-index:10;background:${INK};opacity:0}
#outro{position:absolute;inset:0;z-index:11;opacity:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:44px;padding-bottom:300px}
.logo{width:520px}.cr{font-family:Inter,sans-serif;font-weight:700;font-size:44px;color:#fff}.cred{font-family:"IBM Plex Mono",monospace;font-weight:700;font-size:28px;color:${SILVER};text-align:center;line-height:1.5}
`;

const outroAt = +(TL.speech_end + 0.55).toFixed(3);
const world = `<template><style>${css}</style>
<div id="root" data-composition-id="world" data-width="1080" data-height="1920">
<div id="bgfield" data-layout-ignore></div>
<img class="far" id="ph-idx" src="assets/img/idx-graded.jpg" alt="Gedung Bursa Efek Indonesia" data-layout-ignore>
<img class="far" id="ph-jkt" src="assets/img/jakarta-graded.jpg" alt="Jakarta malam hari" data-layout-ignore>
<div id="phshade" data-layout-ignore></div><div id="gridp" data-layout-ignore></div>
<div id="vig" data-layout-ignore></div>
<div id="tape" data-layout-allow-overflow>
${stations}
</div>
<div id="blur" data-layout-ignore>IHSG 4.904,29 &nbsp; -3,78% &nbsp; IHSG 4.904,29 &nbsp; -3,78% &nbsp; IHSG 4.904,29</div>
<div id="capshade" data-layout-ignore></div>
<div id="rail"><span>AUDIRA TECH NEWS</span><span id="tick">IHSG 5.096,83</span></div>
<div id="grain" data-layout-ignore></div>
<div id="black" data-layout-ignore></div>
<div id="outro"><img class="logo" src="assets/brand/stacked-reversed.svg" alt="AUDIRA"><div class="cr">Created by Agus Dwi R.</div>
<div class="cred">Sumber: BEI via Katadata &amp; Kompas, CNN Indonesia,<br>Infobank, Bloomberg Technoz, CNBC Indonesia.<br>Bukan nasihat investasi.</div></div>
</div>
<script>
(function(){
const DUR=${TL.duration},AT=${JSON.stringify(AT)},OUT=${outroAt},END=OUT-.1;
const MOVES=${JSON.stringify(moves)},ST=${ST},COUNTS=${JSON.stringify(COUNTS)};
const BG=${JSON.stringify(BG)};
const JEBOL=${JSON.stringify(at("s2:jebol"))};
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const tl=gsap.timeline({paused:true});
const FX={
 up:(e,t)=>tl.fromTo(e,{y:54,opacity:0},{y:0,opacity:1,duration:.42,ease:'power4.out'},t),
 left:(e,t)=>tl.fromTo(e,{x:90,opacity:0},{x:0,opacity:1,duration:.42,ease:'power4.out'},t),
 fade:(e,t)=>tl.fromTo(e,{opacity:0},{opacity:1,duration:.26,ease:'power2.out'},t),
 stamp:(e,t)=>tl.fromTo(e,{scale:1.7,opacity:0},{scale:1,opacity:1,duration:.2,ease:'power4.in'},t),
 grow:(e,t)=>tl.fromTo(e,{scaleX:0},{scaleX:1,duration:.5,ease:'power3.out'},t)
};
qa('#root [data-at]').forEach(e=>{const f=FX[e.dataset.fx],a=AT[e.dataset.at];if(e.dataset.fx==='grow')gsap.set(e,{scaleX:0});else gsap.set(e,{opacity:0});f(e,a);});
// the line draws itself across the chart run
const line=q('#line'),lineG=q('#line-g');const L=line.getTotalLength();
[line,lineG].forEach(p=>{p.style.strokeDasharray=L;p.style.strokeDashoffset=L;});
const prog={v:0};
const drawKeys=[[AT['s2:dibuka'],.02],[AT['s2:jebol'],.34],[AT['s2:4.963'],.5],[AT['s2:4.904,29'],1]];
function lineU(t){if(t<=drawKeys[0][0])return 0;for(let i=0;i<drawKeys.length-1;i++){const[a,x]=drawKeys[i],[b,y]=drawKeys[i+1];if(t<b)return x+(y-x)*(t-a)/(b-a);}return 1;}
// the 5.000 line breaks at "jebol": shards fall from the crossing point, seeded by index
const sh=qa('.shard');const sx=${(px(10.95)).toFixed(1)},sy=${(py(5000)).toFixed(1)};
sh.forEach((el,i)=>{const a=(i*137.5)*Math.PI/180,d=170+((i*83)%320);
 gsap.set(el,{x:sx,y:sy,opacity:0,transformOrigin:'50% 50%'});
 tl.set(el,{opacity:.95},JEBOL);
 tl.to(el,{x:sx+Math.cos(a)*d,y:sy+Math.abs(Math.sin(a))*d*.55+70,rotation:(i%2?1:-1)*(180+i*20),opacity:0,duration:1.3,ease:'power3.out'},JEBOL);});
// breadth wall: dots colour in by group as each count is spoken
const dots=qa('.dt');
dots.forEach((d,i)=>{let g=i<COUNTS[0]?0:i<COUNTS[0]+COUNTS[1]?1:2;const c=['${RED}','${GREEN}','#8C9299'][g];const t=[AT['s3:624'],AT['s3:57'],AT['s3:37']][g];const span=[1.05,.42,.42][g];const off=[i,i-COUNTS[0],i-COUNTS[0]-COUNTS[1]][g]/COUNTS[g]*span;tl.to(d,{backgroundColor:c,duration:.05,ease:'none'},t+off);});
// photographs on the far plane
BG.forEach(([a,b,id])=>{const el=q('#'+id);if(a===0){gsap.set(el,{opacity:.95});}else tl.fromTo(el,{opacity:0},{opacity:.58,duration:.8,ease:'power2.out'},a);if(b<DUR)tl.to(el,{opacity:0,duration:.6,ease:'power2.in'},b-.5);});
tl.to('#phshade',{opacity:0,duration:.5,ease:'power2.in'},BG[0][1]-.5);
tl.to('#black',{opacity:1,duration:.5,ease:'power2.in'},END-.1);
tl.to('#rail',{opacity:0,duration:.3},END-.1);
tl.to('#tape',{opacity:0,duration:.05},END+.4);
tl.to('#blur',{opacity:0,duration:.05},END+.4);
tl.to('#outro',{opacity:1,duration:.35,ease:'power2.out'},OUT+.1);
gsap.set('#outro',{opacity:0});
const ez=x=>x<=0?0:x>=1?1:x*x*x*(x*(6*x-15)+10);
function cam(t){let s=0;for(const[a,to]of MOVES){const from=s;s=from+(to-from)*ez((t-(a-.48))/.8);}return s;}
const SH=${JSON.stringify([[at("s1:anjlok"), 8], [at("s2:jebol"), 13], [at("s2:4.904,29"), 8], [at("s3:624"), 6]])};
function shake(t){let a=0,b=0;for(const[s,amp]of SH){const d=t-s;if(d>=0&&d<.42){const k=amp*Math.pow(1-d/.42,2);a+=k*Math.sin(d*97);b+=k*Math.cos(d*71);}}return[a,b];}
const tape=q('#tape'),area=q('#area'),bigi=q('#bigidx'),gridp=q('#gridp'),blur=q('#blur'),tick=q('#tick'),grain=q('#grain'),idx=q('#ph-idx'),jkt=q('#ph-jkt');
const fmt=v=>{const f=v.toFixed(2).split('.');return f[0].replace(/\\B(?=(\\d{3})+$)/g,'.')+','+f[1];};
const PTS=${JSON.stringify(POINTS.map(([, v]) => v))},PU=[.02,.08,.34,.5,.94,1];
function idxAt(u){if(u<=0)return 5096.83;for(let i=0;i<PU.length-1;i++){if(u<PU[i+1]){const k=(u-PU[i])/(PU[i+1]-PU[i]);return PTS[i]+(PTS[i+1]-PTS[i])*Math.max(0,k);}}return PTS[PTS.length-1];}
function render(t){
 const[sxx,syy]=shake(t),c=cam(t);
  tape.style.transform='translate3d('+(-c*ST-t*${V}+sxx).toFixed(2)+'px,'+syy.toFixed(2)+'px,0)';
 gridp.style.transform='translate3d('+(-(c*ST*.32+t*9)%120).toFixed(2)+'px,0,0)';
 blur.style.transform='translate3d('+(-(c*ST*1.6+t*46)%1700).toFixed(1)+'px,0,0)';
 const u=lineU(t);line.style.strokeDashoffset=lineG.style.strokeDashoffset=(L*(1-u)).toFixed(1);
 area.style.clipPath='inset(0 '+((1-u)*100).toFixed(1)+'% 0 0)';
 const v=idxAt(u);const lab=fmt(u>=1?4904.29:v);tick.textContent='IHSG '+lab;bigi.textContent=lab;bigi.style.color=v<5000?'${RED}':'#fff';
 // slow push on the photographs, proportional to time
 idx.style.transform='scale('+(1.02+t*.014).toFixed(4)+')';
 jkt.style.transform='scale('+(1.04+(t-70)*.003).toFixed(4)+')';
 const g=Math.floor(t*14);grain.style.transform='translate3d('+(-((g*37)%100))+'px,'+(-((g*61)%100))+'px,0)';
}
const c0={t:0};
tl.to(c0,{t:DUR,duration:DUR,ease:'none',onUpdate:()=>render(c0.t)},0);
window.addEventListener('hf-seek',e=>render(e.detail.time));
render(0);
window.__timelines["world"]=tl;
})();
</script></template>`;
writeFileSync("PROJECT/hyperframes/compositions/world.html", world);

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:64px;right:104px;top:1296px;height:244px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:Montserrat,sans-serif;font-weight:800;font-size:60px;line-height:1.26;word-spacing:.08em;color:#fff;text-shadow:0 3px 0 #000,0 0 22px rgba(0,0,0,.95)}
.w{display:inline-block;padding:0 10px;border-radius:4px}`,
  (id, w) => `tl.fromTo("#${id}",{backgroundColor:"rgba(229,37,42,0)"},{backgroundColor:"rgba(229,37,42,1)",duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{backgroundColor:"rgba(229,37,42,0)",duration:.08,ease:"none"},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{x:26,opacity:.15},{x:0,opacity:1,duration:.16,ease:"power3.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "The Tape", INK);
writeFileSync("PROJECT/beats.json", JSON.stringify({ AT, moves, outroAt }, null, 1));
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration);
