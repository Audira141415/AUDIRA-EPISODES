// AE-069 film-only set pieces, added around the approved cover diorama (Diorama.tsx):
// septic tank, grit channel, primary clarifier (cut open), return-sludge (RAS) line, UV channel,
// in-world paper tags, a "not drinking water" sign, bigger flow arrows, and a separate micro set
// (MBBR carriers with biofilm, faceless bacteria) placed far away at MICRO.
// Everything is seeded (hash01) and driven by `s`.

import React, { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Cut, PopUp, Hinge, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { hash01, popEase, remap } from "../../kits/paperworld/motion/easing.ts";
import { Arrow, AER, CLAR, CONCRETE, CONCRETE_DEEP, PIPE, SCREEN_X, Sheet, Slab, Strata, T1_FACE, T2_FACE, T2_TOP, T3_TOP, TankWall, WATER } from "./Diorama.tsx";

// ── Paper tag with printed text ─────────────────────────────────────────────────────────────
const texCache = new Map<string, CanvasTexture>();
const textTexture = (text: string, ink: string, paper: string, rule: string, icon?: "nocup") => {
  const key = `${text}|${ink}|${paper}|${rule}|${icon ?? ""}`;
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const W = 1024, H = 256;
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = paper;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = rule;
  g.lineWidth = 14;
  g.strokeRect(14, 14, W - 28, H - 28);
  let x0 = W / 2;
  if (icon === "nocup") {
    // a plain cup crossed out (no person, no drinking)
    const cx = 150, cy = 128;
    g.strokeStyle = ink;
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(cx - 48, cy - 70);
    g.lineTo(cx - 34, cy + 70);
    g.lineTo(cx + 34, cy + 70);
    g.lineTo(cx + 48, cy - 70);
    g.stroke();
    g.strokeStyle = "#c4614f";
    g.lineWidth = 16;
    g.beginPath();
    g.arc(cx, cy, 92, 0, Math.PI * 2);
    g.moveTo(cx - 65, cy - 65);
    g.lineTo(cx + 65, cy + 65);
    g.stroke();
    x0 = W / 2 + 110;
  }
  g.fillStyle = ink;
  let size = 118;
  g.font = `900 ${size}px 'Arial Black', Arial, sans-serif`;
  const maxW = icon ? W - 320 : W - 90;
  while (g.measureText(text).width > maxW && size > 40) {
    size -= 4;
    g.font = `900 ${size}px 'Arial Black', Arial, sans-serif`;
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, x0, H / 2 + 6);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

/** Paper tag on a stick that pops up (t 0..1). Board is w × w/4, faces +z (turn with yaw). */
export const Tag: React.FC<{ text: string; position: V3; t: number; w?: number; yaw?: number; stick?: number; color?: string; icon?: "nocup" }> = ({
  text, position, t, w = 3.2, yaw = 0, stick = 1.2, color = "coralDeep", icon,
}) => {
  const tex = useMemo(() => textTexture(text, "#3b2a22", "#faf4e8", color === "coralDeep" ? "#c4614f" : "#435e95", icon), [text, color, icon]);
  if (t <= 0.001) return null;
  const h = w / 4;
  return (
    <PopUp t={popEase(Math.min(1, t))} position={position} yaw={yaw}>
      <Slab w={0.12} h={stick} d={0.12} color="brownDeep" position={[0, stick / 2, -0.04]} />
      <group position={[0, stick + h / 2, 0]}>
        <Slab w={w + 0.16} h={h + 0.16} d={0.1} color={color} position={[0, 0, 0]} />
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
        </mesh>
      </group>
    </PopUp>
  );
};

// ── Septic tank (context: most city homes) ─────────────────────────────────────────────────
/** Two-chamber concrete box under the yard, shown in the cut face. `t` 1 = standing, 0 = folded away. */
export const SepticTank: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  if (t <= 0.001) return null;
  const x0 = -9.4, x1 = -4.2, yT = -2.5, yB = -5.2, z = T1_FACE + 0.3;
  const w = x1 - x0, h = yT - yB, cx = (x0 + x1) / 2;
  return (
    <Hinge at={[cx, yB, z]} axis="x" angle={(1 - t) * (Math.PI / 2)}>
      <group>
        <Slab w={w} h={h} d={0.14} color={CONCRETE} position={[cx, (yT + yB) / 2, z]} />
        <Slab w={w - 0.5} h={h - 0.5} d={0.06} color="#4b4642" position={[cx, (yT + yB) / 2, z + 0.1]} />
        <Slab w={w - 0.5} h={(h - 0.5) * 0.62} d={0.06} color={WATER.sewage} position={[cx, yB + 0.25 + (h - 0.5) * 0.31, z + 0.14]} />
        <Slab w={w - 0.5} h={0.42} d={0.06} color="#3f2c20" position={[cx, yB + 0.46, z + 0.18]} />
        {/* partition between the two chambers */}
        <Slab w={0.22} h={h - 0.9} d={0.1} color={CONCRETE} position={[cx + 0.6, yB + 0.25 + (h - 0.9) / 2, z + 0.2]} />
        {/* desludging lid */}
        <Slab w={1.0} h={0.3} d={0.4} color={CONCRETE_DEEP} position={[x0 + 1.0, yT + 0.15, z]} />
        {/* slow bubbles of gas */}
        {[0, 1, 2].map((i) => {
          const ph = (s * 0.25 + i / 3) % 1;
          return <Cut key={i} shape={S.circle(0.09)} color="#a07a55" depth={0.03} position={[x0 + 1.2 + i * 1.1, yB + 0.8 + ph * 1.0, z + 0.22]} cast={false} />;
        })}
      </group>
    </Hinge>
  );
};

// ── Terrace extension to the right: grit channel + primary clarifier ────────────────────────
const GRIT = { x0: 10.8, x1: 16.6, z0: 3.6, z1: 6.2, h: 1.3 };
const PRI = { x: 19.4, z: 3.2, r: 2.4, h: 1.6 };

const halfDisc = (r: number) =>
  S.path(`half-${r}`, (sh) => {
    sh.moveTo(-r, 0);
    sh.absarc(0, 0, r, Math.PI, 0, true);
    sh.lineTo(-r, 0);
  });

export const PlantExtension: React.FC<{ s: number; grit: number }> = ({ s, grit }) => {
  const y0 = T2_TOP;
  return (
    <group>
      {/* terrace blocks continue to the right */}
      <Slab w={14} h={8} d={14} color="#a97b58" position={[17.5, -4, T1_FACE - 7]} r={0.02} />
      <Sheet w={14} d={14} color="mintLight" position={[17.5, 0.02, T1_FACE - 7]} />
      <Strata x0={10.5} x1={24.5} y0={0} y1={-8} z={T1_FACE + 0.06} seed={41} />
      <Slab w={14} h={y0 - T3_TOP} d={10} color="#a97b58" position={[17.5, (y0 + T3_TOP) / 2, T2_FACE - 5]} r={0.02} />
      <Sheet w={14} d={10} color={CONCRETE_DEEP} position={[17.5, y0 + 0.02, T2_FACE - 5]} />
      <Sheet w={14} d={1.4} color="mintLight" position={[17.5, y0 + 0.05, T2_FACE - 0.7]} />
      <Strata x0={10.5} x1={24.5} y0={y0} y1={T3_TOP} z={T2_FACE + 0.06} seed={53} />

      {/* flume: bar screen -> grit channel */}
      <Sheet w={2.2} d={1.0} color={WATER.screen} position={[SCREEN_X + 2.3, y0 + 1.05, 5.0]} />

      {/* grit channel: long, shallow, front wall cut low; sand settles on the floor */}
      <TankWall a={[GRIT.x0, GRIT.z0]} b={[GRIT.x1, GRIT.z0]} h={GRIT.h} y0={y0} />
      <TankWall a={[GRIT.x0, GRIT.z0]} b={[GRIT.x0, GRIT.z1]} h={GRIT.h} y0={y0} />
      <TankWall a={[GRIT.x1, GRIT.z0]} b={[GRIT.x1, GRIT.z1]} h={GRIT.h} y0={y0} />
      <TankWall a={[GRIT.x0, GRIT.z1]} b={[GRIT.x1, GRIT.z1]} h={0.3} y0={y0} />
      <Slab w={GRIT.x1 - GRIT.x0 - 0.3} h={GRIT.h - 0.55} d={GRIT.z1 - GRIT.z0 - 0.3} color={WATER.screen} position={[(GRIT.x0 + GRIT.x1) / 2, y0 + 0.3 + (GRIT.h - 0.55) / 2, (GRIT.z0 + GRIT.z1) / 2]} r={0.03} />
      {Array.from({ length: 7 }, (_, i) => (
        <Cut key={i} shape={S.hill(1.3 + hash01(i * 3.3) * 0.6, 0.18 + 0.3 * grit * (0.6 + hash01(i * 1.7) * 0.4), 0.02)} color="#d8c08f" depth={0.06}
          position={[GRIT.x0 + 0.7 + i * 0.85, y0 + 0.3, GRIT.z1 - 0.12]} cast={false} />
      ))}
      {Array.from({ length: 26 }, (_, i) => {
        const ph = (hash01(i * 2.3) + s * 0.3) % 1;
        const x = GRIT.x0 + 0.5 + hash01(i * 5.1) * (GRIT.x1 - GRIT.x0 - 1.0) + ph * 0.6;
        const y = y0 + GRIT.h - 0.35 - ph * (GRIT.h - 0.8);
        return <Cut key={i} shape={S.circle(0.05 + hash01(i * 7.3) * 0.03)} color="#e6d3a6" depth={0.03} position={[x, y, GRIT.z1 - 0.1]} cast={false} />;
      })}

      {/* primary clarifier: back half wall, cut face toward the camera */}
      <group position={[PRI.x, y0, PRI.z]}>
        <mesh position={[0, PRI.h / 2, 0]} material={paperFace(CONCRETE, { doubleSide: true })} castShadow receiveShadow>
          <cylinderGeometry args={[PRI.r, PRI.r, PRI.h, 48, 1, true, Math.PI / 2, Math.PI]} />
        </mesh>
        <Cut shape={halfDisc(PRI.r - 0.04)} color="#8e7f62" depth={0.06} position={[0, PRI.h - 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} cast={false} />
        <Slab w={PRI.r * 2} h={PRI.h - 0.25} d={0.08} color="#8e7f62" position={[0, (PRI.h - 0.25) / 2, 0.02]} r={0.02} />
        {/* sludge cone at the bottom */}
        <Cut shape={S.poly("sludge", [[-PRI.r + 0.05, 0], [PRI.r - 0.05, 0], [PRI.r - 0.05, 0.12], [0.5, 0.42], [-0.5, 0.42], [-PRI.r + 0.05, 0.12]])} color="#4a3a2c" depth={0.06}
          position={[0, 0.02, 0.09]} cast={false} scale={[1, 0.6 + grit * 0.6, 1]} />
        {Array.from({ length: 30 }, (_, i) => {
          const ph = (hash01(i * 4.1) + s * 0.18) % 1;
          const x = (hash01(i * 6.2) - 0.5) * (PRI.r * 2 - 0.6) * (1 - ph * 0.35);
          const y = PRI.h - 0.4 - ph * (PRI.h - 0.8);
          return <Cut key={i} shape={S.circle(0.05 + hash01(i * 2.9) * 0.04)} color="#4e3828" depth={0.03} position={[x, y, 0.1]} cast={false} />;
        })}
        <Slab w={PRI.r * 2 + 0.3} h={0.2} d={0.5} color="goldDeep" position={[0, PRI.h + 0.3, -0.4]} />
        <Slab w={PRI.r * 2 + 0.3} h={0.35} d={0.05} color="gold" position={[0, PRI.h + 0.55, -0.16]} r={0.02} />
        <mesh position={[0, PRI.h * 0.55, -0.3]} material={paperFace(CONCRETE_DEEP)} castShadow>
          <cylinderGeometry args={[0.3, 0.36, PRI.h * 1.3, 20]} />
        </mesh>
      </group>
      {/* grit -> primary flume, primary -> aeration overhead pipe */}
      <Sheet w={0.9} d={0.9} color={WATER.screen} position={[GRIT.x1 + 0.55, y0 + 1.05, 4.6]} />
      <mesh position={[(PRI.x + AER.x1) / 2, y0 + 2.0, -0.05]} rotation={[0, 0, Math.PI / 2]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.3, 0.3, PRI.x - AER.x1, 20]} />
      </mesh>
      <mesh position={[PRI.x, y0 + 1.6, -0.05]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.0, 20]} />
      </mesh>
      <mesh position={[AER.x1 + 0.05, y0 + 1.6, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.4, 20]} />
      </mesh>
      <PaperBushRow />
    </group>
  );
};

const PaperBushRow: React.FC = () => (
  <group>
    {[12, 15.5, 21.5].map((x, i) => (
      <Cut key={i} shape={S.cloud(2.2, 1.2, 3)} color="mint" depth={0.3} position={[x, 0, T1_FACE - 6 - i]} />
    ))}
  </group>
);

// ── Return sludge line (RAS) and disinfection ─────────────────────────────────────────────
export const RasLine: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  if (t <= 0.001) return null;
  const y = T2_TOP + 0.45;
  const z = 7.15;
  const xa = CLAR.x + 1.4, xb = AER.x0 + 0.8;
  const L = xb - xa;
  return (
    <group>
      <mesh position={[(xa + xb) / 2, y, z]} rotation={[0, 0, Math.PI / 2]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.32, 0.32, L * Math.min(1, t * 1.5), 20]} />
      </mesh>
      <mesh position={[xa, y, (CLAR.z + z) / 2 + 0.6]} rotation={[Math.PI / 2, 0, 0]} material={paperFace(PIPE)} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 1.9, 20]} />
      </mesh>
      {t > 0.6
        ? Array.from({ length: 4 }, (_, i) => {
            const x = xa + (((i / 4 + s * 0.35) % 1) * L);
            return <Arrow key={i} position={[x, y + 0.55, z]} rot={0} color="brown" size={0.9} />;
          })
        : null}
    </group>
  );
};

export const UvChannel: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const y0 = T2_TOP;
  const glow = 0.35 + 0.25 * t + 0.05 * Math.sin(s * 9);
  return (
    <group position={[-8.4, y0, 6.2]}>
      <TankWall a={[-0.85, -0.9]} b={[0.85, -0.9]} h={1.25} y0={0} t={0.2} />
      <TankWall a={[-0.85, 0.9]} b={[0.85, 0.9]} h={1.25} y0={0} t={0.2} />
      <TankWall a={[-0.85, -0.9]} b={[-0.85, 0.9]} h={1.25} y0={0} t={0.2} />
      <TankWall a={[0.85, -0.9]} b={[0.85, 0.9]} h={1.25} y0={0} t={0.2} />
      <Sheet w={1.5} d={1.6} color={WATER.outlet} position={[0, 1.05, 0]} />
      {[-0.45, -0.15, 0.15, 0.45].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]} material={paperFace("#eef3ff", { emissive: "#cfdcff", emissiveIntensity: glow, relief: 0.2 })}>
          <cylinderGeometry args={[0.07, 0.07, 1.5, 12]} />
        </mesh>
      ))}
    </group>
  );
};

/** Big pulsing flow arrows along the route (film readability). `on` 0..1. */
export const FlowArrows: React.FC<{ s: number; on: number }> = ({ s, on }) => {
  if (on <= 0.001) return null;
  const y0 = T2_TOP;
  const p = (k: number) => on * (1 + 0.08 * Math.sin(s * 5 + k));
  return (
    <group>
      <Arrow position={[SCREEN_X, y0 + 2.0, 1.2]} rot={-Math.PI / 2} flat size={1.6 * p(0)} />
      <Arrow position={[SCREEN_X + 2.3, y0 + 1.9, 5.0]} rot={0} flat size={1.4 * p(1)} />
      <Arrow position={[13.7, y0 + 2.0, 4.9]} rot={0} flat size={1.6 * p(2)} />
      <Arrow position={[12.0, y0 + 2.7, -0.05]} rot={Math.PI} size={1.5 * p(3)} />
      <Arrow position={[AER.x0 - 0.7, y0 + 2.0, 3.4]} rot={Math.PI} flat size={1.4 * p(4)} />
      <Arrow position={[CLAR.x - 2.6, y0 + 2.0, 5.6]} rot={-Math.PI / 2} flat size={1.4 * p(5)} />
    </group>
  );
};

// ── River bank sign (outro) ───────────────────────────────────────────────────────────────
export const RiverSign: React.FC<{ t: number }> = ({ t }) => (
  <Tag text="BUKAN AIR MINUM" icon="nocup" position={[-5.4, T3_TOP + 0.08, T2_FACE + 7.4]} t={t} w={3.4} stick={1.6} yaw={0.1} />
);

// ── Micro set ──────────────────────────────────────────────────────────────────────────────
export const MICRO: V3 = [200, 0, 0];
export const CARRIER_X = 10; // carriers sit at MICRO + [CARRIER_X, 0, 0]

const BACT = ["#e2cf9c", "#cdb57d", "#d8c08f", "#bfa76d"];

const Carrier: React.FC<{ position: V3; rot: [number, number, number]; seed: number }> = ({ position, rot, seed }) => {
  const film = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const a = hash01(seed + i * 1.37) * Math.PI * 2;
        const onWall = i < 46;
        const r = onWall ? 0.98 : hash01(seed + i * 2.1) * 0.9;
        const y = (hash01(seed + i * 3.9) - 0.5) * 0.62;
        const sz = 0.06 + hash01(seed + i * 5.3) * 0.07;
        return { p: [Math.cos(a) * r, y, Math.sin(a) * r] as V3, sz, c: hash01(seed + i * 7.7) > 0.5 ? "#7d6c34" : "#5f5a2e" };
      }),
    [seed],
  );
  return (
    <group position={position} rotation={rot}>
      <mesh material={paperFace("#f2efe6", { doubleSide: true, relief: 0.4 })} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.72, 40, 1, true]} />
      </mesh>
      <Slab w={2.05} h={0.72} d={0.06} color="#f2efe6" position={[0, 0, 0]} rotation={[0, 0, 0]} r={0.01} />
      <Slab w={2.05} h={0.72} d={0.06} color="#f2efe6" position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} r={0.01} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <Slab key={i} w={0.2} h={0.72} d={0.05} color="#e8e3d6" position={[Math.cos(a) * 1.13, 0, Math.sin(a) * 1.13]} rotation={[0, -a, 0]} r={0.01} />;
      })}
      {film.map((b, i) => (
        <mesh key={i} position={b.p} material={paperFace(b.c, { relief: 0.5 })}>
          <sphereGeometry args={[b.sz, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
};

export const MicroSet: React.FC<{ s: number; eat: number }> = ({ s, eat }) => {
  const bugs = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        p: [(hash01(i * 1.3) - 0.5) * 9, (hash01(i * 2.7) - 0.5) * 9, (hash01(i * 4.1) - 0.5) * 4] as V3,
        rod: hash01(i * 5.9) > 0.45,
        c: BACT[i % 4],
        a: hash01(i * 8.3) * Math.PI,
      })),
    [],
  );
  const specks = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({ p: [(hash01(i * 3.1 + 9) - 0.5) * 10, (hash01(i * 6.7 + 2) - 0.5) * 10, (hash01(i * 2.2 + 4) - 0.5) * 4] as V3, r: 0.1 + hash01(i * 4.4) * 0.12 })),
    [],
  );
  return (
    <group position={MICRO}>
      {/* brown water backdrop, same colour as the aeration cut face we zoom through */}
      <Cut shape={S.rectC(80, 80)} color={WATER.aeration} depth={0.2} position={[5, 0, -7]} cast={false} />
      {/* dissolved dirt: dark specks that shrink as bacteria eat them */}
      {specks.map((k, i) => {
        const sc = Math.max(0.001, 1 - eat * (0.55 + hash01(i * 9.1) * 0.6));
        return (
          <mesh key={i} position={k.p} scale={sc} material={paperFace("#4a3222", { relief: 0.4 })}>
            <icosahedronGeometry args={[k.r, 0]} />
          </mesh>
        );
      })}
      {/* faceless bacteria: rods and cocci */}
      {bugs.map((b, i) => {
        const wob = Math.sin(s * 1.4 + i) * 0.15;
        return (
          <mesh key={i} position={[b.p[0] + wob, b.p[1] + Math.cos(s * 1.1 + i) * 0.15, b.p[2]]} rotation={[0.4, b.a + s * 0.3, b.a]} material={paperFace(b.c, { relief: 0.5 })} castShadow>
            {b.rod ? <capsuleGeometry args={[0.16, 0.5, 6, 12]} /> : <sphereGeometry args={[0.2, 16, 12]} />}
          </mesh>
        );
      })}
      {/* rising air bubbles */}
      {Array.from({ length: 24 }, (_, i) => {
        const ph = (hash01(i * 3.3) + s * 0.25) % 1;
        return (
          <mesh key={i} position={[(hash01(i * 7.1) - 0.5) * 22 + 5, -7 + ph * 14, -5 + hash01(i * 2.2) * 2]} material={paperFace("#f6f1e6", { relief: 0.2 })}>
            <sphereGeometry args={[0.12 + hash01(i * 5.5) * 0.14, 16, 12]} />
          </mesh>
        );
      })}
      {/* MBBR plastic carriers with biofilm, tumbling */}
      {[
        [CARRIER_X, 0, 0],
        [CARRIER_X - 2.8, 1.8, -1.6],
        [CARRIER_X + 2.6, -1.6, -1.2],
        [CARRIER_X + 2.2, 2.4, -2.4],
        [CARRIER_X - 2.4, -2.2, -0.8],
      ].map((p, i) => (
        <Carrier key={i} seed={i * 17 + 3} position={p as V3} rot={[0.9 + s * (0.5 + i * 0.07), s * (0.35 + i * 0.05) + i, 0.3 * i]} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[CARRIER_X + (hash01(i * 2.4) - 0.5) * 7, (hash01(i * 3.6) - 0.5) * 6, (hash01(i * 1.8) - 0.5) * 2 + 1]} rotation={[s * 0.4 + i, i, 0]} material={paperFace(BACT[i % 4], { relief: 0.5 })}>
          <capsuleGeometry args={[0.12, 0.36, 6, 10]} />
        </mesh>
      ))}
    </group>
  );
};

export { remap };
