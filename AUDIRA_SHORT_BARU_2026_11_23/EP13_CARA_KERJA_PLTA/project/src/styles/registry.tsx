import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StyleFonts} from './shared';
import {ArsipDemo} from './arsip/demo';
import {BlueprintDemo} from './blueprint/demo';
import {SketsaDemo} from './sketsa/demo';
import {HikayatDemo} from './hikayat/demo';
import {GeometrikDemo} from './geometrik/demo';
import {TerminalDemo} from './terminal/demo';
import {LantangDemo} from './lantang/demo';
import {FlatlifeDemo} from './flatlife/demo';
import {CairDemo} from './cair/demo';
import {PetaDemo} from './peta/demo';
import {KlipingDemo} from './kliping/demo';
import {LempungDemo} from './lempung/demo';
import {KasetDemo} from './kaset/demo';
import {PikselDemo} from './piksel/demo';
import {TitikDemo} from './titik/demo';
import {MabarDemo} from './mabar/demo';
import {BabadDemo} from './babad/demo';
import {SemestaDemo} from './semesta/demo';
import {TubuhDemo} from './tubuh/demo';
import {ChatDemo} from './chat/demo';
import {AngkaDemo} from './angka/demo';
import {PapanDemo} from './papan/demo';

// The twenty-two kit looks in StyleGallery order. Each demo is 4 s unless `seconds` says otherwise (SEMESTA 8, TUBUH 7,
// CHAT 6, ANGKA 6, PAPAN 8) and reads useFrame(), so the same
// component renders the portrait sheet (StyleGallery, Look-<ID>) and the landscape sheet (StyleGalleryWide, Look-<ID>-Wide).
// MIDNIGHT and MINIATUR use the base kit: KitGallery / KitGalleryWide.
export const LOOKS: Array<{id: string; Demo: React.FC; seconds?: number}> = [
  {id: 'ARSIP', Demo: ArsipDemo},
  {id: 'BLUEPRINT', Demo: BlueprintDemo},
  {id: 'SKETSA', Demo: SketsaDemo},
  {id: 'HIKAYAT', Demo: HikayatDemo},
  {id: 'GEOMETRIK', Demo: GeometrikDemo},
  {id: 'TERMINAL', Demo: TerminalDemo},
  {id: 'LANTANG', Demo: LantangDemo},
  {id: 'FLATLIFE', Demo: FlatlifeDemo},
  {id: 'CAIR', Demo: CairDemo},
  {id: 'PETA', Demo: PetaDemo},
  {id: 'KLIPING', Demo: KlipingDemo},
  {id: 'LEMPUNG', Demo: LempungDemo},
  {id: 'KASET', Demo: KasetDemo},
  {id: 'PIKSEL', Demo: PikselDemo},
  {id: 'TITIK', Demo: TitikDemo},
  {id: 'MABAR', Demo: MabarDemo},
  {id: 'BABAD', Demo: BabadDemo},
  {id: 'SEMESTA', Demo: SemestaDemo, seconds: 8},
  {id: 'TUBUH', Demo: TubuhDemo, seconds: 7},
  {id: 'CHAT', Demo: ChatDemo, seconds: 6},
  {id: 'ANGKA', Demo: AngkaDemo, seconds: 6},
  {id: 'PAPAN', Demo: PapanDemo, seconds: 8},
];
/** Demo length in seconds (default 4) and its start inside StyleGallery. */
export const lookSeconds = (id: string) => LOOKS.find((l) => l.id === id)?.seconds ?? 4;
export const lookStart = (i: number) => LOOKS.slice(0, i).reduce((s, l) => s + (l.seconds ?? 4), 0);
export const GALLERY_SECONDS = lookStart(LOOKS.length);

/** One look's demo on its own (Look-<ID> / Look-<ID>-Wide compositions). */
export const LookDemo: React.FC<{id: string}> = ({id}) => {
  const Demo = LOOKS.find((l) => l.id === id)?.Demo ?? (() => null);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <StyleFonts />
      <Demo />
    </AbsoluteFill>
  );
};
