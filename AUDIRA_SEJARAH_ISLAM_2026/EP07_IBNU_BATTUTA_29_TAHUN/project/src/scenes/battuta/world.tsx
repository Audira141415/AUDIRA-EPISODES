// EP07 Ibnu Battuta (PAPERWORLD): the hook world. A paper diorama of the Sumatra coast around 1345:
// the wooden-walled town "Sumutra" (Rihla, register #21) on a green bank, palms and layered hills, a
// paper junk sailing in on a red route thread across a cut-paper sea. People are faceless cut-outs only.
// Built to grow into the full film in Stage B (route map, Tangier gate, mosque porch, island relabel).

import React, { useMemo } from "react";
import { CanvasTexture, CatmullRomCurve3, SRGBColorSpace, TubeGeometry, Vector3 } from "three";
import { Cut, ShearPop, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { Ground, PaperCloud } from "../../kits/paperworld/components/MiniatureEnvironment.tsx";
import { PaperBuilding, type BuildingSpec } from "../../kits/paperworld/components/PaperBuilding.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { hash01 } from "../../kits/paperworld/motion/easing.ts";
import type { Light, Shot } from "../../kits/paperworld/render/Stage.tsx";
import { FONT } from "../../core/type/fonts.ts";

export const PAL = {
  sky: "#f3dfbf",
  sea: "#3a5891",
  seaLight: "#6f8dc2",
  seaFoam: "#e9eef2",
  sand: "#e6c88f",
  route: "#c8402e",
  plate: "#2e2019",
  plateText: "#f6ecd8",
};

/** Dawn on the strait: warm low key from the right, cool fill, warm paper sky. */
export const DAWN: Light = {
  dir: [0.55, 0.62, 0.5],
  key: "#ffe6c4",
  keyI: 2.6,
  fill: "#dfe7f4",
  fillI: 0.6,
  sky: "#fdf1de",
  ground: "#b89a74",
  hemiI: 1.15,
  bg: PAL.sky,
  exposure: 1.0,
  shadowSize: 46,
  shadowSoft: 4,
};

// ── layout (scene units; the kit's puppet is 6.3 tall) ─────────────────────────────────────────────
export const BANK_Y = 1.4;
export const BANK_FRONT = -11;
export const GATE: V3 = [0.6, BANK_Y, -12.6];
export const JUNK_AT: V3 = [-3.4, 0, -2.2];
const JUNK_SCALE = 0.56;

// ── sea ───────────────────────────────────────────────────────────────────────────────────────────
const waveStrip = (w: number, n: number, a: number) =>
  S.path(`wave-${w}-${n}-${a}`, (s) => {
    const step = w / n;
    s.moveTo(-w / 2, 0);
    for (let i = 0; i < n; i++) {
      const x0 = -w / 2 + i * step;
      s.quadraticCurveTo(x0 + step * 0.25, a * 1.6, x0 + step * 0.5, a);
      s.quadraticCurveTo(x0 + step * 0.75, a * 0.2, x0 + step, a * 0.35);
    }
    s.lineTo(w / 2, 0);
    s.lineTo(-w / 2, 0);
  });

export const Sea: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Ground color={PAL.sea} size={2600} />
    {Array.from({ length: 12 }, (_, i) => {
      const z = 22 - i * 3.0;
      const drift = Math.sin(s * 0.9 + i * 1.7) * 0.25;
      return (
        <Cut
          key={i}
          shape={waveStrip(48, 16, 0.32)}
          color={i % 3 === 0 ? PAL.seaFoam : PAL.seaLight}
          depth={0.08}
          position={[(hash01(i * 7 + 3) - 0.5) * 3 + drift, 0.0, z]}
        />
      );
    })}
  </group>
);

// ── route thread (red string pinned across the sea) ───────────────────────────────────────────────
export const ROUTE_PTS: V3[] = [
  [-7.5, 0.42, 30],
  [-6.4, 0.42, 16],
  [-4.9, 0.42, 5],
  [-3.4, 0.42, -2.2],
  [-1.2, 0.42, -7.8],
  [GATE[0], 0.42, BANK_FRONT + 0.3],
];

export const RouteThread: React.FC<{ progress?: number }> = ({ progress = 1 }) => {
  const geo = useMemo(() => {
    const c = new CatmullRomCurve3(ROUTE_PTS.map((p) => new Vector3(...p)));
    return new TubeGeometry(c, 160, 0.085, 8, false);
  }, []);
  // drawRange reveals the thread along its length (Stage B animates progress)
  geo.setDrawRange(0, geo.index ? Math.floor(geo.index.count * progress) : Infinity);
  return (
    <group>
      <mesh geometry={geo} material={paperFace(PAL.route, { relief: 0.4 })} castShadow receiveShadow />
      {ROUTE_PTS.slice(1, -1).map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow material={paperFace(PAL.plateText)} position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.2, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ── paper-cone figures: faceless by construction (a cone robe, a plain head, a wrapped turban) ──────
export const ConeDoll: React.FC<{
  h?: number; robe?: string; sash?: string; turban?: string; skin?: string; staff?: boolean; seated?: boolean;
  s?: number; walk?: number; position?: V3; yaw?: number; book?: boolean;
}> = ({ h = 4, robe = "ivoryLight", sash, turban = "ivory", skin = "#c99a74", staff = false, seated = false, s = 0, walk = 0, position, yaw = 0, book = false }) => {
  const bh = seated ? h * 0.48 : h * 0.74;
  const hr = h * 0.105;
  const bob = walk > 0 ? Math.abs(Math.sin(s * 7.5)) * h * 0.025 * walk : 0;
  const sway = walk > 0 ? Math.sin(s * 7.5) * 0.06 * walk : 0;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <group position={[0, bob, 0]} rotation={[0, 0, sway]}>
        <mesh position={[0, bh / 2, 0]} castShadow receiveShadow material={paperFace(robe)}>
          <coneGeometry args={[seated ? h * 0.3 : h * 0.2, bh, 10, 1, false]} />
        </mesh>
        {/* shoulders: a short wide cone so the body is not a single spike */}
        <mesh position={[0, bh * 0.86, 0]} castShadow material={paperFace(robe)}>
          <cylinderGeometry args={[h * 0.07, h * 0.15, bh * 0.22, 10]} />
        </mesh>
        {sash ? (
          <mesh position={[0, bh * 0.52, 0]} castShadow material={paperFace(sash)}>
            <cylinderGeometry args={[h * 0.105, h * 0.12, h * 0.05, 10]} />
          </mesh>
        ) : null}
        <mesh position={[0, bh + hr * 0.95, 0]} castShadow material={paperFace(skin)}>
          <sphereGeometry args={[hr, 14, 10]} />
        </mesh>
        <mesh position={[0, bh + hr * 1.55, 0]} scale={[1.18, 0.62, 1.18]} castShadow material={paperFace(turban)}>
          <sphereGeometry args={[hr, 14, 10]} />
        </mesh>
        {staff ? (
          <mesh position={[h * 0.2, h * 0.47, h * 0.03]} castShadow material={paperFace("brownDeep")}>
            <cylinderGeometry args={[h * 0.016, h * 0.016, h * 0.94, 6]} />
          </mesh>
        ) : null}
        {book ? (
          <mesh position={[0, bh * 0.5, h * 0.24]} rotation={[0.5, 0, 0]} castShadow material={paperFace("coralDeep")}>
            <boxGeometry args={[h * 0.2, h * 0.03, h * 0.15]} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
};

// ── junk (paper ship) ─────────────────────────────────────────────────────────────────────────────
const HULL = S.poly("junk-hull", [
  [-6.2, 3.4], [-5.8, 0.5], [-4.7, -0.3], [4.6, -0.3], [6.3, 1.4], [6.9, 2.9], [5.8, 2.4], [-4.6, 2.2], [-5.2, 3.4],
]);
const SAIL = S.poly("junk-sail", [[-2.4, 0], [2.3, 0], [2.7, 6.6], [0.6, 8.4], [-2.0, 7.6], [-2.9, 3.6]]);

const Sail: React.FC<{ h: number; color: string; at: number; scale?: number; yaw: number }> = ({ h, color, at, scale = 1, yaw }) => (
  <group position={[at, h, 0]} rotation={[0, yaw, 0]} scale={scale}>
    <Cut shape={SAIL} color={color} depth={0.08} />
    {/* battens: the ribs that make a junk sail read at a glance */}
    {[1.2, 2.6, 4.0, 5.4, 6.8].map((y, i) => (
      <Cut key={i} shape={S.rectC(5.2 - (y > 6 ? 1.4 : 0), 0.14, 0.05)} color="brownDeep" depth={0.16} position={[0.1, y, 0.06]} />
    ))}
  </group>
);

export const Junk: React.FC<{ s: number; position?: V3; yaw?: number; scale?: number }> = ({ s, position = JUNK_AT, yaw = -0.38, scale = JUNK_SCALE }) => {
  const bob = Math.sin(s * 1.6) * 0.06;
  const roll = Math.sin(s * 1.1) * 0.012;
  return (
    // local +x is the bow; rotate so the bow faces the town (−z)
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, Math.PI / 2 + yaw, roll]} scale={scale}>
      <Cut shape={HULL} color="brownDeep" depth={0.16} position={[0, 0, 1.3]} />
      <Cut shape={HULL} color="brownDeep" depth={0.16} position={[0, 0, -1.3]} />
      <Cut shape={S.rectC(11.0, 0.22, 0.04)} color="coral" depth={0.2} position={[0.2, 1.85, 1.4]} />
      <Cut shape={S.rectC(11.0, 0.22, 0.04)} color="coral" depth={0.2} position={[0.2, 1.85, -1.4]} />
      {/* deck */}
      <Cut shape={S.rectC(10.6, 2.6)} color="brown" depth={0.12} position={[0.2, 2.05, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* stern: a flared transom that rises above the deck, a rudder, and a gabled stern cabin with a rail */}
      <Cut shape={S.poly("junk-transom", [[-1.42, -0.3], [1.42, -0.3], [1.75, 3.7], [0.9, 4.05], [-0.9, 4.05], [-1.75, 3.7]])} color="brown" depth={0.18} position={[-5.78, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Cut shape={S.poly("junk-transom-trim", [[-1.6, 3.35], [1.6, 3.35], [1.75, 3.7], [0.9, 4.05], [-0.9, 4.05], [-1.75, 3.7]])} color="coral" depth={0.24} position={[-5.82, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Cut shape={S.circle(0.42)} color="goldLight" depth={0.26} position={[-5.86, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Cut shape={S.poly("junk-rudder", [[-0.15, -0.6], [0.95, -0.4], [0.75, 1.6], [-0.15, 1.9]])} color="brownDeep" depth={0.14} position={[-6.05, -0.2, 0]} />
      <group position={[-4.2, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <PaperBuilding b={{ w: 2.3, d: 2.0, h: 1.25, roof: "gable", rh: 0.75, wall: "brownLight", roofColor: "coralDeep", trim: "goldLight", window: "brownDeep", cols: 1, rows: 1, seed: 21 }} />
      </group>
      {[-1.25, 1.25].map((z, i) => (
        <Cut key={i} shape={S.rectC(9.0, 0.12, 0.03)} color="goldDeep" depth={0.08} position={[0.8, 2.85, z]} />
      ))}
      {[-3.4, -1.2, 1.0, 3.2, 5.0].flatMap((x) => [-1.25, 1.25].map((z) => (
        <Cut key={`${x}${z}`} shape={S.rect(0.1, 0.8)} color="brownDeep" depth={0.08} position={[x, 2.1, z]} />
      )))}
      {/* masts */}
      {[[1.6, 10.5], [-1.9, 8.5]].map(([x, h], i) => (
        <mesh key={i} position={[x, 2 + h / 2, 0]} castShadow material={paperFace("brownDeep")}>
          <cylinderGeometry args={[0.11, 0.14, h, 12]} />
        </mesh>
      ))}
      {/* sails swung ~35° off broadside, so they catch the wind without hiding the town */}
      <Sail h={3.2} at={1.6} color="#efe0c2" yaw={Math.PI / 2 - 0.62} />
      <Sail h={3.0} at={-1.9} color="#e8d4ae" yaw={Math.PI / 2 - 0.62} scale={0.8} />
      {/* the traveller: one faceless paper-cone figure at the bow, facing the town (no face drawn) */}
      <group position={[4.2, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ConeDoll h={4.4} robe="ivoryLight" sash="coral" turban="ivory" staff s={s} />
      </group>
    </group>
  );
};

// ── the town of Sumutra: wooden palisade and towers ───────────────────────────────────────────────
const PLANK = S.poly("plank", [[-0.28, 0], [0.28, 0], [0.28, 2.5], [0, 2.95], [-0.28, 2.5]]);

const Palisade: React.FC<{ x0: number; x1: number; z: number; gap?: [number, number] }> = ({ x0, x1, z, gap }) => {
  const n = Math.round((x1 - x0) / 0.58);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * 0.58 + 0.29;
        if (gap && x > gap[0] && x < gap[1]) return null;
        const hj = 0.85 + hash01(i * 13 + 5) * 0.25;
        return <Cut key={i} shape={PLANK} color={i % 2 ? "brown" : "brownLight"} depth={0.16} position={[x, BANK_Y, z]} scale={[1, hj, 1]} />;
      })}
      {/* two cross rails */}
      <Cut shape={S.rectC(x1 - x0, 0.2, 0.05)} color="brownDeep" depth={0.14} position={[(x0 + x1) / 2, BANK_Y + 0.8, z + 0.14]} />
      <Cut shape={S.rectC(x1 - x0, 0.2, 0.05)} color="brownDeep" depth={0.14} position={[(x0 + x1) / 2, BANK_Y + 1.9, z + 0.14]} />
    </group>
  );
};

const Gate: React.FC = () => (
  <group position={GATE}>
    <Cut shape={S.rect(0.5, 5.6)} color="brownDeep" depth={0.4} position={[-1.15, 0, 0.1]} />
    <Cut shape={S.rect(0.5, 5.6)} color="brownDeep" depth={0.4} position={[1.15, 0, 0.1]} />
    <Cut shape={S.gable(3.4, 0.5, 0.9)} color="brown" depth={0.3} position={[0, 4.0, 0.12]} />
  </group>
);

const TOWER: BuildingSpec = { w: 2.2, d: 2.2, h: 6.4, roof: "gable", rh: 1.6, wall: "brownLight", roofColor: "brownDeep", trim: "brown", window: "brownDeep", cols: 1, rows: 3, seed: 3 };

const HOUSES: { at: V3; b: BuildingSpec; yaw?: number }[] = [
  { at: [-4.6, BANK_Y, -16.2], b: { w: 3.4, d: 3, h: 2.6, roof: "gable", rh: 2.0, wall: "goldLight", roofColor: "brownDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, door: "brown", seed: 4 }, yaw: 0.08 },
  { at: [4.4, BANK_Y, -16.6], b: { w: 3.2, d: 3, h: 2.4, roof: "gable", rh: 2.0, wall: "ivoryShade", roofColor: "coralDeep", trim: "ivoryLight", window: "brownDeep", cols: 2, rows: 1, door: "brown", seed: 7 }, yaw: -0.1 },
  // the sultan's hall: the tallest roof, behind the gate
  { at: [0.6, BANK_Y, -18.6], b: { w: 6.2, d: 4, h: 3.4, roof: "gable", rh: 3.6, wall: "goldLight", roofColor: "brownDeep", trim: "goldDeep", window: "brownDeep", cols: 3, rows: 1, door: "brownDeep", seed: 11 } },
];

/** Palm: a curved trunk card and two crossed crowns of leaf cards. */
export const Palm: React.FC<{ at: V3; h?: number; lean?: number; t?: number }> = ({ at, h = 6.5, lean = 0.12, t = 1 }) => {
  const trunk = S.poly(`palm-trunk-${h}`, [[-0.22, 0], [0.22, 0], [0.16, h], [-0.12, h]]);
  const leaf = S.ellipse(1.9, 0.34);
  return (
    <ShearPop t={t} position={at}>
      <group rotation={[0, 0, lean]}>
        <Cut shape={trunk} color="brown" depth={0.14} />
        {[0, Math.PI / 2].map((ry, k) => (
          <group key={k} position={[0, h, 0]} rotation={[0, ry, 0]}>
            {[-0.5, 0.2, 0.75, -1.1, 1.3].map((a, i) => (
              <Cut key={i} shape={leaf} color={i % 2 ? "mintDeep" : "#4f8f6f"} depth={0.06}
                position={[Math.cos(a) * 1.5 * (i % 2 ? 1 : -1), -0.35 - Math.abs(a) * 0.3, 0]}
                rotation={[0, 0, (i % 2 ? -1 : 1) * (0.35 + Math.abs(a) * 0.25)]} />
            ))}
          </group>
        ))}
      </group>
    </ShearPop>
  );
};

export const Town: React.FC<{ s: number }> = () => (
  <group>
    {/* bank: sand face at the waterline, green top */}
    <Cut shape={S.rect(46, BANK_Y)} color={PAL.sand} depth={0.2} position={[0, 0, BANK_FRONT]} />
    <Cut shape={S.rectC(46, 16)} color="mintDeep" depth={0.16} position={[0, BANK_Y - 0.08, BANK_FRONT - 8]} rotation={[-Math.PI / 2, 0, 0]} />
    <Cut shape={S.rectC(46, 0.5)} color="#4f8f6f" depth={0.18} position={[0, BANK_Y - 0.1, BANK_FRONT - 0.1]} />
    <Palisade x0={-7.0} x1={8.0} z={GATE[2]} gap={[GATE[0] - 1.0, GATE[0] + 1.0]} />
    <Gate />
    <PaperBuilding b={TOWER} position={[-6.6, BANK_Y, -13.8]} />
    <PaperBuilding b={{ ...TOWER, seed: 8, wall: "brown", h: 7.0 }} position={[7.4, BANK_Y, -13.8]} />
    {HOUSES.map((h, i) => (
      <PaperBuilding key={i} b={h.b} position={h.at} yaw={h.yaw ?? 0} />
    ))}
    <Palm at={[-10.6, BANK_Y, -14.5]} h={7.2} lean={0.16} />
    <Palm at={[11.2, BANK_Y, -15]} h={6.6} lean={-0.14} />
    <Palm at={[-1.6, BANK_Y, -25]} h={7.6} lean={0.05} />
    <Palm at={[2.6, BANK_Y, -25.2]} h={6.8} lean={-0.08} />
  </group>
);

// ── background layers ─────────────────────────────────────────────────────────────────────────────
export const Backdrop: React.FC<{ s: number; up?: number }> = ({ s, up = 1 }) => {
  // the backdrop folds flat (pop-up book) and hides when the camera leaves the coast for the map
  const v = up > 0.005;
  return (
    <group visible={v}>
      <ShearPop t={up} position={[-4, 0, -26]}><Cut shape={S.hill(60, 9, 0.4, 0.25)} color="mint" depth={0.2} /></ShearPop>
      <ShearPop t={up} position={[8, 0, -34]}><Cut shape={S.hill(64, 14, 0.4, -0.3)} color="mintLight" depth={0.2} /></ShearPop>
      <ShearPop t={up} position={[-6, 0, -46]}><Cut shape={S.hill(80, 21, 0.4, 0.15)} color="#9fb2cf" depth={0.2} /></ShearPop>
      <ShearPop t={up} position={[9.5, 0, -58]}>
        <Cut shape={S.circle(3.6)} color="goldLight" depth={0.2} position={[0, 25, 0]} />
      </ShearPop>
      {up > 0.6 ? (
        <>
          <PaperCloud w={7} color="ivoryLight" position={[-7 + Math.sin(s * 0.4) * 0.2, 21, -40]} threadTo={30} />
          <PaperCloud w={5.5} color="ivoryLight" position={[6, 30, -44]} threadTo={30} />
        </>
      ) : null}
    </group>
  );
};

// ── hanging paper tag: printed name on an opaque dark plate (never emissive) ──────────────────────
export const tagTexture = (title: string, sub: string, subPx = 78) => {
  const c = document.createElement("canvas");
  c.width = 1400;
  c.height = 440;
  const g = c.getContext("2d")!;
  g.fillStyle = PAL.plate;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "#c9a35a";
  g.lineWidth = 10;
  g.strokeRect(26, 26, c.width - 52, c.height - 52);
  g.fillStyle = PAL.plateText;
  g.textAlign = "center";
  g.textBaseline = "middle";
  let ts = 210;
  g.font = `600 ${ts}px ${FONT}`;
  while (g.measureText(title).width > c.width - 140) { ts *= 0.95; g.font = `600 ${ts}px ${FONT}`; }
  g.fillText(title, c.width / 2, sub ? (subPx > 100 ? 168 : 190) : 225);
  if (sub) {
    g.fillStyle = "#e6b860";
    let ss = subPx;
    g.font = `600 ${ss}px ${FONT}`;
    while (g.measureText(sub).width > c.width - 140) { ss *= 0.95; g.font = `600 ${ss}px ${FONT}`; }
    g.fillText(sub, c.width / 2, subPx > 100 ? 352 : 345);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const HangingTag: React.FC<{ at: V3; w: number; title: string; sub: string; sway?: number; threads?: boolean }> = ({ at, w, title, sub, sway = 0, threads = true }) => {
  const tex = useMemo(() => tagTexture(title, sub), [title, sub]);
  const h = (w * 440) / 1400;
  return (
    <group position={at} rotation={[0, 0, sway]}>
      <Cut shape={S.rectC(w + 0.3, h + 0.3, 0.1)} color="ivoryLight" depth={0.12} position={[0, 0, -0.1]} />
      <mesh position={[0, 0, 0.0]} castShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
      </mesh>
      {threads && [-w * 0.38, w * 0.38].map((x, i) => (
        <mesh key={i} position={[x, h / 2 + 15, -0.05]}>
          <cylinderGeometry args={[0.03, 0.03, 30, 6]} />
          <meshStandardMaterial color="#efe6d2" roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

// ── the whole hook world ──────────────────────────────────────────────────────────────────────────
export const BattutaWorld: React.FC<{ s: number }> = ({ s }) => (
  <>
    <Sea s={s} />
    <RouteThread />
    <Junk s={s} />
    <Town s={s} />
    <Backdrop s={s} />
    <HangingTag at={[GATE[0], BANK_Y + 6.6, GATE[2] + 0.4]} w={6.8} title="SUMUTRA" sub="SAMUDERA · ± 1345" sway={Math.sin(s * 0.8) * 0.006} threads={false} />
  </>
);

/** Cover / hook framing: high 3/4 view over the junk's stern to the town gate. */
export const COVER_SHOT: Shot = {
  pos: [3.2, 12.5, 34],
  target: [-0.2, 5.9, -12],
  fov: 37,
  focus: 47,
  aperture: 0.0014,
  maxBlur: 0.005,
};
