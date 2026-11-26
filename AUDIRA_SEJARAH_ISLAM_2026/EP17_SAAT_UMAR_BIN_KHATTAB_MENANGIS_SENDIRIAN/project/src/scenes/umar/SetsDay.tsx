// EP17 later sets: the flour store (karung), the cracked ground of the Ramadah famine, the dim room
// of the last days (hisab) and the dawn mosque rows (payoff). Each set sits at the origin.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite } from "./pixel.tsx";
import { U, Sky, Ground, Scatter, OilLamp, Walker, textTexture, grain, grainFine } from "./world.tsx";
import { Palm } from "./SetsNight.tsx";
import {
  UMAR_STAND, UMAR_CARRY, UMAR_CROUCH, ASLAM_STAND, LYING, SIT_WHITE, SIT_BROWN, SIT_INDIGO, IMAM, CAMEL_FLOUR,
} from "./sprites.ts";
import { W, ramp, clamp01 } from "./time.ts";

const Wall: React.FC<{ pos: [number, number, number]; size: [number, number, number]; color?: string; rotY?: number }> = ({ pos, size, color = U.plaster, rotY = 0 }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} rotation={[0, rotY, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.02} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.8} />
  </mesh>
);

// ---------------------------------------------------------------- FLOUR STORE (karung)
export const STORE = {
  hero: [0.32, 0, -0.5] as [number, number, number],
  umar: [-0.12, 0, 0.0] as [number, number, number],
  aslam: [-0.5, 0, 0.3] as [number, number, number],
  exit: [1.6, 0, 0.35] as [number, number, number],
};

/** The hero sack: rounded burlap with the AUDIRA stamp (brand inside the world). */
const StampSack: React.FC<{ pos: [number, number, number] }> = ({ pos }) => {
  const stamp = useMemo(() => textTexture("AUDIRA", { color: "#7A2A1E", border: "#7A2A1E", font: "bold 150px 'MM Anton', Impact, sans-serif" }), []);
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.36, 0.4, 0.26]} radius={0.1} segments={6} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#C9AE80" bumpMap={grainFine} bumpScale={1.2} />
      </mesh>
      <mesh position={[0, 0.43, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.08, 10]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#B79A6A" />
      </mesh>
      <mesh position={[0, 0.2, 0.132]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial map={stamp ?? undefined} transparent roughness={0.9} />
      </mesh>
    </group>
  );
};

export const StoreSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lifted = t > W("dinaikkan") + 0.1;
  const carry0 = W("sendiri") + 0.2;
  const flour = useMemo(() => {
    const r = prng(41);
    return Array.from({ length: 50 }, () => [(r() - 0.5) * 2.6, (r() - 0.5) * 1.6 + 0.1, 0.015 + r() * 0.03] as [number, number, number]);
  }, []);
  return (
    <group>
      <color attach="background" args={["#0E0B10"]} />
      <fog attach="fog" args={["#140F14", 4, 12]} />
      <Ground color="#5E4834" />
      <Wall pos={[0, 0, -1.25]} size={[4.2, 1.5, 0.2]} />
      <Wall pos={[-1.75, 0, -0.2]} size={[0.2, 1.5, 2.4]} color="#9A7A58" />
      {/* shelf with jars */}
      <mesh position={[0.9, 0.62, -1.08]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.05, 0.22]} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.timber} bumpMap={grainFine} />
      </mesh>
      {[0.45, 0.8, 1.2].map((x, i) => (
        <AssetModel key={i} id="clay-storage-pot-626452" size={0.2 + i * 0.03} ground position={[x, 0.645, -1.08]} polish="clay" />
      ))}
      <AssetModel id="clay-storage-pot-626452" size={0.42} ground position={[1.15, 0, -0.75]} polish="clay" />
      {/* sack stack */}
      {[[-1.25, -0.85, 0.3], [-0.85, -0.95, -0.2], [-0.45, -0.9, 0.4], [-1.05, -0.45, 1.2], [-0.1, -0.98, 0.1]].map(([x, z, r], i) => (
        <AssetModel key={i} id="grain-sack-401d96" size={0.42} ground position={[x, 0, z]} rotation={[0, r, 0]} polish="fabric" />
      ))}
      <AssetModel id="grain-sack-401d96" size={0.4} ground position={[-0.95, 0.3, -0.92]} rotation={[0, 0.9, 0]} polish="fabric" />
      {!lifted && <StampSack pos={STORE.hero} />}
      {flour.map(([x, z, s], i) => (
        <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[s, 8]} />
          <meshStandardMaterial color="#EFE7D6" roughness={1} />
        </mesh>
      ))}
      <Scatter seed={42} n={50} x={[-1.6, 1.8]} z={[-1.0, 1.4]} rock="#4E3E30" scale={0.35} shrub="#9C8A55" />
      <OilLamp f={f} pos={[0.1, 0.645, -1.08]} power={1.1} />
      {/* figures */}
      {!lifted ? (
        <PixelSprite map={UMAR_STAND} px={0.036} position={STORE.umar} />
      ) : (
        <Walker t={t} a={[STORE.umar[0] + 0.05, 0, STORE.umar[2]]} b={STORE.exit} t0={carry0} t1={carry0 + 5.5} maps={[UMAR_CARRY, UMAR_CARRY]} stand={UMAR_CARRY} px={0.036} />
      )}
      <PixelSprite map={ASLAM_STAND} px={0.034} position={STORE.aslam} />
    </group>
  );
};

// ---------------------------------------------------------------- RAMADAH (famine year)
const crackTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#B89670";
  g.fillRect(0, 0, 512, 512);
  const r = prng(77);
  g.strokeStyle = "#4A3424";
  for (let i = 0; i < 70; i++) {
    let x = r() * 512, y = r() * 512;
    g.lineWidth = 1.5 + r() * 3;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 120;
      y += (r() - 0.5) * 120;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  return t;
})();

export const RAMADAH = { table: [0, 0, 0.35] as [number, number, number] };

export const RamadahSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const t0 = W("saat") - 0.5;
  const k = clamp01((t - t0) / 11);
  return (
    <group>
      <Sky top="#7E92B8" mid="#D8C0A0" hor="#F0D2A8" />
      <fog attach="fog" args={["#D8C2A2", 8, 34]} />
      <Ground color="#B08C66" map={crackTex ?? undefined} bump={1.2} />
      <Scatter seed={51} n={140} x={[-6, 6]} z={[-8, 3]} rock="#7A5E44" shrub="#6E5A34" keep={(x, z) => Math.hypot(x, z - 0.35) > 0.7} />
      {/* dead acacia trees */}
      {[[-2.2, -2.5], [2.6, -4], [-3.5, -6]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#4A3424" roughness={1} />
          </mesh>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={j} position={[0.15 * Math.cos(j * 1.6), 0.95, 0.15 * Math.sin(j * 1.6)]} rotation={[0.8 * Math.sin(j * 1.6), 0, -0.8 * Math.cos(j * 1.6)]} castShadow>
              <cylinderGeometry args={[0.01, 0.02, 0.4, 5]} />
              <meshStandardMaterial color="#4A3424" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      {/* caravan carrying flour across the cracked plain */}
      {[0, 1, 2].map((i) => (
        <PixelSprite key={i} map={CAMEL_FLOUR} px={0.05} position={[-1.9 + i * 1.25 + k * 2.4, 0, -1.3 - i * 0.2]} bob={0.01 * (Math.floor(f / 14 + i) % 2)} />
      ))}
      {/* the meal: low table, bread, a bowl of oil */}
      <group position={RAMADAH.table}>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.7, 0.05, 0.42]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.stone} color="#5A3A22" bumpMap={grainFine} bumpScale={0.6} />
        </mesh>
        {[[-0.3, -0.17], [0.3, -0.17], [-0.3, 0.17], [0.3, 0.17]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.07, z]} castShadow>
            <boxGeometry args={[0.04, 0.14, 0.04]} />
            <meshStandardMaterial color="#3A2414" />
          </mesh>
        ))}
        <AssetModel id="bread-loaf-0e0ab5" size={0.22} ground position={[-0.12, 0.185, 0]} rotation={[0, 0.4, 0]} />
        <mesh position={[0.17, 0.215, 0.02]} castShadow>
          <cylinderGeometry args={[0.08, 0.05, 0.06, 20, 1, true]} />
          <meshPhysicalMaterial {...POLISH.clay} color="#8A4E2C" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.17, 0.235, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.072, 20]} />
          <meshPhysicalMaterial color="#C99A2E" roughness={0.05} clearcoat={1} metalness={0.1} />
        </mesh>
      </group>
      <PixelSprite map={UMAR_CROUCH} px={0.036} position={[0, 0, 0.78]} />
      {/* low warm sun */}
      <directionalLight position={[5, 3, -4]} intensity={1.6} color="#FFC07A" />
    </group>
  );
};

// ---------------------------------------------------------------- ROOM (hisab)
export const ROOM = {
  bal: [0.42, 0, 0.35] as [number, number, number],
  beamY: 0.78,
  half: 0.32,
  chain: 0.36,
};

export function roomState(t: number) {
  const grow = ramp(t, W("emas") - 0.2, W("bumi") + 0.3);
  const crumble = ramp(t, W("azab") - 0.1, W("allah", 2) + 0.9);
  const mass = grow * (1 - crumble);
  return { grow, crumble, tilt: 0.32 * mass };
}

/** World point of the gold pan centre at a given tilt. */
export function goldPan(tilt: number): [number, number, number] {
  const x = ROOM.bal[0] - ROOM.half * Math.cos(tilt);
  const y = ROOM.beamY - ROOM.half * Math.sin(tilt) - ROOM.chain;
  return [x, y, ROOM.bal[2]];
}

const Balance: React.FC<{ t: number }> = ({ t }) => {
  const st = roomState(t);
  const brass = { color: "#C9973E", metalness: 0.9, roughness: 0.3 };
  const pans = [-1, 1].map((side) => {
    const dy = side * ROOM.half * Math.sin(st.tilt);
    return { x: side * ROOM.half * Math.cos(st.tilt), y: ROOM.beamY + dy - ROOM.chain };
  });
  const dust = useMemo(() => {
    const r = prng(91);
    return Array.from({ length: 36 }, () => [(r() - 0.5) * 0.3, r(), (r() - 0.5) * 0.3, 0.012 + r() * 0.02] as number[]);
  }, []);
  const g = goldPan(st.tilt);
  return (
    <group>
      <group position={ROOM.bal}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.04, 24]} />
          <meshPhysicalMaterial {...brass} />
        </mesh>
        <mesh position={[0, ROOM.beamY / 2, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.024, ROOM.beamY, 12]} />
          <meshPhysicalMaterial {...brass} />
        </mesh>
        <mesh position={[0, ROOM.beamY, 0]} rotation={[0, 0, st.tilt]} castShadow>
          <boxGeometry args={[ROOM.half * 2 + 0.04, 0.025, 0.025]} />
          <meshPhysicalMaterial {...brass} />
        </mesh>
        {pans.map((p, i) => (
          <group key={i}>
            <mesh position={[p.x, p.y + ROOM.chain / 2, 0]}>
              <cylinderGeometry args={[0.004, 0.004, ROOM.chain, 4]} />
              <meshPhysicalMaterial {...brass} />
            </mesh>
            <mesh position={[p.x, p.y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.13, 0.08, 0.035, 24]} />
              <meshPhysicalMaterial {...brass} />
            </mesh>
          </group>
        ))}
      </group>
      {/* gold "as much as the earth": a gold globe with raised continents */}
      {st.grow > 0.01 && st.crumble < 0.98 && (
        <mesh position={[g[0], g[1] + 0.02 + 0.13 * st.grow * (1 - st.crumble), g[2]]} scale={st.grow * (1 - st.crumble)} castShadow>
          <icosahedronGeometry args={[0.13, 3]} />
          <meshPhysicalMaterial color={U.gold} metalness={1} roughness={0.25} bumpMap={grain} bumpScale={2} emissive="#7A4A08" emissiveIntensity={0.35} />
        </mesh>
      )}
      {st.crumble > 0.01 &&
        dust.map(([x, r, z, s], i) => {
          const fall = clamp01(st.crumble * 1.4 - r * 0.4);
          return (
            <mesh key={i} position={[g[0] + x * (1 + fall), g[1] + 0.15 - fall * (g[1] + 0.1), g[2] + z]} rotation={[r * 6, r * 3, 0]}>
              <octahedronGeometry args={[s * (1 - 0.6 * fall), 0]} />
              <meshPhysicalMaterial color={U.gold} metalness={1} roughness={0.35} transparent opacity={1 - 0.7 * fall} />
            </mesh>
          );
        })}
    </group>
  );
};

export const RoomSet: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <group>
    {/* night room: cool moonlight from a window high on the right wall, against the warm oil lamp */}
    <color attach="background" args={["#0C1428"]} />
    <fog attach="fog" args={["#111B33", 3.5, 10]} />
    <spotLight position={[1.6, 2.2, 0.6]} target-position={[-0.2, 0, -0.6]} angle={0.55} penumbra={0.7} color="#7F9CFF" intensity={40} distance={8} decay={1.2} />
    {/* the moonlit window itself, a cold slit in the back wall */}
    <mesh position={[0.95, 1.05, -1.34]}>
      <planeGeometry args={[0.42, 0.5]} />
      <meshBasicMaterial color="#9FB6FF" toneMapped={false} />
    </mesh>
    <Ground color="#4A3A2E" />
    {/* woven mat */}
    <mesh position={[0, 0.004, -0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.4, 1.8]} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#8C6A40" bumpMap={grainFine} bumpScale={1.4} />
    </mesh>
    <Wall pos={[0, 0, -1.45]} size={[4, 1.6, 0.2]} />
    <Wall pos={[-1.7, 0, -0.3]} size={[0.2, 1.6, 2.4]} color="#987656" />
    {/* bed and the lying figure behind a curtain */}
    <mesh position={[-0.6, 0.06, -0.95]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.9, 0.12, 0.38]} radius={0.03} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#6E5640" />
    </mesh>
    <PixelSprite map={LYING} px={0.04} position={[-0.6, 0.12, -0.95]} />
    <mesh position={[-0.55, 1.12, -0.6]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.01, 0.01, 1.4, 6]} />
      <meshStandardMaterial color="#3A2414" />
    </mesh>
    <mesh position={[-0.75, 0.56, -0.6]}>
      <planeGeometry args={[0.95, 1.12, 8, 1]} />
      <meshPhysicalMaterial {...POLISH.fabric} color="#D8C49A" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <OilLamp f={f} pos={[-0.05, 0.0, -0.65]} power={0.75} />
    <AssetModel id="clay-storage-pot-626452" size={0.28} ground position={[-1.35, 0, 0.1]} polish="clay" />
    <Scatter seed={61} n={30} x={[-1.4, 1.4]} z={[-1.1, 1.2]} rock="#5A4636" scale={0.3} />
    <Balance t={t} />
  </group>
);

// ---------------------------------------------------------------- MOSQUE (dawn payoff)
export const MOSQUE = { rows: [-1.9, -1.45, -1.0, -0.55, -0.1, 0.35], imam: [0, 0, -2.45] as [number, number, number] };

export function rippleZ(t: number) {
  const k = ramp(t, W("terdengar") - 0.1, W("belakang") + 0.4);
  return { z: -2.4 + k * 3.1, on: k > 0.001 && k < 0.999 ? 1 : k >= 0.999 ? 0.5 : 0 };
}

export const MosqueSet: React.FC<{ t: number; f: number }> = ({ t }) => {
  const rip = rippleZ(t);
  const maps = [SIT_WHITE, SIT_BROWN, SIT_INDIGO];
  return (
    <group>
      <Sky top="#2A3566" mid="#B46A6A" hor="#F2A65A" />
      <fog attach="fog" args={["#6A4A58", 6, 22]} />
      <Ground color="#9C7E5C" />
      <Scatter seed={71} n={160} x={[-1.4, 1.4]} z={[-2.4, 1.6]} rock="#7E6448" scale={0.25} />
      <Scatter seed={72} n={80} x={[-5, 5]} z={[-6, 4]} rock="#6E5640" keep={(x) => Math.abs(x) > 1.9} />
      {/* qibla wall with an open dawn window band */}
      <Wall pos={[-1.15, 0, -3.0]} size={[1.5, 1.3, 0.16]} />
      <Wall pos={[1.15, 0, -3.0]} size={[1.5, 1.3, 0.16]} />
      <mesh position={[0, 1.15, -3.0]}>
        <boxGeometry args={[0.8, 0.3, 0.16]} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.plaster} />
      </mesh>
      {/* palm-trunk pillars and a frond roof over the front half */}
      {[-1.3, -0.45, 0.45, 1.3].flatMap((x) =>
        [-2.5, -1.25, 0].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.7, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 1.4, 8]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#5A4230" bumpMap={grainFine} bumpScale={0.8} />
          </mesh>
        )),
      )}
      <mesh position={[0, 1.42, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.06, 2.4]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#4E3A22" bumpMap={grain} bumpScale={1.2} />
      </mesh>
      {[-2.6, 2.4].map((x, i) => <Palm key={i} x={x} z={-3.6 - i} h={1.8} />)}
      {/* the rows, all from behind */}
      <PixelSprite map={IMAM} px={0.036} position={MOSQUE.imam} />
      {MOSQUE.rows.map((z, r) =>
        Array.from({ length: 8 }, (_, i) => (
          <PixelSprite key={`${r}-${i}`} map={maps[(i + r) % 3]} px={0.034} position={[-1.05 + i * 0.3, 0, z]} />
        )),
      )}
      {/* ripple of light travelling from the front row to the last */}
      {rip.on > 0 && (
        <>
          <mesh position={[0, 0.006, rip.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.7, 0.3]} />
            <meshBasicMaterial color="#FFC27A" transparent opacity={0.45 * rip.on} toneMapped={false} depthWrite={false} />
          </mesh>
          <pointLight position={[0, 0.5, rip.z]} color="#FFB86A" intensity={1.8 * rip.on} distance={1.6} decay={1.5} />
        </>
      )}
      {/* dawn through the qibla window: the warm source */}
      <pointLight position={[0, 1.0, -2.6]} color="#FFB070" intensity={3.2} distance={6} decay={1.3} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} />
    </group>
  );
};
