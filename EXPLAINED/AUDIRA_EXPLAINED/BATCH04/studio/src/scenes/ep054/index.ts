// AE-054: Cover = HISTORYMAP look-development still; Film = full episode on the same map world.
// Duration = timeline.total (Audio Master Clock).
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = TL.total;
