// EP05 Galata film-only pieces: Ottoman camp, glowing paths, padlock, camera-space paper cards,
// the AUDIRA brass plaque, the hauling team (faceless silhouettes + oxen), and the ~70-ship fleet.
// Pure functions of their props (time in seconds); no randomness outside seeded prng.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Ship, canvasTex, routeCurve, rr } from "./parts.tsx";
import { camBasis, type Pose } from "./camera.ts";
import { PAL, ROUTE, v3, w3, type P2 } from "./world.ts";
import { clamp01, smooth } from "./time.ts";
import { FLEET_GAP, FLEET_N, routeC } from "./fleet.ts";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- glowing path (tube with draw range + optional arrow head) ----------
export const GlowPath: React.FC<{ pts: P2[]; progress: number; color: string; lift?: number; r?: number; water?: boolean; glow?: number; opacity?: number }> = ({
  pts, progress, color, lift = 0.03, r = 0.014, water = false, glow = 2.4, opacity = 1,
}) => {
  const { tube, curve } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => (water ? w3(x, y, lift) : v3(x, y, lift))), false, "centripetal");
    return { tube: new THREE.TubeGeometry(curve, 160, r, 8, false), curve };
  }, [pts, lift, r, water]);
  const k = clamp01(progress);
  if (k <= 0.001 || opacity <= 0.01) return null;
  const count = Math.floor((tube.index!.count * k) / 6) * 6;
  tube.setDrawRange(0, count);
  const hp = curve.getPointAt(k), hd = curve.getTangentAt(k);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), hd);
  return (
    <group>
      <mesh geometry={tube} renderOrder={5}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} toneMapped={false} transparent opacity={opacity} />
      </mesh>
      <mesh position={hp} quaternion={q}>
        <coneGeometry args={[r * 3.6, r * 9, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} toneMapped={false} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

// ---------- Ottoman camp outside the land walls (tents + plain pennants; no people) ----------
const CAMP: { p: P2; s: number; c: string }[] = (() => {
  const rnd = prng(1453 * 7);
  const out: { p: P2; s: number; c: string }[] = [];
  for (let i = 0; i < 26; i++) {
    const y = -2.3 + (i / 25) * 3.7 + (rnd() - 0.5) * 0.25;
    const x = -5.05 + (y + 2.6) * 0.3 - 0.25 - rnd() * 0.55;
    out.push({ p: [x, y], s: 0.7 + rnd() * 0.6, c: rnd() < 0.3 ? "#b33a2c" : "#efe3c6" });
  }
  return out;
})();
export const Camp: React.FC<{ k: number }> = ({ k }) => (
  <group>
    {CAMP.map(({ p, s, c }, i) => {
      const a = smooth(k * 1.6 - (i / CAMP.length) * 0.6);
      if (a <= 0.001) return null;
      const pos = v3(p[0], p[1], 0);
      return (
        <group key={i} position={pos} scale={[s * 0.15, s * 0.15 * a, s * 0.15]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.6, 0.9, 10]} />
            <meshPhysicalMaterial {...POLISH.fabric} color={c} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.62, 0.4, 10]} />
            <meshPhysicalMaterial {...POLISH.fabric} color={c === "#efe3c6" ? "#e2d3b2" : "#9b2f24"} />
          </mesh>
          {i % 3 === 0 ? (
            <group position={[0, 0.9, 0]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.7, 6]} />
                <meshPhysicalMaterial {...POLISH.stone} color="#4a3423" />
              </mesh>
              <mesh position={[0.22, 0.58, 0]} castShadow>
                <planeGeometry args={[0.42, 0.24]} />
                <meshPhysicalMaterial {...POLISH.fabric} color={PAL.red} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ) : null}
        </group>
      );
    })}
  </group>
);

// ---------- padlock over the mouth of the Golden Horn ----------
export const Padlock: React.FC<{ at: THREE.Vector3; k: number; face: number }> = ({ at, k, face }) => {
  if (k <= 0.001) return null;
  const s = 0.22 * smooth(k);
  const gold = { color: "#c9a04a", metalness: 0.9, roughness: 0.3, clearcoat: 0.4 };
  return (
    <group position={[at.x, at.y + 0.35 * smooth(k), at.z]} rotation={[0, face, 0]} scale={s}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <torusGeometry args={[0.32, 0.075, 14, 32, Math.PI]} />
        <meshPhysicalMaterial {...gold} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.22, 12]} />
          <meshPhysicalMaterial {...gold} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} castShadow>
        <RoundedBoxGeo args={[0.95, 0.75, 0.32]} radius={0.1} />
        <meshPhysicalMaterial color="#3d3129" metalness={0.75} roughness={0.38} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.06, 0.17]}>
        <circleGeometry args={[0.08, 20]} />
        <meshStandardMaterial color="#c9a04a" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- paper cards held in camera space (a real lit 3D card, not a flat overlay) ----------
export type CardDraw = (c: CanvasRenderingContext2D, w: number, h: number) => void;
export const CamCard: React.FC<{ pose: Pose; k: number; x: number; y: number; dist: number; w: number; h: number; draw: CardDraw; id: string; tilt?: number }> = ({
  pose, k, x, y, dist, w, h, draw, id, tilt = 0.12,
}) => {
  const tex = useMemo(() => {
    const cw = 1024, ch = Math.round((1024 * h) / w);
    return canvasTex(cw, ch, (c) => draw(c, cw, ch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, w, h]);
  if (k <= 0.001) return null;
  const { pos, quat } = camBasis(pose);
  const e = smooth(k);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
  // slides up from below while it settles (no overshoot)
  const yy = y - (1 - e) * 0.5;
  const p = pos.clone().addScaledVector(fwd, dist).addScaledVector(right, x).addScaledVector(up, yy);
  const q = quat.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-tilt * (2 - e), 0.08, -0.03 * (1 - e))));
  return (
    <group position={p} quaternion={q}>
      <mesh position={[0.012, -0.018, -0.01]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35 * e} />
      </mesh>
      <mesh>
        <RoundedBoxGeo args={[w, h, 0.006]} radius={0.004} />
        <meshPhysicalMaterial {...POLISH.paper} map={tex} transparent opacity={e} />
      </mesh>
    </group>
  );
};

const paperBg = (c: CanvasRenderingContext2D, w: number, h: number) => {
  c.fillStyle = PAL.cream;
  c.fillRect(0, 0, w, h);
  const rnd = prng(9);
  for (let i = 0; i < 1400; i++) {
    c.fillStyle = `rgba(120,90,50,${rnd() * 0.06})`;
    c.fillRect(rnd() * w, rnd() * h, 2, 2);
  }
  c.strokeStyle = PAL.ink;
  c.lineWidth = 8;
  rr(c, 18, 18, w - 36, h - 36, 14);
  c.stroke();
  c.lineWidth = 2.5;
  rr(c, 34, 34, w - 68, h - 68, 10);
  c.stroke();
};

/** Hadith card: typographic only, no hadith text (register #36–#38). */
export const drawHadis: CardDraw = (c, w, h) => {
  paperBg(c, w, h);
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = PAL.ink;
  c.font = `600 ${h * 0.2}px ${FONT}`;
  (c as unknown as { letterSpacing: string }).letterSpacing = `${h * 0.03}px`;
  c.fillText("HADIS", w / 2, h * 0.27);
  c.font = `500 ${h * 0.09}px ${FONT}`;
  (c as unknown as { letterSpacing: string }).letterSpacing = "2px";
  c.fillStyle = "#4a3b2c";
  c.fillText("diriwayatkan Imam Ahmad", w / 2, h * 0.47);
  c.fillStyle = PAL.red;
  rr(c, w * 0.1, h * 0.6, w * 0.8, h * 0.22, 12);
  c.fill();
  c.fillStyle = "#fff6e6";
  c.font = `600 ${h * 0.085}px ${FONT}`;
  c.fillText("DERAJATNYA DIPERSELISIHKAN", w / 2, h * 0.715);
};

/** Venice 1439 inset: river Adige to Lake Garda over land (register #13). Schematic shapes. */
export const drawVenice: CardDraw = (c, w, h) => {
  paperBg(c, w, h);
  const X = (u: number) => w * u, Y = (v: number) => h * v;
  // land wash
  c.fillStyle = "#eadfc2";
  rr(c, X(0.07), Y(0.2), X(0.86), Y(0.56), 8);
  c.fill();
  // Lake Garda: long lake, wider at the south
  c.fillStyle = PAL.sea;
  c.strokeStyle = PAL.ink;
  c.lineWidth = 4;
  c.beginPath();
  const lake: [number, number][] = [[0.3, 0.24], [0.33, 0.26], [0.35, 0.38], [0.38, 0.5], [0.44, 0.6], [0.42, 0.7], [0.32, 0.72], [0.25, 0.66], [0.27, 0.52], [0.28, 0.38]];
  lake.forEach(([u, v], i) => (i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v))));
  c.closePath();
  c.fill();
  c.stroke();
  // river Adige
  c.strokeStyle = "#5f8a90";
  c.lineWidth = 7;
  c.beginPath();
  c.moveTo(X(0.62), Y(0.22));
  c.bezierCurveTo(X(0.64), Y(0.4), X(0.6), Y(0.55), X(0.72), Y(0.76));
  c.stroke();
  // overland route (dashed red) from the river to the lake
  c.strokeStyle = PAL.red;
  c.lineWidth = 7;
  c.setLineDash([18, 12]);
  c.beginPath();
  c.moveTo(X(0.62), Y(0.4));
  c.quadraticCurveTo(X(0.52), Y(0.3), X(0.36), Y(0.36));
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = PAL.red;
  c.beginPath();
  c.moveTo(X(0.35), Y(0.36)); c.lineTo(X(0.395), Y(0.32)); c.lineTo(X(0.395), Y(0.40)); c.closePath();
  c.fill();
  c.fillStyle = "#35454a";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `italic 500 ${h * 0.052}px ${FONT}`;
  c.fillText("Danau Garda", X(0.2), Y(0.8));
  c.fillText("Sungai Adige", X(0.76), Y(0.27));
  // title band
  c.fillStyle = PAL.ink;
  c.font = `600 ${h * 0.1}px ${FONT}`;
  (c as unknown as { letterSpacing: string }).letterSpacing = `${h * 0.012}px`;
  c.fillText("VENESIA 1439", w / 2, Y(0.11));
  c.fillStyle = "#4a3b2c";
  c.font = `500 ${h * 0.05}px ${FONT}`;
  (c as unknown as { letterSpacing: string }).letterSpacing = "1px";
  c.fillText("galai dipindah lewat darat", w / 2, Y(0.88));
};

// ---------- AUDIRA brass plaque on the north of the map ----------
export const Plaque: React.FC<{ at: P2; face: number }> = ({ at, face }) => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 256, (c) => {
        const g = c.createLinearGradient(0, 0, 1024, 256);
        g.addColorStop(0, "#b8892f");
        g.addColorStop(0.5, "#e2bd6a");
        g.addColorStop(1, "#a57a28");
        c.fillStyle = g;
        c.fillRect(0, 0, 1024, 256);
        c.strokeStyle = "rgba(60,40,15,0.8)";
        c.lineWidth = 6;
        rr(c, 16, 16, 992, 224, 18);
        c.stroke();
        c.fillStyle = "rgba(55,36,12,0.92)";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `600 104px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = "26px";
        c.fillText("AUDIRA", 512, 108);
        c.font = `500 34px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = "8px";
        c.fillText("PETA TANDUK EMAS · 1453", 512, 196);
      }),
    [],
  );
  const grain = useSurfaceGrain(404, 0.25, 3);
  const p = v3(at[0], at[1], 0);
  return (
    <group position={p} rotation={[0, face, 0]}>
      <mesh position={[0, 0.2, 0]} rotation={[-0.45, 0, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.5, 0.375, 0.03]} radius={0.012} />
        <meshPhysicalMaterial map={tex} metalness={0.8} roughness={0.32} roughnessMap={grain} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.07]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshPhysicalMaterial color="#4a3423" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- the fleet ----------
export { routeC, FLEET_N, FLEET_GAP };
const ROUTE_END = ROUTE[ROUTE.length - 1];

// Horn centreline (map km) where the ships gather after launching (inside the Golden Horn).
const HORN_LINE: P2[] = [[-1.35, 0.7], [-2.0, 1.18], [-2.55, 1.62], [-2.95, 2.2], [-3.25, 2.9]];
const hornAt = (s: number): { p: P2; d: P2 } => {
  const n = HORN_LINE.length - 1;
  const t = Math.min(n - 1e-6, Math.max(0, s * n));
  const i = Math.floor(t), f = t - i;
  const a = HORN_LINE[i], b = HORN_LINE[i + 1];
  const d: P2 = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(d[0], d[1]);
  return { p: [a[0] + d[0] * f, a[1] + d[1] * f], d: [d[0] / l, d[1] / l] };
};
const slot = (i: number): { p: P2; deg: number } => {
  const row = Math.floor(i / 5), col = (i % 5) - 2;
  const { p, d } = hornAt(0.02 + row / 14);
  const nx = -d[1], ny = d[0];
  const jit = Math.sin(i * 12.9898) * 0.02;
  return { p: [p[0] + nx * col * 0.085 + jit, p[1] + ny * col * 0.085], deg: (Math.atan2(d[1], d[0]) * 180) / Math.PI + 180 };
};

/** Ship i at fleet parameter `u` (route 0..1, then water 1..1.6, parked after). */
export const FleetShip: React.FC<{ i: number; u: number; f: number; sail: number; L: number; lod: boolean }> = ({ i, u, f, sail, L, lod }) => {
  if (u < -0.3) return null;
  if (u < 0) {
    // queued afloat in the Bosporus by Double Columns
    const k = (u + 0.3) / 0.3;
    const p: P2 = [lerp(2.75, 2.25, k) + (i % 2) * 0.08, lerp(1.25, 2.05, k)];
    return (
      <group position={w3(p[0], p[1], -0.004)} rotation={[0, (lerp(250, 155, k) * Math.PI) / 180, 0]}>
        <Ship L={L * 0.8} sail={0.3} lod frame={f} seed={i * 5 + 3} />
      </group>
    );
  }
  if (u <= 1) {
    const c = routeC();
    const p = c.getPointAt(u), d = c.getTangentAt(u);
    const yaw = Math.atan2(-d.z, d.x), pitch = Math.asin(Math.max(-1, Math.min(1, d.y)));
    return (
      <group position={p} rotation={[0, yaw, 0]}>
        <group rotation={[0, 0, pitch]}>
          <Ship L={L} sail={sail} lod={lod} oarsUp onCradle frame={f} seed={i * 5 + 3} rollers={u * 60} />
        </group>
      </group>
    );
  }
  // slide into the water and glide to the slot
  const s = slot(i);
  const k = smooth((u - 1) / 0.6);
  const a = ROUTE_END, ctl: P2 = [-1.85, 1.05];
  const x = (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * ctl[0] + k * k * s.p[0];
  const y = (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * ctl[1] + k * k * s.p[1];
  const dx = 2 * (1 - k) * (ctl[0] - a[0]) + 2 * k * (s.p[0] - ctl[0]);
  const dy = 2 * (1 - k) * (ctl[1] - a[1]) + 2 * k * (s.p[1] - ctl[1]);
  const headMove = (Math.atan2(dy, dx) * 180) / Math.PI;
  const deg = k < 0.98 ? headMove : s.deg;
  const lift = (1 - smooth((u - 1) / 0.12)) * 0.03;
  return (
    <group position={w3(x, y, -0.004 + lift + Math.sin(f * 0.05 + i) * 0.002)} rotation={[0, (deg * Math.PI) / 180, 0]}>
      <Ship L={L * lerp(1, 0.75, k)} sail={lerp(sail, 0.45, k)} lod={lod || k > 0.5} frame={f} seed={i * 5 + 3} />
    </group>
  );
};

export const Fleet: React.FC<{ P: number; f: number; sail: number; heroL: number }> = ({ P, f, sail, heroL }) => (
  <group>
    {Array.from({ length: FLEET_N }, (_, i) => {
      const u = P - i * FLEET_GAP;
      return <FleetShip key={i} i={i} u={u} f={f} sail={sail} L={i === 0 ? heroL : 0.28} lod={i > 6} />;
    })}
  </group>
);

/** Ships that have reached the water (for the HUD counter). */
export const arrived = (P: number) => {
  let n = 0;
  for (let i = 0; i < FLEET_N; i++) if (P - i * FLEET_GAP >= 1) n++;
  return n;
};

// ---------- hauling team: faceless silhouettes (from behind / far) + oxen + windlass ----------
const Figure: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const bob = Math.abs(Math.sin(f * 0.18 + seed)) * 0.004;
  return (
    <group position={[0, bob, 0]} rotation={[0, 0, 0.32]}>
      <mesh position={[0, 0.032, 0]} castShadow>
        <coneGeometry args={[0.016, 0.064, 10]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#4a3a2c" />
      </mesh>
      {/* covered head (wrapped cloth), no facial features */}
      <mesh position={[0, 0.072, 0]} castShadow>
        <sphereGeometry args={[0.011, 12, 10]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#e7dcc4" />
      </mesh>
    </group>
  );
};
const Ox: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const bob = Math.abs(Math.sin(f * 0.14 + seed)) * 0.003;
  const hide = { ...POLISH.clay, color: seed % 2 ? "#8a6a48" : "#a58560" };
  return (
    <group position={[0, bob, 0]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <RoundedBoxGeo args={[0.09, 0.04, 0.035]} radius={0.012} />
        <meshPhysicalMaterial {...hide} />
      </mesh>
      <mesh position={[0.055, 0.05, 0]} castShadow>
        <RoundedBoxGeo args={[0.03, 0.025, 0.022]} radius={0.007} />
        <meshPhysicalMaterial {...hide} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.06, 0.066, s * 0.014]} rotation={[s * 0.6, 0, 0]}>
          <coneGeometry args={[0.003, 0.016, 6]} />
          <meshPhysicalMaterial color="#efe3c6" roughness={0.5} />
        </mesh>
      ))}
      {[[-0.03, -1], [-0.03, 1], [0.03, -1], [0.03, 1]].map(([x, s], i) => (
        <mesh key={i} position={[x, 0.012, s * 0.012]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.024, 6]} />
          <meshPhysicalMaterial {...hide} />
        </mesh>
      ))}
    </group>
  );
};

/** The team hauling ship 0 (fleet parameter u0), visible with weight `k`. */
export const Haulers: React.FC<{ u0: number; f: number; k: number }> = ({ u0, f, k }) => {
  if (k <= 0.001 || u0 < 0 || u0 > 0.8) return null;
  const c = routeC();
  const at = (u: number, side: number) => {
    const p = c.getPointAt(Math.min(1, Math.max(0, u)));
    const d = c.getTangentAt(Math.min(1, Math.max(0, u)));
    const n = new THREE.Vector3(-d.z, 0, d.x).normalize();
    return { p: p.clone().addScaledVector(n, side), yaw: Math.atan2(-d.z, d.x) };
  };
  const units: { u: number; side: number; kind: "ox" | "man" }[] = [];
  for (let r = 0; r < 4; r++) for (const s of [-0.035, 0.035]) units.push({ u: u0 + 0.075 + r * 0.03, side: s, kind: "ox" });
  for (let r = 0; r < 5; r++) for (const s of [-0.1, 0.1]) units.push({ u: u0 + 0.07 + r * 0.025, side: s, kind: "man" });
  const bow = at(u0 + 0.045, 0).p;
  return (
    <group scale={[1, smooth(k), 1]}>
      {units.map(({ u, side, kind }, i) => {
        const { p, yaw } = at(u, side);
        return (
          <group key={i} position={p} rotation={[0, yaw, 0]} scale={kind === "ox" ? 1.1 : 1.15}>
            {kind === "ox" ? <Ox f={f} seed={i} /> : <Figure f={f} seed={i} />}
          </group>
        );
      })}
      {[-0.05, 0.05].map((s) => {
        const end = at(u0 + 0.18, s * 0.7).p;
        const a = bow.clone().add(new THREE.Vector3(0, 0.12, 0));
        const b = end.clone().add(new THREE.Vector3(0, 0.04, 0));
        const mid = a.clone().lerp(b, 0.5);
        const v = b.clone().sub(a);
        return (
          <mesh key={s} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize())}>
            <cylinderGeometry args={[0.003, 0.003, v.length(), 5]} />
            <meshPhysicalMaterial color="#d9c49a" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Windlass (kerekan) beside the track near the ridge. */
export const Windlass: React.FC<{ u: number; k: number; f: number }> = ({ u, k, f }) => {
  if (k <= 0.001) return null;
  const c = routeC();
  const p = c.getPointAt(u), d = c.getTangentAt(u);
  const n = new THREE.Vector3(-d.z, 0, d.x).normalize();
  const pos = p.clone().addScaledVector(n, 0.2);
  const yaw = Math.atan2(-d.z, d.x);
  return (
    <group position={pos} rotation={[0, yaw, 0]} scale={smooth(k)}>
      {[-0.05, 0.05].map((z) => (
        <mesh key={z} position={[0, 0.05, z]} castShadow>
          <RoundedBoxGeo args={[0.02, 0.1, 0.02]} radius={0.004} />
          <meshPhysicalMaterial {...POLISH.stone} color="#6b4a2e" />
        </mesh>
      ))}
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, f * 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.09, 14]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#8a6440" />
      </mesh>
      {[0, 1, 2].map((j) => (
        <mesh key={j} position={[0, 0.09, 0]} rotation={[0, 0, f * 0.03 + (j * Math.PI) / 3]} castShadow>
          <boxGeometry args={[0.13, 0.008, 0.008]} />
          <meshPhysicalMaterial {...POLISH.stone} color="#5a3d26" />
        </mesh>
      ))}
    </group>
  );
};

/** Grease sheen: a short bright band that runs along the track. */
export const Sheen: React.FC<{ s: number; k: number }> = ({ s, k }) => {
  const { tube, total } = useMemo(() => {
    const tube = new THREE.TubeGeometry(routeCurve(ROUTE, 0.02), 220, 0.02, 8, false);
    return { tube, total: tube.index!.count };
  }, []);
  if (k <= 0.001) return null;
  const a = Math.max(0, s - 0.12), b = Math.min(1, s);
  const start = Math.floor((total * a) / 6) * 6, end = Math.floor((total * b) / 6) * 6;
  tube.setDrawRange(start, Math.max(0, end - start));
  return (
    <mesh geometry={tube} renderOrder={6}>
      <meshStandardMaterial color="#fff1b8" emissive="#ffe08a" emissiveIntensity={3 * k} toneMapped={false} transparent opacity={0.85 * k} />
    </mesh>
  );
};
