import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { STAINED_PALETTE } from "../lib/palette";
import { makeShaftTexture, makeStoneTexture } from "../lib/materials";
import { buildPanes, lancetShape, makeFloorPoolTexture } from "../lib/window";
import { assembled, mulberry32, sunGlow } from "../core/motion";
import { POLISH, RoundedBoxGeo } from "../../../core/polish/Polish.tsx";

const FLOOR_Y = -5.5;
const MOTES = 450;
const tmp = new THREE.Object3D();

/** Stone columns: inner pair beside the window, darker foreground arcade the camera passes. */
const COLUMNS = [
  { x: -2.9, z: 3.6, r: 0.36, tone: 0.62 },
  { x: 2.9, z: 3.6, r: 0.36, tone: 0.62 },
  { x: -2.6, z: 7.6, r: 0.42, tone: 0.42 },
  { x: 2.6, z: 7.6, r: 0.42, tone: 0.42 },
];
/** Pews: two banks either side of a central aisle, behind the floor light pool. */
const PEWS = [7.2, 8.2, 9.2, 10.2].flatMap((z) => [-1, 1].map((side) => ({ x: side * 2.05, z })));

const stoneCache = new Map<number, THREE.MeshPhysicalMaterial>();
const stoneMat = (tone: number) => {
  const key = Math.round(tone * 100);
  let m = stoneCache.get(key);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: new THREE.Color("#B3A792").multiplyScalar(tone) });
    stoneCache.set(key, m);
  }
  return m;
};


/** Stone nave around the window: splayed wall, flagstone floor, columns, light shafts, coloured light pools, dust. */
export const Nave3D: React.FC<{ t: number }> = ({ t }) => {
  const glow = sunGlow(t);
  const built = assembled(t);

  const wall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-8, FLOOR_Y);
    s.lineTo(8, FLOOR_Y);
    s.lineTo(8, 10);
    s.lineTo(-8, 10);
    s.closePath();
    s.holes.push(lancetShape(0.0) as unknown as THREE.Path);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2, curveSegments: 48 });
    const tex = makeStoneTexture(5810, 4, 8);
    tex.repeat.set(0.25, 0.25);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.stone, map: tex, color: "#9C9282" });
    return { geo, mat };
  }, []);

  const floor = useMemo(() => {
    const tex = makeStoneTexture(5811, 3, 3, true);
    tex.repeat.set(4, 5);
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.55, metalness: 0.05, color: "#A79C8A" });
  }, []);

  const pool = useMemo(() => {
    const { panes, rose } = buildPanes();
    return makeFloorPoolTexture(panes, rose);
  }, []);
  const shaft = useMemo(() => makeShaftTexture(), []);

  const motes = useMemo(() => {
    const rnd = mulberry32(5812);
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(STAINED_PALETTE.sunbeam).multiplyScalar(1.3), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
      MOTES,
    );
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: MOTES }, () => ({ u: rnd(), v: rnd(), w: rnd(), s: 0.004 + rnd() * 0.009, ph: rnd() * 6.28 }));
    return { mesh, seeds };
  }, []);

  useLayoutEffect(() => {
    motes.seeds.forEach((p, i) => {
      // motes live inside the slanted beam volume: window (z≈0.5, y≈0) down to the floor pool (z≈5.5)
      const along = (p.v + t * 0.012) % 1;
      const y = 2.5 - along * 7.6 + Math.sin(t * 0.5 + p.ph) * 0.12;
      const z = 0.6 + along * 5.2 + Math.cos(t * 0.4 + p.ph) * 0.1;
      const x = (p.u - 0.5) * (3.0 + along * 0.8) + Math.sin(t * 0.3 + p.ph * 2) * 0.08;
      const tw = 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.1 + p.ph * 5), 2);
      tmp.position.set(x, y, z);
      tmp.scale.setScalar(p.s * tw * (0.4 + 0.6 * glow));
      tmp.updateMatrix();
      motes.mesh.setMatrixAt(i, tmp.matrix);
    });
    motes.mesh.instanceMatrix.needsUpdate = true;
  });

  const spotTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, FLOOR_Y, 6);
    o.updateMatrixWorld();
    return o;
  }, []);

  const oak = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.stone, roughness: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.5, color: "#3B2717" }), []);

  // shaft plane oriented along the beam (window -> floor)
  const beamAngle = -Math.atan2(5.2, 7.6);
  const tints = [STAINED_PALETTE.sunbeam, STAINED_PALETTE.ruby, STAINED_PALETTE.azure, STAINED_PALETTE.amber];

  return (
    <group>
      {/* low fill: the stone falls into shadow away from the window, so the glass is the brightest
          thing in frame (subject separation) */}
      <ambientLight intensity={0.1} color="#C9B79C" />
      <hemisphereLight args={["#E9D8B8", "#2A2118", 0.12]} />
      {/* sun through the glass: warm key falling into the nave. It sits behind the wall, so the
          wall, tracery and saddle bars cut the beam and cast their shadows on the flagstones */}
      <spotLight
        position={[0, 2.5, -2]}
        target={spotTarget}
        angle={0.55}
        penumbra={0.8}
        intensity={40 * glow}
        distance={22}
        decay={1.4}
        color={STAINED_PALETTE.sunbeam}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
      />
      <pointLight position={[-1.2, 1.5, 1.2]} intensity={2 * glow} distance={6} color={STAINED_PALETTE.ruby} />
      <pointLight position={[1.2, 0.5, 1.2]} intensity={3 * glow} distance={6} color={STAINED_PALETTE.azure} />
      <pointLight position={[0, 3, 1.4]} intensity={3 * glow} distance={6} color={STAINED_PALETTE.amber} />

      <mesh geometry={wall.geo} material={wall.mat} position={[0, 0, -0.1]} castShadow receiveShadow />
      {/* deep shadow behind the glass so unglazed gaps read as lead */}
      <mesh position={[0, 0.8, -0.4]}>
        <planeGeometry args={[4, 9]} />
        <meshBasicMaterial color="#050403" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 7]} material={floor} receiveShadow>
        <planeGeometry args={[16, 16]} />
      </mesh>

      {/* coloured light pooled on the flagstones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.01, 3.9]}>
        <planeGeometry args={[4.2, 5.6]} />
        <meshBasicMaterial map={pool} transparent opacity={1.0 * built * Math.min(1.5, glow)} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* volumetric shafts */}
      {tints.map((tint, i) => (
        <mesh key={i} position={[(i - 1.5) * 0.7, -1.4, 2.9]} rotation={[beamAngle, 0, (i - 1.5) * 0.04]}>
          <planeGeometry args={[i === 0 ? 2.8 : 1.1, 9.4]} />
          <meshBasicMaterial map={shaft} color={tint} transparent opacity={(i === 0 ? 0.16 : 0.1) * built * glow} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <primitive object={motes.mesh} />

      {/* depth layers: inner columns (z 3.6) and a darker foreground pair (z 7.6) the camera
          pulls back past; both cast the sun's shadow and frame the window in silhouette */}
      {COLUMNS.map(({ x, z, r, tone }) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <mesh position={[0, -0.25, 0]} material={stoneMat(tone)} castShadow receiveShadow>
            <cylinderGeometry args={[r, r * 1.05, 10.5, 32]} />
          </mesh>
          <mesh position={[0, FLOOR_Y + 0.25, 0]} material={stoneMat(tone * 0.9)} castShadow receiveShadow>
            <RoundedBoxGeo args={[r * 2.8, 0.5, r * 2.8]} radius={0.05} />
          </mesh>
          <mesh position={[0, FLOOR_Y + 0.6, 0]} material={stoneMat(tone * 0.95)} castShadow>
            <cylinderGeometry args={[r * 1.28, r * 1.38, 0.2, 32]} />
          </mesh>
          {/* capital */}
          <mesh position={[0, 4.95, 0]} material={stoneMat(tone * 0.9)} castShadow>
            <RoundedBoxGeo args={[r * 2.6, 0.4, r * 2.6]} radius={0.05} />
          </mesh>
        </group>
      ))}
      {/* rows of dark oak pews down both sides of the nave (aisle kept clear for the light pool) */}
      {PEWS.map(({ x, z }) => (
        <group key={`${x}:${z}`} position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.42, 0]} material={oak} castShadow receiveShadow>
            <RoundedBoxGeo args={[1.5, 0.08, 0.5]} radius={0.03} />
          </mesh>
          <mesh position={[0, 0.75, 0.24]} material={oak} castShadow receiveShadow>
            <RoundedBoxGeo args={[1.5, 0.7, 0.07]} radius={0.03} />
          </mesh>
          {[-0.72, 0.72].map((e) => (
            <mesh key={e} position={[e, 0.45, 0.05]} material={oak} castShadow>
              <RoundedBoxGeo args={[0.07, 0.9, 0.6]} radius={0.025} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
