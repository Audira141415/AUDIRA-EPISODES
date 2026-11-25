// Superseded 2026-11-12: the closing card is now <AudiraOutro> (src/brand/AudiraOutro.tsx), placed once in
// Root.tsx for every film so its channel name/handle come from src/brand/channel.json (rule 08).
// Kept as a no-op so the episode films that still call <Outro start={...} /> need no edit.
import React from "react";
export const Outro: React.FC<{ start: number }> = () => null;
