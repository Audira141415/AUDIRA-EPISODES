// EP06 film world: the cover's synthwave stage (Cover.tsx parts) brought to life on the VO clock.
// Waves swell when music is "made", notes and lyric cards pop in on their spoken words,
// a scanner sweep reveals the digital watermark, and the camera rides camera.ts.
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RETROWAVE_PALETTE as P } from "../../kits/retrowave/lib/palette.ts";
import { Cassette, FOG, Grid, Keyboard, LyricCard, Mountains, Note, PromptWindow, Stage, Stars, Sun } from "./Cover.tsx";
import { cassetteTexture, lyricTexture, neonSignTexture, promptTexture, sunTexture } from "./textures.ts";
import { camAt } from "./camera.ts";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const outBack = (x: number, s = 1.7) => {
  const c = s + 1;
  return x <= 0 ? 0 : 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const k = camAt(t);
    c.position.set(...k.pos);
    c.lookAt(...k.target);
    c.fov = k.fov;
    c.near = 0.1;
    c.far = 120;
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
  }, [camera, t]);
  return null;
};

/** Neon waveform tube; geometry rebuilt per frame (phase/amp), previous one disposed. */
const FilmWave: React.FC<{ z: number; y: number; amp: number; width: number; color: string; phase: number; r: number }> = ({ z, y, amp, width, color, phase, r }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const N = 160;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = (u - 0.5) * width;
      const env = Math.pow(Math.sin(Math.PI * u), 1.6);
      const s = Math.sin(u * 46 + phase) * 0.6 + Math.sin(u * 19 + phase * 1.7) * 0.4;
      pts.push(new THREE.Vector3(x, s * Math.max(0.002, amp) * env, Math.sin(u * Math.PI) * 0.25));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 360, r, 8, false);
  }, [amp, width, phase, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[0, y, z]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

/** Watermark: tiny cyan "AI" ticks riding the front wave, revealed by a scanner plane. */
const Watermark: React.FC<{ t: number }> = ({ t }) => {
  const on = ramp(t, 75.3, 76.0) * (1 - ramp(t, 78.9, 79.2));
  const sweep = ramp(t, 75.3, 77.6);
  if (on <= 0) return null;
  const xs = Array.from({ length: 13 }, (_, i) => -1.6 + i * (3.2 / 12));
  const sx = -1.9 + sweep * 3.8;
  return (
    <group position={[0, 1.18, 1.62]}>
      {/* scanner plane */}
      <mesh position={[sx, 0.2, 0]}>
        <planeGeometry args={[0.05, 0.9]} />
        <meshBasicMaterial color={P.phosphorGreen} transparent opacity={0.85 * on} toneMapped={false} />
      </mesh>
      <mesh position={[sx - 0.2, 0.2, -0.01]}>
        <planeGeometry args={[0.4, 0.9]} />
        <meshBasicMaterial color={P.phosphorGreen} transparent opacity={0.05 * on} toneMapped={false} />
      </mesh>
      {xs.map((x, i) =>
        x < sx ? (
          <mesh key={i} position={[x, 0.42 + (i % 2) * 0.08, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshBasicMaterial color={P.phosphorGreen} transparent opacity={on} toneMapped={false} />
          </mesh>
        ) : null,
      )}
    </group>
  );
};

const Pop: React.FC<{ at: number; t: number; p: [number, number, number]; children: React.ReactNode }> = ({ at, t, p, children }) => {
  const s = outBack(ramp(t, at, at + 0.45));
  if (s <= 0.001) return null;
  return (
    <group position={p} scale={s}>
      {children}
    </group>
  );
};

export const WorldScene: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tex = useMemo(
    () => ({
      sun: sunTexture(),
      prompt: promptTexture("lagu lo-f‌i santai, piano"),
      lyA: lyricTexture("LIRIK", 1),
      lyB: lyricTexture("REFF", 2),
      sign: neonSignTexture(),
      tape: cassetteTexture(),
    }),
    [],
  );
  const ph = f / 9;
  // wave energy: alive from frame 0 (hook), dips while Lyria "listens" to the description, swells on "musik"
  const amp = 0.75 + 0.25 * Math.sin(t * 1.3) - 0.35 * ramp(t, 16.6, 17.6) * (1 - ramp(t, 18.6, 19.4)) + 0.25 * ramp(t, 15.5, 16.0) * (1 - ramp(t, 16.6, 17.2));
  // Lyria build (konteks): notes on "musik", lyric cards on "liriknya"; everything present from the hook too
  const hookNotes = 0.15;
  const noteAt = (i: number) => (t < 12.5 ? hookNotes + i * 0.35 : 15.55 + i * 0.12);
  const lyricAt = (i: number) => (t < 12.5 ? 2.8 + i * 0.3 : 16.28 + i * 0.15);
  return (
    <>
      <CameraRig t={t} />
      <fog attach="fog" args={[FOG, 14, 46]} />
      <ambientLight intensity={0.25} color="#8a6cff" />
      <directionalLight position={[0, 3, -10]} intensity={0.9} color="#ff7a3d" />
      <pointLight position={[-3, 2.5, 3]} intensity={18} color={P.neonMagenta} distance={12} decay={2} />
      <pointLight position={[3, 2.2, 3.2]} intensity={16} color={P.synthCyan} distance={12} decay={2} />
      <spotLight position={[0, 6, 6]} angle={0.5} penumbra={0.8} intensity={14} color="#ffe2f2" castShadow target-position={[0, 1.2, 0]} />

      <Stars />
      <Sun tex={tex.sun} />
      <Mountains />
      <Grid f={f} />
      <Stage sign={tex.sign} />
      <PromptWindow tex={tex.prompt} f={f} />

      <FilmWave z={-0.35} y={1.42} amp={0.22 * amp} width={2.7} color={P.synthCyan} phase={ph} r={0.016} />
      <FilmWave z={0.45} y={1.3} amp={0.3 * amp} width={3.1} color={P.neonMagenta} phase={ph + 1.3} r={0.02} />
      <FilmWave z={1.35} y={1.18} amp={0.36 * amp} width={3.5} color="#FFB84D" phase={ph + 2.4} r={0.024} />
      <FilmWave z={1.35} y={1.18} amp={0.36 * amp} width={3.5} color={P.synthCyan} phase={ph + 2.9} r={0.01} />
      <Watermark t={t} />

      <Pop at={noteAt(0)} t={t} p={[1.05, 1.62, 0.9]}>
        <Note p={[0, 0, 0]} rot={-0.25} scale={0.62} double color={P.neonMagenta} f={f} seed={1} />
      </Pop>
      <Pop at={noteAt(1)} t={t} p={[-1.15, 1.55, 1.1]}>
        <Note p={[0, 0, 0]} rot={0.3} scale={0.55} color={P.synthCyan} f={f} seed={2} />
      </Pop>
      <Pop at={noteAt(2)} t={t} p={[0.55, 0.88, 1.9]}>
        <Note p={[0, 0, 0]} rot={-0.15} scale={0.42} color="#FF9E00" f={f} seed={3} />
      </Pop>
      <Pop at={noteAt(3)} t={t} p={[-0.42, 0.98, 2.3]}>
        <Note p={[0, 0, 0]} rot={0.22} scale={0.36} double color="#ff5fd0" f={f} seed={4} />
      </Pop>
      <Pop at={noteAt(4)} t={t} p={[1.35, 2.75, -0.2]}>
        <Note p={[0, 0, 0]} rot={-0.3} scale={0.45} color={P.synthCyan} f={f} seed={5} />
      </Pop>
      <Pop at={lyricAt(0)} t={t} p={[-0.98, 0.78, 1.5]}>
        <LyricCard tex={tex.lyA} p={[0, 0, 0]} ry={0.42} rz={0.06} w={0.8} f={f} seed={1} />
      </Pop>
      <Pop at={lyricAt(1)} t={t} p={[1.0, 0.72, 1.4]}>
        <LyricCard tex={tex.lyB} p={[0, 0, 0]} ry={-0.42} rz={-0.05} w={0.76} f={f} seed={2} />
      </Pop>

      <Keyboard />
      <Cassette label={tex.tape} />
    </>
  );
};
