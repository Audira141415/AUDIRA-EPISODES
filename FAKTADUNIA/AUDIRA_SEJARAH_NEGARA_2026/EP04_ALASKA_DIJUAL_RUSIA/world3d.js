// EP04 VINTAGEFORGE + DATAPHYSICAL: a candle-lit writing desk. In the middle, a parchment map of the North Pacific inks itself;
// around it sit the treaty, a brass balance, Senate vote tokens, newspapers and two desk calendars. Sitka is a paper diorama on the map.
// Everything is a function of t. Original art: no portraits, no real document scans.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, std, box, cyl, stage, pts, back } from "./lib3d.js";
import { GEO } from "./geo.js";

const W = 76, H = 46, CW = 2048, CH = 1240, LON0 = -152, LAT0 = 61, S = 1.5;
const P = (lon, lat) => [(lon - LON0) * Math.cos((lat * Math.PI) / 180) * S, -(lat - LAT0) * S];
const C = (x, z) => [((x + W / 2) / W) * CW, ((z + H / 2) / H) * CH];
const PC = (lon, lat) => C(...P(lon, lat));
const INK = "#3A2A1A", COP = "#B0643A", RED = "#8E2A1E", GOLD = "#C9A24A", NAVY = "#1F3550", GRN = "#3E5B3A", PAR = "#E9D9B6";
const COL = { cop: new THREE.Color(COP), grn: new THREE.Color(GRN), navy: new THREE.Color(NAVY), red: new THREE.Color(RED) };

// Hermite camera track with harmonic-mean tangents: long whip pans between stations never overshoot the station.
function track(keys) {
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

function dyn(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  return { g: c.getContext("2d"), tx, c };
}
const font = (px, w = 700, it = false) => `${it ? "italic " : ""}${w} ${px}px Georgia, serif`;

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x120b06, fog: 0.0042, exp: 0.92, bloom: [0.32, 0.55, 0.86] });
  const rnd = mulberry(1867);
  const hemi = new THREE.HemisphereLight(0xffe2b8, 0x2a170a, 1.0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd29a, 1.35);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 260 });
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);

  // ---------- desk ----------
  const woodT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#3d2414"; g.fillRect(0, 0, w, h);
    const q = mulberry(7);
    for (let i = 0; i < 260; i++) {
      const y0 = q() * h, a = 0.05 + q() * 0.12, l = q() < 0.5;
      g.strokeStyle = l ? `rgba(120,74,40,${a})` : `rgba(15,7,2,${a * 1.4})`; g.lineWidth = 1 + q() * 4;
      g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.004 + i) * 14 + Math.sin(x * 0.019 + i * 2) * 4); g.stroke();
    }
  }, [5, 4]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(520, 360), new THREE.MeshStandardMaterial({ map: woodT, roughness: 0.62, metalness: 0.05 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(30, -0.25, 0); desk.receiveShadow = true; scene.add(desk);

  // ---------- map geometry: strokes for ink, rings for fills ----------
  const strokes = [], fills = [];
  for (const c of GEO) for (const ring of c.rings) {
    const pr = ring.map(([lo, la]) => PC(lo, la));
    fills.push({ name: c.name, ring: pr });
    let cur = [];
    for (let i = 0; i < ring.length; i++) {
      const p = pr[i], out = p[0] < -80 || p[0] > CW + 80 || p[1] < -80 || p[1] > CH + 80;
      const seam = i > 0 && Math.abs(ring[i][0] + 180) < 0.02 && Math.abs(ring[i - 1][0] + 180) < 0.02;
      if (out || seam) { if (cur.length > 1) strokes.push(cur); cur = out ? [] : [p]; continue; }
      cur.push(p);
    }
    if (cur.length > 1) strokes.push(cur);
  }
  for (const s of strokes) { let L = 0; s.len = [0]; for (let i = 1; i < s.length; i++) { L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); s.len.push(L); } s.L = L; }
  const ringPath = (g, sc = 1, name) => { g.beginPath(); for (const f of fills) { if (name && f.name !== name) continue; f.ring.forEach((p, i) => (i ? g.lineTo(p[0] * sc, p[1] * sc) : g.moveTo(p[0] * sc, p[1] * sc))); g.closePath(); } };
  const strokeAll = (g) => { g.beginPath(); for (const s of strokes) s.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); };
  const label = (g, txt, lon, lat, px, { sp = 8, it = false, col = INK, rot = 0, w = 700 } = {}) => {
    const [x, y] = PC(lon, lat); g.save(); g.translate(x, y); g.rotate(rot); g.font = font(px, w, it); g.letterSpacing = sp + "px"; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 0); g.restore();
  };

  // base parchment: stains, sea hatching, coast ripple lines, graticule, compass rose, cartouche
  const baseT = canvasTex(CW, CH, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.48, h * 0.45, 100, w / 2, h / 2, w * 0.62);
    gr.addColorStop(0, "#EEDFBE"); gr.addColorStop(0.7, PAR); gr.addColorStop(1, "#BF9F68");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(3);
    for (let i = 0; i < 60; i++) { const x = q() * w, y = q() * h, rr = 30 + q() * 160, s = g.createRadialGradient(x, y, 0, x, y, rr); s.addColorStop(0, `rgba(140,96,48,${0.04 + q() * 0.07})`); s.addColorStop(1, "rgba(140,96,48,0)"); g.fillStyle = s; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    for (let i = 0; i < 1800; i++) { g.strokeStyle = `rgba(90,60,30,${0.03 + q() * 0.05})`; g.lineWidth = 0.6 + q(); const x = q() * w, y = q() * h, a = q() * 6.28, l = 6 + q() * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // sea hatch
    g.strokeStyle = "rgba(58,42,26,.17)"; g.lineWidth = 1.5;
    g.beginPath(); for (let k = -h; k < w; k += 11) { g.moveTo(k, h); g.lineTo(k + h, 0); } g.stroke();
    // ripple lines echo the coasts
    g.lineJoin = "round";
    for (const [lw, a] of [[64, 0.045], [42, 0.06], [22, 0.08]]) { g.strokeStyle = `rgba(58,42,26,${a})`; g.lineWidth = lw; strokeAll(g); g.strokeStyle = "rgba(233,217,182,.55)"; g.lineWidth = lw - 6; strokeAll(g); }
    // land: lighter paper, stipple, then a soft inner shade
    g.save(); ringPath(g); g.fillStyle = "#F0E3C4"; g.fill(); g.strokeStyle = "#F0E3C4"; g.lineWidth = 2; g.stroke(); g.clip();
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,62,30,${0.05 + q() * 0.1})`; g.fillRect(q() * w, q() * h, 1.6, 1.6); }
    // mountain hachures, a period habit: short tick rows across the interiors
    g.strokeStyle = "rgba(58,42,26,.22)"; g.lineWidth = 1.4;
    for (let i = 0; i < 420; i++) { const x = q() * w, y = q() * h; g.beginPath(); for (let k = 0; k < 6; k++) { g.moveTo(x + k * 5, y); g.lineTo(x + k * 5 - 3, y + 9 - Math.abs(k - 2.5) * 2); } g.stroke(); }
    g.restore();
    // graticule
    g.strokeStyle = "rgba(58,42,26,.26)"; g.lineWidth = 1.6; g.setLineDash([10, 6]);
    for (let lo = -210; lo <= -90; lo += 10) { g.beginPath(); for (let la = 40; la <= 82; la += 1) { const p = PC(lo, la); la === 40 ? g.moveTo(...p) : g.lineTo(...p); } g.stroke(); }
    for (let la = 45; la <= 80; la += 5) { g.beginPath(); for (let lo = -215; lo <= -85; lo += 2) { const p = PC(lo, la); lo === -215 ? g.moveTo(...p) : g.lineTo(...p); } g.stroke(); }
    g.setLineDash([]);
    g.font = font(22, 400, true); g.fillStyle = "rgba(58,42,26,.7)";
    for (let la = 50; la <= 75; la += 5) { const p = PC(-127, la); g.fillText(la + "°", p[0] + 6, p[1] - 6); }
    // frame with degree ticks
    g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 2; g.strokeRect(44, 44, w - 88, h - 88);
    for (let x = 44; x < w - 44; x += 40) { g.fillStyle = (x / 40) % 2 ? INK : PAR; g.fillRect(x, 30, 40, 10); g.fillRect(x, h - 40, 40, 10); }
    // compass rose
    const [cx, cy] = C(-31.5, 18.2);
    g.save(); g.translate(cx, cy); g.scale(0.62, 0.62);
    for (const [rr, lw] of [[120, 3], [108, 1.5], [70, 1.2]]) { g.beginPath(); g.arc(0, 0, rr, 0, 7); g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); }
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8, L = i % 4 === 0 ? 150 : i % 2 === 0 ? 96 : 66, wd = i % 4 === 0 ? 20 : 12;
      g.save(); g.rotate(a);
      g.beginPath(); g.moveTo(0, -L); g.lineTo(wd, 0); g.lineTo(0, 0); g.closePath(); g.fillStyle = i % 4 === 0 ? COP : INK; g.fill();
      g.beginPath(); g.moveTo(0, -L); g.lineTo(-wd, 0); g.lineTo(0, 0); g.closePath(); g.fillStyle = PAR; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
      g.restore();
    }
    g.font = font(40); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("U", 0, -178); g.fillText("S", 0, 178); g.fillText("T", 178, 0); g.fillText("B", -178, 0);
    g.restore();
    // cartouche
    const [kx, ky] = C(4.5, 18.6);
    g.save(); g.translate(kx, ky);
    g.fillStyle = "rgba(240,227,196,.94)"; g.fillRect(-330, -70, 660, 140);
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(-330, -70, 660, 140); g.lineWidth = 1.5; g.strokeRect(-318, -58, 636, 116);
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 330, 0, 26, 0, 7); g.fillStyle = COP; g.fill(); g.stroke(); }
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = font(46); g.letterSpacing = "6px"; g.fillText("PETA PASIFIK UTARA", 0, -16);
    g.font = font(28, 400, true); g.letterSpacing = "3px"; g.fillText("Amerika Rusia dan sekitarnya, tahun 1867", 0, 32);
    g.restore();
  });
  const sheetGeo = new THREE.PlaneGeometry(W, H, 64, 40);
  { const p = sheetGeo.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (W / 2), v = p.getY(i) / (H / 2); p.setZ(i, 0.9 * (u ** 6 + v ** 6) + 0.12 * Math.sin(u * 5 + v * 3) * Math.cos(v * 4)); } sheetGeo.computeVertexNormals(); }
  const sheet = new THREE.Group(); scene.add(sheet);
  const layer = (mat, i) => { const m = new THREE.Mesh(sheetGeo, mat); m.rotation.x = -Math.PI / 2; m.position.y = 0.012 * i; m.renderOrder = i; m.receiveShadow = true; sheet.add(m); return m; };
  layer(new THREE.MeshStandardMaterial({ map: baseT, roughness: 0.93 }), 0).castShadow = true;
  const ov = (extra, i) => new THREE.MeshStandardMaterial({ roughness: 0.9, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -i, polygonOffsetUnits: -4 * i, ...extra });

  // Alaska wash: mask and blotchy watercolor
  const maskT = canvasTex(1024, 620, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); ringPath(g, 0.5, "United States of America"); g.fillStyle = "#fff"; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke(); });
  const washT = canvasTex(512, 310, (g, w, h) => { g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 140; i++) { const x = q() * w, y = q() * h, rr = 8 + q() * 50, v = 180 + q() * 75 | 0; const s = g.createRadialGradient(x, y, 0, x, y, rr); s.addColorStop(0, `rgba(${v},${v},${v},.7)`); s.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = s; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } });
  const fillM = ov({ color: COP, map: washT, alphaMap: maskT, opacity: 0 }, 1);
  layer(fillM, 1);
  // navy wash sweeps west to east at the handover
  const sweepM = ov({ color: NAVY, map: washT, alphaMap: maskT, opacity: 0 }, 2);
  const sweepAlpha = canvasTex(1024, 620, () => {});
  sweepM.alphaMap = sweepAlpha;
  const sweepMesh = layer(sweepM, 2);

  // ink layer: coastlines draw on, then labels
  const ink = dyn(CW, CH);
  layer(ov({ map: ink.tx }, 3), 3);
  let inkKey = "";
  const drawInk = (p, la, nm) => {
    const k = `${Math.round(p * 400)}|${Math.round(la * 24)}|${nm}`;
    if (k === inkKey) return; inkKey = k;
    const g = ink.g; g.clearRect(0, 0, CW, CH);
    g.strokeStyle = INK; g.lineWidth = 3.2; g.lineJoin = g.lineCap = "round";
    g.beginPath();
    for (const s of strokes) {
      const lim = s.L * p; g.moveTo(s[0][0], s[0][1]);
      for (let i = 1; i < s.length; i++) {
        if (s.len[i] <= lim) g.lineTo(s[i][0], s[i][1]);
        else { const a = (lim - s.len[i - 1]) / (s.len[i] - s.len[i - 1]); if (a > 0) g.lineTo(s[i - 1][0] + (s[i][0] - s[i - 1][0]) * a, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * a); break; }
      }
    }
    g.stroke();
    if (la > 0) {
      g.globalAlpha = la;
      label(g, "KEKAISARAN RUSIA", -186, 67.6, 40, { sp: 12, rot: -0.12 });
      label(g, nm ? "ALASKA · AMERIKA SERIKAT" : "AMERIKA RUSIA", -153, 65.2, nm ? 40 : 50, { sp: 12, col: nm ? NAVY : "#2F3F25" });
      label(g, "AMERIKA UTARA", -121, 62.4, 34, { sp: 9 });
      label(g, "BRITANIA", -121, 60.8, 34, { sp: 9 });
      label(g, "Laut Bering", -178, 58.2, 38, { sp: 6, it: true, w: 400 });
      label(g, "Samudra Pasifik", -152, 51.6, 44, { sp: 10, it: true, w: 400 });
      label(g, "Teluk Alaska", -144, 57.6, 32, { sp: 5, it: true, w: 400 });
      label(g, "Samudra Arktik", -158, 73.6, 38, { sp: 8, it: true, w: 400 });
      label(g, "Selat Bering", -170.5, 64.4, 24, { sp: 3, it: true, w: 400, rot: -1.2 });
      const [sx, sy] = PC(-135.33, 57.05);
      g.beginPath(); g.arc(sx, sy, 9, 0, 7); g.fillStyle = RED; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      g.font = font(28, 700, true); g.fillStyle = INK; g.textAlign = "left"; g.letterSpacing = "1px"; g.fillText("Sitka", sx + 16, sy + 34);
      g.globalAlpha = 1;
    }
    ink.tx.needsUpdate = true;
  };

  // annotation layer: threat arrow from British Canada, sale arrow to the United States
  const ann = dyn(CW, CH);
  const annM = ov({ map: ann.tx, opacity: 0 }, 4);
  layer(annM, 4);
  let annKey = "";
  const curve = (a, b, c, n = 60) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * b[0] + u * u * c[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * b[1] + u * u * c[1]]); } return o; };
  const threat = curve(PC(-121, 57.5), PC(-128, 66), PC(-146, 64.6));
  const saleArc = curve(PC(-148, 61.4), PC(-128, 53), PC(-121, 47.6));
  const arrow = (g, pl, f, col, lw, txt, tp) => {
    if (f <= 0) return;
    const n = Math.max(2, Math.round(pl.length * f));
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = g.lineJoin = "round"; g.setLineDash([]);
    g.beginPath(); for (let i = 0; i < n; i++) i ? g.lineTo(...pl[i]) : g.moveTo(...pl[i]); g.stroke();
    const a = pl[n - 1], b = pl[n - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
    g.fillStyle = col; g.beginPath(); g.moveTo(a[0] + Math.cos(ang) * lw * 2.4, a[1] + Math.sin(ang) * lw * 2.4);
    g.lineTo(a[0] + Math.cos(ang + 2.4) * lw * 3, a[1] + Math.sin(ang + 2.4) * lw * 3); g.lineTo(a[0] + Math.cos(ang - 2.4) * lw * 3, a[1] + Math.sin(ang - 2.4) * lw * 3); g.fill();
    if (f > 0.5) { g.globalAlpha = clamp01((f - 0.5) * 3); g.font = font(44); g.letterSpacing = "6px"; g.textAlign = "center"; g.lineWidth = 10; g.strokeStyle = "rgba(240,227,196,.95)"; g.strokeText(txt, tp[0], tp[1]); g.fillStyle = col; g.fillText(txt, tp[0], tp[1]); g.globalAlpha = 1; }
  };
  const drawAnn = (f1, f2, pulse) => {
    const k = `${Math.round(f1 * 60)}|${Math.round(f2 * 60)}|${Math.round(pulse * 10)}`;
    if (k === annKey) return; annKey = k;
    const g = ann.g; g.clearRect(0, 0, CW, CH);
    if (pulse > 0) { g.save(); ringPath(g, 1, "United States of America"); g.setLineDash([18, 12]); g.lineWidth = 7; g.strokeStyle = `rgba(142,42,30,${0.25 + 0.6 * pulse})`; g.stroke(); g.restore(); }
    arrow(g, threat, f1, RED, 16, "INGGRIS", PC(-119.5, 55.6));
    arrow(g, saleArc, f2, COP, 16, "DIJUAL KE AS", PC(-127, 50.6));
    ann.tx.needsUpdate = true;
  };

  // ---------- coins ----------
  const coinFace = (txt, sub) => canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w * 0.4, w * 0.38, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, "#F4D98A"); gr.addColorStop(1, "#9C7424");
    g.fillStyle = gr; g.fillRect(0, 0, w, w); g.strokeStyle = "#5A3E10"; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, w / 2, 112, 0, 7); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(w / 2, w / 2, 98, 0, 7); g.stroke();
    g.fillStyle = "#4A320C"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = font(110); g.fillText(txt, w / 2, w / 2 - 12); g.font = font(30); g.letterSpacing = "4px"; g.fillText(sub, w / 2, w / 2 + 62);
  });
  const goldM = std(0xc9a24a, 0.28, 0.95);
  const faceM = new THREE.MeshStandardMaterial({ map: coinFace("2", "SEN"), metalness: 0.7, roughness: 0.32 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.34, 48), [goldM, faceM, faceM]);
  coin.castShadow = true; scene.add(coin);
  const coinL = new THREE.PointLight(0xffc870, 0, 26, 1.6); scene.add(coinL);
  const AK = P(-152, 64.4);

  // ---------- otters + Sitka outpost ----------
  const otterT = canvasTex(256, 256, (g) => {
    g.fillStyle = "rgba(58,42,26,.35)"; g.beginPath(); g.ellipse(128, 196, 110, 18, 0, 0, 7); g.fill();
    g.fillStyle = "#6B4A2E"; g.strokeStyle = INK; g.lineWidth = 6;
    g.beginPath(); g.ellipse(124, 160, 92, 36, -0.08, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(214, 128, 34, 30, 0, 0, 7); g.fillStyle = "#8A6544"; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(36, 160); g.quadraticCurveTo(6, 140, 14, 120); g.lineTo(40, 150); g.fillStyle = "#6B4A2E"; g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(224, 120, 5, 0, 7); g.fill(); g.beginPath(); g.arc(244, 132, 6, 0, 7); g.fill();
    g.lineWidth = 2; for (const d of [-6, 0, 6]) { g.beginPath(); g.moveTo(240, 138 + d * 0.4); g.lineTo(256, 132 + d); g.stroke(); }
    g.lineWidth = 7; g.beginPath(); g.moveTo(150, 132); g.lineTo(170, 104); g.moveTo(178, 136); g.lineTo(190, 106); g.stroke();
    g.fillStyle = "#BFA27A"; g.beginPath(); g.ellipse(176, 108, 20, 12, 0.3, 0, 7); g.fill(); g.lineWidth = 3; g.stroke();
  });
  const otterM = new THREE.MeshStandardMaterial({ map: otterT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 });
  const chainLat = (lo) => (lo < -178 ? 51.4 : lo < -170 ? 51.6 + (lo + 178) * 0.06 : lo < -162 ? 52.2 + (lo + 170) * 0.26 : 54.3 + (lo + 162) * 0.3);
  const otters = [];
  const otterSpots = [];
  for (let i = 0; i < 30; i++) { const lo = -186 + i * 1.0 + (rnd() - 0.5) * 0.6; otterSpots.push([lo, chainLat(lo) - 1.0 - rnd() * 1.4]); }
  for (const s of [[-156, 55.2], [-153.6, 56.2], [-151.5, 56.9], [-149.2, 58.4], [-147, 59.1], [-144.2, 59.3], [-141.5, 59.4], [-158.5, 54.7], [-155, 54.2], [-150, 55.8]]) otterSpots.push(s);
  otterSpots.forEach(([lo, la], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), otterM);
    const [x, z] = P(lo, la); m.position.set(x, 0, z); m.castShadow = true; scene.add(m);
    otters.push({ m, x, z, ph: rnd() * 6, die: i % 10 === 3 ? 1e9 : rnd() });
  });
  const [SX, SZ] = P(-135.33, 57.05);
  const cabins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.42, 0.42), std(0x5c3b20, 0.85), 116);
  const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.42, 0.32, 4), std(0x3a2414, 0.9), 116);
  const dmy = new THREE.Object3D();
  const cabinXZ = [];
  for (let i = 0; i < 116; i++) { const a = rnd() * 6.28, rr = 1.6 + Math.sqrt(rnd()) * 3.4; cabinXZ.push([SX - 1.2 + Math.cos(a) * rr * 1.2, SZ - 1.6 + Math.sin(a) * rr * 0.7, rnd() * 3]); }
  const outpost = new THREE.Group(); scene.add(outpost);
  outpost.add(cabins, roofs); cabins.castShadow = roofs.castShadow = true;
  // stockade house of the company on a rise
  const fort = new THREE.Group(); fort.position.set(SX - 3.2, 0, SZ - 3.4); outpost.add(fort);
  box(3.4, 1.6, 2.2, std(0x6b4526, 0.85), 0, 0.8, 0, fort);
  const fr = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), std(0x3a2414, 0.9)); fr.rotation.y = Math.PI / 4; fr.scale.set(1.05, 1, 0.68); fr.position.y = 2.1; fort.add(fr);
  const bales = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.45, 0.5), std(0x7a5634, 1), 14);
  for (let i = 0; i < 14; i++) { dmy.position.set(SX + 2.4 + (i % 4) * 0.74, 0.25 + Math.floor(i / 4) * 0.46, SZ + 1.7); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(1); dmy.updateMatrix(); bales.setMatrixAt(i, dmy.matrix); }
  bales.castShadow = true; outpost.add(bales);

  // flagpole + flags + soldiers
  const PH = 8.2;
  const pole = cyl(0.09, 0.13, PH, 10, std(0xd9c8a8, 0.6), SX, PH / 2, SZ, scene);
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), goldM); fin.position.set(SX, PH + 0.15, SZ); scene.add(fin);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, PH, 4), std(0x6b5a3a, 0.9)); rope.position.set(SX + 0.16, PH / 2, SZ); scene.add(rope);
  const ruT = canvasTex(512, 340, (g, w, h) => {
    g.fillStyle = "#F2EAD8"; g.fillRect(0, 0, w, h / 3); g.fillStyle = "#2B4A86"; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = "#A8322A"; g.fillRect(0, (2 * h) / 3, w, h / 3);
    g.save(); g.translate(150, 112); g.fillStyle = GOLD; g.strokeStyle = INK; g.lineWidth = 4;
    g.beginPath(); g.moveTo(-90, -40); g.quadraticCurveTo(-60, 30, -10, 46); g.lineTo(10, 46); g.quadraticCurveTo(60, 30, 90, -40); g.quadraticCurveTo(40, -6, 0, -10); g.quadraticCurveTo(-40, -6, -90, -40); g.fill(); g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 22, -42, 15, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(s * 34, -44); g.lineTo(s * 50, -38); g.lineTo(s * 34, -34); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(0, 6, 22, 34, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-18, -82); g.lineTo(0, -66); g.lineTo(18, -82); g.lineTo(10, -60); g.lineTo(-10, -60); g.closePath(); g.fill(); g.stroke();
    g.restore();
  });
  const usT = canvasTex(512, 340, (g, w, h) => {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#F2EAD8" : "#A8322A"; g.fillRect(0, (i * h) / 13, w, h / 13 + 1); }
    g.fillStyle = "#24365E"; g.fillRect(0, 0, w * 0.42, (h * 7) / 13);
    g.fillStyle = "#F2EAD8"; let n = 0;
    for (let rI = 0; rI < 6 && n < 37; rI++) for (let c = 0; c < (rI % 2 ? 6 : 7) && n < 37; c++, n++) { g.beginPath(); g.arc(18 + c * 29 + (rI % 2 ? 14 : 0), 18 + rI * 30, 6, 0, 7); g.fill(); }
  });
  const flagGeo = () => new THREE.PlaneGeometry(3.0, 2.0, 14, 8);
  const mkFlag = (tx) => { const gr = new THREE.Group(); const m = new THREE.Mesh(flagGeo(), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.85 })); m.position.x = 1.6; m.castShadow = true; gr.add(m); gr.position.set(SX, 0, SZ); scene.add(gr); return { gr, m, base: m.geometry.attributes.position.array.slice() }; };
  const ruF = mkFlag(ruT), usF = mkFlag(usT);
  const waveFlag = (F, t, amp) => { const p = F.m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = F.base[i * 3] + 1.5; p.array[i * 3 + 2] = Math.sin(t * 4.2 - x * 2.1 + F.base[i * 3 + 1] * 0.6) * 0.22 * x * amp; } p.needsUpdate = true; F.m.geometry.computeVertexNormals(); };
  const soldierT = (pull) => canvasTex(256, 512, (g) => {
    g.fillStyle = "#1E150D"; g.strokeStyle = "#1E150D"; g.lineCap = "round";
    g.beginPath(); g.arc(128, 104, 30, 0, 7); g.fill();
    g.beginPath(); g.moveTo(96, 86); g.lineTo(100, 50); g.lineTo(156, 50); g.lineTo(160, 86); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(92, 86); g.lineTo(176, 86); g.lineTo(176, 94); g.lineTo(92, 92); g.fill();
    g.beginPath(); g.moveTo(92, 140); g.quadraticCurveTo(128, 126, 164, 140); g.lineTo(172, 320); g.lineTo(84, 320); g.closePath(); g.fill();
    g.fillRect(96, 316, 26, 166); g.fillRect(134, 316, 26, 166); g.fillRect(90, 470, 36, 18); g.fillRect(130, 470, 40, 18);
    g.lineWidth = 22;
    if (pull) { g.beginPath(); g.moveTo(102, 150); g.lineTo(124, 20); g.moveTo(154, 150); g.lineTo(132, 40); g.stroke(); }
    else { g.beginPath(); g.moveTo(92, 150); g.lineTo(84, 290); g.moveTo(164, 150); g.lineTo(172, 290); g.stroke(); g.lineWidth = 9; g.beginPath(); g.moveTo(176, 40); g.lineTo(166, 310); g.stroke(); }
    g.fillStyle = "#B0643A"; g.fillRect(100, 200, 56, 10);
  });
  const solStand = new THREE.MeshStandardMaterial({ map: soldierT(false), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
  const solPull = new THREE.MeshStandardMaterial({ map: soldierT(true), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
  const soldiers = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.7), solStand); m.castShadow = true; scene.add(m); return { m, hx: SX - 1.3 - i * 1.25, hz: SZ + 1.6 + i * 0.5 }; });

  // ---------- treaty, quill, watch, candle ----------
  const TR = { x: 55, z: 3, w: 20, h: 26 };
  const trBase = document.createElement("canvas"); trBase.width = 1024; trBase.height = 1332;
  {
    const g = trBase.getContext("2d"), w = 1024, h = 1332;
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#F3E6C8"); gr.addColorStop(1, "#DCC69A"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(21); for (let i = 0; i < 40; i++) { const x = q() * w, y = q() * h, rr = 40 + q() * 120, s = g.createRadialGradient(x, y, 0, x, y, rr); s.addColorStop(0, "rgba(150,104,52,.07)"); s.addColorStop(1, "rgba(150,104,52,0)"); g.fillStyle = s; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(36, 36, w - 72, h - 72); g.lineWidth = 1.5; g.strokeRect(52, 52, w - 104, h - 104);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.font = font(78); g.letterSpacing = "16px"; g.fillText("PERJANJIAN", w / 2, 170);
    g.font = font(32, 400, true); g.letterSpacing = "1px"; g.fillText("tentang penyerahan Amerika Rusia", w / 2, 222); g.fillText("kepada Amerika Serikat", w / 2, 262);
    g.strokeStyle = COP; g.lineWidth = 3; g.beginPath(); g.moveTo(300, 300); g.lineTo(724, 300); g.stroke(); g.beginPath(); g.arc(w / 2, 300, 9, 0, 7); g.fillStyle = COP; g.fill();
    const para = (head, txt, y) => {
      g.textAlign = "left"; g.fillStyle = INK; g.font = font(36); g.letterSpacing = "4px"; g.fillText(head, 110, y); y += 52;
      g.font = font(31, 400); g.letterSpacing = "0px"; const words = txt.split(" "); let line = "";
      for (const wd of words) { const tst = line ? line + " " + wd : wd; if (g.measureText(tst).width > 800) { g.fillText(line, 110, y); y += 44; line = wd; } else line = tst; }
      g.fillText(line, 110, y); return y + 66;
    };
    let y = 372;
    y = para("PASAL I", "Sri Baginda Kaisar Seluruh Rusia menyerahkan kepada Amerika Serikat seluruh wilayah dan hak kedaulatan yang dimilikinya di benua Amerika, beserta pulau-pulau di sekitarnya.", y);
    y = para("PASAL VI", "Sebagai imbalan, Amerika Serikat membayar tujuh juta dua ratus ribu dolar dalam emas.", y);
    g.font = font(30, 400, true); g.fillText("Dibuat di Washington, 30 Maret 1867, pukul 04.00 pagi.", 110, y);
    g.font = font(24); g.letterSpacing = "3px"; g.textAlign = "center";
    g.fillText("UNTUK AMERIKA SERIKAT", 300, 1150); g.fillText("UNTUK KEKAISARAN RUSIA", 740, 1150);
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(120, 1112); g.lineTo(480, 1112); g.moveTo(560, 1112); g.lineTo(920, 1112); g.stroke();
    g.font = font(20, 400, true); g.letterSpacing = "1px"; g.fillStyle = "rgba(58,42,26,.7)"; g.fillText("ilustrasi: teks disusun ulang, bukan naskah asli", w / 2, 1252);
  }
  const tr = dyn(1024, 1332);
  const sigs = [{ txt: "W. H. Seward", x: 130, y: 1100 }, { txt: "Ed. de Stoeckl", x: 576, y: 1100 }];
  { const g = tr.g; g.font = font(64, 400, true); for (const s of sigs) s.w = Math.min(340, g.measureText(s.txt).width); }
  let trKey = "";
  const drawTreaty = (f1, f2, seal) => {
    const k = `${Math.round(f1 * 80)}|${Math.round(f2 * 80)}|${seal > 0 ? 1 : 0}`;
    if (k === trKey) return; trKey = k;
    const g = tr.g; g.drawImage(trBase, 0, 0);
    [f1, f2].forEach((f, i) => { if (f <= 0) return; const s = sigs[i]; g.save(); g.beginPath(); g.rect(s.x - 10, s.y - 90, s.w * f + 12, 130); g.clip(); g.font = font(64, 400, true); g.fillStyle = "#24170C"; g.textAlign = "left"; g.letterSpacing = "0px"; g.fillText(s.txt, s.x, s.y); g.restore(); });
    tr.tx.needsUpdate = true;
  };
  const trG = new THREE.Group(); trG.position.set(TR.x, 0.08, TR.z); trG.rotation.y = 0.07; scene.add(trG);
  const trM = new THREE.Mesh(new THREE.PlaneGeometry(TR.w, TR.h), new THREE.MeshStandardMaterial({ map: tr.tx, roughness: 0.9 }));
  trM.rotation.x = -Math.PI / 2; trM.receiveShadow = true; trG.add(trM);
  const trLocal = (cx, cy) => trG.localToWorld(new THREE.Vector3((cx / 1024) * TR.w - TR.w / 2, 0, (cy / 1332) * TR.h - TR.h / 2));
  const seal = cyl(1.25, 1.3, 0.32, 28, std(0x8e1f18, 0.45, 0.1), 0, 0.16, 0, trG);
  seal.position.set(((520 / 1024) * TR.w) - TR.w / 2, 0.16, ((1210 / 1332) * TR.h) - TR.h / 2);
  const quill = new THREE.Group(); scene.add(quill);
  const qInner = new THREE.Group(); qInner.rotation.set(-0.5, 0, -0.45); quill.add(qInner);
  cyl(0.05, 0.11, 8.5, 8, std(0xefe6d2, 0.5), 0, 4.25, 0, qInner);
  const featherT = canvasTex(128, 512, (g, w, h) => { g.fillStyle = "#F4ECDC"; g.beginPath(); g.moveTo(w / 2, 0); g.quadraticCurveTo(w, h * 0.3, w * 0.7, h); g.lineTo(w * 0.3, h); g.quadraticCurveTo(0, h * 0.3, w / 2, 0); g.fill(); g.strokeStyle = "rgba(90,70,40,.5)"; g.lineWidth = 1.5; for (let y = 20; y < h; y += 9) { g.beginPath(); g.moveTo(w / 2, y); g.lineTo(6 + (y / h) * 30, y - 26); g.moveTo(w / 2, y); g.lineTo(w - 6 - (y / h) * 30, y - 26); g.stroke(); } g.strokeStyle = "#B8A880"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); });
  const feather = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 6.4), new THREE.MeshStandardMaterial({ map: featherT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 }));
  feather.position.y = 6.6; feather.castShadow = true; qInner.add(feather);
  const inkwell = new THREE.Group(); inkwell.position.set(47.5, 0, 14); scene.add(inkwell);
  cyl(1.5, 1.8, 2.2, 20, std(0x0d0a12, 0.08, 0.3, { transparent: true, opacity: 0.92 }), 0, 1.1, 0, inkwell);
  cyl(0.8, 1.0, 0.6, 16, goldM, 0, 2.4, 0, inkwell);
  // pocket watch: hands sweep through the night to four o'clock
  const watch = new THREE.Group(); watch.position.set(68.5, 0.25, -7); watch.rotation.y = -0.2; scene.add(watch);
  const faceT = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#F4EBD6"; g.beginPath(); g.arc(w / 2, w / 2, 250, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, w / 2, 214, 0, 7); g.stroke();
    const R = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = font(44);
    R.forEach((s, i) => { const a = (i * Math.PI) / 6 - Math.PI / 2; g.fillText(s, w / 2 + Math.cos(a) * 176, w / 2 + Math.sin(a) * 176); });
    for (let i = 0; i < 60; i++) { const a = (i * Math.PI) / 30; g.lineWidth = i % 5 ? 2 : 5; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 214, w / 2 + Math.sin(a) * 214); g.lineTo(w / 2 + Math.cos(a) * (i % 5 ? 204 : 196), w / 2 + Math.sin(a) * (i % 5 ? 204 : 196)); g.stroke(); }
  });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.4 })); dial.rotation.x = -Math.PI / 2; dial.position.y = 0.36; watch.add(dial);
  cyl(3.8, 3.8, 0.6, 48, goldM, 0, 0.05, 0, watch).receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.28, 12, 48), goldM); rim.rotation.x = Math.PI / 2; rim.position.y = 0.4; watch.add(rim);
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 8, 20), goldM); crown.position.set(0, 0.3, -4.4); crown.rotation.x = Math.PI / 2; watch.add(crown);
  const handM = std(0x1b120a, 0.5, 0.4);
  const mkHand = (len, wd) => { const g = new THREE.Group(); g.position.y = 0.42; const m = box(wd, 0.06, len, handM, 0, 0, -len / 2 + 0.3, g); m.castShadow = false; watch.add(g); return g; };
  const hourH = mkHand(1.9, 0.2), minH = mkHand(2.8, 0.12);

  const flames = [];
  const candle = (x, z, hgt) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(1.6, 2.0, 0.4, 24, goldM, 0, 0.2, 0, g);
    cyl(0.75, 0.8, hgt, 18, std(0xefe2c4, 0.7, 0, { emissive: 0x6a3a10, emissiveIntensity: 0.15 }), 0, 0.4 + hgt / 2, 0, g);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb050).multiplyScalar(3.2) }));
    fl.scale.set(1, 2.3, 1); fl.position.y = 0.4 + hgt + 0.7; g.add(fl);
    const L = new THREE.PointLight(0xffa04a, 380, 70, 1.6); L.position.set(0, 0.4 + hgt + 1.4, 0); g.add(L);
    flames.push({ fl, L, ph: rnd() * 6 });
  };
  candle(44, -15, 6.5); candle(83, -24, 7.5); candle(-44, -18, 6); candle(-26, -30, 8);

  // ---------- balance ----------
  const BAL = { x: 61, z: -27 };
  const brass = std(0xb08a3e, 0.3, 0.9);
  const bal = new THREE.Group(); bal.position.set(BAL.x, 0, BAL.z); scene.add(bal);
  cyl(3.4, 3.8, 0.9, 32, brass, 0, 0.45, 0, bal); cyl(0.38, 0.5, 16, 16, brass, 0, 8.4, 0, bal);
  const fin2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), brass); fin2.position.y = 17.3; bal.add(fin2);
  const beam = new THREE.Group(); beam.position.y = 16.5; bal.add(beam);
  box(22, 0.45, 0.45, brass, 0, 0, 0, beam);
  const pointer = box(0.18, 3.2, 0.18, brass, 0, -1.6, 0.3, beam);
  const mkPan = () => {
    const p = new THREE.Group(); bal.add(p);
    cyl(3.6, 3.0, 0.45, 32, brass, 0, 0, 0, p);
    for (let i = 0; i < 3; i++) { const a = (i * Math.PI * 2) / 3, top = new THREE.Vector3(0, 7, 0), bot = new THREE.Vector3(Math.cos(a) * 3.3, 0.2, Math.sin(a) * 3.3); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, top.distanceTo(bot), 4), brass); m.position.copy(top).add(bot).multiplyScalar(0.5); m.lookAt(bot); m.rotateX(Math.PI / 2); p.add(m); }
    return p;
  };
  const panL = mkPan(), panR = mkPan();
  // Alaska as a copper tile cut from the mainland outline
  const mainland = GEO.find((c) => c.name === "United States of America").rings.reduce((a, b) => (b.length > a.length ? b : a));
  const mp = mainland.map(([lo, la]) => P(lo, la));
  const xs = mp.map((p) => p[0]), zs = mp.map((p) => p[1]);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2, mz = (Math.min(...zs) + Math.max(...zs)) / 2, ms = 7.4 / (Math.max(...xs) - Math.min(...xs));
  const shp = new THREE.Shape(mp.map(([x, z]) => new THREE.Vector2((x - mx) * ms, -(z - mz) * ms)));
  const tileM = std(0xb0643a, 0.55, 0.35);
  const tile = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.55, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 1 }), tileM);
  tile.rotation.x = -Math.PI / 2; tile.position.y = 0.3; tile.castShadow = true; panL.add(tile);
  const NC = 72;
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.72, 0.72, 0.21, 24), goldM, NC);
  coins.castShadow = true; panR.add(coins);
  const coinSpot = []; for (let i = 0; i < NC; i++) { const s = i % 6, lvl = Math.floor(i / 6), a = (s * Math.PI) / 3 + 0.3; coinSpot.push([s === 5 ? 0 : Math.cos(a) * 1.6, 0.34 + lvl * 0.22, s === 5 ? 0 : Math.sin(a) * 1.6, rnd()]); }

  // ---------- Senate tokens + gavel ----------
  const VT = { x: 88, z: -12 };
  const tokNv = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.15, 1.15, 0.3, 28), std(0x1f3550, 0.4, 0.3), 37);
  const tokRd = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.15, 1.15, 0.3, 28), std(0x8e2a1e, 0.4, 0.3), 2);
  tokNv.castShadow = tokRd.castShadow = true; scene.add(tokNv, tokRd);
  const plinth = box(9, 0.5, 4, std(0x2a1a10, 0.6), VT.x + 2.6, 0, VT.z, scene);
  const plT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#E9D9B6"; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = font(44); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SETUJU", 140, h / 2); g.fillStyle = RED; g.fillText("MENOLAK", 384, h / 2); });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), new THREE.MeshStandardMaterial({ map: plT, roughness: 0.8 })); plate.rotation.x = -Math.PI / 2; plate.position.set(VT.x + 2.6, 0.27, VT.z + 3.4); scene.add(plate);
  const gav = new THREE.Group(); gav.position.set(VT.x + 11, 0, VT.z + 4); scene.add(gav);
  cyl(1.8, 2.0, 0.7, 28, std(0x4a2c18, 0.5), 0, 0.35, 0, gav);
  const gHinge = new THREE.Group(); gHinge.position.set(5.5, 1.5, 0); gav.add(gHinge);
  const gArm = new THREE.Group(); gHinge.add(gArm);
  const handle = cyl(0.22, 0.26, 6, 12, std(0x5a3520, 0.45), -3, 0, 0, gArm); handle.rotation.z = Math.PI / 2;
  const head = cyl(0.75, 0.75, 2.6, 18, std(0x4a2c18, 0.4), -5.6, 0, 0, gArm); head.rotation.x = Math.PI / 2;

  // ---------- newspapers ----------
  const NW = { x: 106, z: 4 };
  const paper = (mast, headline, kind, seed) => canvasTex(512, 700, (g, w, h) => {
    g.fillStyle = "#E6DAC0"; g.fillRect(0, 0, w, h);
    const q = mulberry(seed);
    g.fillStyle = INK; g.textAlign = "center"; g.font = font(46); g.letterSpacing = "3px"; g.fillText(mast, w / 2, 70);
    g.fillRect(24, 88, w - 48, 4); g.fillRect(24, 96, w - 48, 1.5);
    g.font = font(16, 400, true); g.letterSpacing = "1px"; g.fillText("Edisi April 1867", w / 2, 116);
    g.font = font(kind === "folly" ? 58 : 40); g.letterSpacing = "0px";
    headline.split("\n").forEach((l, i) => g.fillText(l, w / 2, 176 + i * (kind === "folly" ? 62 : 46)));
    const top = kind === "folly" ? 330 : 280;
    if (kind === "folly") {
      // cartoon: a block of ice with a tiny flag, marked with the purchase price
      g.save(); g.translate(w / 2, 470); g.strokeStyle = INK; g.lineWidth = 4; g.fillStyle = "#D7E0E0";
      g.beginPath(); g.moveTo(-110, -40); g.lineTo(0, -90); g.lineTo(110, -40); g.lineTo(110, 70); g.lineTo(0, 120); g.lineTo(-110, 70); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-110, -40); g.lineTo(0, 10); g.lineTo(110, -40); g.moveTo(0, 10); g.lineTo(0, 120); g.stroke();
      g.lineWidth = 1.5; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(-100 + i * 8, -30 + i * 4); g.lineTo(-100 + i * 8, 60 + i * 4); g.stroke(); }
      g.lineWidth = 3; g.beginPath(); g.moveTo(0, -90); g.lineTo(0, -150); g.stroke(); g.fillStyle = "#A8322A"; g.fillRect(0, -150, 40, 26);
      g.fillStyle = INK; g.font = font(30, 400, true); g.fillText("“Kulkas Es Seward”", 0, 168); g.restore();
    } else {
      for (let c = 0; c < 3; c++) for (let y = top; y < h - 30; y += 15) { if (q() < 0.06) continue; g.fillStyle = "rgba(58,42,26,.42)"; g.fillRect(30 + c * 156, y, 136 * (0.6 + q() * 0.4), 6); }
      const col = kind === "ya" ? GRN : kind === "netral" ? "#6E6253" : RED;
      const txt = kind === "ya" ? "MENDUKUNG" : kind === "netral" ? "NETRAL" : "MENGEJEK";
      g.save(); g.translate(w / 2, 470); g.rotate(-0.22); g.strokeStyle = col; g.lineWidth = 9; g.strokeRect(-200, -58, 400, 116); g.lineWidth = 3; g.strokeRect(-188, -46, 376, 92);
      g.fillStyle = col; g.font = font(64); g.letterSpacing = "4px"; g.textBaseline = "middle"; g.fillText(txt, 0, 4); g.restore();
    }
  });
  const papers = [];
  const kinds = [["WARTA TIMUR", "PEMBELIAN\nALASKA", "ya"], ["KABAR UNION", "WILAYAH BARU\nDI UTARA", "ya"], ["HARIAN PELABUHAN", "SOAL ALASKA", "netral"], ["SURAT KABAR BARAT", "PERJANJIAN\nDISETUJUI", "ya"], ["WARTA NEGERI", "ALASKA &\nPERDAGANGAN", "ya"], ["KORAN PAGI", "TANAH ES?", "ejek"], ["HARIAN SELATAN", "BERITA\nWASHINGTON", "netral"], ["SUARA KOTA", "PELABUHAN\nPASIFIK", "ya"], ["WARTA PANTAI", "ALASKA\nDIBELI", "ya"], ["KABAR DAGANG", "BULU & IKAN", "netral"], ["HARIAN UTARA", "SEWARD &\nRUSIA", "ya"], ["SURAT PAGI", "SENAT\nBERSIDANG", "netral"], ["WARTA KOTA", "PINTU KE\nPASIFIK", "ya"], ["KABAR SORE", "LAUT BERING", "netral"]];
  kinds.forEach(([m, hl, kd], i) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 13.7), new THREE.MeshStandardMaterial({ map: paper(m, hl, kd, 50 + i), roughness: 0.92 }));
    mesh.rotation.set(-Math.PI / 2, 0, 0); const a = (i - 3.5) * 0.17;
    const back_ = i >= 8, j = back_ ? i - 8 : i, a2 = back_ ? (j - 2.5) * 0.12 : a;
    const g = new THREE.Group(); g.position.set(back_ ? NW.x + (j - 2.5) * 5.6 : NW.x + (i - 3.5) * 4.6, back_ ? 0.02 + j * 0.01 : 0.2 + i * 0.02, back_ ? NW.z - 10 + Math.abs(j - 2.5) * 0.8 : NW.z + Math.abs(i - 3.5) * 1.1 - 1); g.rotation.y = -a2; g.add(mesh); mesh.receiveShadow = true; scene.add(g); papers.push(g);
  });
  const folly = new THREE.Group(); folly.position.set(NW.x - 6.5, 0.4, NW.z + 1); scene.add(folly);
  const fFront = new THREE.Mesh(new THREE.PlaneGeometry(13, 17.8), new THREE.MeshStandardMaterial({ map: paper("WARTA HARIAN", "SEWARD'S\nFOLLY!", "folly", 9), roughness: 0.92 }));
  fFront.rotation.x = -Math.PI / 2; fFront.position.x = 6.5; fFront.castShadow = true; folly.add(fFront);
  const fBack = new THREE.Mesh(new THREE.PlaneGeometry(13, 17.8), std(0xd8ccb0, 0.95)); fBack.rotation.x = Math.PI / 2; fBack.position.set(6.5, -0.01, 0); folly.add(fBack);

  // ---------- calendars ----------
  const pageT = (n, cap) => canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = "#F3E7CC"; g.fillRect(0, 0, w, h); g.fillStyle = cap === "JULIAN" ? COP : NAVY; g.fillRect(0, 0, w, 62);
    g.fillStyle = "#FFF4DE"; g.font = font(26); g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = "2px"; g.fillText("OKTOBER 1867", w / 2, 32);
    g.fillStyle = INK; g.letterSpacing = "0px"; g.font = font(170); g.fillText(String(n), w / 2, 180);
    g.font = font(22); g.letterSpacing = "4px"; g.fillStyle = cap === "JULIAN" ? COP : NAVY; g.fillText(cap, w / 2, 290);
    g.strokeStyle = "rgba(58,42,26,.3)"; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
  });
  const CAL = { x: -55, z: -4 };
  const mkCal = (x, cap, nums) => {
    const g = new THREE.Group(); g.position.set(x, 0, CAL.z); scene.add(g);
    const board = new THREE.Group(); board.rotation.x = -0.28; g.add(board);
    box(7.6, 9.8, 0.5, std(0x3b2414, 0.7), 0, 4.9, -0.3, board);
    box(8.4, 0.6, 0.9, brass, 0, 9.7, 0.1, board);
    const pages = nums.map((n, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 9.4, 0.05 + (nums.length - i) * 0.012); board.add(hinge); const m = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 8.6), new THREE.MeshStandardMaterial({ map: pageT(n, cap), roughness: 0.9, side: THREE.DoubleSide })); m.position.y = -4.4; m.castShadow = true; hinge.add(m); return hinge; });
    return { g, pages };
  };
  const julian = mkCal(CAL.x - 4.8, "JULIAN", [6]);
  const greg = mkCal(CAL.x + 4.8, "GREGORIAN", [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);

  // ---------- star 1959 ----------
  const st = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? 1.9 : 4.4; i ? st.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : st.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 0.7, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 2 }), std(0xd9b04e, 0.25, 0.95, { emissive: 0x5a3a08, emissiveIntensity: 0.25 }));
  star.castShadow = true; scene.add(star);
  const starL = new THREE.PointLight(0xffd080, 0, 50, 1.5); scene.add(starL);

  // ---------- atmosphere ----------
  const dust = pts(scene, 380, { color: 0xffcf8a, size: 0.32, opacity: 0.7 });
  const dSeed = []; for (let i = 0; i < 380; i++) dSeed.push([rnd() - 0.5, rnd(), rnd() - 0.5, rnd() * 6.28, 0.2 + rnd() * 0.5]);

  // ---------- timing ----------
  const coinDrop = A("s1:Sekitar") - 0.35, sale = A("s3:dijual"), sign1 = A("s4:William"), sign2 = A("s4:Eduard"), sealT = A("s4:perjanjian");
  const price = A("s4:Harganya"), pDone = A("s4:dolar") + 0.4, votes0 = A("s5:Senat"), vote37 = A("s5:37"), vote2 = A("s5:dua"), gavelT = A("s5:menyetujui");
  const flip = A("s5:penelusuran"), lower = A("s6:diturunkan"), snag = A("s6:tersangkut"), try2 = A("s6:dan"), try3 = A("s6:ketiga"), ok3 = A("s6:berhasil"), down = A("s6:menurunkannya");
  const jul = A("s7:Julian"), gap = A("s7:dua"), gre = A("s7:Gregorian"), y59 = A("s7:1959");
  const camT = track([
    [0, -2, 40, 36, 0, 0, -3.5],
    [A("s1:kilometer"), 0, 62, 54, 0, 0, -2.5],
    [A("s1:Sekitar"), 1, 50, 44, 0.5, 0, -3],
    [K.s1e, 3, 44, 40, 2, 0, -1],
    [K.s2 + 1.4, SX - 1, 26, SZ + 26, SX - 2, 0, SZ - 1],
    [A("s2:berang-berang"), -4, 30, 40, -9, 0, 9],
    [A("s2:habis") + 0.5, -16, 28, 38, -17, 0, 9],
    [K.s2e, -6, 54, 52, -5, 0, 3],
    [K.s3 + 1, 4, 80, 66, 4, 0, -1],
    [A("s3:Inggris"), 12, 74, 64, 10, 0, -1],
    [sale, 14, 82, 72, 12, 0, 2],
    [K.s3e - 0.2, 32, 70, 66, 34, 0, 1],
    [K.s4 + 1.4, 58, 46, 40, 60, 0, -2],
    [A("s4:Jam"), 66, 26, 18, 67, 0, -6],
    [sign1, 51, 26, 30, 52, 0, 7],
    [sealT, 57, 28, 32, 57, 0, 7],
    [price, 60, 25, 50, 61, 8.5, -27],
    [K.s4e, 63, 25, 47, 61, 9, -27],
    [K.s5 + 1, 86, 26, 18, 91, 2, -11],
    [vote2 + 0.3, 93, 23, 16, 92, 3, -11],
    [A("s5:Ada") + 0.6, 104, 40, 38, 106, 0, 4],
    [flip, 108, 38, 36, 107, 0, 5],
    [K.s5e, 105, 44, 42, 105, 0, 4],
    [K.s6 + 0.9, SX + 8, 7, SZ + 18, SX - 0.4, 3.4, SZ + 0.6],
    [snag, SX + 6, 5.5, SZ + 15.5, SX - 0.3, 3.2, SZ + 0.8],
    [ok3, SX + 4, 5, SZ + 15, SX - 0.5, 2.8, SZ + 0.8],
    [down + 0.7, SX + 2, 30, SZ + 34, SX - 9, 0, SZ - 5],
    [K.s7 + 1.0, CAL.x - 1, 19, CAL.z + 46, CAL.x, 4.5, CAL.z],
    [gre, CAL.x + 3, 17, CAL.z + 42, CAL.x + 1.5, 4.5, CAL.z],
    [A("s7:Tahun"), -18, 46, 46, -8, 0, -3],
    [y59 + 0.8, -2, 46, 42, 0, 0, -4],
    [K.s7e, 0, 52, 46, 0, 0, -3],
    [K.s8 + 1.5, 6, 78, 66, 6, 0, -2],
    [K.end, 16, 112, 94, 18, 0, -4],
    [K.dur, 18, 118, 100, 18, 0, -4],
  ]);
  const tgt = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    const shake = 0.35 * Math.exp(-Math.max(0, t - gavelT - 0.18) * 6) * (t > gavelT + 0.18 ? 1 : 0) + 0.4 * Math.exp(-Math.max(0, t - y59 - 0.45) * 6) * (t > y59 + 0.45 ? 1 : 0);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.8 + Math.sin(t * 53) * shake, c[1] + Math.sin(t * 0.29) * 0.5 + Math.sin(t * 61) * shake, c[2] + Math.cos(t * 0.31) * 0.6);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 34, 70, tgt.z + 30); key.target.position.copy(tgt);

    // map ink
    drawInk(clamp01(0.3 + 0.7 * eout(t / 3.3)), ramp(t, 2.2, 3.6), t > ok3 + 1.0 ? 1 : 0);
    // Alaska wash: copper, then imperial green, a red pulse under threat, navy after the handover
    const fc = COL.cop.clone().lerp(COL.grn, ramp(t, A("s2:Rusia"), A("s2:Alaska") + 0.4));
    const pulse = ramp(t, A("s3:Inggris"), A("s3:Inggris") + 0.5) * (1 - ramp(t, sale - 0.4, sale + 0.4));
    fc.lerp(COL.red, 0.35 * pulse * (0.6 + 0.4 * Math.sin(t * 7)));
    fillM.color.copy(fc); fillM.opacity = 0.62 * ramp(t, 0.8, 2.6);
    const sw = clamp01((t - ok3 - 0.1) / 1.4);
    if (sw > 0 && sw < 1.01) {
      const g = sweepAlpha.image.getContext("2d"), w = 1024, h = 620; g.drawImage(maskT.image, 0, 0);
      g.globalCompositeOperation = "destination-in"; const x = (-0.1 + 1.25 * sw) * w; const gr = g.createLinearGradient(x - 120, 0, x + 40, 0); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over";
      g.fillStyle = "#000"; g.globalCompositeOperation = "destination-over"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over";
      sweepAlpha.needsUpdate = true;
    }
    sweepM.opacity = t > ok3 + 0.1 ? 0.78 : 0;
    tileM.color.copy(t > ok3 + 0.1 ? fc.clone().lerp(COL.navy, sw) : fc);

    // annotations (act 3)
    drawAnn(ramp(t, A("s3:Inggris") - 0.2, A("s3:merebutnya")), ramp(t, sale - 0.1, A("s3:Amerika") + 0.4), ramp(t, A("s3:Kanada"), A("s3:Kanada") + 0.4) * (1 - ramp(t, sale, sale + 0.6)));
    annM.opacity = ramp(t, K.s3, K.s3 + 0.4) * (1 - ramp(t, K.s4 + 0.6, K.s4 + 1.6));

    // the two-cent coin: drops on Alaska in the hook, rises again at the end
    const cd = clamp01((t - coinDrop) / 0.42);
    let cy = 22 * (1 - cd * cd) + 0.2;
    if (cd >= 1) cy = 0.2 + Math.abs(Math.sin((t - coinDrop - 0.42) * 12)) * 1.4 * Math.exp(-(t - coinDrop - 0.42) * 6);
    const cOut = ramp(t, K.s2 + 0.2, K.s2 + 0.9), cBack = ramp(t, A("s8:Dua") - 0.3, A("s8:Dua") + 0.6);
    coin.visible = t > coinDrop - 0.05 && (cOut < 1 || cBack > 0);
    const lift = cBack * (5 + Math.sin(t * 1.4) * 0.4);
    coin.position.set(AK[0] + 0.5 - 8 * cBack, cBack > 0 ? 0.2 + lift : cy - cOut * 3, AK[1] + 1);
    coin.rotation.set(cBack > 0 ? 0.9 * cBack : 0.08, t * (cBack > 0 ? 0.9 : 0.15), 0);
    coin.scale.setScalar(Math.max(0.001, (1 - cOut) + cBack * 1.6));
    coinL.position.set(coin.position.x + 2, coin.position.y + 4, coin.position.z + 3); coinL.intensity = 40 * (cd >= 1 ? 1 - cOut : 0) + 60 * cBack;

    // otters appear with the fur trade, then go one by one
    const oIn0 = A("s2:Rusia"), oDie0 = A("s2:berang-berang") + 0.4, oDie1 = A("s2:habis") + 0.5;
    for (const o of otters) {
      const app = back((t - oIn0 - o.ph * 0.18) / 0.5);
      const dieT = oDie0 + o.die * (oDie1 - oDie0), dd = clamp01((t - dieT) / 0.35);
      const gone = ramp(t, K.s3 + 0.5, K.s3 + 1.4);
      const s = Math.max(0.001, app * (1 - dd) * (1 - gone));
      o.m.scale.setScalar(s); o.m.visible = s > 0.002;
      o.m.position.set(o.x, 1.3 * s + Math.sin(t * 1.6 + o.ph) * 0.08 - dd * 0.6, o.z);
      o.m.rotation.set(0, Math.atan2(cam.position.x - o.x, cam.position.z - o.z), Math.sin(t * 1.3 + o.ph) * 0.08);
    }
    // Sitka grows with the outpost
    const og = ramp(t, A("s2:bulu") - 1.2, A("s2:bulu") + 0.4);
    cabinXZ.forEach(([x, z, rr], i) => {
      const s = Math.max(0.001, clamp01(og * 1.6 - (i / 116) * 0.6));
      dmy.position.set(x, 0.21 * s, z); dmy.rotation.set(0, rr, 0); dmy.scale.setScalar(s); dmy.updateMatrix(); cabins.setMatrixAt(i, dmy.matrix);
      dmy.position.y = 0.42 * s + 0.16 * s; dmy.rotation.set(0, rr + Math.PI / 4, 0); dmy.updateMatrix(); roofs.setMatrixAt(i, dmy.matrix);
    });
    cabins.instanceMatrix.needsUpdate = roofs.instanceMatrix.needsUpdate = true;
    fort.scale.setScalar(Math.max(0.001, og)); bales.scale.setScalar(Math.max(0.001, og));
    const poleS = Math.max(0.001, og);
    pole.scale.set(1, poleS, 1); pole.position.y = (PH / 2) * poleS; rope.scale.set(1, poleS, 1); rope.position.y = (PH / 2) * poleS; fin.position.y = (PH + 0.15) * poleS;

    // flag: lowered, snags, two tries fail, the third brings it down; the new flag goes up
    let fy = PH - 1.1;
    const lowerA = ramp(t, lower, snag);
    fy -= 2.3 * lowerA;
    const jerk = (t0, t1) => (t > t0 && t < t1 ? Math.abs(Math.sin((t - t0) * 9)) * 0.35 * Math.exp(-(t - t0) * 1.2) : 0);
    fy -= jerk(snag, try2) + jerk(try2, try3);
    fy -= 4.6 * ramp(t, ok3 - 0.2, down + 0.5);
    const ruGone = ramp(t, down + 0.5, down + 1.0);
    ruF.gr.position.y = fy * poleS; ruF.gr.scale.set(Math.max(0.001, og), Math.max(0.001, og * (1 - ruGone)), 1);
    waveFlag(ruF, t, t > snag && t < ok3 ? 0.35 : 1);
    const usUp = ramp(t, down + 0.9, K.s7 + 1.6);
    usF.gr.visible = usUp > 0; usF.gr.position.y = 0.8 + (PH - 1.9) * usUp; usF.gr.scale.setScalar(Math.max(0.001, usUp > 0 ? 1 : 0));
    waveFlag(usF, t + 1.3, 1);
    const fyaw = Math.atan2(cam.position.x - SX, cam.position.z - SZ) - 0.35;
    ruF.gr.rotation.y = usF.gr.rotation.y = fyaw;
    // soldiers: visible for the ceremony, each one takes a turn at the rope
    const solIn = ramp(t, K.s6 - 0.2, K.s6 + 0.8) * (1 - ramp(t, K.s7, K.s7 + 0.6));
    const turns = [[snag - 0.2, try2], [try2, try3], [try3, down + 0.4]];
    soldiers.forEach((s, i) => {
      const [a, b] = turns[i], on = t > a && t < b, step = ramp(t, a, a + 0.3) * (1 - ramp(t, b, b + 0.35));
      s.m.material = on ? solPull : solStand;
      const x = s.hx + (SX - 0.15 - s.hx) * step * 0.82, z = s.hz + (SZ + 0.6 - s.hz) * step * 0.82;
      const sc = Math.max(0.001, solIn);
      s.m.scale.setScalar(sc);
      s.m.position.set(x, 1.35 * sc + (on ? Math.abs(Math.sin(t * 9)) * 0.08 : 0), z);
      s.m.rotation.set(0, Math.atan2(cam.position.x - x, cam.position.z - z), on ? Math.sin(t * 9) * 0.05 : 0);
    });

    // treaty: quill signs both lines; the seal drops on "perjanjian"
    const f1 = ramp(t, sign1 - 0.1, sign2 - 0.25), f2 = ramp(t, sign2, sealT - 0.1);
    drawTreaty(f1, f2, t > sealT ? 1 : 0);
    const active = t < sign2 ? 0 : 1, f = active ? f2 : f1, s = sigs[active];
    const wig = Math.sin(t * 34) * 18 * (f > 0 && f < 1 ? 1 : 0);
    const tip = trLocal(s.x + s.w * f, s.y - 12 + wig);
    const rest = new THREE.Vector3(47.5, 3.4, 14);
    const qa = ramp(t, sign1 - 0.8, sign1 - 0.1) * (1 - ramp(t, sealT + 0.1, sealT + 0.8));
    quill.position.copy(rest).lerp(tip.add(new THREE.Vector3(0, (f > 0 && f < 1 ? 0 : 0.6), 0)), qa);
    quill.rotation.y = 0.3 + Math.sin(t * 2) * 0.05;
    const sl = clamp01((t - sealT) / 0.3);
    seal.visible = sl > 0; seal.position.y = 0.16 + 6 * (1 - sl) * (1 - sl); seal.scale.setScalar(sl > 0 ? 1 + 0.25 * Math.exp(-(t - sealT - 0.3) * 8) * (sl >= 1 ? 1 : 0) : 0.001);
    // watch: a night of negotiation runs from 23.00 to 04.00
    const nh = 23 + 5 * eout(ramp(t, K.s4 - 0.5, A("s4:Jam") + 0.2));
    minH.rotation.y = -(nh % 1) * Math.PI * 2; hourH.rotation.y = -((nh % 12) / 12) * Math.PI * 2;

    // candles flicker
    for (const fl of flames) { const k = 1 + Math.sin(t * 13 + fl.ph) * 0.07 + Math.sin(t * 29.3 + fl.ph * 2) * 0.05; fl.L.intensity = 380 * k; fl.fl.scale.set(1, 2.3 * k, 1); fl.fl.rotation.z = Math.sin(t * 5 + fl.ph) * 0.08; }

    // balance: Alaska outweighs an empty pan, then 72 coins fall in and the beam levels
    const nIn = clamp01((t - price - 0.2) / (pDone - price - 0.2)) * NC;
    for (let i = 0; i < NC; i++) {
      const [x, y, z] = coinSpot[i]; const ti = price + 0.2 + (i / NC) * (pDone - price - 0.2), dc = clamp01((t - ti) / 0.28);
      dmy.position.set(x, y + 7 * (1 - dc * dc), z); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(t > ti ? 1 : 0.001); dmy.updateMatrix(); coins.setMatrixAt(i, dmy.matrix);
    }
    coins.instanceMatrix.needsUpdate = true;
    const tilt = 0.2 * (1 - nIn / NC) + Math.sin(t * 2.2) * 0.012 * (1 - nIn / NC);
    beam.rotation.z = tilt;
    for (const [pan, sx] of [[panL, -10.6], [panR, 10.6]]) pan.position.set(sx * Math.cos(tilt), 16.5 + sx * Math.sin(tilt) - 7.2, 0);
    pointer.rotation.z = 0;

    // Senate: 37 navy tokens stack while the count is read, then 2 red ones
    for (let i = 0; i < 37; i++) { const ti = votes0 + 0.3 + (i / 37) * (vote37 + 0.6 - votes0 - 0.3), dc = clamp01((t - ti) / 0.22); dmy.position.set(VT.x, 0.4 + i * 0.31 + 6 * (1 - dc * dc), VT.z); dmy.rotation.set(0, i * 0.4, 0); dmy.scale.setScalar(t > ti ? 1 : 0.001); dmy.updateMatrix(); tokNv.setMatrixAt(i, dmy.matrix); }
    for (let i = 0; i < 2; i++) { const ti = vote2 + i * 0.18, dc = clamp01((t - ti) / 0.22); dmy.position.set(VT.x + 5.2, 0.4 + i * 0.31 + 6 * (1 - dc * dc), VT.z); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(t > ti ? 1 : 0.001); dmy.updateMatrix(); tokRd.setMatrixAt(i, dmy.matrix); }
    tokNv.instanceMatrix.needsUpdate = tokRd.instanceMatrix.needsUpdate = true;
    const gv = t < gavelT ? 0.7 * ramp(t, gavelT - 0.9, gavelT - 0.2) : 0.7 * (1 - clamp01((t - gavelT) / 0.18)) + 0.12 * Math.exp(-(t - gavelT - 0.18) * 7) * Math.abs(Math.sin((t - gavelT) * 20));
    gArm.rotation.z = -gv;

    // the mocking front page flips over to the papers underneath
    folly.rotation.z = Math.PI * eout(ramp(t, flip - 0.1, flip + 0.7)) * 0.985;
    folly.position.y = 0.4 + Math.sin(Math.PI * ramp(t, flip - 0.1, flip + 0.7)) * 2;

    // calendars: Julian shows 6, Gregorian flips twelve pages to 18; the Julian one tips back after the handover
    const cIn = ramp(t, K.s7 - 0.5, K.s7 + 0.6);
    julian.g.scale.setScalar(Math.max(0.001, cIn)); greg.g.scale.setScalar(Math.max(0.001, cIn));
    julian.g.rotation.x = -1.2 * ramp(t, gre + 0.2, gre + 0.9);
    greg.pages.forEach((pg, i) => { if (i === 12) return; const ti = gap + i * 0.1, u = clamp01((t - ti) / 0.22); pg.rotation.x = -Math.PI * 1.08 * eout(u); pg.visible = u < 0.85; });

    // statehood star stamps onto Alaska
    const sd = clamp01((t - y59) / 0.45);
    star.visible = t > y59 - 0.1;
    star.position.set(AK[0] + 0.5, 0.25 + 26 * (1 - sd) * (1 - sd), AK[1] + 1.5); star.rotation.set(-Math.PI / 2, 0, (1 - sd) * 2.5);
    star.scale.setScalar(1 + 0.18 * Math.exp(-Math.max(0, t - y59 - 0.45) * 7) * (sd >= 1 ? 1 : 0));
    starL.position.set(star.position.x, 6, star.position.z + 4); starL.intensity = sd >= 1 ? 90 * (0.6 + 0.4 * Math.exp(-(t - y59 - 0.45) * 2)) : 0;

    // dust in the candle light near whatever the lens looks at
    const d = dust.pos;
    for (let i = 0; i < 380; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 70 + Math.sin(t * q[4] + q[3]) * 1.5; d[i * 3 + 1] = 1 + ((q[1] * 34 + t * q[4] * 0.6) % 34); d[i * 3 + 2] = tgt.z + q[2] * 60 + 14 + Math.cos(t * q[4] + q[3]) * 1.5; }
    dust.commit();
    bp.strength = 0.3 + 0.25 * ramp(t, y59 + 0.4, y59 + 0.6) * (1 - ramp(t, y59 + 1, y59 + 2.5));
    comp.render();
  };
}
