// EP05 "Kapal lewat daratan" (HISTORYMAP) — the full film on the locked voice (audio/timeline.json).
// One continuous paper-map world grown from the approved cover: the chain on log floats, the timber track
// over the Galata ridge, galleys on rollers with sails up, ~70 ships sliding into the Golden Horn, and the
// Venice 1439 inset. Neutral and non-graphic: no battle, no fire, no faces (figures are tiny silhouettes).
// Every timed event is anchored to a spoken word (time.ts); the camera keys live in camera.ts.
import React from "react";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { GalataTowerModel, HarborChain, LandRoute, PaperMap, Ship, ShipAfloat, Table, Tag, Town, Walls } from "./parts.tsx";
import { Camp, CamCard, Fleet, GlowPath, Haulers, Padlock, Plaque, Sheen, Windlass, arrived, drawHadis, drawVenice } from "./props.tsx";
import { FLEET_N, fleetP, routeC } from "./fleet.ts";
import { camWorld, poseAt, type Pose } from "./camera.ts";
import { OUTRO_AT, PART, TIMELINE, TOTAL, W, WE, ramp, win } from "./time.ts";
import { CHAIN_CITY, CHAIN_GALATA, GALATA_TOWER, HORN_WALL, PAL, ROUTE, ROUTE_WATER, w3 } from "./world.ts";

export const GALATA_TOTAL = TOTAL;

const CameraRig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const { pos, target } = camWorld(pose);
  cam.fov = pose.fov;
  cam.near = 0.05;
  cam.far = 80;
  cam.position.copy(pos);
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  return null;
};

// ---------- timing (all from word times) ----------
const T = {
  hookOut: [WE("l01", "bukit") + 0.1, W("l02", "kota")] as const,
  y1204: W("l02", "1204"),
  utara: WE("l02", "utaranya"),
  april: W("l03", "april"),
  mehmed: W("l03", "mehmed"),
  kepung: WE("l03", "mengepungnya"),
  hadis: W("l04", "hadis"),
  mainStart: PART("main").start,
  ditutup: W("l05", "ditutup"),
  galata5: WE("l05", "galata"),
  tertahan: W("l06", "tertahan"),
  ia: W("l07", "ia"),
  putar: W("l07", "memutarinya"),
  galata8: WE("l08", "galata"),
  setinggi: W("l08", "setinggi"),
  lumas: W("l08", "dilumasi"),
  kapal9: W("l09", "kapal-kapal"),
  naik: W("l09", "dinaikkan"),
  kereta: W("l09", "kereta"),
  kerekan: W("l09", "kerekan"),
  layar: W("l10", "layarnya"),
  kembang: WE("l10", "dikembangkan"),
  pagi: W("l11", "pagi"),
  april22: WE("l11", "april"),
  menjaga: W("l12", "menjaga"),
  sekitar12: W("l12", "sekitar"),
  jatuh: WE("l12", "jatuh"),
  trik: W("l13", "trik"),
  tahun13: W("l13", "tahun"),
  skala: WE("l13", "skalanya"),
};

const HOOK_SHIPS = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.93];
const HookShips: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  if (k <= 0.001) return null;
  const c = routeC();
  return (
    <group>
      {HOOK_SHIPS.map((u, i) => {
        const p = c.getPointAt(u), d = c.getTangentAt(u);
        return (
          <group key={i} position={p} scale={k}>
            <group rotation={[0, Math.atan2(-d.z, d.x), 0]}>
              <group rotation={[0, 0, Math.asin(Math.max(-1, Math.min(1, d.y)))]}>
                <Ship L={0.52} oarsUp onCradle frame={f} seed={i * 3 + 1} />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
};

/** Tags rise out of the paper (pop-up book) instead of popping in. Top-level so Tag textures stay memoised. */
const TagUp: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) =>
  k <= 0.001 ? null : <group position={[0, k >= 0.999 ? 0 : -(1 - k) * 0.9, 0]}>{children}</group>;

const World: React.FC<{ t: number; f: number; pose: Pose }> = ({ t, f, pose }) => {
  const hookK = 1 - ramp(t, T.hookOut[0], T.hookOut[1]);
  const face = pose.yaw * ramp(t, 1.5, 4.3);
  const routeK = t < T.putar ? hookK : ramp(t, T.putar, T.galata8);
  const P = fleetP(t);
  const heroSail = 0.12 + 0.88 * ramp(t, T.layar, T.kembang);
  const sail = t < T.pagi ? heroSail : 1;
  const chainMid: [number, number] = [(CHAIN_CITY[0] + CHAIN_GALATA[0]) / 2, (CHAIN_CITY[1] + CHAIN_GALATA[1]) / 2];
  const tagK = {
    chain: win(t, T.mainStart, T.ia, 0.6),
    galata: win(t, T.mainStart, T.ia, 0.6),
    bukit: win(t, T.setinggi - 0.3, T.kapal9, 0.6),
    y1204: win(t, T.y1204 - 0.2, T.april, 0.6),
    mehmed: win(t, T.mehmed, T.hadis, 0.6),
    lumas: win(t, T.lumas - 0.2, T.naik, 0.6),
    wall: win(t, T.menjaga - 0.2, T.trik, 0.6),
  };
  return (
    <>
      <ambientLight intensity={0.32} color="#ffe9cf" />
      <hemisphereLight args={["#fff1dc", "#2a2018", 0.4]} />
      <directionalLight
        position={[-7, 5.5, 1.5]}
        intensity={2.8}
        color="#ffe2bd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight position={[6, 3, -3]} intensity={0.5} color="#9fb8d6" />
      <Table />
      <PaperMap />
      <Walls />
      <Town seed={11} center={[-1.9, -0.75]} rx={2.2} ry={0.8} rot={0.3} n={380} />
      <Town seed={12} center={[-0.3, 0.9]} rx={0.36} ry={0.26} rot={0.6} n={55} />
      <Town seed={13} center={[3.9, -1.2]} rx={0.5} ry={1.4} n={40} />
      <GalataTowerModel at={GALATA_TOWER} />
      <HarborChain frame={f} scale={2.3} />
      <Plaque at={[-1.7, 5.15]} face={0} />
      {/* hook: the cover layout (route + ships on the ridge), cleared when the story rewinds to the city */}
      <LandRoute pts={ROUTE} progress={routeK} frame={f} />
      <LandRoute pts={ROUTE_WATER} progress={t < T.putar ? hookK : ramp(t, T.galata8 - 0.4, T.galata8 + 0.6)} frame={f} />
      <HookShips k={hookK} f={f} />
      {hookK > 0.001 ? (
        <group scale={[1, hookK, 1]}>
          <ShipAfloat at={[-1.98, 0.9]} deg={250} frame={f} seed={24} sail={0.9} />
        </group>
      ) : null}
      {/* Ottoman fleet held outside, at Double Columns on the Bosporus (register #17, #18) */}
      <ShipAfloat at={[1.75, 1.35]} deg={200} frame={f} seed={21} />
      <ShipAfloat at={[1.45, 1.0]} deg={205} frame={f} seed={22} />
      <ShipAfloat at={[1.15, 0.72]} deg={210} frame={f} seed={23} />
      {/* defenders behind the chain (register #15) */}
      <ShipAfloat at={[-0.35, 0.3]} deg={20} frame={f} seed={25} L={0.22} sail={0.3} />
      <ShipAfloat at={[-0.85, 0.5]} deg={30} frame={f} seed={26} L={0.22} sail={0.3} />
      {/* context: 1204 through the Horn; the 1453 siege camp outside the land walls */}
      <GlowPath pts={[[1.2, 1.5], [0.5, 0.35], [-0.6, 0.32], [-1.3, 0.55]]} water lift={0.06} progress={ramp(t, T.y1204, T.utara)} opacity={win(t, T.y1204 - 0.1, T.april, 0.5)} color="#d94a3a" />
      <Camp k={ramp(t, T.april, T.kepung)} />
      {/* main: the chain line lights up tower to tower; the padlock on the mouth of the Horn */}
      <GlowPath pts={[CHAIN_CITY, chainMid, CHAIN_GALATA]} water lift={0.11} r={0.01} progress={ramp(t, T.ditutup, T.galata5)} opacity={win(t, T.ditutup - 0.1, T.ia, 0.6)} color="#ffb347" />
      <Padlock at={w3(chainMid[0] + 0.18, chainMid[1] + 0.12, 0.05)} k={win(t, T.tertahan - 0.2, T.putar, 0.6)} face={face} />
      {/* explanation: grease sheen, windlass, haulers, the first ships on rollers */}
      <Sheen s={((t - T.lumas) / 1.6) % 1} k={win(t, T.lumas, T.kereta, 0.5)} />
      <Windlass u={0.42} k={ramp(t, T.kerekan - 0.3, T.kerekan + 0.5) * (1 - ramp(t, T.april22, T.april22 + 0.8))} f={f} />
      <Haulers u0={P} f={f} k={win(t, T.naik, T.pagi - 0.6, 0.8)} />
      <Fleet P={P} f={f} sail={sail} heroL={0.4} />
      {/* payoff: the Horn walls the defenders must now guard */}
      <GlowPath pts={HORN_WALL} lift={0.1} r={0.012} progress={ramp(t, T.menjaga, T.menjaga + 1.4)} opacity={win(t, T.menjaga - 0.1, T.trik, 0.6)} color="#ffb347" />
      {/* tags */}
      <TagUp k={hookK}>
        <Tag at={chainMid} off={[-0.2, 0.45]} lift={0.55} title="RANTAI BESI" sub="MENGUNCI TELUK" w={1.3} tilt={0.55} water face={face} />
      </TagUp>
      <TagUp k={tagK.chain}>
        <Tag at={chainMid} off={[-0.12, 0.3]} lift={0.42} title="RANTAI BESI" sub="MENGUNCI TELUK" w={0.74} tilt={0.35} water face={face} />
      </TagUp>
      <TagUp k={hookK}>
        <Tag at={[0.95, 2.62]} off={[0.1, -0.75]} lift={0.45} title="BUKIT GALATA" sub="± 60 M" w={1.28} tilt={0.5} accent="#8a5a1c" face={face} />
      </TagUp>
      <TagUp k={tagK.bukit}>
        <Tag at={[0.45, 2.62]} off={[-0.1, -0.2]} lift={0.85} title="BUKIT GALATA" sub="± 60 M" w={1.1} tilt={0.4} accent="#8a5a1c" face={face} />
      </TagUp>
      <TagUp k={hookK}>
        <Tag at={GALATA_TOWER} off={[-0.65, -0.15]} lift={0.45} title="GALATA" w={0.9} tilt={0.55} face={face} />
      </TagUp>
      <TagUp k={tagK.galata}>
        <Tag at={GALATA_TOWER} off={[-0.3, -0.05]} lift={0.55} title="GALATA" w={0.55} tilt={0.35} face={face} />
      </TagUp>
      <TagUp k={tagK.y1204}>
        <Tag at={[-1.55, 0.48]} off={[-0.3, -0.5]} lift={0.5} title="1204" sub="LEWAT TELUK" w={0.8} tilt={0.5} face={face} />
      </TagUp>
      <TagUp k={tagK.mehmed}>
        <Tag at={[-5.0, -0.6]} off={[0.75, -0.5]} lift={0.55} title="MEHMED II" sub="21 TAHUN" w={0.9} tilt={0.5} accent="#8a5a1c" face={face} />
      </TagUp>
      <TagUp k={tagK.lumas}>
        <Tag at={[1.0, 2.62]} off={[-0.1, -0.3]} lift={0.32} title="DILUMASI" sub="LEMAK ATAU MINYAK" w={0.5} tilt={0.5} accent="#8a5a1c" face={face} />
      </TagUp>
      <TagUp k={tagK.wall}>
        <Tag at={[-2.3, 1.08]} off={[0.1, -0.45]} lift={0.5} title="TEMBOK TELUK" sub="DIJAGA" w={0.86} tilt={0.5} face={face} />
      </TagUp>
      {/* camera-space paper cards */}
      <CamCard id="hadis" pose={pose} k={win(t, T.hadis - 0.2, T.mainStart - 0.3, 0.5)} x={0} y={0.14} dist={2.2} w={0.62} h={0.31} draw={drawHadis} />
      <CamCard id="venice" pose={pose} k={win(t, T.tahun13 - 0.2, T.skala + 0.2, 0.6)} x={0} y={0.36} dist={2.2} w={0.42} h={0.28} draw={drawVenice} />
    </>
  );
};

// ---------- 2D layers: hook title (cover match), HUD, karaoke captions, outro ----------
const HookTitle: React.FC<{ k: number }> = ({ k }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, opacity: k }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(13,11,9,0.93) 0%, rgba(13,11,9,0.84) 62%, rgba(13,11,9,0) 100%)" }} />
      <div style={{ position: "absolute", left: 72, top: 196, color: "#f0a24b", fontSize: 30, fontWeight: 600, letterSpacing: 7 }}>SEJARAH ISLAM · EP05</div>
      <div style={{ position: "absolute", left: 66, top: 252, color: "#f4ead2", fontSize: 140, fontWeight: 600, lineHeight: 1.0, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
        KAPAL LEWAT
        <br />
        BUKIT
      </div>
      <div style={{ position: "absolute", left: 72, top: 548, width: 900, color: "#d9cdb4", fontSize: 34, fontWeight: 500, lineHeight: 1.3 }}>
        Konstantinopel, 1453: rantai besi mengunci pelabuhan, jadi ±70 kapal ditarik lewat darat
      </div>
    </div>
  );

const DATES: [number, number, string][] = [
  [T.y1204 - 0.2, T.april - 0.1, "1204"],
  [T.april - 0.1, T.hadis - 0.4, "APRIL 1453"],
  [T.pagi, T.trik, "22 APRIL 1453"],
];
const Hud: React.FC<{ t: number; P: number }> = ({ t, P }) => {
  const d = DATES.find(([a, b]) => t >= a && t < b + 0.5);
  const dk = d ? win(t, d[0], d[1], 0.4) : 0;
  const ck = win(t, T.pagi + 0.6, T.trik, 0.5);
  const n = arrived(P);
  const wk = win(t, T.sekitar12, T.trik, 0.4);
  const plate: React.CSSProperties = { background: "rgba(20,15,11,0.78)", border: "2px solid rgba(240,162,75,0.6)", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" };
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      {d && dk > 0.001 ? (
        <div style={{ ...plate, position: "absolute", left: 64, top: 262, padding: "14px 26px", opacity: dk, transform: `translateY(${(1 - dk) * -16}px)` }}>
          <div style={{ color: "#f0a24b", fontSize: 24, fontWeight: 600, letterSpacing: 5 }}>KONSTANTINOPEL</div>
          <div style={{ color: "#f4ead2", fontSize: 54, fontWeight: 600, letterSpacing: 3, lineHeight: 1.1 }}>{d[2]}</div>
          {wk > 0.001 && d[2] === "22 APRIL 1453" ? (
            <div style={{ color: "#d9cdb4", fontSize: 26, fontWeight: 500, opacity: wk, marginTop: 4 }}>± 5 minggu kemudian, kota jatuh</div>
          ) : null}
        </div>
      ) : null}
      {ck > 0.001 ? (
        <div style={{ ...plate, position: "absolute", right: 64, top: 262, padding: "14px 22px", width: 330, opacity: ck, transform: `translateY(${(1 - ck) * -16}px)` }}>
          <div style={{ color: "#f4ead2", fontSize: 50, fontWeight: 600, letterSpacing: 2 }}>± 70 KAPAL</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {Array.from({ length: FLEET_N }, (_, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: i < n ? "#ffb347" : "rgba(244,234,210,0.18)" }} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

type Chunk = { words: { w: string; s: number; e: number }[]; a: number; b: number };
// Caption chunks: break at punctuation; merge one-word phrases (lists like "kerekan, sapi,") into a
// neighbour; split only phrases longer than 8 words / 46 chars, before a joiner word near the middle,
// never leaving a one-word chunk. Lines inside a chunk wrap balanced (no orphan word).
const JOIN = new Set(["dari", "lalu", "dan", "yang", "ke", "di", "seolah", "tapi", "juga", "lewat", "melewati", "setinggi"]);
const NUM = new Set(["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "puluh", "ratus", "ribu", "tahun", "april", "minggu", "meter", "kapal"]);
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
type Wd = Chunk["words"][number];
const chars = (g: Wd[]) => g.map((x) => x.w).join(" ").length;
const splitLong = (g: Wd[]): Wd[][] => {
  if (g.length <= 8 && chars(g) <= 46) return [g];
  let best = -1, bestScore = Infinity;
  for (let i = 2; i <= g.length - 2; i++) {
    if (!JOIN.has(clean(g[i].w))) continue;
    const sc = Math.abs(i - g.length / 2);
    if (sc < bestScore) { bestScore = sc; best = i; }
  }
  if (best < 0) {
    // fallback: nearest the middle, never inside a spoken number ("dua puluh satu")
    for (let i = 2; i <= g.length - 2; i++) {
      if (NUM.has(clean(g[i - 1].w)) && NUM.has(clean(g[i].w))) continue;
      const sc = Math.abs(i - g.length / 2);
      if (sc < bestScore) { bestScore = sc; best = i; }
    }
    if (best < 0) best = Math.ceil(g.length / 2);
  }
  return [...splitLong(g.slice(0, best)), ...splitLong(g.slice(best))];
};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const line of TIMELINE.lines) {
    const phrases: Wd[][] = [];
    let cur: Wd[] = [];
    for (const w of line.words) {
      cur.push(w);
      if (/[.,?!]$/.test(w.w)) { phrases.push(cur); cur = []; }
    }
    if (cur.length) phrases.push(cur);
    // merge one-word phrases into a neighbour
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
  // never overlap the next line's first chunk
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
})();
export const CAPTION_CHUNKS = CHUNKS;

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT) return null;
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = Math.min(1, (t - c.a) / 0.12);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <div
        style={{
          background: "rgba(16,12,9,0.8)", borderRadius: 18, padding: "16px 30px", maxWidth: 940, textAlign: "center", textWrap: "balance",
          boxShadow: "0 12px 34px rgba(0,0,0,0.45)", border: "1.5px solid rgba(244,234,210,0.16)", backdropFilter: "blur(8px)",
          opacity: k, transform: `translateY(${(1 - k) * 8}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const active = t >= w.s - 0.04 && t < w.e + 0.06;
          const said = t >= w.e;
          const bounce = active ? 1 + 0.04 * Math.sin(Math.min(1, (t - w.s) / 0.18) * Math.PI) : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block", fontSize: 56, fontWeight: 600, lineHeight: 1.25, marginRight: "0.4em",
                color: active ? "#ffb347" : said ? "#f4ead2" : "rgba(244,234,210,0.62)", transform: `scale(${bounce})`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, OUTRO_AT, OUTRO_AT + 0.5);
  if (k <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: k, backgroundColor: "#0B3D2E", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 520, height: "auto", transform: `translateY(${(1 - k) * 20}px)` }} />
      <div style={{ color: "#e9dfc8", fontSize: 38, fontWeight: 500, letterSpacing: 4, marginTop: 40 }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

export const GalataFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const pose = poseAt(t);
  const titleK = 1 - ramp(t, 2.6, 3.4);
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.table }}>
      <Stage3D
        background={PAL.table}
        overlay={() => (
          <>
            <HookTitle k={titleK} />
            <Hud t={t} P={fleetP(t)} />
            <Captions t={t} />
          </>
        )}
      >
        <CameraRig pose={pose} />
        <World t={t} f={f} pose={pose} />
        <Finish frame={frame} background={PAL.table} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} ao={false} />
      </Stage3D>
      <Outro t={t} />
      {/* starts after the hook title card has faded, so it never sits on the kicker/title */}
      <Sequence from={Math.round(3.4 * fps)} layout="none">
        <AudiraSignature seed="sejarah-islam-ep05" handle="@AUDIRAQISSAH" outroSeconds={TOTAL - OUTRO_AT} />
      </Sequence>
    </AbsoluteFill>
  );
};
