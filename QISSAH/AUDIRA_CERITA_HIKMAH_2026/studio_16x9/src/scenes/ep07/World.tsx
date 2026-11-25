// EP07 world: a rain-slick city intersection at night, film-noir chiaroscuro. Near-monochrome
// materials; the traffic lights are the only saturated colour. Everything is a function of t.
import React, { useMemo } from "react";
import * as THREE from "three";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { CURB_H, LAMP_POSTS, POST, ROAD_HALF, SIGNALS, STOP_X, ewPhase, type V3 } from "./layout";
import { facadeTex, glowTex, signTex, streakTex } from "./tex";

export const NOIR = {
  void: "#06070a",
  asphalt: "#14161a",
  pavement: "#24262b",
  paint: "#9a9ca0",
  iron: "#0c0d10",
  wall: "#1d1f24",
  tungsten: "#ffe2b0",
  moon: "#a7bad3",
  red: "#ff1e2d",
  amber: "#ffae1a",
  green: "#25e08a",
} as const;

const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};

/* ---------- light helpers ---------- */
export const Glow: React.FC<{ pos: V3; color: string; size: number; opacity?: number }> = ({ pos, color, size, opacity = 1 }) => (
  <sprite ref={fx} position={pos} scale={[size, size, 1]}>
    <spriteMaterial map={glowTex()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
  </sprite>
);

/** Reflection of a light on the wet road: a smear lying on the ground, pointing towards the camera. */
export const Streak: React.FC<{ x: number; z: number; color: string; len: number; width: number; opacity: number; yaw?: number }> = ({
  x, z, color, len, width, opacity, yaw = 0,
}) => (
  <mesh ref={fx} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, yaw]}>
    <planeGeometry args={[width, len]} />
    <meshBasicMaterial map={streakTex()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
  </mesh>
);

/* ---------- ground ---------- */
const Ground: React.FC = () => {
  const grain = useSurfaceGrain(11, 0.5, 18);
  const puddles = useMemo(() => {
    const r = prng(907);
    return Array.from({ length: 26 }, () => ({
      x: (r() - 0.5) * 2 * 14, z: (r() - 0.5) * 2 * 14, s: 0.6 + r() * 1.8, sx: 0.6 + r() * 0.8,
    })).filter((p) => (Math.abs(p.x) < ROAD_HALF || Math.abs(p.z) < ROAD_HALF));
  }, []);
  const quads: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  return (
    <group>
      {/* wet asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={NOIR.asphalt} roughness={0.2} roughnessMap={grain} metalness={0.6} />
      </mesh>
      {puddles.map((p, i) => (
        <mesh key={i} position={[p.x, 0.004, p.z]} rotation={[-Math.PI / 2, 0, p.s]} scale={[p.s, p.s * p.sx, 1]} receiveShadow>
          <circleGeometry args={[1, 28]} />
          <meshStandardMaterial color="#0b0c0f" roughness={0.04} metalness={0.85} />
        </mesh>
      ))}
      {/* sidewalks on the four corners */}
      {quads.map(([sx, sz], i) => (
        <group key={i}>
          <mesh position={[sx * (ROAD_HALF + 20), CURB_H / 2, sz * (ROAD_HALF + 20)]} receiveShadow castShadow>
            <boxGeometry args={[40, CURB_H, 40]} />
            <meshStandardMaterial color={NOIR.pavement} roughness={0.55} roughnessMap={grain} metalness={0.15} />
          </mesh>
          {/* curb edge stones */}
          <mesh position={[sx * (ROAD_HALF + 20), CURB_H + 0.004, sz * (ROAD_HALF + 0.12)]}>
            <boxGeometry args={[40, 0.01, 0.24]} />
            <meshStandardMaterial color="#3a3c42" roughness={0.6} />
          </mesh>
          <mesh position={[sx * (ROAD_HALF + 0.12), CURB_H + 0.004, sz * (ROAD_HALF + 20)]}>
            <boxGeometry args={[0.24, 0.01, 40]} />
            <meshStandardMaterial color="#3a3c42" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <RoadPaint />
    </group>
  );
};

const RoadPaint: React.FC = () => {
  const paint = <meshStandardMaterial color={NOIR.paint} roughness={0.45} metalness={0.1} />;
  const zebra = (cx: number, cz: number, alongX: boolean) =>
    Array.from({ length: 9 }, (_, i) => {
      const o = -ROAD_HALF + 0.55 + i * 0.86;
      return (
        <mesh key={`${cx}:${cz}:${i}`} position={alongX ? [cx, 0.008, o] : [o, 0.008, cz]} receiveShadow>
          <boxGeometry args={alongX ? [1.5, 0.006, 0.5] : [0.5, 0.006, 1.5]} />
          {paint}
        </mesh>
      );
    });
  const dashes = (alongX: boolean) =>
    Array.from({ length: 16 }, (_, i) => {
      const o = (i < 8 ? -1 : 1) * (7.5 + (i % 8) * 4.2);
      return (
        <mesh key={`${alongX}:${i}`} position={alongX ? [o, 0.008, 0] : [0, 0.008, o]}>
          <boxGeometry args={alongX ? [2.2, 0.006, 0.14] : [0.14, 0.006, 2.2]} />
          {paint}
        </mesh>
      );
    });
  return (
    <group>
      {zebra(ROAD_HALF + 1.0, 0, true)}
      {zebra(-ROAD_HALF - 1.0, 0, true)}
      {zebra(0, ROAD_HALF + 1.0, false)}
      {zebra(0, -ROAD_HALF - 1.0, false)}
      {dashes(true)}
      {dashes(false)}
      {/* Jack's stop line (near lane, before the crossing) */}
      <mesh position={[STOP_X, 0.009, ROAD_HALF / 2]}>
        <boxGeometry args={[0.32, 0.006, ROAD_HALF - 0.1]} />
        {paint}
      </mesh>
      <mesh position={[-STOP_X, 0.009, -ROAD_HALF / 2]}>
        <boxGeometry args={[0.32, 0.006, ROAD_HALF - 0.1]} />
        {paint}
      </mesh>
    </group>
  );
};

/* ---------- buildings ---------- */
type Bld = { x: number; z: number; w: number; d: number; h: number; seed: number };
const BUILDINGS: Bld[] = (() => {
  const r = prng(4242);
  const out: Bld[] = [];
  // two rows of buildings along the east-west road, set back behind the sidewalks (|z| >= 8.5),
  // split by the north-south road (|x| >= 6.5). The roads themselves stay clear.
  for (const row of [-1, 1]) {
    for (const side of [-1, 1]) {
      let x = side * 6.5;
      for (let i = 0; i < 9; i++) {
        const w = 5 + r() * 4;
        const d = 10;
        const front = row < 0 ? 9.5 + r() * 2 : 8.5 + r() * 1.5;
        out.push({ x: x + side * w / 2, z: row * (front + d / 2), w, d, h: (row < 0 ? 9 : 7) + r() * 15, seed: 100 + out.length });
        x += side * (w + 0.4);
      }
    }
  }
  return out;
})();

const Building: React.FC<{ b: Bld }> = ({ b }) => {
  const cols = Math.max(3, Math.round(b.w / 1.6));
  const rows = Math.max(3, Math.round(b.h / 2.6));
  const tex = facadeTex(b.seed, cols, rows, 0.18);
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial color={NOIR.wall} roughness={0.86} metalness={0.05} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.9} />
      </mesh>
      {/* cornice */}
      <mesh position={[0, b.h + 0.15, 0]}>
        <boxGeometry args={[b.w + 0.4, 0.3, b.d + 0.4]} />
        <meshStandardMaterial color="#101114" roughness={0.8} />
      </mesh>
      {/* dark shopfront band at street level */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[b.w + 0.04, 3.2, b.d + 0.04]} />
        <meshStandardMaterial color="#0d0e11" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
};

/** The AUDIRA name lives in the world: a painted hotel sign on the corner building behind the post. */
/** Hotel at the far end of the north road: its sign is the vanishing-point accent of the wide shot. */
const SIGN_HOST: Bld = { x: -0.5, z: -36, w: 20, d: 10, h: 17, seed: 400 };
export const AUDIRA_SIGN_POS: V3 = [SIGN_HOST.x, 5.4, SIGN_HOST.z + SIGN_HOST.d / 2 + 0.3];
const AudiraSign: React.FC<{ t: number }> = ({ t }) => {
  const flick = 0.92 + 0.08 * Math.sin(t * 23.0) * Math.sin(t * 3.1);
  return (
    <group position={AUDIRA_SIGN_POS} scale={1.6}>
      <mesh>
        <boxGeometry args={[4.6, 1.15, 0.12]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[4.4, 1.0]} />
        <meshStandardMaterial
          map={signTex("HOTEL AUDIRA", { font: "700 96px Georgia, serif" })}
          emissiveMap={signTex("HOTEL AUDIRA", { font: "700 96px Georgia, serif" })}
          emissive={NOIR.tungsten}
          emissiveIntensity={2.4 * flick}
          roughness={0.5}
        />
      </mesh>
      {/* two brackets */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.75, -0.25]}>
          <boxGeometry args={[0.06, 0.4, 0.5]} />
          <meshStandardMaterial color={NOIR.iron} />
        </mesh>
      ))}
    </group>
  );
};

/** Spotlight pointing straight down; its target is a child object so it follows the group. */
export const DownSpot: React.FC<{ y: number; color: string; intensity: number; shadow?: boolean; angle?: number; distance?: number }> = ({
  y, color, intensity, shadow = false, angle = 0.72, distance = 18,
}) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <group position={[0, y, 0]}>
      <primitive object={target} position={[0, -y, 0.01]} />
      <spotLight
        target={target}
        color={color}
        intensity={intensity}
        distance={distance}
        angle={angle}
        penumbra={0.55}
        decay={2}
        castShadow={shadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
    </group>
  );
};

/* ---------- street lamp ---------- */
const StreetLamp: React.FC<{ pos: V3; t: number; i: number; shadow?: boolean }> = ({ pos, t, i, shadow = false }) => {
  const flick = 0.94 + 0.06 * Math.sin(t * 17 + i * 3) * Math.sin(t * 2.3 + i);
  const H = 5.2;
  return (
    <group position={pos}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 0.5, 14]} />
        <meshStandardMaterial color={NOIR.iron} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, H, 12]} />
        <meshStandardMaterial color={NOIR.iron} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, H + 0.12, 0]}>
        <coneGeometry args={[0.38, 0.4, 12]} />
        <meshStandardMaterial color={NOIR.iron} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, H - 0.12, 0]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color={NOIR.tungsten} emissive={NOIR.tungsten} emissiveIntensity={9 * flick} />
      </mesh>
      <Glow pos={[0, H - 0.12, 0]} color={NOIR.tungsten} size={2.4} opacity={0.55 * flick} />
      {/* volumetric cone */}
      <mesh ref={fx} position={[0, (H - 0.1) / 2, 0]}>
        <coneGeometry args={[2.3, H - 0.1, 32, 1, true]} />
        <meshBasicMaterial color={NOIR.tungsten} transparent opacity={0.045 * flick} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <DownSpot y={H - 0.2} color={NOIR.tungsten} intensity={70 * flick} shadow={shadow} />
    </group>
  );
};

/* ---------- traffic signal ---------- */
const LAMP_Y = [0.36, 0, -0.36];
const SignalHead: React.FC<{ state: "red" | "amber" | "green"; glow: number }> = ({ state, glow }) => {
  const colors = [NOIR.red, NOIR.amber, NOIR.green];
  const on = state === "red" ? 0 : state === "amber" ? 1 : 2;
  return (
    <group>
      <mesh castShadow>
        <RoundedBoxGeo args={[0.42, 1.18, 0.32]} radius={0.06} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#111215" roughness={0.38} />
      </mesh>
      {LAMP_Y.map((y, i) => (
        <group key={i} position={[0, y, 0.165]}>
          {/* visor */}
          <mesh position={[0, 0.07, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.2, 18, 1, true, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#0b0c0e" side={THREE.DoubleSide} roughness={0.5} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.12, 24]} />
            <meshStandardMaterial
              color={i === on ? colors[i] : "#1a1a1c"}
              emissive={colors[i]}
              emissiveIntensity={i === on ? 14 : 0.05}
              roughness={0.2}
            />
          </mesh>
          {i === on && <Glow pos={[0, 0, 0.06]} color={colors[i]} size={1.5 * glow} opacity={0.9} />}
        </group>
      ))}
    </group>
  );
};

const Signal: React.FC<{ pos: V3; face: number; state: "red" | "amber" | "green"; glow: number }> = ({ pos, face, state, glow }) => {
  const col = state === "red" ? NOIR.red : state === "amber" ? NOIR.amber : NOIR.green;
  return (
    <group position={pos}>
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.8, 12]} />
        <meshStandardMaterial color="#17181b" roughness={0.45} metalness={0.6} />
      </mesh>
      <group position={[0, 3.35, 0]} rotation={[0, face, 0]}>
        <group position={[0, 0, 0.1]}>
          <SignalHead state={state} glow={glow} />
        </group>
      </group>
      <pointLight position={[Math.sin(face) * 0.6, 3.3, Math.cos(face) * 0.6]} color={col} intensity={9} distance={9} decay={2} />
    </group>
  );
};

/* ---------- police post ---------- */
const PolicePost: React.FC<{ t: number; lit?: number }> = ({ lit = 1 }) => (
  <group position={POST} rotation={[0, 0.35, 0]}>
    {/* walls */}
    <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[2.6, 2.6, 2.2]} radius={0.05} />
      <meshPhysicalMaterial {...POLISH.stone} color="#b9b6ae" />
    </mesh>
    {/* lit window band facing the street */}
    <mesh position={[0, 1.55, 1.105]}>
      <planeGeometry args={[2.1, 0.95]} />
      <meshStandardMaterial color="#2a2418" emissive={NOIR.tungsten} emissiveIntensity={1.6 * lit} emissiveMap={facadeTex(9, 4, 1, 1)} />
    </mesh>
    <mesh position={[1.305, 1.55, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[1.6, 0.95]} />
      <meshStandardMaterial color="#2a2418" emissive={NOIR.tungsten} emissiveIntensity={1.4 * lit} emissiveMap={facadeTex(10, 3, 1, 1)} />
    </mesh>
    {/* door */}
    <mesh position={[1.306, 0.95, 0.65]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.7, 1.7]} />
      <meshStandardMaterial color="#2c2d31" roughness={0.6} />
    </mesh>
    {/* roof slab + sign */}
    <mesh position={[0, 2.72, 0.1]} castShadow>
      <boxGeometry args={[3.2, 0.2, 2.8]} />
      <meshStandardMaterial color="#26272b" roughness={0.7} />
    </mesh>
    <mesh position={[0, 3.12, 0.6]}>
      <boxGeometry args={[2.4, 0.56, 0.08]} />
      <meshStandardMaterial color="#0f1013" />
    </mesh>
    <mesh position={[0, 3.12, 0.645]}>
      <planeGeometry args={[2.3, 0.5]} />
      <meshStandardMaterial
        map={signTex("POS POLISI", { font: "700 132px Georgia, serif", bg: "#e9e4d8", fg: "#121316" })}
        emissiveMap={signTex("POS POLISI", { font: "700 132px Georgia, serif", bg: "#e9e4d8", fg: "#121316" })}
        emissive="#ffffff"
        emissiveIntensity={0.55 * lit}
        roughness={0.6}
      />
    </mesh>
    <pointLight position={[0, 1.6, 1.9]} color={NOIR.tungsten} intensity={6 * lit} distance={6} decay={2} />
  </group>
);

/* ---------- rain ---------- */
const RAIN_N = 2600;
const Rain: React.FC<{ t: number; center: V3; intensity?: number }> = ({ t, center, intensity = 1 }) => {
  const seeds = useMemo(() => {
    const r = prng(5150);
    return Array.from({ length: RAIN_N }, () => [r(), r(), r(), r()]);
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RAIN_N * 6), 3));
    return g;
  }, []);
  const arr = geo.getAttribute("position") as THREE.BufferAttribute;
  const a = arr.array as Float32Array;
  const H = 12, W = 34, D = 30;
  for (let i = 0; i < RAIN_N; i++) {
    const [u, v, w, s] = seeds[i];
    const speed = 11 + s * 4;
    const y = H - (((t * speed + u * H) % H) + H) % H;
    const x = center[0] + (v - 0.5) * W + y * 0.06;
    const z = center[2] + (w - 0.5) * D;
    const len = 0.32 + s * 0.22;
    a.set([x, y, z, x + 0.02, y + len, z], i * 6);
  }
  arr.needsUpdate = true;
  return (
    <lineSegments ref={fx} geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#c9d4e2" transparent opacity={0.2 * intensity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
};

/** Splash rings on the asphalt. */
const Splashes: React.FC<{ t: number; center: V3 }> = ({ t, center }) => {
  const seeds = useMemo(() => {
    const r = prng(808);
    return Array.from({ length: 70 }, () => [r(), r(), r()]);
  }, []);
  return (
    <group>
      {seeds.map(([u, v, w], i) => {
        const period = 0.55 + w * 0.5;
        const k = ((t + u * 7) % period) / period;
        const cyc = Math.floor((t + u * 7) / period);
        const r2 = prng(i * 131 + cyc * 7 + 3);
        const x = center[0] + (r2() - 0.5) * 22;
        const z = center[2] + (r2() - 0.5) * 16 - 2 + v;
        return (
          <mesh key={i} ref={fx} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} scale={0.05 + k * 0.22}>
            <ringGeometry args={[0.8, 1, 20]} />
            <meshBasicMaterial color="#cfd8e6" transparent opacity={(1 - k) * 0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- the whole set ---------- */
export const World: React.FC<{ t: number; camPos: V3; rain?: number }> = ({ t, camPos, rain = 1 }) => {
  const ew = ewPhase(t);
  const ns = ew === "red" ? "green" : "red";
  const sigCol = (s: string) => (s === "red" ? NOIR.red : s === "amber" ? NOIR.amber : NOIR.green);
  return (
    <group>
      <Ground />
      {BUILDINGS.map((b) => (
        <Building key={b.seed} b={b} />
      ))}
      <Building b={SIGN_HOST} />
      <AudiraSign t={t} />
      {LAMP_POSTS.map((p, i) => (
        <StreetLamp key={i} pos={p} t={t} i={i} shadow={i === 0} />
      ))}
      {SIGNALS.map((s, i) => (
        <Signal key={i} pos={s.pos} face={s.face} state={s.road === "ew" ? ew : ns} glow={1} />
      ))}
      <PolicePost t={t} />

      {/* wet-road reflections of the lights (streaks run towards the camera) */}
      {LAMP_POSTS.map((p, i) => (
        <Streak key={`l${i}`} x={p[0]} z={p[2] + 2.6} color={NOIR.tungsten} len={7} width={1.4} opacity={0.5} />
      ))}
      {SIGNALS.filter((s) => s.road === "ew").map((s, i) => (
        <Streak key={`s${i}`} x={s.pos[0] + Math.sin(s.face) * 0.4} z={s.pos[2] + 3.2} color={sigCol(ew)} len={6.5} width={0.7} opacity={1} />
      ))}
      <Streak x={POST[0] + 1.2} z={POST[2] + 3.5} color={NOIR.tungsten} len={5} width={1.8} opacity={0.2} />

      {/* cold moonlight rim from above-behind, plus a little sky fill */}
      <directionalLight position={[-10, 18, -22]} intensity={0.9} color={NOIR.moon} />
      <hemisphereLight args={["#2a3442", "#050506", 0.35]} />

      <Rain t={t} center={[camPos[0] * 0.5, 0, camPos[2] * 0.5]} intensity={rain} />
      <Splashes t={t} center={[0, 0, 4]} />
    </group>
  );
};
