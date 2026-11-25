import { Ep07Cover } from "./Cover.tsx";
import { Ep07Film } from "./Film.tsx";
import TL from "./timeline.json";

// Film length = Audio Master Clock (timeline.json total, seconds).
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep07Film;
export const Cover = Ep07Cover;
