import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Plta, PLTA_SECONDS} from './Plta';

const Root: React.FC = () => (
  <>
    <Composition id="PltaEP13" component={Plta} durationInFrames={Math.round(PLTA_SECONDS * 60)} fps={60} width={1080} height={1920} />
    <Composition id="PltaEP13-Draft" component={Plta} durationInFrames={Math.round(PLTA_SECONDS * 30)} fps={30} width={1080} height={1920} />
    <Composition id="PltaEP13-Cover" component={Plta} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{cover: 6.4}} />
  </>
);
registerRoot(Root);
