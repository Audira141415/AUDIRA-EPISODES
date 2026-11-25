// SEJARAH MAKKAH · EP04 — Kiswah. The 16:9 long-form master and the two 9:16 shorts.
// The voice (timeline.json) is the master clock. The shorts re-render the same world in 9:16: their
// clock maps onto long-film time through short0N.json (hook and outro hold a chosen moment).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { useFormat } from "../../core/film/format.ts";
import { World } from "./World.tsx";
import { Captions, ChapterCard, EndFrames, Outro, paginate, Vignette } from "./Overlays.tsx";
import { PAL } from "./kit.tsx";
import { CLIPS, ease, TOTAL, VO_END, type Word } from "./tl.ts";
import S1 from "./short01.json";
import S2 from "./short02.json";

export const KISWAH_TOTAL = TOTAL;
const WIDE_PAGES = paginate(
  CLIPS.flatMap((c) => c.words),
  12,
);

export const KiswahWide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: PAL.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 3, 3], fov: 34, near: 0.05, far: 140 }}>
        <World t={t} frame={frame} />
      </ThreeCanvas>
      <Vignette />
      <ChapterCard t={t} />
      {t < VO_END + 0.5 && <Captions t={t} pages={WIDE_PAGES} mode="wide" />}
      <EndFrames t={t} from={VO_END + 0.4} to={TOTAL} />
      <Outro t={t} from={TOTAL - 3} />
      <AudiraSignature seed="sejarah-makkah-ep04" handle="@audira" />
    </AbsoluteFill>
  );
};

// ---------- shorts ----------
export type ShortDef = {
  id: string;
  duration: number;
  hookSrc: number;
  bodyStart: number;
  bodyEnd: number;
  srcStart: number;
  srcEnd: number;
  endCardFrom: number;
  outroFrom: number;
  words: Word[];
};
export const SHORTS: Record<string, ShortDef> = { short01: S1 as ShortDef, short02: S2 as ShortDef };

const srcTime = (d: ShortDef, t: number) => {
  if (t < d.bodyStart) return d.hookSrc + t * 0.25;
  if (t <= d.bodyEnd) return d.srcStart + (t - d.bodyStart);
  return d.srcEnd + (t - d.bodyEnd) * 0.3;
};

const EndCard: React.FC<{ t: number; from: number; to: number }> = ({ t, from, to }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (t < from || t > to + 0.3) return null;
  const a = ease(t, from, 0.4) * (1 - ease(t, to - 0.1, 0.3));
  return (
    <div style={{ position: "absolute", left: 70 * s, right: 70 * s, top: 640 * s, opacity: a, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: `${28 * s}px ${36 * s}px`, background: "rgba(10,7,8,0.82)", border: `${3 * s}px solid ${PAL.gold}`, outline: `${2 * s}px dashed rgba(227,169,62,0.55)`, outlineOffset: `${-12 * s}px`, textAlign: "center" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 26 * s, letterSpacing: 4 * s, color: PAL.gold }}>SEJARAH MAKKAH · EP04</div>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 60 * s, lineHeight: 1.1, color: PAL.cream, marginTop: 12 * s }}>Tonton video panjangnya di YouTube Audira</div>
      </div>
    </div>
  );
};

const HookTitle: React.FC<{ t: number; to: number; title: string }> = ({ t, to, title }) => {
  const fmt = useFormat();
  const s = fmt.scale;
  if (t > to + 0.4) return null;
  const a = ease(t, 0, 0.25) * (1 - ease(t, to - 0.3, 0.5));
  return (
    <div style={{ position: "absolute", left: 64 * s, right: 64 * s, top: 200 * s, opacity: a }}>
      <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 26 * s, letterSpacing: 5 * s, color: PAL.gold, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>SEJARAH MAKKAH · EP04</div>
      <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 92 * s, lineHeight: 1.0, color: PAL.cream, marginTop: 12 * s, textShadow: "0 3px 22px rgba(0,0,0,0.9)" }}>{title}</div>
    </div>
  );
};

const makeShort = (id: string, title: string): React.FC => {
  const C: React.FC = () => {
    const d = SHORTS[id];
    const pages = paginate(d.words, 5);
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const t = frame / fps;
    const src = srcTime(d, t);
    return (
      <AbsoluteFill style={{ background: PAL.bg }}>
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 3, 3], fov: 34, near: 0.05, far: 140 }}>
          <World t={src} frame={frame} pull={1.5} exposure={1.0} aperture={0.0011} pool={4.5} />
        </ThreeCanvas>
        <Vignette strength={0.8} />
        <HookTitle t={t} to={d.bodyStart} title={title} />
        {t < d.outroFrom && <Captions t={t} pages={pages} mode="short" />}
        <EndCard t={t} from={d.endCardFrom} to={d.outroFrom} />
        <Outro t={t} from={d.outroFrom} />
        <AudiraSignature seed={`sejarah-makkah-ep04-${id}`} handle="@audira" />
      </AbsoluteFill>
    );
  };
  return C;
};

export const KiswahShort01 = makeShort("short01", "Benang Emas yang Bukan Emas");
export const KiswahShort02 = makeShort("short02", "1927: Kiswah Tidak Datang");
