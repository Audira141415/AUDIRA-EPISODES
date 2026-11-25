// Kitchen world (the approved cover, now alive): hook, arrival of the silt, and the practical outro.
import React from "react";
import { C, Cobek, Counter, Faucet, GLASS_A, GLASS_B, Glass, RevealHole, Stream, Towel, Wall } from "../Cover.tsx";
import { Tag } from "./ui.tsx";
import { Key, camAt, clamp01, layerT, lerp, proj, ramp, wt, SEC, TL } from "./util.ts";

export type KitchenMode = "hook" | "arrive" | "outro";

const HOOK_KEYS = (): Key[] => [
  [0, 420, 960, 1.8],
  [wt("padahal") - 0.25, 420, 980, 1.55],
  [wt("kemarin") + 0.2, 720, 1110, 1.65],
  [wt("apa") - 0.05, 700, 1090, 1.55],
  [wt("terjadi") + 0.35, 540, 930, 1.0],
  [SEC.KONTEKS[0] - 0.15, 690, 770, 1.9],
];

const ARRIVE_KEYS = (): Key[] => [
  [wt("keranmu") - 0.1, 420, 820, 2.1],
  [SEC.PAYOFF[0], 430, 1000, 1.6],
];

const OUTRO_KEYS = (): Key[] => [
  [SEC.OUTRO[0] - 0.1, 470, 980, 1.35],
  [wt("buka") + 0.1, 420, 900, 1.75],
  [wt("jangan") - 0.1, 430, 980, 1.7],
  [wt("jangan") + 0.4, 470, 1080, 1.55],
  [wt("lapor") - 0.15, 640, 1080, 1.5],
  [wt("lapor") + 0.5, 760, 1090, 1.55],
  [wt("pernah") - 0.1, 600, 1020, 1.25],
  [TL.total, 540, 940, 1.0],
];

/** Phone lying on the counter, generic paper cut-out (no app/brand marks). */
const Phone: React.FC<{ on: number }> = ({ on }) => (
  <g transform="translate(720 1168) rotate(-8)">
    <ellipse cx={8} cy={128} rx={86} ry={14} fill="#4a3424" opacity={0.25} filter="url(#blur6)" />
    <rect x={-70} y={-120} width={140} height={250} rx={22} fill={C.graphite} filter="url(#wcFine)" />
    <rect x={-58} y={-104} width={116} height={214} rx={12} fill={on > 0 ? "#EAF3F6" : "#55606a"} filter="url(#wcFine)" />
    {on > 0 && (
      <g opacity={on}>
        <rect x={-46} y={-86} width={86} height={30} rx={10} fill={C.clear} />
        <rect x={-36} y={-44} width={80} height={34} rx={10} fill={C.ochre} opacity={0.85} />
        <circle cx={-20} cy={22} r={22} fill={C.kopi} />
        <path d="M-6,70 l24,0" stroke={C.graphite} strokeWidth={4} strokeLinecap="round" />
      </g>
    )}
  </g>
);

export const Kitchen: React.FC<{ t: number; mode: KitchenMode }> = ({ t, mode }) => {
  const f = t * 30;
  const keys = mode === "hook" ? HOOK_KEYS() : mode === "arrive" ? ARRIVE_KEYS() : OUTRO_KEYS();
  const cam = camAt(keys, t);

  // stream + glass state per mode, all keyed to VO words
  let len = 1;
  let mix = 0;
  let levelA = GLASS_A.water;
  if (mode === "hook") {
    len = ramp(t, wt("keran") + 0.05, wt("dibuka") + 0.35);
    levelA = lerp(GLASS_A.bot - 20, GLASS_A.water, ramp(t, wt("dibuka") + 0.2, wt("susu") + 0.4));
  } else if (mode === "arrive") {
    const t0 = wt("keranmu") - 0.05;
    len = ramp(t, t0, t0 + 0.35);
    levelA = lerp(GLASS_A.bot - 20, GLASS_A.water + 120, ramp(t, t0 + 0.3, SEC.PAYOFF[0]));
  } else {
    mix = ramp(t, wt("buka") + 0.15, wt("jernih") + 0.35);
  }

  const glassScreen = proj(cam, GLASS_A.cx, GLASS_A.rim, 1);
  const glassB = proj(cam, GLASS_B.cx, GLASS_B.rim, 1);
  const tap = proj(cam, 420, 800, 1);

  return (
    <g>
      <g transform={layerT(cam, 0.82)}>
        <Wall />
        <rect x={-200} y={-200} width={1480} height={1500} fill="url(#sunG)" />
        <g filter="url(#paperShadow)">
          <RevealHole f={f} />
        </g>
        {mode === "hook" && (
          <path
            d="M872,602 C872,560 940,548 948,590 C954,624 908,628 906,662 M906,700 l0,6"
            stroke={C.ochre}
            strokeWidth={16}
            strokeLinecap="round"
            fill="none"
            opacity={ramp(t, wt("apa"), wt("terjadi") + 0.2)}
            strokeDasharray={420}
            strokeDashoffset={420 * (1 - ramp(t, wt("apa"), wt("terjadi") + 0.25))}
            filter="url(#wc)"
          />
        )}
      </g>
      <g transform={layerT(cam, 1)}>
        <Counter />
        <Towel />
        <Faucet />
        <Glass g={GLASS_B} murky={false} f={f} />
        <Glass g={{ ...GLASS_A, water: levelA }} murky f={f} />
        <Stream f={f} len={len} mix={mix} bottom={levelA} />
        {mode === "outro" && <Phone on={ramp(t, wt("lapor") - 0.2, wt("lapor") + 0.2)} />}
      </g>
      <g transform={layerT(cam, 1.12)}>
        <Cobek />
      </g>
      {/* HUD */}
      {mode === "hook" && (
        <>
          <Tag t={t} at={wt("kopi") - 0.05} until={wt("padahal") - 0.1} x={glassScreen[0] + 250} y={330} text="kopi susu?" anchor={[glassScreen[0] + 60, glassScreen[1] + 140]} />
          <Tag t={t} at={wt("kemarin")} until={wt("apa") + 0.1} x={540} y={330} text="kemarin: bening" anchor={[glassB[0], glassB[1] + 60]} accent={C.clear} />
        </>
      )}
      {mode === "outro" && (
        <>
          <Tag t={t} at={wt("buka")} until={wt("jangan") - 0.1} x={600} y={300} text="buka sebentar" sub="sampai airnya jernih" anchor={[tap[0] + 10, tap[1] + 110]} accent={C.clear} />
          <Tag t={t} at={wt("jangan")} until={wt("lapor") - 0.1} x={560} y={300} text="jangan diminum dulu" anchor={[glassScreen[0], glassScreen[1] + 40]} cross={false} accent={C.chili} />
          <Tag t={t} at={wt("lapor")} until={wt("pernah") - 0.05} x={560} y={300} text="lapor ke PDAM" accent={C.ochre} />
        </>
      )}
      {mode === "outro" && t > wt("jangan") && t < wt("lapor") - 0.1 && (
        <g transform={`translate(${glassScreen[0]} ${glassScreen[1] + 150})`} opacity={clamp01((t - wt("jangan") - 0.2) / 0.3)} filter="url(#wcFine)">
          <line x1={-110} y1={-110} x2={110} y2={110} stroke={C.chili} strokeWidth={18} strokeLinecap="round" />
          <line x1={110} y1={-110} x2={-110} y2={110} stroke={C.chili} strokeWidth={18} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
