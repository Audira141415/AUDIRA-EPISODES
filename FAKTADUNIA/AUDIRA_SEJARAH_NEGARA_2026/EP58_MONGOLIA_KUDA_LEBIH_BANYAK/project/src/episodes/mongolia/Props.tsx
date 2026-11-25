// EP58 Mongolia — procedural props: ger, riders, tall grass, snow, dust, finish banner, airag bowl.

import React, { useMemo } from "react";
import { DodecahedronGeometry, CanvasTexture, Color, DoubleSide, DynamicDrawUsage, Float32BufferAttribute, BufferGeometry, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Quaternion, SphereGeometry, SRGBColorSpace, Vector3, type WebGLProgramParametersWithUniforms } from "three";
import { ToyPerson, poseAt, type Pose, type Look, type Outfit } from "../../core/polish/Person.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { mulberry32 } from "../../kits/worldforge/noise.ts";
import { gy } from "./terrain.ts";

type V3 = [number, number, number];
const S = { castShadow: true, receiveShadow: true } as const;

// ── Ger (yurt) ────────────────────────────────────────────────────────────────
const felt = new MeshStandardMaterial({ color: "#efe9dc", roughness: 0.95 });
const feltShade = new MeshStandardMaterial({ color: "#d9d0bf", roughness: 0.95 });
const band = new MeshStandardMaterial({ color: "#5b4636", roughness: 0.9 });
const door = new MeshStandardMaterial({ color: "#c8372b", roughness: 0.6 });
const doorTrim = new MeshStandardMaterial({ color: "#e2a32c", roughness: 0.5, metalness: 0.1 });
const crown = new MeshStandardMaterial({ color: "#7a5236", roughness: 0.8 });

export const Ger: React.FC<{ position: V3; heading?: number; scale?: number }> = ({ position, heading = 0, scale = 1 }) => (
  <group position={position} rotation={[0, heading, 0]} scale={scale}>
    <mesh material={felt} position={[0, 0.8, 0]} {...S}>
      <cylinderGeometry args={[3, 3.05, 1.6, 48]} />
    </mesh>
    <mesh material={feltShade} position={[0, 2.15, 0]} {...S}>
      <coneGeometry args={[3.25, 1.1, 48, 1, true]} />
    </mesh>
    <mesh material={felt} position={[0, 2.12, 0]} {...S}>
      <cylinderGeometry args={[0.55, 3.25, 1.1, 48, 1, true]} />
    </mesh>
    <mesh material={crown} position={[0, 2.72, 0]} {...S}>
      <cylinderGeometry args={[0.6, 0.6, 0.12, 24]} />
    </mesh>
    {[0.35, 1.25].map((y) => (
      <mesh key={y} material={band} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.04, 0.035, 6, 64]} />
      </mesh>
    ))}
    <mesh material={band} position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3.1, 0.05, 6, 64]} />
    </mesh>
    <mesh material={doorTrim} position={[0, 0.68, 3.04]} {...S}>
      <boxGeometry args={[1.05, 1.42, 0.08]} />
    </mesh>
    <mesh material={door} position={[0, 0.66, 3.09]} {...S}>
      <boxGeometry args={[0.85, 1.25, 0.06]} />
    </mesh>
  </group>
);

// ── Riders ──────────────────────────────────────────────────────────────────
const base = poseAt("sit", 0, 1);
/** Astride a horse: thighs forward and out, shins down, hands at the reins. */
export const ridePose = (f: number, seed: number, crouch = 0): Pose => {
  const b = Math.sin(f / 60 * 9 + seed) * 0.03;
  return {
    ...base,
    lift: 0.02,
    body: [crouch * 0.55, 0, 0],
    spine: [0.12 + crouch * 0.35 + b, 0, 0],
    head: [-crouch * 0.6, 0, 0],
    lh: [-1.15, 0, 0.62], lk: 1.55,
    rh: [-1.15, 0, -0.62], rk: 1.55,
    ls: [-0.95 - crouch * 0.4, 0, 0.18], le: -0.75,
    rs: [-0.95 - crouch * 0.4, 0, -0.18], re: -0.75,
  };
};

const helmetMat = (c: string) => new MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.05 });
const HELMETS: Record<string, MeshStandardMaterial> = {};
const helmet = (c: string) => (HELMETS[c] ??= helmetMat(c));
const leather = new MeshStandardMaterial({ color: "#4a3324", roughness: 0.7, metalness: 0.15 });
const fur = new MeshStandardMaterial({ color: "#6b5440", roughness: 1 });

/** Child jockey with a safety helmet. */
export const Jockey: React.FC<{ f: number; seed: number; color: string; number: number }> = ({ f, seed, color, number }) => (
  <ToyPerson
    f={f}
    seed={seed}
    poseOverride={ridePose(f, seed, 0.85)}
    outfit="sport"
    look={{ top: color, bottom: "#f4f1ea", height: 0.72, number, socks: "#f4f1ea", shoes: "#3a2a20" } as Partial<Look>}
    expression="happy"
    scale={1.3}
    headwear={
      <group>
        <mesh material={helmet(color)} position={[0, 0.012, -0.004]} rotation={[-0.15, 0, 0]} castShadow>
          <sphereGeometry args={[0.142, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={helmet("#1d1d1f")} position={[0, 0.01, 0.12]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.16, 0.012, 0.07]} />
        </mesh>
      </group>
    }
  />
);

/** Generic steppe warrior (no real person), cone helmet. */
export const Warrior: React.FC<{ f: number; seed: number; coat: string }> = ({ f, seed, coat }) => (
  <ToyPerson
    f={f}
    seed={seed}
    poseOverride={ridePose(f, seed, 0.15)}
    outfit={"winter" as Outfit}
    look={{ top: coat, bottom: "#3b2f28", height: 1, shoes: "#2a2019" } as Partial<Look>}
    scale={1.55}
    headwear={
      <group>
        <mesh material={leather} position={[0, 0.1, -0.005]} castShadow>
          <coneGeometry args={[0.15, 0.26, 18]} />
        </mesh>
        <mesh material={fur} position={[0, 0.02, -0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.135, 0.035, 8, 24]} />
        </mesh>
      </group>
    }
  />
);

/** Herder standing on the ground (deel coat). */
export const Herder: React.FC<{ f: number; seed: number; position: V3; heading?: number; pose?: "stand" | "walk" | "wave" | "crouch" | "point"; coat?: string; child?: boolean }> = ({ f, seed, position, heading = 0, pose = "stand", coat = "#2f5aa8", child = false }) => (
  <ToyPerson f={f} seed={seed} pose={pose} outfit="traditional" look={{ top: coat, bottom: "#3b2f28", height: child ? 0.72 : 1, hairStyle: 0, shoes: "#2a2019" } as Partial<Look>} position={position} heading={heading} scale={1.65} />
);

// ── Tall grass (instanced blades, wind sway in the vertex shader) ──────────────
const bladeGeo = (() => {
  const g = new BufferGeometry();
  const seg = 4;
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const v = i / seg;
    const w = 0.03 * (1 - v * 0.92);
    const bend = v * v * 0.25;
    pos.push(-w, v, bend, w, v, bend);
  }
  for (let i = 0; i < seg; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
})();

export type GrassSpec = { cx: number; cz: number; w: number; d: number; count: number; h: number; seed: number };

export const Grass: React.FC<{ spec: GrassSpec; t: number; tone?: string; snow?: number }> = ({ spec, t, tone = "#9a9a4c", snow = 0 }) => {
  const { mesh, uniforms } = useMemo(() => {
    const uniforms = { uTime: { value: 0 }, uSnow: { value: 0 } };
    const mat = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, side: DoubleSide });
    mat.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTime;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          vec4 gw = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float sway = sin(uTime * 1.7 + gw.x * 0.35 + gw.z * 0.21) * 0.6 + sin(uTime * 3.1 + gw.x * 0.9) * 0.25;
          transformed.x += sway * position.y * position.y * 0.18;
          transformed.z += sway * position.y * position.y * 0.08;`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uSnow;")
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93,0.95,0.98), uSnow);");
    };
    mat.customProgramCacheKey = () => "ep58-grass";
    const m = new InstancedMesh(bladeGeo, mat, spec.count);
    const rnd = mulberry32(spec.seed);
    const o = new Object3D();
    const base = new Color(tone), c = new Color();
    for (let i = 0; i < spec.count; i++) {
      const x = spec.cx + (rnd() - 0.5) * spec.w;
      const z = spec.cz + (rnd() - 0.5) * spec.d;
      // thinner near the edges so the patch fades into the terrain
      const ex = Math.abs(x - spec.cx) / (spec.w / 2), ez = Math.abs(z - spec.cz) / (spec.d / 2);
      const edge = Math.max(ex, ez);
      const hh = spec.h * (0.55 + rnd() * 0.75) * (1 - Math.max(0, edge - 0.6) * 1.6);
      o.position.set(x, gy(x, z) - 0.05, z);
      o.rotation.set((rnd() - 0.5) * 0.35, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.35);
      o.scale.set(1 + rnd() * 0.6, Math.max(0.05, hh), 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      c.copy(base).offsetHSL((rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.15, (rnd() - 0.5) * 0.18);
      m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    m.receiveShadow = true;
    m.castShadow = false;
    m.frustumCulled = false;
    return { mesh: m, uniforms };
  }, [spec, tone]);
  uniforms.uTime.value = t;
  uniforms.uSnow.value = snow;
  return <primitive object={mesh} />;
};

// ── Falling snow (atmosphere around a point) ────────────────────────────────────
const flakeMat = new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9, depthWrite: false });
export const Snowfall: React.FC<{ t: number; center: V3; size: [number, number, number]; count: number; density: number; wind?: number }> = ({ t, center, size, count, density, wind = 1.2 }) => {
  const { mesh, seeds } = useMemo(() => {
    const m = new InstancedMesh(new SphereGeometry(0.035, 6, 4), flakeMat, count);
    m.instanceMatrix.setUsage(DynamicDrawUsage);
    m.frustumCulled = false;
    const rnd = mulberry32(58);
    const seeds = Array.from({ length: count }, () => [rnd(), rnd(), rnd(), 0.7 + rnd() * 0.8]);
    return { mesh: m, seeds };
  }, [count]);
  const o = new Object3D();
  const shown = Math.floor(count * Math.max(0, Math.min(1, density)));
  for (let i = 0; i < count; i++) {
    const [a, b, c, sp] = seeds[i];
    const H = size[1];
    const y = center[1] + H - ((t * 1.1 * sp + a * H) % H);
    const x = center[0] + (b - 0.5) * size[0] + Math.sin(t * 0.9 + i) * 0.25 + wind * ((t * sp) % 3);
    const z = center[2] + (c - 0.5) * size[2] + Math.cos(t * 0.7 + i * 1.3) * 0.2;
    o.position.set(x, y, z);
    o.scale.setScalar(i < shown ? 1 : 0);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ── Dust puffs behind running hooves ───────────────────────────────────────────
const dustMats = Array.from({ length: 10 }, (_, i) => new MeshStandardMaterial({ color: "#c9b28c", roughness: 1, transparent: true, opacity: 0.4 * (1 - i / 10), depthWrite: false }));
const puffGeo = new DodecahedronGeometry(1, 0); // POLYVERSE: faceted dust
export const DustTrail: React.FC<{ t: number; xAt: (t: number) => number; z: number; seed: number }> = ({ t, xAt, z, seed }) => {
  const rnd = mulberry32(seed);
  const jit = Array.from({ length: 12 }, () => [rnd(), rnd(), rnd()]);
  const step = 0.09;
  return (
    <group>
      {jit.map(([a, b], i) => {
        const age = ((t + a * step * 12) % (step * 12));
        const born = t - age;
        const x = xAt(born) - 1.0 - age * 1.5;
        const life = age / (step * 12);
        const r = 0.25 + life * 1.1;
        const mi = Math.min(9, Math.floor(life * 10));
        return <mesh key={i} geometry={puffGeo} material={dustMats[mi]} position={[x, gy(x, z) + r * 0.6, z + (b - 0.5) * 1.2]} scale={[r * 1.3, r * 0.8, r]} />;
      })}
    </group>
  );
};

// ── Finish banner with the AUDIRA mark (brand inside the world) ────────────────
export const FinishBanner: React.FC<{ position: V3; width?: number }> = ({ position, width = 16 }) => {
  const mat = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 2048;
    cv.height = 384;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#0B3D2E";
    g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = "#B8E04A";
    g.fillRect(0, 0, cv.width, 18);
    g.fillRect(0, cv.height - 18, cv.width, 18);
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = "#ffffff";
    g.font = `800 210px ${FONT}`;
    g.fillText("AUDIRA", cv.width * 0.3, cv.height / 2 + 8);
    g.fillStyle = "#B8E04A";
    g.font = `700 120px ${FONT}`;
    g.fillText("FINISH", cv.width * 0.75, cv.height / 2 + 6);
    const tex = new CanvasTexture(cv);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 8;
    return new MeshStandardMaterial({ map: tex, roughness: 0.75, side: DoubleSide });
  }, []);
  const pole = useMemo(() => new MeshStandardMaterial({ color: "#d8d2c4", roughness: 0.6 }), []);
  const h = 4.2;
  return (
    <group position={position}>
      {[-width / 2, width / 2].map((x) => (
        <mesh key={x} material={pole} position={[0, h / 2 + 0.6, x]} {...S}>
          <cylinderGeometry args={[0.12, 0.14, h + 1.2, 12]} />
        </mesh>
      ))}
      <mesh material={mat} position={[0, h, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[width, width * (384 / 2048)]} />
      </mesh>
    </group>
  );
};

// ── Airag bowl (porcelain, blue rim) ───────────────────────────────────────────
const porcelain = new MeshStandardMaterial({ color: "#f6f3ec", roughness: 0.25 });
const rim = new MeshStandardMaterial({ color: "#2b5fae", roughness: 0.3 });
const milk = new MeshStandardMaterial({ color: "#f1ead8", roughness: 0.18 });
export const AiragBowl: React.FC<{ position: V3; fill: number; scale?: number }> = ({ position, fill, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh material={porcelain} position={[0, 0.06, 0]} {...S}>
      <cylinderGeometry args={[0.12, 0.06, 0.1, 32, 1, true]} />
    </mesh>
    <mesh material={porcelain} position={[0, 0.012, 0]} {...S}>
      <cylinderGeometry args={[0.06, 0.06, 0.024, 32]} />
    </mesh>
    <mesh material={rim} position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.12, 0.006, 8, 48]} />
    </mesh>
    {fill > 0.02 && (
      <mesh material={milk} position={[0, 0.02 + fill * 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.065 + fill * 0.05, 32]} />
      </mesh>
    )}
  </group>
);

// ── Tether line (zel) for mares ────────────────────────────────────────────────
const wood = new MeshStandardMaterial({ color: "#6e4d33", roughness: 0.85 });
const rope = new MeshStandardMaterial({ color: "#3b2d22", roughness: 0.9 });
export const TetherLine: React.FC<{ a: V3; b: V3 }> = ({ a, b }) => {
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.85, (a[2] + b[2]) / 2];
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  return (
    <group>
      {[a, b].map((p, i) => (
        <mesh key={i} material={wood} position={[p[0], p[1] + 0.6, p[2]]} {...S}>
          <cylinderGeometry args={[0.07, 0.09, 1.2, 10]} />
        </mesh>
      ))}
      <mesh material={rope} position={mid} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(b[0] - a[0], 0, b[2] - a[2]).normalize())}>
        <cylinderGeometry args={[0.025, 0.025, len, 6]} />
      </mesh>
    </group>
  );
};

