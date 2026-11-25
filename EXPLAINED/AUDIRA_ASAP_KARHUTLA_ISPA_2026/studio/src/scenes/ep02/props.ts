// Shared placement data for 3D props and their HUD labels.
import * as THREE from "three";
import { THERMAL_PALETTE as P } from "../../kits/thermalforge/lib/palette";
import { T, CUT2, seg } from "./clock.ts";

// Script: cases rose about 30% from July to September (one puskesmas). Relative heights only.
export const BARS = [
  { label: "JULI", tag: "100", v: 100, x: -3.6, color: P.flirMagenta, at: () => T.di1 + 0.3 },
  { label: "SEPTEMBER", tag: "±130", v: 130, x: -3.0, color: P.flirYellow, at: () => T.di1 + 0.9 },
];
export const BAR_Z = -5.0;
export const BAR_MAX_H = 1.0;
export const barH = (v: number) => (v / 130) * BAR_MAX_H;

export const satPos = (t: number) => new THREE.Vector3(-1.5 + 9.0 * seg(t, T.dan - 0.4, CUT2 + 0.2), 4.4, -8.4);
