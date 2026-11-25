// EP01 film (SKETCHFORGE): "MUNDUR ATAU BERTAHAN?" — the approved cover world (sketchbook page,
// hatched Vice-President office, paper cut-out figures) explored by one continuous camera.
// Every beat is keyed to word times in timeline.json (Audio Master Clock). Audio is muxed by lead.
// Facts: only HIGH rows of research. Never shows or says he resigned: "niat", not "mundur resmi".
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { SKETCH_PALETTE as P } from "../../kits/sketchforge/lib/palette";
import { Outro } from "../_shared/Outro.tsx";
import { Chair, DESK, Desk, DeskProps, DeskSurface, FIGS, Figure, HatchBox, Page, Pencil, Sheet } from "./Cover.tsx";
import { FigureSpec, documentTexture } from "./coverTextures.ts";
import { batalStampTexture, clockFaceTexture, dprLabelTexture, hattaLetterTexture, letterTexture, mkTexture } from "./filmTextures.ts";
import TL from "./timeline.json";

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: CAVEAT } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

type V3 = [number, number, number];
const BG = P.desk;
const INK = "#2F3034";
const CREAM = "#FBF7EF";

// ------------------------------------------------------------------ clock (timeline.json)
type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = TL.clips as Clip[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
const norm = (w: string) => w.toLowerCase().replace(/[.,!?:;]+$/g, "");
/** Start time of the n-th occurrence of `word` in clip `id` (looked up by text, not index). */
const W = (id: string, word: string, n = 0) => {
  const c = CLIPS.find((x) => x.id === id)!;
  const hits = c.words.filter((x) => norm(x.w) === word.toLowerCase());
  if (!hits[n]) throw new Error(`word not found: ${id}/${word}/${n}`);
  return hits[n].s;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

// ------------------------------------------------------------------ anchors
const A = {
  hookGibran: W("hook", "gibran", 0),
  hookGibran2: W("hook", "gibran", 1),
  hookJadi: W("hook", "jadi"),
  hookIni: W("hook", "ini"),
  selasa: W("konteks", "selasa"),
  kGibran: W("konteks", "gibran", 0),
  bertemu: W("konteks", "bertemu"),
  prabowo: W("konteks", "prabowo"),
  jam25: W("konteks", "2,5"),
  jam: W("konteks", "jam"),
  sore: W("konteks", "sore"),
  prasetyo: W("konteks", "prasetyo"),
  mengumumkan: W("konteks", "mengumumkan"),
  menyatakan: W("konteks", "menyatakan"),
  niatK: W("konteks", "niat"),
  pemicu: W("pengembangan", "pemicunya"),
  agung: W("pengembangan", "agung"),
  akhir: W("pengembangan", "akhir"),
  membatalkan: W("pengembangan", "membatalkan"),
  surat: W("pengembangan", "surat"),
  pilpres: W("pengembangan", "pilpres"),
  menurut: W("pengembangan", "menurut"),
  kehadiran: W("pengembangan", "kehadiran"),
  kelulusan: W("pengembangan", "kelulusan"),
  putusanIni: W("pengembangan", "putusan", 1),
  konstitusi: W("pengembangan", "konstitusi"),
  tapi: W("penjelasan", "tapi"),
  istana: W("penjelasan", "istana"),
  pGibran: W("penjelasan", "gibran"),
  ia: W("penjelasan", "ia"),
  fight: W("penjelasan", "fight"),
  membawa: W("penjelasan", "membawa"),
  kuasa: W("penjelasan", "kuasa"),
  di: W("penjelasan", "di", 1),
  dpr: W("penjelasan", "dpr"),
  usulan: W("penjelasan", "usulan"),
  meja: W("penjelasan", "meja"),
  kalau: W("payoff", "kalau"),
  pasal: W("payoff", "pasal"),
  presidenP: W("payoff", "presiden"),
  dua: W("payoff", "dua"),
  mpr: W("payoff", "mpr"),
  lambat: W("payoff", "lambat"),
  wapresP: W("payoff", "wapres", 1),
  hatta: W("payoff", "hatta"),
  y1956: W("payoff", "1956"),
  sepucuk: W("payoff", "sepucuk"),
  jadiO: W("outro", "jadi"),
  niatO: W("outro", "niat"),
  belum: W("outro", "belum"),
  kami: W("outro", "kami"),
  audiraO: W("outro", "audira"),
  menurutmu: W("outro", "menurutmu"),
};

// ------------------------------------------------------------------ world layout (film additions)
const CLOCK: V3 = [-1.95, 0, -0.3];
const LETTER: V3 = [-0.9, 0.02, 1.85];
const MK: V3 = [0.45, 0.02, 1.95];
const HATTA_LETTER: V3 = [-1.95, 0.02, 2.55];
const LAWYER: { spec: FigureSpec; pos: V3; rot: number; h: number } = {
  spec: { key: "lawyer", build: 0.98, jacket: "suit", jacketTone: "#5E5F66", peci: false, tie: true, hands: "side", seed: 404 },
  pos: [1.95, 0, 0.75],
  rot: -0.45,
  h: 1.62,
};
const HATTA: { spec: FigureSpec; pos: V3; rot: number; h: number } = {
  spec: { key: "hatta", build: 0.95, jacket: "suit", jacketTone: "#77716A", peci: true, tie: false, hands: "side", backView: true, seed: 505 },
  pos: [-2.0, 0, 1.55],
  rot: 0.3,
  h: 1.58,
};
const DPR_AT: V3 = [DESK.x + 0.55, DESK.h, DESK.z - 0.22];

// ------------------------------------------------------------------ camera: Catmull-Rom through keyed poses
type Key = { t: number; p: V3; q: V3; fov: number };
const KEYS: Key[] = [
  { t: 0, p: [0.3, 5.0, 6.6], q: [0.1, 0.65, -0.85], fov: 34 },
  { t: A.hookGibran2, p: [0.5, 4.3, 5.6], q: [0.3, 0.7, -0.9], fov: 34 },
  { t: A.hookIni + 0.3, p: [-0.05, 3.2, 3.6], q: [-0.35, 0.72, -1.15], fov: 34 },
  { t: A.selasa + 1.3, p: [-1.15, 1.7, 2.0], q: [-1.85, 0.55, -0.35], fov: 34 },
  { t: A.jam + 0.3, p: [-1.4, 1.45, 1.55], q: [-1.92, 0.58, -0.3], fov: 34 },
  { t: A.prasetyo, p: [-0.15, 1.95, 3.5], q: [-0.12, 0.95, 0.6], fov: 34 },
  { t: SEC.KONTEKS[1] - 0.3, p: [0.1, 1.75, 3.0], q: [-0.1, 1.0, 0.6], fov: 34 },
  { t: A.akhir, p: [-0.6, 3.6, 3.9], q: [-0.75, 0, 1.35], fov: 34 },
  { t: A.membatalkan + 0.4, p: [-0.85, 2.7, 3.3], q: [-0.9, 0, 1.85], fov: 34 },
  { t: A.kehadiran, p: [-0.7, 2.45, 3.05], q: [-0.85, 0, 1.75], fov: 34 },
  { t: A.konstitusi, p: [0.0, 2.9, 3.7], q: [-0.2, 0, 1.85], fov: 34 },
  { t: A.tapi + 1.4, p: [0.3, 5.2, 7.0], q: [0.1, 0.7, -0.5], fov: 34 },
  { t: A.ia, p: [2.4, 2.6, 5.0], q: [1.15, 1.45, -0.2], fov: 34 },
  { t: A.kuasa + 0.6, p: [2.5, 2.5, 4.9], q: [1.6, 1.3, 0.4], fov: 34 },
  { t: A.usulan, p: [1.0, 2.5, 0.9], q: [0.6, 0.78, -1.5], fov: 34 },
  { t: SEC.PENJELASAN[1], p: [0.85, 2.3, 0.6], q: [0.6, 0.82, -1.6], fov: 34 },
  { t: A.pasal, p: [0.5, 2.0, 0.2], q: [0.55, 0.9, -2.1], fov: 34 },
  { t: A.dua, p: [0.2, 6.6, 4.2], q: [0.15, 0, -0.5], fov: 34 },
  { t: A.lambat + 0.4, p: [0.15, 7.0, 3.7], q: [0.1, 0, -0.6], fov: 34 },
  { t: A.hatta, p: [-1.1, 3.1, 6.3], q: [-1.9, 0.75, 2.0], fov: 34 },
  { t: SEC.PAYOFF[1], p: [-1.3, 2.8, 5.8], q: [-1.9, 0.6, 2.2], fov: 34 },
  { t: A.belum, p: [0.15, 2.3, 0.75], q: [0.05, 0.8, -1.25], fov: 34 },
  { t: A.audiraO, p: [-0.35, 1.85, 0.1], q: [-0.52, 0.8, -1.35], fov: 34 },
  { t: A.menurutmu + 0.8, p: [0.3, 5.1, 7.1], q: [0.05, 0.75, -0.7], fov: 34 },
  { t: TL.total, p: [0.4, 5.5, 7.7], q: [0.05, 0.75, -0.7], fov: 34 },
];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const pose = (t: number) => {
  let i = KEYS.findIndex((k, j) => j < KEYS.length - 1 && t >= k.t && t < KEYS[j + 1].t);
  if (i < 0) i = t < KEYS[0].t ? 0 : KEYS.length - 2;
  const k0 = KEYS[Math.max(0, i - 1)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(KEYS.length - 1, i + 2)];
  // gentle ease inside each segment keeps passes through keys smooth without parking
  const raw = clamp01((t - k1.t) / (k2.t - k1.t));
  const u = raw * 0.6 + smooth(raw) * 0.4;
  const v = (a: V3, b: V3, c: V3, d: V3): V3 => [0, 1, 2].map((j) => cr(a[j], b[j], c[j], d[j], u)) as V3;
  return { p: v(k0.p, k1.p, k2.p, k3.p), q: v(k0.q, k1.q, k2.q, k3.q), fov: cr(k0.fov, k1.fov, k2.fov, k3.fov, u) };
};

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = pose(t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.p);
    cam.lookAt(...c.q);
    cam.fov = c.fov;
    cam.layers.enable(FX_LAYER);
    cam.updateProjectionMatrix();
  }, [camera, t]);
  return null;
};

// ------------------------------------------------------------------ film props
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const sweep = seg(t, A.bertemu, A.jam + 0.25) * ((2.5 / 12) * Math.PI * 2); // hour-hand angle for 2.5 h
  const minute = seg(t, A.bertemu, A.jam + 0.25) * 2.5 * Math.PI * 2;
  const wedge = useMemo(() => new THREE.CircleGeometry(0.3, 48, Math.PI / 2 - Math.max(sweep, 0.0001), Math.max(sweep, 0.0001)), [Math.round(sweep * 200)]); // eslint-disable-line react-hooks/exhaustive-deps
  const grain = useSurfaceGrain(77, 0.2, 2);
  const lift = seg(t, A.selasa - 0.6, A.selasa + 0.2);
  return (
    <group position={CLOCK} rotation={[0, 0.5, 0]} scale={[1, Math.max(0.001, lift), 1]} visible={lift > 0.001}>
      <HatchBox args={[0.5, 0.12, 0.3]} pos={[0, 0.06, 0]} seed={88} tone={P.clay} radius={0.03} />
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.1, 48]} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, 0.5, 0.051]}>
        <circleGeometry args={[0.33, 48]} />
        <meshPhysicalMaterial {...POLISH.paper} map={clockFaceTexture()} />
      </mesh>
      <mesh position={[0, 0.5, 0.053]} geometry={wedge}>
        <meshBasicMaterial color={P.accent} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.5, 0.06]} rotation={[0, 0, -sweep]}>
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.03, 0.19, 0.01]} />
          <meshStandardMaterial color={P.graphite} />
        </mesh>
      </mesh>
      <mesh position={[0, 0.5, 0.065]} rotation={[0, 0, -minute]}>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.018, 0.27, 0.01]} />
          <meshStandardMaterial color={P.accentDeep} />
        </mesh>
      </mesh>
      <mesh position={[0, 0.5, 0.07]}>
        <circleGeometry args={[0.025, 16]} />
        <meshStandardMaterial color={P.graphite} />
      </mesh>
    </group>
  );
};

const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const hit = A.membatalkan;
  const down = seg(t, hit - 0.55, hit);
  const up = seg(t, hit + 0.35, hit + 1.1);
  const y = 0.05 + (1 - down) * 1.4 + up * 1.6;
  const show = t > hit - 0.8 && t < hit + 1.3;
  const ink = seg(t, hit - 0.02, hit + 0.06);
  return (
    <>
      {show && (
        <group position={[LETTER[0], y, LETTER[2]]} rotation={[0, -0.1, 0]}>
          <mesh castShadow position={[0, 0.04, 0]}>
            <RoundedBoxGeo args={[0.62, 0.08, 0.26]} radius={0.02} segments={2} />
            <meshPhysicalMaterial {...POLISH.paper} color={P.graphite} />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.26, 16]} />
            <meshPhysicalMaterial {...POLISH.paper} color={P.wood} />
          </mesh>
          <mesh castShadow position={[0, 0.37, 0]}>
            <sphereGeometry args={[0.1, 20, 14]} />
            <meshPhysicalMaterial {...POLISH.toyPlastic} color={P.accent} />
          </mesh>
        </group>
      )}
      {ink > 0 && (
        <mesh position={[LETTER[0], 0.036, LETTER[2] + 0.05]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial map={batalStampTexture()} transparent opacity={ink} depthWrite={false} roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )}
    </>
  );
};

/** A figure that rises off the page (kit "lift" phase) from time `at`. */
const LiftFigure: React.FC<{ fig: { spec: FigureSpec; pos: V3; rot: number; h: number }; t: number; at: number }> = ({ fig, t, at }) => {
  const s = seg(t, at - 0.15, at + 0.45);
  if (s <= 0.001) return null;
  return (
    <group position={fig.pos} scale={[1, s, 1]}>
      <Figure spec={fig.spec} pos={[0, 0, 0]} rot={fig.rot} h={fig.h} />
    </group>
  );
};

const DprFolder: React.FC<{ t: number }> = ({ t }) => {
  const s = seg(t, A.dpr - 0.1, A.dpr + 0.7);
  if (s <= 0.001) return null;
  const x = DPR_AT[0] + (1 - s) * 1.8;
  const y = DPR_AT[1] + (1 - s) * 0.5 + Math.sin(s * Math.PI) * 0.15;
  return (
    <group position={[x, y, DPR_AT[2]]} rotation={[0, 0.2 - (1 - s) * 0.6, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
        <RoundedBoxGeo args={[0.52, 0.05, 0.66]} radius={0.01} segments={2} />
        <meshPhysicalMaterial {...POLISH.paper} color={P.accentDeep} />
      </mesh>
      <mesh position={[0, 0.0515, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.44, 0.22]} />
        <meshPhysicalMaterial {...POLISH.paper} map={dprLabelTexture()} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const hattaIn = seg(t, A.wapresP - 0.4, A.wapresP + 0.4);
  return (
    <>
      <CameraRig t={t} />
      <ambientLight intensity={0.4} color="#FFF4E6" />
      <hemisphereLight args={["#FFF1DC", "#1A1A1E", 0.5]} />
      <directionalLight
        position={[-4.5, 8, 3.5]}
        intensity={2.6}
        color="#FFE6C4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-radius={5}
        onUpdate={(l) => l.shadow.camera.layers.enable(FX_LAYER)}
      />
      <directionalLight position={[4.5, 3.5, -5]} intensity={0.9} color="#A9C6EA" />

      <DeskSurface />
      <Page />
      <Desk />
      <Chair />
      <DeskProps />
      <Sheet size={[1.0, 1.32]} pos={[-1.05, 0.02, 0.55]} rot={[0.0, 0.14, 0]} tex={documentTexture()} thick={0.012} edge="#EEE6D6" />
      <Sheet size={[0.9, 1.18]} pos={LETTER} rot={[0, -0.08, 0]} tex={letterTexture()} thick={0.01} edge="#EEE6D6" />
      <Sheet size={[0.9, 1.18]} pos={[MK[0] + (1 - seg(t, A.putusanIni - 0.3, A.putusanIni + 0.5)) * 2.2, MK[1], MK[2]]} rot={[0, 0.1, 0]} tex={mkTexture()} thick={0.01} edge="#EEE6D6" />
      {hattaIn > 0.001 && (
        <Sheet size={[0.82, 1.08]} pos={[HATTA_LETTER[0] - (1 - hattaIn) * 1.4, HATTA_LETTER[1], HATTA_LETTER[2]]} rot={[0, 0.2, 0]} tex={hattaLetterTexture()} thick={0.012} edge="#D9CBAA" />
      )}
      <Clock t={t} />
      <Stamp t={t} />
      <DprFolder t={t} />
      {FIGS.map((fg) => (
        <Figure key={fg.spec.key} {...fg} />
      ))}
      <LiftFigure fig={LAWYER} t={t} at={A.kuasa} />
      <LiftFigure fig={HATTA} t={t} at={A.wapresP} />
      <Pencil pos={[2.05, 0.06, 2.95]} rot={0.6} />
      <Finish frame={Math.round(f)} background={BG} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.85} envIntensity={0.25} ao />
    </>
  );
};

// ------------------------------------------------------------------ HTML layer
const Card: React.FC<{ k: number; o: number; x: number; y: number; w?: number; rot?: number; label?: string; children: React.ReactNode; dark?: boolean }> = ({
  k,
  o,
  x,
  y,
  w,
  rot = 0,
  label,
  children,
  dark,
}) => (
  <div
    style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      width: w ? w * k : undefined,
      opacity: o,
      transform: `translateY(${(1 - o) * 18 * k}px) rotate(${rot}deg)`,
      background: dark ? INK : CREAM,
      border: `${3 * k}px solid ${INK}`,
      boxShadow: `${6 * k}px ${8 * k}px 0 rgba(20,20,24,0.45)`,
      padding: `${12 * k}px ${20 * k}px ${14 * k}px`,
    }}
  >
    {label && <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 28 * k, letterSpacing: 3 * k, color: P.accentDeep, marginBottom: 4 * k }}>{label}</div>}
    <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 44 * k, lineHeight: 1.12, color: dark ? CREAM : INK }}>{children}</div>
  </div>
);

const NAMES: { a: number; b: number; name: string; role: string }[] = [
  { a: A.hookGibran, b: A.hookJadi - 0.1, name: "Gibran Rakabuming Raka", role: "Wakil Presiden" },
  { a: A.kGibran, b: A.prabowo - 0.1, name: "Gibran Rakabuming Raka", role: "Wakil Presiden" },
  { a: A.prabowo, b: A.sore, name: "Prabowo Subianto", role: "Presiden" },
  { a: A.prasetyo - 0.2, b: SEC.KONTEKS[1], name: "Prasetyo Hadi", role: "Mensesneg" },
  { a: A.pGibran, b: A.ia + 1.5, name: "Gibran Rakabuming Raka", role: "Wakil Presiden" },
  { a: A.kuasa, b: A.dpr - 0.2, name: "Andi Azwan", role: "Kuasa hukum Gibran" },
  { a: A.hatta - 0.2, b: SEC.PAYOFF[1] + 0.2, name: "Mohammad Hatta", role: "Wapres pertama · 1945–1956" },
];

const Kicker: React.FC<{ k: number; o: number; text: string }> = ({ k, o, text }) => (
  <div style={{ position: "absolute", left: 66 * k, top: 266 * k, opacity: o, fontFamily: OSWALD, fontWeight: 700, fontSize: 32 * k, letterSpacing: 4 * k, color: P.accent, background: "rgba(38,38,42,0.9)", padding: `${2 * k}px ${12 * k}px` }}>
    {text}
  </div>
);

const Big: React.FC<{ k: number; o: number; y?: number; children: React.ReactNode; size?: number }> = ({ k, o, y = 334, children, size = 120 }) => (
  <div
    style={{
      position: "absolute",
      left: 62 * k,
      right: 40 * k,
      top: y * k,
      opacity: o,
      transform: `scale(${0.96 + 0.04 * o})`,
      transformOrigin: "left top",
      fontFamily: ANTON,
      fontSize: size * k,
      lineHeight: 1.22,
      color: "#F3EBDD",
    }}
  >
    <span style={{ background: "rgba(38,38,42,0.9)", boxShadow: `${6 * k}px ${8 * k}px 0 rgba(20,20,24,0.35)`, padding: `0px ${16 * k}px`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
  </div>
);

const Acc: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: P.accent }}>{children}</span>;

/** Pencil flow diagram for Pasal 8 ayat (2). */
const Flow: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const out = 1 - seg(t, A.wapresP - 0.5, A.wapresP);
  const nodes = [
    { at: A.presidenP - 1.2, label: "KURSI WAPRES", text: "kosong" },
    { at: A.dua, label: "PRESIDEN", text: "usul 2 nama" },
    { at: A.mpr, label: "MPR", text: "memilih wapres" },
    { at: A.lambat, label: "BATAS WAKTU", text: "≤ 60 hari" },
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: out }}>
      {nodes.map((n, i) => {
        const o = seg(t, n.at - 0.1, n.at + 0.35);
        const y = 470 + i * 196;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg style={{ position: "absolute", left: 520 * k, top: (y - 74) * k }} width={40 * k} height={72 * k} viewBox="0 0 40 72">
                <path d="M20 2 L20 60 M8 48 L20 66 L32 48" stroke={INK} strokeWidth={5} fill="none" strokeDasharray={90} strokeDashoffset={90 * (1 - o)} />
              </svg>
            )}
            <div
              style={{
                position: "absolute",
                left: 260 * k,
                width: 560 * k,
                top: y * k,
                opacity: o,
                transform: `scale(${0.94 + 0.06 * o}) rotate(${i % 2 ? 1 : -1}deg)`,
                background: i === 3 ? INK : CREAM,
                border: `${3 * k}px solid ${INK}`,
                boxShadow: `${6 * k}px ${8 * k}px 0 rgba(20,20,24,0.4)`,
                padding: `${10 * k}px ${20 * k}px`,
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 28 * k, letterSpacing: 3 * k, color: i === 3 ? P.accent : P.accentDeep }}>{n.label}</div>
              <div style={{ fontFamily: ANTON, fontSize: 58 * k, lineHeight: 1.05, color: i === 3 ? CREAM : INK }}>{n.text}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// karaoke caption: chunks at punctuation, ≤ 7 words, 2 balanced lines when > 4, no lone word
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    const groups: Word[][] = [];
    let cur: Word[] = [];
    const ws = c.words;
    for (let j = 0; j < ws.length; j++) {
      const w = ws[j];
      cur.push(w);
      const nxt = ws[j + 1];
      const nextEndsAlone = nxt && /[.,?!:]$/.test(nxt.w); // never leave "jam." alone on the next card
      if ((/[.,?!:]$/.test(w.w) && cur.length >= 2) || (cur.length >= 6 && !nextEndsAlone) || cur.length === 7) {
        groups.push(cur);
        cur = [];
      }
    }
    if (cur.length) groups.push(cur);
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1 && groups.length > 1) {
        if (i > 0 && groups[i - 1].length < 7) {
          groups[i - 1].push(...groups[i]);
        } else {
          groups[i + 1].unshift(...groups[i]);
        }
        groups.splice(i, 1);
        i--;
      }
    }
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      out.push({ words: g, a: g[0].s - 0.08, b: next ? next[0].s - 0.08 : Math.min(g[g.length - 1].e + 0.45, c.end + 0.15) });
    });
  }
  return out;
})();

const Caption: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (t > TL.voEnd + 0.4) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))];
  const o = win(t, ch.a, ch.b, 0.1, 0.1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1296 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k, opacity: Math.max(o, 0.001) }}>
      {lines.map((ln, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            gap: 22 * k,
            background: CREAM,
            border: `${3 * k}px solid ${INK}`,
            boxShadow: `${5 * k}px ${6 * k}px 0 rgba(20,20,24,0.5)`,
            padding: `${6 * k}px ${22 * k}px ${8 * k}px`,
            transform: `rotate(${li ? 0.6 : -0.6}deg)`,
          }}
        >
          {ln.map((w, i) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const said = t >= w.s - 0.03;
            return (
              <span
                key={i}
                style={{
                  fontFamily: OSWALD,
                  fontWeight: 700,
                  fontSize: 52 * k,
                  lineHeight: 1.15,
                  color: active ? P.accentDeep : said ? INK : "rgba(47,48,52,0.45)",
                  transform: `scale(${active ? 1.04 : 1})`,
                  display: "inline-block",
                  borderBottom: `${4 * k}px solid ${active ? P.accent : "transparent"}`,
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Overlay: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const S = SEC;
  const shade = win(t, -1, S.OUTRO[1] + 1, 0.01, 0.01);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* top shade so labels read over the scene */}
      <div style={{ position: "absolute", inset: 0, opacity: shade, background: "linear-gradient(180deg, rgba(38,38,42,0.82) 0%, rgba(38,38,42,0.55) 22%, rgba(38,38,42,0) 36%, rgba(38,38,42,0) 62%, rgba(38,38,42,0.35) 100%)" }} />
      {/* ILUSTRASI chip while the scene reconstructs real events */}
      <div style={{ position: "absolute", right: 48 * k, top: 266 * k, opacity: win(t, -1, S.PENJELASAN[1], 0.01, 0.3), fontFamily: OSWALD, fontWeight: 700, fontSize: 26 * k, letterSpacing: 3 * k, color: INK, background: "rgba(251,247,239,0.88)", padding: `${4 * k}px ${12 * k}px`, border: `${2 * k}px solid ${INK}` }}>
        ILUSTRASI
      </div>

      {/* HOOK */}
      <Big k={k} o={win(t, -1, S.HOOK[1], 0.01, 0.3)} y={290} size={112}>
        MUNDUR ATAU <Acc>BERTAHAN?</Acc>
      </Big>
      <Card k={k} o={win(t, CLIPS[0].words[0].s - 0.1, S.HOOK[1], 0.25, 0.3)} x={60} y={560} w={440} rot={-2} label="ISTANA">
        Wapres berniat mundur
      </Card>
      <Card k={k} o={win(t, A.hookGibran2 - 0.1, S.HOOK[1], 0.25, 0.3)} x={560} y={630} w={460} rot={2} label="GIBRAN">
        Tetap berjuang
      </Card>
      <div style={{ position: "absolute", left: 470 * k, top: 700 * k, opacity: win(t, A.hookJadi, S.HOOK[1], 0.2, 0.3), fontFamily: CAVEAT, fontWeight: 700, fontSize: 170 * k, color: P.accent, transform: `rotate(-8deg) scale(${0.8 + 0.2 * seg(t, A.hookJadi, A.hookJadi + 0.3)})`, textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
        ?
      </div>

      {/* KONTEKS */}
      <Kicker k={k} o={win(t, A.selasa - 0.1, S.KONTEKS[1], 0.3, 0.3)} text="SELASA · 10 NOVEMBER 2026" />
      <Big k={k} o={win(t, A.jam25 - 0.1, A.sore, 0.3, 0.3)} y={372} size={150}>
        ±2,5 <Acc>JAM</Acc>
      </Big>
      <div style={{ position: "absolute", left: 66 * k, top: 580 * k, opacity: win(t, A.bertemu, A.sore, 0.3, 0.3), fontFamily: CAVEAT, fontWeight: 700, fontSize: 52 * k, color: "#F3EBDD", background: "rgba(38,38,42,0.88)", padding: `0 ${14 * k}px` }}>
        Gibran bertemu Presiden Prabowo
      </div>
      <Card k={k} o={win(t, A.mengumumkan - 0.2, S.KONTEKS[1], 0.3, 0.3)} x={60} y={330} w={760} rot={-1} label="MENSESNEG · SORE HARI">
        Gibran menyatakan <Acc>niat</Acc> untuk mengundurkan diri
      </Card>

      {/* PENGEMBANGAN */}
      <Kicker k={k} o={win(t, A.pemicu, A.menurut, 0.3, 0.3)} text="PEMICU: PUTUSAN MAHKAMAH AGUNG" />
      <Card k={k} o={win(t, A.akhir - 0.1, A.menurut, 0.3, 0.3)} x={60} y={336} w={560} rot={-1.5} label="AKHIR OKTOBER 2026 · 742 K/TUN/2026">
        MA membatalkan surat penyetaraan ijazah SMA
      </Card>
      <Card k={k} o={win(t, A.pilpres - 0.1, A.menurut, 0.3, 0.3)} x={640} y={560} w={380} rot={2} dark>
        dipakai untuk Pilpres 2024
      </Card>
      <Big k={k} o={win(t, A.menurut - 0.1, A.putusanIni, 0.3, 0.3)} y={334} size={104}>
        <span style={{ opacity: 0.35 + 0.65 * seg(t, A.kehadiran - 0.1, A.kehadiran + 0.2) }}>KEHADIRAN</span>
        <br />
        <Acc>≠</Acc> <span style={{ opacity: 0.35 + 0.65 * seg(t, A.kelulusan - 0.1, A.kelulusan + 0.2) }}>KELULUSAN</span>
      </Big>
      <div style={{ position: "absolute", left: 66 * k, top: 600 * k, opacity: win(t, A.menurut, A.putusanIni, 0.3, 0.3), fontFamily: CAVEAT, fontWeight: 700, fontSize: 48 * k, color: "#F3EBDD", background: "rgba(38,38,42,0.88)", padding: `0 ${14 * k}px` }}>
        dokumen luar negeri Gibran, menurut MA
      </div>
      <Card k={k} o={win(t, A.putusanIni - 0.1, S.PENGEMBANGAN[1] + 0.2, 0.3, 0.3)} x={60} y={330} w={720} rot={-1} label="PUTUSAN MA">
        menguatkan pertimbangan <Acc>Mahkamah Konstitusi</Acc>
      </Card>

      {/* PENJELASAN */}
      <Big k={k} o={win(t, A.tapi - 0.1, A.istana, 0.3, 0.3)} y={372} size={150}>
        NIAT <Acc>≠</Acc> MUNDUR
      </Big>
      <Card k={k} o={win(t, A.istana - 0.1, A.dpr - 0.2, 0.3, 0.3)} x={50} y={300} w={640} rot={-1.5} label="ISTANA">
        Presiden tidak menolak, hanya memberi saran
      </Card>
      <Card k={k} o={win(t, A.pGibran - 0.1, A.dpr - 0.2, 0.3, 0.3)} x={330} y={470} w={700} rot={1.5} label="GIBRAN">
        {t < A.ia ? "Tidak mengucapkan kata mundur" : t < A.membawa ? "Tetap fight di PTUN" : "Tetap fight di PTUN, dokumen SD sampai S1"}
      </Card>
      <Card k={k} o={win(t, A.kuasa - 0.1, A.dpr - 0.2, 0.3, 0.3)} x={50} y={652} w={620} rot={-1} label="KUASA HUKUM">
        Membantah ada rencana mundur
      </Card>
      <Kicker k={k} o={win(t, A.dpr - 0.1, S.PENJELASAN[1] + 0.2, 0.3, 0.3)} text="DI DPR" />
      <Card k={k} o={win(t, A.usulan - 0.1, S.PENJELASAN[1] + 0.2, 0.3, 0.3)} x={60} y={330} w={700} rot={-1} label="USULAN">
        Hak menyatakan pendapat, di meja pimpinan
      </Card>

      {/* PAYOFF */}
      <Kicker k={k} o={win(t, A.kalau - 0.1, A.wapresP, 0.3, 0.3)} text="JIKA KURSI WAPRES KOSONG" />
      <Big k={k} o={win(t, A.pasal - 0.1, A.wapresP, 0.3, 0.3)} y={322} size={60}>
        PASAL 8 AYAT (2)<br /><Acc>UUD 1945</Acc>
      </Big>
      <Flow k={k} t={t} />
      <Kicker k={k} o={win(t, A.wapresP - 0.1, S.PAYOFF[1] + 0.2, 0.3, 0.3)} text="PRESEDEN · WAPRES PERTAMA" />
      <Big k={k} o={win(t, A.y1956 - 0.1, S.PAYOFF[1] + 0.2, 0.3, 0.3)} y={372} size={150}>
        <Acc>1956</Acc>
      </Big>
      <div style={{ position: "absolute", left: 66 * k, top: 560 * k, opacity: win(t, A.sepucuk - 0.1, S.PAYOFF[1] + 0.2, 0.3, 0.3), fontFamily: CAVEAT, fontWeight: 700, fontSize: 56 * k, color: "#F3EBDD", background: "rgba(38,38,42,0.88)", padding: `0 ${14 * k}px` }}>
        lewat sepucuk surat
      </div>

      {/* OUTRO */}
      <Kicker k={k} o={win(t, A.jadiO - 0.1, A.kami, 0.3, 0.3)} text="STATUS HARI INI" />
      <Card k={k} o={win(t, A.jadiO - 0.1, A.kami, 0.3, 0.3)} x={60} y={330} w={620} rot={-1}>
        <div style={{ opacity: 0.35 + 0.65 * seg(t, A.niatO - 0.1, A.niatO + 0.2) }}>
          NIAT · <Acc>sudah disampaikan</Acc>
        </div>
        <div style={{ opacity: 0.35 + 0.65 * seg(t, A.belum - 0.1, A.belum + 0.2) }}>SURAT · belum ada</div>
      </Card>
      <Big k={k} o={win(t, A.menurutmu - 0.1, OUTRO_AT + 0.2, 0.3, 0.2)} y={334} size={112}>
        MUNDUR ATAU <Acc>BERTAHAN?</Acc>
      </Big>

      {/* name cards (lower third, above captions) */}
      {NAMES.map((n, i) => {
        const o = win(t, n.a - 0.1, n.b, 0.25, 0.25);
        if (o <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 56 * k,
              top: 1130 * k,
              opacity: o,
              transform: `translateX(${(1 - o) * -30 * k}px) rotate(-1.5deg)`,
              background: CREAM,
              border: `${3 * k}px solid ${INK}`,
              boxShadow: `${6 * k}px ${8 * k}px 0 rgba(20,20,24,0.45)`,
              padding: `${8 * k}px ${18 * k}px ${10 * k}px`,
              borderLeft: `${12 * k}px solid ${P.accent}`,
            }}
          >
            <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 38 * k, lineHeight: 1.0, color: INK, textTransform: "uppercase" }}>{n.name}</div>
            <div style={{ fontFamily: OSWALD, fontWeight: 500, fontSize: 30 * k, lineHeight: 1.2, color: P.accentDeep }}>{n.role}</div>
          </div>
        );
      })}

      <Caption k={k} t={t} />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {t < OUTRO_AT + 0.8 && (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.3, 5.0, 6.6], fov: 34, near: 0.05, far: 60 }}>
          <Scene t={t} f={f} />
        </ThreeCanvas>
      )}
      <Overlay k={k} t={t} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
