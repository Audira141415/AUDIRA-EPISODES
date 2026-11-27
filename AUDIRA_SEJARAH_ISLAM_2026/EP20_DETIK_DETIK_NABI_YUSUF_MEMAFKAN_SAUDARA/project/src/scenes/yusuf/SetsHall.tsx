// EP20 interior sets: the Egyptian palace hall in three lights (hook at night from behind the
// throne, the revelation in a midday roof beam, the forgiveness from the floor) and the torch-lit
// grain store. Each set sits at the origin; the film mounts one set per segment.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite } from "./pixel.tsx";
import { U, Ground, Fire, OilLamp, Backer, Spot, textTexture, grain, grainFine } from "./world.tsx";
import {
  YUSUF_STAND, YUSUF_FRONT_REACH, BENYAMIN_FRONT, BENYAMIN_STAND, BRO_FRONT, BRO_BACK, BRO_KNEEL, OFFICER_BACK,
} from "./sprites.ts";
import { W, ramp } from "./time.ts";

type V3 = [number, number, number];

/** Seeded ashlar floor: pale limestone slabs with dark joints (map + bump). */
export function ashlarTex(seed: number, base: string, joint: string, rep = 6) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = joint;
  g.fillRect(0, 0, 512, 512);
  const r = prng(seed);
  const base3 = new THREE.Color(base);
  for (let y = 0; y < 8; y++) {
    const off = (y % 2) * 32;
    for (let x = -1; x < 8; x++) {
      const k = 0.86 + r() * 0.22;
      g.fillStyle = `rgb(${Math.round(base3.r * 255 * k)},${Math.round(base3.g * 255 * k)},${Math.round(base3.b * 255 * k)})`;
      g.fillRect(x * 64 + off + 2, y * 64 + 2, 60, 60);
      for (let n = 0; n < 14; n++) {
        g.fillStyle = `rgba(60,40,20,${0.05 + r() * 0.08})`;
        g.fillRect(x * 64 + off + r() * 60, y * 64 + r() * 60, 2 + r() * 5, 2 + r() * 5);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = 8;
  return t;
}

const hallFloor = ashlarTex(201, "#C9B08A", "#5A4630", 9);
const storeFloor = ashlarTex(202, "#7E6448", "#3A2A1C", 10);

/** Papyrus column: shaft with painted bands and an open flared capital. */
const Column: React.FC<{ pos: V3; h?: number; color?: string }> = ({ pos, h = 2.2, color = "#C8A878" }) => (
  <group position={pos}>
    <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.2, 0.22, 0.12, 20]} />
      <meshPhysicalMaterial {...POLISH.stone} color="#A88A62" bumpMap={grain} bumpScale={0.6} />
    </mesh>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.13, 0.16, h, 20]} />
      <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.9} />
    </mesh>
    {[0.35, 0.42, h - 0.35].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.04, 20]} />
        <meshPhysicalMaterial {...POLISH.stone} color={i === 2 ? "#2F6B8A" : "#9C3A26"} />
      </mesh>
    ))}
    <mesh position={[0, h + 0.14, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.14, 0.28, 20]} />
      <meshPhysicalMaterial {...POLISH.stone} color="#D2B488" bumpMap={grain} bumpScale={0.6} />
    </mesh>
  </group>
);

const Wall: React.FC<{ pos: V3; size: V3; color?: string; rotY?: number }> = ({ pos, size, color = U.plaster, rotY = 0 }) => (
  <mesh position={[pos[0], pos[1] + size[1] / 2, pos[2]]} rotation={[0, rotY, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={size} radius={0.02} />
    <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.8} />
  </mesh>
);

/** Standing brazier (GLB) with a live flame and its warm light. */
const Brazier: React.FC<{ f: number; pos: V3; power?: number }> = ({ f, pos, power = 1 }) => (
  <group position={pos}>
    <AssetModel id="standing-brazier-c9e4ee" size={0.62} ground position={[0, 0, 0]} />
    <Fire f={f} pos={[0, 0.6, 0]} scale={0.8} power={power} />
  </group>
);

// ---------------------------------------------------------------- PALACE HALL
/** Hook: Yusuf stands on the dais beside the throne, his back to the camera. */
export const YUSUF_HOOK: V3 = [-0.45, 0.14, 0.8];

export const HALL = {
  throneFar: [0, 0.14, 0.95] as V3, // hook / reveal: throne near the camera, facing the brothers
  throneNear: [0, 0.14, -1.55] as V3, // forgiveness: throne behind Yusuf, facing the camera
  broZ: -1.55,
  dais: 0.14,
};

/** Eleven brothers (ten + Benyamin) in two loose rows. */
export const BRO_SLOTS: V3[] = [
  [-1.0, 0, 0], [-0.62, 0, 0.05], [-0.22, 0, 0], [0.2, 0, 0.04], [0.6, 0, 0], [1.0, 0, 0.05],
  [-0.82, 0, -0.42], [-0.4, 0, -0.38], [0.02, 0, -0.44], [0.42, 0, -0.38], [0.84, 0, -0.42],
];
export const BENYAMIN_SLOT = 8;

const HallShell: React.FC<{ f: number; day: boolean }> = ({ f, day }) => {
  const plaque = useMemo(() => textTexture("AUDIRA", { color: "#F2C35A", bg: "#2A1A10", border: "#C99A2E", font: "bold 128px 'MM Anton', Impact, sans-serif" }), []);
  return (
    <group>
      <Ground color={day ? "#D8C4A0" : "#B39A78"} map={hallFloor ?? undefined} bump={0.6} r={14} />
      {/* rows of papyrus columns */}
      {[-1.55, 1.55].map((x) => [-3.3, -2.1, -0.9, 0.3, 1.5].map((z) => <Column key={`${x}${z}`} pos={[x, 0, z]} />))}
      {/* back wall with a doorway, side walls */}
      <Wall pos={[-1.55, 0, -4.1]} size={[1.9, 2.8, 0.3]} color="#B59872" />
      <Wall pos={[1.55, 0, -4.1]} size={[1.9, 2.8, 0.3]} color="#B59872" />
      <Wall pos={[0, 2.0, -4.1]} size={[1.3, 0.8, 0.3]} color="#B59872" />
      <Wall pos={[-2.35, 0, -1.0]} size={[0.3, 2.8, 6.6]} color="#A88A66" />
      <Wall pos={[2.35, 0, -1.0]} size={[0.3, 2.8, 6.6]} color="#A88A66" />
      {/* the AUDIRA plaque over the doorway (brand inside the world) */}
      <mesh position={[0, 2.38, -3.93]}>
        <planeGeometry args={[0.9, 0.42]} />
        <meshStandardMaterial map={plaque ?? undefined} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* long runner rug between the brothers and the throne */}
      <mesh position={[0, 0.006, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.9, 5.4]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#7A1E1A" bumpMap={grainFine} bumpScale={0.5} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.008, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 5.4]} />
          <meshStandardMaterial color="#D9A63A" roughness={0.6} />
        </mesh>
      ))}
      {/* doorway glow: night = cool moonlit court, day = bright court */}
      <mesh position={[0, 1.0, -4.3]}>
        <planeGeometry args={[1.2, 2.0]} />
        <meshBasicMaterial color={day ? "#FFF1D2" : "#4E64A8"} toneMapped={false} />
      </mesh>
      {/* palms in pots and grain-gold jars along the walls */}
      {[-2.0, 2.0].map((x) => [-2.7, 0.9].map((z) => (
        <AssetModel key={`${x}${z}`} id="clay-storage-pot-626452" size={0.34} ground position={[x, 0, z]} polish="clay" />
      )))}
      {!day && (
        <>
          <Brazier f={f} pos={[-1.2, 0, 1.3]} power={0.9} />
          <Brazier f={f} pos={[1.2, 0, 1.3]} power={0.9} />
          <Brazier f={f + 17} pos={[-1.2, 0, -2.6]} power={0.6} />
          <Brazier f={f + 31} pos={[1.2, 0, -2.6]} power={0.6} />
        </>
      )}
    </group>
  );
};

const Dais: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={[pos[0], 0, pos[2]]}>
    <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[1.5, 0.14, 1.0]} radius={0.02} />
      <meshPhysicalMaterial {...POLISH.stone} color="#E2D2B2" bumpMap={grain} bumpScale={0.5} />
    </mesh>
  </group>
);

const Throne: React.FC<{ pos: V3; facing: 1 | -1 }> = ({ pos, facing }) => (
  <AssetModel id="looted-gilded-throne-008fc3" size={0.72} ground position={pos} rotation={[0, facing === 1 ? 0 : Math.PI, 0]} />
);

/** HOOK: night hall seen from behind the throne; the brothers stand far off, long shadows reach the throne. */
export const HallNightSet: React.FC<{ t: number; f: number }> = ({ f }) => (
  <group>
    <color attach="background" args={["#0A0F24"]} />
    <fog attach="fog" args={["#151A30", 3.5, 11]} />
    <HallShell f={f} day={false} />
    <Dais pos={HALL.throneFar} />
    <Throne pos={HALL.throneFar} facing={-1} />
    <PixelSprite map={YUSUF_STAND} px={0.036} position={YUSUF_HOOK} />
    <Backer pos={YUSUF_HOOK} w={0.34} h={0.55} opacity={0.14} />
    {BRO_SLOTS.map((p, i) => (
      <PixelSprite key={i} map={i === BENYAMIN_SLOT ? BENYAMIN_FRONT : BRO_FRONT[i % 5]} px={0.034} position={[p[0], 0, HALL.broZ + p[2]]} />
    ))}
    {/* low cool light through the doorway behind the brothers: their shadows stretch to the throne */}
    <Spot position={[0, 0.55, -4.0]} target={[0, 0, 1]} angle={0.7} penumbra={0.4} intensity={22} distance={12} decay={1.4} color="#9DB2FF" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
  </group>
);

/** UNGKAP: the same hall at midday, a beam from the roof window falls on Yusuf; the brothers step back. */
export function revealState(t: number) {
  const back = ramp(t, W("terkejut") - 0.2, W("terkejut") + 0.6);
  const ben = ramp(t, W("saudaraku") - 0.6, W("saudaraku") + 0.5);
  const beam = 0.55 + 0.45 * ramp(t, W("aku") - 0.4, W("aku") + 0.3);
  return { back, ben, beam };
}
export const YUSUF_REVEAL: V3 = [0, HALL.dais, 0.62];

export const HallDaySet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = revealState(t);
  const benFrom: V3 = [BRO_SLOTS[BENYAMIN_SLOT][0], 0, HALL.broZ + BRO_SLOTS[BENYAMIN_SLOT][2]];
  const benTo: V3 = [0.42, HALL.dais, 0.5];
  const benPos: V3 = [benFrom[0] + (benTo[0] - benFrom[0]) * s.ben, benFrom[1] + (benTo[1] - benFrom[1]) * s.ben, benFrom[2] + (benTo[2] - benFrom[2]) * s.ben];
  const motes = useMemo(() => {
    const r = prng(207);
    return Array.from({ length: 40 }, () => [(r() - 0.5) * 0.7, r() * 2.2, (r() - 0.5) * 0.7, r() * 6.28] as [number, number, number, number]);
  }, []);
  return (
    <group>
      <color attach="background" args={["#2A2018"]} />
      <fog attach="fog" args={["#4A3A2A", 4, 13]} />
      <HallShell f={f} day />
      <Dais pos={HALL.throneFar} />
      <Throne pos={[HALL.throneFar[0], HALL.dais, HALL.throneFar[2] + 0.3]} facing={-1} />
      <PixelSprite map={YUSUF_STAND} px={0.036} position={YUSUF_REVEAL} />
      <Backer pos={YUSUF_REVEAL} w={0.34} h={0.55} opacity={0.12} />
      {BRO_SLOTS.map((p, i) =>
        i === BENYAMIN_SLOT ? null : (
          <PixelSprite key={i} map={BRO_FRONT[i % 5]} px={0.034} position={[p[0], 0, HALL.broZ + p[2] - 0.28 * s.back]} />
        ),
      )}
      <PixelSprite map={s.ben > 0.5 ? BENYAMIN_STAND : BENYAMIN_FRONT} px={0.034} position={benPos} />
      {/* the roof beam: a soft additive shaft + dust motes + a hot pool on the floor */}
      <mesh position={[0, 1.35, 0.55]} rotation={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.16, 0.4, 2.7, 24, 1, true]} />
        <meshBasicMaterial color="#FFE7B0" transparent opacity={0.12 * s.beam} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0.18, HALL.dais + 0.005, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#FFE2A0" transparent opacity={0.22 * s.beam} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {motes.map(([x, y, z, ph], i) => {
        const yy = (y + (f / 60) * 0.05) % 2.2;
        return (
          <mesh key={i} position={[x + 0.18 * (yy / 2.2), 0.2 + yy, 0.55 + z]}>
            <sphereGeometry args={[0.006, 6, 4]} />
            <meshBasicMaterial color="#FFF3D0" transparent opacity={0.6 * Math.abs(Math.sin(ph + f * 0.02))} toneMapped={false} />
          </mesh>
        );
      })}
      <Spot position={[-0.45, 3.2, 0.5]} target={[0, 0, 0.6]} angle={0.28} penumbra={0.5} intensity={60 * s.beam} distance={8} decay={1.3} color="#FFE2A8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
      <OilLamp f={f} pos={[-0.6, HALL.dais, 1.05]} power={0.6} />
    </group>
  );
};

/** MAAF: low on the floor behind the kneeling brothers; Yusuf, hooded and faceless, holds out his hand. */
export function forgiveState(t: number) {
  const rise = ramp(t, W("semoga") - 0.3, W("mengampuni") + 0.4);
  return { rise };
}

export const HallLowSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = forgiveState(t);
  const yus: V3 = [0, HALL.dais, -1.0];
  return (
    <group>
      <color attach="background" args={["#1A1420"]} />
      <fog attach="fog" args={["#2A2030", 3.5, 11]} />
      <HallShell f={f} day={false} />
      <Dais pos={[0, 0, -1.15]} />
      <Throne pos={HALL.throneNear} facing={1} />
      <PixelSprite map={YUSUF_FRONT_REACH} px={0.036} position={yus} />
      <Backer pos={yus} w={0.4} h={0.55} opacity={0.14} />
      {/* kneeling brothers seen from behind; the front one rises as the hand is given */}
      {[[-0.75, 0.1], [-0.38, 0.0], [0.0, -0.1], [0.38, 0.0], [0.75, 0.1], [-0.56, 0.45], [-0.18, 0.42], [0.2, 0.45], [0.58, 0.42], [0.95, 0.5]].map(([x, z], i) =>
        i === 2 ? (
          <PixelSprite key={i} map={s.rise > 0.5 ? BRO_BACK[i % 5] : BRO_KNEEL[i % 5]} px={0.034} position={[x, 0, z - 0.35 * s.rise]} />
        ) : (
          <PixelSprite key={i} map={BRO_KNEEL[i % 5]} px={0.034} position={[x, 0, z]} />
        ),
      )}
      {/* the folded shirt on a low stool beside Yusuf */}
      <mesh position={[0.55, 0.12, -0.85]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.26, 0.24, 0.2]} radius={0.02} />
        <meshPhysicalMaterial {...POLISH.stone} color={U.timber} bumpMap={grainFine} />
      </mesh>
      <mesh position={[0.55, 0.265, -0.85]} castShadow>
        <RoundedBoxGeo args={[0.2, 0.05, 0.15]} radius={0.015} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#F4EEDC" bumpMap={grainFine} bumpScale={0.8} />
      </mesh>
      {/* warm lamps between the camera and the brothers keep the lower third alive */}
      <OilLamp f={f} pos={[-0.95, 0, 0.9]} power={0.8} />
      <OilLamp f={f + 11} pos={[1.0, 0, 0.85]} power={0.8} />
      <Spot position={[0.2, 3.0, -0.6]} target={[0, 0, -1.0]} angle={0.35} penumbra={0.6} intensity={30} distance={8} decay={1.3} color="#FFE2B0" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
      <Spot position={[0, 0.5, -4.0]} target={[0, 0, 0]} angle={0.8} penumbra={0.5} intensity={10} distance={10} decay={1.4} color="#9DB2FF" />
    </group>
  );
};

// ---------------------------------------------------------------- GRAIN STORE (gudang)
export const STORE = {
  scale: [0, 0, -0.35] as V3,
  small: [0.62, 0, 0.12] as V3, // Benyamin's sack, where the cup is found
  yusuf: [-0.25, 0, 1.0] as V3, // on the camera axis so the closing shot holds him in the focus band
  officer: [0.95, 0, -0.05] as V3,
};

/** Hero sack (GLB grain-sack) with the AUDIRA stamp decal on its front. */
const StampSack: React.FC<{ pos: V3; size?: number; rotY?: number }> = ({ pos, size = 0.46, rotY = 0 }) => {
  const stamp = useMemo(() => textTexture("AUDIRA", { color: "#7A2A1E", border: "#7A2A1E", font: "bold 150px 'MM Anton', Impact, sans-serif" }), []);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <AssetModel id="grain-sack-401d96" size={size} ground position={[0, 0, 0]} polish="fabric" />
      <mesh position={[0, size * 0.42, size * 0.3]}>
        <planeGeometry args={[size * 0.55, size * 0.27]} />
        <meshStandardMaterial map={stamp ?? undefined} transparent roughness={0.95} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
};

export function storeState(t: number) {
  const open = ramp(t, W("dituduh") - 0.3, W("dituduh") + 0.4);
  const cup = ramp(t, W("dituduh"), W("mencuri") + 0.6);
  return { open, cup };
}

export const StoreSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = storeState(t);
  const grains = useMemo(() => {
    const r = prng(211);
    return Array.from({ length: 70 }, () => [(r() - 0.5) * 3.0, (r() - 0.5) * 2.0 + 0.2, 0.01 + r() * 0.02] as V3);
  }, []);
  const cupPos: V3 = [STORE.small[0], 0.3 + 0.26 * s.cup, STORE.small[2] + 0.12];
  return (
    <group>
      <color attach="background" args={["#2A1C1A"]} />
      <fog attach="fog" args={["#3A2A24", 4.5, 13]} />
      {/* warm lantern fill over Yusuf and the floor: keeps the closing shot out of crushed black (rule 12 §5) */}
      <pointLight position={[-1.2, 1.2, 3.1]} color="#FFC88A" intensity={90} distance={10} decay={1.2} />
      <hemisphereLight args={["#FFD9A8", "#6A4A34", 2.6]} />
      <Ground color="#6E5640" map={storeFloor ?? undefined} bump={0.8} r={12} />
      <Wall pos={[0, 0, -1.6]} size={[4.6, 1.9, 0.25]} color="#8E6E4E" />
      <Wall pos={[-2.0, 0, -0.3]} size={[0.25, 1.9, 2.8]} color="#7E6042" />
      {/* stacked sacks along the back wall */}
      {[-1.5, -1.05, -0.6, 0.55, 1.0, 1.45].map((x, i) => (
        <React.Fragment key={i}>
          <AssetModel id="grain-sack-401d96" size={0.44} ground position={[x, 0, -1.3]} rotation={[0, i * 0.7, 0]} polish="fabric" />
          {i % 2 === 0 && <AssetModel id="grain-sack-401d96" size={0.4} ground position={[x + 0.2, 0.32, -1.32]} rotation={[0, i * 1.3, 0]} polish="fabric" />}
        </React.Fragment>
      ))}
      <StampSack pos={[-0.35, 0, -0.95]} size={0.5} />
      {/* the brass balance where each sack is weighed */}
      <AssetModel id="gold-balance-scale-66497b" size={0.62} ground position={STORE.scale} />
      {/* Benyamin's small sack: its mouth opens and the king's cup rises out */}
      <group position={STORE.small}>
        <AssetModel id="grain-sack-401d96" size={0.32} ground position={[0, 0, 0]} rotation={[0, 0.5, 0]} polish="fabric" />
        <mesh position={[0, 0.315, 0.03]} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + 0.6 * s.open}>
          <circleGeometry args={[0.07, 16]} />
          <meshStandardMaterial color="#EAD9A8" roughness={1} />
        </mesh>
      </group>
      {s.cup > 0.01 && (
        <group position={cupPos} rotation={[0, f * 0.01, 0]}>
          <AssetModel id="goblet-87c3ba" size={0.17} position={[0, 0, 0]} />
          <pointLight position={[0, 0.12, 0.1]} color="#FFD27A" intensity={0.9 * s.cup} distance={1.2} decay={1.5} />
        </group>
      )}
      {grains.map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 6]} />
          <meshStandardMaterial color="#E2C98A" roughness={1} />
        </mesh>
      ))}
      <Brazier f={f} pos={[-1.55, 0, -0.55]} power={1} />
      <Brazier f={f + 23} pos={[1.6, 0, -0.6]} power={1} />
      <OilLamp f={f} pos={[-0.8, 0, 0.55]} power={0.7} />
      {/* figures: the officer at the cup, the brothers waiting, Yusuf watching from the front (back view) */}
      <PixelSprite map={OFFICER_BACK} px={0.034} position={STORE.officer} />
      {[[0.35, 0.65], [0.75, 0.75], [1.15, 0.6], [0.95, 1.05], [1.4, 0.95]].map(([x, z], i) => (
        <PixelSprite key={i} map={BRO_BACK[i % 5]} px={0.034} position={[x, 0, z]} />
      ))}
      <PixelSprite map={YUSUF_STAND} px={0.036} position={STORE.yusuf} />
      <Backer pos={STORE.yusuf} w={0.34} h={0.55} opacity={0.14} />
      {/* cool night spill from a high vent: separates the stacks from the torch-lit floor */}
      <Spot position={[1.2, 2.6, 1.4]} target={[0, 0, -0.6]} angle={0.6} penumbra={0.6} intensity={14} distance={9} decay={1.4} color="#7F9CFF" />
    </group>
  );
};

