// AE-054 film (HISTORYMAP): one world on a dark table. The old relief war map of Germany from the
// cover, and a 1 m = 0.05 Autobahn diorama tile lying in front of it (driving on the right, fast
// lane on the left). The camera moves between road level and the map; every cut is driven by
// timeline.json (Audio Master Clock). No audio in the composition.

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import TL from "./timeline.json";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { prng } from "../../core/materials/textures.ts";
import { Outro } from "../_shared/Outro.tsx";
import {
  CITY,
  GERMANY,
  LabelPlate,
  MapSheet,
  MONO,
  Network,
  PAL,
  Sign130,
  Sign282,
  TITLE,
  DeskTools,
  heightAt,
  labelTex,
  proj,
} from "./Cover.tsx";
import {
  Balance,
  Barrel,
  OilSlab,
  ArchiveSheet,
  Car,
  CarPiece,
  FlatArrow,
  FuelPump,
  Gantry,
  RX,
  RY,

  RoadSign,
  RoadTile,
  RoundPiece,
  Truck,
  Weight,
  laneN,
  laneP,
  useFaces,
} from "./props.tsx";

// ---------- timeline ----------
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
export const TOTAL = TL.total as number;
const clip = (id: string) => CLIPS.find((c) => c.id === id)!;
/** Start time of the first word in clip `id` that starts with `prefix` (case-insensitive). */
const wf = (id: string, prefix: string, nth = 0) => {
  const ws = clip(id).words.filter((w) => w.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return ws[Math.min(nth, ws.length - 1)].s;
};
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

const T = {
  crane: clip("l02").start,
  bukan: wf("l02", "bukan"),
  mapA: SEC.KONTEKS[0],
  luar: wf("l03", "luar"),
  seratus1: wf("l03", "seratus"),
  tapi: wf("l03", "tapi"),
  autobahn: wf("l03", "autobahn"),
  dikecualikan: wf("l03", "dikecualikan"),
  mobil: clip("l04").start,
  anjuran1: wf("l04", "anjuran"),
  mek: SEC.MEKANISME[0],
  krisis: wf("l05", "krisis"),
  tujuh: wf("l05", "tujuh"),
  l06: clip("l06").start,
  wajib: wf("l06", "wajib"),
  seratus2: wf("l06", "seratus", 0),
  sekitar: wf("l06", "sekitar"),
  hari: wf("l06", "hari"),
  diganti: wf("l06", "diganti"),
  anjuran2: wf("l06", "anjuran"),
  l07: clip("l07").start,
  puluh7: wf("l07", "puluh"),
  tidak: wf("l07", "tidak"),
  l08: clip("l08").start,
  celaka: wf("l08", "celaka"),
  ikut: wf("l08", "ikut"),
  menanggung: wf("l08", "menanggung"),
  walau: wf("l08", "walau"),
  rev: SEC.REVEAL[0],
  kondisi0: clip("l10").start,
  disesuaikan: wf("l10", "disesuaikan"),
  truk: wf("l10", "truk"),
  maksimal: wf("l10", "maksimal"),
  dan: wf("l10", "dan"),
  menyalip: wf("l10", "menyalip"),
  kiri: wf("l10", "kiri"),
  pay: SEC.PAYOFF[0],
  data: wf("l11", "data"),
  tahun: wf("l11", "tahun"),
  sekitar2: wf("l11", "sekitar"),
  persen: wf("l11", "persen"),
  anjuran3: wf("l11", "anjuran"),
  l12: clip("l12").start,
  rambu: wf("l12", "rambu"),
  papan: wf("l12", "papan"),
  out: SEC.OUTRO[0],
  aturan: wf("l13", "aturan"),
  ini: clip("l14").start,
};

// ---------- small math ----------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const sm = (x: number) => x * x * (3 - 2 * x);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
type V3 = [number, number, number];
const mix3 = (a: V3, b: V3, u: number): V3 => [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
const bez3 = (p0: V3, p1: V3, p2: V3, p3: V3, u: number): V3 => {
  const v = 1 - u;
  return [0, 1, 2].map((i) => v * v * v * p0[i] + 3 * v * v * u * p1[i] + 3 * v * u * u * p2[i] + u * u * u * p3[i]) as V3;
};
const pop = (t: number, t0: number, d = 0.35) => {
  const x = clamp01((t - t0) / d);
  if (x <= 0) return 0;
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// ---------- vehicles ----------
const xTruck = (t: number) => -2.0 + (t - T.truk) * 0.7;
const xCarB = (t: number) => xTruck(T.dan) - 0.95 + (t - T.dan) * 1.6;
const zCarB = (t: number) => {
  const out = sm(ramp(t, T.dan + 0.25, T.dan + 0.75));
  const back = sm(ramp(t, T.kiri + 0.25, T.kiri + 0.85));
  return mix(laneP(2), laneP(1), out * (1 - back));
};
const xHero = (t: number) => -2.6 + (t - T.l07) * 1.55;
type Traffic = { dir: 1 | -1; lane: number; v: number; x0: number; color: string; truck?: boolean };
const TRAFFIC: Traffic[] = [
  { dir: 1, lane: 0, v: 1.45, x0: -6, color: "#C9C3B4" },
  { dir: 1, lane: 0, v: 1.45, x0: 1.2, color: "#2B2B2E" },
  { dir: 1, lane: 1, v: 1.05, x0: -3.2, color: "#8C2A22" },
  { dir: 1, lane: 1, v: 1.05, x0: 4.4, color: "#E5E1D6" },
  { dir: 1, lane: 2, v: 0.62, x0: -1.4, color: "#3E6A4A", truck: true },
  { dir: 1, lane: 2, v: 0.62, x0: 6.5, color: "#7A5C2E", truck: true },
  { dir: -1, lane: 0, v: 1.4, x0: 3.0, color: "#4E5D73" },
  { dir: -1, lane: 0, v: 1.4, x0: -5.0, color: "#B8B2A2" },
  { dir: -1, lane: 1, v: 1.05, x0: -1.0, color: "#6F2420" },
  { dir: -1, lane: 1, v: 1.05, x0: 6.0, color: "#2F3A44" },
  { dir: -1, lane: 2, v: 0.62, x0: 1.8, color: "#8A3B2C", truck: true },
];
const wrap = (x: number) => ((((x + RX) % (2 * RX)) + 2 * RX) % (2 * RX)) - RX;

// ---------- shots ----------
type Cam = { pos: V3; target: V3; fov: number };
type ShotId =
  | "hook" | "crane" | "mapA" | "sign130" | "oil" | "map1973" | "speed" | "scale" | "roadRev" | "fog" | "truck" | "overtake"
  | "payoff" | "gantry" | "outro";
const SHOTS: [ShotId, number][] = [
  ["hook", 0],
  ["crane", T.crane],
  ["mapA", T.mapA],
  ["sign130", T.mobil],
  ["oil", T.mek],
  ["map1973", T.l06],
  ["speed", T.l07],
  ["scale", T.l08],
  ["roadRev", T.rev],
  ["fog", T.kondisi0],
  ["truck", T.truk],
  ["overtake", T.dan],
  ["payoff", T.pay],
  ["gantry", T.l12],
  ["outro", T.out],
];
const shotAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k][1]) i = k;
  const t0 = SHOTS[i][1];
  const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][1] : TOTAL;
  return { id: SHOTS[i][0], t0, t1, u: clamp01((t - t0) / (t1 - t0)) };
};
/** Hard cuts get a paper flash; the crane is continuous out of the hook. */
const CUTS = SHOTS.filter(([id]) => id !== "hook" && id !== "crane").map(([, t]) => t);

const COVER_CAM: Cam = { pos: [0.0, 10.6, 8.3], target: [0, 0, 0.42], fov: 30 };
const MAP_A0: Cam = { pos: [0.25, 9.6, 8.9], target: [0.03, 0, 0.6], fov: 30 };
const HOOK_END: Cam = { pos: [-0.95, 0.088, 6.93], target: [-0.05, 0.13, 6.98], fov: 40 };

const P282 = { x: 0.95, z: 2.1 };
const P130 = { x: -0.95, z: 2.05 };
const SCALE_AT: V3 = [-2.55, 0, 3.15];
const OIL_AT: V3 = [2.5, 0, 3.35];
const GX = 0.85;
const RZ_ = 6.2; // gantry x on the road tile
const SIGN282_X = -0.2; // road sign "end of all limits"

const cameraFor = (id: ShotId, u: number, t: number): Cam => {
  switch (id) {
    case "hook": {
      const e = eio(u);
      return { pos: mix3([-1.62, 0.082, 6.94], HOOK_END.pos, e), target: mix3([0.0, 0.12, 6.97], HOOK_END.target, e), fov: 40 };
    }
    case "crane": {
      const e = eio(u);
      const pos = bez3(HOOK_END.pos, [-0.7, 0.5, 7.4], [0.6, 5.2, 10.6], MAP_A0.pos, e);
      return { pos, target: mix3(HOOK_END.target, MAP_A0.target, sm(clamp01(e * 1.15))), fov: mix(40, 30, e) };
    }
    case "mapA":
      return { pos: mix3(MAP_A0.pos, [0.0, 9.9, 8.1], sm(u)), target: mix3(MAP_A0.target, [0, 0, 0.45], sm(u)), fov: 30 };
    case "sign130": {
      const e = sm(u);
      return { pos: mix3([0.55, 3.0, 6.5], [0.2, 2.5, 5.7], e), target: mix3([-0.85, 0.65, 2.2], [-0.95, 0.75, 2.15], e), fov: 32 };
    }
    case "oil": {
      const a = mix(0.95, -0.35, sm(u));
      const r = 3.3;
      return { pos: [OIL_AT[0] + Math.sin(a) * r, 1.7, OIL_AT[2] + Math.cos(a) * r], target: [OIL_AT[0] - 0.05, 0.35, OIL_AT[2]], fov: 34 };
    }
    case "map1973":
      return { pos: mix3([-1.0, 8.6, 7.6], [-0.4, 9.4, 8.0], sm(u)), target: mix3([0.1, 0, 0.2], [0, 0, 0.35], sm(u)), fov: 30 };
    case "speed": {
      const x = xHero(t);
      return { pos: [x - 0.62, 0.17, laneP(0) - 0.2], target: [x + 0.35, 0.09, laneP(0) + 0.02], fov: 38 };
    }
    case "scale": {
      const e = sm(u);
      return {
        pos: mix3([SCALE_AT[0] + 2.2, 2.65, SCALE_AT[2] + 4.95], [SCALE_AT[0] + 1.75, 2.35, SCALE_AT[2] + 4.4], e),
        target: [SCALE_AT[0] + 0.05, 0.55, SCALE_AT[2]],
        fov: 32,
      };
    }
    case "roadRev": {
      const e = eio(u);
      return { pos: mix3([-1.7, 1.5, 8.7], [-1.25, 0.45, 7.55], e), target: mix3([0.3, 0, 6.3], [0.4, 0.06, 6.45], e), fov: 36 };
    }
    case "fog": {
      const e = sm(u);
      return { pos: mix3([-1.2, 0.2, 6.98], [-0.85, 0.18, 6.95], e), target: [0.6, 0.08, 6.5], fov: 38 };
    }
    case "truck": {
      const x = xTruck(t);
      return { pos: [x - 1.05, 0.2, laneP(2) - 0.3], target: [x - 0.25, 0.1, laneP(2) - 0.02], fov: 38 };
    }
    case "overtake": {
      const x = xTruck(t);
      return { pos: [x - 1.75, 1.25, laneP(1) + 0.08], target: [x + 0.45, 0.0, laneP(1)], fov: 36 };
    }
    case "payoff":
      return { pos: mix3([0.2, 8.9, 7.4], [0.0, 10.1, 7.9], sm(u)), target: mix3([0.05, 0, 0.3], [0, 0, 0.45], sm(u)), fov: 30 };
    case "gantry": {
      const e = sm(u);
      return { pos: mix3([GX - 2.1, 0.15, laneP(1)], [GX - 1.7, 0.15, laneP(1)], e), target: [GX + 0.6, 0.25, laneP(2)], fov: 40 };
    }
    case "outro": {
      const e = eio(clamp01(u * 1.3));
      return { pos: mix3([0.05, 9.5, 7.5], COVER_CAM.pos, e), target: mix3([0.0, 0, 0.6], COVER_CAM.target, e), fov: 30 };
    }
  }
};

const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.near = 0.01;
    c.far = 80;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const projector = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 80);
const project = (cam: Cam, p: V3, w: number, h: number) => {
  projector.fov = cam.fov;
  projector.aspect = w / h;
  projector.position.set(...cam.pos);
  projector.lookAt(...cam.target);
  projector.updateProjectionMatrix();
  projector.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projector);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front: v.z < 1 };
};

// ---------- map extras ----------
const inPoly = (lon: number, lat: number) => {
  let inside = false;
  for (let i = 0, j = GERMANY.length - 1; i < GERMANY.length; j = i++) {
    const [xi, yi] = GERMANY[i], [xj, yj] = GERMANY[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
/** Secondary (country) roads: seeded towns inside Germany, each joined to its 2 nearest. */
const LAND = (() => {
  const rnd = prng(1907);
  const towns: [number, number][] = [];
  while (towns.length < 26) {
    const lon = 6.3 + rnd() * 8.4, lat = 47.7 + rnd() * 6.6;
    if (inPoly(lon, lat)) towns.push([lon, lat]);
  }
  const segs: [V3[], number][] = [];
  const seen = new Set<string>();
  towns.forEach((a, i) => {
    const near = towns
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1]) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of near) {
      const key = [i, j].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      const [ax, az] = proj(...a), [bx, bz] = proj(...towns[j]);
      const pts: V3[] = [];
      for (let k = 0; k <= 6; k++) {
        const u = k / 6;
        const wob = Math.sin(u * Math.PI) * (rnd() - 0.5) * 0.08;
        const x = mix(ax, bx, u) + wob, z = mix(az, bz, u) - wob;
        pts.push([x, heightAt(x, z) + 0.012, z]);
      }
      segs.push([pts, segs.length]);
    }
  });
  return segs;
})();
const LandRoads: React.FC<{ hot: number; vis: number }> = ({ hot, vis }) => {
  const curves = useMemo(() => LAND.map(([pts]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))), []);
  if (vis <= 0) return null;
  const col = new THREE.Color("#5A3A22").lerp(new THREE.Color("#C3272B"), hot);
  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 24, 0.009 * vis, 6, false]} />
          <meshStandardMaterial color={col} emissive="#FF2A2A" emissiveIntensity={hot * 0.7} toneMapped={false} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};
const LAND_PIECES = [2, 7, 12, 17, 22].map((i) => LAND[i % LAND.length][0][3]);
const routeMid = (a: string, b: string): [number, number] => {
  const [ax, az] = proj(...CITY[a]);
  const [bx, bz] = proj(...CITY[b]);
  return [(ax + bx) / 2, (az + bz) / 2];
};
const AUTO_PIECES = [routeMid("HH", "H"), routeMid("H", "KS"), routeMid("B", "L"), routeMid("N", "M"), routeMid("K", "F"), routeMid("F", "WU"), routeMid("DO", "H")];

/** Bigger city tags than the cover (cover weakness): Stuttgart/München pulled apart. */
const FILM_LABELS: [string, string, number, number][] = [
  ["B", "Berlin", 0.38, 0.0], ["HH", "Hamburg", -0.46, -0.06], ["H", "Hannover", 0.36, -0.12], ["K", "Köln", -0.06, 0.2],
  ["F", "Frankfurt", 0.42, -0.08], ["L", "Leipzig", 0.0, -0.17], ["N", "Nürnberg", 0.44, -0.08],
  ["S", "Stuttgart", -0.36, 0.2], ["M", "München", 0.44, 0.16],
];
const FilmCityLabels: React.FC<{ vis: number }> = ({ vis }) => {
  const items = useMemo(
    () =>
      FILM_LABELS.map(([id, name, dx, dz]) => {
        const [x, z] = proj(...CITY[id]);
        return { name, tex: labelTex(name), pos: [x + dx, heightAt(x + dx, z + dz) + 0.08, z + dz] as V3 };
      }),
    [],
  );
  if (vis <= 0) return null;
  return (
    <group>
      {items.map(({ name, tex, pos }) => (
        <mesh key={name} position={pos} rotation={[-Math.PI / 2 + 0.5, 0, 0]}>
          <planeGeometry args={[0.86, 0.19]} />
          <meshBasicMaterial map={tex} transparent opacity={vis} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Painted diorama backdrop at both road ends: warm haze horizon fading to the dark room. */
const backdropTex = () => {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#151A21");
  g.addColorStop(0.55, "#4A4438");
  g.addColorStop(0.82, "#B49A72");
  g.addColorStop(1, "#C9B48C");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const Backdrop: React.FC = () => {
  const tex = useMemo(backdropTex, []);
  return (
    <group>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 11, 2.0, RZ_]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[30, 4.2]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- world ----------
const World: React.FC<{ t: number; id: ShotId }> = ({ t, id }) => {
  const F = useFaces();
  const onMap = id === "mapA" || id === "sign130" || id === "map1973" || id === "payoff" || id === "outro" || id === "crane";

  // Autobahn network state
  let glow = 1, limMix = 0, redAll = 0;
  if (id === "hook" || id === "crane") glow = 0.12;
  if (id === "mapA") glow = mix(0.12, 1, sm(ramp(t, T.autobahn, T.autobahn + 0.6)));
  if (id === "map1973") redAll = sm(ramp(t, T.wajib, T.wajib + 0.5)) * (1 - sm(ramp(t, T.diganti, T.diganti + 0.6)));
  if (id === "payoff") limMix = sm(ramp(t, T.data + 0.2, T.data + 1.1));
  if (id === "outro" || id === "gantry") limMix = 1;

  const landHot = id === "mapA" ? sm(ramp(t, T.luar - 0.2, T.luar + 0.4)) * (1 - 0.6 * ramp(t, T.autobahn, T.autobahn + 0.6)) : 0;
  const landVis = id === "mapA" ? 1 : 0;

  // map pieces
  const show282 = id === "mapA" || id === "payoff" || id === "outro" || id === "crane";
  const show130 = id === "sign130" || id === "payoff" || id === "outro" || id === "mapA";
  const s130 = id === "mapA" ? pop(t, T.mobil - 0.6) * 0 + 1 : 1;
  const plate = id === "outro" || id === "payoff";

  // balance
  const tipCause = sm(ramp(t, T.celaka, T.celaka + 0.5));
  const drop = ramp(t, T.ikut, T.ikut + 0.35);
  const ang = 0.3 * tipCause - 0.17 * sm(ramp(t, T.ikut + 0.3, T.ikut + 0.9));

  // road vehicles
  const vehicles: React.ReactNode[] = [];
  const special = id === "truck" || id === "overtake";
  TRAFFIC.forEach((v, i) => {
    let x = wrap(v.x0 + v.dir * v.v * t);
    const z = v.dir === 1 ? laneP(v.lane) : laneN(v.lane);
    if (special && v.dir === 1 && Math.abs(x - xTruck(t)) < 2.8) return;
    if (id === "speed" && v.dir === 1 && v.lane === 0 && Math.abs(x - xHero(t)) < 1.6) x += 3.2;
    if (id === "gantry" && v.dir === 1 && v.truck) return;
    if ((id === "hook" || id === "crane") && v.dir === 1 && (v.truck || (x > -2.4 && x < 1.2))) return;
    vehicles.push(
      <group key={i} position={[x, RY, z]} rotation={[0, v.dir === 1 ? 0 : Math.PI, 0]}>
        {v.truck ? <Truck color={v.color} /> : <Car color={v.color} />}
      </group>,
    );
  });
  if (id === "truck" || id === "overtake") {
    vehicles.push(
      <group key="truckHero" position={[xTruck(t), RY, laneP(2)]}>
        <Truck color="#2F5D8A" />
      </group>,
    );
    vehicles.push(
      <group key="carB" position={[xCarB(t), RY, zCarB(t)]} rotation={[0, (zCarB(t + 0.05) - zCarB(t)) * -6, 0]}>
        <Car color="#C29A3A" />
      </group>,
    );
  }
  if (id === "speed") {
    vehicles.push(
      <group key="hero" position={[xHero(t), RY, laneP(0)]}>
        <Car color="#2D5C8F" />
      </group>,
    );
  }

  const ledOn = id === "gantry" ? sm(ramp(t, T.papan, T.papan + 0.25)) : 0;

  return (
    <group>
      <MapSheet />
      <Network glow={glow} limMix={limMix} redAll={redAll} />
      <LandRoads hot={landHot} vis={landVis} />
      <FilmCityLabels vis={onMap ? 1 : 0} />
      <DeskTools />
      {plate && <LabelPlate position={[0, heightAt(0, 1.95) + 0.05, 1.95]} />}

      {show282 && (
        <group position={[P282.x, heightAt(P282.x, P282.z), P282.z]} rotation={[-0.3, -0.2, 0]} scale={0.98}>
          <Sign282 />
        </group>
      )}
      {show130 && (
        <group position={[P130.x, heightAt(P130.x, P130.z), P130.z]} rotation={[-0.3, 0.22, 0]} scale={0.98 * s130}>
          <Sign130 />
        </group>
      )}
      {id === "sign130" && (
        <group position={[-0.55, heightAt(-0.55, 2.35), 2.35]} rotation={[0, 0.5, 0]} scale={pop(t, T.mobil + 0.3)}>
          <CarPiece color="#2D5C8F" />
        </group>
      )}

      {/* KONTEKS: country-road limit pieces (100) */}
      {id === "mapA" &&
        LAND_PIECES.map((p, i) => {
          const s = pop(t, T.seratus1 + i * 0.08) * (1 - ramp(t, T.autobahn, T.autobahn + 0.4));
          if (s <= 0) return null;
          return (
            <group key={i} position={[p[0], p[1] - 0.012, p[2]]} rotation={[-0.35, 0, 0]} scale={0.34 * s}>
              <RoundPiece tex={F.l100} />
            </group>
          );
        })}

      {/* 1973-74: mandatory 100 on the Autobahn, then swapped for the 130 advisory */}
      {id === "map1973" &&
        AUTO_PIECES.map(([x, z], i) => {
          const up = pop(t, T.seratus2 + i * 0.07);
          const swap = sm(ramp(t, T.diganti + i * 0.05, T.diganti + 0.4 + i * 0.05));
          return (
            <group key={i} position={[x, heightAt(x, z), z]} rotation={[-0.35, 0, 0]}>
              {swap < 1 && up > 0 && (
                <group scale={0.36 * up * (1 - swap)}>
                  <RoundPiece tex={F.l100} />
                </group>
              )}
              {swap > 0 && (
                <group scale={0.36 * pop(t, T.diganti + 0.25 + i * 0.05)}>
                  <Sign130 />
                </group>
              )}
            </group>
          );
        })}

      {/* oil crisis set */}
      <group position={OIL_AT}>
        <OilSlab />
        <group position={[-0.62, 0, 0.38]}>
          <ArchiveSheet />
        </group>
        <group position={[0, 0.024, 0]}>
          <FuelPump />
        </group>
        {[
          [0.35, 0.05, "#5A2A22"], [0.58, 0.12, "#3A3F3A"], [0.46, -0.18, "#6A4A22"], [0.25, -0.3, "#5A2A22"],
          [-0.35, 0.18, "#3A3F3A"], [-0.5, -0.05, "#6A4A22"],
        ].map(([x, z, c], i) => (
          <group key={i} position={[x as number, 0.024, z as number]} rotation={[0, i, 0]}>
            <Barrel color={c as string} />
          </group>
        ))}
        <group position={[0.46, 0.364, -0.06]} rotation={[0, 0.4, 0]}>
          <Barrel color="#5A2A22" />
        </group>
      </group>

      {/* liability balance */}
      <group position={SCALE_AT}>
        <Balance
          angle={id === "scale" ? ang : 0.12}
          left={<group rotation={[0, 0.3, 0]} scale={0.95}><CarPiece color="#8C2A22" /></group>}
          right={
            <group>
              <group position={[0.04, 0, 0]} rotation={[0, -0.4, 0]} scale={0.95}>
                <CarPiece color="#2D5C8F" />
              </group>
              {id === "scale" && drop > 0 && (
                <group position={[-0.12, 0.08 + (1 - drop) * 0.6, 0.06]}>
                  <Weight />
                </group>
              )}
            </group>
          }
        />
      </group>

      <Backdrop />
      {/* Autobahn diorama tile */}
      <RoadTile />
      {vehicles}
      {id !== "gantry" && (
        <group position={[SIGN282_X, RY, laneP(2) + 0.26]}>
          <RoadSign tex={F.s282} R={0.055} h={0.14} glow={id === "hook" ? ramp(t, wf("l01", "tanpa"), wf("l01", "tanpa") + 0.4) : 0} />
        </group>
      )}
      {id === "gantry" && (
        <group position={[GX + 1.3, RY, laneP(2) + 0.26]}>
          <RoadSign tex={F.l120} R={0.055} h={0.14} glow={ramp(t, T.rambu, T.rambu + 0.3)} />
        </group>
      )}
      <group position={[GX, 0, 0]}>
        <Gantry led={F.led120} on={ledOn} />
      </group>

      {/* overtaking arrows: left (allowed) and right/shoulder (not allowed) */}
      {id === "overtake" && (
        <group>
          <group position={[xTruck(T.dan) - 1.0, RY + 0.006, laneP(1)]}>
            <FlatArrow length={1.75} width={0.05} color="#FFB300" p={sm(ramp(t, T.menyalip - 0.1, T.menyalip + 0.6))} />
          </group>
          <group position={[xTruck(T.dan) - 1.0, RY + 0.006, laneP(2) + 0.17]}>
            <FlatArrow length={1.4} width={0.035} color="#E0352B" p={sm(ramp(t, T.menyalip + 0.2, T.menyalip + 0.7))} opacity={0.7} />
          </group>
        </group>
      )}
    </group>
  );
};

// ---------- HUD ----------
const Headline: React.FC<{ k: number; t: number; t0: number; t1: number; kicker?: string; text: string; accent?: string; top?: number }> = ({
  k, t, t0, t1, kicker, text, accent = PAL.amber, top = 262,
}) => {
  const a = ramp(t, t0, t0 + 0.25) * (1 - ramp(t, t1 - 0.2, t1));
  if (a <= 0) return null;
  const y = (1 - sm(ramp(t, t0, t0 + 0.35))) * 26;
  return (
    <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: (top + y) * k, opacity: a }}>
      {kicker && (
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26 * k, letterSpacing: 5 * k, color: accent, marginBottom: 10 * k, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 86 * k, lineHeight: 1.0, color: PAL.cream, textTransform: "uppercase", textShadow: "0 6px 22px rgba(0,0,0,0.75)" }}>
        {text}
      </div>
    </div>
  );
};

const Stamp: React.FC<{ k: number; t: number; t0: number; t1: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number }> = ({
  k, t, t0, t1, text, x, y, color = "#C3272B", rot = -6, size = 58,
}) => {
  const p = pop(t, t0, 0.3);
  const a = Math.min(1, p) * (1 - ramp(t, t1 - 0.2, t1));
  if (a <= 0) return null;
  const s = 1.6 - 0.6 * Math.min(1, p);
  return (
    <div
      style={{
        position: "absolute",
        left: x * k,
        top: y * k,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: a,
        border: `${6 * k}px solid ${color}`,
        outline: `${2 * k}px solid ${color}`,
        outlineOffset: `${5 * k}px`,
        padding: `${6 * k}px ${22 * k}px`,
        fontFamily: TITLE,
        fontWeight: 700,
        fontSize: size * k,
        letterSpacing: 2 * k,
        color,
        background: "rgba(236,222,186,0.88)",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

const Tag: React.FC<{ k: number; x: number; y: number; a: number; text: string; sub?: string; color?: string; side?: "up" | "left" | "right" }> = ({ k, x, y, a, text, sub, color = PAL.amber, side = "up" }) => {
  if (a <= 0) return null;
  if (side !== "up") {
    const L = side === "left";
    return (
      <div style={{ position: "absolute", left: L ? Math.max(x, 420 * k) : Math.min(x, 560 * k), top: y, transform: `translate(${L ? "-100%" : "0"},-50%) translateX(${(L ? -1 : 1) * (24 + (1 - a) * 14) * k}px)`, opacity: a, display: "flex", alignItems: "center", flexDirection: L ? "row" : "row-reverse" }}>
        <div style={{ background: "rgba(14,17,22,0.86)", borderLeft: `${6 * k}px solid ${color}`, padding: `${8 * k}px ${16 * k}px`, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 40 * k, color: PAL.cream, lineHeight: 1.05 }}>{text}</div>
          {sub && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 21 * k, color, marginTop: 4 * k }}>{sub}</div>}
        </div>
        <div style={{ width: 30 * k, height: 3 * k, background: color }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: Math.min(Math.max(x, 230 * k), 850 * k), top: Math.max(y, 330 * k), transform: `translate(-50%,-100%) translateY(${(1 - a) * 14 * k}px)`, opacity: a, textAlign: "center" }}>
      <div style={{ background: "rgba(14,17,22,0.86)", borderLeft: `${6 * k}px solid ${color}`, padding: `${8 * k}px ${16 * k}px`, whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 40 * k, color: PAL.cream, lineHeight: 1.05 }}>{text}</div>
        {sub && <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 21 * k, color, marginTop: 4 * k }}>{sub}</div>}
      </div>
      <div style={{ width: 3 * k, height: 34 * k, background: color, margin: "0 auto" }} />
    </div>
  );
};

/** Brass instrument speed dial (needle just past 130, neutral tone). */
const Gauge: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const a = ramp(t, T.l07, T.l07 + 0.25) * (1 - ramp(t, T.l08 - 0.2, T.l08));
  if (a <= 0) return null;
  const v = mix(100, 150, sm(ramp(t, T.l07 + 0.2, T.puluh7 + 0.3)));
  const ang = (s: number) => (-225 + (s / 250) * 270) * (Math.PI / 180);
  const R = 150, c = 180;
  const ticks = [];
  for (let s = 0; s <= 250; s += 10) {
    const g = ang(s), big = s % 50 === 0;
    ticks.push(<line key={s} x1={c + Math.cos(g) * (R - (big ? 24 : 12))} y1={c + Math.sin(g) * (R - (big ? 24 : 12))} x2={c + Math.cos(g) * R} y2={c + Math.sin(g) * R} stroke="#2A1A0E" strokeWidth={big ? 5 : 2.5} />);
    if (big)
      ticks.push(
        <text key={`n${s}`} x={c + Math.cos(g) * (R - 50)} y={c + Math.sin(g) * (R - 50) + 9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill="#2A1A0E">
          {s}
        </text>,
      );
  }
  const g130 = ang(130), gv = ang(v);
  return (
    <div style={{ position: "absolute", left: 60 * k, top: 262 * k, width: 360 * k, height: 360 * k, opacity: a }}>
      <svg viewBox="0 0 360 360" width={360 * k} height={360 * k}>
        <circle cx={c} cy={c} r={R + 18} fill="#B8893A" />
        <circle cx={c} cy={c} r={R + 6} fill="#EADBB8" stroke="#6E4E1C" strokeWidth={4} />
        {ticks}
        <line x1={c + Math.cos(g130) * (R - 30)} y1={c + Math.sin(g130) * (R - 30)} x2={c + Math.cos(g130) * (R + 4)} y2={c + Math.sin(g130) * (R + 4)} stroke="#E08A00" strokeWidth={9} />
        <line x1={c} y1={c} x2={c + Math.cos(gv) * (R - 20)} y2={c + Math.sin(gv) * (R - 20)} stroke="#8C1D18" strokeWidth={7} strokeLinecap="round" />
        <circle cx={c} cy={c} r={14} fill="#3A2A1A" />
        <text x={c} y={c + 70} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#2A1A0E">
          km/h
        </text>
      </svg>
    </div>
  );
};

const Counter: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const a = ramp(t, T.sekitar, T.sekitar + 0.2) * (1 - ramp(t, T.diganti - 0.1, T.diganti + 0.2));
  if (a <= 0) return null;
  const n = Math.round(100 * sm(ramp(t, T.sekitar, T.hari + 0.15)));
  return (
    <div style={{ position: "absolute", right: 64 * k, top: 470 * k, opacity: a, textAlign: "right" }}>
      <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 120 * k, color: PAL.cream, lineHeight: 1, textShadow: "0 6px 22px rgba(0,0,0,0.7)" }}>±{n}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 4 * k, color: PAL.amber }}>HARI · BATAS WAJIB 100</div>
    </div>
  );
};

const Legend: React.FC<{ k: number; a: number }> = ({ k, a }) => {
  if (a <= 0) return null;
  const chip = (c: string, label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * k, background: "rgba(14,17,22,0.82)", padding: `${9 * k}px ${14 * k}px`, borderLeft: `${5 * k}px solid ${c}` }}>
      <span style={{ width: 34 * k, height: 7 * k, background: c, boxShadow: `0 0 10px ${c}` }} />
      {label}
    </div>
  );
  return (
    <div style={{ position: "absolute", right: 60 * k, top: 300 * k, opacity: a, fontFamily: MONO, color: PAL.cream, fontSize: 23 * k, fontWeight: 500, display: "flex", flexDirection: "column", gap: 10 * k }}>
      {chip(PAL.amber, "hanya anjuran 130")}
      {chip("#FF3B30", "rambu / papan LED")}
    </div>
  );
};

// karaoke phrases: 3-6 words, break after punctuation
type Phrase = { s: number; e: number; words: Word[] };
const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
      cur = [];
    };
    c.words.forEach((w, i) => {
      cur.push(w);
      const left = c.words.length - i - 1;
      if ((/[,.?!]$/.test(w.w) && cur.length >= 2 && left !== 1) || (cur.length >= 6 && left > 1)) flush();
    });
    flush();
  }
  return out;
})();
const Captions: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  let ph: Phrase | null = null;
  for (let i = 0; i < PHRASES.length; i++) {
    const nx = PHRASES[i + 1];
    const end = nx ? Math.min(nx.s, PHRASES[i].e + 0.6) : PHRASES[i].e + 0.6;
    if (t >= PHRASES[i].s - 0.05 && t < end) ph = PHRASES[i];
  }
  if (!ph || t > OUTRO_AT) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400 * k, display: "flex", justifyContent: "center", padding: `0 ${56 * k}px` }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${4 * k}px ${14 * k}px`,
          background: "rgba(14,17,22,0.84)",
          borderTop: `${3 * k}px solid ${PAL.amber}`,
          padding: `${12 * k}px ${24 * k}px ${14 * k}px`,
          maxWidth: 960 * k,
        }}
      >
        {(ph.words.length <= 4 ? [ph.words] : [ph.words.slice(0, Math.ceil(ph.words.length / 2)), ph.words.slice(Math.ceil(ph.words.length / 2))]).map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 14 * k, width: "100%" }}>
            {line.map((w, i) => {
              const on = t >= w.s && t < w.e + 0.08;
              const past = t >= w.e + 0.08;
              const b = on ? 1 + 0.1 * Math.sin(clamp01((t - w.s) / 0.18) * Math.PI) : 1;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: TITLE,
                    fontWeight: 700,
                    fontSize: 52 * k,
                    lineHeight: 1.12,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: on ? PAL.amber : PAL.cream,
                    opacity: on || past ? 1 : 0.5,
                    transform: `scale(${b}) translateY(${on ? -3 * k : 0}px)`,
                    display: "inline-block",
                    textShadow: on ? `0 0 ${18 * k}px rgba(255,179,0,0.55)` : "none",
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Archive film look for 1973-74: scratches + flicker over the sepia grade. */
const ArchiveFX: React.FC<{ s: number; frame: number; w: number; h: number }> = ({ s, frame, w, h }) => {
  if (s <= 0) return null;
  const rnd = prng(1000 + (frame % 97) * 13);
  const lines = Array.from({ length: 4 }, () => ({ x: rnd() * w, o: 0.15 + rnd() * 0.3, wd: 1 + rnd() * 1.5 }));
  const flick = 0.06 + rnd() * 0.06;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: s }}>
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.x, top: 0, width: l.wd, height: h, background: `rgba(40,25,10,${l.o})` }} />
      ))}
      <AbsoluteFill style={{ background: `rgba(30,18,6,${flick})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(30,18,6,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const Rain: React.FC<{ a: number; frame: number; w: number; h: number }> = ({ a, frame, w, h }) => {
  if (a <= 0) return null;
  const rnd = prng(77 + (frame % 53) * 7);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: a * 0.55 }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = rnd() * w, y = rnd() * h, L = (30 + rnd() * 50) * (w / 1080);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 1.5, height: L, background: "rgba(220,225,230,0.6)", transform: "rotate(12deg)" }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- film ----------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const { id, u } = shotAt(t);
  const cam = useMemo(() => cameraFor(id, u, t), [id, u, t]);

  const sepia = sm(ramp(t, T.mek, T.mek + 0.4)) * (1 - sm(ramp(t, T.diganti, T.diganti + 0.7)));
  const fogA = id === "fog" ? sm(ramp(t, T.kondisi0 + 0.3, T.disesuaikan + 0.3)) : 0;
  const FOG = "#A9A598";

  // paper flash on hard cuts
  let flash = 0;
  for (const c of CUTS) {
    const d = t - c;
    if (d >= 0 && d < 0.22) flash = Math.max(flash, 1 - d / 0.22);
  }

  // anchored tags
  const tag130 = project(cam, [P130.x + 0.36, heightAt(P130.x, P130.z) + 0.2, P130.z], width, height);
  const scaleL = project(cam, [SCALE_AT[0] - 0.62, 0.95, SCALE_AT[2]], width, height);
  const scaleR = project(cam, [SCALE_AT[0] + 0.62, 0.95, SCALE_AT[2]], width, height);
  const ledP = project(cam, [GX, RY + 0.42, laneP(1)], width, height);
  const signP = project(cam, [GX + 1.3, RY + 0.22, laneP(2) + 0.26], width, height);
  const s282 = project(cam, [SIGN282_X, RY + 0.14, laneP(2) + 0.26], width, height);

  return (
    <AbsoluteFill style={{ background: PAL.table }}>
      <AbsoluteFill style={{ filter: sepia > 0 ? `sepia(${0.85 * sepia}) contrast(${1 + 0.08 * sepia}) brightness(${1 - 0.06 * sepia})` : undefined }}>
        <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.01, far: 80 }}>
          <CamRig cam={cam} />
          {fogA > 0 && <fog attach="fog" args={[FOG, mix(14, 0.25, fogA), mix(30, 2.0, fogA)]} />}
          <ambientLight intensity={0.14 + 0.25 * fogA} color="#FFF1DA" />
          <hemisphereLight args={["#FFE9C4", "#20262E", 0.22]} />
          <directionalLight
            position={[-4.5, 6.5, 2.5]}
            intensity={1.7 * (1 - 0.45 * fogA)}
            color="#FFE2B0"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-8.5}
            shadow-camera-right={8.5}
            shadow-camera-top={8.5}
            shadow-camera-bottom={-8.5}
            shadow-bias={-0.0002}
            shadow-normalBias={0.02}
          />
          <directionalLight position={[4, 3, 6]} intensity={0.45} color="#9DB8D8" />
          <spotLight position={[0.2, 6.5, 2.6]} angle={0.42} penumbra={1} intensity={10} color="#FFE7C2" distance={14} />
          <pointLight position={[0, 4.5, 8.5]} intensity={3.0} distance={14} decay={1.0} color="#FFE7C2" />
          <World t={t} id={id} />
          <Finish
            frame={frame}
            background={fogA > 0.02 ? FOG : PAL.table}
            profile={COLOR_PROFILES.DOCUMENTARY_WARM}
            exposure={1}
            envIntensity={0.55}
            hdri="warmStudio"
            ao={false}
          />
        </ThreeCanvas>
      </AbsoluteFill>
      <ArchiveFX s={sepia} frame={frame} w={width} h={height} />
      <Rain a={fogA} frame={frame} w={width} h={height} />

      {/* top scrim for HUD legibility on bright map shots */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640 * k, background: "linear-gradient(180deg, rgba(14,17,22,0.78) 0%, rgba(14,17,22,0.45) 55%, rgba(14,17,22,0) 100%)" }} />
      {/* bottom scrim behind captions */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760 * k, background: "linear-gradient(0deg, rgba(14,17,22,0.55) 0%, rgba(14,17,22,0.25) 60%, rgba(14,17,22,0) 100%)" }} />

      {/* HOOK */}
      {id === "hook" && s282.front && (
        <Tag k={k} x={s282.x - 40 * k} y={s282.y} side="left" a={ramp(t, wf("l01", "tanpa"), wf("l01", "tanpa") + 0.3)} text="AKHIR SEMUA BATAS" sub="rambu Zeichen 282" />
      )}
      <Headline k={k} t={t} t0={wf("l01", "jalan")} t1={T.crane + 0.6} kicker="AUTOBAHN · JERMAN" text="Ruas tanpa angka batas" />
      <Stamp k={k} t={t} t0={T.bukan} t1={T.mapA} text="≠ bebas ngebut" x={540} y={760} />

      {/* KONTEKS */}
      <Headline k={k} t={t} t0={T.luar} t1={T.tapi} kicker="ATURAN JERMAN · StVO" text="Jalan luar kota: 100 km/h" />
      <Headline k={k} t={t} t0={T.tapi} t1={T.mobil} kicker="TAPI…" text="Autobahn dikecualikan" />
      <Stamp k={k} t={t} t0={T.dikecualikan} t1={T.mobil} text="Dikecualikan" x={540} y={1180} color="#B26A00" rot={-4} size={52} />
      {id === "sign130" && tag130.front && (
        <Tag k={k} x={tag130.x} y={tag130.y} side="right" a={ramp(t, T.anjuran1, T.anjuran1 + 0.3)} text="130 km/h = ANJURAN" sub="bukan batas wajib" />
      )}
      <Headline k={k} t={t} t0={T.mobil} t1={T.mek} kicker="UNTUK MOBIL" text="Hanya anjuran" />

      {/* MEKANISME */}
      <Headline k={k} t={t} t0={T.krisis - 0.2} t1={T.l06} kicker="ARSIP · 1973–1974" text="Krisis minyak" accent="#E6B566" />
      <Headline k={k} t={t} t0={T.l06} t1={T.diganti} kicker="SEMENTARA" text="Batas wajib 100" accent="#E6B566" />
      <Counter k={k} t={t} />
      <Headline k={k} t={t} t0={T.diganti} t1={T.l07} kicker="LALU" text="Diganti anjuran 130" />
      <Gauge k={k} t={t} />
      <Stamp k={k} t={t} t0={T.tidak} t1={T.l08} text="Tidak ditilang" x={740} y={480} color="#2E5E3A" rot={-5} size={50} />
      <Headline k={k} t={t} t0={T.celaka} t1={T.rev} kicker={t < T.menanggung ? "DI ATAS 130 KM/H" : "KALAU CELAKA"} text={t < T.menanggung ? "Kalau celaka…" : "Ikut tanggung kerugian"} />
      {id === "scale" && scaleL.front && <Tag k={k} x={scaleL.x} y={scaleL.y} a={ramp(t, T.celaka, T.celaka + 0.3)} text="PENYEBAB" color="#C3272B" />}
      {id === "scale" && scaleR.front && (
        <Tag k={k} x={scaleR.x} y={scaleR.y} a={ramp(t, T.ikut - 0.1, T.ikut + 0.2)} text="KAMU (>130)" sub={t > T.walau ? "walau bukan penyebab" : undefined} />
      )}

      {/* REVEAL */}
      <Headline k={k} t={t} t0={T.rev} t1={T.kondisi0} kicker="TAPI" text="Aturan lain tetap ketat" />
      <Headline k={k} t={t} t0={T.kondisi0} t1={T.truk} kicker="WAJIB" text="Sesuaikan kondisi" />
      <Stamp k={k} t={t} t0={T.disesuaikan + 0.2} t1={T.truk} text="hujan · kabut · padat" x={540} y={560} color="#2A1A0E" rot={-3} size={40} />
      <Headline k={k} t={t} t0={T.truk} t1={T.dan} kicker="TRUK DI LAJUR KANAN" text="Maksimal 80 km/h" />
      <Headline k={k} t={t} t0={T.dan} t1={T.pay} kicker="LALU LINTAS DI KANAN JALAN" text="Menyalip hanya dari kiri" />

      {/* PAYOFF */}
      <Headline k={k} t={t} t0={T.data} t1={T.sekitar2} kicker="DATA RESMI TERAKHIR (BASt)" text="Tahun 2015" />
      {t >= T.sekitar2 && t < T.l12 && (
        <div style={{ position: "absolute", left: 64 * k, top: 262 * k, opacity: ramp(t, T.sekitar2, T.sekitar2 + 0.2) * (1 - ramp(t, T.l12 - 0.2, T.l12)) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26 * k, letterSpacing: 5 * k, color: PAL.amber }}>DATA 2015 · RUAS AUTOBAHN</div>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 150 * k, lineHeight: 1, color: PAL.amber, textShadow: "0 6px 22px rgba(0,0,0,0.7)" }}>
            ±{Math.round(70 * sm(ramp(t, T.sekitar2 + 0.1, T.persen + 0.1)))}%
          </div>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 58 * k, color: PAL.cream, textTransform: "uppercase" }}>hanya anjuran</div>
        </div>
      )}
      <Legend k={k} a={id === "payoff" ? ramp(t, T.data + 0.6, T.data + 1.0) : 0} />
      <Headline k={k} t={t} t0={T.l12} t1={T.out} kicker="SISANYA" text="Rambu atau papan elektronik" accent="#FF5A4F" />
      {id === "gantry" && signP.front && <Tag k={k} x={signP.x} y={signP.y} a={ramp(t, T.rambu, T.rambu + 0.25)} text="RAMBU" color="#FF5A4F" />}
      {id === "gantry" && ledP.front && <Tag k={k} x={ledP.x} y={ledP.y} a={ramp(t, T.papan, T.papan + 0.25)} text="PAPAN ELEKTRONIK" color="#FF5A4F" />}

      {/* OUTRO */}
      {t >= T.out && (
        <div style={{ position: "absolute", left: 64 * k, right: 64 * k, top: 268 * k, opacity: ramp(t, T.out, T.out + 0.3) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, letterSpacing: 6 * k, color: PAL.amber }}>AUDIRA EXPLAINED · AE-054</div>
          <div style={{ fontFamily: TITLE, fontWeight: 700, fontSize: 118 * k, lineHeight: 0.98, marginTop: 14 * k, color: PAL.cream, textTransform: "uppercase", textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
            Tanpa batas
            <br />
            <span style={{ color: PAL.amber, opacity: ramp(t, T.aturan - 0.4, T.aturan) }}>≠ tanpa aturan</span>
          </div>
        </div>
      )}

      <Captions t={t} k={k} />
      {flash > 0 && <AbsoluteFill style={{ background: "#F1E6CC", opacity: flash * 0.55, pointerEvents: "none" }} />}
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
