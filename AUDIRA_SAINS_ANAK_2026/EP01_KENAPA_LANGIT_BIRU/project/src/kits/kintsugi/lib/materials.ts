import * as THREE from "three";
import { KINTSUGI_PALETTE } from "./palette";

export function createPorcelainMaterial() {
  return new THREE.MeshStandardMaterial({
    color: KINTSUGI_PALETTE.porcelainMatte,
    roughness: 0.85,
    metalness: 0.05,
  });
}

export function createLiquidGoldMaterial() {
  return new THREE.MeshStandardMaterial({
    color: KINTSUGI_PALETTE.pureGoldLeaf,
    emissive: KINTSUGI_PALETTE.goldEmissive,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.9,
  });
}

/** Glazed ceramic body (physical clearcoat glaze over a matte clay). */
export function createGlazeMaterial(colorHex: string = KINTSUGI_PALETTE.obsidianCeramic) {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
    sheen: 0.2,
    sheenRoughness: 0.7,
    side: THREE.DoubleSide,
  });
}
