// SEJARAH MAKKAH · EP01 — cover / first key image (TIMEFORGE).
// One dignified Ka'bah on a white marble mataf plinth, ringed by a time-diorama of eras on a
// travertine ring: Ibrahim's foundations, Quraysh ship timber (~605), Ibn Zubair's two ground
// doors (683), the walled west door (693), the 1630 flood line, the 1996 scaffold.
// Depiction rules: no prophet, no figure; the Ka'bah is never damaged; eras are shown by objects.
//
// Authored for 9:16; the wide (16:9) composition shifts the camera so the Ka'bah sits right of
// centre and the title takes the left third. FormatFov (inside Finish) converts the fov.

import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FONT } from "../../core/type/fonts.ts";

export const KABAH_COVER_SECONDS = 4;

// ---------- palette ----------
const C = {
  bg: "#ece3d4",
  fog: "#e8dfcf",
  floor: "#d9ccb7",
  marble: "#f1eee8",
  travertine: "#d6c6ab",
  pearl: "#f4efe6",
  brass: "#b8903f",
  gold: "#c9a046",
  goldDeep: "#8c6a26",
  kiswah: "#121111",
  ink: "#1d1a16",
  inkSoft: "#6b6257",
  accent: "#3fb8c9",
  warmGlow: "#ffcf86",
  wood: "#8b5a33",
  sand: "#d6c19a",
  stone: "#a8927a",
  granite: "#8f8b86",
  steel: "#b9bcc0",
};

// Ka'bah proportions (world units): door side ~12 m, side ~10 m, height ~15 m -> 1 u ≈ 3.3 m.
const K = { w: 3.6, d: 3.0, h: 4.5, base: 0.13 };
const RING_R = 10.9;

// ---------- canvas textures (seeded, deterministic) ----------
const canvasTex = (size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, repeat: [number, number] = [1, 1]) => {
  if (typeof document === "undefined") return new THREE.Texture();
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
};

/** Black kiswah: woven damask lattice, barely visible, so the cloth reads as fabric not plastic. */
const kiswahTex = () =>
  canvasTex(
    512,
    (g, s) => {
      g.fillStyle = "#211f1d";
      g.fillRect(0, 0, s, s);
      g.strokeStyle = "#2d2a27";
      g.lineWidth = 5;
      const n = 4;
      for (let i = -n; i <= n * 2; i++) {
        g.beginPath();
        g.moveTo((i * s) / n, 0);
        g.lineTo((i * s) / n + s, s);
        g.stroke();
        g.beginPath();
        g.moveTo((i * s) / n, s);
        g.lineTo((i * s) / n + s, 0);
        g.stroke();
      }
      g.fillStyle = "#2a2724";
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          g.beginPath();
          g.arc(((x + 0.5) * s) / n, ((y + 0.5) * s) / n, s / n / 7, 0, Math.PI * 2);
          g.fill();
        }
    },
    [4, 5],
  );


/** Kiswah drape: soft vertical folds plus the woven lattice, used as a bump map. */
const foldTex = () =>
  canvasTex(
    512,
    (g, s) => {
      const rnd = prng(57);
      const grd = g.createLinearGradient(0, 0, s, 0);
      for (let i = 0; i <= 12; i++) {
        const v = 110 + Math.round(Math.sin(i * 1.7 + rnd() * 2) * 40 + rnd() * 30);
        grd.addColorStop(i / 12, `rgb(${v},${v},${v})`);
      }
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 3;
      const n = 4;
      for (let i = -n; i <= n * 2; i++) {
        g.beginPath(); g.moveTo((i * s) / n, 0); g.lineTo((i * s) / n + s, s); g.stroke();
        g.beginPath(); g.moveTo((i * s) / n, s); g.lineTo((i * s) / n + s, 0); g.stroke();
      }
    },
    [3, 1],
  );

/** Gold band (hizam): cartouche panels with embossed borders and rosettes (no imitation script). */
const bandTex = () =>
  canvasTex(
    1024,
    (g, s) => {
      g.fillStyle = "#ddb75e";
      g.fillRect(0, 0, s, s);
      const panels = 4;
      for (let i = 0; i < panels; i++) {
        const x0 = (i * s) / panels;
        g.strokeStyle = "#6f5219";
        g.lineWidth = 14;
        g.strokeRect(x0 + 26, 70, s / panels - 52, s - 140);
        g.strokeStyle = "#e6c779";
        g.lineWidth = 5;
        g.strokeRect(x0 + 44, 92, s / panels - 88, s - 184);
        g.fillStyle = "#7c5c1e";
        g.beginPath();
        g.arc(x0 + s / panels / 2, s / 2, 70, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#d8b766";
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          g.beginPath();
          g.arc(x0 + s / panels / 2 + Math.cos(a) * 42, s / 2 + Math.sin(a) * 42, 16, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.fillStyle = "#6f5219";
      g.fillRect(0, 0, s, 30);
      g.fillRect(0, s - 30, s, 30);
    },
    [1, 1],
  );

/** Mataf marble: concentric hairline rings and faint veining. */
const matafTex = () =>
  canvasTex(2048, (g, s) => {
    g.fillStyle = "#f2efe9";
    g.fillRect(0, 0, s, s);
    const rnd = prng(41);
    g.strokeStyle = "rgba(160,150,135,0.10)";
    for (let i = 0; i < 90; i++) {
      g.lineWidth = 1 + rnd() * 2;
      g.beginPath();
      let x = rnd() * s, y = rnd() * s;
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (rnd() - 0.5) * 260;
        y += (rnd() - 0.5) * 260;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.strokeStyle = "rgba(150,135,110,0.22)";
    for (let r = 0.12; r < 0.5; r += 0.045) {
      g.lineWidth = 3;
      g.beginPath();
      g.arc(s / 2, s / 2, r * s, 0, Math.PI * 2);
      g.stroke();
    }
  });

// ---------- small helpers ----------
type V3 = [number, number, number];
const Box: React.FC<{ s: V3; p?: V3; r?: V3; c: string; rough?: number; metal?: number; radius?: number; emissive?: string; ei?: number; cast?: boolean; mat?: Record<string, unknown> }> = ({
  s, p = [0, 0, 0], r = [0, 0, 0], c, rough = 0.7, metal = 0, radius, emissive, ei = 0, cast = true, mat,
}) => (
  <mesh position={p} rotation={r} castShadow={cast} receiveShadow>
    <RoundedBoxGeo args={s} radius={radius ?? Math.min(...s) * 0.12} segments={3} />
    <meshPhysicalMaterial color={c} roughness={rough} metalness={metal} emissive={emissive ?? "#000000"} emissiveIntensity={ei} {...mat} />
  </mesh>
);

// ---------- the Ka'bah ----------
const Kabah: React.FC = () => {
  const kis = useMemo(kiswahTex, []);
  const fold = useMemo(foldTex, []);
  const band = useMemo(bandTex, []);
  const grain = useSurfaceGrain(5, 0.18, 4);
  const { w, d, h, base } = K;
  const bandY = base + h * 0.69;
  const doorX = -0.62;
  const doorBottom = base + h * 0.15;
  const doorH = h * 0.215;
  const doorW = 0.56;

  // Hijr Ismail: a low semicircular marble wall off the north-west (+x) face.
  const hijr = useMemo(() => {
    const rx = 2.45, rz = 1.55, t = 0.15;
    const a0 = -Math.PI * 0.44, a1 = Math.PI * 0.44;
    const sh = new THREE.Shape();
    const N = 48;
    for (let i = 0; i <= N; i++) {
      const a = a0 + ((a1 - a0) * i) / N;
      const x = Math.cos(a) * rx, z = Math.sin(a) * rz;
      if (i === 0) sh.moveTo(x, z);
      else sh.lineTo(x, z);
    }
    for (let i = N; i >= 0; i--) {
      const a = a0 + ((a1 - a0) * i) / N;
      sh.lineTo(Math.cos(a) * (rx - t), Math.sin(a) * (rz - t));
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2, curveSegments: 4 });
    g.rotateX(-Math.PI / 2); // shape y -> world -z, extrude up
    return g;
  }, []);

  return (
    <group>
      {/* shadharwan: sloped marble skirt */}
      <Box s={[w + 0.26, base, d + 0.26]} p={[0, base / 2, 0]} c={C.marble} rough={0.32} radius={0.04} />
      {/* body, wrapped in the kiswah */}
      <mesh position={[0, base + h / 2, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[w, h, d]} radius={0.035} segments={4} />
        <meshPhysicalMaterial map={kis} color="#ffffff" roughness={0.78} roughnessMap={grain} bumpMap={fold} bumpScale={2.2} sheen={0.45} sheenRoughness={0.5} sheenColor={new THREE.Color("#4a4844")} metalness={0} />
      </mesh>
      {/* gold band (hizam) */}
      <mesh position={[0, bandY, 0]} castShadow>
        <RoundedBoxGeo args={[w + 0.035, h * 0.075, d + 0.035]} radius={0.012} segments={2} />
        <meshPhysicalMaterial map={band} color="#ffffff" metalness={0.85} roughness={0.22} clearcoat={0.6} clearcoatRoughness={0.15} bumpMap={band} bumpScale={1.5} emissive="#3a2a08" emissiveIntensity={0.3} />
      </mesh>
      {/* door: frame, two gold leaves, stair-free (raised above the ground) */}
      <Box s={[doorW + 0.14, doorH + 0.12, 0.05]} p={[doorX, doorBottom + doorH / 2, d / 2 + 0.02]} c={C.goldDeep} metal={0.9} rough={0.4} radius={0.012} />
      {[-1, 1].map((sd) => (
        <Box key={`d${sd}`} s={[doorW / 2 - 0.012, doorH, 0.05]} p={[doorX + (sd * doorW) / 4, doorBottom + doorH / 2, d / 2 + 0.04]} c="#e4bf68" metal={0.75} rough={0.26} radius={0.01} mat={{ emissive: "#3a2a08", emissiveIntensity: 0.4, clearcoat: 0.5 }} />
      ))}
      {[0.25, 0.5, 0.75].map((k) => (
        <Box key={`dl${k}`} s={[doorW - 0.04, 0.012, 0.02]} p={[doorX, doorBottom + doorH * k, d / 2 + 0.068]} c={C.goldDeep} metal={1} rough={0.3} radius={0.004} cast={false} />
      ))}
      {/* Hajar Aswad corner (east): silver frame around a dark stone */}
      <group position={[-w / 2 - 0.02, base + h * 0.1 + 0.02, d / 2 + 0.02]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.1, 0.03, 16, 40]} />
          <meshPhysicalMaterial color="#d9dcdf" metalness={1} roughness={0.22} />
        </mesh>
        <mesh scale={[0.085, 0.085, 0.04]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshPhysicalMaterial color="#1a1614" roughness={0.25} clearcoat={0.6} />
        </mesh>
      </group>
      {/* Hijr Ismail */}
      <mesh geometry={hijr} position={[w / 2 + 0.05, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={C.marble} roughness={0.3} clearcoat={0.2} />
      </mesh>
    </group>
  );
};

// ---------- the mataf plinth and the time ring ----------
const Stage: React.FC = () => {
  const mataf = useMemo(matafTex, []);
  const grain = useSurfaceGrain(9, 0.2, 6);
  const ringGeo = useMemo(() => {
    const pts = [new THREE.Vector2(8.7, -0.62), new THREE.Vector2(13.4, -0.62), new THREE.Vector2(13.4, -0.24), new THREE.Vector2(8.7, -0.24), new THREE.Vector2(8.7, -0.62)];
    return new THREE.LatheGeometry(pts, 160);
  }, []);
  const ticks = useMemo(() => Array.from({ length: 72 }, (_, i) => (i / 72) * Math.PI * 2), []);
  return (
    <group>
      {/* endless warm floor (fog fades it into the backdrop: no visible set edge in 16:9) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
        <circleGeometry args={[1200, 96]} />
        <meshStandardMaterial color={C.floor} roughness={0.95} />
      </mesh>
      {/* mataf: white marble disc */}
      <mesh position={[0, -0.31, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8.3, 8.4, 0.62, 160]} />
        <meshPhysicalMaterial color={C.marble} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[8.3, 160]} />
        <meshPhysicalMaterial map={mataf} color="#ffffff" roughness={0.3} clearcoat={0.35} clearcoatRoughness={0.25} />
      </mesh>
      {/* brass time rail + glowing inlay */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} castShadow>
        <torusGeometry args={[8.18, 0.07, 16, 220]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[7.55, 7.62, 200]} />
        <meshBasicMaterial color={C.warmGlow} toneMapped={false} />
      </mesh>
      {/* era ring: travertine annulus one step lower */}
      <mesh geometry={ringGeo} castShadow receiveShadow>
        <meshPhysicalMaterial color={C.travertine} roughness={0.82} roughnessMap={grain} side={THREE.DoubleSide} />
      </mesh>
      {ticks.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 13.0, -0.235, Math.cos(a) * 13.0]} rotation={[0, a, 0]} receiveShadow>
          <boxGeometry args={[0.035, 0.012, i % 6 === 0 ? 0.6 : 0.28]} />
          <meshStandardMaterial color={i % 6 === 0 ? C.brass : "#a89273"} metalness={i % 6 === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.24, 0]}>
        <torusGeometry args={[13.38, 0.05, 12, 220]} />
        <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- era vignettes ----------
const Pedestal: React.FC = () => (
  <>
    <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.3, 1.36, 0.22, 64]} />
      <meshPhysicalMaterial color={C.pearl} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.222, 0]}>
      <torusGeometry args={[1.22, 0.012, 8, 96]} />
      <meshPhysicalMaterial color={C.brass} metalness={1} roughness={0.3} />
    </mesh>
    {/* brass year plaque */}
    <Box s={[0.9, 0.05, 0.3]} p={[0, 0.2, 1.42]} r={[-0.5, 0, 0]} c={C.brass} metal={1} rough={0.3} radius={0.015} />
  </>
);

const Ibrahim: React.FC = () => {
  const stones = useMemo(() => {
    const rnd = prng(17);
    const out: { p: V3; s: V3; r: number }[] = [];
    const W = 1.7, D = 1.25;
    const per = 2 * (W + D);
    for (let i = 0; i < 22; i++) {
      let u = (i / 22) * per;
      let x: number, z: number;
      if (u < W) { x = -W / 2 + u; z = -D / 2; }
      else if ((u -= W) < D) { x = W / 2; z = -D / 2 + u; }
      else if ((u -= D) < W) { x = W / 2 - u; z = D / 2; }
      else { u -= W; x = -W / 2; z = D / 2 - u; }
      out.push({ p: [x + (rnd() - 0.5) * 0.04, 0.3, z + (rnd() - 0.5) * 0.04], s: [0.14 + rnd() * 0.04, 0.1 + rnd() * 0.04, 0.12 + rnd() * 0.03], r: rnd() * 3 });
    }
    return out;
  }, []);
  return (
    <group>
      <Box s={[2.1, 0.07, 1.65]} p={[0, 0.255, 0]} c={C.sand} rough={0.95} radius={0.02} />
      {/* glowing foundation line */}
      {[
        [[1.7, 0.012, 0.03], [0, 0.296, -0.625]],
        [[1.7, 0.012, 0.03], [0, 0.296, 0.625]],
        [[0.03, 0.012, 1.25], [-0.85, 0.296, 0]],
        [[0.03, 0.012, 1.25], [0.85, 0.296, 0]],
      ].map(([s, p], i) => (
        <mesh key={i} position={p as V3}>
          <boxGeometry args={s as V3} />
          <meshBasicMaterial color={C.warmGlow} toneMapped={false} />
        </mesh>
      ))}
      {stones.map((st, i) => (
        <mesh key={i} position={st.p} scale={st.s} rotation={[0, st.r, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1, 20, 14]} />
          <meshPhysicalMaterial color={C.stone} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

const Quraysh: React.FC = () => {
  const grain = useSurfaceGrain(23, 0.25, 2);
  return (
    <group>
      {/* stranded hull: curved planks lying on their side */}
      <group position={[-0.25, 0.42, -0.1]} rotation={[0, 0.5, 0.55]}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = -0.9 + i * 0.3;
          return (
            <mesh key={i} position={[0, Math.sin(a) * 0.42, -Math.cos(a) * 0.42 + 0.42]} rotation={[a, 0, 0]} castShadow receiveShadow>
              <RoundedBoxGeo args={[1.55 - Math.abs(a) * 0.35, 0.035, 0.12]} radius={0.012} segments={2} />
              <meshPhysicalMaterial color={i % 2 ? C.wood : "#7a4c2b"} roughness={0.72} roughnessMap={grain} />
            </mesh>
          );
        })}
        <Box s={[0.06, 0.06, 0.62]} p={[0.55, 0.0, 0.42]} r={[0, 0, 0]} c="#6b4226" rough={0.7} />
      </group>
      {/* planks stacked for the roof */}
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} s={[0.95, 0.05, 0.13]} p={[0.55, 0.25 + i * 0.055, 0.4]} r={[0, (i % 2 ? 0.08 : -0.05) + 1.3, 0]} c={i % 2 ? "#9a6a3e" : C.wood} rough={0.7} radius={0.012} />
      ))}
    </group>
  );
};

const MiniKabah: React.FC<{ len?: number }> = ({ len = 1.35 }) => (
  <group>
    <Box s={[len, 0.95, 0.92]} p={[0, 0.22 + 0.475, 0]} c="#1a1817" rough={0.75} radius={0.012} mat={{ sheen: 0.6, sheenColor: new THREE.Color("#5a5650") }} />
    <Box s={[len + 0.012, 0.07, 0.932]} p={[0, 0.22 + 0.66, 0]} c={C.gold} metal={0.9} rough={0.35} radius={0.006} cast={false} />
  </group>
);

const TwoDoors: React.FC = () => (
  <group rotation={[0, -0.55, 0]}>
    <MiniKabah len={1.5} />
    {/* ground-level doors on east and west faces, lit from within */}
    <Box s={[0.2, 0.34, 0.02]} p={[-0.35, 0.22 + 0.17, 0.468]} c="#000" emissive={C.warmGlow} ei={2.6} cast={false} radius={0.004} />
    <Box s={[0.02, 0.34, 0.2]} p={[0.758, 0.22 + 0.17, 0.1]} c="#000" emissive={C.warmGlow} ei={2.6} cast={false} radius={0.004} />
    {/* light pooling on the ground in front of each door */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.35, 0.226, 0.7]}>
      <planeGeometry args={[0.3, 0.42]} />
      <meshBasicMaterial color={C.warmGlow} transparent opacity={0.35} toneMapped={false} depthWrite={false} />
    </mesh>
  </group>
);

const WalledDoor: React.FC = () => {
  const bricks = useMemo(() => {
    const out: V3[] = [];
    for (let row = 0; row < 5; row++)
      for (let k = 0; k < 3; k++) out.push([-0.12 + k * 0.12 + (row % 2 ? 0.06 : 0) - 0.03, 0.22 + 0.05 + row * 0.085, 0]);
    return out;
  }, []);
  return (
    <group>
      <Box s={[0.6, 1.05, 0.28]} p={[-0.48, 0.22 + 0.525, 0]} c={C.stone} rough={0.9} radius={0.02} />
      <Box s={[0.6, 1.05, 0.28]} p={[0.48, 0.22 + 0.525, 0]} c={C.stone} rough={0.9} radius={0.02} />
      <Box s={[0.38, 0.33, 0.28]} p={[0, 0.22 + 0.885, 0]} c={C.stone} rough={0.9} radius={0.02} />
      {bricks.map((p, i) => (
        <Box key={i} s={[0.11, 0.075, 0.2]} p={p} c={i % 3 ? "#c2a986" : "#b69c79"} rough={0.92} radius={0.01} />
      ))}
      {/* the opening above the bricks, still dark */}
      <Box s={[0.36, 0.28, 0.05]} p={[0, 0.22 + 0.58, -0.1]} c="#2a221b" rough={1} cast={false} radius={0.005} />
    </group>
  );
};

const FloodWall: React.FC = () => {
  const blocks = useMemo(() => {
    const rnd = prng(31);
    const out: { p: V3; c: string }[] = [];
    for (let row = 0; row < 6; row++)
      for (let k = 0; k < 5; k++) {
        const v = Math.floor(rnd() * 3);
        out.push({ p: [-0.66 + k * 0.33 + (row % 2 ? 0.08 : -0.04), 0.22 + 0.1 + row * 0.205, -0.1], c: ["#8f8b86", "#9b958d", "#837f79"][v] });
      }
    return out;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <Box key={i} s={[0.31, 0.19, 0.26]} p={b.p} c={b.c} rough={0.6} radius={0.02} />
      ))}
      {/* flood water up to half the wall height */}
      <mesh position={[0, 0.22 + 0.31, 0.25]}>
        <boxGeometry args={[1.9, 0.62, 0.95]} />
        <meshPhysicalMaterial color="#8c7553" roughness={0.12} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* flood line on the wall */}
      <mesh position={[0, 0.22 + 0.62, 0.035]}>
        <boxGeometry args={[1.72, 0.025, 0.01]} />
        <meshBasicMaterial color={C.accent} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Scaffold: React.FC = () => {
  const poles: V3[] = [];
  for (const x of [-0.62, 0, 0.62]) for (const z of [-0.55, 0.55]) poles.push([x, 0.22 + 0.75, z]);
  return (
    <group rotation={[0, 0.35, 0]}>
      <MiniKabah len={1.05} />
      {poles.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.5, 10]} />
          <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.3} />
        </mesh>
      ))}
      {[0.45, 0.85, 1.25].map((y) =>
        [-0.55, 0.55].map((z) => (
          <mesh key={`${y}${z}`} position={[0, 0.22 + y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 1.3, 8]} />
            <meshPhysicalMaterial color={C.steel} metalness={1} roughness={0.32} />
          </mesh>
        )),
      )}
      {[0.85, 1.25].map((y) => (
        <Box key={y} s={[1.3, 0.025, 0.2]} p={[0, 0.22 + y + 0.02, 0.62]} c="#a5784a" rough={0.75} radius={0.006} />
      ))}
    </group>
  );
};


// Tawaf crowd as points only (no figures): soft cream dots in a band around the Ka'bah.
const Crowd: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const N = 900;
  useLayoutEffect(() => {
    const rnd = prng(73);
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const r = 2.75 + Math.pow(rnd(), 1.6) * 2.6;
      const a = rnd() * Math.PI * 2;
      const x = Math.sin(a) * r * 1.08, z = Math.cos(a) * r;
      // keep the Hijr and the door side clear of dots
      if (x > 1.75 && x < 4.6 && Math.abs(z) < 2.0) { m.makeScale(0, 0, 0); ref.current!.setMatrixAt(i, m); continue; }
      const k = 0.038 + rnd() * 0.012;
      m.makeScale(k, k * 1.25, k).setPosition(x, k * 1.2, z);
      ref.current!.setMatrixAt(i, m);
      col.set(rnd() < 0.85 ? "#fbf8f2" : "#e2d6c2");
      ref.current!.setColorAt(i, col);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, N]} rotation={[0, t * 0.12, 0]} castShadow>
      <meshPhysicalMaterial roughness={0.6} />
    </instancedMesh>
  );
};

type Era = { id: string; a: number; year: string; desc: string; El: React.FC };
// Angle around the ring (0 = toward the 9:16 camera, +x to the right). Chronological, clockwise
// as seen from above.
const ERAS: Era[] = [
  { id: "ibrahim", a: (284 * Math.PI) / 180, year: "MASA IBRAHIM", desc: "fondasi tanpa atap", El: Ibrahim },
  { id: "quraisy", a: (201 * Math.PI) / 180, year: "± 605 M", desc: "atap kayu kapal", El: Quraysh },
  { id: "zubair", a: (159 * Math.PI) / 180, year: "683 M", desc: "dua pintu rata tanah", El: TwoDoors },
  { id: "hajjaj", a: (106 * Math.PI) / 180, year: "693 M", desc: "pintu barat ditutup", El: WalledDoor },
  { id: "banjir", a: (17 * Math.PI) / 180, year: "1630 M", desc: "garis banjir", El: FloodWall },
  { id: "renovasi", a: (-17 * Math.PI) / 180, year: "1996 M", desc: "renovasi atap", El: Scaffold },
];
const eraPos = (a: number): V3 => [Math.sin(a) * RING_R, -0.24, Math.cos(a) * RING_R];

// ---------- camera ----------
type Pose = { pos: V3; target: V3; fov: number };
const poseFor = (wide: boolean, t: number): Pose => {
  const drift = -0.6 + t * 0.3; // slow lateral arc, 1.2 units over the 4 s cover
  return wide
    ? { pos: [2 + drift, 17.5, 36], target: [-6.8 + drift * 0.5, -0.9, 0], fov: 31 }
    : { pos: [0.3 + drift, 13, 46], target: [0, 2, 0], fov: 28 };
};

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.target);
    cam.fov = pose.fov;
    cam.near = 0.1;
    cam.far = 2500;
    cam.updateProjectionMatrix();
  });
  return null;
};

const Backdrop: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uFog: { value: new THREE.Color(C.fog) }, uTop: { value: new THREE.Color("#f3eee5") } },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uFog; uniform vec3 uTop; varying vec3 vD; void main(){
          vec3 c = mix(uFog, uTop, smoothstep(0.02, 0.55, vD.y));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      }),
    [],
  );
  return (
    <mesh material={mat}>
      <sphereGeometry args={[600, 48, 24]} />
    </mesh>
  );
};

const World: React.FC<{ pose: Pose; frame: number }> = ({ pose, frame }) => (
  <>
    <Rig pose={pose} />
    <Backdrop />
    <fog attach="fog" args={[C.fog, 40, 170]} />
    <hemisphereLight args={["#fff6e8", "#cbb99c", 0.95]} />
    <directionalLight
      position={[-13, 22, 14]}
      intensity={2.3}
      color="#fff0da"
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-bias={-0.0003}
      shadow-normalBias={0.03}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-near={1}
      shadow-camera-far={70}
    />
    <directionalLight position={[14, 9, -16]} intensity={0.9} color="#e3f1ff" />
    <Stage />
    <Kabah />
    <Crowd t={frame / useVideoConfig().fps} />
    {ERAS.map((e) => {
      const p = eraPos(e.a);
      const face = Math.atan2(pose.pos[0] - p[0], pose.pos[2] - p[2]);
      return (
        <group key={e.id} position={p} rotation={[0, face, 0]}>
          <Pedestal />
          <e.El />
        </group>
      );
    })}
    <Finish frame={frame} hdri="warmStudio" envIntensity={0.5} exposure={0.87} profile={COLOR_PROFILES.DOCUMENTARY_WARM} aoRadius={0.4} />
  </>
);

// ---------- 2D overlay ----------
const project = (p: V3, pose: Pose, fov: number, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 700);
  cam.position.set(...pose.pos);
  cam.lookAt(...pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z };
};

const Overlay: React.FC<{ pose: Pose }> = ({ pose }) => {
  const fmt = useFormat();
  const { width, height } = useVideoConfig();
  const s = fmt.scale;
  const W = fmt.layout.width, H = fmt.layout.height;
  const fov = fmt.fov(pose.fov);
  const labels = ERAS.map((e) => {
    const [x, , z] = eraPos(e.a);
    const back = Math.cos(e.a) < 0;
    const q = back ? project([x * 1.18, -0.2, z * 0.9], pose, fov, W, H) : project([x, 2.05, z], pose, fov, W, H);
    return { e, back, ...q };
  }).filter((l) => l.z < 1 && !(fmt.isWide && l.x < 900) && l.x > fmt.safe.left + 60 && l.x < W - fmt.safe.right - 60 && l.y > fmt.safe.top && l.y < H - fmt.safe.bottom);

  const titleSize = fmt.isWide ? 104 : 112;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, width, height }}>
      {/* soft wash behind the title for readability */}
      <AbsoluteFill
        style={{
          background: fmt.isWide
            ? "linear-gradient(90deg, rgba(240,233,221,0.95) 0%, rgba(240,233,221,0.86) 36%, rgba(240,233,221,0) 57%)"
            : "linear-gradient(180deg, rgba(240,233,221,0.95) 0%, rgba(240,233,221,0.75) 22%, rgba(240,233,221,0) 34%)",
        }}
      />
      {labels.map((l) => (
        <div
          key={l.e.id}
          style={{
            position: "absolute",
            left: l.x * s,
            top: l.y * s,
            transform: l.back ? "translate(-50%, 0%)" : "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2 * s,
            padding: `${8 * s}px ${18 * s}px`,
            borderRadius: 999,
            background: "rgba(250,246,239,0.86)",
            border: `${1.5 * s}px solid rgba(184,144,63,0.55)`,
            boxShadow: `0 ${6 * s}px ${18 * s}px rgba(80,60,30,0.14)`,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 25 * s, letterSpacing: 1.2 * s, color: C.ink }}>{l.e.year}</span>
          <span style={{ fontWeight: 400, fontSize: 17 * s, color: C.inkSoft }}>{l.e.desc}</span>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: (fmt.isWide ? fmt.safe.left + 24 : 0) * s,
          right: fmt.isWide ? undefined : 0,
          top: (fmt.isWide ? 250 : fmt.safe.top + 40) * s,
          width: fmt.isWide ? 820 * s : undefined,
          textAlign: fmt.isWide ? "left" : "center",
          color: C.ink,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 26 * s, letterSpacing: 7 * s, color: C.goldDeep, marginBottom: 22 * s }}>
          SEJARAH MAKKAH · EP01
        </div>
        <div style={{ fontWeight: 600, fontSize: titleSize * s, lineHeight: 1.0, letterSpacing: -2 * s }}>
          KA'BAH TIDAK
          <br />
          SELALU
          <br />
          <span style={{ color: C.goldDeep }}>SEPERTI INI</span>
        </div>
        {fmt.isWide ? (
          <div style={{ marginTop: 34 * s, fontWeight: 400, fontSize: 30 * s, color: C.inkSoft, lineHeight: 1.35 }}>
            Dibangun ulang berkali-kali,
            <br />
            dari fondasi Ibrahim sampai 1996.
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const KabahCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fmt = useFormat();
  const t = frame / fps;
  const pose = poseFor(fmt.isWide, t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 35, near: 0.1, far: 2500, position: [0, 10, 25] }}>
        <World pose={pose} frame={frame} />
      </ThreeCanvas>
      <Overlay pose={pose} />
    </AbsoluteFill>
  );
};
