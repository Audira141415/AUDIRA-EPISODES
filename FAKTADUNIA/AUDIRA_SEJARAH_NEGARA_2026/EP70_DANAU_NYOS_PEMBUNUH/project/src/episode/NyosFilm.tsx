// EP70 Danau Nyos — TERRARIUM (lake as a cut-away glass jar), Remotion + R3F. Film clock = VO clock (offset 0).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { clamp01, easeOutBack } from "../kits/feltcraft/core/motion";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, cameraAt, shotAt, type Card, type SceneId } from "./timeline.ts";
import { SCENES } from "./scenes.tsx";
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => (w.text.startsWith("Audira") ? { ...w, text: w.text.replace("Audira", "AUDIRA") } : w));

// key = lantern / dawn light relative to the camera target
type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; ki: number; rim: [string, number]; fogNear: number; fogFar: number };
// r2: jury called 14s/28s/75s murky -> stronger warm key + hemi, fog pushed back
const NIGHT: Look = { bg: "#150f0b", hemi: ["#4a5a7e", "#2a1c12", 0.9], key: [-4, 5, 3.5, "#ffb46a"], ki: 3.2, rim: ["#8fbcff", 2.4], fogNear: 16, fogFar: 44 };
const DAWN: Look = { bg: "#2a1a12", hemi: ["#ffe6c8", "#3a2a1c", 0.8], key: [5, 4, 3, "#f2b866"], ki: 3.0, rim: ["#ffd9a8", 1.4], fogNear: 14, fogFar: 40 };
const LOOK: Record<SceneId, Look> = { A: NIGHT, B: NIGHT, C: NIGHT, D: NIGHT, E: NIGHT, F: NIGHT, G: DAWN, H: DAWN };

// ---------- HUD: dark walnut board, lake-blue accent line (layout px 1080 × 1920) ----------
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const BOARD = "rgba(18,13,10,0.82)";
const ACCENT = "#3d8fb0";
const INK = "#F4EFE6";
const idNum = (v: number) => Math.round(v).toLocaleString("id-ID");

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const inA = clamp01((t - c.from) / 0.35);
  const out = clamp01((c.to - t) / 0.25);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.5) * out;
  const board: React.CSSProperties = { transform: `scale(${s})`, background: BOARD, borderBottom: `8px solid ${ACCENT}`, borderRadius: 10, boxShadow: "0 18px 40px rgba(0,0,0,0.5)", textAlign: "center", fontFamily: FONT, color: INK, maxWidth: 940 };
  if (c.kind === "chip") {
    return (
      <div style={{ position: "absolute", top: 268, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...board, padding: "16px 38px", fontWeight: 800, fontSize: 52, letterSpacing: 3 }}>{c.title}</div>
      </div>
    );
  }
  const n = c.count ? c.count.to * clamp01((t - c.from) / 0.6) : 0;
  const big = c.kind === "big";
  return (
    <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ ...board, padding: big ? "26px 54px" : "22px 46px" }}>
        {c.count ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 46, letterSpacing: 5, color: "#9fd3e6" }}>{c.title}</div>
            <div style={{ fontWeight: 900, fontSize: 136, lineHeight: 1.02, fontVariantNumeric: "tabular-nums" }}>
              {idNum(n)}
              <span style={{ fontSize: 76 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 900, fontSize: big ? (c.title.length > 14 ? 84 : 120) : 76, lineHeight: 1.05, letterSpacing: 1 }}>{c.title}</div>
        )}
        {c.sub ? <div style={{ fontSize: 48, marginTop: 8, color: "#E9D9C2", fontWeight: 600 }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 40% at 50% 46%, rgba(0,0,0,0) 55%, rgba(10,7,5,0.45) 85%, rgba(8,5,4,0.7) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(rgba(10,7,5,0.5), rgba(10,7,5,0))" }} />
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

const keyTarget = new THREE.Object3D();

export const NyosFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const L = LOOK[id];
  const Scene = SCENES[id];
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  return (
    <AbsoluteFill style={{ background: L.bg }}>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={L.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="studio"
        exposure={1}
        envIntensity={0.55}
        ao
        focus={focus}
        aperture={0.005}
        maxBlur={0.012}
        near={0.05}
        far={90}
        overlay={() => <Hud t={t} />}
      >
        <color attach="background" args={[L.bg]} />
        <fog attach="fog" args={[L.bg, L.fogNear, L.fogFar]} />
        <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2]]} />
        <primitive object={keyTarget} position={cam.target} />
        <directionalLight
          target={keyTarget}
          position={[cam.target[0] + L.key[0], cam.target[1] + L.key[1], cam.target[2] + L.key[2]]}
          intensity={L.ki}
          color={L.key[3]}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[cam.target[0] + 2, cam.target[1] + 4, cam.target[2] - 6]} intensity={L.rim[1]} color={L.rim[0]} />
        <directionalLight position={[cam.target[0] + 3, cam.target[1] + 2, cam.target[2] + 7]} intensity={0.45} color="#c9dbf2" />
        <Scene t={t} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1300} size={60} maxWords={4} plate="rgba(18,13,10,0.86)" activeColor="#9fd3e6" baseColor="#F4EFE6" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="danau-nyos-ep70" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};

/** Cover / thumbnail: the hook frame + title plate. */
export const NyosCover: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Freeze frame={Math.round(4.2 * fps)}>
        <NyosFilm />
      </Freeze>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 520, display: "flex", justifyContent: "center" }}>
        <div style={{ background: BOARD, borderBottom: `10px solid ${ACCENT}`, borderRadius: 12, padding: "24px 56px", fontFamily: FONT, color: INK, fontWeight: 900, fontSize: 112, letterSpacing: 2 }}>DANAU PEMBUNUH</div>
      </div>
    </AbsoluteFill>
  );
};
