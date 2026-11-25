// EP03 set: an outside grass court (Court 18, Wimbledon 2010) at dusk, in metres.
// Court centred on the origin, length along z (baselines z = ±11.885), width along x (doubles ±5.485).
// Near baseline (+z) = Isner serving, far baseline (−z) = Mahut. Everything is a pure function of `f`.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Glb } from "../_shared/Glb.tsx";
import { LEG_LENGTH, ToyPerson, type Pose } from "../../core/polish/Person.tsx";
import { B, COURT } from "./palette.ts";

export const HALF_L = 11.885;
export const HALF_W = 5.485;
const SINGLES = 4.115;
const SERVICE = 6.4;

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ── Grass with mowing stripes and worn baselines ────────────────────────────────────────────────
const Grass: React.FC<{ wear: number }> = ({ wear }) => {
  // 40 × 60 m patch, 1 px ≈ 2.5 cm.
  const tex = useMemo(
    () =>
      canvasTex(800, 1200, (g) => {
        const stripe = 1200 / 20;
        for (let i = 0; i < 20; i++) {
          g.fillStyle = i % 2 ? COURT.grassA : COURT.grassB;
          g.fillRect(0, i * stripe, 800, stripe);
        }
        // worn patches behind each baseline and down the centre (day 3 grass)
        const px = (m: number) => m * 20;
        const cx = 400, cz = 600;
        g.globalAlpha = 0.85 * wear;
        for (const s of [1, -1]) {
          const grad = g.createRadialGradient(cx, cz + s * px(HALF_L + 0.6), 10, cx, cz + s * px(HALF_L + 0.6), px(3.2));
          grad.addColorStop(0, COURT.worn);
          grad.addColorStop(1, "rgba(160,138,90,0)");
          g.fillStyle = grad;
          g.fillRect(cx - px(4), cz + s * px(HALF_L + 0.6) - px(3.2), px(8), px(6.4));
        }
        g.globalAlpha = 0.35 * wear;
        g.fillStyle = COURT.worn;
        g.fillRect(cx - px(0.8), cz - px(HALF_L), px(1.6), px(HALF_L * 2));
        g.globalAlpha = 1;
        // fine grain so the stripes do not band
        let s = 7;
        for (let i = 0; i < 26000; i++) {
          s = (s * 16807) % 2147483647;
          const x = s % 800;
          s = (s * 16807) % 2147483647;
          const y = s % 1200;
          g.fillStyle = i % 2 ? "rgba(0,0,0,0.07)" : "rgba(255,255,220,0.06)";
          g.fillRect(x, y, 2, 2);
        }
      }),
    [wear],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 60]} />
      <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
    </mesh>
  );
};

const Line: React.FC<{ x: number; z: number; w: number; l: number }> = ({ x, z, w, l }) => (
  <mesh position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[w, l]} />
    <meshStandardMaterial color={COURT.line} roughness={0.7} />
  </mesh>
);

const Lines: React.FC = () => {
  const lw = 0.05;
  return (
    <group>
      {[1, -1].map((s) => (
        <React.Fragment key={s}>
          <Line x={0} z={s * HALF_L} w={HALF_W * 2 + lw} l={0.1} />
          <Line x={s * HALF_W} z={0} w={lw} l={HALF_L * 2} />
          <Line x={s * SINGLES} z={0} w={lw} l={HALF_L * 2} />
          <Line x={0} z={s * SERVICE} w={SINGLES * 2} l={lw} />
          <Line x={0} z={s * (HALF_L - 0.08)} w={lw} l={0.16} />
        </React.Fragment>
      ))}
      <Line x={0} z={0} w={lw} l={SERVICE * 2} />
    </group>
  );
};

// ── Net, posts, tape ────────────────────────────────────────────────────────────────────────────
const Net: React.FC = () => {
  const mesh = useMemo(() => {
    const t = canvasTex(1024, 96, (g) => {
      g.clearRect(0, 0, 1024, 96);
      g.strokeStyle = "rgba(20,24,22,0.95)";
      g.lineWidth = 1.4;
      for (let x = 0; x <= 1024; x += 6) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 96);
        g.stroke();
      }
      for (let y = 0; y <= 96; y += 6) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(1024, y);
        g.stroke();
      }
    });
    return t;
  }, []);
  const w = 12.8;
  return (
    <group>
      <mesh position={[0, 0.49, 0]}>
        <planeGeometry args={[w, 0.92]} />
        <meshStandardMaterial map={mesh} transparent alphaTest={0.2} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* white tape, sagging to 0.914 m at the centre strap */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[w, 0.06, 0.02]} />
        <meshStandardMaterial color={COURT.line} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[0.05, 0.94, 0.012]} />
        <meshStandardMaterial color={COURT.line} roughness={0.6} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 6.4, 0.535, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 1.07, 16]} />
          <meshStandardMaterial color={COURT.wall} roughness={0.35} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// ── Back walls with the AUDIRA board, stands beyond ─────────────────────────────────────────────
const wallTex = (label: string) =>
  canvasTex(2048, 256, (g) => {
    g.fillStyle = COURT.wall;
    g.fillRect(0, 0, 2048, 256);
    g.fillStyle = COURT.wallTrim;
    g.fillRect(0, 0, 2048, 18);
    g.fillRect(0, 238, 2048, 18);
    g.font = "800 132px EP03Barlow, Manrope, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const xm of [-3.2, 3.2]) {
      const x = 1024 + xm * 102.4;
      g.fillStyle = "#e9efe6";
      g.fillText(label, x, 150);
      g.fillStyle = B.cyan;
      g.fillRect(x - 150, 214, 300, 8);
    }
  });

const Wall: React.FC<{ z: number; label: string; flip?: boolean }> = ({ z, label, flip }) => {
  const tex = useMemo(() => wallTex(label), [label]);
  return (
    <mesh position={[0, 1.25, z]} rotation={[0, flip ? Math.PI : 0, 0]} receiveShadow>
      <planeGeometry args={[20, 2.5]} />
      <meshStandardMaterial map={tex} roughness={0.8} />
    </mesh>
  );
};

const SideWall: React.FC<{ x: number }> = ({ x }) => {
  const tex = useMemo(
    () =>
      canvasTex(4096, 240, (g) => {
        g.fillStyle = COURT.wall;
        g.fillRect(0, 0, 4096, 240);
        g.fillStyle = COURT.wallTrim;
        g.fillRect(0, 0, 4096, 14);
        g.font = "800 132px EP03Barlow, Manrope, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        for (let i = 0; i < 4; i++) {
          g.fillStyle = "#e9efe6";
          g.fillText("AUDIRA", 512 + i * 1024, 126);
          g.fillStyle = B.cyan;
          g.fillRect(512 + i * 1024 - 170, 196, 340, 7);
        }
      }),
    [],
  );
  return (
    <mesh position={[x, 1.0, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[34, 2.0]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  );
};

// ── Old courtside scoreboard (the one that froze at 47–47) ──────────────────────────────────────
export const Scoreboard: React.FC<{ position: [number, number, number]; rotY?: number; top: string; bottom: string; glitch?: number; off?: number }> = ({ position, rotY = 0, top, bottom, glitch = 0, off = 0 }) => {
  const tex = useMemo(
    () =>
      canvasTex(512, 320, (g) => {
        g.fillStyle = "#0a0f0c";
        g.fillRect(0, 0, 512, 320);
        g.font = "600 64px EP03Barlow, Manrope, sans-serif";
        g.textBaseline = "middle";
        g.fillStyle = "#f2e7c4";
        g.fillText("ISNER", 34, 96);
        g.fillText("MAHUT", 34, 224);
        g.font = "800 120px EP03Barlow, Manrope, sans-serif";
        g.textAlign = "right";
        g.fillStyle = glitch > 0.5 ? "#ff5a3c" : "#ffcf4a";
        g.fillText(top, 478, 96);
        g.fillText(bottom, 478, 224);
        g.fillStyle = "rgba(0,0,0,0.25)";
        for (let y = 0; y < 320; y += 4) g.fillRect(0, y, 512, 2);
      }),
    [top, bottom, glitch],
  );
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[2.3, 1.5, 0.22]} />
        <meshStandardMaterial color="#1b2a22" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.7, 0.115]}>
        <planeGeometry args={[2.05, 1.28]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.9 * (1 - off)} color={off > 0.5 ? "#0a0c0b" : "#ffffff"} roughness={0.4} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.8, 0.5, -0.02]}>
          <cylinderGeometry args={[0.05, 0.05, 1.0, 10]} />
          <meshStandardMaterial color="#1b2a22" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// ── Dusk sky dome ───────────────────────────────────────────────────────────────────────────────
export type SkyColors = { top: string; mid: string; low: string; horizon: string };
export const DUSK_SKY: SkyColors = { top: COURT.skyTop, mid: COURT.skyMid, low: COURT.skyLow, horizon: COURT.horizon };
const Sky: React.FC<{ c: SkyColors }> = ({ c }) => {
  const tex = useMemo(
    () =>
      canvasTex(16, 512, (g) => {
        const grad = g.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, c.top);
        grad.addColorStop(0.42, c.mid);
        grad.addColorStop(0.47, c.low);
        grad.addColorStop(0.5, c.horizon);
        grad.addColorStop(0.53, "#2a2230");
        grad.addColorStop(1, "#0e0f14");
        g.fillStyle = grad;
        g.fillRect(0, 0, 16, 512);
      }),
    [c],
  );
  return (
    <mesh>
      <sphereGeometry args={[160, 32, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
};

// ── Racket + ball ───────────────────────────────────────────────────────────────────────────────
export const Racket: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.016, 0.018, 0.26, 10]} />
      <meshStandardMaterial color="#20242a" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.47, 0]} castShadow>
      <torusGeometry args={[0.15, 0.012, 8, 32]} />
      <meshStandardMaterial color="#e8e8ea" roughness={0.3} metalness={0.5} />
    </mesh>
    <mesh position={[0, 0.47, 0]} scale={[1, 1.25, 1]}>
      <circleGeometry args={[0.145, 32]} />
      <meshStandardMaterial color="#d9dccf" transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export const Ball: React.FC<{ position: [number, number, number]; r?: number }> = ({ position, r = 0.045 }) => (
  <mesh position={position} castShadow>
    <sphereGeometry args={[r, 20, 14]} />
    <meshStandardMaterial color="#d7f03a" emissive="#9ab31a" emissiveIntensity={0.35} roughness={0.85} />
  </mesh>
);

// ── Players ─────────────────────────────────────────────────────────────────────────────────────
const WHITE = { top: "#f2f0ea", bottom: "#f2f0ea", outfit: "onePiece" as const, hairStyle: 0 as const };
export const ISNER_LOOK = { ...WHITE, skin: "#e6b28c", hair: "#5a3a22", height: 1.05, build: 0.94 };
export const MAHUT_LOOK = { ...WHITE, skin: "#d09a6c", hair: "#1b1411", height: 0.98, build: 1.0 };

/** Serve at the top of the toss: left arm up, racket arm cocked behind the head, knees loaded. */
export const servePose = (k = 1): Pose => ({
  body: [0, 0, 0],
  lift: LEG_LENGTH - 0.06 * k,
  spine: [-0.22 * k, 0.35 * k, 0.12 * k],
  head: [-0.45 * k, 0, 0],
  ls: [-2.75 * k, 0, 0.2],
  le: -0.05,
  rs: [0.2, -1.4 * k, -1.7 * k],
  re: -1.9 * k,
  lh: [-0.3 * k, 0, 0.08],
  lk: 0.45 * k,
  rh: [0.25 * k, 0, -0.08],
  rk: 0.55 * k,
});

/** Ready stance (receiver): crouched, weight forward, racket in front. */
export const readyPose = (): Pose => ({
  body: [0, 0, 0],
  lift: LEG_LENGTH - 0.12,
  spine: [0.35, 0, 0],
  head: [-0.3, 0, 0],
  ls: [-0.7, 0, 0.25],
  le: -1.0,
  rs: [-0.7, 0, -0.25],
  re: -1.0,
  lh: [-0.45, 0, 0.2],
  lk: 0.8,
  rh: [-0.45, 0, -0.2],
  rk: 0.8,
});

export const Player: React.FC<{ f: number; seed: number; look: object; pose: Pose; position: [number, number, number]; heading: number; scale: number }> = ({ f, seed, look, pose, position, heading, scale }) => (
  <ToyPerson f={f} seed={seed} look={look} poseOverride={pose} position={position} heading={heading} scale={scale} />
);

// ── Lights ──────────────────────────────────────────────────────────────────────────────────────
export const DuskLights: React.FC = () => (
  <>
    <hemisphereLight args={["#7d86b8", "#1d2a18", 0.55]} />
    {/* low warm sun from behind the far stand, rim-lights the players */}
    <directionalLight position={[-14, 6, -30]} intensity={2.4} color="#ffb070" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={1} shadow-camera-far={80} shadow-bias={-0.0004} />
    {/* broadcast key: warm, from the camera side */}
    <directionalLight position={[8, 10, 24]} intensity={1.15} color="#ffe2c4" />
    {/* cool fill, left */}
    <directionalLight position={[-12, 5, 10]} intensity={0.6} color="#90caf9" />
  </>
);

export const CourtSet: React.FC<{ f: number; wear?: number; scoreTop?: string; scoreBottom?: string; glitch?: number; boardOff?: number; sky?: SkyColors; fog?: string; fogNear?: number; fogFar?: number; children?: React.ReactNode }> = ({ wear = 1, scoreTop = "47", scoreBottom = "47", glitch = 0, boardOff = 0, sky = DUSK_SKY, fog = "#2a2440", fogNear = 26, fogFar = 70, children }) => (
  <group>
    <Sky c={sky} />
    <fog attach="fog" args={[fog, fogNear, fogFar]} />
    <Grass wear={wear} />
    <Lines />
    <Net />
    <Wall z={-18} label="AUDIRA" />
    <Wall z={18} label="AUDIRA" flip />
    <SideWall x={8.8} />
    <SideWall x={-8.8} />
    <Scoreboard position={[-7.4, 0, -16.4]} rotY={0.3} top={scoreTop} bottom={scoreBottom} glitch={glitch} off={boardOff} />
    {children}
    {/* stands beyond the walls (catalog GLB) */}
    <Glb id="stand-roof-run-cfd457" position={[0, 0, -23]} height={7} />
    <Glb id="stand-roof-run-cfd457" position={[-13.5, 0, -2]} rotation={[0, Math.PI / 2, 0]} height={6} />
    <Glb id="stand-roof-run-cfd457" position={[13.5, 0, -2]} rotation={[0, -Math.PI / 2, 0]} height={6} />
  </group>
);
