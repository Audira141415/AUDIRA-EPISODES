// AE-066 film-only textures (the cover keeps its own textures.ts untouched).
import * as THREE from "three";

/**
 * Fuselage livery for a CylinderGeometry rotated +90° about z (axis along x).
 * Canvas x = u around the body: u=0 starboard (+z), 0.25 top, 0.5 port (-z), 0.75 belly.
 * Canvas y: top = tail end, bottom = nose end. Neutral livery: no airline marks.
 */
export const fuselageTexture = (stripe: string) => {
  const W = 1024;
  const H = 1024;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#eef2f7";
  c.fillRect(0, 0, W, H);
  // grey belly
  c.fillStyle = "#b9c2ce";
  c.fillRect(W * 0.66, 0, W * 0.18, H);
  const band = (u: number, w: number, col: string) => {
    c.fillStyle = col;
    const x = (((u % 1) + 1) % 1) * W;
    c.fillRect(x - w / 2, 0, w, H);
    if (x - w / 2 < 0) c.fillRect(W + x - w / 2, 0, w, H);
    if (x + w / 2 > W) c.fillRect(x + w / 2 - W - w, 0, w, H);
  };
  // cheatline stripe just below the windows on both sides
  band(-0.035, 26, stripe);
  band(0.535, 26, stripe);
  band(-0.06, 8, "#1d2a3c");
  band(0.56, 8, "#1d2a3c");
  // window rows
  const win = (u: number) => {
    const x = (((u % 1) + 1) % 1) * W;
    for (let y = H * 0.1; y < H * 0.86; y += 30) {
      if (Math.abs(y - H * 0.42) < 22 || Math.abs(y - H * 0.7) < 22) continue; // doors
      c.fillStyle = "#13202f";
      c.beginPath();
      c.roundRect(x - 12, y, 24, 17, 7);
      c.fill();
    }
    c.strokeStyle = "#9aa6b5";
    c.lineWidth = 3;
    [0.42, 0.7, 0.9].forEach((k) => {
      c.beginPath();
      c.roundRect(x - 15, H * k - 24, 30, 48, 6);
      c.stroke();
    });
  };
  win(0.045);
  win(0.455);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
