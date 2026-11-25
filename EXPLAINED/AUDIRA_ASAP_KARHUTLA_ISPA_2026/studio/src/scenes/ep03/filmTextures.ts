// EP03 film: extra canvas textures for the forensic desk (viral chart, CELIOS dossier, formula
// cards, Kalteng clipping, province tags, fire overlay, El Nino + NASA cards, labels).
// Seeded only, system fonts only (same rules as coverTextures.ts).
import { prng } from "../../core/materials/textures.ts";
import { canvasTex, mapTexture, proj, INK, RED, MAP_W, MAP_H } from "./coverTextures.ts";

type Ctx = CanvasRenderingContext2D;
const ls = (ctx: Ctx, px: number) => {
  (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
};

function grain(ctx: Ctx, w: number, h: number, seed: number, tint = "rgba(120,96,60,") {
  const r = prng(seed);
  for (let i = 0; i < 22; i++) {
    const x = r() * w, y = r() * h, rad = 40 + r() * w * 0.16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, tint + (0.02 + r() * 0.035) + ")");
    g.addColorStop(1, tint + "0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < (w * h) / 1000; i++) {
    ctx.fillStyle = `rgba(60,50,35,${0.03 + r() * 0.05})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1);
  }
}

function erode(ctx: Ctx, w: number, h: number, seed: number, amount = 1) {
  const r = prng(seed);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 2200 * amount; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.6})`;
    const s = 1 + r() * 4;
    ctx.fillRect(r() * w, r() * h, s, s * (0.5 + r()));
  }
  ctx.restore();
}

// ---------- Viral chart printout (2.0 x 2.8 world) ----------
export const CHART_ROWS: [string, number][] = [
  ["Papua Tengah", 463219],
  ["Jawa Timur", 377768],
  ["Lampung", 304645],
  ["NTB", 293563],
  ["Papua Pegunungan", 282083],
];
const fmt = (n: number) => n.toLocaleString("de-DE");
export const chartTexture = () =>
  canvasTex("ep03f-chart", 1000, 1400, (ctx, w, h) => {
    ctx.fillStyle = "#F7F5EF";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 61);
    ctx.fillStyle = "#16212E";
    ctx.fillRect(0, 0, w, 190);
    ctx.fillStyle = "#F4F1EA";
    ctx.font = "900 50px Arial, sans-serif";
    ls(ctx, 2);
    ctx.fillText("ESTIMASI PENDUDUK", 50, 82);
    ctx.fillText("BERPOTENSI ISPA", 50, 142);
    ls(ctx, 0);
    ctx.fillStyle = "#FF7A5C";
    ctx.font = "700 30px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("KARHUTLA 2026", w - 46, 82);
    ctx.fillText("5 TERATAS", w - 46, 140);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "900 128px 'Arial Black', Arial, sans-serif";
    ctx.fillText("3,58 JUTA", 46, 350);
    ctx.font = "600 34px Arial, sans-serif";
    ctx.fillStyle = "rgba(29,29,27,0.7)";
    ctx.fillText("total berpotensi, 32 provinsi", 50, 405);
    CHART_ROWS.forEach(([n, v], i) => {
      const y = 500 + i * 118;
      ctx.fillStyle = INK;
      ctx.font = `${i === 0 ? 900 : 700} 38px Arial, sans-serif`;
      ctx.fillText(n, 50, y);
      const len = (v / 463219) * 640;
      ctx.fillStyle = i === 0 ? RED : "#7C8A99";
      ctx.fillRect(50, y + 14, len, 54);
      ctx.fillStyle = i === 0 ? "#B81E10" : INK;
      ctx.font = "900 40px Arial, sans-serif";
      ctx.fillText(fmt(v), 50 + len + 16, y + 56);
    });
    // footnote box (the chart maker's own caveat)
    ctx.strokeStyle = "rgba(29,29,27,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 1130, w - 72, 210);
    ctx.fillStyle = "rgba(29,29,27,0.75)";
    ctx.font = "700 30px 'Courier New', monospace";
    ctx.fillText("CATATAN PEMBUAT GRAFIK:", 60, 1180);
    ctx.fillStyle = INK;
    ctx.font = "800 46px Arial, sans-serif";
    ctx.fillText("Estimasi, bukan kasus", 60, 1250);
    ctx.fillText("terkonfirmasi.", 60, 1308);
    ctx.fillStyle = "rgba(29,29,27,0.6)";
    ctx.font = "600 26px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("data: CELIOS, 2 Nov 2026", w - 56, 1308);
    ctx.textAlign = "left";
  });

// ---------- generic transparent rubber stamp ----------
export const rubberStamp = (key: string, lines: { t: string; size: number }[], w: number, h: number, seed: number, color = RED) =>
  canvasTex(
    key,
    w,
    h,
    (ctx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 14;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.lineWidth = 4;
      ctx.strokeRect(34, 34, w - 68, h - 68);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      const total = lines.reduce((a, l) => a + l.size * 1.02, 0);
      let y = h / 2 - total / 2;
      lines.forEach((l) => {
        y += l.size * 1.02;
        ctx.font = `900 ${l.size}px 'Arial Black', Arial, sans-serif`;
        ls(ctx, Math.round(l.size * 0.06));
        ctx.fillText(l.t, w / 2, y - l.size * 0.14);
      });
      ls(ctx, 0);
      erode(ctx, w, h, seed, 0.8);
    },
    true,
  );

export const stampPasien = () =>
  rubberStamp("ep03f-stamp-pasien", [{ t: "BUKAN", size: 120 }, { t: "HITUNGAN PASIEN", size: 104 }], 1240, 380, 81);
export const stampKali = () => rubberStamp("ep03f-stamp-kali", [{ t: "× 1,78", size: 150 }], 560, 260, 83);

// ---------- CELIOS dossier (1.9 x 2.42) ----------
export const dossierTexture = () =>
  canvasTex("ep03f-dossier", 1100, 1400, (ctx, w, h) => {
    ctx.fillStyle = "#F1ECE0";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 71);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 140);
    ctx.fillStyle = "#F4EFE2";
    ctx.font = "900 50px Arial, sans-serif";
    ls(ctx, 8);
    ctx.fillText("LAPORAN RISET", 60, 92);
    ls(ctx, 0);
    ctx.fillStyle = "#FF6A4D";
    ctx.font = "700 40px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("2 NOV 2026", w - 56, 90);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "900 150px 'Arial Black', Arial, sans-serif";
    ctx.fillText("CELIOS", 56, 340);
    ctx.font = "600 38px 'Courier New', monospace";
    ctx.fillStyle = "rgba(29,29,27,0.75)";
    ctx.fillText("lembaga riset ekonomi", 62, 400);
    ctx.fillStyle = "#3A2E22";
    ctx.font = "italic 700 64px Georgia, 'Times New Roman', serif";
    ctx.fillText("Membakar Hutan,", 60, 540);
    ctx.fillText("Hanguskan Ekonomi", 60, 620);
    ctx.strokeStyle = "rgba(29,29,27,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 680); ctx.lineTo(w - 60, 680); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = "700 36px 'Courier New', monospace";
    ctx.fillText("PENULIS:", 60, 750);
    ctx.font = "800 50px Arial, sans-serif";
    ctx.fillText("Nailul Huda", 60, 820);
    ctx.fillText("Bhima Yudhistira", 60, 888);
    ctx.fillStyle = "rgba(29,29,27,0.3)";
    for (let i = 0; i < 6; i++) ctx.fillRect(60, 980 + i * 56, (i % 3 === 2 ? 0.5 : 0.86) * (w - 120), 18);
    ctx.fillStyle = "rgba(29,29,27,0.7)";
    ctx.font = "700 32px 'Courier New', monospace";
    ctx.fillText("Tabel 6 · estimasi potensi ISPA", 60, 1330);
  });

// ---------- tag (manila label) ----------
export const tagTexture = (key: string, text: string, sub = "") =>
  canvasTex(key, 640, 240, (ctx, w, h) => {
    ctx.fillStyle = "#D9C49A";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, key.length * 7, "rgba(110,80,40,");
    ctx.fillStyle = "#F3EEE2";
    ctx.beginPath(); ctx.arc(52, h / 2, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(60,40,20,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = `900 ${text.length > 12 ? 50 : 76}px Arial, sans-serif`;
    ls(ctx, 3);
    ctx.fillText(text, w / 2 + 30, sub ? h / 2 + 4 : h / 2 + 26);
    ls(ctx, 0);
    if (sub) {
      ctx.font = "700 30px 'Courier New', monospace";
      ctx.fillStyle = "rgba(29,29,27,0.7)";
      ctx.fillText(sub, w / 2 + 30, h / 2 + 62);
    }
  });

// ---------- formula card ----------
export const formulaCard = (
  key: string,
  w: number,
  h: number,
  o: { title: string; value: string; sub: string; accent?: string; paper?: string; valueSize?: number },
) =>
  canvasTex(key, w, h, (ctx) => {
    ctx.fillStyle = o.paper ?? "#F6F3EA";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, key.length * 13);
    ctx.fillStyle = o.accent ?? INK;
    ctx.fillRect(0, 0, 22, h);
    ctx.fillStyle = "rgba(29,29,27,0.78)";
    ctx.font = "700 46px 'Courier New', monospace";
    ls(ctx, 2);
    ctx.fillText(o.title, 64, 78);
    ls(ctx, 0);
    ctx.fillStyle = o.accent ?? INK;
    ctx.font = `900 ${o.valueSize ?? 150}px 'Arial Black', Arial, sans-serif`;
    ctx.fillText(o.value, 58, 78 + (o.valueSize ?? 150) * 1.02);
    ctx.fillStyle = "rgba(29,29,27,0.72)";
    ctx.font = "600 38px Arial, sans-serif";
    o.sub.split("\n").forEach((line, i) => ctx.fillText(line, 64, h - 40 - (o.sub.split("\n").length - 1 - i) * 48));
  });

export const cardPenduduk = () =>
  formulaCard("ep03f-c-pend", 1200, 420, { title: "PENDUDUK PAPUA TENGAH", value: "≈ 1,4 JUTA", sub: "data model: 1.384.230 orang" });
export const cardPrev = () =>
  formulaCard("ep03f-c-prev", 1200, 470, {
    title: "× ANGKA ISPA DASAR",
    value: "≈ 19%",
    sub: "18,8% menurut CELIOS, dari survei\nKemenkes 2023 · tertinggi nasional",
    accent: "#1B2A4A",
  });
export const cardKali = () =>
  formulaCard("ep03f-c-kali", 1200, 420, { title: "× PENGALI", value: "1,78", sub: "asumsi kenaikan kasus 78%", accent: "#B81E10" });
export const cardHasil = () =>
  formulaCard("ep03f-c-hasil", 1200, 470, {
    title: "= HASIL MODEL",
    value: "≈ 463 RIBU",
    sub: "BERPOTENSI · estimasi, bukan pasien",
    accent: "#B81E10",
    paper: "#F3E3D6",
  });

// ---------- Kalteng clipping (1.8 x 0.95) ----------
export const kaltengTexture = () =>
  canvasTex("ep03f-kalteng", 1200, 640, (ctx, w, h) => {
    ctx.fillStyle = "#E8E1CF";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 91);
    ctx.fillStyle = INK;
    ctx.font = "700 38px 'Courier New', monospace";
    ctx.fillText("ASAL PENGALI · AGUSTUS 2026", 50, 70);
    ctx.font = "900 72px Arial, sans-serif";
    ctx.fillText("KALIMANTAN TENGAH", 50, 160);
    ctx.font = "700 44px Arial, sans-serif";
    ctx.fillStyle = "rgba(29,29,27,0.8)";
    ctx.fillText("kasus ISPA dalam sepekan", 50, 236);
    ctx.fillStyle = INK;
    ctx.font = "900 130px 'Arial Black', Arial, sans-serif";
    ctx.fillText("402", 50, 400);
    ctx.fillText("716", 520, 400);
    ctx.strokeStyle = "#B81E10";
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(340, 350); ctx.lineTo(480, 350); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(450, 320); ctx.lineTo(486, 350); ctx.lineTo(450, 380); ctx.stroke();
    ctx.fillStyle = "#B81E10";
    ctx.font = "900 96px 'Arial Black', Arial, sans-serif";
    ctx.fillText("+78%", 830, 395);
    ctx.fillStyle = "rgba(29,29,27,0.7)";
    ctx.font = "600 34px 'Courier New', monospace";
    ctx.fillText("data Kemenkes, per 21 Agt 2026", 50, 480);
    ctx.fillStyle = "rgba(29,29,27,0.25)";
    for (let i = 0; i < 2; i++) ctx.fillRect(50, 530 + i * 44, (i ? 0.6 : 0.9) * (w - 100), 16);
  });

// ---------- Fire overlay on Papua Selatan (same pixel grid as the map) ----------
const SELATAN: [number, number][] = [
  [138.15, -4.1], [139.2, -4.55], [140.3, -5.05], [141.0, -5.2], [141.0, -6.3], [140.9, -6.9], [141.0, -9.1],
  [140.4, -8.5], [139.5, -8.15], [138.9, -8.35], [138.0, -8.4], [137.65, -7.9], [138.1, -7.2], [138.5, -6.6],
  [138.2, -5.6], [137.5, -5.1], [137.8, -4.75],
];
export const fireTexture = () =>
  canvasTex(
    "ep03f-fire",
    MAP_W,
    MAP_H,
    (ctx, w, h) => {
      ctx.save();
      ctx.beginPath();
      SELATAN.forEach(([lo, la], i) => {
        const [x, y] = proj(lo, la);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(240,120,20,0.32)";
      ctx.fill();
      ctx.strokeStyle = "rgba(220,90,10,0.95)";
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.clip();
      ctx.strokeStyle = "rgba(210,80,10,0.5)";
      ctx.lineWidth = 4;
      for (let i = -h; i < w; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
      }
      // burn scars (seeded blobs)
      const r = prng(17);
      for (let i = 0; i < 46; i++) {
        const [x, y] = proj(138.3 + r() * 2.6, -5.4 - r() * 3.0);
        ctx.fillStyle = `rgba(${40 + r() * 40},${18 + r() * 14},8,${0.35 + r() * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 10 + r() * 34, 6 + r() * 18, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      const [lx, ly] = proj(139.55, -6.2);
      ctx.textAlign = "center";
      ctx.lineJoin = "round";
      ctx.font = "900 70px 'Arial Black', Arial, sans-serif";
      ctx.strokeStyle = "rgba(244,239,226,0.95)";
      ctx.lineWidth = 14;
      ctx.strokeText("API TERLUAS", lx, ly);
      ctx.fillStyle = "#B4470A";
      ctx.fillText("API TERLUAS", lx, ly);
      ctx.font = "700 30px 'Courier New', monospace";
      ctx.lineWidth = 10;
      ctx.strokeText("±319 ribu ha (Nusantara Atlas)", lx, ly + 48);
      ctx.fillStyle = INK;
      ctx.fillText("±319 ribu ha (Nusantara Atlas)", lx, ly + 48);
    },
    true,
  );

/** The cover map, reused as the film's map sheet. */
export const filmMap = () => mapTexture();

// ---------- billboard label ----------
export const labelTexture = (
  key: string,
  lines: { t: string; size: number; color?: string; weight?: number; mono?: boolean }[],
  w: number,
  h: number,
  bg = "#F6F3EA",
  bar = INK,
) =>
  canvasTex(key, w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, key.length * 5);
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, w, 16);
    const total = lines.reduce((a, l) => a + l.size * 1.12, 0);
    let y = (h - total) / 2 + 8;
    ctx.textAlign = "center";
    lines.forEach((l) => {
      y += l.size * 1.12;
      ctx.fillStyle = l.color ?? INK;
      ctx.font = l.mono ? `700 ${l.size}px 'Courier New', monospace` : `${l.weight ?? 900} ${l.size}px Arial, sans-serif`;
      ctx.fillText(l.t, w / 2, y - l.size * 0.2);
    });
  });

// ---------- El Nino card (1.6 x 1.1) ----------
export const elninoTexture = () =>
  canvasTex("ep03f-elnino", 1160, 800, (ctx, w, h) => {
    ctx.fillStyle = "#EFE7D4";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 101);
    ctx.fillStyle = "#B4470A";
    ctx.fillRect(0, 0, w, 120);
    ctx.fillStyle = "#FFF4E2";
    ctx.font = "900 66px Arial, sans-serif";
    ls(ctx, 4);
    ctx.fillText("EL NIÑO SANGAT KUAT", 50, 84);
    ls(ctx, 0);
    // thermometer
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(90, 170, 70, 430, 35); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(125, 640, 66, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = RED;
    ctx.beginPath(); ctx.arc(125, 640, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(108, 230, 34, 400);
    ctx.fillStyle = INK;
    for (let i = 0; i < 8; i++) ctx.fillRect(170, 200 + i * 50, i % 2 ? 22 : 40, 5);
    // cracked earth
    const r = prng(5);
    ctx.strokeStyle = "rgba(90,60,30,0.7)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 18; i++) {
      let x = 300 + r() * 800, y = 560 + r() * 200;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 70; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.font = "900 72px Arial, sans-serif";
    ctx.fillText("Papua biasanya basah", 290, 260);
    ctx.fillStyle = "#B4470A";
    ctx.font = "900 104px 'Arial Black', Arial, sans-serif";
    ctx.fillText("MENGERING", 290, 390);
    ctx.fillStyle = "rgba(29,29,27,0.75)";
    ctx.font = "700 36px 'Courier New', monospace";
    ctx.fillText("musim hujan mundur · BMKG, Sep 2026", 290, 470);
  });

// ---------- NASA emissions card (1.6 x 1.3), bars are 3D on top ----------
export const NASA_BARS_U = [0.3, 0.55, 0.8]; // bar centres as fraction of card width
export const nasaTexture = () =>
  canvasTex("ep03f-nasa", 1100, 900, (ctx, w, h) => {
    ctx.fillStyle = "#F4F1E8";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 111);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 120);
    ctx.fillStyle = "#F4EFE2";
    ctx.font = "900 50px Arial, sans-serif";
    ls(ctx, 3);
    ctx.fillText("EMISI KEBAKARAN PAPUA", 44, 78);
    ls(ctx, 0);
    ctx.fillStyle = "rgba(29,29,27,0.75)";
    ctx.font = "700 32px 'Courier New', monospace";
    ctx.fillText("sumber: NASA Earth Observatory", 44, 172);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(110, 700); ctx.lineTo(w - 70, 700); ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "900 54px Arial, sans-serif";
    ["1997", "2015", "2026"].forEach((y, i) => {
      ctx.fillStyle = i === 2 ? "#B81E10" : INK;
      ctx.fillText(y, NASA_BARS_U[i] * w, 768);
    });
    ctx.fillStyle = "#B81E10";
    ctx.font = "900 50px Arial, sans-serif";
    ctx.fillText("TAHUN INI: TERTINGGI KE-3", w / 2, 846);
    ctx.fillStyle = "rgba(29,29,27,0.7)";
    ctx.font = "700 28px 'Courier New', monospace";
    ctx.fillText("dalam hampir 3 dekade", w / 2, 886);
  });

// ---------- outro note (2.3 x 0.8) ----------
export const needTexture = () =>
  canvasTex("ep03f-need", 1380, 480, (ctx, w, h) => {
    ctx.fillStyle = "#F1E7B8";
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 121, "rgba(140,110,40,");
    ctx.fillStyle = "rgba(216,49,28,0.9)";
    ctx.font = "700 46px 'Courier New', monospace";
    ctx.fillText("YANG DIBUTUHKAN PAPUA:", 50, 84);
    ctx.fillStyle = "#1B2A4A";
    ctx.font = "700 92px 'Segoe Print', 'Ink Free', cursive";
    ctx.fillText("data kasus nyata", 50, 230);
    ctx.fillText("per kabupaten", 50, 370);
    ctx.strokeStyle = "#B81E10";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(50, 400); ctx.bezierCurveTo(300, 420, 600, 390, 820, 412); ctx.stroke();
  });

export const highlightTexture = () =>
  canvasTex(
    "ep03f-hl",
    512,
    64,
    (ctx, w, h) => {
      const r = prng(3);
      ctx.fillStyle = "rgba(255,214,0,0.62)";
      ctx.beginPath();
      ctx.moveTo(4, 8 + r() * 6);
      for (let x = 0; x <= w; x += 32) ctx.lineTo(x, 4 + r() * 8);
      for (let x = w; x >= 0; x -= 32) ctx.lineTo(x, h - 4 - r() * 8);
      ctx.closePath();
      ctx.fill();
    },
    true,
  );

