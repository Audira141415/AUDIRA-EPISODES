// Broadcast display face (Barlow Condensed, OFL) for the EP03 graphics, held by delayRender until loaded.
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

export const DISPLAY = "EP03Barlow";
const FACES: [string, string][] = [
  ["800", "fonts/BarlowCondensed-ExtraBold.ttf"],
  ["600", "fonts/BarlowCondensed-SemiBold.ttf"],
];

let ready: Promise<void> | null = null;
const load = () => {
  if (!ready) {
    ready = Promise.all(
      FACES.map(([w, file]) =>
        new FontFace(DISPLAY, `url(${staticFile(file)}) format("truetype")`, { weight: w }).load().then((f) => {
          (document.fonts as unknown as { add: (x: FontFace) => void }).add(f);
        }),
      ),
    ).then(() => undefined);
  }
  return ready;
};

export const useDisplayFont = () => {
  const [handle] = useState(() => delayRender("ep03 display font"));
  useEffect(() => {
    load().then(
      () => continueRender(handle),
      () => continueRender(handle),
    );
  }, [handle]);
};
