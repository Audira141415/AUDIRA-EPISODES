// AE-044 eSIM (PRECISION). Cover = approved look-dev still; Film = full film on the VO clock.
import { Ep044Cover } from "./Cover.tsx";
import { Ep044Film } from "./Film.tsx";
import TL from "./timeline.json";
export const TOTAL_SECONDS: number = TL.total;
export const Film = Ep044Film;
export const Cover = Ep044Cover;
