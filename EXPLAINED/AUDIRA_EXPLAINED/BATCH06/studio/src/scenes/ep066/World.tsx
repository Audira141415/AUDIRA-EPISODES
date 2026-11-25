// AE-066 world: control tower cab (glass octagon + console), night airfield (runway, taxiway with
// blue edge / green centre / red stop bar), two airliners, floating frosted-glass strip HUD.
// Lighting colours follow RESEARCH_REPORT "Saran visual akurat"; lead-on lights past the stop bar
// stay dark because the waiting aircraft is not yet cleared.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { prng } from "../../core/materials/textures.ts";
import { glowTexture, hudTexture, labelTexture, radarTexture, skyTexture } from "./textures.ts";

const glowCol = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

/* ---------- light points (emissive bulb + additive halo on FX layer) ---------- */
type Lamp = { p: [number, number, number]; c: string; k?: number; halo?: number; r?: number };

const Lamps: React.FC<{ lamps: Lamp[]; halo: THREE.Texture }> = ({ lamps, halo }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  return (
    <>
      {lamps.map((l, i) => (
        <group key={i} position={l.p}>
          <mesh geometry={geo} scale={l.r ?? 0.07}>
            <meshBasicMaterial color={glowCol(l.c, l.k ?? 6)} toneMapped={false} />
          </mesh>
          {(l.halo ?? 0.7) > 0 && (
            <sprite scale={l.halo ?? 0.7} onUpdate={(s) => s.layers.set(FX_LAYER)}>
              <spriteMaterial map={halo} color={glowCol(l.c, 1.6)} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
    </>
  );
};

/* ---------- airliner (nose along local +x) ---------- */
export const Airliner: React.FC<{ tail: string; landing?: boolean; halo: THREE.Texture; f: number }> = ({ tail, landing, halo, f }) => {
  const beacon = 0.5 + 0.5 * Math.sin(f * 0.25);
  const white = { ...POLISH.brickABS, color: "#eef2f7" };
  const wing = { ...POLISH.toyPlastic, color: "#c9d1dc" };
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 4.6, 28]} />
        <meshPhysicalMaterial {...white} />
      </mesh>
      <mesh position={[2.3, 0, 0]} scale={[0.95, 0.36, 0.36]} castShadow>
        <sphereGeometry args={[1, 28, 18]} />
        <meshPhysicalMaterial {...white} />
      </mesh>
      {/* cockpit glazing */}
      <mesh position={[2.72, 0.13, 0]} rotation={[0, 0, -0.5]}>
        <RoundedBoxGeo args={[0.28, 0.12, 0.42]} radius={0.05} />
        <meshPhysicalMaterial color="#0b1522" roughness={0.08} clearcoat={1} metalness={0.2} />
      </mesh>
      {/* cabin window band */}
      <mesh position={[0.2, 0.1, 0]}>
        <boxGeometry args={[3.8, 0.07, 0.725]} />
        <meshPhysicalMaterial color="#1a2a3c" roughness={0.2} emissive="#ffcf8a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-3.0, 0.08, 0]} rotation={[0, 0, Math.PI / 2 + 0.08]} castShadow>
        <cylinderGeometry args={[0.36, 0.1, 1.5, 28]} />
        <meshPhysicalMaterial {...white} />
      </mesh>
      {/* swept wings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[-0.15, -0.16, s * 1.6]} rotation={[0, s * 0.5, 0]} castShadow>
            <RoundedBoxGeo args={[0.95, 0.08, 3.0]} radius={0.035} />
            <meshPhysicalMaterial {...wing} />
          </mesh>
          <mesh position={[0.55, -0.42, s * 1.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.17, 0.85, 22]} />
            <meshPhysicalMaterial color="#aeb7c3" metalness={0.6} roughness={0.25} clearcoat={0.6} />
          </mesh>
          <mesh position={[-3.2, 0.16, s * 0.6]} rotation={[0, s * 0.5, 0]}>
            <RoundedBoxGeo args={[0.5, 0.05, 1.1]} radius={0.02} />
            <meshPhysicalMaterial {...wing} />
          </mesh>
        </group>
      ))}
      {/* fin in neutral (non-airline) prism colour */}
      <mesh position={[-3.05, 0.95, 0]} rotation={[0, 0, -0.55]} castShadow>
        <RoundedBoxGeo args={[1.1, 1.4, 0.07]} radius={0.03} />
        <meshPhysicalMaterial color={tail} roughness={0.25} clearcoat={0.9} metalness={0.1} />
      </mesh>
      <Lamps
        halo={halo}
        lamps={[
          { p: [-0.75, -0.14, -3.05], c: "#ff2a2a", k: 7, halo: 0.6, r: 0.06 },
          { p: [-0.75, -0.14, 3.05], c: "#20ff6a", k: 7, halo: 0.6, r: 0.06 },
          { p: [0.2, 0.4, 0], c: "#ff3030", k: 3 + 6 * beacon, halo: 0.5 + 0.4 * beacon, r: 0.05 },
          { p: [2.0, -0.42, 0], c: "#fff3d6", k: landing ? 14 : 8, halo: landing ? 3.2 : 1.0, r: 0.07 },
          ...(landing ? [{ p: [0.6, -0.3, -1.4] as [number, number, number], c: "#fff3d6", k: 10, halo: 2.0, r: 0.06 }, { p: [0.6, -0.3, 1.4] as [number, number, number], c: "#fff3d6", k: 10, halo: 2.0, r: 0.06 }] : []),
        ]}
      />
    </group>
  );
};

/* ---------- control tower ---------- */
const CAB_Y = 8.5;
const Tower: React.FC<{ halo: THREE.Texture; f: number }> = ({ halo, f }) => {
  const grain = useSurfaceGrain(66, 0.18, 4);
  const radar = useMemo(() => [0, 1, 2].map((v) => radarTexture(v)), []);
  const label = useMemo(() => labelTexture(), []);
  const obst = 0.6 + 0.4 * Math.sin(f * 0.12);
  const sides = 8;
  const verts = Array.from({ length: sides }, (_, k) => (k * Math.PI * 2) / sides);
  return (
    <group position={[5.2, 0, -13]}>
      {/* shaft */}
      <mesh position={[0, (CAB_Y - 1.4) / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.6, CAB_Y - 1.4, 40]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#c4ccd8" roughnessMap={grain} />
      </mesh>
      {/* lit stair slot */}
      <mesh position={[0, (CAB_Y - 1.4) / 2 + 0.3, 1.42]}>
        <boxGeometry args={[0.18, CAB_Y - 3.2, 0.05]} />
        <meshBasicMaterial color={glowCol("#9fd8ff", 1.6)} toneMapped={false} />
      </mesh>
      {/* equipment level */}
      <mesh position={[0, CAB_Y - 0.7, 0]} castShadow>
        <cylinderGeometry args={[3.35, 2.0, 1.4, sides, 1]} />
        <meshPhysicalMaterial color="#d9e0ea" roughness={0.45} clearcoat={0.5} />
      </mesh>
      {/* cab floor */}
      <mesh position={[0, CAB_Y + 0.05, 0]}>
        <cylinderGeometry args={[3.3, 3.3, 0.1, sides]} />
        <meshPhysicalMaterial color="#1b2433" roughness={0.6} />
      </mesh>
      {/* glazing: outward-leaning octagon */}
      <mesh position={[0, CAB_Y + 1.45, 0]}>
        <cylinderGeometry args={[3.95, 3.3, 2.8, sides, 1, true]} />
        <meshPhysicalMaterial color="#9fd8ff" roughness={0.04} metalness={0} transparent opacity={0.18} clearcoat={1} envMapIntensity={1.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* mullions */}
      {verts.map((a, k) => (
        <group key={k} rotation={[0, a, 0]}>
          <mesh position={[0, CAB_Y + 1.45, 3.62]} rotation={[0.21, 0, 0]}>
            <RoundedBoxGeo args={[0.12, 2.9, 0.12]} radius={0.04} />
            <meshPhysicalMaterial color="#e6ebf2" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* roof + soffit glow */}
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

      {/* console ring following the windows */}
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
            {/* monitor facing inward */}
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
            {/* back of monitor visible from outside: thin cyan rim */}
            <mesh position={[0, CAB_Y + 1.45, 2.21]} rotation={[0.18, 0, 0]}>
              <planeGeometry args={[1.1, 0.7]} />
              <meshBasicMaterial color={glowCol("#4facfe", 0.55)} toneMapped={false} />
            </mesh>
          </group>
        ),
      )}
      {/* AUDIRA label on the outside of the console band, facing camera side */}
      <group rotation={[0, Math.PI / sides + 0.0, 0]}>
        <mesh position={[0, CAB_Y - 0.62, 3.18]} rotation={[0.42, 0, 0]}>
          <planeGeometry args={[2.3, 0.575]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} color={glowCol("#ffffff", 1.15)} />
        </mesh>
      </group>
      {/* interior light */}
      <pointLight position={[0, CAB_Y + 2.2, 0]} color="#bfe2ff" intensity={60} distance={14} decay={2} />
      <pointLight position={[0, CAB_Y + 1.0, 0]} color="#ffb070" intensity={18} distance={8} decay={2} />
    </group>
  );
};

/* ---------- airfield ---------- */
// Runway along x at z = RZ (nearer the camera); the holding taxiway runs from the parallel taxiway
// (z = PZ, tower side) toward the runway (+z). Order from taxiway to runway: stop bar, two solid
// yellow lines, two dashed lines (dashed side faces the runway).
const TX = -2.5; // holding taxiway centre x
const RZ = 6; // runway centre z
const PZ = -9; // parallel taxiway centre z
const STOP_Z = 0.4;
const Airfield: React.FC<{ halo: THREE.Texture; f: number }> = ({ halo, f }) => {
  const guard = Math.sin(f * 0.2) > 0 ? 1 : 0.15; // runway guard lights flash alternately
  const lamps = useMemo(() => {
    const L: Lamp[] = [];
    // holding taxiway: blue edges, green centre up to the stop bar (lead-on beyond stays dark)
    for (let z = PZ + 1.8; z < RZ - 2.6; z += 1.4) {
      L.push({ p: [TX - 1.65, 0.12, z], c: "#2a6bff", k: 7, halo: 0.6 });
      L.push({ p: [TX + 1.65, 0.12, z], c: "#2a6bff", k: 7, halo: 0.6 });
    }
    for (let z = PZ; z < STOP_Z - 0.5; z += 0.75) L.push({ p: [TX, 0.03, z], c: "#18ff6a", k: 5, halo: 0.45, r: 0.05 });
    for (let x = TX - 1.35; x <= TX + 1.36; x += 0.3) L.push({ p: [x, 0.04, STOP_Z], c: "#ff1a1a", k: 8, halo: 0.6, r: 0.06 });
    L.push({ p: [TX - 2.0, 0.45, STOP_Z], c: "#ff1a1a", k: 9, halo: 1.0, r: 0.09 });
    L.push({ p: [TX + 2.0, 0.45, STOP_Z], c: "#ff1a1a", k: 9, halo: 1.0, r: 0.09 });
    // runway edge lights (white)
    for (let x = -90; x <= 90; x += 3) {
      L.push({ p: [x, 0.06, RZ - 2.6], c: "#fff4e0", k: 4, halo: 0.32, r: 0.035 });
      L.push({ p: [x, 0.06, RZ + 2.6], c: "#fff4e0", k: 4, halo: 0.32, r: 0.035 });
    }
    // parallel taxiway (tower side): blue edges + green centre
    for (let x = -70; x <= 70; x += 2) {
      if (Math.abs(x - TX) > 2) L.push({ p: [x, 0.1, PZ + 1.4], c: "#2a6bff", k: 5, halo: 0.5 });
      L.push({ p: [x, 0.1, PZ - 1.4], c: "#2a6bff", k: 5, halo: 0.5 });
      L.push({ p: [x + 1, 0.03, PZ], c: "#18ff6a", k: 4, halo: 0.36, r: 0.045 });
    }
    return L;
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
      {/* runway */}
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
      {/* parallel taxiway */}
      <mesh position={[0, 0.01, PZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 2.8]} />
        <meshPhysicalMaterial color="#181d25" roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      {/* holding taxiway */}
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
      {[TX - 2.0, TX + 2.0].map((x) => (
        <mesh key={x} position={[x, 0.3, STOP_Z + 0.25]}>
          <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
          <meshPhysicalMaterial color="#e9c84a" roughness={0.4} />
        </mesh>
      ))}
      <Lamps halo={halo} lamps={lamps} />
      <Lamps halo={halo} lamps={guardLamps} />
    </group>
  );
};

/* ---------- far city lights on horizon ---------- */
const CityLights: React.FC = () => {
  const geo = useMemo(() => {
    const rnd = prng(66);
    const pos: number[] = [];
    const col: number[] = [];
    const warm = new THREE.Color("#ffcf8a").multiplyScalar(3);
    const cool = new THREE.Color("#9fd0ff").multiplyScalar(2.5);
    for (let i = 0; i < 1400; i++) {
      const a = Math.PI * 0.55 + rnd() * Math.PI * 0.9; // behind the tower, wide arc
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

/* ---------- floating frosted-glass HUD panel ---------- */
const HudPanel: React.FC<{ f: number; camPos: THREE.Vector3 }> = ({ f, camPos }) => {
  const hud = useMemo(() => hudTexture(), []);
  const halo = useMemo(() => glowTexture(), []);
  const pos = useMemo(() => new THREE.Vector3(0.2, 8.8, 12.9), []);
  const bob = Math.sin(f * 0.03) * 0.06;
  const ref = React.useRef<THREE.Group>(null);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.lookAt(camPos);
    ref.current.rotateY(0.18);
    ref.current.rotateX(-0.04);
  }, [camPos]);
  const W = 5.2;
  const H = 3.34;
  return (
    <group position={[pos.x, pos.y + bob, pos.z]} ref={ref}>
      {/* coloured backplates behind the glass so the transmission has light to refract */}
      <mesh position={[-1.3, 0.7, -1.1]}>
        <circleGeometry args={[1.55, 64]} />
        <meshBasicMaterial color={glowCol("#4facfe", 0.75)} toneMapped={false} />
      </mesh>
      <mesh position={[1.9, -0.85, -0.9]}>
        <circleGeometry args={[1.2, 64]} />
        <meshBasicMaterial color={glowCol("#f093fb", 0.7)} toneMapped={false} />
      </mesh>
      <mesh>
        <RoundedBoxGeo args={[W, H, 0.12]} radius={0.22} segments={6} />
        <meshPhysicalMaterial color="#e8f1ff" roughness={0.38} metalness={0} transmission={0.97} ior={1.5} thickness={0.8} clearcoat={0.8} clearcoatRoughness={0.1} attenuationColor="#cfe4ff" attenuationDistance={4} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[W * 0.95, H * 0.95]} />
        <meshBasicMaterial map={hud} transparent toneMapped={false} depthWrite={false} color={glowCol("#ffffff", 1.05)} />
      </mesh>
      {/* rim glint */}
      <sprite position={[W / 2 - 0.3, -H / 2 + 0.2, 0.12]} scale={0.9} onUpdate={(s) => s.layers.set(FX_LAYER)}>
        <spriteMaterial map={halo} color={glowCol("#f093fb", 2)} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

/* ---------- full world ---------- */
export const AtcWorld: React.FC<{ f: number; camPos: THREE.Vector3 }> = ({ f, camPos }) => {
  const halo = useMemo(() => glowTexture(), []);
  const sky = useMemo(() => skyTexture(), []);
  const approachX = 7.6 - f * 0.01;
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
      <Airfield halo={halo} f={f} />
      <CityLights />
      {/* aircraft holding short at the stop bar (nose toward the runway, -z) */}
      <group position={[TX, 0.78, STOP_Z - 4.05]} rotation={[0, -Math.PI / 2, 0]}>
        <Airliner tail="#4facfe" halo={halo} f={f} />
        {/* gear */}
        {[[1.9, 0], [-0.3, 0.55], [-0.3, -0.55]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.6, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#444c58" />
          </mesh>
        ))}
      </group>
      {/* aircraft on final approach */}
      <group position={[approachX, 18.2, -43.9]} rotation={[0.05, Math.PI + 0.25, -0.08]} scale={0.6}>
        <Airliner tail="#f093fb" landing halo={halo} f={f + 40} />
      </group>
      <HudPanel f={f} camPos={camPos} />
    </>
  );
};
