// Layout probe (browser side). Bundled only by stills.mjs (never by the studio or render:final):
// stills.mjs copies this file next to a generated entry in <project>/.audira/ so "remotion" resolves
// from the project's own node_modules (one Remotion instance).
//
// After every frame Remotion seeks to, it measures every visible text block in the DOM and logs one
// line "AUDIRA_LAYOUT {json}" that stills.mjs collects with onBrowserLog. A delayRender handle keeps
// the screenshot waiting until the measurement is done, so nothing in the frame changes.
//
// Skipped on purpose: elements inside [data-layout-ignore] (the AudiraSignature watermark) and text
// whose cumulative opacity is below 0.35 (fading in/out). Text painted into WebGL textures is not
// DOM text and is not measured here (the jury still judges it by eye).
import { delayRender, continueRender } from "remotion";

const MIN_OPACITY = 0.35;
const raf = () => new Promise((r) => requestAnimationFrame(() => r()));

const parseColor = (c) => {
  const m = String(c || "").match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};

function opacityOf(el) {
  let o = 1;
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") return 0;
    o *= Number(cs.opacity);
    if (o < MIN_OPACITY) return o;
  }
  return o;
}

// nearest ancestor (or self) that paints an opaque-ish box behind the text
function boxBehind(el) {
  for (let e = el, i = 0; e && i < 6; e = e.parentElement, i++) {
    const cs = getComputedStyle(e);
    const bg = parseColor(cs.backgroundColor);
    if (bg && bg.a >= 0.55) return bg;
    if (cs.backgroundImage && cs.backgroundImage !== "none" && /gradient/.test(cs.backgroundImage)) return { gradient: true };
    if (cs.backdropFilter && cs.backdropFilter !== "none") return { blur: true };
  }
  return null;
}

function measure(frame) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const byEl = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TITLE)$/.test(el.tagName) || el.closest("[data-layout-ignore]")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const r of rects) { x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
    const prev = byEl.get(el);
    if (prev) {
      prev.text = (prev.text + " " + text).slice(0, 60);
      prev.x0 = Math.min(prev.x0, x0); prev.y0 = Math.min(prev.y0, y0); prev.x1 = Math.max(prev.x1, x1); prev.y1 = Math.max(prev.y1, y1);
    } else byEl.set(el, { el, text: text.slice(0, 60), x0, y0, x1, y1 });
  }
  const items = [];
  for (const it of byEl.values()) {
    const { el } = it;
    if (it.x1 < 0 || it.y1 < 0 || it.x0 > vw || it.y0 > vh) continue; // fully off screen (parked)
    const opacity = opacityOf(el);
    if (opacity < MIN_OPACITY) continue;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    // effective scale of CSS transforms: rendered height vs layout height
    const scale = el.offsetHeight > 0 ? box.height / el.offsetHeight : 1;
    // truncated: the element hides its own overflow (ellipsis, nowrap box) or an ancestor clips it
    let clipped = (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "visible") || cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 2;
    for (let e = el.parentElement, i = 0; !clipped && e && i < 8; e = e.parentElement, i++) {
      const pcs = getComputedStyle(e);
      if (pcs.overflow === "visible" && pcs.overflowX === "visible" && pcs.overflowY === "visible") continue;
      const r = e.getBoundingClientRect();
      if (it.x0 < r.left - 2 || it.x1 > r.right + 2 || it.y0 < r.top - 2 || it.y1 > r.bottom + 2) clipped = true;
    }
    items.push({
      el, text: it.text,
      x: +it.x0.toFixed(1), y: +it.y0.toFixed(1), w: +(it.x1 - it.x0).toFixed(1), h: +(it.y1 - it.y0).toFixed(1),
      fontPx: +(parseFloat(cs.fontSize) * (Number.isFinite(scale) && scale > 0 ? scale : 1)).toFixed(1),
      weight: Number(cs.fontWeight) || 400,
      color: parseColor(el instanceof SVGElement && cs.fill && /^rgb/.test(cs.fill) ? cs.fill : cs.color), // SVG text paints with fill, not color
      stroke: parseFloat(cs.webkitTextStrokeWidth || "0") || 0,
      shadow: cs.textShadow && cs.textShadow !== "none",
      box: boxBehind(el),
      opacity: +opacity.toFixed(2),
      clipped,
      // glyph box: the line box minus half-leading and the empty ascender/descender band,
      // so two tightly stacked lines (kicker over title) do not count as overlapping
      inset: (() => {
        const fs = parseFloat(cs.fontSize);
        const lh = cs.lineHeight === "normal" ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2;
        const k = Number.isFinite(scale) && scale > 0 ? scale : 1;
        return +((Math.max(0, lh - fs) / 2 + fs * 0.12) * k).toFixed(1);
      })(),
    });
  }
  // overlaps between unrelated blocks (not parent/child), as share of the smaller block
  const overlaps = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ay0 = a.y + a.inset, ay1 = a.y + a.h - a.inset, by0 = b.y + b.inset, by1 = b.y + b.h - b.inset;
    const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const iy = Math.max(0, Math.min(ay1, by1) - Math.max(ay0, by0));
    const share = (ix * iy) / Math.max(1, Math.min(a.w * Math.max(1, ay1 - ay0), b.w * Math.max(1, by1 - by0)));
    if (share > 0.2) overlaps.push({ a: i, b: j, share: +share.toFixed(2) });
  }
  return { frame, vw, vh, items: items.map(({ el, ...rest }) => rest), overlaps };
}

function hook(setFrame) {
  return function probedSetFrame(f, ...rest) {
    const out = setFrame.call(this, f, ...rest);
    const handle = delayRender(`audira layout probe ${f}`);
    (async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
        await raf(); await raf(); await raf();
        console.log("AUDIRA_LAYOUT " + JSON.stringify(measure(f)));
      } catch (e) {
        console.log("AUDIRA_LAYOUT_ERROR " + String(e?.message || e));
      } finally {
        continueRender(handle);
      }
    })();
    return out;
  };
}

// Remotion assigns window.remotion_setFrame inside a React effect, after this module runs:
// intercept the assignment and wrap whatever it sets.
let current;
Object.defineProperty(window, "remotion_setFrame", {
  configurable: true,
  get: () => current,
  set: (fn) => { current = typeof fn === "function" && !fn.__audiraProbe ? Object.assign(hook(fn), { __audiraProbe: true }) : fn; },
});
