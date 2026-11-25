// EP02 — VINTAGEFORGE. St. Louis 1904 Olympic marathon: a dusty Missouri country road at 32 °C.
// A museum-diorama look: sepia sky, dirt road with ruts, split-rail fences, telegraph poles, a dead
// cottonwood, one early motor car kicking up dust. Runners are stylised toy figures (no real faces,
// no logos). Brand lives in the world: the wooden mile post reads "AUDIRA".
import React, { useMemo } from "react";
import * as THREE from "three";
import { Model as Glb } from "./Model.tsx";
import { ToyPerson, LEG_LENGTH, type Pose } from "../../core/polish/Person.tsx";
import { VINTAGE_PALETTE as VP } from "../../kits/vintageforge/lib/palette.ts";

type V3 = [number, number, number];

export const SEPIA = {
  sky: "#e9d6ae",
  skyLow: "#d9b98a",
  dirt: "#b48d5f",
  road: "#c9a777",
  rut: "#8f6a43",
  grass: "#9c8a55",
  dust: "#e3c896",
};

export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
};

export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** Running stride, hand-keyed: forward lean, high knees, bent elbows. `tired` drops the head and arms. */
export function runPose(f: number, seed = 1, tired = 0): Pose {
  const w = (f / 60) * Math.PI * 2 * 1.3 + seed;
  const s = Math.sin(w);
  return {
    body: [0.16 + tired * 0.1, 0, Math.sin(w) * 0.03],
    lift: LEG_LENGTH - 0.02 + Math.abs(Math.cos(w)) * 0.05,
    spine: [0.1 + tired * 0.12, -s * 0.12, 0],
    head: [tired * 0.35 - 0.12, s * 0.05, 0],
    ls: [s * (0.95 - tired * 0.4), 0, 0.14 + tired * 0.1], le: -1.35 + tired * 0.5,
    rs: [-s * (0.95 - tired * 0.4), 0, -0.14 - tired * 0.1], re: -1.35 + tired * 0.5,
    lh: [-s * 0.85, 0, 0.03], lk: Math.max(0, s) * 1.25 + 0.15,
    rh: [s * 0.85, 0, -0.03], rk: Math.max(0, -s) * 1.25 + 0.15,
  };
}

/** Period runner look: white vest, dark knee-length trousers, short hair. */
export const RUNNER_LOOK = { outfit: "casual" as const, top: "#efe6d2", bottom: "#3b2818", hairStyle: 0 as const, height: 1 };

export const Sky: React.FC = () => {
  const tex = useMemo(
    () =>
      canvasTex(512, 1024, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 1024);
        gr.addColorStop(0, "#d8bf92");
        gr.addColorStop(0.55, SEPIA.sky);
        gr.addColorStop(1, "#f1dfb8");
        g.fillStyle = gr;
        g.fillRect(0, 0, 512, 1024);
        // heat-haze sun disc, high right
        const sun = g.createRadialGradient(380, 260, 10, 380, 260, 260);
        sun.addColorStop(0, "rgba(255,246,220,0.95)");
        sun.addColorStop(0.25, "rgba(255,236,196,0.45)");
        sun.addColorStop(1, "rgba(255,236,196,0)");
        g.fillStyle = sun;
        g.fillRect(0, 0, 512, 1024);
        // engraving hatch lines, very faint
        g.strokeStyle = "rgba(59,40,24,0.05)";
        for (let y = 0; y < 1024; y += 9) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(512, y + 30);
          g.stroke();
        }
      }),
    [],
  );
  return (
    <mesh position={[0, 14, -60]}>
      <planeGeometry args={[160, 60]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  );
};

export const Ground: React.FC = () => {
  const dirt = useMemo(
    () =>
      canvasTex(
        512,
        512,
        (g) => {
          g.fillStyle = SEPIA.grass;
          g.fillRect(0, 0, 512, 512);
          const r = rng(11);
          for (let i = 0; i < 2600; i++) {
            const v = r();
            g.fillStyle = v < 0.5 ? "rgba(70,52,30,0.18)" : "rgba(235,214,170,0.2)";
            g.fillRect(r() * 512, r() * 512, 2 + r() * 4, 1 + r() * 2);
          }
        },
        [24, 24],
      ),
    [],
  );
  const road = useMemo(
    () =>
      canvasTex(
        256,
        1024,
        (g) => {
          g.fillStyle = SEPIA.road;
          g.fillRect(0, 0, 256, 1024);
          const r = rng(5);
          for (let i = 0; i < 1800; i++) {
            g.fillStyle = r() < 0.5 ? "rgba(120,88,54,0.22)" : "rgba(244,226,190,0.25)";
            g.fillRect(r() * 256, r() * 1024, 2 + r() * 5, 1 + r() * 3);
          }
          // two wheel ruts
          for (const x of [70, 186]) {
            const gr = g.createLinearGradient(x - 16, 0, x + 16, 0);
            gr.addColorStop(0, "rgba(143,106,67,0)");
            gr.addColorStop(0.5, "rgba(120,86,52,0.55)");
            gr.addColorStop(1, "rgba(143,106,67,0)");
            g.fillStyle = gr;
            g.fillRect(x - 16, 0, 32, 1024);
          }
          // soft verges
          const e = g.createLinearGradient(0, 0, 256, 0);
          e.addColorStop(0, "rgba(156,138,85,0.9)");
          e.addColorStop(0.1, "rgba(156,138,85,0)");
          e.addColorStop(0.9, "rgba(156,138,85,0)");
          e.addColorStop(1, "rgba(156,138,85,0.9)");
          g.fillStyle = e;
          g.fillRect(0, 0, 256, 1024);
        },
        [1, 8],
      ),
    [],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={dirt} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} receiveShadow>
        <planeGeometry args={[3.4, 90]} />
        <meshStandardMaterial map={road} roughness={0.95} />
      </mesh>
    </group>
  );
};

/** Low rolling hills on the horizon (the course had seven climbs). */
export const Hills: React.FC = () => (
  <group>
    {[
      [-22, -42, 16, 3.2],
      [6, -48, 20, 4.2],
      [30, -40, 14, 2.6],
      [-6, -34, 10, 1.8],
    ].map(([x, z, r, h], i) => (
      <mesh key={i} position={[x, -0.2, z]} scale={[1, h / r, 0.6]}>
        <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={i % 2 ? "#a99766" : "#b6a272"} roughness={1} />
      </mesh>
    ))}
  </group>
);

/** One soft dust puff: a camera-facing sprite. Secondary effect only, never the subject. */
const dustTex = (() => {
  let t: THREE.Texture | null = null;
  return () =>
    (t ??= canvasTex(128, 128, (g) => {
      const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      gr.addColorStop(0, "rgba(240,220,180,0.9)");
      gr.addColorStop(0.5, "rgba(228,204,158,0.45)");
      gr.addColorStop(1, "rgba(228,204,158,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    }));
})();

export const DustCloud: React.FC<{ position: V3; f: number; spread?: number; count?: number; seed?: number; opacity?: number; facing?: number }> = ({
  position,
  f,
  facing = 0,
  spread = 1.6,
  count = 14,
  seed = 3,
  opacity = 0.75,
}) => {
  const puffs = useMemo(() => {
    const r = rng(seed * 101 + 7);
    return Array.from({ length: count }, () => ({ x: (r() - 0.5) * spread, y: r() * spread * 0.45, z: -r() * spread * 1.6, s: 0.6 + r() * 1.1, p: r() }));
  }, [count, spread, seed]);
  const tex = dustTex();
  return (
    <group position={position}>
      {puffs.map((p, i) => {
        const grow = 1 + ((f / 60 + p.p * 3) % 3) * 0.12;
        return (
          <mesh key={i} position={[p.x, p.y + 0.3, p.z]} rotation={[0, facing, 0]} scale={[p.s * grow, p.s * grow * 0.8, 1]} renderOrder={10}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} transparent opacity={opacity * (0.55 + p.p * 0.45)} depthWrite={false} color={SEPIA.dust} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Wooden mile post with an engraved board: brand inside the scene. */
export const MilePost: React.FC<{ position: V3; rotation?: number; top?: string; bottom?: string }> = ({
  position,
  rotation = 0,
  top = "AUDIRA",
  bottom = "ST. LOUIS · 1904",
}) => {
  const tex = useMemo(
    () =>
      canvasTex(512, 256, (g) => {
        g.fillStyle = "#7a5634";
        g.fillRect(0, 0, 512, 256);
        g.strokeStyle = "rgba(40,26,14,0.35)";
        for (let y = 8; y < 256; y += 14) {
          g.beginPath();
          g.moveTo(0, y);
          g.bezierCurveTo(170, y + 6, 340, y - 6, 512, y + 3);
          g.stroke();
        }
        g.strokeStyle = "#c5a059";
        g.lineWidth = 6;
        g.strokeRect(14, 14, 484, 228);
        g.fillStyle = "#f3ead6";
        g.textAlign = "center";
        g.font = "bold 104px Georgia, serif";
        g.fillText(top, 256, 132);
        g.font = "bold 44px Georgia, serif";
        g.fillStyle = "#e7c98a";
        g.fillText(bottom, 256, 206);
      }),
    [top, bottom],
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.09, 1.1, 0.09]} />
        <meshStandardMaterial color="#5a3d22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, 0.05]} castShadow>
        <boxGeometry args={[0.84, 0.42, 0.04]} />
        <meshStandardMaterial attach="material-0" color="#5a3d22" />
        <meshStandardMaterial attach="material-1" color="#5a3d22" />
        <meshStandardMaterial attach="material-2" color="#5a3d22" />
        <meshStandardMaterial attach="material-3" color="#5a3d22" />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.85} />
        <meshStandardMaterial attach="material-5" color="#5a3d22" />
      </mesh>
    </group>
  );
};

/**
 * 1904 motor car: the catalog buckboard (spoked wheels, spare wheel, water can) with the horse shaft
 * and cargo hidden, plus a curved dash, brass lamps and a steering wheel — the curved-dash runabout
 * silhouette of the era. Front faces +z. `dash` = z of the dash in the car's own frame.
 */
const CAR_HIDE = ["steer-front-mesh", "load-mesh", "feed-bag-mesh"];
export const CAR_DIM = { height: 1.0, dashZ: 0.95, dashY: 0.5, seatZ: 0.55, seatY: 0.62, halfW: 0.36 };
export const MotorCar: React.FC<{ position?: V3; rotation?: number }> = ({ position = [0, 0, 0], rotation = 0 }) => {
  const d = CAR_DIM;
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: VP.agedGold, metalness: 0.9, roughness: 0.3, envMapIntensity: 2.5 }), []);
  const lacquer = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a1a10", metalness: 0.2, roughness: 0.35 }), []);
  const leather = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b2e1f", roughness: 0.7 }), []);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Glb id="buckboard-wagon-59ec16" height={d.height} hide={CAR_HIDE} />
      {/* curved dash: a bent lacquered panel */}
      <mesh position={[0, d.dashY, d.dashZ]} rotation={[-0.3, 0, 0]} material={lacquer} castShadow>
        <boxGeometry args={[d.halfW * 1.9, 0.2, 0.03]} />
      </mesh>
      {/* front axle (replaces the hidden shaft assembly) */}
      <mesh position={[0, 0.2, d.dashZ - 0.05]} rotation={[0, 0, Math.PI / 2]} material={lacquer}>
        <cylinderGeometry args={[0.025, 0.025, d.halfW * 2.15, 10]} />
      </mesh>
      {/* brass lamps */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * d.halfW, d.dashY + 0.08, d.dashZ + 0.06]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={brass} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.1, 18]} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <circleGeometry args={[0.05, 18]} />
            <meshStandardMaterial color="#fff3d0" emissive="#ffdc90" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* steering column + wheel */}
      <mesh position={[0.14, d.seatY + 0.12, d.dashZ - 0.18]} rotation={[0.5, 0, 0]} material={brass}>
        <cylinderGeometry args={[0.014, 0.014, 0.36, 8]} />
      </mesh>
      <mesh position={[0.14, d.seatY + 0.28, d.dashZ - 0.28]} rotation={[0.5 + Math.PI / 2, 0, 0]} material={lacquer} castShadow>
        <torusGeometry args={[0.1, 0.014, 8, 24]} />
      </mesh>
      {/* tufted bench seat */}
      <mesh position={[0, d.seatY, d.seatZ]} material={leather} castShadow>
        <boxGeometry args={[d.halfW * 1.9, 0.1, 0.3]} />
      </mesh>
      <mesh position={[0, d.seatY + 0.16, d.seatZ - 0.15]} rotation={[-0.15, 0, 0]} material={leather} castShadow>
        <boxGeometry args={[d.halfW * 1.9, 0.3, 0.07]} />
      </mesh>
    </group>
  );
};

const darkBark = (m: THREE.MeshStandardMaterial) => {
  m.color.multiplyScalar(0.55);
};

/** Roadside dressing along the course, from catalog GLBs. */
export const Roadside: React.FC = () => (
  <group>
    {[-2, -8, -14, -20, -26, -32].map((z, i) => (
      <Glb key={`fl${i}`} id="split-rail-fence-run-87da39" position={[-2.3, 0, z]} rotation={[0, Math.PI / 2, 0]} height={0.7} />
    ))}
    {[0, -6, -12, -18, -24, -30].map((z, i) => (
      <Glb key={`fr${i}`} id="split-rail-fence-run-87da39" position={[2.4, 0, z]} rotation={[0, Math.PI / 2, 0]} height={0.7} />
    ))}
    {[-4, -16, -28, -40].map((z, i) => (
      <Glb key={`tp${i}`} id="telegraph-pole-line-95e382" position={[3.3, 0, z]} rotation={[0, Math.PI / 2, 0]} height={3.6} />
    ))}
    <Glb id="dead-cottonwood-edbde8" position={[-14, 0, -18]} height={5.2} tint={darkBark} />
    <Glb id="windmill-pump-2993a4" position={[7.5, 0, -22]} rotation={[0, -0.6, 0]} height={5} />
    <Glb id="sagebrush-700b03" position={[-2.9, 0, 1.2]} height={0.45} />
    <Glb id="sagebrush-700b03" position={[3.0, 0, -3.5]} height={0.5} />
    <Glb id="sagebrush-700b03" position={[-3.4, 0, -6]} height={0.4} />
  </group>
);

export const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#fff1d2", "#8a6a44", 0.9]} />
    <directionalLight
      position={[6, 10, 4]}
      intensity={2.6}
      color="#fff0cf"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-5, 4, -8]} intensity={0.7} color="#d4875c" />
    <fog attach="fog" args={[SEPIA.sky, 14, 58]} />
  </>
);

export const RoadSet: React.FC<{ post?: boolean }> = ({ post = true }) => (
  <group>
    <Sky />
    <Ground />
    <Hills />
    <Roadside />
    {post && <MilePost position={[1.95, 0, 1.4]} rotation={-0.5} />}
  </group>
);

export { ToyPerson, VP };
