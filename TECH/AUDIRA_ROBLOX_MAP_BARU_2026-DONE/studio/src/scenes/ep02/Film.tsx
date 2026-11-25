// EP02 film (DATAPHYSICAL): "Map viral umur 90 hari". One continuous gallery of data sculptures,
// grown from the approved cover. Every camera key and event is anchored to a word of the locked
// voice (timing.ts). Parts: hook (cover sculpture) → context (28/100 pegboard, race plinth) →
// main (players columns, DevEx coin stacks) → explain (bars regrow at true scale) → payoff
// (83% board flip, avatar builds a small map) → outro (crane back, outro card).
import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { DATAPHYSICAL_PALETTE as P } from "../../kits/dataphysical/lib/palette.ts";
import type { AvatarPose } from "../_shared/BlockAvatar.tsx";
import timeline from "./timeline.json";
import { BG, COIN, COVER_CAMERA, HookWorld, PLINTH_TOP, WORLD_COVER, useEp02Ready, type AvatarState, type WorldState } from "./Hook.tsx";
import { Headline } from "./Cover.tsx";
import { Captions } from "./Captions.tsx";
import { DataChips } from "./Chips.tsx";
import { TL, W, WE, clamp01, grow, ramp, smooth } from "./timing.ts";
import {
  CreatorsPlaque,
  DEVEX_SPOT,
  DevExStation,
  GalleryExtension,
  MapTray,
  PlayersStation,
  RaceStation,
  STATION,
  TRAY,
  raceTop,
} from "./Stations.tsx";

export const TOTAL_SECONDS: number = timeline.total;

type V3 = [number, number, number];
type Pose = { pos: V3; tgt: V3 };
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- camera: holds, then eases between word-anchored keys ----------
const COVER_POSE: Pose = { pos: COVER_CAMERA.position, tgt: COVER_CAMERA.target };
// wide on the board, the avatar on the floor beside the plinth (never in front of the cells)
const BOARD_POSE: Pose = { pos: [-4.9, 5.6, 19.5], tgt: [-4.3, 5.2, -1.5] };
const MOVES: { a: number; b: number; to: Pose }[] = [
  // hook: slow push toward the pegboard
  { a: W("Hampir"), b: WE("bulan"), to: { pos: [-2.4, 5.2, 20.0], tgt: [-1.5, 6.6, -1] } },
  // l02: the 28/100 board
  { a: W("Data"), b: W("28%"), to: BOARD_POSE },
  // l03: truck right to the race plinth
  { a: W("Artinya"), b: W("lama"), to: { pos: [STATION.C - 0.2, 5.6, 29.0], tgt: [STATION.C + 0.6, 7.8, -1] } },
  // l04: players columns, then tilt up with the fill
  { a: WE("breakout"), b: W("Grow"), to: { pos: [STATION.D - 0.8, 4.4, 18.5], tgt: [STATION.D, 5.4, -1] } },
  { a: W("dimainkan"), b: W("orang"), to: { pos: [STATION.D - 0.8, 8.2, 21.5], tgt: [STATION.D, 9.0, -1] } },
  // l05: DevEx console + first stack
  { a: WE("sekaligus"), b: W("bulan", 2), to: { pos: [STATION.E - 3.0, 4.8, 19.0], tgt: [STATION.E - 1.6, 4.2, -0.5] } },
  // l06: pull back for the 5 miliar stack
  { a: W("totalnya"), b: W("5") + 0.4, to: { pos: [STATION.E - 1.8, 7.2, 25.0], tgt: [STATION.E - 1.4, 5.9, -1] } },
  // l07: hard cut (a == b) back to the main sculpture on "Tapi", slow push, then pull wide while the tower grows
  { a: W("Tapi"), b: W("Tapi"), to: { pos: [-0.8, 4.4, 20.5], tgt: [0.9, 5.0, -1] } },
  { a: W("Tapi") + 0.05, b: W("teratas", 2), to: { pos: [-0.6, 4.6, 19.0], tgt: [0.9, 5.2, -1] } },
  { a: W("65,7"), b: WE("dolar", 3), to: { pos: [-1.3, 6.6, 30.5], tgt: [-0.1, 7.9, 0] } },
  // l08: down to the small bars
  { a: W("10,8"), b: W("1,4") + 0.3, to: { pos: [0.6, 5.0, 9.5], tgt: [-0.8, 2.2, 1.8] } },
  // l09: in on the median coin
  { a: W("median"), b: W("kreator", 3), to: { pos: [-2.85, 4.4, 11.0], tgt: [-2.85, 2.5, 2.6] } },
  // l10: back to the cover framing: open but unequal
  { a: W("Jadi"), b: WE("terbuka"), to: COVER_POSE },
  // l11: the board flips to 83%
  { a: W("Kabar"), b: W("83%"), to: BOARD_POSE },
  // l12: low on the small map tray
  { a: W("Yang", 3), b: WE("modal"), to: { pos: [2.2, 14.6, 13.4], tgt: [2.2, 0.3, 10.9] } },
  // l13: crane back over the whole gallery corner
  { a: W("Soal"), b: W("Kita"), to: { pos: [0.8, 13.0, 38.0], tgt: [1.0, 2.6, 4.0] } },
];

const cameraAt = (t: number) => {
  let cur = COVER_POSE;
  for (const m of MOVES) {
    if (t >= m.b) {
      cur = m.to;
      continue;
    }
    if (t > m.a) {
      const k = smooth((t - m.a) / (m.b - m.a));
      cur = { pos: lerp3(cur.pos, m.to.pos, k), tgt: lerp3(cur.tgt, m.to.tgt, k) };
    }
    break;
  }
  // living drift (zero on the cover frame)
  const d = ramp(t, W("Hampir"), W("Hampir") + 1.8);
  const pos: V3 = [cur.pos[0] + Math.sin(t * 0.37) * 0.22 * d, cur.pos[1] + Math.sin(t * 0.29 + 1) * 0.14 * d, cur.pos[2]];
  return { position: pos, target: cur.tgt, fov: COVER_CAMERA.fov };
};

// ---------- avatar ----------
const BOARD_SPOT: V3 = [-5.8, 0, 2.0];
const PLINTH_EDGE: V3 = [-4.7, PLINTH_TOP, 1.6];
const ON_COIN: V3 = [COIN[0], PLINTH_TOP + 0.06, COIN[2]];
const TRAY_SPOT: V3 = [TRAY[0] + 2.7, 0, TRAY[2]];
const facing = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);

const run = (t: number, a: number, b: number, path: V3[]): AvatarState => {
  const k = smooth((t - a) / (b - a)) * (path.length - 1);
  const i = Math.min(path.length - 2, Math.floor(k));
  const p = lerp3(path[i], path[i + 1], k - i);
  const hop = path[i][1] !== path[i + 1][1] ? Math.sin((k - i) * Math.PI) * 0.8 : 0;
  return { pos: [p[0], p[1] + hop, p[2]], rot: facing(path[i], path[i + 1]), pose: "run", seed: 2 };
};
const at = (pos: V3, rot: number, pose: AvatarPose): AvatarState => ({ pos, rot, pose, seed: 2 });

const avatarAt = (t: number, rise: number, coinUp: number): AvatarState => {
  const a = avatarRaw(t, rise, coinUp);
  return t >= W("Tapi") ? { ...a, scale: 0.5 } : a;
};
const avatarRaw = (t: number, rise: number, coinUp: number): AvatarState => {
  const tRun1 = W("Data");
  if (t < tRun1) return WORLD_COVER.avatar;
  if (t < W("2026:")) return run(t, tRun1, W("2026:"), [ON_COIN, PLINTH_EDGE, BOARD_SPOT]);
  // teleports happen mid-pan, while both places are out of frame
  const mid = (m: { a: number; b: number }) => (m.a + m.b) / 2;
  if (t < mid({ a: W("Artinya"), b: W("lama") })) return at(BOARD_SPOT, 0.35, "wave");
  if (t < mid({ a: WE("breakout"), b: W("Grow") })) {
    const pose: AvatarPose = rise >= 1 ? "cheer" : rise > 0 ? "stand" : "think";
    return at(raceTop(rise), -0.35, pose);
  }
  if (t < mid({ a: WE("sekaligus"), b: W("bulan", 2) })) {
    return at([STATION.D, PLINTH_TOP, 0.6], 0, t >= W("orang") ? "cheer" : t >= W("dimainkan") ? "point" : "think");
  }
  if (t < W("Tapi")) return at(DEVEX_SPOT, 1.25, t >= W("5") ? "cheer" : "type");
  const y = PLINTH_TOP + 0.06 * coinUp;
  if (t < W("median")) return at(BOARD_SPOT, 0.35, t >= W("65,7") ? "wave" : "think");
  if (t < W("1.500")) return run(t, W("median"), W("1.500"), [BOARD_SPOT, PLINTH_EDGE, [COIN[0], PLINTH_TOP, COIN[2]]]);
  if (t < W("Kabar")) return at([COIN[0], y, COIN[2]], 0.32, "wave");
  if (t < W("83%")) return run(t, W("Kabar"), W("83%"), [[COIN[0], y, COIN[2]], PLINTH_EDGE, BOARD_SPOT]);
  if (t < W("Yang", 3)) return at(BOARD_SPOT, 0.35, "wave");
  if (t < WE("modal")) return run(t, W("Yang", 3), WE("modal"), [BOARD_SPOT, [-4.6, 0, 4.4], [TRAY_SPOT[0], 0, 4.4], TRAY_SPOT]);
  if (t < W("Kita")) return at(TRAY_SPOT, -1.45, "type");
  return at(TRAY_SPOT, -0.3, "wave");
};

// ---------- whole world state at time t ----------
const worldAt = (t: number) => {
  const reset = t >= W("cuma") && t < W("65,7");
  const g10 = t < W("cuma") ? 1 : reset ? 0 : grow(t, W("65,7"), W("65,7") + 1.2);
  const g100 = t < W("cuma") ? 1 : reset ? 0 : grow(t, W("10,8"), W("10,8") + 0.8);
  const g1000 = t < W("cuma") ? 1 : reset ? 0 : grow(t, W("1,4"), W("1,4") + 0.5);
  const gCoin = t < W("cuma") ? 1 : reset ? 0 : grow(t, W("1.500"), W("1.500") + 0.5);
  const lit =
    t < W("Data") ? 28 : t < W("28%") ? 28 * (1 - ramp(t, W("Data"), W("Data") + 0.4)) : 28 * clamp01((t - W("28%")) / 1.6);
  const push = ramp(t, W("90"), WE("hari")) * (1 - ramp(t, W("Artinya"), W("Artinya") + 0.8));
  const flip = ramp(t, W("83%"), W("83%") + 1.6);
  const rise = grow(t, W("menyalip"), W("menyalip") + 1.3);
  const state: WorldState = {
    g10,
    g100,
    g1000,
    gCoin,
    board: { lit: Math.round(lit), push, flip },
    avatar: avatarAt(t, rise, gCoin > 0.5 ? 1 : 0),
    tag1000: 1 - ramp(t, W("median"), W("median") + 0.3) * (1 - ramp(t, W("Jadi"), W("Jadi") + 0.3)),
    // sink the other sculptures into the plinth while the camera pushes in on the coin; rise again on "Jadi"
    isolate: ramp(t, W("median") + 0.3, W("median") + 1.0) * (1 - ramp(t, W("Jadi"), W("Jadi") + 0.8)),
    hideFG: t >= W("Yang", 3) + 0.8,
  };
  return { state, rise };
};

/** Film-only support posts under the raised pegboard (the cover hides them behind the avatar). */
const BoardPosts: React.FC = () => (
  <>
    {(
      [
        [-4.69, -1.89],
        [-0.11, -3.31],
      ] as [number, number][]
    ).map(([x, z]) => (
      <mesh key={x} castShadow receiveShadow position={[x, PLINTH_TOP + 1.1, z]}>
        <RoundedBoxGeo args={[0.26, 2.2, 0.26]} radius={0.04} />
        <meshPhysicalMaterial color={P.machinedAluminum} metalness={0.9} roughness={0.28} />
      </mesh>
    ))}
  </>
);

/** Same easing as Hook.tsx sinkY, so the posts stay under the board. */
const sinkOf = (iso: number) => -iso * iso * (3 - 2 * iso) * 16;

const World: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const cam = cameraAt(t);
  const { state, rise } = worldAt(t);
  const dist = Math.hypot(cam.position[0] - cam.target[0], cam.position[1] - cam.target[1], cam.position[2] - cam.target[2]);
  return (
    <>
      <HookWorld f={f} camera={cam} state={state}>
        <group position={[0, sinkOf(state.isolate ?? 0), 0]}>
          <BoardPosts />
        </group>
        <GalleryExtension />
        <RaceStation
          rise={rise}
          lamaTag={ramp(t, W("lama"), W("lama") + 0.3)}
          newTag={ramp(t, W("Map"), W("Map") + 0.3)}
          nameTag={ramp(t, W("Ninety"), W("Ninety") + 0.3)}
          breakoutTag={ramp(t, W("breakout"), W("breakout") + 0.3)}
        />
        <PlayersStation
          fill={0.15 * ramp(t, W("Grow"), W("dimainkan")) + 0.85 * grow(t, W("dimainkan"), W("orang"))}
          gagTag={ramp(t, W("Grow"), W("Grow") + 0.3)}
          sabTag={ramp(t, W("Steal"), W("Steal") + 0.3)}
          bigTag={ramp(t, W("20"), W("20") + 0.35)}
        />
        <DevExStation
          s1={grow(t, W("kreator"), W("dolar"))}
          s2={grow(t, W("totalnya"), W("5") + 0.4)}
          tag1={ramp(t, W("1,7"), W("1,7") + 0.35)}
          tag2={ramp(t, W("5"), W("5") + 0.35)}
          consoleOn={ramp(t, W("DevEx"), W("DevEx") + 0.3) * (0.7 + 0.3 * Math.sin(t * 6))}
        />
        <CreatorsPlaque k={ramp(t, W("42.000"), W("42.000") + 0.35) * (1 - ramp(t, W("1.500"), W("1.500") + 0.3))} />
        <MapTray f={f} build={clamp01((t - W("tapi", 3)) / (W("betah") - W("tapi", 3)))} players={ramp(t, W("betah"), W("betah") + 1.0)} tag={ramp(t, W("supaya"), W("supaya") + 0.3)} />
      </HookWorld>
      <Finish
        frame={Math.round(f)}
        background={BG}
        profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
        exposure={1}
        envIntensity={0.55}
        hdri="studio"
        ao
        focus={(dist * 27.5) / 29.73}
        aperture={0.0009}
        maxBlur={0.006}
      />
    </>
  );
};

// ---------- HUD: a thin brass measuring rail on the left edge that scrolls with the camera ----------
const Ruler: React.FC<{ t: number }> = ({ t }) => {
  const { height } = useVideoConfig();
  const u = height / 1920;
  const cam = cameraAt(t);
  const vis = ramp(t, WE("bulan"), WE("bulan") + 0.6) * (1 - ramp(t, TL.voEnd, TL.voEnd + 0.5));
  if (vis <= 0) return null;
  const off = ((cam.target[1] * 60) % 60) * u;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.45 * vis }}>
      <div style={{ position: "absolute", left: 30 * u, top: 220 * u, height: 1280 * u, width: 40 * u, overflow: "hidden" }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: i * 60 * u + off - 60 * u,
              width: (i % 5 === 0 ? 34 : 16) * u,
              height: 2 * u,
              background: "#D2B07A",
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2 * u, background: "#D2B07A" }} />
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const ready = useEp02Ready();
  const head = 1 - ramp(t, W("umurnya") - 0.3, W("umurnya") + 0.2);
  const outroAt = TL.voEnd + 0.6;
  const outro = ramp(t, outroAt + 0.4, outroAt + 0.5); // canvas stops once the opaque outro card is in
  return (
    <AbsoluteFill style={{ background: BG }}>
      {ready && outro < 1 ? (
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: COVER_CAMERA.position, fov: COVER_CAMERA.fov, near: 0.1, far: 140 }}>
          <World t={t} f={f} />
        </ThreeCanvas>
      ) : null}
      {ready && head > 0 ? (
        <AbsoluteFill style={{ opacity: head }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
            <Headline />
          </div>
        </AbsoluteFill>
      ) : null}
      {ready ? <Ruler t={t} /> : null}
      {ready ? <DataChips /> : null}
      {ready ? <Captions /> : null}
      <AudiraOutro seconds={TL.total - outroAt} />
      <AudiraSignature seed="roblox-map-baru-ep02" />
    </AbsoluteFill>
  );
};
