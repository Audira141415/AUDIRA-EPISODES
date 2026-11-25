// EP72 Gempa Lisbon 1755 — MOSAICFORGE, Remotion + R3F. Film clock = VO clock (offset 0).
// FilmScene post={false}: the kit's own chain (MosaicCameraRig -> MosaicPost: bloom -> ACES -> grade).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { Subtitle, type WordTiming } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { AudiraSignature } from "../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../brand/AudiraOutro.tsx";
import { MosaicCameraRig, MosaicPost } from "../kits/mosaicforge/lib/post";
import { FILM_SECONDS, OUTRO_SECONDS, CARDS, cameraAt, shotAt, type Card, type SceneId } from "./timeline.ts";
import { SCENES } from "./scenes.tsx";
import { clamp01, Azulejo } from "./parts.tsx";
import words from "../../public/audio/vo-words.json";

export { FILM_SECONDS };

// Display spelling for the subtitles (the TTS text is phonetic).
const DISPLAY: Record<string, string> = { Baisya: "Baixa", gayola: "gaiola", Markis: "Marquis", Audira: "AUDIRA" };
const SUB_WORDS: WordTiming[] = (words as WordTiming[]).map((w) => {
  const m = w.text.match(/^([^.,!?]+)([.,!?]*)$/);
  return m && DISPLAY[m[1]] ? { ...w, text: DISPLAY[m[1]] + m[2] } : w;
});

type Look = { bg: string; hemi: [string, string, number]; key: [number, number, number, string]; ki: number; fill: number; fogNear: number; fogFar: number };
const LOOK: Record<SceneId, Look> = {
  S1: { bg: "#E8DCC4", hemi: ["#FFF4E2", "#B8A486", 0.85], key: [-3.5, 3.2, 3.5, "#FFE2B8"], ki: 2.6, fill: 0.5, fogNear: 8, fogFar: 22 },
  S2: { bg: "#E6CFA8", hemi: ["#FFF0D8", "#A8906E", 0.8], key: [-4, 4.5, 3, "#FFD9A0"], ki: 2.6, fill: 0.5, fogNear: 10, fogFar: 26 },
  S3: { bg: "#2C3550", hemi: ["#DCE6FF", "#5A4C3E", 0.85], key: [-3, 6, 2.5, "#FFE6C2"], ki: 2.4, fill: 0.6, fogNear: 12, fogFar: 30 },
  S4: { bg: "#B9C8D8", hemi: ["#E4EEFF", "#7A6A58", 0.8], key: [-4, 5, 3, "#FFE8C8"], ki: 2.4, fill: 0.55, fogNear: 9, fogFar: 24 },
  S5: { bg: "#8C9CB0", hemi: ["#D2DEF2", "#5E5448", 0.75], key: [-3, 5, 4, "#F2EAE0"], ki: 2.2, fill: 0.6, fogNear: 9, fogFar: 22 },
  S6: { bg: "#7A4A34", hemi: ["#FFC8A0", "#4A3428", 0.6], key: [4, 3, 3, "#FF9E5E"], ki: 2.6, fill: 0.35, fogNear: 9, fogFar: 22 },
  S7: { bg: "#6E655C", hemi: ["#D8D0C6", "#3E3630", 0.7], key: [-3, 4, 4, "#E8DCCC"], ki: 1.8, fill: 0.45, fogNear: 10, fogFar: 26 },
  S8: { bg: "#CDBEA6", hemi: ["#F4EAD8", "#8A7860", 0.45], key: [-5, 2.6, 2, "#FFD8A0"], ki: 3.2, fill: 0.3, fogNear: 9, fogFar: 24 },
  S9: { bg: "#DCCBAE", hemi: ["#FFF0DA", "#8E7656", 0.8], key: [-3.5, 4, 3.5, "#FFDCA8"], ki: 2.6, fill: 0.5, fogNear: 10, fogFar: 26 },
  S10: { bg: "#2E3852", hemi: ["#E2E8FF", "#5C4E40", 0.85], key: [3, 5, 3, "#FFE2B8"], ki: 2.4, fill: 0.6, fogNear: 10, fogFar: 28 },
  S11: { bg: "#F0C890", hemi: ["#FFE6C4", "#A07A56", 0.45], key: [-4, 2.0, -3, "#FFB060"], ki: 3.4, fill: 0.3, fogNear: 9, fogFar: 26 },
};
const target = new THREE.Object3D();

// ---------- HUD card: deep cobalt glazed plate, plain text (no glow), layout px 1080 × 1920 ----------
const ACCENT = { ochre: "#D69A3A", terra: "#E0703C", sky: "#8FB0F0" } as const;
const idNum = (v: number, d: number) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
const backOut = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

const HudCard: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const inA = clamp01((t - c.from) / 0.28);
  const out = clamp01((c.to - t) / 0.2);
  if (inA <= 0 || out <= 0) return null;
  const s = backOut(inA) * out;
  const accent = ACCENT[c.tone ?? "ochre"];
  const n = c.count ? c.count.to * clamp01((t - c.from) / 0.45) : 0;
  const long = c.title.length > 18;
  return (
    <div style={{ position: "absolute", top: Math.max(250, c.y ?? 250), left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "rgba(19,48,111,0.88)",
          color: "#FFFFFF",
          borderRadius: 16,
          border: "3px solid rgba(243,238,226,0.9)",
          borderTop: `8px solid ${accent}`,
          boxShadow: "0 12px 30px rgba(10,16,40,0.35)",
          padding: "22px 44px 24px",
          textAlign: "center",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          maxWidth: 940,
        }}
      >
        {c.count ? (
          <>
            <div style={{ fontWeight: 800, fontSize: 42, letterSpacing: 4, color: accent }}>{c.title}</div>
            <div style={{ fontWeight: 900, fontSize: 116, lineHeight: 1.0 }}>
              {c.count.prefix ?? ""}
              {idNum(n, c.count.decimals)}
              <span style={{ fontSize: 66 }}>{c.count.suffix}</span>
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 900, fontSize: long ? 58 : 84, lineHeight: 1.08, letterSpacing: 1 }}>{c.title}</div>
        )}
        {c.sub ? <div style={{ fontSize: 40, fontWeight: 600, marginTop: 8, color: "#F3E6C8" }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {/* darker caption floor so the subtitle never sits on the tile pattern */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1150, height: 500, background: "linear-gradient(rgba(12,18,40,0), rgba(12,18,40,0.42) 45%, rgba(12,18,40,0.42) 80%, rgba(12,18,40,0))" }} />
    {CARDS.map((c, i) => (
      <HudCard key={i} c={c} t={t} />
    ))}
  </div>
);

// Tessera backdrop: a far wall of low-contrast tiles in the scene's bg tone, always facing the camera,
// so no frame shows a plain sky/wall plane (draft 1 audit: 36 % flat planes, material capped at 3).
const Backdrop: React.FC<{ color: string; pos: [number, number, number]; target: [number, number, number]; t: number }> = ({ color, pos, target, t }) => {
  const ref = React.useRef<THREE.Group>(null);
  const paint = React.useMemo(() => {
    const c = new THREE.Color(color);
    return (_u: number, _v: number, i: number, j: number) => {
      const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
      const r = h - Math.floor(h);
      const k = (i + j) % 7 === 0 ? 0.8 : 0.9 + r * 0.22;
      return "#" + c.clone().multiplyScalar(k).getHexString();
    };
  }, [color]);
  const d = new THREE.Vector3(...target).sub(new THREE.Vector3(...pos)).normalize();
  const p = new THREE.Vector3(...target).addScaledVector(d, 9);
  React.useLayoutEffect(() => {
    ref.current?.lookAt(pos[0], pos[1], pos[2]);
  });
  return (
    <group ref={ref} position={[p.x, p.y, p.z]}>
      <Azulejo cols={30} rows={48} pitch={0.42} paint={paint} t={t} center depth={0.06} seed={11} />
    </group>
  );
};

export const LisbonFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const cam = cameraAt(t);
  const id = shotAt(t).scene;
  const L = LOOK[id];
  const Scene = SCENES[id];
  const shot = { pos: cam.pos, target: cam.target, fov: cam.fov, exposure: 0.84 };
  return (
    <AbsoluteFill>
      <FilmScene
        frame={frame}
        shot={{ pos: cam.pos, target: cam.target, fov: cam.fov }}
        background={L.bg}
        profile={COLOR_PROFILES.DOCUMENTARY_WARM}
        hdri="sky"
        exposure={0.84}
        envIntensity={0.4}
        ao
        near={0.05}
        far={80}
        post={false}
        overlay={() => <Hud t={t} />}
      >
        <MosaicCameraRig shot={shot} near={0.05} far={80} />
        <color attach="background" args={[L.bg]} />
        <fog attach="fog" args={[L.bg, L.fogNear, L.fogFar]} />
        <hemisphereLight args={[L.hemi[0], L.hemi[1], L.hemi[2]]} />
        <primitive object={target} position={cam.target} />
        <directionalLight
          target={target}
          position={[cam.target[0] + L.key[0], cam.target[1] + L.key[1], cam.target[2] + L.key[2]]}
          intensity={L.ki}
          color={L.key[3]}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[cam.pos[0] + 2, cam.pos[1] + 2, cam.pos[2] + 3]} intensity={L.fill} color="#DCE6F8" />
        <Backdrop key={id} color={L.bg} pos={cam.pos} target={cam.target} t={0} />
        <Scene t={t} f={f} />
        <MosaicPost frame={frame} strength={0.22} radius={0.35} threshold={0.95} vignette={0.4} grain={0.01} />
      </FilmScene>
      <Subtitle words={SUB_WORDS} frame={frame} fps={fps} offset={0} position={1290} size={56} maxWords={4} plate="rgba(243,238,226,0.97)" activeColor="#1F3C8C" baseColor="#2B1C10" />
      <Voiceover src="audio/vo.wav" offset={0} />
      {t >= FILM_SECONDS - OUTRO_SECONDS ? <AudiraOutro seconds={OUTRO_SECONDS} /> : null}
      <AudiraSignature seed="gempa-lisbon-ep72" outroSeconds={OUTRO_SECONDS} />
    </AbsoluteFill>
  );
};
