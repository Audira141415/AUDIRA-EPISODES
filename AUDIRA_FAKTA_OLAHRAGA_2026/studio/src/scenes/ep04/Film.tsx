// EP04 film "Pit Stop F1 1,80 Detik" (TOYDIORAMA). Seven sets on one walnut toy stage, every cut on a VO section:
//   S1 hook          pit box (cover A pose): four wheels off/on, timer 0,00 → 1,80
//   S2 konteks       night track: the car runs down the straight into the pit lane, chip QATAR · 8 OKT 2023 · LAP 27
//   S3 pengembangan  pit box, low orbit: one role lit per beat (gunners, carriers, jacks, "TERLAMBAT")
//   S4 penjelasan    measuring table: 1,82 (navy, 2019) vs 1,80 (teal, 2023), then 13" vs 18" wheels on a ruler
//   S5 kontras       sepia 1957 pit: hammer on a wing nut, the nut rolls under the car, timer ≈ 30 DTK
//   S6 payoff        golden pit box: the car leaves, trophy shelf with one empty slot "BELUM", 1,80 DTK
//   S7 outro         teaser "BERIKUTNYA: RUMBLE IN THE JUNGLE" (the AUDIRA card comes from Root)
// Facts only from research/SOURCE_REGISTER.md. Generic liveries, no logos, toy figures without realistic faces.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Carrier, FrontJack, Gunner, LIVERY, PitLane, ToyF1, Wheel } from "./PitSet.tsx";
import { Model } from "./Model.tsx";
import { COVER_CAMS, CoverText } from "./Cover.tsx";
import tl from "./timeline.json";

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; start: number; end: number; words: Word[] };
const CLIPS = tl.clips as Clip[];
export const TOTAL = tl.total as number;
const SEC = (id: string) => CLIPS.find((c) => c.id === id)!;
/** Start of the n-th word in a section that starts with `prefix`. */
const W = (id: string, prefix: string, nth = 0) => SEC(id).words.filter((w) => w.w.startsWith(prefix))[nth]?.s ?? SEC(id).start;

// scene cuts: a scene starts a little before its section's first word
const CUT = {
  s2: SEC("konteks").start - 0.3,
  s3: SEC("pengembangan").start - 0.3,
  s4: SEC("penjelasan").start - 0.3,
  s5: SEC("kontras").start - 0.3,
  s6: SEC("payoff").start - 0.3,
  s7: SEC("outro").start - 0.3,
};
const BEAT = {
  hook20: W("hook", "dua"),
  hookAudira: W("hook", "AUDIRA"),
  lap: W("konteks", "Lap"),
  jam: W("konteks", "jam"),
  gunners: W("pengembangan", "Empat"),
  carriers: W("pengembangan", "Delapan"),
  jacks: W("pengembangan", "Jack"),
  late: W("pengembangan", "Satu"),
  diff: W("penjelasan", "selisihnya"),
  rim: W("penjelasan", "Dan"),
  nut: W("kontras", "Saat"),
  search: W("kontras", "Mencarinya"),
  won: W("kontras", "Fangio", 1),
  award: W("payoff", "Anehnya"),
  record: W("payoff", "Per"),
};

// ---------------------------------------------------------------- math
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
type Key = { t: number; pos: V3; target: V3; fov?: number };
const camAt = (t: number, ks: Key[]) => {
  if (t <= ks[0].t) return ks[0];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (t <= b.t) {
      const k = ease(seg(t, a.t, b.t));
      return { t, pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov ?? 32, b.fov ?? 32, k) };
    }
  }
  return ks[ks.length - 1];
};

// ---------------------------------------------------------------- S1 / S3 pit stop action
/** Real-time pit stop starting at t0: jacks up, wheels off, new wheels on, down. Returns car lift + wheel offsets. */
const stopAt = (t: number, t0: number, slow = 1) => {
  const u = (t - t0) / slow; // seconds of pit-stop time
  const up = seg(u, 0, 0.25) * (1 - seg(u, 1.6, 1.8));
  const off = seg(u, 0.35, 0.65) * (1 - seg(u, 0.9, 1.25));
  return { lift: 0.06 + up * 0.16, off: off * 0.55 };
};

const PitAction: React.FC<{ f: number; t: number; t0: number; slow?: number; focus?: string | null; carZ?: number }> = ({ f, t, t0, slow = 1, focus = null, carZ = 0 }) => {
  const s = stopAt(t, t0, slow);
  const offs = { FL: s.off, FR: s.off, RL: s.off, RR: s.off };
  const dim = (role: string) => (focus && focus !== role ? 0.35 : 1);
  return (
    <group>
      <FocusRings role={focus} f={f} />
      <group position={[0, 0, carZ]}>
        <ToyF1 lift={s.lift} wheelOff={offs} />
      </group>
      <Dimmer k={dim("gun")}>
        <Gunner f={f} seed={11} position={[1.32, 0.02, 1.05]} heading={-Math.PI / 2} />
        <Gunner f={f} seed={12} position={[-1.32, 0.02, 1.05]} heading={Math.PI / 2} />
        <Gunner f={f} seed={13} position={[1.32, 0.02, -1.02]} heading={-Math.PI / 2} />
        <Gunner f={f} seed={14} position={[-1.32, 0.02, -1.02]} heading={Math.PI / 2} />
      </Dimmer>
      <Dimmer k={dim("carry")}>
        {[
          [1, 0.0, 21],
          [-1, 0.0, 22],
          [1, -1.6, 23],
          [-1, -1.6, 24],
        ].map(([sx, z, seed]) => {
          // carriers step in toward the hub while the old wheel is off
          const inK = seg((t - t0) / slow, 0.6, 1.0) * (1 - seg((t - t0) / slow, 1.3, 1.8));
          return <Carrier key={seed} f={f} seed={seed} position={[sx * (1.62 - inK * 0.12), 0.02, z]} heading={(-sx * Math.PI) / 2} />;
        })}
      </Dimmer>
      <Dimmer k={dim("jack")}>
        <FrontJack f={f} seed={31} position={[0, 0.02, 2.75]} />
        <group position={[0, 0.02, -2.55]} rotation={[0, Math.PI, 0]}>
          <FrontJack f={f} seed={32} position={[0, 0, 0]} />
        </group>
      </Dimmer>
    </group>
  );
};

/** Wraps a crew role; when that role is in focus, a glowing ring marks each member on the floor. */
const RINGS: Record<string, V3[]> = {
  gun: [[1.32, 0, 1.05], [-1.32, 0, 1.05], [1.32, 0, -1.02], [-1.32, 0, -1.02]],
  carry: [[1.62, 0, 0], [-1.62, 0, 0], [1.62, 0, -1.6], [-1.62, 0, -1.6]],
  jack: [[0, 0, 2.75], [0, 0, -2.55]],
};
const Dimmer: React.FC<{ k: number; children: React.ReactNode }> = ({ children }) => <group>{children}</group>;
const FocusRings: React.FC<{ role: string | null; f: number }> = ({ role, f }) =>
  role ? (
    <group>
      {RINGS[role].map((p, i) => (
        <mesh key={i} position={[p[0], 0.035, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.46, 40]} />
          <meshStandardMaterial color="#f2c230" emissive="#f2c230" emissiveIntensity={0.8 + 0.4 * Math.sin(f * 0.15)} />
        </mesh>
      ))}
    </group>
  ) : null;

// ---------------------------------------------------------------- S2 night track
const carPath = (t: number) => {
  const u = seg(t, CUT.s2, CUT.s3);
  // car runs along -x → +x, then turns into the pit lane (+z)
  const x = lerp(-5, 1.6, ease(clamp(u * 1.35)));
  const turn = seg(u, 0.62, 1);
  return { pos: [x + turn * 0.6, 0, turn * 1.6] as V3, heading: Math.PI / 2 - turn * 0.9 };
};
const NightTrack: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const { pos, heading } = carPath(t);
  return (
    <group>
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#0a1020" roughness={1} />
      </mesh>
      {/* walnut planks */}
      {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 9.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      {/* main straight + pit lane (clay asphalt) */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.04, 2.2]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#3d4046" />
      </mesh>
      <mesh position={[2.6, 0, 2.0]} rotation={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.04, 1.3]} />
        <meshPhysicalMaterial {...POLISH.clay} color="#45484e" />
      </mesh>
      {[-1.1, 1.1].map((z) => (
        <mesh key={z} position={[0, 0.024, z]}>
          <boxGeometry args={[12, 0.006, 0.07]} />
          <meshStandardMaterial color="#efece4" />
        </mesh>
      ))}
      {/* kerbs */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-6 + i * 0.75 + 0.18, 0.03, -1.22]}>
          <boxGeometry args={[0.36, 0.03, 0.14]} />
          <meshStandardMaterial color={i % 2 ? "#efece4" : "#e2442f"} />
        </mesh>
      ))}
      {/* floodlight poles */}
      {[-4.5, -1.5, 1.5, 4.5].map((px) => (
        <group key={px} position={[px, 0, -2.2]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 3.2, 8]} />
            <meshStandardMaterial color="#9aa3ad" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.25, 0.05]}>
            <boxGeometry args={[0.5, 0.18, 0.08]} />
            <meshStandardMaterial color="#ffffff" emissive="#f4f1e6" emissiveIntensity={2.2} />
          </mesh>
          <spotLight position={[0, 3.2, 0.2]} target-position={[px, 0, 0]} intensity={30} angle={0.7} penumbra={0.8} color="#eef3ff" />
        </group>
      ))}
      <Model id="checkered-flag-81784a" position={[3.8, 0.02, -1.5]} height={1.1} />
      <Model id="traffic-cone-c421e4" position={[1.4, 0.02, 1.4]} height={0.3} />
      <Model id="traffic-cone-c421e4" position={[2.0, 0.02, 1.1]} height={0.3} />
      <ToyF1 position={pos} heading={heading} spin={-t * 30} />
      {/* pit wall board with the race date (in-world) */}
      <group position={[0, 1.25, -2.6]}>
        <mesh>
          <RoundedBoxGeo args={[2.2, 0.42, 0.06]} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.paper} color={TP.paperCard} />
        </mesh>
        <SceneText position={[0, 0, 0.04]} fontSize={0.2} color="#181a1b" anchorX="center" anchorY="middle">
          LUSAIL · LAP 27
        </SceneText>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- S4 measuring table
const MeasureTable: React.FC<{ t: number }> = ({ t }) => {
  const wheelsK = ease(seg(t, BEAT.rim - 0.3, BEAT.rim + 0.6));
  const carsK = 1 - wheelsK;
  const sink = ease(seg(t, BEAT.rim + 1.2, BEAT.rim + 2.2));
  return (
    <group>
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#1a1f28" roughness={1} />
      </mesh>
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? TP.stageFloor : TP.stageFloorLight} roughness={0.68} />
        </mesh>
      ))}
      {/* two cars, side by side, facing camera */}
      <group scale={0.62 * carsK + 0.0001} position={[0, 0, 0.3]}>
        <ToyF1 position={[-1.05 / 0.62, 0, 0]} color="#2b3a67" />
        <ToyF1 position={[1.05 / 0.62, 0, 0]} />
      </group>
      {/* wooden ruler + two wheels */}
      <group scale={wheelsK + 0.0001} position={[0, 0, 0.4]}>
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.8, 0.08, 0.5]} />
          <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
        </mesh>
        {Array.from({ length: 27 }, (_, i) => (
          <mesh key={i} position={[-1.3 + i * 0.1, 0.085, 0.2]}>
            <boxGeometry args={[0.012, 0.004, i % 5 ? 0.06 : 0.12]} />
            <meshStandardMaterial color="#2a1c14" />
          </mesh>
        ))}
        {/* 13-inch rim (small rim, tall sidewall) */}
        <group position={[-0.7, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Wheel position={[0, 0.33, 0]} r={0.33} w={0.3} rim={0.44} />
        </group>
        {/* 18-inch rim (big rim, low sidewall), heavier: presses the ruler end down */}
        <group position={[0.7, 0.08 - sink * 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Wheel position={[0, 0.36, 0]} r={0.36} w={0.3} rim={0.66} />
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- S5 1957 pit
const VintageCar: React.FC = () => {
  const red = { ...POLISH.toyPlastic, roughness: 0.6, clearcoat: 0.15, color: "#8e2a22" };
  return (
    <group>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.32, 2.0, 8, 24]} />
        <meshPhysicalMaterial {...red} />
      </mesh>
      <mesh position={[0, 0.42, 1.38]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 24]} />
        <meshStandardMaterial color="#2a1a14" />
      </mesh>
      <mesh position={[0, 0.72, -0.25]}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#d9cbb0" />
      </mesh>
      {[
        [0.55, 0.85],
        [-0.55, 0.85],
        [0.55, -0.85],
        [-0.55, -0.85],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <torusGeometry args={[0.27, 0.07, 12, 32]} />
            <meshStandardMaterial color="#1c1a18" roughness={0.9} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#b9b2a2" metalness={0.6} roughness={0.4} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Pit1957: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const roll = ease(seg(t, BEAT.nut + 0.6, BEAT.nut + 2.6));
  const nutPos: V3 = [lerp(0.95, 0.15, roll), 0.06, lerp(0.85, 0.2, roll)];
  const crawl = seg(t, BEAT.search - 0.3, BEAT.search + 0.4);
  const hammer = Math.max(0, Math.sin((t - CUT.s5) * 9)) * (1 - seg(t, BEAT.nut + 0.5, BEAT.nut + 0.7));
  return (
    <group>
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#20160e" roughness={1} />
      </mesh>
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[i * 0.62, -0.09, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.15, 9]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#6b4a2e" : "#7a5636"} roughness={0.8} />
        </mesh>
      ))}
      {/* hay bales */}
      {[
        [-2.0, -1.8],
        [-1.2, -2.2],
        [2.1, -1.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <RoundedBoxGeo args={[0.8, 0.44, 0.5]} radius={0.06} />
          <meshPhysicalMaterial {...POLISH.fabric} color="#cfa95a" />
        </mesh>
      ))}
      <VintageCar />
      {/* mechanic with hammer at the front-left wheel; crawls when searching */}
      <group position={[1.35, 0, 0.85]} rotation={[0, -Math.PI / 2, 0]}>
        {crawl < 0.5 ? (
          <ToyPerson f={f} seed={41} look={{ top: "#5b4a3a", bottom: "#3a3028", outfit: "casual", hairStyle: 2, cap: "#d9cbb0" }}
            poseOverride={{ body: [0, 0, 0], lift: 0.27, spine: [0.25, 0, 0], head: [0, 0, 0], ls: [-1.2 - hammer * 0.9, 0, 0.2], le: -0.4, rs: [-0.6, 0, -0.2], re: -0.4, lh: [-1.55, 0, 0.12], lk: 1.55, rh: [0.25, 0, -0.08], rk: 1.8 }} />
        ) : (
          <ToyPerson f={f} seed={41} look={{ top: "#5b4a3a", bottom: "#3a3028", outfit: "casual", hairStyle: 2, cap: "#d9cbb0" }}
            poseOverride={{ body: [1.25, 0, 0], lift: 0.2, spine: [0.1, 0, 0], head: [-0.6, Math.sin(t * 3) * 0.4, 0], ls: [-2.2, 0, 0.3], le: -0.2, rs: [-2.4, 0, -0.3], re: -0.2, lh: [-0.3, 0, 0.1], lk: 1.2, rh: [-0.6, 0, -0.1], rk: 1.3 }} />
        )}
      </group>
      {/* wing nut */}
      <group position={nutPos} rotation={[0, 0, roll * 12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 6]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.26, 0.03, 0.03]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- S6 trophy shelf
const TrophyShelf: React.FC<{ k: number }> = ({ k }) => (
  <group position={[-1.75, 0, -2.6]} scale={k + 0.0001}>
    <mesh position={[0, 0.8, 0]} castShadow>
      <boxGeometry args={[1.5, 0.06, 0.4]} />
      <meshStandardMaterial color={TP.stageDowel} roughness={0.7} />
    </mesh>
    {[-0.55, 0.55].map((x) => (
      <mesh key={x} position={[x, 0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color={TP.stageDowel} />
      </mesh>
    ))}
    {[-0.5, -0.17, 0.16].map((x) => (
      <group key={x} position={[x, 0.83, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.1, 16]} />
          <meshStandardMaterial color="#3a2a1e" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.05, 0.22, 20]} />
          <meshPhysicalMaterial color="#e8b93c" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    ))}
    {/* empty slot */}
    <group position={[0.5, 0.83, 0.05]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.1, 16]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
      <mesh position={[0, 0.25, 0.1]}>
        <RoundedBoxGeo args={[0.42, 0.2, 0.02]} radius={0.01} />
        <meshPhysicalMaterial {...POLISH.paper} color={TP.paperCard} />
      </mesh>
      <SceneText position={[0, 0.25, 0.115]} fontSize={0.1} color="#c22a1e" anchorX="center" anchorY="middle">
        BELUM
      </SceneText>
    </group>
  </group>
);

// ---------------------------------------------------------------- HUD
const Timer: React.FC<{ value: string; label?: string; color?: string; k: number; top?: number; size?: number }> = ({ value, label, color = "#fff", k, top = 260, size = 190 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})` }}>
    <div style={{ fontFamily: FONT.display, fontSize: size, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>{value}</div>
    {label ? <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)", marginTop: 6 }}>{label}</div> : null}
  </div>
);

const Chip: React.FC<{ text: string; k: number; top?: number; bg?: string; color?: string; rot?: number }> = ({ text, k, top = 260, bg = TP.paperCard, color = "#181a1b", rot = -2 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: k }}>
    <div style={{ background: bg, color, fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, letterSpacing: 2, padding: "10px 24px", transform: `rotate(${rot}deg) translateY(${(1 - k) * 20}px)`, boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>{text}</div>
  </div>
);

const pop = (t: number, a: number, b = 1e9) => ease(seg(t, a, a + 0.25)) * (1 - seg(t, b - 0.2, b));

const fmt = (x: number, d = 2) => x.toFixed(d).replace(".", ",");

const Hud: React.FC<{ t: number }> = ({ t }) => {
  const els: React.ReactNode[] = [];
  if (t < CUT.s2) {
    const cover = 1 - seg(t, 1.4, 1.8);
    if (cover > 0) els.push(<div key="cov" style={{ opacity: cover }}><CoverText /></div>);
    const tk = seg(t, 1.8, 2.1);
    const run = clamp((t - 2.0) / 1.8) * 1.8;
    if (tk > 0) els.push(<Timer key="tm" value={fmt(run)} label={run >= 1.8 ? "DETIK · 4 BAN BARU" : "DETIK"} color={run >= 1.8 ? "#f2c230" : "#fff"} k={tk} />);
    els.push(<Chip key="c20" text="±20 KRU · 4 BAN" k={pop(t, BEAT.hook20)} top={560} />);
  } else if (t < CUT.s3) {
    els.push(<Chip key="q" text="QATAR · 8 OKT 2023 · LAP 27" k={pop(t, CUT.s2 + 0.4)} />);
    els.push(<Timer key="j" value="1,80" label="DETIK · McLAREN" color="#f2c230" k={pop(t, BEAT.jam)} top={360} size={170} />);
  } else if (t < CUT.s4) {
    const card = (text: string, a: number, b: number, bg?: string, color?: string) => <Chip key={text} text={text} k={pop(t, a, b)} bg={bg} color={color} />;
    els.push(card("4 PENEMBAK RODA · 1 MUR", BEAT.gunners, BEAT.carriers));
    els.push(card("8 PEMBAWA BAN · 4 LEPAS + 4 PASANG", BEAT.carriers, BEAT.jacks));
    els.push(card("JACK DEPAN + JACK BELAKANG", BEAT.jacks, BEAT.late));
    els.push(card("1 MELESET = SEMUA TERLAMBAT", BEAT.late, CUT.s4, "#e2442f", "#fff"));
  } else if (t < CUT.s5) {
    const a = pop(t, CUT.s4 + 0.3, BEAT.rim);
    els.push(
      <div key="split" style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "space-around", opacity: a }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: "#9fb1e6" }}>1,82</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36 }}>BRASIL 2019</div>
        </div>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontFamily: FONT.display, fontSize: 150, lineHeight: 1, color: "#f2c230" }}>1,80</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36 }}>QATAR 2023</div>
        </div>
      </div>,
    );
    els.push(<Chip key="d" text="SELISIH −0,02 DETIK" k={pop(t, BEAT.diff + 0.4, BEAT.rim)} top={520} bg="#e2442f" color="#fff" rot={2} />);
    els.push(<Chip key="r1" text={'13" (2019)  vs  18" (2023) · LEBIH BERAT'} k={pop(t, BEAT.rim + 0.5)} top={300} />);
  } else if (t < CUT.s6) {
    els.push(<Chip key="g" text="JERMAN 1957 · FANGIO" k={pop(t, CUT.s5 + 0.3, BEAT.search)} />);
    const sk = pop(t, BEAT.search);
    const v = Math.min(30, (t - BEAT.search) * 12);
    if (sk > 0) els.push(<Timer key="ts" value={`≈ ${Math.max(0, Math.round(v))}`} label="DETIK MENCARI SATU MUR" color="#f0d9a8" k={sk} size={170} />);
    els.push(<Chip key="w" text="FANGIO TETAP MENANG" k={pop(t, BEAT.won)} top={560} bg="#f0d9a8" />);
  } else if (t < CUT.s7) {
    els.push(<Chip key="aw" text="PENGHARGAAN PIT STOP SEMUSIM: BELUM" k={pop(t, BEAT.award + 0.3, BEAT.record)} />);
    els.push(<Timer key="rec" value="1,80 DTK" label="REKOR TERCATAT SEJAK 2023" color="#f2c230" k={pop(t, BEAT.record)} size={180} />);
  } else {
    els.push(
      <div key="tz" style={{ position: "absolute", left: 60, right: 60, top: 640, textAlign: "center", opacity: pop(t, CUT.s7 + 0.2) }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 44, color: "#f2c230", letterSpacing: 3 }}>BERIKUTNYA</div>
        <div style={{ fontFamily: FONT.display, fontSize: 130, lineHeight: 1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>RUMBLE IN THE JUNGLE</div>
      </div>,
    );
  }
  return <>{els}</>;
};

// ---------------------------------------------------------------- captions (karaoke, y≈1300)
type Chunk = { a: number; b: number; words: Word[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({ a: cur[0].s, b: cur[cur.length - 1].e + 0.15, words: cur });
      cur = [];
    };
    for (const w of c.words) {
      cur.push(w);
      if (cur.length >= 4 || /[.,:;!?]$/.test(w.w)) flush();
    }
    flush();
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b + 0.3, out[i + 1].a);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1260, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(14,20,29,.55)", borderRadius: 14, padding: "10px 22px", textAlign: "center" }}>
        {ch.words.map((w, i) => {
          const active = t >= w.s && t < (ch.words[i + 1]?.s ?? ch.b);
          return (
            <span key={i} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 54, color: active ? "#f2c230" : "#fff", marginRight: "0.4em", display: "inline-block", transform: active ? "scale(1.04)" : "none", textShadow: "0 3px 10px rgba(0,0,0,.7)" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cameras per scene
const A = COVER_CAMS.A;
const CAMS: Record<string, Key[]> = {
  s1: [
    { t: 0, ...A },
    { t: 1.6, ...A },
    { t: 7, pos: [3.4, 4.2, 6.2], target: [0, 0.4, 0], fov: 32 },
    { t: CUT.s2, pos: [4.2, 2.1, 4.6], target: [0, 0.45, 0.2], fov: 32 },
  ],
  s2: [
    { t: CUT.s2, pos: [-4.5, 2.0, 8.0], target: [-3.0, 0.3, 0], fov: 32 },
    { t: CUT.s3 - 2.5, pos: [1.2, 2.4, 8.2], target: [1.2, 0.3, 0.4], fov: 32 },
    { t: CUT.s3, pos: [3.4, 3.2, 7.6], target: [2.2, 0.3, 1.4], fov: 32 },
  ],
  s3: [
    { t: CUT.s3, pos: [-5.0, 2.8, 6.6], target: [0, 0.4, 0.2], fov: 32 },
    { t: BEAT.carriers, pos: [-6.4, 3.2, 3.2], target: [0, 0.4, -0.4], fov: 32 },
    { t: BEAT.jacks, pos: [-4.6, 2.8, 6.6], target: [0, 0.4, 0.4], fov: 32 },
    { t: CUT.s4, pos: [-1.0, 3.8, 7.6], target: [0, 0.3, 0], fov: 32 },
  ],
  s4: [
    { t: CUT.s4, pos: [0, 2.8, 8.6], target: [0, 0.6, 0.4], fov: 32 },
    { t: BEAT.rim, pos: [0, 2.6, 8.6], target: [0, 0.15, 0.6], fov: 30 },
    { t: CUT.s5, pos: [0.5, 2.0, 7.6], target: [0, 0.2, 0.6], fov: 30 },
  ],
  s5: [
    { t: CUT.s5, pos: [4.6, 2.2, 5.6], target: [0.4, 0.2, 0.3], fov: 32 },
    { t: BEAT.search, pos: [3.2, 1.4, 4.4], target: [0.4, 0.0, 0.4], fov: 32 },
    { t: CUT.s6, pos: [3.6, 1.7, 4.8], target: [0.3, 0.0, 0.3], fov: 32 },
  ],
  s6: [
    { t: CUT.s6, pos: [-3.6, 1.4, 5.4], target: [-0.6, 0.6, 0.2], fov: 32 },
    { t: BEAT.award + 1.2, pos: [-1.2, 1.9, 1.6], target: [-1.75, 0.75, -2.6], fov: 32 },
    { t: BEAT.record + 1.5, pos: [-1.0, 2.2, 2.0], target: [-1.6, 0.6, -2.4], fov: 32 },
    { t: CUT.s7, ...A },
  ],
  s7: [
    { t: CUT.s7, ...A },
    { t: TOTAL, pos: [1.1, 11.6, 8.2], target: [0, 0, -0.4], fov: 32 },
  ],
};

const sceneOf = (t: number) => (t < CUT.s2 ? "s1" : t < CUT.s3 ? "s2" : t < CUT.s4 ? "s3" : t < CUT.s5 ? "s4" : t < CUT.s6 ? "s5" : t < CUT.s7 ? "s6" : "s7");

// ---------------------------------------------------------------- film
export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const sc = sceneOf(t);
  let cam = camAt(t, CAMS[sc]);
  if (sc === "s2") {
    // track the car: camera rides alongside, far enough back that the whole car fits the 9:16 width
    const c = carPath(t).pos;
    cam = { t, pos: [c[0] + 0.5, 3.6, 12.4], target: [c[0] + 0.45, 0.4, c[2] * 0.6], fov: 32 };
  }
  const focus = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
  const pitBox = sc === "s1" || sc === "s3" || sc === "s6" || sc === "s7";
  // payoff: the car drives out of the box toward camera, then the box is empty
  const leave = sc === "s6" ? ease(seg(t, CUT.s6 + 0.3, CUT.s6 + 2.2)) : 0;
  const light =
    sc === "s2" ? { amb: 0.15, key: 20, keyColor: "#cfe0ff" } : sc === "s4" ? { amb: 0.18, key: 90, keyColor: TP.keyLight } : sc === "s5" ? { amb: 0.22, key: 70, keyColor: "#ffd9a0" } : sc === "s6" ? { amb: 0.2, key: 95, keyColor: "#ffc27a" } : { amb: 0.35, key: 90, keyColor: TP.keyLight };
  const sepia = sc === "s5" ? 0.75 : 0;
  // cut flash (white wipe) at each scene start
  const cuts = [CUT.s2, CUT.s3, CUT.s4, CUT.s5, CUT.s6, CUT.s7];
  const flash = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.12)) * 0.5;
  return (
    <AbsoluteFill style={{ background: TP.stageBackdrop }}>
      <Audio src={staticFile("audio/ep04/vo.wav")} />
      <AbsoluteFill style={{ filter: sepia ? `sepia(${sepia}) contrast(1.05)` : undefined }}>
        <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov ?? 32, near: 0.1, far: 60 }}>
          <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov ?? 32} />
          <ambientLight intensity={light.amb * 0.7} color="#F5E8D3" />
          <spotLight position={[-2.2, 7.5, 3.5]} intensity={light.key * 1.15} angle={0.42} penumbra={0.6} color={light.keyColor} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
          <directionalLight position={[3.5, 4.5, -5]} intensity={sc === "s2" ? 1.0 : 1.9} color={TP.rimLight} />
          <fog attach="fog" args={[sc === "s5" ? "#20160e" : TP.stageBackdrop, 9, 20]} />
          <pointLight position={[0, 0.4, 4.4]} intensity={3} distance={4} color={TP.footlights} />
          {/* subject pools: a tight warm light on the subject so it separates from the darker stage edges */}
          {(sc === "s4" || sc === "s5") && <spotLight position={[0.6, 5.5, 2.6]} intensity={55} angle={0.36} penumbra={0.55} color="#ffe2b8" />}
          {sc === "s6" && <pointLight position={[-1.5, 1.7, -1.7]} intensity={7} distance={2.6} decay={1.6} color="#ffd59a" />}
          {pitBox && (
            <>
              <PitLane f={f} />
              {sc === "s1" && <PitAction f={f} t={t} t0={2.0} />}
              {sc === "s3" && (
                <PitAction
                  f={f}
                  t={t}
                  t0={CUT.s3 + 0.5}
                  slow={8}
                  focus={t < BEAT.carriers ? "gun" : t < BEAT.jacks ? "carry" : t < BEAT.late ? "jack" : null}
                />
              )}
              {(sc === "s6" || sc === "s7") && (
                <>
                  <group position={[0, 0, leave * 9]}>
                    <ToyF1 lift={0} spin={leave * 40} />
                  </group>
                  <Gunner f={f} seed={11} position={[1.32, 0.02, 1.05]} heading={-Math.PI / 2} />
                  <Gunner f={f} seed={12} position={[-1.32, 0.02, 1.05]} heading={Math.PI / 2} />
                  <ToyPerson f={f} seed={21} pose="cheer" look={{ top: LIVERY.crewTop, bottom: LIVERY.crewBottom, outfit: "casual", hairStyle: 2, cap: LIVERY.helmet }} position={[1.6, 0.02, -0.4]} heading={-0.6} />
                  <ToyPerson f={f} seed={22} pose="cheer" look={{ top: LIVERY.crewTop, bottom: LIVERY.crewBottom, outfit: "casual", hairStyle: 2, cap: LIVERY.helmet }} position={[0.5, 0.02, -1.4]} heading={0.2} />
                  <TrophyShelf k={ease(seg(t, BEAT.award, BEAT.award + 0.6))} />
                </>
              )}
            </>
          )}
          {sc === "s2" && <NightTrack f={f} t={t} />}
          {sc === "s4" && <MeasureTable t={t} />}
          {sc === "s5" && <Pit1957 f={f} t={t} />}
          <Finish frame={frame} background={TP.stageBackdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={sc === "s2" ? 0.9 : 1} envIntensity={0.55} focus={focus} aperture={0.0025} maxBlur={0.009} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* stage vignette: the lit subject in the middle, the stage edges fall off to dark */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 42% at 50% 47%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 44%, rgba(8,10,16,.6) 78%, rgba(8,10,16,.86) 100%)" }} />
      {/* HUD lives in 1080 × 1920 design px, scaled to the render size */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(14,20,29,.7) 0%, rgba(14,20,29,.25) 65%, rgba(14,20,29,0) 100%)" }} />
        <Hud t={t} />
        <Captions t={t} />
      </div>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};

