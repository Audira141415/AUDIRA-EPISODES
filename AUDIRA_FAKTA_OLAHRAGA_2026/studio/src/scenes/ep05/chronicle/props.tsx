// CHRONICLE set pieces — simple, low-detail solids whose job is to read as dark shapes against a lit sky and to
// catch a rim of the key light. All procedural (no downloaded models), deterministic, metres.
//   <Water>  dusk/fire sea with fresnel sky + glitter path toward the light
//   <Rampart> stone parapet with embrasures; <Cannon>; <Lantern>; <Flag>
//   <Ship>   three-masted sailing ship with furled sails and rigging
//   <Stilthouse> rumah panggung; <Palm> coconut palm; <Volcano> stratovolcano with glowing lava runs

import React, { useLayoutEffect, useMemo } from "react";
import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, ExtrudeGeometry, LatheGeometry, MeshStandardMaterial, PlaneGeometry,
  QuadraticBezierCurve3, RepeatWrapping, SRGBColorSpace, Shape, ShapeGeometry, ShaderMaterial, TubeGeometry, Vector2, Vector3, BoxGeometry, MeshBasicMaterial,
} from "three";
import { noise1 } from "./cam.ts";
import { fbm } from "./relief.ts";

const hash = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ materials
const canvasTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
};

let stoneMat: MeshStandardMaterial | null = null;
export const stone = () => {
  if (stoneMat) return stoneMat;
  const map = canvasTex(512, 512, (g) => {
    g.fillStyle = "#6d6258";
    g.fillRect(0, 0, 512, 512);
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const h = 512 / rows;
      let x = r % 2 ? -40 : 0;
      let i = 0;
      while (x < 512) {
        const w = 70 + hash(r * 31 + i) * 60;
        const v = 0.78 + hash(r * 17 + i * 3) * 0.32;
        g.fillStyle = `rgb(${Math.round(110 * v)},${Math.round(99 * v)},${Math.round(88 * v)})`;
        g.fillRect(x + 3, r * h + 3, w - 6, h - 6);
        for (let k = 0; k < 40; k++) {
          g.fillStyle = `rgba(0,0,0,${0.05 + hash(k + r * 7 + i) * 0.08})`;
          g.fillRect(x + hash(k * 3 + i) * w, r * h + hash(k * 5 + r) * h, 3 + hash(k) * 8, 2 + hash(k * 2) * 5);
        }
        x += w;
        i++;
      }
    }
  }, [1, 1]);
  stoneMat = new MeshStandardMaterial({ map, roughness: 0.95, color: "#d8cfc4" });
  return stoneMat;
};
const woodMat = new MeshStandardMaterial({ color: "#3a2b22", roughness: 0.9 });
const darkWood = new MeshStandardMaterial({ color: "#211915", roughness: 0.95 });
const ironMat = new MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.5, metalness: 0.6 });
const thatchMat = new MeshStandardMaterial({ color: "#3b2a1d", roughness: 1 });
const leafMat = new MeshStandardMaterial({ color: "#121410", roughness: 1, side: DoubleSide });
const sailMat = new MeshStandardMaterial({ color: "#5a5048", roughness: 1, side: DoubleSide });

// ------------------------------------------------------------------ water
const WaterShader = {
  vertexShader: /* glsl */ `
    varying vec3 vW;
    #include <fog_pars_vertex>
    void main(){
      vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
      vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uDeep; uniform vec3 uSky; uniform vec3 uSun; uniform vec3 uSunDir; uniform float uTime; uniform float uGlitter;
    varying vec3 vW;
    #include <fog_pars_fragment>
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float waves(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + uTime * 0.35; a *= 0.5; } return s; }
    void main(){
      vec2 p = vW.xz * vec2(0.22, 0.6);
      float e = 0.05;
      float hx = waves(p + vec2(e, 0.0)) - waves(p - vec2(e, 0.0));
      float hz = waves(p + vec2(0.0, e)) - waves(p - vec2(0.0, e));
      vec3 nrm = normalize(vec3(-hx * 1.6, 1.0, -hz * 1.6));
      vec3 v = normalize(cameraPosition - vW);
      float fr = pow(1.0 - max(dot(v, nrm), 0.0), 4.0);
      vec3 r = reflect(-v, nrm);
      vec3 col = mix(uDeep, uSky, clamp(0.15 + fr * 1.2, 0.0, 1.0));
      float g = pow(max(dot(r, normalize(uSunDir)), 0.0), 220.0) * uGlitter;
      float g2 = pow(max(dot(r, normalize(uSunDir)), 0.0), 18.0) * 0.18 * uGlitter;
      col += uSun * (g * 3.0 + g2);
      gl_FragColor = vec4(col, 1.0);
      #include <fog_fragment>
    }`,
};
export const Water: React.FC<{ y: number; size?: number; t: number; deep: string; sky: string; sun: string; sunDir: [number, number, number]; glitter?: number }> = ({ y, size = 4000, t, deep, sky, sun, sunDir, glitter = 1 }) => {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        ...WaterShader,
        uniforms: {
          uDeep: { value: new Color() }, uSky: { value: new Color() }, uSun: { value: new Color() }, uSunDir: { value: new Vector3() }, uTime: { value: 0 }, uGlitter: { value: 1 },
          fogColor: { value: new Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 }, fogDensity: { value: 0.001 },
        },
        fog: true,
      }),
    [],
  );
  useLayoutEffect(() => () => mat.dispose(), [mat]);
  mat.uniforms.uDeep.value.set(deep);
  mat.uniforms.uSky.value.set(sky);
  mat.uniforms.uSun.value.set(sun);
  mat.uniforms.uSunDir.value.set(...sunDir);
  mat.uniforms.uTime.value = t;
  mat.uniforms.uGlitter.value = glitter;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={mat}>
      <planeGeometry args={[size, size, 1, 1]} />
    </mesh>
  );
};

// ------------------------------------------------------------------ fort pieces
/** Parapet running along x at z = 0 (outer face toward −z), walkway top at y = 0. Embrasures at `gaps` (x). */
export const Rampart: React.FC<{ x0: number; x1: number; gaps: number[]; h?: number; drop?: number }> = ({ x0, x1, gaps, h = 1.2, drop = 8 }) => {
  const mat = stone();
  const parts: React.ReactNode[] = [];
  const pts = [x0, ...gaps.flatMap((g) => [g - 0.55, g + 0.55]), x1];
  for (let i = 0; i < pts.length; i += 2) {
    const a = pts[i], b = pts[i + 1];
    parts.push(
      <mesh key={`m${i}`} material={mat} position={[(a + b) / 2, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b - a, h, 0.9]} />
      </mesh>,
    );
  }
  gaps.forEach((g, i) =>
    parts.push(
      <mesh key={`s${i}`} material={mat} position={[g, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.5, 0.9]} />
      </mesh>,
    ),
  );
  return (
    <group>
      {parts}
      {/* walkway + outer wall dropping to the water */}
      <mesh material={mat} position={[(x0 + x1) / 2, -0.15, 6]} receiveShadow>
        <boxGeometry args={[x1 - x0, 0.3, 12]} />
      </mesh>
      <mesh material={mat} position={[(x0 + x1) / 2, -drop / 2, -0.25]} receiveShadow>
        <boxGeometry args={[x1 - x0, drop, 0.5]} />
      </mesh>
    </group>
  );
};

export const Cannon: React.FC<{ pos: [number, number, number]; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh material={darkWood} position={[0, 0.32, 0.3]} castShadow>
      <boxGeometry args={[0.6, 0.35, 1.2]} />
    </mesh>
    {[-0.34, 0.34].map((x) => [0.0, 0.75].map((z) => (
      <mesh key={`${x}${z}`} material={darkWood} position={[x, 0.2, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.09, 14]} />
      </mesh>
    )))}
    <mesh material={ironMat} position={[0, 0.62, -0.25]} rotation={[Math.PI / 2 + 0.05, 0, 0]} castShadow>
      <cylinderGeometry args={[0.11, 0.17, 1.9, 16]} />
    </mesh>
    <mesh material={ironMat} position={[0, 0.6, -1.15]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.135, 0.135, 0.1, 16]} />
    </mesh>
  </group>
);

const lampCore = new MeshBasicMaterial({ color: new Color("#ffc874").multiplyScalar(4), toneMapped: false });
export const Lantern: React.FC<{ pos: [number, number, number]; t: number; seed?: number; light?: boolean }> = ({ pos, t, seed = 1, light = true }) => {
  const f = 1 + 0.12 * noise1(t * 7, seed);
  return (
    <group position={pos}>
      <mesh material={darkWood} position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 8]} />
      </mesh>
      <mesh material={ironMat} position={[0, 2.35, 0]}>
        <boxGeometry args={[0.28, 0.36, 0.28]} />
      </mesh>
      <mesh material={lampCore} position={[0, 2.35, 0]} scale={[0.17 * f, 0.26 * f, 0.17 * f]} userData={{ noMask: true }}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {light && <pointLight position={[0, 2.35, 0.4]} color="#ffb860" intensity={30 * f} distance={16} decay={1.4} />}
    </group>
  );
};

export const Flag: React.FC<{ pos: [number, number, number]; t: number; h?: number; w?: number; color?: string; bands?: string[] }> = ({ pos, t, h = 9, w = 2.4, color = "#1c1716", bands }) => {
  const geo = useMemo(() => new PlaneGeometry(w, w * 0.62, 16, 6), [w]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  const mat = useMemo(() => new MeshStandardMaterial({ color, side: DoubleSide, roughness: 1 }), [color]);
  const p = geo.attributes.position as BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = (i % 17) / 16;
    const x = -w / 2 + u * w;
    const yy = (Math.floor(i / 17) / 6 - 0.5) * w * 0.62;
    const z = Math.sin(u * 5 - t * 6.5) * 0.18 * u + Math.sin(u * 9 - t * 9 + yy) * 0.05 * u;
    p.setXYZ(i, x + w / 2, yy - z * 0.2, z);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  void bands;
  return (
    <group position={pos}>
      <mesh material={darkWood} position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, h, 8]} />
      </mesh>
      <mesh geometry={geo} material={mat} position={[0.06, h - w * 0.36, 0]} castShadow />
    </group>
  );
};

// ------------------------------------------------------------------ ship
const hullGeo = (() => {
  const s = new Shape();
  // top view: stern at −x, bow at +x
  s.moveTo(-14, -3.2);
  s.lineTo(6, -3.4);
  s.quadraticCurveTo(13, -2.6, 17, 0);
  s.quadraticCurveTo(13, 2.6, 6, 3.4);
  s.lineTo(-14, 3.2);
  s.quadraticCurveTo(-15.5, 0, -14, -3.2);
  const g = new ExtrudeGeometry(s, { depth: 4.2, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -2.0, 0);
  return g;
})();
const shipMat = new MeshStandardMaterial({ color: "#2a211d", roughness: 0.9 });
const ropeGeo = new CylinderGeometry(1, 1, 1, 4, 1);

const Rope: React.FC<{ a: [number, number, number]; b: [number, number, number]; r?: number }> = ({ a, b, r = 0.035 }) => {
  const A = new Vector3(...a), B = new Vector3(...b);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const d = B.clone().sub(A);
  const l = d.length();
  const up = new Vector3(0, 1, 0);
  const n = d.clone().normalize();
  const axis = up.clone().cross(n);
  const ang = Math.acos(Math.min(1, Math.max(-1, up.dot(n))));
  const ax = axis.lengthSq() < 1e-9 ? new Vector3(1, 0, 0) : axis.normalize();
  const sn = Math.sin(ang / 2);
  return <mesh geometry={ropeGeo} material={shipMat} position={mid} quaternion={[ax.x * sn, ax.y * sn, ax.z * sn, Math.cos(ang / 2)]} scale={[r, l, r]} />;
};

export const Ship: React.FC<{ pos: [number, number, number]; rotY?: number; t: number; scale?: number; lights?: boolean; seed?: number }> = ({ pos, rotY = 0, t, scale = 1, lights = true, seed = 1 }) => {
  const roll = Math.sin(t * 0.7 + seed) * 0.025, pitch = Math.sin(t * 0.55 + seed * 2) * 0.012;
  const masts: [number, number][] = [[-8, 22], [1, 26], [9, 21]];
  return (
    <group position={pos} rotation={[pitch, rotY, roll]} scale={scale}>
      <mesh geometry={hullGeo} material={shipMat} castShadow />
      {/* stern castle + bowsprit */}
      <mesh material={shipMat} position={[-11.5, 3.0, 0]}><boxGeometry args={[5, 2.2, 6]} /></mesh>
      <Rope a={[15, 2.2, 0]} b={[24, 6.5, 0]} r={0.18} />
      {masts.map(([x, h], i) => (
        <group key={i}>
          <mesh material={shipMat} position={[x, 2 + h / 2, 0]}><cylinderGeometry args={[0.16, 0.3, h, 8]} /></mesh>
          {[0.42, 0.66, 0.86].map((k, j) => {
            const y = 2 + h * k, w = (1.15 - k) * 13;
            return (
              <group key={j}>
                <mesh material={shipMat} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, w, 6]} /></mesh>
                <mesh material={sailMat} position={[x + 0.05, y - 0.35, 0]}><boxGeometry args={[0.45, 0.7, w * 0.92]} /></mesh>
              </group>
            );
          })}
          <Rope a={[x, 2 + h, 0]} b={[x - 6, 2.2, 3.1]} />
          <Rope a={[x, 2 + h, 0]} b={[x - 6, 2.2, -3.1]} />
          <Rope a={[x, 2 + h * 0.86, 0]} b={[x + 7, 2.4, 0]} />
        </group>
      ))}
      <Rope a={[-8, 24, 0]} b={[1, 28, 0]} />
      <Rope a={[1, 28, 0]} b={[24, 6.5, 0]} />
      {lights && (
        <mesh material={lampCore} position={[-13.2, 4.6, 0]} scale={0.32} userData={{ noMask: true }}>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      )}
    </group>
  );
};

// ------------------------------------------------------------------ village pieces
const roofGeo = (() => {
  const s = new Shape();
  s.moveTo(-3.6, 0);
  s.lineTo(0, 2.6);
  s.lineTo(3.6, 0);
  s.lineTo(3.2, 0);
  s.lineTo(0, 2.25);
  s.lineTo(-3.2, 0);
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: 7.5, bevelEnabled: false });
  g.translate(0, 0, -3.75);
  return g;
})();
const gableGeo = (() => {
  const s = new Shape();
  s.moveTo(-3.0, 0);
  s.lineTo(0, 2.1);
  s.lineTo(3.0, 0);
  s.closePath();
  return new ShapeGeometry(s);
})();

export const Stilthouse: React.FC<{ pos: [number, number, number]; rotY?: number; scale?: number }> = ({ pos, rotY = 0, scale = 1 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
    {[-2.4, 0, 2.4].flatMap((x) => [-2.6, 0, 2.6].map((z) => (
      <mesh key={`${x}${z}`} material={darkWood} position={[x, 1.1, z]} castShadow><cylinderGeometry args={[0.1, 0.12, 2.2, 6]} /></mesh>
    )))}
    <mesh material={woodMat} position={[0, 2.3, 0]} castShadow receiveShadow><boxGeometry args={[5.8, 0.25, 6.6]} /></mesh>
    <mesh material={woodMat} position={[0, 3.4, 0]} castShadow receiveShadow><boxGeometry args={[5.2, 2.0, 6.0]} /></mesh>
    <mesh geometry={roofGeo} material={thatchMat} position={[0, 4.35, 0]} castShadow />
    <mesh geometry={gableGeo} material={woodMat} position={[0, 4.4, 3.0]} />
    <mesh geometry={gableGeo} material={woodMat} position={[0, 4.4, -3.0]} rotation={[0, Math.PI, 0]} />
    {/* ladder */}
    <mesh material={darkWood} position={[1.2, 1.15, 3.7]} rotation={[0.45, 0, 0]}><boxGeometry args={[0.7, 0.08, 2.6]} /></mesh>
  </group>
);

const frondGeo = (() => {
  const L = 4.2;
  const s = new Shape();
  const N = 22;
  const w = (x: number) => Math.pow(Math.sin(Math.PI * Math.min(1, x / L)), 0.6) * 0.85;
  s.moveTo(0, 0.04);
  for (let i = 0; i < N; i++) {
    const x = (i / N) * L;
    s.lineTo(x + 0.25, w(x));
    s.lineTo(x + 0.12, 0.04);
  }
  s.lineTo(L, 0);
  for (let i = N - 1; i >= 0; i--) {
    const x = (i / N) * L;
    s.lineTo(x + 0.12, -0.04);
    s.lineTo(x + 0.25, -w(x));
  }
  s.lineTo(0, -0.04);
  const g = new ShapeGeometry(s, 2);
  const p = g.attributes.position as BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const k = x / L;
    // lay flat (y → z), arc up then droop, leaflets hang down from the rachis
    p.setXYZ(i, x, 0.9 * Math.sin(k * 1.3) - 2.2 * k * k - Math.abs(y) * 0.45, y);
  }
  g.computeVertexNormals();
  return g;
})();

export const Palm: React.FC<{ pos: [number, number, number]; h?: number; lean?: [number, number]; t: number; seed?: number }> = ({ pos, h = 9, lean = [1.6, 0.4], t, seed = 1 }) => {
  const trunk = useMemo(() => {
    const c = new QuadraticBezierCurve3(new Vector3(0, 0, 0), new Vector3(lean[0] * 0.2, h * 0.55, lean[1] * 0.2), new Vector3(lean[0], h, lean[1]));
    return { geo: new TubeGeometry(c, 16, 0.17, 7, false), top: new Vector3(lean[0], h, lean[1]) };
  }, [h, lean]);
  useLayoutEffect(() => () => trunk.geo.dispose(), [trunk]);
  const sway = noise1(t * 0.6, seed) * 0.06;
  return (
    <group position={pos}>
      <mesh geometry={trunk.geo} material={darkWood} castShadow />
      <group position={trunk.top} rotation={[sway, 0, sway * 0.6]}>
        {Array.from({ length: 11 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2 + hash(seed + i) * 0.4;
          const tilt = -0.15 + hash(seed * 3 + i) * 0.35;
          const fl = Math.sin(t * 1.3 + i * 1.7 + seed) * 0.05;
          return <mesh key={i} geometry={frondGeo} material={leafMat} rotation={[0, a, tilt + fl]} scale={0.9 + hash(i + seed * 7) * 0.3} castShadow />;
        })}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ volcano
export const Volcano: React.FC<{ pos: [number, number, number]; radius: number; height: number; glow?: number; seed?: number }> = ({ pos, radius, height, glow = 1, seed = 2 }) => {
  const { geo, mat } = useMemo(() => {
    const pts: Vector2[] = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const u = i / N; // 0 = crater rim, 1 = base
      const r = radius * (0.07 + 0.93 * u);
      const y = height * Math.pow(1 - u, 1.6) - height * 0.02;
      pts.push(new Vector2(r, y));
    }
    pts.unshift(new Vector2(radius * 0.02, height * 0.86));
    const g = new LatheGeometry(pts, 96);
    const p = g.attributes.position as BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const a = Math.atan2(z, x);
      const n = fbm(Math.cos(a) * 3 + seed, y / height * 4, 4) - 0.5;
      const ridge = Math.pow(Math.abs(Math.sin(a * 11 + n * 3)), 3) * 0.04;
      const k = 1 + n * 0.12 - ridge;
      p.setXYZ(i, x * k, y + n * height * 0.04, z * k);
    }
    g.computeVertexNormals();
    const em = canvasTex(512, 512, (c) => {
      c.fillStyle = "#000";
      c.fillRect(0, 0, 512, 512);
      // lathe uv: u around, v along the profile (0 at the rim side → 1 at the base)
      for (let s = 0; s < 7; s++) {
        let x = 30 + hash(s * 5 + seed) * 452;
        const len = 120 + hash(s * 7 + seed) * 220;
        c.lineCap = "round";
        for (let y = 0; y < len; y += 4) {
          const k = y / len;
          c.strokeStyle = `rgba(255,${Math.round(120 + 90 * (1 - k))},40,${(1 - k) * 0.9})`;
          c.lineWidth = 7 * (1 - k * 0.6);
          c.beginPath();
          c.moveTo(x, y);
          x += (hash(s * 13 + y) - 0.5) * 6;
          c.lineTo(x, y + 4);
          c.stroke();
        }
      }
      c.fillStyle = "rgba(190,60,18,1)";
      c.fillRect(0, 0, 512, 12);
    });
    em.wrapT = RepeatWrapping;
    em.flipY = false;
    const m = new MeshStandardMaterial({ color: "#1d1614", roughness: 1, emissive: new Color("#ff5a1a"), emissiveMap: em, emissiveIntensity: 2.5 });
    return { geo: g, mat: m };
  }, [radius, height, seed]);
  useLayoutEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  mat.emissiveIntensity = 2.5 * glow;
  return <mesh geometry={geo} material={mat} position={pos} receiveShadow />;
};

/** Gently rolling dark ground (village / fields). */
export const Ground: React.FC<{ size?: number; color?: string; amp?: number; seed?: number }> = ({ size = 600, color = "#2b201b", amp = 1.2, seed = 4 }) => {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(size, size, 160, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const d = Math.hypot(x, z);
      const k = Math.min(1, Math.max(0, (d - 12) / 40));
      p.setY(i, (fbm(x * 0.02 + seed, z * 0.02, 4) - 0.5) * amp * 2 * k + (fbm(x * 0.3, z * 0.3, 2) - 0.5) * 0.08);
    }
    g.computeVertexNormals();
    return g;
  }, [size, amp, seed]);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
};
void BoxGeometry;
void BufferGeometry;
