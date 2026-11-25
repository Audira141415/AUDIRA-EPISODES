import React from "react";
import { MultiSceneDirector, type SceneBeat } from "F:/AUDIRA-SKILL-MOTION/starter/src/templates/MultiSceneDirector.tsx";
import { Scene1_Hook } from "./scenes/Scene1_Hook.tsx";
import { Scene2_Context } from "./scenes/Scene2_Context.tsx";
import { Scene3_Development } from "./scenes/Scene3_Development.tsx";
import { Scene4_Conflict } from "./scenes/Scene4_Conflict.tsx";
import { Scene5_Payoff } from "./scenes/Scene5_Payoff.tsx";
import { Scene6_Outro } from "./scenes/Scene6_Outro.tsx";

const SCENES: SceneBeat[] = [
  { id: "s1", start: 0,  end: 15, title: "Hook",        metricValue: "FAKTA KUNCI", metricLabel: "PENETRASI AWAL", content: <Scene1_Hook t={0} /> },
  { id: "s2", start: 15, end: 35, title: "Context",     metricValue: "LOKASI",      metricLabel: "LATAR HISTORIS", content: <Scene2_Context t={0} /> },
  { id: "s3", start: 35, end: 60, title: "Development", metricValue: "STRUKTUR",   metricLabel: "ARSITEKTUR UTAMA", content: <Scene3_Development t={0} /> },
  { id: "s4", start: 60, end: 75, title: "Conflict",    metricValue: "BENCANA",     metricLabel: "TITIK BALIK", content: <Scene4_Conflict t={0} /> },
  { id: "s5", start: 75, end: 85, title: "Payoff",      metricValue: "RESTORASI",   metricLabel: "PENEMUAN", content: <Scene5_Payoff t={0} /> },
  { id: "s6", start: 85, end: 92, title: "Outro",       metricValue: "WARISAN",     metricLabel: "PENUTUP", content: <Scene6_Outro t={0} /> },
];

export const EpisodeComposition: React.FC = () => {
  return (
    <MultiSceneDirector
      totalSeconds={92}
      scenes={SCENES}
      channelHandle="@AUDIRA"
      signatureSeed="ep57_paraguay_perang_3_negara"
    />
  );
};
