import { Ep06Cover } from "./Cover.tsx";
import { Ep06Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep06Film;
export const Cover = Ep06Cover;
