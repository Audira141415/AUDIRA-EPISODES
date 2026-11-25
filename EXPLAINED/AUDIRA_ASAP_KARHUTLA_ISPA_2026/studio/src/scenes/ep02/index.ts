import { Ep02Cover } from "./Cover.tsx";
import { Ep02Film } from "./Film.tsx";
import { TOTAL } from "./clock.ts";

// Film length = timeline.total (VO + 4 s outro), from the Audio Master Clock.
export const TOTAL_SECONDS: number = TOTAL;
export const Film = Ep02Film;
export const Cover = Ep02Cover;
