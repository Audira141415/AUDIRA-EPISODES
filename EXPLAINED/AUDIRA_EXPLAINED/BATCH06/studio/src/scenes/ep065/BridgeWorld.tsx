// AE-065 VINTAGEFORGE world: a double-leaf bascule bridge drawn as a 3D copper-plate engraving.
// Left pier is shown in section (cutaway): trunnion inside the pier, tail + counterweight swinging
// down into the bascule chamber, quadrant rack on the tail meshed by a pinion. Right pier is solid
// masonry with an operator cabin and an engraved AUDIRA plate. A tall-masted ship approaches.
// Accuracy per research/RESEARCH_REPORT.md "Saran visual akurat": pivot inside pier (not at the
// bank like a castle drawbridge), counterweight hidden inside the pier, leaves stop short of 90°.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { POLISH } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { hatchTex, INK, PAL, plateTex, sailTex, sectionTex, stoneTex, waterTex } from "./textures.ts";

type V3 = [number, number, number];

// ---- geometry constants (also used by the annotation overlay) ----
export const PIVOT: V3 = [-3.4, -0.55, 0]; // left trunnion (world); right is mirrored in x
export const TAIL = 2.3; // trunnion → tail end
export const LEAF = 3.4; // trunnion → leaf tip (tips meet at x = 0)
export const RACK_R = 1.1;
export const PINION_R = 0.24;
export const PINION_ANGLE = (250 * Math.PI) / 180; // world angle of the pinion around the trunnion
export const WATER_Y = -3.5;
export const DECK_HALF = 1.3;
export const SHIP_POS: V3 = [5.4, WATER_Y, -12];

export const pinionCenter = (): V3 => [
  PIVOT[0] + (RACK_R + PINION_R) * Math.cos(PINION_ANGLE),
  PIVOT[1] + (RACK_R + PINION_R) * Math.sin(PINION_ANGLE),
  PIVOT[2],
];
/** World position of a point given in left-leaf local coordinates at opening angle a. */
export const leafPoint = (a: number, lx: number, ly: number, z = 0): V3 => [
  PIVOT[0] + lx * Math.cos(a) - ly * Math.sin(a),
  PIVOT[1] + lx * Math.sin(a) + ly * Math.cos(a),
  z,
];

// ---- ink outline helpers: fat screen-space lines (WebGL lines are always 1 px) ----
const fatInk = (px: number, opacity = 0.92) => {
  const m = new LineMaterial({ color: INK, linewidth: px, worldUnits: false, transparent: true, opacity });
  m.resolution.set(1080, 1920);
  return m;
};
const INK_MAIN = fatInk(2.6);
export const INK_RIG = fatInk(1.6, 0.85);
export const fatLines = (positions: ArrayLike<number>, mat: LineMaterial) => {
  const g = new LineSegmentsGeometry();
  g.setPositions(Array.from(positions));
  const l = new LineSegments2(g, mat);
  l.layers.set(FX_LAYER);
  l.frustumCulled = false;
  return l;
};
export const Edges: React.FC<{ geo: THREE.BufferGeometry; threshold?: number }> = ({ geo, threshold = 28 }) => {
  const obj = useMemo(() => {
    const e = new THREE.EdgesGeometry(geo, threshold);
    return fatLines(e.attributes.position.array, INK_MAIN);
  }, [geo, threshold]);
  return <primitive object={obj} />;
};

/**
 * Copper-plate hatching driven by the lit result: 45 deg lines in half-shadow, cross-hatch in
 * shadow, a third direction in the darkest areas (screen-space pixel pattern).
 */
export const hatchify = <T extends THREE.Material>(m: T, strength = 0.62, px = 1): T => {
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <opaque_fragment>",
      `{
        float lum = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
        vec2 fc = gl_FragCoord.xy${px === 1 ? "" : ` / ${px.toFixed(3)}`};
        float l1 = step(0.72, fract((fc.x + fc.y) / 7.0));
        float l2 = step(0.72, fract((fc.x - fc.y) / 7.0));
        float l3 = step(0.7, fract(fc.y / 5.0));
        float ink = (1.0 - smoothstep(0.30, 0.46, lum)) * l1;
        ink = max(ink, (1.0 - smoothstep(0.16, 0.27, lum)) * l2);
        ink = max(ink, (1.0 - smoothstep(0.06, 0.13, lum)) * l3);
        outgoingLight = mix(outgoingLight, vec3(0.06, 0.035, 0.02), ink * ${strength.toFixed(2)});
      }
      #include <opaque_fragment>`,
    );
  };
  m.customProgramCacheKey = () => `ep065-hatch-${strength}${px === 1 ? "" : `-${px}`}`;
  return m;
};

type MatProps = { mat: THREE.Material };
export const IBox: React.FC<{ size: V3; pos?: V3; rot?: V3; r?: number; ink?: boolean; cast?: boolean } & MatProps> = ({
  size,
  pos = [0, 0, 0],
  rot = [0, 0, 0],
  r,
  mat,
  ink = true,
  cast = true,
}) => {
  const [w, h, d] = size;
  const rr = r ?? Math.min(0.04, Math.min(w, h, d) * 0.2);
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 2, rr), [w, h, d, rr]);
  const hard = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} material={mat} castShadow={cast} receiveShadow />
      {ink && <Edges geo={hard} />}
    </group>
  );
};

export const useMats = (px = 1, fitPlate = false) =>
  useMemo(() => {
    const paper = (base: string, d: 0 | 1 | 2 | 3, seed = 3, rep = 1) => {
      const map = hatchTex(base, d, seed).clone();
      map.repeat.set(rep, rep);
      map.needsUpdate = true;
      return hatchify(new THREE.MeshPhysicalMaterial({ ...POLISH.paper, color: "#ffffff", map }), 0.62, px);
    };
    const stone = (rx: number, ry: number, seed = 5) => {
      const map = stoneTex(seed).clone();
      map.repeat.set(rx, ry);
      map.needsUpdate = true;
      return hatchify(new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff", map }), 0.62, px);
    };
    const water = waterTex().clone();
    water.repeat.set(9, 40);
    water.needsUpdate = true;
    return {
      deck: paper(PAL.parchmentLight, 1, 4),
      girder: paper("#cdb68c", 2, 6),
      rail: paper("#7a5a3a", 0, 7),
      wood: paper(PAL.wood, 1, 8),
      iron: hatchify(new THREE.MeshPhysicalMaterial({ color: "#9c8468", roughness: 0.5, metalness: 0.35, map: hatchTex("#b49a7a", 2, 9) }), 0.62, px),
      counter: hatchify(new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff", map: hatchTex("#9a7f60", 3, 12) }), 0.62, px),
      brass: new THREE.MeshPhysicalMaterial({ color: PAL.gold, roughness: 0.32, metalness: 0.85, clearcoat: 0.3 }),
      brassDark: new THREE.MeshPhysicalMaterial({ color: "#9a7a3a", roughness: 0.4, metalness: 0.8 }),
      section: new THREE.MeshPhysicalMaterial({ ...POLISH.paper, color: "#ffffff", map: sectionTex() }),
      stonePier: stone(2, 2, 5),
      stoneInner: stone(2, 2, 13),
      stoneBank: stone(6, 30, 17),
      water: hatchify(new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.55, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5, map: water }), 0.4, px),
      sail: hatchify(new THREE.MeshPhysicalMaterial({ ...POLISH.fabric, color: "#ffffff", map: sailTex(), side: THREE.DoubleSide }), 0.62, px),
      hull: paper("#9a6a40", 3, 15),
      red: hatchify(new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: PAL.terracotta }), 0.62, px),
      white: new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#f4ead2" }),
      lamp: new THREE.MeshStandardMaterial({ color: "#ffcf7a", emissive: "#ff9a3a", emissiveIntensity: 2.2 }),
      plate: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.35, metalness: 0.7, map: plateTex("AUDIRA", "EXPLAINED", fitPlate) }),
      far: paper("#e4d4b0", 1, 19),
      roof: paper(PAL.verdigris, 2, 20),
    };
  }, [px, fitPlate]);
export type Mats = ReturnType<typeof useMats>;

// ---- gears ----
const gearShape = (rIn: number, rOut: number, rRoot: number, teeth: number, a0 = 0, a1 = Math.PI * 2) => {
  const s = new THREE.Shape();
  const span = a1 - a0;
  const full = span >= Math.PI * 2 - 1e-6;
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = a0 + (span * i) / n;
    const r = i % 4 === 1 || i % 4 === 2 ? rOut : rRoot;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  if (full) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
    s.holes.push(hole);
  } else {
    for (let i = 24; i >= 0; i--) {
      const a = a0 + (span * i) / 24;
      s.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
    }
  }
  return s;
};
const Gear: React.FC<{ shape: THREE.Shape; depth: number; mat: THREE.Material; pos?: V3; rotZ?: number }> = ({ shape, depth, mat, pos = [0, 0, 0], rotZ = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 8 });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [shape, depth]);
  return (
    <group position={pos} rotation={[0, 0, rotZ]}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      <Edges geo={geo} threshold={35} />
    </group>
  );
};

// rivet rows along the top and bottom flange of a side girder (instanced, built before first draw)
const Rivets: React.FC<{ m: Mats; z: number }> = ({ m, z }) => {
  const mesh = useMemo(() => {
    const xs = Array.from({ length: 22 }, (_, i) => -0.15 + i * 0.16);
    const geo = new THREE.SphereGeometry(0.03, 8, 6);
    const im = new THREE.InstancedMesh(geo, m.brassDark, xs.length * 2);
    const mt = new THREE.Matrix4();
    xs.forEach((x, i) => {
      mt.makeTranslation(x, 0.4, z);
      im.setMatrixAt(i * 2, mt);
      mt.makeTranslation(x, -0.04, z);
      im.setMatrixAt(i * 2 + 1, mt);
    });
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, [m, z]);
  return <primitive object={mesh} />;
};

// ---- one bascule leaf (left-hand, pivot at origin, tip toward +x) ----
const Leaf: React.FC<{ m: Mats; angle: number; detail: boolean }> = ({ m, angle, detail }) => {
  const rackShape = useMemo(() => gearShape(RACK_R - 0.16, RACK_R, RACK_R - 0.07, 16, (172 * Math.PI) / 180, (258 * Math.PI) / 180), []);
    return (
    <group rotation={[0, 0, angle]}>
      {/* roadway slab: top at world y = 0 when closed */}
      <IBox size={[LEAF + 0.25, 0.2, DECK_HALF * 2]} pos={[(LEAF - 0.25) / 2, 0.45, 0]} mat={m.deck} />
      {/* side plate girders with riveted flanges and diagonal bracing */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <IBox size={[LEAF + 0.3, 0.5, 0.14]} pos={[(LEAF - 0.3) / 2, 0.18, s * (DECK_HALF - 0.07)]} mat={m.girder} />
          {Array.from({ length: 6 }, (_, i) => (
            <IBox key={i} size={[0.62, 0.04, 0.03]} pos={[0.37 + i * 0.55, 0.18, s * (DECK_HALF + 0.005)]} rot={[0, 0, (i % 2 ? 1 : -1) * 0.62]} mat={m.rail} ink={false} cast={false} />
          ))}
          <Rivets m={m} z={s * (DECK_HALF + 0.005)} />
        </group>
      ))}
      {/* cross girders under the deck */}
      {[0.5, 1.3, 2.1, 2.9].map((x) => (
        <IBox key={x} size={[0.1, 0.22, DECK_HALF * 2 - 0.2]} pos={[x, 0.25, 0]} mat={m.girder} ink={detail} />
      ))}
      {/* parapet railings */}
      {[-1, 1].map((s) => (
        <group key={`r${s}`}>
          <IBox size={[LEAF + 0.1, 0.05, 0.06]} pos={[LEAF / 2, 0.92, s * (DECK_HALF - 0.05)]} mat={m.rail} ink={false} />
          <IBox size={[LEAF - 0.1, 0.3, 0.05]} pos={[LEAF / 2 + 0.05, 0.72, s * (DECK_HALF - 0.05)]} mat={m.girder} ink={detail} cast={false} />
        </group>
      ))}
      {/* centre line dashes */}
      {[0.4, 1.1, 1.8, 2.5].map((x) => (
        <IBox key={`d${x}`} size={[0.4, 0.02, 0.07]} pos={[x, 0.56, 0]} mat={m.rail} ink={false} cast={false} />
      ))}
      {/* tail girder running back into the pier */}
      {[-1, 1].map((s) => (
        <IBox key={`t${s}`} size={[TAIL + 0.3, 0.34, 0.16]} pos={[-TAIL / 2 + 0.1, 0.05, s * 0.75]} mat={m.girder} />
      ))}
      {/* counterweight box at the tail end */}
      <IBox size={[0.75, 0.78, 1.9]} pos={[-TAIL + 0.36, -0.36, 0]} mat={m.counter} r={0.05} />
      {/* quadrant rack + spokes from the trunnion hub */}
      {detail && (
        <group position={[0, 0, 0.98]}>
          <Gear shape={rackShape} depth={0.12} mat={m.brass} />
          {[180, 214, 250].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return <IBox key={deg} size={[RACK_R - 0.12, 0.07, 0.07]} pos={[Math.cos(a) * (RACK_R - 0.12) / 2, Math.sin(a) * (RACK_R - 0.12) / 2, 0]} rot={[0, 0, a]} mat={m.brassDark} />;
          })}
        </group>
      )}
    </group>
  );
};

const Trunnion: React.FC<{ m: Mats }> = ({ m }) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(0.17, 0.17, DECK_HALF * 2 + 0.7, 24).rotateX(Math.PI / 2), []);
  const hub = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.18, 24).rotateX(Math.PI / 2), []);
  return (
    <group>
      <mesh geometry={geo} material={m.brass} castShadow />
      <Edges geo={geo} />
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (DECK_HALF + 0.12)]}>
          <mesh geometry={hub} material={m.brassDark} castShadow />
          <Edges geo={hub} />
        </group>
      ))}
    </group>
  );
};

// ---- piers ----
const PIER_X0 = -6.6, PIER_X1 = -2.9, PIER_Z = 1.6, BASE_Y = -4.2, FLOOR_Y = -3.2;

const CutPier: React.FC<{ m: Mats }> = ({ m }) => {
  const cw = 0.05; // thickness of the section-cut skin on the front
  const roomX0 = -5.85, roomX1 = -3.15, roomTop = -0.32;
  return (
    <group>
      {/* back wall (interior face visible through the cut) */}
      <IBox size={[PIER_X1 - PIER_X0, 0 - BASE_Y, 0.5]} pos={[(PIER_X0 + PIER_X1) / 2, BASE_Y / 2, -PIER_Z + 0.25]} mat={m.stoneInner} />
      {/* outer (land) wall */}
      <IBox size={[roomX0 - PIER_X0, 0 - BASE_Y, PIER_Z * 2 - 0.5]} pos={[(PIER_X0 + roomX0) / 2, BASE_Y / 2, 0.25]} mat={m.stonePier} />
      {/* river wall, stops below the leaf */}
      <IBox size={[PIER_X1 - roomX1 + 0.1, -0.85 - BASE_Y, PIER_Z * 2 - 0.5]} pos={[(roomX1 + PIER_X1) / 2 - 0.05, (BASE_Y - 0.85) / 2, 0.25]} mat={m.stonePier} />
      {/* chamber floor */}
      <IBox size={[roomX1 - roomX0, FLOOR_Y - BASE_Y, PIER_Z * 2 - 0.5]} pos={[(roomX0 + roomX1) / 2, (BASE_Y + FLOOR_Y) / 2, 0.25]} mat={m.stonePier} />
      {/* fixed roadway over the chamber */}
      <IBox size={[-3.75 - PIER_X0, 0.3, DECK_HALF * 2]} pos={[(PIER_X0 - 3.75) / 2, -0.15, 0]} mat={m.deck} />
      {/* section-cut faces on the front plane */}
      <IBox size={[roomX0 - PIER_X0, 0 - BASE_Y, cw]} pos={[(PIER_X0 + roomX0) / 2, BASE_Y / 2, PIER_Z - cw / 2]} mat={m.section} cast={false} />
      <IBox size={[PIER_X1 - roomX1, -0.85 - BASE_Y, cw]} pos={[(roomX1 + PIER_X1) / 2, (BASE_Y - 0.85) / 2, PIER_Z - cw / 2]} mat={m.section} cast={false} />
      <IBox size={[roomX1 - roomX0, FLOOR_Y - BASE_Y, cw]} pos={[(roomX0 + roomX1) / 2, (BASE_Y + FLOOR_Y) / 2, PIER_Z - cw / 2]} mat={m.section} cast={false} />
      {/* bearing pedestals for the trunnion */}
      {[-1, 1].map((s) => (
        <IBox key={s} size={[0.55, -0.85 - FLOOR_Y + 0.0, 0.3]} pos={[PIVOT[0], (FLOOR_Y + PIVOT[1] - 0.2) / 2, s * (DECK_HALF + 0.12)]} mat={m.iron} />
      ))}
      {/* motor + gearbox driving the pinion */}
      <IBox size={[0.7, 0.5, 0.6]} pos={[pinionCenter()[0] - 0.35, FLOOR_Y + 0.25, 1.0]} mat={m.iron} r={0.06} />
      <IBox size={[0.12, pinionCenter()[1] - FLOOR_Y, 0.12]} pos={[pinionCenter()[0], (pinionCenter()[1] + FLOOR_Y) / 2, 0.8]} mat={m.brassDark} />
      {/* chamber lamp */}
      <mesh position={[roomX0 + 0.25, roomTop - 0.35, -0.9]} material={m.lamp}>
        <sphereGeometry args={[0.09, 16, 12]} />
      </mesh>
      <pointLight position={[roomX0 + 0.5, roomTop - 0.5, 0.2]} intensity={6} distance={5} decay={1.6} color="#ffb766" />
      {/* roof cut: section skin on the front of the roadway */}
      <IBox size={[-3.75 - PIER_X0, 0.3, cw]} pos={[(PIER_X0 - 3.75) / 2, -0.15, DECK_HALF + cw / 2]} mat={m.section} cast={false} />
    </group>
  );
};

const SolidPier: React.FC<{ m: Mats }> = ({ m }) => (
  <group>
    <IBox size={[PIER_X1 - PIER_X0, -0.3 - BASE_Y, PIER_Z * 2]} pos={[(PIER_X0 + PIER_X1) / 2, (BASE_Y - 0.3) / 2, 0]} mat={m.stonePier} />
    <IBox size={[-3.75 - PIER_X0, 0.3, DECK_HALF * 2]} pos={[(PIER_X0 - 3.75) / 2, -0.15, 0]} mat={m.deck} />
    {/* cutwater nose */}
    <IBox size={[1.2, -0.3 - BASE_Y, 1.2]} pos={[(PIER_X0 + PIER_X1) / 2, (BASE_Y - 0.3) / 2, PIER_Z]} rot={[0, Math.PI / 4, 0]} mat={m.stonePier} />
    <IBox size={[1.2, -0.3 - BASE_Y, 1.2]} pos={[(PIER_X0 + PIER_X1) / 2, (BASE_Y - 0.3) / 2, -PIER_Z]} rot={[0, Math.PI / 4, 0]} mat={m.stonePier} />
  </group>
);

const OperatorCabin: React.FC<{ m: Mats; pos: V3 }> = ({ m, pos }) => {
  const roof = useMemo(() => new THREE.ConeGeometry(0.95, 0.7, 4).rotateY(Math.PI / 4), []);
  return (
    <group position={pos}>
      <IBox size={[1.2, 1.1, 1.2]} pos={[0, 0.55, 0]} mat={m.wood} />
      <IBox size={[0.5, 0.36, 0.04]} pos={[0, 0.7, 0.61]} mat={m.lamp} ink />
      <group position={[0, 1.45, 0]}>
        <mesh geometry={roof} material={m.roof} castShadow />
        <Edges geo={roof} />
      </group>
    </group>
  );
};

const Gate: React.FC<{ m: Mats; pos: V3; dir: 1 | -1; t: number; raise?: number }> = ({ m, pos, dir, t, raise = 0 }) => (
  <group position={pos}>
    <IBox size={[0.16, 0.9, 0.16]} pos={[0, 0.45, 0]} mat={m.iron} />
    <mesh position={[0, 1.0, 0]} material={m.lamp}>
      <sphereGeometry args={[0.1 + 0.02 * Math.sin(t * 6), 16, 12]} />
    </mesh>
    <group position={[0, 0.72, 0]} rotation={[-dir * raise * Math.PI * 0.46, 0, 0]}>
      {Array.from({ length: 6 }, (_, i) => (
        <IBox key={i} size={[0.07, 0.07, 0.3]} pos={[0, 0, dir * (0.15 + i * 0.3)]} mat={i % 2 ? m.white : m.red} ink={false} />
      ))}
    </group>
  </group>
);

// ---- ship ----
const Ship: React.FC<{ m: Mats; pos?: V3; rotY?: number }> = ({ m, pos = SHIP_POS, rotY = -0.42 }) => {
  const hullGeo = useMemo(() => {
    const s = new THREE.Shape();
    const L = 5.6, B = 1.5;
    s.moveTo(-B / 2, -L / 2 + 0.3);
    s.quadraticCurveTo(-B / 2, -L / 2, -B / 2 + 0.35, -L / 2);
    s.lineTo(B / 2 - 0.35, -L / 2);
    s.quadraticCurveTo(B / 2, -L / 2, B / 2, -L / 2 + 0.3);
    s.lineTo(B / 2, L / 2 - 1.6);
    s.quadraticCurveTo(B / 2, L / 2 - 0.2, 0, L / 2);
    s.quadraticCurveTo(-B / 2, L / 2 - 0.2, -B / 2, L / 2 - 1.6);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.85, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 2, curveSegments: 12 });
    g.rotateX(Math.PI / 2); // length → +z (bow toward the bridge), extrusion → down
    return g;
  }, []);
  const sailGeo = (w: number, h: number) => {
    const g = new THREE.PlaneGeometry(w, h, 10, 10);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / w + 0.5, v = p.getY(i) / h + 0.5;
      p.setZ(i, Math.sin(Math.PI * u) * Math.sin(Math.PI * (0.15 + 0.85 * v)) * w * 0.12);
    }
    g.computeVertexNormals();
    return g;
  };
  const masts = [
    { z: 1.2, h: 7.6, sails: [[1.9, 1.15], [1.6, 1.05], [1.3, 0.9]] },
    { z: -0.6, h: 8.4, sails: [[2.1, 1.25], [1.8, 1.1], [1.45, 0.95]] },
    { z: -2.1, h: 6.6, sails: [[1.6, 1.0], [1.3, 0.9]] },
  ];
  const sailGeos = useMemo(() => masts.map((mm) => mm.sails.map(([w, h]) => sailGeo(w, h))), []);
  const mastGeo = useMemo(() => masts.map((mm) => new THREE.CylinderGeometry(0.045, 0.07, mm.h, 10)), []);
  const rig = useMemo(() => {
    const pts: number[] = [];
    const deck = 0.95;
    const seg = (a: V3, b: V3) => pts.push(...a, ...b);
    masts.forEach((mm) => {
      const top: V3 = [0, deck + mm.h, mm.z];
      seg(top, [0.75, deck, mm.z - 0.5]);
      seg(top, [-0.75, deck, mm.z - 0.5]);
      seg(top, [0.75, deck, mm.z + 0.3]);
      seg(top, [-0.75, deck, mm.z + 0.3]);
    });
    seg([0, deck + masts[0].h, masts[0].z], [0, deck + 0.3, 4.4]);
    seg([0, deck + masts[1].h, masts[1].z], [0, deck + masts[0].h * 0.8, masts[0].z]);
    seg([0, deck + masts[2].h, masts[2].z], [0, deck + masts[1].h * 0.8, masts[1].z]);
    seg([0, deck + masts[2].h * 0.9, masts[2].z], [0, deck + 0.2, -2.9]);
    return fatLines(pts, INK_RIG);
  }, []);
  const name = useMemo(() => plateTex("AUDIRA", "Anno MMXXVI"), []);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={0.82}>
      <group position={[0, 0.95, 0]}>
        <mesh geometry={hullGeo} material={m.hull} castShadow receiveShadow />
        <Edges geo={hullGeo} threshold={40} />
      </group>
      {/* deck planking + cabin */}
      <IBox size={[1.3, 0.06, 5.0]} pos={[0, 0.98, -0.05]} mat={m.deck} ink={false} />
      <IBox size={[0.8, 0.45, 0.9]} pos={[0, 1.22, -2.0]} mat={m.wood} />
      {/* bowsprit */}
      <IBox size={[0.08, 0.08, 2.0]} pos={[0, 1.25, 3.4]} rot={[-0.25, 0, 0]} mat={m.wood} />
      {/* name board on the bow quarter (AUDIRA as part of the world) */}
      <mesh position={[-0.83, 0.62, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshPhysicalMaterial map={name} roughness={0.35} metalness={0.6} />
      </mesh>
      {masts.map((mm, i) => (
        <group key={i} position={[0, 0.95, mm.z]}>
          <mesh geometry={mastGeo[i]} material={m.wood} position={[0, mm.h / 2, 0]} castShadow />
          <Edges geo={mastGeo[i]} />
          {mm.sails.map(([w, h], k) => {
            const y = mm.h * 0.32 + k * (h + 0.32) + h / 2;
            return (
              <group key={k} position={[0, y, 0.08]}>
                <IBox size={[w + 0.25, 0.06, 0.06]} pos={[0, h / 2 + 0.05, 0]} mat={m.wood} ink={false} />
                <mesh geometry={sailGeos[i][k]} material={m.sail} castShadow />
                <Edges geo={sailGeos[i][k]} threshold={60} />
              </group>
            );
          })}
          {/* pennant */}
          <IBox size={[0.02, 0.12, 0.5]} pos={[0, mm.h + 0.05, -0.25]} mat={m.red} ink={false} />
        </group>
      ))}
      <primitive object={rig} />
    </group>
  );
};

// ---- far bank: town silhouette in pale wash ----
const FarBank: React.FC<{ m: Mats }> = ({ m }) => {
  const blocks = useMemo(() => {
    const out: { x: number; w: number; h: number; d: number }[] = [];
    let x = -22;
    let k = 1;
    while (x < 22) {
      k = (k * 9301 + 49297) % 233280;
      const r = k / 233280;
      const w = 1.4 + r * 2.2;
      out.push({ x: x + w / 2, w, h: 1.2 + ((r * 7.3) % 1) * 3.2, d: 1.5 + r });
      x += w + 0.15;
    }
    return out;
  }, []);
  return (
    <group position={[0, 0, -44]}>
      <IBox size={[60, 3.0, 6]} pos={[0, WATER_Y + 1.4, 0]} mat={m.stoneBank} ink={false} />
      {blocks.map((b, i) => (
        <IBox key={i} size={[b.w, b.h, b.d]} pos={[b.x, 0.4 + b.h / 2, -1.5]} mat={m.far} ink={false} />
      ))}
      {/* a church spire for scale */}
      <IBox size={[1.0, 9, 1.0]} pos={[-9, 4.9, -2]} mat={m.far} />
    </group>
  );
};

export type ShipPose = { pos: V3; rotY: number } | null;
export const BridgeWorld: React.FC<{
  f: number;
  open: number;
  /** Film-only knobs; defaults reproduce the approved cover exactly. */
  px?: number;
  fitPlate?: boolean;
  /** Film: hide the whole world (only `extras` render), e.g. a diagram on plain parchment. */
  isolate?: boolean;
  chamberPlate?: boolean;
  gateRaise?: number;
  ship?: ShipPose | "cover";
  extras?: (m: Mats) => React.ReactNode;
}> = ({ f, open, px = 1, fitPlate = false, isolate = false, chamberPlate = true, gateRaise = 0, ship = "cover", extras }) => {
  const m = useMats(px, fitPlate);
  const t = f / 60;
  const water = useMemo(() => new THREE.PlaneGeometry(80, 120).rotateX(-Math.PI / 2), []);
  return (
    <group>
     <group visible={!isolate}>
      {/* river */}
      <mesh geometry={water} material={m.water} position={[0, WATER_Y, -10]} receiveShadow />
      {/* embankments along both banks */}
      <IBox size={[16, -BASE_Y, 48]} pos={[PIER_X0 - 8, BASE_Y / 2, -20]} mat={m.stoneBank} ink={false} />
      <IBox size={[16, -BASE_Y, 48]} pos={[-PIER_X0 + 8, BASE_Y / 2, -20]} mat={m.stoneBank} ink={false} />
      {/* left: cutaway pier + leaf */}
      <CutPier m={m} />
      <group position={PIVOT}>
        <Trunnion m={m} />
        <Leaf m={m} angle={open} detail />
      </group>
      <Gear shape={useMemo(() => gearShape(0.05, PINION_R + 0.04, PINION_R - 0.03, 9), [])} depth={0.16} mat={m.brass} pos={[...pinionCenter().slice(0, 2), 0.98] as V3} rotZ={-open * (RACK_R / PINION_R)} />
      {/* right: mirrored solid pier + leaf + cabin */}
      <group scale={[-1, 1, 1]}>
        <SolidPier m={m} />
        <group position={PIVOT}>
          <Trunnion m={m} />
          <Leaf m={m} angle={open} detail={false} />
        </group>
      </group>
      <OperatorCabin m={m} pos={[5.6, 0, -0.6]} />
      {/* engraved AUDIRA plate on the right pier's river face (faces the cover camera) */}
      <group position={[2.87, -1.75, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <IBox size={[1.0, 1.0, 0.05]} mat={m.brassDark} />
        <mesh position={[0, 0, 0.03]} material={m.plate}>
          <planeGeometry args={[0.9, 0.9]} />
        </mesh>
      </group>
      {/* engraved AUDIRA plate on the chamber back wall, seen through the cut */}
      <group position={fitPlate ? [-5.05, -2.2, -PIER_Z + 0.53] : [-4.95, -1.25, -PIER_Z + 0.53]} visible={chamberPlate}>
        <IBox size={[0.95, 0.95, 0.05]} mat={m.brassDark} />
        <mesh position={[0, 0, 0.03]} material={m.plate}>
          <planeGeometry args={[0.86, 0.86]} />
        </mesh>
      </group>
      {/* road gates, lowered */}
      <Gate m={m} pos={[-7.4, 0, 1.55]} dir={-1} t={t} raise={gateRaise} />
      <Gate m={m} pos={[7.4, 0, -1.55]} dir={1} t={t} raise={gateRaise} />
      {ship === "cover" ? <Ship m={m} /> : ship ? <Ship m={m} pos={ship.pos} rotY={ship.rotY} /> : null}
      <FarBank m={m} />
     </group>
      {extras?.(m)}
    </group>
  );
};
