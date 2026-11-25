// Frame sizes and render presets. Two formats ship from the same scenes:
//   short - 9:16 vertical (Shorts, Reels, TikTok), 1080 × 1920 @ 60
//   wide  - 16:9 long-form (YouTube), 1920 × 1080 @ 30 (half the frames of 60 fps for 8–12 minute films)
// See core/film/format.ts for the hooks that adapt camera and layout to the format.

export const WIDTH = 1080;
export const HEIGHT = 1920;

export const WIDE_WIDTH = 1920;
export const WIDE_HEIGHT = 1080;

/** Preview for approval and the final deliverable, per format. */
export const PRESETS = {
  preview: { width: WIDTH / 2, height: HEIGHT / 2, fps: 30 },
  final: { width: WIDTH, height: HEIGHT, fps: 60 },
  widePreview: { width: WIDE_WIDTH / 2, height: WIDE_HEIGHT / 2, fps: 30 },
  wideFinal: { width: WIDE_WIDTH, height: WIDE_HEIGHT, fps: 30 },
} as const;
