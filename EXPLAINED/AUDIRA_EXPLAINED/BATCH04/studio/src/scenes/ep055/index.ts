// AE-055 "Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?" (FILMNOIR).
// Duration = timeline.total (Audio Master Clock). Audio is muxed separately by the lead.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
