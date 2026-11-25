// EP07 set pieces (TOYDIORAMA): a toy 50 m pool on the walnut stage, butterfly swimmers, finish-wall touchpads,
// the medal shelf, the Water Cube bubble wall. Lanes run along z: the start/finish wall is at z = +POOL.half
// (toward the camera), the turn wall at z = -POOL.half. Generic caps and suits, no flags, no logos, no faces.
import React from "react";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, type Pose, type Look } from "../../core/polish/Person.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { Model } from "./Model.tsx";

type V3 = [number, number, number];
export const POOL = { half: 4, laneW: 0.5, lanes: 8, deckY: 0.09, waterY: 0, floorY: -0.34 };
export const laneX = (i: number) => -((POOL.lanes - 1) / 2) * POOL.laneW + i * POOL.laneW;
/** Swimmer figure scale in the race shots. */
export const SWIM_SCALE = 0.42;
/** Pelvis-to-fingertip reach with arms overhead, at SWIM_SCALE. */
export const REACH = 0.66 * SWIM_SCALE;

export const PHELPS_LANE = 4;
export const CAVIC_LANE = 3;
export const LOOK_PHELPS: Partial<Look> = { skin: "#f0c6a0", top: "#1d2c5e", bottom: "#1d2c5e", outfit: "trunks", hairStyle: 2, cap: "#f2c230", build: 1.06, height: 1.04 };
export const LOOK_CAVIC: Partial<Look> = { skin: "#eac09a", top: "#8e1f2a", bottom: "#8e1f2a", outfit: "trunks", hairStyle: 2, cap: "#e4e6ea", build: 1.04, height: 1.03 };

// ---------------------------------------------------------------- poses
/** Butterfly: both arms sweep together, dolphin kick, body undulates; head lifts to breathe on recovery. */
export const butterfly = (f: number, seed = 1): Pose => {
  const ph = (f / 60 + seed * 0.37) * Math.PI * 2 * 0.62;
  const wave = Math.sin(ph);
  const kick = Math.sin(ph * 2);
  const arm = ph % (Math.PI * 2);
  return {
    body: [Math.PI / 2 - 0.06 + wave * 0.1, 0, 0],
    lift: -0.05 + Math.max(0, wave) * 0.05,
    spine: [-wave * 0.12, 0, 0],
    head: [0.35 - Math.max(0, wave) * 0.45, 0, 0],
    ls: [-Math.PI + arm, 0, 0.32], le: -0.15 - Math.max(0, Math.sin(arm)) * 0.35,
    rs: [-Math.PI + arm, 0, -0.32], re: -0.15 - Math.max(0, Math.sin(arm)) * 0.35,
    lh: [kick * 0.32, 0, 0.04], lk: 0.15 + Math.max(0, kick) * 0.35,
    rh: [kick * 0.32, 0, -0.04], rk: 0.15 + Math.max(0, kick) * 0.35,
  };
};
/** Glide: arms straight overhead, legs together, face down. `k` blends from an open stroke to full glide. */
export const glide = (k = 1): Pose => ({
  body: [Math.PI / 2 - 0.04, 0, 0],
  lift: -0.04,
  spine: [0, 0, 0],
  head: [0.1, 0, 0],
  ls: [-Math.PI + (1 - k) * 1.2, 0, 0.08], le: -(1 - k) * 0.4,
  rs: [-Math.PI + (1 - k) * 1.2, 0, -0.08], re: -(1 - k) * 0.4,
  lh: [0, 0, 0.02], lk: 0.06,
  rh: [0, 0, -0.02], rk: 0.06,
});

// ---------------------------------------------------------------- pool
const tile = { ...POLISH.toyPlastic, roughness: 0.3, clearcoat: 0.8 };

const LaneRope: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, POOL.waterY + 0.012, 0]}>
    {Array.from({ length: 64 }, (_, i) => {
      const z = -POOL.half + 0.1 + i * ((POOL.half * 2 - 0.2) / 63);
      const end = i < 8 || i > 55;
      return (
        <mesh key={i} position={[0, 0, z]}>
          <sphereGeometry args={[0.02, 10, 8]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={end ? "#e2442f" : i % 2 ? "#f4f1ea" : "#2f6fde"} />
        </mesh>
      );
    })}
  </group>
);

/** Yellow touchpad on the inner face of the finish wall, one per lane. `lit` 0..1 glows it. */
export const Touchpad: React.FC<{ x: number; lit?: number; z?: number }> = ({ x, lit = 0, z = POOL.half - 0.035 }) => (
  <group position={[x, -0.08, z]}>
    <mesh>
      <RoundedBoxGeo args={[0.42, 0.3, 0.03]} radius={0.01} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f2c230" emissive="#ffd24a" emissiveIntensity={lit * 1.4} />
    </mesh>
    {[-0.12, 0, 0.12].map((y) => (
      <mesh key={y} position={[0, y, -0.017]}>
        <boxGeometry args={[0.4, 0.012, 0.004]} />
        <meshStandardMaterial color="#1b1b1b" />
      </mesh>
    ))}
  </group>
);

export const Pool: React.FC<{ lit?: Record<number, number>; brand?: boolean }> = ({ lit = {}, brand = true }) => {
  const W = POOL.lanes * POOL.laneW + 0.3;
  const L = POOL.half * 2;
  return (
    <group>
      {/* walnut stage around the pool: planks over the basin footprint are cut to the two ends, so the water stays open */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (i - 7) * 0.62;
        const color = i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight;
        if (Math.abs(x) - 0.3 >= W / 2)
          return (
            <mesh key={i} position={[x, POOL.deckY - 0.1, 0]} receiveShadow>
              <boxGeometry args={[0.6, 0.2, L + 4]} />
              <meshStandardMaterial color={color} roughness={0.68} />
            </mesh>
          );
        return [-1, 1].map((s) => (
          <mesh key={`${i}${s}`} position={[x, POOL.deckY - 0.1, s * (POOL.half + 1)]} receiveShadow>
            <boxGeometry args={[0.6, 0.2, 2]} />
            <meshStandardMaterial color={color} roughness={0.68} />
          </mesh>
        ));
      })}
      {/* white tile deck border */}
      {[
        [0, POOL.half + 0.35, W + 0.9, 0.7],
        [0, -POOL.half - 0.35, W + 0.9, 0.7],
      ].map(([x, z, w, d], i) => (
        <mesh key={`d${i}`} position={[x, POOL.deckY + 0.005, z]} receiveShadow>
          <RoundedBoxGeo args={[w, 0.03, d]} radius={0.012} />
          <meshPhysicalMaterial {...tile} color="#eef1f2" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`s${s}`} position={[s * (W / 2 + 0.22), POOL.deckY + 0.005, 0]} receiveShadow>
          <RoundedBoxGeo args={[0.44, 0.03, L]} radius={0.012} />
          <meshPhysicalMaterial {...tile} color="#eef1f2" />
        </mesh>
      ))}
      {/* basin: floor + walls */}
      <mesh position={[0, POOL.floorY, 0]} receiveShadow>
        <boxGeometry args={[W, 0.04, L]} />
        <meshPhysicalMaterial {...tile} color="#7fd0e6" />
      </mesh>
      {Array.from({ length: POOL.lanes }, (_, i) => (
        <group key={`l${i}`}>
          <mesh position={[laneX(i), POOL.floorY + 0.022, 0]}>
            <boxGeometry args={[0.06, 0.004, L - 0.8]} />
            <meshStandardMaterial color="#1c2b3a" />
          </mesh>
          <mesh position={[laneX(i), POOL.floorY + 0.022, POOL.half - 0.42]}>
            <boxGeometry args={[0.26, 0.004, 0.06]} />
            <meshStandardMaterial color="#1c2b3a" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`w${s}`} position={[s * (W / 2), (POOL.floorY + POOL.deckY) / 2, 0]}>
          <boxGeometry args={[0.04, POOL.deckY - POOL.floorY, L]} />
          <meshPhysicalMaterial {...tile} color="#dff3f8" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[0, (POOL.floorY + POOL.deckY) / 2, s * POOL.half]}>
          <boxGeometry args={[W, POOL.deckY - POOL.floorY, 0.04]} />
          <meshPhysicalMaterial {...tile} color="#dff3f8" />
        </mesh>
      ))}
      {Array.from({ length: POOL.lanes }, (_, i) => (
        <Touchpad key={`t${i}`} x={laneX(i)} lit={lit[i] ?? 0} />
      ))}
      {/* starting blocks on the finish wall */}
      {Array.from({ length: POOL.lanes }, (_, i) => (
        <mesh key={`b${i}`} position={[laneX(i), POOL.deckY + 0.09, POOL.half + 0.2]} rotation={[-0.15, 0, 0]} castShadow>
          <RoundedBoxGeo args={[0.26, 0.05, 0.26]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={i === PHELPS_LANE || i === CAVIC_LANE ? "#f4f1ea" : "#c9ced3"} />
        </mesh>
      ))}
      {Array.from({ length: POOL.lanes - 1 }, (_, i) => (
        <LaneRope key={`r${i}`} x={laneX(i) + POOL.laneW / 2} />
      ))}
      {/* water: a clear glossy sheet over the tiled basin */}
      <mesh position={[0, POOL.waterY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, L]} />
        <meshPhysicalMaterial color="#2c9ec8" transparent opacity={0.5} roughness={0.06} clearcoat={1} metalness={0} depthWrite={false} />
      </mesh>
      {/* side boards with the brand in the world (anti-reupload) */}
      {brand &&
        [-1.6, 1.6].map((z) => (
          <group key={z} position={[-(W / 2 + 0.62), POOL.deckY + 0.16, z]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <RoundedBoxGeo args={[2.2, 0.3, 0.05]} radius={0.02} />
              <meshPhysicalMaterial {...POLISH.paper} color="#0f2a4a" />
            </mesh>
            <SceneText position={[0, 0, 0.03]} fontSize={0.17} color="#f2c230" anchorX="center" anchorY="middle">
              AUDIRA SPORT FACTS
            </SceneText>
          </group>
        ))}
      <Model id="lifebuoy-on-a-post-57421b" position={[W / 2 + 0.55, POOL.deckY, POOL.half - 0.6]} height={0.7} />
      <Model id="lifebuoy-on-a-post-57421b" position={[W / 2 + 0.55, POOL.deckY, -POOL.half + 1.2]} height={0.7} />
    </group>
  );
};

/** Stands behind the turn wall so the pool reads as an arena. */
export const Arena: React.FC = () => (
  <group>
    <Model id="grandstand-seating-run-fc9023" position={[0, POOL.deckY, -POOL.half - 2.2]} height={1.6} />
    <Model id="advertising-hoarding-run-efe4bc" position={[0, POOL.deckY, -POOL.half - 1.1]} height={0.4} />
  </group>
);

// ---------------------------------------------------------------- swimmers
export const Swimmer: React.FC<{ f: number; lane: number; z: number; heading: number; pose?: Pose; look?: Partial<Look>; seed: number; scale?: number }> = ({
  f,
  lane,
  z,
  heading,
  pose,
  look,
  seed,
  scale = SWIM_SCALE,
}) => <ToyPerson f={f} seed={seed} poseOverride={pose ?? butterfly(f, seed)} look={look ?? { outfit: "trunks", hairStyle: 2 }} position={[laneX(lane), POOL.waterY, z]} heading={heading} scale={scale} />;

/** Wake rings behind a swimmer (frame-driven). */
export const Wake: React.FC<{ x: number; z: number; f: number; dir: number }> = ({ x, z, f, dir }) => (
  <group>
    {[0, 1, 2].map((i) => {
      const k = ((f / 40 + i / 3) % 1 + 1) % 1;
      return (
        <mesh key={i} position={[x, POOL.waterY + 0.006, z - dir * (0.12 + k * 0.4)]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06 + k * 0.16, 0.08 + k * 0.17, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55 * (1 - k)} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

// ---------------------------------------------------------------- medal shelf (S2 / S5)
export const Medal: React.FC<{ position: V3; k?: number; ghost?: boolean }> = ({ position, k = 1, ghost = false }) => (
  <group position={position} scale={0.0001 + k}>
    {/* ribbon */}
    <mesh position={[0, 0.2, -0.01]}>
      <boxGeometry args={[0.09, 0.26, 0.01]} />
      <meshPhysicalMaterial {...POLISH.fabric} color={ghost ? "#5a5f66" : "#c22a1e"} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.022, 32]} />
      {ghost ? (
        <meshStandardMaterial color="#9aa3ad" transparent opacity={0.35} />
      ) : (
        <meshPhysicalMaterial color="#e8b93c" metalness={0.9} roughness={0.22} clearcoat={0.6} />
      )}
    </mesh>
    {!ghost && (
      <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.004, 24]} />
        <meshPhysicalMaterial color="#f6d572" metalness={0.85} roughness={0.3} />
      </mesh>
    )}
  </group>
);

/** Wooden shelf with eight medal hooks. `count` medals shown (fractional = the last one popping in), slot 7 tagged. */
export const MedalShelf: React.FC<{ count: number; tag: string; tagColor?: string; ghostFrom?: number }> = ({ count, tag, tagColor = "#c22a1e", ghostFrom = 99 }) => (
  <group>
    <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[2.5, 0.07, 0.3]} radius={0.02} />
      <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
    </mesh>
    {[-1.15, 1.15].map((x) => (
      <mesh key={x} position={[x, 0.49, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.98, 10]} />
        <meshStandardMaterial color={TP.stageDowel} />
      </mesh>
    ))}
    {Array.from({ length: 8 }, (_, i) => {
      const x = -1.05 + i * 0.3;
      const k = Math.min(1, Math.max(0, count - i));
      return (
        <group key={i}>
          <mesh position={[x, 0.95, 0.12]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 6]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
          {i >= ghostFrom ? <Medal position={[x, 0.72, 0.14]} ghost /> : k > 0 ? <Medal position={[x, 0.72, 0.14]} k={k} /> : null}
        </group>
      );
    })}
    {/* paper tag under slot 7 */}
    <group position={[0.55, 0.36, 0.17]} rotation={[0, 0, -0.04]}>
      <mesh>
        <RoundedBoxGeo args={[0.78, 0.2, 0.02]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.paper} color={TP.paperCard} />
      </mesh>
      <SceneText position={[0, 0, 0.013]} fontSize={0.085} color={tagColor} anchorX="center" anchorY="middle">
        {tag}
      </SceneText>
    </group>
  </group>
);

/** Water Cube: a wall of blue bubble panels behind the medal set. */
export const BubbleWall: React.FC<{ z?: number }> = ({ z = -2.4 }) => (
  <group position={[0, 0, z]}>
    {Array.from({ length: 7 }, (_, cx) =>
      Array.from({ length: 5 }, (_, cy) => {
        const x = (cx - 3) * 1.05;
        const y = 0.5 + cy * 1.05;
        const seed = cx * 7 + cy * 3;
        return (
          <group key={`${cx}-${cy}`} position={[x, y, 0]}>
            <mesh>
              <RoundedBoxGeo args={[1.0, 1.0, 0.08]} radius={0.04} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2a7fc0" emissive="#1d6fb0" emissiveIntensity={0.35} />
            </mesh>
            {[0, 1, 2, 3].map((b) => {
              const bx = (((seed * 13 + b * 37) % 70) / 100) - 0.35;
              const by = (((seed * 29 + b * 53) % 70) / 100) - 0.35;
              const r = 0.08 + (((seed + b * 11) % 5) / 5) * 0.12;
              return (
                <mesh key={b} position={[bx, by, 0.045]}>
                  <ringGeometry args={[r, r + 0.025, 28]} />
                  <meshStandardMaterial color="#bfe6ff" emissive="#9fd8ff" emissiveIntensity={0.6} />
                </mesh>
              );
            })}
          </group>
        );
      }),
    )}
  </group>
);

// ---------------------------------------------------------------- macro props (S4 / S6)
/** Big toy hand (palm + four fingers) pointing along -z, for the touchpad macro and the ruler shot. */
export const ToyHand: React.FC<{ position: V3; rotation?: V3; skin?: string; scale?: number }> = ({ position, rotation = [0, 0, 0], skin = "#f0c6a0", scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0, 0.35]} castShadow>
      <RoundedBoxGeo args={[0.5, 0.16, 0.5]} radius={0.07} />
      <meshPhysicalMaterial {...POLISH.toySkin} color={skin} />
    </mesh>
    {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
      <mesh key={x} position={[x, 0, -0.02 - (i === 1 || i === 2 ? 0.06 : 0)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.3 + (i === 1 || i === 2 ? 0.1 : 0), 6, 14]} />
        <meshPhysicalMaterial {...POLISH.toySkin} color={skin} />
      </mesh>
    ))}
    <mesh position={[0.3, 0, 0.3]} rotation={[Math.PI / 2, 0, -0.7]} castShadow>
      <capsuleGeometry args={[0.06, 0.2, 6, 14]} />
      <meshPhysicalMaterial {...POLISH.toySkin} color={skin} />
    </mesh>
  </group>
);

/** Dial gauge: needle angle from kg (0..4 kg over -120°..120°), green band 1.5–2.5 kg. */
export const Gauge: React.FC<{ position: V3; kg: number }> = ({ position, kg }) => {
  const ang = (v: number) => ((v / 4) * 240 - 120) * (Math.PI / 180);
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 48]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1d2c5e" />
      </mesh>
      <mesh position={[0, 0, 0.052]}>
        <circleGeometry args={[0.44, 48]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh position={[0, 0, 0.056]}>
        <ringGeometry args={[0.32, 0.42, 48, 1, Math.PI / 2 - ang(2.5), ang(2.5) - ang(1.5)]} />
        <meshStandardMaterial color="#1fa67a" />
      </mesh>
      <group position={[0, 0, 0.07]} rotation={[0, 0, -ang(kg)]}>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.03, 0.36, 0.01]} />
          <meshStandardMaterial color="#e2442f" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#181a1b" />
      </mesh>
      <SceneText position={[0, -0.2, 0.06]} fontSize={0.09} color="#181a1b" anchorX="center" anchorY="middle">
        KG
      </SceneText>
    </group>
  );
};

/** Wooden ruler with centimetre ticks, lying along x. */
export const Ruler: React.FC<{ position: V3; length?: number }> = ({ position, length = 2.4 }) => (
  <group position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[length, 0.06, 0.34]} />
      <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
    </mesh>
    {Array.from({ length: Math.round(length / 0.1) + 1 }, (_, i) => (
      <mesh key={i} position={[-length / 2 + i * 0.1, 0.032, 0.13 - (i % 5 ? 0.02 : 0.04)]}>
        <boxGeometry args={[0.012, 0.004, i % 5 ? 0.06 : 0.1]} />
        <meshStandardMaterial color="#2a1c14" />
      </mesh>
    ))}
  </group>
);
