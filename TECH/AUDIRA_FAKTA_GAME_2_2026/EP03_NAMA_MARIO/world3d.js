// NAMA MARIO / COMICFORGE: one printed comic page laid flat in space, eight panel windows cut into it, each a little
// cel-shaded diorama behind the frame. The camera reads the page in comic order (left-right, top-down), pulling back
// over the gutters between panels. Ben-Day halftone shading, ink hulls, CMYK only. Original blocky hero, real people
// only as faceless silhouettes with name plates. No Nintendo characters, logos or assets. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, avatar, restPose, runPose } from "./lib3d.js";

// Canvas lettering needs the web fonts before the textures are painted.
try {
  await Promise.race([
    Promise.all(["64px Bangers", "700 40px Oswald", "600 40px Oswald"].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
} catch (e) { /* fall back to system fonts */ }

const P = { paper: "#FFF6E0", paperS: "#E6D3A6", ink: "#121014", cy: "#00A3E0", cyS: "#005E9E", mg: "#E5007D", mgS: "#8E0050", ye: "#FFE100", yeS: "#E39A00", red: "#ED1C24", sky: "#2B2E8C", pink: "#FF6FB0", con: "#B9C7D6", conS: "#56607A", skin: "#FFD3A8", skinS: "#D4875C", night: "#17153A" };
const BG = "Bangers, Impact, sans-serif", OS = "Oswald, sans-serif";
const PW = 17, PH = 30, GUT = 2.4, FY = -6, BACKZ = -12;
const PX = (i) => (i % 2 ? 1 : -1) * (PW + GUT) / 2, PY = (i) => -Math.floor(i / 2) * (PH + GUT);

// ---------- halftone cel shader + ink hulls (kit: lib/materials.ts, ported to plain three) ----------
const HT_V = `varying vec3 vN; varying vec3 vW;
void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`;
const HT_F = `uniform vec3 uColor; uniform vec3 uShade; uniform vec3 uLight; uniform float uDot; uniform float uSpec; varying vec3 vN; varying vec3 vW;
float dots(float cov){ vec2 p = gl_FragCoord.xy / uDot; p = mat2(0.7071,-0.7071,0.7071,0.7071) * p; vec2 g = fract(p) - 0.5; float r = sqrt(cov) * 0.62; return 1.0 - smoothstep(r - 0.07, r + 0.07, length(g)); }
void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; float ndl = dot(n, normalize(uLight));
 float lit = smoothstep(0.28,0.32,ndl); float mid = smoothstep(-0.22,-0.18,ndl);
 vec3 midCol = mix(uColor, uShade, dots(0.42));
 vec3 col = lit > 0.5 ? uColor : (mid > 0.5 ? midCol : mix(uShade, uShade*0.72, dots(0.35)));
 vec3 v = normalize(cameraPosition - vW); vec3 h = normalize(normalize(uLight) + v); col = mix(col, vec3(1.0), step(0.965, dot(n,h)) * uSpec);
 gl_FragColor = vec4(col,1.0);
 #include <colorspace_fragment>
}`;
const LIGHT = new THREE.Vector3(0.55, 0.75, 0.45).normalize();
const _ht = {};
function ht(c, s, spec = 0) {
  const k = c + "|" + s + "|" + spec;
  if (_ht[k]) return _ht[k];
  const col = new THREE.Color(c);
  const sh = s ? new THREE.Color(s) : col.clone().multiplyScalar(0.42);
  return (_ht[k] = new THREE.ShaderMaterial({ vertexShader: HT_V, fragmentShader: HT_F, uniforms: { uColor: { value: col }, uShade: { value: sh }, uLight: { value: LIGHT }, uDot: { value: 11 }, uSpec: { value: spec } } }));
}
const INKM = new THREE.MeshBasicMaterial({ color: P.ink, side: THREE.BackSide });
const RIMM = new THREE.MeshBasicMaterial({ color: P.paper, side: THREE.BackSide });
const _ol = {};
function outlineMat(th, col = P.ink) {
  const k = th + col;
  return (_ol[k] = _ol[k] || new THREE.ShaderMaterial({
    vertexShader: `uniform float uT; void main(){ vec3 p = position + normal * uT; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p,1.0); }`,
    fragmentShader: `uniform vec3 uInk; void main(){ gl_FragColor = vec4(uInk,1.0);\n#include <colorspace_fragment>\n}`,
    uniforms: { uT: { value: th }, uInk: { value: new THREE.Color(col) } }, side: THREE.BackSide,
  }));
}
function ink(m, th = 0.09, rim = false) {
  const g = m.geometry;
  let h;
  if (g.type === "BoxGeometry") {
    const p = g.parameters;
    h = new THREE.Mesh(g, rim ? RIMM : INKM);
    h.scale.set((p.width + 2 * th) / p.width, (p.height + 2 * th) / p.height, (p.depth + 2 * th) / p.depth);
  } else h = new THREE.Mesh(g, outlineMat(th, rim ? P.paper : P.ink));
  m.add(h);
  return m;
}
function B(w, h, d, c, x, y, z, par, th = 0.09, s) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ht(c, s));
  m.position.set(x, y, z); par.add(m); if (th) ink(m, th); return m;
}
function C(rt, rb, h, seg, c, x, y, z, par, th = 0.07) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), ht(c));
  m.position.set(x, y, z); par.add(m); if (th) ink(m, th); return m;
}
function plane(tex, w, h, x, y, z, par, ro = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, depthWrite: false, toneMapped: false }));
  m.position.set(x, y, z); m.renderOrder = ro; par.add(m); return m;
}

// ---------- canvas lettering ----------
function letter(g, txt, x, y, size, fill, o = {}) {
  const fam = o.fam || BG, wt = o.wt || "", maxW = o.maxW || 1e9;
  let s = size; const f = () => (g.font = `${wt}${s}px ${fam}`); f();
  while (g.measureText(txt).width > maxW && s > 10) { s -= 2; f(); }
  g.textAlign = o.align || "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  if (o.drop) { g.fillStyle = o.drop; g.fillText(txt, x + s * 0.07, y + s * 0.08); }
  const sw = o.sw ?? s * 0.14;
  if (sw > 0) { g.strokeStyle = o.stroke || P.ink; g.lineWidth = sw; g.strokeText(txt, x, y); }
  g.fillStyle = fill; g.fillText(txt, x, y);
}
function benday(g, x, y, w, h, dot, cell, cov) {
  g.fillStyle = dot;
  for (let j = 0; j < h / cell + 1; j++) for (let i = 0; i < w / cell + 1; i++) {
    const px = x + i * cell + (j % 2 ? cell / 2 : 0), py = y + j * cell;
    const r = cell * 0.5 * Math.sqrt(clamp01(cov((px - x) / w, (py - y) / h)));
    if (r < 0.5) continue;
    g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
  }
}
function rays(g, cx, cy, n, col, R = 2400) {
  g.fillStyle = col;
  for (let k = 0; k < n; k += 2) { const a0 = (k / n) * 6.2832, a1 = ((k + 1) / n) * 6.2832; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); g.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); g.closePath(); g.fill(); }
}
function star(g, cx, cy, ro, ri, n, rnd, jit = 0.22) {
  g.beginPath();
  for (let k = 0; k < n * 2; k++) { const a = (k / (n * 2)) * 6.2832 - 1.5708, r = (k % 2 ? ri : ro) * (1 - jit / 2 + rnd() * jit); const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r * 0.8; k ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath();
}
// Onomatopoeia burst: yellow star, red core, stroked lettering.
function burstTex(txt, seed, o = {}) {
  const r = mulberry(seed);
  return canvasTex(1024, 760, (g, w, h) => {
    g.lineJoin = "round";
    star(g, w / 2, h / 2, 420, 290, o.n || 14, r); g.fillStyle = o.out || P.ye; g.fill(); g.lineWidth = 22; g.strokeStyle = P.ink; g.stroke();
    star(g, w / 2, h / 2, 330, 220, o.n || 14, r); g.fillStyle = o.core || P.red; g.fill();
    if (txt) letter(g, txt, w / 2, h / 2 + 10, o.size || 230, o.fill || P.ye, { sw: 30, drop: P.ink, maxW: 760 });
  });
}
// Speech balloon, round or shouted (jagged).
function balloonTex(lines, o = {}) {
  const r = mulberry(o.seed || 7);
  return canvasTex(1024, 640, (g, w, h) => {
    g.lineJoin = "round"; g.lineWidth = 16; g.strokeStyle = P.ink; g.fillStyle = o.fill || "#fff";
    const cx = w / 2, cy = h * 0.42, rx = w * 0.45, ry = h * 0.36;
    const tail = o.tail === "r" ? [cx + 120, cy + ry - 30, cx + 300, h - 12, cx + 40, cy + ry - 10] : o.tail === "n" ? null : [cx - 120, cy + ry - 30, cx - 300, h - 12, cx - 40, cy + ry - 10];
    const tp = () => { g.beginPath(); g.moveTo(tail[0], tail[1]); g.lineTo(tail[2], tail[3]); g.lineTo(tail[4], tail[5]); g.closePath(); };
    if (tail) { tp(); g.fill(); g.stroke(); }
    if (o.shout) { g.save(); g.translate(cx, cy); g.scale(1, (ry + 20) / (rx * 0.8)); star(g, 0, 0, rx, rx - 70, 18, r, 0.16); g.restore(); } else { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); }
    g.fill(); g.stroke();
    if (tail) { tp(); g.fill(); }
    const ls = Array.isArray(lines) ? lines : [lines], sz = o.size || 150, lh = sz * 0.95;
    ls.forEach((l, i) => letter(g, l, cx, cy + (i - (ls.length - 1) / 2) * lh + 6, sz, o.color || P.ink, { sw: 0, maxW: rx * 1.6 }));
  });
}
// Name plate face: printed card with title and small subtitle.
function plateTex(title, sub, o = {}) {
  return canvasTex(1024, o.h || 300, (g, w, h) => {
    g.fillStyle = o.bg || P.paper; g.fillRect(0, 0, w, h);
    g.fillStyle = o.band || P.mg; g.fillRect(0, 0, 26, h); g.fillRect(w - 26, 0, 26, h);
    g.strokeStyle = P.ink; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    letter(g, title, w / 2, sub ? h * 0.42 : h * 0.52, o.size || 150, o.fg || P.ink, { sw: o.sw ?? 0, maxW: w - 110 });
    if (sub) letter(g, sub, w / 2, h * 0.8, o.subSize || 50, o.subFg || P.mgS, { fam: OS, wt: "700 ", sw: 0, maxW: w - 110 });
  });
}
// Printed board: box with a face texture on +z.
function board(tex, w, h, d, edge, x, y, z, par, th = 0.08) {
  const G = new THREE.Group(); G.position.set(x, y, z); par.add(G);
  const b = B(w, h, d, edge, 0, 0, 0, G, th);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); f.position.z = d / 2 + 0.012; G.add(f);
  return { G, b, f };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: P.sky, exp: 1, bloom: [0, 0.1, 1], shadow: false });
  r.toneMapping = THREE.NoToneMapping; bp.enabled = false;
  const rnd = mulberry(303);
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };

  // ---------- the page: newsprint gutters with ink borders around eight panel windows ----------
  const page = new THREE.Group(); scene.add(page);
  const gutM = ht(P.paper, P.paperS);
  const top = PH / 2 + GUT, bot = PY(7) - PH / 2 - GUT, W = 2 * PW + 3 * GUT;
  const bar = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), gutM); m.position.set(x, y, -0.6); page.add(m); };
  bar(GUT, top - bot, -W / 2 + GUT / 2, (top + bot) / 2); bar(GUT, top - bot, 0, (top + bot) / 2); bar(GUT, top - bot, W / 2 - GUT / 2, (top + bot) / 2);
  for (let row = 0; row <= 4; row++) bar(W, GUT, 0, PH / 2 + GUT / 2 - row * (PH + GUT));
  // page edge + masthead on the top margin
  const mast = plane(canvasTex(1024, 128, (g, w, h) => { letter(g, "AUDIRA COMICS  ·  FAKTA GAME #3  ·  NAMA SANG JAGOAN", w / 2, h / 2 + 4, 76, P.ink, { sw: 0, maxW: 1000 }); }), 30, 3.75, 0, top - GUT / 2, 0.02, page);
  mast.material.depthWrite = false;

  const panels = [];
  const BD = [];
  function panel(i, draw, floor) {
    const G = new THREE.Group(); G.position.set(PX(i), PY(i), 0); scene.add(G);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: canvasTex(680, 1200, draw), toneMapped: false })); bd.position.z = BACKZ; G.add(bd); BD.push(bd);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(PW, FY + PH / 2, -BACKZ), ht(floor)); fl.position.set(0, (FY - PH / 2) / 2, BACKZ / 2); G.add(fl);
    const wallM = new THREE.MeshBasicMaterial({ color: P.ink });
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, PH, -BACKZ), wallM); w.position.set(s * (PW / 2 + 0.15), 0, BACKZ / 2); G.add(w); }
    const tw = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.3, -BACKZ), wallM); tw.position.set(0, PH / 2 + 0.15, BACKZ / 2); G.add(tw);
    // ink frame, just inside the window
    const bm = new THREE.MeshBasicMaterial({ color: P.ink }), T = 0.55;
    [[PW, T, 0, PH / 2 - T / 2], [PW, T, 0, -PH / 2 + T / 2], [T, PH, -PW / 2 + T / 2, 0], [T, PH, PW / 2 - T / 2, 0]].forEach(([w, h, x, y]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.9), bm); m.position.set(x, y, -0.4); G.add(m); });
    panels.push(G);
    return G;
  }

  // ---------- characters ----------
  function hullAll(Av, rim) { const ms = []; Av.G.traverse((o) => { if (o.isMesh && o.geometry.type !== "PlaneGeometry") ms.push(o); }); ms.forEach((m) => ink(m, rim ? 0.075 : 0.07, rim)); }
  function hero(par, x, z, s) {
    const Av = avatar({ skin: P.skin, shirt: P.cy, pants: P.mg, make: (c) => ht(c) });
    hullAll(Av); Av.G.scale.setScalar(s); Av.G.position.set(x, FY, z); par.add(Av.G); return Av;
  }
  const SIL = new THREE.MeshBasicMaterial({ color: P.ink });
  function sil(par, x, z, s, hat) {
    const Av = avatar({ make: () => SIL, face: false });
    if (hat === "fedora") { const b = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 24), SIL); b.position.y = 1.25; Av.head.add(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.66, 0.62, 20), SIL); c.position.y = 1.58; Av.head.add(c); }
    if (hat === "cap") { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.42, 20), SIL); c.position.y = 1.32; Av.head.add(c); const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.7), SIL); b.position.set(0, 1.14, 0.75); Av.head.add(b); }
    hullAll(Av, true); Av.G.scale.setScalar(s); Av.G.position.set(x, FY, z); par.add(Av.G); return Av;
  }
  // Flip card: front shows the current name, back the previous one; rotates pi -> 0 after each switch.
  function flipCard(par, x, y, z, w, h, names) {
    const G = new THREE.Group(); G.position.set(x, y, z); par.add(G);
    B(w, h, 0.3, P.paper, 0, 0, 0, G, 0.1);
    const tx = names.map(([txt, bg, fg]) => canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = P.ink; g.lineWidth = 16; g.strokeRect(8, 8, W - 16, H - 16); benday(g, 0, 0, W, H, "rgba(18,16,20,.13)", 22, (u, v) => v * 0.5); letter(g, txt, W / 2, H / 2 + 8, H * 0.62, fg, { sw: H * 0.06, stroke: P.ink, maxW: W - 90, drop: P.ink }); }));
    const mk = (rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx[0], toneMapped: false })); m.position.z = rot ? -0.16 : 0.16; m.rotation.y = rot ? Math.PI : 0; G.add(m); return m; };
    const fr = mk(0), bk = mk(1);
    return {
      G, set(t, times) {
        let i = 0; for (let k = 1; k < times.length; k++) if (t >= times[k]) i = k;
        fr.material.map = tx[i]; bk.material.map = tx[Math.max(0, i - 1)];
        const u = i ? clamp01((t - times[i]) / 0.5) : 1;
        G.rotation.y = Math.PI * (1 - back(u, 1.6)) * (i % 2 ? 1 : -1);
      },
    };
  }
  const pop = (o, t, t0, s = 1, d = 0.34) => { const u = clamp01((t - t0) / d); o.visible = u > 0; o.scale.setScalar(Math.max(0.001, s * back(u, 2.4))); return u; };
  const popOut = (o, t, t0, t1, s = 1) => { const u = clamp01((t - t0) / 0.34), v = clamp01((t - t1) / 0.25); o.visible = u > 0 && v < 1; o.scale.setScalar(Math.max(0.001, s * back(u, 2.4) * (1 - eout(v)))); };

  // ====== P1 hook splash ======
  const g1 = panel(0, (g, w, h) => {
    g.fillStyle = P.ye; g.fillRect(0, 0, w, h); rays(g, w / 2, h * 0.6, 30, P.pink);
    benday(g, 0, 0, w, h, P.red, 24, (u, v) => Math.hypot(u - 0.5, (v - 0.6) * 0.6) * 1.5 - 0.1);
  }, P.mg);
  const bz1 = plane(burstTex("", 11, { n: 16 }), 15, 11.1, 0, 0.6, -10.5, g1);
  const crA = B(3.2, 3.2, 3.2, P.yeS, -5.2, FY + 1.6, -6, g1, 0.1, P.mgS), crB = B(2.4, 2.4, 2.4, P.yeS, -5.0, FY + 4.4, -6.4, g1, 0.1, P.mgS), crC = B(2.8, 2.8, 2.8, P.yeS, 5.4, FY + 1.4, -7, g1, 0.1, P.mgS);
  const stampT = canvasTex(512, 512, (g, w, h) => { g.strokeStyle = P.red; g.lineWidth = 22; g.strokeRect(40, 150, w - 80, 212); letter(g, "GUDANG", w / 2, h / 2 + 6, 120, P.red, { sw: 0 }); });
  [[crA, 3.2], [crB, 2.4], [crC, 2.8]].forEach(([c, s]) => { const m = plane(stampT, s * 0.9, s * 0.9, 0, 0, s / 2 + 0.02, c); m.rotation.z = -0.12; });
  const h1 = hero(g1, 0.4, -3.2, 1.55);
  const q1 = plane(balloonTex("?", { size: 380 }), 4.4, 2.75, 3.9, 3.3, -2.4, g1, 2);
  const badge = board(canvasTex(512, 512, (g, w, h) => { g.fillStyle = P.paper; g.fillRect(0, 0, w, h); g.fillStyle = P.mg; g.fillRect(0, 0, w, 150); letter(g, "AUDIRA", w / 2, 82, 120, "#fff", { sw: 12 }); letter(g, "COMICS", w / 2, 230, 110, P.ink, { sw: 0 }); letter(g, "No. 3", w / 2, 380, 120, P.red, { sw: 0 }); g.strokeStyle = P.ink; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); }), 2.6, 2.6, 0.2, P.paper, -5.6, 3.9, -2.0, g1);

  // ====== P2 arcade + name cards ======
  const g2 = panel(1, (g, w, h) => {
    g.fillStyle = P.sky; g.fillRect(0, 0, w, h);
    benday(g, 0, 0, w, h, P.mg, 26, (u, v) => v * 1.1 - 0.15);
    const rr = mulberry(21); g.fillStyle = P.ye; for (let k = 0; k < 16; k++) { star(g, rr() * w, rr() * h * 0.55, 16, 7, 5, rr, 0); g.fill(); }
  }, "#3D3FA8");
  const cab = new THREE.Group(); cab.position.set(-4.1, FY, -5); g2.add(cab);
  B(4.6, 8.4, 3.6, P.mg, 0, 4.2, 0, cab, 0.11);
  B(4.9, 1.5, 3.9, P.ye, 0, 9.1, 0.1, cab, 0.11);
  const marq = plane(canvasTex(1024, 300, (g, w, h) => { letter(g, "ARKADE · 1981", w / 2, h / 2 + 8, 190, P.red, { sw: 18, maxW: 940 }); }), 4.6, 1.35, 0, 9.1, 2.07, cab);
  B(4.6, 0.7, 1.8, P.cy, 0, 3.9, 2.2, cab, 0.08).rotation.x = 0.35;
  C(0.12, 0.12, 0.8, 10, P.ink, -0.9, 4.5, 2.3, cab, 0.04); C(0.28, 0.28, 0.4, 14, P.red, -0.9, 4.95, 2.3, cab, 0.05);
  [0.3, 1.1].forEach((x) => C(0.24, 0.24, 0.2, 14, P.ye, x, 4.32, 2.25, cab, 0.04));
  const pixA = [], mkPix = (fr) => canvasTex(160, 140, (g, w, h) => {
    g.fillStyle = "#08061a"; g.fillRect(0, 0, w, h);
    g.fillStyle = P.mg; [[0, 118, 160], [10, 88, 130], [20, 58, 140]].forEach(([x, y, l], k) => { for (let i = 0; i < l; i += 10) g.fillRect(x + i, y + ((i / 10) % 2) * (k % 2 ? 1 : -1), 9, 5); });
    g.fillStyle = P.cy; [[130, 60], [30, 90]].forEach(([x, y]) => { for (let j = 0; j < 28; j += 6) g.fillRect(x, y + j, 10, 3); });
    const hx = 30 + fr * 8; g.fillStyle = P.ye; g.fillRect(hx, 104, 10, 12); g.fillStyle = P.cy; g.fillRect(hx - 1, 100, 12, 5); g.fillStyle = "#fff"; g.font = "bold 18px monospace"; g.fillText("1981", 56, 22);
  });
  for (let k = 0; k < 4; k++) pixA.push(mkPix(k));
  pixA.forEach((t) => { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.15), new THREE.MeshBasicMaterial({ map: pixA[0], toneMapped: false })); scr.position.set(0, 6.5, 1.82); cab.add(scr);
  const b1981 = plane(burstTex("1981!", 22, { size: 250 }), 5.2, 3.85, -0.3, 4.6, -1.0, g2, 3);
  const h2 = hero(g2, 3.4, -2.6, 1.4);
  const card2 = flipCard(g2, 3.4, 3.7, -2.4, 6.2, 1.9, [["???", P.paper, P.ink], ["OSSAN", P.paper, P.mg], ["JUMPMAN", P.ye, P.red], ["MR. VIDEO", P.cy, "#fff"]]);
  const t2 = [-1, A("s2:Ossan"), A("s2:Jumpman"), A("s2:Mister")];

  // ====== P3 Mr. Video vanishes ======
  const g3 = panel(2, (g, w, h) => {
    g.fillStyle = P.mg; g.fillRect(0, 0, w, h); rays(g, w / 2, h * 0.5, 40, "rgba(255,246,224,.22)");
    benday(g, 0, 0, w, h, P.cy, 26, (u, v) => 0.75 - Math.hypot(u - 0.5, v - 0.5) * 1.3);
  }, P.cyS);
  const card3 = board(canvasTex(1024, 330, (g, w, h) => { g.fillStyle = P.cy; g.fillRect(0, 0, w, h); benday(g, 0, 0, w, h, P.cyS, 22, (u, v) => v * 0.6); g.strokeStyle = P.ink; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); letter(g, "MR. VIDEO", w / 2, h / 2 + 10, 210, "#fff", { sw: 22, drop: P.ink, maxW: 900 }); }), 9.4, 3.0, 0.4, P.cy, -0.6, 1.3, -5, g3, 0.12);
  const ghost3 = plane(canvasTex(1024, 330, (g, w, h) => { g.setLineDash([40, 26]); g.strokeStyle = P.paper; g.lineWidth = 14; g.strokeRect(12, 12, w - 24, h - 24); letter(g, "?", w / 2, h / 2 + 10, 230, P.paper, { sw: 0 }); }), 9.4, 3.0, -0.6, 1.3, -5, g3);
  const NP = 150, dotG = new THREE.CircleGeometry(0.2, 12), dotM = new THREE.MeshBasicMaterial({ toneMapped: false });
  const dots3 = new THREE.InstancedMesh(dotG, dotM, NP); dots3.frustumCulled = false; g3.add(dots3);
  const dd = []; for (let k = 0; k < NP; k++) { dd.push([(rnd() - 0.5) * 9, (rnd() - 0.5) * 3, rnd() * 6.283, 3 + rnd() * 7, 0.6 + rnd() * 1.4]); dots3.setColorAt(k, new THREE.Color([P.cy, P.paper, P.ink, P.ye][k % 4])); }
  const poof = plane(burstTex("POOF!", 33, { out: P.paper, core: P.cy, fill: P.ye }), 7.6, 5.6, -0.4, 1.6, -2.5, g3, 3);
  const miya = board(plateTex("SHIGERU MIYAMOTO", "PEMBUAT KARAKTER", { band: P.cy }), 5.2, 1.52, 0.25, P.paper, -4.6, FY + 1.5, -1.2, g3);
  C(0.1, 0.1, 1.4, 8, P.ink, -4.6, FY + 0.5, -1.35, g3, 0);
  const h3 = hero(g3, 4.8, -3.2, 1.25);
  const disc = new THREE.Object3D();

  // ====== P4 warehouse in Tukwila ======
  const g4 = panel(3, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, P.conS); gr.addColorStop(0.7, P.con); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    benday(g, 0, 0, w, h, "#3E4660", 22, (u, v) => 0.7 - v * 0.9);
    g.fillStyle = P.conS; const rr = mulberry(41); for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(rr() * w, 80 + rr() * 260, 120 + rr() * 90, 50 + rr() * 30, 0, 0, 7); g.fill(); }
    g.fillStyle = "#6E7A93"; for (let k = 0; k < 9; k++) { const x = k * 80 + rr() * 30; g.fillRect(x, h * 0.55 - rr() * 120, 60 + rr() * 30, 500); }
  }, P.conS);
  const wh = new THREE.Group(); wh.position.set(0.9, FY, -7.2); g4.add(wh);
  B(12.4, 5.8, 5.2, P.con, 0, 2.9, 0, wh, 0.12, P.conS);
  const rs = new THREE.Shape(); rs.moveTo(-6.6, 0); rs.lineTo(6.6, 0); rs.lineTo(0, 2.0); rs.closePath();
  const roofG = new THREE.ExtrudeGeometry(rs, { depth: 5.6, bevelEnabled: false }); roofG.translate(0, 0, -2.8); roofG.computeVertexNormals();
  const roof = new THREE.Mesh(roofG, ht(P.cy, P.cyS)); roof.position.y = 5.8; wh.add(roof); ink(roof, 0.1);
  const doorT = canvasTex(512, 480, (g, w, h) => { g.fillStyle = P.paperS; g.fillRect(0, 0, w, h); g.fillStyle = "#b8a77f"; for (let y = 0; y < h; y += 34) g.fillRect(0, y, w, 8); g.strokeStyle = P.ink; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); });
  plane(doorT, 4.6, 4.3, -2.6, 2.15, 2.62, wh);
  plane(doorT, 2.6, 4.3, 3.6, 2.15, 2.62, wh);
  const sign4 = board(canvasTex(1024, 220, (g, w, h) => { g.fillStyle = P.ye; g.fillRect(0, 0, w, h); g.strokeStyle = P.ink; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); letter(g, "GUDANG · TUKWILA 1981", w / 2, h / 2 + 8, 130, P.ink, { sw: 0, maxW: 960 }); }), 9.2, 1.98, 0.3, P.ye, 0, 5.05, 2.7, wh, 0.09);
  const disewa = plane(burstTex("DISEWA!", 44, { out: P.paper, core: P.mg, fill: P.ye, size: 200 }), 4.4, 3.27, -2.6, 2.6, 2.9, wh, 3);
  const pin = new THREE.Group(); pin.position.set(5.2, 4.6, -4.5); g4.add(pin);
  const pc = C(0.0, 0.62, 1.6, 20, P.mg, 0, 0.8, 0, pin, 0.07); pc.rotation.x = Math.PI;
  const ps = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 14), ht(P.mg)); ps.position.y = 1.95; pin.add(ps); ink(ps, 0.07);
  const pinL = board(plateTex("TUKWILA", "DEKAT SEATTLE", { band: P.mg, h: 300 }), 4.0, 1.17, 0.2, P.paper, 0, 3.5, 0, pin);
  const own = new THREE.Group(); own.position.set(4.6, FY, -1.6); g4.add(own);
  C(0.12, 0.12, 2.2, 8, P.ink, 0, 1.1, 0, own, 0);
  const ownT0 = plateTex("???", "PEMILIK GUDANG", { band: P.yeS }), ownT1 = plateTex("MARIO SEGALE", "PEMILIK GUDANG", { band: P.red });
  const ownB = board(ownT0, 5.4, 1.58, 0.25, P.paper, 0, 2.9, 0, own);
  const h4 = hero(g4, -5.6, -2.0, 1.15);
  const crate4 = B(1.6, 1.4, 1.4, P.yeS, 0, 3.0, 1.0, h4.G, 0.09, P.mgS);
  const NR = 80, rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1.3, 0.05), new THREE.MeshBasicMaterial({ color: P.paper, transparent: true, opacity: 0.55, toneMapped: false }), NR);
  rain.frustumCulled = false; g4.add(rain);
  const rd = []; for (let k = 0; k < NR; k++) rd.push([(rnd() - 0.5) * 16, rnd() * 22, -1 - rnd() * 10, 14 + rnd() * 6]);

  // ====== P5 version A ======
  const g5 = panel(4, (g, w, h) => {
    g.fillStyle = P.ye; g.fillRect(0, 0, w, h); rays(g, w / 2, h * 0.55, 34, "rgba(229,0,125,.35)");
    benday(g, 0, 0, w, h, P.red, 24, (u, v) => Math.hypot(u - 0.5, v - 0.55) * 1.6 - 0.15);
  }, P.mg);
  const doorF = new THREE.Group(); doorF.position.set(-6.4, FY, -6); g5.add(doorF);
  B(0.5, 7.0, 0.8, P.mgS, -1.5, 3.5, 0, doorF, 0.08); B(0.5, 7.0, 0.8, P.mgS, 1.5, 3.5, 0, doorF, 0.08); B(3.5, 0.5, 0.8, P.mgS, 0, 7.2, 0, doorF, 0.08);
  const leaf = new THREE.Group(); leaf.position.set(-1.25, 0, 0.2); doorF.add(leaf); B(2.5, 6.8, 0.2, P.paper, 1.25, 3.4, 0, leaf, 0.08, P.paperS);
  const book = new THREE.Group(); g5.add(book);
  const bookT = canvasTex(600, 800, (g, w, h) => {
    g.fillStyle = P.ink; g.fillRect(0, 0, w, h); const rr = mulberry(55);
    for (let k = 0; k < 60; k++) { g.fillStyle = [P.cy, P.mg, P.ye][k % 3]; g.fillRect(Math.floor(rr() * 12) * 50, 330 + Math.floor(rr() * 7) * 50, 46, 46); }
    letter(g, "GAME", w / 2, 120, 190, P.ye, { sw: 14 }); letter(g, "OVER", w / 2, 270, 190, P.red, { sw: 14 });
    g.fillStyle = P.paper; g.fillRect(0, h - 130, w, 130); letter(g, "DAVID SHEFF", w / 2, h - 64, 88, P.ink, { sw: 0, maxW: 540 });
  });
  B(4.4, 5.9, 0.8, P.paper, 0.06, 0, -0.05, book, 0.1, P.paperS);
  const bf = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5.87), new THREE.MeshBasicMaterial({ map: bookT, toneMapped: false })); bf.position.z = 0.42; book.add(bf);
  const segA = sil(g5, -4.0, -3.0, 1.3, "fedora");
  const plSeg = board(plateTex("MARIO SEGALE", "PEMILIK GUDANG", { band: P.red }), 4.6, 1.35, 0.22, P.paper, -4.1, FY + 0.85, -0.6, g5);
  const tok = plane(burstTex("TOK! TOK!", 66, { size: 190 }), 5.6, 4.15, -5.4, 2.3, -1.4, g5, 3);
  const bSewa = plane(balloonTex(["SEWA", "TELAT!"], { shout: true, size: 160, tail: "l", seed: 9 }), 5.6, 3.5, -3.0, 3.0, -2.0, g5, 4);
  const desk = B(5.0, 2.4, 2.2, P.cyS, 4.3, FY + 1.2, -1.6, g5, 0.1);
  const ara = sil(g5, 4.3, -3.8, 1.3);
  const plAra = board(plateTex("MINORU ARAKAWA", "PRESIDEN NINTENDO OF AMERICA", { band: P.cy, subSize: 40 }), 4.8, 1.4, 0.2, P.paper, 4.3, FY + 1.2, -0.38, g5);
  const bAra = plane(balloonTex(["#@%!"], { shout: true, size: 190, tail: "r", seed: 12, fill: P.paper }), 4.6, 2.9, 3.6, 3.3, -2.2, g5, 4);
  const grr = plane(burstTex("RIBUT!", 77, { size: 220, out: P.cy, core: P.mg }), 4.8, 3.56, 0.2, 0.6, -1.0, g5, 5);
  const h5 = hero(g5, 0, -2.4, 1.35);
  const card5 = flipCard(g5, 0, 3.6, -2.2, 6.2, 1.9, [["JUMPMAN", P.ye, P.red], ["MARIO", P.red, P.ye]]);
  const ting = plane(burstTex("", 88, { n: 12, out: P.paper, core: P.ye }), 9, 6.7, 0, 3.4, -4.5, g5, 1);

  // ====== P6 version B ======
  const g6 = panel(5, (g, w, h) => {
    g.fillStyle = P.cy; g.fillRect(0, 0, w, h); benday(g, 0, 0, w, h, P.ye, 26, (u, v) => 0.2 + v * 0.55);
    g.strokeStyle = "rgba(255,246,224,.5)"; g.lineWidth = 10; for (let k = 0; k < 6; k++) { g.beginPath(); for (let i = 0; i <= 12; i++) g.lineTo(i * w / 12, 120 + k * 180 + (i % 2 ? 40 : 0)); g.stroke(); }
  }, P.yeS);
  const skr = plane(burstTex("SKRRRT!", 99, { size: 210, out: P.mg, core: P.ink, fill: P.paper }), 9.2, 6.8, 0, 1.2, -1.0, g6, 6);
  const don = sil(g6, -4.6, -3.4, 1.3, "cap");
  const plDon = board(plateTex("DON JAMES", "MANTAN MANAJER GUDANG", { band: P.mg }), 4.6, 1.35, 0.22, P.paper, -4.6, FY + 0.85, -0.8, g6);
  const bLel = plane(balloonTex(["CUMA", "LELUCON!"], { size: 150, tail: "l", seed: 3 }), 5.6, 3.5, -2.6, 3.1, -2.4, g6, 4);
  const haha = plane(burstTex("HA HA!", 111, { size: 230, out: P.ye, core: P.mg }), 3.8, 2.8, -6.0, 1.0, -1.2, g6, 5);
  const off = new THREE.Group(); off.position.set(4.3, FY, -6.2); g6.add(off);
  B(5.2, 0.35, 2.6, P.mgS, 0, 2.6, 1.6, off, 0.08); B(0.35, 2.4, 2.2, P.mgS, -2.3, 1.2, 1.6, off, 0.06); B(0.35, 2.4, 2.2, P.mgS, 2.3, 1.2, 1.6, off, 0.06);
  const chair = new THREE.Group(); off.add(chair); chair.position.set(0, 0, -0.6);
  B(2.2, 0.35, 2.0, P.ink, 0, 1.9, 0, chair, 0.06, "#000"); B(2.2, 3.0, 0.35, P.ink, 0, 3.5, -0.9, chair, 0.06, "#000"); C(0.12, 0.12, 1.8, 8, P.conS, 0, 0.9, 0, chair, 0.04);
  const deskPl = board(plateTex("PEMILIK", "", { band: P.ye, size: 170 }), 2.8, 0.82, 0.3, P.paper, 0.6, 3.25, 2.3, off);
  const outline6 = plane(canvasTex(512, 900, (g, w, h) => { g.setLineDash([30, 20]); g.strokeStyle = P.paper; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, 170, 105, 0, 7); g.stroke(); g.strokeRect(w / 2 - 170, 300, 340, 380); letter(g, "?", w / 2, 175, 160, P.paper, { sw: 0 }); }), 3.2, 5.6, 0, 3.8, -1.2, off);
  const plNever = board(plateTex("TIDAK PERNAH BERTEMU", "", { band: P.ink, bg: P.ye, size: 110 }), 6.2, 1.2, 0.2, P.ye, 3.6, 3.6, -1.6, g6);
  const h6 = hero(g6, 0.6, -2.2, 1.2);
  const q6 = plane(balloonTex("?", { size: 380, tail: "l" }), 2.6, 1.62, 2.4, 2.0, -1.6, g6, 4);

  // ====== P7 quiet: out of the spotlight ======
  const g7 = panel(6, (g, w, h) => {
    g.fillStyle = P.night; g.fillRect(0, 0, w, h); benday(g, 0, 0, w, h, "#2C2A66", 24, (u, v) => 0.55 - v * 0.6);
    const rr = mulberry(77); g.fillStyle = P.paper; for (let k = 0; k < 26; k++) { g.beginPath(); g.arc(rr() * w, rr() * h * 0.55, 1.5 + rr() * 2.5, 0, 7); g.fill(); }
  }, "#2A2550");
  const coneM = new THREE.MeshBasicMaterial({ color: P.ye, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 3.4, 20, 32, 1, true), coneM); cone.position.set(0, FY + 10, -5.5); g7.add(cone);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), new THREE.MeshBasicMaterial({ color: "#7d6a2a", toneMapped: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, FY + 0.02, -5.5); g7.add(pool);
  const segQ = sil(g7, 0, -5.5, 1.3, "fedora");
  const hang = new THREE.Group(); hang.position.set(-4.4, 2.6, -3.2); g7.add(hang);
  [-1.4, 1.4].forEach((x) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 14, 0.05), new THREE.MeshBasicMaterial({ color: P.paperS })); s.position.set(x, 7.6, 0); hang.add(s); });
  const yrT0 = plateTex("2018", "", { band: P.cy, size: 190 }), yrT1 = plateTex("2018 · USIA 84", "", { band: P.cy, size: 140 });
  const yr = board(yrT0, 4.6, 1.35, 0.2, P.paper, 0, 0, 0, hang);
  const stool = new THREE.Group(); stool.position.set(4.5, FY, -2.8); g7.add(stool);
  C(1.1, 1.1, 0.3, 20, P.conS, 0, 1.8, 0, stool, 0.06); C(0.15, 0.15, 1.7, 8, P.conS, 0, 0.85, 0, stool, 0.04);
  const paper7 = board(canvasTex(700, 520, (g, w, h) => { g.fillStyle = P.paper; g.fillRect(0, 0, w, h); letter(g, "OBITUARI", w / 2, 70, 92, P.ink, { sw: 0 }); g.fillStyle = P.ink; g.fillRect(30, 118, w - 60, 6); letter(g, "MARIO SEGALE", w / 2, 175, 64, P.mgS, { sw: 0 }); letter(g, "2018 · USIA 84", w / 2, 245, 52, P.ink, { sw: 0, fam: OS, wt: "700 " }); g.fillStyle = "#b9ad8f"; for (let k = 0; k < 6; k++) g.fillRect(40, 300 + k * 32, w - 80 - (k % 2) * 90, 12); g.strokeStyle = P.ink; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }), 3.6, 2.67, 0.12, P.paper, 0, 2.05, 0, stool, 0.06);
  paper7.G.rotation.x = -0.95;
  const h7 = hero(g7, 6.0, -1.0, 0.95);

  // ====== P8 split vote ======
  const g8 = panel(7, (g, w, h) => {
    g.fillStyle = P.mg; g.fillRect(0, 0, w / 2, h); g.fillStyle = P.cy; g.fillRect(w / 2, 0, w / 2, h);
    benday(g, 0, 0, w / 2, h, P.mgS, 24, (u, v) => 0.2 + v * 0.5); benday(g, w / 2, 0, w / 2, h, P.cyS, 24, (u, v) => 0.2 + v * 0.5);
    g.fillStyle = P.ink; g.beginPath(); const xs = [w / 2 + 10, w / 2 - 40, w / 2 + 30, w / 2 - 30, w / 2 + 20, w / 2 - 10]; g.moveTo(w / 2 - 16, 0); xs.forEach((x, k) => g.lineTo(x - 16, (k + 1) * h / 6)); for (let k = xs.length - 1; k >= 0; k--) g.lineTo(xs[k] + 16, (k + 1) * h / 6); g.lineTo(w / 2 + 16, 0); g.fill();
  }, P.paper);
  const mast8 = board(canvasTex(1024, 190, (g, w, h) => { g.fillStyle = P.ye; g.fillRect(0, 0, w, h); g.strokeStyle = P.ink; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); letter(g, "AUDIRA COMICS", w / 2, h / 2 + 8, 150, P.red, { sw: 14, maxW: 960 }); }), 10.4, 1.93, 0.4, P.ye, 0, 3.7, -5.5, g8, 0.1);
  const pedA = new THREE.Group(); pedA.position.set(-4.5, FY, -4.6); g8.add(pedA);
  const pedB = new THREE.Group(); pedB.position.set(4.5, FY, -4.6); g8.add(pedB);
  B(3.6, 2.0, 3.0, P.paper, 0, 1.0, 0, pedA, 0.1, P.paperS); B(3.6, 2.0, 3.0, P.paper, 0, 1.0, 0, pedB, 0.1, P.paperS);
  plane(plateTex("VERSI A", "", { band: P.mg, size: 190 }), 3.4, 1.0, 0, 1.0, 1.52, pedA); plane(plateTex("VERSI B", "", { band: P.cy, size: 190 }), 3.4, 1.0, 0, 1.0, 1.52, pedB);
  const bk8 = new THREE.Group(); bk8.position.set(0, 3.9, 0); pedA.add(bk8); B(2.6, 3.5, 0.5, P.paper, 0, 0, 0, bk8, 0.08, P.paperS);
  const bk8f = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.48), new THREE.MeshBasicMaterial({ map: bookT, toneMapped: false })); bk8f.position.z = 0.26; bk8.add(bk8f);
  const ch8 = new THREE.Group(); ch8.position.set(0, 2.0, 0); pedB.add(ch8); ch8.scale.setScalar(0.8);
  B(2.2, 0.35, 2.0, P.ink, 0, 1.9, 0, ch8, 0.06, "#000"); B(2.2, 3.0, 0.35, P.ink, 0, 3.5, -0.9, ch8, 0.06, "#000"); C(0.12, 0.12, 1.8, 8, P.conS, 0, 0.9, 0, ch8, 0.04);
  const h8 = hero(g8, 0, -1.4, 1.3);
  const q8 = plane(balloonTex(["A", "ATAU B?"], { size: 150, tail: "l" }), 3.6, 2.25, 3.4, 1.5, -0.8, g8, 4);

  // ---------- camera: home framing per panel, pull back over the gutters between panels ----------
  const H = (i, o = {}) => { const x = PX(i), y = PY(i); return [x + (o.x || 0), y + 1.2 + (o.y || 0), 46 + (o.z || 0), x + (o.x || 0) * 0.55, y + 0.2 + (o.y || 0) * 0.6, -4]; };
  const mid = (a, b) => { const p = H(a), q = H(b); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 2, 70, (p[3] + q[3]) / 2, (p[4] + q[4]) / 2, -4]; };
  const tr = (i, t0, prevPose, nextPose) => [[t0 - 0.85, ...prevPose], [t0 - 0.1, ...mid(i - 1, i)], [t0 + 0.65, ...nextPose]];
  const keys = [
    [0, ...H(0, { z: -0.5, x: -0.5, y: 0.1 })], [K.s2 - 0.45, ...H(0, { z: -4, x: 0.5 })],
    [K.s2 + 0.1, ...mid(0, 1)], [K.s2 + 0.8, ...H(1, { x: -2.6, z: -3 })], [A("s2:1981"), ...H(1, { x: -2.2, z: -5 })], [A("s2:Ossan") - 0.6, ...H(1, { x: 1.4, z: -3 })], [K.s3 - 0.45, ...H(1, { x: 1.0, z: -6 })],
    [K.s3 + 0.1, ...mid(1, 2)], [K.s3 + 0.8, ...H(2, { z: -1 })], [A("s3:hilang") - 0.2, ...H(2, { z: -5 })], [K.s4 - 0.45, ...H(2, { z: -3, x: 0.8 })],
    [K.s4 + 0.1, ...mid(2, 3)], [K.s4 + 0.8, ...H(3, { z: 6, y: 0.6 })], [A("s4:Tukwila"), ...H(3, { z: 0, y: 0.8, x: -0.6 })], [A("s4:Mario") - 0.5, ...H(3, { x: 2.4, z: -5 })], [K.s5 - 0.45, ...H(3, { x: 2.8, z: -7 })],
    [K.s5 + 0.1, ...mid(3, 4)], [K.s5 + 0.8, ...H(4, { z: -9, y: 0.6 })], [A("s5:Segale") - 0.2, ...H(4, { z: -6, y: 0.4 })], [A("s5:Segale") + 0.6, ...H(4, { z: 0, x: -1 })], [A("s5:berdebat"), ...H(4, { z: -1, x: 0 })], [A("s5:Setelah"), ...H(4, { z: -2 })], [K.s6 - 0.45, ...H(4, { z: -6 })],
    [K.s6 + 0.1, ...mid(4, 5)], [K.s6 + 0.8, ...H(5, { z: 0 })], [A("s6:Don"), ...H(5, { x: -2.6, z: -4 })], [A("s6:lelucon") + 0.6, ...H(5, { x: -2.2, z: -6 })], [A("s6:tidak") - 0.2, ...H(5, { x: 2.6, z: -4 })], [K.s7 - 0.45, ...H(5, { x: 2.8, z: -7 })],
    [K.s7 + 0.1, ...mid(5, 6)], [K.s7 + 0.8, ...H(6, { z: 4 })], [A("s7:menghindari"), ...H(6, { z: -2, x: -0.6 })], [K.s8 - 0.45, ...H(6, { z: -5, x: -1.4 })],
    [K.s8 + 0.1, ...mid(6, 7)], [K.s8 + 0.8, ...H(7, { z: 1 })], [K.dur, ...H(7, { z: -4 })],
  ];
  const c0 = track(keys);
  const shakes = [[A("s3:hilang"), 0.5], [A("s5:berdebat"), 0.35], [A("s6:Tapi"), 0.7], [A("s5:Segale") + 0.15, 0.18], [A("s5:Segale") + 0.55, 0.18]];
  const dummy = new THREE.Object3D();
  const look = new THREE.Vector3();

  return (t) => {
    const p = c0(t);
    let sx = 0, sy = 0;
    shakes.forEach(([t0, a], k) => { const d = t - t0; if (d > 0 && d < 0.9) { const e = a * Math.exp(-d * 6); sx += e * Math.sin(d * 57 + k); sy += e * Math.cos(d * 43 + k * 2); } });
    cam.position.set(p[0] + sx, p[1] + sy, p[2]); look.set(p[3] + sx * 0.6, p[4] + sy * 0.6, p[5]); cam.lookAt(look);

    // P1
    bz1.scale.setScalar(1 + Math.sin(t * 3.2) * 0.025); bz1.rotation.z = Math.sin(t * 0.7) * 0.05;
    restPose(h1); h1.armL.rotation.z = -0.55 - Math.sin(t * 2.4) * 0.08; h1.armR.rotation.z = 2.5 + Math.sin(t * 5) * 0.12; h1.head.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.06;
    h1.G.position.y = FY + Math.abs(Math.sin(t * 2.4)) * 0.18; h1.G.rotation.y = -0.25;
    q1.scale.setScalar(1 + Math.sin(t * 4) * 0.04); q1.position.y = 3.3 + Math.sin(t * 2) * 0.12;
    badge.G.rotation.z = 0.12 + Math.sin(t * 1.3) * 0.03;

    // P2
    scr.material.map = pixA[Math.floor(t * 4) % 4];
    popOut(b1981, t, A("s2:1981") - 0.1, A("s2:Ossan") - 0.3, 1);
    card2.set(t, t2);
    restPose(h2); h2.G.rotation.y = -0.35;
    const jmp = clamp01((t - A("s2:Jumpman")) / 0.7);
    h2.G.position.y = FY + (jmp > 0 && jmp < 1 ? Math.sin(jmp * Math.PI) * 2.2 : 0);
    if (jmp > 0 && jmp < 1) { h2.armL.rotation.z = -2.4; h2.armR.rotation.z = 2.4; h2.legL.rotation.x = -0.6; h2.legR.rotation.x = 0.3; }
    else if (t > A("s2:Mister")) { h2.armR.rotation.z = 2.6; h2.armL.rotation.z = -0.4; }
    else if (t > A("s2:Ossan") && t < A("s2:Jumpman")) { h2.armL.rotation.z = -0.25; h2.armR.rotation.z = 0.25; h2.head.rotation.x = 0.18; }
    else h2.armR.rotation.z = 0.15 + Math.sin(t * 3) * 0.08;
    card2.G.position.y = 3.7 + (jmp > 0 && jmp < 1 ? Math.sin(jmp * Math.PI) * 2.2 : 0) + Math.sin(t * 2.2) * 0.08;

    // P3
    const tH = A("s3:hilang");
    const vis3 = t < tH + 0.05;
    card3.G.visible = vis3; ghost3.visible = !vis3;
    const wob = clamp01((t - A("s3:kalau")) / 2.0);
    card3.G.rotation.z = Math.sin(t * 9) * 0.05 * wob; card3.G.position.y = 1.3 + Math.sin(t * 2) * 0.1;
    ghost3.material.opacity = 0.5 + 0.3 * Math.sin(t * 3);
    for (let k = 0; k < NP; k++) {
      const [x0, y0, a, sp, s] = dd[k], u = clamp01((t - tH) / 1.6);
      if (u <= 0 || u >= 1) { disc.position.set(0, -60, 0); disc.scale.setScalar(0.001); }
      else { disc.position.set(-0.6 + x0 + Math.cos(a) * sp * eout(u), 1.3 + y0 + Math.sin(a) * sp * eout(u) - u * u * 3, -5 + (k % 5) * 0.3 + 0.3); disc.scale.setScalar(s * (1 - u)); }
      disc.updateMatrix(); dots3.setMatrixAt(k, disc.matrix);
    }
    dots3.instanceMatrix.needsUpdate = true; if (dots3.instanceColor) dots3.instanceColor.needsUpdate = true;
    popOut(poof, t, tH - 0.05, tH + 1.4, 1);
    pop(miya.G, t, K.s3 + 0.3, 1);
    restPose(h3); h3.G.rotation.y = -0.6; h3.head.rotation.x = -0.25;
    const st3 = clamp01((t - tH) / 0.5);
    if (t > tH) { h3.armL.rotation.z = -2.3; h3.armR.rotation.z = 2.3; h3.G.position.x = 4.8 + eout(st3) * 0.8; h3.G.position.y = FY + Math.sin(st3 * Math.PI) * 0.8; }
    else { h3.G.position.x = 4.8; h3.G.position.y = FY; }

    // P4
    for (let k = 0; k < NR; k++) { const [x, y0, z, v] = rd[k]; const y = 14 - ((y0 + t * v) % 22); dummy.position.set(x - (y - 14) * 0.08, y, z); dummy.rotation.set(0, 0, 0.08); dummy.scale.setScalar(1); dummy.updateMatrix(); rain.setMatrixAt(k, dummy.matrix); }
    rain.instanceMatrix.needsUpdate = true;
    popOut(disewa, t, A("s4:menyewa"), A("s4:Tukwila") + 1.2, 1);
    const pu = pop(pin, t, A("s4:Tukwila") - 0.1, 1); pin.position.y = 4.6 + (1 - eout(pu)) * 4 + Math.sin(t * 2.4) * 0.12;
    pinL.G.visible = t > A("s4:Seattle") - 0.1; pinL.G.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s4:Seattle") + 0.1) / 0.3), 2.2)));
    pop(own, t, A("s4:Pemiliknya"), 1);
    const nameU = clamp01((t - A("s4:Mario") + 0.05) / 0.3);
    ownB.f.material.map = nameU > 0 ? ownT1 : ownT0; ownB.G.scale.setScalar(nameU > 0 && nameU < 1 ? 1 + Math.sin(nameU * Math.PI) * 0.25 : 1);
    const wk = clamp01((t - K.s4 - 0.3) / 3.2);
    h4.G.position.x = -9.0 + eout(wk) * 2.0; h4.G.rotation.y = wk < 1 ? 0.9 : 0.25;
    restPose(h4); if (wk > 0 && wk < 1) runPose(h4, t * 9, 0.6); h4.armL.rotation.x = -1.3; h4.armR.rotation.x = -1.3;
    if (t > A("s4:Mario")) h4.head.rotation.y = 0.7;

    // P5
    const tS = A("s5:Segale"), tB = A("s5:berdebat"), tSet = A("s5:Setelah");
    const gone = eout(clamp01((t - tSet) / 0.45));
    const bin = clamp01((t - K.s5 - 0.2) / 0.5), bmv = eout(clamp01((t - tS + 0.4) / 0.9));
    book.position.set(-0.4 + bmv * 6.0, -0.2 + bmv * (FY + 3.75 + 0.2), 1.5 - bmv * 3.1); book.visible = bin > 0 && gone < 1;
    book.scale.setScalar(Math.max(0.001, back(bin, 1.8)) * (1 - bmv * 0.62) * (1 - gone)); book.rotation.set(-0.05, Math.sin(t * 1.2) * 0.12 * (1 - bmv) - bmv * 0.35, -0.08 + bmv * 0.08);
    leaf.rotation.y = -1.3 * ramp(t, tS - 0.6, tS);
    const ent = eout(clamp01((t - tS + 0.6) / 1.0));
    segA.G.visible = ent > 0 && gone < 1; segA.G.position.x = -7.4 + ent * 3.4; segA.G.scale.setScalar(Math.max(0.001, 1.3 * (1 - gone)));
    restPose(segA); if (ent < 1) runPose(segA, t * 8, 0.6);
    const knock = t > tS && t < tS + 1.0; if (knock) { segA.armL.rotation.x = -1.6 + Math.abs(Math.sin((t - tS) * 14)) * 0.5; segA.G.rotation.y = -0.9; } else segA.G.rotation.y = 0.5;
    plSeg.G.visible = ent > 0.9 && gone < 1; plSeg.G.scale.setScalar(Math.max(0.001, 1 - gone));
    popOut(tok, t, tS + 0.05, tS + 1.6, 1);
    popOut(bSewa, t, A("s5:telat") - 0.15, tB + 1.6, 1);
    const arg = t > tB && t < tSet ? 1 : 0;
    const jit = arg * Math.sin(t * 38) * 0.08;
    segA.G.position.x += jit; ara.G.position.x = 4.3 - jit;
    ara.G.scale.setScalar(Math.max(0.001, 1.3 * (1 - gone))); ara.G.visible = gone < 1; ara.G.rotation.y = -0.5;
    restPose(ara); if (arg) { ara.armR.rotation.z = 2.2 + Math.sin(t * 12) * 0.3; segA.armR.rotation.z = 1.6 + Math.sin(t * 11) * 0.3; }
    plAra.G.visible = gone < 1; plAra.G.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s5:Minoru") + 0.1) / 0.3), 2.2) * (1 - gone)));
    desk.visible = gone < 1; desk.scale.setScalar(Math.max(0.001, 1 - gone));
    popOut(bAra, t, tB + 0.35, tSet, 1);
    popOut(grr, t, tB, tSet - 0.1, 1); grr.rotation.z = Math.sin(t * 20) * 0.06;
    const hin = clamp01((t - tSet - 0.2) / 0.55);
    h5.G.visible = hin > 0; h5.G.position.y = FY + (1 - eout(hin)) * 12; restPose(h5); h5.G.rotation.y = 0;
    card5.G.visible = hin > 0; card5.G.position.y = 3.6 + (1 - eout(hin)) * 12;
    card5.set(t, [-1, A("s5:Mario") - 0.05]);
    const tM = A("s5:Mario");
    if (t > tM) { h5.armL.rotation.z = -2.5; h5.armR.rotation.z = 2.5; }
    const tu = clamp01((t - tM) / 0.4); ting.visible = tu > 0; ting.scale.setScalar(Math.max(0.001, back(tu, 2))); ting.rotation.z = t * 0.4;

    // P6
    const tT = A("s6:Tapi");
    popOut(skr, t, tT - 0.05, tT + 1.8, 1); skr.rotation.z = -0.08 + Math.sin(t * 25) * 0.03 * (t < tT + 1.8 ? 1 : 0);
    const dIn = pop(don.G, t, A("s6:Don") - 0.15, 1.3); restPose(don); don.G.rotation.y = 0.45;
    pop(plDon.G, t, A("s6:Don"), 1);
    const tL = A("s6:lelucon");
    popOut(bLel, t, tL - 0.1, A("s6:tidak") - 0.4, 1);
    popOut(haha, t, tL + 0.45, tL + 2.6, 1);
    if (t > tL && t < tL + 2.4) { don.armR.rotation.z = 0.4; don.armL.rotation.z = -0.4; don.G.position.y = FY + Math.abs(Math.sin(t * 14)) * 0.15; } else don.G.position.y = FY;
    const tN = A("s6:tidak");
    const ou = clamp01((t - tN) / 0.6); outline6.visible = ou > 0; outline6.material.opacity = ou * (0.75 + 0.25 * Math.sin(t * 4));
    pop(plNever.G, t, A("s6:pernah"), 1);
    restPose(h6); h6.G.rotation.y = t > A("s6:Segale") ? 0.9 : -0.5; h6.head.rotation.y = t > A("s6:Segale") ? 0.3 : -0.3;
    if (t > tN) { h6.armR.rotation.z = 2.7; h6.armR.rotation.x = -0.4; }
    popOut(q6, t, tN + 0.3, K.s7 + 0.5, 1);

    // P7
    const tE = A("s7:menghindari");
    const wa = clamp01((t - tE) / 2.6);
    segQ.G.position.x = -eout(wa) * 6.8; segQ.G.position.z = -5.5 - wa * 1.2; restPose(segQ);
    segQ.G.rotation.y = wa > 0 && wa < 1 ? -Math.PI / 2 : wa >= 1 ? -2.6 : 0.15;
    if (wa > 0 && wa < 1) runPose(segQ, t * 6, 0.45);
    coneM.opacity = 0.16 + 0.02 * Math.sin(t * 3);
    const yu = pop(hang, t, A("s7:2018") - 0.1, 1); hang.position.y = 2.6 + (1 - eout(yu)) * 8 + Math.sin(t * 1.5) * 0.08; hang.rotation.z = Math.sin(t * 1.3) * 0.03;
    yr.f.material.map = t > A("s7:delapan") ? yrT1 : yrT0;
    pop(paper7.G, t, A("s7:obituarinya") - 0.1, 1);
    restPose(h7); h7.G.rotation.y = -0.7; h7.head.rotation.x = 0.25;

    // P8
    const tK = A("s8:Kamu");
    const sel = t > tK ? Math.floor((t - tK) * 1.6) % 2 : -1;
    pedA.position.y = FY + (sel === 0 ? 0.35 : 0); pedB.position.y = FY + (sel === 1 ? 0.35 : 0);
    bk8.rotation.y = Math.sin(t * 1.4) * 0.4; ch8.rotation.y = t * 0.8;
    restPose(h8); h8.head.rotation.y = sel === 0 ? -0.6 : sel === 1 ? 0.6 : Math.sin(t * 2) * 0.4; h8.armL.rotation.z = -2.5; h8.G.rotation.y = 0;
    pop(q8, t, tK - 0.1, 1);
    mast8.G.rotation.z = Math.sin(t * 1.1) * 0.02;

    comp.render();
  };
}
