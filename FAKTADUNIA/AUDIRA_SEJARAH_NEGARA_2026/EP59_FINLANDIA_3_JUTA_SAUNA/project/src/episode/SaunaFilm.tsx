// EP59 Finlandia 3 Juta Sauna — WORLDFORGE (realistic miniature), Remotion + R3F. Film clock = VO clock (offset 0).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { clamp01, easeOutBack } from "../kits/feltcraft/core/motion";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, cameraAt, shotAt, type Card, type SceneId } from "./timeline.ts";
import { SCENES } from "./scenes.tsx";
import { Haze } from "./parts.tsx";
import * as THREE from "three";

const sunTarget = new THREE.Object3D();
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

// Display spelling for the subtitles (the TTS text is phonetic).
const DISPLAY: Record<string, string> = { Pihasalmi: "Pyhäsalmi", loylu: "löyly", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

// key = low warm sun from the side-back (WORLDFORGE golden miniature); fill = soft cool front bounce.
type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; rim: number; fogNear: number; fogFar: number; ki?: number; fill?: [number, number, number, string, number]; haze?: boolean };
const SUN: Pick<Look, "key" | "ki" | "fill" | "rim" | "haze"> = { key: [-6, 2.6, -4.5, "#FFC98E"], ki: 2.9, fill: [4, 2.5, 7, "#C9DBF2", 0.55], rim: 0, haze: true };
const LOOK: Record<SceneId, Look> = {
  A: { bg: "#C9D9E2", hemi: ["#D7E8FF", "#E8DCC8", 0.7], ...SUN, fogNear: 9, fogFar: 24 },
  B: { bg: "#C9D9E2", hemi: ["#D7E8FF", "#E8DCC8", 0.7], ...SUN, fogNear: 9, fogFar: 24 },
  C: { bg: "#CCDCE4", hemi: ["#D7E8FF", "#E8DCC8", 0.72], ...SUN, fogNear: 10, fogFar: 26 },
  D: { bg: "#AFC7D4", hemi: ["#D7E8FF", "#C8A880", 0.85], key: [3, 6, 4, "#FFE4BC"], rim: 0.8, fogNear: 30, fogFar: 60 },
  E: { bg: "#5E3F2A", hemi: ["#FFE2C0", "#7A5236", 0.5], key: [3.2, 3.0, 2.2, "#FFD09A"], rim: 1.4, fogNear: 30, fogFar: 60, ki: 2.8 },
  F: { bg: "#C99C88", hemi: ["#F2C8B0", "#6E5444", 0.6], key: [-4, 3, 3, "#FFB48A"], rim: 1.5, fogNear: 10, fogFar: 24, ki: 2.6 },
  G: { bg: "#D2DCD8", hemi: ["#D7E8FF", "#C8D49A", 0.7], ...SUN, fogNear: 10, fogFar: 26 },
  H: { bg: "#E9B98E", hemi: ["#FFD8B0", "#B98868", 0.8], key: [-5, 2.4, 2, "#FFB070"], rim: 1.3, fogNear: 8, fogFar: 22, haze: true },
};

// ---------- HUD card (dark documentary card, layout px 1080 × 1920) ----------
const TONE = { cream: { accent: "#FFB25A" }, blue: { accent: "#6FA8FF" }, rust: { accent: "#FF7A45" } } as const;
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const tt = Math.floor(t * 12) / 12;
  const inA = clamp01((tt - c.from) / 0.3);
  const out = clamp01((c.to - tt) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.7) * out;
  const tone = TONE[c.tone ?? "cream"];
  const n = c.count ? c.count.to * clamp01((tt - c.from) / 0.35) : 0;
  return (
    <div style={{ position: "absolute", top: Math.max(250, c.y), left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "rgba(20,14,12,0.82)",
          color: "#FFF8EE",
          borderRadius: 18,
          borderTop: `6px solid ${tone.accent}`,
          boxShadow: "0 14px 34px rgba(0,0,0,0.38)",
          padding: "24px 46px 24px",
          textAlign: "center",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          maxWidth: 900,
        }}
      >
        {c.count ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 5, color: tone.accent }}>{c.title}</div>
            <div style={{ fontWeight: 900, fontSize: 118, lineHeight: 1.0 }}>
              {c.count.prefix ?? ""}
              {idNum(n, c.count.decimals)}
              <span style={{ fontSize: 72 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 900, fontSize: c.title.length > 16 ? 66 : 86, lineHeight: 1.05, letterSpacing: 1 }}>{c.title}</div>
        )}
        {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#F2DCC0" }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(60,35,15,0.26) 100%)" }} />
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

export const SaunaFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const L = LOOK[id];
  const Scene = SCENES[id];
  return (
    <AbsoluteFill>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={L.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="sky"
        exposure={0.95}
        envIntensity={0.55}
        ao
        near={0.05}
        far={80}
        overlay={() => <Hud t={t} />}
      >
        <color attach="background" args={[L.bg]} />
        <fog attach="fog" args={[L.bg, L.fogNear, L.fogFar]} />
        <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2]]} />
        <primitive object={sunTarget} position={cam.target} />
        <directionalLight
          target={sunTarget}
          position={[cam.target[0] + L.key[0], cam.target[1] + L.key[1], cam.target[2] + L.key[2]]}
          intensity={L.ki ?? 2.0}
          color={L.key[3]}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0005}
          shadow-radius={2}
          shadow-normalBias={0.02}
        />
        {L.rim > 0 ? <directionalLight position={[cam.target[0] - 3, cam.target[1] + 3, cam.target[2] - 4]} intensity={L.rim} color="#FFD2A0" /> : null}
        {L.fill ? <directionalLight position={[cam.target[0] + L.fill[0], cam.target[1] + L.fill[1], cam.target[2] + L.fill[2]]} intensity={L.fill[4]} color={L.fill[3]} /> : null}
        {L.haze ? <Haze color={L.bg} x={id === "C" ? 9 : 0} /> : null}
        <Scene t={t} f={f} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(255,250,240,0.97)" activeColor="#A8361A" baseColor="#2B170C" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="finlandia-sauna-ep59" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
