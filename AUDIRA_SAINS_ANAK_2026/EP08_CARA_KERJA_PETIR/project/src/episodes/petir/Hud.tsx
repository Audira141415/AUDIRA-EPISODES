// EP08 Petir — kinetic callout cards keyed to VO sentence times (public/audio/vo-words.json).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SafeLabel } from "../../core/hud/SafeLabel.tsx";
import { ramp } from "./timeline.ts";

const RING = "#9FE3FF";
const AMB = "#FFB547";
const POSC = "#FF7A66";
const NEGC = "#4FC3D9";
const VIO = "#C9A2FF";
const RED = "#E5533D";

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
      style={{ transform: `scale(${s})`, transformOrigin: "center" }}
    >
      {children}
    </SafeLabel>
  );
};

export const Hud: React.FC<{ t: number }> = ({ t }) => {
  const watch = Math.min(3, Math.max(0, t - 69.8));
  const targets = [
    { at: 34.8, txt: "pohon" },
    { at: 36.0, txt: "antena" },
    { at: 36.8, txt: "gedung tinggi" },
  ].filter((x) => t >= x.at);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* hook */}
      <Card t={t} at={1.0} until={6.3} y={270} size={104} color={RING}>≈ 1/100 detik</Card>
      <Card t={t} at={1.3} until={6.3} y={410} size={46}>awan → tanah</Card>
      <Card t={t} at={3.5} until={6.3} y={520} size={46} maxWidth={920}>kedipan mata ±0,1–0,15 detik</Card>
      <Card t={t} at={5.4} until={6.45} y={630} size={72} color={AMB}>KOK BISA?</Card>
      {/* cloud */}
      <Card t={t} at={8.6} until={12.1} y={270} size={80} color={RING}>KUMULONIMBUS</Card>
      <Card t={t} at={9.0} until={12.1} y={400} size={44}>awan badai, puncak ±12 km</Card>
      {/* charges */}
      <Card t={t} at={12.3} until={17.4} y={270} size={64} color={RING}>ANGIN MENGADUK ES</Card>
      <Card t={t} at={13.3} until={17.4} y={385} size={44}>kristal es · graupel bertabrakan</Card>
      <Card t={t} at={17.9} until={26.5} y={270} size={58} color={POSC}>+ kristal es → puncak</Card>
      <Card t={t} at={21.4} until={26.5} y={370} size={58} color={NEGC}>− graupel → bawah awan</Card>
      <Card t={t} at={24.6} until={26.5} y={470} size={58} color={POSC}>+ tanah</Card>
      {t >= 12.2 && t < 40 && (
        <SafeLabel x={1010} y={1220} align="right" size={38} weight={600} color="rgba(255,255,255,0.9)">
          ilustrasi · tidak berskala
        </SafeLabel>
      )}
      {/* leader */}
      <Card t={t} at={27.0} until={30.2} y={270} size={62} color={AMB}>TARIKAN MAKIN KUAT</Card>
      <Card t={t} at={30.5} until={34.6} y={262} size={104} color={VIO}>±50 m</Card>
      <Card t={t} at={30.8} until={34.6} y={400} size={44}>per lompatan</Card>
      <Card t={t} at={33.0} until={34.6} y={490} size={52} color={VIO}>PEMIMPIN BERTINGKAT</Card>
      {t >= 34.8 && t < 39.9 && (
        <>
          <SafeLabel x={540} y={270} align="center" size={56} weight={800} color={POSC} opacity={ramp(t, 34.8, 35.1) * (1 - ramp(t, 39.6, 39.9))}>
            + naik menyambut
          </SafeLabel>
          <SafeLabel x={540} y={380} align="center" size={48} weight={800} color="#FFFFFF" opacity={ramp(t, 34.8, 35.1) * (1 - ramp(t, 39.6, 39.9))}>
            {targets.map((x) => x.txt).join(" · ")}
          </SafeLabel>
        </>
      )}
      {/* stroke */}
      <Card t={t} at={40.3} until={43.0} y={280} size={78} color={RING}>TERSAMBUNG!</Card>
      <Card t={t} at={43.3} until={47.6} y={262} size={74} color="#FFFFFF">ARUS BALIK ↑</Card>
      <Card t={t} at={45.1} until={47.6} y={390} size={60} color={AMB}>1/3 kecepatan cahaya</Card>
      <Card t={t} at={48.9} until={50.9} y={300} size={80} color={RING}>berkedip 3–4×</Card>
      {/* heat */}
      <Card t={t} at={51.4} until={57.9} y={262} size={112} color={AMB}>28.000 °C</Card>
      <Card t={t} at={51.8} until={57.9} y={410} size={44}>suhu jalur kilat</Card>
      <Card t={t} at={55.6} until={57.9} y={500} size={50} color="#FFD36B">5× permukaan Matahari</Card>
      <Card t={t} at={58.4} until={62.6} y={270} size={52} color={RING} maxWidth={940}>udara mengembang ↔ menyusut</Card>
      <Card t={t} at={62.85} until={63.75} y={300} size={130} color={RING}>GUNTUR!</Card>
      {/* distance */}
      <Card t={t} at={64.1} until={69.5} y={270} size={54} color="#FFE27A">CAHAYA: hampir seketika</Card>
      <Card t={t} at={66.4} until={69.5} y={380} size={54} color={RING}>SUARA: ±1/3 km per detik</Card>
      {t >= 69.8 && t < 73.2 && (
        <SafeLabel x={540} y={262} align="center" size={110} weight={800} color="#FFFFFF" opacity={ramp(t, 69.8, 70.0)}>
          {`⏱ ${watch.toFixed(1).replace(".", ",")} dtk`}
        </SafeLabel>
      )}
      <Card t={t} at={71.6} until={73.2} y={420} size={80} color={AMB}>÷ 3</Card>
      <Card t={t} at={73.3} until={76.7} y={270} size={76} color={RING}>3 dtk ÷ 3 ≈ 1 km</Card>
      {/* safety */}
      <Card t={t} at={77.2} until={80.7} y={280} size={62} color={AMB}>MASIH DENGAR GUNTUR?</Card>
      <Card t={t} at={80.9} until={83.9} y={280} size={92} color={RED}>MASUK RUMAH!</Card>
    </AbsoluteFill>
  );
};
