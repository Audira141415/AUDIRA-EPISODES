// Context + payoff set (x ≈ -11): a voxel map table of West Africa, the Sahara, Egypt and Arabia
// (one cell = 3°, split 2×2 for pixel texture). The Mali region lights up, salt and the Bambuk/Bure
// gold fields appear, the caravan route draws Mali → Cairo → Makkah and a tiny camel train walks it.
// In the payoff the table turns into the Catalan Atlas vellum (rhumb lines), the route reaches
// Majorca, and a tableau rises at Mali: an empty throne, a crown and a hand holding a gold nugget
// (no figure, no face: the Atlas figure is a European artist's depiction, register #36).

import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { MM, Coin, GOLD_MAT, grain } from "./CairoMarket.tsx";
import { PixelSprite, CAMEL_GOLD } from "./pixel.tsx";
import { W, ramp } from "./time.ts";
import { CELL, MAP_X, MAP_Z, mapX, mapZ, PLACES, ROUTE, ROUTE_MAKKAH, ROUTE_EUROPE } from "./layout.ts";

type V3 = [number, number, number];

// Land mask, 3° cells. Columns lon -18..42 (21), rows lat 45..3 (15). L = land, . = sea.
const MASK = [
  "......LLLLLLLLLLL.LLL", // 45
  "...LLLL...L.LLLL....L", // 42
  "...LLL...L.L.L.LLLLLL", // 39
  "....L.LLLL......LLLLL", // 36
  "...LLLLLLLL.......LLL", // 33
  "...LLLLLLLLLLLLLLLLLL", // 30
  "..LLLLLLLLLLLLLLLL.LL", // 27
  ".LLLLLLLLLLLLLLLLL.LL", // 24
  ".LLLLLLLLLLLLLLLLLLLL", // 21
  ".LLLLLLLLLLLLLLLLLL.L", // 18
  ".LLLLLLLLLLLLLLLLLLL.", // 15
  ".LLLLLLLLLLLLLLLLLLLL", // 12
  "..LLLLLLLLLLLLLLLLLLL", // 9
  "...LLLLLLLLLLLLLLLLLL", // 6
  ".........LLLLLLLLLLLL", // 3
];
const LON0 = -18, LAT0 = 45;
export const TOP = 0.05; // board top

const landColor = (lat: number, lon: number, r: () => number) => {
  const j = (r() - 0.5) * 0.06;
  const c = new THREE.Color();
  if (lat >= 36 && !(lon > 25 && lat < 40)) c.set("#6F8B4C"); // Europe / Anatolia
  else if (lat >= 18) c.set(r() > 0.5 ? "#D7AE72" : "#CDA266"); // Sahara, Egypt, Arabia
  else if (lat >= 12) c.set(r() > 0.5 ? "#B99B55" : "#AE904C"); // Sahel
  else c.set(r() > 0.5 ? "#5F8A3F" : "#567E38"); // savanna / forest
  c.offsetHSL(0, 0, j);
  return c;
};

function mapGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const r = prng(1324);
  const sub = CELL / 2;
  const c = new THREE.Color();
  MASK.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      const lon = LON0 + i * 3, lat = LAT0 - j * 3;
      for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++) {
          const land = ch === "L";
          const h = land ? 0.11 + r() * 0.035 : 0.035;
          const g = new THREE.BoxGeometry(sub - 0.012, h, sub - 0.012);
          g.translate(mapX(lon) + (a - 0.5) * sub, TOP + h / 2, mapZ(lat) + (b - 0.5) * sub);
          if (land) c.copy(landColor(lat, lon, r));
          else c.set(r() > 0.5 ? "#2A5A7E" : "#285476");
          c.convertSRGBToLinear();
          const n = g.attributes.position.count;
          const arr = new Float32Array(n * 3);
          for (let k = 0; k < n; k++) arr.set([c.r, c.g, c.b], k * 3);
          g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
          parts.push(g);
        }
    });
  });
  // Majorca: one small island cell (where the Catalan Atlas was made)
  const isl = new THREE.BoxGeometry(sub * 0.8, 0.12, sub * 0.6);
  isl.translate(mapX(PLACES.majorca[0]), TOP + 0.06, mapZ(PLACES.majorca[1]));
  c.set("#6F8B4C").convertSRGBToLinear();
  const n = isl.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) arr.set([c.r, c.g, c.b], k * 3);
  isl.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  parts.push(isl);
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Points every `step` world units along a lon/lat polyline (world x, z). */
export function polyline(pts: [number, number][], step = 0.05): [number, number][] {
  const w = pts.map(([lon, lat]) => [mapX(lon), mapZ(lat)] as [number, number]);
  const out: [number, number][] = [];
  for (let i = 0; i < w.length - 1; i++) {
    const [x0, z0] = w[i], [x1, z1] = w[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / step));
    for (let k = 0; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, z0 + ((z1 - z0) * k) / n]);
  }
  out.push(w[w.length - 1]);
  return out;
}
const SURF = TOP + 0.17; // just above the tallest land voxel

export const ROUTE_PTS = polyline(ROUTE);
export const routeAt = (u: number): V3 => {
  const i = Math.max(0, Math.min(ROUTE_PTS.length - 1, Math.round(u * (ROUTE_PTS.length - 1))));
  return [ROUTE_PTS[i][0], SURF, ROUTE_PTS[i][1]];
};
/** Caravan progress along Mali → Cairo. */
export const caravanU = (t: number) => 0.06 + 0.86 * ramp(t, W("bersama") - 0.6, W("orang") + 0.5);

const Beads: React.FC<{ pts: [number, number][]; k: number; color: string; size?: number; dashed?: boolean }> = ({ pts, k, color, size = 0.028, dashed }) => {
  const shown = Math.floor(pts.length * k);
  if (shown <= 0) return null;
  return (
    <group>
      {pts.slice(0, shown).map(([x, z], i) =>
        dashed && i % 3 === 2 ? null : (
          <mesh key={i} position={[x, SURF, z]}>
            <boxGeometry args={[size, size * 0.6, size]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} metalness={0.5} roughness={0.3} />
          </mesh>
        ),
      )}
    </group>
  );
};

const River: React.FC<{ pts: [number, number][] }> = ({ pts }) => {
  const p = polyline(pts, 0.04);
  return (
    <group>
      {p.map(([x, z], i) => (
        <mesh key={i} position={[x, TOP + 0.152, z]}>
          <boxGeometry args={[0.045, 0.012, 0.045]} />
          <meshPhysicalMaterial color="#3D7DB0" roughness={0.15} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
};

const Pin: React.FC<{ at: [number, number]; k: number; color: string; h?: number }> = ({ at, k, color, h = 0.32 }) => {
  if (k <= 0.001) return null;
  return (
    <group position={[mapX(at[0]), SURF, mapZ(at[1])]} scale={[1, k, 1]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, h, 6]} />
        <meshStandardMaterial color="#2A1A0E" />
      </mesh>
      <mesh position={[0, h, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** Throne + crown + a hand holding a gold nugget, rising at Mali in the payoff. */
const Tableau: React.FC<{ t: number }> = ({ t }) => {
  const up = ramp(t, W("menggambarnya") - 0.4, W("memegang") + 0.2);
  const nug = ramp(t, W("bongkah") - 0.3, W("emas", 8) + 0.2);
  const glow = 1 + 1.5 * ramp(t, W("sejarah") - 0.5, W("audira") + 0.3);
  if (up <= 0.001) return null;
  const [x, z] = [mapX(PLACES.mali[0]), mapZ(PLACES.mali[1])];
  return (
    <group position={[x, SURF + (1 - up) * -0.25, z]} scale={1.5 * up}>
      {/* stepped dais */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.36, 0.04, 0.3]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.stone} color="#7A3A20" />
      </mesh>
      {/* empty throne */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <RoundedBoxGeo args={[0.18, 0.1, 0.15]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#7E2622" />
      </mesh>
      <mesh position={[0, 0.22, -0.065]} castShadow>
        <RoundedBoxGeo args={[0.2, 0.26, 0.03]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#7E2622" />
      </mesh>
      {[-0.1, 0.1].map((sx) => (
        <mesh key={sx} position={[sx, 0.27, -0.065]}>
          <sphereGeometry args={[0.02, 12, 8]} />
          <meshPhysicalMaterial {...GOLD_MAT} />
        </mesh>
      ))}
      {/* crown resting on the seat */}
      <group position={[0, 0.17, 0.01]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 20, 1, true]} />
          <meshPhysicalMaterial {...GOLD_MAT} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.045, 0.03, Math.sin(a) * 0.045]}>
              <coneGeometry args={[0.012, 0.035, 4]} />
              <meshPhysicalMaterial {...GOLD_MAT} />
            </mesh>
          );
        })}
      </group>
      {/* the gold nugget on a cushion beside the throne, and a sceptre (objects only, no figure) */}
      <group position={[0.2, 0.04, 0.06]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <RoundedBoxGeo args={[0.13, 0.05, 0.13]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#2E4C7A" />
        </mesh>
        <mesh position={[0, 0.1 + 0.015 * Math.sin(t * 2), 0]} scale={0.7 + 0.5 * nug} rotation={[t * 0.4, t * 0.6, 0]} castShadow>
          <icosahedronGeometry args={[0.045, 0]} />
          <meshPhysicalMaterial {...GOLD_MAT} emissiveIntensity={0.35 * glow} flatShading />
        </mesh>
        <pointLight position={[0, 0.25, 0.1]} color={MM.lanternHot} intensity={1.6 * glow * nug} distance={1.2} decay={2} />
      </group>
      <mesh position={[-0.13, 0.17, 0.02]} rotation={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.007, 0.007, 0.3, 8]} />
        <meshPhysicalMaterial {...GOLD_MAT} />
      </mesh>
      <mesh position={[-0.167, 0.315, 0.02]}>
        <sphereGeometry args={[0.018, 12, 8]} />
        <meshPhysicalMaterial {...GOLD_MAT} />
      </mesh>
    </group>
  );
};

/** Vellum overlay with rhumb lines: the map becomes the Catalan Atlas sheet. */
const Vellum: React.FC<{ k: number }> = ({ k }) => {
  const lines = useMemo(() => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2), []);
  if (k <= 0.001) return null;
  const cx = mapX(14), cz = mapZ(30);
  return (
    <group>
      <mesh position={[MAP_X, TOP + 0.172, MAP_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[21 * CELL + 0.1, 15 * CELL + 0.1]} />
        <meshStandardMaterial color="#C99A5E" transparent opacity={0.46 * k} roughness={0.9} depthWrite={false} />
      </mesh>
      {lines.map((a, i) => (
        <mesh key={i} position={[cx + Math.cos(a) * 1.6, TOP + 0.176, cz + Math.sin(a) * 1.6]} rotation={[0, -a, 0]}>
          <boxGeometry args={[3.2, 0.002, 0.008]} />
          <meshBasicMaterial color={i % 2 ? "#8A2E1E" : "#2F4E3A"} transparent opacity={0.7 * k} depthWrite={false} />
        </mesh>
      ))}
      {/* compass rose */}
      <group position={[cx, TOP + 0.18, cz]} scale={k}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, (i / 8) * Math.PI * 2]} position={[0, 0.002 * (i % 2), 0]}>
            <circleGeometry args={[i % 2 ? 0.12 : 0.2, 3, -0.18, 0.36]} />
            <meshStandardMaterial color={i % 2 ? "#8A2E1E" : MM.gold} metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const MapTable: React.FC<{ t: number; f: number; cam: V3 }> = ({ t, f, cam }) => {
  const geo = useMemo(() => mapGeometry(), []);
  const maliK = ramp(t, W("mali") - 0.3, W("mali") + 0.4);
  const saltK = ramp(t, W("garam") - 0.2, W("garam") + 0.4);
  const bambukK = ramp(t, W("garam") - 0.2, W("garam") + 0.4);
  const bureK = ramp(t, W("garam") - 0.1, W("garam") + 0.5);
  const routeK = ramp(t, W("berangkat") - 0.2, W("kilometer") + 0.3);
  const makkahPts = useMemo(() => polyline(ROUTE_MAKKAH), []);
  const europePts = useMemo(() => polyline(ROUTE_EUROPE), []);
  const makkahK = ramp(t, W("kilometer") - 0.6, W("kilometer") + 0.8);
  const vellumK = ramp(t, W("eropa") - 0.8, W("katalan") + 0.4);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const europeK = ramp(t, W("namanya", 2) - 0.1, W("eropa") + 0.4);
  const u = caravanU(t);
  const caravanOn = ramp(t, W("berangkat") - 0.3, W("berangkat") + 0.3) * (1 - ramp(t, W("namanya", 2), W("eropa")));
  // Mali region glow: cells around the empire
  const maliCells = useMemo(() => {
    const out: [number, number][] = [];
    for (let lon = -15; lon <= -3; lon += 3) for (let lat = 9; lat <= 18; lat += 3) out.push([lon, lat]);
    return out;
  }, []);
  const pulse = 0.75 + 0.25 * Math.sin(f * 0.12);
  return (
    <group>
      {/* the table */}
      <mesh position={[MAP_X, TOP - 0.25, MAP_Z]} castShadow receiveShadow>
        <RoundedBoxGeo args={[21 * CELL + 0.5, 0.5, 15 * CELL + 0.5]} radius={0.05} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.6} />
      </mesh>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0} />
      </mesh>
      <River pts={[[-10.5, 10.5], [-8, 12.5], [-4, 16.6], [0, 16.3], [3, 13], [6, 8], [6.5, 5]]} />
      <River pts={[[31.5, 21.5], [32.6, 24], [31.6, 27], [31.2, 30], [30.8, 31.4]]} />

      {/* Mali glows */}
      {maliK > 0.001 &&
        maliCells.map(([lon, lat], i) => (
          <mesh key={i} position={[mapX(lon), TOP + 0.163, mapZ(lat)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[CELL * 0.96, CELL * 0.96]} />
            <meshBasicMaterial color={MM.gold} transparent opacity={0.32 * maliK * pulse} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      {/* salt slabs in the north of the empire */}
      {saltK > 0.001 && (
        <group position={[mapX(PLACES.salt[0]), SURF, mapZ(PLACES.salt[1])]} scale={saltK}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[(i - 1) * 0.07, 0.025 + (i === 1 ? 0.035 : 0), 0]} castShadow>
              <boxGeometry args={[0.06, 0.035, 0.11]} />
              <meshPhysicalMaterial {...POLISH.stone} color="#F4F1EA" />
            </mesh>
          ))}
        </group>
      )}
      {/* gold fields: Bambuk and Bure */}
      {[
        [PLACES.bambuk, bambukK],
        [PLACES.bure, bureK],
      ].map(([p, k], i) => {
        const kk = k as number;
        if (kk <= 0.001) return null;
        const at = p as [number, number];
        return (
          <group key={i} position={[mapX(at[0]), SURF, mapZ(at[1])]} scale={kk}>
            {Array.from({ length: 5 }, (_, n) => (
              <mesh key={n} position={[Math.cos(n * 1.3) * 0.05, 0.03 + (n % 2) * 0.02, Math.sin(n * 1.3) * 0.05]} rotation={[n, n * 2, 0]} castShadow>
                <icosahedronGeometry args={[0.03, 0]} />
                <meshPhysicalMaterial {...GOLD_MAT} flatShading />
              </mesh>
            ))}
            <pointLight position={[0, 0.2, 0]} color={MM.lanternHot} intensity={0.9 * kk} distance={0.9} decay={2} />
          </group>
        );
      })}

      <Beads pts={ROUTE_PTS} k={routeK} color={MM.gold} />
      <Beads pts={makkahPts} k={makkahK} color="#F6E7B0" dashed />
      <Beads pts={europePts} k={europeK} color="#E2553F" dashed />
      <Pin at={PLACES.cairo} k={routeK > 0.95 ? 1 : ramp(routeK, 0.8, 0.95)} color={MM.gold} />
      <Pin at={PLACES.makkah} k={makkahK} color="#F6E7B0" />
      <Pin at={PLACES.majorca} k={europeK} color="#E2553F" />

      {/* camel train walking the route (billboarded toward the camera) */}
      {caravanOn > 0.01 &&
        Array.from({ length: 8 }, (_, i) => {
          const p = routeAt(Math.max(0, u - i * 0.022));
          const rot = Math.atan2(cam[0] - p[0], cam[2] - p[2]);
          return <PixelSprite key={i} map={CAMEL_GOLD} px={0.0075 * caravanOn} position={[p[0], p[1] - 0.02, p[2]]} rotationY={rot} flip bob={Math.abs(Math.sin(t * 7 + i)) * 0.006} />;
        })}

      <Vellum k={vellumK} />
      <Tableau t={t} />

      {/* light on the table: a warm overhead pool and two corner lanterns */}
      <primitive object={spotTarget} position={[MAP_X, 0, MAP_Z]} />
      <spotLight position={[MAP_X - 0.5, 5.5, MAP_Z + 3]} target={spotTarget} angle={0.55} penumbra={0.95} intensity={46} color="#FFD9A8" distance={12} decay={2} />
      {[
        [MAP_X - 21 * CELL * 0.5 - 0.1, MAP_Z + 15 * CELL * 0.5 + 0.1],
        [MAP_X + 21 * CELL * 0.5 + 0.1, MAP_Z - 15 * CELL * 0.5 - 0.1],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
            <meshStandardMaterial color="#2A1A0E" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.12, 0.16, 0.12]} />
            <meshBasicMaterial color={MM.lanternHot} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.0, 0]} color={MM.lantern} intensity={2.4} distance={4} decay={2} />
        </group>
      ))}
      {/* a few loose coins on the table edge */}
      {[0, 1, 2, 3].map((i) => (
        <Coin key={i} pos={[MAP_X - 3.0 + i * 0.12, TOP + 0.01 + (i % 2) * 0.012, MAP_Z + 2.6 + (i % 3) * 0.04]} r={0.05} rot={[0, i, 0]} />
      ))}
    </group>
  );
};
