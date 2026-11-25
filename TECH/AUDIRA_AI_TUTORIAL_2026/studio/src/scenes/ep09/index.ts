import { Ep09Cover } from "./Cover.tsx";
import { Ep09Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep09Film;
export const Cover = Ep09Cover;
