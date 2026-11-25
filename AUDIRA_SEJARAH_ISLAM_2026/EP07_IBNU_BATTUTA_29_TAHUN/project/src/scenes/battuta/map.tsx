// EP07 map layer: the same blue paper sea becomes a cut-paper map of the Old World. Land is raised card
// laid on the sea; Sumatra is the green island that carries the Sumutra diorama at its northern tip
// (drawn larger than life so the town fits: a pop-up-book liberty). North = +z, east = −x, 4 units per degree,
// Samudera Pasai (97.1 E, 5.2 N) at the world origin. Places and route from the register (#2, #6, #8, #9, #17).

import React, { useMemo } from "react";
import { CanvasTexture, CatmullRomCurve3, Matrix4, Quaternion, RepeatWrapping, SRGBColorSpace, TubeGeometry, Vector3 } from "three";
import { Cut, ShearPop, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { PaperBuilding } from "../../kits/paperworld/components/PaperBuilding.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { popEase } from "../../kits/paperworld/motion/easing.ts";
import { ConeDoll, PAL, tagTexture, BANK_Y } from "./world.tsx";

export const K = 4;
export const geo = (lon: number, lat: number, y = 0): V3 => [-K * (lon - 97.1), y, K * (lat - 5.2)];

const LAND_H = 1.2;
const LAND = "#efe2c4";

const poly = (name: string, ll: [number, number][]) => S.poly(name, ll.map(([lon, lat]) => { const p = geo(lon, lat); return [p[0], -p[2]] as [number, number]; }));

const AFRICA = poly("afr", [
  [-17, 21], [-16, 28], [-10, 30], [-9, 33], [-6, 35.8], [0, 35.8], [10, 37], [11, 34], [15, 32], [20, 31], [25, 31.5], [32, 31.3], [34, 29.5],
  [35, 24], [37, 19], [39, 15], [43, 12], [51, 11.8], [48, 5], [42, -2], [40, -10], [12, -10], [10, -2], [9, 4], [5, 6], [-5, 5], [-8, 4.5], [-13, 8], [-17, 14],
]);
const EURASIA = poly("eura", [
  [-10, 36.9], [-5.6, 36.1], [-2, 36.8], [0, 38.7], [3, 41.8], [6, 43.1], [9, 44.3], [12.5, 44], [16, 41], [18.5, 40.2], [19.5, 41.5], [22, 37], [24, 38],
  [26, 40.2], [27, 37], [30, 36.3], [36, 36.6], [35.5, 33], [34.8, 31.5], [34.9, 29.5], [36, 28], [39, 21.5], [42, 16], [43.3, 12.7], [45, 12.8], [52, 15.5],
  [55, 17], [57.5, 18.8], [59.8, 22.5], [56.4, 24.5], [56.2, 25.8], [54, 24.2], [51.5, 24.5], [50.5, 26], [48.5, 28.5], [48, 30], [50.3, 30], [54, 26.8],
  [57, 25.7], [61.5, 25.2], [66.6, 25.4], [68, 23.7], [70, 21], [72.8, 19], [73.8, 15.5], [74.8, 12.8], [76.3, 9.5], [77.5, 8], [78.2, 9], [79.8, 10.3],
  [80.3, 13.5], [80.2, 15.6], [82.3, 17], [85, 19.5], [87, 21.5], [89, 21.8], [91.5, 22.6], [92.4, 20.8], [94.3, 16.5], [97.6, 16.5], [98.6, 13],
  [98.3, 8.5], [100.3, 6.5], [101.6, 4.0], [103.5, 4.0], [103.4, 5.5], [102.2, 6.2], [101, 6.9], [100, 9.5], [99.2, 10.5], [99.5, 13], [100.5, 13.5],
  [101, 12.7], [103, 11], [104.5, 10.5], [105, 8.7], [106.7, 10.5], [108.9, 11.5], [109.3, 13.5], [108.6, 16], [106.6, 17.4], [106, 20], [108, 21.5],
  [110, 21], [113, 22.3], [117, 23.5], [120, 26.5], [122, 30], [121, 33], [125, 35], [125, 47], [-2, 47], [-1.5, 43.5], [-9, 43],
]);
const LANKA = poly("lanka", [[79.8, 9.8], [81.9, 8], [81.6, 6.2], [80.1, 6], [79.8, 8]]);
const BORNEO = poly("borneo", [[109, 1.5], [109.7, -1], [110.5, -3], [114, -3.8], [116.5, -2], [117.5, 1], [119, 5.2], [117, 7], [115, 5], [111, 2.3]]);
const JAVA = poly("java", [[105.8, -7.0], [108, -7.2], [111, -7.0], [114.5, -7.8], [114.4, -8.8], [111, -8.4], [108, -8.0], [106, -7.6]]);
// Sumatra, enlarged at its northern tip so the Sumutra diorama (bank 46 wide) sits on it; world units (x, −z).
const SUMATRA = S.poly("sumatra", [[26, 11.5], [-24, 11.5], [-30, 18], [-36, 32], [-40, 46], [-32, 47], [-18, 36], [2, 24], [18, 18], [26, 14]]);

const Land: React.FC<{ shape: ReturnType<typeof S.poly>; color?: string; h?: number }> = ({ shape, color = LAND, h = LAND_H }) => (
  <Cut shape={shape} color={color} depth={h} position={[0, h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} />
);

export const MapLands: React.FC = () => (
  <group>
    <Land shape={AFRICA} />
    <Land shape={EURASIA} />
    <Land shape={LANKA} />
    <Land shape={BORNEO} />
    <Land shape={JAVA} />
    <Land shape={SUMATRA} color="mintDeep" h={BANK_Y - 0.12} />
  </group>
);

// ── places ────────────────────────────────────────────────────────────────────────────────────────
export const PLACES = {
  tangier: geo(-5.8, 35.8),
  cairo: geo(31.2, 30.0),
  makkah: geo(39.8, 21.4),
  baghdad: geo(44.4, 33.3),
  bukhara: geo(64.4, 39.8),
  delhi: geo(77.2, 28.6),
  calicut: geo(75.8, 11.25),
  bengal: geo(91.8, 22.3),
  burma: geo(96.5, 16.8),
  china: geo(113, 23),
};

// ── the route: one red yarn from Tangier to the strait off Sumutra; the thin thread near the town continues it
const lift = (p: V3, y: number): Vector3 => new Vector3(p[0], y - 0.6, p[2]);
const WAY: Vector3[] = [
  lift(PLACES.tangier, LAND_H + 1.2),
  lift(geo(10, 34.5), LAND_H + 1.2),
  lift(PLACES.cairo, LAND_H + 1.2),
  lift(PLACES.makkah, LAND_H + 1.2),
  lift(PLACES.baghdad, LAND_H + 1.2),
  lift(PLACES.bukhara, LAND_H + 1.2),
  lift(PLACES.delhi, LAND_H + 1.2),
  lift(PLACES.calicut, LAND_H + 1.2),
  lift(geo(74.6, 9.0), 1.2),
  lift(geo(77.0, 6.4), 1.2),
  lift(geo(81.5, 4.6), 1.2),
  lift(geo(86.5, 11), 1.2),
  lift(geo(90.5, 20.0), 1.2),
  lift(geo(95.3, 14.8), 1.2),
  new Vector3(-7.5, 0.6, 30),
];
/** Arc-length position (0–1) of each waypoint on the route curve. */
export const ROUTE_CURVE = new CatmullRomCurve3(WAY, false, "centripetal");
const nearestU = (p: Vector3) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i <= 2000; i++) {
    const u = i / 2000;
    const d = ROUTE_CURVE.getPointAt(u).distanceToSquared(p);
    if (d < bd) { bd = d; best = u; }
  }
  return best;
};
export const ROUTE_U = {
  tangier: 0,
  makkah: nearestU(WAY[3]),
  delhi: nearestU(WAY[6]),
  calicut: nearestU(WAY[7]),
  burma: nearestU(WAY[13]),
  end: 1,
};

const Yarn: React.FC<{ curve: CatmullRomCurve3; progress: number; color: string; r: number; reverse?: boolean }> = ({ curve, progress, color, r, reverse = false }) => {
  const geom = useMemo(() => new TubeGeometry(curve, 900, r, 8, false), [curve, r]);
  const n = geom.index ? geom.index.count : 0;
  const per = n / 900;
  const segs = Math.floor(900 * Math.min(1, Math.max(0, progress)));
  if (reverse) geom.setDrawRange(Math.floor((900 - segs) * per), Math.floor(segs * per));
  else geom.setDrawRange(0, Math.floor(segs * per));
  return <mesh geometry={geom} material={paperFace(color, { relief: 0.4 })} castShadow visible={segs > 0} />;
};

const RETURN_CURVE = new CatmullRomCurve3(WAY.map((p) => new Vector3(p.x - 2.6, p.y + 1.2, p.z - 2.6)), false, "centripetal");

export const MapRoute: React.FC<{ progress: number; back: number }> = ({ progress, back }) => (
  <group>
    <Yarn curve={ROUTE_CURVE} progress={progress} color={PAL.route} r={0.5} />
    {/* the way home, drawn in gold from Sumatra back to the far west */}
    <Yarn curve={RETURN_CURVE} progress={back} color="#d9a441" r={0.42} reverse />
  </group>
);

// ── tags: printed names on dark plates that turn to face the camera and keep a readable size ──────
export const MapTag: React.FC<{ at: V3; title: string; sub?: string; show: number; cam: Vector3; size?: number; lift?: number }> = ({ at, title, sub = "", show, cam, size = 1, lift = 2 }) => {
  const tex = useMemo(() => tagTexture(title, sub, 128), [title, sub]);
  if (show <= 0.001) return null;
  const p = new Vector3(...at);
  const d = cam.distanceTo(p);
  const k = Math.min(7.5, Math.max(0.35, d / 88)) * size * popEase(Math.min(1, show));
  const w = 22, h = (w * 440) / 1400;
  const m = new Matrix4().lookAt(cam, p, new Vector3(0, 1, 0));
  const q = new Quaternion().setFromRotationMatrix(m);
  return (
    <group position={[p.x, p.y + 6 * k + lift, p.z]} quaternion={q} scale={k}>
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[w + 1, h + 1]} />
        <meshStandardMaterial color="#f3ead9" roughness={1} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
      </mesh>
    </group>
  );
};

// ── landmarks (pop-up cards at map scale) ────────────────────────────────────────────────────────
/** Tangier: a whitewashed wall with an arched gate facing east, two towers and a square minaret. */
export const Tangier: React.FC<{ t: number }> = ({ t }) => {
  const at = PLACES.tangier;
  return (
    <ShearPop t={t} position={[at[0], LAND_H, at[2]]} yaw={-Math.PI / 2}>
      <Cut shape={S.rect(34, 7, 0, [{ kind: "arch", x: 0, y: 0, w: 4.6, h: 6 }])} color="ivoryLight" depth={0.6} />
      <Cut shape={S.frame("arch", 6.2, 7.0, "arch", 4.6, 6.0)} color="coral" depth={0.8} />
      {[-15, 15].map((x, i) => (
        <PaperBuilding key={i} b={{ w: 4.2, d: 4.2, h: 10, roof: "step", wall: "ivory", roofColor: "ivoryShade", trim: "goldLight", window: "brownDeep", cols: 1, rows: 2, seed: 30 + i }} position={[x, 0, -1]} />
      ))}
      <PaperBuilding b={{ w: 3.6, d: 3.6, h: 15, roof: "step", wall: "ivoryShade", roofColor: "mintDeep", trim: "mint", window: "brownDeep", cols: 1, rows: 3, seed: 40 }} position={[6, 0, -9]} />
      <PaperBuilding b={{ w: 9, d: 6, h: 5, roof: "flat", wall: "ivory", roofColor: "ivoryShade", trim: "goldLight", window: "cobaltDeep", cols: 3, rows: 1, seed: 41 }} position={[-6, 0, -10]} />
      <PaperBuilding b={{ w: 7, d: 6, h: 6.5, roof: "flat", wall: "ivoryLight", roofColor: "ivoryShade", trim: "coral", window: "cobaltDeep", cols: 2, rows: 2, seed: 42 }} position={[13, 0, -12]} />
    </ShearPop>
  );
};

/** Delhi: a broad palace hall with two domes, and the qadi seated with his book in front of it. */
export const Delhi: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const at = PLACES.delhi;
  return (
    <ShearPop t={t} position={[at[0], LAND_H, at[2]]} yaw={Math.PI}>
      <PaperBuilding b={{ w: 20, d: 8, h: 8, roof: "step", rh: 3, wall: "coralLight", roofColor: "coralDeep", trim: "goldLight", window: "brownDeep", cols: 5, rows: 1, door: "goldDeep", seed: 50 }} position={[0, 0, -4]} />
      {[-6, 6].map((x, i) => (
        <group key={i} position={[x, 8.8, -4]}>
          <mesh castShadow material={paperFace("goldLight")}>
            <sphereGeometry args={[2.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      ))}
      <Cut shape={S.rectC(12, 7)} color="coral" depth={0.2} position={[0, 0.1, 4]} rotation={[-Math.PI / 2, 0, 0]} />
      <ConeDoll h={6} seated robe="ivoryLight" sash="cobalt" turban="ivory" book position={[0, 0.2, 4]} yaw={0} s={s} />
    </ShearPop>
  );
};

/** The storm off Calicut: curling wave cards and dark clouds; a small junk heels over. */
export const Storm: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const at = PLACES.calicut;
  const base: V3 = [at[0] + 12, 0, at[2] + 2];
  const rock = Math.sin(s * 3.2) * 0.22 * t;
  return (
    <group position={base} visible={t > 0.005}>
      {[0, 1, 2, 3].map((i) => (
        <ShearPop key={i} t={t} position={[(i - 1.5) * 7, 0, -i * 2.2]} yaw={0}>
          <group rotation={[0, 0, Math.sin(s * 2.4 + i) * 0.08]}>
            <Cut shape={S.path(`curl-${i}`, (p) => { p.moveTo(-6, 0); p.quadraticCurveTo(-3, 7 + i, 2, 8 + i); p.quadraticCurveTo(5, 8, 4, 5.5); p.quadraticCurveTo(2.5, 6.8, 1.5, 4.5); p.quadraticCurveTo(3, 2, 6, 0); p.lineTo(-6, 0); })}
              color={i % 2 ? PAL.seaLight : "cobaltDeep"} depth={0.3} />
          </group>
        </ShearPop>
      ))}
      <group position={[0, 2.2, 10]} rotation={[0, 0.25, rock + 0.3 * t]} scale={3.2 * t + 0.001}>
        <Cut shape={S.poly("mini-hull", [[-3, 1.4], [-2.6, 0], [2.4, 0], [3.2, 1.2]])} color="brownDeep" depth={1.6} />
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, 0.5]} material={paperFace("brownDeep")}><cylinderGeometry args={[0.1, 0.1, 4, 6]} /></mesh>
      </group>
      {[[-8, 26, -4, 12], [6, 30, -8, 14], [-2, 34, -12, 10]].map(([x, y, z, w], i) => (
        <ShearPop key={i} t={t} position={[x, 0, z]}>
          <Cut shape={S.cloud(w, w * 0.45, 4)} color="#5b6478" depth={0.4} position={[0, y - 10, 0]} />
        </ShearPop>
      ))}
      <ShearPop t={t} position={[-17, 0, -10]}>
        <Cut shape={S.poly("bolt", [[0, 22], [2.4, 16], [0.8, 16], [2.8, 9], [-0.8, 15], [0.9, 15], [-1.2, 22]])} color="goldLight" depth={0.3} />
      </ShearPop>
    </group>
  );
};

/** The AUDIRA plaque: a printed card pinned on the Indian Ocean, readable from the overview. */
export const AudiraPlaque: React.FC<{ cam: Vector3; show: number }> = ({ cam, show }) => (
  <MapTag at={geo(62, 2, 1)} title="AUDIRA" sub="PETA PERJALANAN IBNU BATTUTA" show={show} cam={cam} size={1.15} />
);

// ── patina: an aged-chart overlay (soft stains, engraved sea hatching) over the map, away from the town ──
const patinaTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d")!;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * 1024, y = rnd() * 1024, r = 30 + rnd() * 160;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.03 + rnd() * 0.06;
    grd.addColorStop(0, `rgba(110,72,40,${a})`);
    grd.addColorStop(1, "rgba(110,72,40,0)");
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.strokeStyle = "rgba(40,30,25,0.11)";
  g.lineWidth = 2;
  for (let y = 12; y < 1024; y += 22) {
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const yy = y + Math.sin((x + y * 3) / 37) * 4;
      if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** One stained-chart sheet over the whole map at y 1.34: under the town's bank (1.4), over the island and sea.
 *  It fades out while the camera is at the coast, where it would cover the near sea and the junk's hull. */
export const MapPatina: React.FC<{ opacity: number }> = ({ opacity }) => {
  const tex = useMemo(() => { const t = patinaTexture(); t.repeat.set(640 / 70, 380 / 70); return t; }, []);
  if (opacity <= 0.01) return null;
  return (
    <mesh position={[170, 1.34, 35]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <planeGeometry args={[640, 380]} />
      <meshStandardMaterial map={tex} transparent opacity={opacity} depthWrite={false} roughness={1} />
    </mesh>
  );
};


/** Makkah as a plain town pop-up (flat-roofed houses on hills); no sacred building is depicted. */
export const MakkahTown: React.FC<{ t: number }> = ({ t }) => {
  const at = PLACES.makkah;
  const houses: [number, number, number, number, string][] = [
    [-11, 0, 5, 4, "ivoryLight"], [-6, -3, 4, 6, "ivory"], [-1, 1, 6, 4.5, "goldLight"], [5, -2, 4, 7, "ivoryShade"], [10, 1, 5, 4, "ivoryLight"],
    [-8, -9, 5, 5, "goldLight"], [0, -8, 6, 6.5, "ivory"], [8, -9, 5, 5.5, "ivoryLight"],
  ];
  return (
    <ShearPop t={t} position={[at[0], LAND_H, at[2]]} yaw={Math.PI}>
      <Cut shape={S.hill(46, 12, 0.4, 0.2)} color="brownLight" depth={0.4} position={[0, 0, -16]} />
      <Cut shape={S.hill(38, 8, 0.4, -0.3)} color="#c9a57e" depth={0.4} position={[4, 0, -13]} />
      {houses.map(([x, z, w, h, c], i) => (
        <PaperBuilding key={i} b={{ w, d: w * 0.8, h, roof: "flat", wall: c, roofColor: "ivoryShade", trim: "goldDeep", window: "brownDeep", cols: 2, rows: Math.max(1, Math.round(h / 3)), seed: 70 + i }} position={[x, 0, z]} />
      ))}
    </ShearPop>
  );
};

/** Head of the route: the traveller's junk riding the thread on sea legs. */
export const routePoint = (u: number) => ROUTE_CURVE.getPointAt(Math.min(1, Math.max(0, u)));
export const routeHeading = (u: number) => {
  const tg = ROUTE_CURVE.getTangentAt(Math.min(0.999, Math.max(0.001, u)));
  return Math.atan2(tg.x, tg.z);
};
