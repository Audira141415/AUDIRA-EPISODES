// EP037 Toilet Bus AKAP (TOYDIORAMA). Keep all three exports: Film, Cover, TOTAL_SECONDS.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = TL.total;
