// EP10 Kucing Mendarat — kinetic callout cards keyed to VO word times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { ANATOMY_PALETTE as A } from "../../kits/anatomix/lib/palette";
import { ramp } from "./timeline.ts";

const ACC = A.holo;
const ORANGE = "#FF9A3C";
const BLUE = "#6FA0FF";
const SEPIA = "#F2D6A2";

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

export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const deg90 = Math.round(90 * ramp(t, 61.0, 64.0));
  const deg10 = Math.round(10 * ramp(t, 66.3, 68.8));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hook */}
      <Card t={t} at={0.6} until={2.4} y={260} size={60}>PUNGGUNG DI BAWAH</Card>
      <Card t={t} at={3.9} until={6.2} y={260} size={60} color={ACC}>4 KAKI SIAP MENDARAT</Card>
      <Card t={t} at={6.39} until={8.55} y={250} size={110} color="#FFD27A">KOK BISA?</Card>
      <Card t={t} at={7.3} until={8.55} y={420} size={52}>AUDIRA SAINS</Card>
      {/* marey */}
      <Card t={t} at={8.95} until={13.4} y={250} size={130} color={SEPIA}>1894</Card>
      <Card t={t} at={11.2} until={13.4} y={430} size={50}>ÉTIENNE-JULES MAREY</Card>
      <Card t={t} at={13.6} until={16.0} y={250} size={54} color={SEPIA}>KAMERA CEPAT · FOTO BERURUTAN</Card>
      <Card t={t} at={17.6} until={20.9} y={250} size={56}>BERBALIK DI UDARA</Card>
      <Card t={t} at={19.1} until={20.9} y={370} size={48} color="#FFD27A">tanpa menolak apa pun</Card>
      <Card t={t} at={21.2} until={23.6} y={260} size={52} color={SEPIA}>REFLEKS MELURUSKAN BADAN</Card>
      <Card t={t} at={24.1} until={27.4} y={250} size={110} color="#FFD27A">3–4 MINGGU</Card>
      <Card t={t} at={24.6} until={27.4} y={400} size={48}>umur anak kucing mulai bisa</Card>
      {/* ear */}
      <Card t={t} at={27.9} until={30.6} y={250} size={50} color={ACC}>LANGKAH 1</Card>
      <Card t={t} at={28.4} until={30.6} y={350} size={68}>CARI ARAH BAWAH</Card>
      <Card t={t} at={28.0} until={32.5} y={1120} size={52} color={ORANGE}>TELINGA DALAM ↑</Card>
      <Card t={t} at={32.7} until={36.2} y={250} size={60} color={ORANGE}>SISTEM VESTIBULAR</Card>
      <Card t={t} at={33.2} until={36.2} y={360} size={44}>alat keseimbangan di telinga dalam</Card>
      <Card t={t} at={36.3} until={39.4} y={250} size={80} color="#5CC8FF">BAWAH ↓</Card>
      <Card t={t} at={37.4} until={39.4} y={380} size={46}>cairan bergoyang → otak tahu</Card>
      <Card t={t} at={39.6} until={40.6} y={260} size={62} color={ACC}>+ MATA</Card>
      {/* spine */}
      <Card t={t} at={41.0} until={43.4} y={250} size={50} color={ACC}>LANGKAH 2</Card>
      <Card t={t} at={41.4} until={43.4} y={350} size={68}>MENEKUK BADAN</Card>
      <Card t={t} at={43.6} until={45.5} y={260} size={62} color={ACC}>TULANG PUNGGUNG LENTUR</Card>
      <Card t={t} at={45.7} until={49.2} y={250} size={58} color={ORANGE}>TULANG SELANGKA KECIL</Card>
      <Card t={t} at={47.4} until={49.2} y={360} size={48}>tidak tersambung</Card>
      <Card t={t} at={49.5} until={53.5} y={250} size={54}>DEPAN ≠ BELAKANG</Card>
      <Card t={t} at={51.6} until={53.5} y={360} size={48} color={ACC}>berputar sendiri-sendiri</Card>
      {/* momentum */}
      <Card t={t} at={54.3} until={56.4} y={260} size={64} color="#FF6B6B">TANPA PIJAKAN</Card>
      <Card t={t} at={57.2} until={60.8} y={250} size={66} color={ACC}>MOMENTUM SUDUT</Card>
      <Card t={t} at={59.4} until={60.8} y={370} size={46}>kaki depan dilipat</Card>
      <Card t={t} at={61.0} until={69.5} x={70} y={250} size={46} align="left" color={ORANGE}>BADAN DEPAN</Card>
      <Card t={t} at={61.0} until={69.5} x={70} y={320} size={110} align="left" color={ORANGE}>{`${deg90}°`}</Card>
      <Card t={t} at={65.0} until={69.5} x={1010} y={250} size={46} align="right" color={BLUE}>BADAN BELAKANG</Card>
      <Card t={t} at={65.0} until={69.5} x={1010} y={320} size={110} align="right" color={BLUE}>{`${deg10}°`}</Card>
      <Card t={t} at={65.6} until={69.5} y={1120} size={44}>kaki belakang direntangkan</Card>
      <Card t={t} at={69.8} until={71.9} y={260} size={62} color={BLUE}>GANTIAN</Card>
      <Card t={t} at={72.0} until={74.5} y={250} size={60} color="#FFD27A">BERBALIK!</Card>
      <Card t={t} at={72.4} until={74.5} y={360} size={46}>tanpa mendorong apa pun</Card>
      {/* landing */}
      <Card t={t} at={75.5} until={77.3} y={260} size={56} color={ACC}>4 KAKI KE BAWAH</Card>
      <Card t={t} at={77.4} until={78.9} y={260} size={56} color={ACC}>PUNGGUNG MELENGKUNG</Card>
      <Card t={t} at={79.0} until={82.3} y={250} size={88} color="#FFD27A">SENDI = PEGAS</Card>
      <Card t={t} at={80.9} until={82.3} y={400} size={46}>meredam benturan</Card>
      {/* outro */}
      <Card t={t} at={82.6} until={86.6} y={260} size={56} color="#FF6B6B">KUCING TETAP BISA TERLUKA</Card>
      <Card t={t} at={86.7} until={90.9} y={260} size={88} color="#FF6B6B">JANGAN DICOBA!</Card>
      <Card t={t} at={88.3} until={90.9} y={420} size={52} color={ACC}>Ikuti AUDIRA SAINS</Card>
    </AbsoluteFill>
  );
};
