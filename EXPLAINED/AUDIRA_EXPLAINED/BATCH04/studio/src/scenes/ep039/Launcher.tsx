// AE-039 film: pig launcher on the platform deck. A wider steel barrel with a round closure door,
// a reducer cone down to pipe size; the pig slides from the tray into the barrel, the door closes.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { KEEP0, KEEP1, P, R } from "./layout.ts";
import { Backdrop, TAU, c, shellGeometry } from "./World.tsx";
import { CleaningPig } from "./FilmWorld.tsx";

export const LAUNCH = { barrelR: 1.12, x0: -3.4, x1: 0.6, coneEnd: 1.6, deckY: -1.25, door: [-3.4, 0, -1.12] as [number, number, number] };

const Board: React.FC = () => {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 384;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#f3f0ea";
    g.fillRect(0, 0, 1024, 384);
    g.fillStyle = "#0b3d2e";
    g.fillRect(0, 0, 1024, 26);
    g.fillStyle = "#14181c";
    g.font = `700 150px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 512, 170);
    g.font = `600 56px ${FONT}`;
    g.fillStyle = "#ef7a43";
    g.fillText("PIG LAUNCHER", 512, 298);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group position={[-1.6, LAUNCH.deckY, -2.0]}>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.8, 10]} />
          <meshPhysicalMaterial color="#5b636c" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0.03]} castShadow>
        <RoundedBoxGeo args={[2.6, 0.98, 0.06]} radius={0.02} />
        <meshPhysicalMaterial color="#f3f0ea" {...POLISH.toyPlastic} />
      </mesh>
      {tex ? (
        <mesh position={[0, 2.55, 0.065]}>
          <planeGeometry args={[2.5, 0.94]} />
          <meshStandardMaterial map={tex} roughness={0.6} />
        </mesh>
      ) : null}
    </group>
  );
};

export const LauncherWorld: React.FC<{ t: number; pigX: number; door: number }> = ({ t, pigX, door }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.Fog(P.fog, 14, 50);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  const barrel = useMemo(() => shellGeometry(LAUNCH.x0, LAUNCH.x1, KEEP0, KEEP1, c(LAUNCH.barrelR - 0.1), c(LAUNCH.barrelR), 10, 96), []);
  const cone = useMemo(
    () =>
      shellGeometry(
        LAUNCH.x1,
        LAUNCH.coneEnd,
        0,
        TAU,
        (_a, x) => THREE.MathUtils.lerp(LAUNCH.barrelR - 0.1, R.steelIn, (x - LAUNCH.x1) / (LAUNCH.coneEnd - LAUNCH.x1)),
        (_a, x) => THREE.MathUtils.lerp(LAUNCH.barrelR, R.steelOut, (x - LAUNCH.x1) / (LAUNCH.coneEnd - LAUNCH.x1)),
        10,
        96,
      ),
    [],
  );
  const pipe = useMemo(() => shellGeometry(LAUNCH.coneEnd, 9, 0, TAU, c(R.steelIn), c(R.steelOut), 10, 96), []);
  const grain = useSurfaceGrain(61, 0.15, 4);
  const deckGrain = useSurfaceGrain(5, 0.6, 30);
  const doorAng = door * 1.7; // radians open about the hinge
  return (
    <group>
      <Backdrop />
      <hemisphereLight args={["#9fdcef", "#14100c", 0.7]} />
      <directionalLight position={[-6, 12, 8]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
      <pointLight position={[-5, 2, 3]} intensity={18} distance={12} color="#ffb060" />
      <pointLight position={[4, 3, -4]} intensity={20} distance={16} color="#55d6ff" />
      {/* deck grating */}
      <mesh position={[0, LAUNCH.deckY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial color="#4a4f55" metalness={0.5} roughness={0.7} bumpMap={deckGrain} bumpScale={2} />
      </mesh>
      {/* saddles */}
      {[-2.6, -0.4, 2.8].map((x) => (
        <mesh key={x} position={[x, LAUNCH.deckY + 0.06 + (x > 1 ? 0.2 : 0), 0]} castShadow>
          <RoundedBoxGeo args={[0.3, x > 1 ? 0.5 : 0.18, 1.6]} radius={0.04} />
          <meshPhysicalMaterial color="#f2b33d" {...POLISH.toyPlastic} />
        </mesh>
      ))}
      <mesh geometry={barrel} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.steel} metalness={0.85} roughness={0.38} bumpMap={grain} bumpScale={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cone} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.steel} metalness={0.85} roughness={0.38} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={pipe} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.coating} roughness={0.4} clearcoat={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* closure door: hinged on the -Z side of the barrel mouth */}
      <group position={LAUNCH.door} rotation={[0, -doorAng, 0]}>
        <mesh position={[0, 0, LAUNCH.barrelR]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <cylinderGeometry args={[LAUNCH.barrelR + 0.06, LAUNCH.barrelR + 0.06, 0.16, 64]} />
          <meshPhysicalMaterial color="#c9cfd6" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[-0.12, 0, LAUNCH.barrelR]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.05, 12, 40]} />
          <meshPhysicalMaterial color="#ef7a43" {...POLISH.toyPlastic} />
        </mesh>
      </group>
      {/* loading tray */}
      <mesh position={[-4.6, -0.84, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[2.4, 0.08, 0.9]} radius={0.03} />
        <meshPhysicalMaterial color="#8b939c" metalness={0.8} roughness={0.4} />
      </mesh>
      {[-5.5, -3.8].map((x) => (
        <mesh key={x} position={[x, -1.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshPhysicalMaterial color="#5b636c" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <CleaningPig x={pigX} />
      <Board />
    </group>
  );
};
