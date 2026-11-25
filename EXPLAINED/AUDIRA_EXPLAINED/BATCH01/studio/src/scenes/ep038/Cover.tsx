// EP038 cover (SATELLITEBRIEFING): a radar satellite in orbit sweeps its swath over an oblique
// relief map of Teluk Jakarta; the north-coast districts carry interferogram fringes and sit in an
// exaggerated bowl; an amber reticle marks the zone. No subsidence numbers anywhere.
// Deterministic: all motion from useCurrentFrame(); the map texture is built once from fixed data.

import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { loadFont as loadTitle } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import {
  LAT0, LAT1, LON0, LON1, MAP_H, MAP_W, coastLat, hash, landAt, latToZ, lonToX, sinkAt, sinkRaw, vnoise,
} from "./map";

export const { fontFamily: TITLE } = loadTitle("normal", { weights: ["600", "800"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const PAL = {
  void: "#070B0E",
  grey: "#4A5358",
  ocean: "#102A45",
  white: "#F2F5F6",
  amber: "#FFBE55",
  blue: "#2E70CE",
};

// ---------- camera ----------
const CAM_POS = new THREE.Vector3(0.35, 7.6, 4.6);
const CAM_TGT = new THREE.Vector3(0.1, 0, -0.15);
const FOV = 44;

const Rig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(CAM_POS);
    c.fov = FOV;
    c.near = 0.1;
    c.far = 80;
    c.lookAt(CAM_TGT);
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

/** Project a world point to pixel coordinates for the HTML overlay. */
const makeProjector = (w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 80);
  cam.position.copy(CAM_POS);
  cam.lookAt(CAM_TGT);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return (p: THREE.Vector3) => {
    const v = p.clone().project(cam);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };
};

// ---------- terrain ----------
const SEG = 360;
const BOWL_DEPTH = 0.32;

export const fringeRGB = (phase: number): [number, number, number] => {
  // cyclic interferogram palette (hue wheel)
  const c = new THREE.Color().setHSL(((phase % 1) + 1) % 1, 0.95, 0.5);
  return [c.r, c.g, c.b];
};

export const heightAt = (lon: number, lat: number) => {
  const main = Math.min(1, Math.max(0, 0.5 + (coastLat(lon) - lat) / 0.004)); // mainland only
  const south = Math.max(0, (-6.1 - lat) / 0.28); // gentle rise inland
  const n = vnoise(lon * 220, lat * 220) * 0.025;
  const landH = (0.1 + south * 0.16 + n - sinkAt(lon, lat) * BOWL_DEPTH) * main + 0.012 * (1 - main);
  const seaDepth = Math.min(1, Math.max(0, (coastLat(lon) - lat) * -14));
  const seaH = -0.035 - seaDepth * 0.05;
  return seaH + (landH - seaH) * main;
};

export const buildTexture = (fringe = true) => {
  const N = 2048;
  const cv = document.createElement("canvas");
  cv.width = N;
  cv.height = N;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  const ocean = new THREE.Color(PAL.ocean);
  const grey = new THREE.Color(PAL.grey);
  for (let j = 0; j < N; j++) {
    const lat = LAT0 + ((j + 0.5) / N) * (LAT1 - LAT0);
    for (let i = 0; i < N; i++) {
      const lon = LON0 + ((i + 0.5) / N) * (LON1 - LON0);
      const land = landAt(lon, lat, 0.0006);
      // sea: deeper offshore, faint swell texture
      const off = Math.min(1, Math.max(0, (coastLat(lon) - lat) * -9));
      const sw = vnoise(lon * 900, lat * 300) * 0.06;
      let r = ocean.r * (1.15 - off * 0.45 + sw);
      let g = ocean.g * (1.15 - off * 0.45 + sw);
      let b = ocean.b * (1.2 - off * 0.4 + sw);
      // coastal shallows glow
      const shallow = Math.max(0, 1 - Math.abs(coastLat(lon) - lat) / 0.006) * (1 - land);
      r += shallow * 0.05; g += shallow * 0.12; b += shallow * 0.16;
      if (land > 0) {
        // desaturated analyst land with block/street texture
        const n1 = vnoise(lon * 600, lat * 600);
        const n2 = vnoise(lon * 2400, lat * 2400);
        const gx = Math.abs(((lon * 520) % 1) - 0.5) < 0.06;
        const gy = Math.abs(((lat * 520) % 1) - 0.5) < 0.06;
        const street = (gx || gy) && n1 > 0.3 ? 0.1 : 0;
        const k = 0.78 + n1 * 0.25 + n2 * 0.12 + street;
        let lr = grey.r * k, lg = grey.g * k, lb = grey.b * k;
        // interferogram fringes over subsiding ground
        const s = sinkAt(lon, lat);
        const a = Math.min(1, Math.max(0, (s - 0.07) / 0.14)) * 0.9 * (coastLat(lon) - lat > 0.0008 ? 1 : 0);
        if (fringe && a > 0) {
          const [fr, fg, fb] = fringeRGB(sinkRaw(lon, lat) * 5.2 + 0.62);
          lr = lr * (1 - a) + fr * a;
          lg = lg * (1 - a) + fg * a;
          lb = lb * (1 - a) + fb * a;
        }
        r = r * (1 - land) + lr * land;
        g = g * (1 - land) + lg * land;
        b = b * (1 - land) + lb * land;
      }
      const o = (j * N + i) * 4;
      // colours above are linear (THREE.Color); the canvas is sRGB
      img.data[o] = Math.min(255, Math.pow(Math.max(0, r), 1 / 2.2) * 255);
      img.data[o + 1] = Math.min(255, Math.pow(Math.max(0, g), 1 / 2.2) * 255);
      img.data[o + 2] = Math.min(255, Math.pow(Math.max(0, b), 1 / 2.2) * 255);
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // coastline (sea wall) in white
  ctx.strokeStyle = "rgba(242,245,246,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 400; i++) {
    const lon = LON0 + (i / 400) * (LON1 - LON0);
    const x = ((lon - LON0) / (LON1 - LON0)) * N;
    const y = ((coastLat(lon) - LAT0) / (LAT1 - LAT0)) * N;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // georeferenced graticule in claim blue
  ctx.strokeStyle = "rgba(46,112,206,0.55)";
  ctx.lineWidth = 2;
  for (let k = 1; k < 8; k++) {
    const p = (k / 8) * N;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, N); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(N, p); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const terrainGeometry = () => {
  const g = new THREE.PlaneGeometry(MAP_W, MAP_H, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const lon = LON0 + (x / MAP_W + 0.5) * (LON1 - LON0);
    const lat = LAT0 + (z / MAP_H + 0.5) * (LAT1 - LAT0);
    pos.setY(i, heightAt(lon, lat));
  }
  g.computeVertexNormals();
  return g;
};

const Terrain: React.FC = () => {
  const geo = useMemo(terrainGeometry, []);
  const tex = useMemo(buildTexture, []);
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial map={tex} roughness={0.82} metalness={0.05} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.12} />
    </mesh>
  );
};

// city blocks on land, tinted by the fringe where the ground sinks
export const cityMesh = (tint = true) => {
  {
    const pts: { x: number; z: number; y: number; h: number; w: number; c: THREE.Color }[] = [];
    const grey = new THREE.Color("#8a949a");
    for (let a = 0; a < 120; a++) {
      for (let b = 0; b < 90; b++) {
        const lon = 106.66 + a * 0.0029 + (hash(a, b) - 0.5) * 0.0012;
        const lat = -6.1 - b * 0.0026 + (hash(b, a) - 0.5) * 0.001;
        if (landAt(lon, lat, 0.0005) < 1 || coastLat(lon) - lat < 0.006) continue;
        const dens = vnoise(lon * 90, lat * 90);
        if (hash(a * 3.1, b * 7.7) > 0.1 + dens * 0.25) continue;
        const s = sinkAt(lon, lat);
        const tall = hash(a * 1.7, b * 2.3);
        const h = 0.02 + tall * tall * tall * 0.09 * (0.5 + dens);
        const c = grey.clone();
        if (tint && s > 0.12) {
          const [r, g, bb] = fringeRGB(sinkRaw(lon, lat) * 5.2 + 0.62);
          c.lerp(new THREE.Color(r, g, bb), 0.55);
        }
        pts.push({ x: lonToX(lon), z: latToZ(lat), y: heightAt(lon, lat), h, w: 0.022 + hash(a, b * 5) * 0.02, c });
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.1 });
    const m = new THREE.InstancedMesh(geo, mat, pts.length);
    const M = new THREE.Matrix4();
    pts.forEach((p, i) => {
      M.makeScale(p.w, p.h, p.w * (0.8 + hash(i, 3) * 0.6));
      M.setPosition(p.x, p.y - 0.01, p.z);
      m.setMatrixAt(i, M);
      m.setColorAt(i, p.c);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
};

const City: React.FC = () => {
  const mesh = useMemo(() => cityMesh(true), []);
  return <primitive object={mesh} />;
};

const SeaFar: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, -MAP_H / 2 - 19.9]}>
    <planeGeometry args={[80, 40]} />
    <meshStandardMaterial color="#0b1e33" roughness={0.6} />
  </mesh>
);

// ---------- satellite ----------
export const panelTexture = (kind: "sar" | "solar") => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = kind === "sar" ? "#1a2129" : "#0f2350";
  ctx.fillRect(0, 0, 512, 128);
  const cols = kind === "sar" ? 14 : 24;
  const rows = kind === "sar" ? 4 : 6;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = (c / cols) * 512, y = (r / rows) * 128;
      ctx.fillStyle = kind === "sar" ? (hash(c, r) > 0.5 ? "#2b3540" : "#252e38") : hash(c, r) > 0.5 ? "#1b3f86" : "#173675";
      ctx.fillRect(x + 2, y + 2, 512 / cols - 4, 128 / rows - 4);
      if (kind === "sar") {
        ctx.fillStyle = "#9aa6b0";
        ctx.fillRect(x + 512 / cols / 2 - 1, y + 4, 2, 128 / rows - 8);
      }
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// place the satellite on the view ray through a chosen screen point, at a fixed distance
const SAT_POS = (() => {
  const c = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80);
  c.position.copy(CAM_POS);
  c.lookAt(CAM_TGT);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const p = new THREE.Vector3(0.36, 0.5, 0.5).unproject(c);
  const dir = p.sub(CAM_POS).normalize();
  return CAM_POS.clone().add(dir.multiplyScalar(6.4));
})();

const Satellite: React.FC<{ t: number }> = ({ t }) => {
  const sar = useMemo(() => panelTexture("sar"), []);
  const solar = useMemo(() => panelTexture("solar"), []);
  const foil = { color: "#c99a3c", metalness: 0.85, roughness: 0.32 } as const;
  return (
    <group position={SAT_POS} rotation={[0.55, -0.5 + t * 0.01, 0.3]} scale={0.3}>
      {/* bus */}
      <mesh>
        <boxGeometry args={[0.62, 0.55, 0.7]} />
        <meshStandardMaterial {...foil} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.58]} />
        <meshStandardMaterial color="#d8dde0" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* dish antenna (downlink) */}
      <mesh position={[0.2, 0.42, 0.18]} rotation={[0.4, 0, -0.3]}>
        <cylinderGeometry args={[0.13, 0.04, 0.06, 24]} />
        <meshStandardMaterial color="#e6e9eb" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* SAR panel antenna under the bus, long along flight direction */}
      <mesh position={[0, -0.36, 0]}>
        <boxGeometry args={[3.4, 0.05, 0.5]} />
        <meshStandardMaterial color="#9aa4ac" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.36, 0.46]} />
        <meshStandardMaterial map={sar} metalness={0.5} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* solar wings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0.05, s * 0.62]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
            <meshStandardMaterial color="#cfd5d9" metalness={0.7} roughness={0.3} />
          </mesh>
          <group position={[0, 0.05, s * 1.75]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[1.8, 0.03, 0.78]} />
              <meshStandardMaterial color="#c4cbd0" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.76, 0.74]} />
              <meshStandardMaterial map={solar} metalness={0.4} roughness={0.25} emissive="#0a1a40" emissiveIntensity={0.4} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

// ---------- radar beam ----------
const MAIN = { lon: 106.8, lat: -6.118 };

const Beam: React.FC<{ t: number }> = ({ t }) => {
  const { geo, mat } = useMemo(() => {
    const apex = SAT_POS.clone().add(new THREE.Vector3(0, -0.28, 0));
    const cx = lonToX(MAIN.lon) + 0.15, cz = latToZ(MAIN.lat) + 0.05;
    const hw = 1.25, hd = 0.75;
    const foot = [
      new THREE.Vector3(cx - hw, 0.02, cz - hd),
      new THREE.Vector3(cx + hw, 0.02, cz - hd),
      new THREE.Vector3(cx + hw, 0.02, cz + hd),
      new THREE.Vector3(cx - hw, 0.02, cz + hd),
    ];
    const top = [
      apex.clone().add(new THREE.Vector3(-0.6, 0, -0.08)),
      apex.clone().add(new THREE.Vector3(0.6, 0, -0.08)),
      apex.clone().add(new THREE.Vector3(0.6, 0, 0.08)),
      apex.clone().add(new THREE.Vector3(-0.6, 0, 0.08)),
    ];
    const posArr: number[] = [];
    const along: number[] = [];
    for (let k = 0; k < 4; k++) {
      const a = top[k], b = top[(k + 1) % 4], c = foot[(k + 1) % 4], d = foot[k];
      for (const [p, s] of [[a, 0], [b, 0], [c, 1], [a, 0], [c, 1], [d, 1]] as [THREE.Vector3, number][]) {
        posArr.push(p.x, p.y, p.z);
        along.push(s);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
    g.setAttribute("along", new THREE.Float32BufferAttribute(along, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uT: { value: 0 }, uCol: { value: new THREE.Color(PAL.amber) } },
      vertexShader: `attribute float along; varying float vA; void main(){ vA = along; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uT; uniform vec3 uCol; varying float vA;
        void main(){
          float waves = smoothstep(0.75, 1.0, sin((vA*10.0 - uT*4.0)*6.2831)*0.5+0.5);
          float a = 0.07 + 0.16*waves;
          a *= smoothstep(0.0, 0.08, vA) * (0.55 + 0.45*vA);
          gl_FragColor = vec4(uCol * a, 1.0);
        }`,
    });
    return { geo: g, mat: m };
  }, []);
  mat.uniforms.uT.value = t;
  return <mesh geometry={geo} material={mat} renderOrder={5} />;
};

// flat strip on the terrain between two map points
export const Strip: React.FC<{ a: [number, number]; b: [number, number]; w: number; color: string; lift?: number }> = ({ a, b, w, color, lift = 0.03 }) => {
  const [ax, az] = a, [bx, bz] = b;
  const len = Math.hypot(bx - ax, bz - az);
  const ang = Math.atan2(bz - az, bx - ax);
  const y = Math.max(0.02, heightAt(LON0 + (((ax + bx) / 2) / MAP_W + 0.5) * (LON1 - LON0), LAT0 + (((az + bz) / 2) / MAP_H + 0.5) * (LAT1 - LAT0))) + lift;
  return (
    <mesh position={[(ax + bx) / 2, y, (az + bz) / 2]} rotation={[-Math.PI / 2, 0, -ang]} renderOrder={6}>
      <planeGeometry args={[len, w]} />
      <meshBasicMaterial color={color} toneMapped={false} depthTest={false} transparent />
    </mesh>
  );
};

const Reticle: React.FC<{ t: number }> = ({ t }) => {
  const cx = lonToX(MAIN.lon), cz = latToZ(MAIN.lat);
  const s = 0.5 * (1 + Math.sin(t * 3) * 0.03);
  const gy = heightAt(MAIN.lon, MAIN.lat) + 0.06;
  const L = 0.22, W = 0.028;
  const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const ring = useMemo(() => new THREE.RingGeometry(0.2, 0.225, 64), []);
  return (
    <group>
      {corners.map(([sx, sz], i) => (
        <React.Fragment key={i}>
          <Strip a={[cx + sx * s, cz + sz * s]} b={[cx + sx * (s - L), cz + sz * s]} w={W} color={PAL.amber} lift={0.05} />
          <Strip a={[cx + sx * s, cz + sz * s]} b={[cx + sx * s, cz + sz * (s - L)]} w={W} color={PAL.amber} lift={0.05} />
        </React.Fragment>
      ))}
      <mesh geometry={ring} position={[cx, gy, cz]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}>
        <meshBasicMaterial color={PAL.amber} toneMapped={false} depthTest={false} transparent />
      </mesh>
      <Strip a={[cx - 0.34, cz]} b={[cx - 0.08, cz]} w={0.016} color={PAL.amber} lift={0.05} />
      <Strip a={[cx + 0.08, cz]} b={[cx + 0.34, cz]} w={0.016} color={PAL.amber} lift={0.05} />
      <Strip a={[cx, cz - 0.34]} b={[cx, cz - 0.08]} w={0.016} color={PAL.amber} lift={0.05} />
      <Strip a={[cx, cz + 0.08]} b={[cx, cz + 0.34]} w={0.016} color={PAL.amber} lift={0.05} />
    </group>
  );
};

// ---------- 2D layers ----------
export const Stars: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const stars = useMemo(
    () => Array.from({ length: 140 }, (_, i) => ({ x: hash(i, 1) * w, y: hash(i, 2) * h * 0.42, r: 0.6 + hash(i, 3) * 1.6, o: 0.25 + hash(i, 4) * 0.6 })),
    [w, h],
  );
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dfe8f0" opacity={s.o} />
      ))}
    </svg>
  );
};

export const mono = (size: number, color = PAL.white, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  color,
  letterSpacing: size * 0.12,
  fontWeight: 600,
  textTransform: "uppercase",
  ...extra,
});

const Callout: React.FC<{ x: number; y: number; dx: number; dy: number; label: string; sub?: string; color?: string }> = ({ x, y, dx, dy, label, sub, color = PAL.amber }) => (
  <>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <polyline points={`${x},${y} ${x + dx * 0.6},${y + dy} ${x + dx},${y + dy}`} fill="none" stroke={color} strokeWidth={3} />
      <circle cx={x} cy={y} r={7} fill={color} />
    </svg>
    <div
      style={{
        position: "absolute",
        left: dx > 0 ? x + dx + 14 : undefined,
        right: dx < 0 ? 1080 - (x + dx) + 14 : undefined,
        top: y + dy - 24,
        textAlign: dx > 0 ? "left" : "right",
      }}
    >
      <div style={mono(26, color, { background: "rgba(7,11,14,0.82)", padding: "6px 12px", border: `2px solid ${color}` })}>{label}</div>
      {sub ? <div style={mono(19, PAL.white, { marginTop: 8, display: "inline-block", padding: "3px 8px", background: "rgba(7,11,14,0.72)" })}>{sub}</div> : null}
    </div>
  </>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const project = useMemo(() => makeProjector(width, height), [width, height]);

  const pMain = project(new THREE.Vector3(lonToX(MAIN.lon), heightAt(MAIN.lon, MAIN.lat) + 0.06, latToZ(MAIN.lat)));
  const pSat = project(SAT_POS);
  const pBay = project(new THREE.Vector3(lonToX(106.7), 0, latToZ(-5.985)));
  const pHorizon = project(new THREE.Vector3(0, 0, -40)).y;

  return (
    <AbsoluteFill style={{ background: PAL.void }}>
      {/* background: space, stars, atmosphere limb */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #05080b 0%, #081321 ${(pHorizon / height) * 100 - 6}%, #173a5c ${(pHorizon / height) * 100}%, ${PAL.void} 100%)` }} />
      <Stars w={width} h={height} />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true }} shadows>
        <Rig />
        <fog attach="fog" args={["#0a1828", 7, 22]} />
        <ambientLight intensity={0.45} color="#c9d6e6" />
        <hemisphereLight args={["#9cc4ff", "#1a1208", 0.45]} />
        <directionalLight position={[-5, 7, 3]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0006} shadow-normalBias={0.03} />
        <directionalLight position={[4, 3, -6]} intensity={0.6} color="#7fb2ff" />
        <SeaFar />
        <Terrain />
        <City />
        <Beam t={t} />
        <Reticle t={t} />
        <Satellite t={t} />
      </ThreeCanvas>

      {/* foreground HUD: vignette + scanlines */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(4,7,10,0.75) 100%)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(7,11,14,0) 62%, rgba(7,11,14,0.92) 74%, ${PAL.void} 100%)` }} />

      <Callout x={pSat.x - 40} y={pSat.y + 70} dx={-120} dy={90} label="Satelit radar (SAR)" sub="Sentinel-1 // C-band" color={PAL.white} />
      <Callout x={pMain.x} y={pMain.y} dx={-170} dy={-150} label="Zona turun" sub="Jakarta Utara" />
      <div style={{ position: "absolute", left: pBay.x - 120, top: pBay.y - 20, ...mono(24, "#9fc3ea", { opacity: 0.85 }) }}>Teluk Jakarta</div>

      {/* top strip */}
      <div style={{ position: "absolute", top: 180, left: 64, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <div style={mono(22, PAL.amber)}>● InSAR // Lintasan menurun</div>
        <div style={mono(20, PAL.white, { border: `2px solid ${PAL.amber}`, padding: "6px 12px", background: "rgba(7,11,14,0.7)" })}>06°07'S 106°49'E</div>
      </div>

      {/* legend */}
      <div style={{ position: "absolute", left: 64, top: 290, width: 400 }}>
        <div style={{ height: 14, background: "linear-gradient(90deg, hsl(223,85%,55%), hsl(0,85%,55%), hsl(60,85%,55%), hsl(120,85%,55%), hsl(180,85%,55%), hsl(223,85%,55%))" }} />
        <div style={mono(16, PAL.white, { marginTop: 8, opacity: 0.85, letterSpacing: 1.5 })}>1 putaran warna = tanah bergeser</div>
      </div>

      {/* title */}
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 390 }}>
        <div style={mono(28, PAL.amber, { marginBottom: 14, letterSpacing: 7 })}>AUDIRA EXPLAINED</div>
        <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 150, lineHeight: 0.9, color: PAL.white, textTransform: "uppercase", letterSpacing: 1 }}>
          Jakarta Turun
          <br />
          <span style={{ color: PAL.amber }}>Pelan-pelan?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
