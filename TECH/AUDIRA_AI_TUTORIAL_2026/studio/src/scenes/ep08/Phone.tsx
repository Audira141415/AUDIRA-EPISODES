// EP08 generic cel-shaded phone UI (no real logos). All coordinates are in 1080-space and
// multiplied by k. Screen-local coordinates: (0,0)-(SW,SH) inside the phone glass.
import React from "react";
import { BANG, CYAN, CamIcon, INK, MicIcon, NUN, PINK, RED, ScreenIcon, YEL, clamp01, sm, ramp } from "./ui.tsx";

export const PX = 380, PY = 330, PW = 560, PH = 1000;
export const SX = PX + 24, SY = PY + 24, SW = PW - 48, SH = PH - 48;
/** screen-local -> global 1080-space */
export const G = (x: number, y: number) => ({ x: SX + x, y: SY + y });

// tap targets (screen-local)
export const T_APP = { x: 196, y: 500 };
export const T_LIVE = { x: 418, y: 862 };
export const T_VIDEO = { x: 256, y: 675 };
export const T_SHARE = { x: 256, y: 765 };
export const T_END = { x: 256, y: 855 };
export const T_DIALOG = { x: 256, y: 560 };

export type ScreenName = "home" | "app" | "live" | "dialog" | "settings" | "ended";
export type ScreenState = { name: ScreenName; shareOn?: boolean; hot?: string; hotK?: number; level?: number; t: number; sharing?: boolean };

const Bar: React.FC<{ k: number; w: number; h?: number; c?: string; style?: React.CSSProperties }> = ({ k, w, h = 16, c = "#d5d9e6", style }) => (
  <div style={{ width: w * k, height: h * k, borderRadius: (h / 2) * k, background: c, ...style }} />
);

const Pill: React.FC<{ k: number; y: number; label: string; icon: React.ReactNode; hot: number; danger?: boolean; active?: boolean }> = ({ k, y, label, icon, hot, danger, active }) => (
  <div
    style={{
      position: "absolute",
      left: 34 * k,
      top: y * k,
      width: 444 * k,
      height: 72 * k,
      borderRadius: 36 * k,
      background: danger ? RED : active ? CYAN : "#ffffff",
      border: `${5 * k}px solid ${INK}`,
      boxShadow: `${6 * k}px ${6 * k}px 0 ${INK}${hot > 0 ? `, 0 0 0 ${10 * hot * k}px rgba(255,210,63,0.75)` : ""}`,
      display: "flex",
      alignItems: "center",
      gap: 14 * k,
      padding: `0 ${22 * k}px`,
      fontFamily: NUN,
      fontWeight: 900,
      fontSize: 30 * k,
      color: danger ? "#fff" : INK,
      transform: `scale(${1 + hot * 0.05})`,
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {label}
  </div>
);

const Home: React.FC<{ k: number; hot: number }> = ({ k, hot }) => {
  const cols = ["#ff7597", "#ffd23f", "#7fd25b", "#ff9f1c", "#9b8cff", "#45b6fe", "#e63946", "#3fb950", "#f2c230", "#5ce1e6", "#ff9f1c", "#9b8cff", "#7fd25b", "#ff7597", "#45b6fe", "#ffd23f"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#3a86ff 0%,#7cc4ff 55%,#cdeeff 100%)" }}>
      <div style={{ position: "absolute", left: 40 * k, top: 90 * k, fontFamily: BANG, fontSize: 110 * k, color: "#fff", WebkitTextStroke: `${6 * k}px ${INK}`, paintOrder: "stroke fill" } as React.CSSProperties}>09.41</div>
      {cols.map((c, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 40 + col * 112, y = 290 + row * 150;
        const isApp = i === 5;
        return (
          <div key={i} style={{ position: "absolute", left: x * k, top: y * k, width: 92 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
            <div
              style={{
                width: 92 * k,
                height: 92 * k,
                borderRadius: 26 * k,
                background: isApp ? "#ffffff" : c,
                border: `${5 * k}px solid ${INK}`,
                boxShadow: `${5 * k}px ${5 * k}px 0 ${INK}${isApp && hot > 0 ? `, 0 0 0 ${12 * hot * k}px rgba(255,210,63,0.85)` : ""}`,
                transform: `scale(${isApp ? 1 + hot * 0.1 : 1})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isApp ? (
                <svg width={60 * k} height={60 * k} viewBox="0 0 60 60">
                  <path d="M8 12 h44 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-24 l-12 10 v-10 h-8 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 z" fill={CYAN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                  <circle cx={20} cy={28} r={4} fill={INK} />
                  <circle cx={31} cy={28} r={4} fill={INK} />
                  <circle cx={42} cy={28} r={4} fill={INK} />
                </svg>
              ) : (
                <div style={{ width: 36 * k, height: 36 * k, borderRadius: (i % 3 === 0 ? 18 : 8) * k, background: "rgba(255,255,255,0.75)", border: `${4 * k}px solid ${INK}` }} />
              )}
            </div>
            {isApp ? (
              <div style={{ fontFamily: NUN, fontWeight: 900, fontSize: 26 * k, color: "#fff", background: INK, padding: `${1 * k}px ${10 * k}px`, borderRadius: 10 * k }}>Gemini</div>
            ) : (
              <Bar k={k} w={60} h={12} c="rgba(255,255,255,0.8)" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const App: React.FC<{ k: number; hot: number }> = ({ k, hot }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fffaf0" }}>
    <div style={{ position: "absolute", left: 30 * k, top: 70 * k, right: 30 * k, display: "flex", alignItems: "center", gap: 18 * k }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 * k }}>
        <Bar k={k} w={40} h={7} c={INK} />
        <Bar k={k} w={40} h={7} c={INK} />
        <Bar k={k} w={40} h={7} c={INK} />
      </div>
      <div style={{ fontFamily: NUN, fontWeight: 900, fontSize: 36 * k, color: INK }}>Gemini</div>
      <div style={{ flex: 1 }} />
      <div style={{ width: 52 * k, height: 52 * k, borderRadius: 26 * k, background: PINK, border: `${4 * k}px solid ${INK}` }} />
    </div>
    <div style={{ position: "absolute", left: 40 * k, top: 300 * k, display: "flex", flexDirection: "column", gap: 20 * k }}>
      <Bar k={k} w={300} h={34} c="#c7d6ff" />
      <Bar k={k} w={380} h={22} />
      <Bar k={k} w={260} h={22} />
    </div>
    <div style={{ position: "absolute", left: 40 * k, top: 520 * k, display: "flex", gap: 14 * k }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ width: 200 * k, height: 120 * k, borderRadius: 22 * k, border: `${4 * k}px solid ${INK}`, background: i ? "#e9f3ff" : "#fff1d6", padding: 16 * k, display: "flex", flexDirection: "column", gap: 10 * k }}>
          <Bar k={k} w={140} h={14} />
          <Bar k={k} w={100} h={14} />
        </div>
      ))}
    </div>
    {/* input bar */}
    <div style={{ position: "absolute", left: 22 * k, top: 818 * k, width: 468 * k, height: 92 * k, borderRadius: 46 * k, background: "#fff", border: `${5 * k}px solid ${INK}`, boxShadow: `${6 * k}px ${6 * k}px 0 ${INK}`, display: "flex", alignItems: "center", padding: `0 ${14 * k}px`, gap: 12 * k }}>
      <div style={{ fontFamily: NUN, fontWeight: 900, fontSize: 44 * k, color: INK, width: 40 * k, textAlign: "center" }}>+</div>
      <Bar k={k} w={130} h={16} />
      <div style={{ flex: 1 }} />
      <MicIcon k={k * 0.75} c="#fff" />
      <div
        style={{
          height: 62 * k,
          padding: `0 ${18 * k}px`,
          borderRadius: 31 * k,
          background: INK,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 8 * k,
          fontFamily: NUN,
          fontWeight: 900,
          fontSize: 30 * k,
          transform: `scale(${1 + hot * 0.1})`,
          boxShadow: hot > 0 ? `0 0 0 ${10 * hot * k}px rgba(255,210,63,0.85)` : undefined,
        }}
      >
        <svg width={30 * k} height={30 * k} viewBox="0 0 30 30">
          {[6, 12, 18, 24].map((x, i) => (
            <rect key={i} x={x - 2} y={15 - [5, 10, 7, 4][i]} width={4} height={[5, 10, 7, 4][i] * 2} rx={2} fill={CYAN} />
          ))}
        </svg>
        Live
      </div>
    </div>
  </div>
);

const Live: React.FC<{ k: number; s: ScreenState }> = ({ k, s }) => {
  const lv = s.level ?? 0.4;
  const pulse = 1 + 0.06 * Math.sin(s.t * 6) * (0.4 + lv);
  const hot = (n: string) => (s.hot === n ? s.hotK ?? 0 : 0);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 50% 38%, #24347a 0%, #141a3a 60%, #0d1128 100%)" }}>
      <div style={{ position: "absolute", left: 30 * k, top: 70 * k, display: "flex", alignItems: "center", gap: 10 * k, background: "#fff", border: `${4 * k}px solid ${INK}`, borderRadius: 24 * k, padding: `${4 * k}px ${16 * k}px`, fontFamily: NUN, fontWeight: 900, fontSize: 30 * k, color: INK }}>
        <span style={{ width: 16 * k, height: 16 * k, borderRadius: 8 * k, background: RED, display: "inline-block" }} />
        Live
      </div>
      {/* orb */}
      {[1.55, 1.3].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: (256 - 120 * r * pulse) * k, top: (360 - 120 * r * pulse) * k, width: 240 * r * pulse * k, height: 240 * r * pulse * k, borderRadius: "50%", border: `${4 * k}px solid rgba(63,240,255,${0.25 + i * 0.25})` }} />
      ))}
      <div style={{ position: "absolute", left: (256 - 120 * pulse) * k, top: (360 - 120 * pulse) * k, width: 240 * pulse * k, height: 240 * pulse * k, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #ffffff 0%, #8ff5ff 30%, #3fa0ff 70%, #2a46c8 100%)", border: `${6 * k}px solid ${INK}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 530 * k, display: "flex", justifyContent: "center", gap: 8 * k }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ width: 12 * k, height: (10 + 40 * lv * Math.abs(Math.sin(s.t * (6 + i) + i))) * k, borderRadius: 6 * k, background: CYAN }} />
        ))}
      </div>
      <Pill k={k} y={640} label="Turn on video streaming" icon={<CamIcon s={40 * k} />} hot={hot("video")} />
      <Pill k={k} y={730} label={s.shareOn ? "Turn off screen sharing" : "Turn on screen sharing"} icon={<ScreenIcon s={40 * k} />} hot={hot("share")} active={s.shareOn} />
      <Pill
        k={k}
        y={820}
        label="End"
        danger
        hot={hot("end")}
        icon={
          <svg width={34 * k} height={34 * k} viewBox="0 0 34 34">
            <path d="M8 8 L26 26 M26 8 L8 26" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          </svg>
        }
      />
    </div>
  );
};

const Dialog: React.FC<{ k: number; s: ScreenState }> = ({ k, s }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Live k={k} s={{ ...s, hot: undefined }} />
    <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,20,0.6)" }} />
    <div style={{ position: "absolute", left: 40 * k, top: 290 * k, width: 432 * k, height: 340 * k, borderRadius: 34 * k, background: "#fff", border: `${6 * k}px solid ${INK}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30 * k, gap: 18 * k }}>
      <div style={{ width: 96 * k, height: 96 * k, borderRadius: 48 * k, background: CYAN, border: `${5 * k}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ScreenIcon s={56 * k} />
      </div>
      <Bar k={k} w={300} h={18} />
      <Bar k={k} w={220} h={18} />
      <div style={{ marginTop: 8 * k, width: 230 * k, height: 70 * k, borderRadius: 35 * k, background: CYAN, border: `${5 * k}px solid ${INK}`, boxShadow: `${5 * k}px ${5 * k}px 0 ${INK}${s.hot === "dialog" ? `, 0 0 0 ${10 * (s.hotK ?? 0) * k}px rgba(255,210,63,0.85)` : ""}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={44 * k} height={44 * k} viewBox="0 0 44 44">
          <path d="M8 23 L18 33 L36 11" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
);

const Settings: React.FC<{ k: number; s: ScreenState }> = ({ k, s }) => {
  const scroll = Math.sin(s.t * 1.3) * 40 + 30;
  const icons = ["#45b6fe", "#ff9f1c", "#7fd25b", "#ff7597", "#9b8cff", "#f2c230", "#5ce1e6", "#e63946", "#3fb950", "#45b6fe", "#ff9f1c"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#eef1f8", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 170 * k, background: "#fff", borderBottom: `${4 * k}px solid ${INK}`, display: "flex", alignItems: "flex-end", padding: `0 ${30 * k}px ${22 * k}px`, gap: 16 * k, zIndex: 2 }}>
        <svg width={60 * k} height={60 * k} viewBox="0 0 60 60">
          <g stroke={INK} strokeWidth={4} fill="#c7cbd8">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={26} y={2} width={8} height={14} rx={2} transform={`rotate(${i * 45} 30 30)`} />
            ))}
            <circle cx={30} cy={30} r={17} />
          </g>
          <circle cx={30} cy={30} r={7} fill="#fff" stroke={INK} strokeWidth={4} />
        </svg>
        <Bar k={k} w={220} h={26} c="#9aa1b8" />
      </div>
      <div style={{ position: "absolute", left: 22 * k, right: 22 * k, top: (190 - scroll) * k, display: "flex", flexDirection: "column", gap: 12 * k }}>
        {icons.map((c, i) => (
          <div key={i} style={{ height: 78 * k, borderRadius: 18 * k, background: "#fff", border: `${3 * k}px solid ${INK}`, display: "flex", alignItems: "center", gap: 16 * k, padding: `0 ${18 * k}px`, marginLeft: (i % 4 === 2 ? 34 : 0) * k }}>
            <div style={{ width: 44 * k, height: 44 * k, borderRadius: 12 * k, background: c, border: `${3 * k}px solid ${INK}` }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 * k, flex: 1 }}>
              <Bar k={k} w={120 + ((i * 47) % 120)} h={14} c="#8f96ad" />
              {i % 2 === 0 && <Bar k={k} w={90 + ((i * 31) % 90)} h={10} />}
            </div>
            {i % 3 === 1 ? (
              <div style={{ width: 70 * k, height: 38 * k, borderRadius: 19 * k, background: i % 2 ? CYAN : "#c7cbd8", border: `${3 * k}px solid ${INK}`, position: "relative" }}>
                <div style={{ position: "absolute", top: 3 * k, left: (i % 2 ? 34 : 4) * k, width: 26 * k, height: 26 * k, borderRadius: 13 * k, background: "#fff", border: `${3 * k}px solid ${INK}` }} />
              </div>
            ) : (
              <svg width={22 * k} height={30 * k} viewBox="0 0 22 30">
                <path d="M5 4 L17 15 L5 26" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Ended: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, background: "#0d1128", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 150 * k, height: 150 * k, borderRadius: 75 * k, background: RED, border: `${6 * k}px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={80 * k} height={80 * k} viewBox="0 0 34 34">
        <path d="M8 8 L26 26 M26 8 L8 26" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const Screen: React.FC<{ k: number; s: ScreenState }> = ({ k, s }) => {
  const hot = s.hotK ?? 0;
  switch (s.name) {
    case "home":
      return <Home k={k} hot={s.hot === "app" ? hot : 0} />;
    case "app":
      return <App k={k} hot={s.hot === "live" ? hot : 0} />;
    case "live":
      return <Live k={k} s={s} />;
    case "dialog":
      return <Dialog k={k} s={s} />;
    case "settings":
      return <Settings k={k} s={s} />;
    case "ended":
      return <Ended k={k} />;
  }
};

/**
 * The phone. `screens` = current + optional previous screen for a slide-in (p = 0..1).
 * zoom: scale around the screen centre; glass: 0 makes the screen transparent (see-through).
 */
export const Phone2D: React.FC<{
  k: number;
  cur: ScreenState;
  prev?: ScreenState;
  p: number;
  zoom: number;
  dx?: number;
  dy?: number;
  rot?: number;
  glass: number;
  bezel: number;
  sharing?: number;
}> = ({ k, cur, prev, p, zoom, dx = 0, dy = 0, rot = 0, glass, bezel, sharing = 0 }) => {
  const cx = SX + SW / 2, cy = SY + SH / 2;
  const slide = sm(clamp01(p));
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${dx * k}px, ${dy * k}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: `${cx * k}px ${cy * k}px` }}>
      {/* body */}
      <div
        style={{
          position: "absolute",
          left: PX * k,
          top: PY * k,
          width: PW * k,
          height: PH * k,
          borderRadius: 78 * k,
          background: "#2a2d44",
          border: `${8 * k}px solid ${INK}`,
          boxShadow: `${16 * k}px ${16 * k}px 0 ${PINK}, ${16 * k}px ${16 * k}px 0 ${8 * k}px ${INK}`,
          opacity: bezel,
        }}
      />
      {/* screen */}
      <div style={{ position: "absolute", left: SX * k, top: SY * k, width: SW * k, height: SH * k, borderRadius: 58 * k, overflow: "hidden", opacity: glass }}>
        {prev && slide < 1 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-slide * 0.35 * SW * k}px)` }}>
            <Screen k={k} s={prev} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${prev ? (1 - slide) * SW * k : 0}px)` }}>
          <Screen k={k} s={cur} />
        </div>
      </div>
      {/* notch */}
      <div style={{ position: "absolute", left: (PX + PW / 2 - 60) * k, top: (SY + 14) * k, width: 120 * k, height: 30 * k, borderRadius: 15 * k, background: INK, opacity: Math.min(bezel, glass) }} />
      {/* screen-sharing glow */}
      {sharing > 0.01 && (
        <div style={{ position: "absolute", left: (SX - 6) * k, top: (SY - 6) * k, width: (SW + 12) * k, height: (SH + 12) * k, borderRadius: 62 * k, border: `${10 * k}px solid ${CYAN}`, boxShadow: `0 0 ${40 * k}px ${CYAN}`, opacity: sharing }} />
      )}
    </div>
  );
};

/** Typewriter text revealed with spoken word times. */
export const typedByWords = (t: number, words: { w: string; s: number; e: number }[]) => {
  let out = "";
  for (const w of words) {
    if (t < w.s) break;
    const n = Math.ceil(w.w.length * clamp01(ramp(t, w.s, Math.min(w.e, w.s + 0.3))));
    out += (out ? " " : "") + w.w.slice(0, n);
  }
  return out;
};
export { YEL };
