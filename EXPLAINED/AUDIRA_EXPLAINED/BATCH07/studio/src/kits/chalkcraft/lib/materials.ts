import * as THREE from "three";

export function createChalkStrokeMaterial(colorHex: string) {
  return new THREE.LineBasicMaterial({
    color: colorHex,
    linewidth: 2,
  });
}

/** Dusty chalk for tube strokes: fully rough, faint self-glow so it reads on the slate. */
export function createChalkDustMaterial(colorHex: string) {
  return new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 1,
    metalness: 0,
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.35,
  });
}
