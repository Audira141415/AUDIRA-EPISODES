// EP17 ASHABUL UKHDUD: PEMUDA DAN PARIT BERAPI. MANUSCRIPT: an illuminated leporello (accordion manuscript) unfolded
// on a scriptorium table by candlelight. Nine painted folios lie side by side along +x; each folio arches gently, so the
// strip reads as a landscape of paper hills with valleys at the folds. Gold leaf is real metal (metalness mask), lapis and
// vermilion are pigment. Miniature scenes stand on each folio as flat painted cut-out layers (pop-up book).
// A loose leaf turns over at every scene change (the page-turn), and the camera travels along the strip.
// Depiction: every person is a faceless painted figure (no features). Violence is never shown: the beast falls back flat,
// the mountain trembles and the guards' figures fade, the boat tips, the arrow is a single gold line and the youth's
// figure turns to light; the trenches are glowing vermilion lines with figures standing firm, no bodies.
// Folio centres: Pi at x = 14 i (P0 hook, P1 Al-Buruj, P2 palace, P3 path+monk, P4 beast road, P5 mountain+sea,
// P6 field, P7 trenches, P8 colophon with AUDIRA). Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const PW = 14, PD = 26, NP = 9, ARCH = 1.1;
const CX = (i) => i * PW;
export function Y(x) { let u = (x + PW / 2) / PW; u -= Math.floor(u); return ARCH * Math.sin(Math.PI * u); }
const TW = 1024, TH = 1902, U = TW / PW;
const px = (x) => (x + PW / 2) * U, pz = (z) => (z + PD / 2) * U;
const PAL = { vel: "#EADBB8", velD: "#D9C59A", ink: "#2A1D14", gold: "#D9AE48", lapis: "#1F3F8F", lapisD: "#13285E", verm: "#C23A26", vermD: "#8E2416",
  green: "#3E7A4E", mal: "#2E8A6A", malL: "#5DA67E", ochre: "#C8913C", ochreL: "#E2B76A", rose: "#C9787A", lilac: "#8E7BB0", white: "#F5EEDC", brown: "#6B4A2E", earth: "#9A6A3E", trench: "#3A2015" };
const GOLDM = "rgb(0,90,255)", NONM = "rgb(0,255,0)";

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x120c08, fog: 0.0055, exp: 1.05, bloom: [0.32, 0.55, 0.86], shadow: true });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  envStrips(r, scene, [[40, 8, 0xffd9a0, 3.2, 0, 30, 25], [30, 6, 0xffb070, 2.2, -30, 12, 10], [24, 30, 0x8090c0, 0.6, 30, 12, -24], [60, 4, 0xfff0d0, 1.6, 0, -10, 30]], 0x140c06);
  const R = mulberry(1717);

  // ---------- painting helpers (c(name) gives the pigment, or the gold/non-gold mask colour)
  const star8 = (g, x, y, r, fill, stroke) => {
    g.beginPath();
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 - Math.PI / 2, rr = k % 2 ? r * 0.55 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); }
  };
  const flower = (g, c, x, y, s, col) => {
    g.fillStyle = c(col);
    for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.7, 0, 6.3); g.fill(); }
    g.fillStyle = c("gold"); g.beginPath(); g.arc(x, y, s * 0.5, 0, 6.3); g.fill();
  };
  function base(g, c, M, Rr, fill = "vel") {
    g.fillStyle = c(fill); g.fillRect(0, 0, TW, TH);
    if (M) return;
    for (let i = 0; i < 16; i++) {
      const x = Rr() * TW, y = Rr() * TH, rr = 80 + Rr() * 280, gr = g.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, "rgba(140,100,50,.10)"); gr.addColorStop(1, "rgba(140,100,50,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
    }
    g.strokeStyle = "rgba(90,60,30,.06)"; g.lineWidth = 1;
    for (let i = 0; i < 2600; i++) { const x = Rr() * TW, y = Rr() * TH; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Rr() * 16 - 8, y + Rr() * 4 - 2); g.stroke(); }
  }
  function vellumTone(g, M) {
    if (M) return;
    const e = g.createLinearGradient(0, 0, TW, 0);
    e.addColorStop(0, "rgba(110,70,30,.20)"); e.addColorStop(0.12, "rgba(110,70,30,0)"); e.addColorStop(0.88, "rgba(110,70,30,0)"); e.addColorStop(1, "rgba(110,70,30,.20)");
    g.fillStyle = e; g.fillRect(0, 0, TW, TH);
  }
  function frame(g, c) {
    const m = 30;
    g.lineWidth = 18; g.strokeStyle = c("gold"); g.strokeRect(m, m, TW - 2 * m, TH - 2 * m);
    g.lineWidth = 10; g.strokeStyle = c("lapis"); g.strokeRect(m + 20, m + 20, TW - 2 * m - 40, TH - 2 * m - 40);
    g.lineWidth = 3; g.strokeStyle = c("verm"); g.strokeRect(m + 31, m + 31, TW - 2 * m - 62, TH - 2 * m - 62);
    g.lineWidth = 2; g.strokeStyle = c("gold"); g.strokeRect(m + 38, m + 38, TW - 2 * m - 76, TH - 2 * m - 76);
    g.fillStyle = c("vel");
    for (let x = m + 12; x < TW - m; x += 26) { g.beginPath(); g.arc(x, m, 2.6, 0, 6.3); g.fill(); g.beginPath(); g.arc(x, TH - m, 2.6, 0, 6.3); g.fill(); }
    for (let y = m + 12; y < TH - m; y += 26) { g.beginPath(); g.arc(m, y, 2.6, 0, 6.3); g.fill(); g.beginPath(); g.arc(TW - m, y, 2.6, 0, 6.3); g.fill(); }
    for (const [x, y] of [[m, m], [TW - m, m], [m, TH - m], [TW - m, TH - m]]) {
      g.fillStyle = c("gold"); g.beginPath(); g.arc(x, y, 34, 0, 6.3); g.fill();
      g.fillStyle = c("lapis"); g.beginPath(); g.arc(x, y, 21, 0, 6.3); g.fill();
      star8(g, x, y, 15, c("gold"));
    }
  }
  function shamsa(g, c, x, y, rr, n, inner = "lapis") {
    g.beginPath();
    for (let k = 0; k < n * 2; k++) { const a = k * Math.PI / n, q = k % 2 ? rr * 0.86 : rr; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    g.closePath(); g.fillStyle = c("gold"); g.fill();
    g.fillStyle = c(inner); g.beginPath(); g.arc(x, y, rr * 0.78, 0, 6.3); g.fill();
    g.strokeStyle = c("gold"); g.lineWidth = 4; g.beginPath(); g.arc(x, y, rr * 0.72, 0, 6.3); g.stroke();
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; g.fillStyle = c("gold"); g.beginPath(); g.arc(x + Math.cos(a) * rr * 0.64, y + Math.sin(a) * rr * 0.64, rr * 0.03, 0, 6.3); g.fill(); }
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4; g.strokeStyle = c("gold"); g.lineWidth = 3; g.beginPath();
      g.moveTo(x + Math.cos(a) * rr * 0.22, y + Math.sin(a) * rr * 0.22);
      g.quadraticCurveTo(x + Math.cos(a + 0.4) * rr * 0.5, y + Math.sin(a + 0.4) * rr * 0.5, x + Math.cos(a) * rr * 0.56, y + Math.sin(a) * rr * 0.56); g.stroke();
    }
    star8(g, x, y, rr * 0.3, c("gold"));
    g.fillStyle = c("verm"); g.beginPath(); g.arc(x, y, rr * 0.11, 0, 6.3); g.fill();
    g.fillStyle = c("gold"); g.beginPath(); g.arc(x, y, rr * 0.05, 0, 6.3); g.fill();
  }
  function meadow(g, c, Rr, x0, y0, x1, y1, col = "mal", n = 60) {
    g.fillStyle = c(col); g.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let i = 0; i < 26; i++) { // rounded hill lobes with gold edges
      const x = x0 + Rr() * (x1 - x0), y = y0 + Rr() * (y1 - y0), w = 60 + Rr() * 110;
      g.fillStyle = c(i % 2 ? "malL" : "green"); g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, Math.PI, 0); g.fill();
      g.strokeStyle = c("gold"); g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, Math.PI, 0); g.stroke();
    }
    for (let i = 0; i < n; i++) flower(g, c, x0 + 20 + Rr() * (x1 - x0 - 40), y0 + 20 + Rr() * (y1 - y0 - 40), 5 + Rr() * 4, ["white", "rose", "verm", "white"][i % 4]);
  }
  function path(g, c, ptsP, wdt = 74) {
    g.lineCap = "round"; g.lineJoin = "round";
    const run = (lw, col, dash) => { g.setLineDash(dash || []); g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); ptsP.forEach(([x, z], i) => (i ? g.lineTo(px(x), pz(z)) : g.moveTo(px(x), pz(z)))); g.stroke(); };
    run(wdt + 12, c("verm"), [3, 9]); run(wdt, c("ochreL")); run(wdt * 0.5, c("ochre"), [18, 22]); g.setLineDash([]);
  }
  const IN0 = 74, IN1x = TW - 74, IN1y = TH - 74;

  const PAINT = [
    // P0 frontispiece: shamsa medallion over a lapis field, tiled floor where the figures stand
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("lapisD"); g.fillRect(IN0, IN0, IN1x - IN0, pz(0.4) - IN0);
      for (let i = 0; i < 60; i++) star8(g, IN0 + 20 + Rr() * (IN1x - IN0 - 40), IN0 + 20 + Rr() * (pz(0) - IN0 - 40), 4 + Rr() * 6, c("gold"));
      shamsa(g, c, TW / 2, pz(-6.2), 330, 32);
      g.fillStyle = c("gold"); g.fillRect(IN0, pz(0.4), IN1x - IN0, 12);
      for (let y = pz(0.4) + 12, row = 0; y < IN1y; y += 56, row++) for (let x = IN0 + (row % 2) * 28; x < IN1x; x += 56) {
        g.fillStyle = c(row % 2 ? "ochreL" : "white"); g.beginPath(); g.moveTo(x, y + 28); g.lineTo(x + 28, y); g.lineTo(x + 56, y + 28); g.lineTo(x + 28, y + 56); g.closePath(); g.fill();
        g.fillStyle = c((row + x / 56) % 3 < 1 ? "mal" : "lapis"); g.beginPath(); g.arc(x + 28, y + 28, 7, 0, 6.3); g.fill();
      }
      vellumTone(g, M); frame(g, c);
    },
    // P1 Al-Buruj: night of constellations, a vermilion band of fire scrolls below, a gold cartouche frame
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("lapisD"); g.fillRect(IN0, IN0, IN1x - IN0, IN1y - IN0);
      for (let i = 0; i < 90; i++) star8(g, IN0 + 20 + Rr() * (IN1x - IN0 - 40), IN0 + 20 + Rr() * (pz(2.5) - IN0 - 40), 3 + Rr() * 5, c("gold"));
      for (let k = 0; k < 7; k++) { // constellations ("gugusan bintang")
        const cxp = IN0 + 120 + Rr() * (IN1x - IN0 - 240), cyp = IN0 + 120 + Rr() * (pz(1.5) - IN0 - 240), S = [];
        for (let j = 0; j < 5; j++) S.push([cxp + (Rr() - 0.5) * 220, cyp + (Rr() - 0.5) * 180]);
        g.strokeStyle = c("gold"); g.lineWidth = 2; g.beginPath(); S.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        S.forEach(([x, y]) => star8(g, x, y, 11, c("gold")));
      }
      g.strokeStyle = c("gold"); g.lineWidth = 6; g.strokeRect(IN0 + 40, IN0 + 40, IN1x - IN0 - 80, pz(2.6) - IN0 - 40);
      g.fillStyle = c("earth"); g.fillRect(IN0, pz(3), IN1x - IN0, IN1y - pz(3));
      g.fillStyle = c("trench"); g.fillRect(IN0, pz(5.2), IN1x - IN0, 1.4 * U);
      g.strokeStyle = c("verm"); g.lineWidth = 7;
      for (const z of [5.2, 6.6]) { g.beginPath(); g.moveTo(IN0, pz(z)); g.lineTo(IN1x, pz(z)); g.stroke(); }
      for (let x = IN0 + 10; x < IN1x - 40; x += 46) { // flame scrolls
        g.fillStyle = c("verm"); g.beginPath(); g.moveTo(x, pz(6.4)); g.quadraticCurveTo(x + 10, pz(5.6), x + 22, pz(5.0) - Rr() * 30); g.quadraticCurveTo(x + 30, pz(5.7), x + 44, pz(6.4)); g.fill();
        g.fillStyle = c("gold"); g.beginPath(); g.moveTo(x + 12, pz(6.4)); g.quadraticCurveTo(x + 18, pz(6), x + 22, pz(5.6)); g.quadraticCurveTo(x + 27, pz(6), x + 32, pz(6.4)); g.fill();
      }
      g.fillStyle = c("gold"); g.fillRect(IN0, pz(3) - 8, IN1x - IN0, 10);
      vellumTone(g, M); frame(g, c);
    },
    // P2 palace courtyard: star-and-cross tiles, flower borders, the path leaving to the right
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("white"); g.fillRect(IN0, IN0, IN1x - IN0, IN1y - IN0);
      for (let y = IN0 + 40; y < IN1y; y += 92) for (let x = IN0 + 40; x < IN1x; x += 92) {
        star8(g, x, y, 34, c("lapis")); star8(g, x, y, 14, c("gold"));
        g.fillStyle = c("mal"); g.beginPath(); g.moveTo(x + 46, y + 22); g.lineTo(x + 70, y + 46); g.lineTo(x + 46, y + 70); g.lineTo(x + 22, y + 46); g.closePath(); g.fill();
      }
      meadow(g, c, Rr, IN0, IN0, IN1x, pz(-9.5), "mal", 18);
      g.fillStyle = c("verm"); g.fillRect(px(-4.2), pz(-3), px(4.2) - px(-4.2), pz(1.4) - pz(-3));
      g.strokeStyle = c("gold"); g.lineWidth = 8; g.strokeRect(px(-4.2), pz(-3), px(4.2) - px(-4.2), pz(1.4) - pz(-3));
      for (let x = px(-3.8); x < px(3.8); x += 40) star8(g, x + 20, pz(-0.8), 9, c("gold"));
      path(g, c, [[2.6, 1.4], [4.6, 1.9], [7.2, 2.3]]);
      vellumTone(g, M); frame(g, c);
    },
    // P3 hills: the road from the palace to the monk's hermitage and onward
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      meadow(g, c, Rr, IN0, IN0, IN1x, IN1y, "mal", 90);
      path(g, c, [[-7.2, 2.3], [-4.6, 2.6], [-2.2, 1.6], [-0.2, 0.6], [1.4, -0.4], [2.4, -1.8]]);
      path(g, c, [[-0.2, 0.6], [2.6, 2.4], [7.2, 2.6]], 60);
      vellumTone(g, M); frame(g, c);
    },
    // P4 a road through fields, blocked by the beast
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      meadow(g, c, Rr, IN0, IN0, IN1x, IN1y, "mal", 80);
      path(g, c, [[0.6, -12.4], [0.2, -6], [0.4, -2], [-0.6, 2.4], [-1.4, 6], [-0.8, 12.4]], 150);
      path(g, c, [[-7.2, 2.6], [-4, 2.5], [-1.0, 2.2]], 60);
      vellumTone(g, M); frame(g, c);
    },
    // P5 rose-lilac rock ground at the back, shore, a lapis sea with white curls in front
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("rose"); g.fillRect(IN0, IN0, IN1x - IN0, pz(-0.4) - IN0);
      for (let i = 0; i < 40; i++) {
        const x = IN0 + Rr() * (IN1x - IN0), y = IN0 + Rr() * (pz(-0.8) - IN0), w = 40 + Rr() * 80;
        g.fillStyle = c(i % 3 ? "lilac" : "white"); g.beginPath(); g.ellipse(x, y, w, w * 0.45, 0, 0, 6.3); g.fill();
        g.strokeStyle = c("gold"); g.lineWidth = 2; g.stroke();
      }
      g.fillStyle = c("ochreL"); g.fillRect(IN0, pz(-0.4), IN1x - IN0, pz(1.6) - pz(-0.4));
      g.fillStyle = c("lapis"); g.fillRect(IN0, pz(1.6), IN1x - IN0, IN1y - pz(1.6));
      g.strokeStyle = c("white"); g.lineWidth = 4;
      for (let y = pz(1.6) + 30, row = 0; y < IN1y - 10; y += 46, row++) for (let x = IN0 + (row % 2) * 32; x < IN1x - 30; x += 64) {
        g.beginPath(); g.arc(x + 32, y, 22, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
        g.beginPath(); g.arc(x + 46, y - 6, 7, Math.PI, Math.PI * 2.2); g.stroke();
      }
      g.fillStyle = c("gold"); g.fillRect(IN0, pz(1.6) - 5, IN1x - IN0, 8);
      vellumTone(g, M); frame(g, c);
    },
    // P6 the open field (lapangan): green-gold grass, an ochre gathering ground in the middle
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("green"); g.fillRect(IN0, IN0, IN1x - IN0, IN1y - IN0);
      g.fillStyle = c("ochreL"); g.beginPath(); g.ellipse(px(0), pz(0), 6 * U, 4.6 * U, 0, 0, 6.3); g.fill();
      g.strokeStyle = c("gold"); g.lineWidth = 6; g.stroke();
      g.strokeStyle = c("gold"); g.lineWidth = 2.5;
      for (let i = 0; i < 520; i++) {
        const x = IN0 + 10 + Rr() * (IN1x - IN0 - 20), y = IN0 + 10 + Rr() * (IN1y - IN0 - 20);
        if (((x - px(0)) / (6 * U)) ** 2 + ((y - pz(0)) / (4.6 * U)) ** 2 < 1.05) continue;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y - 14); g.moveTo(x, y); g.lineTo(x + 5, y - 13); g.stroke();
      }
      for (let i = 0; i < 70; i++) { const x = IN0 + 20 + Rr() * (IN1x - IN0 - 40), y = IN0 + 20 + Rr() * (IN1y - IN0 - 40); if (((x - px(0)) / (6 * U)) ** 2 + ((y - pz(0)) / (4.6 * U)) ** 2 < 1.1) continue; flower(g, c, x, y, 5, i % 2 ? "verm" : "white"); }
      vellumTone(g, M); frame(g, c);
    },
    // P7 the trenches: dark earth slots edged in vermilion across an ochre ground
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("earth"); g.fillRect(IN0, IN0, IN1x - IN0, IN1y - IN0);
      for (let i = 0; i < 300; i++) { g.fillStyle = c(i % 2 ? "ochre" : "brown"); g.beginPath(); g.arc(IN0 + Rr() * (IN1x - IN0), IN0 + Rr() * (IN1y - IN0), 2 + Rr() * 5, 0, 6.3); g.fill(); }
      for (const z0 of TRZ) {
        g.fillStyle = c("trench"); g.fillRect(px(-6), pz(z0 - 0.65), 12 * U, 1.3 * U);
        g.strokeStyle = c("verm"); g.lineWidth = 8; g.strokeRect(px(-6), pz(z0 - 0.65), 12 * U, 1.3 * U);
        g.strokeStyle = c("gold"); g.lineWidth = 2; g.strokeRect(px(-6) - 8, pz(z0 - 0.65) - 8, 12 * U + 16, 1.3 * U + 16);
      }
      g.fillStyle = c("ochreL"); g.fillRect(IN0, pz(-10.2), IN1x - IN0, 2.6 * U);
      for (let x = IN0 + 30; x < IN1x; x += 60) star8(g, x, pz(-8.9), 12, c("gold"));
      vellumTone(g, M); frame(g, c);
    },
    // P8 colophon folio: a gold-and-vermilion tailpiece rosette and, in the lower right corner, the scribe's colophon
    (g, c, M, Rr) => {
      base(g, c, M, Rr);
      g.fillStyle = c("lapisD"); g.fillRect(IN0, IN0, IN1x - IN0, pz(-0.5) - IN0);
      for (let i = 0; i < 50; i++) star8(g, IN0 + 20 + Rr() * (IN1x - IN0 - 40), IN0 + 20 + Rr() * (pz(-1) - IN0 - 40), 4 + Rr() * 5, c("gold"));
      shamsa(g, c, TW / 2, pz(-6.5), 300, 12, "verm");
      g.strokeStyle = c("ink"); g.lineWidth = 2;
      for (let y = pz(0.8); y < pz(3.6); y += 30) { g.beginPath(); g.moveTo(px(-5.6), y); g.lineTo(px(5.6), y); g.stroke(); }
      // colophon: inverted triangle of ruled lines with the scribe's mark AUDIRA
      const tx0 = px(1.0), tx1 = px(6.2), ty0 = pz(4.6), ty1 = pz(11.6), mx = (tx0 + tx1) / 2;
      g.fillStyle = c("velD"); g.beginPath(); g.moveTo(tx0, ty0); g.lineTo(tx1, ty0); g.lineTo(mx, ty1); g.closePath(); g.fill();
      g.strokeStyle = c("gold"); g.lineWidth = 6; g.stroke();
      g.strokeStyle = c("verm"); g.lineWidth = 2; g.beginPath(); g.moveTo(tx0 + 16, ty0 + 10); g.lineTo(tx1 - 16, ty0 + 10); g.lineTo(mx, ty1 - 22); g.closePath(); g.stroke();
      g.fillStyle = c("gold"); g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "italic 700 56px Georgia, 'Times New Roman', serif"; g.fillText("AUDIRA", mx, ty0 + 78);
      g.strokeStyle = c("ink"); g.lineWidth = 2;
      for (let k = 0; k < 6; k++) { const y = ty0 + 140 + k * 46, f = (y - ty0) / (ty1 - ty0), hw = (tx1 - tx0) / 2 * (1 - f) - 26; if (hw > 20) { g.beginPath(); g.moveTo(mx - hw, y); g.lineTo(mx + hw, y); g.stroke(); } }
      star8(g, mx, ty0 + 132, 14, c("verm")); star8(g, mx, ty1 - 60, 16, c("gold"));
      vellumTone(g, M); frame(g, c);
    },
  ];
  const TRZ = [-4.6, -0.3, 4.0];

  // ---------- folios
  const pageMats = [];
  for (let i = 0; i < NP; i++) {
    const seed = 900 + i * 37;
    const map = canvasTex(TW, TH, (g) => PAINT[i](g, (n) => PAL[n], false, mulberry(seed)));
    const mk = canvasTex(TW, TH, (g) => PAINT[i](g, (n) => (n === "gold" ? GOLDM : NONM), true, mulberry(seed)));
    mk.colorSpace = THREE.NoColorSpace;
    const geo = new THREE.PlaneGeometry(PW, PD, 64, 2); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) p.setY(k, Y(p.getX(k) + CX(i)));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map, roughnessMap: mk, metalnessMap: mk, roughness: 0.92, metalness: 1, envMapIntensity: 1.0 });
    pageMats.push(mat);
    const m = new THREE.Mesh(geo, mat); m.position.x = CX(i); m.receiveShadow = true; scene.add(m);
    // the sheet's front edge so the arch does not float
    const sg = new THREE.PlaneGeometry(PW, 1, 64, 1), sp = sg.attributes.position;
    for (let k = 0; k < sp.count; k++) { const x = sp.getX(k); sp.setY(k, sp.getY(k) > 0 ? Y(x + CX(i)) : 0); }
    const skirt = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0x9c845c, roughness: 0.95 }));
    skirt.position.set(CX(i), 0, PD / 2); scene.add(skirt);
  }

  // ---------- scriptorium table, candles, inkwell, quill, stacked books
  const wood = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#3a2416"; g.fillRect(0, 0, w, h);
    const Rr = mulberry(55);
    for (let i = 0; i < 160; i++) { const y = Rr() * h; g.strokeStyle = `rgba(${Rr() < 0.5 ? "20,10,4" : "90,58,32"},${0.18 + Rr() * 0.2})`; g.lineWidth = 1 + Rr() * 3; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4); g.stroke(); }
  }, [14, 6]);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(420, 180), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6, metalness: 0.0, color: 0xb08a6a }));
  table.rotation.x = -Math.PI / 2; table.position.set(60, -0.03, 0); table.receiveShadow = true; scene.add(table);

  const flameTex = canvasTex(64, 128, (g, w, h) => { const gr = g.createRadialGradient(32, 84, 2, 32, 74, 50); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.3, "rgba(255,200,90,.9)"); gr.addColorStop(1, "rgba(255,120,30,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(32, 72, 16, 52, 0, 0, 6.3); g.fill(); });
  const candles = [];
  const candleM = new THREE.MeshStandardMaterial({ color: 0xf0e2c0, roughness: 0.7, emissive: 0x3a2008, emissiveIntensity: 0.4 });
  for (let k = 0; k < 9; k++) {
    const x = -6 + k * 16.5, z = -17.5 - (k % 2) * 2.5, hh = 2.6 + (k % 3) * 0.9;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, hh, 16), candleM); c.position.set(x, hh / 2, z); c.castShadow = true; scene.add(c);
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.3, 20), new THREE.MeshStandardMaterial({ color: 0xb8913c, metalness: 1, roughness: 0.3 })); holder.position.set(x, 0.15, z); scene.add(holder);
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    f.scale.set(0.9, 1.8, 1); f.position.set(x, hh + 0.75, z); scene.add(f);
    candles.push({ f, k, y: hh + 0.75 });
  }
  const glowTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,210,130,.55)"); gr.addColorStop(1, "rgba(255,160,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  candles.forEach((cd) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 })); s.scale.set(7, 7, 1); s.position.copy(cd.f.position); scene.add(s); cd.halo = s; });
  // books stacked at the start, an inkwell and a quill by the colophon
  const bookCols = [0x5a1e18, 0x1f2f5a, 0x3e4a22, 0x6a3a1a];
  for (let k = 0; k < 4; k++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(9 - k * 0.6, 1.1, 6.5 - k * 0.3), new THREE.MeshStandardMaterial({ color: bookCols[k], roughness: 0.7 }));
    b.position.set(-15 + k * 0.2, 0.55 + k * 1.12, -4 + k * 0.3); b.rotation.y = 0.12 * (k % 2 ? 1 : -1); b.castShadow = b.receiveShadow = true; scene.add(b);
    const pg = new THREE.Mesh(new THREE.BoxGeometry(8.7 - k * 0.6, 0.9, 6.3 - k * 0.3), new THREE.MeshStandardMaterial({ color: 0xe8d8b0, roughness: 0.9 }));
    pg.position.copy(b.position); pg.position.x += 0.25; pg.rotation.y = b.rotation.y; scene.add(pg);
  }
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a050, metalness: 1, roughness: 0.28 });
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.25, 1.5, 24), new THREE.MeshStandardMaterial({ color: 0x15171f, roughness: 0.15, metalness: 0.3 }));
  ink.position.set(123.2, 0.75, 4.2); ink.castShadow = true; scene.add(ink);
  const inkRim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 8, 24), brass); inkRim.rotation.x = Math.PI / 2; inkRim.position.set(123.2, 1.52, 4.2); scene.add(inkRim);
  const featherTex = canvasTex(128, 512, (g, w, h) => {
    g.fillStyle = "#f2ead8"; g.beginPath(); g.moveTo(64, 10); g.bezierCurveTo(120, 120, 110, 360, 64, 500); g.bezierCurveTo(18, 360, 8, 120, 64, 10); g.fill();
    g.strokeStyle = "rgba(120,100,70,.5)"; g.lineWidth = 1.5; for (let y = 30; y < 480; y += 9) { g.beginPath(); g.moveTo(64, y); g.lineTo(18 + (y / 500) * 30, y + 26); g.moveTo(64, y); g.lineTo(110 - (y / 500) * 30, y + 26); g.stroke(); }
    g.strokeStyle = "#a08a60"; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 10); g.lineTo(64, 512); g.stroke();
  });
  const quill = new THREE.Group();
  const qf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5.6), new THREE.MeshStandardMaterial({ map: featherTex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }));
  qf.rotation.x = -Math.PI / 2; qf.position.set(0, 0.12, -2.4); qf.castShadow = true; quill.add(qf);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1.2, 8), brass); nib.rotation.x = Math.PI / 2; nib.position.set(0, 0.12, 0.85); quill.add(nib);
  quill.position.set(119.4, 0.05, 9.6); quill.rotation.y = -0.85; scene.add(quill);

  // ---------- cut-out figures (faceless painted miniatures)
  const INK = "#2A1D14", SKIN = "#D6AB80";
  function drawFig(g, kind, col, col2, Rr) {
    g.save();
    if (kind === "mage" || kind === "sick") { g.translate(128, 506); g.rotate(kind === "mage" ? 0.13 : 0.09); g.translate(-128, -506); }
    g.lineJoin = "round"; g.lineCap = "round";
    if (kind === "mage" || kind === "blind" || kind === "sick") { g.strokeStyle = "#5a3a1e"; g.lineWidth = 9; g.beginPath(); g.moveTo(196, 200); g.lineTo(214, 506); g.stroke(); }
    if (kind === "guard") { g.strokeStyle = "#5a3a1e"; g.lineWidth = 7; g.beginPath(); g.moveTo(206, 26); g.lineTo(206, 506); g.stroke(); g.fillStyle = "#9aa0aa"; g.beginPath(); g.moveTo(206, 6); g.lineTo(216, 40); g.lineTo(196, 40); g.closePath(); g.fill(); }
    // robe
    g.beginPath(); g.moveTo(98, 186); g.lineTo(158, 186); g.bezierCurveTo(190, 198, 198, 258, 194, 300); g.lineTo(208, 500); g.lineTo(48, 500); g.lineTo(62, 300); g.bezierCurveTo(58, 258, 66, 198, 98, 186); g.closePath();
    g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#D9AE48"; g.fillRect(121, 190, 14, 306); g.fillRect(52, 478, 152, 14);
    g.fillStyle = col2; g.fillRect(64, 296, 128, 18);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 3; g.beginPath(); g.moveTo(74, 214); g.quadraticCurveTo(70, 300, 92, 352); g.moveTo(182, 214); g.quadraticCurveTo(186, 300, 164, 352); g.stroke();
    // head (no features)
    const hood = kind === "monk" || kind === "veil" || kind === "sick";
    if (hood) { g.beginPath(); g.moveTo(80, 200); g.bezierCurveTo(70, 120, 100, 84, 128, 84); g.bezierCurveTo(156, 84, 186, 120, 176, 200); g.closePath(); g.fillStyle = kind === "monk" ? col : col2; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
    if (kind === "monk") { g.fillStyle = "#3a2a1e"; g.beginPath(); g.ellipse(128, 146, 22, 30, 0, 0, 6.3); g.fill(); }
    else { g.fillStyle = SKIN; g.beginPath(); g.ellipse(128, 142, hood ? 24 : 30, hood ? 30 : 36, 0, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
    if (kind === "king") {
      g.fillStyle = "#8E2416"; g.beginPath(); g.ellipse(128, 112, 34, 16, 0, 0, 6.3); g.fill();
      g.beginPath(); g.moveTo(90, 116); [[96, 62], [110, 96], [128, 50], [146, 96], [160, 62], [166, 116]].forEach(([x, y]) => g.lineTo(x, y)); g.closePath();
      g.fillStyle = "#E2B54C"; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.fillStyle = "#C23A26"; for (const x of [104, 128, 152]) { g.beginPath(); g.arc(x, 106, 5, 0, 6.3); g.fill(); }
    } else if (kind === "youth" || kind === "blind" || kind === "crowd") {
      g.fillStyle = kind === "youth" ? "#F5EEDC" : col2; g.beginPath(); g.ellipse(128, 112, 38, 24, 0, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke();
      g.beginPath(); g.moveTo(94, 116); g.quadraticCurveTo(128, 96, 162, 108); g.stroke();
    } else if (kind === "mage") {
      g.beginPath(); g.moveTo(96, 120); g.quadraticCurveTo(116, 60, 150, 8); g.quadraticCurveTo(146, 70, 162, 120); g.closePath(); g.fillStyle = "#3B2A55"; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.fillStyle = "#D9AE48"; g.fillRect(96, 112, 66, 8);
    } else if (kind === "guard") {
      g.beginPath(); g.moveTo(94, 128); g.quadraticCurveTo(96, 86, 128, 82); g.quadraticCurveTo(160, 86, 162, 128); g.closePath(); g.fillStyle = "#8A8F9A"; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.beginPath(); g.moveTo(122, 84); g.lineTo(128, 56); g.lineTo(134, 84); g.fillStyle = "#8A8F9A"; g.fill();
    }
    g.restore();
  }
  const figTexCache = new Map();
  function figTex(kind, col, col2) {
    const key = kind + col + col2;
    if (!figTexCache.has(key)) figTexCache.set(key, canvasTex(256, 512, (g) => drawFig(g, kind, col, col2)));
    return figTexCache.get(key);
  }
  const GOLDC = new THREE.Color(0xf0b040), WHITE = new THREE.Color(0xffffff);
  const cutouts = [];
  function cutout(tex, w, h, x, z, opt = {}) {
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
    const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, transparent: true, side: THREE.DoubleSide, roughness: 0.85, metalness: 0, emissive: opt.emissive ?? 0xb87418, emissiveIntensity: 0 });
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    const G = new THREE.Group(); G.add(m); G.position.set(x, Y(x) - 0.04, z); scene.add(G);
    const o = { G, m, mat, x, z, w, h, bill: opt.bill !== false, base: new THREE.Vector3(x, Y(x) - 0.04, z) };
    cutouts.push(o);
    return o;
  }
  const FH = (kind) => ({ king: 3.4, mage: 3.1, monk: 2.9, youth: 2.7, guard: 3.0, crowd: 2.1, veil: 2.0, blind: 2.6, sick: 2.4 }[kind]);
  const fig = (kind, col, col2, x, z, hs = 1) => cutout(figTex(kind, col, col2), FH(kind) * hs / 2, FH(kind) * hs, x, z);
  function setLook(o, gold = 0, op = 1, glow = 0) {
    o.mat.color.copy(WHITE).lerp(GOLDC, gold);
    o.mat.emissiveIntensity = gold * 0.5 + glow * 0.6;
    o.mat.opacity = op; o.mat.alphaTest = Math.max(0.01, 0.5 * op);
    o.G.visible = op > 0.01;
  }
  const CROWDC = [["#1F3F8F", "#F5EEDC"], ["#2E8A6A", "#C23A26"], ["#C9787A", "#1F3F8F"], ["#8E7BB0", "#E2B76A"], ["#C8913C", "#2E8A6A"], ["#6B4A2E", "#F5EEDC"], ["#8E2416", "#D9AE48"]];
  const crowdFig = (x, z, k, hs = 1) => { const [a, b] = CROWDC[k % CROWDC.length]; return fig(k % 3 === 1 ? "veil" : "crowd", a, b, x, z, hs); };

  // generic painted cut-out props
  const cutTex = (w, h, fn) => canvasTex(w, h, fn);
  const palaceT = cutTex(1024, 760, (g) => {
    const gold = "#D9AE48";
    g.lineJoin = "round";
    g.fillStyle = "#E9DEC6"; g.fillRect(60, 300, 904, 460); g.strokeStyle = gold; g.lineWidth = 8; g.strokeRect(60, 300, 904, 460);
    for (const x0 of [60, 854]) { g.fillStyle = "#E1D2B2"; g.fillRect(x0, 170, 110, 590); g.strokeRect(x0, 170, 110, 590); g.fillStyle = "#1F3F8F"; g.beginPath(); g.ellipse(x0 + 55, 170, 62, 70, 0, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = gold; g.fillRect(x0 + 51, 70, 8, 34); g.beginPath(); g.arc(x0 + 55, 66, 9, 0, 6.3); g.fill(); }
    g.fillStyle = "#1F3F8F"; g.beginPath(); g.arc(512, 240, 150, Math.PI, 0); g.fill(); g.strokeStyle = gold; g.lineWidth = 6; g.stroke();
    for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(362 + k * 50, 240); g.quadraticCurveTo(512, 60 + k * 6, 512, 92); g.stroke(); }
    g.fillStyle = gold; g.fillRect(508, 40, 8, 52); g.beginPath(); g.arc(512, 36, 12, 0, 6.3); g.fill();
    g.fillStyle = "#C23A26"; for (let x = 60; x < 964; x += 36) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x + 18, 274); g.lineTo(x + 36, 300); g.fill(); }
    g.fillStyle = "#1F3F8F"; g.beginPath(); g.moveTo(372, 760); g.lineTo(372, 420); g.quadraticCurveTo(372, 300, 512, 250); g.quadraticCurveTo(652, 300, 652, 420); g.lineTo(652, 760); g.closePath(); g.fill(); g.strokeStyle = gold; g.lineWidth = 10; g.stroke();
    g.fillStyle = "#151c38"; g.beginPath(); g.moveTo(420, 760); g.lineTo(420, 440); g.quadraticCurveTo(420, 350, 512, 318); g.quadraticCurveTo(604, 350, 604, 440); g.lineTo(604, 760); g.closePath(); g.fill();
    for (let y = 340; y < 740; y += 40) for (const x of [380, 630]) star8(g, x + 7, y, 7, gold);
    for (const x of [140, 230, 760, 850]) for (const y of [380, 560]) { g.fillStyle = "#13285E"; g.beginPath(); g.moveTo(x, y + 90); g.lineTo(x, y + 30); g.quadraticCurveTo(x + 25, y, x + 50, y + 30); g.lineTo(x + 50, y + 90); g.closePath(); g.fill(); g.strokeStyle = gold; g.lineWidth = 4; g.stroke(); }
    g.fillStyle = "#2E8A6A"; g.fillRect(60, 720, 904, 40); g.fillStyle = gold; for (let x = 70; x < 960; x += 30) g.fillRect(x, 734, 14, 8);
  });
  const lionT = cutTex(520, 340, (g) => {
    const D = "#1C1830", gold = "#D9AE48";
    g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = D; g.lineWidth = 16; g.beginPath(); g.moveTo(440, 170); g.bezierCurveTo(520, 140, 500, 60, 470, 70); g.stroke();
    g.fillStyle = D; for (const x of [200, 250, 380, 420]) { g.fillRect(x, 200, 32, 125); g.beginPath(); g.ellipse(x + 18, 326, 24, 10, 0, 0, 6.3); g.fill(); }
    g.beginPath(); g.ellipse(310, 180, 150, 72, 0, 0, 6.3); g.fill();
    g.beginPath(); for (let k = 0; k < 36; k++) { const a = k * Math.PI / 18, q = k % 2 ? 62 : 96; g.lineTo(140 + Math.cos(a) * q, 140 + Math.sin(a) * q * 0.95); } g.closePath(); g.fillStyle = "#2B2140"; g.fill(); g.strokeStyle = gold; g.lineWidth = 4; g.stroke();
    g.fillStyle = D; g.beginPath(); g.ellipse(124, 150, 48, 44, 0, 0, 6.3); g.fill(); g.strokeStyle = gold; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse(310, 180, 150, 72, 0, 0, 6.3); g.strokeStyle = gold; g.lineWidth = 4; g.stroke();
    g.fillStyle = "#1F3F8F"; const Rr = mulberry(3); for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(220 + Rr() * 180, 150 + Rr() * 60, 6 + Rr() * 6, 0, 6.3); g.fill(); }
  });
  const mountainT = cutTex(512, 560, (g) => {
    const Rr = mulberry(41), cols = ["#8E7BB0", "#C9787A", "#5DA67E", "#B49ACB", "#D99A8A"];
    const lobes = [];
    for (let i = 0; i < 26; i++) { const yy = 60 + Rr() * 480, spread = 40 + (yy / 560) * 200; lobes.push([256 + (Rr() - 0.5) * spread * 2, yy, 40 + Rr() * 40 + yy * 0.08]); }
    lobes.sort((a, b) => a[1] - b[1]);
    lobes.forEach(([x, y, rr], i) => {
      g.fillStyle = cols[i % cols.length]; g.beginPath(); g.moveTo(x - rr, y + rr * 0.6); g.bezierCurveTo(x - rr, y - rr * 0.9, x + rr, y - rr * 0.9, x + rr, y + rr * 0.6); g.closePath(); g.fill();
      g.strokeStyle = "#D9AE48"; g.lineWidth = 3; g.stroke();
      g.strokeStyle = "rgba(40,20,40,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - rr * 0.4, y); g.quadraticCurveTo(x, y - rr * 0.5, x + rr * 0.4, y); g.stroke();
    });
    g.fillStyle = "#B49ACB"; g.fillRect(40, 520, 432, 40);
    g.strokeStyle = "#E2B76A"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(256, 70); g.bezierCurveTo(330, 200, 160, 300, 260, 400); g.lineTo(300, 556); g.stroke();
  });
  const hermitT = cutTex(420, 360, (g) => {
    const Rr = mulberry(9);
    for (let i = 0; i < 18; i++) { const x = 40 + Rr() * 340, y = 60 + Rr() * 280, rr = 40 + Rr() * 40; g.fillStyle = ["#7C8E78", "#9AA88C", "#B49ACB"][i % 3]; g.beginPath(); g.ellipse(x, y, rr, rr * 0.8, 0, 0, 6.3); g.fill(); g.strokeStyle = "#D9AE48"; g.lineWidth = 3; g.stroke(); }
    g.fillStyle = "#1a1410"; g.beginPath(); g.moveTo(150, 360); g.lineTo(150, 240); g.quadraticCurveTo(210, 150, 270, 240); g.lineTo(270, 360); g.closePath(); g.fill(); g.strokeStyle = "#D9AE48"; g.lineWidth = 5; g.stroke();
    g.fillStyle = "#ffcf70"; g.beginPath(); g.arc(210, 300, 12, 0, 6.3); g.fill();
  });
  const treeT = (kind) => cutTex(256, 512, (g) => {
    g.lineJoin = "round";
    g.fillStyle = "#5a3a1e"; g.fillRect(118, 300, 20, 210);
    if (kind === "cypress") { g.fillStyle = "#1F5A3A"; g.beginPath(); g.moveTo(128, 10); g.bezierCurveTo(200, 160, 196, 360, 128, 440); g.bezierCurveTo(60, 360, 56, 160, 128, 10); g.fill(); g.strokeStyle = "#D9AE48"; g.lineWidth = 4; g.stroke(); }
    else {
      const Rr = mulberry(77);
      for (let i = 0; i < 16; i++) { const a = Rr() * 6.28, d = Rr() * 70; g.fillStyle = i % 2 ? "#2E8A6A" : "#3E7A4E"; g.beginPath(); g.arc(128 + Math.cos(a) * d, 180 + Math.sin(a) * d * 0.8, 50, 0, 6.3); g.fill(); }
      g.strokeStyle = "#D9AE48"; g.lineWidth = 3; g.beginPath(); g.arc(128, 180, 118, 0, 6.3); g.stroke();
      for (let i = 0; i < 30; i++) { g.fillStyle = i % 2 ? "#F5EEDC" : "#C9787A"; g.beginPath(); g.arc(128 + (Rr() - 0.5) * 200, 180 + (Rr() - 0.5) * 170, 6, 0, 6.3); g.fill(); }
    }
  });
  const boatT = cutTex(512, 320, (g) => {
    g.lineJoin = "round";
    g.strokeStyle = "#5a3a1e"; g.lineWidth = 8; g.beginPath(); g.moveTo(256, 230); g.lineTo(256, 20); g.stroke();
    g.fillStyle = "#F5EEDC"; g.beginPath(); g.moveTo(262, 30); g.lineTo(400, 190); g.lineTo(262, 190); g.closePath(); g.fill(); g.strokeStyle = "#2A1D14"; g.lineWidth = 3; g.stroke();
    g.strokeStyle = "#C23A26"; g.lineWidth = 6; for (const y of [90, 140]) { g.beginPath(); g.moveTo(262, y); g.lineTo(262 + (y - 30) * 0.86, y); g.stroke(); }
    g.fillStyle = "#7A4A26"; g.beginPath(); g.moveTo(20, 196); g.quadraticCurveTo(256, 222, 492, 196); g.quadraticCurveTo(440, 312, 256, 312); g.quadraticCurveTo(72, 312, 20, 196); g.closePath(); g.fill(); g.strokeStyle = "#2A1D14"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "#D9AE48"; g.fillRect(70, 236, 372, 10);
  });
  const waveT = cutTex(1024, 180, (g) => {
    g.fillStyle = "#1F3F8F"; g.fillRect(0, 60, 1024, 120);
    for (let x = -32; x < 1024; x += 64) { g.beginPath(); g.arc(x + 32, 62, 32, Math.PI, 0); g.fill(); }
    g.strokeStyle = "#F5EEDC"; g.lineWidth = 5; g.lineCap = "round";
    for (let x = -32; x < 1024; x += 64) { g.beginPath(); g.arc(x + 32, 64, 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(x + 46, 56, 7, Math.PI, Math.PI * 2.2); g.stroke(); }
    g.strokeStyle = "rgba(245,238,220,.5)"; g.lineWidth = 3; for (let x = 0; x < 1024; x += 48) { g.beginPath(); g.arc(x + 24, 120, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.fillStyle = "#D9AE48"; g.fillRect(0, 172, 1024, 8);
  });
  const flameT = cutTex(1024, 220, (g) => {
    const Rr = mulberry(21);
    for (let x = -20; x < 1024; x += 56) {
      const tip = 20 + Rr() * 70, sw = (Rr() - 0.5) * 40;
      g.fillStyle = "#E0461E"; g.beginPath(); g.moveTo(x, 220); g.bezierCurveTo(x + 4, 140, x + 30 + sw, 100, x + 34 + sw, tip); g.bezierCurveTo(x + 44, 110, x + 70, 150, x + 70, 220); g.fill();
      g.fillStyle = "#F6B640"; g.beginPath(); g.moveTo(x + 18, 220); g.bezierCurveTo(x + 22, 170, x + 32 + sw * 0.5, 150, x + 35 + sw * 0.5, tip + 60); g.bezierCurveTo(x + 42, 160, x + 52, 180, x + 52, 220); g.fill();
    }
  });

  // archify: lift every vertex of a mesh's geometry by the folio arch at its world x
  function archify(geo, cx, dy = 0.03) { const p = geo.attributes.position; for (let k = 0; k < p.count; k++) p.setY(k, p.getY(k) + Y(p.getX(k) + cx) + dy); geo.computeVertexNormals(); return geo; }
  const archCut = (tex, w, h, x, z, segs = 24) => {
    const geo = new THREE.PlaneGeometry(w, h, segs, 1); geo.translate(0, h / 2, 0); archify(geo, x, -0.05);
    const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, transparent: true, side: THREE.DoubleSide, roughness: 0.85, emissive: 0xff8040, emissiveIntensity: 0 });
    const m = new THREE.Mesh(geo, mat); m.position.set(x, 0, z); m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    scene.add(m); return { m, mat };
  };

  // ---------- P0 hook
  const c0 = CX(0);
  const kingH = fig("king", "#C23A26", "#1F3F8F", c0 - 3.3, 1.6);
  const youthH = fig("youth", "#1F3F8F", "#D9AE48", c0 + 0.4, 2.8);
  const crowdH = [];
  for (let k = 0; k < 11; k++) { const row = k < 6 ? 0 : 1; crowdH.push(crowdFig(c0 + 1.9 + (row ? 0.4 : 0) + (k % 6) * 0.95, 4.2 + row * 1.5 + (k % 2) * 0.2, k + 2)); }
  crowdH.forEach((o, k) => (o.ord = k));

  // ---------- P1 Al-Buruj: a row of faithful figures behind the painted fire band
  const c1 = CX(1);
  const faithful1 = [];
  for (let k = 0; k < 7; k++) faithful1.push(crowdFig(c1 - 4.2 + k * 1.4, 2.8 + (k % 2) * 0.25, k));
  const band1 = new THREE.Mesh(archify(new THREE.PlaneGeometry(11.8, 1.4, 40, 1).rotateX(-Math.PI / 2), c1, 0.05), new THREE.MeshBasicMaterial({ color: 0xff5a24, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  band1.position.set(c1, 0, 5.9); scene.add(band1);

  // ---------- P2 palace, P3 monk
  const c2 = CX(2), c3 = CX(3);
  const palace = archCut(palaceT, 11, 8.2, c2, -6.6);
  const king2 = fig("king", "#C23A26", "#1F3F8F", c2 - 2.2, -1.4);
  const mage = fig("mage", "#5A3F7A", "#D9AE48", c2 + 1.0, -0.8);
  const youth = fig("youth", "#1F3F8F", "#D9AE48", 0, 0);       // the one youth, moved along the story
  const cyp2a = cutout(treeT("cypress"), 1.6, 4.6, c2 - 5.6, -3.2), cyp2b = cutout(treeT("cypress"), 1.6, 4.6, c2 + 5.6, -3.2);
  const hermit = archCut(hermitT, 4.6, 3.9, c3 + 2.4, -3.6, 8);
  const monk = fig("monk", "#6E5A44", "#3a2a1e", c3 + 1.2, -1.6);
  const tree3 = cutout(treeT("bloom"), 2.6, 5.2, c3 - 3.8, -4.2);
  const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  lamp.scale.set(3, 3, 1); scene.add(lamp);
  const lampL = new THREE.PointLight(0xffc870, 0, 9, 1.6); scene.add(lampL);
  // youth's road: palace door -> monk (P2 -> P3), then on to the beast road (P4)
  const ROAD = new THREE.CatmullRomCurve3([[c2 + 2.4, 0, 1.3], [c2 + 4.6, 0, 1.9], [c2 + 7.2, 0, 2.3], [c3 - 4.6, 0, 2.6], [c3 - 2.2, 0, 1.6], [c3 - 0.4, 0, 0.5]].map((v) => new THREE.Vector3(...v)));

  // ---------- P4 beast road
  const c4 = CX(4);
  const lion = archCut(lionT, 5.4, 3.5, c4 + 1.7, -2.6, 12);
  lion.m.geometry.translate(0, 0, 0);
  const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2), new THREE.MeshStandardMaterial({ color: 0x8a8070, roughness: 0.9 })); stone.castShadow = true; scene.add(stone);
  const blind = fig("blind", "#C8913C", "#F5EEDC", c4 + 2.8, 1.6), sick = fig("sick", "#8E7BB0", "#F5EEDC", c4 + 4.1, 0.5);
  const tree4 = cutout(treeT("bloom"), 2.4, 4.8, c4 - 4.6, -3.4), cyp4 = cutout(treeT("cypress"), 1.5, 4.3, c4 + 5.2, -5.2);
  const road4 = new THREE.Mesh(archify(new THREE.PlaneGeometry(1.6, 12, 4, 30).rotateX(-Math.PI / 2), c4, 0.04), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  road4.position.set(c4 + 0.2, 0, -6.4); scene.add(road4);

  // ---------- P5 mountain and sea
  const c5 = CX(5);
  const king5 = fig("king", "#C23A26", "#1F3F8F", c5 - 4.9, 2.2);
  const mountain = archCut(mountainT, 5.6, 6.2, c5 - 2.6, -3.4, 12);
  const guardsM = [0, 1, 2].map((k) => fig("guard", "#6B4A2E", "#8A8F9A", 0, 0, 0.5));
  const boatG = new THREE.Group(); scene.add(boatG);
  const boatGeo = new THREE.PlaneGeometry(5, 3.1); boatGeo.translate(0, 1.0, 0);
  const boat = new THREE.Mesh(boatGeo, new THREE.MeshStandardMaterial({ map: boatT, alphaTest: 0.5, transparent: true, side: THREE.DoubleSide, roughness: 0.85 })); boatG.add(boat);
  const guardsB = [0, 1, 2].map((k) => fig("guard", "#6B4A2E", "#8A8F9A", 0, 0, 0.62));
  const waves = [2.6, 5.6].map((z, k) => archCut(waveT, 12.4, 0.7 + k * 0.15, c5, z, 40));

  // ---------- P6 field
  const c6 = CX(6);
  const tree6 = cutout(treeT("bloom"), 2.8, 5.4, c6 - 3.9, -2.4);
  const king6 = fig("king", "#C23A26", "#1F3F8F", c6 + 3.7, 1.9), guard6 = fig("guard", "#6B4A2E", "#8A8F9A", c6 + 4.8, 1.2);
  const crowd6 = [];
  {
    let k = 0;
    for (let row = 0; row < 3; row++) {
      const n = 12 + row * 3;
      for (let j = 0; j < n; j++) {
        const th = Math.PI * (1.08 + 0.84 * j / (n - 1)), rx = 5.2 + row * 1.0, rz = 3.2 + row * 1.1;
        crowd6.push(crowdFig(c6 + Math.cos(th) * rx, -0.6 + Math.sin(th) * rz, k++, 1 - row * 0.05));
      }
    }
    for (const [x, z] of [[-5.6, 2.6], [-5.0, 3.8], [-4.2, 5.0], [5.6, 3.6], [4.8, 4.8], [-6.0, 1.2]]) crowd6.push(crowdFig(c6 + x, z, k++));
  }
  const YOUTH6 = new THREE.Vector3(c6 - 2.4, 0, -0.9);
  crowd6.forEach((o) => (o.d = Math.hypot(o.x - YOUTH6.x, o.z - YOUTH6.z) + mulberry(Math.floor(o.x * 100 + o.z * 7))() * 1.2));
  const crowdOrder = [...crowd6].sort((a, b) => a.d - b.d); crowdOrder.forEach((o, k) => (o.ord = k));
  const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  arrow.geometry.translate(0, 0.5, 0); scene.add(arrow);

  // ---------- P7 trenches
  const c7 = CX(7);
  const believers = [];
  for (let k = 0; k < 9; k++) believers.push(crowdFig(c7 - 5 + k * 1.25, -7.6 + (k % 2) * 0.35, k + 3, 1.08));
  const king7 = fig("king", "#C23A26", "#1F3F8F", c7 - 4.6, 7.4), guards7 = [fig("guard", "#6B4A2E", "#8A8F9A", c7 - 5.8, 6.8), fig("guard", "#6B4A2E", "#8A8F9A", c7 - 3.5, 7.9)];
  const trench = TRZ.map((z0, k) => {
    const lines = [z0 - 0.65, z0 + 0.65].map((zz) => { const m = new THREE.Mesh(archify(new THREE.PlaneGeometry(12, 0.16, 40, 1).rotateX(-Math.PI / 2), 0, 0.05), new THREE.MeshBasicMaterial({ color: 0xff4a1a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(c7, 0, zz); scene.add(m); return m; });
    const fill = new THREE.Mesh(archify(new THREE.PlaneGeometry(12, 1.2, 40, 1).rotateX(-Math.PI / 2), 0, 0.04), new THREE.MeshBasicMaterial({ color: 0xc8301a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    fill.position.set(c7, 0, z0); scene.add(fill);
    const fgeo = new THREE.PlaneGeometry(12, 1.2, 40, 1); fgeo.translate(0, 0.6, 0);
    const p = fgeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + Y(p.getX(i) + c7) - 0.15);
    const fl = new THREE.Mesh(fgeo, new THREE.MeshBasicMaterial({ map: flameT, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, depthWrite: false }));
    fl.position.set(c7, 0, z0); scene.add(fl);
    return { lines, fill, fl, z0, k };
  });
  // ---------- P8 / s8: thousands of tiny gold figures across every folio
  const NT = 840;
  const tinyTex = canvasTex(64, 128, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(22, 48); g.lineTo(42, 48); g.lineTo(54, 126); g.lineTo(10, 126); g.closePath(); g.fill(); g.beginPath(); g.arc(32, 32, 14, 0, 6.3); g.fill(); });
  const tiny = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.84).translate(0, 0.42, 0), new THREE.MeshBasicMaterial({ map: tinyTex, color: 0xffcf6a, transparent: true, alphaTest: 0.3, depthWrite: false, side: THREE.DoubleSide }), NT);
  tiny.frustumCulled = false; scene.add(tiny);
  const tseed = [];
  { const Rr = mulberry(808); for (let i = 0; i < NT; i++) { const pg = Math.floor(Rr() * 8), x = CX(pg) + (Rr() - 0.5) * 11.4, z = (Rr() - 0.5) * 20; tseed.push([x, z, Rr()]); } }
  const dummy = new THREE.Object3D();

  // gold motes (the youth's light in s1 and s6; rising light from the healed in s4)
  const NM = 220;
  const motes = pts(scene, NM, { color: 0xffd98a, size: 0.32 });
  const mseed = []; { const Rr = mulberry(31); for (let i = 0; i < NM; i++) mseed.push([Rr(), Rr(), Rr(), Rr()]); }
  // star glints over the Al-Buruj folio
  const NG = 90, glints = pts(scene, NG, { color: 0xffe6b0, size: 0.28 });
  const gseed = []; { const Rr = mulberry(77); for (let i = 0; i < NG; i++) gseed.push([CX(1) + (Rr() - 0.5) * 11.5, (Rr() - 0.5) * 13 - 4, Rr()]); }

  // ---------- the turning leaf (page turn at every scene change)
  const LS = 36;
  const leafTex = canvasTex(TW / 2, TH / 2, (g, w, h) => {
    g.fillStyle = "#EBDDBB"; g.fillRect(0, 0, w, h);
    const Rr = mulberry(5);
    for (let i = 0; i < 1200; i++) { const x = Rr() * w, y = Rr() * h; g.strokeStyle = "rgba(90,60,30,.06)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Rr() * 10 - 5, y + Rr() * 3); g.stroke(); }
    const m = 16; g.lineWidth = 9; g.strokeStyle = "#C9A044"; g.strokeRect(m, m, w - 2 * m, h - 2 * m);
    g.lineWidth = 5; g.strokeStyle = "#1F3F8F"; g.strokeRect(m + 11, m + 11, w - 2 * m - 22, h - 2 * m - 22);
    g.lineWidth = 2; g.strokeStyle = "#C23A26"; g.strokeRect(m + 18, m + 18, w - 2 * m - 36, h - 2 * m - 36);
    star8(g, w / 2, h / 2, 90, "#C9A044"); star8(g, w / 2, h / 2, 46, "#1F3F8F"); star8(g, w / 2, h / 2, 18, "#C9A044");
    g.strokeStyle = "rgba(42,29,20,.35)"; g.lineWidth = 1.5; for (let y = 60; y < h - 60; y += 22) { if (Math.abs(y - h / 2) < 110) continue; g.beginPath(); g.moveTo(50, y); g.lineTo(w - 50, y); g.stroke(); }
  });
  const leafGeo = new THREE.BufferGeometry();
  const lpos = new Float32Array((LS + 1) * 2 * 3), luv = new Float32Array((LS + 1) * 2 * 2), lidx = [];
  for (let s = 0; s <= LS; s++) for (let j = 0; j < 2; j++) { const v = s * 2 + j; luv[v * 2] = s / LS; luv[v * 2 + 1] = j; }
  for (let s = 0; s < LS; s++) { const a = s * 2, b = a + 1, c = a + 2, d = a + 3; lidx.push(a, c, b, b, c, d); }
  leafGeo.setAttribute("position", new THREE.BufferAttribute(lpos, 3)); leafGeo.setAttribute("uv", new THREE.BufferAttribute(luv, 2)); leafGeo.setIndex(lidx);
  const leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ map: leafTex, side: THREE.DoubleSide, roughness: 0.9 }));
  leaf.frustumCulled = false; leaf.castShadow = true; scene.add(leaf);
  const TURN_D = 1.25;
  const TURNS = [[CX(0) + PW / 2, K.s2 - 0.7], [CX(1) + PW / 2, K.s3 - 0.7], [CX(3) + PW / 2, K.s4 - 0.7], [CX(4) + PW / 2, K.s5 - 0.7], [CX(5) + PW / 2, K.s6 - 0.7], [CX(6) + PW / 2, K.s7 - 0.7]];
  function leafAt(t) {
    const tr = TURNS.find(([, t0]) => t >= t0 - 0.05 && t < t0 + TURN_D + 0.5);
    if (!tr) { leaf.visible = false; return; }
    leaf.visible = true;
    const [fx, t0] = tr, u = clamp01((t - t0) / TURN_D);
    const phi = Math.PI * (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
    let x = 0, y = 0;
    for (let s = 0; s <= LS; s++) {
      const f = s / LS;
      if (s > 0) { const a = phi - 0.75 * Math.sin(phi) * (f - 0.5 / LS); x += Math.cos(a) * PW / LS; y += Math.sin(a) * PW / LS; }
      const lift = ARCH * Math.sin(Math.PI * f) * Math.cos(phi) ** 2 + 0.06;
      for (let j = 0; j < 2; j++) { const v = (s * 2 + j) * 3; lpos[v] = fx + x; lpos[v + 1] = y + lift; lpos[v + 2] = j ? -PD / 2 : PD / 2; }
    }
    leafGeo.attributes.position.needsUpdate = true; leafGeo.computeVertexNormals(); leafGeo.computeBoundingSphere();
    leaf.material.opacity = 1;
    leaf.visible = !(t > t0 + TURN_D + 0.35);
  }

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xffe9c8, 0x3a2a1e, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0b0, 2.2); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 });
  scene.add(key); scene.add(key.target);
  const candleL = new THREE.PointLight(0xffa850, 1.0, 40, 1.4); scene.add(candleL);
  const fireL = new THREE.PointLight(0xff5a20, 0, 18, 1.5); fireL.position.set(c7, 2.5, 0); scene.add(fireL);
  const kingL = new THREE.PointLight(0xff4020, 0, 7, 1.6); kingL.position.set(c5 - 4.9, 3, 4); scene.add(kingL);

  // ---------- camera spline (t, px, py, pz, lx, ly, lz) and light mood (t, key, hemi, exposure)
  const S = (k) => K[k];
  const CAM = track([
    [0, c0 - 0.6, 8.0, 13.0, c0 - 0.8, 2.6, -3.0],
    [A("s1:pemuda"), c0 - 0.2, 9.6, 15.5, c0 - 0.2, 2.8, -2.2],
    [A("s1:beriman"), c0 + 1.0, 11.0, 18.5, c0 + 1.2, 3.0, -1.2],
    [S("s2") - 0.8, c0 + 1.6, 12.0, 19.0, c0 + 1.4, 3.0, -2.2],
    [S("s2") + 0.9, c1 - 0.6, 15.0, 15.5, c1 - 0.4, 1.4, -2.0],
    [A("s2:menyiksa"), c1, 14.6, 14.6, c1, 1.2, -0.6],
    [A("s2:Kisah"), c1 + 0.6, 15.6, 15.6, c1 + 0.6, 1.2, -2.4],
    [S("s3") - 0.8, c1 + 1.6, 14.0, 17.0, c1 + 1.8, 2.0, -2.6],
    [S("s3") + 0.9, c2 - 0.6, 11.0, 19.0, c2 - 0.4, 3.6, -3.2],
    [A("s3:pemuda"), c2 + 0.4, 10.4, 18.0, c2 + 0.4, 3.4, -2.6],
    [A("s3:Di") + 0.3, c2 + 2.6, 10.0, 17.0, c2 + 3.0, 3.0, -1.6],
    [A("s3:rahib"), c3 - 0.6, 9.6, 16.6, c3 - 0.2, 2.8, -1.8],
    [A("s3:iman"), c3 + 0.2, 9.4, 15.8, c3 + 0.4, 2.8, -1.8],
    [S("s4") - 0.4, c3 + 2.4, 11.5, 18.0, c3 + 2.6, 3.0, -2.0],
    [S("s4") + 1.0, c4 - 0.4, 10.6, 18.0, c4 - 0.2, 3.0, -2.2],
    [A("s4:terbuka"), c4 + 0.2, 10.2, 17.2, c4 + 0.2, 2.8, -2.0],
    [A("s4:menyembuhkan") + 0.6, c4 + 2.2, 9.6, 16.4, c4 + 2.2, 2.6, -1.2],
    [A("s4:Allah"), c4 + 2.4, 10.0, 16.8, c4 + 2.0, 2.8, -1.4],
    [S("s5") - 0.4, c4 + 4.4, 12.0, 18.0, c4 + 4.6, 3.0, -2.0],
    [S("s5") + 0.9, c5 - 1.0, 13.5, 20.5, c5 - 1.2, 3.8, -2.0],
    [A("s5:gunung") - 0.2, c5 - 1.4, 13.0, 19.5, c5 - 1.6, 4.2, -2.6],
    [A("s5:laut") + 0.3, c5 + 1.0, 11.0, 18.0, c5 + 1.4, 1.6, 1.4],
    [A("s5:Lalu"), c5 + 0.4, 11.0, 17.5, c5 + 0.2, 1.8, 0.4],
    [A("s5:satu"), c5 - 0.2, 10.4, 16.4, c5 - 0.4, 1.8, 0.4],
    [S("s6") - 0.5, c5 + 2.6, 12.0, 18.0, c5 + 3.0, 2.6, -1.6],
    [S("s6") + 1.0, c6 - 0.4, 15.6, 21.0, c6 - 0.2, 2.0, -2.6],
    [A("s6:dengan"), c6 - 0.2, 13.4, 19.0, c6 - 0.4, 2.4, -2.0],
    [A("s6:Raja"), c6 + 0.4, 11.2, 17.4, c6 + 0.4, 2.6, -1.0],
    [A("s6:wafat"), c6 - 1.6, 8.8, 14.2, c6 - 2.0, 2.6, -1.4],
    [A("s6:Orang-orang") + 0.6, c6 - 1.0, 11.0, 17.0, c6 - 1.0, 2.4, -1.8],
    [S("s6e") - 0.6, c6, 16.4, 21.0, c6, 1.6, -2.8],
    [S("s7") + 0.9, c7 - 0.4, 12.4, 19.0, c7 - 0.4, 2.6, -2.6],
    [A("s7:teguh"), c7 + 0.2, 11.4, 17.6, c7 + 0.2, 2.6, -3.6],
    [A("s7:Al-Qur'an") + 0.6, c7 + 0.4, 17.0, 15.0, c7 + 0.4, 1.0, -3.0],
    [S("s7e"), c7 + 0.8, 19.0, 14.0, c7 + 0.6, 0.6, -3.0],
    [S("s8") + 2.2, CX(8) + 12, 21.0, 10.0, CX(5), 0.0, -1.0],
    [A("s8:ribuan") + 0.5, CX(8) + 13, 18.5, 8.6, CX(5), 0.0, -0.8],
    [A("s8:Menurut") + 1.6, CX(8) + 7.0, 17.0, 19.0, CX(8) - 1.0, 0.5, -1.5],
    [A("s8:Kisah") + 0.2, CX(8) + 2.0, 14.0, 22.0, CX(8) + 2.0, 0.5, 2.0],
    [A("s8:AUDIRA"), CX(8) + 2.4, 13.5, 21.0, CX(8) + 2.6, 0.5, 3.5],
    [K.dur, CX(8) + 2.6, 13.0, 20.5, CX(8) + 2.8, 0.5, 3.8],
  ]);
  const MOOD = track([
    [0, 2.0, 0.85, 1.05], [S("s2"), 1.7, 0.75, 1.05], [S("s3"), 2.3, 0.95, 1.05], [S("s5"), 2.0, 0.85, 1.05],
    [S("s6"), 2.3, 0.95, 1.05], [A("s6:wafat"), 1.8, 0.75, 1.0], [S("s6e"), 2.3, 0.95, 1.08], [S("s7") + 0.5, 1.15, 0.55, 1.05], [S("s7e"), 1.25, 0.6, 1.05], [S("s8") + 2, 2.1, 0.9, 1.08], [K.dur, 2.1, 0.9, 1.08],
  ]);

  // ---------- helpers
  const fade = (t, a, b) => ramp(t, a, b);
  const place = (o, x, z, dy = 0) => { o.G.position.set(x, Y(x) - 0.04 + dy, z); o.x = x; o.z = z; };
  const camP = new THREE.Vector3();
  function bill(o) { if (o.bill) o.m.rotation.y = Math.atan2(camP.x - o.G.position.x, camP.z - o.G.position.z); }
  const walkBob = (t, on) => (on ? Math.abs(Math.sin(t * 9)) * 0.08 : 0);
  let mi = 0;
  function mote(x, y, z, life, amp) {
    if (mi >= NM) return;
    motes.pos[mi * 3] = x; motes.pos[mi * 3 + 1] = y; motes.pos[mi * 3 + 2] = z;
    motes.col[mi * 3] = amp; motes.col[mi * 3 + 1] = amp * 0.85; motes.col[mi * 3 + 2] = amp * 0.55; mi++;
  }

  return (t) => {
    const cv = CAM(t);
    { const w = 1 - ramp(t, K.s5 - 0.9, K.s5 + 0.3), lx = cv[3], ly = cv[4] - 1.1 * w, lz = cv[5] + 1.4 * w, sc = 1 + 0.1 * w; cv[0] = lx + (cv[0] - lx) * sc; cv[1] = ly + (cv[1] - ly) * sc; cv[2] = lz + (cv[2] - lz) * sc; cv[4] = ly; cv[5] = lz; }
    camP.set(cv[0], cv[1], cv[2]);
    const md = MOOD(t);
    key.intensity = md[0]; hemi.intensity = md[1]; r.toneMappingExposure = md[2];
    key.target.position.set(cv[3], 0, cv[5]); key.position.set(cv[3] - 11, 24, cv[5] + 13);
    const fl = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 17.1);
    candleL.position.set(cv[3] - 5, 7, -12); candleL.intensity = 26 * fl;
    candles.forEach((cd) => { const w = 1 + 0.08 * Math.sin(t * (8 + cd.k) + cd.k) + 0.05 * Math.sin(t * 21 + cd.k * 2); cd.f.scale.set(0.9 * w, 1.8 * (2 - w), 1); cd.halo.material.opacity = 0.6 + 0.2 * w; });
    mi = 0;

    // ---------- s1 hook (P0)
    const yLight = fade(t, A("s1:pemuda") - 0.2, A("s1:pemuda") + 0.5), yGone = fade(t, A("s1:pemuda") + 0.5, A("s1:pemuda") + 1.6);
    setLook(kingH, 0, 1); setLook(youthH, yLight, 1 - yGone, yLight * 1.4 * (1 - yGone));
    if (t > A("s1:pemuda") && t < A("s1:pemuda") + 4) for (let i = 0; i < 40; i++) {
      const s = mseed[i], life = (t - A("s1:pemuda") - s[0] * 1.2) / 2.6; if (life < 0 || life > 1) continue;
      mote(youthH.base.x + (s[1] - 0.5) * 1.1, Y(youthH.base.x) + 0.4 + s[2] * 2.2 + life * 4, youthH.base.z + (s[3] - 0.5) * 0.6, life, (1 - life) * 1.3);
    }
    crowdH.forEach((o) => { const g = fade(t, A("s1:beriman") + o.ord * 0.16, A("s1:beriman") + o.ord * 0.16 + 0.45); setLook(o, g, 1, g * 0.35); });

    // ---------- s2 (P1)
    const bandOn = fade(t, A("s2:parit") - 0.2, A("s2:parit") + 0.5) * (0.6 + 0.4 * fade(t, A("s2:menyiksa"), A("s2:menyiksa") + 0.4));
    band1.material.opacity = bandOn * (0.32 + 0.08 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23));
    faithful1.forEach((o, k) => { const g = fade(t, A("s2:beriman") + k * 0.12, A("s2:beriman") + k * 0.12 + 0.4); setLook(o, g, 1, g * 0.3); });
    for (let i = 0; i < NG; i++) { const s = gseed[i], tw = 0.5 + 0.5 * Math.sin(t * (1.5 + s[2] * 3) + s[2] * 40); glints.pos[i * 3] = s[0]; glints.pos[i * 3 + 1] = 0.9 + 0.6 * s[2] + Y(s[0]); glints.pos[i * 3 + 2] = s[1]; const v = tw * tw * (t > S("s2") - 1 && t < S("s3") + 1 ? 0.9 : 0.15); glints.col[i * 3] = v; glints.col[i * 3 + 1] = v * 0.9; glints.col[i * 3 + 2] = v * 0.6; }
    glints.commit();

    // ---------- s3 (P2/P3): youth arrives, then walks the road to the monk
    const tYin = A("s3:pemuda") - 0.3, tWalk0 = A("s3:Di"), tWalk1 = A("s3:rahib") - 0.1;
    setLook(mage, 0, 1, t > A("s3:diajari") - 0.3 && t < A("s3:Di") ? 0.2 * (0.5 + 0.5 * Math.sin(t * 6)) : 0);
    mage.mat.emissive.set(0x9a70ff);
    setLook(king2, 0, 1);
    let yx, yz, yop = 1, yglow = 0, ygold = 0, walking = false;
    if (t < S("s4") - 0.5) {
      if (t < tWalk0) { const u = eout(clamp01((t - tYin) / 1.2)); yx = c2 + 5.4 - 3.0 * u; yz = 1.3; walking = u > 0 && u < 1; yop = fade(t, tYin - 0.1, tYin + 0.3); }
      else { const u = ramp(t, tWalk0, tWalk1); const p = ROAD.getPointAt(u); yx = p.x; yz = p.z; walking = u > 0 && u < 1; }
      if (t > A("s3:iman") - 0.4) yglow = 0.25 * fade(t, A("s3:iman") - 0.4, A("s3:iman") + 0.4);
    } else if (t < S("s5") - 0.5) {
      // s4: on the beast road
      yx = c4 - 2.6; yz = 2.3;
    } else if (t < S("s6") - 0.5) {
      // s5: mountain top, then the boat, then walking back to the shore
      const tg = A("s5:gunung"), tl = A("s5:laut");
      if (t < tg + 0.9) { yx = c5 - 2.6; yz = -3.1; }
      else if (t < tl - 0.1) { const u = ramp(t, tg + 0.9, tl - 0.2); yx = c5 - 2.6 + 0.9 * u; yz = -3.1 + 2.6 * u; walking = true; }
      else if (t < tl + 1.0) { yx = 999; yz = 0; }
      else { const u = eout(clamp01((t - tl - 1.0) / 1.6)); yx = c5 + 2.6 - 2.2 * u; yz = 2.4 - 1.6 * u; walking = u < 0.98; }
    } else { yx = YOUTH6.x; yz = YOUTH6.z; }
    if (yx > 900) youth.G.visible = false;
    else {
      let dy = walkBob(t, walking);
      if (t >= S("s5") - 0.5 && t < S("s6") - 0.5 && t < A("s5:gunung") + 0.9) dy += 5.15; // on the painted summit
      else if (t >= S("s5") - 0.5 && t < S("s6") - 0.5 && t < A("s5:laut") - 0.1) dy += 5.15 * (1 - ramp(t, A("s5:gunung") + 0.9, A("s5:laut") - 0.2));
      place(youth, yx, yz, dy);
      if (t >= S("s6") - 0.5) {
        // s6: the gold line, the youth turns to light
        const tw = A("s6:wafat");
        const lg = fade(t, tw - 0.45, tw + 0.1), gone = fade(t, tw + 0.25, tw + 1.4);
        ygold = lg; yglow = lg * 1.8 * (1 - gone); yop = 1 - gone;
        if (t > tw - 0.2 && t < tw + 5) for (let i = 40; i < 140; i++) {
          const s = mseed[i], life = (t - tw - s[0] * 1.6) / 3.2; if (life < 0 || life > 1) continue;
          mote(yx + (s[1] - 0.5) * 1.2, Y(yx) + 0.3 + s[2] * 2.4 + life * 5, yz + (s[3] - 0.5) * 0.6, life, (1 - life) * 1.4);
        }
      }
      setLook(youth, ygold, yop, yglow);
    }
    lamp.position.set(c3 + 0.3, 2.0, -0.4); const lo = fade(t, A("s3:iman") - 0.6, A("s3:iman") + 0.4) * (1 - fade(t, S("s4") - 0.8, S("s4")));
    lamp.material.opacity = lo * 0.9; lampL.position.set(c3 + 0.3, 2.2, 0.2); lampL.intensity = lo * 6;
    setLook(monk, 0, 1, lo * 0.15);

    // ---------- s4 (P4): stone, the beast falls back flat, the road opens, the healed
    const tThrow = A("s4:batu") - 0.3, tHit = A("s4:berdoa") + 0.1, tOpen = A("s4:terbuka");
    const su = clamp01((t - tThrow) / (tHit - tThrow));
    stone.visible = t > tThrow && t < tHit + 0.05;
    if (stone.visible) { const x0 = c4 - 2.3, x1 = c4 + 0.6; stone.position.set(x0 + (x1 - x0) * su, 2.2 + Math.sin(Math.PI * su) * 2.2 + Y(x0), 2.2 - 4.4 * su); stone.rotation.set(t * 9, t * 7, 0); }
    if (t > tHit - 0.05 && t < tHit + 1.6) for (let i = 140; i < 170; i++) { const s = mseed[i], life = (t - tHit) / 1.4 + s[0] * 0.2; if (life < 0 || life > 1) continue; mote(c4 + 0.6 + (s[1] - 0.5) * 2 * life, 2.4 + (s[2] - 0.3) * 2 * life, -2.2 + (s[3] - 0.5) * life, life, 1.2 * (1 - life)); }
    const fall = eout(clamp01((t - tHit - 0.1) / (tOpen - tHit + 0.3)));
    lion.m.rotation.x = -1.48 * fall; lion.m.position.y = 0.04 * fall;
    lion.mat.opacity = 1 - 0.75 * fall; lion.mat.alphaTest = Math.max(0.01, 0.5 * lion.mat.opacity);
    road4.material.opacity = fade(t, tOpen - 0.2, tOpen + 0.5) * (1 - fade(t, S("s4e"), S("s4e") + 1)) * 0.3;
    const tHeal = A("s4:menyembuhkan");
    [blind, sick].forEach((o, k) => {
      const inn = fade(t, A("s4:Ia") - 0.3 + k * 0.2, A("s4:Ia") + 0.3 + k * 0.2), hl = fade(t, tHeal + 0.3 + k * 0.9, tHeal + 1.0 + k * 0.9);
      setLook(o, hl * 0.45, inn, hl * 0.3 * (1 - fade(t, A("s4:Allah"), S("s4e"))));
      o.m.scale.y = k === 1 ? 0.82 + 0.18 * hl : 1;
      if (hl > 0 && t < S("s4e") + 0.5) for (let i = 0; i < 12; i++) { const s = mseed[170 + k * 12 + i], life = ((t - tHeal - k * 0.9) * 0.5 + s[0]) % 1; mote(o.base.x + (s[1] - 0.5) * 0.9, o.base.y + 0.5 + life * 3.2, o.base.z + (s[2] - 0.5) * 0.4, life, hl * 0.7 * Math.sin(Math.PI * life)); }
    });

    // ---------- s5 (P5): the king's anger, the mountain trembles, the boat tips
    kingL.intensity = fade(t, A("s5:murka") - 0.3, A("s5:murka") + 0.2) * (1 - fade(t, A("s5:gunung") - 0.5, A("s5:gunung"))) * (6 + 2 * Math.sin(t * 11));
    setLook(king5, 0, 1);
    const tg = A("s5:gunung"), tq = fade(t, tg - 0.1, tg + 0.1) * (1 - fade(t, tg + 1.0, tg + 1.4));
    mountain.m.position.x = c5 - 2.6 + tq * 0.07 * Math.sin(t * 61); mountain.m.rotation.z = tq * 0.012 * Math.sin(t * 47);
    guardsM.forEach((o, k) => {
      const fallG = fade(t, tg + 0.15 + k * 0.1, tg + 0.9 + k * 0.1);
      place(o, c5 - 3.4 + k * 0.55 + (k > 0 ? 0.5 : 0), -3.15 + k * 0.05, 5.15 - 1.4 * fallG + (k === 1 ? 0.05 : 0));
      setLook(o, 0, (1 - fallG) * (t > S("s5") - 0.6 ? 1 : 0));
      o.G.position.x += tq * 0.07 * Math.sin(t * 61);
    });
    const tl = A("s5:laut"), tip = eout(clamp01((t - tl - 0.35) / 0.9));
    const bx = c5 + 2.4, bz = 3.6, bob = Math.sin(t * 2.2) * 0.08;
    boatG.position.set(bx, Y(bx) - 0.6 - 1.7 * tip + bob, bz); boatG.rotation.set(0, 0, 0.75 * tip + Math.sin(t * 1.7) * 0.04);
    boatG.visible = t > S("s5") - 0.6 && t < S("s6");
    boat.rotation.y = Math.atan2(camP.x - bx, camP.z - bz);
    guardsB.forEach((o, k) => {
      const lx = -1.0 + k * 0.9 + (k === 2 ? 0.5 : 0);
      const wpos = new THREE.Vector3(lx, 0.9, 0).applyEuler(boatG.rotation).add(boatG.position);
      o.G.position.copy(wpos); o.G.rotation.z = boatG.rotation.z;
      setLook(o, 0, (boatG.visible ? 1 : 0) * (1 - fade(t, tl + 0.5 + k * 0.08, tl + 1.0 + k * 0.08)));
    });
    // the youth sits in the boat during the sea attempt
    if (t >= tl - 0.1 && t < tl + 1.0 && t < S("s6") - 0.5) {
      const wpos = new THREE.Vector3(0.35, 0.9, 0.05).applyEuler(boatG.rotation).add(boatG.position);
      youth.G.visible = true; youth.G.position.copy(wpos); setLook(youth, 0, 1 - fade(t, tl + 0.6, tl + 0.95));
    }
    waves.forEach((w, k) => { w.m.position.x = c5 + Math.sin(t * 0.9 + k * 1.7) * 0.3; w.m.position.y = Math.sin(t * 1.3 + k) * 0.06; w.m.visible = true; });

    // ---------- s6 (P6): gathering, the gold line, the crowd believes
    crowd6.forEach((o) => {
      const row = Math.min(2, Math.floor(o.ord / 16));
      const inn = fade(t, S("s6") + 0.2 + o.ord * 0.035, S("s6") + 0.6 + o.ord * 0.035);
      const tb = A("s6:Orang-orang") + o.ord * 0.075, g = fade(t, tb, tb + 0.5);
      setLook(o, g, t < S("s6") - 0.5 ? 1 : inn, g * 0.4);
    });
    setLook(king6, 0, 1); setLook(guard6, 0, 1);
    const ta0 = A("s6:Raja") + 0.45, ta1 = ta0 + 0.7;
    const A0 = new THREE.Vector3(king6.base.x - 0.5, Y(king6.base.x) + 2.2, king6.base.z), A1 = new THREE.Vector3(YOUTH6.x + 0.3, Y(YOUTH6.x) + 1.9, YOUTH6.z);
    const au = eout(clamp01((t - ta0) / (ta1 - ta0)));
    const dir = A1.clone().sub(A0), len = dir.length();
    arrow.position.copy(A0); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    arrow.scale.set(1, Math.max(0.001, len * au), 1);
    arrow.material.opacity = (t > ta0 ? 1 : 0) * (1 - fade(t, A("s6:wafat") + 0.3, A("s6:wafat") + 1.2)) * 0.95;

    // ---------- s7 (P7): trenches glow, flames rise, believers stand firm
    const tdig = A("s7:menggali");
    trench.forEach((T) => {
      const d0 = tdig + T.k * 0.45, on = fade(t, d0, d0 + 0.7) * (t > S("s7") - 0.8 ? 1 : 0);
      const flick = 0.82 + 0.12 * Math.sin(t * 13 + T.k * 2) + 0.06 * Math.sin(t * 29 + T.k);
      T.lines.forEach((m) => { m.scale.x = Math.max(0.001, on); m.material.opacity = on * 0.85 * flick; });
      T.fill.scale.x = Math.max(0.001, on); T.fill.material.opacity = on * 0.35 * flick;
      const fr = fade(t, A("s7:parit-parit") + 0.3 + T.k * 0.3, A("s7:parit-parit") + 1.0 + T.k * 0.3) * (1 - 0.5 * fade(t, A("s7:Al-Qur'an"), S("s7e")));
      T.fl.visible = fr > 0.01 && t < S("s8") + 3; T.fl.scale.y = Math.max(0.01, fr * (0.85 + 0.15 * Math.sin(t * 7 + T.k * 3)));
      T.fl.position.x = c7 + 0.25 * Math.sin(t * 2.3 + T.k);
    });
    fireL.intensity = fade(t, tdig, tdig + 1.5) * (1 - fade(t, S("s8") + 1, S("s8") + 3)) * 40 * flI(t);
    function flI(tt) { return 0.85 + 0.15 * Math.sin(tt * 11) * Math.sin(tt * 5.3); }
    const firm = fade(t, A("s7:teguh") - 0.4, A("s7:teguh") + 0.4);
    believers.forEach((o, k) => setLook(o, 0.55 + 0.45 * firm, 1, 0.25 + 0.55 * firm));
    setLook(king7, 0, 1); guards7.forEach((o) => setLook(o, 0, 1));

    // ---------- s8: the faith spreads across every folio
    const tk = A("s8:keyakinan");
    const camYaw = Math.atan2(camP.x, camP.z);
    for (let i = 0; i < NT; i++) {
      const [x, z, s] = tseed[i];
      const ti = tk + Math.abs(x - c6) / 50 * 1.9 + s * 0.4, g = eout(clamp01((t - ti) / 0.5));
      dummy.position.set(x, Y(x) - 0.02 + (g < 1 ? -0.9 * (1 - g) : 0), z);
      dummy.rotation.set(0, Math.atan2(camP.x - x, camP.z - z), 0);
      dummy.scale.set(g > 0.01 ? 1 : 0.0001, Math.max(0.0001, g), 1);
      dummy.updateMatrix(); tiny.setMatrixAt(i, dummy.matrix);
    }
    tiny.instanceMatrix.needsUpdate = true; tiny.visible = t > tk - 0.2;
    void camYaw;

    // after the field, every crowd figure in the world stays gold
    for (; mi < NM; mi++) motes.pos[mi * 3 + 1] = -99;
    motes.commit();
    for (const o of cutouts) bill(o);
    leafAt(t);
    cam.position.copy(camP); cam.lookAt(cv[3], cv[4], cv[5]);
    comp.render();
  };
}
