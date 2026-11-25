// EP07 Ibnu Battuta, 29 tahun di jalan (PAPERWORLD) — the film on the locked voice (timeline.json).
// One continuous paper world: the Sumutra coast diorama sits on the northern tip of a cut-paper Sumatra,
// and the same blue paper sea is the ocean of a cut-paper map of the Old World. Every timed event is
// anchored to a spoken word (time.ts). People are faceless paper-cone figures; no prophet is depicted.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Vector3 } from "three";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Stage, mixLight, type Light } from "../../kits/paperworld/render/Stage.tsx";
import { popEase } from "../../kits/paperworld/motion/easing.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { BANK_Y, Backdrop, ConeDoll, DAWN, GATE, HangingTag, Junk, PAL, RouteThread, Sea, Town } from "./world.tsx";
import { AudiraPlaque, Delhi, MakkahTown, MapLands, MapPatina, routeHeading, routePoint, MapRoute, MapTag, PLACES, Storm, Tangier } from "./map.tsx";
import { Boats, Guest, Mosque, Pavilion, SultanWalk, Spears, SunTokens } from "./town.tsx";
import { shotAt } from "./camera.ts";
import { routeProgress } from "./route.ts";
import { TitleCard } from "./title.tsx";
import { OUTRO_AT, TIMELINE, TOTAL, W, WE, ramp, win } from "./time.ts";

export const BATTUTA_TOTAL = TOTAL;

const DAY: Light = {
  dir: [0.35, 0.85, 0.35], key: "#fff4e4", keyI: 2.4, fill: "#e3ebf6", fillI: 0.6, sky: "#fdf6ea", ground: "#b89a74",
  hemiI: 1.2, bg: PAL.sky, exposure: 1.0, shadowSize: 46, shadowSoft: 4,
};
const ASR: Light = {
  dir: [-0.75, 0.38, 0.3], key: "#ffc890", keyI: 2.3, fill: "#d9dff0", fillI: 0.5, sky: "#fbe9cf", ground: "#a88a66",
  hemiI: 1.0, bg: PAL.sky, exposure: 1.0, shadowSize: 46, shadowSoft: 4,
};

// the map: a warm raking key low from the west (+x), weak fill — long shadows off every card edge
const MAP: Light = {
  dir: [0.85, 0.3, 0.35], key: "#ffd39e", keyI: 3.0, fill: "#cdd6ea", fillI: 0.32, sky: "#fbe6c6", ground: "#8a6a4a",
  hemiI: 0.78, bg: PAL.sky, exposure: 1.0, shadowSize: 46, shadowSoft: 5,
};

const lightAt = (t: number, dist: number, onMap = 0): Light => {
  let L = mixLight(DAWN, DAY, ramp(t, W("l02", "tahun"), W("l02", "tangier")));
  L = mixLight(L, DAWN, ramp(t, W("l05", "lalu"), W("l06", "warga")));
  L = mixLight(L, ASR, ramp(t, W("l09", "lalu"), WE("l09", "asar")));
  L = mixLight(L, DAY, ramp(t, W("l10", "menurut"), W("l10", "sumatra")));
  L = mixLight(L, MAP, onMap);
  return { ...L, shadowSize: Math.max(46, dist * 0.75) };
};

// ── timed state (all from word times) ─────────────────────────────────────────────────────────────
const Chip: React.FC<{ text: string; k: number }> = ({ text, k }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: 250, display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <div
        style={{
          background: "#2e2019", border: "3px solid #c9a35a", borderRadius: 12, padding: "16px 34px",
          color: "#f6ecd8", fontSize: 54, fontWeight: 600, letterSpacing: 3, maxWidth: 940, textAlign: "center",
          opacity: k > 0.02 ? 1 : 0, transform: `translateY(${(1 - k) * -14}px) scale(${0.96 + 0.04 * k})`,
          boxShadow: "0 14px 32px rgba(40,25,10,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );

// ── captions: karaoke per word on an opaque dark plate ───────────────────────────────────────────
type Wd = { w: string; s: number; e: number };
type Chunk = { words: Wd[]; a: number; b: number };
const JOIN = new Set(["dari", "lalu", "dan", "yang", "ke", "di", "tapi", "lewat", "dengan", "untuk", "supaya", "sampai", "pada", "setelah"]);
const NUM = new Set(["satu", "dua", "tiga", "enam", "tujuh", "sembilan", "belas", "puluh", "ratus", "ribu", "seratus", "tahun", "bulan", "hari"]);
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
const chars = (g: Wd[]) => g.map((x) => x.w).join(" ").length;
const splitLong = (g: Wd[]): Wd[][] => {
  if (g.length <= 7 && chars(g) <= 40) return [g];
  let best = -1, bestScore = Infinity;
  for (let i = 2; i <= g.length - 2; i++) {
    if (!JOIN.has(clean(g[i].w))) continue;
    const sc = Math.abs(i - g.length / 2);
    if (sc < bestScore) { bestScore = sc; best = i; }
  }
  if (best < 0) {
    for (let i = 2; i <= g.length - 2; i++) {
      if (NUM.has(clean(g[i - 1].w)) && NUM.has(clean(g[i].w))) continue;
      const sc = Math.abs(i - g.length / 2);
      if (sc < bestScore) { bestScore = sc; best = i; }
    }
    if (best < 0) best = Math.ceil(g.length / 2);
  }
  return [...splitLong(g.slice(0, best)), ...splitLong(g.slice(best))];
};
export const CAPTION_CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const line of TIMELINE.lines) {
    const phrases: Wd[][] = [];
    let cur: Wd[] = [];
    for (const w of line.words) {
      cur.push(w);
      if (/[.,?!:]$/.test(w.w)) { phrases.push(cur); cur = []; }
    }
    if (cur.length) phrases.push(cur);
    for (let i = 0; i < phrases.length; i++) {
      if (phrases[i].length !== 1 || phrases.length === 1) continue;
      if (i + 1 < phrases.length && phrases[i].length + phrases[i + 1].length <= 7) { phrases[i + 1] = [...phrases[i], ...phrases[i + 1]]; phrases.splice(i, 1); i = -1; }
      else if (i > 0) { phrases[i - 1] = [...phrases[i - 1], ...phrases[i]]; phrases.splice(i, 1); i = -1; }
    }
    const groups = phrases.flatMap(splitLong);
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      out.push({ words: g, a: g[0].s - 0.12, b: next ? next[0].s - 0.12 : line.end + 0.3 });
    });
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const c = CAPTION_CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = Math.min(1, (t - c.a) / 0.1);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <div
        style={{
          background: "rgba(30,21,16,0.94)", borderRadius: 18, padding: "16px 30px", maxWidth: 900, textAlign: "center", textWrap: "balance",
          boxShadow: "0 12px 34px rgba(0,0,0,0.4)", border: "2px solid rgba(201,163,90,0.55)",
          transform: `translateY(${(1 - k) * 6}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const active = t >= w.s - 0.04 && t < w.e + 0.06;
          const said = t >= w.e;
          const bounce = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span key={i} style={{
              display: "inline-block", fontSize: 58, fontWeight: 600, lineHeight: 1.22, margin: "0 0.2em",
              color: active ? "#ffc35c" : said ? "#f6ecd8" : "rgba(246,236,216,0.68)", transform: `scale(${bounce})`,
            }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── the film ─────────────────────────────────────────────────────────────────────────────────────
export const BattutaFilm: React.FC<{ cover?: boolean }> = ({ cover = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const rp = routeProgress(t);
  const markerP = routePoint(rp);
  const markerYaw = routeHeading(rp);
  const shot = shotAt(t);
  const cam = new Vector3(...shot.pos);
  const nearCoast = 1 - ramp(cam.distanceTo(new Vector3(0, 10, -10)), 70, 115);
  const light = lightAt(t, shot.dist, 1 - nearCoast);
  const T = PLACES.tangier;

  // traveller leaving Tangier, alone (register #4)
  const walkU = ramp(t, W("l02", "meninggalkan"), WE("l03", "kemudian"));
  const walker: [number, number, number] = [T[0] - 1.5 - walkU * 26, 1.2, T[2] - walkU * 6];

  // payoff tag: SUMUTRA flips to SUMATRA on "Sumatra"
  const flip = ramp(t, W("l10", "sumatra") - 0.25, W("l10", "sumatra") + 0.35);
  const islandTag: [number, number, number] = [-12, 2, -25];

  const tag = (a: number, b: number) => win(t, a, b, 0.45);
  const marker = win(t, W("l05", "ia") - 0.1, W("l05", "lalu") - 0.3, 0.3);

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.sky }}>
      <Stage3D
        background={PAL.sky}
        overlay={() => (
          <>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - nearCoast, background: "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(0,0,0,0) 55%, rgba(58,32,12,0.42) 100%)" }} />
            <TitleCard opacity={1 - ramp(t, 2.7, 3.3)} />
            <Chip text="± 16 BULAN" k={win(t, W("l03", "haji"), W("l03", "ia") - 0.2, 0.35)} />
            <Chip text="± 29 TAHUN DI JALAN" k={win(t, W("l03", "ia"), W("l04", "timur") - 0.3, 0.35)} />
            <Chip text="TIGA HARI" k={win(t, W("l07", "tiga"), WE("l07", "hilang") + 0.3, 0.35)} />
            <Chip text="SAMPAI ASAR" k={win(t, W("l09", "sampai"), WE("l09", "asar") + 0.6, 0.35)} />
            <Chip text="± 117.000 KM · PERKIRAAN" k={win(t, W("l11", "diperkirakan"), WE("l11", "pulang") + 0.2, 0.35)} />
            <Captions t={t} />
          </>
        )}
      >
        <Stage shot={shot} light={light} frame={frame} center={shot.target}>
          <Sea s={t} />
          <MapLands />
          <MapPatina opacity={1 - Math.max(0, Math.min(1, nearCoast * 1.5))} />
          <MapRoute progress={rp} back={ramp(t, W("l11", "seluruh"), WE("l11", "pulang"))} />
          <RouteThread />
          <Junk s={t} />
          <Town s={t} />
          <Backdrop s={t} up={popEase(Math.max(0, Math.min(1, nearCoast)))} />
          {/* the gate sign folds down while the camera looks into the town */}
          <group position={[GATE[0], BANK_Y + 5.6, GATE[2] + 0.4]} scale={Math.max(0.0001, 1 - win(t, WE("l07", "kayu"), W("l10", "kota"), 0.6))}
            visible={1 - win(t, WE("l07", "kayu"), W("l10", "kota"), 0.6) > 0.01}>
            <HangingTag at={[0, 1.0, 0]} w={6.8} title="SUMUTRA" sub="SAMUDERA · ± 1345" sway={Math.sin(t * 0.8) * 0.006} threads={false} />
          </group>
          {/* inside the town */}
          <Spears />
          <Mosque />
          <Boats t={ramp(t, W("l06", "warga") - 0.6, WE("l06", "ikan") + 0.6)} s={t} />
          <SunTokens s={t} t={[ramp(t, W("l07", "tamu"), W("l07", "tiga")), ramp(t, W("l07", "tiga"), W("l07", "hari")), ramp(t, W("l07", "hari"), W("l07", "supaya"))]} />
          <Guest show={win(t, W("l07", "tamu") - 0.5, W("l08", "sultan"), 0.3)} s={t} />
          <SultanWalk u={ramp(t, W("l08", "berjalan") - 0.3, W("l09", "salat"))} show={win(t, W("l08", "ulama") - 0.2, W("l09", "ia"), 0.3)} s={t} />
          <Pavilion t={popEase(ramp(t, W("l09", "selesai"), W("l09", "menyalami")))} s={t} />
          {/* map landmarks */}
          <Tangier t={popEase(ramp(t, W("l02", "1325") + 1.0, W("l02", "tangier")))} />
          <ConeDoll h={5} robe="ivoryLight" sash="coral" turban="ivory" staff position={walker} yaw={-Math.PI / 2 - 0.22} s={t} walk={walkU > 0 && walkU < 1 ? 1 : 0} />
          <MakkahTown t={popEase(ramp(t, W("l03", "haji"), WE("l03", "bulan")))} />
          {/* the traveller's junk rides the head of the thread on the sea legs (Calicut → Bengal → Burma) */}
          {marker > 0.001 ? <Junk s={t} position={[markerP.x, 0, markerP.z]} yaw={markerYaw - Math.PI} scale={2.4 * popEase(marker)} /> : null}
          <Delhi t={popEase(ramp(t, W("l04", "india"), W("l04", "delhi") + 0.4))} s={t} />
          <Storm t={popEase(ramp(t, W("l05", "rombongannya"), W("l05", "hancur") + 0.2)) * (1 - ramp(t, W("l05", "bengal"), W("l05", "burma")))} s={t} />
          {/* tags: one or two per beat, never a cluster */}
          <MapTag at={[T[0], 1.2, T[2]]} lift={9} title="TANGIER" sub="1325" show={tag(W("l02", "tahun") + 0.6, W("l03", "haji"))} cam={cam} />
          <MapTag lift={2} at={[PLACES.makkah[0] + 4, 1.2, PLACES.makkah[2] - 22]} title="MAKKAH" sub="BERHAJI" show={tag(W("l03", "haji"), W("l04", "timur"))} cam={cam} />
          <MapTag at={PLACES.baghdad} title="TIMUR TENGAH" show={tag(W("l04", "timur"), W("l04", "asia") - 0.2)} cam={cam} />
          <MapTag at={PLACES.bukhara} title="ASIA TENGAH" show={tag(W("l04", "asia"), W("l04", "delhi"))} cam={cam} />
          <MapTag at={PLACES.delhi} title="DELHI" sub="HAKIM SULTAN" show={tag(W("l04", "delhi"), W("l05", "tiongkok"))} cam={cam} size={0.8} lift={16} />
          <MapTag at={[14, 1.2, 84]} title="TIONGKOK" sub="TUJUAN MISI" show={tag(W("l05", "mengutusnya"), W("l05", "badai"))} cam={cam} />
          <MapTag lift={12} at={[PLACES.calicut[0] + 12, 14, PLACES.calicut[2] + 2]} title="CALICUT" sub="BADAI" show={tag(W("l05", "hancur"), W("l05", "jalan"))} cam={cam} size={0.75} />
          <MapTag at={PLACES.bengal} title="BENGAL" show={tag(W("l05", "ia") + 0.3, W("l05", "lalu"))} cam={cam} size={0.6} />
          <MapTag at={[PLACES.burma[0] + 16, 1.2, PLACES.burma[2] + 2]} title="BURMA" show={tag(W("l05", "ia") + 0.6, W("l05", "lalu"))} cam={cam} size={0.6} />
          <MapTag at={islandTag} title={flip < 0.5 ? "SUMUTRA" : "SUMATRA"} sub={flip < 0.5 ? "KOTA SAMUDERA" : "SELURUH PULAU"}
            show={tag(W("l10", "kota"), W("l11", "seluruh")) * (0.15 + 0.85 * Math.abs(1 - 2 * flip))} cam={cam} size={1.1} />
          <MapTag at={[26, 2, -32]} title="AL-JAWA" sub="SEBUTAN IBNU BATTUTA" show={tag(W("l11", "menyebutnya"), W("l11", "seluruh"))} cam={cam} size={0.8} />
          <MapTag at={[T[0] - 200, 1.2, T[2] - 60]} lift={16} title="TANGIER" sub="PULANG" show={tag(W("l11", "seluruh"), W("l11", "ditulis"))} cam={cam} />
          <AudiraPlaque cam={cam} show={ramp(t, W("l11", "ditulis"), W("l11", "pulang") + 0.4)} />
        </Stage>
        <Finish frame={frame} background={PAL.sky} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
      </Stage3D>
      {cover ? null : <AudiraOutro seconds={TOTAL - OUTRO_AT} />}
      {/* starts after the hook title card has faded, so it never sits on the kicker/title */}
      <Sequence from={Math.round(3.4 * fps)} layout="none">
        <AudiraSignature seed="sejarah-islam-ep07" outroSeconds={TOTAL - OUTRO_AT} />
      </Sequence>
    </AbsoluteFill>
  );
};
