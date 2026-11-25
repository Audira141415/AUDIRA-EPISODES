// AE-057 "Mengapa Bata Ringan Lebih Ringan dari Bata Merah?" (CLAYWORLD).
// Cover = approved look-development still (unchanged). Film = full episode on the VO clock.
// Duration = timeline.total (Audio Master Clock). Audio is muxed separately by the lead.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
