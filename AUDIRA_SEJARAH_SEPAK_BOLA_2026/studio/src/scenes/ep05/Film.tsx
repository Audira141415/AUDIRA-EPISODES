// EP05 film "Klub Raja Liga" (TACTICBOARD). One continuous camera over the cover's pitch board.
// HOOK: cover frame, chalk crosses out the giants, Linfield circled. KONTEKS: Linfield close-up, counter 57,
// Real Madrid's 36 rises beside it. PENGEMBANGAN: tokens reshuffle, Celtic + Rangers (Glasgow), Celtic's
// 56th puck drops, 56–55, one below the record line. PENJELASAN: crane to a tactical view; streak lanes
// (1 puck = 1 consecutive title): Bayern 11, Skonto / Lincoln / Ludogorets 14, JDT 12 and still running.
// PAYOFF: Leverkusen and Levski pucks slam the lanes shut; "itu dinasti". OUTRO: wide board, AUDIRA LED, teaser.
// Overlay is laid out in 1080x1920 design pixels and scaled to the composition size.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { CLIPS, OUTRO_AT, SEC, T, TOTAL, camAt, clamp, projector, seg, win, type Cam, type Word } from "./timing.ts";
import { CHALK, G14_NAMES, GOLD, GREEN, LANES, laneHero, LEVSKI_SLOT, LEV_SLOT, STACKS, World, laneCount, slotZ, stackState, topY, type V3 } from "./world.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["600", "700"] });

const DW = 1080;
const DH = 1920;

// ---------------------------------------------------------------- 3D
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

const Scene: React.FC<{ t: number; frame: number; cam: Cam }> = ({ t, frame, cam }) => (
  <>
    <CameraRig cam={cam} />
    <color attach="background" args={[P.void]} />
    <fog attach="fog" args={[P.void, 16, 38]} />
    <ambientLight intensity={0.32} color="#DDE6F0" />
    <hemisphereLight args={["#CFE0FF", "#1A2A10", 0.5]} />
    <directionalLight
      position={[4.5, 10, 6]}
      intensity={2.5}
      color={P.flood}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={7}
      shadow-camera-bottom={-7}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-5, 6, -10]} intensity={1.3} color="#9CC3FF" />
    <pointLight position={[0, 0.6, 2.6]} intensity={4} distance={6} color="#7BE39A" />
    <World t={t} />
    <Finish
      frame={frame}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={1}
      envIntensity={0.55}
      ao
      focus={cam.pos.distanceTo(cam.tgt)}
      aperture={t > SEC.OUTRO[0] + 1 ? 0.0045 : 0.0018}
      maxBlur={t > SEC.OUTRO[0] + 1 ? 0.012 : 0.006}
    />
  </>
);

// ---------------------------------------------------------------- overlay helpers
const fade = (o: number): React.CSSProperties => ({ opacity: o, transform: `translateY(${(1 - o) * 16}px)` });

const Chip: React.FC<{ x: number; y: number; o: number; name: string; sub?: string; color: string; num?: string; numColor?: string; gold?: boolean; anchor?: "above" | "below" }> = ({
  x,
  y,
  o,
  name,
  sub,
  color,
  num,
  numColor = "#FFFFFF",
  gold,
  anchor = "above",
}) => {
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, ${anchor === "above" ? "-100%" : "0"}) translateY(${(1 - o) * 14}px)`,
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
        whiteSpace: "nowrap",
      }}
    >
      {num !== undefined && <div style={{ fontFamily: ANTON, fontSize: gold ? 88 : 72, lineHeight: 1, color: gold ? GOLD : numColor }}>{num}</div>}
      <div
        style={{
          marginTop: 4,
          background: color,
          color: color === "#F2F2EE" ? "#14171A" : "#FFFFFF",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 2,
          padding: "4px 14px",
          borderRadius: 8,
          border: gold ? `3px solid ${GOLD}` : "3px solid rgba(255,255,255,0.85)",
        }}
      >
        {name}
      </div>
      {sub && <div style={{ marginTop: 3, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: "#E8FFF0", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{sub}</div>}
    </div>
  );
};

const ChalkText: React.FC<{ x: number; y: number; o: number; size?: number; color?: string; rot?: number; children: React.ReactNode; align?: "left" | "center" }> = ({
  x,
  y,
  o,
  size = 46,
  color = CHALK,
  rot = -4,
  children,
  align = "left",
}) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${align === "center" ? "translateX(-50%) " : ""}rotate(${rot}deg) scale(${0.9 + 0.1 * o})`,
        transformOrigin: "left center",
        opacity: o,
        fontFamily: MARKER,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textShadow: "0 3px 12px rgba(0,0,0,0.75)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );

const HudTag: React.FC<{ o: number; children: React.ReactNode; top: number; left?: number; color?: string; dark?: boolean }> = ({ o, children, top, left = 60, color = GREEN, dark }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left,
        top,
        ...fade(o),
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 2,
        color: dark ? "#06210F" : "#E8FFF0",
        background: dark ? color : "rgba(8,12,18,0.88)",
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "6px 14px",
      }}
    >
      {children}
    </div>
  );

const Big: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transformOrigin: `${x}px ${y}px`, transform: "scale(1.4)" }}>{children}</div>
);
const clampX = (x: number) => Math.min(Math.max(x, 250), 830);
const count = (t: number, a: number, b: number, n: number) => String(Math.round(n * seg(t, a, b)));

// ---------------------------------------------------------------- overlay by section
const HookLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t > 6.6) return null;
  const kick = 1 - seg(t, 2.0, 2.4);
  const head = 1 - seg(t, 2.3, 2.8);
  const chips = 1 - seg(t, 0.12, 0.4); // gone before the first caption pill (0.44 s)
  const ring = 1 - seg(t, 5.8, 6.3);
  const lin = stackState("lin", t);
  const [cx, cy] = pj([lin.x, topY(57), lin.z]);
  const [lx, ly] = pj([2.25, topY(57) + 0.012, 0.1]);
  const nx = Math.min(lx - 40, DW - 330);
  const ny = ly - 150;
  const note = 1 - seg(t, 2.6, 3.0);
  return (
    <>
      <svg width={DW} height={DH} style={{ position: "absolute", inset: 0, opacity: ring }}>
        <defs>
          <filter id="chalk5" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalk5)" fill="none" stroke={CHALK} strokeLinecap="round" strokeLinejoin="round" opacity={0.95}>
          <ellipse cx={cx} cy={cy + 4} rx={128 * (cx > 0 ? 1 : 1)} ry={52} strokeWidth={7} transform={`rotate(-4 ${cx} ${cy})`} />
          <ellipse cx={cx + 3} cy={cy + 1} rx={136} ry={58} strokeWidth={3.5} transform={`rotate(-7 ${cx} ${cy})`} />
          <g opacity={note}>
            <path d={`M ${nx + 60} ${ny + 70} Q ${nx - 10} ${ny + 70} ${cx + 128} ${cy - 30}`} strokeWidth={7} />
            <path d={`M ${cx + 128} ${cy - 30} l 34 -6 M ${cx + 128} ${cy - 30} l 14 -30`} strokeWidth={7} />
          </g>
        </g>
        <text x={nx + 70} y={ny + 50} fill={CHALK} filter="url(#chalk5)" opacity={note} style={{ fontFamily: MARKER, fontSize: 44 }} transform={`rotate(-5 ${nx + 70} ${ny + 50})`}>
          <tspan x={nx + 70}>REKOR</tspan>
          <tspan x={nx + 70} dy={46}>
            DUNIA!
          </tspan>
        </text>
      </svg>
      {/* cover chips (frame 0 = approved cover), cleared before the first caption */}
      {(["cel", "lin", "ran"] as const).map((k) => {
        const s = stackState(k, t);
        const [x, y] = pj([s.x, 0, s.z + 0.45]);
        const d = STACKS[k];
        const hero = k === "lin";
        return chips > 0.01 ? (
          <div
            key={k}
            style={{ position: "absolute", left: x, top: y + 8, transform: "translateX(-50%)", width: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: chips, filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))" }}
          >
            <div style={{ fontFamily: ANTON, fontSize: hero ? 84 : 68, lineHeight: 1, color: hero ? GOLD : "#FFFFFF", textShadow: "0 4px 14px rgba(0,0,0,0.7)" }}>{k === "lin" ? 57 : k === "cel" ? 56 : 55}</div>
            <div style={{ marginTop: 2, background: d.body, color: "#FFFFFF", fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: "4px 14px", borderRadius: 8, border: hero ? `3px solid ${GOLD}` : "3px solid rgba(255,255,255,0.85)" }}>{d.name}</div>
            <div style={{ marginTop: 2, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: "#E8FFF0" }}>{d.country}</div>
          </div>
        ) : null;
      })}
      {/* kicker (series identity) + headline, as on the cover */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: kick }}>
        <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
          <div style={{ background: GREEN, color: "#06210F", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
          <div style={{ background: "rgba(8,12,18,0.92)", color: GOLD, padding: "8px 16px" }}>#05</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#E8FFF0", border: `2px solid ${GREEN}`, borderRadius: 8, padding: "6px 12px" }}>GELAR LIGA · AUDIRA</div>
      </div>
      <div style={{ position: "absolute", left: 56, top: 268, fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)", opacity: head, transform: `translateY(${(1 - head) * -20}px)` }}>
        <div style={{ fontSize: 150, letterSpacing: 1 }}>
          RAJA LIGA <span style={{ color: GOLD }}>DUNIA</span>
        </div>
        <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: "#06210F", background: GREEN, padding: "2px 18px 6px", transform: "rotate(-1.5deg)" }}>
          bukan klub yang kamu kira
        </div>
      </div>
      {/* the giants, crossed out in chalk */}
      {[
        { name: "REAL MADRID", at: T.real0, y: 300 },
        { name: "BAYERN", at: T.bayern0, y: 380 },
      ].map((g) => {
        const o = seg(t, g.at - 0.05, g.at + 0.25) * (1 - seg(t, 5.9, 6.3));
        const strike = seg(t, g.at + 0.25, g.at + 0.55);
        return o > 0.01 ? (
          <div key={g.name} style={{ position: "absolute", left: 70, top: g.y, opacity: o, transform: "rotate(-3deg)" }}>
            <span style={{ fontFamily: MARKER, fontSize: 64, color: "#F4F6EE", textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}>BUKAN {g.name}</span>
            <div style={{ position: "absolute", left: -8, top: 40, height: 8, width: `${strike * 104}%`, background: "#FF5A3C", borderRadius: 4, transform: "rotate(-2deg)" }} />
          </div>
        ) : null;
      })}
      {(() => {
        const o = seg(t, T.linfield0 - 0.05, T.linfield0 + 0.3) * (1 - seg(t, 5.95, 6.3));
        return o > 0.01 ? (
          <div style={{ position: "absolute", left: 66, top: 462, opacity: o, transform: `scale(${0.92 + 0.08 * o})`, transformOrigin: "left center" }}>
            <span style={{ fontFamily: ANTON, fontSize: 120, color: GOLD, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>LINFIELD.</span>
          </div>
        ) : null;
      })()}
    </>
  );
};

const KontekLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.KONTEKS[0] - 0.4 || t > SEC.PENGEMBANGAN[0] + 0.8) return null;
  const card = win(t, T.linfield1 - 0.1, T.real1 + 0.1, 0.35, 0.35);
  const city = seg(t, T.belfast - 0.05, T.belfast + 0.3);
  const lin = stackState("lin", t);
  const [lx, ly] = pj([lin.x + 0.5, topY(57) + 0.1, lin.z]);
  const cnt = win(t, T.lima57 - 0.1, T.tepat + 0.2, 0.25, 0.4);
  const rek = (t >= T.rekor1 - 0.25 ? 1 : 0) * (1 - seg(t, T.tepat - 0.2, T.tepat + 0.2));
  const rea = stackState("rea", t);
  const [rx, ry] = pj([rea.x, topY(36) + 0.12, rea.z]);
  const reaO = win(t, T.real1, T.tepat + 0.1, 0.35, 0.4);
  // when Real appears, Linfield's counter moves above its own stack
  const [lx2, ly2] = pj([lin.x, topY(57) + 0.12, lin.z]);
  const side = seg(t, T.real1 - 0.3, T.real1 + 0.4);
  return (
    <>
      {card > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 280, ...fade(card), display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.55))" }}>
          <div style={{ width: 14, background: STACKS.lin.body, borderRadius: "8px 0 0 8px" }} />
          <div style={{ background: "rgba(8,12,18,0.9)", padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: GREEN }}>KLUB · RAJA LIGA DUNIA</div>
            <div style={{ fontFamily: ANTON, fontSize: 92, lineHeight: 1.02, color: "#FFFFFF" }}>LINFIELD</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: "#E8FFF0", opacity: city }}>BELFAST · IRLANDIA UTARA</div>
          </div>
        </div>
      )}
      {cnt > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: Math.max(lx + (lx2 - lx) * side, 640),
            top: Math.max(ly + (ly2 - ly) * side, 470),
            transform: `translate(${side * -50}%, -100%)`,
            opacity: cnt,
            display: "flex",
            flexDirection: "column",
            alignItems: side > 0.5 ? "center" : "flex-start",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
          }}
        >
          <div style={{ fontFamily: ANTON, fontSize: 150 - side * 50, lineHeight: 1, color: GOLD }}>{count(t, T.lima57, T.lima57 + 1.0, 57)}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: "#FFFFFF", background: STACKS.lin.body, padding: "3px 12px", borderRadius: 6 }}>{side > 0.5 ? "LINFIELD" : "GELAR LIGA"}</div>
          {rek > 0.01 && (
            <div style={{ marginTop: 10, opacity: rek, fontFamily: MONO, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: "#1A1206", background: GOLD, padding: "5px 16px", borderRadius: 8, border: "3px solid #FFFFFF", transform: `scale(${1 + 0.08 * Math.max(0, 1 - (t - T.rekor1 + 0.25) / 0.25)})` }}>REKOR DUNIA</div>
          )}
        </div>
      )}
      <Chip x={Math.min(rx, 900)} y={Math.max(ry, 420)} o={reaO} name="REAL MADRID" sub="SPANYOL" color={STACKS.rea.body} num={count(t, T.real1, T.enam36 + 0.1, 36)} />
    </>
  );
};

const GlasgowLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.PENGEMBANGAN[0] || t > SEC.PENJELASAN[0] + 0.6) return null;
  const end = SEC.PENJELASAN[0] + 0.3;
  const cel = stackState("cel", t);
  const ran = stackState("ran", t);
  const [c0x, c0y] = pj([cel.x, 0.02, cel.z]);
  const [r0x, r0y] = pj([ran.x, 0.02, ran.z]);
  const glas = win(t, T.glasgow - 0.1, T.skornya, 0.35, 0.4);
  const [ctx, cty] = pj([cel.x, topY(57) + 0.5, cel.z]);
  const [rtx, rty] = pj([ran.x, topY(57) + 0.5, ran.z]);
  const celO = win(t, T.celtic - 0.05, end, 0.3, 0.4);
  const ranO = win(t, T.rangers - 0.05, end, 0.3, 0.4);
  const cent = win(t, T.seratus - 0.05, T.mei + 0.2, 0.3, 0.3);
  const mei = win(t, T.mei - 0.05, T.skornya, 0.3, 0.3);
  const bug = win(t, T.skornya - 0.05, end, 0.3, 0.4);
  const minus = win(t, T.satu - 0.05, end, 0.3, 0.4);
  const celN = t < T.menyalip + 0.3 ? "55" : "56";
  const pop = t > T.menyalip + 0.3 ? 1 + 0.12 * Math.max(0, 1 - (t - T.menyalip - 0.3) / 0.3) : 1;
  const mx = (c0x + r0x) / 2;
  const my = (c0y + r0y) / 2;
  return (
    <>
      <svg width={DW} height={DH} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="chalk5b" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalk5b)" fill="none" stroke={CHALK} strokeLinecap="round" opacity={glas}>
          <ellipse cx={mx} cy={my + 10} rx={Math.abs(r0x - c0x) / 2 + 150} ry={70} strokeWidth={7} strokeDasharray={`${glas * 1400} 1400`} />
        </g>
        {minus > 0.01 && (
          <g filter="url(#chalk5b)" fill="none" stroke={CHALK} strokeLinecap="round" strokeWidth={6} opacity={minus}>
            <path d={`M ${ctx - 120} ${cty - 6} L ${ctx - 120} ${pj([cel.x, topY(57) + 0.012, 0.55])[1]}`} />
            <path d={`M ${ctx - 134} ${cty - 6} l 28 0 M ${ctx - 134} ${pj([cel.x, topY(57) + 0.012, 0.55])[1]} l 28 0`} />
          </g>
        )}
      </svg>
      <ChalkText x={mx} y={my + 80} o={glas} size={54} align="center" rot={-3}>
        GLASGOW
      </ChalkText>
      <HudTag o={glas} top={280}>
        GLASGOW · SKOTLANDIA
      </HudTag>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${ctx}px ${cty}px`, transform: `scale(${pop})` }}>
        <Chip x={clampX(ctx)} y={cty} o={celO} name="CELTIC" color={STACKS.cel.body} num={celN} />
      </div>
      <Chip x={clampX(rtx)} y={rty} o={ranO} name="RANGERS" color={STACKS.ran.body} num="55" />
      <ChalkText x={(ctx + rtx) / 2} y={Math.min(cty, rty) - 300} o={cent} size={50} align="center" rot={-2}>
        &gt; 100 TAHUN BERSAING
      </ChalkText>
      <HudTag o={mei} top={350} color={GOLD} dark>
        MEI 2026 · CELTIC JUARA
      </HudTag>
      {bug > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: `translateX(-50%) translateY(${(1 - bug) * 16}px)`, opacity: bug, display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 28px rgba(0,0,0,0.55)", fontFamily: MONO, fontWeight: 800, whiteSpace: "nowrap" }}>
          <div style={{ background: STACKS.cel.body, color: "#fff", fontSize: 34, padding: "10px 18px", letterSpacing: 2 }}>CELTIC</div>
          <div style={{ background: GOLD, color: "#1A1206", fontSize: 48, padding: "2px 22px", fontFamily: ANTON, letterSpacing: 2 }}>56 – 55</div>
          <div style={{ background: STACKS.ran.body, color: "#fff", fontSize: 34, padding: "10px 18px", letterSpacing: 2 }}>RANGERS</div>
        </div>
      )}
      <HudTag o={minus} top={372} color={GOLD} dark>
        REKOR LINFIELD 57 · CELTIC KURANG 1
      </HudTag>
    </>
  );
};

const StreakLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.PENJELASAN[0] || t > SEC.PAYOFF[0] + 0.6) return null;
  const end = SEC.PAYOFF[0] + 0.3;
  const title = win(t, T.lalu - 0.05, T.skonto, 0.35, 0.4);
  const l11 = win(t, T.rekorTop - 0.05, end, 0.3, 0.4);
  const notWorld = seg(t, T.bukan - 0.05, T.bukan + 0.4) * l11;
  const y13 = win(t, T.y2013 - 0.05, T.skonto, 0.25, 0.3);
  const y23 = win(t, T.y2023 - 0.05, T.skonto, 0.25, 0.3);
  const bay = LANES[0];
  const [b0x, b0y] = pj([bay.x, 0.05, slotZ(0)]);
  const [b1x, b1y] = pj([bay.x, 0.05, slotZ(10)]);
  const masih = win(t, T.masih - 0.05, end, 0.3, 0.4);
  return (
    <>
      {title > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 270, ...fade(title) }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: GREEN }}>1 KEPING = 1 MUSIM JUARA</div>
          <div style={{ fontFamily: ANTON, fontSize: 84, lineHeight: 1.0, color: "#FFFFFF", textShadow: "0 6px 20px rgba(0,0,0,0.7)" }}>JUARA BERUNTUN</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, fontFamily: MONO, fontWeight: 800, fontSize: 27, letterSpacing: 1 }}>
            <div style={{ opacity: l11, display: "flex", alignItems: "center", gap: 12, color: "#FFFFFF" }}>
              <span style={{ width: 46, height: 0, borderTop: `6px dashed ${GOLD}` }} />
              <span style={{ color: GOLD }}>11</span> REKOR LIGA TOP EROPA
            </div>
            <div style={{ opacity: notWorld, display: "flex", alignItems: "center", gap: 12, color: "#FF8A6A", paddingLeft: 58 }}>
              <span style={{ textDecoration: "line-through", textDecorationThickness: 4 }}>REKOR DUNIA</span>
            </div>
          </div>
        </div>
      )}
      {/* labels only on the lit hero lane: number at its end, name pill above */}
      {LANES.map((l) => {
        const n = laneCount(l, t);
        const hero = laneHero(l.key, t) * (1 - seg(t, SEC.PAYOFF[0], SEC.PAYOFF[0] + 0.4));
        if (n <= 0 || hero <= 0.02) return null;
        const o = clamp((t - l.t0) / 0.4) * hero;
        const topSlot = l.key === "jdt" && masih > 0.01 ? 13 : n - 1;
        const [ex, ey] = pj([l.x, 0.1, slotZ(topSlot) - 0.22]);
        const px = Math.min(Math.max(ex, 220), 860);
        return (
          <React.Fragment key={l.key}>
            <div style={{ position: "absolute", left: ex, top: ey, transform: "translate(-50%, -100%)", opacity: o, fontFamily: ANTON, fontSize: 76, lineHeight: 1, color: l.key === "jdt" ? "#FFFFFF" : GOLD, textShadow: "0 4px 14px rgba(0,0,0,0.85)" }}>
              {l.key === "g14" ? "14×" : n}
            </div>
            <div
              style={{
                position: "absolute",
                left: px,
                top: ey - 84,
                transform: "translate(-50%, -100%)",
                opacity: o,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              {l.key === "g14" ? (
                G14_NAMES.map((g) => {
                  const go = seg(t, g.at - 0.1, g.at + 0.25);
                  return (
                    <div key={g.name} style={{ opacity: go, background: "rgba(8,12,18,0.92)", border: `3px solid ${GOLD}`, borderRadius: 999, padding: "2px 18px 4px", fontFamily: ANTON, fontSize: 34, color: "#FFFFFF", letterSpacing: 1 }}>
                      {g.name}
                    </div>
                  );
                })
              ) : (
                <div style={{ background: "rgba(8,12,18,0.92)", border: `3px solid ${l.body}`, borderRadius: 999, padding: "4px 22px 6px", fontFamily: ANTON, fontSize: 40, color: "#FFFFFF", letterSpacing: 1, textAlign: "center" }}>
                  {l.name}
                  {l.key === "jdt" && masih > 0.01 && <div style={{ fontFamily: MARKER, fontSize: 32, color: CHALK, opacity: masih }}>masih berjalan</div>}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
      <ChalkText x={b0x - 170} y={b0y - 20} o={y13} size={44} rot={0}>
        2013
      </ChalkText>
      <ChalkText x={b1x - 170} y={b1y - 30} o={y23} size={44} rot={0}>
        2023
      </ChalkText>
    </>
  );
};

const PayoffLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.PAYOFF[0] - 0.2 || t > SEC.OUTRO[0] + 0.6) return null;
  const end = SEC.OUTRO[0] + 0.2;
  const raja = win(t, T.tapi - 0.05, T.rentetan1 + 0.3, 0.3, 0.35);
  const [lvx0, lvy] = pj([LEV_SLOT[0], 0.3, LEV_SLOT[2]]);
  const lvx = clampX(lvx0);
  const lev = win(t, T.leverkusen - 0.05, T.rentetan2, 0.3, 0.3);
  const tk = seg(t, T.tanpaKalah - 0.05, T.tanpaKalah + 0.3);
  const [lsx0, lsy] = pj([LEVSKI_SLOT[0], 0.3, LEVSKI_SLOT[2]]);
  const lsx = clampX(lsx0);
  const lvs = win(t, T.ludo2 + 0.4, T.sekali, 0.3, 0.3);
  const a = win(t, T.sekali - 0.05, end, 0.3, 0.4);
  const b = win(t, T.terus - 0.05, end, 0.3, 0.4);
  const bump = 1 + 0.04 * Math.max(0, 1 - Math.abs(t - T.dinasti - 0.1) / 0.25);
  return (
    <>
      {raja > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 300, ...fade(raja), fontFamily: ANTON, fontSize: 110, lineHeight: 1, color: "#FFFFFF", textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>
          TAK ADA RAJA
          <br />
          <span style={{ color: GOLD }}>YANG ABADI</span>
        </div>
      )}
      <HudTag o={win(t, T.rentetan1 + 0.3, T.rentetan2, 0.3, 0.3)} top={300} color="#E32221">
        BAYERN 11× · DIPATAHKAN LEVERKUSEN
      </HudTag>
      <HudTag o={win(t, T.rentetan2 - 0.05, T.sekali, 0.3, 0.3)} top={300} color="#0047AB">
        LUDOGORETS 14× · DIHENTIKAN LEVSKI
      </HudTag>
      <Big x={lvx} y={lvy}><Chip x={lvx} y={lvy} o={lev} name="LEVERKUSEN" sub={tk > 0.5 ? "2023–24 · TANPA KALAH" : "2023–24"} color="#E32221" /></Big>
      <Big x={lsx} y={lsy}><Chip x={lsx} y={lsy} o={lvs} name="LEVSKI" sub="2025–26 · LUDOGORETS BERHENTI" color="#0047AB" /></Big>
      {a > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 290, fontFamily: ANTON, lineHeight: 1.02, textShadow: "0 6px 24px rgba(0,0,0,0.75)" }}>
          <div style={{ ...fade(a), fontSize: 92, color: "#FFFFFF" }}>
            JUARA SEKALI <span style={{ fontFamily: MARKER, fontSize: 58, color: "#BFE8CC" }}>= bisa kebetulan</span>
          </div>
          <div style={{ ...fade(b), fontSize: 92, color: "#FFFFFF", marginTop: 10 }}>JUARA TERUS-MENERUS</div>
          <div style={{ ...fade(b), marginTop: 6 }}>
            <span style={{ display: "inline-block", fontSize: 150, color: "#1A1206", background: GOLD, padding: "0 26px 6px", transform: `scale(${bump}) rotate(-1.5deg)`, transformOrigin: "left center" }}>= DINASTI</span>
          </div>
        </div>
      )}
    </>
  );
};

const OutroLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.OUTRO[0] - 0.2) return null;
  const tag = win(t, T.ini - 0.05, OUTRO_AT + 0.3, 0.3, 0.3);
  const nxt = win(t, T.episode - 0.05, OUTRO_AT + 0.3, 0.3, 0.3);
  const ttl = seg(t, T.lahirnya - 0.05, T.lahirnya + 0.3) * nxt;
  const yr = seg(t, T.y1863 - 0.05, T.y1863 + 0.3) * nxt;
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 280, ...fade(tag), display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: GREEN, color: "#06210F", padding: "8px 16px" }}>AUDIRA</div>
        <div style={{ background: "rgba(8,12,18,0.92)", color: "#E8FFF0", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
      </div>
      {nxt > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 370, ...fade(nxt), background: "rgba(8,12,18,0.86)", borderLeft: `10px solid ${GOLD}`, borderRadius: 10, padding: "16px 26px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: GOLD }}>EPISODE BERIKUTNYA</div>
          <div style={{ fontFamily: ANTON, fontSize: 80, lineHeight: 1.04, color: "#FFFFFF", opacity: ttl }}>
            LAHIRNYA SEPAK BOLA
            <br />
            MODERN
          </div>
          <div style={{ fontFamily: ANTON, fontSize: 140, lineHeight: 1, color: GOLD, opacity: yr, transform: `scale(${0.9 + 0.1 * yr})`, transformOrigin: "left center" }}>1863</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- karaoke captions
type Chunk = { words: Word[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  // split one sentence into <=6-word parts, preferring a comma near each balanced cut
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
        if (c - i >= 2 && ws.length - c >= 2 && c - i <= 6 && /,$/.test(ws[c - 1].w)) {
          cut = c;
          break;
        }
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
    c.words.forEach((w) => {
      cur.push(w);
      if (/[.?!]$/.test(w.w)) {
        sentences.push(cur);
        cur = [];
      }
    });
    if (cur.length) sentences.push(cur);
    // a one-word sentence joins its neighbour so no caption shows a word alone
    const merged: Word[][] = [];
    sentences.forEach((sn) => {
      if (sn.length === 1 && merged.length) merged[merged.length - 1] = merged[merged.length - 1].concat(sn);
      else merged.push(sn);
    });
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
    const chars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (chars - a));
      if (diff < best) {
        best = diff;
        cut = i;
      }
    }
  }
  const lines = cut >= n ? [ch.words] : [ch.words.slice(0, cut), ch.words.slice(cut)];
  const appear = seg(t, ch.a, ch.a + 0.16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 400, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(7,11,16,0.93)",
          borderRadius: 14,
          padding: "12px 26px 14px",
          borderLeft: `8px solid ${GREEN}`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 14}px)`,
          textAlign: "center",
          maxWidth: 960,
          boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.2 }}>
            {ln.map((wd) => {
              const idx = ch.words.indexOf(wd);
              const active = t >= wd.s && t < (ch.words[idx + 1]?.s ?? ch.b);
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.18) : 1;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    margin: "0 12px",
                    fontFamily: GROTESK,
                    fontSize: 54,
                    fontWeight: 700,
                    color: active ? CHALK : done ? "#F4F7FA" : "rgba(244,247,250,0.78)",
                    transform: `scale(${bump})`,
                  }}
                >
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
  const pj = projector(cam, DW, DH);
  const k = width / DW;
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: cam.pos.toArray() as V3, fov: cam.fov, near: 0.1, far: 120 }}>
        <Scene t={t} frame={Math.round(t * 60)} cam={cam} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transform: `scale(${k})`, transformOrigin: "0 0", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(7,11,16,0.9) 0%, rgba(7,11,16,0.7) 20%, rgba(7,11,16,0) 34%, rgba(7,11,16,0) 80%, rgba(7,11,16,0.5) 100%)",
          }}
        />
        <HookLayer t={t} pj={pj} />
        <KontekLayer t={t} pj={pj} />
        <GlasgowLayer t={t} pj={pj} />
        <StreakLayer t={t} pj={pj} />
        <PayoffLayer t={t} pj={pj} />
        <OutroLayer t={t} />
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT && <Outro start={OUTRO_AT} />}
    </AbsoluteFill>
  );
};
