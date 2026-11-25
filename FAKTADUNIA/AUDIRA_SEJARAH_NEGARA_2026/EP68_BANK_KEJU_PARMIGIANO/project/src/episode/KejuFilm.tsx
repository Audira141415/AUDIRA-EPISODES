// EP68 Bank Keju Credem — FOODFORGE, Remotion + R3F. Film clock = VO clock (offset 0).
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
const DISPLAY: Record<string, string> = { Kredem: "Credem", Rejio: "Reggio", Parmijano: "Parmigiano", Rejano: "Reggiano", Proshuto: "Prosciutto", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

// FOODFORGE: warm key from above, warm rim on the rinds (memory: warm rim light), night scene E blue-violet (not black).
type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; rim: number; fogNear: number; fogFar: number; ki?: number; fill?: [number, number, number, string, number]; haze?: boolean };
const WARM: Pick<Look, "key" | "ki" | "fill" | "rim"> = { key: [-3, 5, 3, "#FFD29A"], ki: 2.4, fill: [4, 2.5, 6, "#FFE9CC", 0.5], rim: 1.3 };
const LOOK: Record<SceneId, Look> = {
  A: { bg: "#5A4530", hemi: ["#FFE2B8", "#6E5238", 0.55], ...WARM, fogNear: 12, fogFar: 30 },
  B: { bg: "#F2C9A0", hemi: ["#FFE8CC", "#B98F6A", 0.8], key: [-6, 3, 3, "#FFC27E"], ki: 2.8, fill: [4, 2.5, 7, "#CFE0F2", 0.5], rim: 1.0, haze: true, fogNear: 9, fogFar: 24 },
  C: { bg: "#E9C9A0", hemi: ["#FFE8C8", "#8A7448", 0.6], key: [-5, 3, 4, "#FFBE78"], ki: 3.0, fill: [4, 2.5, 7, "#DCE8F2", 0.5], rim: 1.1, haze: true, fogNear: 10, fogFar: 26 },
  D: { bg: "#C9A47E", hemi: ["#FFE8C8", "#7A5236", 0.65], ...WARM, fogNear: 14, fogFar: 32 },
  E: { bg: "#3E4470", hemi: ["#8C96D8", "#3A2E3E", 0.85], key: [4, 6, 3, "#A8B4FF"], ki: 1.4, fill: [-3, 2, 5, "#FFD9A0", 0.35], rim: 0.6, fogNear: 10, fogFar: 26 },
  F: { bg: "#6A4A2C", hemi: ["#FFE0B0", "#5E4028", 0.6], key: [-2, 7, 2, "#FFCF8A"], ki: 2.6, fill: [3, 2, 5, "#FFE6C4", 0.45], rim: 1.5, fogNear: 6, fogFar: 26 },
};

// ---------- HUD card (cream FOODFORGE card, layout px 1080 × 1920) ----------
const TONE = { gold: { accent: "#E2B04A", ink: "#7A4E0E" }, red: { accent: "#B3261E", ink: "#9A1F18" }, blue: { accent: "#3E4470", ink: "#2E3460" }, green: { accent: "#3F5E3A", ink: "#2F4A2B" } } as const;
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const tt = Math.floor(t * 12) / 12;
  const inA = clamp01((tt - c.from) / 0.3);
  const out = clamp01((c.to - tt) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.7) * out;
  const tone = TONE[c.tone ?? "gold"];
  const n = c.count ? (c.count.year ? c.count.to : c.count.to * clamp01((tt - c.from) / 0.35)) : 0;
  return (
    <div style={{ position: "absolute", top: Math.max(250, c.y), left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "rgba(255,246,226,0.94)",
          color: "#3B2414",
          borderRadius: 18,
          borderTop: `6px solid ${tone.accent}`,
          boxShadow: "0 14px 34px rgba(0,0,0,0.38)",
          padding: "24px 46px 24px",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          maxWidth: 900,
        }}
      >
        {c.count ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 5, color: tone.ink }}>{c.title}</div>
            <div style={{ fontWeight: 900, fontSize: 118, lineHeight: 1.0 }}>
              {c.count.prefix ?? ""}
              {c.count.year ? String(c.count.to) : idNum(n, c.count.decimals)}
              <span style={{ fontSize: 72 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div
            style={{
              fontWeight: 900,
              fontSize: c.title.length > 16 ? 62 : 88,
              lineHeight: 1.05,
              letterSpacing: 1,
              color: c.stamp ? tone.ink : undefined,
              border: c.stamp ? `6px solid ${tone.accent}` : undefined,
              padding: c.stamp ? "4px 18px" : undefined,
              transform: c.stamp ? "rotate(-4deg)" : undefined,
            }}
          >
            {c.title}
          </div>
        )}
        {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#6E4426" }}>{c.sub}</div> : null}
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

export const KejuFilm: React.FC = () => {
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
        hdri={id === "B" || id === "C" ? "sky" : "studio"}
        exposure={0.9}
        envIntensity={0.45}
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
        {L.haze ? <Haze color={L.bg} /> : null}
        <Scene t={t} f={f} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(255,250,240,0.97)" activeColor="#A8361A" baseColor="#2B170C" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="ep68-bank-keju" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
