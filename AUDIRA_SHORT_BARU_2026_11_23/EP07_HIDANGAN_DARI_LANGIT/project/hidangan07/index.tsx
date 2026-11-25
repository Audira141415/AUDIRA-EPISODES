import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Hidangan, HIDANGAN_SECONDS} from './Hidangan';

const Root: React.FC = () => (
  <>
    <Composition id="HidanganEP07" component={Hidangan} durationInFrames={Math.round(HIDANGAN_SECONDS * 60)} fps={60} width={1080} height={1920} />
    <Composition id="HidanganEP07-Draft" component={Hidangan} durationInFrames={Math.round(HIDANGAN_SECONDS * 30)} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
