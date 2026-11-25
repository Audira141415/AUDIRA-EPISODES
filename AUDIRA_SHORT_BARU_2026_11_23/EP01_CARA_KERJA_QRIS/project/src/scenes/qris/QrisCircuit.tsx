// EP01 Cara Kerja QRIS — CIRCUITFORGE (Remotion + R3F). One long PCB along x; each act has its own zone:
// WARUNG x=0 · STANDAR/ANATOMI x=-18 · JARINGAN x=14–45 · PAYOFF x=56–70 · CLOSE (whole board).
// VO, script, SFX and HUD timing are the ones of the ISOCRAFT cut (QrisFilm.tsx): film time = VO + 0.3 s.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FilmScene } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { shotPlan, cameraAt, frame as fr, pushIn, orbit, settle } from "../../core/camera/moves.ts";
import { AssetModel } from "../../core/assets/AssetModel";
import { SceneText } from "../../core/polish/Drei.tsx";
import { CIRCUIT_PALETTE as PAL } from "../../kits/circuitforge/lib/palette";
import { CircuitAtmosphere } from "../../kits/circuitforge/world/Atmosphere";
import { MicrochipBga } from "../../kits/circuitforge/pcb/MicrochipBga";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";
import { Caption } from "./hud";
import { Hud, QRIS_SECONDS } from "./QrisFilm";
import { useIsoFonts } from "./iso";

const OFFSET = 0.3;
const OUTRO_AT = 78.2;
type V3 = [number, number, number];

const C = {
  qris: "#E0262E",
  issuer: "#2F6FDE",
  switch: "#F2A93B",
  acquirer: "#8B6BF0",
  merchant: "#E8664A",
  ok: "#2BD47D",
  bi: "#3D6FB8",
  aspi: "#14B8A6",
};

// ── time helpers (seconds) ─────────────────────────────────────────────────
const cl = (v: number) => Math.min(1, Math.max(0, v));
const sm = (v: number) => v * v * (3 - 2 * v);
const ramp = (t: number, a: number, b: number) => sm(cl((t - a) / (b - a)));
const win = (t: number, a: number, b: number, f = 0.35) => Math.min(ramp(t, a, a + f), 1 - ramp(t, b - f, b));
const popS = (t: number, at: number, d = 0.4) => {
  const x = cl((t - at) / d);
  const c1 = 1.9, c3 = c1 + 1;
  return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Piecewise smooth path through [time, x, y, z] keys. */
const path = (t: number, k: [number, number, number, number][]): V3 => {
  if (t <= k[0][0]) return [k[0][1], k[0][2], k[0][3]];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const a = k[i - 1], b = k[i];
      const u = sm((t - a[0]) / (b[0] - a[0]));
      return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
    }
  }
  const l = k[k.length - 1];
  return [l[1], l[2], l[3]];
};

// ── QR pattern + canvas textures ───────────────────────────────────────────
const N = 25;
const qrMatrix = (seed: number): boolean[][] => {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const m = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r < 8; r++) for (let c = -1; c < 8; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      m[rr][cc] = r >= 0 && c >= 0 && r < 7 && c < 7 && ring !== 2;
    }
  };
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  return m;
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const drawQr = (g: CanvasRenderingContext2D, m: boolean[][], x: number, y: number, size: number, ink: string) => {
  const cs = size / N;
  g.fillStyle = ink;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (m[r][c]) g.fillRect(x + c * cs, y + r * cs, cs + 0.6, cs + 0.6);
};

/** QRIS stand face: red header, QR, merchant name (brand in scene). */
const standTexture = (m: boolean[][]) =>
  canvasTex(512, 720, (g) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 512, 720);
    g.fillStyle = C.qris; g.fillRect(0, 0, 512, 130);
    g.fillStyle = "#ffffff"; g.font = "900 96px Arial Black, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("QRIS", 256, 70);
    drawQr(g, m, 56, 160, 400, "#111111");
    g.fillStyle = "#111111"; g.font = "800 46px Arial"; g.fillText("WARUNG AUDIRA", 256, 616);
    g.fillStyle = "#666666"; g.font = "600 30px Arial"; g.fillText("NMID ID1023456789", 256, 672);
  });

/** Small app QR (flashback): each app its own colour + name. */
const appTexture = (m: boolean[][], color: string, name: string) =>
  canvasTex(256, 512, (g) => {
    g.fillStyle = "#0b1220"; g.fillRect(0, 0, 256, 512);
    g.fillStyle = color; g.fillRect(0, 0, 256, 96);
    g.fillStyle = "#ffffff"; g.font = "800 40px Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(name, 128, 50);
    g.fillStyle = "#ffffff"; g.fillRect(24, 150, 208, 208);
    drawQr(g, m, 32, 158, 192, color);
  });

const phoneScreen = (kind: "pay" | "ok" | "idle") =>
  canvasTex(256, 512, (g) => {
    g.fillStyle = kind === "ok" ? "#0f9d58" : "#0b1220"; g.fillRect(0, 0, 256, 512);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff";
    if (kind === "pay") {
      g.font = "700 30px Arial"; g.fillText("WARUNG AUDIRA", 128, 110);
      g.font = "900 50px Arial"; g.fillText("Rp15.000", 128, 210);
      g.fillStyle = C.ok; g.beginPath(); g.roundRect(38, 360, 180, 74, 37); g.fill();
      g.fillStyle = "#ffffff"; g.font = "900 36px Arial"; g.fillText("BAYAR", 128, 398);
    } else if (kind === "ok") {
      g.strokeStyle = "#ffffff"; g.lineWidth = 26; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(66, 210); g.lineTo(112, 258); g.lineTo(194, 160); g.stroke();
      g.font = "900 38px Arial"; g.fillText("BERHASIL", 128, 350);
      g.font = "700 34px Arial"; g.fillText("+Rp15.000", 128, 404);
    } else {
      g.font = "700 30px Arial"; g.fillStyle = "#64748b"; g.fillText("menunggu…", 128, 256);
    }
  });

// ── animated character (shopper, Idle clip, deterministic setTime) ─────────
const loadedGlb = new Map<string, Promise<{ scene: THREE.Object3D; clips: THREE.AnimationClip[] }>>();
const Character: React.FC<{ t: number; height?: number; position?: V3; rotation?: V3 }> = ({ t, height = 1.75, position, rotation }) => {
  const url = staticFile("models/polyfork/shopper-base.glb");
  const [obj, setObj] = useState<{ root: THREE.Object3D; mixer: THREE.AnimationMixer } | null>(null);
  useLayoutEffect(() => {
    // Handle lives in the effect: a Suspense sibling can discard the first mount, which would orphan a useState handle.
    const h = delayRender("shopper glb");
    let open = true;
    const handle = () => { if (open) { open = false; continueRender(h); } };
    if (!loadedGlb.has(url)) loadedGlb.set(url, new GLTFLoader().loadAsync(url).then((g) => ({ scene: g.scene, clips: g.animations })));
    loadedGlb.get(url)!.then(({ scene, clips }) => {
      const root = cloneSkinned(scene);
      root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
      const mixer = new THREE.AnimationMixer(root);
      const idle = clips.find((c) => c.name === "Idle") ?? clips[0];
      if (idle) mixer.clipAction(idle).play();
      mixer.setTime(0);
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      const k = height / Math.max(1e-6, box.max.y - box.min.y);
      root.scale.setScalar(k);
      root.position.y = -box.min.y * k;
      setObj({ root, mixer });
      handle();
    }, handle);
    return handle;
  }, [url, height]);
  if (obj) obj.mixer.setTime(t);
  return <group position={position} rotation={rotation}>{obj ? <primitive object={obj.root} /> : null}</group>;
};

// ── small building blocks ──────────────────────────────────────────────────
const Silk: React.FC<{ text: string; position: V3; size?: number; color?: string; rotZ?: number; opacity?: number }> = ({ text, position, size = 0.45, color = PAL.silkscreenWhite, rotZ = 0, opacity = 1 }) => (
  <group position={position} rotation={[-Math.PI / 2, 0, rotZ]}>
    <SceneText font="sans" fontSize={size} color={color} anchorX="center" anchorY="middle" letterSpacing={0.06} fillOpacity={opacity}>
      {text}
    </SceneText>
  </group>
);

/** Upright label board facing +z (sign on a pole). */
const Sign: React.FC<{ text: string; position: V3; color: string; size?: number; w?: number; s?: number }> = ({ text, position, color, size = 0.34, w = 2.2, s = 1 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 0, -0.03]}>
      <boxGeometry args={[w, size * 1.7, 0.05]} />
      <meshStandardMaterial color="#0b1220" roughness={0.5} emissive={color} emissiveIntensity={0.12} />
    </mesh>
    <mesh position={[0, -size * 0.85 - 0.03, -0.03]}>
      <boxGeometry args={[w, 0.06, 0.06]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
    <SceneText font="sans" fontSize={size} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.01]} letterSpacing={0.05}>
      {text}
    </SceneText>
  </group>
);

const Phone: React.FC<{ s: number; screen?: THREE.Texture; glow?: number; position?: V3; rotation?: V3 }> = ({ s, screen, glow = 0.9, position, rotation }) => (
  <group position={position} rotation={rotation}>
    <AssetModel id="smartphone-5f05e5" ground scale={s} />
    {screen ? (
      <mesh position={[0, 0.075 * s, 0.0056 * s]}>
        <planeGeometry args={[0.062 * s, 0.132 * s]} />
        <meshBasicMaterial map={screen} toneMapped={false} color={new THREE.Color(glow, glow, glow)} />
      </mesh>
    ) : null}
  </group>
);

const Packet: React.FC<{ p: V3; color?: string; on: number; trail?: V3[] }> = ({ p, color = PAL.clockCyan, on, trail = [] }) =>
  on <= 0.01 ? null : (
    <group>
      <mesh position={p} scale={on}>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight position={[p[0], p[1] + 0.3, p[2]]} color={color} intensity={6 * on} distance={5} decay={2} />
      {trail.map((q, i) => (
        <mesh key={i} position={q} scale={on * (1 - (i + 1) / (trail.length + 1))}>
          <sphereGeometry args={[0.14, 12, 8]} />
          <meshBasicMaterial color={PAL.electronAmber} transparent opacity={0.75} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );

const Trace: React.FC<{ from: V3; to: V3; w?: number; glow?: number; color?: string }> = ({ from, to, w = 0.18, glow = 0.2, color = PAL.electronAmber }) => {
  const dx = to[0] - from[0], dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  return (
    <mesh position={[(from[0] + to[0]) / 2, 0.012, (from[2] + to[2]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <boxGeometry args={[len, 0.024, w]} />
      <meshStandardMaterial color="#b87333" roughness={0.3} metalness={0.85} emissive={color} emissiveIntensity={glow} />
    </mesh>
  );
};

/** QR modules as an instanced voxel slab; lift 0..1 raises them in a wave (anatomy act). */
const QrVoxels: React.FC<{ m: boolean[][]; size: number; lift: number; t: number }> = ({ m, size, lift, t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (m[r][c]) out.push([r, c]);
    return out;
  }, [m]);
  const cs = size / N;
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    cells.forEach(([r, c], i) => {
      const wave = cl(lift * 1.6 - ((r + c) / (2 * N)) * 0.6);
      const h = 0.06 + sm(wave) * 0.5 * (0.6 + 0.4 * Math.sin(r * 1.7 + c * 2.3 + t * 2));
      o.position.set((c - N / 2 + 0.5) * cs, h / 2 + 0.02, (r - N / 2 + 0.5) * cs);
      o.scale.set(cs * 0.94, h, cs * 0.94);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cells.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.3} emissive={PAL.clockCyan} emissiveIntensity={0.05 + lift * 0.25} />
    </instancedMesh>
  );
};

const Tower: React.FC<{ id: string; scale: number; color: string; rise: number; position: V3; glow?: number }> = ({ id, scale, color, rise, position, glow = 0.3 }) =>
  rise <= 0.01 ? null : (
    <group position={position}>
      <group scale={[1, Math.max(0.01, rise), 1]}>
        <AssetModel id={id} ground scale={scale} emissive={color} emissiveIntensity={glow} />
      </group>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.25, 48]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9 * rise} />
      </mesh>
    </group>
  );

// ── world ──────────────────────────────────────────────────────────────────
const WARUNG_X = 0;
const QR_X = -18;
const PHONE_X = 14, ISSUER_X = 21, GPN_X = 29, ACQ_X = 37, SHOP_X = 45;
const RING_X = 56, GRID_X = 61, COIN_X = 69;
const RACKS: { name: string; x: number; z: number; at: number }[] = [
  { name: "ARTAJASA", x: -1.8, z: -1.6, at: 46.97 },
  { name: "RINTIS", x: 1.8, z: -1.6, at: 47.7 },
  { name: "JALIN", x: -1.8, z: 1.6, at: 48.63 },
  { name: "ALTO", x: 1.8, z: 1.6, at: 49.29 },
];
const APPS: [string, string][] = [
  ["#1E88E5", "APP A"], ["#43A047", "APP B"], ["#8E24AA", "APP C"], ["#F4511E", "APP D"],
  ["#00ACC1", "APP E"], ["#FDD835", "APP F"], ["#3949AB", "APP G"], ["#D81B60", "APP H"],
];

const NET_KEYS: [number, number, number, number][] = [
  [35.5, PHONE_X, 1.5, 0.4],
  [36.8, PHONE_X + 1.4, 0.35, 0.8],
  [40.3, ISSUER_X - 0.9, 0.35, 0.8],
  [41.6, ISSUER_X, 2.6, 0.8],
  [43.1, GPN_X - 2.6, 0.35, 0.8],
  [44.6, GPN_X, 0.9, 0],
  [46.6, GPN_X, 0.9, 0],
  [46.97, GPN_X + RACKS[0].x, 0.6, RACKS[0].z + 0.6],
  [47.7, GPN_X + RACKS[1].x, 0.6, RACKS[1].z + 0.6],
  [48.63, GPN_X + RACKS[2].x, 0.6, RACKS[2].z + 0.6],
  [49.29, GPN_X + RACKS[3].x, 0.6, RACKS[3].z + 0.6],
  [50.3, GPN_X + 2.8, 0.35, 0.8],
  [51.2, ACQ_X - 0.9, 0.35, 0.8],
  [52.6, ACQ_X, 2.6, 0.8],
  [54.2, ACQ_X + 1.2, 0.35, 0.8],
  [55.9, SHOP_X + 0.9, 1.0, 1.7],
];
const HOOK_KEYS: [number, number, number, number][] = [
  [2.9, 0.45, 1.25, 1.55],
  [3.6, 0.9, 0.35, 0.8],
  [5.6, 9, 0.35, 0.8],
];

const World: React.FC<{ t: number }> = ({ t }) => {
  const qr = useMemo(() => qrMatrix(7), []);
  const tex = useMemo(() => ({
    stand: standTexture(qr),
    pay: phoneScreen("pay"),
    ok: phoneScreen("ok"),
    idle: phoneScreen("idle"),
    apps: APPS.map(([c, n], i) => appTexture(qrMatrix(20 + i), c, n)),
  }), [qr]);

  const allGlow = ramp(t, 71.7, 74.5);
  const busGlow = 0.18 + allGlow * 0.9 + (t > 34.6 && t < 57.6 ? 0.25 : 0);

  // hook packet / network packet
  const hookOn = win(t, 2.9, 5.7, 0.2);
  const netOn = win(t, 35.4, 56.2, 0.3);
  const trailOf = (keys: typeof NET_KEYS) => [0.05, 0.1, 0.15, 0.2, 0.25].map((d) => path(t - d, keys));

  // STANDAR zone
  const qrRise = ramp(t, 10.9, 12.2);
  const biRise = ramp(t, 13.9, 15.0);
  const aspiRise = ramp(t, 14.3, 15.4);
  const flash = win(t, 19.3, 25.0, 0.4); // 8 app phones
  const merge = ramp(t, 24.1, 25.2);
  const lift = ramp(t, 26.0, 28.6) * (1 - ramp(t, 34.0, 34.8));
  const rows: [string, string, number][] = [
    ["00 · FORMAT EMVCo", C.issuer, 27.8],
    ["59 · WARUNG AUDIRA", C.merchant, 29.2],
    ["NMID · ID1023456789", C.merchant, 30.9],
    ["54 · Rp15.000", C.ok, 32.6],
  ];

  // PAYOFF
  const ringOn = win(t, 57.4, 61.6, 0.4);
  const ringA = (t - 57.5) * 5.2;
  const phonesN = Math.round(72 * ramp(t, 63.4, 64.5));
  const stallsN = Math.round(51 * ramp(t, 65.1, 66.0));
  const gridOn = win(t, 61.2, 67.2, 0.4);
  const coinsN = Math.round(12 * ramp(t, 67.0, 69.6));
  const coinOn = win(t, 66.8, 72.4, 0.4);

  return (
    <group>
      {/* ── PCB substrate + bus ── */}
      <mesh position={[22, -0.15, 0]} receiveShadow>
        <boxGeometry args={[110, 0.3, 22]} />
        <meshStandardMaterial color={PAL.solderMaskDark} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[22, 0.004, 0]} receiveShadow>
        <boxGeometry args={[108, 0.01, 20]} />
        <meshStandardMaterial color={PAL.copperPourMid} roughness={0.6} metalness={0.2} transparent opacity={0.55} />
      </mesh>
      <Trace from={[-26, 0, 0.8]} to={[72, 0, 0.8]} w={0.32} glow={busGlow} />
      <Trace from={[-26, 0, -0.8]} to={[72, 0, -0.8]} w={0.16} glow={0.12 + allGlow * 0.8} color={PAL.clockCyan} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = -24 + i * 4.4;
        const z = i % 2 ? 4.5 : -4.5;
        return <Trace key={`br${i}`} from={[x, 0, i % 2 ? 0.8 : -0.8]} to={[x + 1.6, 0, z]} w={0.12} glow={0.08 + allGlow * 0.6} color={i % 3 ? PAL.electronAmber : PAL.clockCyan} />;
      })}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={`pad${i}`} position={[-25 + i * 3.8, 0.02, i % 2 ? 6.5 : -6.5]}>
          <cylinderGeometry args={[0.25, 0.25, 0.04, 20]} />
          <meshStandardMaterial color={PAL.enigGold} roughness={0.2} metalness={0.92} emissive={PAL.enigGold} emissiveIntensity={0.15 + allGlow * 0.5} />
        </mesh>
      ))}
      <Silk text="AUDIRA · QRIS-01 · REV 2026" position={[22, 0.03, 8.6]} size={0.7} color={PAL.enigGold} />

      {/* ── WARUNG (hook) ── */}
      <group position={[WARUNG_X, 0, 0]}>
        <AssetModel id="market-stall-94937d" ground scale={1.6} position={[0, 0, -1.4]} />
        <Sign text="WARUNG AUDIRA" position={[0, 3.55, -1.0]} color={C.merchant} size={0.3} w={2.6} />
        {/* QRIS stand on a pole */}
        <group position={[0.45, 0, 1.0]} rotation={[0, -0.35, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.05, 1.0, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[0.56, 0.78, 0.03]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.25, 0.017]}>
            <planeGeometry args={[0.52, 0.73]} />
            <meshBasicMaterial map={tex.stand} toneMapped={false} />
          </mesh>
          {/* scan line */}
          {t > 0.4 && t < 2.9 ? (
            <mesh position={[0, 1.08 + 0.3 * Math.abs(Math.sin(t * 2.6)), 0.03]}>
              <planeGeometry args={[0.5, 0.02]} />
              <meshBasicMaterial color={C.ok} toneMapped={false} />
            </mesh>
          ) : null}
        </group>
        <Character t={t} position={[-0.35, 0, 2.55]} rotation={[0, 2.65, 0]} />
        <Phone s={3.2} screen={t < 2.9 ? tex.idle : tex.pay} glow={t < 1.2 ? 0.6 : 1} position={[-0.2, 1.05, 1.85]} rotation={[-0.15, 2.6, 0]} />
        {/* merchant phone on the counter */}
        <Phone s={3.0} screen={t > 7.3 ? tex.ok : tex.idle} glow={t > 7.3 ? 1.2 : 0.5} position={[-0.6, 1.0, -0.55]} rotation={[-0.5, 0.25, 0]} />
        {t > 7.3 && t < 11 ? <pointLight position={[-0.6, 1.4, -0.2]} color={C.ok} intensity={4 * win(t, 7.3, 10.8)} distance={3} /> : null}
      </group>
      <Packet p={path(t, HOOK_KEYS)} on={hookOn} color={C.ok} trail={trailOf(HOOK_KEYS)} />

      {/* ── STANDAR + ANATOMI ── */}
      <group position={[QR_X, 0, 0]}>
        <group scale={[1, Math.max(0.01, qrRise), 1]}>
          <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
            <boxGeometry args={[7.2, 0.12, 8.4]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.125, -3.55]}>
            <boxGeometry args={[7.2, 0.02, 1.3]} />
            <meshStandardMaterial color={C.qris} roughness={0.4} emissive={C.qris} emissiveIntensity={0.25} />
          </mesh>
          <Silk text="QRIS" position={[0, 0.15, -3.55]} size={0.95} color="#ffffff" />
          <group position={[0, 0.12, 0.45]}>
            <QrVoxels m={qr} size={6.2} lift={lift} t={t} />
          </group>
        </group>
        <Tower id="monolith-office-tower-422420" scale={0.11} color={C.bi} rise={biRise} position={[-2.6, 0, -6.6]} glow={0.25} />
        <Tower id="office-tower-1538cc" scale={0.15} color={C.aspi} rise={aspiRise} position={[2.6, 0, -6.6]} glow={0.3} />
        <Sign text="BANK INDONESIA" position={[-2.6, 0.45, -5.2]} color={C.bi} size={0.3} w={2.6} s={biRise} />
        <Sign text="ASPI" position={[2.6, 0.45, -5.2]} color={C.aspi} size={0.3} w={1.4} s={aspiRise} />
        {/* flashback: one QR per app, then merged into one QRIS */}
        {flash > 0.01 ? APPS.map((_, i) => {
          const a = (i / APPS.length) * Math.PI * 2 + 0.2;
          const appear = popS(t, 19.5 + i * 0.45, 0.45);
          const rx = Math.cos(a) * 4.9 * (1 - merge), rz = Math.sin(a) * 3.2 * (1 - merge) + 1.2;
          const s = 14 * cl(appear) * (1 - merge * 0.9);
          return s < 0.2 ? null : (
            <Phone key={i} s={s} screen={tex.apps[i]} glow={1.1} position={[rx, 0.4 + merge * 1.5, rz]} rotation={[-0.25, -rx * 0.06, 0]} />
          );
        }) : null}
        {rows.map(([txt, col, at], i) => {
          const p = popS(t, at, 0.45) * (1 - ramp(t, 34.1, 34.7));
          if (p < 0.01) return null;
          return (
            <group key={i} position={[0, 1.2 + lift * 0.3, -1.4 + i * 0.95]} rotation={[-1.1, 0, 0]} scale={cl(p) * 0.6}>
              <mesh position={[0, 0, -0.03]}>
                <boxGeometry args={[5.4, 0.9, 0.06]} />
                <meshStandardMaterial color="#0b1220" emissive={col} emissiveIntensity={0.18} roughness={0.5} />
              </mesh>
              <mesh position={[-2.62, 0, 0]}>
                <boxGeometry args={[0.16, 0.9, 0.08]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.5} toneMapped={false} />
              </mesh>
              <SceneText font="sans" fontSize={0.42} color="#ffffff" anchorX="center" anchorY="middle" position={[0.1, 0, 0.01]} letterSpacing={0.03}>
                {txt}
              </SceneText>
            </group>
          );
        })}
      </group>

      {/* ── JARINGAN ── */}
      <Phone s={16} screen={t > 35.4 ? tex.pay : tex.idle} glow={1} position={[PHONE_X, 0, 0.3]} rotation={[0, -1.1, 0]} />
      <Silk text="HP PEMBELI" position={[PHONE_X, 0.03, 2.6]} size={0.4} />
      <Tower id="office-tower-1538cc" scale={0.15} color={C.issuer} rise={1} position={[ISSUER_X, 0, -0.6]} glow={0.35 + 0.6 * win(t, 40.2, 43.0)} />
      <Sign text="ISSUER" position={[ISSUER_X, 0.5, 1.9]} color={C.issuer} size={0.42} w={2.4} />
      <group position={[GPN_X, 0, 0]}>
        <group scale={1.4}><MicrochipBga /></group>
        <Silk text="GPN" position={[0, 0.62, 0]} size={0.7} color={PAL.enigGold} />
        {RACKS.map((r) => {
          const lit = win(t, r.at - 0.05, 50.2, 0.12);
          return (
            <group key={r.name} position={[r.x, 0, r.z]}>
              <AssetModel id="small-server-rack-8ae0a4" ground scale={2.1} emissive={C.switch} emissiveIntensity={0.08 + lit * 0.7} />
              <Silk text={r.name} position={[0, 0.03, 1.35]} size={0.3} color={C.switch} opacity={0.5 + lit * 0.5} />
              {lit > 0.05 ? <pointLight position={[0, 1.4, 1.0]} color={C.switch} intensity={5 * lit} distance={3.5} /> : null}
              <Trace from={[0, 0, 0]} to={[-r.x, 0, -r.z]} w={0.12} glow={0.15 + lit * 1.2} />
            </group>
          );
        })}
      </group>
      <Tower id="office-tower-1538cc" scale={0.15} color={C.acquirer} rise={1} position={[ACQ_X, 0, -0.6]} glow={0.35 + 0.6 * win(t, 50.9, 54.0)} />
      <Sign text="ACQUIRER" position={[ACQ_X, 0.5, 1.9]} color={C.acquirer} size={0.42} w={2.8} />
      <group position={[SHOP_X, 0, -0.8]}>
        <AssetModel id="cafe-storefront-unit-443728" ground scale={0.42} />
        <Sign text="WARUNG AUDIRA" position={[0, 3.3, 1.8]} color={C.merchant} size={0.3} w={2.6} />
      </group>
      <Phone s={11} screen={t > 55.8 ? tex.ok : tex.idle} glow={t > 55.8 ? 1.2 : 0.5} position={[SHOP_X + 1.3, 0, 2.0]} rotation={[0, -0.3, 0]} />
      {t > 55.8 && t < 58 ? <pointLight position={[SHOP_X + 1.3, 1.2, 2.8]} color={C.ok} intensity={6} distance={4} /> : null}
      <Packet p={path(t, NET_KEYS)} on={netOn} color={PAL.clockCyan} trail={trailOf(NET_KEYS)} />

      {/* ── PAYOFF: domestic loop ── */}
      {ringOn > 0.01 ? (
        <group position={[RING_X, 0, 0]} scale={0.6 + 0.4 * ringOn}>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.85, 3.15, 96]} />
            <meshStandardMaterial color="#b87333" metalness={0.85} roughness={0.3} emissive={PAL.electronAmber} emissiveIntensity={0.6} />
          </mesh>
          {[C.issuer, C.switch, C.acquirer].map((col, i) => {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            return (
              <AssetModel key={i} id={i === 1 ? "small-server-rack-8ae0a4" : "office-tower-1538cc"} ground scale={i === 1 ? 1.4 : 0.08}
                position={[Math.cos(a) * 3, 0, Math.sin(a) * 3]} emissive={col} emissiveIntensity={0.45} />
            );
          })}
          {/* red-white flag */}
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.04, 0.04, 2.4, 10]} /><meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} /></mesh>
          <mesh position={[0.6, 2.15, 0]}><boxGeometry args={[1.2, 0.36, 0.03]} /><meshStandardMaterial color="#E0262E" roughness={0.6} /></mesh>
          <mesh position={[0.6, 1.79, 0]}><boxGeometry args={[1.2, 0.36, 0.03]} /><meshStandardMaterial color="#f8fafc" roughness={0.6} /></mesh>
          <Packet p={[Math.cos(ringA) * 3, 0.35, Math.sin(ringA) * 3]} on={1} color={PAL.clockCyan}
            trail={[0.04, 0.08, 0.12, 0.16].map((d) => [Math.cos(ringA - d * 5.2) * 3, 0.35, Math.sin(ringA - d * 5.2) * 3] as V3)} />
          <Silk text="INDONESIA" position={[0, 0.03, 3.9]} size={0.5} />
        </group>
      ) : null}

      {/* ── PAYOFF: 72 phones (users) + 51 stalls (merchants) ── */}
      {gridOn > 0.01 ? (
        <group position={[GRID_X, 0, 0]}>
          {Array.from({ length: phonesN }, (_, i) => {
            const c = i % 12, r = Math.floor(i / 12);
            return <AssetModel key={`p${i}`} id="smartphone-5f05e5" ground scale={4.4} position={[(c - 5.5) * 0.42, 0, -3.9 + r * 0.55]} rotation={[-0.35, 0, 0]} emissive={C.issuer} emissiveIntensity={0.35} />;
          })}
          {Array.from({ length: stallsN }, (_, i) => {
            const c = i % 9, r = Math.floor(i / 9);
            return <AssetModel key={`s${i}`} id="market-stall-94937d" ground scale={0.27} position={[(c - 4) * 0.58, 0, 0.7 + r * 0.6]} emissive={C.merchant} emissiveIntensity={0.18} />;
          })}
        </group>
      ) : null}

      {/* ── PAYOFF: MDR 0% coins ── */}
      {coinOn > 0.01 ? (
        <group position={[COIN_X, 0, 0.6]}>
          {Array.from({ length: coinsN }, (_, i) => (
            <AssetModel key={i} id="gold-coin-29afc1" ground scale={14} position={[Math.sin(i * 1.3) * 0.04, i * 0.13, 0]} rotation={[Math.PI / 2, 0, i * 0.5]} />
          ))}
          <AssetModel id="banded-cash-bundle-7da278" ground scale={8} position={[-1.5, 0, 0.6]} rotation={[0, 0.4, 0]} />
          <AssetModel id="banded-cash-bundle-7da278" ground scale={8} position={[1.5, 0, 0.3]} rotation={[0, -0.5, 0]} />
          <Sign text="USAHA MIKRO ≤ Rp500 RB" position={[0, 0.45, 1.9]} color={C.merchant} size={0.3} w={3.6} />
        </group>
      ) : null}

      {/* zone lights */}
      <pointLight position={[WARUNG_X + 1, 4, 3]} intensity={10} color="#fff1dc" distance={12} decay={2} />
      <pointLight position={[QR_X, 6, 3]} intensity={14} color="#ffffff" distance={16} decay={2} />
      <pointLight position={[GPN_X, 5, 2]} intensity={12} color="#ffffff" distance={16} decay={2} />
      <pointLight position={[SHOP_X, 5, 4]} intensity={10} color="#fff1dc" distance={14} decay={2} />
      <pointLight position={[GRID_X + 3, 6, 3]} intensity={14} color="#ffffff" distance={18} decay={2} />
    </group>
  );
};

/** Key light that follows the camera target so every zone gets shaped light and a shadow. */
const FollowKey: React.FC<{ target: V3 }> = ({ target }) => {
  const ref = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  useLayoutEffect(() => {
    const l = ref.current!;
    l.target.position.set(target[0], 0, target[2]);
    l.target.updateMatrixWorld();
    if (!l.target.parent) scene.add(l.target);
  });
  return (
    <directionalLight ref={ref} position={[target[0] - 6, 12, target[2] + 9]} intensity={2.6} color="#fff4e6" castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12}
      shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
  );
};

// ── camera ─────────────────────────────────────────────────────────────────
const START = { target: [0.25, 1.2, 1.25] as V3, az: 20, el: 12, dist: 3.8, fov: 32 };
const BEATS = [
  { at: 1.2, move: pushIn(0.82) },
  { at: 3.3, move: fr({ target: [0.8, 1.2, 0.4], az: 18, el: 18, dist: 6.5 }) },
  { at: 5.6, move: fr({ target: [1.5, 1.0, 0.2], az: -12, el: 24, dist: 7.5 }) },
  { at: 7.6, move: fr({ target: [-0.6, 1.1, -0.4], az: -8, el: 20, dist: 3.4 }) },
  { at: 9.6, move: fr({ target: [0, 1.4, 0], az: 4, el: 32, dist: 9.5, fov: 34 }) },
  { at: 12.4, move: fr({ target: [QR_X, 0.3, -0.5], az: 0, el: 52, dist: 14 }) },
  { at: 15.0, move: fr({ target: [QR_X, 1.8, -3.2], az: 14, el: 24, dist: 14 }) },
  { at: 18.6, move: orbit(-24) },
  { at: 20.6, move: fr({ target: [QR_X, 1.2, 0.8], az: 0, el: 22, dist: 12 }) },
  { at: 24.3, move: pushIn(0.78) },
  { at: 27.4, move: fr({ target: [QR_X, 0.5, -2.4], az: 0, el: 70, dist: 14.5, fov: 34 }) },
  { at: 31.5, move: fr({ target: [QR_X, 0.8, 0.6], az: 6, el: 62, dist: 9.5 }) },
  { at: 34.2, move: settle() },
  { at: 36.0, move: fr({ target: [PHONE_X, 0.75, 0.3], az: -58, el: 12, dist: 7.2, fov: 32 }) },
  { at: 38.6, move: fr({ target: [PHONE_X + 4, 1.8, 0.3], az: -84, el: 16, dist: 12.5 }) },
  { at: 41.0, move: fr({ target: [ISSUER_X, 2.2, 0], az: 16, el: 15, dist: 10 }) },
  { at: 44.4, move: fr({ target: [GPN_X, 1.0, 0], az: 0, el: 40, dist: 10.5 }) },
  { at: 47.4, move: orbit(14) },
  { at: 50.6, move: fr({ target: [ACQ_X, 2.2, 0], az: -6, el: 16, dist: 11 }) },
  { at: 55.0, move: fr({ target: [SHOP_X + 0.5, 1.4, 1.2], az: -20, el: 18, dist: 9.5 }) },
  { at: 56.4, move: fr({ target: [SHOP_X + 0.6, 0.95, 1.2], az: -16, el: 16, dist: 8.6 }) },
  { at: 58.8, move: fr({ target: [RING_X, 0.8, 0], az: 0, el: 42, dist: 11, fov: 34 }) },
  { at: 61.0, move: orbit(28) },
  { at: 63.0, move: fr({ target: [GRID_X, 0.2, -0.4], az: 0, el: 62, dist: 13 }) },
  { at: 66.4, move: pushIn(0.94) },
  { at: 68.0, move: fr({ target: [COIN_X, 1.0, 0.8], az: 14, el: 22, dist: 6.5 }) },
  { at: 71.0, move: pushIn(0.88) },
  { at: 74.5, move: fr({ target: [24, 0, 0], az: 64, el: 38, dist: 46, fov: 36 }) },
  { at: 78.2, move: orbit(8) },
  { at: 81.2, move: settle() },
];
const LENS = { aperture: 0, maxBlur: 0, exposure: 0.82 };
const rigCache = new Map<number, ReturnType<typeof shotPlan>>();
const rigFor = (fps: number) => {
  if (!rigCache.has(fps)) rigCache.set(fps, shotPlan(fps, START, BEATS));
  return rigCache.get(fps)!;
};

const DepthFog: React.FC = () => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2("#040e08", 0.015);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
};

export const QrisCircuit: React.FC<{ coverAt?: number }> = ({ coverAt }) => {
  useIsoFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = coverAt ?? frame / fps;
  const shot = cameraAt(rigFor(fps), t * fps, fps, { lens: LENS, alive: true });
  const target = shot.target as V3;
  return (
    <AbsoluteFill style={{ background: PAL.solderMaskDark }}>
      <FilmScene
        frame={frame}
        shot={{ pos: shot.pos, target: shot.target, fov: shot.fov }}
        background={PAL.solderMaskDark}
        profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
        hdri="studio"
        ao
        near={0.05}
        far={260}
        overlay={() =>
          coverAt === undefined ? (
            <>
              <Hud t={t} />
              <Caption t={t} offset={OFFSET} hideAfter={OUTRO_AT} />
            </>
          ) : (
            <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 52, color: "#06170f", background: PAL.clockCyan, borderRadius: 14, padding: "8px 26px", letterSpacing: "0.06em" }}>CARA KERJA</span>
              <span style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 1, color: C.qris, WebkitTextStroke: "6px #ffffff", paintOrder: "stroke fill" }}>QRIS</span>
              <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 50, color: "#ffffff", background: "rgba(6,23,15,0.88)", border: `4px solid ${PAL.enigGold}`, borderRadius: 16, padding: "10px 28px", marginTop: 760 }}>uangmu lewat mana?</span>
            </div>
          )
        }
      >
        <DepthFog />
        <CircuitAtmosphere />
        <FollowKey target={target} />
        <directionalLight position={[target[0] + 8, 5, target[2] - 10]} intensity={1.0} color={PAL.clockCyan} />
        <World t={t} />
      </FilmScene>
      {coverAt !== undefined ? null : (
        <>
          <Sequence from={Math.round(OFFSET * fps)}>
            <Audio src={staticFile("audio/vo.wav")} />
          </Sequence>
          <AudiraOutro seconds={QRIS_SECONDS - OUTRO_AT} />
          <AudiraSignature seed="ep01-cara-kerja-qris" />
        </>
      )}
    </AbsoluteFill>
  );
};

export { QRIS_SECONDS };
