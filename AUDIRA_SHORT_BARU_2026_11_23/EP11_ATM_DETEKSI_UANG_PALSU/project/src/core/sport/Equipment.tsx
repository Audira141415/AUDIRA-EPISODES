// Sport equipment, code only: balls (painted per pixel, crisp at any distance), football and futsal
// goals with a net that bulges, a basketball hoop, court nets, rackets and a shuttlecock.
// All sizes are real (metres × M), so they match ToyPerson and SportField.
//
//   <Ball kind="football" position={p} spin={[a, 0, 0]} />
//   <Goal sport="football" {...goalPlacement("football", 1)} bulge={{ x: 2, y: 1.2, amount: 0.6 }} />
//   <Hoop {...hoopPlacement(1)} />
//   <CourtNet sport="volleyball" />
//   <ToyPerson ... rightHand={<Racket kind="tennis" />} />

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { POLISH } from "../polish/Polish.tsx";
import { M, SPORTS, type BallKind } from "./specs.ts";

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------
// Ball textures: an equirectangular image computed from the surface normal of each pixel, so the
// pattern lines up with THREE.SphereGeometry's UVs.
const PHI = (1 + Math.sqrt(5)) / 2;
const ICOSA: THREE.Vector3[] = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
// Tangent frame per pentagon: e1 points at a neighbouring vertex (pentagon corners point there).
const FRAMES = ICOSA.map((v) => {
  let best = -2;
  let nb = ICOSA[0];
  for (const o of ICOSA) {
    const d = o.dot(v);
    if (d < 0.999 && d > best) {
      best = d;
      nb = o;
    }
  }
  const e1 = nb.clone().addScaledVector(v, -nb.dot(v)).normalize();
  return { v, e1, e2: new THREE.Vector3().crossVectors(v, e1) };
});
const PENT_R = 0.372; // angular circumradius of a truncated-icosahedron pentagon
const PENT_APO = PENT_R * Math.cos(Math.PI / 5);

/** 0 inside a pentagon, 1 on hexagon area; second value: distance (rad) to the pentagon edge. */
function pentagon(n: THREE.Vector3): [boolean, number] {
  let best = -2;
  let fr = FRAMES[0];
  for (const F of FRAMES) {
    const d = F.v.dot(n);
    if (d > best) {
      best = d;
      fr = F;
    }
  }
  const theta = Math.acos(Math.min(1, best));
  const a = Math.atan2(n.dot(fr.e2), n.dot(fr.e1));
  const sector = (2 * Math.PI) / 5;
  const local = (((a % sector) + sector) % sector) - Math.PI / 5;
  const rMax = PENT_APO / Math.cos(local);
  return [theta < rMax, Math.abs(theta - rMax)];
}

const hex = (c: string) => {
  const k = new THREE.Color(c);
  return [k.r * 255, k.g * 255, k.b * 255];
};

function tennisSeam(): THREE.Vector3[] {
  const a = 0.75;
  const b = 0.25;
  const c = 2 * Math.sqrt(a * b);
  return Array.from({ length: 360 }, (_, i) => {
    const t = (i / 360) * Math.PI * 2;
    return new THREE.Vector3(a * Math.cos(t) + b * Math.cos(3 * t), a * Math.sin(t) - b * Math.sin(3 * t), c * Math.sin(2 * t)).normalize();
  });
}

const PAINTERS: Record<Exclude<BallKind, "shuttlecock">, { size: number; px: (n: THREE.Vector3, r: number) => number[] }> = {
  football: {
    size: 1024,
    px: (n) => {
      const [inside, edge] = pentagon(n);
      if (edge < 0.012) return [70, 72, 76];
      return inside ? [24, 25, 28] : [246, 246, 242];
    },
  },
  futsal: {
    size: 1024,
    px: (n) => {
      const [inside, edge] = pentagon(n);
      if (edge < 0.016) return [30, 30, 36];
      return inside ? hex("#ff7a1a") : hex("#fbfaf6");
    },
  },
  basketball: {
    size: 1024,
    px: (n, r) => {
      const w = 0.018;
      const curve = Math.abs(Math.hypot(n.x, n.y) - 0.72) < w * 0.8;
      if (Math.abs(n.y) < w || Math.abs(n.x) < w || curve) return [28, 20, 16];
      const pebble = 0.9 + r * 0.14;
      return [214 * pebble, 98 * pebble, 42 * pebble];
    },
  },
  volleyball: {
    size: 1024,
    px: (n) => {
      const c = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
      const a = c[0] > c[1] ? (c[0] > c[2] ? 0 : 2) : c[1] > c[2] ? 1 : 2;
      const b = (a + 1 + (a % 2)) % 3;
      const comp = [n.x, n.y, n.z];
      const q = comp[b] / c[a];
      const stripe = Math.min(2, Math.floor((q + 1) * 1.5));
      const seam = Math.abs(((q + 1) * 1.5) % 1) < 0.04 || Math.abs(c[a] - Math.max(c[(a + 1) % 3], c[(a + 2) % 3])) < 0.012;
      if (seam) return [60, 64, 80];
      const P = [hex("#ffd23f"), hex("#1f4fb3"), hex("#ffffff")];
      return P[(stripe + a) % 3];
    },
  },
  tennis: {
    size: 512,
    px: (n, r) => {
      let best = 9;
      for (const p of SEAM) best = Math.min(best, p.distanceToSquared(n));
      if (best < 0.0016) return [246, 246, 236];
      const fuzz = 0.92 + r * 0.12;
      return [215 * fuzz, 238 * fuzz, 74 * fuzz];
    },
  },
};
const SEAM = tennisSeam();

const ballTex = new Map<BallKind, THREE.Texture>();
function ballTexture(kind: Exclude<BallKind, "shuttlecock">): THREE.Texture {
  let t = ballTex.get(kind);
  if (t) return t;
  const { size, px } = PAINTERS[kind];
  const w = size;
  const h = size / 2;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const img = g.createImageData(w, h);
  const n = new THREE.Vector3();
  let seed = 12345;
  for (let j = 0; j < h; j++) {
    const theta = ((j + 0.5) / h) * Math.PI;
    for (let i = 0; i < w; i++) {
      const phi = ((i + 0.5) / w) * Math.PI * 2;
      n.set(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
      seed = (seed * 16807) % 2147483647;
      const [r, gg, b] = px(n, seed / 2147483647);
      const o = (j * w + i) * 4;
      img.data[o] = r;
      img.data[o + 1] = gg;
      img.data[o + 2] = b;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  ballTex.set(kind, t);
  return t;
}

export const ballRadius = (kind: BallKind) => {
  const sport = (Object.values(SPORTS).find((s) => s.ball === kind) ?? SPORTS.football);
  return (sport.ballSize / 2) * M;
};

export const Ball: React.FC<{
  kind: BallKind;
  position?: V3;
  /** Rotation (radians); drive it from distance travelled / radius for a rolling ball. */
  spin?: V3;
  /** Exaggerate for readability in wide shots (1 = real size). */
  scale?: number;
  shadows?: boolean;
}> = ({ kind, position = [0, 0, 0], spin = [0, 0, 0], scale = 1, shadows = true }) => {
  if (kind === "shuttlecock") return <Shuttlecock position={position} rotation={spin} scale={scale} />;
  const tex = ballTexture(kind);
  const r = ballRadius(kind) * scale;
  const felt = kind === "tennis";
  return (
    <mesh position={position} rotation={spin} castShadow={shadows}>
      <sphereGeometry args={[r, 48, 32]} />
      <meshPhysicalMaterial
        map={tex}
        roughness={felt ? 0.95 : kind === "basketball" ? 0.62 : 0.32}
        clearcoat={felt || kind === "basketball" ? 0 : 0.7}
        clearcoatRoughness={0.2}
        sheen={felt ? 1 : 0}
        sheenColor={new THREE.Color("#f4ffb0")}
        sheenRoughness={0.5}
      />
    </mesh>
  );
};

/** Shuttlecock: cork nose at the origin pointing -y, feather skirt above it. */
export const Shuttlecock: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const feathers = useMemo(() => netTexture(64, 0.18, true), []);
  const k = M * scale;
  return (
    <group position={position} rotation={rotation} scale={k}>
      <mesh position={[0, 0.0, 0]}>
        <sphereGeometry args={[0.0135, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f4f1ea" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.0135, 0.0135, 0.012, 20]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#d7263d" />
      </mesh>
      <mesh position={[0, 0.047, 0]}>
        <cylinderGeometry args={[0.033, 0.013, 0.07, 32, 1, true]} />
        <meshStandardMaterial color="#ffffff" map={feathers} alphaTest={0.4} transparent side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Nets: a grid texture used as an alpha-tested map.
const netCache = new Map<string, THREE.CanvasTexture>();
function netTexture(px = 64, line = 0.08, vertical = false): THREE.CanvasTexture {
  const key = `${px}:${line}:${vertical}`;
  let t = netCache.get(key);
  if (t) return t;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  const w = Math.max(1, Math.round(px * line));
  if (vertical) {
    // Feather skirt: vertical vanes with a solid band near the top.
    for (let i = 0; i < 16; i++) g.fillRect((i * px) / 16, 0, Math.max(1, px / 40), px);
    g.fillRect(0, px * 0.18, px, px * 0.05);
    g.fillRect(0, px * 0.55, px, px * 0.05);
    g.globalAlpha = 0.55;
    g.fillRect(0, 0, px, px * 0.35);
  } else {
    g.fillRect(0, 0, px, w);
    g.fillRect(0, 0, w, px);
  }
  t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  netCache.set(key, t);
  return t;
}

/** A net panel w × h (world units) with mesh holes of `hole` world units. */
const NetPanel: React.FC<{
  w: number; h: number; hole: number; color?: string;
  position?: V3; rotation?: V3;
  /** Push vertices along the panel normal: (x, y) in panel coordinates → offset. */
  deform?: (x: number, y: number) => number;
  frame?: number;
}> = ({ w, h, hole, color = "#f4f4f0", position, rotation, deform, frame }) => {
  const tex = useMemo(() => {
    const t = netTexture().clone();
    t.repeat.set(w / hole, h / hole);
    t.needsUpdate = true;
    return t;
  }, [w, h, hole]);
  const geo = useMemo(() => new THREE.PlaneGeometry(w, h, 24, 12), [w, h]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  useLayoutEffect(() => {
    if (!deform) return;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      pos.setZ(i, base[i * 3 + 2] + deform(x, y));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, base, deform, frame]);
  return (
    <mesh geometry={geo} position={position} rotation={rotation}>
      <meshStandardMaterial color={color} map={tex} alphaTest={0.4} transparent side={THREE.DoubleSide} roughness={0.85} />
    </mesh>
  );
};

const Post: React.FC<{ from: V3; to: V3; r: number; color?: string }> = ({ from, to, r, color = "#f6f6f2" }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 20]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------------------------
const GOALS = {
  football: { w: 7.32, h: 2.44, depth: 2.0, topDepth: 1.0, post: 0.06, hole: 0.12 },
  futsal: { w: 3, h: 2, depth: 1.0, topDepth: 0.8, post: 0.04, hole: 0.1 },
} as const;

/** Where a goal sits: on the goal line at `end` (+1 = +z end), opening toward the centre. */
export const goalPlacement = (sport: "football" | "futsal", end: 1 | -1) => ({
  position: [0, 0, end * (SPORTS[sport].length / 2) * M] as V3,
  rotation: end === 1 ? Math.PI : 0,
});

/**
 * Goal with frame and net. Local frame: goal line on z = 0, opening faces +z, net behind (-z).
 * `bulge` pushes the back net out where the ball hits: x across (m, from centre), y height (m),
 * amount in metres.
 */
export const Goal: React.FC<{
  sport?: "football" | "futsal";
  position?: V3;
  rotation?: number;
  bulge?: { x: number; y: number; amount: number };
  frame?: number;
  color?: string;
}> = ({ sport = "football", position = [0, 0, 0], rotation = 0, bulge, frame, color = "#f6f6f2" }) => {
  const G = GOALS[sport];
  const w = G.w * M;
  const h = G.h * M;
  const d = G.depth * M;
  const td = G.topDepth * M;
  const r = G.post * M;
  const hole = G.hole * M;
  const deform = bulge
    ? (x: number, y: number) => {
        const dx = x - bulge.x * M;
        const dy = y + h / 2 - bulge.y * M;
        return -bulge.amount * M * Math.exp(-(dx * dx + dy * dy) / (0.9 * M) ** 2);
      }
    : undefined;
  // Back net leans from the ground at depth d up to the top bar at depth td.
  const backLen = Math.hypot(h, d - td);
  const backTilt = Math.atan2(d - td, h);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Post from={[-w / 2 - r, 0, 0]} to={[-w / 2 - r, h + r, 0]} r={r} color={color} />
      <Post from={[w / 2 + r, 0, 0]} to={[w / 2 + r, h + r, 0]} r={r} color={color} />
      <Post from={[-w / 2 - r * 2, h + r, 0]} to={[w / 2 + r * 2, h + r, 0]} r={r} color={color} />
      {/* Net support frame */}
      <Post from={[-w / 2, h, -td]} to={[w / 2, h, -td]} r={r * 0.4} color="#c9ccd0" />
      <Post from={[-w / 2, 0, -d]} to={[w / 2, 0, -d]} r={r * 0.4} color="#c9ccd0" />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Post from={[(s * w) / 2, h, -td]} to={[(s * w) / 2, 0, -d]} r={r * 0.4} color="#c9ccd0" />
          <Post from={[(s * w) / 2, 0, 0]} to={[(s * w) / 2, 0, -d]} r={r * 0.4} color="#c9ccd0" />
        </group>
      ))}
      {/* Back net (bulges), roof, sides */}
      <NetPanel w={w} h={backLen} hole={hole} position={[0, h / 2, -(d + td) / 2]} rotation={[backTilt, 0, 0]} deform={deform} frame={frame} />
      <NetPanel w={w} h={td} hole={hole} position={[0, h, -td / 2]} rotation={[-Math.PI / 2, 0, 0]} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <shapeGeometry args={[sideShape(h, d, td)]} />
          <meshStandardMaterial color="#f4f4f0" map={sideNet(hole)} alphaTest={0.4} transparent side={THREE.DoubleSide} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
};

const sideShape = (h: number, d: number, td: number) => {
  // In the side panel's own frame (after rotating +90° about y): +x points to -z of the goal.
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(d, 0);
  s.lineTo(td, h);
  s.lineTo(0, h);
  s.closePath();
  return s;
};
const sideNetCache = new Map<number, THREE.Texture>();
const sideNet = (hole: number) => {
  let t = sideNetCache.get(hole);
  if (!t) {
    t = netTexture().clone();
    t.repeat.set(1 / hole, 1 / hole);
    t.needsUpdate = true;
    sideNetCache.set(hole, t);
  }
  return t;
};

// ---------------------------------------------------------------------------------------------
/** Hoop ring centre in the hoop's local frame (origin on the baseline centre, facing +z). */
export const HOOP_RING: V3 = [0, 3.05 * M, 1.575 * M];
export const hoopPlacement = (end: 1 | -1) => ({
  position: [0, 0, end * 14 * M] as V3,
  rotation: end === 1 ? Math.PI : 0,
});
/** World position of the ring centre for a hoop at `end`. */
export const hoopRingWorld = (end: 1 | -1): V3 => [0, HOOP_RING[1], end * (14 - 1.575) * M];

export const Hoop: React.FC<{ position?: V3; rotation?: number; netSwish?: number }> = ({ position = [0, 0, 0], rotation = 0, netSwish = 0 }) => {
  const k = M;
  const netTex = useMemo(() => {
    const t = netTexture(64, 0.1).clone();
    t.repeat.set(12, 3);
    t.needsUpdate = true;
    return t;
  }, []);
  const netGeo = useMemo(() => {
    const pts = [new THREE.Vector2(0.225, 0), new THREE.Vector2(0.2, -0.15), new THREE.Vector2(0.16, -0.3), new THREE.Vector2(0.14, -0.4)];
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={k}>
      {/* Padded base and stanchion behind the baseline */}
      <mesh position={[0, 0.45, -1.6]} castShadow>
        <boxGeometry args={[1.0, 0.9, 1.6]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#1d3557" />
      </mesh>
      <Post from={[0, 0.9, -1.3]} to={[0, 3.3, -1.3]} r={0.09} color="#1d3557" />
      <Post from={[0, 3.3, -1.3]} to={[0, 3.3, 1.1]} r={0.07} color="#1d3557" />
      {/* Glass backboard with the target square */}
      <mesh position={[0, 2.9 + 0.525, 1.2]} castShadow>
        <boxGeometry args={[1.8, 1.05, 0.03]} />
        <meshPhysicalMaterial color="#e8f4ff" transmission={0.6} transparent opacity={0.45} roughness={0.05} thickness={0.03} />
      </mesh>
      {(
        [
          [0, 3.925, 1.8, 0.05], [0, 2.925, 1.8, 0.05], [-0.875, 3.425, 0.05, 1.05], [0.875, 3.425, 0.05, 1.05],
          [0, 3.65, 0.59, 0.05], [0, 3.2, 0.59, 0.05], [-0.295, 3.425, 0.05, 0.45], [0.295, 3.425, 0.05, 0.45],
        ] as const
      ).map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 1.218]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={i < 4 ? "#ffffff" : "#f04a2a"} />
        </mesh>
      ))}
      {/* Ring and net */}
      <mesh position={[0, 3.05, 1.575]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.225, 0.01, 10, 40]} />
        <meshPhysicalMaterial color="#f05a1a" metalness={0.6} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <Post from={[0, 3.05, 1.21]} to={[0, 3.05, 1.35]} r={0.02} color="#f05a1a" />
      <mesh position={[0, 3.05, 1.575]} geometry={netGeo} scale={[1 - netSwish * 0.15, 1 + netSwish * 0.25, 1 - netSwish * 0.15]}>
        <meshStandardMaterial color="#ffffff" map={netTex} alphaTest={0.4} transparent side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
const NETS = {
  volleyball: { postX: 5.5, postH: 2.55, top: 2.43, bottom: 1.43, half: 4.75, hole: 0.1, sag: 0, antenna: 4.5 },
  badminton: { postX: 3.05, postH: 1.55, top: 1.55, bottom: 0.79, half: 3.05, hole: 0.02, sag: 0.026, antenna: 0 },
  tennis: { postX: 6.4, postH: 1.07, top: 1.07, bottom: 0.0, half: 6.4, hole: 0.04, sag: 0.156, antenna: 0 },
} as const;
export type NetSport = keyof typeof NETS;
/** Height of the net top at the centre (metres). */
export const netTop = (sport: NetSport) => NETS[sport].top - NETS[sport].sag;

/** Net across the court at z = 0 (volleyball, badminton, tennis). */
export const CourtNet: React.FC<{ sport: NetSport; postColor?: string }> = ({ sport, postColor = "#1d3557" }) => {
  const N = NETS[sport];
  const k = M;
  const sag = N.sag;
  const h = N.top - N.bottom;
  // Sagging top: approximate with the band following a parabola.
  const bandPts = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = -N.half + (i / 24) * N.half * 2;
      const y = N.top - sag * (1 - (x / N.half) ** 2);
      pts.push(new THREE.Vector3(x, y, 0));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [N.half, N.top, sag]);
  return (
    <group scale={k}>
      {[-1, 1].map((s) => (
        <Post key={s} from={[s * N.postX, 0, 0]} to={[s * N.postX, N.postH, 0]} r={sport === "badminton" ? 0.02 : 0.05} color={postColor} />
      ))}
      <NetPanel w={N.half * 2} h={h - sag * 0.5} hole={N.hole} color="#1b1d22" position={[0, N.bottom + (h - sag * 0.5) / 2, 0]} />
      <mesh>
        <tubeGeometry args={[bandPts, 48, sport === "tennis" ? 0.03 : 0.025, 6, false]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#ffffff" />
      </mesh>
      {sport === "tennis" && (
        <mesh position={[0, (netTop("tennis")) / 2, 0]}>
          <boxGeometry args={[0.05, netTop("tennis"), 0.012]} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#ffffff" />
        </mesh>
      )}
      {N.antenna > 0 &&
        [-1, 1].map((s) => (
          <group key={s} position={[s * N.antenna, N.top - 1, 0]}>
            {Array.from({ length: 9 }, (_, i) => (
              <mesh key={i} position={[0, 0.1 + i * 0.2, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
                <meshPhysicalMaterial {...POLISH.toyPlastic} color={i % 2 ? "#ffffff" : "#e8423f"} />
              </mesh>
            ))}
          </group>
        ))}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
/**
 * Racket built in hand space: the grip sits at the origin and the head extends along -y (the
 * direction the forearm points). Pass it to ToyPerson's rightHand / leftHand.
 */
export const Racket: React.FC<{ kind: "tennis" | "badminton"; color?: string }> = ({ kind, color }) => {
  const R = kind === "tennis"
    ? { len: 0.685, headW: 0.26, headH: 0.32, frame: 0.012, handle: 0.017, shaft: 0.017, strings: 0.012, c: color ?? "#e8423f" }
    : { len: 0.665, headW: 0.21, headH: 0.25, frame: 0.005, handle: 0.014, shaft: 0.0035, strings: 0.008, c: color ?? "#2f6fde" };
  const strings = useMemo(() => {
    const t = netTexture(64, 0.1).clone();
    t.repeat.set(R.headW / R.strings / 2.5, R.headH / R.strings / 2.5);
    t.needsUpdate = true;
    return t;
  }, [R.headW, R.headH, R.strings]);
  const headY = -(R.len - R.headH / 2 - 0.05);
  const gripLen = kind === "tennis" ? 0.2 : 0.2;
  return (
    <group scale={M} rotation={[0, 0, 0]}>
      <mesh position={[0, 0.05 - gripLen / 2, 0]}>
        <cylinderGeometry args={[R.handle, R.handle * 1.05, gripLen, 8]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#1b1d22" />
      </mesh>
      <Post from={[0, 0.05 - gripLen, 0]} to={[0, headY + R.headH / 2, 0]} r={R.shaft} color={R.c} />
      <mesh position={[0, headY, 0]} scale={[R.headW / 2, R.headH / 2, R.headW / 2]}>
        <torusGeometry args={[1, R.frame / (R.headW / 2), 8, 40]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={R.c} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, headY, 0]} scale={[R.headW / 2, R.headH / 2, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#f4f4ee" map={strings} alphaTest={0.4} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
