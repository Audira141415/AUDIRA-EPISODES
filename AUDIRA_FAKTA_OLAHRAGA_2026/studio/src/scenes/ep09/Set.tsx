// EP09 sets (CINESTORY): painted fibreglass bobsled in green-yellow-black, glossy ice channel with a banked wall, snow valley,
// Kingston beach. Generic toy figures, no real faces, no film material.
import React from "react";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { CinePerson } from "./cine/CinePerson.tsx";
import { CINE, snowTex } from "./cine/look.ts";
import { SceneText } from "../../core/polish/Drei.tsx";
import { Model } from "./Model.tsx";

type V3 = [number, number, number];
export const JAM = { green: "#1f8f3a", yellow: "#f2c230", black: "#16181a" };
export const ICE = "#dcecf6";
export const SNOW = "#eef2f6";

/** Toy bobsled, nose at +x. y=0 is the runner bottom. `roll` tips it about its long axis. */
export const Bobsled: React.FC<{ position?: V3; heading?: number; roll?: number; riders?: number; scale?: number }> = ({ position = [0, 0, 0], heading = 0, roll = 0, riders = 4, scale = 1 }) => {
  const steel = { color: "#c9ced4", metalness: 0.85, roughness: 0.28 };
  const helmetX = [0.42, 0.14, -0.14, -0.42].slice(0, riders);
  return (
    <group position={position} rotation={[0, heading, 0]} scale={scale}>
      <group position={[0, 0.3, 0]} rotation={[roll, 0, 0]}>
        <group position={[0, -0.3, 0]}>
          {/* body */}
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.82, 1, 1]} castShadow receiveShadow>
            <capsuleGeometry args={[0.3, 1.5, 10, 28]} />
            <meshPhysicalMaterial {...CINE.paint} color={JAM.green} />
          </mesh>
          {/* yellow band + name (both sides) */}
          <mesh position={[-0.05, 0.36, 0]}>
            <boxGeometry args={[1.55, 0.13, 0.615]} />
            <meshPhysicalMaterial {...CINE.paint} color={JAM.yellow} />
          </mesh>
          {/* one-sided decals (troika text is double-sided by default: the far-side name showed through mirrored);
              when the sled lies upside down the name is turned so it still reads left-to-right */}
          {[1, -1].map((s) => (
            <SceneText key={s} position={[-0.05, 0.36, s * 0.312]} rotation={[0, s > 0 ? 0 : Math.PI, Math.abs(roll) > Math.PI / 2 ? Math.PI : 0]} fontSize={0.105} color={JAM.black} anchorX="center" anchorY="middle" material-side={0}>
              JAMAICA
            </SceneText>
          ))}
          {/* black nose */}
          <mesh position={[0.74, 0.38, 0]} scale={[1, 0.82, 1]} castShadow>
            <sphereGeometry args={[0.305, 24, 18, 0, Math.PI * 2, 0, Math.PI]} />
            <meshPhysicalMaterial {...CINE.paint} color={JAM.black} />
          </mesh>
          {/* cockpit opening */}
          <mesh position={[-0.05, 0.6, 0]}>
            <boxGeometry args={[1.3, 0.05, 0.38]} />
            <meshStandardMaterial color="#0c0d0e" roughness={0.9} />
          </mesh>
          {/* crew helmets */}
          {helmetX.map((x, i) => (
            <mesh key={i} position={[x, 0.62, 0]} castShadow>
              <sphereGeometry args={[0.09, 20, 16]} />
              <meshPhysicalMaterial {...CINE.paint} color={i % 2 ? JAM.black : JAM.yellow} />
            </mesh>
          ))}
          {/* runners + struts */}
          {[0.21, -0.21].map((z) => (
            <group key={z}>
              <mesh position={[0, 0.025, z]} castShadow>
                <boxGeometry args={[2.0, 0.04, 0.045]} />
                <meshStandardMaterial {...steel} />
              </mesh>
              <mesh position={[1.02, 0.07, z]} rotation={[0, 0, 0.7]}>
                <boxGeometry args={[0.14, 0.035, 0.045]} />
                <meshStandardMaterial {...steel} />
              </mesh>
              {[-0.6, 0.6].map((x) => (
                <mesh key={x} position={[x, 0.1, z]}>
                  <boxGeometry args={[0.05, 0.14, 0.04]} />
                  <meshStandardMaterial {...steel} />
                </mesh>
              ))}
              {/* rear push bar */}
              <mesh position={[-0.86, 0.5, z * 1.55]} rotation={[0, 0, -0.35]}>
                <cylinderGeometry args={[0.018, 0.018, 0.36, 8]} />
                <meshStandardMaterial {...steel} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

/** Straight ice channel along x, centred on z=0, from x0 to x1. Optional banked quarter-pipe wall on +z. */
export const IceTrack: React.FC<{ x0: number; x1: number; bank?: [number, number]; sign?: string }> = ({ x0, x1, bank, sign }) => {
  const L = x1 - x0, cx = (x0 + x1) / 2;
  const ice = { ...CINE.ice, color: ICE };
  return (
    <group>
      <mesh position={[cx, -0.03, 0]} receiveShadow>
        <boxGeometry args={[L, 0.06, 1.1]} />
        <meshPhysicalMaterial {...ice} />
      </mesh>
      {/* side walls; the -z wall is split around the bank so it does not poke through the curve */}
      {(bank ? [[x0, x1, 0.6], [x0, bank[0], -0.6], [bank[1], x1, -0.6]] : [[x0, x1, 0.6], [x0, x1, -0.6]]).map(([a, b, z], i) => (
        <mesh key={i} position={[(a + b) / 2, 0.2, z]} receiveShadow castShadow>
          <RoundedBoxGeo args={[b - a, 0.46, 0.12]} radius={0.04} />
          <meshPhysicalMaterial {...ice} color="#eef6fb" />
        </mesh>
      ))}
      {bank && (
        <group position={[(bank[0] + bank[1]) / 2, 0.85, -0.25]}>
          {/* quarter pipe: floor (z=-0.25) curving up to the lip (y=0.85 above, z=-1.1): the wall the sled rides up */}
          <mesh rotation={[0, 0, Math.PI / 2]} receiveShadow castShadow>
            <cylinderGeometry args={[0.85, 0.85, bank[1] - bank[0], 40, 1, true, Math.PI, Math.PI * 0.5]} />
            <meshPhysicalMaterial {...ice} color="#e8f3fa" side={2} />
          </mesh>
        </group>
      )}
      {sign && (
        <group position={[bank ? (bank[0] + bank[1]) / 2 : cx, 1.9, -1.4]}>
          <mesh>
            <RoundedBoxGeo args={[1.7, 0.42, 0.06]} radius={0.03} />
            <meshPhysicalMaterial {...CINE.signPaint} />
          </mesh>
          <SceneText position={[0, 0, 0.04]} fontSize={0.22} color={CINE.signText} anchorX="center" anchorY="middle">
            {sign}
          </SceneText>
          {[-0.7, 0.7].map((x) => (
            <mesh key={x} position={[x, -1.0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
              <meshStandardMaterial {...CINE.steel} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/** Snow stage: white clay floor, pine rows and snow fences behind the track. */
export const SnowStage: React.FC<{ w?: number; d?: number; pines?: V3[] }> = ({ w = 16, d = 9, pines }) => (
  <group>
    {/* snow valley floor, wide enough that no edge is ever in frame; textured (sastrugi + sparkle) so the lower frame reads */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w * 4, d * 5]} />
      <meshPhysicalMaterial {...CINE.snow} map={snowTex([w, d * 1.25])} />
    </mesh>
    {/* far mountain ridge */}
    {[[-8, -16, 4.2], [-3.5, -18, 5.4], [1.5, -16.5, 3.8], [6, -18.5, 5.0], [10.5, -16, 3.6], [-13, -17, 4.6], [15, -17.5, 4.4]].map(([x, z, h], i) => (
      <group key={i} position={[x, -0.4, z]} rotation={[0, i * 0.9, 0]}>
        {/* dark rock flank */}
        <mesh position={[0, h / 2, 0]}>
          <coneGeometry args={[h * 1.25, h, 7, 1]} />
          <meshStandardMaterial color={i % 2 ? "#4f5d70" : "#5d6b7e"} roughness={0.95} flatShading />
        </mesh>
        {/* snow cap on the top third */}
        <mesh position={[0, h * 0.83, 0]}>
          <coneGeometry args={[h * 0.43, h * 0.36, 7, 1]} />
          <meshStandardMaterial color="#d6dee8" roughness={0.9} flatShading />
        </mesh>
      </group>
    ))}
    {(pines ?? [[-5, 0, -2.6], [-3.2, 0, -3.2], [-1.2, 0, -2.4], [1.0, 0, -3.3], [2.9, 0, -2.5], [4.8, 0, -3.1], [6.4, 0, -2.4], [-6.6, 0, -3.0]]).map((p, i) => (
      <Model key={i} id="tall-pine-tree-ab4108" position={p} height={1.9 + (i % 3) * 0.35} />
    ))}
    <Model id="snow-fence-run-55a09a" position={[-2.4, 0, -1.4]} height={0.45} />
    <Model id="snow-fence-run-55a09a" position={[2.6, 0, -1.4]} height={0.45} />
  </group>
);

export const TEAM_LOOK = { top: JAM.green, bottom: JAM.black, outfit: "casual" as const, hairStyle: 2 as const, cap: JAM.yellow };
export const Athlete: React.FC<{ f: number; seed: number; position: V3; heading?: number; pose?: "stand" | "walk" | "sit" | "cheer" | "wave"; look?: object }> = ({ f, seed, position, heading = 0, pose = "stand", look }) => (
  <CinePerson f={f} seed={seed} pose={pose} look={{ ...TEAM_LOOK, ...(look ?? {}) }} position={position} heading={heading} />
);

/** Kingston beach: sand floor, sea strip, palms, a sloped street for the pushcart derby. */
export const Beach: React.FC<{ t: number; cartK: number }> = ({ t, cartK }) => (
  <group>
    <mesh position={[0, -0.12, 0]} receiveShadow>
      <boxGeometry args={[60, 0.18, 40]} />
      <meshPhysicalMaterial {...CINE.sand} />
    </mesh>
    <mesh position={[0, -0.02, -17.2]} receiveShadow>
      <boxGeometry args={[60, 0.04, 30]} />
      <meshPhysicalMaterial {...CINE.water} />
    </mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[((t * 0.4 + i * 2.1) % 6) - 3 + i * 1.5, 0.01, -2.3 - i * 0.35]}>
        <boxGeometry args={[1.6, 0.02, 0.06]} />
        <meshStandardMaterial color="#f4f8f8" />
      </mesh>
    ))}
    <Model id="palm-tree-a307da" position={[-3.4, 0, -1.6]} height={2.6} />
    <Model id="palm-tree-a307da" position={[3.6, 0, -1.9]} height={2.3} rotation={[0, 1.2, 0]} />
    <Model id="palm-tree-a307da" position={[-1.2, 0, -2.4]} height={2.0} rotation={[0, 2.4, 0]} />
    {/* sloped street: the pushcart derby runs down it */}
    <group position={[0, 0, 0.6]} rotation={[0, 0, -0.08]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7, 0.06, 1.0]} />
        <meshPhysicalMaterial {...CINE.asphalt} />
      </mesh>
      <group position={[-2.8 + cartK * 5.2, 0.15, 0]}>
        <Model id="wooden-hand-cart-3ae5b5" position={[0, 0, 0]} height={0.62} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  </group>
);

// ---------------------------------------------------------------- shared track action (film S1/S4 + cover)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg01 = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease01 = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const SLED_V = 2.2;
export const BANK: [number, number] = [1.0, 4.6];
/**
 * Sled on the crash track: runs along +x, reaches the bank (x=1.2) 1.2 s before tCrash, climbs the -z wall,
 * goes over and lands on its side/top (helmets on the ice), then slides to a stop.
 * fromStand: the sled waits at the start (x=-6.5) and is pushed off 4.5 s before it reaches the bank.
 */
export const sledRun = (t: number, tCrash: number, fromStand = false) => {
  const bankIn = tCrash - 1.2;
  let x: number;
  if (t <= bankIn) {
    if (fromStand) {
      const u = t - (bankIn - 4.5);
      x = u <= 0 ? -6.5 : u < 2 ? -6.5 + 0.55 * u * u : -4.3 + SLED_V * (u - 2);
    } else x = 1.2 - SLED_V * (bankIn - t);
  } else if (t <= tCrash) x = 1.2 + SLED_V * (t - bankIn);
  else x = 1.2 + SLED_V * 1.2 + SLED_V * 0.9 * (1 - Math.exp(-(t - tCrash) / 0.9));
  const climb = ease01(seg01(t, bankIn, tCrash));
  const flip = ease01(seg01(t, tCrash, tCrash + 0.7));
  return { x, y: 0.5 * climb * (1 - flip) + 0.06 * flip, z: -0.5 * climb * (1 - flip) - 0.1 * flip, roll: 0.95 * climb + 1.45 * flip };
};

/** Small burst of ice chips where the sled hits the ice; k = 0..1 over the burst. */
export const Spray: React.FC<{ origin: V3; k: number }> = ({ origin, k }) =>
  k <= 0 || k >= 1 ? null : (
    <group position={origin}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + i * 0.37;
        const r = (0.25 + (i % 4) * 0.12) * k * 1.6;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.05 + Math.sin(k * Math.PI) * (0.25 + (i % 3) * 0.1), Math.sin(a) * r * 0.6]} scale={1 - k * 0.6}>
            <sphereGeometry args={[0.035 + (i % 3) * 0.012, 8, 8]} />
            <meshStandardMaterial color="#f4fbff" roughness={0.3} transparent opacity={1 - k} />
          </mesh>
        );
      })}
    </group>
  );

/** Snow stage + ice channel with the banked "KREISEL" curve. */
export const CrashTrack: React.FC = () => (
  <group>
    <SnowStage />
    <IceTrack x0={-8} x1={8} bank={BANK} sign="KREISEL" />
    <Model id="piste-marker-pole-7480c3" position={[-3.2, 0, 1.1]} height={0.7} />
    <Model id="piste-marker-pole-7480c3" position={[0.2, 0, 1.1]} height={0.7} />
  </group>
);
