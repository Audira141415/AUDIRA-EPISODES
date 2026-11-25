// EP57 — Paraguay melawan Argentina, Brasil, Uruguay sekaligus (1864–1870). Style HISTORYMAP, Remotion + R3F.
// Beats come from audio/timeline.json (VO = master clock); HUD moments from the VO word anchors.
// Sensitive topic: people are generic toy tokens only. Losses are shown as tokens sinking into the
// table, never bodies, wounds or faces of real people. Casualty numbers are always ranges / estimates.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmFromConfig, framingFrom, lookAt, frame as frameTo, orbit, pullOut, hold, type FilmConfig, type BeatContent, type Beats } from "../templates";
import { ToyPerson } from "../core/polish/Person.tsx";
import { AssetModel } from "../core/assets/AssetModel.tsx";
import { Subtitle } from "../core/hud/Subtitle.tsx";
import { Voiceover } from "../core/film/Voiceover.tsx";
import { DISPLAY } from "../core/type/displayFonts.ts";
import { COLOR_PROFILES } from "../core/render/FinishingPresets.ts";
import { AudiraSignature } from "../brand/AudiraSignature";
import { AudiraOutro } from "../brand/AudiraOutro";
import { GILT, MAP_PAPER } from "../kits/historymap/lib/materials";
import words from "../../public/audio/vo-words.json";
import { C, P, PLACES, WarTable, MapArrow, DashedRoute, MapPin, win, easeOut, easeInOut } from "./ParaguayMap";

export const PARAGUAY_SECONDS = 93.91;

const BEATS: Beats = {
  hook: { start: 0, end: 13.37 },
  context: { start: 13.37, end: 29.52 },
  main: { start: 29.52, end: 43.7 },
  explanation: { start: 43.7, end: 58.77 },
  payoff: { start: 58.77, end: 77.75 },
  outro: { start: 77.75, end: 93.91 },
};

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const ARMY: V3 = P(-56.2, -25.4);
const COLUMN: V3 = P(-58.0, -23.4);
const FIELD: V3 = P(-57.0, -24.3);

// ───────────────────────────── 1 HOOK: one country, three arrows ─────────────────────────────
const ARROW_BR: [number, number][] = [[-49.8, -23.2], [-52.4, -24.0], [-54.5, -24.6]];
const ARROW_AR: [number, number][] = [[-62.5, -30.4], [-60.4, -28.4], [-58.6, -26.9]];
const ARROW_UY: [number, number][] = [[-56.0, -32.4], [-56.5, -29.6], [-56.9, -27.7]];

const People10: React.FC<{ t: number; f: number; sinkFrom: number }> = ({ t, f, sinkFrom }) => {
  const base = P(-58.4, -23.0);
  return (
    <group>
      {Array.from({ length: 10 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        // 6 tokens sink fully, the 7th halfway (an estimated range of 6–7 in 10)
        const order = [0, 6, 2, 8, 4, 5, 1, 3, 7, 9].indexOf(i);
        const depth = order < 6 ? 1 : order === 6 ? 0.5 : 0;
        const s = easeInOut(win(t, sinkFrom + order * 0.28, sinkFrom + order * 0.28 + 0.7)) * depth;
        return (
          <group key={i} position={add(base, [col * 0.17 - 0.34, -s * 0.34, row * 0.2 - 0.1])}>
            <ToyPerson f={f} seed={40 + i} outfit="casual" pose="stand" scale={0.34} heading={0.2} />
          </group>
        );
      })}
    </group>
  );
};

const HookScene: BeatContent = ({ t, frame, fps }) => {
  const f = (frame / fps) * 60;
  const p = (d: number) => 0.35 + 0.65 * easeOut(win(t, d, d + 2.6));
  const close = easeOut(win(t, 3.0, 3.8));
  return (
    <WarTable glow={0.4 + 0.3 * Math.sin(t * 2.2) * 0.5 + close * 0.3}>
      <MapArrow path={ARROW_BR} p={p(0.0)} color={C.arrow} glow={close * 0.6} />
      <MapArrow path={ARROW_AR} p={p(0.25)} color={C.arrow} glow={close * 0.6} />
      <MapArrow path={ARROW_UY} p={p(0.5)} color={C.arrow} glow={close * 0.6} />
      <People10 t={t} f={f} sinkFrom={5.8} />
    </WarTable>
  );
};

// ───────────────────────────── 2 CONTEXT: López, then the alliance forms ─────────────────────────────
const ContextScene: BeatContent = ({ t, frame, fps }) => {
  const f = (frame / fps) * 60;
  const br = easeOut(win(t, 21.9, 22.9));
  const ar = easeOut(win(t, 25.5, 26.4));
  const uy = easeOut(win(t, 26.6, 27.4));
  const lopez = easeOut(win(t, 19.6, 20.4));
  const ally = easeOut(win(t, 28.7, 29.3));
  return (
    <WarTable brazil={br} argentina={ar} uruguay={uy} glow={0.35 + ally * 0.3}>
      {/* López as a generic figurine on the capital (name card in the HUD) */}
      <group position={add(PLACES.asuncion, [0.22, (1 - lopez) * 0.6, 0.12])} scale={Math.max(0.001, lopez)}>
        <ToyPerson f={f} seed={7} outfit="formal" pose="point" scale={0.62} heading={0.9} />
      </group>
      {/* alliance ring of crimson pins around Paraguay */}
      <MapPin at={PLACES.brazilMid} k={br} flare={win(t, 22.0, 23.2)} color="#c0392b" />
      <MapPin at={PLACES.argentinaMid} k={ar} flare={win(t, 25.6, 26.8)} color="#c0392b" />
      <MapPin at={PLACES.uruguayMid} k={uy} flare={win(t, 26.7, 27.9)} color="#c0392b" />
      <MapArrow path={ARROW_BR} p={easeOut(win(t, 22.2, 23.6))} />
      <MapArrow path={ARROW_AR} p={easeOut(win(t, 25.8, 27.0))} />
      <MapArrow path={ARROW_UY} p={easeOut(win(t, 26.9, 28.0))} />
    </WarTable>
  );
};

// ───────────────────────────── 3 MAIN: 60,000 lost, 60,000 more conscripted ─────────────────────────────
const Army: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <group position={ARMY}>
    {/* first army: uniformed tokens sink into the table (lost, no bodies shown) */}
    {Array.from({ length: 24 }, (_, i) => {
      const c = i % 6;
      const r = Math.floor(i / 6);
      const s = easeInOut(win(t, 34.6 + ((i * 7) % 24) * 0.05, 35.4 + ((i * 7) % 24) * 0.05));
      if (s >= 0.999) return null;
      return (
        <group key={`a${i}`} position={[c * 0.13 - 0.33, -s * 0.24, r * 0.13 - 0.2]}>
          <ToyPerson f={f} seed={100 + i} outfit="uniform" look={{ top: "#2d4a7a", bottom: "#2d4a7a" }} pose="stand" scale={0.22} heading={-0.4} />
        </group>
      );
    })}
    {/* conscripts: smaller and mixed, no uniform, marching in */}
    {Array.from({ length: 24 }, (_, i) => {
      const c = i % 6;
      const r = Math.floor(i / 6);
      const k = easeOut(win(t, 37.2 + i * 0.06, 37.9 + i * 0.06));
      if (k <= 0.001) return null;
      const child = i % 3 === 1;
      return (
        <group key={`b${i}`} position={[c * 0.13 - 0.33, (k - 1) * 0.24, r * 0.13 - 0.2 + (1 - k) * 0.3]}>
          <ToyPerson
            f={f}
            seed={300 + i}
            outfit="casual"
            look={{ height: child ? 0.66 : 0.95 }}
            pose={t > 40.6 && t < 43.2 ? "walk" : "stand"}
            scale={0.22}
            heading={-0.4}
          />
        </group>
      );
    })}
  </group>
);

const MainScene: BeatContent = ({ t, frame, fps }) => {
  const f = (frame / fps) * 60;
  return (
    <WarTable glow={0.2} labels={0.6}>
      <Army t={t} f={f} />
      <group position={add(ARMY, [-0.15, 0, -0.42])}>
        <AssetModel id="soldiers-tent-4bd5b9" assetType="building" size={0.34} ground tint="#C9B48A" position={[-0.3, 0, 0]} rotation={[0, 0.5, 0]} />
        <AssetModel id="soldiers-tent-4bd5b9" assetType="building" size={0.3} ground tint="#BBA67C" position={[0.18, 0, -0.08]} rotation={[0, -0.3, 0]} />
        <AssetModel id="deck-cannon-17849e" assetType="prop" size={0.22} ground position={[0.55, 0, 0.12]} rotation={[0, -1.1, 0]} />
        <AssetModel id="cannonball-f87cdc" assetType="prop" size={0.04} ground position={[0.68, 0, 0.26]} />
        <AssetModel id="cannonball-f87cdc" assetType="prop" size={0.04} ground position={[0.72, 0, 0.21]} />
      </group>
      {/* Humaitá fortress pin on the river bend */}
      <MapPin at={PLACES.humaita} k={1} />
    </WarTable>
  );
};

// ───────────────────────────── 4 EXPLANATION: guerrilla to Cerro Corá ─────────────────────────────
const ROUTE: [number, number][] = [[-58.5, -27.07], [-57.8, -26.0], [-57.3, -25.0], [-56.8, -24.0], [-56.4, -23.2], [-56.0, -22.6]];
const PALMS: [number, number, number, string][] = [
  [-56.5, -22.2, 0.3, "palm-tree-a307da"], [-55.6, -22.5, 0.26, "chilean-palm-45fef5"], [-56.3, -23.0, 0.28, "chilean-palm-45fef5"],
  [-55.3, -22.9, 0.3, "palm-tree-a307da"], [-56.9, -22.7, 0.24, "chilean-palm-45fef5"], [-55.9, -21.9, 0.27, "palm-tree-a307da"],
  [-55.0, -23.4, 0.25, "chilean-palm-45fef5"], [-56.7, -23.6, 0.26, "palm-tree-a307da"], [-55.5, -23.8, 0.28, "chilean-palm-45fef5"],
];
const CAMPS: [number, number][] = [[-57.5, -25.5], [-56.9, -24.2], [-56.3, -23.1]];

const ExplanationScene: BeatContent = ({ t }) => {
  const route = easeInOut(win(t, 46.7, 50.9));
  const lost = easeOut(win(t, 44.0, 44.8));
  const fall = win(t, 50.9, 52.2);
  const toll = easeInOut(win(t, 54.6, 56.5));
  return (
    <WarTable glow={0.15} labels={0.7} dim={toll * 0.7}>
      {/* Humaitá: battle lost on open ground (the fortress pin turns red and tips) */}
      <group position={PLACES.humaita} rotation={[0, 0, -lost * 0.7]}>
        <MapPin at={[0, 0, 0]} k={1} color={lost > 0.5 ? "#c0392b" : C.gilt} />
      </group>
      <DashedRoute path={ROUTE} p={route} />
      {CAMPS.map(([lon, lat], i) => {
        const k = easeOut(win(t, 47.4 + i * 1.1, 47.9 + i * 1.1)) * (1 - toll * 0.6);
        return k > 0.01 ? (
          <group key={i} position={P(lon, lat, 0.03)} scale={Math.max(0.001, k)}>
            <AssetModel id="camp-tent-3c5c89" assetType="building" size={0.2} ground tint="#B9A57D" />
          </group>
        ) : null;
      })}
      {PALMS.map(([lon, lat, s, id], i) => (
        <AssetModel key={i} id={id} assetType={id.startsWith("palm") ? undefined : "prop"} size={s} ground position={P(lon, lat, 0.045)} rotation={[0, i * 1.3, 0]} tint={toll > 0.5 ? "#4d5a3a" : undefined} />
      ))}
      <MapPin at={PLACES.cerroCora} k={easeOut(win(t, 49.4, 50.9))} flare={fall} color="#e8d9a8" />
    </WarTable>
  );
};

// ───────────────────────────── 5 PAYOFF: the population column collapses ─────────────────────────────
const H = (pop: number) => (pop / 450000) * 1.5;

const PayoffScene: BeatContent = ({ t, frame, fps }) => {
  const f = (frame / fps) * 60;
  const rise = easeOut(win(t, 59.2, 61.6));
  const fallK = easeInOut(win(t, 64.6, 66.63));
  const top = H(435000) * rise * (1 - fallK) + H(150000) * fallK;
  const band = (1 - fallK) * rise; // the 420–450 k uncertainty band
  const men = easeOut(win(t, 68.7, 69.5));
  const people = easeOut(win(t, 70.8, 71.6));
  const farm = easeOut(win(t, 73.9, 75.4));
  const impact = win(t, 66.6, 67.6);
  return (
    <WarTable glow={0.1} labels={0.5}>
      {/* population column, gilt paper */}
      <group position={COLUMN}>
        <mesh position={[0, Math.max(0.001, top) / 2, 0]} scale={[1, Math.max(0.001, top), 1]} castShadow receiveShadow>
          <boxGeometry args={[0.36, 1, 0.36]} />
          <meshPhysicalMaterial color={C.paraguay} {...MAP_PAPER} emissive={C.paraguay} emissiveIntensity={0.12 + (1 - impact) * impact * 1.6} />
        </mesh>
        {/* estimate band: 420 k → 450 k, translucent */}
        {band > 0.02 ? (
          <mesh position={[0, H(420000) * rise + (H(450000) - H(420000)) / 2, 0]}>
            <boxGeometry args={[0.38, H(450000) - H(420000), 0.38]} />
            <meshPhysicalMaterial color="#F1D9A0" transparent opacity={0.35 * band} roughness={0.3} />
          </mesh>
        ) : null}
        {/* ghost outline of the pre-war height after the collapse */}
        {fallK * (1 - people) > 0.05 ? (
          <mesh position={[0, H(435000) / 2, 0]}>
            <boxGeometry args={[0.37, H(435000), 0.37]} />
            <meshBasicMaterial color="#F1D9A0" wireframe transparent opacity={0.22 * fallK * (1 - people)} />
          </mesh>
        ) : null}
        {/* 28 k adult men: thin dark column beside it */}
        {men > 0.01 ? (
          <mesh position={[0.34, (H(28000) * men) / 2, 0]} scale={[1, Math.max(0.001, men), 1]} castShadow>
            <boxGeometry args={[0.16, H(28000), 0.16]} />
            <meshPhysicalMaterial color="#5b7fa6" {...GILT} metalness={0.3} />
          </mesh>
        ) : null}
        {/* shock ring at the impact */}
        {impact > 0.01 && impact < 0.99 ? (
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2 + impact * 0.8, 0.24 + impact * 0.8, 48]} />
            <meshBasicMaterial color="#FFE3A0" transparent opacity={(1 - impact) * 0.85} depthWrite={false} toneMapped={false} />
          </mesh>
        ) : null}
      </group>

      {/* 4 women : 1 man, then they farm and rebuild */}
      <group position={FIELD}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[i * 0.15 - 0.3, (people - 1) * 0.3, 0.05]} scale={Math.max(0.001, people)}>
            <ToyPerson
              f={f}
              seed={500 + i}
              outfit="traditional"
              look={{ hairStyle: 1 }}
              pose={farm > 0.3 ? (i % 2 ? "carry" : "crouch") : "stand"}
              scale={0.3}
              heading={0.3}
            />
          </group>
        ))}
        <group position={[0.38, (people - 1) * 0.3, 0.05]} scale={Math.max(0.001, people)}>
          <ToyPerson f={f} seed={520} outfit="casual" look={{ hairStyle: 0 }} pose="stand" scale={0.3} heading={-0.2} />
        </group>
        {farm > 0.01 ? (
          <group scale={Math.max(0.001, farm)}>
            <AssetModel id="wheat-crop-7e08e6" assetType="prop" size={0.22} ground position={[-0.42, 0, 0.32]} />
            <AssetModel id="corn-crop-b71f2f" assetType="prop" size={0.24} ground position={[-0.12, 0, 0.36]} />
            <AssetModel id="wheat-crop-7e08e6" assetType="prop" size={0.2} ground position={[0.16, 0, 0.34]} />
            <AssetModel id="basket-of-produce-7420cf" assetType="prop" size={0.08} ground position={[0.02, 0, 0.18]} />
            <AssetModel id="adobe-colonial-farmhouse-cf13d8" assetType="building" size={0.42} ground position={[0.5, 0, -0.32]} rotation={[0, -0.5, 0]} />
          </group>
        ) : null}
      </group>
    </WarTable>
  );
};

// ───────────────────────────── 6 OUTRO: ~30 % of claimed land lost ─────────────────────────────
const OutroScene: BeatContent = ({ t }) => {
  const wedges = win(t, 79.3, 81.4);
  const occ = easeOut(win(t, 81.5, 82.4)) * (1 - easeInOut(win(t, 83.3, 84.2)));
  return (
    <WarTable wedges={wedges} glow={0.25}>
      <MapPin at={add(PLACES.asuncion, [0.25, 0, 0.05])} k={occ} color="#c0392b" />
      <MapPin at={P(-56.8, -26.2)} k={occ} color="#c0392b" />
      <MapPin at={P(-57.0, -22.9)} k={occ} color="#c0392b" />
    </WarTable>
  );
};

// ───────────────────────────── HUD ─────────────────────────────
const SIDE = 64;
const show = (t: number, a: number, b: number) => easeOut(win(t, a, a + 0.35)) * (1 - win(t, b - 0.3, b));
const PLATE: React.CSSProperties = { background: "rgba(12,16,22,0.86)", padding: "18px 26px", borderLeft: `8px solid ${C.arrow}` };

const Card: React.FC<{ t: number; a: number; b: number; top: number; accent?: string; children: React.ReactNode }> = ({ t, a, b, top, accent = C.arrow, children }) => {
  const o = show(t, a, b);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: SIDE, right: SIDE, top, opacity: o, transform: `translateY(${(1 - o) * 26}px) scale(${0.96 + 0.04 * o})`, transformOrigin: "left top", ...PLATE, borderLeft: `8px solid ${accent}` }}>
      {children}
    </div>
  );
};
const Big: React.FC<{ c?: string; s?: number; children: React.ReactNode }> = ({ c = "#EEF1F5", s = 104, children }) => (
  <div style={{ fontFamily: DISPLAY.condensed, fontSize: s, lineHeight: 1.0, color: c }}>{children}</div>
);
const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: DISPLAY.body, fontSize: 40, fontWeight: 700, lineHeight: 1.25, marginTop: 8, color: "rgba(238,241,245,0.92)" }}>{children}</div>
);

const YEARS: [number, number, string][] = [
  [0.2, 13.4, "1864–1870"],
  [13.5, 24.15, "1864"],
  [24.15, 31.85, "1865"],
  [31.85, 52.85, "1867"],
  [52.85, 77.8, "1870"],
  [83.2, 87.15, "1876"],
  [87.15, 90.7, "1943"],
];

const Hud: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  const year = YEARS.find(([a, b]) => t >= a && t < b);
  const top = 236;
  const gold = C.gilt;
  return (
    <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none", color: "#EEF1F5" }}>
      {/* header rail: kicker + year chip */}
      <div style={{ position: "absolute", left: SIDE, right: SIDE, top, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: show(t, 0, 90.8) }}>
        <div style={{ fontFamily: DISPLAY.grotesk, fontSize: 36, fontWeight: 700, letterSpacing: 3, color: "#FF5A66", background: "rgba(8,10,14,0.8)", padding: "6px 14px" }}>● PERANG ALIANSI TIGA</div>
        {year ? (
          <div key={year[2]} style={{ fontFamily: DISPLAY.condensed, fontSize: 64, color: gold, background: "rgba(12,16,22,0.86)", padding: "0 18px", border: `2px solid ${gold}`, opacity: easeOut(win(t, year[0], year[0] + 0.3)) }}>
            {year[2]}
          </div>
        ) : null}
      </div>

      {/* 1 HOOK */}
      <Card t={t} a={0} b={4.7} top={340}>
        <Big s={150} c="#FFFFFF">1 LAWAN 3</Big>
        <Sub>Paraguay vs Brasil, Argentina, Uruguay</Sub>
      </Card>
      <Card t={t} a={4.9} b={9.5} top={340}>
        <Big s={120} c="#FF6B6B">6–7 DARI 10</Big>
        <Sub>penduduk Paraguay diperkirakan tewas</Sub>
      </Card>
      <Card t={t} a={9.6} b={13.3} top={340} accent={gold}>
        <Big s={84}>PERANG ANTARNEGARA PALING MEMATIKAN</Big>
        <Sub>dalam sejarah Amerika Latin</Sub>
      </Card>

      {/* 2 CONTEXT */}
      <Card t={t} a={13.6} b={19.6} top={340} accent={gold}>
        <Big s={96} c={gold}>PARAGUAY, 1864</Big>
        <Sub>negara kecil di jantung Amerika Selatan</Sub>
      </Card>
      <Card t={t} a={19.9} b={24.0} top={340} accent={gold}>
        <Big s={80}>FRANCISCO SOLANO LÓPEZ</Big>
        <Sub>Presiden Paraguay (figur ilustrasi)</Sub>
      </Card>
      <Card t={t} a={24.1} b={28.6} top={340}>
        <Big s={80}>BRASIL → ARGENTINA → URUGUAY</Big>
        <Sub>berselisih sejak Perang Uruguay 1864</Sub>
      </Card>
      <Card t={t} a={28.8} b={31.5} top={340}>
        <Big s={132} c="#FF6B6B">ALIANSI TIGA</Big>
        <Sub>1865, tiga negara melawan Paraguay</Sub>
      </Card>

      {/* 3 MAIN */}
      <Card t={t} a={31.6} b={34.4} top={340} accent={gold}>
        <Big s={110}>6 TAHUN</Big>
        <Sub>1864–1870</Sub>
      </Card>
      <Card t={t} a={34.5} b={37.1} top={340}>
        <Big s={130} c="#FF6B6B">−60.000</Big>
        <Sub>prajurit hilang sampai 1867</Sub>
      </Card>
      <Card t={t} a={37.2} b={40.8} top={340} accent={gold}>
        <Big s={130} c={gold}>+60.000</Big>
        <Sub>diwajibkan, termasuk budak dan anak-anak</Sub>
      </Card>
      <Card t={t} a={40.9} b={43.6} top={340}>
        <Big s={92}>TANPA SEPATU, TANPA SERAGAM</Big>
      </Card>

      {/* 4 EXPLANATION */}
      <Card t={t} a={44.0} b={47.7} top={340}>
        <Big s={96}>KALAH DI MEDAN TERBUKA</Big>
        <Sub>lalu bertahan lewat gerilya</Sub>
      </Card>
      <Card t={t} a={47.9} b={51.7} top={340} accent={gold}>
        <Big s={130} c={gold}>14 BULAN</Big>
        <Sub>gerilya di hutan timur laut</Sub>
      </Card>
      <Card t={t} a={51.8} b={54.5} top={340} accent={gold}>
        <Big s={92}>CERRO CORÁ</Big>
        <Sub>1 Maret 1870, López tewas</Sub>
      </Card>
      <Card t={t} a={54.6} b={58.7} top={340}>
        <Sub>Pembunuh terbesar:</Sub>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          {[["PENYAKIT", 56.0], ["KELAPARAN", 56.9], ["KELELAHAN", 57.95]].map(([w, a]) => (
            <div key={w as string} style={{ fontFamily: DISPLAY.condensed, fontSize: 84, lineHeight: 1.0, color: "#FF6B6B", opacity: easeOut(win(t, a as number, (a as number) + 0.3)) }}>
              {w}
            </div>
          ))}
        </div>
      </Card>

      {/* 5 PAYOFF */}
      <Card t={t} a={59.4} b={64.4} top={340} accent={gold}>
        <Sub>Sebelum perang (perkiraan)</Sub>
        <Big s={120} c={gold}>420–450 RIBU</Big>
      </Card>
      <Card t={t} a={64.5} b={68.6} top={340}>
        <Sub>Sesudah perang (perkiraan)</Sub>
        <Big s={140} c="#FF6B6B">±150 RIBU</Big>
      </Card>
      <Card t={t} a={68.7} b={70.8} top={340}>
        <Big s={120} c="#8fb4dd">±28 RIBU</Big>
        <Sub>laki-laki dewasa tersisa</Sub>
      </Card>
      <Card t={t} a={70.9} b={73.8} top={340} accent={gold}>
        <Big s={120} c={gold}>± 4 : 1</Big>
        <Sub>perempuan dibanding laki-laki</Sub>
      </Card>
      <Card t={t} a={73.9} b={77.7} top={340} accent={gold}>
        <Big s={76}>BERTANI · MENENUN · MEMBANGUN ULANG</Big>
      </Card>

      {/* 6 OUTRO */}
      <Card t={t} a={79.2} b={82.9} top={340}>
        <Big s={130} c="#FF6B6B">±30%</Big>
        <Sub>wilayah yang diklaim Paraguay lepas</Sub>
      </Card>
      <Card t={t} a={83.0} b={86.3} top={340}>
        <Big s={88}>DIDUDUKI SAMPAI 1876</Big>
        <Sub>oleh Brasil dan Argentina</Sub>
      </Card>
      <Card t={t} a={86.4} b={88.6} top={340} accent={gold}>
        <Big s={84}>UTANG KE BRASIL</Big>
        <Sub>baru dihapus tahun 1943</Sub>
      </Card>
      <Card t={t} a={88.7} b={90.85} top={340} accent={gold}>
        <Big s={96} c={gold}>IKUTI AUDIRA</Big>
        <Sub>untuk kisah negara berikutnya</Sub>
      </Card>

    </div>
  );
};

// ───────────────────────────── film ─────────────────────────────
const START = framingFrom([-0.2, 7.45, 4.35], [-0.2, 0, 0.05], 34);

const config: FilmConfig = {
  beats: BEATS,
  startFraming: START,
  shots: {
    hook: [
      { at: 0, move: hold() },
      { at: 6, move: frameTo({ dist: 7.9, az: 6 }) },
      { at: 11.6, move: frameTo({ dist: 7.4, az: 9, el: 62 }) },
    ],
    context: [
      { at: 13.37, move: lookAt([-0.35, 0, -0.55], { az: -12, el: 72, dist: 4.6 }) },
      { at: 19.5, move: frameTo({ dist: 4.0, az: -4 }) },
      { at: 22.8, move: lookAt([-0.15, 0, 0.35], { az: 4, el: 66, dist: 7.4 }) },
      { at: 27.2, move: frameTo({ dist: 7.0, az: 10 }) },
    ],
    main: [
      { at: 32.2, move: lookAt(add(ARMY, [0, 0.08, 0]), { az: 28, el: 20, dist: 2.3, fov: 32 }) },
      { at: 36.6, move: orbit(-22) },
      { at: 40.5, move: frameTo({ dist: 1.95, el: 16 }) },
      { at: 42.8, move: orbit(-8) },
    ],
    explanation: [
      { at: 45.6, move: lookAt([0.05, 0.05, -0.7], { az: -35, el: 42, dist: 3.2, fov: 34 }) },
      { at: 50.6, move: lookAt(add(PLACES.cerroCora, [0, 0.1, 0]), { az: -20, el: 34, dist: 2.0 }) },
      { at: 54.4, move: frameTo({ dist: 2.4, az: -5 }) },
      { at: 56.8, move: pullOut(1.15) },
    ],
    payoff: [
      { at: 61.4, move: lookAt(add(COLUMN, [0.1, 0.65, 0]), { az: 55, el: 14, dist: 3.8, fov: 34 }) },
      { at: 66.6, move: frameTo({ az: 40, el: 18, dist: 3.2, target: add(COLUMN, [0.15, 0.35, 0]) }) },
      { at: 71.2, move: lookAt(add(FIELD, [0, 0.16, 0.05]), { az: 15, el: 24, dist: 2.4 }) },
      { at: 75.6, move: orbit(14) },
    ],
    outro: [
      { at: 80.4, move: lookAt([-0.3, 0, -0.1], { az: -8, el: 64, dist: 6.6, fov: 34 }) },
      { at: 84, move: frameTo({ dist: 7.4, az: 0 }) },
      { at: 93.6, move: frameTo({ dist: 8.6, el: 68 }) },
    ],
  },
  scenes: { hook: HookScene, context: ContextScene, main: MainScene, explanation: ExplanationScene, payoff: PayoffScene, outro: OutroScene },
  background: C.oceanVoid,
  hdri: "warmStudio",
  envIntensity: 0.55,
  exposure: 1,
  profile: COLOR_PROFILES.DOCUMENTARY_WARM,
  ao: false,
  lens: { aperture: 2.8, maxBlur: 0.002 },
  overlay: (_s, _b, bp) => <Hud t={bp.t} frame={bp.frame} fps={bp.fps} />,
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Subtitle words={words} frame={frame} fps={fps} maxWords={5} size={52} position={1300} baseColor="#D7DCE4" />;
};

export const ParaguayFilm: React.FC = () => (
  <AbsoluteFill>
    <FilmFromConfig config={config} />
    <Captions />
    <Voiceover src="audio/vo.wav" offset={0} />
    <AudiraOutro seconds={3} />
    <AudiraSignature seed="sejarah-negara-ep57" />
  </AbsoluteFill>
);

/** Cover / hook framing (frame 0 = thumbnail). */
export const PARAGUAY_START = START;
