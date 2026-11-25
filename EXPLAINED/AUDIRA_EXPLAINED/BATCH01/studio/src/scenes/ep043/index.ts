// EP043 "Mengapa Air PDAM Kadang Keruh Seperti Kopi Susu?" (WATERCOLOR, painted SVG paper diorama).
import React from "react";
import { Ep043CoverArt } from "./Cover.tsx";
import { Ep043Film } from "./film/Film.tsx";
import timeline from "./timeline.json";
export const TOTAL_SECONDS = timeline.total;
export const Film: React.FC = () => React.createElement(Ep043Film);
export const Cover: React.FC = () => React.createElement(Ep043CoverArt);
