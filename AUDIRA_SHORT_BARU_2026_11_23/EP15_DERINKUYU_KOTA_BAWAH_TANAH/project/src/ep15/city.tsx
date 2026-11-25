// The Derinkuyu city cutaway: 8 opened levels in a 960 × 930 tuff slab (surface y=0, 85 m at y=930).
import React from "react";
import { C, Cavity, Lamp, Person, Slab, Chimney, Flow, vault, ramp, ease, lerp } from "./pieces";

export const CW = 960;
export const CH = 930;
export const LEVEL_Y = (i: number) => 64 + i * 108;
const RH = 78;

const ROOMS: [number, number][][] = [
  [[40, 150], [262, 180], [560, 120], [790, 130]],
  [[100, 200], [380, 140], [560, 60], [740, 180]],
  [[30, 160], [232, 220], [520, 100], [760, 160]],
  [[80, 140], [300, 160], [520, 90], [780, 140]],
  [[40, 200], [280, 140], [480, 110], [700, 220]],
  [[120, 180], [360, 200], [600, 90], [800, 120]],
  [[50, 160], [260, 160], [480, 120], [740, 180]],
  [[70, 200], [700, 200]],
];
export const AIR_X = [210, 470, 900];
export const WELL_X = 652;
export const WELL_TOP = LEVEL_Y(2) + RH + 6;

export type CityFx = {
  people?: number; // 0..1 fill people
  air?: number; // 0..1 air flow
  airLit?: number; // seconds since air started (levels light up)
  well?: number; // 0..1 well highlight
  tenPct?: number; // 0..1 only top-left part lit
  levels?: number; // number of levels visible (fractional grows)
  ghost?: number; // 0..1 draw as cyan ghost only
};

const churchPath = (cx: number, y: number) => {
  const w = 230, h = RH + 20, a = 56;
  return `M${cx - a / 2},${y - 22} h${a} v22 h${(w - a) / 2} v${h} h${-w} v${-h} h${(w - a) / 2} Z`;
};

export const City: React.FC<{ x: number; y: number; s: number; t: number; fx?: CityFx; id: string; surface?: boolean; top?: string }> = ({
  x, y, s, t, fx = {}, id, surface = true, top,
}) => {
  const lv = fx.levels ?? 8;
  const ten = fx.tenPct ?? 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Slab x={0} y={0} w={CW} h={CH} id={`city-${id}`} seed={7} top={top} depth={80}>
        {/* air shafts */}
        {AIR_X.map((ax, i) => (
          <rect key={`a${i}`} x={ax - 8} y={0} width={16} height={LEVEL_Y(Math.min(7, Math.ceil(lv) - 1)) + RH} fill="url(#cavG)" stroke={C.cyan} strokeOpacity={0.6} strokeWidth={1.5} />
        ))}
        {/* ramps between levels */}
        {Array.from({ length: 7 }, (_, i) => {
          if (i + 1 >= lv) return null;
          const rx = 150 + ((i * 263) % 640);
          const y0 = LEVEL_Y(i) + RH - 18, y1 = LEVEL_Y(i + 1) + RH - 18;
          const dir = i % 2 ? -1 : 1;
          return <path key={`r${i}`} d={`M${rx},${y0} L${rx + dir * 80},${y1} L${rx + dir * 80 + 26},${y1} L${rx + 26},${y0} Z`} fill="url(#cavG)" />;
        })}
        {/* well (does not reach the surface) */}
        <rect x={WELL_X - 13} y={WELL_TOP} width={26} height={CH - WELL_TOP} fill="url(#cavG)" />
        <rect x={WELL_X - 13} y={CH - 70} width={26} height={70} fill={C.water} opacity={0.9} />
        {/* rooms */}
        {ROOMS.map((row, li) => {
          const vis = ramp(lv, li, li + 1);
          if (vis <= 0) return null;
          const yy = LEVEL_Y(li);
          return (
            <g key={li}>
              {row.map(([rx, rw], ri) => {
                const ww = rw * ease(vis);
                const lit = ((li * 5 + ri * 3) % 4) === 0;
                return <Cavity key={ri} d={vault(rx + (rw - ww) / 2, yy, ww, RH)} glow={lit && vis > 0.9 ? [rx + rw / 2, yy + RH - 10, 46] : undefined} />;
              })}
              {li === 7 && vis > 0 ? <Cavity d={churchPath(480, yy)} glow={[480, yy + RH, 80]} /> : null}
              {li === 7 && vis > 0.5 ? (
                <g transform={`translate(480,${yy + 40})`} opacity={ease((vis - 0.5) * 2)}>
                  <rect x={-5} y={-26} width={10} height={52} fill={C.lamp} />
                  <rect x={-18} y={-12} width={36} height={10} fill={C.lamp} />
                </g>
              ) : null}
            </g>
          );
        })}
        {/* lamps */}
        {[[120, 0], [600, 1], [330, 3], [860, 4], [180, 6], [560, 5]].map(([lx, li], i) =>
          li < lv - 0.5 ? <Lamp key={`l${i}`} x={lx} y={LEVEL_Y(li) + RH - 34} t={t} s={0.55} ph={i * 1.7} /> : null,
        )}
        {/* people */}
        {(fx.people ?? 0) > 0 || fx.airLit !== undefined
          ? ROOMS.flatMap((row, li) =>
              row.map(([rx, rw], ri) => {
                const k = li * 4 + ri;
                const pop = ramp(fx.people ?? 1, (k / 30) * 0.8, (k / 30) * 0.8 + 0.2);
                if (pop <= 0 || li >= lv) return null;
                const air = fx.airLit === undefined ? 0 : ramp(fx.airLit, 1.6 + li * 0.22, 2.0 + li * 0.22);
                const n = rw > 150 ? 3 : rw > 100 ? 2 : 1;
                return (
                  <g key={`p${k}`} opacity={pop}>
                    {Array.from({ length: n }, (_, j) => (
                      <Person key={j} x={rx + rw * ((j + 1) / (n + 1))} y={LEVEL_Y(li) + RH - 4} s={0.4 + 0.1 * pop} col={air > 0.5 ? C.cyanLt : "#f2e3cc"} glow={air} t={t} ph={k + j} />
                    ))}
                  </g>
                );
              }),
            )
          : null}
        {/* air flow */}
        {fx.air
          ? AIR_X.map((ax, i) => (
              <g key={`f${i}`}>
                <Flow d={`M${ax},-60 L${ax},${lerp(0, CH - 40, ease(fx.air ?? 0))}`} t={t + i * 0.3} p={fx.air ?? 0} />
                {Array.from({ length: 8 }, (_, li) => {
                  const yy = LEVEL_Y(li) + RH / 2;
                  const reach = ramp(fx.air ?? 0, li / 8, li / 8 + 0.15);
                  const dir = ax > 700 ? -1 : 1;
                  return <Flow key={li} d={`M${ax},${yy} l${dir * 70},0`} t={t} p={reach} w={5} speed={90} />;
                })}
              </g>
            ))
          : null}
        {/* well highlight */}
        {fx.well ? (
          <g opacity={fx.well}>
            <rect x={WELL_X - 13} y={lerp(CH, WELL_TOP, ease(fx.well))} width={26} height={CH - lerp(CH, WELL_TOP, ease(fx.well))} fill="none" stroke={C.orange} strokeWidth={5} />
            <path d={`M${WELL_X + 40},4 v${WELL_TOP - 8} M${WELL_X + 28},4 h24 M${WELL_X + 28},${WELL_TOP - 4} h24`} stroke={C.red} strokeWidth={5} fill="none" strokeDasharray="12 8" opacity={ease((fx.well - 0.5) * 2)} />
          </g>
        ) : null}
        {/* only 10% opened: grey out the rest */}
        {ten > 0 ? (
          <g>
            <path d={`M0,0 H${CW} V${CH} H0 V${LEVEL_Y(2) + RH + 14} H330 V0 Z`} fill="#3e4a50" opacity={0.55 * ten} />
            <rect x={0} y={0} width={330} height={LEVEL_Y(2) + RH + 14} fill="none" stroke={C.orange} strokeWidth={6} opacity={ten} />
            {[0, 1, 2].map((li) => (
              <Person key={li} x={60 + ((t * 40 + li * 90) % 230)} y={LEVEL_Y(li) + RH - 4} s={0.45} col={C.orange} pose="walk" t={t} ph={li} />
            ))}
          </g>
        ) : null}
        {fx.ghost ? <rect x={0} y={0} width={CW} height={CH} fill={C.studio} opacity={fx.ghost * 0.85} /> : null}
      </Slab>
      {surface ? (
        <g>
          {[[60, 120, 0], [190, 170, 1], [330, 90, 2], [760, 150, 3], [880, 110, 4]].map(([cx, h, i]) => (
            <g key={i} transform={`translate(${36 + (cx as number) * 0.06},${-30})`}>
              <Chimney x={cx as number} y={6} h={h as number} col={i % 2 ? C.t1 : "#e4bf92"} />
            </g>
          ))}
          {[[470, 0], [590, 1]].map(([hx, i]) => (
            <g key={`h${i}`} transform={`translate(${hx},-6)`}>
              <rect x={-44} y={-62} width={88} height={62} fill={C.stone} />
              <rect x={-44} y={-62} width={88} height={62} fill="url(#sheen)" />
              <path d={vault(-12, -40, 24, 40)} fill={C.cav} />
              <rect x={-50} y={-68} width={100} height={8} fill="#d8c4a2" />
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
};
