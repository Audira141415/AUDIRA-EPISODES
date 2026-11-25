// EP03 film world: the cover's antique desk (brass photo frame, copper reel, gears, manuscript),
// driven by the VO clock. Grandpa and grandma stand frozen inside the old photo, come alive, and
// step out onto the desk leaving an onion-skin trail and engraved speed streaks.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ToyPerson, PoseName } from "../../core/polish/Person.tsx";
import { Desk, PhotoFrame, FrameTrail, Gear, Reel, FilmStrip, Inkwell, darkBrass } from "./Cover.tsx";

type V3 = [number, number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------------------------------------------------------- camera shots (VO seconds)
type Shot = { a: number; b: number; p0: V3; p1: V3; l0: V3; l1: V3; fov?: number; ease?: (x: number) => number };
const easeIn = (x: number) => x * x * x;
export const SHOTS: Shot[] = [
  // hook: the old photo, grandparents frozen, slow push in
  { a: 0, b: 4.25, p0: [0.2, 0.86, 2.45], p1: [0.14, 0.8, 1.95], l0: [0.14, 0.42, 0], l1: [0.12, 0.4, 0] },
  // pull back + crane: desk revealed, AUDIRA plaque, grandpa walks out
  { a: 4.25, b: 9.0, p0: [0.75, 0.95, 2.7], p1: [-0.25, 2.05, 6.2], l0: [-0.2, 0.4, 0.2], l1: [-0.55, 0.45, 0.3] },
  // context 1: copper reel + film strip
  { a: 9.0, b: 13.9, p0: [2.9, 1.25, 2.6], p1: [2.35, 0.9, 1.85], l0: [0.95, 0.75, 0.2], l1: [0.8, 0.6, 0.5] },
  // context 2: crane over the desk
  { a: 13.9, b: 20.72, p0: [-0.6, 3.4, 4.6], p1: [0.2, 2.9, 3.8], l0: [0.1, 0.7, 0.2], l1: [0.15, 0.7, 0.2] },
  // zoom-through into the photograph
  { a: 20.72, b: 21.6, p0: [0.12, 1.25, 3.2], p1: [0.12, 1.15, 0.3], l0: [0.12, 1.15, 0], l1: [0.12, 1.15, -0.05], ease: easeIn },
  // behind the interface panel: slow orbit
  { a: 21.6, b: 56.0, p0: [-1.8, 2.4, 5.4], p1: [1.8, 2.2, 5.2], l0: [0.1, 0.9, 0], l1: [0.1, 0.9, 0] },
  // payoff: grandma waves, camera eases in, warm afternoon light
  { a: 56.0, b: 59.0, p0: [0.55, 0.66, 1.75], p1: [0.42, 0.58, 1.2], l0: [0.36, 0.44, 0.06], l1: [0.36, 0.42, 0.06] },
  // rules: grandma steps out toward grandpa (profile to camera)
  { a: 59.0, b: 67.0, p0: [2.9, 1.15, 3.3], p1: [2.2, 1.35, 4.0], l0: [-0.2, 0.62, 0.4], l1: [-0.3, 0.62, 0.45] },
  { a: 67.0, b: 76.75, p0: [-2.9, 1.3, 3.8], p1: [-1.7, 1.15, 4.3], l0: [-0.3, 0.6, 0.5], l1: [-0.35, 0.58, 0.5] },
  // outro: crane up over the pair waving beside the frame
  { a: 76.75, b: 85.3, p0: [-0.4, 0.8, 3.1], p1: [-0.1, 2.0, 5.6], l0: [-0.45, 0.6, 0.6], l1: [-0.25, 0.7, 0.4] },
  // "Ini AUDIRA": the plaque
  { a: 85.3, b: 91, p0: [0.32, 0.3, 1.2], p1: [0.16, 0.24, 0.92], l0: [0.12, 0.12, 0.18], l1: [0.12, 0.1, 0.18] },
];

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
    const k = (s.ease ?? sine)((t - s.a) / (s.b - s.a));
    const p = lerp3(s.p0, s.p1, k);
    const l = lerp3(s.l0, s.l1, k);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = s.fov ?? 36;
    cam.position.set(...p);
    cam.lookAt(...l);
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ---------------------------------------------------------------- characters
const KAKEK_LOOK = { skin: "#d6ad86", hair: "#cfc3ad", top: "#5e4128", bottom: "#33241a", hairStyle: 0 as const, build: 1.06, height: 1 };
const NENEK_LOOK = { skin: "#dcb592", hair: "#e3d8c4", top: "#8a5636", bottom: "#4a3020", hairStyle: 1 as const, build: 0.96, height: 0.94 };

type State = { pos: V3; heading: number; scale: number; pose: PoseName; f: number; moving: boolean; dir: V3 };

const K0: V3 = [-0.14, 0.2, 0.06], K1: V3 = [-1.25, 0, 0.42];
const N0: V3 = [0.38, 0.2, 0.06], N2: V3 = [-0.62, 0, 0.92];

/** Walk from a (on the plinth, photo scale) to b (on the desk, full scale) between t0..t1. */
const walk = (t: number, t0: number, t1: number, a: V3, b: V3, s0: number, s1: number) => {
  const u = sine((t - t0) / (t1 - t0));
  const x = lerp(a[0], b[0], u), z = lerp(a[2], b[2], u);
  // step down off the plinth between 25 % and 42 % of the way
  const drop = sine((u - 0.25) / 0.17);
  const y = lerp(a[1], b[1], drop) + Math.sin(Math.PI * clamp01((u - 0.22) / 0.23)) * 0.06;
  const dir: V3 = [b[0] - a[0], 0, b[2] - a[2]];
  return { pos: [x, y, z] as V3, heading: Math.atan2(dir[0], dir[2]), scale: lerp(s0, s1, sine(u / 0.55)), dir };
};

export const kakekAt = (t: number): State => {
  const f = t * 60;
  if (t < 3.3) return { pos: K0, heading: 0.1, scale: 0.5, pose: "stand", f: 0, moving: false, dir: [0, 0, 1] };
  if (t < 8.6) {
    const w = walk(t, 3.3, 8.6, K0, K1, 0.5, 0.86);
    return { ...w, pose: "walk", f, moving: true };
  }
  const waving = (t > 59.4 && t < 66) || t > 77.3;
  return { pos: K1, heading: 0.55, scale: 0.86, pose: waving ? "wave" : "stand", f, moving: false, dir: [0, 0, 1] };
};

export const nenekAt = (t: number): State => {
  const f = t * 60;
  if (t < 3.3) return { pos: N0, heading: -0.1, scale: 0.47, pose: "stand", f: 0, moving: false, dir: [0, 0, 1] };
  if (t < 59.2) {
    const waving = t < 8.6 || (t > 55.9 && t < 59.2);
    return { pos: N0, heading: -0.1, scale: 0.47, pose: waving ? "wave" : "stand", f, moving: false, dir: [0, 0, 1] };
  }
  if (t < 66) {
    const w = walk(t, 59.2, 66, N0, N2, 0.47, 0.82);
    return { ...w, pose: "walk", f, moving: true };
  }
  return { pos: N2, heading: -0.35, scale: 0.82, pose: t > 77.3 ? "wave" : "stand", f, moving: false, dir: [0, 0, 1] };
};

/** Translucent warm-brown copy of the figure: one onion-skin frame of the motion trail. */
const Ghost: React.FC<{ st: State; seed: number; look: object; opacity: number }> = ({ st, seed, look, opacity }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (!m.userData.ghosted) {
        const c = new THREE.MeshStandardMaterial({ color: "#7a4a24", emissive: "#5a3015", emissiveIntensity: 0.35, roughness: 0.7, transparent: true, depthWrite: false });
        m.material = c;
        m.castShadow = false;
        m.userData.ghosted = true;
      }
      (m.material as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });
  return (
    <group ref={ref}>
      <ToyPerson f={st.f} seed={seed} pose={st.pose} outfit="casual" position={st.pos} heading={st.heading} scale={st.scale} shadows={false} look={look} />
    </group>
  );
};

/** Engraved ink speed streaks trailing behind a walking figure. */
const Streaks: React.FC<{ st: State; t: number }> = ({ st, t }) => {
  const d = new THREE.Vector3(...st.dir).normalize();
  const yaw = Math.atan2(d.x, d.z);
  const rows = [0.18, 0.32, 0.46, 0.6, 0.74, 0.88];
  return (
    <group position={st.pos} rotation={[0, yaw, 0]}>
      {rows.map((h, i) => {
        const len = (0.32 + ((i * 37) % 4) * 0.09) * st.scale;
        const slide = ((t * 2.2 + i * 0.37) % 1) * 0.08;
        const side = (i % 2 ? 1 : -1) * (0.05 + (i % 3) * 0.035) * st.scale;
        return (
          <mesh key={i} position={[side, h * st.scale, -0.16 * st.scale - len / 2 - slide]}>
            <boxGeometry args={[0.012, 0.012 + (i % 2) * 0.008, len]} />
            <meshBasicMaterial color="#2a1a0e" transparent opacity={0.85 - i * 0.06} />
          </mesh>
        );
      })}
    </group>
  );
};

const Figure: React.FC<{ at: (t: number) => State; t: number; seed: number; look: object }> = ({ at, t, seed, look }) => {
  const st = at(t);
  return (
    <>
      <ToyPerson f={st.f} seed={seed} pose={st.pose} outfit="casual" position={st.pos} heading={st.heading} scale={st.scale} look={look} />
      {st.moving &&
        [0.32, 0.64, 0.96].map((dt, i) => {
          const g = at(t - dt);
          return g.moving || i === 0 ? <Ghost key={i} st={g} seed={seed} look={look} opacity={[0.5, 0.33, 0.18][i]} /> : null;
        })}
      {st.moving && <Streaks st={st} t={t} />}
    </>
  );
};

// ---------------------------------------------------------------- scene
export const World: React.FC<{ t: number; frame: number; preview: boolean }> = ({ t, frame, preview }) => {
  const f = t * 60;
  const spin = f * 0.01;
  // afternoon warmth for the payoff ("cahaya sore yang hangat")
  const warm = sine((t - 55.9) / 1.5) * (1 - sine((t - 59.5) / 2));
  const keyColor = useMemo(() => new THREE.Color(), []);
  keyColor.set("#ffe2b0").lerp(new THREE.Color("#ff9a4a"), warm * 0.7);
  return (
    <>
      <Rig t={t} />
      <hemisphereLight args={["#fff1d6", "#5a3a1e", 0.75]} />
      <spotLight
        position={[-3.2, 5.6, 4.2]}
        angle={0.55}
        penumbra={0.7}
        intensity={130 + warm * 40}
        color={keyColor}
        castShadow
        shadow-mapSize={preview ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        ref={(l: THREE.SpotLight | null) => {
          if (l) {
            l.target.position.set(0.1, 0.7, 0.3);
            l.target.updateMatrixWorld();
          }
        }}
      />
      <directionalLight position={[3.5, 3.2, -2.5]} intensity={1.6} color="#ffcf8a" />
      <pointLight position={[1.4, 1.2, 1.6]} intensity={2.2} distance={4} color="#ffb070" />
      {/* front fill: lifts the desk foreground and the right-hand gears out of the dark */}
      <pointLight position={[0.2, 1.6, 3.4]} intensity={7} distance={7} color="#ffe6c4" />
      <pointLight position={[1.6, 0.6, 1.9]} intensity={1.6} distance={2.2} color="#ffd9a0" />

      <Desk />
      <PhotoFrame />
      <FrameTrail />
      <Figure at={kakekAt} t={t} seed={3} look={KAKEK_LOOK} />
      <Figure at={nenekAt} t={t} seed={4} look={NENEK_LOOK} />

      <Reel position={[1.25, 0.62, -0.75]} rotY={0.86} spin={spin} />
      <FilmStrip />
      <Gear R={0.62} teeth={22} depth={0.07} position={[-1.05, 0.64, -1.05]} rotation={[0, 0.25, 0]} spin={spin * 0.6} />
      <Gear R={0.34} teeth={12} depth={0.07} position={[-0.42, 1.12, -1.25]} rotation={[0, 0.25, 0]} spin={-spin * 1.1 + 0.13} mat={darkBrass()} />
      <Gear R={0.24} teeth={12} depth={0.05} position={[1.15, 0.04, 0.95]} rotation={[-Math.PI / 2, 0, 0]} spin={spin} />
      <Gear R={0.15} teeth={9} depth={0.05} position={[0.9, 0.04, 1.22]} rotation={[-Math.PI / 2, 0, 0]} spin={-spin * 1.6} />
      <Inkwell />

      <Finish frame={frame} background="#EADBB8" profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM} exposure={0.82} envIntensity={0.45} hdri="warmStudio" />
    </>
  );
};
