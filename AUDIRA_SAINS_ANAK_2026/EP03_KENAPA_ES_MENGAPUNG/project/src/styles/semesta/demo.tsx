import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {lerp, p, pio, useFrame} from '../shared';
import {
  camOf, camPath, Captions, circ, Earth, MOON_COPPER, MOON_DARK, MOON_PEN, Pill, polyD, popIn, SEM, ShadeLayer, ShadowedMoon,
  semScene, Stargazer, GAZE_REST, Sun, useSemFonts,
} from './kit';
import {HalusDefs, HalusLight, useHalus} from '../../lib/halus';
import {coneGeom, NightVillage, ShadowCone, SpaceSky, StrataBand, VILLAGE, Villager, VPALS} from './props';

// SEMESTA StyleGallery demo (8 s QA sheet, never a delivery) — the look's signature moves in one continuous camera:
// a Java/Bali night village under a full Moon; Earth's shadow bites in as a hard posterized band and the moonlight dims
// in steps → cloud strata wipe up into space → Sun–Earth–Moon in line, the umbra/penumbra cone extends and darkens the
// Moon → the Moon fills the frame inside the umbra and its bands turn copper ("BULAN MERAH").
// Landscape (Look-SEMESTA-Wide) re-composes: village with the Moon high right, a horizontal Sun → Earth → Moon diagram,
// the red Moon right of centre with the pill on the left. Flat colours only; captions with the dark outline (default).
// HALUS (v1.16): village and space pictures drift (semScene) inside the strata-wipe clips (the wipe is kept), soft
// light at 0.6 over the picture; the BULAN MERAH title pill and captions stay still above it.

const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.3, end: start + i * 0.3 + 0.26}));
  return [{start, end, words: ws}];
};
const PAGES = [...fakePage('Bulan purnama', 0.15, 1.2), ...fakePage('pelan-pelan hilang...', 1.25, 2.5), ...fakePage('Bayangan Bumi', 2.9, 3.9),
  ...fakePage('jatuh ke Bulan.', 3.95, 5.3), ...fakePage('Malah jadi', 5.6, 6.5), ...fakePage('merah.', 6.55, 8.0)];
const RISE0 = 2.25, RISE1 = 2.95; // strata wipe village → space
const CONE = 3.55; // cone extends
const PUSH0 = 5.25, PUSH1 = 6.0; // the Moon grows to fill the frame
const RED = 6.55; // copper sweep

export const SemestaDemo: React.FC = () => {
  const fr = useFrame();
  const {W, H, wide} = fr;
  const t = useCurrentFrame() / useVideoConfig().fps;
  const ready = useSemFonts();
  const halus = useHalus('SEMESTA').full;
  if (!ready) return <AbsoluteFill style={{background: SEM.space}} />;

  // ---- village (rest coordinates of the frame's layout) ----
  const V = VILLAGE[wide ? 'landscape' : 'portrait'];
  const rest = camOf(fr);
  const camV = camPath(t, rest, [{from: 0, to: RISE0, y: rest.y - 30, z: 1.04}, {from: RISE0 - 0.1, to: RISE1 + 0.2, y: rest.y - 1700}]);
  const MV = wide ? {x: 1500, y: 250, r: 130} : {x: 720, y: 400, r: 150};
  const so = lerp(-4.75, -1.7, pio(t, 0.35, 2.0)); // Earth's shadow offset on the Moon (Moon radii)
  const dim = (p(t, 0.6, 0.9) + p(t, 1.0, 1.3) + p(t, 1.4, 1.7) + p(t, 1.8, 2.1)) / 4;
  const villageMoon = (
    <ShadowedMoon id="dmv" x={MV.x} y={MV.y} r={MV.r} theta={-30} beta={0.32}
      layers={[{d: circ(MV.x + so * MV.r, MV.y, 3.5 * MV.r), tones: MOON_PEN}, {d: circ(MV.x + so * MV.r, MV.y, 2.7 * MV.r), tones: MOON_DARK}]} />
  );
  const yardY = wide ? 880 : 1496;
  const crowdX = wide ? [430, 540, 650] : [210, 340, 470];
  const kidX = wide ? 900 : 760;
  const yard = (
    <g>
      {crowdX.map((x, i) => (
        <g key={i} transform={`translate(${x} ${yardY}) scale(0.9)`}>
          <Villager id={`dv${i}`} t={t} garb={(['peci', 'kebaya', 'udeng'] as const)[i]} pal={[VPALS.pak, VPALS.bu, VPALS.bli][i]} seed={i + 1}
            pose={{head: -8, look: [0.45, -1], mouth: t > 1.3 && i === 1 ? 1 : 0, handR: i === 0 ? [lerp(30, 58, pio(t, 1.0, 1.4)), lerp(-86, -192, pio(t, 1.0, 1.4))] : [30, -86]}} />
        </g>
      ))}
      <g transform={`translate(${kidX} ${yardY}) scale(${wide ? 0.95 : 1.02})`}>
        <Stargazer id="dgz" t={t} g={{...GAZE_REST, lean: 12, head: -10, armR: [40, 70], armL: [22, 20]}} scope={{x: 58, y: -184, ang: -60}} light={[6, -3]} />
      </g>
    </g>
  );
  const riseYB = lerp(-320, H + 420, pio(t, RISE0, RISE1));

  // ---- space diagram ----
  const S = wide ? {x: -150, y: 520, r: 380} : {x: 90, y: 170, r: 360};
  const E = wide ? {x: 760, y: 560, r: 118} : {x: 480, y: 880, r: 128};
  const dir = Math.atan2(E.y - S.y, E.x - S.x);
  const dist = wide ? 680 : 600;
  const M = {x: E.x + dist * Math.cos(dir), y: E.y + dist * Math.sin(dir), r: wide ? 62 : 68};
  const lightTheta = (dir * 180) / Math.PI + 180;
  const coneQ = p(t, CONE, CONE + 1.0, Easing.inOut(Easing.quad));
  const g = coneGeom(E.x, E.y, E.r, (dir * 180) / Math.PI, (dist + 180) * coneQ + 1, 0.55, 1.7, 2);
  const inLine = coneQ > 0;
  const moonLayers: ShadeLayer[] = inLine ? [...g.pens.map((pp) => ({d: polyD(pp), tones: MOON_PEN})), {d: polyD(g.umbra), tones: MOON_DARK}] : [];
  const spaceIn = pio(t, RISE0 + 0.2, RISE1 + 0.2);
  const diagOut = pio(t, PUSH0, PUSH1);

  // ---- red Moon (the diagram Moon grows into the frame, already inside the umbra) ----
  const RM = wide ? {x: 1240, y: 520, r: 300} : {x: 540, y: 860, r: 330};
  const mq = pio(t, PUSH0, PUSH1);
  const rm = {x: lerp(M.x, RM.x, mq), y: lerp(M.y, RM.y, mq), r: Math.exp(lerp(Math.log(M.r), Math.log(RM.r), mq))};
  const red = p(t, RED - 0.05, RED + 0.6, Easing.inOut(Easing.quad));
  const k = rm.r / RM.r;
  const redLayers: ShadeLayer[] = [{d: circ(RM.x, RM.y, RM.r * 1.05), tones: MOON_DARK}];
  if (red > 0) redLayers.push({d: circ(RM.x - RM.r - 900 + red * 1560, RM.y - 120, 900 + red * 120), tones: MOON_COPPER});

  return (
    <AbsoluteFill style={{background: SEM.space, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="dsem-top"><rect x={-20} y={-2000} width={W + 40} height={Math.max(0, riseYB + 2000)} /></clipPath>
          <clipPath id="dsem-bot"><rect x={-20} y={riseYB} width={W + 40} height={H + 2600} /></clipPath>
        </defs>
        {halus && <HalusDefs ink={SEM.ink} />}
        {/* village */}
        {t < RISE1 + 0.05 && (
          <g clipPath={t > RISE0 ? 'url(#dsem-bot)' : undefined}>
            <g transform={semScene(t, {i: 0, from: 0, to: RISE1, W, H})}>
              <NightVillage t={t} cam={camV} dim={dim} doors={p(t, 0.9, 1.4)} moon={villageMoon} yard={yard} id="dsem" />
            </g>
          </g>
        )}
        {/* space */}
        {t > RISE0 && (
          <g clipPath={t < RISE1 ? 'url(#dsem-top)' : undefined}>
            <g transform={semScene(t, {i: 1, from: RISE0, to: 8, W, H})}>
            <SpaceSky t={t} cam={{...rest, y: rest.y + (t - RISE0) * 8}} />
            {diagOut < 0.99 && (
              <g opacity={1 - diagOut}>
                <g transform={`translate(${lerp(-260, 0, spaceIn) * (wide ? 1.2 : 1)} ${lerp(-200, 0, spaceIn)})`}><Sun x={S.x} y={S.y} r={S.r} t={t} /></g>
                {coneQ > 0.01 && <ShadowCone g={g} umbra="#08142A" pens={['#112B52', '#0D2244']} />}
                <Earth id="dse" x={E.x} y={E.y} r={E.r * p(t, RISE0 + 0.3, RISE0 + 0.7)} theta={lightTheta} beta={Math.PI / 2} lon={1.75 + t * 0.03} />
                <Pill x={wide ? 470 : 470} y={wide ? 300 : 330} text="MATAHARI" q={popIn(t, 2.95)} bg={SEM.sun} size={44} align="l" />
                <Pill x={E.x - E.r - 24} y={E.y} text="BUMI" q={popIn(t, 3.15)} bg={SEM.mint} size={44} align="r" />
                <Pill x={M.x + (wide ? 0 : -M.r - 22)} y={M.y + (wide ? -M.r - 50 : 6)} text="BULAN" q={popIn(t, 3.35)} bg={SEM.cream} size={44} align={wide ? 'c' : 'r'} />
                <Pill x={E.x + Math.cos(dir) * (dist * 0.55)} y={E.y + Math.sin(dir) * (dist * 0.55)} text="UMBRA" q={popIn(t, CONE + 0.45)} bg={SEM.ink} fg={SEM.cream} size={34} drop="#00000000" />
              </g>
            )}
            {/* the diagram Moon (inside the umbra by now) hands over to the growing Moon at PUSH0: same tones + light, no pop */}
            {t > RISE1 && t <= PUSH0 && <ShadowedMoon id="dsm" x={M.x} y={M.y} r={M.r} theta={lightTheta} beta={Math.PI / 2} layers={moonLayers} />}
            {t > PUSH0 && (
              <g transform={`translate(${rm.x.toFixed(2)} ${rm.y.toFixed(2)}) scale(${k.toFixed(5)}) translate(${-RM.x} ${-RM.y})`}>
                <ShadowedMoon id="dsr" x={RM.x} y={RM.y} r={RM.r} theta={lerp(lightTheta, 325, mq)} beta={lerp(Math.PI / 2, 0.22, mq)} layers={redLayers} />
              </g>
            )}
            </g>
          </g>
        )}
        {t > RISE0 && t < RISE1 + 0.05 && <StrataBand yb={riseYB} seed={41} />}
        {halus && <HalusLight w={W} h={H} strength={0.6} />}
        {t > RISE0 && <Pill x={wide ? 380 : 540} y={wide ? 520 : 330} text="BULAN MERAH" q={popIn(t, RED)} bg={SEM.coral} size={wide ? 70 : 62} />}
        <Captions t={t} pages={PAGES} />
      </svg>
    </AbsoluteFill>
  );
};
