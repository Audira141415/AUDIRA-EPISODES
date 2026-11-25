// EP69 Kiruna — HD2D (diorama + pixel sprites + tilt-shift), Remotion + R3F. Film clock = VO clock (offset 0).
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

// TTS text is phonetic: "El Ka A Be" → LKAB, "Audira" → AUDIRA.
const SUB_WORDS: WordTiming[] = (() => {
  const src = words as WordTiming[];
  const out: WordTiming[] = [];
  for (let i = 0; i < src.length; i++) {
    const w = src[i];
    const bare = w.text.replace(/[.,!?:]/g, "");
    if (bare === "El" && src[i + 3] && src[i + 1].text === "Ka" && src[i + 2].text === "A" && src[i + 3].text.startsWith("Be")) {
      out.push({ text: "LKAB" + src[i + 3].text.slice(2), start: w.start, end: src[i + 3].end });
      i += 3;
      continue;
    }
    out.push(bare === "Audira" ? { ...w, text: w.text.replace("Audira", "AUDIRA") } : w);
  }
  return out;
})();

// key = sun relative to the camera target; S1/S5–S8 = August afternoon (no snow), S2–S4 = snowy dusk.
type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; ki: number; rim: number; fogNear: number; fogFar: number };
const AUG: Look = { bg: "#BFD5E4", hemi: ["#E2EEFF", "#E6D2B0", 0.8], key: [-5, 4.2, 3.4, "#FFD7A2"], ki: 2.7, rim: 0.9, fogNear: 12, fogFar: 34 };
const DUSK: Look = { bg: "#8692B8", hemi: ["#C3CDEA", "#E9D2C8", 0.85], key: [-6, 2.4, -3, "#FFB98E"], ki: 2.1, rim: 1.2, fogNear: 10, fogFar: 30 };
const LOOK: Record<SceneId, Look> = {
  A: AUG,
  B: { ...DUSK, fogNear: 14, fogFar: 40 },
  C: { ...DUSK, bg: "#6F7AA0", hemi: ["#D0D8F0", "#C8B8A8", 1.0], fogNear: 14, fogFar: 40 },
  D: { ...DUSK, fogNear: 14, fogFar: 40 },
  E: { bg: "#E6C7A6", hemi: ["#FFE6C8", "#C9A880", 0.75], key: [-6, 2.2, -1.5, "#FFB070"], ki: 2.8, rim: 1.4, fogNear: 12, fogFar: 32 },
  F: AUG,
  G: AUG,
  H: { ...AUG, bg: "#E4CDB0", key: [-5, 3.2, 2.5, "#FFC88E"], rim: 1.2 },
};

/** S7 time-lapse: the sun swings across two days. */
const keyFor = (id: SceneId, t: number): [number, number, number, string] => {
  if (id !== "G") return LOOK[id].key;
  const a = (t - 59.9) * 0.55;
  return [-6 * Math.cos(a), 3.2 + Math.sin(a * 0.5), 4 * Math.sin(a), "#FFD2A0"];
};

// ---------- HUD (HD2D JRPG window: navy glass, double gold frame, layout px 1080 × 1920) ----------
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const NAVY = "rgba(14,20,38,0.88)";
const GOLD = "#E8B14A";
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

const Frame: React.FC<{ children: React.ReactNode; s: number; pad?: string; accent?: string }> = ({ children, s, pad = "26px 50px", accent = GOLD }) => (
  <div
    style={{
      transform: `scale(${s})`,
      background: NAVY,
      border: `5px solid ${accent}`,
      outline: "3px solid rgba(255,240,210,0.55)",
      outlineOffset: -12,
      boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
      padding: pad,
      textAlign: "center",
      fontFamily: FONT,
      color: "#FFF7E6",
      maxWidth: 940,
      imageRendering: "pixelated",
    }}
  >
    {children}
  </div>
);

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const tt = Math.floor(t * 12) / 12;
  const inA = clamp01((tt - c.from) / 0.3);
  const out = clamp01((c.to - tt) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = easeOutBack(inA, 1.7) * out;
  if (c.kind === "chip") {
    return (
      <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${s})`, background: c.title.startsWith("●") ? "rgba(170,28,24,0.92)" : NAVY, border: `4px solid ${GOLD}`, borderRadius: 6, padding: "14px 34px", fontFamily: FONT, fontWeight: 900, fontSize: 48, letterSpacing: 3, color: "#FFF7E6" }}>{c.title}</div>
      </div>
    );
  }
  if (c.kind === "stamp") {
    return (
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${1.6 - 0.6 * Math.min(1, inA * 1.4)}) rotate(-6deg)`, opacity: out, border: "10px solid #D8352A", color: "#D8352A", background: "rgba(255,246,232,0.93)", padding: "22px 40px", fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.08, textAlign: "center", maxWidth: 900, letterSpacing: 1 }}>
          {c.title}
          {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#7A2018", letterSpacing: 6 }}>{c.sub.toUpperCase()}</div> : null}
        </div>
      </div>
    );
  }
  if (c.kind === "dialog") {
    const n = Math.floor(clamp01((tt - c.from) / 1.2) * c.title.length);
    return (
      <div style={{ position: "absolute", top: 900, left: 70, right: 70, opacity: out }}>
        <div style={{ display: "inline-block", background: GOLD, color: "#1A1208", fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: "6px 22px", marginLeft: 18, letterSpacing: 3 }}>AUDIRA</div>
        <div style={{ background: NAVY, border: `5px solid ${GOLD}`, outline: "3px solid rgba(255,240,210,0.55)", outlineOffset: -12, padding: "30px 40px", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#FFF7E6", minHeight: 120 }}>
          {c.title.slice(0, n)}
          <span style={{ color: GOLD, opacity: Math.floor(tt * 3) % 2 ? 1 : 0 }}>▼</span>
        </div>
      </div>
    );
  }
  const n = c.count ? c.count.to * clamp01((tt - c.from) / 0.45) : 0;
  const big = c.kind === "big";
  return (
    <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Frame s={s}>
        {c.count ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 5, color: GOLD }}>{c.title}</div>
            <div style={{ fontWeight: 900, fontSize: 128, lineHeight: 1.0 }}>
              {c.count.prefix ?? ""}
              {idNum(Math.round(n), c.count.decimals)}
              <span style={{ fontSize: 76 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 900, fontSize: big ? (c.title.length > 14 ? 78 : 104) : c.title.length > 18 ? 58 : 72, lineHeight: 1.05, letterSpacing: 1 }}>{c.title}</div>
        )}
        {c.sub ? <div style={{ fontSize: 40, marginTop: 8, color: "#F2DCB0", fontWeight: 600 }}>{c.sub}</div> : null}
      </Frame>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {/* scrims: soft vignette, top band behind the HUD, light tail behind the subtitles */}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 64% 34% at 50% 46%, rgba(0,0,0,0) 52%, rgba(18,14,30,0.42) 80%, rgba(14,10,24,0.62) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, background: "linear-gradient(rgba(12,16,30,0.42), rgba(12,16,30,0))" }} />
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

const sunTarget = new THREE.Object3D();

export const KirunaFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const L = LOOK[id];
  const key = keyFor(id, t);
  const Scene = SCENES[id];
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  return (
    <AbsoluteFill style={{ background: L.bg }}>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={L.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="sky"
        exposure={1}
        envIntensity={0.55}
        ao
        focus={focus}
        aperture={0.006}
        maxBlur={0.03}
        near={0.05}
        far={90}
        overlay={() => <Hud t={t} />}
      >
        <color attach="background" args={[L.bg]} />
        <fog attach="fog" args={[L.bg, L.fogNear, L.fogFar]} />
        <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2]]} />
        <primitive object={sunTarget} position={cam.target} />
        <directionalLight
          target={sunTarget}
          position={[cam.target[0] + key[0], cam.target[1] + key[1], cam.target[2] + key[2]]}
          intensity={L.ki}
          color={key[3]}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        {L.rim > 0 ? <directionalLight position={[cam.target[0] + 3, cam.target[1] + 3, cam.target[2] - 5]} intensity={L.rim} color="#FFE0B8" /> : null}
        <directionalLight position={[cam.target[0] + 4, cam.target[1] + 2, cam.target[2] + 7]} intensity={0.5} color="#C9DBF2" />
        <Scene t={t} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(255,250,240,0.97)" activeColor="#A8361A" baseColor="#2B170C" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="kiruna-ep69" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};

/** Cover / thumbnail: the hook frame frozen + a title plate. */
export const KirunaCover: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Freeze frame={Math.round(2.4 * fps)}>
        <KirunaFilm />
      </Freeze>
    </AbsoluteFill>
  );
};
