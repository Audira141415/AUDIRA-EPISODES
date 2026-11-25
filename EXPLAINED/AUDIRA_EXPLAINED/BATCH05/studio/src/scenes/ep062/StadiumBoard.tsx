// AE-062 — stadium plan on a TACTICBOARD: raked stands with radial gangways, vomitories, concourse,
// outer wall with exit gates. Spectator tokens sit on the tiers; telestrator arrows trace the exit
// route tribun -> gangway -> vomitory (narrowest point, marked red) -> concourse -> gate.
// Everything is a pure function of t (seconds). No Math.random: prng from the kit.
import React, { useMemo } from "react";
import * as THREE from "three";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { makeGlowTexture, makePitchTexture } from "../../kits/tacticboard/lib/materials";
import { prng } from "../../kits/tacticboard/core/motion";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

// ---------------------------------------------------------------- layout (world units, y up)
export const INNER = { x: 1.55, z: 2.25 }; // inner edge of the lowest tier
export const N_TIERS = 9;
export const STEP = 0.2; // tread depth per tier
const RISE = 0.075;
const STAND = N_TIERS * STEP; // 1.8
export const CONC_IN = STAND + 0.08; // concourse inner offset
export const CONC_OUT = 2.6; // concourse outer offset (= outer wall)
export const WALL = { x: INNER.x + CONC_OUT, z: INNER.z + CONC_OUT };
const WALL_R = 0.5;
export const BOARD = { x: WALL.x + 0.75, z0: -(WALL.z + 0.7), z1: WALL.z + 1.35 };
export const VOM = [3, 5] as const; // vomitory spans tiers 3..5
const VOM_W = 0.24;
export const GANG_W = 0.15;

export const tierTop = (k: number) => 0.03 + RISE * (k + 1);

type Side = "+x" | "-x" | "+z" | "-z";
/** Local (u = outward offset from the inner stand edge, v = along the side) -> world. */
export const toWorld = (side: Side, u: number, y: number, v: number): THREE.Vector3 => {
  switch (side) {
    case "+x":
      return new THREE.Vector3(INNER.x + u, y, v);
    case "-x":
      return new THREE.Vector3(-(INNER.x + u), y, v);
    case "+z":
      return new THREE.Vector3(v, y, INNER.z + u);
    default:
      return new THREE.Vector3(v, y, -(INNER.z + u));
  }
};
const sideRotY = (side: Side) => (side === "+x" || side === "-x" ? 0 : Math.PI / 2);

export const GANGWAYS: { side: Side; v: number }[] = [
  { side: "+x", v: -1.4 },
  { side: "+x", v: 0 },
  { side: "+x", v: 1.4 },
  { side: "-x", v: -1.4 },
  { side: "-x", v: 0 },
  { side: "-x", v: 1.4 },
  { side: "+z", v: -0.7 },
  { side: "+z", v: 0.7 },
  { side: "-z", v: -0.7 },
  { side: "-z", v: 0.7 },
];
export const GATES: { side: Side; v: number; w: number }[] = [
  { side: "+x", v: 2.7, w: 0.62 },
  { side: "+x", v: -2.7, w: 0.62 },
  { side: "-x", v: 2.7, w: 0.62 },
  { side: "-x", v: -2.7, w: 0.62 },
  { side: "+z", v: 0, w: 0.7 },
  { side: "-z", v: 0, w: 0.7 },
];

// ---------------------------------------------------------------- shapes
const rr = (hx: number, hz: number, r: number, hole = false) => {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.moveTo(-hx + r, -hz);
  s.lineTo(hx - r, -hz);
  s.absarc(hx - r, -hz + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hx, hz - r);
  s.absarc(hx - r, hz - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hx + r, hz);
  s.absarc(-hx + r, hz - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hx, -hz + r);
  s.absarc(-hx + r, -hz + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};
const ringGeo = (offIn: number, offOut: number, rIn: number, rOut: number, h: number, bevel = 0.006) => {
  const shape = rr(INNER.x + offOut, INNER.z + offOut, rOut) as THREE.Shape;
  shape.holes.push(rr(INNER.x + offIn, INNER.z + offIn, rIn, true) as THREE.Path);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, h - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 18,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
};

// ---------------------------------------------------------------- textures
const boardTexture = () => {
  const W = 1024;
  const H = Math.round((W * (BOARD.z1 - BOARD.z0)) / (BOARD.x * 2));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#18222C";
  g.fillRect(0, 0, W, H);
  const r = prng(6211);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.06)";
    g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
  }
  // faint chalk grid (1 unit) like a coach's magnetic board
  const u = W / (BOARD.x * 2);
  g.strokeStyle = "rgba(232,255,240,0.07)";
  g.lineWidth = 1.5;
  for (let x = 0; x < W; x += u * 0.5) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += u * 0.5) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** LED scoreboard face: "AUDIRA" as a 5x7 dot-matrix bitmap (no font dependency, deterministic). */
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
};
const ledTexture = () => {
  const word = "AUDIRA";
  const cols = word.length * 6 - 1 + 6; // 1-col gaps + 3-col margins
  const rows = 7 + 4;
  const cell = 24;
  const c = document.createElement("canvas");
  c.width = cols * cell;
  c.height = rows * cell;
  const g = c.getContext("2d")!;
  g.fillStyle = "#04080B";
  g.fillRect(0, 0, c.width, c.height);
  for (let ry = 0; ry < rows; ry++) {
    for (let cx = 0; cx < cols; cx++) {
      const gx = cx - 3;
      const gy = ry - 2;
      const li = Math.floor(gx / 6);
      const lx = gx - li * 6;
      const on = gx >= 0 && gy >= 0 && gy < 7 && li < word.length && lx < 5 && GLYPHS[word[li]][gy][lx] === "1";
      g.fillStyle = on ? "#5CFFA8" : "rgba(90,130,115,0.18)";
      g.beginPath();
      g.arc((cx + 0.5) * cell, (ry + 0.5) * cell, on ? cell * 0.42 : cell * 0.26, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ---------------------------------------------------------------- telestrator arrow
export const Arrow: React.FC<{ pts: THREE.Vector3[]; color: string; radius: number; dashed?: [number, number]; head?: boolean; glow?: number }> = ({
  pts,
  color,
  radius,
  dashed,
  head = true,
  glow = 1.4,
}) => {
  const { tubes, headPos, headQuat } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const tubes: THREE.BufferGeometry[] = [];
    const end = head ? 0.94 : 1;
    if (dashed) {
      // dashed only within [dashed[0], dashed[1]] of the curve; solid elsewhere
      const [a, b] = dashed;
      const pushSeg = (s0: number, s1: number) => {
        const sub = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => curve.getPointAt(s0 + ((s1 - s0) * i) / 11)));
        tubes.push(new THREE.TubeGeometry(sub, 24, radius, 10, false));
      };
      pushSeg(0, a);
      const n = 6;
      for (let i = 0; i < n; i++) {
        const s0 = a + ((b - a) * i) / n;
        pushSeg(s0, s0 + ((b - a) / n) * 0.55);
      }
      pushSeg(b, end);
    } else {
      const sub = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => curve.getPointAt((end * i) / 39)));
      tubes.push(new THREE.TubeGeometry(sub, 120, radius, 10, false));
    }
    const headPos = curve.getPointAt(end);
    const tan = curve.getTangentAt(end);
    const headQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    return { tubes, headPos, headQuat };
  }, [pts, radius, dashed, head]);
  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.35} toneMapped={false} />
        </mesh>
      ))}
      {head && (
        <mesh position={headPos} quaternion={headQuat} castShadow>
          <coneGeometry args={[radius * 3.4, radius * 7, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.35} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- routes
export const U = (k: number) => k * STEP + STEP / 2; // tread centre of tier k
export const CONC_MID = (CONC_IN + CONC_OUT) / 2;
export const nearestGate = (side: Side, v: number) =>
  GATES.filter((g) => g.side === side).sort((a, b) => Math.abs(a.v - v) - Math.abs(b.v - v) || a.v - b.v)[0];

/** Exit route from the top of a gangway down to its vomitory, under the stand, along the concourse, out of the gate. */
export const routeFromTop = (side: Side, v: number, lift = 0.14): THREE.Vector3[] => {
  const gate = nearestGate(side, v);
  const dir = Math.sign(gate.v - v) || 1;
  return [
    toWorld(side, U(8), tierTop(8) + lift, v),
    toWorld(side, U(6.6), tierTop(6) + lift, v),
    toWorld(side, U(5.1), tierTop(5) + lift * 0.8, v),
    toWorld(side, U(6.5), tierTop(8) + 0.32, v + dir * 0.1),
    toWorld(side, CONC_MID, 0.16, v + dir * 0.35),
    toWorld(side, CONC_MID, 0.14, (v + gate.v) / 2 + dir * 0.2),
    toWorld(side, CONC_MID, 0.14, gate.v - dir * 0.15),
    toWorld(side, CONC_OUT + 0.15, 0.14, gate.v),
    toWorld(side, CONC_OUT + 0.62, 0.14, gate.v + dir * 0.05),
  ];
};
const routeFromBottom = (side: Side, v: number, lift = 0.14): THREE.Vector3[] => [
  toWorld(side, U(0), tierTop(0) + lift, v),
  toWorld(side, U(1.5), tierTop(1) + lift, v),
  toWorld(side, U(2.75), tierTop(3) + lift * 0.8, v),
];

// ---------------------------------------------------------------- tokens (spectators)
type TokenSet = { mesh: THREE.InstancedMesh };
const useTokens = (hero: { side: Side; v: number }, t: number, film = false): THREE.InstancedMesh => {
  // built + coloured inside useMemo so the first draw already has instance colours (Batch 3 lesson)
  return useMemo(() => {
    const r = prng(62062);
    const items: { p: THREE.Vector3; c: THREE.Color; s: number }[] = [];
    const seated = [new THREE.Color("#EDE6D6"), new THREE.Color("#B9CBE2"), new THREE.Color("#D9DEE6")];
    const flow = new THREE.Color(P.lane);
    for (let k = 0; k < N_TIERS; k++) {
      const off = k * STEP + STEP / 2;
      const shape = rr(INNER.x + off, INNER.z + off, 0.35 + off) as THREE.Shape;
      const len = shape.getLength();
      const n = Math.floor(len / 0.135);
      const pts = shape.getSpacedPoints(n);
      for (let i = 0; i < n; i++) {
        const q = pts[i];
        const x = q.x;
        const z = -q.y; // shape Y -> world -Z after rotateX(-PI/2)
        const onGang = GANGWAYS.some((gw) =>
          gw.side === "+x" || gw.side === "-x"
            ? Math.sign(x) === (gw.side === "+x" ? 1 : -1) && Math.abs(x) > INNER.x - 0.01 && Math.abs(z - gw.v) < 0.15 && Math.abs(z) < INNER.z
            : Math.sign(z) === (gw.side === "+z" ? 1 : -1) && Math.abs(z) > INNER.z - 0.01 && Math.abs(x - gw.v) < 0.15 && Math.abs(x) < INNER.x,
        );
        if (onGang) continue;
        // near the hero gangway the rows are emptying (spectators already in the flow)
        const nearHero =
          hero.side === "+x" ? x > 0 && Math.abs(z - hero.v) < 0.5 && Math.abs(z) < INNER.z : false;
        const keep = film ? r() > 0.1 : nearHero ? r() > 0.55 : r() > 0.16;
        if (!keep) continue;
        items.push({ p: new THREE.Vector3(x, tierTop(k) + 0.016, z), c: seated[Math.floor(r() * 3)].clone().multiplyScalar(0.85 + r() * 0.15), s: 1 });
      }
    }
    // flow tokens on the hero gangway: thin at the top, bunching just before the vomitory
    const addFlow = (uFrom: number, uTo: number, count: number, jitter: number) => {
      for (let i = 0; i < count; i++) {
        const s = i / (count - 1);
        const e = 1 - (1 - s) * (1 - s); // denser toward uTo
        const u = uFrom + (uTo - uFrom) * e;
        const k = Math.max(0, Math.min(N_TIERS - 1, Math.floor(u / STEP)));
        const jv = (r() - 0.5) * jitter * (0.4 + e);
        const pos = toWorld(hero.side, u, tierTop(k) + 0.016, hero.v + jv);
        items.push({ p: pos, c: flow.clone().multiplyScalar(0.92 + r() * 0.08), s: 0.92 });
      }
    };
    if (!film) addFlow(U(8), U(5.75), 9, 0.1);
    if (!film) addFlow(U(0), U(2.35), 6, 0.1);
    // a queue squeezing into the mouth (two abreast)
    for (let i = 0; i < (film ? 0 : 4); i++) {
      const pos = toWorld(hero.side, U(3) + i * 0.12, tierTop(5) + 0.02, hero.v + (i % 2 ? 0.055 : -0.055));
      items.push({ p: pos, c: flow.clone(), s: 0.85 });
    }
    // people already out on the concourse, heading for the gate
    const gate = nearestGate(hero.side, hero.v);
    const gdir = Math.sign(gate.v - hero.v) || 1;
    for (let i = 0; i < (film ? 0 : 9); i++) {
      const vv = hero.v + gdir * 0.45 + ((gate.v - hero.v - gdir * 0.45) * i) / 8;
      const pos = toWorld(hero.side, CONC_MID + (r() - 0.5) * 0.3, 0.075, vv);
      items.push({ p: pos, c: flow.clone().multiplyScalar(0.9), s: 0.92 });
    }

    const geo = new THREE.CylinderGeometry(0.05, 0.054, 0.032, 20);
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.toyPlastic, color: "#ffffff" });
    const mesh = new THREE.InstancedMesh(geo, mat, items.length);
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.copy(it.p);
      o.scale.setScalar(it.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, it.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
    // t only used for a tiny breathing offset elsewhere; tokens are static for the cover
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero.side, hero.v, film]);
};

export const SCOREBOARD = { pos: [1.6, 0.95, -(WALL.z - 0.1)] as [number, number, number], rotY: 0 };
const FG_TOKENS: { p: [number, number, number]; c: string; tilt: number }[] = [
  { p: [-1.6, 0.055, WALL.z + 0.8], c: P.lane, tilt: 0 },
  { p: [-1.15, 0.055, WALL.z + 1.0], c: "#EDE6D6", tilt: 0 },
  { p: [-1.4, 0.15, WALL.z + 0.86], c: P.lane, tilt: 0.08 },
  { p: [1.9, 0.055, WALL.z + 0.95], c: "#B9CBE2", tilt: 0 },
  { p: [2.35, 0.055, WALL.z + 0.75], c: "#FF5A3C", tilt: 0 },
];

/** World anchors for HTML labels: top of the red leader line over the vomitory, and the hero gate. */
export const heroAnchors = (hero: { side: Side; v: number }) => {
  const vom = toWorld(hero.side, (U(VOM[0]) + U(VOM[1])) / 2, tierTop(VOM[1]) + 0.02, hero.v);
  const gate = nearestGate(hero.side, hero.v);
  return {
    vom,
    vomTop: vom.clone().add(new THREE.Vector3(0, 0.84, 0)),
    gate: toWorld(gate.side, CONC_OUT + 0.05, 0.36, gate.v),
  };
};

// ---------------------------------------------------------------- the board
/**
 * film = film mode (cover output is unchanged when omitted): full stands, no baked arrows or
 * marker (the film animates its own), sunken vomitory portals, and gate doors opened by doorOpen 0..1.
 */
export const StadiumBoard: React.FC<{ t: number; hero: { side: Side; v: number }; film?: boolean; doorOpen?: number; doors?: boolean }> = ({
  t,
  hero,
  film = false,
  doorOpen = 0,
  doors = false,
}) => {
  const grain = useMemo(() => surfaceGrain(62, 256, 0.3, 6), []);
  const pitchTex = useMemo(() => makePitchTexture(), []);
  const boardTex = useMemo(() => boardTexture(), []);
  const glow = useMemo(() => makeGlowTexture(), []);
  const led = useMemo(() => ledTexture(), []);
  const tokens = useTokens(hero, t, film);

  const tiers = useMemo(
    () => Array.from({ length: N_TIERS }, (_, k) => ringGeo(k * STEP, (k + 1) * STEP + 0.004, 0.35 + k * STEP, 0.35 + (k + 1) * STEP, tierTop(k))),
    [],
  );
  const concourse = useMemo(() => ringGeo(CONC_IN - 0.02, CONC_OUT, 0.35 + CONC_IN, WALL_R, 0.06, 0.004), []);
  const apron = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(rr(INNER.x + 0.01, INNER.z + 0.01, 0.35) as THREE.Shape, { depth: 0.03, bevelEnabled: false, curveSegments: 18 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  // outer wall: straight segments with gate gaps + quarter-round corners
  const walls = useMemo(() => {
    const segs: { pos: [number, number, number]; len: number; rotY: number }[] = [];
    const addSide = (side: Side, half: number) => {
      const gaps = GATES.filter((g) => g.side === side).map((g) => [g.v - g.w / 2, g.v + g.w / 2]).sort((a, b) => a[0] - b[0]);
      let cur = -half;
      const cuts = [...gaps, [half, half]];
      for (const [a, b] of cuts) {
        if (a - cur > 0.02) {
          const mid = (a + cur) / 2;
          const p = toWorld(side, CONC_OUT, 0.11, mid);
          segs.push({ pos: [p.x, p.y, p.z], len: a - cur, rotY: sideRotY(side) });
        }
        cur = b;
      }
    };
    addSide("+x", WALL.z - WALL_R);
    addSide("-x", WALL.z - WALL_R);
    addSide("+z", WALL.x - WALL_R);
    addSide("-z", WALL.x - WALL_R);
    return segs;
  }, []);

  const heroRoute = useMemo(() => routeFromTop(hero.side, hero.v), [hero.side, hero.v]);
  const heroUp = useMemo(() => routeFromBottom(hero.side, hero.v), [hero.side, hero.v]);
  const faint = useMemo(
    () => [
      routeFromTop("-x", 1.4, 0.1),
      routeFromTop("-x", -1.4, 0.1),
      routeFromTop("+x", 1.4, 0.1),
      routeFromTop("+z", 0.7, 0.1),
      routeFromTop("-z", -0.7, 0.1),
    ],
    [],
  );

  const pulse = 0.5 + 0.5 * Math.sin(t * 5.2);
  const vomMid = toWorld(hero.side, (U(VOM[0]) + U(VOM[1])) / 2, tierTop(VOM[1]) + 0.02, hero.v);
  const gate = nearestGate(hero.side, hero.v);

  const fx = (o: THREE.Object3D | null) => o && o.layers.set(FX_LAYER);

  return (
    <group>
      {/* studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.floor} />
      </mesh>

      {/* coach board: composite body, brushed aluminium lip, slate surface with chalk grid */}
      <mesh position={[0, -0.2, (BOARD.z0 + BOARD.z1) / 2]} castShadow receiveShadow>
        <RoundedBoxGeo args={[BOARD.x * 2 + 0.5, 0.4, BOARD.z1 - BOARD.z0 + 0.5]} radius={0.04} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.frame} />
      </mesh>
      <mesh position={[0, -0.006, (BOARD.z0 + BOARD.z1) / 2]} receiveShadow>
        <RoundedBoxGeo args={[BOARD.x * 2 + 0.2, 0.02, BOARD.z1 - BOARD.z0 + 0.2]} radius={0.04} />
        <meshStandardMaterial color={P.frameEdge} roughness={0.28} metalness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, (BOARD.z0 + BOARD.z1) / 2]} receiveShadow>
        <planeGeometry args={[BOARD.x * 2, BOARD.z1 - BOARD.z0]} />
        <meshStandardMaterial map={boardTex} roughness={0.82} metalness={0} />
      </mesh>

      {/* AUDIRA LED scoreboard behind the far stand (in-world brand) */}
      <group position={SCOREBOARD.pos} rotation={[0.1, SCOREBOARD.rotY, 0]}>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[k * 1.1, -SCOREBOARD.pos[1] / 2, -0.05]} castShadow>
            <RoundedBoxGeo args={[0.1, SCOREBOARD.pos[1], 0.1]} radius={0.03} />
            <meshStandardMaterial color="#9AA6B2" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}
        <mesh castShadow>
          <RoundedBoxGeo args={[3.0, 0.88, 0.14]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.brickABS} color="#1A2128" />
        </mesh>
        {(
          <mesh position={[0, 0, 0.072]}>
            <planeGeometry args={[2.86, 0.77]} />
            <meshBasicMaterial map={led} toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* spare tokens on the board's front margin (foreground, out of focus) */}
      {FG_TOKENS.map((tk, i) => (
        <mesh key={`fg${i}`} position={tk.p} rotation={[tk.tilt, 0, tk.tilt * 0.6]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.21, 0.09, 36]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={tk.c} />
        </mesh>
      ))}

      {/* concourse ring + outer wall + gates */}
      <mesh geometry={concourse} receiveShadow castShadow>
        <meshPhysicalMaterial {...POLISH.stone} color="#55626F" bumpMap={grain} bumpScale={0.15} />
      </mesh>
      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} rotation={[0, w.rotY, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.07, 0.16, w.len]} radius={0.02} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#C9D0D7" />
        </mesh>
      ))}
      {[
        [WALL.x - WALL_R, WALL.z - WALL_R, 0],
        [-(WALL.x - WALL_R), WALL.z - WALL_R, Math.PI / 2],
        [-(WALL.x - WALL_R), -(WALL.z - WALL_R), Math.PI],
        [WALL.x - WALL_R, -(WALL.z - WALL_R), Math.PI * 1.5],
      ].map(([x, z, a], i) => (
        <mesh key={`c${i}`} position={[x, 0.11, z]} rotation={[Math.PI / 2, 0, a]} castShadow>
          <torusGeometry args={[WALL_R, 0.035, 10, 24, Math.PI / 2]} />
          <meshPhysicalMaterial {...POLISH.toyPlastic} color="#C9D0D7" />
        </mesh>
      ))}
      {GATES.map((g, i) => {
        const isHero = g === gate;
        return [-1, 1].map((s) => {
          const p = toWorld(g.side, CONC_OUT, 0.15, g.v + (s * g.w) / 2);
          return (
            <group key={`${i}${s}`} position={p}>
              <mesh castShadow>
                <RoundedBoxGeo args={[0.1, 0.3, 0.1]} radius={0.02} />
                <meshPhysicalMaterial {...POLISH.brickABS} color="#2A3440" />
              </mesh>
              <mesh position={[0, 0.17, 0]}>
                <RoundedBoxGeo args={[0.12, 0.05, 0.12]} radius={0.02} />
                <meshStandardMaterial color="#40E08C" emissive="#40E08C" emissiveIntensity={isHero ? 2.2 : 1.1} toneMapped={false} />
              </mesh>
            </group>
          );
        });
      })}

      {doors &&
        GATES.map((g, i) =>
          [-1, 1].map((s) => {
            // two leaves hinged at the gate posts, swinging outward (away from the stand)
            const hinge = toWorld(g.side, CONC_OUT, 0.115, g.v + (s * g.w) / 2);
            const base = sideRotY(g.side);
            const out = g.side === "+x" || g.side === "+z" ? 1 : -1;
            const swing = doorOpen * 1.75 * s * out * (g.side === "+x" || g.side === "-x" ? -1 : 1);
            return (
              <group key={`d${i}${s}`} position={hinge} rotation={[0, base + swing, 0]}>
                <mesh position={[0, 0, (-s * g.w) / 4]} castShadow receiveShadow>
                  <RoundedBoxGeo args={[0.035, 0.2, g.w / 2 - 0.03]} radius={0.01} />
                  <meshPhysicalMaterial {...POLISH.toyPlastic} color="#EEF2F5" />
                </mesh>
              </group>
            );
          }),
        )}

      {/* pitch + apron */}
      <mesh geometry={apron} receiveShadow>
        <meshPhysicalMaterial {...POLISH.stone} color="#24502C" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.034, 0]} receiveShadow>
        <planeGeometry args={[(INNER.x - 0.2) * 2, (INNER.z - 0.24) * 2]} />
        <meshStandardMaterial map={pitchTex} roughness={0.86} metalness={0} />
      </mesh>

      {/* raked stands: one stepped ring per row of seats */}
      {tiers.map((g, k) => (
        <mesh key={k} geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial {...POLISH.toyPlastic} color={k % 2 ? "#3E4C5A" : "#465564"} bumpMap={grain} bumpScale={0.06} />
        </mesh>
      ))}

      {/* gangways (light concrete stairs) + vomitory mouths */}
      {GANGWAYS.map((gw, gi) => {
        const isHero = gw.side === hero.side && gw.v === hero.v;
        const rotY = sideRotY(gw.side);
        const stairs = Array.from({ length: N_TIERS }, (_, k) => k).filter((k) => k < VOM[0] || k > VOM[1]);
        const mouthC = toWorld(gw.side, (U(VOM[0]) + U(VOM[1])) / 2, tierTop(VOM[1]) + 0.004, gw.v);
        return (
          <group key={gi}>
            {stairs.map((k) => {
              const p = toWorld(gw.side, U(k), tierTop(k) + 0.005, gw.v);
              return (
                <mesh key={k} position={p} rotation={[0, rotY, 0]} receiveShadow>
                  <RoundedBoxGeo args={[STEP + 0.004, 0.014, GANG_W]} radius={0.005} />
                  <meshPhysicalMaterial {...POLISH.stone} color={isHero ? "#E4E0D4" : "#B8BEC4"} />
                </mesh>
              );
            })}
            {/* dark tunnel mouth with two cheek walls */}
            <mesh position={mouthC} rotation={[0, rotY, 0]} receiveShadow>
              <RoundedBoxGeo args={[STEP * 3 + 0.01, 0.012, VOM_W]} radius={0.004} />
              <meshPhysicalMaterial color="#05080B" roughness={0.25} clearcoat={0.6} />
            </mesh>
            {film && (
              <>
                {/* lintel across the upper end of the opening */}
                <mesh position={toWorld(gw.side, U(VOM[1]) + STEP * 0.42, tierTop(VOM[1] + 1) + 0.035, gw.v)} rotation={[0, rotY, 0]} castShadow>
                  <RoundedBoxGeo args={[0.05, 0.05, VOM_W + 0.1]} radius={0.012} />
                  <meshPhysicalMaterial {...POLISH.toyPlastic} color={isHero ? "#FF5A3C" : "#C9D0D7"} />
                </mesh>
              </>
            )}
            {[-1, 1].map((s) => {
              const p = toWorld(gw.side, (U(VOM[0]) + U(VOM[1])) / 2, tierTop(VOM[1]) + 0.03, gw.v + (s * (VOM_W + 0.04)) / 2);
              return (
                <mesh key={s} position={p} rotation={[0, rotY, 0]} castShadow>
                  <RoundedBoxGeo args={[STEP * 3 + 0.01, film ? 0.1 : 0.06, 0.04]} radius={0.01} />
                  <meshPhysicalMaterial {...POLISH.toyPlastic} color={isHero ? "#FF5A3C" : "#C9D0D7"} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* spectator tokens */}
      <primitive object={tokens} />

      {/* telestrator arrows: faint system flows + the hero exit route */}
      {!film && faint.map((pts, i) => (
        <Arrow key={i} pts={pts} color="#E8FFF0" radius={0.018} dashed={[0.3, 0.46]} glow={0.55} />
      ))}
      {!film && <Arrow pts={heroRoute} color={P.lane} radius={0.032} dashed={[0.28, 0.45]} glow={1.6} />}
      {!film && <Arrow pts={heroUp} color={P.lane} radius={0.026} glow={1.4} />}

      {/* the narrowest point: red pulse ring + width bracket + label */}
      {!film && (<group position={vomMid}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.75, 1]} ref={fx}>
          <ringGeometry args={[0.36 + pulse * 0.05, 0.4 + pulse * 0.05, 64]} />
          <meshBasicMaterial color="#FF5A3C" transparent opacity={0.9 - pulse * 0.3} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.75, 1]} position={[0, 0.002, 0]} ref={fx}>
          <ringGeometry args={[0.5, 0.52, 64]} />
          <meshBasicMaterial color="#FF8A6A" transparent opacity={0.45} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>)}
      {/* leader line + label sprite */}
      {!film && (<mesh position={[vomMid.x, vomMid.y + 0.42, vomMid.z]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.84, 8]} />
        <meshStandardMaterial color="#FF8A6A" emissive="#FF5A3C" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>)}
      {/* miniature floodlight masts at the board corners (foreground depth) */}
      {[
        [-(WALL.x + 0.35), -(WALL.z + 0.3)],
        [WALL.x + 0.35, -(WALL.z + 0.3)],
        [-(WALL.x + 0.35), WALL.z + 0.3],
        [WALL.x + 0.35, WALL.z + 0.3],
      ].map(([x, z], i) => (
        <group key={`m${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.05, 1.8, 12]} />
            <meshStandardMaterial color="#9AA6B2" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 1.86, 0]} rotation={[0.5, Math.atan2(-x, -z), 0]}>
            <RoundedBoxGeo args={[0.42, 0.22, 0.06]} radius={0.02} />
            <meshBasicMaterial color={P.flood} toneMapped={false} />
          </mesh>
          <sprite position={[0, 1.86, 0]} scale={[1.6, 1.6, 1]} ref={fx}>
            <spriteMaterial map={glow} color={P.flood} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}

      {/* far bokeh: soft studio lights behind the board */}
      {Array.from({ length: 26 }, (_, i) => {
        const r = prng(900 + i);
        const a = -Math.PI * 0.95 + r() * Math.PI * 0.9;
        const rad = 16 + r() * 8;
        return (
          <sprite key={`b${i}`} position={[Math.cos(a) * rad, 1 + r() * 7, Math.sin(a) * rad - 4]} scale={[1.5 + r() * 2, 1.5 + r() * 2, 1]} ref={fx}>
            <spriteMaterial
              map={glow}
              color={r() > 0.5 ? P.crowdWarm : P.crowdCool}
              transparent
              opacity={0.16 + 0.1 * Math.sin(t * 2 + i)}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        );
      })}
    </group>
  );
};

export type { Side, TokenSet };
