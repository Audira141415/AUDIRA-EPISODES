// EP052 Jelantah jadi Avtur (NANOFORGE): Film timed by timeline.json (Audio Master Clock), Cover = approved still.
import React from "react";
import TL from "./timeline.json";
import { Ep052Cover } from "./Cover.tsx";
import { Ep052Film } from "./Film.tsx";
export const TOTAL_SECONDS: number = TL.total;
export const Film: React.FC = Ep052Film;
export const Cover: React.FC = Ep052Cover;
