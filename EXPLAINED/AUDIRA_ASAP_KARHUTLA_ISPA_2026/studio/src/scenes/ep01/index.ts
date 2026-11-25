import { Ep01Cover } from "./Cover.tsx";
import { Ep01Film } from "./Film.tsx";
import TL from "./timeline.json";

export const TOTAL_SECONDS: number = (TL as unknown as { total: number }).total;
export const Film = Ep01Film;
export const Cover = Ep01Cover;
