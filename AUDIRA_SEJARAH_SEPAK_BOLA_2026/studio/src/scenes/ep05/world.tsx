// EP05 world (TACTICBOARD): the cover's pitch board. Title stacks (one puck = one league title) rise,
// slide and sink like tokens on a coach's board; in the streak section the pucks lie in lanes
// (one puck = one consecutive title). Every value is a pure function of t (seconds).
import React, { useMemo } from "react";
import * as THREE from "three";
import { PitchBoard3D } from "../../kits/tacticboard/scene/PitchBoard3D";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { prng } from "../../kits/tacticboard/core/motion";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { T, SEC, clamp, lerp, seg, smooth, win } from "./timing.ts";

export type V3 = [number, number, number];
export const GREEN = "#2BD46A";
export const GOLD = P.goalGold;
export const CHALK = "#FFE27A";

// ---------------------------------------------------------------- title stacks
export const PR = 0.4;
export const PH = 0.046;
export const topY = (n: number) => n * PH;

export type StackDef = { key: string; name: string; country: string; body: string; alt: string; hoops?: boolean; seed: number };
export const STACKS: Record<string, StackDef> = {
  lin: { key: "lin", name: "LINFIELD", country: "IRLANDIA UTARA", body: "#2F6FE4", alt: "#F4F6EE", seed: 23 },
  cel: { key: "cel", name: "CELTIC", country: "SKOTLANDIA", body: "#159A4C", alt: "#F4F6EE", hoops: true, seed: 11 },
  ran: { key: "ran", name: "RANGERS", country: "SKOTLANDIA", body: "#16337F", alt: "#D3202E", seed: 37 },
  rea: { key: "rea", name: "REAL MADRID", country: "SPANYOL", body: "#F2F2EE", alt: "#C9A34A", seed: 51 },
};

export type StackState = { x: number; z: number; rise: number; n: number; drop: number };
/** Where each stack is, how far it has risen out of the board, how many pucks, last-puck drop progress. */
export const stackState = (key: string, t: number): StackState => {
  const sinkAll = 1 - seg(t, SEC.PENJELASAN[0] + 0.05, SEC.PENJELASAN[0] + 1.0);
  const glas = seg(t, T.tepat - 0.1, T.tepat + 1.1); // reshuffle for Glasgow
  switch (key) {
    case "lin":
      // the record holder comes back alone for the outro (hero object under the teaser card)
      if (t > SEC.OUTRO[0]) return { x: 0, z: 0.6, rise: seg(t, SEC.OUTRO[0] + 0.3, SEC.OUTRO[0] + 1.5), n: 57, drop: 1 };
      return { x: 0, z: lerp(0.6, -0.9, glas), rise: sinkAll, n: 57, drop: 1 };
    case "cel": {
      const before = t < 10;
      const rise = before ? 1 - seg(t, 6.0, 6.9) : seg(t, T.tepat + 0.2, T.tepat + 1.2) * sinkAll;
      // Celtic was level with Rangers on 55 until May 2026; the 56th puck drops on "menyalip"
      const n = before ? 56 : t < T.menyalip - 0.05 ? 55 : 56;
      const drop = before ? 1 : seg(t, T.menyalip - 0.05, T.menyalip + 0.4);
      return { x: before ? -1.24 : -0.62, z: before ? 0.6 : 0.95, rise, n, drop };
    }
    case "ran": {
      const before = t < 10;
      const rise = before ? 1 - seg(t, 6.15, 7.05) : seg(t, T.tepat + 0.45, T.tepat + 1.45) * sinkAll;
      return { x: before ? 1.24 : 0.62, z: before ? 0.6 : 0.95, rise, n: 55, drop: 1 };
    }
    case "rea": {
      const rise = seg(t, T.real1 - 0.1, T.real1 + 0.9) * (1 - seg(t, T.tepat - 0.2, T.tepat + 0.6));
      return { x: 1.24, z: 0.6, rise, n: 36, drop: 1 };
    }
  }
  return { x: 0, z: 0, rise: 0, n: 0, drop: 1 };
};

const numberTexture = (n: number, bg: string, fg = "#FFFFFF") => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = fg === "#FFFFFF" ? "rgba(255,255,255,0.92)" : fg;
  g.lineWidth = 12;
  g.beginPath();
  g.arc(128, 128, 104, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = fg;
  g.font = "bold 120px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 128, 136);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const puckGeo = new THREE.CylinderGeometry(PR, PR, PH * 0.94, 40);
const matCache = new Map<string, THREE.MeshPhysicalMaterial>();
const puckMat = (color: string, grain?: THREE.Texture) => {
  const k = color + (grain ? grain.uuid : "");
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ ...POLISH.brickABS, color, roughnessMap: grain ?? null });
    matCache.set(k, m);
  }
  return m;
};

const Stack: React.FC<{ def: StackDef; s: StackState }> = ({ def, s }) => {
  const grain = useSurfaceGrain(def.seed, 0.12, 3);
  const pucks = useMemo(() => {
    const r = prng(def.seed * 97);
    return Array.from({ length: 60 }, (_, i) => ({
      dx: (r() - 0.5) * 0.022,
      dz: (r() - 0.5) * 0.022,
      rot: r() * Math.PI * 2,
      alt: def.hoops ? i % 2 === 1 : (i + 1) % 10 === 0,
    }));
  }, [def]);
  const topTex = useMemo(() => {
    const m = new Map<number, THREE.Texture>();
    return (n: number) => {
      if (!m.has(n)) m.set(n, numberTexture(n, def.body, def.key === "rea" ? "#1A1A1A" : "#FFFFFF"));
      return m.get(n)!;
    };
  }, [def]);
  if (s.rise <= 0.001) return null;
  const sinkY = -(1 - s.rise) * (topY(s.n) + 0.1);
  const last = s.n - 1;
  const dropY = (1 - smooth(s.drop)) * 1.3;
  const lp = pucks[last];
  return (
    <group position={[s.x, 0.01 + sinkY, s.z]}>
      {pucks.slice(0, s.n).map((p, i) => (
        <mesh
          key={i}
          geometry={puckGeo}
          material={puckMat(p.alt ? def.alt : def.body, grain)}
          position={[p.dx, i * PH + PH / 2 + (i === last ? dropY : 0), p.dz]}
          rotation={[0, p.rot + (i === last ? dropY * 2 : 0), 0]}
          castShadow
          receiveShadow
        />
      ))}
      <mesh position={[lp.dx, topY(s.n) + 0.002 + dropY, lp.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PR * 0.985, 48]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={topTex(s.n)} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- dashed record line (puck 57)
const DashLine: React.FC<{ y: number; z: number; x0: number; x1: number; color: string; k: number; w?: number }> = ({ y, z, x0, x1, color, k, w = 0.018 }) => {
  if (k <= 0.01) return null;
  const segs: number[] = [];
  const xEnd = lerp(x0, x1, k);
  for (let x = x0; x < xEnd - 0.06; x += 0.2) segs.push(x);
  return (
    <group position={[0, y, z]}>
      {segs.map((x) => (
        <mesh key={x} position={[x + 0.06, 0, 0]}>
          <boxGeometry args={[0.12, w, w]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};
// ---------------------------------------------------------------- streak lanes
export const LANE_Z0 = 2.0;
export const LANE_STEP = 0.4;
export const slotZ = (i: number) => LANE_Z0 - i * LANE_STEP;
export const TR = 0.17;
const TH = 0.09;
export type LaneDef = { key: string; name: string; n: number; x: number; t0: number; dt: number; body: string; alt: string };
// One hero lane at a time: Bayern 11, then the three 14-title streaks grouped as one gold "14×" lane, then JDT 12.
export const LANES: LaneDef[] = [
  { key: "bay", name: "BAYERN", n: 11, x: -1.2, t0: T.bayern1 + 0.05, dt: 0.12, body: "#DC052D", alt: "#F4F6EE" },
  { key: "g14", name: "14×", n: 14, x: 0, t0: T.skonto, dt: 0.07, body: "#E8B23A", alt: "#FFF4D6" },
  { key: "jdt", name: "JOHOR DARUL TA'ZIM", n: 12, x: 1.2, t0: T.johor, dt: 0.1, body: "#1C3F94", alt: "#E2242B" },
];
export const G14_NAMES = [
  { name: "SKONTO RIGA", at: T.skonto },
  { name: "LINCOLN RED IMPS", at: T.lincoln },
  { name: "LUDOGORETS", at: T.ludo },
];
export const laneCount = (l: LaneDef, t: number) => clamp(Math.floor((t - l.t0) / l.dt) + 1, 0, l.n);
/** 1 = lit hero lane, 0 = ghosted grey tick. */
export const laneHero = (key: string, t: number) => {
  switch (key) {
    case "bay":
      return Math.max(win(t, T.bayern1 - 0.1, T.skonto, 0.3, 0.4), win(t, T.tapi - 0.1, T.rentetan2, 0.3, 0.4));
    case "g14":
      return Math.max(win(t, T.skonto - 0.1, T.johor, 0.3, 0.4), win(t, T.rentetan2 - 0.1, T.sekali, 0.3, 0.4));
    case "jdt":
      return Math.max(win(t, T.johor - 0.1, T.tapi, 0.3, 0.4), seg(t, T.sekali - 0.1, T.sekali + 0.3));
  }
  return 0;
};
/** Lanes leave the board when the outro hero (Linfield) comes back. */
export const lanesGone = (t: number) => seg(t, SEC.OUTRO[0] - 0.1, SEC.OUTRO[0] + 0.7);

const tokenGeo = new THREE.CylinderGeometry(TR, TR, TH, 36);
const tokenTopGeo = new THREE.CircleGeometry(TR * 0.8, 36);

const Token: React.FC<{ pos: V3; body: string; alt: boolean; altC: string; pop: number; dim?: number; glow?: number; op?: number }> = ({ pos, body, alt, altC, pop, dim = 0, glow = 0, op = 1 }) => {
  if (pop <= 0 || op <= 0.01) return null;
  const y = (1 - smooth(pop)) * 0.7;
  const grey = new THREE.Color("#3A4148");
  const c = new THREE.Color(alt ? altC : body).lerp(grey, dim * 0.75);
  const c2 = new THREE.Color(alt ? body : altC).lerp(grey, dim * 0.75);
  const tr = op < 0.99;
  return (
    <group position={[pos[0], pos[1] + y, pos[2]]}>
      <mesh geometry={tokenGeo} castShadow={!tr} receiveShadow position={[0, TH / 2, 0]}>
        <meshPhysicalMaterial {...POLISH.brickABS} color={c} emissive={GOLD} emissiveIntensity={glow * 0.5} transparent={tr} opacity={op} depthWrite={!tr} />
      </mesh>
      <mesh geometry={tokenTopGeo} position={[0, TH + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial {...POLISH.brickABS} color={c2} transparent={tr} opacity={op} depthWrite={!tr} />
      </mesh>
    </group>
  );
};

const Lane: React.FC<{ l: LaneDef; t: number }> = ({ l, t }) => {
  const n = laneCount(l, t);
  const gone = lanesGone(t);
  if (n <= 0 || gone >= 1) return null;
  const hero = laneHero(l.key, t);
  const broken = (l.key === "bay" && t > T.dipatahkan + 0.4) || (l.key === "g14" && t > T.berhenti);
  const broke = broken ? seg(t, l.key === "bay" ? T.dipatahkan + 0.4 : T.berhenti, (l.key === "bay" ? T.dipatahkan : T.berhenti) + 1.2) * 0.5 : 0;
  const dim = Math.max(broke, 1 - hero);
  const op = (0.3 + 0.7 * hero) * (1 - gone);
  const glow = l.key === "jdt" ? seg(t, T.terus - 0.1, T.terus + 0.5) : 0;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const pop = clamp((t - (l.t0 + i * l.dt)) / 0.22);
        return <Token key={i} pos={[l.x, 0.01, slotZ(i)]} body={l.body} altC={l.alt} alt={i % 2 === 1} pop={pop} dim={dim} glow={glow} op={op} />;
      })}
    </>
  );
};

/** Streak breakers: Leverkusen (2023–24, unbeaten) closes Bayern's lane, Levski (2025–26) closes Ludogorets'. */
/** Breaker face: club colour, white ring and the club name set around it (generic, no crest). */
const faceCache = new Map<string, THREE.Texture>();
const breakerFace = (name: string, bg: string) => {
  const k = name + bg;
  if (faceCache.has(k)) return faceCache.get(k)!;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#FFFFFF";
  g.lineWidth = 14;
  g.beginPath();
  g.arc(256, 256, 236, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(256, 256, 120, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#FFFFFF";
  g.font = "bold 62px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const chars = name.split("");
  const span = Math.PI * 1.25;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 - span / 2 + (span * (i + 0.5)) / chars.length;
    g.save();
    g.translate(256 + Math.cos(a) * 178, 256 + Math.sin(a) * 178);
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  faceCache.set(k, t);
  return t;
};

const Breaker: React.FC<{ from: V3; to: V3; t0: number; body: string; alt: string; t: number; name?: string }> = ({ from, to, t0, body, alt, t, name }) => {
  const k = seg(t, t0, t0 + 0.55);
  if (t < t0 - 0.2 || t > SEC.OUTRO[0] + 0.3) return null;
  const bump = Math.sin(clamp((t - t0 - 0.55) / 0.3) * Math.PI) * 0.05;
  const p: V3 = [lerp(from[0], to[0], k), 0.01 + bump, lerp(from[2], to[2], k)];
  return (
    <group position={p}>
      <mesh geometry={tokenGeo} position={[0, TH / 2, 0]} scale={[1.15, 1.15, 1.15]} castShadow>
        <meshPhysicalMaterial {...POLISH.brickABS} color={body} />
      </mesh>
      <mesh position={[0, TH * 1.15 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[TR * 1.15 * 0.97, 48]} />
        {name ? <meshPhysicalMaterial {...POLISH.brickABS} map={breakerFace(name, body)} /> : <meshPhysicalMaterial {...POLISH.brickABS} color={alt} />}
      </mesh>
    </group>
  );
};
export const LEV_SLOT: V3 = [-1.2, 0.01, slotZ(11)];
export const LEVSKI_SLOT: V3 = [0, 0.01, slotZ(14)];

/** JDT: the 13th and 14th slots pulse as empty chalk rings ("masih berjalan"). */
const Ghosts: React.FC<{ t: number }> = ({ t }) => {
  const on = seg(t, T.masih - 0.2, T.masih + 0.4) * (1 - seg(t, SEC.PAYOFF[0] - 0.2, SEC.PAYOFF[0] + 0.4));
  if (on <= 0) return null;
  return (
    <>
      {[12, 13].map((i, j) => {
        const pulse = 0.55 + 0.45 * Math.sin((t - T.masih) * 5 - j * 1.2);
        return (
          <mesh key={i} position={[1.2, 0.03, slotZ(i)]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[TR * 0.82, TR, 40]} />
            <meshBasicMaterial color={CHALK} transparent opacity={on * pulse * (j ? 0.6 : 1)} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- AUDIRA LED ad board (behind the far box)
const AdBoard: React.FC<{ t: number }> = ({ t }) => {
  const [tex, plain] = useMemo(() => [ledTexture(true), ledTexture(false)], []);
  // LED cycles: the AUDIRA word is off during the Linfield close-ups (only a sliver would show behind the stack)
  const textOn = (t < SEC.KONTEKS[0] || t > T.tepat) && !(t > SEC.PAYOFF[0] && t < T.sekali);
  return (
    <group position={[0, 0.2, -4.45]}>
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[6.3, 0.38, 0.08]} radius={0.02} segments={2} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#11171D" />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[6.1, 0.32]} />
        <meshBasicMaterial map={textOn ? tex : plain} toneMapped={false} />
      </mesh>
    </group>
  );
};
const ledTexture = (word: boolean) => {
  {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#06120B";
    g.fillRect(0, 0, 2048, 128);
    g.fillStyle = "rgba(43,212,106,0.55)";
    g.fillRect(0, 8, 2048, 5);
    g.fillRect(0, 115, 2048, 5);
    g.fillStyle = "rgba(43,212,106,0.18)";
    for (let x = 0; x < 2048; x += 22) g.fillRect(x, 30, 10, 68);
    if (word) {
      g.fillStyle = "#06120B";
      g.fillRect(744, 18, 560, 92);
      g.font = "bold 84px Arial, sans-serif";
      g.textBaseline = "middle";
      g.textAlign = "center";
      g.fillStyle = "#E8FFF0";
      g.fillText("AUDIRA", 1024, 68);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
};

const Ball: React.FC<{ pos: V3; spin: number }> = ({ pos, spin }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F6F7F2";
    g.fillRect(0, 0, 512, 256);
    const r = prng(5);
    g.fillStyle = "#1B1F24";
    for (let i = 0; i < 12; i++) {
      const cx = (i % 6) * 86 + (i < 6 ? 30 : 73);
      const cy = i < 6 ? 78 : 182;
      g.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r() * 0.2;
        g.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 26);
      }
      g.closePath();
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={pos} rotation={[0.4 + spin, 0.9, 0.2]} castShadow receiveShadow>
      <sphereGeometry args={[0.2, 48, 32]} />
      <meshPhysicalMaterial {...POLISH.toyPlastic} map={tex} clearcoat={0.6} roughness={0.35} />
    </mesh>
  );
};

/** Gold torus that climbs Linfield's stack while the counter runs 0 → 57. */
const CountRing: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.lima57, T.lima57 + 1.0);
  const on = Math.min(seg(t, T.lima57 - 0.2, T.lima57), 1 - seg(t, T.real1 - 0.3, T.real1 + 0.3));
  if (on <= 0) return null;
  const s = stackState("lin", t);
  return (
    <mesh position={[s.x, 0.02 + k * topY(57), s.z]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[PR + 0.06, 0.018, 12, 64]} />
      <meshBasicMaterial color={GOLD} transparent opacity={on} toneMapped={false} />
    </mesh>
  );
};

const LOOSE: { p: V3; c: string }[] = [
  { p: [-1.15, 0.03, 3.75], c: "#159A4C" },
  { p: [-1.1, 0.076, 3.72], c: "#F4F6EE" },
  { p: [1.2, 0.03, 3.95], c: "#16337F" },
  { p: [0.45, 0.03, 4.15], c: "#2F6FE4" },
];

export const World: React.FC<{ t: number }> = ({ t }) => {
  const recHook = 1 - seg(t, 5.9, 6.5);
  const recGlas = seg(t, T.tinggal - 0.4, T.tinggal + 0.4) * (1 - seg(t, SEC.PENJELASAN[0], SEC.PENJELASAN[0] + 0.5));
  // streak record lines: gold = 11 (top-5 league record), chalk = 14
  const line11 = seg(t, T.rekorTop - 0.1, T.rekorTop + 0.8) * (1 - seg(t, SEC.PAYOFF[0], SEC.PAYOFF[0] + 0.5));
  return (
    <>
      <PitchBoard3D t={0} />
      <AdBoard t={t} />
      {Object.values(STACKS).map((d) => (
        <Stack key={d.key} def={d} s={stackState(d.key, t)} />
      ))}
      {/* record line at puck 57: behind the stacks in the hook, over Celtic at the end of Glasgow */}
      <DashLine y={topY(57) + 0.012} z={0.1} x0={-2.25} x1={2.25} color={GOLD} k={recHook} />
      <DashLine y={topY(57) + 0.012} z={0.55} x0={-1.3} x1={0.4} color={GOLD} k={recGlas} />
      <CountRing t={t} />
      {LANES.map((l) => (
        <Lane key={l.key} l={l} t={t} />
      ))}
      {/* across-lane level lines (x direction, at pitch height) */}
      <group position={[0, 0.03 - topY(0), 0]}>
        <DashLine y={0} z={slotZ(10.5)} x0={-2.0} x1={2.05} color={GOLD} k={line11} w={0.03} />
      </group>
      <Ghosts t={t} />
      {t > SEC.OUTRO[0] + 0.3 && (
        <mesh position={[0, topY(57) * stackState("lin", t).rise + 0.03, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[PR + 0.07, 0.022, 12, 64]} />
          <meshBasicMaterial color={GOLD} transparent opacity={seg(t, SEC.OUTRO[0] + 1.2, SEC.OUTRO[0] + 1.8)} toneMapped={false} />
        </mesh>
      )}
      <Breaker from={[-3.7, 0.01, slotZ(11)]} to={LEV_SLOT} t0={T.dipatahkan} body="#E32221" alt="#111111" t={t} name="LEVERKUSEN" />
      <Breaker from={[3.4, 0.01, slotZ(14)]} to={LEVSKI_SLOT} t0={T.ludo2 + 0.1} body="#0047AB" alt="#F4F6EE" t={t} />
      {LOOSE.map((l, i) => (
        <mesh key={i} geometry={puckGeo} material={puckMat(l.c)} position={l.p} rotation={[0, i * 0.7, 0]} castShadow receiveShadow />
      ))}
      <Ball pos={[-0.3, 0.21, 3.6]} spin={t * 0.0} />
    </>
  );
};
