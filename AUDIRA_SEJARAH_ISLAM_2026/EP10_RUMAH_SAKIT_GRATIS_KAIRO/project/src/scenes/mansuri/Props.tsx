import React, { useMemo } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE, CONE, CYL } from "../../kits/feltcraft/scene/Fuzzy";
import { mulberry32, stepT } from "../../kits/feltcraft/core/motion";
import { RunningStitch, felt } from "./stitch";
import { M } from "./palette";

type V3 = [number, number, number];

/**
 * Small faceless felt figure (history rule: no faces, no features, ever). Robe cone, round wool
 * head, wrapped head cloth. `rich` = wide white turban with gold band and a gold-trimmed red robe
 * (the "raja" end); otherwise a plain robe, a wrapped cream head cloth and a shoulder shawl.
 * `veil` = a long head scarf (women's ward); `satchel` = a doctor's bag.
 */
export const FeltFigure: React.FC<{ position: V3; rich?: boolean; walk: number; seed: number; yaw?: number; veil?: boolean; satchel?: boolean; robe?: string; staff?: boolean }> = ({
  position,
  rich = false,
  walk,
  seed,
  yaw = Math.PI,
  veil = false,
  satchel = false,
  robe: robeProp,
  staff = false,
}) => {
  const step = Math.floor(walk * 2.4);
  const bob = step % 2 ? 0.018 : 0;
  const sway = (step % 2 ? 1 : -1) * 0.035;
  const r = mulberry32(step * 31 + seed);
  const jit = (r() - 0.5) * 0.006;
  const robe = robeProp ?? (rich ? "#9C2F2C" : veil ? "#5C6E9A" : "#8C6A48");
  const skin = "#B98A64";
  return (
    <group position={[position[0] + jit, position[1] + bob, position[2]]} rotation={[0, yaw, sway]}>
      <Fuzzy geometry={CONE} color={robe} shells={2} spacing={0.02} position={[0, 0.26, 0]} scale={[0.15, 0.52, 0.13]} />
      {/* shoulders */}
      <Fuzzy geometry={SPHERE} color={robe} shells={2} spacing={0.025} position={[0, 0.47, 0]} scale={[0.12, 0.08, 0.1]} />
      {rich && (
        <>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={felt(M.gold, 0.6)}>
            <torusGeometry args={[0.105, 0.016, 6, 24]} />
          </mesh>
          <RunningStitch color={M.gold} pts={[[0, 0.06, -0.15], [0, 0.42, -0.11]]} dash={0.04} gap={0.03} r={0.008} />
        </>
      )}
      {!rich && !veil && (
        // shawl over the shoulders, stitched hem
        <>
          <Fuzzy geometry={SPHERE} color="#E9D8B4" shells={1} spacing={0.02} position={[0, 0.49, 0]} scale={[0.135, 0.05, 0.115]} />
          <mesh position={[0, 0.465, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.122, 0.006, 5, 24]} />
            <meshStandardMaterial color={M.rust} roughness={1} />
          </mesh>
        </>
      )}
      {/* neck + head (no face) */}
      <mesh position={[0, 0.535, 0]} material={felt(skin, 0.5)}>
        <cylinderGeometry args={[0.03, 0.035, 0.05, 10]} />
      </mesh>
      <Fuzzy geometry={SPHERE} color={skin} shells={1} spacing={0.02} position={[0, 0.605, 0]} scale={[0.072, 0.078, 0.072]} />
      {rich ? (
        <group position={[0, 0.65, 0]}>
          <Fuzzy geometry={SPHERE} color="#FBF5EA" shells={2} spacing={0.03} scale={[0.105, 0.08, 0.1]} />
          <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={felt(M.gold, 0.6)}>
            <torusGeometry args={[0.1, 0.012, 6, 24]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} material={felt("#B33A2F", 0.6)}>
            <sphereGeometry args={[0.035, 12, 8]} />
          </mesh>
        </group>
      ) : veil ? (
        <Fuzzy geometry={SPHERE} color="#E9D8B4" shells={1} spacing={0.02} position={[0, 0.58, 0]} scale={[0.09, 0.115, 0.088]} />
      ) : (
        // wrapped head cloth: a fat ring + a rounded crown, clearly a cloth, not a lump
        <group position={[0, 0.645, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={felt("#F1E6CF", 0.6)} castShadow>
            <torusGeometry args={[0.062, 0.028, 8, 20]} />
          </mesh>
          <Fuzzy geometry={SPHERE} color="#E3D2B0" shells={1} spacing={0.02} position={[0, 0.02, 0]} scale={[0.058, 0.04, 0.058]} />
          <RunningStitch color={M.rust} pts={Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [Math.sin(a) * 0.088, 0, Math.cos(a) * 0.088] as V3; })} dash={0.02} gap={0.015} r={0.005} />
        </group>
      )}
      {(staff || (!rich && !veil && !satchel && robeProp === undefined)) && (
        // walking staff
        <mesh position={[0.13, 0.3, 0.02]} rotation={[0, 0, -0.08]} material={felt(M.wood, 0.5)} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.62, 6]} />
        </mesh>
      )}
      {satchel && (
        <mesh position={[0.14, 0.3, 0.04]} material={felt(M.wood, 0.5)} castShadow>
          <boxGeometry args={[0.1, 0.09, 0.06]} />
        </mesh>
      )}
    </group>
  );
};

/** Patchwork ground: felt squares in four sand tones with stitched seams (texture for the whole diorama). */
const Patchwork: React.FC = () => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const S = 1.5;
  const NX = 20;
  const NZ = 15;
  const mat = useMemo(() => felt("#FFFFFF", 1.2), []);
  React.useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const rnd = mulberry32(1010);
    const tones = ["#C8AE84", "#BFA176", "#D2BA92", "#B59670", "#CDB48A"].map((c) => new THREE.Color(c));
    let i = 0;
    for (let ix = 0; ix < NX; ix++)
      for (let iz = 0; iz < NZ; iz++) {
        o.position.set(-15 + (ix + 0.5) * S, 0.004, -12.5 + (iz + 0.5) * S);
        o.rotation.set(0, (rnd() - 0.5) * 0.03, 0);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        m.setColorAt(i, tones[Math.floor(rnd() * tones.length)]);
        i++;
      }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [mat]);
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, mat, NX * NZ]} receiveShadow>
        <boxGeometry args={[S - 0.03, 0.008, S - 0.03]} />
      </instancedMesh>
      {Array.from({ length: NX - 1 }, (_, i) => (
        <RunningStitch key={`x${i}`} linear color={M.thread} dash={0.07} gap={0.06} r={0.008} pts={[[-15 + (i + 1) * S, 0.012, -12.5], [-15 + (i + 1) * S, 0.012, 9.5]]} />
      ))}
      {Array.from({ length: NZ - 1 }, (_, i) => (
        <RunningStitch key={`z${i}`} linear color={M.thread} dash={0.07} gap={0.06} r={0.008} pts={[[-15, 0.012, -12.5 + (i + 1) * S], [15, 0.012, -12.5 + (i + 1) * S]]} />
      ))}
    </group>
  );
};

/** Courtyard ground, the stitched path to the gate, and a small octagonal fountain basin. */
export const Courtyard: React.FC = () => {
  const pathEdge = (s: number): V3[] => Array.from({ length: 12 }, (_, i) => [s * (0.48 + i * 0.03), 0.03, 0.62 + i * 0.32]);
  return (
    <group>
      <mesh position={[0, -0.1, -1.5]} material={felt(M.ground, 6)} receiveShadow>
        <boxGeometry args={[30, 0.2, 22]} />
      </mesh>
      <Patchwork />
      <mesh position={[0, 0.02, 2.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-0.5, 1.85), new THREE.Vector2(0.5, 1.85), new THREE.Vector2(0.86, -1.7), new THREE.Vector2(-0.86, -1.7)])]} />
        <meshPhysicalMaterial color={M.path} roughness={1} sheen={1} sheenColor="#FFFFFF" />
      </mesh>
      <RunningStitch color={M.rust} pts={pathEdge(-1)} />
      <RunningStitch color={M.rust} pts={pathEdge(1)} />
      {/* fountain basin (left) */}
      <group position={[-1.35, 0, 1.15]}>
        <mesh material={felt(M.cream, 1)} position={[0, 0.09, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.45, 0.18, 8]} />
        </mesh>
        <mesh position={[0, 0.185, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.02, 24]} />
          <meshPhysicalMaterial color={M.water} roughness={0.25} sheen={0.6} clearcoat={0.6} clearcoatRoughness={0.2} />
        </mesh>
        <RunningStitch color={M.rust} pts={Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [Math.sin(a) * 0.455, 0.12, Math.cos(a) * 0.455] as V3; })} />
        <mesh material={felt(M.sandDeep, 1)} position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.3, 8]} />
        </mesh>
      </group>
    </group>
  );
};

/** Foreground notions: wooden spool (left) and medicine jars + folded clothes (right). */
export const Foreground: React.FC<{ t: number }> = ({ t }) => {
  const ts = stepT(t);
  const jar = useMemo(() => {
    const pts = [0, 0.09, 0.12, 0.1, 0.085, 0.1, 0.11, 0.06, 0.07].map((r, i) => new THREE.Vector2(r, i * 0.05));
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  return (
    <group>
      {/* spool with red thread */}
      <group position={[-1.3, 0, 2.75]} rotation={[0, 0.5, 0]}>
        {[0, 0.5].map((y) => (
          <mesh key={y} position={[0, y + 0.035, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.27, 0.07, 32]} />
            <meshPhysicalMaterial color="#D9B98C" roughness={0.55} clearcoat={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.46, 32]} />
          <meshPhysicalMaterial color={M.rust} roughness={0.9} sheen={1} sheenColor="#F2B9A0" />
        </mesh>
      </group>
      {/* apothecary jars (albarello) */}
      {[
        { p: [1.05, 0, 2.55] as V3, c: "#3F6E9E", s: 1.15 },
        { p: [1.4, 0, 2.3] as V3, c: "#2F5A4A", s: 0.9 },
      ].map((j, i) => (
        <group key={i} position={j.p} scale={j.s} rotation={[0, ts * 0 + i, 0]}>
          <mesh geometry={jar} material={felt(j.c, 0.8)} castShadow receiveShadow />
          <RunningStitch color={M.thread} pts={Array.from({ length: 13 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return [Math.sin(a) * 0.112, 0.2, Math.cos(a) * 0.112] as V3; })} dash={0.03} gap={0.02} r={0.007} />
          <mesh position={[0, 0.42, 0]} material={felt(M.cream, 0.6)} castShadow>
            <cylinderGeometry args={[0.085, 0.075, 0.05, 16]} />
          </mesh>
        </group>
      ))}
      {/* folded clothes tied with thread (the payoff gift, planted early) */}
      <group position={[0.62, 0, 2.95]} rotation={[0, -0.35, 0]}>
        {["#5C8FA8", "#E9D8B4", "#9C2F2C"].map((c, i) => (
          <mesh key={i} position={[0, 0.045 + i * 0.085, 0]} material={felt(c, 0.8)} castShadow receiveShadow>
            <boxGeometry args={[0.42 - i * 0.03, 0.08, 0.3 - i * 0.02]} />
          </mesh>
        ))}
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.13, 0.008, 6, 20]} />
          <meshStandardMaterial color={M.thread} roughness={1} />
        </mesh>
      </group>
    </group>
  );
};

/** Pompom clouds on threads and a felt sun button. */
export const Sky: React.FC<{ t: number; night?: number }> = ({ t, night = 0 }) => {
  const ts = stepT(t);
  const skyMat = useMemo(() => felt(M.sky, 4).clone() as THREE.MeshPhysicalMaterial, []);
  skyMat.color.set(M.sky).lerp(new THREE.Color("#1C2740"), night);
  return (
    <group>
      <mesh position={[0, 4, -11]} material={skyMat} receiveShadow>
        <planeGeometry args={[40, 24]} />
      </mesh>
      {[
        [-3.6, 6.4, -10.2],
        [3.4, 5.6, -10.0],
        [-8.5, 5.4, -10.4],
        [8.8, 6.1, -10.4],
      ].map((p, i) => (
        <group key={i} position={[p[0] + Math.sin(ts * 0.8 + i * 2) * 0.06, p[1], p[2]]} scale={1.9}>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 4.2, 5]} />
            <meshStandardMaterial color={M.thread} roughness={1} />
          </mesh>
          {[-1, 0, 1].map((k) => (
            <Fuzzy key={k} geometry={SPHERE} color="#FFFFFF" position={[k * 0.3, k === 0 ? 0.09 : 0, 0]} scale={k === 0 ? 0.3 : 0.24} shells={3} spacing={0.05} />
          ))}
        </group>
      ))}
      <group position={[2.8, 4.7 - night * 4.5, -10.6]} rotation={[Math.PI / 2, 0, 0]} scale={2}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 48]} />
          <meshPhysicalMaterial color="#F2B53B" roughness={0.4} clearcoat={0.5} sheen={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.13, -0.06, Math.sin(a) * 0.13]}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
              <meshBasicMaterial color="#7A4A10" />
            </mesh>
          );
        })}
      </group>
      {/* far felt skyline of Cairo (flat cut-outs) */}
      {[
        { x: -9.5, h: 2.4, dome: true },
        { x: -7.6, h: 3.6, dome: false },
        { x: -4.8, h: 2.8, dome: true },
        { x: -3.2, h: 4.2, dome: false },
        { x: 4.0, h: 2.9, dome: true },
        { x: 5.4, h: 4.4, dome: false },
        { x: 7.8, h: 2.5, dome: true },
        { x: 9.6, h: 3.8, dome: false },
      ].map((b, i) => (
        <group key={i} position={[b.x, 0, -10.2]} scale={[1.8, 1, 1]}>
          <mesh material={felt("#A88D6C", 1.5)} position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.dome ? 0.9 : 0.24, b.h, 0.06]} />
          </mesh>
          {b.dome ? (
            <mesh material={felt("#A88D6C", 1.5)} position={[0, b.h, 0]} scale={[0.4, 0.5, 0.06]}>
              <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          ) : (
            <mesh material={felt("#A88D6C", 1.5)} position={[0, b.h + 0.15, 0]}>
              <coneGeometry args={[0.14, 0.3, 8]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

export { CYL };
