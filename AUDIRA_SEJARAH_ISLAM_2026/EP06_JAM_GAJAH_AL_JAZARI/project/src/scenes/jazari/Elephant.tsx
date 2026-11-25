// EP06 world: the cutaway elephant water clock (after al-Jazari, 1206; Hill 1974 reconstruction).
// Copper shell with a wedge cut toward the camera (cream inner wall, coral section faces), the water
// tank and sinking brass bowl in the belly, the rope to the castle, cymbal, whistle; on the back the
// dais, four pillars, castle, gold dome with bird, falcon head and serpent. The mahout is a small
// faceless automaton. Everything is procedural and frame-driven.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { PALETTE, BODY, CUT, CUT_PHI, TANK, WATER_TOP, BOWL_R, DAIS_Y, ROOF_Y, CASTLE, DOME_R, BEAK, MOUTH, CYMBAL, bowlY as bowlYOf } from "./layout.ts";
import type { FilmState } from "./state.ts";

const metal = (color: string, rough = 0.32, metalness = 0.9) => ({ color, roughness: rough, metalness });

/** Half ring in the plane of a sphere meridian at azimuth phi (sphere geometry convention). */
const SectionCap: React.FC<{ phi: number; rIn: number }> = ({ phi, rIn }) => {
  const geo = useMemo(() => new THREE.RingGeometry(rIn, 1, 48, 1, -Math.PI / 2, Math.PI), [rIn]);
  return (
    <mesh geometry={geo} rotation={[0, Math.PI + phi, 0]}>
      <meshStandardMaterial color={PALETTE.cut} roughness={0.75} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Body: React.FC = () => {
  const grain = useSurfaceGrain(11, 0.18, 4);
  const phiStart = CUT_PHI + CUT;
  const phiLen = Math.PI * 2 - CUT * 2;
  const rIn = 0.93;
  return (
    <group position={BODY.c} scale={BODY.r}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 96, 64, phiStart, phiLen]} />
        <meshPhysicalMaterial {...metal(PALETTE.copper, 0.38, 0.75)} roughnessMap={grain} clearcoat={0.25} clearcoatRoughness={0.35} />
      </mesh>
      <mesh receiveShadow>
        <sphereGeometry args={[rIn, 96, 64, phiStart, phiLen]} />
        <meshStandardMaterial color={PALETTE.shellInside} roughness={0.85} side={THREE.BackSide} />
      </mesh>
      <SectionCap phi={phiStart} rIn={rIn} />
      <SectionCap phi={phiStart + phiLen} rIn={rIn} />
    </group>
  );
};

const Leg: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const geo = useMemo(
    () => new THREE.LatheGeometry([[0.001, 0], [0.25, 0], [0.26, 0.05], [0.22, 0.12], [0.2, 0.5], [0.23, 0.82], [0.19, 0.92], [0.1, 0.96], [0.001, 0.97]].map(([a, b]) => new THREE.Vector2(a, b)), 40),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial {...metal(PALETTE.copper, 0.4, 0.75)} clearcoat={0.2} />
      </mesh>
      {/* toenails */}
      {[-0.5, 0, 0.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.235, 0.05, Math.sin(a) * 0.235]} scale={[0.6, 0.6, 1]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshPhysicalMaterial color={PALETTE.ivory} {...POLISH.toyPlastic} />
        </mesh>
      ))}
    </group>
  );
};

const Head: React.FC = () => {
  const trunk = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.55, 1.58, 0),
      new THREE.Vector3(1.86, 1.28, 0.02),
      new THREE.Vector3(1.92, 0.82, 0.05),
      new THREE.Vector3(1.86, 0.5, 0.08),
      new THREE.Vector3(1.98, 0.36, 0.1),
    ]);
    const g = new THREE.TubeGeometry(c, 64, 0.1, 24, false);
    // taper toward the tip
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      const seg = Math.floor(i / 25) / 64;
      const centre = c.getPointAt(Math.min(1, seg));
      v.fromBufferAttribute(p, i).sub(centre).multiplyScalar(1.25 - seg * 0.6).add(centre);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const tusk = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.22, -0.18, 0), new THREE.Vector3(0.38, -0.08, 0));
    return new THREE.TubeGeometry(c, 20, 0.035, 12, false);
  }, []);
  const m = metal(PALETTE.copper, 0.38, 0.75);
  return (
    <group>
      <mesh position={[1.24, 1.62, 0]} scale={[0.44, 0.46, 0.42]} castShadow>
        <sphereGeometry args={[1, 64, 48]} />
        <meshPhysicalMaterial {...m} clearcoat={0.25} />
      </mesh>
      <mesh geometry={trunk} castShadow>
        <meshPhysicalMaterial {...m} clearcoat={0.25} />
      </mesh>
      {/* ears: flat discs with a lapis inner face */}
      {[1, -1].map((s) => (
        <group key={s} position={[1.08, 1.66, s * 0.4]} rotation={[0, s * 0.55, s * 0.08]}>
          <mesh scale={[0.36, 0.44, 0.05]} castShadow>
            <sphereGeometry args={[1, 40, 24]} />
            <meshPhysicalMaterial {...m} />
          </mesh>
          <mesh position={[0.02, 0, s * 0.03]} scale={[0.29, 0.36, 0.03]}>
            <sphereGeometry args={[1, 40, 24]} />
            <meshStandardMaterial color={PALETTE.red} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} geometry={tusk} position={[1.62, 1.42, s * 0.18]}>
          <meshPhysicalMaterial color={PALETTE.ivory} {...POLISH.toyPlastic} />
        </mesh>
      ))}
      {/* blind brass eye boss (no face detail) */}
      <mesh position={[1.62, 1.75, 0.3]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshStandardMaterial {...metal(PALETTE.gold, 0.25, 1)} />
      </mesh>
      {/* saddle cloth (lapis with red border) */}
      <mesh position={[0.05, 1.98, 0]} scale={[0.9, 0.06, 0.78]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 1, 48]} />
        <meshStandardMaterial color={PALETTE.lapis} roughness={0.85} />
      </mesh>
    </group>
  );
};

/** Belly mechanism: tank, water, sinking bowl, rope, whistle, cymbal. */
const Belly: React.FC<{ bowlY: number; sink: number; s: FilmState }> = ({ bowlY, sink, s }) => {
  const bowl = useMemo(() => new THREE.SphereGeometry(BOWL_R, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), []);
  const waterH = WATER_TOP - TANK.y0 - 0.02;
  return (
    <group>
      {/* tank: glass wall */}
      <mesh position={[TANK.x, (TANK.y0 + TANK.y1) / 2, 0]}>
        <cylinderGeometry args={[TANK.r, TANK.r, TANK.y1 - TANK.y0, 64, 1, true]} />
        <meshPhysicalMaterial color={PALETTE.glass} roughness={0.08} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* tank bottom + brass rim */}
      <mesh position={[TANK.x, TANK.y0, 0]} receiveShadow>
        <cylinderGeometry args={[TANK.r + 0.02, TANK.r + 0.02, 0.04, 64]} />
        <meshStandardMaterial {...metal(PALETTE.brass, 0.35, 1)} />
      </mesh>
      <mesh position={[TANK.x, TANK.y1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[TANK.r, 0.018, 12, 64]} />
        <meshStandardMaterial {...metal(PALETTE.brass, 0.3, 1)} />
      </mesh>
      {/* water */}
      <mesh position={[TANK.x, TANK.y0 + 0.02 + waterH / 2, 0]}>
        <cylinderGeometry args={[TANK.r - 0.01, TANK.r - 0.01, waterH, 64]} />
        <meshPhysicalMaterial color={PALETTE.water} roughness={0.12} transparent opacity={0.42} depthWrite={false} clearcoat={0.6} />
      </mesh>
      {/* sinking bowl */}
      <group position={[TANK.x, bowlY, 0]}>
        <mesh geometry={bowl} castShadow>
          <meshPhysicalMaterial {...metal("#C7882A", 0.28, 1)} side={THREE.DoubleSide} clearcoat={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BOWL_R, 0.012, 10, 48]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.2, 1)} />
        </mesh>
        {/* water filling the bowl */}
        <mesh position={[0, -BOWL_R * (1 - sink) * 0.9 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[BOWL_R * Math.sqrt(Math.max(0.05, 1 - (1 - sink) ** 2)) * 0.97, 40]} />
          <meshStandardMaterial color={PALETTE.water} roughness={0.15} />
        </mesh>
        {/* water coming in through the small hole in the bottom */}
        {s.inflow > 0.01 ? (
          <mesh position={[0, -BOWL_R + 0.02 + 0.06 * s.inflow, 0]}>
            <cylinderGeometry args={[0.012, 0.03, 0.12 * s.inflow, 12]} />
            <meshStandardMaterial color="#7FE3DA" roughness={0.1} transparent opacity={0.85} />
          </mesh>
        ) : null}
        {/* rope up to the castle */}
        <mesh position={[0, (ROOF_Y + 0.1 - bowlY) / 2, 0]}>
          <cylinderGeometry args={[0.012 + 0.008 * s.ropeTension, 0.012 + 0.008 * s.ropeTension, ROOF_Y + 0.1 - bowlY, 8]} />
          <meshStandardMaterial color={s.ropeTension > 0.05 ? PALETTE.cut : PALETTE.rope} roughness={0.8} />
        </mesh>
      </group>
      {/* rope pulley under the dais */}
      <mesh position={[TANK.x, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.02, 12, 32]} />
        <meshStandardMaterial {...metal(PALETTE.brass, 0.3, 1)} />
      </mesh>
      {/* whistle: pipe from the tank lid to a flared mouth */}
      <mesh position={[-0.42, 1.52, 0.12]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
        <meshStandardMaterial {...metal(PALETTE.brass, 0.3, 1)} />
      </mesh>
      <mesh position={[-0.55, 1.74, 0.12]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.07, 0.03, 0.1, 20, 1, true]} />
        <meshStandardMaterial {...metal(PALETTE.gold, 0.25, 1)} side={THREE.DoubleSide} />
      </mesh>
      {s.whistle > 0.02
        ? [0, 1, 2].map((i) => {
            const k = ((s.whistle * 2.2 + i / 3) % 1);
            return (
              <mesh key={i} position={[-0.6 - k * 0.22, 1.82 + k * 0.14, 0.12]} rotation={[0, 0, 0.5 + Math.PI / 2]} scale={s.whistle}>
                <coneGeometry args={[0.045, 0.09, 3]} />
                <meshStandardMaterial color={PALETTE.water} roughness={0.5} transparent opacity={0.9 * (1 - k)} />
              </mesh>
            );
          })
        : null}
      {/* cymbal, tilted to catch the ball; it rings (wobbles) when hit */}
      <group position={CYMBAL} rotation={[0.5 + 0.12 * s.cymbalHit * Math.sin(s.cymbalHit * 40), 0, -0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.012, 48]} />
          <meshPhysicalMaterial color="#F0C35A" roughness={0.38} metalness={0.7} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <sphereGeometry args={[0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.18, 1)} />
        </mesh>
      </group>
      {/* ball chute from the back down to the cymbal */}
      <mesh position={[0.46, 1.86, 0.3]} rotation={[0.1, 0, 0.12]}>
        <cylinderGeometry args={[0.045, 0.045, 0.34, 20, 1, true]} />
        <meshStandardMaterial {...metal(PALETTE.copperDark, 0.45, 0.8)} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Faceless automaton: rounded torso, plain head ball under a turban, an arm with a stick. */
const Automaton: React.FC<{ position: [number, number, number]; scale?: number; tunic: string; arm?: number }> = ({ position, scale = 1, tunic, arm = 0.6 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.16, 0]} castShadow>
      <RoundedBoxGeo args={[0.16, 0.26, 0.13]} radius={0.05} />
      <meshPhysicalMaterial color={tunic} {...POLISH.fabric} />
    </mesh>
    <mesh position={[0, 0.36, 0]} castShadow>
      <sphereGeometry args={[0.075, 24, 18]} />
      <meshPhysicalMaterial color={PALETTE.copper} roughness={0.45} metalness={0.6} />
    </mesh>
    <mesh position={[0, 0.42, 0]} scale={[1, 0.7, 1]}>
      <sphereGeometry args={[0.085, 24, 18]} />
      <meshPhysicalMaterial color={PALETTE.ivory} {...POLISH.fabric} />
    </mesh>
    <group position={[0.07, 0.24, 0.02]} rotation={[0, 0, -arm]}>
      <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.12, 6, 12]} />
        <meshPhysicalMaterial color={tunic} {...POLISH.fabric} />
      </mesh>
      <mesh position={[0.16, 0.06, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
        <meshStandardMaterial {...metal(PALETTE.gold, 0.3, 1)} />
      </mesh>
    </group>
  </group>
);

const Castle: React.FC<{ s: FilmState }> = ({ s }) => {
  const pillars: [number, number][] = [[0.55, 0.42], [-0.55, 0.42], [0.55, -0.42], [-0.55, -0.42]];
  const serpent = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const a = u * Math.PI * 4;
      pts.push(new THREE.Vector3(0.55 + Math.cos(a) * 0.07, DAIS_Y + 0.05 + u * 0.4, 0.42 + Math.sin(a) * 0.07));
    }
    pts.push(new THREE.Vector3(0.7, MOUTH[1] - 0.06, 0.34));
    pts.push(new THREE.Vector3(MOUTH[0], MOUTH[1] - 0.04, MOUTH[2]));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.03, 12, false);
  }, []);
  const lapis = { color: PALETTE.lapis, roughness: 0.55 };
  return (
    <group>
      {/* dais */}
      <mesh position={[0, DAIS_Y + 0.03, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.3, 0.07, 1.0]} radius={0.025} />
        <meshPhysicalMaterial color={PALETTE.red} {...POLISH.toyPlastic} />
      </mesh>
      {pillars.map(([x, z], i) => (
        <mesh key={i} position={[x, (DAIS_Y + ROOF_Y) / 2 + 0.03, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, ROOF_Y - DAIS_Y, 16]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.3, 1)} />
        </mesh>
      ))}
      {/* roof slab */}
      <mesh position={[0, ROOF_Y + 0.03, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.28, 0.06, 0.98]} radius={0.02} />
        <meshPhysicalMaterial {...lapis} clearcoat={0.3} />
      </mesh>
      {/* castle */}
      <mesh position={[0, CASTLE.y0 + CASTLE.h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[CASTLE.w, CASTLE.h, CASTLE.d]} radius={0.03} />
        <meshPhysicalMaterial color={PALETTE.ivory} {...POLISH.stone} />
      </mesh>
      {/* arched window plates on the castle (lapis) */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, CASTLE.y0 + 0.22, CASTLE.d / 2 + 0.005]}>
          <planeGeometry args={[0.12, 0.2]} />
          <meshStandardMaterial color={PALETTE.lapis} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, CASTLE.y0 + CASTLE.h + 0.02, 0]}>
        <RoundedBoxGeo args={[CASTLE.w + 0.08, 0.04, CASTLE.d + 0.08]} radius={0.015} />
        <meshStandardMaterial {...metal(PALETTE.gold, 0.3, 1)} />
      </mesh>
      {/* dome */}
      <mesh position={[0, CASTLE.y0 + CASTLE.h + 0.04, 0]} castShadow>
        <sphereGeometry args={[DOME_R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...metal(PALETTE.gold, 0.2, 1)} clearcoat={0.5} />
      </mesh>
      {/* bird on the dome (the whistling "bird") */}
      <group position={[0, CASTLE.y0 + CASTLE.h + 0.04 + DOME_R + 0.05, 0]} rotation={[0, s.birdSpin, 0]}>
        <mesh scale={[1.4, 0.8, 0.8]}>
          <sphereGeometry args={[0.06, 20, 14]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.25, 1)} />
        </mesh>
        <mesh position={[0.1, 0.04, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.06, 12]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.25, 1)} />
        </mesh>
      </group>
      {/* falcon head on the castle's camera side, beak toward the ball path */}
      {[1, -1].map((s) => (
        <group key={s} position={[s > 0 ? BEAK[0] - 0.12 : -(CASTLE.w / 2 + 0.05), BEAK[1] + 0.04, BEAK[2]]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <mesh scale={[1.1, 1, 0.9]} castShadow>
            <sphereGeometry args={[0.09, 24, 18]} />
            <meshPhysicalMaterial color={PALETTE.falcon} {...POLISH.toyPlastic} />
          </mesh>
          <mesh position={[0.11, -0.03, 0]} rotation={[0, 0, -2.0]}>
            <coneGeometry args={[0.035, 0.1, 16]} />
            <meshStandardMaterial {...metal(PALETTE.gold, 0.25, 1)} />
          </mesh>
        </group>
      ))}
      <mesh position={[(CASTLE.w / 2 + BEAK[0] - 0.12) / 2, BEAK[1] + 0.02, BEAK[2]]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, BEAK[0] - 0.12 - CASTLE.w / 2, 12]} />
        <meshStandardMaterial {...metal(PALETTE.gold, 0.3, 1)} />
      </mesh>
      {/* serpent coiled up the near pillar, head up under the beak */}
      <mesh geometry={serpent} castShadow>
        <meshPhysicalMaterial color={PALETTE.serpent} {...POLISH.toyPlastic} />
      </mesh>
      <group position={[MOUTH[0], MOUTH[1] - 0.12 * s.serpentDip, MOUTH[2]]} rotation={[0, 0, -0.6 * s.serpentDip]}>
        <mesh scale={[1.3, 0.8, 1]}>
          <sphereGeometry args={[0.05, 20, 14]} />
          <meshPhysicalMaterial color={PALETTE.serpent} {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[0.02, 0.04, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.04, 0.05, 16, 1, true]} />
          <meshPhysicalMaterial color={PALETTE.red} {...POLISH.toyPlastic} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* scribe automaton on a turning disc in front of the castle; the pen points along the scale */}
      <group position={[-0.12, ROOF_Y + 0.06, 0.38]} rotation={[0, s.scribe, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.025, 32]} />
          <meshStandardMaterial {...metal(PALETTE.gold, 0.3, 1)} />
        </mesh>
        <Automaton position={[0, 0.01, 0]} scale={0.5} tunic={PALETTE.lapis} arm={0.2} />
      </group>
      {/* scale ring under the scribe */}
      <mesh position={[-0.12, ROOF_Y + 0.062, 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.105, 0.13, 48]} />
        <meshStandardMaterial color={PALETTE.ivory} roughness={0.7} />
      </mesh>
      {/* shoulder vases */}
      {[0.32, -0.32].map((z, i) => (
        <mesh key={i} position={[0.78, DAIS_Y + 0.08, z + (z > 0 ? 0.14 : -0.14)]}>
          <cylinderGeometry args={[0.06, 0.04, 0.12, 20]} />
          <meshStandardMaterial {...metal(PALETTE.brass, 0.3, 1)} />
        </mesh>
      ))}
    </group>
  );
};

export const Elephant: React.FC<{ s: FilmState }> = ({ s }) => {
  const by = bowlYOf(s.sink);
  return (
    <group scale={s.scale}>
      <Body />
      <Head />
      <Leg x={0.62} z={0.36} />
      <Leg x={0.62} z={-0.36} />
      <Leg x={-0.62} z={0.36} />
      <Leg x={-0.62} z={-0.36} />
      <Belly bowlY={by} sink={s.sink} s={s} />
      <Castle s={s} />
      {/* mahout automaton on the neck (small, faceless) */}
      <Automaton position={[1.02, 1.98, 0]} scale={0.9} tunic={PALETTE.red} arm={s.mahoutArm} />
      {/* the ball */}
      {s.ballOn > 0.01 ? (
        <mesh position={s.ball} castShadow scale={s.ballOn}>
          <sphereGeometry args={[0.09, 32, 24]} />
          <meshPhysicalMaterial color="#DDE2E8" roughness={0.12} metalness={1} clearcoat={0.6} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Studio set: plinth, floor, pale dial disk behind (depth), a tray of spare balls in the foreground. */
export const Studio: React.FC = () => {
  const balls = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) out.push([2.2 + (i % 3) * 0.13 + (Math.floor(i / 3) % 2) * 0.06, 0.07, 1.6 + Math.floor(i / 3) * 0.12]);
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={PALETTE.floor} roughness={0.95} />
      </mesh>
      <mesh position={[0.2, -0.07, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 2.55, 0.14, 96]} />
        <meshPhysicalMaterial color={PALETTE.plinth} {...POLISH.stone} />
      </mesh>
      <mesh position={[0.2, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.012, 8, 128]} />
        <meshStandardMaterial {...metal(PALETTE.brass, 0.35, 1)} />
      </mesh>
      {/* pale dial ring far behind: soft background depth */}
      <group position={[-1.8, 2.6, -7]} rotation={[0, 0.42, 0]}>
        <mesh>
          <ringGeometry args={[2.6, 3.0, 96]} />
          <meshStandardMaterial color="#E7DFD1" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 15 }, (_, i) => {
          const a = (i / 15) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0.01]}>
              <circleGeometry args={[0.1, 24]} />
              <meshStandardMaterial color={i < 8 ? "#F4EFE6" : "#D9CDB9"} roughness={1} />
            </mesh>
          );
        })}
      </group>
      {/* foreground tray of spare balls on the plinth edge */}
      <mesh position={[2.33, 0.03, 1.72]}>
        <RoundedBoxGeo args={[0.48, 0.05, 0.42]} radius={0.02} />
        <meshStandardMaterial {...metal(PALETTE.copperDark, 0.45, 0.8)} />
      </mesh>
      {balls.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.055, 24, 18]} />
          <meshPhysicalMaterial color="#C9CED4" roughness={0.15} metalness={1} />
        </mesh>
      ))}
    </group>
  );
};
