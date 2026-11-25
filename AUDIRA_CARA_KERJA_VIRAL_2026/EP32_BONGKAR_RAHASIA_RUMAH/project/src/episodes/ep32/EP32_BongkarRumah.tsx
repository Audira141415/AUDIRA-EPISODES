// EP32 — BONGKAR RAHASIA RUMAH
// BUILDFORGE style · DOCUMENTARY_WARM · 92s @ 60fps · 1080×1920
// Format: Bongkar Topik (6 lapisan visual, 7 HUD callout, multi-scene rule)

import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { Voiceover } from "../../core/film/Voiceover.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { StageLabel } from "../../kits/buildforge/labels/StageLabel.tsx";
import { Post } from "../../kits/buildforge/render/Post.tsx";
import { DataCallout } from "./DataCallout.tsx";
import voWords from "../../../public/audio/vo-words.json";

const HOUSE_GLB = "/public/models/building/two-story-house-40f6dc.glb";
const SUN: [number, number, number] = [-0.78, 0.46, -0.32];

// ── VO-LOCKED SCENE CUTS ──────────────────────────────────────────────────────
const CUT = {
  S1: 0,      // Hook
  S2: 4.5,    // Surface
  S3: 12,     // Peel
  S4: 28,     // Mechanism
  S5: 59,     // Revelation
  S6: 79,     // Outro
  END: 92,
};

// ── CAMERA RIGS PER SCENE ─────────────────────────────────────────────────────
function getShot(t: number, fps: number, frame: number) {
  if (t < CUT.S2) {
    // S1 Hook: zoom cepat masuk → freeze
    const zoom = interpolate(t, [0, 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dist = 22 + zoom * 18;
    return { pos: [dist, 10, dist] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 28 + zoom * 12, roll: 0, exposure: 1 };
  }
  if (t < CUT.S3) {
    // S2 Surface: orbit perlahan kanan → kiri
    const angle = interpolate(t, [CUT.S2, CUT.S3], [0.5, -0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { pos: [Math.cos(angle) * 22, 9, Math.sin(angle) * 22] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 32, roll: 0, exposure: 1 };
  }
  if (t < CUT.S4) {
    // S3 Peel: pull back diagonal + tilt
    const pull = interpolate(t, [CUT.S3, CUT.S4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { pos: [18 + pull * 6, 8 + pull * 3, 18 + pull * 6] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 28, roll: 0, exposure: 1 };
  }
  if (t < CUT.S5) {
    // S4 Mechanism: pan mengikuti jaringan — kamera bergerak kiri-kanan rendah
    const pan = Math.sin((t - CUT.S4) * 0.3) * 4;
    return { pos: [pan, 6, 24] as [number, number, number], target: [pan * 0.5, 2, 0] as [number, number, number], fov: 24, roll: 0, exposure: 1.1 };
  }
  if (t < CUT.S6) {
    // S5 Revelation: dolly mundur dramatis
    const reveal = interpolate(t, [CUT.S5, CUT.S6 - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dist = 22 + reveal * 20;
    return { pos: [dist, 10 + reveal * 5, dist * 0.8] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 22 + reveal * 13, roll: 0, exposure: 1 };
  }
  // S6 Outro: golden hour pullback
  const drift = interpolate(t, [CUT.S6, CUT.END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { pos: [25 + drift * 5, 12, 20] as [number, number, number], target: [0, 2, 0] as [number, number, number], fov: 28, roll: 0, exposure: 1.15 };
}

// ── WIRE GEOMETRY (S4 Mechanism) ─────────────────────────────────────────────
const WireNetwork: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  const paths: [number, number, number][][] = [
    [[2, 0.5, 2], [2, 3, 2], [2, 3, -2], [-2, 3, -2]],
    [[-2, 0.5, 2], [-2, 2, 2], [-2, 2, -2]],
    [[0, 0.5, 0], [0, 1.5, 3], [3, 1.5, 3], [3, 3.5, 3]],
    [[1, 0.5, 1], [1, 2.5, -3], [-1, 2.5, -3], [-3, 2.5, -1]],
  ];
  return (
    <group>
      {paths.map((pts, i) => {
        const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        const geo = new THREE.TubeGeometry(curve, 20, 0.04, 6, false);
        return <mesh key={i} geometry={geo}><meshStandardMaterial color={i % 2 === 0 ? "#e8b400" : "#c0392b"} metalness={0.3} roughness={0.5} /></mesh>;
      })}
    </group>
  );
};

// ── CONCRETE COLUMNS (S5 Revelation) ─────────────────────────────────────────
const COLUMN_POSITIONS: [number, number, number][] = [
  [-4, 0, -4], [4, 0, -4], [-4, 0, 4], [4, 0, 4],
  [0, 0, -4], [0, 0, 4], [-4, 0, 0], [4, 0, 0],
];

const ConcreteColumns: React.FC<{ t: number; visible: boolean }> = ({ t, visible }) => {
  if (!visible) return null;
  const revealProgress = interpolate(t, [CUT.S5, CUT.S5 + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <group>
      {COLUMN_POSITIONS.map(([x, , z], i) => {
        const delay = i * 0.08;
        const p = Math.max(0, (revealProgress - delay) / (1 - delay));
        const height = p * 6;
        return (
          <mesh key={i} position={[x, height / 2 - 0.1, z]}>
            <boxGeometry args={[0.3, Math.max(0.01, height), 0.3]} />
            <meshStandardMaterial color="#e8a020" metalness={0.1} roughness={0.6} emissive="#b06000" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// ── GROUND ────────────────────────────────────────────────────────────────────
const Ground: React.FC<{ golden?: boolean }> = ({ golden }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
    <planeGeometry args={[80, 80]} />
    <meshStandardMaterial color={golden ? "#c8a44a" : "#8bbd5e"} roughness={0.9} />
  </mesh>
);

// ── 3D SCENE CONTENT ──────────────────────────────────────────────────────────
const HouseContent: React.FC<{ gltf: GLTF; t: number; frame: number; shot: ReturnType<typeof getShot> }> = ({ gltf, t, frame, shot }) => {
  const isReveal = t >= CUT.S5 && t < CUT.S6;
  const isOutro = t >= CUT.S6;
  const isMechanism = t >= CUT.S4 && t < CUT.S5;

  return (
    <>
      <fog attach="fog" args={[isOutro ? "#e8c880" : "#dce8f0", 40, 160]} />
      <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
      <Ground golden={isOutro} />
      <WireNetwork visible={isMechanism} />
      <ConcreteColumns t={t} visible={isReveal} />
      <ambientLight intensity={isOutro ? 0.5 : 0.35} color={isOutro ? "#ffd580" : "#ffffff"} />
      <directionalLight
        position={[SUN[0] * 60, SUN[1] * 60, SUN[2] * 60]}
        intensity={isOutro ? 3.0 : 2.2}
        color={isOutro ? "#ffb347" : "#ffffff"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <Post shot={shot} frame={frame} aoRadius={0.4} />
    </>
  );
};

// ── STAGE LABELS ──────────────────────────────────────────────────────────────
const STAGES = [
  { n: "01", label: "HOOK", from: CUT.S1, to: CUT.S2 },
  { n: "02", label: "TAMPAK LUAR", from: CUT.S2, to: CUT.S3 },
  { n: "03", label: "DI BALIK DINDING", from: CUT.S3, to: CUT.S4 },
  { n: "04", label: "JARINGAN TERSEMBUNYI", from: CUT.S4, to: CUT.S5 },
  { n: "05", label: "STRUKTUR UTAMA", from: CUT.S5, to: CUT.S6 },
  { n: "06", label: "BONGKAR RAHASIA RUMAH", from: CUT.S6, to: CUT.END },
];

// ── HUD CALLOUT TIMING (frame-based at 60fps) ─────────────────────────────────
// S3 layer cards: 12s, 15s, 18s
// S4 kabel: 36s, pipa: 48s
// S5 kolom: 63s, dimensi: 69s
function hudStartFrame(timeSec: number, fps: number) { return Math.round(timeSec * fps); }

// ── MAIN COMPOSITION ──────────────────────────────────────────────────────────
export const EP32_BongkarRumah: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const [gltf, setGltf] = useState<GLTF | null>(null);
  const handle = useMemo(() => delayRender("Loading house GLB EP32"), []);

  useEffect(() => {
    new GLTFLoader().loadAsync(HOUSE_GLB)
      .then((loaded) => { setGltf(loaded); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle]);

  const shot = getShot(t, fps, frame);
  const stages = STAGES.map((s) => ({ ...s, from: Math.round(s.from * fps), to: Math.round(s.to * fps) }));

  return (
    <AbsoluteFill>
      {/* 3D scene */}
      <FilmScene
        frame={frame}
        shot={shot}
        background={t >= CUT.S6 ? "#f0deb0" : "#e8eef0"}
        post={false}
        hdri="sky"
        envIntensity={0.55}
        near={0.4}
        far={2500}
        overlay={() => (
          <StageLabel
            stages={stages}
            frame={frame}
            fps={fps}
            font={FONT}
            ink="#22292c"
            soft="#56636a"
            accent="#0e7a67"
            kicker="BONGKAR TOPIK · EP32"
          />
        )}
      >
        {gltf && <HouseContent gltf={gltf} t={t} frame={frame} shot={shot} />}
      </FilmScene>

      {/* VO */}
      <Voiceover src="audio/vo.wav" offset={0} />

      {/* Subtitle karaoke */}
      <Subtitle words={voWords} frame={frame} fps={fps} offset={0} position="bottom" />

      {/* S3 Peel — layer cards */}
      <DataCallout value="2 mm" label="Cat" sublabel="lapisan terluar yang terlihat" startFrame={hudStartFrame(13, fps)} top={500} left={60} />
      <DataCallout value="2 cm" label="Plester" sublabel="perekat + penghalus dinding" startFrame={hudStartFrame(16, fps)} top={650} left={60} />
      <DataCallout value="10 cm" label="Bata Merah" sublabel="+ ruang udara mati" startFrame={hudStartFrame(19, fps)} top={800} left={60} />

      {/* S4 Mechanism — jaringan tersembunyi (30s and 41s cover scene midpoint ~43s) */}
      <DataCallout value="300 m+" label="Kabel Listrik" sublabel="tersembunyi di dinding rumah tipe-36" startFrame={hudStartFrame(30, fps)} top={520} left={60} accentColor="#e8b400" />
      <DataCallout value="50 m" label="Pipa Air" sublabel="sistem PDAM dalam rumah" startFrame={hudStartFrame(41, fps)} top={520} left={60} accentColor="#2980b9" />

      {/* S5 Revelation — struktur utama (61s and 68s cover scene midpoint ~69s) */}
      <DataCallout value="8–12" label="Kolom Beton" sublabel="tersembunyi di balik dinding" startFrame={hudStartFrame(61, fps)} top={500} left={60} accentColor="#e8a020" />
      <DataCallout value="30×30 cm" label="Dimensi Kolom" sublabel="diperkuat baja tulangan" startFrame={hudStartFrame(68, fps)} top={650} left={60} accentColor="#e8a020" />
    </AbsoluteFill>
  );
};

export const EP32_SECONDS = CUT.END;
