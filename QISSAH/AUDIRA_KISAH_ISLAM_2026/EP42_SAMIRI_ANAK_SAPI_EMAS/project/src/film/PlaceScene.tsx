import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { ShotCanvas } from "../kits/chronicle/ShotCanvas.tsx";
import { DAY, DUSK, GOLDEN, INFERNO, MORNING, NIGHT, ROOM_DAY, ROOM_NIGHT } from "../kits/chronicle/looks.ts";
import type { Look } from "../kits/chronicle/Stage.tsx";
import { Figure } from "../kits/chronicle/Figure.tsx";
import { camAt, handheld } from "../kits/chronicle/cam.ts";
import { SETS, type V3 } from "./sets.tsx";
import { GURUN_SOLO_A } from "./sinai.tsx";
import { shotKeys, stageCast } from "./stage.ts";
import type { MoodId, PlanScene } from "../director/types.ts";
import { Solid } from "../core/qa/scene-qa.tsx";

const WIDE_FOV = 0.84;

const LOOKS: Record<MoodId, Look> = {
  senja: GOLDEN, biru: DUSK, malam: NIGHT, pagi: MORNING, siang: DAY, api: INFERNO, "dalam-siang": ROOM_DAY, "dalam-malam": ROOM_NIGHT,
};

/** Look for the set: outdoor looks get the set's own fog scale; fire overrides the night. */
const lookFor = (sc: NonNullable<PlanScene["place"]>): Look => {
  let L = LOOKS[sc.mood];
  if (sc.fire && sc.mood !== "dalam-malam" && sc.mood !== "dalam-siang") L = { ...INFERNO, fog: { color: "#4a2219", density: 0.012 }, key: { ...INFERNO.key, pos: [10, 22, -60] } };
  if (sc.volcano) L = { ...INFERNO, fog: { color: "#5a281c", density: 0.00042 }, key: { ...INFERNO.key, pos: [40, 60, -120], intensity: 2.8 } };
  if (sc.fog) L = { ...L, fog: { ...L.fog, density: L.fog.density * 1.6 } };
  if (sc.set === "pelabuhan" || sc.set === "dek" || sc.set === "pantai" || sc.set === "laut") L = { ...L, fog: { ...L.fog, density: Math.min(L.fog.density, 0.004) } };
  return L;
};

export const PlaceScene: React.FC<{ scene: PlanScene; s: number; frame: number }> = ({ scene, s, frame }) => {
  const P = scene.place!;
  const set0 = SETS[P.set];
  // gurun without the altar: the stage is the open sand in front of the camp
  const set = P.set === "gurun" && !(P.extras ?? []).includes("patung") ? { ...set0, anchors: GURUN_SOLO_A } : set0;
  const dur = scene.b - scene.a;
  const dark = P.mood === "malam" || P.mood === "dalam-malam" || P.mood === "dalam-siang" || P.fire;
  const actors = useMemo(() => stageCast(P.groups, set.anchors, dur, P.seed, dark), [P, set, dur, dark]);
  const look = lookFor(P);
  // shadows follow the stage
  const lk: Look = {
    ...look,
    key: { ...look.key, pos: set.anchors.light && !P.fire ? set.anchors.light : look.key.pos, shadow: look.key.shadow ? { ...look.key.shadow, at: [set.anchors.lead[0], 0, set.anchors.lead[2] - 2] } : undefined },
    hemi: set.anchors.light ? { ...look.hemi, intensity: look.hemi.intensity * 1.25 } : look.hemi,
  };

  // which beat are we in (local time)
  const beats = P.beats.map((b) => ({ ...b, a: b.a - scene.a, b: b.b - scene.a }));
  const bi = Math.max(0, beats.findIndex((b) => s >= b.a && s < b.b));
  const beat = beats[bi] ?? beats[beats.length - 1];
  const leadA = actors.find((a) => a.lead) ?? actors[0];
  const focusAt = (t: number): V3 => (leadA ? leadA.at(t).pos : set.anchors.lead);
  const groupAt = (t: number): V3 => {
    if (!actors.length) return set.anchors.lead;
    // a moving lead: frame the pack, not the bystanders
    const pool = leadA?.moving ? actors.filter((a) => a.moving) : actors;
    const vis = pool.slice(0, 12).map((a) => a.at(t).pos);
    return [vis.reduce((x, p) => x + p[0], 0) / vis.length, 0, vis.reduce((x, p) => x + p[2], 0) / vis.length];
  };
  const side = bi % 2 ? -1 : 1;
  const keys = shotKeys(beat.shot, beat.a, beat.b, focusAt, groupAt, set.anchors, !!leadA?.seated, side, !!leadA?.moving);
  const shot0 = handheld(camAt(keys, s), s, { drift: 0.0035, seed: P.seed });
  // 16:9: the camera grammar is tuned for a narrow 9:16 frame; narrow the vertical fov so a landscape frame shows
  // about twice the portrait width, not three times (sets stay dressed to their edges, people stay readable)
  const { width, height } = useVideoConfig();
  const shot = width > height ? { ...shot0, fov: (2 * Math.atan(Math.tan((shot0.fov * Math.PI) / 360) * WIDE_FOV) * 180) / Math.PI } : shot0;

  const Comp = set.Comp;
  return (
    <ShotCanvas shot={shot} look={lk} frame={frame}>
      <Comp t={s} fire={P.fire} rain={P.rain} fog={P.fog} candle={P.candle} volcano={P.volcano} seed={P.seed} mood={P.mood} extras={P.extras ?? []} />
      {actors.map((a) => {
        const st = a.at(s);
        // <Solid>: each figure for the scene QA (scripts/qa-scene.mjs)
        return <Solid key={a.id} id={`fig${a.id}`}><Figure id={a.id} pos={st.pos} rotY={st.rotY} pose={st.pose} look={a.costume as never} outline={a.color} gain={a.gain} t={s + a.id} /></Solid>;
      })}
    </ShotCanvas>
  );
};
