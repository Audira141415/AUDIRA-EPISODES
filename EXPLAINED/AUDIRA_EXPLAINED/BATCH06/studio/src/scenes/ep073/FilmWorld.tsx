// AE-073 film world: the cover world made time-driven.
// One persistent site: studio cyclorama, slab (poured in KONTEKS), gantry printer whose head runs
// along the real wall path, walls that grow bead by bead (drawRange on a precomputed tube, so the
// partial layer is exact and cheap), hose with mortar pulses, hologram model + slices + tool path,
// a large wall section on a plinth for the REVEAL (two skins, zigzag, foam, rebar, cables),
// and the conventional parts (roof, windows, workers) for the PAYOFF.
// Everything is a pure function of the state passed in (derived from the VO clock): deterministic.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import {
  Accent,
  B,
  BEAD_R,
  Bucket,
  C,
  COL_H,
  COL_X,
  COL_Z,
  Cone,
  HS,
  LAYER_H,
  SAMPLES,
  SKIN,
  SLAB_TOP,
  Silo,
  Steel,
  Studio,
  A,
  beadGeo,
  offsetPts,
  useLabel,
  zigPts,
} from "./World.tsx";

export const PMAX = 36; // finished wall: 36 visual layers (~2.3 m)
export const wallTop = (layers: number) => SLAB_TOP + layers * LAYER_H;

export type WorldState = {
  /** Printed layers (float): floor = full layers, fraction = current layer progress along the path. */
  P: number;
  slab: number; // 0..1 poured
  gantry: boolean;
  /** Extra lift of the side beams (payoff: bridge parks at the top). */
  lift: number;
  pump: number; // 0..1 pulses in hose
  ghostHose: number; // 0..1 transparent hose with liquid blobs
  holo: number; // 0..1 hologram visible
  explode: number; // 0..1 slices apart
  toolpath: number; // 0..1 tool path drawn on top slice
  formwork: number; // 0..1 ghost formwork panels
  formworkAt: number; // path fraction where the panels stand
  roof: number; // 0..1 dropped
  windows: number; // 0..1 installed
  workers: number; // 0 none, 1 printing crew, 2 install crew
  section: { show: number; skin: number; zig: number; foam: number; rebar: number; cable: number };
  t: number;
  f: number;
};

// ---------- path helpers ----------
const OUTER_PTS = offsetPts(SKIN).slice(0, -1);
const OUTER_CURVE = new THREE.CatmullRomCurve3(OUTER_PTS, true, "catmullrom", 0.1);
const START = 0.62; // path fraction where every layer starts (back-left, out of the hero view)

/** Point on the outer bead path at layer-local fraction u (0..1). */
export const pathPoint = (u: number) => OUTER_CURVE.getPointAt((((u + START) % 1) + 1) % 1);

/** Nozzle tip in world space for progress P. */
export const headAt = (P: number) => {
  const k = Math.min(Math.floor(P), PMAX - 1);
  const u = P >= PMAX ? 1 : P - Math.floor(P);
  const p = pathPoint(u);
  const y = SLAB_TOP + LAYER_H * (k + 1) + 0.012;
  return new THREE.Vector3(p.x, y, p.z);
};

// ---------- walls ----------
const useWallGeos = () =>
  useMemo(() => {
    const shift = Math.round(START * SAMPLES.length);
    const outer = beadGeo(offsetPts(SKIN, shift, shift + SAMPLES.length, false).concat([offsetPts(SKIN, shift, shift + 1, false)[0]]), false);
    const inner = beadGeo(offsetPts(-SKIN, shift, shift + SAMPLES.length, false).concat([offsetPts(-SKIN, shift, shift + 1, false)[0]]), false);
    const zig = beadGeo(zigPts(shift, shift + SAMPLES.length), false, BEAD_R * 0.8);
    const part = [outer.clone(), inner.clone(), zig.clone()];
    return { full: [outer, inner, zig], part };
  }, []);

const Walls: React.FC<{ P: number; grain: THREE.Texture }> = ({ P, grain }) => {
  const g = useWallGeos();
  const mats = useMemo(() => {
    const mk = (color: string, rough = 0.82) =>
      new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color, roughness: rough, sheen: 0.3, sheenColor: new THREE.Color("#ffffff"), bumpMap: grain, bumpScale: 1.2 });
    return { a: mk(C.mortar), b: mk("#BEB8B1"), fresh: mk(C.mortarFresh, 0.55) };
  }, [grain]);
  const full = Math.min(PMAX, Math.floor(P));
  const frac = P >= PMAX ? 0 : P - Math.floor(P);
  g.part.forEach((geo, i) => {
    const total = (geo.index?.count ?? 0) as number;
    const cnt = Math.floor((total * frac) / 60) * 60;
    geo.setDrawRange(0, cnt);
    void i;
  });
  return (
    <group>
      {Array.from({ length: full }, (_, i) => (
        <group key={i} position={[0, SLAB_TOP + LAYER_H * (i + 0.5), 0]}>
          {g.full.map((geo, k) => (
            <mesh key={k} geometry={geo} material={i % 2 ? mats.b : mats.a} castShadow receiveShadow />
          ))}
        </group>
      ))}
      {frac > 0.002 && full < PMAX && (
        <group position={[0, SLAB_TOP + LAYER_H * (full + 0.5), 0]}>
          {g.part.map((geo, k) => (
            <mesh key={k} geometry={geo} material={mats.fresh} castShadow receiveShadow />
          ))}
        </group>
      )}
    </group>
  );
};

// ---------- slab ----------
const SlabPour: React.FC<{ k: number; grain: THREE.Texture }> = ({ k, grain }) => {
  if (k <= 0.001) return null;
  const h = SLAB_TOP * k;
  return (
    <group>
      {/* formwork edge boards appear first, then the concrete level rises */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[A * 2 + 1.4, Math.max(0.01, h), B * 2 + 1.4]} radius={Math.min(0.08, h * 0.4)} />
        <meshPhysicalMaterial {...POLISH.stone} color={k < 1 ? "#D6D0C9" : C.slab} roughness={k < 1 ? 0.45 : 0.88} bumpMap={grain} bumpScale={0.8} />
      </mesh>
    </group>
  );
};

// ---------- gantry (moving) ----------
const TowerF: React.FC<{ x: number; z: number; rail: number }> = ({ x, z, rail }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.9, 0.16, 0.9]} radius={0.05} />
      <Steel color={C.steelDark} />
    </mesh>
    <mesh position={[0, COL_H / 2, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.36, COL_H, 0.36]} radius={0.05} />
      <Steel />
    </mesh>
    <mesh position={[0, COL_H / 2, 0]} castShadow>
      <boxGeometry args={[0.4, COL_H - 0.4, 0.08]} />
      <Steel color={C.steelDark} />
    </mesh>
    <mesh position={[0, rail, 0]} castShadow>
      <RoundedBoxGeo args={[0.56, 0.7, 0.56]} radius={0.08} />
      <Accent />
    </mesh>
    <mesh position={[0, COL_H + 0.06, 0]} castShadow>
      <RoundedBoxGeo args={[0.5, 0.14, 0.5]} radius={0.05} />
      <Accent />
    </mesh>
  </group>
);

/** Plate sits on the bridge half away from the carriage so the head never covers it. */
export const plateX = (head: THREE.Vector3) => (head.x < 0 ? 2.4 : -2.4);

export const railFor = (head: THREE.Vector3, lift: number) => Math.min(COL_H - 0.45, head.y + 1.95 + lift);

const GantryF: React.FC<{ head: THREE.Vector3; lift: number; extruding: boolean }> = ({ head, lift, extruding }) => {
  const label = useLabel("AUDIRA");
  const rail = railFor(head, lift);
  const bridge = rail + 0.6;
  const headY = rail - 1.95; // head rides with the beams (equals head.y while printing)
  return (
    <group>
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <TowerF key={`${sx}${sz}`} x={sx * COL_X} z={sz * COL_Z} rail={rail} />))}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * COL_X, rail, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.34, 0.46, COL_Z * 2 + 0.5]} radius={0.06} />
          <Steel />
        </mesh>
      ))}
      <group position={[0, bridge, head.z]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[COL_X * 2 + 0.6, 0.82, 0.5]} radius={0.08} />
          <Steel />
        </mesh>
        <mesh position={[0, -0.34, 0.256]}>
          <planeGeometry args={[COL_X * 2 + 0.4, 0.07]} />
          <Accent />
        </mesh>
        <mesh position={[plateX(head), 0.05, 0.258]}>
          <planeGeometry args={[3.1, 0.58]} />
          <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.6} />
        </mesh>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * COL_X, -0.2, 0]} castShadow>
            <RoundedBoxGeo args={[0.6, 0.6, 0.8]} radius={0.08} />
            <Accent />
          </mesh>
        ))}
      </group>
      <group position={[head.x, 0, head.z]}>
        <mesh position={[0, bridge, 0]} castShadow>
          <RoundedBoxGeo args={[0.8, 0.8, 0.82]} radius={0.1} />
          <Accent />
        </mesh>
        <mesh position={[0, (bridge + headY + HS * 0.8) / 2, 0]} castShadow>
          <RoundedBoxGeo args={[0.34, Math.max(0.1, bridge - headY - HS * 0.8), 0.34]} radius={0.06} />
          <Steel color={C.steelDark} />
        </mesh>
        <group position={[0, headY, 0]} scale={HS}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.42, 40]} />
            <Steel />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.24, 0.035, 12, 40]} />
            <Accent />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.247, 0.247, 0.08, 40]} />
            <Accent />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.06, 0.22, 40]} />
            <Steel />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.12, 24]} />
            <meshPhysicalMaterial color="#C9CED6" metalness={0.9} roughness={0.22} />
          </mesh>
          {extruding && (
            <mesh position={[0, 0.0, 0]} castShadow>
              <cylinderGeometry args={[0.032, 0.036, 0.05, 20]} />
              <meshPhysicalMaterial {...POLISH.clay} color={C.mortarFresh} roughness={0.55} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

// ---------- hose with pulses ----------
const PUMP = new THREE.Vector3(-4.0, 0.95, -5.0);
export const hoseCurve = (head: THREE.Vector3, lift: number) => {
  const rail = railFor(head, lift);
  const bridge = rail + 0.6;
  const headY = rail - 1.95;
  const hx = head.x;
  const hz = head.z;
  const pts = [
    PUMP.toArray(),
    [-4.6, 0.12, -4.4],
    [-5.3, 0.5, -4.65],
    [-5.3, rail - 0.4, -4.65],
    [-5.05, rail + 0.55, -4.0],
    [-5.0, rail + 0.6, (hz - 4.0) / 2],
    [-4.5, bridge + 0.5, hz - 0.15],
    [(hx - 4.5) / 2, bridge + 0.48, hz - 0.15],
    [hx - 0.75, bridge + 0.55, hz - 0.1],
    [hx - 0.55, headY + 2.0, hz + 0.5],
    [hx - 0.45, headY + 1.55, hz + 0.4],
    [hx - 0.22, headY + 1.36, hz + 0.12],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
};

const HoseF: React.FC<{ head: THREE.Vector3; lift: number; pump: number; ghost: number; t: number }> = ({ head, lift, pump, ghost, t }) => {
  const curve = useMemo(() => hoseCurve(head, lift), [head.x, head.y, head.z, lift]); // eslint-disable-line react-hooks/exhaustive-deps
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.075, 14, false), [curve]);
  const blobs = pump > 0 || ghost > 0 ? 16 : 0;
  return (
    <group>
      <mesh geometry={geo} castShadow={ghost < 0.5}>
        <meshPhysicalMaterial
          color={ghost > 0 ? "#8E86A8" : C.hose}
          roughness={0.35}
          clearcoat={0.6}
          transparent={ghost > 0}
          opacity={1 - ghost * 0.72}
          depthWrite={ghost < 0.5}
        />
      </mesh>
      {Array.from({ length: blobs }, (_, i) => {
        const u = (i / blobs + t * 0.11) % 1;
        const p = curve.getPointAt(u);
        const r = ghost > 0 ? 0.05 + 0.012 * Math.sin(t * 9 + i) : 0.088;
        return (
          <mesh key={i} position={p} scale={[1, ghost > 0 ? 1.25 : 1, 1]}>
            <sphereGeometry args={[r, 16, 12]} />
            <meshPhysicalMaterial
              color={ghost > 0 ? "#BFD8F2" : "#5A5668"}
              roughness={ghost > 0 ? 0.08 : 0.4}
              clearcoat={1}
              transparent={pump < 1 && ghost === 0}
              opacity={ghost > 0 ? ghost : pump}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- mixer paddle on the pump ----------
const Mixer: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <group position={[-4.0, 1.22, -5.5]} rotation={[0, t * 5 * on, 0]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
      <Steel color={C.steelDark} />
    </mesh>
    {[0, 1].map((k) => (
      <mesh key={k} position={[0, 0.2, 0]} rotation={[0, (k * Math.PI) / 2, 0]} castShadow>
        <RoundedBoxGeo args={[0.62, 0.07, 0.1]} radius={0.02} />
        <Accent />
      </mesh>
    ))}
  </group>
);

// ---------- hologram model, slices, tool path ----------
const ringShape = (dOut: number, dIn: number) => {
  const toV2 = (v: THREE.Vector3) => new THREE.Vector2(v.x, -v.z);
  const sh = new THREE.Shape(offsetPts(dOut, 0, SAMPLES.length, false).map(toV2));
  sh.holes.push(new THREE.Path(offsetPts(dIn, 0, SAMPLES.length, false).reverse().map(toV2)));
  return sh;
};

const SLICES = 9;
const Hologram: React.FC<{ k: number; explode: number; toolpath: number; t: number }> = ({ k, explode, toolpath, t }) => {
  const sliceH = (PMAX * LAYER_H) / SLICES;
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(ringShape(SKIN + BEAD_R, -SKIN - BEAD_R), { depth: sliceH * 0.92, bevelEnabled: false, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [sliceH]);
  const roof = useMemo(() => {
    const toV2 = (v: THREE.Vector3) => new THREE.Vector2(v.x, -v.z);
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(offsetPts(SKIN + 0.3, 0, SAMPLES.length, false).map(toV2)), { depth: 0.12, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const path = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(offsetPts(0).slice(0, -1), true, "catmullrom", 0.1);
    return { curve, geo: new THREE.TubeGeometry(curve, 600, 0.035, 8, true) };
  }, []);
  if (k <= 0.001) return null;
  const gap = explode * 0.42;
  const top = SLAB_TOP + (SLICES - 1) * (sliceH + gap);
  const cnt = Math.floor(((path.geo.index?.count ?? 0) * toolpath) / 48) * 48;
  path.geo.setDrawRange(0, cnt);
  const dot = path.curve.getPointAt(toolpath % 1);
  return (
    <group>
      {Array.from({ length: SLICES }, (_, i) => {
        const pulse = toolpath > 0 && i === SLICES - 1 ? 1 : 0;
        return (
          <mesh key={i} geometry={geo} position={[0, SLAB_TOP + i * (sliceH + gap), 0]}>
            <meshPhysicalMaterial
              color={pulse ? "#C9B8FF" : C.lilac}
              emissive={C.lilac}
              emissiveIntensity={0.25 + pulse * 0.25}
              roughness={0.2}
              clearcoat={1}
              transparent
              opacity={k * (0.42 + pulse * 0.25)}
              depthWrite={false}
            />
          </mesh>
        );
      })}
      <mesh geometry={roof} position={[0, SLAB_TOP + SLICES * (sliceH + gap) + 0.05 + explode * 0.8, 0]}>
        <meshPhysicalMaterial color="#7FC0F5" emissive="#7FC0F5" emissiveIntensity={0.2} transparent opacity={k * 0.35 * (1 - explode)} depthWrite={false} />
      </mesh>
      {toolpath > 0 && (
        <group position={[0, top + sliceH * 0.92 + 0.04, 0]}>
          <mesh geometry={path.geo}>
            <meshBasicMaterial color={C.pink} />
          </mesh>
          <mesh position={dot}>
            <sphereGeometry args={[0.11 + 0.02 * Math.sin(t * 12), 20, 14]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ---------- formwork ghosts ----------
const Formwork: React.FC<{ k: number; at: number; h: number }> = ({ k, at, h }) => {
  if (k <= 0.001) return null;
  const p = pathPoint(at);
  const q = pathPoint(at + 0.004);
  const yaw = Math.atan2(q.x - p.x, q.z - p.z) + Math.PI / 2;
  return (
    <group position={[p.x, SLAB_TOP + h / 2, p.z]} rotation={[0, yaw, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.42]}>
          <RoundedBoxGeo args={[1.8, h + 0.3, 0.06]} radius={0.02} />
          <meshPhysicalMaterial color={C.lilac} transparent opacity={0.22 * k} roughness={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- roof + windows ----------
const seamTexture = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#AFC1D8";
  g.fillRect(0, 0, 512, 64);
  for (let x = 0; x < 512; x += 32) {
    g.fillStyle = "#DCE6F2";
    g.fillRect(x, 0, 5, 64);
    g.fillStyle = "#93A6C0";
    g.fillRect(x + 5, 0, 3, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.12, 0.12);
  return t;
};

const Roof: React.FC<{ k: number }> = ({ k }) => {
  const geo = useMemo(() => {
    const toV2 = (v: THREE.Vector3) => new THREE.Vector2(v.x, -v.z);
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(offsetPts(SKIN + 0.32, 0, SAMPLES.length, false).map(toV2)), { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const map = useMemo(seamTexture, []);
  if (k <= 0.001) return null;
  const e = 1 - Math.pow(1 - Math.min(1, k), 3);
  const y = wallTop(PMAX) + 0.02 + (1 - e) * 3.2;
  return (
    <mesh geometry={geo} position={[0, y, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#FFFFFF" map={map} roughness={0.4} metalness={0.3} clearcoat={0.4} />
    </mesh>
  );
};

const WINDOWS: { x: number; z: number; yaw: number }[] = [
  { x: -1.9, z: B + SKIN + BEAD_R + 0.03, yaw: 0 },
  { x: -0.1, z: B + SKIN + BEAD_R + 0.03, yaw: 0 },
  { x: A + SKIN + BEAD_R + 0.03, z: -1.0, yaw: Math.PI / 2 },
];
const Windows: React.FC<{ k: number }> = ({ k }) => (
  <group>
    {WINDOWS.map((w, i) => {
      const local = Math.min(1, Math.max(0, k * 3 - i));
      if (local <= 0) return null;
      const e = 1 - Math.pow(1 - local, 3);
      return (
        <group key={i} position={[w.x, SLAB_TOP + 1.25, w.z + (w.yaw === 0 ? (1 - e) * 1.2 : 0)]} rotation={[0, w.yaw, 0]}>
          <group position={[w.yaw !== 0 ? 0 : 0, 0, 0]}>
            <mesh castShadow>
              <RoundedBoxGeo args={[1.25, 1.05, 0.1]} radius={0.04} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0, 0.052]}>
              <planeGeometry args={[1.05, 0.85]} />
              <meshPhysicalMaterial color="#9FD0FA" roughness={0.05} metalness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[0.05, 0.85, 0.02]} />
              <meshPhysicalMaterial {...POLISH.toyPlastic} color="#FFFFFF" />
            </mesh>
          </group>
        </group>
      );
    })}
  </group>
);

// ---------- wall section on a plinth (REVEAL) ----------
export const SECTION_POS = new THREE.Vector3(10.5, 0, 9.0);
export const SEC_L = 2.4;
export const SEC_LAYERS = 24;
export const SEC_BASE = 0.42;
const SEC_ZIG = [-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => [x, i % 2 ? 0.12 : -0.12] as const);
export const secTop = SEC_BASE + SEC_LAYERS * LAYER_H;

const Section: React.FC<{ s: WorldState["section"]; grain: THREE.Texture; t: number }> = ({ s, grain, t }) => {
  const geos = useMemo(() => {
    const mk = (pts: THREE.Vector3[], r = BEAD_R) => {
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05), 60, r, 12, false);
      g.scale(1, 0.72, 1);
      return g;
    };
    const line = (z: number) => [new THREE.Vector3(-SEC_L / 2, 0, z), new THREE.Vector3(SEC_L / 2, 0, z)];
    const zig = SEC_ZIG.map(([x, z]) => new THREE.Vector3(x, 0, z));
    return { skins: [mk(line(SKIN)), mk(line(-SKIN))], zig: mk(zig, BEAD_R * 0.8), cap: new THREE.CircleGeometry(BEAD_R, 20) };
  }, []);
  const mats = useMemo(() => {
    const mk = (color: string) => new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color, roughness: 0.8, bumpMap: grain, bumpScale: 1.1 });
    return { a: mk(C.mortar), b: mk("#BEB8B1"), cut: mk("#A9A29A") };
  }, [grain]);
  if (s.show <= 0.001) return null;
  const skinGlow = s.skin;
  const zigGlow = s.zig;
  const foamH = s.foam * SEC_LAYERS * LAYER_H * 0.98;
  const e3 = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  return (
    <group position={SECTION_POS.toArray()} scale={s.show}>
      {/* plinth */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.0, 2.05, 0.4, 64]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#FFF6F0" clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.82, 1.9, 64]} />
        <meshBasicMaterial color={C.mint} />
      </mesh>
      {Array.from({ length: SEC_LAYERS }, (_, i) => (
        <group key={i} position={[0, SEC_BASE + LAYER_H * (i + 0.5), 0]}>
          {geos.skins.map((g, k) => (
            <mesh key={k} geometry={g} castShadow receiveShadow>
              <meshPhysicalMaterial
                {...POLISH.clay}
                color={i % 2 ? "#BEB8B1" : C.mortar}
                emissive={C.mint}
                emissiveIntensity={skinGlow * 0.55}
                roughness={0.8}
                bumpMap={grain}
                bumpScale={1.1}
              />
            </mesh>
          ))}
          <mesh geometry={geos.zig} castShadow receiveShadow>
            <meshPhysicalMaterial
              {...POLISH.clay}
              color={i % 2 ? "#BEB8B1" : C.mortar}
              emissive={C.pink}
              emissiveIntensity={zigGlow * 0.6}
              roughness={0.8}
              bumpMap={grain}
              bumpScale={1.1}
            />
          </mesh>
          {/* cut ends: bead profiles */}
          {[SKIN, -SKIN].map((z) => (
            <mesh key={z} geometry={geos.cap} material={mats.cut} position={[SEC_L / 2 + 0.001, 0, z]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.72, 1]} />
          ))}
        </group>
      ))}
      {/* insulation foam rising inside the cavities */}
      {s.foam > 0.001 && (
        <mesh position={[0, SEC_BASE + foamH / 2, 0]} castShadow>
          <RoundedBoxGeo args={[SEC_L - 0.06, Math.max(0.02, foamH), 0.2]} radius={0.01} />
          <meshPhysicalMaterial {...POLISH.clay} color="#FFE08A" roughness={0.95} bumpMap={grain} bumpScale={3} />
        </mesh>
      )}
      {/* rebar dropping into two cavities */}
      {[-0.9, 0.3].map((x, i) => {
        const k = e3(s.rebar * 1.4 - i * 0.3);
        if (k <= 0) return null;
        const h = SEC_LAYERS * LAYER_H + 0.3;
        return (
          <mesh key={x} position={[x, SEC_BASE + h / 2 + (1 - k) * 2.2, i ? -0.05 : 0.05]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, h, 12]} />
            <meshPhysicalMaterial color="#9AA3AE" metalness={0.85} roughness={0.35} />
          </mesh>
        );
      })}
      {/* electrical conduit + water pipe */}
      {[
        { x: -0.3, z: 0.05, r: 0.028, c: C.orange },
        { x: 0.9, z: -0.05, r: 0.034, c: "#5FA8E8" },
      ].map((p, i) => {
        const k = e3(s.cable * 1.4 - i * 0.3);
        if (k <= 0) return null;
        const h = SEC_LAYERS * LAYER_H + 0.35;
        return (
          <mesh key={i} position={[p.x, SEC_BASE + h / 2 + (1 - k) * 2.2, p.z]} castShadow>
            <cylinderGeometry args={[p.r, p.r, h, 16]} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={p.c} />
          </mesh>
        );
      })}
      {void t}
    </group>
  );
};

// ---------- world ----------
export const FilmWorld: React.FC<{ s: WorldState }> = ({ s }) => {
  const grain = useSurfaceGrain(73, 0.35, 8);
  const slabGrain = useSurfaceGrain(31, 0.3, 4);
  const fgGrain = useSurfaceGrain(91, 0.35, 6);
  const head = headAt(s.P);
  const printing = s.P > 0.001 && s.P < PMAX;
  return (
    <group>
      <Studio />
      <SlabPour k={s.slab} grain={slabGrain} />
      {s.slab >= 1 && <Walls P={s.P} grain={grain} />}
      {s.gantry && <GantryF head={head} lift={s.lift} extruding={printing} />}
      {s.gantry && <HoseF head={head} lift={s.lift} pump={s.pump} ghost={s.ghostHose} t={s.t} />}
      <Silo />
      <Mixer t={s.t} on={s.pump > 0 ? 1 : 0.15} />
      <Hologram k={s.holo} explode={s.explode} toolpath={s.toolpath} t={s.t} />
      <Formwork k={s.formwork} at={s.formworkAt} h={Math.floor(s.P) * LAYER_H} />
      <Roof k={s.roof} />
      <Windows k={s.windows} />
      <Section s={s.section} grain={grain} t={s.t} />
      {/* crew */}
      {s.workers >= 1 && (
        <>
          <ToyPerson f={s.f} seed={12} pose="stand" outfit="casual" position={[0.9, 0, 5.4]} heading={-2.6} scale={1.7} look={{ top: C.orange, bottom: "#3E4F6E", hairStyle: 2, cap: C.butter, height: 1 }} />
          <ToyPerson f={s.f} seed={27} pose="wave" outfit="casual" position={[-6.4, 0, -2.0]} heading={0.9} scale={1.7} look={{ top: C.orange, bottom: "#56607A", hairStyle: 2, cap: "#FFFFFF", height: 0.98 }} />
        </>
      )}
      {s.workers >= 2 && (
        <>
          <ToyPerson f={s.f} seed={41} pose="walk" outfit="casual" position={[-3.6, 0, 4.6]} heading={1.4} scale={1.7} look={{ top: C.mint, bottom: "#3E4F6E", hairStyle: 2, cap: C.butter, height: 1 }} />
          <ToyPerson f={s.f} seed={53} pose="cheer" outfit="casual" position={[4.4, 0, 1.2]} heading={-1.2} scale={1.7} look={{ top: C.pink, bottom: "#56607A", hairStyle: 2, cap: "#FFFFFF", height: 0.96 }} />
        </>
      )}
      {/* foreground props (blurred by DOF in wide shots) */}
      <group position={[3.9, 0, 8.4]} scale={2.0}>
        <Bucket grain={fgGrain} />
      </group>
      <Cone p={[-2.6, 0, 8.6]} s={1.7} />
      <Cone p={[6.6, 0, 6.6]} s={1.6} />
    </group>
  );
};
