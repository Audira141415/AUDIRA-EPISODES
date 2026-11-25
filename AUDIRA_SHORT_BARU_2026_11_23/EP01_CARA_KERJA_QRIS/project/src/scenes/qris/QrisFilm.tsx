// EP01 "Cara kerja QRIS" — ISOCRAFT 2D (isometric SVG, three tones per face). Film time t = VO time + 0.3 s.
// Six acts (multi-scene law): hook warung 0–10.85 · QRIS standard 10.85–25.6 · QR anatomy 25.6–34.63 ·
// payment network 34.63–57.55 · payoff numbers 57.55–71.66 · close 71.66–78.2 · outro card 78.2–81.2.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Board, Box, Building, C30, COL, Cyl, FaceText, P, Packet, Pad, Person, Phone, QrPlane, Route, Shop,
  along, dim, keys, lerp, mix, pop, useIsoFonts, win,
} from "./iso";
import { BigNumber, Caption, Stamp, Tag } from "./hud";
import { AudiraOutro } from "../../brand/AudiraOutro";
import { AudiraSignature } from "../../brand/AudiraSignature";

export const QRIS_SECONDS = 81.2;
const OFFSET = 0.3;
const OUTRO_AT = 78.2;

type V3 = [number, number, number];
const poly = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
/** Quad on the +y face (front-left) between x0..x1 and z0..z1. */
const faceY = (x0: number, x1: number, y: number, z0: number, z1: number) => poly([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)]);
const U: [number, number] = [C30, 0.5]; // +x on screen
const VY: [number, number] = [-C30, 0.5]; // +y on screen
const DOWN: [number, number] = [0, 1]; // -z on screen

/** Camera: world target centred at (540, cy), zoom k. Projection never rotates. */
const Cam: React.FC<{ at: V3; k: number; cy?: number; children: React.ReactNode }> = ({ at, k, cy = 935, children }) => {
  const [sx, sy] = P(at[0], at[1], at[2]);
  return <g transform={`translate(540,${cy}) scale(${k}) translate(${-sx},${-sy})`}>{children}</g>;
};

/** Act wrapper: renders only near its window, crossfades over the cut. */
const Act: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  if (t < a - 0.2 || t > b + 0.2) return null;
  return <g opacity={win(t, a - 0.15, b + 0.15, 0.3)}>{children}</g>;
};

/** QRIS stand: foot, white plate, red header, QR modules on the +y face. */
const QrStand: React.FC<{ x: number; y: number; z?: number; s?: number; seed?: number; focus?: number }> = ({ x, y, z = 0, s = 1, seed = 7, focus = 1 }) => {
  const w = 80 * s, d = 8 * s, h = 120 * s, z0 = z + 6 * s;
  return (
    <g>
      <Box x={x - 8 * s} y={y - 12 * s} z={z} w={w + 16 * s} d={d + 24 * s} h={6 * s} c={COL.graphite} focus={focus} />
      <Box x={x} y={y} z={z0} w={w} d={d} h={h} c={COL.white} focus={focus} />
      <polygon points={faceY(x, x + w, y + d + 0.5, z0 + h - 26 * s, z0 + h)} fill={dim(COL.qris, focus)} />
      <FaceText x={x + w / 2} y={y + d + 1} z={z0 + h - 7 * s} size={21 * s} fill={COL.white} anchor="middle">QRIS</FaceText>
      <QrPlane o={P(x + 14 * s, y + d + 0.6, z0 + h - 34 * s)} u={U} v={DOWN} size={52 * s} seed={seed} fill={dim(COL.ink, focus)} />
    </g>
  );
};

/** Concentric "ting" rings around a screen point. */
const Rings: React.FC<{ t: number; at: number; x: number; y: number; c?: string }> = ({ t, at, x, y, c = COL.success }) => {
  if (t < at || t > at + 2) return null;
  return (
    <g>
      {[0, 0.35, 0.7].map((d) => {
        const p = lerp(t, at + d, at + d + 1, 0, 1, Easing.out(Easing.quad));
        return p > 0 && p < 1 ? <circle key={d} cx={x} cy={y} r={20 + p * 90} fill="none" stroke={c} strokeWidth={6 * (1 - p)} opacity={1 - p} /> : null;
      })}
    </g>
  );
};

// ── the warung (hook + close) ───────────────────────────────────────────────
const Warung: React.FC<{ t: number; merchantOk: boolean; buyer?: React.ReactNode; focus?: number }> = ({ t, merchantOk, buyer, focus = 1 }) => {
  const strips = 6, sw = 460 / strips;
  return (
    <g>
      <Board x={-290} y={-290} w={580} d={580} focus={focus} />
      {/* back wall + brand sign (brand in scene) */}
      <Box x={-220} y={-230} w={440} d={30} h={230} c={mix(COL.merchant, COL.white, 0.35)} focus={focus} />
      <polygon points={faceY(-185, 185, -199.5, 150, 205)} fill={dim(COL.ink, focus)} />
      <FaceText x={0} y={-199} z={164} size={36} fill={COL.white} anchor="middle">WARUNG AUDIRA</FaceText>
      {/* striped awning, shallow so it never covers the stand */}
      {Array.from({ length: strips }, (_, i) => (
        <Box key={i} x={-230 + i * sw} y={-200} z={236} w={sw} d={120} h={12} c={i % 2 ? COL.white : COL.qris} focus={focus} />
      ))}
      <Person x={10} y={-110} c="#4F6D9A" s={1.9} />
      {/* counter */}
      <Box x={-180} y={30} w={360} d={80} h={95} c={COL.merchant} focus={focus} />
      <Box x={-186} y={24} z={95} w={372} d={92} h={8} c={COL.white} focus={focus} />
      <QrStand x={-60} y={58} z={103} s={0.9} seed={11} focus={focus} />
      <Phone x={92} y={64} z={103} s={0.62} screen={merchantOk ? COL.success : "#D9D2C6"} focus={focus}>
        {merchantOk ? (
          <path d={`M10,${48 - 6 * pop(t, 7.4)} l8,8 l14,-16`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
      </Phone>
      {buyer}
    </g>
  );
};

/** Buyer phone UI for the hook: viewfinder → amount → BAYAR → processing → check. */
const BuyerScreen: React.FC<{ t: number }> = ({ t }) => {
  const W = 75;
  if (t < 1.5) {
    const scan = 30 + ((t * 70) % 100);
    return (
      <g>
        {[[8, 30], [W - 8, 30], [8, 130], [W - 8, 130]].map(([x, y], i) => (
          <path key={i} d={`M${x + (x < W / 2 ? 0 : 0)},${y} h${x < W / 2 ? 12 : -12} M${x},${y} v${y < 80 ? 12 : -12}`} stroke="#fff" strokeWidth={3} />
        ))}
        <QrPlane o={[18, 50]} u={[1, 0]} v={[0, 1]} size={40} seed={11} />
        <rect x={6} y={scan} width={W - 12} height={3} fill="#5BE39B" />
      </g>
    );
  }
  const typed = "Rp15.000".slice(0, Math.max(0, Math.round(lerp(t, 1.55, 2.2, 0, 8, Easing.linear))));
  const press = t > 2.55 && t < 2.75 ? 0.92 : 1;
  return (
    <g fontFamily="'Space Grotesk'" fontWeight={700}>
      <rect x={6} y={10} width={W - 12} height={20} rx={4} fill={mix(COL.qris, COL.white, 0.1)} />
      <text x={W / 2} y={25} fontSize={16} fill="#fff" textAnchor="middle">AUDIRA</text>
      <text x={W / 2} y={66} fontSize={17} fill={COL.ink} textAnchor="middle">{typed}</text>
      {t < 2.75 ? (
        <g transform={`translate(${W / 2},112) scale(${press})`}>
          <rect x={-30} y={-14} width={60} height={28} rx={8} fill={t > 2.3 ? COL.success : COL.grey} />
          <text y={6} fontSize={13} fill="#fff" textAnchor="middle">BAYAR</text>
        </g>
      ) : t < 7.4 ? (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={W / 2 - 14 + i * 14} cy={112} r={4} fill={COL.ink} opacity={0.3 + 0.7 * ((Math.floor(t * 4) + i) % 3 === 0 ? 1 : 0)} />
          ))}
        </g>
      ) : (
        <g transform={`translate(${W / 2},112) scale(${pop(t, 7.4)})`}>
          <circle r={18} fill={COL.success} />
          <path d="M-8,0 l6,6 l11,-12" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const Act1: React.FC<{ t: number }> = ({ t }) => {
  const k = keys(t, [[0, 1.55], [2.6, 1.5], [7.6, 1.45], [9.6, 0.78], [10.85, 0.74]]);
  const tx = keys(t, [[0, 70], [2.6, 85], [7.6, 90], [9.6, -60]]);
  const ty = keys(t, [[0, 120], [2.6, 80], [7.6, 50], [9.6, -60]]);
  const tz = keys(t, [[0, 150], [7.6, 130], [9.6, 170]]);
  const pkt: V3[] = [[-25, 240, 230], [-120, 60, 420], [-200, -200, 620]];
  const route: V3[] = [[-25, 240, 230], [-150, 0, 420], [-360, -360, 260]];
  const [qx, qy] = P(-360, -360, 260);
  const beam = win(t, 0.4, 1.6, 0.15);
  return (
    <Cam at={[tx + t * 3, ty, tz]} k={k}>
      <Warung
        t={t}
        merchantOk={t >= 7.4}
        buyer={
          <g>
            {beam > 0 ? (
              <polygon points={poly([P(-25, 230, 175), P(-46, 66, 200), P(-46, 66, 150), P(-25, 230, 160)])} fill={COL.success} opacity={0.35 * beam} />
            ) : null}
            <Phone x={-90} y={230} z={30} s={1.3} screen={t < 1.5 ? "#2A2535" : COL.white}>
              <BuyerScreen t={t} />
            </Phone>
          </g>
        }
      />
      {(() => {
        const [mx, my] = P(113, 72, 190);
        return <Rings t={t} at={5.9} x={mx} y={my} />;
      })()}
      {t > 2.62 && t < 3.6 ? (() => {
        const [x, y, z] = along(pkt, lerp(t, 2.62, 3.5, 0, 1, Easing.in(Easing.quad)));
        return <Packet x={x} y={y} z={z} s={0.9} />;
      })() : null}
      {t > 8.0 ? (
        <g>
          <Route pts3={route} p={lerp(t, 8.0, 9.3, 0, 1)} w={5} />
          <g transform={`translate(${qx},${qy - 40}) scale(${pop(t, 9.2, 0.45)})`}>
            <circle r={62} fill={COL.white} stroke={COL.ink} strokeWidth={6} />
            <text y={34} fontFamily="Anton" fontSize={96} fill={COL.qris} textAnchor="middle">?</text>
          </g>
        </g>
      ) : null}
    </Cam>
  );
};

// ── act 2: the QRIS standard + before (sepia wall) ──────────────────────────
const APP_COLS = ["#2F6FDE", "#23B26D", "#E8664A", "#7B5AE0", "#F2A93B", "#00A3B4", "#D94C8A", "#5C7A2E"];

const Act2: React.FC<{ t: number }> = ({ t }) => {
  if (t < 19.4) {
    const fall = lerp(t, 10.85, 11.65, 520, 0, Easing.out(Easing.bounce));
    const bi = pop(t, 14.0, 0.5);
    const cal = pop(t, 16.3, 0.45);
    const k = keys(t, [[10.85, 0.95], [15.8, 1.05], [17.0, 1.12], [19.4, 1.18]]);
    const tx = keys(t, [[10.85, -40], [13.6, 40], [15.8, 40], [17.2, -150]]);
    const ty = keys(t, [[10.85, -40], [13.6, -80], [15.8, -80], [17.2, 100]]);
    return (
      <Cam at={[tx + (t - 10.85) * 4, ty, 170]} k={k}>
        <Board x={-320} y={-320} w={640} d={640} />
        {bi > 0 ? (
          <g>
            <Building x={40} y={-300} w={130} d={110} h={260 * bi} c="#2B4C7E" label={bi > 0.95 ? "BI" : undefined} />
            <Building x={200} y={-280} w={110} d={110} h={210 * bi} c="#3F8C78" label={bi > 0.95 ? "ASPI" : undefined} />
          </g>
        ) : null}
        <g transform={`translate(0,${-fall})`}>
          <QrStand x={-140} y={-30} s={2.9} seed={21} />
        </g>
        {cal > 0 ? (
          <g transform={`translate(${P(-220, 160, 0)[0]},${P(-220, 160, 0)[1]}) scale(1,${cal}) translate(${-P(-220, 160, 0)[0]},${-P(-220, 160, 0)[1]})`}>
            <Box x={-300} y={150} w={160} d={12} h={250} c={COL.white} />
            <polygon points={faceY(-300, -140, 162.5, 196, 250)} fill={COL.qris} />
            <FaceText x={-220} y={163} z={210} size={30} fill={COL.white} anchor="middle">AGUSTUS</FaceText>
            <FaceText x={-220} y={163} z={88} size={76} anchor="middle">17</FaceText>
            <FaceText x={-220} y={163} z={22} size={34} anchor="middle">2019</FaceText>
          </g>
        ) : null}
      </Cam>
    );
  }
  // flashback: before QRIS, one QR per app
  const sep = lerp(t, 24.6, 25.3, 1, 0);
  const merge = lerp(t, 24.6, 25.3, 0, 1);
  const k = keys(t, [[19.4, 0.95], [25.6, 1.12]]);
  const [ox, oy] = P(-300, -9.5, 400);
  return (
    <Cam at={[-20 + (t - 19.4) * 4, -20, 210]} k={k}>
      <g filter={sep > 0.02 ? "url(#sepia)" : undefined} opacity={1}>
        <Board x={-330} y={-330} w={660} d={660} />
        <Box x={-300} y={-40} w={600} d={30} h={400} c={mix(COL.merchant, COL.white, 0.45)} />
        <g transform={`matrix(${C30},0.5,0,1,${ox},${oy})`}>
          {APP_COLS.map((c, i) => {
            const p = pop(t, 19.9 + i * 0.5, 0.35);
            if (p <= 0) return null;
            const col = i % 4, row = Math.floor(i / 4);
            const hx = 22 + col * 146, hy = 40 + row * 178;
            const x = lerp(merge, 0, 1, hx, 230, Easing.linear), y = lerp(merge, 0, 1, hy, 110, Easing.linear);
            return (
              <g key={i} transform={`translate(${x + 60},${y + 75}) scale(${p * (1 - merge * 0.3)}) translate(-60,-75)`} opacity={1 - merge * 0.85}>
                <rect x={0} y={0} width={120} height={150} rx={8} fill={c} />
                <QrPlane o={[16, 30]} u={[1, 0]} v={[0, 1]} size={88} seed={40 + i} />
              </g>
            );
          })}
          {merge > 0 ? (
            <g transform={`translate(300,190) scale(${pop(t, 24.9, 0.4) * 1.25}) translate(-70,-90)`}>
              <rect x={0} y={0} width={140} height={180} rx={10} fill={COL.qris} />
              <text x={70} y={30} fontFamily="'Space Grotesk'" fontWeight={700} fontSize={24} fill="#fff" textAnchor="middle">QRIS</text>
              <QrPlane o={[20, 48]} u={[1, 0]} v={[0, 1]} size={100} seed={21} />
            </g>
          ) : null}
        </g>
      </g>
    </Cam>
  );
};

// ── act 3: QR anatomy ───────────────────────────────────────────────────────
const ROWS = ["FORMAT  EMVCo", "NAMA  WARUNG AUDIRA", "NMID  ID10••••••••", "MATA UANG  RUPIAH"];

const Act3: React.FC<{ t: number }> = ({ t }) => {
  const k = keys(t, [[25.6, 0.92], [34.63, 1.12]]);
  const lift = lerp(t, 26.5, 27.3, 0, 1);
  const cut = lerp(t, 25.8, 26.4, 0, 1);
  const n = 21, S = 440, x0 = -220, y0 = -220;
  const nmidGlow = win(t, 30.9, 34.6, 0.3);
  return (
    <Cam at={[0 + (t - 25.6) * 3, 40, 170]} k={k}>
      <Board x={-330} y={-330} w={660} d={660} />
      <Box x={-250} y={-250} w={500} d={500} h={20} c={COL.white} />
      {/* data rows printed on the plate */}
      {ROWS.map((r, i) => {
        const shown = r.slice(0, Math.round(lerp(t, 27.4 + i * 1.0, 28.2 + i * 1.0, 0, r.length, Easing.linear)));
        const [sx, sy] = P(-180 + i * 40, -50 + i * 100, 20.5);
        const hi = i === 2 ? nmidGlow : i === 0 ? win(t, 27.6, 30.6, 0.3) : 0;
        return (
          <g key={i} transform={`translate(${sx},${sy})`} opacity={shown.length ? 1 : 0}>
            <rect x={-12} y={-34} width={r.length * 21 + 24} height={48} rx={8} fill={mix(COL.white, COL.success, 0.35 * hi)} stroke={COL.ink} strokeWidth={3} />
            <text fontFamily="'Space Grotesk'" fontWeight={700} fontSize={34} fill={COL.ink}>{shown}</text>
          </g>
        );
      })}
      {/* lifted module layer */}
      <g transform={`translate(0,${-200 * lift})`} opacity={1 - 0.55 * lift}>
        <g transform={`translate(${P(-60 * lift, -260 * lift, 0)[0]},${P(-60 * lift, -260 * lift, 0)[1]})`}>
          <QrPlane o={P(x0, y0, 20.6)} u={U} v={VY} size={S} n={n} seed={21} />
        </g>
      </g>
      {cut > 0 ? <Route pts3={[[-250, 250, 21], [250, 250, 21], [250, -250, 21]]} p={cut} c={COL.qris} w={5} /> : null}
    </Cam>
  );
};

// ── act 4: the payment network ──────────────────────────────────────────────
const ST = { P: [0, 0], I: [520, 0], H: [520, 560], A: [1080, 560], M: [1080, 1100] } as const;
const TOWERS: { x: number; y: number; at: number }[] = [
  { x: 520 - 220, y: 560 - 220, at: 46.97 },
  { x: 520 + 220, y: 560 - 220, at: 47.7 },
  { x: 520 - 220, y: 560 + 220, at: 48.63 },
  { x: 520 + 220, y: 560 + 220, at: 49.29 },
];

const packetAt = (t: number): { p: V3; check: boolean } => {
  if (t < 40.0) return { p: along([[40, 0, 120], [380, 0, 70]], lerp(t, 35.5, 40.0, 0, 1)), check: false };
  if (t < 41.3) return { p: [380, 0, 70], check: false };
  if (t < 43.6) return { p: along([[520, 110, 70], [520, 400, 70]], lerp(t, 41.3, 43.6, 0, 1)), check: false };
  if (t < 49.9) {
    const a = lerp(t, 43.6, 49.9, Math.PI / 2 + Math.PI, Math.PI / 2 + Math.PI + Math.PI * 5, Easing.inOut(Easing.quad));
    return { p: [520 + Math.cos(a) * 160, 560 + Math.sin(a) * 160, 80], check: false };
  }
  if (t < 51.0) return { p: along([[680, 560, 80], [980, 560, 70]], lerp(t, 49.9, 51.0, 0, 1)), check: false };
  if (t < 55.6) return { p: [980, 560, 70 + 10 * Math.max(0, Math.sin((t - 54.2) * 9)) * win(t, 54.2, 55.2, 0.1)], check: t > 54.2 };
  return { p: along([[1080, 680, 80], [1080, 990, 70]], lerp(t, 55.6, 56.5, 0, 1)), check: true };
};

const Act4: React.FC<{ t: number }> = ({ t }) => {
  const kk: [number, number, number, number][] = [
    [34.63, 0, 0, 1.6], [39.4, 520, 0, 1.5], [43.4, 548, 482, 0.92], [48.6, 548, 482, 0.95], [49.8, 520, 560, 1.3], [51.2, 1080, 560, 1.25], [55.4, 1080, 560, 1.32], [56.6, 1080, 1100, 1.5],
  ];
  const tx = keys(t, kk.map((r) => [r[0], r[1]]));
  const ty = keys(t, kk.map((r) => [r[0], r[2]]));
  const k = keys(t, kk.map((r) => [r[0], r[3]]));
  const f = (a: number, b: number) => 0.25 + 0.75 * win(t, a, b, 0.6);
  const fP = f(34.0, 40.8), fI = f(38.6, 44.0), fH = f(42.6, 51.0), fA = f(50.0, 56.6), fM = f(55.2, 58.0);
  const pk = packetAt(t);
  const rail = (a: readonly [number, number], b: readonly [number, number]) => {
    const [ax, ay] = P(a[0], a[1], 0.6), [bx, by] = P(b[0], b[1], 0.6);
    return <line x1={ax} y1={ay} x2={bx} y2={by} stroke={mix(COL.board, COL.ink, 0.14)} strokeWidth={30} strokeLinecap="round" />;
  };
  return (
    <Cam at={[tx, ty, 110]} k={k + Math.sin(t * 0.6) * 0.015}>
      <Board x={-260} y={-260} w={1600} d={1620} />
      {rail(ST.P, ST.I)}
      {rail([ST.I[0], ST.I[1]], [ST.H[0], ST.H[1]])}
      {rail([ST.H[0], ST.H[1]], [ST.A[0], ST.A[1]])}
      {rail([ST.A[0], ST.A[1]], [ST.M[0], ST.M[1]])}
      <Pad x={-130} y={-130} w={260} d={260} c={COL.success} o={fP} />
      <Pad x={390} y={-130} w={260} d={260} c={COL.issuer} o={fI} />
      <Pad x={240} y={280} w={560} d={560} c={COL.switch} o={fH} />
      <Pad x={950} y={430} w={260} d={260} c={COL.acquirer} o={fA} />
      <Pad x={950} y={970} w={260} d={260} c={COL.merchant} o={fM} />
      {/* buyer phone */}
      <Phone x={-40} y={-10} z={0} s={1.25} screen={COL.white} focus={fP}>
        <rect x={5} y={89} width={66} height={28} rx={7} fill={dim(COL.success, fP)} />
        <text x={38} y={108} fontFamily="'Space Grotesk'" fontWeight={700} fontSize={19} fill="#fff" textAnchor="middle">BAYAR</text>
        <text x={38} y={50} fontFamily="'Space Grotesk'" fontWeight={700} fontSize={20} fill={COL.ink} textAnchor="middle">Rp15.000</text>
      </Phone>
      {/* issuer */}
      <g opacity={lerp(t, 50.0, 50.8, 1, 0)}><Building x={440} y={-80} w={160} d={160} h={270} c={COL.issuer} focus={fI} label="ISSUER" /></g>
      {/* switching hub + 4 towers */}
      {TOWERS.slice(0, 1).map((w, i) => <Tower key={i} t={t} {...w} focus={fH} />)}
      {TOWERS.slice(1, 3).map((w, i) => <Tower key={i} t={t} {...w} focus={fH} />)}
      <Cyl x={520} y={560} r={130} h={46} c={COL.switch} focus={fH} />
      <FaceText x={470} y={652} z={36} size={30}>GPN</FaceText>
      {t >= 43.6 && t < 49.9 ? <Packet x={pk.p[0]} y={pk.p[1]} z={pk.p[2]} /> : null}
      <Tower t={t} {...TOWERS[3]} focus={fH} />
      {/* acquirer */}
      <Building x={1000} y={480} w={160} d={160} h={250} c={COL.acquirer} focus={fA} label="ACQUIRER" />
      {/* merchant counter + phone */}
      <Box x={990} y={1060} w={190} d={70} h={80} c={COL.merchant} focus={fM} />
      <Phone x={1050} y={1080} z={80} s={0.9} screen={t > 56.4 ? COL.success : "#D9D2C6"} focus={fM}>
        {t > 56.4 ? <path d="M18,60 l12,12 l22,-24" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" /> : null}
      </Phone>
      {(t < 43.6 || t >= 49.9) && t > 35.4 && t < 56.6 ? <Packet x={pk.p[0]} y={pk.p[1]} z={pk.p[2]} check={pk.check} /> : null}
      {(() => {
        const [mx, my] = P(1090, 1090, 220);
        return <Rings t={t} at={56.4} x={mx} y={my} />;
      })()}
    </Cam>
  );
};

const Tower: React.FC<{ t: number; x: number; y: number; at: number; focus: number }> = ({ t, x, y, at, focus }) => {
  const lit = t >= at ? 1 : 0;
  const [cx, cy] = P(x, y, 160);
  return (
    <g>
      <Box x={x - 34} y={y - 34} w={68} d={68} h={150} c={lit ? COL.switch : COL.graphite} focus={Math.max(focus, lit)} />
      {lit ? <circle cx={cx} cy={cy - 6} r={22 + 10 * pop(t, at)} fill={COL.switch} opacity={0.45} /> : null}
    </g>
  );
};

// ── act 5: payoff ───────────────────────────────────────────────────────────
const Act5: React.FC<{ t: number }> = ({ t }) => {
  if (t < 61.3) {
    const a = Math.max(0, t - 57.55) * 2.6;
    const tri: V3[] = [[-230, 0, 60], [200, -200, 60], [150, 260, 60]];
    const seg = Math.floor(a) % 3, fr = a - Math.floor(a);
    const pa = tri[seg], pb = tri[(seg + 1) % 3];
    const pp: V3 = [pa[0] + (pb[0] - pa[0]) * fr, pa[1] + (pb[1] - pa[1]) * fr, 60];
    const flag = pop(t, 59.9, 0.5);
    const [fx, fy] = P(0, 20, 0);
    return (
      <Cam at={[0, 20, 120]} k={keys(t, [[57.55, 1.3], [61.3, 1.05]])}>
        <Board x={-360} y={-360} w={720} d={720} />
        <Route pts3={[...tri, tri[0]].map((q) => [q[0], q[1], 1] as V3)} p={1} c={mix(COL.ink, COL.board, 0.4)} w={4} />
        <Building x={140} y={-260} w={110} d={110} h={190} c={COL.issuer} />
        <Building x={-290} y={-60} w={110} d={110} h={170} c={COL.acquirer} />
        <g>
          <line x1={fx} y1={fy} x2={fx} y2={fy - 260} stroke={COL.ink} strokeWidth={6} />
          <g transform={`translate(${fx},${fy - 255}) scale(${flag},1)`}>
            <path d={`M0,0 l${C30 * 130},${65} l0,${45} l${-C30 * 130},${-65} Z`} fill="#E0262E" />
            <path d={`M0,45 l${C30 * 130},${65} l0,${45} l${-C30 * 130},${-65} Z`} fill={COL.white} stroke={mix(COL.ink, COL.white, 0.7)} strokeWidth={1} />
          </g>
        </g>
        <Cyl x={150} y={260} r={70} h={40} c={COL.switch} />
        <Packet x={pp[0]} y={pp[1]} z={pp[2]} />
        {/* stopwatch */}
        <g transform={`translate(${P(260, 80, 0)[0]},${P(260, 80, 0)[1] - 150}) scale(${pop(t, 58.5)})`}>
          <circle r={70} fill={COL.white} stroke={COL.ink} strokeWidth={8} />
          <rect x={-12} y={-92} width={24} height={18} rx={4} fill={COL.ink} />
          <line x1={0} y1={0} x2={Math.sin(t * 6) * 52} y2={-Math.cos(t * 6) * 52} stroke={COL.qris} strokeWidth={7} strokeLinecap="round" />
          <circle r={8} fill={COL.ink} />
        </g>
      </Cam>
    );
  }
  if (t < 66.9) {
    const persons: React.ReactNode[] = [];
    for (let j = 0; j < 6; j++) for (let i = 0; i < 12; i++) {
      const p = pop(t, 61.5 + j * 0.3 + i * 0.015, 0.3);
      if (p > 0) persons.push(<Person key={`p${i}-${j}`} x={-300 + i * 44} y={-300 + j * 44} c={COL.issuer} s={0.95 * p} />);
    }
    const shops: React.ReactNode[] = [];
    for (let n = 0; n < 51; n++) {
      const i = n % 9, j = Math.floor(n / 9);
      const p = pop(t, 64.9 + n * 0.018, 0.3);
      if (p > 0) shops.push(<Shop key={`s${n}`} x={-60 + i * 44} y={60 + j * 44} c={COL.merchant} s={0.9 * p} />);
    }
    return (
      <Cam at={[-20 + (t - 61.3) * 3, 0, 0]} k={keys(t, [[61.3, 1.0], [66.9, 1.08]])} cy={830}>
        <Board x={-360} y={-360} w={720} d={720} />
        {persons}
        {shops}
      </Cam>
    );
  }
  // MDR 0% for micro business
  const coin = lerp(t, 70.5, 71.5, 0, 1, Easing.in(Easing.quad));
  return (
    <Cam at={[0, 0, 120]} k={keys(t, [[66.9, 1.15], [71.66, 1.4]])}>
      <Board x={-300} y={-300} w={600} d={600} />
      <Box x={-200} y={-40} w={300} d={16} h={210} c={COL.white} />
      <polygon points={faceY(-200, 100, -23.5, 160, 210)} fill={COL.merchant} />
      <FaceText x={-50} y={-23} z={174} size={30} fill={COL.white} anchor="middle">USAHA MIKRO</FaceText>
      <FaceText x={-50} y={-23} z={96} size={56} anchor="middle">Rp500.000</FaceText>
      <FaceText x={-50} y={-23} z={44} size={28} anchor="middle">BIAYA MDR</FaceText>
      {[0, 1, 2, 3, 4].map((i) => <Cyl key={i} x={180} y={120} z={i * 18} r={60} h={16} c={COL.switch} />)}
      <g transform={`translate(${160 * coin},${-260 * coin + 300 * coin * coin})`} opacity={1 - coin}>
        <Cyl x={180} y={120} z={90} r={60} h={16} c={COL.qris} />
        <text x={P(180, 120, 106)[0]} y={P(180, 120, 106)[1] + 10} fontFamily="Anton" fontSize={30} fill={COL.white} textAnchor="middle">MDR</text>
      </g>
    </Cam>
  );
};

// ── act 6: close ────────────────────────────────────────────────────────────
const Act6: React.FC<{ t: number }> = ({ t }) => {
  const arcs: { from: V3; to: V3; at: number; c: string }[] = [
    { from: [-120, 260, 140], to: [-520, -120, 260], at: 72.0, c: COL.issuer },
    { from: [-520, -120, 260], to: [-80, -560, 240], at: 72.8, c: COL.switch },
    { from: [-80, -560, 240], to: [130, 80, 200], at: 73.5, c: COL.acquirer },
  ];
  return (
    <Cam at={[-200 + (t - 71.66) * 6, -150, 140]} k={keys(t, [[71.66, 0.9], [78.2, 0.66]])}>
      <Board x={-720} y={-720} w={360} d={360} />
      <Building x={-640} y={-640} w={150} d={150} h={200} c={COL.switch} label="GPN" />
      <Board x={-200} y={-760} w={300} d={300} />
      <Building x={-140} y={-700} w={150} d={150} h={230} c={COL.acquirer} label="ACQ" />
      <Board x={-760} y={-260} w={300} d={300} />
      <Building x={-690} y={-200} w={150} d={150} h={250} c={COL.issuer} label="ISSUER" />
      <Warung t={t} merchantOk />
      {arcs.map((a, i) => {
        const p = lerp(t, a.at, a.at + 0.7, 0, 1);
        if (p <= 0) return null;
        const mid: V3 = [(a.from[0] + a.to[0]) / 2, (a.from[1] + a.to[1]) / 2, Math.max(a.from[2], a.to[2]) + 220];
        return <Route key={i} pts3={[a.from, mid, a.to]} p={p} c={a.c} w={9} />;
      })}
      <Rings t={t} at={72.86} x={P(113, 72, 190)[0]} y={P(113, 72, 190)[1]} />
    </Cam>
  );
};

// ── HUD per act (y 220–520, never in the caption band) ──────────────────────
export const Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Tag t={t} at={1.0} until={3.2} x={70} y={236} text="SCAN" c={COL.success} align="left" />
    <Tag t={t} at={1.6} until={3.2} x={1010} y={236} text="Rp15.000" c={COL.merchant} align="right" />
    <Tag t={t} at={2.4} until={3.3} x={540} y={380} text="BAYAR" c={COL.success} />
    <Tag t={t} at={3.5} until={5.7} x={540} y={250} text="BEBERAPA DETIK" sub="KEMUDIAN…" c={COL.switch} />
    <Tag t={t} at={7.4} until={8.9} x={540} y={250} text="BERHASIL" c={COL.success} />
    <Tag t={t} at={9.5} until={10.7} x={540} y={250} text="LEWAT MANA?" c={COL.qris} />

    <Tag t={t} at={11.5} until={13.8} x={540} y={240} text="QRIS" sub="STANDAR QR NASIONAL" c={COL.qris} size={84} />
    <Tag t={t} at={14.0} until={16.1} x={540} y={240} text="BANK INDONESIA + ASPI" c="#2B4C7E" size={60} />
    <Tag t={t} at={16.3} until={19.1} x={540} y={240} text="17·08·2019" sub="DILUNCURKAN" c={COL.qris} size={84} />
    <Tag t={t} at={19.4} until={23.9} x={540} y={240} text="SEBELUMNYA" sub="TIAP APLIKASI, QR SENDIRI" c="#8B6B3E" />
    <Tag t={t} at={24.1} until={24.8} x={540} y={240} text="BANYAK KODE" c="#8B6B3E" />
    <Tag t={t} at={24.9} until={25.5} x={540} y={240} text="SATU QRIS" c={COL.qris} />

    <Tag t={t} at={27.8} until={30.7} x={540} y={240} text="EMVCo" sub="FORMAT DATA PEMBAYARAN" c={COL.issuer} size={84} />
    <Tag t={t} at={30.9} until={34.4} x={540} y={240} text="NMID" sub={t < 32.8 ? "NOMOR MERCHANT NASIONAL" : "SAMA DI SEMUA APLIKASI"} c={COL.merchant} size={84} />

    <Tag t={t} at={35.5} until={37.5} x={540} y={240} text="BAYAR" c={COL.success} />
    <Tag t={t} at={37.7} until={40.1} x={540} y={240} text="BANK / DOMPET DIGITAL" c={COL.issuer} size={58} />
    <Tag t={t} at={40.3} until={42.9} x={540} y={240} text="ISSUER" sub="BANK MILIKMU" c={COL.issuer} size={84} />
    <Tag t={t} at={43.1} until={46.7} x={540} y={240} text="GPN" sub="GERBANG PEMBAYARAN NASIONAL" c={COL.switch} size={84} />
    <Tag t={t} at={46.97} until={50.0} x={290} y={236} text="ARTAJASA" c={COL.switch} size={50} />
    <Tag t={t} at={47.7} until={50.0} x={790} y={236} text="RINTIS" c={COL.switch} size={50} />
    <Tag t={t} at={48.63} until={50.0} x={290} y={356} text="JALIN" c={COL.switch} size={50} />
    <Tag t={t} at={49.29} until={50.0} x={790} y={356} text="ALTO" c={COL.switch} size={50} />
    <Tag t={t} at={51.0} until={53.9} x={540} y={240} text="ACQUIRER" sub="BANK MILIK PEDAGANG" c={COL.acquirer} size={84} />
    <Stamp t={t} at={54.2} until={55.9} x={540} y={400} big="RC 00" small="= BERHASIL" size={300} />
    <Tag t={t} at={56.1} until={57.4} x={540} y={240} text="NOTIFIKASI" c={COL.success} />

    <Tag t={t} at={58.5} until={60.1} x={540} y={240} text="HITUNGAN DETIK" c={COL.switch} />
    <Tag t={t} at={60.3} until={61.2} x={540} y={240} text="DI DALAM NEGERI" c={COL.qris} />
    <Tag t={t} at={61.4} until={63.2} x={540} y={240} text="OKTOBER 2026" sub="DATA BANK INDONESIA" c={COL.issuer} />
    <BigNumber t={t} at={63.4} dur={0.9} until={66.7} x={70} y={226} value={71.91} unit="JT" label="PENGGUNA" c={COL.issuer} chipText="OKT 2026" />
    <BigNumber t={t} at={65.1} dur={0.8} until={66.7} x={70} y={1150} value={51.31} unit="JT" label="MERCHANT" c={COL.merchant} />
    {t > 63.4 && t < 66.8 ? (
      <div style={{ position: "absolute", right: 70, top: 470, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 40, color: "#ffffff", background: "rgba(6,23,15,0.9)", borderRadius: 12, padding: "6px 18px", opacity: win(t, 62.8, 66.7) }}>1 ikon ≈ 1 juta</div>
    ) : null}
    <Tag t={t} at={67.2} until={68.2} x={540} y={240} text="SEJAK OKTOBER 2026" c={COL.merchant} size={60} />
    <Tag t={t} at={68.4} until={70.2} x={540} y={240} text="USAHA MIKRO" sub="TRANSAKSI ≤ Rp500 RIBU" c={COL.merchant} />
    <Stamp t={t} at={70.4} until={71.6} x={620} y={760} big="0%" small="MDR" size={300} />

    <Tag t={t} at={74.0} until={75.2} x={540} y={240} text="3 PIHAK" sub="ISSUER · GPN · ACQUIRER" c={COL.success} size={84} />
    <Tag t={t} at={75.4} until={78.0} x={540} y={240} text="AUDIRA EXPLAINED" sub="@AudiraExplained" c={COL.success} size={64} dark />
  </>
);

export const QrisFilm: React.FC<{ coverAt?: number }> = ({ coverAt }) => {
  useIsoFonts();
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = coverAt ?? frame / fps;
  return (
    <AbsoluteFill style={{ background: COL.ground }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={18} /></filter>
            <filter id="sepia"><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter>
            <pattern id="dots" width={56} height={32} patternUnits="userSpaceOnUse" patternTransform={`translate(${(-t * 14) % 56},${(-t * 8) % 32})`}>
              <circle cx={28} cy={16} r={2.4} fill={mix(COL.ground, COL.ink, 0.13)} />
            </pattern>
            <radialGradient id="vig" cx="50%" cy="46%" r="70%">
              <stop offset="0.38" stopColor={COL.ink} stopOpacity={0} />
              <stop offset="1" stopColor={COL.ink} stopOpacity={0.6} />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#dots)" />
          <Act t={t} a={0} b={10.85}><Act1 t={t} /></Act>
          <Act t={t} a={10.85} b={25.6}><Act2 t={t} /></Act>
          <Act t={t} a={25.6} b={34.63}><Act3 t={t} /></Act>
          <Act t={t} a={34.63} b={57.55}><Act4 t={t} /></Act>
          <Act t={t} a={57.55} b={71.66}><Act5 t={t} /></Act>
          <Act t={t} a={71.66} b={OUTRO_AT}><Act6 t={t} /></Act>
          <rect width={1080} height={1920} fill="url(#vig)" pointerEvents="none" />
        </svg>
        {coverAt === undefined ? <Hud t={t} /> : null}
        {coverAt === undefined ? <Caption t={t} offset={OFFSET} hideAfter={OUTRO_AT} /> : (
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 52, color: COL.white, background: COL.ink, borderRadius: 14, padding: "8px 26px", letterSpacing: "0.06em" }}>CARA KERJA</span>
            <span style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 1, color: COL.qris, WebkitTextStroke: `6px ${COL.ink}`, paintOrder: "stroke fill" }}>QRIS</span>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 50, color: COL.ink, background: COL.white, border: `5px solid ${COL.ink}`, borderRadius: 16, padding: "10px 28px", marginTop: 900 }}>uangmu lewat mana?</span>
          </div>
        )}
      </div>
      {coverAt !== undefined ? null : (<>
      <Sequence from={Math.round(OFFSET * fps)}>
        <Audio src={staticFile("audio/vo.wav")} />
      </Sequence>
      <AudiraOutro seconds={QRIS_SECONDS - OUTRO_AT} />
      <AudiraSignature seed="ep01-cara-kerja-qris" />
      </>)}
    </AbsoluteFill>
  );
};
