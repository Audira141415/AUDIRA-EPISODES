import { continueRender, delayRender, staticFile } from "remotion";

// Display faces for kit overlays (all SIL OFL, bundled in public/fonts, see public/fonts/licenses).
// Manrope stays the body font (core/type/fonts.ts); these give each kit its own headline voice:
//   DISPLAY.condensed  Anton            — broadcast / poster / brutalist headlines
//   DISPLAY.serif      Instrument Serif — editorial, museum, vintage, kintsugi
//   DISPLAY.grotesk    Space Grotesk    — technical HUD, data, forensic labels
//   DISPLAY.pixel      Silkscreen       — VHS / arcade / retro counters
// Importing this module registers the faces and holds the render until they are loaded.

const FACES: { family: string; file: string; weight: string; style: string }[] = [
  { family: "Anton", file: "Anton-Regular.ttf", weight: "400", style: "normal" },
  { family: "Instrument Serif", file: "InstrumentSerif-Regular.ttf", weight: "400", style: "normal" },
  { family: "Instrument Serif", file: "InstrumentSerif-Italic.ttf", weight: "400", style: "italic" },
  { family: "Space Grotesk", file: "SpaceGrotesk-Variable.ttf", weight: "300 700", style: "normal" },
  { family: "Silkscreen", file: "Silkscreen-Regular.ttf", weight: "400", style: "normal" },
  { family: "Silkscreen", file: "Silkscreen-Bold.ttf", weight: "700", style: "normal" },
];

let ready: Promise<void> | null = null;
export const displayFontsReady = (): Promise<void> => {
  if (ready) return ready;
  if (typeof document === "undefined") return (ready = Promise.resolve());
  const handle = delayRender("Loading bundled display fonts");
  ready = Promise.all(
    FACES.map(async ({ family, file, weight, style }) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("truetype")`, { weight, style });
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
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
displayFontsReady();

export const DISPLAY = {
  condensed: '"Anton", "Manrope", sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  grotesk: '"Space Grotesk", "Manrope", sans-serif',
  pixel: '"Silkscreen", "Space Grotesk", monospace',
  body: '"Manrope", sans-serif',
} as const;
