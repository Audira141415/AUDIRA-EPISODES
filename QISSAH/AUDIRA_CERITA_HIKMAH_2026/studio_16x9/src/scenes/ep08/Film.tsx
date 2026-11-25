// EP08 "Mata Cinta Kopi Asin" (FELTCRAFT, 16:9, 1920x1080). Built on the REAL voice timeline.
// Sets: café (first night + flashbacks), garden party, his seaside memory, the home kitchen of
// forty years. Puppets pose on twos; the camera moves smoothly (motion-control rig).
// Audio is NOT played here: the lead mixes mix.wav + vo.wav (combine-vo.sh) and muxes it at render.

import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { clamp01, smooth, stepT } from "../../kits/feltcraft/core/motion";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { World } from "./World.tsx";
import { CLIPS, E, OUTRO_START, SHOTS, T, shotAt, type Clip } from "./story.ts";

const { fontFamily: SERIF } = loadFraunces("italic", { weights: ["600", "700"], subsets: ["latin"] });
loadFraunces("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: MONO } = loadCourier("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: SANS } = loadNunito("normal", { weights: ["700", "800"], subsets: ["latin"] });

const INK = "#4A2E1E";
const PAPER = "rgba(255,247,232,0.95)";
const ACCENT = "#C9563A";
const WHO_COLOR: Record<string, string> = { narator: "#B5532F", pria: "#5E7A2E", gadis: "#C2405A" };
const WHO_LABEL: Record<string, string> = { narator: "NARATOR", pria: "DIA (SANG PRIA)", gadis: "SANG GADIS" };
const whoLabel = (c: Clip) => (c.who === "pria" && c.start >= T.s10a ? "SURAT SANG SUAMI" : c.who === "pria" && c.start >= T.s8a ? "SANG SUAMI" : c.who === "gadis" && c.start >= T.s8a ? "SANG ISTRI" : WHO_LABEL[c.who]);

const CameraRig: React.FC<{ pos: THREE.Vector3; target: THREE.Vector3; fov: number }> = ({ pos, target, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(pos);
    c.fov = fov;
    c.lookAt(target);
    c.updateProjectionMatrix();
  });
  return null;
};

// ---- captions: phrases of up to ~12 words, split after punctuation ----
type Phrase = { who: string; label: string; start: number; end: number; words: Clip["words"] };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const last = i === c.words.length - 1;
    const punct = /[.,?!…;:]$/.test(w.w);
    if (last || (punct && cur.length >= 5) || cur.length >= 12) {
      out.push({ who: c.who, label: whoLabel(c), start: cur[0].s, end: cur[cur.length - 1].e, words: cur });
      cur = [];
    }
  });
  return out;
});
const HIKMAH = new Set(["s12a", "s12b", "s12c"]);

const Stitched: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; s: number; bg?: string; dash?: string }> = ({ children, style, s, bg = PAPER, dash = ACCENT }) => (
  <div style={{ background: bg, borderRadius: 18 * s, outline: `${3 * s}px dashed ${dash}`, outlineOffset: -10 * s, boxShadow: `0 ${8 * s}px ${22 * s}px rgba(50,25,10,0.35)`, ...style }}>{children}</div>
);

const Captions: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.08 && t < Math.min(p.end + 0.45, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  const col = WHO_COLOR[p.who];
  const pop = clamp01((t - p.start + 0.08) / 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 58 * s, display: "flex", justifyContent: "center", opacity: pop, transform: `translateY(${(1 - pop) * 8 * s}px)` }}>
      <Stitched s={s} style={{ maxWidth: 1380 * s, padding: `${16 * s}px ${40 * s}px ${20 * s}px`, textAlign: "center" }} dash={col}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19 * s, letterSpacing: 5 * s, color: col, marginBottom: 6 * s }}>✂ {p.label}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44 * s, lineHeight: 1.22, color: INK }}>
          {p.words.map((w, k) => {
            const on = t >= w.s - 0.02 && t < w.e + 0.05;
            const done = t >= w.e + 0.05;
            return (
              <span key={k} style={{ color: on ? col : done ? INK : "rgba(74,46,30,0.55)", display: "inline-block", transform: on ? `translateY(${-3 * s}px)` : undefined, marginRight: 11 * s }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </Stitched>
    </div>
  );
};

/** The hikmah: big embroidered-card typography over the two cups. */
const HikmahCard: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const ids = ["s12a", "s12b", "s12c"];
  const cur = ids.find((id) => t >= T[id] - 0.3 && t < (ids[ids.indexOf(id) + 1] ? T[ids[ids.indexOf(id) + 1]] - 0.3 : E[id] + 1.2));
  if (!cur) return null;
  const c = CLIPS.find((k) => k.id === cur)!;
  const o = clamp01((t - T[cur] + 0.3) / 0.4) * clamp01((E.s12c + 1.2 - t) / 0.5);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 92 * s, display: "flex", justifyContent: "center", opacity: o }}>
      <Stitched s={s} style={{ maxWidth: 1300 * s, padding: `${30 * s}px ${56 * s}px ${36 * s}px`, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 * s, letterSpacing: 7 * s, color: ACCENT, marginBottom: 12 * s }}>✂ HIKMAH</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: (cur === "s12b" ? 52 : 66) * s, lineHeight: 1.18, color: INK }}>
          {c.words.map((w, k) => {
            const lit = t >= w.s - 0.05;
            return (
              <span key={k} style={{ color: lit ? INK : "rgba(74,46,30,0.28)", marginRight: 14 * s, display: "inline-block" }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </Stitched>
    </div>
  );
};

/** Felt-panel wipe at every change of set: a stitched fabric strip sweeps across the cut. */
const Wipes: React.FC<{ t: number; s: number; w: number }> = ({ t, s, w }) => {
  const cuts = SHOTS.filter((sh, i) => i > 0 && sh.set !== SHOTS[i - 1].set).map((sh) => sh.a);
  const c = cuts.find((x) => Math.abs(t - x) < 0.45);
  if (c === undefined) return null;
  const u = smooth((t - c + 0.45) / 0.9); // 0..1, cut at 0.5
  const x = (-1.25 + 2.5 * u) * w;
  const cols = ["#C9463D", "#3E7C74", "#E3B23C", "#B5532F"];
  const col = cols[Math.round(c) % cols.length];
  return (
    <div style={{ position: "absolute", top: -20 * s, bottom: -20 * s, left: x, width: w * 1.15, background: col, boxShadow: `0 0 ${40 * s}px rgba(40,18,6,0.5)`, borderLeft: `${6 * s}px dashed #FFF4DE`, borderRight: `${6 * s}px dashed #FFF4DE` }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 3px, rgba(0,0,0,0.04) 3px 7px)" }} />
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const ts = stepT(t);
  const s = width / 1920;
  const shot = shotAt(t);
  const k = smooth(clamp01((t - shot.a) / Math.max(0.01, shot.b - shot.a)));
  const lerp3 = (a: number[], b: number[]) => new THREE.Vector3(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
  const camPos = lerp3(shot.p0, shot.p1);
  const camTarget = lerp3(shot.q0, shot.q1);
  const bg = shot.set === "sea" ? "#A9D3E6" : shot.set === "party" ? "#2F5B5A" : shot.set === "kitchen" ? "#E6CF9E" : "#3A2216";

  const titleIn = clamp01((ts - 0.3) / 0.6) * clamp01((T.s2a - 0.9 - t) / 0.6);
  const outro = clamp01((t - OUTRO_START) / 0.8);
  const hikmah = HIKMAH.has(CLIPS.find((c) => t >= c.start - 0.3 && t <= c.end + 0.5)?.id ?? "");
  const flash = shot.flash === true;
  // the years counter card while the kitchen ages (s8d)
  const yearsCard = shot.scene === "years" && t >= T.s8d - 0.2 && t < E.s8d + 1.2;

  return (
    <AbsoluteFill style={{ background: bg }}>
      <AbsoluteFill style={{ filter: flash ? "sepia(0.55) saturate(0.85) brightness(1.04)" : undefined }}>
        <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 1.5, 3.8], fov: 30, near: 0.05, far: 40 }}>
          <CameraRig pos={camPos} target={camTarget} fov={shot.fov} />
          <color attach="background" args={[bg]} />
          <World t={t} shot={shot} />
          <Finish frame={frame} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={shot.set === "sea" ? 0.82 : 0.9} envIntensity={0.22} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* warm vignette (stronger in memories) */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) ${flash ? 42 : 55}%, rgba(40,18,6,${flash ? 0.6 : 0.4}) 100%)` }} />
      {flash && (
        <div style={{ position: "absolute", left: 96 * s, top: 70 * s }}>
          <Stitched s={s} style={{ padding: `${10 * s}px ${22 * s}px` }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 * s, letterSpacing: 6 * s, color: ACCENT }}>✂ KENANGAN</div>
          </Stitched>
        </div>
      )}
      {yearsCard && (
        <div style={{ position: "absolute", right: 96 * s, top: 70 * s }}>
          <Stitched s={s} style={{ padding: `${14 * s}px ${28 * s}px`, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20 * s, letterSpacing: 5 * s, color: ACCENT }}>✂ TAHUN DEMI TAHUN</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 64 * s, color: INK }}>{Math.max(1, Math.round(1 + 39 * smooth(clamp01((ts - T.s8d + 0.2) / (E.s8d + 0.8 - T.s8d)))))} tahun</div>
          </Stitched>
        </div>
      )}

      {/* title card (hook) */}
      {titleIn > 0 && (
        <div style={{ position: "absolute", left: 96 * s, top: 70 * s, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 20 * s}px)` }}>
          <Stitched s={s} style={{ padding: `${26 * s}px ${40 * s}px ${30 * s}px` }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24 * s, letterSpacing: 6 * s, color: ACCENT, marginBottom: 8 * s }}>✂ CERITA HIKMAH</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 84 * s, lineHeight: 1.0, color: INK }}>
              Mata Cinta
              <br />
              Kopi Asin
            </div>
          </Stitched>
        </div>
      )}

      {hikmah && <HikmahCard t={t} s={s} />}
      {!hikmah && t < OUTRO_START && <Captions t={t} s={s} />}
      <Wipes t={t} s={s} w={width} />

      {outro > 0 && (
        <AbsoluteFill style={{ opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ height: 420 * s }} />
          <div style={{ marginTop: 40 * s, fontFamily: SANS, fontWeight: 700, color: "#E8F2EC", fontSize: 34 * s, letterSpacing: 3 * s }}>Created by Agus Dwi R.</div>
        </AbsoluteFill>
      )}
      <AudiraSignature seed="cerita-hikmah-ep08" handle="@audira" />
    </AbsoluteFill>
  );
};
