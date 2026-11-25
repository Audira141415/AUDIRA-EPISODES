// AE-045 GPS tanpa internet (POLYVERSE). Duration = timeline.total (Audio Master Clock).
import { Ep045Cover } from "./Cover.tsx";
import { Ep045Film, TOTAL_SECONDS as T } from "./Film.tsx";
export const TOTAL_SECONDS: number = T;
export const Film = Ep045Film;
export const Cover = Ep045Cover;
