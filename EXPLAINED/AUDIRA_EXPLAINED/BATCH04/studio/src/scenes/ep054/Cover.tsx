// AE-054 cover (HISTORYMAP): an old relief war map of Germany with a schematic Autobahn network
// drawn as glowing lines (amber = no general limit, crimson = limited), and two road signs standing
// on the map like campaign markers: Zeichen 282 (end of all limits) and the blue 130 advisory.
// Routes and borders are schematic on purpose (not an accurate route map).

import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { loadFont as loadTitle } from "@remotion/google-fonts/Oswald";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";

export const { fontFamily: TITLE } = loadTitle("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const PAL = {
  table: "#1B2028",
  paper: "#E9DCC0",
  paperDark: "#C9B48C",
  ink: "#3A2A1A",
  sea: "#9FB0AE",
  land: "#D6CAB0",
  germany: "#E8D29E",
  border: "#7A2E1E",
  amber: "#FFB300",
  amberHot: "#FFD36A",
  crimson: "#C3272B",
  brass: "#B8893A",
  signBlue: "#0F4C92",
  cream: "#F3E9D2",
};

// ---------- map projection (schematic) ----------
export const K = 0.45;
export const proj = (lon: number, lat: number): [number, number] => [(lon - 10.45) * 0.63 * K, -(lat - 51.15) * K];

/** Relief height in world units (x, z on the map plane). Alps in the south, uplands in the middle. */
// Relief = sum of seeded gaussian massifs (no periodic terms: those print as stripes in the hillshade).
const PEAKS: [number, number, number, number][] = (() => {
  const rnd = prng(2026);
  const out: [number, number, number, number][] = [];
  // Alps band south of the border (lat ~47.0-47.6)
  for (let i = 0; i < 26; i++) out.push([5.5 + rnd() * 11.5, 46.6 + rnd() * 1.0, 0.09 + rnd() * 0.08, 0.25 + rnd() * 0.3]);
  // central uplands (Harz, Thuringia, Black Forest, Bavarian Forest...)
  const hills: [number, number][] = [[10.6, 51.75], [10.9, 50.65], [8.1, 48.3], [8.0, 50.6], [9.4, 50.4], [12.9, 50.5], [13.2, 49.1], [7.3, 50.3], [9.6, 48.5], [11.6, 49.9], [8.4, 51.3]];
  for (const [lo, la] of hills) out.push([lo + (rnd() - 0.5) * 0.4, la + (rnd() - 0.5) * 0.3, 0.025 + rnd() * 0.025, 0.35 + rnd() * 0.25]);
  return out;
})();
export const heightAt = (wx: number, wz: number) => {
  let h = 0.006;
  for (const [lo, la, amp, r] of PEAKS) {
    const [px, pz] = proj(lo, la);
    const d2 = (wx - px) ** 2 + (wz - pz) ** 2;
    h += amp * Math.exp(-d2 / (r * r * K * K * 3.2));
  }
  return h;
};

export const GERMANY: [number, number][] = [
  [7.0, 53.62], [7.9, 53.75], [8.6, 53.9], [8.9, 54.4], [8.65, 54.9], [9.4, 54.83], [9.9, 54.8], [10.1, 54.45],
  [10.9, 54.35], [10.85, 54.0], [11.5, 54.05], [12.4, 54.45], [13.1, 54.55], [13.45, 54.68], [13.7, 54.3],
  [14.25, 53.92], [14.42, 53.3], [14.15, 52.85], [14.7, 52.55], [14.6, 51.85], [15.03, 51.25], [14.85, 50.9],
  [14.3, 50.88], [13.5, 50.62], [12.9, 50.42], [12.2, 50.3], [12.45, 49.75], [12.7, 49.5], [13.4, 49.0],
  [13.82, 48.78], [13.45, 48.55], [13.0, 48.28], [12.9, 47.95], [13.05, 47.6], [12.6, 47.68], [12.2, 47.6],
  [11.4, 47.45], [10.95, 47.42], [10.5, 47.55], [10.2, 47.3], [9.75, 47.55], [9.25, 47.66], [8.6, 47.72],
  [8.2, 47.6], [7.6, 47.58], [7.55, 48.0], [7.8, 48.6], [8.2, 48.98], [7.6, 49.08], [6.85, 49.2], [6.4, 49.47],
  [6.37, 49.85], [6.12, 50.1], [6.25, 50.5], [6.0, 50.78], [6.1, 51.15], [5.95, 51.8], [6.75, 51.92],
  [6.85, 52.25], [7.05, 52.6], [7.2, 53.2], [7.0, 53.62],
];
const NORTH_SEA: [number, number][] = [
  [2.0, 51.2], [3.4, 51.4], [4.2, 52.4], [4.8, 53.1], [5.9, 53.45], [7.0, 53.62], [7.9, 53.75], [8.6, 53.9],
  [8.9, 54.4], [8.65, 54.9], [8.4, 55.6], [8.1, 56.6], [8.4, 57.4], [2.0, 58.5],
];
const BALTIC: [number, number][] = [
  [10.1, 54.45], [10.9, 54.35], [10.85, 54.0], [11.5, 54.05], [12.4, 54.45], [13.1, 54.55], [13.45, 54.68],
  [13.7, 54.3], [14.25, 53.92], [15.5, 54.15], [16.6, 54.55], [19.5, 54.4], [19.5, 58.5], [12.6, 58.5],
  [12.5, 56.2], [12.1, 55.6], [11.0, 55.9], [10.6, 55.4], [10.0, 55.1],
];

export const CITY: Record<string, [number, number]> = {
  FL: [9.43, 54.78], KI: [10.13, 54.32], LU: [10.69, 53.87], HRO: [12.1, 54.09], HH: [10.0, 53.55], HB: [8.8, 53.08],
  OS: [8.05, 52.28], H: [9.73, 52.37], MD: [11.63, 52.13], B: [13.4, 52.52], DO: [7.47, 51.51], K: [6.95, 50.94],
  AC: [6.1, 50.78], KS: [9.5, 51.31], EF: [11.03, 50.98], L: [12.37, 51.34], DD: [13.74, 51.05], F: [8.68, 50.11],
  WU: [9.93, 49.79], N: [11.08, 49.45], R: [12.1, 49.01], PA: [13.43, 48.57], MA: [8.47, 49.49], SB: [7.0, 49.23],
  KA: [8.4, 49.01], S: [9.18, 48.78], UL: [9.99, 48.4], M: [11.58, 48.14], SZ: [12.95, 47.78], BS: [7.6, 47.6],
  FU: [10.6, 47.6], GA: [11.1, 47.5],
};
// [from, to, limited?]
export const ROADS: [string, string, boolean][] = [
  ["FL", "KI", false], ["KI", "HH", false], ["LU", "HH", false], ["LU", "HRO", false], ["HRO", "B", false],
  ["HH", "B", false], ["HH", "HB", false], ["HB", "OS", false], ["OS", "DO", true], ["DO", "K", true],
  ["K", "AC", true], ["K", "SB", false], ["HH", "H", false], ["H", "KS", false], ["KS", "WU", false],
  ["WU", "UL", false], ["UL", "FU", false], ["DO", "H", false], ["H", "MD", false], ["MD", "B", false],
  ["B", "L", false], ["L", "N", false], ["N", "M", false], ["K", "F", true], ["F", "WU", false],
  ["WU", "N", false], ["N", "R", false], ["R", "PA", false], ["DO", "KS", false], ["KS", "EF", false],
  ["EF", "DD", false], ["MD", "L", false], ["L", "DD", false], ["B", "DD", true], ["F", "KA", true],
  ["KA", "BS", false], ["SB", "MA", true], ["MA", "N", false], ["KA", "S", true], ["S", "UL", true],
  ["UL", "M", false], ["M", "SZ", true], ["M", "GA", true], ["DO", "F", false],
];

// ---------- map plane ----------
const W = 8.0;
const H = 9.0;
const TEX = 2048;
const toPx = (x: number, z: number): [number, number] => [((x + W / 2) / W) * TEX, ((z + H / 2) / H) * TEX];
const lonLatPx = (lon: number, lat: number) => {
  const [x, z] = proj(lon, lat);
  return toPx(x, z);
};

const pathPoly = (ctx: CanvasRenderingContext2D, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach(([lo, la], i) => {
    const [px, py] = lonLatPx(lo, la);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
};

const paintMap = (): THREE.CanvasTexture => {
  const c = document.createElement("canvas");
  c.width = c.height = TEX;
  const ctx = c.getContext("2d")!;
  const rnd = prng(5407);

  // aged paper base (neighbouring land)
  ctx.fillStyle = PAL.land;
  ctx.fillRect(0, 0, TEX, TEX);
  // fibre speckle
  for (let i = 0; i < 26000; i++) {
    const x = rnd() * TEX, y = rnd() * TEX;
    ctx.fillStyle = rnd() < 0.5 ? "rgba(90,60,30,0.07)" : "rgba(255,250,235,0.10)";
    ctx.fillRect(x, y, 1 + rnd() * 2.5, 1 + rnd() * 1.2);
  }

  // seas with engraved horizontal hatching
  for (const sea of [NORTH_SEA, BALTIC]) {
    ctx.save();
    pathPoly(ctx, sea);
    ctx.fillStyle = PAL.sea;
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = "rgba(40,60,70,0.22)";
    ctx.lineWidth = 1.4;
    for (let y = 0; y < TEX; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= TEX; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + y * 0.3) * 1.6);
      ctx.stroke();
    }
    ctx.restore();
    // coast echo lines
    for (let k = 1; k <= 3; k++) {
      pathPoly(ctx, sea);
      ctx.strokeStyle = `rgba(40,60,70,${0.28 - k * 0.07})`;
      ctx.lineWidth = 2 + k * 5;
      ctx.stroke();
    }
  }

  // Germany fill, slightly warmer
  pathPoly(ctx, GERMANY);
  ctx.fillStyle = PAL.germany;
  ctx.fill();

  // graticule
  ctx.strokeStyle = "rgba(70,45,20,0.20)";
  ctx.lineWidth = 2;
  for (let lo = 2; lo <= 20; lo += 2) {
    const [a] = lonLatPx(lo, 44);
    ctx.beginPath();
    ctx.moveTo(a, 0);
    ctx.lineTo(a, TEX);
    ctx.stroke();
  }
  for (let la = 44; la <= 59; la += 1) {
    const [, b] = lonLatPx(10, la);
    ctx.beginPath();
    ctx.moveTo(0, b);
    ctx.lineTo(TEX, b);
    ctx.stroke();
  }

  // hillshade (multiply), computed on a coarser grid then smoothed up
  const G = 512;
  const hs = document.createElement("canvas");
  hs.width = hs.height = G;
  const hctx = hs.getContext("2d")!;
  const img = hctx.createImageData(G, G);
  const e = (W / G) * 1.0;
  for (let j = 0; j < G; j++) {
    for (let i = 0; i < G; i++) {
      const x = (i / G) * W - W / 2, z = (j / G) * H - H / 2;
      const dx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e);
      const dz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
      const shade = Math.max(0.78, Math.min(1.08, 1 - (dx * 1.6 + dz * 1.1) * 0.55));
      const v = Math.min(255, shade * 255);
      const p = (j * G + i) * 4;
      img.data[p] = v;
      img.data[p + 1] = Math.min(255, v * 0.97);
      img.data[p + 2] = Math.min(255, v * 0.9);
      img.data[p + 3] = 255;
    }
  }
  hctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(hs, 0, 0, TEX, TEX);
  ctx.restore();

  // relief hachures on the Alps band and uplands
  ctx.strokeStyle = "rgba(80,50,25,0.32)";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W - W / 2, z = rnd() * H - H / 2;
    const h = heightAt(x, z);
    if (h < 0.05) continue;
    const [px, py] = toPx(x, z);
    const len = 6 + h * 70;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (rnd() - 0.5) * 3, py + len);
    ctx.stroke();
  }

  // Germany border: thick crimson-brown wash + dashed ink line (old military map)
  pathPoly(ctx, GERMANY);
  ctx.strokeStyle = "rgba(122,46,30,0.35)";
  ctx.lineWidth = 22;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.setLineDash([18, 8, 4, 8]);
  ctx.strokeStyle = PAL.border;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.setLineDash([]);

  // stains and foxing
  for (let i = 0; i < 18; i++) {
    const x = rnd() * TEX, y = rnd() * TEX, r = 30 + rnd() * 160;
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, "rgba(120,80,30,0.0)");
    g.addColorStop(0.85, "rgba(120,80,30,0.10)");
    g.addColorStop(1, "rgba(120,80,30,0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // fold creases
  ctx.strokeStyle = "rgba(255,248,230,0.35)";
  ctx.lineWidth = 3;
  for (const fx of [TEX * 0.335, TEX * 0.665]) {
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.lineTo(fx, TEX);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, TEX * 0.5);
  ctx.lineTo(TEX, TEX * 0.5);
  ctx.stroke();
  ctx.strokeStyle = "rgba(90,60,30,0.18)";
  ctx.lineWidth = 2;
  for (const fx of [TEX * 0.335 + 3, TEX * 0.665 + 3]) {
    ctx.beginPath();
    ctx.moveTo(fx, 0);
    ctx.lineTo(fx, TEX);
    ctx.stroke();
  }

  // city names are 3D paper tags (CityLabels) so the raised roads never cover them

  // compass rose (top right of Germany)
  const [cx, cy] = lonLatPx(15.9, 55.6);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = PAL.ink;
  ctx.fillStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(12, 0);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.font = "700 34px Georgia, serif";
  ctx.fillText("N", cx - 12, cy - 108);

  // tea-stained vignette toward the sheet edges
  {
    const g = ctx.createRadialGradient(TEX / 2, TEX * 0.5, TEX * 0.18, TEX / 2, TEX * 0.5, TEX * 0.72);
    g.addColorStop(0, "rgba(90,55,20,0)");
    g.addColorStop(1, "rgba(70,40,15,0.7)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX, TEX);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const MapSheet: React.FC = () => {
  const tex = useMemo(paintMap, []);
  const grain = useSurfaceGrain(54, 0.25, 6);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, 260, 290);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      // paper edge sags slightly to the table
      const edge = Math.min(1, Math.min(x + W / 2, W / 2 - x, z + H / 2, H / 2 - z) / 0.25);
      pos.setY(i, heightAt(x, z) * edge);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} bumpMap={grain} bumpScale={0.025} />
      </mesh>
      {/* dark table */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#14181E" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ---------- Autobahn network ----------
export const roadCurve = (a: string, b: string, seed: number) => {
  const [ax, az] = proj(...CITY[a]);
  const [bx, bz] = proj(...CITY[b]);
  const rnd = prng(seed);
  const pts: THREE.Vector3[] = [];
  const n = 8;
  const nx = -(bz - az), nz = bx - ax;
  const len = Math.hypot(nx, nz) || 1;
  const bend = (rnd() - 0.5) * 0.12;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = Math.sin(t * Math.PI) * bend + (i > 0 && i < n ? (rnd() - 0.5) * 0.025 : 0);
    const x = ax + (bx - ax) * t + (nx / len) * w;
    const z = az + (bz - az) * t + (nz / len) * w;
    pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.022, z));
  }
  return new THREE.CatmullRomCurve3(pts);
};

/**
 * limMix: 1 = limited stretches red (cover), 0 = all amber. redAll: 0..1 paints every line red (1973-74 limit).
 * glow: emissive multiplier (0 = unlit ink lines).
 */
export const Network: React.FC<{ limMix?: number; redAll?: number; glow?: number }> = ({ limMix = 1, redAll = 0, glow = 1 }) => {
  const cAmber = new THREE.Color(PAL.amber), cRed = new THREE.Color(PAL.crimson);
  const eAmber = new THREE.Color("#FF7400"), eRed = new THREE.Color("#FF1A1A");
  const roads = useMemo(
    () => ROADS.map(([a, b, lim], i) => {
        const curve = roadCurve(a, b, 101 + i * 37);
        const casing = new THREE.CatmullRomCurve3(curve.points.map((p) => p.clone().setY(p.y - 0.03)));
        return { lim, curve, casing };
      }),
    [],
  );
  return (
    <group>
      {roads.map(({ lim, curve, casing }, i) => (
        <group key={i}>
          <mesh castShadow>
            <tubeGeometry args={[curve, 48, lim ? 0.02 : 0.024, 10, false]} />
            <meshStandardMaterial
              color={cAmber.clone().lerp(cRed, Math.max(redAll, lim ? limMix : 0))}
              emissive={eAmber.clone().lerp(eRed, Math.max(redAll, lim ? limMix : 0))}
              emissiveIntensity={(lim ? 0.6 + 0.15 * limMix : 0.6 + 0.15 * redAll) * glow}
              toneMapped={false}
              roughness={0.4}
            />
          </mesh>
          {/* dark ink casing under the line, like a cased road on an engraved map */}
          <mesh>
            <tubeGeometry args={[casing, 48, lim ? 0.032 : 0.037, 10, false]} />
            <meshStandardMaterial color="#2A1A0E" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {Object.entries(CITY).map(([id, ll]) => {
        const [x, z] = proj(...ll);
        const big = ["B", "HH", "M", "K", "F"].includes(id);
        return (
          <mesh key={id} position={[x, heightAt(x, z) + 0.03, z]} castShadow>
            <cylinderGeometry args={[big ? 0.05 : 0.032, big ? 0.055 : 0.036, big ? 0.05 : 0.035, 24]} />
            <meshStandardMaterial color={PAL.brass} metalness={0.9} roughness={0.32} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- signs ----------
export const signFace282 = () => {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F7F7F2";
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  // thin dark edge
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 10, 0, Math.PI * 2);
  ctx.stroke();
  // five thin diagonal lines, upper right to lower left, clipped inside the disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 64, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(s / 2, s / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "#1A1A1A";
  for (let k = -2; k <= 2; k++) ctx.fillRect(-s / 2, k * 58 - 11, s, 22);
  ctx.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const signFace130 = () => {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PAL.signBlue;
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#F4F6F8";
  ctx.lineWidth = 26;
  const r = 70, m = 46;
  ctx.beginPath();
  ctx.roundRect(m, m, s - 2 * m, s - 2 * m, r);
  ctx.stroke();
  ctx.fillStyle = "#F4F6F8";
  ctx.font = "700 430px 'Arial Narrow', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("130", s / 2, s / 2 + 20);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const plaqueTex = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#D8B66A");
  g.addColorStop(1, "#9C7430");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#5A3E14";
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, 988, 220);
  ctx.fillStyle = "#3E2A0C";
  ctx.font = "700 120px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AUDIRA", 512, 132);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const Pole: React.FC<{ h: number }> = ({ h }) => (
  <group>
    <mesh position={[0, h / 2, 0]} castShadow>
      <cylinderGeometry args={[0.032, 0.032, h, 24]} />
      <meshStandardMaterial color="#B9BEC2" metalness={0.85} roughness={0.38} />
    </mesh>
    <mesh position={[0, h + 0.02, 0]}>
      <sphereGeometry args={[0.036, 16, 12]} />
      <meshStandardMaterial color="#9EA4A8" metalness={0.85} roughness={0.35} />
    </mesh>
  </group>
);

export const Base: React.FC<{ r: number; label?: boolean }> = ({ r, label }) => {
  const pt = useMemo(() => (label ? plaqueTex() : null), [label]);
  return (
    <group>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.92, r, 0.08, 48]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#2B1F16" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.095, 0]} castShadow>
        <cylinderGeometry args={[r * 0.55, r * 0.7, 0.03, 48]} />
        <meshStandardMaterial color={PAL.brass} metalness={0.9} roughness={0.3} />
      </mesh>
      {pt && (
        <mesh position={[0, 0.045, r * 0.93]} rotation={[-0.12, 0, 0]}>
          <RoundedBoxGeo args={[r * 1.0, 0.07, 0.012]} radius={0.004} />
          <meshStandardMaterial map={pt} metalness={0.8} roughness={0.35} />
        </mesh>
      )}
    </group>
  );
};

export const Sign282: React.FC = () => {
  const face = useMemo(signFace282, []);
  const R = 0.5;
  const poleH = 0.85;
  return (
    <group>
      <Base r={0.3} />
      <group position={[0, 0.1, 0]}>
        <Pole h={poleH + 0.25} />
        <group position={[0, poleH, 0.05]}>
          {/* aluminium disc body with rolled rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[R, R, 0.03, 96]} />
            <meshStandardMaterial color="#A9AEB2" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh>
            <torusGeometry args={[R, 0.016, 12, 96]} />
            <meshStandardMaterial color="#C9CDD0" metalness={0.9} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.017]}>
            <circleGeometry args={[R - 0.004, 96]} />
            <meshPhysicalMaterial map={face} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
          </mesh>
          {/* clamp bands */}
          {[-0.28, 0.28].map((y) => (
            <mesh key={y} position={[0, y, -0.04]}>
              <RoundedBoxGeo args={[0.11, 0.045, 0.05]} radius={0.01} />
              <meshStandardMaterial color="#8E9498" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

export const Sign130: React.FC = () => {
  const face = useMemo(signFace130, []);
  const S = 0.62;
  const poleH = 0.7;
  return (
    <group>
      <Base r={0.24} />
      <group position={[0, 0.1, 0]}>
        <Pole h={poleH + 0.2} />
        <group position={[0, poleH, 0.045]}>
          <mesh castShadow>
            <RoundedBoxGeo args={[S, S, 0.028]} radius={0.012} />
            <meshStandardMaterial color="#A9AEB2" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.0145]}>
            <planeGeometry args={[S - 0.012, S - 0.012]} />
            <meshPhysicalMaterial map={face} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
          </mesh>
          {[-0.18, 0.18].map((y) => (
            <mesh key={y} position={[0, y, -0.035]}>
              <RoundedBoxGeo args={[0.1, 0.04, 0.045]} radius={0.01} />
              <meshStandardMaterial color="#8E9498" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

export const LabelPlate: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const t = useMemo(plaqueTex, []);
  return (
    <group position={position} rotation={[-Math.PI / 2 + 0.55, 0.0, 0.06]}>
      <mesh castShadow>
        <RoundedBoxGeo args={[1.1, 0.27, 0.035]} radius={0.012} />
        <meshStandardMaterial color="#9C7430" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[1.07, 0.25]} />
        <meshStandardMaterial map={t} metalness={0.75} roughness={0.38} />
      </mesh>
    </group>
  );
};

const rulerTex = () => {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#E0C078");
  g.addColorStop(1, "#A57A34");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2048, 128);
  ctx.fillStyle = "#4A3210";
  for (let i = 0; i <= 200; i++) {
    const x = 24 + i * 10;
    const h = i % 10 === 0 ? 56 : i % 5 === 0 ? 38 : 22;
    ctx.fillRect(x, 0, 3, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Brass ruler and a pair of dividers on the table below the map: fills the lower sheet, no text. */
export const DeskTools: React.FC = () => {
  const rt = useMemo(rulerTex, []);
  const brass = { color: PAL.brass, metalness: 0.9, roughness: 0.3 } as const;
  return (
    <group>
      <group position={[-0.45, 0.03, 3.2]} rotation={[0, 0.14, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[2.6, 0.03, 0.26]} radius={0.008} />
          <meshStandardMaterial {...brass} />
        </mesh>
        <mesh position={[0, 0.0155, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.58, 0.24]} />
          <meshStandardMaterial map={rt} metalness={0.8} roughness={0.32} />
        </mesh>
      </group>
      {/* dividers: two legs from a hinge, lying open on the paper */}
      <group position={[1.0, 0.03, 3.45]} rotation={[0, -0.9, 0]}>
        {[0.32, -0.32].map((a) => (
          <mesh key={a} position={[Math.sin(a) * 0.45, 0, Math.cos(a) * 0.45]} rotation={[Math.PI / 2, 0, -a]} castShadow>
            <cylinderGeometry args={[0.022, 0.006, 0.9, 16]} />
            <meshStandardMaterial color="#C9CDD0" metalness={0.92} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 32]} />
          <meshStandardMaterial {...brass} />
        </mesh>
      </group>
    </group>
  );
};

export const LABELS: [string, string, number, number][] = [
  ["B", "Berlin", 0.3, 0.0], ["HH", "Hamburg", -0.36, -0.06], ["H", "Hannover", 0.3, -0.09], ["K", "Köln", -0.04, 0.16],
  ["F", "Frankfurt", 0.34, -0.07], ["L", "Leipzig", 0.0, -0.14], ["N", "Nürnberg", -0.38, -0.05],
  ["S", "Stuttgart", 0.34, 0.12], ["M", "München", -0.37, 0.07],
];
export const labelTex = (name: string) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 112;
  const ctx = c.getContext("2d")!;
  ctx.font = "italic 700 64px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(240,228,196,0.95)";
  ctx.lineWidth = 16;
  ctx.strokeText(name, 256, 58);
  ctx.fillStyle = PAL.ink;
  ctx.fillText(name, 256, 58);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const CityLabels: React.FC = () => {
  const items = useMemo(
    () =>
      LABELS.map(([id, name, dx, dz]) => {
        const [x, z] = proj(...CITY[id]);
        return { name, tex: labelTex(name), pos: [x + dx, heightAt(x + dx, z + dz) + 0.075, z + dz] as [number, number, number] };
      }),
    [],
  );
  return (
    <group>
      {items.map(({ name, tex, pos }) => (
        <mesh key={name} position={pos} rotation={[-Math.PI / 2 + 0.45, 0, 0]}>
          <planeGeometry args={[0.66, 0.145]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- camera ----------
const CAM_POS: [number, number, number] = [0.1, 10.6, 8.3];
const CAM_TARGET: [number, number, number] = [0.0, 0.0, 0.35];

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = (frame / 30) * 60;
  const drift = Math.sin(f / 240) * 0.02;
  const signY282 = heightAt(1.25, 2.1);
  const signY130 = heightAt(-1.15, 2.05);
  return (
    <AbsoluteFill style={{ background: PAL.table }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ position: [CAM_POS[0] + drift, CAM_POS[1], CAM_POS[2]], fov: 30, near: 0.1, far: 80 }}
        onCreated={({ camera }) => camera.lookAt(...CAM_TARGET)}
      >
        <ambientLight intensity={0.14} color="#FFF1DA" />
        <hemisphereLight args={["#FFE9C4", "#20262E", 0.2]} />
        <directionalLight
          position={[-4.5, 6.5, 2.5]}
          intensity={1.7}
          color="#FFE2B0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0002}
          shadow-normalBias={0.03}
        />
        <directionalLight position={[4, 3, 6]} intensity={0.45} color="#9DB8D8" />
        <spotLight position={[0.2, 6.5, 2.6]} angle={0.42} penumbra={1} intensity={10} color="#FFE7C2" distance={14} />

        <MapSheet />
        <Network />

        <LabelPlate position={[0, heightAt(0, 2.25) + 0.05, 2.25]} />
        <DeskTools />
        <CityLabels />
        <group position={[1.25, signY282, 2.1]} rotation={[-0.3, -0.2, 0]} scale={1.15}>
          <Sign282 />
        </group>
        <group position={[-1.15, signY130, 2.05]} rotation={[-0.3, 0.22, 0]} scale={1.15}>
          <Sign130 />
        </group>

        <Finish
          frame={frame}
          background={PAL.table}
          profile={COLOR_PROFILES.DOCUMENTARY_WARM}
          exposure={1}
          envIntensity={0.55}
          hdri="warmStudio"
          ao={false}
        />
      </ThreeCanvas>
      <CoverOverlay />
    </AbsoluteFill>
  );
};

// ---------- typography ----------
const CoverOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* top darkening for title legibility */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 700,
        background: "linear-gradient(180deg, rgba(14,17,22,0.92) 0%, rgba(14,17,22,0.7) 55%, rgba(14,17,22,0) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 70, right: 70, top: 196 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: PAL.amber }}>
        AUDIRA EXPLAINED · AE-054
      </div>
      <div
        style={{
          fontFamily: TITLE,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 0.98,
          marginTop: 18,
          color: PAL.cream,
          textTransform: "uppercase",
          letterSpacing: 1,
          textShadow: "0 6px 24px rgba(0,0,0,0.55)",
        }}
      >
        Jalan tol
        <br />
        <span style={{ color: PAL.amber }}>tanpa batas?</span>
      </div>
    </div>

    {/* legend: one row so the foreground signs keep their space */}
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, fontFamily: MONO, color: PAL.cream }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          background: "rgba(14,17,22,0.8)",
          padding: "12px 18px",
          fontSize: 25,
          fontWeight: 500,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 8, background: PAL.amber, boxShadow: `0 0 10px ${PAL.amber}` }} />
          ±70%: anjuran 130
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 8, background: "#FF3B30", boxShadow: "0 0 10px #FF3B30" }} />
          ±30%: batas wajib
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 21, color: "rgba(243,233,210,0.75)", letterSpacing: 2 }}>RUAS AUTOBAHN · DATA BASt 2015 · PETA SKEMATIS</div>
    </div>
  </AbsoluteFill>
);
