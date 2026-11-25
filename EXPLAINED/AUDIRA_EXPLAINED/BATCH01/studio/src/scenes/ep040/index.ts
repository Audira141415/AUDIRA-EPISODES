// EP040 — Kamera ETLE Bisa Membaca Plat Nomor di Malam Hari? Keep all three exports: Film, Cover, TOTAL_SECONDS.
import TL from "./timeline.json";
export { Cover } from "./Cover.tsx";
export { Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = TL.total;
