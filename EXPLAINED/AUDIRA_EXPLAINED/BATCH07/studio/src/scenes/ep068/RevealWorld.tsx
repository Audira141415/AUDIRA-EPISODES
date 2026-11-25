// AE-068 REVEAL worlds.
// A) Pipe yard: one 2,43 m segment, then the row of 189 segments lit one after another ("didorong bergiliran").
// B) Sodetan Ciliwung: the Ø 4,05 m pipe in its launch shaft with a person for scale, then the long run to the
//    receiving shaft (590 m between shafts, drawn as a schematic, not to scale).
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { C, RP, SEG, T, ss } from "./shared.ts";
import { Box, Mats, PipeSeg, notchGeo } from "./StreetWorld.tsx";

// ---------- A: pipe yard ----------
export const ROW_N = 189;
export const YARD_Y = RP + 0.3;
/** Index (0..189) of segments already lit by time t. */
// Counter rule: the final 189 must already be on screen when the VO says "seratus": ramp 0,55 s, done 0,02 s before the word.
export const litCount = (t: number) => Math.round(ROW_N * ss(T.seratus - 0.57, T.seratus - 0.02, t));
/** "didorong bergiliran": a push wave that runs down the lit string, segment after segment. */
export const waveAt = (t: number) => (t < T.didorong - 0.2 ? -99 : (t - (T.didorong - 0.2)) * 26);

export const PipeYard: React.FC<{ t: number; M: Mats }> = ({ t, M }) => {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(RP, RP, SEG - 0.08, 32, 1, true);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const ringGeo = useMemo(() => { const g = new THREE.CylinderGeometry(RP * 1.035, RP * 1.035, 0.24, 40, 1, true); g.rotateX(Math.PI / 2); return g; }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: M.crete, bumpMap: M.crete, bumpScale: 2.2, roughness: 0.96, specularIntensity: 0.2, envMapIntensity: 0.35, side: THREE.DoubleSide }), [M]);
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5, metalness: 0.7 }), []);
  // lit = warm accent tint over the concrete; joints = dark steel collars so every segment reads as one link
  const base = new THREE.Color("#c9c6c0"), hot = new THREE.Color("#f6c35a"), joint = new THREE.Color("#3a3f46"), jointHot = new THREE.Color(C.accent), push = new THREE.Color("#fff4d8");
  const inst = useMemo(() => {
    const body = new THREE.InstancedMesh(geo, mat, ROW_N);
    const rings = new THREE.InstancedMesh(ringGeo, ringMat, ROW_N);
    const m = new THREE.Matrix4();
    for (let i = 0; i < ROW_N; i++) {
      const z = -SEG / 2 - i * SEG - 0.04 * i;
      m.makeTranslation(0, YARD_Y, z); body.setMatrixAt(i, m);
      m.makeTranslation(0, YARD_Y, z + SEG / 2 - 0.1); rings.setMatrixAt(i, m);
      body.setColorAt(i, new THREE.Color("#c9c6c0")); rings.setColorAt(i, new THREE.Color("#3a3f46"));
    }
    body.castShadow = true; body.receiveShadow = true;
    return { body, rings };
  }, [geo, mat, ringGeo, ringMat]);
  const lit = litCount(t);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    const wv = waveAt(t);
    for (let i = 0; i < ROW_N; i++) {
      const w = Math.max(0, 1 - Math.abs(i - wv) / 3);
      c.copy(i < lit ? hot : base).lerp(push, w);
      inst.body.setColorAt(i, c);
      c.copy(i < lit ? jointHot : joint);
      inst.rings.setColorAt(i, c);
    }
    inst.body.instanceColor!.needsUpdate = true; inst.rings.instanceColor!.needsUpdate = true;
  });
  const heroGlow = ss(T.panjangnya - 0.2, T.panjangnya + 0.3, t) * (1 - ss(T.seratus, T.seratus + 0.4, t));
  return (
    <group>
      {/* concrete apron */}
      <Box a={[-30, -0.4, -520]} b={[30, 0, 30]} m={M.apron} />
      {/* timber sleepers */}
      {Array.from({ length: 60 }, (_, i) => <Box key={i} a={[-1.1, 0, -i * 2.47 - 0.5]} b={[1.1, 0.3, -i * 2.47 - 0.2]} m={M.gravel} r />)}
      <primitive object={inst.body} />
      <primitive object={inst.rings} />
      {/* hero segment outline glow at "panjangnya" */}
      <mesh position={[0, YARD_Y, -SEG / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[RP * 1.03, RP * 1.03, SEG, 40, 1, true]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.35 * heroGlow} depthWrite={false} side={THREE.BackSide} toneMapped={false} />
      </mesh>
      {/* side stacks for context */}
      {[-6, 6].map((x) => [0, 1, 2].map((k) => (
        <group key={`${x}${k}`} position={[x + (k - 1) * 1.85, 0, -8 - k * 0]} rotation={[0, Math.PI / 2, 0]}>
          <PipeSeg x={-SEG / 2} y={RP} M={M} />
        </group>
      )))}
    </group>
  );
};

// ---------- B: Sodetan Ciliwung ----------
export const GR = 2.025, GRI = 1.75, GY = -6.5;
export const GA = { x0: -34, x1: -26 }; // launch shaft (open)
export const GB = { x0: 26, x1: 32 }; // receiving shaft
export const Sodetan: React.FC<{ t: number; f: number; M: Mats }> = ({ t, f, M }) => {
  const geos = useMemo(() => {
    const out: { g: THREE.BufferGeometry; m: keyof Mats }[] = [];
    const L: [number, number, keyof Mats][] = [[0, -0.6, "gravel"], [-0.6, -3.6, "laterite"], [-3.6, -9.2, "clay"], [-9.2, -16, "silt"]];
    for (const [y0, y1, m] of L) {
      const notch = m === "clay";
      if (y0 > -9.2) {
        out.push({ g: notchGeo(-80, GA.x0, y0, y1, -4, 0), m });
        out.push({ g: notchGeo(GA.x1, GB.x0, y0, y1, -4, notch ? GR + 0.03 : 0, GY), m });
        out.push({ g: notchGeo(GB.x1, 80, y0, y1, -4, 0), m });
      } else out.push({ g: notchGeo(-80, 80, y0, y1, -4, 0), m });
      out.push({ g: notchGeo(-80, 80, y0, y1, -30, 0).translate(0, 0, -4), m });
    }
    return out;
  }, []);
  const segL = 3.0;
  const n = Math.ceil((GB.x0 - GA.x1 + 3) / segL);
  return (
    <group>
      {geos.map((o, i) => <mesh key={i} geometry={o.g} material={M[o.m] as THREE.Material} castShadow receiveShadow />)}
      {/* shaft floors and back walls */}
      {[GA, GB].map((p, i) => (
        <group key={i}>
          <Box a={[p.x0, -9.5, -4]} b={[p.x1, -9.2, 0]} m={M.concrete} />
          <Box a={[p.x0, -9.5, -4.4]} b={[p.x1, 0.1, -4]} m={M.concrete} />
        </group>
      ))}
      {/* river on the surface (the bypass runs to it) */}
      <mesh position={[6, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[160, 9]} /><meshStandardMaterial color="#3d6f7e" roughness={0.15} metalness={0.2} /></mesh>
      <Box a={[-80, -0.6, -60]} b={[80, 0, -4]} m={M.walk} />
      {/* giant pipe string */}
      {Array.from({ length: n }, (_, i) => <PipeSeg key={i} x={GA.x1 - 2.6 + i * segL} y={GY} r={GR} ri={GRI} len={segL} M={M} />)}
      <Box a={[-80, -16.6, -60]} b={[80, -16, 4]} m={M.plinth} />
      {/* person for scale at the pipe mouth */}
      <ToyPerson f={f} seed={31} pose="stand" outfit="uniform" position={[GA.x1 - 4.0, -9.2, 1.6]} heading={0.6} scale={1.7}
        headwear={<mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={C.yellow} roughness={0.4} /></mesh>} />
      <Box a={[GA.x0, -9.5, 0]} b={[GA.x1, -9.2, 3.2]} m={M.concrete} />
    </group>
  );
};
