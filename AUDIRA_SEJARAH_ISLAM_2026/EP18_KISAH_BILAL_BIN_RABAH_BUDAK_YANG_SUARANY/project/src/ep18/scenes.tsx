// EP18 scene map: SceneId → scene component (Film.tsx renders by time).
import React from "react";
import type { SceneId } from "./timing";
import { S1, S2, S3a, S3b } from "./scenes1";
import { S4a, S4b, S5a, S5b } from "./scenes2";
import { S6a, S6b, S6c, S7a, S7b, S8a, S8b } from "./scenes3";

export const SCENE_MAP: Record<SceneId, React.FC<{ t: number; lt: number }>> = { S1, S2, S3a, S3b, S4a, S4b, S5a, S5b, S6a, S6b, S6c, S7a, S7b, S8a, S8b };
