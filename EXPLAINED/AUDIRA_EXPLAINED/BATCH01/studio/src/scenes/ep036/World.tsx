// EP036 world: a cutaway block of city street. Above: rain, flooded road, buildings.
// Below: soil strata, a segmented concrete tunnel lining with gaskets, a dry MRT car,
// and a sump pit with a pump that lifts seepage back up to the surface drain.
// Everything is a pure function of `f` (film frame); randomness uses a seeded PRNG.

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, LinearSRGBColorSpace,
  MeshStandardMaterial, Path, PMREMGenerator, RepeatWrapping, Shape, SRGBColorSpace, Texture, TubeGeometry, Vector3,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { prng } from "../../core/materials/textures.ts";
import { BLOCK, P, ROAD, SUMP, TUNNEL, WATER_TABLE_Y } from "./layout.ts";

export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true): Texture => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = srgb ? SRGBColorSpace : LinearSRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ---------- soil strata ----------
const STRATA: [number, string][] = [
  [0, "#6b6660"], // road base
  [-0.7, "#d2b48c"], // urban fill
  [-2.6, "#bf9468"], // silty clay
  [-6.2, "#c8a77a"], // sand + silt (water bearing)
  [-11.6, "#9a785c"], // dense clay
];
export const strataTexture = () =>
  canvasTex(512, 1024, (g) => {
    const H = 1024, Y = (y: number) => (-y / (BLOCK.top - BLOCK.bottom)) * H;
    STRATA.forEach(([y, col], i) => {
      const y1 = i + 1 < STRATA.length ? STRATA[i + 1][0] : BLOCK.bottom;
      g.fillStyle = col;
      g.fillRect(0, Y(y), 512, Y(y1) - Y(y) + 1);
    });
    const rnd = prng(36);
    // speckle grains
    for (let i = 0; i < 5200; i++) {
      const x = rnd() * 512, y = rnd() * H, s = 0.8 + rnd() * 2.2;
      g.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.10)" : "rgba(60,40,20,0.10)";
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
    }
    // pebbles in the fill layer
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 512, y = Y(-0.9 - rnd() * 1.5), s = 3 + rnd() * 5;
      g.fillStyle = "rgba(120,110,100,0.55)";
      g.beginPath();
      g.ellipse(x, y, s * 1.3, s, rnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    // groundwater tint below the water table
    const wt = Y(WATER_TABLE_Y);
    const grad = g.createLinearGradient(0, wt, 0, H);
    grad.addColorStop(0, "rgba(94,167,220,0.22)");
    grad.addColorStop(1, "rgba(94,167,220,0.12)");
    g.fillStyle = grad;
    g.fillRect(0, wt, 512, H - wt);
    // stratum boundaries
    g.strokeStyle = "rgba(40,30,20,0.25)";
    g.lineWidth = 2;
    STRATA.slice(1).forEach(([y]) => {
      g.beginPath();
      for (let x = 0; x <= 512; x += 8) g.lineTo(x, Y(y) + Math.sin(x * 0.03 + y) * 3);
      g.stroke();
    });
    // dashed water table line
    g.strokeStyle = P.waterDeep;
    g.lineWidth = 5;
    g.setLineDash([22, 14]);
    g.beginPath();
    g.moveTo(0, wt);
    g.lineTo(512, wt);
    g.stroke();
  });

const Soil: React.FC = () => {
  const { geo, front, side } = useMemo(() => {
    const s = new Shape();
    s.moveTo(-BLOCK.hw, BLOCK.bottom);
    s.lineTo(BLOCK.hw, BLOCK.bottom);
    s.lineTo(BLOCK.hw, BLOCK.top);
    s.lineTo(-BLOCK.hw, BLOCK.top);
    s.closePath();
    const tunnel = new Path();
    tunnel.absarc(TUNNEL.x, TUNNEL.y, TUNNEL.R, 0, Math.PI * 2, true);
    s.holes.push(tunnel);
    const sump = new Path();
    sump.moveTo(SUMP.x0, SUMP.y0);
    sump.lineTo(SUMP.x0, SUMP.y1);
    sump.lineTo(SUMP.x1, SUMP.y1);
    sump.lineTo(SUMP.x1, SUMP.y0);
    sump.closePath();
    s.holes.push(sump);
    const geo = new ExtrudeGeometry(s, { depth: BLOCK.front - BLOCK.back, bevelEnabled: false, curveSegments: 96 });
    geo.translate(0, 0, BLOCK.back);
    const tex = strataTexture();
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(1 / (2 * BLOCK.hw), 1 / (BLOCK.top - BLOCK.bottom));
    tex.offset.set(0.5, 1);
    const front = new MeshStandardMaterial({ map: tex, roughness: 0.95 });
    const side = new MeshStandardMaterial({ color: "#a98663", roughness: 0.95 });
    return { geo, front, side };
  }, []);
  // right side face (visible from the camera) gets the strata too
  const sideTex = useMemo(() => {
    const t = strataTexture();
    return t;
  }, []);
  const H = BLOCK.top - BLOCK.bottom, Dz = BLOCK.front - BLOCK.back;
  return (
    <group>
      <mesh geometry={geo} material={[front, side]} castShadow receiveShadow />
      <mesh position={[BLOCK.hw + 0.002, (BLOCK.top + BLOCK.bottom) / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[Dz, H]} />
        <meshStandardMaterial map={sideTex} roughness={0.95} />
      </mesh>
      {/* base plinth under the block */}
      <mesh position={[0, BLOCK.bottom - 0.35, 0]} receiveShadow castShadow>
        <boxGeometry args={[BLOCK.hw * 2 + 0.6, 0.7, Dz + 0.6]} />
        <meshStandardMaterial color="#e7e2d9" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ---------- tunnel lining ----------
export const annularSector = (R: number, r: number, a0: number, a1: number) => {
  const s = new Shape();
  s.moveTo(Math.cos(a0) * R, Math.sin(a0) * R);
  s.absarc(0, 0, R, a0, a1, false);
  s.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
  s.absarc(0, 0, r, a1, a0, true);
  s.closePath();
  return s;
};

const Lining: React.FC = () => {
  const parts = useMemo(() => {
    const out: { geo: ExtrudeGeometry; z: number; rot: number }[] = [];
    const gapA = 0.022, gapZ = 0.07, L = TUNNEL.ringLen;
    const segGeos = Array.from({ length: TUNNEL.segs }, (_, k) => {
      const step = (Math.PI * 2) / TUNNEL.segs;
      return new ExtrudeGeometry(annularSector(TUNNEL.R - 0.02, TUNNEL.r, k * step + gapA, (k + 1) * step - gapA), {
        depth: L - gapZ - 0.06,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
        curveSegments: 24,
      });
    });
    for (let i = 0; i < TUNNEL.rings; i++) {
      const z = BLOCK.front - (i + 1) * L + gapZ / 2 + 0.03;
      segGeos.forEach((geo) => out.push({ geo, z, rot: (i % 2) * (Math.PI / TUNNEL.segs) + 0.21 }));
    }
    return out;
  }, []);
  const cut = useMemo(() => new MeshStandardMaterial({ color: P.concreteCut, roughness: 0.82 }), []);
  const inner = useMemo(() => new MeshStandardMaterial({ color: P.concreteIn, roughness: 0.85 }), []);
  // gaskets: radial strips in segment joints + circumferential rings between rings
  const gaskets = useMemo(() => {
    const rad: { z: number; a: number }[] = [];
    for (let i = 0; i < TUNNEL.rings; i++) {
      const rot = (i % 2) * (Math.PI / TUNNEL.segs) + 0.21;
      for (let k = 0; k < TUNNEL.segs; k++) rad.push({ z: BLOCK.front - (i + 0.5) * TUNNEL.ringLen, a: rot + (k * Math.PI * 2) / TUNNEL.segs });
    }
    return rad;
  }, []);
  const midR = (TUNNEL.R + TUNNEL.r) / 2;
  return (
    <group position={[TUNNEL.x, TUNNEL.y, 0]}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geo} material={[cut, inner]} position={[0, 0, p.z]} rotation={[0, 0, p.rot]} castShadow receiveShadow />
      ))}
      {gaskets.map((g, i) => (
        <mesh key={`g${i}`} position={[Math.cos(g.a) * midR, Math.sin(g.a) * midR, g.z]} rotation={[0, 0, g.a]}>
          <boxGeometry args={[TUNNEL.R - TUNNEL.r - 0.06, 0.1, TUNNEL.ringLen - 0.02]} />
          <meshStandardMaterial color={P.gasket} roughness={0.6} emissive={P.gasket} emissiveIntensity={0.25} />
        </mesh>
      ))}
      {Array.from({ length: TUNNEL.rings - 1 }, (_, i) => (
        <mesh key={`c${i}`} position={[0, 0, BLOCK.front - (i + 1) * TUNNEL.ringLen]}>
          <ringGeometry args={[TUNNEL.r + 0.04, TUNNEL.R - 0.06, 96]} />
          <meshStandardMaterial color={P.gasket} roughness={0.6} side={DoubleSide} emissive={P.gasket} emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* dark far end so the tube reads as deep */}
      <mesh position={[0, 0, BLOCK.back + 0.05]}>
        <circleGeometry args={[TUNNEL.r, 64]} />
        <meshStandardMaterial color="#3b3f44" roughness={1} />
      </mesh>
    </group>
  );
};

// ---------- invert, track, drainage channel ----------
const Invert: React.FC = () => {
  const geo = useMemo(() => {
    const yc = TUNNEL.invertY - TUNNEL.y;
    const r = TUNNEL.r + 0.01;
    const a = Math.asin(yc / r);
    const s = new Shape();
    s.moveTo(Math.cos(a) * r, yc);
    s.absarc(0, 0, r, a, Math.PI - a, true);
    s.closePath();
    const g = new ExtrudeGeometry(s, { depth: BLOCK.front - BLOCK.back - 0.05, bevelEnabled: false, curveSegments: 48 });
    g.translate(TUNNEL.x, TUNNEL.y, BLOCK.back);
    return g;
  }, []);
  const Lz = BLOCK.front - BLOCK.back;
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color="#bdb7ad" roughness={0.9} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <group key={x}>
          <mesh position={[x, TUNNEL.invertY + 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.2, Lz - 0.1]} />
            <meshStandardMaterial color="#9aa1a8" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* sleepers in front of the train */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, TUNNEL.invertY + 0.02, BLOCK.front - 0.25 - i * 0.55]} receiveShadow>
          <boxGeometry args={[2.0, 0.06, 0.24]} />
          <meshStandardMaterial color="#8d877e" roughness={0.9} />
        </mesh>
      ))}
      {/* side drainage channel carrying seepage toward the sump */}
      <mesh position={[1.75, TUNNEL.invertY + 0.012, 0]}>
        <boxGeometry args={[0.32, 0.03, Lz - 0.1]} />
        <meshStandardMaterial color={P.water} roughness={0.08} emissive={P.water} emissiveIntensity={0.35} />
      </mesh>
      {/* tunnel lamps */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`l${i}`} position={[-2.15, TUNNEL.y + 1.75, BLOCK.front - 0.8 - i * 1.6]} rotation={[0, 0, -0.85]}>
          <boxGeometry args={[0.1, 0.5, 0.9]} />
          <meshStandardMaterial color="#fff6dc" emissive="#ffe9b0" emissiveIntensity={2.2} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- train ----------
const Train: React.FC = () => {
  const W = 2.6, H = 3.0, L = 7.4;
  const zFront = 2.55;
  const y0 = TUNNEL.invertY + 0.22;
  const body = useMemo(() => new RoundedBoxGeometry(W, H, L, 4, 0.32), []);
  const cy = y0 + H / 2;
  return (
    <group position={[TUNNEL.x, cy, zFront - L / 2]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f2f3f1" roughness={0.3} metalness={0.15} clearcoat={0.6} clearcoatRoughness={0.15} />
      </mesh>
      {/* livery band */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[W + 0.02, 0.26, L - 0.5]} />
        <meshStandardMaterial color={P.mint} roughness={0.45} />
      </mesh>
      {/* front face: windshield, headlights, skirt */}
      <group position={[0, 0, L / 2 + 0.005]}>
        <mesh position={[0, 0.55, 0]}>
          <planeGeometry args={[2.05, 1.05]} />
          <meshPhysicalMaterial color="#14202a" roughness={0.06} clearcoat={1} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.55, 0.002]}>
          <planeGeometry args={[W - 0.25, 0.26]} />
          <meshStandardMaterial color={P.mint} roughness={0.45} />
        </mesh>
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} position={[x, -0.95, 0.01]}>
            <circleGeometry args={[0.13, 24]} />
            <meshStandardMaterial color="#fff8e6" emissive="#fff1c9" emissiveIntensity={4} />
          </mesh>
        ))}
        <mesh position={[0, 1.27, 0.002]}>
          <planeGeometry args={[1.1, 0.2]} />
          <meshStandardMaterial color="#20262c" emissive={P.amber} emissiveIntensity={0.15} />
        </mesh>
      </group>
      {/* side windows (visible on the right flank through the ring opening) */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[W / 2 + 0.006, 0.45, L / 2 - 1.2 - i * 1.7]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.1, 0.9]} />
          <meshStandardMaterial color="#1b2731" emissive="#ffe8b8" emissiveIntensity={0.35} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, -H / 2 - 0.08, 0]}>
        <boxGeometry args={[W - 0.5, 0.18, L - 0.8]} />
        <meshStandardMaterial color="#3a3d40" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ---------- sump pit + pump + pipes ----------
export const pipe = (pts: [number, number, number][], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p)), false, "catmullrom", 0.02), 64, r, 20, false);

const Sump: React.FC<{ f: number }> = ({ f }) => {
  const zc = BLOCK.front;
  const discharge = useMemo(
    () => pipe([[2.7, -12.0, 3.0], [2.7, -11.7, 3.1], [3.2, -11.6, 3.6], [4.3, -11.6, 3.95], [4.65, -11.1, zc], [4.65, -6, zc], [4.65, -1.0, zc], [4.65, -0.3, zc]], 0.17),
    [zc],
  );
  const drain = useMemo(() => pipe([[1.75, TUNNEL.invertY - 0.05, zc], [1.65, -10.8, zc], [1.55, -11.5, zc], [1.5, -12.0, zc]], 0.11), [zc]);
  // flow chevrons up the discharge pipe, moving with the frame
  const chevrons = Array.from({ length: 5 }, (_, i) => {
    const t = ((i / 5 + f * 0.004) % 1 + 1) % 1;
    return -10.6 + t * 9.6;
  });
  return (
    <group>
      {/* pit back wall + floor */}
      <mesh position={[(SUMP.x0 + SUMP.x1) / 2, (SUMP.y0 + SUMP.y1) / 2, SUMP.wallZ]} receiveShadow>
        <boxGeometry args={[SUMP.x1 - SUMP.x0, SUMP.y1 - SUMP.y0, 0.1]} />
        <meshStandardMaterial color="#c2bcb2" roughness={0.9} />
      </mesh>
      <mesh position={[(SUMP.x0 + SUMP.x1) / 2, SUMP.y0 + 0.08, (SUMP.wallZ + zc) / 2]} receiveShadow>
        <boxGeometry args={[SUMP.x1 - SUMP.x0, 0.16, zc - SUMP.wallZ]} />
        <meshStandardMaterial color="#b3ada3" roughness={0.9} />
      </mesh>
      {/* collected seepage water */}
      <mesh position={[(SUMP.x0 + SUMP.x1) / 2, (SUMP.y0 + 0.16 + SUMP.waterY) / 2, (SUMP.wallZ + zc) / 2 - 0.02]}>
        <boxGeometry args={[SUMP.x1 - SUMP.x0 - 0.02, SUMP.waterY - SUMP.y0 - 0.16, zc - SUMP.wallZ - 0.06]} />
        <meshPhysicalMaterial color={P.water} roughness={0.05} transparent opacity={0.72} emissive={P.waterDeep} emissiveIntensity={0.25} />
      </mesh>
      {/* submersible pump */}
      <group position={[2.7, SUMP.y0 + 0.16, 3.0]} scale={1.35}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.4, 1.1, 32]} />
          <meshStandardMaterial color={P.amber} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.36, 0.25, 32]} />
          <meshStandardMaterial color="#5d6164" roughness={0.35} metalness={0.8} />
        </mesh>
        {[0.25, 0.45, 0.65, 0.85].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.395, 0.025, 8, 40]} />
            <meshStandardMaterial color="#c98c22" roughness={0.4} metalness={0.4} />
          </mesh>
        ))}
      </group>
      <mesh geometry={discharge} castShadow>
        <meshStandardMaterial color={P.water} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh geometry={drain} castShadow>
        <meshStandardMaterial color={P.water} roughness={0.35} metalness={0.2} />
      </mesh>
      {chevrons.map((y, i) => (
        <mesh key={i} position={[4.65, y, zc + 0.22]}>
          <coneGeometry args={[0.13, 0.26, 3]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- groundwater pressing on the lining ----------
export const arrowGeo = (() => {
  let g: ExtrudeGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new Shape();
    // points along +x: shaft then head; tip at x = 0
    s.moveTo(-1.0, -0.09);
    s.lineTo(-0.36, -0.09);
    s.lineTo(-0.36, -0.26);
    s.lineTo(0, 0);
    s.lineTo(-0.36, 0.26);
    s.lineTo(-0.36, 0.09);
    s.lineTo(-1.0, 0.09);
    s.closePath();
    g = new ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false });
    return g;
  };
})();

const Groundwater: React.FC<{ f: number }> = ({ f }) => {
  const angles = [135, 165, 200, 232, 262, 300, 20, 48].map((d) => (d * Math.PI) / 180);
  const pulse = 0.12 * Math.sin(f * 0.25);
  return (
    <group position={[TUNNEL.x, TUNNEL.y, BLOCK.front + 0.01]}>
      {angles.map((a, i) => {
        const r = TUNNEL.R + 0.22 + pulse;
        return (
          <mesh key={i} geometry={arrowGeo()} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a + Math.PI]}>
            <meshStandardMaterial color={P.waterDeep} emissive={P.water} emissiveIntensity={0.35} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- street level ----------
export const windowTex = () =>
  canvasTex(128, 256, (g) => {
    g.fillStyle = P.building;
    g.fillRect(0, 0, 128, 256);
    for (let y = 12; y < 250; y += 28)
      for (let x = 10; x < 120; x += 28) {
        g.fillStyle = "#9ec6e2";
        g.fillRect(x, y, 18, 16);
      }
  });

export const Building: React.FC<{ x: number; z: number; w: number; d: number; h: number; tex: Texture }> = ({ x, z, w, d, h, tex }) => {
  const t = useMemo(() => {
    const c = tex.clone();
    c.wrapS = c.wrapT = RepeatWrapping;
    c.repeat.set(w / 2.2, h / 4.4);
    c.needsUpdate = true;
    return c;
  }, [tex, w, h]);
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 3, 0.08), [w, h, d]);
  return (
    <group position={[x, 0.25 + h / 2, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={t} roughness={0.7} />
      </mesh>
      <mesh position={[0, h / 2 + 0.06, 0]} castShadow>
        <boxGeometry args={[w * 0.5, 0.18, d * 0.5]} />
        <meshStandardMaterial color="#dcd8d0" roughness={0.8} />
      </mesh>
    </group>
  );
};

export const Tree: React.FC<{ x: number; z: number; s: number }> = ({ x, z, s }) => (
  <group position={[x, 0.25, z]}>
    <mesh position={[0, 0.45 * s, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.9 * s, 10]} />
      <meshStandardMaterial color="#8a6a4f" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.15 * s, 0]} castShadow>
      <icosahedronGeometry args={[0.55 * s, 2]} />
      <meshStandardMaterial color="#79c49b" roughness={0.75} flatShading />
    </mesh>
  </group>
);

const Street: React.FC<{ f: number }> = ({ f }) => {
  const tex = useMemo(() => windowTex(), []);
  const W = BLOCK.hw * 2;
  const rings = useMemo(() => {
    const rnd = prng(907);
    return Array.from({ length: 16 }, () => ({ x: -5.6 + rnd() * 11.2, z: ROAD.z0 + 0.3 + rnd() * (ROAD.z1 - ROAD.z0 - 0.6), ph: rnd() }));
  }, []);
  return (
    <group>
      {/* road + sidewalks */}
      <mesh position={[0, -0.02, (ROAD.z0 + ROAD.z1) / 2]} receiveShadow>
        <boxGeometry args={[W, 0.04, ROAD.z1 - ROAD.z0]} />
        <meshStandardMaterial color={P.asphalt} roughness={0.6} />
      </mesh>
      {[
        [ROAD.z1, BLOCK.front],
        [BLOCK.back, ROAD.z0],
      ].map(([z0, z1], i) => (
        <mesh key={i} position={[0, 0.125, (z0 + z1) / 2]} castShadow receiveShadow>
          <boxGeometry args={[W, 0.25, z1 - z0]} />
          <meshStandardMaterial color={P.paver} roughness={0.85} />
        </mesh>
      ))}
      {/* flood water over the road, up to the curbs */}
      <mesh position={[0, 0.11, (ROAD.z0 + ROAD.z1) / 2]}>
        <boxGeometry args={[W - 0.01, 0.22, ROAD.z1 - ROAD.z0 - 0.01]} />
        <meshPhysicalMaterial color="#6fb0dd" roughness={0.04} metalness={0.1} transparent opacity={0.8} emissive="#3f86bf" emissiveIntensity={0.18} clearcoat={1} />
      </mesh>
      {/* puddles on the sidewalk */}
      {[[-3.6, 3.1, 0.9], [4.2, 3.3, 0.7], [0.8, -2.6, 0.6]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.252, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 32]} />
          <meshPhysicalMaterial color="#8fbfdf" roughness={0.03} clearcoat={1} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* rain ripples on the flood */}
      {rings.map((r, i) => {
        const t = ((r.ph + f * 0.03) % 1 + 1) % 1;
        return (
          <mesh key={i} position={[r.x, 0.205, r.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05 + t * 0.4, 0.08 + t * 0.4, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55 * (1 - t)} />
          </mesh>
        );
      })}
      {/* half-submerged car */}
      <group position={[2.4, 0.02, 0.7]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <primitive object={new RoundedBoxGeometry(2.0, 0.6, 1.0, 3, 0.16)} attach="geometry" />
          <meshPhysicalMaterial color="#ef7a43" roughness={0.35} clearcoat={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.95, 0]} castShadow>
          <primitive object={new RoundedBoxGeometry(1.1, 0.45, 0.9, 3, 0.14)} attach="geometry" />
          <meshPhysicalMaterial color="#1c2630" roughness={0.1} clearcoat={1} />
        </mesh>
      </group>
      {/* station entrance: raised threshold with steps and canopy */}
      <group position={[-3.9, 0.25, 3.05]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.5, 1.5]} />
          <meshStandardMaterial color="#e9e5dd" roughness={0.8} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[1.3 + k * 0.0, 0.08 + k * 0.16, 0.45 - k * 0.0]} castShadow>
            <boxGeometry args={[0.4 - k * 0.12, 0.16, 1.0]} />
            <meshStandardMaterial color="#d6d1c7" roughness={0.85} />
          </mesh>
        ))}
        {[[-0.95, -0.6], [0.95, -0.6], [-0.95, 0.6], [0.95, 0.6]].map(([x, z], k) => (
          <mesh key={`p${k}`} position={[x, 1.0, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 10]} />
            <meshStandardMaterial color="#8b9196" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.55, 0]} castShadow>
          <primitive object={new RoundedBoxGeometry(2.5, 0.14, 1.7, 2, 0.05)} attach="geometry" />
          <meshStandardMaterial color={P.mint} roughness={0.5} />
        </mesh>
      </group>
      {/* buildings on the back sidewalk */}
      <Building x={-4.6} z={-3.0} w={2.6} d={1.8} h={3.6} tex={tex} />
      <Building x={-1.6} z={-3.1} w={2.4} d={1.6} h={4.8} tex={tex} />
      <Building x={1.3} z={-3.0} w={2.2} d={1.8} h={3.0} tex={tex} />
      <Building x={4.4} z={-3.0} w={2.8} d={1.8} h={4.2} tex={tex} />
      <Tree x={-1.6} z={3.3} s={1} />
      <Tree x={0.8} z={3.4} s={0.85} />
      {/* street drain grate where the pump discharge comes up */}
      <mesh position={[4.65, 0.256, 3.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial color="#3d4144" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  );
};

// ---------- rain ----------
const Rain: React.FC<{ f: number }> = ({ f }) => {
  const geo = useMemo(() => new BufferGeometry(), []);
  useLayoutEffect(() => {
    const rnd = prng(3601);
    const N = 650, pos: number[] = [];
    const H = 5.6;
    for (let i = 0; i < N; i++) {
      const x = -8.5 + rnd() * 17, z = -6 + rnd() * 12;
      const y0 = rnd() * H;
      const y = ((y0 - f * 0.55) % H + H) % H + 0.3;
      const len = 0.45 + rnd() * 0.5;
      pos.push(x, y, z, x - len * 0.18, y + len, z - len * 0.05);
    }
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.computeBoundingSphere();
  }, [f, geo]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#5a7d99" transparent opacity={0.7} />
    </lineSegments>
  );
};

// ---------- environment + lights ----------
export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    const bg = canvasTex(4, 512, (g) => {
      const grd = g.createLinearGradient(0, 0, 0, 512);
      grd.addColorStop(0, "#b3c2ce");
      grd.addColorStop(0.42, "#dde2e4");
      grd.addColorStop(1, P.bg);
      g.fillStyle = grd;
      g.fillRect(0, 0, 4, 512);
    });
    scene.background = bg;
    return () => {
      pm.dispose();
      scene.environment = null;
      scene.background = new Color(P.bg);
    };
  }, [gl, scene]);
  return null;
};

export const World: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Env />
    <hemisphereLight args={["#eef3f7", "#b9a68f", 0.9]} />
    <directionalLight
      position={[-18, 30, 26]}
      intensity={2.4}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-near={5}
      shadow-camera-far={90}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[20, 6, 18]} intensity={0.7} color="#dfe9f2" />
    {/* warm, dry tunnel light */}
    <pointLight position={[-0.6, TUNNEL.y + 1.6, 3.3]} intensity={9} distance={9} decay={2} color="#ffe2a8" />
    <pointLight position={[0.8, TUNNEL.y - 0.8, 3.6]} intensity={5} distance={7} decay={2} color="#fff0d2" />
    {/* cool light in the sump */}
    <pointLight position={[2.5, -12.0, 3.6]} intensity={3} distance={4} decay={2} color="#cfe8ff" />
    <Soil />
    <Lining />
    <Invert />
    <Train />
    <Sump f={f} />
    <Groundwater f={f} />
    <Street f={f} />
    <Rain f={f} />
  </group>
);
