// AE-056 "Bagaimana Revolusi Industri Mengubah Dunia?" — TIMEFORGE.
// Cover = approved look-development still; Film = time-travel crane over the same diorama.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
