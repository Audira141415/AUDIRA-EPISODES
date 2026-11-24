// ISLAMICDOCUMENTARY materials and shapes: gilt metal for the star and dome, glazed lapis tile and
// sandstone as POLISH recipes, plus the two shapes the kit is built from (8-point girih star and
// pointed arch). Spread the recipes into <meshPhysicalMaterial> and set `color`.
import * as THREE from "three";
import { POLISH } from "../../../core/polish/Polish.tsx";

/** Gilt metal: the girih star, the dome and the finials. */
export const GILT = { roughness: 0.22, metalness: 0.95, clearcoat: 0.6, clearcoatRoughness: 0.12 } as const;
/** Glazed lapis tile: stone body with a glaze clearcoat. */
export const GLAZED_TILE = { ...POLISH.stone, roughness: 0.55, clearcoat: 0.7, clearcoatRoughness: 0.25 } as const;
/** Sandstone floor and minarets. */
export const SANDSTONE = POLISH.stone;

/** 8-point (or n-point) girih star outline. */
export function starShape(outer: number, inner: number, points = 8): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/** Pointed (two-centred) arch outline: span `w`, springing at `spring`, arc radius `r` (> w/2). */
export function archPoints(w: number, spring: number, r: number, steps = 24): THREE.Vector2[] {
  const h = w / 2;
  const cx = r - h; // left arc centre sits at x = +cx… mirrored for the right arc
  const apexY = Math.sqrt(r * r - cx * cx);
  const a0 = Math.PI; // left springing point seen from the centre (cx, spring)
  const a1 = Math.atan2(apexY, -cx);
  const pts: THREE.Vector2[] = [new THREE.Vector2(-h, 0), new THREE.Vector2(-h, spring)];
  for (let i = 1; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    pts.push(new THREE.Vector2(cx + Math.cos(a) * r, spring + Math.sin(a) * r));
  }
  for (let i = steps - 1; i >= 0; i--) {
    const a = a0 + (a1 - a0) * (i / steps);
    pts.push(new THREE.Vector2(-(cx + Math.cos(a) * r), spring + Math.sin(a) * r));
  }
  pts.push(new THREE.Vector2(h, 0));
  return pts;
}
