// EP03 cover — "FOTO LAMA JADI VIDEO" in VINTAGEFORGE.
// An engraved sepia photo in a brass frame on an antique desk; its figure steps out of the frame,
// leaving a dashed outline behind, a trail of fading copies and engraved speed lines. A copper film
// reel spools a strip of frames across the desk, brass gears beside it, an "AUDIRA" plaque on the plinth.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { BROWN, COPPER, GOLD, INK, PARCH, TERRA, deskTex, filmTex, manuscriptTex, photoTex, plaqueTex, sheetTex } from "./textures.ts";

const FILM_FPS = 60;
const grain = () => surfaceGrain(17, 256, 0.3, 4);

// ---------------------------------------------------------------- materials (module level, cached)
let brassMat: THREE.MeshPhysicalMaterial | null = null;
export const brass = () =>
  (brassMat ??= new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 0.88, roughness: 0.34, roughnessMap: grain(), clearcoat: 0.25, clearcoatRoughness: 0.4 }));
let darkBrassMat: THREE.MeshPhysicalMaterial | null = null;
export const darkBrass = () => (darkBrassMat ??= new THREE.MeshPhysicalMaterial({ color: "#8a6a35", metalness: 0.85, roughness: 0.42, roughnessMap: grain() }));
let copperMat: THREE.MeshPhysicalMaterial | null = null;
export const copper = () => (copperMat ??= new THREE.MeshPhysicalMaterial({ color: COPPER, metalness: 0.9, roughness: 0.3, roughnessMap: grain(), clearcoat: 0.3 }));

// ---------------------------------------------------------------- camera
const Rig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 36;
    cam.position.set(-0.2, 2.75, 7.7);
    cam.lookAt(0.0, 1.36, 0);
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// ---------------------------------------------------------------- world pieces
export const Desk: React.FC = () => {
  const t = useMemo(() => {
    const tex = deskTex().clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.needsUpdate = true;
    return tex;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow>
        <planeGeometry args={[14, 9]} />
        <meshPhysicalMaterial map={t} roughness={0.55} clearcoat={0.35} clearcoatRoughness={0.5} />
      </mesh>
      {/* manuscript wall */}
      <mesh position={[0.1, 3.0, -2.6]} receiveShadow>
        <planeGeometry args={[7.2, 10.8]} />
        <meshPhysicalMaterial map={manuscriptTex()} {...POLISH.paper} />
      </mesh>
      {/* loose parchment sheet */}
      <mesh rotation={[-Math.PI / 2, 0, 0.32]} position={[0.55, 0.004, 1.0]} receiveShadow>
        <planeGeometry args={[1.3, 1.7]} />
        <meshPhysicalMaterial map={sheetTex()} {...POLISH.paper} />
      </mesh>
    </group>
  );
};

/** Brass frame with the old photograph, standing on a plinth that carries the AUDIRA plaque. */
export const PhotoFrame: React.FC = () => {
  const W = 1.5, H = 1.9, T = 0.15, D = 0.1;
  const baseY = 0.2;
  const cy = baseY + H / 2;
  return (
    <group position={[0.12, 0, -0.05]}>
      {/* plinth */}
      <mesh position={[0, baseY / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.2, baseY, 0.46]} radius={0.03} />
        <meshPhysicalMaterial color="#3f2716" roughness={0.5} clearcoat={0.5} clearcoatRoughness={0.35} map={deskTex()} />
      </mesh>
      <mesh position={[0, baseY / 2, 0.232]}>
        <planeGeometry args={[0.62, 0.14]} />
        <meshPhysicalMaterial map={plaqueTex()} metalness={0.75} roughness={0.35} />
      </mesh>
      <group position={[0, cy, 0]} rotation={[-0.09, 0, 0]}>
        <group position={[0, 0, 0]}>
          {/* outer bars */}
          {[
            [0, H / 2 - T / 2, W, T],
            [0, -H / 2 + T / 2, W, T],
            [-W / 2 + T / 2, 0, T, H],
            [W / 2 - T / 2, 0, T, H],
          ].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0]} material={brass()} castShadow receiveShadow>
              <RoundedBoxGeo args={[w, h, D]} radius={0.035} />
            </mesh>
          ))}
          {/* inner lip */}
          {[
            [0, H / 2 - T - 0.02, W - 2 * T, 0.04],
            [0, -H / 2 + T + 0.02, W - 2 * T, 0.04],
            [-W / 2 + T + 0.02, 0, 0.04, H - 2 * T],
            [W / 2 - T - 0.02, 0, 0.04, H - 2 * T],
          ].map(([x, y, w, h], i) => (
            <mesh key={`l${i}`} position={[x, y, 0.01]} material={darkBrass()}>
              <RoundedBoxGeo args={[w, h, 0.05]} radius={0.012} />
            </mesh>
          ))}
          {/* corner rosettes */}
          {[
            [-1, 1],
            [1, 1],
            [-1, -1],
            [1, -1],
          ].map(([sx, sy], i) => (
            <mesh key={`c${i}`} position={[(sx * (W - T)) / 2, (sy * (H - T)) / 2, D / 2 + 0.01]} material={brass()} castShadow>
              <sphereGeometry args={[0.065, 24, 16]} />
            </mesh>
          ))}
          {/* the photograph */}
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[W - 2 * T - 0.06, H - 2 * T - 0.06]} />
            <meshPhysicalMaterial map={photoTex()} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.25} />
          </mesh>
          {/* back panel */}
          <mesh position={[0, 0, -0.04]}>
            <boxGeometry args={[W - 0.05, H - 0.05, 0.02]} />
            <meshStandardMaterial color="#2a1a0e" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/** Copies of the figure fading behind it: the motion trail ("jejak frame"). */
const Ghost: React.FC<{ f: number; seed: number; opacity: number; position: [number, number, number]; scale: number; heading: number }> = ({
  f,
  seed,
  opacity,
  position,
  scale,
  heading,
}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.ghosted) return;
      const src = m.material as THREE.MeshPhysicalMaterial;
      const c = src.clone();
      c.color = new THREE.Color("#f2e3c2");
      c.emissive = new THREE.Color("#b5864e");
      c.emissiveIntensity = 0.45;
      c.transparent = true;
      c.opacity = opacity;
      c.depthWrite = false;
      m.material = c;
      m.castShadow = false;
      m.userData.ghosted = true;
    });
  });
  return (
    <group ref={ref}>
      <ToyPerson f={f} seed={seed} pose="walk" outfit="casual" position={position} heading={heading} scale={scale} shadows={false} look={SEPIA_LOOK} />
    </group>
  );
};

export const SEPIA_LOOK = { skin: "#d1a983", hair: "#2a1c14", top: "#6b4a2e", bottom: "#3b2818", hairStyle: 0 as const, build: 1, height: 1 };

/** Engraved speed streaks: thin ink cones trailing from the figure back toward the photo. */
const STREAKS = (() => {
  const dir = new THREE.Vector3(1.06, 0.18, -0.56).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const rows: { p: [number, number, number]; len: number; r: number }[] = [];
  const hs = [0.3, 0.42, 0.55, 0.66, 0.78, 0.9, 0.48, 0.72];
  hs.forEach((h, i) => {
    const off = 0.16 + (i % 3) * 0.05;
    const len = 0.22 + ((i * 37) % 5) * 0.05;
    rows.push({ p: [-0.62 + dir.x * (off + len / 2), h + dir.y * (off + len / 2), 0.62 + dir.z * (off + len / 2)], len, r: 0.011 + (i % 2) * 0.005 });
  });
  return { q, rows };
})();
const SpeedLines: React.FC = () => (
  <>
    {STREAKS.rows.map((s, i) => (
      <mesh key={i} position={s.p} quaternion={STREAKS.q}>
        <coneGeometry args={[s.r, s.len, 8]} />
        <meshBasicMaterial color="#2a1a0e" transparent opacity={0.8} />
      </mesh>
    ))}
  </>
);

/** Small photo frames peeling off the picture toward the figure: the frame-by-frame trail. */
export const FrameTrail: React.FC = () => (
  <>
    {(
      [
        [0.62, 1.55, 0.25, 0.22, 0.25, 0.75],
        [0.15, 1.75, 0.4, 0.28, -0.2, 0.6],
        [-0.45, 1.6, 0.55, 0.34, 0.15, 0.45],
      ] as const
    ).map(([x, y, z, s, rz, op], i) => (
      <group key={i} position={[x, y, z]} rotation={[0.1, 0.25, rz]}>
        <mesh material={brass()} castShadow>
          <RoundedBoxGeo args={[s * 1.0, s * 1.25, 0.02]} radius={0.008} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[s * 0.84, s * 1.09]} />
          <meshPhysicalMaterial map={photoTex()} roughness={0.4} transparent opacity={op} />
        </mesh>
      </group>
    ))}
  </>
);

// gear outline as an extruded shape
export const gearGeo = (R: number, teeth: number, depth: number) => {
  const s = new THREE.Shape();
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = i % 4;
    const r = k === 1 || k === 2 ? R : R * 0.85;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, R * 0.16, 0, Math.PI * 2, true);
  s.holes.push(hole);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    const p = new THREE.Path();
    p.absarc(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.16, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: R * 0.02, bevelSegments: 3, curveSegments: 24 });
  g.center();
  return g;
};

export const Gear: React.FC<{ R: number; teeth: number; depth: number; position: [number, number, number]; rotation: [number, number, number]; spin: number; mat?: THREE.Material }> = ({
  R,
  teeth,
  depth,
  position,
  rotation,
  spin,
  mat,
}) => {
  const geo = useMemo(() => gearGeo(R, teeth, depth), [R, teeth, depth]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} rotation={[0, 0, spin]} material={mat ?? brass()} castShadow receiveShadow />
    </group>
  );
};

/** Copper film reel: two pierced flanges, hub and a wound film pack. */
export const Reel: React.FC<{ position: [number, number, number]; rotY: number; spin: number }> = ({ position, rotY, spin }) => {
  const R = 0.5;
  const flange = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, R, 0, Math.PI * 2, false);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const p = new THREE.Path();
      p.absarc(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6, R * 0.2, 0, Math.PI * 2, true);
      s.holes.push(p);
    }
    const hub = new THREE.Path();
    hub.absarc(0, 0, R * 0.08, 0, Math.PI * 2, true);
    s.holes.push(hub);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 48 });
    g.center();
    return g;
  }, []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <group rotation={[0, 0, spin]}>
        <mesh geometry={flange} position={[0, 0, 0.09]} material={copper()} castShadow receiveShadow />
        <mesh geometry={flange} position={[0, 0, -0.09]} material={copper()} castShadow receiveShadow />
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.15, 64]} />
          <meshPhysicalMaterial color="#3a2010" roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={darkBrass()}>
          <cylinderGeometry args={[0.07, 0.07, 0.24, 24]} />
        </mesh>
      </group>
    </group>
  );
};

/** Film strip ribbon from the reel across the desk; side vector = tangent x up (lies flat when level). */
export const FilmStrip: React.FC = () => {
  const geo = useMemo(() => {
    const pts = [
      [1.25, 0.3, -0.75],
      [1.08, 0.12, -0.52],
      [1.02, 0.016, -0.18],
      [1.0, 0.016, 0.45],
      [0.7, 0.016, 1.05],
      [0.1, 0.016, 1.5],
      [-0.7, 0.016, 1.72],
      [-1.5, 0.016, 1.6],
      [-2.2, 0.016, 1.2],
    ].map((p) => new THREE.Vector3(...(p as [number, number, number])));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const N = 220, half = 0.13;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const len = curve.getLength();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(half);
      pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
      const u = (t * len) / (half * 2 * 4); // 4 sprocket-rows per cell height → square cells
      uv.push(u, 0, u, 1);
      if (i < N) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  const tex = useMemo(() => {
    const t = filmTex().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(0.5, 1);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial map={tex} side={THREE.DoubleSide} roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.15} />
    </mesh>
  );
};

export const Inkwell: React.FC = () => (
  <group position={[-1.55, 0, -0.55]}>
    <mesh position={[0, 0.16, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, 0.32, 40]} />
      <meshPhysicalMaterial color="#14100c" roughness={0.08} clearcoat={1} transmission={0} metalness={0.1} />
    </mesh>
    <mesh position={[0, 0.36, 0]} material={brass()} castShadow>
      <cylinderGeometry args={[0.1, 0.12, 0.08, 32]} />
    </mesh>
    {/* quill */}
    <mesh position={[0.12, 0.75, 0.05]} rotation={[0.2, 0, -0.42]} castShadow>
      <coneGeometry args={[0.05, 0.9, 12]} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#e9dcc0" />
    </mesh>
  </group>
);

const Scene: React.FC<{ f: number; frame: number }> = ({ f, frame }) => {
  const spin = f * 0.01;
  return (
    <>
      <Rig />
      <hemisphereLight args={["#fff1d6", "#3b2412", 0.55]} />
      <spotLight
        position={[-3.2, 5.6, 4.2]}
        angle={0.55}
        penumbra={0.7}
        intensity={130}
        color="#ffe2b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
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

      <Desk />
      <PhotoFrame />
      <SpeedLines />
      {/* trail from the photo to the desk: small and faint near the photo, solid in front */}
      <Ghost f={f - 20} seed={5} opacity={0.3} position={[0.34, 0.2, 0.06]} scale={0.52} heading={-0.35} />
      <Ghost f={f - 10} seed={8} opacity={0.5} position={[-0.12, 0.2, 0.12]} scale={0.66} heading={-0.5} />
      <ToyPerson f={f} seed={3} pose="walk" outfit="casual" position={[-0.72, 0, 0.62]} heading={-0.55} scale={0.9} look={SEPIA_LOOK} />
      <FrameTrail />

      <Reel position={[1.25, 0.62, -0.75]} rotY={0.86} spin={spin} />
      <FilmStrip />
      <Gear R={0.62} teeth={22} depth={0.07} position={[-1.05, 0.64, -1.05]} rotation={[0, 0.25, 0]} spin={spin * 0.6} />
      <Gear R={0.34} teeth={12} depth={0.07} position={[-0.42, 1.12, -1.25]} rotation={[0, 0.25, 0]} spin={-spin * 1.1 + 0.13} mat={darkBrass()} />
      <Gear R={0.24} teeth={12} depth={0.05} position={[1.15, 0.04, 0.95]} rotation={[-Math.PI / 2, 0, 0]} spin={spin} />
      <Gear R={0.15} teeth={9} depth={0.05} position={[0.9, 0.04, 1.22]} rotation={[-Math.PI / 2, 0, 0]} spin={-spin * 1.6} mat={copper()} />
      <Inkwell />

      <Finish
        frame={frame}
        background="#EADBB8"
        profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM}
        exposure={0.82}
        envIntensity={0.45}
        hdri="warmStudio"
      />
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* parchment wash behind the title for readability */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 760,
        background: "linear-gradient(180deg, rgba(234,219,184,0.92) 0%, rgba(234,219,184,0.78) 55%, rgba(234,219,184,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 72, right: 72, top: 262, fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 54, height: 2, background: BROWN }} />
        <span style={{ fontSize: 30, letterSpacing: "0.32em", color: BROWN, fontWeight: 700 }}>AUDIRA AI TUTORIAL</span>
      </div>
      <div style={{ marginTop: 18, fontSize: 142, lineHeight: 0.98, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>FOTO LAMA</div>
      <div style={{ fontSize: 142, lineHeight: 1.0, fontWeight: 700, fontStyle: "italic", color: TERRA, letterSpacing: "-0.01em" }}>JADI VIDEO</div>
      <div style={{ marginTop: 14, width: 420, height: 3, background: `linear-gradient(90deg, ${GOLD}, rgba(197,160,89,0))` }} />
    </div>
  </AbsoluteFill>
);

export const Ep03Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: PARCH }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ fov: 36, position: [0, 2.3, 6.6] }}>
        <Scene f={f} frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
