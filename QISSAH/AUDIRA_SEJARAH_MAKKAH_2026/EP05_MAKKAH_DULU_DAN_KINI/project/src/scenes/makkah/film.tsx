// SEJARAH MAKKAH EP05 "Makkah dulu dan kini": the long-form film (16:9 master) and the two shorts.
// One continuous engraved world: the valley maquette (hub), the Zubaidah channel set to the east and
// the sea chart to the west. Everything is timed from timeline.json (see tl.ts and ch/*.tsx).
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { INK } from "./engraving.ts";
import { Hub, Sky } from "./hub.tsx";
import { SeaSet, ZubaidahSet } from "./sets.tsx";
import { CH, TIMELINE, TOTAL, VO_END, clamp01, ramp, smooth, window01, type Word } from "./tl.ts";
import type { Callout, ChapterDef, Key, QuotePair, V3 } from "./types.ts";
import { ch00 } from "./ch/ch00.tsx";
import { ch01 } from "./ch/ch01.tsx";
import { ch02 } from "./ch/ch02.tsx";
import { ch03 } from "./ch/ch03.tsx";
import { ch04 } from "./ch/ch04.tsx";
import { ch05 } from "./ch/ch05.tsx";
import { ch06 } from "./ch/ch06.tsx";
import { ch07 } from "./ch/ch07.tsx";
import { ch08 } from "./ch/ch08.tsx";
import { ch09 } from "./ch/ch09.tsx";
import S01 from "./short01.json";
import S02 from "./short02.json";

export const CHAPTERS: ChapterDef[] = [ch00, ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09];
export const FILM_SECONDS = TOTAL;
const PROFILE = { ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0008 };
const SERIF = "Georgia, 'Times New Roman', serif";

/** Chapter windows: each chapter owns time from half-way through the gap before it. */
const WINDOWS = CHAPTERS.map((c, i) => {
  const a = i === 0 ? -10 : (CH(CHAPTERS[i - 1].id).end + CH(c.id).start) / 2;
  const b = i === CHAPTERS.length - 1 ? TOTAL + 10 : (CH(c.id).end + CH(CHAPTERS[i + 1].id).start) / 2;
  return { a, b };
});
const chapterIndex = (t: number) => {
  for (let i = WINDOWS.length - 1; i >= 0; i--) if (t >= WINDOWS[i].a) return i;
  return 0;
};

// ---------------------------------------------------------------- camera (Catmull-Rom through all keys)
const KEYS: Key[] = (() => {
  const all = CHAPTERS.flatMap((c) => c.keys()).sort((p, q) => p.t - q.t);
  const out: Key[] = [];
  for (const k of all) if (!out.length || k.t - out[out.length - 1].t > 0.25) out.push(k);
  return out;
})();
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) => {
  const u2 = u * u, u3 = u2 * u;
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
};
export function cameraAt(t: number): { pos: V3; tgt: V3; fov: number } {
  if (t <= KEYS[0].t) return { pos: KEYS[0].pos, tgt: KEYS[0].tgt, fov: KEYS[0].fov ?? 36 };
  const last = KEYS[KEYS.length - 1];
  if (t >= last.t) return { pos: last.pos, tgt: last.tgt, fov: last.fov ?? 36 };
  let i = 0;
  while (KEYS[i + 1].t < t) i++;
  const k0 = KEYS[Math.max(0, i - 1)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
  // gentle ease inside each segment keeps velocity continuous but avoids linear "robot" speed
  const raw = (t - k1.t) / (k2.t - k1.t);
  const u = raw * 0.7 + smooth(raw) * 0.3;
  const v = (a: V3, b: V3, c: V3, d: V3): V3 => [cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u), cr(a[2], b[2], c[2], d[2], u)];
  return { pos: v(k0.pos, k1.pos, k2.pos, k3.pos), tgt: v(k0.tgt, k1.tgt, k2.tgt, k3.tgt), fov: cr(k0.fov ?? 36, k1.fov ?? 36, k2.fov ?? 36, k3.fov ?? 36, u) };
}

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const c = cameraAt(t);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    // a small, slow handheld drift so holds never park
    const d = 0.025;
    cam.position.set(c.pos[0] + Math.sin(t * 0.37) * d, c.pos[1] + Math.sin(t * 0.29 + 1) * d * 0.6, c.pos[2] + Math.cos(t * 0.31) * d);
    cam.lookAt(new THREE.Vector3(...c.tgt));
    cam.fov = c.fov;
    cam.near = 0.05;
    cam.far = 400;
    cam.layers.enable(FX_LAYER);
    cam.updateProjectionMatrix();
  });
  return null;
};

const Lights: React.FC<{ center: V3; dusk: number }> = ({ center, dusk }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(center[0], 0, center[2]);
  const key = new THREE.Color("#fff1d6").lerp(new THREE.Color("#f0b878"), dusk);
  return (
    <>
      <primitive object={target} />
      <hemisphereLight args={["#fff4dc", "#8a6a44", 0.55 - dusk * 0.18]} />
      <directionalLight
        position={[center[0] - 13, 6 - dusk * 2.5, center[2] + 3]}
        target={target}
        intensity={2.6 - dusk * 0.8}
        color={key}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[center[0] + 8, 4, center[2] + 6]} intensity={0.45} color="#f4d9a8" />
    </>
  );
};

/** The whole world at timeline time t. */
export const World: React.FC<{ t: number }> = ({ t }) => {
  const i = chapterIndex(t);
  const ch = CHAPTERS[i];
  const hub = ch.hub(t);
  const cam = cameraAt(t);
  const dusk = ch.dusk ? ch.dusk(t) : 0;
  // side sets: mounted while any chapter that uses them is near
  const near = (c: ChapterDef, k: number) => t >= WINDOWS[k].a - 2.5 && t <= WINDOWS[k].b + 2.5;
  const seaCh = CHAPTERS.findIndex((c, k) => c.sea && near(c, k));
  const zubCh = CHAPTERS.findIndex((c, k) => c.zub && near(c, k));
  const farSet = Math.abs(cam.tgt[0]) > 30;
  const extras = CHAPTERS.map((c, k) => (c.World && t >= WINDOWS[k].a - 1.5 && t <= WINDOWS[k].b + 1.5 ? <c.World key={c.id} t={t} /> : null));
  const bg = new THREE.Color(INK.paper).lerp(new THREE.Color("#d9c29a"), dusk * 0.6).getStyle();
  return (
    <>
      <Rig t={t} />
      <fog attach="fog" args={[bg, farSet ? 30 : 16, farSet ? 110 : 52]} />
      <Lights center={cam.tgt} dusk={dusk} />
      <Sky />
      <Hub {...hub} cam={cam} />
      {zubCh >= 0 ? <ZubaidahSet {...CHAPTERS[zubCh].zub!(t)} /> : null}
      {seaCh >= 0 ? <SeaSet {...CHAPTERS[seaCh].sea!(t)} /> : null}
      {extras}
      <Finish frame={Math.round(t * 30)} background={bg} profile={PROFILE} exposure={0.82 - dusk * 0.06} envIntensity={0.25} hdri="warmStudio" aoRadius={0.25} />
    </>
  );
};

// ================================================================= 2D layers
const card = (scale = 1): React.CSSProperties => ({
  background: "rgba(241,230,204,0.95)",
  border: `${3 * scale}px solid ${INK.gold}`,
  outline: `${1.5 * scale}px solid ${INK.sepia}`,
  outlineOffset: 5 * scale,
  boxShadow: "0 10px 24px rgba(40,24,8,0.28)",
  color: INK.iron,
  fontFamily: SERIF,
});

const enterOut = (t: number, a: number, b: number) => {
  const k = window01(t, a, b, 0.35, 0.35);
  return { opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${0.97 + 0.03 * k})` };
};

const CalloutCard: React.FC<{ c: Callout; t: number; wide: boolean }> = ({ c, t, wide }) => {
  const a = enterOut(t, c.a, c.b);
  if (a.opacity <= 0.001) return null;
  const big = c.big ? (wide ? 62 : 74) : wide ? 40 : 50;
  const pos: React.CSSProperties = wide
    ? { tl: { left: 96, top: 90 }, tr: { right: 96, top: 90 }, tc: { left: 0, right: 0, top: 90 }, bl: { left: 96, bottom: 250 }, br: { right: 96, bottom: 250 }, ml: { left: 96, top: 420 }, mr: { right: 96, top: 420 } }[c.pos]
    : { tl: { left: 60, top: 210 }, tr: { right: 60, top: 210 }, tc: { left: 0, right: 0, top: 210 }, bl: { left: 60, bottom: 640 }, br: { right: 60, bottom: 640 }, ml: { left: 60, top: 600 }, mr: { right: 60, top: 600 } }[c.pos];
  const center = c.pos === "tc";
  return (
    <div style={{ position: "absolute", ...pos, display: "flex", justifyContent: center ? "center" : c.pos.endsWith("r") ? "flex-end" : "flex-start", ...a }}>
      <div style={{ ...card(), maxWidth: center ? (wide ? 1250 : 940) : wide ? 760 : 900, padding: wide ? "18px 30px 20px" : "22px 32px 24px", textAlign: center ? "center" : "left" }}>
        {c.kicker ? <div style={{ fontSize: wide ? 21 : 27, fontWeight: 700, letterSpacing: wide ? 4 : 4, color: INK.goldDeep, marginBottom: 8 }}>{c.kicker}</div> : null}
        <div style={{ fontSize: big, fontWeight: 700, lineHeight: 1.12 }}>{c.title}</div>
        {c.sub ? <div style={{ fontSize: wide ? 27 : 34, fontStyle: "italic", color: INK.sepia, marginTop: 8 }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Quotes: React.FC<{ q: QuotePair; t: number; wide: boolean }> = ({ q, t, wide }) => {
  const a = enterOut(t, q.a, q.b);
  if (a.opacity <= 0.001) return null;
  const one = (s: { who: string; text: string }) => (
    <div style={{ ...card(), width: wide ? 700 : 900, padding: wide ? "20px 28px" : "22px 30px" }}>
      <div style={{ fontSize: wide ? 21 : 27, fontWeight: 700, letterSpacing: 3, color: INK.goldDeep, marginBottom: 10 }}>{s.who}</div>
      <div style={{ fontSize: wide ? 33 : 40, lineHeight: 1.25 }}>{s.text}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...(wide ? { top: 90 } : { top: 210 }), display: "flex", flexDirection: wide ? "row" : "column", alignItems: "center", justifyContent: "center", gap: wide ? 40 : 26, ...a }}>
      {one(q.left)}
      {one(q.right)}
    </div>
  );
};

const ChapterCard: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      {CHAPTERS.filter((c) => c.card.num).map((c) => {
        const s = CH(c.id).start;
        const a = enterOut(t, s - 0.3, s + 3.3);
        if (a.opacity <= 0.001) return null;
        return (
          <div key={c.id} style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", ...a }}>
            <div style={{ ...card(1.3), padding: "26px 60px 30px", textAlign: "center", minWidth: 760 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 10, color: INK.goldDeep }}>{c.card.num}</div>
              <div style={{ height: 2, background: INK.sepia, opacity: 0.6, margin: "12px 80px 14px" }} />
              <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.08 }}>{c.card.title}</div>
              <div style={{ fontSize: 30, fontStyle: "italic", color: INK.sepia, marginTop: 12 }}>{c.card.tag}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// captions: pages of words, active word in gold ink
type Page = { s: number; e: number; words: Word[] };
export function paginate(words: Word[], maxChars: number, maxWords = 99): Page[] {
  const pages: Page[] = [];
  let cur: Word[] = [];
  let len = 0;
  const flush = () => {
    if (cur.length) pages.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
    cur = [];
    len = 0;
  };
  for (const w of words) {
    if (cur.length && (len + w.w.length + 1 > maxChars || cur.length >= maxWords)) flush();
    cur.push(w);
    len += w.w.length + 1;
    if (/[.?!]$/.test(w.w) && len > maxChars * 0.45) flush();
  }
  flush();
  return pages;
}
const LONG_PAGES = paginate(TIMELINE.clips.flatMap((c) => c.words), 64);

const pageAt = (pages: Page[], t: number) => {
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const end = i + 1 < pages.length ? Math.min(pages[i + 1].s - 0.05, p.e + 0.6) : p.e + 0.6;
    if (t >= p.s - 0.12 && t < end) return p;
  }
  return null;
};

const CaptionsWide: React.FC<{ t: number }> = ({ t }) => {
  const p = pageAt(LONG_PAGES, t);
  if (!p) return null;
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 130, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(30,27,24,0.78)", padding: "12px 26px 14px", borderRadius: 6, maxWidth: 1400, textAlign: "center", fontFamily: SERIF, fontSize: 40, lineHeight: 1.3, color: "#efe2c4" }}>
        {p.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.05;
          return (
            <span key={i} style={{ color: on ? "#f2c96a" : t > w.e ? "#efe2c4" : "rgba(239,226,196,0.8)" }}>
              {w.w}
              {i < p.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const CaptionsShort: React.FC<{ t: number; pages: Page[] }> = ({ t, pages }) => {
  const p = pageAt(pages, t);
  if (!p) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 420, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(30,27,24,0.8)", padding: "16px 28px 20px", borderRadius: 10, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 1.2, color: "#efe2c4", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.4em" }}>
        {p.words.map((w, i) => {
          const on = t >= w.s && t < w.e + 0.05;
          const k = on ? clamp01((t - w.s) / 0.12) : 0;
          return (
            <span key={i} style={{ display: "inline-block", color: on ? "#f2c96a" : "#efe2c4", transform: `scale(${1 + 0.04 * k * (1 - clamp01((t - w.s - 0.12) / 0.2))})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Outro: React.FC<{ a: number }> = ({ a }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fmt = useFormat();
  const k = ramp(t, a, a + 0.5);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ background: "#0B3D2E", opacity: k, alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: fmt.isWide ? 360 * fmt.scale : 420 * fmt.scale, height: "auto", transform: `scale(${0.94 + 0.06 * ramp(t, a, a + 1.2)})` }} />
      <div style={{ marginTop: 26 * fmt.scale, fontFamily: SERIF, fontSize: 34 * fmt.scale, color: "#e9dcbc", letterSpacing: 2 * fmt.scale, opacity: ramp(t, a + 0.4, a + 1.0) }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

const EndScreen: React.FC<{ t: number }> = ({ t }) => {
  const k = window01(t, VO_END + 0.8, TOTAL - 3, 0.8, 0.4);
  if (k <= 0.001) return null;
  const frame = (x: number, label: string) => (
    <div style={{ position: "absolute", left: x, top: 330, width: 576, opacity: k }}>
      <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, letterSpacing: 5, color: INK.sepia, textShadow: `0 0 8px ${INK.paper}`, marginBottom: 12 }}>{label}</div>
      <div style={{ width: 576, height: 324, border: `3px solid ${INK.gold}`, outline: `1.5px solid ${INK.sepia}`, outlineOffset: 6, background: "rgba(241,230,204,0.25)" }} />
    </div>
  );
  return (
    <>
      {frame(140, "TONTON BERIKUTNYA")}
      {frame(1920 - 140 - 576, "SERI SEJARAH MAKKAH")}
    </>
  );
};

/** 2D layer laid out at the format's layout size and scaled to the render size. */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fmt = useFormat();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: fmt.layout.width, height: fmt.layout.height, transform: `scale(${fmt.scale})`, transformOrigin: "0 0" }}>{children}</div>
    </AbsoluteFill>
  );
};

const CALLOUTS = CHAPTERS.flatMap((c) => (c.callouts ? c.callouts() : []));
const QUOTES = CHAPTERS.flatMap((c) => (c.quotes ? c.quotes() : []));

/** Long-form film (16:9 master; the same component renders 9:16 for checks). */
export const MakkahFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const fmt = useFormat();
  return (
    <AbsoluteFill style={{ backgroundColor: INK.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFShadowMap }} camera={{ fov: 36, position: [0, 4, 14] }}>
        <World t={t} />
      </ThreeCanvas>
      <Layout>
        {CALLOUTS.map((c, i) => <CalloutCard key={i} c={c} t={t} wide={fmt.isWide} />)}
        {QUOTES.map((q, i) => <Quotes key={i} q={q} t={t} wide={fmt.isWide} />)}
        <ChapterCard t={t} />
        <EndScreen t={t} />
        {t < VO_END + 0.4 ? <CaptionsWide t={t} /> : null}
      </Layout>
      <Outro a={TOTAL - 3} />
      <AudiraSignature seed="sejarah-makkah-ep05" handle="@audira" />
    </AbsoluteFill>
  );
};

// ================================================================= shorts
type Seg = { kind: string; start: number; end: number; worldStart: number; chapter?: string };
type ShortData = { id: string; total: number; voEnd: number; segments: Seg[]; words: Word[] };
export const SHORTS: Record<string, ShortData> = { short01: S01 as ShortData, short02: S02 as ShortData };
const HOOKS: Record<string, { kicker: string; title: string }> = {
  short01: { kicker: "MAKKAH · 1941", title: "Tawaf sambil berenang" },
  short02: { kicker: "HAJI 2026", title: "Cuma 6.497 orang naik kapal" },
};

export function shortWorld(sid: string, ts: number): { t: number; seg: Seg } {
  const S = SHORTS[sid];
  let seg = S.segments[0];
  for (const g of S.segments) if (ts >= g.start) seg = g;
  return { t: seg.worldStart + (ts - seg.start), seg };
}

export const MakkahShort: React.FC<{ sid: string }> = ({ sid }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ts = frame / fps;
  const S = SHORTS[sid];
  const { t, seg } = shortWorld(sid, ts);
  const pages = useMemo(() => paginate(S.words, 20, 4), [S]);
  const hook = HOOKS[sid];
  const outroSeg = S.segments[S.segments.length - 1];
  const endA = outroSeg.start - 0.2;
  const logoA = S.total - 2.2;
  return (
    <AbsoluteFill style={{ backgroundColor: INK.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows={{ type: THREE.PCFShadowMap }} camera={{ fov: 36, position: [0, 4, 14] }}>
        <World t={t} />
      </ThreeCanvas>
      <Layout>
        {seg.kind === "span" ? CALLOUTS.map((c, i) => <CalloutCard key={i} c={c} t={t} wide={false} />) : null}
        {seg.kind === "span" ? QUOTES.map((q, i) => <Quotes key={i} q={q} t={t} wide={false} />) : null}
        {/* hook title: strong frame from the first second */}
        {(() => {
          const k = 1 - ramp(ts, S.segments[0].end - 0.3, S.segments[0].end + 0.2);
          if (k <= 0) return null;
          return (
            <div style={{ position: "absolute", left: 60, right: 60, top: 230, display: "flex", justifyContent: "center", opacity: k }}>
              <div style={{ ...card(1.4), padding: "26px 40px 30px", textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 8, color: INK.goldDeep }}>{hook.kicker}</div>
                <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 10 }}>{hook.title}</div>
              </div>
            </div>
          );
        })()}
        {/* end card */}
        {(() => {
          const k = window01(ts, endA, logoA + 0.3, 0.4, 0.3);
          if (k <= 0) return null;
          return (
            <div style={{ position: "absolute", left: 60, right: 60, top: 520, display: "flex", justifyContent: "center", opacity: k }}>
              <div style={{ ...card(1.4), padding: "34px 44px 38px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6, color: INK.goldDeep }}>CERITA LENGKAPNYA</div>
                <div style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>Tonton video panjangnya di YouTube Audira</div>
              </div>
            </div>
          );
        })()}
        {ts < S.voEnd + 0.4 ? <CaptionsShort t={ts} pages={pages} /> : null}
      </Layout>
      <Outro a={logoA} />
      <AudiraSignature seed={`sejarah-makkah-ep05-${sid}`} handle="@audira" outroSeconds={S.total - logoA} />
    </AbsoluteFill>
  );
};
export const MakkahShort01: React.FC = () => <MakkahShort sid="short01" />;
export const MakkahShort02: React.FC = () => <MakkahShort sid="short02" />;
export const SHORT01_SECONDS = (S01 as ShortData).total;
export const SHORT02_SECONDS = (S02 as ShortData).total;
void interpolate;
