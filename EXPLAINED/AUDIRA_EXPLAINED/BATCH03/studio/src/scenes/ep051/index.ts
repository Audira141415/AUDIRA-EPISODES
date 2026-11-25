// AE-051 Kolam Renang Bersih (FLUIDFORGE). Cover = approved topic cover; Film keyed to timeline.json.
import React from "react";
import TL from "./timeline.json";
import { Ep051Cover } from "./Cover.tsx";
import { Ep051Film } from "./Film.tsx";
export const TOTAL_SECONDS = TL.total;
export const Film: React.FC = Ep051Film;
export const Cover: React.FC = Ep051Cover;
