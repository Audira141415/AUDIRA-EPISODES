// CHRONICLE 2D overlays: date stamp, counters, callout cards, name tags, quote, citation, medal.
import React from "react";
import { continueRender, delayRender, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const fontsToLoad: [string, string][] = [
  ["Anton", "fonts/Anton-Regular.ttf"],
  ["Barlow", "fonts/BarlowCondensed-SemiBold.ttf"],
  ["BarlowX", "fonts/BarlowCondensed-ExtraBold.ttf"],
  ["Jakarta", "fonts/PlusJakartaSans_800ExtraBold.ttf"],
  ["JakartaB", "fonts/PlusJakartaSans_700Bold.ttf"],
  ["Serif", "fonts/InstrumentSerif-Italic.ttf"],
];
let fontsReady = false;
export function useFonts() {
  const [h] = React.useState(() => (fontsReady ? null : delayRender("fonts")));
  React.useEffect(() => {
    if (h === null) return;
    Promise.all(fontsToLoad.map(([n, u]) => new FontFace(n, `url(${staticFile(u)})`).load().then((ff) => (document.fonts as any).add(ff))))
      .then(() => { fontsReady = true; continueRender(h); })
      .catch(() => continueRender(h));
  }, [h]);
}

export const C = { cream: "#F6E9CF", gold: "#F5B54A", red: "#D9503A", blue: "#6EC8FF", ink: "#0B0C10", dim: "#B9A98A" };
const EO = Easing.bezier(0.16, 1, 0.3, 1);

export function useIn(at: number, dur = 0.5) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(f, [at * fps, (at + dur) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
}
export function useOut(at: number, dur = 0.35) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(f, [at * fps, (at + dur) * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}
export function usePop(at: number) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at * fps, fps, config: { damping: 12, stiffness: 200, mass: 0.8 } });
}

// Date stamp in the CHRONICLE manner: thin rules + big serif-less date.
export const DateStamp: React.FC<{ at: number; out?: number; top?: number; small: string; big: string; color?: string }> = ({ at, out = 99, top = 250, small, big, color = C.gold }) => {
  const a = useIn(at) * useOut(out);
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 22, fontFamily: "Barlow", fontSize: 40, letterSpacing: 8, color: C.cream }}>
        <span style={{ width: 120 * a, height: 3, background: color }} />{small}<span style={{ width: 120 * a, height: 3, background: color }} />
      </div>
      <div style={{ fontFamily: "Anton", fontSize: 128, lineHeight: 1.05, color, textShadow: "0 6px 30px rgba(0,0,0,.6)", letterSpacing: 2 }}>{big}</div>
    </div>
  );
};

// Number that rolls up and lands with a pop.
export const Counter: React.FC<{ at: number; out?: number; to: number; dec?: number; suffix?: string; prefix?: string; label: string; top?: number; color?: string; size?: number; roll?: number }> = ({ at, out = 99, to, dec = 0, suffix = "", prefix = "", label, top = 300, color = C.gold, size = 210, roll = 0.9 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useIn(at, 0.35) * useOut(out);
  const p = interpolate(f, [at * fps, (at + roll) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const pop = usePop(at + roll);
  const v = (to * p).toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1, color, transform: `scale(${0.9 + 0.1 * pop})`, textShadow: "0 8px 40px rgba(0,0,0,.65)" }}>{prefix}{v}{suffix}</div>
      <div style={{ display: "inline-block", marginTop: 14, padding: "8px 26px", background: "rgba(11,12,16,.78)", border: `2px solid ${color}`, fontFamily: "BarlowX", fontSize: 46, letterSpacing: 4, color: C.cream }}>{label}</div>
    </div>
  );
};

export const Card: React.FC<{ at: number; out?: number; top?: number; title: string; lines?: string[]; color?: string; width?: number }> = ({ at, out = 99, top = 300, title, lines = [], color = C.gold, width = 860 }) => {
  const a = useIn(at, 0.45) * useOut(out);
  return (
    <div style={{ position: "absolute", top, left: (1080 - width) / 2, width, opacity: a, transform: `translateY(${(1 - a) * 40}px)`, background: "rgba(11,12,16,.82)", borderLeft: `10px solid ${color}`, padding: "26px 34px", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
      <div style={{ fontFamily: "Anton", fontSize: 72, color, lineHeight: 1.05 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: "JakartaB", fontSize: 40, color: C.cream, marginTop: 10, lineHeight: 1.25 }}>{l}</div>
      ))}
    </div>
  );
};

export const NameTag: React.FC<{ at: number; out?: number; x: number; y: number; name: string; sub?: string; color?: string; align?: "left" | "right" }> = ({ at, out = 99, x, y, name, sub, color = C.gold, align = "left" }) => {
  const a = useIn(at, 0.4) * useOut(out);
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : undefined, right: align === "right" ? 1080 - x : undefined, top: y, opacity: a, textAlign: align }}>
      <div style={{ height: 4, width: 90 * a, background: color, marginLeft: align === "right" ? "auto" : 0 }} />
      <div style={{ fontFamily: "BarlowX", fontSize: 54, color: C.cream, letterSpacing: 2, textShadow: "0 3px 14px rgba(0,0,0,.8)" }}>{name}</div>
      {sub ? <div style={{ fontFamily: "BarlowX", fontSize: 42, color, letterSpacing: 3, textShadow: "0 3px 14px rgba(0,0,0,.9)" }}>{sub}</div> : null}
    </div>
  );
};

export const Quote: React.FC<{ at: number; out?: number; top?: number; text: string; who: string; color?: string }> = ({ at, out = 99, top = 330, text, who, color = C.gold }) => {
  const a = useIn(at, 0.6) * useOut(out);
  return (
    <div style={{ position: "absolute", top, left: 70, width: 940, boxSizing: "border-box", padding: "34px 40px 30px", background: "rgba(11,12,16,.74)", borderLeft: `8px solid ${color}`, borderRadius: 10, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <div style={{ fontFamily: "Anton", fontSize: 150, color, lineHeight: 0.6, height: 70 }}>“</div>
      <div style={{ fontFamily: "Serif", fontSize: 70, lineHeight: 1.12, color: C.cream, textShadow: "0 4px 24px rgba(0,0,0,.8)" }}>{text}</div>
      <div style={{ fontFamily: "BarlowX", fontSize: 40, color, marginTop: 18, letterSpacing: 4 }}>— {who}</div>
    </div>
  );
};

export const Citation: React.FC<{ at: number; out?: number; text: string; top?: number }> = ({ at, out = 99, text, top = 1470 }) => {
  const a = useIn(at, 0.4) * useOut(out);
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, textAlign: "center", opacity: a }}>
      <span style={{ fontFamily: "BarlowX", fontSize: 40, letterSpacing: 2, color: C.cream, background: "rgba(11,12,16,.8)", padding: "6px 20px" }}>{text}</span>
    </div>
  );
};

// Gold medal disc (no Olympic marks): ribbon + disc with a number.
export const Medal: React.FC<{ x: number; y: number; r?: number; at: number; n: string; label?: string; spin?: number }> = ({ x, y, r = 90, at, n, label, spin = 0 }) => {
  const p = usePop(at);
  const a = useIn(at, 0.25);
  const f = useCurrentFrame();
  const sx = Math.cos(f / 40 + spin) * 0.18 + 0.82;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r * 2.2, width: r * 2, height: r * 3.4, opacity: a, transform: `translateY(${(1 - p) * -120}px) scale(${0.6 + 0.4 * p})` }}>
      <svg width={r * 2} height={r * 3.4} viewBox={`0 0 ${r * 2} ${r * 3.4}`}>
        <path d={`M${r * 0.45},0 L${r * 0.85},${r * 1.25} L${r * 1.15},${r * 1.25} L${r * 1.55},0 Z`} fill="#B5452E" />
        <path d={`M${r * 0.8},0 L${r},${r * 1.2} L${r * 1.2},0 Z`} fill="#F1E3C8" opacity={0.9} />
        <g transform={`translate(${r},${r * 2.2}) scale(${sx},1)`}>
          <circle r={r * 0.95} fill="#8F6420" />
          <circle r={r * 0.88} fill="#F5B54A" />
          <circle r={r * 0.7} fill="none" stroke="#FFE7A8" strokeWidth={4} opacity={0.8} />
          <text y={r * 0.28} textAnchor="middle" fontFamily="Anton" fontSize={r * 0.8} fill="#6A4410">{n}</text>
        </g>
      </svg>
      {label ? <div style={{ position: "absolute", top: r * 3.45, left: -60, width: r * 2 + 120, textAlign: "center", fontFamily: "BarlowX", fontSize: 36, color: C.cream, textShadow: "0 3px 10px #000" }}>{label}</div> : null}
    </div>
  );
};

// In-world brand plate (anti-crop): a small stadium sign reading AUDIRA.
export const BrandPlate: React.FC<{ x: number; y: number; scale?: number; text?: string }> = ({ x, y, scale = 1, text = "AUDIRA · SPORT FACTS" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "left top", background: "#1A120C", border: "3px solid #F5B54A", padding: "6px 18px", fontFamily: "BarlowX", fontSize: 40, letterSpacing: 6, color: "#F5B54A" }}>{text}</div>
);
