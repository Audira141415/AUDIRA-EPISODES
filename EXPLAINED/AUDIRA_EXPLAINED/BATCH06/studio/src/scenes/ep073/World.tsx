// AE-073 world — "Bagaimana Rumah Bisa Dicetak dengan Printer 3D?" (SATISFYFORGE).
// A gantry printer (steel portal, slate blue with orange accents) stands around a house plan on a
// concrete slab, inside a pastel studio cyclorama. The print head extrudes a light-grey mortar
// bead onto a half-built wall with a big rounded corner. Every wall is two thin skins joined by a
// zigzag web with open cavities (research: "Saran visual akurat"); beads stack into horizontal
// corduroy ribs. Process = extrusion, not spraying. Deterministic: frame clock + seeded values only.

import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { MANROPE } from "../../core/type/fonts.ts";

export const C = {
  floor: "#F2C9BC",
  wall: "#CBBDEE",
  slab: "#E9E2DA",
  mortar: "#D8D4CF",
  mortarFresh: "#C9C4BE",
  steel: "#6F86AE",
  steelDark: "#5A6E92",
  orange: "#FF9A52",
  hose: "#3B3946",
  silo: "#F4EFEA",
  ink: "#3F3554",
  pink: "#FF8DB6",
  mint: "#6FD8B0",
  butter: "#FFD96A",
  lilac: "#A98BF0",
};

// ---------- house plan (centre line of the wall) ----------
export const A = 3.4; // half size x
export const B = 2.6; // half size z
export const R_BIG = 2.0; // big rounded corner (+x,+z), faces the camera
export const R_S = 0.45;
export const SLAB_TOP = 0.3;
export const LAYER_H = 0.065; // visually exaggerated (real beads 1–4 cm) so the ribs read on a phone
export const LAYERS = 18;
export const SKIN = 0.15; // half wall thickness (centre of each skin)
export const BEAD_R = 0.05;
const HEAD_THETA = Math.PI * 0.3;

type Sample = { p: THREE.Vector2; n: THREE.Vector2 };

const planSamples = (): Sample[] => {
  const corners: { c: [number, number]; r: number; a0: number }[] = [
    { c: [A - R_BIG, B - R_BIG], r: R_BIG, a0: 0 },
    { c: [-A + R_S, B - R_S], r: R_S, a0: Math.PI / 2 },
    { c: [-A + R_S, -B + R_S], r: R_S, a0: Math.PI },
    { c: [A - R_S, -B + R_S], r: R_S, a0: Math.PI * 1.5 },
  ];
  const out: Sample[] = [];
  const step = 0.06;
  corners.forEach((k, i) => {
    const arcN = Math.max(6, Math.ceil((k.r * Math.PI) / 2 / step));
    for (let j = 0; j < arcN; j++) {
      const a = k.a0 + (j / arcN) * (Math.PI / 2);
      const n = new THREE.Vector2(Math.cos(a), Math.sin(a));
      out.push({ p: new THREE.Vector2(k.c[0] + n.x * k.r, k.c[1] + n.y * k.r), n });
    }
    const nx = corners[(i + 1) % 4];
    const aEnd = k.a0 + Math.PI / 2;
    const nEnd = new THREE.Vector2(Math.cos(aEnd), Math.sin(aEnd));
    const s = new THREE.Vector2(k.c[0] + nEnd.x * k.r, k.c[1] + nEnd.y * k.r);
    const e = new THREE.Vector2(nx.c[0] + nEnd.x * nx.r, nx.c[1] + nEnd.y * nx.r);
    const len = s.distanceTo(e);
    const segN = Math.max(1, Math.ceil(len / step));
    for (let j = 0; j < segN; j++) out.push({ p: s.clone().lerp(e, j / segN), n: nEnd.clone() });
  });
  return out;
};

export const SAMPLES = planSamples();
const headIndex = (() => {
  const target = new THREE.Vector2(A - R_BIG + Math.cos(HEAD_THETA) * R_BIG, B - R_BIG + Math.sin(HEAD_THETA) * R_BIG);
  let best = 0;
  SAMPLES.forEach((s, i) => {
    if (s.p.distanceTo(target) < SAMPLES[best].p.distanceTo(target)) best = i;
  });
  return best;
})();

/** Point on the outer face of the big rounded corner at angle theta, height y. */
export const cornerPoint = (theta: number, y: number) =>
  new THREE.Vector3(A - R_BIG + Math.cos(theta) * (R_BIG + SKIN + BEAD_R), y, B - R_BIG + Math.sin(theta) * (R_BIG + SKIN + BEAD_R));

/** World position of the nozzle tip and the direction the bead is travelling. */
export const HEAD = (() => {
  const s = SAMPLES[headIndex];
  const pos = new THREE.Vector3(s.p.x + s.n.x * SKIN, SLAB_TOP + LAYERS * LAYER_H + 0.07, s.p.y + s.n.y * SKIN);
  return { pos, normal: s.n };
})();

export const offsetPts = (d: number, from = 0, to = SAMPLES.length, closed = true) => {
  const pts: THREE.Vector3[] = [];
  const n = SAMPLES.length;
  for (let i = from; i < to; i++) {
    const s = SAMPLES[((i % n) + n) % n];
    pts.push(new THREE.Vector3(s.p.x + s.n.x * d, 0, s.p.y + s.n.y * d));
  }
  if (closed) pts.push(pts[0].clone());
  return pts;
};

/** Zigzag web between the skins: alternates inner/outer every ~0.42 m along the centre line. */
export const zigPts = (from = 0, to = SAMPLES.length) => {
  const pts: THREE.Vector3[] = [];
  const n = SAMPLES.length;
  const every = 7;
  for (let i = from; i <= to; i += every) {
    const s = SAMPLES[((i % n) + n) % n];
    const side = Math.floor(i / every) % 2 === 0 ? 1 : -1;
    const d = side * (SKIN - 0.02);
    pts.push(new THREE.Vector3(s.p.x + s.n.x * d, 0, s.p.y + s.n.y * d));
  }
  return pts;
};

export const beadGeo = (pts: THREE.Vector3[], closed: boolean, r = BEAD_R) => {
  const curve = new THREE.CatmullRomCurve3(pts, closed, "catmullrom", 0.1);
  const seg = Math.min(1400, Math.max(40, pts.length * 2));
  const g = new THREE.TubeGeometry(curve, seg, r, 10, closed);
  g.scale(1, 0.72, 1); // flattened, rounded bead
  return g;
};

// ---------- printed walls ----------
export const PrintedWalls: React.FC<{ grain: THREE.Texture }> = ({ grain }) => {
  const geos = useMemo(() => {
    const outer = beadGeo(offsetPts(SKIN).slice(0, -1), true);
    const inner = beadGeo(offsetPts(-SKIN).slice(0, -1), true);
    const zz = zigPts(0, SAMPLES.length);
    const zig = beadGeo(zz, false, BEAD_R * 0.8);
    // current layer: trailing bead behind the nozzle (60 % of the loop)
    const len = Math.round(SAMPLES.length * 0.6);
    const pOuter = beadGeo(offsetPts(SKIN, headIndex - len, headIndex + 1, false), false);
    const pInner = beadGeo(offsetPts(-SKIN, headIndex - len - 30, headIndex - 60, false), false);
    const pZig = beadGeo(zigPts(headIndex - len, headIndex - 90), false, BEAD_R * 0.8);
    return { outer, inner, zig, pOuter, pInner, pZig };
  }, []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...POLISH.clay,
        color: C.mortar,
        roughness: 0.82,
        sheen: 0.3,
        sheenColor: new THREE.Color("#ffffff"),
        bumpMap: grain,
        bumpScale: 1.2,
      }),
    [grain],
  );
  const matB = useMemo(() => {
    const m = mat.clone();
    m.color = new THREE.Color("#BEB8B1");
    return m;
  }, [mat]);
  const fresh = useMemo(
    () => new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color: C.mortarFresh, roughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color("#ffffff"), bumpMap: grain, bumpScale: 1 }),
    [grain],
  );
  const ys = Array.from({ length: LAYERS }, (_, i) => SLAB_TOP + LAYER_H * (i + 0.5));
  const yTop = SLAB_TOP + LAYER_H * (LAYERS + 0.5);
  return (
    <group>
      {ys.map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh geometry={geos.outer} material={i % 2 ? matB : mat} castShadow receiveShadow />
          <mesh geometry={geos.inner} material={i % 2 ? matB : mat} castShadow receiveShadow />
          <mesh geometry={geos.zig} material={i % 2 ? matB : mat} castShadow receiveShadow />
        </group>
      ))}
      <group position={[0, yTop, 0]}>
        <mesh geometry={geos.pOuter} material={fresh} castShadow receiveShadow />
        <mesh geometry={geos.pInner} material={fresh} castShadow receiveShadow />
        <mesh geometry={geos.pZig} material={fresh} castShadow receiveShadow />
      </group>
    </group>
  );
};

// ---------- gantry printer ----------
export const COL_X = 5.0;
export const COL_Z = 4.3;
export const COL_H = 5.8;
export const RAIL_Y = HEAD.pos.y + 1.95; // side beams ride up the towers as the wall grows
const BRIDGE_Y = RAIL_Y + 0.6;

export const Steel: React.FC<{ color?: string }> = ({ color = C.steel }) => (
  <meshPhysicalMaterial color={color} roughness={0.38} metalness={0.55} clearcoat={0.5} clearcoatRoughness={0.25} />
);
export const Accent: React.FC = () => <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.orange} roughness={0.32} clearcoat={0.7} />;

export const useLabel = (text: string, w = 1024, h = 192, bg = C.orange, fg = "#FFFFFF") =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.font = `600 ${Math.round(h * 0.6)}px ${MANROPE}, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as unknown as { letterSpacing: string }).letterSpacing = `${Math.round(h * 0.16)}px`;
    g.fillStyle = fg;
    g.fillText(text, w / 2 + h * 0.08, h / 2 + h * 0.04);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text, w, h, bg, fg]);

export const Tower: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.9, 0.16, 0.9]} radius={0.05} />
      <Steel color={C.steelDark} />
    </mesh>
    <mesh position={[0, COL_H / 2, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.36, COL_H, 0.36]} radius={0.05} />
      <Steel />
    </mesh>
    {/* rack strip on the tower face */}
    <mesh position={[0, COL_H / 2, x > 0 ? 0 : 0]} castShadow>
      <boxGeometry args={[0.4, COL_H - 0.4, 0.08]} />
      <Steel color={C.steelDark} />
    </mesh>
    {/* sleeve carrying the side beam */}
    <mesh position={[0, RAIL_Y, 0]} castShadow>
      <RoundedBoxGeo args={[0.56, 0.7, 0.56]} radius={0.08} />
      <Accent />
    </mesh>
    <mesh position={[0, COL_H + 0.06, 0]} castShadow>
      <RoundedBoxGeo args={[0.5, 0.14, 0.5]} radius={0.05} />
      <Accent />
    </mesh>
  </group>
);

export const HS = 1.8;
export const Gantry: React.FC = () => {
  const label = useLabel("AUDIRA");
  const hx = HEAD.pos.x;
  const hz = HEAD.pos.z;
  return (
    <group>
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Tower key={`${sx}${sz}`} x={sx * COL_X} z={sz * COL_Z} />))}
      {/* side beams along z */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * COL_X, RAIL_Y, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.34, 0.46, COL_Z * 2 + 0.5]} radius={0.06} />
          <Steel />
        </mesh>
      ))}
      {/* bridge along x */}
      <group position={[0, BRIDGE_Y, hz]}>
        <mesh castShadow receiveShadow>
          <RoundedBoxGeo args={[COL_X * 2 + 0.6, 0.82, 0.5]} radius={0.08} />
          <Steel />
        </mesh>
        {/* orange accent stripe + AUDIRA plate on the front face */}
        <mesh position={[0, -0.34, 0.256]}>
          <planeGeometry args={[COL_X * 2 + 0.4, 0.07]} />
          <Accent />
        </mesh>
        <mesh position={[-2.3, 0.05, 0.258]}>
          <planeGeometry args={[3.1, 0.58]} />
          <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.6} />
        </mesh>
        {/* end trucks riding on the side beams */}
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * COL_X, -0.2, 0]} castShadow>
            <RoundedBoxGeo args={[0.6, 0.6, 0.8]} radius={0.08} />
            <Accent />
          </mesh>
        ))}
      </group>
      {/* carriage + print head */}
      <group position={[hx, 0, hz]}>
        <mesh position={[0, BRIDGE_Y, 0]} castShadow>
          <RoundedBoxGeo args={[0.8, 0.8, 0.82]} radius={0.1} />
          <Accent />
        </mesh>
        <mesh position={[0, (BRIDGE_Y + HEAD.pos.y + HS * 0.8) / 2, 0]} castShadow>
          <RoundedBoxGeo args={[0.34, BRIDGE_Y - HEAD.pos.y - HS * 0.8, 0.34]} radius={0.06} />
          <Steel color={C.steelDark} />
        </mesh>
        {/* print head, drawn ~1.8x so it reads on a phone; anchored at the nozzle tip */}
        <group position={[0, HEAD.pos.y, 0]} scale={HS}>
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
          {/* mortar leaving the nozzle (extruded, not sprayed) */}
          <mesh position={[0, 0.0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.034, 0.05, 20]} />
            <meshPhysicalMaterial {...POLISH.clay} color={C.mortarFresh} roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ---------- pump hose ----------
export const Hose: React.FC = () => {
  const geo = useMemo(() => {
    const hx = HEAD.pos.x;
    const hz = HEAD.pos.z;
    const pts = [
      [-4.0, 0.85, -5.0],
      [-4.4, 0.12, -3.8],
      [-5.7, 0.1, -1.5],
      [-5.9, 0.1, 1.5],
      [-5.35, 0.9, 3.6],
      [-4.9, RAIL_Y + 0.7, 3.2],
      [-4.2, BRIDGE_Y + 0.45, hz - 0.1],
      [-1.0, BRIDGE_Y + 0.4, hz - 0.12],
      [hx - 0.9, BRIDGE_Y + 0.55, hz - 0.1],
      [hx - 0.25, BRIDGE_Y + 0.1, hz + 0.2],
      [hx - 0.55, HEAD.pos.y + 2.0, hz + 0.5],
      [hx - 0.45, HEAD.pos.y + 1.55, hz + 0.4],
      [hx - 0.22, HEAD.pos.y + 1.36, hz + 0.12],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal"), 260, 0.075, 14, false);
  }, []);
  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial color={C.hose} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
    </mesh>
  );
};

// ---------- silo + mixer pump ----------
export const Silo: React.FC = () => {
  const label = useLabel("MORTAR", 512, 128, C.orange, "#FFFFFF");
  return (
    <group position={[-6.4, 0, -5.8]}>
      {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.1, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.2, 10]} />
          <Steel color={C.steelDark} />
        </mesh>
      ))}
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.25, 1.0, 40]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.silo} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 1.8, 48]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.silo} />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <sphereGeometry args={[0.95, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.silo} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <cylinderGeometry args={[0.965, 0.965, 0.32, 48, 1, true]} />
        <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* mixer-pump unit */}
      <group position={[2.4, 0, 0.3]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.4, 0.9, 1.0]} radius={0.12} />
          <Accent />
        </mesh>
        <mesh position={[0, 1.02, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.3, 0.3, 32]} />
          <Steel />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.14, 0.52]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.1, 20]} />
            <meshPhysicalMaterial color={C.hose} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------- slab, studio, props ----------
export const Slab: React.FC<{ grain: THREE.Texture }> = ({ grain }) => (
  <mesh position={[0, SLAB_TOP / 2, 0]} castShadow receiveShadow>
    <RoundedBoxGeo args={[A * 2 + 1.4, SLAB_TOP, B * 2 + 1.4]} radius={0.08} />
    <meshPhysicalMaterial {...POLISH.stone} color={C.slab} bumpMap={grain} bumpScale={0.8} />
  </mesh>
);

export const Studio: React.FC = () => {
  const cove = useMemo(() => {
    const g = new THREE.CylinderGeometry(7, 7, 240, 48, 1, true, Math.PI, Math.PI / 2);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} receiveShadow>
        <planeGeometry args={[240, 60]} />
        <meshStandardMaterial color={C.floor} roughness={0.92} />
      </mesh>
      <mesh geometry={cove} position={[0, 7, -24]} receiveShadow>
        <meshStandardMaterial color={C.floor} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 30, -31]} receiveShadow>
        <planeGeometry args={[240, 50]} />
        <meshStandardMaterial color={C.wall} roughness={0.95} />
      </mesh>
    </group>
  );
};

export const Cone: React.FC<{ p: [number, number, number]; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.5, 0.06, 0.5]} radius={0.02} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.orange} />
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <coneGeometry args={[0.18, 0.7, 32]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.orange} />
    </mesh>
    <mesh position={[0, 0.36, 0]}>
      <cylinderGeometry args={[0.105, 0.125, 0.12, 32, 1, true]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color="#FFFFFF" />
    </mesh>
  </group>
);

/** Small cut sample of a printed wall: two skins + zigzag web + open cavities. */
export const WallSample: React.FC<{ grain: THREE.Texture; layers?: number }> = ({ grain, layers = 9 }) => {
  const geos = useMemo(() => {
    const L = 1.1;
    const line = (z: number) => [new THREE.Vector3(-L / 2, 0, z), new THREE.Vector3(L / 2, 0, z)];
    const zig: THREE.Vector3[] = [];
    for (let i = 0; i <= 4; i++) zig.push(new THREE.Vector3(-L / 2 + (i * L) / 4, 0, i % 2 ? 0.13 : -0.13));
    const mk = (pts: THREE.Vector3[]) => {
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 40, 0.05, 10, false);
      g.scale(1, 0.72, 1);
      return g;
    };
    return [mk(line(0.15)), mk(line(-0.15)), mk(zig)];
  }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color: C.mortar, roughness: 0.82, bumpMap: grain, bumpScale: 1.2 }), [grain]);
  const matB = useMemo(() => new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color: "#BEB8B1", roughness: 0.82, bumpMap: grain, bumpScale: 1.2 }), [grain]);
  return (
    <group>
      {Array.from({ length: layers }, (_, i) => (
        <group key={i} position={[0, 0.035 + i * LAYER_H, 0]}>
          {geos.map((g, k) => (
            <mesh key={k} geometry={g} material={i % 2 ? matB : mat} castShadow receiveShadow />
          ))}
        </group>
      ))}
    </group>
  );
};

export const World: React.FC<{ f: number }> = ({ f }) => {
  const grain = useSurfaceGrain(73, 0.35, 8);
  const slabGrain = useSurfaceGrain(31, 0.3, 4);
  return (
    <group>
      <Studio />
      <Slab grain={slabGrain} />
      <PrintedWalls grain={grain} />
      <Gantry />
      <Hose />
      <Silo />
      {/* operators: hi-vis tops, hard hats (cap), skin differs from clothes */}
      <ToyPerson f={f} seed={12} pose="stand" outfit="casual" position={[0.9, 0, 5.2]} heading={-2.6} scale={1.7} look={{ top: C.orange, bottom: "#3E4F6E", hairStyle: 2, cap: C.butter, height: 1 }} />
      <ToyPerson f={f} seed={27} pose="wave" outfit="casual" position={[-6.4, 0, -2.0]} heading={0.9} scale={1.7} look={{ top: C.orange, bottom: "#56607A", hairStyle: 2, cap: "#FFFFFF", height: 0.98 }} />
    </group>
  );
};

/** Mortar bucket (foreground prop). */
export const Bucket: React.FC<{ grain: THREE.Texture }> = ({ grain }) => (
  <group>
    <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.24, 0.56, 40, 1, true]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.mint} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.01, 0]} receiveShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.02, 40]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.mint} />
    </mesh>
    <mesh position={[0, 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.3, 0.025, 10, 40]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} color={C.mint} />
    </mesh>
    <mesh position={[0, 0.47, 0]} scale={[1, 0.25, 1]}>
      <sphereGeometry args={[0.28, 32, 16]} />
      <meshPhysicalMaterial {...POLISH.clay} color={C.mortarFresh} bumpMap={grain} bumpScale={1.5} />
    </mesh>
    <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.3, 0.012, 8, 32, Math.PI]} />
      <meshPhysicalMaterial color="#C9CED6" metalness={0.9} roughness={0.25} />
    </mesh>
  </group>
);
