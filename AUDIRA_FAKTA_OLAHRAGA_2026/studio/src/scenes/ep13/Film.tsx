// EP13 "Pedang Curang Montreal 1976" (FILMNOIR, Remotion 2D). 21 shots per docs/SHOTLIST.md, all times from VO words.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { chronicleFontsReady } from "../ep05/chronicle/fonts.ts";
import { C, Finish, Karaoke, OUTRO_AT, Stamp, TOTAL, Tag, Title, W } from "./lib.tsx";
import { CUT } from "./kit.tsx";
import { S1, S10, S11, S2, S3, S4, S5, S6, S7, S8, S9 } from "./sets1.tsx";
import { S12, S12b, S13, S13b, S14, S15, S16, S17, S18, S19, S20 } from "./sets2.tsx";

void chronicleFontsReady();
const K = "konteks", D = "pengembangan", E = "penjelasan", Y = "payoff", O = "outro";

const Hud: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Title t={t} a={-0.2} b={W("hook", "tapi")} text="TIDAK MENYENTUH" size={118} />
    <Title t={t} a={W("hook", "lampu")} b={CUT[1]} text="LAMPU MENYALA" size={132} color={C.red} />
    <Title t={t} a={W(K, "19") - 0.1} b={CUT[2]} kicker="MONTREAL" text="19 JULI 1976" size={142} />
    <Title t={t} a={W(K, "onish") - 0.15} b={CUT[3]} text="BORIS ONISHCHENKO" size={104} />
    <Tag t={t} a={W(K, "emas") - 0.1} b={CUT[3]} text="EMAS OLIMPIADE · UNI SOVIET" y={424} size={50} />
    <Title t={t} a={W(K, "pancalomba") - 0.1} b={CUT[4]} text="PANCALOMBA MODERN" size={94} y={300} />
    <Tag t={t} a={W(K, "ditekan")} b={W(K, "tekanan")} text="TEKAN MINIMAL 750 GRAM" y={300} size={58} />
    <Title t={t} a={W(K, "sirkuit") - 0.1} b={CUT[5]} text="SIRKUIT TERTUTUP" size={118} />
    <Title t={t} a={W(D, "parker") - 0.1} b={CUT[6]} text="PARKER: PROTES!" size={124} />
    <Stamp t={t} a={W(D, "poin")} b={CUT[7]} text="POIN SAH" y={310} color={C.bone} size={132} />
    <Tag t={t} a={W(D, "jim") - 0.1} b={W(D, "40") - 0.05} text="LAWAN BERIKUTNYA: JIM FOX" y={300} size={54} />
    <Title t={t} a={W(D, "40")} b={CUT[8]} text="40 DETIK" size={168} />
    <Title t={t} a={W(D, "mengarah") - 0.1} b={CUT[9]} text="UJUNG KE ATAS" size={132} />
    <Tag t={t} a={W(D, "minta")} b={W(D, "tim")} text="BORIS MINTA MAAF" y={300} size={60} />
    <Title t={t} a={W(D, "lain") - 0.6} b={CUT[10]} text="PEDANG LAIN?" size={132} />
    <Stamp t={t} a={W(D, "menyita")} b={CUT[11]} text="DISITA" y={310} color={C.bone} size={150} />
    <Title t={t} a={W(E, "lubang") - 0.05} b={W(E, "ditutup")} text="LUBANG BOR" size={150} />
    <Title t={t} a={W(E, "kain") - 0.05} b={CUT[12]} text="DITUTUP KAIN KULIT" size={108} />
    <Title t={t} a={W(E, "tombol") - 0.05} b={CUT[13]} text="TOMBOL LOGAM" size={132} />
    <Tag t={t} a={W(E, "jari")} b={CUT[14]} text="JARI MANIS + KELINGKING" y={300} size={58} />
    <Title t={t} a={W(E, "tanpa") - 0.05} b={CUT[15]} text="TANPA SENTUHAN" size={122} color={C.red} />
    <Title t={t} a={W(Y, "membantah")} b={CUT[16]} kicker="BANTAHAN ONISHCHENKO" text="BUKAN PEDANGNYA" size={122} />
    <Title t={t} a={W(Y, "kidal") - 0.1} b={CUT[17]} text="KIDAL" size={136} />
    <Tag t={t} a={W(Y, "semua")} b={CUT[17]} text="REKAN SETIM: TANGAN KANAN" y={440} size={50} />
    <Stamp t={t} a={W(Y, "kasus")} b={CUT[18]} text="KASUS PENIPUAN" y={310} color={C.bone} size={112} />
    <Title t={t} a={W(Y, "soviet") - 0.1} b={CUT[19]} text="TIM SOVIET GUGUR" size={116} />
    <Title t={t} a={W(Y, "seumur") - 0.05} b={CUT[20]} kicker="DILARANG BERTANDING" text="SEUMUR HIDUP" size={132} />
    <Title t={t} a={W(Y, "beregu") - 0.1} b={CUT[21]} kicker="EMAS BEREGU" text="INGGRIS" size={156} color={C.key} />
    <Title t={t} a={W(O, "berani") - 0.1} b={CUT[22]} text="BERANI PROTES?" size={128} />
    <Tag t={t} a={W(O, "tulis")} b={CUT[22]} text="TULIS DI KOMENTAR" y={440} size={58} />
    <Tag t={t} a={W(O, "ikuti")} b={OUTRO_AT - 0.1} text="IKUTI AUDIRA SPORT FACTS" y={300} size={58} />
  </>
);

export const Picture: React.FC<{ t: number }> = ({ t }) => (
  <>
    <S1 t={t} /><S2 t={t} /><S3 t={t} /><S4 t={t} /><S5 t={t} /><S6 t={t} /><S7 t={t} /><S8 t={t} /><S9 t={t} /><S10 t={t} /><S11 t={t} />
    <S12 t={t} /><S12b t={t} /><S13 t={t} /><S13b t={t} /><S14 t={t} /><S15 t={t} /><S16 t={t} /><S17 t={t} /><S18 t={t} /><S19 t={t} /><S20 t={t} />
  </>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Audio src={staticFile("audio/ep13/vo.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <Picture t={t} />
        <Finish frame={Math.floor(t * 30)} />
        {t < OUTRO_AT && <><Hud t={t} /><Karaoke t={t} /></>}
      </div>
    </AbsoluteFill>
  );
};
export { TOTAL };
