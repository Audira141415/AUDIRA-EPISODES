// EP08 film world (TOONFORGE): the cover's garden set rebuilt as a driven scene.
// Same cel-shading, ink hulls, sky, person, phone and plant as Cover.tsx (left untouched), plus:
// a time-driven camera, leaves that can turn yellow, fade controls for the view frustum,
// detection frame and voice bubble, and a "confused" head tilt for the screen-sharing beat.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { TOON_PALETTE as T } from "../../kits/toonforge/lib/palette.ts";
import { hash } from "../../kits/toonforge/core/noise.ts";

export type V3 = [number, number, number];
export type Cam = { pos: V3; target: V3; fov: number };
export const CYAN = "#3ff0ff";
export const INK = T.inkOutline;

// ---------------------------------------------------------------------------------------------
// Cel shading
const gradientMap = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 165, 165, 165, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();
const toonCache = new Map<string, THREE.MeshToonMaterial>();
const toon = (c: THREE.Color | string) => {
  const col = typeof c === "string" ? new THREE.Color(c) : c;
  const key = col.getHexString();
  let m = toonCache.get(key);
  if (!m) toonCache.set(key, (m = new THREE.MeshToonMaterial({ color: col.clone(), gradientMap })));
  return m;
};
const inkMaterial = (thickness: number) => {
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position) + normalize(normal) * ${thickness.toFixed(4)};`,
    );
  };
  m.customProgramCacheKey = () => `ink${thickness}`;
  return m;
};
const Inked: React.FC<{ thickness?: number; children: React.ReactNode }> = ({ thickness = 0.012, children }) => {
  const ref = useRef<THREE.Group>(null);
  const { advance } = useThree();
  const ink = useMemo(() => inkMaterial(thickness), [thickness]);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.ink && !o.userData.inked && !o.userData.keep) meshes.push(o as THREE.Mesh);
    });
    for (const m of meshes) {
      m.userData.inked = true;
      const src = m.material as THREE.MeshStandardMaterial;
      if (src && (src as { color?: THREE.Color }).color && !(src instanceof THREE.MeshToonMaterial)) m.material = toon(src.color);
      m.geometry.computeBoundingSphere();
      const r = (m.geometry.boundingSphere?.radius ?? 1) * Math.max(m.scale.x, m.scale.y, m.scale.z);
      if (r < 0.025) continue;
      const hull = new THREE.Mesh(m.geometry, ink);
      hull.userData.ink = true;
      m.add(hull);
    }
    if (meshes.length) advance(performance.now());
  });
  return <group ref={ref}>{children}</group>;
};

// ---------------------------------------------------------------------------------------------
// Canvas textures
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};
const stickerTexture = (font: string) =>
  canvasTex(512, 200, (c) => {
    rr(c, 8, 8, 496, 184, 40);
    c.fillStyle = T.sakuraPink;
    c.fill();
    c.lineWidth = 12;
    c.strokeStyle = INK;
    c.stroke();
    c.fillStyle = "#fff";
    c.font = `120px ${font}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 14;
    c.strokeStyle = INK;
    c.strokeText("AUDIRA", 256, 108);
    c.fillText("AUDIRA", 256, 108);
  });
const potLabelTexture = (font: string) =>
  canvasTex(512, 160, (c) => {
    c.fillStyle = "#fff6e6";
    rr(c, 10, 10, 492, 140, 26);
    c.fill();
    c.lineWidth = 10;
    c.strokeStyle = INK;
    c.stroke();
    c.fillStyle = INK;
    c.font = `92px ${font}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("AUDIRA", 256, 86);
  });
const bubbleTexture = () =>
  canvasTex(1024, 640, (c) => {
    c.beginPath();
    const x = 40, y = 40, w = 940, h = 420, r = 190;
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.lineTo(440, y + h);
    c.lineTo(120, 610);
    c.lineTo(270, y + h);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
    c.fillStyle = "#ffffff";
    c.fill();
    c.lineWidth = 22;
    c.strokeStyle = INK;
    c.lineJoin = "round";
    c.stroke();
    c.beginPath();
    c.arc(220, 250, 120, 0, Math.PI * 2);
    c.fillStyle = T.animeSky;
    c.fill();
    c.lineWidth = 14;
    c.stroke();
    c.fillStyle = "#fff";
    rr(c, 186, 160, 68, 120, 34);
    c.fill();
    c.lineWidth = 10;
    c.strokeStyle = INK;
    c.stroke();
    c.beginPath();
    c.arc(220, 240, 64, 0.15 * Math.PI, 0.85 * Math.PI);
    c.lineWidth = 14;
    c.strokeStyle = "#fff";
    c.stroke();
    c.fillStyle = "#fff";
    c.fillRect(213, 300, 14, 36);
    rr(c, 180, 330, 80, 14, 7);
    c.fill();
    for (let i = 0; i < 12; i++) {
      const env = Math.sin((i / 11) * Math.PI);
      const hgt = 40 + env * 190 * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.4)));
      rr(c, 390 + i * 46, 250 - hgt / 2, 28, hgt, 14);
      c.fillStyle = i % 2 ? T.animeSky : "#21c8e6";
      c.fill();
      c.lineWidth = 7;
      c.strokeStyle = INK;
      c.stroke();
    }
  });
const frameTexture = (font: string) =>
  canvasTex(800, 900, (c) => {
    const x0 = 40, y0 = 120, x1 = 760, y1 = 860, L = 130;
    const corner = (pts: [number, number][]) => {
      c.beginPath();
      c.moveTo(...pts[0]);
      pts.slice(1).forEach((p) => c.lineTo(...p));
      c.stroke();
    };
    c.lineCap = "round";
    c.lineJoin = "round";
    for (const [w, col] of [[30, INK], [16, CYAN]] as const) {
      c.lineWidth = w;
      c.strokeStyle = col;
      corner([[x0, y0 + L], [x0, y0], [x0 + L, y0]]);
      corner([[x1 - L, y0], [x1, y0], [x1, y0 + L]]);
      corner([[x0, y1 - L], [x0, y1], [x0 + L, y1]]);
      corner([[x1 - L, y1], [x1, y1], [x1, y1 - L]]);
    }
    rr(c, x0, 6, 520, 96, 20);
    c.fillStyle = INK;
    c.fill();
    c.beginPath();
    c.arc(x0 + 52, 54, 18, 0, Math.PI * 2);
    c.fillStyle = T.crimsonImpact;
    c.fill();
    c.fillStyle = "#fff";
    c.font = `64px ${font}`;
    c.textBaseline = "middle";
    c.fillText("LIVE", x0 + 88, 58);
    c.fillStyle = CYAN;
    c.font = `46px ${font}`;
    c.fillText("VIDEO STREAMING", x0 + 222, 60);
  });

// ---------------------------------------------------------------------------------------------
// Layout (same numbers as the cover)
export const PERSON_POS: V3 = [-0.5, 0, 0];
const PERSON_SCALE = 1.6;
export const PLANT_POS: V3 = [0.95, 0, 1.3];
export const PLANT_TARGET = new THREE.Vector3(PLANT_POS[0], 1.02, PLANT_POS[2]);
export const COVER_CAM: Cam = { pos: [0.42, 1.55, 7.2], target: [0.4, 1.64, 0.4], fov: 38 };
const HEADING = Math.atan2(PLANT_POS[0] - PERSON_POS[0], PLANT_POS[2] - PERSON_POS[2]);

const BASE_POSE: Pose = {
  body: [0, 0, 0],
  lift: LEG_LENGTH,
  spine: [0.02, -0.12, 0],
  head: [0.12, 0.05, -0.05],
  ls: [-1.3, -0.15, 0.12],
  le: -0.45,
  rs: [-0.25, 0, -0.35],
  re: -1.25,
  lh: [-0.12, 0, 0.06],
  lk: 0.08,
  rh: [0.16, 0, -0.06],
  rk: 0.02,
};

const handWorld = (pos: V3, heading: number, scale: number, p: Pose) => {
  const root = new THREE.Object3D();
  root.position.set(...pos);
  root.rotation.set(0, heading, 0);
  root.scale.setScalar(scale);
  const body = new THREE.Object3D();
  body.position.set(0, p.lift, 0);
  body.rotation.set(...p.body);
  const spine = new THREE.Object3D();
  spine.rotation.set(...p.spine);
  const shoulder = new THREE.Object3D();
  shoulder.position.set(0.148, 0.232, 0);
  const upper = new THREE.Object3D();
  upper.rotation.set(...p.ls);
  const elbow = new THREE.Object3D();
  elbow.position.set(0, -(0.12 + 0.084) + 0.042 * 0.9, 0);
  elbow.rotation.set(p.le, 0, 0);
  const hand = new THREE.Object3D();
  hand.position.set(0, -(0.11 + 0.074) + 0.037 * 0.6, 0);
  root.add(body);
  body.add(spine);
  spine.add(shoulder);
  shoulder.add(upper);
  upper.add(elbow);
  elbow.add(hand);
  root.updateMatrixWorld(true);
  return hand.getWorldPosition(new THREE.Vector3());
};
// The arm pose never changes, so hand and lens are constants.
export const HAND = handWorld(PERSON_POS, HEADING, PERSON_SCALE, BASE_POSE);
export const LENS = (() => {
  const o = new THREE.Object3D();
  o.position.copy(HAND);
  o.lookAt(PLANT_TARGET);
  o.updateMatrixWorld(true);
  return new THREE.Vector3(-0.035, 0.07 + 0.11, 0.04).applyMatrix4(o.matrixWorld);
})();

// ---------------------------------------------------------------------------------------------
const Sky: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: new THREE.Color("#1f5fd8") }, mid: { value: new THREE.Color("#4fa3ff") }, low: { value: new THREE.Color("#cdeeff") } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP;
          void main(){ float h = vP.y; vec3 c = mix(low, mid, smoothstep(-0.02, 0.12, h)); c = mix(c, top, smoothstep(0.12, 0.42, h)); gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  return (
    <mesh material={mat} userData={{ keep: true }}>
      <sphereGeometry args={[80, 48, 24]} />
    </mesh>
  );
};

const Cloud: React.FC<{ p: V3; s: number; seed: number }> = ({ p, s, seed }) => {
  const puffs = useMemo(() => {
    const out: { x: number; y: number; z: number; r: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const u = (i / 6) * 2 - 1;
      out.push({ x: u * 1.6 + (hash(seed + i) - 0.5) * 0.4, y: (1 - u * u) * 0.55 + hash(seed * 3 + i) * 0.3, z: (hash(seed * 7 + i) - 0.5) * 0.6, r: 0.55 + (1 - Math.abs(u)) * 0.5 });
    }
    return out;
  }, [seed]);
  return (
    <group position={p} scale={s}>
      {puffs.map((q, i) => (
        <mesh key={i} position={[q.x, q.y, q.z]}>
          <sphereGeometry args={[q.r, 24, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} scale={[2.3, 0.45, 0.8]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#e9f3ff" />
      </mesh>
    </group>
  );
};

const Tree: React.FC<{ p: V3; s: number; c: string }> = ({ p, s, c }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.09, 0.13, 1, 10]} />
      <meshStandardMaterial color="#8a5a3b" />
    </mesh>
    <mesh position={[0, 1.25, 0]} castShadow>
      <sphereGeometry args={[0.6, 24, 16]} />
      <meshStandardMaterial color={c} />
    </mesh>
    <mesh position={[0.32, 1.0, 0.1]}>
      <sphereGeometry args={[0.38, 20, 14]} />
      <meshStandardMaterial color={c} />
    </mesh>
  </group>
);

const GREEN = new THREE.Color("#3fb950");
const YELLOW = new THREE.Color("#f2c230");
const BROWN_TIP = new THREE.Color("#c98b2a");
// leaves that turn yellow in the "daun menguning" beat (index -> how much)
const SICK: Record<number, number> = { 0: 1, 2: 0.85, 3: 0.9, 5: 1, 7: 0.75 };

const Leaf: React.FC<{ dir: number; tilt: number; len: number; size: number; sick: number }> = ({ dir, tilt, len, size, sick }) => {
  const tip: V3 = [Math.sin(dir) * Math.sin(tilt) * len, Math.cos(tilt) * len, Math.cos(dir) * Math.sin(tilt) * len];
  const stem = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(tip[0] * 0.2, tip[1] * 0.75, tip[2] * 0.2), new THREE.Vector3(...tip));
    return new THREE.TubeGeometry(curve, 16, 0.014, 6, false);
  }, [tip[0], tip[1], tip[2]]);
  const mat = useMemo(() => new THREE.MeshToonMaterial({ color: GREEN.clone(), gradientMap }), []);
  const col = GREEN.clone().lerp(YELLOW, Math.min(1, sick * 1.1));
  if (sick > 0.6) col.lerp(BROWN_TIP, (sick - 0.6) * 0.5);
  mat.color.copy(col);
  return (
    <group>
      <mesh geometry={stem}>
        <meshStandardMaterial color="#3f8f3a" />
      </mesh>
      <group position={tip} rotation={[0, dir, 0]}>
        <group rotation={[tilt * 0.9 + 0.35 + sick * 0.25, 0, 0]}>
          <mesh position={[0, 0, size * 0.75]} scale={[size * 0.8, size * 0.07, size]} castShadow material={mat}>
            <sphereGeometry args={[1, 28, 16]} />
          </mesh>
          <mesh position={[0, size * 0.075, size * 0.75]} rotation={[Math.PI / 2, 0, 0]} userData={{ keep: true }}>
            <cylinderGeometry args={[0.008, 0.008, size * 1.7, 5]} />
            <meshBasicMaterial color={sick > 0.3 ? "#a8861c" : "#2b7a35"} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const LEAVES = [
  { dir: 0.3, tilt: 0.6, len: 0.4, size: 0.15 },
  { dir: 1.5, tilt: 0.8, len: 0.34, size: 0.14 },
  { dir: -1.2, tilt: 0.75, len: 0.36, size: 0.15 },
  { dir: 2.7, tilt: 0.55, len: 0.46, size: 0.16 },
  { dir: -0.5, tilt: 0.3, len: 0.56, size: 0.16 },
  { dir: 0.9, tilt: 0.32, len: 0.62, size: 0.15 },
  { dir: -2.3, tilt: 0.5, len: 0.5, size: 0.15 },
  { dir: 2.0, tilt: 0.25, len: 0.7, size: 0.14 },
  { dir: -1.7, tilt: 0.2, len: 0.66, size: 0.14 },
];

const Plant: React.FC<{ label: THREE.Texture; yellow: number }> = ({ label, yellow }) => {
  const potGeo = useMemo(() => {
    const pts = [[0, 0], [0.19, 0], [0.205, 0.02], [0.25, 0.3], [0.285, 0.31], [0.29, 0.37], [0.27, 0.38], [0, 0.38]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <group position={PLANT_POS} rotation={[0, -0.3, 0]}>
      <mesh position={[0, 0.43, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.72, 0.06, 0.72]} radius={0.025} />
        <meshStandardMaterial color="#d08a4e" />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * 0.28, 0.2, sz * 0.28]} castShadow>
          <RoundedBoxGeo args={[0.06, 0.4, 0.06]} radius={0.015} />
          <meshStandardMaterial color="#a8653a" />
        </mesh>
      ))}
      <group position={[0, 0.46, 0]}>
        <mesh geometry={potGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#e2774a" />
        </mesh>
        <mesh position={[0, 0.355, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.27, 32]} />
          <meshStandardMaterial color="#5b3a26" />
        </mesh>
        <mesh position={[0.07, 0.17, 0.235]} rotation={[0, 0.55, 0]} userData={{ keep: true }}>
          <planeGeometry args={[0.28, 0.0875]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </mesh>
        <group position={[0, 0.34, 0]}>
          {LEAVES.map((l, i) => (
            <Leaf key={i} {...l} sick={(SICK[i] ?? 0) * yellow} />
          ))}
        </group>
      </group>
    </group>
  );
};

const Phone: React.FC<{ sticker: THREE.Texture; glow: number }> = ({ sticker, glow }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(PLANT_TARGET);
  });
  const W = 0.16, H = 0.32, D = 0.028;
  return (
    <group position={HAND} ref={ref}>
      <group position={[0, 0.07, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[W, H, D]} radius={0.022} />
          <meshStandardMaterial color="#2a2d44" />
        </mesh>
        <mesh position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]} userData={{ keep: true }}>
          <planeGeometry args={[W * 0.86, H * 0.9]} />
          <meshBasicMaterial color={new THREE.Color("#8ff5ff").lerp(new THREE.Color("#ffffff"), glow)} toneMapped={false} />
        </mesh>
        <mesh position={[-0.035, 0.1, D / 2 + 0.008]} castShadow>
          <RoundedBoxGeo args={[0.065, 0.075, 0.016]} radius={0.012} />
          <meshStandardMaterial color="#14152a" />
        </mesh>
        <mesh position={[-0.035, 0.11, D / 2 + 0.018]} rotation={[Math.PI / 2, 0, 0]} userData={{ keep: true }}>
          <cylinderGeometry args={[0.022, 0.022, 0.006, 24]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0.012, -0.07, D / 2 + 0.002]} rotation={[0, 0, 0.12]} userData={{ keep: true }}>
          <planeGeometry args={[0.135, 0.053]} />
          <meshBasicMaterial map={sticker} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

const Frustum: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; f: number; o: number }> = ({ from, to, f, o }) => {
  const dir = to.clone().sub(from);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  const mid = from.clone().addScaledVector(dir, len / 2);
  const pulse = 0.85 + 0.15 * Math.sin(f / 10);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.ConeGeometry(0.5, len, 4, 1, true)), [len]);
  if (o <= 0.001) return null;
  return (
    <group position={mid} quaternion={q}>
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh renderOrder={2}>
          <coneGeometry args={[0.5, len, 4, 1, true]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.2 * pulse * o} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh renderOrder={2} scale={[0.55, 1, 0.55]}>
          <coneGeometry args={[0.5, len, 4, 1, true]} />
          <meshBasicMaterial color="#bffcff" transparent opacity={0.16 * pulse * o} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <lineSegments geometry={edges} renderOrder={3}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.9 * o} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
};

const Billboard: React.FC<{ p: V3; w: number; h: number; map: THREE.Texture; rot?: number; o: number; s?: number; cam: V3 }> = ({ p, w, h, map, rot = 0, o, s = 1, cam }) => {
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(new THREE.Vector3(...cam));
    ref.current?.rotateZ(rot);
  });
  return (
    <mesh ref={ref} position={p} renderOrder={5} visible={o > 0.001} scale={s}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} transparent opacity={o} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.near = 0.03;
    c.updateProjectionMatrix();
    c.lookAt(...cam.target);
    c.updateMatrixWorld();
  });
  return null;
};

export type WorldProps = {
  f: number; // 60-fps frame count (animation clock)
  font: string;
  cam: Cam;
  frustum: number;
  frame: number;
  frameScale: number;
  bubble: number;
  bubbleScale: number;
  yellow: number;
  confused: number;
  talk: number; // 0..1 head bob while speaking
  phoneGlow: number;
};

export const World: React.FC<WorldProps> = ({ f, font, cam, frustum, frame, frameScale, bubble, bubbleScale, yellow, confused, talk, phoneGlow }) => {
  const tex = useMemo(() => ({ sticker: stickerTexture(font), label: potLabelTexture(font), bubble: bubbleTexture(), frame: frameTexture(font) }), [font]);
  const t = f / 60;
  const bob = Math.sin(t * 11) * 0.05 * talk;
  const pose: Pose = {
    ...BASE_POSE,
    head: [0.12 + bob - confused * 0.1, 0.05 + confused * 0.25, -0.05 + confused * 0.32],
    rs: [-0.25 - confused * 1.9, 0, -0.35 - confused * 0.25],
    re: -1.25 - confused * 0.9,
  };
  return (
    <>
      <CameraRig cam={cam} />
      <ambientLight color="#9cc6ff" intensity={1.1} />
      <directionalLight
        position={[5, 9, 7]}
        intensity={2.6}
        color="#fff6e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-6, 3, -8]} intensity={1.2} color={T.sakuraPink} />
      <Sky />
      <Inked thickness={0.06}>
        <Cloud p={[-9 + t * 0.04, 3.2, -30]} s={1.5} seed={3} />
        <Cloud p={[9.5 - t * 0.03, 2.6, -32]} s={1.7} seed={11} />
        <Cloud p={[4 + t * 0.02, 11, -40]} s={1.6} seed={21} />
        <Cloud p={[-5, 15, -34]} s={1.4} seed={31} />
      </Inked>
      <Inked thickness={0.02}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[40, 64]} />
          <meshStandardMaterial color="#7fd25b" />
        </mesh>
        <mesh position={[-9, -5.2, -22]} scale={[14, 7, 8]} receiveShadow>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#5fbf4a" />
        </mesh>
        <mesh position={[10, -6.2, -26]} scale={[16, 8, 9]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#4eae45" />
        </mesh>
        <Tree p={[-3.2, 0, -6]} s={1.6} c="#3ea84a" />
        <Tree p={[3.6, 0, -8]} s={1.9} c="#36994a" />
        <Tree p={[-1.6, 0, -11]} s={1.4} c="#45b24f" />
        <Tree p={[4.4, 0, 3.5]} s={1.5} c="#3ea84a" />
        <Tree p={[-4.2, 0, 2.6]} s={1.7} c="#36994a" />
        <mesh position={[0.1, 0.005, 0.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.9, 48]} />
          <meshStandardMaterial color="#f1e3c6" />
        </mesh>
      </Inked>
      <Inked thickness={0.008}>
        <ToyPerson
          f={f}
          seed={5}
          poseOverride={pose}
          position={PERSON_POS}
          heading={HEADING}
          scale={PERSON_SCALE}
          look={{ skin: "#f1c7a6", hair: "#1d2340", top: "#ff9f1c", bottom: "#2b3a67", outfit: "casual", hairStyle: 0, build: 1, height: 1 }}
        />
      </Inked>
      <Inked thickness={0.01}>
        <Phone sticker={tex.sticker} glow={phoneGlow} />
      </Inked>
      <Inked thickness={0.012}>
        <Plant label={tex.label} yellow={yellow} />
      </Inked>
      <Frustum from={LENS} to={PLANT_TARGET.clone().add(new THREE.Vector3(0, 0.02, 0))} f={f} o={frustum} />
      <Billboard p={[PLANT_TARGET.x + 0.02, PLANT_TARGET.y + 0.02, PLANT_TARGET.z + 0.35]} w={1.05} h={1.18} map={tex.frame} o={frame} s={frameScale} cam={cam.pos} />
      <Billboard p={[0.38, 2.0 + Math.sin(t * 2) * 0.01, 0.75]} w={0.8} h={0.5} map={tex.bubble} rot={-0.04} o={bubble} s={bubbleScale} cam={cam.pos} />
    </>
  );
};
