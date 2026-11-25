// EP75 Son Doong — WORLDFORGE (realistic miniature), Remotion + R3F. Film clock = VO clock (offset 0).
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
import * as THREE from "three";

const sunTarget = new THREE.Object3D();
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

// Display spelling for the subtitles (the TTS text is phonetic).
const DISPLAY: Record<string, string> = { Kan: "Khanh", Son: "Sơn", Dong: "Đoòng", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; rim: number; fogNear: number; fogFar: number; ki?: number; env: number; exp?: number };
const LOOK: Record<SceneId, Look> = {
  S1: { bg: "#BFD3D6", hemi: ["#E4F0FF", "#8A7A5C", 0.8], key: [-8, 7, 5, "#FFE0B0"], ki: 2.6, rim: 0.6, fogNear: 30, fogFar: 95, env: 0.5 },
  S2: { bg: "#A9BBAA", hemi: ["#DCEBDD", "#4E5A34", 0.85], key: [-5, 7, 4, "#FFF0D2"], ki: 2.0, rim: 0.7, fogNear: 10, fogFar: 40, env: 0.5 },
  S3: { bg: "#A9BBAA", hemi: ["#DCEBDD", "#4E5A34", 0.85], key: [-5, 9, 3, "#FFF0D2"], ki: 2.2, rim: 0.55, fogNear: 14, fogFar: 45, env: 0.5 },
  S4: { bg: "#0B0E12", hemi: ["#5A6A80", "#14100C", 0.6], key: [2, 6, 5, "#A8BCD6"], ki: 0.9, rim: 0.7, fogNear: 8, fogFar: 34, env: 0.14, exp: 1.15 },
  S5: { bg: "#5E6864", hemi: ["#D0DCD6", "#3A3229", 0.6], key: [0, 12, -20, "#FFE9C8"], ki: 1.6, rim: 0.7, fogNear: 22, fogFar: 95, env: 0.22 },
  S6: { bg: "#4A5648", hemi: ["#DCEAD2", "#2A2620", 0.5], key: [1, 14, -4, "#FFF0D0"], ki: 1.4, rim: 0.55, fogNear: 16, fogFar: 70, env: 0.22 },
  S7: { bg: "#56625A", hemi: ["#DCEAD2", "#2A2620", 0.5], key: [1, 14, 4, "#FFF0D0"], ki: 1.2, rim: 0.55, fogNear: 14, fogFar: 60, env: 0.22 },
  S8: { bg: "#120F0C", hemi: ["#E8D8C0", "#100C08", 0.2], key: [-8, 9, 1, "#FFD9A8"], ki: 1.1, rim: 0.55, fogNear: 12, fogFar: 40, env: 0.12 },
  S9: { bg: "#2B2723", hemi: ["#E8E0D0", "#3A3028", 0.75], key: [-6, 6, 8, "#FFE6C4"], ki: 2.0, rim: 0.55, fogNear: 24, fogFar: 70, env: 0.4 },
  S10: { bg: "#3A3A30", hemi: ["#E8E0C8", "#2A2620", 0.45], key: [1, 14, -4, "#FFF0D0"], ki: 1.2, rim: 0.55, fogNear: 14, fogFar: 60, env: 0.2 },
  S11: { bg: "#D6D4C6", hemi: ["#E8EEF5", "#7C8C5A", 0.75], key: [-12, 6, -6, "#FFCF96"], ki: 2.8, rim: 0.8, fogNear: 28, fogFar: 110, env: 0.5 },
};

// ---------- HUD card (dark documentary card, layout px 1080 × 1920) ----------
const TONE = { cream: { accent: "#FFB25A" }, blue: { accent: "#6FA8FF" }, rust: { accent: "#FF7A45" }, green: { accent: "#8BD16A" } } as const;
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const tt = Math.floor(t * 12) / 12;
  const inA = clamp01((tt - c.from) / 0.3);
  const out = clamp01((c.to - tt) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.7) * out;
  const tone = TONE[c.tone ?? "cream"];
  const n = c.count ? (c.count.from ?? 0) + (c.count.to - (c.count.from ?? 0)) * clamp01((tt - c.from) / (c.count.dur ?? 0.35)) : 0;
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
              {c.count.plain ? Math.round(n) : idNum(n, c.count.decimals)}
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

export const SonDoongFilm: React.FC = () => {
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
        exposure={L.exp ?? 0.95}
        envIntensity={L.env}
        ao
        near={0.05}
        far={200}
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
        {L.rim > 0 ? <directionalLight position={[cam.target[0] - 3, cam.target[1] + 3, cam.target[2] - 4]} intensity={L.rim * 2.2} color="#FFD2A0" /> : null}
        <Scene t={t} f={f} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(255,250,240,0.97)" activeColor="#A8361A" baseColor="#2B170C" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="son-doong-ep75" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
