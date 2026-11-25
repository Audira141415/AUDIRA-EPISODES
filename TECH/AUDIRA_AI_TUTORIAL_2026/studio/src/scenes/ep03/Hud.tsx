// EP03 HUD layers (all in 1080x1920 units, scaled by the parent): titles, context ledger, the
// generic engraved "Create video" interface with cursor and step medallions, the rules cards
// and the outro titles. Every beat is keyed to VO seconds from timeline.json.
import React, { useMemo } from "react";
import { BROWN, GOLD, INK, PARCH, TERRA, VERD, photoTex } from "./textures.ts";
import TL from "./timeline.json";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', Courier, monospace";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const backOut = (x: number) => {
  const c = 1.6, v = clamp01(x) - 1;
  return 1 + (c + 1) * v * v * v + c * v * v;
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0..1..0 visibility for [a, b] with fades. */
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(clamp01((t - a) / fi), clamp01((b - t) / fo));

type Word = { w: string; s: number; e: number };
const clip = (id: string) => TL.clips.find((c) => c.id === id)!;
const wordsOf = (id: string) => clip(id).words as Word[];
const wordT = (id: string, i: number) => wordsOf(id)[i].s;

// ---------------------------------------------------------------- shared vintage pieces
const brassBorder = `linear-gradient(135deg, #e8cf8e 0%, ${GOLD} 30%, #8a6a35 55%, #d9bb76 80%, #7a5a2a 100%)`;
const paper = `radial-gradient(120% 90% at 30% 20%, #f8f0de 0%, ${PARCH} 55%, #e6d5b0 100%)`;

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; pad?: number }> = ({ style, children, pad = 28 }) => (
  <div style={{ position: "absolute", padding: 7, borderRadius: 18, background: brassBorder, boxShadow: "0 24px 50px rgba(40,22,8,0.45), 0 4px 10px rgba(40,22,8,0.3)", ...style }}>
    <div style={{ borderRadius: 12, background: paper, padding: pad, height: "100%", boxSizing: "border-box", boxShadow: "inset 0 0 40px rgba(120,80,30,0.18)" }}>{children}</div>
  </div>
);

const Arrow: React.FC<{ w?: number; color?: string }> = ({ w = 90, color = INK }) => (
  <svg width={w} height={30} viewBox="0 0 90 30" style={{ display: "block" }}>
    <path d="M2 15 H78" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M66 4 L86 15 L66 26" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Seal: React.FC<{ label: string; size?: number; color?: string; font?: number }> = ({ label, size = 110, color = TERRA, font }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%", flex: "none",
      background: `radial-gradient(circle at 35% 30%, #e07a5a 0%, ${color} 45%, #7a3020 100%)`,
      boxShadow: "0 6px 14px rgba(60,20,10,0.45), inset 0 -4px 10px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fbeee0", fontFamily: SERIF, fontWeight: 700, fontSize: font ?? size * 0.4, letterSpacing: "0.02em",
    }}
  >
    {label}
  </div>
);

// ---------------------------------------------------------------- hook + title
const HookTags: React.FC<{ t: number }> = ({ t }) => {
  const still = win(t, wordT("l01", 6) - 0.25, 3.3, 0.25, 0.15);
  const moving = win(t, 3.3, 4.5, 0.12, 0.35);
  const pop = backOut((t - 3.3) / 0.35);
  return (
    <>
      {still > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: still }}>
          <div style={{ padding: "14px 34px", background: "rgba(243,234,214,0.92)", border: `3px solid ${BROWN}`, fontFamily: SERIF, fontSize: 50, fontWeight: 700, letterSpacing: "0.14em", color: BROWN }}>
            DIAM DI ALBUM
          </div>
        </div>
      )}
      {moving > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 296, display: "flex", justifyContent: "center", opacity: moving }}>
          <div style={{ padding: "16px 38px", background: TERRA, transform: `rotate(-3deg) scale(${lerp(0.6, 1, pop)})`, fontFamily: SERIF, fontSize: 58, fontWeight: 700, fontStyle: "italic", letterSpacing: "0.06em", color: "#fbeee0", boxShadow: "0 10px 24px rgba(60,20,10,0.4)" }}>
            BERGERAK LAGI!
          </div>
        </div>
      )}
    </>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 4.4, 8.9, 0.4, 0.35);
  if (o <= 0) return null;
  const a = outCubic((t - 4.4) / 0.7), b = outCubic((t - 4.75) / 0.7), c = outCubic((t - wordT("l02", 6)) / 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 860, background: "linear-gradient(180deg, rgba(234,219,184,0.95) 0%, rgba(234,219,184,0.9) 66%, rgba(234,219,184,0) 100%)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 262, fontFamily: SERIF }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: a }}>
          <div style={{ width: 54 * a, height: 2, background: BROWN }} />
          <span style={{ fontSize: 30, letterSpacing: "0.32em", color: BROWN, fontWeight: 700 }}>AUDIRA AI TUTORIAL</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 138, lineHeight: 0.98, fontWeight: 700, color: INK, transform: `translateY(${(1 - a) * 40}px)`, opacity: a }}>FOTO LAMA</div>
        <div style={{ fontSize: 138, lineHeight: 1.0, fontWeight: 700, fontStyle: "italic", color: TERRA, transform: `translateY(${(1 - b) * 40}px)`, opacity: b }}>JADI VIDEO</div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16, opacity: c, transform: `translateX(${(1 - c) * -30}px)` }}>
          <div style={{ width: 420 * c, height: 3, background: `linear-gradient(90deg, ${GOLD}, rgba(197,160,89,0))` }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 46, fontStyle: "italic", color: BROWN, opacity: c }}>cara resminya di Gemini</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- context
const Context1: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 9.3, 13.85, 0.3, 0.3);
  if (o <= 0) return null;
  const r1 = outCubic((t - wordT("l03", 3)) / 0.5);
  const dim1 = sine((t - wordT("l03", 9)) / 0.4);
  const r2 = backOut((t - wordT("l03", 12)) / 0.45);
  const row = (src: string, k: number, hi: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 26, justifyContent: "center", opacity: clamp01(k), transform: `translateX(${(1 - clamp01(k)) * -60}px)` }}>
      <div style={{ width: 300, textAlign: "right", fontFamily: SERIF, fontSize: 70, fontWeight: 700, color: hi ? TERRA : INK }}>{src}</div>
      <Arrow w={110} color={hi ? TERRA : INK} />
      <div style={{ width: 300, fontFamily: SERIF, fontSize: 70, fontWeight: 700, fontStyle: "italic", color: hi ? TERRA : INK }}>VIDEO</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(234,219,184,0.9) 0%, rgba(234,219,184,0.7) 60%, rgba(234,219,184,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: SERIF, fontSize: 34, letterSpacing: "0.3em", color: BROWN, fontWeight: 700 }}>GEMINI BISA MEMBUAT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 370, display: "flex", flexDirection: "column", gap: 34 }}>
        <div style={{ opacity: lerp(1, 0.45, dim1) }}>{row("TEKS", r1, false)}</div>
        <div style={{ transform: `scale(${lerp(0.85, 1.06, clamp01(r2))})` }}>{row("FOTO", r2, true)}</div>
      </div>
    </div>
  );
};

const Context2: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 13.95, 20.85, 0.35, 0.25);
  if (o <= 0) return null;
  const enter = outCubic((t - 13.95) / 0.6);
  const rows: [string, string, number][] = [
    ["Menu", "Create video", wordT("l04", 4)],
    ["Model video", "Gemini Omni", wordT("l04", 10)],
    ["Syarat", "Masuk akun Google", wordT("l04", 15)],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Card style={{ left: 60, width: 560, top: 290, height: 470, transform: `perspective(1600px) rotateY(${(1 - enter) * -30 + 8}deg) translateX(${(1 - enter) * -80}px)`, transformOrigin: "0% 50%" }} pad={34}>
        <div style={{ fontFamily: SERIF, fontSize: 26, letterSpacing: "0.26em", fontWeight: 700, color: BROWN }}>CATATAN PENTING</div>
        <div style={{ marginTop: 10, height: 3, background: `linear-gradient(90deg, ${GOLD}, rgba(197,160,89,0))` }} />
        {rows.map(([k, v, at], i) => {
          const r = outCubic((t - at + 0.15) / 0.45);
          return (
            <div key={i} style={{ marginTop: 24, opacity: r, transform: `translateX(${(1 - r) * 40}px)` }}>
              <div style={{ fontFamily: SERIF, fontSize: 26, color: BROWN, fontStyle: "italic" }}>{k}</div>
              <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 700, color: i === 1 ? TERRA : INK, lineHeight: 1.1 }}>{v}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------- the interface panel
// Panel box (1080 units): left 70, top 430, 940 x 840. Children use panel-local coordinates.
const PX = 70, PY = 430, PW = 940, PH = 840;

type Cam = [number, number, number, number]; // t, scale, tx, ty
const PANEL_CAM: Cam[] = [
  [21.6, 1.0, 0, 0],
  [23.9, 1.06, 0, 40],
  [24.7, 1.12, 100, 50],
  [27.2, 1.1, 90, 40],
  [27.9, 1.04, -10, 30],
  [30.1, 1.04, 0, 10],
  [33.0, 1.1, 30, -40],
  [37.5, 1.06, 0, -40],
  [38.5, 1.1, 0, -130],
  [53.6, 1.08, 0, -120],
  [54.4, 1.04, 0, -30],
];
const panelCam = (t: number) => {
  let i = 0;
  while (i < PANEL_CAM.length - 1 && t > PANEL_CAM[i + 1][0]) i++;
  const a = PANEL_CAM[i], b = PANEL_CAM[Math.min(i + 1, PANEL_CAM.length - 1)];
  const k = a === b ? 0 : sine((t - a[0]) / (b[0] - a[0]));
  return { s: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k) };
};

/** Cursor path in panel coordinates: [t, x, y, click?]. */
const CURSOR: [number, number, number, number][] = [
  [21.3, 620, 330, 0],
  [21.55, 560, 42, 1], // address bar
  [24.4, 560, 120, 0],
  [25.2, 120, 130, 0], // sidebar, top left
  [26.55, 130, 196, 1], // Create video
  [27.6, 330, 290, 0],
  [28.9, 360, 290, 1], // template
  [30.1, 360, 440, 0],
  [30.65, 370, 452, 1], // Add image
  [32.4, 600, 470, 0],
  [37.6, 640, 700, 0],
  [38.0, 520, 690, 1], // prompt box
  [41.2, 600, 760, 0],
  [53.9, 845, 770, 0],
  [54.35, 862, 772, 1], // send
  [55.4, 560, 470, 0],
  [55.92, 585, 440, 1], // play
];
const cursorAt = (t: number) => {
  let i = 0;
  while (i < CURSOR.length - 1 && t > CURSOR[i + 1][0]) i++;
  const a = CURSOR[i], b = CURSOR[Math.min(i + 1, CURSOR.length - 1)];
  const k = a === b ? 1 : sine((t - a[0]) / (b[0] - a[0]));
  const lastClick = [...CURSOR].reverse().find((c) => c[3] && c[0] <= t);
  const since = lastClick ? t - lastClick[0] : 99;
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), since };
};

const Cursor: React.FC<{ t: number }> = ({ t }) => {
  const c = cursorAt(t);
  const press = c.since < 0.18 ? 0.82 : 1;
  const ring = c.since < 0.6 ? c.since / 0.6 : -1;
  return (
    <>
      {ring >= 0 && (
        <div style={{ position: "absolute", left: c.x - 60 * ring - 12, top: c.y - 60 * ring - 12, width: 24 + 120 * ring, height: 24 + 120 * ring, borderRadius: "50%", border: `5px solid ${TERRA}`, opacity: 1 - ring }} />
      )}
      <svg width={70} height={80} viewBox="0 0 28 32" style={{ position: "absolute", left: c.x - 6, top: c.y - 3, transform: `scale(${press})`, transformOrigin: "6px 3px", filter: "drop-shadow(0 6px 6px rgba(40,20,5,0.45))" }}>
        <path d="M3 2 L3 25 L9 19.5 L13 29 L17 27.3 L13 18 L21 18 Z" fill={PARCH} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </>
  );
};

const typed = (text: string, t: number, t0: number, t1: number) => text.slice(0, Math.round(text.length * clamp01((t - t0) / (t1 - t0))));
const Caret: React.FC<{ t: number }> = ({ t }) => <span style={{ opacity: Math.floor(t * 2.5) % 2 ? 0 : 1, color: TERRA }}>|</span>;

/** The good prompt, typed word by word on the VO timings of l12. */
const PROMPT_WORDS = wordsOf("l12").slice(3);
const CATS: { from: number; to: number; label: string; color: string }[] = [
  { from: 0, to: 4, label: "GERAKAN", color: TERRA },
  { from: 5, to: 7, label: "KAMERA", color: VERD },
  { from: 8, to: 11, label: "CAHAYA", color: "#b8862b" },
  { from: 12, to: 16, label: "SUASANA", color: BROWN },
];
const Prompt: React.FC<{ t: number }> = ({ t }) => {
  const hi = sine((t - 50.6) / 0.6);
  return (
    <span>
      {PROMPT_WORDS.map((w, i) => {
        const text = (i === 0 ? "Nenek" : w.w) + " ";
        const k = clamp01((t - w.s) / Math.max(0.12, w.e - w.s));
        if (k <= 0) return null;
        const cat = CATS.find((c) => i >= c.from && i <= c.to)!;
        return (
          <span key={i} style={{ borderBottom: hi > 0 ? `6px solid ${cat.color}` : undefined, borderBottomColor: hi > 0 ? `${cat.color}${Math.round(hi * 255).toString(16).padStart(2, "0")}` : undefined }}>
            {text.slice(0, Math.max(1, Math.round(text.length * k)))}
          </span>
        );
      })}
    </span>
  );
};

const STEPS: { n: number; a: number; b: number; title: string }[] = [
  { n: 1, a: 21.29, b: 24.4, title: "Buka gemini.google.com" },
  { n: 2, a: 24.4, b: 27.5, title: "Sidebar kiri atas: Create video" },
  { n: 3, a: 27.5, b: 30.0, title: "Pilih template (opsional)" },
  { n: 4, a: 30.0, b: 37.99, title: "Add image: unggah fotomu" },
  { n: 5, a: 37.99, b: 54.23, title: "Tulis gerakannya" },
  { n: 6, a: 54.23, b: 56.4, title: "Tunggu, lalu putar hasilnya" },
];

const StepBadge: React.FC<{ t: number }> = ({ t }) => {
  const s = STEPS.find((x) => t >= x.a && t < x.b);
  if (!s) return null;
  const k = backOut((t - s.a) / 0.45);
  const o = Math.min(clamp01((t - s.a) / 0.2), s.n === 6 ? clamp01((56.3 - t) / 0.25) : 1);
  return (
    <div style={{ position: "absolute", left: 66, top: 262, right: 60, display: "flex", alignItems: "center", gap: 26, opacity: o }}>
      <div style={{ transform: `scale(${lerp(0.4, 1, k)}) rotate(${(1 - clamp01(k)) * -40}deg)`, width: 136, height: 136, borderRadius: "50%", padding: 7, background: brassBorder, boxShadow: "0 10px 22px rgba(40,22,8,0.45)", flex: "none" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: INK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: "#f1d48f", lineHeight: 1 }}>{s.n}</div>
      </div>
      <div style={{ padding: "10px 22px", background: "rgba(243,234,214,0.94)", borderLeft: `6px solid ${TERRA}`, boxShadow: "0 8px 18px rgba(40,22,8,0.25)", transform: `translateX(${(1 - clamp01(k)) * -40}px)` }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, letterSpacing: "0.28em", fontWeight: 700, color: BROWN }}>LANGKAH {s.n}</div>
        <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: INK, lineHeight: 1.1 }}>{s.title}</div>
      </div>
    </div>
  );
};

const PanelUI: React.FC<{ t: number; photoUrl: string }> = ({ t, photoUrl }) => {
  const createOn = t >= 26.75;
  const tplPick = t >= 28.95;
  const uploadK = outCubic((t - wordT("l08", 5)) / 0.6); // "unggah"
  const slotsK = clamp01((t - wordT("l09", 4)) / 0.9); // "lima"
  const vidK = clamp01((t - wordT("l09", 7)) / 0.4); // "satu video"
  const step5 = t >= 37.99;
  const uploadRowO = 1 - sine((t - 38.0) / 0.4);
  const proc = t >= 54.4 && t < 55.5;
  const result = t >= 55.45;
  const sideItem = (label: string, y: number, on: boolean, glow: number) => (
    <div style={{ position: "absolute", left: 14, top: y, width: 204, height: 54, borderRadius: 10, display: "flex", alignItems: "center", paddingLeft: 16, boxSizing: "border-box", background: on ? INK : glow > 0 ? `rgba(184,90,63,${0.2 * glow})` : "transparent", border: glow > 0 && !on ? `3px solid rgba(184,90,63,${glow})` : "3px solid transparent", color: on ? "#f1d48f" : INK, fontFamily: SERIF, fontSize: 27, fontWeight: on ? 700 : 400 }}>
      {label}
    </div>
  );
  const sideGlow = sine((t - 24.9) / 0.4) * (createOn ? 0 : 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, borderRadius: 24, padding: 12, boxSizing: "border-box", background: brassBorder, boxShadow: "0 40px 80px rgba(30,16,5,0.55), 0 8px 18px rgba(30,16,5,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 14, background: paper, overflow: "hidden" }}>
        {/* header + address bar */}
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 84, background: "#e3d2ab", borderBottom: `2px solid ${BROWN}40` }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 22 + i * 30, top: 32, width: 18, height: 18, borderRadius: "50%", background: brassBorder }} />
          ))}
          <div style={{ position: "absolute", left: 130, top: 16, width: 760, height: 52, borderRadius: 26, background: PARCH, border: `2px solid ${BROWN}55`, display: "flex", alignItems: "center", paddingLeft: 24, boxSizing: "border-box", fontFamily: MONO, fontSize: 32, color: INK, fontWeight: 700 }}>
            {typed("gemini.google.com", t, 21.6, 22.7)}
            {t > 21.4 && t < 24.2 && <Caret t={t} />}
          </div>
        </div>
        {/* sidebar */}
        <div style={{ position: "absolute", left: 0, top: 84, width: 232, bottom: 0, background: "#eadcbc", borderRight: `2px solid ${BROWN}30` }}>
          {sideItem("+ Chat baru", 22, false, 0)}
          {sideItem("Create video", 86, createOn, sideGlow)}
          {sideItem("Riwayat", 150, false, 0)}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 30, top: 236 + i * 46, width: 150 - i * 18, height: 12, borderRadius: 6, background: `${BROWN}22` }} />
          ))}
        </div>
        {/* main area */}
        <div style={{ position: "absolute", left: 252, top: 100, right: 20, bottom: 20 }}>
          {!createOn && t < 26.9 && (
            <div style={{ opacity: 1 - clamp01((t - 26.6) / 0.25) }}>
              <div style={{ marginTop: 120, fontFamily: SERIF, fontSize: 52, fontStyle: "italic", color: BROWN, textAlign: "center" }}>Halo, mau buat apa?</div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ margin: "26px auto 0", width: 460 - i * 90, height: 14, borderRadius: 7, background: `${BROWN}22` }} />
              ))}
            </div>
          )}
          {createOn && (
            <div style={{ position: "absolute", inset: 0, opacity: clamp01((t - 26.75) / 0.3) }}>
              <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 700, color: INK, opacity: uploadRowO }}>Create video</div>
              {/* templates */}
              <div style={{ opacity: uploadRowO, display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 26, color: BROWN }}>Template</span>
                <span style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: "0.2em", color: "#fbeee0", background: VERD, padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>OPSIONAL</span>
              </div>
              <div style={{ opacity: uploadRowO, position: "absolute", top: 110, left: 0, display: "flex", gap: 18 }}>
                {["Kenangan", "Sinematik", "Lukisan"].map((n, i) => {
                  const on = tplPick && i === 0;
                  return (
                    <div key={n} style={{ width: 196, height: 170, borderRadius: 12, padding: 6, boxSizing: "border-box", background: on ? TERRA : `${BROWN}30`, transform: on ? `scale(${lerp(1.08, 1.04, clamp01((t - 28.95) / 0.3))})` : undefined }}>
                      <div style={{ width: "100%", height: 112, borderRadius: 8, background: `linear-gradient(160deg, #d9c39a, ${["#8a6a44", "#5c4630", "#a4875e"][i]})` }} />
                      <div style={{ marginTop: 8, textAlign: "center", fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: on ? "#fbeee0" : INK }}>{n}</div>
                    </div>
                  );
                })}
              </div>
              {/* upload row */}
              <div style={{ opacity: uploadRowO, position: "absolute", top: 310, left: 0, right: 0 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 26px", borderRadius: 32, background: t >= 30.65 ? INK : PARCH, color: t >= 30.65 ? "#f1d48f" : INK, border: `3px solid ${INK}`, fontFamily: SERIF, fontSize: 30, fontWeight: 700 }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>+</span> Add image
                </div>
                <span style={{ marginLeft: 18, fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: TERRA, opacity: clamp01(slotsK * 2) }}>maks. 5 gambar + 1 video</span>
                <div style={{ position: "absolute", top: 86, left: 0, display: "flex", gap: 12, alignItems: "center" }}>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const filled = i === 0 ? uploadK : clamp01(slotsK * 5 - (i - 1));
                    return (
                      <div key={i} style={{ width: 78, height: 96, borderRadius: 8, border: `3px dashed ${BROWN}88`, position: "relative", boxSizing: "border-box" }}>
                        {filled > 0 && (
                          <img src={photoUrl} style={{ position: "absolute", inset: 2, width: 68, height: 86, objectFit: "cover", borderRadius: 5, opacity: filled, transform: `translateY(${(1 - filled) * -40}px)`, filter: i ? "sepia(0.4) brightness(0.92)" : undefined }} />
                        )}
                      </div>
                    );
                  })}
                  <div style={{ width: 96, height: 96, borderRadius: 8, border: `3px dashed ${TERRA}`, background: `rgba(184,90,63,${0.25 * vidK})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={40} height={40} viewBox="0 0 10 10" style={{ opacity: 0.4 + 0.6 * vidK }}>
                      <path d="M2 1 L9 5 L2 9 Z" fill={TERRA} />
                    </svg>
                  </div>
                </div>
              </div>
              {/* category chips (step 5) */}
              {step5 && (
                <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {CATS.map((c, i) => {
                    const k = backOut((t - 50.6 - i * 0.28) / 0.4);
                    return (
                      <div key={c.label} style={{ opacity: clamp01(k), transform: `scale(${lerp(0.5, 1, k)})`, padding: "8px 18px", borderRadius: 24, background: c.color, color: "#fbeee0", fontFamily: SERIF, fontSize: 26, fontWeight: 700, letterSpacing: "0.12em" }}>
                        ✓ {c.label}
                      </div>
                    );
                  })}
                  <div style={{ width: "100%", marginTop: 6, fontFamily: SERIF, fontSize: 30, fontStyle: "italic", color: INK, opacity: clamp01((t - 52.6) / 0.4) }}>
                    makin jelas, makin terarah hasilnya
                  </div>
                </div>
              )}
              {/* prompt box */}
              <div style={{ position: "absolute", top: 490, left: 0, right: 0, height: 220, borderRadius: 16, background: "#fbf5e6", border: `3px solid ${t >= 38 && t < 54.4 ? TERRA : BROWN + "88"}`, padding: "16px 90px 16px 20px", boxSizing: "border-box", fontFamily: MONO, fontSize: 31, lineHeight: 1.3, color: INK, fontWeight: 700 }}>
                {t < 38 && <span style={{ color: `${BROWN}88`, fontWeight: 400, fontStyle: "italic" }}>Jelaskan gerakan videomu…</span>}
                {t >= 38 && t < 41.25 && (
                  <span style={{ position: "relative" }}>
                    {typed("buat bergerak", t, 40.4, 40.95)}
                    {t < 40.9 && <Caret t={t} />}
                    {t >= 40.95 && <span style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 5, background: TERRA }} />}
                  </span>
                )}
                {t >= 41.25 && (
                  <>
                    <Prompt t={t} />
                    {t < 50 && <Caret t={t} />}
                  </>
                )}
                {/* send */}
                <div style={{ position: "absolute", right: 14, bottom: 14, width: 60, height: 60, borderRadius: "50%", background: t >= 54.35 ? TERRA : INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={30} height={30} viewBox="0 0 10 10">
                    <path d="M1 5 H8 M5 2 L8 5 L5 8" stroke="#f1d48f" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* bad example verdict */}
              {t >= 39.4 && t < 41.3 && (
                <div style={{ position: "absolute", top: 380, left: 0, display: "flex", alignItems: "center", gap: 14, opacity: win(t, 39.4, 41.3, 0.2, 0.2) }}>
                  <Seal label="✗" size={74} font={44} />
                  <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: TERRA }}>Jangan cuma: “buat bergerak”</div>
                </div>
              )}
              {t >= 41.3 && t < 50.4 && (
                <div style={{ position: "absolute", top: 380, left: 0, display: "flex", alignItems: "center", gap: 14, opacity: win(t, 41.3, 50.4, 0.3, 0.3) }}>
                  <Seal label="✓" size={74} font={44} color={VERD} />
                  <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: VERD }}>Jelaskan adegannya</div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* processing + result overlay */}
        {(proc || result) && (
          <div style={{ position: "absolute", left: 252, top: 100, right: 20, bottom: 20, background: "rgba(243,234,214,0.96)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: clamp01((t - 54.4) / 0.2) }}>
            {proc && (
              <>
                <svg width={150} height={150} viewBox="-12 -12 24 24" style={{ transform: `rotate(${t * 220}deg)` }}>
                  <path d={Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; const r = i % 4 === 1 || i % 4 === 2 ? 11 : 9; return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`; }).join(" ") + "Z"} fill={GOLD} stroke={BROWN} strokeWidth={0.6} />
                  <circle r={3} fill={PARCH} stroke={BROWN} strokeWidth={0.6} />
                </svg>
                <div style={{ fontFamily: SERIF, fontSize: 40, fontStyle: "italic", color: INK }}>Memproses video…</div>
                <div style={{ width: 420, height: 16, borderRadius: 8, background: `${BROWN}30`, overflow: "hidden" }}>
                  <div style={{ width: `${clamp01((t - 54.45) / 1.0) * 100}%`, height: "100%", background: TERRA }} />
                </div>
              </>
            )}
            {result && (
              <div style={{ position: "relative", transform: `scale(${lerp(0.8, 1, outCubic((t - 55.45) / 0.3))})` }}>
                <div style={{ padding: 8, background: brassBorder, borderRadius: 10 }}>
                  <img src={photoUrl} style={{ width: 300, height: 375, objectFit: "cover", display: "block", borderRadius: 4 }} />
                </div>
                <div style={{ position: "absolute", left: 105, top: 140, width: 110, height: 110, borderRadius: "50%", background: "rgba(30,27,24,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={50} height={50} viewBox="0 0 10 10">
                    <path d="M3 1.5 L9 5 L3 8.5 Z" fill="#f1d48f" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <Cursor t={t} />
        </div>
      </div>
    </div>
  );
};

const Panel: React.FC<{ t: number }> = ({ t }) => {
  const photoUrl = useMemo(() => {
    const img = photoTex().image as HTMLCanvasElement | undefined;
    return img && img.toDataURL ? img.toDataURL("image/jpeg", 0.85) : "";
  }, []);
  if (t < 20.95 || t > 56.45) return null;
  const enter = outCubic((t - 20.95) / 0.65);
  const exit = sine((t - 55.98) / 0.42);
  const cam = panelCam(t);
  const s = lerp(0.18, 1, enter) * lerp(1, 2.8, exit) * cam.s;
  const o = clamp01((t - 20.95) / 0.3) * (1 - exit);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(234,219,184,0.6)", opacity: o }} />
      <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, opacity: o, transform: `translate(${cam.x}px, ${cam.y}px) scale(${s})`, transformOrigin: "50% 50%" }}>
        <PanelUI t={t} photoUrl={photoUrl} />
      </div>
      {/* the panel bursts like a film-gate flash into the 3D result */}
      {exit > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff4dc", opacity: Math.sin(Math.PI * exit) * 0.75 }} />}
      <StepBadge t={t} />
    </>
  );
};

// ---------------------------------------------------------------- rules (payoff)
const RULES: { a: number; b: number; seal: string; title: string; body: string }[] = [
  { a: wordT("l15", 6), b: 61.2, seal: "I", title: "Foto milikmu sendiri", body: "Unggah hanya foto yang kamu punya haknya." },
  { a: 61.26, b: 64.8, seal: "II", title: "Minta izin dulu", body: "Ada orang di foto? Minta izin mereka atau keluarganya." },
  { a: 64.83, b: 69.03, seal: "✗", title: "Jangan buat video palsu", body: "Jangan pakai foto orang lain untuk menipu." },
  { a: 69.07, b: 73.84, seal: "IV", title: "Simpan foto aslinya", body: "Video AI = tafsiran, bukan rekaman kejadian." },
  { a: 73.87, b: 76.95, seal: "18+", title: "Usia 18 tahun ke atas", body: "Dan wajib masuk ke akun Google." },
];

const Rules: React.FC<{ t: number }> = ({ t }) => {
  const head = win(t, 56.88, 76.95, 0.35, 0.3);
  if (head <= 0) return null;
  const hk = backOut((t - 56.88) / 0.5);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: lerp(560, 900, sine((t - 58.7) / 0.5)), opacity: head, background: "linear-gradient(180deg, rgba(234,219,184,0.92) 0%, rgba(234,219,184,0.75) 62%, rgba(234,219,184,0) 100%)" }} />
      <div style={{ position: "absolute", left: 72, top: 262, display: "flex", alignItems: "center", gap: 20, opacity: head, transform: `translateY(${(1 - clamp01(hk)) * -30}px)` }}>
        <div style={{ width: 60, height: 4, background: TERRA }} />
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 62, fontWeight: 700, color: INK, letterSpacing: "0.06em" }}>ATURAN PENTING</div>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontStyle: "italic", color: BROWN }}>dari Google, sebelum mengunggah</div>
        </div>
      </div>
      {/* progress dots */}
      <div style={{ position: "absolute", left: 72, top: 410, display: "flex", gap: 12, opacity: head }}>
        {RULES.map((r, i) => (
          <div key={i} style={{ width: t >= r.a ? 46 : 18, height: 12, borderRadius: 6, background: t >= r.a ? TERRA : `${BROWN}44` }} />
        ))}
      </div>
      {RULES.map((r, i) => {
        const o = win(t, r.a, r.b, 0.25, 0.25);
        if (o <= 0) return null;
        const k = outCubic((t - r.a) / 0.5);
        const out = clamp01((t - (r.b - 0.25)) / 0.25);
        return (
          <Card key={i} style={{ left: 72, right: 72, top: 460, height: 300, opacity: o, transform: `perspective(1400px) translateX(${(1 - k) * 160 - out * 120}px) rotateY(${(1 - k) * -18}deg)` }} pad={34}>
            <div style={{ display: "flex", gap: 30, alignItems: "center", height: "100%" }}>
              <Seal label={r.seal} size={140} font={r.seal.length > 2 ? 46 : 58} />
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: i === 2 ? TERRA : INK, lineHeight: 1.08 }}>{r.title}</div>
                <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 36, color: BROWN, lineHeight: 1.22 }}>{r.body}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- outro titles
const OutroTitles: React.FC<{ t: number }> = ({ t }) => {
  const q = win(t, 77.3, 79.45, 0.4, 0.3);
  const n = win(t, 79.5, 85.25, 0.4, 0.3);
  const nk = outCubic((t - 79.5) / 0.6);
  return (
    <>
      {(q > 0 || n > 0) && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 860, opacity: Math.max(q, n), background: "linear-gradient(180deg, rgba(234,219,184,0.92) 0%, rgba(234,219,184,0.72) 62%, rgba(234,219,184,0) 100%)" }} />}
      {q > 0 && (
        <div style={{ position: "absolute", left: 72, right: 72, top: 280, opacity: q, fontFamily: SERIF }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: INK, lineHeight: 1.05, transform: `translateY(${(1 - outCubic((t - 77.3) / 0.6)) * 30}px)` }}>Kenangan boleh hidup lagi,</div>
          <div style={{ marginTop: 10, fontSize: 96, fontWeight: 700, fontStyle: "italic", color: TERRA, opacity: clamp01((t - wordT("l20", 4) + 0.1) / 0.3) }}>asal jujur.</div>
        </div>
      )}
      {n > 0 && (
        <Card style={{ left: 90, right: 90, top: 300, height: 420, opacity: n, transform: `translateY(${(1 - nk) * 60}px)` }} pad={40}>
          <div style={{ fontFamily: SERIF, fontSize: 30, letterSpacing: "0.3em", fontWeight: 700, color: BROWN }}>EPISODE BERIKUTNYA</div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 26 }}>
            <svg width={150} height={150} viewBox="0 0 30 30" style={{ flex: "none", transform: `rotate(${Math.sin(t * 1.5) * 8}deg)` }}>
              <circle cx={12} cy={12} r={8.5} fill="rgba(243,234,214,0.6)" stroke={GOLD} strokeWidth={2.6} />
              <path d="M18.5 18.5 L27 27" stroke={BROWN} strokeWidth={3.6} strokeLinecap="round" />
              <path d="M8 9 Q12 6 15 9" stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.7} />
            </svg>
            <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: INK, lineHeight: 1.1 }}>
              Cek foto: asli atau <span style={{ color: TERRA, fontStyle: "italic" }}>buatan AI?</span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

// ---------------------------------------------------------------- karaoke captions
type Chunk = { lines: Word[][]; a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of TL.clips) {
    const ws = c.words as Word[];
    const n = Math.ceil(ws.length / 7);
    const sizes = Array.from({ length: n }, (_, i) => Math.floor(ws.length / n) + (i < ws.length % n ? 1 : 0));
    let i = 0;
    const local: Word[][] = sizes.map((s) => ws.slice(i, (i += s)));
    local.forEach((g, j) => {
      const chars = g.reduce((n, w) => n + w.w.length + 1, 0);
      const lines = g.length <= 4 && (chars <= 24 || g.length < 2) ? [g] : [g.slice(0, Math.ceil(g.length / 2)), g.slice(Math.ceil(g.length / 2))];
      const a = j === 0 ? Math.min(c.start, g[0].s) - 0.05 : g[0].s - 0.05;
      const b = j < local.length - 1 ? local[j + 1][0].s - 0.05 : c.end + 0.25;
      out.push({ lines, a, b });
    });
  }
  // never overlap: a chunk ends where the next begins
  for (let k = 0; k < out.length - 1; k++) out[k].b = Math.min(out[k].b, out[k + 1].a);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= 86.1) return null;
  const ch = CHUNKS.find((c) => t >= c.a && t < c.b);
  if (!ch) return null;
  const o = clamp01((t - ch.a) / 0.06);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 400, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "16px 30px 18px", background: "rgba(243,234,214,0.93)", borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, boxShadow: "0 10px 24px rgba(40,22,8,0.3)", textAlign: "center" }}>
        {ch.lines.map((line, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 18, fontFamily: SERIF, fontSize: 54, fontWeight: 700, lineHeight: 1.22, color: INK, whiteSpace: "nowrap" }}>
            {line.map((w, wi) => {
              const active = t >= w.s && t < Math.max(w.e, w.s + 0.15);
              const past = t >= w.e;
              const bounce = active ? Math.sin(Math.PI * clamp01((t - w.s) / 0.22)) : 0;
              return (
                <span key={wi} style={{ display: "inline-block", color: active ? TERRA : past ? INK : `${INK}99`, transform: `translateY(${-9 * bounce}px)` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <HookTags t={t} />
    <Title t={t} />
    <Context1 t={t} />
    <Context2 t={t} />
    <Panel t={t} />
    <Rules t={t} />
    <OutroTitles t={t} />
    <Captions t={t} />
  </>
);
