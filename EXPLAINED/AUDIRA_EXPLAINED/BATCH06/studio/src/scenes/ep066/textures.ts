// AE-066 canvas textures: HUD flight-strip board, radar/ADS-B monitor, AUDIRA console label, sky.
// Drawn once per font-ready state; deterministic (no random), all text is fictional / from research.
import * as THREE from "three";
import { FONT } from "../../core/type/fonts.ts";

const tex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
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

/** Top-down airliner glyph centred on (x, y), nose pointing up, scaled by s. */
const planeIcon = (c: CanvasRenderingContext2D, x: number, y: number, s: number, rot = 0) => {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(0, -12);
  c.quadraticCurveTo(2, -10, 2, -5);
  c.lineTo(2, -2);
  c.lineTo(12, 3);
  c.lineTo(12, 5.5);
  c.lineTo(2, 3);
  c.lineTo(1.6, 8);
  c.lineTo(5, 10.5);
  c.lineTo(5, 12);
  c.lineTo(0, 11);
  c.lineTo(-5, 12);
  c.lineTo(-5, 10.5);
  c.lineTo(-1.6, 8);
  c.lineTo(-2, 3);
  c.lineTo(-12, 5.5);
  c.lineTo(-12, 3);
  c.lineTo(-2, -2);
  c.lineTo(-2, -5);
  c.quadraticCurveTo(-2, -10, 0, -12);
  c.closePath();
  c.fill();
  c.restore();
};

const LANES = [
  { name: "DELIVERY", color: "#f6d365", strips: [["AUDIRA 12", "IZIN RUTE"], ["AUDIRA 40", "MENUNGGU"]] },
  { name: "GROUND", color: "#43e97b", strips: [["AUDIRA 27", "TAXI"], ["AUDIRA 51", "PUSHBACK"]] },
  { name: "TOWER", color: "#f093fb", strips: [["AUDIRA 08", "LANDING"], ["AUDIRA 66", "HOLD SHORT"]] },
] as const;

/** Floating HUD: three lanes of flight strips. Transparent background (sits in front of frosted glass). */
export const hudTexture = () =>
  tex(1400, 900, (c) => {
    c.clearRect(0, 0, 1400, 900);
    // header
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.font = `600 44px ${FONT}`;
    c.textBaseline = "middle";
    c.fillText("Strip Penerbangan", 70, 92);
    c.fillStyle = "rgba(255,255,255,0.55)";
    c.font = `500 30px ${FONT}`;
    c.fillText("AUDIRA TWR", 1120, 92);
    c.fillStyle = "#43e97b";
    c.beginPath();
    c.arc(1096, 92, 9, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.16)";
    c.fillRect(70, 145, 1260, 2);
    LANES.forEach((lane, i) => {
      const x = 70 + i * 430;
      c.fillStyle = lane.color;
      c.font = `600 30px ${FONT}`;
      c.fillText(lane.name, x, 205);
      lane.strips.forEach(([cs, st], j) => {
        const y = 250 + j * 280;
        rr(c, x, y, 400, 240, 26);
        c.fillStyle = "rgba(255,255,255,0.10)";
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.28)";
        c.lineWidth = 2;
        c.stroke();
        // coloured strip holder edge
        rr(c, x, y, 16, 240, 8);
        c.fillStyle = lane.color;
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.95)";
        planeIcon(c, x + 72, y + 72, 2.3, i === 2 ? Math.PI / 2 : 0);
        c.font = `600 44px ${FONT}`;
        c.fillText(cs, x + 120, y + 74);
        c.fillStyle = lane.color;
        c.font = `600 30px ${FONT}`;
        c.fillText(st, x + 44, y + 170);
      });
    });
  });

/** Radar / ADS-B console screen: dark map, coastline, aircraft symbols with data labels. */
export const radarTexture = (variant: number) =>
  tex(512, 320, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 320);
    g.addColorStop(0, "#071a2c");
    g.addColorStop(1, "#04101c");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 320);
    c.strokeStyle = "rgba(90,200,255,0.55)";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 220 - variant * 20);
    c.bezierCurveTo(120, 180, 160, 260, 260, 230);
    c.bezierCurveTo(360, 200, 400, 120, 512, 140 + variant * 15);
    c.stroke();
    c.strokeStyle = "rgba(90,200,255,0.18)";
    c.lineWidth = 1.5;
    for (let r = 60; r < 400; r += 70) {
      c.beginPath();
      c.arc(256, 160, r, 0, Math.PI * 2);
      c.stroke();
    }
    const pts = [
      [120 + variant * 40, 90, 0.6, "AUD66"],
      [330, 70 + variant * 30, 2.2, "AUD08"],
      [400 - variant * 60, 210, -0.8, "AUD27"],
    ] as const;
    pts.forEach(([x, y, r, l]) => {
      c.fillStyle = "#7ee8ff";
      planeIcon(c, x, y, 1.1, r);
      c.font = `600 22px ${FONT}`;
      c.fillText(l, x + 16, y - 10);
    });
  });

/** Console label carrying the AUDIRA name inside the 3D world. */
export const labelTexture = () =>
  tex(512, 128, (c) => {
    rr(c, 4, 4, 504, 120, 30);
    c.fillStyle = "rgba(12,20,34,0.92)";
    c.fill();
    c.strokeStyle = "rgba(126,232,255,0.8)";
    c.lineWidth = 4;
    c.stroke();
    c.fillStyle = "#ffffff";
    c.font = `600 64px ${FONT}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("AUDIRA  TWR", 256, 68);
  });

/** Blue-hour sky gradient (vertical), mapped on an inside-out sphere. */
export const skyTexture = () =>
  tex(16, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#050a1c");
    g.addColorStop(0.32, "#0d1d44");
    g.addColorStop(0.46, "#26427a");
    g.addColorStop(0.5, "#6f6f9c");
    g.addColorStop(0.515, "#d98a6a");
    g.addColorStop(0.53, "#2a3a66");
    g.addColorStop(1, "#1b2b55");
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 512);
  });

/** Soft round glow (for emissive discs / light halos). */
export const glowTexture = () =>
  tex(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
