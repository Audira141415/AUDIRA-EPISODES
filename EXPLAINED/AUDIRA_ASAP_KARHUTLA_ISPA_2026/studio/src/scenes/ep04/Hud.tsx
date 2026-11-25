// EP04 film — HUD layer: clinical hologram labels, data panels, name cards (generic mic icon, no
// faces), smoke wipes for the hair cuts, and karaoke captions. All beats keyed to clock.ts.
import React from "react";
import { ANATOMY_PALETTE as P } from "../../kits/anatomix/lib/palette";
import { CLIPS, CUT, OUTRO_AT, T, TOTAL, easeOut, lerp, seg, win, type Word } from "./clock";
import { HAIR, LEAF_W, mapWorld, project } from "./camera";
import { CHART, PROVINCES } from "./Holos";
import { MASKS, ROOM } from "./Protect";
import { HERO } from "./Macro";

const AMBER = "#FF9A4D";
const SANS = "'Segoe UI', 'Inter', Arial, sans-serif";
const MONO = "Consolas, 'JetBrains Mono', monospace";

const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

type Ctx = { t: number; s: number; w: number; h: number };

const card = (s: number, accent: string = P.holo): React.CSSProperties => ({
  background: "rgba(3,20,26,0.82)",
  border: `${1.5 * s}px solid rgba(63,224,208,0.35)`,
  borderLeft: `${6 * s}px solid ${accent}`,
  borderRadius: 12 * s,
});

const Fade: React.FC<{ o: number; y?: number; s: number; style: React.CSSProperties; children: React.ReactNode }> = ({ o, y = 14, s, style, children }) =>
  o <= 0.001 ? null : (
    <div style={{ position: "absolute", opacity: o, transform: `translateY(${(1 - o) * y * s}px)`, ...style }}>{children}</div>
  );

const Mic: React.FC<{ s: number }> = ({ s }) => (
  <svg width={54 * s} height={54 * s} viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="26" fill="rgba(63,224,208,0.12)" stroke={P.holo} strokeWidth="2" />
    <rect x="21" y="11" width="12" height="21" rx="6" fill={P.holoSoft} />
    <path d="M16 26 a11 11 0 0 0 22 0" fill="none" stroke={P.holoSoft} strokeWidth="2.6" strokeLinecap="round" />
    <line x1="27" y1="37" x2="27" y2="43" stroke={P.holoSoft} strokeWidth="2.6" />
    <line x1="20" y1="43" x2="34" y2="43" stroke={P.holoSoft} strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const NameCard: React.FC<{ c: Ctx; o: number; name: string; role: string; top: number; right?: boolean }> = ({ c, o, name, role, top, right }) => (
  <Fade o={o} s={c.s} style={{ ...(right ? { right: 56 * c.s } : { left: 56 * c.s }), top: top * c.s, ...card(c.s), padding: `${12 * c.s}px ${20 * c.s}px`, display: "flex", alignItems: "center", gap: 16 * c.s, maxWidth: 760 * c.s }}>
    <Mic s={c.s} />
    <div>
      <div style={{ fontSize: 34 * c.s, fontWeight: 800, color: P.hud, lineHeight: 1.1 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 26 * c.s, color: P.holo, letterSpacing: 1 * c.s, marginTop: 4 * c.s }}>{role}</div>
    </div>
  </Fade>
);

const Kicker: React.FC<{ c: Ctx; text: string; o: number }> = ({ c, text, o }) => (
  <div style={{ position: "absolute", top: 262 * c.s, left: 56 * c.s, opacity: o, fontFamily: MONO, fontSize: 26 * c.s, letterSpacing: 4 * c.s, color: P.holo, fontWeight: 700 }}>● {text}</div>
);

const Headline: React.FC<{ c: Ctx; o: number; children: React.ReactNode; size?: number; top?: number }> = ({ c, o, children, size = 96, top = 306 }) => (
  <Fade o={o} s={c.s} y={20} style={{ left: 52 * c.s, right: 52 * c.s, top: top * c.s, fontSize: size * c.s, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1 * c.s, color: P.hud, textShadow: "0 6px 26px rgba(0,0,0,0.75)" }}>
    {children}
  </Fade>
);

/** Label pinned to a projected world point with a leader line. */
const Pin: React.FC<{ c: Ctx; p: [number, number, number]; o: number; dx: number; dy: number; color?: string; children: React.ReactNode; align?: "left" | "right" }> = ({ c, p, o, dx, dy, color = P.holo as string, children, align = "left" }) => {
  if (o <= 0.001) return null;
  const a = project(c.t, p, c.w, c.h);
  const bx = a.x + dx * c.s;
  const by = a.y + dy * c.s;
  return (
    <>
      <svg width={c.w} height={c.h} style={{ position: "absolute", inset: 0, opacity: o }}>
        <polyline points={`${a.x},${a.y} ${bx},${by}`} fill="none" stroke={color} strokeWidth={2.5 * c.s} />
        <circle cx={a.x} cy={a.y} r={7 * c.s} fill={color} stroke="#fff" strokeWidth={2 * c.s} />
      </svg>
      <div
        style={{
          position: "absolute",
          top: by - 26 * c.s,
          ...(align === "left" ? { left: bx } : { right: c.w - bx }),
          opacity: o,
          ...card(c.s, color),
          ...(align === "right" ? { borderLeft: `${1.5 * c.s}px solid rgba(63,224,208,0.35)`, borderRight: `${6 * c.s}px solid ${color}`, textAlign: "right" as const } : {}),
          padding: `${8 * c.s}px ${14 * c.s}px`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </>
  );
};

const FileIcon: React.FC<{ s: number; hot: number }> = ({ s, hot }) => {
  const stroke = hot > 0.5 ? AMBER : P.holoSoft;
  return (
    <svg width={110 * s} height={132 * s} viewBox="0 0 110 132" style={{ filter: hot > 0.5 ? `drop-shadow(0 0 ${14 * s}px ${AMBER})` : undefined }}>
      <path d="M12 6 h62 l26 26 v92 h-88 z" fill={hot > 0.5 ? "rgba(255,154,77,0.28)" : "rgba(63,224,208,0.10)"} stroke={stroke} strokeWidth="4" />
      <path d="M74 6 v26 h26" fill="none" stroke={stroke} strokeWidth="4" />
      {[54, 72, 90, 108].map((y) => (
        <line key={y} x1="26" y1={y} x2={y === 108 ? 62 : 86} y2={y} stroke={stroke} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------- sections
const Hook: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const o = 1 - seg(t, T.ini - 0.35, T.ini + 0.1);
  if (o <= 0) return null;
  const k = seg(t, T.ribu - 0.15, T.ribu + 0.2);
  const icons = seg(t, T.hampir - 0.2, T.hampir + 0.3);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 306 * s, left: 52 * s, right: 52 * s, textShadow: "0 6px 26px rgba(0,0,0,0.75)", color: P.hud }}>
        <div style={{ position: "relative", height: 168 * s }}>
          <div style={{ position: "absolute", fontSize: 176 * s, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3 * s, opacity: 1 - k, transform: `scale(${1 - 0.06 * k})`, transformOrigin: "left center" }}>425.167</div>
          <div style={{ position: "absolute", fontSize: 176 * s, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3 * s, opacity: k, transform: `scale(${1.06 - 0.06 * k})`, transformOrigin: "left center" }}>
            425 <span style={{ color: AMBER }}>RIBU</span>
          </div>
        </div>
        <div style={{ fontSize: 112 * s, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1 * s, marginTop: 4 * s }}>KASUS ISPA</div>
        <div style={{ display: "inline-block", marginTop: 18 * s, fontSize: 40 * s, fontWeight: 700, color: "#FFE2C9", background: "rgba(3,20,26,0.72)", borderLeft: `${7 * s}px solid ${AMBER}`, padding: `${6 * s}px ${18 * s}px`, opacity: 1 - icons }}>di wilayah karhutla</div>
      </div>
      {icons > 0 && (
        <div style={{ position: "absolute", top: 590 * s, left: 56 * s, right: 56 * s, opacity: icons, transform: `translateY(${(1 - icons) * 20 * s}px)`, background: "rgba(3,20,26,0.8)", border: `${1.5 * s}px solid rgba(63,224,208,0.35)`, borderRadius: 14 * s, padding: `${16 * s}px ${20 * s}px` }}>
          <div style={{ display: "flex", gap: 22 * s, alignItems: "flex-end" }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const hot = i === 0 ? seg(t, T.lima - 0.1, T.lima + 0.2) : 0;
              const pop = i === 0 ? 1 + 0.08 * Math.max(0, 1 - Math.abs(t - T.lima - 0.15) / 0.3) : 1;
              const appear = seg(t, T.hampir - 0.1 + i * 0.09, T.hampir + 0.2 + i * 0.09);
              return (
                <div key={i} style={{ opacity: appear * (hot > 0.5 || seg(t, T.lima, T.lima + 0.3) < 0.5 ? 1 : 0.6), transform: `scale(${pop})` }}>
                  <FileIcon s={s * 0.78} hot={hot} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12 * s, display: "flex", gap: 14 * s, alignItems: "baseline", opacity: seg(t, T.lima, T.lima + 0.35) }}>
            <span style={{ fontSize: 46 * s, fontWeight: 900, color: AMBER }}>1 dari 5</span>
            <span style={{ fontSize: 36 * s, fontWeight: 700, color: P.hud }}>kasus menimpa</span>
            <span style={{ fontSize: 46 * s, fontWeight: 900, color: AMBER, opacity: seg(t, T.balitaH - 0.1, T.balitaH + 0.2) }}>BALITA</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Konteks: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const head1 = win(t, T.ini - 0.1, CUT.map + 0.2, 0.35, 0.35);
  const head2 = win(t, CUT.map + 0.2, T.satuan - 0.05, 0.4, 0.3);
  const unit = win(t, T.satuan - 0.15, CUT.balita + 0.15, 0.35, 0.3);
  const bal = win(t, CUT.balita + 0.1, CUT.chart + 0.15, 0.35, 0.35);
  const lit = PROVINCES.filter((p) => t >= p.at).length;
  const n = lerp(0, 95627, easeOut(seg(t, T.pada, T.n96 + 0.25)));
  return (
    <>
      <Headline c={c} o={head1}>
        DATA
        <br />
        KEMENKES
        <div style={{ fontSize: 40 * s, fontWeight: 700, color: "#FFE2C9", marginTop: 14 * s, opacity: seg(t, T.sejak - 0.1, T.sejak + 0.3) }}>
          kumulatif · sejak <span style={{ color: AMBER }}>18 Agustus 2026</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, fontWeight: 600, color: "rgba(230,251,248,0.7)", marginTop: 10 * s, opacity: seg(t, T.sejak, T.sejak + 0.4) }}>data per 5 Nov 2026 · 17.00 WIB</div>
      </Headline>
      <NameCard c={c} o={win(t, T.data - 0.05, CUT.map + 0.1, 0.35, 0.35)} name="Widyawati" role="Juru Bicara Kementerian Kesehatan" top={1130} />
      <Headline c={c} o={head2} size={120}>
        <span style={{ color: AMBER }}>{Math.max(1, lit)}</span>
        <span style={{ fontSize: 64 * s }}> / 7 PROVINSI</span>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, fontWeight: 600, color: P.holo, marginTop: 10 * s, letterSpacing: 2 * s }}>SUMATRA &amp; KALIMANTAN · PAPUA TIDAK TERMASUK</div>
      </Headline>
      {PROVINCES.map((p, i) => {
        const o = win(t, p.at - 0.05, T.satuan + 0.1, 0.3, 0.3);
        const left = p.lon < 108;
        const dy = [-150, -110, -60, -190, -120, 90, -230][i];
        const dx = left ? [-40, -80, -60][i] ?? -40 : [-30, -40, -30, -40][i - 3];
        return (
          <Pin key={p.name} c={c} p={mapWorld(p.lon, p.lat, 0.01)} o={o} dx={dx} dy={dy} color={AMBER} align="right">
            <span style={{ fontSize: 26 * s, fontWeight: 800, color: P.hud }}>{p.name}</span>
          </Pin>
        );
      })}
      <Fade o={unit} s={s} style={{ left: 90 * s, right: 90 * s, top: 420 * s, ...card(s, AMBER), padding: `${22 * s}px ${30 * s}px`, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, letterSpacing: 4 * s, color: AMBER, fontWeight: 700 }}>SATUAN DATA</div>
        <div style={{ fontSize: 76 * s, fontWeight: 900, color: P.hud, marginTop: 6 * s }}>KASUS</div>
        <div style={{ fontSize: 40 * s, fontWeight: 700, color: "#FFE2C9", marginTop: 4 * s, opacity: seg(t, T.bukan - 0.1, T.bukan + 0.3) }}>
          bukan jumlah <span style={{ textDecoration: "line-through", textDecorationColor: AMBER, textDecorationThickness: 5 * s }}>orang</span>
        </div>
      </Fade>
      <Fade o={bal} s={s} style={{ left: 52 * s, right: 52 * s, top: 306 * s }}>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, letterSpacing: 4 * s, color: AMBER, fontWeight: 700 }}>KASUS PADA BALITA</div>
        <div style={{ fontSize: 160 * s, fontWeight: 900, color: P.hud, lineHeight: 1, letterSpacing: -3 * s, textShadow: "0 6px 26px rgba(0,0,0,0.75)", fontVariantNumeric: "tabular-nums" }}>{fmt(n)}</div>
        <div style={{ display: "inline-block", marginTop: 14 * s, fontSize: 44 * s, fontWeight: 800, color: "#FFE2C9", background: "rgba(3,20,26,0.72)", borderLeft: `${7 * s}px solid ${AMBER}`, padding: `${6 * s}px ${18 * s}px`, opacity: seg(t, T.n96, T.n96 + 0.3) }}>
          hampir 96 ribu kasus
        </div>
      </Fade>
    </>
  );
};

const Pengembangan: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const cumHead = win(t, CUT.chart, CUT.daily + 0.1, 0.4, 0.3);
  const dHead = win(t, CUT.daily + 0.1, CUT.stack + 0.1, 0.35, 0.3);
  const sHead = win(t, CUT.stack + 0.1, CUT.memorial + 0.1, 0.35, 0.3);
  const gA = seg(t, T.n283 - 0.2, T.n283 + 0.3);
  const gB = seg(t, T.n425b - 0.2, T.n425b + 0.3);
  const top = (x: number, h: number) => [x, CHART.base + h + 0.08, 0] as [number, number, number];
  const lblO = win(t, CUT.chart + 0.5, CUT.daily + 0.1, 0.3, 0.3);
  const stackO = win(t, CUT.stack + 0.3, CUT.memorial + 0.1, 0.3, 0.3);
  return (
    <>
      <Headline c={c} o={cumHead} size={92}>
        KASUS
        <br />
        KUMULATIF
        <div style={{ display: "flex", gap: 14 * s, alignItems: "center", marginTop: 16 * s, fontSize: 30 * s, fontWeight: 700, color: "#FFE2C9" }}>
          <span style={{ width: 26 * s, height: 26 * s, background: AMBER, borderRadius: 4 * s, display: "inline-block" }} /> balita ≈ 1 dari 5 kasus
        </div>
      </Headline>
      <Pin c={c} p={top(CHART.xA, CHART.hA)} o={Math.min(lblO, gA)} dx={-30} dy={-120} align="right">
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: P.holo }}>13 OKT</div>
        <div style={{ fontSize: 44 * s, fontWeight: 900, color: P.hud }}>283 ribu</div>
      </Pin>
      <Pin c={c} p={top(CHART.xB, CHART.hB)} o={Math.min(lblO, gB)} dx={-110} dy={10} color={AMBER} align="right">
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: AMBER }}>5 NOV</div>
        <div style={{ fontSize: 44 * s, fontWeight: 900, color: P.hud }}>425 ribu</div>
      </Pin>
      <Fade o={Math.min(lblO, seg(t, T.tigaMinggu, T.tigaMinggu + 0.4))} s={s} style={{ left: 56 * s, top: 548 * s, ...card(s, AMBER), padding: `${8 * s}px ${16 * s}px`, fontSize: 32 * s, fontWeight: 800, color: AMBER }}>
        +50% · 3 minggu
      </Fade>
      <Headline c={c} o={dHead} size={92}>
        KASUS
        <br />
        HARIAN
      </Headline>
      <NameCard c={c} o={win(t, T.pemerintah - 0.05, T.benar + 0.2, 0.3, 0.3)} name="Budi Gunadi Sadikin" role="Menteri Kesehatan" top={1130} />
      <Pin c={c} p={[-0.4, CHART.base + 1.0, 0]} o={win(t, CUT.daily + 0.4, CUT.stack + 0.1, 0.3, 0.3)} dx={-30} dy={-60} align="right">
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: P.holo }}>PUNCAK</div>
        <div style={{ fontSize: 38 * s, fontWeight: 900, color: P.hud }}>10 ribuan / hari</div>
      </Pin>
      <Pin c={c} p={[0.4, CHART.base + 0.24, 0]} o={win(t, T.tigaRibu - 0.1, CUT.stack + 0.1, 0.3, 0.3)} dx={40} dy={30} color={AMBER}>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: AMBER }}>KINI</div>
        <div style={{ fontSize: 38 * s, fontWeight: 900, color: P.hud }}>±3 ribu / hari</div>
      </Pin>
      <Fade o={win(t, T.benar - 0.05, CUT.stack + 0.1, 0.25, 0.3)} s={s} style={{ left: 56 * s, top: 560 * s, ...card(s), padding: `${8 * s}px ${18 * s}px`, fontSize: 36 * s, fontWeight: 800, color: P.holo }}>
        ✓ laju harian memang turun
      </Fade>
      <Headline c={c} o={sHead} size={84}>
        TAPI TETAP
        <br />
        <span style={{ color: AMBER }}>BERTAMBAH</span>
      </Headline>
      <Pin c={c} p={[CHART.xB - 0.3, CHART.base + CHART.hB + 0.1, 0]} o={stackO} dx={-50} dy={60} color={AMBER} align="right">
        <div style={{ fontSize: 36 * s, fontWeight: 900, color: P.hud }}>+ ribuan kasus baru</div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: AMBER }}>SETIAP HARI</div>
      </Pin>
    </>
  );
};

const Memorial: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const o = win(t, CUT.memorial + 0.2, CUT.why + 0.1, 0.6, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 330 * s, color: P.hud }}>
        <div style={{ fontSize: 50 * s, fontWeight: 700, lineHeight: 1.22, textShadow: "0 4px 20px rgba(0,0,0,0.8)", opacity: seg(t, T.bbc - 0.1, T.bbc + 0.5) }}>
          BBC melaporkan anak-anak yang meninggal <span style={{ color: "#FFD9A8" }}>di tengah kepungan asap.</span>
        </div>
        <div style={{ marginTop: 28 * s, ...card(s, "#FFD9A8"), padding: `${14 * s}px ${20 * s}px`, opacity: seg(t, T.dokter - 0.1, T.dokter + 0.4) }}>
          <div style={{ fontFamily: MONO, fontSize: 26 * s, letterSpacing: 3 * s, color: "#FFD9A8", fontWeight: 700 }}>KATA DOKTER</div>
          <div style={{ fontSize: 38 * s, fontWeight: 700, lineHeight: 1.25, marginTop: 4 * s }}>Belum bisa memastikan asap sebagai penyebab.</div>
        </div>
      </div>
    </div>
  );
};

const Penjelasan: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s, w, h } = c;
  const why = win(t, CUT.why + 0.1, CUT.hairIn - 0.15, 0.4, 0.25);
  const inHair = t >= CUT.hairIn && t < CUT.hairOut;
  const pmO = inHair ? seg(t, T.pm25 - 0.2, T.pm25 + 0.3) : 0;
  const times = inHair ? seg(t, T.lebihDari - 0.1, T.duaPuluh + 0.3) : 0;
  const hairO = inHair ? seg(t, T.sehelai - 0.3, T.sehelai + 0.2) : 0;
  // hair diameter ruler: two points across the hair at the screen-right part
  const d = 0.75;
  const ax: [number, number, number] = [d * Math.cos(HAIR.tilt), HAIR.y + d * Math.sin(HAIR.tilt), 0];
  const nx = -Math.sin(HAIR.tilt) * HAIR.r;
  const ny = Math.cos(HAIR.tilt) * HAIR.r;
  const r1 = inHair ? project(t, [ax[0] + nx, ax[1] + ny, ax[2]], w, h) : { x: 0, y: 0 };
  const r2 = inHair ? project(t, [ax[0] - nx, ax[1] - ny, ax[2]], w, h) : { x: 0, y: 0 };
  const dive = t >= CUT.hairOut && t < CUT.compare + 0.2 ? win(t, T.ujung - 0.1, CUT.compare + 0.2, 0.3, 0.3) : 0;
  const cmp = win(t, CUT.compare + 0.2, CUT.mask + 0.1, 0.4, 0.3);
  const items = [
    { at: T.cepat - 0.3, k: "napas lebih cepat" },
    { at: T.menghirup, k: "lebih banyak udara per kg berat badan" },
    { at: T.paru, k: "paru-paru masih tumbuh" },
  ];
  return (
    <>
      <Headline c={c} o={why} size={92}>
        KENAPA BALITA
        <br />
        <span style={{ color: AMBER }}>PALING RENTAN?</span>
      </Headline>
      {inHair && (
        <>
          <Headline c={c} o={pmO} size={120}>
            <span style={{ color: AMBER }}>PM2.5</span>
            <div style={{ fontSize: 40 * s, fontWeight: 700, color: "#FFE2C9", marginTop: 8 * s }}>partikel asap · 2,5 mikron</div>
            <div style={{ fontSize: 84 * s, fontWeight: 900, color: P.hud, marginTop: 18 * s, opacity: times, transform: `scale(${0.9 + 0.1 * times})`, transformOrigin: "left center" }}>
              &gt;20× lebih kecil
            </div>
          </Headline>
          <Pin c={c} p={HERO} o={pmO * (1 - 0.7 * hairO)} dx={-70} dy={70} color={AMBER} align="right">
            <span style={{ fontSize: 30 * s, fontWeight: 800, color: P.hud }}>PM2.5 · 2,5 µm</span>
          </Pin>
          {hairO > 0 && (
            <>
              <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: hairO }}>
                <line x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke={P.holoSoft} strokeWidth={3 * s} />
                {[r1, r2].map((p, i) => (
                  <line key={i} x1={p.x - 22 * s} y1={p.y} x2={p.x + 22 * s} y2={p.y} stroke={P.holoSoft} strokeWidth={3 * s} />
                ))}
              </svg>
              <div style={{ position: "absolute", left: (r1.x + r2.x) / 2 + 30 * s, top: (r1.y + r2.y) / 2 - 40 * s, opacity: hairO, ...card(s), padding: `${8 * s}px ${14 * s}px` }}>
                <div style={{ fontSize: 30 * s, fontWeight: 800, color: P.hud }}>sehelai rambut</div>
                <div style={{ fontFamily: MONO, fontSize: 26 * s, color: P.holo }}>≈ 50–70 µm</div>
              </div>
            </>
          )}
        </>
      )}
      <Pin c={c} p={LEAF_W} o={dive} dx={-90} dy={-170} color={AMBER} align="right">
        <div style={{ fontSize: 34 * s, fontWeight: 900, color: P.hud }}>UJUNG SALURAN NAPAS</div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: AMBER }}>bronkiolus · alveoli</div>
      </Pin>
      <Headline c={c} o={cmp} size={84}>
        PARU <span style={{ color: AMBER }}>BALITA</span>
        <div style={{ marginTop: 20 * s, display: "flex", flexDirection: "column", gap: 12 * s }}>
          {items.map((it, i) => {
            const o = seg(t, it.at - 0.1, it.at + 0.3);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 * s, opacity: 0.25 + 0.75 * o, transform: `translateX(${(1 - o) * 16 * s}px)` }}>
                <span style={{ fontFamily: MONO, fontSize: 28 * s, fontWeight: 800, color: "#03141A", background: o > 0.5 ? AMBER : "rgba(159,245,236,0.5)", borderRadius: 999, width: 44 * s, height: 44 * s, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <span style={{ fontSize: 38 * s, fontWeight: 700, color: P.hud }}>{it.k}</span>
              </div>
            );
          })}
        </div>
      </Headline>
      {cmp * seg(t, T.cepat + 0.6, T.cepat + 1.0) > 0 &&
        ([
          { p: [-0.62, -1.0, 0.3] as [number, number, number], k: "DEWASA", col: P.holo as string },
          { p: [0.92, -1.0, 0.3] as [number, number, number], k: "BALITA", col: AMBER },
        ]).map((L) => {
          const q = project(t, L.p, w, h);
          return (
            <div key={L.k} style={{ position: "absolute", left: q.x - 120 * s, width: 240 * s, top: q.y + 2 * s, textAlign: "center", opacity: cmp * seg(t, T.cepat + 0.6, T.cepat + 1.0), fontFamily: MONO, fontSize: 34 * s, fontWeight: 800, letterSpacing: 4 * s, color: L.col, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              {L.k}
            </div>
          );
        })}
      <NameCard c={c} o={win(t, T.balitaP - 0.05, T.cepat + 0.9, 0.35, 0.35)} name="Piprim Basarah Yanuarso" role="Ketua Umum PP IDAI" top={585} right />
    </>
  );
};

const CrossedMask: React.FC<{ s: number }> = ({ s }) => (
  <svg width={120 * s} height={120 * s} viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="56" fill="rgba(255,154,77,0.12)" stroke={AMBER} strokeWidth="5" />
    <path d="M28 50 q32 -14 64 0 v18 q-32 24 -64 0 z" fill="none" stroke={P.hud} strokeWidth="5" strokeLinejoin="round" />
    <path d="M28 54 q-12 2 -10 12 q2 8 12 6 M92 54 q12 2 10 12 q-2 8 -12 6" fill="none" stroke={P.hud} strokeWidth="4" />
    <line x1="22" y1="98" x2="98" y2="22" stroke={AMBER} strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const Payoff: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const head = win(t, CUT.mask + 0.1, T.balitaY - 0.1, 0.4, 0.3);
  const baby = win(t, T.balitaY - 0.1, CUT.room + 0.2, 0.3, 0.35);
  const roomHead = win(t, CUT.room + 0.1, T.bila - 0.1, 0.4, 0.3);
  const warn = win(t, T.bila - 0.1, CUT.outro + 0.1, 0.35, 0.35);
  const mlab = win(t, T.orang - 0.1, T.balitaY + 0.1, 0.3, 0.3);
  const rlab = (at: number) => win(t, at - 0.1, T.bila + 0.4, 0.3, 0.3);
  const steps = [
    { at: T.sesak, k: "sesak napas" },
    { at: T.menyusu - 0.2, k: "sulit menyusu" },
  ];
  return (
    <>
      <Headline c={c} o={head} size={92}>
        CARA
        <br />
        <span style={{ color: P.holo }}>MELINDUNGI</span>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: "rgba(230,251,248,0.75)", marginTop: 12 * s, letterSpacing: 2 * s }}>MASKER UNTUK ORANG DEWASA</div>
      </Headline>
      <Pin c={c} p={[MASKS.n95[0], MASKS.n95[1] - 0.26, 0.1]} o={Math.min(mlab, seg(t, T.n95 - 0.1, T.n95 + 0.3))} dx={-50} dy={80} align="left">
        <div style={{ fontSize: 34 * s, fontWeight: 900, color: P.hud }}>✓ N95 rapat</div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: P.holo }}>menyaring asap halus</div>
      </Pin>
      <Pin c={c} p={[MASKS.cloth[0], MASKS.cloth[1] - 0.25, 0.05]} o={Math.min(mlab, seg(t, T.kain - 0.1, T.kain + 0.3))} dx={40} dy={170} color={AMBER} align="right">
        <div style={{ fontSize: 34 * s, fontWeight: 900, color: P.hud }}>✗ masker kain</div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: AMBER }}>asap halus lolos</div>
      </Pin>
      <Fade o={baby} s={s} style={{ left: 70 * s, right: 70 * s, top: 340 * s, ...card(s, AMBER), padding: `${20 * s}px ${26 * s}px`, display: "flex", alignItems: "center", gap: 24 * s }}>
        <CrossedMask s={s} />
        <div>
          <div style={{ fontSize: 50 * s, fontWeight: 900, color: P.hud, lineHeight: 1.05 }}>BALITA &lt; 2 TAHUN</div>
          <div style={{ fontSize: 34 * s, fontWeight: 700, color: "#FFE2C9", marginTop: 6 * s }}>tidak dianjurkan bermasker</div>
        </div>
      </Fade>
      <Headline c={c} o={roomHead} size={92}>
        SATU RUANG
        <br />
        <span style={{ color: P.holo }}>BERSIH</span>
      </Headline>
      <Pin c={c} p={[ROOM.window[0], ROOM.window[1] + 0.25, ROOM.window[2]]} o={rlab(T.jendela)} dx={-20} dy={-100} align="right">
        <span style={{ fontSize: 30 * s, fontWeight: 800, color: P.hud }}>✓ jendela tertutup</span>
      </Pin>
      <Pin c={c} p={[ROOM.purifier[0], ROOM.purifier[1] + 0.12, ROOM.purifier[2] + 0.15]} o={rlab(T.penyaring)} dx={-40} dy={170} align="right">
        <span style={{ fontSize: 30 * s, fontWeight: 800, color: P.hud }}>✓ penyaring udara</span>
      </Pin>
      <Pin c={c} p={[ROOM.ac[0] + 0.1, ROOM.ac[1], ROOM.ac[2]]} o={rlab(T.ac)} dx={-10} dy={-250}>
        <span style={{ fontSize: 30 * s, fontWeight: 800, color: P.hud }}>✓ AC sirkulasi dalam</span>
      </Pin>
      <Fade o={warn} s={s} style={{ left: 60 * s, right: 60 * s, top: 306 * s, ...card(s, AMBER), padding: `${18 * s}px ${24 * s}px` }}>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, letterSpacing: 4 * s, color: AMBER, fontWeight: 800 }}>⚠ TANDA BAHAYA PADA ANAK</div>
        <div style={{ display: "flex", gap: 16 * s, marginTop: 12 * s }}>
          {steps.map((st) => (
            <div key={st.k} style={{ flex: 1, opacity: 0.25 + 0.75 * seg(t, st.at - 0.1, st.at + 0.3), fontSize: 40 * s, fontWeight: 800, color: P.hud, background: "rgba(255,154,77,0.14)", borderRadius: 10 * s, padding: `${10 * s}px ${14 * s}px` }}>
              {st.k}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * s, marginTop: 16 * s, opacity: seg(t, T.segera - 0.1, T.segera + 0.3) }}>
          <svg width={58 * s} height={58 * s} viewBox="0 0 58 58">
            <rect x="2" y="2" width="54" height="54" rx="12" fill={AMBER} />
            <rect x="23" y="12" width="12" height="34" rx="2" fill="#03141A" />
            <rect x="12" y="23" width="34" height="12" rx="2" fill="#03141A" />
          </svg>
          <div style={{ fontSize: 42 * s, fontWeight: 900, color: P.hud, lineHeight: 1.1 }}>
            segera ke <span style={{ color: AMBER }}>fasilitas kesehatan</span>
          </div>
        </div>
      </Fade>
    </>
  );
};

const ISPU = [
  { k: "Baik", c: "#2FBF5B" },
  { k: "Sedang", c: "#2F7BEA" },
  { k: "Tidak sehat", c: "#F2C230" },
  { k: "Sangat tidak sehat", c: "#E5413B" },
  { k: "Berbahaya", c: "#111111" },
];

const Outro: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  const o = win(t, CUT.outro + 0.1, OUTRO_AT + 0.6, 0.4, 0.3);
  if (o <= 0) return null;
  const ispu = seg(t, T.cek - 0.1, T.cek + 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Headline c={c} o={seg(t, T.kasusnya - 0.1, T.kasusnya + 0.3)} size={80}>
        TURUN DARI PUNCAK,
        <br />
        <span style={{ color: AMBER, opacity: seg(t, T.belum - 0.1, T.belum + 0.3) }}>BELUM SELESAI</span>
      </Headline>
      <Fade o={ispu} s={s} style={{ left: 56 * s, right: 56 * s, top: 1070 * s, ...card(s), padding: `${12 * s}px ${22 * s}px` }}>
        <div style={{ fontSize: 44 * s, fontWeight: 900, color: P.hud, lineHeight: 1.05 }}>Cek ISPU daerahmu</div>
        <div style={{ fontFamily: MONO, fontSize: 26 * s, color: P.holo, letterSpacing: 2 * s, marginTop: 4 * s }}>INDEKS STANDAR PENCEMAR UDARA</div>
        <div style={{ display: "flex", gap: 6 * s, marginTop: 12 * s }}>
          {ISPU.map((q, i) => (
            <div key={q.k} style={{ flex: 1, opacity: seg(t, T.cek + i * 0.08, T.cek + 0.3 + i * 0.08) }}>
              <div style={{ height: 20 * s, borderRadius: 4 * s, background: q.c, border: i === 4 ? `${1.5 * s}px solid rgba(230,251,248,0.6)` : undefined }} />
              <div style={{ fontSize: 27 * s, fontWeight: 700, color: P.hud, marginTop: 6 * s, lineHeight: 1.1 }}>{q.k}</div>
            </div>
          ))}
        </div>
      </Fade>
    </div>
  );
};

// ---------------------------------------------------------------- captions
type Chunk = { words: Word[]; a: number; b: number };
/** A number and its unit ("425 ribu", "dua puluh kali") must stay on one caption line. */
const NUMW = /^(\d[\d.,]*|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|puluh)$/i;
const UNITW = /^(ribu|ribuan|puluh|kali|tahun)/i;
const glued = (ws: Word[], i: number) => i + 1 < ws.length && NUMW.test(ws[i].w.replace(/[.,;:?!]$/, "")) && !/[.,;:?!]$/.test(ws[i].w) && UNITW.test(ws[i + 1].w);
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  CLIPS.forEach((clip, ci) => {
    const ws = clip.words;
    const parts: Word[][] = [];
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const end = /[.,;:?!]$/.test(w.w);
      const left = ws.length - i - 1;
      const nextEnds = i + 1 < ws.length && /[.,;:?!]$/.test(ws[i + 1].w) && cur.length < 7 && !end;
      if (((cur.length >= 6 && !nextEnds) || (end && cur.length >= 2)) && left !== 1 && !glued(ws, i)) {
        parts.push(cur);
        cur = [];
      }
    });
    if (cur.length) {
      if (cur.length === 1 && parts.length) parts[parts.length - 1].push(cur[0]);
      else parts.push(cur);
    }
    // merge lone words into the previous chunk
    for (let i = parts.length - 1; i > 0; i--) if (parts[i].length === 1) parts.splice(i - 1, 2, [...parts[i - 1], ...parts[i]]);
    const nextStart = ci + 1 < CLIPS.length ? CLIPS[ci + 1].words[0].s : TOTAL;
    parts.forEach((p, j) => {
      const b = j + 1 < parts.length ? parts[j + 1][0].s - 0.04 : Math.min(nextStart - 0.04, p[p.length - 1].e + 0.6);
      out.push({ words: p, a: p[0].s - 0.1, b });
    });
  });
  return out;
})();

const Captions: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t, s } = c;
  if (t >= OUTRO_AT) return null;
  const ch = CHUNKS.find((k) => t >= k.a && t < k.b);
  if (!ch) return null;
  const n = ch.words.length;
  let lines: Word[][] = [ch.words];
  if (n > 4) {
    const chars = ch.words.reduce((a, x) => a + x.w.length + 1, 0);
    let best = 1e9;
    let cut = 2;
    for (let i = 2; i <= n - 2; i++) {
      if (glued(ch.words, i - 1)) continue;
      const a = ch.words.slice(0, i).reduce((m, x) => m + x.w.length + 1, 0);
      const diff = Math.abs(a - (chars - a));
      if (diff < best) {
        best = diff;
        cut = i;
      }
    }
    lines = [ch.words.slice(0, cut), ch.words.slice(cut)];
  }
  const appear = seg(t, ch.a, ch.a + 0.14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290 * s, display: "flex", justifyContent: "center", fontFamily: SANS }}>
      <div
        style={{
          background: "rgba(3,20,26,0.86)",
          border: `${1.5 * s}px solid rgba(63,224,208,0.4)`,
          borderTop: `${4 * s}px solid ${P.holo}`,
          borderRadius: 14 * s,
          padding: `${12 * s}px ${28 * s}px ${14 * s}px`,
          opacity: appear,
          transform: `translateY(${(1 - appear) * 12 * s}px)`,
          maxWidth: 960 * s,
          boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.45)`,
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", gap: 22 * s, whiteSpace: "nowrap", lineHeight: 1.24 }}>
            {ln.map((wd, wi) => {
              const idx = ch.words.indexOf(wd);
              const nextS = ch.words[idx + 1]?.s ?? ch.b;
              const active = t >= wd.s && t < nextS;
              const done = t >= wd.s;
              const bump = active ? 1 + 0.04 * Math.max(0, 1 - (t - wd.s) / 0.2) : 1;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    fontSize: 52 * s,
                    fontWeight: 800,
                    color: active ? P.holo : done ? P.hud : "rgba(230,251,248,0.5)",
                    textShadow: active ? `0 0 ${16 * s}px rgba(63,224,208,0.7)` : "none",
                    transform: `scale(${bump})`,
                    transformOrigin: "center bottom",
                  }}
                >
                  {wd.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- wipes, chips, frame
const SmokeWipe: React.FC<{ c: Ctx }> = ({ c }) => {
  const { t } = c;
  const k = Math.max(0, 1 - Math.abs(t - CUT.hairIn) / 0.38, 1 - Math.abs(t - CUT.hairOut) / 0.38);
  if (k <= 0) return null;
  const e = easeOut(k);
  const blobs = [
    [30, 40, 70],
    [70, 30, 60],
    [50, 70, 80],
    [15, 80, 55],
    [85, 75, 60],
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: e,
        background: blobs.map(([x, y, r]) => `radial-gradient(${r}% ${r * 0.7}% at ${x}% ${y + (1 - e) * 10}%, rgba(150,120,98,0.95) 0%, rgba(110,92,80,0.6) 45%, rgba(60,50,45,0) 100%)`).join(",") + ", rgba(70,58,50,0.85)",
      }}
    />
  );
};

export const Hud: React.FC<{ t: number; width: number; height: number }> = ({ t, width, height }) => {
  const c: Ctx = { t, s: width / 1080, w: width, h: height };
  const { s } = c;
  const kick = (() => {
    if (t < T.ini - 0.2) return "AUDIRA MED · ASAP & ISPA";
    if (t < CUT.chart) return "DATA KEMENKES · 7 PROVINSI";
    if (t < CUT.memorial) return "TREN KASUS ISPA";
    if (t < CUT.why) return "LAPORAN BBC";
    if (t < CUT.mask) return "KENAPA BALITA RENTAN";
    if (t < CUT.outro) return "PERLINDUNGAN";
    return "AUDIRA MED · ASAP & ISPA";
  })();
  const ilu = win(t, CUT.memorial + 0.3, CUT.why, 0.4, 0.3);
  const audiraGlow = seg(t, T.iniA - 0.1, T.iniA + 0.3);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: SANS, color: P.hud }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560 * s, background: "linear-gradient(180deg, rgba(3,20,26,0.55), rgba(3,20,26,0))" }} />
      <Kicker c={c} text={kick} o={1} />
      <div
        style={{
          position: "absolute",
          top: 252 * s,
          right: 56 * s,
          border: `${2 * s}px solid ${P.holo}`,
          background: audiraGlow > 0 ? `rgba(63,224,208,${0.85 * audiraGlow})` : "rgba(3,20,26,0.8)",
          color: audiraGlow > 0.5 ? "#03141A" : P.hud,
          borderRadius: 12 * s,
          padding: `${6 * s}px ${16 * s}px`,
          fontFamily: MONO,
          fontSize: 26 * s,
          fontWeight: 700,
          letterSpacing: 3 * s,
          transform: `scale(${1 + 0.15 * audiraGlow})`,
          transformOrigin: "right center",
        }}
      >
        AUDIRA MED
      </div>
      {ilu > 0 && (
        <div style={{ position: "absolute", top: 1220 * s, right: 56 * s, opacity: ilu, fontFamily: MONO, fontSize: 26 * s, letterSpacing: 3 * s, color: "rgba(230,251,248,0.8)", border: `${1.5 * s}px solid rgba(230,251,248,0.5)`, borderRadius: 6 * s, padding: `${4 * s}px ${10 * s}px`, background: "rgba(3,20,26,0.6)" }}>
          ILUSTRASI
        </div>
      )}
      <Hook c={c} />
      <Konteks c={c} />
      <Pengembangan c={c} />
      <Memorial c={c} />
      <Penjelasan c={c} />
      <Payoff c={c} />
      <Outro c={c} />
      <SmokeWipe c={c} />
      <Captions c={c} />
    </div>
  );
};


