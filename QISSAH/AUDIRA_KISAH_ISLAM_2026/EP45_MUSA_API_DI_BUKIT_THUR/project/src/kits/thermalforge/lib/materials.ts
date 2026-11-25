import * as THREE from "three";
import { THERMAL_PALETTE } from "./palette";

export function createThermalGradientMaterial() {
  return new THREE.MeshStandardMaterial({
    color: THERMAL_PALETTE.flirAmber,
    emissive: THERMAL_PALETTE.flirMagenta,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
}

// --- Bloom discipline (promoted from motion memory, 2026-11-10: cara-kerja-viral-EP29, asap-karhutla-ispa-EP02) ---
// White-hot lines and white vapour bloom into lava cracks or lightning under <Finish> bloom.
// Tame the source, not the Post bloom: heat lines get orange-yellow cores at half width,
// plasma white is kept for small hotspot points only, and cool vapour stays translucent.

/** Ironbow ramp: t = 0 (cold) .. 1 (hottest). Use it to shade people, vehicles and props by temperature. */
const IRONBOW = [
  THERMAL_PALETTE.coldBlack,
  THERMAL_PALETTE.deepViolet,
  THERMAL_PALETTE.flirMagenta,
  THERMAL_PALETTE.flirAmber,
  THERMAL_PALETTE.flirYellow,
  THERMAL_PALETTE.plasmaWhite,
] as const;

export function ironbow(t: number): THREE.Color {
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0)) * (IRONBOW.length - 1);
  const i = Math.min(IRONBOW.length - 2, Math.floor(x));
  return new THREE.Color(IRONBOW[i]).lerp(new THREE.Color(IRONBOW[i + 1]), x - i);
}

/** Fire / heat line. Core stays orange-yellow (never white); keep the line half the width you first think of. */
export function createHeatLineMaterial(heat = 0.8) {
  return new THREE.MeshStandardMaterial({
    color: ironbow(Math.min(heat, 0.78)),
    emissive: ironbow(Math.min(heat, 0.74)),
    emissiveIntensity: 0.9,
    roughness: 0.6,
  });
}

/** Small hotspot point: the only place plasma white is allowed. */
export function createHotspotMaterial() {
  return new THREE.MeshStandardMaterial({
    color: THERMAL_PALETTE.plasmaWhite,
    emissive: THERMAL_PALETTE.flirYellow,
    emissiveIntensity: 1.2,
    roughness: 0.4,
  });
}

/** Cool vapour / smoke / fumarole: translucent so it does not bloom into a white sheet. */
export function createCoolVapourMaterial(opacity = 0.26) {
  return new THREE.MeshBasicMaterial({
    color: THERMAL_PALETTE.deepViolet,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}
