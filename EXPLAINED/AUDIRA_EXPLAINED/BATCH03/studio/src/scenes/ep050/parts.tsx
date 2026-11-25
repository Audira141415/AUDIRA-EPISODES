// EP050 koper bandara — SATISFYFORGE building blocks (copied/adapted, kit files untouched).
// Everything is a pure function of `t`; decor randomness only from seeded mulberry32.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32 } from "../../kits/satisfyforge/core/motion";
import { SATISFYFORGE_PALETTE as P } from "../../kits/satisfyforge/lib/palette";
import { FX_LAYER } from "../../core/render/Post";

export const BELT_TOP = 0.445;
export const LANE = { pink: "#FF8DB6", butter: "#FFD45E", mint: "#6FD8B0" };

const CANVAS_FONT = "'Manrope', 'Segoe UI', sans-serif";

// ---------- cyclorama ----------
export const makeSweep = () => {
  const W = 34;
  const geo = new THREE.PlaneGeometry(W, 1, 1, 90);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const floor = new THREE.Color(P.sweepFloor).lerp(new THREE.Color("#FFF1EC"), 0.3);
  const wall = new THREE.Color(P.sweepWall);
  const R = 3;
  const zStart = 10;
  const floorLen = 18; // z = +10 .. -8
  const arc = (Math.PI / 2) * R;
  const wallLen = 12;
  const total = floorLen + arc + wallLen;
  for (let i = 0; i < pos.count; i++) {
    const s = (pos.getY(i) + 0.5) * total;
    let y = 0;
    let z = 0;
    if (s < floorLen) z = zStart - s;
    else if (s < floorLen + arc) {
      const a = (s - floorLen) / R;
      z = zStart - floorLen - Math.sin(a) * R;
      y = R - Math.cos(a) * R;
    } else {
      z = zStart - floorLen - R;
      y = R + (s - floorLen - arc);
    }
    pos.setXYZ(i, pos.getX(i), y, z);
    const k = THREE.MathUtils.smoothstep(s, floorLen - 4, floorLen + arc + 3);
    const c = floor.clone().lerp(wall, k);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
};

// ---------- sweep a 2D profile along a flat curve (fixed world-up frame, no twist) ----------
const UP = new THREE.Vector3(0, 1, 0);
export const sweepProfile = (curve: THREE.Curve<THREE.Vector3>, profile: [number, number][], samples = 120, closed = true, vScale = 1) => {
  const n = profile.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const len = curve.getLength();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const p = curve.getPointAt(u);
    const tg = curve.getTangentAt(u);
    const side = new THREE.Vector3().crossVectors(tg, UP).normalize();
    for (let j = 0; j < n; j++) {
      const [x, y] = profile[j];
      pos.push(p.x + side.x * x, p.y + y, p.z + side.z * x);
      uv.push(j / (n - 1), u * len * vScale);
    }
  }
  const segs = closed ? n : n - 1;
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      const c = (i + 1) * n + j;
      const d = (i + 1) * n + ((j + 1) % n);
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const roundRect = (w: number, h: number, r: number, cy: number, steps = 4): [number, number][] => {
  const pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, cy + h / 2 - r, 0],
    [-w / 2 + r, cy + h / 2 - r, Math.PI / 2],
    [-w / 2 + r, cy - h / 2 + r, Math.PI],
    [w / 2 - r, cy - h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cyy, a0] of corners) {
    for (let k = 0; k <= steps; k++) {
      const a = a0 + (k / steps) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cyy + Math.sin(a) * r]);
    }
  }
  return pts;
};

// ---------- belt slat texture ----------
export const makeSlatTexture = () => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#EEE8F3";
  g.fillRect(0, 0, 64, 256);
  for (let k = 0; k < 4; k++) {
    const y = k * 64;
    g.fillStyle = "#D9CFE6";
    g.fillRect(0, y, 64, 5);
    g.fillStyle = "#FBF8FD";
    g.fillRect(0, y + 5, 64, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// ---------- conveyor ----------
export const Conveyor: React.FC<{
  curve: THREE.Curve<THREE.Vector3>;
  width: number;
  rail: string;
  slats: THREE.Texture;
  t: number;
  speed?: number;
}> = ({ curve, width, rail, slats, t, speed = 0.35 }) => {
  const geos = useMemo(() => {
    const frame = sweepProfile(curve, roundRect(width + 0.16, 0.16, 0.04, 0.36), 140);
    const top = sweepProfile(curve, [[-width / 2, BELT_TOP], [width / 2, BELT_TOP]], 140, false, 0.5);
    const railL = sweepProfile(curve, roundRect(0.06, 0.1, 0.025, 0.5, 3).map(([x, y]) => [x - width / 2 - 0.05, y] as [number, number]), 140);
    const railR = sweepProfile(curve, roundRect(0.06, 0.1, 0.025, 0.5, 3).map(([x, y]) => [x + width / 2 + 0.05, y] as [number, number]), 140);
    const len = curve.getLength();
    const legs: { p: THREE.Vector3; side: THREE.Vector3 }[] = [];
    const nLegs = Math.max(2, Math.round(len / 1.3));
    for (let i = 0; i < nLegs; i++) {
      const u = (i + 0.5) / nLegs;
      const p = curve.getPointAt(u);
      const side = new THREE.Vector3().crossVectors(curve.getTangentAt(u), UP).normalize();
      legs.push({ p, side });
    }
    return { frame, top, railL, railR, legs };
  }, [curve, width]);
  const tex = useMemo(() => {
    const tx = slats.clone();
    tx.needsUpdate = true;
    return tx;
  }, [slats]);
  tex.offset.set(0, -t * speed);
  return (
    <group>
      <mesh geometry={geos.frame} castShadow receiveShadow>
        <meshPhysicalMaterial color={P.plinth} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.top} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {[geos.railL, geos.railR].map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial color={rail} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {geos.legs.map((l, i) =>
        [-1, 1].map((s) => (
          <mesh key={`${i}${s}`} position={[l.p.x + l.side.x * s * (width / 2 - 0.05), 0.15, l.p.z + l.side.z * s * (width / 2 - 0.05)]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.3, 16]} />
            <meshPhysicalMaterial color="#F3ECF6" roughness={0.4} clearcoat={0.4} />
          </mesh>
        )),
      )}
    </group>
  );
};

// ---------- canvas textures ----------
const roundRectPath = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

// Bag tag as a long thermal strip (stylised): colour band, huge 3-letter destination, route,
// Interleaved-2-of-5-like barcode and a FICTIONAL 10-digit licence plate (leading 0 = normal tag).
export const plateNumber = (seed: number) => {
  const rnd = mulberry32(seed * 7 + 11);
  const d = Array.from({ length: 9 }, () => Math.floor(rnd() * 10)).join("");
  return `0 ${d.slice(0, 3)} ${d.slice(3)}`;
};

export const makeTagTexture = (from: string, to: string, color: string, seed: number) => {
  const W = 256;
  const H = 640;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFDF9";
  g.fillRect(0, 0, W, H);
  g.fillStyle = color;
  g.fillRect(0, 0, W, 70);
  g.fillStyle = "#FFFDF9";
  g.beginPath();
  g.arc(W / 2, 34, 13, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = P.ink;
  g.textAlign = "center";
  g.font = `600 96px ${CANVAS_FONT}`;
  g.fillText(to, W / 2, 178);
  g.font = `500 28px ${CANVAS_FONT}`;
  g.fillStyle = "rgba(75,63,92,0.72)";
  g.fillText(`${from}  →  ${to}`, W / 2, 222);
  const bars = (y: number, h: number, s: number) => {
    const rnd = mulberry32(s);
    let x = 26;
    g.fillStyle = P.ink;
    while (x < W - 26) {
      const wide = rnd() > 0.5;
      const bw = wide ? 7 : 3;
      g.fillRect(x, y, bw, h);
      x += bw + (rnd() > 0.5 ? 7 : 3);
    }
  };
  bars(250, 150, seed);
  g.font = `600 26px ${CANVAS_FONT}`;
  g.fillStyle = P.ink;
  g.fillText(plateNumber(seed), W / 2, 436);
  g.fillStyle = color;
  g.fillRect(0, 462, W, 8);
  bars(490, 90, seed + 1);
  g.font = `500 20px ${CANVAS_FONT}`;
  g.fillStyle = "rgba(75,63,92,0.7)";
  g.fillText(plateNumber(seed), W / 2, 612);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const makeSignTexture = (text: string, bg: string, fg = "#FFFFFF", w = 512, h = 192, size = 120) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = `600 ${size}px ${CANVAS_FONT}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + size * 0.04);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export { roundRectPath };

// ---------- suitcase ----------
export const SUITCASE = { W: 0.6, H: 0.26, L: 0.84 };

const shade = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + k, 0, 1));
  return `#${c.getHexString()}`;
};

export const Suitcase: React.FC<{
  color: string;
  tag?: THREE.Texture;
  tagRot?: number;
  position: [number, number, number];
  yaw: number;
  tilt?: number;
}> = ({ color, tag, tagRot = 0.12, position, yaw, tilt = 0 }) => {
  const { W, H, L } = SUITCASE;
  const body = useMemo(() => new RoundedBoxGeometry(W, H, L, 5, 0.075), []);
  const band = useMemo(() => new RoundedBoxGeometry(W + 0.012, 0.03, L + 0.012, 3, 0.07), []);
  const rib = useMemo(() => new RoundedBoxGeometry(0.06, 0.03, L - 0.16, 3, 0.012), []);
  const dark = shade(color, -0.1);
  const light = shade(color, 0.06);
  return (
    <group position={position} rotation={[0, yaw, tilt]}>
      <group position={[0, H / 2, 0]}>
        <mesh geometry={body} castShadow receiveShadow>
          <meshPhysicalMaterial color={color} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} />
        </mesh>
        <mesh geometry={band} position={[0, -0.01, 0]} castShadow>
          <meshPhysicalMaterial color={dark} roughness={0.5} clearcoat={0.3} />
        </mesh>
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} geometry={rib} position={[x, H / 2 - 0.004, 0]} castShadow>
            <meshPhysicalMaterial color={light} roughness={0.25} clearcoat={1} />
          </mesh>
        ))}
        {/* carry handle on the front end */}
        <mesh position={[0, 0.02, L / 2 + 0.005]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.09, 0.022, 12, 28, Math.PI]} />
          <meshPhysicalMaterial color={dark} roughness={0.4} clearcoat={0.5} />
        </mesh>
        {/* wheels on the back end */}
        {[-0.21, 0.21].map((x) => (
          <mesh key={x} position={[x, -H / 2 + 0.06, -L / 2 - 0.01]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 20]} />
            <meshPhysicalMaterial color="#5E5470" roughness={0.6} />
          </mesh>
        ))}
        {/* luggage tag lying on the lid, strap running to the handle */}
        {tag && <group position={[0.02, H / 2 + 0.02, L / 2 - 0.36]} rotation={[0, tagRot, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[0.27, 0.68]} />
            <meshStandardMaterial map={tag} roughness={0.55} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.007, 0]} castShadow>
            <boxGeometry args={[0.275, 0.006, 0.685]} />
            <meshStandardMaterial color="#F4EEE8" roughness={0.6} />
          </mesh>
        </group>}
        {tag && <mesh position={[0.01, H / 2 + 0.008, L / 2 - 0.02]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.025, 0.008, 0.14]} />
          <meshStandardMaterial color="#F7F2EC" roughness={0.6} />
        </mesh>}
      </group>
    </group>
  );
};

// ---------- scanner arch (lengkung cahaya) ----------
export const ScannerArch: React.FC<{ position: THREE.Vector3; yaw: number; plaque: THREE.Texture; t: number; width: number }> = ({ position, yaw, plaque, t, width }) => {
  const R = width / 2 + 0.32;
  const pulse = 0.75 + 0.25 * Math.sin(t * 6.0);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#9FEFFF").multiplyScalar(4.0), toneMapped: false }), []);
  const sheetMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#9BE7FF", transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    [],
  );
  sheetMat.opacity = 0.3 + 0.08 * pulse;
  return (
    <group position={[position.x, BELT_TOP - 0.1, position.z]} rotation={[0, yaw, 0]}>
      {/* housing ring (white clearcoat) */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[R, 0.1, 24, 72, Math.PI]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* glowing inner light band */}
      <mesh material={glowMat} ref={(m) => m?.layers.set(FX_LAYER)}>
        <torusGeometry args={[R - 0.1, 0.055, 12, 72, Math.PI]} />
      </mesh>
      {/* the light sheet the bag passes through */}
      <mesh material={sheetMat} ref={(m) => m?.layers.set(FX_LAYER)}>
        <circleGeometry args={[R - 0.1, 64, 0, Math.PI]} />
      </mesh>
      {/* feet */}
      {[-R, R].map((x) => (
        <mesh key={x} position={[x, -0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.5, 32]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={0.8} />
        </mesh>
      ))}
      {/* AUDIRA plaque on top of the arch */}
      <group position={[0, R + 0.1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.78, 0.22, 0.12]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.3} clearcoat={1} />
        </mesh>
        {[0.061, -0.061].map((z, i) => (
          <mesh key={z} position={[0, 0, z]} rotation={[0, i ? Math.PI : 0, 0]}>
            <planeGeometry args={[0.72, 0.17]} />
            <meshStandardMaterial map={plaque} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ---------- background decor + foreground candy ----------
export const Decor: React.FC<{ t: number }> = ({ t }) => {
  const items = useMemo(() => {
    const rnd = mulberry32(5021);
    const cols = [P.pink, P.mint, P.butter, P.lilac, P.sky, P.peach];
    return Array.from({ length: 12 }, (_, i) => ({
      x: -7.5 + i * 1.35 + (rnd() - 0.5) * 0.5,
      z: -9.0 - rnd() * 1.2,
      kind: i % 3,
      s: 0.45 + rnd() * 0.45,
      c: cols[i % cols.length],
      ph: rnd() * 6.28,
    }));
  }, []);
  return (
    <group>
      {items.map((d, i) => (
        <mesh key={i} position={[d.x, d.s * (d.kind === 1 ? 0.7 : 0.5) + 0.02, d.z]} rotation={[d.kind === 2 ? Math.PI / 2 : 0, t * 0.15 + d.ph, 0]} castShadow receiveShadow>
          {d.kind === 0 && <sphereGeometry args={[d.s * 0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />}
          {d.kind === 1 && <coneGeometry args={[d.s * 0.45, d.s * 1.4, 4]} />}
          {d.kind === 2 && <torusGeometry args={[d.s * 0.4, d.s * 0.16, 16, 40]} />}
          <meshPhysicalMaterial color={d.c} roughness={0.5} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
};
