// EP01 Sejarah Islam: Al-Qarawiyyin (MOSAICFORGE). One continuous world grown from the cover:
// a mosaic panel on the floor of a plaster arcade re-lays itself picture by picture while 3D props
// rise out of it. Every event is anchored to a word of the locked voice (tl.ts).
//   hook        the mosaic iron door, four keys hovering over four gold lock plates (cover)
//   context     Fez; Guinness; the door turns into the plan of a small mosque
//   main        Kairouan -> Fez route; Fatimah al-Fihri (small, faceless, from behind); 859, walls
//               rise course by course; the well; "konon" chip
//   explanation the mosque grows (green roofs); study circle; ijazah sheet; library 1349; Ibnu Khaldun
//   payoff      back to the door, four keys go in and turn, the leaves open, the manuscript, 1963
//   outro       an oil lamp on an empty rehal on the rosette; AUDIRA outro card
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CameraRig } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { Tesserae, type Switch } from "./Tesserae.tsx";
import { Keys } from "./Keys.tsx";
import { Hall } from "./Hall.tsx";
import { MosqueWalls, Courtyard, Halaqah, Library, Vault, Lamp, Minaret, Plaque3D, VAULT_Z, SHELF_X } from "./World.tsx";
import { QarawiyyinHud, QarawiyyinCaptions, QarawiyyinOutro } from "./Hud.tsx";
import { qarawiyyinShot } from "./camera.ts";
import { P, MAP, PLAN, RING, ROSE } from "./picture.ts";
import { TL, W, ramp, OUTRO_AT } from "./tl.ts";

export const QARAWIYYIN_COVER_SECONDS = 4;
export const QARAWIYYIN_SECONDS = TL.total;

const SCHEDULE = (): Switch[] => [
  { at: 0, to: "door", focus: [0, 0] },
  { at: W("bukan"), to: "mosque", focus: [0, -1.2] },
  { at: W("abad", 0), to: "map", focus: [MAP.kairouan[0], MAP.kairouan[1]], speed: 5 },
  { at: W("menurut", 1), to: "mosque", focus: [MAP.fez[0], MAP.fez[1]], speed: 5 },
  { at: W("tumbuh"), to: "halaqah", focus: [RING.u, RING.v], speed: 3.6 },
  { at: W("tahun", 2), to: "library", focus: [0, 0], speed: 4.6 },
  { at: W("dijaga"), to: "door", focus: [0, -0.75], speed: 5 },
  { at: W("tempat"), to: "rosette", focus: [ROSE.u, ROSE.v], speed: 4.4 },
];
let SCHED: Switch[] | null = null;

const routeProgress = (t: number) => ramp(t, W("kairouan", 0) - 0.1, W("fez", 1) + 0.5);
const doorOpen = (t: number) => ramp(t, W("membukanya"), W("membukanya") + 1.7) * (1 - ramp(t, W("tempat") - 0.5, W("tempat") + 0.2));

/** The warm pool on the door is for the door beats; the plan, map and circle get a softer one. */
const spotLevel = (t: number) => {
  const off = ramp(t, W("bukan"), W("bukan") + 1.2) * (1 - ramp(t, W("dijaga") - 0.5, W("dijaga") + 0.8));
  const late = ramp(t, W("tempat"), W("tempat") + 1.2);
  return 1 - 0.6 * Math.max(off, late * 0.8);
};

export const QarawiyyinFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = qarawiyyinShot(frame, fps);
  const cam = shot.pos;
  SCHED = SCHED ?? SCHEDULE();
  const open = doorOpen(t);
  const showWorld = t < OUTRO_AT + 0.7;
  return (
    <AbsoluteFill style={{ background: P.room }}>
      {showWorld ? (
        <ThreeCanvas width={width} height={height} dpr={1} camera={{ position: shot.pos, fov: shot.fov, near: 0.05, far: 80 }}>
          <CameraRig shot={shot} near={0.05} far={80} />
          <Hall t={t} spot={spotLevel(t)} fill={ramp(t, W("1963") - 0.8, W("1963") + 0.8) * (1 - ramp(t, W("pusat"), W("pusat") + 1.5))} />
          <Minaret />
          <Tesserae t={t} schedule={SCHED} routeProgress={routeProgress} doorOpen={doorOpen} />
          <Keys t={t} open={open} />
          <MosqueWalls t={t} />
          <Courtyard t={t} />
          <Halaqah t={t} />
          <Library t={t} />
          <Vault t={t} open={open} />
          <Lamp t={t} />
          {/* 3D label plaques, standing in the world and turned to the lens */}
          <Plaque3D lines={["FEZ · MAROKO"]} pos={[0, 0.95, -4.05]} width={2.9} t={t} from={W("fez", 0) - 0.2} to={W("menurut", 0) - 0.1} cam={cam} />
          <Plaque3D lines={["KAIROUAN"]} pos={[MAP.kairouan[0], 0.55, -MAP.kairouan[1] + 0.35]} width={2.1} t={t} from={W("kairouan", 0) - 0.3} to={W("menurut", 1) + 0.2} cam={cam} />
          <Plaque3D lines={["FEZ"]} pos={[MAP.fez[0], 0.55, -MAP.fez[1] + 0.35]} width={1.5} t={t} from={W("fez", 1) - 0.2} to={W("menurut", 1) + 0.2} cam={cam} />
          <Plaque3D lines={["QARAWIYYIN", "orang-orang Kairouan"]} pos={[0, 0.8, 2.5]} width={3.0} t={t} from={W("qarawiyyin") - 0.1} to={W("menurut", 1) + 0.2} cam={cam} />
          <Plaque3D lines={["FATIMAH AL-FIHRI"]} pos={[0.75, 1.3, 2.2]} width={0.85} t={t} from={W("fatimah") - 0.1} to={W("memakainya") + 0.4} cam={cam} />
          <Plaque3D lines={["859"]} pos={[0, 1.05, -PLAN.v0 + 0.55]} width={1.5} big t={t} from={W("859") - 0.1} to={W("airnya") - 0.2} cam={cam} />
          <Plaque3D lines={["IJAZAH", "izin mengajar"]} pos={[0, 0.4, 2.0]} width={0.8} t={t} from={W("ijazah") + 0.3} to={W("tahun", 2) + 0.1} cam={cam} />
          <Plaque3D lines={["1349", "Sultan Abu Inan"]} pos={[3.1, 2.25, 0.5]} width={1.4} t={t} from={W("tahun", 2) + 0.6} to={W("ibnu", 1) - 0.1} cam={cam} />
          <Plaque3D lines={["IBNU KHALDUN"]} pos={[SHELF_X - 0.7, 1.65, -1.15]} width={1.5} t={t} from={W("ibnu", 1) - 0.1} to={W("ruang", 1) + 0.3} cam={cam} />
          <Plaque3D lines={["AL-QUR'AN ABAD KE-9", "ditulis di atas kulit hewan"]} pos={[0, 1.4, VAULT_Z - 0.35]} width={1.35} t={t} from={W("al-qur'an") - 0.1} to={W("tahun", 3) - 0.1} cam={cam} />
          <Plaque3D lines={["1963", "universitas negara"]} pos={[0, 2.9, -5.6]} width={3.6} big t={t} from={W("1963") - 0.1} to={W("pusat") + 0.3} cam={cam} />
          <Finish frame={frame} background={P.room} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.84} envIntensity={0.4} hdri="studio" ao focus={shot.focus} aperture={0.003} maxBlur={0.012} />
        </ThreeCanvas>
      ) : null}
      <QarawiyyinHud t={t} />
      <QarawiyyinCaptions t={t} />
      <QarawiyyinOutro t={t} />
      <AudiraSignature seed="sejarah-islam-ep01" handle="@AUDIRAQISSAH" outroSeconds={TL.total - OUTRO_AT} />
    </AbsoluteFill>
  );
};
