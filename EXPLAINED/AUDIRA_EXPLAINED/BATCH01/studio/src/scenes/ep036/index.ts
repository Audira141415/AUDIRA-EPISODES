// EP036 "Terowongan MRT Tidak Kebanjiran" (INNERWORKS). Exports: Film, Cover, TOTAL_SECONDS.
import timeline from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { FilmEp036 as Film } from "./film/Film.tsx";
export const TOTAL_SECONDS: number = (timeline as { total: number }).total;
