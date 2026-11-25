// EP08 "Pisau bedah Al-Zahrawi" (PRECISION) — the full film on the locked voice (audio/timeline.json).
// One continuous studio-table world grown from the approved cover: the manuscript with its ink plate of
// instruments (Kitab al-Tasrif, part 30), a machined map plate behind it (Kordoba, Madinat al-Zahra,
// Toledo, Salerno, Montpellier) and a steel instrument tray to the right (knife in its sheath, scissors,
// gut thread, silk, an oud). Strictly non-graphic: no people, no patient, no body, no wound, no blood.
// Every timed event and camera key is anchored to a spoken word (time.ts, camera.ts).
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT } from "../../core/type/fonts.ts";
import { Book, Scalpel, Softboxes, Table } from "./parts.tsx";
import { MapPlate, type MapState } from "./map.tsx";
import { Cautery3D, Forceps3D, Hook3D, MakerPlate, Oud, PartTabs, Saw3D, Scissors3D, SheathKnife, Spool, ThreadToNeedle, Tray } from "./tools.tsx";
import { FIGS } from "./textures.ts";
import { camWorld, poseAt, project, type Pose } from "./camera.ts";
import { Overlay as HookTitle } from "./ZahrawiCover.tsx";
import { OUTRO_AT, PART, TIMELINE, TOTAL, W, WE, ramp, win } from "./time.ts";
import { CITY, GUTTER, HERO, OUD, PAGE_D, PAL, STACK_H, TRAY, geo, leftPagePoint } from "./world.ts";

export const ZAHRAWI_TOTAL = TOTAL;

const CameraRig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const { pos, target } = camWorld(pose);
  cam.fov = pose.fov;
  cam.near = 0.05;
  cam.far = 120;
  cam.position.copy(pos);
  cam.lookAt(target);
  cam.updateProjectionMatrix();
  return null;
};

// ---------- timing ----------
const T = {
  drawStart: W("l05", "alat-alatnya"),
  pisau: W("l05", "pisau"),
  kait: W("l05", "kait"),
  pinset: W("l05", "pinset"),
  gergaji: W("l05", "gergaji"),
  kauter: W("l05", "kauter"),
  settle: W("l07", "menurut"),
  tiga: W("l04", "tiga"),
  bagian2: W("l04", "bagian", 2),
  terakhir: W("l04", "terakhirnya"),
  kordoba: W("l03", "kordoba"),
  madinat: W("l03", "madinat"),
  tersembunyi: W("l07", "tersembunyi"),
  gunting: W("l07", "gunting"),
  benang: W("l08", "benang"),
  senar: W("l09", "senar"),
  terjemah: W("l10", "menerjemahkannya"),
  toledo: W("l10", "toledo"),
  buku: W("l10", "buku"),
  salerno: W("l10", "salerno"),
  dan10: W("l10", "dan"),
  montpellier: W("l10", "montpellier"),
};

// ---------- tools on the ink plate ----------
const figCenter = (id: string, lift: number) => {
  const g = FIGS.find((x) => x.id === id)!;
  return { p: leftPagePoint(g.x + (g.s / 2) * Math.cos(g.a), g.y + (g.s / 2) * Math.sin(g.a), lift), yaw: -g.a };
};

const PlateTool: React.FC<{ id: string; at: number; t: number; children: React.ReactNode }> = ({ id, at, t, children }) => {
  const k = ramp(t, at - 0.2, at + 0.5);
  if (k <= 0.001) return null;
  const down = ramp(t, T.settle, T.settle + 1.5);
  const lift = 0.04 + 0.7 * k * (1 - down) + 0.06 * down;
  const { p, yaw } = figCenter(id, lift);
  const bob = (1 - down) * 0.03 * Math.sin(t * 2.1 + at);
  return (
    <group position={[p[0], p[1] + bob, p[2]]} rotation={[0, yaw, 0]} scale={0.35 + 0.65 * k}>
      <group rotation={[-0.25 * (1 - down), 0, 0]}>{children}</group>
    </group>
  );
};

/** Hero scalpel: hovers over the cover drawing (hook), rests on the table, flies to its drawing at "Pisau", settles. */
const HeroTool: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const toRest = ramp(t, 7.5, 12);
  const toList = ramp(t, T.pisau - 0.4, T.pisau + 0.7);
  const down = ramp(t, T.settle, T.settle + 1.5);
  const hero = { p: [HERO.pos[0], HERO.pos[1] + Math.sin(f * 0.02) * 0.03, HERO.pos[2]], yaw: HERO.yaw, tilt: HERO.tilt, roll: HERO.roll, s: HERO.scale };
  const rest = { p: [-4.7, 0.07, 0.3], yaw: Math.PI / 2, tilt: -Math.PI / 2, roll: 0, s: 0.62 };
  const li = figCenter("pisau", 0.85 * (1 - down) + 0.1 * down);
  const list = { p: li.p, yaw: li.yaw, tilt: -1.25 * (1 - down) - (Math.PI / 2) * down, roll: 0, s: 0.48 };
  const mix = (a: typeof hero, b: typeof hero, u: number) => ({
    p: a.p.map((v, i) => v + (b.p[i] - v) * u),
    yaw: a.yaw + (b.yaw - a.yaw) * u,
    tilt: a.tilt + (b.tilt - a.tilt) * u,
    roll: a.roll + (b.roll - a.roll) * u,
    s: a.s + (b.s - a.s) * u,
  });
  const q = mix(mix(hero, rest, toRest), list, toList);
  return (
    <group position={q.p as [number, number, number]} rotation={[0, q.yaw, 0]}>
      <group rotation={[q.tilt, 0, q.roll]} scale={q.s}>
        <Scalpel />
      </group>
    </group>
  );
};

// ---------- lights ----------
const Spot: React.FC<{ pos: [number, number, number]; at: [number, number, number]; i: number; angle?: number; shadow?: boolean; color?: string }> = ({ pos, at, i, angle = 0.55, shadow = false, color = "#fff6ea" }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  tgt.position.set(...at);
  return (
    <>
      <primitive object={tgt} />
      <spotLight
        position={pos}
        target={tgt}
        angle={angle}
        penumbra={0.9}
        intensity={i}
        decay={2}
        color={color}
        castShadow={shadow}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
    </>
  );
};

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.06} color="#fff4e6" />
    <Spot pos={[4, 9, 6]} at={[0, 0, 0]} i={260} shadow />
    <Spot pos={[1, 10, -2.5]} at={[0, 0, -7]} i={210} angle={0.62} shadow />
    {/* tray: low raking key from the right-front + cool rim from behind (product-shot look) */}
    <Spot pos={[11, 2.6, 1.2]} at={[5.4, 0, 0.6]} i={170} angle={0.5} shadow />
    <Spot pos={[5.2, 3.2, -4.5]} at={[5.4, 0, 1.0]} i={140} angle={0.6} color="#d6e4ff" />
    <directionalLight position={[-6, 5, 3]} intensity={0.35} color="#ffd9a8" />
    <directionalLight position={[-5, 3, -4]} intensity={1.4} color="#cfe0ff" />
    <directionalLight position={[5, 2.5, -5]} intensity={0.8} color="#dfe8ff" />
  </>
);

// ---------- world ----------
const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const reveal = FIGS.map((_, i) => (t < 7 ? 1 : ramp(t, T.drawStart + i * 0.45, T.drawStart + i * 0.45 + 0.7)));
  const map: MapState = {
    pins: {
      kordoba: ramp(t, T.kordoba - 0.4, T.kordoba + 0.3),
      toledo: ramp(t, T.toledo - 0.6, T.toledo + 0.1),
      salerno: ramp(t, T.salerno - 0.4, T.salerno + 0.3),
      montpellier: ramp(t, T.montpellier - 0.4, T.montpellier + 0.3),
    },
    arcade: ramp(t, T.madinat - 0.4, T.madinat + 0.8),
    routes: {
      toledo: ramp(t, T.terjemah, T.toledo + 0.2),
      salerno: ramp(t, T.buku, T.salerno + 0.3),
      montpellier: ramp(t, T.dan10, T.montpellier + 0.4),
    },
  };
  const knifeOut = ramp(t, T.tersembunyi - 0.1, T.tersembunyi + 0.9);
  const sc = ramp(t, T.gunting - 0.2, T.gunting + 0.5) * (1 - 0.6 * ramp(t, T.gunting + 1.2, T.gunting + 1.7)) + 0.6 * ramp(t, T.gunting + 2.0, T.gunting + 2.5);
  const thread = ramp(t, T.benang - 0.3, T.benang + 1.6);
  const spoolFrom = useMemo(() => new THREE.Vector3(4.4, 0.43, 0.9), []);
  const needleAt = useMemo(() => new THREE.Vector3(5.2, 0.06, 1.85), []);
  return (
    <>
      <Lights />
      <Softboxes />
      <Table />
      <Book reveal={reveal} />
      <PartTabs k={ramp(t, T.tiga - 0.2, T.bagian2)} last={ramp(t, T.terakhir, T.terakhir + 0.8)} />
      <HeroTool t={t} f={f} />
      <PlateTool id="kait" at={T.kait} t={t}><Hook3D /></PlateTool>
      <PlateTool id="pinset" at={T.pinset} t={t}><Forceps3D /></PlateTool>
      <PlateTool id="gergaji" at={T.gergaji} t={t}><Saw3D /></PlateTool>
      <PlateTool id="kauter" at={T.kauter} t={t}><Cautery3D /></PlateTool>
      <MapPlate s={map} />
      <BrassWeight at={geo(-7.6, 36.0, 0.09)} />
      <MakerPlate at={geo(15.2, 36.0, 0.09)} />
      {/* instrument tray */}
      <group position={[TRAY.x, 0, TRAY.z]}>
        <Tray w={TRAY.w} d={TRAY.d} />
      </group>
      <group position={[TRAY.x + 0.05, 0.13, TRAY.z - 1.25]} rotation={[0, 0.05, 0]}>
        <SheathKnife out={knifeOut} />
      </group>
      <group position={[TRAY.x + 0.9, 0.08, TRAY.z + 0.25]} rotation={[0, 1.3, 0]}>
        <Scissors3D open={sc} />
      </group>
      <group position={[4.4, 0.05, 0.9]} scale={1.3}>
        <Spool color="#eadbb8" turn={0.3} />
      </group>
      <ThreadToNeedle from={spoolFrom} to={needleAt} color="#e6d5ae" p={thread} />
      <group position={[7.3, 0.05, -1.3]}>
        <Spool color="#fbfaf6" silk turn={1.1} />
      </group>
      <group position={[OUD.x, 0.02, OUD.z]} rotation={[0, Math.PI / 2, 0]}>
        <Oud f={f} pluck={T.senar * 60} />
      </group>
    </>
  );
};

/** Turned brass map weight: a foreground object near the plate's south-west corner. */
const BrassWeight: React.FC<{ at: [number, number, number] }> = ({ at }) => (
  <group position={at}>
    <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.38, 0.4, 0.32, 64]} />
      <meshPhysicalMaterial color={PAL.brass} metalness={1} roughness={0.22} clearcoat={0.5} />
    </mesh>
    <mesh position={[0, 0.36, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.1, 0.1, 32]} />
      <meshPhysicalMaterial color={PAL.brass} metalness={1} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow>
      <sphereGeometry args={[0.1, 32, 20]} />
      <meshPhysicalMaterial color={PAL.ebony} roughness={0.3} clearcoat={0.8} />
    </mesh>
  </group>
);

// ---------- chips (2D plates, anchored to projected world points) ----------
type Chip = { a: number; b: number; text: string; at?: [number, number, number]; y?: number; dx?: number; dy?: number };
const K3 = geo(CITY.kordoba[0], CITY.kordoba[1], 0.5);
const TO3 = geo(CITY.toledo[0], CITY.toledo[1], 0.5);
const ZA3 = geo(CITY.zahra[0] - 0.9, CITY.zahra[1] + 0.25, 0.45);
const toolAt = (id: string) => figCenter(id, 0.8).p;

const CHIPS: Chip[] = [
  { a: W("l02", "namanya") - 0.1, b: W("l02", "di") - 0.1, text: "ABU AL-QASIM AL-ZAHRAWI", y: 340 },
  { a: W("l02", "di") - 0.1, b: W("l03", "lahir") - 0.1, text: "DI EROPA: ALBUCASIS", y: 340 },
  { a: W("l03", "936") - 0.3, b: W("l03", "kordoba") - 0.3, text: "LAHIR ± 936", y: 340 },
  { a: T.kordoba - 0.2, b: W("l03", "namanya") + 0.2, text: "KORDOBA · ANDALUSIA", at: K3, dy: -110 },
  { a: T.madinat - 0.2, b: W("l04", "sekitar") - 0.4, text: "MADINAT AL-ZAHRA", at: ZA3, dy: -140 },
  { a: W("l04", "1000") - 0.2, b: T.tiga - 0.3, text: "± 1000 M · KITAB AL-TASRIF", y: 340 },
  { a: T.tiga - 0.1, b: T.terakhir - 0.2, text: "30 BAGIAN", at: [GUTTER + 1.7, STACK_H + 0.55, -PAGE_D / 2 + 0.06], dy: -150 },
  { a: T.terakhir - 0.1, b: W("l05", "digambar") - 0.4, text: "BAGIAN KE-30: BEDAH", at: [GUTTER + 3.1, STACK_H + 0.95, -PAGE_D / 2 + 0.06], dy: -140, dx: -120 },
  { a: W("l05", "digambar") - 0.2, b: T.pisau - 0.3, text: "DIGAMBAR SATU PER SATU", y: 340 },
  { a: T.pisau, b: T.kait - 0.1, text: "PISAU", at: toolAt("pisau"), dy: -120 },
  { a: T.kait, b: T.pinset - 0.1, text: "KAIT", at: toolAt("kait"), dy: -110 },
  { a: T.pinset, b: T.gergaji - 0.1, text: "PINSET", at: toolAt("pinset"), dy: -110 },
  { a: T.gergaji, b: T.kauter - 0.1, text: "GERGAJI", at: toolAt("gergaji"), dy: -110 },
  { a: T.kauter, b: W("l06", "ia") + 0.6, text: "KAUTER", at: toolAt("kauter"), dy: -110 },
  { a: W("l06", "wajib") - 0.2, b: PART("explanation").start - 0.2, text: "ANATOMI LEBIH DULU", y: 340 },
  { a: W("l07", "penyunting") - 0.2, b: W("l07", "tidak") - 0.2, text: "MENURUT PENYUNTING MODERN", y: 340 },
  { a: W("l07", "tidak") - 0.2, b: W("l07", "misalnya") - 0.3, text: "TIDAK ADA DI TULISAN KLASIK", y: 340 },
  { a: T.tersembunyi - 0.1, b: W("l07", "dan") - 0.1, text: "PISAU DALAM SARUNG", y: 340 },
  { a: T.gunting - 0.1, b: W("l08", "lalu") - 0.1, text: "MUNGKIN GUNTING SEJATI PERTAMA", y: 340 },
  { a: W("l08", "usus") - 0.2, b: W("l08", "salah") - 0.1, text: "BENANG DARI USUS HEWAN", y: 340 },
  { a: W("l08", "salah") - 0.1, b: W("l09", "untuk") - 0.1, text: "SALAH SATU CATATAN TERTUA", y: 340 },
  { a: W("l09", "sutra") - 0.1, b: T.senar - 0.2, text: "SUTRA", at: [7.3, 0.75, -1.3], dy: -110 },
  { a: T.senar - 0.1, b: PART("explanation").end - 0.1, text: "SENAR ALAT MUSIK PETIK", y: 340 },
  { a: W("l10", "abad") - 0.1, b: W("l10", "gerard") - 0.1, text: "ABAD KE-12", y: 340 },
  { a: W("l10", "gerard") - 0.1, b: T.buku - 0.2, text: "GERARD DARI CREMONA", y: 340 },
  { a: W("l10", "latin") - 0.2, b: T.buku - 0.1, text: "LATIN · TOLEDO", at: TO3, dy: -120, dx: -40 },
  { a: T.salerno - 0.1, b: W("l11", "guy") - 0.2, text: "SALERNO · MONTPELLIER", y: 340 },
  { a: W("l11", "guy") - 0.1, b: W("l11", "200") - 0.2, text: "GUY DE CHAULIAC", y: 340 },
  { a: W("l11", "200") - 0.2, b: W("l11", "hampir") - 0.2, text: "DIKUTIP 200+ KALI", y: 340 },
  { a: W("l11", "500") - 0.2, b: WE("l11", "ini") + 0.4, text: "± 500 TAHUN DI EROPA", y: 340 },
];

const FS = 42;
const chipW = (s: string) => s.length * FS * 0.68 + 52;

const Chips: React.FC<{ t: number; pose: Pose }> = ({ t, pose }) => (
  <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
    {CHIPS.map((c, i) => {
      const k = win(t, c.a, c.b, 0.35);
      if (k <= 0.001) return null;
      const w = chipW(c.text);
      let cx = 540, cy = c.y ?? 340, anchor: [number, number] | null = null;
      if (c.at) {
        anchor = project(pose, c.at);
        if (!anchor) return null;
        cx = anchor[0] + (c.dx ?? 0);
        cy = anchor[1] + (c.dy ?? -110);
      }
      cx = Math.min(1020 - w / 2, Math.max(60 + w / 2, cx));
      cy = Math.min(1250, Math.max(250, cy));
      return (
        <React.Fragment key={i}>
          {anchor ? (
            <svg style={{ position: "absolute", inset: 0, opacity: k }} width={1080} height={1920}>
              <line x1={cx} y1={cy + 34} x2={anchor[0]} y2={anchor[1]} stroke="#e0a463" strokeWidth={3} />
              <circle cx={anchor[0]} cy={anchor[1]} r={7} fill="#e0a463" />
            </svg>
          ) : null}
          <div
            style={{
              position: "absolute", left: cx - w / 2, top: cy - 34, width: w, height: 68, boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(14,13,12,0.94)", border: "2px solid rgba(224,164,99,0.7)", borderRadius: 12,
              color: PAL.ivory, fontSize: FS, fontWeight: 700, letterSpacing: 1.5, whiteSpace: "nowrap",
              opacity: k, transform: `translateY(${(1 - k) * 10}px)`, boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
            }}
          >
            {c.text}
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

// ---------- karaoke captions ----------
type Wd = { w: string; s: number; e: number };
type Chunk = { words: Wd[]; a: number; b: number };
const JOIN = new Set(["dari", "lalu", "dan", "yang", "ke", "di", "untuk", "atau", "supaya", "tentang", "sebagai"]);
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
  if (best < 0) best = Math.ceil(g.length / 2);
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
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", fontFamily: FONT }}>
      <div
        style={{
          background: "rgba(14,12,10,0.9)", borderRadius: 18, padding: "16px 30px", maxWidth: 960, textAlign: "center", textWrap: "balance",
          boxShadow: "0 12px 34px rgba(0,0,0,0.45)", border: "1.5px solid rgba(243,234,216,0.16)",
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
                display: "inline-block", fontSize: 56, fontWeight: 600, lineHeight: 1.25, marginRight: i < c.words.length - 1 ? "0.4em" : 0,
                color: active ? "#ffb347" : said ? PAL.ivory : "rgba(243,234,216,0.62)", transform: `scale(${bounce})`,
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

export const ZahrawiFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const pose = poseAt(t);
  const titleK = 1 - ramp(t, 2.6, 3.4);
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.bg }}>
      <Stage3D
        background={PAL.bg}
        overlay={() => (
          <>
            {titleK > 0.001 ? <HookTitle k={titleK} /> : null}
            <Chips t={t} pose={pose} />
            <Captions t={t} />
          </>
        )}
      >
        <CameraRig pose={pose} />
        <World t={t} f={f} />
        <Finish
          frame={frame}
          background={PAL.bg}
          profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
          exposure={1.08}
          envIntensity={0.5}
          hdri="studio"
          envRotation={0.8}
          aoRadius={0.08}
          focus={pose.d}
          aperture={Math.min(0.009, Math.max(0.003, 0.035 / pose.d))}
          maxBlur={0.01}
        />
      </Stage3D>
      <AudiraOutro seconds={TOTAL - OUTRO_AT} />
      {/* starts after the hook title card has faded, so it never sits on the kicker/title */}
      <Sequence from={Math.round(3.4 * fps)} layout="none">
        <AudiraSignature seed="sejarah-islam-ep08" outroSeconds={TOTAL - OUTRO_AT} />
      </Sequence>
    </AbsoluteFill>
  );
};
