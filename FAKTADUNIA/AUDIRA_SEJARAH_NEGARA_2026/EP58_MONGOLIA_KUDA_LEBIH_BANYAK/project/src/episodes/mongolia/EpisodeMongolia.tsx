// EP58 — Mongolia: kuda lebih banyak dari manusia. POLYVERSE look on the WORLDFORGE stage (Remotion + R3F), 86 s.
// FilmScene (post off: the kit Stage runs its own chain) → Stage per act (sky, sun, shadow box)
// → steppe terrain + the act's set. Subtitle, VO, AUDIRA outro card and moving signature on top.

import React, { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AbsoluteFill } from "remotion";
import { Material, Mesh, PMREMGenerator, Scene, SphereGeometry, type Texture } from "three";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { Subtitle, type WordTiming } from "../../core/hud/Subtitle.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { Stage, type Look, type ShadowBox, type Shot } from "../../kits/worldforge/Stage.tsx";
import { makeSkyMaterial, type SkyColors } from "../../kits/worldforge/Sky.tsx";
import { useModels } from "./Horse.tsx";
import { Sets, Terrain } from "./Sets.tsx";
import { MongoliaOverlay } from "./Overlay.tsx";
import { QaProbe, qaNoOverlay } from "../../core/qa/scene-qa.tsx";
import { EPISODE_SECONDS, cameraAt, hazeAt, setAt, snowAt, winterAt, type SetId } from "./timeline.ts";
import type { V3 } from "./terrain.ts";
import wordsRaw from "../../../public/audio/vo-words.json";

export { EPISODE_SECONDS };
const words = wordsRaw as unknown as WordTiming[];

const n = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};

// ── Looks per act ─────────────────────────────────────────────────────────────────
type Mood = "day" | "camp" | "winter" | "dusk" | "morning" | "race" | "sunset";
type MoodDef = { sky: SkyColors; sun: V3; sunColor: string; sunI: number; exposure: number; fog: number; env: number };
// POLYVERSE look (memory mustApply): deep pastel sky (#3F4F98 → lilac → peach), low warm side sun
// #ffbf8a ~3.4, exposure 0.82, env 0.25 so facet shadow sides go dark, fog pushed back.
const MOODS: Record<Mood, MoodDef> = {
  day: { sky: { zenith: "#3f4f98", horizon: "#f6c9a8", glow: "#ffd9b8", halo: "#fff0e0", ground: "#6e6a48", sunDisk: 16 }, sun: n([-0.6, 0.3, 0.62]), sunColor: "#ffbf8a", sunI: 3.9, exposure: 0.96, fog: 0.00035, env: 0.32 },
  camp: { sky: { zenith: "#46559e", horizon: "#f3cdb0", glow: "#ffdcbc", halo: "#fff0e0", ground: "#6e6a48", sunDisk: 16 }, sun: n([0.62, 0.3, 0.55]), sunColor: "#ffbf8a", sunI: 3.9, exposure: 0.96, fog: 0.00035, env: 0.32 },
  winter: { sky: { zenith: "#6c74a8", horizon: "#dcd6e6", glow: "#ece6f2", halo: "#f6f2fa", ground: "#bcbccc", sunDisk: 0 }, sun: n([-0.4, 0.6, 0.4]), sunColor: "#e8e4f4", sunI: 2.0, exposure: 0.9, fog: 0.0014, env: 0.6 },
  dusk: { sky: { zenith: "#323e86", horizon: "#f4a878", glow: "#ffb688", halo: "#ffe0c0", ground: "#5a4a3a", sunDisk: 20 }, sun: n([0.9, 0.16, -0.3]), sunColor: "#ffb47e", sunI: 3.4, exposure: 0.86, fog: 0.0004, env: 0.3 },
  morning: { sky: { zenith: "#4a5aa6", horizon: "#f7d2b4", glow: "#ffe0c2", halo: "#fff4e8", ground: "#7a7050", sunDisk: 16 }, sun: n([-0.75, 0.28, 0.5]), sunColor: "#ffc496", sunI: 3.9, exposure: 0.96, fog: 0.00035, env: 0.32 },
  race: { sky: { zenith: "#3f4f98", horizon: "#f6c9a8", glow: "#ffd9b8", halo: "#fff0e0", ground: "#7a6a4a", sunDisk: 16 }, sun: n([-0.45, 0.32, 0.72]), sunColor: "#ffbf8a", sunI: 3.9, exposure: 0.96, fog: 0.00035, env: 0.32 },
  sunset: { sky: { zenith: "#2c3474", horizon: "#ff9e70", glow: "#ffb47c", halo: "#ffe0c0", ground: "#3a2e2a", sunDisk: 26 }, sun: n([0.12, 0.07, -1]), sunColor: "#ff9e66", sunI: 3.2, exposure: 0.88, fog: 0.0003, env: 0.3 },
};
const MOOD_OF: Record<SetId, Mood> = { hook: "day", valley: "day", camp: "camp", lone: "day", graze: "day", war: "dusk", airag: "morning", race: "race", portrait: "day", ridge: "sunset" };
const moodAt = (t: number): Mood => (winterAt(t) ? "winter" : MOOD_OF[setAt(t)]);

const box = (x0: number, z0: number, x1: number, z1: number, sun: V3, y0 = -20, y1 = 40): ShadowBox => ({ min: [x0, y0, z0], max: [x1, y1, z1], mapWidth: 4096, sun });
const SHADOW: Record<SetId, ShadowBox> = {
  hook: box(-35, -60, 35, 60, MOODS.day.sun),
  valley: box(-300, 95, -150, 205, MOODS.day.sun),
  camp: box(115, -95, 190, -25, MOODS.camp.sun),
  lone: box(270, 225, 330, 275, MOODS.day.sun),
  graze: box(-110, -245, -50, -195, MOODS.day.sun),
  war: box(-420, -70, -250, -10, MOODS.dusk.sun),
  airag: box(150, -110, 200, -60, MOODS.morning.sun),
  race: box(40, 305, 215, 355, MOODS.race.sun),
  portrait: box(310, -270, 350, -230, MOODS.day.sun),
  ridge: box(-60, -450, 50, -405, MOODS.sunset.sun, -20, 60),
};
const WINTER_BOX = box(-110, -245, -50, -195, MOODS.winter.sun);

/** Sky domes and their PMREM light, one per mood, built once. */
const domes = new Map<Mood, Mesh>();
const envs = new Map<Mood, Texture>();
const useMoodSky = (mood: Mood) => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const d = MOODS[mood];
    let dome = domes.get(mood);
    if (!dome) {
      dome = new Mesh(new SphereGeometry(1000, 64, 32), makeSkyMaterial(d.sun, d.sky, false));
      dome.frustumCulled = false;
      dome.renderOrder = -10;
      domes.set(mood, dome);
    }
    let env = envs.get(mood);
    if (!env) {
      const scene = new Scene();
      const mat = makeSkyMaterial(d.sun, d.sky, true);
      scene.add(new Mesh(new SphereGeometry(100, 48, 24), mat));
      const pmrem = new PMREMGenerator(gl);
      env = pmrem.fromScene(scene, 0.02, 0.1, 1000).texture;
      pmrem.dispose();
      envs.set(mood, env);
    }
    return { dome, env };
  }, [gl, mood]);
};

/** POLYVERSE: every lit material renders faceted (flat normals). Sky dome is a ShaderMaterial and is skipped. */
const done = new WeakSet<Material>();
const Facets: React.FC = () => {
  const scene = useThree((s) => s.scene);
  useFrame(() => {
    scene.traverse((o) => {
      const mm = (o as Mesh).material as Material | Material[] | undefined;
      if (!mm) return;
      for (const m of Array.isArray(mm) ? mm : [mm]) {
        if (done.has(m)) continue;
        done.add(m);
        if ("flatShading" in m && (m as { isMeshStandardMaterial?: boolean }).isMeshStandardMaterial) {
          (m as unknown as { flatShading: boolean }).flatShading = true;
          m.needsUpdate = true;
        }
      }
    });
  }, -1);
  return null;
};

const World: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const models = useModels();
  const mood = moodAt(t);
  const d = MOODS[mood];
  const { dome, env } = useMoodSky(mood);
  const id = setAt(t);
  const p = cameraAt(t);
  const focus = Math.hypot(p.pos[0] - p.target[0], p.pos[1] - p.target[1], p.pos[2] - p.target[2]);
  const macro = focus < 6;
  const shot: Shot = { pos: p.pos, target: p.target, fov: p.fov, near: p.near, far: 30000, focus, aperture: macro ? 0.0012 : 0.00004, maxBlur: macro ? 0.008 : 0.003 };
  const haze = hazeAt(t);
  const look: Look = {
    sun: d.sun,
    sunColor: d.sunColor,
    sunI: d.sunI,
    exposure: d.exposure,
    fog: { color: d.sky.horizon, density: d.fog },
    background: d.sky.horizon,
    environment: env,
    envIntensity: d.env,
    ao: 0.7,
    bloom: mood === "sunset" || mood === "dusk" ? 0.16 : 0.08,
    haze,
    hazeFlow: t * 0.6,
    hazeColor: "#f4f6f8",
    vignette: 0.18,
  };
  const sb = mood === "winter" ? WINTER_BOX : SHADOW[id];
  return (
    <Stage shot={shot} look={look} shadowBox={sb} frame={frame}>
      <primitive object={dome} />
      <Facets />
      <Terrain snow={snowAt(t)} />
      {models ? <Sets m={models} t={t} /> : null}
    </Stage>
  );
};

export const EpisodeMongolia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = cameraAt(t);
  return (
    <>
      <AbsoluteFill style={{ filter: "contrast(1.07) saturate(1.12)" }}>
      <FilmScene
        frame={frame}
        shot={{ pos: p.pos, target: p.target, fov: p.fov }}
        background={MOODS.day.sky.horizon}
        post={false}
        envIntensity={0}
        near={0.03}
        far={30000}
        overlay={qaNoOverlay() ? undefined : () => <MongoliaOverlay t={t} />}
      >
        <World t={t} frame={frame} />
        <QaProbe />
      </FilmScene>
      </AbsoluteFill>
      {qaNoOverlay() ? null : <Subtitle words={words} frame={frame} fps={fps} offset={0} maxWords={6} size={52} activeColor="#ffffff" baseColor="rgba(255,255,255,0.78)" plate="rgba(0,0,0,0.94)" position={1300} />}
      <Voiceover src="audio/vo.wav" offset={0} />
      <AudiraOutro seconds={2.6} />
      <AudiraSignature seed="mongolia-kuda-EP58" outroSeconds={2.6} />
    </>
  );
};
