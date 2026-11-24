// EP06 Lubang Hitam — kinetic callout cards keyed to VO word times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { SCALE_PALETTE as P } from "../../kits/scaleforge/lib/palette";
import { ramp } from "./timeline.ts";

const ACC = P.accent;
const COOL = P.accentCool;
const GOLD = "#FFD24A";

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
const Card: React.FC<CardProps> = ({ t, at, until, x = 540, y, size = 56, color = "#FFFFFF", align = "center", strikeAt, maxWidth = 940, children }) => {
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

export const Hud: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* hook */}
    <Card t={t} at={0.37} until={5.3} y={250} size={64}>LUBANG HITAM</Card>
    <Card t={t} at={1.27} until={5.3} y={380} size={104} color={ACC} strikeAt={1.87}>MENYEDOT?</Card>
    <Card t={t} at={2.6} until={5.3} y={540} size={44} color={COOL}>mitos dari film &amp; kartun</Card>
    {/* squeeze */}
    <Card t={t} at={6.58} until={8.35} y={270} size={56} strikeAt={7.18}>PENYEDOT DEBU RAKSASA</Card>
    <Card t={t} at={9.44} until={12.9} y={250} size={84} color={ACC}>SANGAT BERAT</Card>
    <Card t={t} at={11.69} until={12.9} y={390} size={84} color={COOL}>SANGAT KECIL</Card>
    <Card t={t} at={13.31} until={16.3} y={260} size={60}>GRAVITASINYA SAMA</Card>
    <Card t={t} at={14.95} until={16.3} y={380} size={46} color={COOL}>seperti bintang &amp; planet</Card>
    {/* sunswap */}
    <Card t={t} at={17.15} until={20.9} y={250} size={50}>ANDAI MATAHARI JADI LUBANG HITAM</Card>
    <Card t={t} at={19.55} until={20.9} y={400} size={64} color={ACC}>BERAT SAMA</Card>
    <Card t={t} at={21.04} until={23.3} y={280} size={50} color={COOL}>cuma andai-andai</Card>
    <Card t={t} at={24.84} until={26.4} y={250} size={130} color={ACC}>≈ 6 km</Card>
    <Card t={t} at={25.1} until={26.4} y={430} size={44}>lebar lubang hitamnya</Card>
    <Card t={t} at={26.83} until={28.2} y={270} size={62} color={ACC}>BUMI TIDAK TERSEDOT</Card>
    <Card t={t} at={28.4} until={31.9} y={250} size={84} color="#FFFFFF">ORBIT TETAP</Card>
    <Card t={t} at={30.82} until={31.9} y={390} size={52}>tapi gelap &amp; dingin</Card>
    {t >= 16.6 && t < 31.9 && (
      <SafeLabel x={1000} y={1220} align="right" size={40} weight={600} color="rgba(255,255,255,0.7)" plate={false}>
        ilustrasi · skala tidak sebanding
      </SafeLabel>
    )}
    {/* horizon */}
    <Card t={t} at={33.81} until={35.1} y={260} size={60} color={ACC}>TERLALU DEKAT = BAHAYA</Card>
    <Card t={t} at={37.09} until={41.9} y={250} size={66} color={ACC}>HORIZON PERISTIWA</Card>
    <Card t={t} at={37.4} until={41.9} y={370} size={44}>batas tanpa jalan kembali</Card>
    <Card t={t} at={39.91} until={41.9} y={470} size={46} color={COOL}>cahaya pun tidak lolos</Card>
    <Card t={t} at={44.97} until={47.3} y={250} size={76} color={ACC}>SPAGETIFIKASI</Card>
    <Card t={t} at={45.63} until={47.3} y={380} size={46}>diregangkan seperti mi</Card>
    {/* disk */}
    <Card t={t} at={48.45} until={49.6} y={260} size={58}>TIDAK LANGSUNG MASUK</Card>
    <Card t={t} at={50.54} until={55.6} y={240} size={62}>BERPUTAR</Card>
    <Card t={t} at={51.53} until={53.9} y={350} size={44} color={COOL}>cakram akresi</Card>
    <Card t={t} at={54.24} until={55.6} y={350} size={62} color={ACC}>→ PANAS</Card>
    <Card t={t} at={54.72} until={55.6} y={460} size={62} color={GOLD}>→ BERSINAR</Card>
    {/* sgra */}
    <Card t={t} at={56.19} until={59.9} y={250} size={60}>PUSAT GALAKSI KITA</Card>
    <Card t={t} at={58.31} until={59.9} y={380} size={62} color={ACC}>≈ 26.000 tahun cahaya</Card>
    <Card t={t} at={60.99} until={64.9} y={250} size={72} color={ACC}>SAGITARIUS A*</Card>
    <Card t={t} at={63.14} until={64.9} y={380} size={64}>≈ 4 JUTA × MATAHARI</Card>
    <Card t={t} at={65.02} until={68.0} y={250} size={64} color={COOL}>BINTANG S2</Card>
    <Card t={t} at={66.75} until={68.0} y={370} size={56} color={ACC}>1 putaran = 16 tahun</Card>
    <Card t={t} at={69.41} until={71.6} y={250} size={64} color={ACC}>≈ 3% KECEPATAN CAHAYA</Card>
    <Card t={t} at={72.15} until={73.3} y={260} size={60} color={COOL}>TETAP TIDAK TERSEDOT</Card>
    <Card t={t} at={75.2} until={77.2} y={250} size={80} color={GOLD}>NOBEL FISIKA 2020</Card>
    <Card t={t} at={75.5} until={77.2} y={390} size={42}>untuk pengamatan orbit pusat galaksi</Card>
    {/* outro */}
    <Card t={t} at={78.39} until={83.6} y={250} size={70}>TIDAK MENYEDOT,</Card>
    <Card t={t} at={79.77} until={83.6} y={370} size={70} color={ACC}>HANYA MENARIK</Card>
    <Card t={t} at={82.29} until={83.6} y={490} size={46} color={COOL}>kuat kalau dari dekat</Card>
  </AbsoluteFill>
);
