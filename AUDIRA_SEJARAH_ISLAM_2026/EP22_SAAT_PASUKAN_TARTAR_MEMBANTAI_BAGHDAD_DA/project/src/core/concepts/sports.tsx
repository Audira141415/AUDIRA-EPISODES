// Konsep olahraga: SportsPerson per cabang (kostum, alat, pose, proporsi), Tyre, dan RaceCar per
// era. Masalah yang ditambal: pemain tenis, kru pit stop F1, dan pelari maraton 1904 sebelumnya
// sama-sama ToyPerson polos, dan mobil Fangio 1957 terbaca seperti "sosis cokelat".
//
// Skala: pakai skala dunia core/sport (M = 0,6 unit per meter). ToyPerson skala 1 ≈ 1,75 m.
// Katalog GLB belum punya mobil formula (open-wheel); RaceCar mengisi celah itu. Untuk mobil
// jalan raya per era pakai GLB (lihat ERA_VEHICLES di registry.ts).

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo } from "../polish/Polish.tsx";
import { legReach, poseAt, ToyPerson, type Expression, type Look, type Pose } from "../polish/Person.tsx";
import { sportPose, type Action } from "../sport/poses.ts";
import { M } from "../sport/specs.ts";
import { Racket, Shuttlecock } from "../sport/Equipment.tsx";
import { decalTexture, Rod, Solid } from "./parts.tsx";
import { pal, sec, type ConceptPalette, type ConceptProps, type MaterialName, type V3 } from "./palette.ts";

// ---------------------------------------------------------------------------------------------
// Perlengkapan kepala dan tangan (ruang lokal kepala/tangan ToyPerson)

const HEAD_R = 0.122;

/** Bando kain (tenis, bulu tangkis). */
export const Headband: React.FC<{ color: string }> = ({ color }) => (
  <mesh position={[0, 0.045, -0.004]} rotation={[Math.PI / 2 - 0.22, 0, 0]}>
    <torusGeometry args={[HEAD_R * 1.0, 0.02, 10, 36]} />
    <Solid material="fabric" color={color} />
  </mesh>
);

/** Helm penuh dengan visor gelap (kru pit stop, pembalap). */
export const FullHelmet: React.FC<{ color: string; stripe?: string }> = ({ color, stripe = "#ffffff" }) => (
  <group position={[0, 0.0, -0.004]}>
    <mesh scale={[1, 1.08, 1.04]}>
      <sphereGeometry args={[HEAD_R * 1.24, 32, 24]} />
      <Solid color={color} />
    </mesh>
    <mesh scale={[1.005, 1.085, 1.045]}>
      <sphereGeometry args={[HEAD_R * 1.25, 32, 12, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.42, 0.5]} />
      <meshPhysicalMaterial color="#14161c" roughness={0.05} clearcoat={1} metalness={0.3} side={THREE.DoubleSide} />
    </mesh>
    <mesh rotation={[0, 0, 0]} scale={[1.01, 1.09, 1.05]}>
      <sphereGeometry args={[HEAD_R * 1.245, 32, 6, -0.12, 0.24, 0, Math.PI * 0.55]} />
      <Solid color={stripe} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Topi pet kain + kumis: penanda era 1900-an. */
export const FlatCapMoustache: React.FC<{ cap: string; hair: string }> = ({ cap, hair }) => (
  <group>
    <mesh position={[0, 0.075, -0.01]} scale={[1.08, 0.48, 1.12]}>
      <sphereGeometry args={[HEAD_R, 24, 16]} />
      <Solid material="fabric" color={cap} />
    </mesh>
    <mesh position={[0, 0.07, 0.11]} rotation={[0.25, 0, 0]} scale={[1, 0.18, 0.75]}>
      <cylinderGeometry args={[0.085, 0.085, 0.05, 24, 1, false, -Math.PI / 2, Math.PI]} />
      <Solid material="fabric" color={cap} />
    </mesh>
    {[1, -1].map((s) => (
      <mesh key={s} position={[s * 0.026, -0.03, HEAD_R * 0.98]} rotation={[0, 0, s * 0.35]} scale={[0.03, 0.012, 0.012]}>
        <sphereGeometry args={[1, 12, 8]} />
        <Solid material="fabric" color={hair} />
      </mesh>
    ))}
  </group>
);

/** Sarung tinju (ruang lokal tangan: -y meneruskan lengan bawah). */
export const BoxingGlove: React.FC<{ color: string; cuff?: string }> = ({ color, cuff = "#f4f1ea" }) => (
  <group>
    <mesh position={[0, -0.035, 0.01]} scale={[0.95, 1.1, 1.05]} castShadow>
      <sphereGeometry args={[0.078, 24, 18]} />
      <Solid color={color} />
    </mesh>
    <mesh position={[0.05, -0.01, 0.045]} scale={[0.6, 1, 0.6]}>
      <sphereGeometry args={[0.04, 16, 12]} />
      <Solid color={color} />
    </mesh>
    <mesh position={[0, 0.045, 0]}>
      <cylinderGeometry args={[0.056, 0.06, 0.06, 20]} />
      <Solid material="fabric" color={cuff} />
    </mesh>
  </group>
);

/** Kunci roda pneumatik (wheel gun) kru pit stop, dengan selang kuning. */
export const WheelGun: React.FC<{ color?: string }> = ({ color = "#2b2f36" }) => (
  <group>
    <mesh position={[0, -0.02, 0.03]}>
      <RoundedBoxGeo args={[0.06, 0.08, 0.1]} radius={0.015} />
      <Solid color={color} />
    </mesh>
    <mesh position={[0, -0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.035, 0.03, 0.14, 18]} />
      <meshPhysicalMaterial color="#c9ccd2" metalness={1} roughness={0.25} />
    </mesh>
    <Rod a={[0, -0.06, 0.0]} b={[0, -0.2, -0.08]} r={0.012}>
      <Solid color="#f2b400" />
    </Rod>
  </group>
);

const TennisBall: React.FC = () => (
  <mesh position={[0, -0.06, 0.02]}>
    <sphereGeometry args={[0.04, 20, 14]} />
    <Solid material="fabric" color="#d7f03a" />
  </mesh>
);

// ---------------------------------------------------------------------------------------------
// SportsPerson

export type SportKind = "tennis" | "badminton" | "f1crew" | "marathon1904" | "boxing";

/** Kuda-kuda tinju: tangan di depan dagu, kaki terbuka, lutut ditekuk, memantul ringan. */
function boxingGuard(f: number, seed: number): Pose {
  const base = poseAt("stand", f, seed);
  const t = f / 60 + seed;
  const b = Math.sin(t * Math.PI * 2 * 1.8);
  const lh: V3 = [-0.28, 0, 0.14];
  const rh: V3 = [0.22, 0, -0.14];
  const lk = 0.42 + b * 0.05;
  const rk = 0.32 + b * 0.05;
  return {
    ...base,
    body: [0, 0.35, 0],
    spine: [0.18, -0.2, 0],
    head: [0.15, 0.15, 0],
    ls: [-1.15, 0, 0.05], le: -2.05,
    rs: [-0.95, 0, -0.05], re: -2.2,
    lh, lk, rh, rk,
    lift: Math.max(legReach(lh, lk), legReach(rh, rk)),
  };
}

const DEFAULT_ACTION: Record<SportKind, { action?: Action; u?: number; pose?: "crouch" }> = {
  tennis: { action: "serve", u: 0.32 },
  badminton: { action: "smash", u: 0.3 },
  marathon1904: { action: "run" },
  f1crew: { pose: "crouch" },
  boxing: {},
};

const KIT: Record<SportKind, Partial<ConceptPalette>> = {
  tennis: { primary: "#f4f1ea", secondary: "#f4f1ea", accent: "#1fa67a" },
  badminton: { primary: "#e8423f", secondary: "#262b33", accent: "#f4f1ea" },
  f1crew: { primary: "#d7263d", secondary: "#d7263d", accent: "#f4f1ea" },
  marathon1904: { primary: "#efe4cc", secondary: "#efe4cc", accent: "#6e5a3a", ink: "#2a1c14" },
  boxing: { primary: "#c8201e", secondary: "#c8201e", accent: "#f4f1ea" },
};

/**
 * Atlet per cabang. Satu figur dasar (ToyPerson) dibedakan lewat kostum, alat di tangan, penutup
 * kepala, pose, dan proporsi:
 * - tennis: kaus+celana putih, bando, raket tenis, bola di tangan kiri, pose servis.
 * - badminton: kaus tim, bando, raket bulu tangkis, kok, pose smash.
 * - f1crew: coverall satu warna tim, helm penuh visor gelap, wheel gun, jongkok.
 * - marathon1904: kaus singlet krem, celana selutut, kaus kaki panjang gelap, sepatu bot kulit,
 *   topi pet, kumis, nomor dada kertas, pose lari.
 * - boxing: telanjang dada, celana satin, sarung tinju besar, kuda-kuda tinju.
 * `palette.primary` = baju, `secondary` = celana, `accent` = aksen (bando, helm, manset).
 */
export const SportsPerson: React.FC<ConceptProps & {
  sport: SportKind;
  /** Timpa aksi dari core/sport/poses.ts. */
  action?: Action;
  /** Progres aksi sekali-jalan 0..1. */
  u?: number;
  seed?: number;
  heading?: number;
  number?: number;
  expression?: Expression;
  look?: Partial<Look>;
}> = ({ sport, f = 0, action, u, seed = 3, heading = 0, number, expression, look, palette, position = [0, 0, 0], scale = 1 }) => {
  const P = pal(palette, KIT[sport]);
  const d = DEFAULT_ACTION[sport];
  const act = action ?? d.action;
  let pose: Pose | undefined;
  let offset: V3 = [0, 0, 0];
  if (sport === "boxing" && !action) pose = boxingGuard(f, seed);
  else if (act) {
    const sp = sportPose(act, { f, u: u ?? d.u ?? 0, seed });
    pose = sp.pose;
    offset = sp.offset;
  }
  const c = Math.cos(heading), s = Math.sin(heading);
  const pos: V3 = [position[0] + (offset[0] * c + offset[2] * s) * scale, position[1] + offset[1] * scale, position[2] + (-offset[0] * s + offset[2] * c) * scale];

  let L: Partial<Look> = {};
  let headwear: React.ReactNode = null;
  let torso: React.ReactNode = null;
  let rightHand: React.ReactNode = null;
  let leftHand: React.ReactNode = null;
  let expr: Expression = "neutral";
  switch (sport) {
    case "tennis":
      L = { outfit: "sport", top: P.primary, bottom: P.secondary, socks: "#ffffff", shoes: "#ffffff", hairStyle: 1, build: 0.95 };
      headwear = <Headband color={P.accent} />;
      rightHand = <Racket kind="tennis" color={P.accent} />;
      leftHand = (u ?? d.u ?? 0) < 0.35 ? <TennisBall /> : null;
      expr = "happy";
      break;
    case "badminton":
      L = { outfit: "sport", top: P.primary, bottom: P.secondary, socks: "#ffffff", shoes: "#f4f1ea", hairStyle: 0, build: 0.92, number };
      headwear = <Headband color={P.accent} />;
      rightHand = <Racket kind="badminton" color={P.accent} />;
      leftHand = <Shuttlecock scale={1.8} position={[0, -0.05, 0.03]} rotation={[Math.PI, 0, 0]} />;
      expr = "angry";
      break;
    case "f1crew":
      L = { outfit: "uniform", top: P.primary, bottom: P.secondary, shoes: "#1b1d22", build: 1.08 };
      headwear = <FullHelmet color={P.primary} stripe={P.accent} />;
      torso = (
        <mesh position={[0, 0.16, 0]} scale={[1.02, 1, 1.02]}>
          <cylinderGeometry args={[0.122, 0.13, 0.035, 28]} />
          <Solid material="fabric" color={P.accent} />
        </mesh>
      );
      rightHand = <WheelGun />;
      break;
    case "marathon1904":
      L = { outfit: "sport", top: P.primary, bottom: P.secondary, socks: "#2a2420", shoes: "#4a2e1a", hair: "#2a1c14", hairStyle: 0, build: 0.88, height: 0.97, skin: "#e6b28c" };
      headwear = <FlatCapMoustache cap={P.accent} hair="#2a1c14" />;
      torso = (
        <mesh position={[0, 0.15, 0.088]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[0.11, 0.09]} />
          <meshStandardMaterial map={decalTexture(String(number ?? 7), { round: false, bg: "#f6efdc", ink: "#2a1c14" })} roughness={0.9} />
        </mesh>
      );
      expr = "sad";
      break;
    case "boxing":
      L = { outfit: "trunks", bottom: P.secondary, hairStyle: 3, build: 1.12 };
      rightHand = <BoxingGlove color={P.primary} cuff={P.accent} />;
      leftHand = <BoxingGlove color={P.primary} cuff={P.accent} />;
      torso = (
        <mesh position={[0, -0.005, 0]}>
          <cylinderGeometry args={[0.108, 0.104, 0.035, 28]} />
          <Solid material="fabric" color={P.accent} />
        </mesh>
      );
      expr = "angry";
      break;
  }
  return (
    <ToyPerson
      f={f}
      seed={seed}
      pose={d.pose ?? "stand"}
      poseOverride={pose}
      look={{ ...L, ...look }}
      expression={expression ?? expr}
      position={pos}
      heading={heading}
      scale={scale}
      headwear={headwear}
      torso={torso}
      rightHand={rightHand}
      leftHand={leftHand}
    />
  );
};

// ---------------------------------------------------------------------------------------------
// Ban dan mobil balap

/**
 * Roda balap (sumbu = x lokal). `kind="slick"`: ban lebar, pelek gelap, garis warna di dinding
 * ban (F1 modern). `kind="wire"`: ban tinggi ramping, jari-jari kawat krom, spinner (1950-an).
 * Dalam meter; bungkus dengan skala M.
 */
export const Tyre: React.FC<{ kind?: "slick" | "wire"; radius?: number; width?: number; stripe?: string; spin?: number; position?: V3 }> = ({
  kind = "slick",
  radius = 0.36,
  width = 0.36,
  stripe = "#f2b400",
  spin = 0,
  position,
}) => {
  const R = radius, W = width;
  const rubber = <meshPhysicalMaterial color="#1c1c1f" roughness={0.78} metalness={0} clearcoat={0.1} />;
  const chrome = <meshPhysicalMaterial color="#d8dade" metalness={1} roughness={0.18} />;
  if (kind === "wire") {
    const tube = W * 0.5;
    const rimR = R - tube * 1.6;
    return (
      <group position={position} rotation={[spin, 0, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <torusGeometry args={[R - tube, tube, 16, 48]} />
            {rubber}
          </mesh>
          <mesh>
            <torusGeometry args={[rimR, 0.014, 8, 48]} />
            {chrome}
          </mesh>
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const side = i % 2 === 0 ? 1 : -1;
            return (
              <Rod key={i} a={[0, 0, side * 0.05]} b={[Math.cos(a) * rimR, Math.sin(a) * rimR, -side * 0.01]} r={0.005} segments={5}>
                {chrome}
              </Rod>
            );
          })}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.05, 0.06, 0.08, 16]} />
            {chrome}
          </mesh>
          {[0, Math.PI / 2].map((a) => (
            <mesh key={a} position={[0, 0, 0.11]} rotation={[0, 0, a + Math.PI / 4]}>
              <boxGeometry args={[0.16, 0.025, 0.02]} />
              {chrome}
            </mesh>
          ))}
        </group>
      </group>
    );
  }
  return (
    <group position={position} rotation={[spin, 0, 0]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[R, R, W * 0.86, 48]} />
          {rubber}
        </mesh>
        {[1, -1].map((s) => (
          <group key={s}>
            <mesh position={[0, (s * W * 0.43), 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[R - W * 0.07, W * 0.07, 10, 48]} />
              {rubber}
            </mesh>
            <mesh position={[0, s * (W * 0.5 + 0.002), 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[R * 0.74, R * 0.8, 48]} />
              <meshBasicMaterial color={stripe} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh>
          <cylinderGeometry args={[R * 0.62, R * 0.62, W * 1.0, 32]} />
          <meshPhysicalMaterial color="#2b2d33" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[R * 0.16, R * 0.16, W * 1.06, 16]} />
          <meshPhysicalMaterial color="#c9a227" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

const Box: React.FC<{ args: V3; p: V3; r?: V3; c: string; material?: MaterialName; radius?: number }> = ({ args, p, r, c, material, radius }) => (
  <mesh position={p} rotation={r} castShadow>
    <RoundedBoxGeo args={args} radius={radius} />
    <Solid material={material} color={c} />
  </mesh>
);

const ModernF1: React.FC<{ P: ConceptPalette; spin: number; number: string; material: MaterialName }> = ({ P, spin, number, material }) => {
  const R = 0.36;
  const carbon = "#202226";
  const num = useMemo(() => decalTexture(number, { bg: "#ffffff", ink: "#111111" }), [number]);
  return (
    <group>
      {/* Lantai dan bodi */}
      <Box args={[1.5, 0.05, 3.5]} p={[0, 0.1, -0.05]} c={carbon} radius={0.02} />
      <mesh position={[0, 0.38, 1.72]} rotation={[Math.PI / 2 + 0.08, 0, 0]} scale={[1.25, 1, 0.62]} castShadow>
        <cylinderGeometry args={[0.07, 0.26, 1.7, 28]} />
        <Solid material={material} color={P.primary} />
      </mesh>
      <Box args={[0.78, 0.44, 1.35]} p={[0, 0.4, 0.35]} c={P.primary} material={material} />
      <Box args={[0.42, 0.04, 0.62]} p={[0, 0.62, 0.22]} c={P.ink} radius={0.015} />
      <Box args={[0.44, 0.38, 1.5]} p={[0.56, 0.32, -0.25]} c={P.primary} material={material} />
      <Box args={[0.44, 0.38, 1.5]} p={[-0.56, 0.32, -0.25]} c={P.primary} material={material} />
      <Box args={[0.46, 0.08, 1.2]} p={[0.56, 0.36, -0.3]} c={P.secondary} material={material} radius={0.02} />
      <Box args={[0.46, 0.08, 1.2]} p={[-0.56, 0.36, -0.3]} c={P.secondary} material={material} radius={0.02} />
      {[1, -1].map((s) => (
        <Box key={s} args={[0.34, 0.24, 0.03]} p={[s * 0.56, 0.34, 0.505]} c={P.ink} radius={0.01} />
      ))}
      <Box args={[0.56, 0.5, 1.5]} p={[0, 0.5, -0.85]} c={P.primary} material={material} />
      <Box args={[0.3, 0.3, 0.75]} p={[0, 0.36, -1.85]} c={P.primary} material={material} />
      <Box args={[0.26, 0.3, 0.36]} p={[0, 0.92, -0.18]} c={P.primary} material={material} />
      <Box args={[0.18, 0.18, 0.02]} p={[0, 0.93, 0.0]} c={P.ink} radius={0.008} />
      <Box args={[0.025, 0.36, 1.1]} p={[0, 0.88, -1.0]} c={P.secondary} radius={0.01} />
      {/* Pembalap */}
      <mesh position={[0, 0.7, 0.18]} scale={[1, 1.05, 1.08]}>
        <sphereGeometry args={[0.14, 24, 18]} />
        <Solid color={P.accent} />
      </mesh>
      <mesh position={[0, 0.7, 0.18]} scale={[1.01, 1.06, 1.09]}>
        <sphereGeometry args={[0.141, 24, 8, Math.PI / 2 - 0.8, 1.6, Math.PI / 2 - 0.35, 0.36]} />
        <meshPhysicalMaterial color="#111318" roughness={0.05} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Halo */}
      <mesh position={[0, 0.84, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.028, 10, 32, Math.PI]} />
        <Solid color={carbon} />
      </mesh>
      <Rod a={[0, 0.84, 0.46]} b={[0, 0.6, 0.62]} r={0.03}>
        <Solid color={carbon} />
      </Rod>
      {[1, -1].map((s) => (
        <Rod key={s} a={[s * 0.3, 0.84, 0.16]} b={[s * 0.3, 0.6, 0.05]} r={0.03}>
          <Solid color={carbon} />
        </Rod>
      ))}
      {/* Nomor di hidung */}
      <mesh position={[0, 0.5, 1.5]} rotation={[-Math.PI / 2 + 0.1, 0, 0]}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshBasicMaterial map={num} transparent toneMapped={false} />
      </mesh>
      {/* Sayap depan */}
      <Box args={[1.95, 0.03, 0.42]} p={[0, 0.1, 2.62]} c={carbon} radius={0.012} />
      <Box args={[1.9, 0.025, 0.2]} p={[0, 0.17, 2.52]} r={[-0.35, 0, 0]} c={P.secondary} radius={0.01} />
      {[1, -1].map((s) => (
        <Box key={s} args={[0.03, 0.22, 0.5]} p={[s * 0.98, 0.16, 2.6]} c={P.primary} radius={0.01} />
      ))}
      <Rod a={[0, 0.25, 2.45]} b={[0, 0.12, 2.55]} r={0.025}>
        <Solid color={carbon} />
      </Rod>
      {/* Sayap belakang */}
      <Box args={[1.0, 0.035, 0.32]} p={[0, 0.95, -2.22]} c={carbon} radius={0.012} />
      <Box args={[1.0, 0.03, 0.2]} p={[0, 1.07, -2.28]} r={[0.35, 0, 0]} c={P.secondary} radius={0.01} />
      {[1, -1].map((s) => (
        <Box key={s} args={[0.03, 0.58, 0.6]} p={[s * 0.51, 0.82, -2.2]} c={P.primary} radius={0.01} />
      ))}
      <Box args={[0.06, 0.55, 0.08]} p={[0, 0.66, -2.12]} c={carbon} radius={0.015} />
      {/* Suspensi */}
      {[1, -1].map((s) => (
        <React.Fragment key={s}>
          <Rod a={[s * 0.28, 0.42, 1.35]} b={[s * 0.72, R + 0.05, 1.78]} r={0.018}><Solid color={carbon} /></Rod>
          <Rod a={[s * 0.28, 0.24, 1.5]} b={[s * 0.72, R - 0.08, 1.78]} r={0.018}><Solid color={carbon} /></Rod>
          <Rod a={[s * 0.3, 0.42, -1.3]} b={[s * 0.66, R + 0.05, -1.55]} r={0.018}><Solid color={carbon} /></Rod>
          <Rod a={[s * 0.3, 0.22, -1.4]} b={[s * 0.66, R - 0.08, -1.55]} r={0.018}><Solid color={carbon} /></Rod>
        </React.Fragment>
      ))}
      {/* Roda */}
      {[1, -1].map((s) => (
        <React.Fragment key={s}>
          <Tyre kind="slick" radius={R} width={0.32} spin={spin} position={[s * 0.86, R, 1.78]} stripe={P.accent} />
          <Tyre kind="slick" radius={R + 0.01} width={0.42} spin={spin} position={[s * 0.84, R + 0.01, -1.55]} stripe={P.accent} />
        </React.Fragment>
      ))}
    </group>
  );
};

const cigarGeo = () => {
  const prof: [number, number][] = [
    [0.0, -2.15], [0.1, -2.12], [0.22, -1.9], [0.34, -1.4], [0.42, -0.8], [0.45, -0.1], [0.44, 0.6], [0.39, 1.25], [0.32, 1.75], [0.27, 2.0], [0.0, 2.02],
  ];
  return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40);
};

const Vintage1950s: React.FC<{ P: ConceptPalette; spin: number; number: string; material: MaterialName }> = ({ P, spin, number, material }) => {
  const geo = useMemo(cigarGeo, []);
  const num = useMemo(() => decalTexture(number, { bg: "#ffffff", ink: "#111111" }), [number]);
  const R = 0.42;
  const BY = 0.5; // tinggi sumbu bodi
  const chrome = <meshPhysicalMaterial color="#d8dade" metalness={1} roughness={0.18} />;
  return (
    <group>
      {/* Bodi cerutu */}
      <mesh geometry={geo} position={[0, BY, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.82]} castShadow>
        <Solid material={material} color={P.primary} />
      </mesh>
      {/* Gril oval + bingkai krom */}
      <mesh position={[0, BY, 2.0]} scale={[1, 0.8, 1]}>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial color="#121212" roughness={0.6} />
      </mesh>
      <mesh position={[0, BY, 2.0]} scale={[1, 0.8, 1]}>
        <torusGeometry args={[0.245, 0.022, 10, 40]} />
        {chrome}
      </mesh>
      {[-0.12, -0.04, 0.04, 0.12].map((x) => (
        <mesh key={x} position={[x, BY, 2.01]}>
          <boxGeometry args={[0.012, 0.3, 0.01]} />
          {chrome}
        </mesh>
      ))}
      {/* Kokpit, pembalap, setir, kaca angin, sirip kepala */}
      <mesh position={[0, BY + 0.36, -0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.34, 0.6, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#1a1412" />
      </mesh>
      <mesh position={[0, BY + 0.47, -0.4]}>
        <cylinderGeometry args={[0.16, 0.18, 0.3, 18]} />
        <Solid material="fabric" color="#7da7d9" />
      </mesh>
      <mesh position={[0, BY + 0.72, -0.4]}>
        <sphereGeometry args={[0.12, 24, 18]} />
        <Solid material="toySkin" color="#e6b28c" />
      </mesh>
      <mesh position={[0, BY + 0.745, -0.41]} scale={[1.04, 1, 1.06]}>
        <sphereGeometry args={[0.12, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <Solid material="clay" color="#6e4426" />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.045, BY + 0.765, -0.3]}>
          <torusGeometry args={[0.032, 0.01, 8, 18]} />
          {chrome}
        </mesh>
      ))}
      <mesh position={[0, BY + 0.6, -0.05]} rotation={[-1.0, 0, 0]}>
        <torusGeometry args={[0.15, 0.014, 8, 28]} />
        <Solid color="#3a2a1e" />
      </mesh>
      <mesh position={[0, BY + 0.5, 0.12]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 24, 1, true, -0.85, 1.7]} />
        <meshPhysicalMaterial color="#cfe8ff" transmission={0.7} roughness={0.05} transparent opacity={0.55} side={THREE.DoubleSide} metalness={0} />
      </mesh>
      <mesh position={[0, BY + 0.3, -0.95]} scale={[0.17, 0.2, 0.5]}>
        <sphereGeometry args={[1, 24, 16]} />
        <Solid material={material} color={P.primary} />
      </mesh>
      {/* Roundel nomor di kedua sisi */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.45, BY + 0.02, -0.25]} rotation={[0, s * Math.PI / 2, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial map={num} transparent toneMapped={false} />
        </mesh>
      ))}
      {/* Knalpot krom di sisi kanan */}
      {[0, 1, 2].map((i) => (
        <Rod key={i} a={[-0.4 - i * 0.02, BY - 0.06 + i * 0.06, 0.7]} b={[-0.52, BY - 0.12 + i * 0.03, -1.4]} r={0.025}>
          {chrome}
        </Rod>
      ))}
      <mesh position={[-0.53, BY - 0.1, -1.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.7, 18, 1, true]} />
        <meshPhysicalMaterial color="#d8dade" metalness={1} roughness={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* Suspensi */}
      {[1, -1].map((s) => (
        <React.Fragment key={s}>
          <Rod a={[s * 0.28, BY, 1.25]} b={[s * 0.62, R, 1.25]} r={0.025}><Solid color="#2a2a2a" /></Rod>
          <Rod a={[s * 0.3, BY - 0.05, -1.05]} b={[s * 0.62, R, -1.05]} r={0.03}><Solid color="#2a2a2a" /></Rod>
        </React.Fragment>
      ))}
      {[1, -1].map((s) => (
        <React.Fragment key={s}>
          <Tyre kind="wire" radius={R} width={0.15} spin={spin} position={[s * 0.68, R, 1.25]} />
          <Tyre kind="wire" radius={R + 0.02} width={0.17} spin={spin} position={[s * 0.68, R + 0.02, -1.05]} />
        </React.Fragment>
      ))}
    </group>
  );
};

/**
 * Mobil balap formula per era, dalam meter lalu diskalakan M (0,6 unit/m) × `scale`, moncong ke +z.
 * - `modern`: hidung panjang, sayap depan/belakang, sidepod, halo, ban slick lebar dengan garis
 *   warna, pembalap berhelm.
 * - `1950s`: bodi cerutu, gril oval krom, roda jari-jari kawat tinggi, kaca angin kecil, pembalap
 *   bertopi kulit + kacamata, knalpot krom, roundel nomor di sisi.
 * `speed` (m/dtk) memutar roda; `palette.primary` = cat bodi.
 */
export const RaceCar: React.FC<ConceptProps & { era?: "modern" | "1950s"; number?: number | string; speed?: number }> = ({
  era = "modern",
  number = 1,
  speed = 0,
  f = 0,
  palette,
  material = "toyPlastic",
  position,
  rotation,
  scale = 1,
}) => {
  const P = pal(palette, era === "1950s" ? { primary: "#c3201b", accent: "#f2b400" } : { primary: "#1f4fd6", secondary: "#f2b400", accent: "#e8423f" });
  const spin = (sec(f) * speed) / (era === "1950s" ? 0.42 : 0.36);
  return (
    <group position={position} rotation={rotation} scale={M * scale}>
      {era === "1950s" ? <Vintage1950s P={P} spin={spin} number={String(number)} material={material} /> : <ModernF1 P={P} spin={spin} number={String(number)} material={material} />}
    </group>
  );
};
