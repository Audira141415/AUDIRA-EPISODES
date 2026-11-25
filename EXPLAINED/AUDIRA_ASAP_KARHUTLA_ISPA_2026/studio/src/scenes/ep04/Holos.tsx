// EP04 film — projector holograms for KONTEKS and PENGEMBANGAN: the Sumatra + Kalimantan map with
// seven province pins, the cumulative-case columns (balita share in amber), the daily-case bar,
// and the memorial (empty child chair + candle in smoke, no child depicted).
import React, { useMemo } from "react";
import * as THREE from "three";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { makeGlow } from "../../kits/anatomix/lib/materials";
import { prng } from "../../kits/anatomix/core/motion";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ISLANDS } from "./islandsGeo";
import { MAP, MAP_H, mapWorld } from "./camera";
import { CUT, T, clamp, easeOut, lerp, seg } from "./clock";

const AMBER = "#FF9A4D";

// ---------------------------------------------------------------- map
/** Hand-simplified Borneo coastline (lon, lat); Sumatra comes from Natural Earth via ep05 geo. */
const BORNEO: [number, number][] = [
  [109.0, 1.9], [109.6, 2.1], [110.3, 1.7], [111.2, 1.9], [111.4, 2.6], [112.0, 3.0], [113.0, 3.2], [113.9, 4.4], [114.6, 4.9],
  [115.4, 5.3], [116.1, 6.0], [116.8, 6.9], [117.3, 6.6], [117.7, 5.9], [118.6, 5.6], [119.2, 5.3], [118.4, 4.9], [118.0, 4.3],
  [117.6, 3.6], [117.4, 2.6], [118.0, 2.2], [118.9, 1.0], [118.0, 0.8], [117.5, 0.0], [117.3, -0.8], [116.9, -1.3], [116.5, -2.3],
  [116.4, -3.3], [116.0, -3.9], [115.0, -4.0], [114.6, -3.6], [114.0, -3.4], [113.0, -3.2], [111.8, -3.5], [111.0, -3.0],
  [110.2, -2.9], [110.0, -1.8], [109.5, -1.0], [109.0, 0.0], [108.9, 0.9],
];
const BORDER: [number, number][] = [
  [109.6, 1.95], [110.5, 0.9], [111.8, 1.0], [112.5, 1.5], [113.6, 1.3], [114.6, 1.6], [115.6, 2.6], [115.6, 4.0], [116.8, 4.2], [117.6, 4.2],
];

export const PROVINCES: { name: string; lon: number; lat: number; at: number }[] = [
  { name: "Riau", lon: 101.8, lat: 0.3, at: T.riau },
  { name: "Jambi", lon: 103.0, lat: -1.6, at: T.jambi },
  { name: "Sumatera Selatan", lon: 104.3, lat: -3.2, at: T.sumsel },
  { name: "Kalimantan Barat", lon: 110.8, lat: -0.2, at: T.empat },
  { name: "Kalimantan Tengah", lon: 113.4, lat: -1.6, at: T.empat + 0.22 },
  { name: "Kalimantan Selatan", lon: 115.3, lat: -2.9, at: T.empat + 0.44 },
  { name: "Kalimantan Timur", lon: 116.6, lat: 0.6, at: T.kalimantan },
];

const mapTexture = () => {
  const W = 2048;
  const H = Math.round((W * MAP_H) / MAP.w);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const px = (lon: number) => ((lon - MAP.lon0) / (MAP.lon1 - MAP.lon0)) * W;
  const py = (lat: number) => ((MAP.lat1 - lat) / (MAP.lat1 - MAP.lat0)) * H;
  g.clearRect(0, 0, W, H);
  // graticule
  g.strokeStyle = "rgba(159,245,236,0.13)";
  g.lineWidth = 2;
  for (let lon = 96; lon <= 119; lon += 2) {
    g.beginPath();
    g.moveTo(px(lon), 0);
    g.lineTo(px(lon), H);
    g.stroke();
  }
  for (let lat = -6; lat <= 7; lat += 2) {
    g.beginPath();
    g.moveTo(0, py(lat));
    g.lineTo(W, py(lat));
    g.stroke();
  }
  g.strokeStyle = "rgba(159,245,236,0.35)";
  g.setLineDash([18, 14]);
  g.beginPath();
  g.moveTo(0, py(0));
  g.lineTo(W, py(0));
  g.stroke();
  g.setLineDash([]);
  const ring = (r: [number, number][], fill: string, stroke: string, lw: number) => {
    g.beginPath();
    r.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la))));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.lineWidth = lw;
    g.strokeStyle = stroke;
    g.shadowColor = "rgba(63,224,208,0.9)";
    g.shadowBlur = 18;
    g.stroke();
    g.shadowBlur = 0;
  };
  ISLANDS.forEach((isl) => ring(isl.r, isl.country === "Malaysia" ? "rgba(63,224,208,0.05)" : "rgba(63,224,208,0.16)", isl.country === "Malaysia" ? "rgba(159,245,236,0.35)" : "rgba(159,245,236,0.95)", isl.country === "Malaysia" ? 2 : 5));
  ring(BORNEO, "rgba(63,224,208,0.16)", "rgba(159,245,236,0.95)", 5);
  // Malaysia/Brunei part of Borneo dimmed above the border
  g.save();
  g.beginPath();
  BORNEO.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la))));
  g.closePath();
  g.clip();
  g.beginPath();
  g.moveTo(px(108), py(1.95));
  BORDER.forEach(([lo, la]) => g.lineTo(px(lo), py(la)));
  g.lineTo(px(120), py(4.2));
  g.lineTo(px(120), py(8));
  g.lineTo(px(108), py(8));
  g.closePath();
  g.fillStyle = "rgba(3,20,26,0.55)";
  g.fill();
  g.restore();
  g.strokeStyle = "rgba(159,245,236,0.55)";
  g.lineWidth = 3;
  g.setLineDash([14, 10]);
  g.beginPath();
  BORDER.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la))));
  g.stroke();
  g.setLineDash([]);
  // island names (in-world)
  g.fillStyle = "rgba(159,245,236,0.8)";
  g.font = "700 54px Consolas, 'JetBrains Mono', monospace";
  g.textAlign = "center";
  const spaced = (s: string, x: number, y: number, rot: number) => {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillText(s.split("").join(" "), 0, 0);
    g.restore();
  };
  spaced("SUMATRA", px(99.2), py(-1.6), 0.72);
  spaced("KALIMANTAN", px(113.6), py(1.0), 0);
  g.font = "600 30px Consolas, 'JetBrains Mono', monospace";
  g.fillStyle = "rgba(159,245,236,0.45)";
  g.fillText("KHATULISTIWA 0°", px(97.6), py(0) - 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

export const MapHolo: React.FC<{ t: number; fade: number }> = ({ t, fade }) => {
  const tex = useMemo(() => mapTexture(), []);
  const glow = useMemo(() => makeGlow(), []);
  if (fade < 0.005) return null;
  const build = easeOut(seg(t, CUT.map - 0.1, CUT.map + 0.8));
  return (
    <group>
      <group position={[0, MAP.y, 0]} rotation={[MAP.tilt, 0, 0]} scale={[1, lerp(0.02, 1, build), 1]}>
        <mesh>
          <planeGeometry args={[MAP.w, MAP_H]} />
          <meshBasicMaterial map={tex} transparent opacity={fade} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[MAP.w + 0.12, MAP_H + 0.12]} />
          <meshBasicMaterial color="#04252B" transparent opacity={0.55 * fade} depthWrite={false} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(MAP.w + 0.12, MAP_H + 0.12)]} />
          <lineBasicMaterial color={P.holo} transparent opacity={0.8 * fade} toneMapped={false} />
        </lineSegments>
      </group>
      {PROVINCES.map((p, i) => {
        const on = seg(t, p.at - 0.1, p.at + 0.35);
        if (on <= 0.001) return null;
        const pop = 1 + 0.6 * Math.max(0, 1 - (t - p.at) / 0.5) * on;
        const base = mapWorld(p.lon, p.lat, 0.01);
        const pulse = ((t - p.at) * 0.8) % 1;
        const beamH = 0.55 * easeOut(on);
        return (
          <group key={i}>
            <sprite position={base} scale={[0.62 * pop, 0.62 * pop, 1]}>
              <spriteMaterial map={glow} color={AMBER} transparent opacity={0.55 * on * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
            <mesh position={base} rotation={[MAP.tilt, 0, 0]} scale={0.6 + pulse * 1.6}>
              <ringGeometry args={[0.07, 0.085, 48]} />
              <meshBasicMaterial color={AMBER} transparent opacity={(1 - pulse) * 0.8 * on * fade} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[base[0], base[1] + beamH / 2, base[2]]}>
              <cylinderGeometry args={[0.006, 0.012, beamH, 8]} />
              <meshBasicMaterial color="#FFD2AE" transparent opacity={0.85 * on * fade} toneMapped={false} />
            </mesh>
            <mesh position={[base[0], base[1] + beamH, base[2]]}>
              <sphereGeometry args={[0.03, 16, 12]} />
              <meshBasicMaterial color="#FFE2C9" transparent opacity={on * fade} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- charts
const BASE_Y = -1.15;
const FULL = 1.0; // height of 425 ribu
const hOf = (v: number) => (v / 425.167) * FULL;
const BALITA_SHARE = 95.627 / 425.167;

const Column: React.FC<{ x: number; h: number; fade: number; balita?: number; ghost?: boolean; hot?: boolean; w?: number }> = ({ x, h, fade, balita = 0, ghost = false, hot = false, w = 0.62 }) => {
  const hh = Math.max(0.002, h);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), []);
  if (h < 0.01) return null;
  const bh = hh * balita;
  return (
    <group position={[x, BASE_Y, 0]}>
      {!ghost && (
        <mesh position={[0, bh + (hh - bh) / 2, 0]} scale={[w, Math.max(0.002, hh - bh), w]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color={hot ? "#FFB27A" : "#3FE0D0"} emissive={hot ? AMBER : P.holo} emissiveIntensity={0.18} roughness={0.25} clearcoat={1} transparent opacity={0.3 * fade} depthWrite={false} />
        </mesh>
      )}
      {!ghost && bh > 0.002 && (
        <mesh position={[0, bh / 2, 0]} scale={[w * 1.01, bh, w * 1.01]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color="#E0661F" emissive="#C2501A" emissiveIntensity={0.55} roughness={0.3} clearcoat={1} transparent opacity={0.9 * fade} depthWrite={false} />
        </mesh>
      )}
      <lineSegments geometry={edges} position={[0, hh / 2, 0]} scale={[w, hh, w]}>
        <lineBasicMaterial color={ghost ? "#9FF5EC" : hot ? "#FFE2C9" : "#CFFFFA"} transparent opacity={(ghost ? 0.45 : 0.95) * fade} toneMapped={false} />
      </lineSegments>
    </group>
  );
};

export const CHART = { xA: -0.62, xB: 0.62, hA: hOf(283.27), hB: FULL, base: BASE_Y };

export const ChartHolo: React.FC<{ t: number; cum: number; daily: number }> = ({ t, cum, daily }) => {
  const glow = useMemo(() => makeGlow(), []);
  if (cum < 0.005 && daily < 0.005) return null;
  const gA = easeOut(seg(t, T.n283 - 0.7, T.n283 + 0.45));
  const gB = easeOut(seg(t, T.tigaMinggu - 0.1, T.n425b + 0.45));
  // after "Tapi ...": new days keep landing on top of the 425 ribu column
  const slabs = Math.floor(clamp((t - (T.tapi + 0.4)) / 0.34, 0, 7));
  const slabFrac = clamp(((t - (T.tapi + 0.4)) / 0.34) % 1);
  const hB = FULL * gB;
  // daily: one bar that falls from the peak (ghost outline stays) to ~3 ribu
  const DPEAK = 1.0;
  const fall = easeOut(seg(t, T.turun - 0.1, T.tigaRibu + 0.3));
  const dH = lerp(DPEAK, DPEAK * 0.24, fall);
  return (
    <group>
      {cum > 0.005 && (
        <group>
          <Column x={CHART.xA} h={CHART.hA * gA} fade={cum} balita={BALITA_SHARE} />
          <Column x={CHART.xB} h={hB} fade={cum} balita={BALITA_SHARE} />
          {Array.from({ length: slabs + 1 }, (_, i) => {
            if (i === slabs && slabFrac < 0.02) return null;
            const land = i < slabs ? 1 : easeOut(slabFrac * 1.6);
            const y = BASE_Y + FULL + i * 0.055 + 0.028 + (1 - land) * 0.6;
            return (
              <mesh key={i} position={[CHART.xB, y, 0]}>
                <RoundedBoxGeo args={[0.62, 0.045, 0.62]} radius={0.012} />
                <meshPhysicalMaterial color="#FFD2AE" emissive={AMBER} emissiveIntensity={1.1} roughness={0.3} clearcoat={1} transparent opacity={cum * land} depthWrite={false} />
              </mesh>
            );
          })}
          {/* floor axis */}
          <mesh position={[0, BASE_Y + 0.005, 0.45]}>
            <boxGeometry args={[2.3, 0.008, 0.008]} />
            <meshBasicMaterial color={P.holoSoft} transparent opacity={0.8 * cum} toneMapped={false} />
          </mesh>
          <sprite position={[CHART.xB, BASE_Y + hB, 0]} scale={[1.2, 1.2, 1]}>
            <spriteMaterial map={glow} color={AMBER} transparent opacity={0.3 * cum * gB} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      )}
      {daily > 0.005 && (
        <group>
          <Column x={0} h={DPEAK} fade={daily} ghost w={0.8} />
          <Column x={0} h={dH} fade={daily} w={0.8} hot={fall < 0.5} />
          <mesh position={[0, BASE_Y + 0.005, 0.5]}>
            <boxGeometry args={[1.6, 0.008, 0.008]} />
            <meshBasicMaterial color={P.holoSoft} transparent opacity={0.8 * daily} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- memorial
export const Memorial: React.FC<{ t: number; fade: number }> = ({ t, fade }) => {
  const glow = useMemo(() => makeGlow(), []);
  const grain = useSurfaceGrain(41, 0.18, 2);
  const smoke = useMemo(() => {
    const r = prng(3141);
    return Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 3.2, y: -1.9 + r() * 1.3, z: -1.6 + r() * 1.8, s: 0.8 + r() * 1.4, o: 0.08 + r() * 0.1, ph: r() * 6.28 }));
  }, []);
  if (fade < 0.005) return null;
  const flick = 1 + 0.08 * Math.sin(t * 13.1) + 0.05 * Math.sin(t * 7.3 + 1.1) + 0.04 * Math.sin(t * 23.7);
  const wood = "#5E4636";
  const leg = (x: number, z: number) => (
    <mesh position={[x, 0.17, z]} castShadow>
      <RoundedBoxGeo args={[0.05, 0.34, 0.05]} radius={0.012} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.6} color={wood} roughnessMap={grain} transparent opacity={fade} />
    </mesh>
  );
  return (
    <group>
      {/* small empty chair */}
      <group position={[0.24, -1.95, -0.25]} rotation={[0, -0.45, 0]} scale={0.85}>
        {leg(-0.19, -0.17)}
        {leg(0.19, -0.17)}
        {leg(-0.19, 0.17)}
        {leg(0.19, 0.17)}
        <mesh position={[0, 0.36, 0]}>
          <RoundedBoxGeo args={[0.46, 0.05, 0.42]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.55} color={wood} roughnessMap={grain} transparent opacity={fade} />
        </mesh>
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.56, -0.19]}>
            <RoundedBoxGeo args={[0.05, 0.42, 0.05]} radius={0.012} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.6} color={wood} transparent opacity={fade} />
          </mesh>
        ))}
        <mesh position={[0, 0.66, -0.19]}>
          <RoundedBoxGeo args={[0.44, 0.16, 0.04]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.55} color={wood} transparent opacity={fade} />
        </mesh>
      </group>
      {/* candle */}
      <group position={[-0.16, -1.95, 0.45]}>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.05, 0.052, 0.22, 32]} />
          <meshPhysicalMaterial color="#F3E7D3" roughness={0.45} sheen={0.5} transmission={0} emissive="#FFB070" emissiveIntensity={0.18} transparent opacity={fade} />
        </mesh>
        <mesh position={[0, 0.235, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.03, 6]} />
          <meshBasicMaterial color="#2a1a12" transparent opacity={fade} />
        </mesh>
        <mesh position={[0, 0.275, 0]} scale={[1, flick, 1]}>
          <sphereGeometry args={[0.022, 16, 12]} />
          <meshBasicMaterial color="#FFE6B0" transparent opacity={fade} toneMapped={false} />
        </mesh>
        <sprite position={[0, 0.29, 0]} scale={[0.16 * flick, 0.26 * flick, 1]}>
          <spriteMaterial map={glow} color="#FFB45A" transparent opacity={0.9 * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <sprite position={[0, 0.25, 0]} scale={[1.6 * flick, 1.6 * flick, 1]}>
          <spriteMaterial map={glow} color="#FF8A3D" transparent opacity={0.22 * fade} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <pointLight position={[0, 0.32, 0.05]} intensity={2.2 * fade * flick} distance={2.6} decay={1.6} color="#FFB060" />
      </group>
      {/* low smoke */}
      {smoke.map((h, i) => (
        <sprite key={i} position={[h.x + Math.sin(t * 0.25 + h.ph) * 0.15, h.y + ((t * 0.04 + h.ph) % 0.4), h.z]} scale={[h.s, h.s * 0.6, 1]}>
          <spriteMaterial map={glow} color="#7A6E66" transparent opacity={h.o * fade} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
};
