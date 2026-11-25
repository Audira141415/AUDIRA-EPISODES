import { Ep10Cover } from "./Cover.tsx";
import { Ep10Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep10Film;
export const Cover = Ep10Cover;
