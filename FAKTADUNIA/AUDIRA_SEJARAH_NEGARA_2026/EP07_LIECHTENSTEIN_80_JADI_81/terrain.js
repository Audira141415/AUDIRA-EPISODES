// EP07 terrain: pure height field, road and formations for the Alpine diorama. No three.js here, so node can print coordinates
// for camera planning: node -e "import('./terrain.js').then(m=>m.debug())"
export const X0 = -70, X1 = 112, Z0 = -78, Z1 = 46, NX = 304, NZ = 208;
export const CX = -8, CZ = -13, CH = 11;      // castle crag top
export const SQX = 6, SQZ = 9;                // town square
export const CPX = 78, CPZ = -38;             // camp on the pass (stylised Stilfser Joch)

const c01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const sm = (a, b, x) => { x = c01((x - a) / (b - a)); return x * x * (3 - 2 * x); };
export const nz = (x, z) => Math.sin(x * 0.13 + 1.3) * Math.cos(z * 0.11 - 0.7) + 0.5 * Math.sin(x * 0.31 + z * 0.23) + 0.25 * Math.sin(x * 0.71 - z * 0.53) + 0.12 * Math.sin(x * 1.37 + z * 1.11);
const g2 = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / s);
export const riverZ = (x) => 19.5 + 2.2 * Math.sin(x * 0.045 + 0.6);

function hRaw(x, z) {
  let h = sm(-11, -44, z) * (24 + 8 * nz(x * 0.6, z * 0.6));
  h += 26 * g2(x, z, 18, -62, 320) + 24 * g2(x, z, -36, -56, 260) + 18 * g2(x, z, -60, -30, 240);
  h += 30 * g2(x, z, 58, -60, 230) + 34 * g2(x, z, 100, -30, 280) + 16 * g2(x, z, 94, -4, 220);
  h += sm(28, 42, z) * (6 + 3 * nz(x, z));
  h += 0.45 * nz(x * 2.1, z * 2.1) * sm(-3, -16, z);
  const dr = Math.abs(z - riverZ(x));
  if (dr < 2.6) h -= 0.35 * sm(2.6, 1.4, dr);
  const dc = Math.hypot(x - CX, (z - CZ) * 1.1);
  h = Math.max(h, CH * sm(8.5, 5.4, dc));
  return h;
}
const HC = hRaw(CPX, CPZ);
function hCamp(x, z) {
  const d = Math.hypot(x - CPX, z - CPZ);
  return HC + (hRaw(x, z) - HC) * sm(7, 11, d);
}

// Road: Catmull-Rom through control points, resampled every 0.25 units, heights smoothed so it climbs steadily.
const CTRL = [[-18, 3], [-6, 3], [6, 3], [16, 3.2], [26, 3.5], [36, 2.6], [44, -0.5], [51, -5.5], [55, -10.5], [50, -14], [45, -17], [51, -20.5], [58, -23], [54, -27], [50, -30.5], [57, -33.5], [66, -35.5], [73, -37], [CPX, CPZ]];
export const STEP = 0.25;
export const ROAD = (() => {
  const dense = [];
  for (let i = 0; i < CTRL.length - 1; i++) {
    const p0 = CTRL[Math.max(0, i - 1)], p1 = CTRL[i], p2 = CTRL[i + 1], p3 = CTRL[Math.min(CTRL.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const u = k / 40, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(CTRL[CTRL.length - 1]);
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const L = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let s = 0; s <= L; s += STEP) {
    while (cum[j + 1] < s) j++;
    const u = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
    out.push({ x: dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u, z: dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u, y: 0 });
  }
  let ys = out.map((p) => (p.x < 37 ? 0 : hCamp(p.x, p.z)));
  for (let pass = 0; pass < 5; pass++) {
    const w = 24;
    ys = ys.map((_, i) => { let s = 0, n = 0; for (let k = -w; k <= w; k++) { const q = ys[Math.min(ys.length - 1, Math.max(0, i + k))]; s += q; n++; } return s / n; });
  }
  ys[ys.length - 1] = HC;
  for (let i = 0; i < out.length; i++) {
    const tail = sm(out.length - 40, out.length - 1, i);
    out[i].y = Math.max(0, out[i].x < 34 ? 0 : ys[i] * (1 - tail) + HC * tail);
    if (i > 0) out[i].y = Math.max(out[i].y, out[i - 1].y);
  }
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 2)], b = out[Math.min(out.length - 1, i + 2)];
    const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    out[i].tx = (b.x - a.x) / l; out[i].tz = (b.z - a.z) / l;
  }
  out.L = L;
  return out;
})();
export const ROADLEN = ROAD.L;

export function roadAt(s, lat = 0) {
  const f = Math.min(ROAD.length - 1.001, Math.max(0, s / STEP));
  const i = Math.floor(f), u = f - i, a = ROAD[i], b = ROAD[i + 1];
  const x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u, tx = a.tx + (b.tx - a.tx) * u, tz = a.tz + (b.tz - a.tz) * u;
  return { x: x - tz * lat, z: z + tx * lat, y: a.y + (b.y - a.y) * u, tx, tz };
}

// Final height grid: raw relief, camp plateau, road bed cut in; roadD keeps distance to the road for painting.
export function buildGrid() {
  const H = new Float32Array(NX * NZ), RD = new Float32Array(NX * NZ).fill(99);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = X0 + (i * (X1 - X0)) / (NX - 1), z = Z0 + (j * (Z1 - Z0)) / (NZ - 1);
    let h = hCamp(x, z);
    if (x > -24 && x < 84 && z > -44 && z < 8) {
      let best = 1e9, by = 0;
      for (let k = 0; k < ROAD.length; k += 2) { const p = ROAD[k]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) { best = d; by = p.y; } }
      const d = Math.sqrt(best);
      RD[j * NX + i] = d;
      if (by > 0.01 || x > 30) h = by + (h - by) * sm(1.4, 3.6, d);
    }
    H[j * NX + i] = h;
  }
  return { H, RD };
}

export function sampler(arr) {
  return (x, z) => {
    const fi = Math.min(NX - 1.001, Math.max(0, ((x - X0) / (X1 - X0)) * (NX - 1)));
    const fj = Math.min(NZ - 1.001, Math.max(0, ((z - Z0) / (Z1 - Z0)) * (NZ - 1)));
    const i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j;
    const a = arr[j * NX + i], b = arr[j * NX + i + 1], c = arr[(j + 1) * NX + i], d = arr[(j + 1) * NX + i + 1];
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };
}

export function debug() {
  console.log("road length", ROADLEN.toFixed(1), "camp height", HC.toFixed(1));
  for (let s = 0; s <= ROADLEN; s += 10) { const p = roadAt(s); console.log("s", s, p.x.toFixed(1), p.y.toFixed(1), p.z.toFixed(1)); }
}
