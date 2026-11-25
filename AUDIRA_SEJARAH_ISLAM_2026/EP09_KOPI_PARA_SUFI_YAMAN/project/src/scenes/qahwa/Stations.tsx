// EP09 Qahwa: the rest of the tabletop world. One walnut table, five stations around the hero cup:
//   M  parchment map of the Red Sea (context + the spread route)
//   Z  zawiyah diorama: faceless robed figures seen from behind, red clay jar, small bowls (main)
//   C  council table: decree, stamp, books, mortar, drum, mancala, burning sack, the Cairo decree
//   W  word tiles: QAHWA, KAHVE, KOFFIE, KOPI (payoff)
//   J  Java: Indian Ocean map, ship, seedling pots, export crate stamped AUDIRA (payoff)
// Every timed event is a word time from timeline.json (time.ts W), never an absolute second.
// No prophets, angels or faces; the decree carries abstract strokes, not real text.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { dropLand, mulberry32 } from "../../kits/foodforge/core/motion";
import { makeSteamTexture, makeBokehTexture } from "../../kits/foodforge/lib/materials";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { BEAN_GEO, ClayJar, Finjan, OilLamp, QP, Steam, decreeTexture, fx, lathe } from "./QahwaSet.tsx";
import { W, ramp, clamp01 } from "./time.ts";

type V3 = [number, number, number];
export const ST: Record<"A" | "M" | "Z" | "C" | "W" | "J", V3> = {
  A: [0, 0, 0],
  M: [-2.3, 0, -0.4],
  Z: [-2.3, 0, -2.75],
  C: [-2.3, 0, 1.95],
  W: [-0.55, 0, 2.35],
  J: [1.3, 0, 1.25],
};

/** Height offset for a prop that falls in slow motion and lands at `land` (hidden before `land - fall - 0.4`). */
const drop = (t: number, land: number, h = 0.6, fall = 0.9) => {
  const d = dropLand(t, land, fall);
  return { y: (1 - d.fallP) * h + d.bounce * 0.5, squash: d.squash, vis: t > land - fall - 0.35, landed: d.landed };
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const SERIF = "Georgia, 'Times New Roman', serif";

/** Parchment ground with foxing. */
const parchment = (g: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  g.fillStyle = QP.parchment;
  g.fillRect(0, 0, w, h);
  const rnd = mulberry32(seed);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 120;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(140,96,48,${0.04 + rnd() * 0.08})`);
    gr.addColorStop(1, "rgba(140,96,48,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  }
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const k = (rnd() - 0.5) * 30;
    img.data[i] += k;
    img.data[i + 1] += k;
    img.data[i + 2] += k * 0.8;
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = "rgba(90,52,24,0.55)";
  g.lineWidth = 6;
  g.strokeRect(18, 18, w - 36, h - 36);
};

/** Paper fibre + mottling pass (keeps large parchment areas from reading as flat planes). */
const grainPass = (g: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
  const rnd = mulberry32(seed);
  for (let i = 0; i < (w * h) / 45; i++) {
    const x = rnd() * w, y = rnd() * h, len = 3 + rnd() * 9, a = rnd() * Math.PI;
    g.strokeStyle = rnd() > 0.5 ? `rgba(70,40,16,${0.08 + rnd() * 0.12})` : `rgba(255,246,222,${0.08 + rnd() * 0.12})`;
    g.lineWidth = 1 + rnd() * 1.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
};

// ---------- spot light with its own target (station key + shadows) ----------
const StationSpot: React.FC<{ pos: V3; target: V3; intensity: number; angle?: number; color?: string; shadow?: boolean }> = ({
  pos, target, intensity, angle = 0.5, color = "#FFD9A8", shadow = true,
}) => {
  const light = useMemo(() => new THREE.SpotLight(), []);
  useLayoutEffect(() => {
    light.position.set(...pos);
    light.target.position.set(...target);
    light.target.updateMatrixWorld();
    light.angle = angle;
    light.penumbra = 0.85;
    light.decay = 1.3;
    light.color.set(color);
    light.castShadow = shadow;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.bias = -0.0005;
    light.shadow.radius = 4;
  }, [light, pos, target, angle, color, shadow]);
  light.intensity = intensity;
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

// =====================================================================================
// M: Red Sea map. lon 28..52, lat 6..43 on a 1.05 x 1.6 sheet (north = -z, away from the lens)
// =====================================================================================
const MW = 1.05, MH = 1.6;
const mx = (lon: number) => (lon - 40) * (MW / 24);
const mz = (lat: number) => -(lat - 24.5) * (MH / 37);
const TEX_W = 1024, TEX_H = 1560;
const px = (lon: number) => ((mx(lon) + MW / 2) / MW) * TEX_W;
const pz = (lat: number) => ((mz(lat) + MH / 2) / MH) * TEX_H;

export const PLACES: Record<string, [number, number]> = {
  etiopia: [38.7, 9.0],
  aden: [45.0, 12.8],
  mokha: [43.25, 13.3],
  makkah: [39.8, 21.4],
  kairo: [31.2, 30.0],
  istanbul: [29.0, 41.0],
};

const SEAS: [number, number][][] = [
  // Red Sea
  [[32.5, 29.9], [33.6, 28.0], [34.6, 27.9], [35.0, 26.5], [36.5, 25.0], [38.5, 22.0], [39.2, 21.0], [41.0, 18.0], [42.6, 15.5], [43.4, 12.7], [43.2, 12.4], [42.5, 13.5], [41.5, 14.5], [40.0, 16.0], [38.5, 18.0], [37.2, 20.5], [36.5, 22.5], [35.6, 24.0], [34.0, 26.5], [32.6, 29.6]],
  // Gulf of Aden + Arabian Sea
  [[43.4, 12.7], [45.0, 12.9], [48.0, 14.0], [52.5, 15.6], [52.5, 5], [49, 5], [48, 8], [46.5, 10.4], [44.5, 10.4], [43.2, 11.6]],
  // Mediterranean
  [[27.5, 31.0], [30, 31.4], [32.3, 31.3], [34.2, 31.3], [35.0, 32.8], [35.6, 34.5], [36.0, 35.8], [36.2, 36.6], [34.5, 36.8], [32.5, 36.1], [30.5, 36.4], [29.0, 36.6], [27.5, 36.8]],
  // Aegean edge + Marmara
  [[27.5, 36.8], [28.2, 37.5], [27.9, 39.0], [26.8, 40.3], [27.5, 40.6], [29.0, 40.9], [29.4, 40.7], [28.4, 40.3], [27.5, 40.0]],
  // Black Sea
  [[28.3, 41.4], [29.1, 41.2], [31.5, 41.2], [34, 42.0], [36, 41.7], [38, 41.0], [40, 41.0], [41.5, 41.5], [41.8, 43.6], [27.5, 43.6]],
  // Persian Gulf
  [[48.0, 30.0], [49.5, 29.6], [50.3, 28.5], [51.5, 27.5], [52.5, 27.0], [52.5, 24.2], [51.0, 24.5], [50.5, 25.5], [50.0, 26.6], [49.0, 27.5], [48.3, 28.8]],
];

const mapTexture = () =>
  canvasTex(TEX_W, TEX_H, (g) => {
    parchment(g, TEX_W, TEX_H, 2401);
    // seas: tea-stained teal wash with an inked coast
    for (const poly of SEAS) {
      g.beginPath();
      poly.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), pz(la)) : g.moveTo(px(lo), pz(la))));
      g.closePath();
      g.fillStyle = "rgba(58,92,96,0.62)";
      g.fill();
      g.strokeStyle = "rgba(40,26,14,0.85)";
      g.lineWidth = 4;
      g.stroke();
    }
    // Nile
    g.strokeStyle = "rgba(58,92,96,0.8)";
    g.lineWidth = 6;
    g.beginPath();
    [[31.2, 30.6], [31.2, 29.0], [30.9, 27.5], [31.8, 26.2], [32.7, 25.6], [32.9, 24.1], [32.4, 22.0], [31.0, 21.0], [30.6, 19.5], [33.0, 17.0], [33.5, 15.6], [32.5, 14.0], [33.4, 11.5]].forEach(([lo, la], i) =>
      i ? g.lineTo(px(lo), pz(la)) : g.moveTo(px(lo), pz(la)),
    );
    g.stroke();
    // highlands of Ethiopia: hatched
    g.strokeStyle = "rgba(96,60,30,0.45)";
    g.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const lo = 36 + (i % 6) * 0.9, la = 7 + Math.floor(i / 6) * 1.6;
      g.beginPath();
      g.moveTo(px(lo) - 18, pz(la) + 8);
      g.lineTo(px(lo), pz(la) - 12);
      g.lineTo(px(lo) + 18, pz(la) + 8);
      g.stroke();
    }
    // labels
    const label = (txt: string, lo: number, la: number, size: number, opts: { italic?: boolean; rot?: number; color?: string; align?: CanvasTextAlign } = {}) => {
      g.save();
      g.translate(px(lo), pz(la));
      g.rotate(opts.rot ?? 0);
      g.font = `${opts.italic ? "italic " : ""}700 ${size}px ${SERIF}`;
      g.textAlign = opts.align ?? "center";
      g.textBaseline = "middle";
      g.lineWidth = 8;
      g.strokeStyle = "rgba(232,212,170,0.9)";
      g.strokeText(txt, 0, 0);
      g.fillStyle = opts.color ?? "#2A160A";
      g.fillText(txt, 0, 0);
      g.restore();
    };
    label("ETIOPIA", 34.8, 13.6, 62);
    label("YAMAN", 47.3, 16.8, 62);
    label("LAUT MERAH", 37.4, 19.8, 54, { italic: true, rot: -1.0, color: "#1E3C40" });
    label("ADEN", 45.4, 10.6, 54, { align: "left" });
    label("MOKHA", 42.0, 14.9, 52, { align: "right" });
    label("MAKKAH", 41.1, 21.4, 54, { align: "left" });
    label("KAIRO", 32.5, 29.0, 54, { align: "left" });
    label("ISTANBUL", 30.2, 39.7, 54, { align: "left" });
    // compass
    g.strokeStyle = "rgba(42,22,10,0.7)";
    g.lineWidth = 3;
    const cx = px(49.5), cz = pz(38.5);
    g.beginPath();
    g.arc(cx, cz, 46, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(cx, cz - 70);
    g.lineTo(cx + 12, cz);
    g.lineTo(cx, cz + 70);
    g.lineTo(cx - 12, cz);
    g.closePath();
    g.fillStyle = "rgba(42,22,10,0.75)";
    g.fill();
    g.font = `700 40px ${SERIF}`;
    g.fillStyle = "#2A160A";
    g.textAlign = "center";
    g.fillText("U", cx, cz - 92);
    grainPass(g, TEX_W, TEX_H, 2402);
  });

/** Dotted route between map points that draws itself from `a` to `b` seconds. */
const Route: React.FC<{ pts: [number, number][]; t: number; a: number; b: number; color?: string; y?: number; dot?: number }> = ({ pts, t, a, b, color = "#D9622B", y = 0.012, dot = 0.011 }) => {
  const dots = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => new THREE.Vector3(mx(lo), y, mz(la))), false, "centripetal");
    const n = Math.max(6, Math.round(curve.getLength() / 0.035));
    return curve.getSpacedPoints(n);
  }, [pts, y]);
  const p = clamp01((t - a) / (b - a));
  const shown = Math.floor(p * dots.length);
  return (
    <group>
      {dots.slice(0, shown).map((v, i) => (
        <mesh key={i} position={v} scale={[1, 0.45, 1]} castShadow>
          <sphereGeometry args={[dot, 12, 8]} />
          <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Brass map pin with a coffee bean head; pops up at `at`. */
const Pin: React.FC<{ place: [number, number]; t: number; at: number }> = ({ place, t, at }) => {
  const d = drop(t, at, 0.35, 0.6);
  if (!d.vis) return null;
  return (
    <group position={[mx(place[0]), 0.004 + d.y, mz(place[1])]} scale={[1 + d.squash * 0.4, 1 - d.squash, 1 + d.squash * 0.4]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.3} />
      </mesh>
      <mesh geometry={BEAN_GEO} position={[0, 0.07, 0]} rotation={[-0.4, 0.3, 0]} scale={0.85} castShadow>
        <meshPhysicalMaterial color={QP.bean} roughness={0.3} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

/** Wooden toy goat (the Kaldi legend), no rider, no shepherd. */
const ToyGoat: React.FC = () => {
  const wood = { roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.4, metalness: 0 };
  return (
    <group scale={0.8}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.05]} />
        <meshPhysicalMaterial color="#E8DCC6" {...wood} />
      </mesh>
      <mesh position={[0.07, 0.105, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.045, 0.03, 0.03]} />
        <meshPhysicalMaterial color="#E8DCC6" {...wood} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0.075, 0.13, k * 0.01]} rotation={[0, 0, 0.7]} castShadow>
          <coneGeometry args={[0.005, 0.04, 6]} />
          <meshPhysicalMaterial color="#5A3A20" {...wood} />
        </mesh>
      ))}
      {[[-0.045, -0.018], [-0.045, 0.018], [0.045, -0.018], [0.045, 0.018]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.025, z]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.05, 6]} />
          <meshPhysicalMaterial color="#5A3A20" {...wood} />
        </mesh>
      ))}
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[0.15, 0.004, 0.07]} />
        <meshPhysicalMaterial color="#6B4426" {...wood} />
      </mesh>
    </group>
  );
};

const CherryTwig: React.FC = () => (
  <group>
    <mesh rotation={[0, 0.4, Math.PI / 2]} position={[0, 0.008, 0]} castShadow>
      <cylinderGeometry args={[0.004, 0.006, 0.2, 6]} />
      <meshPhysicalMaterial color="#4A3020" roughness={0.8} />
    </mesh>
    {[-0.06, -0.03, 0.0, 0.03, 0.055].map((x, i) => (
      <mesh key={i} position={[x * 0.92, 0.017, -x * 0.39 + (i % 2 ? 0.012 : -0.01)]} castShadow>
        <sphereGeometry args={[0.016, 16, 12]} />
        <meshPhysicalMaterial color={QP.cherry} roughness={0.22} clearcoat={1} />
      </mesh>
    ))}
    {[-1, 1].map((k) => (
      <mesh key={k} position={[-0.09, 0.01, k * 0.02]} rotation={[-Math.PI / 2, 0, k * 0.7]} scale={[0.014, 0.032, 1]} castShadow>
        <circleGeometry args={[1, 20]} />
        <meshPhysicalMaterial color="#2F5A22" roughness={0.35} clearcoat={0.8} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

export const MapStation: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(mapTexture, []);
  const P = PLACES;
  const bean = drop(t, W("yaman") + 0.1, 0.5, 0.9);
  const twig = drop(t, W("tanamannya") + 0.5, 0.45, 0.8);
  const goat = drop(t, W("kaldi") + 0.15, 0.5, 0.8);
  // the goat "fades to legend": tips over gently when the narrator calls it a legend
  const tip = ramp(t, W("legenda"), W("legenda") + 0.8) * 0.9;
  return (
    <group position={ST.M}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[MW, MH]} />
        <meshPhysicalMaterial map={tex} {...POLISH.paper} />
      </mesh>
      {/* rolled top and bottom edges */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0, 0.024, (k * MH) / 2]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.026, 0.026, MW + 0.04, 24]} />
          <meshPhysicalMaterial color="#D2B888" {...POLISH.paper} />
        </mesh>
      ))}
      {/* the first known coffee drinkers: Yemen */}
      {bean.vis ? (
        <mesh geometry={BEAN_GEO} position={[mx(P.aden[0]) + 0.05, 0.02 + bean.y, mz(P.aden[1]) - 0.07]} rotation={[1.2, 0.5, 0]} scale={[1.9, 1.9 * (1 - bean.squash), 1.9]} castShadow>
          <meshPhysicalMaterial color={QP.bean} roughness={0.3} clearcoat={0.8} />
        </mesh>
      ) : null}
      {twig.vis ? (
        <group position={[mx(42.5), twig.y, mz(6.6)]} scale={1.3}>
          <CherryTwig />
        </group>
      ) : null}
      {goat.vis ? (
        <group position={[mx(35.0), goat.y, mz(7.6)]} rotation={[tip, 0.6, 0]}>
          <ToyGoat />
        </group>
      ) : null}
      {/* plant across the Red Sea: Ethiopia -> Yemen */}
      <Route pts={[P.etiopia, [41.0, 10.8], [43.2, 12.4], P.aden]} t={t} a={W("etiopia")} b={W("yaman", 2) + 0.2} color="#3E7A35" />
      {/* the spread: Aden -> Makkah -> Cairo -> Istanbul */}
      <Route pts={[P.aden, [42.5, 16.5], P.makkah]} t={t} a={W("menyebar") - 0.2} b={W("makkah", 2)} />
      <Route pts={[P.makkah, [36.0, 25.5], P.kairo]} t={t} a={W("makkah", 2)} b={W("kairo")} />
      <Route pts={[P.kairo, [31.5, 35.0], P.istanbul]} t={t} a={W("kairo")} b={W("istanbul") + 0.4} />
      <Pin place={P.makkah} t={t} at={W("makkah", 2) + 0.1} />
      <Pin place={P.kairo} t={t} at={W("kairo") + 0.1} />
      <Pin place={P.istanbul} t={t} at={W("istanbul") + 0.45} />
    </group>
  );
};

// =====================================================================================
// Z: zawiyah diorama. Faceless seated figures in robes, seen from behind; a red clay jar; bowls.
// =====================================================================================
const ROBES = ["#8A5A3A", "#5E6B3A", "#6E3B2A", "#7A4A2A", "#9A7448", "#4E5236", "#8E6A3E"];
const CAPS = ["#D9C7A2", "#CDB48A", "#C9A15A", "#D9C7A2", "#6B2A1E", "#CDB48A", "#B89A68"];
const RING_R = 0.4;
const SEATS = 7;
const seatAngle = (i: number) => Math.PI / 2 + (i / SEATS) * Math.PI * 2; // seat 0 nearest the lens (+z)

/** Vertical robe folds (bump map): soft irregular stripes around the lathe (u = around, v = up). */
let FOLDS: THREE.CanvasTexture | null = null;
const foldTexture = () => {
  if (FOLDS) return FOLDS;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(4242);
  const grad = g.createLinearGradient(0, 0, 256, 0);
  for (let k = 0; k <= 22; k++) {
    const v = 110 + Math.round((rnd() - 0.5) * 120);
    grad.addColorStop(k / 22, `rgb(${v},${v},${v})`);
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 64);
  FOLDS = new THREE.CanvasTexture(c);
  return FOLDS;
};

/** Seated figure, faceless: robe, shoulders, cap or turban, hands resting forward. */
const SeatedFigure: React.FC<{ robe: string; cap: string; sway: number; turban: boolean }> = ({ robe, cap, sway, turban }) => {
  const body = useMemo(() => lathe([[0, 0], [0.085, 0], [0.09, 0.02], [0.075, 0.06], [0.055, 0.11], [0.05, 0.135], [0.03, 0.15], [0, 0.152]], 32), []);
  const grain = useSurfaceGrain(31, 0.25, 3);
  const folds = useMemo(foldTexture, []);
  return (
    <group rotation={[sway, 0, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={robe} {...POLISH.fabric} roughnessMap={grain} bumpMap={folds} bumpScale={2.2} />
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 0.125, 0]} scale={[1.25, 0.5, 0.85]} castShadow>
        <sphereGeometry args={[0.05, 20, 14]} />
        <meshPhysicalMaterial color={robe} {...POLISH.fabric} />
      </mesh>
      {/* head (no face) */}
      <mesh position={[0, 0.178, 0.004]} castShadow>
        <sphereGeometry args={[0.028, 20, 16]} />
        <meshPhysicalMaterial color="#9A6A48" roughness={0.6} />
      </mesh>
      {turban ? (
        <mesh position={[0, 0.192, 0.004]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.022, 0.013, 10, 24]} />
          <meshPhysicalMaterial color={cap} {...POLISH.fabric} />
        </mesh>
      ) : null}
      <mesh position={[0, 0.197, 0.004]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.025, 18, 12]} />
        <meshPhysicalMaterial color={cap} {...POLISH.fabric} />
      </mesh>
      {/* forearms reaching to the centre */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.035, 0.075, -0.055]} rotation={[1.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.07, 10]} />
          <meshPhysicalMaterial color={robe} {...POLISH.fabric} />
        </mesh>
      ))}
    </group>
  );
};

const SmallBowl: React.FC<{ full?: boolean }> = ({ full = true }) => {
  const g = useMemo(() => lathe([[0, 0.002], [0.02, 0.002], [0.03, 0.012], [0.036, 0.028], [0.033, 0.028], [0.026, 0.014], [0, 0.008]], 32), []);
  return (
    <group>
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color="#B5502E" roughness={0.45} clearcoat={0.6} side={THREE.DoubleSide} />
      </mesh>
      {full ? (
        <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.029, 24]} />
          <meshPhysicalMaterial color={QP.coffee} roughness={0.08} clearcoat={1} />
        </mesh>
      ) : null}
    </group>
  );
};

const matTexture = () =>
  canvasTex(1024, 1024, (g) => {
    g.fillStyle = "#7A1F18";
    g.fillRect(0, 0, 1024, 1024);
    const rnd = mulberry32(3301);
    for (let i = 0; i < 1024; i += 4) {
      g.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.08})`;
      g.fillRect(0, i, 1024, 2);
    }
    g.lineWidth = 10;
    for (let r = 470; r > 120; r -= 90) {
      g.strokeStyle = r % 180 === 110 ? "#D9A441" : "#1F2E3A";
      g.beginPath();
      g.arc(512, 512, r, 0, Math.PI * 2);
      g.stroke();
    }
    // lozenge band
    g.fillStyle = "#E8C77A";
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const x = 512 + Math.cos(a) * 335, y = 512 + Math.sin(a) * 335;
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.beginPath();
      g.moveTo(0, -22);
      g.lineTo(14, 0);
      g.lineTo(0, 22);
      g.lineTo(-14, 0);
      g.closePath();
      g.fill();
      g.restore();
    }
  });

export const ZawiyahStation: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(matTexture, []);
  const wood = useSurfaceGrain(52, 0.3, 4);
  const tPour = W("dituang");
  const tShare = W("dibagikan");
  const tDhikr = W("berzikir");
  const pour = ramp(t, tPour - 0.2, tPour + 0.6) * (1 - ramp(t, tShare + 0.2, tShare + 0.9));
  const stream = clamp01((t - tPour - 0.4) / 0.3) * (1 - ramp(t, tShare, tShare + 0.4));
  const dhikr = ramp(t, tDhikr - 0.3, tDhikr + 0.8);
  // night: the lamp brightens from "malam"
  const night = ramp(t, W("malam") - 0.3, W("malam") + 1.2);
  return (
    <group position={ST.Z}>
      {/* round low platform + woven mat */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.8, 0.04, 64]} />
        <meshPhysicalMaterial color="#6B4426" roughness={0.6} clearcoat={0.3} roughnessMap={wood} />
      </mesh>
      <mesh position={[0, 0.0415, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.7, 64]} />
        <meshPhysicalMaterial map={mat} {...POLISH.fabric} />
      </mesh>
      <group position={[0, 0.042, 0]}>
        {/* the red clay jar (pours from "dituang") */}
        <group position={[0.02, 0, -0.04]} rotation={[0, 0, -0.42 * pour]}>
          <group position={[0.1 * pour, 0, 0]} scale={0.3}>
            <ClayJar position={[0, 0, 0]} rotation={[0, 0.6, 0]} />
          </group>
        </group>
        {stream > 0.01 ? (
          <mesh position={[0.2, 0.12, 0.05]} scale={[1, stream, 1]}>
            <cylinderGeometry args={[0.006, 0.008, 0.2, 10]} />
            <meshPhysicalMaterial color={QP.coffee} roughness={0.05} clearcoat={1} />
          </mesh>
        ) : null}
        {/* bowls: stacked by the jar, then passed to each seat */}
        {Array.from({ length: SEATS }, (_, i) => {
          const go = ramp(t, tShare + i * 0.18, tShare + i * 0.18 + 0.7);
          const a = seatAngle(i);
          const home: V3 = [0.2, 0.0, 0.05 + i * 0.002];
          const seat: V3 = [Math.cos(a) * (RING_R - 0.12), 0.0, Math.sin(a) * (RING_R - 0.12)];
          const lift = Math.sin(go * Math.PI) * 0.08;
          return (
            <group key={i} position={[home[0] + (seat[0] - home[0]) * go, home[1] + lift + (1 - go) * i * 0.012, home[2] + (seat[2] - home[2]) * go]}>
              <SmallBowl full={t > tPour + 0.5 || i > 0 ? t > tPour + 0.5 : false} />
            </group>
          );
        })}
        {/* seated faceless figures, backs to the lens for the nearest seats */}
        {Array.from({ length: SEATS }, (_, i) => {
          const a = seatAngle(i);
          const sway = dhikr * Math.sin(t * 3.0 + i * 0.9) * 0.09 + Math.sin(t * 0.8 + i) * 0.01;
          return (
            <group key={i} position={[Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R]} rotation={[0, -a - Math.PI / 2, 0]}>
              <SeatedFigure robe={ROBES[i]} cap={CAPS[i]} sway={sway} turban={i % 2 === 0} />
            </group>
          );
        })}
        <group position={[-0.1, 0.0, -0.32]} scale={0.45}>
          <OilLamp t={t} position={[0, 0, 0]} glow={1.2 + night * 1.6} />
        </group>
        <group position={[0.2, 0.08, 0.05]}>
          <Steam t={t} amount={0.4 + 0.6 * ramp(t, tPour, tPour + 1)} scale={0.45} />
        </group>
      </group>
    </group>
  );
};

// =====================================================================================
// C: council table (1511): decree, books, mortar, drum, mancala + coins, stamp, burning sack, Cairo decree
// =====================================================================================
const Book: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.2, 0.05, 0.14]} />
      <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={0.3} />
    </mesh>
    <mesh position={[0.004, 0.025, 0]}>
      <boxGeometry args={[0.196, 0.04, 0.142]} />
      <meshPhysicalMaterial color="#E9DCC0" {...POLISH.paper} />
    </mesh>
    <mesh position={[-0.1, 0.025, 0]}>
      <boxGeometry args={[0.012, 0.052, 0.142]} />
      <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.3} />
    </mesh>
  </group>
);

const Mortar: React.FC = () => {
  const g = useMemo(() => lathe([[0, 0.004], [0.06, 0.004], [0.07, 0.02], [0.075, 0.09], [0.068, 0.09], [0.06, 0.03], [0, 0.025]], 48), []);
  return (
    <group>
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.03, 0.1, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.16, 12]} />
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

const FrameDrum: React.FC = () => (
  <group rotation={[-0.25, 0, 0.1]}>
    <mesh position={[0, 0.03, 0]} castShadow>
      <cylinderGeometry args={[0.13, 0.13, 0.045, 48, 1, true]} />
      <meshPhysicalMaterial color="#8A5A30" roughness={0.5} clearcoat={0.4} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.053, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.128, 48]} />
      <meshPhysicalMaterial color="#E8D6B0" roughness={0.7} />
    </mesh>
    {[0, 1, 2, 3].map((k) => (
      <mesh key={k} position={[Math.cos(k * 1.57) * 0.13, 0.03, Math.sin(k * 1.57) * 0.13]} rotation={[Math.PI / 2, 0, k * 1.57]}>
        <torusGeometry args={[0.014, 0.003, 6, 16]} />
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Mancala: React.FC<{ coins: number }> = ({ coins }) => (
  <group>
    <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.34, 0.036, 0.12]} />
      <meshPhysicalMaterial color="#7A4A26" roughness={0.5} clearcoat={0.4} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[-0.135 + (i % 6) * 0.054, 0.037, i < 6 ? -0.028 : 0.028]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.019, 20]} />
        <meshPhysicalMaterial color="#3A2010" roughness={0.8} />
      </mesh>
    ))}
    {/* stake coins on top */}
    {Array.from({ length: 5 }, (_, i) => {
      const c = clamp01(coins * 5 - i);
      if (c <= 0) return null;
      return (
        <mesh key={i} position={[0.21, 0.004 + i * 0.006 + (1 - c) * 0.2, 0.0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.005, 24]} />
          <meshPhysicalMaterial color="#D8B04A" metalness={1} roughness={0.25} />
        </mesh>
      );
    })}
  </group>
);

const Stamp: React.FC = () => (
  <group>
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.055, 0.04, 32]} />
      <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.08, 0]} castShadow>
      <cylinderGeometry args={[0.018, 0.022, 0.09, 16]} />
      <meshPhysicalMaterial color="#5A3218" roughness={0.45} clearcoat={0.5} />
    </mesh>
    <mesh position={[0, 0.14, 0]} castShadow>
      <sphereGeometry args={[0.03, 20, 14]} />
      <meshPhysicalMaterial color="#5A3218" roughness={0.45} clearcoat={0.5} />
    </mesh>
  </group>
);

const Seal: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.008, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.06, 0.016, 28]} />
      <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.2} />
    </mesh>
    <mesh position={[0, 0.0165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.026, 0.036, 8]} />
      <meshPhysicalMaterial color="#000000" transparent opacity={0.25} roughness={0.5} />
    </mesh>
  </group>
);

/** Sack of beans on a brass brazier; flames only on the sack ("stok bijinya dibakar"). */
const BurningSack: React.FC<{ t: number; fire: number }> = ({ t, fire }) => {
  const sack = useMemo(() => lathe([[0, 0], [0.07, 0.0], [0.09, 0.04], [0.085, 0.09], [0.06, 0.12], [0.04, 0.13], [0.05, 0.15], [0, 0.152]], 32), []);
  const braz = useMemo(() => lathe([[0, 0.0], [0.05, 0.0], [0.04, 0.04], [0.12, 0.08], [0.13, 0.1], [0.12, 0.1], [0, 0.085]], 48), []);
  const flameTex = useMemo(() => makeSteamTexture(77), []);
  const glow = useMemo(() => makeBokehTexture(), []);
  const grain = useSurfaceGrain(12, 0.35, 5);
  const char = fire * 0.6;
  return (
    <group>
      <mesh geometry={braz} castShadow>
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 0.095, 0]}>
        <mesh geometry={sack} castShadow>
          <meshPhysicalMaterial color={new THREE.Color("#B89868").lerp(new THREE.Color("#3A2614"), char)} {...POLISH.fabric} roughnessMap={grain} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} geometry={BEAN_GEO} position={[Math.cos(i) * 0.03, 0.155, Math.sin(i) * 0.03]} rotation={[1.3, i, 0]}>
            <meshPhysicalMaterial color={QP.bean} roughness={0.3} clearcoat={0.7} />
          </mesh>
        ))}
        {fire > 0.01
          ? Array.from({ length: 7 }, (_, i) => {
              const u = (t * 1.6 + i / 7) % 1;
              return (
                <sprite ref={fx} key={i} position={[Math.sin(i * 2.1) * 0.05, 0.1 + u * 0.16, Math.cos(i * 1.7) * 0.04]} scale={[0.09 * (1 - u * 0.5), 0.14 * (1 - u * 0.3), 1]}>
                  <spriteMaterial map={flameTex} color={i % 2 ? "#FF8A2A" : "#FFC04A"} transparent opacity={fire * Math.sin(Math.PI * u) * 0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
                </sprite>
              );
            })
          : null}
        {fire > 0.01 ? (
          <sprite ref={fx} position={[0, 0.16, 0]} scale={[0.5, 0.5, 1]}>
            <spriteMaterial map={glow} color="#FF7A2A" transparent opacity={fire * 0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ) : null}
        <pointLight position={[0, 0.25, 0.05]} color="#FF8A3A" intensity={fire * 1.4} distance={1.2} decay={2} />
      </group>
    </group>
  );
};

export const CouncilStation: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(decreeTexture, []);
  const tex2 = useMemo(decreeTexture, []);
  const books = drop(t, W("ahli") + 0.1, 0.5, 0.8);
  const mortar = drop(t, W("dokter") + 0.1, 0.5, 0.8);
  const drum = drop(t, W("musik") + 0.1, 0.5, 0.8);
  const board = drop(t, W("permainan") + 0.1, 0.5, 0.8);
  const coins = ramp(t, W("taruhan"), W("taruhan") + 0.6);
  const tBan = W("dilarang");
  // stamp: descends, strikes on "dilarang", lifts away
  const down = ramp(t, tBan - 0.7, tBan);
  const up = ramp(t, tBan + 0.5, tBan + 1.3);
  const stampVis = t > tBan - 1.0 && t < tBan + 1.5;
  const stampY = (1 - down) * 0.45 + up * 0.5;
  const sealed = t > tBan;
  const fire = ramp(t, W("dibakar") - 0.3, W("dibakar") + 0.4) * (1 - ramp(t, W("tidak", 1) - 0.2, W("setuju") + 0.3));
  const cairo = drop(t, W("kairo", 2) + 0.2, 0.55, 0.9);
  // the ban is lifted: the red seal pops off and rolls aside
  const lift = ramp(t, W("dibatalkan") - 0.1, W("dibatalkan") + 0.9);
  return (
    <group position={ST.C}>
      {/* the 1511 decree, centre */}
      <group position={[0, 0.003, 0.02]} rotation={[0, 0.06, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.6, 0.42]} />
          <meshPhysicalMaterial map={tex} {...POLISH.paper} />
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[0, 0.02, k * 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.62, 24]} />
            <meshPhysicalMaterial color="#D6BD8E" {...POLISH.paper} />
          </mesh>
        ))}
        {sealed ? (
          <group position={[-0.12 - lift * 0.3, 0.002 + Math.sin(lift * Math.PI) * 0.12, 0.08 + lift * 0.14]} rotation={[lift * 2.6, 0, lift * 0.8]}>
            <Seal color={QP.wax} />
          </group>
        ) : null}
      </group>
      {/* the coffee itself on trial: a small finjan on the decree */}
      <group position={[0.15, 0.003, -0.08]} scale={0.6}>
        <Finjan />
      </group>
      {/* jurists (books) and doctors (mortar): objects only */}
      {books.vis ? (
        <group position={[-0.16, books.y, -0.42]} rotation={[0, 0.2, 0]}>
          <Book color="#5A2A1A" />
          <group position={[0.01, 0.05, 0]} rotation={[0, -0.12, 0]}>
            <Book color="#2F4A3A" />
          </group>
          <group position={[-0.005, 0.1, 0]} rotation={[0, 0.1, 0]}>
            <Book color="#6A4A22" />
          </group>
        </group>
      ) : null}
      {mortar.vis ? (
        <group position={[0.2, mortar.y, -0.4]}>
          <Mortar />
        </group>
      ) : null}
      {/* what the coffeehouses were accused of: music and games played for money */}
      {drum.vis ? (
        <group position={[-0.17, drum.y, 0.42]}>
          <FrameDrum />
        </group>
      ) : null}
      {board.vis ? (
        <group position={[0.12, board.y, 0.4]} rotation={[0, -0.25, 0]}>
          <Mancala coins={coins} />
        </group>
      ) : null}
      {/* the stamp: "kopi dilarang" */}
      {stampVis ? (
        <group position={[-0.12 + up * 0.25, 0.003 + stampY, 0.1 - up * 0.1]}>
          <Stamp />
        </group>
      ) : null}
      {/* stock burned */}
      <group position={[0.36, 0, -0.12]}>
        <BurningSack t={t} fire={fire} />
      </group>
      {/* the Cairo decree lands across the first one */}
      {cairo.vis ? (
        <group position={[0.02, 0.012 + cairo.y, -0.05]} rotation={[0, -0.32, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <planeGeometry args={[0.46, 0.3]} />
            <meshPhysicalMaterial map={tex2} {...POLISH.paper} color="#F2E4C4" />
          </mesh>
          <group position={[0.15, 0.0, 0.08]}>
            <Seal color="#2E5B3A" />
          </group>
        </group>
      ) : null}
    </group>
  );
};

// =====================================================================================
// W: word tiles (qahwa -> kahve -> koffie -> kopi)
// =====================================================================================
const WORD_TILES: { word: string; sub: string; key: string; nth: number }[] = [
  { word: "QAHWA", sub: "ARAB", key: "namanya", nth: 1 },
  { word: "KAHVE", sub: "TURKI", key: "kahve", nth: 1 },
  { word: "KOFFIE", sub: "BELANDA", key: "koffie", nth: 1 },
  { word: "KOPI", sub: "INDONESIA", key: "kopi", nth: 6 },
];

const tileTexture = (word: string, sub: string, i: number) =>
  canvasTex(640, 240, (g) => {
    const rnd = mulberry32(700 + i);
    g.fillStyle = i === 3 ? "#5A2E14" : "#C7A06A";
    g.fillRect(0, 0, 640, 240);
    for (let k = 0; k < 60; k++) {
      g.strokeStyle = `rgba(60,30,12,${0.06 + rnd() * 0.12})`;
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      const y = rnd() * 240;
      g.moveTo(0, y);
      g.bezierCurveTo(200, y + (rnd() - 0.5) * 20, 440, y + (rnd() - 0.5) * 20, 640, y);
      g.stroke();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 128px ${SERIF}`;
    g.fillStyle = i === 3 ? "#FFE9C4" : "#2A140A";
    g.fillText(word, 320, 100);
    g.font = `700 54px ${SERIF}`;
    g.fillStyle = i === 3 ? "#F0A04B" : "#6A3A18";
    g.fillText(sub, 320, 198);
  });

const WordTile: React.FC<{ i: number; t: number; land: number }> = ({ i, t, land }) => {
  const tex = useMemo(() => tileTexture(WORD_TILES[i].word, WORD_TILES[i].sub, i), [i]);
  const mats = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ color: i === 3 ? "#4A2410" : "#A87E4C", roughness: 0.5, clearcoat: 0.4 });
    const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.3 });
    return [side, side, side, side, face, side];
  }, [tex, i]);
  // low, short drop: a falling tile never hangs over the words already on the table
  const d = drop(t, land, 0.12, 0.5);
  if (!d.vis) return null;
  return (
    <group position={[0, d.y, 0]} scale={[1 + d.squash * 0.2, 1 - d.squash * 0.5, 1]}>
      <mesh position={[0, 0.028, 0]} material={mats} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.5, 0.19, 0.055]} />
      </mesh>
    </group>
  );
};

export const WordStation: React.FC<{ t: number }> = ({ t }) => (
  <group position={ST.W}>
    {WORD_TILES.map((w, i) => (
      <group key={i} position={[(i % 2 ? 0.035 : -0.035), 0, -0.52 + i * 0.36]} rotation={[0, (i % 2 ? -0.04 : 0.04), 0]}>
        <WordTile i={i} t={t} land={W(w.key, w.nth) + 0.25} />
      </group>
    ))}
    {/* a few beans scattered between the tiles */}
    {Array.from({ length: 10 }, (_, k) => {
      const r = mulberry32(880 + k);
      return (
        <mesh key={k} geometry={BEAN_GEO} position={[(r() - 0.5) * 0.7, 0.016, -0.6 + r() * 1.2]} rotation={[r() > 0.5 ? 0 : Math.PI, r() * 6, 0]} castShadow>
          <meshPhysicalMaterial color={QP.bean} roughness={0.32} clearcoat={0.7} />
        </mesh>
      );
    })}
  </group>
);

// =====================================================================================
// J: Java. Indian Ocean sheet (lon 68..112, lat -10..24), ship Malabar -> Batavia, seedlings, crate.
// =====================================================================================
const JW = 0.9, JH = 0.7;
const jx = (lon: number) => (lon - 90) * (JW / 44);
const jz = (lat: number) => -(lat - 7) * (JH / 34);
const JPX = 900, JPZ = 700;
const jpx = (lon: number) => ((jx(lon) + JW / 2) / JW) * JPX;
const jpz = (lat: number) => ((jz(lat) + JH / 2) / JH) * JPZ;
const MALABAR: [number, number] = [75.8, 11.2];
const BATAVIA: [number, number] = [106.8, -6.2];
const LANDS: [number, number][][] = [
  // India
  [[68, 23.5], [70, 21], [72.8, 19], [73.5, 16], [74.8, 12.8], [76.3, 9.5], [77.5, 8.1], [78.2, 9.0], [79.9, 10.3], [80.2, 13.5], [81.5, 16], [84, 18.5], [87, 21.5], [88.5, 22], [90, 22.5], [92, 22], [92, 24], [68, 24]],
  // Sri Lanka
  [[79.8, 9.8], [80.3, 9.6], [81.8, 7.5], [81.5, 6.2], [80.2, 6.0], [79.8, 8.0]],
  // Malay peninsula + Indochina
  [[92, 24], [92.3, 20.5], [94.5, 16], [97.6, 16.5], [98.5, 13], [98.3, 8.5], [100.3, 5.5], [101.5, 2.8], [103.5, 1.3], [104.2, 1.5], [103.5, 4.5], [102.2, 6.2], [100.5, 8.0], [99.8, 12], [100.5, 13.5], [102, 12.5], [105, 9], [106.8, 10.5], [109.3, 12], [108.8, 15.5], [106, 18.5], [107.5, 21.5], [112, 21.8], [112, 24]],
  // Sumatra
  [[95.3, 5.6], [97.5, 5.2], [100.3, 2.2], [103.8, -1.0], [106.0, -3.0], [105.8, -5.8], [104.5, -5.9], [101.5, -3.0], [98.8, 0.0], [95.4, 4.3]],
  // Java
  [[105.2, -6.8], [106.0, -5.9], [108.3, -6.3], [110.4, -6.9], [112, -6.9], [112, -8.2], [110.0, -8.1], [107.5, -7.6], [105.4, -6.9]],
  // Borneo edge
  [[109.0, 1.8], [109.6, -1.0], [110.2, -2.9], [112, -3.4], [112, 2.5], [111, 2.0]],
];

const javaMapTexture = () =>
  canvasTex(JPX, JPZ, (g) => {
    parchment(g, JPX, JPZ, 1699);
    g.fillStyle = "rgba(58,92,96,0.55)";
    g.fillRect(20, 20, JPX - 40, JPZ - 40);
    for (const poly of LANDS) {
      g.beginPath();
      poly.forEach(([lo, la], i) => (i ? g.lineTo(jpx(lo), jpz(la)) : g.moveTo(jpx(lo), jpz(la))));
      g.closePath();
      g.fillStyle = "#E2CDA3";
      g.fill();
      g.strokeStyle = "rgba(40,26,14,0.85)";
      g.lineWidth = 3.5;
      g.stroke();
    }
    const label = (txt: string, lo: number, la: number, size: number, align: CanvasTextAlign = "center") => {
      g.font = `700 ${size}px ${SERIF}`;
      g.textAlign = align;
      g.textBaseline = "middle";
      g.lineWidth = 7;
      g.strokeStyle = "rgba(232,212,170,0.9)";
      g.strokeText(txt, jpx(lo), jpz(la));
      g.fillStyle = "#2A160A";
      g.fillText(txt, jpx(lo), jpz(la));
    };
    label("MALABAR", 77.0, 14.2, 54, "left");
    label("JAWA", 108.6, -9.0, 54);
    label("BATAVIA", 104.4, -3.4, 54, "right");
    g.strokeStyle = "rgba(42,22,10,0.8)";
    g.setLineDash([16, 12]);
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(jpx(69), jpz(2));
    g.lineTo(jpx(76), jpz(-4.5));
    g.stroke();
    g.setLineDash([]);
    label("EROPA", 74.5, -6.6, 54);
    grainPass(g, JPX, JPZ, 1700);
  });

const SHIP_PATH: [number, number][] = [MALABAR, [76.0, 6.5], [82.0, 3.0], [92.0, 1.0], [99.0, -3.6], [103.6, -5.6], BATAVIA];
const EXPORT_PATH: [number, number][] = [BATAVIA, [100.0, -7.6], [90.0, -6.0], [80.0, -4.5], [70.0, 0.5]];

const pathPoint = (pts: [number, number][], u: number) => {
  const c = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => new THREE.Vector3(jx(lo), 0, jz(la))), false, "centripetal");
  const p = c.getPointAt(clamp01(u));
  const tg = c.getTangentAt(clamp01(u));
  return { p, yaw: Math.atan2(-tg.z, tg.x) };
};

const Ship: React.FC = () => (
  <group scale={0.75}>
    <mesh position={[0, 0.02, 0]} castShadow>
      <boxGeometry args={[0.16, 0.035, 0.05]} />
      <meshPhysicalMaterial color="#5A3218" roughness={0.5} clearcoat={0.4} />
    </mesh>
    <mesh position={[0.09, 0.025, 0]} rotation={[0, 0, -0.5]} castShadow>
      <boxGeometry args={[0.04, 0.025, 0.04]} />
      <meshPhysicalMaterial color="#5A3218" roughness={0.5} clearcoat={0.4} />
    </mesh>
    {[-0.035, 0.035].map((x, i) => (
      <group key={i} position={[x, 0.035, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.12, 6]} />
          <meshPhysicalMaterial color="#3A2010" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[0.07, 0.07]} />
          <meshPhysicalMaterial color="#EFE4CC" {...POLISH.fabric} side={THREE.DoubleSide} />
        </mesh>
      </group>
    ))}
  </group>
);

const Pot: React.FC<{ grow: number; droop: number; flood: number }> = ({ grow, droop, flood }) => {
  const g = useMemo(() => lathe([[0, 0], [0.05, 0], [0.065, 0.08], [0.07, 0.085], [0.064, 0.085], [0, 0.07]], 32), []);
  return (
    <group>
      {flood > 0.01 ? (
        <mesh position={[0, 0.002 + flood * 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.13 * flood + 0.02, 40]} />
          <meshPhysicalMaterial color="#3E6E7A" roughness={0.05} clearcoat={1} transparent opacity={0.75} />
        </mesh>
      ) : null}
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color={QP.clay} {...POLISH.clay} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.062, 24]} />
        <meshPhysicalMaterial color="#3A2414" roughness={0.95} />
      </mesh>
      <group position={[0, 0.075, 0]} rotation={[droop, 0, droop * 0.6]} scale={Math.max(0.001, grow)}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.004, 0.005, 0.14, 6]} />
          <meshPhysicalMaterial color="#4E6A2A" roughness={0.6} />
        </mesh>
        {[0.06, 0.1, 0.135].map((y, i) =>
          [-1, 1].map((k) => (
            <mesh key={`${i}${k}`} position={[k * 0.03, y, 0]} rotation={[0.2, 0, k * 0.5]} scale={[0.03, 0.012, 0.016]} castShadow>
              <sphereGeometry args={[1, 14, 8]} />
              <meshPhysicalMaterial color={droop > 0.3 ? "#7A6A2A" : "#2F6A26"} roughness={0.35} clearcoat={0.7} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
};

const crateTexture = () =>
  canvasTex(512, 320, (g) => {
    g.fillStyle = "#B88A55";
    g.fillRect(0, 0, 512, 320);
    const rnd = mulberry32(1711);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(60,30,10,${0.15 + rnd() * 0.1})`;
      g.fillRect(0, i * 80, 512, 4);
    }
    for (let k = 0; k < 50; k++) {
      g.strokeStyle = `rgba(80,40,14,${0.05 + rnd() * 0.12})`;
      g.lineWidth = 1 + rnd() * 2;
      const y = rnd() * 320;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(512, y + (rnd() - 0.5) * 8);
      g.stroke();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(34,16,6,0.88)";
    g.font = `900 96px ${SERIF}`;
    g.fillText("AUDIRA", 256, 120);
    g.font = `700 50px ${SERIF}`;
    g.fillText("KOPI JAWA · 1711", 256, 220);
  });

const Crate: React.FC = () => {
  const tex = useMemo(crateTexture, []);
  const mats = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ color: "#A87A48", roughness: 0.7 });
    const face = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.7 });
    return [side, side, side, side, face, side];
  }, [tex]);
  return (
    <mesh position={[0, 0.09, 0]} material={mats} castShadow receiveShadow>
      <boxGeometry args={[0.32, 0.18, 0.2]} />
    </mesh>
  );
};

export const JavaStation: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(javaMapTexture, []);
  const sail1 = ramp(t, W("dikirim") - 0.4, W("batavia") + 0.5);
  const s1 = pathPoint(SHIP_PATH, sail1);
  const exp = ramp(t, W("diekspor") - 0.3, W("eropa") + 0.8);
  const s2 = pathPoint(EXPORT_PATH, exp);
  const shipAt = t < W("1711") ? s1 : s2;
  const pot1 = drop(t, W("gagal") + 0.1, 0.45, 0.8);
  const flood = ramp(t, W("banjir") - 0.3, W("banjir") + 0.7);
  const droop = ramp(t, W("banjir"), W("banjir") + 1.2) * 1.1;
  const pot2 = drop(t, W("1699") + 0.1, 0.45, 0.8);
  const grow2 = ramp(t, W("tumbuh", 2) - 0.2, W("tumbuh", 2) + 1.0);
  const crate = drop(t, W("dan", 5) + 0.3, 0.14, 0.5);
  return (
    <group position={ST.J}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -0.12]} receiveShadow>
        <planeGeometry args={[JW, JH]} />
        <meshPhysicalMaterial map={tex} {...POLISH.paper} />
      </mesh>
      <group position={[0, 0.006, -0.12]}>
        <group position={[shipAt.p.x, 0, shipAt.p.z]} rotation={[0, shipAt.yaw, 0]}>
          {t > W("dikirim") - 0.6 ? <Ship /> : null}
        </group>
      </group>
      {/* seedling pots in front of the sheet: 1696 (drowned), 1699 (grows) */}
      {pot1.vis ? (
        <group position={[-0.14, pot1.y, 0.64]}>
          <Pot grow={1} droop={droop} flood={flood} />
        </group>
      ) : null}
      {pot2.vis ? (
        <group position={[0.12, pot2.y, 0.66]}>
          <Pot grow={0.05 + 0.95 * grow2} droop={0} flood={0} />
        </group>
      ) : null}
      {crate.vis ? (
        <group position={[0.05, crate.y, -1.25]} rotation={[0, -0.1, 0]}>
          <Crate />
        </group>
      ) : null}
      {Array.from({ length: 26 }, (_, k) => {
        const r = mulberry32(1711 + k);
        const a2 = r() * Math.PI * 2, rr = 0.2 + r() * 0.28;
        return (
          <mesh key={`cb${k}`} geometry={BEAN_GEO} position={[0.05 + Math.cos(a2) * rr * 1.2, 0.016, -1.25 + Math.sin(a2) * rr * 0.8]} rotation={[r() > 0.5 ? 0 : Math.PI, r() * 6, 0]} castShadow receiveShadow>
            <meshPhysicalMaterial color={k % 3 ? QP.bean : QP.beanDark} roughness={0.32} clearcoat={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

// =====================================================================================
// Outro: a glass of kopi tubruk lands beside the hero finjan
// =====================================================================================
export const TubrukGlass: React.FC<{ t: number }> = ({ t }) => {
  const d = drop(t, W("pagimu") + 0.1, 0.6, 1.0);
  const glass = useMemo(() => lathe([[0, 0.004], [0.06, 0.004], [0.062, 0.01], [0.075, 0.2], [0.07, 0.2], [0.057, 0.012], [0, 0.012]], 48), []);
  if (!d.vis) return null;
  return (
    <group position={[0.46, d.y, 0.22]}>
      <mesh geometry={glass} castShadow>
        <meshPhysicalMaterial color="#F4ECE0" roughness={0.05} clearcoat={1} transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.066, 0.059, 0.16, 32]} />
        <meshPhysicalMaterial color="#1E0C04" roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.166, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.066, 32]} />
        <meshPhysicalMaterial color="#3A1E0C" roughness={0.6} />
      </mesh>
    </group>
  );
};

// =====================================================================================
// Station key lights (each subject keeps the brightest values in its own beat)
// =====================================================================================
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const StationLights: React.FC<{ t: number }> = ({ t }) => {
  const night = ramp(t, W("malam") - 0.3, W("malam") + 1.2) * (1 - ramp(t, W("dari", 4) - 0.5, W("dari", 4) + 1));
  return (
    <>
      <StationSpot pos={add(ST.M, [0.6, 3.0, 1.4])} target={ST.M} intensity={20} angle={0.42} />
      <StationSpot pos={add(ST.Z, [0.8, 2.6, 1.6])} target={ST.Z} intensity={22 - night * 9} angle={0.42} />
      <StationSpot pos={add(ST.C, [0.7, 2.8, 1.3])} target={ST.C} intensity={22} angle={0.36} />
      <StationSpot pos={add(ST.W, [0.5, 2.6, 1.4])} target={add(ST.W, [0, 0, -0.1])} intensity={20} angle={0.38} />
      <StationSpot pos={add(ST.J, [0.6, 2.8, 1.4])} target={ST.J} intensity={20} angle={0.38} />
    </>
  );
};
