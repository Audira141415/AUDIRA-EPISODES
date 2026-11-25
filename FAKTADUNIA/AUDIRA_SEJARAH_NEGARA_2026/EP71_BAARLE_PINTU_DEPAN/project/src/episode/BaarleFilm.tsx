// EP71 Baarle — Pintu Depan Menentukan Negaramu. SATELLITEBRIEFING, Remotion + R3F. Film clock = VO clock (offset 0).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, cameraAt, shotAt, type Card, type Tone } from "./timeline.ts";
import { SCENES } from "./scenes.tsx";
import { clamp01 } from "./parts.tsx";
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

const sunTarget = new THREE.Object3D();
const BG = "#070B0E";

const DISPLAY: Record<string, string> = { Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

const ACCENT: Record<Tone, string> = { amber: "#FFBE55", blue: "#5FA8FF", red: "#FF5A4D", white: "#E8F4FF" };
const FONT = "'Space Grotesk', 'Segoe UI', Arial, sans-serif";
const easeOutBack = (x: number) => {
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// ---------- HUD briefing card (layout px 1080 × 1920, top band; bottom 380 px stays clear) ----------
const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const inA = clamp01((t - c.from) / 0.28);
  const out = clamp01((c.to - t) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA) * out;
  const acc = ACCENT[c.tone ?? "white"];
  const n = c.count ? Math.round(c.count * clamp01((t - c.from) / 0.45)) : 0;
  const big = c.count ? String(n) : c.big;
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          transformOrigin: "50% 0%",
          background: "rgba(4,12,18,0.86)",
          color: "#F2F5F6",
          border: `2px solid ${acc}`,
          borderLeft: `12px solid ${acc}`,
          boxShadow: `0 0 34px ${acc}55`,
          padding: "20px 46px 24px",
          textAlign: "center",
          fontFamily: FONT,
          maxWidth: 920,
        }}
      >
        {c.tag ? <div style={{ fontWeight: 700, fontSize: 36, letterSpacing: 6, color: acc }}>▣ {c.tag}</div> : null}
        {big ? <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1.0, color: acc, textShadow: `0 0 26px ${acc}88` }}>{big}</div> : null}
        {c.title ? <div style={{ fontWeight: 900, fontSize: c.title.length > 16 ? 64 : 84, lineHeight: 1.05, letterSpacing: 1 }}>{c.title}</div> : null}
        {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#BFD3E0" }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const sec = Math.floor(t);
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,6,12,0.78) 100%)" }} />
      {t < FILM_SECONDS - OUTRO_SECONDS ? (
        <div style={{ position: "absolute", top: 210, left: 60, right: 60, display: "flex", justifyContent: "space-between", color: "#7FD3FF", fontSize: 36, letterSpacing: 3, fontWeight: 700 }}>
          <span>
            <span style={{ color: "#FF5A4D", opacity: blink ? 1 : 0.75 }}>●</span> SAT-71 · BAARLE
          </span>
          <span>51.44°N 4.93°E · T+{String(sec).padStart(2, "0")}</span>
        </div>
      ) : null}
      {CARDS.map((c, i) => (
        <HudCard key={i} c={c} t={t} />
      ))}
    </div>
  );
};

export const BaarleFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t);
  const Scene = SCENES[shotAt(t).scene];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={BG}
        profile={COLOR_PROFILES.CYBER_NEON_VOID}
        hdri="night"
        exposure={1.35}
        focus={Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2])}
        aperture={0.025}
        maxBlur={0.012}
        envIntensity={0.7}
        near={0.05}
        far={80}
        overlay={() => <Hud t={t} />}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 6, 18]} />
        <hemisphereLight args={["#9FB4C8", "#1A1410", 0.75]} />
        <primitive object={sunTarget} position={cam.target} />
        {/* low oblique key: lit tops vs dark sides (memory: avoid flat near-nadir light) */}
        <directionalLight
          target={sunTarget}
          position={[cam.target[0] + 5, cam.target[1] + 4.5, cam.target[2] + 2.5]}
          intensity={2.4}
          color="#CFE2FF"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[cam.target[0] - 4, cam.target[1] + 3, cam.target[2] - 5]} intensity={2.2} color="#FFB060" />
        <spotLight position={[cam.target[0], cam.target[1] + 4.5, cam.target[2] + 1.2]} target={sunTarget} angle={0.42} penumbra={0.7} intensity={38} distance={14} color="#FFE2B0" />
        <Scene t={t} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1300} size={54} maxWords={4} plate="rgba(4,12,18,0.88)" activeColor="#FFBE55" baseColor="#F2F5F6" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="sejarah-negara-ep71" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
