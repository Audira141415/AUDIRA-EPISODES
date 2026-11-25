import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionPage} from '../../components/WordCaptions';
import {lerp, p, pb, useFrame} from '../shared';
import {HalusDefs, HalusLight, useHalus} from '../../lib/halus';
import {ArmyFar, babadScene, BabadCaption, BabadFonts, BB, Field, Hot, Night, Outfit, QMark, Ribbon, Spear, Title, Tokoh, punch} from './kit';
import {Flames, Keris, Lumbung, Smoke, Spyglass, Umbul} from './props';

// BABAD StyleGallery demo (4 s QA sheet, never a delivery): a day field with a royal Javanese army — far rows of tiny
// blangkon heads, banners, a front rank with spears and the king in front — "10.000" slams in under a name ribbon;
// whip pan to night: a spy in a dark cape watches through a spyglass, the rice barn catches fire, "DIBAKAR." slams.
// Landscape (Look-BABAD-Wide): the army fills the land on the left two-thirds with the king front-left, the title,
// ribbon and caption stack in the sky on the right third; after the whip the spy + title + caption sit on the left,
// the burning barn on the right. Whip distance = W + 100.
// HALUS (v1.16): babadScene() — whip when off, zoom-dissolve + drift when on; titles/ribbons/captions in the still HUD
// group of each scene, <HalusLight> over the pictures and under the HUD.

const fakePage = (text: string, start: number, end: number): CaptionPage[] => {
  const ws = text.split(' ').map((word, i) => ({i, word, start: start + i * 0.28, end: start + i * 0.28 + 0.25}));
  return [{start, end, words: ws}];
};
const PAGES = [...fakePage('Sepuluh ribu', 0.15, 1.1), ...fakePage('prajurit Mataram', 1.15, 2.2), ...fakePage('Lumbungnya ketahuan...', 2.35, 3.15), ...fakePage('dibakar.', 3.2, 4.2)];
const HOT: Hot = {ribu: BB.gold, mataram: BB.gold, lumbungnya: BB.gold, dibakar: BB.red};
const KING: Outfit = {
  garb: 'royal', col: '#24315C', colSh: '#18213F', sleeve: '#24315C', kain: '#8C5A32', kainSh: '#6E4426', motif: '#E7C48C', hat: 'kuluk',
  beard: 'mustache', hairCol: '#2A1E18', keris: true, boot: '#3A2A20',
};
const MAT = (col: string, colSh: string, kain: string, kainSh: string, belt: string): Outfit => ({
  garb: 'jawa', col, colSh, kain, kainSh, motif: '#D9B47A', hat: 'blangkon', belt, boot: BB.head,
});
const MATS = [MAT('#3F5E3B', '#2E472C', '#7A4E2E', '#5E3A20', BB.red), MAT('#5E4A7A', '#46375C', '#6E4A2C', '#523620', BB.gold), MAT('#7A4A30', '#5C3622', '#3E4E6A', '#2E3A50', BB.red), MAT('#2F5A66', '#22444D', '#8A5A32', '#6C4426', BB.gold)];
const SPY: Outfit = {garb: 'doublet', col: '#3A3440', colSh: '#2A2530', collar: 'band', hat: 'dutch', cape: '#2A2530', pants: '#2A2530', boot: '#1E1A22', beard: 'mustache', hairCol: '#6B4A33'};

const WHIP = 2.25;
const FIRE = 2.85;
const SLAM = 0.75;

/** Burning rice barn, origin = barn base centre. */
const Burn: React.FC<{t: number}> = ({t}) => {
  const fire = p(t, FIRE, FIRE + 0.6);
  return (
    <g>
      <Lumbung burnt={0} />
      {fire > 0 && (
        <g>
          <Smoke t={t} x={0} y={-700} n={6} r={80} rise={600} col="#4C4858" />
          <g transform="translate(0 -340)"><Flames t={t} w={420} h={420} q={fire} seed={2} /></g>
          <g transform="translate(0 0)"><Flames t={t} w={300} h={180} q={fire} seed={5} /></g>
        </g>
      )}
    </g>
  );
};
/** Spy behind a dark bush, origin = feet. */
const Spy: React.FC<{t: number; s: number}> = ({t, s}) => {
  const peek = pb(t, WHIP + 0.1, WHIP + 0.4);
  return (
    <g>
      <Tokoh t={t} x={0} y={-peek * 160} s={s} o={SPY} seed={80} flip mood={t > FIRE ? 'grin' : 'smug'} lx={-0.8} ly={-0.4}
        armR={100} holdR={<Spyglass sw={7 / s} />} holdRRot={60} />
      {[[-140, -60, 120], [-10, -100, 140], [120, -50, 110]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#24412F" />)}
      {[[-80, -120, 70], [50, -150, 80]].map(([x, y, r], i) => <circle key={'b' + i} cx={x} cy={y} r={r} fill="#2F5440" />)}
    </g>
  );
};
/** Front rank with spears. */
const rank = (t: number, xs: number[], y: number, s: number, seed: number) =>
  xs.map((x, i) => <Tokoh key={i} t={t} x={x} y={y} s={s} o={MATS[(i + seed) % 4]} seed={seed + i} holdR={<Spear sw={7 / s} />} armR={12} mood="proud" />);

export const BabadDemo: React.FC = () => {
  const fr = useFrame();
  const {W, H, wide} = fr;
  const t = useCurrentFrame() / useVideoConfig().fps;
  const A = babadScene(t, {i: 0, from: 0, nextFrom: WHIP, W, H});
  const B = babadScene(t, {i: 1, from: WHIP, W, H});
  const halus = useHalus('BABAD').full;
  const sh = punch(t, [FIRE], 10, 0.35);
  const king = (
    <Tokoh t={t} x={0} y={0} s={1} o={KING} seed={12} mood={t > SLAM ? 'proud' : 'smug'} armR={lerp(20, 150, pb(t, SLAM, SLAM + 0.3))} holdR={<Keris sw={7} />} holdRRot={-20} ly={-0.3} />
  );
  const shk = `translate(${sh.x} ${sh.y})`;
  return (
    <AbsoluteFill style={{background: BB.sky, overflow: 'hidden'}}>
      <BabadFonts />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs><clipPath id="bbd-screen"><rect x={0} y={0} width={W} height={H} /></clipPath></defs>
        {halus && <HalusDefs ink={BB.ink} />}
        {A.show && (
          <g transform={A.transform} opacity={A.opacity}><g clipPath="url(#bbd-screen)">
            {wide ? (
              <g>
                <Field t={t} seed={1} />
                <ArmyFar t={t} y0={720} rows={7} s0={0.1} ds={0.018} dy={32} x0={-80} seed={3} />
                {[[70, 930], [820, 935]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Umbul t={t} h={420} seed={i} col={i ? BB.red : BB.gold} col2={i ? BB.gold : BB.red} /></g>)}
                {rank(t, [190, 400, 860, 1070], 1040, 0.52, 3)}
                <g transform={`translate(630 1150) scale(0.86)`}>{king}</g>
              </g>
            ) : (
              <g>
                <Field t={t} seed={1} />
                <ArmyFar t={t} y0={1300} rows={6} s0={0.12} ds={0.02} dy={38} x0={-80} seed={3} />
                {[[60, 1560], [1020, 1550]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><Umbul t={t} h={520} seed={i} col={i ? BB.red : BB.gold} col2={i ? BB.gold : BB.red} /></g>)}
                {rank(t, [150, 350, 730, 930], 1660, 0.5, 3)}
                <g transform={`translate(540 1840) scale(0.78)`}>{king}</g>
              </g>
            )}
          </g></g>
        )}
        {halus && A.show && <g opacity={A.opacity}><HalusLight w={W} h={H} /></g>}
        {A.show && (
          <g transform={A.hud} opacity={A.hudOpacity}><g clipPath="url(#bbd-screen)">
            {wide ? (
              <g>
                <Title t={t} at={SLAM} x={1420} y={250} text="10.000" size={180} col={BB.gold} />
                <Ribbon t={t} at={0.25} x={1420} y={390} text="PRAJURIT MATARAM" size={42} />
                <BabadCaption t={t} pages={PAGES} x={1420} y={560} hot={HOT} size={84} />
              </g>
            ) : (
              <g>
                <Title t={t} at={SLAM} x={540} y={400} text="10.000" size={200} col={BB.gold} />
                <Ribbon t={t} at={0.25} x={540} y={560} text="PRAJURIT MATARAM" size={54} />
                <BabadCaption t={t} pages={PAGES} y={1000} hot={HOT} />
              </g>
            )}
          </g></g>
        )}
        {B.show && (
          <g transform={B.transform} opacity={B.opacity}><g clipPath="url(#bbd-screen)">
            <g transform={shk}>
              {wide ? (
                <g>
                  <Night />
                  <g transform="translate(1300 960) scale(0.95)"><Burn t={t} /></g>
                  <g transform="translate(560 1110) scale(1.1)"><Spy t={t} s={0.8} /></g>
                  <QMark t={t} at={WHIP + 0.3} out={FIRE - 0.2} x={1300} y={300} s={1.0} col={BB.red} text="!" />
                </g>
              ) : (
                <g>
                  <Night ground={1560} />
                  <g transform="translate(600 1600)"><Burn t={t} /></g>
                  <g transform="translate(200 1820)"><Spy t={t} s={0.8} /></g>
                  <QMark t={t} at={WHIP + 0.3} out={FIRE - 0.2} x={600} y={780} s={1.2} col={BB.red} text="!" />
                </g>
              )}
            </g>
          </g></g>
        )}
        {halus && B.show && <g opacity={B.opacity}><HalusLight w={W} h={H} strength={0.75} /></g>}
        {B.show && (
          <g transform={B.hud} opacity={B.hudOpacity}><g clipPath="url(#bbd-screen)">
            <g transform={shk}>
              {wide ? (
                <g>
                  <Title t={t} at={FIRE + 0.02} x={560} y={230} text="DIBAKAR." size={160} col={BB.flame} />
                  <BabadCaption t={t} pages={PAGES} x={560} y={430} hot={HOT} size={84} />
                </g>
              ) : (
                <g>
                  <Title t={t} at={FIRE + 0.02} x={540} y={360} text="DIBAKAR." size={170} col={BB.flame} />
                  <BabadCaption t={t} pages={PAGES} y={1860} hot={HOT} />
                </g>
              )}
            </g>
          </g></g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
