// Chapter 5 (c06): back to the Quraysh form — a study room diorama. A parchment map table (sealed
// letter from Damascus to Makkah), a reading desk with an oil lamp and an open book (the scholar's
// counsel, no figure), and two marble plan tablets that alternate: Ibn Zubair's long plan with two
// doors, and the Quraysh square with the Hijr outside. The model morph itself lives in ch05.tsx.
import React, { useMemo } from "react";
import * as THREE from "three";
import type { Key } from "./camera.ts";
import { Box, C, Glow, Plinth, TEX, W, type V3, mix, ramp, useFontReady } from "./core.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { At, L } from "./world.tsx";

const S = "hajjaj" as const;
export const MAP_AT: V3 = [-2.4, 0.92, 0];

export const keys06 = (): Key[] => [
  { t: W("c06", "hanya") - 0.2, pos: L(S, [-3, 8, 12]), tgt: L(S, MAP_AT), fov: 34 },
  { t: W("c06", "hijriah"), pos: L(S, [-2.3, 4.2, 4.6]), tgt: L(S, MAP_AT), fov: 32 },
  { t: W("c06", "terbunuh"), pos: L(S, [-2.0, 3.6, 3.9]), tgt: L(S, [-2.5, 0.92, -0.2]), fov: 32 },
  { t: W("c06", "khalifah"), pos: L(S, [-1.5, 2.9, 3.6]), tgt: L(S, [-2.6, 0.95, -0.3]), fov: 32 },
  // 342-362 on the Zubair model (ch05.tsx keys06zubair)
  { t: W("c06", "muslim"), pos: L(S, [6, 9, 14]), tgt: L(S, [1.5, 1, 0]), fov: 34 },
  { t: W("c06", "abdul", 1), pos: L(S, [3.6, 3.0, 6.6]), tgt: L(S, [1.6, 1.1, -0.6]), fov: 32 },
  { t: W("c06", "berkata"), pos: L(S, [2.9, 2.0, 3.4]), tgt: L(S, [1.9, 0.85, 0]), fov: 34 },
  { t: W("c06", "zubair", 1), pos: L(S, [1.3, 2.4, 4.2]), tgt: L(S, [2.0, 0.85, 0]), fov: 34 },
  { t: W("c06", "abbasiyah"), pos: L(S, [-0.6, 4.2, 7.2]), tgt: L(S, [0, 0.82, 2.2]), fov: 32 },
  { t: W("c06", "mengembalikan"), pos: L(S, [0.2, 3.0, 4.9]), tgt: L(S, [0, 0.82, 2.2]), fov: 34 },
  { t: W("c06", "permainan"), pos: L(S, [3.2, 2.3, 4.2]), tgt: L(S, [1.8, 0.95, -0.4]), fov: 34 },
  { t: W("c06", "hajar"), pos: L(S, [0, 5, 10.5]), tgt: L(S, [0, 1, 0]), fov: 32 },
  { t: W("c06", "ulama"), pos: L(S, [0, 7, 15]), tgt: L(S, [0, 1, 0]), fov: 32 },
];

// ---- map: schematic Arabia, lon 33..53, lat 17..37 ----
const LON0 = 33, LON1 = 53, LAT0 = 17, LAT1 = 37, MW = 3.0, MD = 2.4;
export const mapXY = (lon: number, lat: number): V3 => [((lon - LON0) / (LON1 - LON0) - 0.5) * MW, 0.012, -((lat - LAT0) / (LAT1 - LAT0) - 0.5) * MD];
export const CITY = { makkah: [39.83, 21.42], damaskus: [36.29, 33.51], kufah: [44.4, 32.03], ahsa: [49.9, 25.6] } as const;

const RED_SEA = [[32.5, 30], [34.9, 29.5], [35.2, 28], [36.6, 26], [38.0, 24], [39.1, 22], [40.5, 19.5], [42.2, 17], [38.8, 17], [37.2, 21], [35.5, 23.5], [33.5, 27.5], [32.5, 29.9]];
const GULF = [[47.9, 30.2], [48.5, 29], [49.6, 27], [50.2, 26.2], [51.6, 25.9], [51.4, 24.5], [53, 24], [53, 30.8], [50, 30.8]];
const MED = [[33, 37], [33, 31.2], [34.4, 31.5], [34.9, 32.8], [35.9, 34.5], [35.8, 37]];
const NILE = [[33, 31.2], [32.5, 30], [33, 29.5]];

const useMapTex = () => {
  const ready = useFontReady();
  return useMemo(() => {
    if (typeof document === "undefined") return new THREE.Texture();
    const s = 1024, c = document.createElement("canvas");
    c.width = s; c.height = Math.round((s * MD) / MW);
    const g = c.getContext("2d")!;
    const px = (lon: number, lat: number): [number, number] => [((lon - LON0) / (LON1 - LON0)) * c.width, (1 - (lat - LAT0) / (LAT1 - LAT0)) * c.height];
    const parch = TEX.parchment().image as HTMLCanvasElement;
    g.drawImage(parch, 0, 0, c.width, c.height);
    g.fillStyle = "rgba(95,150,160,0.55)";
    g.strokeStyle = "rgba(70,90,90,0.7)";
    g.lineWidth = 3;
    for (const poly of [RED_SEA, GULF, MED]) {
      g.beginPath();
      poly.forEach(([lo, la], i) => (i ? g.lineTo(...px(lo, la)) : g.moveTo(...px(lo, la))));
      g.closePath(); g.fill(); g.stroke();
    }
    g.beginPath(); NILE.forEach(([lo, la], i) => (i ? g.lineTo(...px(lo, la)) : g.moveTo(...px(lo, la)))); g.stroke();
    // graticule
    g.strokeStyle = "rgba(120,90,50,0.18)"; g.lineWidth = 1.5;
    for (let lo = 35; lo <= 51; lo += 4) { g.beginPath(); g.moveTo(...px(lo, LAT0)); g.lineTo(...px(lo, LAT1)); g.stroke(); }
    for (let la = 19; la <= 35; la += 4) { g.beginPath(); g.moveTo(...px(LON0, la)); g.lineTo(...px(LON1, la)); g.stroke(); }
    g.fillStyle = "#3b2a17"; g.font = `600 30px ${ready ? FONT : "sans-serif"}`; g.textAlign = "left";
    const label: [string, number, number, number][] = [["Makkah", 39.83, 21.42, 1], ["Damaskus", 36.29, 33.51, 1], ["Kufah", 44.4, 32.03, 1], ["Bahrain · Ahsa", 47.2, 24.6, 0], ["Laut Merah", 35.2, 22.2, 0]];
    for (const [n, lo, la, dot] of label) {
      const [x, y] = px(lo, la);
      if (dot) { g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); }
      g.fillText(n, x + 16, y + 10);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [ready]);
};

/** A glowing route that grows along a polyline of [lon, lat] points. */
export const Route: React.FC<{ pts: number[][]; k: number; c?: string }> = ({ pts, k, c = C.warmGlow }) => {
  if (k <= 0.001) return null;
  const P = pts.map(([lo, la]) => mapXY(lo, la));
  const seg: { a: V3; b: V3; l: number }[] = [];
  let tot = 0;
  for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][2] - P[i][2]); seg.push({ a: P[i], b: P[i + 1], l }); tot += l; }
  const dots: V3[] = [];
  for (let d = 0; d < tot * k; d += 0.06) {
    let acc = 0;
    for (const s of seg) {
      if (d <= acc + s.l) { const u = (d - acc) / s.l; dots.push([mix(s.a[0], s.b[0], u), 0.02 + Math.sin(u * Math.PI) * 0.0, mix(s.a[2], s.b[2], u)]); break; }
      acc += s.l;
    }
  }
  return (
    <group>
      {dots.map((p, i) => (
        <Glow key={i} s={[0.035, 0.01, 0.035]} p={p} c={c} />
      ))}
    </group>
  );
};

export const MapTable: React.FC<{ p: V3; children?: React.ReactNode }> = ({ p, children }) => {
  const tex = useMapTex();
  return (
    <group position={[p[0], 0, p[2]]}>
      <Box s={[MW + 0.4, 0.08, MD + 0.4]} p={[0, p[1] - 0.04, 0]} c="#6e4a2b" rough={0.55} radius={0.03} />
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
        <Box key={i} s={[0.1, p[1] - 0.08, 0.1]} p={[sx * (MW / 2), (p[1] - 0.08) / 2, sz * (MD / 2)]} c="#5a3b22" rough={0.6} radius={0.02} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, p[1] + 0.003, 0]} receiveShadow>
        <planeGeometry args={[MW, MD]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <group position={[0, p[1], 0]}>{children}</group>
    </group>
  );
};

const Letter: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0 || k >= 1.0001) return null;
  const a = mapXY(...(CITY.damaskus as unknown as [number, number])), b = mapXY(...(CITY.makkah as unknown as [number, number]));
  return (
    <group position={[mix(a[0], b[0], k), 0.12 + Math.sin(k * Math.PI) * 0.35, mix(a[2], b[2], k)]} rotation={[0, 0.6, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.34, 16]} />
        <meshStandardMaterial color="#efe2c2" roughness={0.8} />
      </mesh>
      <mesh position={[0.036, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.012, 16]} />
        <meshStandardMaterial color="#8e2a22" roughness={0.5} />
      </mesh>
    </group>
  );
};

const Lamp: React.FC<{ t: number; p: V3 }> = ({ t, p }) => {
  const flick = 0.85 + 0.15 * Math.sin(t * 17.3) * Math.sin(t * 5.1);
  return (
    <group position={p}>
      <mesh castShadow scale={[1, 0.5, 0.7]}>
        <sphereGeometry args={[0.09, 20, 12]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.28} />
      </mesh>
      <Box s={[0.12, 0.02, 0.03]} p={[0.1, 0.02, 0]} c={C.brass} metal={1} rough={0.3} radius={0.008} />
      <mesh position={[0.16, 0.07, 0]} scale={[0.5, 1, 0.5]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshBasicMaterial color="#ffd38a" toneMapped={false} />
      </mesh>
      <pointLight position={[0.16, 0.12, 0]} color="#ffb35c" intensity={4.5 * flick} distance={5} decay={2} />
    </group>
  );
};

const Book: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    {/* rihal: folding X stand */}
    <Box s={[0.5, 0.03, 0.42]} p={[0, 0.2, -0.08]} r={[0.6, 0, 0]} c="#6b4527" rough={0.6} radius={0.01} />
    <Box s={[0.5, 0.03, 0.42]} p={[0, 0.2, 0.08]} r={[-0.6, 0, 0]} c="#7a5030" rough={0.6} radius={0.01} />
    {/* open book on top */}
    <Box s={[0.24, 0.015, 0.3]} p={[-0.12, 0.36, 0]} r={[0, 0, 0.18]} c="#f1e7d2" rough={0.9} radius={0.004} />
    <Box s={[0.24, 0.015, 0.3]} p={[0.12, 0.36, 0]} r={[0, 0, -0.18]} c="#f1e7d2" rough={0.9} radius={0.004} />
    <Box s={[0.52, 0.01, 0.32]} p={[0, 0.34, 0]} c="#5a2f22" rough={0.7} radius={0.004} />
  </group>
);

/** Marble plan tablets: Ibn Zubair (long, two doors) and Quraysh (square, Hijr outside). */
const Plans: React.FC<{ a: number; b: number }> = ({ a, b }) => (
  <group position={[0, 0, 2.2]}>
    <Box s={[2.3, 0.7, 1.0]} p={[0, 0.35, 0]} c="#7a5434" rough={0.6} radius={0.03} />
    {[
      { x: -0.55, k: a, long: true },
      { x: 0.55, k: b, long: false },
    ].map((p, i) => (
      <group key={i} position={[p.x, 0.72, 0]}>
        <Box s={[0.95, 0.04, 0.75]} c={C.marble} rough={0.3} radius={0.01} p={[0, 0, 0]} />
        <Glow s={[p.long ? 0.62 : 0.5, 0.01, 0.02]} p={[p.long ? 0.06 : 0, 0.025, 0.17]} op={0.35 + 0.65 * p.k} />
        <Glow s={[p.long ? 0.62 : 0.5, 0.01, 0.02]} p={[p.long ? 0.06 : 0, 0.025, -0.17]} op={0.35 + 0.65 * p.k} />
        <Glow s={[0.02, 0.01, 0.34]} p={[p.long ? -0.25 : -0.25, 0.025, 0]} op={0.35 + 0.65 * p.k} />
        <Glow s={[0.02, 0.01, 0.34]} p={[p.long ? 0.37 : 0.25, 0.025, 0]} op={0.35 + 0.65 * p.k} />
        {p.long ? (
          <>
            <Glow s={[0.08, 0.012, 0.03]} p={[-0.1, 0.03, 0.17]} c={C.accent} op={p.k} />
            <Glow s={[0.08, 0.012, 0.03]} p={[-0.1, 0.03, -0.17]} c={C.accent} op={p.k} />
          </>
        ) : (
          <mesh position={[0.25, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.14, 24, 1, -Math.PI / 2, Math.PI]} />
            <meshBasicMaterial color={C.warmGlow} toneMapped={false} transparent opacity={0.35 + 0.65 * p.k} />
          </mesh>
        )}
      </group>
    ))}
  </group>
);

/** Back wall of the study: three pointed niches with shelves of bound books. */
const StudyWall: React.FC = () => (
  <group position={[0.6, 0, -2.2]}>
    <Box s={[7.4, 3.4, 0.35]} p={[0, 1.7, 0]} c="#e2d4bd" rough={0.85} radius={0.04} />
    {[-2.2, 0, 2.2].map((x, i) => (
      <group key={i} position={[x, 0, 0.18]}>
        <Box s={[1.5, 2.2, 0.06]} p={[0, 1.4, 0]} c="#c9b593" rough={0.85} radius={0.02} />
        <mesh position={[0, 2.5, 0.01]}>
          <circleGeometry args={[0.75, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#c9b593" roughness={0.85} />
        </mesh>
        {[0.8, 1.45, 2.1].map((y) => (
          <group key={y}>
            <Box s={[1.4, 0.05, 0.3]} p={[0, y, 0.12]} c="#6e4a2b" rough={0.6} radius={0.01} />
            {Array.from({ length: 9 }, (_, k) => (
              <Box key={k} s={[0.1 + ((k * 7) % 3) * 0.02, 0.36 + ((k * 5) % 4) * 0.04, 0.24]} p={[-0.6 + k * 0.145, y + 0.22, 0.12]} c={["#6e2f24", "#2f4a5e", "#5b4a2a", "#7d6233", "#3d2a22"][(k + i) % 5]} rough={0.7} radius={0.008} />
            ))}
          </group>
        ))}
      </group>
    ))}
  </group>
);

export const Hajjaj: React.FC<{ t: number }> = ({ t }) => {
  const letter = ramp(t, W("c06", "mengirim"), W("c06", "perintah") + 0.4);
  const route = ramp(t, W("c06", "mengirim") - 0.3, W("c06", "perintah") + 0.4);
  const zub = ramp(t, W("c06", "mengembalikan"), W("c06", "zubair", 2) + 0.3) * (1 - ramp(t, W("c06", "imam"), W("c06", "jangan")));
  const qur = ramp(t, W("c06", "imam"), W("c06", "jangan"));
  return (
    <At s={S}>
      <Plinth r={7.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[7.1, 96]} />
        <meshStandardMaterial color="#e8dccb" roughness={0.7} />
      </mesh>
      {/* carpet under the reading desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.012, 0.2]} receiveShadow>
        <planeGeometry args={[2.2, 1.6]} />
        <meshStandardMaterial color="#7d2f2a" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.014, 0.2]}>
        <ringGeometry args={[0.55, 0.62, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#c9a046" roughness={0.8} />
      </mesh>
      <Box s={[1.1, 0.6, 0.6]} p={[2.2, 0.3, 0]} c="#6b4527" rough={0.55} radius={0.03} />
      <Book p={[2.2, 0.6, 0]} />
      <Lamp t={t} p={[1.55, 0.66, 0.15]} />
      <MapTable p={MAP_AT}>
        <Route pts={[[...CITY.damaskus], [38.5, 28], [...CITY.makkah]]} k={route} c={C.accent} />
        <Letter k={letter} />
        {/* siege pin on Makkah */}
        <Glow s={[0.08, 0.2, 0.08]} p={[...mapXY(...(CITY.makkah as unknown as [number, number])).slice(0, 1), 0.1, mapXY(...(CITY.makkah as unknown as [number, number]))[2]] as V3} c="#e0603a" op={ramp(t, W("c06", "dikepung"), W("c06", "dikepung") + 0.5) * (1 - ramp(t, W("c06", "perintah"), W("c06", "perintah") + 1))} />
      </MapTable>
      <Plans a={zub} b={qur} />
      <StudyWall />
    </At>
  );
};
