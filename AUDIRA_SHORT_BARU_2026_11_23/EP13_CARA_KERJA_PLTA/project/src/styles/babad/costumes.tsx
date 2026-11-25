import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFrame} from '../shared';
import {BabadFonts, BB, HEAD, Mood, Outfit, Tokoh, UI} from './kit';

// BABAD costume presets (v1.13). Every preset is plain data: a named classic or a lego spec (HatSpec / GarbSpec in
// kit.tsx). Use them as they are, spread-and-override (costume('belanda-1825', {col: '#2E3B6E'})), or as worked examples
// when assembling a period that is NOT here — research it first (casting sheet, references/STYLES.md → BABAD → Casting)
// and build the hat + garb from parts. Colours are period-plausible flat picks, not museum-exact.

export type CostumeId = keyof typeof COSTUMES;

const W = '#FFFFFF', OFF = '#F2EEE4', OFFSH = '#D9D2C2';
const KHAKI = '#B49A62', KHAKISH = '#937C4C', OLIVE = '#6E7448', OLIVESH = '#565B37';
const DBLUE = '#2C3A6B', DBLUESH = '#1F2950';

export const COSTUMES = {
  // ---- classical Rome (named classics) ----
  'romawi-legiun': {era: 'Romawi kuno', label: 'Legiun Romawi', o: {garb: 'lorica', col: BB.red, colSh: BB.redSh, hat: 'galea', crest: BB.red, crestSh: BB.redSh, pants: BB.head, boot: BB.woodSh}},
  'romawi-senator': {era: 'Romawi kuno', label: 'Senator Romawi', o: {garb: 'toga', col: BB.cream, colSh: BB.creamSh, hat: 'laurel', hairCol: '#5B3A24', sash: BB.purple}},
  // ---- Java, Hindu-Buddhist era (lego) ----
  'majapahit-prajurit': {era: 'Majapahit, abad 13–15', label: 'Prajurit Majapahit', o: {
    garb: {top: 'bare', lower: 'kain', necklace: BB.gold, armlet: BB.gold}, col: BB.head, colSh: BB.headSh, kain: '#9A3A2E', kainSh: '#7A2C22', motif: '#E7B95A',
    hat: {shape: 'bun', col: '#2A1E18', band: BB.gold}, hairCol: '#2A1E18', sash: BB.gold, belt: BB.red, boot: BB.head, beard: 'mustache',
  }},
  'majapahit-raja': {era: 'Majapahit, abad 13–15', label: 'Raja Majapahit', o: {
    garb: {top: 'bare', lower: 'kain', necklace: BB.gold, armlet: BB.gold, hem: BB.gold}, col: BB.head, colSh: BB.headSh, kain: '#5A3D8A', kainSh: '#432C6A', motif: '#F2C75A',
    hat: {shape: 'cyl', col: BB.gold, sh: BB.goldSh, h: 160, w: 0.84, taper: 0.62, band: BB.goldSh, top: 'jewel', badge: 'diamond', badgeCol: BB.red}, hairCol: '#2A1E18', sash: BB.red, boot: BB.head,
  }},
  // ---- Mongol / Yuan (lego) ----
  'mongol-prajurit': {era: 'Mongol / Yuan, abad 13', label: 'Prajurit Mongol', o: {
    garb: {top: 'shirt', lower: 'robe', open: 'wrap', trim: BB.gold, pattern: 'quilt', patternCol: '#24406E'}, col: '#3C5E9A', colSh: '#2C4777', belt: '#E9772E',
    hat: {shape: 'dome', col: '#7A4A30', h: 100, fur: '#5A3B22', top: 'tassel', topCol: BB.red}, boot: '#2A2420', beard: 'mustache', hairCol: '#2A1E18',
  }},
  'mongol-panglima': {era: 'Mongol / Yuan, abad 13', label: 'Panglima Mongol', o: {
    garb: {top: 'shirt', lower: 'robe', pattern: 'lamellar', patternCol: '#5E3A20', hem: BB.gold}, col: '#B0703A', colSh: '#8C5428', belt: BB.red, cape: BB.red, capeSh: BB.redSh,
    hat: {shape: 'dome', col: BB.metal, sh: BB.metalSh, h: 104, shine: true, top: 'spike', flaps: 'layered', flapCol: '#8C5428', band: BB.gold}, boot: '#2A2420', beard: 'goatee', hairCol: '#2A1E18',
  }},
  'mongol-khan': {era: 'Mongol / Yuan, abad 13', label: 'Khan / Kaisar', o: {
    garb: {top: 'shirt', lower: 'robe', open: 'wrap', trim: '#2F4F9A', hem: '#2F4F9A'}, col: BB.gold, colSh: BB.goldSh, belt: BB.red,
    hat: {shape: 'dome', col: '#B0703A', h: 92, fur: '#F2E6CF', top: 'jewel'}, boot: '#2A2420', beard: 'goatee', hairCol: '#2A1E18',
  }},
  // ---- Mataram & VOC, abad 17 (named classics) ----
  'mataram-prajurit': {era: 'Mataram, abad 17', label: 'Prajurit Mataram', o: {garb: 'jawa', col: '#3F5E3B', colSh: '#2E472C', kain: '#7A4E2E', kainSh: '#5E3A20', motif: '#D9B47A', hat: 'blangkon', belt: BB.red, boot: BB.head}},
  'mataram-raja': {era: 'Mataram, abad 17', label: 'Sultan Mataram', o: {
    garb: 'royal', col: '#24315C', colSh: '#18213F', sleeve: '#24315C', kain: '#8C5A32', kainSh: '#6E4426', motif: '#E7C48C', hat: 'kuluk', beard: 'mustache', hairCol: '#2A1E18', keris: true, boot: '#3A2A20',
  }},
  'voc-prajurit': {era: 'VOC, abad 17', label: 'Serdadu VOC', o: {garb: 'doublet', col: '#C9A46A', colSh: '#A8844C', collar: 'band', bandolier: true, hat: 'morion', pants: '#3A3A48', boot: '#2A2420'}},
  'voc-pejabat': {era: 'VOC, abad 17', label: 'Pejabat VOC', o: {garb: 'doublet', col: '#26262C', colSh: '#18181C', collar: 'ruff', beard: 'goatee', hat: 'dutch', hatSh: '#8A6A3A', hairCol: '#5A4030', pants: '#26262C', boot: '#18181C'}},
  // ---- Perang Jawa / Hindia Belanda, abad 19 (lego) ----
  'belanda-1825': {era: 'Hindia Belanda, 1820-an', label: 'Infanteri Belanda', o: {
    garb: {top: 'coat', lower: 'pants', cross: W, buttons: BB.gold, cuff: BB.red}, col: DBLUE, colSh: DBLUESH, pants: OFF, boot: '#1E1A22',
    hat: {shape: 'cyl', col: '#1E1E24', h: 165, w: 0.84, taper: 1.12, peak: '#111114', badge: 'plate', badgeCol: BB.gold, top: 'pom', topCol: W, band: '#2E2E36'}, hairCol: '#6B4A33',
  }},
  'belanda-jenderal-1830': {era: 'Hindia Belanda, 1820-an', label: 'Jenderal Belanda', o: {
    garb: {top: 'coat', lower: 'pants', buttons: BB.gold, double: true, epaulettes: BB.gold, cuff: BB.gold}, col: DBLUE, colSh: DBLUESH, sash: '#E9772E', pants: OFF, boot: '#1E1A22',
    hat: {shape: 'crescent', col: '#1E1E24', band: BB.gold, badge: 'disc', badgeCol: '#E9772E'}, beard: 'mustache', hairCol: '#8A8A8A',
  }},
  'pangeran-jawa-1825': {era: 'Perang Jawa, 1825–1830', label: 'Pangeran bersorban', o: {
    garb: {top: 'shirt', lower: 'robe', open: 'vee'}, col: OFF, colSh: OFFSH, sash: '#3F7A4A', keris: true,
    hat: {shape: 'wrap', col: W, sh: OFFSH, h: 120, w: 1.16, tail: W}, beard: 'goatee', hairCol: '#2A1E18', boot: BB.head,
  }},
  'kolonial-1900': {era: 'Hindia Belanda, sekitar 1900', label: 'Perwira kolonial', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'center', buttons: BB.gold}, col: OFF, colSh: OFFSH, belt: '#5C3D27', pants: OFF, boot: '#3A2A20',
    hat: {shape: 'dome', col: W, sh: OFFSH, h: 88, brim: 46, band: '#C9B88E'}, beard: 'mustache', hairCol: '#6B4A33',
  }},
  // ---- Pendudukan Jepang & revolusi 1945 (lego) ----
  'jepang-1942': {era: 'Pendudukan Jepang, 1942–1945', label: 'Tentara Jepang', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'center', buttons: KHAKISH, buckle: BB.metal}, col: KHAKI, colSh: KHAKISH, belt: '#5C3D27', pants: KHAKI, boot: '#4A3424',
    hat: {shape: 'cap', col: KHAKI, sh: KHAKISH, peak: KHAKISH, badge: 'star', badgeCol: BB.gold, flaps: 'cloth', flapCol: KHAKI},
  }},
  'pejuang-1945': {era: 'Revolusi, 1945–1949', label: 'Pejuang (peci)', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'center', buttons: OFFSH, armband: [BB.red, W]}, col: OFF, colSh: OFFSH, pants: '#7A6A52', boot: '#3A2A20',
    hat: {shape: 'cyl', col: '#1E1E24', h: 72, w: 0.8, taper: 0.9}, hairCol: '#2A1E18',
  }},
  'pejuang-ikat-1945': {era: 'Revolusi, 1945–1949', label: 'Pejuang (ikat kepala)', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'vee'}, col: KHAKI, colSh: KHAKISH, pants: '#4A4A52', boot: BB.head,
    hat: {shape: 'none', col: BB.red, band: BB.red, tail: BB.red, hair: true}, hairCol: '#2A1E18',
  }},
  'sekutu-1945': {era: 'Sekutu / NICA, 1945–1946', label: 'Tentara Sekutu', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'center', buttons: OLIVESH, buckle: BB.metal}, col: OLIVE, colSh: OLIVESH, belt: '#B8A77A', pants: OLIVE, boot: '#2A2420',
    hat: {shape: 'dome', col: OLIVE, sh: OLIVESH, h: 56, w: 1.04, brim: 42},
  }},
  // ---- rakyat ----
  'petani-caping': {era: 'segala zaman (Nusantara)', label: 'Petani bercaping', o: {
    garb: {top: 'shirt', lower: 'pants', open: 'vee'}, col: '#4F6A7A', colSh: '#3C5260', pants: '#3A3A48', boot: BB.head,
    hat: {shape: 'cone', col: '#E2C27A', sh: '#C4A35C', w: 2.1, h: 84}, hairCol: '#2A1E18',
  }},
} satisfies Record<string, {era: string; label: string; o: Outfit}>;

/** A preset outfit, optionally overridden: costume('mongol-prajurit', {col: '#5E4A7A'}). */
export const costume = (id: CostumeId, over: Partial<Outfit> = {}): Outfit => ({...(COSTUMES[id].o as Outfit), ...over});

export type CastEntry = {label: string; note?: string; o: Outfit; mood?: Mood; hold?: React.ReactNode; holdRot?: number; armR?: number};

/** Casting lineup still (QA, never a delivery): every character of an episode side by side with its name and the
 * identifying cues from the casting sheet. Render ONE still of this before animating and check it against the sheet. */
export const CastSheet: React.FC<{cast: CastEntry[]; title?: string}> = ({cast, title = 'CASTING'}) => {
  const fr = useFrame();
  const {W: FW, H: FH, wide} = fr;
  const t = useCurrentFrame() / useVideoConfig().fps;
  const cols = wide ? Math.min(6, Math.max(3, Math.ceil(cast.length / 2))) : cast.length > 9 ? 4 : 3;
  const rows = Math.ceil(cast.length / cols);
  const top = wide ? 150 : 210, cellW = FW / cols, cellH = (FH - top - 40) / rows;
  // wide headwear (caping, bicorne) is allowed to touch the cell edge; each cell clips its character
  const s = Math.min(cellW / 440, (cellH - 130) / 640);
  const fit = (txt: string, max: number, em: number) => Math.min(max, (cellW - 28) / (txt.length * em));
  return (
    <AbsoluteFill style={{background: BB.parch}}>
      <BabadFonts />
      <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
        <text x={FW / 2} y={top - 70} textAnchor="middle" fill={BB.ink} style={{fontFamily: HEAD, fontSize: wide ? 72 : 84}}>{title}</text>
        {cast.map((c, i) => {
          const cx = cellW * (i % cols) + cellW / 2, cy = top + cellH * Math.floor(i / cols);
          const feet = cy + cellH - 104;
          return (
            <g key={i}>
              <defs><clipPath id={`cast-cell-${i}`}><rect x={cx - cellW / 2 + 10} y={cy + 6} width={cellW - 20} height={cellH - 12} rx={18} /></clipPath></defs>
              <rect x={cx - cellW / 2 + 10} y={cy + 6} width={cellW - 20} height={cellH - 12} rx={18} fill={BB.parchSh} opacity={0.35} />
              <g clipPath={`url(#cast-cell-${i})`}>
              <Tokoh t={t} x={cx} y={feet} s={s} o={c.o} mood={c.mood ?? 'neutral'} seed={i * 7 + 3} holdR={c.hold} holdRRot={c.holdRot ?? 0} armR={c.armR ?? (c.hold ? 24 : 6)} noBlink />
              </g>
              <text x={cx} y={feet + 52} textAnchor="middle" fill={BB.ink} style={{fontFamily: HEAD, fontSize: fit(c.label, Math.min(44, cellW / 9), 0.52)}}>{c.label}</text>
              {c.note && <text x={cx} y={feet + 86} textAnchor="middle" fill={BB.woodSh} style={{fontFamily: UI, fontWeight: 800, fontSize: fit(c.note, Math.min(26, cellW / 15), 0.55)}}>{c.note}</text>}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** All presets in one lineup (kit QA). */
export const CostumeCatalog: React.FC = () => (
  <CastSheet title="KOSTUM BABAD" cast={(Object.keys(COSTUMES) as CostumeId[]).map((id) => ({label: COSTUMES[id].label, note: COSTUMES[id].era, o: costume(id)}))} />
);
