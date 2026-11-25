// SEJARAH MAKKAH · EP01 — "Ka'bah dibangun ulang berkali-kali" (TIMEFORGE).
// One world, one voice clock: the long-form 16:9 film and two 9:16 shorts re-rendered from the
// same scenes. World time `tw` is always seconds of audio/vo.wav; shorts map their own clock onto it.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { useFormat } from "../../core/film/format.ts";
import { FONT } from "../../core/type/fonts.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { C, CH, TL, W, type V3, type Word, clamp01, mix, ramp, window01 } from "./core.tsx";
import { type Pose, sampleKeys } from "./camera.ts";
import { Backdrop, Floor, Lights, MainStage, Paths, RING_ERAS, ringEraPos } from "./world.tsx";
import { COVER_POSE, keys00 } from "./ch00.ts";
import { Ibrahim, keys02 } from "./ch02.tsx";
import { Quraisy, keys03, nightOf } from "./ch03.tsx";
import { HijrChapter, hijrGlowOf, keys04 } from "./ch04.tsx";
import { Zubair, hazeOf, keys05, keys06zubair } from "./ch05.tsx";
import { Hajjaj, keys06 } from "./ch06.tsx";
import { Fragments, Kufah, keys07, mainOf07 } from "./ch07.tsx";
import { Rebuild, keys08, stormOf } from "./ch08.tsx";
import { Ghost, keys09 } from "./ch09.tsx";
import { LINE, Lineup, Qibla, keys10, linePin } from "./ch10.tsx";
import { CALLOUTS, CARDS } from "./story.ts";
import S01 from "./short01.json";
import S02 from "./short02.json";

export const LONG_SECONDS = TL.total;
const KEYS = [...keys00(), ...keys02(), ...keys03(), ...keys04(), ...keys05(), ...keys06(), ...keys06zubair(), ...keys07(), ...keys08(), ...keys09(), ...keys10()];
export const poseAt = (tw: number): Pose => sampleKeys(KEYS, tw);

// ---------------------------------------------------------------- 3D
const inWin = (t: number, a: number, b: number) => t >= a && t <= b;
const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.tgt);
    cam.fov = pose.fov;
    cam.near = 0.1;
    cam.far = 2500;
    cam.updateProjectionMatrix();
  });
  return null;
};

const World: React.FC<{ tw: number; pose: Pose; frame: number }> = ({ tw, pose, frame }) => {
  const q = mainOf07(tw);
  const night = clamp01(nightOf(tw) + q.cool + stormOf(tw) * 0.5);
  const haze = hazeOf(tw);
  const intro = window01(tw, CH("c01").start, CH("c02").start, 1, 1.5);
  return (
    <>
      <Rig pose={pose} />
      <Backdrop />
      <fog attach="fog" args={[new THREE.Color(C.fog).lerp(new THREE.Color("#b9bdc8"), night * 0.6).lerp(new THREE.Color("#e6c39a"), haze * 0.5), 40, 190]} />
      <Lights target={pose.tgt} night={night} haze={haze} />
      <Floor />
      <Paths />
      <MainStage m={{ t: tw, hajar: q.hajar, crowdDim: q.crowdDim, ringGlow: intro, ticksLit: tw < CH("c02").start ? 8 * ramp(tw, CH("c01").start + 6, CH("c01").start + 9) : 8, hijrGlow: hijrGlowOf(tw) }}>
        <HijrChapter t={tw} />
        <Fragments t={tw} />
        <Qibla t={tw} />
      </MainStage>
      {/* a station exists only around its chapters, so far sets never clutter another shot */}
      {inWin(tw, W("c01", "jelas") - 0.5, CH("c03").start + 3) ? <Ibrahim t={tw} /> : null}
      {inWin(tw, CH("c02").end - 3, CH("c04").start + 3) ? <Quraisy t={tw} /> : null}
      {inWin(tw, CH("c04").end - 3, CH("c07").start + 3) ? <Zubair t={tw} /> : null}
      {inWin(tw, CH("c05").end - 3, CH("c07").start + 3) ? <Hajjaj t={tw} /> : null}
      {inWin(tw, W("c07", "emir") - 4, CH("c08").start) ? <Kufah t={tw} /> : null}
      {inWin(tw, CH("c07").end - 3, CH("c09").start + 3) ? <Rebuild t={tw} /> : null}
      {inWin(tw, CH("c08").end - 3, CH("c10").start + 3) ? <Ghost t={tw} /> : null}
      {inWin(tw, CH("c09").end - 3, W("c10", "masa", 1) + 3) ? <Lineup t={tw} /> : null}
      <Finish frame={frame} hdri="warmStudio" envIntensity={0.5} exposure={mix(0.87, 0.78, night)} profile={COLOR_PROFILES.DOCUMENTARY_WARM} aoRadius={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2D helpers
const project = (p: V3, pose: Pose, fov: number, w: number, h: number) => {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 2500);
  cam.position.set(...pose.pos);
  cam.lookAt(...pose.tgt);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z };
};

const Pill: React.FC<{ x: number; y: number; s: number; year: string; desc: string; op: number; hi?: number; below?: boolean }> = ({ x, y, s, year, desc, op, hi = 0, below }) => (
  <div
    style={{
      position: "absolute", left: x * s, top: y * s, transform: below ? "translate(-50%, 0%)" : "translate(-50%, -100%)", opacity: op,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2 * s, padding: `${8 * s}px ${18 * s}px`, borderRadius: 999,
      background: `rgba(250,246,239,${0.86 + 0.1 * hi})`, border: `${1.5 * s}px solid rgba(184,144,63,${0.55 + 0.45 * hi})`, boxShadow: `0 ${6 * s}px ${18 * s}px rgba(80,60,30,0.14)`, whiteSpace: "nowrap",
    }}
  >
    <span style={{ fontWeight: 600, fontSize: 25 * s, letterSpacing: 1.2 * s, color: C.ink }}>{year}</span>
    <span style={{ fontWeight: 400, fontSize: 17 * s, color: C.inkSoft }}>{desc}</span>
  </div>
);

/** Year pills pinned to 3D points: the ring eras around the cover frame, and the payoff lineup. */
const Pins: React.FC<{ tw: number; pose: Pose }> = ({ tw, pose }) => {
  const fmt = useFormat();
  const W0 = fmt.layout.width, H0 = fmt.layout.height, s = fmt.scale, fov = fmt.fov(pose.fov);
  const inSafe = (x: number, y: number) => x > fmt.safe.left + 80 && x < W0 - fmt.safe.right - 80 && y > fmt.safe.top + 40 && y < H0 - fmt.safe.bottom - 60;
  const out: React.ReactNode[] = [];
  const ringOp = 1 - ramp(tw, 4.2, 5.4);
  if (ringOp > 0.01)
    RING_ERAS.forEach((e) => {
      const [x, , z] = ringEraPos(e.deg);
      const back = Math.cos((e.deg * Math.PI) / 180) < 0;
      const q = back ? project([x * 1.18, -0.2, z * 0.9], pose, fov, W0, H0) : project([x, 2.05, z], pose, fov, W0, H0);
      if (q.z < 1 && inSafe(q.x, q.y) && !(fmt.isWide && q.x < 900)) out.push(<Pill key={e.id} x={q.x} y={q.y} s={s} year={e.year} desc={e.desc} op={ringOp} below={back} />);
    });
  const lineOp = window01(tw, CH("c10").start + 1.2, CH("c10").start + 24, 0.8, 1.2);
  if (lineOp > 0.01)
    LINE.forEach((l, i) => {
      const q = project(linePin(i), pose, fov, W0, H0);
      const st = [W("c10", "ka'bah", 0), W("c10", "ka'bah", 1), W("c10", "ka'bah", 2), W("c10", "lalu"), W("c10", "kemudian"), W("c10", "bentuknya")];
      const hi = window01(tw, st[i], st[i + 1], 0.3, 0.3);
      if (q.z < 1 && inSafe(q.x, q.y)) out.push(<Pill key={`l${i}`} x={q.x} y={q.y - 10} s={s} year={l.year} desc={l.desc} op={lineOp * (0.75 + 0.25 * hi)} hi={hi} />);
    });
  return <>{out}</>;
};

const ChapterCard: React.FC<{ tw: number }> = ({ tw }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const card = CARDS().find((c) => tw >= c.t - 0.2 && tw < c.t + 3.6);
  if (!card) return null;
  const k = window01(tw, card.t - 0.2, card.t + 3.6, 0.5, 0.6);
  const left = fmt.isWide ? fmt.safe.left + 24 : 60;
  // below the AUDIRA signature anchors (16:9 y ≈ 76 px)
  const top = fmt.isWide ? fmt.safe.top + 110 : fmt.safe.top + 120;
  return (
    <div style={{ position: "absolute", left: left * s, top: top * s, opacity: k, transform: `translateY(${(1 - k) * 14 * s}px)`, color: C.ink }}>
      <div style={{ fontWeight: 600, fontSize: 22 * s, letterSpacing: 6 * s, color: C.goldDeep }}>{card.num} · {card.year}</div>
      <div style={{ marginTop: 10 * s, fontWeight: 600, fontSize: (fmt.isWide ? 58 : 54) * s, lineHeight: 1.05, letterSpacing: -1 * s, maxWidth: (fmt.isWide ? 1000 : 900) * s, textShadow: "0 2px 18px rgba(240,233,221,0.9)" }}>{card.title}</div>
      <div style={{ marginTop: 14 * s, width: 120 * s * k, height: 3 * s, background: C.brass }} />
    </div>
  );
};

const Callouts: React.FC<{ tw: number }> = ({ tw }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const list = CALLOUTS().filter((c) => tw >= c.t0 - 0.3 && tw <= c.t1 + 0.4).slice(-1);
  return (
    <>
      {list.map((c, i) => {
        const k = window01(tw, c.t0 - 0.3, c.t1 + 0.4, 0.4, 0.4);
        const wide = fmt.isWide;
        return (
          <div
            key={i}
            style={{
              position: "absolute", right: (wide ? fmt.safe.right + 10 : 60) * s, top: (wide ? fmt.safe.top + 110 : 560) * s, maxWidth: (wide ? 620 : 860) * s,
              opacity: k, transform: `translateX(${(1 - k) * 24 * s}px)`, padding: `${18 * s}px ${26 * s}px`, borderRadius: 18 * s,
              background: "rgba(250,246,239,0.9)", border: `${1.5 * s}px solid rgba(184,144,63,0.6)`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(80,60,30,0.16)`, color: C.ink,
            }}
          >
            <div style={{ fontWeight: c.quote ? 500 : 600, fontSize: (c.quote ? 30 : 40) * s, lineHeight: 1.15, fontStyle: c.quote ? "italic" : "normal" }}>{c.title}</div>
            {c.sub ? <div style={{ marginTop: 8 * s, fontWeight: 400, fontSize: 22 * s, color: C.inkSoft, lineHeight: 1.3 }}>{c.sub}</div> : null}
          </div>
        );
      })}
    </>
  );
};

/** Long-form captions: calm, 1-2 lines bottom centre, active word in gold. */
type Page = { words: Word[]; s: number; e: number };
const pagesFrom = (words: Word[], maxChars: number, breakAt: number[] = []): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [], len = 0;
  words.forEach((w, i) => {
    const forced = breakAt.includes(i);
    if (cur.length && (len + w.w.length + 1 > maxChars || forced)) {
      pages.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = []; len = 0;
    }
    cur.push(w); len += w.w.length + 1;
    if (/[.?!]$/.test(w.w) && len > maxChars * 0.55) {
      pages.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
      cur = []; len = 0;
    }
  });
  if (cur.length) pages.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  return pages;
};
const LONG_PAGES: Page[] = (() => {
  const all: Page[] = [];
  for (const c of TL.clips) all.push(...pagesFrom(c.words, 78));
  return all;
})();

const Captions: React.FC<{ t: number; pages: Page[]; short?: boolean }> = ({ t, pages, short }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  let idx = -1;
  for (let i = 0; i < pages.length; i++) if (pages[i].s - 0.15 <= t) idx = i;
  if (idx < 0) return null;
  const p = pages[idx];
  const next = pages[idx + 1];
  const end = Math.min(p.e + 0.7, next ? next.s - 0.15 : p.e + 0.7);
  if (t > end) return null;
  const fs = short ? 64 : 40;
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: (short ? fmt.safe.bottom + 30 : fmt.safe.bottom + 14) * s, display: "flex", justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: (short ? 900 : 1340) * s, textAlign: "center", padding: `${(short ? 14 : 10) * s}px ${(short ? 24 : 28) * s}px`, borderRadius: 16 * s,
          background: short ? "rgba(29,26,22,0.72)" : "rgba(29,26,22,0.6)", fontWeight: 600, fontSize: fs * s, lineHeight: 1.28, color: "#f6f1e7",
        }}
      >
        {p.words.map((w, i) => {
          const active = t >= w.s - 0.03 && t < w.e + 0.05;
          const said = t >= w.e;
          return (
            <span
              key={i}
              style={{
                display: "inline-block", marginRight: `${short ? 0.42 : 0.3}em`, color: active ? "#f4c25a" : said ? "#f6f1e7" : "rgba(246,241,231,0.62)",
                transform: short && active ? "scale(1.04)" : undefined, transformOrigin: "center",
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

const CoverTitle: React.FC<{ op: number }> = ({ op }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (op <= 0.01) return null;
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: op,
          background: fmt.isWide
            ? "linear-gradient(90deg, rgba(240,233,221,0.95) 0%, rgba(240,233,221,0.86) 36%, rgba(240,233,221,0) 57%)"
            : "linear-gradient(180deg, rgba(240,233,221,0.95) 0%, rgba(240,233,221,0.75) 22%, rgba(240,233,221,0) 34%)",
        }}
      />
      <div style={{ position: "absolute", opacity: op, left: (fmt.isWide ? fmt.safe.left + 24 : 0) * s, right: fmt.isWide ? undefined : 0, top: (fmt.isWide ? 250 : fmt.safe.top + 40) * s, width: fmt.isWide ? 820 * s : undefined, textAlign: fmt.isWide ? "left" : "center", color: C.ink }}>
        <div style={{ fontWeight: 600, fontSize: 26 * s, letterSpacing: 7 * s, color: C.goldDeep, marginBottom: 22 * s }}>SEJARAH MAKKAH · EP01</div>
        <div style={{ fontWeight: 600, fontSize: (fmt.isWide ? 104 : 112) * s, lineHeight: 1.0, letterSpacing: -2 * s }}>
          KA'BAH TIDAK
          <br />
          SELALU
          <br />
          <span style={{ color: C.goldDeep }}>SEPERTI INI</span>
        </div>
      </div>
    </>
  );
};

const EndScreen: React.FC<{ tw: number }> = ({ tw }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  const k = window01(tw, TL.voEnd + 0.4, TL.total - 3, 0.8, 0.4);
  if (k <= 0.01 || !fmt.isWide) return null;
  const box = (left: boolean) => (
    <div style={{ position: "absolute", top: 300 * s, [left ? "left" : "right"]: 160 * s, width: 560 * s, height: 316 * s, borderRadius: 14 * s, border: `${2 * s}px dashed rgba(140,106,38,0.55)`, background: "rgba(250,246,239,0.22)" } as React.CSSProperties} />
  );
  return (
    <AbsoluteFill style={{ opacity: k }}>
      {box(true)}
      {box(false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: (fmt.safe.top + 50) * s, textAlign: "center", fontWeight: 600, fontSize: 30 * s, letterSpacing: 6 * s, color: C.goldDeep }}>SEJARAH MAKKAH · AUDIRA</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ k: number }> = ({ k }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (k <= 0.001) return null;
  const logoW = (fmt.isWide ? 420 : 520) * s;
  return (
    <AbsoluteFill style={{ background: C.green, opacity: k, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: logoW, transform: `scale(${0.96 + 0.04 * k})` }} />
      <div style={{ marginTop: 34 * s, color: "#e8f3ee", fontFamily: FONT, fontWeight: 500, fontSize: 30 * s, letterSpacing: 2 * s }}>Created by Agus Dwi R.</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- long-form composition
/** The approved 16:9 cover framing (KabahCover, wide): the film opens on it, then joins the keys. */
const WIDE_COVER: Pose = { pos: [2, 17.5, 36], tgt: [-6.8, -0.9, 0], fov: 31 };
const blendPose = (a: Pose, b: Pose, k: number): Pose => ({
  pos: [mix(a.pos[0], b.pos[0], k), mix(a.pos[1], b.pos[1], k), mix(a.pos[2], b.pos[2], k)],
  tgt: [mix(a.tgt[0], b.tgt[0], k), mix(a.tgt[1], b.tgt[1], k), mix(a.tgt[2], b.tgt[2], k)],
  fov: mix(a.fov, b.fov, k),
});

export const KabahLong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fmt = useFormat();
  const tw = frame / fps;
  const keyed = poseAt(tw);
  const pose = fmt.isWide ? blendPose(WIDE_COVER, keyed, ramp(tw, CH("c00").start + 0.3, W("c00", "bukan", 1))) : keyed;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 30, near: 0.1, far: 2500, position: COVER_POSE.pos }}>
        <World tw={tw} pose={pose} frame={frame} />
      </ThreeCanvas>
      <AbsoluteFill>
        <CoverTitle op={1 - ramp(tw, 4.6, 5.6)} />
        <Pins tw={tw} pose={pose} />
        <ChapterCard tw={tw} />
        <Callouts tw={tw} />
        {tw < TL.voEnd + 0.5 ? <Captions t={tw} pages={LONG_PAGES} /> : null}
        <EndScreen tw={tw} />
        <Outro k={ramp(tw, TL.total - 3, TL.total - 2.4)} />
      </AbsoluteFill>
      <AudiraSignature seed="sejarah-makkah-ep01" handle="@audira" color="#3a3026" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shorts
type ShortJson = { id: string; duration: number; narrationEnd: number; segments: { part: string; at: number; len: number; world?: number; src0?: number }[]; words: (Word & { part: string })[] };
const SHORTS: Record<string, ShortJson> = { short01: S01 as ShortJson, short02: S02 as ShortJson };
export const shortSeconds = (id: string) => SHORTS[id].duration;

const shortWorld = (sh: ShortJson, ts: number) => {
  const [hook, body, outro] = sh.segments;
  if (ts < body.at) return (hook.world ?? 0) + ts * 0.12;
  if (ts < outro.at) return (body.src0 ?? 0) + (ts - body.at);
  return (outro.world ?? 0) + (ts - outro.at) * 0.4;
};

const EndCard: React.FC<{ k: number }> = ({ k }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (k <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 640 * s, opacity: k, transform: `translateY(${(1 - k) * 20 * s}px)`, textAlign: "center", padding: `${30 * s}px ${30 * s}px`, borderRadius: 26 * s, background: "rgba(250,246,239,0.92)", border: `${2 * s}px solid rgba(184,144,63,0.7)`, color: C.ink }}>
      <div style={{ fontWeight: 600, fontSize: 24 * s, letterSpacing: 6 * s, color: C.goldDeep }}>SEJARAH MAKKAH · EP01</div>
      <div style={{ marginTop: 14 * s, fontWeight: 600, fontSize: 58 * s, lineHeight: 1.1 }}>Tonton video panjangnya di YouTube Audira</div>
    </div>
  );
};

const HOOK_TITLE: Record<string, [string, string]> = { short01: ["KA'BAH SEHARUSNYA", "LEBIH BESAR"], short02: ["22 TAHUN TANPA", "HAJAR ASWAD"] };
const HookTitle: React.FC<{ id: string; k: number }> = ({ id, k }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (k <= 0.01) return null;
  const [a, b] = HOOK_TITLE[id];
  return (
    <>
      <AbsoluteFill style={{ opacity: k, background: "linear-gradient(180deg, rgba(240,233,221,0.92) 0%, rgba(240,233,221,0.7) 28%, rgba(240,233,221,0) 40%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: (fmt.safe.top + 120) * s, textAlign: "center", opacity: k, color: C.ink }}>
        <div style={{ fontWeight: 600, fontSize: 24 * s, letterSpacing: 7 * s, color: C.goldDeep, marginBottom: 16 * s }}>SEJARAH MAKKAH · EP01</div>
        <div style={{ fontWeight: 600, fontSize: 92 * s, lineHeight: 1.0, letterSpacing: -2 * s }}>
          {a}
          <br />
          <span style={{ color: C.goldDeep }}>{b}</span>
        </div>
      </div>
    </>
  );
};

const ShortFilm: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sh = SHORTS[id];
  const ts = frame / fps;
  const tw = shortWorld(sh, ts);
  const base = poseAt(tw);
  // 9:16 framing: the long-form keys are framed for the 16:9 width; step back a little for the short
  const pose: Pose = { ...base, pos: [base.tgt[0] + (base.pos[0] - base.tgt[0]) * 1.18, base.tgt[1] + (base.pos[1] - base.tgt[1]) * 1.18, base.tgt[2] + (base.pos[2] - base.tgt[2]) * 1.18] };
  const pages = useMemo(() => {
    const ws = sh.words;
    const breaks = ws.map((w, i) => (i > 0 && ws[i - 1].part !== w.part ? i : -1)).filter((i) => i > 0);
    return pagesFrom(ws, 22, breaks);
  }, [sh]);
  const outro = sh.segments[2];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <ThreeCanvas width={width} height={height} dpr={1} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 30, near: 0.1, far: 2500, position: COVER_POSE.pos }}>
        <World tw={tw} pose={pose} frame={frame} />
      </ThreeCanvas>
      <AbsoluteFill>
        <HookTitle id={id} k={1 - ramp(ts, sh.segments[1].at - 0.8, sh.segments[1].at)} />
        {ts >= sh.segments[1].at && ts < outro.at ? <Callouts tw={tw} /> : null}
        {ts < sh.narrationEnd + 0.4 ? <Captions t={ts} pages={pages} short /> : null}
        <EndCard k={window01(ts, outro.at, sh.duration - 2.9, 0.5, 0.4)} />
        <Outro k={ramp(ts, sh.duration - 3, sh.duration - 2.4)} />
      </AbsoluteFill>
      <AudiraSignature seed={`sejarah-makkah-ep01-${id}`} handle="@audira" color="#3a3026" />
    </AbsoluteFill>
  );
};

export const KabahShort01: React.FC = () => <ShortFilm id="short01" />;
export const KabahShort02: React.FC = () => <ShortFilm id="short02" />;
