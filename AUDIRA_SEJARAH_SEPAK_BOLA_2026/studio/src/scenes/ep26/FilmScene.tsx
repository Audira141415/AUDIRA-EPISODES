import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ForensicDesk3D } from "../../kits/visualinvestigation/scene/ForensicDesk3D.tsx";
import { VISUALINVESTIGATION_PALETTE as P } from "../../kits/visualinvestigation/lib/palette.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { seg, clamp01, setAt, T, CUT } from "./timing.ts";

type V3 = [number, number, number];

// ---------- Catmull-Rom spline ----------
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const cr3 = (a: V3, b: V3, c: V3, d: V3, u: number): V3 => [cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u), cr(a[2], b[2], c[2], d[2], u)];
type Key = { t: number; pos: V3; target: V3; fov: number };
const path = (keys: Key[], t: number) => {
  const n = keys.length;
  let i = 0;
  for (let k = 0; k < n - 1; k++) if (t >= keys[k].t) i = k;
  const a = keys[Math.max(0, i - 1)], b = keys[i], c = keys[Math.min(n - 1, i + 1)], d = keys[Math.min(n - 1, i + 2)];
  const u = clamp01((t - b.t) / Math.max(0.001, c.t - b.t));
  const su = u * u * (3 - 2 * u);
  return { pos: cr3(a.pos, b.pos, c.pos, d.pos, su), target: cr3(a.target, b.target, c.target, d.target, su), fov: cr(a.fov, b.fov, c.fov, d.fov, su) };
};

// ---------- camera keys per set ----------
const KEYS: Record<string, Key[]> = {
  hook: [
    { t: 0, pos: [0, 2.15, 5.4], target: [0, 0.25, 0], fov: 30 },
    { t: 3.5, pos: [0.3, 2.1, 5.2], target: [0.1, 0.2, 0], fov: 30 },
    { t: 7, pos: [-0.2, 2.0, 5.0], target: [-0.1, 0.15, 0], fov: 30 },
  ],
  wiretaps: [
    { t: CUT.konteks, pos: [-0.4, 2.3, 5.3], target: [-0.2, 0.3, 0], fov: 30 },
    { t: 15, pos: [0.5, 1.9, 4.8], target: [0.3, 0.15, 0], fov: 29 },
    { t: CUT.pengembangan, pos: [0, 2.4, 5.5], target: [0, 0.35, 0], fov: 30 },
  ],
  fiveClubs: [
    { t: CUT.pengembangan, pos: [0.6, 2.5, 5.6], target: [0.2, 0.4, 0], fov: 30 },
    { t: 31, pos: [-0.5, 1.8, 4.6], target: [-0.2, 0.1, 0], fov: 29 },
    { t: CUT.penjelasan, pos: [0, 2.2, 5.2], target: [0, 0.25, 0], fov: 30 },
  ],
  verdict: [
    { t: CUT.penjelasan, pos: [-0.3, 2.0, 5.0], target: [-0.1, 0.2, 0], fov: 30 },
    { t: 50, pos: [0.4, 2.4, 5.4], target: [0.2, 0.3, 0], fov: 29 },
    { t: 60, pos: [-0.2, 1.8, 4.6], target: [0, 0.1, 0], fov: 29 },
    { t: CUT.payoff, pos: [0.1, 2.1, 5.1], target: [0, 0.2, 0], fov: 30 },
  ],
  irony: [
    { t: CUT.payoff, pos: [0.3, 2.3, 5.5], target: [0.1, 0.3, 0], fov: 30 },
    { t: 76, pos: [-0.4, 1.9, 4.7], target: [-0.1, 0.15, 0], fov: 29 },
    { t: 84, pos: [0, 2.5, 5.8], target: [0, 0.4, 0], fov: 30 },
    { t: CUT.outro, pos: [0, 2.0, 5.0], target: [0, 0.2, 0], fov: 30 },
  ],
  outro: [
    { t: CUT.outro, pos: [0, 2.0, 5.0], target: [0, 0.2, 0], fov: 30 },
    { t: 92, pos: [0, 2.1, 5.2], target: [0, 0.25, 0], fov: 30 },
    { t: 97, pos: [0, 2.0, 5.0], target: [0, 0.2, 0], fov: 30 },
  ],
};

// ---------- camera rig ----------
const CameraRig: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const set = setAt(t);
  const keys = KEYS[set] ?? KEYS.hook;
  const { pos, target, fov } = path(keys, t);
  const shake = 0.006 * Math.sin(frame * 0.029) * (1 - seg(t, CUT.outro, CUT.outro + 2));
  camera.position.set(pos[0] + shake, pos[1] + shake * 0.5, pos[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

// ---------- evidence props ----------
const EvidenceDoc: React.FC<{ pos: V3; rot?: V3; w?: number; h?: number; o?: number; highlighted?: boolean; highlightY?: number; highlightProgress?: number }> = ({
  pos, rot = [0, 0, 0], w = 1.2, h = 1.6, o = 1, highlighted, highlightY = 0.1, highlightProgress = 0,
}) => (
  <group position={pos} rotation={rot}>
    <mesh>
      <RoundedBoxGeo args={[w, h, 0.03]} radius={0.01} />
      <meshStandardMaterial color={P.archivalPaper} roughness={0.95} transparent opacity={o} />
    </mesh>
    {[0.45, 0.28, 0.11, -0.06, -0.23, -0.4].map((y, i) => (
      <mesh key={i} position={[0, y * (h / 1.6), 0.018]}>
        <boxGeometry args={[w * 0.78, 0.06, 0.005]} />
        <meshBasicMaterial color={P.inkBlack} transparent opacity={o * 0.85} />
      </mesh>
    ))}
    {highlighted && highlightProgress > 0.01 && (
      <mesh position={[-w * 0.35 + (highlightProgress * w * 0.39), highlightY * (h / 1.6), 0.022]}>
        <boxGeometry args={[highlightProgress * w * 0.78, 0.12, 0.008]} />
        <meshStandardMaterial color={P.evidenceRed} emissive={P.evidenceRed} emissiveIntensity={0.35} transparent opacity={0.78 * o} />
      </mesh>
    )}
  </group>
);

const PhoneTranscript: React.FC<{ pos: V3; rot?: V3; o?: number; redLine?: number }> = ({
  pos, rot = [-0.35, -0.1, 0], o = 1, redLine = -1,
}) => (
  <group position={pos} rotation={rot}>
    <mesh>
      <RoundedBoxGeo args={[1.0, 1.4, 0.025]} radius={0.01} />
      <meshStandardMaterial color="#D8D4C8" roughness={0.96} transparent opacity={o} />
    </mesh>
    {[0.4, 0.26, 0.12, -0.02, -0.16, -0.3, -0.44].map((y, i) => (
      <mesh key={i} position={[0, y, 0.015]}>
        <boxGeometry args={[0.72, 0.045, 0.004]} />
        <meshBasicMaterial color={i === redLine ? P.evidenceRed : P.inkBlack} transparent opacity={o * (i === redLine ? 1 : 0.7)} />
      </mesh>
    ))}
  </group>
);

const EvidenceTag: React.FC<{ pos: V3; o?: number }> = ({ pos, o = 1 }) => (
  <mesh position={pos}>
    <RoundedBoxGeo args={[0.5, 0.2, 0.015]} radius={0.03} />
    <meshStandardMaterial color={P.evidenceRed} emissive={P.evidenceRed} emissiveIntensity={0.3} roughness={0.6} transparent opacity={o} />
  </mesh>
);

const ClubCrest: React.FC<{ pos: V3; color: string; scale?: number; o?: number }> = ({ pos, color, scale = 0.15, o = 1 }) => (
  <group position={pos} scale={scale}>
    <mesh>
      <RoundedBoxGeo args={[1, 1.2, 0.12]} radius={0.15} />
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.1} transparent opacity={o} />
    </mesh>
    <mesh position={[0, 0.15, 0.07]}>
      <boxGeometry args={[0.5, 0.08, 0.02]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={o * 0.8} />
    </mesh>
  </group>
);

const TrophyCup: React.FC<{ pos: V3; scale?: number; o?: number; color?: string }> = ({ pos, scale = 0.12, o = 1, color = "#C4A24E" }) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.25, 0.4, 0.65, 8]} />
      <meshStandardMaterial color={color} roughness={0.65} metalness={0.2} transparent opacity={o} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.2, 0.15, 0.15, 8]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} transparent opacity={o} />
    </mesh>
  </group>
);

const Gavel: React.FC<{ pos: V3; rot?: V3; o?: number }> = ({ pos, rot = [0, 0, 0.3], o = 1 }) => (
  <group position={pos} rotation={rot}>
    <mesh position={[0, 0, 0]}>
      <RoundedBoxGeo args={[0.3, 0.12, 0.12]} radius={0.03} />
      <meshStandardMaterial color="#4A3728" roughness={0.85} transparent opacity={o} />
    </mesh>
    <mesh position={[0, -0.18, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} transparent opacity={o} />
    </mesh>
  </group>
);

// ---------- sets ----------
const HookSet: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - seg(t, CUT.konteks - 0.3, CUT.konteks + 0.1);
  const hlP = seg(t, T.juara, T.telepon1);
  return (
    <group visible={o > 0.001}>
      <EvidenceDoc pos={[0.9, 0.22, 0]} rot={[-0.35, -0.15, 0]} highlighted highlightProgress={hlP} o={o} />
      <EvidenceTag pos={[-0.6, 0.05, 0.8]} o={o * seg(t, T.rekaman, T.telepon1)} />
      <PhoneTranscript pos={[-0.8, 0.15, -0.3]} o={o * seg(t, T.rekaman, T.audira1End)} redLine={3} />
    </group>
  );
};

const WiretapsSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.konteks, CUT.konteks + 0.5);
  const leave = 1 - seg(t, CUT.pengembangan - 0.3, CUT.pengembangan + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      <PhoneTranscript pos={[-0.6, 0.18, -0.2]} rot={[-0.3, 0.1, 0]} o={o} redLine={2} />
      <PhoneTranscript pos={[0.2, 0.12, 0.5]} rot={[-0.4, -0.2, 0.05]} o={o * seg(t, T.transkrip, T.bocorEnd)} redLine={4} />
      <EvidenceDoc pos={[1.0, 0.22, -0.1]} rot={[-0.35, -0.15, 0]} highlighted highlightProgress={seg(t, T.moggi1, T.serieA1End)} highlightY={-0.06} o={o} />
      <EvidenceTag pos={[0.5, 0.05, 0.9]} o={o * seg(t, T.skandal, T.calciopoliEnd)} />
      <mesh position={[-1.2, 0.04, 0.6]} rotation={[-Math.PI / 2 + 0.05, 0, 0.1]}>
        <RoundedBoxGeo args={[0.8, 0.5, 0.02]} radius={0.02} />
        <meshStandardMaterial color="#1B222C" roughness={0.88} transparent opacity={o * seg(t, T.mei2006, T.bocorEnd)} />
      </mesh>
    </group>
  );
};

const FiveClubsSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.pengembangan, CUT.pengembangan + 0.5);
  const leave = 1 - seg(t, CUT.penjelasan - 0.3, CUT.penjelasan + 0.1);
  const o = Math.min(enter, leave);
  const clubs: [string, number][] = [["#000000", 0], ["#AC1A2F", 0.7], ["#5A2D82", 1.4], ["#87CEEB", 2.1], ["#8B0000", 2.8]];
  return (
    <group visible={o > 0.001}>
      {clubs.map(([col, delay], i) => (
        <ClubCrest key={i} pos={[-1.3 + i * 0.55, 0.08, 0.4 - i * 0.12]} color={col}
          o={o * seg(t, T.limaKlub + delay * 0.15, T.reggina)} />
      ))}
      <Gavel pos={[0.8, 0.2, -0.5]} o={o * seg(t, T.presiden, T.degradasi1)} />
      <EvidenceDoc pos={[-0.8, 0.22, -0.6]} rot={[-0.35, 0.1, 0]} highlighted highlightProgress={seg(t, T.moggiMundur, T.juaraSAEnd)} o={o} />
      <PhoneTranscript pos={[1.2, 0.15, 0.3]} rot={[-0.3, -0.2, 0]} o={o * seg(t, T.empatKlub, T.degradasi1)} redLine={1} />
    </group>
  );
};

const VerdictSet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.penjelasan, CUT.penjelasan + 0.5);
  const leave = 1 - seg(t, CUT.payoff - 0.3, CUT.payoff + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      <EvidenceDoc pos={[0.9, 0.22, 0]} rot={[-0.35, -0.15, 0]} w={1.5} h={1.9} highlighted
        highlightProgress={seg(t, T.satuSatunya, T.serieB1End)} highlightY={0.2} o={o} />
      <Gavel pos={[-0.5, 0.25, -0.4]} rot={[0.1, 0, 0.2]} o={o * seg(t, T.hukuman, T.juventus2End)} />
      <ClubCrest pos={[-1.0, 0.08, 0.3]} color="#000000" scale={0.2} o={o} />
      <EvidenceTag pos={[-1.0, 0.25, 0.3]} o={o * seg(t, T.serieB1, T.gelar0506)} />
      <mesh position={[0, 0.04, 0.8]} rotation={[-Math.PI / 2 + 0.05, 0, 0]}>
        <RoundedBoxGeo args={[1.8, 0.3, 0.015]} radius={0.02} />
        <meshStandardMaterial color={P.hairlineGrey} roughness={0.9} transparent opacity={o * seg(t, T.duaGelar, T.gelar0506)} />
      </mesh>
      <TrophyCup pos={[0.3, 0, 0.85]} o={o * seg(t, T.interMilan, T.kontroversial)} />
      <EvidenceDoc pos={[-0.6, 0.15, 0.7]} rot={[-0.4, 0.15, 0.05]} w={0.9} h={1.2} o={o * seg(t, T.fiorentina, T.reggina2End)} />
    </group>
  );
};

const IronySet: React.FC<{ t: number }> = ({ t }) => {
  const enter = seg(t, CUT.payoff, CUT.payoff + 0.5);
  const leave = 1 - seg(t, CUT.outro - 0.3, CUT.outro + 0.1);
  const o = Math.min(enter, leave);
  return (
    <group visible={o > 0.001}>
      <TrophyCup pos={[-0.3, 0, 0.2]} scale={0.18} o={o * seg(t, T.pialaDunia, T.pialaDuniaEnd + 2)} color="#C4A24E" />
      <ClubCrest pos={[-1.0, 0.08, -0.3]} color="#000000" scale={0.18} o={o} />
      <ClubCrest pos={[0.6, 0.08, 0.6]} color="#AC1A2F" scale={0.15} o={o * seg(t, T.acMilan2, T.ligaChampionsEnd)} />
      <TrophyCup pos={[0.9, 0, 0.5]} scale={0.13} o={o * seg(t, T.ligaChampions, T.ligaChampionsEnd + 1)} color="#C0C0C0" />
      <EvidenceDoc pos={[1.0, 0.22, -0.3]} rot={[-0.35, -0.15, 0]} highlighted
        highlightProgress={seg(t, T.danJuventus, T.satuMusim)} highlightY={-0.1} o={o} />
      <mesh position={[-0.3, 0.04, 0.65]} rotation={[-Math.PI / 2 + 0.03, 0, 0]}>
        <RoundedBoxGeo args={[0.6, 0.25, 0.012]} radius={0.02} />
        <meshStandardMaterial color={P.evidenceRed} emissive={P.evidenceRed} emissiveIntensity={0.2} roughness={0.7} transparent opacity={o * seg(t, T.ironi, T.ironiEnd + 1)} />
      </mesh>
    </group>
  );
};

const OutroSet: React.FC<{ t: number }> = ({ t }) => {
  const o = seg(t, CUT.outro, CUT.outro + 0.5);
  return (
    <group visible={o > 0.001}>
      <EvidenceDoc pos={[0.9, 0.22, 0]} rot={[-0.35, -0.15, 0]} o={o} />
      <mesh position={[0.8, 0.12, 0.6]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color={P.evidenceRed} roughness={0.7} metalness={0.1} transparent opacity={o} />
      </mesh>
    </group>
  );
};

// ---------- main scene ----------
export const FilmScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const set = setAt(t);
  return (
    <>
      <CameraRig t={t} frame={frame} />
      <ambientLight intensity={0.45} color="#FFFFFF" />
      <directionalLight position={[4.5, 7.5, 5]} intensity={1.65} color="#FFF8E7" castShadow />
      <directionalLight position={[-4, 4, -3.5]} intensity={0.75} color="#90CAF9" />
      <spotLight position={[0, 4.5, 2]} angle={0.55} penumbra={0.4} intensity={1.8} color="#FFF5DC" castShadow />
      <ForensicDesk3D f={frame} />
      {set === "hook" && <HookSet t={t} />}
      {set === "wiretaps" && <WiretapsSet t={t} />}
      {set === "fiveClubs" && <FiveClubsSet t={t} />}
      {set === "verdict" && <VerdictSet t={t} />}
      {set === "irony" && <IronySet t={t} />}
      {set === "outro" && <OutroSet t={t} />}
      <Finish frame={frame} background={P.deskVoid} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao />
    </>
  );
};
