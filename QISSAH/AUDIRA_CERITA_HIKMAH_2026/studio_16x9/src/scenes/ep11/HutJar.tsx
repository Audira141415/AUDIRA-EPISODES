// EP11 — the old man's world: a tall glass jar on the table holding a wooden hut with a thatched roof,
// a porch with two benches and a low table, a mossy hill with pines, a dirt path, morning mist,
// condensation on the glass, and at night a warm window and fireflies.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeCorkTexture, makeGlassMaterial, makeSpeckleTexture } from "../../kits/terrarium/lib/materials";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { HUT, HUTSET, HUT_PATH, PAL, hutGround, polyDist, prng, softDiscTexture } from "./world";

const KIT_PROFILE: [number, number][] = [
  [0.001, 0], [0.86, 0], [0.96, 0.03], [0.995, 0.1], [1.0, 0.25], [1.0, 1.95], [0.985, 2.12], [0.93, 2.3], [0.82, 2.44],
  [0.68, 2.55], [0.61, 2.62], [0.6, 2.7], [0.63, 2.73], [0.64, 2.77], [0.6, 2.79],
];
const YS = 1.32;
const MOSS = 1500;
const DROPS = 520;
const FLIES = 18;

export const HutJar: React.FC<{ t: number; night: number; mist: number }> = ({ t, night, mist }) => {
  const R = HUT.r;
  const glass = useMemo(() => {
    const m = makeGlassMaterial();
    m.envMapIntensity = 0.7;
    m.depthWrite = false;
    return m;
  }, []);
  const jarGeo = useMemo(() => new THREE.LatheGeometry(KIT_PROFILE.map(([x, y]) => new THREE.Vector2(x * R, y * YS)), 128), [R]);
  const cork = useMemo(() => makeCorkTexture(), []);
  const disc = useMemo(() => softDiscTexture(0.25, 0.9), []);
  const grain = useSurfaceGrain(23, 0.3, 4); // thatch only
  const tex = useMemo(
    () => ({
      gravel: makeSpeckleTexture("#7C766C", ["#A8A194", "#5B564F", "#C9C2B4", "#6F6A60"], 21, 8),
      charcoal: makeSpeckleTexture(PAL.charcoal, ["#2E2C2B", "#0E0D0D"], 22, 8),
      soil: makeSpeckleTexture(PAL.soil, ["#4E3826", "#2A1D14", "#5D4632"], 23, 8),
    }),
    [],
  );

  const ground = useMemo(() => {
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, 110, 110);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const c = new THREE.Color();
    const r = prng(77);
    const lim = R * 0.965;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);
      const d = Math.hypot(x, z);
      if (d > lim) {
        x *= lim / d;
        z *= lim / d;
      }
      pos.setXYZ(i, x, hutGround(x, z), z);
      const pd = polyDist(HUT_PATH, x, z);
      c.set(pd < 0.1 ? "#8A6C4A" : pd < 0.16 ? "#6A5038" : PAL.soilTop).lerp(new THREE.Color(PAL.soil), r() * 0.4);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [R]);

  const layout = useMemo(() => {
    const r = prng(4242);
    const busy = (x: number, z: number) =>
      polyDist(HUT_PATH, x, z) < 0.14 ||
      (x > -0.8 && x < 0.85 && z > -0.95 && z < 0.68) || // hut + porch
      Math.hypot(x, z) > R * 0.93;
    const moss = [] as { x: number; z: number; s: number; c: string }[];
    let guard = 0;
    while (moss.length < MOSS && guard++ < 40000) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * R;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (busy(x, z)) continue;
      moss.push({ x, z, s: 0.025 + r() * 0.045, c: [PAL.mossA, PAL.mossB, PAL.mossC, PAL.mossD][Math.floor(r() * 4)] });
    }
    const trees = [
      [-1.0, -0.95, 1.25, 0], [-0.55, -1.3, 1.45, 0], [0.45, -1.25, 1.15, 1], [0.95, -0.8, 1.05, 0], [-1.25, -0.2, 0.95, 1], [1.2, -0.1, 0.8, 0],
      [-1.15, 0.65, 0.7, 0], [0.05, -1.4, 1.0, 1],
    ].filter(([x, z]) => Math.hypot(x, z) < R * 0.88) as [number, number, number, number][];
    const drops = Array.from({ length: DROPS }, () => ({ a: r() * Math.PI * 2, y: 1.0 + Math.pow(r(), 0.8) * 1.5, s: 0.005 + Math.pow(r(), 3) * 0.016 }));
    const flies = Array.from({ length: FLIES }, () => ({ a: r() * 6.28, rad: 0.3 + r() * 0.9, y: 0.95 + r() * 0.9, sp: 0.2 + r() * 0.4, ph: r() * 6.28 }));
    const mists = Array.from({ length: 6 }, (_, i) => ({ x: (r() - 0.5) * 1.8, z: (r() - 0.5) * 1.6, s: 1.0 + r() * 0.8, y: 0.12 + r() * 0.25, ph: i * 1.1 }));
    return { moss, trees, drops, flies, mists };
  }, [R]);

  const mossRef = useRef<THREE.InstancedMesh>(null);
  const dropRef = useRef<THREE.InstancedMesh>(null);
  const flyRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    const mm = mossRef.current!;
    layout.moss.forEach((m, i) => {
      o.position.set(m.x, hutGround(m.x, m.z) + m.s * 0.3, m.z);
      o.rotation.set(0, i, 0);
      o.scale.set(m.s, m.s * 0.68, m.s);
      o.updateMatrix();
      mm.setMatrixAt(i, o.matrix);
      mm.setColorAt(i, col.set(m.c));
    });
    mm.instanceMatrix.needsUpdate = true;
    if (mm.instanceColor) mm.instanceColor.needsUpdate = true;
    const dm = dropRef.current!;
    layout.drops.forEach((d, i) => {
      o.position.set(Math.cos(d.a) * R * 0.99, d.y, Math.sin(d.a) * R * 0.99);
      o.lookAt(0, d.y, 0);
      o.scale.set(d.s, d.s, d.s * 0.45);
      o.updateMatrix();
      dm.setMatrixAt(i, o.matrix);
    });
    dm.instanceMatrix.needsUpdate = true;
    const fm = flyRef.current!;
    layout.flies.forEach((q, i) => {
      const a = q.a + t * q.sp;
      const blink = 0.5 + 0.5 * Math.sin(t * 3 + q.ph);
      o.position.set(Math.cos(a) * q.rad, q.y + Math.sin(t * 0.8 + q.ph) * 0.1, Math.sin(a) * q.rad);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(0.0001 + 0.016 * night * (0.4 + 0.6 * blink));
      o.updateMatrix();
      fm.setMatrixAt(i, o.matrix);
    });
    fm.instanceMatrix.needsUpdate = true;
  }, [t, night, layout, R]);

  const [hx, hz] = HUTSET.hut;
  const hy = hutGround(hx, hz);
  const deckY = HUT.floor + 0.012;
  const wood = "#8A5F3C";
  const plank = (key: string, pos: [number, number, number], size: [number, number, number], color = wood) => (
    <mesh key={key} position={pos} castShadow receiveShadow>
      <RoundedBoxGeo args={size} radius={Math.min(...size) * 0.25} />
      <meshPhysicalMaterial color={color} {...POLISH.stone} roughness={0.7} sheen={0.2} />
    </mesh>
  );
  const windowGlow = 0.15 + night * 2.2;

  return (
    <group position={[HUT.cx, 0, HUT.cz]}>
      {/* wooden coaster under the jar */}
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[R + 0.1, R + 0.15, 0.06, 96]} />
        <meshPhysicalMaterial color="#5E3F2A" {...POLISH.stone} roughness={0.55} />
      </mesh>
      <group position={[0, 0.06, 0]}>
        {/* substrate bands */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[R * 0.985, R * 0.985, 0.24, 96, 1, true]} />
          <meshStandardMaterial map={tex.gravel} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[R * 0.986, R * 0.986, 0.06, 96, 1, true]} />
          <meshStandardMaterial map={tex.charcoal} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.3 + (HUT.floor - 0.06 - 0.3) / 2, 0]}>
          <cylinderGeometry args={[R * 0.987, R * 0.987, HUT.floor - 0.06 - 0.3, 96, 1, true]} />
          <meshStandardMaterial map={tex.soil} roughness={0.95} />
        </mesh>
        <mesh geometry={ground} position={[0, -0.06, 0]} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.95} />
        </mesh>
        <group position={[0, -0.06, 0]}>
          <instancedMesh ref={mossRef} args={[undefined, undefined, layout.moss.length]} castShadow receiveShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial roughness={0.95} />
          </instancedMesh>

          {/* trees */}
          {layout.trees.map(([x, z, h, kind], i) => (
            <group key={i} position={[x, hutGround(x, z), z]} rotation={[Math.sin(t * 0.6 + i) * 0.01, i * 1.7, 0]}>
              <mesh position={[0, h * 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.05, h * 0.4, 10]} />
                <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
              </mesh>
              {kind === 0
                ? [0, 1, 2].map((k) => (
                    <mesh key={k} position={[0, h * (0.36 + k * 0.2), 0]} castShadow>
                      <coneGeometry args={[h * (0.28 - k * 0.07), h * 0.4, 14]} />
                      <meshStandardMaterial color={["#2F5E34", "#3C6B36", "#2A5230"][i % 3]} roughness={0.8} />
                    </mesh>
                  ))
                : [[0, 0.6, 0, 0.28], [0.12, 0.5, 0.05, 0.2], [-0.1, 0.52, -0.05, 0.2]].map(([px, py, pz, s], k) => (
                    <mesh key={k} position={[px * h, py * h, pz * h]} castShadow>
                      <icosahedronGeometry args={[s * h, 2]} />
                      <meshStandardMaterial color={k % 2 ? PAL.mossB : PAL.mossA} roughness={0.9} flatShading />
                    </mesh>
                  ))}
            </group>
          ))}

          {/* the hut */}
          <group position={[hx, hy, hz]}>
            {plank("walls", [0, 0.29, 0], [0.92, 0.58, 0.66], "#9A6A43")}
            {[0, 1, 2, 3].map((i) => plank(`log${i}`, [0, 0.1 + i * 0.13, 0.335], [0.95, 0.035, 0.02], "#7A5232"))}
            {/* door + window on the porch side */}
            {plank("door", [0.18, 0.2, 0.34], [0.2, 0.38, 0.02], "#4E3320")}
            <mesh position={[-0.2, 0.33, 0.342]}>
              <planeGeometry args={[0.2, 0.15]} />
              <meshStandardMaterial color="#3A2A18" emissive="#FFB65C" emissiveIntensity={windowGlow} toneMapped={night < 0.5} />
            </mesh>
            {plank("sill", [-0.2, 0.25, 0.35], [0.26, 0.02, 0.04], "#6A4628")}
            {/* thatched roof: two slopes + ridge */}
            {[1, -1].map((sd) => (
              <mesh key={sd} position={[0, 0.72, sd * 0.2]} rotation={[sd * 0.62, 0, 0]} castShadow>
                <RoundedBoxGeo args={[1.12, 0.07, 0.56]} radius={0.03} />
                <meshPhysicalMaterial color="#C29B5C" {...POLISH.fabric} roughnessMap={grain} />
              </mesh>
            ))}
            <mesh position={[0, 0.89, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.14, 12]} />
              <meshPhysicalMaterial color="#9C7A44" {...POLISH.fabric} />
            </mesh>
            {/* gable ends */}
            {[1, -1].map((sd) => (
              <mesh key={`g${sd}`} position={[sd * 0.461, 0.58, 0]} rotation={[0, sd * Math.PI / 2, 0]}>
                <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-0.33, 0), new THREE.Vector2(0.33, 0), new THREE.Vector2(0, 0.28)])]} />
                <meshStandardMaterial color="#8A5E3A" side={THREE.DoubleSide} />
              </mesh>
            ))}
            <pointLight position={[0, 0.3, 0.6]} intensity={night * 1.4} distance={1.6} color="#FFB65C" />
          </group>

          {/* porch deck, benches, low table */}
          {plank("deck", [0.12, deckY + 0.0, 0.2], [1.3, 0.03, 0.78], "#8C6440")}
          {plank("benchO", [HUTSET.oldSeat[0], deckY + HUTSET.seatH / 2, HUTSET.oldSeat[1]], [0.14, HUTSET.seatH, 0.24], "#6E4A2C")}
          {plank("benchY", [HUTSET.youngSeat[0], deckY + HUTSET.seatH / 2, HUTSET.youngSeat[1]], [0.14, HUTSET.seatH, 0.24], "#6E4A2C")}
          {plank("table", [HUTSET.table[0], deckY + HUTSET.tableH / 2, HUTSET.table[1]], [0.24, HUTSET.tableH, 0.2], "#8A5530")}

          {/* morning mist */}
          {layout.mists.map((m, i) => (
            <mesh key={`m${i}`} position={[m.x + Math.sin(t * 0.15 + m.ph) * 0.2, HUT.floor + m.y, m.z]} rotation={[-Math.PI / 2 + 0.3, 0, 0]} scale={[m.s * 1.4, m.s * 0.6, 1]} renderOrder={13}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={disc} color="#FFFFFF" transparent opacity={0.0 * mist} depthWrite={false} fog={false} />
            </mesh>
          ))}
          <instancedMesh ref={flyRef} args={[undefined, undefined, FLIES]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={[2.4, 2.1, 1.0]} toneMapped={false} />
          </instancedMesh>
        </group>
      </group>

      {/* glass jar, condensation, cork */}
      <instancedMesh ref={dropRef} args={[undefined, undefined, DROPS]} renderOrder={11}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshPhysicalMaterial color="#F2F8F4" roughness={0.02} clearcoat={1} transparent opacity={0.35} depthWrite={false} />
      </instancedMesh>
      <mesh geometry={jarGeo} material={glass} renderOrder={10} />
      <mesh position={[0, 2.79 * YS + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.6 * R, 0.57 * R, 0.3, 48]} />
        <meshStandardMaterial map={cork} roughness={0.92} />
      </mesh>
    </group>
  );
};

export const hutWorld = (x: number, z: number, dy = 0): [number, number, number] => [HUT.cx + x, hutGround(x, z) + dy, HUT.cz + z];
