// EP05 Galata: reusable 3D pieces for the map table (cover now, full film in Stage B).
// Pure functions of their props; no randomness outside seeded prng.
import React, { useMemo } from "react";
import * as THREE from "three";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";
import {
  CHAIN_CITY, CHAIN_GALATA, HORN_WALL, LAND_WALL, MAP_H, MAP_W, PAL, SEA_WALL, getWorld, v3, w3, type P2,
} from "./world.ts";

export const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
export const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};
const radial = (rgb: string, a: number) =>
  canvasTex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(0.45, `rgba(${rgb},${a * 0.4})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

// ---------- table + paper map ----------
export const Table: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 1024, (c) => {
        c.fillStyle = "#241b14";
        c.fillRect(0, 0, 1024, 1024);
        const rnd = prng(31);
        for (let i = 0; i < 260; i++) {
          const y = rnd() * 1024;
          c.strokeStyle = `rgba(${rnd() < 0.5 ? "10,7,4" : "66,48,32"},${0.08 + rnd() * 0.18})`;
          c.lineWidth = 1 + rnd() * 5;
          c.beginPath();
          c.moveTo(0, y);
          for (let x = 0; x <= 1024; x += 64) c.lineTo(x, y + Math.sin(x * 0.004 + i) * 6);
          c.stroke();
        }
      }),
    [],
  );
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshPhysicalMaterial map={tex} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.4} />
    </mesh>
  );
};

export const PaperMap: React.FC = () => {
  const { tex, geo } = getWorld();
  const grain = useSurfaceGrain(55, 0.3, 6);
  return (
    <group>
      <mesh position={[0, -0.022, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[MAP_W + 0.2, 0.03, MAP_H + 0.2]} radius={0.012} />
        <meshPhysicalMaterial {...POLISH.paper} color="#3a2e24" />
      </mesh>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshPhysicalMaterial {...POLISH.paper} map={tex} roughnessMap={grain} bumpMap={grain} bumpScale={0.5} />
      </mesh>
    </group>
  );
};

// ---------- walls + towers ----------
const Tower: React.FC<{ at: THREE.Vector3; r: number; h: number; color?: string }> = ({ at, r, h, color = "#b7a284" }) => (
  <group position={at}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r * 1.08, h, 14]} />
      <meshPhysicalMaterial {...POLISH.stone} color={color} />
    </mesh>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * r * 0.86, h + r * 0.18, Math.sin(a) * r * 0.86]} castShadow>
          <boxGeometry args={[r * 0.36, r * 0.36, r * 0.36]} />
          <meshPhysicalMaterial {...POLISH.stone} color={color} />
        </mesh>
      );
    })}
  </group>
);

const WallLine: React.FC<{ pts: P2[]; h: number; w: number; towerEvery: number }> = ({ pts, h, w, towerEvery }) => {
  const segs = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => v3(x, y, 0)), false, "centripetal");
    const len = curve.getLength();
    const n = Math.max(2, Math.floor(len / 0.09));
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      const p = curve.getPointAt(t);
      const d = curve.getTangentAt(t);
      return { p, rot: Math.atan2(-d.z, d.x), tower: i % towerEvery === 0, l: len / n };
    });
  }, [pts, towerEvery]);
  return (
    <group>
      {segs.map(({ p, rot, tower, l }, i) => (
        <group key={i}>
          <mesh position={[p.x, p.y + h / 2, p.z]} rotation={[0, rot, 0]} castShadow receiveShadow>
            <boxGeometry args={[l * 1.02, h, w]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#b09878" />
          </mesh>
          {tower ? <Tower at={p} r={w * 1.25} h={h * 1.5} /> : null}
        </group>
      ))}
    </group>
  );
};

export const Walls: React.FC = () => (
  <group>
    <WallLine pts={LAND_WALL} h={0.07} w={0.05} towerEvery={4} />
    <WallLine pts={HORN_WALL} h={0.05} w={0.035} towerEvery={5} />
    <WallLine pts={SEA_WALL} h={0.045} w={0.035} towerEvery={6} />
  </group>
);

// ---------- town blocks (instanced, seeded) ----------
export const Town: React.FC<{ seed: number; center: P2; rx: number; ry: number; n: number; rot?: number }> = ({ seed, center, rx, ry, n, rot = 0 }) => {
  const { landAt } = getWorld();
  const mesh = useMemo(() => {
    const rnd = prng(seed * 9973 + 17);
    for (let i = 0; i < 12; i++) rnd(); // small seeds start correlated: warm up
    const m = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff" }),
      n,
    );
    m.castShadow = true;
    m.receiveShadow = true;
    const o = new THREE.Object3D();
    const cols = ["#d8c6a4", "#cdb48d", "#b8805c", "#e3d5b8", "#d2bf9a", "#a86f4f", "#e0cfae"].map((c) => new THREE.Color(c));
    let k = 0;
    for (let i = 0; i < n * 4 && k < n; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const lx = Math.cos(a) * r * rx, ly = Math.sin(a) * r * ry;
      const x = center[0] + lx * Math.cos(rot) - ly * Math.sin(rot);
      const y = center[1] + lx * Math.sin(rot) + ly * Math.cos(rot);
      if (landAt(x, y) < 0.9) continue;
      const p = v3(x, y, 0);
      const w = 0.025 + rnd() * 0.035, d = 0.025 + rnd() * 0.035, h = 0.015 + rnd() * 0.03;
      o.position.set(p.x, p.y + h / 2, p.z);
      o.rotation.set(0, rot + (rnd() - 0.5) * 0.3, 0);
      o.scale.set(w, h, d);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
      m.setColorAt(k, cols[Math.floor(rnd() * cols.length)]);
      k++;
    }
    m.count = k;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    // gable roofs (Stage A note: plain cubes read as dice): one terracotta prism per house
    const roof = new THREE.InstancedMesh(roofGeo(), new THREE.MeshPhysicalMaterial({ ...POLISH.clay, color: "#ffffff" }), k);
    roof.castShadow = true;
    roof.receiveShadow = true;
    const rcols = ["#a4573a", "#b8673f", "#8e4a33", "#c27a4e", "#9b5a3c"].map((c) => new THREE.Color(c));
    const mm = new THREE.Matrix4(), pp = new THREE.Vector3(), qq = new THREE.Quaternion(), ss = new THREE.Vector3();
    for (let i = 0; i < k; i++) {
      m.getMatrixAt(i, mm);
      mm.decompose(pp, qq, ss);
      o.position.set(pp.x, pp.y + ss.y / 2 - 0.001, pp.z);
      o.quaternion.copy(qq);
      o.scale.set(ss.x * 1.12, Math.min(ss.x, ss.z) * 0.55, ss.z * 1.12);
      o.updateMatrix();
      roof.setMatrixAt(i, o.matrix);
      roof.setColorAt(i, rcols[i % rcols.length]);
    }
    roof.instanceMatrix.needsUpdate = true;
    if (roof.instanceColor) roof.instanceColor.needsUpdate = true;
    const g = new THREE.Group();
    g.add(m, roof);
    return g;
  }, [seed, center, rx, ry, n, rot, landAt]);
  return <primitive object={mesh} />;
};

/** Unit gable prism: base 1 x 1 on y = 0, ridge along local X at y = 1. */
let ROOF: THREE.BufferGeometry | null = null;
const roofGeo = () => {
  if (ROOF) return ROOF;
  const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3);
  g.rotateZ(Math.PI / 2);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0.5, 0);
  g.scale(1, 1 / 1.5, 1 / 1.732);
  g.computeVertexNormals();
  ROOF = g;
  return g;
};

/** Galata Tower (Genoese, 1348; register #10): stone drum with a conical cap. */
export const GalataTowerModel: React.FC<{ at: P2 }> = ({ at }) => {
  const p = v3(at[0], at[1], 0);
  return (
    <group position={p}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.32, 20]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#c2ad8c" />
      </mesh>
      <mesh position={[0, 0.335, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.056, 0.03, 20]} />
        <meshPhysicalMaterial {...POLISH.stone} color="#a99273" />
      </mesh>
      <mesh position={[0, 0.41, 0]} castShadow>
        <coneGeometry args={[0.064, 0.13, 20]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#6f4a37" />
      </mesh>
    </group>
  );
};

// ---------- the chain across the Golden Horn (register #5–#8) ----------
export const HarborChain: React.FC<{ frame: number; scale?: number }> = ({ frame, scale = 1 }) => {
  const grain = useSurfaceGrain(91, 0.35, 2);
  const links = useMemo(() => {
    const a = w3(CHAIN_CITY[0], CHAIN_CITY[1]), b = w3(CHAIN_GALATA[0], CHAIN_GALATA[1]);
    const len = a.distanceTo(b);
    const linkL = 0.07 * scale;
    const n = Math.floor(len / (linkL * 0.72));
    const dir = new THREE.Vector3().subVectors(b, a).normalize();
    const yaw = Math.atan2(-dir.z, dir.x);
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      const p = new THREE.Vector3().lerpVectors(a, b, t);
      const sag = Math.sin(t * Math.PI);
      return { p, yaw, i, float: i % 4 === 2, sag };
    });
  }, [scale]);
  const iron = { ...POLISH.stone, metalness: 0.85, roughness: 0.42, color: "#5a4c40" } as const;
  return (
    <group>
      {links.map(({ p, yaw, i, float, sag }) => {
        const bob = Math.sin(frame * 0.05 + i * 0.6) * 0.004;
        const y = 0.03 * scale + bob - sag * 0.006;
        return (
          <group key={i} position={[p.x, y, p.z]} rotation={[0, yaw, 0]}>
            <mesh rotation={[i % 2 ? Math.PI / 2 : 0, 0, 0]} scale={[1.55, 1, 1]} castShadow>
              <torusGeometry args={[0.022 * scale, 0.0075 * scale, 10, 20]} />
              <meshPhysicalMaterial {...iron} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} />
            </mesh>
            {float ? (
              <mesh position={[0, -0.016 * scale, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.02 * scale, 0.02 * scale, 0.13 * scale, 14]} />
                <meshPhysicalMaterial {...POLISH.stone} color="#6b4a2e" roughnessMap={grain} />
              </mesh>
            ) : null}
          </group>
        );
      })}
      <Tower at={w3(CHAIN_CITY[0], CHAIN_CITY[1])} r={0.05} h={0.16} color="#bba584" />
      <Tower at={w3(CHAIN_GALATA[0], CHAIN_GALATA[1])} r={0.05} h={0.16} color="#bba584" />
    </group>
  );
};

// ---------- ships (light galleys: fusta/bireme; register #22, #26, #28) ----------
const sailTex = () =>
  canvasTex(256, 256, (c) => {
    c.fillStyle = "#efe2c4";
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = "rgba(163,40,43,0.85)";
    c.fillRect(0, 96, 256, 34);
    c.strokeStyle = "rgba(120,90,60,0.35)";
    c.lineWidth = 3;
    for (let x = 0; x <= 256; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke(); }
  });
let SAIL_TEX: THREE.Texture | null = null;
const sailGeo = (() => {
  let g: THREE.PlaneGeometry | null = null;
  return () => {
    if (g) return g;
    g = new THREE.PlaneGeometry(1, 1, 12, 12);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5;
      p.setZ(i, 0.16 * (1 - (2 * u - 1) ** 2) * (0.35 + 0.65 * v));
    }
    g.computeVertexNormals();
    return g;
  };
})();
const hullGeo = (() => {
  let g: THREE.BufferGeometry | null = null;
  return () => {
    if (g) return g;
    const s = new THREE.SphereGeometry(0.5, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    s.scale(1, 0.5, 0.21);
    g = s;
    return g;
  };
})();

/** One ship, length ~`L` world units, bow along +X. `oarsUp` lifts the oars (rowing in the air on land).
 *  Stage B: deeper hull with a light wale, a ram at the bow and a raised stern, so it reads as a galley
 *  and not a deck. `lod` drops the oars for distant fleets; `rollers` turns the cradle rollers (rad). */
export const Ship: React.FC<{ L?: number; sail?: number; oarsUp?: boolean; onCradle?: boolean; frame: number; seed: number; lod?: boolean; rollers?: number }> = ({
  L = 0.34, sail = 1, oarsUp = false, onCradle = false, frame, seed, lod = false, rollers = 0,
}) => {
  SAIL_TEX ??= sailTex();
  const sway = Math.sin(frame * 0.06 + seed) * 0.05;
  const oar = Math.sin(frame * 0.12 + seed) * 0.25;
  const wood = { ...POLISH.stone, roughness: 0.55 } as const;
  return (
    <group scale={L}>
      <group position={[0, onCradle ? 0.355 : 0.17, 0]}>
        {/* hull */}
        <mesh geometry={hullGeo()} castShadow receiveShadow>
          <meshPhysicalMaterial {...POLISH.toyPlastic} roughness={0.62} clearcoat={0.25} color="#5e3b22" />
        </mesh>
        {/* wales (light strakes) along both sides */}
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[0, -0.035, sd * 0.098]} castShadow>
            <RoundedBoxGeo args={[0.86, 0.035, 0.014]} radius={0.006} />
            <meshPhysicalMaterial {...wood} color="#c79a62" />
          </mesh>
        ))}
        {/* ram at the bow, raised stern post */}
        <mesh position={[0.54, -0.03, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.03, 0.16, 10]} />
          <meshPhysicalMaterial {...wood} color="#4a2e1a" />
        </mesh>
        <mesh position={[-0.47, 0.06, 0]} rotation={[0, 0, -0.5]} castShadow>
          <RoundedBoxGeo args={[0.05, 0.2, 0.06]} radius={0.015} />
          <meshPhysicalMaterial {...wood} color="#4a2e1a" />
        </mesh>
        {/* deck + stern cabin */}
        <mesh position={[0, 0.005, 0]} castShadow>
          <RoundedBoxGeo args={[0.92, 0.03, 0.2]} radius={0.01} />
          <meshPhysicalMaterial {...wood} color="#a8835a" />
        </mesh>
        <mesh position={[-0.36, 0.07, 0]} castShadow>
          <RoundedBoxGeo args={[0.14, 0.11, 0.17]} radius={0.02} />
          <meshPhysicalMaterial {...wood} color="#7b5536" />
        </mesh>
        {/* mast, yard, sail */}
        <mesh position={[0.06, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.018, 0.9, 8]} />
          <meshPhysicalMaterial {...wood} color="#5a3d26" />
        </mesh>
        <group position={[0.06, 0.66 * sail + 0.2 * (1 - sail), 0]} rotation={[0, Math.PI / 2 + sway, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.84, 6]} />
            <meshPhysicalMaterial {...wood} color="#5a3d26" />
          </mesh>
          {sail > 0.04 ? (
            <mesh geometry={sailGeo()} scale={[0.78, 0.62 * sail, 1]} position={[0, 0.2 - 0.31 * sail, 0.01]} castShadow>
              <meshPhysicalMaterial {...POLISH.fabric} map={SAIL_TEX} side={THREE.DoubleSide} />
            </mesh>
          ) : null}
        </group>
        {/* pennant */}
        <mesh position={[0.1, 0.86, 0]} rotation={[0, sway * 2, 0]} castShadow>
          <planeGeometry args={[0.12, 0.04]} />
          <meshPhysicalMaterial {...POLISH.fabric} color={PAL.red} side={THREE.DoubleSide} />
        </mesh>
        {/* oars, both sides */}
        {lod
          ? null
          : [-1, 1].map((side) =>
              Array.from({ length: 6 }, (_, i) => (
                <group key={`${side}-${i}`} position={[-0.3 + i * 0.11, 0.0, side * 0.1]} rotation={[side * (oarsUp ? 0.5 + oar : -0.35), 0, 0]}>
                  <mesh position={[0, 0, side * 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.005, 0.005, 0.28, 5]} />
                    <meshPhysicalMaterial {...wood} color="#c39a6b" />
                  </mesh>
                </group>
              )),
            )}
      </group>
      {onCradle ? (
        <group>
          {/* wooden cradle (two chocks hug the hull) and two greased rollers */}
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <RoundedBoxGeo args={[0.72, 0.05, 0.26]} radius={0.012} />
            <meshPhysicalMaterial {...wood} color="#8a6440" />
          </mesh>
          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.15, 0]} castShadow>
              <RoundedBoxGeo args={[0.06, 0.1, 0.26]} radius={0.012} />
              <meshPhysicalMaterial {...wood} color="#7a5634" />
            </mesh>
          ))}
          {[-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 0.03, 0]} rotation={[Math.PI / 2, rollers, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.34, 12]} />
              <meshPhysicalMaterial {...wood} color="#5c3f27" roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.2} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

// ---------- land route (glowing line + timber track) ----------
export const routeCurve = (pts: P2[], lift: number) =>
  new THREE.CatmullRomCurve3(pts.map(([x, y]) => v3(x, y, lift)), false, "centripetal");

export const LandRoute: React.FC<{ pts: P2[]; progress: number; frame: number }> = ({ pts, progress, frame }) => {
  const { tube, sleepers, head } = useMemo(() => {
    const curve = routeCurve(pts, 0.018);
    const tube = new THREE.TubeGeometry(curve, 200, 0.012, 8, false);
    const len = curve.getLength();
    const n = Math.floor(len / 0.06);
    const sleepers = Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      const p = curve.getPointAt(t);
      const d = curve.getTangentAt(t);
      return { p, rot: Math.atan2(-d.z, d.x), t };
    });
    const hp = curve.getPointAt(1);
    const hd = curve.getTangentAt(1);
    return { tube, sleepers, head: { p: hp, rot: Math.atan2(-hd.z, hd.x) } };
  }, [pts]);
  const glow = 2.2 + Math.sin(frame * 0.1) * 0.4;
  const count = Math.floor(tube.index!.count * Math.min(1, Math.max(0, progress)) / 6) * 6;
  tube.setDrawRange(0, count);
  return (
    <group>
      {sleepers.map(({ p, rot, t }, i) =>
        t <= progress ? (
          <mesh key={i} position={[p.x, p.y - 0.008, p.z]} rotation={[0, rot + Math.PI / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.11, 0.01, 0.02]} />
            <meshPhysicalMaterial {...POLISH.stone} color="#7a5634" roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
          </mesh>
        ) : null,
      )}
      <mesh geometry={tube} renderOrder={5}>
        <meshStandardMaterial color={PAL.route} emissive={PAL.route} emissiveIntensity={glow} toneMapped={false} />
      </mesh>
      {count > 0 && progress >= 0.999 ? (
        <group position={[head.p.x, head.p.y + 0.01, head.p.z]} rotation={[0, head.rot, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.05, 0.12, 3]} />
            <meshStandardMaterial color={PAL.route} emissive={PAL.route} emissiveIntensity={glow} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Ship placed on the land route at parameter t (0 = Bosporus, 1 = Golden Horn), pitched with the slope. */
export const ShipOnRoute: React.FC<{ pts: P2[]; t: number; frame: number; seed: number; L?: number; sail?: number; lod?: boolean }> = ({ pts, t, frame, seed, L = 0.3, sail = 1, lod = false }) => {
  const { p, yaw, pitch } = useMemo(() => {
    const curve = routeCurve(pts, 0.0);
    const p = curve.getPointAt(t);
    const d = curve.getTangentAt(t);
    return { p, yaw: Math.atan2(-d.z, d.x), pitch: Math.asin(Math.max(-1, Math.min(1, d.y))) };
  }, [pts, t]);
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <group rotation={[0, 0, pitch]}>
        <Ship L={L} sail={sail} lod={lod} oarsUp onCradle frame={frame} seed={seed} rollers={t * 40} />
      </group>
    </group>
  );
};

/** Ship afloat at a map point, heading `deg` (0 = east). */
export const ShipAfloat: React.FC<{ at: P2; deg: number; frame: number; seed: number; L?: number; sail?: number; lod?: boolean }> = ({ at, deg, frame, seed, L = 0.26, sail = 0.6, lod = false }) => {
  const p = w3(at[0], at[1], -0.004 + Math.sin(frame * 0.05 + seed) * 0.003);
  return (
    <group position={p} rotation={[0, (deg * Math.PI) / 180, Math.sin(frame * 0.04 + seed) * 0.03]}>
      <Ship L={L} sail={sail} lod={lod} frame={frame} seed={seed} />
    </group>
  );
};

// ---------- paper tags (3D, tilted to camera, cream halo) ----------
export type TagSpec = { at: P2; off: [number, number]; lift: number; title: string; sub?: string; w: number; accent?: string; tilt: number; water?: boolean; face?: number };
/** `face`: yaw (rad) the card turns to, so it faces an orbiting camera (0 = south, the cover). */
export const Tag: React.FC<TagSpec> = ({ at, off, lift, title, sub, w, accent, tilt, water, face = 0 }) => {
  const H = sub ? 0.46 * (w / 1.1) : 0.3 * (w / 1.1);
  const tex = useMemo(() => {
    const cw = 1024, ch = Math.round(1024 * (H / w));
    return canvasTex(cw, ch, (c) => {
      const pad = 24;
      c.shadowColor = "rgba(244,234,210,0.9)";
      c.shadowBlur = 26;
      rr(c, pad, pad, cw - 2 * pad, ch - 2 * pad, 24);
      c.fillStyle = PAL.cream;
      c.fill();
      c.shadowBlur = 0;
      c.lineWidth = 6;
      c.strokeStyle = PAL.ink;
      rr(c, pad + 14, pad + 14, cw - 2 * pad - 28, ch - 2 * pad - 28, 14);
      c.stroke();
      c.fillStyle = PAL.ink;
      c.textAlign = "center";
      c.textBaseline = "middle";
      let ts = sub ? ch * 0.3 : ch * 0.46;
      c.font = `600 ${ts}px ${FONT}`;
      while (c.measureText(title).width > cw - 2 * pad - 120) { ts *= 0.95; c.font = `600 ${ts}px ${FONT}`; }
      (c as unknown as { letterSpacing: string }).letterSpacing = `${ts * 0.08}px`;
      c.fillText(title, cw / 2, sub ? ch * 0.36 : ch / 2 + 2);
      if (sub) {
        const bh = ch * 0.3, by = ch * 0.54;
        c.fillStyle = accent ?? PAL.red;
        rr(c, pad + 44, by, cw - 2 * pad - 88, bh, 10);
        c.fill();
        c.fillStyle = "#fff6e6";
        let ss = bh * 0.64;
        c.font = `600 ${ss}px ${FONT}`;
        (c as unknown as { letterSpacing: string }).letterSpacing = "0px";
        while (c.measureText(sub).width > cw - 2 * pad - 130) { ss *= 0.95; c.font = `600 ${ss}px ${FONT}`; }
        (c as unknown as { letterSpacing: string }).letterSpacing = `${ss * 0.05}px`;
        c.fillText(sub, cw / 2, by + bh / 2 + 2);
      }
    });
  }, [title, sub, w, H, accent]);
  const base = water ? w3(at[0], at[1], 0.02) : v3(at[0], at[1], 0);
  const top = water ? w3(at[0] + off[0], at[1] + off[1], lift) : v3(at[0] + off[0], at[1] + off[1], lift);
  const stemEnd = new THREE.Vector3(top.x, top.y - H * 0.4, top.z);
  const stemV = new THREE.Vector3().subVectors(stemEnd, base);
  return (
    <group>
      <mesh position={[base.x, base.y + 0.02, base.z]} castShadow>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshPhysicalMaterial color="#b8892f" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh
        position={[(base.x + stemEnd.x) / 2, (base.y + stemEnd.y) / 2, (base.z + stemEnd.z) / 2]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), stemV.clone().normalize())}
        castShadow
      >
        <cylinderGeometry args={[0.005, 0.005, stemV.length(), 6]} />
        <meshStandardMaterial color="#3a2f26" />
      </mesh>
      <group position={top} rotation={[0, face, 0]}>
        <mesh rotation={[-tilt, 0, 0]} castShadow renderOrder={6}>
          <planeGeometry args={[w, H]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.02} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

/** Warm pool of light texture (for lamp glow on the table). */
export const useGlow = () => useMemo(() => radial("255,170,80", 0.7), []);
