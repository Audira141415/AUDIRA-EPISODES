// EP58 Mongolia — kinetic HUD callouts on the 1080 × 1920 layout. One dark card per spoken number
// (WORLDFORGE memory: rgba(20,14,12,0.82), labels ≥ 36 px), in the band y 250–760 so the subtitle at
// y 1300 and the bottom 380 px stay clear. Cards wipe in with a clip (full contrast every frame).

import React from "react";
import { FONT } from "../../core/type/fonts.ts";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const u = clamp01(x);
  return 1 - Math.pow(1 - u, 3);
};
const CARD = "rgba(20,14,12,0.82)";
const ACCENT = "#f2c14e";
const COLD = "#9fd3ff";
const HOT = "#ff8a4c";

type Callout = { t0: number; t1: number; kicker?: string; big: string; sub?: string; color?: string; size?: number };

const CALLOUTS: Callout[] = [
  { t0: 0.55, t1: 3.15, kicker: "MONGOLIA", big: "KUDA > MANUSIA", size: 92 },
  { t0: 10.28, t1: 14.05, kicker: "SENSUS TERNAK AKHIR 2025", big: "5,1 JUTA", sub: "ekor kuda" },
  { t0: 14.15, t1: 16.95, kicker: "PENDUDUK", big: "3,5 JUTA", sub: "orang" },
  { t0: 17.03, t1: 19.45, kicker: "ARTINYA", big: "≈ 1,5", sub: "kuda untuk setiap orang" },
  { t0: 21.0, t1: 23.95, kicker: "PALING JARANG PENDUDUK", big: "TANPA LAUT", sub: "negara terkurung daratan", size: 100 },
  { t0: 24.06, t1: 27.25, kicker: "LUAS WILAYAH", big: "1.564.116 km²", size: 92 },
  { t0: 31.86, t1: 33.9, kicker: "MUSIM PANAS", big: "+30 °C", color: HOT },
  { t0: 33.96, t1: 38.45, kicker: "MUSIM DINGIN", big: "−40 °C", sub: "tetap cari makan sendiri", color: COLD },
  { t0: 38.55, t1: 41.45, kicker: "RAS KUDA MONGOLIA", big: "NYARIS TAK BERUBAH", sub: "sejak zaman Genghis Khan", size: 84 },
  { t0: 41.55, t1: 45.1, kicker: "PASUKAN", big: "GENGHIS KHAN", sub: "abad ke-13", size: 100 },
  { t0: 45.2, t1: 50.8, kicker: "SETIAP PRAJURIT", big: "3–5", sub: "kuda cadangan, ganti tunggangan" },
  { t0: 54.5, t1: 58.6, kicker: "MINUMAN NASIONAL", big: "AIRAG", sub: "susu kuda betina fermentasi" },
  { t0: 60.3, t1: 64.2, kicker: "FESTIVAL", big: "NAADAM", sub: "balap kuda padang rumput" },
  { t0: 64.29, t1: 67.6, kicker: "JOKI ANAK-ANAK", big: "MULAI UMUR 6", sub: "tubuh ringan, kuda lebih cepat", size: 96 },
  { t0: 67.71, t1: 69.55, kicker: "JARAK BALAP", big: "SAMPAI 30 KM", size: 96 },
  { t0: 71.11, t1: 76.0, kicker: "BAHASA MONGOLIA", big: "500+ KATA", sub: "untuk ciri kuda" },
  { t0: 79.12, t1: 83.3, kicker: "NEGERI DI MANA", big: "KUDA = MAYORITAS", size: 84 },
];

const Card: React.FC<{ c: Callout; t: number }> = ({ c, t }) => {
  // short cards (≤ 2.8 s) so the hero subject owns the frame again
  const t1 = Math.min(c.t1, c.t0 + 2.8);
  const a = ease((t - c.t0) / 0.35);
  const out = ease((t - (t1 - 0.25)) / 0.25);
  const big = Math.round((c.size ?? 140) * 0.82);
  // the number lands with a small overshoot (a "thump"), then settles
  const thump = 1 + 0.05 * Math.sin(clamp01((t - c.t0 - 0.12) / 0.35) * Math.PI);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", clipPath: `inset(0 ${out * 100}% 0 ${(1 - a) * 0}% )` }}>
      <div style={{ maxWidth: 940, padding: "20px 36px 24px", background: CARD, borderRadius: 18, borderLeft: `10px solid ${c.color ?? ACCENT}`, clipPath: `inset(0 ${(1 - a) * 100}% 0 0 round 18px)`, transform: `translateY(${(1 - a) * 30}px)`, fontFamily: FONT, color: "#fff", textAlign: "left" }}>
        {c.kicker ? <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 4, color: c.color ?? ACCENT, marginBottom: 6 }}>{c.kicker}</div> : null}
        <div style={{ fontSize: big, fontWeight: 800, lineHeight: 1.02, letterSpacing: -1, transform: `scale(${thump})`, transformOrigin: "0 60%", whiteSpace: "nowrap" }}>{c.big}</div>
        {c.sub ? <div style={{ marginTop: 8, fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{c.sub}</div> : null}
      </div>
    </div>
  );
};

/** Hook 3.2–6.7: horses vs people, two bars. */
const Bars: React.FC<{ t: number }> = ({ t }) => {
  if (t < 3.2 || t > 6.65) return null;
  const a = ease((t - 3.25) / 0.6);
  const b = ease((t - 3.7) / 0.6);
  const out = ease((t - 6.4) / 0.25);
  const row = (label: string, w: number, u: number, col: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 14 }}>
      <div style={{ width: 230, fontSize: 40, fontWeight: 800, color: "#fff" }}>{label}</div>
      <div style={{ height: 54, width: w * u, background: col, borderRadius: 10 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 70, top: 270, padding: "24px 36px 32px", background: CARD, borderRadius: 18, fontFamily: FONT, clipPath: `inset(0 ${out * 100}% 0 0)` }}>
      <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 4, color: ACCENT }}>SELISIHNYA BUKAN SEDIKIT</div>
      {row("KUDA", 560, a, ACCENT)}
      {row("MANUSIA", 385, b, "#d9d2c4")}
    </div>
  );
};

/** 58.67: six milkings a day, six ticks. */
const SixTicks: React.FC<{ t: number }> = ({ t }) => {
  if (t < 58.67 || t > 60.25) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "24px 40px 30px", background: CARD, borderRadius: 18, borderLeft: `10px solid ${ACCENT}`, fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 4, color: ACCENT }}>DIPERAH SAMPAI</div>
        <div style={{ fontSize: 128, fontWeight: 800, lineHeight: 1.05 }}>6× SEHARI</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {Array.from({ length: 6 }, (_, i) => {
            const u = ease((t - 58.85 - i * 0.16) / 0.2);
            return (
              <div key={i} style={{ width: 92, height: 92, borderRadius: 14, background: u > 0 ? ACCENT : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, color: "#231a12", transform: `scale(${0.6 + 0.4 * u})` }}>
                {u > 0.3 ? "✓" : ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** 76.1: colour / marking / brand chips over the three horses. */
const Chips: React.FC<{ t: number }> = ({ t }) => {
  if (t < 76.1 || t > 78.85) return null;
  const items = ["WARNA", "TANDA", "CAP"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: FONT }}>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4, color: ACCENT, background: CARD, padding: "10px 26px", borderRadius: 12 }}>DIKENALI DARI</div>
      <div style={{ display: "flex", gap: 18 }}>
        {items.map((s, i) => {
          const u = ease((t - 76.15 - i * 0.55) / 0.3);
          return (
            <div key={s} style={{ padding: "18px 30px", background: CARD, borderRadius: 14, borderBottom: `8px solid ${ACCENT}`, fontSize: 64, fontWeight: 800, color: "#fff", clipPath: `inset(0 ${(1 - u) * 100}% 0 0)`, transform: `translateY(${(1 - u) * 24}px)` }}>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MongoliaOverlay: React.FC<{ t: number }> = ({ t }) => {
  const c = CALLOUTS.find((k) => t >= k.t0 && t < Math.min(k.t1, k.t0 + 2.8));
  return (
    <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      {c ? <Card key={c.t0} c={c} t={t} /> : null}
      <Bars t={t} />
      <SixTicks t={t} />
      <Chips t={t} />
    </div>
  );
};
