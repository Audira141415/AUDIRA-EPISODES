// EP02 Khawarizmi: in-world labels. Every on-screen word lives on a parchment tag inside the 3D scene
// (billboarded to the camera, pinned to its object by a gold thread), so text keeps depth and parallax.
// Words come only from the script or SOURCE_REGISTER.
import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette";
import { mulberry32 } from "../../kits/manuscript/core/motion";

type V3 = [number, number, number];
/** Labels live on the FX layer: AO / depth of field never touch them. */
const fxl = (o: THREE.Object3D) => o.layers.set(1);
export const CamQ = createContext<THREE.Quaternion>(new THREE.Quaternion());

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
export const toTex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

export type TagStyle = "parchment" | "gold" | "ink";
const cache = new Map<string, { tex: THREE.Texture; aspect: number }>();

/** Parchment tag texture: one main line (Georgia italic) and an optional small caps sub line. */
export const tagTexture = (text: string, sub = "", style: TagStyle = "parchment") => {
  const key = `${style}|${text}|${sub}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const H = sub ? 230 : 170;
  const probe = canvas(8, 8).getContext("2d")!;
  probe.font = "italic 700 92px Georgia, 'Times New Roman', serif";
  const w1 = probe.measureText(text).width;
  probe.font = "600 40px Georgia, serif";
  const w2 = sub ? probe.measureText(sub.toUpperCase()).width + sub.length * 6 : 0;
  const W = Math.ceil(Math.max(w1, w2) + 120);
  const c = canvas(W, H);
  const g = c.getContext("2d")!;
  const bg = style === "ink" ? "#1C120B" : style === "gold" ? "#F3DFA6" : "#EEDDB6";
  const fg = style === "ink" ? "#F3E4C4" : P.ironGallInk;
  roundRect(g, 6, 6, W - 12, H - 12, 22);
  g.fillStyle = bg;
  g.fill();
  // fibres (seeded: identical in every render worker)
  const rnd = mulberry32(text.length * 131 + W);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(110,75,40,${rnd() * 0.06})`;
    g.fillRect(rnd() * W, rnd() * H, 2, 2);
  }
  g.lineWidth = 6;
  g.strokeStyle = P.goldDeep;
  roundRect(g, 6, 6, W - 12, H - 12, 22);
  g.stroke();
  g.lineWidth = 2;
  g.strokeStyle = style === "ink" ? P.goldLeaf : P.rubricRed;
  roundRect(g, 18, 18, W - 36, H - 36, 14);
  g.stroke();
  g.fillStyle = fg;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.font = "italic 700 92px Georgia, 'Times New Roman', serif";
  g.fillText(text, W / 2, sub ? 112 : 118);
  if (sub) {
    g.font = "600 40px Georgia, serif";
    g.fillStyle = style === "ink" ? P.goldLeaf : P.rubricRed;
    (g as unknown as { letterSpacing: string }).letterSpacing = "6px";
    g.fillText(sub.toUpperCase(), W / 2, 182);
  }
  const out = { tex: toTex(c), aspect: W / H };
  cache.set(key, out);
  return out;
};

/**
 * A tag that faces the camera, pinned to `anchor` by a thin gold thread. `vis` 0..1 fades and lifts
 * it in; `h` is its height in world units.
 */
export const Tag3D: React.FC<{
  anchor: V3;
  lift?: number;
  text: string;
  sub?: string;
  vis: number;
  h?: number;
  style?: TagStyle;
  thread?: boolean;
  /** Yaw of a rotated parent group, so the tag still faces the camera. */
  parentYaw?: number;
}> = ({ anchor, lift = 0.18, text, sub = "", vis, h = 0.09, style = "parchment", thread = true, parentYaw = 0 }) => {
  const camQ = useContext(CamQ);
  const q = parentYaw ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -parentYaw).multiply(camQ) : camQ;
  const { tex, aspect } = useMemo(() => tagTexture(text, sub, style), [text, sub, style]);
  if (vis <= 0.005) return null;
  // phone-size legibility: every tag 1.35x its authored height
  h *= 1.35;
  const k = 0.9 + 0.1 * vis;
  const top: V3 = [anchor[0], anchor[1] + lift * (0.85 + 0.15 * vis), anchor[2]];
  return (
    <group>
      {thread ? (
        <mesh position={[anchor[0], (anchor[1] + top[1]) / 2, anchor[2]]} renderOrder={20} onUpdate={fxl}>
          <cylinderGeometry args={[0.0018, 0.0018, Math.max(0.001, top[1] - anchor[1]), 4]} />
          <meshBasicMaterial color={P.goldLeaf} transparent opacity={0.8 * vis} depthWrite={false} />
        </mesh>
      ) : null}
      <group position={top} quaternion={q} scale={[k, k, k]}>
        <mesh position={[0, h / 2, 0]} renderOrder={21} onUpdate={fxl}>
          <planeGeometry args={[h * aspect, h]} />
          <meshBasicMaterial map={tex} transparent opacity={vis} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * A plane whose texture is revealed left to right (ink writing, sand grooves). The plane's left edge
 * sits at x = 0 (the group origin); `k` 0..1 is the revealed fraction.
 */
export const RevealPlane: React.FC<{
  tex: THREE.Texture;
  w: number;
  h: number;
  k: number;
  opacity?: number;
  color?: string;
  emissive?: number;
  basic?: boolean;
  z?: number;
  renderOrder?: number;
}> = ({ tex, w, h, k, opacity = 1, color = "#ffffff", basic = false, z = 0, renderOrder = 2 }) => {
  const { geo, map } = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h);
    g.translate(w / 2, 0, 0);
    const m = tex.clone();
    m.needsUpdate = true;
    return { geo: g, map: m };
  }, [tex, w, h]);
  const kk = Math.max(0.0005, Math.min(1, k));
  map.repeat.set(kk, 1);
  if (k <= 0.001 || opacity <= 0.001) return null;
  return (
    <mesh geometry={geo} position={[0, 0, z]} scale={[kk, 1, 1]} renderOrder={renderOrder}>
      {basic ? (
        <meshBasicMaterial map={map} transparent opacity={opacity} color={color} depthWrite={false} toneMapped={false} />
      ) : (
        <meshStandardMaterial map={map} transparent opacity={opacity} color={color} roughness={0.9} depthWrite={false} />
      )}
    </mesh>
  );
};

/** Text written on a transparent canvas (ink or gold), for RevealPlane. */
export const inkText = (text: string, opts: { font?: string; color?: string; w?: number; h?: number; align?: "left" | "center" } = {}) => {
  const { font = "italic 700 72px Georgia, 'Times New Roman', serif", color = P.ironGallInk, w = 1024, h = 128, align = "left" } = opts;
  const key = `ink|${text}|${font}|${color}|${w}|${h}|${align}`;
  const hit = cache.get(key);
  if (hit) return hit.tex;
  const c = canvas(w, h);
  const g = c.getContext("2d")!;
  g.font = font;
  g.fillStyle = color;
  g.textBaseline = "middle";
  g.textAlign = align;
  g.fillText(text, align === "center" ? w / 2 : 12, h / 2 + 4);
  const tex = toTex(c);
  cache.set(key, { tex, aspect: w / h });
  return tex;
};
