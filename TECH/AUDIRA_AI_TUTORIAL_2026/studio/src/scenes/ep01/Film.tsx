// EP01 film — "PDF 50 halaman jadi PPT otomatis" in PAPERWORLD.
// One continuous paper desk, three stations along x, one camera that never stops:
//   A (x 0)  : the 50-page PDF stack; pages lift, fold into origami and land as slide cards (hook)
//   C (x 16) : a spiral notebook renamed NotebookLM → Gemini Notebook; source chips drop in (context)
//   B (x 34) : a standing flip-chart "app" board where every step is a sheet with paper buttons and a
//              cut-paper cursor (steps, explanation, payoff); slide cards pop onto the desk at the end.
// Every beat is keyed to timeline.json (VO seconds). Deterministic: everything from the frame.

import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap, Vector3 } from "three";
import { Stage, type Light, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { clamp, ease, foldEase, hash01, mix, popEase, remap } from "../../kits/paperworld/motion/easing.ts";
import { Ground, PaperCloud, PaperHill } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { Cut, Hinge, PopUp, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { PALETTE } from "../../kits/paperworld/tokens.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { BinderClip, CH, HalfFold, Origami, Pencil, PrintedLines, Sheet, SlideCard, Sticky, SW, SH, Tag, Txt, SERIF, fontsReady, type Kind } from "./parts.tsx";
import { Board, boardTilt } from "./Board.tsx";
import TL from "./timeline.json";

const LIGHT: Light = {
  dir: [-0.85, 0.5, 0.38],
  key: "#ffe6c4",
  keyI: 2.8,
  fill: "#e6ecf5",
  fillI: 0.45,
  sky: "#fdf3e3",
  ground: "#c9a883",
  hemiI: 1.1,
  bg: "#efe2cc",
  exposure: 1.0,
  shadowSize: 30,
  shadowSoft: 5,
};

const SEC = TL.sections as Record<"hook" | "konteks" | "langkah" | "penjelasan" | "payoff" | "outro", [number, number]>;
const OUTRO_AT = SEC.outro[1] + 0.2;

// ── Camera: Hermite spline through keys (C1, never stops) ────────────────────

// [t, pos x y z, target x y z, fov]
const CAM: number[][] = [
  [0.0, -2.4, 7.2, 16.5, -2.6, 2.6, 2.4, 40],
  [3.7, -2.0, 8.6, 20, -2.0, 3.6, 1.6, 38],
  [6.2, -1.4, 11.0, 28, 0.2, 4.8, 0.4, 38],
  [8.5, -0.6, 13.2, 38, 1.0, 5.4, 0, 38],
  [10.0, 13.0, 9.4, 24, 16.0, 4.8, 0, 36],
  [13.8, 17.2, 8.8, 21, 16.4, 5.0, 0, 36],
  [17.0, 18.0, 10.6, 27, 16.2, 6.0, 0, 36],
  [22.3, 15.0, 12.6, 30, 16.4, 5.8, 0, 38],
  [24.1, 34.00, 9.2, 49.5, 34.00, 6.7, 0, 36],
  [25.7, 34.00, 9.2, 46.5, 34.00, 6.7, 0, 36],
  [26.5, 34.12, 9.2, 44, 34.10, 6.7, 0, 36],
  [27.6, 34.00, 9.2, 45, 34.00, 6.7, 0, 36],
  [28.3, 33.88, 9.2, 46, 33.90, 6.7, 0, 36],
  [29.9, 34.16, 9.2, 44.5, 34.14, 6.7, 0, 36],
  [31.0, 34.60, 9.2, 44, 34.52, 6.7, 0, 36],
  [32.0, 34.60, 9.2, 44.5, 34.52, 6.7, 0, 36],
  [32.9, 34.72, 9.2, 44, 34.63, 6.7, 0, 36],
  [34.0, 33.88, 9.2, 46.5, 33.90, 6.7, 0, 36],
  [39.3, 34.24, 9.2, 45, 34.21, 6.7, 0, 36],
  [40.5, 34.00, 9.2, 44, 34.00, 6.7, 0, 36],
  [44.6, 34.08, 9.2, 43.5, 34.07, 6.7, 0, 36],
  [45.9, 34.12, 9.2, 44, 34.10, 6.7, 0, 36],
  [47.6, 37.6, 10.4, 46, 37.6, 7.2, 0, 38],
  [50.8, 38.8, 9.6, 46, 38.0, 7.2, 0, 38],
  [51.8, 34.20, 9.2, 44.5, 34.17, 6.7, 0, 36],
  [55.4, 33.92, 9.2, 45, 33.93, 6.7, 0, 36],
  [56.5, 33.92, 9.2, 44, 33.93, 6.7, 0, 36],
  [59.3, 34.00, 9.2, 44.5, 34.00, 6.7, 0, 36],
  [61.0, 34.12, 9.2, 45.5, 34.10, 6.7, 0, 36],
  [61.9, 34.0, 9.6, 48, 34.0, 6.8, 2, 38],
  [62.9, 35.00, 9.2, 43.5, 34.88, 6.7, 0, 36],
  [64.5, 34.64, 9.2, 44, 34.56, 6.7, 0, 36],
  [65.9, 34.48, 9.2, 44.5, 34.42, 6.7, 0, 36],
  [66.7, 34.00, 9.2, 45.5, 34.00, 6.7, 0, 36],
  [68.4, 34.0, 9.0, 26, 34.0, 8.2, 0, 36],
  [69.5, 34.16, 9.2, 44, 34.14, 6.7, 0, 36],
  [70.8, 34.24, 9.2, 45.5, 34.21, 6.7, 0, 36],
  [72.4, 38.5, 10.5, 48, 36.2, 6.4, 2, 38],
  [80.3, 39.5, 12.0, 52, 36.2, 6.6, 2, 38],
  [81.6, 37.5, 15.5, 52, 35.8, 13.6, 2, 38],
  [86.7, 30.0, 26, 66, 28, 15, 0, 36],
];

const camAt = (t: number): number[] => {
  const n = CAM.length;
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  if (t >= CAM[n - 1][0]) return CAM[n - 1].slice(1);
  let i = 0;
  while (i < n - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1];
  const pa = CAM[Math.max(0, i - 1)], nb = CAM[Math.min(n - 1, i + 2)];
  const dt = b[0] - a[0];
  const u = (t - a[0]) / dt;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const out: number[] = [];
  for (let k = 1; k < 8; k++) {
    // tangents damped (0.7) so fast whips do not overshoot
    const m0 = i === 0 ? 0 : ((b[k] - pa[k]) / (b[0] - pa[0])) * 0.7;
    const m1 = i + 1 === n - 1 ? 0 : ((nb[k] - a[k]) / (nb[0] - a[0])) * 0.7;
    out.push(h00 * a[k] + h10 * dt * m0 + h01 * b[k] + h11 * dt * m1);
  }
  return out;
};

// ── Station A: the PDF stack and its pages turning into slide cards ─────────

const STACK_AT: V3 = [-2.9, 0, 1.8];
const N_SHEETS = 46;
const STEP = 0.075;
const TOP = N_SHEETS * STEP;
const DECK: { kind: Kind; color: string; accent: string; x: number; y: number; z: number }[] = [
  { kind: "plain", color: "goldLight", accent: "goldDeep", x: 5.4, y: 2.9, z: -6.2 },
  { kind: "points", color: "mint", accent: "coral", x: 4.8, y: 1.9, z: -4.1 },
  { kind: "chart", color: "cobalt", accent: "gold", x: 4.1, y: 0.95, z: -2.0 },
  { kind: "title", color: "coral", accent: "ivoryLight", x: 3.4, y: 0.0, z: 0.0 },
];
const FLY0 = 4.0, FLY_GAP = 0.85, FLY_DUR = 2.5;
const DECK_YAW = -0.32;

const deckSlot = (i: number): V3 => {
  const c = DECK[i];
  return [c.x, c.y + CH / 2, c.z];
};
const bez = (a: V3, b: V3, c: V3, u: number): V3 => [0, 1, 2].map((k) => (1 - u) ** 2 * a[k] + 2 * (1 - u) * u * b[k] + u * u * c[k]) as V3;

const Flyer: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const t0 = FLY0 + i * FLY_GAP;
  const p = (t - t0) / FLY_DUR;
  if (p < 0 || p >= 0.8) return null;
  const start: V3 = [STACK_AT[0], TOP + 0.4, STACK_AT[2]];
  const apex: V3 = [-0.4 + i * 0.7, 10.8 - i * 0.5, 3.2 - i * 0.9];
  const end = deckSlot(i);
  const u = ease.glide(p / 0.8) * 0.8;
  const pos = bez(start, apex, end, u / 0.8 * 0.92);
  const spin = p * 2.2;
  if (p < 0.3) {
    const k = p / 0.3;
    return <Sheet position={pos} rotation={[mix(-Math.PI / 2, -1.0, k), 0.3 * k + spin * 0.2, 0.2 * k]} scale={0.7} />;
  }
  if (p < 0.55) {
    const k = (p - 0.3) / 0.25;
    return <HalfFold angle={-foldEase(k) * 1.5} position={pos} rotation={[-0.6, 0.5 + k * 0.4, 0.2]} scale={0.64} />;
  }
  const k = (p - 0.55) / 0.25;
  return <Origami angle={-0.4 - foldEase(k) * 2.2} a="ivoryLight" b={["coralLight", "mintLight", "goldLight", "cobaltLight"][i]} position={pos} rotation={[-0.3, 0.7 - k * 0.6, -0.4 + k * 0.4]} scale={mix(0.62, 0.38, k)} />;
};

const StationA: React.FC<{ t: number }> = ({ t }) => {
  return (
    <group>
      <group position={STACK_AT} rotation={[0, 0.28, 0]}>
        {Array.from({ length: N_SHEETS }, (_, i) => {
          const fromTop = N_SHEETS - 1 - i;
          // riffle: the top pages lift at their front edge as if thumbed through (hook)
          const lift = fromTop < 7 && t < 4.2 ? Math.max(0, Math.sin(t * 5.2 - fromTop * 0.55)) * 0.16 * (1 - fromTop / 8) : 0;
          return (
            <group key={i} position={[(hash01(i * 1.7) - 0.5) * 0.22, i * STEP + 0.03, (hash01(i * 2.9) - 0.5) * 0.22]} rotation={[-Math.PI / 2, 0, (hash01(i * 4.3) - 0.5) * 0.05]}>
              <Hinge at={[0, SH / 2, 0]} axis="x" angle={-lift}>
                <Cut shape={S.rectC(SW, SH, 0.06)} color={i % 9 === 4 ? "ivoryShade" : "ivoryLight"} depth={0.05} />
                {fromTop === 0 && <PrintedLines w={SW} h={SH} z={0.06} />}
              </Hinge>
            </group>
          );
        })}
        {/* front face labels: PDF sticker and page count (never covered by the flying pages) */}
        <Tag text="PDF" w={1.7} h={0.78} size={0.52} bg="coral" fg="ivoryLight" position={[-1.35, TOP * 0.66, SH / 2 + 0.06]} rotation={[0, 0, -0.04]} />
        <Tag text="50 halaman" w={3.1} h={0.66} size={0.36} bg="ivoryLight" fg="ink" position={[-1.15, TOP * 0.24, SH / 2 + 0.06]} rotation={[0, 0, 0.03]} />
        <BinderClip position={[1.25, TOP * 0.62 + 0.05, SH / 2 - 0.05]} />
        <Tag text="AUDIRA" w={2.0} h={0.72} size={0.46} bg="ink" fg="ivoryLight" position={[1.55, TOP * 0.18, SH / 2 + 0.07]} rotation={[0, 0, 0.05]} />
      </group>
      {DECK.map((_, i) => <Flyer key={i} i={i} t={t} />)}
      {/* the deck: fanned slide cards on stepped kraft blocks; each appears where its flyer lands */}
      {DECK.map((c, i) => {
        const land = FLY0 + i * FLY_GAP + FLY_DUR * 0.8;
        const s = popEase(remap(t, land, land + 0.5));
        return (
          <group key={i} position={[c.x, 0, c.z]} rotation={[0, DECK_YAW, 0]}>
            {c.y > 0 && (
              <mesh castShadow receiveShadow position={[0, c.y / 2, -0.6]} material={paperFace("brownLight")}>
                <RoundedBoxGeo args={[5.0, c.y, 1.6]} radius={0.08} />
              </mesh>
            )}
            {s > 0.001 && <SlideCard kind={c.kind} color={c.color} accent={c.accent} position={[0, c.y, 0]} rotation={[-0.12, 0, 0]} scale={[s, s, 1]} />}
          </group>
        );
      })}
      {/* foreground desk */}
      <Sheet position={[-6.2, 0.4, 12.5]} rotation={[-Math.PI / 2 + 0.08, 0, 0.5]} />
      <Pencil position={[5.0, 0.35, 12.2]} rotation={[0, 0.9, Math.PI / 2]} />
      <Sticky color="coralLight" position={[-0.6, 0.06, 8.6]} yaw={0.25} />
      <Sticky color="mintLight" position={[2.4, 0.06, 9.8]} yaw={-0.3} s={2.2} />
    </group>
  );
};

// ── Station C: the notebook and its sources ─────────────────────────────────

const C_X = 16;
const SOURCES: { l: string; at: number; c: string; fg: string; x: number; y: number }[] = [
  { l: "PDF", at: 18.82, c: "coral", fg: "ivoryLight", x: -2.5, y: 7.4 },
  { l: "Situs web", at: 19.1, c: "cobalt", fg: "ivoryLight", x: 2.4, y: 6.9 },
  { l: "YouTube", at: 20.08, c: "coralDeep", fg: "ivoryLight", x: -2.6, y: 5.6 },
  { l: "Audio", at: 20.96, c: "mint", fg: "ink", x: 2.5, y: 5.1 },
  { l: "Google Docs", at: 21.37, c: "cobaltLight", fg: "ink", x: -2.4, y: 3.8 },
  { l: "Google Slides", at: 22.21, c: "gold", fg: "ink", x: 2.4, y: 3.3 },
];

const StationC: React.FC<{ t: number }> = ({ t }) => {
  const open = foldEase(remap(t, 15.6, 16.7));
  const oldFall = foldEase(remap(t, 13.7, 14.15));
  const newPop = popEase(remap(t, 14.15, 14.6));
  const cal = popEase(remap(t, 12.0, 12.5));
  return (
    <group position={[C_X, 0, 0]}>
      {/* stand */}
      <mesh castShadow receiveShadow position={[0, 0.3, -0.6]} material={paperFace("brownLight")}>
        <RoundedBoxGeo args={[8.2, 0.6, 3.4]} radius={0.1} />
      </mesh>
      <group position={[0, 0.6, 0]} rotation={[-0.22, 0, 0]}>
        <Cut shape={S.rect(7.2, 9.2, 0.3)} color="cobaltDeep" depth={0.12} position={[0, 0, -0.75]} />
        <Cut shape={S.rect(6.9, 8.9, 0.15)} color="ivoryLight" depth={0.6} position={[0.1, 0.1, -0.62]} />
        {/* first page: the sources land here */}
        <group position={[0.1, 0.1, 0.01]}>
          <Txt text="Sumber kamu" w={5.6} h={0.9} size={0.62} color="ink" weight={900} align="left" position={[0, 7.8, 0.01]} />
          <PrintedLines w={5.6} h={5.0} z={0.01} />
        </group>
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={i} position={[-3.5, 0.6 + i * 0.8, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.36, 0.06, 8, 18]} />
            <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
          </mesh>
        ))}
        {/* cover with the name tag; opens to the left */}
        <Hinge at={[-3.5, 0, 0.1]} axis="y" angle={-open * 2.5}>
          <group position={[0, 0, 0.1]}>
            <Cut shape={S.rect(7.2, 9.2, 0.3)} color="cobalt" depth={0.12} />
            <Cut shape={S.rect(6.0, 0.4, 0.1)} color="cobaltLight" depth={0.05} position={[0, 7.9, 0.12]} />
            <Cut shape={S.circle(1.0)} color="goldLight" depth={0.08} position={[0, 2.4, 0.12]} />
            <Cut shape={S.star(0.7)} color="goldDeep" depth={0.08} position={[0, 2.4, 0.2]} />
            {oldFall < 0.98 && (
              <Hinge at={[0, 4.6, 0.14]} axis="x" angle={oldFall * 1.55}>
                <Tag text="NotebookLM" w={5.8} h={1.5} size={0.74} bg="ivoryLight" fg="ink" position={[0, 5.4, 0.14]} />
              </Hinge>
            )}
            {newPop > 0.001 && (
              <PopUp t={newPop} position={[0, 4.6, 0.16]}>
                <Tag text="Gemini Notebook" w={6.4} h={1.5} size={0.66} bg="ink" fg="ivoryLight" position={[0, 0.8, 0]} />
              </PopUp>
            )}
          </group>
        </Hinge>
      </group>
      {/* calendar: July 2026 */}
      {cal > 0.001 && (
        <PopUp t={cal} position={[5.6, 0, 1.6]} yaw={-0.35}>
          <Cut shape={S.rect(3.2, 3.6, 0.2)} color="ivoryLight" depth={0.1} />
          <Cut shape={S.rect(3.2, 1.0, 0.2)} color="coral" depth={0.12} position={[0, 2.6, 0.02]} />
          <Txt text="JULI" w={3.0} h={0.9} size={0.62} color="ivoryLight" weight={900} position={[0, 3.1, 0.16]} />
          <Txt text="2026" w={3.0} h={1.4} size={1.0} color="ink" weight={900} position={[0, 1.25, 0.12]} />
        </PopUp>
      )}
      {/* source chips: pop in on their word, then drop into the page */}
      {SOURCES.map((s, i) => {
        const k = popEase(remap(t, s.at - 0.1, s.at + 0.35));
        if (k <= 0.001) return null;
        const inn = ease.in(remap(t, 22.55 + i * 0.04, 23.1 + i * 0.04));
        const bob = Math.sin(t * 2.1 + i) * 0.12;
        const pos: V3 = [mix(s.x, 0.2, inn), mix(s.y + bob, 4.2, inn), mix(3.2 + (i % 2) * 0.4, 0.4, inn)];
        const sc = k * (1 - inn * 0.75);
        return (
          <group key={s.l} position={pos} rotation={[0, (hash01(i * 3) - 0.5) * 0.3, (hash01(i * 5) - 0.5) * 0.14]} scale={sc}>
            <Tag text={s.l} w={3.3} h={1.1} size={0.46} bg={s.c} fg={s.fg} depth={0.08} />
          </group>
        );
      })}
      {/* foreground desk */}
      <Sticky color="goldLight" position={[-3.2, 0.06, 9.0]} yaw={-0.2} />
      <Pencil position={[3.0, 0.35, 10.8]} rotation={[0, -0.7, Math.PI / 2]} color="cobalt" />
    </group>
  );
};

// ── Station B: the board, the person, the payoff cards ──────────────────────

const B_X = 34;
const BOARD_Y = 7.6;

const StationB: React.FC<{ t: number; f60: number }> = ({ t, f60 }) => {
  const sit = t >= 46.4 && t < 51.3;
  const pose = sit ? "sit" : t >= 61.3 && t < 63.2 ? "cheer" : t >= 71 && t < 80.5 ? "wave" : "stand";
  const fileA = ease.glide(remap(t, 64.9, 65.7));
  const fileB = ease.glide(remap(t, 65.75, 66.5));
  return (
    <group>
      <group position={[B_X, BOARD_Y, 0]} rotation={[boardTilt, 0, 0]}>
        <Board t={t} />
      </group>
      {/* person: watches, sits to keep working while it generates, cheers at the result */}
      <group>
        {sit && (
          <>
            <mesh castShadow receiveShadow position={[B_X + 7.6, 0.8, 3.0]} material={paperFace("brownLight")}>
              <RoundedBoxGeo args={[2.4, 1.6, 2.4]} radius={0.12} />
            </mesh>
            <mesh castShadow receiveShadow position={[B_X + 6.0, 1.3, 5.1]} material={paperFace("brown")}>
              <RoundedBoxGeo args={[3.6, 2.6, 2.2]} radius={0.12} />
            </mesh>
            <group position={[B_X + 6.0, 2.62, 5.0]} rotation={[0, 2.4, 0]}>
              <Cut shape={S.rectC(2.2, 1.4, 0.1)} color="ink" depth={0.08} rotation={[-Math.PI / 2, 0, 0]} />
              <Hinge at={[0, 0, -0.7]} axis="x" angle={0}>
                <Cut shape={S.rect(2.2, 1.5, 0.1)} color="cobaltDeep" depth={0.08} position={[0, 0, -0.7]} rotation={[-0.25, 0, 0]} />
              </Hinge>
            </group>
          </>
        )}
        <ToyPerson f={f60} seed={5} outfit="casual" pose={pose} position={sit ? [B_X + 7.6, 1.6, 3.0] : [B_X + 7.4, 0, 3.4]}
          heading={sit ? 2.3 : -0.75} scale={6.2} look={{ height: 1.0, top: "#e3806a", bottom: "#435e95" }} />
      </group>
      {/* payoff: the deck pops onto the desk in front of the board */}
      {(["title", "chart", "points", "plain"] as Kind[]).map((k, i) => {
        const s = popEase(remap(t, 61.45 + i * 0.16, 62.0 + i * 0.16));
        if (s <= 0.001) return null;
        return (
          <PopUp key={k} t={s} position={[B_X - 4.6 + i * 3.1, 0, 8.6 + Math.abs(i - 1.5) * -0.5]} yaw={(i - 1.5) * -0.16}>
            <SlideCard kind={k} color={["coral", "cobalt", "mint", "goldLight"][i]} accent={["ivoryLight", "gold", "coral", "goldDeep"][i]} scale={0.5} />
          </PopUp>
        );
      })}
      {/* downloaded files land on the desk */}
      {fileA > 0 && (
        <group position={[mix(B_X + 1.2, B_X + 4.2, fileA), mix(BOARD_Y + 3.1, 0.05, fileA), mix(1.2, 11.5, fileA)]} rotation={[mix(0, -Math.PI / 2, fileA), 0, mix(0, 0.3, fileA)]}>
          <Cut shape={S.rectC(2.2, 2.8, 0.2)} color="coral" depth={0.06} />
          <Txt text=".pptx" w={2.0} h={0.9} size={0.62} color="ivoryLight" weight={900} position={[0, -0.4, 0.08]} />
        </group>
      )}
      {fileB > 0 && (
        <group position={[mix(B_X + 1.2, B_X + 6.8, fileB), mix(BOARD_Y + 2.0, 0.08, fileB), mix(1.2, 10.4, fileB)]} rotation={[mix(0, -Math.PI / 2, fileB), 0, mix(0, -0.25, fileB)]}>
          <Cut shape={S.rectC(2.2, 2.8, 0.2)} color="ivoryLight" depth={0.06} />
          <Txt text="PDF" w={2.0} h={0.9} size={0.66} color="coralDeep" weight={900} position={[0, -0.4, 0.08]} />
        </group>
      )}
      {/* foreground desk */}
      <Sticky color="goldLight" position={[B_X - 5.5, 0.06, 10.5]} yaw={0.3} />
      <Sticky color="coralLight" position={[B_X + 9.5, 0.06, 9.0]} yaw={-0.25} s={2.2} />
      <group position={[B_X - 1.0, 0.06, 13.2]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <Cut shape={S.rectC(11, 1.2, 0.1)} color="goldLight" depth={0.08} />
        {Array.from({ length: 21 }, (_, i) => <Cut key={i} shape={S.rectC(0.06, i % 5 ? 0.3 : 0.55, 0.01)} color="brown" depth={0.01} position={[-5 + i * 0.5, 0.45 - (i % 5 ? 0.15 : 0.03), 0.09]} />)}
      </group>
      <Pencil position={[B_X + 3.2, 0.35, 14.5]} rotation={[0, 1.2, Math.PI / 2]} color="coral" />
    </group>
  );
};

// ── HUD (paper print style) ──────────────────────────────────────────────────

const ink = PALETTE.ink, ivory = PALETTE.ivoryLight, coral = PALETTE.coral;

const inOut = (t: number, a: number, b: number, fi = 0.35, fo = 0.3) => clamp(Math.min((t - a) / fi, (b - t) / fo));

type Head = { a: number; b: number; lines: (string | { chip: string })[]; at?: number[]; size?: number };
const HEADS: Head[] = [
  { a: 0.3, b: 3.85, lines: ["Presentasi besok?", { chip: "PDF 50 halaman" }], at: [0.4, 1.1], size: 92 },
  { a: 3.9, b: 8.5, lines: ["Jadi slide", { chip: "PPT" }, "otomatis"], at: [3.9, 6.66, 7.78], size: 112 },
  { a: 8.85, b: 11.2, lines: ["Alatnya:", { chip: "NotebookLM" }], at: [8.85, 9.71], size: 104 },
  { a: 11.25, b: 15.35, lines: ["Sejak Juli 2026", { chip: "Gemini Notebook" }], at: [11.25, 14.62], size: 88 },
  { a: 15.43, b: 22.85, lines: ["Berpijak pada", { chip: "sumbermu" }], at: [15.43, 16.94], size: 100 },
  { a: 80.79, b: 86.5, lines: ["Simpan", { chip: "untuk tugas" }, "berikutnya"], at: [80.79, 81.66, 81.88], size: 104 },
];

const STEPS: { a: number; b: number; n: string; title: string; sub?: string; subAt?: number }[] = [
  { a: 23.6, b: 27.85, n: "1", title: "Buat notebook baru" },
  { a: 27.89, b: 30.3, n: "2", title: "Unggah PDF sebagai sumber" },
  { a: 30.34, b: 33.25, n: "3", title: "Studio → Slide Deck" },
  { a: 33.28, b: 39.65, n: "4", title: "Atur format, bahasa, panjang, sumber" },
  { a: 39.68, b: 45.35, n: "5", title: "Tulis arahan singkat" },
  { a: 45.4, b: 51.05, n: "6", title: "Tekan Generate", sub: "tunggu beberapa menit", subAt: 46.6 },
  { a: 51.09, b: 55.75, n: "+", title: "Opsi: tinjau outline dulu" },
  { a: 55.78, b: 61.3, n: "+", title: "Cara lain: minta lewat chat" },
  { a: 61.32, b: 66.0, n: "7", title: "Menu ⋮ → unduh .pptx / PDF" },
  { a: 66.04, b: 70.85, n: "8", title: "Presentasi layar penuh / bagikan" },
];

const Kicker: React.FC<{ k: number; o: number }> = ({ k, o }) => (
  <div style={{ display: "inline-block", background: ink, color: ivory, padding: `${10 * k}px ${20 * k}px`, borderRadius: 6 * k, fontFamily: SERIF, fontWeight: 700,
    fontSize: 28 * k, letterSpacing: 5 * k, boxShadow: `0 ${6 * k}px 0 rgba(59,42,34,0.18)`, transform: `rotate(-1.5deg)`, opacity: o }}>
    AUDIRA AI TUTORIAL
  </div>
);

const Headline: React.FC<{ h: Head; t: number; k: number }> = ({ h, t, k }) => {
  const o = inOut(t, h.a, h.b);
  if (o <= 0) return null;
  const size = (h.size ?? 100) * k;
  return (
    <div style={{ marginTop: 22 * k, fontFamily: SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.02, color: ink, letterSpacing: -1.5 * k, opacity: Math.min(1, o * 1.4),
      textShadow: `0 ${5 * k}px 0 rgba(255,249,238,0.9), 0 ${12 * k}px ${18 * k}px rgba(59,42,34,0.18)` }}>
      {h.lines.map((l, i) => {
        const at = h.at?.[i] ?? h.a;
        const p = ease.out(remap(t, at - 0.05, at + 0.35));
        if (p <= 0) return <div key={i} style={{ height: size * 1.02 }} />;
        const style: React.CSSProperties = { transform: `translateY(${(1 - p) * 30 * k}px) rotate(${(1 - p) * -3}deg)`, opacity: p, transformOrigin: "left bottom" };
        return typeof l === "string" ? (
          <div key={i} style={style}>{l}</div>
        ) : (
          <div key={i} style={style}>
            <span style={{ background: coral, color: ivory, padding: `0 ${20 * k}px`, borderRadius: 8 * k, textShadow: "none", boxShadow: `0 ${8 * k}px 0 rgba(196,97,79,0.55)`,
              display: "inline-block", transform: "rotate(-2deg)", margin: `${6 * k}px 0 ${10 * k}px` }}>{l.chip}</span>
          </div>
        );
      })}
    </div>
  );
};

const StepBadge: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const s = STEPS.find((x) => t >= x.a - 0.05 && t < x.b + 0.25);
  if (!s) return null;
  const o = inOut(t, s.a, s.b, 0.3, 0.25);
  const p = popEase(remap(t, s.a, s.a + 0.4));
  const sub = s.sub && s.subAt !== undefined ? ease.out(remap(t, s.subAt, s.subAt + 0.4)) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * k, marginTop: 20 * k, opacity: o }}>
      <div style={{ width: 96 * k, height: 96 * k, flex: "none", borderRadius: "50%", background: coral, color: ivory, fontFamily: SERIF, fontWeight: 900, fontSize: 68 * k,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 ${7 * k}px 0 rgba(196,97,79,0.55), 0 ${14 * k}px ${22 * k}px rgba(59,42,34,0.2)`,
        transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, lineHeight: 1 }}>
        <span style={{ marginTop: -8 * k }}>{s.n}</span>
      </div>
      <div style={{ background: "rgba(250,244,232,0.94)", padding: `${10 * k}px ${18 * k}px`, borderRadius: 10 * k, boxShadow: `0 ${6 * k}px 0 rgba(174,138,112,0.45)`,
        maxWidth: 820 * k, transform: `translateX(${(1 - p) * -30 * k}px) rotate(-1deg)` }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20 * k, letterSpacing: 4 * k, color: PALETTE.coralDeep }}>{s.n === "+" ? "TAMBAHAN" : `LANGKAH ${s.n}`}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 42 * k, lineHeight: 1.05, color: ink }}>{s.title}</div>
        {sub > 0 && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28 * k, color: PALETTE.brown, opacity: sub, marginTop: 4 * k }}>{s.sub}</div>}
      </div>
    </div>
  );
};

const WARNS: { a: number; b: number; big: string; title: string; body: string; at: number[] }[] = [
  { a: 70.94, b: 76.35, big: "!", title: "Slide AI bisa salah", body: "fakta atau tampilan. Baca ulang sebelum presentasi.", at: [70.94, 73.31, 75.01] },
  { a: 76.48, b: 80.55, big: "18+", title: "Khusus 18 tahun ke atas", body: "Fitur Slide Deck hanya untuk usia 18+.", at: [76.48, 78.65, 79.5] },
];

const WarnCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const w = WARNS.find((x) => t >= x.a && t < x.b + 0.3);
  if (!w) return null;
  const o = inOut(t, w.a, w.b, 0.3, 0.3);
  const flip = foldEase(remap(t, w.a, w.a + 0.5));
  return (
    <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 300 * k, opacity: o, perspective: 1400 * k }}>
      <div style={{ background: ivory, borderRadius: 14 * k, padding: `${34 * k}px ${36 * k}px`, display: "flex", gap: 30 * k, alignItems: "center",
        borderTop: `${16 * k}px solid ${coral}`, boxShadow: `0 ${10 * k}px 0 rgba(174,138,112,0.55), 0 ${26 * k}px ${40 * k}px rgba(59,42,34,0.28)`,
        transform: `rotateX(${(1 - flip) * 80}deg) rotate(-1.2deg)`, transformOrigin: "top center" }}>
        <div style={{ flex: "none", width: 170 * k, height: 170 * k, borderRadius: 18 * k, background: ink, color: ivory, fontFamily: SERIF, fontWeight: 900,
          fontSize: (w.big.length > 1 ? 74 : 120) * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{w.big}</div>
        <div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26 * k, letterSpacing: 5 * k, color: PALETTE.coralDeep }}>PERHATIAN</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 62 * k, lineHeight: 1.04, color: ink, marginTop: 6 * k }}>{w.title}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38 * k, lineHeight: 1.2, color: PALETTE.brown, marginTop: 10 * k, opacity: ease.out(remap(t, w.at[1], w.at[1] + 0.4)) }}>{w.body}</div>
        </div>
      </div>
    </div>
  );
};

const NextCard: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const o = inOut(t, 82.6, 86.5, 0.4, 0.3);
  if (o <= 0) return null;
  const p = popEase(remap(t, 82.6, 83.1));
  return (
    <div style={{ marginTop: 34 * k, display: "inline-block", background: ink, color: ivory, borderRadius: 12 * k, padding: `${18 * k}px ${26 * k}px`, opacity: o,
      transform: `scale(${p}) rotate(1.5deg)`, transformOrigin: "left center", boxShadow: `0 ${8 * k}px 0 rgba(59,42,34,0.25)` }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26 * k, letterSpacing: 4 * k, color: PALETTE.goldLight }}>EPISODE DEPAN</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48 * k, lineHeight: 1.1 }}>Edit foto cukup dengan mengetik</div>
    </div>
  );
};

// ── Karaoke captions ─────────────────────────────────────────────────────────

type W = { w: string; s: number; e: number };
type Phrase = { words: W[]; a: number; b: number };
const PHRASES: Phrase[] = (() => {
  const groups: W[][] = [];
  for (const clip of TL.clips as { words: W[] }[]) {
    const ws = clip.words;
    let cur: W[] = [];
    const start = groups.length;
    ws.forEach((w, i) => {
      cur.push(w);
      const rem = ws.length - i - 1;
      const punct = /[.,?!:;]$/.test(w.w);
      if (rem === 0) return;
      if ((punct && cur.length >= 2 && rem !== 1) || (cur.length >= 6 && rem !== 1) || cur.length >= 7) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) {
      if (cur.length === 1 && groups.length > start && groups[groups.length - 1].length <= 6) groups[groups.length - 1].push(...cur);
      else groups.push(cur);
    }
  }
  return groups.map((g, i) => {
    const next = groups[i + 1];
    const end = g[g.length - 1].e + 0.35;
    return { words: g, a: g[0].s - 0.12, b: next ? Math.min(end, next[0].s - 0.12) : end };
  });
})();

const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (t >= OUTRO_AT) return null;
  const ph = PHRASES.find((p) => t >= p.a && t < p.b);
  if (!ph) return null;
  const n = ph.words.length;
  const split = n <= 4 ? n : Math.ceil(n / 2);
  const lines = [ph.words.slice(0, split), ph.words.slice(split)].filter((l) => l.length);
  const appear = ease.out(remap(t, ph.a, ph.a + 0.18));
  return (
    <div style={{ position: "absolute", left: 50 * k, right: 50 * k, bottom: 400 * k, display: "flex", justifyContent: "center", opacity: appear }}>
      <div style={{ background: "rgba(250,244,232,0.95)", borderRadius: 14 * k, padding: `${14 * k}px ${24 * k}px`, boxShadow: `0 ${7 * k}px 0 rgba(174,138,112,0.5), 0 ${16 * k}px ${26 * k}px rgba(59,42,34,0.2)`,
        textAlign: "center", transform: `translateY(${(1 - appear) * 14 * k}px)` }}>
        {lines.map((l, li) => (
          <div key={li} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 50 * k, lineHeight: 1.22, color: ink, whiteSpace: "nowrap" }}>
            {l.map((w, wi) => {
              const on = t >= w.s - 0.03 && t < w.e + 0.05;
              const past = t >= w.e;
              const b = on ? 1 + 0.1 * Math.sin(clamp((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span key={wi} style={{ display: "inline-block", margin: `0 ${6 * k}px`, padding: `0 ${8 * k}px`, borderRadius: 7 * k,
                  background: on ? coral : "transparent", color: on ? ivory : past ? ink : "rgba(59,42,34,0.55)", transform: `scale(${b}) translateY(${on ? -3 * k : 0}px)` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Film ─────────────────────────────────────────────────────────────────────

export const Ep01Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  void height;
  const k = width / 1080;
  const [handle] = useState(() => delayRender("ep01 fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady()
      .then(() => document.fonts.load(`900 40px ${SERIF}`))
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  const c = camAt(t);
  const drift: V3 = [Math.sin(t * 0.37) * 0.22, Math.sin(t * 0.29 + 1) * 0.14, 0];
  const pos: V3 = [c[0] + drift[0], c[1] + drift[1], c[2]];
  const target: V3 = [c[3], c[4], c[5]];
  const dist = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  const shot: Shot = useMemo(() => ({ pos, target, fov: c[6], focus: dist, aperture: 0.0007, maxBlur: 0.0035 }), [frame]); // eslint-disable-line react-hooks/exhaustive-deps

  // carried page: a sheet sweeps past the lens during the whip from the notebook to the board
  const wipe = remap(t, 22.55, 24.15);
  let carried: React.ReactNode = null;
  if (wipe > 0 && wipe < 1) {
    const P = new Vector3(...pos), T = new Vector3(...target);
    const fwd = T.clone().sub(P).normalize();
    const right = fwd.clone().cross(new Vector3(0, 1, 0)).normalize();
    const u = ease.inOut(wipe);
    const at = P.clone().addScaledVector(fwd, 7.5).addScaledVector(right, mix(9, -9, u)).add(new Vector3(0, Math.sin(u * Math.PI) * 0.8 - 0.4, 0));
    const yaw = Math.atan2(P.x - at.x, P.z - at.z);
    carried = <Sheet pdf position={[at.x, at.y, at.z]} rotation={[0.15, yaw + (u - 0.5) * 0.9, (u - 0.5) * -0.6]} scale={0.95} />;
  }

  const showA = t < 24.5 || t > 80;
  const showC = (t > 8 && t < 24.5) || t > 80;
  const showB = t > 21.5;

  const head = HEADS.find((h) => t >= h.a - 0.05 && t < h.b + 0.3);
  const kickerO = inOut(t, 0.2, 8.5, 0.3, 0.3);

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT.bg }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
          gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 38, position: [0, 10, 33] }}>
          <Stage shot={shot} light={LIGHT} frame={frame} center={[target[0], 2, target[2]]}>
            <Ground color="ivory" />
            {/* paper backdrop running the length of the desk */}
            <Cut shape={S.rect(130, 44)} color="ivoryShade" depth={0.3} position={[17, 0, -16]} cast={false} />
            <Cut shape={S.circle(5.2)} color="goldLight" depth={0.12} position={[7.5, 15.5, -15.6]} />
            <Cut shape={S.circle(3.8)} color="gold" depth={0.12} position={[7.5, 15.5, -15.4]} />
            <PaperHill w={40} h={6} color="mintLight" position={[-8, 0, -14]} skew={2} />
            <PaperHill w={34} h={4.2} color="mint" position={[10, 0, -12.5]} skew={-2} />
            <PaperHill w={38} h={5.2} color="mintLight" position={[30, 0, -14]} skew={-1.5} />
            <PaperHill w={30} h={3.6} color="mint" position={[44, 0, -12.5]} skew={2} />
            <PaperCloud w={5} color="ivoryLight" position={[-7.5, 14.5, -13]} threadTo={30} />
            <PaperCloud w={3.6} color="ivoryLight" position={[3.5, 17.5, -12]} threadTo={30} />
            <PaperCloud w={4.4} color="ivoryLight" position={[21, 16, -13]} threadTo={30} />
            <PaperCloud w={5.2} color="ivoryLight" position={[40, 17, -13]} threadTo={30} />
            {showA && <StationA t={t} />}
            {showC && <StationC t={t} />}
            {showB && <StationB t={t} f60={t * 60} />}
            {carried}
          </Stage>
          <Finish frame={frame} background={LIGHT.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
        </ThreeCanvas>
      )}

      {/* HUD: kicker + headline (top-left from y 262), step badge, warning cards */}
      <AbsoluteFill style={{ padding: `${262 * k}px ${64 * k}px 0 ${64 * k}px`, pointerEvents: "none" }}>
        {kickerO > 0 && <Kicker k={k} o={kickerO} />}
        {head && <Headline h={head} t={t} k={k} />}
        <StepBadge t={t} k={k} />
        {t >= 80.79 && <NextCard t={t} k={k} />}
      </AbsoluteFill>
      <WarnCard t={t} k={k} />
      <Captions t={t} k={k} />
      {t >= OUTRO_AT - 0.05 && <Outro start={OUTRO_AT} />}
    </AbsoluteFill>
  );
};
