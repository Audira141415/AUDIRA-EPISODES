// EP03 cover — BROADCASTFORGE. Isner vs Mahut, Wimbledon 2010, Court 18: 11 h 5 min over 3 days, fifth set 70–68.
// Dusk on day 2 (play stopped for darkness at 59–59), the courtside scoreboard frozen at 47–47.
// A: hero = Isner from behind at the top of his serve toss (one subject), headline "11 JAM".
// B: high broadcast wide of the whole court, headline "70–68".
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Ball, CourtSet, DuskLights, HALF_L, ISNER_LOOK, MAHUT_LOOK, Player, Racket, readyPose, servePose } from "./court.tsx";
import { DurationClock, Headline, LiveBug, ScoreBug, Ticker } from "./hud.tsx";
import { useDisplayFont } from "./fonts.ts";

const FILM_FPS = 60;
const lens = { focus: 10, aperture: 0, maxBlur: 0, exposure: 1.05 };

export const SHOT_A: Shot = { pos: [1.0, 2.2, HALF_L + 8.55], target: [1.0, 0.6, HALF_L - 5.95], fov: 38, ...lens };
export const SHOT_B: Shot = { pos: [0, 6, HALF_L + 24], target: [0, 1.2, HALF_L - 6], fov: 20, ...lens };

const ISNER_POS: [number, number, number] = [1.5, 0, HALF_L + 0.35];
const MAHUT_POS: [number, number, number] = [-0.5, 0, -HALF_L - 0.9];
const PERSON_SCALE = 1.95;

export const CourtShot: React.FC<{ f: number; shot: Shot; children?: React.ReactNode }> = ({ f, shot, children }) => (
  <>
    <DuskLights />
    <CourtSet f={f} />
    <Player f={f} seed={23} look={ISNER_LOOK} pose={servePose(1)} position={ISNER_POS} heading={Math.PI} scale={PERSON_SCALE} />
    <Racket position={[ISNER_POS[0] + 0.74, 1.39, ISNER_POS[2] + 0.14]} rotation={[0.3, 0, 0.25]} />
    <Ball position={[ISNER_POS[0] - 0.25, 2.95, ISNER_POS[2] - 0.35]} r={0.05} />
    <Player f={f} seed={41} look={MAHUT_LOOK} pose={readyPose()} position={MAHUT_POS} heading={0} scale={PERSON_SCALE} />
    {children}
    <CameraRig shot={shot} near={0.1} far={400} />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} hdri="sky" envIntensity={0.4} exposure={1.05} aoRadius={0.4} />
  </>
);

const ROWS = [
  { name: "ISNER", sets: [6, 3, 6, 7, 70], serving: true, winner: true },
  { name: "MAHUT", sets: [4, 6, 7, 6, 68] },
];

const make = (variant: "A" | "B"): React.FC => {
  const C: React.FC = () => {
    useDisplayFont();
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const f = (frame / fps) * FILM_FPS;
    const shot = variant === "A" ? SHOT_A : SHOT_B;
    return (
      <Stage3D
        background="#0b1630"
        overlay={() => (
          <>
            <LiveBug day="HARI KE-2 · LAPANGAN 18" />
            <DurationClock value="11:05" />
            {variant === "A" ? (
              <Headline top={350} align="left" kicker="WIMBLEDON 2010" hero="11 JAM" heroSize={230} />
            ) : (
              <Headline top={334} kicker="SET KELIMA · 8 JAM 11 MENIT" hero="70–68" heroSize={150} />
            )}
            <ScoreBug rows={ROWS} top={1300} />
            <Ticker label="FAKTA" text="183 GAME  ·  216 ACE  ·  DIMAINKAN 3 HARI  ·  PAPAN SKOR MACET DI 47–47" />
          </>
        )}
      >
        <CourtShot f={f} shot={shot} />
      </Stage3D>
    );
  };
  return C;
};

export const CoverA = make("A");
export const CoverB = make("B");
