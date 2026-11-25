// Plumbing for one episode's world composition. The look, panel transition and HUD behaviour are passed in per episode.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { collectAt } from "./hflib.mjs";

// Channel identity for the outro card and moving signature: _tools/series.json, overridable per call via o.channel/o.handle/o.series.
// Fallback: ../SERIES.json (root of series folder) which carries account.handle etc.
const SERIES_FILE = new URL("./series.json", import.meta.url);
const SERIES_ROOT = new URL("./series.json", import.meta.url);
const _sf = existsSync(SERIES_FILE) ? JSON.parse(readFileSync(SERIES_FILE, "utf8")) : {};
const _sr = existsSync(SERIES_ROOT) ? JSON.parse(readFileSync(SERIES_ROOT, "utf8")) : {};
const SERIES = {
  channel: _sf.channel || _sr.account?.name || "AUDIRA",
  handle:  _sf.handle  || _sr.account?.handle || "",
  series:  _sf.series  || _sr.title || "AUDIRA",
  slug:    _sf.slug    || _sr.account?.code?.toLowerCase() || "",
  cta:     _sf.cta     || _sr.account?.cta || "",
};

export function sceneKeys(TL) {
  const K = {};
  TL.scenes.forEach((s) => { K[s.id] = s.start; K[s.id + "e"] = s.end; });
  K.end = TL.speech_end;
  K.dur = TL.duration;
  K.outro = +(TL.speech_end + 0.25).toFixed(3);
  return K;
}

const OUTRO_CSS = `#outro{position:absolute;inset:0;background:#0B3D2E;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:240px;box-sizing:border-box;z-index:20}
#outro img{width:520px;display:block}
#outro .cr{margin-top:44px;font-family:Outfit,sans-serif;font-weight:600;font-size:46px;color:#fff;letter-spacing:.01em}
#outro .sr{margin-top:18px;font-family:Outfit,sans-serif;font-weight:400;font-size:27px;color:#A3E635;letter-spacing:.06em}
#outro .cta{margin-top:52px;font-family:Outfit,sans-serif;font-weight:700;font-size:36px;color:#fff;letter-spacing:.02em;padding:18px 48px;border:3px solid #A3E635;border-radius:16px}`;

export function writeWorld(TL, at, o) {
  const ch = { channel: o.channel ?? SERIES.channel, handle: o.handle ?? SERIES.handle, series: o.series ?? SERIES.series, cta: o.cta ?? SERIES.cta };
  const K = { ...sceneKeys(TL), ...(o.K || {}) };
  const OUT = K.outro;
  const AT = collectAt(o.html, at, o.extraAt || []);
  const html = `<template><style>#root{position:absolute;inset:0;overflow:hidden;background:${o.bg}}
#gl{position:absolute;inset:0;width:1080px;height:1920px;display:block}
#grain{position:absolute;left:0;top:0;width:1280px;height:2120px;background:url(assets/img/grain.png);opacity:${o.grain ?? 0.05};mix-blend-mode:overlay;pointer-events:none;z-index:9}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,rgba(0,0,0,0) 52%,rgba(0,0,0,${o.vig ?? 0.45}) 100%);pointer-events:none;z-index:8}
#capfloor{position:absolute;left:0;right:0;top:1230px;height:440px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,${o.capfloor ?? 0.5}) 42%,rgba(0,0,0,${o.capfloor ?? 0.5}) 70%,rgba(0,0,0,0));z-index:7;pointer-events:none}
.p{position:absolute;left:56px;right:110px;top:236px;z-index:10;transform-origin:50% 50%}
#chip{position:absolute;left:56px;top:186px;z-index:11;font-family:${o.chipFont||"Inter,sans-serif"};font-weight:700;font-size:23px;letter-spacing:.04em;color:${o.chipColor||"#fff"};opacity:.82}
.nb{font-variant-numeric:tabular-nums}
${OUTRO_CSS}
#sig{position:absolute;left:0;top:0;z-index:19;font-family:Outfit,sans-serif;font-weight:600;font-size:28px;letter-spacing:.08em;color:#fff;opacity:.32;text-shadow:0 1px 3px rgba(0,0,0,.6);white-space:nowrap;pointer-events:none}
${o.css}</style>
<div id="root" data-composition-id="world" data-start="0" data-duration="${TL.duration}" data-width="1080" data-height="1920" data-layout-allow-overflow data-layout-allow-overlap>
<canvas id="gl" width="1080" height="1920"></canvas>
<div id="grain"></div><div id="vig"></div><div id="capfloor"></div>
<div id="chip">${o.chip||"ILUSTRASI, BUKAN CUPLIKAN ASLI"}</div>
${o.html}
<div id="outro"><img src="assets/brand/stacked-reversed.svg" alt=""><div class="cr">Created by Agus Dwi R.</div><div class="sr">${ch.channel}${ch.handle ? ` &middot; ${ch.handle}` : ""}</div><div class="sr">${ch.series} &middot; EP ${o.ep}</div>${ch.handle ? `<div class="cta">${ch.cta || "Subscribe " + ch.handle}</div>` : ""}</div>
${o.sig?`<div id="sig">AUDIRA${ch.handle ? ` &middot; ${ch.handle}` : ""}</div>`:""}
</div>
<script>
(function(){
const K=${JSON.stringify(K)},AT=${JSON.stringify(AT)},DUR=${TL.duration},OUT=${OUT};
const tl=gsap.timeline({paused:true});
const q=(s)=>document.querySelector(s);
const FX={
 up:(e,t)=>tl.fromTo(e,{y:54,opacity:0},{y:0,opacity:1,duration:.42,ease:'power4.out'},t),
 left:(e,t)=>tl.fromTo(e,{x:90,opacity:0},{x:0,opacity:1,duration:.4,ease:'power4.out'},t),
 pop:(e,t)=>tl.fromTo(e,{scale:.7,opacity:0},{scale:1,opacity:1,duration:.38,ease:'back.out(1.5)'},t),
 fade:(e,t)=>tl.fromTo(e,{opacity:0},{opacity:1,duration:.3,ease:'none'},t),
 grow:(e,t)=>tl.fromTo(e,{scaleX:0},{scaleX:1,duration:.65,ease:'power3.out'},t),
 growy:(e,t)=>tl.fromTo(e,{scaleY:0},{scaleY:1,duration:.65,ease:'power3.out'},t),
 stamp:(e,t)=>tl.fromTo(e,{scale:1.9,rotation:-7,opacity:0},{scale:1,rotation:-3,opacity:1,duration:.2,ease:'power4.in'},t),
 ${o.fxExtra || ""}
};
document.querySelectorAll('#root [data-at]').forEach(e=>{
  const f=FX[e.dataset.fx||'up'];const a=AT[e.dataset.at];
  if(e.dataset.fx==='grow')gsap.set(e,{scaleX:0});else if(e.dataset.fx==='growy')gsap.set(e,{scaleY:0});else gsap.set(e,{opacity:0});
  f(e,a);
});
const PIN=${o.panelIn},POUT=${o.panelOut};
document.querySelectorAll('#root .p').forEach(p=>{
  const first=p.dataset.first==='1';
  const a=p.dataset.in==='@0'?0:(AT[p.dataset.in]??K[p.dataset.in]);
  const b=p.dataset.out==='@END'?OUT-.1:(AT[p.dataset.out]??K[p.dataset.out]);
  gsap.set(p,{visibility:'hidden',opacity:0});
  tl.set(p,{visibility:'visible'},first?0:Math.max(0,a-.14));
  if(first)tl.set(p,{opacity:1},0);else PIN(tl,p,a);
  POUT(tl,p,b);
  tl.set(p,{visibility:'hidden'},b+.04);
});
${o.outroIn||"gsap.set('#outro',{opacity:0});tl.to('#outro',{opacity:1,duration:.3,ease:'power2.out'},OUT);"}
// counters: <b class="ct" data-from data-to data-a data-b data-dec>
const cts=[...document.querySelectorAll('.ct')].map(e=>({e,from:+e.dataset.from||0,to:+e.dataset.to,a:AT[e.dataset.a]??K[e.dataset.a],d:+e.dataset.d||1,dec:+e.dataset.dec||0,pre:e.dataset.pre||'',suf:e.dataset.suf||''}));
const fmt=(v,d)=>v.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const eout=(x)=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
const grain=q('#grain');
let draw=null,last=0;
const HUD=${o.hud || "(t)=>{}"};
const SIG=(function(){const e=q('#sig');if(!e)return null;const P=[[690,1200],[60,1200],[700,660],[60,930],[640,240],[380,1120]];let h=0;for(const ch of ${JSON.stringify(o.sig||"")})h=(h*31+ch.charCodeAt(0))>>>0;const ord=P.map((p,i)=>[p,(h>>>(i*3))%97+i]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);return (t)=>{const k=Math.floor(t/18)%ord.length;const w=e.offsetWidth||520,hh=e.offsetHeight||34;const x=Math.max(40,Math.min(ord[k][0],1080-40-w));const y=Math.max(190,Math.min(ord[k][1],1300-hh));e.style.transform='translate('+x+'px,'+y+'px)';e.style.visibility=t>=OUT?'hidden':'visible';};})();
function all(t){last=t;for(const c of cts)c.e.textContent=c.pre+fmt(c.from+(c.to-c.from)*eout((t-c.a)/c.d),c.dec)+c.suf;
 const g=Math.floor(t*12);grain.style.transform='translate3d('+(-((g*37)%100))+'px,'+(-((g*61)%100))+'px,0)';HUD(t);if(SIG)SIG(t);if(draw)draw(t);}
const c={t:0};
tl.to(c,{t:DUR,duration:DUR,ease:'none',onUpdate:()=>all(c.t)},0);
window.addEventListener('hf-seek',e=>all(e.detail.time));
all(0);
window.__hf=window.__hf||{};window.__hf.buildReady=window.__hf.buildReady||{};
window.__hf.buildReady.world2d=import('./assets/lib/world2d.js').then(m=>{draw=m.create(q('#gl'),K,AT);draw(last);});
window.__timelines["world"]=tl;
})();
</script></template>`;
  writeFileSync("hf/compositions/world.html", html);
  writeFileSync("beats.json", JSON.stringify({ K, AT, outroAt: OUT }, null, 1));
  return { K, AT };
}
