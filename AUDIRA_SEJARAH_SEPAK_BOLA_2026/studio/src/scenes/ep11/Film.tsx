// EP11 film "AC Milan, Dinasti Merah-Hitam" (TACTICBOARD). One continuous camera over the cover's pitch board.
// HOOK: cover frame, 25 m bracket, pressing arrows. KONTEKS: founding 1899, Wembley 1963, crowns 1-2 rise.
// PENGEMBANGAN: Sacchi, the block opens to ~46 m then snaps to 25 m and steps forward to win the ball.
// PENJELASAN: Dutch Ballon d'Or podium, Steaua 4-0, Benfica, 27-year counter, Capello 58 unbeaten, Barca 4-0;
// crowns 3-5 rise. PAYOFF: Ancelotti, 2003, Istanbul, Athena 2007, Inzaghi; crowns 6-7, the 7th glows gold.
// OUTRO: wide board with all seven crowns, teaser. Overlay is laid out in 1080x1920 design px and scaled.
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
import { CLIPS, OUTRO_AT, SEC, T, TOTAL, TROPHY_AT, TROPHY_YEAR, camAt, projector, seg, win, type Cam, type Word } from "./timing.ts";
import { World, TROPHY_POS, defZ, fwdZ, CHALK, GOLD, RED, BLACK, type V3 } from "./world.tsx";
import { CARRIER, MILAN } from "./Cover.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["600", "700"] });

const DW = 1080;
const DH = 1920;
const ACCENT = RED;

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
    <fog attach="fog" args={[P.void, 15, 36]} />
    <ambientLight intensity={0.3} color="#E6E2DC" />
    <hemisphereLight args={["#FFE6D6", "#1A2A10", 0.45]} />
    <directionalLight
      position={[-4, 10, 5]}
      intensity={2.6}
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
    {/* warm red rim from the far side: Rossoneri mood without tinting the grass */}
    <directionalLight position={[4, 4, -9]} intensity={1.1} color="#FF7A6A" />
    {/* gold key over the trophy line so the cups show a clean specular */}
    <pointLight position={[0, 3.2, -2.2]} intensity={3.2} distance={9} color="#FFE4A6" />
    {/* out-of-focus foreground pucks for depth (TACTICBOARD memory) */}
    {[-1.6, 1.55].map((x) => (
      <mesh key={x} position={[x, 0.05, 3.15]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.09, 40]} />
        <meshPhysicalMaterial color={x < 0 ? BLACK : "#2A2E34"} metalness={0.1} roughness={0.7} />
      </mesh>
    ))}
    <World t={t} />
    <Finish
      frame={frame}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={1}
      envIntensity={0.55}
      ao
      focus={cam.pos.distanceTo(cam.tgt)}
      aperture={t > SEC.OUTRO[0] + 1 ? 0.004 : 0.0016}
      maxBlur={t > SEC.OUTRO[0] + 1 ? 0.012 : 0.006}
    />
  </>
);

// ---------------------------------------------------------------- overlay helpers
const fade = (o: number): React.CSSProperties => ({ opacity: o, transform: `translateY(${(1 - o) * 16}px)` });
const clampX = (x: number) => Math.min(Math.max(x, 250), 830);
const count = (t: number, a: number, b: number, n: number) => String(Math.round(n * seg(t, a, b)));

const HudTag: React.FC<{ o: number; children: React.ReactNode; top: number; left?: number; color?: string; dark?: boolean }> = ({ o, children, top, left, color = ACCENT, dark }) =>
  o <= 0.01 ? null : (
    <div
      style={{
        position: "absolute",
        left: left ?? "50%",
        top,
        transform: `${left === undefined ? "translateX(-50%) " : ""}translateY(${(1 - o) * 16}px)`,
        opacity: o,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: 32,
        letterSpacing: 2,
        color: dark ? "#1A0A08" : "#FFF1F1",
        background: dark ? color : "rgba(10,8,10,0.9)",
        border: `2px solid ${color}`,
        borderRadius: 10,
        padding: "8px 18px",
        whiteSpace: "nowrap",
        boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );

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

const Scoreboard: React.FC<{ o: number; top: number; home: string; score: string; away: string; sub: string }> = ({ o, top, home, score, away, sub }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) translateY(${(1 - o) * 16}px)`, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 28px rgba(0,0,0,0.55)", fontFamily: MONO, fontWeight: 800, whiteSpace: "nowrap" }}>
        <div style={{ background: RED, color: "#fff", fontSize: 34, padding: "10px 20px", letterSpacing: 2 }}>{home}</div>
        <div style={{ background: GOLD, color: "#1A1206", fontSize: 50, padding: "2px 24px", fontFamily: ANTON, letterSpacing: 2 }}>{score}</div>
        <div style={{ background: "#20242B", color: "#fff", fontSize: 34, padding: "10px 20px", letterSpacing: 2 }}>{away}</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: CHALK, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{sub}</div>
    </div>
  );

// ---------------------------------------------------------------- trophy year chips (3D-anchored)
const TrophyYears: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => (
  <>
    {TROPHY_POS.map((p, i) => {
      const o = seg(t, TROPHY_AT[i] + 0.3, TROPHY_AT[i] + 0.8) * (1 - seg(t, OUTRO_AT - 0.3, OUTRO_AT));
      if (o <= 0.02) return null;
      const [x, y, z] = pj([p[0], p[1] + 0.28, p[2]]);
      if (z > 1) return null; // behind camera
      const hero = i === 6;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: clampX(x),
            top: y,
            transform: "translate(-50%, -100%)",
            opacity: o,
            fontFamily: ANTON,
            fontSize: hero ? 44 : 34,
            color: hero ? GOLD : "#FFF1F1",
            background: "rgba(10,8,10,0.82)",
            border: `2px solid ${hero ? GOLD : "rgba(255,255,255,0.7)"}`,
            borderRadius: 8,
            padding: "2px 12px 4px",
            whiteSpace: "nowrap",
            textShadow: "0 3px 10px rgba(0,0,0,0.7)",
          }}
        >
          {TROPHY_YEAR[i]}
        </div>
      );
    })}
  </>
);

// ---------------------------------------------------------------- sections
const HookLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t > 7.2) return null;
  const kick = 1 - seg(t, 5.6, 6.2);
  const head = (1 - seg(t, 5.4, 6.1)) * seg(t, 0.0, 0.3);
  // 25 m bracket on the left side of the block
  const [ax, ay] = pj([-1.95, 0.02, defZ(t)]);
  const [cx, cy] = pj([-1.95, 0.02, fwdZ(t)]);
  const br = seg(t, 0.2, 0.7) * (1 - seg(t, 6.4, 7.0));
  const num = seg(t, T.milan25 - 0.1, T.milan25 + 0.3) * (1 - seg(t, 6.4, 7.0));
  const mx = (ax + cx) / 2 - 36;
  const my = (ay + cy) / 2;
  return (
    <>
      <svg width={DW} height={DH} style={{ position: "absolute", inset: 0, opacity: br }}>
        <defs>
          <filter id="chalkH" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalkH)" fill="none" stroke={CHALK} strokeLinecap="round" strokeLinejoin="round" strokeWidth={7}>
          <path d={`M ${ax + 26} ${ay} L ${ax - 10} ${ay} L ${cx - 10} ${cy} L ${cx + 26} ${cy}`} />
        </g>
      </svg>
      <ChalkText x={mx} y={my - 36} o={num} size={60} align="left" rot={-4}>
        25 M
      </ChalkText>
      {/* kicker + headline, as on the cover */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: kick }}>
        <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
          <div style={{ background: RED, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
          <div style={{ background: "rgba(8,8,10,0.94)", color: GOLD, padding: "8px 16px" }}>#11</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#FFF1F1", border: `2px solid ${RED}`, borderRadius: 8, padding: "6px 12px" }}>AC MILAN · AUDIRA</div>
      </div>
      <div style={{ position: "absolute", left: 56, top: 270, fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.95, textShadow: "0 8px 28px rgba(0,0,0,0.65)", opacity: head }}>
        <div style={{ fontSize: 132, letterSpacing: 1 }}>DINASTI</div>
        <div style={{ fontSize: 132, letterSpacing: 1 }}>
          <span style={{ color: RED }}>MERAH</span>-HITAM
        </div>
        <div style={{ marginTop: 16, display: "inline-block", fontFamily: MARKER, fontSize: 50, color: BLACK, background: GOLD, padding: "2px 18px 6px", transform: "rotate(-1.5deg)" }}>
          7 mahkota Eropa, rahasianya 25 meter
        </div>
      </div>
    </>
  );
};

const KontekLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.KONTEKS[0] - 0.3 || t > SEC.PENGEMBANGAN[0] + 0.4) return null;
  const found = win(t, T.lahir - 0.1, T.merah - 0.1, 0.35, 0.35);
  const col = win(t, T.merah - 0.05, T.wembley - 0.2, 0.3, 0.35);
  const wem = win(t, T.wembley - 0.1, T.kedua + 0.5, 0.35, 0.4);
  return (
    <>
      {found > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 280, ...fade(found), display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.55))" }}>
          <div style={{ width: 14, background: RED, borderRadius: "8px 0 0 8px" }} />
          <div style={{ background: "rgba(10,8,10,0.9)", padding: "12px 22px 14px", borderRadius: "0 8px 8px 0" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: GOLD }}>MILAN · LAHIR 1899</div>
            <div style={{ fontFamily: ANTON, fontSize: 70, lineHeight: 1.04, color: "#FFFFFF" }}>HERBERT KILPIN</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: "#FFD9D9" }}>PENDIRI ASAL INGGRIS</div>
          </div>
        </div>
      )}
      {col > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 300, display: "flex", gap: 14, ...fade(col) }}>
          <div style={{ fontFamily: ANTON, fontSize: 46, color: "#fff", background: RED, padding: "6px 18px", borderRadius: 10 }}>MERAH = SEMANGAT</div>
          <div style={{ fontFamily: ANTON, fontSize: 46, color: "#fff", background: BLACK, border: "2px solid #3A3A40", padding: "6px 18px", borderRadius: 10 }}>HITAM = RASA TAKUT LAWAN</div>
        </div>
      )}
      <HudTag o={wem} top={286} color={GOLD} dark>
        1963 · WEMBLEY — JUARA EROPA PERTAMA DARI ITALIA
      </HudTag>
    </>
  );
};

const SacchiLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.PENGEMBANGAN[0] - 0.3 || t > SEC.PENJELASAN[0] + 0.3) return null;
  const name = win(t, T.sacchi - 0.1, T.jarak - 0.3, 0.35, 0.35);
  const shoe = win(t, T.sepatu - 0.1, T.jarak - 0.3, 0.3, 0.3);
  // 25 m bracket measuring the block
  const [ax, ay] = pj([-1.95, 0.02, defZ(t)]);
  const [cx, cy] = pj([-1.95, 0.02, fwdZ(t)]);
  const br = seg(t, T.jarak - 0.2, T.jarak + 0.3) * (1 - seg(t, T.blok + 1.4, T.blok + 2.0));
  const m25 = seg(t, T.m25 - 0.1, T.m25 + 0.3) * (1 - seg(t, T.blok + 1.4, T.blok + 2.0));
  const mx = (ax + cx) / 2 - 36;
  const my = (ay + cy) / 2;
  // pressing arrows to the carrier
  const press = seg(t, T.blok + 0.1, T.blok + 0.6) * (1 - seg(t, 37.6, 38.1));
  const [tx, ty] = pj([CARRIER[0], 0.1, CARRIER[1]]);
  const from = [MILAN[9].p, MILAN[8].p, MILAN[7].p].map((p) => pj([p[0], 0.1, p[1] - 0.55 * seg(t, T.blok, T.blok + 1.1)]));
  const blok = win(t, T.blok - 0.05, 38.0, 0.3, 0.3);
  return (
    <>
      {name > 0.01 && (
        <div style={{ position: "absolute", left: 56, top: 268, ...fade(name), fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.98, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: GOLD }}>REVOLUSI PELATIH</div>
          <div style={{ fontSize: 118 }}>ARRIGO <span style={{ color: RED }}>SACCHI</span></div>
          <div style={{ marginTop: 10, display: "inline-block", fontFamily: MARKER, fontSize: 48, color: BLACK, background: GOLD, padding: "2px 18px 6px", transform: "rotate(-1.5deg)", opacity: shoe }}>
            bekas penjual sepatu, bukan eks pemain
          </div>
        </div>
      )}
      <svg width={DW} height={DH} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="chalkS" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#chalkS)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {br > 0.01 && <path d={`M ${ax + 26} ${ay} L ${ax - 10} ${ay} L ${cx - 10} ${cy} L ${cx + 26} ${cy}`} stroke={CHALK} strokeWidth={7} opacity={br} />}
          {press > 0.01 &&
            from.map(([fx, fy], i) => {
              const k = 0.72;
              const ex = fx + (tx - fx) * k;
              const ey = fy + (ty - fy) * k;
              const ang = Math.atan2(ey - fy, ex - fx);
              const h1 = [ex - Math.cos(ang - 0.5) * 26, ey - Math.sin(ang - 0.5) * 26];
              const h2 = [ex - Math.cos(ang + 0.5) * 26, ey - Math.sin(ang + 0.5) * 26];
              return (
                <g key={i} stroke="#FF5A4A" strokeWidth={7} opacity={press}>
                  <path d={`M ${fx} ${fy} L ${ex} ${ey}`} />
                  <path d={`M ${h1[0]} ${h1[1]} L ${ex} ${ey} L ${h2[0]} ${h2[1]}`} />
                </g>
              );
            })}
        </g>
      </svg>
      <ChalkText x={mx} y={my - 36} o={m25} size={60} align="left" rot={-4}>
        25 M
      </ChalkText>
      <HudTag o={blok} top={300} color={RED}>
        10 PEMAIN = 1 BLOK · REBUT BOLA DI DEPAN
      </HudTag>
    </>
  );
};

const PenjelasanLayer: React.FC<{ t: number; pj: (p: V3) => [number, number, number] }> = ({ t, pj }) => {
  if (t < SEC.PENJELASAN[0] - 0.3 || t > SEC.PAYOFF[0] + 0.3) return null;
  const podium = win(t, T.ballon - 0.1, T.steaua - 0.3, 0.3, 0.3);
  const steaua = win(t, T.steaua - 0.1, T.benfica - 0.3, 0.3, 0.3);
  const benfica = win(t, T.benfica - 0.1, T.y27 - 0.3, 0.3, 0.3);
  const y27 = win(t, T.y27 - 0.1, T.capello - 0.4, 0.3, 0.35);
  const capello = win(t, T.capello - 0.1, T.barca - 0.3, 0.3, 0.3);
  const barca = win(t, T.barca - 0.1, SEC.PAYOFF[0] + 0.1, 0.3, 0.3);
  const names = ["GULLIT", "VAN BASTEN", "RIJKAARD"];
  return (
    <>
      {/* Dutch Ballon d'Or 1988 — Milan swept the top 3, as a clean centred podium card */}
      {podium > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 290, transform: "translateX(-50%)", ...fade(podium), display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: "#1A0A08", background: GOLD, padding: "6px 18px", borderRadius: 10 }}>BALLON D'OR 1988</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            {[1, 2, 3].map((rank, i) => (
              <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontFamily: ANTON, fontSize: rank === 1 ? 58 : 46, color: GOLD, lineHeight: 1 }}>{rank}</div>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 1, color: "#fff", background: RED, border: "2px solid rgba(255,255,255,0.85)", borderRadius: 8, padding: "6px 14px", whiteSpace: "nowrap", height: rank === 1 ? 70 : 54, display: "flex", alignItems: "center" }}>{names[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: MARKER, fontSize: 34, color: CHALK }}>tiga teratas, semua Milan</div>
        </div>
      )}
      <Scoreboard o={steaua} top={286} home="MILAN" score="4 – 0" away="STEAUA" sub="FINAL EROPA · 1989" />
      <Scoreboard o={benfica} top={286} home="MILAN" score="1 – 0" away="BENFICA" sub="FINAL EROPA · 1990" />
      {y27 > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 290, transform: "translateX(-50%)", ...fade(y27), display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: GOLD, textShadow: "0 6px 22px rgba(0,0,0,0.7)" }}>{count(t, T.y27, T.y27 + 1.0, 27)}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: "#fff", background: RED, padding: "4px 16px", borderRadius: 8 }}>TAHUN TAK ADA JUARA BERTAHAN</div>
        </div>
      )}
      {capello > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 292, transform: "translateX(-50%)", ...fade(capello), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: GOLD }}>FABIO CAPELLO</div>
          <div style={{ fontFamily: ANTON, fontSize: 130, lineHeight: 1, color: "#fff" }}>{count(t, T.l58, T.l58 + 1.0, 58)}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: "#1A0A08", background: GOLD, padding: "4px 16px", borderRadius: 8 }}>LAGA SERIE A TANPA KALAH</div>
        </div>
      )}
      <Scoreboard o={barca} top={286} home="MILAN" score="4 – 0" away="BARCELONA" sub="FINAL EROPA · 1994" />
    </>
  );
};

const PayoffLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.PAYOFF[0] - 0.3 || t > SEC.OUTRO[0] + 0.3) return null;
  const name = win(t, T.ancelotti - 0.1, T.penalti - 0.3, 0.3, 0.3);
  const y2003 = win(t, T.penalti - 0.1, T.istanbul - 0.3, 0.3, 0.3);
  const ist = win(t, T.istanbul - 0.1, T.athena - 0.3, 0.3, 0.3);
  const ath = win(t, T.athena - 0.1, T.inzaghi - 0.2, 0.3, 0.3);
  const seven = win(t, T.inzaghi - 0.05, SEC.OUTRO[0] + 0.1, 0.3, 0.3);
  const bump = 1 + 0.06 * Math.max(0, 1 - Math.abs(t - T.ketujuh - 0.2) / 0.3);
  return (
    <>
      {name > 0.01 && (
        <div style={{ position: "absolute", left: 56, top: 280, ...fade(name), fontFamily: ANTON, lineHeight: 0.98, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: GOLD }}>ERA</div>
          <div style={{ fontSize: 118, color: "#F6F8F2" }}>CARLO <span style={{ color: RED }}>ANCELOTTI</span></div>
        </div>
      )}
      <HudTag o={y2003} top={290} color={GOLD} dark>
        2003 · JUARA LEWAT ADU PENALTI
      </HudTag>
      <HudTag o={ist} top={290} color="#C0202E">
        ISTANBUL 2005 · UNGGUL 3–0 LALU RUNTUH
      </HudTag>
      <HudTag o={ath} top={290} color={RED}>
        ATHENA 2007 · BALAS LIVERPOOL
      </HudTag>
      {seven > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 286, transform: `translateX(-50%) scale(${bump})`, ...fade(seven), display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: "#fff" }}>2 GOL INZAGHI</div>
          <div style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: GOLD, textShadow: "0 8px 26px rgba(0,0,0,0.7)" }}>MAHKOTA KE-7</div>
        </div>
      )}
    </>
  );
};

const OutroLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < SEC.OUTRO[0] - 0.2) return null;
  const idea = win(t, T.tujuh - 0.05, T.menurut - 0.2, 0.3, 0.3);
  const ask = win(t, T.menurut - 0.05, OUTRO_AT + 0.3, 0.3, 0.3);
  return (
    <>
      {idea > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 300, ...fade(idea), fontFamily: ANTON, lineHeight: 1.0, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>
          <div style={{ fontSize: 110, color: "#fff" }}>7 MAHKOTA</div>
          <div style={{ fontSize: 110, color: GOLD }}>1 IDE: TIM RAPAT</div>
        </div>
      )}
      {ask > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 360, ...fade(ask), background: "rgba(10,8,10,0.86)", borderLeft: `10px solid ${RED}`, borderRadius: 10, padding: "16px 26px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: GOLD }}>MENURUTMU</div>
          <div style={{ fontFamily: ANTON, fontSize: 72, lineHeight: 1.04, color: "#fff" }}>SIAPA PENERUS<br />DINASTI MILAN?</div>
          <div style={{ fontFamily: MARKER, fontSize: 40, color: CHALK, marginTop: 8 }}>tulis di komentar · ikuti AUDIRA</div>
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
    let best = 1e9;
    for (let i = 2; i <= n - 2; i++) {
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (totalChars - a));
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
          background: "rgba(7,6,8,0.93)",
          borderRadius: 14,
          padding: "12px 26px 14px",
          borderLeft: `8px solid ${RED}`,
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
            background: "linear-gradient(180deg, rgba(7,6,8,0.9) 0%, rgba(7,6,8,0.68) 20%, rgba(7,6,8,0) 34%, rgba(7,6,8,0) 80%, rgba(7,6,8,0.5) 100%)",
          }}
        />
        <TrophyYears t={t} pj={pj} />
        <HookLayer t={t} pj={pj} />
        <KontekLayer t={t} />
        <SacchiLayer t={t} pj={pj} />
        <PenjelasanLayer t={t} pj={pj} />
        <PayoffLayer t={t} />
        <OutroLayer t={t} />
        <Captions t={t} />
      </div>
      {t >= OUTRO_AT && <Outro start={OUTRO_AT} />}
    </AbsoluteFill>
  );
};
