// EP06 cover — "BIKIN LAGU PAKAI AI" in RETROWAVE: a synthwave stage on the neon horizon grid.
// A retro chat prompt ("lagu lo-fi santai, piano") floats above the stage and sends neon
// waveforms forward; notes and lyric cards form out of the waves. Striped sun and wireframe
// mountains behind, a glossy synth keyboard and an AUDIRA cassette in the foreground.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { loadFont as loadVT } from "@remotion/google-fonts/VT323";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette.ts";
import { cassetteTexture, lyricTexture, neonSignTexture, promptTexture, sunTexture } from "./textures.ts";

const kanit = loadKanit("italic", { weights: ["800", "900"], subsets: ["latin"] });
const vt = loadVT("normal", { weights: ["400"], subsets: ["latin"] });

export const BG = "#0C081A";
export const FOG = "#1a0a33";

/* ---------------- background: sky, sun, mountains, grid ---------------- */

export const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const r = prng(606);
    const pts: number[] = [];
    for (let i = 0; i < 420; i++) pts.push((r() - 0.5) * 90, 3 + r() * 40, -45 - r() * 8);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#F4E8FF" size={0.09} sizeAttenuation fog={false} toneMapped={false} />
    </points>
  );
};

export const Sun: React.FC<{ tex: THREE.Texture }> = ({ tex }) => (
  <group position={[0, 5.2, -44]}>
    <mesh position={[0, 0, -1]}>
      <circleGeometry args={[15, 64]} />
      <meshBasicMaterial color="#ff2f8a" transparent opacity={0.16} fog={false} toneMapped={false} />
    </mesh>
    <mesh>
      <planeGeometry args={[18, 18]} />
      <meshBasicMaterial map={tex} transparent fog={false} toneMapped={false} />
    </mesh>
  </group>
);

export const Mountains: React.FC = () => {
  const items = useMemo(() => {
    const r = prng(61);
    return [
      [-13, -36, 6.5, 7], [-7.5, -38, 4.5, 6], [-18, -34, 5, 8], [9, -36, 5.5, 7], [14.5, -38, 7, 9], [19, -34, 4.2, 6],
      [-4.2, -40, 2.4, 4], [5.2, -40, 2.8, 4.5],
    ].map(([x, z, h, rad]) => ({ x, z, h, rad, rot: r() * Math.PI }));
  }, []);
  return (
    <>
      {items.map((m, i) => (
        <group key={i} position={[m.x, m.h / 2 - 0.02, m.z]} rotation={[0, m.rot, 0]}>
          <mesh>
            <coneGeometry args={[m.rad, m.h, 6, 3]} />
            <meshBasicMaterial color="#1b0838" />
          </mesh>
          <mesh scale={1.003}>
            <coneGeometry args={[m.rad, m.h, 6, 3]} />
            <meshBasicMaterial color={i % 2 ? P.neonMagenta : "#b44dff"} wireframe toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export const Grid: React.FC<{ f: number }> = ({ f }) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const W = 60;
    for (let x = -W; x <= W; x += 1) pts.push(x, 0, 12, x, 0, -46);
    for (let z = -46; z <= 12; z += 1) pts.push(-W, 0, z, W, 0, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const slide = (f * 0.02) % 1;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -16]}>
        <planeGeometry args={[140, 70]} />
        <meshStandardMaterial color="#08041a" roughness={0.55} metalness={0.2} />
      </mesh>
      <lineSegments geometry={geo} position={[0, 0.002, slide]}>
        <lineBasicMaterial color="#ff2fd0" toneMapped={false} />
      </lineSegments>
      {/* horizon glow */}
      <mesh position={[0, 0.6, -40]}>
        <planeGeometry args={[140, 2.4]} />
        <meshBasicMaterial color="#ff3d9a" transparent opacity={0.35} fog={false} toneMapped={false} />
      </mesh>
    </>
  );
};

/* ---------------- stage ---------------- */

const Speaker: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0.3, -2.4]} rotation={[0, -Math.sign(x) * 0.28, 0]}>
    {[0, 1].map((k) => (
      <group key={k} position={[0, 0.42 + k * 0.84, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[0.78, 0.82, 0.6]} radius={0.05} />
          <meshPhysicalMaterial color="#120a24" roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.15} />
        </mesh>
        <mesh position={[0, -0.04, 0.305]}>
          <circleGeometry args={[0.27, 48]} />
          <meshPhysicalMaterial color="#1d1433" roughness={0.75} sheen={0.6} sheenColor="#ff5fb0" />
        </mesh>
        <mesh position={[0, -0.04, 0.31]}>
          <torusGeometry args={[0.28, 0.018, 12, 64]} />
          <meshBasicMaterial color={k ? P.synthCyan : P.neonMagenta} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.04, 0.33]}>
          <sphereGeometry args={[0.08, 24, 16]} />
          <meshStandardMaterial color="#d8dde8" metalness={1} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.33, 0.305]}>
          <circleGeometry args={[0.06, 24]} />
          <meshStandardMaterial color="#d8dde8" metalness={1} roughness={0.2} />
        </mesh>
      </group>
    ))}
  </group>
);

export const Stage: React.FC<{ sign: THREE.Texture }> = ({ sign }) => (
  <group position={[0, 0, -1.7]}>
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[2.4, 2.5, 0.3, 96]} />
      <meshPhysicalMaterial color="#160b2e" roughness={0.22} metalness={0.6} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
    <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.38, 0.025, 12, 160]} />
      <meshBasicMaterial color={P.neonMagenta} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.52, 0.03, 12, 160]} />
      <meshBasicMaterial color={P.synthCyan} toneMapped={false} />
    </mesh>
    {/* inner light ring on the deck */}
    <mesh position={[0, 0.305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.05, 96]} />
      <meshBasicMaterial color="#b44dff" transparent opacity={0.7} toneMapped={false} />
    </mesh>
    {/* AUDIRA neon plate on the stage front */}
    <group position={[0, 0.49, 1.95]} rotation={[-0.08, 0, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <RoundedBoxGeo args={[1.18, 0.33, 0.05]} radius={0.02} />
        <meshStandardMaterial color="#d8dde8" metalness={1} roughness={0.2} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.12, 0.28]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
    <Speaker x={-1.85} />
    <Speaker x={1.85} />
  </group>
);

/* ---------------- hero: prompt window + waves + notes + lyrics ---------------- */

export const PromptWindow: React.FC<{ tex: THREE.Texture; f: number }> = ({ tex, f }) => {
  const W = 2.86;
  const H = W * (440 / 1400);
  const bob = Math.sin(f / 40) * 0.03;
  return (
    <group position={[0, 2.12 + bob, -0.7]} rotation={[0.04, 0, 0]}>
      {/* chrome bezel */}
      <mesh position={[0, 0, -0.06]} castShadow>
        <RoundedBoxGeo args={[W + 0.12, H + 0.12, 0.1]} radius={0.06} />
        <meshStandardMaterial color="#cfd6e6" metalness={1} roughness={0.14} />
      </mesh>
      <mesh>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} toneMapped={false} transparent />
      </mesh>
      {/* neon outline */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[W + 0.2, H + 0.2]} />
        <meshBasicMaterial color={P.neonMagenta} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.2, 0.6]} color="#ff4fb8" intensity={6} distance={4} decay={2} />
    </group>
  );
};

const Wave: React.FC<{ z: number; y: number; amp: number; width: number; color: string; phase: number; r: number }> = ({ z, y, amp, width, color, phase, r }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const N = 220;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = (u - 0.5) * width;
      const env = Math.pow(Math.sin(Math.PI * u), 1.6);
      const s = Math.sin(u * 46 + phase) * 0.6 + Math.sin(u * 19 + phase * 1.7) * 0.4;
      pts.push(new THREE.Vector3(x, s * amp * env, Math.sin(u * Math.PI) * 0.25));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, r, 8, false);
  }, [amp, width, phase, r]);
  return (
    <mesh geometry={geo} position={[0, y, z]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const noteShape = (double: boolean) => {
  const s = new THREE.Shape();
  // head (tilted ellipse approximated)
  s.absellipse(0, 0, 0.16, 0.11, 0, Math.PI * 2, false, 0.35);
  const stem = new THREE.Shape();
  stem.moveTo(0.12, 0.02);
  stem.lineTo(0.165, 0.02);
  stem.lineTo(0.165, 0.62);
  if (double) {
    stem.lineTo(0.62, 0.74);
    stem.lineTo(0.62, 0.14);
    stem.lineTo(0.575, 0.14);
    stem.lineTo(0.575, 0.6);
    stem.lineTo(0.165, 0.5);
    stem.lineTo(0.165, 0.62);
  } else {
    stem.bezierCurveTo(0.24, 0.48, 0.42, 0.42, 0.36, 0.2);
    stem.bezierCurveTo(0.34, 0.36, 0.22, 0.44, 0.12, 0.48);
  }
  stem.lineTo(0.12, 0.02);
  const shapes = [s, stem];
  if (double) {
    const h2 = new THREE.Shape();
    h2.absellipse(0.455, 0.12, 0.16, 0.11, 0, Math.PI * 2, false, 0.35);
    shapes.push(h2);
  }
  return shapes;
};

export const Note: React.FC<{ p: [number, number, number]; rot: number; scale: number; double?: boolean; color: string; f: number; seed: number }> = ({ p, rot, scale, double = false, color, f, seed }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(noteShape(double), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 3, curveSegments: 24 });
    g.center();
    return g;
  }, [double]);
  const yb = Math.sin(f / 30 + seed) * 0.05;
  return (
    <mesh geometry={geo} position={[p[0], p[1] + yb, p[2]]} rotation={[0.1, -rot * 0.6, rot]} scale={scale} castShadow>
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.5} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
    </mesh>
  );
};

export const LyricCard: React.FC<{ tex: THREE.Texture; p: [number, number, number]; ry: number; rz: number; w: number; f: number; seed: number }> = ({ tex, p, ry, rz, w, f, seed }) => (
  <group position={[p[0], p[1] + Math.sin(f / 34 + seed) * 0.04, p[2]]} rotation={[0, ry, rz]}>
    <mesh>
      <planeGeometry args={[w, w * 0.625]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/* ---------------- foreground: synth keyboard + cassette ---------------- */

export const Keyboard: React.FC = () => {
  const whites = 18;
  const kw = 0.105;
  const blackIdx = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15];
  const L = whites * kw + 0.24;
  return (
    <group position={[-0.62, 0.22, 4.7]} rotation={[0.5, 0.5, 0.05]} scale={0.78}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[L, 0.1, 0.62]} radius={0.035} />
        <meshPhysicalMaterial color="#0d0a14" roughness={0.16} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* neon edge */}
      <mesh position={[0, -0.03, 0.312]}>
        <boxGeometry args={[L - 0.04, 0.012, 0.004]} />
        <meshBasicMaterial color={P.synthCyan} toneMapped={false} />
      </mesh>
      {/* control strip: knobs + mini display */}
      <mesh position={[-L / 2 + 0.36, 0.052, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshBasicMaterial color={P.phosphorGreen} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-L / 2 + 0.75 + i * 0.13, 0.075, -0.2]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.05, 24]} />
          <meshStandardMaterial color={i % 3 === 0 ? P.neonMagenta : "#d8dde8"} metalness={i % 3 === 0 ? 0.2 : 1} roughness={0.2} emissive={i % 3 === 0 ? P.neonMagenta : "#000"} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* keys */}
      {Array.from({ length: whites }, (_, i) => (
        <mesh key={`w${i}`} position={[-L / 2 + 0.12 + kw / 2 + i * kw, 0.06, 0.1]} castShadow receiveShadow>
          <RoundedBoxGeo args={[kw - 0.008, 0.04, 0.36]} radius={0.008} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4f1ff" />
        </mesh>
      ))}
      {blackIdx.map((i) => (
        <mesh key={`b${i}`} position={[-L / 2 + 0.12 + (i + 1) * kw, 0.09, 0.02]} castShadow>
          <RoundedBoxGeo args={[kw * 0.55, 0.04, 0.22]} radius={0.008} />
          <meshPhysicalMaterial {...POLISH.brickABS} color="#17121f" />
        </mesh>
      ))}
    </group>
  );
};

export const Cassette: React.FC<{ label: THREE.Texture }> = ({ label }) => (
  <group position={[0.6, 0.58, 4.8]} rotation={[0.5, -0.45, -0.24]} scale={0.85}>
    <mesh castShadow>
      <RoundedBoxGeo args={[0.66, 0.42, 0.07]} radius={0.025} />
      <meshPhysicalMaterial color="#2b1a4a" roughness={0.12} transmission={0.25} thickness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
    </mesh>
    <mesh position={[0, 0.02, 0.0365]}>
      <planeGeometry args={[0.58, 0.3625]} />
      <meshStandardMaterial map={label} roughness={0.6} />
    </mesh>
    {[-0.12, 0.12].map((x) => (
      <mesh key={x} position={[x, -0.015, 0.04]}>
        <torusGeometry args={[0.04, 0.012, 8, 24]} />
        <meshStandardMaterial color="#e8e8ee" metalness={0.6} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

/* ---------------- scene ---------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = useMemo(
    () => ({
      sun: sunTexture(),
      prompt: promptTexture("lagu lo-f\u200Ci santai, piano"),
      lyA: lyricTexture("LIRIK", 1),
      lyB: lyricTexture("REFF", 2),
      sign: neonSignTexture(),
      tape: cassetteTexture(),
    }),
    [],
  );
  const ph = f / 9;
  return (
    <>
      <fog attach="fog" args={[FOG, 14, 46]} />
      <ambientLight intensity={0.25} color="#8a6cff" />
      <directionalLight position={[0, 3, -10]} intensity={0.9} color="#ff7a3d" />
      <pointLight position={[-3, 2.5, 3]} intensity={18} color={P.neonMagenta} distance={12} decay={2} />
      <pointLight position={[3, 2.2, 3.2]} intensity={16} color={P.synthCyan} distance={12} decay={2} />
      <spotLight position={[0, 6, 6]} angle={0.5} penumbra={0.8} intensity={14} color="#ffe2f2" castShadow target-position={[0, 1.2, 0]} />

      <Stars />
      <Sun tex={t.sun} />
      <Mountains />
      <Grid f={f} />
      <Stage sign={t.sign} />

      <PromptWindow tex={t.prompt} f={f} />

      {/* waveforms travelling forward from the prompt */}
      <Wave z={-0.35} y={1.42} amp={0.22} width={2.7} color={P.synthCyan} phase={ph} r={0.016} />
      <Wave z={0.45} y={1.3} amp={0.3} width={3.1} color={P.neonMagenta} phase={ph + 1.3} r={0.02} />
      <Wave z={1.35} y={1.18} amp={0.36} width={3.5} color="#FFB84D" phase={ph + 2.4} r={0.024} />
      <Wave z={1.35} y={1.18} amp={0.36} width={3.5} color={P.synthCyan} phase={ph + 2.9} r={0.01} />

      {/* notes and lyric cards forming out of the waves */}
      <Note p={[1.05, 1.62, 0.9]} rot={-0.25} scale={0.62} double color={P.neonMagenta} f={f} seed={1} />
      <Note p={[-1.15, 1.55, 1.1]} rot={0.3} scale={0.55} color={P.synthCyan} f={f} seed={2} />
      <Note p={[0.55, 0.88, 1.9]} rot={-0.15} scale={0.42} color="#FF9E00" f={f} seed={3} />
      <Note p={[-0.42, 0.98, 2.3]} rot={0.22} scale={0.36} double color="#ff5fd0" f={f} seed={4} />
      <Note p={[1.35, 2.75, -0.2]} rot={-0.3} scale={0.45} color={P.synthCyan} f={f} seed={5} />
      <LyricCard tex={t.lyA} p={[-0.98, 0.78, 1.5]} ry={0.42} rz={0.06} w={0.8} f={f} seed={1} />
      <LyricCard tex={t.lyB} p={[1.0, 0.72, 1.4]} ry={-0.42} rz={-0.05} w={0.76} f={f} seed={2} />

      <Keyboard />
      <Cassette label={t.tape} />
    </>
  );
};

export const Ep06Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP06 fonts"));
  useEffect(() => {
    Promise.all([kanit.waitUntilDone(), vt.waitUntilDone(), document.fonts.load("italic 900 40px 'Kanit'"), document.fonts.load("40px 'VTThreeTwoThree'")])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ position: [0, 1.25, 8], fov: 42, near: 0.1, far: 120 }}
          onCreated={({ camera }) => camera.lookAt(0, 1.85, 0)}
        >
          <Scene f={f} />
          <Finish frame={frame} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao={false} hdri="studio" />
        </ThreeCanvas>
      )}
      {/* legibility gradient behind the headline */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,8,26,0.9) 0%, rgba(12,8,26,0.62) 24%, rgba(12,8,26,0) 38%)" }} />
      {/* CRT scanlines */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 2px, transparent 2px, transparent 5px)", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 72, right: 60, top: 262 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'VTThreeTwoThree'", fontSize: 50, letterSpacing: 6, color: P.synthCyan, textShadow: "0 0 14px rgba(0,246,255,0.8)" }}>
          <span style={{ width: 20, height: 20, background: P.neonMagenta, boxShadow: "0 0 14px #FF007F", display: "inline-block" }} />
          AUDIRA AI TUTORIAL
        </div>
        <div style={{ fontFamily: "'Kanit'", fontStyle: "italic", fontWeight: 900, fontSize: 150, lineHeight: 0.98, marginTop: 10, letterSpacing: -1 }}>
          <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #DCE6FF 46%, #6A4CFF 50%, #FF7AD9 78%, #FFE3F4 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 18px rgba(255,0,127,0.75)) drop-shadow(0 6px 0 #3a0a5c)" }}>
            BIKIN LAGU
          </div>
          <div style={{ color: P.neonMagenta, textShadow: "0 0 28px rgba(255,0,127,0.9), 0 6px 0 #3a0a5c" }}>
            PAKAI <span style={{ color: P.sunsetAmber, textShadow: "0 0 28px rgba(255,158,0,0.9), 0 6px 0 #5c2a0a" }}>AI</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
