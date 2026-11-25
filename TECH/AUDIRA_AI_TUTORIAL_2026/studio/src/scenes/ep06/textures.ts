// EP06 canvas textures (deterministic, drawn once after fonts load).
import * as THREE from "three";

const mk = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

/** Striped synthwave sun: amber top to magenta bottom, gaps widen toward the horizon. */
export function sunTexture() {
  return mk(1024, 1024, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, "#FFE36B");
    g.addColorStop(0.42, "#FF9E00");
    g.addColorStop(0.72, "#FF2F7A");
    g.addColorStop(1, "#C2008F");
    c.fillStyle = g;
    c.beginPath();
    c.arc(512, 512, 510, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = "destination-out";
    let y = 470;
    let gap = 6;
    while (y < 1024) {
      c.fillRect(0, y, 1024, gap);
      y += gap + 34 - gap * 0.9;
      gap += 5;
    }
  });
}

/** Retro chat prompt window: title bar, prompt text, blinking caret, send button. */
export function promptTexture(text: string) {
  return mk(1400, 440, (c) => {
    const bg = c.createLinearGradient(0, 0, 0, 440);
    bg.addColorStop(0, "#1B0F3A");
    bg.addColorStop(1, "#0A0620");
    c.fillStyle = bg;
    rr(c, 0, 0, 1400, 440, 36);
    c.fill();
    // title bar
    const tb = c.createLinearGradient(0, 0, 1400, 0);
    tb.addColorStop(0, "#FF007F");
    tb.addColorStop(1, "#7A2BFF");
    c.fillStyle = tb;
    rr(c, 0, 0, 1400, 92, 36);
    c.fill();
    c.fillRect(0, 50, 1400, 42);
    c.fillStyle = "#0C081A";
    c.font = "56px 'VTThreeTwoThree'";
    c.textBaseline = "middle";
    c.fillText("PROMPT // CREATE MUSIC", 44, 48);
    ["#00F6FF", "#FF9E00", "#39FF14"].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(1270 + i * 46, 46, 15, 0, Math.PI * 2);
      c.fill();
    });
    // input field
    c.strokeStyle = "#00F6FF";
    c.lineWidth = 5;
    rr(c, 40, 132, 1320, 160, 26);
    c.stroke();
    c.fillStyle = "rgba(0,246,255,0.06)";
    c.fill();
    c.fillStyle = "#F4F1FF";
    c.font = "104px 'VTThreeTwoThree'";
    c.shadowColor = "#00F6FF";
    c.shadowBlur = 18;
    c.fillText(`"${text}"`, 78, 214);
    const w = c.measureText(`"${text}"`).width;
    c.shadowBlur = 0;
    c.fillStyle = "#FF007F";
    c.fillRect(78 + w + 14, 172, 30, 82);
    // footer chips + send button
    c.font = "50px 'VTThreeTwoThree'";
    const chips = ["♪ MUSIK", "LIRIK", "VOKAL"];
    let x = 44;
    chips.forEach((t) => {
      const tw = c.measureText(t).width + 44;
      c.strokeStyle = "#FF9E00";
      c.lineWidth = 3;
      rr(c, x, 320, tw, 74, 18);
      c.stroke();
      c.fillStyle = "#FFB84D";
      c.fillText(t, x + 22, 359);
      x += tw + 20;
    });
    c.fillStyle = "#FF007F";
    rr(c, 1180, 312, 180, 90, 22);
    c.fill();
    c.fillStyle = "#0C081A";
    c.beginPath();
    c.moveTo(1246, 330);
    c.lineTo(1306, 357);
    c.lineTo(1246, 384);
    c.closePath();
    c.fill();
  });
}

/** Floating lyric card: header plus glowing lyric lines (abstract bars, no invented words). */
export function lyricTexture(label: string, seed: number) {
  return mk(640, 400, (c) => {
    c.fillStyle = "rgba(20,8,48,0.78)";
    rr(c, 6, 6, 628, 388, 28);
    c.fill();
    c.strokeStyle = seed % 2 ? "#00F6FF" : "#FF007F";
    c.lineWidth = 6;
    c.stroke();
    c.fillStyle = "#FFE36B";
    c.font = "68px 'VTThreeTwoThree'";
    c.textBaseline = "middle";
    c.fillText(`♪ ${label}`, 40, 64);
    const lens = [0.86, 0.64, 0.78, 0.5, 0.7, 0.58];
    for (let i = 0; i < 4; i++) {
      const L = lens[(i + seed) % lens.length];
      const g = c.createLinearGradient(40, 0, 40 + 540 * L, 0);
      g.addColorStop(0, "#F4F1FF");
      g.addColorStop(1, seed % 2 ? "#00F6FF" : "#FF7AC0");
      c.fillStyle = g;
      c.shadowColor = seed % 2 ? "#00F6FF" : "#FF007F";
      c.shadowBlur = 14;
      rr(c, 40, 128 + i * 64, 540 * L, 26, 13);
      c.fill();
    }
    c.shadowBlur = 0;
  });
}

/** Neon sign "AUDIRA" for the stage front. */
export function neonSignTexture() {
  return mk(1024, 256, (c) => {
    c.fillStyle = "#07040F";
    rr(c, 4, 4, 1016, 248, 40);
    c.fill();
    c.strokeStyle = "#00F6FF";
    c.lineWidth = 8;
    c.shadowColor = "#00F6FF";
    c.shadowBlur = 24;
    rr(c, 22, 22, 980, 212, 30);
    c.stroke();
    c.font = "italic 900 150px 'Kanit'";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.shadowColor = "#FF007F";
    c.shadowBlur = 40;
    c.fillStyle = "#FFD0E8";
    c.fillText("AUDIRA", 512, 134);
    c.shadowBlur = 12;
    c.fillText("AUDIRA", 512, 134);
  });
}

/** Cassette label. */
export function cassetteTexture() {
  return mk(800, 500, (c) => {
    c.fillStyle = "#F2EEE4";
    rr(c, 0, 0, 800, 500, 30);
    c.fill();
    const bands = ["#FF007F", "#FF9E00", "#00F6FF"];
    bands.forEach((b, i) => {
      c.fillStyle = b;
      c.fillRect(0, 300 + i * 40, 800, 40);
    });
    c.fillStyle = "#1B0F3A";
    c.font = "italic 900 92px 'Kanit'";
    c.textBaseline = "middle";
    c.fillText("AUDIRA MIX", 50, 80);
    c.font = "60px 'VTThreeTwoThree'";
    c.fillText("SIDE A  ·  LO-FI", 54, 160);
    // reel window
    c.fillStyle = "#2a1f3d";
    rr(c, 180, 200, 440, 92, 46);
    c.fill();
  });
}
