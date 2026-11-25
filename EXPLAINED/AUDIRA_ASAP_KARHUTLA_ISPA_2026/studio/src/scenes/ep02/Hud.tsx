// EP02 HUD: FLIR viewfinder, beat panels anchored to projected world points, smoke wipes,
// rain, and the karaoke caption (thermal style: violet glass rail, active word in FLIR yellow).
// Laid out in 1080x1920 design space and scaled to the render width.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { THERMAL_PALETTE as P } from "../../kits/thermalforge/lib/palette";
import { FONT } from "../../core/type/fonts.ts";
import { T, CLIPS, OUTRO_AT, CUT1, CUT2, seg, win, smooth, projector, type Word } from "./clock.ts";
import { MERAUKE, RAWA, AREA, CONC, SQ_SMALL_HALF, SQ_BIG_HALF, groundY } from "./world.ts";
import { BARS, BAR_Z, barH, satPos } from "./props.ts";
import { heliPos } from "./clock.ts";

const MONO = "Consolas, 'Courier New', monospace";
const SH = "0 2px 18px rgba(5,2,14,0.92), 0 0 4px rgba(5,2,14,0.95)";
const GLASS = "rgba(12,4,26,0.74)";

type Pt = { x: number; y: number; behind: boolean };
const g = (x: number, z: number, dy = 0) => new THREE.Vector3(x, groundY(x, z) + dy, z);

// ---------------------------------------------------------------- small building blocks
const Panel: React.FC<{ top: number; left?: number; o: number; children: React.ReactNode; accent?: string }> = ({ top, left = 72, o, children, accent = P.flirYellow }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", top, left, opacity: o, transform: `translateY(${(1 - o) * 22}px)` }}>
      <div style={{ background: GLASS, borderLeft: `8px solid ${accent}`, padding: "18px 26px 16px", backdropFilter: "blur(2px)" }}>{children}</div>
    </div>
  );

const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = P.hudCyan }) => (
  <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 4, color, textShadow: SH }}>{children}</div>
);
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 76, color = "#fff" }) => (
  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.0, color, letterSpacing: -1, textShadow: SH }}>{children}</div>
);
const Small: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "#d8d2f2" }) => (
  <div style={{ fontFamily: MONO, fontSize: 26, color, marginTop: 8, letterSpacing: 1, textShadow: SH }}>{children}</div>
);

// leader line from a projected world point up to a tag
const Tag: React.FC<{ p: Pt; o: number; lift?: number; dx?: number; minTop?: number; children: React.ReactNode; color?: string }> = ({ p, o, lift = 120, dx = -12, minTop = 500, children, color = P.hudCyan }) => {
  if (o <= 0.001 || p.behind) return null;
  const x = Math.min(860, Math.max(60, p.x)), y = Math.min(1180, Math.max(360, p.y));
  // keep the label block below the sensor strip/panels (its bottom edge >= minTop)
  const ly = Math.max(minTop, y - lift * o);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <div style={{ position: "absolute", left: x - 2, top: Math.min(ly, y), width: 4, height: Math.abs(y - ly), background: color, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, borderRadius: 9, border: `3px solid ${color}` }} />
      <div style={{ position: "absolute", left: Math.min(700, x + dx), top: ly - 10, transform: "translateY(-100%)", fontFamily: MONO, color, textShadow: SH, whiteSpace: "nowrap" }}>
        {children}
      </div>
    </div>
  );
};

const Silhouette: React.FC<{ size?: number; headset?: boolean }> = ({ size = 92, headset }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="ib" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffbe0" />
        <stop offset="0.3" stopColor="#fcd238" />
        <stop offset="0.6" stopColor="#e6401f" />
        <stop offset="1" stopColor="#4d0d8c" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" fill="#120830" />
    <circle cx="50" cy="38" r="19" fill="url(#ib)" />
    <path d="M14 100 C16 70 32 60 50 60 C68 60 84 70 86 100 Z" fill="url(#ib)" />
    {headset && <path d="M28 38 C28 12 72 12 72 38" stroke={P.hudCyan} strokeWidth="5" fill="none" />}
  </svg>
);

const NameCard: React.FC<{ top: number; o: number; name: string; role: string; headset?: boolean }> = ({ top, o, name, role, headset }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", top, left: 72, right: 150, opacity: o, transform: `translateX(${(1 - o) * -40}px)`, display: "flex", alignItems: "center", gap: 22, background: GLASS, borderLeft: `8px solid ${P.hudCyan}`, padding: "14px 22px" }}>
      <Silhouette headset={headset} />
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: "#fff", lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontFamily: MONO, fontSize: 26, color: P.flirYellow, marginTop: 6, letterSpacing: 1 }}>{role}</div>
      </div>
    </div>
  );

const Corner: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 54, height: 54, borderTop: `4px solid ${P.hudCyan}`, borderLeft: `4px solid ${P.hudCyan}`, transform: `rotate(${rot}deg)`, opacity: 0.8 }} />
);

// ---------------------------------------------------------------- captions
type Chunk = { words: Word[]; s: number; e: number };
// a number stays on the same line as its unit ("6.700 titik", "25 ribu hektare", "30 persen")
const glue = (w: string) => /^[\d][\d.,]*$/.test(w) || /^ribu$/i.test(w);
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of CLIPS) {
    let cur: Word[] = [];
    const ws = c.words;
    ws.forEach((w, i) => {
      cur.push(w);
      const left = ws.length - 1 - i;
      const punct = /[.,:?!]$/.test(w.w);
      if (!glue(w.w) && ((punct && cur.length >= 2 && left !== 1) || (cur.length >= 6 && left >= 2) || left === 0)) {
        out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
        cur = [];
      }
    });
    if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  }
  // merge a lone trailing word into the previous chunk of the same clip
  for (let i = out.length - 1; i > 0; i--) {
    if (out[i].words.length === 1 && out[i - 1].words.length < 7 && out[i].s - out[i - 1].e < 0.6) {
      out[i - 1] = { words: [...out[i - 1].words, ...out[i].words], s: out[i - 1].s, e: out[i].e };
      out.splice(i, 1);
    }
  }
  return out;
})();

const Caption: React.FC<{ t: number }> = ({ t }) => {
  if (t >= OUTRO_AT - 0.1) return null;
  const idx = CHUNKS.findIndex((c, i) => t >= c.s - 0.14 && t < (CHUNKS[i + 1] ? Math.min(CHUNKS[i + 1].s - 0.14, c.e + 0.9) : c.e + 0.9));
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const n = c.words.length;
  let cut = Math.ceil(n / 2);
  // move the line break so a number never ends a line (keeps it with its unit)
  for (const d of [0, 1, -1, 2, -2]) {
    const k2 = Math.ceil(n / 2) + d;
    if (k2 >= 2 && k2 <= n - 2 && !glue(c.words[k2 - 1].w)) { cut = k2; break; }
  }
  const lines = n <= 4 ? [c.words] : [c.words.slice(0, cut), c.words.slice(cut)];
  const appear = seg(t, c.s - 0.14, c.s - 0.02);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: appear }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: 24, background: "rgba(10,4,22,0.88)", borderBottom: `3px solid ${P.flirMagenta}`, padding: "10px 26px 8px", borderRadius: 6 }}>
          {ln.map((w, wi) => {
            const active = t >= w.s - 0.03 && t < w.e + 0.05;
            const past = t >= w.e + 0.05;
            const k = active ? seg(t, w.s - 0.03, w.s + 0.08) : 0;
            return (
              <span key={wi} style={{
                fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.1,
                color: active ? P.flirYellow : past ? "#ffffff" : "rgba(255,255,255,0.5)",
                transform: `scale(${1 + 0.04 * k})`, display: "inline-block", transformOrigin: "50% 60%",
                textShadow: active ? `0 0 18px rgba(247,208,56,0.55), ${SH}` : SH,
              }}>{w.w}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- smoke wipe + rain
const SmokeWipe: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const d = Math.abs(t - at);
  if (d > 0.55) return null;
  const a = smooth(1 - d / 0.55);
  const drift = (t - at) * 600;
  const blobs = [
    [20, 30, 900, "#4d0d8c"], [80, 45, 1000, "#310e68"], [45, 70, 1100, "#9b1d8c"], [60, 15, 800, "#2a0a4a"], [30, 85, 900, "#5a1270"],
  ] as const;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, a * 1.15) }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(23,6,48,0.85)" }} />
      {blobs.map(([x, y, r, c], i) => (
        <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: r, height: r, marginLeft: -r / 2 + drift * (i % 2 ? 1 : -0.7), marginTop: -r / 2, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, rgba(23,6,48,0) 70%)`, opacity: 0.9 }} />
      ))}
    </AbsoluteFill>
  );
};

const Rain: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T.musim - 0.3, OUTRO_AT + 0.5, 0.8, 0.3);
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: 0.32 * o, backgroundImage: "repeating-linear-gradient(103deg, rgba(150,170,255,0) 0px, rgba(150,170,255,0) 22px, rgba(170,190,255,0.9) 23px, rgba(150,170,255,0) 25px)", backgroundSize: "100% 100%", backgroundPosition: `${(t * 90) % 50}px ${(t * 1400) % 1920}px` }} />
  );
};

// ---------------------------------------------------------------- HUD
export const Hud: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const { width, height } = useVideoConfig();
  const k = width / 1080;
  const proj = projector(t, width, height);
  const blink = Math.floor(f / 20) % 2 === 0 ? 1 : 0.35;
  const town = proj(MERAUKE);

  // dates on the sensor strip
  const date = t < SEC_PAYOFF() ? "11 OKT 2026" : t < T.lalu6 ? "31 OKT 2026" : t < T.apiO ? "6 NOV 2026" : "NOV 2026";

  // hook
  const hookO = win(t, -1, T.itu - 0.05, 0.01, 0.35);
  const kalO = win(t, T.bukan - 0.1, T.itu - 0.05, 0.3, 0.35);
  const strike = seg(t, T.kalimantan + 0.2, T.kalimantan + 0.6);
  const papO = win(t, T.papua - 0.2, T.itu - 0.05, 0.3, 0.35);
  const townO = Math.max(win(t, T.papua, T.okt11 + 1.2, 0.3, 0.5), win(t, T.merauke - 0.3, T.api, 0.3, 0.4), win(t, T.ikuti - 0.2, OUTRO_AT - 0.1, 0.4, 0.3));
  // konteks
  const bmkgO = win(t, T.itu, T.kemarau - 0.05, 0.35, 0.3);
  const nino = win(t, T.kemarau, T.api - 0.05, 0.35, 0.3);
  const hari = win(t, T.merauke - 0.2, T.api - 0.05, 0.3, 0.3);
  const hariN = Math.round(100 * seg(t, T.seratus - 0.3, T.hujanEnd));
  const distO = win(t, T.api - 0.1, T.dulu - 0.05, 0.3, 0.3);
  const rawaP = proj(g(RAWA.x, RAWA.z, 0.05));
  const rawaO = win(t, T.dulu, CUT1 - 0.1, 0.3, 0.25);
  const kering = seg(t, T.tahun, T.tahun + 0.4);
  // pengembangan
  const yonasO = win(t, CUT1 + 0.15, T.asapnya + 0.2, 0.4, 0.4);
  const quoteO = win(t, T.masyarakat - 0.2, T.asapnya + 0.2, 0.35, 0.4);
  const asapO = win(t, T.asapnya + 0.2, T.dinas, 0.4, 0.35);
  const arrowDraw = seg(t, T.asapnya + 0.4, T.maluku + 0.2);
  const ispaO = win(t, T.dinas - 0.1, T.di1 - 0.05, 0.35, 0.3);
  const barsO = win(t, T.di1, T.lalu, 0.35, 0.35);
  const pct = win(t, T.tiga0 - 0.1, T.lalu, 0.3, 0.35);
  // penjelasan
  const qO = win(t, T.lalu, T.s63 - 0.05, 0.35, 0.3);
  const beda = seg(t, T.karena, T.karena + 0.3);
  const smallP = proj(g(AREA.x + SQ_SMALL_HALF, AREA.z - SQ_SMALL_HALF, 0.02));
  const smallO = win(t, T.s63, T.dan, 0.35, 0.35);
  const bigO = win(t, T.s25 + 0.9, T.dan, 0.35, 0.35);
  const bigP = proj(g(AREA.x - SQ_BIG_HALF, AREA.z - SQ_BIG_HALF, 0.02));
  const satO = win(t, T.dan - 0.1, CUT2 - 0.05, 0.35, 0.2);
  const satP = proj(satPos(t));
  const pixO = win(t, T.itu2, CUT2 - 0.05, 0.35, 0.2);
  // payoff
  const okt31 = win(t, CUT2 + 0.2, T.asapF, 0.35, 0.3);
  const k1 = win(t, T.kepala1 - 0.15, T.asapF, 0.35, 0.3);
  const k2 = win(t, T.kepala2 - 0.15, T.asapF, 0.35, 0.3);
  const heliP = proj(heliPos(t));
  const asapF = win(t, T.asapF, T.penyebab - 0.1, 0.35, 0.3);
  const concP = proj(g(CONC.x - 1.2, CONC.z + 1.6, 0.05));
  const concO = win(t, T.wilayah - 0.1, T.lalu6, 0.35, 0.35);
  const sebab = win(t, T.penyebab - 0.1, T.lalu6, 0.3, 0.3);
  const novO = win(t, T.lalu6, T.apiO - 0.05, 0.35, 0.3);
  const n66 = Math.round(66 * seg(t, T.naik, T.n66 + 0.3));
  // outro
  const padam = win(t, T.apiO - 0.05, T.ikuti - 0.05, 0.35, 0.3);
  const hujan = seg(t, T.musim - 0.1, T.musim + 0.3);
  const banjir = seg(t, T.banjir - 0.1, T.banjir + 0.3);
  const ikuti = win(t, T.ikuti - 0.1, OUTRO_AT, 0.35, 0.25);

  // 1-km / 10-km scale bars in the area shots
  const sb = (km: number, o: number) => {
    if (o <= 0.001) return null;
    const a = proj(g(AREA.x - km / 4, AREA.z + (km > 5 ? SQ_BIG_HALF + 0.5 : SQ_SMALL_HALF + 0.12), 0.02));
    const b = proj(g(AREA.x + km / 4, AREA.z + (km > 5 ? SQ_BIG_HALF + 0.5 : SQ_SMALL_HALF + 0.12), 0.02));
    const y = Math.min(1180, a.y);
    return (
      <div style={{ position: "absolute", left: a.x, top: y, width: Math.max(4, b.x - a.x), opacity: o }}>
        <div style={{ height: 6, background: "#fff", borderLeft: "3px solid #fff", borderRight: "3px solid #fff" }} />
        <div style={{ fontFamily: MONO, fontSize: 26, color: "#fff", textShadow: SH, marginTop: 6, textAlign: "center", whiteSpace: "nowrap" }}>{km} km</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {/* read shades: top for panels, bottom for captions */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,3,18,0.62) 0%, rgba(8,3,18,0.22) 26%, rgba(8,3,18,0) 40%, rgba(8,3,18,0) 62%, rgba(8,3,18,0.5) 80%, rgba(8,3,18,0.7) 100%)" }} />

        {/* ground anchors */}
        <Tag p={town} o={townO} lift={110}>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 4, color: "#fff", background: "rgba(8,3,18,0.62)", border: `2px solid ${P.hudCyan}`, padding: "4px 14px" }}>MERAUKE</div>
          <div style={{ fontSize: 26, marginTop: 4, letterSpacing: 2 }}>PAPUA SELATAN</div>
        </Tag>
        <Tag p={rawaP} o={rawaO} lift={150} color={kering > 0.5 ? P.flirAmber : P.hudCyan}>
          <div style={{ fontSize: 26, letterSpacing: 3, color: kering > 0.5 ? P.flirYellow : P.hudCyan }}>{kering > 0.5 ? "TAHUN INI · 2026" : "⟲ DULU"}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#fff", background: "rgba(8,3,18,0.62)", padding: "4px 14px", marginTop: 4 }}>
            {kering > 0.5 ? "RAWA KERING" : "RAWA BASAH"}
          </div>
          <div style={{ fontSize: 26, marginTop: 6, color: kering > 0.5 ? P.flirYellow : "#bfe9ff" }}>{kering > 0.5 ? "sekat api hilang · api lewat" : "= sekat api alami"}</div>
        </Tag>
        {BARS.map((b) => {
          const p = proj(g(b.x, BAR_Z, barH(b.v) * seg(t, b.at(), b.at() + 0.9) + 0.08));
          const o = barsO * seg(t, b.at() + 0.4, b.at() + 0.8);
          if (o <= 0.001 || p.behind) return null;
          return (
            <div key={b.label} style={{ position: "absolute", left: p.x - 120, top: p.y - 96, width: 240, textAlign: "center", opacity: o, fontFamily: MONO, textShadow: SH }}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#fff" }}>{b.tag}</div>
              <div style={{ fontSize: 26, color: b.color, letterSpacing: 3 }}>{b.label}</div>
            </div>
          );
        })}
        <Tag p={smallP} o={smallO} lift={140} dx={14} color={P.flirYellow}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: bigO > 0.5 ? 34 : 54, color: P.flirYellow, background: "rgba(8,3,18,0.62)", padding: "2px 12px" }}>63 HA</div>
          {bigO < 0.5 && <div style={{ fontSize: 26, marginTop: 6, color: "#fff" }}>laporan awal · 9 lokasi</div>}
          {bigO < 0.5 && <div style={{ fontSize: 26, marginTop: 4, color: "#d8d2f2" }}>BNPB, 11 Okt</div>}
        </Tag>
        <Tag p={bigP} o={bigO} lift={70} dx={14} color={P.hudCyan}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 54, color: "#fff", background: "rgba(8,3,18,0.62)", padding: "2px 12px" }}>25.000 HA</div>
          <div style={{ fontSize: 26, marginTop: 6, color: "#fff" }}>total sepanjang kemarau</div>
          <div style={{ fontSize: 26, marginTop: 4, color: P.hudCyan }}>versi Pemkab Merauke</div>
        </Tag>
        {sb(1, smallO * (1 - bigO))}
        {sb(10, bigO)}
        <Tag p={satP} o={satO} lift={0} dx={30} minTop={420} color={P.hudCyan}>
          <div style={{ fontSize: 26, letterSpacing: 3, background: "rgba(8,3,18,0.62)", padding: "2px 10px" }}>SATELIT</div>
        </Tag>
        <Tag p={heliP} o={win(t, CUT2 + 0.3, T.asapF, 0.4, 0.3)} lift={70} dx={14} color={P.hudCyan}>
          <div style={{ fontSize: 26, letterSpacing: 3, background: "rgba(8,3,18,0.62)", padding: "2px 10px" }}>HELIKOPTER · PANTAUAN UDARA</div>
        </Tag>
        <Tag p={concP} o={concO} lift={130} dx={-200} color={P.flirYellow}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#fff", background: "rgba(8,3,18,0.7)", padding: "4px 14px", lineHeight: 1.1 }}>WILAYAH KONSESI<br />PERUSAHAAN</div>
          <div style={{ fontSize: 26, marginTop: 6, color: P.flirYellow }}>titik api terbanyak · BNPB</div>
        </Tag>

        {/* smoke over the sea toward Maluku */}
        {asapO > 0.001 && !town.behind && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: asapO }}>
            <defs>
              <marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={P.flirYellow} /></marker>
            </defs>
            <path d={`M ${town.x} ${town.y} Q ${town.x - 120} ${(town.y + 470) / 2 - 80} 150 470`} stroke={P.flirYellow} strokeWidth={8} fill="none" strokeDasharray="1400" strokeDashoffset={1400 * (1 - arrowDraw)} markerEnd={arrowDraw > 0.95 ? "url(#ah)" : undefined} strokeLinecap="round" />
          </svg>
        )}
        <Panel top={490} left={110} o={asapO * seg(t, T.maluku - 0.3, T.maluku + 0.1)}>
          <Kicker color={P.flirYellow}>ASAP MENYEBERANG LAUT</Kicker>
          <Big size={64}>→ MALUKU</Big>
        </Panel>

        {/* beat panels */}
        <Panel top={350} o={hookO}>
          <Kicker>BMKG · TITIK PANAS · SATU HARI</Kicker>
          <Big size={168} color={P.flirYellow}>6.700</Big>
          <Big size={52}>TITIK PANAS</Big>
        </Panel>
        {kalO > 0.001 && (
          <div style={{ position: "absolute", top: 760, left: 72, display: "flex", gap: 18, opacity: kalO, fontFamily: MONO, fontSize: 30, letterSpacing: 2 }}>
            <div style={{ position: "relative", background: GLASS, color: "#9a94b8", padding: "10px 18px" }}>
              KALIMANTAN
              <div style={{ position: "absolute", left: 10, top: "50%", height: 4, width: `${strike * 90}%`, background: "#ff3b3b" }} />
            </div>
            {papO > 0.001 && <div style={{ background: P.flirYellow, color: "#170630", padding: "10px 18px", fontWeight: 700, opacity: papO }}>✓ PAPUA SELATAN</div>}
          </div>
        )}
        <Panel top={350} o={bmkgO}>
          <Kicker>CATATAN BMKG</Kicker>
          <Big size={96}>11 OKTOBER</Big>
          <Small>hitungan titik panas harian · 2026</Small>
        </Panel>
        <Panel top={350} o={nino} accent={P.flirAmber}>
          <Kicker color={P.flirAmber}>KEMARAU PANJANG + EL NIÑO KUAT</Kicker>
          {hari > 0.001 && (
            <div style={{ opacity: hari, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <Big size={130} color={P.flirYellow}>{hariN}</Big>
                <Big size={44}>HARI<br />TANPA HUJAN</Big>
              </div>
              <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
                {Array.from({ length: 50 }, (_, i) => (
                  <div key={i} style={{ width: 9, height: 26, background: i < hariN / 2 ? P.flirAmber : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
              <Small>Merauke · BMKG</Small>
            </div>
          )}
        </Panel>
        <Panel top={350} o={distO}>
          <Kicker>KABUPATEN MERAUKE · BNPB</Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <Big size={130} color={P.flirYellow}>{Math.round(10 * seg(t, T.sepuluh - 0.1, T.sepuluh + 0.5))}</Big>
            <Big size={52}>DISTRIK<br />TERBAKAR</Big>
          </div>
        </Panel>
        <NameCard top={350} o={yonasO} name="Yonas" role="Warga Distrik Ilwayab" />
        <Panel top={510} o={quoteO} accent={P.flirAmber}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 50, color: "#fff", lineHeight: 1.15, maxWidth: 820, textShadow: SH }}>
            “…sampai masyarakat<br />setengah mati.”
          </div>
          <Small color={P.flirYellow}>Yonas, kepada BBC</Small>
        </Panel>
        <Panel top={350} o={ispaO} accent={P.hudCyan}>
          <Kicker>DINAS KESEHATAN PAPUA SELATAN</Kicker>
          <Big size={64}>ISPA NAIK DI</Big>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
            <Big size={110} color={P.flirYellow}>4</Big>
            <Big size={52}>KABUPATEN</Big>
            {[0, 1, 2, 3].map((i) => {
              const o = seg(t, T.empat + i * 0.12, T.empat + i * 0.12 + 0.25);
              return (
                <div key={i} style={{ width: 50, height: 50, opacity: o, transform: `scale(${0.6 + 0.4 * o})`, background: "rgba(0,229,255,0.15)", border: `3px solid ${P.hudCyan}`, display: "flex", alignItems: "center", justifyContent: "center", color: P.hudCyan, fontFamily: FONT, fontWeight: 800, fontSize: 36 }}>+</div>
              );
            })}
          </div>
        </Panel>
        <Panel top={350} o={barsO} accent={P.hudCyan}>
          <Kicker>SATU PUSKESMAS DI MERAUKE</Kicker>
          <Big size={56}>KASUS ISPA · JUL–SEP</Big>
          <Small>indeks · Juli = 100</Small>
          {pct > 0.001 && (
            <div style={{ opacity: pct, display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
              <Big size={96} color={P.flirYellow}>±30%</Big>
              <div style={{ fontFamily: MONO, fontSize: 26, color: "#fff" }}>JULI → SEPTEMBER</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {([["KEMARAU", T.kemarau2], ["DEBU", T.debu], ["ASAP", T.asap2]] as const).map(([w, at]) => {
              const o = seg(t, at - 0.1, at + 0.2);
              return o > 0.001 ? (
                <div key={w} style={{ opacity: o, fontFamily: MONO, fontSize: 26, color: "#170630", background: P.flirAmber, padding: "6px 14px", fontWeight: 700 }}>{w}</div>
              ) : null;
            })}
          </div>
        </Panel>
        <Panel top={350} o={qO} accent={P.flirAmber}>
          <Kicker color={P.flirAmber}>LUAS KEBAKARAN?</Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 6 }}>
            <Big size={88} color={P.flirYellow}>{t >= T.n63 - 0.1 ? "63" : ""}</Big>
            <Big size={60}>{t >= T.n25 - 0.1 ? "…" : ""}</Big>
            <Big size={88} color={P.hudCyan}>{t >= T.n25 - 0.1 ? "25.000" : ""}</Big>
            <Big size={40}>HA</Big>
          </div>
          {beda > 0.001 && (
            <div style={{ opacity: beda, marginTop: 14, display: "inline-block", fontFamily: MONO, fontSize: 30, color: "#170630", background: "#fff", padding: "6px 16px", fontWeight: 700, letterSpacing: 2 }}>
              YANG DIUKUR BERBEDA
            </div>
          )}
        </Panel>
        <Panel top={350} o={satO} accent={P.hudCyan}>
          <Big size={84}>TITIK PANAS <span style={{ color: P.flirYellow }}>≠</span> API</Big>
          {pixO > 0.001 && (
            <div style={{ opacity: pixO }}>
              <Small color="#fff">panas permukaan yang ditangkap satelit</Small>
              <Small color={P.hudCyan}>1 titik = 1 piksel citra yang terdeteksi panas</Small>
            </div>
          )}
        </Panel>
        <Panel top={350} o={okt31 * (1 - k1)} accent={P.hudCyan}>
          <Kicker>PANTAUAN UDARA</Kicker>
          <Big size={96}>31 OKTOBER</Big>
        </Panel>
        <NameCard top={350} o={k1} name="Letjen TNI Kristomei Sianturi" role="Kepala BNPB" headset />
        <NameCard top={520} o={k2} name="Teuku Faisal Fathani" role="Kepala BMKG" headset />
        <Panel top={350} o={asapF} accent={P.flirAmber}>
          <Kicker color={P.flirAmber}>31 OKT · DARI UDARA</Kicker>
          <Big size={64}>ASAP MASIH TERLIHAT</Big>
        </Panel>
        {sebab > 0.001 && (
          <div style={{ position: "absolute", top: 360, left: 72, right: 72, opacity: sebab, transform: `scale(${1.06 - 0.06 * sebab})`, transformOrigin: "50% 50%" }}>
            <div style={{ border: `5px solid #fff`, background: "rgba(12,4,26,0.82)", padding: "22px 26px", textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 4, color: P.flirYellow }}>PENYEBAB PASTI</div>
              <Big size={78}>BELUM DITETAPKAN</Big>
            </div>
          </div>
        )}
        <Panel top={350} o={novO} accent={"#ff3b3b"}>
          <Kicker color={P.flirYellow}>6 NOVEMBER 2026 · BNPB</Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <Big size={150} color={P.flirYellow}>+{n66}%</Big>
          </div>
          <Big size={48}>TITIK PANAS NAIK LAGI</Big>
        </Panel>
        <Panel top={350} o={padam} accent={P.hudCyan}>
          <Kicker color={P.flirAmber}>API BELUM PADAM</Kicker>
          {hujan > 0.001 && <div style={{ opacity: hujan }}><Big size={64}>MUSIM HUJAN →</Big></div>}
          {banjir > 0.001 && <div style={{ opacity: banjir }}><Big size={88} color={P.hudCyan}>ANCAMAN BANJIR</Big></div>}
        </Panel>
        <Panel top={350} o={ikuti} accent={P.hudCyan}>
          <Kicker>PERINGATAN DINI</Kicker>
          <Big size={84}>IKUTI INFO BMKG</Big>
        </Panel>

        <Rain t={t} />

        {/* viewfinder */}
        <Corner x={56} y={244} rot={0} />
        <Corner x={970} y={244} rot={90} />
        <Corner x={56} y={1196} rot={-90} />
        <Corner x={970} y={1196} rot={180} />
        <div style={{ position: "absolute", top: 262, left: 128, right: 128, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 26, color: P.hudCyan, letterSpacing: 2, textShadow: SH }}>
          <span><span style={{ color: "#ff3b3b", opacity: blink }}>●</span> REC · IR · {date}</span>
          <span style={{ color: P.flirYellow }}>AUDIRA THERMAL</span>
        </div>
        <div style={{ position: "absolute", top: 298, right: 128, fontFamily: MONO, fontSize: 26, color: "#170630", background: "rgba(255,255,255,0.82)", padding: "2px 10px", letterSpacing: 2 }}>ILUSTRASI</div>
        {/* ironbow scale */}
        <div style={{ position: "absolute", right: 74, top: 760, width: 18, height: 380, borderRadius: 4, border: "1px solid rgba(255,255,255,0.5)", background: "linear-gradient(0deg, #03030d 0%, #120854 14%, #4d0d8c 30%, #a8177f 45%, #e6401f 60%, #f78c12 72%, #fcd238 86%, #fffbe0 100%)" }} />
        <div style={{ position: "absolute", right: 100, top: 752, fontFamily: MONO, fontSize: 26, color: "#fff", textShadow: SH }}>PANAS</div>
        <div style={{ position: "absolute", right: 100, top: 1122, fontFamily: MONO, fontSize: 26, color: "#b9b4ff", textShadow: SH }}>DINGIN</div>

        <Caption t={t} />
      </div>
      <SmokeWipe t={t} at={CUT1} />
      <SmokeWipe t={t} at={CUT2} />
    </AbsoluteFill>
  );
};

const SEC_PAYOFF = () => CUT2;
