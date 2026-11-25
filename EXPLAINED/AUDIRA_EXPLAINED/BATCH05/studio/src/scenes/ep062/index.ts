// AE-062 "Bagaimana Stadion Menampung Puluhan Ribu Penonton dengan Aman?" — TACTICBOARD.
// Cover = approved look-development still; Film = full episode keyed to timeline.json.
import React from "react";
import { Ep062Cover } from "./Cover";
import { Ep062Film } from "./Film";
import TL from "./timeline.json";

export const Cover: React.FC = Ep062Cover;
export const Film: React.FC = Ep062Film;
export const TOTAL_SECONDS: number = (TL as { total: number }).total;
