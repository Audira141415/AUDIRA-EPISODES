// EP18 Bilal bin Rabah — PAPERWORLD 2D film (Remotion SVG/DOM, no R3F).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { displayFontsReady } from "../core/type/displayFonts";
import { manropeReady } from "../core/type/fonts";
import { AudiraOutro } from "../brand/AudiraOutro";
import { AudiraSignature } from "../brand/AudiraSignature";
import { SCENES, CALLOUTS, XFADE, OUTRO_SECONDS, FILM_SECONDS, type Callout, type SceneId } from "./timing";
import { SCENE_MAP } from "./scenes";
import { cam2d } from "./camera2d";
import { C, ease, ramp, mix, hash } from "./pieces";
import words from "../../public/audio/vo-words.json";

displayFontsReady();
manropeReady();

export const EP18_SECONDS = FILM_SECONDS;

// Key light (upper-left) + shade (lower-right) coloured per scene.
const GRADE: Record<SceneId, [string, string, number]> = {
  S1: ["255,238,190", "70,30,16", 0.5], S2: ["255,232,180", "60,36,30", 0.42], S3a: ["255,196,130", "50,14,20", 0.6], S3b: ["255,214,130", "70,20,20", 0.5],
  S4a: ["255,206,120", "60,24,10", 0.55], S4b: ["255,186,130", "44,24,64", 0.6], S5a: ["255,226,170", "30,34,44", 0.55], S5b: ["255,214,120", "30,20,50", 0.5],
  S6a: ["190,190,255", "14,14,50", 0.6], S6b: ["255,200,170", "50,20,60", 0.5], S6c: ["255,206,160", "24,18,56", 0.55], S7a: ["255,224,150", "66,28,20", 0.5],
  S7b: ["255,246,200", "50,60,30", 0.4], S8a: ["255,200,200", "46,26,80", 0.55], S8b: ["255,226,170", "40,28,80", 0.5],
};

const extrude = (n: number, col: string) => Array.from({ length: n }, (_, i) => `${i + 1}px ${((i + 1) * 1.35).toFixed(1)}px 0 ${mix(col, "#2A120A", 0.45)}`).join(",") + `,${n + 12}px ${n + 18}px 18px rgba(38,18,10,.42)`;
const CAST = "16px 22px 22px rgba(38,20,12,.40), 4px 6px 0 rgba(90,60,40,.55)";
const FIB = `url(${staticFile("tex/fibre.png")})`;
const COL: Record<string, string> = { terracotta: C.terracotta, indigo: C.indigo, teal: C.teal };

const CalloutView: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  const { fps } = useVideoConfig();
  if (t < c.t || t > c.until) return null;
  const sp = (d = 0) => spring({ frame: Math.max(0, t - c.t - d) * fps, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } });
  const pop = sp(), out = 1 - ramp(t, c.until - 0.22, c.until), lt = t - c.t;
  const x = c.x ?? 540, size = c.size ?? 80, rot = c.rot ?? 0;
  const at = (extra: string, o = 1): React.CSSProperties => ({ position: "absolute", left: x, top: c.y, transform: `translate(-50%,-50%) ${extra}`, opacity: out * o, textAlign: "center", fontFamily: "Anton", lineHeight: 1.06 });
  const ref = (col: string, s = 54) => (c.ref ? <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: s, letterSpacing: 2, marginTop: 8, color: col }}>{c.ref}</div> : null);
  const paper = (bg: string, col: string): React.CSSProperties => ({ backgroundColor: bg, backgroundImage: FIB, color: col, boxShadow: CAST });
  switch (c.kind) {
    case "letters":
      return (
        <div style={at("")}>
          <div style={{ whiteSpace: "nowrap", fontSize: size, letterSpacing: size * 0.03 }}>
            {[...c.text].map((ch, i) => {
              const k = sp(i * 0.05);
              return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color: c.col === "gold" ? (i % 2 ? "#F2BE52" : C.goldLt) : i % 2 ? "#8E3420" : "#9E3E26", transform: `translateY(${(1 - k) * 120}px) rotate(${(hash(i + c.t) - 0.5) * 9}deg) scale(${k})`, textShadow: extrude(Math.round(size / 19), c.col === "gold" ? C.gold : C.terraDk), WebkitTextStroke: `${size > 240 ? 3 : 2}px #FFF3CF` }}>{ch}</span>;
            })}
          </div>
          {c.ref ? <div style={{ display: "inline-block", ...paper(C.paper, C.ink), fontSize: 64, padding: "4px 30px 8px", marginTop: 14, transform: `rotate(-1.5deg) scale(${sp(0.2)})` }}>{c.ref}</div> : null}
        </div>
      );
    case "ribbon": {
      const w = `${(pop * 120 - 10).toFixed(1)}%`;
      const tail = mix(C.terraDk, "#1A0806", 0.2);
      return (
        <div style={{ ...at(`rotate(${rot || -2}deg)`), whiteSpace: "nowrap", fontSize: size, letterSpacing: 2, color: "#FFF6E2", filter: "drop-shadow(16px 22px 14px rgba(38,20,12,.42))" }}>
          <div style={{ position: "relative", padding: "8px 56px 16px", backgroundColor: C.terracotta, clipPath: `polygon(-10% -30%, ${w} -30%, ${w} 160%, -10% 160%)` }}>
            <div style={{ position: "absolute", left: -50, top: 26, width: 110, height: "100%", background: tail, clipPath: "polygon(0 0,100% 0,100% 100%,0 100%,34% 50%)" }} />
            <div style={{ position: "absolute", right: -50, top: 26, width: 110, height: "100%", background: tail, clipPath: "polygon(0 0,100% 0,66% 50%,100% 100%,0 100%)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundColor: C.terracotta, backgroundImage: FIB, borderTop: "4px solid #E59A78", borderBottom: "5px solid #6A2A1C" }} />
            <span style={{ position: "relative", textShadow: "3px 4px 0 rgba(60,16,8,.7)" }}>{c.text}</span>
          </div>
        </div>
      );
    }
    case "tag": {
      const sw = Math.sin(lt * 3.4) * 5 * Math.exp(-lt * 0.5) + Math.sin(lt * 1.6) * 1.2;
      return (
        <div style={{ ...at(`translateY(${(1 - pop) * -420}px) rotate(${sw}deg)`), transformOrigin: "50% -200px" }}>
          <div style={{ position: "absolute", left: "50%", bottom: "100%", width: 6, height: 700, marginLeft: -3, marginBottom: -26, background: "linear-gradient(90deg,#8A5A34,#C99A66)" }} />
          <div style={{ ...paper("#F6DFB2", C.ink), whiteSpace: "nowrap", fontSize: size, padding: "40px 44px 20px", borderRadius: 18, border: "5px solid #FFF3D6", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 12, width: 26, height: 26, marginLeft: -13, borderRadius: 13, background: "#6E4A33", border: "5px solid #B4573A", boxSizing: "border-box" }} />
            {c.text}
            {ref("#8C3F28")}
          </div>
        </div>
      );
    }
    case "plate": {
      const bg = COL[c.col ?? "indigo"] ?? C.indigo;
      return (
        <div style={{ ...at(`translateX(${(1 - pop) * (x < 540 ? -700 : 700)}px) rotate(${rot}deg)`), ...paper(bg, "#FFF3DA"), whiteSpace: "nowrap", fontSize: size, letterSpacing: 1.5, padding: "14px 44px 18px", border: "6px solid #E3A93B", outline: `10px solid ${mix(bg, "#000000", 0.25)}` }}>
          {c.text}
          {ref("#F8D680", 52)}
          {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: i ? undefined : 12, right: i ? 12 : undefined, top: "50%", marginTop: -8, width: 16, height: 16, borderRadius: 8, background: "#F8D680", boxShadow: "2px 3px 3px rgba(0,0,0,.5)" }} />)}
        </div>
      );
    }
    case "cite":
      return (
        <div style={{ ...at(`scale(${0.7 + 0.3 * pop}) rotate(-1deg)`, Math.min(1, pop * 2)), ...paper("#FFF7E8", "#5A2A1A"), whiteSpace: "nowrap", fontSize: size, letterSpacing: 1.5, padding: "10px 30px 14px 24px", borderLeft: `16px solid ${C.terracotta}`, display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={size * 0.95} height={size * 0.8} viewBox="0 0 60 50"><path d="M30,10 Q16,0 2,6 V44 Q16,38 30,48 Q44,38 58,44 V6 Q44,0 30,10Z" fill={C.gold} stroke="#5A2A1A" strokeWidth={4} /><path d="M30,10 V48" stroke="#5A2A1A" strokeWidth={4} /></svg>
          {c.text}
        </div>
      );
    case "note": {
      const n = 26, torn = `polygon(${Array.from({ length: n + 1 }, (_, i) => `${((i / n) * 100).toFixed(1)}% ${(hash(i + c.t) * 2.2).toFixed(1)}%`).join(",")},${Array.from({ length: n + 1 }, (_, i) => `${(100 - (i / n) * 100).toFixed(1)}% ${(100 - hash(i * 2.7 + c.t) * 4).toFixed(1)}%`).join(",")})`;
      return (
        <div style={{ ...at(`translateY(${(1 - pop) * 60}px) rotate(${rot + (1 - pop) * 10}deg)`, Math.min(1, pop * 2)), width: c.w, filter: "drop-shadow(16px 22px 14px rgba(38,20,12,.42))" }}>
          <div style={{ backgroundColor: "#FFF3DA", backgroundImage: FIB, color: C.ink, fontSize: size, padding: "34px 44px 36px", clipPath: torn, whiteSpace: c.w ? "normal" : "nowrap" }}>
            {c.text}
            {ref(C.terracotta, 54)}
          </div>
          <div style={{ position: "absolute", left: "50%", top: -14, width: 170, height: 46, marginLeft: -85, background: "rgba(227,169,59,.82)", transform: "rotate(-3deg)" }} />
        </div>
      );
    }
    case "stamp":
      return (
        <div style={{ ...at(`rotate(${rot}deg) scale(${1.7 - 0.7 * pop})`, Math.min(1, pop * 2)), whiteSpace: "nowrap", fontSize: size, letterSpacing: 6, color: "#A8321E", border: "12px solid #A8321E", outline: "4px solid #A8321E", outlineOffset: 8, padding: "6px 48px 14px", backgroundColor: "rgba(255,243,218,.96)", backgroundImage: FIB, boxShadow: CAST }}>{c.text}</div>
      );
    default: {
      const bg = c.col ? COL[c.col] : "#B4824E", left = x < 540;
      return (
        <div style={{ ...at(`translateX(${(1 - pop) * (left ? -600 : 600)}px) rotate(${rot}deg)`), filter: "drop-shadow(16px 22px 14px rgba(38,20,12,.45))" }}>
          <div style={{ backgroundColor: bg, backgroundImage: `url(${staticFile("tex/kraft.png")})`, color: "#FFF6E2", whiteSpace: "nowrap", fontSize: size, letterSpacing: 2, padding: left ? "14px 46px 20px 80px" : "14px 80px 20px 46px", textShadow: "3px 5px 0 rgba(40,16,6,.75)", clipPath: left ? "polygon(11% 0,100% 0,100% 100%,11% 100%,0 50%)" : "polygon(0 0,89% 0,100% 50%,89% 100%,0 100%)" }}>{c.text}</div>
        </div>
      );
    }
  }
};

type W = { id: string; text: string; start: number; end: number };
const WORDS = (words as W[]).map((w) => ({ ...w, text: w.text.replace(/^Audira/, "AUDIRA") }));
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const next = WORDS[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[.,:!?]$/.test(w.text) || cur.length >= 4 || len + 1 + next.text.length > 24 || next.start - w.end > 0.35) { out.push(cur); cur = []; }
  });
  return out;
})();

const Karaoke: React.FC<{ t: number }> = ({ t }) => {
  if (t > FILM_SECONDS - OUTRO_SECONDS) return null;
  const idx = CHUNKS.findIndex((ch, i) => t >= ch[0].start - 0.08 && (i === CHUNKS.length - 1 ? t <= ch[ch.length - 1].end + 0.6 : t < CHUNKS[i + 1][0].start - 0.08));
  if (idx < 0) return null;
  const ch = CHUNKS[idx];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center" }}>
      <div style={{ height: 112, padding: "0 34px", borderRadius: 22, background: "rgba(34,22,18,.90)", boxShadow: "12px 16px 18px rgba(30,16,10,.36), 3px 4px 0 #0E0806", display: "flex", alignItems: "center", whiteSpace: "nowrap", fontFamily: "Manrope", fontWeight: 800, fontSize: 64 }}>
        {ch.map((w) => {
          const active = t >= w.start && t < w.end + 0.05;
          const b = active ? 1 + 0.04 * Math.sin(Math.PI * ramp(t, w.start, w.start + 0.18)) : 1;
          return <span key={w.id} style={{ margin: "0 0.2em", color: active ? "#FFC94F" : C.paper, transform: `scale(${b})`, display: "inline-block" }}>{w.text}</span>;
        })}
      </div>
    </div>
  );
};

/** torn-paper wipe: the new scene slides over the old one behind a ragged cream edge */
const wipe = (k: number, dir: number, seed: number) => {
  if (k >= 1) return undefined;
  const n = 22, e = -8 + 116 * k;
  const pts = Array.from({ length: n + 1 }, (_, i) => [e + (hash(seed + i * 1.7) - 0.5) * 5 + Math.sin(i * 0.7 + seed) * 3, (i / n) * 100]);
  const flip = (p: number[]) => (dir === 0 ? `${p[0].toFixed(1)}% ${p[1].toFixed(1)}%` : dir === 1 ? `${(100 - p[0]).toFixed(1)}% ${p[1].toFixed(1)}%` : `${p[1].toFixed(1)}% ${(100 - p[0]).toFixed(1)}%`);
  return `polygon(${[[-20, 0], ...pts, [-20, 100]].map(flip).join(",")})`;
};

export const Ep18Stage: React.FC<{ t: number; withText?: boolean }> = ({ t, withText = true }) => (
  <>
    {SCENES.map((sc, i) => {
      if (t < sc.start || t > sc.end + XFADE) return null;
      const k = i === 0 ? 1 : ease((t - sc.start) / XFADE), dir = [0, 1, 2][i % 3];
      const Comp = SCENE_MAP[sc.id];
      const { s, px, py } = cam2d(Math.max(0, t - sc.start), i % 2 === 0 ? 1 : -1);
      const [key, shade, op] = GRADE[sc.id];
      return (
        <React.Fragment key={sc.id}>
          {k < 1 ? <div style={{ position: "absolute", inset: 0, background: "#FFF4DC", clipPath: wipe(Math.min(0.999, k + 0.035), dir, i + 40) }} /> : null}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: wipe(k, dir, i + 40) }}>
            <div style={{ position: "absolute", inset: 0, transform: `translate(${px}px,${py}px) scale(${s})`, transformOrigin: "540px 820px" }}>
              <Comp t={t} lt={t - sc.start} />
            </div>
            <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: `radial-gradient(ellipse 80% 55% at 20% 12%, rgba(${key},.8) 0%, rgba(${key},0) 70%), linear-gradient(140deg, rgba(0,0,0,0) 42%, rgba(${shade},${op}) 100%)` }} />
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 56%, rgba(${shade},.34) 100%)` }} />
          </div>
        </React.Fragment>
      );
    })}
    {withText ? CALLOUTS.map((c, i) => <CalloutView key={i} c={c} t={t} />) : null}
    {withText ? <Karaoke t={t} /> : null}
  </>
);

export const Ep18Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: C.ivory }} />
      <Audio src={staticFile("audio/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep18Stage t={t} />
      </div>
      <AudiraOutro seconds={OUTRO_SECONDS} />
      <AudiraSignature seed="sejarah-islam-EP18" handle="@AUDIRAQISSAH" />
    </AbsoluteFill>
  );
};

/** Topic cover 1080 × 1920: hook frame + title. */
export const Ep18Cover: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: C.ivory }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <Ep18Stage t={5.1} withText={false} />
        <CalloutView c={{ t: 3, until: 9, text: "AHAD", kind: "letters", y: 400, size: 340 }} t={5.1} />
        <CalloutView c={{ t: 3, until: 9, text: "BILAL BIN RABAH", kind: "ribbon", y: 1370, size: 118 }} t={5.1} />
      </div>
    </AbsoluteFill>
  );
};
