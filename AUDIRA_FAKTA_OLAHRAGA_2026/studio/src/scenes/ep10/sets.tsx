// EP10 film sets (VINTAGEFORGE museum diorama): Hershey, Pennsylvania, 2 March 1962.
// Old arena with a parquet court, hand-flipped wooden scoreboard, chocolate-factory town in thin March snow,
// courtside radio table, locker room, archive, and the closing "MUSEUM AUDIRA" vitrine.
// Figures are stylised ToyPerson toys (no real faces, no team logos, team names only as text).
// World scale: 1 unit ≈ 2 m (Wilt toy 1.08 tall ≈ 2.16 m, rim 1.48 ≈ 3.05 m).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Model as Glb } from "../ep02/Model.tsx";
import { canvasTex, rng, Sky, VP } from "../ep02/RoadSet.tsx";
import { Sign, ToyPerson, useBrass, useWood, type V3 } from "../ep02/sets.tsx";
import { LEG_LENGTH, poseAt, type Pose } from "../../core/polish/Person.tsx";

export { ToyPerson };

// ---------------------------------------------------------------- looks (cream = Warriors, dark brown = Knicks; no numbers, no logos)
export const WILT_LOOK = { outfit: "casual" as const, top: "#f1e7cf", bottom: "#efe3c6", hairStyle: 0 as const, hair: "#1b1411", skin: "#7a4e33", height: 1.08, build: 0.94 };
export const cream = (i: number) => ({ outfit: "casual" as const, top: "#e9dcc0", bottom: "#e2d4b6", hairStyle: 0 as const, hair: ["#2a1c14", "#432a1b", "#1b1411"][i % 3], skin: ["#f3cfb3", "#e6b28c", "#9a6646"][i % 3], height: 0.96 + (i % 3) * 0.02 });
export const dark = (i: number) => ({ outfit: "casual" as const, top: "#4a3020", bottom: "#3b2618", hairStyle: 0 as const, hair: ["#1b1411", "#432a1b", "#2a1c14"][i % 3], skin: ["#e6b28c", "#f3cfb3", "#b47a52"][i % 3], height: 0.95 + (i % 2) * 0.03 });
export const SUIT = { outfit: "casual" as const, top: "#3a2a1c", bottom: "#2a1d12", hairStyle: 0 as const, hair: "#2a1c14", skin: "#f3cfb3", height: 0.95 };

// ---------------------------------------------------------------- poses
export { poseAt };
const BASE = (): Pose => poseAt("stand", 0, 1);
/** Ball held at the chest, both forearms forward. */
export const holdPose = (f: number): Pose => ({ ...poseAt("stand", f, 2), ls: [-1.05, 0, 0.32], le: -1.25, rs: [-1.05, 0, -0.32], re: -1.25 });
/** Shooting: 0 = ball at the chest, 1 = arms extended up, release. */
export const shootPose = (f: number, k: number): Pose => {
  const h = holdPose(f);
  const u = { ...h, head: [-0.35, 0, 0] as V3, ls: [-2.75, 0, 0.12] as V3, le: -0.15, rs: [-2.75, 0, -0.12] as V3, re: -0.15, lift: LEG_LENGTH + 0.03 * k };
  const m = (a: number, b: number) => a + (b - a) * k;
  const v = (a: V3, b: V3): V3 => [m(a[0], b[0]), m(a[1], b[1]), m(a[2], b[2])];
  return { ...h, head: v(h.head, u.head), ls: v(h.ls, u.ls), le: m(h.le, u.le), rs: v(h.rs, u.rs), re: m(h.re, u.re), lift: m(h.lift, u.lift) };
};
/** Grabbing an opponent: both arms forward, leaning in (the deliberate foul). */
export const grabPose = (f: number): Pose => ({ ...BASE(), body: [0.22, 0, 0], spine: [0.15, 0, 0], ls: [-1.45, 0, 0.12 + 0.05 * Math.sin(f / 5)], le: -0.25, rs: [-1.45, 0, -0.12], re: -0.25 });
/** Fouled and stumbling, arms out for balance. */
export const stumblePose = (f: number): Pose => ({ ...BASE(), body: [-0.15, 0, 0.18 * Math.sin(f / 7)], ls: [0, 0, 1.2], le: -0.3, rs: [0, 0, -1.2], re: -0.3 });
/** Seated, holding a sheet of paper up at the chest. */
export const sitHoldPose = (f: number): Pose => ({ ...poseAt("sit", f, 3), ls: [-1.2, 0, 0.3], le: -0.9, rs: [-1.2, 0, -0.3], re: -0.9 });
/** Seated at a desk, writing. */
export const writePose = (f: number): Pose => ({ ...poseAt("sit", f, 5), head: [0.35, 0, 0], ls: [-0.9, 0, 0.25], le: -1.1, rs: [-0.95, 0.2, -0.25], re: -1.05 + 0.08 * Math.sin(f / 3) });

// ---------------------------------------------------------------- materials / tints (stable identities: Model memoises on them)
export const tintBoard = (m: THREE.MeshStandardMaterial) => {
  if (m.transparent || m.opacity < 1) {
    m.color.set("#f6ecd6");
    m.opacity = 0.35;
    m.roughness = 0.1;
    return;
  }
  m.color.set("#b98a55");
  m.roughness = 0.6;
  m.metalness = 0.25;
};
export const tintRadio = (m: THREE.MeshStandardMaterial) => {
  m.color.multiplyScalar(0.75).lerp(new THREE.Color("#6b4a2c"), 0.45);
  m.roughness = 0.55;
};
export const tintBrick = (m: THREE.MeshStandardMaterial) => {
  m.color.set("#7a4632");
  m.roughness = 0.95;
};
export const tintShelf = (m: THREE.MeshStandardMaterial) => {
  m.color.set("#6b4426");
  m.roughness = 0.8;
};
export const tintBrass = (m: THREE.MeshStandardMaterial) => {
  m.color.set(VP.agedGold);
  m.metalness = 0.85;
  m.roughness = 0.32;
};

const serifBoard = (bg: string, ink: string, lines: [string, number, number][], border = true) => (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  if (border) {
    g.strokeStyle = ink;
    g.lineWidth = Math.min(W, H) * 0.035;
    g.strokeRect(H * 0.04, H * 0.04, W - H * 0.08, H - H * 0.08);
  }
  g.fillStyle = ink;
  g.textAlign = "center";
  for (const [txt, size, y] of lines) {
    // fit inside the border: shrink the font when the text is wider than 86 % of the board
    let px = Math.round(H * size);
    g.font = `bold ${px}px Georgia, serif`;
    const tw = g.measureText(txt).width;
    if (tw > W * 0.86) px = Math.floor((px * W * 0.86) / tw);
    g.font = `bold ${px}px Georgia, serif`;
    g.fillText(txt, W / 2, H * y);
  }
};

// ================================================================= BASKETBALL
let ballTex: THREE.CanvasTexture | null = null;
export const Ball: React.FC<{ position: V3; r?: number; spin?: number }> = ({ position, r = 0.085, spin = 0 }) => {
  if (!ballTex)
    ballTex = canvasTex(256, 128, (g) => {
      g.fillStyle = "#a8582c";
      g.fillRect(0, 0, 256, 128);
      const rr = rng(5);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = rr() < 0.5 ? "rgba(60,30,14,0.25)" : "rgba(220,150,100,0.18)";
        g.fillRect(rr() * 256, rr() * 128, 2, 2);
      }
      g.strokeStyle = "#2a160c";
      g.lineWidth = 4;
      for (const x of [0, 64, 128, 192]) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 128);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(0, 64);
      g.lineTo(256, 64);
      g.stroke();
    });
  return (
    <mesh position={position} rotation={[spin, spin * 0.4, 0]} castShadow>
      <sphereGeometry args={[r, 24, 16]} />
      <meshStandardMaterial map={ballTex} roughness={0.75} />
    </mesh>
  );
};

// ================================================================= ARENA (court along x, hoops at x = ±HOOP_X)
export const HOOP_X = 7.2;
export const RIM_Y = 1.48;
/** Rim centre for the hoop at side s (+1 right, −1 left). */
export const rimAt = (s: 1 | -1): V3 => [s * (HOOP_X - 0.26), RIM_Y, 0];
export const FT_X = HOOP_X - 2.2; // free-throw line, right hoop

const courtTex = () =>
  canvasTex(2048, 1088, (g) => {
    const W = 2048, H = 1088;
    const r = rng(31);
    // parquet planks along x
    for (let y = 0; y < H; y += 17) {
      let x = -r() * 200;
      while (x < W) {
        const len = 140 + r() * 220;
        const l = 0.82 + r() * 0.25;
        g.fillStyle = `rgb(${Math.round(196 * l)},${Math.round(150 * l)},${Math.round(98 * l)})`;
        g.fillRect(x, y, len - 2, 15);
        x += len;
      }
    }
    g.fillStyle = "rgba(70,40,18,0.12)";
    for (let i = 0; i < 2000; i++) g.fillRect(r() * W, r() * H, 3, 1);
    // lines (cream paint, slightly worn)
    const X = (x: number) => ((x + 8) / 16) * W;
    const Z = (z: number) => ((z + 4.25) / 8.5) * H;
    g.strokeStyle = "rgba(246,236,214,0.85)";
    g.lineWidth = 7;
    g.strokeRect(X(-7.5), Z(-3.8), X(7.5) - X(-7.5), Z(3.8) - Z(-3.8));
    g.beginPath();
    g.moveTo(X(0), Z(-3.8));
    g.lineTo(X(0), Z(3.8));
    g.stroke();
    g.beginPath();
    g.ellipse(X(0), Z(0), (0.9 / 16) * W, (0.9 / 8.5) * H, 0, 0, Math.PI * 2);
    g.stroke();
    for (const s of [1, -1]) {
      const base = s * 7.5, ft = s * (7.5 - 2.5);
      // narrow 1962 lane, painted darker
      g.fillStyle = "rgba(122,52,30,0.55)";
      g.fillRect(Math.min(X(base), X(ft)), Z(-0.9), Math.abs(X(base) - X(ft)), Z(0.9) - Z(-0.9));
      g.strokeRect(Math.min(X(base), X(ft)), Z(-0.9), Math.abs(X(base) - X(ft)), Z(0.9) - Z(-0.9));
      g.beginPath();
      g.ellipse(X(ft), Z(0), (0.9 / 16) * W, (0.9 / 8.5) * H, 0, 0, Math.PI * 2);
      g.stroke();
    }
  });

/** Pendant lamp with a real point light. */
const Pendant: React.FC<{ position: V3; i?: number }> = ({ position, i = 1 }) => (
  <group position={position}>
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.008, 0.008, 2.4, 4]} />
      <meshStandardMaterial color="#1e1610" />
    </mesh>
    <mesh>
      <coneGeometry args={[0.32, 0.22, 20, 1, true]} />
      <meshStandardMaterial color="#5a4128" metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -0.06, 0]}>
      <sphereGeometry args={[0.07, 12, 8]} />
      <meshBasicMaterial color="#fff0c8" toneMapped={false} />
    </mesh>
    <pointLight position={[0, -0.15, 0]} intensity={7 * i} distance={9} decay={1.5} color="#ffd59a" />
  </group>
);

export const ArenaLights: React.FC<{ fogNear?: number; fogFar?: number }> = ({ fogNear = 7, fogFar = 26 }) => (
  <>
    <hemisphereLight args={["#ffe2b0", "#3a2616", 0.45]} />
    <directionalLight position={[3, 9, 6]} intensity={0.8} color="#ffe6bf" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0004} />
    {/* rim light from behind the stands */}
    <directionalLight position={[-4, 5, -9]} intensity={1.5} color="#e0965f" />
    <fog attach="fog" args={["#2e2014", fogNear, fogFar]} />
  </>
);

/** Hoop on a wooden post: catalog backboard GLB (wall frame hidden), facing the court centre. */
export const Hoop: React.FC<{ s: 1 | -1 }> = ({ s }) => {
  const post = useWood(61, "#4a3220");
  return (
    <group>
      <group position={[s * HOOP_X, RIM_Y - 0.3, 0]} rotation={[0, -s * Math.PI / 2, 0]}>
        <Glb id="basketball-backboard-2624e9" height={1.0} hide={["wall-frame"]} tint={tintBoard} />
      </group>
      {/* rim ring (rust orange) */}
      <mesh position={rimAt(s)} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.009, 8, 32]} />
        <meshStandardMaterial color="#b4532a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[s * (HOOP_X + 0.55), 1.15, 0]} material={post} castShadow>
        <boxGeometry args={[0.12, 2.3, 0.12]} />
      </mesh>
      <mesh position={[s * (HOOP_X + 0.3), 1.62, 0]} material={post} castShadow>
        <boxGeometry args={[0.55, 0.07, 0.07]} />
      </mesh>
    </group>
  );
};

/** Hand-flipped wooden scoreboard ("POIN WILT"): one number card that flips when `value` changes. */
export const Scoreboard: React.FC<{ value: string; flip: number; position?: V3; scale?: number }> = ({ value, flip, position = [0, 2.75, -5.6], scale = 1 }) => {
  const wood = useWood(71, "#5a3b22");
  const brass = useBrass();
  return (
    <group position={position} scale={scale}>
      <mesh material={wood} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.55, 0.1]} />
      </mesh>
      <Sign w={2.3} h={0.34} position={[0, 0.56, 0.06]} dep="sb-head" draw={serifBoard("#e9dcbc", VP.engravingBrown, [["POIN WILT", 0.62, 0.76]])} />
      {/* number card on brass hooks, flips about its top edge */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.33, 0.08]} material={brass}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 10]} />
        </mesh>
      ))}
      <group position={[0, 0.33, 0.09]} rotation={[flip * Math.PI, 0, 0]}>
        <Sign w={1.9} h={0.98} position={[0, -0.5, 0]} dep={`sb-${value}`} px={640} draw={serifBoard("#f3ead6", "#1e1b18", [[value, 0.82, 0.8]])} />
      </group>
      <Sign w={1.0} h={0.16} position={[0, -0.68, 0.06]} dep="sb-foot" draw={serifBoard("#3b2818", VP.agedGold, [["HERSHEY · 1962", 0.66, 0.74]], false)} />
    </group>
  );
};

/** Back stands: stepped wooden bleachers along z < 0 with a toy crowd. */
const Bleachers: React.FC<{ t: number; cheer: number; count?: number; z0?: number }> = ({ t, cheer, count = 30, z0 = -4.7 }) => {
  const wood = useWood(81, "#6b4426");
  const crowd = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: count }, (_, i) => ({ x: -7.4 + r() * 14.8, row: i % 3, seed: 50 + i, skin: ["#f3cfb3", "#e6b28c", "#b47a52", "#7a4e33"][i % 4], top: ["#3b2818", "#5b4630", "#efe6d2", "#2a2018", "#7a3c26"][i % 5] }));
  }, [count]);
  return (
    <group>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[0, 0.16 + row * 0.32, z0 - 0.4 - row * 0.62]} material={wood} receiveShadow castShadow>
          <boxGeometry args={[17, 0.32 + row * 0.64, 0.62]} />
        </mesh>
      ))}
      {crowd.map((c, i) => (
        <ToyPerson key={i} f={t * 60 + i * 9} seed={c.seed} pose={cheer > 0.5 && i % 2 === 0 ? "cheer" : cheer > 0.2 && i % 3 === 0 ? "wave" : "stand"} position={[c.x, 0.32 + c.row * 0.64 - 0.32 + 0.32, z0 - 0.4 - c.row * 0.62]} heading={0} scale={0.78} look={{ outfit: "casual", skin: c.skin, top: c.top, bottom: "#2a1d12", hairStyle: 0 }} />
      ))}
    </group>
  );
};

/** The whole arena: floor, court, hoops, stands, rail with AUDIRA hoardings, scoreboard, pendants. */
export const ArenaSet: React.FC<{ t: number; cheer?: number; score: string; flip?: number; crowd?: number }> = ({ t, cheer = 0.3, score, flip = 0, crowd = 30 }) => {
  const court = useMemo(courtTex, []);
  const wall = useWood(91, "#3e2a1a");
  const rail = useWood(93, "#5a3d22");
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#3a2818" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 8.5]} />
        <meshStandardMaterial map={court} roughness={0.45} metalness={0.05} />
      </mesh>
      <Hoop s={1} />
      <Hoop s={-1} />
      {/* back wall + arched roof trusses */}
      <mesh position={[0, 3.2, -7.2]} material={wall} receiveShadow>
        <boxGeometry args={[30, 6.4, 0.2]} />
      </mesh>
      {[-8, -4, 0, 4, 8].map((x) => (
        <mesh key={x} position={[x, 5.6, -2]} rotation={[0, 0, 0]} material={rail}>
          <boxGeometry args={[0.14, 0.14, 12]} />
        </mesh>
      ))}
      <Bleachers t={t} cheer={cheer} count={crowd} />
      {/* rail + AUDIRA hoardings (brand inside the world) */}
      {[-6, 0, 6].map((x, i) => (
        <group key={i} position={[x, 0, -4.45]}>
          <mesh position={[0, 0.42, 0]} material={rail} castShadow>
            <boxGeometry args={[5.8, 0.05, 0.05]} />
          </mesh>
          <Sign w={i === 1 ? 1.6 : 2.2} h={0.36} position={[0, 0.2, 0.03]} dep={i === 1 ? "hoard-hy" : "hoard-au"} draw={serifBoard("#e9dcbc", VP.engravingBrown, [[i === 1 ? "HERSHEY ARENA" : "AUDIRA", 0.58, 0.72]])} />
        </group>
      ))}
      <Scoreboard value={score} flip={flip} />
      {[-5, 0, 5].map((x) => (
        <Pendant key={x} position={[x, 4.4, 0]} i={1.2} />
      ))}
      <Pendant position={[0, 4.3, -3.4]} />
    </group>
  );
};

/** Courtside radio table: field radio set + vintage microphone, announcer seated behind. */
export const RadioTable: React.FC<{ position: V3; rotation?: number }> = ({ position, rotation = 0 }) => {
  const desk = useWood(101, "#6b4426");
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.4, 0]} material={desk} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.05, 0.55]} />
      </mesh>
      {[[-0.6, -0.22], [0.6, -0.22], [-0.6, 0.22], [0.6, 0.22]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.19, z]} material={desk}>
          <boxGeometry args={[0.05, 0.38, 0.05]} />
        </mesh>
      ))}
      <Glb id="field-radio-set-b6f3fd" position={[0.3, 0.425, -0.02]} rotation={[0, -0.3, 0]} height={0.3} tint={tintRadio} />
      <Glb id="vintage-microphone-stand-c5ba82" position={[-0.25, 0.425, 0.05]} rotation={[0, 0.4, 0]} height={0.34} tint={tintBrass} />
      <Sign w={0.42} h={0.14} position={[-0.08, 0.5, 0.2]} rotation={[-0.3, 0, 0]} dep="radio-card" draw={serifBoard("#e9dcbc", VP.engravingBrown, [["RADIO", 0.7, 0.76]])} />
    </group>
  );
};

// ================================================================= TOWN (chocolate-factory town, thin March snow)
const brickTex = (seed: number) =>
  canvasTex(256, 256, (g) => {
    g.fillStyle = "#7a4632";
    g.fillRect(0, 0, 256, 256);
    const r = rng(seed);
    for (let y = 0; y < 256; y += 12)
      for (let x = (y / 12) % 2 ? -12 : 0; x < 256; x += 24) {
        const l = 0.8 + r() * 0.3;
        g.fillStyle = `rgb(${Math.round(132 * l)},${Math.round(74 * l)},${Math.round(52 * l)})`;
        g.fillRect(x + 1, y + 1, 22, 10);
      }
    // windows rows
    for (let y = 40; y < 256; y += 80)
      for (let x = 20; x < 256; x += 60) {
        g.fillStyle = "#2a1a10";
        g.fillRect(x, y, 30, 40);
        g.fillStyle = "rgba(255,206,130,0.85)";
        g.fillRect(x + 3, y + 3, 11, 16);
        g.fillRect(x + 16, y + 3, 11, 16);
      }
  }, [2, 1]);

const Factory: React.FC<{ position: V3; w: number; h: number; d: number; seed: number }> = ({ position, w, h, d, seed }) => {
  const tex = useMemo(() => brickTex(seed), [seed]);
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={tex} roughness={0.95} emissive="#ffb060" emissiveIntensity={0.05} />
      </mesh>
      {/* snow on the roof */}
      <mesh position={[0, h + 0.03, 0]} receiveShadow>
        <boxGeometry args={[w + 0.06, 0.06, d + 0.06]} />
        <meshStandardMaterial color="#ece3d2" roughness={1} />
      </mesh>
    </group>
  );
};

export const TownSet: React.FC<{ t: number }> = ({ t }) => {
  const snow = useMemo(
    () =>
      canvasTex(512, 512, (g) => {
        g.fillStyle = "#d9cdb4";
        g.fillRect(0, 0, 512, 512);
        const r = rng(3);
        for (let i = 0; i < 3000; i++) {
          g.fillStyle = r() < 0.6 ? "rgba(246,240,228,0.6)" : "rgba(120,96,70,0.2)";
          g.fillRect(r() * 512, r() * 512, 2 + r() * 5, 1 + r() * 3);
        }
      }, [16, 16]),
    [],
  );
  const road = useWood(111, "#5d4a38");
  const arena = useMemo(() => brickTex(12), []);
  return (
    <group>
      <Sky />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial map={snow} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 3]} receiveShadow material={road}>
        <planeGeometry args={[40, 2.2]} />
      </mesh>
      {/* chocolate factory: long brick blocks with stacks */}
      <Factory position={[-6.5, 0, -6]} w={7} h={2.6} d={3} seed={4} />
      <Factory position={[6.8, 0, -7]} w={6} h={3.2} d={3} seed={6} />
      <Factory position={[-2, 0, -12]} w={9} h={3.6} d={3} seed={8} />
      <Glb id="cowled-chimney-stack-de5055" position={[-8.2, 2.6, -6]} height={2.4} tint={tintBrick} />
      <Glb id="cowled-chimney-stack-de5055" position={[-4.8, 2.6, -6.2]} height={1.9} tint={tintBrick} />
      <Glb id="cowled-chimney-stack-de5055" position={[5.3, 3.2, -7]} height={2.6} tint={tintBrick} />
      <Glb id="chimney-roof-passage-90dedd" position={[-1.5, 3.6, -12]} height={1.4} tint={tintBrick} />
      <Sign w={3.4} h={0.5} position={[6.8, 2.6, -5.47]} dep="choc" draw={serifBoard("#e9dcbc", VP.engravingBrown, [["PABRIK COKELAT", 0.56, 0.72]])} />
      {/* the arena: barrel-vault hall at the end of the street */}
      <group position={[0.6, 0, -3.2]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 2.2, 3]} />
          <meshStandardMaterial map={arena} roughness={0.95} emissive="#ffb060" emissiveIntensity={0.06} />
        </mesh>
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1.5, 1.5, 4.6, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#5e4a3a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 3.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 4.7, 8, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#ece3d2" />
        </mesh>
        <Sign w={2.6} h={0.5} position={[0, 2.0, 1.52]} dep="arena-sign" emissive={0.4} draw={serifBoard("#f3ead6", VP.engravingBrown, [["ARENA · MALAM INI", 0.5, 0.7]])} />
        {/* lit doorway */}
        <mesh position={[0, 0.55, 1.51]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial color="#ffd391" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.8, 2.2]} intensity={6} distance={6} decay={1.6} color="#ffc782" />
      </group>
      {/* street lamps */}
      {[-3.2, 5.2].map((x) => (
        <group key={x} position={[x, 0, 1.6]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 1.8, 6]} />
            <meshStandardMaterial color="#1e1610" />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.8, 0]} intensity={2.4} distance={5} decay={1.6} color="#ffcf8a" />
        </group>
      ))}
      {/* people walking to the arena */}
      {Array.from({ length: 9 }, (_, i) => {
        const z = 5.5 - ((t * 0.32 + i * 0.9) % 6.2);
        const x = -0.4 + (i % 3) * 0.45 + Math.sin(i * 2.1) * 0.2;
        return <ToyPerson key={i} f={t * 60 + i * 11} seed={70 + i} pose="walk" position={[x, 0, z]} heading={Math.PI} scale={0.75} look={{ outfit: "casual", top: ["#3b2818", "#5b4630", "#2a2018", "#7a3c26"][i % 4], bottom: "#2a1d12", skin: ["#f3cfb3", "#e6b28c", "#b47a52"][i % 3], hairStyle: i % 4 === 3 ? 3 : 0 }} />;
      })}
    </group>
  );
};

// ================================================================= LOCKER ROOM
export const LockerRoom: React.FC = () => {
  const wall = useWood(121, "#4a3220");
  const bench = useWood(123, "#7a5634");
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6f6a58", metalness: 0.5, roughness: 0.5 }), []);
  return (
    <group>
      <mesh position={[0, 2, -1.4]} material={wall} receiveShadow>
        <boxGeometry args={[9, 4, 0.1]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.9} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} position={[-2.7 + i * 0.6, 0.95, -1.15]}>
          <mesh material={metal} castShadow receiveShadow>
            <boxGeometry args={[0.56, 1.9, 0.4]} />
          </mesh>
          {[0.6, 0.66, 0.72].map((y) => (
            <mesh key={y} position={[0, y, 0.205]}>
              <boxGeometry args={[0.3, 0.02, 0.01]} />
              <meshStandardMaterial color="#2a241c" />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.26, -0.45]} material={bench} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.06, 0.4]} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.12, -0.45]} material={bench}>
          <boxGeometry args={[0.06, 0.24, 0.36]} />
        </mesh>
      ))}
      {/* towel + jersey on hooks */}
      <mesh position={[-1.9, 1.35, -0.93]}>
        <boxGeometry args={[0.35, 0.5, 0.02]} />
        <meshStandardMaterial color="#efe6d2" roughness={1} />
      </mesh>
    </group>
  );
};

// ================================================================= ARCHIVE (radio, box score, framed photo, shelves)
export const ArchiveSet: React.FC = () => {
  const wall = useWood(131, "#3e2a1a");
  const desk = useWood(133, "#6b4426");
  const frame = useBrass();
  return (
    <group>
      <mesh position={[0, 2, -1.6]} material={wall} receiveShadow>
        <boxGeometry args={[9, 4, 0.1]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#2e2116" roughness={0.95} />
      </mesh>
      {[-2.3, -1.4, 1.4, 2.3].map((x, i) => (
        <Glb key={i} id="bookshelf-5e881a" position={[x, 0, -1.3]} height={2.0} tint={tintShelf} />
      ))}
      {/* desk */}
      <mesh position={[0, 0.42, 0]} material={desk} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.05, 0.9]} />
      </mesh>
      {[[-0.88, -0.4], [0.88, -0.4], [-0.88, 0.4], [0.88, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} material={desk}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
        </mesh>
      ))}
      <Glb id="field-radio-set-b6f3fd" position={[0.55, 0.445, -0.15]} rotation={[0, -0.5, 0]} height={0.34} tint={tintRadio} />
      {/* box score sheet */}
      <group position={[-0.35, 0.452, 0.15]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <Sign w={0.5} h={0.66} position={[0, 0, 0]} dep="boxscore" px={600} draw={paintBoxScore} />
      </group>
      {/* framed photo on an easel: the "100" sheet */}
      <group position={[-0.05, 0.47, -0.32]} rotation={[-0.25, 0.1, 0]}>
        <mesh position={[0, 0.27, -0.015]} material={frame} castShadow>
          <boxGeometry args={[0.46, 0.58, 0.03]} />
        </mesh>
        <Sign w={0.4} h={0.52} position={[0, 0.27, 0.002]} dep="photo" px={500} draw={paintPhoto} />
      </group>
    </group>
  );
};
export const paintBoxScore = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = "#eee2c4";
  g.fillRect(0, 0, W, H);
  g.fillStyle = VP.engravingBrown;
  g.textAlign = "center";
  g.font = `bold ${W * 0.085}px Georgia, serif`;
  g.fillText("BOX SCORE", W / 2, H * 0.1);
  g.font = `${W * 0.045}px Georgia, serif`;
  g.fillText("2 MARET 1962 · HERSHEY", W / 2, H * 0.16);
  g.fillRect(W * 0.06, H * 0.19, W * 0.88, H * 0.005);
  g.textAlign = "left";
  g.font = `bold ${W * 0.07}px Georgia, serif`;
  g.fillText("CHAMBERLAIN", W * 0.08, H * 0.29);
  g.textAlign = "right";
  g.font = `bold ${W * 0.12}px Georgia, serif`;
  g.fillText("100", W * 0.92, H * 0.3);
  g.textAlign = "left";
  g.font = `${W * 0.05}px Georgia, serif`;
  g.fillText("LEMPARAN BEBAS  28 / 32", W * 0.08, H * 0.38);
  const r = rng(77);
  for (let l = 0; l < 14; l++) {
    g.fillStyle = "rgba(59,40,24,0.32)";
    g.fillRect(W * 0.08, H * (0.45 + l * 0.035), W * (0.5 + r() * 0.3), H * 0.01);
  }
};
/** Stylised photo: a toy silhouette holding up a sheet that reads 100 (no real face). */
export const paintPhoto = (g: CanvasRenderingContext2D, W: number, H: number) => {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#6b5a46");
  gr.addColorStop(1, "#2e241a");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#1e1710";
  g.beginPath();
  g.ellipse(W * 0.5, H * 0.3, W * 0.12, H * 0.1, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(W * 0.26, H * 0.4, W * 0.48, H * 0.6);
  g.fillStyle = "#efe6d2";
  g.fillRect(W * 0.22, H * 0.5, W * 0.56, H * 0.28);
  g.fillStyle = "#1e1b18";
  g.textAlign = "center";
  g.font = `bold ${W * 0.22}px Georgia, serif`;
  g.fillText("100", W * 0.5, H * 0.72);
  g.strokeStyle = "#efe6d2";
  g.lineWidth = W * 0.03;
  g.strokeRect(W * 0.04, H * 0.03, W * 0.92, H * 0.94);
};
export const paintSheet100 = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = "#f1e7cf";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#1e1b18";
  g.textAlign = "center";
  g.font = `bold ${W * 0.46}px Georgia, serif`;
  g.fillText("100", W / 2, H * 0.66);
};

// ================================================================= MUSEUM AUDIRA vitrine (outro)
const Pedestal: React.FC<{ x: number; h: number; num: string; name: string; hero?: boolean }> = ({ x, h, num, name, hero }) => {
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: hero ? "#e6d8b8" : "#cdbd9c", roughness: 0.55, metalness: 0.02 }), [hero]);
  const brass = useBrass();
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, h / 2, 0]} material={stone} castShadow receiveShadow>
        <boxGeometry args={[0.9, h, 0.9]} />
      </mesh>
      <mesh position={[0, h + 0.02, 0]} material={brass} castShadow>
        <boxGeometry args={[0.96, 0.04, 0.96]} />
      </mesh>
      {/* the number as a raised brass-edged tablet on top */}
      <Sign w={0.82} h={0.56} position={[0, h + 0.33, 0]} dep={`ped-${num}`} px={600} draw={serifBoard(hero ? "#f3ead6" : "#e9dcbc", "#1e1b18", [[num, 0.72, 0.78]])} />
      <Sign w={0.78} h={0.16} position={[0, h - 0.15, 0.452]} dep={`pedn-${name}`} draw={serifBoard("#3b2818", VP.agedGold, [[name, 0.56, 0.72]], false)} />
    </group>
  );
};
export const MuseumSet: React.FC = () => {
  const wall = useWood(141, "#3a2616");
  return (
    <group>
      <mesh position={[0, 2.2, -1.6]} material={wall} receiveShadow>
        <boxGeometry args={[10, 4.4, 0.1]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#4a3422" roughness={0.6} metalness={0.05} />
      </mesh>
      <Sign w={3.0} h={0.46} position={[0, 2.75, -1.54]} dep="museum" emissive={0.15} draw={serifBoard("#e9dcbc", VP.engravingBrown, [["MUSEUM AUDIRA", 0.6, 0.72]])} />
      <Pedestal x={-1.15} h={0.83} num="83" name="ADEBAYO · 2026" />
      <Pedestal x={0} h={1.0} num="100" name="WILT · 1962" hero />
      <Pedestal x={1.15} h={0.81} num="81" name="KOBE · 2006" />
      {/* vitrine glass over the hero */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[1.0, 0.72, 1.0]} />
        <meshPhysicalMaterial color="#fff6e6" transparent opacity={0.12} roughness={0.05} metalness={0} transmission={0} />
      </mesh>
      {/* rope barrier */}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 0.9]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.8, 10]} />
            <meshStandardMaterial color={VP.agedGold} metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.62, 0.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 3.8, 8]} />
        <meshStandardMaterial color="#7a2a1c" roughness={0.8} />
      </mesh>
    </group>
  );
};
