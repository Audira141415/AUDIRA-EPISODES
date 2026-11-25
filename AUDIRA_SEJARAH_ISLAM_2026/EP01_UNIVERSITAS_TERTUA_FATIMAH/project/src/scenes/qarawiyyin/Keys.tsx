// Four forged iron keys hovering above the four gold lock plates of the mosaic door.
// Each key: ring bow with a quatrefoil web, collar, round shaft, stepped bit. Aged iron with a
// seeded grain roughness map so the studio HDRI breaks up along the metal.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { LOCKS, ARCH } from "./picture.ts";
import { W, ramp, clamp01 } from "./tl.ts";

const KeyMesh: React.FC<{ tone: number; grain: THREE.Texture }> = ({ tone, grain }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        // dark forged iron (Stage A note: keys read hot/brass under the spot)
        color: new THREE.Color("#3A3632").multiplyScalar(tone),
        metalness: 0.85,
        roughness: 0.7,
        envMapIntensity: 0.45,
        roughnessMap: grain,
        clearcoat: 0.15,
        clearcoatRoughness: 0.5,
      }),
    [tone, grain],
  );
  // key axis = local +y (bow at top, bit at y = 0)
  return (
    <group>
      {/* bow ring */}
      <mesh material={mat} position={[0, 1.02, 0]}>
        <torusGeometry args={[0.17, 0.042, 14, 40]} />
      </mesh>
      {/* quatrefoil web inside the bow */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={mat} position={[Math.cos((i * Math.PI) / 2) * 0.075, 1.02 + Math.sin((i * Math.PI) / 2) * 0.075, 0]}>
          <torusGeometry args={[0.06, 0.016, 8, 24]} />
        </mesh>
      ))}
      {/* collar */}
      <mesh material={mat} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.07, 20]} />
      </mesh>
      <mesh material={mat} position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.05, 16, 12]} />
      </mesh>
      {/* shaft */}
      <mesh material={mat} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.034, 0.038, 0.72, 16]} />
      </mesh>
      {/* stepped bit */}
      <mesh material={mat} position={[0.1, 0.1, 0]}>
        <boxGeometry args={[0.16, 0.16, 0.03]} />
      </mesh>
      <mesh material={mat} position={[0.2, 0.06, 0]}>
        <boxGeometry args={[0.05, 0.08, 0.03]} />
      </mesh>
      <mesh material={mat} position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.04, 12, 10]} />
      </mesh>
    </group>
  );
};

/** Gilded escutcheon with a real keyhole cut, lying on the mosaic over each lock bed. */
const useEscutcheon = () =>
  useMemo(() => {
    const sh = new THREE.Shape();
    sh.absellipse(0, 0, 0.25, 0.3, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    // keyhole: round head (far, +y) and a tapered slot (near, -y)
    hole.moveTo(-0.035, 0.04);
    hole.lineTo(-0.075, -0.17);
    hole.lineTo(0.075, -0.17);
    hole.lineTo(0.035, 0.04);
    hole.absarc(0, 0.08, 0.075, -Math.PI / 2 + 0.49, Math.PI + Math.PI / 2 - 0.49, false);
    sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.014, bevelSegments: 3, curveSegments: 40 });
    g.rotateX(-Math.PI / 2); // lie flat, shape +y -> world -z (far)
    return g;
  }, []);

/** Timed key beats, all anchored to words of the locked voice. */
const BEATS = () => {
  const leave = W("bukan");
  const back = W("pintu", 2);
  const insert = [W("empat", 2), W("dipegang"), W("empat", 3), W("orang")];
  const turn = [0, 1, 2, 3].map((i) => W("keempatnya") + i * 0.16);
  const open = W("membukanya");
  const away = W("tempat");
  return { leave, back, insert, turn, open, away };
};

/**
 * Hook: keys hover over the plates (cover). They rise away when the story leaves the door, come back
 * in the payoff, go in one by one, turn together and ride the door leaves into the jambs.
 */
export const Keys: React.FC<{ t: number; open: number }> = ({ t, open }) => {
  const grain = useSurfaceGrain(859, 0.35, 2);
  const esc = useEscutcheon();
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#B98B3F", metalness: 1, roughness: 0.38, clearcoat: 0.2, envMapIntensity: 0.7 }), []);
  const hollow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0B0705" }), []);
  const B = useMemo(BEATS, []);
  // plates: present while the door picture is down
  const platesOn = (t < B.leave + 0.6 || (t > B.back - 1.2 && t < B.away + 0.5)) ? 1 : 0;
  const away = ramp(t, B.leave, B.leave + 1.3) * (1 - ramp(t, B.back, B.back + 1.1)) + ramp(t, B.away, B.away + 1.2);
  return (
    <group>
      {LOCKS.map(([u, v], i) => {
        const side = u < 0 ? -1 : 1;
        const x = u + side * open * (ARCH.jamb + 0.2);
        const vis = platesOn && Math.abs(x) < ARCH.jamb - 0.05;
        if (!vis) return null;
        return (
          <group key={`e${i}`} position={[x, 0.036, -v]}>
            <mesh geometry={esc} material={brass} />
            <mesh position={[0, 0.004, 0.02]} rotation={[-Math.PI / 2, 0, 0]} material={hollow}>
              <planeGeometry args={[0.2, 0.32]} />
            </mesh>
          </group>
        );
      })}
      {LOCKS.map(([u, v], i) => {
        const side = u < 0 ? -1 : 1;
        const x = u + side * open * (ARCH.jamb + 0.2);
        if (Math.abs(x) > ARCH.jamb - 0.05 || away > 0.999) return null;
        const ins = ramp(t, B.insert[i], B.insert[i] + 0.55) * (1 - ramp(t, B.away, B.away + 0.4));
        const turn = ramp(t, B.turn[i], B.turn[i] + 0.45) * (1 - ramp(t, B.away, B.away + 0.4));
        const bob = Math.sin(t * 1.3 + i * 1.7) * 0.025 * (1 - ins);
        const yaw0 = Math.sin(t * 0.6 + i) * 0.08 + (i - 1.5) * 0.1;
        const hover = 0.34 + bob + (i % 2) * 0.06;
        const y = hover * (1 - ins) + 0.0 * ins + away * (3.2 + i * 0.3);
        const tilt = -0.8 * (1 - ins);
        const yaw = yaw0 * (1 - ins) + turn * (Math.PI / 2);
        const sc = 1.25 * (1 - clamp01(away * 1.4 - 0.4));
        return (
          <group key={i} position={[x, y, -v + 0.05 * ins]} rotation={[tilt, 0, 0]}>
            <group rotation={[0, yaw, 0]}>
              <group scale={sc}><KeyMesh tone={0.85 + ((i * 37) % 10) / 40} grain={grain} /></group>
            </group>
          </group>
        );
      })}
    </group>
  );
};
