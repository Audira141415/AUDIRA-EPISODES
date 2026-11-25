// EP02 Jari Keriput — 3D parts in the NANOFORGE recipe: a wet microscopic world inside the fingertip
// (microscopy void, hydrated translucent membranes, gold nerve signal, ruby blood, glossy ball-and-stick
// water molecules, Brownian solutes everywhere). Real GLB models (hand, tire, marble, microscope) come from
// public/models/ep02 via <AssetModel> in JariFilm; the tissue close-ups are procedural because no catalogue
// model shows the inside of a fingertip.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { NANO_PALETTE as N } from "../../kits/nanoforge/lib/palette";
import { CellularVesicle } from "../../kits/nanoforge/cellular/CellularVesicle";
import { prng, seg, lerp, clamp } from "./timing";

export const SKIN = "#f2b8a6";
export const SKIN_DEEP = "#c9806c";
export const FAT = "#f7c98a";
export const NERVE = N.adenineGold;
export const BLOOD = N.guanineRuby;
export const CYAN = N.thymineCyan;

/** Brownian offset (seconds clock), small amplitude: nothing in the micro world is ever still. */
export const drift = (t: number, ph: number, amp = 0.06): [number, number, number] => [
  Math.sin(t * 0.7 + ph) * amp,
  Math.sin(t * 0.53 + ph * 1.7) * amp,
  Math.sin(t * 0.61 + ph * 2.3) * amp * 0.6,
];

// ───────────────────────── environment ─────────────────────────

const SOLUTES = 220;
/** Microscopy void: fog, far vesicles (BG) and drifting solute particles (FG/MG). `warm` tints toward the outro. */
export const NanoEnv: React.FC<{ t: number; warm?: number; vesicles?: boolean }> = ({ t, warm = 0, vesicles = true }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = prng(202);
    return Array.from({ length: SOLUTES }, () => ({ x: (r() - 0.5) * 16, y: (r() - 0.5) * 12, z: -9 + r() * 14, ph: r() * 6.28, s: 0.4 + r() * 1.2, v: 0.08 + r() * 0.18 }));
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    data.forEach((d, i) => {
      const y = ((d.y + t * d.v + 6) % 12) - 6;
      o.position.set(d.x + Math.sin(t * 0.4 + d.ph) * 0.25, y, d.z + Math.cos(t * 0.3 + d.ph) * 0.2);
      o.scale.setScalar(0.022 * d.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, data]);
  const col = useMemo(() => new THREE.Color(), []);
  col.set(CYAN).lerp(new THREE.Color(N.lipidAmber), warm);
  const fogCol = useMemo(() => new THREE.Color(), []);
  fogCol.set(N.fluidAmbient).lerp(new THREE.Color("#3a2408"), warm * 0.8);
  const f = t * 60;
  return (
    <group>
      <fog attach="fog" args={[fogCol, 7, 26]} />
      <instancedMesh ref={ref} args={[undefined, undefined, SOLUTES]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={col} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      {vesicles ? (
        <group>
          <CellularVesicle f={f} initialPos={[-4.2, 3.4, -7]} radius={1.2} color={N.membraneGlow} />
          <CellularVesicle f={f + 300} initialPos={[4.4, -2.6, -8]} radius={1.5} color={warm > 0.5 ? N.lipidAmber : N.thymineCyan} />
          <CellularVesicle f={f + 700} initialPos={[3.6, 4.6, -6]} radius={0.8} color={N.cytosineViolet} />
          <CellularVesicle f={f + 1100} initialPos={[-3.8, -3.8, -6.5]} radius={0.9} color={N.guanineRuby} />
        </group>
      ) : null}
    </group>
  );
};

/** NANOFORGE light rig: electron-beam key, cyan / ruby rims and a gold fill. */
export const NanoLights: React.FC<{ warm?: number; ruby?: number }> = ({ warm = 0, ruby = 2.4 }) => (
  <group>
    <ambientLight intensity={1.0} color={N.fluidAmbient} />
    <directionalLight position={[4, 10, 6]} intensity={2.4} color={warm > 0.3 ? "#ffe2b8" : "#c7d2fe"} castShadow />
    <pointLight position={[-5, 3, -3]} intensity={30} distance={16} decay={1.6} color={CYAN} />
    <pointLight position={[5, -2, 2]} intensity={ruby * 10} distance={16} decay={1.6} color={N.guanineRuby} />
    <pointLight position={[0, 0, -2]} intensity={15 + warm * 40} distance={10} decay={1.6} color={N.adenineGold} />
    <pointLight position={[0, 3, 4]} intensity={warm * 40} distance={12} decay={1.6} color="#ffb45a" />
  </group>
);

/** Water surface seen from just under/over it: translucent sheet + ripple rings. */
export const Water: React.FC<{ t: number; y?: number; radius?: number; warm?: number }> = ({ t, y = 0, radius = 4, warm = 0 }) => {
  const col = useMemo(() => new THREE.Color(), []);
  col.set("#0b4a66").lerp(new THREE.Color("#c27a24"), warm * 0.7);
  const ring = warm > 0.5 ? "#ffe2b0" : CYAN;
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 96]} />
        <meshPhysicalMaterial color={col} roughness={0.08} metalness={0} clearcoat={1} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const k = (t * 0.45 + i / 4) % 1;
        const r = 0.3 + k * (radius - 0.4);
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[r, r + 0.03, 96]} />
            <meshBasicMaterial color={ring} transparent opacity={0.55 * (1 - k)} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Canvas texture with text, for the in-world microscope slide label ("AUDIRA LAB"). */
const labelTexture = (lines: string[], w = 1024, h = 256, color: string = CYAN) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#040d21";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = color;
  g.lineWidth = 8;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = color;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "900 104px Arial, sans-serif";
  g.fillText(lines[0], w / 2, lines[1] ? h * 0.4 : h / 2);
  if (lines[1]) {
    g.font = "700 46px Arial, sans-serif";
    g.fillStyle = "#e2e8f0";
    g.fillText(lines[1], w / 2, h * 0.78);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** Brand inside the world: a glass microscope slide with an "AUDIRA LAB" label. */
export const LabSign: React.FC<{ position: [number, number, number]; width?: number; rotation?: [number, number, number] }> = ({ position, width = 1.8, rotation = [0, 0, 0] }) => {
  const tex = useMemo(() => labelTexture(["AUDIRA LAB", "SAINS · EP02"]), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width * 1.5, width / 3.2, 0.03]} />
        <meshPhysicalMaterial color="#bfe9ff" roughness={0.05} transmission={0.8} ior={1.5} thickness={0.03} transparent opacity={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, width / 4]} />
        <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={0.95} />
      </mesh>
    </group>
  );
};

// ───────────────────────── molecules ─────────────────────────

/** Glossy ball-and-stick water molecule (O ruby, H white). */
export const H2O: React.FC<{ position: [number, number, number]; rotation?: [number, number, number]; scale?: number; opacity?: number }> = ({
  position,
  rotation = [0, 0, 0],
  scale = 0.12,
  opacity = 1,
}) => {
  const tr = opacity < 1;
  const a = (104.5 / 2) * (Math.PI / 180);
  const hx = Math.sin(a) * 1.25;
  const hy = -Math.cos(a) * 1.25;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.75, 24, 18]} />
        <meshPhysicalMaterial color={N.guanineRuby} roughness={0.15} clearcoat={1} emissive={N.guanineRuby} emissiveIntensity={0.25} transparent={tr} opacity={opacity} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * hx, hy, 0]}>
            <sphereGeometry args={[0.45, 20, 14]} />
            <meshPhysicalMaterial color="#f8fafc" roughness={0.12} clearcoat={1} transparent={tr} opacity={opacity} />
          </mesh>
          <mesh position={[(s * hx) / 2, hy / 2, 0]} rotation={[0, 0, s * a]}>
            <cylinderGeometry args={[0.13, 0.13, 1.25, 10]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} transparent={tr} opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Salt ion (Na+ violet, Cl- cyan-green) with a soft glow halo. */
export const Ion: React.FC<{ position: [number, number, number]; kind: "na" | "cl"; scale?: number }> = ({ position, kind, scale = 0.12 }) => {
  const c = kind === "na" ? N.cytosineViolet : "#34d399";
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[kind === "na" ? 0.8 : 1.1, 24, 18]} />
        <meshPhysicalMaterial color={c} roughness={0.15} clearcoat={1} emissive={c} emissiveIntensity={0.45} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.6, 16, 12]} />
        <meshBasicMaterial color={c} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ───────────────────────── tissue ─────────────────────────

/** Groove field on the fingertip pad: 0 = smooth, 1 = deepest fold. Seeded so the same finger folds the same way. */
const groove = (theta: number, y: number, seed: number) => {
  const g1 = 1 - Math.abs(Math.sin(6 * theta + 1.6 * Math.sin(3.2 * y + seed) + seed * 0.7));
  const g2 = 1 - Math.abs(Math.sin(6.5 * y + 1.8 * Math.sin(2.3 * theta + seed * 1.3)));
  return Math.max(Math.pow(g1, 5), 0.75 * Math.pow(g2, 6));
};

/** Hydrated skin membrane: translucent, glossy, wet sheen; rims pick up the cyan / ruby lights. */
export const membraneSkin = (opacity = 1) =>
  new THREE.MeshPhysicalMaterial({
    color: SKIN,
    roughness: 0.28,
    metalness: 0,
    transmission: 0.45,
    ior: 1.33,
    thickness: 0.6,
    attenuationColor: new THREE.Color("#e07a6a"),
    attenuationDistance: 1.2,
    sheen: 0.8,
    sheenColor: new THREE.Color("#ffd9cb"),
    sheenRoughness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    transparent: opacity < 1,
    opacity,
  });

/**
 * Procedural fingertip membrane (pad facing +z, tip at +y). `wrinkle` 0…1 folds the pad; `nerve` 0…1 lights the
 * gold nerve inside; `broken` cuts the nerve (Lewis & Pickering 1935: no nerve, no wrinkles); `vessel` shows the
 * ruby capillary under the pad.
 */
export const Fingertip: React.FC<{
  wrinkle: number;
  nerve?: number;
  broken?: boolean;
  opacity?: number;
  seed?: number;
  ghost?: boolean;
  vessel?: number;
  t?: number;
}> = ({ wrinkle, nerve = 0, broken = false, opacity = 1, seed = 3, ghost = false, vessel = 0, t = 0 }) => {
  const geo = useMemo(() => new THREE.CapsuleGeometry(0.5, 1.5, 32, 72), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const mat = useMemo(() => membraneSkin(opacity), [opacity]);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    for (let i = 0; i < a.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      const z = base[i + 2];
      const len = Math.hypot(x, z) || 1;
      const theta = Math.atan2(x, z);
      const front = clamp((z / len + 0.35) / 0.9);
      const distal = clamp((y + 0.2) / 0.6);
      const d = 0.08 * wrinkle * groove(theta, y, seed) * front * distal;
      const swell = 1 - 0.035 * wrinkle * front * distal;
      a[i] = (x / len) * (len * swell - d);
      a[i + 1] = y;
      a[i + 2] = (z / len) * (len * swell - d);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, base, wrinkle, seed]);

  const nervePath = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(0, -1.9, 0.05), new THREE.Vector3(0.02, -0.8, 0.12), new THREE.Vector3(-0.02, 0.2, 0.16), new THREE.Vector3(0, 0.95, 0.22)]), []);
  const nerveTop = useMemo(() => new THREE.TubeGeometry(nervePath, 64, 0.05, 10, false), [nervePath]);
  const brokenA = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nervePath.getPoints(20).slice(0, 8)), 32, 0.05, 10, false), [nervePath]);
  const brokenB = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nervePath.getPoints(20).slice(12)), 32, 0.05, 10, false), [nervePath]);
  const branches = useMemo(
    () =>
      [-0.22, 0, 0.22].map(
        (dx) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.55, 0.2), new THREE.Vector3(dx * 0.7, 0.85, 0.3), new THREE.Vector3(dx, 1.1, 0.36)]), 16, 0.025, 8, false),
      ),
    [],
  );
  const capPath = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(0.18, -1.9, -0.05), new THREE.Vector3(0.22, -0.6, 0.0), new THREE.Vector3(0.15, 0.4, 0.08), new THREE.Vector3(-0.1, 0.9, 0.12), new THREE.Vector3(-0.2, 0.3, 0.0)]),
    [],
  );
  const capGeo = useMemo(() => new THREE.TubeGeometry(capPath, 64, 0.04, 8, false), [capPath]);
  const pulse = (t * 1.6) % 1;
  const pulseP = nervePath.getPoint(pulse);

  if (ghost) {
    return (
      <mesh geometry={geo}>
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.5} toneMapped={false} />
      </mesh>
    );
  }
  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow receiveShadow renderOrder={2} />
      {/* nail on the back */}
      <mesh position={[0, 0.72, -0.4]} rotation={[0.18, 0, 0]} scale={[0.36, 0.56, 0.12]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#f6d6cc" roughness={0.1} clearcoat={1} transmission={0.3} ior={1.5} transparent={opacity < 1} opacity={Math.min(1, opacity + 0.2)} />
      </mesh>
      {vessel > 0.01 ? (
        <mesh geometry={capGeo} renderOrder={3}>
          <meshBasicMaterial color={BLOOD} transparent opacity={vessel * 0.9} toneMapped={false} depthTest={false} />
        </mesh>
      ) : null}
      {nerve > 0.01 ? (
        <group renderOrder={3}>
          {broken ? (
            <>
              <mesh geometry={brokenA}>
                <meshBasicMaterial color={NERVE} transparent opacity={nerve} toneMapped={false} depthTest={false} />
              </mesh>
              <mesh geometry={brokenB}>
                <meshBasicMaterial color="#5b4a30" transparent opacity={nerve * 0.8} depthTest={false} />
              </mesh>
              <mesh position={nervePath.getPoint(0.5)} scale={0.12}>
                <sphereGeometry args={[1, 16, 12]} />
                <meshBasicMaterial color={N.laserScanning} transparent opacity={nerve * (0.6 + 0.4 * Math.sin(t * 9))} toneMapped={false} depthTest={false} />
              </mesh>
            </>
          ) : (
            <>
              <mesh geometry={nerveTop}>
                <meshBasicMaterial color={NERVE} transparent opacity={nerve} toneMapped={false} depthTest={false} />
              </mesh>
              {branches.map((b, i) => (
                <mesh key={i} geometry={b}>
                  <meshBasicMaterial color={NERVE} transparent opacity={nerve * 0.85} toneMapped={false} depthTest={false} />
                </mesh>
              ))}
              <mesh position={pulseP} scale={0.11}>
                <sphereGeometry args={[1, 16, 12]} />
                <meshBasicMaterial color="#fff1c9" transparent opacity={nerve} toneMapped={false} depthTest={false} />
              </mesh>
            </>
          )}
        </group>
      ) : null}
    </group>
  );
};

/** Skin cell layer (hexagonal translucent cells). `swell` = sponge myth, `reject` = water bounces off. */
export const SkinCells: React.FC<{ t: number; swell: number; reject: number }> = ({ t, swell, reject }) => {
  const cells = useMemo(() => {
    const out: { x: number; z: number; ph: number; row: number }[] = [];
    const r = prng(41);
    for (let row = 0; row < 3; row++)
      for (let i = -4; i <= 4; i++)
        for (let j = -2; j <= 2; j++) out.push({ x: i * 0.62 + (j % 2) * 0.31, z: j * 0.54, ph: r() * 6.28, row });
    return out;
  }, []);
  const mols = useMemo(() => {
    const r = prng(77);
    return Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 4.8, z: (r() - 0.5) * 2.2, ph: r(), rot: r() * 6.28 }));
  }, []);
  const top = 0.25 + 0.3 * swell;
  return (
    <group>
      {cells.map((c, i) => {
        const s = 1 + 0.35 * swell * (c.row === 0 ? 1 : 0.6) + 0.03 * Math.sin(t * 1.3 + c.ph);
        const y = -c.row * 0.52 * (1 + 0.3 * swell);
        const col = c.row === 0 ? "#f5c4b3" : c.row === 1 ? "#e9a08f" : FAT;
        return (
          <mesh key={i} position={[c.x, y, c.z]} scale={[s * 0.31, s * 0.25, s * 0.31]} rotation={[0, Math.PI / 6, 0]}>
            <cylinderGeometry args={[1, 1, 1.6, 6]} />
            <meshPhysicalMaterial color={col} roughness={0.25} transmission={0.5} ior={1.33} thickness={0.4} clearcoat={0.9} transparent opacity={0.9} />
          </mesh>
        );
      })}
      {mols.map((m, i) => {
        const k = (t * 0.55 + m.ph) % 1;
        // myth phase: molecules sink into the cells; reject phase: they hit the surface and bounce away
        const yIn = lerp(3.0, top - 0.6 * swell, k);
        const yOut = k < 0.5 ? lerp(3.0, top + 0.15, k / 0.5) : top + 0.15 + (k - 0.5) * 4.5;
        const y = lerp(yIn, yOut, reject);
        const x = m.x + (reject > 0.5 && k > 0.5 ? Math.sign(m.x || 1) * (k - 0.5) * 2.5 : 0);
        const vis = reject > 0.5 ? (k > 0.9 ? (1 - k) * 10 : 1) : k < 0.85 ? 1 : 1 - (k - 0.85) / 0.15;
        return <H2O key={i} position={[x, y, m.z + 0.6]} rotation={[m.rot, t * 1.5 + m.rot, 0]} scale={0.14} opacity={Math.max(0.05, vis)} />;
      })}
    </group>
  );
};

/** Two nerve fibres (myelinated axons): left intact with travelling pulses, right severed with a ruby spark. */
export const NerveFibres: React.FC<{ t: number; on: number; cut: number }> = ({ t, on, cut }) => {
  const segs = 7;
  const fibre = (x: number, broken: boolean) => (
    <group position={[x, 0, 0]}>
      {Array.from({ length: segs }, (_, i) => {
        const y = -2.4 + i * 0.75;
        const gap = broken && i === 3 ? cut : 0;
        if (broken && i === 3 && cut > 0.5) return null;
        const yy = y + (broken && i > 3 ? 0.35 * cut : 0) - (broken && i < 3 ? 0.35 * cut : 0);
        return (
          <mesh key={i} position={[0, yy, 0]} scale={[1, 1 - gap * 0.6, 1]}>
            <capsuleGeometry args={[0.2, 0.42, 8, 20]} />
            <meshPhysicalMaterial color="#fde68a" roughness={0.2} transmission={0.55} ior={1.35} thickness={0.3} clearcoat={1} transparent opacity={0.85} />
          </mesh>
        );
      })}
      {/* axon core */}
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 5.4, 12]} />
        <meshBasicMaterial color={NERVE} transparent opacity={broken ? 0.35 + 0.3 * on : 0.4 + 0.6 * on} toneMapped={false} />
      </mesh>
      {broken ? (
        <mesh position={[0, -0.15, 0.1]} scale={0.18 + 0.05 * Math.sin(t * 12)}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color={N.laserScanning} transparent opacity={cut * (0.6 + 0.4 * Math.sin(t * 9))} toneMapped={false} />
        </mesh>
      ) : (
        [0, 0.33, 0.66].map((p, i) => {
          const k = (t * 0.7 + p) % 1;
          return (
            <mesh key={i} position={[0, lerp(-2.6, 2.6, k), 0]} scale={0.16}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color="#fff1c9" transparent opacity={on} toneMapped={false} />
            </mesh>
          );
        })
      )}
    </group>
  );
  return (
    <group>
      {fibre(-1.1, false)}
      {fibre(1.1, true)}
    </group>
  );
};

/** Cross-section under the fingertip pad: skin folds as the pad deflates when the vessel narrows. */
export const TissueSection: React.FC<{ t: number; signal: number; narrow: number; deflate: number; fold: number }> = ({ t, signal, narrow, deflate, fold }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(3.6, 2, 220, 120), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const padH = lerp(0.62, 0.36, deflate);
  useLayoutEffect(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    for (let i = 0; i < a.length; i += 3) {
      const x = base[i];
      const yy = base[i + 1];
      const dome = Math.exp(-(x * x) / 1.6) * padH;
      const g = Math.pow(1 - Math.abs(Math.sin(5.2 * x + 0.8 * Math.sin(2.4 * yy))), 4);
      a[i + 2] = dome - 0.16 * fold * g * Math.exp(-(x * x) / 2.2);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, base, padH, fold]);

  const r = lerp(0.2, 0.085, narrow);
  const vessel = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2, -0.95, 0), new THREE.Vector3(-0.7, -0.9, 0.05), new THREE.Vector3(0.7, -0.9, -0.05), new THREE.Vector3(2, -0.95, 0)]), []);
  const vesselGeo = useMemo(() => new THREE.TubeGeometry(vessel, 80, 1, 24, false), [vessel]);
  const nerve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2, -1.45, 0.4), new THREE.Vector3(-1, -1.3, 0.35), new THREE.Vector3(-0.2, -1.05, 0.25), new THREE.Vector3(0.1, -0.95, 0.12)]), []);
  const nerveGeo = useMemo(() => new THREE.TubeGeometry(nerve, 48, 0.055, 10, false), [nerve]);
  const cells = useMemo(() => {
    const rr = prng(9);
    return Array.from({ length: 30 }, () => ({ ph: rr(), off: (rr() - 0.5) * 0.6, rot: rr() * 6 }));
  }, []);
  const speed = lerp(0.32, 0.07, narrow);
  const pulseK = (t * 1.2) % 1;

  return (
    <group>
      {/* skin surface membrane */}
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={SKIN} roughness={0.25} transmission={0.35} ior={1.33} thickness={0.4} sheen={0.8} sheenColor="#ffd9cb" clearcoat={0.9} clearcoatRoughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* fat pad */}
      <mesh position={[0, padH * 0.5 - 0.35, 0]} scale={[1.45, Math.max(0.2, padH * 0.75), 0.85]}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshPhysicalMaterial color={FAT} roughness={0.25} transmission={0.5} ior={1.4} thickness={0.8} clearcoat={0.8} transparent opacity={0.8} emissive={N.lipidAmber} emissiveIntensity={0.08} />
      </mesh>
      {/* translucent vessel, ruby blood cells */}
      <mesh geometry={vesselGeo} scale={[1, r, r]} position={[0, -0.9 * (1 - r), 0]}>
        <meshPhysicalMaterial color={BLOOD} roughness={0.15} clearcoat={1} transmission={0.4} transparent opacity={0.45} depthWrite={false} emissive={BLOOD} emissiveIntensity={0.25} />
      </mesh>
      {cells.map((c, i) => {
        const k = (c.ph + t * speed) % 1;
        const p = vessel.getPoint(k);
        return (
          <mesh key={i} position={[p.x, p.y + c.off * r * 0.8, p.z + c.off * r * 0.5]} rotation={[c.rot, c.rot * 0.5, 0]} scale={[r * 0.55, r * 0.55, r * 0.22]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshPhysicalMaterial color={BLOOD} roughness={0.2} clearcoat={1} emissive={BLOOD} emissiveIntensity={0.35} />
          </mesh>
        );
      })}
      {/* sympathetic nerve and its signal */}
      <mesh geometry={nerveGeo}>
        <meshBasicMaterial color={NERVE} transparent opacity={0.35 + 0.65 * signal} toneMapped={false} />
      </mesh>
      {signal > 0.01 ? (
        <mesh position={nerve.getPoint(pulseK)} scale={0.12}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#fff1c9" transparent opacity={signal} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Ridged skin disc (fingerprint ridges) that wrinkles; `hair` grows hair strands that keep it smooth. */
export const SkinPatch: React.FC<{ wrinkle: number; hair?: boolean; glow?: number; t: number }> = ({ wrinkle, hair = false, glow = 0, t }) => {
  const geoD = useMemo(() => new THREE.PlaneGeometry(2.4, 2.4, 160, 160), []);
  const base = useMemo(() => Float32Array.from(geoD.attributes.position.array as Float32Array), [geoD]);
  useLayoutEffect(() => {
    const pos = geoD.attributes.position as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    for (let i = 0; i < a.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      const rr = Math.hypot(x, y);
      const ridge = hair ? 0 : 0.02 * Math.sin(rr * 34 + Math.atan2(y, x) * 0.5);
      const g = Math.pow(1 - Math.abs(Math.sin(4.2 * x + 1.3 * Math.sin(3 * y))), 4);
      const fall = clamp(1.25 - rr);
      a[i + 2] = (ridge - 0.14 * wrinkle * g + 0.12 * Math.exp(-rr * rr)) * fall;
    }
    pos.needsUpdate = true;
    geoD.computeVertexNormals();
  }, [geoD, base, wrinkle, hair]);
  const strands = useMemo(() => {
    const r = prng(hair ? 61 : 62);
    return Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 1.6, z: (r() - 0.5) * 1.6, ph: r() * 6, h: 0.6 + r() * 0.5 }));
  }, [hair]);
  return (
    <group>
      <mesh geometry={geoD} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={SKIN}
          roughness={0.25}
          transmission={0.3}
          ior={1.33}
          thickness={0.4}
          sheen={0.8}
          sheenColor="#ffd9cb"
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          emissive={CYAN}
          emissiveIntensity={glow * 0.12}
          transparent
          alphaTest={0.01}
        />
      </mesh>
      {hair
        ? strands.map((s, i) => (
            <mesh key={i} position={[s.x, s.h / 2, s.z]} rotation={[Math.sin(t + s.ph) * 0.15, 0, 0.25 + Math.sin(t * 0.8 + s.ph) * 0.1]}>
              <cylinderGeometry args={[0.012, 0.022, s.h, 6]} />
              <meshStandardMaterial color="#5b3b2a" roughness={0.5} />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ───────────────────────── function (grip) ─────────────────────────

/** Wet dark road strip with scrolling lane dashes and rain. */
export const WetRoad: React.FC<{ t: number }> = ({ t }) => {
  const rain = useMemo(() => {
    const r = prng(31);
    return Array.from({ length: 80 }, () => ({ x: (r() - 0.5) * 14, z: (r() - 0.5) * 8, ph: r() }));
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    rain.forEach((d, i) => {
      const k = (t * 1.6 + d.ph) % 1;
      o.position.set(d.x, 6 - k * 8, d.z);
      o.rotation.set(0, 0, 0.12);
      o.scale.set(0.012, 0.35, 0.012);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [t, rain]);
  const scroll = (t * 6) % 3;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshPhysicalMaterial color="#0a1424" roughness={0.08} metalness={0.5} clearcoat={1} clearcoatRoughness={0.04} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 3 - scroll, 0.005, -1.6]}>
          <planeGeometry args={[1.4, 0.12]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, rain.length]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshBasicMaterial color="#bfeff5" transparent opacity={0.4} depthWrite={false} />
      </instancedMesh>
    </group>
  );
};

/** Spray thrown behind a rolling tire: the tread channels water away (small water molecules + droplets). */
export const Spray: React.FC<{ t: number; origin: [number, number, number]; amount?: number }> = ({ t, origin, amount = 1 }) => {
  const parts = useMemo(() => {
    const r = prng(55);
    return Array.from({ length: 40 }, () => ({ ph: r(), vx: 1.5 + r() * 2.5, vy: 1.2 + r() * 2, vz: (r() - 0.5) * 2.4, s: 0.5 + r() }));
  }, []);
  return (
    <group position={origin}>
      {parts.map((p, i) => {
        const k = (t * 1.3 + p.ph) % 1;
        const x = p.vx * k;
        const y = p.vy * k - 4.5 * k * k;
        if (y < -0.05) return null;
        return (
          <mesh key={i} position={[x, y, p.vz * k]} scale={0.05 * p.s * amount}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshPhysicalMaterial color="#bdeff6" roughness={0.03} transmission={0.6} ior={1.33} clearcoat={1} transparent opacity={0.9 * (1 - k)} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Glass bowl (lathe) for the marble-transfer test. */
export const Bowl: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const pts = useMemo(() => [0, 0.1, 0.25, 0.4, 0.5].map((k) => new THREE.Vector2(0.15 + Math.sin(k * Math.PI * 0.55) * 0.75, k * 0.9)), []);
  return (
    <mesh position={position}>
      <latheGeometry args={[pts, 64]} />
      <meshPhysicalMaterial color="#9be7ff" roughness={0.03} transmission={0.75} ior={1.5} thickness={0.1} transparent opacity={0.6} clearcoat={1} side={THREE.DoubleSide} />
    </mesh>
  );
};

/** Match glow ring for the "same pattern every time" beat. */
export const MatchRing: React.FC<{ k: number; y?: number }> = ({ k, y = 0 }) => (
  <mesh position={[0, y, 0.6]} scale={0.6 + k * 0.8}>
    <ringGeometry args={[1, 1.06, 96]} />
    <meshBasicMaterial color={CYAN} transparent opacity={(1 - k) * 0.9} toneMapped={false} depthWrite={false} />
  </mesh>
);

export { seg };
