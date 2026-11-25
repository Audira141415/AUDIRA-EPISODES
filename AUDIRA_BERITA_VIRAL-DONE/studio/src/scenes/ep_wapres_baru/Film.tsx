// EP_WAPRES_BARU film (SATELLITEBRIEFING): "5 Fakta Mundurnya Wapres Gibran"
// OSINT Command Room — one continuous dark room, camera moves through 5 fact zones.
// All hero objects: MeshPhysicalMaterial (rule 19). Post: CYBER_NEON_VOID (rule 18 + style).
// Every beat keyed to word times in timeline.json. Audio muxed separately.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";

type V3 = [number, number, number];
type Word = { w: string; s: number; e: number };
const CLIPS = TL.clips as { id: string; words: Word[] }[];
const SEC = TL.sections as unknown as Record<string, [number, number]>;
const TOTAL = TL.total;
const OUTRO_AT = SEC.OUTRO[0];

const norm = (w: string) => w.toLowerCase().replace(/[.,!?:;—]+$/g, "");
const W = (word: string, n = 0) => {
  const c = CLIPS[0];
  const hits = c.words.filter((x) => norm(x.w) === word.toLowerCase());
  if (!hits[n]) throw new Error(`word not found: ${word}#${n}`);
  return hits[n].s;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

// ------------------------------------------------------------------ palette
const BG = "#0A0C10";
const CYAN = "#00D4FF";
const AMBER = "#FFB020";
const RED = "#FF3344";
const SLATE = "#1A1E28";
const WHITE = "#E8ECF0";

// ------------------------------------------------------------------ word anchors
const A = {
  untuk: W("untuk", 0),
  diri: W("diri", 0),
  dua: W("dua", 0),
  belas: W("belas", 0),
  november: W("november", 0),
  gibran: W("gibran", 0),
  mundur: W("mundur"),
  dua_tahun: W("dua", 2),
  tahun: W("tahun"),
  menjabat: W("menjabat"),
  wapres: W("wapres"),
  prabowo: W("prabowo", 0),
  subianto: W("subianto"),
  mahkamah: W("mahkamah"),
  agung: W("agung"),
  membatalkan: W("membatalkan"),
  putusan: W("putusan"),
  tujuh: W("tujuh"),
  dpr: W("dpr"),
  hak: W("hak"),
  legalitas: W("legalitas"),
  jabatannya: W("jabatannya"),
  pukul: W("pukul"),
  sebelas: W("sebelas"),
  wib: W("wib"),
  menyerahkan: W("menyerahkan"),
  mpr: W("mpr", 0),
  parlemen: W("parlemen"),
  alasan: W("alasan"),
  ketenangan: W("ketenangan"),
  pemerintahan1: W("pemerintahan", 0),
  pasal: W("pasal"),
  delapan: W("delapan"),
  uud: W("uud"),
  presiden2: W("presiden", 1),
  mengusulkan2: W("mengusulkan", 1),
  empat_belas: W("empat", 1),
  mpr2: W("mpr", 1),
  sidang: W("sidang"),
  enam_puluh: W("enam", 1),
  hari: W("hari", 1),
  enam_belas: W("enam", 2),
  foto: W("foto"),
  dicopot: W("dicopot"),
  prabowo2: W("prabowo", 1),
  tanpa: W("tanpa"),
  sementara: W("sementara"),
  ikuti: W("ikuti"),
  audira: W("audira"),
};

// ------------------------------------------------------------------ camera
type CamKey = { t: number; p: V3; q: V3; fov: number };
const CAM_KEYS: CamKey[] = [
  // HOOK: dolly in from door to evidence desk
  { t: 0, p: [0.2, 1.8, 6.5], q: [0, 0.9, 0], fov: 38 },
  { t: A.diri + 0.2, p: [0.1, 1.4, 2.8], q: [0, 0.9, -0.3], fov: 36 },
  // FAKTA 1: pan right to dossier zone
  { t: A.dua, p: [0.8, 1.35, 2.2], q: [2.5, 0.9, -0.8], fov: 36 },
  { t: A.gibran, p: [2.0, 1.3, 1.0], q: [2.8, 0.95, -0.6], fov: 34 },
  // FAKTA 1b: tilt up to screen (timeline bar)
  { t: A.dua_tahun, p: [1.5, 1.8, 0.8], q: [0, 2.2, -3.8], fov: 36 },
  { t: A.subianto, p: [0.8, 2.0, 0.5], q: [0, 2.4, -3.8], fov: 38 },
  // FAKTA 2: orbit left to cork board (wider framing)
  { t: A.mahkamah, p: [-0.5, 1.6, 0.5], q: [-3.2, 1.8, -2.8], fov: 38 },
  { t: A.putusan, p: [-1.2, 1.7, 0.2], q: [-3.2, 1.8, -2.8], fov: 36 },
  // FAKTA 2b: approach cork but keep context visible
  { t: A.dpr, p: [-1.6, 1.7, -0.4], q: [-3.3, 1.7, -2.6], fov: 34 },
  { t: A.jabatannya, p: [-1.4, 1.65, -0.2], q: [-3.3, 1.75, -2.7], fov: 35 },
  // FAKTA 3: crane up to parliament desk
  { t: A.pukul, p: [-0.5, 2.8, -2.0], q: [0, 0.7, -5.5], fov: 36 },
  { t: A.mpr, p: [0.3, 2.5, -2.8], q: [0, 0.8, -5.5], fov: 35 },
  // FAKTA 3b: dolly across — letter + name plate
  { t: A.alasan, p: [1.2, 2.0, -3.5], q: [0.5, 0.75, -5.2], fov: 34 },
  { t: A.pemerintahan1, p: [1.5, 1.8, -3.8], q: [0.3, 0.8, -5.3], fov: 34 },
  // FAKTA 4: pull back wide — countdown HUD
  { t: A.pasal, p: [0, 2.6, 1.5], q: [0, 1.2, -2.0], fov: 40 },
  { t: A.empat_belas, p: [0.3, 2.4, 1.8], q: [0, 1.0, -2.0], fov: 42 },
  // FAKTA 4b: scan line sweep — MPR slots
  { t: A.mpr2, p: [-0.2, 2.2, 0.8], q: [0, 1.2, -2.5], fov: 40 },
  { t: A.hari, p: [0.2, 2.1, 0.6], q: [0, 1.0, -2.5], fov: 40 },
  // FAKTA 5: orbit back to desk — photo frame
  { t: A.enam_belas, p: [1.2, 1.4, 1.0], q: [0, 0.9, -0.2], fov: 36 },
  { t: A.prabowo2, p: [0.5, 1.5, 1.5], q: [0, 0.9, 0], fov: 36 },
  // FAKTA 5b: pull back to door — full room
  { t: A.tanpa, p: [0, 1.9, 4.0], q: [0, 1.0, -1.5], fov: 40 },
  { t: A.sementara, p: [0.1, 2.0, 4.8], q: [0, 1.0, -1.0], fov: 42 },
  // CTA: hold at distance
  { t: A.ikuti, p: [0, 2.1, 5.2], q: [0, 1.0, -1.0], fov: 42 },
  { t: TOTAL, p: [0, 2.3, 5.5], q: [0, 1.0, -1.0], fov: 42 },
];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const pose = (t: number) => {
  let i = CAM_KEYS.findIndex((k, j) => j < CAM_KEYS.length - 1 && t >= k.t && t < CAM_KEYS[j + 1].t);
  if (i < 0) i = t < CAM_KEYS[0].t ? 0 : CAM_KEYS.length - 2;
  const k0 = CAM_KEYS[Math.max(0, i - 1)], k1 = CAM_KEYS[i], k2 = CAM_KEYS[i + 1], k3 = CAM_KEYS[Math.min(CAM_KEYS.length - 1, i + 2)];
  const raw = clamp01((t - k1.t) / (k2.t - k1.t));
  const u = raw * 0.55 + smooth(raw) * 0.45;
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

// ------------------------------------------------------------------ CanvasTexture helpers
const useTex = (draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number, deps: unknown[] = []) =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

// ------------------------------------------------------------------ 3D scene objects

const EvidenceDesk: React.FC = () => (
  <group>
    {/* desk top */}
    <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.4, 0.08, 1.6]} />
      <meshPhysicalMaterial color={SLATE} clearcoat={0.3} roughness={0.15} metalness={0.1} />
    </mesh>
    {/* desk legs */}
    {[[-1.5, 0, -0.6], [1.5, 0, -0.6], [-1.5, 0, 0.6], [1.5, 0, 0.6]].map((p, i) => (
      <mesh key={i} position={p as V3} castShadow>
        <boxGeometry args={[0.08, 0.84, 0.08]} />
        <meshPhysicalMaterial color="#141820" roughness={0.4} metalness={0.3} />
      </mesh>
    ))}
    {/* desk front panel */}
    <mesh position={[0, 0.21, 0.78]} castShadow>
      <boxGeometry args={[3.2, 0.42, 0.04]} />
      <meshPhysicalMaterial color="#161A22" clearcoat={0.1} roughness={0.3} />
    </mesh>
  </group>
);

const VPChair: React.FC<{ t: number }> = ({ t }) => {
  const glow = 1.5 + Math.sin(t * 2.2) * 0.8;
  return (
    <group position={[0, 0.46, -0.3]}>
      {/* seat */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.08, 0.5]} />
        <meshPhysicalMaterial color="#1A1210" roughness={0.5} metalness={0.05} clearcoat={0.15} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.65, -0.22]} castShadow>
        <boxGeometry args={[0.58, 0.8, 0.06]} />
        <meshPhysicalMaterial color="#1A1210" roughness={0.5} metalness={0.05} clearcoat={0.15} />
      </mesh>
      {/* amber rim at top */}
      <mesh position={[0, 1.08, -0.22]}>
        <boxGeometry args={[0.62, 0.06, 0.08]} />
        <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={glow} roughness={0.3} />
      </mesh>
      {/* legs */}
      {[[-0.22, 0, 0.18], [0.22, 0, 0.18], [-0.22, 0, -0.18], [0.22, 0, -0.18]].map((p, i) => (
        <mesh key={i} position={p as V3}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 8]} />
          <meshPhysicalMaterial color="#2A2A2A" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const DossierCard: React.FC<{ pos: V3; label: string; t: number; showAt: number }> = ({ pos, label, t, showAt }) => {
  const s = seg(t, showAt - 0.2, showAt + 0.3);
  const tex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#F0EBE0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1A1E28";
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, w / 2, h / 2 + 14);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
  }, 256, 160, [label]);
  if (s <= 0.001) return null;
  return (
    <mesh position={pos} rotation={[-0.15, 0, (Math.random() - 0.5) * 0.08]} scale={[s, s, s]} castShadow>
      <planeGeometry args={[0.6, 0.38]} />
      <meshPhysicalMaterial map={tex} roughness={0.6} clearcoat={0} />
    </mesh>
  );
};

const TimelineBar: React.FC<{ t: number }> = ({ t }) => {
  const progress = seg(t, A.dua_tahun, A.subianto);
  const tex = useTex((ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,16,0.9)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = CYAN;
    ctx.fillRect(20, h / 2 - 4, (w - 40) * 0.85, 8);
    ctx.fillStyle = AMBER;
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("2024", 24, 36);
    ctx.fillText("2026", w - 90, 36);
    ctx.fillStyle = WHITE;
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("2 TAHUN MENJABAT", w / 2 - 100, h - 18);
  }, 512, 128, []);
  if (progress <= 0.001) return null;
  return (
    <mesh position={[0, 2.8, -3.9]} scale={[2.5 * progress, 0.6, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={tex} transparent emissive={CYAN} emissiveIntensity={0.3} />
    </mesh>
  );
};

const CorkBoard: React.FC<{ t: number }> = ({ t }) => {
  const boardShow = seg(t, SEC.FAKTA2[0] - 0.5, SEC.FAKTA2[0] + 0.3);
  const corkTex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#A07830";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(${120 + Math.random() * 60}, ${80 + Math.random() * 40}, ${20 + Math.random() * 30}, 0.3)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }
  }, 256, 256, []);
  const docTex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#F5F0E5";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1A1E28";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("PUTUSAN MA", 20, 40);
    ctx.font = "18px monospace";
    ctx.fillText("No. 742 K/TUN/2026", 20, 72);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(10, 90); ctx.lineTo(w - 10, 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(w - 10, 90); ctx.stroke();
  }, 256, 128, []);
  const hmpTex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#F0EBE0";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1A1E28";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("HMP DPR", 20, 36);
    ctx.font = "16px sans-serif";
    ctx.fillText("Hak Menyatakan", 20, 60);
    ctx.fillText("Pendapat", 20, 80);
  }, 200, 100, []);
  return (
    <group position={[-3.5, 1.8, -3]} rotation={[0, 0.4, 0]} scale={[1, Math.max(0.001, boardShow), 1]} visible={boardShow > 0.001}>
      {/* data screen behind cork board for depth separation */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[2.6, 2.0]} />
        <meshStandardMaterial color="#061828" emissive={CYAN} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* edge glow strips around board */}
      <mesh position={[0, 0.82, 0.03]}>
        <boxGeometry args={[2.1, 0.03, 0.02]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.82, 0.03]}>
        <boxGeometry args={[2.1, 0.03, 0.02]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 1.2]} intensity={3} color={AMBER} distance={4} />
      {/* board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.5, 0.08]} />
        <meshPhysicalMaterial map={corkTex} roughness={0.8} />
      </mesh>
      {/* frame */}
      {[[-1.0, 0.75, 0.05], [1.0, 0.75, 0.05], [-1.0, -0.75, 0.05], [1.0, -0.75, 0.05]].map((_, i) => (
        <mesh key={i} position={[i < 2 ? 0 : 0, i % 2 === 0 ? 0.78 : -0.78, 0.045]}>
          <boxGeometry args={[2.1, 0.06, 0.06]} />
          <meshPhysicalMaterial color="#5A3A18" roughness={0.6} metalness={0.1} clearcoat={0.2} />
        </mesh>
      ))}
      {/* putusan MA doc */}
      <mesh position={[-0.35, 0.15, 0.05]} rotation={[0, 0, 0.05]}>
        <planeGeometry args={[0.7, 0.36]} />
        <meshPhysicalMaterial map={docTex} roughness={0.6} />
      </mesh>
      {/* pushpin red */}
      <group position={[-0.35, 0.38, 0.06]}>
        <mesh>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshPhysicalMaterial color={RED} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.03]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 6]} />
          <meshPhysicalMaterial color="#888" metalness={0.8} roughness={0.15} />
        </mesh>
      </group>
      {/* HMP DPR card */}
      <mesh position={[0.45, -0.15, 0.05]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[0.55, 0.28]} />
        <meshPhysicalMaterial map={hmpTex} roughness={0.6} />
      </mesh>
      {/* pushpin 2 */}
      <group position={[0.45, 0.02, 0.06]}>
        <mesh>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshPhysicalMaterial color={AMBER} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

const ParliamentDesk: React.FC<{ t: number }> = ({ t }) => {
  const show = seg(t, SEC.FAKTA3[0] - 0.4, SEC.FAKTA3[0] + 0.3);
  const clockAngle = -((11 * 60 + 20) / 720) * Math.PI * 2;
  const minuteAngle = -(20 / 60) * Math.PI * 2;
  const clockGlow = 2.0 + Math.sin(t * 3) * 0.5;
  const nameTex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#C0A040";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1A1210";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KETUA MPR", w / 2, h / 2 + 7);
  }, 200, 48, []);
  const letterTex = useTex((ctx, w, h) => {
    ctx.fillStyle = "#F5F0E5";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1A1E28";
    ctx.font = "14px sans-serif";
    const lines = ["Surat Pengunduran Diri", "", "Kepada YTH Pimpinan MPR", "Di Kompleks Parlemen", "", "Dengan ini saya...", "", "Gibran Rakabuming Raka"];
    lines.forEach((l, i) => ctx.fillText(l, 20, 24 + i * 18));
  }, 200, 200, []);
  return (
    <group position={[0, 0, -5.5]} scale={[1, Math.max(0.001, show), 1]} visible={show > 0.001}>
      {/* status screen behind parliament desk for depth separation */}
      <mesh position={[0, 1.8, -1.0]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial color="#081020" emissive={CYAN} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* horizontal glow bar above desk */}
      <mesh position={[0, 0.7, -0.3]}>
        <boxGeometry args={[2.6, 0.03, 0.02]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.5, 1.0]} intensity={4} color="#FFF0D8" distance={5} />
      {/* desk */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1.0]} />
        <meshPhysicalMaterial color="#5A3818" roughness={0.4} clearcoat={0.2} />
      </mesh>
      {/* legs */}
      {[[-1.0, 0, -0.35], [1.0, 0, -0.35], [-1.0, 0, 0.35], [1.0, 0, 0.35]].map((p, i) => (
        <mesh key={i} position={p as V3} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshPhysicalMaterial color="#4A2A10" roughness={0.5} />
        </mesh>
      ))}
      {/* clock */}
      <group position={[0.8, 0.38, 0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
          <meshPhysicalMaterial color="#C0A040" metalness={0.7} roughness={0.15} emissive={AMBER} emissiveIntensity={clockGlow} />
        </mesh>
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 32]} />
          <meshPhysicalMaterial color="#F5F0E0" roughness={0.5} />
        </mesh>
        {/* hour hand */}
        <mesh position={[Math.sin(clockAngle) * 0.06, 0.03, -Math.cos(clockAngle) * 0.06]} rotation={[-Math.PI / 2, 0, clockAngle]}>
          <boxGeometry args={[0.015, 0.1, 0.005]} />
          <meshStandardMaterial color="#1A1210" />
        </mesh>
        {/* minute hand */}
        <mesh position={[Math.sin(minuteAngle) * 0.08, 0.035, -Math.cos(minuteAngle) * 0.08]} rotation={[-Math.PI / 2, 0, minuteAngle]}>
          <boxGeometry args={[0.01, 0.14, 0.004]} />
          <meshStandardMaterial color="#1A1210" />
        </mesh>
      </group>
      {/* name plate */}
      <mesh position={[-0.5, 0.39, 0.3]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.03]} />
        <meshPhysicalMaterial map={nameTex} roughness={0.3} metalness={0.4} clearcoat={0.3} />
      </mesh>
      {/* letter on desk */}
      <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0.05]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshPhysicalMaterial map={letterTex} roughness={0.6} />
      </mesh>
    </group>
  );
};

const ScreenPanel: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 0.5 + Math.sin(t * 1.8) * 0.15;
  return (
    <>
      {/* dark wall behind screen */}
      <mesh position={[0, 2.5, -4.5]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#060810" />
      </mesh>
      {/* screen itself */}
      <mesh position={[0, 2.4, -4.2]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#081020" emissive={CYAN} emissiveIntensity={pulse} />
      </mesh>
      {/* subtle scan lines on screen */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 1.2 + i * 0.35, -4.15]}>
          <boxGeometry args={[5.5, 0.003, 0.001]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.1} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

const Room: React.FC = () => (
  <>
    {/* floor — semi-reflective for depth */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshPhysicalMaterial color="#0F1216" roughness={0.5} metalness={0.05} clearcoat={0.15} />
    </mesh>
    {/* ceiling */}
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#060810" />
    </mesh>
    {/* left wall */}
    <mesh position={[-6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[20, 5]} />
      <meshStandardMaterial color="#080C12" />
    </mesh>
    {/* right wall */}
    <mesh position={[6, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[20, 5]} />
      <meshStandardMaterial color="#080C12" />
    </mesh>
    {/* LED strip along left wall base */}
    <mesh position={[-5.98, 0.03, 0]} rotation={[0, Math.PI / 2, 0]}>
      <boxGeometry args={[16, 0.04, 0.02]} />
      <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2} toneMapped={false} />
    </mesh>
    {/* LED strip along right wall base */}
    <mesh position={[5.98, 0.03, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <boxGeometry args={[16, 0.04, 0.02]} />
      <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2} toneMapped={false} />
    </mesh>
    {/* left wall data panel 1 (always visible) */}
    <mesh position={[-5.95, 2.0, -1]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[2.0, 1.2]} />
      <meshStandardMaterial color="#081828" emissive={CYAN} emissiveIntensity={0.4} toneMapped={false} />
    </mesh>
    {/* right wall data panel */}
    <mesh position={[5.95, 2.0, 1]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[1.8, 1.0]} />
      <meshStandardMaterial color="#081828" emissive={CYAN} emissiveIntensity={0.3} toneMapped={false} />
    </mesh>
    {/* left wall data panel 2 (further back) */}
    <mesh position={[-5.95, 1.6, 2]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[1.5, 0.8]} />
      <meshStandardMaterial color="#0C1420" emissive={AMBER} emissiveIntensity={0.3} toneMapped={false} />
    </mesh>
    {/* grid lines on floor */}
    {Array.from({ length: 41 }, (_, i) => {
      const p = -10 + i * 0.5;
      return (
        <React.Fragment key={i}>
          <mesh position={[p, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.005, 20]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.06} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.001, p]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[0.005, 20]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.06} toneMapped={false} />
          </mesh>
        </React.Fragment>
      );
    })}
    {/* fog for depth */}
    <fog attach="fog" args={[BG, 1.8, 10]} />
  </>
);

const FGSilhouettes: React.FC<{ t: number }> = ({ t }) => {
  const breathe = Math.sin(t * 1.5) * 0.02;
  return (
    <>
      {/* left figure */}
      <group position={[-2.0, 0, 3.0]}>
        <mesh position={[0, 1.05 + breathe, 0]} castShadow>
          <boxGeometry args={[0.5, 2.1, 0.3]} />
          <meshPhysicalMaterial color="#0F1418" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <boxGeometry args={[0.52, 0.1, 0.32]} />
          <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3} roughness={0.3} />
        </mesh>
      </group>
      {/* right figure */}
      <group position={[2.4, 0, 3.4]}>
        <mesh position={[0, 1.15 + breathe, 0]} castShadow>
          <boxGeometry args={[0.45, 2.3, 0.28]} />
          <meshPhysicalMaterial color="#0F1418" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <boxGeometry args={[0.47, 0.1, 0.3]} />
          <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3} roughness={0.3} />
        </mesh>
      </group>
      {/* center-left subtle figure */}
      <group position={[-0.8, 0, 4.5]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.4, 1.8, 0.25]} />
          <meshPhysicalMaterial color="#0C1015" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <boxGeometry args={[0.42, 0.08, 0.27]} />
          <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={2} roughness={0.3} />
        </mesh>
      </group>
    </>
  );
};

const CountdownHUD: React.FC<{ t: number }> = ({ t }) => {
  const show14 = win(t, A.empat_belas - 0.2, A.mpr2 - 0.2, 0.4, 0.3);
  const show60 = win(t, A.enam_puluh - 0.2, A.hari + 0.5, 0.4, 0.3);
  const tex14 = useTex((ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,16,0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = AMBER;
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("14 HARI", w / 2, h / 2 - 10);
    ctx.fillStyle = WHITE;
    ctx.font = "24px sans-serif";
    ctx.fillText("2 NAMA CALON", w / 2, h / 2 + 30);
  }, 320, 160, []);
  const tex60 = useTex((ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,16,0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = CYAN;
    ctx.font = "bold 56px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("60 HARI", w / 2, h / 2 - 10);
    ctx.fillStyle = WHITE;
    ctx.font = "24px sans-serif";
    ctx.fillText("SIDANG MPR", w / 2, h / 2 + 30);
  }, 320, 160, []);
  return (
    <>
      {show14 > 0.001 && (
        <mesh position={[-1.2, 2.2, -1.5]} scale={[show14, show14, 1]}>
          <planeGeometry args={[1.2, 0.6]} />
          <meshStandardMaterial map={tex14} transparent emissive={AMBER} emissiveIntensity={0.5} />
        </mesh>
      )}
      {show60 > 0.001 && (
        <mesh position={[1.2, 2.2, -1.5]} scale={[show60, show60, 1]}>
          <planeGeometry args={[1.2, 0.6]} />
          <meshStandardMaterial map={tex60} transparent emissive={CYAN} emissiveIntensity={0.5} />
        </mesh>
      )}
    </>
  );
};

const ScanLine: React.FC<{ t: number }> = ({ t }) => {
  const progress = seg(t, A.mpr2 - 0.3, A.hari);
  if (progress <= 0.001 || progress >= 0.999) return null;
  const x = -5 + progress * 10;
  return (
    <mesh position={[x, 1.5, -1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.04, 3.5]} />
      <meshBasicMaterial color={AMBER} transparent opacity={0.7} toneMapped={false} />
    </mesh>
  );
};

const MPRSlots: React.FC<{ t: number }> = ({ t }) => {
  const show = win(t, A.mpr2 - 0.3, A.hari + 0.8, 0.4, 0.4);
  if (show <= 0.001) return null;
  const glow = 2 + Math.sin(t * 4) * 0.8;
  return (
    <group>
      <mesh position={[-0.8, 1.2, -2.5]} scale={[show, show, show]}>
        <boxGeometry args={[0.5, 0.8, 0.12]} />
        <meshPhysicalMaterial color={SLATE} emissive={AMBER} emissiveIntensity={glow} roughness={0.4} />
      </mesh>
      <mesh position={[0.8, 1.2, -2.5]} scale={[show, show, show]}>
        <boxGeometry args={[0.5, 0.8, 0.12]} />
        <meshPhysicalMaterial color={SLATE} emissive={AMBER} emissiveIntensity={glow} roughness={0.4} />
      </mesh>
    </group>
  );
};

const PhotoFrame: React.FC<{ t: number }> = ({ t }) => {
  const show = seg(t, A.foto - 0.3, A.foto + 0.3);
  if (show <= 0.001) return null;
  return (
    <group position={[0.6, 0.47, 0.2]} rotation={[Math.PI / 2, 0, 0.1]} scale={[show, show, show]}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.45, 0.025]} />
        <meshPhysicalMaterial color="#5A3818" roughness={0.5} clearcoat={0.2} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ lighting
const Lighting: React.FC = () => (
  <>
    <ambientLight intensity={0.12} color="#405060" />
    <hemisphereLight args={["#304050", "#0A0C10", 0.15]} />
    {/* spot from above desk */}
    <spotLight
      position={[0, 5, 1]}
      intensity={3}
      angle={Math.PI / 4}
      penumbra={0.4}
      color="#FFF8F0"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0003}
      shadow-radius={4}
    />
    {/* rect area from screen panel (cyan fill) */}
    <rectAreaLight position={[0, 2.4, -3.8]} width={6} height={3} intensity={2.2} color={CYAN} />
    {/* amber accent on HUD + pushpin */}
    <pointLight position={[0, 2.0, -0.5]} intensity={1.8} color={AMBER} distance={8} />
    {/* rim backlight for depth separation */}
    <spotLight position={[0, 3.5, 6]} intensity={3.5} color="#506878" angle={Math.PI / 3} penumbra={0.5} />
    {/* secondary rim from left */}
    <spotLight position={[-5, 3, 3]} intensity={2.0} color={CYAN} angle={Math.PI / 4} penumbra={0.7} />
    {/* secondary fill from right */}
    <directionalLight position={[5, 3, 2]} intensity={0.6} color="#607080" />
  </>
);

// ------------------------------------------------------------------ 3D scene
const Scene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CameraRig t={t} />
    <Lighting />
    <Room />
    <ScreenPanel t={t} />
    <EvidenceDesk />
    <VPChair t={t} />
    <DossierCard pos={[1.2, 0.47, 0]} label="GIBRAN" t={t} showAt={A.gibran} />
    <DossierCard pos={[1.0, 0.48, 0.25]} label="12 NOV 2026" t={t} showAt={A.dua} />
    <TimelineBar t={t} />
    <CorkBoard t={t} />
    <ParliamentDesk t={t} />
    <CountdownHUD t={t} />
    <ScanLine t={t} />
    <MPRSlots t={t} />
    <PhotoFrame t={t} />
    <FGSilhouettes t={t} />
    <Finish
      frame={t * 60}
      background={BG}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      exposure={1.35}
      envIntensity={0.7}
      ao={true}
      focus={2.5}
      aperture={0.018}
      maxBlur={0.005}
    />
  </>
);

// ------------------------------------------------------------------ 2D HUD overlay
const HudChip: React.FC<{ k: number; o: number; text: string; x: number; y: number; color?: string; mono?: boolean; size?: number }> = ({
  k, o, text, x, y, color = AMBER, mono = false, size = 128,
}) => {
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute",
      left: x * k,
      top: y * k,
      opacity: o,
      transform: `translateX(${(1 - o) * -20 * k}px)`,
      background: "rgba(10,12,16,0.86)",
      border: `2px solid ${color}`,
      borderLeft: `4px solid ${color}`,
      padding: `${6 * k}px ${14 * k}px`,
      borderRadius: 4 * k,
      fontFamily: mono ? "'Consolas', 'Courier New', monospace" : "'Inter', 'Segoe UI', sans-serif",
      fontSize: (size / 2.5) * k,
      fontWeight: 800,
      letterSpacing: mono ? 1.5 * k : 0.5 * k,
      color: WHITE,
      whiteSpace: "nowrap",
    }}>
      {text}
    </div>
  );
};

const Kicker: React.FC<{ k: number; o: number; text: string }> = ({ k, o, text }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute",
      left: 56 * k,
      top: 72 * k,
      opacity: o,
      fontSize: 14 * k,
      fontWeight: 700,
      letterSpacing: 3 * k,
      color: AMBER,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      textTransform: "uppercase",
    }}>
      {text}
    </div>
  );
};

const BigText: React.FC<{ k: number; o: number; y: number; size: number; children: React.ReactNode }> = ({ k, o, y, size, children }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute",
      left: 56 * k,
      top: y * k,
      opacity: o,
      transform: `translateY(${(1 - o) * 12 * k}px)`,
      fontSize: size * k,
      fontWeight: 900,
      lineHeight: 1.08,
      color: WHITE,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {children}
    </div>
  );
};

const Overlay: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const S = SEC as unknown as Record<string, [number, number]>;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* HOOK title */}
      <Kicker k={k} o={win(t, 0, A.diri + 0.3, 0.3, 0.3)} text="BRIEFING KONSTITUSIONAL" />
      <BigText k={k} o={win(t, 0.3, A.diri + 0.3, 0.4, 0.3)} y={120} size={56}>
        WAPRES<br /><span style={{ color: AMBER }}>MUNDUR</span>
      </BigText>

      {/* FAKTA 1 */}
      <Kicker k={k} o={win(t, A.dua - 0.1, S.FAKTA1[1], 0.3, 0.3)} text="FAKTA 1 · TANGGAL BERSEJARAH" />
      <HudChip k={k} o={win(t, A.november - 0.1, A.gibran + 2, 0.3, 0.3)} text="12 NOV 2026" x={56} y={300} size={140} />
      <HudChip k={k} o={win(t, A.dua_tahun - 0.1, S.FAKTA1[1], 0.3, 0.3)} text="2 TAHUN MENJABAT" x={56} y={400} color={CYAN} />

      {/* FAKTA 2 */}
      <Kicker k={k} o={win(t, A.mahkamah - 0.1, S.FAKTA2[1], 0.3, 0.3)} text="FAKTA 2 · PEMICU: PUTUSAN MA" />
      <HudChip k={k} o={win(t, A.putusan - 0.1, A.dpr - 0.5, 0.3, 0.3)} text="No. 742 K/TUN/2026" x={56} y={300} mono size={128} />
      <HudChip k={k} o={win(t, A.dpr - 0.1, S.FAKTA2[1], 0.3, 0.3)} text="HMP DPR" x={56} y={400} color={RED} />

      {/* FAKTA 3 */}
      <Kicker k={k} o={win(t, A.pukul - 0.1, S.FAKTA3[1], 0.3, 0.3)} text="FAKTA 3 · KRONOLOGI" />
      <HudChip k={k} o={win(t, A.wib - 0.1, A.alasan - 0.3, 0.3, 0.3)} text="11:20 WIB" x={56} y={300} size={140} />
      <HudChip k={k} o={win(t, A.alasan - 0.1, S.FAKTA3[1], 0.3, 0.3)} text="ALASAN: KETENANGAN PEMERINTAHAN" x={56} y={400} color={CYAN} size={100} />

      {/* FAKTA 4 */}
      <Kicker k={k} o={win(t, A.pasal - 0.1, S.FAKTA4[1], 0.3, 0.3)} text="FAKTA 4 · MEKANISME KONSTITUSIONAL" />
      <HudChip k={k} o={win(t, A.uud - 0.1, A.presiden2, 0.3, 0.3)} text="PASAL 8 AYAT 2 UUD 1945" x={56} y={300} mono />
      <HudChip k={k} o={win(t, A.empat_belas - 0.1, A.mpr2, 0.3, 0.3)} text="14 HARI → 2 NAMA" x={56} y={400} />
      <HudChip k={k} o={win(t, A.enam_puluh - 0.1, S.FAKTA4[1], 0.3, 0.3)} text="60 HARI → SIDANG MPR" x={56} y={480} color={CYAN} />

      {/* FAKTA 5 */}
      <Kicker k={k} o={win(t, A.enam_belas - 0.1, S.FAKTA5[1], 0.3, 0.3)} text="FAKTA 5 · DAMPAK LANGSUNG" />
      <HudChip k={k} o={win(t, A.enam_belas - 0.1, A.prabowo2, 0.3, 0.3)} text="16 NOV 2026" x={56} y={300} />
      <HudChip k={k} o={win(t, A.tanpa - 0.1, A.sementara + 0.3, 0.3, 0.3)} text="TANPA WAPRES — SEMENTARA" x={56} y={400} color={RED} />

      {/* CTA */}
      <BigText k={k} o={win(t, A.ikuti - 0.1, OUTRO_AT + 0.2, 0.3, 0.3)} y={340} size={48}>
        IKUTI <span style={{ color: CYAN }}>@AudiraExplained</span>
      </BigText>

      {/* bottom telemetry strip */}
      <div style={{
        position: "absolute",
        bottom: 24 * k,
        right: 40 * k,
        fontSize: 11 * k,
        fontFamily: "'Consolas', 'Courier New', monospace",
        color: "rgba(255,255,255,0.35)",
        textAlign: "right",
        lineHeight: 1.4,
      }}>
        AUDIRA MOTION v4.3<br />
        SATELLITEBRIEFING // CYBER_NEON_VOID
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ karaoke caption
const Caption: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const words = CLIPS[0].words;
  const active = words.filter((w) => t >= w.s - 0.05 && t <= w.e + 0.05);
  if (active.length === 0) return null;
  const idx = words.indexOf(active[0]);
  const start = Math.max(0, idx - 2);
  const end = Math.min(words.length, idx + 6);
  const slice = words.slice(start, end);
  return (
    <div style={{
      position: "absolute",
      bottom: 180 * k,
      left: 56 * k,
      right: 56 * k,
      textAlign: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontWeight: 700,
      fontSize: 38 * k,
      lineHeight: 1.3,
      textShadow: `0 ${2 * k}px ${8 * k}px rgba(0,0,0,0.9)`,
    }}>
      {slice.map((w, i) => {
        const isActive = t >= w.s - 0.05 && t <= w.e + 0.05;
        return (
          <span key={start + i} style={{ color: isActive ? AMBER : "rgba(255,255,255,0.75)", marginRight: 8 * k }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ Film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {t < OUTRO_AT + 0.8 && (
        <ThreeCanvas
          width={width}
          height={height}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          camera={{ position: [0.2, 1.8, 6.5], fov: 38, near: 0.05, far: 60 }}
        >
          <Scene t={t} />
        </ThreeCanvas>
      )}
      <Overlay k={k} t={t} />
      <Caption k={k} t={t} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
