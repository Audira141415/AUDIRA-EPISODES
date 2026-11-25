// AE-039 film: overview diorama (INNERWORKS cut block of sea): platform pump → riser → seabed
// pipeline → shore tank. One driver: flow phase along the pipe path.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { P } from "./layout.ts";
import { Backdrop } from "./World.tsx";

export const OV = {
  seaTop: 5,
  x0: -6.2,
  x1: 6.4,
  zHalf: 2.4,
  shoreX: 3.6,
  platX: -3.6,
  deckY: 6.4,
  pump: [-3.3, 6.85, 0.3] as [number, number, number],
  tank: [5.3, 2.6, 0] as [number, number, number],
};

export const OV_PATH = new THREE.CatmullRomCurve3(
  [
    [-2.85, 6.85, 0.3],
    [-2.75, 6.55, 0.3],
    [-2.75, 1.0, 0.3],
    [-2.5, 0.22, 0.3],
    [-1.6, 0.18, 0.1],
    [1.0, 0.18, -0.1],
    [3.0, 0.2, -0.1],
    [3.9, 0.9, -0.1],
    [4.5, 1.9, -0.05],
    [4.8, 2.2, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.15,
);

const Shore: React.FC = () => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(OV.shoreX - 0.6, 0);
    s.bezierCurveTo(OV.shoreX + 0.2, 0.2, OV.shoreX + 0.6, 1.6, OV.shoreX + 1.2, 2.1);
    s.lineTo(OV.x1, 2.2);
    s.lineTo(OV.x1, -1.2);
    s.lineTo(OV.shoreX - 0.6, -1.2);
    s.lineTo(OV.shoreX - 0.6, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: OV.zHalf * 2, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3, curveSegments: 24 });
    g.translate(0, 0, -OV.zHalf);
    return g;
  }, []);
  const grain = useSurfaceGrain(88, 0.5, 4);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial color="#c9b48a" {...POLISH.stone} bumpMap={grain} bumpScale={1} />
    </mesh>
  );
};

const Leg: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <mesh position={[x, OV.deckY / 2, z]} castShadow>
    <cylinderGeometry args={[0.09, 0.12, OV.deckY, 16]} />
    <meshPhysicalMaterial color="#f2b33d" {...POLISH.toyPlastic} />
  </mesh>
);

const Brace: React.FC<{ a: [number, number, number]; b: [number, number, number] }> = ({ a, b }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[0.035, 0.035, len, 8]} />
      <meshPhysicalMaterial color="#d99a2b" {...POLISH.toyPlastic} />
    </mesh>
  );
};

const Platform: React.FC<{ t: number; pumpOn: number }> = ({ t, pumpOn }) => {
  const px = OV.platX;
  const legs: [number, number][] = [
    [px - 0.7, -0.7],
    [px + 0.7, -0.7],
    [px - 0.7, 0.7],
    [px + 0.7, 0.7],
  ];
  const braces: React.ReactNode[] = [];
  for (const yy of [1.2, 2.8, 4.4]) {
    braces.push(<Brace key={`a${yy}`} a={[px - 0.7, yy, 0.7]} b={[px + 0.7, yy + 1.2, 0.7]} />);
    braces.push(<Brace key={`b${yy}`} a={[px - 0.7, yy, -0.7]} b={[px + 0.7, yy + 1.2, -0.7]} />);
    braces.push(<Brace key={`c${yy}`} a={[px - 0.7, yy + 1.2, -0.7]} b={[px - 0.7, yy, 0.7]} />);
  }
  const spin = t * 6 * pumpOn;
  return (
    <group>
      {legs.map(([x, z]) => (
        <Leg key={`${x}${z}`} x={x} z={z} />
      ))}
      {braces}
      {/* deck */}
      <mesh position={[px, OV.deckY + 0.12, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.4, 0.24, 2.2]} radius={0.05} />
        <meshPhysicalMaterial color="#e6e2da" {...POLISH.toyPlastic} />
      </mesh>
      {/* module house */}
      <mesh position={[px - 0.55, OV.deckY + 0.7, -0.45]} castShadow>
        <RoundedBoxGeo args={[1.0, 0.9, 1.0]} radius={0.06} />
        <meshPhysicalMaterial color="#6ccdaa" {...POLISH.toyPlastic} />
      </mesh>
      {/* helideck-free crane */}
      <mesh position={[px - 0.9, OV.deckY + 1.4, 0.7]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 8]} />
        <meshPhysicalMaterial color="#ef7a43" {...POLISH.toyPlastic} />
      </mesh>
      {/* pump: motor + volute + spinning coupling */}
      <group position={OV.pump}>
        <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.55, 32]} />
          <meshPhysicalMaterial color="#5ea7dc" {...POLISH.toyPlastic} />
        </mesh>
        <mesh position={[-0.1, 0.05, 0]} rotation={[spin, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.16, 6]} />
          <meshPhysicalMaterial color="#c9cfd6" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.3, 32]} />
          <meshPhysicalMaterial color="#f4b33f" {...POLISH.toyPlastic} emissive="#ff8a2a" emissiveIntensity={0.25 * pumpOn * (0.6 + 0.4 * Math.sin(t * 9))} />
        </mesh>
      </group>
    </group>
  );
};

const PipePath: React.FC = () => {
  const geo = useMemo(() => new THREE.TubeGeometry(OV_PATH, 220, 0.11, 20, false), []);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial color="#8d8f8a" roughness={0.8} metalness={0.2} />
    </mesh>
  );
};

const FlowDots: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on <= 0) return null;
  const n = 26;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = (i / n + t * 0.07) % 1;
        const p = OV_PATH.getPointAt(u);
        const tan = OV_PATH.getTangentAt(u);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
        return (
          <mesh key={i} position={[p.x, p.y + 0.0, p.z + 0.12]} quaternion={q} layers={FX_LAYER}>
            <coneGeometry args={[0.07, 0.18, 10]} />
            <meshBasicMaterial color={P.amber} toneMapped={false} transparent opacity={on} />
          </mesh>
        );
      })}
    </group>
  );
};

const Water: React.FC<{ t: number }> = ({ t }) => {
  const w = OV.shoreX + 0.3 - OV.x0;
  const surf = useMemo(() => new THREE.PlaneGeometry(w, OV.zHalf * 2, 60, 12), [w]);
  useMemo(() => {
    const p = surf.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, 0.05 * Math.sin(x * 2.1 + t * 1.6) + 0.03 * Math.sin(y * 3.3 - t * 1.1));
    }
    p.needsUpdate = true;
    surf.computeVertexNormals();
  }, [surf, t]);
  return (
    <group>
      <mesh position={[OV.x0 + w / 2, OV.seaTop / 2, 0]} layers={FX_LAYER}>
        <boxGeometry args={[w, OV.seaTop, OV.zHalf * 2]} />
        <meshBasicMaterial color="#1e7fa0" transparent opacity={0.16} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={surf} position={[OV.x0 + w / 2, OV.seaTop, 0]} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER}>
        <meshPhysicalMaterial color="#3fb6d6" transparent opacity={0.45} roughness={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* front glass edge of the cut block */}
      <mesh position={[OV.x0 + w / 2, OV.seaTop / 2, OV.zHalf]} layers={FX_LAYER}>
        <planeGeometry args={[w, OV.seaTop]} />
        <meshBasicMaterial color="#2aa3c9" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Seafloor: React.FC = () => {
  const grain = useSurfaceGrain(91, 0.5, 6);
  const w = OV.shoreX - OV.x0;
  return (
    <group>
      <mesh position={[OV.x0 + w / 2, -0.6, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, 1.2, OV.zHalf * 2]} radius={0.06} />
        <meshPhysicalMaterial color="#b9a57c" {...POLISH.stone} bumpMap={grain} bumpScale={1} />
      </mesh>
      {/* cut-face strata on the front */}
      {[
        [-0.25, "#9c8a64"],
        [-0.75, "#7d6e52"],
      ].map(([y, col]) => (
        <mesh key={String(y)} position={[OV.x0 + w / 2, Number(y), OV.zHalf + 0.004]}>
          <planeGeometry args={[w - 0.1, 0.32]} />
          <meshStandardMaterial color={String(col)} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const Tank: React.FC = () => (
  <group position={OV.tank}>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.9, 40]} />
      <meshPhysicalMaterial color="#e6e2da" {...POLISH.toyPlastic} />
    </mesh>
    <mesh position={[0, 0.93, 0]} castShadow>
      <cylinderGeometry args={[0.56, 0.6, 0.08, 40]} />
      <meshPhysicalMaterial color="#ef7a43" {...POLISH.toyPlastic} />
    </mesh>
  </group>
);

export const OverviewWorld: React.FC<{ t: number; pumpOn: number; flow: number }> = ({ t, pumpOn, flow }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.Fog(P.fog, 30, 90);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  return (
    <group>
      <Backdrop />
      <hemisphereLight args={["#9fdcef", "#14100c", 0.8]} />
      <directionalLight position={[-6, 14, 9]} intensity={2.6} color="#fff3e2" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} />
      <pointLight position={[6, 6, -6]} intensity={30} distance={25} color="#55d6ff" />
      <Seafloor />
      <Shore />
      <Platform t={t} pumpOn={pumpOn} />
      <PipePath />
      <FlowDots t={t} on={flow} />
      <Tank />
      <Water t={t} />
    </group>
  );
};
