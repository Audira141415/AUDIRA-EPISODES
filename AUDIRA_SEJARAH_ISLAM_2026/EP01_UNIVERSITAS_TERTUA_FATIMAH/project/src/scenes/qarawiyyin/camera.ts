// EP01 camera. COVER is the hook's opening framing (written to style/cover.json by npm run cover
// --framing=src/scenes/qarawiyyin/coverPose.ts:COVER); the shot list starts from it. Every key is a
// word of the locked voice (tl.ts), keys at least ~1.5 s apart, holds before the big moves.
import { shotPlan, cameraAt, frame, hold, pushIn } from "../../core/camera/moves.ts";
import { COVER } from "./coverPose.ts";
import { W } from "./tl.ts";

export { COVER };

const LENS = { aperture: 0, maxBlur: 0, exposure: 0.84 };
type V3 = [number, number, number];
const F = (target: V3, az: number, el: number, dist: number) => frame({ target, az, el, dist });

const beats = () => [
  // hook: the cover, then down toward the four keys
  { at: 0, move: hold() },
  // Stage A cover was taken mid-way into this push (keep it so frame 0.3 s = the approved cover)
  { at: 0.6, move: pushIn(0.86) },
  { at: W("empat", 1), move: F([0, 0.35, 0.3], 6, 42, 9.8) },
  // context: Fez, the arcade beyond; Guinness; "awalnya ... sebuah masjid" (rise to the plan)
  { at: W("fez", 0), move: F([0, 1.5, -3.0], -14, 21, 13.4) },
  { at: W("records"), move: F([0, 0.6, -1.2], 12, 30, 15.0) },
  { at: W("dunia"), move: F([0, 0.5, -0.8], 20, 34, 14.6) },
  { at: W("tapi"), move: hold() },
  { at: W("masjid", 0), move: F([0, 0, 0.1], 0, 64, 13.2) },
  // main: the map Kairouan -> Fez, then the plot, Fatimah, the walls rising, the well
  { at: W("fez", 1), move: F([-0.2, 0, 0], -6, 70, 12.4) },
  { at: W("kairouan", 1), move: F([0, 0.2, 0.2], 4, 66, 12.6) },
  { at: W("ibnu", 0), move: F([0.2, 0.1, 1.2], 12, 52, 11.5) },
  { at: W("al-fihri"), move: F([1.0, 0.5, 2.45], 18, 26, 3.9) },
  { at: W("membangun", 0), move: F([0, 0.35, 0.4], 24, 42, 11.5) },
  { at: W("tanah"), move: F([0.3, 0.25, 1.9], -12, 44, 6.4) },
  { at: W("berpuasa"), move: hold() },
  { at: W("selesai"), move: F([0, 0.4, 0.2], -26, 46, 12.0) },
  // explanation: into the courtyard, the circle, the ijazah close-up, the library 1349
  { at: W("guru", 0), move: F([0, 0.15, 1.6], 0, 56, 5.6) },
  { at: W("resmi"), move: F([0, 0.15, 1.6], 26, 48, 5.2) },
  { at: W("ahli"), move: F([0, 0.2, 1.9], 10, 40, 4.4) },
  { at: W("mengajar"), move: hold() },
  { at: W("kata"), move: F([0, 0.85, 2.07], 0, 8, 1.9) },
  { at: W("sekarang"), move: hold() },
  { at: W("sultan"), move: F([3.4, 0.8, 0.6], -62, 20, 6.4) },
  { at: W("khaldun"), move: F([4.0, 0.9, -1.0], -72, 16, 4.7) },
  // payoff: back to the door, the keys go in, the leaves open, the manuscript, 1963 wide
  { at: W("tadi"), move: F([0, 0.3, 0.4], 0, 46, 9.8) },
  { at: W("dipegang"), move: F([0, 0.2, 0.75], -8, 55, 7.6) },
  { at: W("harus"), move: F([0, 0.15, 0.75], 8, 58, 7.4) },
  { at: W("al-qur'an"), move: F([0, 0.45, -0.75], 0, 30, 4.2) },
  { at: W("hewan"), move: F([0, 0.45, -0.75], -14, 26, 3.8) },
  { at: W("negara"), move: F([0, 1.4, -2.6], 8, 30, 11.5) },
  // outro: down to the lamp on the empty rehal
  { at: W("berharga"), move: F([0, 0.35, 0.4], -4, 38, 5.6) },
  { at: W("audira"), move: hold() },
];

let RIG: ReturnType<typeof shotPlan> | null = null;
let RIG_FPS = 0;
const rig = (fps: number) => {
  if (!RIG || RIG_FPS !== fps) {
    RIG = shotPlan(fps, COVER, beats());
    RIG_FPS = fps;
  }
  return RIG;
};

export const qarawiyyinShot = (frameNo: number, fps: number) => cameraAt(rig(fps), frameNo, fps, { lens: LENS, alive: true });
