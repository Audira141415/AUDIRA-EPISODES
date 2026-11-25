// EP040 back office (verification by an officer) and the confirmation letter, as layered 2.5D CSS
// scenes in the Ironbow palette. Officer seen from behind (no face). All data on screen is fictional.

import React from "react";
import { FONT } from "../../core/type/fonts.ts";
import { PLATE } from "./world.tsx";
import { W, clamp, ramp, ease, easeOut } from "./timing.ts";

const C = { black: "#05020F", violet: "#310E68", magenta: "#9B1D8C", amber: "#EA5E28", yellow: "#F7D038", cyan: "#00E5FF", ink: "#F1EEF4" };
const mono: React.CSSProperties = { fontFamily: `'${FONT}'`, fontVariantNumeric: "tabular-nums", letterSpacing: "0.12em" };
const fade = (t: number, at: number, d = 0.3) => ramp(t, at, at + d, easeOut);

// Monitor layout in 1080×1920 px. The photo window is a hole in this layer: the 3D renderer shows the
// frozen sensor frame through it (Film.tsx aims and shifts the camera into the window).
const MON = { x: 60, y: 430, w: 960, h: 500 };
const HOLE = { x: MON.x + 22, y: MON.y + 62, w: 540, h: 400 };
export const officeLayout = (t: number, a: number, b: number) => {
  const k = ease(clamp((t - a) / (b - a)));
  const s = 1.14 - 0.12 * k; // dolly back from the window we zoomed into
  const px = -24 + 44 * k;
  const T = (x: number, y: number) => ({ x: 540 + (x - 540) * s + px, y: 680 + (y - 680) * s });
  const h0 = T(HOLE.x, HOLE.y);
  return { s, px, hole: { x: h0.x, y: h0.y, w: HOLE.w * s, h: HOLE.h * s } };
};

export const Office: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const L = officeLayout(t, a, b);
  const tCheck = W("dicek"), tOfficer = W("petugas"), tMatch = W("dicocokkan"), tData = W("data"), tVeh = W("kendaraan");
  const rows: [string, string, number][] = [
    ["NOMOR PLAT", PLATE, tMatch],
    ["JENIS", "SEDAN", tData],
    ["DATA KENDARAAN", "COCOK", tVeh],
  ];
  const H = L.hole;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: `'${FONT}'`, color: C.ink }}>
      {/* room, with the photo window cut out */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="room" cx="0.5" cy="0.36" r="0.75"><stop offset="0" stopColor="#3a0d5e" /><stop offset="0.55" stopColor="#160528" /><stop offset="1" stopColor="#05020F" /></radialGradient>
          <mask id="win"><rect width="1080" height="1920" fill="#fff" /><rect x={H.x} y={H.y} width={H.w} height={H.h} fill="#000" /></mask>
        </defs>
        <g mask="url(#win)">
          <rect width="1080" height="1920" fill="url(#room)" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={-60 + (i % 5) * 245 + L.px * 0.4} y={200 + Math.floor(i / 5) * 190} width={225} height={170} fill="#2a0848" stroke="#31106a" strokeWidth={3} opacity={0.45} />
          ))}
          <g transform={`translate(${L.px} 0) translate(540 680) scale(${L.s}) translate(-540 -680)`}>
            <rect x={MON.x - 12} y={MON.y - 12} width={MON.w + 24} height={MON.h + 24} rx={14} fill="#1b0d2c" />
            <rect x={MON.x} y={MON.y} width={MON.w} height={MON.h} fill="#0b0418" />
            <rect x={MON.x - 12} y={MON.y - 12} width={MON.w + 24} height={MON.h + 24} rx={14} fill="none" stroke="#9B1D8C" strokeOpacity={0.5} strokeWidth={3} />
            <rect x={490} y={MON.y + MON.h + 12} width={100} height={70} fill="#1b0d2c" />
            <path d={`M20 ${MON.y + MON.h + 82} L1060 ${MON.y + MON.h + 82} L1180 ${MON.y + MON.h + 320} L-100 ${MON.y + MON.h + 320} Z`} fill="#22093a" stroke="#9B1D8C" strokeWidth={4} />
          </g>
        </g>
        <rect x={H.x} y={H.y} width={H.w} height={H.h} fill="none" stroke="#00E5FF" strokeWidth={3} />
      </svg>
      {/* monitor UI (same transform as the bezel) */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 680px", transform: `translateX(${L.px}px) scale(${L.s})` }}>
        <div style={{ position: "absolute", left: MON.x + 22, top: MON.y + 18, fontSize: 22, color: C.cyan, fontWeight: 600, ...mono }}>VERIFIKASI FOTO · PETUGAS</div>
        <div style={{ position: "absolute", left: HOLE.x + 16, top: HOLE.y + HOLE.h - 58, padding: "8px 14px", background: C.yellow, color: C.black, fontSize: 22, fontWeight: 600, ...mono, opacity: fade(t, tOfficer), transform: `scale(${1.3 - 0.3 * fade(t, tOfficer, 0.2)})`, transformOrigin: "0 100%" }}>DICEK PETUGAS ✓</div>
        <div style={{ position: "absolute", left: HOLE.x + HOLE.w + 22, top: HOLE.y, width: MON.x + MON.w - (HOLE.x + HOLE.w + 22) - 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map(([k, v, at]) => {
            const o = fade(t, at - 0.15);
            const ok = fade(t, at + 0.25, 0.2);
            return (
              <div key={k} style={{ opacity: o, transform: `translateX(${(1 - o) * 30}px)`, borderBottom: "2px solid #ffffff22", paddingBottom: 10 }}>
                <div style={{ fontSize: 16, color: "#ffffff88", ...mono }}>{k}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: 30, color: C.cyan, opacity: ok, transform: `scale(${0.6 + 0.4 * ok})` }}>✓</div>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 15, color: "#ffffff77", ...mono, marginTop: 10 }}>DATA FIKTIF · ILUSTRASI</div>
        </div>
      </div>
      {/* officer from behind, foreground (no face) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translateX(${L.px * 1.8}px)` }}>
        <defs>
          <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#EA5E28" /><stop offset="0.12" stopColor="#1a0628" /><stop offset="0.88" stopColor="#1a0628" /><stop offset="1" stopColor="#EA5E28" /></linearGradient>
        </defs>
        <ellipse cx="300" cy="1060" rx="92" ry="108" fill="url(#rim)" />
        <path d="M80 1440 Q90 1200 300 1170 Q510 1200 520 1440 Z" fill="url(#rim)" />
        <rect x="262" y="1140" width="76" height="50" fill="#1a0628" />
      </svg>
      <div style={{ position: "absolute", left: 66, top: 220, fontSize: 26, fontWeight: 600, color: C.cyan, ...mono, opacity: fade(t, a + 0.1) }}>BACK OFFICE · VERIFIKASI</div>
      <div style={{ position: "absolute", left: 66, top: 266, fontSize: 30, fontWeight: 600, color: C.yellow, ...mono, opacity: fade(t, tCheck) }}>KAMERA BUKAN PENENTU AKHIR</div>
    </div>
  );
};

// seeded QR-like block (decorative, encodes nothing)
const QR: React.FC<{ size: number }> = ({ size }) => {
  const n = 21, c = size / n;
  let seed = 40;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    let on = rnd() > 0.52;
    if (finder) {
      const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y;
      on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
    }
    if (on) cells.push(<rect key={`${x}-${y}`} x={x * c} y={y * c} width={c} height={c} fill="#0b0910" />);
  }
  return <svg width={size} height={size}>{cells}</svg>;
};

export const Letter: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const u = clamp((t - a) / (b - a));
  const tSurat = W("surat", a), tSend = W("dikirim", a), tOwner = W("pemilik", a);
  const rise = fade(t, a, 0.5);
  const stamp = fade(t, W("konfirmasi", a), 0.25);
  const into = ease(clamp((t - tSend) / 0.55)); // letter slides into the envelope
  const fly = ease(clamp((t - tOwner + 0.1) / 0.6)); // envelope flies to the owner
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(90% 60% at 50% 40%, #31106a 0%, #120424 60%, #05020F 100%)", fontFamily: `'${FONT}'`, color: C.ink, perspective: 1600 }}>
      <div style={{ position: "absolute", left: 66, top: 220, fontSize: 26, fontWeight: 600, color: C.cyan, ...mono, opacity: fade(t, a + 0.1) }}>SETELAH DIVERIFIKASI</div>
      <div style={{ position: "absolute", left: 66, top: 266, fontSize: 30, fontWeight: 600, color: C.yellow, ...mono, opacity: fade(t, tSurat) }}>SURAT KONFIRMASI → PEMILIK</div>
      {/* owner's house, target of the envelope */}
      <svg width={260} height={240} viewBox="0 0 260 240" style={{ position: "absolute", left: 760, top: 1010, opacity: fade(t, tSend) }}>
        <path d="M20 110 L130 20 L240 110 L240 230 L20 230 Z" fill="#2a0848" stroke="#9B1D8C" strokeWidth="6" />
        <rect x="100" y="150" width="60" height="80" fill="#EA5E28" />
        <text x="130" y="100" textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize="26" fill="#F1EEF4">PEMILIK</text>
      </svg>
      <div style={{ position: "absolute", left: 540, top: 820, transformStyle: "preserve-3d", transform: `translate(${fly * 340}px, ${fly * 300}px) scale(${1 - fly * 0.7}) rotateY(${(-10 + 14 * u) * (1 - fly)}deg) rotateX(${8 * (1 - u)}deg)`, opacity: 1 - clamp((t - tOwner - 0.45) / 0.3) }}>
        {/* envelope back */}
        <div style={{ position: "absolute", left: -330, top: 60, width: 660, height: 400, background: "#c2452a", borderRadius: 8, opacity: fade(t, tSend - 0.2) }} />
        {/* the letter */}
        <div style={{ position: "absolute", left: -290, top: -520 + (1 - rise) * 120 + into * 560, width: 580, height: 760, background: "#FFF8E6", borderRadius: 6, boxShadow: "0 30px 80px #000a", color: "#1a0d22", padding: 40, boxSizing: "border-box", opacity: rise, clipPath: `inset(0 0 ${into * 74}% 0)` }}>
          <div style={{ fontSize: 22, letterSpacing: "0.18em", fontWeight: 600, color: "#9B1D8C" }}>SURAT KONFIRMASI</div>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 10, lineHeight: 1.1 }}>Konfirmasi pelanggaran lalu lintas</div>
          <div style={{ marginTop: 26, fontSize: 24, lineHeight: 1.6 }}>
            <div>Nomor kendaraan: <b>{PLATE}</b></div>
            <div>Bukti: foto kamera, sudah dicek petugas</div>
            <div>Mohon konfirmasi pemilik/pengemudi</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
            <QR size={200} />
            <div style={{ fontSize: 18, color: "#6a5a70", textAlign: "right" }}>contoh fiktif<br />bukan dokumen resmi</div>
          </div>
          <div style={{ position: "absolute", right: 30, top: 150, padding: "10px 18px", border: "5px solid #EA5E28", color: "#EA5E28", fontSize: 30, fontWeight: 600, transform: `rotate(-12deg) scale(${1.6 - 0.6 * stamp})`, opacity: stamp, letterSpacing: "0.12em" }}>KONFIRMASI</div>
        </div>
        {/* envelope front flap */}
        <svg width={660} height={400} style={{ position: "absolute", left: -330, top: 60, opacity: fade(t, tSend - 0.2) }}>
          <path d="M0 0 L330 230 L660 0 L660 400 L0 400 Z" fill="#EA5E28" />
          <path d="M0 400 L300 200 M660 400 L360 200" stroke="#9B1D8C" strokeWidth="5" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 66, top: 1180, fontSize: 24, color: C.cyan, ...mono, opacity: fade(t, tSend) }}>KONFIRMASI DULU, BUKAN LANGSUNG TILANG</div>
    </div>
  );
};
