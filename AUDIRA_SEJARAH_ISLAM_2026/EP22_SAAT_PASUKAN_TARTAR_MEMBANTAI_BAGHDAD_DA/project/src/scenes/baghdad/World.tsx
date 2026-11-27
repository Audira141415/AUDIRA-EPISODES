// EP22 war table: dark varnished table, displaced relief map sheet (Iraq - Persia) with a painted
// canvas texture (hypsometric tint, hillshade, contours, hatched gulf, Tigris/Euphrates/Diyala,
// lat/lon grid, paper fibre, folds, stains),
// gold rope border, brass AUDIRA QISSAH plaques, the growing gold route, and the lighting rig
// whose key light follows the camera target (per-scene mood blended across cuts).
import React, { useMemo } from "react";
import * as THREE from "three";
import { SceneText } from "../../core/polish/Drei.tsx";
import { DIYALA_LL, EUPHRATES_LL, GULF, ROUTE_LL, SHEET_H, SHEET_W, TIGRIS_LL, geo, heightAt, isSea } from "./geo.ts";
import { CUTS, mix, ss } from "./timing.ts";
import { camDist, type Pose } from "./rig.ts";

// ---- height grid (shared by the mesh and the texture) -------------------------------------
const GX = 211, GZ = 371;
let GRID: Float32Array | null = null;
export const grid = () => {
  if (GRID) return GRID;
  GRID = new Float32Array(GX * GZ);
  for (let j = 0; j < GZ; j++)
    for (let i = 0; i < GX; i++) GRID[j * GX + i] = heightAt((i / (GX - 1) - 0.5) * SHEET_W, (j / (GZ - 1) - 0.5) * SHEET_H);
  return GRID;
};
/** Bilinear relief height from the grid (cheap; use for placing props on the map). */
export const hAt = (x: number, z: number) => {
  const G = grid();
  const fx = (x / SHEET_W + 0.5) * (GX - 1), fz = (z / SHEET_H + 0.5) * (GZ - 1);
  if (fx < 0 || fz < 0 || fx > GX - 1 || fz > GZ - 1) return 0;
  const i = Math.min(GX - 2, Math.floor(fx)), j = Math.min(GZ - 2, Math.floor(fz));
  const u = fx - i, v = fz - j;
  const a = G[j * GX + i], b = G[j * GX + i + 1], c = G[(j + 1) * GX + i], d = G[(j + 1) * GX + i + 1];
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};
export const SHEET_Y = 0.006;

const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---- map texture ---------------------------------------------------------------------------
let MAP_TEX: THREE.CanvasTexture | null = null;
const mapTexture = () => {
  if (MAP_TEX) return MAP_TEX;
  const W = 1024, H = Math.round((1024 * SHEET_H) / SHEET_W);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  const img = g.createImageData(W, H);
  const px = (i: number) => (i / W - 0.5) * SHEET_W;
  const pz = (j: number) => (j / H - 0.5) * SHEET_H;
  const paper = [217, 198, 160], mid = [196, 170, 124], high = [140, 122, 92], sea = [150, 170, 172];
  const hs = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) hs[j * W + i] = hAt(px(i), pz(j));
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i, x = px(i), z = pz(j), h = hs[k];
      let c: number[];
      if (isSea(x, z)) {
        const hatch = (i + j) % 11 < 1.2 ? 0.86 : 1;
        // shallow band along the coast
        c = sea.map((v) => v * hatch);
      } else {
        const e = Math.min(1, h / 0.36);
        c = e < 0.35 ? paper.map((v, n) => mix(v, mid[n], e / 0.35)) : mid.map((v, n) => mix(v, high[n], (e - 0.35) / 0.65));
        // hillshade, light from the north-west
        const hx = hs[k + 1 < W * H ? k + 1 : k] - hs[k > 0 ? k - 1 : k];
        const hz = hs[k + W < W * H ? k + W : k] - hs[k - W >= 0 ? k - W : k];
        const shade = 1 + (-hx * 0.8 - hz * 0.6) * 55;
        c = c.map((v) => v * Math.min(1.18, Math.max(0.72, shade)));
        // contours every 0.045
        const lv = Math.floor(h / 0.045);
        if (h > 0.03 && (Math.floor(hs[k + 1 < W * H ? k + 1 : k] / 0.045) !== lv || Math.floor(hs[k + W < W * H ? k + W : k] / 0.045) !== lv))
          c = c.map((v) => v * 0.8);
      }
      img.data[k * 4] = c[0]; img.data[k * 4 + 1] = c[1]; img.data[k * 4 + 2] = c[2]; img.data[k * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const toPx = (lon: number, lat: number): [number, number] => {
    const [x, z] = geo(lon, lat);
    return [(x / SHEET_W + 0.5) * W, (z / SHEET_H + 0.5) * H];
  };
  // gulf coastline
  g.strokeStyle = "rgba(70,62,50,0.75)";
  g.lineWidth = 2.2;
  g.beginPath();
  GULF.forEach((p, n) => (n ? g.lineTo(...toPx(...p)) : g.moveTo(...toPx(...p))));
  g.closePath();
  g.stroke();
  // rivers (schematic): thick blue with a pale bank line so they read at d >= 8
  const river = (ll: [number, number][], w: number) => {
    g.lineCap = "round"; g.lineJoin = "round";
    for (const [col, lw] of [["rgba(236,226,200,0.85)", w + 5], ["#2B5C8A", w]] as [string, number][]) {
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath();
      ll.forEach((p, n) => (n ? g.lineTo(...toPx(...p)) : g.moveTo(...toPx(...p))));
      g.stroke();
    }
  };
  river(EUPHRATES_LL, 6);
  river(DIYALA_LL, 4);
  river(TIGRIS_LL, 8);
  // lat/lon grid
  g.strokeStyle = "rgba(92,70,44,0.28)"; g.lineWidth = 1.4;
  g.font = "italic 15px serif"; g.fillStyle = "rgba(92,70,44,0.55)";
  for (let lon = 41; lon <= 49; lon++) {
    const [x] = toPx(lon, 29);
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    g.fillText(`${lon}°`, x + 4, 18);
  }
  for (let lat = 29; lat <= 38; lat++) {
    const [, y] = toPx(45, lat);
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    g.fillText(`${lat}°`, 6, y - 4);
  }
  // sea name, printed on the sheet
  g.fillStyle = "rgba(40,60,72,0.6)"; g.font = "italic 26px serif";
  g.save(); g.translate(...toPx(48.4, 28.9)); g.rotate(-0.55); g.fillText("TELUK PERSIA", 0, 0); g.restore();
  // paper fibre, folds, stains, worn edge
  const r = prng(7711);
  for (let n = 0; n < 2600; n++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 4 + r() * 14;
    g.strokeStyle = `rgba(${r() < 0.5 ? "90,70,45" : "255,248,230"},${0.05 + r() * 0.06})`;
    g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (const [x0, y0, x1, y1] of [[W / 2, 0, W / 2, H], [0, H / 3, W, H / 3], [0, (2 * H) / 3, W, (2 * H) / 3]]) {
    g.strokeStyle = "rgba(80,60,40,0.12)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = "rgba(255,250,235,0.12)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 + 3, y0 + 3); g.lineTo(x1 + 3, y1 + 3); g.stroke();
  }
  for (let n = 0; n < 7; n++) {
    const x = r() * W, y = r() * H, rad = 40 + r() * 110;
    const grd = g.createRadialGradient(x, y, rad * 0.6, x, y, rad);
    grd.addColorStop(0, "rgba(120,90,50,0.0)"); grd.addColorStop(0.85, "rgba(120,90,50,0.09)"); grd.addColorStop(1, "rgba(120,90,50,0)");
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const edge = g.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, "rgba(70,48,26,0.32)"); edge.addColorStop(0.05, "rgba(70,48,26,0)"); edge.addColorStop(0.95, "rgba(70,48,26,0)"); edge.addColorStop(1, "rgba(70,48,26,0.32)");
  g.fillStyle = edge; g.fillRect(0, 0, W, H);
  const edgeV = g.createLinearGradient(0, 0, 0, H);
  edgeV.addColorStop(0, "rgba(70,48,26,0.3)"); edgeV.addColorStop(0.03, "rgba(70,48,26,0)"); edgeV.addColorStop(0.97, "rgba(70,48,26,0)"); edgeV.addColorStop(1, "rgba(70,48,26,0.3)");
  g.fillStyle = edgeV; g.fillRect(0, 0, W, H);
  MAP_TEX = new THREE.CanvasTexture(cv);
  MAP_TEX.colorSpace = THREE.SRGBColorSpace;
  MAP_TEX.anisotropy = 8;
  return MAP_TEX;
};

let WOOD_TEX: THREE.CanvasTexture | null = null;
const woodTexture = () => {
  if (WOOD_TEX) return WOOD_TEX;
  const W = 512, H = 1024;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#3a2516"; g.fillRect(0, 0, W, H);
  const r = prng(3301);
  for (let n = 0; n < 420; n++) {
    const x = r() * W, w = 1 + r() * 4, a = 0.04 + r() * 0.12;
    g.strokeStyle = r() < 0.5 ? `rgba(20,10,4,${a})` : `rgba(110,70,40,${a})`;
    g.lineWidth = w;
    g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= H; y += 32) g.lineTo(x + Math.sin(y * 0.01 + n) * 6 * r(), y);
    g.stroke();
  }
  // plank seams
  for (let x = 0; x < W; x += 128) { g.fillStyle = "rgba(8,4,2,0.6)"; g.fillRect(x, 0, 3, H); }
  WOOD_TEX = new THREE.CanvasTexture(cv);
  WOOD_TEX.colorSpace = THREE.SRGBColorSpace;
  WOOD_TEX.wrapS = WOOD_TEX.wrapT = THREE.RepeatWrapping;
  WOOD_TEX.repeat.set(3, 2);
  return WOOD_TEX;
};

// ---- the table + sheet ---------------------------------------------------------------------
const MapSheet: React.FC = () => {
  const geom = useMemo(() => {
    const gm = new THREE.PlaneGeometry(SHEET_W, SHEET_H, GX - 1, GZ - 1);
    gm.rotateX(-Math.PI / 2);
    const p = gm.attributes.position as THREE.BufferAttribute;
    for (let n = 0; n < p.count; n++) p.setY(n, hAt(p.getX(n), p.getZ(n)));
    gm.computeVertexNormals();
    return gm;
  }, []);
  const tex = useMemo(() => mapTexture(), []);
  return (
    <mesh geometry={geom} position={[0, SHEET_Y, 0]} receiveShadow castShadow>
      <meshPhysicalMaterial map={tex} roughness={0.93} sheen={0.15} sheenRoughness={0.8} metalness={0} />
    </mesh>
  );
};

const Rope: React.FC = () => {
  const geom = useMemo(() => {
    const m = 0.12, w = SHEET_W / 2 + m, h = SHEET_H / 2 + m;
    const path = new THREE.CurvePath<THREE.Vector3>();
    const c = [[-w, -h], [w, -h], [w, h], [-w, h], [-w, -h]];
    for (let i = 0; i < 4; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(c[i][0], 0.03, c[i][1]), new THREE.Vector3(c[i + 1][0], 0.03, c[i + 1][1])));
    return new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, 400, 0.03, 8, false);
  }, []);
  const m = 0.12, w = SHEET_W / 2 + m, h = SHEET_H / 2 + m;
  return (
    <group>
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial color="#c9a04a" metalness={0.55} roughness={0.42} />
      </mesh>
      {[[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} castShadow>
          <sphereGeometry args={[0.075, 20, 14]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
};

const Plaque: React.FC<{ z: number; flip?: boolean }> = ({ z, flip }) => (
  <group position={[0, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
    <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.06, 0.62]} />
      <meshStandardMaterial color="#b8903e" metalness={0.85} roughness={0.32} />
    </mesh>
    <mesh position={[0, 0.062, 0]}>
      <boxGeometry args={[3.0, 0.006, 0.5]} />
      <meshStandardMaterial color="#5a3f18" metalness={0.6} roughness={0.5} />
    </mesh>
    <SceneText position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#f1d58a" anchorX="center" anchorY="middle" letterSpacing={0.12}>
      AUDIRA QISSAH
    </SceneText>
  </group>
);

export const Table: React.FC<{ north?: boolean }> = ({ north }) => {
  const wood = useMemo(() => woodTexture(), []);
  return (
    <group>
      <mesh position={[1.2, -0.3, 0]} receiveShadow>
        <boxGeometry args={[24, 0.6, 30]} />
        <meshPhysicalMaterial map={wood} roughness={0.5} clearcoat={0.5} clearcoatRoughness={0.35} />
      </mesh>
      <MapSheet />
      <Rope />
      {/* s7: camera views from the north after 52 s (el 57°): turn both plaques to read from the lens */}
      <Plaque z={SHEET_H / 2 + 0.75} flip={north} />
      <Plaque z={-SHEET_H / 2 - 0.75} flip={!north} />
    </group>
  );
};

// ---- gold route ----------------------------------------------------------------------------
const routeCurve = (() => {
  let c: THREE.CatmullRomCurve3 | null = null;
  return () => {
    if (c) return c;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < ROUTE_LL.length - 1; i++) {
      const [ax, az] = geo(...ROUTE_LL[i]);
      const [bx, bz] = geo(...ROUTE_LL[i + 1]);
      for (let k = 0; k < 8; k++) {
        const u = k / 8, x = mix(ax, bx, u), z = mix(az, bz, u);
        pts.push(new THREE.Vector3(x, SHEET_Y + hAt(x, z) + 0.035, z));
      }
    }
    const [ex, ez] = geo(...ROUTE_LL[ROUTE_LL.length - 1]);
    pts.push(new THREE.Vector3(ex, SHEET_Y + hAt(ex, ez) + 0.035, ez));
    return (c = new THREE.CatmullRomCurve3(pts));
  };
})();
/** Point on the route, u = 0 Hamadan .. 1 Baghdad. */
export const routeAt = (u: number) => routeCurve().getPointAt(Math.min(1, Math.max(0, u)));
export const routeTangent = (u: number) => routeCurve().getTangentAt(Math.min(0.999, Math.max(0.001, u)));

export const Route: React.FC<{ grow: number; tail?: number; color?: string; glow?: number }> = ({ grow, tail = 0, color = "#C8322A", glow = 0.6 }) => {
  const geom = useMemo(() => new THREE.TubeGeometry(routeCurve(), 400, 0.03, 8, false), []);
  const segs = 400 * 8 * 6;
  const a = Math.floor(tail * 400) * 48, b = Math.floor(grow * 400) * 48;
  geom.setDrawRange(a, Math.max(0, Math.min(segs, b) - a));
  if (grow <= 0.001) return null;
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.4} roughness={0.35} />
    </mesh>
  );
};

// ---- light rig -----------------------------------------------------------------------------
type Mood = { key: string; keyI: number; dir: [number, number, number]; fill: number; fillColor: string; spot: number; spotColor: string; rim: number };
const MOODS: Mood[] = [
  { key: "#ffc07e", keyI: 2.6, dir: [-0.85, 0.4, 0.35], fill: 0.32, fillColor: "#9fb2d4", spot: 16, spotColor: "#ffd49a", rim: 0.8 }, // s1 golden dusk
  { key: "#ffe6c2", keyI: 2.3, dir: [-0.5, 0.85, 0.3], fill: 0.5, fillColor: "#cfd8e6", spot: 14, spotColor: "#ffd9a0", rim: 0.5 }, // s2 even warm
  { key: "#ffc48e", keyI: 1.6, dir: [-0.5, 0.7, 0.5], fill: 0.34, fillColor: "#7f8fb0", spot: 26, spotColor: "#ffb060", rim: 0.7 }, // s3 dim candle
  { key: "#cfe0ff", keyI: 1.7, dir: [0.45, 0.75, -0.45], fill: 0.34, fillColor: "#8ea4c8", spot: 18, spotColor: "#dfeaff", rim: 0.9 }, // s4 cold blue haze
  { key: "#ff9f5e", keyI: 2.2, dir: [0.85, 0.35, 0.3], fill: 0.34, fillColor: "#a7a0c8", spot: 10, spotColor: "#ffb070", rim: 1.6 }, // s5 orange smoke + strong cold rim
  { key: "#ffcf9a", keyI: 0.9, dir: [-0.3, 0.9, 0.3], fill: 0.2, fillColor: "#8a90b0", spot: 34, spotColor: "#ffd8a8", rim: 1.1 }, // s6 dark, narrow spot
  { key: "#bcd2ff", keyI: 1.5, dir: [0.4, 0.6, -0.6], fill: 0.38, fillColor: "#7f98c8", spot: 22, spotColor: "#e6eeff", rim: 1.3 }, // s7 blue night + rim
  { key: "#ffd27a", keyI: 2.6, dir: [0.9, 0.35, 0.2], fill: 0.42, fillColor: "#c8c4d8", spot: 8, spotColor: "#ffd890", rim: 0.6 }, // s8 golden dawn from the east
];
const blendMood = (t: number): Mood => {
  let m = MOODS[0];
  for (let i = 1; i < MOODS.length; i++) {
    const k = ss(CUTS[i] - 0.9, CUTS[i] + 0.9, t);
    if (k <= 0) break;
    const n = MOODS[i];
    const c = new THREE.Color(m.key).lerp(new THREE.Color(n.key), k);
    const fc = new THREE.Color(m.fillColor).lerp(new THREE.Color(n.fillColor), k);
    const sc = new THREE.Color(m.spotColor).lerp(new THREE.Color(n.spotColor), k);
    m = {
      key: `#${c.getHexString()}`, keyI: mix(m.keyI, n.keyI, k),
      dir: [mix(m.dir[0], n.dir[0], k), mix(m.dir[1], n.dir[1], k), mix(m.dir[2], n.dir[2], k)],
      fill: mix(m.fill, n.fill, k), fillColor: `#${fc.getHexString()}`, spot: mix(m.spot, n.spot, k), spotColor: `#${sc.getHexString()}`, rim: mix(m.rim, n.rim, k),
    };
  }
  return m;
};

export const LightRig: React.FC<{ pose: Pose; t: number; bg: string; candle?: [number, number, number] | null; candleI?: number }> = ({ pose, t, bg, candle, candleI = 0 }) => {
  const m = blendMood(t);
  const d = camDist(pose);
  const tg = pose.target;
  const target = useMemo(() => new THREE.Object3D(), []);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  target.position.set(tg[0], 0, tg[2]);
  target.updateMatrixWorld();
  spotTarget.position.set(tg[0], 0, tg[2]);
  spotTarget.updateMatrixWorld();
  const L = Math.hypot(...m.dir);
  const far = 30;
  const kp: [number, number, number] = [tg[0] + (m.dir[0] / L) * far, (m.dir[1] / L) * far, tg[2] + (m.dir[2] / L) * far];
  const ext = Math.max(2.5, d * 0.75);
  return (
    <>
      <primitive object={target} />
      <primitive object={spotTarget} />
      <directionalLight
        position={kp} target={target} color={m.key} intensity={m.keyI} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-ext} shadow-camera-right={ext} shadow-camera-top={ext} shadow-camera-bottom={-ext}
        shadow-camera-near={1} shadow-camera-far={70}
      />
      <hemisphereLight args={[m.fillColor, "#3a2a1c", m.fill]} />
      <directionalLight position={[tg[0] + 6, 5, tg[2] - 9]} color="#7fa6d8" intensity={m.rim} />
      {m.spot > 0.5 ? (
        <spotLight position={[tg[0], 7, tg[2] + 1.5]} target={spotTarget} angle={0.3} penumbra={0.85} intensity={m.spot} decay={1.6} distance={30} color={m.spotColor} />
      ) : null}
      {candle && candleI > 0.01 ? <pointLight position={candle} color="#ffae55" intensity={candleI} distance={4} decay={2} /> : null}
      <fog attach="fog" args={[bg, d * 0.9 + 2, d * 2.3 + 10]} color={bg} near={d * 0.9 + 2} far={d * 2.3 + 10} />
    </>
  );
};
