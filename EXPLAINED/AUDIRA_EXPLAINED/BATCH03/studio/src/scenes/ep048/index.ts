// EP048 Pabrik Mobil (BUILDFORGE). Film length comes from the VO timeline (Audio Master Clock).
import TL from "./timeline.json";
export { Ep048Cover as Cover } from "./Cover.tsx";
export { Ep048Film as Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
