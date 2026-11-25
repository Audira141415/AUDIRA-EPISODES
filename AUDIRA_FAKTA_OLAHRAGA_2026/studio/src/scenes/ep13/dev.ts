import React from "react";
import { Composition, registerRoot } from "remotion";
import { Cover, Film, TOTAL_SECONDS } from "./index.ts";
const n = Math.ceil(TOTAL_SECONDS * 30);
registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(Composition, { id: "Ep13Preview", component: Film, durationInFrames: n, fps: 30, width: 540, height: 960 }),
  React.createElement(Composition, { id: "Ep13Cover", component: Cover, durationInFrames: 30, fps: 30, width: 1080, height: 1920 })));
