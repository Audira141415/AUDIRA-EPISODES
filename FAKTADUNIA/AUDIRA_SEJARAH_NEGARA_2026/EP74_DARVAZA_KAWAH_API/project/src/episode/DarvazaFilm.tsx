// EP74 Darvaza, "Gerbang Neraka" — WORLDFORGE (realistic miniature world), Remotion + R3F. Film clock = VO clock (offset 0).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { SkyDome, type SkyColors } from "../kits/worldforge/Sky.tsx";
import { clamp01, easeOutBack } from "../kits/feltcraft/core/motion";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, CARD_Y, cameraAt, shotAt, fireAt, type Card, type SceneId, type V3 } from "./timeline.ts";
import { SCENES } from "./scenes.tsx";
import { DesertTerrain, CraterFire, craterFlames } from "./parts.tsx";
import { SUN } from "./world.ts";
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

// Display spelling for the subtitles (the TTS text is phonetic).
const DISPLAY: Record<string, string> = { Asgabat: "Ashgabat", Kurunis: "Kourounis", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

// Flames avoid the explorer's rope line and landing spot (scene G).
const FLAMES = craterFlames((x, z) => (Math.abs(x) < 1.75 && z < -17) || Math.hypot(x, z + 19) < 5 || Math.hypot(x - 2, z + 12.5) < 5);

const norm = (v: V3): V3 => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
};
type Look = {
  sky?: SkyColors;
  sun: V3;
  bg: string;
  hemi: [string, string, number];
  key: [string, number];
  fog: [string, number];
  env: number;
  exposure: number;
};
const NIGHT_SKY: SkyColors = { zenith: "#070B18", horizon: "#1E1A2A", glow: "#3A2A30", halo: "#6070A0", ground: "#120E0C", sunDisk: 0 };
const MOON = norm([0.45, 0.55, -0.7]);
const NIGHT: Look = { sky: NIGHT_SKY, sun: MOON, bg: "#0B0D18", hemi: ["#5A70A8", "#1E1A26", 0.6], key: ["#9DB4F0", 1.1], fog: ["#141A30", 0.0022], env: 0.18, exposure: 1.0 };
const LOOK: Record<SceneId, Look> = {
  A: NIGHT,
  B: { sky: { zenith: "#5F8FC6", horizon: "#D9D4C4", glow: "#FFF0D2", halo: "#FFFFFF", ground: "#8A7A60", sunDisk: 0 }, sun: SUN, bg: "#C9D2D8", hemi: ["#CFE0FF", "#B89A70", 0.5], key: ["#FFF1D8", 2.6], fog: ["#D9D4C4", 0.0025], env: 0.55, exposure: 1.0 },
  C: { sky: { zenith: "#5A8CC8", horizon: "#DCD6C2", glow: "#FFF0D2", halo: "#FFFFFF", ground: "#9A8462", sunDisk: 12 }, sun: SUN, bg: "#DCD6C2", hemi: ["#CFE0FF", "#B89A70", 0.45], key: ["#FFF0D6", 3.6], fog: ["#DCD6C2", 0.0016], env: 0.55, exposure: 1.0 },
  D: { sky: { zenith: "#2A2E5A", horizon: "#E08A5A", glow: "#FF9A50", halo: "#FFD0A0", ground: "#3A2A22", sunDisk: 8 }, sun: norm([0.75, 0.1, -0.65]), bg: "#6A4A50", hemi: ["#7A6A9A", "#4A3020", 0.4], key: ["#FF9A5A", 1.6], fog: ["#C8805A", 0.0022], env: 0.3, exposure: 1.05 },
  E: { sun: norm([-0.4, 0.8, 0.5]), bg: "#0F141E", hemi: ["#8AA0C0", "#3A2A20", 0.45], key: ["#FFFFFF", 2.0], fog: ["#0F141E", 0.0008], env: 0.3, exposure: 1.0 },
  F: NIGHT,
  G: NIGHT,
  H: { sky: { zenith: "#0E1838", horizon: "#C07A5A", glow: "#E08A60", halo: "#FFB08A", ground: "#1A1412", sunDisk: 0 }, sun: norm([0.9, 0.06, -0.35]), bg: "#2A2438", hemi: ["#5A6A9A", "#2A1E16", 0.35], key: ["#FFB08A", 0.7], fog: ["#4A3E52", 0.0016], env: 0.2, exposure: 1.05 },
  I: { sky: { zenith: "#3A6AAA", horizon: "#F2C49A", glow: "#FFB070", halo: "#FFE0B0", ground: "#5A4632", sunDisk: 10 }, sun: norm([0.85, 0.16, -0.45]), bg: "#E8C49A", hemi: ["#BCD0F0", "#A07850", 0.5], key: ["#FFC28A", 3.0], fog: ["#E8C49A", 0.0018], env: 0.5, exposure: 1.0 },
};
const DESERT: SceneId[] = ["A", "C", "D", "F", "G", "H", "I"];
const fireFor = (id: SceneId, t: number) => (id === "A" || id === "F" || id === "G" ? 1 : id === "C" ? 0 : fireAt(t));

// ---------- HUD (dark documentary card, layout px 1080 × 1920) ----------
const TONE = { cream: "#FFB25A", blue: "#6FA8FF", fire: "#FF6A2A", green: "#6CE0A0" } as const;
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

const Bacteria: React.FC = () => (
  <div style={{ width: 200, height: 200, borderRadius: 100, background: "radial-gradient(circle, #1E3A2C 0%, #0E1E16 100%)", border: "5px solid #6CE0A0", position: "relative", overflow: "hidden", flex: "none" }}>
    {[
      [60, 50, 20],
      [110, 70, -35],
      [80, 120, 60],
      [130, 130, 10],
      [45, 105, -70],
      [120, 40, 80],
      [95, 160, -15],
    ].map(([x, y, r], i) => (
      <div key={i} style={{ position: "absolute", left: x - 26, top: y - 9, width: 52, height: 18, borderRadius: 9, background: "#9CFFC8", boxShadow: "0 0 12px #4CFFB0", transform: `rotate(${r}deg)` }} />
    ))}
  </div>
);

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const tt = Math.floor(t * 12) / 12;
  const inA = clamp01((tt - c.from) / 0.3);
  const out = clamp01((c.to - tt) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.7) * out;
  const accent = TONE[c.tone ?? "cream"];
  let num = "";
  if (c.count) {
    const k = clamp01((tt - c.from) / (c.count.from != null ? 1.0 : 0.4));
    const v = (c.count.from ?? 0) + (c.count.to - (c.count.from ?? 0)) * k;
    num = c.count.plain ? v.toFixed(c.count.decimals) : idNum(v, c.count.decimals);
  }
  const barK = c.bar ? clamp01((tt - c.from - 0.35) / 1.6) : 0;
  const barV = c.bar ? c.bar.from + (c.bar.to - c.bar.from) * barK : 0;
  return (
    <div style={{ position: "absolute", top: CARD_Y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "rgba(20,14,12,0.84)",
          color: "#FFF8EE",
          borderRadius: 18,
          borderTop: `6px solid ${accent}`,
          boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
          padding: "24px 46px 24px",
          textAlign: "center",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          maxWidth: 940,
          display: "flex",
          alignItems: "center",
          gap: 34,
        }}
      >
        {c.micro ? <Bacteria /> : null}
        <div style={{ flex: 1 }}>
          {c.count ? (
            <>
              <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 5, color: accent }}>{c.title}</div>
              <div style={{ fontWeight: 900, fontSize: c.count.prefix ? 96 : 118, lineHeight: 1.0, whiteSpace: "nowrap" }}>
                {c.count.prefix ?? ""}
                {num}
                <span style={{ fontSize: 72 }}>{c.count.suffix}</span>
              </div>
            </>
          ) : (
            <div style={{ fontWeight: 900, fontSize: c.title.length > 16 ? 64 : 86, lineHeight: 1.05, letterSpacing: 1, color: c.bar ? accent : "#FFF8EE" }}>{c.title}</div>
          )}
          {c.bar ? (
            <div style={{ marginTop: 16, width: 640 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 700, color: "#F2DCC0" }}>
                <span>2022</span>
                <span>{c.bar.label}</span>
              </div>
              <div style={{ marginTop: 8, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                <div style={{ width: `${barV * 100}%`, height: "100%", borderRadius: 23, background: "linear-gradient(90deg, #FF3A10, #FFB040)" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 44, fontWeight: 900 }}>{Math.round(barV * 100)}%</div>
            </div>
          ) : null}
          {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#F2DCC0" }}>{c.sub}</div> : null}
        </div>
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(20,10,5,0.34) 100%)" }} />
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

const sunTarget = new THREE.Object3D();

export const DarvazaFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const L = LOOK[id];
  const Scene = SCENES[id];
  const desert = DESERT.includes(id);
  const fire = fireFor(id, t);
  return (
    <AbsoluteFill>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={L.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="sky"
        exposure={L.exposure}
        envIntensity={L.env}
        ao
        near={0.1}
        far={9500}
        overlay={() => <Hud t={t} />}
      >
        <color attach="background" args={[L.bg]} />
        <fogExp2 attach="fog" args={[L.fog[0], L.fog[1]]} />
        {L.sky ? <SkyDome key={id} sun={L.sun} colors={L.sky} /> : null}
        <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2]]} />
        <primitive object={sunTarget} position={cam.target} />
        <directionalLight
          target={sunTarget}
          position={[cam.target[0] + L.sun[0] * 150, cam.target[1] + L.sun[1] * 150, cam.target[2] + L.sun[2] * 150]}
          intensity={L.key[1]}
          color={L.key[0]}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-camera-near={1}
          shadow-camera-far={400}
          shadow-bias={-0.0004}
          shadow-normalBias={0.05}
        />
        {desert ? <DesertTerrain /> : null}
        {desert ? <CraterFire t={t} fire={fire} flames={FLAMES} light={id === "I" ? 1.4 : id === "A" || id === "H" ? 1.0 : 0.8} /> : null}
        <Scene t={t} f={f} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(255,250,240,0.97)" activeColor="#A8361A" baseColor="#2B170C" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="darvaza-kawah-api" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
