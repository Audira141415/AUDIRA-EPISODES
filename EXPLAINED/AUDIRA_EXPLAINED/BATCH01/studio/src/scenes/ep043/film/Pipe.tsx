// Suspect 2: the old distribution pipe under the street (longitudinal cutaway + cross-section).
import React from "react";
import { C, mulberry32 } from "../Cover.tsx";
import { BROWN, PipeRun } from "./Plant.tsx";
import { Dial, Tag } from "./ui.tsx";
import { Key, SEC, camAt, clamp01, cs, layerT, lerp, proj, ramp, shake, wt } from "./util.ts";

const PY0 = 1200; // pipe interior top
const PY1 = 1340; // pipe interior bottom
const X0 = -500;
const X1 = 1800;

const House: React.FC<{ x: number; y: number; s: number; roof: string; lit?: boolean }> = ({ x, y, s, roof, lit }) => (
  <g filter="url(#wcSoft)">
    <rect x={x - s / 2} y={y - s * 0.62} width={s} height={s * 0.62} fill="#F2E5CC" />
    <path d={`M${x - s * 0.64},${y - s * 0.56} L${x},${y - s * 1.02} L${x + s * 0.64},${y - s * 0.56} Z`} fill={roof} />
    <rect x={x - s * 0.3} y={y - s * 0.44} width={s * 0.22} height={s * 0.2} fill={lit ? C.ochre : "#9DB5BF"} />
    <rect x={x + s * 0.08} y={y - s * 0.38} width={s * 0.18} height={s * 0.38} fill={C.umber} />
  </g>
);

/** Street + soil + old pipe. mode a = clear water arriving, c = disturbance and transport. */
export const Underground: React.FC<{ t: number; mode: "a" | "c" }> = ({ t, mode }) => {
  const tDig = wt("diperbaiki");
  const tLeak = wt("bocor");
  const tPress = wt("tekanannya");
  const tStir = wt("teraduk");
  const keysA: Key[] = [
    [SEC.REVEAL[0] - 0.1, 560, 560, 1.0],
    [wt("kedua") + 0.2, 560, 860, 0.96],
    [wt("terduga") + 0.3, 420, 1270, 1.45],
    [wt("jernih") + 0.2, 520, 1270, 1.6],
    [wt("tapi", 1) - 0.1, 620, 1270, 2.3],
  ];
  const keysC: Key[] = [
    [cs("l11") - 0.15, 720, 980, 0.95],
    [tDig + 0.35, 740, 1000, 0.97],
    [tLeak - 0.25, 500, 1220, 1.35],
    [tPress + 0.1, 640, 1250, 1.2],
    [wt("endapan", 1) - 0.15, 820, 1270, 1.45],
    [wt("terbawa") + 0.15, 1350, 1250, 1.3],
    [wt("keranmu") - 0.05, 1800, 760, 1.3],
  ];
  const c0 = camAt(mode === "a" ? keysA : keysC, t);
  const sh = mode === "c" ? shake(t, tDig + 0.1, 0.5, 10) : [0, 0];
  const cam = { ...c0, x: c0.x + sh[0], y: c0.y + sh[1] };

  const dig = mode === "c" ? ramp(t, tDig - 0.7, tDig) * (1 - ramp(t, tLeak - 0.3, tLeak)) : 0;
  const clamp = mode === "c" && t > tDig + 0.1;
  const leak = mode === "c" ? ramp(t, tLeak, tLeak + 0.3) * (1 - ramp(t, tPress + 0.3, tPress + 0.8)) : 0;
  const pressWin = mode === "c" ? ramp(t, tPress - 0.2, tPress + 0.1) * (1 - ramp(t, tStir - 0.4, tStir - 0.1)) : 0;
  const reverse = mode === "c" && t > tPress + 0.2 && t < tPress + 0.9;
  const stir = mode === "c" ? ramp(t, tStir - 0.4, tStir + 0.4) : 0;

  const r = mulberry32(6060);
  const flow = Array.from({ length: 60 }, () => [r(), r(), r()] as const);
  const silt = Array.from({ length: 70 }, () => [r(), r(), r()] as const);
  const crust = Array.from({ length: 40 }, () => [r(), r()] as const);
  // signed travel: reverses briefly when pressure changes
  const travel = t * 0.06 - (reverse ? (t - tPress - 0.2) * 0.12 : t > tPress + 0.9 && mode === "c" ? 0.7 * 0.12 : 0);

  const pipePt = proj(cam, 560, 1270, 1);
  const clampPt = proj(cam, 760, PY0 - 20, 1);
  const crackPt = proj(cam, 480, PY0 - 18, 1);
  const stirPt = proj(cam, 900, 1300, 1);

  return (
    <g>
      <g transform={layerT(cam, 0.55)}>
        <rect x={-900} y={-900} width={3600} height={1400} fill="url(#skyG)" filter="url(#wcBig)" />
      </g>
      <g transform={layerT(cam, 0.8)}>
        {[-200, 60, 320, 980, 1240].map((x, i) => (
          <House key={i} x={x} y={600} s={150 + (i % 2) * 30} roof={i % 2 ? C.roof : "#B5573E"} />
        ))}
      </g>
      <g transform={layerT(cam, 1)}>
        <House x={1800} y={610} s={260} roof={C.roof} lit />
        <rect x={-900} y={600} width={3600} height={90} fill="#8E8A86" filter="url(#wcSoft)" />
        <g stroke="#F4EEE2" strokeWidth={6} strokeDasharray="40 36" opacity={0.85}>
          <line x1={-900} y1={645} x2={2700} y2={645} />
        </g>
        <rect x={-900} y={686} width={3600} height={2200} fill="#C9A27A" filter="url(#wcBig)" />
        <path d="M-900,980 C0,950 800,1000 1600,960 C2000,940 2400,970 2700,960 L2700,2900 L-900,2900 Z" fill="#B08860" opacity={0.8} filter="url(#wc)" />
        <path d="M-900,1520 C0,1500 900,1540 1700,1500 L2700,1510 L2700,2900 L-900,2900 Z" fill="#9A7350" opacity={0.75} filter="url(#wc)" />
        <path d="M-900,1110 C0,1090 700,1130 1500,1100 C2000,1085 2400,1110 2700,1100 L2700,1150 C2000,1160 900,1170 -900,1150 Z" fill="#7B5536" opacity={0.55} filter="url(#wc)" />
        <path d="M-900,1800 C200,1770 1000,1820 2700,1780 L2700,2900 L-900,2900 Z" fill="#6E5236" opacity={0.8} filter="url(#wc)" />
        <g filter="url(#wcFine)">
          {Array.from({ length: 90 }, (_, i) => {
            const a = mulberry32(300 + i)();
            const b = mulberry32(700 + i)();
            const y = 720 + b * 1500;
            if (y > PY0 - 40 && y < PY1 + 40) return null;
            return <ellipse key={i} cx={-800 + a * 3400} cy={y} rx={8 + (i % 4) * 5} ry={5 + (i % 3) * 3} fill={i % 3 ? "#8C6A48" : "#E2CDAE"} opacity={0.8} />;
          })}
        </g>
        <g filter="url(#pencil)" stroke="#5a3f28" strokeWidth={2} fill="none" opacity={0.5}>
          {[-600, -100, 400, 1300, 2100].map((x, i) => (
            <path key={i} d={`M${x},700 C${x + 20},760 ${x - 30},820 ${x + 10},${880 + (i % 2) * 60}`} />
          ))}
        </g>
        <rect x={X0} y={PY1 + 20} width={X1 - X0} height={40} fill="#3b2816" opacity={0.35} filter="url(#blur14)" />
        <path d="M-900,686 L2700,686" stroke="#FCF8EF" strokeWidth={14} filter="url(#tear)" />
        {/* trench + excavator bucket (generic, no brand) */}
        {dig > 0 && (
          <g opacity={clamp01(dig * 2)}>
            <rect x={680} y={600} width={170} height={(PY0 - 600) * dig} fill="#6E5236" opacity={0.85} filter="url(#wcSoft)" />
            <g transform={`translate(0 ${lerp(-500, PY0 - 760, dig)})`} filter="url(#wcSoft)">
              <rect x={820} y={-200} width={36} height={700} fill={C.ochre} stroke={C.graphite} strokeWidth={3} transform="rotate(12 838 500)" />
              <path d="M700,620 L860,620 L840,720 C800,760 740,760 700,720 Z" fill={C.ochre} stroke={C.graphite} strokeWidth={3} />
              {[0, 1, 2, 3].map((k) => (
                <path key={k} d={`M${712 + k * 36},752 l10,22 l10,-22`} fill={C.chromeDark} />
              ))}
            </g>
          </g>
        )}
        {/* riser into the house */}
        <PipeRun pts={[[X1 - 60, 1270], [X1, 1270], [X1, 640]]} w={60} flow={stir > 0.5 ? "#B08155" : "#DDEFF6"} t={t} />
        {/* old pipe, front half cut away */}
        <g filter="url(#wcSoft)">
          <rect x={X0} y={PY0 - 24} width={X1 - X0} height={24} fill="#6F7A80" />
          <rect x={X0} y={PY1} width={X1 - X0} height={24} fill="#5E676C" />
          <rect x={X0} y={PY0} width={X1 - X0} height={PY1 - PY0} fill="#D3E8F1" />
          <rect x={X0} y={PY0} width={X1 - X0} height={PY1 - PY0} fill={BROWN} opacity={0.75 * stir} />
        </g>
        <rect x={X0} y={PY0 - 20} width={X1 - X0} height={5} fill="#E6EEF2" opacity={0.85} />
        <rect x={X0} y={PY1 + 4} width={X1 - X0} height={4} fill="#9AA6AC" opacity={0.8} />
        <rect x={X0} y={PY0 + 22} width={X1 - X0} height={10} fill="#FFFFFF" opacity={0.45 * (1 - stir)} filter="url(#wcFine)" />
        {/* deposits on the old wall: sediment, iron/manganese scale, biofilm */}
        <path d={`M${X0},${PY1} L${X0},${PY1 - 18} ${Array.from({ length: 23 }, (_, i) => `Q${X0 + i * 100 + 50},${PY1 - 30 + (i % 3) * 6} ${X0 + (i + 1) * 100},${PY1 - 16}`).join(" ")} L${X1},${PY1} Z`} fill="#6E4A2E" opacity={0.9 - stir * 0.4} filter="url(#wcFine)" />
        <rect x={X0} y={PY0} width={X1 - X0} height={9} fill="#8E4A2C" opacity={0.85} filter="url(#wcFine)" />
        <g>
          {crust.map(([a, b], i) => (
            <circle key={i} cx={X0 + a * (X1 - X0)} cy={PY0 + 3 + b * 6} r={3 + b * 3} fill={i % 3 ? "#7A3A22" : "#2A2522"} />
          ))}
        </g>
        <g filter="url(#wcFine)" opacity={0.55}>
          {[-300, 120, 520, 980, 1400].map((x, i) => (
            <ellipse key={i} cx={x} cy={PY0 + 14} rx={60} ry={12} fill="#8FA08A" />
          ))}
        </g>
        {/* moving water */}
        <g>
          {flow.map(([a, b, c], i) => {
            const u = (((a + travel * (1 + c)) % 1) + 1) % 1;
            return <circle key={i} cx={X0 + u * (X1 - X0)} cy={PY0 + 22 + b * (PY1 - PY0 - 50)} r={4 + c * 3} fill="#FFFFFF" opacity={0.85 * (1 - stir)} />;
          })}
        </g>
        {stir > 0 && (
          <g filter="url(#wcFine)">
            {silt.map(([a, b, c], i) => {
              const k = clamp01((t - tStir + 0.4 - c * 0.5) / 1.2);
              const x = 300 + a * 1200 + k * 500 * (0.5 + b);
              const y = lerp(PY1 - 14, PY0 + 20 + b * 100, k);
              return x < X1 ? <circle key={i} cx={x} cy={y} r={6 + c * 10} fill={i % 2 ? "#7F5636" : "#A57548"} opacity={0.85 * clamp01(k * 4)} /> : null;
            })}
          </g>
        )}
        {/* repair clamp */}
        {clamp && (
          <g filter="url(#wcFine)">
            <rect x={735} y={PY0 - 34} width={50} height={PY1 - PY0 + 68} rx={8} fill={C.chromeDark} stroke={C.graphite} strokeWidth={3} />
          </g>
        )}
        {/* leak: crack + jets */}
        {leak > 0 && (
          <g opacity={leak} filter="url(#wcFine)">
            <path d={`M450,${PY0 - 24} l14,-8 l10,10 l12,-10 l14,8`} stroke={C.graphite} strokeWidth={4} fill="none" />
            {Array.from({ length: 9 }, (_, i) => {
              const u = (t * 2.2 + i / 9) % 1;
              const ang = -Math.PI / 2 + (i - 4) * 0.18;
              return <circle key={i} cx={480 + Math.cos(ang) * u * 160} cy={PY0 - 30 + Math.sin(ang) * u * 160 + u * u * 60} r={6} fill="#9CC4DA" opacity={1 - u} />;
            })}
          </g>
        )}
      </g>
      {mode === "a" && (
        <>
          <Tag t={t} at={wt("tersangka", 1)} until={wt("jernih") - 0.2} x={540} y={300} text="Tersangka 2 · pipa" accent={C.steel} />
          <Tag t={t} at={wt("jernih") - 0.05} x={540} y={300} text="air sudah jernih" anchor={pipePt} accent={C.clear} />
        </>
      )}
      {mode === "c" && (
        <>
          <Tag t={t} at={tDig} until={tLeak - 0.15} x={540} y={300} text="pipa diperbaiki" anchor={clampPt} accent={C.ochre} />
          <Tag t={t} at={tLeak} until={tPress - 0.15} x={540} y={300} text="pipa bocor" anchor={crackPt} accent={C.clear} />
          {pressWin > 0 && (
            <g opacity={pressWin}>
              <Dial
                x={540}
                y={520}
                r={200}
                value={0.5 + Math.sin((t - tPress) * 14) * 0.38 * clamp01((t - tPress + 0.2) * 2) * (1 - clamp01((t - tPress - 0.9) * 1.5))}
                labels={["rendah", "", "tinggi"]}
                title="tekanan berubah"
                danger={0.78}
              />
            </g>
          )}
          <Tag t={t} at={tStir} until={wt("terbawa") + 0.3} x={540} y={300} text="endapan teraduk" anchor={stirPt} accent={C.river} />
          <Tag t={t} at={wt("terbawa") + 0.35} x={540} y={300} text="terbawa ke keranmu" accent={C.river} />
        </>
      )}
    </g>
  );
};

/** Cross-section of an old pipe: what sticks to the wall. */
export const CrossSection: React.FC<{ t: number }> = ({ t }) => {
  const t0 = wt("tapi", 1) - 0.15;
  const keys: Key[] = [
    [t0, 540, 900, 0.82],
    [wt("menempel"), 540, 900, 1.0],
    [cs("l11") - 0.1, 540, 920, 1.12],
  ];
  const cam = camAt(keys, t);
  const cx = 540;
  const cy = 900;
  const R = 380;
  const sed = ramp(t, wt("endapan") - 0.05, wt("endapan") + 0.4);
  const crust = ramp(t, wt("kerak") - 0.05, wt("kerak") + 0.35);
  const slime = ramp(t, wt("lendir") - 0.1, wt("lendir") + 0.4);
  const r = mulberry32(7171);
  const specks = Array.from({ length: 44 }, () => [r(), r()] as const);
  const dots = Array.from({ length: 30 }, () => [r(), r()] as const);
  const chordY = cy + R - 30 - 130 * sed;
  const half = Math.sqrt(Math.max(0, (R - 20) ** 2 - (chordY - cy) ** 2));
  const P = (x: number, y: number) => proj(cam, x, y, 1);
  return (
    <g>
      <g transform={layerT(cam, 0.6)}>
        <rect x={-900} y={-900} width={2900} height={3800} fill="#B08860" filter="url(#wcBig)" />
        <path d="M-900,700 C0,660 600,720 2000,680 L2000,2900 L-900,2900 Z" fill="#9A7350" opacity={0.7} filter="url(#wc)" />
        <path d="M-900,280 C0,250 700,300 2000,260 L2000,330 C800,360 0,330 -900,350 Z" fill="#7B5536" opacity={0.6} filter="url(#wc)" />
        <path d="M-900,1500 C0,1470 800,1520 2000,1480 L2000,2900 L-900,2900 Z" fill="#6E5236" opacity={0.75} filter="url(#wc)" />
        <g filter="url(#wcFine)">
          {Array.from({ length: 60 }, (_, i) => (
            <ellipse key={i} cx={-300 + mulberry32(40 + i)() * 1700} cy={-100 + mulberry32(90 + i)() * 2100} rx={10 + (i % 4) * 6} ry={7 + (i % 3) * 4} fill={i % 3 ? "#8C6A48" : "#E2CDAE"} opacity={0.75} />
          ))}
        </g>
      </g>
      <g transform={layerT(cam, 1)}>
        <circle cx={cx + 16} cy={cy + 26} r={R + 40} fill="#3b2816" opacity={0.3} filter="url(#blur14)" />
        <circle cx={cx} cy={cy} r={R + 30} fill="#6F7A80" filter="url(#wcSoft)" />
        <circle cx={cx} cy={cy} r={R - 6} fill="#D3E8F1" filter="url(#wcSoft)" />
        {/* water moving towards viewer */}
        <g>
          {dots.map(([a, b], i) => {
            const u = (b + t * 0.25) % 1;
            const rr = u * (R - 60);
            const ang = a * Math.PI * 2;
            return <circle key={i} cx={cx + Math.cos(ang) * rr} cy={cy + Math.sin(ang) * rr} r={2 + u * 7} fill="#FFFFFF" opacity={0.9 * Math.sin(u * Math.PI)} />;
          })}
        </g>
        {/* kerak (scale) ring */}
        {crust > 0 && (
          <g opacity={crust}>
            <circle cx={cx} cy={cy} r={R - 18} fill="none" stroke="#8E4A2C" strokeWidth={30 * crust} filter="url(#wcFine)" />
            {specks.map(([a, b], i) => {
              const ang = a * Math.PI * 2;
              const rr = R - 12 - b * 22;
              return <circle key={i} cx={cx + Math.cos(ang) * rr} cy={cy + Math.sin(ang) * rr} r={3 + b * 4} fill={i % 3 ? "#6B2F1C" : "#25201D"} />;
            })}
          </g>
        )}
        {/* endapan (sediment) pooled at the bottom */}
        {sed > 0 && (
          <path d={`M${cx - half},${chordY} Q${cx},${chordY - 14} ${cx + half},${chordY} A${R - 20},${R - 20} 0 0 1 ${cx - half},${chordY} Z`} fill="#6E4A2E" opacity={0.92} filter="url(#wcSoft)" />
        )}
        {/* lendir bakteri (biofilm) patches */}
        {slime > 0 && (
          <g opacity={slime * 0.8} filter="url(#wcSoft)">
            {[200, 235, 270, 305, 340, 20].map((deg, i) => {
              const ang = (deg * Math.PI) / 180;
              const rr = R - 48;
              return <ellipse key={i} cx={cx + Math.cos(ang) * rr} cy={cy + Math.sin(ang) * rr} rx={54 * slime} ry={22 * slime} fill="#8FA08A" transform={`rotate(${deg + 90} ${cx + Math.cos(ang) * rr} ${cy + Math.sin(ang) * rr})`} />;
            })}
          </g>
        )}
        <path d={`M${cx - R - 14},${cy - 40} A${R + 14},${R + 14} 0 0 1 ${cx + 80},${cy - R - 12}`} stroke="#E6EEF2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
        <circle cx={cx} cy={cy} r={R + 30} fill="none" stroke={C.graphite} strokeWidth={3} opacity={0.6} filter="url(#pencil)" />
        <circle cx={cx} cy={cy} r={R - 6} fill="none" stroke={C.graphite} strokeWidth={2} opacity={0.5} filter="url(#pencil)" />
      </g>
      <Tag t={t} at={wt("dinding")} until={wt("endapan") - 0.1} x={540} y={300} text="dinding pipa lama" accent={C.steel} />
      <Tag t={t} at={wt("endapan")} x={230} y={300} size={40} text="endapan" anchor={P(cx - 120, cy + R - 70)} accent={C.river} />
      <Tag t={t} at={wt("kerak")} x={530} y={300} size={40} text="kerak" anchor={P(cx + R - 24, cy - 40)} accent="#8E4A2C" />
      <Tag t={t} at={wt("lendir") - 0.1} x={840} y={300} size={40} text="lendir bakteri" anchor={P(cx - 150, cy - R + 70)} accent={C.sage} />
    </g>
  );
};
