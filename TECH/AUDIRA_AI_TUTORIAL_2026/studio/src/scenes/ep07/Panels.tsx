// EP07 tutorial panels (generic, stylised; no real logos). Every tap is locked to a spoken word.
// P1 = chat page (LANGKAH 1-4), P2 = Canvas workspace (Preview, Code, Show console, Select & ask, Share).
import React from "react";
import TL from "./timeline.json";
import { BANG, BC, Btn, Cursor, INK, MONO, P, PAPER, cursorAt, hotAt, inkBox, outBack, ramp, sm, typed, typedWords, type Tap } from "./ui.tsx";

type Wd = { w: string; s: number; e: number };
const clip = (id: string) => (TL.clips as { id: string; words: Wd[] }[]).find((c) => c.id === id)!.words;
const PROMPT_WORDS = (() => {
  const ws = clip("l07");
  const i = ws.findIndex((w) => w.w === "buat");
  return ws.slice(i);
})();
const EDIT_WORDS = (() => {
  const ws = clip("l15");
  const i = ws.findIndex((w) => w.w === "tombolnya");
  return ws.slice(i);
})();

export const PX = 70, PY = 452, PW = 940, PH = 880;

/** Panel frame: slides up with a perspective tilt, drifts slowly, slides away. */
const Frame: React.FC<{ k: number; t: number; a: number; b: number; children: React.ReactNode }> = ({ k, t, a, b, children }) => {
  const inK = sm(ramp(t, a, a + 0.45));
  const outK = sm(ramp(t, b - 0.35, b));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, inK * 1.6) * (1 - outK), transform: `translateY(${(1 - inK) * 140 * k - outK * 120 * k}px) perspective(${1800 * k}px) rotateX(${(1 - inK) * 22 + Math.sin(t * 0.33) * 1.1}deg) rotateY(${Math.sin(t * 0.21) * 1.6}deg) rotateZ(${-0.6 + Math.sin(t * 0.17) * 0.3}deg)`, transformOrigin: "50% 70%" }}>
      <div style={{ position: "absolute", left: PX * k, top: PY * k, width: PW * k, height: PH * k, ...inkBox(k, PAPER, 14, 6, 26), overflow: "hidden" }}>{children}</div>
    </div>
  );
};

const Lines: React.FC<{ k: number; x: number; y: number; ws: number[]; gap?: number; color?: string; h?: number }> = ({ k, x, y, ws, gap = 30, color = "#D9D4C7", h = 14 }) => (
  <>
    {ws.map((w, i) => (
      <div key={i} style={{ position: "absolute", left: x * k, top: (y + i * gap) * k, width: w * k, height: h * k, borderRadius: (h / 2) * k, background: color }} />
    ))}
  </>
);

// ---------------------------------------------------------------- P1: chat page
const P1A = 20.85, P1B = 36.6;
const T_ADD = 24.84, T_CANVAS = 26.24, T_BOX = 27.3, T_SEND = 36.22;
const TAPS1: Tap[] = [
  { t: 21.0, x: 640, y: 70, click: false },
  { t: T_ADD, x: 150, y: 802 },
  { t: T_CANVAS, x: 180, y: 492 },
  { t: T_BOX, x: 520, y: 660 },
  { t: 33.0, x: 620, y: 740, click: false },
  { t: T_SEND, x: 862, y: 802 },
];

export const ChatPanel: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  if (t < P1A || t > P1B) return null;
  const url = typed("gemini.google.com", t, 21.3, 22.5);
  const menu = t >= T_ADD && t < T_CANVAS + 0.35;
  const menuK = outBack(ramp(t, T_ADD, T_ADD + 0.25));
  const chip = t >= T_CANVAS;
  const chipK = outBack(ramp(t, T_CANVAS, T_CANVAS + 0.3), 2.2);
  const prompt = typedWords(PROMPT_WORDS, t);
  const caret = Math.floor(t * 2.6) % 2 === 0;
  const sent = ramp(t, T_SEND + 0.05, T_SEND + 0.35);
  const c = cursorAt(TAPS1, t);
  return (
    <Frame k={k} t={t} a={P1A} b={P1B}>
      {/* browser bar */}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW * k, height: 96 * k, background: P.metalSteel, borderBottom: `${5 * k}px solid ${INK}` }} />
      {[P.bodyCoral, P.accentYellow, P.bodyMint].map((col, i) => (
        <div key={i} style={{ position: "absolute", left: (26 + i * 36) * k, top: 34 * k, width: 24 * k, height: 24 * k, borderRadius: "50%", border: `${4 * k}px solid ${INK}`, background: col, boxSizing: "border-box" }} />
      ))}
      <div style={{ position: "absolute", left: 150 * k, top: 18 * k, width: 760 * k, height: 60 * k, borderRadius: 30 * k, border: `${4 * k}px solid ${INK}`, background: "#FFFFFF", boxSizing: "border-box", display: "flex", alignItems: "center", paddingLeft: 26 * k, fontFamily: MONO, fontWeight: 700, fontSize: 34 * k, color: INK }}>
        {url}
        {t < 23.0 && caret ? "|" : ""}
      </div>
      {/* page body: neutral skeleton chat (no product branding) */}
      <div style={{ position: "absolute", left: 60 * k, top: 150 * k, fontFamily: BC, fontWeight: 800, fontSize: 52 * k, color: INK, opacity: sm(ramp(t, 22.4, 22.9)) }}>Halo! Mau bikin apa?</div>
      <Lines k={k} x={60} y={236} ws={[560, 420, 500]} />
      {/* input box */}
      <div style={{ position: "absolute", left: 30 * k, top: 580 * k, width: 880 * k, height: 270 * k, ...inkBox(k, "#FFFFFF", 6, 5, 28), transform: `translateY(${sent * -12 * k}px)` }}>
        <div style={{ position: "absolute", left: 26 * k, top: 18 * k, right: 26 * k, fontFamily: BC, fontWeight: 700, fontSize: 40 * k, lineHeight: 1.12, color: prompt && sent < 1 ? INK : "#9A9FA6" }}>
          {sent >= 1 ? "Terkirim ✓" : prompt || (t >= T_BOX ? "Tulis perintahmu…" : "Tanya apa saja")}
          {t >= T_BOX && t < T_SEND && caret ? <span style={{ color: P.bodyCoral }}>|</span> : null}
        </div>
      </div>
      <Btn k={k} x={50} y={772} w={210} h={60} label="+ Add Files" hot={hotAt(t, T_ADD, 1.2)} size={32} />
      {chip && (
        <div style={{ position: "absolute", left: 280 * k, top: 772 * k, height: 60 * k, padding: `0 ${22 * k}px`, borderRadius: 30 * k, border: `${4 * k}px solid ${INK}`, background: P.bodyMint, color: "#FFFFFF", fontFamily: BC, fontWeight: 800, fontSize: 32 * k, display: "flex", alignItems: "center", gap: 10 * k, transform: `scale(${chipK})`, boxSizing: "border-box" }}>
          ▦ Canvas
        </div>
      )}
      <div style={{ position: "absolute", left: 830 * k, top: 770 * k, width: 64 * k, height: 64 * k, borderRadius: "50%", border: `${4 * k}px solid ${INK}`, background: hotAt(t, T_SEND) > 0.5 || prompt.length > 3 ? P.bodyCoral : "#E3DED2", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: BANG, fontSize: 40 * k, boxSizing: "border-box" }}>
        ➤
      </div>
      {/* Add Files menu */}
      {menu && (
        <div style={{ position: "absolute", left: 40 * k, top: 380 * k, width: 360 * k, height: 200 * k, ...inkBox(k, "#FFFFFF", 8, 5, 18), transform: `scale(${menuK})`, transformOrigin: "10% 100%" }}>
          {["⇪ Upload files", "▦ Canvas"].map((lab, i) => {
            const hot = i === 1 ? hotAt(t, T_CANVAS - 0.35, 1) : 0;
            return (
              <div key={i} style={{ position: "absolute", left: 12 * k, top: (14 + i * 88) * k, width: 326 * k, height: 76 * k, borderRadius: 12 * k, background: hot > 0 ? P.accentYellow : "transparent", border: `${3 * k}px solid ${hot > 0 ? INK : "transparent"}`, fontFamily: BC, fontWeight: 800, fontSize: 38 * k, color: INK, display: "flex", alignItems: "center", paddingLeft: 18 * k, boxSizing: "border-box" }}>
                {lab}
              </div>
            );
          })}
        </div>
      )}
      <Cursor k={k} {...c} />
    </Frame>
  );
};

// ---------------------------------------------------------------- P2: Canvas workspace
const WINDOWS: [number, number][] = [
  [38.35, 43.62],
  [45.45, 60.58],
  [65.6, 71.48],
];
const T_TRY1 = 41.56, T_TRY2 = 42.36, T_CODE = 45.86, T_ERR = 48.99, T_CONSOLE = 50.07, T_PREV = 53.48, T_SEL = 55.27, T_MARK = 56.53, T_MARK2 = 57.07, T_ASK = 57.59;
const T_SHARE = 66.81, T_SHARE2 = 68.61, T_COPY = 70.37;
const TAPS2: Tap[] = [
  { t: 38.4, x: 560, y: 760, click: false },
  { t: T_TRY1, x: 790, y: 300 },
  { t: T_TRY2, x: 790, y: 400 },
  { t: 45.5, x: 520, y: 600, click: false },
  { t: T_CODE, x: 675, y: 42 },
  { t: T_CONSOLE, x: 375, y: 123 },
  { t: T_PREV, x: 840, y: 42 },
  { t: T_SEL, x: 130, y: 123 },
  { t: T_MARK, x: 660, y: 256 },
  { t: T_MARK2, x: 890, y: 350, click: false },
  { t: T_ASK, x: 640, y: 450 },
  { t: 65.65, x: 560, y: 560, click: false },
  { t: T_SHARE, x: 785, y: 123 },
  { t: T_SHARE2, x: 760, y: 206 },
  { t: T_COPY, x: 700, y: 640 },
];
const ITEMS = [
  { n: "Gula 1 kg", p: 15000 },
  { n: "Teh celup", p: 6000 },
  { n: "Telur", p: 2500 },
];
const rp = (v: number) => "Rp" + v.toLocaleString("id-ID");
const CODE = [
  ["#7FD1B0", "<h1>Kasir Warung</h1>"],
  ["#F4C430", "let total = 0;"],
  ["#FFFFFF", "function tambah(harga) {"],
  ["#FFFFFF", "  total = total + harga;"],
  ["#E9A08F", "  tampilkan(total);"],
  ["#FFFFFF", "}"],
  ["#7FD1B0", '<button onclick="tambah()">'],
  ["#FFFFFF", "  Tambah"],
  ["#7FD1B0", "</button>"],
];

export const CanvasPanel: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const w = WINDOWS.find(([a, b]) => t >= a && t <= b);
  if (!w) return null;
  const code = t >= T_CODE && t < T_PREV;
  const consoleOn = t >= T_CONSOLE && t < T_PREV;
  const big = t >= 65.0 ? 1 : 0; // after Gemini updated the app (shown when the panel returns)
  const total = (t >= T_TRY1 ? ITEMS[0].p : 0) + (t >= T_TRY2 ? ITEMS[1].p : 0);
  const totalPop = Math.max(Math.sin(ramp(t, T_TRY1, T_TRY1 + 0.3) * Math.PI), Math.sin(ramp(t, T_TRY2, T_TRY2 + 0.3) * Math.PI));
  const selK = t >= T_MARK && t < 60.6 ? sm(ramp(t, T_MARK, T_MARK2)) : 0;
  const askK = t >= T_ASK && t < 60.6 ? outBack(ramp(t, T_ASK, T_ASK + 0.3)) : 0;
  const ask = typedWords(EDIT_WORDS, t);
  const shareMenu = t >= T_SHARE && t < T_SHARE2 + 0.3;
  const dialog = t >= T_SHARE2 + 0.15;
  const dialogK = outBack(ramp(t, T_SHARE2 + 0.15, T_SHARE2 + 0.5));
  const copied = t >= T_COPY + 0.1;
  const errBlink = t >= T_ERR && t < T_CONSOLE + 0.2 ? 1 + 0.15 * Math.sin((t - T_ERR) * 14) : 0;
  const c = cursorAt(TAPS2, t);
  const bw = big ? 230 : 190, bh = big ? 76 : 60;
  return (
    <Frame k={k} t={t} a={w[0]} b={w[1]}>
      {/* top bar: title + Code / Preview */}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW * k, height: 84 * k, background: P.metalSteel, borderBottom: `${5 * k}px solid ${INK}` }} />
      <div style={{ position: "absolute", left: 26 * k, top: 18 * k, fontFamily: BC, fontWeight: 800, fontSize: 40 * k, color: INK }}>▦ Canvas · Kasir Warung</div>
      <div style={{ position: "absolute", left: 594 * k, top: 12 * k, width: 332 * k, height: 60 * k, borderRadius: 30 * k, border: `${4 * k}px solid ${INK}`, background: "#FFFFFF", boxSizing: "border-box" }} />
      <Btn k={k} x={600} y={14} w={150} h={56} label="Code" bg={code ? P.accentYellow : "#FFFFFF"} hot={hotAt(t, T_CODE, 0.4)} size={32} />
      <Btn k={k} x={760} y={14} w={160} h={56} label="Preview" bg={!code ? P.accentYellow : "#FFFFFF"} hot={hotAt(t, T_PREV, 0.4)} size={32} />
      {/* toolbar */}
      <Btn k={k} x={20} y={96} w={220} h={56} label="Select & ask" hot={hotAt(t, T_SEL, 1.0)} size={32} />
      <Btn k={k} x={260} y={96} w={230} h={56} label="Show console" hot={hotAt(t, T_CONSOLE, 0.8)} size={32} />
      {errBlink > 0 && (
        <div style={{ position: "absolute", left: 470 * k, top: 82 * k, width: 40 * k, height: 40 * k, borderRadius: "50%", background: "#D8412F", border: `${4 * k}px solid ${INK}`, color: "#FFFFFF", fontFamily: BC, fontWeight: 800, fontSize: 26 * k, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${errBlink})`, boxSizing: "border-box" }}>1</div>
      )}
      <Btn k={k} x={650} y={96} w={270} h={56} label="Share & export" hot={hotAt(t, T_SHARE, 1.6)} size={32} />

      {/* content */}
      <div style={{ position: "absolute", left: 20 * k, top: 168 * k, width: 900 * k, height: 692 * k, border: `${4 * k}px solid ${INK}`, borderRadius: 16 * k, overflow: "hidden", background: code ? "#24363A" : "#FFFFFF", boxSizing: "border-box" }}>
        {!code && (
          <>
            <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 64 * k, background: P.bodyCoral, borderBottom: `${4 * k}px solid ${INK}`, fontFamily: BANG, fontSize: 44 * k, color: "#FFFFFF", paddingLeft: 24 * k, display: "flex", alignItems: "center", letterSpacing: 2 * k }}>KASIR WARUNG <span style={{ fontFamily: BC, fontWeight: 700, fontSize: 26 * k, marginLeft: 16 * k, opacity: 0.85 }}>(contoh)</span></div>
            {ITEMS.map((it, i) => (
              <div key={i} style={{ position: "absolute", left: 24 * k, top: (92 + i * 100) * k, width: 846 * k, height: 84 * k, borderBottom: `${3 * k}px dashed #C9C2B2`, fontFamily: BC, fontWeight: 800, fontSize: 40 * k, color: INK, display: "flex", alignItems: "center" }}>
                <span style={{ width: 330 * k }}>{it.n}</span>
                <span style={{ width: 200 * k, color: "#5b6168" }}>{rp(it.p)}</span>
              </div>
            ))}
            {ITEMS.map((_, i) => (
              <Btn key={i} k={k} x={860 - bw - 10} y={92 + i * 100 + (84 - bh) / 2} w={bw} h={bh} label="+ Tambah" bg={P.bodyMint} dark hot={i === 0 ? hotAt(t, T_TRY1, 0.3) : i === 1 ? hotAt(t, T_TRY2, 0.3) : 0} size={big ? 38 : 30} />
            ))}
            <div style={{ position: "absolute", left: 24 * k, top: 420 * k, width: 846 * k, height: 110 * k, ...inkBox(k, "#24363A", 6, 4, 16), display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${28 * k}px` }}>
              <span style={{ fontFamily: BC, fontWeight: 800, fontSize: 52 * k, color: "#FFFFFF" }}>TOTAL</span>
              <span style={{ fontFamily: BC, fontWeight: 800, fontSize: 60 * k, color: P.accentYellow, transform: `scale(${1 + totalPop * 0.12})` }}>{rp(total)}</span>
            </div>
            {/* Select & ask marquee around the first Tambah button */}
            {selK > 0 && (
              <div style={{ position: "absolute", left: (860 - 190 - 10 - 14) * k, top: (92 + 12 - 14) * k, width: (190 + 28) * k * selK, height: (60 + 28) * k * selK, border: `${5 * k}px dashed ${P.bodyCoral}`, borderRadius: 14 * k, boxSizing: "border-box", background: "rgba(224,109,83,0.08)" }} />
            )}
            {askK > 0 && (
              <div style={{ position: "absolute", left: 330 * k, top: 210 * k, width: 540 * k, height: 170 * k, ...inkBox(k, "#FFFFFF", 8, 5, 18), transform: `scale(${askK})`, transformOrigin: "90% 0%", padding: `${14 * k}px ${22 * k}px` }}>
                <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 28 * k, color: P.bodyCoral, letterSpacing: 2 * k }}>UBAH BAGIAN INI</div>
                <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 42 * k, color: INK, lineHeight: 1.1 }}>
                  {ask || <span style={{ color: "#9A9FA6" }}>Tulis perubahannya…</span>}
                  {t < 60.4 && Math.floor(t * 2.6) % 2 === 0 ? <span style={{ color: P.bodyCoral }}>|</span> : null}
                </div>
              </div>
            )}
            {big > 0 && t < 66.6 && (
              <div style={{ position: "absolute", left: 24 * k, top: 560 * k, fontFamily: BC, fontWeight: 800, fontSize: 36 * k, color: P.bodyMint }}>✓ Tombol sudah diperbesar</div>
            )}
          </>
        )}
        {code && (
          <div style={{ position: "absolute", left: 26 * k, top: 22 * k, fontFamily: MONO, fontWeight: 700, fontSize: 32 * k, lineHeight: 1.5 }}>
            {CODE.map(([col, line], i) => {
              const shown = typed(line, t, T_CODE + 0.15 + i * 0.22, T_CODE + 0.4 + i * 0.22);
              return (
                <div key={i} style={{ color: col, whiteSpace: "pre", display: "flex" }}>
                  <span style={{ color: "#6E8A90", width: 50 * k }}>{i + 1}</span>
                  {shown}
                </div>
              );
            })}
          </div>
        )}
        {consoleOn && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 250 * k * sm(ramp(t, T_CONSOLE, T_CONSOLE + 0.35)), background: "#141719", borderTop: `${5 * k}px solid ${INK}`, overflow: "hidden" }}>
            <div style={{ padding: `${16 * k}px ${24 * k}px`, fontFamily: MONO, fontWeight: 700, fontSize: 28 * k, lineHeight: 1.45 }}>
              <div style={{ color: "#9AA4AA" }}>CONSOLE</div>
              <div style={{ color: "#FF7A66" }}>✖ Error: harga is not defined</div>
              <div style={{ color: "#FF7A66", opacity: 0.8 }}>{"  "}di baris 4</div>
            </div>
          </div>
        )}
      </div>

      {/* Share & export menu + share dialog */}
      {shareMenu && (
        <div style={{ position: "absolute", left: 600 * k, top: 162 * k, width: 320 * k, height: 104 * k, ...inkBox(k, "#FFFFFF", 8, 5, 16), transform: `scale(${outBack(ramp(t, T_SHARE, T_SHARE + 0.25))})`, transformOrigin: "80% 0%" }}>
          <div style={{ position: "absolute", left: 10 * k, top: 10 * k, width: 290 * k, height: 74 * k, borderRadius: 12 * k, background: hotAt(t, T_SHARE2 - 0.3, 1) > 0 ? P.accentYellow : "transparent", border: `${3 * k}px solid ${INK}`, fontFamily: BC, fontWeight: 800, fontSize: 38 * k, color: INK, display: "flex", alignItems: "center", paddingLeft: 18 * k, boxSizing: "border-box" }}>↗ Share</div>
        </div>
      )}
      {dialog && (
        <div style={{ position: "absolute", left: 90 * k, top: 420 * k, width: 760 * k, height: 300 * k, ...inkBox(k, PAPER, 12, 6, 22), transform: `scale(${dialogK})`, padding: `${22 * k}px ${30 * k}px` }}>
          <div style={{ fontFamily: BANG, fontSize: 56 * k, color: INK, letterSpacing: 2 * k }}>BAGIKAN APLIKASIMU</div>
          <div style={{ marginTop: 14 * k, height: 70 * k, borderRadius: 35 * k, border: `${4 * k}px solid ${INK}`, background: "#FFFFFF", display: "flex", alignItems: "center", paddingLeft: 24 * k, fontFamily: MONO, fontWeight: 700, fontSize: 30 * k, color: "#5b6168", boxSizing: "border-box" }}>🔗 tautan-aplikasi-kasir…</div>
          <div style={{ position: "absolute", left: 380 * k, top: 190 * k }}>
            <Btn k={k} x={0} y={0} w={340} h={66} label={copied ? "✓ Tautan disalin" : "Copy link"} bg={copied ? P.bodyMint : P.accentYellow} dark={copied} hot={hotAt(t, T_COPY, 0.3)} size={34} />
          </div>
        </div>
      )}
      <Cursor k={k} {...c} />
    </Frame>
  );
};
