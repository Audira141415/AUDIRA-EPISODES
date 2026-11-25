// EP01 film parts: the cover's paper pieces (sheet, folds, origami, slide card, binder clip) plus
// Fraunces-printed labels and a cut-paper cursor. Labels are canvas textures drawn once the font has
// loaded (the cover used Arial Black; the film prints in Fraunces like the headline).

import React, { useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { loadFont } from "@remotion/google-fonts/Fraunces";
import { Cut, Hinge, Print, type V3 } from "../../kits/paperworld/components/Paper.tsx";
import { S } from "../../kits/paperworld/geometry/shapes.ts";
import { PALETTE } from "../../kits/paperworld/tokens.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { clamp } from "../../kits/paperworld/motion/easing.ts";

const F = loadFont("normal", { weights: ["600", "700", "900"], subsets: ["latin"] });
export const SERIF = F.fontFamily;
export const fontsReady = () => F.waitUntilDone();

export const col = (c: string) => (c in PALETTE ? PALETTE[c as keyof typeof PALETTE] : c);

// ── Printed text (canvas texture) ────────────────────────────────────────────

const PPU = 110; // canvas pixels per world unit
type TxtOpts = { w: number; h: number; size: number; color: string; bg?: string; weight?: number; align?: "left" | "center" | "right"; lineH?: number };

const draw = (c: HTMLCanvasElement, text: string, o: TxtOpts) => {
  const W = Math.min(2048, Math.round(o.w * PPU)), H = Math.min(2048, Math.round(o.h * PPU));
  if (c.width !== W) c.width = W;
  if (c.height !== H) c.height = H;
  const sc = W / (o.w * PPU);
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, W, H);
  if (o.bg) {
    g.fillStyle = col(o.bg);
    g.fillRect(0, 0, W, H);
  }
  const px = o.size * PPU * sc;
  g.font = `${o.weight ?? 700} ${px}px ${SERIF}, Georgia, serif`;
  g.fillStyle = col(o.color);
  g.textBaseline = "middle";
  g.textAlign = o.align ?? "center";
  // word wrap to the label width
  const maxW = W * 0.96;
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? line + " " + word : word;
      if (g.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
  }
  const lh = px * (o.lineH ?? 1.18);
  const x = o.align === "left" ? W * 0.02 : o.align === "right" ? W * 0.98 : W / 2;
  const top = o.align === "left" && o.lineH ? lh / 2 + px * 0.1 : H / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => g.fillText(l, x, top + i * lh + px * 0.04));
};

const texCache = new Map<string, CanvasTexture>();
export const txtTex = (text: string, o: TxtOpts) => {
  const k = `${text}|${JSON.stringify(o)}`;
  let t = texCache.get(k);
  if (!t) {
    const c = document.createElement("canvas");
    draw(c, text, o);
    t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(k, t);
  }
  return t;
};

/** Printed text on a plane (face +z). Transparent unless `bg` is set. */
export const Txt: React.FC<TxtOpts & { text: string; position?: V3; rotation?: V3; scale?: number }> = ({ text, position, rotation, scale, ...o }) => {
  const map = useMemo(() => txtTex(text, o), [text, o.w, o.h, o.size, o.color, o.bg, o.weight, o.align, o.lineH]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <mesh position={position} rotation={rotation} scale={scale} receiveShadow renderOrder={2}>
      <planeGeometry args={[o.w, o.h]} />
      <meshStandardMaterial map={map} roughness={0.92} metalness={0} transparent={!o.bg} depthWrite={!!o.bg} />
    </mesh>
  );
};

/** Live typewriter text: one canvas, redrawn when the string changes. */
export const TypeTxt: React.FC<TxtOpts & { text: string; position?: V3 }> = ({ text, position, ...o }) => {
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 8;
    return { canvas, tex };
  }, []);
  useMemo(() => {
    draw(canvas, text, o);
    tex.needsUpdate = true;
  }, [text, canvas, tex]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <mesh position={position} renderOrder={2}>
      <planeGeometry args={[o.w, o.h]} />
      <meshStandardMaterial map={tex} roughness={0.92} metalness={0} transparent depthWrite={false} />
    </mesh>
  );
};

/** A printed tag: a cardstock slip with a text label. */
export const Tag: React.FC<{ text: string; w: number; h: number; size: number; bg: string; fg: string; position?: V3; rotation?: V3; depth?: number }> = ({
  text, w, h, size, bg, fg, position, rotation, depth = 0.05,
}) => (
  <group position={position} rotation={rotation}>
    <Cut shape={S.rectC(w, h, Math.min(w, h) * 0.18)} color={bg} depth={depth} />
    <Txt text={text} w={w * 0.94} h={h * 0.9} size={size} color={fg} weight={900} position={[0, 0, depth + 0.012]} />
  </group>
);

// ── Document sheet (local XY, face +z) ───────────────────────────────────────

export const SW = 5, SH = 7;
const lineW = [3.6, 3.9, 3.2, 3.8, 3.5, 2.6, 3.9, 3.4, 3.7, 2.2];

export const PrintedLines: React.FC<{ w: number; h: number; z: number; ink?: string; head?: string }> = ({ w, h, z, ink = "ivoryShade", head = "brownLight" }) => (
  <group position={[0, 0, z]}>
    <Print shape={S.rectC(w * 0.55, 0.32, 0.08)} color={head} position={[-w * 0.18, h * 0.36, 0]} />
    {lineW.map((lw, i) => (
      <Print key={i} shape={S.rectC(lw * (w / SW), 0.13, 0.05)} color={ink} position={[-(w * 0.78 - lw * (w / SW)) / 2, h * 0.22 - i * (h * 0.075), 0]} />
    ))}
  </group>
);

export const Sheet: React.FC<{ color?: string; printed?: boolean; position?: V3; rotation?: V3; scale?: number; pdf?: boolean }> = ({ color = "ivoryLight", printed = true, position, rotation, scale, pdf }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <Cut shape={S.rectC(SW, SH, 0.06)} color={color} depth={0.035} />
    {printed && <PrintedLines w={SW} h={SH} z={0.04} />}
    {pdf && <Tag text="PDF" w={1.9} h={0.85} size={0.62} bg="coral" fg="ivoryLight" position={[1.1, -2.6, 0.06]} rotation={[0, 0, 0.06]} />}
  </group>
);

/** A sheet folded in half along its vertical centre line (book fold). */
export const HalfFold: React.FC<{ angle: number; color?: string; position?: V3; rotation?: V3; scale?: number }> = ({ angle, color = "ivoryLight", position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <Cut shape={S.rectC(SW / 2, SH, 0.04)} color={color} depth={0.035} position={[-SW / 4, 0, 0]} />
    <group position={[-SW / 4, 0, 0.04]}>
      <PrintedLines w={SW / 2} h={SH} z={0} />
    </group>
    <Hinge at={[0, 0, 0]} axis="y" angle={angle}>
      <Cut shape={S.rectC(SW / 2, SH, 0.04)} color={color} depth={0.035} position={[SW / 4, 0, 0]} />
      <group position={[SW / 4, 0, 0.04]}>
        <PrintedLines w={SW / 2} h={SH} z={0} />
      </group>
    </Hinge>
  </group>
);

const r = 3.0;
const TRI_L = S.poly("ep01-tri-l", [[0, -r], [0, r], [-r, 0]]);
const TRI_R = S.poly("ep01-tri-r", [[0, -r], [r, 0], [0, r]]);
export const Origami: React.FC<{ angle: number; a: string; b: string; position?: V3; rotation?: V3; scale?: number }> = ({ angle, a, b, position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <Cut shape={TRI_L} color={a} depth={0.035} />
    <Hinge at={[0, 0, 0]} axis="y" angle={angle}>
      <Cut shape={TRI_R} color={b} depth={0.035} />
    </Hinge>
  </group>
);

// ── Slide cards (16:9, local XY, base on y=0, face +z) ───────────────────────

export const CW = 5.6, CH = 3.15;
export type Kind = "title" | "chart" | "points" | "plain";

export const SlideCard: React.FC<{ kind: Kind; color: string; accent: string; position?: V3; rotation?: V3; scale?: number | V3; brand?: boolean }> = ({
  kind, color, accent, position, rotation, scale, brand = true,
}) => {
  const zf = 0.08;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Cut shape={S.rect(CW + 0.16, CH + 0.16, 0.14)} color="brownLight" depth={0.12} position={[0, -0.08, -0.08]} />
      <Cut shape={S.rect(CW, CH, 0.12)} color={color} depth={0.08} />
      {kind === "title" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(3.6, 0.62, 0.1)} color="ivoryLight" depth={0.06} position={[-0.6, 2.05, 0.02]} />
          <Cut shape={S.rectC(2.4, 0.22, 0.06)} color={accent} depth={0.04} position={[-1.2, 1.45, 0.02]} />
          <Cut shape={S.rectC(1.7, 0.22, 0.06)} color={accent} depth={0.04} position={[-1.55, 1.1, 0.02]} />
          <Cut shape={S.circle(0.62)} color="goldLight" depth={0.1} position={[1.9, 0.85, 0.04]} />
          <Cut shape={S.star(0.42)} color="goldDeep" depth={0.06} position={[1.9, 0.85, 0.12]} />
          {brand && <Txt text="AUDIRA" w={1.5} h={0.42} size={0.3} color="ivoryLight" bg="ink" weight={900} position={[-1.55, 0.5, 0.07]} />}
        </group>
      )}
      {kind === "chart" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(2.6, 0.24, 0.08)} color="ivoryLight" depth={0.04} position={[-1.2, 2.75, 0.02]} />
          <Cut shape={S.rectC(4.6, 0.06, 0.02)} color="ivoryLight" depth={0.04} position={[0, 0.4, 0.02]} />
          {[0.9, 1.4, 1.15, 1.9, 2.15].map((h, i) => (
            <Cut key={i} shape={S.rect(0.62, h, 0.06)} color={["gold", "coralLight", "mintLight", "gold", "coral"][i]} depth={0.32} position={[-1.8 + i * 0.9, 0.43, 0.18]} />
          ))}
        </group>
      )}
      {kind === "points" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(2.8, 0.3, 0.08)} color="ivoryLight" depth={0.05} position={[-1.1, 2.65, 0.02]} />
          {[0, 1, 2].map((i) => (
            <group key={i} position={[0, 1.95 - i * 0.62, 0.02]}>
              <Cut shape={S.circle(0.17)} color={accent} depth={0.12} position={[-2.15, 0, 0.04]} />
              <Cut shape={S.rectC(3.4 - i * 0.6, 0.2, 0.06)} color="ivoryLight" depth={0.04} position={[-1.75 + (3.4 - i * 0.6) / 2, 0, 0]} />
            </group>
          ))}
        </group>
      )}
      {kind === "plain" && (
        <group position={[0, 0, zf]}>
          <Cut shape={S.rectC(3.2, 0.34, 0.1)} color="ivoryLight" depth={0.05} position={[-0.9, 2.6, 0.02]} />
          <Cut shape={S.circle(0.8)} color={accent} depth={0.1} position={[1.4, 1.3, 0.03]} />
          <Cut shape={S.rectC(2.2, 0.2, 0.06)} color="ivoryLight" depth={0.04} position={[-1.3, 1.6, 0.02]} />
          <Cut shape={S.rectC(1.6, 0.2, 0.06)} color="ivoryLight" depth={0.04} position={[-1.6, 1.2, 0.02]} />
        </group>
      )}
    </group>
  );
};

// ── Small props ──────────────────────────────────────────────────────────────

const clipMat = { ...POLISH.toyPlastic, color: "#2c2622" } as const;
export const BinderClip: React.FC<{ position?: V3; rotation?: V3 }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow receiveShadow>
      <RoundedBoxGeo args={[1.5, 0.75, 0.55]} radius={0.12} />
      <meshPhysicalMaterial {...clipMat} />
    </mesh>
    {[-0.45, 0.45].map((x) => (
      <mesh key={x} castShadow position={[x, 0.55, -0.35]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
        <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
      </mesh>
    ))}
    <mesh castShadow position={[0, 0.98, -0.58]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.045, 0.045, 0.95, 8]} />
      <meshPhysicalMaterial color="#bfb6aa" roughness={0.35} metalness={0.8} />
    </mesh>
  </group>
);

export const Pencil: React.FC<{ position?: V3; rotation?: V3; color?: string }> = ({ position, rotation, color = "gold" }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <cylinderGeometry args={[0.35, 0.35, 7, 6]} />
      <meshPhysicalMaterial {...POLISH.paper} color={col(color)} />
    </mesh>
    <mesh castShadow position={[0, 4.0, 0]}>
      <coneGeometry args={[0.35, 1.0, 6]} />
      <meshPhysicalMaterial {...POLISH.paper} color="#e8c9a2" />
    </mesh>
    <mesh castShadow position={[0, 4.42, 0]}>
      <coneGeometry args={[0.09, 0.22, 6]} />
      <meshPhysicalMaterial color="#3b2a22" roughness={0.6} />
    </mesh>
  </group>
);

/** Sticky note lying on the desk (flat), slightly curled corner via a hinge. */
export const Sticky: React.FC<{ color: string; position?: V3; yaw?: number; s?: number }> = ({ color, position, yaw = 0, s = 2.6 }) => (
  <group position={position} rotation={[-Math.PI / 2, 0, yaw]}>
    <Cut shape={S.rectC(s, s * 0.8, 0.05)} color={color} depth={0.03} position={[0, s * 0.1, 0]} />
    <Hinge at={[0, -s * 0.3, 0]} axis="x" angle={-0.35}>
      <Cut shape={S.rectC(s, s * 0.2, 0.05)} color={color} depth={0.03} position={[0, -s * 0.4, 0]} />
    </Hinge>
    <Print shape={S.rectC(s * 0.6, 0.12, 0.04)} color="ink" position={[-s * 0.1, s * 0.25, 0.04]} opts={{}} />
    <Print shape={S.rectC(s * 0.45, 0.12, 0.04)} color="ink" position={[-s * 0.18, 0.0, 0.04]} />
  </group>
);

// ── Cut-paper cursor (tip at the origin, pointing up-left), lying in the XY plane ───────────────

const ARROW: [number, number][] = [[0, 0], [0, -1.6], [0.42, -1.2], [0.74, -1.88], [1.0, -1.76], [0.69, -1.1], [1.22, -1.1]];
const CURSOR = S.poly("ep01-cursor", ARROW);
const CURSOR_BACK = S.poly("ep01-cursor-back", ARROW.map(([x, y]) => [x * 1.22 - 0.12, y * 1.22 + 0.16] as [number, number]));
export const Cursor: React.FC<{ position: V3; press: number; scale?: number }> = ({ position, press, scale = 1 }) => (
  <group position={position} scale={scale * (1 - 0.12 * press)}>
    <Cut shape={CURSOR_BACK} color="ivoryLight" depth={0.06} position={[0, 0, -0.06]} />
    <Cut shape={CURSOR} color="ink" depth={0.1} />
  </group>
);

/** Click ripple: a gold ring that springs out and shrinks away. */
export const Ripple: React.FC<{ t: number; position: V3 }> = ({ t, position }) => {
  if (t < 0 || t > 0.55) return null;
  const k = clamp(t / 0.55);
  const s = 0.4 + k * 1.3;
  const s2 = s * (1 - k * 0.35);
  return <Cut shape={S.ring(0.8, 1)} color="gold" depth={0.05} position={position} scale={[s, s2 > 0 ? s : s, 1]} cast={false} />;
};
