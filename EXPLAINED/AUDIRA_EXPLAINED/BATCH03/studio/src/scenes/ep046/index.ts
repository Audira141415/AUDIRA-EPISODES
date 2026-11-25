// AE-046 Kabel Internet Bawah Laut (ABYSSFORGE). Duration = timeline.total (Audio Master Clock).
import React from "react";
import { Ep046Cover } from "./Cover.tsx";
import { Ep046Film, FILM_TOTAL } from "./Film.tsx";
export const TOTAL_SECONDS = FILM_TOTAL;
export const Film: React.FC = Ep046Film;
export const Cover: React.FC = Ep046Cover;
