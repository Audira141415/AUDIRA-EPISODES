// EP07 Sistem Imun — kinetic callout cards keyed to VO word times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { useFormat } from "../../core/film/format.ts";
import { FONT } from "../../core/type/fonts.ts";
import { NANO_PALETTE as P } from "../../kits/nanoforge/lib/palette";
import { ramp } from "./timeline.ts";

const ACC = P.adenineGold;
const COOL = P.thymineCyan;
const RED = "#FF4D5E";

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

/** 2D donut: "separuh lebih" — neutrophils 50–70% of white cells (fill to 60%). */
const Ring: React.FC<{ t: number; at: number; until: number }> = ({ t, at, until }) => {
  const s = useFormat().scale;
  if (t < at || t > until) return null;
  const k = ramp(t, at, at + 0.9);
  const op = ramp(t, at, at + 0.25) * (1 - ramp(t, until - 0.25, until));
  const R = 120;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: (540 - 170) * s, top: 470 * s, width: 340 * s, height: 340 * s, opacity: op, backgroundColor: "rgba(6,10,24,0.96)", borderRadius: "50%", color: "#FFFFFF" }}>
      <svg width="100%" height="100%" viewBox="0 0 340 340">
        <circle cx={170} cy={170} r={R + 34} fill="rgba(6,10,24,0.96)" />
        <circle cx={170} cy={170} r={R - 20} fill="#060A18" />
        <circle cx={170} cy={170} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={34} />
        <circle cx={170} cy={170} r={R} fill="none" stroke={COOL} strokeWidth={34} strokeDasharray={`${C * 0.6 * k} ${C}`} transform="rotate(-90 170 170)" strokeLinecap="round" />
        <text x={170} y={168} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#FFFFFF">{`${Math.round(60 * k)}%`}</text>
        <text x={170} y={212} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={COOL}>NEUTROFIL</text>
      </svg>
    </div>
  );
};

const fmtCount = (n: number) => Math.round(n).toString();

export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const count = 100 * ramp(t, 7.7, 9.6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hook */}
      <Card t={t} at={1.4} until={6.1} y={260} size={62} color={RED}>PERANG DI DALAM TUBUH</Card>
      <Card t={t} at={4.6} until={6.1} y={440} size={46}>dan kamu tidak merasakannya</Card>
      {/* patrol */}
      <Card t={t} at={7.6} until={12.2} y={250} size={124} color={ACC}>{`${fmtCount(count)} MILIAR`}</Card>
      <Card t={t} at={8.2} until={12.2} y={420} size={46}>neutrofil baru setiap hari</Card>
      <Card t={t} at={12.5} until={19.1} y={270} size={60} color={COOL}>SEPARUH LEBIH PASUKAN</Card>
      <Ring t={t} at={14.8} until={19.1} />
      {/* wound */}
      <Card t={t} at={20.2} until={22.7} y={280} size={64} color={RED}>BAKTERI MASUK!</Card>
      <Card t={t} at={22.9} until={29.6} y={250} size={58} color={ACC}>DALAM HITUNGAN MENIT</Card>
      <Card t={t} at={24.6} until={29.6} y={390} size={50}>neutrofil keluar dari pembuluh darah</Card>
      <Card t={t} at={31.1} until={34.5} y={260} size={66} color={ACC}>NANAH = TENTARA GUGUR</Card>
      {/* macro */}
      <Card t={t} at={35.3} until={40.6} y={250} size={84} color={COOL}>MAKROFAG</Card>
      <Card t={t} at={37.6} until={40.6} y={390} size={70} color={ACC}>DITEMUKAN 1884</Card>
      <Card t={t} at={43.0} until={45.9} y={260} size={62} color={ACC}>SEL T PEMBANTU = JENDERAL</Card>
      <Card t={t} at={46.0} until={47.6} y={280} size={110} color={RED}>PERINTAH!</Card>
      {/* attack */}
      <Card t={t} at={48.1} until={51.7} y={260} size={72} color="#FB923C">SEL T PEMBUNUH</Card>
      <Card t={t} at={49.6} until={51.7} y={400} size={46}>hancurkan sel yang terinfeksi</Card>
      <Card t={t} at={52.0} until={57.5} y={240} size={60} color={ACC}>SEL B → ANTIBODI "Y"</Card>
      <Card t={t} at={54.3} until={57.5} y={380} size={84} color={COOL}>RIBUAN / DETIK</Card>
      {/* memory */}
      <Card t={t} at={61.6} until={65.4} y={1000} size={82} color={COOL}>SEL MEMORI</Card>
      <Card t={t} at={63.8} until={65.4} y={1130} size={58} color={ACC}>INGAT BERTAHUN-TAHUN</Card>
      <Card t={t} at={67.2} until={70.1} y={1040} size={56} color={ACC}>CACAR AIR: BIASANYA SEKALI</Card>
      <Card t={t} at={70.2} until={71.1} y={280} size={100} color={COOL}>LANGSUNG SIAP</Card>
      {/* outro */}
      <Card t={t} at={72.4} until={74.8} y={260} size={60}>SAAT KAMU TIDUR…</Card>
      <Card t={t} at={75.1} until={79.3} y={260} size={66} color={COOL}>TAK PERNAH ISTIRAHAT</Card>
    </AbsoluteFill>
  );
};
