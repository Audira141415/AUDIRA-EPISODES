// EP07 DUKA DI PERJALANAN (FILMNOIR, 16:9). Every frame is a pure function of the film time t
// (seconds): shots.ts maps t to camera, car, cast and props, keyed to clip ids in timeline.json.
import React from "react";
import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import type { ColorGradeProfile } from "../../core/render/FinishingPresets.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { World, NOIR, Streak } from "./World";
import { Car } from "./Car";
import { Figure } from "./Cast";
import { BlindsLight, Note, PaperSlip, TicketBook } from "./Props";
import { PARK, carW, stateAt } from "./shots";
import { CLIPS, T, TOTAL_SECONDS, clamp, ramp } from "./layout";

const { fontFamily: SERIF } = loadPlayfair("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });
loadPlayfair("italic", { weights: ["400", "700"], subsets: ["latin"] });
const { fontFamily: TYPE } = loadElite("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["500"], subsets: ["latin"] });

/** Film-noir grade: deep blacks, heavy vignette, visible grain, faintly cold shadows. */
const NOIR_GRADE: ColorGradeProfile = {
  name: "EP07 Noir",
  vignette: 0.36,
  grain: 0.028,
  chromaticAberration: 0.0015,
  contrastCurve: 0.34,
  highlightTint: [0.01, 0.005, -0.01],
  shadowTint: [-0.01, 0.0, 0.02],
};

const SPEAKER: Record<string, { name: string; color: string }> = {
  narator: { name: "Narator", color: "#e9e1cf" },
  jack: { name: "Jack", color: "#f0c27a" },
  bobby: { name: "Bobby", color: "#9fc1e6" },
};
const HIKMAH_IDS = ["s8a", "s8b", "s8c", "s8d"];

/* ---------- 3D scene ---------- */
const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const f = t * 60;
  const s = stateAt(t);
  const close = (s.cam.near ?? 0.1) < 0.08;
  // slow handheld breath so no frame is ever frozen (smaller on close inserts)
  const amp = close ? 0.006 : 0.045;
  const shot: Shot = {
    pos: [s.cam.pos[0] + Math.sin(t * 0.43) * amp, s.cam.pos[1] + Math.sin(t * 0.61 + 1) * amp * 0.7, s.cam.pos[2] + Math.sin(t * 0.37 + 2) * amp * 0.5],
    target: s.cam.target,
    fov: s.cam.fov,
    roll: s.cam.roll ?? -0.012,
    focus: 12,
    aperture: 0,
    maxBlur: 0,
    exposure: 1.0,
  };
  const c = s.car;
  const shake = c?.shake ? Math.sin(t * 31) * 0.004 + Math.sin(t * 17) * 0.003 : 0;
  return (
    <>
      <CameraRig shot={shot} near={s.cam.near ?? 0.1} far={160} />
      <fogExp2 attach="fog" args={["#0a0c10", 0.02]} />
      <ambientLight intensity={0.05} color="#56606e" />
      <World t={t} camPos={shot.pos} rain={s.rain} />
      {c && (
        <>
          <group position={[c.x, shake, c.z]} rotation={[0, Math.PI, 0]}>
            <Car dist={c.dist} headlights={c.head} brake={c.brake} interior={c.interior} driver={!s.jack} />
          </group>
          {c.head > 0.1 && <Streak x={c.x - 2.7} z={c.z + 3.4} color="#fff1d8" len={7} width={1.8} opacity={0.6 * c.head} />}
          <Streak x={c.x + 2.4} z={c.z + 2.6} color={NOIR.red} len={4} width={0.9} opacity={0.3 + 0.4 * c.brake} />
        </>
      )}
      {s.jack && <Figure who="jack" f={f} act={s.jack.act} position={s.jack.pos} heading={s.jack.heading} mood={s.jack.mood} talk={s.jack.talk} scale={s.jack.scale} />}
      {s.bobby && <Figure who="bobby" f={f} act={s.bobby.act} position={s.bobby.pos} heading={s.bobby.heading} mood={s.bobby.mood} talk={s.bobby.talk} scale={s.bobby.scale} />}
      {s.bobby && s.ticketBook && (
        <TicketBook pos={[s.bobby.pos[0] + Math.sin(s.bobby.heading) * 0.3, 1.12, s.bobby.pos[2] + Math.cos(s.bobby.heading) * 0.3]} heading={s.bobby.heading} />
      )}
      {s.bobby && s.paperSlip > 0 && (
        <PaperSlip
          from={[s.bobby.pos[0] + Math.sin(s.bobby.heading) * 0.35, 1.3, s.bobby.pos[2] + Math.cos(s.bobby.heading) * 0.35]}
          to={carW(PARK.x, PARK.z, [-0.2, 1.3, 0.85])}
          k={s.paperSlip}
        />
      )}
      {s.note && <Note pos={carW(PARK.x, PARK.z, [0.08, 1.04, 0.4])} normal={[0.75, 1, 0]} show={s.note.show} t={t} font={HAND} />}
      {s.blinds && <BlindsLight {...s.blinds} />}
      <Finish frame={frame} background={NOIR.void} profile={NOIR_GRADE} exposure={1.0} envIntensity={0.18} hdri="studio" aoRadius={close ? 0.05 : 0.4} />
    </>
  );
};

/* ---------- overlays ---------- */
const TitleCard: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const a = ramp(t, 0.6, 2.2) * (1 - ramp(t, T.s2a + 0.2, T.s2a + 1.4));
  if (a <= 0.001) return null;
  const u = w / 1920;
  const rise = (1 - ramp(t, 0.6, 2.6)) * 18 * u;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 70 * u + rise, opacity: a, color: "#efe7d6", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: TYPE, fontSize: 30 * u, letterSpacing: 9 * u, color: NOIR.tungsten, display: "flex", alignItems: "center", gap: 18 * u }}>
        <span style={{ display: "inline-block", width: 54 * u, height: 2 * u, background: NOIR.tungsten }} />
        CERITA HIKMAH
        <span style={{ display: "inline-block", width: 54 * u, height: 2 * u, background: NOIR.tungsten }} />
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 124 * u, lineHeight: 0.98, marginTop: 18 * u, textShadow: `0 ${4 * u}px ${30 * u}px rgba(0,0,0,0.85)` }}>
        Duka di <span style={{ fontStyle: "italic", fontWeight: 700 }}>Perjalanan</span>
      </div>
      <div style={{ marginTop: 22 * u, width: 420 * u, height: 3 * u, background: `linear-gradient(90deg, rgba(255,30,45,0), ${NOIR.red}, rgba(255,30,45,0))` }} />
    </div>
  );
};

const Words: React.FC<{ c: (typeof CLIPS)[number]; t: number; color: string }> = ({ c, t, color }) => (
  <>
    {c.words.map((wd, i) => {
      const on = t >= wd.s && t <= wd.e + 0.04;
      const past = t > wd.e;
      return (
        <span key={i} style={{ color: on ? color : past ? "#efe8da" : "rgba(239,232,218,0.5)" }}>
          {wd.w}
          {i < c.words.length - 1 ? " " : ""}
        </span>
      );
    })}
  </>
);

const Captions: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const c = CLIPS.find((x) => t >= x.start - 0.1 && t <= x.end + 0.25);
  if (!c || HIKMAH_IDS.includes(c.id)) return null;
  const u = w / 1920;
  const sp = SPEAKER[c.who] ?? SPEAKER.narator;
  const fade = clamp((t - (c.start - 0.1)) / 0.15) * clamp((c.end + 0.25 - t) / 0.2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.8, display: "flex", flexDirection: "column", alignItems: "center", opacity: fade }}>
      <div style={{ fontFamily: TYPE, fontSize: 24 * u, letterSpacing: 6 * u, color: sp.color, marginBottom: 8 * u, textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>{sp.name}</div>
      <div style={{ maxWidth: w * 0.78, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 46 * u, lineHeight: 1.25, textShadow: `0 ${2 * u}px ${10 * u}px rgba(0,0,0,0.95)` }}>
        <Words c={c} t={t} color={sp.color} />
      </div>
    </div>
  );
};

/** The hikmah gets its own moment: large serif lines over the waiting car, red rule, no bottom caption. */
const Hikmah: React.FC<{ t: number; w: number; h: number }> = ({ t, w, h }) => {
  const c = CLIPS.find((x) => HIKMAH_IDS.includes(x.id) && t >= x.start - 0.3 && t <= x.end + 0.5);
  if (!c) return null;
  const u = w / 1920;
  const a = clamp((t - (c.start - 0.3)) / 0.35) * clamp((c.end + 0.5 - t) / 0.35);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0.6), rgba(0,0,0,0) 62%)" }} />
      <div style={{ position: "relative", marginTop: -h * 0.1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: TYPE, fontSize: 26 * u, letterSpacing: 10 * u, color: NOIR.tungsten, marginBottom: 26 * u }}>HIKMAH</div>
        <div style={{ maxWidth: w * 0.6, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 70 * u, lineHeight: 1.2, textShadow: `0 ${3 * u}px ${18 * u}px rgba(0,0,0,0.95)` }}>
          <Words c={c} t={t} color="#ff5560" />
        </div>
        <div style={{ marginTop: 30 * u, width: 320 * u, height: 3 * u, background: `linear-gradient(90deg, rgba(255,30,45,0), ${NOIR.red}, rgba(255,30,45,0))` }} />
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const start = TOTAL_SECONDS - 3;
  const a = ramp(t, start - 0.2, start + 0.5);
  if (a <= 0) return null;
  const u = w / 1920;
  return (
    <AbsoluteFill style={{ background: "#0B3D2E", opacity: a, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ height: 300 * u }} />
      <div style={{ fontFamily: TYPE, color: "#e9efe9", fontSize: 30 * u, letterSpacing: 4 * u, marginTop: 36 * u }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

/** Short fade to black on hard scene changes (keeps cuts from popping). */
const CUTS = () => [T.s2a, T.s5a, T.s7a, T.s8a];
const Dip: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const c of CUTS()) a = Math.max(a, 1 - clamp(Math.abs(t - c) / 0.35));
  return a > 0 ? <AbsoluteFill style={{ background: "#000", opacity: a * 0.85 }} /> : null;
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: NOIR.void }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 41, near: 0.1, far: 160, position: [1.6, 1.25, 13.8] }}>
        <Scene t={t} frame={frame} />
      </ThreeCanvas>
      <Dip t={t} />
      <TitleCard t={t} w={width} />
      <Captions t={t} w={width} h={height} />
      <Hikmah t={t} w={width} h={height} />
      <Outro t={t} w={width} />
      <Html5Audio src={staticFile("audio/ep07/mix.wav")} />
      <AudiraSignature seed="cerita-hikmah-ep07" handle="@audira" />
    </AbsoluteFill>
  );
};


