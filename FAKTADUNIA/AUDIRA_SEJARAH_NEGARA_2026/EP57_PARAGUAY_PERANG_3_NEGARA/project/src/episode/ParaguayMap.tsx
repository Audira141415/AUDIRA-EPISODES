// EP57 Paraguay vs Aliansi Tiga — HISTORYMAP war table.
// Map projection: x = (lon + 57) * 0.25, z = -(lat + 26) * 0.25 (north = -z).
// Shapes are drawn in XY with y = (lat + 26) * 0.25 and laid flat with rotation -90° on X,
// so ExtrudeGeometry depth points up (+y).
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../core/polish/Polish.tsx";
import { SceneText } from "../core/polish/Drei.tsx";
import { KeyLight } from "../core/scene/KeyLight.tsx";
import { GILT, MAP_PAPER, TABLE } from "../kits/historymap/lib/materials";

export const C = {
  oceanVoid: "#121822",
  sea: "#1d3550",
  neutral: "#6f6a5c",
  paraguay: "#C5A059",
  brazil: "#8B1E1E",
  argentina: "#A8432A",
  uruguay: "#6E2A3A",
  arrow: "#FF3344",
  gilt: "#D4AF37",
  river: "#3d6fa3",
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const p = clamp01(x);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

type LL = [number, number];
/** lon/lat → world [x, y, z]. */
export const P = (lon: number, lat: number, y = 0): [number, number, number] => [(lon + 57) * 0.25, y, -(lat + 26) * 0.25];
const toShape = (pts: LL[]) => {
  const s = new THREE.Shape();
  pts.forEach(([lon, lat], i) => {
    const x = (lon + 57) * 0.25;
    const y = (lat + 26) * 0.25;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  });
  s.closePath();
  return s;
};

// Simplified borders (enough to read on a phone, not survey-grade).
const PARAGUAY: LL[] = [
  [-62.6, -22.2], [-61.8, -19.6], [-59.1, -19.3], [-58.2, -19.8], [-57.9, -22.0], [-56.0, -22.3], [-55.4, -23.9],
  [-54.6, -24.1], [-54.3, -25.6], [-54.7, -26.6], [-55.7, -27.4], [-58.6, -27.3], [-57.6, -25.4], [-60.0, -24.0],
];
const ARGENTINA: LL[] = [
  [-66, -22], [-62.6, -22.2], [-60.0, -24.0], [-57.6, -25.4], [-58.6, -27.3], [-55.7, -27.4], [-53.7, -26.3],
  [-54.0, -27.6], [-56.0, -30.1], [-57.6, -30.2], [-58.4, -33.0], [-58.4, -34.5], [-57.2, -35.5], [-57.4, -36], [-66, -36],
];
const URUGUAY: LL[] = [
  [-57.6, -30.2], [-56.0, -30.1], [-53.4, -32.6], [-53.7, -33.7], [-54.9, -34.9], [-56.2, -34.9], [-57.8, -34.4], [-58.4, -33.0],
];
const BRAZIL: LL[] = [
  [-58.2, -16], [-58.2, -19.8], [-57.9, -22.0], [-56.0, -22.3], [-55.4, -23.9], [-54.6, -24.1], [-54.3, -25.6],
  [-53.7, -26.3], [-54.0, -27.6], [-56.0, -30.1], [-53.4, -32.6], [-53.7, -33.7], [-52.4, -32.4], [-51.0, -31.0],
  [-48.6, -28.2], [-48.4, -26.0], [-48.0, -24.0], [-48, -16],
];
const BOLIVIA: LL[] = [[-66, -16], [-58.2, -16], [-58.2, -19.8], [-59.1, -19.3], [-61.8, -19.6], [-62.6, -22.2], [-66, -22]];

/** Territory Paraguay claimed before the war and lost (~30 %): Chaco south of the Pilcomayo, Misiones, the north strip. */
export const WEDGE_CHACO: LL[] = [[-62.6, -22.2], [-60.0, -24.0], [-57.6, -25.4], [-58.4, -26.9], [-61.0, -25.4], [-63.6, -23.6]];
export const WEDGE_MISIONES: LL[] = [[-55.7, -27.4], [-54.7, -26.6], [-53.8, -26.5], [-54.1, -27.5], [-55.3, -28.1]];
export const WEDGE_NORTH: LL[] = [[-57.9, -22.0], [-56.0, -22.3], [-55.5, -21.1], [-57.8, -20.9]];

const RIVERS: LL[][] = [
  // Paraguay river: north to south past Asunción into the Paraná
  [[-57.9, -16.2], [-57.7, -19.0], [-58.0, -21.5], [-57.8, -23.5], [-57.6, -25.3], [-58.4, -26.9], [-58.6, -27.3]],
  // Paraná: east of Paraguay, along its south edge, then south to the Plata
  [[-54.6, -24.0], [-54.5, -25.6], [-55.8, -27.35], [-58.6, -27.3], [-59.2, -29.5], [-60.6, -32.0], [-59.4, -33.6], [-58.4, -34.2]],
  // Uruguay river
  [[-53.7, -27.2], [-55.8, -29.0], [-57.6, -30.4], [-58.1, -32.5], [-58.4, -33.9]],
];

export const PLACES = {
  asuncion: P(-57.6, -25.3),
  humaita: P(-58.5, -27.07),
  cerroCora: P(-56.0, -22.6),
  paraguayMid: P(-57.0, -24.0),
  brazilMid: P(-51.5, -22.0),
  argentinaMid: P(-62.0, -30.5),
  uruguayMid: P(-56.0, -32.6),
};

const flat: [number, number, number] = [-Math.PI / 2, 0, 0];

const Land: React.FC<{ pts: LL[]; color: string; h?: number; lift?: number; opacity?: number; emissive?: number }> = ({
  pts,
  color,
  h = 0.025,
  lift = 0,
  opacity = 1,
  emissive = 0,
}) => {
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(toShape(pts), { depth: h, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 2 }),
    [pts, h],
  );
  const grain = useSurfaceGrain(31, 0.16, 4);
  return (
    <mesh geometry={geo} rotation={flat} position={[0, 0.004 + lift, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        {...MAP_PAPER}
        roughnessMap={grain}
        bumpMap={grain}
        bumpScale={0.25}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={emissive}
      />
    </mesh>
  );
};

const River: React.FC<{ pts: LL[] }> = ({ pts }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lon, lat]) => new THREE.Vector3(...P(lon, lat, 0.034))));
    return new THREE.TubeGeometry(curve, 120, 0.022, 6, false);
  }, [pts]);
  return (
    <mesh geometry={geo} scale={[1, 0.3, 1]}>
      <meshPhysicalMaterial color={C.river} roughness={0.25} clearcoat={0.8} emissive={C.river} emissiveIntensity={0.3} />
    </mesh>
  );
};

const mix = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(k)).getHexString();

export type MapState = {
  /** 0 neutral → 1 enemy crimson, per ally. */
  brazil?: number;
  argentina?: number;
  uruguay?: number;
  /** Paraguay gold glow 0…1. */
  glow?: number;
  /** Lost-territory wedges: 0 Paraguayan gold → 1 lifted and turned enemy colour. */
  wedges?: number;
  /** Show the big country names printed on the sheet. */
  labels?: number;
  /** Dim the whole map (close-up scenes). */
  dim?: number;
};

/** Timber war table, sea, five countries, three rivers and the AUDIRA cartouche. */
export const WarTable: React.FC<MapState & { children?: React.ReactNode }> = ({
  brazil = 1,
  argentina = 1,
  uruguay = 1,
  glow = 0,
  wedges = 0,
  labels = 1,
  dim = 0,
  children,
}) => {
  const timber = useSurfaceGrain(7, 0.25, 4);
  const paper = useSurfaceGrain(42, 0.14, 3);
  const W = 4.6;
  const D = 5.1;
  const w = easeInOut(wedges);
  const nd = (c: string) => mix(c, "#2a2620", dim * 0.55);
  return (
    <group>
      <KeyLight extent={4.5} keyPos={[-4, 6.5, 2.5]} keyColor="#FFE6C2" keyIntensity={2.3} fill={0.42} fillColor="#cfd8e6" rim="#7fa6d8" rimIntensity={0.6} />
      <fog attach="fog" args={[C.oceanVoid, 11, 28]} />

      {/* war table */}
      <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[W + 2.2, 0.3, D + 2.2]} radius={0.06} />
        <meshPhysicalMaterial color="#3a2a1d" {...TABLE} roughnessMap={timber} bumpMap={timber} bumpScale={0.5} />
      </mesh>
      {/* sea sheet */}
      <mesh rotation={flat} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial color={nd(C.sea)} {...MAP_PAPER} roughnessMap={paper} bumpMap={paper} bumpScale={0.3} />
      </mesh>
      {/* graticule every 5° */}
      {[-65, -60, -55, -50].map((lon) => (
        <mesh key={`lo${lon}`} position={[P(lon, 0)[0], 0.003, 0]}>
          <boxGeometry args={[0.006, 0.002, D]} />
          <meshBasicMaterial color="#c9b98f" transparent opacity={0.25} />
        </mesh>
      ))}
      {[-20, -25, -30, -35].map((lat) => (
        <mesh key={`la${lat}`} position={[0, 0.003, P(0, lat)[2]]}>
          <boxGeometry args={[W, 0.002, 0.006]} />
          <meshBasicMaterial color="#c9b98f" transparent opacity={0.25} />
        </mesh>
      ))}
      {/* gilt border */}
      {[
        [0, -D / 2, W, 0.03],
        [0, D / 2, W, 0.03],
        [-W / 2, 0, 0.03, D],
        [W / 2, 0, 0.03, D],
      ].map(([x, z, ww, dd], i) => (
        <mesh key={i} position={[x, 0.014, z]}>
          <boxGeometry args={[ww, 0.024, dd]} />
          <meshPhysicalMaterial color={C.gilt} {...GILT} />
        </mesh>
      ))}

      <Land pts={BOLIVIA} color={nd(C.neutral)} />
      <Land pts={BRAZIL} color={nd(mix(C.neutral, C.brazil, brazil))} />
      <Land pts={ARGENTINA} color={nd(mix(C.neutral, C.argentina, argentina))} />
      <Land pts={URUGUAY} color={nd(mix(C.neutral, C.uruguay, uruguay))} />
      <Land pts={PARAGUAY} color={nd(C.paraguay)} h={0.045} emissive={0.05 + glow * 0.45} />
      {/* claimed land that Paraguay loses: lifts off and turns Argentine / Brazilian */}
      <Land pts={WEDGE_CHACO} color={mix(C.paraguay, C.argentina, w)} h={0.045} lift={Math.sin(Math.PI * w) * 0.18} emissive={0.1 * (1 - w)} />
      <Land pts={WEDGE_MISIONES} color={mix(C.paraguay, C.argentina, w)} h={0.045} lift={Math.sin(Math.PI * w) * 0.18} emissive={0.1 * (1 - w)} />
      <Land pts={WEDGE_NORTH} color={mix(C.paraguay, C.brazil, w)} h={0.045} lift={Math.sin(Math.PI * w) * 0.18} emissive={0.1 * (1 - w)} />
      {RIVERS.map((r, i) => (
        <River key={i} pts={r} />
      ))}

      {/* capital pin */}
      <group position={PLACES.asuncion}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.24, 10]} />
          <meshPhysicalMaterial color={C.gilt} {...GILT} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <sphereGeometry args={[0.045, 20, 14]} />
          <meshPhysicalMaterial color={C.gilt} {...GILT} emissive={C.gilt} emissiveIntensity={0.2 + glow * 0.8} />
        </mesh>
      </group>

      {labels > 0.01 ? (
        <group>
          <SceneText font="display" position={P(-58.6, -21.6, 0.06)} rotation={flat} fontSize={0.3} color="#2b1d0e" anchorX="center" anchorY="middle" letterSpacing={0.12} fillOpacity={labels}>
            PARAGUAY
          </SceneText>
          <SceneText font="display" position={P(-51.8, -21.2, 0.04)} rotation={flat} fontSize={0.34} color="#F1D9A0" anchorX="center" anchorY="middle" letterSpacing={0.2} fillOpacity={labels * brazil}>
            BRASIL
          </SceneText>
          <SceneText font="display" position={P(-62.2, -30.8, 0.04)} rotation={flat} fontSize={0.32} color="#F1D9A0" anchorX="center" anchorY="middle" letterSpacing={0.16} fillOpacity={labels * argentina}>
            ARGENTINA
          </SceneText>
          <SceneText font="display" position={P(-55.6, -32.4, 0.04)} rotation={[-Math.PI / 2, 0, 0.5]} fontSize={0.2} color="#F1D9A0" anchorX="center" anchorY="middle" letterSpacing={0.1} fillOpacity={labels * uruguay}>
            URUGUAY
          </SceneText>
          <SceneText font="display" position={P(-62.4, -18.2, 0.04)} rotation={flat} fontSize={0.2} color="#d8cfb8" anchorX="center" anchorY="middle" letterSpacing={0.14} fillOpacity={labels * 0.8}>
            BOLIVIA
          </SceneText>
          <SceneText font="serifItalic" position={P(-50.0, -32.5, 0.01)} rotation={flat} fontSize={0.17} color="#8fb4dd" anchorX="center" anchorY="middle" fillOpacity={labels}>
            Samudra Atlantik
          </SceneText>
        </group>
      ) : null}
      {/* cartouche: the AUDIRA mark printed on the sheet */}
      <SceneText font="sans" position={[-W / 2 + 0.16, 0.006, D / 2 - 0.2]} rotation={flat} fontSize={0.11} color={C.gilt} anchorX="left" anchorY="middle" letterSpacing={0.2}>
        AUDIRA ATLAS · 1864–1870
      </SceneText>
      {children}
    </group>
  );
};

/** A flat ribbon arrow drawn up to `p` along a lon/lat path, with a cone head. */
export const MapArrow: React.FC<{ path: LL[]; p: number; color?: string; glow?: number; width?: number }> = ({ path, p, color = C.arrow, glow = 0, width = 0.06 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path.map(([lon, lat]) => new THREE.Vector3(...P(lon, lat, 0.09)))), [path]);
  const q = Math.round(clamp01(p) * 100) / 100;
  const tube = useMemo(() => {
    const pts = curve.getSpacedPoints(120).slice(0, Math.max(2, Math.round(120 * Math.max(0.02, q)) + 1));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, width, 8, false);
  }, [curve, q, width]);
  if (p < 0.005) return null;
  const tip = curve.getPointAt(Math.max(0.02, q));
  const dir = curve.getTangentAt(Math.max(0.02, q));
  const yaw = Math.atan2(dir.x, dir.z);
  return (
    <group>
      <mesh geometry={tube} scale={[1, 0.45, 1]} castShadow>
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.4 + glow} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[tip.x, tip.y * 0.45, tip.z]} rotation={[Math.PI / 2, 0, -yaw]} scale={[1, 1, 0.45]} castShadow>
        <coneGeometry args={[width * 2.6, width * 5, 3]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.5 + glow} roughness={0.35} clearcoat={0.6} />
      </mesh>
    </group>
  );
};

/** Dashed route: small gilt dashes appear along the path up to `p`. */
export const DashedRoute: React.FC<{ path: LL[]; p: number; color?: string }> = ({ path, p, color = "#F1D9A0" }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path.map(([lon, lat]) => new THREE.Vector3(...P(lon, lat, 0.07)))), [path]);
  const n = 34;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        if (u > p) return null;
        const pt = curve.getPointAt(u);
        const d = curve.getTangentAt(u);
        return (
          <mesh key={i} position={pt} rotation={[0, Math.atan2(d.x, d.z), 0]}>
            <boxGeometry args={[0.03, 0.02, 0.07]} />
            <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Gilt pin with a flare ring (city or battle marker). */
export const MapPin: React.FC<{ at: [number, number, number]; k: number; flare?: number; color?: string }> = ({ at, k, flare = 0, color = C.gilt }) => {
  if (k < 0.01) return null;
  const ring = 0.1 + flare * 0.6;
  return (
    <group position={at} scale={[1, Math.max(0.001, k), 1]}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.32, 10]} />
        <meshPhysicalMaterial color={color} {...GILT} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.06, 20, 14]} />
        <meshPhysicalMaterial color={color} {...GILT} emissive={color} emissiveIntensity={0.25 + flare * 1.6} />
      </mesh>
      {flare > 0.01 && flare < 0.99 ? (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring * 0.88, ring, 48]} />
          <meshBasicMaterial color="#FFE3A0" transparent opacity={(1 - flare) * 0.9} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
      <pointLight position={[0, 0.5, 0]} color="#ffcf7a" intensity={flare * 2.5} distance={2} decay={1.6} />
    </group>
  );
};
