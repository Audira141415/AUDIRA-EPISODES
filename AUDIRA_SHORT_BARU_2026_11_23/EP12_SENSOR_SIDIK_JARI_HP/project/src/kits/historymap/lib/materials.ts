// HISTORYMAP materials: the map is a printed sheet on a timber war table, so it uses POLISH.paper
// and POLISH.stone (relief) instead of flat colours. Spread into <meshPhysicalMaterial>.
import { POLISH } from "../../../core/polish/Polish.tsx";

/** Printed map sheet and territory washes. */
export const MAP_PAPER = POLISH.paper;
/** Carved relief mountains. */
export const RELIEF = POLISH.stone;
/** Varnished war-table timber. */
export const TABLE = { ...POLISH.stone, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35 } as const;
/** Gilded pins and border cord. */
export const GILT = { roughness: 0.25, metalness: 0.9, clearcoat: 0.6, clearcoatRoughness: 0.15 } as const;
