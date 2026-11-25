// EP038 film world: the Teluk Jakarta relief map from the cover, plus animated layers driven by
// props (fringe overlay shader, PS-InSAR points, GNSS stations, image stack, clouds, radar beam,
// satellite). Every prop is computed from the frame in Film.tsx; nothing animates on its own.

import React, { useMemo } from "react";
import * as THREE from "three";
import { BOWLS, COAST, LAT0, LAT1, LON0, LON1, MAP_H, MAP_W, coastLat, hash, landAt, latToZ, lonToX, sinkRaw, vnoise } from "./map";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { PAL, buildTexture, cityMesh, heightAt, terrainGeometry } from "./Cover";

// ---------- shared, built once per tab ----------
let _geo: THREE.BufferGeometry | null = null;
let _tex: THREE.Texture | null = null;
export const terrain = () => (_geo ??= terrainGeometry());
export const greyTex = () => (_tex ??= buildTexture(false));

export const mapPoint = (lon: number, lat: number, lift = 0) => new THREE.Vector3(lonToX(lon), heightAt(lon, lat) + lift, latToZ(lat));
export const BOWL_MAIN = { lon: 106.8, lat: -6.118 };

// ---------- base terrain ----------
export const Terrain: React.FC<{ night: number }> = ({ night }) => {
  const tex = greyTex();
  return (
    <mesh geometry={terrain()} receiveShadow castShadow>
      <meshStandardMaterial map={tex} roughness={0.82} metalness={0.05} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.12 * (1 - night * 0.7)} />
    </mesh>
  );
};

export const SeaFar: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, -MAP_H / 2 - 19.9]}>
    <planeGeometry args={[80, 40]} />
    <meshStandardMaterial color="#0b1e33" roughness={0.6} />
  </mesh>
);

let _city: THREE.InstancedMesh | null = null;
export const City: React.FC = () => <primitive object={(_city ??= cityMesh(false))} />;

// ---------- interferogram fringe overlay (analytic, same field as the cover) ----------
const fringeMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: {
      uCoast: { value: COAST.map(([x, y]) => new THREE.Vector2(x, y)) },
      uBowls: { value: BOWLS.map(([x, y, r, w]) => new THREE.Vector4(x, y, r, w)) },
      uOpacity: { value: 1 },
      uPhase: { value: 0 },
      uWipe: { value: 99 },
      uWipeC: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `varying vec2 vUv; varying vec3 vPos;
      void main(){ vUv = uv; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `precision highp float;
      uniform vec2 uCoast[${COAST.length}]; uniform vec4 uBowls[${BOWLS.length}];
      uniform float uOpacity, uPhase, uWipe; uniform vec2 uWipeC;
      varying vec2 vUv; varying vec3 vPos;
      vec3 hsl2rgb(float h, float s, float l){
        vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
        return l + s*(rgb-0.5)*(1.0-abs(2.0*l-1.0));
      }
      void main(){
        float lon = ${LON0.toFixed(4)} + vUv.x * ${(LON1 - LON0).toFixed(4)};
        float lat = ${LAT0.toFixed(4)} + (1.0 - vUv.y) * ${(LAT1 - LAT0).toFixed(4)};
        float cl = uCoast[0].y;
        for (int i = 1; i < ${COAST.length}; i++) {
          if (lon > uCoast[i-1].x && lon <= uCoast[i].x) cl = mix(uCoast[i-1].y, uCoast[i].y, (lon-uCoast[i-1].x)/(uCoast[i].x-uCoast[i-1].x));
        }
        if (lon > uCoast[${COAST.length - 1}].x) cl = uCoast[${COAST.length - 1}].y;
        float mask = step(0.0008, cl - lat);
        float s = 0.0;
        for (int i = 0; i < ${BOWLS.length}; i++) {
          vec2 d = vec2(lon, lat) - uBowls[i].xy;
          s += uBowls[i].w * exp(-dot(d,d) / (uBowls[i].z*uBowls[i].z));
        }
        s += 0.18 * exp(-pow((lat + 6.14)/0.05, 2.0)) * exp(-pow((lon - 106.83)/0.12, 2.0));
        float a = clamp((min(s,1.0)-0.07)/0.14, 0.0, 1.0) * 0.9 * mask * uOpacity;
        float dist = length(vPos.xz - uWipeC);
        a *= 1.0 - smoothstep(uWipe - 0.35, uWipe, dist);
        vec3 col = hsl2rgb(fract(s*5.2 + 0.62 + uPhase), 0.95, 0.5);
        gl_FragColor = vec4(col * 0.95, a);
      }`,
  });

export const Fringe: React.FC<{ opacity: number; phase: number; wipe?: number; wipeC?: [number, number] }> = ({ opacity, phase, wipe = 99, wipeC = [0, 0] }) => {
  const mat = useMemo(fringeMaterial, []);
  mat.uniforms.uOpacity.value = opacity;
  mat.uniforms.uPhase.value = phase;
  mat.uniforms.uWipe.value = wipe;
  (mat.uniforms.uWipeC.value as THREE.Vector2).set(wipeC[0], wipeC[1]);
  if (opacity <= 0.001) return null;
  return <mesh geometry={terrain()} material={mat} renderOrder={2} />;
};

// ---------- PS-InSAR points ----------
const RAMP = ["#2E70CE", "#2fb59a", "#7cc84a", "#f2d43a", "#f08a2c", "#e3412c"].map((c) => new THREE.Color(c));
export const rateColor = (r: number) => {
  const x = Math.min(0.999, Math.max(0, r)) * (RAMP.length - 1);
  const i = Math.floor(x);
  return RAMP[i].clone().lerp(RAMP[i + 1], x - i);
};
type PsPoint = { p: THREE.Vector3; rate: THREE.Color; order: number };
let _ps: PsPoint[] | null = null;
const psPoints = (): PsPoint[] => {
  if (_ps) return _ps;
  const out: PsPoint[] = [];
  for (let k = 0; k < 9000 && out.length < 3600; k++) {
    const lon = 106.6 + hash(k, 11) * 0.44;
    const lat = -6.09 - hash(k, 23) * 0.27;
    if (landAt(lon, lat, 0.0005) < 1 || coastLat(lon) - lat < 0.004) continue;
    const r = Math.min(1, sinkRaw(lon, lat) * 1.05 + Math.max(0, (lat + 6.2) / 0.1) * 0.12 + (hash(k, 5) - 0.5) * 0.08);
    const p = mapPoint(lon, lat, 0.035);
    out.push({ p, rate: rateColor(r), order: hash(k, 77) * 0.7 + Math.max(0, (-6.09 - lat) / 0.27) * 0.3 });
  }
  return (_ps = out);
};

export const PSPoints: React.FC<{ reveal: number; color: number }> = ({ reveal, color }) => {
  const pts = psPoints();
  const mesh = useMemo(() => {
    const g = new THREE.CircleGeometry(0.022, 8);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, depthWrite: false }), pts.length);
    m.renderOrder = 4;
    return m;
  }, [pts]);
  const M = new THREE.Matrix4();
  const white = new THREE.Color("#F2F5F6");
  pts.forEach((q, i) => {
    const k = Math.min(1, Math.max(0, (reveal - q.order) / 0.08));
    const s = k * (1 + Math.max(0, 1 - Math.abs(k - 0.6) * 4) * 0.5);
    M.makeScale(s, s, s);
    M.setPosition(q.p);
    mesh.setMatrixAt(i, M);
    mesh.setColorAt(i, white.clone().lerp(q.rate, color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  if (reveal <= 0) return null;
  return <primitive object={mesh} />;
};

// ---------- GNSS / CORS stations ----------
export const GNSS_SITES: [number, number][] = [
  [106.71, -6.2],
  [106.84, -6.26],
  [106.95, -6.2],
  [106.79, -6.15],
];
export const Gnss: React.FC<{ p: number; t: number }> = ({ p, t }) => (
  <group>
    {GNSS_SITES.map(([lon, lat], i) => {
      const k = Math.min(1, Math.max(0, p * 1.6 - i * 0.2));
      if (k <= 0) return null;
      const base = mapPoint(lon, lat);
      const h = 0.34 * (1 - Math.pow(1 - k, 3));
      const ring = ((t * 0.9 + i * 0.25) % 1) * k;
      return (
        <group key={i} position={base}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.03, 16]} />
            <meshStandardMaterial color="#cfd5d9" roughness={0.5} />
          </mesh>
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, h, 8]} />
            <meshStandardMaterial color="#d8dde0" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, h + 0.02, 0]}>
            <sphereGeometry args={[0.045, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#F2F5F6" roughness={0.35} emissive={PAL.amber} emissiveIntensity={0.25 * k} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.3 + ring * 2.2} renderOrder={6}>
            <ringGeometry args={[0.1, 0.12, 48]} />
            <meshBasicMaterial color={PAL.amber} transparent opacity={(1 - ring) * k} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ---------- radar image sheets (citra) ----------
const speckleTex = (seed: number) => {
  const N = 512;
  const cv = document.createElement("canvas");
  cv.width = N;
  cv.height = N;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const lon = LON0 + (i / N) * (LON1 - LON0);
      const lat = LAT0 + (j / N) * (LAT1 - LAT0);
      const land = landAt(lon, lat, 0.002);
      // fine, low-contrast speckle; sea stays a readable dark blue-grey, never black
      const sp = 0.82 + (hash(i + seed * 997, j) + hash(i + 1 + seed * 997, j + 1)) * 0.18;
      const base = land * (0.62 + vnoise(lon * 700, lat * 700) * 0.18) + (1 - land) * 0.3;
      const v = base * sp;
      const o = (j * N + i) * 4;
      img.data[o] = Math.min(255, v * 235);
      img.data[o + 1] = Math.min(255, v * 245);
      img.data[o + 2] = Math.min(255, (v + (1 - land) * 0.08) * 255);
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
let _speckle: THREE.Texture[] | null = null;
const speckles = () => (_speckle ??= [0, 1, 2].map(speckleTex));

/** One radar image sheet floating above the map. */
export const Sheet: React.FC<{ pos: [number, number, number]; size: number; opacity: number; seed: number; tilt?: number }> = ({ pos, size, opacity, seed, tilt = 0 }) => {
  if (opacity <= 0.001) return null;
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, tilt]}>
      <mesh renderOrder={8}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={speckles()[seed % 3]} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <lineSegments renderOrder={9}>
        <edgesGeometry args={[new THREE.PlaneGeometry(size, size)]} />
        <lineBasicMaterial color={PAL.amber} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
};

// ---------- clouds: thin translucent layers with soft noise alpha ----------
const cloudTex = (seed: number) => {
  const N = 256;
  const cv = document.createElement("canvas");
  cv.width = N;
  cv.height = N;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = i / N, y = j / N;
      let f = 0, a = 0.5, s = 4;
      for (let o = 0; o < 5; o++) {
        f += a * vnoise(x * s + seed * 13.1, y * s + seed * 7.3);
        a *= 0.5;
        s *= 2;
      }
      const edge = Math.min(1, Math.min(x, 1 - x, y, 1 - y) * 5);
      const al = Math.max(0, Math.min(1, (f - 0.45) * 2.4)) * edge;
      const p = (j * N + i) * 4;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = 240;
      img.data[p + 3] = al * 255;
    }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
let _clouds: THREE.Texture[] | null = null;

export const Clouds: React.FC<{ center: THREE.Vector3; opacity: number; t: number }> = ({ center, opacity, t }) => {
  const tex = (_clouds ??= [0, 1, 2].map(cloudTex));
  if (opacity <= 0.001) return null;
  return (
    <group position={[center.x, center.y, center.z]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[t * 0.04 * (i + 1) + (i - 1) * 0.3, (i - 1) * 0.09, (i - 1) * 0.2]} rotation={[-Math.PI / 2, 0, i * 0.7]} renderOrder={3}>
          <planeGeometry args={[4.4, 3.2]} />
          <meshStandardMaterial map={tex[i]} transparent opacity={opacity * (0.55 - i * 0.1)} depthWrite={false} roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- radar beam: soft swath + thin travelling sine pulse ----------
const beamMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uCol: { value: new THREE.Color(PAL.amber) }, uGain: { value: 1 } },
    vertexShader: `attribute float along; varying float vA; void main(){ vA = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uGain; uniform vec3 uCol; varying float vA;
      void main(){
        float a = 0.07 * smoothstep(0.0, 0.08, vA) * (0.5 + 0.5*vA) * uGain;
        gl_FragColor = vec4(uCol * a, 1.0);
      }`,
  });

const sinePulse = (A: THREE.Vector3, G: THREE.Vector3, t: number, dir: number, amp: number, lambda: number) => {
  const L = A.distanceTo(G);
  const d = G.clone().sub(A).normalize();
  const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0));
  if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
  side.normalize();
  const pts: THREE.Vector3[] = [];
  const N = 260;
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * L;
    pts.push(A.clone().addScaledVector(d, s).addScaledVector(side, amp * Math.sin(((s - dir * t * 0.9) / lambda) * Math.PI * 2)));
  }
  return new THREE.CatmullRomCurve3(pts);
};

export const Beam: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; t: number; color?: string; dir?: number; gain?: number; hw?: number; hd?: number }> = ({
  from, to, t, color = PAL.amber, dir = 1, gain = 1, hw = 1.0, hd = 0.6,
}) => {
  const mat = useMemo(beamMaterial, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const top = [[-0.4, -0.06], [0.4, -0.06], [0.4, 0.06], [-0.4, 0.06]].map(([x, z]) => from.clone().add(new THREE.Vector3(x, 0, z)));
  const foot = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => new THREE.Vector3(to.x + x, to.y, to.z + z));
  const pos: number[] = [];
  const along: number[] = [];
  for (let k = 0; k < 4; k++) {
    const a = top[k], b = top[(k + 1) % 4], c = foot[(k + 1) % 4], d = foot[k];
    for (const [p, s] of [[a, 0], [b, 0], [c, 1], [a, 0], [c, 1], [d, 1]] as [THREE.Vector3, number][]) {
      pos.push(p.x, p.y, p.z);
      along.push(s);
    }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
  mat.uniforms.uGain.value = gain;
  (mat.uniforms.uCol.value as THREE.Color).set(color);
  if (gain <= 0.001) return null;
  const L = from.distanceTo(to);
  // pulse: thin sine travelling from its source (satellite, or ground for the echo)
  const h = Math.min(1, gain * 1.2);
  const p0 = dir > 0 ? from : to;
  const p1 = (dir > 0 ? from.clone().lerp(to, h) : to.clone().lerp(from, h));
  const curve = sinePulse(p0, p1, t, 1, 0.035 * Math.min(1, L / 3), 0.16);
  return (
    <group>
      <mesh geometry={geo} material={mat} renderOrder={5} />
      <mesh renderOrder={6}>
        <tubeGeometry args={[curve, 520, 0.008, 5, false]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={Math.min(1, gain * 1.3)} />
      </mesh>
    </group>
  );
};

// ---------- reticle on the ground ----------
const Bar: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; w: number; color: string; opacity: number }> = ({ a, b, w, color, opacity }) => {
  const len = a.distanceTo(b);
  const ang = Math.atan2(b.z - a.z, b.x - a.x);
  return (
    <mesh position={[(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]} rotation={[-Math.PI / 2, 0, -ang]} renderOrder={7}>
      <planeGeometry args={[len, w]} />
      <meshBasicMaterial color={color} toneMapped={false} depthTest={false} transparent opacity={opacity} />
    </mesh>
  );
};

export const Reticle: React.FC<{ at: THREE.Vector3; size: number; opacity: number; t: number }> = ({ at, size, opacity, t }) => {
  if (opacity <= 0.001) return null;
  const s = size * (1 + Math.sin(t * 3) * 0.03);
  const L = size * 0.36, W = size * 0.05;
  const y = at.y + 0.04;
  const P = (x: number, z: number) => new THREE.Vector3(at.x + x, y, at.z + z);
  const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  return (
    <group>
      {corners.map(([sx, sz], i) => (
        <React.Fragment key={i}>
          <Bar a={P(sx * s, sz * s)} b={P(sx * (s - L), sz * s)} w={W} color={PAL.amber} opacity={opacity} />
          <Bar a={P(sx * s, sz * s)} b={P(sx * s, sz * (s - L))} w={W} color={PAL.amber} opacity={opacity} />
        </React.Fragment>
      ))}
      <mesh position={[at.x, y, at.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}>
        <ringGeometry args={[size * 0.32, size * 0.36, 64]} />
        <meshBasicMaterial color={PAL.amber} toneMapped={false} depthTest={false} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

/** Dashed orbit track (ground-parallel line high above the map). */
export const Track: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; opacity: number }> = ({ a, b, opacity }) => {
  const n = 28;
  if (opacity <= 0.001) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const p0 = a.clone().lerp(b, i / n);
        const p1 = a.clone().lerp(b, (i + 0.55) / n);
        const len = p0.distanceTo(p1);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const dir = p1.clone().sub(p0).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <boxGeometry args={[len, 0.018, 0.018]} />
            <meshBasicMaterial color={PAL.white} transparent opacity={opacity * 0.7} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- satellite (film version): ONE long flat SAR panel + TWO solar wings ----------
const canvasTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
// crinkled gold MLI foil: facets of varying brightness + seams
const foilTex = () =>
  canvasTex(512, 512, (ctx) => {
    ctx.fillStyle = "#b8862e";
    ctx.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 420; k++) {
      const x = hash(k, 1) * 512, y = hash(k, 2) * 512, r = 14 + hash(k, 3) * 40;
      const l = 38 + hash(k, 4) * 34;
      ctx.fillStyle = `hsl(${38 + hash(k, 5) * 10}, ${55 + hash(k, 6) * 25}%, ${l}%)`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        const a = (s / 4) * Math.PI * 2 + hash(k, s + 9) * 1.2;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.55;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(60,40,10,0.6)";
    ctx.lineWidth = 3;
    for (const p of [128, 256, 384]) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p + 10, 512); ctx.stroke();
    }
  });
// solar cells: deep blue cells with silver bus lines and a fine grid
const solarTex = () =>
  canvasTex(1024, 512, (ctx) => {
    ctx.fillStyle = "#c9ced2";
    ctx.fillRect(0, 0, 1024, 512);
    const cols = 24, rows = 12, cw = 1024 / cols, ch = 512 / rows;
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        const g = ctx.createLinearGradient(c * cw, r * ch, (c + 1) * cw, (r + 1) * ch);
        g.addColorStop(0, hash(c, r) > 0.5 ? "#1d3f8f" : "#183680");
        g.addColorStop(1, "#0d2154");
        ctx.fillStyle = g;
        ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
        ctx.fillStyle = "rgba(200,210,225,0.35)";
        ctx.fillRect(c * cw + cw / 2 - 0.5, r * ch + 3, 1, ch - 6);
      }
  });
// SAR antenna face: rows of light tiles with dark gaps and small radiating elements
const sarTex = () =>
  canvasTex(1024, 256, (ctx) => {
    ctx.fillStyle = "#3a4249";
    ctx.fillRect(0, 0, 1024, 256);
    const cols = 20, rows = 4, cw = 1024 / cols, ch = 256 / rows;
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        ctx.fillStyle = hash(c, r) > 0.5 ? "#aab3ba" : "#9ea8b0";
        ctx.fillRect(c * cw + 3, r * ch + 3, cw - 6, ch - 6);
        ctx.fillStyle = "#6f7a83";
        for (let e = 0; e < 4; e++) ctx.fillRect(c * cw + 8 + e * (cw - 16) / 4, r * ch + 10, 4, ch - 20);
      }
  });

let _foil: THREE.Texture | null = null;
let _sol: THREE.Texture | null = null;
let _sar: THREE.Texture | null = null;
let _bus: THREE.BufferGeometry | null = null;
let _sarBox: THREE.BufferGeometry | null = null;

/**
 * Local frame: x = flight direction. The SAR antenna is one long flat tiled panel hanging off the
 * bus side, tilted so its face looks down and sideways (side-looking radar). The two solar wings
 * stick straight out from the opposite side, perpendicular to flight.
 */
export const Satellite: React.FC<{ pos: THREE.Vector3; yaw?: number; scale?: number; opacity?: number; flash?: number }> = ({ pos, yaw = 0, scale = 0.3, opacity = 1, flash = 0 }) => {
  const foil = (_foil ??= foilTex());
  const sol = (_sol ??= solarTex());
  const sar = (_sar ??= sarTex());
  const bus = (_bus ??= new RoundedBoxGeometry(0.9, 0.7, 0.7, 3, 0.06));
  const sarBox = (_sarBox ??= new RoundedBoxGeometry(4.2, 0.07, 0.92, 2, 0.025));
  const tr = opacity < 1;
  const common = { transparent: tr, opacity } as const;
  return (
    <group position={pos} rotation={[0, yaw, 0]} scale={scale}>
      <mesh geometry={bus}>
        <meshStandardMaterial map={foil} metalness={0.75} roughness={0.38} {...common} emissive={PAL.amber} emissiveIntensity={flash * 0.8} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.55]} />
        <meshStandardMaterial color="#d8dde0" metalness={0.3} roughness={0.5} {...common} />
      </mesh>
      {/* star tracker + downlink dish */}
      <mesh position={[0.3, 0.43, -0.18]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#2a2f34" metalness={0.5} roughness={0.4} {...common} />
      </mesh>
      <mesh position={[-0.28, 0.45, 0.15]} rotation={[0.5, 0, 0.3]}>
        <cylinderGeometry args={[0.12, 0.03, 0.05, 24]} />
        <meshStandardMaterial color="#eef1f3" metalness={0.2} roughness={0.35} {...common} />
      </mesh>
      {/* SAR antenna: one long, flat panel on the -z side, face tilted down/out */}
      <mesh position={[0, -0.12, -0.42]}>
        <boxGeometry args={[0.14, 0.14, 0.18]} />
        <meshStandardMaterial color="#9aa4ac" metalness={0.6} roughness={0.4} {...common} />
      </mesh>
      <group position={[0, -0.32, -0.78]} rotation={[-0.4, 0, 0]}>
        <mesh geometry={sarBox}>
          <meshStandardMaterial color="#59636b" metalness={0.55} roughness={0.45} {...common} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, s * 0.037, 0]} rotation={[s * -Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.12, 0.86]} />
            <meshStandardMaterial map={sar} metalness={0.35} roughness={0.5} {...common} emissive={PAL.amber} emissiveIntensity={flash * 0.6} />
          </mesh>
        ))}
      </group>
      {/* two solar wings on the +z side, in line, perpendicular to flight */}
      <mesh position={[0, 0.05, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#cfd5d9" metalness={0.7} roughness={0.3} {...common} />
      </mesh>
      {[0, 1].map((k) => (
        <group key={k} position={[0, 0.05, 1.45 + k * 1.62]}>
          <mesh>
            <boxGeometry args={[1.12, 0.03, 1.58]} />
            <meshStandardMaterial color="#c4cbd0" metalness={0.6} roughness={0.35} {...common} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, s * 0.017, 0]} rotation={[s * -Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[1.54, 1.08]} />
              <meshStandardMaterial map={sol} metalness={0.45} roughness={0.22} emissive="#0a1a40" emissiveIntensity={0.35} {...common} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export { MAP_W, MAP_H, lonToX, latToZ };
