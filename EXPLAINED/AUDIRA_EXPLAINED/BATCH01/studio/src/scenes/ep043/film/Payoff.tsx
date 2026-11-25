// Payoff: how cloudy is too cloudy? Three glasses against a painted NTU strip.
import React from "react";
import { C, GLASS_A, Glass, waterBody } from "../Cover.tsx";
import { Tag } from "./ui.tsx";
import { Key, SEC, camAt, layerT, proj, ramp, wt } from "./util.ts";

type G = typeof GLASS_A;
const mk = (cx: number): G => ({ cx, rim: 860, bot: 1190, rt: 108, rb: 86, water: 920 });
const G1 = mk(250);
const G2 = mk(540);
const G3 = mk(830);

// NTU strip positions (not to scale above 10: "ribuan" sits at the far end)
const X3 = 330;
const X4 = 430;

export const Payoff: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 30;
  const keys: Key[] = [
    [SEC.PAYOFF[0] - 0.1, 530, 900, 1.04],
    [wt("tiga") + 0.2, 520, 860, 1.08],
    [wt("kekeruhan") - 0.1, 545, 860, 1.08],
    [SEC.OUTRO[0], 540, 900, 1.0],
  ];
  const cam = camAt(keys, t);
  const zone = ramp(t, wt("bawah", 1) - 0.1, wt("tiga") + 0.2);
  const eye = ramp(t, wt("terlihat") - 0.1, wt("empat") + 0.2);
  const p3 = proj(cam, X3, 600, 1);
  const p4 = proj(cam, X4, 600, 1);
  return (
    <g>
      <g transform={layerT(cam, 0.7)}>
        <rect x={-700} y={-700} width={2500} height={2200} fill={C.wallWash} opacity={0.75} filter="url(#wcFlat)" />
        <rect x={-700} y={-700} width={2500} height={2200} fill="url(#sunG)" />
      </g>
      <g transform={layerT(cam, 1)}>
        {/* painted NTU strip */}
        <defs>
          <linearGradient id="ntuG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#DCEFF6" />
            <stop offset="0.35" stopColor="#E6DCC8" />
            <stop offset="1" stopColor="#8A5A34" />
          </linearGradient>
        </defs>
        <rect x={80} y={540} width={920} height={70} rx={10} fill="url(#ntuG)" filter="url(#wcSoft)" />
        <rect x={84} y={544} width={(X3 - 84) * zone} height={62} rx={8} fill={C.sage} opacity={0.55} filter="url(#wcFine)" />
        <rect x={80} y={540} width={920} height={70} rx={10} fill="none" stroke={C.graphite} strokeWidth={2.4} opacity={0.6} filter="url(#pencil)" />
        {[
          [100, "0"],
          [X3, "3"],
          [X4, "4"],
          [960, "ribuan"],
        ].map(([x, l], i) => (
          <g key={i}>
            <line x1={x as number} y1={530} x2={x as number} y2={620} stroke={C.graphite} strokeWidth={4} filter="url(#pencil)" />
            <text x={x as number} y={665} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={36} fill="#2C2723">
              {l}
            </text>
          </g>
        ))}
        <path d="M600,575 l40,0 m60,0 l40,0" stroke={C.graphite} strokeWidth={3} strokeDasharray="6 8" opacity={0.6} />
        <text x={540} y={515} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill={C.umber}>
          kekeruhan (NTU)
        </text>
        {/* counter */}
        <rect x={-500} y={1180} width={2100} height={70} fill={C.wood} filter="url(#wc)" />
        <rect x={-500} y={1248} width={2100} height={700} fill={C.cabinet} filter="url(#wcFlat)" />
        {/* glasses with pencil arrows to the strip */}
        <Glass g={G1} murky={false} f={f} />
        <Glass g={G2} murky={false} f={f} />
        <path d={waterBody(G2)} fill={C.kopi} opacity={0.22 * eye + 0.08} filter="url(#wcSoft)" />
        <Glass g={G3} murky f={f} />
        <g filter="url(#pencil)" stroke={C.graphite} strokeWidth={3} fill="none" strokeDasharray="10 8">
          <path d={`M${G1.cx},${G1.rim - 30} C${G1.cx},720 ${X3},720 ${X3},630`} opacity={zone} />
          <path d={`M${G2.cx},${G2.rim - 30} C${G2.cx},720 ${X4},720 ${X4},630`} opacity={eye} />
          <path d={`M${G3.cx},${G3.rim - 30} C${G3.cx},720 960,720 960,690`} opacity={0.6} />
        </g>
      </g>
      <Tag t={t} at={wt("tiga") - 0.05} x={420} y={250} size={40} text="standar air minum: < 3 NTU" sub="Permenkes 2/2023" anchor={p3} accent={C.sage} />
      <Tag t={t} at={wt("empat") - 0.05} x={600} y={390} size={40} text="± 4 NTU: mulai terlihat mata" anchor={p4} accent={C.river} />
    </g>
  );
};
