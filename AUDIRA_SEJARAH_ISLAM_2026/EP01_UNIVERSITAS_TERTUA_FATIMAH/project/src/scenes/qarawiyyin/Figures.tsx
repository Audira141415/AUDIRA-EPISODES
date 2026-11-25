// Small faceless figures for EP01 (depiction rule: historical people only as small figures without
// faces). Heads are fully wrapped in cloth (turban or headscarf) in the robe's colour family, the
// camera sees them from above or behind, and no facial feature is ever modelled.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";

const robeGeo = (h: number, rTop: number, rBot: number) => {
  // lathe profile of a robe: narrow shoulders, wider hem, slight flare
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const k = i / 12;
    const r = rBot + (rTop - rBot) * Math.pow(k, 0.8) + Math.sin(k * Math.PI) * 0.01;
    pts.push(new THREE.Vector2(r, k * h));
  }
  pts.push(new THREE.Vector2(0.001, h));
  const g = new THREE.LatheGeometry(pts, 48);
  // cloth folds: vertical ripples that deepen toward the hem
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + (0.07 * Math.sin(a * 9) + 0.03 * Math.sin(a * 23 + 1)) * (1 - y / h);
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
};

/** Woven cloth: fabric sheen + seeded grain as roughness and bump. */
const Cloth: React.FC<{ color: string }> = ({ color }) => {
  const grain = useSurfaceGrain(311, 0.35, 6);
  return <meshPhysicalMaterial {...POLISH.fabric} color={color} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} sheenColor={new THREE.Color(color).lerp(new THREE.Color("#FFF1D6"), 0.5)} />;
};

/** Seated scholar/student: kneeling robe mass, shoulders, wrapped head with a turban. */
export const SeatedFigure: React.FC<{ robe: string; wrap: string; scale?: number; bow?: number }> = ({ robe, wrap, scale = 1, bow = 0 }) => {
  const body = useMemo(() => robeGeo(0.2, 0.06, 0.15), []);
  return (
    <group scale={scale}>
      {/* folded legs / lap under the robe */}
      <mesh position={[0, 0.035, 0.05]} scale={[1.25, 0.45, 1]}>
        <sphereGeometry args={[0.12, 20, 14]} />
        <Cloth color={robe} />
      </mesh>
      <group rotation={[bow, 0, 0]}>
        <mesh geometry={body} position={[0, 0.02, -0.01]}>
          <Cloth color={robe} />
        </mesh>
        {/* shoulders */}
        <mesh position={[0, 0.2, -0.01]} scale={[1.35, 0.6, 1]}>
          <sphereGeometry args={[0.065, 16, 12]} />
          <Cloth color={robe} />
        </mesh>
        {/* head fully wrapped: turban crown + wrap ring, no face */}
        <mesh position={[0, 0.27, -0.01]}>
          <sphereGeometry args={[0.048, 18, 14]} />
          <Cloth color={wrap} />
        </mesh>
        <mesh position={[0, 0.285, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.02, 10, 22]} />
          <Cloth color={wrap} />
        </mesh>
      </group>
    </group>
  );
};

/** Standing woman in a long robe and a headscarf that falls over the shoulders. Seen from behind. */
export const StandingFigure: React.FC<{ robe: string; scarf: string; scale?: number }> = ({ robe, scarf, scale = 1 }) => {
  const body = useMemo(() => robeGeo(0.4, 0.075, 0.15), []);
  // headscarf: a short cape that falls from the head over wide shoulders
  const cape = useMemo(() => robeGeo(0.16, 0.035, 0.115), []);
  return (
    <group scale={scale}>
      <mesh geometry={body}>
        <Cloth color={robe} />
      </mesh>
      {/* shoulders and arms folded in front (seen from behind: elbows out) */}
      <mesh position={[0, 0.37, 0]} scale={[1.6, 0.55, 1.05]}>
        <sphereGeometry args={[0.07, 18, 12]} />
        <Cloth color={robe} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.28, 0.03]} rotation={[0.5, 0, s * 0.25]}>
          <capsuleGeometry args={[0.028, 0.13, 6, 12]} />
          <Cloth color={robe} />
        </mesh>
      ))}
      <mesh geometry={cape} position={[0, 0.32, 0]}>
        <Cloth color={scarf} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[0.92, 1.08, 0.95]}>
        <sphereGeometry args={[0.052, 18, 14]} />
        <Cloth color={scarf} />
      </mesh>
    </group>
  );
};

/** Rehal: folding wooden book stand (two crossed boards) with a closed book. */
export const Rehal: React.FC<{ scale?: number; book?: string }> = ({ scale = 1, book = "#6B2E1C" }) => (
  <group scale={scale}>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, 0.045, s * 0.018]} rotation={[s * 0.75, 0, 0]}>
        <boxGeometry args={[0.13, 0.11, 0.008]} />
        <meshPhysicalMaterial {...POLISH.stone} roughness={0.6} color="#7A4A26" />
      </mesh>
    ))}
    {book ? (
      <mesh position={[0, 0.088, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.11, 0.012, 0.08]} />
        <meshPhysicalMaterial roughness={0.5} clearcoat={0.3} color={book} />
      </mesh>
    ) : null}
  </group>
);

/** Floor cushion. */
export const Cushion: React.FC<{ color: string }> = ({ color }) => (
  <mesh position={[0, 0.015, 0]} scale={[1, 0.25, 1]}>
    <sphereGeometry args={[0.14, 18, 12]} />
    <Cloth color={color} />
  </mesh>
);
