import { continueRender, delayRender, staticFile } from "remotion";

// CHRONICLE type (all SIL OFL, bundled in public/fonts):
//   Anton                — big date stamps and counters
//   Barlow Condensed     — names, map labels, kickers
//   Plus Jakarta Sans    — word-by-word captions
//   Instrument Serif It. — source citations and roles
export const F_STAMP = "Anton";
export const F_LABEL = "Barlow Condensed";
export const F_CAPTION = "Plus Jakarta Sans";
export const F_CITE = "Instrument Serif";

let ready: Promise<void> | null = null;
export const chronicleFontsReady = (): Promise<void> => {
  if (ready) return ready;
  if (typeof document === "undefined") return (ready = Promise.resolve());
  const handle = delayRender("chronicle fonts");
  const ttf = (fam: string, file: string, weight: string, style = "normal") =>
    new FontFace(fam, `url(${staticFile(`fonts/${file}`)}) format("truetype")`, { weight, style });
  const faces = [
    ttf(F_STAMP, "Anton-Regular.ttf", "400"),
    ttf(F_LABEL, "BarlowCondensed-SemiBold.ttf", "600"),
    ttf(F_LABEL, "BarlowCondensed-ExtraBold.ttf", "800"),
    ttf(F_CAPTION, "PlusJakartaSans_500Medium.ttf", "500"),
    ttf(F_CAPTION, "PlusJakartaSans_700Bold.ttf", "700"),
    ttf(F_CAPTION, "PlusJakartaSans_800ExtraBold.ttf", "800"),
    ttf(F_CITE, "InstrumentSerif-Italic.ttf", "400", "italic"),
  ];
  ready = Promise.all(
    faces.map(async (f) => {
      await f.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(f);
    }),
  ).then(
    () => continueRender(handle),
    (e) => {
      continueRender(handle);
      throw e;
    },
  );
  return ready;
};
