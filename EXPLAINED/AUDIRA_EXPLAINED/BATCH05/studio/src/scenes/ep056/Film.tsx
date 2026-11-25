// AE-056 film: a time-travel crane over the approved TIMEFORGE diorama (front = past, back = future).
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { PCFSoftShadowMap, type PerspectiveCamera } from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { MANROPE, manropeReady, INK, INK_SOFT } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { Lights } from "./Cover.tsx";
import { Diorama } from "./Diorama.tsx";
import { FilmWorld, OMIT, wattWorld, WATT_LOCAL } from "./FilmWorld.tsx";
import { B, SEC, TIMELINE, Y, P, camAt, project, ramp, smooth, backOut, clamp01, trackPoint, type Word, type V3 } from "./timing.ts";

const BG = "#ebe7e0";
const TEAL = "#3fb8bd";
const TEAL_INK = "#13858a";

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as PerspectiveCamera;
    const pose = camAt(t);
    c.position.set(...pose.pos);
    c.fov = pose.fov;
    c.near = 0.3;
    c.far = 400;
    c.lookAt(...pose.target);
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------- captions: phrases of up to 5 words, broken at punctuation ----------
type Chunk = { a: number; b: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of TIMELINE.clips) {
    // split at punctuation; long segments into balanced pieces of <= 5 words; never a lone word
    const segs: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w) => {
      cur.push(w);
      if (/[,.!?]$/.test(w.w)) {
        segs.push(cur);
        cur = [];
      }
    });
    if (cur.length) segs.push(cur);
    const groups: Word[][] = [];
    for (const sg of segs) {
      if (sg.length <= 6) {
        groups.push(sg);
        continue;
      }
      const parts = Math.ceil(sg.length / 5);
      const size = Math.ceil(sg.length / parts);
      for (let i = 0; i < sg.length; i += size) groups.push(sg.slice(i, i + size));
    }
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i].length === 1 && groups.length > 1) {
        const j = i > 0 ? i - 1 : 1;
        if (groups[j].length < 6) {
          if (j < i) groups[j].push(...groups[i]);
          else groups[j].unshift(...groups[i]);
          groups.splice(i, 1);
        }
      }
    }
    groups.forEach((g) => out.push({ a: g[0].s - 0.08, b: g[g.length - 1].e + 0.25, words: g }));
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = out[i + 1].a - out[i].b < 0.7 ? out[i + 1].a : Math.min(out[i].b, out[i + 1].a);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const { width: W } = useVideoConfig();
  const k = W / 1080;
  if (t >= B.outroCard) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))];
  const ci = CHUNKS.indexOf(ch);
  const contIn = ci > 0 && CHUNKS[ci - 1].b >= ch.a - 1e-6;
  const contOut = ci < CHUNKS.length - 1 && ch.b >= CHUNKS[ci + 1].a - 1e-6;
  // the pill stays opaque across contiguous chunks; only the words change
  const o = (contIn ? 1 : smooth(ramp(t, ch.a, ch.a + 0.12))) * (contOut ? 1 : 1 - smooth(ramp(t, ch.b - 0.1, ch.b)));
  const to = (contIn ? 1 : smooth(ramp(t, ch.a, ch.a + 0.08))) * (contOut ? 1 : 1 - smooth(ramp(t, ch.b - 0.1, ch.b)));
  const rise = contIn ? 0 : (1 - outCubicL(ramp(t, ch.a, ch.a + 0.25))) * 14 * k;
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, top: (lines.length === 1 ? 1388 : 1318) * k, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ padding: `${16 * k}px ${34 * k}px ${18 * k}px`, borderRadius: 30 * k, background: "rgba(244,241,235,0.9)", boxShadow: `0 ${6 * k}px ${26 * k}px rgba(60,50,40,0.16)`, border: `${1.5 * k}px solid rgba(255,255,255,0.7)`, fontFamily: MANROPE, fontWeight: 700, fontSize: 56 * k, lineHeight: 1.16, color: INK, textAlign: "center" }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: "0.3em", whiteSpace: "nowrap", opacity: to }}>
            {ln.map((w, i) => {
              const active = t >= w.s - 0.03 && t < w.e + 0.05;
              const done = t >= w.e + 0.05;
              const pop = active ? backOut(clamp01((t - w.s + 0.03) / 0.18), 2) : 1;
              return (
                <span key={i} style={{ position: "relative", display: "inline-block", color: active ? TEAL_INK : done ? INK : "rgba(31,36,38,0.42)", transform: `translateY(${active ? (1 - pop) * 9 * k - 3 * k : 0}px) scale(${active ? 1.03 : 1})` }}>
                  {w.w}
                  {active && <span style={{ position: "absolute", left: 0, right: 0, bottom: -4 * k, height: 5 * k, borderRadius: 3 * k, background: TEAL, transform: `scaleX(${pop})` }} />}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
const outCubicL = (x: number) => 1 - Math.pow(1 - x, 3);

// ---------- era chip (top-left, below the signature band) ----------
const ERAS: { a: number; b: number; big: string; small: string }[] = [
  { a: B.tahun1771, b: SEC.KONTEKS[1] + 0.3, big: "1771", small: "Cromford, Inggris" },
  { a: B.newcomen, b: B.james - 0.12, big: "awal 1700-an", small: "pompa air tambang" },
  { a: B.james, b: B.pabrik1 - 0.12, big: "James Watt", small: "penyempurna, bukan penemu" },
  { a: B.tahun1830, b: SEC.REVEAL[1] + 0.4, big: "1830", small: "Liverpool – Manchester" },
];
const EraChip: React.FC<{ t: number }> = ({ t }) => {
  const { width: W } = useVideoConfig();
  const k = W / 1080;
  const e = ERAS.find((x) => t >= x.a - 0.05 && t < x.b);
  if (!e) return null;
  const inn = outCubicL(ramp(t, e.a - 0.05, e.a + 0.35));
  const out = 1 - smooth(ramp(t, e.b - 0.2, e.b));
  return (
    <div style={{ position: "absolute", left: 52 * k, top: 268 * k, opacity: inn * out, transform: `translateX(${(1 - inn) * -30 * k}px)`, fontFamily: MANROPE, padding: `${16 * k}px ${30 * k}px ${18 * k}px`, borderRadius: 26 * k, background: "rgba(244,241,235,0.9)", boxShadow: `0 ${6 * k}px ${22 * k}px rgba(60,50,40,0.14)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
        <div style={{ width: 20 * k, height: 20 * k, borderRadius: 10 * k, border: `${3 * k}px solid ${TEAL}`, background: BG, boxSizing: "border-box" }} />
        <div style={{ width: 120 * inn * k, height: 2 * k, background: "#aeb8b9" }} />
      </div>
      <div style={{ marginTop: 8 * k, fontSize: 78 * k, fontWeight: 300, letterSpacing: -1.5 * k, color: INK, lineHeight: 1.02, textShadow: "0 1px 12px rgba(235,231,224,0.9)" }}>{e.big}</div>
      <div style={{ marginTop: 6 * k, fontSize: 30 * k, fontWeight: 600, letterSpacing: 1 * k, color: INK_SOFT, textShadow: "0 1px 10px rgba(235,231,224,0.95)" }}>{e.small}</div>
    </div>
  );
};

// ---------- 3D callouts ----------
const CALLOUTS: { a: number; b: number; p: V3; text: string; side?: 1 | -1 }[] = [
  { a: B.digerakkan, b: B.kini - 0.15, p: [P.millWheel[0] + 0.2, P.millWheel[1] + 0.8, P.millWheel[2]], text: "roda air", side: 1 },
  { a: B.memompa, b: B.james - 0.15, p: [P.newcomen[0] - 1.55, Y.mid + 0.8, P.newcomen[2]], text: "tambang", side: -1 },
  { a: B.hemat - 0.1, b: B.pabrik1 - 0.15, p: wattWorld([WATT_LOCAL.condenser[0] - 0.08, 0.6, WATT_LOCAL.condenser[2]]), text: "kondensor terpisah", side: -1 },
  { a: B.memutar, b: B.pabrik1 - 0.15, p: wattWorld([WATT_LOCAL.flywheel[0], WATT_LOCAL.flywheel[1] + 0.75, 0.3]), text: "roda gila", side: 1 },
  { a: B.liverpool, b: SEC.PAYOFF[0], p: [...((): V3 => { const q = trackPoint(0.5); return [q[0], Y.back + 0.3, q[1]]; })()], text: "Liverpool", side: -1 },
  { a: B.manchester, b: SEC.PAYOFF[0], p: [...((): V3 => { const q = trackPoint(6.8); return [q[0], Y.back + 0.3, q[1]]; })()], text: "Manchester", side: 1 },
];
const Callouts: React.FC<{ t: number }> = ({ t }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  return (
    <>
      {CALLOUTS.filter((c) => t >= c.a - 0.05 && t < c.b).map((c) => {
        const pr = project(t, c.p, W, H);
        if (pr.behind) return null;
        const o = outCubicL(ramp(t, c.a - 0.05, c.a + 0.3)) * (1 - smooth(ramp(t, c.b - 0.15, c.b)));
        const L = 90 * k;
        const x = Math.min(W - 60 * k, Math.max(60 * k, pr.x));
        const y = Math.min(1250 * k, Math.max(470 * k, pr.y));
        return (
          <div key={c.text} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
            <div style={{ position: "absolute", left: x - 8 * k, top: y - 8 * k, width: 16 * k, height: 16 * k, borderRadius: 8 * k, background: TEAL, boxShadow: `0 0 0 ${5 * k}px rgba(63,184,189,0.25)` }} />
            <div style={{ position: "absolute", left: x - 1 * k, top: y - L * o, width: 2 * k, height: L * o, background: TEAL }} />
            <div
              style={{
                position: "absolute",
                top: y - L - 54 * k,
                left: Math.min(W - 40 * k - (c.text.length * 19 + 40) * k, Math.max(40 * k, x - (c.side === -1 ? 0.85 : 0.15) * (c.text.length * 19 + 40) * k)),
                whiteSpace: "nowrap",
                padding: `${8 * k}px ${20 * k}px`,
                borderRadius: 22 * k,
                background: "rgba(244,241,235,0.92)",
                boxShadow: `0 ${4 * k}px ${16 * k}px rgba(60,50,40,0.15)`,
                fontFamily: MANROPE,
                fontWeight: 700,
                fontSize: 34 * k,
                color: INK,
              }}
            >
              {c.text}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** Coal per unit of work: Newcomen vs Watt (research: about a quarter). */
const CoalCard: React.FC<{ t: number }> = ({ t }) => {
  const { width: W } = useVideoConfig();
  const k = W / 1080;
  const a = B.hemat - 0.05, b = B.memutar - 0.1;
  if (t < a || t >= b) return null;
  const o = outCubicL(ramp(t, a, a + 0.3)) * (1 - smooth(ramp(t, b - 0.2, b)));
  const row = (label: string, n: number, delay: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * k, marginTop: 10 * k }}>
      <div style={{ width: 190 * k, fontSize: 28 * k, fontWeight: 600, color: INK_SOFT }}>{label}</div>
      {Array.from({ length: n }, (_, i) => {
        const s = backOut(clamp01((t - a - delay - i * 0.08) / 0.25), 1.8);
        return <div key={i} style={{ width: 34 * k, height: 30 * k, borderRadius: `${12 * k}px ${16 * k}px ${10 * k}px ${14 * k}px`, background: "#222124", transform: `scale(${s})` }} />;
      })}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 64 * k, top: 580 * k, opacity: o, fontFamily: MANROPE, padding: `${18 * k}px ${26 * k}px`, borderRadius: 24 * k, background: "rgba(244,241,235,0.9)", boxShadow: `0 ${6 * k}px ${22 * k}px rgba(60,50,40,0.14)` }}>
      <div style={{ fontSize: 26 * k, fontWeight: 700, letterSpacing: 3 * k, color: TEAL_INK }}>BATU BARA</div>
      {row("Newcomen", 4, 0.1)}
      {row("Watt", 1, 0.45)}
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Manrope ep056 film"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const t = frame / fps;
  const f60 = Math.round(t * 60);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFSoftShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: 30, near: 0.3, far: 400, position: [0, 20, 50] }}
          >
            <fog attach="fog" args={[BG, 70, 160]} />
            <Rig t={t} />
            <Lights />
            <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[120, 64]} />
              <meshStandardMaterial color="#e3ded5" roughness={0.95} />
            </mesh>
            <Diorama t={t + 2.0} f60={f60} font={MANROPE} omit={OMIT} />
            <FilmWorld t={t} f60={f60} font={MANROPE} />
            <Finish frame={frame} background={BG} hdri="warmStudio" envIntensity={0.3} exposure={0.84} profile={COLOR_PROFILES.DOCUMENTARY_WARM} aoRadius={0.35} />
          </ThreeCanvas>
          <Callouts t={t} />
          <CoalCard t={t} />
          <EraChip t={t} />
          <Captions t={t} />
        </>
      ) : null}
      <Outro start={B.outroCard} />
    </AbsoluteFill>
  );
};
