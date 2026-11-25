// EP27 HAJAR, ZAMZAM, TUJUH KALI. SULAMFORGE: an embroidery world (linen in a wooden hoop, satin-stitch hills, running-
// stitch lanes sewn by a needle). Panels are indigo cloth patches with a gold running-stitch border (Karla kickers and
// body, Playfair Display headings, Amiri Arabic in pale saffron).
// Transition: stitch-outline draw-in. The dashed gold border is sewn around the patch (masked stroke draw, 0.24 s), then
// the cloth fills in; exit fades the cloth and pulls the thread back out. All within 0.3 s. Lap counters (hook "7 KALI"
// and the s5 "x / 7") follow the same lap keys the needle uses (K.lapA / K.lapB). Arabic copied verbatim from the verse
// file, cut only at clear phrase bounds. Run: node build-video.mjs
import { copyFileSync, readFileSync } from "node:fs";
import { loadTimeline, anchors, writeCaptions, writeIndex } from "../_tools/hflib.mjs";
import { writeWorld } from "../_tools/shell.mjs";

const TL = loadTimeline(".");
const at = anchors(TL);
const BG = "#2a1c13", IND = "rgba(30,38,82,.95)", CREAM = "#F6EEDC", GOLDC = "#E2B65C", MAD = "#C4472F", SAFF = "#F3D9A0", LAV = "#D9D3EE";

const QF = readFileSync("../_research/quran/EP27_hajar_zamzam.txt", "utf8");
const verse = (ref) => { const m = QF.match(new RegExp(`^QS ${ref.replace(":", "\\:")} \\| (.+)$`, "m")); if (!m) throw new Error("verse " + ref); return m[1].trim(); };
const V37 = verse("14:37"), V158 = verse("2:158");
const A37 = V37.split(" ").slice(0, 12).join(" "); // up to al-muharram, before the second "rabbana"
const W158 = V158.split(" "), A158 = W158.slice(1, 7).join(" "); // after the hizb mark, up to the first pause mark
if (!QF.includes(A37) || !V37.split(" ")[12].startsWith("رَبَّنَا".slice(0, 1))) throw new Error("14:37 cut: " + A37);
if (W158[0].length !== 1 || W158[7].length !== 1 || !QF.includes(A158)) throw new Error("2:158 cut: " + A158);

let pid = 0;
const card = (inner) => { const id = `mk${pid++}`; return `<div class="card"><svg class="st"><defs><mask id="${id}" maskUnits="userSpaceOnUse"><rect class="mr" pathLength="100" stroke-dashoffset="0"/></mask></defs><rect class="sr" pathLength="100" mask="url(#${id})"/></svg><div class="cb">${inner}</div></div>`; };
const P = (inA, outA, inner, first) => `<div class="p"${first ? ' data-first="1"' : ""} data-in="${inA}" data-out="${outA}">${card(inner)}</div>`;
const ref = (r) => `<span class="rf">${r}</span>`;

const html = `
${P("@0", "s2", `<div class="k">KISAH DALAM AL-QUR'AN &middot; 27</div>
  <div class="h">Hajar &amp; Zamzam</div>
  <div class="cnt"><b id="cA" class="nb">1</b><span>KALI</span><i>di antara dua bukit</i></div>
  <div class="sub" data-at="s1:Jutaan" data-fx="rise">Jutaan orang mengulang langkahnya, sampai hari ini</div>`, true)}
${P("s2", "s2:Saat", `<div class="k">HADIS ${ref("HR Bukhari &middot; Ibnu Abbas")}</div>
  <div class="h m">Ke lembah dekat Ka'bah</div>
  <div class="sub" data-at="s2:Hajar" data-fx="rise">Hajar dan bayinya, Ismail</div>`)}
${P("s2:Saat", "s3", `<div class="k">MAKKAH, SAAT ITU</div>
  <div class="ls"><span>Tidak ada seorang pun</span><span data-at="s2:air" data-fx="rise">Tidak ada air</span></div>`)}
${P("s3", "s3:Hajar", `<div class="k">YANG DITINGGALKAN</div>
  <div class="ls"><span>Sekantong kurma</span><span data-at="s3:sedikit" data-fx="rise">Sedikit air</span></div>
  <div class="ln" data-at="s3:berjalan" data-fx="rise">lalu ia berjalan pergi</div>`)}
${P("s3:Hajar", "s4", `<div class="k">PERCAKAPAN ${ref("HR Bukhari 3364")}</div>
  <div class="dl"><b>HAJAR</b><q>Apakah Allah yang memerintahkanmu?</q></div>
  <div class="dl" data-at="s3:menjawab" data-fx="rise"><b class="ib">IBRAHIM</b><q>Ya.</q></div>
  <div class="dl" data-at="s3:berkata" data-fx="rise"><b>HAJAR</b><q>Kalau begitu, Dia tidak akan menyia-nyiakan kami.</q></div>`)}
${P("s4", "s5", `<div class="k">DOA DARI KEJAUHAN ${ref("QS Ibrahim 14:37")}</div>
  <div class="ar">${A37}</div>
  <div class="tr">&ldquo;Ya Tuhan kami, aku tempatkan keturunanku di lembah yang tak bertanaman, di dekat rumah-Mu yang suci.&rdquo;</div>`)}
${P("s5", "s5:Ia", `<div class="h m">Air habis.</div>
  <div class="sub" data-at="s5:Bayinya" data-fx="rise">Bayinya kehausan.</div>
  <div class="ln" data-at="s5:naik" data-fx="rise">Naik ke bukit Shafa, mencari siapa pun</div>`)}
${P("s5:Ia", "s6", `<div class="k">SHAFA &harr; MARWAH</div>
  <div class="cnt"><b id="cB" class="nb">1</b><span>/ 7</span><i data-at="s5:Tidak#2" data-fx="rise">Tidak ada siapa pun</i></div>
  <div class="sub" data-at="s5:mengulanginya" data-fx="rise">Ia mengulanginya tujuh kali</div>`)}
${P("s6", "s6:Itulah", `<div class="k">KALI TERAKHIR</div>
  <div class="h m">Ia mendengar suara.</div>
  <div class="ls sm"><span data-at="s6:memancar" data-fx="rise">Air memancar dari tanah</span><span data-at="s6:membendungnya" data-fx="rise">Dibendung dengan kedua tangan</span></div>`)}
${P("s6:Itulah", "s7", `<div class="k">ITULAH ${ref("HR Bukhari 3364")}</div>
  <div class="h zz">Zamzam</div>`)}
${P("s7", "s7:Dan", `<div class="k">SABDA RASULULLAH ${ref("HR Bukhari 3364")}</div>
  <div class="dl"><q>Itulah asal mula orang berjalan di antara Shafa dan Marwah.</q></div>`)}
${P("s7:Dan", "s8", `<div class="k">SYIAR ALLAH ${ref("QS Al-Baqarah 2:158")}</div>
  <div class="ar">${A158}</div>
  <div class="tr">&ldquo;Sesungguhnya Safa dan Marwah merupakan sebagian syiar (agama) Allah.&rdquo;</div>`)}
${P("s8", "s8:Kisah", `<div class="k">RENUNGAN</div>
  <div class="h m">Tawakal bukan diam menunggu.</div>
  <div class="sub" data-at="s8:Hajar" data-fx="rise">Hajar yakin, lalu tetap berlari.</div>
  <div class="ask" data-at="s8:Menurut" data-fx="rise">Di bagian mana kita sering lupa berusaha?</div>`)}`;

const css = `
#capfloor{background:linear-gradient(180deg,rgba(24,16,10,0),rgba(24,16,10,.4) 45%,rgba(24,16,10,.4) 70%,rgba(24,16,10,0))}
#chip{background:rgba(30,38,82,.86);padding:6px 13px 5px;border-radius:8px;font-size:19px;letter-spacing:.07em;outline:2px dashed rgba(226,182,92,.7);outline-offset:-5px}
.card{position:relative;display:inline-block;max-width:100%}
.st{position:absolute;left:-10px;top:-10px;width:calc(100% + 20px);height:calc(100% + 20px);overflow:visible;z-index:2;pointer-events:none}
.st rect{x:5px;y:5px;width:calc(100% - 10px);height:calc(100% - 10px);rx:22px;ry:22px;fill:none}
.st .sr{stroke:${GOLDC};stroke-width:4.5px;stroke-dasharray:.62 .42;stroke-linecap:round}
.st .mr{stroke:#fff;stroke-width:14px;stroke-dasharray:100 100}
.cb{position:relative;box-sizing:border-box;border-radius:17px;padding:26px 34px 28px;background:${IND};background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,rgba(0,0,0,0) 2px 5px),repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,rgba(0,0,0,0) 2px 5px);box-shadow:0 18px 40px rgba(20,10,4,.5)}
.k{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:Karla,sans-serif;font-weight:800;font-size:24px;letter-spacing:.14em;color:${GOLDC};margin-bottom:10px}
.rf{display:inline-block;font-family:Karla,sans-serif;font-weight:800;font-size:21px;letter-spacing:.04em;color:#1E2652;background:${GOLDC};padding:4px 12px 3px;border-radius:6px;white-space:nowrap}
.h{font-family:"Playfair Display",serif;font-weight:800;font-size:78px;line-height:1.04;color:${CREAM}}
.h.m{font-size:54px;line-height:1.12}
.h.zz{font-size:110px;letter-spacing:.02em;color:#9CC4FF}
.sub{font-family:Karla,sans-serif;font-weight:600;font-size:36px;line-height:1.24;color:${LAV};margin-top:12px}
.ls{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.ls span{font-family:Karla,sans-serif;font-weight:700;font-size:46px;line-height:1.14;color:${CREAM};padding-left:50px;position:relative}
.ls.sm span{font-size:38px}
.ls span:before{content:"\\00d7";position:absolute;left:4px;top:-.06em;font-family:Karla,sans-serif;font-weight:800;font-size:1.15em;color:#F08A6E}
.ln{font-family:Karla,sans-serif;font-weight:700;font-size:36px;color:${SAFF};margin-top:14px;padding-top:12px;border-top:3px dashed rgba(226,182,92,.55)}
.cnt{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-top:4px}
.cnt b{font-family:"Playfair Display",serif;font-weight:900;font-size:150px;line-height:1;color:${GOLDC};min-width:.62em;text-align:center}
.cnt span{font-family:Karla,sans-serif;font-weight:800;font-size:52px;letter-spacing:.1em;color:${CREAM}}
.cnt i{font-family:Karla,sans-serif;font-style:normal;font-weight:600;font-size:32px;color:${LAV};flex-basis:100%;margin-top:-6px}
.dl{margin-top:12px}
.dl b{display:block;font-family:Karla,sans-serif;font-weight:800;font-size:21px;letter-spacing:.18em;color:#F08A6E;margin-bottom:2px}
.dl b.ib{color:#C8A27A}
.dl q{display:block;font-family:"Playfair Display",serif;font-style:italic;font-weight:600;font-size:42px;line-height:1.2;color:${CREAM}}
.dl q:before{content:"\\201C"}.dl q:after{content:"\\201D"}
.ar{font-family:Amiri,serif;direction:rtl;text-align:right;font-size:56px;line-height:1.8;color:${SAFF}}
.tr{font-family:Karla,sans-serif;font-weight:500;font-style:italic;font-size:33px;line-height:1.3;color:#E6E0F4;margin-top:6px}
.ask{display:inline-block;margin-top:16px;font-family:Karla,sans-serif;font-weight:800;font-size:36px;line-height:1.2;color:#1E2652;background:${SAFF};padding:11px 20px;border-radius:10px;outline:2px dashed rgba(196,71,47,.8);outline-offset:-6px}
`;

const lapA = [[0.35, 0], [3.3, 7]];
const lapB = [[at("s5:berlari"), 0], [at("s5:Marwah"), 1], [at("s5:Tidak#2") + 0.5, 1], [TL.scenes.find((s) => s.id === "s6").start + 0.25, 7]];

copyFileSync("../_tools/lib3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/lib3d.js");
copyFileSync("world3d.js", "PROJECT/HyperFrames_Remotion/assets/lib/world3d.js");
const WORLD_AT = ["s1:Jutaan", "s2:membawa", "s2:Ismail", "s2:Ka'bah", "s3:sekantong", "s3:sedikit", "s3:berjalan", "s3:Hajar", "s3:menjawab", "s3:berkata",
  "s4:lembah", "s4:rumah-Mu", "s5:Air", "s5:Bayinya", "s5:naik", "s5:mencari", "s5:berlari", "s5:Marwah", "s5:Tidak#2", "s5:mengulanginya",
  "s6:terakhir", "s6:suara", "s6:memancar", "s6:membendungnya", "s6:mengisi", "s6:Zamzam", "s7:asal", "s7:Shafa", "s7:Al-Qur'an", "s8:Hajar", "s8:Kisah", "s8:AUDIRA"];
const { AT, K } = writeWorld(TL, at, {
  ep: "27", bg: BG, vig: 0.38, grain: 0.05, capfloor: 0.4, html, css, signature: "EP27_HAJAR_ZAMZAM_TUJUH_KALI",
  K: { lapA, lapB },
  chip: "ILUSTRASI &middot; TANPA MENGGAMBARKAN SOSOK NABI", chipFont: "Karla,sans-serif", chipColor: CREAM,
  extraAt: WORLD_AT,
  fxExtra: `rise:(e,t)=>{gsap.set(e,{display:'none'});tl.set(e,{display:''},t-.001);tl.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:.28,ease:'power3.out'},t);},`,
  panelIn: `(tl,p,a)=>{const m=p.querySelector('.mr'),c=p.querySelector('.cb');tl.set(p,{opacity:1},a-.1);tl.fromTo(m,{attr:{'stroke-dashoffset':100}},{attr:{'stroke-dashoffset':0},duration:.2,ease:'power2.inOut'},a-.1);tl.fromTo(c,{opacity:0,scale:.985},{opacity:1,scale:1,duration:.1,ease:'power2.out'},a-.02);}`,
  panelOut: `(tl,p,b)=>{const m=p.querySelector('.mr'),c=p.querySelector('.cb');tl.to(c,{opacity:0,duration:.1,ease:'none'},b-.34);tl.to(m,{attr:{'stroke-dashoffset':-100},duration:.14,ease:'power2.in'},b-.26);}`,
  hud: `(t)=>{const L=(a)=>{if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0]){const p=a[i-1],n=a[i];return p[1]+(n[1]-p[1])*(t-p[0])/(n[0]-p[0]);}return a[a.length-1][1];};const f=(v)=>String(Math.min(7,Math.max(1,Math.ceil(v-1e-6))));const A=q('#cA'),B=q('#cB');if(A)A.textContent=f(L(K.lapA));if(B)B.textContent=f(L(K.lapB));}`,
});
const n = writeCaptions(".", TL, `#root{position:absolute;inset:0}
.cap{position:absolute;left:60px;right:110px;top:1300px;height:250px}
.capin{position:absolute;left:0;right:0;bottom:0;margin:0 auto;width:fit-content;max-width:100%;box-sizing:border-box;text-align:center;font-family:Karla,sans-serif;font-weight:800;font-size:54px;line-height:1.28;color:${CREAM};background:rgba(30,38,82,.95);padding:12px 24px 14px;border-radius:18px;outline:3px dashed rgba(226,182,92,.75);outline-offset:-9px;box-shadow:0 10px 24px rgba(0,0,0,.4)}
.w{display:inline-block;margin:0 .05em;padding:0 .12em;border-radius:8px}`,
(id, w) => `tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(196,71,47,0)"},0);tl.set("#${id}",{color:"#FFFFFF",backgroundColor:"rgb(196,71,47)"},${w.start.toFixed(3)});tl.set("#${id}",{color:"${CREAM}",backgroundColor:"rgba(196,71,47,0)"},${w.end.toFixed(3)});\n`,
(id, s) => `tl.set("#${id}",{opacity:1},${s.toFixed(3)});tl.fromTo("#${id}",{y:7},{y:0,duration:.08,ease:"power2.out"},${s.toFixed(3)});\n`);
writeIndex(".", TL, "Hajar dan Zamzam", BG);
console.log("reveals", Object.keys(AT).length, "caption groups", n, "duration", TL.duration, "outro", K.outro, "lapB", JSON.stringify(lapB));
