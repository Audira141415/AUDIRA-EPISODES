// AE-066 Menara ATC. Cover = approved GLASSCRAFT topic cover (unchanged); Film = full film keyed to timeline.json.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = TL.total;
