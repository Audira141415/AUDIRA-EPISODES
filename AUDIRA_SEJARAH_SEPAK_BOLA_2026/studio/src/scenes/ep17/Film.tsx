import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, delayRender, continueRender, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { TOTAL, CLIPS, T, CUT, win, pop, setAt } from "./timing.ts";
import { FilmScene } from "./FilmScene.tsx";

export const TOTAL_SECONDS = TOTAL;

/* ── Stage ── */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width / 1080, height / 1920);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "center center", position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

/* ── DRAFTFORGE HUD (blueprint style) ── */
const DP = {
  blueprintDark: "#061327", textPrimary: "#f0f6ff", textMuted: "#6b8bb2",
  cadCyan: "#4fc3f7", dimensionGold: "#ffca28", stampCrimson: "#ef5350",
};

const PLATE: React.CSSProperties = {
  background: "rgba(6,19,39,0.85)", border: "2px solid #1d3d75", padding: "8px 20px",
  fontFamily: "'Courier New', monospace", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 2, color: DP.textPrimary,
};
const CYAN_PLATE: React.CSSProperties = { ...PLATE, borderColor: DP.cadCyan, color: DP.cadCyan };
const GOLD_PLATE: React.CSSProperties = { ...PLATE, borderColor: DP.dimensionGold, color: DP.dimensionGold };
const RED_STAMP: React.CSSProperties = {
  ...PLATE, borderColor: DP.stampCrimson, color: DP.stampCrimson, border: "3px solid",
  fontWeight: 900, fontSize: 48,
};

const Label: React.FC<{ text: string; t: number; a: number; b: number; style?: React.CSSProperties; x?: number; y?: number }> = ({ text, t, a, b, style, x = 540, y = 400 }) => {
  const o = win(t, a, b);
  const s = pop(t, a);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * s})`, opacity: o, ...PLATE, fontSize: 38, ...style }}>
      {text}
    </div>
  );
};

const DimLine: React.FC<{ text: string; t: number; a: number; b: number; y?: number; style?: React.CSSProperties }> = ({ text, t, a, b, y = 300, style }) => {
  const o = win(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", opacity: o, ...GOLD_PLATE, fontSize: 44, ...style }}>
      {text}
    </div>
  );
};

const HUD: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* Hook */}
    <Label text="BEK → PENYERANG" t={t} a={T.bek} b={T.penyerang + 1} x={540} y={350} style={CYAN_PLATE} />
    <Label text="MENGUBAH SEPAK BOLA" t={t} a={T.mengubah} b={T.hookEnd} x={540} y={500} style={GOLD_PLATE} />
    {/* Context */}
    <DimLine text="AJAX · 1965" t={t} a={T.y1965} b={T.pelatih + 0.5} y={280} />
    <Label text="RINUS MICHELS" t={t} a={T.michels} b={T.pelatih + 0.5} x={540} y={420} style={CYAN_PLATE} />
    <Label text="JOHAN CRUYFF" t={t} a={T.cruyff1} b={T.totalFb - 0.1} x={540} y={350} style={{ ...GOLD_PLATE, fontSize: 48 }} />
    <DimLine text="TOTAL FOOTBALL" t={t} a={T.totalFb} b={T.bolong + 0.5} y={280} style={{ ...RED_STAMP }} />
    <Label text="TIAP PEMAIN BISA MENUKAR PERAN" t={t} a={T.menukar} b={T.bolong + 0.5} x={540} y={430} style={{ ...PLATE, fontSize: 30 }} />
    {/* Development */}
    <Label text="BUKAN PENEMU TUNGGAL" t={t} a={T.penemu} b={T.ajaxLah - 0.1} x={540} y={350} style={PLATE} />
    <DimLine text="SISTEM JUARA" t={t} a={T.sistem} b={T.y1971 - 0.1} y={280} style={CYAN_PLATE} />
    <DimLine text="PIALA EROPA 1971" t={t} a={T.y1971} b={T.cruyff2 - 0.1} y={280} />
    <Label text="2-0 vs PANATHINAIKOS" t={t} a={T.duaNol} b={T.cruyff2 - 0.1} x={540} y={420} style={CYAN_PLATE} />
    <Label text="PEMAIN TERBAIK EROPA" t={t} a={T.cruyff2} b={T.michels2 - 0.1} x={540} y={350} style={GOLD_PLATE} />
    <Label text="→ BARCELONA" t={t} a={T.barcelona1} b={T.kovacs - 0.1} x={540} y={420} style={PLATE} />
    <DimLine text="ȘTEFAN KOVÁCS" t={t} a={T.kovacs} b={T.y1972 - 0.1} y={280} style={CYAN_PLATE} />
    <Label text="TREBLE 1972" t={t} a={T.treble} b={T.y1973 - 0.1} x={400} y={420} style={GOLD_PLATE} />
    <Label text="EROPA 1973" t={t} a={T.y1973} b={T.tigaTrofi - 0.1} x={680} y={420} style={GOLD_PLATE} />
    <DimLine text="3 TROFI BERUNTUN" t={t} a={T.tigaTrofi} b={T.realMadrid + 2} y={280} style={RED_STAMP} />
    {/* Explanation */}
    <DimLine text="DE TOEKOMST" t={t} a={T.toekomst} b={T.filosofi - 0.1} y={280} style={CYAN_PLATE} />
    <Label text={'"MASA DEPAN"'} t={t} a={T.masaDepan} b={T.filosofi - 0.1} x={540} y={420} style={GOLD_PLATE} />
    <DimLine text="FILOSOFI 4-3-3" t={t} a={T.filosofi} b={T.speed + 0.5} y={280} />
    <Label text="T · I · P · S" t={t} a={T.tips} b={T.speed + 0.5} x={540} y={420} style={CYAN_PLATE} />
    <DimLine text="PABRIK BINTANG" t={t} a={T.pabrik} b={T.kluivert + 0.5} y={280} style={GOLD_PLATE} />
    <Label text="CRUYFF" t={t} a={T.cruyff3} b={T.kluivert + 0.5} x={240} y={430} style={CYAN_PLATE} />
    <Label text="VAN BASTEN" t={t} a={T.vanBasten} b={T.kluivert + 0.5} x={540} y={430} style={CYAN_PLATE} />
    <Label text="BERGKAMP" t={t} a={T.bergkamp} b={T.kluivert + 0.5} x={540} y={530} style={PLATE} />
    <Label text="KLUIVERT" t={t} a={T.kluivert} b={T.kluivert + 0.8} x={840} y={430} style={GOLD_PLATE} />
    {/* Payoff */}
    <DimLine text="IDE MENYEBERANG" t={t} a={T.menyeberang} b={T.barcelona2 - 0.1} y={280} style={CYAN_PLATE} />
    <Label text="→ BARCELONA" t={t} a={T.barcelona2} b={T.tikiTaka - 0.1} x={540} y={420} style={GOLD_PLATE} />
    <DimLine text="TIKI-TAKA" t={t} a={T.tikiTaka} b={T.amsterdam - 0.1} y={280} style={RED_STAMP} />
    <DimLine text="DNA SEPAK BOLA MODERN" t={t} a={T.dna} b={T.kiblat + 0.5} y={280} style={GOLD_PLATE} />
    <Label text="KIBLAT" t={t} a={T.kiblat} b={T.payEnd} x={540} y={420} style={{ ...RED_STAMP, fontSize: 56 }} />
  </>
);

/* ── Karaoke Captions ── */
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
                fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 38, textTransform: "uppercase",
                letterSpacing: 1,
                color: active ? DP.dimensionGold : DP.textPrimary,
                textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                transform: active ? "scale(1.1)" : "scale(1)", display: "inline-block",
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

/* ── Flash (blueprint glow) ── */
const Flash: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const o = win(t, at - 0.05, at + 0.25, 0.05, 0.2);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: DP.cadCyan, opacity: o * 0.4 }} />;
};

/* ── Main Film ── */
export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;

  useMemo(() => {
    const h = delayRender("Load fonts");
    const f = new FontFace("Courier New", "local('Courier New')");
    f.load().then(() => { (document.fonts as any).add(f); continueRender(h); }).catch(() => continueRender(h));
    return h;
  }, []);

  const currentSet = setAt(t);

  return (
    <AbsoluteFill style={{ background: DP.blueprintDark }}>
      <ThreeCanvas
        width={1080} height={1920}
        style={{ position: "absolute", inset: 0 }}
        camera={{ fov: 36, position: [0, 8, 2], near: 0.1, far: 100 }}
      >
        <FilmScene t={t} frame={frame} fps={fps} currentSet={currentSet} />
      </ThreeCanvas>
      <Stage>
        <HUD t={t} />
        <Captions t={t} />
        {Object.values(CUT).map((ct, i) => <Flash key={i} t={t} at={ct} />)}
      </Stage>
    </AbsoluteFill>
  );
};
