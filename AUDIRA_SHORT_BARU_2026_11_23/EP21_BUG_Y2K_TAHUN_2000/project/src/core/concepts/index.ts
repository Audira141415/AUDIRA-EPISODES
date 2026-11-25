// Pustaka prop konsep per tema (lihat README.md). Konsep abstrak di naskah wajib dirender lewat
// komponen ini atau GLB nyata, bukan primitif polos.
export * from "./palette.ts";
export { Face, decalTexture } from "./parts.tsx";
export { SunDisc, LightBeam, WaveRibbon, AirMolecule, ScatterBurst, WaterDrop, GasBubble, Stoma, Leaf, Chloroplast } from "./science.tsx";
export { SportsPerson, Headband, FullHelmet, FlatCapMoustache, BoxingGlove, WheelGun, Tyre, RaceCar } from "./sports.tsx";
export type { SportKind } from "./sports.tsx";
export { CONCEPTS, ERA_VEHICLES, findConcepts, conceptFor, conceptsIn } from "./registry.ts";
export type { ConceptEntry, ConceptDomain } from "./registry.ts";
