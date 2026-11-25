// EP47 film "Grande Torino, Tragedi Superga 1949" (WORLDFORGE). Seven visual scenes, every cut
// hidden in a fog veil: 1 Superga at dusk (cover pose) → 2 Filadelfia pitch, five shields, the 1947
// lineup, Mazzola → 3 relief map Turin → Lisbon → 4 Superga swallowed by fog (no aircraft) →
// 5 pitch at dusk, champions board, junior lines → 6 Turin avenue full of mourners → 7 memorial,
// 18 candles, crane back to the cover pose. Overlay laid out in 1080×1920 design px and scaled.
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { Stage, type Look, type ShadowBox, type Shot } from "../../kits/worldforge/Stage.tsx";
import { SkyDome, useSkyEnvironment, type SkyColors } from "../../kits/worldforge/Sky.tsx";
import { Basilica, CREAM, GOLD, GRANATA, Memorial, Mist, PITCH, SHADOW_BOX, SKY, Scatter, Terrain } from "./Cover.tsx";
import { Avenue, ChampionsBoard, Juniors, Lineup, MapTable, PitchGround, Shields } from "./FilmWorld.tsx";
import { AVENUE, KEEPER, LINEUP_X, LISBON, MAP_CX, MAP_CZ, MAP_D, MAP_W, MAZZOLA, P, TURIN, type V3 } from "./set.ts";
import { CLIPS, CUTS, OUTRO_AT, T, TOTAL, camAt, lerp, projector, seg, veilAt, win, type Cam, type SceneId, type Word } from "./timing.ts";
import { SUN, SUMMIT } from "./world.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });
const { fontFamily: PLAYFAIR } = loadPlayfair("italic", { weights: ["600"] });
const { fontFamily: GROTESK } = loadGrotesk("normal", { weights: ["600", "700"] });

const DW = 1080;
const DH = 1920;
const INK = "rgba(12,9,11,0.9)";

// ---------------------------------------------------------------- light per scene
const SKY_DAY: SkyColors = { zenith: "#5f86b8", horizon: "#f1dcbc", glow: "#ffc27a", halo: "#fff3df", ground: "#6d6a52", sunDisk: 0 };
const SKY_FOG: SkyColors = { zenith: "#8a96a2", horizon: "#c4c9c8", glow: "#d9d3c6", halo: "#e8e4da", ground: "#62655c", sunDisk: 0 };
const SKY_DUSK: SkyColors = { zenith: "#3b4769", horizon: "#eaa478", glow: "#ff8848", halo: "#ffd9b0", ground: "#5a5144", sunDisk: 0 };

const corners = (pts: V3[], y0: number, y1: number): Pick<ShadowBox, "min" | "max"> => ({
  min: [Math.min(...pts.map((p) => p[0])), y0, Math.min(...pts.map((p) => p[2]))],
  max: [Math.max(...pts.map((p) => p[0])), y1, Math.max(...pts.map((p) => p[2]))],
});
const BASE = P(0, 0, 0)[1];
const PITCH_BOX: ShadowBox = { ...corners([P(-75, 0, -72), P(75, 0, -72), P(-75, 0, 72), P(75, 0, 72)], BASE - 2, BASE + 14), mapWidth: 4096, sun: SUN };
const STREET_BOX: ShadowBox = { ...corners([P(-32, 0, AVENUE.z0 - 4), P(32, 0, AVENUE.z0 - 4), P(-32, 0, AVENUE.z1 + 4), P(32, 0, AVENUE.z1 + 4)], BASE - 2, BASE + 28), mapWidth: 2048, sun: SUN };
const MAP_BOX: ShadowBox = { min: [MAP_CX - MAP_W / 2 - 6, -4, MAP_CZ - MAP_D / 2 - 6], max: [MAP_CX + MAP_W / 2 + 6, 44, MAP_CZ + MAP_D / 2 + 6], mapWidth: 2048, sun: SUN };
const BOX: Record<SceneId, ShadowBox> = { hook: SHADOW_BOX, pitch: PITCH_BOX, map: MAP_BOX, fog: SHADOW_BOX, dusk: PITCH_BOX, street: STREET_BOX, memorial: SHADOW_BOX };

const C = CUTS.map((c) => c.t);

const Scene: React.FC<{ t: number; frame: number; cam: Cam }> = ({ t, frame, cam }) => {
  const envGold = useSkyEnvironment(SUN, SKY, 0.85);
  const envDay = useSkyEnvironment(SUN, SKY_DAY, 0.9);
  const envFog = useSkyEnvironment(SUN, SKY_FOG, 0.7);
  const envDusk = useSkyEnvironment(SUN, SKY_DUSK, 0.8);
  const sc = cam.scene;
  const f = Math.round(t * 60);
  const shot: Shot = { pos: cam.pos.toArray() as V3, target: cam.tgt.toArray() as V3, fov: cam.fov, near: sc === "map" ? 1 : 0.3, far: 30000 };
  const veil = veilAt(t);
  const base = { exposure: 1.0, envIntensity: 0.55, ao: 0.8, bloom: 0.14, haze: veil, hazeFlow: t, hazeColor: sc === "fog" ? "#cfd2cf" : "#f0e0c6", vignette: 0.2, sun: SUN };
  const fogD = lerp(0.0016, 0.0064, seg(t, C[2], T.n31));
  const looks: Record<SceneId, Look> = {
    hook: { ...base, sunColor: "#ffc786", sunI: 5.4, fog: { color: SKY.horizon, density: 0.00034 }, background: SKY.horizon, environment: envGold },
    memorial: { ...base, sunColor: "#ffc786", sunI: 5.4, fog: { color: SKY.horizon, density: 0.00034 }, background: SKY.horizon, environment: envGold, vignette: 0.24 },
    pitch: { ...base, sunColor: "#ffd9a8", sunI: 5.0, fog: { color: SKY_DAY.horizon, density: 0.0009 }, background: SKY_DAY.horizon, environment: envDay, envIntensity: 0.6 },
    map: { ...base, sunColor: "#fff0d8", sunI: 3.4, fog: null, background: "#1d1814", environment: envGold, envIntensity: 0.7, ao: 0.6, bloom: 0.3, vignette: 0.34 },
    fog: { ...base, sunColor: "#d0d6dc", sunI: lerp(2.6, 1.3, seg(t, C[2], T.n31)), exposure: 0.95, fog: { color: SKY_FOG.horizon, density: fogD }, background: SKY_FOG.horizon, environment: envFog, vignette: 0.28, bloom: 0.08 },
    dusk: { ...base, sunColor: "#ff9e62", sunI: 3.8, exposure: 0.98, fog: { color: SKY_DUSK.horizon, density: 0.0011 }, background: SKY_DUSK.horizon, environment: envDusk },
    street: { ...base, sunColor: "#ff9e62", sunI: 3.4, exposure: 0.98, fog: { color: SKY_DUSK.horizon, density: 0.0015 }, background: SKY_DUSK.horizon, environment: envDusk, vignette: 0.26 },
  };
  const sky = sc === "pitch" ? SKY_DAY : sc === "fog" ? SKY_FOG : sc === "dusk" || sc === "street" ? SKY_DUSK : SKY;
  // mist: climbs through the hook, smothers the hill in the explanation
  const rise = sc === "hook" ? 9 * seg(t, 0, C[0]) : sc === "fog" ? 22 + 14 * seg(t, C[2], T.n31) : 0;
  const thick = sc === "fog" ? lerp(1.8, 3.2, seg(t, C[2], T.n31)) : 1;
  const lit = sc === "memorial" ? Math.max(0, Math.min(18, ((t - (T.limaGelar - 0.2)) / (T.bukit + 1.4 - T.limaGelar)) * 18)) : 18;
  return (
    <Stage shot={shot} look={looks[sc]} shadowBox={BOX[sc]} frame={frame}>
      {[SKY, SKY_DAY, SKY_FOG, SKY_DUSK].map((s, i) => (
        <SkyDome key={i} sun={SUN} colors={s} visible={sc !== "map" && s === sky} />
      ))}
      <group visible={sc !== "map"}>
        <Terrain />
        <Scatter />
        <Basilica />
        <Memorial lit={lit} />
        <PitchGround />
        {sc === "pitch" && (
          <>
            <Shields t={t} />
            <Lineup t={t} f={f} />
          </>
        )}
        {sc === "dusk" && (
          <>
            <ChampionsBoard t={t} />
            <Juniors t={t} f={f} />
          </>
        )}
        {sc === "street" && <Avenue t={t} />}
        <Mist rise={rise} thick={thick} />
      </group>
      <group visible={sc === "map"}>
        <MapTable t={t} />
      </group>
    </Stage>
  );
};

// ---------------------------------------------------------------- overlay helpers
type PJ = (p: V3) => [number, number, number];
const fade = (o: number): React.CSSProperties => ({ opacity: o, transform: `translateY(${(1 - o) * 16}px)` });
const count = (t: number, a: number, b: number, n: number) => String(Math.round(n * seg(t, a, b)));
const clampX = (x: number) => Math.min(Math.max(x, 200), 880);

const HudTag: React.FC<{ o: number; top: number; children: React.ReactNode; color?: string; dark?: boolean; size?: number }> = ({ o, top, children, color = GOLD, dark, size = 34 }) =>
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
        fontSize: size,
        letterSpacing: 2,
        color: dark ? "#1a0c0e" : CREAM,
        background: dark ? color : INK,
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

const NameCard: React.FC<{ o: number; top: number; kicker: string; name: React.ReactNode; sub?: string; size?: number }> = ({ o, top, kicker, name, sub, size = 92 }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: 60, top, ...fade(o), display: "flex", alignItems: "stretch", filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.55))" }}>
      <div style={{ width: 14, background: GRANATA, borderRadius: "8px 0 0 8px" }} />
      <div style={{ background: INK, padding: "14px 26px 16px", borderRadius: "0 8px 8px 0" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: GOLD }}>{kicker}</div>
        <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 1.04, color: CREAM, whiteSpace: "nowrap" }}>{name}</div>
        {sub && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 2, color: "#f3d6d6" }}>{sub}</div>}
      </div>
    </div>
  );

const BigNumber: React.FC<{ o: number; top: number; value: string; label: string; color?: string; scale?: number }> = ({ o, top, value, label, color = GOLD, scale = 1 }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) translateY(${(1 - o) * 16}px) scale(${scale})`, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontFamily: ANTON, fontSize: 190, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,0.65)" }}>{value}</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: CREAM, background: GRANATA, padding: "6px 18px", borderRadius: 8, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );

/** Chip pinned to a 3D point (head of a player, a map pin, the basilica). */
const Pin: React.FC<{ o: number; pj: PJ; at: V3; children: React.ReactNode; color?: string; size?: number }> = ({ o, pj, at, children, color = GOLD, size = 34 }) => {
  if (o <= 0.01) return null;
  const [x, y, z] = pj(at);
  if (z > 1 || y < 240 || y > 1300) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: clampX(x),
        top: y,
        transform: `translate(-50%, -100%) translateY(${(1 - o) * 10}px)`,
        opacity: o,
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 2,
        color: CREAM,
        background: INK,
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "4px 14px",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- section layers
const HookLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t > C[0] + 0.1) return null;
  const head = 1 - seg(t, 5.2, 5.9);
  const brand = win(t, T.audira - 0.1, C[0], 0.3, 0.25);
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: head }}>
        <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 2 }}>
          <div style={{ background: PITCH, color: "#0b1a10", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
          <div style={{ background: "rgba(10,8,10,0.92)", color: GOLD, padding: "8px 16px" }}>#47</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: CREAM, border: `2px solid ${GOLD}`, borderRadius: 8, padding: "6px 12px" }}>4 MEI 1949</div>
      </div>
      <div style={{ position: "absolute", left: 58, right: 58, top: 276, fontFamily: ANTON, color: CREAM, lineHeight: 0.98, textShadow: "0 8px 30px rgba(0,0,0,0.7)", opacity: head }}>
        <div style={{ fontSize: 142, letterSpacing: 1 }}>TIM TERBAIK</div>
        <div style={{ fontSize: 142, letterSpacing: 1 }}>
          YANG <span style={{ color: GOLD }}>HILANG</span>
        </div>
        <div style={{ marginTop: 18, display: "inline-block", fontFamily: PLAYFAIR, fontStyle: "italic", fontWeight: 600, fontSize: 46, lineHeight: 1.2, color: CREAM, background: GRANATA, padding: "6px 22px 10px", borderRadius: 6 }}>
          Grande Torino: 5 scudetto beruntun
        </div>
      </div>
      <HudTag o={brand} top={300} color={GOLD}>
        AUDIRA · SEJARAH SEPAK BOLA
      </HudTag>
    </>
  );
};

const PitchLayer: React.FC<{ t: number; pj: PJ }> = ({ t, pj }) => {
  if (t < C[0] - 0.1 || t > C[1] + 0.2) return null;
  const name = win(t, T.grande - 0.1, T.limaKali - 0.15, 0.3, 0.3);
  const five = win(t, T.limaKali - 0.05, T.perang - 0.15, 0.3, 0.3);
  const war = win(t, T.perang - 0.1, T.y47 - 0.15, 0.3, 0.3);
  const match = win(t, T.y47 - 0.05, T.sepuluh - 0.15, 0.3, 0.3);
  const ten = win(t, T.sepuluh - 0.05, T.mazzola - 0.2, 0.3, 0.3);
  const keeper = win(t, T.kiper - 0.05, T.mazzola - 0.2, 0.3, 0.3);
  const maz = win(t, T.mazzola - 0.1, C[1], 0.3, 0.25);
  const top = win(t, T.topSkor - 0.1, C[1], 0.3, 0.25);
  const bump = (at: number) => 1 + 0.06 * Math.max(0, 1 - Math.abs(t - at - 0.2) / 0.3);
  return (
    <>
      <NameCard o={name} top={300} kicker="TORINO · 1940-AN" name={<>GRANDE <span style={{ color: GOLD }}>TORINO</span></>} sub="TIM TERKUAT ITALIA" />
      <BigNumber o={five} top={286} value="5×" label="JUARA SERIE A BERUNTUN" scale={bump(T.limaKali)} />
      <HudTag o={war} top={300} color="#9aa6b0">
        1943–1945 · LIGA TERHENTI KARENA PERANG
      </HudTag>
      {match > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 290, transform: `translateX(-50%) translateY(${(1 - match) * 16}px)`, opacity: match, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "stretch", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 28px rgba(0,0,0,0.55)", fontFamily: MONO, fontWeight: 800, whiteSpace: "nowrap" }}>
            <div style={{ background: "#2c5fae", color: "#fff", fontSize: 36, padding: "10px 20px", letterSpacing: 2 }}>ITALIA</div>
            <div style={{ background: GOLD, color: "#1a1206", fontSize: 54, padding: "2px 24px", fontFamily: ANTON, letterSpacing: 2 }}>3 – 2</div>
            <div style={{ background: "#20242b", color: "#fff", fontSize: 36, padding: "10px 20px", letterSpacing: 2 }}>HUNGARIA</div>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: CREAM, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>11 MEI 1947 · TURIN</div>
        </div>
      )}
      <BigNumber o={ten * (1 - maz)} top={286} value="10 / 11" label="STARTER ITALIA DARI TORINO" color={CREAM} scale={bump(T.sepuluh)} />
      <Pin o={keeper * (1 - maz)} pj={pj} at={P(LINEUP_X[KEEPER], 4.0, 0)} color="#c8ccd2">
        KIPER: JUVENTUS
      </Pin>
      <NameCard o={maz} top={300} kicker="NO. 10 · KAPTEN" name={<>VALENTINO <span style={{ color: GOLD }}>MAZZOLA</span></>} sub={top > 0.5 ? "TOP SKOR SERIE A 1946–47" : " "} size={84} />
      <Pin o={maz} pj={pj} at={P(LINEUP_X[MAZZOLA], 3.75, 0)} size={44}>
        10
      </Pin>
    </>
  );
};

const MapLayer: React.FC<{ t: number; pj: PJ }> = ({ t, pj }) => {
  if (t < C[1] - 0.1 || t > C[2] + 0.2) return null;
  const route = win(t, C[1] + 0.15, T.benfica - 0.15, 0.3, 0.3);
  const benfica = win(t, T.benfica - 0.1, T.ferreira - 0.15, 0.3, 0.3);
  const ferreira = win(t, T.ferreira - 0.1, C[2], 0.3, 0.25);
  const turin = win(t, C[1] + 0.2, C[2], 0.3, 0.25);
  const lisbon = win(t, T.lisbon - 0.05, C[2], 0.3, 0.25);
  return (
    <>
      <HudTag o={route} top={300}>
        AWAL MEI 1949 · TURIN → LISBON
      </HudTag>
      <HudTag o={benfica} top={300} color="#c8323a">
        LAGA PERSAHABATAN vs BENFICA
      </HudTag>
      <NameCard o={ferreira} top={290} kicker="KAPTEN BENFICA · DIHORMATI" name={<>FRANCISCO <span style={{ color: GOLD }}>FERREIRA</span></>} size={80} />
      <Pin o={turin} pj={pj} at={[TURIN[0], 10.5, TURIN[1]]} color={GRANATA}>
        TURIN
      </Pin>
      <Pin o={lisbon} pj={pj} at={[LISBON[0], 10.5, LISBON[1]]} color="#c8323a">
        LISBON
      </Pin>
    </>
  );
};

const FogLayer: React.FC<{ t: number; pj: PJ }> = ({ t, pj }) => {
  if (t < C[2] - 0.1 || t > C[3] + 0.2) return null;
  const home = win(t, C[2] + 0.15, T.jarak - 0.15, 0.3, 0.3);
  const m40 = win(t, T.jarak - 0.05, T.dugaan - 0.15, 0.3, 0.3);
  const why = win(t, T.dugaan - 0.05, T.jam1703 - 0.15, 0.3, 0.3);
  const clock = win(t, T.jam1703 - 0.05, T.n31 - 0.2, 0.3, 0.3);
  const bas = win(t, T.basilika - 0.1, T.n31 - 0.2, 0.3, 0.3);
  const n31 = win(t, T.n31 - 0.05, C[3], 0.3, 0.25);
  const n18 = win(t, T.n18 - 0.05, C[3], 0.3, 0.25);
  return (
    <>
      <HudTag o={home} top={300} color="#9aa6b0">
        4 MEI 1949 · PERJALANAN PULANG
      </HudTag>
      <BigNumber o={m40} top={286} value="±40 M" label="JARAK PANDANG DALAM KABUT" color={CREAM} />
      {why > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 296, transform: `translateX(-50%) translateY(${(1 - why) * 16}px)`, opacity: why, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: "#cfd6dc" }}>DUGAAN PENYEBAB</div>
          <div style={{ display: "flex", gap: 14 }}>
            {["ANGIN SAMPING", "ALTIMETER MACET"].map((s) => (
              <div key={s} style={{ fontFamily: ANTON, fontSize: 52, color: CREAM, background: INK, border: "2px solid #9aa6b0", borderRadius: 10, padding: "6px 18px", whiteSpace: "nowrap" }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
      <BigNumber o={clock} top={286} value="17.03" label="SORE, 4 MEI 1949" color={CREAM} />
      <Pin o={bas} pj={pj} at={[SUMMIT.x, 172, SUMMIT.z]} color="#cfd6dc">
        BASILIKA SUPERGA
      </Pin>
      {n31 > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 280, transform: `translateX(-50%) translateY(${(1 - n31) * 16}px)`, opacity: n31, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: ANTON, fontSize: 200, lineHeight: 1, color: CREAM, textShadow: "0 8px 30px rgba(0,0,0,0.55)" }}>{count(t, T.n31, T.n31 + 0.9, 31)}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, letterSpacing: 2, color: CREAM, background: INK, padding: "6px 18px", borderRadius: 8, whiteSpace: "nowrap" }}>ORANG TEWAS · TAK ADA YANG SELAMAT</div>
          <div style={{ marginTop: 6, opacity: n18, fontFamily: ANTON, fontSize: 64, color: CREAM, background: GRANATA, padding: "4px 22px", borderRadius: 8 }}>TERMASUK 18 PEMAIN</div>
        </div>
      )}
    </>
  );
};

const PayoffLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < C[3] - 0.1 || t > C[5] + 0.2) return null;
  const champ = win(t, T.duaHari - 0.05, T.junior - 0.15, 0.3, 0.3);
  const jun = win(t, T.junior - 0.05, T.lawanJunior - 0.15, 0.3, 0.3);
  const opp = win(t, T.lawanJunior - 0.05, C[4] + 0.05, 0.3, 0.2);
  const crowd = win(t, T.ratusanRibu - 0.05, T.toma - 0.15, 0.25, 0.3);
  const toma = win(t, T.toma - 0.1, T.novo - 0.15, 0.3, 0.3);
  const novo = win(t, T.novo - 0.1, C[5], 0.3, 0.25);
  const impact = 1 + 0.08 * Math.max(0, 1 - Math.abs(t - T.ratusanRibu - 0.15) / 0.35);
  return (
    <>
      <HudTag o={champ} top={300} color={GOLD} dark>
        6 MEI 1949 · TORINO DINYATAKAN JUARA
      </HudTag>
      <BigNumber o={jun} top={286} value="4 LAGA" label="SISA MUSIM · DIMAINKAN TIM JUNIOR" color={GOLD} />
      <HudTag o={opp} top={300} color={CREAM}>
        LAWAN PUN MENURUNKAN TIM JUNIOR
      </HudTag>
      {crowd > 0.01 && (
        <div style={{ position: "absolute", left: "50%", top: 290, transform: `translateX(-50%) translateY(${(1 - crowd) * 16}px) scale(${impact})`, opacity: crowd, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: CREAM, textShadow: "0 8px 30px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>RATUSAN RIBU</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: CREAM, background: GRANATA, padding: "6px 18px", borderRadius: 8 }}>MENGANTAR KE PEMAKAMAN</div>
        </div>
      )}
      <NameCard o={toma} top={300} kicker="SELAMAT · CEDERA LUTUT" name={<>SAURO <span style={{ color: GOLD }}>TOMÀ</span></>} sub="TAK IKUT TERBANG" />
      <NameCard o={novo} top={300} kicker="PRESIDEN KLUB · ABSEN KARENA FLU" name={<>FERRUCCIO <span style={{ color: GOLD }}>NOVO</span></>} size={84} />
    </>
  );
};

const OutroLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < C[5] - 0.1) return null;
  const rows = [
    { at: T.limaGelar, n: "5", s: "GELAR BERUNTUN" },
    { at: T.delapanBelas, n: "18", s: "PEMAIN" },
    { at: T.bukit, n: "1", s: "BUKIT BERKABUT" },
  ];
  const all = 1 - seg(t, T.menurut - 0.35, T.menurut);
  const ask = win(t, T.menurut - 0.05, OUTRO_AT + 0.3, 0.3, 0.3);
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 256, display: "flex", flexDirection: "column", gap: 4, opacity: all * seg(t, T.limaGelar - 0.1, T.limaGelar + 0.2), background: "rgba(20,14,12,0.82)", borderLeft: `10px solid ${GRANATA}`, borderRadius: 10, padding: "10px 30px 14px 22px", boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}>
        {rows.map((r) => {
          const o = seg(t, r.at - 0.05, r.at + 0.3);
          return o <= 0.01 ? null : (
            <div key={r.s} style={{ display: "flex", alignItems: "baseline", gap: 18, ...fade(o) }}>
              <div style={{ fontFamily: ANTON, fontSize: 104, lineHeight: 1, color: GOLD, textShadow: "0 6px 24px rgba(0,0,0,0.7)", minWidth: 110 }}>{r.n}</div>
              <div style={{ fontFamily: ANTON, fontSize: 58, color: CREAM, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>{r.s}</div>
            </div>
          );
        })}
      </div>
      {ask > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 320, ...fade(ask), background: INK, borderLeft: `10px solid ${GRANATA}`, borderRadius: 10, padding: "16px 26px 18px", boxShadow: "0 12px 30px rgba(0,0,0,0.55)" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: GOLD }}>MENURUTMU</div>
          <div style={{ fontFamily: ANTON, fontSize: 76, lineHeight: 1.04, color: CREAM }}>
            TIM TERBAIK
            <br />
            SEPANJANG MASA?
          </div>
          <div style={{ fontFamily: PLAYFAIR, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#f3d6d6", marginTop: 8 }}>tulis di komentar · ikuti AUDIRA</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- karaoke captions (as EP11)
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
          background: "rgba(10,8,10,0.92)",
          borderRadius: 14,
          padding: "12px 26px 14px",
          borderLeft: `8px solid ${GRANATA}`,
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
                    color: active ? GOLD : done ? "#f6f1e8" : "rgba(246,241,232,0.78)",
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
    <AbsoluteFill style={{ background: SKY.horizon }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} camera={{ fov: 40, near: 0.3, far: 30000, position: cam.pos.toArray() as V3 }}>
        <Scene t={t} frame={Math.round(t * 60)} cam={cam} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, top: 0, width: DW, height: DH, transform: `scale(${k})`, transformOrigin: "0 0", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              t < C[0]
                ? `linear-gradient(180deg, rgba(14,10,14,${0.86 * (1 - seg(t, 5.2, 6.2)) + 0.6 * seg(t, 5.2, 6.2)}) 0%, rgba(14,10,14,0.5) 22%, rgba(14,10,14,0.1) 36%, rgba(14,10,14,0) 44%, rgba(14,10,14,0) 80%, rgba(14,10,14,0.45) 100%)`
                : "linear-gradient(180deg, rgba(12,9,11,0.72) 0%, rgba(12,9,11,0.45) 18%, rgba(12,9,11,0) 32%, rgba(12,9,11,0) 78%, rgba(12,9,11,0.5) 100%)",
          }}
        />
        <HookLayer t={t} />
        <PitchLayer t={t} pj={pj} />
        <MapLayer t={t} pj={pj} />
        <FogLayer t={t} pj={pj} />
        <PayoffLayer t={t} />
        <OutroLayer t={t} />
        <Captions t={t} />
      </div>
    </AbsoluteFill>
  );
};
