// EP06 cover — ARCADECRT. The film's opening frame (FilmAt t = 0.6: hero CRT warmed up, the blinking gray pixel)
// with the hook title, so the thumbnail and the film's first frame are the same picture.
import React from "react";
import { FilmAt } from "./FilmCrt.tsx";

export const Cover: React.FC = () => <FilmAt t={0.6} captions={false} />;
