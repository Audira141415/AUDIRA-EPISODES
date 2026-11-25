import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {B, HEAD, MONO, isoAt, poly, seg} from '../bp/styles/blueprint/kit';
import {StyleFonts, drawOn} from '../bp/styles/shared';
import {AudiraSignature} from '../brand/AudiraSignature';
import {AudiraOutro} from '../brand/AudiraOutro';
import words from '../../public/audio/vo-words.json';
import {
  Cam, Card, Defs, FgRuler, Floor, Gate, Grid, H, Hud, NoBattery, Reader, Shadow, Skyline, Solid, Title, TitleBlock, W,
  camFor, layer, lerp, p, pb, pio,
} from './parts';

// EP02 — Cara kerja kartu e-Toll / NFC. Style: BLUEPRINT (Remotion 2D, SVG sheet 1080×1920).
// Cuts follow audio/vo-words.json (Audio Master Clock, offset 0).
export const ETOLL_SECONDS = 84;
const OUTRO = 3;

// scene windows (s)
const S = {
  hook: [0, 9.0], ctx: [9.0, 15.0], bongkar: [15.0, 27.0], medan: [27.0, 35.2], induksi: [35.2, 45.2],
  arus: [45.2, 51.0], data: [51.0, 60.0], palang: [60.0, 66.0], mlff: [66.0, 74.7], outro: [74.7, ETOLL_SECONDS],
} as const;
type Win = readonly [number, number];

/** Scene wrapper: zoom-through crossfade (outgoing pushes past camera, incoming settles in). */
const Scene: React.FC<{t: number; w: Win; children: React.ReactNode}> = ({t, w, children}) => {
  const [a, b] = w;
  if (t < a - 0.35 || t > b + 0.35) return null;
  const inQ = a <= 0 ? 1 : p(t, a - 0.35, a + 0.12);
  const outQ = b >= ETOLL_SECONDS ? 0 : p(t, b - 0.12, b + 0.35);
  const s = (1 + 0.14 * outQ) * (0.9 + 0.1 * inQ);
  return (
    <g opacity={inQ * (1 - outQ)} transform={`translate(${W / 2} 900) scale(${s.toFixed(4)}) translate(${-W / 2} -900)`}>
      {children}
    </g>
  );
};

// ---------- S1 hook: tap at the gate ----------
const Hook: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const carX = lerp(-760, 110, pio(t, 0.2, 3.4));
  const tap = (t - 4.35) / 0.9;
  const deducted = t >= 5.95;
  const head = isoAt(390, 880, 0.85)(330, 40, 170);
  const cardIn = pio(t, 3.3, 4.55);
  const cardOut = pio(t, 5.4, 6.4);
  const cx = lerp(head[0] - 420, head[0] - 70, cardIn) - cardOut * 330;
  const cy = lerp(head[1] + 260, head[1] - 140, cardIn) + cardOut * 120;
  return (
    <g>
      <Skyline c={c} y={760} q={p(t, 0, 0.9)} />
      <g transform={layer(c, 1)}>
        <Gate t={t} q={p(t, 0, 0.9)} arm={0} carX={carX} screen={deducted ? 'Rp70.500' : 'Rp85.000'} screenHot={deducted ? 1 - p(t, 6.8, 7.6) * 0.6 : 0} tap={tap} labelShift={[-150, -60]} />
        {/* hand + card reaching from the car window */}
        {t > 3.2 && t < 6.6 && (
          <g transform={`translate(${cx} ${cy}) rotate(${-14 + cardIn * 10})`}>
            <path d="M -170 70 Q -120 30 -60 40 L 10 60 Q 30 80 0 92 L -70 90 Q -130 120 -170 120 Z" fill="#0B2C52" stroke={B.line} strokeWidth={3} />
            <rect x={-80} y={-20} width={170} height={108} rx={12} fill="url(#gCard)" stroke={B.line} strokeWidth={3} />
            <rect x={-66} y={-6} width={142} height={80} rx={8} fill="none" stroke={B.cyan} strokeWidth={2} opacity={0.7} />
            <rect x={-56} y={16} width={26} height={30} rx={3} fill="url(#gGold)" />
          </g>
        )}
        {deducted && (
          <g opacity={p(t, 5.95, 6.3) * (1 - p(t, 8.6, 9))}>
            <text x={head[0] + 120} y={head[1] - 210 - p(t, 5.95, 7) * 40} fill={B.red} filter="url(#glow)" style={{color: B.red, fontFamily: HEAD, fontWeight: 700, fontSize: 60}}>−Rp14.500</text>
          </g>
        )}
      </g>
      <FgRuler c={c} t={t} y={1240} seed={1} />
      <Hud x={150} y={230} w={780} label="DAYA DI DALAM KARTU" value="0 BATERAI" t={t} start={1.75} color={B.red} end={7.4} />
      <g transform={`translate(0 0)`} opacity={p(t, 1.8, 2.3) * (1 - p(t, 7.1, 7.4))}>
        <NoBattery x={540} y={560} q={1} cross={p(t, 2.3, 2.8)} s={0.9} />
      </g>
      <g opacity={p(t, 7.55, 7.9)}>
        <text x={540} y={500} textAnchor="middle" fill={B.yellow} filter="url(#glow)" style={{color: B.yellow, fontFamily: HEAD, fontWeight: 700, fontSize: 150 + 20 * pb(t, 7.55, 8.1) - 20}}>KOK BISA?</text>
      </g>
    </g>
  );
};

// ---------- S2 context: 31 Okt 2017, 100% non-tunai ----------
const Ctx: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const iso = isoAt(540, 980, 0.9);
  const stamp = pb(t, 10.0, 10.45);
  return (
    <g>
      <Skyline c={c} y={900} q={p(t, 9.2, 10)} />
      <g transform={layer(c, 1)}>
        {/* calendar sheet */}
        <Shadow cx={540} cy={790} rx={330} ry={40} />
        <g transform={`translate(540 560) rotate(${-3 + Math.sin(t) * 0.6})`}>
          <rect x={-300} y={-220} width={600} height={430} rx={14} fill="url(#gTop)" stroke={B.line} strokeWidth={4} {...drawOn(p(t, 9.0, 9.7))} />
          <rect x={-300} y={-220} width={600} height={90} rx={14} fill={B.red} opacity={0.85 * p(t, 9.3, 9.7)} />
          <text x={0} y={-160} textAnchor="middle" fill="#fff" opacity={p(t, 9.4, 9.8)} style={{color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 6}}>OKTOBER 2017</text>
          <text x={0} y={90} textAnchor="middle" fill={B.line} opacity={p(t, 9.5, 9.9)} style={{color: B.line, fontFamily: HEAD, fontWeight: 700, fontSize: 230}}>31</text>
          {stamp > 0 && (
            <g transform={`translate(0 158) rotate(-6) scale(${2.2 - 1.2 * stamp})`} opacity={Math.min(1, stamp * 1.4)}>
              <rect x={-190} y={-62} width={380} height={124} rx={10} fill="none" stroke={B.yellow} strokeWidth={8} filter="url(#glow)" />
              <text x={0} y={22} textAnchor="middle" fill={B.yellow} style={{color: B.yellow, fontFamily: MONO, fontWeight: 700, fontSize: 56, letterSpacing: 4}}>NON-TUNAI</text>
            </g>
          )}
        </g>
        {/* three gates, queue rolling through */}
        {[0, 1, 2].map((g) => {
          const y0 = g * 150, ql = p(t, 9.2 + g * 0.12, 10.0 + g * 0.12);
          return (
            <g key={`lane${g}`} opacity={ql}>
              <path d={poly([iso(-640, y0 + 50, 0), iso(640, y0 + 50, 0), iso(640, y0 + 140, 0), iso(-640, y0 + 140, 0)])} fill="#0A2E57" fillOpacity={0.85} stroke={B.line2} strokeWidth={2} />
              <path d={seg(iso(-640, y0 + 95, 0), iso(640, y0 + 95, 0))} stroke={B.yellow} strokeWidth={3} strokeDasharray="30 26" opacity={0.6} />
            </g>
          );
        })}
        {[0, 1, 2].map((g) => {
          const y0 = g * 150;
          return (
            <g key={g}>
              <Shadow cx={iso(100, y0 + 10, 0)[0]} cy={iso(100, y0 + 10, 0)[1] + 4} rx={90} ry={26} o={p(t, 9.3, 10)} />
              <Solid iso={iso} x0={60} x1={140} y0={y0 - 20} y1={y0 + 40} z0={0} z1={150} q={p(t, 9.3 + g * 0.15, 10.3 + g * 0.15)} />
              {[0, 1].map((k) => {
                const x = ((t - 9) * 160 + k * 500 + g * 170) % 1000 - 520;
                return (
                  <g key={k}>
                    <Shadow cx={iso(x + 75, y0 + 95, 0)[0]} cy={iso(x + 75, y0 + 95, 0)[1] + 4} rx={95} ry={24} o={p(t, 9.6, 10.4)} />
                    <Solid iso={iso} x0={x} x1={x + 150} y0={y0 + 60} y1={y0 + 130} z0={8} z1={60} q={p(t, 9.6, 10.4)} top="url(#gCard)" />
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
      <FgRuler c={c} t={t} y={1290} flip seed={2} />
      <Title x={540} y={250} text="SEMUA TOL JASA MARGA" t={t} start={11.9} size={58} end={15.1} />
      <Hud x={190} y={1110} w={700} label="SEJAK 31·10·2017" value="100% NON-TUNAI" t={t} start={13.4} size={70} />
    </g>
  );
};

// ---------- S3 bongkar kartu ----------
const Bongkar: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const iso = isoAt(400, 1000, 1.45);
  const sep = pio(t, 18.5, 20.2) * 90;
  const q = p(t, 15.0, 16.0);
  return (
    <g>
      <g transform={layer(c, 1)}>
        <Shadow cx={iso(170, 107, 0)[0]} cy={iso(170, 107, 0)[1] + 30} rx={360} ry={90} />
        <Card iso={iso} q={q} layer="bottom" z={0} coil={0} />
        <Card iso={iso} q={q} layer="chip" z={sep * 1} coil={0} chipOn={p(t, 24.2, 24.8) * 0.6} />
        <Card iso={iso} q={q} layer="coil" z={sep * 2} coil={sep > 1 ? 1 : 0} power={p(t, 20.9, 21.5) * 0.7} flow={t} />
        <Card iso={iso} q={q} layer={sep > 1 ? 'top' : 'all'} z={sep * 3} coil={0} label={sep <= 1} />
        {/* exploded-view guide lines */}
        {sep > 1 && [[0, 0], [340, 0], [340, 214], [0, 214]].map(([x, y], i) => (
          <path key={i} d={seg(iso(x, y, 0), iso(x, y, sep * 3))} stroke={B.line2} strokeWidth={2} strokeDasharray="6 10" opacity={0.6} />
        ))}
        {/* thickness dimension */}
        <g opacity={p(t, 17.0, 17.4) * (1 - p(t, 18.4, 18.8))}>
          <path d={`M ${iso(340, 230, 0)[0] + 20} ${iso(340, 230, 0)[1]} l 120 0 M ${iso(340, 230, 9)[0] + 20} ${iso(340, 230, 9)[1]} l 120 0`} stroke={B.yellow} strokeWidth={3} />
          <text x={iso(340, 230, 0)[0] + 160} y={iso(340, 230, 0)[1] + 4} fill={B.yellow} style={{color: B.yellow, fontFamily: MONO, fontWeight: 700, fontSize: 34}}>0,76 mm</text>
        </g>
        {/* callouts */}
        {t > 20.9 && (() => {
          const a = iso(326, 107, sep * 2 + 7);
          const qq = p(t, 20.9, 21.4);
          return (
            <g>
              <circle cx={a[0]} cy={a[1]} r={9} fill={B.cyan} opacity={qq} />
              <path d={`M ${a[0]} ${a[1]} L ${a[0] + 60} ${a[1] - 160} L 820 ${a[1] - 160}`} fill="none" stroke={B.cyan} strokeWidth={3} {...drawOn(qq)} />
              <rect x={438} y={a[1] - 222} width={396} height={56} rx={6} fill="#061C38" fillOpacity={0.88} opacity={p(t, 21.2, 21.5)} />
              <text x={820} y={a[1] - 180} textAnchor="end" fill={B.cyan} opacity={p(t, 21.2, 21.5)} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 34}}>01 KUMPARAN ANTENA</text>
            </g>
          );
        })()}
        {t > 24.2 && (() => {
          const a = iso(85, 102, sep + 11);
          const qq = p(t, 24.2, 24.7);
          return (
            <g>
              <circle cx={a[0]} cy={a[1]} r={9} fill={B.yellow} opacity={qq} />
              <path d={`M ${a[0]} ${a[1]} L ${a[0] - 40} ${a[1] + 150} L 90 ${a[1] + 150}`} fill="none" stroke={B.yellow} strokeWidth={3} {...drawOn(qq)} />
              <text x={90} y={a[1] + 196} fill={B.yellow} opacity={p(t, 24.5, 24.8)} style={{color: B.yellow, fontFamily: MONO, fontWeight: 700, fontSize: 34}}>02 CHIP</text>
            </g>
          );
        })()}
        <TitleBlock x={220} y={1190} q={p(t, 15.6, 16.6)} dwg="DWG EP02" />
      </g>
      <FgRuler c={c} t={t} y={300} seed={3} />
      <Title x={540} y={330} text="DIBELAH: ISINYA CUMA DUA" t={t} start={18.6} size={56} end={25.4} />
      <Hud x={240} y={270} w={600} label="SUMBER DAYA" value="TANPA BATERAI" t={t} start={25.6} color={B.red} size={66} />
    </g>
  );
};

// ---------- S4 medan pembaca 13,56 MHz ----------
const Medan: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const field = p(t, 30.4, 32.0);
  const n = Math.floor(13560000 * p(t, 32.7, 34.5));
  const power = p(t, 27.8, 28.8);
  return (
    <g>
      <g transform={layer(c, 1)}>
        <Reader cx={540} y={1000} q={p(t, 27.0, 27.9)} field={field} t={t} power={power} />
        {/* power cable from the gate cabinet: energy flows into the reader */}
        <path d="M 40 1230 L 200 1230 Q 250 1230 260 1180 L 290 1100" fill="none" stroke={B.line2} strokeWidth={8} opacity={p(t, 27.2, 27.8)} />
        <path d="M 40 1230 L 200 1230 Q 250 1230 260 1180 L 290 1100" fill="none" stroke={B.yellow} strokeWidth={8} strokeDasharray="18 30"
          strokeDashoffset={-t * 140} opacity={power} filter="url(#glow)" />
        <g opacity={p(t, 27.4, 28)}>
          <rect x={-10} y={1180} width={70} height={110} rx={8} fill="url(#gLeft)" stroke={B.line} strokeWidth={3} />
          <path d="M 25 1205 l -14 30 h 16 l -10 30 l 26 -40 h -16 l 12 -20 z" fill={B.yellow} filter="url(#glow)" />
        </g>
      </g>
      <FgRuler c={c} t={t} y={1290} flip seed={4} />
      <Title x={540} y={330} text="TENAGA DARI GERBANG" t={t} start={27.8} size={60} end={32.6} />
      <Hud x={170} y={280} w={740} label="MEDAN BOLAK-BALIK" value="13,56 MHz" t={t} start={32.7} size={96} />
      <g opacity={p(t, 33.0, 33.4)}>
        <text x={540} y={500} textAnchor="middle" fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 44}}>
          {n.toLocaleString('id-ID')} ×/dtk
        </text>
      </g>
    </g>
  );
};

// ---------- S5a induksi + Faraday 1831 ----------
const Induksi: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const enter = pio(t, 35.3, 37.2);
  const cardX = lerp(1250, 540, enter);
  const cardY = 760 + Math.sin(t * 2) * 6;
  const lit = p(t, 39.6, 40.4);
  return (
    <g>
      <g transform={layer(c, 1)}>
        <Reader cx={540} y={1060} q={1} field={1} t={t} power={1} />
        {/* the card, seen from the side-ish */}
        <g transform={`translate(${cardX} ${cardY}) rotate(${(1 - enter) * 12})`}>
          <Shadow cx={0} cy={300} rx={160 * (0.6 + enter * 0.4)} ry={24} o={0.6} />
          <rect x={-190} y={-60} width={380} height={120} rx={14} fill="url(#gCard)" stroke={B.line} strokeWidth={4} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={-170 + k * 12} y={-44 + k * 10} width={340 - k * 24} height={88 - k * 20} rx={8} fill="none"
              stroke={lit > 0 ? B.yellow : B.line2} strokeWidth={3} filter={lit > 0 ? 'url(#glow)' : undefined}
              strokeDasharray={lit > 0 ? '16 18' : undefined} strokeDashoffset={-t * 120} />
          ))}
          <rect x={-150} y={-20} width={40} height={40} rx={4} fill="url(#gGold)" filter={lit > 0 ? 'url(#glow)' : undefined} />
        </g>
        {/* ±4 cm dimension */}
        <g opacity={p(t, 37.7, 38.1)}>
          <path d="M 790 822 L 790 1026" stroke={B.yellow} strokeWidth={3} {...drawOn(p(t, 37.7, 38.3))} />
          <path d="M 766 822 L 814 822 M 766 1026 L 814 1026" stroke={B.yellow} strokeWidth={4} />
          <text x={760} y={936} textAnchor="end" fill={B.yellow} filter="url(#glow)" style={{color: B.yellow, fontFamily: HEAD, fontWeight: 700, fontSize: 60}}>±4 cm</text>
        </g>
      </g>
      <FgRuler c={c} t={t} y={1300} seed={5} />
      <Hud x={110} y={270} w={860} label="ε = −N · dΦ/dt" value="INDUKSI ELEKTROMAGNETIK" t={t} start={39.6} size={52} color={B.cyan} end={42.2} />
      {/* Faraday medallion */}
      {t > 42.0 && (
        <g opacity={p(t, 42.0, 42.5)} transform={`translate(540 360) scale(${0.85 + 0.15 * pb(t, 42.0, 42.6)})`}>
          <circle r={130} fill="url(#gTop)" stroke={B.line} strokeWidth={4} />
          <circle r={146} fill="none" stroke={B.cyan} strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${t * 20})`} />
          <path d="M -30 90 C -60 60 -70 20 -55 -20 C -45 -60 -10 -85 25 -78 C 55 -72 70 -45 62 -18 C 70 -5 78 8 66 14 C 62 30 58 44 44 46 C 36 60 30 75 30 90 Z"
            fill="#061C38" stroke={B.line} strokeWidth={3} />
          <path d="M -50 -40 C -40 -80 20 -95 50 -60" fill="none" stroke={B.line2} strokeWidth={6} />
          <text x={210} y={-10} fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 34}}>M. FARADAY</text>
          <text x={210} y={70} fill={B.yellow} filter="url(#glow)" style={{color: B.yellow, fontFamily: HEAD, fontWeight: 700, fontSize: 96 * (0.8 + 0.2 * pb(t, 43.5, 44.1))}}>
            {t > 43.5 ? '1831' : ''}
          </text>
        </g>
      )}
    </g>
  );
};

// ---------- S5b arus di kumparan → chip menyala (macro, top view) ----------
const Arus: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const flow = p(t, 46.4, 47.2);
  const chip = p(t, 49.6, 50.1);
  const loops = [0, 1, 2, 3];
  return (
    <g>
      <g transform={layer(c, 0.6)} opacity={0.5}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path key={k} d={`M -100 ${520 + k * 150} Q 540 ${440 + k * 150 + Math.sin(t * 6 + k) * 40} 1180 ${520 + k * 150}`} fill="none" stroke={B.cyan} strokeWidth={3}
            strokeDasharray="12 22" strokeDashoffset={(k % 2 ? 1 : -1) * t * 90} filter="url(#glow)" opacity={0.5} />
        ))}
      </g>
      <g transform={layer(c, 1)}>
        <Shadow cx={560} cy={1220} rx={470} ry={60} />
        <rect x={110} y={560} width={860} height={560} rx={36} fill="url(#gCard)" stroke={B.line} strokeWidth={5} />
        {loops.map((k) => {
          const ins = 34 + k * 26;
          const d = `M ${110 + ins} ${560 + ins + 20} Q ${110 + ins} ${560 + ins} ${130 + ins} ${560 + ins} L ${950 - ins} ${560 + ins} Q ${970 - ins} ${560 + ins} ${970 - ins} ${580 + ins} L ${970 - ins} ${1100 - ins} Q ${970 - ins} ${1120 - ins} ${950 - ins} ${1120 - ins} L ${130 + ins} ${1120 - ins} Q ${110 + ins} ${1120 - ins} ${110 + ins} ${1100 - ins} Z`;
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={B.line2} strokeWidth={6} />
              <path d={d} fill="none" stroke={B.yellow} strokeWidth={8} strokeDasharray="26 54" strokeDashoffset={-t * 260 - k * 20} opacity={flow} filter="url(#glow)" />
            </g>
          );
        })}
        {/* arrow tags along the coil */}
        {flow > 0 && [[540, 594], [936, 840], [540, 1086], [144, 840]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={14} fill={B.yellow} opacity={flow * (0.6 + 0.4 * Math.sin(t * 10 + i))} filter="url(#glow)" />
        ))}
        {/* chip */}
        {chip > 0 && <circle cx={330} cy={840} r={120 + 140 * chip} fill="url(#hotR)" opacity={chip * (0.85 + 0.15 * Math.sin(t * 9))} />}
        <rect x={270} y={780} width={120} height={120} rx={10} fill="url(#gGold)" stroke="#FFF1B8" strokeWidth={3} filter={chip > 0 ? 'url(#glowBig)' : undefined} />
        <path d="M 310 780 L 310 900 M 350 780 L 350 900 M 270 840 L 390 840" stroke="#7A5A0C" strokeWidth={3} />
        <path d="M 390 840 L 470 840" stroke={chip > 0 ? B.yellow : B.line2} strokeWidth={5} filter={chip > 0 ? 'url(#glow)' : undefined} />
      </g>
      <FgRuler c={c} t={t} y={300} flip seed={6} />
      <Hud x={160} y={280} w={760} label="MEDAN BERUBAH →" value="ARUS DI KUMPARAN" t={t} start={46.4} size={60} end={49.4} />
      <Hud x={200} y={280} w={680} label="DAYA DARI ARUS INDUKSI" value="CHIP MENYALA" t={t} start={49.7} size={70} />
    </g>
  );
};

// ---------- S6a memori + load modulation ----------
const Data: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const q = p(t, 51.0, 51.8);
  const hl = p(t, 52.0, 52.5);
  const wave = p(t, 54.4, 55.2);
  const mod = p(t, 55.6, 56.4);
  const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1];
  const wx0 = 270, wx1 = 970, wy = 1150;
  const pts: string[] = [];
  for (let x = wx0; x <= wx1; x += 4) {
    const bi = Math.min(bits.length - 1, Math.floor(((x - wx0) / (wx1 - wx0)) * bits.length));
    const amp = 46 + (bits[bi] ? 38 * mod : 0);
    pts.push(`${x} ${(wy + Math.sin(x / 7 - t * 18) * amp).toFixed(1)}`);
  }
  return (
    <g>
      <g transform={layer(c, 1)}>
        <Shadow cx={540} cy={960} rx={430} ry={46} />
        <rect x={110} y={420} width={860} height={500} rx={12} fill="#061C38" fillOpacity={0.9 * q} stroke={B.line} strokeWidth={3} {...drawOn(q)} />
        <text x={140} y={470} fill={B.cyan} opacity={q} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3}}>MEMORI CHIP · SEKTOR</text>
        {Array.from({length: 16}).map((_, i) => {
          const r = Math.floor(i / 4), k = i % 4;
          const x = 150 + k * 200, y = 510 + r * 98;
          const isSaldo = i === 5;
          const qi = p(t, 51.2 + i * 0.05, 51.6 + i * 0.05);
          return (
            <g key={i} opacity={qi}>
              <rect x={x} y={y} width={180} height={80} rx={6} fill={isSaldo ? '#3B2F08' : 'url(#gLeft)'} stroke={isSaldo && hl > 0 ? B.yellow : B.line2} strokeWidth={isSaldo ? 4 : 2}
                filter={isSaldo && hl > 0 ? 'url(#glow)' : undefined} />
              {!(hl > 0 && (i === 6 || i === 7)) && <text x={x + 14} y={y + 34} fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 30}}>{`S${String(i).padStart(2, '0')}`}</text>}
            </g>
          );
        })}
        {hl > 0 && (
          <g opacity={hl} transform={`translate(${350 + 90 - 140} 0)`}>
            <rect x={300} y={590} width={420} height={120} rx={10} fill="#061C38" stroke={B.yellow} strokeWidth={4} filter="url(#glow)" />
            <text x={510} y={632} textAnchor="middle" fill={B.cyan} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3}}>SALDO</text>
            <text x={510} y={690} textAnchor="middle" fill={B.yellow} style={{color: B.yellow, fontFamily: HEAD, fontWeight: 700, fontSize: 56}}>Rp85.000</text>
          </g>
        )}
        {/* carrier wave panel */}
        <g opacity={wave}>
          <rect x={250} y={1000} width={740} height={300} rx={12} fill="#061C38" fillOpacity={0.85} stroke={B.line2} strokeWidth={2} />
          <text x={276} y={1048} fill={B.cyan} style={{color: B.cyan, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 1}}>PEMBAWA 13,56 MHz</text>
          <text x={960} y={1048} textAnchor="end" fill={B.yellow} opacity={mod} style={{color: B.yellow, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 1}}>+847,5 kHz</text>
          <path d={`M ${pts.join(' L ')}`} fill="none" stroke={B.cyan} strokeWidth={3} filter="url(#glow)" {...drawOn(p(t, 54.4, 55.6))} />
          {bits.map((b, i) => (
            <text key={i} x={wx0 + (i + 0.5) * ((wx1 - wx0) / bits.length)} y={1280} textAnchor="middle" fill={b ? B.yellow : B.line2}
              opacity={p(t, 58.6 + i * 0.06, 58.9 + i * 0.06)} style={{color: b ? B.yellow : B.line2, fontFamily: MONO, fontWeight: 700, fontSize: 34}}>{b}</text>
          ))}
        </g>
      </g>
      <FgRuler c={c} t={t} y={1340} seed={7} />
      <Title x={540} y={330} text="CHIP MENJAWAB: UBAH BEBAN" t={t} start={54.5} size={54} end={60.1} />
      <Title x={540} y={330} text="BACA SALDO DI MEMORI" t={t} start={51.6} size={58} end={54.4} />
    </g>
  );
};

// ---------- S6b saldo dipotong, palang naik, 4 vs 7 detik ----------
const Palang: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const arm = pio(t, 61.7, 62.6);
  const carX = lerp(110, 1000, pio(t, 62.4, 65.0));
  const cut = t >= 60.6;
  const bar = (y: number, label: string, sec: number, color: string, start: number) => {
    const q = pio(t, start, start + 0.9);
    return (
      <g opacity={p(t, start - 0.1, start + 0.2)}>
        <text x={150} y={y - 14} fill={B.line} style={{color: B.line, fontFamily: MONO, fontWeight: 700, fontSize: 30}}>{label}</text>
        <rect x={150} y={y} width={780} height={56} rx={6} fill="#061C38" stroke={B.line2} strokeWidth={2} />
        <rect x={150} y={y} width={780 * (sec / 7) * q} height={56} rx={6} fill={color} filter="url(#glow)" />
        <text x={150 + 780 * (sec / 7) * q - 14} y={y + 42} textAnchor="end" fill="#061C38" style={{color: "#061C38", fontFamily: HEAD, fontWeight: 700, fontSize: 38}}>{q > 0.3 ? `${sec} dtk` : ''}</text>
      </g>
    );
  };
  return (
    <g>
      <Skyline c={c} y={760} />
      <g transform={layer(c, 1)}>
        <Gate t={t} q={1} arm={arm} carX={carX} screen={cut ? 'Rp70.500' : 'Rp85.000'} screenHot={cut ? 1 : 0} tap={(t - 60.2) / 0.9} labelShift={[-90, -70]} />
      </g>
      <FgRuler c={c} t={t} y={1300} flip seed={8} />
      <g opacity={1 - p(t, 63.0, 63.3)}>
        <Hud x={180} y={210} w={720} label="SALDO DIPOTONG" value="−Rp14.500" t={t} start={60.4} color={B.red} size={80} />
      </g>
      <g opacity={p(t, 63.2, 63.5)}>
        <rect x={110} y={190} width={860} height={300} rx={10} fill="#061C38" fillOpacity={0.88} stroke={B.line} strokeWidth={3} />
        {bar(270, 'e-TOLL (TEMPEL)', 4, B.cyan, 63.3)}
        {bar(410, 'BAYAR TUNAI', 7, B.red, 65.2)}
      </g>
    </g>
  );
};

// ---------- S7 MLFF satelit ----------
const Mlff: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const iso = isoAt(540, 1010, 0.85);
  const q = p(t, 66.0, 66.9);
  const sat = {x: 780, y: 440 + Math.sin(t * 1.3) * 10};
  const cars = [0, 1, 2, 3, 4].map((k) => {
    const lane = k % 3;
    const x = ((t - 66) * (180 + lane * 40) + k * 330) % 1500 - 760;
    return {x, y: 30 + lane * 110};
  });
  const ghost = p(t, 72.9, 73.4);
  return (
    <g>
      <g transform={layer(c, 0.5)}>
        {/* sky glow */}
        <circle cx={sat.x} cy={sat.y} r={260} fill="url(#cyanR)" opacity={0.35} />
      </g>
      <g transform={layer(c, 1)}>
        <path d={poly([iso(-800, 0, 0), iso(800, 0, 0), iso(800, 340, 0), iso(-800, 340, 0)])} fill="#0A2E57" stroke={B.line2} strokeWidth={2} opacity={q} />
        {[113, 226].map((y) => <path key={y} d={seg(iso(-800, y, 0), iso(800, y, 0))} stroke={B.line} strokeWidth={3} strokeDasharray="30 24" opacity={0.6 * q} />)}
        {cars.map((cc, i) => {
          const top = iso(cc.x + 70, cc.y + 40, 70);
          return (
            <g key={i}>
              <Shadow cx={iso(cc.x + 70, cc.y + 40, 0)[0]} cy={iso(cc.x + 70, cc.y + 40, 0)[1] + 6} rx={100} ry={28} />
              <Solid iso={iso} x0={cc.x} x1={cc.x + 150} y0={cc.y} y1={cc.y + 80} z0={6} z1={52} q={q} top="url(#gCard)" />
              <path d={`M ${sat.x} ${sat.y + 40} L ${top[0]} ${top[1]}`} stroke={B.cyan} strokeWidth={2.5} strokeDasharray="10 14" strokeDashoffset={-t * 80}
                opacity={p(t, 68.6, 69.4) * 0.8} filter="url(#glow)" />
              <circle cx={top[0]} cy={top[1]} r={9} fill={B.cyan} opacity={p(t, 68.6, 69.4) * (0.6 + 0.4 * Math.sin(t * 8 + i))} filter="url(#glow)" />
            </g>
          );
        })}
        {/* ghost gate that disappears */}
        {ghost > 0 && (
          <g opacity={ghost * (1 - p(t, 74.0, 74.5))}>
            <path d={poly([iso(300, -40, 0), iso(300, -40, 200), iso(300, 380, 200), iso(300, 380, 0)])} fill="none" stroke={B.line2} strokeWidth={3} strokeDasharray="12 10" />
            <path d={`M ${iso(300, -40, 200)[0]} ${iso(300, -40, 200)[1]} L ${iso(300, 380, 0)[0]} ${iso(300, 380, 0)[1]} M ${iso(300, 380, 200)[0]} ${iso(300, 380, 200)[1]} L ${iso(300, -40, 0)[0]} ${iso(300, -40, 0)[1]}`}
              stroke={B.red} strokeWidth={10} strokeLinecap="round" filter="url(#glow)" {...drawOn(p(t, 73.1, 73.6))} />
          </g>
        )}
        {/* satellite */}
        <g transform={`translate(${sat.x} ${sat.y}) rotate(${-12 + Math.sin(t * 0.8) * 4})`} opacity={p(t, 66.3, 67.0)}>
          <rect x={-200} y={-30} width={140} height={60} fill="url(#hatch)" stroke={B.line} strokeWidth={3} />
          <rect x={60} y={-30} width={140} height={60} fill="url(#hatch)" stroke={B.line} strokeWidth={3} />
          <path d="M -60 0 L -40 0 M 40 0 L 60 0" stroke={B.line} strokeWidth={4} />
          <rect x={-40} y={-44} width={80} height={88} rx={8} fill="url(#gTop)" stroke={B.line} strokeWidth={3} />
          <path d="M 0 44 L 0 66 M -20 76 Q 0 56 20 76" fill="none" stroke={B.yellow} strokeWidth={4} filter="url(#glow)" />
        </g>
      </g>
      <FgRuler c={c} t={t} y={1320} seed={9} />
      <Hud x={60} y={190} w={640} label="TOL MASA DEPAN" value="MLFF" t={t} start={68.6} size={92} color={B.cyan} end={72.8} />
      <Hud x={250} y={1140} w={720} label="UJI COBA · GNSS" value="TOL BALI MANDARA" t={t} start={70.6} size={62} />
      <Title x={360} y={300} text="PALANG HILANG" t={t} start={73.2} size={64} color={B.red} />
    </g>
  );
};

// ---------- S8 hero card + brand ----------
const Outro: React.FC<{t: number; c: Cam}> = ({t, c}) => {
  const iso = isoAt(390, 1000, 1.5);
  const rot = Math.sin((t - 74.7) * 0.55) * 0.22;
  const glow = p(t, 75.2, 76.2);
  return (
    <g>
      <g transform={layer(c, 0.6)}>
        <Reader cx={540} y={1240} q={0.6} field={glow * 0.8} t={t} power={1} label={false} />
      </g>
      <g transform={layer(c, 1)}>
        <g transform={`translate(0 ${-30 + Math.sin(t * 1.4) * 12})`}>
          <Shadow cx={iso(170, 107, 0)[0]} cy={iso(170, 107, 0)[1] + 130} rx={360} ry={70} o={0.8} />
          <Card iso={iso} q={p(t, 74.7, 75.4)} z={80} rot={rot} coil={1} power={glow} chipOn={p(t, 77.0, 77.6)} flow={t} />
        </g>
        <TitleBlock x={280} y={1190} q={p(t, 79.0, 79.8)} dwg="DWG EP02" />
      </g>
      <Title x={540} y={250} text="KOMPUTER KECIL" t={t} start={77.3} size={76} color={B.yellow} />
      <Title x={540} y={340} text="BERTENAGA MAGNET" t={t} start={77.9} size={76} color={B.cyan} />
    </g>
  );
};

// ---------- captions (karaoke, full width, gap 0.4em, above the 380 px UI zone) ----------
type Wd = {text: string; start: number; end: number};
const WORDS = words as Wd[];
const PAGES: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  let chars = 0;
  for (const w of WORDS) {
    if (cur.length && (cur.length >= 4 || chars + w.text.length > 24)) { out.push(cur); cur = []; chars = 0; }
    cur.push(w);
    chars += w.text.length + 1;
    if (/[.?!]$/.test(w.text)) { out.push(cur); cur = []; chars = 0; }
  }
  if (cur.length) out.push(cur);
  return out;
})();
const clean = (s: string) => s.replace(/[.,;:]+$/, '');

const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > ETOLL_SECONDS - OUTRO + 0.05) return null;
  const pg = PAGES.find((g, i) => t >= g[0].start - 0.1 && t < (PAGES[i + 1]?.[0].start ?? g[g.length - 1].end + 0.6) - 0.1);
  if (!pg) return null;
  const pop = p(t, pg[0].start - 0.1, pg[0].start + 0.08);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1385, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: pop, transform: `translateY(${(1 - pop) * 12}px)`}}>
      <div style={{background: '#04152Bdd', border: `2px solid ${B.line2}77`, borderRadius: 10, padding: '16px 26px', width: '100%', textAlign: 'center',
        fontFamily: HEAD, fontWeight: 700, fontSize: 62, lineHeight: 1.15, color: B.line}}>
        {pg.map((w, i) => {
          const on = t >= w.start - 0.04 && t < w.end + 0.06;
          const said = t >= w.start - 0.04;
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 0.2em', color: on ? B.yellow : said ? B.line : '#7FA6D6',
              transform: `scale(${on ? 1.04 : 1})`, textShadow: on ? `0 0 18px ${B.yellow}88` : 'none'}}>{clean(w.text)}</span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- film ----------
export const EtollFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = frame / fps;
  const cams: Record<keyof typeof S, Cam> = {
    hook: camFor(t, ...S.hook, 0, {s: 0.94, x: 40, y: 60}, {s: 1.22, x: -90, y: 120, fy: 700}),
    ctx: camFor(t, ...S.ctx, 1, {s: 1.05, x: 90}, {s: 1.1, x: -90}),
    bongkar: camFor(t, ...S.bongkar, 2, {s: 0.98, y: 40}, {s: 1.28, x: 140, y: -40, fy: 960}),
    medan: camFor(t, ...S.medan, 3, {s: 1.2, y: 60}, {s: 0.98, y: -10}),
    induksi: camFor(t, ...S.induksi, 4, {s: 1.0, x: -60}, {s: 1.12, x: 40, fy: 820}),
    arus: camFor(t, ...S.arus, 5, {s: 1.02}, {s: 1.2, x: 120, fy: 840}),
    data: camFor(t, ...S.data, 6, {s: 1.14, x: -70, y: 40, fy: 800}, {s: 1.0, x: 70, y: -60, fy: 1150}),
    palang: camFor(t, ...S.palang, 7, {s: 1.15, x: -60, fy: 760}, {s: 1.0, x: 60}),
    mlff: camFor(t, ...S.mlff, 8, {s: 1.25, y: -160, fy: 600}, {s: 1.0, y: 20, fy: 900}),
    outro: camFor(t, ...S.outro, 9, {s: 0.95}, {s: 1.12, y: 30}),
  };
  const keys = Object.keys(S) as Array<keyof typeof S>;
  const active = keys.find((k) => t >= S[k][0] && t < S[k][1]) ?? 'outro';
  const scenes: Record<keyof typeof S, React.FC<{t: number; c: Cam}>> = {
    hook: Hook, ctx: Ctx, bongkar: Bongkar, medan: Medan, induksi: Induksi, arus: Arus, data: Data, palang: Palang, mlff: Mlff, outro: Outro,
  };
  return (
    <AbsoluteFill style={{background: '#07223F'}}>
      <StyleFonts />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${width / W})`, transformOrigin: '0 0', overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Defs />
          <rect width={W} height={H} fill="url(#bgR)" />
          <Grid c={cams[active]} />
          <rect width={W} height={H} fill="url(#hazeTop)" />
          <ellipse cx={540 + cams[active].x * 0.4} cy={880} rx={640} ry={560} fill="url(#cyanR)" opacity={0.16} />
          {keys.map((k) => {
            const Sc = scenes[k];
            return (
              <Scene key={k} t={t} w={S[k]}>
                <Sc t={t} c={cams[k]} />
              </Scene>
            );
          })}
          {t < ETOLL_SECONDS - OUTRO + 0.3 && <g opacity={1 - p(t, ETOLL_SECONDS - OUTRO - 0.2, ETOLL_SECONDS - OUTRO + 0.3)}><Floor c={cams[active]} t={t} /></g>}
          <rect width={W} height={H} fill="url(#vig)" pointerEvents="none" />
        </svg>
        <Captions t={t} />
      </div>
      <Html5Audio src={staticFile('audio/vo.wav')} />
      <AudiraOutro seconds={OUTRO} />
      <AudiraSignature seed="etoll-nfc-ep02" />
    </AbsoluteFill>
  );
};
