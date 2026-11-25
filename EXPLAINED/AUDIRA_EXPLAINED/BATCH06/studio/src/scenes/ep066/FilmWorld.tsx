// AE-066 film world. Same layout as the approved cover (World.tsx stays untouched for Cover), plus:
// reflective transmission glazing, seated ToyPerson controllers, airliners with windows and a
// neutral livery, switchable stop bar / lead-on lights, light-group gains for the REVEAL beats,
// and wingtip wake vortices for the PAYOFF.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, poseAt } from "../../core/polish/Person.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { prng } from "../../core/materials/textures.ts";
import { glowTexture, labelTexture, radarTexture, skyTexture } from "./textures.ts";
import { fuselageTexture } from "./filmTextures.ts";

export type V3 = [number, number, number];
export type PlaneState = { on: boolean; pos: V3; rotY: number; pitch?: number; roll?: number; gear?: boolean; vortex?: number; landing?: boolean; scale?: number };
export type WorldState = {
  a: PlaneState;
  b: PlaneState;
  c: PlaneState;
  d: PlaneState;
  appr: PlaneState;
  stop: number; // stop bar 0..1
  lead: number; // lead-on lights 0..1
  gBlue: number;
  gGreen: number;
  gRed: number;
};

export const TOWER: V3 = [5.2, 0, -13];
export const CAB_Y = 8.5;
export const TX = -2.5;
export const RZ = 6;
export const PZ = -9;
export const STOP_Z = 0.4;
/** Plane centre height on its gear. */
export const GEAR_Y = 0.78;

const glowCol = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

type Lamp = { p: V3; c: string; k?: number; halo?: number; r?: number };
const SPHERE = new THREE.SphereGeometry(1, 10, 8);

const Lamps: React.FC<{ lamps: Lamp[]; halo: THREE.Texture; gain?: number }> = ({ lamps, halo, gain = 1 }) => {
  if (gain <= 0.01) return null;
  return (
    <>
      {lamps.map((l, i) => (
        <group key={i} position={l.p}>
          <mesh geometry={SPHERE} scale={l.r ?? 0.07}>
            <meshBasicMaterial color={glowCol(l.c, (l.k ?? 6) * gain)} toneMapped={false} />
          </mesh>
          {(l.halo ?? 0.7) > 0 && (
            <sprite scale={(l.halo ?? 0.7) * Math.min(1.15, 0.4 + 0.6 * gain)} onUpdate={(s) => s.layers.set(FX_LAYER)}>
              <spriteMaterial map={halo} color={glowCol(l.c, 1.6 * Math.min(gain, 1.6))} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
    </>
  );
};

/* ---------- wake vortex: helical tube trailing from a wingtip (plane-local, behind = -x) ---------- */
const Vortex: React.FC<{ side: number; progress: number; f: number }> = ({ side, progress, f }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const L = 26;
    for (let i = 0; i <= 420; i++) {
      const s = (i / 420) * L;
      const r = 0.3 + s * 0.03;
      const a = s * 2.4 * side;
      pts.push(new THREE.Vector3(-0.9 - s, -0.1 - s * 0.09 + Math.sin(a) * r, side * (3.05 + s * 0.012) + Math.cos(a) * r));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.06, 6, false);
  }, [side]);
  const count = Math.floor(geo.index!.count * Math.max(0, Math.min(1, progress)));
  geo.setDrawRange(0, count - (count % 3));
  const shimmer = 0.32 + 0.06 * Math.sin(f * 0.2 + side);
  return (
    <mesh geometry={geo} onUpdate={(m) => m.layers.set(FX_LAYER)}>
      <meshBasicMaterial color={glowCol("#bfe9ff", 1.4)} transparent opacity={shimmer} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/* ---------- airliner (nose along local +x) ---------- */
export const Airliner: React.FC<{ s: PlaneState; stripe: string; tail: string; halo: THREE.Texture; f: number }> = ({ s, stripe, tail, halo, f }) => {
  const livery = useMemo(() => fuselageTexture(stripe), [stripe]);
  if (!s.on) return null;
  const beacon = 0.5 + 0.5 * Math.sin(f * 0.25);
  const strobe = (f % 70) < 4 ? 1 : 0;
  const white = { ...POLISH.brickABS, color: "#eef2f7" };
  const wing = { ...POLISH.toyPlastic, color: "#c9d1dc" };
  return (
    <group position={s.pos} rotation={[0, s.rotY, 0]} scale={s.scale ?? 1}>
      <group rotation={[s.roll ?? 0, 0, s.pitch ?? 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 4.6, 32]} />
          <meshPhysicalMaterial {...POLISH.brickABS} map={livery} />
        </mesh>
        <mesh position={[2.3, 0, 0]} scale={[0.95, 0.36, 0.36]} castShadow>
          <sphereGeometry args={[1, 28, 18]} />
          <meshPhysicalMaterial {...white} />
        </mesh>
        {/* cockpit windows: four panes */}
        {[-0.13, -0.045, 0.045, 0.13].map((z, i) => (
          <mesh key={i} position={[2.86, 0.14, z * 1.15]} rotation={[0, (z > 0 ? -1 : 1) * Math.abs(z) * 2.6, -0.55]}>
            <RoundedBoxGeo args={[0.05, 0.1, 0.085]} radius={0.02} />
            <meshPhysicalMaterial color="#0b1522" roughness={0.05} clearcoat={1} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[-3.0, 0.08, 0]} rotation={[0, 0, Math.PI / 2 + 0.08]} castShadow>
          <cylinderGeometry args={[0.36, 0.1, 1.5, 28]} />
          <meshPhysicalMaterial {...white} />
        </mesh>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh position={[-0.15, -0.16, sd * 1.6]} rotation={[0, sd * 0.5, 0]} castShadow>
              <RoundedBoxGeo args={[0.95, 0.08, 3.0]} radius={0.035} />
              <meshPhysicalMaterial {...wing} />
            </mesh>
            {/* winglet */}
            <mesh position={[-0.95, 0.05, sd * 3.0]} rotation={[sd * 0.25, 0, -0.5]}>
              <RoundedBoxGeo args={[0.35, 0.45, 0.04]} radius={0.015} />
              <meshPhysicalMaterial color={tail} roughness={0.25} clearcoat={0.9} />
            </mesh>
            <mesh position={[0.55, -0.42, sd * 1.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.2, 0.17, 0.85, 22]} />
              <meshPhysicalMaterial color="#aeb7c3" metalness={0.6} roughness={0.25} clearcoat={0.6} />
            </mesh>
            <mesh position={[0.98, -0.42, sd * 1.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.02, 22]} />
              <meshPhysicalMaterial color="#1a2230" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[-3.2, 0.16, sd * 0.6]} rotation={[0, sd * 0.5, 0]}>
              <RoundedBoxGeo args={[0.5, 0.05, 1.1]} radius={0.02} />
              <meshPhysicalMaterial {...wing} />
            </mesh>
          </group>
        ))}
        <mesh position={[-3.05, 0.95, 0]} rotation={[0, 0, -0.55]} castShadow>
          <RoundedBoxGeo args={[1.1, 1.4, 0.07]} radius={0.03} />
          <meshPhysicalMaterial color={tail} roughness={0.25} clearcoat={0.9} metalness={0.1} />
        </mesh>
        {s.gear !== false &&
          ([[1.9, 0], [-0.3, 0.55], [-0.3, -0.55]] as const).map(([x, z], i) => (
            <group key={i} position={[x, -0.55, z]}>
              <mesh>
                <cylinderGeometry args={[0.035, 0.035, 0.45, 8]} />
                <meshStandardMaterial color="#5b6472" metalness={0.6} roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.09, 16]} />
                <meshStandardMaterial color="#14171c" roughness={0.8} />
              </mesh>
            </group>
          ))}
        <Lamps
          halo={halo}
          lamps={[
            { p: [-0.95, 0.3, -3.05], c: "#ff2a2a", k: 7, halo: 0.6, r: 0.06 },
            { p: [-0.95, 0.3, 3.05], c: "#20ff6a", k: 7, halo: 0.6, r: 0.06 },
            { p: [0.2, 0.4, 0], c: "#ff3030", k: 3 + 6 * beacon, halo: 0.5 + 0.4 * beacon, r: 0.05 },
            { p: [-3.75, 0.3, 0], c: "#ffffff", k: 3 + 10 * strobe, halo: 0.4 + strobe, r: 0.04 },
            { p: [2.0, -0.42, 0], c: "#fff3d6", k: s.landing ? 14 : 8, halo: s.landing ? 3.2 : 1.0, r: 0.07 },
          ]}
        />
      </group>
      {(s.vortex ?? 0) > 0 && (
        <>
          <Vortex side={1} progress={s.vortex!} f={f} />
          <Vortex side={-1} progress={s.vortex!} f={f} />
        </>
      )}
    </group>
  );
};

/* ---------- control tower with reflective glazing and seated controllers ---------- */
const SEATS = [-Math.PI / 4, 0, Math.PI / 4];
const Tower: React.FC<{ halo: THREE.Texture; f: number }> = ({ halo, f }) => {
  const grain = useSurfaceGrain(66, 0.18, 4);
  const radar = useMemo(() => [0, 1, 2].map((v) => radarTexture(v)), []);
  const label = useMemo(() => labelTexture(), []);
  const obst = 0.6 + 0.4 * Math.sin(f * 0.12);
  const sides = 8;
  const verts = Array.from({ length: sides }, (_, k) => (k * Math.PI * 2) / sides);
  return (
    <group position={TOWER}>
      <mesh position={[0, (CAB_Y - 1.4) / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.6, CAB_Y - 1.4, 40]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#c4ccd8" roughnessMap={grain} />
      </mesh>
      <mesh position={[0, (CAB_Y - 1.4) / 2 + 0.3, 1.42]}>
        <boxGeometry args={[0.18, CAB_Y - 3.2, 0.05]} />
        <meshBasicMaterial color={glowCol("#9fd8ff", 1.6)} toneMapped={false} />
      </mesh>
      <mesh position={[0, CAB_Y - 0.7, 0]} castShadow>
        <cylinderGeometry args={[3.35, 2.0, 1.4, sides, 1]} />
        <meshPhysicalMaterial color="#d9e0ea" roughness={0.45} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, CAB_Y + 0.05, 0]}>
        <cylinderGeometry args={[3.3, 3.3, 0.1, sides]} />
        <meshPhysicalMaterial color="#1b2433" roughness={0.6} />
      </mesh>
      {/* reflective glazing: real transmission + clearcoat so the studio HDRI reads on the panes */}
      <mesh position={[0, CAB_Y + 1.45, 0]}>
        <cylinderGeometry args={[3.95, 3.3, 2.8, sides, 1, true]} />
        <meshPhysicalMaterial color="#d6efff" roughness={0.03} metalness={0} transmission={0.92} thickness={0.06} ior={1.5} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.5} specularIntensity={1} side={THREE.DoubleSide} />
      </mesh>
      {verts.map((a, k) => (
        <group key={k} rotation={[0, a, 0]}>
          <mesh position={[0, CAB_Y + 1.45, 3.62]} rotation={[0.21, 0, 0]}>
            <RoundedBoxGeo args={[0.12, 2.9, 0.12]} radius={0.04} />
            <meshPhysicalMaterial color="#e6ebf2" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, CAB_Y + 3.05, 0]} castShadow>
        <cylinderGeometry args={[4.15, 4.25, 0.45, sides]} />
        <meshPhysicalMaterial color="#e9eef5" roughness={0.35} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, CAB_Y + 3.45, 0]}>
        <cylinderGeometry args={[2.6, 3.9, 0.35, sides]} />
        <meshPhysicalMaterial color="#cfd7e2" roughness={0.4} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, CAB_Y + 2.79, 0]}>
        <cylinderGeometry args={[3.9, 3.9, 0.06, sides]} />
        <meshBasicMaterial color={glowCol("#bfe6ff", 1.3)} toneMapped={false} />
      </mesh>
      <mesh position={[0.6, CAB_Y + 5.0, -0.4]}>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshPhysicalMaterial color="#dfe5ee" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-1.1, CAB_Y + 4.0, 0.6]}>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshPhysicalMaterial color="#f2f5f9" roughness={0.3} clearcoat={1} />
      </mesh>
      <Lamps halo={halo} lamps={[{ p: [0.6, CAB_Y + 6.6, -0.4], c: "#ff2020", k: 8 * obst, halo: 1.2 * obst, r: 0.1 }]} />
      {verts.map((a, k) =>
        k === 4 ? null : (
          <group key={k} rotation={[0, a + Math.PI / sides, 0]}>
            <mesh position={[0, CAB_Y + 0.5, 2.55]}>
              <RoundedBoxGeo args={[2.0, 0.8, 0.7]} radius={0.1} />
              <meshPhysicalMaterial color="#2a3446" roughness={0.35} clearcoat={0.6} />
            </mesh>
            <mesh position={[0, CAB_Y + 0.92, 2.5]} rotation={[-0.35, 0, 0]}>
              <RoundedBoxGeo args={[2.0, 0.06, 0.8]} radius={0.025} />
              <meshPhysicalMaterial color="#3a4a62" roughness={0.3} clearcoat={0.8} />
            </mesh>
            <group position={[0, CAB_Y + 1.45, 2.25]} rotation={[0.18, Math.PI, 0]}>
              <mesh>
                <RoundedBoxGeo args={[1.15, 0.75, 0.06]} radius={0.03} />
                <meshPhysicalMaterial color="#10161f" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.035]}>
                <planeGeometry args={[1.05, 0.66]} />
                <meshBasicMaterial map={radar[k % 3]} toneMapped={false} color={glowCol("#ffffff", 1.25)} />
              </mesh>
            </group>
            <mesh position={[0, CAB_Y + 1.45, 2.21]} rotation={[0.18, 0, 0]}>
              <planeGeometry args={[1.1, 0.7]} />
              <meshBasicMaterial color={glowCol("#4facfe", 0.55)} toneMapped={false} />
            </mesh>
          </group>
        ),
      )}
      {/* seated controllers facing the windows (outward), each on a stool */}
      {SEATS.map((a, i) => {
        const pose = poseAt("sit", f, 11 + i);
        const p = { ...pose, lk: 1.4, rk: 1.4, lh: [-1.45, 0, 0.08] as V3, rh: [-1.45, 0, -0.08] as V3, ls: [-0.95, 0, 0.18] as V3, rs: [-0.95, 0, -0.18] as V3, le: -0.7, re: -0.7, head: [0.12 + Math.sin(f * 0.01 + i) * 0.05, Math.sin(f * 0.013 + i * 2) * 0.3, 0] as V3 };
        const r = 1.75;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, CAB_Y + 0.33, r - 0.05]}>
              <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
              <meshPhysicalMaterial color="#1c2230" roughness={0.5} />
            </mesh>
            <mesh position={[0, CAB_Y + 0.18, r - 0.05]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshPhysicalMaterial color="#8a94a3" metalness={0.8} roughness={0.3} />
            </mesh>
            <ToyPerson f={f} seed={21 + i * 7} pose="sit" poseOverride={p} position={[0, CAB_Y + 0.4, r]} heading={0} scale={0.95} outfit="casual" />
          </group>
        );
      })}
      <group rotation={[0, Math.PI / sides, 0]}>
        <mesh position={[0, CAB_Y - 0.62, 3.18]} rotation={[0.42, 0, 0]}>
          <planeGeometry args={[2.3, 0.575]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} color={glowCol("#ffffff", 1.15)} />
        </mesh>
      </group>
      <pointLight position={[0, CAB_Y + 2.2, 0]} color="#bfe2ff" intensity={60} distance={14} decay={2} />
      <pointLight position={[0, CAB_Y + 1.0, 0.8]} color="#ffb070" intensity={18} distance={8} decay={2} />
    </group>
  );
};

/* ---------- airfield with switchable light groups ---------- */
const Airfield: React.FC<{ halo: THREE.Texture; f: number; st: WorldState }> = ({ halo, f, st }) => {
  const guard = Math.sin(f * 0.2) > 0 ? 1 : 0.15;
  const L = useMemo(() => {
    const blue: Lamp[] = [];
    const green: Lamp[] = [];
    const red: Lamp[] = [];
    const lead: Lamp[] = [];
    const white: Lamp[] = [];
    for (let z = PZ + 1.8; z < RZ - 2.6; z += 1.4) {
      blue.push({ p: [TX - 1.65, 0.12, z], c: "#2a6bff", k: 7, halo: 0.32 });
      blue.push({ p: [TX + 1.65, 0.12, z], c: "#2a6bff", k: 7, halo: 0.32 });
    }
    for (let z = PZ; z < STOP_Z - 0.5; z += 0.75) green.push({ p: [TX, 0.03, z], c: "#18ff6a", k: 5, halo: 0.25, r: 0.05 });
    for (let z = STOP_Z + 0.75; z <= RZ; z += 0.75) lead.push({ p: [TX, 0.03, z], c: "#18ff6a", k: 6, halo: 0.28, r: 0.05 });
    for (let x = TX - 1.35; x <= TX + 1.36; x += 0.3) red.push({ p: [x, 0.04, STOP_Z], c: "#ff1a1a", k: 8, halo: 0.35, r: 0.06 });
    red.push({ p: [TX - 2.0, 0.45, STOP_Z], c: "#ff1a1a", k: 9, halo: 0.6, r: 0.09 });
    red.push({ p: [TX + 2.0, 0.45, STOP_Z], c: "#ff1a1a", k: 9, halo: 0.6, r: 0.09 });
    for (let x = -90; x <= 90; x += 3) {
      white.push({ p: [x, 0.06, RZ - 2.6], c: "#fff4e0", k: 4, halo: 0.2, r: 0.035 });
      white.push({ p: [x, 0.06, RZ + 2.6], c: "#fff4e0", k: 4, halo: 0.2, r: 0.035 });
    }
    for (let x = -70; x <= 70; x += 2.5) {
      if (Math.abs(x - TX) > 2) blue.push({ p: [x, 0.1, PZ + 1.4], c: "#2a6bff", k: 5, halo: 0.5 });
      blue.push({ p: [x, 0.1, PZ - 1.4], c: "#2a6bff", k: 5, halo: 0.5 });
      green.push({ p: [x + 1, 0.03, PZ], c: "#18ff6a", k: 4, halo: 0.36, r: 0.045 });
    }
    return { blue, green, red, lead, white };
  }, []);
  const guardLamps: Lamp[] = [
    { p: [TX - 2.0, 0.62, STOP_Z + 0.5], c: "#ffc21a", k: 8 * guard, halo: 0.7 * guard, r: 0.09 },
    { p: [TX + 2.0, 0.62, STOP_Z + 0.5], c: "#ffc21a", k: 8 * (1.15 - guard), halo: 0.7 * (1.15 - guard), r: 0.09 },
  ];
  const yellow = "#e8b72a";
  const holdLen = RZ - 2.5 - PZ;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshPhysicalMaterial color="#0c1418" roughness={0.7} clearcoat={0.15} clearcoatRoughness={0.6} />
      </mesh>
      <mesh position={[0, 0.01, RZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 5]} />
        <meshPhysicalMaterial color="#1b2029" roughness={0.45} clearcoat={0.35} clearcoatRoughness={0.3} />
      </mesh>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[-87 + i * 6, 0.02, RZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 0.14]} />
          <meshStandardMaterial color="#d6dbe2" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.01, PZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 2.8]} />
        <meshPhysicalMaterial color="#181d25" roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      <mesh position={[TX, 0.012, PZ + holdLen / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.0, holdLen]} />
        <meshPhysicalMaterial color="#1b2029" roughness={0.45} clearcoat={0.35} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[TX, 0.02, PZ + holdLen / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, holdLen]} />
        <meshStandardMaterial color={yellow} roughness={0.6} emissive={yellow} emissiveIntensity={0.15} />
      </mesh>
      {[STOP_Z + 0.35, STOP_Z + 0.5].map((z) => (
        <mesh key={z} position={[TX, 0.022, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.0, 0.08]} />
          <meshStandardMaterial color={yellow} emissive={yellow} emissiveIntensity={0.15} />
        </mesh>
      ))}
      {[STOP_Z + 0.75, STOP_Z + 0.9].map((z) =>
        [-1.2, -0.6, 0, 0.6, 1.2].map((dx) => (
          <mesh key={`${z}${dx}`} position={[TX + dx, 0.022, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.32, 0.08]} />
            <meshStandardMaterial color={yellow} emissive={yellow} emissiveIntensity={0.15} />
          </mesh>
        )),
      )}
      {/* unlit lead-on fixtures stay visible as dark studs */}
      {L.lead.map((l, i) => (
        <mesh key={i} position={l.p} geometry={SPHERE} scale={0.045}>
          <meshStandardMaterial color="#1d3a2a" roughness={0.3} />
        </mesh>
      ))}
      {[TX - 2.0, TX + 2.0].map((x) => (
        <mesh key={x} position={[x, 0.3, STOP_Z + 0.25]}>
          <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
          <meshPhysicalMaterial color="#e9c84a" roughness={0.4} />
        </mesh>
      ))}
      <Lamps halo={halo} lamps={L.blue} gain={st.gBlue} />
      <Lamps halo={halo} lamps={L.green} gain={st.gGreen} />
      <Lamps halo={halo} lamps={L.red} gain={st.stop * st.gRed} />
      <Lamps halo={halo} lamps={L.lead} gain={st.lead} />
      <Lamps halo={halo} lamps={L.white} />
      <Lamps halo={halo} lamps={guardLamps} />
    </group>
  );
};

const CityLights: React.FC = () => {
  const geo = useMemo(() => {
    const rnd = prng(66);
    const pos: number[] = [];
    const col: number[] = [];
    const warm = new THREE.Color("#ffcf8a").multiplyScalar(3);
    const cool = new THREE.Color("#9fd0ff").multiplyScalar(2.5);
    for (let i = 0; i < 1400; i++) {
      const a = Math.PI * 0.55 + rnd() * Math.PI * 0.9;
      const r = 120 + rnd() * 60;
      pos.push(Math.sin(a) * r, 0.2 + rnd() * rnd() * 3, Math.cos(a) * r);
      const c = rnd() > 0.3 ? warm : cool;
      col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} onUpdate={(p) => p.layers.set(FX_LAYER)}>
      <pointsMaterial size={2.2} sizeAttenuation={false} vertexColors toneMapped={false} fog={false} />
    </points>
  );
};

export const FilmWorld: React.FC<{ f: number; st: WorldState }> = ({ f, st }) => {
  const halo = useMemo(() => glowTexture(), []);
  const sky = useMemo(() => skyTexture(), []);
  return (
    <>
      <fog attach="fog" args={["#1b2b55", 45, 150]} />
      <mesh>
        <sphereGeometry args={[320, 32, 32]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} toneMapped={false} fog={false} />
      </mesh>
      <hemisphereLight args={["#5a7ab8", "#0a0f18", 0.9]} />
      <directionalLight position={[-30, 25, 30]} color="#b8ccff" intensity={1.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
      <directionalLight position={[40, 6, -80]} color="#ff9a6a" intensity={0.9} />
      <Tower halo={halo} f={f} />
      <Airfield halo={halo} f={f} st={st} />
      <CityLights />
      <Airliner s={st.a} stripe="#4facfe" tail="#4facfe" halo={halo} f={f} />
      <Airliner s={st.b} stripe="#43e97b" tail="#43e97b" halo={halo} f={f + 20} />
      <Airliner s={st.c} stripe="#f093fb" tail="#f093fb" halo={halo} f={f + 40} />
      <Airliner s={st.d} stripe="#f6d365" tail="#f6d365" halo={halo} f={f + 60} />
      <Airliner s={st.appr} stripe="#f093fb" tail="#f093fb" halo={halo} f={f + 80} />
    </>
  );
};
