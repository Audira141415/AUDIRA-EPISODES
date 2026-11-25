// EP14 film "Liverpool, dari Boot Room ke Keajaiban Istanbul" (RETROWAVE).
// Synthwave void with amber sun and cyan wireframe grid. CRT TV hero prop whose screen
// changes per beat: Boot Room → Shankly → trophies → Istanbul scoreboard → comeback → penalty.
// HOOK: cover frame with neon Liverpool title. KONTEKS: Boot Room facts on CRT.
// PENGEMBANGAN: manager lineage, trophy count. PENJELASAN: Istanbul 0-3 scoreboard.
// PAYOFF: 6-minute comeback, score climbing, penalty. OUTRO: wide grid, teaser.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { RETROWAVE_PALETTE as RP } from "../../kits/retrowave/lib/palette";
import { RetroSunAndGrid } from "../../kits/retrowave/world/ObjectStage";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { Outro } from "../_shared/Outro.tsx";
import { CLIPS, OUTRO_AT, SEC, T, TOTAL, camAt, seg, win, type Cam, type Word } from "./timing.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["600", "700"] });

const DW = 1080;
const DH = 1920;
const LIV_RED = "#C8102E";
const LIV_GOLD = "#F6EB61";

// ---------------------------------------------------------------- CRT TV hero prop
const CRT_POS: [number, number, number] = [0, 0.55, -1.2];
const CRT_TEXT: { t: number; lines: string[] }[] = [
  { t: 0, lines: ["BOOT", "ROOM"] },
  { t: T.namaBoot, lines: ["BOOT", "ROOM", "EST.1959"] },
  { t: T.shankly, lines: ["BILL", "SHANKLY", "1959"] },
  { t: T.paisley, lines: ["BOB", "PAISLEY", "3× EROPA"] },
  { t: T.fagan, lines: ["JOE", "FAGAN"] },
  { t: T.evans, lines: ["ROY", "EVANS"] },
  { t: T.tigaPiala, lines: ["3 PIALA", "EROPA", "6 LIGA"] },
  { t: T.raja, lines: ["RAJA", "INGGRIS", "&EROPA"] },
  { t: T.budaya, lines: ["ISTANBUL", "25 MEI", "2005"] },
  { t: T.acMilan, lines: ["VS", "AC MILAN"] },
  { t: T.maldini, lines: ["MALDINI", "1'", "0-1"] },
  { t: T.crespo, lines: ["CRESPO", "39'44'", "0-3"] },
  { t: T.enamMenit, lines: ["6 MENIT", "AJAIB"] },
  { t: T.gerrard, lines: ["GERRARD", "54'", "1-3"] },
  { t: T.smicer, lines: ["SMICER", "56'", "2-3"] },
  { t: T.alonso, lines: ["ALONSO", "60'", "3-3!!!"] },
  { t: T.dudek, lines: ["DUDEK", "DOUBLE", "SAVE"] },
  { t: T.penalti, lines: ["PENALTI", "3-2", "JUARA!"] },
  { t: T.juara5, lines: ["5×", "EROPA", "PERMANEN"] },
  { t: T.iniAudira, lines: ["AUDIRA", "EP15:", "JUVE"] },
];

const crtText = (t: number): string[] => {
  let cur = CRT_TEXT[0].lines;
  for (const e of CRT_TEXT) { if (t >= e.t) cur = e.lines; }
  return cur;
};

const makeCrtTex = (lines: string[]): THREE.CanvasTexture => {
  const cv = document.createElement("canvas");
  cv.width = 256; cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#050510";
  g.fillRect(0, 0, 256, 256);
  // scanlines
  for (let y = 0; y < 256; y += 4) { g.fillStyle = "rgba(0,246,255,0.04)"; g.fillRect(0, y, 256, 2); }
  g.fillStyle = RP.phosphorGreen;
  g.font = "bold 42px monospace";
  g.textAlign = "center";
  lines.forEach((ln, i) => g.fillText(ln, 128, 80 + i * 56));
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const CrtTv: React.FC<{ t: number }> = ({ t }) => {
  const lines = crtText(t);
  const tex = useMemo(() => makeCrtTex(lines), [lines.join("|")]);
  const glow = 0.2 + 0.15 * Math.sin(t * 3.2);
  return (
    <group position={CRT_POS}>
      {/* cabinet */}
      <mesh castShadow>
        <RoundedBoxGeo args={[1.1, 0.85, 0.75]} radius={0.06} segments={3} />
        <meshPhysicalMaterial {...POLISH.toyPlastic} color="#1A1428" />
      </mesh>
      {/* screen */}
      <mesh position={[0, 0.04, 0.377]}>
        <planeGeometry args={[0.82, 0.6]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {/* screen glow */}
      <pointLight position={[0, 0.1, 0.5]} intensity={glow} distance={2.5} color={RP.phosphorGreen} />
      {/* antenna */}
      <mesh position={[0.22, 0.54, -0.1]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.55, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.18, 0.52, -0.1]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* dial knob */}
      <mesh position={[0.46, -0.15, 0.378]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        <meshPhysicalMaterial color="#2A2038" roughness={0.4} clearcoat={0.8} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- 3D scene
const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos);
    c.lookAt(cam.tgt);
    c.fov = cam.fov;
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

const Scene: React.FC<{ t: number; frame: number; cam: Cam }> = ({ t, frame, cam }) => {
  const f = t * 60;
  return (
    <>
      <CameraRig cam={cam} />
      <color attach="background" args={[RP.voidDark]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} />
      <RetroSunAndGrid f={f} />
      <CrtTv t={t} />
      <Finish
        frame={frame}
        background={RP.voidDark}
        profile={COLOR_PROFILES.CYBER_NEON_VOID}
        exposure={1}
        envIntensity={0.55}
        ao={false}
      />
    </>
  );
};

// ---------------------------------------------------------------- overlay helpers
const fade = (o: number): React.CSSProperties => ({ opacity: o, transform: `translateY(${(1 - o) * 16}px)` });

const HudTag: React.FC<{ o: number; children: React.ReactNode; top: number; color?: string; dark?: boolean }> = ({ o, children, top, color = LIV_RED, dark }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top,
        transform: `translateX(-50%) translateY(${(1 - o) * 16}px)`,
        opacity: o,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 2,
        color: dark ? RP.voidDark : "#FFFFFF",
        background: dark ? color : "rgba(12,8,26,0.9)",
        border: `2px solid ${color}`,
        borderRadius: 10,
        padding: "8px 18px",
        whiteSpace: "nowrap",
        boxShadow: `0 0 16px ${color}40, 0 10px 26px rgba(0,0,0,0.5)`,
      }}
    >
      {children}
    </div>
  );

const Scoreboard: React.FC<{ o: number; top: number; home: string; score: string; away: string; sub: string }> = ({ o, top, home, score, away, sub }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) translateY(${(1 - o) * 16}px)`, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden", boxShadow: `0 0 20px ${RP.neonMagenta}40, 0 10px 28px rgba(0,0,0,0.55)`, fontFamily: MONO, fontWeight: 800, whiteSpace: "nowrap" }}>
        <div style={{ background: LIV_RED, color: "#fff", fontSize: 34, padding: "10px 20px", letterSpacing: 2 }}>{home}</div>
        <div style={{ background: RP.neonMagenta, color: "#fff", fontSize: 50, padding: "2px 24px", fontFamily: ANTON, letterSpacing: 2, textShadow: `0 0 12px ${RP.neonMagenta}` }}>{score}</div>
        <div style={{ background: "rgba(12,8,26,0.94)", color: "#fff", fontSize: 34, padding: "10px 20px", letterSpacing: 2 }}>{away}</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: RP.synthCyan, textShadow: `0 0 10px ${RP.synthCyan}` }}>{sub}</div>
    </div>
  );

// ---------------------------------------------------------------- section layers
const HookLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t > 7.5) return null;
  const head = (1 - seg(t, 5.5, 6.2)) * seg(t, 0.0, 0.3);
  const kick = 1 - seg(t, 5.6, 6.2);
  return (
    <>
      <div style={{ position: "absolute", left: 56, right: 56, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: kick }}>
        <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2 }}>
          <div style={{ background: LIV_RED, color: "#FFFFFF", padding: "8px 14px" }}>SEJARAH SEPAK BOLA</div>
          <div style={{ background: "rgba(8,6,20,0.94)", color: LIV_GOLD, padding: "8px 14px" }}>#14</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: RP.synthCyan, border: `2px solid ${LIV_RED}`, borderRadius: 8, padding: "6px 12px" }}>
          LIVERPOOL · AUDIRA
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, top: 282, fontFamily: ANTON, lineHeight: 0.93, textShadow: `0 0 24px ${RP.neonMagenta}, 0 6px 24px rgba(0,0,0,0.9)`, opacity: head }}>
        <div style={{ fontSize: 120, color: LIV_RED, letterSpacing: 1 }}>LIVERPOOL</div>
        <div style={{ fontSize: 76, color: RP.chromeSilver, letterSpacing: 1 }}>BOOT ROOM</div>
        <div style={{ marginTop: 12, display: "inline-block", fontFamily: MARKER, fontSize: 50, color: RP.voidDark, background: RP.neonMagenta, padding: "2px 20px 6px", transform: "rotate(-1.3deg)" }}>
          ISTANBUL 2005
        </div>
      </div>
    </>
  );
};

const KonteksLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.KONTEKS[0] - 0.3 || t > SEC.PENGEMBANGAN[0] + 0.4) return null;
  const boot = win(t, T.namaBoot - 0.1, T.shankly - 0.2, 0.3, 0.3);
  const shank = win(t, T.shankly - 0.1, T.ruangSempit - 0.2, 0.3, 0.3);
  const ruang = win(t, T.ruangSempit - 0.1, SEC.PENGEMBANGAN[0] + 0.1, 0.3, 0.4);
  return (
    <>
      <HudTag o={boot} top={290} color={RP.synthCyan}>BOOT ROOM · ANFIELD</HudTag>
      {shank > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 286, ...fade(shank) }}>
          <div style={{ display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.55))" }}>
            <div style={{ width: 12, background: LIV_RED, borderRadius: "8px 0 0 8px" }} />
            <div style={{ background: "rgba(12,8,26,0.9)", padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: RP.synthCyan }}>DESEMBER 1959</div>
              <div style={{ fontFamily: ANTON, fontSize: 68, lineHeight: 1.04, color: "#FFFFFF" }}>BILL SHANKLY</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: LIV_GOLD }}>TIBA DI ANFIELD</div>
            </div>
          </div>
        </div>
      )}
      <HudTag o={ruang} top={290} color={RP.neonMagenta}>RUANG SEMPIT PENUH SEPATU</HudTag>
    </>
  );
};

const PengembanganLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PENGEMBANGAN[0] - 0.3 || t > SEC.PENJELASAN[0] + 0.3) return null;
  const lineage = win(t, T.lahir - 0.1, T.tigaPiala - 0.3, 0.3, 0.3);
  const trophies = win(t, T.tigaPiala - 0.1, T.raja - 0.2, 0.3, 0.3);
  const raja = win(t, T.raja - 0.1, SEC.PENJELASAN[0] + 0.1, 0.3, 0.3);
  return (
    <>
      {lineage > 0.01 && (
        <div style={{ position: "absolute", left: 56, top: 280, ...fade(lineage), fontFamily: ANTON, lineHeight: 0.98, textShadow: `0 0 18px ${RP.neonMagenta}, 0 8px 28px rgba(0,0,0,0.65)` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: RP.synthCyan }}>BOOT ROOM DYNASTY</div>
          <div style={{ fontSize: 72, color: "#FFFFFF" }}>PAISLEY · FAGAN</div>
          <div style={{ fontSize: 72, color: LIV_RED }}>EVANS</div>
          <div style={{ marginTop: 10, fontFamily: MARKER, fontSize: 40, color: LIV_GOLD }}>semuanya orang dalam</div>
        </div>
      )}
      {trophies > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 286, transform: "translateX(-50%)", ...fade(trophies), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: RP.voidDark, background: LIV_GOLD, padding: "6px 18px", borderRadius: 10 }}>BOB PAISLEY</div>
          <div style={{ display: "flex", gap: 20, fontFamily: ANTON }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 90, color: RP.neonMagenta, textShadow: `0 0 16px ${RP.neonMagenta}` }}>3</div>
              <div style={{ fontSize: 28, color: RP.synthCyan }}>PIALA EROPA</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 90, color: LIV_GOLD }}>6</div>
              <div style={{ fontSize: 28, color: RP.synthCyan }}>GELAR LIGA</div>
            </div>
          </div>
        </div>
      )}
      <HudTag o={raja} top={290} color={LIV_RED} dark>RAJA INGGRIS & EROPA · ERA 70-80AN</HudTag>
    </>
  );
};

const PenjelasanLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PENJELASAN[0] - 0.3 || t > SEC.PAYOFF[0] + 0.3) return null;
  const ist = win(t, T.budaya - 0.1, T.acMilan - 0.2, 0.3, 0.3);
  const milan = win(t, T.acMilan - 0.1, T.maldini - 0.2, 0.3, 0.3);
  const mal = win(t, T.maldini - 0.1, T.crespo - 0.2, 0.3, 0.3);
  const cresp = win(t, T.crespo - 0.1, T.nolTiga - 0.3, 0.3, 0.3);
  const nol3 = win(t, T.nolTiga - 0.1, SEC.PAYOFF[0] + 0.1, 0.3, 0.4);
  return (
    <>
      <HudTag o={ist} top={286} color={RP.neonMagenta}>ISTANBUL · 25 MEI 2005 · FINAL UCL</HudTag>
      <HudTag o={milan} top={286} color={LIV_RED}>LAWAN: AC MILAN</HudTag>
      <Scoreboard o={mal} top={280} home="LIV" score="0 – 1" away="MIL" sub="MALDINI · MENIT PERTAMA" />
      <Scoreboard o={cresp} top={280} home="LIV" score="0 – 3" away="MIL" sub="CRESPO MENAMBAH DUA" />
      {nol3 > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(nol3), display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: RP.neonMagenta, textShadow: `0 0 20px ${RP.neonMagenta}, 0 6px 22px rgba(0,0,0,0.7)` }}>0 – 3</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: "#fff", background: "rgba(200,16,46,0.85)", padding: "4px 16px", borderRadius: 8 }}>MIMPI BURUK</div>
        </div>
      )}
    </>
  );
};

const PayoffLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PAYOFF[0] - 0.3 || t > SEC.OUTRO[0] + 0.3) return null;
  const enam = win(t, T.enamMenit - 0.1, T.gerrard - 0.2, 0.3, 0.3);
  const ger = win(t, T.gerrard - 0.1, T.smicer - 0.2, 0.3, 0.3);
  const smic = win(t, T.smicer - 0.1, T.alonso - 0.2, 0.3, 0.3);
  const alon = win(t, T.alonso - 0.1, T.tigaTiga - 0.3, 0.3, 0.3);
  const tiga = win(t, T.tigaTiga - 0.1, T.dudek - 0.2, 0.3, 0.3);
  const dud = win(t, T.dudek - 0.1, T.penalti - 0.2, 0.3, 0.3);
  const pen = win(t, T.penalti - 0.1, T.juara5 - 0.2, 0.3, 0.3);
  const juara = win(t, T.juara5 - 0.1, SEC.OUTRO[0] + 0.1, 0.3, 0.3);
  const bump = 1 + 0.06 * Math.max(0, 1 - Math.abs(t - T.juara5 - 0.3) / 0.3);
  return (
    <>
      {enam > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 276, transform: "translateX(-50%)", ...fade(enam), textAlign: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 110, lineHeight: 1, color: RP.neonMagenta, textShadow: `0 0 24px ${RP.neonMagenta}` }}>6 MENIT</div>
          <div style={{ fontFamily: MARKER, fontSize: 48, color: LIV_GOLD }}>mengguncang dunia</div>
        </div>
      )}
      <Scoreboard o={ger} top={280} home="LIV" score="1 – 3" away="MIL" sub="GERRARD · 54'" />
      <Scoreboard o={smic} top={280} home="LIV" score="2 – 3" away="MIL" sub="SMICER · 56'" />
      <Scoreboard o={alon} top={280} home="LIV" score="3 – 3" away="MIL" sub="ALONSO · 60'" />
      {tiga > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: "translateX(-50%)", ...fade(tiga), textAlign: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 160, lineHeight: 1, color: LIV_GOLD, textShadow: `0 0 30px ${RP.neonMagenta}, 0 6px 22px rgba(0,0,0,0.7)` }}>3 – 3</div>
        </div>
      )}
      <HudTag o={dud} top={286} color={RP.synthCyan}>DUDEK · DOUBLE SAVE · SHEVCHENKO</HudTag>
      <HudTag o={pen} top={286} color={RP.neonMagenta}>ADU PENALTI · 3-2 · LIVERPOOL</HudTag>
      {juara > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: `translateX(-50%) scale(${bump})`, ...fade(juara), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: LIV_GOLD, textShadow: `0 0 24px ${RP.neonMagenta}` }}>JUARA KE-5</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: "#fff", background: LIV_RED, padding: "4px 16px", borderRadius: 8 }}>TROFI DISIMPAN PERMANEN</div>
        </div>
      )}
    </>
  );
};

const OutroLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.OUTRO[0] - 0.2) return null;
  const ask = win(t, T.berikut - 0.1, OUTRO_AT + 0.3, 0.3, 0.3);
  return (
    <>
      {ask > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 340, ...fade(ask), background: "rgba(12,8,26,0.86)", borderLeft: `10px solid ${RP.neonMagenta}`, borderRadius: 10, padding: "16px 26px 18px", boxShadow: `0 0 20px ${RP.neonMagenta}40, 0 12px 30px rgba(0,0,0,0.55)` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: RP.synthCyan }}>EPISODE BERIKUTNYA</div>
          <div style={{ fontFamily: ANTON, fontSize: 72, lineHeight: 1.04, color: "#fff" }}>JUVENTUS</div>
          <div style={{ fontFamily: MARKER, fontSize: 38, color: LIV_GOLD, marginTop: 6 }}>sang Nyonya Tua · AUDIRA</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- karaoke captions
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const splitSentence = (ws: Word[]): Word[][] => {
    if (ws.length <= 6) return [ws];
    const k = Math.ceil(ws.length / 6);
    const parts: Word[][] = [];
    let i = 0;
    for (let j = 1; j < k; j++) {
      const ideal = Math.round((ws.length * j) / k);
      let cut = ideal;
      for (const d of [0, -1, 1, -2, 2]) {
        const c = ideal + d;
        if (c - i >= 2 && ws.length - c >= 2 && c - i <= 6 && /,$/.test(ws[c - 1].w)) { cut = c; break; }
      }
      parts.push(ws.slice(i, cut));
      i = cut;
    }
    parts.push(ws.slice(i));
    return parts;
  };
  CLIPS.forEach((c, ci) => {
    const sentences: Word[][] = [];
    let cur: Word[] = [];
    c.words.forEach((w) => { cur.push(w); if (/[.?!]$/.test(w.w)) { sentences.push(cur); cur = []; } });
    if (cur.length) sentences.push(cur);
    const merged: Word[][] = [];
    sentences.forEach((sn) => { if (sn.length === 1 && merged.length) merged[merged.length - 1] = merged[merged.length - 1].concat(sn); else merged.push(sn); });
    const parts = merged.flatMap(splitSentence);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s : Math.min(nextStart, p[p.length - 1].e + 0.5);
      out.push({ words: p, a: p[0].s - 0.08, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  let cut = n;
  const totalChars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
  if (n > 4 || (n === 4 && totalChars > 26)) {
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (totalChars - a));
      if (diff < best) { best = diff; cut = i; }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "rgba(12,8,26,0.93)", borderRadius: 14, padding: "12px 26px 14px", borderLeft: `8px solid ${RP.neonMagenta}`, opacity: appear, transform: `translateY(${(1 - appear) * 14}px)`, textAlign: "center", maxWidth: 960, boxShadow: `0 0 16px ${RP.neonMagenta}30, 0 10px 26px rgba(0,0,0,0.45)` }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.2 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const active = t >= wd.s && t < (ch.words[idx + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span key={idx} style={{ display: "inline-block", margin: "0 12px", fontFamily: GROTESK, fontSize: 54, fontWeight: 700, color: active ? LIV_GOLD : done ? "#F4F7FA" : "rgba(244,247,250,0.78)", transform: `scale(${bump})`, textShadow: active ? `0 0 12px ${LIV_GOLD}` : "none" }}>
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- film
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const k = width / DW;
  return (
    <AbsoluteFill style={{ background: RP.voidDark }}>
      <ThreeCanvas width={width} height={height} camera={{ position: cam.pos.toArray() as [number, number, number], fov: cam.fov, near: 0.1, far: 120 }}>
        <Scene t={t} frame={Math.round(t * 60)} cam={cam} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transform: `scale(${k})`, transformOrigin: "0 0", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,8,26,0.92) 0%, rgba(12,8,26,0.65) 20%, rgba(12,8,26,0) 38%, rgba(12,8,26,0) 75%, rgba(12,8,26,0.7) 100%)" }} />
        <HookLayer t={t} />
        <KonteksLayer t={t} />
        <PengembanganLayer t={t} />
        <PenjelasanLayer t={t} />
        <PayoffLayer t={t} />
        <OutroLayer t={t} />
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT && <Outro start={OUTRO_AT} />}
    </AbsoluteFill>
  );
};
