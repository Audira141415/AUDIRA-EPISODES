// BACKROOMS materials: POLISH recipes for the worn office surfaces. Spread into
// <meshPhysicalMaterial> and set `color` (+ a useSurfaceGrain map for damp, uneven texture).
import { POLISH } from "../../../core/polish/Polish.tsx";

/** Mono-yellow wallpaper: matte paper. */
export const WALLPAPER = POLISH.paper;
/** Damp ochre carpet: fabric with a little sheen. */
export const CARPET = POLISH.fabric;
/** Acoustic ceiling tiles and plaster. */
export const PLASTER = POLISH.stone;
/** Varnished timber skirting. */
export const TRIM = { ...POLISH.stone, roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.4 } as const;
/** Moulded plastic: chair parts, light housings, the EXIT sign. */
export const PLASTIC = POLISH.toyPlastic;
/** Printed paper notice. */
export const NOTICE = POLISH.paper;
