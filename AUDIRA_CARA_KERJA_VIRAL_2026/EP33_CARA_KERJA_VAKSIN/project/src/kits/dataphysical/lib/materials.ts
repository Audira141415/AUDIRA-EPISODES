// DATAPHYSICAL materials: machined aluminium, brass, anodised paint and oiled walnut as physical
// (clearcoat) recipes, so the studio HDRI gives them real reflections. Spread into
// <meshPhysicalMaterial> and set `color`.
import { POLISH } from "../../../core/polish/Polish.tsx";

/** Brushed aluminium columns. */
export const ALUMINIUM = { roughness: 0.3, metalness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35 } as const;
/** Polished brass caps and rails. */
export const BRASS = { roughness: 0.22, metalness: 0.95, clearcoat: 0.5, clearcoatRoughness: 0.15 } as const;
/** Anodised hero column: painted aluminium, satin. */
export const ANODISED = { ...POLISH.toyPlastic, roughness: 0.32, metalness: 0.35 } as const;
/** Oiled walnut plinth: satin timber. */
export const WALNUT = { ...POLISH.stone, roughness: 0.48, clearcoat: 0.55, clearcoatRoughness: 0.4 } as const;
