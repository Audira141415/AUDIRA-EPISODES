// EP02 fonts: bundled TTFs from public/fonts (Anton display, Space Grotesk text), loaded once with
// delayRender so HTML overlay and canvas textures both draw with the real faces.
import { continueRender, delayRender, staticFile } from "remotion";

export const DISPLAY = "Ep02Anton";
export const TEXT = "Ep02Grotesk";

let ready: Promise<void> | null = null;
export const ep02FontsReady = (): Promise<void> => {
  if (ready) return ready;
  if (typeof document === "undefined") return (ready = Promise.resolve());
  const handle = delayRender("EP02 fonts");
  const faces = [
    new FontFace(DISPLAY, `url(${staticFile("fonts/Anton-Regular.ttf")}) format("truetype")`),
    new FontFace(TEXT, `url(${staticFile("fonts/SpaceGrotesk-Variable.ttf")}) format("truetype")`, { weight: "300 700" }),
  ];
  ready = Promise.all(
    faces.map(async (f) => {
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(
    () => continueRender(handle),
    (err) => {
      continueRender(handle);
      throw err;
    },
  );
  return ready;
};
ep02FontsReady();
