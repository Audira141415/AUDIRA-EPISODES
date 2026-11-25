import { Ep08Cover } from "./Cover.tsx";
import { Ep08Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep08Film;
export const Cover = Ep08Cover;
