// EP09 canvas textures: report cover, page edges, and HUD label chips (drawn after fonts load).
import * as THREE from "three";

const MONO = "'JetBrains Mono', monospace";
const GROT = "'Space Grotesk', sans-serif";

const tex = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Front cover of the glowing report: LAPORAN title, AUDIRA label, small line chart. */
export function reportCoverTexture(): THREE.Texture {
  const W = 768, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b2a3a");
  bg.addColorStop(1, "#05121c");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // fine survey grid on the cover
  g.strokeStyle = "rgba(0,240,255,0.08)";
  g.lineWidth = 1;
  for (let x = 0; x <= W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // glowing frame
  g.strokeStyle = "#00f0ff";
  g.lineWidth = 8;
  g.strokeRect(26, 26, W - 52, H - 52);
  g.lineWidth = 2;
  g.strokeStyle = "rgba(0,240,255,0.5)";
  g.strokeRect(44, 44, W - 88, H - 88);
  // AUDIRA label chip
  g.fillStyle = "#ffb703";
  g.fillRect(72, 82, 196, 52);
  g.fillStyle = "#04070a";
  g.font = `800 34px ${MONO}`;
  g.textBaseline = "middle";
  g.fillText("AUDIRA", 88, 109);
  g.fillStyle = "#7ddcf0";
  g.font = `600 26px ${MONO}`;
  g.fillText("DEEP RESEARCH", 300, 109);
  // title
  g.fillStyle = "#f1f5f9";
  g.font = `700 132px ${GROT}`;
  g.textBaseline = "alphabetic";
  g.fillText("LAPORAN", 66, 300);
  g.fillStyle = "#00f0ff";
  g.fillRect(72, 330, 300, 8);
  // text lines
  g.fillStyle = "rgba(241,245,249,0.45)";
  [0, 1, 2, 3].forEach((i) => g.fillRect(72, 380 + i * 34, [560, 600, 480, 540][i], 12));
  // line chart panel
  const px = 72, py = 540, pw = W - 144, ph = 300;
  g.strokeStyle = "rgba(0,240,255,0.35)";
  g.lineWidth = 2;
  g.strokeRect(px, py, pw, ph);
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(px, py + (ph * i) / 4); g.lineTo(px + pw, py + (ph * i) / 4); g.stroke(); }
  const pts = [0.18, 0.3, 0.26, 0.45, 0.42, 0.6, 0.7, 0.66, 0.84];
  g.strokeStyle = "#ffb703";
  g.lineWidth = 7;
  g.lineJoin = "round";
  g.beginPath();
  pts.forEach((v, i) => {
    const x = px + 24 + (i * (pw - 48)) / (pts.length - 1);
    const y = py + ph - 24 - v * (ph - 48);
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  });
  g.stroke();
  g.fillStyle = "#fff4d6";
  pts.forEach((v, i) => {
    const x = px + 24 + (i * (pw - 48)) / (pts.length - 1);
    const y = py + ph - 24 - v * (ph - 48);
    g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
  });
  // footer lines
  g.fillStyle = "rgba(241,245,249,0.35)";
  [0, 1].forEach((i) => g.fillRect(72, 880 + i * 34, [520, 380][i], 12));
  return tex(c);
}

/** Cream page-stack edge for the side of the report. */
export function pageEdgeTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e2cf";
  g.fillRect(0, 0, 64, 512);
  for (let x = 0; x < 64; x += 3) {
    g.fillStyle = x % 6 === 0 ? "rgba(120,100,70,0.35)" : "rgba(255,255,255,0.35)";
    g.fillRect(x, 0, 1, 512);
  }
  return tex(c);
}

/** HUD label chip: name + survey grid reference. */
export function labelTexture(name: string, sub: string, color: string): { map: THREE.Texture; aspect: number } {
  const H = 128;
  const c = document.createElement("canvas");
  const g0 = c.getContext("2d")!;
  g0.font = `800 52px ${MONO}`;
  const w1 = g0.measureText(name).width;
  g0.font = `500 26px ${MONO}`;
  const w2 = g0.measureText(sub).width;
  const W = Math.ceil(Math.max(w1, w2) + 70);
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(4,7,10,0.78)";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = color;
  g.lineWidth = 4;
  g.strokeRect(2, 2, W - 4, H - 4);
  g.fillStyle = color;
  g.fillRect(0, 0, 14, H);
  g.font = `800 52px ${MONO}`;
  g.fillStyle = "#f1f5f9";
  g.textBaseline = "alphabetic";
  g.fillText(name, 34, 62);
  g.font = `500 26px ${MONO}`;
  g.fillStyle = color;
  g.fillText(sub, 34, 104);
  return { map: tex(c), aspect: W / H };
}

/** Radial glow sprite. */
export function glowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(0,240,255,0.55)");
  r.addColorStop(0.35, "rgba(0,180,255,0.18)");
  r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return tex(c);
}
