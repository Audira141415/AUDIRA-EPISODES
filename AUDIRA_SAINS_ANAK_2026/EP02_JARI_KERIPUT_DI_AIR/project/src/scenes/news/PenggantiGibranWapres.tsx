import React from "react";
import { useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate, spring } from "remotion";
import { BroadcastForgeOverlay } from "../../kits/broadcastforge/camera/Overlay";
import { BROADCASTFORGE_PALETTE as C } from "../../kits/broadcastforge/lib/palette";
import { AudiraSignature } from "../../brand/AudiraSignature";

// ─── VO-locked frame boundaries (60 FPS clock) ────────────────────────────
const F = {
  S1_END: Math.round(6.00 * 60),    // 360
  S2_END: Math.round(18.07 * 60),   // 1084
  S3_END: Math.round(46.28 * 60),   // 2777
  S4_END: Math.round(64.71 * 60),   // 3883
  S5_END: Math.round(75.70 * 60),   // 4542
  TOTAL:  90 * 60,                   // 5400
} as const;

const NAMES = [
  { name: "SUFMI DASCO AHMAD", label: "GERINDRA",    color: "#B71C1C", startF: 1200 },
  { name: "SUGIONO",           label: "GERINDRA",    color: "#B71C1C", startF: 1320 },
  { name: "PUAN MAHARANI",     label: "PDI-P",       color: "#C62828", startF: 1440 },
  { name: "AHY",               label: "DEMOKRAT",   color: "#1565C0", startF: 1560 },
  { name: "DEDI MULYADI",      label: "GOV. JABAR",  color: "#2E7D32", startF: 1680 },
  { name: "AHMAD MUZANI",      label: "MPR",         color: "#4527A0", startF: 1860 },
  { name: "TEDDY INDRA WIJAYA",label: "KABINET",     color: "#0277BD", startF: 2040 },
  { name: "BAHLIL LAHADALIA",  label: "KABINET",     color: "#0277BD", startF: 2220 },
  { name: "PRAMONO ANUNG",     label: "JAKARTA",     color: "#00695C", startF: 2400 },
  { name: "NATALIUS PIGAI",    label: "MENTERI HAM", color: "#6A1B9A", startF: 2580 },
] as const;

const HOAKS = [
  { claim: "AHY SIAP JADI WAPRES",  verdict: "HOAKS — VIDEO DIPOTONG",  startF: 2940 },
  { claim: "DEDI DIPANGGIL ISTANA", verdict: "KELIRU — TIDAK TERBUKTI", startF: 3360 },
  { claim: "VIDEO PRABOWO 2026",    verdict: "DARI 2023 — BUKAN BARU",  startF: 3660 },
] as const;

function fi(frame: number, start: number, end: number, from: number, to: number): number {
  return interpolate(frame, [start, end], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

const TICKER_ITEMS = [
  "POSISI WAKIL PRESIDEN KOSONG SETELAH GIBRAN MUNDUR",
  "10 NAMA BEREDAR SEBAGAI CALON WAPRES BARU",
  "MPR JADWALKAN PELANTIKAN 2 DESEMBER 2026",
  "CEK FAKTA: 3 HOAKS VIRAL TERBONGKAR",
  "KEPUTUSAN ADA DI TANGAN PRESIDEN PRABOWO",
];

export const EP_DURATION_SECONDS = 90;

// CSS gradient grid — survives JPEG downscale (SVG data URLs don't)
const GRID_H = `repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,229,255,0.28) 59px, rgba(0,229,255,0.28) 60px)`;
const GRID_V = `repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,229,255,0.28) 59px, rgba(0,229,255,0.28) 60px)`;
const GRID_TEX = `${GRID_H}, ${GRID_V}`;

// ─── S1 HOOK: Breaking news sweep ─────────────────────────────────────────
const S1Hook: React.FC<{ f: number }> = ({ f }) => {
  const sweep = fi(f, 0, 30, -1080, 0);
  const titleY = fi(f, 20, 50, 200, 0);
  const titleOp = fi(f, 20, 50, 0, 1);
  const scanOp = 0.04 + Math.sin(f * 0.3) * 0.02;
  return (
    <div style={{ width: 1080, height: 1920, background: "linear-gradient(180deg,#06090F 0%,#0A0E18 60%,#0D1420 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRID_TEX, pointerEvents: "none" }} />
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,229,255,0.03) 3px,rgba(0,229,255,0.03) 4px)", opacity: scanOp, pointerEvents: "none" }} />
      {/* Red sweep bar */}
      <div style={{ position: "absolute", top: 0, left: sweep, width: 1080, height: 8, background: C.breakingRed, boxShadow: `0 0 24px ${C.breakingRed}` }} />
      {/* LIVE badge */}
      <div style={{ position: "absolute", left: 60, top: 236 + 40, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: C.breakingRed, borderRadius: 4, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", animation: "none", opacity: f % 60 < 30 ? 1 : 0.3 }} />
          <span style={{ color: "#fff", fontSize: 28, letterSpacing: 4 }}>LIVE</span>
        </div>
        <span style={{ color: C.cyanAccent, fontSize: 24, letterSpacing: 2 }}>BREAKING NEWS</span>
      </div>
      {/* Main title */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 500 + titleY, opacity: titleOp }}>
        <div style={{ color: "#fff", fontSize: 88, lineHeight: 1, letterSpacing: -2, textShadow: `0 0 40px ${C.cyanAccent}44` }}>
          SIAPA<br />PENGGANTI<br />GIBRAN?
        </div>
        <div style={{ color: C.cyanAccent, fontSize: 36, marginTop: 24, letterSpacing: 2 }}>WAPRES BARU INDONESIA 2026</div>
      </div>
      {/* Cyan line accent */}
      <div style={{ position: "absolute", left: 60, top: 480 + titleY, width: fi(f, 30, 60, 0, 300), height: 4, background: C.cyanAccent, opacity: titleOp }} />
      {/* Bottom gradient fade */}
      <div style={{ position: "absolute", bottom: 380, left: 0, right: 0, height: 160, background: "linear-gradient(0deg,#0A0E18,transparent)" }} />
    </div>
  );
};

// ─── S2 CONTEXT: Constitutional infographic ───────────────────────────────
const S2Context: React.FC<{ f: number }> = ({ f }) => {
  const enter = fi(f, F.S1_END, F.S1_END + 30, 0, 1);
  return (
    <div style={{ width: 1080, height: 1920, background: "linear-gradient(170deg,#040D1E 0%,#071829 55%,#040D1E 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRID_TEX, pointerEvents: "none" }} />
      {/* Title bar */}
      <div style={{ position: "absolute", left: 0, top: 236, right: 0, padding: "24px 60px", background: "rgba(0,0,0,0.6)", borderBottom: `2px solid ${C.cyanAccent}` }}>
        <div style={{ color: C.cyanAccent, fontSize: 28, letterSpacing: 4 }}>DASAR HUKUM</div>
        <div style={{ color: "#fff", fontSize: 52, lineHeight: 1 }}>PENGGANTIAN WAPRES</div>
      </div>
      {/* Pasal 8 card */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: enter }}>
        <div style={{ background: "rgba(0,229,255,0.08)", border: `2px solid ${C.cyanAccent}`, borderRadius: 16, padding: "32px 40px", marginBottom: 32, boxShadow: `0 0 48px ${C.cyanAccent}22, 0 8px 32px rgba(0,0,0,0.6)` }}>
          <div style={{ color: C.cyanAccent, fontSize: 22, letterSpacing: 4, marginBottom: 8 }}>UNDANG-UNDANG DASAR 1945</div>
          <div style={{ color: "#fff", fontSize: 68, lineHeight: 1 }}>PASAL 8</div>
          <div style={{ color: "#aaa", fontSize: 28, marginTop: 16, lineHeight: 1.4 }}>Presiden mengajukan 2 nama calon Wakil Presiden kepada MPR</div>
        </div>
        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.cyanAccent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#000", fontSize: 22, fontFamily: "Anton" }}>1</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", flex: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              <div style={{ color: "#fff", fontSize: 28 }}>GIBRAN MUNDUR</div>
              <div style={{ color: "#aaa", fontSize: 20 }}>Posisi Wapres kosong</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.liveAmber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#000", fontSize: 22, fontFamily: "Anton" }}>2</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", flex: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              <div style={{ color: "#fff", fontSize: 28 }}>MAKS 60 HARI</div>
              <div style={{ color: C.liveAmber, fontSize: 20 }}>Presiden ajukan 2 nama ke MPR</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.breakingRed, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 22, fontFamily: "Anton" }}>3</span>
            </div>
            <div style={{ background: "rgba(211,47,47,0.15)", border: `1.5px solid ${C.breakingRed}`, borderRadius: 8, padding: "14px 20px", flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 28 }}>PELANTIKAN</div>
              <div style={{ color: C.breakingRed, fontSize: 32, letterSpacing: 2 }}>2 DESEMBER 2026</div>
            </div>
          </div>
        </div>
      </div>
      {/* T-11 chip */}
      <div style={{ position: "absolute", right: 60, top: 236 + 50, opacity: enter, textAlign: "center", background: "rgba(0,0,0,0.75)", border: `2px solid ${C.cyanAccent}`, borderRadius: 12, padding: "12px 24px" }}>
        <div style={{ color: C.cyanAccent, fontSize: 20, letterSpacing: 2 }}>HITUNG MUNDUR</div>
        <div style={{ color: "#fff", fontSize: 72, lineHeight: 1 }}>T-11</div>
        <div style={{ color: C.cyanAccent, fontSize: 20 }}>HARI</div>
      </div>
    </div>
  );
};

// ─── S3 KANDIDAT: 10 name cards ───────────────────────────────────────────
const S3Kandidat: React.FC<{ f: number }> = ({ f }) => {
  const enter = fi(f, F.S2_END, F.S2_END + 20, 0, 1);
  return (
    <div style={{ width: 1080, height: 1920, background: "linear-gradient(170deg,#030E1A 0%,#071424 60%,#030E1A 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRID_TEX, pointerEvents: "none" }} />
      {/* Header */}
      <div style={{ position: "absolute", left: 0, top: 236, right: 0, padding: "20px 60px", background: `${C.breakingRed}CC`, opacity: enter }}>
        <div style={{ color: "#fff", fontSize: 48, letterSpacing: 2 }}>10 KANDIDAT BEREDAR</div>
        <div style={{ color: "#ffcdd2", fontSize: 24 }}>Beredar di media sebagai calon pengganti</div>
      </div>
      {/* Name cards stack */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 380 }}>
        {NAMES.map((n, i) => {
          if (f < n.startF) return null;
          const op = fi(f, n.startF, n.startF + 12, 0, 1);
          const tx = fi(f, n.startF, n.startF + 15, -60, 0);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, opacity: op, transform: `translateX(${tx}px)` }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 16 }}>{i + 1}</span>
              </div>
              <div style={{ background: "rgba(11,37,69,0.9)", border: `1.5px solid ${C.cyanAccent}44`, borderRadius: 8, padding: "8px 18px", flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                <span style={{ color: "#fff", fontSize: 26, letterSpacing: 0.5 }}>{n.name}</span>
                <span style={{ color: n.color, fontSize: 18, background: `${n.color}22`, borderRadius: 4, padding: "2px 10px" }}>{n.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── S4 CEK FAKTA: Red alert ───────────────────────────────────────────────
const S4CekFakta: React.FC<{ f: number }> = ({ f }) => {
  const enter = fi(f, F.S3_END, F.S3_END + 20, 0, 1);
  const pulse = 0.85 + Math.sin(f * 0.15) * 0.15;
  return (
    <div style={{ width: 1080, height: 1920, background: "linear-gradient(170deg,#1A0505 0%,#200808 50%,#1A0505 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
      {/* Warning header */}
      <div style={{ position: "absolute", left: 0, top: 236, right: 0, padding: "24px 60px", background: `${C.breakingRed}EE`, opacity: enter }}>
        <div style={{ color: "#fff", fontSize: 64, letterSpacing: 4, lineHeight: 1 }}>⚠ CEK FAKTA</div>
        <div style={{ color: "#ffcdd2", fontSize: 26 }}>HOAKS YANG BEREDAR DI MEDIA SOSIAL</div>
      </div>
      {/* Pulsing ring */}
      <div style={{ position: "absolute", left: "50%", top: 500, transform: "translate(-50%,-50%)", width: 200 * pulse, height: 200 * pulse, borderRadius: "50%", border: `3px solid ${C.breakingRed}66`, opacity: enter * 0.4, pointerEvents: "none" }} />
      {/* Hoaks stamps */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: enter }}>
        {HOAKS.map((h, i) => {
          if (f < h.startF) return null;
          const op = fi(f, h.startF, h.startF + 10, 0, 1);
          const scale = fi(f, h.startF, h.startF + 8, 1.1, 1);
          return (
            <div key={i} style={{ marginBottom: 24, opacity: op, transform: `scale(${scale})` }}>
              <div style={{ background: "rgba(11,10,10,0.95)", border: `2px solid ${C.breakingRed}`, borderRadius: 12, padding: "18px 28px", boxShadow: `0 4px 24px rgba(211,47,47,0.3), inset 0 0 20px rgba(211,47,47,0.05)` }}>
                <div style={{ color: "#ffcdd2", fontSize: 24, marginBottom: 6 }}>{h.claim}</div>
                <div style={{ color: C.breakingRed, fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 44 }}>✗</span>
                  <span>{h.verdict}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Counter */}
      <div style={{ position: "absolute", right: 60, top: 236 + 50, opacity: enter, textAlign: "center", background: "rgba(0,0,0,0.6)", border: `2px solid ${C.breakingRed}`, borderRadius: 12, padding: "12px 24px" }}>
        <div style={{ color: C.breakingRed, fontSize: 20, letterSpacing: 2 }}>HOAKS TERBONGKAR</div>
        <div style={{ color: "#fff", fontSize: 72, lineHeight: 1 }}>3</div>
        <div style={{ color: C.breakingRed, fontSize: 20 }}>VIRAL</div>
      </div>
    </div>
  );
};

// ─── S5 PAYOFF: Countdown + mystery card + progress ──────────────────────
const S5Payoff: React.FC<{ f: number }> = ({ f }) => {
  const enter = fi(f, F.S4_END, F.S4_END + 20, 0, 1);
  const scale = fi(f, F.S4_END, F.S4_END + 40, 0.7, 1);
  const glow = 0.5 + Math.sin(f * 0.08) * 0.2;
  const r1 = 420 + Math.sin(f * 0.05) * 20;
  const r2 = 620 + Math.sin(f * 0.04 + 1) * 25;
  const r3 = 820 + Math.sin(f * 0.03 + 2) * 30;
  const barW = fi(f, F.S4_END + 20, F.S4_END + 100, 0, 82);
  return (
    <div style={{ width: 1080, height: 1920, background: "linear-gradient(180deg,#020710 0%,#030C1A 60%,#020710 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
      {/* Grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRID_TEX, pointerEvents: "none" }} />
      {/* Concentric rings (depth BG layer) */}
      {[r3, r2, r1].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: "50%", top: 740, transform: "translate(-50%,-50%)", width: r, height: r, borderRadius: "50%", border: `${i === 2 ? 2 : 1}px solid ${C.cyanAccent}${i === 2 ? "30" : i === 1 ? "1a" : "0d"}`, pointerEvents: "none" }} />
      ))}
      {/* Radial glow */}
      <div style={{ position: "absolute", left: "50%", top: 740, transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle,${C.cyanAccent}${Math.round(glow * 40).toString(16).padStart(2, "0")} 0%,transparent 70%)`, pointerEvents: "none" }} />
      {/* Top header badge */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 236 + 40, opacity: enter, textAlign: "center" }}>
        <div style={{ background: `${C.cyanAccent}11`, border: `1px solid ${C.cyanAccent}44`, borderRadius: 8, padding: "10px 0", color: C.cyanAccent, fontSize: 28, letterSpacing: 8 }}>HITUNG MUNDUR PELANTIKAN</div>
      </div>
      {/* Main number */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", opacity: enter, transform: `scale(${scale})` }}>
        <div style={{ color: "#fff", fontSize: 320, lineHeight: 0.85, textShadow: `0 0 60px ${C.cyanAccent}88, 0 0 120px ${C.cyanAccent}44` }}>11</div>
        <div style={{ color: C.cyanAccent, fontSize: 52, letterSpacing: 12 }}>HARI</div>
      </div>
      {/* Date card */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1050, opacity: enter }}>
        <div style={{ background: `${C.breakingRed}EE`, border: `2px solid ${C.breakingRed}`, borderRadius: 16, padding: "20px 40px", textAlign: "center", boxShadow: `0 8px 32px ${C.breakingRed}44` }}>
          <div style={{ color: "#ffcdd2", fontSize: 22, letterSpacing: 4 }}>TARGET PELANTIKAN</div>
          <div style={{ color: "#fff", fontSize: 56, letterSpacing: 3, lineHeight: 1 }}>2 DESEMBER 2026</div>
        </div>
      </div>
      {/* Mystery VP card */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1270, opacity: enter }}>
        <div style={{ background: `${C.cyanAccent}09`, border: `1.5px solid ${C.cyanAccent}55`, borderRadius: 12, padding: "20px 32px", display: "flex", alignItems: "center", gap: 20, boxShadow: `0 4px 24px ${C.cyanAccent}22` }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: `${C.cyanAccent}1a`, border: `2px dashed ${C.cyanAccent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: C.cyanAccent, fontSize: 36 }}>?</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.cyanAccent, fontSize: 22, letterSpacing: 2 }}>WAPRES BARU INDONESIA</div>
            <div style={{ color: "#fff", fontSize: 36, letterSpacing: 1 }}>SIAPA DIA???</div>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1480, opacity: enter }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#aaa", fontSize: 20 }}>POSISI KOSONG</span>
          <span style={{ color: C.liveAmber, fontSize: 20 }}>11 HARI LAGI</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 8, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(90deg,${C.cyanAccent},${C.liveAmber})`, height: "100%", width: `${barW}%`, borderRadius: 4 }} />
        </div>
        <div style={{ color: "#aaa", fontSize: 18, textAlign: "right", marginTop: 6 }}>2 DES 2026</div>
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────
export const PenggantiGibranWapres: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.round((frame / fps) * 60);

  const isS1 = f < F.S1_END;
  const isS2 = f >= F.S1_END && f < F.S2_END;
  const isS3 = f >= F.S2_END && f < F.S3_END;
  const isS4 = f >= F.S3_END && f < F.S4_END;
  const isS5 = f >= F.S4_END && f < F.S5_END;
  const isOutro = f >= F.S5_END;

  return (
    <div style={{ width: 1080, height: 1920, overflow: "hidden", position: "relative" }}>
      <Audio src={staticFile("audio/vo.wav")} startFrom={0} />

      {/* Scene layers */}
      {isS1    && <S1Hook      f={f} />}
      {isS2    && <S2Context   f={f} />}
      {isS3    && <S3Kandidat  f={f} />}
      {isS4    && <S4CekFakta  f={f} />}
      {isS5    && <S5Payoff    f={f} />}
      {isOutro && (
        <div style={{ width: 1080, height: 1920, background: "linear-gradient(170deg,#040D1E 0%,#070A0F 60%,#040D1E 100%)", position: "relative", overflow: "hidden", fontFamily: "Anton, sans-serif" }}>
          {/* Grid texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: GRID_TEX, pointerEvents: "none" }} />
          {/* Top — channel ident */}
          <div style={{ position: "absolute", left: 60, right: 60, top: 300, textAlign: "center" }}>
            <div style={{ color: C.cyanAccent, fontSize: 24, letterSpacing: 8, marginBottom: 12 }}>BREAKING NEWS</div>
            <div style={{ color: "#fff", fontSize: 88, lineHeight: 0.9, letterSpacing: -2 }}>TERIMA<br />KASIH</div>
            <div style={{ color: "#aaa", fontSize: 32, marginTop: 24, letterSpacing: 2 }}>SUDAH MENONTON</div>
          </div>
          {/* Center — AUDIRA brand card */}
          <div style={{ position: "absolute", left: "50%", top: 700, transform: "translateX(-50%)", width: 540 }}>
            <img src={staticFile("brand/audira-outro-card.svg")} style={{ width: "100%", display: "block" }} />
          </div>
          {/* CTA */}
          <div style={{ position: "absolute", left: 60, right: 60, top: 1060, textAlign: "center" }}>
            <div style={{ color: C.cyanAccent, fontSize: 36, letterSpacing: 4 }}>PANTAU TERUS</div>
            <div style={{ color: "#fff", fontSize: 64, letterSpacing: 2 }}>@AUDIRA</div>
          </div>
          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 380, left: 0, right: 0, height: 120, background: "linear-gradient(0deg,#040D1E,transparent)" }} />
        </div>
      )}

      {/* Broadcast overlay — all scenes including outro */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <BroadcastForgeOverlay
          f={f}
          channelName="AUDIRA NEWS"
          category="BREAKING NEWS"
          headline="SIAPA PENGGANTI GIBRAN?"
          subHeadline="Prabowo ajukan 2 nama ke MPR · Pelantikan 2 Des 2026"
          location="JAKARTA // BREAKING"
          clock="15:20 WIB"
          tickerItems={TICKER_ITEMS}
          showPipCorrespondent={false}
        />
      </div>

      {/* AudiraSignature — anti-reupload branding */}
      <AudiraSignature seed="pengganti-gibran-wapres" handle="@audira" />
    </div>
  );
};
