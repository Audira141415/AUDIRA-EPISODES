// EP05 film (CIRCUITFORGE): 3D set pieces that rise out of the SSD board in front of the hero stack.
// All times are seconds on the VO clock (timeline.json); positions in board units.
import React from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { AMBER, CYAN, EPOXY, LAYER_H, PINK, SEAM_H, fx, hdr, routeSampler } from "./Cover.tsx";
import { ROUTES, heroLabelTexture, type P2 } from "./coverTextures.ts";
import {
  audiraSilkTexture,
  caseLeftTexture,
  codeCardTexture,
  dayTexture,
  footprintTexture,
  priceTexture,
  shareTexture,
} from "./filmTextures.ts";

export type V3 = [number, number, number];
export const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};
export const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const STAGE: V3 = [0, 0, 1.1];
const GREEN = "#22c55e";
const RED = "#ff3b30";

// shared glow material cache (HDR colours, tone mapping off so bloom picks them up)
const glowCache = new Map<string, THREE.MeshBasicMaterial>();
const glow = (c: string, k0 = 2.6, op0 = 1) => {
  // quantised so animated values reuse a small set of materials
  const k = Math.round(k0 * 10) / 10;
  const opacity = Math.round(op0 * 20) / 20;
  const key = `${c}|${k}|${opacity}`;
  let m = glowCache.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: hdr(c, k), toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    glowCache.set(key, m);
  }
  return m;
};

// ---------- one die slab with its seam (lit or dark) ----------
const Slab: React.FC<{ pos: V3; w: number; d: number; seam: string | null }> = ({ pos, w, d, seam }) => (
  <group position={pos}>
    <mesh position={[0, SEAM_H / 2, 0]} material={seam ? glow(seam) : undefined} onUpdate={seam ? fx : undefined}>
      <boxGeometry args={[w - 0.012, SEAM_H, d - 0.012]} />
      {!seam && <meshStandardMaterial color="#2c313a" roughness={0.6} metalness={0.4} />}
    </mesh>
    <mesh castShadow receiveShadow position={[0, SEAM_H + LAYER_H / 2, 0]}>
      <RoundedBoxGeo args={[w, LAYER_H, d]} radius={0.012} segments={2} />
      <meshPhysicalMaterial {...EPOXY} />
    </mesh>
  </group>
);
const PITCH = LAYER_H + SEAM_H;

// ---------- film packets: the cover routes, dimmable ----------
export const RoutePackets: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const items: React.ReactNode[] = [];
  if (k < 0.02) return null;
  ROUTES.forEach((route, ri) => {
    const { total, at } = routeSampler(route);
    const color = ri % 3 === 1 ? AMBER : ri % 5 === 4 ? PINK : CYAN;
    const count = total > 4 ? 3 : 2;
    for (let j = 0; j < count; j++) {
      const head = ((ri * 0.37 + j / count) * total + t * 1.6) % total;
      for (let i = 0; i < 8; i++) {
        const s = head - i * 0.08;
        if (s < 0) break;
        const [x, z, yaw] = at(s);
        const sc = (i === 0 ? 1.4 : 1 - i * 0.07) * k;
        items.push(
          <mesh key={`${ri}-${j}-${i}`} position={[x, 0.012, z]} rotation={[0, yaw, 0]} scale={[sc, sc, 1]} material={glow(i === 0 ? "#ffffff" : color, i === 0 ? 4 : 1.2 + 2.2 * (1 - i / 8), 0.2 + 0.8 * (1 - i / 8))} onUpdate={fx}>
            <boxGeometry args={[0.045, 0.02, 0.085]} />
          </mesh>,
        );
      }
    }
  });
  return <>{items}</>;
};

// ---------- hero stack (cover hero, fill animated) ----------
export const HERO_POS: V3 = [0, 0, -2.75];
const HW = 1.36, HD = 1.1, HL = 13;
export const FilmHero: React.FC<{ filled: number; pulse: number }> = ({ filled, pulse }) => {
  const baseH = 0.07;
  const stackH = baseH + HL * PITCH;
  const capH = 0.42;
  const full = Math.floor(filled);
  return (
    <group position={HERO_POS}>
      <mesh castShadow receiveShadow position={[0, baseH / 2, 0]}>
        <RoundedBoxGeo args={[HW + 0.12, baseH, HD + 0.12]} radius={0.015} segments={2} />
        <meshStandardMaterial color="#2a3a30" roughness={0.5} metalness={0.3} />
      </mesh>
      {Array.from({ length: HL }, (_, i) => (
        <Slab key={i} pos={[0, baseH + i * PITCH, 0]} w={HW} d={HD} seam={i < full ? AMBER : null} />
      ))}
      {full < HL && (
        <mesh position={[0, baseH + full * PITCH + SEAM_H / 2, 0]} scale={[1, 1.4 * pulse, 1]} material={glow("#fff1cc", 3.4)} onUpdate={fx}>
          <boxGeometry args={[HW + 0.006, SEAM_H, HD + 0.006]} />
        </mesh>
      )}
      <HeroCap y={stackH} capH={capH} />
      <pointLight position={[0, 0.5, HD / 2 + 0.5]} color={AMBER} intensity={1.6} distance={2.6} decay={2} />
    </group>
  );
};

const HeroCap: React.FC<{ y: number; capH: number }> = ({ y, capH }) => {
  const label = heroLabelTexture();
  return (
    <>
      <mesh castShadow receiveShadow position={[0, y + capH / 2, 0]}>
        <RoundedBoxGeo args={[HW + 0.04, capH, HD + 0.04]} radius={0.03} segments={3} />
        <meshPhysicalMaterial {...EPOXY} color="#14161b" />
      </mesh>
      <mesh position={[0, y + capH / 2, HD / 2 + 0.0215]}>
        <planeGeometry args={[HW - 0.02, capH * 0.9]} />
        <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, y + capH + 0.02, 0]}>
        <RoundedBoxGeo args={[HW - 0.1, 0.04, HD - 0.1]} radius={0.012} segments={2} />
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.22} />
      </mesh>
    </>
  );
};

// ---------- AUDIRA silkscreen on the board, in front of the hero ----------
export const AUDIRA_SILK_POS: V3 = [0, 0.004, -1.9];
export const AudiraSilk: React.FC = () => (
  <mesh position={AUDIRA_SILK_POS} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[1.26, 0.42]} />
    <meshStandardMaterial map={audiraSilkTexture()} transparent roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

// ---------- board extension toward the camera (the cover board ends at z = 3) ----------
export const BoardApron: React.FC = () => {
  const grain = useSurfaceGrain(33, 0.25, 12);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 8]}>
      <planeGeometry args={[12, 10]} />
      <meshPhysicalMaterial color="#0e3a26" roughness={0.6} roughnessMap={grain} clearcoat={0.2} clearcoatRoughness={0.5} />
    </mesh>
  );
};

// ---------- calendar: 10 date chips (10..19 Nov) ----------
const DAYS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const WEEK = ["SEL", "RAB", "KAM", "JUM", "SAB", "MIN", "SEN", "SEL", "RAB", "KAM"];
export const dayPos = (i: number): V3 => {
  const c = i % 5, r = Math.floor(i / 5);
  return [STAGE[0] + (c - 2) * 0.5, 0, STAGE[2] + (r - 0.5) * 0.58];
};
export const CHIP_H = 0.13;
export const Calendar: React.FC<{
  t: number;
  rise: (i: number) => number; // 0..1 per chip
  lit: (i: number) => number; // 0..1: preload wave
  unduh: number; // download arrow on day 10
  lock: number; // padlock on day 19
}> = ({ t, rise, lit, unduh, lock }) => {
  return (
    <>
      {DAYS.map((d, i) => {
        const r = rise(i);
        if (r <= 0.001) return null;
        const p = dayPos(i);
        const accent = i === 0 ? CYAN : i === 9 ? PINK : "#8a93a3";
        const y = lerp(-CHIP_H - 0.02, 0, r);
        const l = lit(i);
        const seam = i === 9 ? PINK : l > 0.5 ? (i === 0 ? CYAN : AMBER) : null;
        return (
          <group key={d} position={[p[0], y, p[2]]}>
            <mesh position={[0, 0.006, 0]} material={seam ? glow(seam, 2.2) : undefined} onUpdate={seam ? fx : undefined}>
              <boxGeometry args={[0.43, 0.012, 0.43]} />
              {!seam && <meshStandardMaterial color="#2c313a" metalness={0.4} roughness={0.6} />}
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.012 + (CHIP_H - 0.012) / 2, 0]}>
              <RoundedBoxGeo args={[0.42, CHIP_H - 0.012, 0.42]} radius={0.02} segments={2} />
              <meshPhysicalMaterial {...EPOXY} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CHIP_H + 0.001, 0]}>
              <planeGeometry args={[0.395, 0.395]} />
              <meshPhysicalMaterial map={dayTexture(d, WEEK[i], accent)} roughness={0.4} clearcoat={0.4} />
            </mesh>
          </group>
        );
      })}
      {unduh > 0.01 && (
        <group position={[dayPos(0)[0], CHIP_H + 0.2 + 0.03 * Math.sin(t * 4), dayPos(0)[2]]} scale={unduh}>
          {/* download arrow, glowing cyan */}
          <mesh position={[0, 0.08, 0]} material={glow(CYAN, 3)} onUpdate={fx}>
            <boxGeometry args={[0.05, 0.16, 0.05]} />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI]} material={glow(CYAN, 3)} onUpdate={fx}>
            <coneGeometry args={[0.09, 0.1, 4]} />
          </mesh>
        </group>
      )}
      {lock > 0.01 && (
        <group position={[dayPos(9)[0], CHIP_H + 0.13, dayPos(9)[2]]} scale={lock}>
          <mesh castShadow position={[0, 0, 0]}>
            <RoundedBoxGeo args={[0.2, 0.16, 0.08]} radius={0.02} segments={2} />
            <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.22} />
          </mesh>
          <mesh castShadow position={[0, 0.08, 0]}>
            <torusGeometry args={[0.065, 0.017, 12, 32, Math.PI]} />
            <meshStandardMaterial color="#d6dbe2" metalness={0.95} roughness={0.18} />
          </mesh>
          <mesh position={[0, -0.005, 0.041]} material={glow(PINK, 3)} onUpdate={fx}>
            <circleGeometry args={[0.022, 16]} />
          </mesh>
        </group>
      )}
    </>
  );
};

// ---------- Xbox Series S usable-space column ----------
const COL_SLOTS = 20;
const COL_W = 0.9;
export const COL_FILL = 12; // 212 GB: more than half of the usable space (shown as > 1/2, no GB figure)
export const colLayerY = (i: number) => 0.07 + i * PITCH;
export const Column: React.FC<{ rise: number; fill: number; half: number }> = ({ rise, fill, half }) => {
  if (rise <= 0.001) return null;
  const y0 = lerp(-(0.07 + COL_SLOTS * PITCH) - 0.05, 0, rise);
  const n = Math.floor(fill);
  const top = 0.07 + COL_SLOTS * PITCH;
  return (
    <group position={[STAGE[0], y0, STAGE[2]]}>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <RoundedBoxGeo args={[COL_W + 0.16, 0.07, COL_W + 0.16]} radius={0.015} segments={2} />
        <meshStandardMaterial color="#2a3a30" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* corner posts */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} castShadow position={[(sx * (COL_W + 0.06)) / 2, top / 2, (sz * (COL_W + 0.06)) / 2]}>
          <cylinderGeometry args={[0.018, 0.018, top, 12]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: COL_SLOTS }, (_, i) =>
        i < n ? (
          <Slab key={i} pos={[0, colLayerY(i), 0]} w={COL_W} d={COL_W} seam={AMBER} />
        ) : (
          <mesh key={i} position={[0, colLayerY(i) + PITCH / 2, 0]} material={glow("#7fa6c4", 0.55, 0.12)} onUpdate={fx}>
            <boxGeometry args={[COL_W, LAYER_H, COL_W]} />
          </mesh>
        ),
      )}
      {/* half-way ring */}
      {half > 0.01 &&
        [0, 1, 2, 3].map((k) => (
          <mesh
            key={k}
            position={[k === 0 ? 0 : k === 1 ? 0 : k === 2 ? -(COL_W + 0.1) / 2 : (COL_W + 0.1) / 2, colLayerY(COL_SLOTS / 2), k === 0 ? (COL_W + 0.1) / 2 : k === 1 ? -(COL_W + 0.1) / 2 : 0]}
            rotation={[0, k >= 2 ? Math.PI / 2 : 0, 0]}
            scale={[half, 1, 1]}
            material={glow(PINK, 3)}
            onUpdate={fx}
          >
            <boxGeometry args={[COL_W + 0.12, 0.014, 0.014]} />
          </mesh>
        ))}
    </group>
  );
};

// ---------- network funnel: millions of downloads squeezed through one link ----------
const LANES = 14;
const GATE: P2 = [0, 1.55];
const laneRoute = (i: number): P2[] => {
  const x = -1.55 + (3.1 * i) / (LANES - 1);
  return [[x, -0.8], [x, 0.35], [0, GATE[1] - 0.05], [0, 2.9]];
};
const LANE_SAMPLERS = Array.from({ length: LANES }, (_, i) => routeSampler(laneRoute(i)));
export const Funnel: React.FC<{ t: number; on: number; jam: number; clear: number }> = ({ t, on, jam, clear }) => {
  if (on <= 0.01) return null;
  const items: React.ReactNode[] = [];
  LANE_SAMPLERS.forEach((smp, li) => {
    const route = laneRoute(li);
    const gateS = smp.total - (2.9 - GATE[1]);
    // faint lane
    route.slice(1).forEach((b, k) => {
      const a = route[k];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      items.push(
        <mesh key={`l${li}-${k}`} position={[(a[0] + b[0]) / 2, 0.006, (a[1] + b[1]) / 2]} rotation={[0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0]} scale={[on, 1, 1]} material={glow(CYAN, 0.8, 0.22)} onUpdate={fx}>
          <boxGeometry args={[0.02, 0.004, len]} />
        </mesh>,
      );
    });
    for (let j = 0; j < 3; j++) {
      const speed = lerp(1.2, 0.25, jam * (1 - clear)) + clear * 1.0;
      let head = ((li * 0.29 + j / 3) * gateS + t * speed) % (smp.total + 0.4);
      const q = jam * (1 - clear);
      // jam: packets pile up in front of the gate
      if (q > 0) head = lerp(head, Math.min(head, gateS - 0.06 - (li % 4) * 0.07 - j * 0.11), q);
      const col = q > 0.5 ? RED : li % 3 === 0 ? AMBER : CYAN;
      for (let i = 0; i < 6; i++) {
        const s = head - i * 0.07;
        if (s < 0 || s > smp.total) continue;
        const [x, z, yaw] = smp.at(s);
        const sc = (i === 0 ? 1.4 : 1 - i * 0.1) * on;
        items.push(
          <mesh key={`p${li}-${j}-${i}`} position={[x, 0.014, z]} rotation={[0, yaw, 0]} scale={[sc, sc, 1]} material={glow(i === 0 ? "#ffffff" : col, i === 0 ? 4 : 1.4 + 2 * (1 - i / 6), 0.25 + 0.75 * (1 - i / 6))} onUpdate={fx}>
            <boxGeometry args={[0.05, 0.022, 0.09]} />
          </mesh>,
        );
      }
    }
  });
  const alarm = jam * (1 - clear);
  return (
    <>
      {items}
      <group position={[GATE[0], 0, GATE[1]]} scale={[1, on, 1]}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <RoundedBoxGeo args={[0.42, 0.16, 0.3]} radius={0.02} segments={2} />
          <meshPhysicalMaterial {...EPOXY} />
        </mesh>
        <mesh position={[0.13, 0.17, 0.08]} material={glow(alarm > 0.5 ? RED : GREEN, alarm > 0.5 ? 3 + 1.5 * Math.sin(t * 14) : 2.4)} onUpdate={fx}>
          <sphereGeometry args={[0.03, 12, 10]} />
        </mesh>
      </group>
    </>
  );
};

// ---------- pre-order towers: one stack that splits 74 / 26 ----------
const TW = 0.66;
const T_LAYERS = 20;
const PS_N = 15; // 74% of the stack
export const TOWER_L: V3 = [STAGE[0] - 0.38, 0, STAGE[2]];
export const TOWER_R: V3 = [STAGE[0] + 0.5, 0, STAGE[2]];
export const towerTopY = (n: number) => 0.07 + n * PITCH;
export const Towers: React.FC<{ rise: number; grow: number; split: number; caps: number }> = ({ rise, grow, split, caps }) => {
  if (rise <= 0.001) return null;
  const sink = lerp(-(towerTopY(T_LAYERS) + 0.4), 0, rise);
  const n = Math.min(T_LAYERS, Math.floor(grow));
  const layers: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const toRight = i >= PS_N;
    const from: V3 = [STAGE[0], 0.07 + i * PITCH, STAGE[2]];
    const to: V3 = toRight ? [TOWER_R[0], 0.07 + (i - PS_N) * PITCH, TOWER_R[2]] : [TOWER_L[0], 0.07 + i * PITCH, TOWER_L[2]];
    // right-hand layers hop over in a short arc, staggered from the top
    const k = toRight ? seg(split, (T_LAYERS - 1 - i) * 0.1, (T_LAYERS - 1 - i) * 0.1 + 0.6) : split;
    const arc = toRight ? Math.sin(k * Math.PI) * 0.35 : 0;
    const seam = split < 0.5 ? AMBER : toRight ? GREEN : CYAN;
    layers.push(<Slab key={i} pos={[lerp(from[0], to[0], k), lerp(from[1], to[1], k) + arc, lerp(from[2], to[2], k)]} w={TW} d={TW} seam={seam} />);
  }
  const bases: V3[] = split < 0.02 ? [[STAGE[0], 0, STAGE[2]]] : [TOWER_L, TOWER_R];
  return (
    <group position={[0, sink, 0]}>
      {bases.map((b, i) => (
        <mesh key={i} castShadow receiveShadow position={[lerp(STAGE[0], b[0], split), 0.035, b[2]]}>
          <RoundedBoxGeo args={[TW + 0.12, 0.07, TW + 0.12]} radius={0.015} segments={2} />
          <meshStandardMaterial color="#2a3a30" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {layers}
      {caps > 0.01 && (
        <>
          <ShareCap pos={[TOWER_L[0], towerTopY(PS_N), TOWER_L[2]]} k={caps} tex={shareTexture("PlayStation", "74%", CYAN)} />
          <ShareCap pos={[TOWER_R[0], towerTopY(T_LAYERS - PS_N), TOWER_R[2]]} k={caps} tex={shareTexture("Xbox", "26%", GREEN)} />
        </>
      )}
    </group>
  );
};
const ShareCap: React.FC<{ pos: V3; k: number; tex: THREE.Texture }> = ({ pos, k, tex }) => (
  <group position={[pos[0], pos[1] + 0.2 * (1 - k), pos[2]]} scale={[1, Math.max(0.01, k), 1]}>
    <mesh castShadow position={[0, 0.17, 0]}>
      <RoundedBoxGeo args={[TW + 0.04, 0.34, TW + 0.04]} radius={0.025} segments={2} />
      <meshPhysicalMaterial {...EPOXY} color="#14161b" />
    </mesh>
    <mesh position={[0, 0.17, (TW + 0.04) / 2 + 0.002]}>
      <planeGeometry args={[TW - 0.02, 0.31]} />
      <meshPhysicalMaterial map={tex} roughness={0.35} clearcoat={0.5} />
    </mesh>
  </group>
);

// ---------- price tag (PlayStation Store Indonesia, standard edition) ----------
export const TAG_POS: V3 = [STAGE[0], 0, STAGE[2] + 0.2];
export const PriceTag: React.FC<{ t: number; rise: number; out: number }> = ({ t, rise, out }) => {
  if (rise <= 0.001 || out >= 0.999) return null;
  const w = 1.2, h = 0.675;
  const y = lerp(-1.2, 0, rise);
  const sway = Math.sin(t * 1.3) * 0.05;
  return (
    <group position={[TAG_POS[0] - out * 2.2, y, TAG_POS[2]]} rotation={[0, sway - out * 0.6, 0]}>
      {/* stand */}
      <mesh castShadow position={[0, 0.2, -0.02]}>
        <cylinderGeometry args={[0.014, 0.014, 0.4, 10]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.012, -0.02]}>
        <cylinderGeometry args={[0.16, 0.18, 0.024, 32]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
      </mesh>
      <group position={[0, 0.4 + h / 2, 0]} rotation={[-0.08, 0, 0.03]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[w + 0.04, h + 0.04, 0.03]} radius={0.012} segments={2} />
          <meshPhysicalMaterial color="#1a1d24" roughness={0.4} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.0165]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial map={priceTexture()} roughness={0.55} clearcoat={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- physical edition: a case that opens on a download-code card, no disc ----------
export const CASE_POS: V3 = [STAGE[0] + 0.0, 0, STAGE[2] + 0.25];
export const GameCase: React.FC<{ rise: number; open: number; out: number }> = ({ rise, open, out }) => {
  if (rise <= 0.001 || out >= 0.999) return null;
  const pw = 0.6, ph = 0.78;
  const y = lerp(-1.4, 0, rise) - out * 1.4;
  const rotY = Math.PI * (1 - open) * 0.97;
  return (
    <group position={[CASE_POS[0] + 0.0, y + 0.06 + ph / 2, CASE_POS[2]]} rotation={[-0.06, 0, 0]}>
      {/* right half: fixed, code card inside */}
      <mesh castShadow receiveShadow position={[pw / 2, 0, -0.016]}>
        <RoundedBoxGeo args={[pw, ph, 0.03]} radius={0.014} segments={2} />
        <meshPhysicalMaterial {...EPOXY} color="#1d2a44" />
      </mesh>
      <mesh position={[pw / 2, 0, 0.0005]}>
        <planeGeometry args={[pw * 0.86, ph * 0.86]} />
        <meshPhysicalMaterial map={codeCardTexture()} roughness={0.5} />
      </mesh>
      {/* spine */}
      <mesh castShadow position={[0, 0, -0.016]}>
        <boxGeometry args={[0.03, ph, 0.03]} />
        <meshPhysicalMaterial {...EPOXY} color="#16223a" />
      </mesh>
      {/* left half: hinged on the spine */}
      <group rotation={[0, rotY, 0]}>
        <mesh castShadow receiveShadow position={[-pw / 2, 0, -0.016]}>
          <RoundedBoxGeo args={[pw, ph, 0.03]} radius={0.014} segments={2} />
          <meshPhysicalMaterial {...EPOXY} color="#1d2a44" />
        </mesh>
        <mesh position={[-pw / 2, 0, 0.0005]}>
          <planeGeometry args={[pw * 0.92, ph * 0.92]} />
          <meshPhysicalMaterial map={caseLeftTexture()} roughness={0.5} />
        </mesh>
      </group>
      {/* stand on the board */}
      <mesh castShadow receiveShadow position={[0, -ph / 2 - 0.03, 0]}>
        <RoundedBoxGeo args={[1.4, 0.06, 0.24]} radius={0.02} segments={2} />
        <meshStandardMaterial color="#2a3a30" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- empty PC footprint ----------
export const FOOT_POS: V3 = [STAGE[0], 0.004, STAGE[2] + 0.1];
export const Footprint: React.FC<{ on: number; t: number }> = ({ on, t }) => {
  if (on <= 0.01) return null;
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  return (
    <group position={FOOT_POS}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 1.15]} />
        <meshStandardMaterial map={footprintTexture()} transparent opacity={on} roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} material={glow(PINK, 1.6 * pulse * on, 0.5 * on)} onUpdate={fx}>
        <ringGeometry args={[0.72, 0.745, 4, 1]} />
      </mesh>
    </group>
  );
};
