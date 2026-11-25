// AE-046 cover: "Internet Lewat Dasar Laut?" in ABYSSFORGE.
// A landing station on the coast (top-left, seen through the water surface), the cable dropping down
// the cliff, sweeping along the dark seabed (S-curve) and running out to sea; a repeater on the
// cable; data pulses; and a stepped cut-away of a deep-sea cable as a foreground inset.
// Everything derives from t = frame / fps; all scatter uses the kit's seeded mulberry32.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { CameraRig, FX_LAYER } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ABYSS_PALETTE } from "../../kits/abyssforge/lib/palette.ts";
import { makeGodRayTexture } from "../../kits/abyssforge/lib/materials.ts";
import { mulberry32 } from "../../kits/abyssforge/core/motion.ts";
import { Jelly, type JellySpec } from "./Jelly.tsx";

export const fx = (o: THREE.Object3D | null) => {
  if (o) o.layers.set(FX_LAYER);
};
export const sstep = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

// ---------- terrain: coast plateau (left), cliff, slope, abyssal plain ----------
const coastX = (z: number) => -2.2 + 0.3 * Math.sin(z * 0.3 + 1) - 4 * sstep(-12, -2, z);
export const groundH = (x: number, z: number, far = false) => {
  const s = x - coastX(z);
  const land = 0.75 + Math.min(4, Math.max(0, -s)) * 0.12 + 0.04 * Math.sin(x * 3 + z * 2);
  const floor = -9 + 0.14 * Math.sin(x * 0.9 + z * 0.4) + 0.09 * Math.sin(z * 1.3 + 0.5) + 0.04 * Math.sin(x * 4.1 - z * 2.7);
  const cliff = land + (-2.6 - land) * sstep(0, 0.55, s);
  const rock = 0.35 * Math.sin(z * 1.7) * Math.sin(s * 2.3) * sstep(0.2, 0.8, s) * (1 - sstep(1.8, 2.6, s));
  const slope = cliff + (floor - cliff) * sstep(0.55, 2.6, s) + rock;
  // film only: a second coast across the sea (the country on the other end of the cable)
  return far ? slope + (0.9 - slope) * sstep(-74, -84, z) : slope;
};

export const makeTextTexture = (lines: { text: string; size: number; color: string; weight?: number; spacing?: number }[], w: number, h: number, bg?: string) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  const total = lines.reduce((a, l) => a + l.size * 1.15, 0);
  let y = h / 2 - total / 2;
  for (const l of lines) {
    g.font = `${l.weight ?? 800} ${l.size}px 'Segoe UI', sans-serif`;
    g.fillStyle = l.color;
    (g as unknown as { letterSpacing: string }).letterSpacing = `${l.spacing ?? 0}px`;
    g.fillText(l.text, w / 2, y + (l.size * 1.15) / 2);
    y += l.size * 1.15;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const makeGlowTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.18, "rgba(255,255,255,0.55)");
  gr.addColorStop(0.5, "rgba(255,255,255,0.12)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** Seeded caustic-like shimmer for the underside of the water surface. */
const makeShimmerTexture = () => {
  const N = 256;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = (x / N) * Math.PI * 2;
      const v = (y / N) * Math.PI * 2;
      const a = Math.sin(u * 3 + Math.sin(v * 2) * 1.6) + Math.sin(v * 4 + Math.sin(u * 3) * 1.3) + Math.sin((u + v) * 5);
      const k = Math.pow(Math.max(0, 1 - Math.abs(a) * 0.55), 6);
      const i = (y * N + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 40 + k * 215;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(9, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// ---------- backdrop: sky above the surface, teal-to-ink water below ----------
export const Backdrop: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `varying vec3 vW;
          void main(){
            float y = vW.y;
            vec3 sky = mix(vec3(0.020,0.055,0.110), vec3(0.008,0.016,0.040), clamp(y/30.0,0.0,1.0));
            vec3 teal = vec3(0.030,0.150,0.215);
            vec3 twi = vec3(0.012,0.060,0.100);
            vec3 ink = vec3(0.004,0.016,0.030);
            vec3 water = y > -6.0 ? mix(twi, teal, clamp((y+6.0)/6.0,0.0,1.0)) : mix(ink, twi, clamp((y+30.0)/24.0,0.0,1.0));
            vec3 col = y > 0.0 ? sky : water;
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [],
  );
  return (
    <mesh position={[0, -20, -95]} material={mat} renderOrder={-10}>
      <planeGeometry args={[360, 260]} />
    </mesh>
  );
};

export const Terrain: React.FC<{ far?: boolean }> = ({ far = false }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(44, 120, 220, 480);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -45);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const land = new THREE.Color("#2A302C");
    const rockC = new THREE.Color("#1E2A31");
    const silt = new THREE.Color(ABYSS_PALETTE.seabedSilt);
    const rnd = mulberry32(4601);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = groundH(x, z, far);
      pos.setY(i, h);
      const n = 0.85 + rnd() * 0.3;
      if (h > 0.2) tmp.copy(land);
      else if (h > -8.2) tmp.copy(rockC).lerp(silt, sstep(-6, -8.6, h));
      else tmp.copy(silt);
      tmp.multiplyScalar(n);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [far]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors roughness={0.93} metalness={0} envMapIntensity={0.25} />
    </mesh>
  );
};

// ---------- the cable ----------
const CABLE_PTS: [number, number][] = [
  [-2.4, -17.7],
  [-2.15, -16.95],
  [-2.1, -16.2],
  [-1.75, -15.4],
  [-1.25, -14.2],
  [-0.6, -12.4],
  [-0.05, -10.6],
  [0.45, -9.2],
  [1.05, -8.9],
  [1.55, -10.2],
  [1.95, -13.5],
  [2.35, -19],
  [2.75, -27],
  [3.05, -38],
  [3.3, -52],
  [3.5, -75],
];
export const makeCableCurve = () =>
  new THREE.CatmullRomCurve3(
    CABLE_PTS.map(([x, z]) => new THREE.Vector3(x, Math.max(groundH(x, z), -50) + 0.07, z)),
    false,
    "centripetal",
  );
// on the steep cliff the interpolated curve can dip into the rock: lift every sample above ground
export const liftedCurve = (curve: THREE.CatmullRomCurve3) => {
  const pts = curve.getSpacedPoints(600).map((p) => new THREE.Vector3(p.x, Math.max(p.y, groundH(p.x, p.z) + 0.06), p.z));
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
};

// repeater sits on the diagonal run below the cliff (nearest sample to this point)
const REPEATER_AT = new THREE.Vector3(-0.32, -9, -11.5);
export const repeaterU = (curve: THREE.CatmullRomCurve3) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i <= 400; i++) {
    const p = curve.getPointAt(i / 400);
    const d = (p.x - REPEATER_AT.x) ** 2 + (p.z - REPEATER_AT.z) ** 2;
    if (d < bd) { bd = d; best = i / 400; }
  }
  return best;
};
export const LUMEN = new THREE.Color(ABYSS_PALETTE.lumenCyan);

const Cable: React.FC<{ t: number; glow: THREE.Texture }> = ({ t, glow }) => {
  const curve = useMemo(() => liftedCurve(makeCableCurve()), []);
  const body = useMemo(() => new THREE.TubeGeometry(curve, 900, 0.055, 10, false), [curve]);
  const core = useMemo(() => new THREE.TubeGeometry(curve, 900, 0.03, 8, false), [curve]);
  const halo = useMemo(() => new THREE.TubeGeometry(curve, 900, 0.16, 8, false), [curve]);
  const pulses = useMemo(() => Array.from({ length: 22 }, (_, i) => i / 22), []);
  const lightUs = [0.05, 0.14, 0.22, 0.3, 0.42, 0.5, 0.6];
  const pulseMat = useMemo(() => new THREE.SpriteMaterial({ map: glow, color: new THREE.Color("#BFFBFF").multiplyScalar(3.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }), [glow]);
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({ color: LUMEN.clone().multiplyScalar(2.6), fog: false }), []);
  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color="#0B141A" roughness={0.45} metalness={0.1} envMapIntensity={0.4} />
      </mesh>
      <mesh geometry={core} material={coreMat} />
      <mesh geometry={halo} ref={fx}>
        <meshBasicMaterial color={LUMEN} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {pulses.map((p, i) => {
        const u0 = (p + t * 0.035) % 1;
        return [0, 0.004, 0.008].map((du, j) => {
          const u = Math.max(0, u0 - du);
          const q = curve.getPointAt(u);
          const sz = (0.6 - j * 0.16) * Math.max(0.4, 1 - u * 1.2);
          return <sprite key={`${i}-${j}`} ref={fx} position={[q.x, q.y + 0.04, q.z]} scale={[sz, sz, 1]} material={pulseMat} />;
        });
      })}
      {lightUs.map((u, i) => {
        const q = curve.getPointAt(u);
        return <pointLight key={i} position={[q.x, q.y + 0.6, q.z]} color={ABYSS_PALETTE.lumenCyan} intensity={i === 4 ? 9 : 6} distance={5} decay={1.6} />;
      })}
      <Repeater curve={curve} />
    </group>
  );
};

// ---------- repeater: bronze pressure housing with tapered ends and bend restrictors ----------
export const Repeater: React.FC<{ curve: THREE.CatmullRomCurve3; ring?: THREE.Color; boost?: number }> = ({ curve, ring, boost = 1 }) => {
  const { pos, quat } = useMemo(() => {
    const u = repeaterU(curve);
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize());
    return { pos: new THREE.Vector3(p.x, p.y + 0.3, p.z), quat: q };
  }, [curve]);
  const lathe = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    const L = 0.95;
    const pts: [number, number][] = [
      [0.055, -L - 0.55],
      [0.075, -L - 0.5],
      [0.075, -L - 0.2],
      [0.12, -L - 0.12],
      [0.24, -L + 0.08],
      [0.26, -L + 0.18],
      [0.26, L - 0.18],
      [0.24, L - 0.08],
      [0.12, L + 0.12],
      [0.075, L + 0.2],
      [0.075, L + 0.5],
      [0.055, L + 0.55],
    ];
    for (const [r, y] of pts) prof.push(new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(prof, 48);
  }, []);
  const label = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.font = "900 64px 'Segoe UI', sans-serif";
    g.fillStyle = "#EFFFFF";
    g.textAlign = "center";
    g.textBaseline = "middle";
    (g as unknown as { letterSpacing: string }).letterSpacing = "10px";
    for (const cx of [128, 384, 640, 896]) {
      g.save();
      g.translate(cx, 256);
      g.rotate(-Math.PI / 2);
      g.fillText("AUDIRA", 0, 0);
      g.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
  return (
    <group position={pos} quaternion={quat} scale={1.55}>
      <mesh geometry={lathe}>
        <meshStandardMaterial color="#B98A5E" metalness={1} roughness={0.32} envMapIntensity={1.4} />
      </mesh>
      {[-0.62, 0.62].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.272, 0.272, 0.05, 48, 1, true]} />
          <meshBasicMaterial color={(ring ?? LUMEN).clone().multiplyScalar(3.4 * boost)} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-0.36, 0.38].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.264, 0.264, 0.035, 48, 1, true]} />
          <meshStandardMaterial color="#3A2A1E" metalness={0.9} roughness={0.5} />
        </mesh>
      ))}
      {/* stencilled band facing the camera */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.266, 0.266, 0.5, 64, 1, true]} />
        <meshBasicMaterial map={label} color="#CFEFF5" transparent depthWrite={false} />
      </mesh>
      <pointLight position={[0.2, 0.0, 0.7]} color={ABYSS_PALETTE.lumenCyan} intensity={5} distance={3} decay={1.4} />
    </group>
  );
};

// ---------- landing station on the coast ----------
export const Station: React.FC<{ x?: number; z?: number; ry?: number; far?: boolean }> = ({ x = -4.2, z = -17.6, ry = 0.5, far = false }) => {
  const y = groundH(x, z, far);
  const sign = useMemo(() => makeTextTexture([{ text: "AUDIRA", size: 120, color: "#E9FDFF", weight: 900, spacing: 18 }, { text: "CABLE LANDING", size: 44, color: "#6FF3FF", weight: 700, spacing: 10 }], 640, 260, "#071A26"), []);
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFC46B").multiplyScalar(2.4), fog: false }), []);
  return (
    <group position={[x, y, z]} rotation={[0, ry, 0]} scale={1.3}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.2, 0.84, 1.1]} />
        <meshStandardMaterial color="#8E9AA2" roughness={0.7} fog={false} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[2.36, 0.08, 1.24]} />
        <meshStandardMaterial color="#4B5660" roughness={0.6} fog={false} />
      </mesh>
      {[-0.75, -0.35, 0.05].map((wx) => (
        <mesh key={wx} position={[wx, 0.5, 0.556]} material={winMat}>
          <planeGeometry args={[0.26, 0.2]} />
        </mesh>
      ))}
      <mesh position={[0.6, 0.5, 0.557]}>
        <planeGeometry args={[0.8, 0.33]} />
        <meshBasicMaterial map={sign} fog={false} />
      </mesh>
      {/* mast with a red beacon */}
      <mesh position={[0.85, 1.5, -0.2]}>
        <cylinderGeometry args={[0.025, 0.035, 1.3, 8]} />
        <meshStandardMaterial color="#9AA4AA" metalness={0.8} roughness={0.4} fog={false} />
      </mesh>
      <mesh position={[0.85, 2.18, -0.2]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color={new THREE.Color("#FF4A3A").multiplyScalar(4)} fog={false} />
      </mesh>
      {/* beach manhole where the cable goes to sea */}
      <mesh position={[1.25, 0.06, 0.6]}>
        <boxGeometry args={[0.36, 0.12, 0.36]} />
        <meshStandardMaterial color="#5C666D" roughness={0.8} fog={false} />
      </mesh>
      <pointLight position={[0, 1.4, 1.4]} color="#FFC46B" intensity={6} distance={5} decay={1.5} />
    </group>
  );
};

// ---------- water surface seen from below + god-rays ----------
export const Surface: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => makeShimmerTexture(), []);
  useLayoutEffect(() => {
    tex.offset.set(t * 0.01, t * 0.006);
  }, [tex, t]);
  const rayTex = useMemo(() => makeGodRayTexture(), []);
  const rays = useMemo(() => {
    const rnd = mulberry32(4602);
    return Array.from({ length: 8 }, () => ({ x: -1.5 + rnd() * 6, z: -6 - rnd() * 22, w: 1 + rnd() * 2.4, ry: (rnd() - 0.5) * 1.2, rz: 0.12 + (rnd() - 0.5) * 0.15, o: 0.05 + rnd() * 0.06 }));
  }, []);
  return (
    <group>
      <mesh position={[0, 0, -40]} rotation={[-Math.PI / 2, 0, 0]} ref={fx}>
        <planeGeometry args={[80, 110]} />
        <meshBasicMaterial color={new THREE.Color("#2E8FB8")} map={tex} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {rays.map((r, i) => (
        <mesh key={i} ref={fx} position={[r.x, -7, r.z]} rotation={[0, r.ry, r.rz]}>
          <planeGeometry args={[r.w, 16]} />
          <meshBasicMaterial map={rayTex} color={ABYSS_PALETTE.godRay} transparent opacity={r.o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- marine snow + plankton ----------
export const Particles: React.FC<{ t: number }> = ({ t }) => {
  const snow = useMemo(() => {
    const N = 1400;
    const rnd = mulberry32(4603);
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: ABYSS_PALETTE.marineSnow, transparent: true, opacity: 0.7 }), N);
    mesh.frustumCulled = false;
    const seeds = Array.from({ length: N }, () => ({ x: -5 + rnd() * 11, y: -9 + rnd() * 9, z: 8 - rnd() * 40, s: 0.006 + Math.pow(rnd(), 4) * 0.018, ph: rnd() * 6.28 }));
    return { mesh, seeds };
  }, []);
  const plankton = useMemo(() => {
    const N = 160;
    const rnd = mulberry32(4604);
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 6), new THREE.MeshBasicMaterial(), N);
    mesh.frustumCulled = false;
    const pal = [ABYSS_PALETTE.lumenCyan, ABYSS_PALETTE.lumenViolet, ABYSS_PALETTE.lumenMagenta];
    const seeds = Array.from({ length: N }, (_, i) => {
      mesh.setColorAt(i, new THREE.Color(pal[i % 3]).multiplyScalar(3));
      return { x: -4 + rnd() * 10, y: -9 + rnd() * 7, z: 4 - rnd() * 36, s: 0.012 + rnd() * 0.018, ph: rnd() * 6.28 };
    });
    return { mesh, seeds };
  }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    snow.seeds.forEach((p, i) => {
      o.position.set(p.x + Math.sin(t * 0.4 + p.ph) * 0.12, p.y - t * 0.05, p.z);
      o.rotation.set(p.ph, p.ph + t * 0.4, 0);
      o.scale.setScalar(p.s);
      o.updateMatrix();
      snow.mesh.setMatrixAt(i, o.matrix);
    });
    snow.mesh.instanceMatrix.needsUpdate = true;
    plankton.seeds.forEach((p, i) => {
      o.position.set(p.x, p.y + Math.sin(t * 0.5 + p.ph) * 0.15, p.z);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(p.s * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.3 + p.ph))));
      o.updateMatrix();
      plankton.mesh.setMatrixAt(i, o.matrix);
    });
    plankton.mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <primitive object={snow.mesh} />
      <primitive object={plankton.mesh} />
    </group>
  );
};

// ---------- inset: stepped cut-away of a deep-sea cable ----------
export const INSET_POS: [number, number, number] = [1.15, -2.25, 4.2];
export const FIBER_COLS = ["#2F7BFF", "#FF8A2A", "#33D17A", "#9C6B3F", "#9AA7B0", "#F2F4F5", "#FF3B3B", "#FFD43B"];

export const CableSection: React.FC<{ t: number; glow: THREE.Texture; copper?: number; pos?: [number, number, number]; rot?: [number, number, number]; scale?: number }> = ({ t, glow, copper = 0, pos = INSET_POS, rot = [0.18, -0.95, 0.22], scale = 0.2 }) => {
  const jacketTex = useMemo(() => {
    const tex = makeTextTexture([{ text: "AUDIRA  SUBSEA  FIBER  ·  AUDIRA  SUBSEA  FIBER", size: 46, color: "#7FA8B8", weight: 700, spacing: 8 }], 2048, 128, "#0C1418");
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }, []);
  const wires = useMemo(() => Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2), []);
  const tipMat = useMemo(() => new THREE.SpriteMaterial({ map: glow, color: new THREE.Color("#C8FDFF").multiplyScalar(1.4), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }), [glow]);
  const steel = { color: "#C9D2D8", metalness: 1, roughness: 0.28, envMapIntensity: 1.3, fog: false } as const;
  const tw = 1 + 0.15 * Math.sin(t * 4);
  // layers step out along +x: jacket ends at 0, copper at .45, wires at .9, steel tube at 1.3, fibers at 1.9
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {/* polyethylene jacket */}
      <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1, 1, 3.2, 64, 1, false]} />
        <meshStandardMaterial map={jacketTex} roughness={0.42} metalness={0} envMapIntensity={0.9} fog={false} />
      </mesh>
      <mesh position={[0.001, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.8, 1, 64]} />
        <meshStandardMaterial color="#1A2228" roughness={0.6} side={THREE.DoubleSide} fog={false} />
      </mesh>
      {/* copper conductor tube (feeds power to the repeaters) */}
      <mesh position={[0.225, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 0.45, 64, 1, false]} />
        <meshStandardMaterial color="#D9864E" metalness={1} roughness={0.25} envMapIntensity={1.4} fog={false} emissive="#FF8A3A" emissiveIntensity={copper} />
      </mesh>
      <mesh position={[0.451, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.66, 0.8, 64]} />
        <meshStandardMaterial color="#B86C3A" metalness={1} roughness={0.3} side={THREE.DoubleSide} fog={false} />
      </mesh>
      {/* stranded steel strength wires */}
      {wires.map((a, i) => (
        <mesh key={i} position={[0.45, Math.cos(a) * 0.55, Math.sin(a) * 0.55]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.095, 0.095, 0.9, 20]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {/* steel tube with gel */}
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 1.3, 48, 1, true]} />
        <meshStandardMaterial {...steel} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.301, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <ringGeometry args={[0.3, 0.38, 48]} />
        <meshStandardMaterial {...steel} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <circleGeometry args={[0.3, 48]} />
        <meshStandardMaterial color="#E8B04A" transparent opacity={0.55} roughness={0.1} emissive="#7A4A10" emissiveIntensity={0.4} side={THREE.DoubleSide} fog={false} />
      </mesh>
      {/* optical fibres: coloured coatings, light leaving the tips */}
      {FIBER_COLS.map((c, i) => {
        const a = (i / FIBER_COLS.length) * Math.PI * 2;
        const r = i === 0 ? 0 : 0.17;
        const spread = 0.12;
        const y = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const len = 0.75 + (i % 3) * 0.12;
        return (
          <group key={i}>
            <mesh position={[1.3 + len / 2, y * (1 + spread), z * (1 + spread)]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, len, 12]} />
              <meshStandardMaterial color={c} roughness={0.35} fog={false} />
            </mesh>
            <mesh position={[1.3 + len + 0.01, y * (1 + spread), z * (1 + spread)]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={new THREE.Color("#DFFEFF").multiplyScalar(2.2)} fog={false} />
            </mesh>
            <sprite ref={fx} position={[1.3 + len + 0.05, y * (1 + spread), z * (1 + spread)]} scale={[0.3 * tw, 0.3 * tw, 1]} material={tipMat} />
          </group>
        );
      })}
      <pointLight position={[2.6, 1.6, 2.4]} color="#EAF6FF" intensity={1.4} distance={6} decay={1} />
      <pointLight position={[-1.5, -1.5, 2.0]} color={ABYSS_PALETTE.lumenCyan} intensity={1.2} distance={6} decay={1} />
    </group>
  );
};

// ---------- camera ----------
const COVER_JELLIES: JellySpec[] = [
  { pos: [-2.1, -4.1, -3.2], size: 0.26, lumen: ABYSS_PALETTE.lumenMagenta, rate: 1.6, phase: 0.4, seed: 11 },
  { pos: [-2.6, -6.2, -9.5], size: 0.24, lumen: ABYSS_PALETTE.lumenViolet, rate: 1.4, phase: 2.0, seed: 12 },
];

const SHOT = { pos: [0.6, -2.2, 9] as [number, number, number], target: [-0.4, -7.6, -12] as [number, number, number], fov: 55 };

export const Ep046Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const glow = useMemo(() => makeGlowTexture(), []);
  const drift = Math.sin(t * 0.6) * 0.04;
  const shot = useMemo(
    () => ({ pos: [SHOT.pos[0] + drift, SHOT.pos[1], SHOT.pos[2]] as [number, number, number], target: SHOT.target, fov: SHOT.fov, focus: 10, aperture: 0, maxBlur: 0, exposure: 1.15 }),
    [drift],
  );
  const s = height / 1920;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: ABYSS_PALETTE.midnightInk }}>
      <ThreeCanvas width={width} height={height} dpr={1} camera={{ position: SHOT.pos, fov: SHOT.fov, near: 0.1, far: 300 }}>
        <CameraRig shot={shot} near={0.1} far={300} />
        <color attach="background" args={[ABYSS_PALETTE.midnightInk]} />
        <fogExp2 attach="fog" args={["#03121F", 0.042]} />
        <hemisphereLight args={["#2B6E95", "#020509", 0.35]} />
        <directionalLight position={[-3, 12, 4]} intensity={0.9} color={ABYSS_PALETTE.godRay} />
        <Backdrop />
        <Terrain />
        <Surface t={t} />
        <Station />
        <Cable t={t} glow={glow} />
        <Particles t={t} />
        <CableSection t={t} glow={glow} />
        {COVER_JELLIES.map((j) => (
          <Jelly key={j.seed} spec={j} t={t} />
        ))}
        <Finish frame={frame} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1.15} envIntensity={0.35} ao aoRadius={0.4} />
      </ThreeCanvas>
      <CoverOverlay s={s} />
    </div>
  );
};

// ---------- 2D layer: title block + inset callouts (safe zone: top 180, bottom 380) ----------
export const mono = "'Consolas', 'Courier New', monospace";
const CoverOverlay: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "#E6FBFF", fontFamily: "'Segoe UI', sans-serif" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900 * s, background: "linear-gradient(to top, rgba(1,6,12,0.92) 0%, rgba(1,6,12,0.75) 40%, rgba(1,6,12,0) 100%)" }} />
    <div style={{ position: "absolute", top: 196 * s, right: 60 * s, textAlign: "right", fontFamily: mono, fontSize: 22 * s, letterSpacing: 4 * s, color: ABYSS_PALETTE.hudCyan }}>
      ● JALUR DATA // DASAR SAMUDRA
    </div>
    <InsetCallouts s={s} />
    <div style={{ position: "absolute", left: 64 * s, right: 64 * s, bottom: 404 * s }}>
      <div style={{ fontFamily: mono, fontSize: 28 * s, letterSpacing: 7 * s, color: ABYSS_PALETTE.hudCyan, marginBottom: 18 * s }}>AUDIRA EXPLAINED · 046</div>
      <div style={{ fontSize: 124 * s, fontWeight: 900, lineHeight: 1.0, letterSpacing: -2 * s, textShadow: `0 ${4 * s}px ${30 * s}px rgba(0,0,0,0.8)` }}>Internet Lewat</div>
      <div style={{ fontSize: 124 * s, fontWeight: 900, lineHeight: 1.04, letterSpacing: -2 * s, color: "#7FF8FF", textShadow: `0 0 ${34 * s}px rgba(56,246,255,0.55)` }}>Dasar Laut?</div>
    </div>
  </div>
);

// Callouts for the cable cut-away (anchors measured on the rendered still, 1080x1920 space)
const CALLOUTS: { text: string; ax: number; ay: number; lx: number; ly: number }[] = [
  { text: "SERAT OPTIK", ax: 975, ay: 492, lx: 1020, ly: 400 },
  { text: "KAWAT BAJA", ax: 878, ay: 540, lx: 900, ly: 660 },
  { text: "TEMBAGA", ax: 832, ay: 560, lx: 780, ly: 700 },
  { text: "POLIETILEN", ax: 700, ay: 560, lx: 640, ly: 650 },
];
const InsetCallouts: React.FC<{ s: number }> = ({ s }) => (
  <svg width={1080 * s} height={1920 * s} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <text x={600} y={340} fill={ABYSS_PALETTE.hudCyan} fontFamily={mono} fontSize={22} letterSpacing={4}>
      PENAMPANG KABEL
    </text>
    <line x1={600} y1={352} x2={830} y2={352} stroke={ABYSS_PALETTE.hudCyan} strokeOpacity={0.5} strokeWidth={1.5} />
    {CALLOUTS.map((c) => {
      const right = c.lx > c.ax;
      return (
        <g key={c.text}>
          <line x1={c.ax} y1={c.ay} x2={c.lx} y2={c.ly} stroke="#E6FBFF" strokeOpacity={0.75} strokeWidth={1.6} />
          <circle cx={c.ax} cy={c.ay} r={4.5} fill={ABYSS_PALETTE.hudCyan} />
          <text
            x={c.lx + (right ? -2 : 0)}
            y={c.ly + (c.ly > c.ay ? 22 : -8)}
            textAnchor={c.lx > 960 ? "end" : "start"}
            fill="#E6FBFF"
            fontFamily={mono}
            fontWeight={700}
            fontSize={21}
            letterSpacing={2}
            style={{ paintOrder: "stroke", stroke: "rgba(1,8,16,0.85)", strokeWidth: 5 }}
          >
            {c.text}
          </text>
        </g>
      );
    })}
  </svg>
);
