// EP42 Samiri — Sinai sets: gurun (camp + golden calf altar), thur (rocky slope to the lit summit),
// tungku (melting furnace close-up), laut (shore, no palms). Same convention as sets.tsx: stage at the origin,
// light toward −z, camera from +z. Models are GLB from the AUDIRA catalog (public/glb/).
import React, { useMemo } from "react";
import { CanvasTexture, Color, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace } from "three";
import { Ground, Water } from "../kits/chronicle/props.tsx";
import { AshColumn, Embers } from "../kits/chronicle/fx.tsx";
import { Flames, Shafts } from "./fxextra.tsx";
import { GOLD, Glb } from "./glb.tsx";
import type { Anchors, SetProps, V3 } from "./sets.tsx";

const hsh = (n: number) => { const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453; return x - Math.floor(x); };
const stoneM = new MeshStandardMaterial({ color: "#6e5c48", roughness: 0.95 });
const dark = new MeshStandardMaterial({ color: "#2a2018", roughness: 1 });
const gold = GOLD();
const tablet = new MeshStandardMaterial({ color: "#c8b898", roughness: 0.9, emissive: "#3a3020", emissiveIntensity: 0.4 });

const Dunes: React.FC<{ z: number; color: string; seed: number; h?: number }> = ({ z, color, seed, h = 40 }) => (
  <group>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[(i - 4) * 110 + (hsh(seed + i) - 0.5) * 60, -h * 0.35, z - hsh(i + seed) * 90]} scale={[110 + hsh(i) * 70, h * (0.5 + hsh(i + 3) * 0.6), 50]}>
        <sphereGeometry args={[1, 28, 10]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    ))}
  </group>
);

let altarTex: CanvasTexture | null = null;
const altarFace = () => {
  if (altarTex) return altarTex;
  const c = document.createElement("canvas");
  c.width = 512; c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5e4c3a"; g.fillRect(0, 0, 512, 192);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${hsh(i) * 0.18})`; g.fillRect(hsh(i * 3) * 512, hsh(i * 7) * 192, 3 + hsh(i) * 8, 2 + hsh(i * 5) * 6); }
  g.strokeStyle = "#c9a052"; g.lineWidth = 4; g.strokeRect(14, 14, 484, 164);
  g.fillStyle = "#e8c46a"; g.font = "bold 64px serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("AUDIRA", 256, 76); g.font = "bold 34px serif"; g.fillText("Q I S S A H", 256, 136);
  altarTex = new CanvasTexture(c); altarTex.colorSpace = SRGBColorSpace;
  return altarTex;
};

/** Stone altar with AUDIRA QISSAH carved on its face, the golden calf on top (or burning, then gone). */
const Altar: React.FC<{ pos: V3; t: number; burn: boolean; calf: boolean }> = ({ pos, t, burn, calf }) => {
  const face = useMemo(() => new MeshStandardMaterial({ map: altarFace(), roughness: 0.85, emissive: new Color("#3a2a12"), emissiveMap: altarFace(), emissiveIntensity: 0.6 }), []);
  return (
    <group position={pos}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow material={[stoneM, stoneM, stoneM, stoneM, face, stoneM] as never}>
        <boxGeometry args={[2.6, 1.1, 1.7]} />
      </mesh>
      <mesh position={[0, 0.06, 0]} material={stoneM} receiveShadow><boxGeometry args={[3.4, 0.12, 2.4]} /></mesh>
      {calf && <Glb name="cow-base" pos={[0, 1.1, 0]} h={2.1} rotY={0.55} material={gold} shadow={false} />}
      {calf && <pointLight position={[0, 2.6, 1.6]} color="#ffc56a" intensity={40} distance={14} decay={2} />}
      {calf && !burn && Array.from({ length: 3 }, (_, i) => {
        // "lenguhan": rings of sound leaving the calf
        const k = ((t * 0.55 + i / 3) % 1);
        return (
          <mesh key={i} position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + k * 9}>
            <torusGeometry args={[0.6, 0.012, 6, 64]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={(1 - k) * 0.55} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
      {burn && (
        <>
          <Flames t={t} at={[{ p: [0, 1.1, 0], h: 4.2 }, { p: [-0.8, 1.0, 0.3], h: 3.0 }, { p: [0.9, 1.0, -0.2], h: 3.4 }]} seed={7} gain={3} />
          <AshColumn t={t + 4} base={[0, 4, 0]} height={34} width={7} count={50} life={6} wind={[0.3, 0.05]} dark="#2a2422" lit="#b0582a" hot="#ffb060" density={0.85} seed={9} />
          <Embers t={t} count={160} box={[-3, 1, -2, 3, 10, 2]} rise={1.6} size={0.1} color="#ffb04a" scale={700} />
        </>
      )}
    </group>
  );
};

const Torch: React.FC<{ pos: V3; t: number; seed: number }> = ({ pos, t, seed }) => (
  <group position={pos}>
    <mesh position={[0, 1.2, 0]} material={dark} castShadow><cylinderGeometry args={[0.05, 0.07, 2.4, 6]} /></mesh>
    <Flames t={t} at={[{ p: [0, 2.4, 0], h: 0.9 }]} seed={seed} gain={2.2} />
  </group>
);

/** gurun: the Israelite camp at Sinai. extras: patung (altar + calf), bakar (calf burning), sendiri (empty ring, no camp), lauh (tablets on the sand). */
export const Gurun: React.FC<SetProps> = ({ t, seed, mood, extras = [] }) => {
  const night = mood === "malam";
  const alone = extras.includes("sendiri");
  const sandC = night ? "#3a2c20" : mood === "siang" ? "#9a7a52" : "#6e5236";
  return (
    <group>
      <Ground size={900} color={sandC} amp={2.6} seed={seed} />
      <Dunes z={-260} color={night ? "#2a2018" : "#7a5a3a"} seed={seed} h={46} />
      <Dunes z={-520} color={night ? "#1e1814" : "#8a6a48"} seed={seed + 3} h={80} />
      {!alone && (
        <>
          <Glb name="soldiers-tent-4bd5b9" pos={[-9, 0, -15]} h={3.4} rotY={0.5} tint="#5a4a38" />
          <Glb name="canvas-ridge-tent-f0df0d" pos={[9.5, 0, -19]} h={2.8} rotY={-0.6} tint="#6a5844" />
          <Glb name="soldiers-tent-4bd5b9" pos={[-17, 0, -30]} h={3.6} rotY={1.1} tint="#4e4032" />
          <Glb name="canvas-ridge-tent-f0df0d" pos={[16, 0, -34]} h={3.0} rotY={0.2} tint="#5a4a38" />
          <Glb name="camel-base" pos={[13, 0, -26]} h={3.0} rotY={-1.2} tint="#2c2219" />
          <Glb name="camel-base" pos={[-6.5, 0, -34]} h={3.1} rotY={1.4} tint="#2c2219" />
          <Torch pos={[-3.6, 0, -6.4]} t={t} seed={seed + 1} />
          <Torch pos={[3.8, 0, -7.0]} t={t} seed={seed + 2} />
        </>
      )}
      {extras.includes("patung") && <Altar pos={[0.2, 0, -10]} t={t} burn={extras.includes("bakar")} calf />}
      {alone && (
        // the circle nobody may cross ("lā misās")
        <mesh position={[0.6, 0.03, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.35, 96]} />
          <meshBasicMaterial color="#ff5a44" transparent opacity={0.75} toneMapped={false} />
        </mesh>
      )}
      {extras.includes("lauh") && (
        <>
          {[[0.1, 0.4, 0.5], [1.05, 0.7, -0.6]].map(([x, z, r], i) => (
            <mesh key={i} position={[x, 0.05, z]} rotation={[-Math.PI / 2 + 0.12, 0, r]} material={tablet} castShadow receiveShadow>
              <boxGeometry args={[0.8, 1.2, 0.12]} />
            </mesh>
          ))}
          <Embers t={t} count={60} box={[-0.5, 0, -0.2, 1.7, 1.2, 1.4]} rise={0.4} size={0.07} color="#d8c0a0" scale={500} />
        </>
      )}
      <Shafts from={[2, 20, -40]} tilt={0.45} len={36} width={12} count={5} color={night ? "#ffd08a" : "#fff0cc"} opacity={night ? 0.07 : 0.1} t={t} />
      <Embers t={t + 5} count={90} box={[-10, 0.2, -12, 10, 3, 6]} rise={0.15} size={0.05} color="#e8cfa0" scale={500} />
    </group>
  );
};
export const GURUN_A: Anchors = { lead: [-1.2, 0, -6.4], second: [-2.6, 0, -2.6], target: [0.2, 1.6, -10], rows: [-5, 5, -6.5, -3], guards: [[-3.2, 0, -4.2], [3.6, 0, -4.6], [-4.6, 0, -6], [5, 0, -6.4]], path: [[2, 0, -26], [-1, 0, 6]], light: [3, 12, -40] };
export const GURUN_SOLO_A: Anchors = { ...GURUN_A, lead: [0.6, 0, -1.2], second: [-0.4, 0, -3.8], rows: [-4, 4, -9, -5.5] };

/** thur: a rocky slope rising to a summit wrapped in light. */
export const Thur: React.FC<SetProps> = ({ t, seed }) => {
  const rocks = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    return { p: [side * (2.6 + hsh(i) * 7), 0, 4 - i * 3.2 - hsh(i + 3) * 2] as V3, h: 1.2 + hsh(i + 7) * 3.2, r: hsh(i + 9) * 6, big: i % 3 === 0 };
  }), []);
  const glow = useMemo(() => new MeshBasicMaterial({ color: new Color("#fff1c8").multiplyScalar(2.2), toneMapped: false, fog: false }), []);
  return (
    <group>
      <Ground size={700} color="#43352a" amp={3.2} seed={seed} />
      {/* the mountain */}
      <mesh position={[0, -20, -150]} scale={[95, 120, 60]} material={new MeshStandardMaterial({ color: "#2e241d", roughness: 1 })}><coneGeometry args={[1, 1, 9]} /></mesh>
      <mesh position={[-60, -20, -190]} scale={[70, 80, 50]} material={new MeshStandardMaterial({ color: "#261e19", roughness: 1 })}><coneGeometry args={[1, 1, 7]} /></mesh>
      <mesh position={[0, 46, -152]} material={glow}><sphereGeometry args={[7, 24, 16]} /></mesh>
      <Shafts from={[0, 60, -150]} tilt={0.05} len={70} width={50} count={7} color="#ffe7b0" opacity={0.16} t={t} />
      {rocks.map((r, i) => <Glb key={i} name={r.big ? "large-coastal-boulder-a2cab1" : "medium-rock-e08405"} pos={r.p} h={r.h} rotY={r.r} tint="#3a2e24" />)}
      <Embers t={t} count={80} box={[-8, 0.3, -20, 8, 4, 4]} rise={0.1} size={0.05} color="#f0dcb0" scale={500} />
    </group>
  );
};
export const THUR_A: Anchors = { lead: [0.4, 0, -3], second: [-1.6, 0, -4], target: [0, 20, -150], rows: [-4, 4, -10, -5], guards: [[-3, 0, -5], [3, 0, -6]], path: [[0.6, 0, 6], [-0.4, 0, -30]], light: [0, 40, -150] };

/** tungku: the melting pot on coals, gold thrown in, molten glow. */
export const Tungku: React.FC<SetProps> = ({ t, seed }) => {
  const molten = useMemo(() => new MeshBasicMaterial({ color: new Color("#ffb43a").multiplyScalar(2.4), toneMapped: false }), []);
  return (
    <group>
      <Ground size={300} color="#2c2018" amp={0.8} seed={seed} />
      <Dunes z={-160} color="#1c1612" seed={seed} h={40} />
      <Glb name="soldiers-tent-4bd5b9" pos={[-6, 0, -9]} h={3.4} rotY={0.4} tint="#3a2e24" />
      <Glb name="cauldron-on-coals-ddbab6" pos={[-0.2, 0, -5.6]} h={1.5} tint="#2a2420" />
      <mesh position={[-0.2, 1.28, -5.6]} rotation={[-Math.PI / 2, 0, 0]} material={molten}><circleGeometry args={[0.52, 40]} /></mesh>
      <pointLight position={[0.1, 2.2, -4.4]} color="#ff9a3a" intensity={30} distance={12} decay={2} />
      <Flames t={t} at={[{ p: [-0.2, 0.1, -5.6], h: 1.1 }, { p: [0.3, 0.1, -5.4], h: 0.8 }, { p: [-0.7, 0.1, -5.8], h: 0.9 }]} seed={seed} gain={2.6} />
      <Embers t={t} count={180} box={[-1.7, 0.5, -6.9, 1.3, 6, -4.4]} rise={1.4} size={0.07} color="#ffb04a" scale={700} />
      {/* the jewellery: coins and ingots on a stone, some falling into the pot */}
      <mesh position={[-1.3, 0.25, -4.3]} material={stoneM} castShadow><boxGeometry args={[1.2, 0.5, 0.9]} /></mesh>
      {Array.from({ length: 7 }, (_, i) => <Glb key={i} name={i % 3 ? "gold-coin-29afc1" : "gold-ingot-85e62e"} pos={[-1.7 + hsh(i) * 0.8, 0.5, -4.6 + hsh(i + 4) * 0.6]} h={i % 3 ? 0.05 : 0.12} rotY={hsh(i + 8) * 6} material={gold} shadow={false} />)}
      {Array.from({ length: 4 }, (_, i) => {
        const k = ((t * 0.6 + i / 4) % 1);
        return <Glb key={`f${i}`} name="gold-coin-29afc1" pos={[-0.9 + k * 0.7, 2.6 - k * 1.3, -5.0 - k * 0.5]} h={0.05} rotY={t * 3 + i} material={gold} shadow={false} />;
      })}
    </group>
  );
};
export const TUNGKU_A: Anchors = { lead: [0.5, 0, -4.4], second: [-1.4, 0, -5.2], target: [-0.2, 1.2, -5.6], rows: [-3, 3, -6, -4.5], guards: [[-2.4, 0, -2], [2.8, 0, -3.6]], path: [[2, 0, -10], [-1, 0, 4]], light: [0, 3, -6] };

/** laut: a bare shore (no palms) — the ashes go to the waves. extras: abu (ash drifting out over the sea). */
export const Laut: React.FC<SetProps> = ({ t, seed, mood, extras = [] }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 12]} receiveShadow><planeGeometry args={[400, 40]} /><meshStandardMaterial color="#5e4a36" roughness={1} /></mesh>
    <Water y={-0.08} t={t} deep={mood === "pagi" ? "#1c3046" : "#17283a"} sky={mood === "pagi" ? "#f0c890" : "#e3a070"} sun="#ffc070" sunDir={[0.05, 0.06, -1]} glitter={1.3} />
    <Glb name="large-coastal-boulder-a2cab1" pos={[-6.5, 0, -0.5]} h={2.6} rotY={0.4} tint="#2e261f" />
    <Glb name="large-coastal-boulder-a2cab1" pos={[7.5, 0, 1.2]} h={3.2} rotY={2.1} tint="#2a221c" />
    <Glb name="medium-rock-e08405" pos={[4.2, 0, -1.4]} h={1.1} rotY={1} tint="#2e261f" />
    {extras.includes("abu") && <AshColumn t={t + 2} base={[0.6, 2.2, -3]} height={16} width={5} count={40} life={7} wind={[0.05, -0.9]} dark="#4a4440" lit="#8a7a6a" hot="#c0a080" density={0.6} seed={seed + 4} />}
  </group>
);
export const LAUT_A: Anchors = { lead: [0.8, 0, -1.4], second: [-1.4, 0, -2.0], target: [0, 1.5, -50], rows: [-5, 5, -4, -1.5], guards: [[3, 0, -1], [-3.5, 0, -0.5]], path: [[-9, 0, -3], [7, 0, 3]], light: [2, 8, -60] };
