// EP45 night stadium shot (the approved cover's set), parameterised for the film: camera, confetti fall,
// floodlight flash, hero on/off and extra midground sprites. With the defaults it renders exactly the cover.
// Lives in 1080 × 1920 design px; the caller scales it.
import React, { useMemo } from "react";
import { C, rgba } from "../../kits/pixelstory/core/palette.ts";
import { hash2, rng } from "../../kits/pixelstory/core/noise.ts";
import { CinematicCamera, Layer, type CameraState } from "../../kits/pixelstory/camera/CinematicCamera.tsx";
import { AlbedoView, PX, SpriteView } from "../../kits/pixelstory/pixel/views.tsx";
import { finish } from "../../kits/pixelstory/pixel/finish.ts";
import { Glow, LightShaft } from "../../kits/pixelstory/lighting/overlays.tsx";
import { spriteGainAt, spriteLightsAt } from "../../kits/pixelstory/lighting/spriteLight.ts";
import type { Light } from "../../kits/pixelstory/lighting/relight.ts";
import { FONT } from "../../kits/pixelstory/typography/fonts.ts";
import { BOARD_Y, buildSet, CUP, FLOOD, HERO, PITCH_GREEN, RIM } from "./stadium.ts";
import { fillSprite, HERO_PAL, SPEC } from "./sprites.ts";

export const COVER_CAM: CameraState = { x: 0, y: 0, z: 0, roll: 0, focus: 1000, aperture: 7 };
export type LitLight = Light & { color?: string };

/** The cover's three lights; `boost` scales the floodlight (1 = cover). */
export const stadiumLights = (boost = 1): LitLight[] => {
  const angle = Math.atan2(HERO.y - 40 - FLOOD.y, HERO.x - FLOOD.x);
  return [
    { kind: "cone", x: FLOOD.x, y: FLOOD.y, r: 150, i: 1.5 * boost, angle, spread: 0.36, color: "#FFE2B0" },
    { kind: "point", x: HERO.x - 4, y: HERO.y - 4, r: 28, i: 0.95 * boost, color: "#FFE2B0" },
    { kind: "point", x: RIM.x, y: RIM.y, r: 70, i: 0.5, color: "#CFE0FF" },
  ];
};

const useConfetti = () =>
  useMemo(() => {
    const r = rng(1992);
    const cols = ["#C8202E", "#F3E6CC", "#E9B347"];
    return Array.from({ length: 46 }, (_, i) => {
      const x = Math.floor(r() * 135);
      const y = 84 + Math.floor(r() * 96);
      const nearHero = Math.abs(x - HERO.x) < 20 && y > CUP.y - 12;
      return nearHero ? null : { x, y, c: cols[i % 3], s: r() < 0.25 ? 2 : 1, a: 0.55 + hash2(i, 7) * 0.4, i };
    }).filter(Boolean) as { x: number; y: number; c: string; s: number; a: number; i: number }[];
  }, []);

export const StadiumShot: React.FC<{
  cam?: CameraState;
  /** Seconds of confetti fall (0 = cover positions). Negative hides it. */
  confettiT?: number;
  boost?: number;
  hero?: boolean;
  /** Extra midground content (set coordinates, PX scale), drawn after the hero. */
  mg?: React.ReactNode;
}> = ({ cam = COVER_CAM, confettiT = 0, boost = 1, hero: showHero = true, mg }) => {
  const set = useMemo(buildSet, []);
  const hero = useMemo(() => finish(fillSprite(), SPEC), []);
  const lights = stadiumLights(boost);
  const angle = lights[0].kind === "cone" ? lights[0].angle : 0;
  const ambient = 0.11;
  const opts = { ambient, exposure: 1.12, dither: 0.45 };
  const heroAt = { x: HERO.x, y: HERO.y - 40 };
  const confetti = useConfetti();
  const label: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };

  return (
    <CinematicCamera cam={cam}>
      <Layer z={1500} maxBlur={4}>
        <AlbedoView albedo={set.back} lights={lights} opts={opts} />
        <Glow x={FLOOD.x} y={FLOOD.y - 2} r={30} color="#FFE2B0" intensity={0.75 * boost} squash={0.7} />
        <Glow x={RIM.x} y={RIM.y - 2} r={16} color="#CFE0FF" intensity={0.45} squash={0.7} />
      </Layer>
      <Layer z={1000}>
        <AlbedoView albedo={set.pitch} lights={lights} opts={opts} />
        {/* ad board brand: part of the stadium */}
        <div style={{ ...label, position: "absolute", left: 3 * PX, top: BOARD_Y * PX + 14, fontSize: 36, fontWeight: 700, color: C.gold, textShadow: `0 0 12px ${rgba(C.amber, 0.6)}` }}>AUDIRA</div>
        <LightShaft id="flood" x={FLOOD.x} y={FLOOD.y} angle={angle} length={175} spread={0.2} color="#FFE2B0" intensity={0.2} />
        {showHero ? <Glow x={CUP.x} y={CUP.y + 8} r={22} color={C.gold} intensity={0.5} /> : null}
        {showHero ? (
          <SpriteView
            sprite={hero}
            pal={HERO_PAL}
            anchor={{ x: 18, y: hero.h - 1 }}
            x={HERO.x}
            y={HERO.y}
            lights={[
              ...spriteLightsAt(lights, heroAt.x, heroAt.y, { rim: 1.1, core: 0.35, width: 2 }),
              // cool rim from the far tower: what separates the red shirt from the red crowd
              { dir: [1, -0.6], color: "#CFE0FF", rim: 0.75, core: 0, width: 1 },
            ]}
            gain={spriteGainAt(lights, heroAt.x, heroAt.y, ambient)}
          />
        ) : null}
        {mg}
        {confettiT >= 0 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            {confetti.map((c, i) => {
              // falls on twos (pixel cadence), wraps inside the stands-to-pitch band
              const fall = confettiT * (5 + hash2(c.i, 3) * 4);
              const y = 84 + ((c.y - 84 + fall) % 110);
              const x = c.x + Math.sin(confettiT * 1.3 + c.i) * (confettiT > 0 ? 1.5 : 0);
              return <div key={i} style={{ position: "absolute", left: Math.round(x) * PX, top: Math.round(y) * PX, width: c.s * PX, height: c.s * PX, background: rgba(c.c, c.a) }} />;
            })}
          </div>
        ) : null}
      </Layer>
      <Layer z={620} maxBlur={10}>
        <AlbedoView albedo={set.near} lights={lights} opts={{ ambient: 0.1, exposure: 1, dither: 0.4 }} />
      </Layer>
    </CinematicCamera>
  );
};

/** The cover's headline block (kicker, title, two fact chips). `o` fades it. */
export const CoverText: React.FC<{ o?: number }> = ({ o = 1 }) => {
  const label: React.CSSProperties = { fontFamily: FONT.pixel, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "pre" };
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: o === 1 ? undefined : o }}>
      <div style={{ ...label, position: "absolute", top: 196, fontSize: 34, color: PITCH_GREEN, textShadow: `0 4px 0 ${C.ink}` }}>SEJARAH SEPAK BOLA #45</div>
      <div style={{ position: "absolute", top: 262, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT.display, lineHeight: 0.95, textShadow: `0 8px 0 ${C.ink}, 0 0 40px ${rgba(C.ink, 0.8)}` }}>
        <div style={{ fontSize: 132, color: C.ivory }}>TAK LOLOS,</div>
        <div style={{ fontSize: 168, color: C.gold }}>MALAH JUARA</div>
      </div>
      <div style={{ ...label, position: "absolute", top: 618, fontSize: 32, color: C.ivory, padding: "12px 20px", background: rgba(C.ink, 0.72), border: `4px solid ${rgba(C.crimson, 0.9)}` }}>
        DIPANGGIL 10 HARI SEBELUM TURNAMEN
      </div>
      <div style={{ ...label, position: "absolute", top: 690, fontSize: 32, color: C.gold, padding: "12px 20px", background: rgba(C.ink, 0.72) }}>
        FINAL 1992: DENMARK 2-0
      </div>
    </div>
  );
};
