// EP28 TACTICBOARD: the Cod Wars (Iceland vs the United Kingdom, 1958-1976) on a 3D naval tactics board.
// One bevelled board with a painted North Atlantic chart (azimuthal equidistant around Iceland, 1 unit = 10 km).
// Iceland is a raised relief tile in the centre; Greenland, the Faroes and northern Britain are darker tiles.
// Fishing-zone rings are painted into the sea surface by a shader that reads a distance field computed from the
// real coastline (Natural Earth 50m): 4 nm (1952), 12 nm (1958), 50 nm (1972), 200 nm (1975, median line vs
// Greenland / Faroes / Britain). Pieces are tactical tokens, never replicas:
//   Icelandic coast guard = small blue acrylic pucks with a red band and a Nordic-cross top,
//   Royal Navy = grey steel hull tokens, British trawlers = ochre hull tokens with a trawl wire and net.
//   s1 flash-forward: pucks face the grey line, scoreboard counts to 3-0, a net cutter glints
//   s2 Iceland, schools of silver cod, trawlers arrive from Britain ("sejak abad ke-14")
//   s3 close on the Reykjanes coast: the 4 nm band (1952), then 12 nm (1958); warships come
//   s4 Cod War I: 17 + 19 grey tokens against 6 pucks; scoreboard 1-0
//   s5 50 nm ring (1972); a puck drags its cutter across a trawl wire and the net drifts off; a ramming clash
//   s6 200 nm (1975); the Reykjavik-London link snaps; GIUK gap line, NATO plate, submarines and sonar
//   s7 June 1976: the British pieces retreat behind the 200 nm line; scoreboard 3-0; trawlers laid up in port
//   s8 wide pull-back: the whole board, the 200 nm zone as the world standard.
// Everything is a pure function of t.

const FONTS = ['700 80px "Barlow Condensed"', '600 80px "Barlow Condensed"', '500 80px "IBM Plex Mono"', '700 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "ISLANDIA 1976 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const HEAD = '"Barlow Condensed", "Arial Narrow", sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace';
const ISB = "#02529C", ISR = "#DC1E35", SEA = "#12314F", CHALK = "#F2F6FA", YEL = "#FFE27A", GOLD = "#FFC94A", CORAL = "#FF6B4A";

// ---------- projection: azimuthal equidistant around Iceland, x east, z south, 1 unit = 10 km ----------
const L0 = (-18.6 * Math.PI) / 180, P0 = (64.9 * Math.PI) / 180;
function proj(lon, lat) {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180;
  const c = Math.acos(Math.max(-1, Math.min(1, Math.sin(P0) * Math.sin(p) + Math.cos(P0) * Math.cos(p) * Math.cos(l - L0))));
  const k = c > 1e-9 ? c / Math.sin(c) : 1;
  const x = k * Math.cos(p) * Math.sin(l - L0), y = k * (Math.cos(P0) * Math.sin(p) - Math.sin(P0) * Math.cos(p) * Math.cos(l - L0));
  return [x * 637.1, -y * 637.1];
}
const X0 = -82, X1 = 100, Z0 = -64, Z1 = 80, BW = X1 - X0, BH = Z1 - Z0, RES = 0.125;
const GW = Math.round(BW / RES), GH = Math.round(BH / RES);
const NM = 0.1852; // units per nautical mile

// Sutherland-Hodgman clip of a ring to the board rectangle (plus a margin)
function clipRect(ring, x0, z0, x1, z1) {
  let out = ring;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= z0, (a, b) => [a[0] + (b[0] - a[0]) * (z0 - a[1]) / (b[1] - a[1]), z0]],
    [(p) => p[1] <= z1, (a, b) => [a[0] + (b[0] - a[0]) * (z1 - a[1]) / (b[1] - a[1]), z1]]];
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}
const LAND = { ice: [], other: [] };
for (const c of GEO) {
  for (const r of c.rings) {
    const P = r.map(([lo, la]) => proj(lo, la));
    const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]);
    if (Math.max(...xs) < X0 - 5 || Math.min(...xs) > X1 + 5 || Math.max(...zs) < Z0 - 5 || Math.min(...zs) > Z1 + 5) continue;
    if (c.name === "Iceland") LAND.ice.push(P);
    else if (c.name !== "Norway") LAND.other.push({ name: c.name, P }); // Jan Mayen left out of the median line (Iceland kept its full 200 nm there)
  }
}

// ---------- distance field (Felzenszwalb EDT) in nautical miles ----------
function edt(f, w, h) {
  const n = Math.max(w, h), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), g = new Float64Array(n);
  const one = (len) => {
    let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
    for (let q = 1; q < len; q++) {
      let s = ((g[q] + q * q) - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((g[q] + q * q) - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + g[v[k]]; }
  };
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) g[y] = f[y * w + x]; one(h); for (let y = 0; y < h; y++) f[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) g[x] = f[y * w + x]; one(w); for (let x = 0; x < w; x++) f[y * w + x] = Math.sqrt(d[x]) * RES / NM; }
  return f;
}
function maskOf(rings) {
  const c = document.createElement("canvas"); c.width = GW; c.height = GH;
  const g = c.getContext("2d"); g.fillStyle = "#fff";
  for (const r of rings) { g.beginPath(); r.forEach(([x, z], i) => { const px = (x - X0) / RES, py = (z - Z0) / RES; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); }
  const d = g.getImageData(0, 0, GW, GH).data, f = new Float32Array(GW * GH);
  for (let i = 0; i < GW * GH; i++) f[i] = d[i * 4] > 127 ? 0 : 1e20;
  return f;
}
const DI = edt(maskOf(LAND.ice), GW, GH);
const DO = edt(maskOf(LAND.other.map((o) => o.P)), GW, GH);
const dAt = (F, x, z) => { const i = Math.max(0, Math.min(GW - 1, Math.round((x - X0) / RES))), j = Math.max(0, Math.min(GH - 1, Math.round((z - Z0) / RES))); return F[j * GW + i]; };
// first point on a ray (from inland) that is `nm` nautical miles offshore
function seaPoint(x, z, dx, dz, nm) {
  const l = Math.hypot(dx, dz); dx /= l; dz /= l;
  for (let s = 0; s < 400; s += 0.02) { const px = x + dx * s, pz = z + dz * s; if (dAt(DI, px, pz) >= nm) return [px, pz]; }
  return [x, z];
}

// monotone Hermite through time keys [t, ...values], never overshoots
function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
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
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x070d16, exp: 1.0, bloom: [0.12, 0.35, 0.9], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 0.5; cam.far = 2400; cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#03070D"); gr.addColorStop(0.45, "#0A1626"); gr.addColorStop(1, "#122238"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- lights: clean studio key, cool fill, rim ----------
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a2230, 0.75));
  const key = new THREE.DirectionalLight(0xfff4e6, 2.3);
  key.position.set(-70, 150, 110); key.target.position.set(10, 0, 8);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -120, right: 120, top: 110, bottom: -110, near: 20, far: 450 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9cc4ff, 0.9); rim.position.set(90, 60, -140); scene.add(rim);

  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const txt = (s, font, color, align = "center", stroke) => (g, w, h) => {
    g.clearRect(0, 0, w, h); g.font = font(h); g.textAlign = align; g.textBaseline = "middle";
    const x = align === "center" ? w / 2 : align === "left" ? 6 : w - 6;
    if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = h * 0.16; g.strokeText(s, x, h * 0.55); }
    g.fillStyle = color; g.fillText(s, x, h * 0.55);
  };
  // flat (on the board) or standing text plate, world width w
  function plate(w, h, paint, x, y, z, flat = true, p = scene, cw = 1024) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: canvasTex(cw, Math.round((cw * h) / w), paint) }));
    if (flat) m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z); m.renderOrder = 5; p.add(m); return m;
  }
  const noiseTex = (seed, base, amp, n, rep) => canvasTex(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const q = mulberry(seed); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${amp * (0.4 + q() * 0.6)})`; g.fillRect(q() * w, q() * w, 1 + q() * 2.5, 1 + q() * 1.5); } }, rep);

  // ---------- room: dark table and a ring of soft bokeh lights ----------
  add(new THREE.PlaneGeometry(1600, 1600), std(0x0b111a, 0.9, 0, { map: noiseTex(3, "#1b2230", 0.08, 30000, [40, 40]) }), 0, -4.2, 0).rotation.x = -Math.PI / 2;
  const NB = 260, bok = pts(scene, NB, { size: 9, add: true, opacity: 0.85 });
  bok.m.fog = false;
  const bq = mulberry(77), bokB = [];
  for (let i = 0; i < NB; i++) {
    const a = bq() * Math.PI * 2, rr = 330 + bq() * 260;
    bokB.push([Math.cos(a) * rr, 10 + bq() ** 1.6 * 170, Math.sin(a) * rr - 60, bq() * 6.3, 0.4 + bq() * 1.2, bq() < 0.3 ? [1, 0.72, 0.42] : bq() < 0.6 ? [0.55, 0.75, 1] : [0.9, 0.93, 1]]);
  }

  // ---------- board: sea chart texture ----------
  const CW = 2048, CH = Math.round((CW * BH) / BW);
  const P2 = (x, z) => [((x - X0) / BW) * CW, ((z - Z0) / BH) * CH];
  const seaT = canvasTex(CW, CH, (g, w, h) => {
    const gr = g.createRadialGradient(...P2(0, 0), 60, ...P2(0, 0), w * 0.75);
    gr.addColorStop(0, "#1A4466"); gr.addColorStop(0.5, SEA); gr.addColorStop(1, "#0B2036");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(11);
    for (let i = 0; i < 90000; i++) { const v = q() < 0.5 ? "190,220,255" : "0,8,20"; g.fillStyle = `rgba(${v},${0.025 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1); }
    // graticule every 2 deg lat / 5 deg lon
    g.strokeStyle = "rgba(150,195,235,.16)"; g.lineWidth = 2;
    for (let la = 56; la <= 74; la += 2) { g.beginPath(); for (let lo = -50; lo <= 10; lo += 0.5) { const [x, z] = proj(lo, la), [px, py] = P2(x, z); lo === -50 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
    for (let lo = -50; lo <= 10; lo += 5) { g.beginPath(); for (let la = 54; la <= 76; la += 0.5) { const [x, z] = proj(lo, la), [px, py] = P2(x, z); la === 54 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
    // edge ruler: letters along the top and bottom, numbers on the sides
    g.font = `700 30px ${MONO}`; g.fillStyle = "rgba(200,225,250,.42)"; g.textAlign = "center"; g.textBaseline = "middle";
    "ABCDEFGHJK".split("").forEach((c, i) => { const px = ((i + 0.5) / 10) * w; g.fillText(c, px, 26); g.fillText(c, px, h - 26); });
    for (let i = 0; i < 8; i++) { const py = ((i + 0.5) / 8) * h; g.fillText(String(i + 1), 26, py); g.fillText(String(i + 1), w - 26, py); }
    g.strokeStyle = "rgba(200,225,250,.3)"; g.lineWidth = 3; g.strokeRect(50, 50, w - 100, h - 100);
    // compass rose (NW corner)
    const [cx, cy] = P2(-68, -50), R = 70;
    g.save(); g.translate(cx, cy); g.strokeStyle = "rgba(220,235,250,.5)"; g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.72, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, l = k % 2 ? R * 0.55 : R * 1.15; g.fillStyle = k === 0 ? "rgba(220,30,53,.85)" : "rgba(220,235,250,.55)"; g.beginPath(); g.moveTo(Math.sin(a) * l, -Math.cos(a) * l); g.lineTo(Math.sin(a + 0.35) * R * 0.18, -Math.cos(a + 0.35) * R * 0.18); g.lineTo(Math.sin(a - 0.35) * R * 0.18, -Math.cos(a - 0.35) * R * 0.18); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(230,240,250,.8)"; g.font = `700 34px ${HEAD}`; g.fillText("U", 0, -R * 1.45);
    g.restore();
    // scale bar (SW corner): 100 km
    const [sx, sy] = P2(-74, 72), L = (10 / BW) * w;
    g.fillStyle = "rgba(230,240,250,.75)"; g.fillRect(sx, sy, L / 2, 8); g.strokeStyle = "rgba(230,240,250,.75)"; g.lineWidth = 2; g.strokeRect(sx, sy, L, 8);
    g.font = `500 26px ${MONO}`; g.textAlign = "left"; g.fillText("0", sx - 4, sy - 18); g.fillText("100 KM", sx + L - 30, sy - 18);
    // faint printed coastline halo around every land mass
    g.strokeStyle = "rgba(160,205,240,.22)"; g.lineWidth = 7;
    for (const R2 of [...LAND.ice, ...LAND.other.map((o) => o.P)]) { g.beginPath(); R2.forEach(([x, z], i) => { const [px, py] = P2(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.stroke(); }
  });
  seaT.anisotropy = 16;
  const roughT = noiseTex(5, "#d0d0d0", 0.35, 60000, [6, 5]);

  // distance texture (half float, linear): r = nm to Iceland, g = nm to other land
  const half = new Uint16Array(GW * GH * 4), HONE = THREE.DataUtils.toHalfFloat(1);
  for (let i = 0; i < GW * GH; i++) { half[i * 4] = THREE.DataUtils.toHalfFloat(Math.min(DI[i], 60000)); half[i * 4 + 1] = THREE.DataUtils.toHalfFloat(Math.min(DO[i], 60000)); half[i * 4 + 3] = HONE; }
  const distT = new THREE.DataTexture(half, GW, GH, THREE.RGBAFormat, THREE.HalfFloatType);
  distT.minFilter = distT.magFilter = THREE.LinearFilter; distT.needsUpdate = true;

  const ZU = { uDist: { value: distT }, uR: { value: 0 }, uFill: { value: 0 }, uLine: { value: 1 }, uP4: { value: 0 }, uP12: { value: 0 }, uP50: { value: 0 }, uGlow: { value: 0 } };
  const seaM = std(0xffffff, 0.86, 0, { map: seaT, roughnessMap: roughT });
  seaM.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, ZU);
    sh.vertexShader = "varying vec3 vWP;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = `varying vec3 vWP;
uniform sampler2D uDist; uniform float uR, uFill, uLine, uP4, uP12, uP50, uGlow;
float zf(vec2 d, float r){ return max(d.r - r, (d.r - d.g) * 0.5); }
float dashRing(vec2 d, float r, float ang, float n){ float f = zf(d, r); float aa = max(fwidth(f), 1e-4); float l = 1.0 - smoothstep(aa * 0.7, aa * 1.9, abs(f)); return l * step(0.42, fract(ang * n / 6.2831853)); }
vec4 zone(){
  vec2 uv = vec2((vWP.x - (${X0.toFixed(1)})) / ${BW.toFixed(1)}, (vWP.z - (${Z0.toFixed(1)})) / ${BH.toFixed(1)});
  vec2 d = texture2D(uDist, uv).rg;
  float on = step(0.001, uR);
  float f = zf(d, uR);
  float aa = max(fwidth(f), 1e-4);
  float inside = (1.0 - smoothstep(-aa, aa, f)) * on * smoothstep(0.0, 0.6, d.r);
  float line = (1.0 - smoothstep(aa * 1.1, aa * 2.6, abs(f))) * on * step(0.05, d.r);
  float glow = exp(-abs(f) / max(aa * 9.0, uR * 0.04)) * on * uGlow;
  float ang = atan(vWP.z - 0.5, vWP.x + 1.5);
  float past = uP4 * dashRing(d, 4.0, ang, 260.0) + uP12 * dashRing(d, 12.0, ang, 200.0) + uP50 * dashRing(d, 50.0, ang, 150.0);
  return vec4(inside, line, past * step(0.05, d.r), glow);
}
` + sh.fragmentShader
      .replace("#include <map_fragment>", `#include <map_fragment>
vec4 ZN = zone();
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.20, 0.50, 0.72), ZN.x * 0.45 * uFill);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.70, 0.85, 0.96), clamp(ZN.z, 0.0, 1.0) * 0.7);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.97, 0.985, 1.0), ZN.y * uLine);`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(0.80, 0.92, 1.0) * (ZN.y * uLine * 0.5 + ZN.w * 0.35) + vec3(0.06, 0.22, 0.38) * ZN.x * uFill * 0.35;`);
  };
  const sea = add(new THREE.PlaneGeometry(BW, BH), seaM, (X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  sea.rotation.x = -Math.PI / 2; sea.castShadow = false;

  // bevelled frame (radius ~1 unit on a 180-unit board, kit ratio ~0.6 %) and base slab
  {
    const M = 7, rr = 4;
    const s = new THREE.Shape(), a0 = X0 - M, a1 = X1 + M, b0 = -(Z1 + M), b1 = -(Z0 - M);
    s.moveTo(a0 + rr, b0); s.lineTo(a1 - rr, b0); s.quadraticCurveTo(a1, b0, a1, b0 + rr); s.lineTo(a1, b1 - rr); s.quadraticCurveTo(a1, b1, a1 - rr, b1);
    s.lineTo(a0 + rr, b1); s.quadraticCurveTo(a0, b1, a0, b1 - rr); s.lineTo(a0, b0 + rr); s.quadraticCurveTo(a0, b0, a0 + rr, b0);
    const hole = new THREE.Path(); hole.moveTo(X0 + 0.4, -(Z1 - 0.4)); hole.lineTo(X0 + 0.4, -(Z0 + 0.4)); hole.lineTo(X1 - 0.4, -(Z0 + 0.4)); hole.lineTo(X1 - 0.4, -(Z1 - 0.4)); hole.closePath();
    s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 1.0, bevelSegments: 5, curveSegments: 10 });
    geo.rotateX(-Math.PI / 2);
    const fr = add(geo, std(0x262c35, 0.5, 0.15, { map: noiseTex(8, "#8f949c", 0.18, 40000, [0.02, 0.02]) }), 0, -0.7, 0);
    fr.material.color.set(0x3a414c);
    add(new THREE.BoxGeometry(BW + 2 * M + 2, 3.2, BH + 2 * M + 2), std(0x151a21, 0.7), (X0 + X1) / 2, -2.4, (Z0 + Z1) / 2);
  }
  const RIMY = 1.6; // frame top

  // ---------- land tiles ----------
  function extrudeRing(P, depth, bev) {
    const s = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 4 });
    g.rotateX(-Math.PI / 2); g.translate(0, bev, 0); return g;
  }
  // Iceland: sage lowland with glaciers at their real positions, printed coastline
  const ix = LAND.ice[0].map((p) => p[0]), iz = LAND.ice[0].map((p) => p[1]);
  const IB = { x0: Math.min(...ix) - 1, x1: Math.max(...ix) + 1, z0: Math.min(...iz) - 1, z1: Math.max(...iz) + 1 };
  const iceT = canvasTex(1024, Math.round((1024 * (IB.z1 - IB.z0)) / (IB.x1 - IB.x0)), (g, w, h) => {
    const Q = (x, z) => [((x - IB.x0) / (IB.x1 - IB.x0)) * w, ((z - IB.z0) / (IB.z1 - IB.z0)) * h];
    g.fillStyle = "#C9D6CC"; g.fillRect(0, 0, w, h);
    const q = mulberry(21);
    for (let i = 0; i < 260; i++) { const [px, py] = Q(IB.x0 + q() * (IB.x1 - IB.x0), IB.z0 + q() * (IB.z1 - IB.z0)); const rr = 8 + q() * 30; const gr = g.createRadialGradient(px, py, 0, px, py, rr); gr.addColorStop(0, q() < 0.5 ? "rgba(150,170,150,.35)" : "rgba(225,232,226,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
    for (const [lo, la, km] of [[-16.75, 64.42, 52], [-20.1, 64.68, 24], [-18.85, 64.82, 19], [-19.1, 63.65, 17], [-19.6, 63.63, 9], [-23.75, 64.81, 6], [-22.3, 66.17, 8]]) {
      const [x, z] = proj(lo, la), [px, py] = Q(x, z), rr = (km / 10 / (IB.x1 - IB.x0)) * w;
      const gr = g.createRadialGradient(px, py, rr * 0.2, px, py, rr); gr.addColorStop(0, "rgba(255,255,255,.98)"); gr.addColorStop(0.75, "rgba(246,250,252,.9)"); gr.addColorStop(1, "rgba(246,250,252,0)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(px, py, rr * 1.15, rr * 0.8, 0.2, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 20000; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${0.03 + q() * 0.05})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1); }
    g.strokeStyle = "rgba(40,70,80,.55)"; g.lineWidth = 3;
    g.beginPath(); LAND.ice[0].forEach(([x, z], i) => { const [px, py] = Q(x, z); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.stroke();
  });
  iceT.repeat.set(1 / (IB.x1 - IB.x0), -1 / (IB.z1 - IB.z0)); iceT.offset.set(-IB.x0 / (IB.x1 - IB.x0), -IB.z0 / (IB.z1 - IB.z0) + 1);
  // ExtrudeGeometry top UVs are the shape coords (x, -z): u = x*rep.x + off.x ; v = (-z)*rep.y' ... flipY handled by repeat sign
  iceT.repeat.set(1 / (IB.x1 - IB.x0), 1 / (IB.z1 - IB.z0)); iceT.offset.set(-IB.x0 / (IB.x1 - IB.x0), IB.z1 / (IB.z1 - IB.z0));
  const ICEH = 1.3;
  const iceland = add(extrudeRing(LAND.ice[0], ICEH, 0.3), std(0xffffff, 0.62, 0, { map: iceT }), 0, 0, 0);
  const otherM = std(0x56636f, 0.7, 0.05, { map: noiseTex(14, "#c8ccd0", 0.25, 30000, [0.08, 0.08]) });
  for (const o of LAND.other) {
    const P = clipRect(o.P, X0 + 0.5, Z0 + 0.5, X1 - 0.5, Z1 - 0.5);
    if (P.length < 3) continue;
    let ar = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; ar += a[0] * b[1] - b[0] * a[1]; }
    if (Math.abs(ar) < 0.4) continue;
    add(extrudeRing(P, 0.8, 0.18), otherM, 0, 0, 0);
  }

  // board labels
  const lab = (s, w, h, x, z, col = "rgba(225,236,248,.82)", font = (hh) => `700 ${hh * 0.82}px ${HEAD}`, y = 0.06) => plate(w, h, txt(s, font, col), x, y, z, true, scene, Math.min(2048, Math.round(w * 40)));
  plate(30, 5.6, txt("ISLANDIA", (h) => `700 ${h * 0.86}px ${HEAD}`, "#173246"), 0.5, ICEH + 0.65, 1.5, true, scene, 1400).material.opacity = 0.82;
  lab("GREENLAND", 26, 4.4, -64, -50);
  lab("KEP. FAROE", 15, 3, 60, 37);
  lab("INGGRIS", 18, 4, 84, 52, "rgba(225,236,248,.85)");
  lab("SAMUDRA ATLANTIK", 34, 3.6, 18, 66, "rgba(170,205,235,.45)", (hh) => `600 ${hh * 0.8}px ${HEAD}`);
  lab("LAUT NORWEGIA", 26, 3.2, 62, -40, "rgba(170,205,235,.4)", (hh) => `600 ${hh * 0.8}px ${HEAD}`);
  // Reykjavik pin
  const [RKX, RKZ] = proj(-21.9, 64.14);
  const pin = new THREE.Group(); pin.position.set(RKX, ICEH + 0.55, RKZ); scene.add(pin);
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 24), std(0xffffff, 0.3), 0, 0.15, 0, pin);
  add(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 20), std(ISR, 0.3), 0, 0.2, 0, pin);
  const pinLab = plate(10, 1.9, txt("REYKJAVÍK", (h) => `700 ${h * 0.8}px ${HEAD}`, "#0E2A3C"), RKX - 1.2, ICEH + 0.68, RKZ - 1.6, true, scene, 700);

  // ---------- AUDIRA brass plaque on the south rim and the scoreboard on the north rim ----------
  const brassT = canvasTex(2048, 200, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E9C877"); gr.addColorStop(0.5, "#C99A45"); gr.addColorStop(1, "#A97C33"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(4); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,240,200" : "60,40,10"},${0.05 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 2 + q() * 30, 1); }
    g.strokeStyle = "rgba(70,45,10,.75)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.font = `700 104px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(255,240,205,.55)"; g.fillText("AUDIRA  ·  PAPAN TAKTIK ATLANTIK UTARA  ·  1958–1976", w / 2 + 2, h * 0.55 + 3);
    g.fillStyle = "#3B2709"; g.fillText("AUDIRA  ·  PAPAN TAKTIK ATLANTIK UTARA  ·  1958–1976", w / 2, h * 0.55);
  });
  const plq = add(new THREE.BoxGeometry(56, 0.5, 5.4), [std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9), std(0xffffff, 0.34, 0.85, { map: brassT }), std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9), std(0xc99a45, 0.35, 0.9)], 9, RIMY + 0.15, Z1 + 3.6);

  const SB = { x: 9, y: 7.5, z: Z0 - 3.2, w: 46, h: 14.4 };
  const sbG = new THREE.Group(); sbG.position.set(SB.x, 0, SB.z); scene.add(sbG);
  for (const sx of [-0.36, 0.36]) add(new THREE.CylinderGeometry(0.9, 1.1, SB.y, 20), std(0x2a313b, 0.4, 0.6), sx * SB.w, SB.y / 2 - 0.5, -0.5, sbG);
  add(new THREE.BoxGeometry(SB.w + 2.4, SB.h + 2.4, 2.6), std(0x1d232c, 0.45, 0.5), 0, SB.y + SB.h / 2 - 1, -1.0, sbG);
  let sbState = "";
  const sbCan = document.createElement("canvas"); sbCan.width = 1600; sbCan.height = 500;
  const sbTex = new THREE.CanvasTexture(sbCan); sbTex.colorSpace = THREE.SRGBColorSpace; sbTex.anisotropy = 8;
  function paintSB(a, b, label, flash) {
    const g = sbCan.getContext("2d"), w = sbCan.width, h = sbCan.height;
    g.fillStyle = "#0A1420"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#101E2E"; g.fillRect(0, 0, w, 96);
    g.font = `700 64px ${HEAD}`; g.textBaseline = "middle"; g.textAlign = "left"; g.fillStyle = GOLD; g.fillText("AUDIRA", 40, 50);
    g.textAlign = "right"; g.fillStyle = "#CFE0F2"; g.font = `600 52px ${HEAD}`; g.fillText("PAPAN SKOR · PERANG COD", w - 40, 50);
    // team blocks
    g.fillStyle = ISB; g.fillRect(40, 130, 470, 230); g.fillStyle = ISR; g.fillRect(40, 330, 470, 30);
    g.fillStyle = "#fff"; g.fillRect(40 + 70, 130, 26, 200); g.fillRect(40, 130 + 88, 470, 26);
    g.fillStyle = ISR; g.fillRect(40 + 77, 130, 12, 200); g.fillRect(40, 130 + 95, 470, 12);
    g.fillStyle = "rgba(2,40,90,.72)"; g.fillRect(150, 150, 350, 160);
    g.fillStyle = "#fff"; g.font = `700 104px ${HEAD}`; g.textAlign = "center"; g.fillText("ISLANDIA", 325, 236);
    g.fillStyle = "#6E7B88"; g.fillRect(w - 510, 130, 470, 230); g.fillStyle = "#4A5560"; g.fillRect(w - 510, 330, 470, 30);
    g.fillStyle = "#fff"; g.fillText("INGGRIS", w - 275, 236);
    // score
    g.fillStyle = flash ? "#2A3A20" : "#06101A"; g.fillRect(540, 120, 520, 250);
    g.font = `700 230px ${MONO}`; g.fillStyle = flash ? "#FFF1B0" : GOLD; g.fillText(`${a}–${b}`, w / 2, 252);
    g.font = `600 50px ${MONO}`; g.fillStyle = "#9FB6CC"; g.fillText(label, w / 2, 436);
    sbTex.needsUpdate = true;
  }
  const sbFace = add(new THREE.PlaneGeometry(SB.w, (SB.w * 500) / 1600), new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false }), 0, SB.y + SB.h / 2 - 1, 0.32, sbG);
  sbFace.castShadow = false;
  paintSB(0, 0, "", false);

  // ---------- pieces ----------
  function lathe(r, h, rc, seg = 48) {
    const p = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); p.push(new THREE.Vector2(r - rc + Math.cos(a) * rc, rc + Math.sin(a) * rc)); }
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); p.push(new THREE.Vector2(r - rc + Math.cos(a) * rc, h - rc + Math.sin(a) * rc)); }
    p.push(new THREE.Vector2(0, h));
    return new THREE.LatheGeometry(p, seg);
  }
  const crossT = canvasTex(256, 256, (g, w) => {
    g.fillStyle = ISB; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(w / 2, w / 2, w * 0.4, 0, Math.PI * 2); g.clip();
    g.fillStyle = "#fff"; g.fillRect(w * 0.3, 0, w * 0.17, w); g.fillRect(0, w * 0.415, w, w * 0.17);
    g.fillStyle = ISR; g.fillRect(w * 0.335, 0, w * 0.1, w); g.fillRect(0, w * 0.45, w, w * 0.1);
    g.restore();
    g.strokeStyle = "#fff"; g.lineWidth = w * 0.045; g.beginPath(); g.arc(w / 2, w / 2, w * 0.43, 0, Math.PI * 2); g.stroke();
  });
  const M = {
    isl: new THREE.MeshPhysicalMaterial({ color: ISB, roughness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
    red: new THREE.MeshPhysicalMaterial({ color: ISR, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    base: std(0xe9edf1, 0.4),
    steel: std(0x8d99a6, 0.34, 0.62),
    steelD: std(0x56616d, 0.42, 0.55),
    trawl: std(0xc77f2b, 0.58, 0.05),
    trawlD: std(0xefe6d6, 0.5),
    sub: std(0x2b3036, 0.32, 0.5),
    wire: std(0xcfd6dd, 0.3, 0.8),
    grey: std(0x7a7f86, 0.75, 0.0),
  };
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.62)"); gr.addColorStop(0.55, "rgba(0,0,0,.28)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (p, sx, sz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), basic({ map: blobT })); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.y = 0.03; m.renderOrder = 2; p.add(m); return m; };
  const pucks = [], hulls = [];
  const geoPuckBase = lathe(1.72, 0.26, 0.1), geoPuck = lathe(1.5, 0.95, 0.2), geoBand = new THREE.CylinderGeometry(1.515, 1.515, 0.2, 48, 1, true), geoTop = new THREE.CircleGeometry(1.32, 48);
  function puck(sc = 1) {
    const G = new THREE.Group(), B = new THREE.Group(); G.add(B); scene.add(G);
    add(geoPuckBase, M.base, 0, 0, 0, B);
    add(geoPuck, M.isl, 0, 0.22, 0, B);
    add(geoBand, M.red, 0, 0.62, 0, B);
    const top = add(geoTop, new THREE.MeshStandardMaterial({ map: crossT, roughness: 0.25, metalness: 0 }), 0, 1.175, 0, B); top.rotation.x = -Math.PI / 2;
    blob(G, 5.2, 5.2);
    G.scale.setScalar(sc); G.visible = false;
    const o = { G, B, sc, kind: "isl" }; pucks.push(o); return o;
  }
  function hullGeo(L, Bm, h) {
    const s = new THREE.Shape(), r = Bm * 0.35;
    s.moveTo(-Bm / 2, -L / 2 + r); s.quadraticCurveTo(-Bm / 2, -L / 2, -Bm / 2 + r, -L / 2); s.lineTo(Bm / 2 - r, -L / 2); s.quadraticCurveTo(Bm / 2, -L / 2, Bm / 2, -L / 2 + r);
    s.lineTo(Bm / 2, L / 2 - Bm * 1.1); s.quadraticCurveTo(Bm / 2, L / 2 - Bm * 0.25, 0, L / 2); s.quadraticCurveTo(-Bm / 2, L / 2 - Bm * 0.25, -Bm / 2, L / 2 - Bm * 1.1); s.closePath();
    const bev = Math.min(0.22, h * 0.25);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 12 });
    g.rotateX(-Math.PI / 2); g.translate(0, bev, 0); return { g, top: h + 2 * bev };
  }
  const deckTex = {};
  function deck(label, bg, fg) {
    const k = label + bg; if (deckTex[k]) return deckTex[k];
    return (deckTex[k] = canvasTex(128, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = fg; g.font = `700 ${w * 0.62}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.save(); g.translate(w / 2, h * 0.42); g.rotate(-Math.PI / 2); g.fillText(label, 0, 0); g.restore(); }));
  }
  const HG = { dd: hullGeo(5.6, 1.9, 0.9), ff: hullGeo(4.8, 1.7, 0.8), tr: hullGeo(4.2, 1.8, 0.75), sub: null };
  function hull(kind, sc = 1, label = "") {
    const G = new THREE.Group(), B = new THREE.Group(); G.add(B); scene.add(G);
    const H = kind === "tr" ? HG.tr : kind === "ff" ? HG.ff : HG.dd, L = kind === "tr" ? 4.2 : kind === "ff" ? 4.8 : 5.6;
    add(H.g, kind === "tr" ? M.trawl : M.steel, 0, 0, 0, B);
    if (kind === "tr") {
      add(new THREE.BoxGeometry(1.1, 0.7, 1.0), M.trawlD, 0, H.top + 0.35, L * 0.22, B);
      add(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8), M.steelD, 0, H.top + 0.8, -L * 0.12, B);
    } else {
      add(new THREE.BoxGeometry(1.0, 0.55, 1.5), M.steelD, 0, H.top + 0.27, L * 0.12, B);
      add(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), M.steelD, 0, H.top + 0.95, L * 0.12, B);
    }
    if (label) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 2.3), basic({ map: deck(label, "", kind === "tr" ? "#3a1f05" : "#F4F7FA"), opacity: 0.92 }));
      d.rotation.x = -Math.PI / 2; d.position.set(0, H.top + 0.01, -L * 0.2); d.renderOrder = 4; B.add(d);
    }
    blob(G, 3.6, L * 1.3);
    G.scale.setScalar(sc); G.visible = false;
    const o = { G, B, sc, kind, L }; hulls.push(o); return o;
  }
  function sub(sc = 1) {
    const G = new THREE.Group(), B = new THREE.Group(); G.add(B); scene.add(G);
    const body = add(new THREE.CapsuleGeometry(0.75, 5.2, 8, 20), M.sub, 0, 0.75, 0, B); body.rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(0.45, 0.9, 1.4), M.sub, 0, 1.75, -0.6, B);
    blob(G, 2.6, 7.5);
    G.scale.setScalar(sc); G.visible = false;
    return { G, B, sc };
  }
  // place a piece: keys [[t, x, z, yaw]], shown between t0 and t1
  function drive(o, t, keys, t0, t1, fi = 0.35, fo = 0.35) {
    const k = Math.min(back(clamp01((t - t0) / fi), 1.6), 1 - smooth(clamp01((t - t1) / fo)));
    o.G.visible = k > 0.002;
    if (!o.G.visible) return null;
    o.trk = o.trk || track(keys);
    const [x, z, yaw] = o.trk(t);
    o.G.position.set(x, 0, z); o.G.rotation.y = yaw; o.G.scale.setScalar(o.sc * Math.max(0.001, k));
    return [x, z, yaw];
  }
  const yawTo = (dx, dz) => Math.atan2(-dx, -dz);

  // telestrator ribbons on the board, draw-on by fraction
  function ribbon(pts3, w, mat, dash = 0, y = 0.07) {
    const pos = [], idx = []; let v = 0;
    for (let i = 0; i < pts3.length - 1; i++) {
      if (dash && Math.floor(i / dash) % 2 === 1) { idx.push(v, v, v, v, v, v); continue; }
      const a = new THREE.Vector3(pts3[i][0], y, pts3[i][1]), b = new THREE.Vector3(pts3[i + 1][0], y, pts3[i + 1][1]);
      const d = b.clone().sub(a).normalize(), s = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(w / 2);
      pos.push(a.x - s.x, y, a.z - s.z, a.x + s.x, y, a.z + s.z, b.x - s.x, y, b.z - s.z, b.x + s.x, y, b.z + s.z);
      idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); v += 4;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 3; m.frustumCulled = false; scene.add(m);
    m.n = pts3.length - 1; m.draw = (u) => { u = clamp01(u); m.visible = u > 0.001; geo.setDrawRange(0, Math.ceil(u * m.n) * 6); };
    m.draw(0); return m;
  }
  const curve = (a, b, bend = 0.2, n = 60) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const cx = (a[0] + b[0]) / 2 - dz * bend, cz = (a[1] + b[1]) / 2 + dx * bend; return Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * cx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * cz + u * u * b[1]]; }); };
  function arrow(a, b, col, w, bend = 0.15, dash = 0, head = 2.2) {
    const P = curve(a, b, bend);
    const mat = basic({ color: col, opacity: 0.95 });
    const rb = ribbon(P.slice(0, -2), w, mat, dash);
    const e = P[P.length - 1], p = P[P.length - 4], dx = e[0] - p[0], dz = e[1] - p[1], l = Math.hypot(dx, dz);
    const sh = new THREE.Shape(); sh.moveTo(0, head); sh.lineTo(head * 0.62, -head * 0.2); sh.lineTo(-head * 0.62, -head * 0.2); sh.closePath();
    const hd = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); hd.rotation.x = -Math.PI / 2; hd.rotation.z = Math.atan2(-dx / l, -dz / l) + Math.PI;
    hd.position.set(e[0] - (dx / l) * head * 0.6, 0.075, e[1] - (dz / l) * head * 0.6); hd.renderOrder = 3; scene.add(hd);
    hd.rotation.order = "XYZ";
    // ShapeGeometry tip points +y; after rotation.x=-PI/2 it points -z. rotate about world y by heading.
    hd.rotation.set(-Math.PI / 2, 0, 0); hd.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.atan2(-dx, -dz));
    return { rb, hd, mat, set(u, o = 1) { rb.draw(u); hd.visible = u > 0.97; mat.opacity = 0.95 * o; } };
  }

  // sparks + shock rings
  const SP = pts(scene, 240, { color: 0xffd27a, size: 0.55, add: true });
  const ringGeo = new THREE.RingGeometry(0.86, 1, 64);
  const ringM = (c) => basic({ color: c, opacity: 0, side: THREE.DoubleSide });
  const bursts = [];
  function burst(tt, x, z, n, col = 0xfff0c0, y = 1.0) { const R = new THREE.Mesh(ringGeo, ringM(col)); R.rotation.x = -Math.PI / 2; R.position.set(x, 0.1, z); R.renderOrder = 6; scene.add(R); const q = mulberry(Math.round(x * 100 + z * 7)); const P = Array.from({ length: n }, () => [q() * 6.28, 2 + q() * 7, 2 + q() * 6, q() * 0.25]); bursts.push({ tt, x, z, y, R, P }); }

  // =================== beats ===================
  // ---- s1 hook: flash-forward standoff ----
  const H1 = { pk: [puck(1.6), puck(1.6), puck(1.6)], rn: [hull("dd", 1.45, "RN"), hull("ff", 1.45, "RN"), hull("dd", 1.45, "RN"), hull("ff", 1.45, "RN")], tr: [hull("tr", 1.4, "T"), hull("tr", 1.4, "T")] };
  const H1P = [[-1, -36], [7, -34.5], [15, -36.5]], H1R = [[-8, -47], [1.5, -49], [11, -48.5], [20, -47]], H1T = [[-2, -57], [14, -58]];
  const hookCut = arrow([7, -36], [11, -43], YEL, 0.32, 0.25, 3, 1.6);
  const hookArr = H1P.map((p, i) => arrow([p[0], p[1] - 1.8], [p[0] + (i - 1) * 0.6, p[1] - 6.0], YEL, 0.3, 0, 0, 1.5));
  const hookArrR = H1R.map((p) => arrow([p[0], p[1] + 3.0], [p[0] * 0.95, p[1] + 7.0], CORAL, 0.3, 0, 2, 1.5));

  // ---- s2: cod schools around Iceland, trawlers arrive from Britain ----
  const fishShape = new THREE.Shape(); fishShape.moveTo(1.0, 0); fishShape.bezierCurveTo(0.7, 0.42, -0.35, 0.38, -0.62, 0.06); fishShape.lineTo(-1.0, 0.34); fishShape.lineTo(-0.92, 0); fishShape.lineTo(-1.0, -0.34); fishShape.lineTo(-0.62, -0.06); fishShape.bezierCurveTo(-0.35, -0.38, 0.7, -0.42, 1.0, 0);
  const fishGeo = new THREE.ExtrudeGeometry(fishShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 8 });
  fishGeo.rotateX(-Math.PI / 2); fishGeo.rotateY(Math.PI / 2); fishGeo.scale(1.1, 1, 1.1);
  const fishM = std(0xc8d2dc, 0.26, 0.85);
  const NF = 84, fishI = new THREE.InstancedMesh(fishGeo, fishM, NF); fishI.castShadow = true; scene.add(fishI); fishI.frustumCulled = false;
  const fq = mulberry(42), fish = [];
  const schools = [[-1, 0, 0, 1, 10], [0.6, 0.8, 0, 0, 22], [1, 0.1, 0, 0, 14], [-0.7, 0.7, 0, 0, 18], [0.2, -1, 0, 0, 12], [-1, -0.4, 0, 0, 26]];
  for (let i = 0; i < NF; i++) {
    const s = schools[i % schools.length];
    const [hx, hz] = seaPoint(0, 0, s[0], s[1], s[4]);
    fish.push([hx + (fq() - 0.5) * 7, hz + (fq() - 0.5) * 7, 1.2 + fq() * 2.2, fq() * 6.28, (fq() < 0.5 ? -1 : 1) * (0.35 + fq() * 0.3), 0.7 + fq() * 0.5]);
  }
  const dummy = new THREE.Object3D();
  const S2T = [hull("tr", 1, "T"), hull("tr", 1, "T"), hull("tr", 1, "T"), hull("tr", 1, "T")];
  const S2Dest = [seaPoint(6, 6, 0.3, 1, 26), seaPoint(-6, 6, -0.1, 1, 20), seaPoint(16, 2, 1, 0.6, 24), seaPoint(-14, 8, -0.4, 1, 22)];
  const S2Src = [[78, 64], [84, 58], [90, 70], [72, 72]];
  const s2Arrow = arrow([80, 62], [14, 26], CORAL, 0.55, 0.12, 3, 3.0);
  const s2Lab = plate(17, 2.6, txt("SEJAK ABAD KE-14", (h) => `700 ${h * 0.8}px ${HEAD}`, "#FFD9CC", "center", "rgba(40,10,0,.65)"), 46, 0.1, 37, true, scene, 1100);
  s2Lab.rotation.z = 0.33;

  // ---- s3: Reykjanes coast close-up, 4 nm then 12 nm ----
  const [C3x, C3z] = seaPoint(-14, 7, 0, 1, 0.2);
  const SC3 = 0.36;
  const S3T = [hull("tr", SC3, "T"), hull("tr", SC3, "T")];
  const S3TP = [seaPoint(-12.2, 7, 0, 1, 7.2), seaPoint(-16.4, 7, -0.15, 1, 8.6)];
  const S3P = [puck(SC3), puck(SC3)];
  const S3R = [hull("dd", SC3, "RN"), hull("ff", SC3, "RN")];
  const S3RP = [seaPoint(-11.4, 7, 0.1, 1, 15.5), seaPoint(-17.6, 7, -0.2, 1, 16.5)];
  const lab4 = plate(4.4, 0.62, txt("4 MIL LAUT · 1952", (h) => `700 ${h * 0.78}px ${HEAD}`, CHALK, "center", "rgba(5,20,35,.7)"), 0, 0.12, 0, true, scene, 700);
  const lab12 = plate(4.4, 0.62, txt("12 MIL · 1958", (h) => `700 ${h * 0.78}px ${HEAD}`, CHALK, "center", "rgba(5,20,35,.7)"), 0, 0.12, 0, true, scene, 700);
  { const [a, b] = seaPoint(-8.4, 7, 0, 1, 2.1); lab4.position.set(a + 0.2, 0.12, b + 0.38); const [c, d] = seaPoint(-8.4, 7, 0, 1, 12); lab12.position.set(c + 0.2, 0.12, d + 0.4); }
  const inZone = S3T.map(() => { const R = new THREE.Mesh(ringGeo, ringM(0xff5a4a)); R.rotation.x = -Math.PI / 2; R.renderOrder = 6; scene.add(R); return R; });

  // ---- s4: Cod War I fleet: 17 destroyers + 19 frigates vs 6 patrol pucks ----
  const FL = [];
  {
    const q = mulberry(1958);
    for (let i = 0; i < 36; i++) {
      const kind = i < 17 ? "dd" : "ff";
      const row = i < 12 ? 0 : i < 24 ? 1 : 2, k = i < 12 ? i : i < 24 ? i - 12 : i - 24;
      const ang = -0.95 + (k / 11) * 1.9 + (row % 2) * 0.08;
      const [px, pz] = seaPoint(0, 0, Math.sin(ang), Math.cos(ang), 26 + row * 21 + q() * 6);
      FL.push({ o: hull(kind, 0.85, "RN"), p: [px, pz], d: q() * 0.6 + row * 0.25, yaw: yawTo(-Math.sin(ang), -Math.cos(ang)) });
    }
  }
  const S4P = [0, 1, 2, 3, 4, 5].map((i) => { const ang = -0.9 + i * 0.36; return { o: puck(0.85), p: seaPoint(0, 0, Math.sin(ang), Math.cos(ang), 7), i }; });
  const lab50 = plate(9.5, 1.5, txt("50 MIL · 1972", (h) => `700 ${h * 0.8}px ${HEAD}`, CHALK, "center", "rgba(5,20,35,.75)"), 0, 0.12, 0, true, scene, 800);
  { const [a, b] = seaPoint(-3, 4, -0.15, 1, 50); lab50.position.set(a, 0.12, b + 1.1); }

  // ---- s5: net cutter + ramming (east of Iceland, inside 50 nm) ----
  const [C5x, C5z] = seaPoint(16, 4, 0.75, 0.65, 30);
  const S5T = hull("tr", 1, "T"), S5R = hull("dd", 1, "RN"), S5P = puck(1), S5P2 = puck(1);
  const cutter = new THREE.Group(); scene.add(cutter);
  add(new THREE.TorusGeometry(0.42, 0.11, 10, 24, Math.PI * 1.25), M.wire, 0, 0.35, 0, cutter).rotation.set(Math.PI / 2, 0, 0.6);
  add(new THREE.ConeGeometry(0.16, 0.6, 10), M.wire, 0.42, 0.35, 0, cutter).rotation.z = -Math.PI / 2;
  const tube = (mat = M.wire, rr = 0.06) => { const m = add(new THREE.CylinderGeometry(rr, rr, 1, 8), mat); m.castShadow = true; return m; };
  const span = (m, a, b) => { const d = new THREE.Vector3().subVectors(b, a), l = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.scale.set(1, Math.max(0.001, l), 1); m.visible = l > 0.01; };
  const wA = tube(), wB = tube(), towL = tube(std(0xffe27a, 0.4, 0.2, { emissive: 0x5a4a10 }), 0.05);
  const netT = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(235,240,245,.95)"; g.lineWidth = 3; for (let i = -w; i < 2 * w; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + w, w); g.stroke(); g.beginPath(); g.moveTo(i, w); g.lineTo(i + w, 0); g.stroke(); } });
  netT.wrapS = netT.wrapT = THREE.RepeatWrapping; netT.repeat.set(3, 2);
  const net = new THREE.Group(); scene.add(net);
  const netM = new THREE.MeshStandardMaterial({ color: 0xe6edf2, map: netT, alphaMap: netT, transparent: true, side: THREE.DoubleSide, roughness: 0.7, depthWrite: false });
  const netMesh = add(new THREE.ConeGeometry(1.5, 5.4, 18, 1, true), netM, 0, 0.75, 0, net); netMesh.rotation.x = -Math.PI / 2; netMesh.castShadow = false;
  const floatsM = std(0xff7a2a, 0.4);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; add(new THREE.SphereGeometry(0.2, 12, 10), floatsM, Math.cos(a) * 1.5, 0.75 + Math.sin(a) * 1.5, 2.7, net); }
  const snipLab = plate(7.2, 1.7, txt("JARING PUTUS", (h) => `700 ${h * 0.8}px ${HEAD}`, "#FFE27A", "center", "rgba(40,25,0,.75)"), 0, 0, 0, false, scene, 800);
  const ramLab = plate(7.2, 1.7, txt("TABRAKAN", (h) => `700 ${h * 0.8}px ${HEAD}`, "#FF8A78", "center", "rgba(40,5,0,.75)"), 0, 0, 0, false, scene, 800);

  // ---- s6: 200 nm, diplomatic link, GIUK gap, submarines ----
  const lab200 = plate(14, 2.2, txt("200 MIL · 1975", (h) => `700 ${h * 0.8}px ${HEAD}`, CHALK, "center", "rgba(5,20,35,.75)"), 0, 0.12, 0, true, scene, 900);
  { const [a, b] = seaPoint(-3, 4, -0.15, 1, 200); lab200.position.set(a, 0.12, b + 1.6); }
  const UKP = [86, 66];
  const linkC = new THREE.QuadraticBezierCurve3(new THREE.Vector3(RKX, ICEH + 0.9, RKZ), new THREE.Vector3((RKX + UKP[0]) / 2, 24, (RKZ + UKP[1]) / 2), new THREE.Vector3(UKP[0], 1.2, UKP[1]));
  const LP = linkC.getPoints(80);
  const linkM = basic({ color: 0xffe9b0, opacity: 0.95 });
  const linkGeoA = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(LP.slice(0, 41)), 60, 0.3, 8), linkGeoB = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(LP.slice(40)), 60, 0.3, 8);
  const linkA = new THREE.Mesh(linkGeoA, linkM), linkB = new THREE.Mesh(linkGeoB, linkM); scene.add(linkA, linkB);
  const ukPin = new THREE.Group(); ukPin.position.set(UKP[0], 0.9, UKP[1]); scene.add(ukPin);
  add(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 24), std(0xffffff, 0.3), 0, 0.2, 0, ukPin); add(new THREE.CylinderGeometry(0.38, 0.38, 0.45, 20), std(0x7a8794, 0.3, 0.5), 0, 0.3, 0, ukPin);
  const linkLab = plate(19, 2.6, txt("HUBUNGAN DIPLOMATIK", (h) => `700 ${h * 0.78}px ${HEAD}`, "#FFF1C8", "center", "rgba(30,20,0,.7)"), LP[40].x, LP[40].y + 3.4, LP[40].z, false, scene, 1200);
  const putus = plate(16, 4.0, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(200,20,45,.92)"; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = "#fff"; g.lineWidth = 10; g.strokeRect(22, 22, w - 44, h - 44); g.fillStyle = "#fff"; g.font = `700 ${h * 0.5}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PUTUS · 19 FEB 1976", w / 2, h * 0.55); }, LP[40].x, LP[40].y, LP[40].z, false, scene, 1100);
  const GIUK1 = [[-33.5, -45], [-29, -30], [-25.5, -15.5]], GIUK2 = [[22, 8], [41, 18], [60.5, 27], [77, 32], [93, 37]];
  const giM = basic({ color: 0xffb547, opacity: 0.95 });
  const sm = (P, n = 30) => P.slice(0, -1).flatMap((p, i) => Array.from({ length: n }, (_, k) => [p[0] + (P[i + 1][0] - p[0]) * k / n, p[1] + (P[i + 1][1] - p[1]) * k / n])).concat([P[P.length - 1]]);
  const gi1 = ribbon(sm(GIUK1), 0.85, giM, 3, 0.09), gi2 = ribbon(sm(GIUK2), 0.85, giM, 3, 0.09);
  const giLab = plate(20, 4.6, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(10,20,32,.86)"; g.fillRect(0, 0, w, h); g.fillStyle = "#FFB547"; g.fillRect(0, 0, 14, h); g.textAlign = "left"; g.textBaseline = "middle"; g.font = `700 ${h * 0.44}px ${HEAD}`; g.fillStyle = "#FFB547"; g.fillText("CELAH GIUK", 40, h * 0.34); g.font = `500 ${h * 0.21}px ${MONO}`; g.fillStyle = "#DCE6F0"; g.fillText("GREENLAND–ISLANDIA–INGGRIS", 40, h * 0.74); }, 30, 7, 34, false, scene, 1100);
  const natoLab = plate(20, 6.4, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#0B2A55"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#fff"; g.font = `700 ${h * 0.46}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NATO", w / 2, h * 0.42); g.font = `600 ${h * 0.17}px ${MONO}`; g.fillText("KELUAR?", w / 2, h * 0.76); }, 32, 7, -12, false, scene, 800);
  const SUB = [sub(1.1), sub(1.1)];
  const SUBK = [[[-8, -62], [-31, -30], [-50, 2]], [[58, -55], [42, 12], [36, 54]]];
  const sonar = [0, 1, 2, 3].map(() => { const R = new THREE.Mesh(ringGeo, ringM(0x8fe3ff)); R.rotation.x = -Math.PI / 2; R.position.set(-17.5, 0.12, 10); R.renderOrder = 6; scene.add(R); return R; });
  const subRing = SUB.map(() => { const R = new THREE.Mesh(ringGeo, ringM(0xff6a5a)); R.rotation.x = -Math.PI / 2; R.renderOrder = 6; scene.add(R); return R; });
  // British pieces inside the 200 nm zone (s6) that retreat in s7
  const BR = [];
  {
    const spots = [[0.5, 1, 80], [-0.3, 1, 120], [1, 0.5, 70], [0.9, 1, 140], [-0.8, 0.8, 90], [0.2, 1, 160], [1, 0.1, 110], [0.6, 0.8, 175]];
    spots.forEach((s, i) => {
      const [x, z] = seaPoint(0, 0, s[0], s[1], s[2]);
      const kind = i % 2 ? "tr" : i % 4 === 0 ? "dd" : "ff";
      BR.push({ o: hull(kind, 1, kind === "tr" ? "T" : "RN"), p: [x, z], i, kind });
    });
  }
  const ISL6 = [[-0.95, -0.2], [-0.8, 0.6], [-0.2, 1], [0.4, 1], [0.95, 0.55], [0.9, -0.5]].map(([a, b], i) => ({ o: puck(1.15), p: seaPoint(0, 0, a, b, 196), i }));
  const retreat = [];
  const portSpots = [[66, 50], [71, 52], [76, 50], [81, 52], [68, 56], [73, 57], [78, 56], [62, 54]];
  const s7Arrows = BR.map((b, i) => arrow([b.p[0], b.p[1]], [portSpots[i][0] - 2, portSpots[i][1] - 2], GOLD, 0.45, 0.1, 3, 2.2));
  const portLab = plate(16, 2.6, txt("PELABUHAN INGGRIS", (h) => `700 ${h * 0.8}px ${HEAD}`, "#E6EEF6", "center", "rgba(5,10,20,.75)"), 71, 0.15, 45, true, scene, 1000);
  const zeeLab = plate(30, 5, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(8,22,36,.88)"; g.fillRect(0, 0, w, h); g.strokeStyle = CHALK; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = CHALK; g.font = `700 ${h * 0.42}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ZEE 200 MIL", w / 2, h * 0.38); g.font = `600 ${h * 0.2}px ${MONO}`; g.fillStyle = GOLD; g.fillText("STANDAR DUNIA · UNCLOS 1982", w / 2, h * 0.76); }, 4, 13, 2, false, scene, 1200);

  // =================== camera ===================
  const s = (k) => K[k];
  const CAM = track([
    [0, 12, 58, 70, 7, 9, -64],
    [A("s1:menang"), 10, 55, 64, 7, 9, -65],
    [K.s2 - 0.5, 8, 53, 60, 6, 9, -65],
    [K.s2 + 1.6, 2, 70, 84, 1, 0, 8],
    [A("s2:Sejak"), -2, 74, 80, 2, 0, 6],
    [K.s3 - 0.6, 10, 72, 82, 10, 0, 12],
    [A("s3:empat") - 0.9, C3x + 4.5, 15, C3z + 21, C3x - 0.3, 0, C3z - 1.0],
    [A("s3:dua"), C3x + 3.2, 14, C3z + 19, C3x - 0.6, 0, C3z],
    [A("s3:mengirim") - 0.4, C3x + 2.6, 15.5, C3z + 23, C3x - 0.8, 0, C3z + 1.2],
    [K.s4 + 0.9, 6, 70, 92, 2, 0, 18],
    [K.s5 - 0.4, 8, 74, 94, 3, 0, 16],
    [A("s5:lima") + 0.3, 8, 80, 98, 4, 0, 14],
    [A("s5:Penjaga") + 0.7, C5x + 6, 19, C5z + 27, C5x + 3.6, 0, C5z + 1.2],
    [A("s5:jaring#2"), C5x + 5.2, 17.5, C5z + 25, C5x + 3.2, 0, C5z + 1.4],
    [A("s5:belakang") + 0.3, C5x + 4.6, 17.5, C5z + 25, C5x + 2.8, 0, C5z + 1.8],
    [A("s5:tabrak"), C5x + 3, 18, C5z + 27, C5x + 1.2, 0, C5z + 3.4],
    [K.s6 + 1.2, 12, 134, 132, 8, 0, 29],
    [A("s6:diplomatik"), 24, 136, 142, 20, 0, 38],
    [A("s6:NATO"), 10, 140, 128, 8, 0, 32],
    [A("s6:selam"), 4, 138, 124, 4, 0, 30],
    [K.s7 + 0.6, 28, 90, 136, 26, 0, 40],
    [A("s7:mengalah"), 18, 105, 130, 16, 0, 12],
    [A("s7:ribuan") - 0.3, 64, 52, 100, 70, 0, 46],
    [K.s8 - 0.2, 62, 54, 100, 68, 0, 44],
    [A("s8:standar"), 14, 120, 118, 10, 0, -36],
    [K.end + 0.5, 10, 136, 130, 9, 0, -38],
  ]);
  const look = new THREE.Vector3();

  // =================== draw ===================
  let lastSB = "";
  return function draw(t) {
    // bokeh twinkle
    for (let i = 0; i < NB; i++) { const b = bokB[i]; bok.pos[i * 3] = b[0]; bok.pos[i * 3 + 1] = b[1]; bok.pos[i * 3 + 2] = b[2]; const k = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * b[4] + b[3])); bok.col[i * 3] = b[5][0] * k; bok.col[i * 3 + 1] = b[5][1] * k; bok.col[i * 3 + 2] = b[5][2] * k; }
    bok.commit();

    // ---- zone radius ----
    const grow = (a, d = 1.6) => smooth(clamp01((t - a) / d));
    const g4 = grow(A("s3:empat") - 0.2, 1.0), g12 = grow(A("s3:dua") - 0.2, 1.2), g50 = grow(A("s5:lima") - 0.3, 1.8), g200 = grow(A("s6:dua") - 0.3, 2.4);
    let R = 0, fillK = 1;
    if (t < K.s2) { R = 200; fillK = 0.55 * (1 - clamp01((t - K.s2 + 0.6) / 0.5)); }
    else R = 4 * g4 + 8 * g12 + 38 * g50 + 150 * g200;
    ZU.uR.value = R > 0.02 ? R : 0;
    ZU.uLine.value = t < K.s2 ? fillK / 0.55 : 1;
    ZU.uFill.value = t < K.s2 ? fillK : 1;
    ZU.uGlow.value = t < K.s2 ? 0 : Math.max(g4 * (1 - g4), g12 * (1 - g12), g50 * (1 - g50), g200 * (1 - g200)) * 4;
    ZU.uP4.value = t >= K.s2 ? clamp01((R - 5) / 2) * 0.9 : 0;
    ZU.uP12.value = t >= K.s2 ? clamp01((R - 14) / 3) * 0.9 : 0;
    ZU.uP50.value = t >= K.s2 ? clamp01((R - 55) / 6) * 0.9 : 0;
    const vlab = (m, a, b) => { const k = win(t, a, b, 0.4, 0.5); m.material.opacity = k; m.visible = k > 0.002; };
    vlab(lab4, A("s3:empat"), K.s4); vlab(lab12, A("s3:dua") + 0.4, K.s4);
    vlab(lab50, A("s5:lima") + 0.6, A("s5:pemotong") - 0.6);
    vlab(lab200, A("s6:dua") + 1.2, K.end + 2);

    // ---- scoreboard ----
    let sa = 0, lbl = "1958–1976", flashAt = -9;
    if (t < K.s2 - 0.3) { sa = t >= A("s1:kali#2") ? 3 : t >= A("s1:tiga#2") ? 2 : t >= A("s1:menang") ? 1 : 0; flashAt = sa === 3 ? A("s1:kali#2") : sa === 2 ? A("s1:tiga#2") : A("s1:menang"); }
    else if (t < A("s4:patroli") + 0.3) { sa = 0; lbl = "SKOR"; }
    else if (t < K.s6 - 0.2) { sa = 1; lbl = "PERANG COD I · 1958–61"; flashAt = A("s4:patroli") + 0.3; }
    else if (t < A("s7:mengalah")) { sa = 2; lbl = "PERANG COD II · 1972–73"; flashAt = K.s6 - 0.2; }
    else { sa = 3; lbl = "PERANG COD III · 1975–76"; flashAt = A("s7:mengalah"); }
    const fl = t - flashAt < 0.5 && t >= flashAt && Math.floor((t - flashAt) * 8) % 2 === 0;
    const st = `${sa}|${lbl}|${fl}`;
    if (st !== lastSB) { lastSB = st; paintSB(sa, 0, lbl, fl); }

    // ---- s1 hook ----
    const s1e = K.s2 + 0.2;
    H1.pk.forEach((o, i) => { const p = H1P[i], t0 = A("s1:kecil") - 0.2 + i * 0.12; drive(o, t, [[0, p[0], p[1] + 1.5, 0], [A("s1:melawan"), p[0], p[1] + 1.2, 0], [A("s1:menang"), p[0], p[1] - 0.8, 0], [K.s2, p[0], p[1] - 1.2, 0]], t0, s1e); });
    H1.rn.forEach((o, i) => { const p = H1R[i], t0 = A("s1:Angkatan") - 0.3 + i * 0.1; drive(o, t, [[0, p[0], p[1] - 5, Math.PI], [t0, p[0], p[1] - 4, Math.PI], [A("s1:Inggris") + 0.3, p[0], p[1], Math.PI], [K.s2, p[0], p[1] + 0.8, Math.PI]], t0, s1e); });
    H1.tr.forEach((o, i) => { const p = H1T[i]; drive(o, t, [[0, p[0], p[1], Math.PI], [K.s2, p[0], p[1] + 0.5, Math.PI]], A("s1:Kerajaan") + i * 0.12, s1e); });
    hookArr.forEach((a, i) => a.set((t - A("s1:melawan") - i * 0.1) / 0.6, 1 - clamp01((t - K.s2 + 0.3) / 0.4)));
    hookArrR.forEach((a, i) => a.set((t - A("s1:Kerajaan") - i * 0.1) / 0.6, 1 - clamp01((t - K.s2 + 0.3) / 0.4)));
    hookCut.set((t - A("s1:gunting") + 0.25) / 0.55, 1 - clamp01((t - K.s2 + 0.3) / 0.4));

    // ---- s2 cod + trawlers ----
    const fishK = Math.max(win(t, K.s2 + 0.2, K.s3 + 0.4, 0.8, 0.8), win(t, A("s8:standar") - 1.0, K.dur + 5, 1.2, 1));
    for (let i = 0; i < NF; i++) {
      const f = fish[i], a = f[3] + t * f[4];
      const x = f[0] + Math.cos(a) * f[2], z = f[1] + Math.sin(a) * f[2];
      dummy.position.set(x, 0.32 + 0.1 * Math.sin(t * 3 + i), z);
      dummy.rotation.set(0, -a + (f[4] > 0 ? -Math.PI / 2 : Math.PI / 2) + Math.PI / 2, 0.15 * Math.sin(t * 6 + i));
      dummy.scale.setScalar(Math.max(0.001, fishK * f[5] * 1.3)); dummy.updateMatrix(); fishI.setMatrixAt(i, dummy.matrix);
    }
    fishI.instanceMatrix.needsUpdate = true; fishI.visible = fishK > 0.002;
    S2T.forEach((o, i) => {
      const a = S2Src[i], b = S2Dest[i], t0 = A("s2:Sejak") - 0.3 + i * 0.25, t1 = A("s2:sana") + 0.2;
      drive(o, t, [[t0, a[0], a[1], yawTo(b[0] - a[0], b[1] - a[1])], [t1, b[0], b[1], yawTo(b[0] - a[0], b[1] - a[1])], [t1 + 3, b[0] - 0.4, b[1] + 0.3, yawTo(b[0] - a[0], b[1] - a[1])]], t0, K.s3 + 0.3);
    });
    s2Arrow.set((t - A("s2:Sejak") + 0.4) / 1.2, 1 - clamp01((t - K.s3 + 0.2) / 0.4));
    vlab(s2Lab, A("s2:abad") - 0.2, K.s3 + 0.1);

    // ---- s3 close coast ----
    const s3e = K.s4 + 0.5;
    S3T.forEach((o, i) => { const p = S3TP[i]; drive(o, t, [[K.s3, p[0] + 0.6, p[1], -Math.PI / 2], [s3e, p[0] - 0.5, p[1], -Math.PI / 2]].map((k) => [k[0], k[1], k[2], Math.PI / 2]), K.s3 - 0.4, s3e); });
    S3T.forEach((o, i) => { const k = win(t, A("s3:1958") - 0.1, s3e, 0.3, 0.3); const R2 = inZone[i]; R2.visible = k > 0.002 && o.G.visible; if (R2.visible) { const ph = ((t - A("s3:1958")) % 1.1) / 1.1; R2.position.set(o.G.position.x, 0.14, o.G.position.z); R2.scale.setScalar(1.1 + ph * 1.6); R2.material.opacity = k * (1 - ph) * 0.9; } });
    S3P.forEach((o, i) => { const tgt = S3TP[i], st0 = seaPoint(tgt[0] + 0.6, 7, 0, 1, 0.8); drive(o, t, [[A("s3:dua"), st0[0], st0[1], 0], [A("s3:Inggris"), tgt[0] + 0.9 - i * 0.2, tgt[1] - 0.6, 0], [s3e, tgt[0] + 1.0 - i * 0.2, tgt[1] - 0.7, 0]], A("s3:dua") + 0.2 + i * 0.15, s3e); });
    S3R.forEach((o, i) => { const p = S3RP[i]; drive(o, t, [[A("s3:mengirim") - 0.3, p[0] + 0.3, p[1] + 2.4, 0], [A("s3:perang") + 0.5, p[0], p[1] + 0.2, 0], [s3e, p[0], p[1], 0]], A("s3:mengirim") - 0.3, s3e); });

    // ---- s4 fleet ----
    const s4e = K.s5 + 0.6;
    FL.forEach((f) => { const t0 = A("s4:mengerahkan") + f.d; drive(f.o, t, [[t0, f.p[0] * 1.08, f.p[1] + 9, f.yaw], [t0 + 1.4, f.p[0], f.p[1], f.yaw], [s4e, f.p[0], f.p[1] - 0.6, f.yaw]], t0, s4e, 0.4); });
    S4P.forEach((f) => { const t0 = A("s4:enam") + f.i * 0.12; drive(f.o, t, [[t0, f.p[0], f.p[1], 0], [s4e, f.p[0], f.p[1] + 0.4, 0]], t0, s4e, 0.3); });

    // ---- s5 cut + ram ----
    const s5a = A("s5:Penjaga") - 0.5, s5e = K.s6 + 0.5, cutT = A("s5:jaring#2") - 0.05, ramT = A("s5:tabrak") - 0.08;
    const trYaw = Math.PI / 2 + 0.25; // heading roughly west-north-west
    const fwd = [-Math.sin(trYaw), -Math.cos(trYaw)];
    const trk = drive(S5T, t, [[s5a, C5x + fwd[0] * -1, C5z + fwd[1] * -1, trYaw], [s5e, C5x + fwd[0] * 2.2, C5z + fwd[1] * 2.2, trYaw]], s5a, s5e);
    const stern = trk ? [trk[0] - fwd[0] * 2.3, trk[1] - fwd[1] * 2.3] : [0, 0];
    const cutU = 0.55; // cut point along the wire (0 stern .. 1 net)
    const WL = 5.2;
    if (trk) {
      const nb = [stern[0] - fwd[0] * WL, stern[1] - fwd[1] * WL];
      const after = t > cutT;
      const cp = [stern[0] - fwd[0] * WL * cutU, stern[1] - fwd[1] * WL * cutU];
      const dt = Math.max(0, t - cutT);
      // the net drifts back and sinks after the cut
      const drift = after ? 1.6 * dt : 0, sink = after ? Math.min(0.75, 0.35 * dt) : 0;
      const netPos = [nb[0] - fwd[0] * (drift + 2.7), nb[1] - fwd[1] * (drift + 2.7)];
      net.position.set(netPos[0], -sink, netPos[1]); net.rotation.y = trYaw; net.visible = S5T.G.visible && dt < 4;
      netM.opacity = 0.9 * (1 - clamp01((dt - 2) / 1.5));
      span(wA, new THREE.Vector3(stern[0], 0.6, stern[1]), after ? new THREE.Vector3(cp[0] + fwd[0] * Math.min(2.6, dt * 3), 0.45, cp[1] + fwd[1] * Math.min(2.6, dt * 3)) : new THREE.Vector3(nb[0], 0.75, nb[1]));
      span(wB, after ? new THREE.Vector3(cp[0] - fwd[0] * drift, 0.4 - sink, cp[1] - fwd[1] * drift) : new THREE.Vector3(nb[0], 0.75, nb[1]), new THREE.Vector3(nb[0] - fwd[0] * drift, 0.75 - sink, nb[1] - fwd[1] * drift));
      wB.visible = after && dt < 3.5; wA.visible = S5T.G.visible;
      // the cutter puck crosses behind the trawler, dragging the cutter on a tow line
      const side = [fwd[1], -fwd[0]];
      const crossT = cutT - 1.0, lag = 1.0;
      const pAt = (tt) => { const u = (tt - crossT) * 1.7; return [cp[0] + side[0] * u, cp[1] + side[1] * u]; };
      const pk = drive(S5P, t, [[s5a, ...pAt(s5a), 0], [cutT + 0.3, ...pAt(cutT + 0.3), 0], [s5e, ...pAt(cutT + 0.3), 0]], A("s5:Penjaga") - 0.2, s5e);
      const cu = pAt(Math.min(t, cutT + 0.3) - lag);
      cutter.position.set(cu[0], 0, cu[1]); cutter.rotation.y = Math.atan2(side[0], side[1]); cutter.visible = !!pk;
      if (pk) span(towL, new THREE.Vector3(pk[0], 0.55, pk[1]), new THREE.Vector3(cu[0], 0.4, cu[1])); else towL.visible = false;
      const ks = win(t, cutT, A("s5:Kapal-kapal") - 0.2, 0.2, 0.3);
      snipLab.position.set(cp[0] + side[0] * 1.5, 1.9, cp[1] + side[1] * 1.5); snipLab.quaternion.copy(cam.quaternion); snipLab.scale.setScalar(Math.max(0.001, back(clamp01((t - cutT) / 0.3)) )); snipLab.material.opacity = ks; snipLab.visible = ks > 0.002;
      // ram: escort turns into a second puck
      const rp = [trk[0] + side[0] * 4.6 + fwd[0] * 1.5, trk[1] + side[1] * 4.6 + fwd[1] * 1.5];
      const hitP = [rp[0] - side[0] * 1.9, rp[1] - side[1] * 1.9];
      const ry = Math.atan2(side[0], side[1]);
      const bounce = (tt) => (tt < ramT ? 0 : Math.exp(-(tt - ramT) * 2.2) * Math.sin(Math.min(Math.PI / 2, (tt - ramT) * 6)) * 1.2);
      drive(S5R, t, [[s5a, rp[0] + side[0] * 1.2 + fwd[0] * 0.5, rp[1] + side[1] * 1.2 + fwd[1] * 0.5, trYaw], [A("s5:Kapal-kapal") - 0.2, rp[0] + side[0] * 2.6, rp[1] + side[1] * 2.6, trYaw + 0.6], [ramT, hitP[0] + side[0] * 3.0, hitP[1] + side[1] * 3.0, ry + Math.PI], [s5e, hitP[0] + side[0] * 3.6, hitP[1] + side[1] * 3.6, ry + Math.PI]], s5a, s5e);
      if (S5R.G.visible && t > ramT) { S5R.G.position.x += side[0] * bounce(t); S5R.G.position.z += side[1] * bounce(t); }
      const p2 = drive(S5P2, t, [[A("s5:Kapal-kapal") - 0.5, hitP[0] - side[0] * 3 - fwd[0] * 2, hitP[1] - side[1] * 3 - fwd[1] * 2, 0], [ramT, hitP[0] - side[0] * 0.2, hitP[1] - side[1] * 0.2, 0], [s5e, hitP[0] - side[0] * 0.4, hitP[1] - side[1] * 0.4, 0]], A("s5:Kapal-kapal") - 0.5, s5e);
      if (p2 && t > ramT) { S5P2.G.position.x -= side[0] * bounce(t) * 1.3; S5P2.G.position.z -= side[1] * bounce(t) * 1.3; S5P2.G.rotation.z = 0.25 * bounce(t); }
      const kr = win(t, ramT, s5e - 0.3, 0.15, 0.3);
      ramLab.position.set(hitP[0] + side[0] * 0.8, 2.3, hitP[1] + side[1] * 0.8); ramLab.quaternion.copy(cam.quaternion); ramLab.scale.setScalar(Math.max(0.001, back(clamp01((t - ramT) / 0.3)))); ramLab.material.opacity = kr; ramLab.visible = kr > 0.002;
      if (!bursts.length) { burst(cutT, cp[0], cp[1], 70, 0xffe27a, 0.6); burst(ramT, hitP[0], hitP[1], 110, 0xffffff, 1.0); }
      bursts[0].x = cp[0]; bursts[0].z = cp[1]; bursts[1].x = hitP[0]; bursts[1].z = hitP[1];
    } else { net.visible = false; wA.visible = wB.visible = towL.visible = false; cutter.visible = false; snipLab.visible = ramLab.visible = false; drive(S5R, t, [[0, 0, 0, 0]], 1e9, 1e9); drive(S5P, t, [[0, 0, 0, 0]], 1e9, 1e9); drive(S5P2, t, [[0, 0, 0, 0]], 1e9, 1e9); }

    // ---- s6: link, GIUK, subs ----
    const kL = win(t, A("s6:Islandia") - 0.3, K.s7 - 0.3, 0.5, 0.5);
    const snapT = A("s6:diplomatik") + 0.15, sd = Math.max(0, t - snapT);
    linkA.visible = linkB.visible = kL > 0.002; linkM.opacity = 0.95 * kL;
    linkA.material.color.set(t > snapT ? 0xff8a7a : 0xffe9b0);
    linkA.position.set(-sd * 2.2, -Math.min(6, sd * sd * 6), -sd * 1.4); linkB.position.set(sd * 2.2, -Math.min(6, sd * sd * 6), sd * 1.4);
    const drawU = clamp01((t - A("s6:Islandia") + 0.3) / 0.9); linkA.geometry.setDrawRange(0, Math.ceil(drawU * linkGeoA.index.count / 6) * 6 * 1); linkB.geometry.setDrawRange(0, drawU >= 1 ? Infinity : 0);
    ukPin.visible = kL > 0.002;
    { const k = win(t, A("s6:Islandia") + 0.4, snapT, 0.3, 0.2); linkLab.visible = k > 0.002; linkLab.material.opacity = k; linkLab.quaternion.copy(cam.quaternion); }
    { const k = win(t, snapT, K.s7 - 0.2, 0.2, 0.4); putus.visible = k > 0.002; putus.material.opacity = k; putus.quaternion.copy(cam.quaternion); putus.scale.setScalar(Math.max(0.001, 1.7 - 0.7 * clamp01((t - snapT) / 0.2))); putus.position.y = LP[40].y - 2; }
    const kG = win(t, A("s6:mengancam") - 0.2, K.s7 + 1.2, 0.3, 0.8);
    gi1.draw((t - A("s6:mengancam") + 0.2) / 1.0); gi2.draw((t - A("s6:keluar") + 0.2) / 1.2); giM.opacity = 0.95 * kG;
    giLab.visible = kG > 0.002 && t > A("s6:keluar"); giLab.material.opacity = kG * clamp01((t - A("s6:keluar")) / 0.4); giLab.quaternion.copy(cam.quaternion);
    { const k = win(t, A("s6:NATO") - 0.15, K.s7 + 0.4, 0.25, 0.5); natoLab.visible = k > 0.002; natoLab.material.opacity = k; natoLab.quaternion.copy(cam.quaternion); natoLab.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s6:NATO") + 0.15) / 0.35)))); }
    SUB.forEach((o, i) => { const k0 = SUBK[i], t0 = A("s6:Padahal") - 0.2 + i * 0.3, t1 = K.s7 + 0.6; const yaw = yawTo(k0[2][0] - k0[0][0], k0[2][1] - k0[0][1]); drive(o, t, [[t0, k0[0][0], k0[0][1], yaw], [A("s6:selam") + 0.4, k0[1][0], k0[1][1], yaw], [t1 + 2, k0[2][0], k0[2][1], yaw]], t0, t1); const Rr = subRing[i]; const ph = ((t - A("s6:mengawasi")) % 0.9) / 0.9; Rr.visible = o.G.visible && t > A("s6:mengawasi"); Rr.position.set(o.G.position.x, 0.14, o.G.position.z); Rr.scale.setScalar(2.2 + ph * 3); Rr.material.opacity = (1 - ph) * 0.9 * win(t, A("s6:mengawasi"), t1, 0.2, 0.3); });
    sonar.forEach((Rr, i) => { const t0 = A("s6:mengawasi") - 0.6 + i * 0.45; const ph = clamp01((t - t0) / 1.8); Rr.visible = t > t0 && ph < 1 && t < K.s7 + 0.3; Rr.scale.setScalar(1 + ph * 42); Rr.material.opacity = (1 - ph) * 0.75; });

    // ---- s6-s7 British pieces inside the zone, then retreat to port ----
    const brIn = K.s6 + 0.2, rT = A("s7:mengalah") - 0.2, s8e = K.dur + 5;
    BR.forEach((b, i) => {
      const port = portSpots[i], yawOut = yawTo(port[0] - b.p[0], port[1] - b.p[1]);
      const t0 = brIn + i * 0.1;
      const o = b.o, pos = drive(o, t, [[t0, b.p[0], b.p[1] + 1, Math.PI + 0.3 * Math.sin(i)], [rT, b.p[0], b.p[1], Math.PI + 0.3 * Math.sin(i)], [rT + 0.6, b.p[0] + (port[0] - b.p[0]) * 0.03, b.p[1] + (port[1] - b.p[1]) * 0.03, yawOut], [A("s7:berakhir") + i * 0.12, port[0], port[1], yawOut], [s8e, port[0], port[1], yawOut]], t0, A("s8:standar") + 0.6);
      // laid-up trawlers turn grey: jobs lost
      if (o.kind === "tr") { const gk = clamp01((t - A("s7:ribuan") - 0.2) / 0.8); o.B.children[0].material = gk > 0.5 ? M.grey : M.trawl; }
    });
    s7Arrows.forEach((a, i) => a.set((t - rT - i * 0.06) / 0.9, 1 - clamp01((t - A("s7:berakhir") - 0.8) / 0.6)));
    ISL6.forEach((f) => { const t0 = A("s6:dua") + 1.6 + f.i * 0.1; drive(f.o, t, [[t0, f.p[0], f.p[1], 0], [s8e, f.p[0], f.p[1], 0]], t0, s8e, 0.35); });
    vlab(portLab, A("s7:ribuan") - 0.4, K.s8 + 0.8);
    { const k = win(t, A("s8:standar") - 0.6, K.dur + 5, 0.5, 0.5); zeeLab.visible = k > 0.002; zeeLab.material.opacity = k; zeeLab.quaternion.copy(cam.quaternion); zeeLab.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s8:standar") + 0.6) / 0.5), 1.3))); }

    // ---- sparks and shock rings ----
    let pi = 0;
    for (const b of bursts) {
      const dt = t - b.tt, on = dt >= 0 && dt < 1.2;
      b.R.visible = on; if (on) { b.R.position.set(b.x, 0.14, b.z); b.R.scale.setScalar(0.6 + eout(dt / 0.8) * 5); b.R.material.opacity = (1 - clamp01(dt / 0.8)) * 0.95; }
      for (const p of b.P) {
        if (pi >= 240) break;
        const tt = dt - p[3];
        if (tt > 0 && tt < 0.9 && on) { SP.pos[pi * 3] = b.x + Math.cos(p[0]) * p[1] * tt; SP.pos[pi * 3 + 1] = b.y + p[2] * tt - 9 * tt * tt; SP.pos[pi * 3 + 2] = b.z + Math.sin(p[0]) * p[1] * tt; const k = 1 - tt / 0.9; SP.col[pi * 3] = k; SP.col[pi * 3 + 1] = 0.85 * k; SP.col[pi * 3 + 2] = 0.55 * k; }
        else { SP.pos[pi * 3 + 1] = -50; }
        pi++;
      }
    }
    SP.commit();

    // ---- camera ----
    const c = CAM(t);
    let shx = 0, shy = 0;
    for (const tt of [A("s5:tabrak") - 0.08, A("s6:diplomatik") + 0.15]) { const d = t - tt; if (d > 0 && d < 0.4) { const a = (1 - d / 0.4) * 0.35; shx += Math.sin(d * 90) * a; shy += Math.cos(d * 77) * a * 0.6; } }
    cam.position.set(c[0] + shx, c[1] + shy, c[2]); look.set(c[3] + shx * 0.5, c[4], c[5]); cam.lookAt(look);
    comp.render();
  };
}
