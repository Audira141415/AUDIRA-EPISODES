// EP67 Borobudur — Master Multi-Scene Switcher (Rule 09, Rule 19 & Anti-Monolithic Law)
// Switches between 5 distinct 3D visual acts matching the narration beats.

import React from "react";
import { Scene1_KeduValley } from "./scenes/Scene1_KeduValley.tsx";
import { Scene2_MandalaCosmology } from "./scenes/Scene2_MandalaCosmology.tsx";
import { Scene3_MerapiVolcano } from "./scenes/Scene3_MerapiVolcano.tsx";
import { Scene4_RafflesUNESCO } from "./scenes/Scene4_RafflesUNESCO.tsx";
import { Scene5_EternalDawn } from "./scenes/Scene5_EternalDawn.tsx";

export const BorobudurScene: React.FC<{ t: number }> = ({ t }) => {
  return (
    <group>
      {/* ACT 1: Kedu Valley Foundation (0s – 16s) */}
      <group visible={t < 16}>
        {t < 16.5 && <Scene1_KeduValley t={t} />}
      </group>

      {/* ACT 2: Mandala Architecture & 504 Buddha (16s – 43s) */}
      <group visible={t >= 16 && t < 43}>
        {t >= 15.5 && t < 43.5 && <Scene2_MandalaCosmology t={t} />}
      </group>

      {/* ACT 3: Merapi Eruption & 700 Years Burial (43s – 58s) */}
      <group visible={t >= 43 && t < 58}>
        {t >= 42.5 && t < 58.5 && <Scene3_MerapiVolcano t={t} />}
      </group>

      {/* ACT 4: Raffles 1814 Discovery & UNESCO Restoration (58s – 80s) */}
      <group visible={t >= 58 && t < 80}>
        {t >= 57.5 && t < 80.5 && <Scene4_RafflesUNESCO t={t} />}
      </group>

      {/* ACT 5: Epic Sunrise Panorama & Epilog (80s – 95s) */}
      <group visible={t >= 80}>
        {t >= 79.5 && <Scene5_EternalDawn t={t} />}
      </group>
    </group>
  );
};
