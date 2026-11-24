// EP09 Laut Dalam — kinetic callout cards keyed to VO sentence times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { ABYSS_PALETTE as P } from "../../kits/abyssforge/lib/palette";
import { depthAt, ramp } from "./timeline.ts";

const ACC = P.hudCyan;
const AMB = P.hudAmber;

type CardProps = {
  t: number;
  at: number;
  until: number;
  x?: number;
  y: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number;
  children: React.ReactNode;
};

/** Pops in (overshoot) at `at`, fades out before `until`. */
const Card: React.FC<CardProps> = ({ t, at, until, x = 540, y, size = 56, color = "#FFFFFF", align = "center", maxWidth, children }) => {
  if (t < at || t > until) return null;
  const k = ramp(t, at, at + 0.28);
  const out = 1 - ramp(t, until - 0.25, until);
  const s = 0.82 + 0.18 * k + Math.sin(k * Math.PI) * 0.08;
  return (
    <SafeLabel
      x={x}
      y={y + (1 - k) * 24}
      size={size}
      color={color}
      align={align}
      weight={800}
      opacity={k * out}
      maxWidth={maxWidth}
      style={{ transform: `scale(${s})`, transformOrigin: align === "left" ? "left center" : align === "right" ? "right center" : "center" }}
    >
      {children}
    </SafeLabel>
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");

const ZONES: { name: string; range: string; from: number; at: number; until: number; color: string }[] = [
  { name: "ZONA CAHAYA", range: "0 – 200 m", from: 0, at: 20.3, until: 23.7, color: "#7FE3FF" },
  { name: "ZONA SENJA", range: "200 – 1.000 m", from: 200, at: 23.9, until: 26.3, color: "#5FA8FF" },
  { name: "ZONA TENGAH MALAM", range: "1.000 – 4.000 m", from: 1000, at: 26.5, until: 30.6, color: P.lumenViolet },
  { name: "ZONA ABISAL", range: "4.000 – 6.000 m", from: 4000, at: 30.7, until: 31.9, color: P.lumenMagenta },
  { name: "ZONA HADAL", range: "> 6.000 m", from: 6000, at: 32.0, until: 33.35, color: AMB },
];

/** Depth gauge on the left during the descent. */
const DepthGauge: React.FC<{ t: number }> = ({ t }) => {
  if (t < 17.9 || t > 33.4) return null;
  const m = depthAt(t);
  const op = ramp(t, 17.9, 18.3) * (1 - ramp(t, 33.1, 33.4));
  return (
    <SafeLabel x={70} y={1120} align="left" size={52} weight={800} color="#FFFFFF" opacity={op}>
      {`KEDALAMAN ${fmt(m)} m`}
    </SafeLabel>
  );
};

export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const atm = 1 + Math.floor(ramp(t, 36.0, 39.2) * 500);
  const mapped = 28.7 * ramp(t, 64.8, 66.6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hook */}
      <Card t={t} at={1.6} until={4.5} y={270} size={104} color={ACC}>384.400 km</Card>
      <Card t={t} at={2.1} until={4.5} y={420} size={44}>jarak Bumi ke Bulan</Card>
      <Card t={t} at={6.0} until={10.9} y={270} size={110} color={AMB}>11 km ↓</Card>
      <Card t={t} at={6.4} until={10.9} y={420} size={44}>dasar laut terdalam</Card>
      <Card t={t} at={8.2} until={10.9} y={520} size={46} color={ACC} maxWidth={900}>{"< 0,001% dasar laut dalam pernah dilihat"}</Card>
      {/* surface */}
      <Card t={t} at={11.2} until={12.8} y={300} size={70} color={ACC}>AYO MENYELAM!</Card>
      <Card t={t} at={13.6} until={17.7} y={270} size={120} color={ACC}>{"> 70%"}</Card>
      <Card t={t} at={14.0} until={17.7} y={430} size={44}>permukaan Bumi tertutup laut</Card>
      <Card t={t} at={15.6} until={17.7} y={520} size={50} color={AMB}>rata-rata ±3.700 m</Card>
      {/* zones */}
      <Card t={t} at={18.0} until={20.1} y={290} size={64} color={AMB}>MASALAH 1: CAHAYA</Card>
      {ZONES.map((z) => (
        <React.Fragment key={z.name}>
          <Card t={t} at={z.at} until={z.until} y={270} size={64} color={z.color}>{z.name}</Card>
          <Card t={t} at={z.at + 0.15} until={z.until} y={380} size={46}>{z.range}</Card>
        </React.Fragment>
      ))}
      <Card t={t} at={27.6} until={30.6} y={470} size={46} color="#FFFFFF">gelap gulita</Card>
      <DepthGauge t={t} />
      {/* pressure */}
      <Card t={t} at={33.6} until={35.8} y={290} size={64} color={AMB}>MASALAH 2: TEKANAN</Card>
      <Card t={t} at={36.0} until={39.4} y={260} size={100} color={AMB}>+1 atm</Card>
      <Card t={t} at={36.3} until={39.4} y={400} size={46}>setiap turun 10 m</Card>
      {t >= 36.0 && t < 39.4 && (
        <SafeLabel x={540} y={1110} align="center" size={50} weight={800} color="#FFFFFF" opacity={ramp(t, 36.0, 36.3)}>
          {`TEKANAN ${atm} atm`}
        </SafeLabel>
      )}
      {/* trench */}
      <Card t={t} at={40.2} until={44.7} y={260} size={56} color={ACC}>CHALLENGER DEEP</Card>
      <Card t={t} at={42.4} until={44.7} y={380} size={104} color={AMB}>10.935 m</Card>
      <Card t={t} at={45.4} until={49.4} y={260} size={56}>GUNUNG EVEREST</Card>
      <Card t={t} at={45.6} until={49.4} y={380} size={96} color={ACC}>8.849 m</Card>
      <Card t={t} at={47.8} until={50.3} y={520} size={60} color={AMB}>masih ±2 km di bawah air!</Card>
      <Card t={t} at={50.5} until={52.9} y={260} size={110} color={AMB}>{"> 1.000×"}</Card>
      <Card t={t} at={50.8} until={52.9} y={410} size={44}>tekanan di permukaan</Card>
      {t >= 40 && t < 52.9 && (
        <SafeLabel x={1010} y={1220} align="right" size={38} weight={600} color="rgba(255,255,255,0.75)" plate={false}>
          ilustrasi penampang · skala tegak
        </SafeLabel>
      )}
      {/* mapping */}
      <Card t={t} at={53.3} until={55.0} y={290} size={60}>KENAPA SUSAH DIPETAKAN?</Card>
      <Card t={t} at={56.6} until={60.4} y={270} size={58} color="#FFE27A">CAHAYA & RADIO</Card>
      <Card t={t} at={57.6} until={60.4} y={390} size={56} color="#FF5A5A">✕ tidak tembus air dalam</Card>
      <Card t={t} at={61.0} until={64.5} y={270} size={84} color={ACC}>SONAR</Card>
      <Card t={t} at={61.6} until={64.5} y={400} size={46}>peta dari gema suara</Card>
      {t >= 64.7 && t < 67.85 && (
        <>
          <SafeLabel x={540} y={270} align="center" size={110} weight={800} color={ACC} opacity={ramp(t, 64.7, 65.0)}>
            {`${mapped.toFixed(1).replace(".", ",")}%`}
          </SafeLabel>
          <SafeLabel x={540} y={420} align="center" size={46} weight={800} color="#FFFFFF" opacity={ramp(t, 65.0, 65.3)}>
            dasar laut terpetakan detail
          </SafeLabel>
          <SafeLabel x={540} y={500} align="center" size={38} weight={600} color="rgba(255,255,255,0.75)" opacity={ramp(t, 65.3, 65.6)}>
            NOAA, April 2026
          </SafeLabel>
        </>
      )}
      {/* glow */}
      <Card t={t} at={68.3} until={70.4} y={290} size={70} color={P.lumenMagenta}>TERNYATA RAMAI!</Card>
      <Card t={t} at={71.0} until={76.6} y={250} size={120} color={ACC}>3 dari 4</Card>
      <Card t={t} at={71.4} until={76.6} y={410} size={44} maxWidth={900}>hewan laut yang diamati bisa bercahaya</Card>
      <Card t={t} at={74.2} until={76.6} y={1110} size={46} color="#FFFFFF">ikan pemancing · umpan bercahaya</Card>
      {/* outro */}
      <Card t={t} at={77.3} until={83.3} y={270} size={60}>MISTERI TERBESAR</Card>
      <Card t={t} at={79.0} until={83.3} y={390} size={64} color={ACC}>ADA DI BAWAH KITA</Card>
    </AbsoluteFill>
  );
};
