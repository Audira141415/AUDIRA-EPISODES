// Konsep sains: cahaya, gelombang, molekul udara, hamburan, air, daun, stomata, kloroplas,
// gelembung gas. Tiap komponen punya bentuk yang terbaca tanpa teks: molekul punya wajah dan
// dua atom menyatu, gelombang adalah tabung 3D dengan kepala panah dan penggaris panjang
// gelombang, daun punya urat dan tangkai, kloroplas dibelah dengan tumpukan grana.
//
// Satuan: 1 unit dunia ≈ ukuran subjek "satu pandangan" (molekul ±1, daun ±2). Atur `scale`.

import React, { useMemo } from "react";
import * as THREE from "three";
import { ArrowHead, Face, Glow, Rod, Solid } from "./parts.tsx";
import { pal, sec, SPECTRUM, type ConceptProps, type V3 } from "./palette.ts";

// ---------------------------------------------------------------------------------------------
// Matahari + sinar

/** Matahari: bola bercahaya dengan mahkota sinar runcing yang berputar pelan. */
export const SunDisc: React.FC<ConceptProps & { rays?: number }> = ({ f = 0, position, rotation, scale = 1, palette, rays = 14 }) => {
  const P = pal(palette, { primary: "#ffc93c", glow: "#fff1b8" });
  const t = sec(f);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.6, 40, 28]} />
        <Glow color={P.primary} />
      </mesh>
      <mesh scale={1.25}>
        <sphereGeometry args={[0.6, 32, 20]} />
        <Glow color={P.glow} opacity={0.25} />
      </mesh>
      <group rotation={[0, 0, t * 0.25]}>
        {Array.from({ length: rays }, (_, i) => {
          const a = (i / rays) * Math.PI * 2;
          const long = i % 2 === 0 ? 0.42 : 0.28;
          const r = 0.78 + long / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a - Math.PI / 2]}>
              <coneGeometry args={[0.09, long, 4]} />
              <Glow color={P.primary} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/**
 * Berkas cahaya dari `from` ke `to`: inti terang + halo lembut, dengan panah foton (chevron)
 * yang mengalir searah rambat. `source` menambah matahari di pangkal.
 */
export const LightBeam: React.FC<ConceptProps & { from?: V3; to?: V3; width?: number; photons?: number; source?: boolean; color?: string }> = ({
  f = 0,
  from = [-2, 1.4, 0],
  to = [1.6, -0.6, 0],
  width = 0.32,
  photons = 6,
  source = false,
  color,
  palette,
  position,
  scale = 1,
}) => {
  const P = pal(palette, { glow: "#ffd95a" });
  const c = color ?? P.glow;
  const t = sec(f);
  const d: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const len = Math.hypot(...d);
  const dir: V3 = [d[0] / len, d[1] / len, d[2] / len];
  const at = (k: number): V3 => [from[0] + d[0] * k, from[1] + d[1] * k, from[2] + d[2] * k];
  return (
    <group position={position} scale={scale}>
      {source && <SunDisc f={f} position={from} scale={0.9} palette={palette} />}
      <Rod a={from} b={to} r={width * 0.32} segments={20}>
        <Glow color="#ffffff" opacity={0.95} />
      </Rod>
      <Rod a={from} b={to} r={width * 0.6} segments={20}>
        <Glow color={c} opacity={0.5} />
      </Rod>
      <Rod a={from} b={to} r={width} segments={24}>
        <Glow color={c} opacity={0.16} />
      </Rod>
      {Array.from({ length: photons }, (_, i) => {
        const k = ((i / photons + t * 0.45) % 1) * 0.92 + 0.04;
        return (
          <ArrowHead key={i} at={at(k)} dir={dir} size={width * 1.2}>
            <Glow color="#ffffff" />
          </ArrowHead>
        );
      })}
      <ArrowHead at={at(1)} dir={dir} size={width * 2.4}>
        <Glow color={c} opacity={0.9} />
      </ArrowHead>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Gelombang

const sineTube = (length: number, lambda: number, amp: number, phase: number, radius: number) => {
  const n = Math.max(80, Math.round((length / lambda) * 40));
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * length;
    // Amplitudo naik halus di 10% awal supaya ujung tidak terpotong tajam.
    const env = Math.min(1, (i / n) * 10);
    pts.push(new THREE.Vector3(x, Math.sin(((x - phase) / lambda) * Math.PI * 2) * amp * env, 0));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, radius, 12, false);
};

/**
 * Gelombang cahaya sebagai tabung 3D yang mengalir ke +x. `wavelength` "short" (biru, rapat) atau
 * "long" (merah, renggang), atau angka panjang satu siklus dalam unit dunia. `ruler` memasang
 * penggaris antara dua puncak supaya "panjang/pendek" terbaca tanpa teks.
 */
export const WaveRibbon: React.FC<ConceptProps & { wavelength?: "short" | "long" | number; length?: number; amplitude?: number; color?: string; speed?: number; ruler?: boolean; thickness?: number }> = ({
  f = 0,
  wavelength = "short",
  length = 3.2,
  amplitude,
  color,
  speed = 0.8,
  ruler = true,
  thickness = 0.06,
  palette,
  position,
  rotation,
  scale = 1,
}) => {
  const P = pal(palette);
  const lambda = wavelength === "short" ? 0.5 : wavelength === "long" ? 1.25 : wavelength;
  const amp = amplitude ?? (wavelength === "long" ? 0.32 : 0.26);
  const c = color ?? (wavelength === "long" ? SPECTRUM.red : wavelength === "short" ? SPECTRUM.blue : P.glow);
  const phase = (sec(f) * speed) % lambda;
  const core = useMemo(() => sineTube(length, lambda, amp, phase, thickness), [length, lambda, amp, phase, thickness]);
  const halo = useMemo(() => sineTube(length, lambda, amp, phase, thickness * 2.4), [length, lambda, amp, phase, thickness]);
  // Puncak pertama setelah 10% panjang (amplitudo sudah penuh), untuk penggaris.
  const crest0 = phase + lambda / 4 + Math.ceil((length * 0.1 - phase - lambda / 4) / lambda) * lambda;
  const rulerY = amp + 0.2;
  const endY = Math.sin(((length - phase) / lambda) * Math.PI * 2) * amp;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[-length / 2, 0, 0]}>
        <mesh geometry={core}>
          <Glow color={c} />
        </mesh>
        <mesh geometry={halo}>
          <Glow color={c} opacity={0.22} />
        </mesh>
        <ArrowHead at={[length + 0.08, endY, 0]} dir={[1, 0, 0]} size={thickness * 5}>
          <Glow color={c} />
        </ArrowHead>
        {ruler && crest0 + lambda <= length && (
          <group>
            <Rod a={[crest0, rulerY, 0]} b={[crest0 + lambda, rulerY, 0]} r={0.018}>
              <Solid color={P.ink} />
            </Rod>
            {[crest0, crest0 + lambda].map((x) => (
              <React.Fragment key={x}>
                <Rod a={[x, rulerY - 0.09, 0]} b={[x, rulerY + 0.09, 0]} r={0.018}>
                  <Solid color={P.ink} />
                </Rod>
                <Rod a={[x, amp, 0]} b={[x, rulerY - 0.09, 0]} r={0.008}>
                  <Glow color={P.ink} opacity={0.35} />
                </Rod>
              </React.Fragment>
            ))}
          </group>
        )}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Molekul

type Gas = "N2" | "O2" | "CO2" | "H2O";
const ELEMENT = { N: "#4f78f0", O: "#ef4a3c", C: "#33363c", H: "#f4f2ec" } as const;
const ATOMS: Record<Gas, { el: keyof typeof ELEMENT; r: number; p: V3 }[]> = {
  N2: [{ el: "N", r: 0.5, p: [-0.36, 0, 0] }, { el: "N", r: 0.5, p: [0.36, 0, 0] }],
  O2: [{ el: "O", r: 0.48, p: [-0.35, 0, 0] }, { el: "O", r: 0.48, p: [0.35, 0, 0] }],
  CO2: [{ el: "O", r: 0.42, p: [-0.7, 0, 0] }, { el: "C", r: 0.46, p: [0, 0, 0] }, { el: "O", r: 0.42, p: [0.7, 0, 0] }],
  H2O: [{ el: "O", r: 0.56, p: [0, 0.05, 0] }, { el: "H", r: 0.32, p: [-0.5, -0.36, 0.05] }, { el: "H", r: 0.32, p: [0.5, -0.36, 0.05] }],
};

/**
 * Molekul udara sebagai karakter kecil: atom-atom menyatu (warna unsur CPK: N biru, O merah,
 * C hitam, H putih) dengan wajah, ikatan bergetar dan badan bergoyang. `palette.primary`
 * menimpa warna atom pertama, `palette.secondary` atom lainnya.
 */
export const AirMolecule: React.FC<ConceptProps & { gas?: Gas; face?: boolean; mood?: "happy" | "surprised"; seed?: number }> = ({
  f = 0,
  gas = "N2",
  face = true,
  mood = "happy",
  seed = 1,
  palette,
  material = "toyPlastic",
  position,
  rotation,
  scale = 1,
}) => {
  const t = sec(f) + seed * 0.7;
  const vib = 1 + Math.sin(t * 9) * 0.035;
  const atoms = ATOMS[gas];
  const colorOf = (i: number) => {
    const el = atoms[i].el;
    if (palette?.primary && i === 0) return palette.primary;
    if (palette?.secondary && i > 0) return palette.secondary;
    return ELEMENT[el];
  };
  const bob: V3 = [0, Math.sin(t * 1.7) * 0.06, 0];
  const main = gas === "CO2" ? atoms[1] : atoms[0];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={bob} rotation={[0, Math.sin(t * 0.9) * 0.25, Math.sin(t * 1.3) * 0.08]}>
        {atoms.map((a, i) => (
          <mesh key={i} position={[a.p[0] * vib, a.p[1] * vib, a.p[2]]} castShadow>
            <sphereGeometry args={[a.r, 40, 28]} />
            <Solid material={material} color={colorOf(i)} />
          </mesh>
        ))}
        {face && (
          gas === "N2" || gas === "O2" ? (
            // Satu mata per atom, senyum di sambungan: terbaca sebagai satu tokoh dua-atom.
            <Face f={f} spread={atoms[1].p[0] * vib * 0.9} z={atoms[0].r * 0.86} size={atoms[0].r * 0.3} y={0.02} mood={mood} />
          ) : (
            <Face f={f} spread={main.r * 0.36} z={main.r * 0.9} size={main.r * 0.26} y={main.p[1] + main.r * 0.05} mood={mood} />
          )
        )}
      </group>
    </group>
  );
};

/**
 * Hamburan Rayleigh: berkas putih menabrak satu molekul N₂, gelombang biru pendek terpental ke
 * segala arah, gelombang merah panjang tembus lurus. Siklus 2,4 dtk.
 */
export const ScatterBurst: React.FC<ConceptProps & { gas?: Gas; directions?: number }> = ({ f = 0, gas = "N2", directions = 6, palette, material, position, rotation, scale = 1 }) => {
  const t = sec(f);
  const k = (t % 2.4) / 2.4;
  const grow = 0.6 + Math.min(1, k * 1.6) * 1.1;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <LightBeam f={f} from={[-3.2, 0, 0]} to={[-0.75, 0, 0]} width={0.26} photons={4} palette={palette} color="#fff8e6" />
      <AirMolecule f={f} gas={gas} mood="surprised" scale={0.8} palette={palette} material={material} />
      {/* Merah panjang: tembus lurus */}
      <WaveRibbon f={f} wavelength="long" length={2.4} position={[2.0, -0.05, -0.2]} ruler={false} amplitude={0.22} />
      {/* Biru pendek: terpental ke segala arah */}
      {Array.from({ length: directions }, (_, i) => {
        const a = Math.PI * 0.3 + (i / directions) * Math.PI * 1.55;
        const r = 0.85 + grow / 2;
        return (
          <WaveRibbon
            key={i}
            f={f + i * 7}
            wavelength={0.34}
            amplitude={0.13}
            thickness={0.045}
            length={grow}
            ruler={false}
            color={SPECTRUM.blue}
            position={[Math.cos(a) * r, Math.sin(a) * r, 0.1]}
            rotation={[0, 0, a]}
          />
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Air & gas

const dropGeo = () => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI;
    pts.push(new THREE.Vector2(Math.sin(a) * Math.pow(Math.sin(a / 2), 1.1) * 0.82, Math.cos(a) * 1.0));
  }
  return new THREE.LatheGeometry(pts, 48);
};

/** Tetes air: bentuk tetes klasik (ujung lancip di atas), kaca bening berbias, kilau putih. */
export const WaterDrop: React.FC<ConceptProps & { face?: boolean }> = ({ f = 0, face = false, palette, position, rotation, scale = 1 }) => {
  const P = pal(palette, { primary: "#5fb8ff" });
  const geo = useMemo(dropGeo, []);
  const t = sec(f);
  const sq = 1 + Math.sin(t * 3.2) * 0.03;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        <mesh geometry={geo} castShadow>
          <meshPhysicalMaterial color={P.primary} roughness={0.04} transmission={0.82} thickness={1.2} ior={1.33} clearcoat={1} clearcoatRoughness={0.02} attenuationColor={P.primary} attenuationDistance={1.4} metalness={0} />
        </mesh>
        <mesh position={[-0.26, 0.05, 0.5]} scale={[0.1, 0.2, 0.06]} rotation={[0, 0, -0.4]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <mesh position={[0.3, -0.45, 0.52]} scale={0.05}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {face && <Face f={f} spread={0.2} z={0.66} size={0.12} y={-0.42} />}
      </group>
    </group>
  );
};

/**
 * Gelembung gas: lapisan sabun berpelangi (iridescence) yang naik bergoyang, dengan molekul
 * gasnya terlihat di dalam (O₂ default). `rise` unit/dtk.
 */
export const GasBubble: React.FC<ConceptProps & { gas?: Gas; rise?: number; seed?: number }> = ({ f = 0, gas = "O2", rise = 0, seed = 1, palette, material, position = [0, 0, 0], scale = 1 }) => {
  const t = sec(f) + seed;
  const p: V3 = [position[0] + Math.sin(t * 2.1) * 0.08, position[1] + ((sec(f) * rise) % 4), position[2]];
  return (
    <group position={p} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.8, 48, 32]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0} transmission={1} thickness={0.05} ior={1.08} iridescence={1} iridescenceIOR={1.3} iridescenceThicknessRange={[180, 620]} clearcoat={1} transparent opacity={0.9} metalness={0} />
      </mesh>
      <mesh position={[-0.3, 0.36, 0.6]} scale={[0.14, 0.09, 0.05]} rotation={[0, 0, 0.6]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <AirMolecule f={f} gas={gas} seed={seed} scale={gas === "CO2" ? 0.42 : 0.5} palette={palette} material={material} />
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Daun, stomata, kloroplas

const leafShape = (w: number, h: number) => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.9, h * 0.12, w * 0.75, h * 0.72, 0, h);
  s.bezierCurveTo(-w * 0.75, h * 0.72, -w * 0.9, h * 0.12, 0, 0);
  return s;
};

/** Stoma (mulut daun): dua sel penjaga berbentuk ginjal mengapit celah gelap; `open` 0..1. */
export const Stoma: React.FC<ConceptProps & { open?: number; gasFlow?: boolean }> = ({ f = 0, open = 0.7, gasFlow = false, palette, material = "clay", position, rotation, scale = 1 }) => {
  const P = pal(palette, { primary: "#5cbf4a", secondary: "#a8e07a" });
  const t = sec(f);
  const gap = 0.05 + open * 0.16;
  const k = (t % 2) / 2;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Epidermis di sekeliling */}
      <mesh position={[0, 0, -0.12]} scale={[1.25, 1.5, 0.12]}>
        <sphereGeometry args={[1, 32, 20]} />
        <Solid material={material} color={P.secondary} />
      </mesh>
      {/* Celah (pori) */}
      <mesh position={[0, 0, 0.02]} scale={[gap + 0.04, 0.56, 0.05]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#14240f" />
      </mesh>
      {/* Sel penjaga kiri/kanan: dua "kacang" mengapit celah */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * (gap + 0.2), 0, 0]}>
          <mesh scale={[0.24, 0.66, 0.22]} castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <Solid material={material} color={P.primary} />
          </mesh>
          {/* kloroplas kecil di sel penjaga */}
          {[-0.32, 0, 0.32].map((y, i) => (
            <mesh key={i} position={[s * 0.04, y, 0.19]} scale={[0.055, 0.075, 0.04]}>
              <sphereGeometry args={[1, 10, 8]} />
              <Solid color="#2a7a2a" />
            </mesh>
          ))}
        </group>
      ))}
      {gasFlow && (
        <>
          <AirMolecule f={f} gas="CO2" face={false} scale={0.22} position={[0, 0, 1.6 - k * 1.5]} />
          <AirMolecule f={f + 40} gas="O2" face={false} scale={0.22} position={[0.15, 0.1, 0.1 + k * 1.5]} />
        </>
      )}
    </group>
  );
};

/**
 * Daun: helai tebal sedikit melengkung dengan tulang daun, urat menyirip, dan tangkai. `stomata`
 * menaruh stoma kecil di permukaan (zoom-in fotosintesis).
 */
export const Leaf: React.FC<ConceptProps & { stomata?: number; sway?: boolean }> = ({ f = 0, stomata = 0, sway = true, palette, material = "clay", position, rotation, scale = 1 }) => {
  const P = pal(palette, { primary: "#3e9b3a", secondary: "#b5e486" });
  const W = 0.85, H = 2.2;
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(leafShape(W, H), { depth: 0.025, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 32 });
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      // cekung di tengah + ujung melengkung ke belakang
      p.setZ(i, p.getZ(i) + (x * x) * 0.45 - Math.pow(y / H, 2) * 0.35);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const zAt = (x: number, y: number) => x * x * 0.45 - Math.pow(y / H, 2) * 0.35 + 0.05;
  const t = sec(f);
  const swing = sway ? Math.sin(t * 1.4) * 0.08 : 0;
  const veins = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.72];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[swing * 0.5, 0, swing]}>
        <mesh geometry={geo} castShadow receiveShadow>
          <Solid material={material} color={P.primary} side={THREE.DoubleSide} />
        </mesh>
        {/* Tulang daun */}
        {Array.from({ length: 10 }, (_, i) => {
          const y0 = (i / 10) * H * 0.95, y1 = ((i + 1) / 10) * H * 0.95;
          return (
            <Rod key={i} a={[0, y0, zAt(0, y0)]} b={[0, y1, zAt(0, y1)]} r={0.03 * (1 - i / 12)}>
              <Solid material={material} color={P.secondary} />
            </Rod>
          );
        })}
        {/* Urat menyirip */}
        {veins.map((y) =>
          [1, -1].map((s) => {
            const half = W * 0.62 * Math.sin((y / H) * Math.PI) ** 0.8;
            const a: V3 = [0, y, zAt(0, y)];
            const b: V3 = [s * half, y + half * 0.55, zAt(s * half, y + half * 0.55)];
            return (
              <Rod key={`${y}${s}`} a={a} b={b} r={0.012}>
                <Solid material={material} color={P.secondary} />
              </Rod>
            );
          }),
        )}
        {/* Tangkai */}
        <Rod a={[0, -0.55, -0.05]} b={[0, 0.02, 0.04]} r={0.035}>
          <Solid material={material} color={P.secondary} />
        </Rod>
        {Array.from({ length: stomata }, (_, i) => {
          const y = 0.45 + (i * 1.3) / Math.max(1, stomata);
          const x = (i % 2 === 0 ? 1 : -1) * 0.28;
          return <Stoma key={i} f={f + i * 13} open={0.5 + 0.4 * Math.sin(sec(f) + i)} position={[x, y, zAt(x, y) + 0.02]} scale={0.1} palette={palette} />;
        })}
      </group>
    </group>
  );
};

/**
 * Kloroplas dibelah: selubung luar hijau (separuh belakang padat, depan terbuka) berisi
 * tumpukan grana (koin tilakoid) yang dihubungkan lamela. Grana berdenyut terang saat `glow`.
 */
export const Chloroplast: React.FC<ConceptProps & { glow?: number }> = ({ f = 0, glow = 0.4, palette, material = "clay", position, rotation, scale = 1 }) => {
  const P = pal(palette, { primary: "#4caf3e", secondary: "#1f6e2a", accent: "#c8f08a" });
  const t = sec(f);
  const pulse = glow * (0.5 + 0.5 * Math.sin(t * 3));
  const stacks: V3[] = [[-1.0, -0.12, -0.2], [-0.5, 0.18, -0.15], [0, -0.1, -0.25], [0.5, 0.16, -0.15], [1.0, -0.08, -0.2]];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Selubung: separuh belakang padat */}
      <mesh scale={[1.7, 0.85, 0.85]} receiveShadow>
        <sphereGeometry args={[1, 48, 32, Math.PI, Math.PI]} />
        <Solid material={material} color={P.primary} side={THREE.DoubleSide} />
      </mesh>
      {/* Bibir potongan */}
      <mesh rotation={[0, 0, 0]} scale={[1.7, 0.85, 1]}>
        <torusGeometry args={[1, 0.05, 12, 64]} />
        <Solid material={material} color={P.accent} />
      </mesh>
      {/* Stroma (cairan) */}
      <mesh scale={[1.62, 0.78, 0.04]} position={[0, 0, -0.55]}>
        <sphereGeometry args={[1, 32, 16]} />
        <Solid material={material} color="#9ad66d" />
      </mesh>
      {/* Grana */}
      {stacks.map((p, i) => (
        <group key={i} position={p}>
          {Array.from({ length: 6 }, (_, j) => (
            <mesh key={j} position={[0, (j - 2.5) * 0.075, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.055, 28]} />
              <Solid material={material} color={P.secondary} emissive="#7dff5a" emissiveIntensity={pulse * 0.6} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Lamela antar grana */}
      {stacks.slice(1).map((p, i) => (
        <Rod key={i} a={stacks[i]} b={p} r={0.025}>
          <Solid material={material} color={P.secondary} />
        </Rod>
      ))}
    </group>
  );
};
