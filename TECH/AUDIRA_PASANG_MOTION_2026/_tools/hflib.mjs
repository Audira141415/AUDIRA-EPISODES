// Shared plumbing for both episodes: word anchors, caption builder, root index writer.
// Visual identity lives in each episode's build-video.mjs, not here.
import { readFileSync, writeFileSync } from "node:fs";

export function loadTimeline(epDir) {
  return JSON.parse(readFileSync(`${epDir}/timeline.json`, "utf8"));
}

const clean = (s) => s.replace(/[.,:;?!]+$/, "");

export function anchors(TL) {
  return function at(spec) {
    const m = spec.match(/^(s\d):([^#+]+?)(?:#(\d+))?(?:([+-][\d.]+))?$/);
    if (!m) throw new Error("bad anchor " + spec);
    const [, sc, word, nth, off] = m;
    const hits = TL.words.filter((w) => w.scene === sc && clean(w.text) === word);
    const hit = hits[(nth ? +nth : 1) - 1];
    if (!hit) throw new Error("anchor not found " + spec);
    return +(hit.start + (off ? +off : 0)).toFixed(3);
  };
}

export function groupWords(words, maxWords = 6, maxChars = 30) {
  const groups = [];
  let cur = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((s, x) => s + x.text.length + 1, 0) + w.text.length;
    const split = prev && (prev.scene !== w.scene || /[.?:;!]$/.test(prev.text) || (/,$/.test(prev.text) && cur.length >= 2) || cur.length >= maxWords || chars > maxChars);
    if (split) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  groups.push(cur);
  return groups;
}

// wordTween receives (id, word) and returns GSAP calls for the active-word treatment.
export function writeCaptions(epDir, TL, css, wordTween, groupIn) {
  const groups = groupWords(TL.words);
  let html = "", js = "", wid = 0;
  groups.forEach((g, i) => {
    const s = +(g[0].start - 0.04).toFixed(3);
    const nextS = i < groups.length - 1 ? groups[i + 1][0].start - 0.04 : g[g.length - 1].end + 0.35;
    const dur = +Math.max(nextS - s, 0.3).toFixed(3);
    const words = g.map((w) => {
      const id = `w${wid++}`;
      js += wordTween(id, w);
      return `<span class="w" id="${id}">${w.text}</span>`;
    }).join(" ");
    html += `<div class="cap clip" id="g${i}" data-start="${s}" data-duration="${dur}" data-track-index="2"><div class="capin" id="gi${i}">${words}</div></div>\n`;
    if (groupIn) js += groupIn(`gi${i}`, s);
  });
  const out = `<template><style>${css}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
<script>const tl=gsap.timeline({paused:true});
${js}window.__timelines["captions"]=tl;</script></template>`;
  writeFileSync(`${epDir}/PROJECT/HyperFrames_Remotion/compositions/captions.html`, out);
  return groups.length;
}

export function writeIndex(epDir, TL, title, bg) {
  const index = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>html,body{margin:0;background:${bg}}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TL.duration}" data-fps="30" data-width="1080" data-height="1920">
<div id="world" data-composition-id="world" data-composition-src="compositions/world.html" data-start="0" data-duration="${TL.duration}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
<div id="captions" style="z-index:30" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${(TL.speech_end + 0.4).toFixed(2)}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920"></div>
<audio id="mix" class="clip" data-start="0" data-duration="${TL.duration}" data-track-index="3" data-volume="1" src="assets/audio/mix.wav"></audio>
</div>
<script>window.__timelines=window.__timelines||{};window.__timelines["main"]=gsap.timeline({paused:true});</script>
</body></html>`;
  writeFileSync(`${epDir}/PROJECT/HyperFrames_Remotion/index.html`, index);
}

// Panels and reveals share one rule set: a panel enters and exits on the film's axis, reveals key to word times.
export function collectAt(html, at, extra = []) {
  const toks = new Set(extra);
  for (const m of html.matchAll(/data-(?:at|in|out|a|t)="([^"]+)"/g)) if (m[1].includes(":")) toks.add(m[1]);
  return Object.fromEntries([...toks].map((t) => [t, at(t)]));
}
