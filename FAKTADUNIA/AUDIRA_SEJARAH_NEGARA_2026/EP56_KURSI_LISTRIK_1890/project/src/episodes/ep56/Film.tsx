// EP56 — Kursi Listrik Pertama, 1890 (VINTAGEFORGE · Remotion + R3F).
// Clock = VO clock (offset 0). Film 94 s; VO ends 90.96 s; AUDIRA outro card 91–94 s.
// Six beats from the VO anchors, each split into sub-scenes that change on the anchor sentences.
// Sensitive topic: no bodies, no figures, chair always empty; real people = name cards only.
import React from "react";
import { FilmFromConfig, type FilmConfig, type BeatContent, type BeatProps } from "../../templates";
import { frame as frameTo, type Framing, type Move } from "../../core/camera/moves.ts";
import { KeyLight } from "../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { Subtitle } from "../../core/hud/Subtitle.tsx";
import { DISPLAY } from "../../core/type/displayFonts.ts";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import WORDS from "../../../public/audio/vo-words.json";
import {
  C, sm, rnd, Brass, Copper, Wood, Iron, Label, Cable, Arc, Sparks,
  ExecChair, Voltmeter, Dynamo, DentistChair, Gavel, Stopwatch, WallClock, Socket, Floor, BackWall,
} from "./Props.tsx";

export const EP56_SECONDS = 94;
const OUTRO_SECONDS = 3;

const BEATS: FilmConfig["beats"] = {
  hook: { start: 0, end: 10.17 },
  context: { start: 10.17, end: 28.79 },
  main: { start: 28.79, end: 44.67 },
  explanation: { start: 44.67, end: 61.86 },
  payoff: { start: 61.86, end: 82.8 },
  outro: { start: 82.8, end: 94 },
};

// ---------- shared lighting per room ----------
const Room: React.FC<{
  spot?: [number, number, number];
  spotTarget?: [number, number, number];
  spotIntensity?: number;
  fog?: [number, number];
  fogColor?: string;
  children: React.ReactNode;
}> = ({ spot = [4, 14, 8], spotIntensity = 120, fog = [26, 70], fogColor = "#2b1d12", children }) => (
  <group>
    <fog attach="fog" args={[fogColor, fog[0], fog[1]]} />
    <KeyLight extent={12} keyPos={[9, 15, 9]} keyColor="#ffd9a3" keyIntensity={1.3} fill={0.22} fillColor="#f3ead6" rim="#9fb6d0" rimIntensity={2.4} />
    <spotLight position={[-2, 11, -16]} angle={0.6} penumbra={0.9} intensity={70} distance={50} decay={1.5} color="#a9c0dc" />
    <spotLight position={spot} angle={0.5} penumbra={0.75} intensity={spotIntensity} distance={45} decay={1.5} color="#ffd9a3" castShadow />
    <pointLight position={[-7, 4, 5]} intensity={6} distance={18} color="#ffb060" />
    {children}
  </group>
);

const Lantern: React.FC<{ position: [number, number, number]; size?: number }> = ({ position, size = 1.6 }) => (
  <group position={position}>
    <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={size} ground />
    <pointLight position={[0, size * 0.55, 0]} intensity={4} distance={7} color="#ffb35c" />
  </group>
);

const SideTable: React.FC<{ position: [number, number, number]; h?: number; children?: React.ReactNode }> = ({ position, h = 2.2, children }) => (
  <group position={position}>
    <mesh position={[0, h, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[2.6, 0.16, 1.8]} radius={0.04} />
      <Wood seed={71} />
    </mesh>
    {[[-1.1, -0.7], [1.1, -0.7], [-1.1, 0.7], [1.1, 0.7]].map(([x, z], i) => (
      <mesh key={i} position={[x, h / 2, z]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, h, 10]} />
        <Wood seed={72 + i} />
      </mesh>
    ))}
    <group position={[0, h + 0.08, 0]}>{children}</group>
  </group>
);

// ---------- HOOK 0–10.17: empty chair under one spot, brass voltmeter needle trembling ----------
const HookScene: BeatContent = ({ t, frame }) => {
  const pulse = 0.35 + 0.35 * Math.sin(t * 5.3) * Math.sin(t * 1.7);
  const jit = (rnd(Math.floor(frame / 2)) - 0.5) * 0.06;
  const v = 0.08 + 0.05 * Math.sin(t * 3.1) + (t > 3.55 ? 0.12 * sm((t - 3.55) / 3) : 0);
  return (
    <Room spot={[2, 15, 6]} spotIntensity={150}>
      <Floor color="#23170e" />
      <BackWall z={-7} />
      <group rotation={[0, -0.32, 0]}>
        <ExecChair glow={Math.max(0, pulse)} />
      </group>
      {t < 3.55 && <Sparks at={[0.05, 7.0, -0.2]} t={t} seed={3} count={8} />}
      <SideTable position={[4.1, 0, 3.0]} h={2.0}>
        <group position={[0, 1.25, 0]} rotation={[-0.08, -0.5, 0]}>
          <Voltmeter value={v} jitter={jit} scale={1.05} />
        </group>
      </SideTable>
      <Lantern position={[-4.2, 0, 3.2]} />
      <Label lines={["AUDIRA ARCHIVE · 1890"]} w={2.6} h={0.42} border={C.brass} position={[0, 6.62, -1.0]} />
    </Room>
  );
};

// ---------- CONTEXT 10.17–28.79 ----------
const DockScene: React.FC<{ t: number; frame: number }> = ({ t }) => {
  const macro = t >= 13.96;
  const spin = t * 9;
  return (
    <Room spot={[-3, 16, 6]} spotIntensity={95} fogColor="#1c1a1c" fog={[22, 75]}>
      <Floor color="#2a1e14" />
      {/* night water behind the pier */}
      <mesh position={[0, -0.02, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 40]} />
        <meshPhysicalMaterial color="#0f1a1f" roughness={0.15} metalness={0.3} clearcoat={1} />
      </mesh>
      <AssetModel id="dock-warehouse-bf0967" assetType="building" size={20} ground position={[-4, 0, -16]} />
      <AssetModel id="pier-deck-section-7047d7" assetType="building" size={14} ground position={[9, 0, -8]} />
      <group position={[-5.5, 0, -2]}>
        <AssetModel id="station-lamp-post-7d14dd" assetType="prop" size={9} ground />
        <mesh position={[0, 8.6, 0]}>
          <sphereGeometry args={[0.35, 16, 12]} />
          <meshBasicMaterial color="#fff1cf" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 8.4, 0.6]} intensity={40 + 15 * Math.sin(t * 23)} distance={22} decay={1.5} color="#ffe6b8" />
      </group>
      <AssetModel id="mooring-bollard-2d4bc9" assetType="prop" size={1.6} ground position={[5, 0, 4.5]} />
      <AssetModel id="wooden-crate-e46521" assetType="prop" size={2.4} ground position={[-4.6, 0, 3.6]} rotation={[0, 0.4, 0]} />
      <group position={[0, 0, 0]} rotation={[0, -0.5, 0]}>
        <Dynamo spin={spin} glow={macro ? 0.6 + 0.4 * Math.sin(t * 19) : 0.25} />
      </group>
      <Cable points={[[-1.7, 0.75, -0.4], [-3.5, 0.3, -1.4], [-5.2, 0.3, -1.8], [-5.5, 2.0, -2]]} r={0.08} glow={0.2} />
      {macro && <Sparks at={[-1.3, 0.85, 1.0]} t={t} seed={7} count={14} />}
      {macro && <Arc from={[-1.6, 0.9, 0.8]} to={[-0.9, 1.6, 1.4]} frame={Math.floor(t * 60)} intensity={0.6 + 0.4 * Math.sin(t * 13)} />}
    </Room>
  );
};

const DentistScene: React.FC<{ t: number }> = ({ t }) => {
  const recline = sm((t - 19.6) / 3);
  const grow = sm((t - 25.89) / 2.2);
  const full: [number, number, number][] = [[6.5, 0.3, 1.5], [4.5, 0.3, 1.0], [2.6, 0.4, 0.2], [1.6, 3.0, -1.4], [0.6, 6.2, -2.2], [0, 6.6, -1.6]];
  const n = Math.max(2, Math.ceil(full.length * grow));
  return (
    <Room spot={[3, 15, 7]} spotIntensity={130}>
      <Floor color="#2a1c11" />
      <BackWall z={-6} color="#3d2a1a" />
      <group rotation={[0, 0.35, 0]}>
        <DentistChair recline={recline} />
        {grow > 0.02 && (
          <group>
            <Cable points={full.slice(0, n)} r={0.08} glow={0.3 * grow} />
            <mesh position={[0, 6.55, -1.25]} scale={grow}>
              <sphereGeometry args={[0.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <Brass emissive={0.3 * grow} />
            </mesh>
          </group>
        )}
      </group>
      <SideTable position={[-4.2, 0, 1.6]} h={2.2}>
        <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={1.3} ground position={[-0.6, 0, 0]} />
        <pointLight position={[-0.6, 1, 0]} intensity={5} distance={8} color="#ffb35c" />
        {/* dental tools tray */}
        <mesh position={[0.6, 0.06, 0.1]}>
          <RoundedBoxGeo args={[1.1, 0.1, 0.7]} radius={0.03} />
          <Brass />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.35 + i * 0.25, 0.14, 0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
            <Iron />
          </mesh>
        ))}
      </SideTable>
    </Room>
  );
};

const ContextScene: BeatContent = ({ t, frame }) => (t < 19.33 ? <DockScene t={t} frame={frame} /> : <DentistScene t={t} />);

// ---------- MAIN 28.79–44.67 ----------
const CommissionScene: React.FC<{ t: number }> = ({ t }) => {
  const stamp = sm((t - 32.6) / 0.6);
  const stampY = 3.2 + 2.6 * (1 - stamp);
  const lit = (i: number) => sm((t - 29.3 - i * 0.9) / 0.5);
  const names = ["E. GERRY", "M. HALE", "A. P. SOUTHWICK"];
  return (
    <Room spot={[0, 16, 4]} spotIntensity={140}>
      <Floor color="#24180f" />
      <BackWall z={-7} />
      <AssetModel id="teacher-s-desk-381eeb" size={6} ground position={[-9, 0, -4]} rotation={[0, 0.6, 0]} />
      {/* commission table */}
      <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[10, 0.3, 4]} radius={0.06} />
        <Wood seed={81} />
      </mesh>
      {[[-4.6, -1.7], [4.6, -1.7], [-4.6, 1.7], [4.6, 1.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.4, z]} castShadow>
          <RoundedBoxGeo args={[0.36, 2.8, 0.36]} radius={0.05} />
          <Wood seed={82 + i} />
        </mesh>
      ))}
      {/* three empty chairs + name plates */}
      {[-3.2, 0, 3.2].map((x, i) => (
        <group key={i}>
          <AssetModel id="armchair-980c7c" size={3.4} ground position={[x, 0, -3.4]} />
          <group position={[x, 3.05, -1.2]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <RoundedBoxGeo args={[2.4, 0.5, 0.3]} radius={0.04} />
              <Wood color={C.woodDark} seed={86 + i} />
            </mesh>
            <Label lines={[names[i]]} w={2.2} h={0.4} bg={C.brass} fg={C.ink} position={[0, 0.27, 0.16]} emissive={0.25 * lit(i)} />
          </group>
        </group>
      ))}
      {/* the act, on parchment */}
      <Label lines={["UNDANG-UNDANG", "NEW YORK · 1888", "eksekusi dengan listrik"]} w={3.4} h={4.2} border="#3B2818" position={[0, 3.07, 0.6]} rotation={[-Math.PI / 2, 0, 0.06]} />
      {/* stamp: brass handle + red seal printed on the act */}
      <group position={[1.0, stampY, 1.5]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 1.0, 16]} />
          <Wood color={C.woodDark} seed={89} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.15, 24]} />
          <Brass />
        </mesh>
      </group>
      {t > 33.15 && (
        <Label lines={["AUDIRA", "ARCHIVE"]} w={1.2} h={0.9} bg="transparent" fg={C.terracotta} stamp position={[1.0, 3.09, 1.5]} rotation={[-Math.PI / 2, 0, -0.2]} />
      )}
    </Room>
  );
};

const CurrentsScene: React.FC<{ t: number }> = ({ t }) => {
  const dc = sm((t - 36.6) / 1.2);
  const ac = sm((t - 40.9) / 1.2);
  const sine: [number, number, number][] = Array.from({ length: 13 }, (_, i) => [1.0 + i * 0.32, 0.55 + 0.45 * Math.sin(i * 1.05 - t * 6), 2.4]);
  return (
    <Room spot={[0, 16, 6]} spotIntensity={120}>
      <Floor color="#22170f" />
      <BackWall z={-7} />
      {/* DC — Edison, left */}
      <group position={[-5.2, 0, 0]} rotation={[0, 0.35, 0]}>
        <Dynamo spin={t * 6} coil="#7e8f84" glow={0.4 * dc} />
        <Label lines={["EDISON · DC"]} w={3.0} h={0.55} bg={C.brass} fg={C.ink} position={[0, 0.32, 1.32]} />
      </group>
      {/* AC — Westinghouse, right */}
      <group position={[5.2, 0, 0]} rotation={[0, -0.35, 0]}>
        <Dynamo spin={-t * 9} glow={0.5 * ac} />
        <Label lines={["WESTINGHOUSE · AC"]} w={3.0} h={0.55} bg={C.brass} fg={C.ink} position={[0, 0.32, 1.32]} />
      </group>
      {/* the two currents meet in the middle: straight DC line, sine AC line */}
      <Cable points={[[-5, 0.55, 2.4], [-3, 0.55, 2.4], [-1, 0.55, 2.4], [0.8, 0.55, 2.4]]} r={0.09} glow={0.9 * dc} glowColor="#7fc7b0" />
      <Cable points={sine} r={0.09} glow={0.9 * ac} glowColor="#ff8a5c" seg={120} />
      <mesh position={[0.9, 0.55, 1.6]}>
        <sphereGeometry args={[0.28, 20, 16]} />
        <Brass />
      </mesh>
    </Room>
  );
};

const MainScene: BeatContent = ({ t }) => (t < 36.25 ? <CommissionScene t={t} /> : <CurrentsScene t={t} />);

// ---------- EXPLANATION 44.67–61.86 ----------
const ArcScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const on = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.3));
  return (
    <Room spot={[2, 15, 6]} spotIntensity={110}>
      <Floor color="#22170f" />
      <BackWall z={-7} />
      <group position={[1.6, 0, 0]} rotation={[0, -0.4, 0]}>
        <Dynamo spin={t * 10} glow={0.6} />
      </group>
      {/* spark-gap posts */}
      {[[-1.2, 0.0], [1.0, 0.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, 2.6 + z]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 2.8, 12]} />
            <Brass />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.22, 20, 16]} />
            <Brass emissive={0.4 * on} />
          </mesh>
        </group>
      ))}
      <Arc from={[-1.2, 2.85, 2.6]} to={[1.0, 2.85, 3.0]} frame={frame} intensity={on} />
      {/* poster on an easel */}
      <group position={[-2.5, 0, 0.2]} rotation={[0, 0.45, 0]}>
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 3.0, -0.2]} rotation={[0.12, 0, i ? -0.1 : 0.1]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 6, 8]} />
            <Wood seed={91 + i} />
          </mesh>
        ))}
        <group rotation={[-0.1 + 0.02 * Math.sin(t * 2), 0, 0]} position={[0, 3.9, 0.05]}>
          <Label lines={["PERINGATAN!", "ARUS AC", "= ARUS MAUT?", "— H. P. Brown"]} w={3.2} h={4.2} border={C.terracotta} />
        </group>
      </group>
    </Room>
  );
};

const CartScene: React.FC<{ t: number }> = ({ t }) => {
  const x = -7 + 7.5 * sm((t - 52.14) / 4.4);
  const wheel = -x / 0.7;
  return (
    <Room spot={[0, 16, 6]} spotIntensity={95} fogColor="#1e1a18">
      <Floor color="#2b241d" />
      <AssetModel id="battery-wall-section-51b723" assetType="building" size={16} ground position={[0, 0, -6]} />
      <AssetModel id="battery-wall-section-51b723" assetType="building" size={16} ground position={[15, 0, -6]} />
      <group position={[7.2, 0, -2]}>
        <AssetModel id="station-lamp-post-7d14dd" assetType="prop" size={8} ground />
        <pointLight position={[0, 7.4, 0.6]} intensity={25} distance={18} color="#ffe2b0" />
      </group>
      {/* hand cart with the stencilled crate */}
      <group position={[x, 0, 1.2]}>
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[4.2, 0.22, 2.2]} radius={0.04} />
          <Wood seed={95} />
        </mesh>
        {[-1.15, 1.15].map((z, i) => (
          <group key={i} position={[0.6, 0.72, z]} rotation={[0, 0, wheel]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.66, 0.08, 10, 32]} />
              <Iron />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} rotation={[0, 0, (k * Math.PI) / 4]}>
                <boxGeometry args={[0.07, 1.3, 0.07]} />
                <Wood seed={96 + k} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[-2.5, 1.3, 0]} rotation={[0, 0, 0.12]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.8, 8]} />
          <Wood seed={99} />
        </mesh>
        <group position={[0, 2.35, 0]}>
          <mesh castShadow>
            <RoundedBoxGeo args={[3.2, 2.2, 1.9]} radius={0.04} />
            <Wood color="#8a6238" seed={101} />
          </mesh>
          {[-0.7, 0, 0.7].map((y, i) => (
            <mesh key={i} position={[0, y, 0.96]}>
              <boxGeometry args={[3.22, 0.06, 0.02]} />
              <meshStandardMaterial color="#4a3020" />
            </mesh>
          ))}
          <Label lines={["WESTINGHOUSE", "A.C. DYNAMO"]} w={2.6} h={1.2} bg="transparent" fg="#1e1b18" position={[0, 0.05, 0.975]} />
        </group>
      </group>
      <Label lines={["PENJARA AUBURN"]} w={4.2} h={0.7} border={C.brass} position={[0, 7.2, -5.2]} />
    </Room>
  );
};

const AppealScene: React.FC<{ t: number }> = ({ t }) => {
  const hit = 59.4;
  const lift = t < hit - 0.35 ? sm((t - 57.2) / 1.2) : t < hit ? 1 - sm((t - (hit - 0.35)) / 0.35) : 0.05 * Math.exp(-(t - hit) * 6);
  return (
    <Room spot={[1, 12, 5]} spotIntensity={110}>
      {/* judge's desk top */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <RoundedBoxGeo args={[16, 0.3, 10]} radius={0.05} />
        <Wood color="#4a2e1a" seed={111} />
      </mesh>
      <group position={[1.2, 0, 0]}>
        <Gavel lift={lift} />
      </group>
      <Label lines={["BANDING", "W. KEMMLER", "MAHKAMAH AGUNG AS"]} w={3.0} h={3.8} position={[-2.6, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0.12]} />
      {t > hit && <Label lines={["DITOLAK"]} w={2.4} h={0.9} bg="transparent" fg={C.terracotta} stamp position={[-2.5, 0.04, 1.4]} rotation={[-Math.PI / 2, 0, 0.25]} />}
      <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={1.5} ground position={[4.6, 0, -2.4]} />
      <pointLight position={[4.6, 1.2, -2.4]} intensity={5} distance={8} color="#ffb35c" />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-5.4, 0.1 + i * 0.22, -2.6]} rotation={[0, 0.1 * i, 0]} castShadow>
          <RoundedBoxGeo args={[2.2, 0.2, 3.0]} radius={0.03} />
          <meshStandardMaterial color={["#5a2a1e", "#2f3a2a", "#3b2818"][i]} roughness={0.7} />
        </mesh>
      ))}
    </Room>
  );
};

const ExplanationScene: BeatContent = ({ t, frame }) =>
  t < 52.14 ? <ArcScene t={t} frame={frame} /> : t < 57.03 ? <CartScene t={t} /> : <AppealScene t={t} />;

// ---------- PAYOFF 61.86–82.80 ----------
const GateScene: React.FC<{ t: number }> = ({ t }) => {
  const open = sm((t - 62.6) / 2.2);
  return (
    <Room spot={[0, 18, 10]} spotIntensity={110} fogColor="#1d1916" fog={[24, 80]}>
      <Floor color="#2b241d" />
      <AssetModel id="climbable-stone-wall-0052e0" assetType="building" size={14} ground position={[-9.5, 0, -2]} />
      <AssetModel id="climbable-stone-wall-0052e0" assetType="building" size={14} ground position={[9.5, 0, -2]} />
      {/* gate frame */}
      <mesh position={[0, 8.3, -1.6]} castShadow>
        <RoundedBoxGeo args={[7.6, 1.2, 1.4]} radius={0.06} />
        <meshStandardMaterial color="#6d655b" roughness={0.9} />
      </mesh>
      <Label lines={["AUBURN STATE PRISON"]} w={6.4} h={0.8} bg="#d8ccb2" fg={C.ink} position={[0, 8.3, -0.88]} />
      {/* two oak doors swinging in */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 3.0, 0, -1.6]} rotation={[0, s * open * 1.25, 0]}>
          <mesh position={[-s * 1.5, 3.85, 0]} castShadow>
            <RoundedBoxGeo args={[3.0, 7.7, 0.3]} radius={0.04} />
            <Wood color="#4a3020" seed={121 + s} />
          </mesh>
          {[1.6, 3.9, 6.2].map((y, i) => (
            <mesh key={i} position={[-s * 1.5, y, 0.17]}>
              <boxGeometry args={[3.0, 0.2, 0.05]} />
              <Iron />
            </mesh>
          ))}
        </group>
      ))}
      {/* warm light from inside */}
      <pointLight position={[0, 4, -5]} intensity={40 * open} distance={20} color="#ffcf8a" />
      <mesh position={[0, 3.85, -6]}>
        <planeGeometry args={[6, 7.7]} />
        <meshBasicMaterial color="#5a3d22" />
      </mesh>
    </Room>
  );
};

const RoomScene: React.FC<{ t: number }> = ({ t }) => {
  const swing = 0.12 * Math.sin(t * 1.6);
  return (
    <Room spot={[0, 15, 3]} spotIntensity={150}>
      <Floor color="#231810" />
      <BackWall z={-6} />
      <ExecChair glow={0.15} />
      {/* witness benches, empty, revealed row by row */}
      {[0, 1, 2].map((i) => {
        const r = sm((t - 65.6 - i * 0.7) / 0.6);
        return (
          <group key={i} position={[0, -1.2 * (1 - r), 6 + i * 3.0]}>
            {[-3.4, 3.4].map((x, k) => (
              <AssetModel key={k} id="wooden-bench-661da4" assetType="prop" size={5} ground position={[x, 0, 0]} rotation={[0, Math.PI, 0]} />
            ))}
          </group>
        );
      })}
      {/* hanging lamp */}
      <group position={[0, 13, 1.5]} rotation={[swing, 0, swing * 0.4]}>
        <mesh position={[0, -2.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4.4, 6]} />
          <Iron />
        </mesh>
        <mesh position={[0, -4.5, 0]} castShadow>
          <coneGeometry args={[0.9, 0.7, 24, 1, true]} />
          <meshPhysicalMaterial color={C.verdigris} metalness={0.8} roughness={0.4} side={2} />
        </mesh>
        <mesh position={[0, -4.75, 0]}>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshBasicMaterial color="#fff0c8" toneMapped={false} />
        </mesh>
        <pointLight position={[0, -5, 0]} intensity={30} distance={16} decay={1.5} color="#ffdcaa" />
      </group>
    </Room>
  );
};

const PanelScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const first = sm((t - 70.8) / 1.8) * 0.5;
  const second = sm((t - 75.2) / 1.4) * 0.5;
  const value = t < 74.6 ? first : t < 75.12 ? 0.5 - 0.5 * sm((t - 74.6) / 0.4) + 0 : first * 0 + second + 0.5 * sm((t - 75.12) / 0.6);
  const jit = (rnd(Math.floor(frame / 2)) - 0.5) * 0.05 * (value > 0.05 ? 1 : 0);
  const sec = Math.min(17, Math.max(0, ((t - 70.8) / 3.8) * 17));
  const lever = t < 70.8 ? 0 : t < 74.5 ? sm((t - 70.8) / 0.3) : t < 75.12 ? 1 - sm((t - 74.5) / 0.3) : sm((t - 75.12) / 0.3);
  const live = lever > 0.9;
  return (
    <Room spot={[1, 13, 9]} spotIntensity={130}>
      <Floor color="#22170f" />
      <BackWall z={-3} color="#33241a" />
      {/* control board */}
      <mesh position={[0, 4, -0.3]} castShadow receiveShadow>
        <RoundedBoxGeo args={[7.6, 6.4, 0.4]} radius={0.08} />
        <Wood color="#5a3a22" seed={131} />
      </mesh>
      <mesh position={[0, 4, -0.08]}>
        <RoundedBoxGeo args={[7.0, 5.8, 0.06]} radius={0.04} />
        <meshStandardMaterial color="#2d1f14" roughness={0.6} />
      </mesh>
      <group position={[-1.3, 4.7, 0.15]}>
        <Voltmeter value={value} jitter={jit} scale={1.75} />
      </group>
      <group position={[2.3, 5.6, 0.1]}>
        <Stopwatch sec={sec} />
      </group>
      {/* knife switch */}
      <group position={[2.3, 3.0, 0.05]}>
        <mesh castShadow>
          <RoundedBoxGeo args={[1.4, 1.8, 0.2]} radius={0.04} />
          <meshStandardMaterial color="#1b1410" roughness={0.5} />
        </mesh>
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={i} position={[x, -0.55, 0.18]}>
            <boxGeometry args={[0.1, 0.4, 0.16]} />
            <Brass />
          </mesh>
        ))}
        <group position={[0, 0.6, 0.2]} rotation={[-(1 - lever) * 1.1, 0, 0]}>
          {[-0.35, 0.35].map((x, i) => (
            <mesh key={i} position={[x, -0.6, 0]} castShadow>
              <boxGeometry args={[0.08, 1.2, 0.06]} />
              <Copper glow={live ? 0.6 : 0} />
            </mesh>
          ))}
          <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.9, 12]} />
            <Wood color="#1e1208" seed={133} />
          </mesh>
        </group>
        {live && <Sparks at={[0, -0.6, 0.3]} t={t} seed={11} count={6} />}
      </group>
      <Label lines={["AUDIRA · PANEL 1890"]} w={3.0} h={0.45} bg={C.brass} fg={C.ink} position={[-1.3, 1.45, -0.02]} />
      <Cable points={[[-3.8, 1.2, -0.2], [-4.6, 0.3, 0.6], [-6, 0.3, 2]]} r={0.1} glow={live ? 0.5 : 0.05} />
      <Lantern position={[4.8, 0, 2.6]} size={1.5} />
    </Room>
  );
};

const ClockScene: React.FC<{ t: number }> = ({ t }) => {
  const minutes = 8 * sm((t - 77.7) / 2.2);
  return (
    <Room spot={[2, 13, 7]} spotIntensity={120}>
      <Floor color="#22170f" />
      <BackWall z={-2} />
      <group position={[0, 6.2, -1.7]}>
        <WallClock minutes={minutes} />
      </group>
      <AssetModel id="wall-clock-0c555c" assetType="prop" size={1.6} position={[-4.8, 5.6, -1.85]} />
      <SideTable position={[2.8, 0, 1.8]} h={2.4}>
        <AssetModel id="table-candle-lantern-a7b5af" assetType="prop" size={1.3} ground position={[-0.5, 0, 0]} />
        <Label lines={["Lebih baik", "pakai kapak."]} w={1.4} h={1.0} italic position={[0.6, 0.02, 0.1]} rotation={[-Math.PI / 2, 0, -0.2]} />
      </SideTable>
      <pointLight position={[2.3, 3.4, 1.8]} intensity={5} distance={8} color="#ffb35c" />
    </Room>
  );
};

const PayoffScene: BeatContent = ({ t, frame }) =>
  t < 65.47 ? <GateScene t={t} /> : t < 70.61 ? <RoomScene t={t} /> : t < 77.52 ? <PanelScene t={t} frame={frame} /> : <ClockScene t={t} />;

// ---------- OUTRO 82.80–94: modern socket, copper line out to a lit town ----------
const OutroScene: BeatContent = ({ t }) => {
  const on = (i: number) => sm((t - 84.2 - i * 0.6) / 0.5);
  const houses: [number, number, number][] = [[-4, 0, -18], [5, 0, -21], [14, 0, -17], [-13, 0, -22]];
  return (
    <Room spot={[-2, 12, 8]} spotIntensity={90} fogColor="#1f1a20" fog={[30, 90]}>
      <Floor color="#2a221a" r={80} />
      {/* wall with the socket, foreground left */}
      <mesh position={[-3.2, 3, -0.4]} receiveShadow>
        <RoundedBoxGeo args={[3.2, 6, 0.4]} radius={0.04} />
        <meshStandardMaterial color="#d9cdb6" roughness={0.85} />
      </mesh>
      <group position={[-3.2, 2.2, -0.15]}>
        <Socket glow={on(0)} />
      </group>
      <Cable points={[[-2.2, 2.2, -0.1], [0, 1.0, -1], [3, 0.4, -4], [5.5, 0.4, -8], [6, 7.4, -9]]} r={0.1} glow={0.6 * on(0)} />
      <AssetModel id="telegraph-pole-line-95e382" assetType="prop" size={9} ground position={[6, 0, -9]} />
      {houses.map((p, i) => (
        <group key={i} position={p}>
          <AssetModel id="two-story-house-40f6dc" size={8} ground rotation={[0, (i - 1) * 0.3, 0]} />
          <pointLight position={[0, 3, 4]} intensity={30 * on(i + 1)} distance={14} color="#ffc37a" />
          <mesh position={[0, 2.6, 3.4]}>
            <planeGeometry args={[1.4, 1.0]} />
            <meshBasicMaterial color="#ffcf8a" toneMapped={false} transparent opacity={on(i + 1)} />
          </mesh>
        </group>
      ))}
      <Cable points={[[6, 7.4, -9], [1, 6.4, -14], [-4, 6.0, -18]]} r={0.05} glow={0.4 * on(1)} />
      <Cable points={[[6, 7.4, -9], [10, 6.4, -13], [14, 6.0, -17]]} r={0.05} glow={0.4 * on(2)} />
    </Room>
  );
};

// ---------- camera: one continuous rig, framing per sub-scene ----------
const F = (target: [number, number, number], az: number, el: number, dist: number, fov = 32): Framing => ({ target, az, el, dist, fov });
const START = F([0.4, 3.9, 0], 24, 9, 19);
// [time, framing] — keys straddle every content cut so the camera whips across the cut instead of drifting.
const KEYS: [number, Framing][] = [
  [0, START],
  [3.3, F([0.4, 4.0, 0], 18, 8, 16)],
  [10.0, F([0.6, 4.2, 0], 8, 6, 12.5)],
  [10.6, F([-1, 4.5, -5], -16, 12, 30)],
  [13.7, F([-1, 4.0, -4], -26, 10, 26)],
  [14.4, F([0, 1.6, 0], -40, 12, 11)],
  [19.1, F([0, 1.6, 0], -52, 10, 9)],
  [19.8, F([0, 3.2, 0], 30, 10, 15.5)],
  [25.7, F([0, 3.6, 0], 22, 8, 12.5)],
  [26.3, F([0.2, 3.4, 0], -18, 3, 13)],
  [28.55, F([0.2, 3.6, 0], -30, 4, 12)],
  [29.2, F([0, 3.2, 0], 0, 34, 20)],
  [33.0, F([0.4, 3.1, 0.9], 6, 62, 11)],
  [36.0, F([0.4, 3.1, 0.9], 10, 66, 10)],
  [36.7, F([-4.2, 1.9, 0.5], 14, 12, 15.5)],
  [40.6, F([-1, 1.9, 0.6], 4, 12, 16)],
  [41.2, F([4.0, 1.9, 0.5], -12, 12, 15.5)],
  [44.4, F([4.2, 1.9, 0.5], -18, 12, 14.5)],
  [45.0, F([-0.6, 3.0, 1], 32, 10, 16)],
  [51.9, F([-0.6, 3.0, 1], -8, 12, 15)],
  [52.6, F([-2.5, 2.8, 0.5], 22, 8, 17)],
  [56.8, F([0.5, 2.8, 0.5], 8, 8, 16)],
  [57.4, F([-0.5, 0.8, 0.5], 24, 34, 10)],
  [61.6, F([-0.8, 0.6, 0.6], 16, 40, 8)],
  [62.3, F([0, 5, -1], 0, 8, 36)],
  [65.2, F([0, 4.6, -2], 0, 6, 28)],
  [65.9, F([0, 3.6, 2], 22, 16, 24)],
  [70.3, F([0, 3.8, 1], 4, 12, 19)],
  [71.0, F([0.4, 4.3, 0.2], 10, 4, 12.5)],
  [74.9, F([-0.6, 4.5, 0.2], 4, 3, 10.5)],
  [77.2, F([-1.2, 4.7, 0.3], 0, 2, 8.6)],
  [77.9, F([0.2, 5.0, -1], -16, 2, 13)],
  [82.5, F([0.2, 5.4, -1.5], -6, 0, 10.5)],
  [83.3, F([-2.6, 2.4, 0], 18, 6, 8.5)],
  [88.5, F([2, 4.5, -8], 10, 9, 28)],
  [94, F([2, 5, -9], 4, 10, 32)],
];
const ALL_SHOTS: { at: number; move: Move }[] = KEYS.map(([at, f]) => ({ at, move: frameTo(f) }));

// ---------- overlay: one serif card per shot ----------
type Card = { a: number; b: number; title: string; sub?: string; kind?: "big" | "name" | "quote"; count?: [number, number, string] };
const CARDS: Card[] = [
  { a: 0.3, b: 3.4, title: "KURSI LISTRIK", sub: "Amerika Serikat · 1890" },
  { a: 3.75, b: 9.95, title: "“PALING MANUSIAWI”?", kind: "quote" },
  { a: 10.4, b: 13.8, title: "BUFFALO, NEW YORK", sub: "Tahun 1881" },
  { a: 19.55, b: 25.7, title: "ALFRED P. SOUTHWICK", sub: "Dokter gigi · Buffalo", kind: "name" },
  { a: 26.0, b: 28.6, title: "KURSI DOKTER GIGI → KURSI LISTRIK", kind: "name" },
  { a: 29.0, b: 36.05, title: "UU DISAHKAN", sub: "New York · 1888 · komisi 3 orang" },
  { a: 36.55, b: 40.65, title: "THOMAS EDISON", sub: "Arus searah · DC", kind: "name" },
  { a: 41.0, b: 44.5, title: "GEORGE WESTINGHOUSE", sub: "Arus bolak-balik · AC", kind: "name" },
  { a: 44.9, b: 51.95, title: "“ARUS MAUT?”", sub: "Kampanye Harold P. Brown · lab Edison", kind: "quote" },
  { a: 52.4, b: 56.85, title: "DIPEROLEH DIAM-DIAM", sub: "Generator AC Westinghouse" },
  { a: 57.25, b: 61.7, title: "BANDING DITOLAK", sub: "Mahkamah Agung AS" },
  { a: 62.05, b: 65.3, title: "6 AGUSTUS 1890", sub: "Penjara Auburn, New York" },
  { a: 65.65, b: 70.45, title: "17 SAKSI", sub: "Terpidana: William Kemmler" },
  { a: 70.8, b: 74.95, title: "", sub: "17 detik · tidak cukup", count: [0, 1000, " VOLT"] },
  { a: 75.2, b: 77.35, title: "", sub: "Aliran kedua", count: [1000, 2000, " VOLT"] },
  { a: 77.7, b: 79.8, title: "±8 MENIT", sub: "Seluruh proses" },
  { a: 80.0, b: 82.6, title: "“Lebih baik pakai kapak.”", sub: "— George Westinghouse", kind: "quote" },
  { a: 83.0, b: 90.8, title: "AC MENANG", sub: "Kini standar listrik dunia" },
];

const fmtNum = (n: number) => Math.round(n).toLocaleString("id-ID");

const CardView: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const k = Math.min(sm((t - c.a) / 0.35), 1 - sm((t - (c.b - 0.3)) / 0.3));
  if (k <= 0.001) return null;
  const isName = c.kind === "name";
  const isQuote = c.kind === "quote";
  const title = c.count ? fmtNum(c.count[0] + (c.count[1] - c.count[0]) * sm((t - c.a) / 1.6)) + c.count[2] : c.title;
  const size = c.count ? 128 : isName ? 76 : isQuote ? 88 : 112;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 262,
        display: "flex",
        justifyContent: "center",
        opacity: k,
        transform: `translateY(${(1 - k) * -26}px) scale(${0.96 + 0.04 * k})`,
      }}
    >
      <div
        style={{
          background: "rgba(243,234,214,0.95)",
          border: `5px solid ${C.brass}`,
          outline: "2px solid #3B2818",
          outlineOffset: -14,
          padding: isName ? "26px 44px 28px" : "30px 48px 34px",
          textAlign: "center",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          maxWidth: 940,
        }}
      >
        <div style={{ fontFamily: DISPLAY.serif, fontStyle: isQuote ? "italic" : "normal", fontSize: size, lineHeight: 1.02, color: "#3B2818", letterSpacing: isQuote ? 0 : 1 }}>{title}</div>
        {c.sub && <div style={{ marginTop: 14, fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 50, lineHeight: 1.15, color: "#1E1B18" }}>{c.sub}</div>}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ p: BeatProps; scale: number }> = ({ p, scale }) => {
  const { t, frame, fps } = p;
  return (
    <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      {t < 91 && (
        <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY.serif, fontStyle: "italic", fontSize: 36, color: "rgba(243,234,214,0.72)" }}>
          Ilustrasi 3D · bukan rekaman asli
        </div>
      )}
      {CARDS.map((c, i) => (t > c.a - 0.1 && t < c.b + 0.1 ? <CardView key={i} c={c} t={t} /> : null))}
      {/* Subtitle / signature / outro scale themselves via useFormat(): undo the Stage3D overlay scale. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080 * scale, height: 1920 * scale, transform: `scale(${1 / scale})`, transformOrigin: "0 0" }}>
      {t < 91 && (
        <Subtitle words={WORDS} frame={frame} fps={fps} offset={0} maxWords={5} size={58} activeColor={C.brass} baseColor="rgba(243,234,214,0.86)" plate="rgba(20,13,8,0.62)" position={1300} />
      )}
      <AudiraSignature seed="ep56_kursi_listrik_1890" outroSeconds={OUTRO_SECONDS} />
      <AudiraOutro seconds={OUTRO_SECONDS} />
      </div>
    </div>
  );
};

const config: FilmConfig = {
  beats: BEATS,
  startFraming: START,
  shots: { hook: ALL_SHOTS, context: [], main: [], explanation: [], payoff: [], outro: [] },
  scenes: {
    hook: HookScene,
    context: ContextScene,
    main: MainScene,
    explanation: ExplanationScene,
    payoff: PayoffScene,
    outro: OutroScene,
  },
  background: "#1c130c",
  hdri: "warmStudio",
  envIntensity: 0.55,
  exposure: 0.95,
  profile: COLOR_PROFILES.VINTAGE_SEPIA_FILM,
  ao: true,
  overlay: (scale, _beat, props) => <Overlay p={props} scale={scale} />,
  fade: { in: 0.25, out: 0.4, color: "#000000" },
  alive: { deg: 1.4, breath: 0.012, seed: 56 },
  lens: { aperture: 2.8, maxBlur: 0.003 },
};

export const KursiListrikFilm: React.FC = () => <FilmFromConfig config={config} />;
