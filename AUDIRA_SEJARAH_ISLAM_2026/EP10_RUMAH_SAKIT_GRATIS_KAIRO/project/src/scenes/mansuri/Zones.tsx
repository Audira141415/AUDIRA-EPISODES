import React, { useMemo } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE } from "../../kits/feltcraft/scene/Fuzzy";
import { easeOutBack, stepT } from "../../kits/feltcraft/core/motion";
import { FeltBox, FeltShape, RunningStitch, archPoints, felt, rect } from "./stitch";
import { FeltFigure } from "./Props";
import { FeltTag } from "./labels";
import { M } from "./palette";
import { B } from "./beats";

type V3 = [number, number, number];

/** Stop-motion pop: 0 before t0, overshoots a little, 1 after ~0.45 s (posed on twos). */
export const pop = (t: number, t0: number, d = 0.45) => {
  const x = (stepT(t) - t0) / d;
  return x <= 0 ? 0 : x >= 1 ? 1 : easeOutBack(x, 1.6);
};
const grow = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (stepT(t) - a) / (b - a)));

/** World anchors of the zones (one continuous felt diorama). */
export const Z = {
  sick: [-4.4, 0, 1.2] as V3,
  court: [0, 0, -6.4] as V3,
  town: [4.4, 0, -1.6] as V3,
  shelf: [3.4, 0, 1.7] as V3,
};

// ---------- a felt bed: wooden frame, puffy mattress, pillow, folded blanket ----------
export const FeltBed: React.FC<{ position?: V3; rotation?: V3; blanket?: string; scale?: number; children?: React.ReactNode }> = ({ position, rotation, blanket = "#5C8FA8", scale = 1, children }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh material={felt(M.wood, 0.8)} position={[0, 0.12, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.62, 0.18, 1.12]} />
    </mesh>
    {[-1, 1].map((sx) =>
      [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} material={felt(M.wood, 0.8)} position={[sx * 0.27, 0.05, sz * 0.5]} castShadow>
          <boxGeometry args={[0.07, 0.1, 0.07]} />
        </mesh>
      )),
    )}
    <Fuzzy geometry={SPHERE} color={M.cream} shells={1} spacing={0.01} position={[0, 0.25, 0]} scale={[0.29, 0.07, 0.53]} />
    <Fuzzy geometry={SPHERE} color="#FFFFFF" shells={1} spacing={0.02} position={[0, 0.33, -0.4]} scale={[0.2, 0.06, 0.1]} />
    <mesh material={felt(blanket, 0.8)} position={[0, 0.33, 0.28]} castShadow>
      <boxGeometry args={[0.56, 0.06, 0.4]} />
    </mesh>
    <RunningStitch linear color={M.thread} dash={0.04} gap={0.03} r={0.008} pts={[[-0.25, 0.365, 0.1], [0.25, 0.365, 0.1], [0.25, 0.365, 0.46], [-0.25, 0.365, 0.46], [-0.25, 0.365, 0.1]]} />
    {children}
  </group>
);

// ---------- context: the sick room in Damaskus ----------
export const SickRoom: React.FC<{ t: number }> = ({ t }) => {
  const crown = pop(t, B.sultan - 0.25, 0.6);
  const drop = (1 - crown) * 1.2;
  const glow = pop(t, B.obat - 0.1);
  const tag = pop(t, B.damaskus - 0.15) * (1 - grow(t, B.sultan - 0.9, B.sultan - 0.4));
  return (
    <group position={Z.sick}>
      {/* felt floor rug + back wall with a pointed window */}
      <mesh material={felt("#8E3B2E", 1.5)} position={[0, 0.012, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.02, 2.4]} />
      </mesh>
      <RunningStitch linear color={M.gold} pts={[[-1.5, 0.03, -1.1], [1.5, 0.03, -1.1], [1.5, 0.03, 1.1], [-1.5, 0.03, 1.1], [-1.5, 0.03, -1.1]]} />
      <FeltShape outline={rect(-1.7, 0, 1.7, 1.45)} depth={0.18} color={M.sandWing} position={[0, 0, -1.45]} />
      <RunningStitch linear color={M.thread} pts={[[-1.6, 1.33, -1.25], [1.6, 1.33, -1.25]]} />
      {/* small felt tapestry on the wall */}
      <mesh material={felt("#2F5A4A", 1)} position={[-1.05, 0.85, -1.19]}>
        <boxGeometry args={[0.7, 0.5, 0.02]} />
      </mesh>
      <RunningStitch linear color={M.gold} dash={0.04} gap={0.025} r={0.008} pts={[[-1.33, 0.65, -1.17], [-0.77, 0.65, -1.17], [-0.77, 1.05, -1.17], [-1.33, 1.05, -1.17], [-1.33, 0.65, -1.17]]} />
      {/* the patient (faceless, seen from behind the pillow) under a blanket */}
      <FeltBed position={[-0.35, 0, 0.1]} rotation={[0, 0.25, 0]} blanket="#6B5B95">
        <Fuzzy geometry={SPHERE} color="#B98A64" shells={1} spacing={0.02} position={[0, 0.42, -0.36]} scale={0.085} />
        <Fuzzy geometry={SPHERE} color="#FBF5EA" shells={1} spacing={0.03} position={[0, 0.47, -0.4]} scale={[0.1, 0.06, 0.09]} />
        <mesh material={felt("#6B5B95", 0.8)} position={[0, 0.39, 0.08]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.72]} />
        </mesh>
        <RunningStitch linear color={M.gold} dash={0.04} gap={0.03} r={0.008} pts={[[-0.22, 0.445, -0.22], [0.22, 0.445, -0.22], [0.22, 0.445, 0.4], [-0.22, 0.445, 0.4], [-0.22, 0.445, -0.22]]} />
        <RunningStitch linear color={M.gold} dash={0.04} gap={0.03} r={0.008} pts={[[0, 0.445, -0.22], [0, 0.445, 0.4]]} />
      </FeltBed>
      {/* stool: medicine flask + recipe paper */}
      <group position={[0.75, 0, 0.35]}>
        <mesh material={felt(M.wood, 0.8)} position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.06, 20]} />
        </mesh>
        <mesh material={felt(M.wood, 0.8)} position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 0.22, 10]} />
        </mesh>
        <group position={[-0.05, 0.28, 0]} scale={1 + 0.18 * glow * (1 - grow(t, B.obat + 0.5, B.obat + 1.2))}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.1, 20, 14]} />
            <meshPhysicalMaterial color="#7FB7A8" roughness={0.12} transmission={0.4} thickness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.1, 10]} />
            <meshPhysicalMaterial color="#7FB7A8" roughness={0.12} clearcoat={1} />
          </mesh>
          <mesh material={felt(M.wood, 0.5)} position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.035, 0.03, 0.04, 10]} />
          </mesh>
        </group>
        <group position={[0.1, 0.285, 0.08]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <mesh material={felt(M.cream, 0.6)}>
            <boxGeometry args={[0.18, 0.22, 0.008]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <RunningStitch key={i} linear color={M.ink} dash={0.025} gap={0.012} r={0.004} pts={[[-0.06, 0.07 - i * 0.045, 0.006], [0.06 - (i % 2) * 0.03, 0.07 - i * 0.045, 0.006]]} />
          ))}
        </group>
      </group>
      {/* cushion that receives the crown ("Ia pun menjadi sultan") */}
      <group position={[0.85, 0, -0.65]} scale={1.6}>
        <Fuzzy geometry={SPHERE} color="#2F5A4A" shells={2} spacing={0.02} position={[0, 0.14, 0]} scale={[0.28, 0.12, 0.28]} />
        <group position={[0, 0.3 + drop, 0]} scale={Math.max(0.001, crown)}>
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.11, 0.12, 8, 1, true]} />
            <meshPhysicalMaterial color={M.gold} roughness={0.35} metalness={0.7} side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.125, 0.09, Math.sin(a) * 0.125]}>
                <coneGeometry args={[0.025, 0.07, 6]} />
                <meshPhysicalMaterial color={M.gold} roughness={0.35} metalness={0.7} />
              </mesh>
            );
          })}
          <mesh position={[0, 0, 0.13]}>
            <sphereGeometry args={[0.02, 10, 8]} />
            <meshPhysicalMaterial color="#B33A2F" roughness={0.2} clearcoat={1} />
          </mesh>
        </group>
      </group>
      <FeltTag lines={["DAMASKUS"]} w={1.2} h={0.34} position={[0.45, 1.0 + (1 - tag) * 0.3, -1.22]} scale={Math.max(0.001, tag)} />
    </group>
  );
};

// ---------- main: the courtyard plan: four wards around the pool, men | women, beds ----------
const Ward: React.FC<{ p: V3; tint: string; build: number; beds: number; t: number }> = ({ p, tint, build, beds, t }) => {
  const W = 0.5;
  const D = 0.55;
  const h = 0.32 * Math.max(0.001, build);
  return (
    <group position={p}>
      <mesh material={felt(tint, 1)} position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[2 * W, 0.03, 2 * D]} />
      </mesh>
      {/* three walls + a front wall with a door gap */}
      <FeltBox color={M.sandWing} position={[0, h / 2, -D]} args={[2 * W + 0.08, h, 0.08]} />
      {[-1, 1].map((sx) => (
        <FeltBox key={sx} color={M.sandWing} position={[sx * W, h / 2, 0]} args={[0.08, h, 2 * D]} />
      ))}
      {[-1, 1].map((sx) => (
        <FeltBox key={`f${sx}`} color={M.sandWing} position={[sx * (W - 0.17), h / 2, D]} args={[0.34, h, 0.08]} />
      ))}
      <RunningStitch linear color={M.thread} dash={0.04} gap={0.03} r={0.008} pts={[[-W, h + 0.01, -D], [W, h + 0.01, -D]]} />
      {Array.from({ length: beds }, (_, i) => (
        <FeltBed key={i} position={[(i - (beds - 1) / 2) * 0.42, 0.03, -0.1]} scale={0.48 * Math.max(0.001, pop(t, B.setiap - 0.3 + i * 0.2))} blanket={["#5C8FA8", "#9C2F2C", "#2F5A4A"][i % 3]} />
      ))}
    </group>
  );
};

export const WARDS: { w: string; at: keyof typeof B; p: V3; tint: string }[] = [
  { w: "DEMAM", at: "demam", p: [-0.62, 0, -0.75], tint: "#E9C27A" },
  { w: "MATA", at: "mata", p: [0.62, 0, -0.75], tint: "#9FC3D6" },
  { w: "LUKA", at: "luka", p: [-0.62, 0, 0.75], tint: "#E7A68F" },
  { w: "JIWA", at: "jiwa", p: [0.62, 0, 0.75], tint: "#B9A0E0" },
];

export const CourtPlan: React.FC<{ t: number }> = ({ t }) => {
  const wall = grow(t, B.dimulai, B.selesai);
  const ward = (k: number) => grow(t, B.selesai - 0.4 + k * 0.3, B.selesai + 0.3 + k * 0.3);
  const divider = grow(t, B.laki, B.terpisah);
  const WX = 1.4;
  const WZ = 1.75;
  const arch = useMemo(() => archPoints(0.6, 0.45, 0.8, 16), []);
  const iwan = useMemo(() => [[-0.55, 0], ...arch, [0.55, 0], [0.55, 1.0], [-0.55, 1.0]] as [number, number][], [arch]);
  return (
    <group position={Z.court}>
      <mesh material={felt("#E7D3AE", 2)} position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[2 * WX, 0.03, 2 * WZ]} />
      </mesh>
      {/* perimeter walls rise course by course (stop-motion build) */}
      {[
        { p: [0, 0, -WZ - 0.1] as V3, s: [2 * WX + 0.4, 0.2] },
        { p: [0, 0, WZ + 0.1] as V3, s: [2 * WX + 0.4, 0.2] },
      ].map((w, i) => (
        <FeltBox key={i} color={M.sandWing} position={[w.p[0], 0.25 * wall, w.p[2]]} scale={[1, Math.max(0.001, wall), 1]} args={[w.s[0], 0.5, w.s[1]]} />
      ))}
      {[-1, 1].map((sx) => (
        <FeltBox key={sx} color={M.sandWing} position={[sx * (WX + 0.1), 0.25 * wall, 0]} scale={[1, Math.max(0.001, wall), 1]} args={[0.2, 0.5, 2 * WZ + 0.4]} />
      ))}
      {/* north iwan: the big arched hall on the far side */}
      <group position={[0, 0, -WZ - 0.05]} scale={[1, Math.max(0.001, wall), 1]}>
        <FeltShape outline={iwan} depth={0.22} bevel={0.03} color={M.sand} />
        <mesh material={felt(M.shade, 1)} position={[0, 0.4, -0.12]}>
          <boxGeometry args={[0.7, 0.8, 0.1]} />
        </mesh>
        <RunningStitch color={M.rust} pts={arch.slice(1, -1).map(([x, y]) => [x * 1.15, y + 0.03, 0.27] as V3)} dash={0.04} gap={0.03} r={0.009} />
      </group>
      <RunningStitch linear color={M.rust} pts={[[-WX, 0.04, -WZ], [WX, 0.04, -WZ], [WX, 0.04, WZ], [-WX, 0.04, WZ], [-WX, 0.04, -WZ]]} />
      {/* pool + fountain in the centre */}
      <mesh material={felt(M.cream, 1)} position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.1, 8]} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshPhysicalMaterial color={M.water} roughness={0.25} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      <mesh material={felt(M.sandDeep, 1)} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.22, 8]} />
      </mesh>
      {WARDS.map((w, k) => (
        <Ward key={w.w} p={w.p} tint={w.tint} build={ward(k)} beds={2} t={t} />
      ))}
      {/* the divider: men on the left, women on the right */}
      {divider > 0 && <RunningStitch linear color={M.gold} r={0.022} dash={0.09} gap={0.05} pts={[[0, 0.06, -WZ], [0, 0.06, -WZ + 2 * WZ * divider]]} />}
      {pop(t, B.laki) > 0 && (
        <>
          <FeltFigure position={[-0.25, 0, 1.35]} walk={0} seed={41} yaw={0.4} />
          <FeltFigure position={[0.25, 0, 1.35]} walk={0.4} seed={43} yaw={-0.4} veil />
        </>
      )}
      {/* ward tags on dark felt plates, standing up and tilted toward the camera */}
      {WARDS.map((w) => {
        const k = pop(t, (B[w.at] as number) - 0.15);
        const kk = k * (1 - grow(t, B.terpisah - 0.2, B.terpisah + 0.5));
        return kk > 0.001 ? <FeltTag key={w.w} lines={[w.w]} w={0.8} h={0.3} position={[w.p[0], 0.8, w.p[2] - 0.15]} rotation={[-0.55, 0, 0]} scale={kk} /> : null;
      })}
    </group>
  );
};

// ---------- explanation: the waqf town (market, shops, rental houses, bathhouse, fields) ----------
const House: React.FC<{ w: number; h: number; c: string; dome?: boolean }> = ({ w, h, c, dome }) => (
  <group>
    <FeltBox color={c} position={[0, h / 2, 0]} args={[w, h, w * 0.9]} />
    {[-1, 1].map((sx) => (
      <RunningStitch key={sx} linear color={M.thread} dash={0.04} gap={0.03} r={0.007} pts={[[sx * (w / 2 - 0.03), 0.04, w * 0.45 + 0.012], [sx * (w / 2 - 0.03), h - 0.04, w * 0.45 + 0.012]]} />
    ))}
    <mesh material={felt(M.shade, 1)} position={[0, 0.22, w * 0.45 + 0.01]}>
      <boxGeometry args={[w * 0.3, 0.42, 0.02]} />
    </mesh>
    <RunningStitch linear color={M.thread} dash={0.04} gap={0.03} r={0.008} pts={[[-w / 2 + 0.04, h - 0.06, w * 0.45 + 0.01], [w / 2 - 0.04, h - 0.06, w * 0.45 + 0.01]]} />
    {dome && <Fuzzy geometry={SPHERE} color={M.dome} shells={2} spacing={0.015} position={[0, h, 0]} scale={[w * 0.42, w * 0.38, w * 0.42]} />}
  </group>
);

const TOWN: { key: keyof typeof B; label: string; p: V3; el: (t: number) => React.ReactNode }[] = [
  {
    key: "pasar",
    label: "PASAR",
    p: [-0.45, 0, -0.95],
    el: () => (
      <group>
        {[-0.3, 0.3].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <FeltBox color={M.wood} position={[0, 0.2, 0]} args={[0.5, 0.4, 0.4]} />
            <mesh material={felt(i ? "#B4512E" : "#2F5A4A", 0.6)} position={[0, 0.72, 0.05]} rotation={[0.35, 0, 0]} castShadow>
              <boxGeometry args={[0.6, 0.03, 0.55]} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <Fuzzy key={k} geometry={SPHERE} color={["#E8B64A", "#D8433A", "#86AE5E"][k]} shells={1} spacing={0.03} position={[-0.14 + k * 0.14, 0.45, 0.05]} scale={0.06} />
            ))}
          </group>
        ))}
      </group>
    ),
  },
  { key: "toko", label: "TOKO", p: [0.5, 0, -1.0], el: () => <House w={0.6} h={0.75} c="#D9B47E" /> },
  {
    key: "sewa",
    label: "RUMAH SEWA",
    p: [-0.45, 0, 0.05],
    el: () => (
      <group>
        <group position={[-0.2, 0, 0]}>
          <House w={0.5} h={0.95} c="#E3C08C" />
        </group>
        <group position={[0.3, 0, 0.1]}>
          <House w={0.45} h={0.7} c="#CFA56E" />
        </group>
      </group>
    ),
  },
  { key: "pemandian", label: "PEMANDIAN", p: [0.5, 0, 0.0], el: () => <House w={0.8} h={0.5} c={M.cream} dome /> },
  {
    key: "tanah",
    label: "TANAH",
    p: [0.0, 0, 0.95],
    el: () => (
      <group>
        <mesh material={felt("#86AE5E", 1.4)} position={[0, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.06, 0.7]} />
        </mesh>
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          <RunningStitch key={i} linear color="#4F8A4B" r={0.014} dash={0.05} gap={0.03} pts={[[x, 0.07, -0.3], [x, 0.07, 0.3]]} />
        ))}
      </group>
    ),
  },
];

/** The waqf deed: a felt scroll hung on threads over the town, unrolling at "Wakaf" (wax seal, abstract stitched lines). */
const WaqfDeed: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, B.wakaf - 0.35, 0.6);
  const open = grow(t, B.wakaf - 0.1, B.wakaf + 0.9);
  if (k <= 0) return null;
  const H = 0.12 + 0.68 * open;
  return (
    <group position={[0, 1.8, -1.5]} scale={k}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 3.2, 4]} />
          <meshStandardMaterial color={M.thread} />
        </mesh>
      ))}
      <mesh material={felt("#E3D2B0", 0.6)} position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 16]} />
      </mesh>
      <mesh material={felt(M.cream, 0.8)} position={[0, -H / 2, 0]} castShadow>
        <boxGeometry args={[1.15, H, 0.015]} />
      </mesh>
      <mesh material={felt("#E3D2B0", 0.6)} position={[0, -H, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.3, 16]} />
      </mesh>
      {open > 0.7 &&
        [0, 1, 2, 3, 4].map((i) => (
          <RunningStitch key={i} linear color={M.ink} dash={0.05} gap={0.025} r={0.008} pts={[[-0.42, -0.14 - i * 0.1, 0.012], [0.42 - (i % 2) * 0.16, -0.14 - i * 0.1, 0.012]]} />
        ))}
      {open > 0.85 && (
        <mesh position={[0.32, -0.66, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 18]} />
          <meshPhysicalMaterial color="#9C2F2C" roughness={0.35} clearcoat={0.6} />
        </mesh>
      )}
    </group>
  );
};

export const WaqfTown: React.FC<{ t: number }> = ({ t }) => {
  const thread = grow(t, B.hasilnya - 0.2, B.eObat);
  const hosp: V3 = [2.6 - Z.town[0], 0.9, 0.6 - Z.town[2]]; // the hospital's east wing, in town coords
  return (
    <group position={Z.town}>
      <mesh material={felt("#C8B48A", 2)} position={[0, 0.012, 0]} receiveShadow>
        <boxGeometry args={[2.0, 0.02, 2.9]} />
      </mesh>
      <WaqfDeed t={t} />
      <RunningStitch linear color={M.rust} pts={[[-0.95, 0.03, -1.4], [0.95, 0.03, -1.4], [0.95, 0.03, 1.4], [-0.95, 0.03, 1.4], [-0.95, 0.03, -1.4]]} />
      {TOWN.map((b) => {
        const k = pop(t, (B[b.key] as number) - 0.15);
        if (k <= 0) return null;
        const src: V3 = [b.p[0], 0.5, b.p[2]];
        const mid: V3 = [(src[0] + hosp[0]) / 2, 1.9, (src[2] + hosp[2]) / 2];
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...src), new THREE.Vector3(...mid), new THREE.Vector3(...hosp));
        const pts = curve.getPoints(24).map((v) => [v.x, v.y, v.z] as V3);
        const n = Math.max(2, Math.round(24 * thread));
        // coins travel the thread, on twos
        const coin = (stepT(t) - B.hasilnya + b.p[0] * 0.3) / 1.8;
        const cu = coin > 0 && t < B.pintunya ? coin % 1 : -1;
        const cp = cu >= 0 ? curve.getPoint(cu) : null;
        return (
          <group key={b.key}>
            <group position={b.p} scale={[k, k, k]}>
              {b.el(t)}
            </group>
            {thread > 0 && <RunningStitch pts={pts.slice(0, n + 1)} color={M.gold} r={0.016} dash={0.08} gap={0.03} />}
            {cp && (
              <mesh position={[cp.x, cp.y + 0.05, cp.z]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.025, 20]} />
                <meshPhysicalMaterial color={M.gold} roughness={0.3} metalness={0.8} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/** What the waqf pays for, popping onto a felt shelf beside the hospital's east wing. */
export const NeedsShelf: React.FC<{ t: number }> = ({ t }) => {
  const items: { at: number; el: React.ReactNode; x: number }[] = [
    {
      at: B.eObat,
      x: -0.64,
      el: (
        <group>
          <mesh material={felt("#3F6E9E", 0.8)} position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.4, 16]} />
          </mesh>
          <mesh material={felt(M.cream, 0.6)} position={[0, 0.43, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
          </mesh>
        </group>
      ),
    },
    {
      at: B.makanan,
      x: -0.32,
      el: (
        <group>
          <mesh material={felt(M.wood, 0.6)} position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.12, 0.16, 20]} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <Fuzzy key={k} geometry={SPHERE} color="#E9C27A" shells={1} spacing={0.03} position={[-0.08 + k * 0.08, 0.18, 0]} scale={0.07} />
          ))}
        </group>
      ),
    },
    { at: B.dokter, x: 0.0, el: <FeltFigure position={[0, 0, 0]} walk={0} seed={61} yaw={0} satchel /> },
    { at: B.bedah, x: 0.32, el: <FeltFigure position={[0, 0, 0]} walk={0.4} seed={62} yaw={0} robe="#3F6E9E" /> },
    {
      at: B.pelayan,
      x: 0.64,
      el: (
        <group>
          <FeltFigure position={[0, 0, 0]} walk={0} seed={63} yaw={0} robe="#C9973E" />
          <mesh material={felt("#B4512E", 0.6)} position={[0.16, 0.28, 0.06]} castShadow>
            <sphereGeometry args={[0.07, 14, 10]} />
          </mesh>
        </group>
      ),
    },
  ];
  return (
    <group position={Z.shelf}>
      <mesh material={felt(M.wood, 1)} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.1, 0.55]} />
      </mesh>
      <RunningStitch linear color={M.thread} pts={[[-0.8, 0.105, 0.24], [0.8, 0.105, 0.24]]} />
      {items.map((it, i) => {
        const k = pop(t, it.at - 0.15);
        return k > 0 ? (
          <group key={i} position={[it.x, 0.1, 0]} scale={k}>
            {it.el}
          </group>
        ) : null;
      })}
    </group>
  );
};

/** Payoff props by the gate: coin pouch beside the folded clothes, the oud corner, the 1915 sign. */
export const PayoffProps: React.FC<{ t: number; night: number }> = ({ t, night }) => {
  const pouch = pop(t, B.saku - 0.2);
  const oud = pop(t, B.konon);
  const sign = pop(t, B.sejak - 0.1, 0.6);
  return (
    <group>
      {pouch > 0 && (
        <group position={[1.0, 0, 3.0]} scale={pouch}>
          <Fuzzy geometry={SPHERE} color="#8C6A48" shells={2} spacing={0.03} position={[0, 0.12, 0]} scale={[0.13, 0.12, 0.13]} />
          <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.05, 0.012, 6, 16]} />
            <meshStandardMaterial color={M.gold} roughness={0.6} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0.2 + k * 0.05, 0.015 + k * 0.022, 0.05]} rotation={[0.1, 0, 0.1]}>
              <cylinderGeometry args={[0.055, 0.055, 0.02, 18]} />
              <meshPhysicalMaterial color="#D6D2C8" roughness={0.3} metalness={0.8} />
            </mesh>
          ))}
        </group>
      )}
      {oud > 0 && (
        <group position={[-0.75, 0, 2.2]} rotation={[0, 0.5, 0]} scale={oud}>
          <Fuzzy geometry={SPHERE} color="#6B5B95" shells={2} spacing={0.02} position={[0, 0.1, 0]} scale={[0.4, 0.1, 0.32]} />
          <group position={[0, 0.28, 0]} rotation={[-1.1, 0, 0.2]}>
            <mesh scale={[0.2, 0.26, 0.11]} castShadow>
              <sphereGeometry args={[1, 24, 16]} />
              <meshPhysicalMaterial color="#8A5530" roughness={0.45} clearcoat={0.5} />
            </mesh>
            <mesh position={[0, 0.0, 0.112]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.005, 16]} />
              <meshStandardMaterial color="#2A160C" />
            </mesh>
            <mesh material={felt("#3A2418", 0.5)} position={[0, 0.36, 0.06]} castShadow>
              <boxGeometry args={[0.07, 0.3, 0.035]} />
            </mesh>
            <mesh material={felt("#3A2418", 0.5)} position={[0, 0.54, 0.02]} rotation={[-0.9, 0, 0]}>
              <boxGeometry args={[0.07, 0.14, 0.03]} />
            </mesh>
            {[-0.02, 0, 0.02].map((x, i) => (
              <mesh key={i} position={[x, 0.18, 0.115]}>
                <cylinderGeometry args={[0.002, 0.002, 0.5, 3]} />
                <meshStandardMaterial color={M.thread} />
              </mesh>
            ))}
          </group>
          {/* lantern beside it */}
          <group position={[0.5, 0, -0.1]}>
            <mesh material={felt(M.brass, 0.5)} position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.09, 0.1, 0.06, 8]} />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.22, 8]} />
              <meshStandardMaterial color={M.lantern} emissive={M.lantern} emissiveIntensity={0.4 + 0.8 * night} roughness={0.8} />
            </mesh>
            <pointLight position={[0, 0.3, 0.1]} intensity={2.5 * night} distance={2.5} decay={1.6} color={M.glow} />
          </group>
        </group>
      )}
      {sign > 0 && (
        <group position={[0, 3.25 + (1 - sign) * 0.6, 0.55]}>
          {[-0.75, 0.75].map((x) => (
            <mesh key={x} position={[x, 0.55, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
              <meshStandardMaterial color={M.thread} />
            </mesh>
          ))}
          <FeltTag lines={["RUMAH SAKIT MATA", "SEJAK 1915"]} w={1.9} h={0.62} />
        </group>
      )}
    </group>
  );
};

/** The AUDIRA name inside the world: a stitched felt label on a wooden signpost (pops in at the outro). */
export const BrandPost: React.FC<{ t: number }> = ({ t }) => {
  const k = pop(t, B.kalau - 0.2, 0.6);
  if (k <= 0) return null;
  return (
    <group position={[1.75, 0, 1.6]} rotation={[0, -0.25, 0]} scale={k}>
      <mesh material={felt(M.wood, 0.6)} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.07, 0.9, 0.07]} />
      </mesh>
      <FeltTag lines={["AUDIRA"]} w={1.0} h={0.34} position={[0, 0.9, 0.05]} bg="#0B3D2E" fg="#F6E9CF" />
    </group>
  );
};
