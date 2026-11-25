// EP02 HUD: toy-plastic tutorial panels, paper labels, prompt box, cursor, warnings, karaoke captions.
// Everything is laid out in 1080×1920 units inside a scaled container (preview 540 = scale 0.5).
import React from "react";
import timeline from "./timeline.json";
import { sample, type Key } from "../../core/motion/track.ts";
import { clamp, ease, mix, remap } from "../../core/motion/easing.ts";
import { TOYDIORAMA_PALETTE as PAL } from "../../kits/toydiorama/lib/palette";

const BLACK = "'Arial Black', 'Segoe UI Black', Arial, sans-serif";
const SANS = "'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";
const INK = PAL.paperText;
const HONEY = PAL.propPrimary;
const BLUE = "#2f6fde";
const RED = "#d8443a";

const io = (t: number, a: number, b: number) => ease.inOut(remap(t, a, b));
const outE = (t: number, a: number, b: number) => ease.out(remap(t, a, b));
const backOut = (x: number) => {
  const c = 1.7;
  const u = clamp(x) - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};
/** 0→1 entrance with overshoot and a soft exit. */
const life = (t: number, a: number, b: number, inDur = 0.45, outDur = 0.3) => {
  if (t < a || t > b + outDur) return { k: 0, s: 0 };
  const k = remap(t, a, a + inDur) * (1 - remap(t, b, b + outDur));
  return { k, s: backOut(remap(t, a, a + inDur)) };
};
/** Typed prefix of `text` revealed between a and b. */
const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(text.length * remap(t, a, b)));
const caretOn = (t: number) => Math.floor(t * 2.6) % 2 === 0;

// ------------------------------------------------------------------------------------------
// Primitives
const plastic = (color: string, edge: string, r = 36): React.CSSProperties => ({
  background: color,
  borderRadius: r,
  boxShadow: `0 14px 0 ${edge}, 0 34px 50px rgba(0,0,0,0.45), inset 0 3px 0 rgba(255,255,255,0.55)`,
});

const Tape: React.FC<{ left: number; rot?: number }> = ({ left, rot = -4 }) => (
  <div style={{ position: "absolute", top: -22, left, width: 130, height: 40, background: PAL.washiTape, border: `1px solid ${PAL.tapeBorder}`, transform: `rotate(${rot}deg)`, opacity: 0.92 }} />
);

/** Paper label pinned top-left (y ≥ 262): kicker + title. */
const Label: React.FC<{ t: number; a: number; b: number; kicker: string; title: React.ReactNode; tilt?: number; top?: number }> = ({ t, a, b, kicker, title, tilt = -1.5, top = 262 }) => {
  const { k, s } = life(t, a, b);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, top, maxWidth: 900, opacity: k, transform: `translateY(${(1 - s) * -60}px) rotate(${tilt * s}deg)`, transformOrigin: "20% 0%" }}>
      <div style={{ position: "relative", background: PAL.paperCard, padding: "22px 34px 26px", borderRadius: 8, boxShadow: "0 10px 0 #d9cfbd, 0 26px 40px rgba(0,0,0,0.45)" }}>
        <Tape left={40} />
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: "#9a6a2a", marginBottom: 6 }}>{kicker}</div>
        <div style={{ fontFamily: BLACK, fontSize: 74, lineHeight: 1.0, letterSpacing: -1.5, color: INK }}>{title}</div>
      </div>
    </div>
  );
};

/** Big step number + step title, top-left. */
const StepBadge: React.FC<{ t: number; a: number; b: number; n: number; title: string }> = ({ t, a, b, n, title }) => {
  const { k, s } = life(t, a, b, 0.4, 0.2);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, top: 262, display: "flex", alignItems: "center", gap: 26, opacity: k }}>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 85,
          ...plastic(HONEY, "#a9741f", 85),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: BLACK,
          fontSize: 118,
          color: INK,
          transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`,
        }}
      >
        {n}
      </div>
      <div style={{ transform: `translateX(${(1 - s) * -40}px)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: HONEY, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>LANGKAH {n}</div>
        <div style={{ fontFamily: BLACK, fontSize: 76, lineHeight: 1.0, color: "#fff", textShadow: "0 6px 22px rgba(0,0,0,0.75)" }}>{title}</div>
      </div>
    </div>
  );
};

/** Toy snapshot thumbnail (same drawing language as the 3D prints). */
export const MiniPhoto: React.FC<{ w: number; h: number; bg: "red" | "blue" | "blueLight" | "green" | "park" | "grey" | "table"; suit?: boolean; shirt?: string; two?: boolean; product?: boolean; ring?: boolean; empty?: boolean }> = ({ w, h, bg, suit, shirt = "#2f8f83", two, product, ring, empty }) => {
  const bgs: Record<string, string> = {
    red: "radial-gradient(circle at 50% 40%, #e2564a, #86201c)",
    blue: "radial-gradient(circle at 50% 40%, #4f86ec, #173f9a)",
    blueLight: "radial-gradient(circle at 50% 40%, #8fb7fb, #2f62c8)",
    green: "radial-gradient(circle at 50% 40%, #7cc48a, #2f6b45)",
    park: "linear-gradient(#8fc4f0 0%, #e8f3fb 60%, #6fa860 60%)",
    grey: "radial-gradient(circle at 50% 40%, #ddd6c8, #9d958a)",
    table: "linear-gradient(#fff1cf 0%, #f1e2c4 62%, #b07a45 62%)",
  };
  const person = (x: number, sc: number, top: string, isSuit: boolean, skin = "#d09a6c") => {
    const u = w * sc;
    return (
      <div key={x} style={{ position: "absolute", left: x * w - u * 0.36, bottom: -u * 0.06, width: u * 0.72, height: u * 0.86 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: u * 0.72, height: u * 0.34, background: top, borderRadius: `${u * 0.36}px ${u * 0.36}px 0 0` }} />
        {isSuit && <div style={{ position: "absolute", bottom: u * 0.06, left: u * 0.28, width: 0, height: 0, borderLeft: `${u * 0.08}px solid transparent`, borderRight: `${u * 0.08}px solid transparent`, borderTop: `${u * 0.22}px solid #f6f3ec` }} />}
        <div style={{ position: "absolute", bottom: u * 0.3, left: u * 0.19, width: u * 0.34, height: u * 0.34, borderRadius: "50%", background: skin }} />
        <div style={{ position: "absolute", bottom: u * 0.5, left: u * 0.185, width: u * 0.35, height: u * 0.17, borderRadius: `${u * 0.2}px ${u * 0.2}px 0 0`, background: "#2a1c14" }} />
      </div>
    );
  };
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 14, overflow: "hidden", background: bgs[bg], boxShadow: ring ? `0 0 0 6px ${HONEY}` : "inset 0 0 0 3px rgba(255,255,255,0.35)", flexShrink: 0 }}>
      {empty ? null : product ? (
        <div style={{ position: "absolute", left: w * 0.32, bottom: h * 0.2, width: w * 0.36, height: h * 0.46 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "16%", background: "#6e4426", borderRadius: 6 }} />
          <div style={{ position: "absolute", top: "14%", left: "4%", right: "4%", bottom: 0, background: "#f4efe6", borderRadius: 6 }} />
          <div style={{ position: "absolute", top: "45%", left: "4%", right: "4%", height: "22%", background: "#6e4426" }} />
        </div>
      ) : two ? (
        <>
          {person(0.32, 0.62, "#1a1d24", true)}
          {person(0.7, 0.62, "#f2b400", false, "#b47a52")}
        </>
      ) : (
        person(0.5, 0.95, suit ? "#1a1d24" : shirt, !!suit)
      )}
    </div>
  );
};

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - press * 0.18})`, transformOrigin: "0 0", filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.45))" }}>
    {press > 0.02 && <div style={{ position: "absolute", left: -46 - press * 20, top: -46 - press * 20, width: 92 + press * 40, height: 92 + press * 40, borderRadius: "50%", border: `6px solid ${HONEY}`, opacity: 1 - press * 0.4 }} />}
    <svg width={74} height={92} viewBox="0 0 37 46">
      <path d="M2 2 L2 36 L11 28 L17 42 L23 39 L17 26 L29 26 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Press envelope around each click time. */
const pressAt = (t: number, clicks: number[]) => clicks.reduce((m, c) => Math.max(m, 1 - Math.abs(t - c) / 0.14), 0);

// ------------------------------------------------------------------------------------------
// LANGKAH: the toy tablet with a generic chat app.
const PROMPT1 = "ganti latar menjadi biru polos, wajah dan rambut jangan diubah";
const URL = "gemini.google.com";

const TAB = { x: 70, y: 600, w: 940, h: 660 };
// cursor path in 1080 units (tablet-relative targets converted below)
const CUR: Key[] = [
  { f: 19.6, v: [980, 1500] },
  { f: 20.7, v: [560, 680], hold: true },
  { f: 22.4, v: [560, 690], hold: true },
  { f: 23.25, v: [195, 1175], hold: true },
  { f: 23.75, v: [300, 1040], hold: true },
  { f: 24.2, v: [300, 1050], hold: true },
  { f: 24.8, v: [520, 1175], hold: true },
  { f: 30.6, v: [700, 1190], hold: true },
  { f: 31.05, v: [930, 1175], hold: true },
  { f: 32.3, v: [960, 1290] },
];
const CUR2: Key[] = [
  { f: 33.6, v: [700, 1300] },
  { f: 34.6, v: [210, 900], hold: true },
  { f: 36.0, v: [230, 905], hold: true },
  { f: 36.75, v: [520, 905], hold: true },
  { f: 38.6, v: [600, 1000] },
];

const Tablet: React.FC<{ t: number }> = ({ t }) => {
  const enter = outE(t, 19.35, 20.0);
  const leave = io(t, 38.7, 39.3);
  if (t < 19.35 || t > 39.3) return null;
  // zoom-through into the result (32.3–32.9), back with the Library view at 33.6
  const zoomOut = io(t, 32.3, 32.85);
  const back = outE(t, 33.55, 34.05);
  const hidden = t >= 32.85 && t < 33.55;
  if (hidden) return null;
  const library = t >= 33.55;
  const zoom = library ? mix(0.82, 1, back) : 1 + zoomOut * 1.8;
  const op = library ? back * (1 - leave) : enter * (1 - zoomOut);
  const tiltY = Math.sin(t * 0.45) * 3;
  const tiltX = 6 - enter * 4 + Math.sin(t * 0.33) * 1.5;
  const y = (1 - enter) * 500 + leave * 700;

  const appOn = t >= 22.55;
  const appK = outE(t, 22.55, 22.95);
  const plusPress = pressAt(t, [23.55]);
  const menu = t >= 23.6 && t < 24.05;
  const attached = t >= 24.0;
  const attachPop = backOut(remap(t, 24.0, 24.35));
  const sent = t >= 31.1;
  const promptText = sent ? "" : typed(PROMPT1, t, 26.6, 30.45);
  const typingPrompt = !sent && t >= 24.85;
  const sendPress = pressAt(t, [31.08]);
  const loading = t >= 31.35 && t < 32.15;
  const result = t >= 32.15;
  const resPop = backOut(remap(t, 32.15, 32.5));
  const urlText = t < 20.9 ? "" : typed(URL, t, 20.9, 22.2);
  const sideW = library ? 300 : 96;
  const libPress = pressAt(t, [34.68]);
  const pick = t >= 36.8;
  const editChip = backOut(remap(t, 37.0, 37.35));

  return (
    <div style={{ position: "absolute", left: TAB.x, top: TAB.y + y, width: TAB.w, height: TAB.h, opacity: op, perspective: 1600 }}>
      <div style={{ width: "100%", height: "100%", transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${zoom})`, transformOrigin: library ? "50% 50%" : "30% 50%", ...plastic("#f4efe6", "#c9bfae", 56), padding: 24, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", background: "#fbfaf7", borderRadius: 32, overflow: "hidden", boxShadow: "inset 0 4px 12px rgba(0,0,0,0.12)" }}>
          {/* address bar */}
          <div style={{ height: 78, background: "#ece6da", display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
            {["#e8423f", "#f2b400", "#1fa67a"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
            ))}
            <div style={{ flex: 1, marginLeft: 12, height: 50, borderRadius: 25, background: "#fff", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: MONO, fontWeight: 700, fontSize: 36, color: INK, boxShadow: t >= 20.6 && t < 22.6 ? `0 0 0 5px ${HONEY}` : "inset 0 2px 4px rgba(0,0,0,0.1)" }}>
              {urlText || (t < 20.9 ? <span style={{ color: "#9d958a" }}>ketik alamat…</span> : "")}
              {t >= 20.6 && t < 22.6 && caretOn(t) && <span style={{ display: "inline-block", width: 4, height: 36, background: BLUE, marginLeft: 3 }} />}
            </div>
          </div>
          {!appOn ? (
            <div style={{ position: "absolute", top: 78, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 34, color: "#9d958a" }}>
              {t > 22.25 ? "memuat…" : ""}
            </div>
          ) : (
            <div style={{ position: "absolute", top: 78, left: 0, right: 0, bottom: 0, display: "flex", opacity: appK }}>
              {/* sidebar */}
              <div style={{ width: sideW, background: "#f1ebdf", padding: "22px 14px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  ["≡", "Menu"],
                  ["+", "Chat baru"],
                  ["▦", "Library"],
                  ["◷", "Riwayat"],
                ].map(([ic, lb]) => {
                  const lib = lb === "Library";
                  const hot = lib && library;
                  return (
                    <div key={lb} style={{ height: 64, borderRadius: 20, display: "flex", alignItems: "center", gap: 16, padding: "0 16px", background: hot ? HONEY : "transparent", transform: hot ? `scale(${1 - libPress * 0.06})` : undefined, boxShadow: hot ? "0 6px 0 #a9741f" : undefined }}>
                      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, width: 36, textAlign: "center", color: INK }}>{ic}</div>
                      {library && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK }}>{lb}</div>}
                    </div>
                  );
                })}
              </div>
              {/* main */}
              <div style={{ position: "relative", flex: 1, padding: 26 }}>
                {library ? (
                  <>
                    <div style={{ fontFamily: BLACK, fontSize: 46, color: INK }}>Library</div>
                    <div style={{ fontFamily: SANS, fontSize: 26, color: "#7a7268", marginTop: 4 }}>semua hasil gambarmu</div>
                    <div style={{ display: "flex", gap: 18, marginTop: 24, flexWrap: "wrap" }}>
                      {(["blue", "red", "blue"] as const).map((bg, i) => {
                        const pop = backOut(remap(t, 34.9 + i * 0.15, 35.25 + i * 0.15));
                        return (
                          <div key={i} style={{ position: "relative", transform: `scale(${pop})` }}>
                            <MiniPhoto w={160} h={200} bg={bg} suit={i === 2} ring={pick && i === 0} />
                            {pick && i === 0 && (
                              <div style={{ position: "absolute", left: 18, bottom: -26, transform: `scale(${editChip})`, background: BLUE, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 28, padding: "8px 20px", borderRadius: 22, boxShadow: "0 5px 0 #1b4aa0" }}>
                                ✎ Edit lagi
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {!sent && <div style={{ fontFamily: BLACK, fontSize: 44, color: INK, marginTop: 30 }}>Halo! Mau edit apa?</div>}
                    {sent && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ alignSelf: "flex-end", display: "flex", gap: 12, alignItems: "flex-start", background: "#e3ecfb", borderRadius: 24, padding: 14, maxWidth: 560 }}>
                          <MiniPhoto w={70} h={88} bg="red" />
                          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 29, color: INK, lineHeight: 1.2 }}>{PROMPT1}</div>
                        </div>
                        {loading && (
                          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#7a7268", display: "flex", gap: 10, alignItems: "center" }}>
                            {[0, 1, 2].map((i) => (
                              <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: BLUE, opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 6 - i * 0.8)) }} />
                            ))}
                            membuat gambar…
                          </div>
                        )}
                        {result && (
                          <div style={{ transform: `scale(${resPop})`, transformOrigin: "0 0" }}>
                            <MiniPhoto w={220} h={276} bg="blue" />
                          </div>
                        )}
                      </div>
                    )}
                    {/* prompt box */}
                    {!sent && (
                      <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, minHeight: 120, borderRadius: 34, background: "#fff", boxShadow: typingPrompt ? `0 0 0 5px ${BLUE}, 0 8px 16px rgba(0,0,0,0.12)` : "0 0 0 3px #e2dccf, 0 8px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", boxSizing: "border-box" }}>
                        <div style={{ width: 76, height: 76, borderRadius: 38, background: "#efe9dd", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 52, color: INK, transform: `scale(${1 - plusPress * 0.15})`, flexShrink: 0, boxShadow: plusPress > 0 ? `0 0 0 5px ${HONEY}` : undefined }}>+</div>
                        {attached && (
                          <div style={{ transform: `scale(${attachPop})`, flexShrink: 0 }}>
                            <MiniPhoto w={66} h={84} bg="red" />
                          </div>
                        )}
                        <div style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.15, color: promptText ? INK : "#a39b90" }}>
                          {promptText || (typingPrompt ? "" : "Ketik perintah…")}
                          {typingPrompt && caretOn(t) && <span style={{ display: "inline-block", width: 4, height: 34, background: BLUE, marginLeft: 3, verticalAlign: "middle" }} />}
                        </div>
                        <div style={{ width: 80, height: 80, borderRadius: 40, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 - sendPress * 0.18})`, boxShadow: `0 6px 0 #1b4aa0${sendPress > 0 ? `, 0 0 0 6px ${HONEY}` : ""}` }}>
                          <svg width={40} height={40} viewBox="0 0 20 20"><path d="M10 3 L10 17 M4 9 L10 3 L16 9" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      </div>
                    )}
                    {menu && (
                      <div style={{ position: "absolute", left: 30, bottom: 160, ...plastic("#fff", "#d9d1c2", 24), padding: "14px 18px", transform: `scale(${backOut(remap(t, 23.6, 23.8))})`, transformOrigin: "0 100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK, padding: "10px 16px", borderRadius: 16, background: t > 23.85 ? "#f6e3b5" : "transparent" }}>
                          <span style={{ fontSize: 34 }}>⇪</span> Unggah file
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#9d958a", padding: "10px 16px" }}>
                          <span>▢</span> Foto dari kamera
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabletCursor: React.FC<{ t: number }> = ({ t }) => {
  if (t >= 20.0 && t < 32.3) {
    const enter = outE(t, 19.35, 20.0);
    const [x, y] = sample(CUR, t);
    return <Cursor x={x} y={y + (1 - enter) * 500} press={pressAt(t, [22.45, 23.55, 23.95, 24.85, 31.08])} />;
  }
  if (t >= 34.0 && t < 38.7) {
    const [x, y] = sample(CUR2, t);
    return <Cursor x={x} y={y} press={pressAt(t, [34.68, 36.8])} />;
  }
  return null;
};

// ------------------------------------------------------------------------------------------
/** Compact prompt box for the penjelasan / payoff examples (bottom edge at y 1262). */
const PromptBox: React.FC<{ t: number; a: number; b: number; text: string; ta: number; tb: number; send?: number; thumbs?: React.ReactNode[]; thumbAt?: number }> = ({ t, a, b, text, ta, tb, send, thumbs = [], thumbAt = a }) => {
  const { k, s } = life(t, a, b, 0.4, 0.3);
  if (k <= 0) return null;
  const shown = typed(text, t, ta, tb);
  const typing = t >= ta - 0.3 && (send === undefined || t < send);
  const sp = send !== undefined ? pressAt(t, [send]) : 0;
  const tilt = Math.sin(t * 0.5) * 1.2;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 1920 - 1262, opacity: k, transform: `translateY(${(1 - s) * 120}px) rotate(${tilt}deg)` }}>
      <div style={{ ...plastic("#f4efe6", "#c9bfae", 44), padding: 18 }}>
        <div style={{ background: "#fff", borderRadius: 30, display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", boxShadow: typing ? `0 0 0 5px ${BLUE}` : "0 0 0 3px #e2dccf" }}>
          {thumbs.map((th, i) => (
            <div key={i} style={{ transform: `scale(${backOut(remap(t, thumbAt + i * 0.14, thumbAt + i * 0.14 + 0.35))})`, flexShrink: 0 }}>
              {th}
            </div>
          ))}
          <div style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.18, color: shown ? INK : "#a39b90", minHeight: 44 }}>
            {shown || "Ketik perintah…"}
            {typing && caretOn(t) && <span style={{ display: "inline-block", width: 4, height: 38, background: BLUE, marginLeft: 3, verticalAlign: "middle" }} />}
          </div>
          <div style={{ width: 84, height: 84, borderRadius: 42, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 - sp * 0.18})`, boxShadow: `0 6px 0 #1b4aa0${sp > 0 ? `, 0 0 0 6px ${HONEY}` : ""}` }}>
            <svg width={42} height={42} viewBox="0 0 20 20"><path d="M10 3 L10 17 M4 9 L10 3 L16 9" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/** UBAH / TETAP tags on the key-of-the-prompt beat. */
const RuleTags: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    { a: 40.95, icon: "✎", head: "UBAH", body: "latar", bg: HONEY, edge: "#a9741f" },
    { a: 42.25, icon: "■", head: "TETAP", body: "wajah & rambut", bg: "#cfe0f7", edge: "#8aa6cf" },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const { k, s } = life(t, r.a, 43.35, 0.4, 0.3);
        if (k <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 70 + i * 40, top: 1000 + i * 140, opacity: k, transform: `scale(${s}) rotate(${i ? 1.5 : -2}deg)`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 20, ...plastic(r.bg, r.edge, 30), padding: "16px 30px" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: INK }}>{r.icon}</div>
            <div style={{ fontFamily: BLACK, fontSize: 48, color: INK }}>{r.head}:</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: INK }}>{r.body}</div>
          </div>
        );
      })}
    </>
  );
};

/** Konteks checklist. */
const CheckList: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    { a: 16.0, text: "Edit foto yang kamu unggah" },
    { a: 17.65, text: "Bukan cuma bikin gambar baru" },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const { k, s } = life(t, r.a, 19.4, 0.4, 0.25);
        if (k <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 70, top: 1010 + i * 128, opacity: k, transform: `translateX(${(1 - s) * -80}px)`, display: "flex", alignItems: "center", gap: 20, ...plastic(PAL.paperCard, "#d9cfbd", 26), padding: "14px 30px 14px 16px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: "#1fa67a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 42 }}>✓</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: INK }}>{r.text}</div>
          </div>
        );
      })}
    </>
  );
};

/** Short warning card (kept low so the 3D scene above stays visible). */
const WarnCard: React.FC<{ t: number; a: number; b: number; badge: React.ReactNode; title: string; body: string }> = ({ t, a, b, badge, title, body }) => {
  const { k, s } = life(t, a, b, 0.45, 0.3);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 930, opacity: k, transform: `translateY(${(1 - s) * 160}px) rotate(${(1 - s) * -4 - 0.8}deg)` }}>
      <div style={{ ...plastic("#d95d39", "#9c3a20", 40), padding: 18 }}>
        <div style={{ position: "relative", background: PAL.paperCard, borderRadius: 26, display: "flex", alignItems: "center", gap: 28, padding: "26px 30px" }}>
          <Tape left={300} rot={3} />
          {badge}
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: "#b0401f" }}>⚠ {title}</div>
            <div style={{ fontFamily: BLACK, fontSize: 48, lineHeight: 1.1, color: INK, marginTop: 6 }}>{body}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge18: React.FC = () => (
  <div style={{ width: 170, height: 170, borderRadius: 85, background: RED, border: "10px solid #fff", boxShadow: `0 0 0 6px ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BLACK, fontSize: 70, color: "#fff", flexShrink: 0 }}>18+</div>
);
const BadgeId: React.FC = () => (
  <div style={{ width: 170, height: 124, borderRadius: 16, background: "#e7eef9", border: `6px solid ${BLUE}`, position: "relative", flexShrink: 0, display: "flex", alignItems: "center", padding: 12, boxSizing: "border-box", gap: 10 }}>
    <MiniPhoto w={62} h={80} bg="blue" suit />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      {[1, 0.8, 0.6].map((w, i) => (
        <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "#9aaecb", borderRadius: 5 }} />
      ))}
    </div>
  </div>
);

/** Hook chip: required background colour. */
const SyaratChip: React.FC<{ t: number }> = ({ t }) => {
  const { k, s } = life(t, 2.9, 3.35, 0.35, 0.25);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 640, top: 760, opacity: k, transform: `scale(${s}) rotate(4deg)`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 18, ...plastic(PAL.paperCard, "#d9cfbd", 26), padding: "16px 26px 16px 16px" }}>
      <div style={{ width: 72, height: 72, borderRadius: 16, background: "radial-gradient(circle at 50% 40%, #4f86ec, #173f9a)" }} />
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "#9a6a2a" }}>SYARAT</div>
        <div style={{ fontFamily: BLACK, fontSize: 50, color: BLUE }}>BIRU</div>
      </div>
    </div>
  );
};

/** EP 04 teaser chip. */
const Ep04Chip: React.FC<{ t: number }> = ({ t }) => {
  const { k, s } = life(t, 81.6, 83.0, 0.4, 0.25);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 70, top: 1120, opacity: k, transform: `scale(${s}) rotate(-3deg)`, transformOrigin: "100% 50%", ...plastic(HONEY, "#a9741f", 30), padding: "16px 30px", fontFamily: BLACK, fontSize: 48, color: INK }}>
      dibahas di EP 04 →
    </div>
  );
};

/** "Tidak perlu mulai dari awal" strike chip. */
const NoRestartChip: React.FC<{ t: number }> = ({ t }) => {
  const { k, s } = life(t, 64.05, 67.3, 0.35, 0.25);
  if (k <= 0) return null;
  const strike = io(t, 64.5, 64.9);
  return (
    <div style={{ position: "absolute", left: 70, top: 520, opacity: k, transform: `scale(${s}) rotate(-2deg)`, transformOrigin: "0 50%", ...plastic(PAL.paperCard, "#d9cfbd", 26), padding: "14px 30px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", fontFamily: SANS, fontWeight: 800, fontSize: 42, color: "#7a7268" }}>
        ↺ mulai dari awal
        <div style={{ position: "absolute", left: -6, top: "52%", height: 8, width: `${strike * 104}%`, background: RED, borderRadius: 4 }} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------
// Karaoke captions: phrases ≤4 words on one line, longer phrases on two balanced lines.
type W = { w: string; s: number; e: number };
type Chunk = { words: W[]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const clips = timeline.clips as { start: number; end: number; words: W[] }[];
  clips.forEach((c, ci) => {
    const groups: W[][] = [];
    let cur: W[] = [];
    c.words.forEach((w, i) => {
      cur.push(w);
      const left = c.words.length - i - 1;
      const punct = /[,.:?!]$/.test(w.w);
      if ((cur.length >= 6 || (punct && cur.length >= 3)) && (left === 0 || left >= 2)) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) {
      if (cur.length === 1 && groups.length) groups[groups.length - 1].push(...cur);
      else groups.push(cur);
    }
    const nextClip = clips[ci + 1]?.start ?? c.end + 1;
    groups.forEach((g, gi) => {
      const a = g[0].s - 0.08;
      const b = gi < groups.length - 1 ? groups[gi + 1][0].s - 0.08 : Math.min(c.end + 0.35, nextClip - 0.1);
      out.push({ words: g, a, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= 86.2) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const n = ch.words.length;
  const split = n <= 4 ? n : Math.ceil(n / 2);
  const lines = n <= 4 ? [ch.words] : [ch.words.slice(0, split), ch.words.slice(split)];
  const enter = backOut(remap(t, ch.a, ch.a + 0.2));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 1920 - 1520, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `translateY(${(1 - enter) * 20}px)` }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 10, background: PAL.paperCard, borderRadius: 14, padding: "8px 22px", boxShadow: "0 8px 0 #d9cfbd, 0 18px 28px rgba(0,0,0,0.45)", transform: `rotate(${li ? 0.8 : -0.8}deg)` }}>
          {ln.map((w, wi) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const done = t >= w.e + 0.05;
            const bounce = active ? 1 + 0.12 * Math.sin(Math.PI * remap(t, w.s - 0.03, w.s + 0.15)) : 1;
            return (
              <span
                key={wi}
                style={{
                  fontFamily: BLACK,
                  fontSize: 56,
                  lineHeight: 1.12,
                  color: active ? INK : done ? INK : "#8a8278",
                  background: active ? HONEY : "transparent",
                  borderRadius: 10,
                  padding: "0 8px",
                  margin: 0,
                  display: "inline-block",
                  transform: `scale(${bounce}) translateY(${active ? -4 * (bounce - 1) * 8 : 0}px)`,
                }}
              >
                {w.w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------------------------------
export const Hud: React.FC<{ t: number }> = ({ t }) => {
  // white flash as the camera passes through the chat window (hook → konteks)
  const flash = remap(t, 11.3, 11.59) * (1 - remap(t, 11.59, 11.9));
  // gentle dim behind the warning cards
  const dim = io(t, 69.55, 70.0) * (1 - io(t, 77.95, 78.3)) * 0.28;
  return (
    <>
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(8,10,16,${dim})` }} />}

      {/* HOOK */}
      <Label t={t} a={0.25} b={3.3} kicker="PAS FOTO" title={<>LATAR <span style={{ color: RED }}>MERAH?</span></>} />
      <SyaratChip t={t} />

      {/* KONTEKS */}
      <Label t={t} a={11.75} b={13.15} kicker="KITA PAKAI" title="Gemini dari Google" />
      <Label t={t} a={13.3} b={19.3} kicker="MODEL GAMBAR" title={<>Nano Banana <span style={{ color: BLUE }}>2</span></>} />
      <CheckList t={t} />

      {/* LANGKAH */}
      <StepBadge t={t} a={19.58} b={23.3} n={1} title="Buka Gemini" />
      <StepBadge t={t} a={23.35} b={24.35} n={2} title="Unggah foto" />
      <StepBadge t={t} a={24.4} b={30.9} n={3} title="Ketik perintah" />
      <StepBadge t={t} a={31.0} b={32.3} n={4} title="Kirim & tunggu" />
      <StepBadge t={t} a={33.55} b={38.7} n={5} title="Buka Library" />
      <Tablet t={t} />
      <TabletCursor t={t} />

      {/* PENJELASAN */}
      <Label t={t} a={39.32} b={43.3} kicker="KUNCINYA" title="Perintah yang jelas" />
      <RuleTags t={t} />
      <Label t={t} a={43.48} b={48.6} kicker="CONTOH 1" title="Ganti baju" />
      <PromptBox t={t} a={44.6} b={48.65} text="pakaikan jas hitam dan kemeja putih, pose tetap sama" ta={45.35} tb={48.5} send={48.55} thumbs={[<MiniPhoto key="p" w={66} h={84} bg="blue" />]} thumbAt={44.7} />
      <Label t={t} a={48.8} b={54.3} kicker="CONTOH 2" title="Gabung beberapa foto" />
      <PromptBox
        t={t}
        a={49.9}
        b={54.3}
        text="gabungkan jadi satu gambar baru"
        ta={51.3}
        tb={53.6}
        send={53.75}
        thumbs={[<MiniPhoto key="a" w={60} h={76} bg="blue" suit />, <MiniPhoto key="b" w={60} h={76} bg="green" shirt="#f2b400" />, <MiniPhoto key="c" w={60} h={76} bg="park" empty />]}
        thumbAt={50.0}
      />
      <Label t={t} a={54.48} b={62.4} kicker="CONTOH 3" title="Foto produk jualan" />
      <PromptBox t={t} a={55.3} b={62.3} text="taruh di atas meja kayu dengan cahaya pagi, bentuk produk jangan diubah" ta={57.4} tb={61.85} send={60.5} thumbs={[<MiniPhoto key="p" w={66} h={84} bg="grey" product />]} thumbAt={55.5} />

      {/* PAYOFF */}
      <Label t={t} a={62.6} b={69.4} kicker="REVISI KECIL" title="Hasilnya belum pas?" />
      <NoRestartChip t={t} />
      <PromptBox t={t} a={65.4} b={69.45} text="latarnya sedikit lebih terang" ta={67.55} tb={68.85} send={68.98} thumbs={[<MiniPhoto key="p" w={66} h={84} bg="blue" suit />]} thumbAt={65.5} />
      <WarnCard t={t} a={69.7} b={74.35} badge={<Badge18 />} title="PERHATIKAN" body="Edit foto tidak tersedia untuk pengguna di bawah 18 tahun" />
      <WarnCard t={t} a={74.6} b={77.95} badge={<BadgeId />} title="DOKUMEN RESMI" body="Cek dulu aturan pas foto yang berlaku" />

      {/* OUTRO */}
      <Label t={t} a={78.45} b={83.0} kicker="HASIL EDIT GEMINI" title="Tanda air tak terlihat" />
      <Ep04Chip t={t} />
      <Label t={t} a={83.2} b={86.1} kicker="BERIKUTNYA" title="Foto lama jadi video" />

      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fffaf0", opacity: flash }} />}
      <Captions t={t} />
    </>
  );
};
