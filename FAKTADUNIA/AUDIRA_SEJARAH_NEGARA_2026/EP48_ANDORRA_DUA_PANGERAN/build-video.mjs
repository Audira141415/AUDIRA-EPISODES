// EP48 ANDORRA DUA PANGERAN: CLAYWORLD. A plasticine Pyrenees valley on a studio table, a tiny stone town and two
// thrones with two crowns. Panels are chunky clay cards (cream slab, thick bottom edge) with an Andorra tricolour
// kicker; titles in Fredoka, years in IBM Plex Mono.
// Run: node build-video.mjs
import { copyFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const INK = "#2A1E16", CREAM = "#FFF4E2", EDGE = "#D9BF9A", BG = "#9CC3DB";
const AB = "#10069F", AY = "#FEDF00", AR = "#D50032", FB = "#0055A4", FR = "#EF4135", PUR = "#6B2C91", GRN = "#3E8E41";

const row = (b, s, a, cls = "") => `<div class="cd row ${cls}" data-at="${a}" data-fx="card"><b>${b}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const kk = (n, s) => `<div class="kk"><i>${n}</i>${s}</div>`;
const flag = (cols, dir = "row", w = [1, 1, 1]) => `<i class="fl" style="flex-direction:${dir}">${cols.map((c, i) => `<s style="background:${c};flex:${w[i]}"></s>`).join("")}</i>`;
const FR_F = flag([FB, "#fff", FR]), ES_F = flag([AR, "#F1BF00", AR], "column", [1, 2, 1]), AD_F = flag([AB, AY, AR]);

const html = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=IBM+Plex+Mono:wght@500;700&display=block">
<div class="pre"><span style="font-family:'Fredoka',sans-serif;font-weight:700">DUA KEPALA</span><span style="font-family:'Fredoka',sans-serif;font-weight:500">andorra</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:700">1278</span><span style="font-family:'IBM Plex Mono',monospace;font-weight:500">1993</span></div>
<div class="p" data-first="1" data-in="@0" data-out="s2:Ini">
  ${kk("EP 48", "FAKTA SEJARAH NEGARA")}
  <div class="h1">DUA KEPALA<br><em>NEGARA</em></div>
  <div class="chips"><i class="ch2" data-at="s1:Prancis" data-fx="stampc">${FR_F} PRESIDEN PRANCIS</i></div>
</div>
<div class="p" data-in="s2:Ini" data-out="s3">
  ${kk("01", "ANDORRA")}
  ${row(`${AD_F} ANDORRA`, "negara kecil di Pegunungan Pyrenees", "s2:Andorra", "fr")}
  ${row(`${FR_F} PRANCIS · ${ES_F} SPANYOL`, "terjepit di antara dua negara besar", "s2:terjepit", "sm")}
  ${row("2 KEPALA NEGARA", "disebut pangeran bersama (co-prince)", "s2:dua", "am")}
</div>
<div class="p" data-in="s3" data-out="s4">
  ${kk("02", "PANGERAN BERSAMA")}
  ${row("① USKUP URGELL", "dari kota di seberang perbatasan Spanyol", "s3:Uskup", "pu")}
  ${row("② PRESIDEN PRANCIS", "siapa pun yang sedang menjabat", "s3:Presiden", "bl")}
</div>
<div class="p" data-in="s4" data-out="s5">
  ${kk("03", "AWAL MULANYA")}
  <div class="cd row big" data-at="s4:1278" data-fx="card"><b>1278</b><span>perjanjian berbagi kekuasaan</span></div>
  ${row("USKUP URGELL × COUNT FOIX", "berebut Andorra, lalu sepakat berbagi", "s4:berebut", "pu")}
  <div class="cd chain" data-at="s4:Hak" data-fx="card"><i class="lk on">COUNT FOIX</i><u>→</u><i class="lk" data-at="s4:raja" data-fx="lit">RAJA PRANCIS</i><u>→</u><i class="lk" data-at="s4:presiden" data-fx="lit">PRESIDEN PRANCIS</i></div>
</div>
<div class="p" data-in="s5" data-out="s6">
  ${kk("04", "KONSTITUSI")}
  <div class="cd row big" data-at="s5:1993" data-fx="card"><b>1993</b><span>konstitusi tertulis pertama Andorra</span></div>
  ${row("DISETUJUI RAKYAT", "lewat pemungutan suara, Maret 1993", "s5:menyetujui", "gn")}
  ${row("DITANDATANGANI", "Uskup Urgell + Presiden François Mitterrand", "s5:menandatanganinya", "pu")}
</div>
<div class="p" data-in="s6" data-out="s7">
  ${kk("05", "RAJA GADUNGAN")}
  <div class="cd row big" data-at="s6:1934" data-fx="card"><b>1934</b><span>petualang Boris Skossyreff</span></div>
  <div class="st" data-at="s6:Raja" data-fx="stampc">“BORIS I, RAJA ANDORRA”</div>
  ${row("MENYATAKAN PERANG KE USKUP", "", "s6:perang", "rd")}
  <div class="cd row am" data-at="s6:Delapan" data-fx="card"><b><span class="ct" data-from="0" data-to="8" data-a="s6:Delapan" data-d="0.9">8</span> HARI KEMUDIAN</b><span>ditangkap aparat Spanyol</span></div>
</div>
<div class="p" data-in="s7" data-out="s8">
  ${kk("06", "BISA MENEKAN")}
  <div class="cd row big" data-at="s7:2009" data-fx="card"><b>2009</b><span>Presiden Nicolas Sarkozy</span></div>
  ${row("“SAYA MUNDUR”", "ancaman bila aturan bank tak diubah", "s7:mengancam", "rd")}
  ${row("SURGA PAJAK → REFORMASI", "Andorra mereformasi pajak, 2013–2016", "s7:mereformasi", "gn")}
</div>
<div class="p" data-in="s8" data-out="s8:Menurut">
  ${kk("07", "SEJAK 1278")}
  <div class="cd row big" data-at="s8:tujuh" data-fx="card"><b><span class="ct" data-from="0" data-to="700" data-a="s8:tujuh" data-d="0.9">700</span>+ TAHUN</b><span>aturan dua pangeran masih berlaku</span></div>
</div>
<div class="p" data-in="s8:Menurut" data-out="@END">
  <div class="cd q">Aneh atau justru cerdas punya dua kepala negara? Tulis di komentar!</div>
</div>`;

const css = `
.pre{position:absolute;left:-2000px;top:0;opacity:0}
.p{transform-origin:0% 0%}
.cd{position:relative;background:${CREAM};border-radius:22px;box-shadow:inset 0 -6px 0 rgba(160,120,80,.18),0 9px 0 ${EDGE},0 18px 30px rgba(40,25,10,.38)}
.kk{display:inline-flex;align-items:center;gap:16px;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:28px;letter-spacing:.06em;color:#fff;margin-bottom:18px;padding:6px 20px 6px 6px;background:${AB};border-radius:16px;box-shadow:0 6px 0 #07045E}
.kk i{font-style:normal;background:${AY};color:${INK};padding:2px 12px;border-radius:11px;font-family:'IBM Plex Mono',monospace}
.h1{font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:132px;line-height:.92;letter-spacing:-.01em;color:#FFF8EC;-webkit-text-stroke:14px ${INK};paint-order:stroke fill;text-shadow:0 10px 0 ${INK},0 18px 26px rgba(30,15,5,.45)}
.h1 em{font-style:normal;color:${AY}}
.fl{display:inline-flex;width:62px;height:42px;border-radius:7px;overflow:hidden;box-shadow:0 3px 0 rgba(0,0,0,.25);vertical-align:middle;flex:none}
.fl s{display:block;text-decoration:none}
.chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:26px;align-items:center}
.ch,.ch2{display:inline-flex;align-items:center;gap:12px;font-style:normal;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:46px;line-height:1;padding:12px 24px 10px;border-radius:18px;transform:rotate(-3deg);box-shadow:0 7px 0 rgba(0,0,0,.25),0 14px 24px rgba(0,0,0,.3)}
.ch{color:${INK};background:${CREAM}}.ch2{color:#fff;background:${FB}}
.row{display:flex;flex-direction:column;margin-top:18px;padding:12px 26px 14px 26px;border-left:16px solid ${AB};max-width:900px;width:max-content;box-sizing:border-box}
.row b{display:flex;align-items:center;gap:14px;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:54px;line-height:1.04;color:${INK}}
.row>span{display:block;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:500;font-size:26px;line-height:1.3;color:#6A5440;max-width:820px}
.row b span{display:inline;font:inherit;color:inherit}
.row.fr b .fl{width:80px;height:54px}
.row.sm b{font-size:46px}
.row.pu{border-left-color:${PUR}}.row.pu b{color:${PUR}}
.row.bl{border-left-color:${FB}}.row.bl b{color:${FB}}
.row.rd{border-left-color:${AR}}.row.rd b{color:${AR}}
.row.gn{border-left-color:${GRN}}.row.gn b{color:${GRN}}
.row.am{border-left-color:${AY}}
.row.big b{font-family:'IBM Plex Mono',monospace;font-size:96px;letter-spacing:-.03em;line-height:.95}
.row.am b{font-family:'Fredoka',Arial,sans-serif;font-size:60px}
.chain{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:18px;padding:14px 20px;max-width:930px;box-sizing:border-box;width:max-content}
.chain u{text-decoration:none;font-family:'Fredoka',sans-serif;font-weight:700;font-size:40px;color:${INK}}
.lk{font-style:normal;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:33px;padding:8px 14px 6px;border-radius:12px;background:#EADBC4;color:#7A6650}
.lk.on{background:${AR};color:#fff;box-shadow:0 4px 0 #8A0022}
.lk.lt{background:${FB};color:#fff;box-shadow:0 4px 0 #003070}
.st{display:inline-block;margin-top:18px;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:50px;color:${INK};background:${AY};padding:10px 24px 8px;border-radius:16px;transform:rotate(-3deg);box-shadow:0 7px 0 #B89A00,0 14px 24px rgba(0,0,0,.3)}
.q{margin-top:20px;padding:20px 30px 18px;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:60px;line-height:1.06;color:${INK};border-left:16px solid ${AY};max-width:860px}`;

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
copyFileSync("RoomEnvironment.js", "PROJECT/HyperFrames_Remotion/assets/lib/RoomEnvironment.js");
const { AT, K } = writeWorld(TL, at, { sig: "EP48_ANDORRA_DUA_PANGERAN",
  ep: "48", bg: BG, vig: 0.3, grain: 0.045, capfloor: 0.0, html, css, chipFont: `'IBM Plex Mono',Consolas,monospace`, chipColor: "#FFF4E2",
  chip: "DIORAMA PLASTISIN &middot; FIGUR BUKAN POTRET TOKOH",
  extraAt: ["s1:kepala", "s1:presiden", "s1:presiden#2", "s1:Prancis", "s1:lain",
    "s2:Andorra", "s2:Pyrenees", "s2:Prancis", "s2:Spanyol", "s2:dua", "s2:pangeran",
    "s3:Uskup", "s3:Spanyol", "s3:Presiden", "s3:siapa", "s3:menjabat",
    "s4:1278", "s4:Uskup", "s4:berebut", "s4:sepakat", "s4:berbagi", "s4:Hak", "s4:raja", "s4:presiden",
    "s5:konstitusi", "s5:1993", "s5:Rakyatnya", "s5:pemungutan", "s5:suara", "s5:menandatanganinya", "s5:uskup", "s5:Presiden", "s5:Mitterrand",
    "s6:1934", "s6:Boris", "s6:menobatkan", "s6:Raja", "s6:perang", "s6:uskup", "s6:Delapan", "s6:kemudian", "s6:ditangkap", "s6:Spanyol",
    "s7:menekan", "s7:2009", "s7:Sarkozy", "s7:mengancam", "s7:mundur", "s7:perbankannya", "s7:surga", "s7:Beberapa", "s7:mereformasi",
    "s8:Negara", "s8:tujuh", "s8:Menurut", "s8:dua", "s8:AUDIRA"],
  fxExtra: `card:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'flex'},t);tl.fromTo(e,{opacity:0,scaleX:1.12,scaleY:.62,y:-14,transformOrigin:'50% 100%'},{opacity:1,scaleX:1,scaleY:1,y:0,duration:.34,ease:'back.out(2.2)',immediateRender:false},t);},
 stampc:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:'inline-flex'},t);tl.fromTo(e,{scale:1.7,opacity:0,rotation:-9},{scale:1,opacity:1,rotation:-3,duration:.22,ease:'back.out(1.6)',immediateRender:false},t);},
 lit:(e,t)=>{gsap.set(e,{opacity:1});tl.set(e,{backgroundColor:'#0055A4',color:'#fff',boxShadow:'0 4px 0 #003070'},t);tl.fromTo(e,{scale:1.25},{scale:1,duration:.3,ease:'back.out(2)',immediateRender:false},t);},`,
  panelIn: `(tl,p,a)=>tl.fromTo(p,{opacity:0,y:40,scaleY:.9},{opacity:1,y:0,scaleY:1,duration:.38,ease:'back.out(1.6)'},a-.02)`,
  panelOut: `(tl,p,b)=>tl.to(p,{opacity:0,y:-30,duration:.22,ease:'power2.in'},b-.24)`,
});

const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:56px;right:110px;top:1290px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:'Fredoka',Arial,sans-serif;font-weight:700;font-size:74px;line-height:1.04;color:#fff;-webkit-text-stroke:12px #2A1E16;paint-order:stroke fill;text-shadow:0 7px 0 #2A1E16,0 10px 20px rgba(0,0,0,.45)}
.w{display:inline-block;margin:0 .13em}`,
  (id, w) => `tl.fromTo("#${id}",{color:"#fff",scale:1},{color:"${AY}",scale:1.08,duration:.05,ease:"none"},${w.start.toFixed(3)});tl.to("#${id}",{color:"#fff",scale:1,duration:.12},${w.end.toFixed(3)});\n`,
  (id, s) => `tl.fromTo("#${id}",{opacity:0,y:24,scaleY:.8},{opacity:1,y:0,scaleY:1,duration:.22,ease:"back.out(2)"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Andorra Dua Pangeran", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro);
