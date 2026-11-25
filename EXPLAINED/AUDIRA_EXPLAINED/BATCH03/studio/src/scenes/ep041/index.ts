// EP041: Film (ISOCRAFT, timeline-driven) + Cover (approved topic cover). TOTAL_SECONDS = timeline.total.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
