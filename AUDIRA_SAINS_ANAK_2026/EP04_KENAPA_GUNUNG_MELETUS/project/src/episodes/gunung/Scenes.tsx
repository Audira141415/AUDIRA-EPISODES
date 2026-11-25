// EP04 scenes (multi-scene director law): each scene owns its set, lights, fog and camera rig.
// T = film seconds, t = seconds since the scene started.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { shotPlan, frame as fr, pushIn, orbit, crane, type Framing } from "../../core/camera/moves.ts";
import type { Key } from "../../core/motion/track.ts";
import { AssetModel } from "../../core/assets/AssetModel";
import { DISASTER_PALETTE as P } from "../../kits/disastersim/lib/palette";
import { clamp, lerp, prng, seg, smooth } from "../../kits/disastersim/core/motion";
import { AshPlume, fbm, Glow, Label3D, Ring, Sea, SkyDome, Volcano } from "./Volcano";
import { GunungEarthBlock } from "./GunungEarthBlock";
import { BEAT, SC, type SceneId } from "./timeline";

const CLOCK = 60;
type SceneDef = {
  World: React.FC<{ T: number; t: number }>;
  rig: Key[];
  bg: string;
  fog: [number, number];
  key: { pos: [number, number, number]; color: string; intensity: number; ambient: number; sky: string; ground: string };
};

// ---------- helpers ----------
const Swarm: React.FC<{
  count: number;
  seed: number;
  place: (s: number[], i: number, o: THREE.Object3D) => boolean; // false = hidden
  color: string;
  emissive?: number;
  opacity?: number;
  geo?: "ico" | "sphere" | "flake";
  deps: unknown[];
}> = ({ count, seed, place, color, emissive = 0, opacity = 1, geo = "ico", deps }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), r(), r()]);
  }, [count, seed]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    seeds.forEach((s, i) => {
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1);
      if (!place(s, i, o)) o.scale.setScalar(0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      {geo === "flake" ? <octahedronGeometry args={[1, 0]} /> : geo === "sphere" ? <sphereGeometry args={[1, 12, 8]} /> : <icosahedronGeometry args={[1, 1]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={geo === "sphere" ? 0.1 : 0.9} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} />
    </instancedMesh>
  );
};

/** Low-poly terrain with vertex colours (hills, fields). */
const Terrain: React.FC<{ size: number; height: number; seed: number; low: string; high: string; y?: number; flat?: number }> = ({ size, height, seed, low, high, y = 0, flat = 6 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 80, 80);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const a = new THREE.Color(low);
    const b = new THREE.Color(high);
    const c = new THREE.Color();
    const cols: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const h = (fbm(x * 0.08, z * 0.08, seed) * 0.5 + 0.5) * height * smooth((r - flat) / 8);
      pos.setY(i, h);
      c.copy(a).lerp(b, clamp(h / height + 0.15 * fbm(x * 0.4, z * 0.4, seed + 2)));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [size, height, seed, low, high, flat]);
  return (
    <mesh geometry={geo} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} flatShading />
    </mesh>
  );
};

/** Glowing tube drawn on over time (lava flow / Cincin Api). */
const DrawTube: React.FC<{ pts: THREE.Vector3[]; k: number; radius: number; color: string; intensity?: number; tubular?: number }> = ({ pts, k, radius, color, intensity = 1.5, tubular = 200 }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), tubular, radius, 8, false), [pts, radius, tubular]);
  const count = geo.index ? geo.index.count : 0;
  const n = Math.floor((clamp(k) * count) / 6) * 6;
  useLayoutEffect(() => geo.setDrawRange(0, n), [geo, n]);
  if (n <= 0) return null;
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} roughness={0.4} />
    </mesh>
  );
};

const LabFloor: React.FC<{ y?: number; r?: number }> = ({ y = 0, r = 7 }) => (
  <group>
    <mesh position={[0, y - 0.15, 0]} receiveShadow>
      <cylinderGeometry args={[r, r + 0.15, 0.3, 64]} />
      <meshStandardMaterial color={P.plinth} roughness={0.5} metalness={0.35} />
    </mesh>
    <gridHelper args={[80, 80, P.grid, P.grid]} position={[0, y - 0.31, 0]} />
  </group>
);


// =============== S1 — Krakatau 1883 ===============
const S1: React.FC<{ T: number; t: number }> = ({ T, t }) => {
  const erupt = T - (BEAT.letusan - 0.3);
  return (
    <group>
      <SkyDome top="#1A2B3D" horizon="#C9895C" bottom="#14506F" />
      <Glow position={[-30, 6, -60]} size={30} color="#FFB070" opacity={0.6} />
      <Sea t={T} color="#2C7FA8" deep="#123E58" />
      <Volcano radius={3.2} height={2.7} seed={7} green={0.5} position={[0, -0.12, 0]} glow={seg(T, BEAT.letusan - 0.3, BEAT.letusan + 0.4)} />
      {[[2.6, 1.2], [2.2, 2.0], [-2.4, 1.8], [-2.9, 0.4], [1.0, 2.9]].map(([x, z], i) => (
        <group key={i} position={[x, -0.05, z]}>
          <AssetModel id="palm-tree-a307da" size={0.9 + (i % 2) * 0.25} ground rotation={[0, i * 1.3, 0]} />
        </group>
      ))}
      <group position={[3.4, 0.02 + 0.04 * Math.sin(T * 1.6), 5.6]} rotation={[0.03 * Math.sin(T * 1.3), -0.7, 0.04 * Math.sin(T * 1.1)]}>
        <AssetModel id="hanga-roa-fishing-boat-f09534" size={1.4} ground />
      </group>
      <AshPlume t={erupt} origin={[0, 2.4, 0]} height={7} spread={3.2} count={90} rise={3.2} seed={11} />
      {/* sound rings racing out over the sea */}
      {[0, 1, 2, 3].map((k) => {
        const d = T - BEAT.krakatau - k * 0.55;
        if (d < 0) return null;
        const r = 3.4 + d * 6.5;
        return <Ring key={k} r={r} o={(1 - clamp(d / 5)) * 0.85} color={P.ring} width={0.025} y={0.12} />;
      })}
      <Label3D text="KRAKATAU · SELAT SUNDA" accent={P.lvlAdvisory} position={[0.6, 3.6, 0.5]} h={0.5} o={seg(t, BEAT.krakatau, BEAT.krakatau + 0.5) * (1 - seg(t, 6.4, 6.9))} />
    </group>
  );
};
const RIG1 = shotPlan(CLOCK, { target: [0.6, 1.3, 0], az: 26, el: 5, dist: 10.5, fov: 40 }, [
  { at: 2.4, move: fr({ az: 18, el: 9, dist: 12.5 }) },
  { at: 4.6, move: fr({ target: [0, 2.2, 0], az: 8, el: 30, dist: 27 }) },
  { at: 6.8, move: fr({ target: [0, 2.6, 0], az: 0, el: 16, dist: 17 }) },
  { at: 8.4, move: pushIn(0.9) },
]);

// =============== S2 — globe + Cincin Api ===============
// classroom-globe GLB: ball r=0.0958 at (0, 0.1897, 0) on node "globe-axis", tilted -23.5° about Z;
// model height 0.3022 -> size=4 scales by 13.24. Its land colours follow ll() (lon = atan2(x, z)).
const GLOBE_K = 4 / 0.3022;
const GLOBE_R = 0.0962 * GLOBE_K;
const GLOBE_C: [number, number, number] = [0, 0.1897 * GLOBE_K, 0];
const GLOBE_TILT = Math.atan2(-0.3987490689252462, 0.917060074385124);
const ll = (lat: number, lon: number, r = GLOBE_R * 1.03) => {
  const a = (lat * Math.PI) / 180;
  const b = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b));
};
const RING_MAIN: [number, number][] = [
  [-46, -74], [-30, -71], [-15, -76], [0, -80], [12, -88], [18, -100], [25, -110], [35, -119], [45, -123], [55, -133], [60, -150], [56, -160], [52, -178], [53, 165], [50, 157], [43, 146], [36, 139], [30, 131], [22, 124], [14, 122], [5, 126], [-2, 128], [-6, 140], [-9, 152], [-16, 168], [-22, 175], [-32, -178], [-40, 176],
];
const RING_SUNDA: [number, number][] = [[-2, 128], [-8, 122], [-8.5, 115], [-7.5, 108], [-6.5, 104], [-2, 100], [3, 96]];
const S2: React.FC<{ T: number; t: number }> = ({ T, t }) => {
  const main = useMemo(() => RING_MAIN.map(([a, b]) => ll(a, b)), []);
  const sunda = useMemo(() => RING_SUNDA.map(([a, b]) => ll(a, b, GLOBE_R * 1.035)), []);
  const draw = seg(T, BEAT.cincin - 0.2, BEAT.cincin + 2.6);
  const indo = seg(T, BEAT.n127 - 0.3, BEAT.n127 + 0.6);
  const yaw = (-160 + t * 2.2) * (Math.PI / 180);
  const indoAt = ll(-2, 118, GLOBE_R * 1.04)
    .applyEuler(new THREE.Euler(0, 0, GLOBE_TILT))
    .add(new THREE.Vector3(...GLOBE_C))
    .applyEuler(new THREE.Euler(0, yaw, 0));
  return (
    <group>
      <LabFloor r={3.2} />
      <group position={[0, 0, 0]}>
        <AssetModel id="classroom-globe-16a96e" size={4} ground rotation={[0, yaw + 0.0, 0]} />
      </group>
      <group rotation={[0, yaw, 0]}>
      <group position={GLOBE_C} rotation={[0, 0, GLOBE_TILT]}>
        <DrawTube pts={main} k={draw} radius={0.03} color="#FF7A2E" intensity={2.2} />
        <DrawTube pts={sunda} k={draw * 1.2 - 0.2} radius={0.03 + 0.02 * indo} color={indo > 0.1 ? "#FFC14E" : "#FF7A2E"} intensity={2.2 + 2 * indo} tubular={80} />
        {/* small cones along the ring = volcanoes */}
        {main.concat(sunda).map((p, i) => {
          const k = i / (main.length + sunda.length);
          const on = draw > k ? 1 : 0;
          if (!on) return null;
          const n = p.clone().normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
          const isIndo = i >= main.length || (i >= 19 && i <= 23);
          return (
            <mesh key={i} position={p} quaternion={q} scale={isIndo ? 1 + 0.6 * indo : 1}>
              <coneGeometry args={[0.045, 0.11, 6]} />
              <meshStandardMaterial color={isIndo && indo > 0.1 ? "#FFC14E" : "#C8643A"} emissive="#FF6A1E" emissiveIntensity={0.6 + (isIndo ? 1.5 * indo : 0)} />
            </mesh>
          );
        })}
      </group>
      </group>
      <Label3D text="INDONESIA" accent="#FFC14E" position={[indoAt.x - 0.95, indoAt.y + 0.3, indoAt.z + 0.25]} h={0.26} o={indo * (1 - seg(T, SC.s3 - 0.3, SC.s3))} />
    </group>
  );
};
// Target sits above the globe centre so the globe rides the lower half and the HUD stack keeps the upper third.
const RIG2 = shotPlan(CLOCK, { target: [0, 2.75, 0], az: -10, el: 14, dist: 10.5, fov: 36 }, [
  { at: 1.6, move: fr({ az: 0, el: 16, dist: 9.6 }) },
  { at: 4.5, move: orbit(10) },
  { at: 7.6, move: fr({ target: [-0.25, 2.75, 0.5], az: -20, el: 4, dist: 9.2 }) },
  { at: 12, move: pushIn(0.96) },
]);

// =============== S3 — earth block ===============
const S3: React.FC<{ T: number; t: number }> = ({ T }) => <GunungEarthBlock T={T} />;
const RIG3 = shotPlan(CLOCK, { target: [0, -2.0, 0], az: -18, el: 18, dist: 26, fov: 40 }, [
  { at: 1.8, move: fr({ target: [0.6, -2.0, 0.6], az: -8, el: 14, dist: 21 }) },
  { at: 7.0, move: fr({ target: [1.6, -2.0, 1], az: 2, el: 12, dist: 19 }) },
  { at: 9.3, move: pushIn(0.9) },
  { at: 13.5, move: fr({ target: [2.2, -1.6, 0.8], az: 10, el: 14, dist: 16 }) },
  { at: 16.2, move: pushIn(0.93) },
]);

// =============== S4a — soda can ===============
const S4a: React.FC<{ T: number; t: number }> = ({ T }) => {
  const shake = seg(T, BEAT.gas, BEAT.gas + 0.3) * (1 - seg(T, BEAT.naik - 0.3, BEAT.naik));
  const open = seg(T, BEAT.naik, BEAT.naik + 0.3);
  const burst = seg(T, BEAT.memuai, BEAT.keluar);
  const sx = Math.sin(T * 42) * 0.13 * shake;
  const canTop = 2.15;
  return (
    <group>
      <LabFloor r={3} />
      <group rotation={[0, 0, sx]} position={[sx * 0.6, 0, 0]}>
        <AssetModel id="energy-drink-can-c47bcf" size={2.2} ground rotation={[0, 0.5, 0]} />
      </group>
      {/* gas bubbles: inside the can top first, then foaming out as pressure drops */}
      <Swarm
        count={120}
        seed={21}
        color="#DDF3FF"
        opacity={0.75}
        geo="sphere"
        deps={[T]}
        place={(s, i, o) => {
          const life = T - BEAT.naik - s[0] * 3.5;
          if (life <= 0 || open <= 0) return false;
          const k = (life * (0.5 + 0.9 * burst)) % 2.4;
          const ang = s[1] * Math.PI * 2;
          const spread = 0.15 + k * (0.15 + 0.55 * burst) * s[2];
          o.position.set(Math.cos(ang) * spread, canTop + k * (0.9 + 1.4 * burst) - 0.15 * k * k * burst, Math.sin(ang) * spread);
          o.scale.setScalar((0.03 + 0.05 * s[3]) * (1 + 1.6 * burst * smooth(k / 1.2)));
          return true;
        }}
      />
      <Label3D text="GAS TERLARUT" accent={P.lvlInfo} position={[0.9, 1.4, 0.4]} h={0.24} o={seg(T, BEAT.gas + 0.2, BEAT.gas + 0.6) * (1 - seg(T, BEAT.naik - 0.2, BEAT.naik + 0.2))} />
      <Label3D text="GAS MEMUAI" accent={P.lvlAdvisory} position={[0.7, 3.2, 0.4]} h={0.24} o={seg(T, BEAT.memuai, BEAT.memuai + 0.4)} />
    </group>
  );
};
const RIG4a = shotPlan(CLOCK, { target: [0, 1.2, 0], az: -20, el: 10, dist: 6.2, fov: 34 }, [
  { at: 2.6, move: fr({ target: [0, 1.7, 0], az: -6, el: 12, dist: 5.4 }) },
  { at: 5.2, move: fr({ target: [0, 2.6, 0], az: 8, el: 6, dist: 6.6 }) },
  { at: 7.3, move: orbit(4) },
]);

// =============== S4b — Hawaii vs Merapi ===============
const HX = -3.3;
const MX = 3.2;
const lavaPath = (ang: number, R: number, H: number, seed: number) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const r = R * (0.12 + 0.86 * u);
    const a = ang + 0.25 * Math.sin(u * 5 + seed);
    const y = H * (1 - Math.pow(u, 0.75)) * 0.94 + 0.02;
    pts.push(new THREE.Vector3(HX + Math.cos(a) * r, y + 0.03, Math.sin(a) * r));
  }
  return pts;
};
const S4b: React.FC<{ T: number; t: number }> = ({ T }) => {
  const flows = useMemo(() => [lavaPath(1.2, 3.0, 0.95, 1), lavaPath(1.9, 3.0, 0.95, 2), lavaPath(0.5, 3.0, 0.95, 3)], []);
  const flow = clamp((T - BEAT.encer) / 3.6);
  const dome = seg(T, BEAT.kental, BEAT.kental + 1);
  const boom = T - BEAT.eksplosif;
  return (
    <group>
      <SkyDome top="#34465A" horizon="#C98E5E" bottom="#3A3631" />
      <Glow position={[-20, 5, -50]} size={26} color="#FFB070" opacity={0.45} />
      <Terrain size={60} height={1.6} seed={4} low="#5E5850" high="#857B6E" y={-0.05} flat={9} />
      <Volcano kind="shield" radius={3.0} height={0.95} seed={12} green={0.08} position={[HX, 0, 0]} glow={0.6 + 0.4 * seg(T, BEAT.encer - 0.5, BEAT.encer)} />
      <pointLight position={[HX, 1.6, 0.6]} color="#FF7A2E" intensity={6} distance={6} />
      <pointLight position={[MX, 3.3, 0.6]} color="#FF6A1E" intensity={3 + 5 * dome} distance={5} />
      {flows.map((p, i) => (
        <DrawTube key={i} pts={p} k={flow - i * 0.12} radius={0.06} color="#FF6A1E" intensity={2.4} tubular={60} />
      ))}
      <Volcano kind="strato" radius={2.2} height={2.9} seed={19} green={0.4} position={[MX, 0, 0]} glow={0.4 + 0.6 * dome} glowColor="#FF5A1E" />
      <mesh position={[MX, 2.5, 0]} scale={[0.3, 0.12 + 0.05 * dome, 0.3]} visible={dome > 0.01}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#4A2A1C" emissive="#FF5A1E" emissiveIntensity={0.6 + 0.9 * dome} roughness={0.8} flatShading />
      </mesh>
      <AshPlume t={boom} origin={[MX, 2.7, 0]} height={5} spread={2.2} count={120} size={0.3} rise={1.6} color="#6F6B68" glowBase={false} seed={31} />
      <group position={[0.2, 0, 3.4]}>
        <AssetModel id="lava-rock-pile-d56d19" size={1.3} ground />
      </group>
      {/* foreground layer: basalt piles + scattered stones between camera and the cones */}
      {([[-5.6, 5.4, 1.7, 0.4], [-1.4, 6.2, 1.2, 2.1], [5.4, 5.8, 1.6, 1.2], [1.6, 7.0, 1.0, 3.3]] as const).map(([x, z, sz, r], i) => (
        <group key={`fg${i}`} position={[x, 0, z]} rotation={[0, r, 0]}>
          <AssetModel id="lava-rock-pile-d56d19" size={sz} ground />
        </group>
      ))}
      <Swarm
        count={60}
        seed={71}
        color="#2E2A27"
        deps={[]}
        place={(s, _i, o) => {
          o.position.set((s[0] - 0.5) * 16, 0.05, 3.6 + s[1] * 4.5);
          o.rotation.set(s[2] * 3, s[3] * 3, 0);
          o.scale.setScalar(0.08 + 0.18 * s[4]);
          return true;
        }}
      />
      <Label3D text="HAWAII · ENCER" accent="#FF8A30" position={[HX - 0.8, 1.55, 1]} h={0.36} o={seg(T, BEAT.encer, BEAT.encer + 0.5)} />
      {/* near layer: embers + ash drifting between camera and cones (reads as foreground depth) */}
      <Swarm
        count={70}
        seed={77}
        color="#FF8A3C"
        emissive={2.2}
        geo="sphere"
        deps={[T]}
        place={(s, _i, o) => {
          const y = ((T * (0.25 + 0.3 * s[3]) + s[0] * 5) % 5) + 0.3;
          o.position.set((s[1] - 0.3) * 12 + 0.4 * Math.sin(T * 0.7 + s[2] * 6), y, 4.5 + s[2] * 5);
          o.scale.setScalar(0.02 + 0.03 * s[4]);
          return true;
        }}
      />
      <Label3D text="MERAPI · KENTAL" accent={P.lvlWarning} position={[MX - 3.8, 2.7, 1]} h={0.36} o={seg(T, BEAT.kental, BEAT.kental + 0.5)} />
    </group>
  );
};
const RIG4b = shotPlan(CLOCK, { target: [0, 1.0, 0], az: 0, el: 14, dist: 17, fov: 38 }, [
  { at: 1.6, move: fr({ target: [HX, 0.7, 0.3], az: -12, el: 16, dist: 8.5 }) },
  { at: 5.2, move: fr({ target: [HX + 0.4, 0.7, 0.3], az: -2, el: 20, dist: 8 }) },
  { at: 6.4, move: fr({ target: [MX, 1.8, 0], az: 10, el: 10, dist: 9 }) },
  { at: 8.6, move: fr({ target: [MX, 2.6, 0], az: 14, el: 12, dist: 11.5 }) },
  // G13: keep moving into the cut (a settle here parked the camera at 52-54 s, deadPct 6%).
  { at: 10, move: fr({ target: [MX, 2.9, 0], az: 22, el: 14, dist: 14 }) },
]);

// =============== S5a — Tambora 1815 ===============
const S5a: React.FC<{ T: number; t: number }> = ({ T, t }) => (
  <group>
    <SkyDome top="#232A31" horizon="#9C7A5C" bottom="#1B3442" />
    <Sea t={T} color="#2A6D8C" deep="#11364A" />
    <Volcano kind="caldera" radius={6} height={3.2} seed={23} green={0.45} position={[0, -0.15, -2]} glow={0.8} />
    <AshPlume t={t + 2.2} origin={[0, 2.6, -2]} height={15} spread={10} count={340} size={0.62} rise={4.5} color="#6F6B68" seed={41} />
    <Label3D text="TAMBORA · SUMBAWA" accent={P.lvlWarning} position={[-3.5, 5.8, 3]} h={0.6} o={seg(t, 0.3, 0.8)} />
  </group>
);
const RIG5a = shotPlan(CLOCK, { target: [0, 3, -2], az: -14, el: 4, dist: 22, fov: 42 }, [
  { at: 2.2, move: crane(10, 2) },
  { at: 4.3, move: fr({ target: [0, 7, -2], az: -4, el: 12, dist: 26 }) },
]);

// =============== S5snow — salju Juni 1816 ===============
const S5snow: React.FC<{ T: number; t: number }> = ({ T }) => (
  <group>
    <SkyDome top="#8796A6" horizon="#D5DCE2" bottom="#C9D2DA" />
    <Terrain size={70} height={3} seed={9} low="#E8EEF2" high="#C5CFD8" flat={7} />
    <group position={[0, 0, 0]} rotation={[0, -0.5, 0]}>
      <AssetModel id="two-story-house-40f6dc" size={4.2} ground />
    </group>
    <group position={[-3.2, 0, 1.6]}>
      <AssetModel id="villager-40255c" size={1.3} ground rotation={[0, 0.6, 0]} />
    </group>
    {/* snow cap on the ground in front + falling flakes */}
    <Swarm
      count={420}
      seed={51}
      color="#FFFFFF"
      emissive={0.25}
      geo="flake"
      deps={[T]}
      place={(s, _i, o) => {
        const y = 9 - ((T * (0.8 + 0.5 * s[3]) + s[0] * 9) % 9);
        o.position.set((s[1] - 0.5) * 14 + 0.3 * Math.sin(T + s[2] * 6), y, (s[2] - 0.3) * 12);
        o.rotation.set(T * s[3], T * s[4], 0);
        o.scale.setScalar(0.035 + 0.035 * s[4]);
        return true;
      }}
    />
  </group>
);
const RIG5snow = shotPlan(CLOCK, { target: [0, 1.8, 0], az: 24, el: 8, dist: 12.5, fov: 40 }, [
  { at: 3.4, move: fr({ az: 14, el: 10, dist: 10 }) },
]);

// =============== S5b — pos pantau + status ===============
const VB: [number, number, number] = [0.5, 0, -11];
const S5b: React.FC<{ T: number; t: number }> = ({ T }) => {
  const swell = seg(T, BEAT.gembung, BEAT.gembung + 1) * (1 - 0.6 * seg(T, BEAT.gasPantau + 0.5, BEAT.normal));
  const quake = [0, 1, 2].map((k) => T - BEAT.gempa - k * 0.4);
  return (
    <group>
      <SkyDome top="#4C6E8F" horizon="#CFD9D8" bottom="#5D7A55" />
      <Terrain size={90} height={2.4} seed={14} low="#4F7444" high="#7E8F5C" flat={5} />
      <Volcano radius={6} height={4.8} seed={29} green={0.6} position={VB} scale={[1 + 0.03 * swell, 1 + 0.05 * swell, 1 + 0.03 * swell]} />
      {quake.map((d, k) => (d < 0 || d > 2.5 ? null : <Ring key={k} r={2 + d * 5} o={(1 - d / 2.5) * 0.8} color={P.ring} y={0.25} center={[VB[0], VB[2]]} width={0.03} />))}
      <AshPlume t={T - BEAT.gasPantau} origin={[VB[0], VB[1] + 4.4, VB[2]]} height={3} spread={1.2} count={30} size={0.45} rise={2} color="#E6E9EC" seed={61} glowBase={false} />
      <group position={[-2.6, 0, 2]}>
        <AssetModel id="observation-tower-69b692" size={4.2} ground />
      </group>
      <group position={[-0.4, 0, 3.1]}>
        <AssetModel id="antenna-mast-0954b0" size={2.6} ground />
      </group>
      <group position={[1.9, 0, 2.4]} rotation={[0, -0.6, 0]}>
        <AssetModel id="ranger-station-ef6407" size={2.2} ground />
      </group>
      <Label3D text="AUDIRA · POS PANTAU" accent={P.route} position={[-2.2, 3.0, 2.2]} h={0.34} o={seg(T, SC.s5b + 0.3, SC.s5b + 0.8)} />
      <Label3D text="PENGGEMBUNGAN" accent={P.lvlAdvisory} position={[VB[0] + 3.2, 5.6, VB[2] + 1]} h={0.7} o={seg(T, BEAT.gembung, BEAT.gembung + 0.4) * (1 - seg(T, BEAT.gasPantau - 0.2, BEAT.gasPantau + 0.2))} />
    </group>
  );
};
const RIG5b = shotPlan(CLOCK, { target: [-1, 2.4, -2], az: -22, el: 6, dist: 12, fov: 40 }, [
  { at: 2.4, move: fr({ target: [-0.2, 2.8, -4], az: -12, el: 6, dist: 13 }) },
  { at: 4.8, move: fr({ target: [0.4, 3.4, -7], az: -4, el: 7, dist: 12 }) },
  { at: 8.8, move: pushIn(0.9) },
]);

// =============== S6 — sunrise sawah ===============
const S6: React.FC<{ T: number; t: number }> = ({ T, t }) => {
  const sunY = lerp(1.5, 6.5, smooth(t / 10));
  const tiles = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) out.push([x * 2, z * 2]);
    return out;
  }, []);
  return (
    <group>
      <SkyDome top="#3D5F8A" horizon="#F4B36C" bottom="#5D7A55" />
      <Glow position={[7, sunY, -40]} size={22} color="#FFC983" opacity={0.95} />
      <mesh position={[7, sunY, -40.5]}>
        <sphereGeometry args={[1.8, 32, 16]} />
        <meshBasicMaterial color="#FFE3A8" toneMapped={false} fog={false} />
      </mesh>
      <Terrain size={110} height={3.5} seed={33} low="#4C7A3E" high="#6F8E5A" flat={10} y={-0.06} />
      <Volcano radius={11} height={7} seed={37} green={0.7} position={[-3, -0.1, -26]} />
      {tiles.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <AssetModel id="rice-paddy-tile-dc727e" size={2.02} ground />
        </group>
      ))}
      {[[-9.5, -2], [-9.8, 3], [9.6, -4], [9.2, 2.4], [-6.5, -7.5]].map(([x, z], i) => (
        <group key={`p${i}`} position={[x, 0, z]}>
          <AssetModel id="palm-tree-a307da" size={3.2 + (i % 2) * 0.6} ground rotation={[0, i * 1.1, 0]} />
        </group>
      ))}
      {[[-8.6, 6.4], [8.4, 6.8], [7.6, -7.4]].map(([x, z], i) => (
        <group key={`b${i}`} position={[x, 0, z]}>
          <AssetModel id="banana-plant-978d7f" size={2} ground rotation={[0, i * 2, 0]} />
        </group>
      ))}
      <group position={[6.2, 0, -7.8]} rotation={[0, -0.4, 0]}>
        <AssetModel id="beach-hut-fc7649" size={3.2} ground />
      </group>
      <group position={[0.8, 0.12, 5.2]} rotation={[0, -0.25, 0]}>
        <AssetModel id="scarecrow-334079" size={1.5} ground />
      </group>
      <Label3D text="AUDIRA SAINS · TANAH VULKANIS" accent={P.route} position={[3.6, 3.4, -7.4]} h={0.42} o={seg(T, BEAT.subur, BEAT.subur + 0.5)} />
    </group>
  );
};
const RIG6 = shotPlan(CLOCK, { target: [0.6, 1.2, 3.4], az: 8, el: 8, dist: 6.5, fov: 40 }, [
  { at: 2.2, move: fr({ target: [0, 2, -2], az: 4, el: 12, dist: 13 }) },
  { at: 6.0, move: fr({ target: [-1, 4, -12], az: 0, el: 10, dist: 24 }) },
  { at: 10.1, move: crane(4, 0.8) },
]);

const WARM_KEY = { pos: [8, 12, 8] as [number, number, number], color: "#FFF1DE", intensity: 2.2, ambient: 0.45, sky: "#CFE6FF", ground: "#2A2018" };

export const SCENES: Record<SceneId, SceneDef> = {
  s1: { World: S1, rig: RIG1, bg: "#1A2B3D", fog: [30, 110], key: { pos: [-10, 8, -6], color: "#FFC48A", intensity: 2.4, ambient: 0.35, sky: "#9CB8D8", ground: "#14304A" } },
  s2: { World: S2, rig: RIG2, bg: P.void, fog: [18, 60], key: { ...WARM_KEY, pos: [5, 9, 7] } },
  s3: { World: S3, rig: RIG3, bg: P.void, fog: [24, 70], key: { ...WARM_KEY, pos: [4, 8, 6], intensity: 2.1 } },
  s4a: { World: S4a, rig: RIG4a, bg: P.void, fog: [14, 50], key: { ...WARM_KEY, pos: [4, 7, 6] } },
  s4b: { World: S4b, rig: RIG4b, bg: "#34465A", fog: [26, 80], key: { ...WARM_KEY, pos: [6, 10, 7], intensity: 3.0, ambient: 0.75 } },
  s5a: { World: S5a, rig: RIG5a, bg: "#232A31", fog: [40, 120], key: { pos: [12, 10, 6], color: "#E8C49A", intensity: 1.8, ambient: 0.35, sky: "#A8A4A0", ground: "#1B3442" } },
  s5snow: { World: S5snow, rig: RIG5snow, bg: "#C9D2DA", fog: [16, 60], key: { pos: [6, 10, 8], color: "#EAF2FF", intensity: 1.6, ambient: 0.6, sky: "#DDE6F0", ground: "#8796A6" } },
  s5b: { World: S5b, rig: RIG5b, bg: "#4C6E8F", fog: [30, 110], key: { pos: [8, 12, 8], color: "#FFF4E6", intensity: 2.3, ambient: 0.45, sky: "#CFE6FF", ground: "#3B4A2E" } },
  s6: { World: S6, rig: RIG6, bg: "#3D5F8A", fog: [35, 120], key: { pos: [7, 6, -20], color: "#FFD3A0", intensity: 2.4, ambient: 0.5, sky: "#FFE2C0", ground: "#3B4A2E" } },
};

export type { Framing };
