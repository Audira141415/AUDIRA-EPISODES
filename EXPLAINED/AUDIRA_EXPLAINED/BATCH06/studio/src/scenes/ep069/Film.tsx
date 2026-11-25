// AE-069 film (PAPERWORLD): one continuous camera through the approved cover diorama.
// HOOK brown water -> clean outlet -> wide; KONTEKS septic tank vs sewer; MEKANISME screen, grit,
// primary; REVEAL aeration zoom-through into the micro set (MBBR carriers), return sludge;
// PAYOFF BOD meter + UV + outlet; OUTRO "bukan air minum" sign, pull back, AUDIRA card.
// Audio Master Clock: every time below comes from timeline.json (words/sections).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { Stage, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { clamp, remap, ease } from "../../kits/paperworld/motion/easing.ts";
import type { V3 } from "../../kits/paperworld/components/Paper.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import { DAY } from "./Cover.tsx";
import { Diorama, T2_TOP, SCREEN_X } from "./Diorama.tsx";
import { FlowArrows, MICRO, CARRIER_X, MicroSet, PlantExtension, RasLine, RiverSign, SepticTank, Tag, UvChannel } from "./FilmExtras.tsx";
import TL from "./timeline.json";

type Word = { w: string; s: number; e: number };
type Clip = { id: string; section: string; text: string; start: number; end: number; words: Word[] };
const CLIPS = (TL as unknown as { clips: Clip[] }).clips;
const SEC = (TL as unknown as { sections: Record<string, [number, number]> }).sections;
export const TOTAL = (TL as unknown as { total: number }).total;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALL: Word[] = CLIPS.flatMap((c) => c.words);
/** Start time of the first word starting with `q` at or after `after` seconds. */
const W = (q: string, after = 0) => {
  const hit = ALL.find((w) => w.s >= after - 1e-6 && norm(w.w).startsWith(q));
  if (!hit) throw new Error(`timeline word not found: ${q}`);
  return hit.s;
};

// ── Anchors ────────────────────────────────────────────────────────────────────────────────
const A = {
  syarat: W("syaratnya"),
  kebanyakan: W("kebanyakan"),
  septik: W("septik"),
  berpipa: W("berpipa"),
  kloset: W("kloset"),
  bawah: W("bawah"),
  saringan: W("saringan"),
  pasir: W("pasir"),
  berat: W("berat"),
  mikroba: W("mikroba"),
  udara: W("udara"),
  dasar: W("dasar"),
  memakan: W("memakan"),
  jakarta: W("jakarta"),
  plastik: W("plastik"),
  sebagian: W("sebagian"),
  krukut: W("krukut"),
  turun: W("turun", SEC.PAYOFF[0]),
  tiga: W("tiga", SEC.PAYOFF[0]),
  desinfeksi: W("didesinfeksi"),
  sungaiAkhir: W("sungai", W("didesinfeksi")),
  lebih: W("lebih", SEC.OUTRO[0]),
  ini: W("ini", SEC.OUTRO[0]),
};
const ZOOM_CUT = W("dan", A.udara); // "...dasar bak, | dan bakteri memakan"
const BACK_CUT = A.sebagian;
const OUTRO_AT = SEC.OUTRO[1] + 0.2;

// ── Camera: Catmull-Rom through keys inside each shot; hard cuts only between shots ─────────
type Key = { t: number; pos: V3; tgt: V3; fov?: number; p?: number };
const M = (x: number, y: number, z: number): V3 => [MICRO[0] + x, MICRO[1] + y, MICRO[2] + z];
const WIDE: Key = { t: 0, pos: [-3.6, 27.1, 74.0], tgt: [0.2, 0.4, 1], p: 1 };
const y0 = T2_TOP;

const SHOTS: Key[][] = [
  [
    { t: 0, pos: [9.6, -3.0, 11.4], tgt: [7.6, -7.3, 3.0] },
    { t: 1.6, pos: [7.8, -3.4, 11.0], tgt: [7.0, -7.4, 3.4] },
    { t: 3.0, pos: [-5.6, -8.3, 17.6], tgt: [-8.4, -10.6, 8.6] },
    { t: A.syarat, pos: [-6.4, -8.7, 17.2], tgt: [-8.4, -10.9, 8.6] },
    { ...WIDE, t: SEC.HOOK[1] - 0.2 },
    { t: A.kebanyakan, pos: [-4.4, 21, 62], tgt: [-0.6, 0, 0], p: 1 },
    { t: A.septik - 0.3, pos: [-5.0, 1.6, 15.5], tgt: [-6.4, -2.2, -3] },
    { t: A.berpipa, pos: [-6.6, 1.2, 14.6], tgt: [-6.4, -2.2, -3] },
    { t: A.kloset, pos: [-3.8, 1.3, 13.6], tgt: [-5.0, -1.6, -2] },
    { t: A.bawah, pos: [3.6, 0.8, 13.6], tgt: [3.2, -3.4, -2] },
    { t: SEC.KONTEKS[1] + 0.4, pos: [8.4, -1.4, 13.6], tgt: [8.3, -5.2, -2] },
    { t: A.saringan + 0.2, pos: [9.6, -3.6, 12.8], tgt: [7.9, -7.0, 3.2] },
    { t: A.pasir, pos: [14.0, -3.5, 15.2], tgt: [13.6, -7.5, 4.8] },
    { t: A.berat, pos: [19.0, -4.3, 14.6], tgt: [19.2, -7.3, 3.2] },
    { t: SEC.REVEAL[0], pos: [19.8, -4.9, 12.8], tgt: [19.4, -7.2, 3.2] },
    { t: A.mikroba + 0.4, pos: [2.8, -4.0, 20.5], tgt: [2.0, -6.8, 6.0] },
    { t: A.dasar, pos: [2.3, -6.3, 11.8], tgt: [2.0, -7.1, 6.6], p: 1.15 },
    { t: ZOOM_CUT, pos: [2.0, -6.95, 7.5], tgt: [2.0, -7.0, 6.4], p: 1 },
  ],
  [
    { t: ZOOM_CUT, pos: M(0, 0, 15), tgt: M(0, 0, 0) },
    { t: A.jakarta, pos: M(2.5, 0.4, 10.5), tgt: M(2.0, 0, 0) },
    { t: A.plastik, pos: M(CARRIER_X - 1.4, 1.0, 13), tgt: M(CARRIER_X, 0, 0) },
    { t: BACK_CUT, pos: M(CARRIER_X + 1.6, 1.8, 10.5), tgt: M(CARRIER_X, 0, 0) },
  ],
  [
    { t: BACK_CUT, pos: [-0.8, -2.2, 23.0], tgt: [-2.6, -7.4, 4.6] },
    { t: SEC.REVEAL[1], pos: [-3.0, -1.6, 21.4], tgt: [-3.0, -7.4, 4.6] },
    { t: SEC.PAYOFF[0] + 0.6, pos: [-5.2, -2.6, 18.5], tgt: [-5.6, -7.6, 3.6] },
    { t: A.desinfeksi - 0.3, pos: [-9.2, -3.4, 16.4], tgt: [-6.8, -7.8, 4.6] },
    { t: A.desinfeksi + 1.2, pos: [-6.2, -5.4, 13.6], tgt: [-8.4, -7.6, 6.2] },
    { t: A.sungaiAkhir + 0.3, pos: [-6.0, -8.8, 17.6], tgt: [-8.4, -10.8, 8.8] },
    { t: A.lebih + 0.4, pos: [-2.6, -3.4, 32.0], tgt: [-5.4, -10.4, 13.0], p: 1 },
    { t: A.ini, pos: [-1.0, -2.4, 34.0], tgt: [-4.2, -10.0, 12.5], p: 1 },
    { ...WIDE, t: OUTRO_AT + 0.4 },
    { ...WIDE, t: TOTAL + 1, pos: [-3.6, 28.5, 78] },
  ],
];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const cr3 = (a: V3, b: V3, c: V3, d: V3, u: number): V3 => [cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u), cr(a[2], b[2], c[2], d[2], u)];

const pulled = (k: Key, micro: boolean): Key => {
  const f = k.p ?? (micro ? 1 : 1.45);
  return { ...k, pos: [k.tgt[0] + (k.pos[0] - k.tgt[0]) * f, k.tgt[1] + (k.pos[1] - k.tgt[1]) * f, k.tgt[2] + (k.pos[2] - k.tgt[2]) * f] };
};
const SHOTS_P: Key[][] = SHOTS.map((sh, i) => sh.map((k) => pulled(k, i === 1)));

const camAt = (t: number): { pos: V3; tgt: V3; fov: number } => {
  let keys = SHOTS_P[0];
  for (const sh of SHOTS_P) if (t >= sh[0].t) keys = sh;
  if (t <= keys[0].t) return { pos: keys[0].pos, tgt: keys[0].tgt, fov: 30 };
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k1 = keys[i], k2 = keys[Math.min(i + 1, keys.length - 1)];
  const k0 = keys[Math.max(0, i - 1)], k3 = keys[Math.min(i + 2, keys.length - 1)];
  const u = clamp((t - k1.t) / Math.max(1e-3, k2.t - k1.t));
  // ease only the first and last segment of a shot, keep velocity through the middle keys
  const first = i === 0, last = i + 1 === keys.length - 1;
  const uu = first && last ? ease.inOut(u) : first ? u * u * (2 - u) : last ? u * (1 + u - u * u) : u;
  return { pos: cr3(k0.pos, k1.pos, k2.pos, k3.pos, uu), tgt: cr3(k0.tgt, k1.tgt, k2.tgt, k3.tgt, uu), fov: 30 };
};

const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ── World state per time ─────────────────────────────────────────────────────────────────
const worldAt = (s: number) => {
  const retract = remap(s, SEC.KONTEKS[0] - 0.1, A.kebanyakan + 0.5); // pipe rolls back for the septic-tank homes
  const draw = remap(s, A.berpipa + 0.2, A.kloset + 0.6); // ... and is laid again in sewered areas
  const sewer = s < A.berpipa ? 1 - retract : draw;
  const septic = s < A.berpipa ? remap(s, A.kebanyakan + 0.3, A.kebanyakan + 0.9) : 1 - remap(s, A.berpipa - 0.1, A.berpipa + 0.5);
  const arrows = Math.max(remap(s, A.syarat, A.syarat + 0.5) * (1 - remap(s, SEC.HOOK[1] + 0.3, SEC.HOOK[1] + 0.8)), remap(s, SEC.MEKANISME[0] - 0.2, SEC.MEKANISME[0] + 0.3) * (1 - remap(s, A.dasar - 0.3, A.dasar)), remap(s, BACK_CUT, BACK_CUT + 0.4) * (1 - remap(s, SEC.REVEAL[1], SEC.REVEAL[1] + 0.4)));
  return {
    sewer,
    septic,
    arrows,
    grit: remap(s, A.pasir - 0.3, A.pasir + 2.5),
    eat: remap(s, W("memakan") + 0.1, W("memakan") + 2.4),
    ras: remap(s, BACK_CUT + 0.1, BACK_CUT + 1.0),
    uv: remap(s, A.desinfeksi - 0.2, A.desinfeksi + 0.6),
  };
};

const pop = (s: number, a: number, b: number, d = 0.45) => Math.min(remap(s, a, a + d), 1 - remap(s, b, b + 0.3));

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = frame / fps;
  const c = camAt(s);
  const w = worldAt(s);
  const micro = s >= ZOOM_CUT && s < BACK_CUT;
  const d = dist(c.pos, c.tgt);
  const shot: Shot = { pos: c.pos, target: c.tgt, fov: c.fov, focus: d, aperture: micro ? 0.0012 : 0.0003, maxBlur: micro ? 0.006 : 0.002 };
  return (
    <AbsoluteFill style={{ backgroundColor: DAY.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 30, position: [0, 20, 70] }}>
        <Stage shot={shot} light={DAY} frame={frame} center={micro ? M(4, 0, 0) : [c.tgt[0], Math.max(-9, c.tgt[1]), c.tgt[2]]}>
          {micro ? (
            <MicroSet s={s} eat={w.eat} />
          ) : (
            <group>
              <Diorama s={s} film={{ sewer: w.sewer, lite: true }} />
              <SepticTank t={w.septic} s={s} />
              <PlantExtension s={s} grit={w.grit} />
              <FlowArrows s={s} on={w.arrows} />
              <RasLine s={s} t={w.ras} />
              <UvChannel s={s} t={w.uv} />
              <RiverSign t={remap(s, SEC.OUTRO[0] - 0.2, SEC.OUTRO[0] + 0.3)} />
              <Tag text="TANGKI SEPTIK" position={[-6.8, 0, -2.5]} t={pop(s, A.kebanyakan + 0.6, A.berpipa - 0.2)} w={2.3} stick={0.5} />
              <Tag text="KAMAR MANDI" position={[-8.2, 0, -2.5]} t={pop(s, A.kloset - 1.2, SEC.KONTEKS[1])} w={1.9} stick={0.5} color="cobaltDeep" />
              <Tag text="KLOSET" position={[-4.2, 0, -2.5]} t={pop(s, A.kloset - 0.1, SEC.KONTEKS[1])} w={1.4} stick={0.5} color="cobaltDeep" />
              <Tag text="SARINGAN BATANG" position={[SCREEN_X + 1.7, y0, 6.9]} t={pop(s, A.saringan - 0.3, SEC.MEKANISME[1] + 0.3)} w={2.4} />
              <Tag text="BAK PASIR" position={[13.7, y0, 7.0]} t={pop(s, A.pasir - 0.3, SEC.REVEAL[0])} w={2.0} />
              <Tag text="BAK PENGENDAP" position={[18.6, y0, 7.0]} t={pop(s, A.berat - 0.6, SEC.REVEAL[0] + 0.6)} w={2.4} />
              <Tag text="BAK AERASI" position={[4.4, y0 + 2.3, 1.2]} t={pop(s, A.mikroba - 0.4, A.dasar + 0.3)} w={2.2} />
              <Tag text="LUMPUR BALIK" position={[-3.2, y0, 7.8]} t={pop(s, BACK_CUT + 0.6, SEC.REVEAL[1] + 0.3)} w={2.2} stick={1.3} />
              <Tag text="DESINFEKSI UV" position={[-8.4, y0 + 1.2, 4.6]} t={pop(s, A.desinfeksi - 0.2, A.sungaiAkhir + 0.6)} w={2.4} stick={1.1} />
            </group>
          )}
        </Stage>
        <Finish frame={frame} background={DAY.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} ao />
      </ThreeCanvas>
      <MicroLabel s={s} />
      <BodMeter s={s} />
      <Captions s={s} />
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};

// ── HUD: paper cards ─────────────────────────────────────────────────────────────────────
const INK = "#3b2a22";
const CORAL = "#c4614f";
const FONT = "'Arial Black', Arial, sans-serif";

const Card: React.FC<{ k: number; o: number; children: React.ReactNode; top: number; w: number }> = ({ k, o, children, top, w }) => (
  <div style={{ position: "absolute", left: (1080 - w) / 2 * k, top: top * k, width: w * k, opacity: o, transform: `translateY(${(1 - o) * 30 * k}px) rotate(-0.8deg)`, background: "#faf4e8", borderRadius: 10 * k, boxShadow: `0 ${6 * k}px 0 #e5d8c1, 0 ${14 * k}px ${30 * k}px rgba(59,42,34,0.25)`, padding: `${22 * k}px ${30 * k}px`, color: INK, fontFamily: FONT }}>
    {children}
  </div>
);

const MicroLabel: React.FC<{ s: number }> = ({ s }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  if (s < ZOOM_CUT || s > BACK_CUT) return null;
  const jak = s >= A.jakarta - 0.1;
  const o = Math.min(remap(s, ZOOM_CUT + 0.1, ZOOM_CUT + 0.5), 1 - remap(s, BACK_CUT - 0.3, BACK_CUT));
  return (
    <Card k={k} o={o} top={268} w={640}>
      <div style={{ fontSize: 24 * k, letterSpacing: 5 * k, color: CORAL }}>{jak ? "JAKARTA · MBBR" : "PERBESARAN"}</div>
      <div style={{ fontSize: 40 * k, lineHeight: 1.1, marginTop: 8 * k }}>{jak ? "Bakteri menempel di potongan plastik" : "Bakteri memakan kotoran terlarut"}</div>
    </Card>
  );
};

const BodMeter: React.FC<{ s: number }> = ({ s }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  const a = A.krukut - 0.2, b = A.desinfeksi - 0.1;
  if (s < a || s > b + 0.4) return null;
  const o = Math.min(remap(s, a, a + 0.5), 1 - remap(s, b, b + 0.4));
  const drop = ease.inOut(remap(s, A.turun, A.tiga + 0.6));
  const v = 150 - (150 - 28) * drop;
  const done = s >= A.tiga + 0.6;
  const fill = v / 180;
  return (
    <Card k={k} o={o} top={268} w={800}>
      <div style={{ fontSize: 24 * k, letterSpacing: 5 * k, color: CORAL }}>BOD · IPAL KRUKUT</div>
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 27 * k, marginTop: 6 * k, color: "#6b5547" }}>ukuran kotoran yang mencuri oksigen sungai</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * k, marginTop: 14 * k }}>
        <div style={{ fontSize: 96 * k, lineHeight: 1, color: done ? "#4f8f78" : INK }}>{done ? "<30" : drop > 0 ? `${Math.round(v)}` : "±150"}</div>
        <div style={{ fontSize: 34 * k }}>mg/L</div>
      </div>
      <div style={{ marginTop: 16 * k, height: 34 * k, borderRadius: 17 * k, background: "#e5d8c1", overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 17 * k, background: done ? "#6eaa93" : "#8c6c47" }} />
        <div style={{ position: "absolute", left: `${(30 / 180) * 100}%`, top: 0, bottom: 0, width: 4 * k, background: INK }} />
      </div>
      <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 25 * k, marginTop: 10 * k, color: "#6b5547" }}>masuk ±150 → keluar &lt;30 mg/L</div>
    </Card>
  );
};

// ── Karaoke captions on a paper strip ────────────────────────────────────────────────────
type Chunk = { words: Word[]; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((c, ci) => {
    const n = c.words.length;
    const parts = Math.ceil(n / 6);
    const base = Math.floor(n / parts), extra = n % parts;
    let i = 0;
    for (let p = 0; p < parts; p++) {
      const len = base + (p < extra ? 1 : 0);
      out.push({ words: c.words.slice(i, i + len), start: c.words[i].s, end: 0 });
      i += len;
    }
    void ci;
  });
  for (let i = 0; i < out.length; i++) out[i].end = i + 1 < out.length ? out[i + 1].start : out[i].words[out[i].words.length - 1].e + 0.4;
  for (let i = 0; i < out.length; i++) {
    const last = out[i].words[out[i].words.length - 1].e;
    out[i].end = Math.min(out[i].end, last + 0.6);
  }
  return out;
})();

const Captions: React.FC<{ s: number }> = ({ s }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  if (s >= OUTRO_AT) return null;
  const ch = CHUNKS.find((c) => s >= c.start - 0.05 && s < c.end);
  if (!ch) return null;
  const n = ch.words.length;
  const chars = ch.words.reduce((a, wd) => a + wd.w.length + 1, 0);
  const two = n > 4 || (n >= 4 && chars > 27);
  const lines = two ? [ch.words.slice(0, Math.ceil(n / 2)), ch.words.slice(Math.ceil(n / 2))] : [ch.words];
  const appear = remap(s, ch.start - 0.05, ch.start + 0.12);
  const longest = Math.max(...lines.map((ln) => ln.reduce((a, wd) => a + wd.w.length, 0) + (ln.length - 1) * 0.8));
  const fs = Math.max(42, Math.min(52, 820 / (longest * 0.74)));
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, bottom: 410 * k, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#faf4e8", borderRadius: 10 * k, padding: `${16 * k}px ${30 * k}px ${14 * k}px`, boxShadow: `0 ${5 * k}px 0 #e5d8c1, 0 ${12 * k}px ${26 * k}px rgba(59,42,34,0.28)`, transform: `rotate(-0.6deg) translateY(${(1 - appear) * 14 * k}px)`, opacity: appear }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", columnGap: 24 * k, lineHeight: 1.18 }}>
            {ln.map((wd, wi) => {
              const active = s >= wd.s && s < wd.e + 0.08;
              const said = s >= wd.s;
              const b = active ? 1 + 0.04 * Math.sin(Math.PI * clamp((s - wd.s) / 0.2)) : 1;
              return (
                <span key={wi} style={{ fontFamily: FONT, fontSize: fs * k, color: active ? CORAL : said ? INK : "#9d8a7c", transform: `scale(${b})`, display: "inline-block" }}>
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
