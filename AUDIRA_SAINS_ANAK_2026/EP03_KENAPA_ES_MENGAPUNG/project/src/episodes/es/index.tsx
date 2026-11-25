import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Es, ES_SECONDS} from './Es';

const Root: React.FC = () => (
  <>
    <Composition id="EsEP03" component={Es} durationInFrames={Math.round(ES_SECONDS * 60)} fps={60} width={1080} height={1920} />
    <Composition id="EsEP03-Draft" component={Es} durationInFrames={Math.round(ES_SECONDS * 30)} fps={30} width={1080} height={1920} />
    <Composition id="EsEP03-Cover" component={Es} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{cover: 5.9}} />
  </>
);
registerRoot(Root);
