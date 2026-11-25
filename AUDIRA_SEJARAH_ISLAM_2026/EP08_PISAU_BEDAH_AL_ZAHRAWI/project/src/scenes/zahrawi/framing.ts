// Cover framing = the film's opening camera (style/cover.json records it via npm run cover --framing).
export type Framing = { target: [number, number, number]; d: number; pitch: number; yaw: number; fov: number };

export const COVER: Framing = {
  target: [-1.75, 0.9, -1.3],
  d: 10.8,
  pitch: 0.92,
  yaw: 0.12,
  fov: 34,
};
