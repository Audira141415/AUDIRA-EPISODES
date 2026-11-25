import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Gua, GUA_SECONDS} from './Gua';

const Root: React.FC = () => (
  <>
    <Composition id="GuaEP25" component={Gua} durationInFrames={Math.round(GUA_SECONDS * 60)} fps={60} width={1080} height={1920} />
    <Composition id="GuaEP25-Draft" component={Gua} durationInFrames={Math.round(GUA_SECONDS * 30)} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
