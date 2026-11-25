import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MOSAIC_PALETTE } from "./palette";
import { mulberry32 } from "../core/motion";

/** Glazed ceramic / stone tessera: per-instance colour, glossy clearcoat for the raking sheen. */
export const makeCeramicMaterial = () =>
  new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.42, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.18 });

/** Gold smalti: gold leaf under glass, mirror-like, catches the environment. */
export const makeGoldMaterial = () =>
  new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.32, metalness: 1.0, envMapIntensity: 0.9 });

/** Lime grout bed with a little sand noise. */
export const makeGroutTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(6002);
  g.fillStyle = MOSAIC_PALETTE.grout;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "60,45,30" : "255,250,240"},${0.05 + rnd() * 0.1})`;
    g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

/**
 * Worn limestone flags around the panel: staggered slabs with varied tone, dark joints and sand
 * speckle, so the room floor reads as excavated stone instead of a flat brown plane.
 */
export const makeFlagstoneTexture = () => {
  const N = 512;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(6005);
  g.fillStyle = "#1E150F";
  g.fillRect(0, 0, N, N);
  const rows = 4;
  const rh = N / rows;
  for (let r = 0; r < rows; r++) {
    let x = r % 2 === 0 ? 0 : -rh * 0.6;
    while (x < N) {
      const w = rh * (0.9 + rnd() * 0.9);
      const tone = 0.7 + rnd() * 0.45;
      const base = new THREE.Color(MOSAIC_PALETTE.surround).multiplyScalar(tone);
      g.fillStyle = `#${base.getHexString()}`;
      g.fillRect(x + 3, r * rh + 3, w - 6, rh - 6);
      // weathering blotches inside the slab
      for (let k = 0; k < 14; k++) {
        const bx = x + 3 + rnd() * (w - 6);
        const by = r * rh + 3 + rnd() * (rh - 6);
        const rad = 6 + rnd() * 26;
        const grd = g.createRadialGradient(bx, by, 0, bx, by, rad);
        const light = rnd() < 0.5;
        grd.addColorStop(0, light ? "rgba(255,240,215,0.10)" : "rgba(30,18,10,0.16)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd;
        g.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
      }
      x += w;
    }
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "30,20,12" : "255,245,225"},${0.05 + rnd() * 0.12})`;
    g.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
};

/** Procedural studio environment (no network) so gold and glaze have something to reflect. */
export const makeEnvironment = (gl: THREE.WebGLRenderer) => {
  const pmrem = new THREE.PMREMGenerator(gl);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
};
