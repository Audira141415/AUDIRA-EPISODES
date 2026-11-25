// EP11 — the big vessel: a wide glass cloche on a walnut plinth holding a whole forest lake
// (substrate bands, shore of moss, pines and round moss trees, ferns, stones, mist, condensation,
// the two figures on the shore and the salt that sparkles and vanishes in the water).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGlassMaterial, makeSpeckleTexture, makeWoodTexture } from "../../kits/terrarium/lib/materials";
import { CLEAR, LAKE, LAKE_PATH, PAL, SHORE, WATER_Y, clamp, plaqueTexture, polyDist, prng, shoreY, softDiscTexture } from "./world";

const R = LAKE.R;
const MOSS = 2600;
const DROPS = 900;
const SPARK = 140;
const LEAFLETS = 18;

const PROFILE: [number, number][] = (() => {
  const p: [number, number][] = [
    [0.001, 0],
    [R * 0.99, 0],
    [R, 0.06],
    [R, 1.35],
  ];
  for (let i = 1; i <= 14; i++) {
    const a = (i / 14) * (Math.PI / 2);
    p.push([Math.max(0.36, R * Math.cos(a)), 1.35 + 1.75 * Math.sin(a)]);
  }
  p.push([0.38, 3.12], [0.3, 3.16], [0.001, 3.17]);
  return p;
})();

type Tree = { x: number; z: number; h: number; kind: "pine" | "round"; c: string };
type Fern = { x: number; z: number; fronds: number; size: number };

const blocked = (x: number, z: number, path = 0.17) => polyDist(LAKE_PATH, x, z) < path || CLEAR.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r);
const FLIES = 40;

/** Vessel-local hand position + scatter progress drive the salt; `stir` drives the stick ripples. */
export const LakeVessel: React.FC<{ t: number; scatter: number; stir: number; night: number; hand: [number, number, number] }> = ({ t, scatter, stir, night, hand: handIn }) => {
  const glass = useMemo(() => {
    const m = makeGlassMaterial();
    m.thickness = 0.08;
    m.attenuationDistance = 6;
    m.envMapIntensity = 0.7;
    m.depthWrite = false; // mist / ripples drawn after the glass must not be clipped by it
    return m;
  }, []);
  const vesselGeo = useMemo(() => new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 160), []);
  const wood = useMemo(() => makeWoodTexture(), []);
  const plaque = useMemo(() => plaqueTexture(), []);
  const disc = useMemo(() => softDiscTexture(0.25, 0.9), []);
  const tex = useMemo(
    () => ({
      gravel: makeSpeckleTexture("#7C766C", ["#A8A194", "#5B564F", "#C9C2B4", "#6F6A60"], 11, 14),
      charcoal: makeSpeckleTexture(PAL.charcoal, ["#2E2C2B", "#0E0D0D"], 12, 14),
      soil: makeSpeckleTexture(PAL.soil, ["#4E3826", "#2A1D14", "#5D4632"], 13, 14),
    }),
    [],
  );

  const shore = useMemo(() => {
    const g = new THREE.PlaneGeometry(2 * R, 2 * R, 160, 160);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols: number[] = [];
    const c = new THREE.Color();
    const r = prng(91);
    const lim = R * 0.975;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);
      const d = Math.hypot(x, z);
      if (d > lim) {
        x *= lim / d;
        z *= lim / d;
      }
      pos.setXYZ(i, x, shoreY(x, z), z);
      const wet = shoreY(x, z) < WATER_Y + 0.04 ? 1 : 0;
      const pd = polyDist(LAKE_PATH, x, z);
      c.set(wet ? "#3A3020" : pd < 0.15 ? "#8A6C4A" : pd < 0.22 ? "#6A5038" : PAL.soilTop).lerp(new THREE.Color(PAL.soil), r() * 0.6);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  const lakeGeo = useMemo(() => {
    const g = new THREE.CircleGeometry(LAKE.lakeR + 0.35, 96);
    g.rotateX(-Math.PI / 2);
    g.scale(1.12, 1, 1);
    return g;
  }, []);

  const layout = useMemo(() => {
    const r = prng(1107);
    const land = (pad: number) => {
      for (let k = 0; k < 200; k++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * R * 0.93;
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d;
        if (shoreY(x, z) > WATER_Y + pad && !blocked(x, z)) return [x, z] as [number, number];
      }
      return [R * 0.8, 0] as [number, number];
    };
    const moss = [] as { x: number; z: number; s: number; c: string }[];
    while (moss.length < MOSS) {
      const [x, z] = land(0.012);
      moss.push({ x, z, s: 0.03 + r() * 0.05, c: [PAL.mossA, PAL.mossB, PAL.mossC, PAL.mossD][Math.floor(r() * 4)] });
    }
    const trees: Tree[] = [];
    const spots: [number, number][] = [
      [-1.1, -2.3], [-0.2, -2.6], [0.8, -2.45], [1.7, -1.9], [-1.9, -1.6], [-2.5, -0.7], [2.35, -1.2], [-0.6, -1.95], [0.3, -2.05], [1.25, -2.6],
      [-2.7, 0.3], [2.6, -0.3], [-1.3, -1.5], [-2.0, -0.35], [-2.75, -0.35], [-2.6, 1.0], [-1.95, -2.05], [-0.95, -2.3], [-1.65, -1.1],
    ];
    spots.forEach(([x, z], i) => {
      if (Math.hypot(x, z) > R * 0.9 || polyDist(LAKE_PATH, x, z) < 0.32 || shoreY(x, z) < WATER_Y + 0.05) return;
      trees.push({ x, z, h: 0.75 + r() * 0.85, kind: i % 3 === 1 ? "round" : "pine", c: [PAL.pine, "#3C6B36", "#2A5230"][i % 3] });
    });
    const ferns: Fern[] = [
      { x: -1.95, z: 1.2, fronds: 9, size: 0.5 },
      { x: -2.05, z: -1.55, fronds: 8, size: 0.55 },
      { x: -2.85, z: 0.2, fronds: 7, size: 0.5 },
      { x: 2.45, z: 0.8, fronds: 8, size: 0.6 },
      { x: -1.5, z: -0.9, fronds: 7, size: 0.55 },
      { x: 1.95, z: -0.9, fronds: 7, size: 0.5 },
      { x: 0.4, z: 2.6, fronds: 7, size: 0.45 },
    ];
    const fronds = ferns.flatMap((fe) =>
      Array.from({ length: fe.fronds }, (_, k) => ({ fe, a: (k / fe.fronds) * Math.PI * 2 + r() * 0.5, lean: 0.55 + r() * 0.35, len: fe.size * (0.7 + r() * 0.35) })),
    );
    const stones = Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2 + r() * 0.1;
      const d = LAKE.lakeR + 0.05 + r() * 0.12;
      return { x: LAKE.lakeX + Math.cos(a) * d * 1.12, z: LAKE.lakeZ + Math.sin(a) * d, s: 0.05 + r() * 0.08, ry: r() * 6 };
    }).filter((s) => Math.hypot(s.x, s.z) < R * 0.95);
    const drops = Array.from({ length: DROPS }, () => {
      const a = r() * Math.PI * 2;
      const y = 1.1 + Math.pow(r(), 0.8) * 1.7;
      return { a, y, s: 0.005 + Math.pow(r(), 3) * 0.018, slide: r() > 0.92 ? 0.03 + r() * 0.08 : 0, ph: r() };
    });
    const sparks = Array.from({ length: SPARK }, () => ({ u: r(), spread: (r() - 0.5) * 0.9, h: 0.15 + r() * 0.4, ph: r(), land: [(r() - 0.5) * 1.6, (r() - 0.5) * 1.0] as [number, number] }));
    const mist = Array.from({ length: 9 }, (_, i) => ({ x: LAKE.lakeX + (r() - 0.5) * 3.0, z: LAKE.lakeZ + (r() - 0.5) * 2.0 - 0.3, s: 1.4 + r() * 1.4, y: 0.03 + r() * 0.06, ph: i * 0.9 }));
    const flies = Array.from({ length: FLIES }, () => ({ x: (r() - 0.5) * 4.6, z: (r() - 0.5) * 4.6, y: 0.9 + r() * 1.3, sp: 0.2 + r() * 0.4, ph: r() * 6.28 })).filter((q) => Math.hypot(q.x, q.z) < R * 0.85);
    return { moss, trees, fronds, stones, drops, sparks, mist, flies };
  }, []);

  const mossRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const stoneRef = useRef<THREE.InstancedMesh>(null);
  const dropRef = useRef<THREE.InstancedMesh>(null);
  const sparkRef = useRef<THREE.InstancedMesh>(null);

  const hand = new THREE.Vector3(...handIn);
  const target = new THREE.Vector3(SHORE.saltTarget[0], WATER_Y, SHORE.saltTarget[1]);
  const flyRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    const mm = mossRef.current!;
    layout.moss.forEach((m, i) => {
      o.position.set(m.x, shoreY(m.x, m.z) + m.s * 0.3, m.z);
      o.rotation.set(0, i, 0);
      o.scale.set(m.s, m.s * 0.68, m.s);
      o.updateMatrix();
      mm.setMatrixAt(i, o.matrix);
      mm.setColorAt(i, col.set(m.c));
    });
    mm.instanceMatrix.needsUpdate = true;
    if (mm.instanceColor) mm.instanceColor.needsUpdate = true;

    const sm = stoneRef.current!;
    layout.stones.forEach((s, i) => {
      o.position.set(s.x, shoreY(s.x, s.z) + s.s * 0.2, s.z);
      o.rotation.set(0.3, s.ry, 0.2);
      o.scale.set(s.s, s.s * 0.55, s.s * 0.85);
      o.updateMatrix();
      sm.setMatrixAt(i, o.matrix);
      sm.setColorAt(i, col.set(i % 2 ? PAL.stone : "#B9B2A6"));
    });
    sm.instanceMatrix.needsUpdate = true;
    if (sm.instanceColor) sm.instanceColor.needsUpdate = true;

    const lm = leafRef.current!;
    const up = new THREE.Vector3(0, 1, 0);
    const zAxis = new THREE.Vector3(0, 0, 1);
    let n = 0;
    layout.fronds.forEach((fr, k) => {
      const sway = Math.sin(t * 1.1 + k * 0.7) * 0.035;
      const dir = new THREE.Vector3(Math.cos(fr.a + sway), 0, Math.sin(fr.a + sway));
      const base = new THREE.Vector3(fr.fe.x, shoreY(fr.fe.x, fr.fe.z), fr.fe.z);
      const at = (s: number) =>
        base
          .clone()
          .addScaledVector(dir, fr.len * fr.lean * s)
          .addScaledVector(up, fr.len * (Math.sin(s * Math.PI * 0.62) * 0.8 - s * s * 0.2));
      for (let j = 0; j < LEAFLETS; j++) {
        const s = 0.12 + (j / LEAFLETS) * 0.86;
        const p = at(s);
        const tan = at(s + 0.01).sub(p).normalize();
        const side = new THREE.Vector3().crossVectors(tan, up).normalize();
        const L = 0.08 * fr.fe.size * (1 - s * 0.75);
        for (const sg of [1, -1]) {
          const d = side.clone().multiplyScalar(sg);
          const tilt = d.clone().addScaledVector(tan, 0.45).normalize();
          o.position.copy(p).addScaledVector(tilt, L * 0.5);
          o.quaternion.setFromUnitVectors(zAxis, tilt);
          o.scale.set(0.016 * fr.fe.size, 0.004, L * 0.55);
          o.updateMatrix();
          lm.setMatrixAt(n, o.matrix);
          lm.setColorAt(n, col.set(PAL.fern).lerp(new THREE.Color(PAL.fernTip), s));
          n++;
        }
      }
    });
    lm.instanceMatrix.needsUpdate = true;
    if (lm.instanceColor) lm.instanceColor.needsUpdate = true;

    const dm = dropRef.current!;
    layout.drops.forEach((d, i) => {
      const yy = d.slide ? 2.6 - (((d.ph + t * d.slide) % 1) * 1.7) : d.y;
      const top = LAKE.plinthH + 1.35;
      const rad = yy <= top ? R * 0.992 : R * Math.cos(Math.asin(clamp((yy - top) / 1.75))) * 0.992;
      o.position.set(Math.cos(d.a) * rad, yy, Math.sin(d.a) * rad);
      o.lookAt(0, yy, 0);
      o.scale.set(d.s, d.s * (d.slide ? 1.5 : 1), d.s * 0.45);
      o.updateMatrix();
      dm.setMatrixAt(i, o.matrix);
    });
    dm.instanceMatrix.needsUpdate = true;

    // salt grains: fly from the hand in an arc, touch the water, sparkle once and vanish
    const km = sparkRef.current!;
    layout.sparks.forEach((s, i) => {
      const k = clamp((scatter - s.ph * 0.35) / 0.65);
      const land = target.clone().add(new THREE.Vector3(s.land[0], 0, s.land[1]));
      const p = hand.clone().lerp(land, k);
      p.y += Math.sin(k * Math.PI) * (0.35 + s.h) + s.spread * 0.05 * k;
      const after = clamp((scatter - s.ph * 0.35 - 0.65) / 0.25);
      const vis = k > 0 && k < 1 ? 1 : k >= 1 ? 1 - after : 0;
      o.position.copy(p);
      o.rotation.set(0, 0, 0);
      const tw = 0.6 + 0.4 * Math.sin(t * 9 + i);
      o.scale.setScalar(0.0001 + 0.02 * vis * tw * (k >= 1 ? 1 + after * 1.5 : 1));
      o.updateMatrix();
      km.setMatrixAt(i, o.matrix);
    });
    km.instanceMatrix.needsUpdate = true;

    const fm = flyRef.current!;
    layout.flies.forEach((q, i) => {
      const blink = 0.5 + 0.5 * Math.sin(t * 3 + q.ph);
      o.position.set(q.x + Math.sin(t * q.sp + q.ph) * 0.3, q.y + Math.sin(t * 0.8 + q.ph) * 0.12, q.z + Math.cos(t * q.sp * 0.8 + q.ph) * 0.3);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(0.0001 + 0.022 * night * (0.4 + 0.6 * blink));
      o.updateMatrix();
      fm.setMatrixAt(i, o.matrix);
    });
    fm.instanceMatrix.needsUpdate = true;
  }, [t, scatter, night, layout]);

  const fernCount = layout.fronds.length * LEAFLETS * 2;
  const ringK = clamp((scatter - 0.8) / 0.9);
  const stirRings = [0, 0.33, 0.66].map((d) => (stir > d && stir < d + 0.7 ? (stir - d) / 0.7 : -1));

  return (
    <group position={[LAKE.cx, 0, LAKE.cz]}>
      {/* walnut plinth with the brass AUDIRA plaque */}
      <mesh position={[0, LAKE.plinthH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R + 0.12, R + 0.2, LAKE.plinthH, 128]} />
        <meshStandardMaterial map={wood} roughness={0.45} metalness={0.05} />
      </mesh>
      <group rotation={[0, 0.0, 0]} position={[0.95, LAKE.plinthH / 2, Math.sqrt((R + 0.16) ** 2 - 0.95 ** 2) + 0.012]}>
        <mesh rotation={[0, Math.asin(0.95 / (R + 0.16)), 0]}>
          <planeGeometry args={[0.78, 0.195]} />
          <meshStandardMaterial map={plaque} metalness={0.75} roughness={0.32} />
        </mesh>
      </group>

      {/* substrate bands seen through the glass */}
      <mesh position={[0, LAKE.plinthH + 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[R * 0.985, R * 0.985, 0.16, 128]} />
        <meshStandardMaterial map={tex.gravel} roughness={0.9} />
      </mesh>
      <mesh position={[0, LAKE.plinthH + 0.19, 0]}>
        <cylinderGeometry args={[R * 0.986, R * 0.986, 0.06, 128, 1, true]} />
        <meshStandardMaterial map={tex.charcoal} roughness={0.95} />
      </mesh>
      <mesh position={[0, LAKE.plinthH + 0.22 + (LAKE.soilH - 0.22) / 2, 0]}>
        <cylinderGeometry args={[R * 0.987, R * 0.987, LAKE.soilH - 0.22, 128, 1, true]} />
        <meshStandardMaterial map={tex.soil} roughness={0.95} />
      </mesh>
      <mesh geometry={shore} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.95} />
      </mesh>

      {/* the lake */}
      <mesh geometry={lakeGeo} position={[LAKE.lakeX, WATER_Y, LAKE.lakeZ]} receiveShadow>
        <meshPhysicalMaterial color={PAL.lake} roughness={0.14} metalness={0} clearcoat={0.45} clearcoatRoughness={0.08} envMapIntensity={0.25} emissive={PAL.lakeDeep} emissiveIntensity={0.3} />
      </mesh>
      {[0, 0.45].map((d, i) => {
        const k = clamp(ringK - d);
        return k > 0 && k < 1 ? (
          <mesh key={i} position={[target.x, WATER_Y + 0.004, target.z]} rotation={[-Math.PI / 2, 0, 0]} scale={0.1 + k * 1.1} renderOrder={13}>
            <ringGeometry args={[0.9, 1, 96]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={(1 - k) * 0.55} depthWrite={false} />
          </mesh>
        ) : null;
      })}
      {stirRings.map((k, i) =>
        k >= 0 ? (
          <mesh key={`st${i}`} position={[SHORE.stir[0], WATER_Y + 0.005, SHORE.stir[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={0.05 + k * 0.9} renderOrder={13}>
            <ringGeometry args={[0.85, 1, 96]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={(1 - k) * 0.5} depthWrite={false} />
          </mesh>
        ) : null,
      )}

      <instancedMesh ref={mossRef} args={[undefined, undefined, MOSS]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={stoneRef} args={[undefined, undefined, layout.stones.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, fernCount]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.6} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* trees */}
      {layout.trees.map((tr, i) => {
        const y = shoreY(tr.x, tr.z);
        const sway = Math.sin(t * 0.6 + i) * 0.012;
        return (
          <group key={i} position={[tr.x, y, tr.z]} rotation={[sway, i * 1.3, sway]}>
            <mesh position={[0, tr.h * 0.22, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.055, tr.h * 0.44, 10]} />
              <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
            </mesh>
            {tr.kind === "pine" ? (
              [0, 1, 2].map((k) => (
                <mesh key={k} position={[0, tr.h * (0.38 + k * 0.2), 0]} castShadow>
                  <coneGeometry args={[tr.h * (0.3 - k * 0.07), tr.h * 0.42, 14]} />
                  <meshStandardMaterial color={tr.c} roughness={0.8} />
                </mesh>
              ))
            ) : (
              [[0, 0.62, 0, 0.3], [0.13, 0.52, 0.06, 0.22], [-0.12, 0.55, -0.05, 0.22], [0.02, 0.8, 0.02, 0.2]].map(([x, yy, z, s], k) => (
                <mesh key={k} position={[x * tr.h, yy * tr.h, z * tr.h]} castShadow>
                  <icosahedronGeometry args={[s * tr.h, 2]} />
                  <meshStandardMaterial color={k % 2 ? PAL.mossB : PAL.mossA} roughness={0.9} flatShading />
                </mesh>
              ))
            )}
          </group>
        );
      })}

      <instancedMesh ref={flyRef} args={[undefined, undefined, layout.flies.length]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color={[2.4, 2.1, 1.0]} toneMapped={false} />
      </instancedMesh>
      {/* salt grains */}
      <instancedMesh ref={sparkRef} args={[undefined, undefined, SPARK]} renderOrder={12}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={[2.2, 2.0, 1.6]} toneMapped={false} />
      </instancedMesh>
      <pointLight position={[target.x, WATER_Y + 0.35, target.z]} intensity={0.9 * clamp(scatter * 2) * (1 - clamp((scatter - 1.2) / 0.6))} distance={2.4} color="#FFF3D0" />

      {/* morning mist over the water */}
      {layout.mist.map((m, i) => (
        <mesh key={i} position={[m.x + Math.sin(t * 0.15 + m.ph) * 0.2, WATER_Y + m.y, m.z]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={[m.s * 1.6, m.s * 0.7, 1]} renderOrder={13}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={disc} color="#FFFFFF" transparent opacity={0.09} depthWrite={false} fog={false} />
        </mesh>
      ))}

      {/* the glass cloche + condensation */}
      <instancedMesh ref={dropRef} args={[undefined, undefined, DROPS]} renderOrder={11}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshPhysicalMaterial color="#F2F8F4" roughness={0.02} clearcoat={1} transparent opacity={0.38} depthWrite={false} />
      </instancedMesh>
      <mesh geometry={vesselGeo} material={glass} position={[0, LAKE.plinthH, 0]} renderOrder={10} />
      <mesh position={[0, LAKE.plinthH + 3.2, 0]}>
        <sphereGeometry args={[0.22, 32, 16]} />
        <meshPhysicalMaterial color="#F4FBF8" transmission={1} thickness={0.3} roughness={0.03} ior={1.5} clearcoat={1} />
      </mesh>
    </group>
  );
};

