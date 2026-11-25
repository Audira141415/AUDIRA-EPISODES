// EP09 Qahwa hook set (FOODFORGE): a glazed earthenware finjan of black coffee on a brass tray,
// roasted beans hanging in slow motion above it, backlit steam. Midground story props: the large red
// clay jar the Yemeni Sufis poured from, a brass oil lamp, and a sealed decree scroll (the 1511 "trial").
// Foreground: scattered roasted beans, red coffee cherries and a wooden tasbih. No people, no text
// that imitates scripture (the decree carries abstract strokes only).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { dropLand, mulberry32 } from "../../kits/foodforge/core/motion";
import { makeBokehTexture, makeSteamTexture, makeWalnutTexture } from "../../kits/foodforge/lib/materials";
import { FOODFORGE_PALETTE as FP } from "../../kits/foodforge/lib/palette";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";

export const QP = {
  backdrop: "#120A06",
  coffee: "#1A0B05",
  crema: "#8A5A2E",
  glaze: "#EADBC2",
  glazeBand: "#7A3E1E",
  brass: "#C8963E",
  clay: "#A2432A",
  clayDark: "#6E2716",
  bean: "#3A1C0E",
  beanDark: "#1E0D05",
  cherry: "#B3211B",
  parchment: "#E2CDA3",
  wax: "#9E1B16",
  tasbih: "#6B3B1F",
};

export const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};

// ---------- geometry helpers ----------
export const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

/** Roasted coffee bean: flattened ellipsoid with the centre crease on its flat side. */
const makeBeanGeometry = () => {
  const g = new THREE.SphereGeometry(1, 28, 20);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let y = v.y;
    if (y > 0) {
      y *= 0.45; // flat face
      y -= Math.exp(-Math.pow(v.x / 0.13, 2)) * 0.32 * (1 - Math.abs(v.z) * 0.6); // crease
    } else y *= 0.75;
    p.setXYZ(i, v.x * 0.66, y * 0.78, v.z);
  }
  g.computeVertexNormals();
  g.scale(0.034, 0.034, 0.05);
  return g;
};

// ---------- hero: finjan on a brass tray ----------
export const CUP_TOP = 0.255;
export const COFFEE_Y = 0.218;

export const cremaTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, "#1C0C05");
  grad.addColorStop(0.45, "#2A1308");
  grad.addColorStop(0.72, "#6A4020");
  grad.addColorStop(0.93, QP.crema);
  grad.addColorStop(1, "#B07A45");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const rnd = mulberry32(909);
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 180 + rnd() * 70;
    g.strokeStyle = `rgba(210,160,100,${0.15 + rnd() * 0.3})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 1 + rnd() * 4, 0, Math.PI * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Handmade earthenware glaze: warm cream with iron speckles and soft drip mottling. */
export const glazeTexture = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, 1024, 512);
  const rnd = mulberry32(4471);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * 1024, y = rnd() * 512, r = 30 + rnd() * 90;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(196,160,118,${0.12 + rnd() * 0.12})`);
    gr.addColorStop(1, "rgba(196,160,118,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 1024, 512);
  }
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${90 + rnd() * 40},${46 + rnd() * 20},${20},${0.35 + rnd() * 0.5})`;
    g.beginPath();
    g.arc(rnd() * 1024, rnd() * 512, 0.6 + rnd() * 1.8, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const Finjan: React.FC = () => {
  const outer = useMemo(
    () => lathe([[0, 0.006], [0.085, 0.006], [0.095, 0.014], [0.09, 0.03], [0.12, 0.08], [0.152, 0.16], [0.17, 0.235], [0.176, CUP_TOP]]),
    [],
  );
  const inner = useMemo(() => lathe([[0, 0.04], [0.105, 0.05], [0.142, 0.15], [0.162, 0.235], [0.176, CUP_TOP]]), []);
  const crema = useMemo(cremaTexture, []);
  const glazeMap = useMemo(glazeTexture, []);
  const grain = useSurfaceGrain(91, 0.12, 2);
  return (
    <group>
      <mesh geometry={outer} castShadow receiveShadow>
        <meshPhysicalMaterial color={QP.glaze} map={glazeMap} roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.14} roughnessMap={grain} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={inner} receiveShadow>
        <meshPhysicalMaterial color={QP.glaze} roughness={0.25} clearcoat={1} side={THREE.BackSide} />
      </mesh>
      {/* iron-red glaze bands */}
      {[0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.152 + ((y - 0.16) / 0.075) * 0.018 - 0.002, 0.004, 8, 96]} />
          <meshPhysicalMaterial color={QP.glazeBand} roughness={0.35} clearcoat={0.8} />
        </mesh>
      ))}
      <mesh position={[0, CUP_TOP, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.176, 0.006, 10, 96]} />
        <meshPhysicalMaterial color={QP.glazeBand} roughness={0.3} clearcoat={0.9} />
      </mesh>
      {/* black coffee with crema ring */}
      <mesh position={[0, COFFEE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.159, 64]} />
        <meshPhysicalMaterial map={crema} color="#9A8A80" roughness={0.12} clearcoat={0.6} clearcoatRoughness={0.05} envMapIntensity={0.4} />
      </mesh>
    </group>
  );
};

const BrassTray: React.FC = () => {
  const geo = useMemo(() => lathe([[0, 0.004], [0.27, 0.004], [0.3, 0.012], [0.315, 0.026], [0.302, 0.026], [0.278, 0.015], [0, 0.015]], 128), []);
  return (
    <mesh geometry={geo} position={[0, 0.002, 0]} receiveShadow castShadow>
      <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.26} clearcoat={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- beans ----------
export const BEAN_GEO = makeBeanGeometry();

export const Bean: React.FC<{ pos: [number, number, number]; rot: [number, number, number]; s?: number; dark?: boolean }> = ({ pos, rot, s = 1, dark }) => (
  <mesh geometry={BEAN_GEO} position={pos} rotation={rot} scale={s} castShadow receiveShadow>
    <meshPhysicalMaterial color={dark ? QP.beanDark : QP.bean} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
  </mesh>
);

/** Beans hanging above the cup in slow motion, then landing on the tray one by one. */
const FallingBeans: React.FC<{ t: number }> = ({ t }) => {
  const beans = useMemo(() => {
    const rnd = mulberry32(5150);
    return Array.from({ length: 7 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const r = 0.2 + rnd() * 0.07;
      return {
        sx: (rnd() - 0.5) * 0.3,
        sy: 0.36 + rnd() * 0.2,
        sz: (rnd() - 0.5) * 0.2,
        ex: Math.cos(a) * r,
        ez: Math.sin(a) * r * 0.8 + 0.05,
        land: 1.2 + i * 0.55,
        spin: [1.1 + (rnd() - 0.5) * 0.8, rnd() * 6, (rnd() - 0.5) * 0.8] as [number, number, number],
      };
    });
  }, []);
  return (
    <group>
      {beans.map((b, i) => {
        const d = dropLand(t, b.land, 1.1);
        const hover = (1 - d.fallP) * Math.sin(t * 0.9 + i) * 0.012;
        const x = b.sx + (b.ex - b.sx) * d.fallP;
        const z = b.sz + (b.ez - b.sz) * d.fallP;
        const y = b.sy + (0.035 - b.sy) * d.fallP + hover + d.bounce * 0.4;
        const spin = (1 - d.fallP) * t * 0.35;
        return <Bean key={i} pos={[x, y, z]} rot={[b.spin[0] + spin, b.spin[1] + spin * 0.6, b.spin[2]]} s={1.15} dark={i % 3 === 0} />;
      })}
    </group>
  );
};

/** Roasted beans scattered over the table (foreground and around the tray). */
const ScatterBeans: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 70;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const rnd = mulberry32(5177);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      // a loose pile front-right plus a spill towards the lens
      const pile = i < 34;
      const x = pile ? 0.34 + (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 1.0;
      const z = pile ? 0.42 + (rnd() - 0.5) * 0.24 : 0.45 + rnd() * 0.55;
      o.position.set(x, 0.016 + (pile ? rnd() * 0.03 : 0), z);
      o.rotation.set(rnd() > 0.5 ? 0 : Math.PI, rnd() * 6.28, (rnd() - 0.5) * 0.6);
      const s = 0.9 + rnd() * 0.25;
      o.scale.set(s, s, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(rnd() > 0.6 ? QP.beanDark : QP.bean));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[BEAN_GEO, undefined, N]} castShadow receiveShadow>
      <meshPhysicalMaterial roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
    </instancedMesh>
  );
};

/** Ripe red coffee cherries on a short twig (the plant came from across the Red Sea). */
const Cherries: React.FC = () => {
  const rnd = useMemo(() => mulberry32(5191), []);
  const items = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: -0.42 + i * 0.045 + (rnd() - 0.5) * 0.03, z: 0.3 + (rnd() - 0.5) * 0.08, s: 0.03 + rnd() * 0.006 })), [rnd]);
  return (
    <group position={[-0.08, 0, 0.12]} rotation={[0, 0.35, 0]}>
      <mesh position={[-0.33, 0.012, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.006, 0.009, 0.36, 8]} />
        <meshPhysicalMaterial color="#4A3020" roughness={0.8} />
      </mesh>
      {items.map((c, i) => (
        <mesh key={i} position={[c.x, c.s, c.z]} castShadow>
          <sphereGeometry args={[c.s, 24, 18]} />
          <meshPhysicalMaterial color={QP.cherry} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
      ))}
      {/* two glossy leaves */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[-0.47, 0.012, 0.3 + k * 0.05]} rotation={[-Math.PI / 2, 0, k * 0.6]} scale={[0.05, 0.12, 1]} castShadow>
          <circleGeometry args={[1, 24]} />
          <meshPhysicalMaterial color="#2F5A22" roughness={0.35} clearcoat={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

/** Wooden tasbih: a loop of beads with a tassel, foreground left. */
const Tasbih: React.FC = () => {
  const beads = useMemo(() => {
    const out: [number, number][] = [];
    const n = 33;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push([Math.cos(a) * 0.17 + Math.sin(a * 2) * 0.02, Math.sin(a) * 0.11]);
    }
    return out;
  }, []);
  return (
    <group position={[-0.5, 0.013, 0.62]} rotation={[0, 0.5, 0]}>
      {beads.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow>
          <sphereGeometry args={[0.013, 14, 10]} />
          <meshPhysicalMaterial color={QP.tasbih} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.004, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.02, 0.07, 10]} />
        <meshPhysicalMaterial color="#2E5B4A" {...POLISH.fabric} />
      </mesh>
    </group>
  );
};

// ---------- midground story props ----------
/** The large red clay jar the coffee was poured from (al-Jaziri via Ukers). */
export const ClayJar: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({ position = [-0.16, 0, -1.35], rotation = [0, 0, 0] }) => {
  const geo = useMemo(
    () => lathe([[0, 0.01], [0.16, 0.01], [0.24, 0.08], [0.34, 0.28], [0.36, 0.42], [0.31, 0.6], [0.17, 0.74], [0.12, 0.8], [0.13, 0.86], [0.16, 0.9], [0.145, 0.91], [0.11, 0.86], [0.1, 0.8]], 96),
    [],
  );
  const grain = useSurfaceGrain(77, 0.3, 4);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color={QP.clay} {...POLISH.clay} roughnessMap={grain} bumpMap={grain} bumpScale={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* incised darker bands */}
      {[0.3, 0.36].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.345 + i * 0.012, 0.005, 6, 96]} />
          <meshStandardMaterial color={QP.clayDark} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/** Brass oil lamp with a small live flame (its glow lives on FX_LAYER). */
export const OilLamp: React.FC<{ t: number; position?: [number, number, number]; glow?: number }> = ({ t, position = [0.58, 0, -0.85], glow: glowLevel = 1 }) => {
  const base = useMemo(() => lathe([[0, 0.004], [0.1, 0.004], [0.11, 0.02], [0.05, 0.05], [0.025, 0.08], [0.02, 0.42], [0.04, 0.44], [0.0, 0.44]], 64), []);
  const dish = useMemo(() => lathe([[0, 0.44], [0.05, 0.44], [0.1, 0.47], [0.115, 0.49], [0.105, 0.49], [0.09, 0.475], [0, 0.465]], 64), []);
  const glow = useMemo(() => makeBokehTexture(), []);
  const flick = 1 + Math.sin(t * 13.1) * 0.05 + Math.sin(t * 7.3 + 1) * 0.04;
  return (
    <group position={position}>
      <mesh geometry={base} castShadow>
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={dish} castShadow>
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* spout + flame */}
      <mesh position={[0.11, 0.49, 0]} rotation={[0, 0, -1.2]}>
        <cylinderGeometry args={[0.008, 0.016, 0.05, 10]} />
        <meshPhysicalMaterial color={QP.brass} metalness={1} roughness={0.3} />
      </mesh>
      <mesh ref={fx} position={[0.13, 0.535, 0]} scale={[0.016, 0.045 * flick, 0.016]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#FFD27A" toneMapped={false} />
      </mesh>
      <sprite ref={fx} position={[0.13, 0.54, 0]} scale={[0.32 * flick, 0.32 * flick, 1]}>
        <spriteMaterial map={glow} color="#FF9A3C" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight position={[0.13, 0.56, 0.05]} color="#FFB060" intensity={0.9 * flick * glowLevel} distance={3} decay={2} />
    </group>
  );
};

/** Parchment decree with abstract script strokes and a red wax seal: the 1511 "trial". */
export const decreeTexture = () => {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = QP.parchment;
  g.fillRect(0, 0, 768, 512);
  const rnd = mulberry32(1511);
  // foxing / stains
  for (let i = 0; i < 40; i++) {
    const x = rnd() * 768, y = rnd() * 512, r = 10 + rnd() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(140,96,48,${0.05 + rnd() * 0.08})`);
    gr.addColorStop(1, "rgba(140,96,48,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 768, 512);
  }
  // abstract right-to-left calligraphic strokes (not real text)
  g.strokeStyle = "rgba(34,18,8,0.92)";
  g.lineCap = "round";
  for (let row = 0; row < 6; row++) {
    const y = 90 + row * 62;
    let x = 690;
    while (x > 110) {
      const w = 90 + rnd() * 140; // one flowing "word": a long baseline swash
      const x1 = Math.max(100, x - w);
      g.lineWidth = 4 + rnd() * 3;
      g.beginPath();
      g.moveTo(x, y);
      const k = 3 + Math.floor(rnd() * 3);
      for (let j = 1; j <= k; j++) {
        const xj = x - ((x - x1) * j) / k;
        g.quadraticCurveTo(xj + (x - x1) / k / 2, y + (j % 2 ? 9 : -5) * rnd(), xj, y + (rnd() - 0.5) * 4);
      }
      g.stroke();
      // a few tall ascenders and a closing swash
      for (let j = 0; j < 2; j++) {
        if (rnd() > 0.45) {
          const ax = x - (x - x1) * rnd();
          g.beginPath();
          g.moveTo(ax, y);
          g.quadraticCurveTo(ax + 3, y - 20, ax + 1, y - 30 - rnd() * 8);
          g.stroke();
        }
      }
      if (rnd() > 0.6) {
        g.beginPath();
        g.arc(x1 + 6, y + 6, 8, 0.2, Math.PI * 0.9);
        g.stroke();
      }
      x = x1 - 22 - rnd() * 18;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const Decree: React.FC = () => {
  const tex = useMemo(decreeTexture, []);
  return (
    <group position={[0.4, 0.004, -0.36]} rotation={[0, -1.05, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[0.6, 0.4]} />
        <meshPhysicalMaterial map={tex} {...POLISH.paper} side={THREE.DoubleSide} />
      </mesh>
      {/* rolled ends */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0, 0.022, k * 0.215]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.62, 24]} />
          <meshPhysicalMaterial color="#D6BD8E" {...POLISH.paper} />
        </mesh>
      ))}
      {/* wax seal */}
      <mesh position={[-0.12, 0.012, 0.02]} castShadow>
        <cylinderGeometry args={[0.058, 0.064, 0.02, 28]} />
        <meshPhysicalMaterial color={QP.wax} roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[-0.12, 0.023, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.028, 0.038, 8]} />
        <meshPhysicalMaterial color="#7A120E" roughness={0.4} />
      </mesh>
    </group>
  );
};

// ---------- steam + background ----------
export const Steam: React.FC<{ t: number; amount?: number; scale?: number }> = ({ t, amount = 1, scale = 1 }) => {
  const texes = useMemo(() => [makeSteamTexture(11), makeSteamTexture(23), makeSteamTexture(37)], []);
  const wisps = useMemo(() => {
    const rnd = mulberry32(5240);
    return Array.from({ length: 14 }, (_, i) => ({
      x: (rnd() - 0.5) * 0.14,
      z: (rnd() - 0.5) * 0.1,
      period: 3.2 + rnd() * 1.4,
      phase: rnd(),
      drift: 0.05 + rnd() * 0.08,
      tex: i % 3,
      s: 0.16 + rnd() * 0.1,
    }));
  }, []);
  return (
    <group>
      {wisps.map((w, i) => {
        const u = (t / w.period + w.phase) % 1;
        const y = COFFEE_Y + 0.05 + u * 0.75;
        const x = w.x + Math.sin(t * 0.8 + i * 1.7 + u * 3) * w.drift * u;
        const life = Math.sin(Math.PI * u);
        const s = w.s * (0.6 + u * 1.6) * scale;
        return (
          <sprite ref={fx} key={i} position={[x, y, w.z]} scale={[s, s * 1.6, 1]}>
            <spriteMaterial map={texes[w.tex]} color="#FFDDB8" transparent opacity={life * 0.42 * amount} depthWrite={false} blending={THREE.AdditiveBlending} rotation={u * 0.8 + i} />
          </sprite>
        );
      })}
    </group>
  );
};

const Backdrop: React.FC<{ t: number }> = ({ t }) => {
  const wall = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = QP.backdrop;
    g.fillRect(0, 0, 512, 512);
    const gr = g.createRadialGradient(290, 300, 0, 290, 300, 300);
    gr.addColorStop(0, "#94522A");
    gr.addColorStop(0.4, "#3A1C0C");
    gr.addColorStop(0.7, "#160B05");
    gr.addColorStop(1, QP.backdrop);
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 512);
    // plaster grain so the wall is not a flat gradient
    const img = g.getImageData(0, 0, 512, 512);
    const rn = mulberry32(5301);
    for (let i = 0; i < img.data.length; i += 4) {
      const k = (rn() - 0.5) * 14;
      img.data[i] += k;
      img.data[i + 1] += k * 0.8;
      img.data[i + 2] += k * 0.6;
    }
    g.putImageData(img, 0, 0);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }, []);
  const bokeh = useMemo(() => makeBokehTexture(), []);
  const dots = useMemo(() => {
    const rnd = mulberry32(5262);
    return Array.from({ length: 18 }, () => ({ x: (rnd() - 0.5) * 4, y: 0.4 + rnd() * 2.2, z: -3.2 - rnd() * 1.5, s: 0.18 + rnd() * 0.4, o: 0.07 + rnd() * 0.14, ph: rnd() * 6.28 }));
  }, []);
  const wood = useMemo(() => {
    const tx = makeWalnutTexture();
    // pore grain: the kit's planks are smooth between grain lines and read as flat planes in shadow
    const cv = tx.image as HTMLCanvasElement;
    const g2 = cv.getContext("2d")!;
    const img = g2.getImageData(0, 0, cv.width, cv.height);
    const rn = mulberry32(5303);
    for (let i = 0; i < img.data.length; i += 4) {
      const k = (rn() - 0.5) * 34;
      img.data[i] += k;
      img.data[i + 1] += k * 0.8;
      img.data[i + 2] += k * 0.6;
    }
    g2.putImageData(img, 0, 0);
    tx.needsUpdate = true;
    tx.repeat.set(5.6, 4.9);
    return tx;
  }, []);
  return (
    <group>
      <mesh position={[0, 1.6, -5.5]}>
        <planeGeometry args={[30, 10]} />
        <meshBasicMaterial map={wall} toneMapped={false} />
      </mesh>
      {dots.map((d, i) => (
        <sprite ref={fx} key={i} position={[d.x + Math.sin(t * 0.3 + d.ph) * 0.04, d.y, d.z]} scale={[d.s, d.s, 1]}>
          <spriteMaterial map={bokeh} color={FP.bokeh} transparent opacity={d.o * (0.85 + 0.15 * Math.sin(t * 1.3 + d.ph))} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshPhysicalMaterial map={wood} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.35} color="#B07A52" />
      </mesh>
    </group>
  );
};

export const QahwaSet: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <ambientLight intensity={0.1} color={FP.keyWarm} />
    {/* warm tungsten key, front-right */}
    <directionalLight
      position={[1.6, 2.6, 2.0]}
      intensity={2.1}
      color={FP.keyWarm}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-1.6}
      shadow-camera-right={1.6}
      shadow-camera-top={1.6}
      shadow-camera-bottom={-1.6}
      shadow-bias={-0.0004}
      shadow-radius={4}
    />
    {/* hot backlight rim for steam and glaze edges */}
    <spotLight position={[-0.6, 1.6, -1.8]} angle={0.5} penumbra={0.9} intensity={9} decay={1.6} color={FP.rimWarm} />
    <directionalLight position={[1.5, 0.9, -1.8]} intensity={0.8} color={FP.rimWarm} />
    <directionalLight position={[-2.2, 0.9, 1.0]} intensity={0.3} color={FP.fillCool} />

    {/* tight hero spot on the cup: the subject carries the brightest values */}
    <spotLight position={[0.6, 2.2, 1.2]} angle={0.16} penumbra={0.8} intensity={30} decay={1.4} color="#FFE2BC" castShadow={false} />
    <Backdrop t={t} />
    <ClayJar />
    <OilLamp t={t} />
    <Decree />
    <BrassTray />
    <Finjan />
    <FallingBeans t={t} />
    <ScatterBeans />
    <Cherries />
    <Tasbih />
    <Steam t={t} />
  </group>
);
