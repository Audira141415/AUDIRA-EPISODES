// Two side sets on the same table as the valley maquette:
// - ZUBAIDAH (east of the valley, toward Arafah): relief strip of the channel route plus a cut section.
// - SEA (west, toward Jeddah and the Red Sea): an engraved sea chart from Batavia to Jeddah.
import React, { useMemo } from "react";
import * as THREE from "three";
import { engrave, fbm, INK, rng } from "./engraving.ts";
import { EBox, ECyl } from "./MakkahWorld.tsx";
import { FlowLine, Label3D } from "./parts.tsx";
import { clamp01, smooth } from "./tl.ts";

type V3 = [number, number, number];

// ================================================================= ZUBAIDAH
export const ZX = -62;
/** Relief height along the route strip (local coords; x: +14 Makkah (west) ... -14 Wadi Nu'man (east)). */
export const zHeight = (x: number, z: number) => {
  const rise = THREE.MathUtils.smoothstep(-x, -14, 15) * 1.9;
  const hills = Math.max(0, fbm(x * 0.25 + 3, z * 0.3, 31, 4) - 0.45) * 2.6 * THREE.MathUtils.smoothstep(Math.abs(z), 0.6, 3.5);
  return 0.12 + rise + hills + (fbm(x, z, 5, 2) - 0.5) * 0.05;
};
export const ZPLACES: Record<string, V3> = {
  makkah: [13.5, 0, 0],
  mina: [8.5, 0, -0.4],
  muzdalifah: [3.5, 0, 0.2],
  arafah: [-2.5, 0, 0],
  numan: [-12.5, 0, -0.6],
  hunain: [-6.0, 0, -4.2],
};
const zp = (k: string, lift = 0.02): V3 => {
  const [x, , z] = ZPLACES[k];
  return [ZX + x, zHeight(x, z) + lift, z];
};
export const ZROUTE: V3[] = [zp("numan", 0.05), [ZX - 8, zHeight(-8, -0.3) + 0.05, -0.3], zp("arafah", 0.05), zp("muzdalifah", 0.05), zp("mina", 0.05), zp("makkah", 0.05)];
export const ZBRANCH: V3[] = [zp("hunain", 0.05), [ZX - 4.5, zHeight(-4.5, -2) + 0.05, -2], zp("arafah", 0.05)];

// cut section in front of the strip (z = +3.2 .. +4.4), channel inside
export const SECTION = { z: 3.8, depth: 1.2, top: 0.0 };
const secTop = (x: number) => zHeight(x, 2.6) * 0.85 + 0.1;
/** Channel depth: 0.45 under the surface at the east end, gentle fall to the west (shown exaggerated). */
export const chanY = (x: number) => {
  const k = (x + 14) / 28;
  return secTop(-14) - 0.5 + (secTop(14) - 0.35 - (secTop(-14) - 0.5)) * k;
};

const sectionTexture = () => {
  const c = document.createElement("canvas");
  c.width = 4096;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e6d3a8";
  g.fillRect(0, 0, 4096, 512);
  const r = rng(3000);
  g.strokeStyle = INK.sepia;
  for (let y = 10; y < 512; y += 7) {
    g.globalAlpha = 0.25 + (y / 512) * 0.55;
    g.lineWidth = 1 + (y / 512) * 2;
    g.beginPath();
    for (let x = 0; x <= 4096; x += 16) g.lineTo(x, y + Math.sin(x * 0.01 + y) * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 260; i++) {
    const x = r() * 4096, y = 40 + r() * 460, rr = 6 + r() * 18;
    g.fillStyle = "#d9c49a";
    g.beginPath();
    g.ellipse(x, y, rr * 1.4, rr, r() * 3, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 2;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export type ZState = { route: number; branch: number; section: number; water: number; shafts: number; coins: number; dim: number; desal: number; t: number };

export const ZubaidahSet: React.FC<ZState> = ({ route, branch, section, water, shafts, coins, dim, t }) => {
  const geo = useMemo(() => {
    const gg = new THREE.PlaneGeometry(32, 9, 220, 70);
    gg.rotateX(-Math.PI / 2);
    gg.translate(0, 0, -1.2);
    const p = gg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, zHeight(p.getX(i), p.getZ(i)));
    gg.computeVertexNormals();
    return gg;
  }, []);
  const secTex = useMemo(() => sectionTexture(), []);
  const secGeo = useMemo(() => {
    // extruded profile: top follows the relief, bottom flat at -0.9
    const s = new THREE.Shape();
    s.moveTo(-15, -0.9);
    for (let x = -15; x <= 15.001; x += 0.25) s.lineTo(x, secTop(Math.max(-14, Math.min(14, x))));
    s.lineTo(15, -0.9);
    s.lineTo(-15, -0.9);
    const gg = new THREE.ExtrudeGeometry(s, { depth: SECTION.depth, bevelEnabled: false, steps: 1 });
    // planar UV on the front face
    const uv = gg.attributes.uv as THREE.BufferAttribute;
    const pos = gg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 15) / 30, (pos.getY(i) + 0.9) / 3.4);
    return gg;
  }, []);
  const chanPts = useMemo(() => {
    const pts: V3[] = [];
    for (let x = -14; x <= 14.001; x += 1) pts.push([ZX + x, chanY(x), SECTION.z + SECTION.depth + 0.02]);
    return pts;
  }, []);
  const shaftXs = useMemo(() => Array.from({ length: 15 }, (_, i) => -13 + i * 1.85), []);
  const coinSeeds = useMemo(() => {
    const r = rng(194);
    return Array.from({ length: 40 }, (_, i) => ({ x: shaftXs[i % shaftXs.length], ph: r(), sp: 0.6 + r() * 0.5 }));
  }, [shaftXs]);
  const lift = 1 - dim * 0.6;
  return (
    <group>
      <mesh geometry={geo} position={[ZX, 0, 0]} material={engrave({ color: INK.paperDeep, freq: 6, contour: 0.55, keep: 0.4, ink: 0.6, toneGain: 1.75, refDist: 12 })} receiveShadow castShadow />
      {/* plinth under the strip */}
      <EBox args={[32.4, 0.4, 9.4]} position={[ZX, -0.1, -1.2]} mat={{ color: "#cdb487", freq: 14 }} />
      {/* the route of the covered channel on the surface */}
      <FlowLine pts={ZROUTE} r={0.1} t={t} reveal={route} o={lift} color="#d9a443" />
      <FlowLine pts={ZBRANCH} r={0.08} t={t} reveal={branch} o={lift} color="#d9a443" />
      {/* places: small engraved markers */}
      {Object.keys(ZPLACES).map((k) => (
        <mesh key={k} position={zp(k, 0.04)} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.1, 20]} />
          <meshStandardMaterial color={INK.gold} metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* landmarks: tents at Mina, a small hill at Arafah, a dome marker at the Makkah end */}
      {Array.from({ length: 24 }).map((_, i) => {
        const [mx, , mz] = ZPLACES.mina;
        const x = mx - 1 + (i % 6) * 0.38, z = mz + 0.6 + Math.floor(i / 6) * 0.38;
        return (
          <mesh key={i} position={[ZX + x, zHeight(x, z) + 0.08, z]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.16, 0.18, 4]} />
            <meshStandardMaterial color="#f4ecd8" roughness={0.8} />
          </mesh>
        );
      })}
      <mesh position={[ZX + ZPLACES.arafah[0] - 0.6, zHeight(ZPLACES.arafah[0] - 0.6, -1.4) + 0.25, -1.4]} castShadow material={engrave({ color: INK.paperDeep, freq: 30, keep: 0.35 })}>
        <coneGeometry args={[0.9, 0.6, 24]} />
      </mesh>
      <mesh position={[ZX + ZPLACES.makkah[0], zHeight(ZPLACES.makkah[0], 0) + 0.1, 0.9]} castShadow>
        <sphereGeometry args={[0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={INK.gold} metalness={0.8} roughness={0.35} />
      </mesh>
      {/* cut section */}
      {section > 0.01 ? (
        <group position={[ZX, -1 + section, SECTION.z]}>
          <mesh geometry={secGeo} castShadow receiveShadow>
            <meshStandardMaterial map={secTex} roughness={0.9} />
          </mesh>
        </group>
      ) : null}
      {section > 0.6 ? (
        <>
          {/* channel lining (stone vault) and water inside */}
          <mesh position={[ZX, 0, SECTION.z + SECTION.depth + 0.004]} renderOrder={3}>
            <planeGeometry args={[0.001, 0.001]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {chanPts.slice(0, -1).map((p, i) => {
            const q = chanPts[i + 1];
            const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
            const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
            return (
              <group key={i} position={[mx, my, p[2] - 0.01]} rotation={[0, 0, ang]}>
                <mesh>
                  <boxGeometry args={[1.02, 0.2, 0.03]} />
                  <meshStandardMaterial color="#6a5236" roughness={0.8} />
                </mesh>
                <mesh position={[0, -0.03, 0.017]}>
                  <boxGeometry args={[1.02, 0.1, 0.01]} />
                  <meshStandardMaterial color="#5f8e86" roughness={0.2} metalness={0.3} emissive="#2d5a54" emissiveIntensity={0.4 * water * lift} />
                </mesh>
              </group>
            );
          })}
          <FlowLine pts={chanPts.map((p) => [p[0], p[1] - 0.03, p[2] + 0.03] as V3)} r={0.035} t={t} reveal={water} o={lift} color="#9fd6cc" />
          {/* inspection shafts from the surface down to the channel */}
          {shaftXs.map((x, i) => {
            const k = clamp01(shafts * 15 - i);
            if (k <= 0.01) return null;
            const top = secTop(x), bot = chanY(x) + 0.08;
            const h = (top - bot) * k;
            return (
              <group key={i}>
                <mesh position={[ZX + x, top - h / 2, SECTION.z + SECTION.depth + 0.01]}>
                  <boxGeometry args={[0.07, h, 0.02]} />
                  <meshStandardMaterial color={INK.sepia} roughness={0.8} />
                </mesh>
                <mesh position={[ZX + x, top + 0.03, SECTION.z + SECTION.depth * 0.5]} castShadow>
                  <cylinderGeometry args={[0.07, 0.08, 0.08, 12]} />
                  <meshStandardMaterial color={INK.gold} metalness={0.8} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
          {/* gold coins: one for every swing of the axe */}
          {coins > 0.01
            ? coinSeeds.map((c, i) => {
                const fall = ((t * c.sp + c.ph) % 1);
                const top = secTop(c.x) + 1.6;
                const y = top - fall * 1.5;
                return (
                  <mesh key={i} position={[ZX + c.x + (c.ph - 0.5) * 0.5, y, SECTION.z + SECTION.depth * 0.5 + (c.sp - 0.85) * 0.6]} rotation={[fall * 9 + c.ph * 5, fall * 4, 0]} scale={coins}>
                    <cylinderGeometry args={[0.07, 0.07, 0.012, 18]} />
                    <meshStandardMaterial color="#e2b955" metalness={0.95} roughness={0.22} />
                  </mesh>
                );
              })
            : null}
        </>
      ) : null}
    </group>
  );
};

export const ZubaidahLabels: React.FC<{ o: Record<string, number> }> = ({ o }) => (
  <>
    <Label3D at={zp("makkah")} title="MAKKAH" o={o.makkah ?? 0} lift={0.7} h={0.42} />
    <Label3D at={zp("mina")} title="MINA" o={o.mina ?? 0} lift={0.7} h={0.42} />
    <Label3D at={zp("muzdalifah")} title="MUZDALIFAH" o={o.muzdalifah ?? 0} lift={0.95} h={0.42} />
    <Label3D at={zp("arafah")} title="ARAFAH" o={o.arafah ?? 0} lift={0.7} h={0.42} />
    <Label3D at={zp("numan")} title="WADI NU'MAN" o={o.numan ?? 0} lift={0.9} h={0.42} />
    <Label3D at={zp("hunain")} title="WADI HUNAIN" o={o.hunain ?? 0} lift={0.9} h={0.42} />
  </>
);

// ================================================================= SEA CHART
export const SX = 84;
export const MAP = { w: 46, d: 28, lon0: 30, lon1: 145, lat0: -12, lat1: 33 };
/** lon/lat -> world on the chart (north away from the camera, -z). */
export const geo = (lon: number, lat: number, y = 0.02): V3 => [
  SX + ((lon - MAP.lon0) / (MAP.lon1 - MAP.lon0) - 0.5) * MAP.w,
  y,
  -((lat - MAP.lat0) / (MAP.lat1 - MAP.lat0) - 0.5) * MAP.d,
];

type LL = [number, number];
const LAND: LL[][] = [
  // Arabia
  [[32.5, 31.5], [34.5, 28], [36.5, 26], [38.5, 23], [40, 20], [42.5, 15], [43.4, 12.6], [45, 12.8], [48.5, 14], [52, 15.8], [55, 17], [57.8, 19], [59.8, 22.4], [58.5, 23.6], [56.3, 24.8], [56.3, 26.3], [54, 24.2], [51.6, 24.2], [51.2, 26], [50, 26.4], [48.5, 28.4], [48, 30], [48, 34], [32.5, 34]],
  // Africa
  [[32.3, 31.5], [33.5, 27.5], [35.5, 23.9], [37.3, 18.6], [38.6, 17.5], [39.8, 15.5], [41.7, 13.4], [43.2, 11.6], [44.5, 10.4], [51.2, 11.8], [51, 10.4], [49, 6], [46, 2], [42, -1.5], [40, -3.5], [39.3, -6], [39.7, -10], [40.5, -13], [29, -13], [29, 34], [32.3, 34]],
  // Asia: Persia coast, India, Indochina, China
  [[48.5, 30], [50.3, 29], [51.5, 27.8], [54, 26.6], [56.5, 27.1], [57.4, 25.7], [61.6, 25.2], [66.5, 25.4], [68.5, 23.5], [70, 22.5], [72.8, 21], [72.9, 19], [73.5, 16], [74.8, 13], [76, 9.8], [77.5, 8.1], [78.2, 9], [79.3, 10.3], [80.3, 13.5], [80.2, 15.8], [82.3, 17], [85.5, 19.6], [87, 21.5], [88.5, 22], [90, 22], [91.7, 22.5], [92.3, 20.7], [94.2, 16], [97.6, 16.5], [98.5, 13], [98.6, 10], [100.3, 6.5], [101.3, 2.8], [103.5, 1.3], [104.3, 1.5], [103.4, 4.5], [102.2, 6.2], [100.4, 7.6], [100, 13.4], [102.5, 12], [104.8, 10.5], [104.8, 8.6], [106.8, 10.4], [109.2, 11.8], [109.4, 13.5], [108.3, 16], [106.5, 18], [106.7, 20.5], [108, 21.6], [110, 21], [112, 21.8], [114.2, 22.3], [117, 23.5], [120, 26], [121.5, 31.5], [121.5, 34], [48, 34]],
  [[79.8, 8.1], [80, 6.2], [81.2, 6.2], [81.9, 7.5], [81.1, 8.9], [80.2, 9.8]],
  [[95.3, 5.6], [97.5, 5.2], [100, 2.5], [103.8, -1], [106, -3], [105.9, -5.8], [104.5, -5.9], [102.3, -4], [100.3, -1], [98.7, 1.7], [96, 4.2]],
  [[105.2, -6.8], [106.5, -6], [108.3, -6.3], [110.5, -6.8], [112.6, -6.9], [114.5, -7.7], [114.3, -8.6], [110, -8.1], [106.5, -7.4]],
  [[109, 1.6], [109.6, -1], [111, -3], [114.5, -4], [116.3, -3.5], [116.8, -1], [117.9, 1], [118.6, 5], [117, 7], [115.4, 5], [113, 3.2], [111, 1.6]],
  [[119.4, -5.5], [119.5, -3], [118.8, -2.5], [120.1, 0.7], [121.2, 1.1], [124.9, 1.5], [123, 0.4], [121.9, -0.9], [123.3, -1], [121.7, -1.9], [122, -4.6], [121, -2.8], [120.4, -5.6]],
  [[131, -1], [134, -0.9], [138, -1.6], [141, -2.6], [146, -4], [146, -8.5], [141, -9.1], [138, -8.4], [137.8, -5.2], [135, -4.4], [132.6, -4], [132, -2.8]],
  [[120, 18.5], [122.2, 18.5], [122, 16], [121.6, 14], [124, 12.6], [125.5, 9.8], [126.3, 7], [125.4, 5.6], [123.8, 7.6], [122, 7], [123.4, 9.5], [122.7, 10.5], [121.8, 12.2], [120.6, 14.2], [120.3, 16.3]],
  [[114.6, -8.2], [116, -8.1], [117.5, -8.4], [119.2, -8.3], [120.8, -8.3], [122.8, -8.2], [123.2, -8.7], [119, -8.9], [116, -8.9]],
  [[123.6, -10.3], [125.2, -9], [127.2, -8.4], [126.4, -8.9], [124.6, -10.1]],
];
// Jawi lands per Snouck Hurgronje: from Siam and Malaka to Papua
export const JAWI: LL[] = [[97, 16], [104, 14], [110, 8], [120, 6], [128, 4], [134, 0], [143, -2], [143, -10], [118, -10.5], [104, -9], [95, -3], [93.5, 6], [96, 12]];
export const ROUTE: LL[] = [[106.9, -6.1], [106.2, -3.8], [104.8, -2.3], [104.4, 0.4], [102.6, 1.9], [100.6, 3.2], [98.4, 4.8], [95.4, 5.9], [88, 5.6], [81, 5.3], [74, 8.5], [64, 12], [52, 13.2], [45, 12.6], [43.4, 12.7], [41.6, 15.2], [40, 18.5], [39.2, 21.5]];

const chartTexture = () => {
  const W = 4096, H = Math.round(4096 * (MAP.d / MAP.w));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const px = (lon: number, lat: number): [number, number] => [((lon - MAP.lon0) / (MAP.lon1 - MAP.lon0)) * W, (1 - (lat - MAP.lat0) / (MAP.lat1 - MAP.lat0)) * H];
  g.fillStyle = "#e9dbb8";
  g.fillRect(0, 0, W, H);
  // sea: horizontal burin lines
  g.strokeStyle = INK.sepia;
  g.globalAlpha = 0.35;
  g.lineWidth = 1.6;
  for (let y = 4; y < H; y += 8) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  const poly = (pts: LL[]) => {
    g.beginPath();
    pts.forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.closePath();
  };
  // coast echo lines (classic chart)
  for (let k = 3; k >= 1; k--) {
    for (const p of LAND) {
      poly(p);
      g.lineWidth = 8 * k + 6;
      g.strokeStyle = `rgba(59,40,24,${0.08 + 0.05 * (3 - k)})`;
      g.stroke();
    }
  }
  for (const p of LAND) {
    poly(p);
    g.fillStyle = "#f2e6c8";
    g.fill();
    g.lineWidth = 5;
    g.strokeStyle = INK.sepia;
    g.stroke();
  }
  // land stipple, clipped to the land shapes
  const r = rng(77);
  g.save();
  g.beginPath();
  for (const p of LAND) {
    p.forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.closePath();
  }
  g.clip();
  g.fillStyle = "#f2e6c8";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(59,40,24,0.22)";
  for (let i = 0; i < 30000; i++) g.fillRect(r() * W, r() * H, 2.2, 2.2);
  g.restore();
  for (const p of LAND) {
    poly(p);
    g.lineWidth = 5;
    g.strokeStyle = INK.sepia;
    g.stroke();
  }
  // graticule
  g.strokeStyle = "rgba(140,106,44,0.55)";
  g.lineWidth = 2;
  g.setLineDash([18, 14]);
  for (let lon = 40; lon <= 140; lon += 20) {
    const [x] = px(lon, 0);
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let lat = -10; lat <= 30; lat += 10) {
    const [, y] = px(0, lat);
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  g.setLineDash([]);
  // names
  const name = (t: string, lon: number, lat: number, size: number, italic = false, color: string = INK.sepia) => {
    const [x, y] = px(lon, lat);
    g.font = `${italic ? "italic 400" : "700"} ${size}px Georgia, serif`;
    g.fillStyle = color;
    g.textAlign = "center";
    g.fillText(t, x, y);
  };
  name("SAMUDRA HINDIA", 76, -4, 120, true);
  name("LAUT ARAB", 63, 15.5, 70, true);
  name("LAUT MERAH", 37.2, 19.6, 46, true);
  name("ARABIA", 45, 24, 90);
  name("HINDUSTAN", 78, 20, 80);
  // frame
  g.strokeStyle = INK.sepia;
  g.lineWidth = 14;
  g.strokeRect(10, 10, W - 20, H - 20);
  g.lineWidth = 4;
  g.strokeRect(40, 40, W - 80, H - 80);
  // compass rose
  const [cx, cy] = px(135, 22);
  g.save();
  g.translate(cx, cy);
  for (let i = 0; i < 16; i++) {
    g.rotate(Math.PI / 8);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(i % 2 ? 60 : 30, 0);
    g.lineTo(0, i % 4 === 0 ? 190 : 110);
    g.closePath();
    g.fillStyle = i % 2 ? INK.sepia : INK.gold;
    g.fill();
  }
  g.restore();
  name("U", 135, 27.4, 60);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
};

/** Point and heading along the voyage route at progress s (0..1 by length). */
export function routeAt(s: number): { p: V3; heading: number } {
  const pts = ROUTE.map(([lo, la]) => geo(lo, la, 0.05));
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[2] - pts[i][2]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(s) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = Math.min(1, d / seg[i]);
      const a = pts[i], b = pts[i + 1];
      return { p: [a[0] + (b[0] - a[0]) * k, 0.05, a[2] + (b[2] - a[2]) * k], heading: Math.atan2(b[0] - a[0], b[2] - a[2]) };
    }
    d -= seg[i];
  }
  return { p: pts[pts.length - 1], heading: 0 };
}

const sailMat = engrave({ color: "#efe2c4", freq: 120, keep: 0.4, side: THREE.DoubleSide });
const hullMat = engrave({ color: "#6b4a2c", freq: 120, keep: 0.5 });

/** Small engraved sailing ship (merchant square-rigger). Bow points +z in local space. */
export const SailShip: React.FC<{ at: V3; heading: number; s?: number; bob: number }> = ({ at, heading, s = 1, bob }) => (
  <group position={[at[0], at[1] + Math.sin(bob * 2.1) * 0.01, at[2]]} rotation={[Math.sin(bob * 1.7) * 0.04, heading, Math.sin(bob * 1.3) * 0.05]} scale={s}>
    <mesh material={hullMat} position={[0, 0.06, 0]} castShadow>
      <boxGeometry args={[0.22, 0.1, 0.8]} />
    </mesh>
    <mesh material={hullMat} position={[0, 0.06, 0.45]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <boxGeometry args={[0.155, 0.1, 0.155]} />
    </mesh>
    {[[-0.18, 0.62], [0.12, 0.72]].map(([z, h], i) => (
      <group key={i} position={[0, 0.1, z]}>
        <mesh position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.008, 0.01, h, 6]} />
          <meshStandardMaterial color={INK.iron} />
        </mesh>
        <mesh material={sailMat} position={[0, h * 0.42, 0.02]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.36, h * 0.36, 4, 4]} />
        </mesh>
        <mesh material={sailMat} position={[0, h * 0.8, 0.015]}>
          <planeGeometry args={[0.3, h * 0.28, 4, 4]} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 0.1 + 0.8, 0.12]}>
      <planeGeometry args={[0.12, 0.05]} />
      <meshStandardMaterial color={INK.terracotta} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Small steamship with funnel and smoke wisps. */
export const SteamShip: React.FC<{ at: V3; heading: number; s?: number; bob: number; t: number }> = ({ at, heading, s = 1, bob, t }) => (
  <group position={[at[0], at[1] + Math.sin(bob * 2.1) * 0.008, at[2]]} rotation={[0, heading, Math.sin(bob * 1.3) * 0.03]} scale={s}>
    <mesh material={hullMat} position={[0, 0.07, 0]} castShadow>
      <boxGeometry args={[0.24, 0.12, 0.95]} />
    </mesh>
    <EBox args={[0.18, 0.1, 0.4]} position={[0, 0.18, -0.05]} mat={{ color: "#efe2c4", freq: 100 }} />
    <ECyl r={[0.04, 0.045]} h={0.22} position={[0, 0.33, 0.02]} seg={12} mat={{ color: INK.terracotta, freq: 90, keep: 0.7 }} />
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.5 + i / 3) % 1);
      return (
        <mesh key={i} position={[0, 0.45 + k * 0.35, 0.02 - k * 0.3]} scale={0.05 + k * 0.09}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#d8c8a6" transparent opacity={0.6 * (1 - k)} />
        </mesh>
      );
    })}
  </group>
);

/** Mimbar (stairs and canopy) with an open kitab: Syekh Ahmad Khatib's presence, no figure. */
export const Mimbar: React.FC<{ at: V3; k: number }> = ({ at, k }) => {
  if (k <= 0.01) return null;
  return (
    <group position={at} scale={k * 2.6}>
      {[0, 1, 2, 3, 4].map((i) => <EBox key={i} args={[0.16, 0.05 + i * 0.05, 0.08]} position={[0, (0.05 + i * 0.05) / 2, -i * 0.07]} mat={{ color: "#8a6a44", freq: 90, keep: 0.5 }} />)}
      <EBox args={[0.2, 0.02, 0.14]} position={[0, 0.48, -0.32]} mat={{ color: "#8a6a44", freq: 90, keep: 0.5 }} />
      <mesh position={[0, 0.56, -0.32]} castShadow>
        <coneGeometry args={[0.12, 0.14, 4]} />
        <meshStandardMaterial color={INK.gold} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* kitab on a stand in front */}
      <group position={[0.3, 0, 0.12]}>
        <EBox args={[0.12, 0.1, 0.06]} position={[0, 0.05, 0]} mat={{ color: "#8a6a44", freq: 90 }} />
        <mesh position={[-0.035, 0.115, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.08, 0.006, 0.1]} />
          <meshStandardMaterial color="#f3ead6" />
        </mesh>
        <mesh position={[0.035, 0.115, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.08, 0.006, 0.1]} />
          <meshStandardMaterial color="#f3ead6" />
        </mesh>
      </group>
    </group>
  );
};

/** Small engraved airplane (1952 onward). Nose points +z. */
export const Plane: React.FC<{ at: V3; heading: number; s?: number }> = ({ at, heading, s = 1 }) => (
  <group position={at} rotation={[0, heading, 0]} scale={s}>
    <ECyl r={[0.05, 0.05]} h={0.7} position={[0, 0, 0]} seg={12} mat={{ color: "#e9dcbc", freq: 80, keep: 0.5 }} />
    <EBox args={[0.9, 0.015, 0.14]} position={[0, 0, 0.05]} mat={{ color: "#e9dcbc", freq: 80, keep: 0.5 }} />
    <EBox args={[0.32, 0.012, 0.08]} position={[0, 0.02, -0.3]} mat={{ color: "#e9dcbc", freq: 80, keep: 0.5 }} />
    <EBox args={[0.012, 0.12, 0.09]} position={[0, 0.07, -0.3]} mat={{ color: "#e9dcbc", freq: 80, keep: 0.5 }} />
  </group>
);

export type SeaState = { route: number; ship: number; steam: number; jawi: number; khatib: number; plane: number; fleet: number; t: number };

export const SeaSet: React.FC<SeaState> = ({ route, ship, steam, jawi, khatib, plane, fleet, t }) => {
  const tex = useMemo(() => chartTexture(), []);
  const routePts = useMemo(() => ROUTE.map(([lo, la]) => geo(lo, la, 0.06)), []);
  const jawiPts = useMemo(() => [...JAWI, JAWI[0]].map(([lo, la]) => geo(lo, la, 0.05)), []);
  const sail = routeAt(ship);
  const st = routeAt(steam);
  // the four Kongsi Tiga ships, moored as a fleet off Tanjung Priok
  const fleetPos: [number, number][] = [[104.6, -4.6], [107.3, -4.4], [109.8, -5.0], [112.3, -5.4]];
  const planeArc = (() => {
    const a = geo(106.8, -6.2, 0.4), b = geo(39.2, 21.5, 0.4);
    const k = smooth(plane);
    return { p: [a[0] + (b[0] - a[0]) * k, 0.4 + Math.sin(k * Math.PI) * 1.6, a[2] + (b[2] - a[2]) * k] as V3, heading: Math.atan2(b[0] - a[0], b[2] - a[2]) };
  })();
  return (
    <group>
      <mesh position={[SX, -0.27, 0]} castShadow receiveShadow>
        <boxGeometry args={[MAP.w + 0.6, 0.6, MAP.d + 0.6]} />
        <meshStandardMaterial color="#8a6a44" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[SX, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP.w, MAP.d]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <FlowLine pts={routePts} r={0.07} t={t} reveal={route} color="#c88b2c" />
      <FlowLine pts={jawiPts} r={0.05} t={t} reveal={jawi} color="#e8c26a" />
      {ship > 0.001 && ship < 0.999 ? <SailShip at={sail.p} heading={sail.heading} s={2.2} bob={t} /> : null}
      {steam > 0.001 && steam < 0.999 ? <SteamShip at={st.p} heading={st.heading} s={2.2} bob={t} t={t} /> : null}
      {fleet > 0.01 ? fleetPos.map(([lo, la], i) => <SteamShip key={i} at={geo(lo, la, 0.05)} heading={Math.PI * 0.75} s={1.8 * fleet} bob={t + i} t={t + i} />) : null}
      {plane > 0.001 && plane < 0.999 ? <Plane at={planeArc.p} heading={planeArc.heading} s={1.6} /> : null}
      <Mimbar at={geo(41.2, 22.6, 0.02)} k={khatib} />
      {/* port markers */}
      {[[106.9, -6.1], [95.3, 5.9], [45, 12.8], [39.2, 21.5], [32.55, 30.0], [100.4, -0.3]].map(([lo, la], i) => (
        <mesh key={i} position={geo(lo, la, 0.05)} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.1, 18]} />
          <meshStandardMaterial color={INK.gold} metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

export const FLEET_NAMES: [string, number, number][] = [["SOEKABOEMI", 104.6, -4.6], ["MEDAN", 107.3, -4.4], ["KRAKATAU", 109.8, -5.0], ["SOEMBA", 112.3, -5.4]];
