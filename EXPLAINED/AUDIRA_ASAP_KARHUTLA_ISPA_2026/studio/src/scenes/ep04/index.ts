import { Ep04Cover } from "./Cover.tsx";
import { Ep04Film } from "./Film.tsx";
import TL from "./timeline.json";

export const TOTAL_SECONDS: number = (TL as unknown as { total: number }).total;
export const Film = Ep04Film;
export const Cover = Ep04Cover;
