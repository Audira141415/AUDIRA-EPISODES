// EP01 arena shot (the cover's set), parameterised for the film: camera, spot boost, shuttle position, hero on/off.
// With the defaults it renders exactly the cover. Lives in 1080 × 1920 design px; the caller scales it.
import React, { useMemo } from "react";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { CinematicCamera, Layer, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import { finish } from "../../kits/pixelstory/pixel/finish.ts";
import { Glow, LightShaft } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { BOARD_Y, buildArena, HERO, RIM, RIVAL, SPOT } from "./arena.ts";
import { HERO_ANCHOR, heroSmash, PAL, rival, RIVAL_ANCHOR, RIVAL_PAL, shuttle, SPEC } from "./sprites.ts";

export const COVER_CAM: CameraState = { x: 0, y: 0, z: 0, roll: 0, focus: 1000, aperture: 7 };
export type LitLight = Light & { color?: string };

export const arenaLights = (boost = 1): LitLight[] => {
  const angle = Math.atan2(HERO.y - 50 - SPOT.y, HERO.x - SPOT.x);
  return [
    { kind: "cone", x: SPOT.x, y: SPOT.y, r: 200, i: 1.45 * boost, angle, spread: 0.3, color: "#FFE6BC" },
    { kind: "point", x: HERO.x, y: HERO.y - 50, r: 34, i: 0.9 * boost, color: "#FFE6BC" },
    { kind: "point", x: RIVAL.x, y: RIVAL.y - 14, r: 20, i: 0.55, color: "#FFE6BC" },
    { kind: "point", x: RIM.x, y: RIM.y, r: 80, i: 0.45, color: "#CFE0FF" },
  ];
};

/** Shuttle at the cover position (just above the racket, a falling streak behind it). */
export const SHUTTLE = { x: 63, y: 95 };

export const ArenaShot: React.FC<{
  cam?: CameraState;
  boost?: number;
  hero?: boolean;
  rivalOn?: boolean;
  shuttleAt?: { x: number; y: number } | null;
  mg?: React.ReactNode;
}> = ({ cam = COVER_CAM, boost = 1, hero: showHero = true, rivalOn = true, shuttleAt = SHUTTLE, mg }) => {
  const set = useMemo(buildArena, []);
  const hero = useMemo(() => finish(heroSmash(), SPEC), []);
  const opp = useMemo(() => finish(rival(), SPEC), []);
  const cock = useMemo(() => finish(shuttle(), SPEC), []);
  const lights = arenaLights(boost);
  const angle = lights[0].kind === "cone" ? lights[0].angle : 0;
  const ambient = 0.12;
  const opts = { ambient, exposure: 1.1, dither: 0.45 };
  const heroAt = { x: HERO.x, y: HERO.y - 50 };
  const label: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };

  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={SPOT.x} y={SPOT.y + 1} r={26} color="#FFE6BC" intensity={0.7 * boost} squash={0.6} />
        <Glow x={14} y={11} r={12} color="#FFE6BC" intensity={0.4} squash={0.6} />
        <Glow x={112} y={11} r={12} color="#CFE0FF" intensity={0.4} squash={0.6} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.court} lights={lights} opts={opts} />
        {/* ad board brand: part of the arena */}
        <div style={{ ...label, position: "absolute", left: 3 * PX, top: BOARD_Y * PX + 8, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <LightShaft id="spot" x={SPOT.x} y={SPOT.y} angle={angle} length={200} spread={0.18} color="#FFE6BC" intensity={0.16} />
        {rivalOn ? (
          <SpriteView sprite={opp} pal={RIVAL_PAL} anchor={RIVAL_ANCHOR} x={RIVAL.x} y={RIVAL.y}
            lights={spriteLightsAt(lights, RIVAL.x, RIVAL.y - 14, { rim: 0.9, core: 0.3, width: 1 })}
            gain={spriteGainAt(lights, RIVAL.x, RIVAL.y - 14, ambient)} />
        ) : null}
        {showHero ? (
          <SpriteView
            sprite={hero}
            pal={PAL}
            anchor={HERO_ANCHOR}
            x={HERO.x}
            y={HERO.y}
            lights={[
              ...spriteLightsAt(lights, heroAt.x, heroAt.y, { rim: 1.1, core: 0.35, width: 2 }),
              { dir: [1, -0.6], color: "#CFE0FF", rim: 0.7, core: 0, width: 1 },
            ]}
            gain={spriteGainAt(lights, heroAt.x, heroAt.y, ambient)}
          />
        ) : null}
        {shuttleAt ? (
          <>
            {/* falling streak from the far court: 3 fading art px trails */}
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} style={{ position: "absolute", left: (shuttleAt.x + 2 + k * 3.2) * PX, top: (shuttleAt.y - k * 1.1) * PX, width: PX * 2, height: PX, background: rgba(C.ivory, 0.5 - k * 0.07) }} />
            ))}
            <Glow x={shuttleAt.x + 2} y={shuttleAt.y + 2} r={6} color="#FFFFFF" intensity={0.45} />
            <SpriteView sprite={cock} pal={PAL} anchor={{ x: 2, y: 3 }} x={shuttleAt.x + 2} y={shuttleAt.y + 3} lights={[{ dir: [-0.4, -1], color: "#FFE6BC", rim: 1, core: 0.3, width: 1 }]} gain={1.1} />
          </>
        ) : null}
        {mg}
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};

/** The cover's headline block. `o` fades it. Text stays in art rows 24–92 (above the hero). */
export const CoverText: React.FC<{ o?: number }> = ({ o = 1 }) => {
  const label: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: o === 1 ? undefined : o }}>
      <div style={{ ...label, position: "absolute", top: 196, fontSize: 36, color: C.ivory, padding: "8px 16px", background: rgba("#B8222E", 0.9) }}>FAKTA OLAHRAGA #01</div>
      <div style={{ position: "absolute", top: 268, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT.display, lineHeight: 0.95, textShadow: `0 8px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.85)}` }}>
        <div style={{ fontSize: 132, color: C.ivory }}>KALAH DULU,</div>
        <div style={{ fontSize: 168, color: C.gold }}>LALU EMAS</div>
      </div>
      <div style={{ ...label, position: "absolute", top: 590, fontSize: 36, color: C.ivory, padding: "12px 20px", background: rgba(C.ink, 0.74), border: `4px solid ${rgba("#D02A30", 0.95)}` }}>
        EMAS PERTAMA INDONESIA
      </div>
      <div style={{ ...label, position: "absolute", top: 664, fontSize: 36, color: C.gold, padding: "12px 20px", background: rgba(C.ink, 0.74) }}>
        BARCELONA 1992
      </div>
    </div>
  );
};
