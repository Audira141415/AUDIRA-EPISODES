// Jessica's picture book "Peri Kecil" and the little fairy that lives in its pages.
// Book frame: spine on local Y at x = 0; open, the pages face +Z. Closing swings the left board over
// the right one toward +Z, so the cover faces +Z when shut. Textures are painted once on canvases.
import React from "react";
import * as THREE from "three";
import { hash } from "./layout";

const W = 0.19, H = 0.25, TH = 0.012;

const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const blob = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, col: string, r: () => number) => {
  for (let k = 0; k < 4; k++) {
    g.fillStyle = col;
    g.globalAlpha = 0.18 + r() * 0.12;
    g.beginPath();
    g.ellipse(x + (r() - 0.5) * rx * 0.3, y + (r() - 0.5) * ry * 0.3, rx * (0.8 + r() * 0.3), ry * (0.8 + r() * 0.3), r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
};
const fairyDrawing = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number, r: () => number) => {
  blob(g, cx - 40 * s, cy - 20 * s, 46 * s, 30 * s, "#F2A7B8", r);
  blob(g, cx + 40 * s, cy - 20 * s, 46 * s, 30 * s, "#9FD3E6", r);
  blob(g, cx, cy + 10 * s, 18 * s, 40 * s, "#E8AB48", r);
  blob(g, cx, cy - 46 * s, 20 * s, 20 * s, "#F6D9C4", r);
  g.strokeStyle = "#3C3733";
  g.lineWidth = 2.2 * s;
  g.beginPath();
  g.arc(cx, cy - 46 * s, 18 * s, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(cx - 10 * s, cy - 26 * s);
  g.quadraticCurveTo(cx - 22 * s, cy + 40 * s, cx - 20 * s, cy + 52 * s);
  g.lineTo(cx + 20 * s, cy + 52 * s);
  g.quadraticCurveTo(cx + 22 * s, cy + 40 * s, cx + 10 * s, cy - 26 * s);
  g.stroke();
  // wand + star
  g.beginPath();
  g.moveTo(cx + 14 * s, cy - 10 * s);
  g.lineTo(cx + 48 * s, cy - 58 * s);
  g.stroke();
  g.fillStyle = "#F5C542";
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = (i % 2 ? 6 : 14) * s;
    g.lineTo(cx + 48 * s + Math.cos(a) * rr, cy - 64 * s + Math.sin(a) * rr);
  }
  g.fill();
};
const paperBase = (g: CanvasRenderingContext2D, w: number, h: number, col: string, r: () => number) => {
  g.fillStyle = col;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = `rgba(90,70,50,${r() * 0.05})`;
    g.fillRect(r() * w, r() * h, 1.5, 1.5);
  }
};
const scribbles = (g: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number) => {
  const cols = ["#D9534F", "#4E7B9C", "#6F9779", "#E8AB48", "#9B6FB0"];
  for (let i = 0; i < n; i++) {
    g.strokeStyle = cols[i % cols.length];
    g.globalAlpha = 0.75;
    g.lineWidth = 3 + r() * 3;
    g.lineCap = "round";
    g.beginPath();
    let x = r() * w, y = r() * h;
    g.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      x += (r() - 0.5) * 70;
      y += (r() - 0.5) * 50;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
};

const texCache: Record<string, THREE.Texture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  if (texCache[key]) return texCache[key];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return (texCache[key] = t);
};

const coverTex = (worn: boolean) =>
  canvasTex(worn ? "coverW" : "cover", 304, 400, (g) => {
    const r = prng(worn ? 77 : 11);
    paperBase(g, 304, 400, "#5F8FB4", r);
    blob(g, 150, 250, 150, 120, "#3E6D93", r);
    blob(g, 152, 240, 80, 80, "#F7E3B0", r);
    fairyDrawing(g, 152, 250, 1.1, r);
    g.fillStyle = "#FFF6E0";
    g.font = "italic 700 44px Georgia, serif";
    g.textAlign = "center";
    g.fillText("Peri Kecil", 152, 78);
    g.strokeStyle = "#E8C46A";
    g.lineWidth = 6;
    g.strokeRect(12, 12, 280, 376);
    if (worn) {
      scribbles(g, 304, 400, r, 7);
      // scuffed corners and a torn edge
      g.fillStyle = "rgba(250,246,239,0.85)";
      g.beginPath();
      g.moveTo(304, 0);
      g.lineTo(250, 0);
      g.lineTo(304, 46);
      g.fill();
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(250,246,239,${0.2 + r() * 0.4})`;
        g.fillRect(r() * 304, 380 + r() * 20, 6 + r() * 14, 3);
      }
    }
  });
const leftPageTex = (worn: boolean) =>
  canvasTex(worn ? "lpW" : "lp", 304, 400, (g) => {
    const r = prng(worn ? 91 : 23);
    paperBase(g, 304, 400, "#FBF5E8", r);
    blob(g, 152, 230, 140, 140, "#CFE3EC", r);
    blob(g, 90, 330, 120, 50, "#A9C9A0", r);
    fairyDrawing(g, 152, 220, 1.35, r);
    if (worn) scribbles(g, 304, 400, r, 5);
  });
const rightPageTex = (worn: boolean, page: number) =>
  canvasTex(`rp${worn ? "W" : ""}${page}`, 304, 400, (g) => {
    const r = prng(31 + page * 7 + (worn ? 100 : 0));
    paperBase(g, 304, 400, "#FBF5E8", r);
    g.fillStyle = "#6B5F55";
    for (let i = 0; i < 9; i++) {
      const y = 60 + i * 30;
      g.globalAlpha = 0.55;
      g.fillRect(28, y, 220 + r() * 30 - (i === 8 ? 120 : 0), 6);
    }
    g.globalAlpha = 1;
    blob(g, 200, 340, 50, 34, page % 2 ? "#F2A7B8" : "#E8AB48", r);
    if (worn) scribbles(g, 304, 400, r, 6);
  });

const boardGeo = new THREE.BoxGeometry(W, H, TH);
const pageGeo = new THREE.PlaneGeometry(W * 0.95, H * 0.94);

const mat = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, roughness: 1 });
const matCache = new Map<THREE.Texture, THREE.Material>();
const m = (t: THREE.Texture) => {
  let x = matCache.get(t);
  if (!x) matCache.set(t, (x = mat(t)));
  return x;
};
const edge = new THREE.MeshStandardMaterial({ color: "#F4EAD6", roughness: 1 });

/** The fairy: a small luminous watercolour figure. life 0..1 = presence/brightness. */
export const Fairy: React.FC<{ life: number; t: number; scale?: number; light?: boolean }> = ({ life, t, scale = 1, light = true }) => {
  if (life < 0.01) return null;
  const flap = Math.sin(t * 19) * 0.55 * Math.min(1, life * 1.5);
  const glow = new THREE.Color("#FFD27A").multiplyScalar(1.0 + 1.2 * life);
  return (
    <group scale={scale}>
      {/* halo */}
      <mesh>
        <circleGeometry args={[0.11, 24]} />
        <meshBasicMaterial color="#FFE3A6" transparent opacity={0.12 * life} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.022, 16, 12]} />
        <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={Math.min(1, life * 1.6)} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[0.014, 12, 10]} />
        <meshBasicMaterial color={new THREE.Color("#FFE9D6").multiplyScalar(1 + life)} toneMapped={false} transparent opacity={Math.min(1, life * 1.6)} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} rotation={[0, s * flap, 0]}>
          <mesh position={[s * 0.035, 0.018, -0.004]} rotation={[0, 0, s * 0.5]} scale={[0.034, 0.02, 1]}>
            <circleGeometry args={[1, 20]} />
            <meshBasicMaterial color={new THREE.Color(s > 0 ? "#BFE6F2" : "#F6C2D0").multiplyScalar(0.9 + life)} transparent opacity={0.65 * life} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[s * 0.028, -0.008, -0.004]} rotation={[0, 0, -s * 0.4]} scale={[0.022, 0.013, 1]}>
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial color={new THREE.Color(s > 0 ? "#F6C2D0" : "#BFE6F2").multiplyScalar(0.9 + life)} transparent opacity={0.6 * life} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* sparkle dust */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = t * (0.9 + hash(i) * 0.8) + i * 2.1;
        const rr = 0.05 + hash(i + 9) * 0.06;
        const y = ((t * 0.12 + hash(i + 3)) % 1) * 0.14 - 0.07;
        return (
          <mesh key={i} position={[Math.cos(a) * rr, y, Math.sin(a) * rr]}>
            <sphereGeometry args={[0.004 + hash(i + 5) * 0.003, 6, 5]} />
            <meshBasicMaterial color={new THREE.Color("#FFF0C0").multiplyScalar(1 + 2 * life)} toneMapped={false} transparent opacity={life * (0.5 + 0.5 * Math.sin(t * 6 + i))} />
          </mesh>
        );
      })}
      {light ? <pointLight color="#FFC873" intensity={life * 0.3} distance={1.6} decay={2} /> : null}
    </group>
  );
};

export const Book: React.FC<{
  open: number; // 0 closed .. 1 open flat
  flip?: number; // pages turned (fractional = page in motion)
  worn?: boolean;
  fairy?: number; // fairy life
  t: number;
  fairyLift?: number;
}> = ({ open, flip = 0, worn = false, fairy = 0, t, fairyLift = 1 }) => {
  const ang = (1 - open) * Math.PI * 0.985;
  const turning = flip - Math.floor(flip);
  const page = Math.floor(flip);
  const cover = coverTex(worn);
  return (
    <group>
      {/* right board + page stack */}
      <mesh geometry={boardGeo} material={m(cover)} position={[W / 2, 0, -TH / 2]} castShadow />
      <mesh position={[W / 2, 0, 0.004]} material={edge}>
        <boxGeometry args={[W * 0.96, H * 0.95, 0.008]} />
      </mesh>
      <mesh geometry={pageGeo} material={m(rightPageTex(worn, page + 1))} position={[W / 2, 0, 0.0085]} />
      {/* left board (cover art on its outside) */}
      <group rotation={[0, ang, 0]}>
        <mesh geometry={boardGeo} material={m(cover)} position={[-W / 2, 0, -TH / 2]} castShadow />
        <mesh geometry={pageGeo} material={m(leftPageTex(worn))} position={[-W / 2, 0, 0.0005]} />
      </group>
      {/* the page in motion */}
      {turning > 0.02 && open > 0.9 ? (
        <group rotation={[0, -turning * Math.PI * 0.96, 0]} position={[0, 0, 0.009]}>
          <mesh geometry={pageGeo} material={m(rightPageTex(worn, page))} position={[W / 2, 0, 0]}>
          </mesh>
          <mesh geometry={pageGeo} position={[W / 2, 0, -0.0005]} rotation={[0, Math.PI, 0]} material={m(leftPageTex(worn))} />
        </group>
      ) : null}
      {fairy > 0.01 ? (
        <group position={[-W * 0.45, 0.02 + fairyLift * (0.08 + fairy * 0.12) + Math.sin(t * 2.1) * 0.012 * fairy, 0.06 + 0.05 * fairy * fairyLift]}>
          <Fairy life={fairy} t={t} />
        </group>
      ) : null}
    </group>
  );
};
