// The family home as a pop-up watercolour diorama on cold-press paper: a cutaway house (study on the
// left, Jessica's room on the right), a hinged paper facade that swings open like a book page,
// front yard, picket fence, street, painted hills and a sky wash behind.
import React from "react";
import * as THREE from "three";
import { DESK, DOOR_GAP, FENCE_Z, GATE_X, HOUSE, LAMP, STREET, TOYS, hash, type V3 } from "./layout";
import { PAL, paint, pencil } from "./paint";

const boxEdges = new Map<string, THREE.EdgesGeometry>();
const edgesOf = (w: number, h: number, d: number) => {
  const k = `${w}|${h}|${d}`;
  let g = boxEdges.get(k);
  if (!g) boxEdges.set(k, (g = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d))));
  return g;
};

/** Washed box with a graphite pencil contour. Position is the box centre. */
export const PBox: React.FC<{ p: V3; s: V3; c: string; r?: V3; lines?: boolean; shadow?: boolean }> = ({ p, s, c, r, lines = true, shadow = true }) => (
  <group position={p} rotation={r ?? [0, 0, 0]}>
    <mesh material={paint(c)} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
    {lines ? <lineSegments geometry={edgesOf(s[0] * 1.002, s[1] * 1.002, s[2] * 1.002)} material={pencil()} /> : null}
  </group>
);

export type Env = {
  facade: number; // 0 closed .. 1 swung open
  lamp: number; // Budi's cold desk lamp
  roomLight: number; // warm light in Jessica's room
  sky: string;
  hills: number; // 0 night .. 1 day colour of the painted hills
  stars: number;
  winGlow: number; // windows lit from inside (seen from outside)
  papers: number; // 0..1 extra paper piled on the desk over the weeks
  bookOnDesk: boolean;
  ball: V3;
  ballRot: number;
};


const Window: React.FC<{ p: V3; w: number; h: number; sky: string; glow: number }> = ({ p, w, h, sky, glow }) => (
  <group position={p}>
    <mesh position={[0, 0, 0.005]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={sky} toneMapped={false} />
    </mesh>
    {glow > 0 ? (
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#FFE2A0" transparent opacity={glow * 0.5} toneMapped={false} />
      </mesh>
    ) : null}
    {/* frame + cross bars */}
    <PBox p={[0, h / 2, 0.02]} s={[w + 0.08, 0.05, 0.04]} c="#F3EBDD" />
    <PBox p={[0, -h / 2, 0.03]} s={[w + 0.14, 0.06, 0.08]} c="#F3EBDD" />
    <PBox p={[-w / 2, 0, 0.02]} s={[0.05, h, 0.04]} c="#F3EBDD" />
    <PBox p={[w / 2, 0, 0.02]} s={[0.05, h, 0.04]} c="#F3EBDD" />
    <PBox p={[0, 0, 0.02]} s={[0.03, h, 0.03]} c="#F3EBDD" />
    <PBox p={[0, 0, 0.02]} s={[w, 0.03, 0.03]} c="#F3EBDD" />
  </group>
);

const Tree: React.FC<{ p: V3; s: number; c1: string; c2: string; f: number }> = ({ p, s, c1, c2, f }) => (
  <group position={p} scale={s} rotation={[0, 0, Math.sin(f * 0.9 + p[0]) * 0.02]}>
    <mesh material={paint(PAL.umber)} position={[0, 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.13, 1.2, 8]} />
    </mesh>
    <mesh material={paint(c1, { opacity: 0.9 })} position={[0, 1.45, 0]} castShadow>
      <sphereGeometry args={[0.62, 18, 14]} />
    </mesh>
    <mesh material={paint(c2, { opacity: 0.86 })} position={[0.3, 1.75, 0.15]} castShadow>
      <sphereGeometry args={[0.44, 16, 12]} />
    </mesh>
    <mesh material={paint(c2, { opacity: 0.86 })} position={[-0.32, 1.3, 0.2]} castShadow>
      <sphereGeometry args={[0.36, 16, 12]} />
    </mesh>
  </group>
);

const Papers: React.FC<{ n: number; seed: number }> = ({ n, seed }) => (
  <group>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[(hash(seed + i) - 0.5) * 0.02, 0.006 + i * 0.012, (hash(seed + i * 3) - 0.5) * 0.02]} rotation={[0, (hash(seed + i * 7) - 0.5) * 0.25, 0]} material={paint(i % 4 === 3 ? "#E9E2D2" : "#FBF8F1")} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.01, 0.32]} />
      </mesh>
    ))}
  </group>
);

const Toys: React.FC = () => (
  <group position={TOYS}>
    {/* toy chest */}
    <PBox p={[0.05, 0.16, -0.12]} s={[0.62, 0.32, 0.36]} c="#C98D6B" />
    <PBox p={[0.05, 0.33, -0.12]} s={[0.64, 0.03, 0.38]} c="#B77B5B" />
    {/* blocks */}
    <PBox p={[-0.38, 0.06, 0.18]} s={[0.12, 0.12, 0.12]} c={PAL.cobalt} r={[0, 0.4, 0]} />
    <PBox p={[-0.28, 0.06, 0.32]} s={[0.12, 0.12, 0.12]} c={PAL.rose} r={[0, -0.3, 0]} />
    <PBox p={[-0.33, 0.18, 0.24]} s={[0.12, 0.12, 0.12]} c={PAL.ochre} r={[0, 0.9, 0]} />
    {/* teddy bear */}
    <group position={[0.3, 0.34, 0.12]} rotation={[0, -0.5, 0]}>
      <mesh material={paint("#B98B62")} position={[0, 0.1, 0]} castShadow><sphereGeometry args={[0.12, 16, 12]} /></mesh>
      <mesh material={paint("#B98B62")} position={[0, 0.27, 0]} castShadow><sphereGeometry args={[0.085, 16, 12]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={paint("#9C7350")} position={[s * 0.065, 0.34, 0]}><sphereGeometry args={[0.032, 10, 8]} /></mesh>
      ))}
      <mesh material={paint("#2c2624")} position={[0, 0.26, 0.08]}><sphereGeometry args={[0.014, 8, 6]} /></mesh>
    </group>
    {/* small doll house roof shape & rug */}
    <mesh position={[0, 0.003, 0.3]} rotation={[-Math.PI / 2, 0, 0]} material={paint("#D9A3B4")} receiveShadow>
      <circleGeometry args={[0.6, 32]} />
    </mesh>
  </group>
);

export const World: React.FC<{ env: Env; t: number }> = ({ env, t }) => {
  const H = HOUSE;
  const W = H.x1 - H.x0;
  const D = H.z1 - H.z0;
  const cx = (H.x0 + H.x1) / 2;
  const cz = (H.z0 + H.z1) / 2;
  const roofRise = H.apex - H.h;
  const roofLen = Math.hypot(W / 2, roofRise);
  const roofAng = Math.atan2(roofRise, W / 2);
  const hingeAng = -env.facade * Math.PI * 0.62;
  return (
    <group>
      {/* paper ground and sky wash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={paint(PAL.paper)} receiveShadow>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[40, 32, 16]} />
        <meshBasicMaterial color={env.sky} toneMapped={false} side={THREE.BackSide} />
      </mesh>
      {/* stars */}
      {env.stars > 0.01
        ? Array.from({ length: 44 }, (_, i) => (
            <mesh key={i} position={[(hash(i) - 0.5) * 22, 4.5 + hash(i + 50) * 9, -13.8]}>
              <circleGeometry args={[0.035 + hash(i + 9) * 0.05, 8]} />
              <meshBasicMaterial color={new THREE.Color("#FFF1C6").multiplyScalar(1.4)} transparent opacity={env.stars * (0.55 + 0.45 * Math.sin(t * 1.3 + i))} toneMapped={false} />
            </mesh>
          ))
        : null}
      {/* painted hills (translucent washes) */}
      {[
        [-7, -10, 7, 0x0],
        [6, -9, 6.5, 0x1],
        [-1, -7.5, 5.5, 0x2],
        [-6, 13, 6, 0x2],
        [6, 14, 7, 0x1],
      ].map(([x, z, r, k], i) => (
        <mesh key={i} position={[x, -0.2, z]} scale={[1.5, 0.55, 1]} material={paint(new THREE.Color(k === 2 ? PAL.sage : PAL.cobalt).lerp(new THREE.Color("#22304a"), 0.55 * (1 - env.hills)).getStyle(), { opacity: 0.88 })}>
          <sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ))}
      <Tree p={[-5.0, 0, 1.0]} s={1.25} c1={PAL.pine} c2={PAL.sage} f={t} />
      <Tree p={[4.7, 0, -1.2]} s={1.45} c1={PAL.pine} c2={PAL.sage} f={t + 2} />
      <Tree p={[-4.2, 0, -3.8]} s={1.1} c1={PAL.sage} c2={"#93B48F"} f={t + 4} />
      <Tree p={[-1.8, 0, 8.2]} s={1.3} c1={PAL.pine} c2={PAL.sage} f={t + 1} />
      <Tree p={[3.6, 0, 8.8]} s={1.5} c1={PAL.sage} c2={"#93B48F"} f={t + 3} />

      {/* yard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, (H.z1 + FENCE_Z) / 2 - 0.6]} material={paint("#A9C79A")} receiveShadow>
        <planeGeometry args={[W + 3.6, FENCE_Z - H.z0 + 2.2]} />
      </mesh>
      {/* stepping stone path */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, hash(i) * 2]} position={[GATE_X + (hash(i + 4) - 0.5) * 0.1, 0.012, H.z1 + 0.35 + i * 0.47]} material={paint("#D8CDBB")} receiveShadow>
          <circleGeometry args={[0.17, 12]} />
        </mesh>
      ))}
      {/* picket fence with a gate gap */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = -4.6 + i * 0.32;
        if (Math.abs(x - GATE_X) < 0.42) return null;
        return <PBox key={i} p={[x, 0.32, FENCE_Z]} s={[0.07, 0.64, 0.04]} c="#F6F0E4" />;
      })}
      <PBox p={[GATE_X - 2.95, 0.42, FENCE_Z - 0.03]} s={[5.2, 0.05, 0.03]} c="#EDE4D4" />
      <PBox p={[GATE_X + 2.6, 0.42, FENCE_Z - 0.03]} s={[4.4, 0.05, 0.03]} c="#EDE4D4" />
      {/* street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, (STREET.z0 + STREET.z1) / 2]} material={paint("#9AA2A8")} receiveShadow>
        <planeGeometry args={[40, STREET.z1 - STREET.z0]} />
      </mesh>
      <PBox p={[0, 0.04, STREET.z0 - 0.06]} s={[40, 0.08, 0.14]} c="#D9D3C8" lines={false} />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-11 + i * 2, 0.008, (STREET.z0 + STREET.z1) / 2]} material={paint("#F4EFE3")}>
          <planeGeometry args={[0.9, 0.08]} />
        </mesh>
      ))}
      {/* street lamp */}
      <group position={[-2.7, 0, STREET.z0 - 0.3]}>
        <PBox p={[0, 1.2, 0]} s={[0.07, 2.4, 0.07]} c="#4B4F57" />
        <mesh position={[0, 2.45, 0]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color={new THREE.Color("#FFE7B0").multiplyScalar(1 + env.stars * 1.5)} toneMapped={false} />
        </mesh>
      </group>

      {/* house: floor, walls, partition with doorway */}
      <PBox p={[cx, -0.06, cz]} s={[W + 0.2, 0.14, D + 0.2]} c="#D9BC93" />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[H.x0 + 0.35 + i * 0.7, 0.012, cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, D]} />
          <meshBasicMaterial color="#9C7B57" transparent opacity={0.35} />
        </mesh>
      ))}
      {/* back walls: study cool grey-blue, Jessica's room warm rose */}
      <PBox p={[(H.x0 + H.part) / 2, H.h / 2, H.z0 - 0.05]} s={[H.part - H.x0, H.h, 0.1]} c="#B7C5D0" />
      <PBox p={[(H.part + H.x1) / 2, H.h / 2, H.z0 - 0.05]} s={[H.x1 - H.part, H.h, 0.1]} c="#F0D3C0" />
      <PBox p={[H.x0 - 0.05, H.h / 2, cz]} s={[0.1, H.h, D]} c="#A9B8C4" />
      <PBox p={[H.x1 + 0.05, H.h / 2, cz]} s={[0.1, H.h, D]} c="#E8C6B3" />
      {/* partition */}
      <PBox p={[H.part, H.h / 2, (H.z0 + DOOR_GAP.z0) / 2]} s={[0.1, H.h, DOOR_GAP.z0 - H.z0]} c="#E6D7C6" />
      <PBox p={[H.part, H.h / 2, (DOOR_GAP.z1 + H.z1) / 2]} s={[0.1, H.h, H.z1 - DOOR_GAP.z1]} c="#E6D7C6" />
      <PBox p={[H.part, (H.h + DOOR_GAP.top) / 2, (DOOR_GAP.z0 + DOOR_GAP.z1) / 2]} s={[0.1, H.h - DOOR_GAP.top, DOOR_GAP.z1 - DOOR_GAP.z0]} c="#E6D7C6" />
      {/* ceiling beam + roof */}
      <PBox p={[cx, H.h + 0.04, cz]} s={[W + 0.2, 0.08, D + 0.2]} c="#E9DCC8" />
      {[-1, 1].map((s) => (
        <PBox key={s} p={[cx + (s * W) / 4, H.h + roofRise / 2 + 0.05, cz]} s={[roofLen + 0.3, 0.1, D + 0.5]} r={[0, 0, -s * roofAng]} c="#B5584E" />
      ))}
      {/* back windows */}
      <Window p={[-2.35, 1.55, H.z0 + 0.01]} w={0.9} h={0.95} sky={env.sky} glow={0} />
      <Window p={[1.85, 1.5, H.z0 + 0.01]} w={0.85} h={0.9} sky={env.sky} glow={0} />
      {/* framed picture + calendar */}
      <PBox p={[-0.5, 1.7, H.z0 + 0.03]} s={[0.5, 0.38, 0.03]} c="#E4D6BE" />
      <PBox p={[2.85, 1.6, H.z0 + 0.03]} s={[0.36, 0.46, 0.02]} c="#FBF3E2" />

      {/* desk, chair, lamp, papers */}
      <PBox p={[DESK.x, DESK.h - 0.025, DESK.z]} s={[DESK.w, 0.05, DESK.d]} c="#8B6346" />
      {[-1, 1].map((s) => (
        <PBox key={s} p={[DESK.x + s * (DESK.w / 2 - 0.2), (DESK.h - 0.05) / 2, DESK.z]} s={[0.36, DESK.h - 0.05, DESK.d - 0.06]} c="#7B5943" />
      ))}
      <group position={[DESK.x, 0, -1.72]}>
        <PBox p={[0, 0.46, 0]} s={[0.5, 0.06, 0.46]} c="#5C6E7E" />
        <PBox p={[0, 0.82, -0.25]} s={[0.5, 0.66, 0.06]} c="#5C6E7E" />
        <PBox p={[0, 0.22, 0]} s={[0.06, 0.44, 0.06]} c="#3E3A38" />
      </group>
      <group position={[DESK.x, DESK.h, DESK.z]}>
        <group position={[0.32, 0, -0.12]}><Papers n={9 + Math.round(env.papers * 14)} seed={3} /></group>
        <group position={[0.58, 0, -0.08]}><Papers n={6 + Math.round(env.papers * 18)} seed={11} /></group>
        <group position={[-0.05, 0, 0.12]} rotation={[0, 0.2, 0]}><Papers n={2} seed={21} /></group>
        {env.papers > 0.3 ? <group position={[-0.3, 0, 0.1]} rotation={[0, -0.3, 0]}><Papers n={Math.round(env.papers * 10)} seed={41} /></group> : null}
        {/* coffee mug */}
        <mesh position={[-0.6, 0.06, 0.18]} material={paint("#E7E2D6")} castShadow><cylinderGeometry args={[0.04, 0.035, 0.11, 14]} /></mesh>
      </group>
      {/* cold desk lamp */}
      <group position={LAMP}>
        <PBox p={[0, 0.015, 0]} s={[0.18, 0.03, 0.14]} c="#3D4552" />
        <PBox p={[0.02, 0.24, 0]} s={[0.03, 0.46, 0.03]} c="#3D4552" r={[0, 0, -0.18]} />
        <mesh position={[0.12, 0.46, 0.06]} rotation={[0.5, 0, -0.9]} material={paint("#3D4552", { side: THREE.DoubleSide })}>
          <coneGeometry args={[0.1, 0.16, 16, 1, true]} />
        </mesh>
        <mesh position={[0.15, 0.42, 0.09]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshBasicMaterial color={new THREE.Color("#DDEBFF").multiplyScalar(0.5 + 1.2 * env.lamp)} toneMapped={false} />
        </mesh>
        <spotLight position={[0.15, 0.42, 0.09]} target-position={[LAMP[0] + 0.6, 0, LAMP[2] + 0.25]} angle={0.95} penumbra={0.7} intensity={env.lamp * 2.6} distance={4} decay={1.6} color="#CFE0FF" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0.2, 0.5, 0.3]} color="#C9DBFF" intensity={env.lamp * 0.35} distance={3} decay={2} />
      </group>
      {/* Jessica's room: bed, toys, warm light */}
      <group position={[1.2, 0, -1.95]}>
        <PBox p={[0.1, 0.18, 0]} s={[1.2, 0.26, 0.7]} c="#F3E7D6" />
        <PBox p={[0.1, 0.33, 0]} s={[1.16, 0.06, 0.66]} c="#E9A3A0" />
        <PBox p={[-0.48, 0.4, 0]} s={[0.06, 0.6, 0.72]} c="#C98D6B" />
        <mesh position={[-0.3, 0.42, 0]} material={paint("#FBF8F1")} castShadow><sphereGeometry args={[0.12, 14, 10]} /></mesh>
      </group>
      <Toys />
      <pointLight position={[2.0, 2.3, -0.8]} color="#FFC98A" intensity={env.roomLight * 2.4} distance={5} decay={1.6} />
      {/* the red ball */}
      <mesh position={env.ball} rotation={[env.ballRot, 0, env.ballRot * 0.4]} material={paint("#D2524A")} castShadow>
        <sphereGeometry args={[0.1, 20, 14]} />
      </mesh>

      {/* hinged facade: a paper page that swings open on its left edge */}
      <group position={[H.x0 - 0.02, 0, H.z1 + 0.06]} rotation={[0, hingeAng, 0]}>
        {env.facade < 0.995 ? (
          <group position={[W / 2 + 0.02, 0, 0]}>
            <PBox p={[0, H.h / 2, 0]} s={[W + 0.2, H.h, 0.08]} c="#EBD8BF" />
            {/* gable */}
            <mesh position={[0, H.h, 0.0]} material={paint("#E2C9A8")}>
              <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-W / 2 - 0.1, 0), new THREE.Vector2(W / 2 + 0.1, 0), new THREE.Vector2(0, roofRise + 0.05)])]} />
            </mesh>
            {/* door */}
            <PBox p={[GATE_X - cx, 0.95, 0.06]} s={[0.78, 1.9, 0.04]} c="#5F7F9E" />
            <mesh position={[GATE_X - cx + 0.26, 0.95, 0.09]} material={paint("#E8AB48")}><sphereGeometry args={[0.04, 10, 8]} /></mesh>
            {/* windows */}
            {[-1.75, -0.35, 2.35].map((x, i) => (
              <group key={i} position={[x, 1.55, 0.05]}>
                <mesh>
                  <planeGeometry args={[0.8, 0.8]} />
                  <meshBasicMaterial color={new THREE.Color(env.sky).lerp(new THREE.Color("#FFD58A"), env.winGlow).multiplyScalar(1 + env.winGlow * 0.6)} toneMapped={false} />
                </mesh>
                <PBox p={[0, 0, 0.01]} s={[0.86, 0.04, 0.03]} c="#F6F0E4" />
                <PBox p={[0, 0, 0.01]} s={[0.04, 0.86, 0.03]} c="#F6F0E4" />
                <PBox p={[0, -0.44, 0.03]} s={[0.98, 0.06, 0.1]} c="#F6F0E4" />
                {/* flower box */}
                <PBox p={[0, -0.55, 0.08]} s={[0.8, 0.14, 0.14]} c="#B9775A" />
                {[-0.28, -0.1, 0.1, 0.28].map((fx, k) => (
                  <mesh key={k} position={[fx, -0.44, 0.1]} material={paint(k % 2 ? PAL.rose : PAL.ochre)}><sphereGeometry args={[0.055, 10, 8]} /></mesh>
                ))}
              </group>
            ))}
          </group>
        ) : null}
      </group>
      {/* moon / sun disc in the sky wash */}
      <mesh position={[4.5, 9.5, -13.7]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color={new THREE.Color("#FFF4DA").multiplyScalar(1.1)} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
};
