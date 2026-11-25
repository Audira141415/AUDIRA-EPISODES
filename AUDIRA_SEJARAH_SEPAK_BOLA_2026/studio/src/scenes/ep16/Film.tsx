import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, delayRender, continueRender, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TOTAL, CLIPS, T, CUT, win, pop, clamp01, setAt } from "./timing.ts";
import { FilmScene } from "./FilmScene.tsx";

export const TOTAL_SECONDS = TOTAL;

/* ── Stage (1080 × 1920 HTML overlay) ── */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const sx = width / 1080;
  const sy = height / 1920;
  const s = Math.min(sx, sy);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "center center", position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

/* ── Brutalist HUD components ── */
const PLATE_STYLE: React.CSSProperties = {
  background: "#fff", border: "5px solid #000", boxShadow: "8px 8px 0 #000",
  padding: "8px 18px", fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase",
  letterSpacing: -1, color: "#000",
};
const PINK_PLATE: React.CSSProperties = { ...PLATE_STYLE, background: "#FF3864", color: "#fff" };
const GREEN_PLATE: React.CSSProperties = { ...PLATE_STYLE, background: "#25F482" };
const RED_PLATE: React.CSSProperties = { ...PLATE_STYLE, background: "#DC052D", color: "#fff" };

const Chip: React.FC<{ text: string; t: number; a: number; b: number; style?: React.CSSProperties; x?: number; y?: number }> = ({ text, t, a, b, style, x = 540, y = 400 }) => {
  const o = win(t, a, b);
  const s = pop(t, a);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * s})`, opacity: o, ...PLATE_STYLE, fontSize: 42, ...style }}>
      {text}
    </div>
  );
};

const Stamp: React.FC<{ text: string; t: number; a: number; style?: React.CSSProperties; x?: number; y?: number }> = ({ text, t, a, style, x = 540, y = 960 }) => {
  const s = pop(t, a, 0.25);
  if (s <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * s}) rotate(-4deg)`, opacity: clamp01(s), ...PINK_PLATE, fontSize: 56, ...style }}>
      {text}
    </div>
  );
};

const BigLine: React.FC<{ text: string; t: number; a: number; b: number; y?: number; style?: React.CSSProperties }> = ({ text, t, a, b, y = 320, style }) => {
  const o = win(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", opacity: o, ...PLATE_STYLE, fontSize: 48, ...style }}>
      {text}
    </div>
  );
};

/* ── HUD overlay timing ── */
const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* Hook */}
    <Stamp text="3 TAHUN BERUNTUN" t={t} a={T.tiga} x={540} y={350} style={RED_PLATE} />
    <Chip text="SATU KLUB" t={t} a={T.klub} b={T.eropa + 0.5} x={540} y={530} />
    <Chip text="SELURUH EROPA" t={t} a={T.eropa} b={T.hookEnd} x={540} y={680} style={GREEN_PLATE} />
    {/* Context */}
    <BigLine text="BAYERN MUNICH · 1900" t={t} a={T.bayern} b={T.puluhan - 0.1} y={280} style={RED_PLATE} />
    <Chip text="MUNICH, BAVARIA" t={t} a={T.bavaria} b={T.puluhan - 0.1} x={540} y={420} />
    <BigLine text="KURT LANDAUER" t={t} a={T.landauer} b={T.terusir + 0.5} y={280} />
    <Chip text="DIPAKSA MUNDUR" t={t} a={T.dipaksa} b={T.terusir + 0.5} x={540} y={420} style={PINK_PLATE} />
    <BigLine text="GENERASI EMAS" t={t} a={T.emas} b={T.kontEnd} y={280} style={GREEN_PLATE} />
    <Chip text="BECKENBAUER" t={t} a={T.beckenbauer} b={T.kontEnd} x={300} y={440} />
    <Chip text="MÜLLER" t={t} a={T.muller} b={T.kontEnd} x={540} y={560} style={RED_PLATE} />
    <Chip text="MAIER" t={t} a={T.maier} b={T.kontEnd} x={780} y={440} style={GREEN_PLATE} />
    {/* Development */}
    <Stamp text="PIALA CHAMPIONS ×3" t={t} a={T.juaraCL} x={540} y={350} style={RED_PLATE} />
    <Chip text="1974" t={t} a={T.y1974} b={T.y1976 + 1} x={300} y={520} />
    <Chip text="1975" t={t} a={T.y1975} b={T.y1976 + 1} x={540} y={520} style={GREEN_PLATE} />
    <Chip text="1976" t={t} a={T.y1976} b={T.y1976 + 1} x={780} y={520} style={PINK_PLATE} />
    <BigLine text="BRUSSEL: 4-0" t={t} a={T.empatNol} b={T.atletico + 1} y={280} style={RED_PLATE} />
    <Stamp text="DER KAISER" t={t} a={T.derKaiser} x={540} y={350} />
    <Chip text="LIBERO" t={t} a={T.libero} b={T.belakang + 0.5} x={540} y={520} style={GREEN_PLATE} />
    {/* Explanation */}
    <BigLine text="TAK TERTANDINGI" t={t} a={T.domestik} b={T.rekor - 0.1} y={280} style={RED_PLATE} />
    <Stamp text="REKOR GELAR NASIONAL" t={t} a={T.rekor} x={540} y={350} />
    <BigLine text="11 BUNDESLIGA BERUNTUN" t={t} a={T.sebelas} b={T.terputus - 0.1} y={280} style={GREEN_PLATE} />
    <Chip text="2013 – 2023" t={t} a={T.y2013} b={T.terputus - 0.1} x={540} y={420} />
    <Chip text="TERPUTUS" t={t} a={T.terputus} b={T.leverkusen + 0.5} x={400} y={520} style={PINK_PLATE} />
    <Chip text="LEVERKUSEN" t={t} a={T.leverkusen} b={T.leverkusen + 0.8} x={680} y={520} />
    {/* Payoff */}
    <BigLine text="MUSIM 2019-20" t={t} a={T.musim2019} b={T.sextuple - 0.1} y={280} style={RED_PLATE} />
    <Stamp text="SEXTUPLE" t={t} a={T.sextuple} x={540} y={350} style={{ ...GREEN_PLATE, fontSize: 64 }} />
    <Chip text="6 TROFI" t={t} a={T.enam} b={T.y2021 + 0.5} x={540} y={520} style={RED_PLATE} />
    <BigLine text="KEDUA DI DUNIA" t={t} a={T.kedua} b={T.barcelona + 0.5} y={280} />
    <Chip text="SETELAH BARCELONA" t={t} a={T.barcelona} b={T.barcelona + 1} x={540} y={420} style={PINK_PLATE} />
    <BigLine text="GELAR EROPA KE-6" t={t} a={T.keenam} b={T.payEnd} y={280} style={RED_PLATE} />
  </>
);

/* ── Karaoke Captions ── */
const CAPTION_GOLD = "#FFE600";
const CAPTION_WHITE = "#fff";
const MAX_LINE = 28;

const splitLines = (words: { w: string; s: number; e: number }[]): { w: string; s: number; e: number }[][] => {
  const lines: { w: string; s: number; e: number }[][] = [[]];
  let len = 0;
  for (const wd of words) {
    const wl = wd.w.replace(/[^a-zA-Z0-9 ]/g, "").length;
    if (len + wl > MAX_LINE && lines[lines.length - 1].length > 0) { lines.push([]); len = 0; }
    lines[lines.length - 1].push(wd);
    len += wl + 1;
  }
  return lines;
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const activeClip = CLIPS.find((c) => t >= c.start && t < c.end + 0.3);
  if (!activeClip) return null;
  const lines = splitLines(activeClip.words);
  const activeIdx = activeClip.words.findIndex((w) => t >= w.s && t < w.e);
  let wordCount = 0;
  return (
    <div style={{ position: "absolute", bottom: 400, left: 60, right: 60, textAlign: "center" }}>
      {lines.map((line, li) => (
        <div key={li} style={{ marginBottom: 4 }}>
          {line.map((wd) => {
            const idx = wordCount++;
            const active = idx === activeIdx;
            return (
              <span key={idx} style={{
                fontFamily: "sans-serif", fontWeight: 900, fontSize: 40, textTransform: "uppercase",
                color: active ? CAPTION_GOLD : CAPTION_WHITE,
                textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                transform: active ? "scale(1.12)" : "scale(1)", display: "inline-block",
                transition: "transform 0.08s", marginRight: 8,
              }}>
                {wd.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ── Flash transition ── */
const Flash: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const o = win(t, at - 0.05, at + 0.25, 0.05, 0.2);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "#FFE600", opacity: o * 0.9 }} />;
};

/* ── Main Film ── */
export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;

  useMemo(() => {
    const h = delayRender("Load fonts");
    const f = new FontFace("sans-serif", "local('Arial Black'), local('Impact'), local('sans-serif')");
    f.load().then(() => { (document.fonts as any).add(f); continueRender(h); }).catch(() => continueRender(h));
    return h;
  }, []);

  const currentSet = setAt(t);

  return (
    <AbsoluteFill style={{ background: "#FFE600" }}>
      <ThreeCanvas
        width={1080} height={1920}
        style={{ position: "absolute", inset: 0 }}
        camera={{ fov: 38, position: [0, 3, 6], near: 0.1, far: 100 }}
      >
        <FilmScene t={t} frame={frame} fps={fps} currentSet={currentSet} />
      </ThreeCanvas>
      <Stage>
        <HUD t={t} />
        <Captions t={t} />
        {/* Set cut flashes */}
        {Object.values(CUT).map((ct, i) => <Flash key={i} t={t} at={ct} />)}
      </Stage>
    </AbsoluteFill>
  );
};
