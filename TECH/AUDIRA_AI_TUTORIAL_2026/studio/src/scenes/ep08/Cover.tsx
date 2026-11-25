// EP08 cover — "AI BISA LIHAT KAMERAMU" in TOONFORGE: a cel-shaded anime scene under a bright sky.
// A ToyPerson holds a phone toward a potted plant; a cyan view frustum leaves the phone camera and
// lands on the plant inside a detection frame, while a comic voice bubble (mic + waveform) answers
// from the phone. Manga concentration lines frame the action. No product logos, no real faces.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson, LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { TOON_PALETTE as T } from "../../kits/toonforge/lib/palette.ts";
import { hash } from "../../kits/toonforge/core/noise.ts";

const bangers = loadBangers("normal", { weights: ["400"], subsets: ["latin"] });
const dela = loadDela("normal", { weights: ["400"], subsets: ["latin"] });

type V3 = [number, number, number];
const CYAN = "#3ff0ff";
const INK = T.inkOutline;

// ---------------------------------------------------------------------------------------------
// Cel shading: 3-band gradient map shared by every toon material.
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

/** Inverted-hull ink: BackSide black shell pushed out along normals by `thickness` (object units). */
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

/**
 * Converts every mesh below it to cel-shaded toon material (keeping its colour) and adds an
 * ink hull. Meshes with userData.keep stay as they are; tiny features skip the hull.
 */
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
// Canvas textures (drawn after fonts load).
const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
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

/** Comic speech bubble with a mic and an answering waveform; tail points down-right. */
const bubbleTexture = () =>
  canvasTex(1024, 640, (c) => {
    const draw = () => {
      c.beginPath();
      const x = 40, y = 40, w = 940, h = 420, r = 190;
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      // tail
      c.lineTo(440, y + h);
      c.lineTo(120, 610);
      c.lineTo(270, y + h);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };
    draw();
    c.fillStyle = "#ffffff";
    c.fill();
    c.lineWidth = 22;
    c.strokeStyle = INK;
    c.lineJoin = "round";
    c.stroke();
    // mic badge
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
    // waveform bars
    const bars = 12;
    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / (bars - 1)) * Math.PI);
      const hgt = 40 + env * 190 * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.4)));
      const bx = 390 + i * 46;
      rr(c, bx, 250 - hgt / 2, 28, hgt, 14);
      c.fillStyle = i % 2 ? T.animeSky : "#21c8e6";
      c.fill();
      c.lineWidth = 7;
      c.strokeStyle = INK;
      c.stroke();
    }
  });

/** Detection frame: four cyan corner brackets and a LIVE chip on top. */
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
    // chip
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
// Forward kinematics for ToyPerson's left hand (mirrors Person.tsx skeleton).
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

// ---------------------------------------------------------------------------------------------
const PERSON_POS: V3 = [-0.5, 0, 0];
const PERSON_SCALE = 1.6;
const PLANT_POS: V3 = [0.95, 0, 1.3];
const PLANT_TARGET = new THREE.Vector3(PLANT_POS[0], 1.02, PLANT_POS[2]);
const CAM_POS: V3 = [0.42, 1.55, 7.2];
const CAM_TARGET: V3 = [0.4, 1.64, 0.4];

const Sky: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color("#1f5fd8") },
          mid: { value: new THREE.Color("#4fa3ff") },
          low: { value: new THREE.Color("#cdeeff") },
        },
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

const Leaf: React.FC<{ base: V3; dir: number; tilt: number; len: number; size: number }> = ({ base, dir, tilt, len, size }) => {
  // stem curving outwards, leaf blade (flattened ellipsoid) at its tip
  const tip: V3 = [Math.sin(dir) * Math.sin(tilt) * len, Math.cos(tilt) * len, Math.cos(dir) * Math.sin(tilt) * len];
  const stem = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(tip[0] * 0.2, tip[1] * 0.75, tip[2] * 0.2),
      new THREE.Vector3(...tip),
    );
    return new THREE.TubeGeometry(curve, 16, 0.014, 6, false);
  }, [tip[0], tip[1], tip[2]]);
  return (
    <group position={base}>
      <mesh geometry={stem}>
        <meshStandardMaterial color="#3f8f3a" />
      </mesh>
      <group position={tip} rotation={[0, dir, 0]}>
        <group rotation={[tilt * 0.9 + 0.35, 0, 0]}>
          <mesh position={[0, 0, size * 0.75]} scale={[size * 0.8, size * 0.07, size]} castShadow>
            <sphereGeometry args={[1, 28, 16]} />
            <meshStandardMaterial color="#3fb950" />
          </mesh>
          {/* midrib */}
          <mesh position={[0, size * 0.075, size * 0.75]} rotation={[Math.PI / 2, 0, 0]} userData={{ keep: true }}>
            <cylinderGeometry args={[0.008, 0.008, size * 1.7, 5]} />
            <meshBasicMaterial color="#2b7a35" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const Plant: React.FC<{ label: THREE.Texture }> = ({ label }) => {
  const potGeo = useMemo(() => {
    const pts = [[0, 0], [0.19, 0], [0.205, 0.02], [0.25, 0.3], [0.285, 0.31], [0.29, 0.37], [0.27, 0.38], [0, 0.38]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  const leaves = [
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
  return (
    <group position={PLANT_POS} rotation={[0, -0.3, 0]}>
      {/* stool */}
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
        {/* AUDIRA label on the pot, facing the camera */}
        <mesh position={[0.07, 0.17, 0.235]} rotation={[0, 0.55, 0]} userData={{ keep: true }}>
          <planeGeometry args={[0.28, 0.0875]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </mesh>
        <group position={[0, 0.34, 0]}>
          {leaves.map((l, i) => (
            <Leaf key={i} base={[0, 0, 0]} {...l} />
          ))}
        </group>
      </group>
    </group>
  );
};

const Phone: React.FC<{ at: THREE.Vector3; sticker: THREE.Texture }> = ({ at, sticker }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(PLANT_TARGET);
  });
  const W = 0.16, H = 0.32, D = 0.028;
  return (
    <group position={at} ref={ref}>
      <group position={[0, 0.07, 0]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[W, H, D]} radius={0.022} />
          <meshStandardMaterial color="#2a2d44" />
        </mesh>
        {/* screen (faces the holder) */}
        <mesh position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]} userData={{ keep: true }}>
          <planeGeometry args={[W * 0.86, H * 0.9]} />
          <meshBasicMaterial color="#8ff5ff" toneMapped={false} />
        </mesh>
        {/* camera bump with glowing lens (back, faces the plant) */}
        <mesh position={[-0.035, 0.1, D / 2 + 0.008]} castShadow>
          <RoundedBoxGeo args={[0.065, 0.075, 0.016]} radius={0.012} />
          <meshStandardMaterial color="#14152a" />
        </mesh>
        <mesh position={[-0.035, 0.11, D / 2 + 0.018]} rotation={[Math.PI / 2, 0, 0]} userData={{ keep: true }}>
          <cylinderGeometry args={[0.022, 0.022, 0.006, 24]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        {/* AUDIRA sticker on the casing */}
        <mesh position={[0.012, -0.07, D / 2 + 0.002]} rotation={[0, 0, 0.12]} userData={{ keep: true }}>
          <planeGeometry args={[0.135, 0.053]} />
          <meshBasicMaterial map={sticker} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/** View frustum from the lens to the plant: translucent 4-sided pyramid plus glowing edges. */
const Frustum: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; f: number }> = ({ from, to, f }) => {
  const dir = to.clone().sub(from);
  const len = dir.length();
  dir.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  const mid = from.clone().addScaledVector(dir, len / 2);
  const pulse = 0.85 + 0.15 * Math.sin(f / 10);
  const edges = useMemo(() => {
    const g = new THREE.ConeGeometry(0.5, len, 4, 1, true);
    return new THREE.EdgesGeometry(g);
  }, [len]);
  return (
    <group position={mid} quaternion={q}>
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh renderOrder={2}>
          <coneGeometry args={[0.5, len, 4, 1, true]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.2 * pulse} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh renderOrder={2} scale={[0.55, 1, 0.55]}>
          <coneGeometry args={[0.5, len, 4, 1, true]} />
          <meshBasicMaterial color="#bffcff" transparent opacity={0.16 * pulse} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <lineSegments geometry={edges} renderOrder={3}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.9} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
};

const Billboard: React.FC<{ p: V3; w: number; h: number; map: THREE.Texture; rot?: number }> = ({ p, w, h, map, rot = 0 }) => {
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    ref.current?.lookAt(new THREE.Vector3(...CAM_POS));
    ref.current?.rotateZ(rot);
  });
  return (
    <mesh ref={ref} position={p} renderOrder={5}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC<{ f: number; font: string }> = ({ f, font }) => {
  const tex = useMemo(
    () => ({ sticker: stickerTexture(font), label: potLabelTexture(font), bubble: bubbleTexture(), frame: frameTexture(font) }),
    [font],
  );
  const heading = Math.atan2(PLANT_POS[0] - PERSON_POS[0], PLANT_POS[2] - PERSON_POS[2]);
  const t = f / 60;
  const pose: Pose = {
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
  const hand = handWorld(PERSON_POS, heading, PERSON_SCALE, pose);
  // lens position follows the phone layout (back side, upper-left)
  const lens = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(hand);
    o.lookAt(PLANT_TARGET);
    o.updateMatrixWorld(true);
    return new THREE.Vector3(-0.035, 0.07 + 0.11, 0.04).applyMatrix4(o.matrixWorld);
  }, [hand.x, hand.y, hand.z]);

  return (
    <>
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
        <Cloud p={[-9, 3.2, -30]} s={1.5} seed={3} />
        <Cloud p={[9.5, 2.6, -32]} s={1.7} seed={11} />
        <Cloud p={[4, 11, -40]} s={1.6} seed={21} />
      </Inked>

      <Inked thickness={0.02}>
        {/* ground and rolling hills */}
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
        {/* paving under the scene */}
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
          heading={heading}
          scale={PERSON_SCALE}
          look={{ skin: "#f1c7a6", hair: "#1d2340", top: "#ff9f1c", bottom: "#2b3a67", outfit: "casual", hairStyle: 0, build: 1, height: 1 }}
        />
      </Inked>
      <Inked thickness={0.01}>
        <Phone at={hand} sticker={tex.sticker} />
      </Inked>
      <Inked thickness={0.012}>
        <Plant label={tex.label} />
      </Inked>

      <Frustum from={lens} to={PLANT_TARGET.clone().add(new THREE.Vector3(0, 0.02, 0))} f={f} />
      <Billboard p={[PLANT_TARGET.x + 0.02, PLANT_TARGET.y + 0.02, PLANT_TARGET.z + 0.35]} w={1.05} h={1.18} map={tex.frame} />
      <Billboard p={[0.38, 2.0 + Math.sin(t * 2) * 0.01, 0.75]} w={0.8} h={0.5} map={tex.bubble} rot={-0.04} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
/** Manga concentration lines from the frame edges, leaving the action clear. */
const SpeedLinesOverlay: React.FC<{ f: number }> = ({ f }) => {
  const step = Math.floor(f / 4);
  const cx = 560, cy = 1080;
  const wedges = [];
  for (let i = 0; i < 150; i++) {
    const a = (i / 150) * Math.PI * 2 + (hash(i * 3.1 + step) - 0.5) * 0.03;
    const r1 = 560 + hash(i * 7.7 + step) * 380;
    const r2 = 1500;
    const wdt = 0.004 + hash(i * 1.9) * 0.01;
    const p = (r: number, da: number) => `${cx + Math.cos(a + da) * r},${cy + Math.sin(a + da) * r}`;
    wedges.push(<polygon key={i} points={`${p(r1, 0)} ${p(r2, wdt)} ${p(r2, -wdt)}`} />);
  }
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g fill="#ffffff" opacity={0.6}>{wedges}</g>
    </svg>
  );
};

export const Ep08Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP08 fonts"));
  useEffect(() => {
    Promise.all([bangers.waitUntilDone(), dela.waitUntilDone()])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  const stroke = { WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke fill" } as React.CSSProperties;

  return (
    <AbsoluteFill style={{ background: "#4fa3ff" }}>
      {ready && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          camera={{ position: CAM_POS, fov: 38, near: 0.1, far: 200 }}
          onCreated={({ camera }) => camera.lookAt(...CAM_TARGET)}
        >
          <Scene f={f} font={bangers.fontFamily} />
          <Finish frame={frame} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.95} envIntensity={0.3} ao={false} />
        </ThreeCanvas>
      )}
      <SpeedLinesOverlay f={f} />
      <div style={{ position: "absolute", left: 64, right: 48, top: 262 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: INK,
            color: "#fff",
            fontFamily: dela.fontFamily,
            fontSize: 34,
            letterSpacing: 6,
            padding: "10px 22px 12px",
            borderBottom: `6px solid ${T.crimsonImpact}`,
            transform: "skewX(-8deg)",
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: 8, background: CYAN, display: "inline-block" }} />
          AUDIRA AI TUTORIAL
        </div>
        <div style={{ transform: "rotate(-4deg) skewX(-6deg)", transformOrigin: "left top", marginTop: 26 }}>
          <div style={{ fontFamily: bangers.fontFamily, fontSize: 158, lineHeight: 0.92, color: "#ffffff", letterSpacing: 2, ...stroke, textShadow: `10px 10px 0 ${INK}` }}>
            AI BISA LIHAT
          </div>
          <div style={{ fontFamily: bangers.fontFamily, fontSize: 214, lineHeight: 0.92, color: "#ffd23f", letterSpacing: 3, ...stroke, textShadow: `12px 12px 0 ${T.sakuraPink}` }}>
            KAMERAMU
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
