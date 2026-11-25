// AE-056 film additions on top of the approved cover diorama: animated set pieces for each beat.
// The cover's Diorama renders the static world (with `omit` for pieces re-rendered here).
import React, { useMemo } from "react";
import * as THREE from "three";
import { ToyPerson, type PoseName } from "../../core/polish/Person.tsx";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { Box, Mat, Roof, Wheel, Windows, Chimney, Smoke, Locomotive, Terrace, brickTextures, type BrickTex, type V3 } from "./Diorama.tsx";
import { B, SEC, Y, P, ramp, smooth, backOut, clamp01, trainS, trackPoint, TRACK_A, TRACK_B } from "./timing.ts";

const IRON = "#2e3236";
const WATER = "#3d8e9c";

/** Box spanning two points in the local xy plane (thin rod), at depth z. */
const Rod: React.FC<{ a: [number, number]; b: [number, number]; z: number; w?: number; c?: string; metal?: number }> = ({ a, b, z, w = 0.05, c = IRON, metal = 0.75 }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]} castShadow>
      <boxGeometry args={[w, L, w]} />
      <Mat c={c} p="toyPlastic" metal={metal} rough={0.35} />
    </mesh>
  );
};

const Gear: React.FC<{ r: number; teeth: number; a: number; p: V3; c?: string }> = ({ r, teeth, a, p, c = "#8a6d3b" }) => (
  <group position={p} rotation={[0, 0, a]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[r, r, 0.05, 24]} />
      <Mat c={c} p="toyPlastic" metal={0.8} rough={0.3} />
    </mesh>
    {Array.from({ length: teeth }, (_, i) => (
      <group key={i} rotation={[0, 0, (i / teeth) * Math.PI * 2]}>
        <mesh position={[0, r + 0.022, 0]}>
          <boxGeometry args={[0.04, 0.05, 0.05]} />
          <Mat c={c} p="toyPlastic" metal={0.8} rough={0.3} />
        </mesh>
      </group>
    ))}
  </group>
);

const CoalHeap: React.FC<{ p: V3; n: number; seed: number; s?: number }> = ({ p, n, seed, s = 1 }) => {
  const lumps = useMemo(() => {
    const r = prng(seed);
    return Array.from({ length: n }, (_, i) => {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.28;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: 0.05 + (0.28 - d) * 0.6 + r() * 0.04, r: 0.06 + r() * 0.05, i };
    });
  }, [n, seed]);
  return (
    <group position={p} scale={s}>
      {lumps.map((q) => (
        <mesh key={q.i} position={[q.x, q.y, q.z]} castShadow>
          <icosahedronGeometry args={[q.r, 0]} />
          <meshPhysicalMaterial color="#1f1e21" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} envMapIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
};

/** Draught horse, built facing +x; legs swing with the walk phase. */
const Horse: React.FC<{ p: V3; heading: number; phase: number }> = ({ p, heading, phase }) => {
  const coat = "#7a4f32", dark = "#3b2a20";
  const leg = (x: number, z: number, ph: number, key: string) => (
    <group key={key} position={[x, 0.46, z]} rotation={[0, 0, Math.sin(phase + ph) * 0.38]}>
      <mesh position={[0, -0.21, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.42, 10]} />
        <Mat c={coat} p="clay" />
      </mesh>
      <mesh position={[0, -0.43, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.05, 10]} />
        <Mat c="#e9e0cf" p="clay" />
      </mesh>
    </group>
  );
  const bob = Math.abs(Math.sin(phase)) * 0.012;
  return (
    <group position={p} rotation={[0, heading, 0]}>
      <group position={[0, bob, 0]}>
        <Box s={[0.66, 0.27, 0.25]} p={[0, 0.58, 0]} c={coat} mp="clay" r={0.11} />
        <group position={[0.3, 0.68, 0]} rotation={[0, 0, -0.75]}>
          <Box s={[0.13, 0.36, 0.13]} p={[0, 0.16, 0]} c={coat} mp="clay" r={0.05} />
          <Box s={[0.05, 0.3, 0.03]} p={[-0.06, 0.17, 0]} c={dark} mp="fabric" r={0.012} />
        </group>
        <group position={[0.5, 0.9, 0]} rotation={[0, 0, -0.35]}>
          <Box s={[0.17, 0.14, 0.13]} p={[0.0, 0, 0]} c={coat} mp="clay" r={0.06} />
          <Box s={[0.15, 0.1, 0.1]} p={[0.12, -0.03, 0]} c="#6a4329" mp="clay" r={0.045} />
          <Box s={[0.05, 0.05, 0.08]} p={[0.2, -0.04, 0]} c="#3b2a20" mp="clay" r={0.02} />
          <Box s={[0.035, 0.06, 0.03]} p={[-0.05, 0.08, 0.035]} c={dark} r={0.01} />
          <Box s={[0.035, 0.06, 0.03]} p={[-0.05, 0.08, -0.035]} c={dark} r={0.01} />
          <mesh position={[0.0, 0.025, 0.056]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshPhysicalMaterial color="#111" roughness={0.1} clearcoat={1} />
          </mesh>
          <mesh position={[0.0, 0.025, -0.056]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshPhysicalMaterial color="#111" roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
        <group position={[-0.33, 0.62, 0]} rotation={[0, 0, 0.5 + Math.sin(phase * 0.5) * 0.08]}>
          <Box s={[0.04, 0.3, 0.05]} p={[0, -0.15, 0]} c={dark} mp="fabric" r={0.015} />
        </group>
        {/* collar and harness */}
        <mesh position={[0.25, 0.66, 0]} rotation={[0, Math.PI / 2, -0.75]}>
          <torusGeometry args={[0.1, 0.03, 8, 20]} />
          <Mat c="#5c3b25" p="fabric" />
        </mesh>
      </group>
      {leg(0.22, 0.08, 0, "fl")}
      {leg(0.22, -0.08, Math.PI, "fr")}
      {leg(-0.22, 0.08, Math.PI, "bl")}
      {leg(-0.22, -0.08, 0, "br")}
    </group>
  );
};

/** HOOK: horse pulling a plough with a ploughman behind it, slowly crossing the field. */
const Plough: React.FC<{ t: number; f60: number }> = ({ t, f60 }) => {
  const x = P.horse[0] + 0.45 - t * 0.11;
  const phase = t * Math.PI * 2 * 0.75;
  return (
    <group>
      <Horse p={[x, P.horse[1], P.horse[2]]} heading={Math.PI} phase={phase} />
      {/* traces + plough */}
      <Rod a={[x + 0.05, 0.62]} b={[x + 0.7, 0.3]} z={P.horse[2] + 0.12} w={0.022} c="#4a3526" metal={0} />
      <Rod a={[x + 0.05, 0.62]} b={[x + 0.7, 0.3]} z={P.horse[2] - 0.12} w={0.022} c="#4a3526" metal={0} />
      <group position={[x + 0.78, P.horse[1], P.horse[2]]}>
        <Box s={[0.42, 0.05, 0.05]} p={[0, 0.12, 0]} c="#6b4f36" r={0.015} rot={[0, 0, -0.35]} />
        <Box s={[0.05, 0.3, 0.04]} p={[0.18, 0.28, 0]} c="#6b4f36" r={0.015} rot={[0, 0, -0.6]} />
        <Box s={[0.14, 0.06, 0.08]} p={[-0.18, 0.03, 0]} c="#7d8288" r={0.02} metal={0.8} rough={0.35} />
      </group>
      <ToyPerson f={f60} seed={17} pose="walk" outfit="casual" position={[x + 1.2, P.horse[1], P.horse[2]]} heading={-Math.PI / 2} scale={0.62} look={{ top: "#cbb48a", bottom: "#4d3b2c", height: 1 }} />
      {/* fresh furrow behind the plough */}
      <mesh position={[(x + 0.7 + 3.75) / 2, P.horse[1] + 0.01, P.horse[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.max(0.01, 3.75 - (x + 0.7)), 0.16]} />
        <Mat c="#7a5c3e" p="clay" />
      </mesh>
    </group>
  );
};

/** KONTEKS: a spinner at home on a stool with a spinning wheel. */
const HomeSpinner: React.FC<{ t: number; f60: number }> = ({ t, f60 }) => {
  const [x, y, z] = P.spin;
  const a = t * 3.2;
  return (
    <group>
      <Box s={[0.22, 0.2, 0.2]} p={[x, y + 0.1, z]} c="#8a6a48" r={0.03} />
      <ToyPerson f={f60} seed={52} pose="sit" outfit="casual" position={[x, y + 0.225, z]} heading={0.35} scale={0.62} look={{ top: "#7d4b5c", bottom: "#4b3c31", height: 0.95, hairStyle: 1 }} />
      <group position={[x + 0.42, y, z + 0.15]} rotation={[0, 0.35, 0]}>
        {/* bench */}
        <Box s={[0.5, 0.05, 0.13]} p={[0, 0.2, 0]} c="#7a5a3c" r={0.02} />
        {[-0.2, 0.2].map((q) => (
          <Box key={q} s={[0.04, 0.2, 0.04]} p={[q, 0.1, 0]} c="#6b4f36" r={0.01} rot={[0, 0, q * 0.6]} />
        ))}
        <Box s={[0.04, 0.24, 0.04]} p={[0.08, 0.34, 0]} c="#6b4f36" r={0.01} />
        <Wheel R={0.2} w={0.02} p={[0.08, 0.42, 0.02]} a={a} c="#9a7448" paddles={0} spokes={8} rotY={Math.PI / 2} />
        {/* spindle and the yarn going to the spinner's hand */}
        <Box s={[0.16, 0.025, 0.025]} p={[-0.16, 0.3, 0.02]} c="#6b4f36" r={0.008} />
        <mesh position={[-0.2, 0.3, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <Mat c="#f3ead6" p="fabric" />
        </mesh>
        <Rod a={[-0.24, 0.3]} b={[-0.44, 0.36]} z={0.02} w={0.008} c="#f3ead6" metal={0} />
      </group>
      {/* wool basket */}
      <mesh position={[x - 0.3, y + 0.07, z + 0.18]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.14, 14]} />
        <Mat c="#b0884f" p="fabric" />
      </mesh>
      <mesh position={[x - 0.3, y + 0.15, z + 0.18]} castShadow>
        <icosahedronGeometry args={[0.09, 1]} />
        <Mat c="#f4eee2" p="fabric" />
      </mesh>
    </group>
  );
};

/** KONTEKS: Cromford-type water mill. Facade lifts to show the spinning frames on every floor, all driven by the wheel. */
const FilmMill: React.FC<{ t: number; grain: THREE.Texture; lift: number }> = ({ t, grain, lift }) => {
  const W = 3.0, H = 2.45, D = 1.15, FL = H / 5;
  const wheelA = -t * 0.9;
  const shaftA = t * 4.0;
  return (
    <group position={P.mill} rotation={[0, -0.08, 0]}>
      {/* shell: back, sides, floors */}
      <Box s={[W, H, 0.1]} p={[0, H / 2, -D / 2 + 0.05]} c="#d3bb95" r={0.03} bump={grain} />
      <Box s={[0.1, H, D]} p={[-W / 2 + 0.05, H / 2, 0]} c="#d3bb95" r={0.03} bump={grain} />
      <Box s={[0.1, H, D]} p={[W / 2 - 0.05, H / 2, 0]} c="#d3bb95" r={0.03} bump={grain} />
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} s={[W - 0.12, 0.05, D - 0.1]} p={[0, i * FL + 0.025, 0]} c="#b89a72" r={0.01} />
      ))}
      {/* interior: one line shaft per floor, belts down to a row of water frames */}
      {Array.from({ length: 5 }, (_, i) => {
        const y0 = i * FL + 0.05;
        return (
          <group key={i}>
            <mesh position={[0, y0 + 0.36, -0.32]} rotation={[shaftA, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, W - 0.25, 8]} />
              <Mat c="#6a6f75" p="toyPlastic" metal={0.8} rough={0.3} />
            </mesh>
            {[-1.15, -0.7, -0.25, 0.2, 0.65, 1.05].map((x) => (
              <group key={x} position={[x, y0, 0]}>
                <Box s={[0.32, 0.17, 0.3]} p={[0, 0.09, -0.05]} c="#9a7448" r={0.02} />
                <Box s={[0.3, 0.025, 0.06]} p={[0, 0.19, 0.06]} c="#e9dfc9" r={0.008} />
                {[-0.1, -0.03, 0.04, 0.11].map((sx) => (
                  <mesh key={sx} position={[sx, 0.23, 0.06]}>
                    <cylinderGeometry args={[0.014, 0.018, 0.07, 8]} />
                    <Mat c="#f4eee2" p="fabric" />
                  </mesh>
                ))}
                <Box s={[0.03, 0.2, 0.012]} p={[0.0, 0.27, -0.27]} c="#4a3526" r={0.005} />
              </group>
            ))}
          </group>
        );
      })}
      {/* upright drive shaft from the wheel gear */}
      <mesh position={[W / 2 - 0.2, H / 2, -0.32]} rotation={[0, shaftA, 0]}>
        <cylinderGeometry args={[0.04, 0.04, H - 0.1, 10]} />
        <Mat c="#6a6f75" p="toyPlastic" metal={0.8} rough={0.3} />
      </mesh>
      <Gear r={0.16} teeth={12} a={-wheelA} p={[W / 2 - 0.2, 0.72, 0]} />
      <pointLight position={[0, H * 0.6, 0.3]} intensity={lift * 2.2} distance={4} color="#ffd9a8" />
      {/* lifting facade */}
      <group position={[0, lift * 3.6, D / 2 - 0.05]}>
        <Box s={[W, H, 0.1]} p={[0, H / 2, 0]} c="#d3bb95" r={0.03} bump={grain} />
        <Windows cols={9} rows={5} w={W - 0.2} h={H - 0.25} y0={0.1} z={0.05} />
      </group>
      <Roof w={W} d={D} h={0.5} p={[0, H, 0]} c="#5f666e" slate />
      <Box s={[0.22, 0.24, 0.22]} p={[0, H + 0.5, 0]} c="#efe6d4" r={0.03} />
      <mesh position={[0, H + 0.72, 0]} castShadow>
        <coneGeometry args={[0.18, 0.22, 4]} />
        <Mat c="#6f747a" p="stone" />
      </mesh>
      <Box s={[0.5, 0.45, 1.25]} p={[W / 2 + 0.3, 0.12, 0]} c="#9e8f7a" r={0.03} />
      <Wheel R={0.78} w={0.38} p={[W / 2 + 0.3, 0.72, 0]} a={wheelA} c="#7a5a3c" paddles={20} spokes={8} />
      <Box s={[0.36, 0.1, 1.6]} p={[W / 2 + 0.3, 0.88, -1.25]} c="#8d806f" r={0.03} />
      <mesh position={[W / 2 + 0.3, 0.94, -1.2]}>
        <boxGeometry args={[0.28, 0.02, 1.6]} />
        <meshPhysicalMaterial color={WATER} roughness={0.04} metalness={0.2} clearcoat={1} envMapIntensity={5} />
      </mesh>
      {/* water spilling over the wheel */}
      <mesh position={[W / 2 + 0.3, 0.8, -0.55]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.26, 0.3, 0.03]} />
        <meshPhysicalMaterial color="#7cc4cc" roughness={0.05} transmission={0.3} transparent opacity={0.75} clearcoat={1} />
      </mesh>
    </group>
  );
};

/** MEKANISME: Newcomen atmospheric beam engine pumping a mine. Cutaway house, haystack boiler, open cylinder. */
const Newcomen: React.FC<{ t: number; grain: BrickTex }> = ({ t, grain }) => {
  const th = Math.sin(t * ((Math.PI * 2) / 3.0)) * 0.15;
  const piv: [number, number] = [-0.55, 2.05];
  const inner: [number, number] = [piv[0] + 0.8 * Math.cos(th), piv[1] + 0.8 * Math.sin(th)];
  const outer: [number, number] = [piv[0] - 1.0 * Math.cos(th), piv[1] - 1.0 * Math.sin(th)];
  const flow = clamp01(Math.sin(t * ((Math.PI * 2) / 3.0) - 0.6) * 1.4); // water pulses on the up-stroke
  const zMid = 0;
  return (
    <group position={P.newcomen}>
      {/* engine house, front wall cut away */}
      <Box s={[1.2, 1.75, 0.1]} p={[0, 0.875, -0.4]} c="#ffffff" r={0.03} map={grain.map} bump={grain.bump} bs={1.2} />
      <Box s={[0.14, 2.0, 0.9]} p={[-0.55, 1.0, 0]} c="#ffffff" r={0.03} map={grain.map} bump={grain.bump} bs={1.2} />
      <Box s={[0.1, 1.75, 0.9]} p={[0.55, 0.875, 0]} c="#ffffff" r={0.03} map={grain.map} bump={grain.bump} bs={1.2} />
      <Box s={[1.2, 0.4, 0.1]} p={[0, 0.2, 0.4]} c="#ffffff" r={0.03} map={grain.map} bump={grain.bump} bs={1.2} />
      <Box s={[1.25, 0.06, 0.45]} p={[0, 1.78, -0.22]} c="#55585e" r={0.02} />
      {/* haystack boiler + fire glow */}
      <mesh position={[0.25, 0.32, 0]} scale={[1, 0.85, 1]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <Mat c="#b8743f" p="toyPlastic" metal={0.6} rough={0.35} />
      </mesh>
      <mesh position={[0.25, 0.08, 0.27]}>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshBasicMaterial color="#ff8a3a" toneMapped={false} />
      </mesh>
      {/* open-topped cylinder */}
      <mesh position={[0.25, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.58, 20, 1, true]} />
        <meshPhysicalMaterial color="#3a3d42" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} envMapIntensity={2} />
      </mesh>
      <mesh position={[0.25, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
        <Mat c="#3a3d42" p="toyPlastic" metal={0.8} rough={0.3} />
      </mesh>
      {/* cold-water jet pipe into the cylinder */}
      <Rod a={[0.5, 1.5]} b={[0.32, 1.05]} z={0.12} w={0.03} c="#4d6c78" />
      {/* beam */}
      <group position={[piv[0], piv[1], zMid]} rotation={[0, 0, th]}>
        <Box s={[1.95, 0.13, 0.15]} p={[-0.1, 0, 0]} c="#5b4331" r={0.03} />
        <Box s={[0.12, 0.1, 0.2]} p={[0, -0.06, 0]} c={IRON} r={0.02} metal={0.75} rough={0.35} />
      </group>
      {/* piston chain to the inner end, pump rod from the outer end */}
      <Rod a={[0.25, Math.max(0.95, inner[1] - 0.95)]} b={inner} z={zMid} w={0.04} />
      <Rod a={[outer[0], -0.1]} b={outer} z={zMid} w={0.05} c="#5b4331" metal={0} />
      {/* mine shaft head */}
      <group position={[-1.55, 0, 0]}>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.24, 24]} />
          <meshBasicMaterial color="#141210" />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.04, 8, 24]} />
          <Mat c="#9e8f7a" p="stone" />
        </mesh>
        {[-0.3, 0.3].map((z) => (
          <Box key={z} s={[0.05, 0.75, 0.05]} p={[0.0, 0.37, z]} c="#5b4331" r={0.012} />
        ))}
        <Box s={[0.06, 0.06, 0.66]} p={[0, 0.74, 0]} c="#5b4331" r={0.012} />
        {/* outflow trough to the terrace edge */}
        <Box s={[0.16, 0.08, 1.8]} p={[0, 0.06, 1.15]} c="#8d806f" r={0.02} />
        <mesh position={[0, 0.105, 1.15]} scale={[1, 0.2 + flow, 1]}>
          <boxGeometry args={[0.11, 0.02, 1.78]} />
          <meshPhysicalMaterial color={WATER} roughness={0.04} clearcoat={1} envMapIntensity={4} />
        </mesh>
        <mesh position={[0, -0.33, 2.08]} scale={[0.3 + flow * 0.7, 1, 0.3 + flow * 0.7]}>
          <cylinderGeometry args={[0.04, 0.06, 0.75, 10]} />
          <meshPhysicalMaterial color="#7cc4cc" roughness={0.05} transparent opacity={0.8} clearcoat={1} />
        </mesh>
      </group>
      <CoalHeap p={[0.95, 0, 0.25]} n={26} seed={3} s={1.15} />
    </group>
  );
};

/** MEKANISME: Watt rotative engine: beam, connecting rod, sun-and-planet gear, flywheel, separate condenser in a cold tank. */
export const WATT_ROT = -0.25;
export const WATT_LOCAL = { condenser: [-0.15, 0.62, 0.8] as V3, flywheel: [1.35, 0.9, 0.42] as V3 };
const WattEngine: React.FC<{ t: number; grain: BrickTex }> = ({ t, grain }) => {
  const phi = t * 1.25;
  const C: [number, number] = [1.35, 0.9];
  const rr = 0.26;
  const piv: [number, number] = [0.5, 2.25];
  const pl: [number, number] = [C[0] + rr * Math.cos(phi), C[1] + rr * Math.sin(phi)];
  const th = Math.asin(Math.max(-1, Math.min(1, (pl[1] + 1.35 - piv[1]) / 0.85)));
  const end: [number, number] = [piv[0] + 0.85 * Math.cos(th), piv[1] + 0.85 * Math.sin(th)];
  const rodAng = Math.atan2(end[1] - pl[1], end[0] - pl[0]);
  return (
    <group position={P.watt} rotation={[0, WATT_ROT, 0]}>
      <Box s={[1.0, 2.1, 1.1]} p={[0, 1.05, 0]} c="#ffffff" r={0.04} map={grain.map} bump={grain.bump} bs={1.2} />
      <Windows cols={1} rows={2} w={1.0} h={1.5} y0={0.3} z={0.555} ww={0.22} wh={0.42} frame="#e7d9c0" />
      <Roof w={1.0} d={1.1} h={0.4} p={[0, 2.1, 0]} c="#55585e" rotY={Math.PI / 2} slate />
      {/* bearing block and beam */}
      <Box s={[0.18, 0.16, 0.22]} p={[0.5, 2.15, 0.3]} c={IRON} r={0.03} metal={0.75} rough={0.35} />
      <group position={[piv[0], piv[1], 0.3]} rotation={[0, 0, th]}>
        <Box s={[1.2, 0.13, 0.13]} p={[0.3, 0, 0]} c={IRON} r={0.03} metal={0.75} rough={0.35} />
      </group>
      <Rod a={pl} b={end} z={0.44} w={0.06} />
      {/* flywheel + sun (on the axle) + planet (fixed to the rod) */}
      <Wheel R={0.75} w={0.12} p={[C[0], C[1], 0.3]} a={-2 * phi} c={IRON} paddles={0} spokes={6} iron rotY={Math.PI / 2} />
      <Gear r={0.11} teeth={10} a={2 * phi} p={[C[0], C[1], 0.46]} c="#b38a4a" />
      <Gear r={0.11} teeth={10} a={rodAng} p={[pl[0], pl[1], 0.46]} c="#c99b52" />
      <Box s={[0.2, 0.6, 0.5]} p={[C[0], 0.3, 0.3]} c="#8e8274" r={0.03} />
      {/* separate condenser in a cold-water tank, piped from the house */}
      <group position={[-0.15, 0, 0.8]}>
        <Box s={[0.6, 0.3, 0.36]} p={[0.05, 0.15, 0]} c="#9e8f7a" r={0.03} />
        <mesh position={[0.05, 0.29, 0]}>
          <boxGeometry args={[0.52, 0.02, 0.28]} />
          <meshPhysicalMaterial color={WATER} roughness={0.04} clearcoat={1} envMapIntensity={4} />
        </mesh>
        <mesh position={[-0.08, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.36, 18]} />
          <Mat c="#b8743f" p="toyPlastic" metal={0.75} rough={0.3} />
        </mesh>
        <mesh position={[0.17, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.3, 16]} />
          <Mat c="#7d8288" p="toyPlastic" metal={0.8} rough={0.3} />
        </mesh>
        <mesh position={[-0.08, 0.66, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 10]} />
          <Mat c="#b8743f" p="toyPlastic" metal={0.75} rough={0.3} />
        </mesh>
      </group>
      <CoalHeap p={[-0.78, 0, 0.45]} n={7} seed={8} s={0.8} />
    </group>
  );
};

/** World position of a point given in Watt-engine local coordinates. */
export const wattWorld = (l: V3): V3 => {
  const c = Math.cos(WATT_ROT), s = Math.sin(WATT_ROT);
  return [P.watt[0] + l[0] * c + l[2] * s, P.watt[1] + l[1], P.watt[2] - l[0] * s + l[2] * c];
};

/** Walking figure along a straight line, then standing. */
const Walker: React.FC<{ f60: number; seed: number; from: V3; dir: [number, number]; v: number; t0: number; dist: number; t: number; look: object; scale?: number; until?: number }> = ({ f60, seed, from, dir, v, t0, dist, t, look, scale = 0.62, until = 1e9 }) => {
  const tt = Math.min(t, until);
  const d = Math.min(dist, Math.max(0, (tt - t0) * v));
  const moving = t >= t0 && t < until && d < dist;
  const pose: PoseName = moving ? "walk" : "stand";
  const heading = Math.atan2(dir[0], dir[1]);
  return <ToyPerson f={f60} seed={seed} pose={pose} outfit="casual" position={[from[0] + dir[0] * d, from[1], from[2] + dir[1] * d]} heading={heading} scale={scale} look={look as never} />;
};

/** Paper notice board with text (canvas texture), on two posts. */
const Notice: React.FC<{ p: V3; drop: number; font: string }> = ({ p, drop, font }) => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 320;
    const c = cv.getContext("2d")!;
    c.fillStyle = "#f3ead6";
    c.fillRect(0, 0, 512, 320);
    c.strokeStyle = "#5b4331";
    c.lineWidth = 10;
    c.strokeRect(12, 12, 488, 296);
    c.fillStyle = "#2a2522";
    c.textAlign = "center";
    c.font = `800 64px ${font}`;
    c.fillText("ATURAN", 256, 112);
    c.fillText("PABRIK", 256, 182);
    c.fillStyle = "#8a7a66";
    for (let i = 0; i < 3; i++) c.fillRect(110, 220 + i * 26, 292 - i * 60, 8);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [font]);
  if (drop <= 0) return null;
  const y = (1 - backOut(drop, 1.6)) * 1.4;
  return (
    <group position={[p[0], p[1] + y, p[2]]}>
      {[-0.36, 0.36].map((x) => (
        <Box key={x} s={[0.05, 0.7, 0.05]} p={[x, 0.35, 0]} c="#5b4331" r={0.012} />
      ))}
      <mesh position={[0, 0.6, 0.03]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.03]} />
        <meshPhysicalMaterial attach="material-0" color="#e7dcc3" />
        <meshPhysicalMaterial attach="material-1" color="#e7dcc3" />
        <meshPhysicalMaterial attach="material-2" color="#e7dcc3" />
        <meshPhysicalMaterial attach="material-3" color="#e7dcc3" />
        <meshPhysicalMaterial attach="material-4" map={tex} roughness={0.85} sheen={0.2} />
        <meshPhysicalMaterial attach="material-5" color="#e7dcc3" />
      </mesh>
    </group>
  );
};

/** PAYOFF: clock tower on the steam works roof; hands race through the shift. */
const ClockTower: React.FC<{ t: number }> = ({ t }) => {
  const race = smooth(ramp(t, B.jam - 0.1, B.anak + 0.3));
  const minute = -(0.4 + race * Math.PI * 2 * 3 + t * 0.05);
  const hour = minute / 12 - 0.9;
  const base: V3 = [P.works[0], P.works[1] + 1.5, P.works[2] + 0.36];
  return (
    <group position={base}>
      <Box s={[0.62, 1.25, 0.62]} p={[0, 0.625, 0]} c="#c6704f" r={0.04} />
      <mesh position={[0, 1.42, 0]} castShadow>
        <coneGeometry args={[0.48, 0.42, 4]} />
        <meshPhysicalMaterial color="#55585e" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <group position={[0, 0.85, 0.32]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.03, 40]} />
          <meshPhysicalMaterial color="#f7f1e3" roughness={0.4} clearcoat={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <torusGeometry args={[0.25, 0.022, 8, 40]} />
          <Mat c="#b38a4a" p="toyPlastic" metal={0.85} rough={0.25} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]}>
            <mesh position={[0, 0.2, 0.02]}>
              <boxGeometry args={[i % 3 === 0 ? 0.03 : 0.015, 0.05, 0.01]} />
              <meshBasicMaterial color="#2a2522" />
            </mesh>
          </group>
        ))}
        <group rotation={[0, 0, hour]}>
          <mesh position={[0, 0.07, 0.03]}>
            <boxGeometry args={[0.03, 0.15, 0.01]} />
            <meshBasicMaterial color="#1f2426" />
          </mesh>
        </group>
        <group rotation={[0, 0, minute]}>
          <mesh position={[0, 0.1, 0.04]}>
            <boxGeometry args={[0.018, 0.21, 0.01]} />
            <meshBasicMaterial color="#1f2426" />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
          <meshBasicMaterial color="#1f2426" />
        </mesh>
      </group>
    </group>
  );
};

const Gate: React.FC<{ grain: BrickTex }> = ({ grain }) => (
  <group position={P.gate}>
    {[-0.45, 0.45].map((x) => (
      <Box key={x} s={[0.18, 0.8, 0.18]} p={[x, 0.4, 0]} c="#ffffff" r={0.03} map={grain.map} bump={grain.bump} bs={1} />
    ))}
    <mesh position={[0, 0.82, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.45, 0.025, 8, 24, Math.PI]} />
      <Mat c={IRON} p="toyPlastic" metal={0.8} rough={0.35} />
    </mesh>
  </group>
);

/** PAYOFF: the town swells: new row houses rise, more chimneys and smoke. */
const CityGrowth: React.FC<{ t: number; bc: BrickTex }> = ({ t, bc }) => {
  const rows: { p: V3; n: number; rot: number }[] = [
    { p: [1.25, Y.mid, -0.9], n: 6, rot: -0.12 },
    { p: [1.45, Y.mid, -1.75], n: 6, rot: -0.12 },
    { p: [3.55, Y.front, 1.55], n: 4, rot: -0.1 },
    { p: [-5.2, Y.front, 2.1], n: 3, rot: 0.15 },
  ];
  const chims: { p: V3; h: number }[] = [
    { p: [-2.1, Y.back, -6.0], h: 2.5 },
    { p: [1.7, Y.back, -5.0], h: 2.2 },
  ];
  return (
    <group>
      {rows.map((r, i) => {
        const g = ramp(t, B.perubahan - 0.2 + i * 0.4, B.perubahan + 0.9 + i * 0.4);
        if (g <= 0) return null;
        return (
          <group key={i} position={r.p} scale={[1, Math.max(0.01, backOut(g, 1.2)), 1]}>
            <Terrace p={[0, 0, 0]} n={r.n} rotY={r.rot} />
          </group>
        );
      })}
      {chims.map((c, i) => {
        const g = ramp(t, B.perubahan + 0.3 + i * 0.5, B.perubahan + 1.6 + i * 0.5);
        if (g <= 0) return null;
        return (
          <group key={i}>
            <group position={c.p} scale={[1, Math.max(0.01, outCubicSafe(g)), 1]}>
              <Chimney p={[0, 0, 0]} h={c.h} r={0.24} grain={bc} />
            </group>
            {g >= 1 && <Smoke p={[c.p[0], c.p[1] + c.h + 0.05, c.p[2]]} t={t - B.perubahan} seed={61 + i} n={6} scale={0.8} />}
          </group>
        );
      })}
    </group>
  );
};
const outCubicSafe = (x: number) => 1 - Math.pow(1 - x, 3);

/** REVEAL: the locomotive rolls Liverpool -> Manchester. */
const Train: React.FC<{ t: number }> = ({ t }) => {
  const s = trainS(t);
  const [x, z] = trackPoint(s);
  const ang = -Math.atan2(TRACK_B[1] - TRACK_A[1], TRACK_B[0] - TRACK_A[0]);
  const dist = (s - 2.4) / 1.3;
  const dir: [number, number] = [Math.cos(-ang), Math.sin(-ang)];
  const chim: V3 = [x + dir[0] * 0.62, Y.back + 2.1, z + dir[1] * 0.62];
  return (
    <group>
      <group position={[x, Y.back + 0.15, z]} scale={1.3}>
        <Locomotive p={[0, 0, 0]} rotY={ang} dist={dist} />
      </group>
      <Smoke p={chim} t={t * 1.6} seed={29} n={7} scale={0.6} />
    </group>
  );
};

export const OMIT = ["mill", "engine", "loco", "people", "tree4", "tree5", "tree6", "tree7", "smokeW"];

export const FilmWorld: React.FC<{ t: number; f60: number; font: string }> = ({ t, f60, font }) => {
  const stone = useSurfaceGrain(31, 0.75, 6);
  const bn = useMemo(() => brickTextures(43, 1.4, 2.2), []);
  const bw = useMemo(() => brickTextures(37, 1.2, 2.5), []);
  const bc = useMemo(() => brickTextures(29, 2, 6), []);
  const bg = useMemo(() => brickTextures(47, 0.6, 1.2), []);
  const lift = smooth(ramp(t, B.mesinPintal + 0.1, B.mesinPintal + 1.1)) * (1 - smooth(ramp(t, B.kini - 0.15, B.kini)));
  const street = Y.mid;
  const workers = t < SEC.MEKANISME[0] + 0.6;
  const migrants = t >= B.orang - 1.2;
  const kids = t >= B.anak - 1.4;
  return (
    <group>
      <Plough t={t} f60={f60} />
      <HomeSpinner t={t} f60={f60} />
      {/* hidden while the camera is on the Watt engine (mill wheel would fill the foreground) */}
      {!(t >= B.james - 0.1 && t < B.pabrik1 - 0.1) && <FilmMill t={t} grain={stone} lift={lift} />}
      {/* hidden during the gate shot (its roof would sit in the foreground) */}
      {!(t >= B.anak - 0.15 && t < SEC.OUTRO[0]) && <Newcomen t={t} grain={bn} />}
      {/* west chimney smoke from the cover, kept out of the clock close-up */}
      {!(t >= B.jam - 0.1 && t < B.anak - 0.15) && <Smoke p={[-5.0, Y.back + 2.75, -3.3]} t={t + 2.0 + 3} seed={13} n={6} scale={0.8} />}
      <WattEngine t={t} grain={bw} />
      <Train t={t} />
      <ToyPerson f={f60} seed={41} pose="wave" outfit="casual" position={[1.95, Y.back, -2.85]} heading={0.3} scale={0.6} look={{ top: "#2f4a3e", bottom: "#2c2a2a", height: 1 }} />
      <CityGrowth t={t} bc={bc} />
      <ClockTower t={t} />
      {t > B.jam + 0.3 && t < B.jam + 4 && <Smoke p={[P.works[0] + 0.5, P.works[1] + 2.0, P.works[2] - 0.5]} t={(t - B.jam) * 2} seed={71} n={4} scale={0.45} />}
      <Gate grain={bg} />
      <Notice p={[P.gate[0] - 0.95, P.gate[1], P.gate[2] - 0.2]} drop={ramp(t, B.aturan - 0.05, B.aturan + 0.55)} font={font} />
      {/* KONTEKS: workers leave their row houses for the mill */}
      {workers &&
        [0, 1, 2, 3].map((i) => (
          <Walker key={`w${i}`} f60={f60} seed={21 + i * 7} t={t} t0={B.kini - 1.4 + i * 0.12} from={[3.2 + i * 0.42, street, 0.8 + (i % 2) * 0.16]} dir={[-1, 0]} v={0.5} dist={2.2} look={{ top: ["#3c5a7a", "#b98c4a", "#7d4b5c", "#5f6b4a"][i], bottom: "#3a332c", height: i === 1 ? 0.7 : 1 }} />
        ))}
      {/* PAYOFF: families move to town */}
      {migrants &&
        [0, 1, 2, 3].map((i) => (
          <Walker key={`m${i}`} f60={f60} seed={81 + i * 5} t={t} t0={B.orang - 1.2 + i * 0.1} from={[-0.9 - i * 0.45, street, 0.82 + (i % 2) * 0.18]} dir={[1, 0]} v={0.55} dist={3.6} look={{ top: ["#8c3b2e", "#d9cdb0", "#2f4a3e", "#b98c4a"][i], bottom: "#463a30", height: i === 3 ? 0.68 : 1 }} />
        ))}
      {/* PAYOFF: children walk to the factory gate, until the factory rule goes up */}
      {kids &&
        [0, 1, 2].map((i) => {
          return (
            <Walker key={`k${i}`} f60={f60} seed={91 + i * 3} t={t} until={B.aturan + 0.4} t0={B.anak - 1.4 + i * 0.25} from={[-4.5 - i * 0.4, Y.back, -2.45 - (i % 2) * 0.12]} dir={[1, 0]} v={0.5} dist={1.3} look={{ top: ["#6d5a45", "#3c5a7a", "#8c3b2e"][i], bottom: "#3a332c", height: 0.64 }} />
          );
        })}
    </group>
  );
};
