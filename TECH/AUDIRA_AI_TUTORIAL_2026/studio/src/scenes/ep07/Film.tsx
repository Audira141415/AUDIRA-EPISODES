// EP07 film: "Bikin Aplikasi Tanpa Coding Pakai Canvas di Gemini" (ISOCRAFT).
// One continuous 3D paper warung (World.tsx, camera.ts) under comic 2D layers: headlines, step
// discs, two stylised UI panels with a cursor (Panels.tsx), warning cards, karaoke captions.
// Every beat is keyed to timeline.json seconds (Audio Master Clock).
import React, { useEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Outro } from "../_shared/Outro.tsx";
import TL from "./timeline.json";
import { World } from "./World.tsx";
import { ChatPanel, CanvasPanel } from "./Panels.tsx";
import { Captions } from "./Captions.tsx";
import { BC, Headline, INK, P, PAPER, StepHeader, Tag, WarnCard, inkBox, outBack, ramp, win } from "./ui.tsx";

const bangers = loadBangers("normal", { weights: ["400"], subsets: ["latin"] });
const barlow = loadBarlow("normal", { weights: ["700", "800"], subsets: ["latin"] });

const OUTRO_AT = TL.sections.outro[1] + 0.2;
const S = TL.sections;

/** "</>" chip crossed out: hook icon for "tidak bisa coding". */
const NoCode: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const o = win(t, 2.56, 3.85, 0.2, 0.2);
  if (o <= 0) return null;
  const pop = outBack(ramp(t, 2.56, 2.9), 2.4);
  const slash = ramp(t, 2.9, 3.15);
  return (
    <div style={{ position: "absolute", left: 640 * k, top: 610 * k, width: 300 * k, height: 170 * k, opacity: o, transform: `scale(${pop}) rotate(6deg)` }}>
      <div style={{ position: "absolute", inset: 0, ...inkBox(k, "#24363A", 10, 6, 22), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 92 * k, color: "#7FD1B0" }}>{"</>"}</div>
      <div style={{ position: "absolute", left: -20 * k, top: 76 * k, width: 340 * k * slash, height: 22 * k, background: P.bodyCoral, border: `${5 * k}px solid ${INK}`, borderRadius: 10 * k, transform: "rotate(-22deg)", transformOrigin: "0% 50%" }} />
    </div>
  );
};

/** Next-episode card for the outro. */
const NextCard: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const a = 81.75, b = OUTRO_AT;
  if (t < a || t > b + 0.1) return null;
  const o = win(t, a, b, 0.25, 0.2);
  const pop = outBack(ramp(t, a, a + 0.4), 2);
  return (
    <div style={{ position: "absolute", left: 60 * k, right: 60 * k, top: 268 * k, opacity: o, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: "0% 0%" }}>
      <Tag k={k}>EPISODE DEPAN</Tag>
      <div style={{ ...inkBox(k, PAPER, 12, 6, 22), marginTop: 18 * k, padding: `${20 * k}px ${28 * k}px`, display: "flex", alignItems: "center", gap: 26 * k }}>
        <svg width={150 * k} height={110 * k} viewBox="0 0 150 110" style={{ flex: "none" }}>
          <rect x={6} y={20} width={104} height={80} rx={16} fill={P.bodyMint} stroke={INK} strokeWidth={8} />
          <path d="M110 46 L144 26 L144 94 L110 74 Z" fill={P.accentYellow} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <circle cx={58} cy={60} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
        </svg>
        <div style={{ fontFamily: BC, fontWeight: 800, fontSize: 60 * k, lineHeight: 1.0, color: INK }}>
          Ngobrol dengan Gemini
          <br />
          <span style={{ color: P.bodyCoral }}>lewat kamera</span>
        </div>
      </div>
    </div>
  );
};

export const Ep07Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const k = width / 1080;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("EP07 film fonts"));
  useEffect(() => {
    Promise.all([bangers.waitUntilDone(), barlow.waitUntilDone()])
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: P.paperWarm }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows camera={{ position: [20, 18, 20], fov: 20, near: 0.1, far: 300 }}>
          <World t={t} f={f} />
          <Finish frame={frame} background={P.paperWarm} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} ao={false} exposure={1} envIntensity={0.25} />
        </ThreeCanvas>
      )}
      {ready && (
        <>
          {/* HOOK */}
          <Headline k={k} t={t} a={0.0} b={3.85} kicker="WARUNGMU BUTUH" size={118}>
            APLIKASI KASIR?
            {t >= 2.56 && (
              <>
                <br />
                <span style={{ color: P.bodyCoral, fontSize: 92 * k }}>TAPI TIDAK BISA CODING?</span>
              </>
            )}
          </Headline>
          <NoCode k={k} t={t} />
          <Headline k={k} t={t} a={3.95} b={8.1} kicker="AUDIRA AI TUTORIAL · EP 7" size={112}>
            KITA RAKIT
            <br />
            <span style={{ color: P.accentYellow }}>PAKAI CANVAS</span>
          </Headline>

          {/* KONTEKS */}
          <Headline k={k} t={t} a={S.konteks[0] - 0.05} b={10.7} kicker="APA ITU CANVAS?" size={104}>
            RUANG KERJA
            <br />
            <span style={{ color: P.bodyMint }}>DI GEMINI</span>
          </Headline>
          <Headline k={k} t={t} a={10.75} b={13.3} kicker="DARI SATU PERINTAH" size={96}>
            JADI DOKUMEN,
            <br />
            <span style={{ color: P.bodyCoral }}>SAMPAI APLIKASI</span>
          </Headline>

          {/* LANGKAH */}
          <StepHeader k={k} t={t} a={20.95} b={23.15} n={1} title="Buka gemini.google.com" sub="di browser HP atau laptop" />
          <StepHeader k={k} t={t} a={23.2} b={26.95} n={2} title="Klik Add Files → Canvas" sub="tombol di bawah kotak teks" />
          <StepHeader k={k} t={t} a={27.0} b={36.15} n={3} title="Tulis perintah sejelas mungkin" sub="sebut isi & fungsi aplikasinya" />
          <ChatPanel k={k} t={t} />
          <StepHeader k={k} t={t} a={36.2} b={38.3} n={4} title="Kirim, tunggu dirakit" />
          <StepHeader k={k} t={t} a={38.35} b={43.6} n={5} title="Coba di tab Preview" sub="aplikasinya langsung bisa dipakai" />
          <CanvasPanel k={k} t={t} />

          {/* PENJELASAN */}
          <Headline k={k} t={t} a={43.65} b={45.45} kicker="ISI MESINNYA" size={104}>
            MAU LIHAT
            <br />
            <span style={{ color: P.accentYellow }}>DALAMNYA?</span>
          </Headline>
          <StepHeader k={k} t={t} a={45.5} b={48.9} n={6} title="Code (kanan atas)" sub="baca atau ubah kodenya" />
          <StepHeader k={k} t={t} a={48.95} b={53.25} n={7} title="Ada error? Show console" sub="lihat pesan kesalahannya" />
          <StepHeader k={k} t={t} a={53.3} b={60.55} n={8} title="Select & ask" sub="tandai bagian, tulis perubahannya" />
          <Headline k={k} t={t} a={60.6} b={65.55} kicker="APLIKASI DIPERBARUI" size={104}>
            TES LAGI
            <br />
            <span style={{ color: P.bodyMint }}>LANGSUNG!</span>
          </Headline>

          {/* PAYOFF */}
          <StepHeader k={k} t={t} a={65.6} b={71.45} n={9} title="Share & export → Share" sub="bagikan tautan aplikasimu" />
          <WarnCard k={k} t={t} a={71.55} b={76.45} kicker="TETAP TES SENDIRI">
            Buatan AI bisa salah. Cek <span style={{ color: P.bodyCoral }}>hitungan uangnya</span>.
          </WarnCard>
          <WarnCard k={k} t={t} a={76.55} b={81.3} kicker="JAGA PRIVASI">
            Jangan simpan <span style={{ color: P.bodyCoral }}>data pelanggan sensitif</span> di aplikasi coba-coba.
          </WarnCard>

          {/* OUTRO */}
          <NextCard k={k} t={t} />

          <Captions t={t} k={k} hideAfter={OUTRO_AT} />
        </>
      )}
      <Outro start={OUTRO_AT} />
    </AbsoluteFill>
  );
};
