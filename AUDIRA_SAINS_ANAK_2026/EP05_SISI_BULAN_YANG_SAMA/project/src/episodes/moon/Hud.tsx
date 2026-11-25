// EP05 Sisi Bulan — kinetic callout cards keyed to VO word times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { SCALE_PALETTE as P } from "../../kits/scaleforge/lib/palette";
import { ramp, SCENES } from "./timeline.ts";

const ACC = P.accent;
const COOL = P.accentCool;

type CardProps = {
  t: number;
  at: number;
  until: number;
  x?: number;
  y: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  strikeAt?: number;
  maxWidth?: number;
  children: React.ReactNode;
};

/** Pops in (overshoot) at `at`, fades out before `until`. */
const Card: React.FC<CardProps> = ({ t, at, until, x = 540, y, size = 56, color = "#FFFFFF", align = "center", strikeAt, maxWidth, children }) => {
  if (t < at || t > until) return null;
  const k = ramp(t, at, at + 0.28);
  const out = 1 - ramp(t, until - 0.25, until);
  const s = 0.82 + 0.18 * k + Math.sin(k * Math.PI) * 0.08;
  const struck = strikeAt !== undefined && t >= strikeAt;
  return (
    <SafeLabel
      x={x}
      y={y + (1 - k) * 24}
      size={size}
      color={struck ? "rgba(255,255,255,0.55)" : color}
      align={align}
      weight={800}
      opacity={k * out}
      maxWidth={maxWidth}
      style={{
        transform: `scale(${s})`,
        transformOrigin: align === "left" ? "left center" : align === "right" ? "right center" : "center",
        textDecoration: struck ? "line-through" : undefined,
        textDecorationColor: "#FF3B3B",
        textDecorationThickness: struck ? Math.max(4, size * 0.08) : undefined,
      }}
    >
      {children}
    </SafeLabel>
  );
};

const fmtDays = (d: number) => d.toFixed(1).replace(".", ",");

export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const orbitDays = 27.3 * ramp(t, 13.2, 24.0);
  const orbitEnd = SCENES.find((s) => s.id === "orbit")!.end;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hook */}
      <Card t={t} at={0.74} until={4.5} y={260} size={120} color={ACC}>1959</Card>
      <Card t={t} at={2.1} until={4.5} y={430} size={42}>belum ada yang melihat punggung Bulan</Card>
      {/* nights */}
      <Card t={t} at={6.2} until={9.3} y={300} size={58}>WAJAHNYA SELALU SAMA</Card>
      <Card t={t} at={8.1} until={9.3} y={420} size={46} color={COOL}>pola kawah tidak berganti</Card>
      <Card t={t} at={10.3} until={12.45} y={300} size={72} strikeAt={11.8}>BULAN DIAM?</Card>
      <Card t={t} at={11.8} until={12.45} y={440} size={64} color="#FF3B3B">KELIRU</Card>
      {/* orbit */}
      <Card t={t} at={14.58} until={19.6} y={250} size={112} color={ACC}>27,3 HARI</Card>
      <Card t={t} at={15.0} until={19.6} y={420} size={46}>1 putaran pada porosnya</Card>
      <Card t={t} at={17.8} until={23.6} y={480} size={44} color={COOL}>= 1 kali keliling Bumi</Card>
      <Card t={t} at={23.9} until={26.0} y={280} size={54} color={ACC}>PENGUNCIAN PASANG SURUT</Card>
      {t >= 13.2 && t < orbitEnd - 0.1 && (
        <SafeLabel x={540} y={1110} align="center" size={44} weight={800} color="#FFFFFF" opacity={ramp(t, 13.2, 13.6)}>
          {`HARI KE-${fmtDays(orbitDays)} / 27,3`}
        </SafeLabel>
      )}
      {((t >= 12.8 && t < orbitEnd - 0.1) || (t >= 76 && t < 84.2)) && (
        <SafeLabel x={1000} y={1220} align="right" size={42} weight={600} color="rgba(255,255,255,0.7)" plate={false}>
          ilustrasi · skala tidak sebanding
        </SafeLabel>
      )}
      {/* bulge */}
      <Card t={t} at={28.2} until={32.5} x={70} y={760} size={52} align="left" color={ACC} maxWidth={560}>GRAVITASI BUMI</Card>
      <Card t={t} at={29.6} until={32.5} x={70} y={880} size={46} align="left" maxWidth={430}>Bulan jadi sedikit lonjong</Card>
      <Card t={t} at={32.9} until={36.0} x={70} y={760} size={64} align="left" color={ACC} maxWidth={430}>SEPERTI REM</Card>
      <Card t={t} at={34.3} until={36.0} x={70} y={890} size={46} align="left" maxWidth={430}>energi habis di dalam Bulan</Card>
      <Card t={t} at={37.0} until={39.2} x={70} y={760} size={44} align="left" maxWidth={430}>putaran melambat…</Card>
      <Card t={t} at={38.1} until={39.2} x={70} y={860} size={76} align="left" color={ACC} maxWidth={460}>TERKUNCI</Card>
      {/* wobble */}
      <Card t={t} at={40.5} until={44.0} y={280} size={54}>BULAN BERGOYANG</Card>
      <Card t={t} at={40.9} until={44.0} y={400} size={46} color={COOL}>librasi</Card>
      <Card t={t} at={44.16} until={46.05} y={250} size={120} color={ACC}>≈ 59%</Card>
      <Card t={t} at={44.6} until={46.05} y={440} size={42}>permukaan Bulan terlihat dari Bumi</Card>
      {/* farside */}
      <Card t={t} at={46.2} until={51.6} y={270} size={64}>SISI JAUH ≠ GELAP</Card>
      <Card t={t} at={48.4} until={51.6} y={400} size={44} color="#FFC24A">juga disinari Matahari</Card>
      {/* missions */}
      <Card t={t} at={51.9} until={56.4} x={70} y={260} size={64} align="left" color={ACC}>LUNA 3 · 1959</Card>
      <Card t={t} at={52.6} until={56.4} x={70} y={380} size={46} align="left">foto pertama sisi jauh</Card>
      <Card t={t} at={56.6} until={59.3} x={70} y={260} size={64} align="left" color={ACC}>CHANG'E 4 · 2019</Card>
      <Card t={t} at={57.1} until={59.3} x={70} y={380} size={46} align="left">mendarat pertama di sisi jauh</Card>
      <Card t={t} at={59.5} until={64.1} x={70} y={260} size={56} align="left" color={ACC}>CHANG'E 6</Card>
      <Card t={t} at={61.3} until={64.1} x={70} y={370} size={100} align="left">1.935 gram</Card>
      <Card t={t} at={62.6} until={64.1} x={70} y={530} size={46} align="left">tanah sisi jauh dibawa pulang</Card>
      {/* laser */}
      <Card t={t} at={64.3} until={66.9} y={270} size={52} color="#5CFF7A">LASER ➜ CERMIN APOLLO</Card>
      <Card t={t} at={67.4} until={69.6} y={250} size={84} color={ACC} maxWidth={940}>+3,8 cm/tahun</Card>
      <Card t={t} at={67.1} until={69.6} y={470} size={44}>Bulan menjauh dari Bumi</Card>
      <Card t={t} at={69.7} until={71.5} y={280} size={52}>BUMI IKUT DIREM</Card>
      <Card t={t} at={71.6} until={76.0} y={450} size={44} color={COOL}>620 juta tahun lalu:</Card>
      <Card t={t} at={74.1} until={76.0} y={250} size={100} color={ACC}>1 hari ≈ 21,5 jam</Card>
      {/* outro */}
      <Card t={t} at={76.0} until={78.3} y={280} size={50}>HAMPIR SEMUA BULAN BESAR</Card>
      <Card t={t} at={77.2} until={78.3} y={400} size={50} color={ACC}>JUGA TERKUNCI</Card>
      <Card t={t} at={78.9} until={84.2} y={280} size={68}>BUKAN DIAM,</Card>
      <Card t={t} at={80.1} until={84.2} y={400} size={68} color={ACC}>BERPUTAR SEIRAMA</Card>
    </AbsoluteFill>
  );
};
