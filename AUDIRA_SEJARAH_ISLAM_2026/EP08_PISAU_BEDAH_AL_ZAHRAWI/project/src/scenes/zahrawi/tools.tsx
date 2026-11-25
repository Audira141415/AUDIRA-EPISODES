// EP08 instruments and objects (all original procedural geometry, non-graphic): hook, forceps, saw,
// cautery, knife hidden in its sheath, scissors, gut-thread and silk spools, an oud with vibrating
// strings, the 30 part tabs of the book, and the steel tray with the AUDIRA plaque.
import React, { useMemo } from "react";
import * as THREE from "three";
import { lathe } from "../../core/geometry/lathe.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { bladeGeometry } from "./parts.tsx";
import { GUTTER, PAGE_D, PAGE_W, PAL, STACK_H } from "./world.ts";

const Steel: React.FC<{ rough?: number }> = ({ rough = 0.24 }) => (
  <meshPhysicalMaterial color={PAL.steel} metalness={1} roughness={Math.max(0.3, rough)} clearcoat={0.4} clearcoatRoughness={0.1} envMapIntensity={2} />
);
const Brass: React.FC = () => <meshPhysicalMaterial color={PAL.brass} metalness={1} roughness={0.26} />;
const Ebony: React.FC = () => <meshPhysicalMaterial color={PAL.ebony} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} />;

/** Short turned handle along -X from the origin (length L). */
const Handle: React.FC<{ L?: number; r?: number }> = ({ L = 0.5, r = 0.05 }) => {
  const g = useMemo(
    () => lathe([[0, 0], [r * 0.8, 0], [r * 1.2, 0.04], [r, 0.08], [r, L - 0.08], [r * 1.35, L - 0.04], [r * 0.6, L], [0, L + 0.01]], 48),
    [L, r],
  );
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={g} castShadow>
        <Ebony />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[r * 1.25, r * 1.25, 0.05, 32]} />
        <Brass />
      </mesh>
    </group>
  );
};

/** Hook (kait): handle + shaft + curved tip. Local +X = toward the tip. Length ≈ L. */
export const Hook3D: React.FC<{ L?: number }> = ({ L = 1.2 }) => {
  const tip = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0, 0), new THREE.Vector3(0.2, 0, 0.06), new THREE.Vector3(0.19, 0, 0.15), new THREE.Vector3(0.12, 0, 0.17),
    ]);
    return new THREE.TubeGeometry(c, 40, 0.016, 10, false);
  }, []);
  return (
    <group position={[-L / 2, 0, 0]}>
      <group position={[0.42, 0, 0]}>
        <Handle L={0.42} r={0.045} />
      </group>
      <mesh position={[0.42 + (L - 0.62) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, L - 0.62, 16]} />
        <Steel />
      </mesh>
      <mesh geometry={tip} position={[L - 0.2, 0, 0]} castShadow>
        <Steel />
      </mesh>
    </group>
  );
};

/** Forceps (pinset): two bent steel arms joined at the back. */
export const Forceps3D: React.FC<{ L?: number; open?: number }> = ({ L = 1.15, open = 1 }) => (
  <group position={[-L / 2, 0, 0]}>
    {[1, -1].map((s) => (
      <group key={s} rotation={[0, s * 0.07 * open, 0]}>
        <mesh position={[L / 2, 0, s * 0.03]} castShadow>
          <RoundedBoxGeo args={[L, 0.03, 0.06]} radius={0.012} />
          <Steel rough={0.3} />
        </mesh>
      </group>
    ))}
    <mesh position={[0.02, 0, 0]} castShadow>
      <RoundedBoxGeo args={[0.1, 0.05, 0.12]} radius={0.02} />
      <Brass />
    </mesh>
  </group>
);

/** Saw (gergaji): steel blade with teeth + ebony handle. */
export const Saw3D: React.FC<{ L?: number }> = ({ L = 1.1 }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    const b = L * 0.7;
    s.moveTo(0, 0.07);
    s.lineTo(b, 0.07);
    for (let i = 0; i <= 14; i++) s.lineTo(b - (i * b) / 14, i % 2 ? -0.05 : -0.08);
    s.lineTo(0, -0.05);
    s.closePath();
    const e = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 });
    e.rotateX(-Math.PI / 2);
    return e;
  }, [L]);
  return (
    <group position={[-L / 2, 0, 0]}>
      <group position={[0.34, 0, 0]}>
        <Handle L={0.34} r={0.06} />
      </group>
      <mesh geometry={g} position={[0.34, 0, 0]} castShadow>
        <Steel rough={0.3} />
      </mesh>
    </group>
  );
};

/** Cautery (kauter): handle + rod + olive tip. */
export const Cautery3D: React.FC<{ L?: number }> = ({ L = 1.1 }) => (
  <group position={[-L / 2, 0, 0]}>
    <group position={[0.3, 0, 0]}>
      <Handle L={0.3} r={0.05} />
    </group>
    <mesh position={[0.3 + (L - 0.42) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, L - 0.42, 16]} />
      <Steel rough={0.35} />
    </mesh>
    <mesh position={[L - 0.08, 0, 0]} scale={[1.5, 1, 1]} castShadow>
      <sphereGeometry args={[0.07, 24, 16]} />
      <meshPhysicalMaterial color="#8c7f72" metalness={1} roughness={0.42} />
    </mesh>
  </group>
);

/** Knife hidden in its sheath: blade slides out along +X with `out` 0..1. */
export const SheathKnife: React.FC<{ out: number }> = ({ out }) => {
  const blade = useMemo(() => bladeGeometry(), []);
  const grain = useSurfaceGrain(91, 0.16, 6);
  return (
    <group>
      {/* blade first: it sits inside the sheath at out = 0 */}
      <group position={[-0.95 + out * 1.0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.62}>
        <mesh geometry={blade} castShadow>
          <Steel rough={0.16} />
        </mesh>
      </group>
      <mesh position={[-0.35, 0, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.3, 0.1, 0.24]} radius={0.04} />
        <meshPhysicalMaterial color="#a77c42" metalness={1} roughness={0.55} roughnessMap={grain} />
      </mesh>
      {[-0.9, -0.55, 0.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <RoundedBoxGeo args={[0.05, 0.12, 0.26]} radius={0.02} />
          <meshPhysicalMaterial color="#8e6a35" metalness={1} roughness={0.35} />
        </mesh>
      ))}
      <group position={[-1.0, 0, 0]}>
        <Handle L={0.6} r={0.07} />
      </group>
    </group>
  );
};

/** Scissors (gunting): two blades with ring handles around a pivot; `open` 0..1. */
export const Scissors3D: React.FC<{ open: number }> = ({ open }) => {
  const blade = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.04);
    s.lineTo(0.95, 0.012);
    s.quadraticCurveTo(1.0, 0, 0.95, -0.012);
    s.lineTo(0, -0.05);
    s.lineTo(-0.38, -0.03);
    s.lineTo(-0.38, 0.03);
    s.closePath();
    const e = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
    e.rotateX(-Math.PI / 2);
    return e;
  }, []);
  const a = 0.05 + open * 0.32;
  return (
    <group>
      {[1, -1].map((s, i) => (
        <group key={s} rotation={[0, s * a, 0]} position={[0, i * 0.035, 0]}>
          <mesh geometry={blade} castShadow>
            <Steel rough={0.18} />
          </mesh>
          <mesh position={[-0.5, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.13, 0.025, 14, 40]} />
            <Brass />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
        <Brass />
      </mesh>
    </group>
  );
};

/** Bobbin with wound thread (gut: pale cream; silk: glossy white). */
let threadTex: THREE.CanvasTexture | null = null;
const threadStripes = () => {
  if (threadTex) return threadTex;
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 1024;
  const c = cv.getContext("2d")!;
  const r = prng(5);
  for (let y = 0; y < 1024; y += 2) {
    const v = 150 + r() * 105;
    c.fillStyle = `rgb(${v},${v},${v})`;
    c.fillRect(0, y, 64, 2);
  }
  threadTex = new THREE.CanvasTexture(cv);
  threadTex.wrapS = threadTex.wrapT = THREE.RepeatWrapping;
  return threadTex;
};

export const Spool: React.FC<{ color: string; silk?: boolean; turn?: number }> = ({ color, silk = false, turn = 0 }) => {
  const tex = useMemo(() => threadStripes(), []);
  const grain = useSurfaceGrain(57, 0.3, 2);
  return (
    <group rotation={[0, turn, 0]}>
      {[0.03, 0.47].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.06, 64]} />
          <meshPhysicalMaterial color="#5a3a20" roughness={0.42} roughnessMap={grain} bumpMap={grain} bumpScale={0.4} clearcoat={0.55} clearcoatRoughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.38, 64]} />
        <meshPhysicalMaterial
          color={color}
          bumpMap={tex}
          bumpScale={1.2}
          roughness={silk ? 0.28 : 0.55}
          sheen={silk ? 1 : 0.4}
          sheenRoughness={silk ? 0.25 : 0.6}
          sheenColor={new THREE.Color(silk ? "#ffffff" : "#f3e3c2")}
          clearcoat={silk ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
};

/** Loose thread from a spool to a curved needle lying on the tray. */
export const ThreadToNeedle: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; color: string; p: number }> = ({ from, to, color, p }) => {
  const geom = useMemo(() => {
    const m1 = from.clone().lerp(to, 0.33).add(new THREE.Vector3(0.25, 0.02, 0.2));
    const m2 = from.clone().lerp(to, 0.7).add(new THREE.Vector3(-0.2, 0.01, -0.1));
    const c = new THREE.CatmullRomCurve3([from, m1, m2, to]);
    return new THREE.TubeGeometry(c, 120, 0.009, 8, false);
  }, [from, to]);
  const needle = useMemo(() => new THREE.TorusGeometry(0.16, 0.012, 10, 40, Math.PI * 0.95), []);
  geom.setDrawRange(0, Math.max(6, Math.floor((geom.index!.count * Math.min(1, p)) / 48) * 48));
  return (
    <group>
      <mesh geometry={geom} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.5} sheen={0.5} />
      </mesh>
      <mesh geometry={needle} position={[to.x + 0.16, to.y, to.z]} rotation={[-Math.PI / 2, 0, Math.PI]} castShadow>
        <Steel rough={0.2} />
      </mesh>
    </group>
  );
};

/** Oud lying on the table: ribbed bowl, soundboard with rosette, neck, bent pegbox, 5 vibrating courses. */
export const Oud: React.FC<{ f: number; pluck: number }> = ({ f, pluck }) => {
  const ribs = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 64;
    const c = cv.getContext("2d")!;
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? "#7a4a26" : "#a8703f";
      c.fillRect((i * 512) / 16, 0, 512 / 16, 64);
      c.fillStyle = "#e9d8b5";
      c.fillRect((i * 512) / 16, 0, 3, 64);
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const strings = [-0.06, -0.03, 0, 0.03, 0.06];
  const L = 2.2;
  return (
    <group>
      {/* bowl (half ellipsoid, flat soundboard up) */}
      <mesh position={[0, 0.0, 0.9]} scale={[0.85, 0.5, 1.15]} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial map={ribs} roughness={0.35} clearcoat={0.9} clearcoatRoughness={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.002, 0.9]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.85, 1.15, 1]} receiveShadow>
        <circleGeometry args={[1, 64]} />
        <meshPhysicalMaterial color="#d9b47c" roughness={0.45} clearcoat={0.6} />
      </mesh>
      {/* rosette */}
      <mesh position={[0, 0.006, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.16, 48]} />
        <meshPhysicalMaterial color="#5b3a1e" roughness={0.5} />
      </mesh>
      {/* bridge */}
      <mesh position={[0, 0.03, 1.45]} castShadow>
        <RoundedBoxGeo args={[0.42, 0.05, 0.06]} radius={0.015} />
        <meshPhysicalMaterial color="#2a1a10" roughness={0.4} clearcoat={0.6} />
      </mesh>
      {/* neck + fingerboard */}
      <mesh position={[0, 0.03, -0.25 - 0.35]} castShadow>
        <RoundedBoxGeo args={[0.22, 0.08, 0.9]} radius={0.03} />
        <meshPhysicalMaterial color="#1f150e" roughness={0.3} clearcoat={0.8} />
      </mesh>
      {/* pegbox bent back */}
      <group position={[0, 0.06, -1.05]} rotation={[-0.5, 0, 0]}>
        <mesh position={[0, 0, -0.3]} castShadow>
          <RoundedBoxGeo args={[0.16, 0.08, 0.6]} radius={0.025} />
          <meshPhysicalMaterial color="#6b4324" roughness={0.4} clearcoat={0.6} />
        </mesh>
        {[-0.1, -0.22, -0.34, -0.46].flatMap((z) => [-1, 1].map((s) => (
          <mesh key={`${z}${s}`} position={[s * 0.12, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.012, 0.12, 12]} />
            <meshPhysicalMaterial color="#2a1a10" roughness={0.35} />
          </mesh>
        )))}
      </group>
      {/* strings: nut (z -1.05) to bridge (z 1.45); each vibrates after the pluck */}
      {strings.map((x, i) => {
        const age = Math.max(0, f - pluck - i * 3);
        const amp = pluck > 0 && f >= pluck ? 0.012 * Math.exp(-age / 90) : 0;
        const wob = amp * Math.sin(age * (1.9 + i * 0.13));
        return (
          <mesh key={i} position={[x + wob, 0.085, (1.45 - 1.05) / 2]} rotation={[Math.PI / 2, 0, 0]} scale={[1 + Math.abs(wob) * 60, 1, 1 + Math.abs(wob) * 60]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, L + 0.3, 6]} />
            <meshPhysicalMaterial color="#e9e2d0" roughness={0.4} sheen={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

/** 30 part tabs rising out of the right page block's far edge; tab 30 (the last, surgery) lifts and turns copper. */
export const PartTabs: React.FC<{ k: number; last: number }> = ({ k, last }) => {
  if (k <= 0.001 && last <= 0.001) return null;
  const tones = ["#e8dcc0", "#d8c6a0", "#efe4cc", "#cbb48b"];
  return (
    <group>
      {Array.from({ length: 30 }, (_, i) => {
        const x = GUTTER + 0.2 + (i * (PAGE_W - 0.4)) / 29;
        const ki = Math.min(1, Math.max(0, k * 1.6 - (i / 29) * 0.6));
        const isLast = i === 29;
        const h = (0.3 + (i % 3) * 0.04) * ki + (isLast ? 0.5 * last : 0);
        if (h <= 0.002) return null;
        return (
          <mesh key={i} position={[x, STACK_H + 0.05 + h / 2, -PAGE_D / 2 + 0.06]} rotation={[-0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.075, h, 0.006]} />
            <meshPhysicalMaterial color={isLast && last > 0.01 ? "#b4482c" : tones[i % 4]} {...POLISH.paper} />
          </mesh>
        );
      })}
    </group>
  );
};

/** AUDIRA plaque texture: engraved dark letters on brushed brass (not emissive). */
let plaqueTex: THREE.CanvasTexture | null = null;
const plaque = () => {
  if (plaqueTex) return plaqueTex;
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 256;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 1024, 256);
  g.addColorStop(0, "#c8a062");
  g.addColorStop(0.5, "#e2c48c");
  g.addColorStop(1, "#b88c4c");
  c.fillStyle = g;
  c.fillRect(0, 0, 1024, 256);
  c.strokeStyle = "rgba(60,40,15,0.5)";
  c.lineWidth = 6;
  c.strokeRect(14, 14, 996, 228);
  c.fillStyle = "#2b1d0c";
  c.font = "800 150px Manrope, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("AUDIRA", 512, 136);
  plaqueTex = new THREE.CanvasTexture(cv);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;
  plaqueTex.anisotropy = 8;
  return plaqueTex;
};

/** Dark graphite instrument tray with a raised steel lip. */
export const Tray: React.FC<{ w: number; d: number }> = ({ w, d }) => {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <RoundedBoxGeo args={[w, 0.05, d]} radius={0.02} />
        <meshPhysicalMaterial color="#1b1c1f" metalness={0.25} roughness={0.48} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      {[
        [0, -d / 2, w, 0.05],
        [0, d / 2, w, 0.05],
        [-w / 2, 0, 0.05, d],
        [w / 2, 0, 0.05, d],
      ].map(([x, z, sx, sz], i) => (
        <mesh key={i} position={[x, 0.08, z]} castShadow receiveShadow>
          <RoundedBoxGeo args={[sx, 0.12, sz]} radius={0.02} />
          <meshPhysicalMaterial color="#9a9ea3" metalness={1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

/** Instrument-maker's brass plate engraved AUDIRA, lying on the map plate's south-east corner. */
export const MakerPlate: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const tex = useMemo(() => plaque(), []);
  return (
    <group position={at} rotation={[0, -0.05, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.3, 0.04, 0.34]} radius={0.012} />
        <meshPhysicalMaterial color="#b88c4c" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.26, 0.33]} />
        <meshPhysicalMaterial map={tex} metalness={0.85} roughness={0.32} />
      </mesh>
    </group>
  );
};
