import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { T, CUT, seg, pop, clamp01, type SetName } from "./timing.ts";

/* ── Palette ── */
const P = {
  blueprintDark: "#061327", blueprintNavy: "#091b36",
  gridFine: "#112952", gridMajor: "#1d3d75",
  cadWhite: "#ffffff", cadCyan: "#4fc3f7", cadDim: "#547299",
  dimensionGold: "#ffca28", sectionHatch: "#29b6f6",
  stampCrimson: "#ef5350",
  ajaxRed: "#D2122E", ajaxWhite: "#FFFFFF",
};

/* ── CAD line material ── */
const useCadLine = (color: string, opacity = 0.95) => useMemo(() =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: true }), [color, opacity]);

const useGhostMesh = (color: string, opacity = 0.6) => useMemo(() =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe: true }), [color, opacity]);

/* ── Drafting table (grid plane) ── */
const DraftingTable: React.FC = () => (
  <group>
    <gridHelper args={[32, 64, P.gridMajor, P.gridFine]} rotation={[0, 0, 0]} position={[0, -0.01, 0]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[32, 32]} />
      <meshBasicMaterial color={P.blueprintNavy} />
    </mesh>
  </group>
);

/* ── CAD wireframe box ── */
const CadBox: React.FC<{
  size: [number, number, number]; position: [number, number, number]; color?: string;
  drawProgress?: number; rotation?: [number, number, number];
}> = ({ size, position, color = P.cadWhite, drawProgress = 1, rotation }) => {
  const mat = useGhostMesh(P.blueprintNavy, 0.3 * drawProgress);
  const lineMat = useCadLine(color, 0.9 * drawProgress);
  if (drawProgress <= 0) return null;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <primitive object={mat} attach="material" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <primitive object={lineMat} attach="material" />
      </lineSegments>
    </group>
  );
};

/* ── CAD wireframe cylinder ── */
const CadCylinder: React.FC<{
  radius: number; height: number; position: [number, number, number]; color?: string;
  drawProgress?: number; rotation?: [number, number, number];
}> = ({ radius, height, position, color = P.cadCyan, drawProgress = 1, rotation }) => {
  const mat = useGhostMesh(P.blueprintNavy, 0.25 * drawProgress);
  const lineMat = useCadLine(color, 0.85 * drawProgress);
  if (drawProgress <= 0) return null;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 16]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(radius, radius, height, 16)]} />
        <primitive object={lineMat} attach="material" />
      </lineSegments>
    </group>
  );
};

/* ── Dimension line ── */
const DimensionLine3D: React.FC<{
  from: [number, number, number]; to: [number, number, number]; drawProgress?: number;
}> = ({ from, to, drawProgress = 1 }) => {
  const mat = useCadLine(P.dimensionGold, 0.9 * drawProgress);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...from, ...to], 3));
    return g;
  }, [from, to]);
  if (drawProgress <= 0) return null;
  return <lineSegments geometry={geo}><primitive object={mat} attach="material" /></lineSegments>;
};

/* ── Centreline ── */
const Centreline: React.FC<{ length?: number; drawProgress?: number }> = ({ length = 8, drawProgress = 1 }) => {
  const mat = useCadLine(P.cadCyan, 0.6 * drawProgress);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -length / 2, 0, 0, length / 2], 3));
    return g;
  }, [length]);
  if (drawProgress <= 0) return null;
  return <lineSegments geometry={geo}><primitive object={mat} attach="material" /></lineSegments>;
};

/* ── Compass rose ── */
const CompassRose: React.FC<{ position: [number, number, number]; drawProgress?: number }> = ({ position, drawProgress = 1 }) => {
  const mat = useCadLine(P.cadCyan, 0.7 * drawProgress);
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      pts.push(0, 0, 0, Math.sin(a) * 0.6, 0, Math.cos(a) * 0.6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  if (drawProgress <= 0) return null;
  return <group position={position}><lineSegments geometry={geo}><primitive object={mat} attach="material" /></lineSegments></group>;
};

/* ── Player figure (wireframe) ── */
const CadPlayer: React.FC<{
  position: [number, number, number]; color?: string; drawProgress?: number;
}> = ({ position, color = P.cadWhite, drawProgress = 1 }) => (
  <group position={position}>
    <CadBox size={[0.3, 0.5, 0.25]} position={[0, 0.5, 0]} color={color} drawProgress={drawProgress} />
    <CadCylinder radius={0.15} height={0.3} position={[0, 1, 0]} color={color} drawProgress={drawProgress} />
    <CadBox size={[0.2, 0.4, 0.2]} position={[0, 0, 0]} color={color} drawProgress={drawProgress} />
  </group>
);

/* ── Pitch outline ── */
const PitchOutline: React.FC<{ drawProgress?: number }> = ({ drawProgress = 1 }) => {
  const mat = useCadLine(P.cadWhite, 0.6 * drawProgress);
  const geo = useMemo(() => {
    const w = 3.5, h = 5;
    const pts = [-w, 0, -h, w, 0, -h, w, 0, -h, w, 0, h, w, 0, h, -w, 0, h, -w, 0, h, -w, 0, -h, -w, 0, 0, w, 0, 0];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  if (drawProgress <= 0) return null;
  return <lineSegments geometry={geo}><primitive object={mat} attach="material" /></lineSegments>;
};

/* ── Trophy (wireframe) ── */
const CadTrophy: React.FC<{ position: [number, number, number]; color?: string; drawProgress?: number; scale?: number }> = ({ position, color = P.dimensionGold, drawProgress = 1, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <CadCylinder radius={0.25} height={0.5} position={[0, 0.7, 0]} color={color} drawProgress={drawProgress} />
    <CadBox size={[0.5, 0.12, 0.5]} position={[0, 0.15, 0]} color={color} drawProgress={drawProgress} />
    <CadCylinder radius={0.08} height={0.4} position={[0, 0.4, 0]} color={color} drawProgress={drawProgress} />
  </group>
);

/* ── Camera rig ── */
const CameraRig: React.FC<{ t: number; currentSet: SetName }> = ({ t, currentSet }) => {
  const { camera } = useThree();
  useFrame(() => {
    let pos: [number, number, number];
    let look: [number, number, number] = [0, 0, 0];
    /* camera progress reserved for future arc refinement */
    switch (currentSet) {
      case "hook":
        pos = [0.5 + Math.sin(t * 0.3) * 0.5, 8.5 * (1 - seg(t, 0, T.hookEnd) * 0.15), 1.5 + seg(t, 0, T.hookEnd) * 2];
        break;
      case "context":
        pos = [1 + Math.sin(t * 0.2) * 1, 7, 4 + seg(t, CUT.context, CUT.triumph) * 1];
        break;
      case "triumph":
        pos = [3 + Math.sin(t * 0.15) * 2, 5, 5 + seg(t, CUT.triumph, CUT.kovacs) * 1.5];
        look = [0, 0.2, 0];
        break;
      case "kovacs":
        pos = [4, 4.5, 5.5];
        look = [0, 0.3, 0];
        break;
      case "academy":
        pos = [5 + Math.cos(t * 0.1) * 1, 4.5, 5.5];
        look = [0, 0.2, 0];
        break;
      case "export":
        pos = [5.5, 4.2, 5.5 + seg(t, CUT.export, CUT.outro) * 0.7];
        look = [0, 0.2, 0];
        break;
      default:
        pos = [6, 4.5, 6];
        look = [0, 0.3, 0];
    }
    camera.position.set(...pos);
    camera.lookAt(new THREE.Vector3(...look));
    (camera as THREE.PerspectiveCamera).fov = 36;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
};
/* ── Sets ── */

const HookSet: React.FC<{ t: number }> = ({ t }) => {
  const dp = clamp01((t - 0) / 1.8);
  return (
    <group>
      <PitchOutline drawProgress={dp} />
      <Centreline drawProgress={dp} />
      <CompassRose position={[3, 0, 3]} drawProgress={dp} />
      <CadPlayer position={[-1, 0, 2]} color={P.cadCyan} drawProgress={dp} />
      <CadPlayer position={[1, 0, -2]} color={P.cadWhite} drawProgress={dp} />
      <DimensionLine3D from={[-1, 1.5, 2]} to={[1, 1.5, -2]} drawProgress={seg(t, T.bek, T.penyerang)} />
    </group>
  );
};

const ContextSet: React.FC<{ t: number }> = ({ t }) => {
  const dp = seg(t, CUT.context, CUT.context + 2);
  return (
    <group>
      <PitchOutline drawProgress={dp} />
      <CadPlayer position={[0, 0, -3]} color={P.dimensionGold} drawProgress={seg(t, T.michels, T.pelatih)} />
      <CadPlayer position={[1.5, 0, -1]} color={P.cadCyan} drawProgress={seg(t, T.cruyff1, T.totalFb)} />
      {/* Total Football formation: players in 4-3-3, arrows showing swaps */}
      {[[-2, -2], [-1, -3], [1, -3], [2, -2], [-1.5, 0], [0, 0.5], [1.5, 0], [-1, 2], [0, 3], [1, 2]].map(([x, z], i) => (
        <CadPlayer key={i} position={[x, 0, z]} color={i < 4 ? P.cadDim : P.cadWhite} drawProgress={seg(t, T.totalFb, T.bolong)} />
      ))}
      <Centreline length={10} drawProgress={dp} />
    </group>
  );
};

const TriumphSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <CadTrophy position={[-2, 0, 0]} color={P.dimensionGold} drawProgress={pop(t, T.y1971, 0.5)} />
    <CadTrophy position={[0, 0, -0.5]} color={P.dimensionGold} drawProgress={pop(t, T.y1972, 0.5)} />
    <CadTrophy position={[2, 0, 0]} color={P.dimensionGold} drawProgress={pop(t, T.y1973, 0.5)} />
    <PitchOutline drawProgress={1} />
    <DimensionLine3D from={[-2, 1.8, 0]} to={[2, 1.8, 0]} drawProgress={seg(t, T.tigaTrofi, T.realMadrid)} />
    <CompassRose position={[-3.5, 0, -3.5]} drawProgress={1} />
    <Centreline drawProgress={1} />
  </group>
);

const KovacsSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <CadPlayer position={[-1, 0, -2]} color={P.cadCyan} drawProgress={seg(t, T.kovacs, T.treble)} />
    <CadBox size={[3, 2, 2]} position={[0, 1, 0]} color={P.cadWhite} drawProgress={seg(t, CUT.kovacs, T.treble)} />
    <DimensionLine3D from={[-1.5, 0, 1.5]} to={[1.5, 0, 1.5]} drawProgress={seg(t, T.treble, T.y1973)} />
    <DimensionLine3D from={[-1.5, 2, -1]} to={[1.5, 2, -1]} drawProgress={seg(t, T.y1973, T.tigaTrofi)} />
    <PitchOutline drawProgress={1} />
  </group>
);

const AcademySet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <CadBox size={[4, 2.5, 3]} position={[0, 1.25, 0]} color={P.cadCyan} drawProgress={seg(t, T.akademi, T.toekomst)} />
    <CadBox size={[1.5, 1, 1.5]} position={[-2.5, 0.5, -2]} color={P.cadWhite} drawProgress={seg(t, T.toekomst, T.filosofi)} />
    <DimensionLine3D from={[-2, 2.5, 0]} to={[2, 2.5, 0]} drawProgress={seg(t, T.filosofi, T.tips)} />
    {/* Star factory: player lineage */}
    {[T.cruyff3, T.vanBasten, T.bergkamp, T.kluivert].map((at, i) => (
      <CadPlayer key={i} position={[-1.5 + i, 0, 2.5]} color={P.dimensionGold} drawProgress={pop(t, at, 0.4)} />
    ))}
    <PitchOutline drawProgress={1} />
    <CompassRose position={[4, 0, -3]} drawProgress={1} />
  </group>
);

const ExportSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <DimensionLine3D from={[-3, 0.5, 0]} to={[3, 0.5, 0]} drawProgress={seg(t, T.menyeberang, T.barcelona2)} />
    <CadPlayer position={[-3, 0, 0]} color={P.cadCyan} drawProgress={1} />
    <CadPlayer position={[-2, 0, 0]} color={P.dimensionGold} drawProgress={1} />
    <CadBox size={[2.5, 1.5, 2]} position={[3, 0.75, 0]} color={P.stampCrimson} drawProgress={seg(t, T.barcelona2, T.tikiTaka)} />
    <CadCylinder radius={1} height={0.05} position={[0, 0, 0]} color={P.cadWhite} drawProgress={seg(t, T.dna, T.modern)} />
    <PitchOutline drawProgress={1} />
    <Centreline length={12} drawProgress={1} />
    <CompassRose position={[-5, 0, -4]} drawProgress={1} />
  </group>
);

const OutroSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <CadBox size={[3, 0.5, 2]} position={[0, 0.25, 0]} color={P.cadCyan} drawProgress={1} />
    <CompassRose position={[2, 0, 2]} drawProgress={1} />
    <Centreline drawProgress={1} />
  </group>
);

/* ── Main scene ── */
export const FilmScene: React.FC<{ t: number; frame: number; fps: number; currentSet: SetName }> = ({ t, frame, fps, currentSet }) => {
  return (
    <>
      <CameraRig t={t} currentSet={currentSet} />
      <ambientLight color={P.blueprintNavy} intensity={1.5} />
      <directionalLight position={[5, 10, 5]} color="#ffffff" intensity={1.2} />
      <fog attach="fog" args={[P.blueprintDark, 12, 30]} />
      <DraftingTable />

      {currentSet === "hook" && <HookSet t={t} />}
      {currentSet === "context" && <ContextSet t={t} />}
      {currentSet === "triumph" && <TriumphSet t={t} />}
      {currentSet === "kovacs" && <KovacsSet t={t} />}
      {currentSet === "academy" && <AcademySet t={t} />}
      {currentSet === "export" && <ExportSet t={t} />}
      {currentSet === "outro" && <OutroSet t={t} />}

      <Finish frame={frame} background={P.blueprintDark} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1} envIntensity={0} ao={false} />
    </>
  );
};
