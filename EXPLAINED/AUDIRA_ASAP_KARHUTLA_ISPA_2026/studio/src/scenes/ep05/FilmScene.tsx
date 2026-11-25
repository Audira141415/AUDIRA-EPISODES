// EP05 film — 3D map table (HISTORYMAP). One continuous world: the cover's paper map widened east
// (filmWorld.ts) so Kalimantan is on the paper. The camera never cuts: it flies a time-aware Hermite
// path through word-anchored keys. Smoke flows as camera-facing puffs; wind arrows, routes, tags,
// treaty sheet and case folders appear on their words.
// Facts: BMKG — Pekanbaru smoke from Sumsel, Jambi, Bengkulu, wind to the north-west; BMKG Batam —
// Batam smoke dominated by Sumsel and Jambi; BBC — Malaysia's haze from "Sumatra and Kalimantan"
// (no province named, so the Malaysia branches leave from the Riau blanket and from Kalimantan).
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { ToyPerson, lookFromSeed } from "../../core/polish/Person.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { BORDER_JOHOR, BORDER_MAIN, JAMBI, KL, MAP_H, MAP_W, PAL, PEKANBARU, SINGAPORE, SUMSEL, getWorld, v3, wx, wz } from "./filmWorld.ts";
import { T, SEC, TOTAL, backOut, seg, win } from "./time.ts";

type LL = [number, number];
const BATAM: LL = [104.03, 1.08];
const JOHOR_SCHOOL: LL = [103.15, 2.15];
const JAKARTA: LL = [106.82, -6.18];
const DOC: LL = [108.15, 5.3];
const ROOM: LL = [102.05, 3.55];
const FOLDER_C: LL = [99.3, -3.75];

// ---------------------------------------------------------------- camera
type Key = { t: number; lon: number; lat: number; d: number; p: number; yaw: number };
const K = (t: number, lon: number, lat: number, d: number, p: number, yaw: number): Key => ({ t, lon, lat, d, p, yaw });
const KEYS: Key[] = [
  K(0, 101.85, 0.95, 8.6, 0.86, -0.05),
  K(T.padahal, 102.1, 0.3, 9.2, 0.88, -0.02),
  K(SEC.KONTEKS[0] + 0.1, 102.6, -1.15, 8.6, 0.92, 0.02),
  K(T.sumsel, 103.3, -2.1, 8.2, 0.9, 0.05),
  K(T.terbawa, 102.9, -2.1, 8.4, 0.9, 0.01),
  K(T.pada18 + 0.4, 102.0, -0.2, 8.0, 0.95, -0.04),
  K(T.nol + 0.3, 101.75, 0.75, 7.6, 0.98, -0.06),
  K(T.dinkes, 101.6, 0.75, 5.8, 0.9, -0.02),
  K(SEC.KONTEKS[1], 101.55, 0.75, 4.8, 0.86, 0.03),
  K(T.batam + 0.9, 103.45, 0.85, 4.2, 0.86, 0.06),
  K(T.lalu, 103.8, 0.95, 3.8, 0.84, 0.08),
  K(T.malaysia + 0.1, 105.3, 1.6, 16.0, 1.0, 0.0),
  K(T.johor + 0.6, 103.4, 2.5, 4.6, 0.88, 0.03),
  K(T.naik + 1.0, 102.6, 2.6, 6.8, 0.92, -0.02),
  K(T.nor, 102.1, 4.02, 3.3, 0.8, -0.03),
  K(SEC.PENGEMBANGAN[1] - 0.3, 102.08, 4.02, 2.9, 0.74, 0.05),
  K(T.perjanjian + 0.6, 107.95, 5.95, 6.6, 1.02, 0.0),
  K(T.myBawa - 0.4, 108.05, 5.95, 5.9, 0.98, 0.04),
  K(T.menteri, 105.0, 3.8, 9.0, 0.98, -0.02),
  K(T.komit, 106.0, -0.4, 12.2, 1.02, 0.02),
  K(T.pejabat + 1.0, 102.5, 3.5, 6.2, 0.92, -0.04),
  K(SEC.PENJELASAN[1] - 0.3, 102.4, 3.7, 5.3, 0.9, -0.08),
  K(T.tersangka - 0.2, 99.3, -3.05, 6.2, 0.92, 0.02),
  K(T.empat + 0.4, 99.3, -3.1, 5.7, 0.9, 0.03),
  K(T.dibuka, 99.3, -3.12, 5.4, 0.88, 0.04),
  K(T.isu + 0.2, 101.6, -2.3, 8.6, 0.96, 0.02),
  K(T.asapO + 0.8, 103.6, 0.6, 12.5, 1.0, 0.0),
  K(SEC.OUTRO[1], 104.6, 1.2, 15.5, 1.04, -0.04),
  K(TOTAL, 104.6, 1.2, 16.2, 1.05, -0.05),
];
const FIELDS = ["lon", "lat", "d", "p", "yaw"] as const;
// Time-aware cubic Hermite (finite-difference tangents in units per second): C1 in time, so the
// camera never stops at a key.
export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const h = b.t - a.t;
  const u = Math.min(1, Math.max(0, (t - a.t) / h));
  const tan = (j: number, f: (typeof FIELDS)[number]) => {
    if (j <= 0 || j >= KEYS.length - 1) return 0;
    return ((KEYS[j + 1][f] - KEYS[j - 1][f]) / (KEYS[j + 1].t - KEYS[j - 1].t)) * 0.85;
  };
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const out = {} as Record<(typeof FIELDS)[number], number>;
  for (const f of FIELDS) out[f] = h00 * a[f] + h10 * h * tan(i, f) + h01 * b[f] + h11 * h * tan(i + 1, f);
  out.d = Math.max(2.6, out.d);
  out.yaw += Math.sin(t * 0.21) * 0.035;
  const target = new THREE.Vector3(wx(out.lon), 0, wz(out.lat));
  const pos = new THREE.Vector3(
    target.x + out.d * Math.cos(out.p) * Math.sin(out.yaw),
    out.d * Math.sin(out.p),
    target.z + out.d * Math.cos(out.p) * Math.cos(out.yaw),
  );
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0)));
  return { ...out, target, pos, q };
};
type Cam = ReturnType<typeof camAt>;

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, size } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = 38;
  c.near = 0.1;
  c.far = 80;
  c.position.copy(cam.pos);
  c.quaternion.copy(cam.q);
  // push the subject up into the 70% upper frame (headline above, captions below)
  c.setViewOffset(size.width, size.height, 0, size.height * 0.11, size.width, size.height);
  c.updateProjectionMatrix();
  return null;
};

// ---------------------------------------------------------------- textures
const texCache = new Map<string, THREE.CanvasTexture>();
const canvasTex = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};
const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const ls = (c: CanvasRenderingContext2D, px: number) => ((c as unknown as { letterSpacing: string }).letterSpacing = `${px}px`);
const radial = (rgb: string, a: number) =>
  canvasTex(`radial:${rgb}:${a}`, 256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(0.45, `rgba(${rgb},${a * 0.45})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

// ---------------------------------------------------------------- table + map
const Table: React.FC = () => {
  const tex = useMemo(() => {
    const t = canvasTex("table", 1024, 1024, (c) => {
      c.fillStyle = "#2a2018";
      c.fillRect(0, 0, 1024, 1024);
      const rnd = prng(31);
      for (let i = 0; i < 260; i++) {
        const y = rnd() * 1024;
        c.strokeStyle = `rgba(${rnd() < 0.5 ? "12,8,5" : "70,52,36"},${0.08 + rnd() * 0.18})`;
        c.lineWidth = 1 + rnd() * 5;
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 64) c.lineTo(x, y + Math.sin(x * 0.004 + i) * 6);
        c.stroke();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
      <planeGeometry args={[44, 44]} />
      <meshPhysicalMaterial map={tex} roughness={0.55} clearcoat={0.35} clearcoatRoughness={0.4} />
    </mesh>
  );
};

const PaperMap: React.FC = () => {
  const { tex, geo } = getWorld();
  const grain = useSurfaceGrain(55, 0.3, 6);
  return (
    <group>
      <mesh position={[0, -0.018, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[MAP_W + 0.16, 0.024, MAP_H + 0.16]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3b2f25" />
      </mesh>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} />
      </mesh>
    </group>
  );
};

// Raised dashes along a lon/lat polyline; `glow` lights them up when smoke crosses.
const Dashes: React.FC<{ pts: LL[]; dash: number; gap: number; w: number; color: string; glow: number; closed?: boolean; show?: number }> = ({
  pts, dash, gap, w, color, glow, closed = false, show = 1,
}) => {
  const items = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => new THREE.Vector3(wx(lo), 0, wz(la))), closed, "centripetal");
    const len = curve.getLength();
    const n = Math.floor(len / (dash + gap));
    return Array.from({ length: n }, (_, i) => {
      const u = Math.min(1, ((i + 0.5) * (dash + gap)) / len);
      const p = curve.getPointAt(u);
      const d = curve.getTangentAt(u);
      return { p, rot: Math.atan2(-d.z, d.x), u };
    });
  }, [pts, dash, gap, closed]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color }), [color]);
  mat.emissive.set(color);
  mat.emissiveIntensity = glow * 1.6;
  if (show <= 0.001) return null;
  return (
    <group>
      {items.map(({ p, rot, u }, i) =>
        u <= show ? (
          <mesh key={i} position={[p.x, 0.014, p.z]} rotation={[0, rot, 0]} castShadow material={mat}>
            <RoundedBoxGeo args={[dash, 0.016, w]} radius={0.006} />
          </mesh>
        ) : null,
      )}
    </group>
  );
};

// ---------------------------------------------------------------- smoke
type Stream = { route: LL[]; n: number; w0: number; w1: number; s0: number; s1: number; reveal: (t: number) => number; tMax?: number; seed: number };
const FEEDERS: LL[][] = [
  [[105.0, -3.35], [104.4, -2.6], [103.8, -1.8], [103.1, -0.95], [102.35, -0.2], [101.75, 0.45]],
  [[103.55, -1.6], [103.0, -1.15], [102.4, -0.55], [101.9, 0.2]],
  [[102.3, -3.65], [101.95, -2.5], [101.65, -1.2], [101.5, 0.15]],
];
const R_BATAM: LL[] = [[103.25, -0.95], [103.5, -0.25], [103.78, 0.42], [103.98, 0.92]];
const R_MY: LL[] = [[101.25, 1.45], [101.55, 2.0], [101.85, 2.5], [102.0, 2.9]];
const R_SG: LL[] = [[102.55, 1.0], [103.05, 1.05], [103.45, 1.17], [103.66, 1.3]];
const R_KAL: LL[] = [[110.2, 0.15], [108.8, 0.75], [107.2, 1.3], [105.6, 1.65], [104.6, 1.78], [104.1, 1.85]];
const BLANKET = { c: [101.75, 0.8] as LL, rx: 1.05, ry: 0.95 };
const ON = () => 1;
const STREAMS: Stream[] = [
  { route: FEEDERS[0], n: 150, w0: 0.07, w1: 0.2, s0: 0.15, s1: 0.5, reveal: ON, seed: 1 },
  { route: FEEDERS[1], n: 70, w0: 0.06, w1: 0.15, s0: 0.2, s1: 0.5, reveal: ON, seed: 2 },
  { route: FEEDERS[2], n: 80, w0: 0.06, w1: 0.16, s0: 0.25, s1: 0.5, reveal: ON, seed: 3 },
  { route: R_BATAM, n: 60, w0: 0.1, w1: 0.12, s0: 0.35, s1: 0.6, reveal: (t) => seg(t, T.bergerak + 0.3, T.ispu), seed: 4 },
  { route: R_MY, n: 120, w0: 0.2, w1: 0.12, s0: 0.55, s1: 0.8, reveal: (t) => seg(t, T.lalu + 0.2, T.menyeberang + 0.2), tMax: 0.9, seed: 5 },
  { route: R_SG, n: 50, w0: 0.16, w1: 0.08, s0: 0.55, s1: 0.8, reveal: (t) => seg(t, T.lalu + 0.4, T.menyeberang + 0.4), tMax: 0.86, seed: 6 },
  { route: R_KAL, n: 160, w0: 0.14, w1: 0.12, s0: 0.6, s1: 0.8, reveal: (t) => seg(t, T.kalimantan - 0.1, T.malaysia + 0.4), tMax: 0.92, seed: 7 },
];
const STREAM_REVEAL = (i: number, t: number) => STREAMS[i].reveal(t);
const ARROWS: { route: LL[]; size: number; dark: boolean; reveal: (t: number) => number }[] = [
  { route: R_MY, size: 0.42, dark: true, reveal: STREAMS[4].reveal },
  { route: R_SG, size: 0.32, dark: true, reveal: STREAMS[5].reveal },
  { route: R_KAL, size: 0.36, dark: false, reveal: STREAMS[6].reveal },
  { route: R_BATAM, size: 0.3, dark: true, reveal: STREAMS[3].reveal },
];

const routeCurve = (route: LL[], lift: number) => new THREE.CatmullRomCurve3(route.map(([lo, la]) => v3(lo, la, lift)), false, "centripetal");

const puffTexture = () =>
  canvasTex("puff", 256, 256, (c) => {
    const rnd = prng(808);
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 46;
      const x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, r = 40 + rnd() * 48;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.2)");
      g.addColorStop(0.5, "rgba(255,255,255,0.09)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
    }
  });

const MAXP = 1000;
const PuffLayer: React.FC<{ t: number; layer: number; cam: Cam; density: number }> = ({ t, layer, cam, density }) => {
  const curves = useMemo(() => STREAMS.map((s) => routeCurve(s.route, [0.08, 0.16, 0.26][layer])), [layer]);
  const mesh = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({ map: puffTexture(), transparent: true, depthWrite: false, depthTest: false });
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, MAXP);
    m.renderOrder = 3 + layer * 0.1;
    m.frustumCulled = false;
    const col = new THREE.Color("#3f3933");
    for (let i = 0; i < MAXP; i++) m.setColorAt(i, col);
    m.instanceColor!.needsUpdate = true;
    return m;
  }, [layer]);
  (mesh.material as THREE.MeshBasicMaterial).opacity = [0.8, 0.5, 0.3][layer] * density;
  const o = useMemo(() => new THREE.Object3D(), []);
  const up = new THREE.Vector3(0, 1, 0);
  const dark = new THREE.Color("#5e554a"), light = new THREE.Color("#e9e0cc"), col = new THREE.Color();
  // camera axes to turn a ground wind direction into an on-screen angle
  const cr = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.q), cu = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.q);
  const NW = new THREE.Vector3(-1, 0, -1).normalize();
  const screenAng = (d: THREE.Vector3) => Math.atan2(d.dot(cu), d.dot(cr));
  const sizeK = [1.7, 2.6, 3.8][layer];
  const lift = [0.08, 0.16, 0.26][layer];
  const nK = [1, 0.6, 0.3][layer];
  const flow = t * 0.07;
  let k = 0;
  const put = (p: THREE.Vector3, s: number, rot: number, shade: number) => {
    if (k >= MAXP) return;
    o.position.copy(p);
    o.quaternion.copy(cam.q);
    o.rotateZ(rot);
    const ss = Math.max(1e-4, s);
    // streaks stretched along the wind
    o.scale.set(ss * 1.9, ss * 0.75, ss);
    o.updateMatrix();
    mesh.setMatrixAt(k, o.matrix);
    mesh.setColorAt(k, col.copy(dark).lerp(light, Math.min(1, Math.max(0, shade + layer * 0.12))));
    k++;
  };
  STREAMS.forEach((s, si) => {
    const rnd = prng(1000 + layer * 17 + s.seed * 131);
    const rev = STREAM_REVEAL(si, t);
    const n = Math.round(s.n * nK);
    const tMax = s.tMax ?? 1;
    for (let i = 0; i < n; i++) {
      const r0 = rnd(), r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd();
      if (rev <= 0.001) continue;
      const u = ((r0 + flow) % 1) * tMax;
      const vis = Math.min(1, Math.max(0, (rev * tMax - u) / 0.08));
      if (vis <= 0.001) continue;
      const p = curves[si].getPointAt(u);
      const side = new THREE.Vector3().crossVectors(curves[si].getTangentAt(u), up).normalize();
      const w = s.w0 + (s.w1 - s.w0) * u;
      p.addScaledVector(side, (r1 - 0.5) * 2 * w * 0.6);
      p.y += r2 * 0.05 * (layer + 1);
      // fade in at the source, out at the tip
      const ends = Math.min(1, u / 0.06, (tMax - u) / 0.1 + 0.25);
      put(p, w * sizeK * (0.7 + r3 * 0.6) * vis * ends, screenAng(curves[si].getTangentAt(u)) + (r4 - 0.5) * 0.35, s.s0 + (s.s1 - s.s0) * u + (r5 - 0.5) * 0.15);
    }
  });
  {
    const rnd = prng(2000 + layer * 17);
    for (let i = 0; i < Math.round(170 * nK); i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd();
      const lon = BLANKET.c[0] + Math.cos(a) * r * BLANKET.rx + Math.sin(t * 0.6 + i) * 0.03;
      const lat = BLANKET.c[1] + Math.sin(a) * r * BLANKET.ry + Math.cos(t * 0.5 + i * 1.3) * 0.02;
      put(v3(lon, lat, lift + r2 * 0.06), 0.3 * sizeK * (0.7 + r3 * 0.6), screenAng(NW) + (r4 - 0.5) * 0.5 + Math.sin(t * 0.3 + i) * 0.05, 0.28 + r5 * 0.24);
    }
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor!.needsUpdate = true;
  return <primitive object={mesh} />;
};

// clay arrowheads at the tips of the cross-border branches
const headGeo = (() => {
  let g: THREE.ExtrudeGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new THREE.Shape();
    s.moveTo(0.5, 0); s.lineTo(-0.5, 0.5); s.lineTo(-0.28, 0); s.lineTo(-0.5, -0.5); s.closePath();
    g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 4 });
    g.rotateX(-Math.PI / 2);
    return g;
  };
})();
const SmokeHeads: React.FC<{ t: number }> = ({ t }) => {
  const heads = useMemo(
    () =>
      ARROWS.map((a) => {
        const c = routeCurve(a.route, 0.08);
        const p = c.getPointAt(1);
        const d = c.getTangentAt(0.95);
        return { p, rot: Math.atan2(-d.z, d.x) };
      }),
    [],
  );
  return (
    <group>
      {heads.map((h, i) => {
        const s = backOut(seg(ARROWS[i].reveal(t), 0.75, 1));
        if (s <= 0.01) return null;
        return (
          <group key={i} position={[h.p.x, h.p.y - 0.02, h.p.z]} rotation={[0, h.rot, 0]} scale={ARROWS[i].size * s}>
            <mesh geometry={headGeo()} castShadow>
              <meshPhysicalMaterial {...POLISH.clay} color={ARROWS[i].dark ? "#4a433c" : "#6d665e"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Wind chevrons flowing along the three feeder routes (north-west), drawn over the smoke.
const WindChevrons: React.FC<{ t: number; show: number }> = ({ t, show }) => {
  const curves = useMemo(() => FEEDERS.map((r) => routeCurve(r, 0.3)), []);
  const N = 8;
  const mesh = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.5, 0); s.lineTo(-0.1, 0.42); s.lineTo(-0.35, 0.42); s.lineTo(0.22, 0); s.lineTo(-0.35, -0.42); s.lineTo(-0.1, -0.42); s.closePath();
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: "#fff3dc", transparent: true, depthTest: false, depthWrite: false, toneMapped: false }), N * 3);
    m.renderOrder = 5;
    m.frustumCulled = false;
    return m;
  }, []);
  (mesh.material as THREE.MeshBasicMaterial).opacity = 0.92 * show;
  mesh.visible = show > 0.01;
  const o = new THREE.Object3D();
  let k = 0;
  curves.forEach((c, ci) => {
    for (let i = 0; i < N; i++) {
      const u = (i / N + t * 0.11 + ci * 0.13) % 1;
      const p = c.getPointAt(u);
      const d = c.getTangentAt(u);
      const fade = Math.min(1, u / 0.12, (1 - u) / 0.12);
      o.position.copy(p);
      o.rotation.set(0, Math.atan2(-d.z, d.x), 0);
      const sc = 0.13 * Math.max(1e-3, fade * show);
      o.scale.set(sc, sc, sc);
      o.updateMatrix();
      mesh.setMatrixAt(k++, o.matrix);
    }
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ---------------------------------------------------------------- fires
const Fires: React.FC<{ t: number; kal: number }> = ({ t, kal }) => {
  const glow = useMemo(() => radial("255,110,30", 0.9), []);
  const spots = useMemo(() => {
    const rnd = prng(404);
    const g = (c: LL, n: number, s: number, kalimantan = false) =>
      Array.from({ length: n }, () => ({ ll: [c[0] + (rnd() - 0.5) * s * 1.6, c[1] + (rnd() - 0.5) * s] as LL, kalimantan }));
    return [...g(SUMSEL, 9, 0.9), ...g(JAMBI, 6, 0.6), ...g([102.45, -3.55], 3, 0.4), ...g([109.95, -0.25], 6, 0.6, true)].map((x, i) => ({
      p: v3(x.ll[0], x.ll[1], 0),
      k: 0.7 + rnd() * 0.6,
      i,
      kal: x.kalimantan,
    }));
  }, []);
  return (
    <group>
      {spots.map(({ p, k, i, kal: isKal }) => {
        const vis = isKal ? kal : 1;
        if (vis <= 0.01) return null;
        const fl = 1 + Math.sin(t * 27 + i * 1.7) * 0.12;
        const kk = k * Math.max(0.05, vis);
        return (
          <group key={i} position={p}>
            <mesh position={[0, 0.045 * kk * fl, 0]}>
              <coneGeometry args={[0.03 * kk, 0.1 * kk * fl, 10]} />
              <meshStandardMaterial color="#ff7a2a" emissive={PAL.fire} emissiveIntensity={4} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.03 * kk, 0]}>
              <sphereGeometry args={[0.018 * kk, 12, 10]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffc04a" emissiveIntensity={5} toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} renderOrder={4}>
              <planeGeometry args={[0.42 * kk, 0.42 * kk]} />
              <meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- paper tags
type TagSpec = { at: LL; off: [number, number]; lift: number; title: string; sub?: string; w: number; accent?: string; big?: boolean };
const tagTex = (title: string, sub: string | undefined, w: number, H: number, accent: string | undefined, big: boolean) =>
  canvasTex(`tag:${title}:${sub}:${w}:${accent}:${big}`, 1024, Math.round(1024 * (H / w)), (c) => {
    const cw = 1024, ch = Math.round(1024 * (H / w));
    const pad = 26;
    c.shadowColor = "rgba(244,234,210,0.95)";
    c.shadowBlur = 30;
    rr(c, pad, pad, cw - 2 * pad, ch - 2 * pad, 26);
    c.fillStyle = PAL.cream;
    c.fill();
    c.shadowBlur = 0;
    c.lineWidth = 6;
    c.strokeStyle = PAL.ink;
    rr(c, pad + 14, pad + 14, cw - 2 * pad - 28, ch - 2 * pad - 28, 16);
    c.stroke();
    c.fillStyle = PAL.ink;
    c.textAlign = "center";
    c.textBaseline = "middle";
    let ts = sub ? (big ? ch * 0.24 : ch * 0.3) : ch * 0.5;
    c.font = `600 ${ts}px ${FONT}`;
    ls(c, ts * 0.08);
    while (c.measureText(title).width > cw - 2 * pad - 110) {
      ts *= 0.95;
      c.font = `600 ${ts}px ${FONT}`;
      ls(c, ts * 0.08);
    }
    c.fillText(title, cw / 2, sub ? ch * (big ? 0.27 : 0.36) : ch / 2 + 2);
    if (sub) {
      const bh = ch * (big ? 0.4 : 0.3), by = ch * (big ? 0.46 : 0.52);
      c.fillStyle = accent ?? PAL.border;
      rr(c, pad + 40, by, cw - 2 * pad - 80, bh, 10);
      c.fill();
      c.fillStyle = "#fff6e6";
      let ss = bh * 0.62;
      c.font = `600 ${ss}px ${FONT}`;
      ls(c, ss * 0.04);
      while (c.measureText(sub).width > cw - 2 * pad - 110) {
        ss *= 0.95;
        c.font = `600 ${ss}px ${FONT}`;
        ls(c, ss * 0.04);
      }
      c.fillText(sub, cw / 2, by + bh / 2 + 2);
    }
  });

const Tag: React.FC<TagSpec & { show: number; cam: Cam }> = ({ at, off, lift, title, sub, w, accent, big = false, show, cam }) => {
  const H = sub ? (big ? 0.82 : 0.42) : 0.34;
  const tex = useMemo(() => tagTex(title, sub, w, H, accent, big), [title, sub, w, H, accent, big]);
  if (show <= 0.01) return null;
  const k = THREE.MathUtils.clamp(cam.d / 9.5, 0.42, 1.25);
  const s = backOut(show) * k;
  const base = v3(at[0], at[1], 0);
  const pos = v3(at[0] + off[0] * k, at[1] + off[1] * k, lift * k);
  const stem = new THREE.Vector3(pos.x - base.x, pos.y - H * 0.35 - base.y, pos.z - base.z);
  return (
    <group>
      <mesh position={[base.x, base.y + 0.03, base.z]} castShadow scale={Math.max(0.01, Math.min(1, show * 3) * Math.max(0.6, k))}>
        <sphereGeometry args={[0.035, 18, 14]} />
        <meshPhysicalMaterial color="#b8892f" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh
        position={[base.x + stem.x / 2, base.y + stem.y / 2, base.z + stem.z / 2]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), stem.clone().normalize())}
        castShadow
      >
        <cylinderGeometry args={[0.006, 0.006, stem.length(), 6]} />
        <meshStandardMaterial color="#3a2f26" />
      </mesh>
      <group position={pos} rotation={new THREE.Euler(-cam.p * 0.78, cam.yaw, 0, "YXZ")} scale={Math.max(0.01, s)}>
        <mesh castShadow renderOrder={6}>
          <planeGeometry args={[w, H]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

const AtlasTag: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex("atlas", 1024, 512, (c) => {
        c.fillStyle = "#c9a46a";
        c.beginPath();
        c.moveTo(150, 20); c.lineTo(1000, 20); c.lineTo(1000, 492); c.lineTo(150, 492); c.lineTo(20, 256); c.closePath();
        c.fill();
        c.strokeStyle = "rgba(60,40,20,0.8)";
        c.lineWidth = 8;
        c.setLineDash([18, 12]);
        c.beginPath();
        c.moveTo(165, 48); c.lineTo(972, 48); c.lineTo(972, 464); c.lineTo(165, 464); c.lineTo(52, 256); c.closePath();
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = "#1b1510";
        c.beginPath(); c.arc(130, 256, 34, 0, Math.PI * 2); c.fill();
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#2a1d12";
        c.font = `600 150px ${FONT}`;
        ls(c, 18);
        c.fillText("AUDIRA", 590, 200);
        c.font = `500 74px ${FONT}`;
        ls(c, 30);
        c.fillText("ATLAS", 590, 345);
      }),
    [],
  );
  const p = v3(105.15, -1.55, 0.2);
  return (
    <mesh position={p} rotation={[-0.62, 0.08, 0.06]} castShadow>
      <planeGeometry args={[1.2, 0.6]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.05} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------------------------------------------------------------- Johor school (illustration)
const School: React.FC<{ show: number; t: number }> = ({ show, t }) => {
  const sign = useMemo(
    () =>
      canvasTex("tutup", 512, 256, (c) => {
        rr(c, 8, 8, 496, 240, 26);
        c.fillStyle = "#9b2226";
        c.fill();
        c.fillStyle = "#fff6e6";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `700 130px ${FONT}`;
        ls(c, 10);
        c.fillText("TUTUP", 256, 136);
      }),
    [],
  );
  if (show <= 0.01) return null;
  const s = Math.max(0.01, backOut(show));
  const p = v3(JOHOR_SCHOOL[0], JOHOR_SCHOOL[1], 0);
  const swing = Math.sin(t * 2.2) * 0.06 * (1 - seg(t, T.johor + 0.4, T.johor + 2.4));
  return (
    <group position={p} scale={s * 1.45} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.26, 0.09, 0.13]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.clay} color="#efe3c8" />
      </mesh>
      <mesh position={[0, 0.115, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.55]} castShadow>
        <coneGeometry args={[0.2, 0.07, 4]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#a4442f" />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.05, 0.066]}>
          <boxGeometry args={[0.045, 0.035, 0.004]} />
          <meshStandardMaterial color="#5c7684" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.033, 0.066]}>
        <boxGeometry args={[0.04, 0.066, 0.004]} />
        <meshStandardMaterial color="#5a3a26" />
      </mesh>
      {/* closed sign on a post */}
      <mesh position={[0.2, 0.06, 0.1]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.12, 6]} />
        <meshStandardMaterial color="#3a2f26" />
      </mesh>
      <mesh position={[0.2, 0.13, 0.1]} rotation={[0, -0.35 + swing, 0]} castShadow>
        <planeGeometry args={[0.16, 0.08]} />
        <meshStandardMaterial map={sign} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- Nor Amira's room (generic figure, illustration)
const NOR_LOOK = { ...lookFromSeed(12, "casual"), height: 1, hairStyle: 1 as const, top: "#7a4e8c", bottom: "#3d3a4a" };
const Room: React.FC<{ t: number; show: number }> = ({ t, show }) => {
  if (show <= 0.01) return null;
  const p = v3(ROOM[0], ROOM[1], 0);
  const s = Math.max(0.01, backOut(show));
  const led = 0.6 + 0.4 * Math.sin(t * 3);
  return (
    <group position={p} scale={s * 1.05} rotation={[0, -0.12, 0]}>
      {/* floor + two low walls: a room cut open on the map */}
      <mesh position={[0, 0.008, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[0.62, 0.016, 0.46]} radius={0.006} />
        <meshPhysicalMaterial {...POLISH.clay} color="#d8c8a8" />
      </mesh>
      <mesh position={[0, 0.09, -0.225]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.62, 0.17, 0.016]} radius={0.006} />
        <meshPhysicalMaterial {...POLISH.clay} color="#ece2cc" />
      </mesh>
      <mesh position={[-0.305, 0.09, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.016, 0.17, 0.46]} radius={0.006} />
        <meshPhysicalMaterial {...POLISH.clay} color="#e4d8be" />
      </mesh>
      {/* window with hazy outside */}
      <mesh position={[0.08, 0.11, -0.215]}>
        <boxGeometry args={[0.2, 0.09, 0.004]} />
        <meshStandardMaterial color="#a9a39a" emissive="#8a837a" emissiveIntensity={0.3} />
      </mesh>
      {/* bed */}
      <mesh position={[-0.17, 0.035, -0.06]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.22, 0.05, 0.3]} radius={0.015} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#8fa3b8" />
      </mesh>
      {/* air purifier with a blue LED */}
      <mesh position={[0.22, 0.055, -0.15]} castShadow>
        <RoundedBoxGeo args={[0.07, 0.11, 0.06]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#f3f1ec" />
      </mesh>
      <mesh position={[0.22, 0.095, -0.118]}>
        <boxGeometry args={[0.04, 0.008, 0.002]} />
        <meshStandardMaterial color="#5fb4ff" emissive="#5fb4ff" emissiveIntensity={2 * led} toneMapped={false} />
      </mesh>
      <ToyPerson f={t * 60} seed={12} look={NOR_LOOK} pose="stand" position={[0.02, 0.016, 0.06]} heading={-0.25} scale={0.24} />
    </group>
  );
};

// ---------------------------------------------------------------- ASEAN treaty sheet + stamp
const Treaty: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(
    () =>
      canvasTex("treaty", 1024, 1280, (c) => {
        c.fillStyle = "#f6eedb";
        c.fillRect(0, 0, 1024, 1280);
        const rnd = prng(66);
        for (let i = 0; i < 30; i++) {
          const x = rnd() * 1024, y = rnd() * 1280, r = 60 + rnd() * 200;
          const g = c.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(170,140,90,${0.05 + rnd() * 0.06})`);
          g.addColorStop(1, "rgba(170,140,90,0)");
          c.fillStyle = g;
          c.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
        c.strokeStyle = PAL.ink;
        c.lineWidth = 6;
        c.strokeRect(40, 40, 944, 1200);
        c.textAlign = "center";
        c.fillStyle = PAL.ink;
        c.font = `700 74px ${FONT}`;
        ls(c, 20);
        c.fillText("ASEAN", 512, 160);
        c.font = `700 62px ${FONT}`;
        ls(c, 4);
        c.fillText("PERSETUJUAN ASEAN", 512, 280);
        c.font = `600 48px ${FONT}`;
        ls(c, 2);
        c.fillText("TENTANG PENCEMARAN ASAP", 512, 350);
        c.fillText("LINTAS BATAS", 512, 412);
        c.fillStyle = "rgba(44,36,29,0.75)";
        c.font = `500 30px ${FONT}`;
        ls(c, 1);
        c.fillText("ASEAN Agreement on Transboundary Haze Pollution", 512, 476);
        c.fillStyle = "rgba(44,36,29,0.22)";
        const r2 = prng(9);
        for (let y = 560; y < 1080; y += 40) {
          const w = 700 + r2() * 160;
          c.fillRect(512 - 420, y, y % 200 === 0 ? w * 0.5 : w, 14);
        }
        c.fillStyle = "rgba(44,36,29,0.6)";
        c.fillRect(150, 1160, 280, 4);
        c.fillRect(594, 1160, 280, 4);
      }),
    [],
  );
  const stamp = useMemo(
    () =>
      canvasTex("stamp", 512, 512, (c) => {
        c.translate(256, 256);
        c.rotate(-0.18);
        c.strokeStyle = "#9b2226";
        c.fillStyle = "#9b2226";
        c.lineWidth = 16;
        c.beginPath(); c.arc(0, 0, 230, 0, Math.PI * 2); c.stroke();
        c.lineWidth = 6;
        c.beginPath(); c.arc(0, 0, 196, 0, Math.PI * 2); c.stroke();
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `700 52px ${FONT}`;
        ls(c, 4);
        c.fillText("DIRATIFIKASI", 0, -70);
        c.font = `700 52px ${FONT}`;
        c.fillText("INDONESIA", 0, -8);
        c.font = `800 104px ${FONT}`;
        ls(c, 6);
        c.fillText("2014", 0, 88);
      }),
    [],
  );
  const show = seg(t, T.indonesia - 0.6, T.perjanjian);
  if (show <= 0.01) return null;
  const p = v3(DOC[0], DOC[1], 0.05);
  const drop = (1 - show) * 0.9;
  const st = seg(t, T.y2014 - 0.05, T.y2014 + 0.22);
  return (
    <group position={[p.x, p.y + drop, p.z]} rotation={[0, 0.08, 0]}>
      <mesh position={[0, -0.012, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.52, 0.02, 1.9]} radius={0.006} />
        <meshPhysicalMaterial {...POLISH.paper} color="#e9dfc7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} receiveShadow>
        <planeGeometry args={[1.5, 1.875]} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} />
      </mesh>
      {st > 0.01 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.36, 0.004 + (1 - st) * 0.25, 0.55]} renderOrder={5} scale={1.6 - 0.6 * st}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshBasicMaterial map={stamp} transparent opacity={0.92 * st} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

// Raised diplomacy arcs (tube that grows, cone head when it lands).
const Arc: React.FC<{ from: LL; to: LL; a: number; b: number; t: number; color: string; height: number }> = ({ from, to, a, b, t, color, height }) => {
  const { geo, curve } = useMemo(() => {
    const p0 = v3(from[0], from[1], 0.04), p1 = v3(to[0], to[1], 0.06);
    const mid = p0.clone().lerp(p1, 0.5);
    mid.y += height;
    const c = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    return { geo: new THREE.TubeGeometry(c, 80, 0.022, 8, false), curve: c };
  }, [from, to, height]);
  const grow = seg(t, a, a + 1.1) * (1 - seg(t, b - 0.4, b));
  const fade = win(t, a, b, 0.2, 0.4);
  if (fade <= 0.01) return null;
  const idx = geo.index!.count;
  geo.setDrawRange(0, Math.max(6, Math.floor((idx * seg(t, a, a + 1.1)) / 6) * 6));
  const head = seg(t, a + 0.9, a + 1.2);
  const hp = curve.getPointAt(1), hd = curve.getTangentAt(1);
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} transparent opacity={Math.max(0.05, fade)} />
      </mesh>
      {head > 0.01 && grow > 0.01 ? (
        <mesh position={hp} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), hd.clone().normalize())} scale={Math.max(0.01, head)} castShadow>
          <coneGeometry args={[0.07, 0.17, 16]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={color} />
        </mesh>
      ) : null}
    </group>
  );
};

// Speech bubbles over the peninsula: "sindiran warganet Malaysia" (no invented comment text).
const Bubbles: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const spots: LL[] = [[101.3, 3.6], [102.2, 4.3], [101.9, 2.9], [102.8, 3.3], [101.0, 4.6], [103.2, 2.3], [102.5, 5.2]];
  return (
    <group>
      {spots.map((ll, i) => {
        const a = T.sindiran - 0.3 + i * 0.11;
        const s = backOut(seg(t, a, a + 0.35)) * (1 - seg(t, SEC.PAYOFF[0] - 0.2, SEC.PAYOFF[0] + 0.4));
        if (s <= 0.01) return null;
        const p = v3(ll[0], ll[1], 0.32 + Math.sin(t * 2 + i) * 0.015);
        return (
          <group key={i} position={p} rotation={new THREE.Euler(-cam.p * 0.6, cam.yaw, 0, "YXZ")} scale={s * (0.85 + (i % 3) * 0.12)}>
            <mesh castShadow>
              <RoundedBoxGeo args={[0.3, 0.17, 0.035]} radius={0.04} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color={i % 3 === 0 ? "#f4ead2" : "#efe0bd"} />
            </mesh>
            <mesh position={[-0.07, -0.1, 0]} rotation={[0, 0, 0.5]} castShadow>
              <coneGeometry args={[0.03, 0.07, 3]} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color={i % 3 === 0 ? "#f4ead2" : "#efe0bd"} />
            </mesh>
            {[-0.07, 0, 0.07].map((x, j) => (
              <mesh key={j} position={[x, 0, 0.02 + 0.003 * Math.sin(t * 9 + j + i)]}>
                <sphereGeometry args={[0.018, 12, 10]} />
                <meshStandardMaterial color={PAL.ink} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- case folders (payoff)
const FOREIGN = new Set([3, 8, 11, 17]);
const folderLabel = () =>
  canvasTex("folder", 512, 340, (c) => {
    c.fillStyle = "#f6eedb";
    rr(c, 10, 10, 492, 320, 18);
    c.fill();
    c.fillStyle = PAL.ink;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `700 62px ${FONT}`;
    ls(c, 6);
    c.fillText("TERSANGKA", 256, 90);
    c.fillStyle = "rgba(44,36,29,0.3)";
    c.fillRect(70, 170, 372, 26);
    c.fillRect(70, 230, 260, 26);
  });
const Folders: React.FC<{ t: number }> = ({ t }) => {
  const label = useMemo(() => folderLabel(), []);
  const grain = useSurfaceGrain(91, 0.25, 4);
  const cells = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        return { i, ll: [FOLDER_C[0] + (col - 2) * 0.52, FOLDER_C[1] + (1.5 - row) * 0.44] as LL };
      }),
    [],
  );
  const vis = 1 - seg(t, SEC.OUTRO[0] - 0.4, SEC.OUTRO[0] + 0.6);
  if (t < T.bareskrim - 0.2 || vis <= 0.01) return null;
  const tray = v3(FOLDER_C[0], FOLDER_C[1], 0.0);
  const ts = Math.max(0.01, seg(t, T.bareskrim - 0.2, T.bareskrim + 0.3) * vis);
  return (
    <group>
      <mesh position={[tray.x, tray.y + 0.012, tray.z]} scale={[ts, 1, ts]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.75, 0.024, 1.25]} radius={0.016} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#3b2a20" />
      </mesh>
      {cells.map(({ i, ll }) => {
        const a = T.bareskrim + 0.25 + i * 0.075;
        const d = seg(t, a, a + 0.35);
        if (d <= 0.01) return null;
        const foreign = FOREIGN.has(i);
        const hi = foreign ? seg(t, T.empat + (i % 4) * 0.08, T.empat + 0.5 + (i % 4) * 0.08) : 0;
        const dim = foreign ? 0 : seg(t, T.empat, T.empat + 0.5) * 0.45;
        const red = seg(t, T.nama + i * 0.03, T.nama + 0.3 + i * 0.03);
        const p = v3(ll[0], ll[1], 0.02 + (1 - d) * 0.8 + hi * 0.09);
        return (
          <group key={i} position={p} rotation={[0, ((i * 37) % 9) * 0.012 - 0.05, 0]} scale={vis * 0.72}>
            <mesh castShadow receiveShadow>
              <RoundedBoxGeo args={[0.34, 0.03, 0.25]} radius={0.008} />
              <meshPhysicalMaterial {...POLISH.paper} roughnessMap={grain} color={new THREE.Color(foreign ? "#d9b878" : "#cfb27a").lerp(new THREE.Color("#5a5048"), dim)} />
            </mesh>
            <mesh position={[-0.09, 0.006, -0.135]} castShadow>
              <RoundedBoxGeo args={[0.11, 0.022, 0.04]} radius={0.006} />
              <meshPhysicalMaterial {...POLISH.paper} color={foreign ? new THREE.Color("#cfb27a").lerp(new THREE.Color("#9b2226"), hi) : "#cfb27a"} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.017, 0.01]}>
              <planeGeometry args={[0.28, 0.186]} />
              <meshStandardMaterial map={label} roughness={0.9} color={new THREE.Color("#ffffff").lerp(new THREE.Color("#6b625a"), dim)} />
            </mesh>
            {red > 0.01 ? (
              <mesh position={[-0.122 + 0.105 * red, 0.021, 0.035]} scale={[Math.max(0.01, red), 1, 1]}>
                <boxGeometry args={[0.21, 0.004, 0.05]} />
                <meshStandardMaterial color="#14100c" roughness={0.6} />
              </mesh>
            ) : null}
            {hi > 0.01 ? (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} renderOrder={4}>
                <planeGeometry args={[0.6 * hi, 0.5 * hi]} />
                <meshBasicMaterial map={radial("220,60,50", 0.8)} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- scene
const RIAU_RING: LL[] = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return [101.85 + Math.cos(a) * 1.25, 0.45 + Math.sin(a) * 1.0] as LL;
});

export const FilmScene: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const cam = camAt(t);
  // thinner smoke in the close shots so the city and the tags stay readable
  const density = Math.max(THREE.MathUtils.clamp(0.55 + (cam.d - 3.5) * 0.08, 0.55, 1), 0.9 * (1 - seg(t, T.padahal, T.padahal + 1.2)));
  const cross = win(t, T.menyeberang - 0.3, T.johor, 0.4, 0.8) + win(t, T.asapO, SEC.OUTRO[1] + 0.2, 0.4, 0.5) * 0.8;
  const tagOn = (a: number, b: number) => win(t, a, b, 0.35, 0.3);
  const kal = seg(t, T.kalimantan - 0.4, T.kalimantan + 0.3);
  return (
    <>
      <CameraRig cam={cam} />
      <ambientLight intensity={0.35} color="#ffe9cf" />
      <hemisphereLight args={["#fff1dc", "#2a2018", 0.45]} />
      <directionalLight
        position={[-4.5, 8, 3.5]}
        intensity={2.4}
        color="#ffe6c4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
      />
      <directionalLight position={[5, 3, -2]} intensity={0.45} color="#9fb8d6" />
      <pointLight position={[wx(104.6), 0.6, wz(-2.6)]} intensity={1.6} distance={2.6} color="#ff7a30" />
      <Table />
      <PaperMap />
      <Dashes pts={BORDER_MAIN} dash={0.07} gap={0.05} w={0.026} color={PAL.border} glow={cross} />
      <Dashes pts={BORDER_JOHOR} dash={0.04} gap={0.03} w={0.018} color={PAL.border} glow={cross} />
      <Dashes pts={RIAU_RING} dash={0.06} gap={0.05} w={0.02} color="#2f6b4f" glow={0.4} closed show={seg(t, T.riau - 0.2, T.nol + 0.3) * (1 - seg(t, T.dinkes, T.dinkes + 0.6))} />
      <Fires t={t} kal={kal} />
      <WindChevrons t={t} show={win(t, T.terbawa - 0.2, T.dinkes + 0.5, 0.4, 0.6) + win(t, T.asapO, TOTAL, 0.5, 0.2) * 0.8} />
      <PuffLayer t={t} layer={0} cam={cam} density={density} />
      <PuffLayer t={t} layer={1} cam={cam} density={density} />
      <PuffLayer t={t} layer={2} cam={cam} density={density} />
      <SmokeHeads t={t} />
      <School show={win(t, T.sekolah - 0.3, T.kepada, 0.4, 0.5)} t={t} />
      <Room t={t} show={win(t, T.kepada, SEC.PENJELASAN[0] + 0.5, 0.5, 0.6)} />
      <Treaty t={t} />
      <Arc from={KL} to={[107.45, 5.05]} a={T.myBawa} b={SEC.PENJELASAN[1]} t={t} color="#9b2226" height={0.9} />
      <Arc from={JAKARTA} to={[108.0, 4.4]} a={T.kemlu} b={SEC.PENJELASAN[1]} t={t} color="#2f6b4f" height={1.3} />
      <Bubbles t={t} cam={cam} />
      <Folders t={t} />
      <AtlasTag />
      {/* place tags (paper, pinned) */}
      <Tag cam={cam} show={tagOn(-1, T.bergerak + 0.6)} at={PEKANBARU} off={[-0.75, -0.55]} lift={0.36} title="PEKANBARU" sub="RIAU · 56 HARI BERASAP" w={1.25} big />
      <Tag cam={cam} show={tagOn(T.bergerak + 0.6, TOTAL) * (1 - win(t, T.perjanjian, SEC.PAYOFF[1], 0.3, 0.3))} at={PEKANBARU} off={[-0.6, -0.35]} lift={0.24} title="PEKANBARU" w={0.8} />
      <Tag cam={cam} show={tagOn(T.sumsel - 0.1, T.bergerak)} at={SUMSEL} off={[-0.25, -1.0]} lift={0.22} title="SUMSEL" sub="TITIK API" w={0.72} accent="#c2410c" />
      <Tag cam={cam} show={tagOn(T.jambi - 0.1, T.bergerak)} at={JAMBI} off={[-0.95, -0.35]} lift={0.2} title="JAMBI" sub="TITIK API" w={0.66} accent="#c2410c" />
      <Tag cam={cam} show={tagOn(T.bengkulu - 0.1, T.bergerak)} at={[102.26, -3.8]} off={[-1.0, 0.6]} lift={0.18} title="BENGKULU" sub="TITIK API" w={0.74} accent="#c2410c" />
      <Tag cam={cam} show={tagOn(T.riau - 0.1, T.dinkes)} at={[102.3, 0.2]} off={[0.55, -0.25]} lift={0.26} title="RIAU" sub="0 TITIK PANAS" w={0.82} accent="#2f6b4f" />
      <Tag cam={cam} show={tagOn(T.batam - 0.1, T.sekolah)} at={BATAM} off={[0.5, -0.95]} lift={0.24} title="BATAM" sub="ISPU 240" w={0.72} accent="#9b2226" />
      <Tag cam={cam} show={tagOn(T.sumatra - 0.1, T.sekolah)} at={[101.3, 1.0]} off={[-1.3, -0.4]} lift={0.3} title="DARI SUMATRA" w={1.15} />
      <Tag cam={cam} show={tagOn(T.kalimantan - 0.1, T.kasus)} at={[109.9, 0.2]} off={[-0.1, -0.9]} lift={0.3} title="DARI KALIMANTAN" w={1.3} />
      <Tag cam={cam} show={tagOn(T.malaysia - 0.2, T.kepada) + tagOn(SEC.PENJELASAN[0], T.myBawa - 0.2) + tagOn(SEC.OUTRO[0], TOTAL)} at={KL} off={[-0.85, 0.1]} lift={0.26} title="MALAYSIA" w={1.1} />
      <Tag cam={cam} show={tagOn(T.malaysia, T.sekolah - 0.1) + tagOn(SEC.OUTRO[0], TOTAL)} at={SINGAPORE} off={[0.75, 0.55]} lift={0.26} title="SINGAPURA" w={1.1} />
      <Tag cam={cam} show={tagOn(T.johor - 0.15, T.kepada)} at={[103.76, 1.49]} off={[0.55, -0.55]} lift={0.3} title="JOHOR" sub="SEKOLAH DITUTUP" w={0.95} accent="#9b2226" />
      <Tag cam={cam} show={tagOn(T.myBawa - 0.2, T.diTengah)} at={KL} off={[-0.85, 0.1]} lift={0.26} title="MALAYSIA" sub="BAWA KE MENLU ASEAN" w={1.2} accent="#9b2226" />
      <Tag cam={cam} show={tagOn(T.kemlu - 0.1, T.diTengah)} at={JAKARTA} off={[-0.9, 0.35]} lift={0.3} title="KEMLU RI" sub="BERKOMITMEN" w={1.0} accent="#2f6b4f" />
      <Tag cam={cam} show={tagOn(T.diTengah, SEC.PAYOFF[0])} at={KL} off={[-0.85, 0.1]} lift={0.26} title="MALAYSIA" w={1.1} />
      <Finish frame={frame} background={PAL.table} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} />
    </>
  );
};
