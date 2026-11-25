// EP050 stations: one per shot group, each only mounted inside its time window.
import React, { useMemo } from "react";
import * as THREE from "three";
import { SATISFYFORGE_PALETTE as P } from "../../../kits/satisfyforge/lib/palette";
import { FX_LAYER } from "../../../core/render/Post";
import { BELT_TOP, Conveyor, LANE, ScannerArch, SUITCASE, Suitcase, makeSignTexture, makeTagTexture, plateNumber } from "../parts";
import { CUT, W, clamp01, ease, easeOutBack, lerp, settle, win } from "./clock";
import { DataLink, FloatCard, FloorPlate, GlowFrame, HatchWall, MiniPile, Pawn, Pill, Plane, Printer, RBox, Ring, ULD, XrayMachine, makeCardTexture, makeXrayTexture } from "./props";

export const HERO_SEED = 5050;
export const HERO_COLOR = P.peach;
const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const pop = (t: number, at: number, d = 0.35) => (t < at ? 0 : Math.min(1.08, easeOutBack(win(t, at, at + d))));

export type Tex = { hero: THREE.Texture; tags: THREE.Texture[]; slats: THREE.Texture };

/** Bags moving at constant speed along a curve, equally spaced; hidden outside [lo, hi] of arc length. */
const BeltBags: React.FC<{ curve: THREE.Curve<THREE.Vector3>; s0: number; gap: number; n: number; lo: number; hi: number; tex: Tex; seed: number; skip?: number; flip?: boolean }> = ({
  curve,
  s0,
  gap,
  n,
  lo,
  hi,
  tex,
  seed,
  skip,
  flip,
}) => {
  const len = curve.getLength();
  const cols = [P.sky, P.lilac, "#9FE3CF", P.pink, "#FFE08A", "#B9A6F5", "#FFC9DA"];
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        if (i === skip) return null;
        const s = s0 + i * gap;
        if (s < lo || s > Math.min(hi, len)) return null;
        const u = s / len;
        const p = curve.getPointAt(u);
        const tg = curve.getTangentAt(u);
        return (
          <Suitcase
            key={i}
            color={cols[(i + seed) % cols.length]}
            tag={tex.tags[(i + seed) % tex.tags.length]}
            tagRot={((i * 37 + seed) % 7) * 0.04 - 0.12}
            position={[p.x, BELT_TOP, p.z]}
            yaw={Math.atan2(tg.x, tg.z) + (flip ? Math.PI : 0)}
          />
        );
      })}
    </group>
  );
};

// ======================= A. HOOK: many bags, one hole =======================
export const HOOK_CENTER = new THREE.LineCurve3(V(0, 7), V(0, -4.6));
export const heroHookS = (t: number) => 2.4 + 0.62 * t; // arc length along the centre belt
export const heroHookPos = (t: number) => HOOK_CENTER.getPointAt(Math.min(1, heroHookS(t) / HOOK_CENTER.getLength()));

export const StationHook: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const left = useMemo(() => new THREE.CatmullRomCurve3([V(-5.2, 6.5), V(-3.2, 2.6), V(-1.6, 0.2), V(-0.72, -1.6)], false, "centripetal"), []);
  const right = useMemo(() => new THREE.CatmullRomCurve3([V(5.2, 6.5), V(3.2, 2.6), V(1.6, 0.2), V(0.72, -1.6)], false, "centripetal"), []);
  const sh = heroHookS(t);
  const hp = heroHookPos(t);
  const qT = W("l02", 5); // "kota"
  const ok = W("l02", 7); // "benar?"
  return (
    <group>
      <HatchWall t={t} z={-3} lift={clamp01(1 - Math.abs(-3 - 0) / 1)} />
      <Conveyor curve={HOOK_CENTER} width={0.86} rail="#FFFFFF" slats={tex.slats} t={t} speed={1.2} />
      <Conveyor curve={left} width={0.8} rail={LANE.pink} slats={tex.slats} t={t} speed={1.2} />
      <Conveyor curve={right} width={0.8} rail={LANE.mint} slats={tex.slats} t={t} speed={1.2} />
      {/* hero + equally spaced neighbours on the centre belt (hidden once through the hatch) */}
      <BeltBags curve={HOOK_CENTER} s0={sh - 4 * 1.32} gap={1.32} n={9} lo={0} hi={9.9} tex={tex} seed={0} skip={4} flip />
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[hp.x, BELT_TOP, hp.z]} yaw={0} />
      <BeltBags curve={left} s0={(0.62 * t) % 1.3 - 1.3} gap={1.3} n={9} lo={0} hi={left.getLength() - 0.45} tex={tex} seed={2} flip />
      <BeltBags curve={right} s0={(0.62 * t + 0.65) % 1.3 - 1.3} gap={1.3} n={9} lo={0} hi={right.getLength() - 0.45} tex={tex} seed={4} flip />
      {/* hero highlight ring + destination question */}
      <Ring position={[hp.x, BELT_TOP + 0.01, hp.z]} r={0.62} color={LANE.pink} k={ease(win(t, W("l02", 1), W("l02", 1) + 0.4))} />
      {(["DPS", "SUB", "KNO"] as const).map((c, i) => {
        const col = [LANE.pink, LANE.butter, LANE.mint][i];
        const right = i === 0 && t > ok;
        return (
          <Pill
            key={c}
            text={right ? "DPS ✓" : `${c}?`}
            bg={right ? col : "#FFFFFF"}
            fg={right ? "#FFFFFF" : P.ink}
            position={[hp.x - 0.75 + i * 0.75, 1.25 + (i === 1 ? 0.12 : 0) + Math.sin(t * 2 + i) * 0.02, hp.z - 0.2]}
            rotation={[-0.35, 0.15, 0]}
            k={pop(t, qT + i * 0.12) * (i === 0 || t < ok + 0.3 ? 1 : 1 - win(t, ok + 0.3, ok + 0.6))}
            w={0.62}
          />
        );
      })}
    </group>
  );
};

// ======================= B. CHECK-IN: tag printed, stuck on =======================
export const BAG_CHECKIN: [number, number, number] = [0.35, 0.25, 0.65];
export const StationCheckin: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const printA = W("l03", 1);
  const printB = printA + 1.0;
  const stick = W("l03", 6); // "ditempel"
  const flyA = stick - 0.55;
  const k = ease(win(t, printA, printB));
  const f = ease(win(t, flyA, stick));
  const stripTex = useMemo(() => {
    const x = tex.hero.clone();
    x.needsUpdate = true;
    return x;
  }, [tex.hero]);
  stripTex.repeat.set(1, Math.max(0.001, k));
  stripTex.offset.set(0, 1 - Math.max(0.001, k));
  const slot = new THREE.Vector3(-0.6, 1.27, -0.33);
  const len = 0.68 * Math.max(0.001, k);
  const startC = new THREE.Vector3(slot.x, slot.y, slot.z + len / 2);
  // tag centre on the lid (bag yaw 0): local (0.02, H + 0.02, 0.06)
  const endC = new THREE.Vector3(BAG_CHECKIN[0] + 0.02, BAG_CHECKIN[1] + SUITCASE.H + 0.025, BAG_CHECKIN[2] + 0.06);
  const c = startC.clone().lerp(endC, f);
  c.y += Math.sin(f * Math.PI) * 0.35;
  const stuck = t >= stick;
  return (
    <group>
      {/* counter + scale belt */}
      <RBox size={[2.6, 0.9, 0.8]} r={0.08} color="#FFF6F0" position={[-0.3, 0.45, -0.75]} />
      <RBox size={[2.66, 0.05, 0.86]} r={0.02} color={P.lilac} position={[-0.3, 0.92, -0.75]} />
      <RBox size={[1.2, 0.25, 1.1]} r={0.06} color="#FFFFFF" position={[0.35, 0.125, 0.65]} />
      <RBox size={[1.0, 0.012, 0.9]} r={0.004} color="#EEE8F3" position={[0.35, 0.252, 0.65]} />
      <Printer position={[-0.6, 0.9, -0.55]} blink={t > printA && t < printB ? 0.5 + 0.5 * Math.sin(t * 20) : 0} />
      {/* scale readout plate */}
      <Pill text="18,4 kg" bg="#FFFFFF" fg={P.ink} position={[0.6, 1.25, -0.72]} rotation={[-0.2, -0.2, 0]} k={pop(t, CUT.checkin + 0.2)} w={0.5} />
      <Suitcase color={HERO_COLOR} tag={stuck ? tex.hero : undefined} tagRot={0} position={[BAG_CHECKIN[0], BAG_CHECKIN[1] + settle(t, stick, 0.012), BAG_CHECKIN[2]]} yaw={0} />
      {!stuck && t > printA && (
        <group position={c} rotation={[0, f * 0.0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[0.27, len]} />
            <meshStandardMaterial map={stripTex} roughness={0.55} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      <Ring position={[BAG_CHECKIN[0], 0.26, BAG_CHECKIN[2]]} r={0.66} color={LANE.pink} k={stuck ? 1 - win(t, stick + 0.5, stick + 1.2) : 0} />
    </group>
  );
};

// ======================= C/D. TAG MACRO + flight data =======================
export const TAG_Y = 0.14 + SUITCASE.H + 0.025;
export const StationTag: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const card = useMemo(
    () =>
      makeCardTexture(
        [
          ["Tag", plateNumber(HERO_SEED)],
          ["Rute", "CGK → DPS"],
          ["Berangkat", "07.40 WIB"],
          ["Kursi", "14C"],
        ],
        "DATA PENERBANGAN",
        LANE.pink,
      ),
    [],
  );
  const link = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, TAG_Y + 0.01, 0.18), new THREE.Vector3(0.1, 0.9, -0.2), new THREE.Vector3(0.0, 1.05, -0.85)]), []);
  const bc = W("l04", 3);
  const num = W("l04", 5);
  const code = W("l04", 9);
  const linkT = W("l05", 2); // "terhubung"
  const fade = (a: number) => ease(win(t, a, a + 0.3)) * (1 - win(t, linkT - 0.4, linkT));
  return (
    <group>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 0.98, 0.14, 72]} />
        <meshPhysicalMaterial color={P.plinth} roughness={0.35} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.88, 0.9, 72]} />
        <meshBasicMaterial color={LANE.pink} />
      </mesh>
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[0, 0.14, 0]} yaw={0} />
      <GlowFrame w={0.24} h={0.17} position={[0.02, TAG_Y + 0.004, 0.065]} color={P.sky} k={fade(bc)} />
      <GlowFrame w={0.25} h={0.05} position={[0.02, TAG_Y + 0.004, 0.183]} color={LANE.mint} k={fade(num)} />
      <GlowFrame w={0.24} h={0.1} position={[0.02, TAG_Y + 0.004, -0.098]} color={LANE.pink} k={fade(code)} />
      <Pill text="BARCODE" bg={P.sky} position={[0.3, TAG_Y + 0.06, 0.07]} rotation={[-1.2, 0, 0]} k={pop(t, bc + 0.1) * (1 - win(t, num - 0.2, num))} w={0.2} />
      <Pill text="10 DIGIT" bg={LANE.mint} position={[0.3, TAG_Y + 0.06, 0.2]} rotation={[-1.2, 0, 0]} k={pop(t, num + 0.1) * (1 - win(t, linkT - 0.4, linkT))} w={0.2} />
      <Pill text="KODE TUJUAN" bg={LANE.pink} position={[0.32, TAG_Y + 0.06, -0.1]} rotation={[-1.2, 0, 0]} k={pop(t, code + 0.1) * (1 - win(t, linkT - 0.4, linkT))} w={0.26} />
      <DataLink curve={link} t={t} k={ease(win(t, linkT - 0.1, linkT + 0.7))} color={LANE.pink} />
      <FloatCard tex={card} position={[0.0, 1.32, -0.95]} rotation={[-0.15, 0.32, 0]} k={pop(t, W("l05", 4) - 0.25, 0.45)} w={1.1} />
    </group>
  );
};

// ======================= E1. the wall (zoom through the hatch) =======================
export const StationWall: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const belt = useMemo(() => new THREE.LineCurve3(V(0, 4), V(0, -5)), []);
  const z = lerp(-0.6, -3.4, ease(win(t, CUT.wall, CUT.behind + 0.1)));
  const lift = clamp01(1 - Math.abs(z + 3) / 0.7);
  return (
    <group>
      <HatchWall t={t} z={-3} lift={lift} />
      <Conveyor curve={belt} width={0.86} rail="#FFFFFF" slats={tex.slats} t={t} speed={1.2} />
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[0, BELT_TOP, z]} yaw={0} />
      <Suitcase color={P.sky} tag={tex.tags[1]} tagRot={0.1} position={[0, BELT_TOP, z + 1.35]} yaw={0} />
      <Suitcase color={P.lilac} tag={tex.tags[2]} tagRot={-0.1} position={[0, BELT_TOP, z + 2.7]} yaw={0} />
    </group>
  );
};

// ======================= E2. behind the wall: belt + scanner arch =======================
const ARCH_Z = -1.0;
export const heroBehindZ = (t: number) => {
  const g = W("l06", 7);
  if (t < g) return lerp(3.2, 0.2, (t - CUT.behind) / (g - CUT.behind));
  return 0.2 - (t - g) * 0.62;
};
export const StationBehind: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const belt = useMemo(() => new THREE.LineCurve3(V(0, 5), V(0, -7)), []);
  const plaque = useMemo(() => makeSignTexture("AUDIRA · SCAN", "#FFFFFF", P.ink, 640, 150, 78), []);
  const z = heroBehindZ(t);
  const read = W("l06", 11); // "membaca"
  const sweepK = win(t, read - 0.1, read + 0.5);
  const scanOn = t > read - 0.1 && t < read + 0.6;
  return (
    <group>
      <Conveyor curve={belt} width={0.86} rail="#FFFFFF" slats={tex.slats} t={t} speed={1.0} />
      <ScannerArch position={new THREE.Vector3(0, 0, ARCH_Z)} yaw={0} plaque={plaque} t={t} width={0.86} />
      <pointLight position={[0, 1.0, ARCH_Z]} color="#8FE9FF" intensity={2.2} distance={2.6} decay={2} />
      {[-2, -1, 1, 2].map((k) => (
        <Suitcase key={k} color={[P.sky, P.lilac, "#9FE3CF", "#FFE08A"][k + 2 - (k > 0 ? 1 : 0)]} tag={tex.tags[(k + 4) % tex.tags.length]} tagRot={k * 0.05} position={[0, BELT_TOP, z + k * 1.5]} yaw={0} />
      ))}
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[0, BELT_TOP, z]} yaw={0} />
      {scanOn && (
        <mesh position={[0, BELT_TOP + SUITCASE.H + 0.03, z + 0.45 - sweepK * 0.9]} ref={(m) => m?.layers.set(FX_LAYER)}>
          <boxGeometry args={[0.7, 0.008, 0.02]} />
          <meshBasicMaterial color={new THREE.Color("#9FEFFF").multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
      )}
      <Pill text={`DPS ✓  ${plateNumber(HERO_SEED)}`} bg={LANE.mint} position={[0, 1.95, ARCH_Z + 0.1]} rotation={[-0.2, 0.35, 0]} k={pop(t, read + 0.45)} w={1.0} />
    </group>
  );
};

// ======================= F. X-ray =======================
export const StationXray: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const belt = useMemo(() => new THREE.LineCurve3(V(0, 5), V(0, -6)), []);
  const screen = useMemo(() => makeXrayTexture(77), []);
  const z = lerp(2.0, -2.6, (t - CUT.xray) / (CUT.sorter - CUT.xray));
  const scan = win(t, W("l07", 1), W("l07", 3) + 0.2);
  return (
    <group>
      <Conveyor curve={belt} width={0.86} rail={P.sky} slats={tex.slats} t={t} speed={1.0} />
      <XrayMachine t={t} screen={screen} scan={scan} ok={t > W("l07", 3) + 0.25 ? 1 : 0} />
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[0, BELT_TOP, z]} yaw={0} />
      <Suitcase color={P.lilac} tag={tex.tags[2]} tagRot={0.1} position={[0, BELT_TOP, z + 1.5]} yaw={0} />
      <Suitcase color={P.sky} tag={tex.tags[3]} tagRot={-0.1} position={[0, BELT_TOP, z - 1.5]} yaw={0} />
      <Pill text="AMAN ✓" bg={LANE.mint} position={[0, 1.75, -1.1]} rotation={[-0.2, 0.4, 0]} k={pop(t, W("l07", 3) + 0.25)} w={0.6} />
    </group>
  );
};

// ======================= G/I. tilt-tray sorter (+ the jam in PAYOFF) =======================
const LANES = () => [
  { c: new THREE.CatmullRomCurve3([V(-1.05, 0.75), V(-1.15, 1.8), V(-1.7, 3.2), V(-2.2, 5.6)], false, "centripetal"), col: LANE.pink, code: "DPS" },
  { c: new THREE.CatmullRomCurve3([V(0, 0.75), V(0, 2.2), V(0.1, 4.0), V(0.3, 6.0)], false, "centripetal"), col: LANE.butter, code: "SUB" },
  { c: new THREE.CatmullRomCurve3([V(1.05, 0.75), V(1.15, 1.8), V(1.8, 3.1), V(2.4, 5.4)], false, "centripetal"), col: LANE.mint, code: "KNO" },
];

export const StationSorter: React.FC<{ t: number; tex: Tex; jam?: boolean }> = ({ t, tex, jam }) => {
  const lanes = useMemo(LANES, []);
  const main = useMemo(() => new THREE.CatmullRomCurve3([V(-3.4, -8.4), V(-3.0, -6.2), V(-1.4, -4.4), V(0, -2.6), V(0, -0.45)], false, "centripetal"), []);
  const signs = useMemo(() => lanes.map((l) => makeSignTexture(l.code, l.col, "#FFFFFF", 384, 192, 120)), [lanes]);
  const plaque = useMemo(() => makeSignTexture("AUDIRA · SCAN", "#FFFFFF", P.ink, 640, 150, 78), []);
  const archP = main.getPointAt(0.6);
  const archTg = main.getTangentAt(0.6);
  const t0 = jam ? W("l09", 1) : W("l07", 5);
  const tilts = jam ? [t0 + 0.2, t0 + 0.6, 99] : [t0, W("l07", 7), W("l07", 9)];
  const bagCols = [HERO_COLOR, "#9FD0FA", "#B9A6F5"];
  const blink = jam && t > W("l09", 3) ? (Math.sin(t * 14) > 0 ? 1 : 0.2) : 0;
  return (
    <group>
      <Conveyor curve={main} width={0.86} rail="#FFFFFF" slats={tex.slats} t={t} />
      <ScannerArch position={archP} yaw={Math.atan2(archTg.x, archTg.z)} plaque={plaque} t={t} width={0.86} />
      {[0.25, 0.45, 0.7, 0.88].map((u, i) => {
        const uu = (u + t * 0.03) % 1;
        const p = main.getPointAt(uu);
        const tg = main.getTangentAt(uu);
        return <Suitcase key={i} color={[P.sky, P.lilac, "#9FE3CF", P.pink][i]} tag={tex.tags[i % tex.tags.length]} tagRot={0.1 - i * 0.07} position={[p.x, BELT_TOP, p.z]} yaw={Math.atan2(tg.x, tg.z)} />;
      })}
      <RBox size={[3.3, 0.16, 1.3]} r={0.04} color={P.plinth} position={[0, 0.36, 0.15]} />
      {lanes.map((l, i) => (
        <group key={i}>
          <Conveyor curve={l.c} width={0.78} rail={l.col} slats={tex.slats} t={t} />
          <group position={[(i - 1) * 1.05, BELT_TOP + 0.004, 0.6]}>
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.74, 0.04, 0.34]} />
              <meshPhysicalMaterial color={l.col} roughness={0.3} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0.0405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.7, 0.32]} />
              <meshStandardMaterial map={signs[i]} roughness={0.35} />
            </mesh>
          </group>
        </group>
      ))}
      {/* trays + bags */}
      {[0, 1, 2].map((i) => {
        const tt = tilts[i];
        const tilt = 0.5 * ease(win(t, tt, tt + 0.3)) * (1 - ease(win(t, tt + 0.9, tt + 1.3)));
        const x = (i - 1) * 1.05;
        const slide = ease(win(t, tt + 0.15, tt + 0.55));
        const onLane = t > tt + 0.55;
        const isJam = jam && i === 1;
        const lane = lanes[i].c;
        const lu = Math.min(0.4, (t - tt - 0.55) * 0.12);
        let bag: React.ReactNode;
        if (isJam && t > tt + 0.15) {
          // the one that misses: wedged across the gap between two lanes
          const k = ease(win(t, tt + 0.15, tt + 0.6));
          bag = (
            <Suitcase color={bagCols[i]} tag={tex.tags[3]} position={[lerp(x, 0.5, k), lerp(BELT_TOP + 0.1, BELT_TOP + 0.02, k) + settle(t, tt + 0.6, 0.03), lerp(0.12, 1.25, k)]} yaw={lerp(Math.PI / 2, Math.PI / 2 + 0.7, k)} tilt={0.3 * k} />
          );
        } else if (onLane && !isJam) {
          const p = lane.getPointAt(Math.max(0, lu));
          const tg = lane.getTangentAt(Math.max(0, lu));
          bag = <Suitcase color={bagCols[i]} tag={i === 0 ? tex.hero : tex.tags[i + 2]} position={[p.x, BELT_TOP, p.z]} yaw={Math.atan2(tg.x, tg.z)} />;
        } else {
          bag = (
            <group position={[x, BELT_TOP + 0.08, 0.12]} rotation={[-tilt, 0, 0]}>
              <Suitcase color={bagCols[i]} tag={i === 0 ? tex.hero : tex.tags[i + 2]} position={[0, 0.06, slide * 0.45]} yaw={0} />
            </group>
          );
        }
        return (
          <group key={i}>
            <group position={[x, BELT_TOP + 0.08, 0.12]}>
              <mesh position={[0, -0.04, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 0.1, 20]} />
                <meshPhysicalMaterial color="#E8ECF2" metalness={0.85} roughness={0.2} />
              </mesh>
              <group rotation={[-tilt, 0, 0]}>
                <RBox size={[0.82, 0.06, 1.0]} r={0.025} color="#FFFFFF" position={[0, 0.03, 0]} />
                {[-0.39, 0.39].map((xx) => (
                  <RBox key={xx} size={[0.04, 0.05, 1.0]} r={0.015} color={lanes[i].col} position={[xx, 0.075, 0]} />
                ))}
              </group>
            </group>
            {bag}
          </group>
        );
      })}
      {jam && (
        <group>
          <mesh position={[1.75, 0.9, 0.2]}>
            <sphereGeometry args={[0.1, 24, 16]} />
            <meshBasicMaterial color={new THREE.Color("#FF8A7A").multiplyScalar(0.6 + blink * 1.6)} toneMapped={false} />
          </mesh>
          <mesh position={[1.75, 0.45, 0.2]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.9, 12]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={1} />
          </mesh>
          <Pill text="MACET !" bg="#FF8A7A" position={[0.55, 1.45, 1.2]} rotation={[-0.3, 0.3, 0]} k={pop(t, W("l09", 4))} w={0.62} />
        </group>
      )}
    </group>
  );
};

// ======================= H. reconciliation: bag flies only with its owner =======================
export const StationRecon: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const plate = useMemo(() => makeSignTexture("AUDIRA", P.lilac, "#FFFFFF", 512, 128, 84), []);
  const owner = W("l08", 5); // "pemiliknya"
  const naik = W("l08", 7); // "naik"
  const load = ease(win(t, naik, naik + 0.8));
  const linkA = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-1.75, 0.9, 0.5), new THREE.Vector3(-1.1, 1.2, 0.55), new THREE.Vector3(-0.45, 0.65, 0.6)]), []);
  const linkB = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-1.75, 0.9, 1.9), new THREE.Vector3(-1.1, 1.2, 1.95), new THREE.Vector3(-0.45, 0.65, 2.0)]), []);
  const bagA: [number, number, number] = [lerp(-0.2, 0.05, load), 0.22 + Math.sin(load * Math.PI) * 0.35, lerp(0.6, -0.55, load)];
  const held = t > naik + 0.2;
  return (
    <group>
      <Plane position={[2.4, 0, -2.6]} rotation={[0, -0.6, 0]} />
      <ULD position={[0.0, 0, -0.75]} rotation={[0, -0.25, 0]} plate={plate} />
      {/* gate pads */}
      {[0.5, 1.9].map((z, i) => (
        <RBox key={z} size={[0.8, 0.06, 0.8]} r={0.03} color="#FFFFFF" position={[-1.75, 0.03, z]} />
      ))}
      <Pawn position={[-1.75, 0.06, 0.5]} color={P.sky} />
      <Pawn position={[-1.75, 0.06, 1.9]} color={P.lilac} ghost />
      <Ring position={[-1.75, 0.07, 0.5]} r={0.38} color={LANE.mint} k={ease(win(t, owner, owner + 0.3))} />
      <Ring position={[-1.75, 0.07, 1.9]} r={0.38} color="#FF8A7A" k={ease(win(t, naik, naik + 0.3)) * (0.6 + 0.4 * Math.sin(t * 8))} />
      <DataLink curve={linkA} t={t} k={ease(win(t, W("l08", 0), W("l08", 0) + 0.6))} color={LANE.mint} />
      <DataLink curve={linkB} t={t} k={ease(win(t, W("l08", 0) + 0.2, W("l08", 0) + 0.8))} color={P.lilac} />
      {/* low dollies the bags wait on */}
      <RBox size={[1.0, 0.2, 1.1]} r={0.05} color="#FFFFFF" position={[-0.2, 0.1, 0.6]} />
      <RBox size={[1.0, 0.2, 1.1]} r={0.05} color="#FFFFFF" position={[-0.2, 0.1, 2.0]} />
      <Suitcase color={HERO_COLOR} tag={tex.hero} position={bagA} yaw={0.15 - load * 0.4} />
      <Suitcase color="#B9A6F5" tag={tex.tags[4]} position={[-0.2 + (held ? ease(win(t, naik + 0.4, naik + 1.2)) * 0.9 : 0), 0.22, 2.0]} yaw={0.1} />
      <Pill text="NAIK ✓" bg={LANE.mint} position={[-1.75, 1.35, 0.5]} rotation={[-0.3, 0.2, 0]} k={pop(t, owner + 0.15)} w={0.5} />
      <Pill text="TIDAK NAIK" bg="#FF8A7A" position={[-1.75, 1.35, 1.9]} rotation={[-0.3, 0.2, 0]} k={pop(t, naik)} w={0.62} />
      <Pill text="DITAHAN" bg="#FF8A7A" position={[0.75, 1.0, 2.0]} rotation={[-0.3, 0.2, 0]} k={pop(t, naik + 0.6)} w={0.55} />
    </group>
  );
};

// ======================= J. 24 million: piles on a journey line =======================
export const StationPile: React.FC<{ t: number }> = ({ t }) => {
  const route = useMemo(() => new THREE.CatmullRomCurve3([V(-2.3, 1.5), V(-1.2, 0.2), V(0, -0.7), V(1.2, 0.0), V(2.3, 1.2)], false, "centripetal"), []);
  const grow = win(t, W("l10", 6), W("l10", 12) + 0.4);
  const transitK = win(t, W("l10", 16) - 0.2, W("l10", 18) + 0.4);
  const n0 = 75 * ease(grow);
  const n2 = 80 * ease(grow);
  const n1 = 64 * 3 * ease(grow) + 64 * 4 * ease(transitK);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <group>
      {/* dashed route */}
      {Array.from({ length: 34 }, (_, i) => {
        const p = route.getPointAt(i / 33);
        return (
          <mesh key={i} position={[p.x, 0.012, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color={P.ink} transparent opacity={0.35} />
          </mesh>
        );
      })}
      {([
        [-2.3, 1.5, "ASAL", P.sky],
        [0, -0.7, "TRANSIT", "#FF8A7A"],
        [2.3, 1.2, "TUJUAN", LANE.mint],
      ] as const).map(([x, z, txt, col], i) => (
        <group key={txt}>
          <mesh position={[x, 0.02, z]} castShadow receiveShadow>
            <cylinderGeometry args={[i === 1 ? 0.95 : 0.6, i === 1 ? 0.98 : 0.62, 0.04, 64]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={1} />
          </mesh>
          <Ring position={[x, 0.045, z]} r={i === 1 ? 0.93 : 0.58} color={col} k={i === 1 ? 0.5 + 0.5 * transitK * glow : 0.8} />
          <FloorPlate text={txt} bg={col} position={[x, 0.0, z + (i === 1 ? 1.2 : 0.85)]} w={i === 1 ? 0.95 : 0.7} />
        </group>
      ))}
      <MiniPile n={n0} max={75} cols={5} position={[-2.3, 0.04, 1.5]} seed={11} />
      <MiniPile n={n1} max={64 * 7} cols={8} position={[0, 0.04, -0.7]} seed={12} />
      <MiniPile n={n2} max={80} cols={5} position={[2.3, 0.04, 1.2]} seed={13} />
    </group>
  );
};

// ======================= K. claim carousel + the stub =======================
export const StationClaim: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const loop = useMemo(() => new THREE.CatmullRomCurve3([V(-1.7, 0), V(-1.2, 1.05), V(0, 1.3), V(1.2, 1.05), V(1.7, 0), V(1.2, -1.05), V(0, -1.3), V(-1.2, -1.05)], true, "centripetal"), []);
  const stubT = W("l11", 2); // "tanda"
  const match = W("l11", 5); // "baik-baik."
  const stubTex = tex.hero;
  const heroU = 0.25 + Math.min(t - CUT.claim, 2.4) * 0.03;
  const hp = loop.getPointAt(heroU % 1);
  const htg = loop.getTangentAt(heroU % 1);
  const stubPos = new THREE.Vector3(hp.x - 0.55, 1.15, hp.z + 0.7);
  const tagWorld = new THREE.Vector3(hp.x, BELT_TOP + SUITCASE.H + 0.03, hp.z);
  const link = new THREE.CatmullRomCurve3([stubPos.clone().add(new THREE.Vector3(0, -0.1, 0)), stubPos.clone().lerp(tagWorld, 0.5).add(new THREE.Vector3(0, 0.25, 0)), tagWorld]);
  return (
    <group>
      <Conveyor curve={loop} width={0.78} rail={P.lilac} slats={tex.slats} t={t} speed={0.6} />
      <FloorPlate text="AUDIRA EXPLAINED" bg="#FFFFFF" fg={P.ink} position={[0, 0.3, 0]} w={1.7} />
      <RBox size={[2.0, 0.3, 0.9]} r={0.08} color="#FFF6F0" position={[0, 0.15, 0]} />
      {Array.from({ length: 6 }, (_, i) => {
        const u = (heroU + (i + 1) / 7) % 1;
        const p = loop.getPointAt(u);
        const tg = loop.getTangentAt(u);
        return <Suitcase key={i} color={[P.sky, P.lilac, "#9FE3CF", P.pink, "#FFE08A", "#B9A6F5"][i]} tag={tex.tags[i % tex.tags.length]} position={[p.x, BELT_TOP, p.z]} yaw={Math.atan2(htg.x, htg.z) * 0 + Math.atan2(tg.x, tg.z)} />;
      })}
      <Suitcase color={HERO_COLOR} tag={tex.hero} tagRot={0} position={[hp.x, BELT_TOP, hp.z]} yaw={Math.atan2(htg.x, htg.z)} />
      {/* passenger stub: same barcode, same 10 digits */}
      {t > stubT && (
        <group position={stubPos} rotation={[-0.45, 0.3, 0]} scale={easeOutBack(win(t, stubT, stubT + 0.4))}>
          <RBox size={[0.3, 0.46, 0.02]} r={0.01} color="#FFFDF9" position={[0, 0, -0.012]} />
          <mesh>
            <planeGeometry args={[0.27, 0.43]} />
            <meshStandardMaterial map={stubTex} roughness={0.5} />
          </mesh>
        </group>
      )}
      <DataLink curve={link} t={t} k={ease(win(t, match - 0.5, match + 0.2))} color={LANE.mint} />
      <Pill text="COCOK ✓" bg={LANE.mint} position={[hp.x + 0.2, 1.55, hp.z + 0.1]} rotation={[-0.35, -0.2, 0]} k={pop(t, match + 0.1)} w={0.6} />
    </group>
  );
};

export const makeTex = (slats: THREE.Texture): Tex => ({
  hero: makeTagTexture("CGK", "DPS", LANE.pink, HERO_SEED),
  tags: [
    makeTagTexture("CGK", "KNO", LANE.mint, 3101),
    makeTagTexture("CGK", "SUB", LANE.butter, 3102),
    makeTagTexture("CGK", "DPS", LANE.pink, 3103),
    makeTagTexture("CGK", "KNO", LANE.mint, 3104),
    makeTagTexture("CGK", "SUB", LANE.butter, 3105),
    makeTagTexture("CGK", "DPS", LANE.pink, 3106),
  ],
  slats,
});
