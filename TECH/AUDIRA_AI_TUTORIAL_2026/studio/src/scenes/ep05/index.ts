import { Ep05Cover } from "./Cover.tsx";
import { Ep05Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep05Film;
export const Cover = Ep05Cover;
