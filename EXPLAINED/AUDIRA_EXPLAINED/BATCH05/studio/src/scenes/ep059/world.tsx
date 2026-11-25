// AE-059 WORLDFORGE world: a container port in a storm.
// Open sea (Gerstner swell + foam) breaks on a rubble-mound breakwater armoured with tetrapods;
// inside, the harbour basin is calm; a container ship lies alongside a concrete quay, held by
// head/stern lines, breast lines and springs to bollards, with cell fenders between hull and quay.
// Everything is seeded and driven by the frame clock (deterministic).

import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { fbm, mulberry32 } from "../../kits/worldforge/noise.ts";

export type V3 = [number, number, number];

// ── Layout (metres). x → right, y up, −z → toward the open sea. ─────────────────
export const QUAY_X = -15; // quay face
export const QUAY_TOP = 3.5;
export const HULL_L = -11.5; // ship port side (faces the quay)
export const HULL_R = 16.5;
export const DECK = 9;
export const STERN_V = 60; // ship spans world z = −60 … −212
export const BOW_V = 212;
export const BW_Z = 290; // breakwater crest centre at z = −330
export const MOUTH: [number, number] = [70, 150]; // harbour entrance gap in x

// ── Storm sky ───────────────────────────────────────────────────────────────
export const SUN_DIR = new THREE.Vector3(0.42, 0.05, -0.91).normalize();
const skyVert = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize((modelMatrix * vec4(position,1.0)).xyz - cameraPosition);
  vec4 p = projectionMatrix * viewMatrix * vec4((modelMatrix * vec4(position,1.0)).xyz, 1.0); gl_Position = p; }`;
const skyVertEnv = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const skyFrag = /* glsl */ `
  varying vec3 vDir; uniform vec3 uSun; uniform float uT;
  float h(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  float fb(vec2 p){ float a=0.5, s=0.0; for(int k=0;k<6;k++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return s; }
  void main(){
    vec3 d = normalize(vDir);
    float y = d.y;
    vec3 zen = vec3(0.018,0.024,0.032);
    vec3 hor = vec3(0.105,0.125,0.140);
    vec3 c = mix(hor, zen, smoothstep(-0.02, 0.45, y));
    float s = max(dot(d, uSun), 0.0);
    // a tear in the overcast low on the horizon: cold silver light
    vec3 tear = vec3(0.78,0.90,1.0);
    c += tear * (pow(s, 14.0) * 0.30 + pow(s, 90.0) * 1.1) * smoothstep(-0.05, 0.03, y) * (1.0 - smoothstep(0.02, 0.16, y) * 0.6);
    // storm deck: two cloud layers projected on a dome
    vec2 uv = d.xz / (y + 0.12);
    float c1 = fb(uv * 1.4 + vec2(uT * 0.02, 0.0));
    float c2 = fb(uv * 3.1 + vec2(4.0, uT * 0.03));
    float dens = smoothstep(0.36, 0.78, c1 * 0.7 + c2 * 0.4) * (1.0 - 0.8 * pow(s, 40.0));
    float lit = pow(s, 3.0) * 0.6 + 0.12;
    vec3 cloudDark = vec3(0.012,0.015,0.019);
    vec3 cloudLit = mix(vec3(0.07,0.08,0.09), tear * 0.5, pow(s, 5.0));
    vec3 cloud = mix(cloudDark, cloudLit, lit * (1.0 - dens * 0.6) + smoothstep(0.55,0.75,c2)*0.08);
    c = mix(c, cloud, dens * smoothstep(-0.01, 0.12, y) * 0.92);
    // rain curtains hanging from the cloud base far away
    float curtain = fb(vec2(atan(d.x, -d.z) * 6.0, 0.0) + vec2(0.0, uT*0.01));
    c = mix(c, hor * 0.85, smoothstep(0.55, 0.8, curtain) * smoothstep(0.25, 0.0, y) * 0.5);
    if (y < 0.0) c = mix(hor, vec3(0.03,0.04,0.045), smoothstep(0.0, -0.2, y));
    gl_FragColor = vec4(c, 1.0);
  }`;

export const makeSkyMaterial = (env = false) =>
  new THREE.ShaderMaterial({
    vertexShader: env ? skyVertEnv : skyVert,
    fragmentShader: skyFrag,
    uniforms: { uSun: { value: SUN_DIR.clone() }, uT: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });

export const SkyDome: React.FC<{ t: number }> = ({ t }) => {
  const mat = useMemo(() => makeSkyMaterial(false), []);
  mat.uniforms.uT.value = t;
  return (
    <mesh renderOrder={-10} frustumCulled={false} material={mat}>
      <sphereGeometry args={[6000, 64, 32]} />
    </mesh>
  );
};

/** Reflection environment rendered from the same storm sky (not a sunny HDRI). */
export const useStormEnvironment = (intensity: number) => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const m = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), makeSkyMaterial(true));
    envScene.add(m);
    const rt = pm.fromScene(envScene, 0.02, 0.1, 200);
    scene.environment = rt.texture;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
};
const PMREMGenerator = THREE.PMREMGenerator;

// ── Open sea: Gerstner swell running at the breakwater, foam on crests and in the surf zone ──
const WAVES = [
  { dir: [0.15, 1], L: 118, A: 2.1, s: 1.0 },
  { dir: [-0.45, 1], L: 71, A: 1.3, s: 1.3 },
  { dir: [0.6, 1], L: 47, A: 0.8, s: 1.6 },
  { dir: [-1, 0.6], L: 29, A: 0.45, s: 2.1 },
  { dir: [1, 0.35], L: 17, A: 0.25, s: 2.8 },
  { dir: [-0.3, 1], L: 9, A: 0.12, s: 3.3 },
];

export const OpenSea: React.FC<{ t: number }> = ({ t }) => {
  const mesh = useMemo(() => {
    // denser rows near the breakwater, sparser toward the horizon
    const xs: number[] = [], zs: number[] = [];
    for (let x = -1600; x <= 1600; x += x > -400 && x < 500 ? 3 : 12) xs.push(x);
    let z = -BW_Z - 8;
    while (z > -3200) {
      zs.push(z);
      const d = -BW_Z - z;
      z -= d < 120 ? 2.5 : d < 400 ? 5 : d < 1000 ? 12 : 30;
    }
    const nx = xs.length, nz = zs.length;
    const pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3);
    const idx: number[] = [];
    for (let j = 0; j < nz - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.28, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
    m.receiveShadow = true;
    m.userData = { xs, zs };
    return m;
  }, []);

  useMemo(() => {
    const { xs, zs } = mesh.userData as { xs: number[]; zs: number[] };
    const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = mesh.geometry.getAttribute("color") as THREE.BufferAttribute;
    const deep = [0.02, 0.045, 0.05], mid = [0.09, 0.135, 0.14], foam = [0.7, 0.74, 0.75];
    let k = 0;
    for (let j = 0; j < zs.length; j++)
      for (let i = 0; i < xs.length; i++, k++) {
        const x0 = xs[i], z0 = zs[j];
        let x = x0, y = 0, z = z0, slope = 0;
        for (const w of WAVES) {
          const l = Math.hypot(w.dir[0], w.dir[1]);
          const dx = w.dir[0] / l, dz = w.dir[1] / l; // travelling toward +z (shore)
          const kk = (2 * Math.PI) / w.L;
          const ph = kk * (dx * x0 + dz * z0) - Math.sqrt(9.81 * kk) * t * w.s * 0.5;
          const s = Math.sin(ph), c = Math.cos(ph);
          y += w.A * s;
          x += 0.5 * w.A * dx * c;
          z += 0.5 * w.A * dz * c;
          slope += w.A * kk * c;
        }
        // shoaling: swell steepens and grows just before it hits the mound
        const dist = -BW_Z - 10 - z0; // 0 at the wall
        const shoal = 1 + 1.5 * Math.exp(-dist / 40);
        y *= shoal * (0.55 + 0.9 * fbm(x0 / 260 + 7, z0 / 260, 3));
        y += 0.6 * (fbm(x0 / 9, z0 / 9, 3) - 0.5);
        pos.setXYZ(k, x, y, z);
        const crest = Math.max(0, Math.min(1, (y - 0.9) / 1.8 + slope * 0.35));
        const streak = fbm(x0 / 6 + 3, z0 / 18, 4);
        const surf = Math.exp(-dist / 28) * (0.55 + 0.6 * streak);
        const f = Math.min(1, crest * (0.4 + 0.8 * streak) + surf + Math.max(0, streak - 0.55) * 1.8 * (dist < 900 ? 1 : 0));
        const v = 0.5 + 0.5 * fbm(x0 / 70, z0 / 70, 3);
        for (let ch = 0; ch < 3; ch++) col.setComponent(k, ch, (deep[ch] + (mid[ch] - deep[ch]) * v) * (1 - f) + foam[ch] * f);
      }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingSphere();
  }, [mesh, t]);

  return <primitive object={mesh} />;
};

/** Harbour basin: flat, dark, glassy — the calm the breakwater buys. */
export const Basin: React.FC = () => {
  const mat = useMemo(() => {
    const bump = surfaceGrain(59, 256, 0.25, 60);
    return new THREE.MeshPhysicalMaterial({ color: "#0d1a1d", roughness: 0.07, metalness: 0, bumpMap: bump, bumpScale: 0.05 });
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, -0.05, 255]} material={mat} receiveShadow>
      <planeGeometry args={[2400, 1100]} />
    </mesh>
  );
};

// ── Breakwater: rubble mound + tetrapod armour ─────────────────────────────────
export const tetrapodGeometry = () => {
  const dirs = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ].map((v) => v.normalize());
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const d of dirs) {
    const leg = new THREE.CylinderGeometry(0.34, 0.62, 1.25, 12, 1, true);
    leg.translate(0, 0.62, 0);
    const tip = new THREE.SphereGeometry(0.34, 12, 8);
    tip.translate(0, 1.25, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, d);
    for (const g of [leg, tip]) {
      g.applyQuaternion(q);
      parts.push(g.toNonIndexed());
    }
  }
  const core = new THREE.SphereGeometry(0.66, 16, 12).toNonIndexed();
  parts.push(core);
  for (const p of parts) p.deleteAttribute("uv");
  const g = mergeGeometries(parts)!;
  g.computeVertexNormals();
  return g;
};

const moundShape = () => {
  // (u = −z, v = y): sea toe at BW_Z+27, crest BW_Z±4 at +6, harbour toe at BW_Z−19
  const s = new THREE.Shape();
  s.moveTo(BW_Z + 27, -9);
  s.lineTo(BW_Z + 4, 6);
  s.lineTo(BW_Z - 4, 6);
  s.lineTo(BW_Z - 19, -9);
  s.lineTo(BW_Z + 27, -9);
  return s;
};

const Mound: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(moundShape(), { depth: x1 - x0, bevelEnabled: false, steps: 1 });
    const grain = surfaceGrain(31, 256, 0.35, 40);
    const m = new THREE.MeshStandardMaterial({ color: "#3f3d39", roughness: 0.95, bumpMap: grain, bumpScale: 0.6, map: grain });
    return { geo: g, mat: m };
  }, [x0, x1]);
  return <mesh geometry={geo} material={mat} rotation={[0, Math.PI / 2, 0]} position={[x0, 0, 0]} receiveShadow castShadow />;
};

export const Breakwater: React.FC = () => {
  const armour = useMemo(() => {
    const geo = tetrapodGeometry();
    const mat = new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#ffffff", roughness: 0.82, bumpMap: surfaceGrain(17, 256, 0.3, 2), bumpScale: 0.08 });
    const rnd = mulberry32(5901);
    const spans: [number, number][] = [
      [-420, MOUTH[0]],
      [MOUTH[1], 520],
    ];
    const items: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const o = new THREE.Object3D();
    for (const [a, b] of spans)
      for (let x = a + 1.5; x < b - 1.5; x += 2.6) {
        // crest rows + sea-side slope rows (u from crest edge to below water)
        for (let r = 0; r < 9; r++) {
          const s = r / 8;
          const u = BW_Z - 2 + s * 24 + (rnd() - 0.5) * 1.2; // −z
          const y = u < BW_Z + 4 ? 6 : 6 - ((u - (BW_Z + 4)) / 23) * 15;
          if (y < -2.2) continue;
          const sc = 1.55 + rnd() * 0.35;
          o.position.set(x + (r % 2) * 1.3 + (rnd() - 0.5) * 1.0, y + 0.9 + rnd() * 0.5, -u);
          o.rotation.set(rnd() * Math.PI * 2, rnd() * Math.PI * 2, rnd() * Math.PI * 2);
          o.scale.setScalar(sc);
          o.updateMatrix();
          items.push(o.matrix.clone());
          const g = 0.42 + rnd() * 0.16; // weathered concrete, a few darker wet ones
          const wet = y < 2.5 ? 0.6 : 1;
          cols.push(new THREE.Color(g * wet, g * wet * 0.99, g * wet * 0.96));
        }
      }
    const m = new THREE.InstancedMesh(geo, mat, items.length);
    items.forEach((mm, i) => {
      m.setMatrixAt(i, mm);
      m.setColorAt(i, cols[i]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, []);
  return (
    <>
      <Mound x0={-1400} x1={MOUTH[0] + 4} />
      <Mound x0={MOUTH[1] - 4} x1={1400} />
      <primitive object={armour} />
      <HarbourLight x={MOUTH[0] - 3} color="#ff3b2f" />
      <HarbourLight x={MOUTH[1] + 3} color="#36ff7a" />
    </>
  );
};

/** Entrance beacon on each breakwater head (red to port, green to starboard). */
const HarbourLight: React.FC<{ x: number; color: string }> = ({ x, color }) => {
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9d9d4", roughness: 0.6 }), []);
  const band = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.5 }), [color]);
  const lamp = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(6), toneMapped: false }), [color]);
  return (
    <group position={[x, 6, -BW_Z]}>
      <mesh material={white} position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.4, 8, 20]} />
      </mesh>
      <mesh material={band} position={[0, 5.5, 0]}>
        <cylinderGeometry args={[1.03, 1.12, 2, 20]} />
      </mesh>
      <mesh material={lamp} position={[0, 8.8, 0]}>
        <sphereGeometry args={[0.7, 16, 12]} />
      </mesh>
      <pointLight color={color} intensity={400} distance={60} position={[0, 9.5, 0]} />
    </group>
  );
};

// ── Spray: white water exploding over the armour (billboards on the FX layer) ────
/** Canvas plume: a fan of droplets and mist, dense and bright at the base, ragged at the top. */
export const plumeTexture = (seed: number) => {
  const W = 512, H = 768;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const rnd = mulberry32(seed);
  // mist body
  for (let i = 0; i < 140; i++) {
    const t = Math.pow(rnd(), 1.6); // 0 = base
    const spread = 40 + t * 210;
    const px = W / 2 + (rnd() - 0.5) * spread * 2 * (0.4 + 0.6 * rnd());
    const py = H - 40 - t * (H - 120) * (0.7 + 0.3 * rnd());
    const r = 18 + rnd() * 60 * (0.5 + t);
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    const a = 0.12 * (1 - t * 0.6);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(px, py, r, 0, Math.PI * 2);
    x.fill();
  }
  // droplets thrown up and out
  for (let i = 0; i < 5200; i++) {
    const t = Math.pow(rnd(), 1.2);
    const ang = (rnd() - 0.5) * 1.5;
    const len = t * (H - 80);
    const px = W / 2 + Math.sin(ang) * len * 0.75;
    const py = H - 40 - Math.cos(ang) * len + t * t * 120;
    const r = 0.6 + rnd() * 1.8 * (1 - t * 0.5);
    x.fillStyle = `rgba(255,255,255,${0.45 + rnd() * 0.55 * (1 - t * 0.6)})`;
    x.beginPath();
    x.arc(px, py, r, 0, Math.PI * 2);
    x.fill();
  }
  // churned foam at the foot
  for (let i = 0; i < 70; i++) {
    const px = W / 2 + (rnd() - 0.5) * 380, py = H - 30 - rnd() * 60, r = 20 + rnd() * 40;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** `mirror`: the same plumes flipped about the waterline at the harbour toe, faint — their reflection
 *  in the glassy basin (drawn without depth test, so they sit on top of the water plane). */
export const Spray: React.FC<{ camQuat: THREE.Quaternion; t: number; bursts: { x: number; h: number; w: number }[]; mirror?: boolean }> = ({ camQuat, t, bursts, mirror = false }) => {
  const group = useMemo(() => {
    const g = new THREE.Group();
    const tex = [plumeTexture(11), plumeTexture(23), plumeTexture(37)];
    const mats = tex.map((map) =>
      mirror
        ? new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, depthTest: false, opacity: 0.38, color: "#b9c8cf", fog: true })
        : new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, color: "#e6edf0", fog: true }),
    );
    const geo = new THREE.PlaneGeometry(1, 1.5);
    geo.translate(0, 0.75, 0); // pivot at the plume foot
    const rnd = mulberry32(911);
    bursts.forEach((b, i) => {
      for (let k = 0; k < 5; k++) {
        const m = new THREE.Mesh(geo, mats[(i + k) % 3]);
        const sc = b.w * (0.75 + 0.35 * rnd()) * (k === 0 ? 1 : 0.55 + 0.1 * k);
        const px = b.x + (rnd() - 0.5) * b.w * 0.7, pz = -(BW_Z + 2 + rnd() * 8);
        m.position.set(px, mirror ? 0 : 3, mirror ? -(BW_Z - 10) : pz);
        m.quaternion.copy(camQuat);
        const sy = (b.h / 1.5) * (k === 0 ? 1 : 0.45 + 0.12 * k);
        m.scale.set(sc * (rnd() < 0.5 ? -1 : 1), mirror ? -sy * 0.55 : sy, 1);
        m.renderOrder = (mirror ? 1 : 5) + k;
        m.layers.set(FX_LAYER);
        g.add(m);
      }
    });
    return g;
  }, [camQuat, bursts]);
  group.position.y = Math.sin(t * 2) * 0.3;
  return <primitive object={group} />;
};

// ── Rain: slanted streaks in front of the camera (FX layer) ────────────────────
export const Rain: React.FC<{ center: V3; t: number }> = ({ center, t }) => {
  const lines = useMemo(() => {
    const rnd = mulberry32(4242);
    const n = 6000;
    const p = new Float32Array(n * 6);
    const c = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const z = center[2] - Math.pow(rnd(), 0.7) * 260;
      const spread = 30 + (center[2] - z) * 0.5;
      const x = center[0] + (rnd() - 0.5) * spread * 2;
      const y = center[1] + (rnd() - 0.4) * 50;
      const len = 1.4 + rnd() * 1.6;
      p.set([x, y, z, x + 0.25 * len, y - len, z + 0.35 * len], i * 6);
      const b = 0.45 + rnd() * 0.4;
      c.set([b, b, b * 1.04, b * 0.3, b * 0.3, b * 0.32], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.07, depthWrite: false, fog: true }));
    l.layers.set(FX_LAYER);
    l.frustumCulled = false;
    return l;
  }, [center]);
  lines.position.y = -((t * 14) % 6);
  return <primitive object={lines} />;
};
