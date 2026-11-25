// EP06 AIR CONDITIONER (PAPERWORLD), rebuild r13: a warm, airy cut-paper world with one guide, a chibi paper girl in a
// coral coat, who walks through three sets. Every machine part is layered card, folded strip, bellows or printed straw.
//   SHOP  x=-40  Brooklyn print shop 1902: backlit arched windows, hanging prints that swell in damp air, a print on an
//                easel that slides out of register, the first machine (mint cabinet, copper coil, fan, bellows duct)
//                and Willis Carrier as a generic chibi figure
//   HOUSE x=0    cutaway bedroom with a split unit whose front card lifts (ice fins, copper straws, drops), a bellows
//                drain hose down the brick wall into a potted plant, copper straws up to the roof unit (fan, door that
//                folds open on the compressor, inverter dial)
//   STAGE x=40   sunburst backdrop, 1 PK hang tag, 750 W block next to a 3.47-block heat column
// Generic products only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  ivory: "#f3ead9", ivoryL: "#faf4e8", ivoryS: "#e5d8c1", coral: "#e3806a", coralD: "#c4614f", coralL: "#f0a892",
  mint: "#9dd1bb", mintD: "#6eaa93", mintL: "#cbe8da", gold: "#e7b54a", goldD: "#c38f2b", goldL: "#f2d58e",
  cobalt: "#5f7cb6", cobaltD: "#435e95", cobaltL: "#9eb2da", brown: "#7d5843", brownD: "#523729", brownL: "#ae8a70",
  skin: "#f3d6bf", ink: "#3b2a22", ice: "#c6ecf7", iceD: "#86c9e2", copper: "#c97a45", red: "#d9533c", orange: "#ee8a3a",
};
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Warm documentary paper grade: lifted warm shadows, cream highlights, gentle saturation, cut flash.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(1.04,1.0,0.92),0.6);c+=vec3(0.035,0.022,0.012)*(1.0-l);
  c=mix(vec3(l),c,1.08);c=(c-0.5)*1.08+0.5;c=mix(c,vec3(1.0,0.97,0.9),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- paper stock ----------
let GR = null;
function grain() {
  if (GR) return GR;
  const mk = (seed, bump) => {
    const R = mulberry(seed);
    const tx = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = bump ? "#808080" : "#f2f2f2"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        const x = R() * w, y = R() * h, r = 12 + R() * 46, a = bump ? 0.035 : 0.026;
        const c = R() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 1.6})`;
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r); }
      }
      g.lineCap = "round";
      for (let i = 0; i < 1800; i++) {
        const x = R() * w, y = R() * h, l = 4 + R() * R() * 28, an = R() * 6.28, al = (bump ? 0.34 : 0.2) * (0.4 + R());
        g.strokeStyle = R() < 0.6 ? `rgba(255,255,255,${al})` : `rgba(0,0,0,${al * 0.8})`; g.lineWidth = 0.6 + R();
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an) * l * 0.5 + (R() - 0.5) * 6, y + Math.sin(an) * l * 0.5 + (R() - 0.5) * 6, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
      }
    }, [0.4, 0.4]);
    if (bump) tx.colorSpace = THREE.NoColorSpace;
    return tx;
  };
  GR = { a: mk(7, false), b: mk(19, true) };
  return GR;
}
const MC = new Map();
function pm(color, { rough = 0.92, emi = null, ei = 0, ds = false, flat = false, unique = false } = {}) {
  const k = [color, rough, emi, ei, ds, flat].join("|");
  if (!unique && MC.has(k)) return MC.get(k);
  const G = grain();
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), map: flat ? null : G.a, bumpMap: flat ? null : G.b, bumpScale: 1.3, roughness: rough, metalness: 0, side: ds ? THREE.DoubleSide : THREE.FrontSide });
  if (emi) { m.emissive = new THREE.Color(emi); m.emissiveIntensity = ei; }
  if (!unique) MC.set(k, m);
  return m;
}
const edgeOf = (c) => "#" + new THREE.Color(c).lerp(new THREE.Color(0xfff8ec), 0.5).getHexString();
const S = {
  rect: (w, h, cx = 0, cy = 0) => { const s = new THREE.Shape(); s.moveTo(cx - w / 2, cy - h / 2); s.lineTo(cx + w / 2, cy - h / 2); s.lineTo(cx + w / 2, cy + h / 2); s.lineTo(cx - w / 2, cy + h / 2); s.closePath(); return s; },
  rrect: (w, h, r, cx = 0, cy = 0) => { const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; },
  circle: (r, cx = 0, cy = 0) => { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; },
  arch: (w, h, cx = 0, by = 0) => { const s = new THREE.Shape(); s.moveTo(cx - w / 2, by); s.lineTo(cx + w / 2, by); s.lineTo(cx + w / 2, by + h - w / 2); s.absarc(cx, by + h - w / 2, w / 2, 0, Math.PI, false); s.closePath(); return s; },
  poly: (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; },
  drop: (r) => { const s = new THREE.Shape(); s.moveTo(0, r * 2.1); s.quadraticCurveTo(r * 1.05, r * 0.6, r, 0); s.absarc(0, 0, r, 0, -Math.PI, true); s.quadraticCurveTo(-r * 1.05, r * 0.6, 0, r * 2.1); return s; },
};
function holes(shape, ...hs) { for (const h of hs) { const p = new THREE.Path(); p.setFromPoints(h.getPoints(32)); shape.holes.push(p); } return shape; }
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function cut(shape, color, parent, x = 0, y = 0, z = 0, d = 0.05, o = {}) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 28 }); geo.translate(0, 0, -d / 2);
  const m = mesh(geo, [o.mat || pm(color, o), pm(o.edge || edgeOf(color), { flat: true })], parent, x, y, z);
  return m;
}
const card = (w, h, color, parent, x, y, z, d = 0.05, o) => cut(S.rect(w, h), color, parent, x, y, z, d, o);
const pbox = (w, h, d, color, parent, x, y, z, o) => mesh(new THREE.BoxGeometry(w, h, d), pm(color, o), parent, x, y, z);
const pcyl = (rt, rb, h, color, parent, x, y, z, seg = 32, o) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), pm(color, o), parent, x, y, z);
function inkTex(w, h, draw, bg = null) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } draw(g, w, h); }); }
// Printed text on a plane, lit like the paper it sits on.
function print(tex, w, h, parent, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, depthWrite: false, emissive: o.emi ? new THREE.Color(o.emi) : new THREE.Color(0), emissiveMap: o.emi ? tex : null, emissiveIntensity: o.ei || 0, side: o.ds ? THREE.DoubleSide : THREE.FrontSide }));
  m.position.set(x, y, z); m.renderOrder = 2; if (parent) parent.add(m); return m;
}
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };

// ---------- moving paper ribbons (air) ----------
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _T = new THREE.Vector3(), _s = new THREE.Vector3(), _n = new THREE.Vector3(), _Z = new THREE.Vector3(0, 0, 1), _Y = new THREE.Vector3(0, 1, 0);
function ribbon(parent, path, { color, width = 0.12, len = 0.4, n = 30, speed = 0.3, phase = 0, twist = 0.6, ref = _Z }) {
  const pos = new Float32Array((n + 1) * 6), geo = new THREE.BufferGeometry(), idx = [];
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const m = new THREE.Mesh(geo, pm(color, { ds: true, flat: true, rough: 0.85 })); m.frustumCulled = false; m.castShadow = true; parent.add(m);
  return (t, amt) => {
    if (amt <= 0.01) { m.visible = false; return; }
    m.visible = true;
    const head = ((t * speed + phase) % 1 + 1) % 1 * (1 + len);
    for (let i = 0; i <= n; i++) {
      const u = head - len + (len * i) / n, uc = Math.min(1, Math.max(0, u));
      path(Math.max(0, uc - 0.01), t, _a); path(Math.min(1, uc + 0.01), t, _b); _T.subVectors(_b, _a).normalize();
      path(uc, t, _a);
      _s.crossVectors(_T, ref); if (_s.lengthSq() < 1e-6) _s.crossVectors(_T, _Y); _s.normalize(); _n.crossVectors(_s, _T);
      const th = twist * Math.sin(u * 9 + t * 2 + phase * 6);
      const w = (u < 0 || u > 1 ? 0 : 1) * width * amt * Math.sin((Math.PI * i) / n) * 0.5;
      const sx = (_s.x * Math.cos(th) + _n.x * Math.sin(th)) * w, sy = (_s.y * Math.cos(th) + _n.y * Math.sin(th)) * w, sz = (_s.z * Math.cos(th) + _n.z * Math.sin(th)) * w;
      pos.set([_a.x + sx, _a.y + sy, _a.z + sz, _a.x - sx, _a.y - sy, _a.z - sz], i * 6);
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  };
}
const curve = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.5);
// a path along a curve with a travelling wave on one axis
const wavy = (cv, amp, ax = "y", k = 10, w = 3, ph = 0) => (u, t, o) => { cv.getPoint(u, o); o[ax] += amp * Math.sin(u * k - t * w + ph) * Math.sin(Math.PI * u); return o; };

// ---------- flow arrows riding a pipe ----------
function arrows(parent, cv, n, color, r) {
  const geo = new THREE.ConeGeometry(r, r * 2.4, 10); geo.rotateX(Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, pm(color, { flat: true, rough: 0.7, emi: color, ei: 0.25 }), n); im.frustumCulled = false; im.castShadow = true; parent.add(im);
  const o = new THREE.Object3D(), tg = new THREE.Vector3();
  return (t, amt, speed = 0.12, dir = 1) => {
    im.visible = amt > 0.01;
    for (let i = 0; i < n; i++) {
      let u = ((i / n + dir * t * speed) % 1 + 1) % 1;
      cv.getPoint(u, o.position); cv.getTangent(u, tg); if (dir < 0) tg.negate();
      o.lookAt(o.position.x + tg.x, o.position.y + tg.y, o.position.z + tg.z);
      o.scale.setScalar(Math.max(0.001, amt * Math.min(1, Math.sin(Math.PI * u) * 4))); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  };
}

const REAMC = ["#f6efe0", "#c9a47a", "#cfe0ea"];
function ream(parent, x, y, z, c, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); pbox(0.86, 0.11, 0.58, c, g, 0, -0.01, 0); pbox(0.8, 0.03, 0.54, "#fffaf0", g, 0.02, 0.055, 0.01, { flat: true }); card(0.86, 0.012, edgeOf(c), g, 0, 0.03, 0.292, 0.004); return g; }
// ---------- backdrop pieces ----------
function bush(parent, x, z, s, c1, c2, seed) {
  const R = mulberry(seed), g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  for (let i = 0; i < 4; i++) cut(S.circle(0.28 + R() * 0.16), i % 2 ? c1 : c2, g, (R() - 0.5) * 0.7, 0.2 + R() * 0.2, (i - 2) * 0.05, 0.05);
  return g;
}
function tree(parent, x, z, h, c1, c2, trunk = P.brown) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  card(0.14, h * 0.5, trunk, g, 0, h * 0.25, 0, 0.06);
  cut(S.circle(h * 0.28), c1, g, 0, h * 0.62, 0.05, 0.06); cut(S.circle(h * 0.2), c2, g, h * 0.16, h * 0.5, 0.1, 0.06); cut(S.circle(h * 0.18), c2, g, -h * 0.15, h * 0.72, 0.1, 0.06);
  return g;
}
function cloud(parent, x, y, z, s, c = P.ivoryL) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  cut(S.circle(0.5), c, g, 0, 0, 0, 0.06); cut(S.circle(0.38), c, g, -0.55, -0.12, 0.02, 0.06); cut(S.circle(0.4), c, g, 0.55, -0.1, 0.02, 0.06); card(1.7, 0.36, c, g, 0, -0.32, 0.03, 0.06);
  const th = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 6, 4), pm(P.ink, { flat: true })); th.position.y = 3.3; g.add(th);
  return g;
}
const planks = (base, line) => canvasTex(512, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.05)"; g.fillRect(0, i * 64, w, 64); g.fillStyle = line; g.fillRect(0, i * 64, w, 3); g.fillRect(((i * 197) % 400) + 40, i * 64, 3, 64); } }, [3, 3]);

// ---------- rebuild r13: helpers ----------
const SX = -40, HX = 0, TX = 40; // shop 1902, house today, chart stage
// A zig-zag folded strip (real fold geometry), double sided paper.
function accordion(w, h, n, amp, color, parent, x, y, z) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) { const xx = -w / 2 + (w * i) / n, zz = (i % 2) * amp; pos.push(xx, -h / 2, zz, xx, h / 2, zz); uv.push(i / n, 0, i / n, 1); }
  for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return mesh(g, pm(color, { ds: true }), parent, x, y, z);
}
// Corrugated paper tube along a curve: alternating rings read as a folded bellows.
function bellows(parent, cv, n, r, cA, cB) {
  const geo = new THREE.CylinderGeometry(r, r, 1, 20, 1, true); geo.rotateX(Math.PI / 2);
  const ms = [cA, cB].map((c) => { const im = new THREE.InstancedMesh(geo, pm(c, { ds: true }), Math.ceil(n / 2)); im.castShadow = im.receiveShadow = true; parent.add(im); return im; });
  const o = new THREE.Object3D(), tg = new THREE.Vector3(), L = cv.getLength() / n;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n; cv.getPointAt(u, o.position); cv.getTangentAt(u, tg);
    o.lookAt(o.position.x + tg.x, o.position.y + tg.y, o.position.z + tg.z);
    const big = i % 2 === 0; o.scale.set(big ? 1.12 : 1, big ? 1.12 : 1, L * 1.02); o.updateMatrix();
    ms[i % 2].setMatrixAt(i >> 1, o.matrix);
  }
  ms.forEach((m) => (m.instanceMatrix.needsUpdate = true));
}
// Paper straw: a tube with printed diagonal bands (copper pipes, hoses).
const STRAW = new Map();
function strawMat(c1, c2, rep) {
  const k = c1 + c2 + rep; if (STRAW.has(k)) return STRAW.get(k);
  const tx = canvasTex(128, 128, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 48, 0); g.lineTo(i * 48 + 22, 0); g.lineTo(i * 48 + 22 + 64, h); g.lineTo(i * 48 + 64, h); g.fill(); } }, [rep, 1]);
  const m = new THREE.MeshStandardMaterial({ map: tx, bumpMap: grain().b, bumpScale: 1.0, roughness: 0.85 }); STRAW.set(k, m); return m;
}
function straw(parent, cv, r, c1, c2, rep = 12) { return mesh(new THREE.TubeGeometry(cv, 80, r, 14, false), strawMat(c1, c2, rep), parent); }
// Paper drop: cut teardrop card with a paler highlight layer.
function dropGeo(r) { const g = new THREE.ExtrudeGeometry(S.drop(r), { depth: r * 0.7, bevelEnabled: true, bevelThickness: r * 0.25, bevelSize: r * 0.2, bevelSegments: 3, curveSegments: 16 }); g.translate(0, -r * 0.9, -r * 0.35); return g; }
// Printed crease lines (valley + highlight) across a flat card.
function creases(parent, w, h, n, x, y, z, vertical = true) {
  const tx = inkTex(256, 256, (g, W, H) => { for (let i = 1; i < n; i++) { const p = (i / n) * (vertical ? W : H); g.lineWidth = 3; g.strokeStyle = "rgba(90,60,40,.22)"; g.beginPath(); vertical ? (g.moveTo(p, 0), g.lineTo(p, H)) : (g.moveTo(0, p), g.lineTo(W, p)); g.stroke(); g.strokeStyle = "rgba(255,255,255,.5)"; g.beginPath(); vertical ? (g.moveTo(p + 3, 0), g.lineTo(p + 3, H)) : (g.moveTo(0, p + 3), g.lineTo(W, p + 3)); g.stroke(); } });
  return print(tx, w, h, parent, x, y, z);
}
const ring = (ro, ri) => holes(S.circle(ro), S.circle(ri));
const planksMat = (base, line, rep) => { const m = new THREE.MeshStandardMaterial({ map: planks(base, line), bumpMap: grain().b, bumpScale: 1.0, roughness: 0.9 }); m.map.repeat.set(rep[0], rep[1]); return m; };

// ---------- chibi paper hero: big round head, layered coat, scarf. Feet at y=0, ~1.15 tall ----------
function chibi({ coat, coatD, pants, hair, skin = P.skin, scarf = null, hat = null, tie = null, man = false, shoe = P.brownD }) {
  const G = new THREE.Group();
  const leg = (s) => { const hp = new THREE.Group(); hp.position.set(s * 0.075, 0.34, 0); G.add(hp); pcyl(0.052, 0.046, 0.26, pants, hp, 0, -0.13, 0, 16); const kn = new THREE.Group(); kn.position.y = -0.24; hp.add(kn); const sh = mesh(new THREE.SphereGeometry(0.062, 16, 10), pm(shoe), kn, 0, -0.06, 0.025); sh.scale.set(1, 0.62, 1.45); return { hp, kn }; };
  const legL = leg(-1), legR = leg(1);
  // A-line coat with a hem band, front placket card and two buttons
  pcyl(man ? 0.15 : 0.13, man ? 0.18 : 0.215, 0.38, coat, G, 0, 0.51, 0, 28);
  pcyl(man ? 0.181 : 0.218, man ? 0.185 : 0.222, 0.04, coatD, G, 0, 0.335, 0, 28);
  card(0.035, 0.34, coatD, G, 0, 0.51, man ? 0.17 : 0.178, 0.012).rotation.x = -0.12;
  for (const yb of [0.6, 0.5, 0.41]) mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 12).rotateX(Math.PI / 2), pm(P.goldL), G, 0.04, yb, (man ? 0.155 : 0.17) + (0.6 - yb) * 0.08);
  if (scarf) { mesh(new THREE.TorusGeometry(0.11, 0.042, 10, 24).rotateX(Math.PI / 2), pm(scarf), G, 0, 0.7, 0); const tl = pbox(0.07, 0.2, 0.03, scarf, G, 0.06, 0.6, 0.15); tl.rotation.z = 0.12; }
  if (tie) { cut(S.poly([[-0.03, 0], [0.03, 0], [0.04, -0.17], [0, -0.21], [-0.04, -0.17]]), tie, G, 0, 0.69, 0.155, 0.015); cut(S.poly([[-0.07, 0], [0.07, 0], [0, -0.09]]), P.ivoryL, G, 0, 0.7, 0.15, 0.012); }
  const arm = (s) => { const sh = new THREE.Group(); sh.position.set(s * (man ? 0.17 : 0.15), 0.64, 0); G.add(sh); pcyl(0.05, 0.045, 0.16, coat, sh, 0, -0.08, 0, 14); const el = new THREE.Group(); el.position.y = -0.15; sh.add(el); pcyl(0.045, 0.042, 0.14, coat, el, 0, -0.07, 0, 14); pcyl(0.047, 0.047, 0.03, coatD, el, 0, -0.13, 0, 14); mesh(new THREE.SphereGeometry(0.042, 14, 10), pm(skin), el, 0, -0.17, 0); return { sh, el }; };
  const armL = arm(-1), armR = arm(1);
  const hd = new THREE.Group(); hd.position.y = 0.72; G.add(hd);
  pcyl(0.045, 0.05, 0.06, skin, hd, 0, 0.0, 0, 12);
  mesh(new THREE.SphereGeometry(0.235, 36, 26), pm(skin), hd, 0, 0.23, 0).scale.set(1, 0.96, 0.96);
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.045, 12, 10), pm(skin), hd, s * 0.232, 0.2, 0);
  // printed face (eyes, brows, blush, smile) on a small card hugging the front
  const face = inkTex(256, 160, (g) => {
    g.fillStyle = "#3b2a22"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(128 + s * 46, 74, 11, 15, 0, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(128 + s * 46 + 3, 68, 4, 0, 7); g.fill(); g.fillStyle = "#3b2a22"; }
    g.fillStyle = "rgba(227,128,106,.6)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(128 + s * 74, 108, 20, 11, 0, 0, 7); g.fill(); }
    g.strokeStyle = "#7d5843"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.arc(128, 104, 15, 0.35, 2.8); g.stroke();
    if (man) { g.fillStyle = "#523729"; g.beginPath(); g.ellipse(108, 122, 22, 8, 0.15, 0, 7); g.ellipse(148, 122, 22, 8, -0.15, 0, 7); g.fill(); }
  });
  const fm = print(face, 0.3, 0.19, hd, 0, 0.2, 0.226); fm.rotation.x = -0.05;
  // hair: a cap over the top and back + a cut fringe card + curl
  const cap = mesh(new THREE.SphereGeometry(0.252, 36, 20, 0, Math.PI * 2, 0, man ? 1.25 : 1.62), pm(hair), hd, 0, 0.235, -0.012);
  cap.rotation.x = man ? -0.35 : -0.55;
  if (!man) {
    mesh(new THREE.SphereGeometry(0.255, 30, 16, 0, Math.PI * 2, 0, 1.0), pm(hair), hd, 0, 0.245, 0.015).rotation.x = 0.28;
    const bob = mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.22, 30, 1, true, Math.PI * 0.42, Math.PI * 1.16), pm(hair, { ds: true }), hd, 0, 0.15, -0.01);
    const curl = mesh(new THREE.TorusGeometry(0.035, 0.014, 8, 18, 4.2), pm(hair), hd, 0.03, 0.49, -0.02); curl.rotation.set(0.6, 0.3, 0.4);
  }
  if (hat) { pcyl(0.3, 0.3, 0.025, hat, hd, 0, 0.36, -0.01, 30); const crown = mesh(new THREE.SphereGeometry(0.2, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), pm(hat), hd, 0, 0.37, -0.01); crown.scale.set(1, 0.95, 1); pcyl(0.202, 0.202, 0.04, P.coralD, hd, 0, 0.395, -0.01, 30); }
  return { G, legL, legR, armL, armR, head: hd };
}
// a: shoulder raise (z), f: forward swing (x), e: elbow bend, walk phase w (0 = stand), sit 0..1
function chibiPose(c, { aL = 0.12, aR = 0.12, fL = 0, fR = 0, eL = 0, eR = 0, walk = 0, ph = 0, sit = 0, hz = 0, hx = 0, hy = 0 }) {
  const sw = Math.sin(ph) * 0.6 * walk;
  c.armL.sh.rotation.set(fL + sw, 0, -aL); c.armR.sh.rotation.set(fR - sw, 0, aR);
  c.armL.el.rotation.x = -eL; c.armR.el.rotation.x = -eR;
  c.legL.hp.rotation.x = -sw * 0.9 - 1.5 * sit; c.legR.hp.rotation.x = sw * 0.9 - 1.5 * sit;
  c.legL.kn.rotation.x = Math.max(0, -Math.sin(ph) * 0.7 * walk) + 1.5 * sit; c.legR.kn.rotation.x = Math.max(0, Math.sin(ph) * 0.7 * walk) + 1.5 * sit;
  c.head.rotation.set(hx, hy, hz);
  c.G.position.y += Math.abs(Math.sin(ph)) * 0.025 * walk;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xf1e3cc, fog: 0.006, exp: 0.9, bloom: [0.16, 0.5, 0.92] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.94;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x7a6a58);
    for (const [w, h, c, i, x, y, z] of [[6, 3, 0xfff1dc, 1.6, -3, 4, 3], [4, 4, 0xe9eef6, 0.8, 4, 2, 2], [8, 2, 0xcdb08f, 0.6, 0, -3, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.25;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const hemi = new THREE.HemisphereLight(0xfff8ec, 0xd8b892, 1.55); scene.add(hemi);
  // key from front-left-high, warm backlight from behind for rims and glow
  const key = new THREE.DirectionalLight(0xfff0d8, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 70 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 6;
  scene.add(key); scene.add(key.target);
  const backL = new THREE.DirectionalLight(0xffc98a, 2.2); scene.add(backL); scene.add(backL.target);
  const fill = new THREE.DirectionalLight(0xeaf0f6, 0.55); scene.add(fill); scene.add(fill.target);

  // ============ SHOP 1902 ============
  const SH = new THREE.Group(); SH.position.x = SX; scene.add(SH);
  mesh(new THREE.BoxGeometry(9, 0.3, 6.4), planksMat("#d9b48c", "rgba(110,72,46,.35)", [3, 2]), SH, -0.3, -0.15, -0.1);
  {
    const wall = holes(S.rect(9, 5, 0, 2.5), S.arch(1.25, 2.4, -1.5, 1.05), S.arch(1.25, 2.4, 1.6, 1.05));
    cut(wall, "#f2dcc0", SH, -0.3, 0, -3.25, 0.12);
    creases(SH, 9, 5, 6, -0.3, 2.5, -3.18);
    card(9, 0.9, "#e8a58f", SH, -0.3, 0.45, -3.17, 0.03); card(9, 0.06, P.coralD, SH, -0.3, 0.92, -3.15, 0.02);
    for (const wx of [-1.5, 1.6]) { const fr = cut(holes(S.arch(1.5, 2.65, 0, 0.92), S.arch(1.25, 2.4, 0, 1.05)), P.cobalt, SH, wx, 0, -3.13, 0.07); card(0.06, 2.0, P.cobalt, SH, wx, 2.0, -3.17, 0.03); card(1.25, 0.06, P.cobalt, SH, wx, 2.3, -3.17, 0.03); }
    // bright sky + cut-paper Brooklyn behind the windows (backlight)
    print(inkTex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#fff4dc"); gr.addColorStop(1, "#ffd9a0"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), 9, 5, SH, -0.3, 2.6, -4.6, { emi: "#fff0d0", ei: 0.9 });
    const R = mulberry(5);
    for (let i = 0; i < 14; i++) { const bw = 0.35 + R() * 0.4, bh = 0.6 + R() * 1.6; card(bw, bh, i % 3 ? "#e7b7a0" : "#c9b2d6", SH, -3.5 + i * 0.5 + R() * 0.1, 1.0 + bh / 2, -4.2 - (i % 2) * 0.2, 0.04); }
    const bridge = new THREE.Group(); bridge.position.set(1.6, 1.4, -3.9); SH.add(bridge);
    for (const bx of [-0.3, 0.45]) { card(0.12, 1.3, "#9e86b3", bridge, bx, 0.65, 0, 0.04); cut(S.arch(0.1, 0.22, bx, 0.9), "#ffe9c4", bridge, 0, 0, 0.03, 0.02); }
    card(1.6, 0.05, "#9e86b3", bridge, 0.1, 0.25, 0, 0.04);
    // sign
    const sg = new THREE.Group(); sg.position.set(2.3, 2.75, -1.2); sg.scale.setScalar(0.62); SH.add(sg);
    cut(S.rrect(2.9, 0.62, 0.08), P.coralD, sg, 0.04, -0.04, -0.02, 0.04); cut(S.rrect(2.9, 0.62, 0.08), P.ivoryL, sg, 0, 0, 0.02, 0.04);
    print(inkTex(1024, 220, (g, w, h) => { txt(g, "AUDIRA PERCETAKAN", w / 2, 80, `900 92px ${SERIF}`, P.ink); txt(g, "BROOKLYN · 1902", w / 2, 170, `700 58px ${MONO}`, P.coralD); }), 2.75, 0.59, sg, 0, 0, 0.045);
    // side wall with wainscot
    const lw = card(6.4, 5, "#cfe6d9", SH, -4.75, 2.5, -0.1, 0.1); lw.rotation.y = Math.PI / 2;
    const lw2 = card(6.4, 0.9, "#9dd1bb", SH, -4.68, 0.45, -0.1, 0.03); lw2.rotation.y = Math.PI / 2;
    // hanging lamp
    const lp = new THREE.Group(); lp.position.set(0.6, 3.6, 0.3); SH.add(lp);
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.8, 4), pm(P.ink, { flat: true }), lp, 0, 0.9, 0);
    mesh(new THREE.ConeGeometry(0.3, 0.26, 24, 1, true), pm(P.mintD, { ds: true }), lp, 0, 0, 0);
    mesh(new THREE.SphereGeometry(0.08, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), lp, 0, -0.1, 0);
    const ll = new THREE.PointLight(0xffd6a0, 1.6, 6, 1.6); ll.position.set(0, -0.2, 0); lp.add(ll);
    // reams in the foreground for depth
    const RR = mulberry(9);
    for (const [x, z, n] of [[-3.6, 1.6, 6], [-3.0, 2.2, 3], [3.3, 1.2, 7], [2.7, 2.1, 4]]) for (let i = 0; i < n; i++) ream(SH, x + (RR() - 0.5) * 0.06, 0.06 + i * 0.12, z, REAMC[i % 3], (RR() - 0.5) * 0.3);
  }
  // press (right)
  const rollers = [];
  {
    const pr = new THREE.Group(); pr.position.set(2.3, 0, -1.7); SH.add(pr);
    cut(S.rrect(1.6, 1.25, 0.12, 0, 0.72), P.cobalt, pr, 0, 0, 0, 0.9);
    cut(S.rrect(1.66, 0.12, 0.05, 0, 0.12), P.cobaltD, pr, 0, 0, 0.03, 0.96);
    card(1.3, 0.05, P.goldL, pr, 0, 1.1, 0.47, 0.02); card(1.3, 0.05, P.goldL, pr, 0, 0.35, 0.47, 0.02);
    for (let i = 0; i < 3; i++) { const ro = mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.0, 24), strawMat("#efe4cf", "#d7c6a8", 3), pr, -0.35 + i * 0.35, 1.48, 0); ro.rotation.x = Math.PI / 2; rollers.push(ro); }
    const fw = new THREE.Group(); fw.position.set(0.86, 0.85, 0); pr.add(fw); fw.rotation.y = Math.PI / 2;
    cut(holes(S.circle(0.42), S.circle(0.12, 0.22, 0), S.circle(0.12, -0.22, 0), S.circle(0.12, 0, 0.22), S.circle(0.12, 0, -0.22)), P.coralD, fw, 0, 0, 0, 0.06);
    rollers.push(fw);
  }
  // hanging sheets above the machine: four offset prints that swell in damp air
  const sheets = [];
  const printTex = (seed, mis) => inkTex(256, 340, (g, w, h) => { g.fillStyle = "#fbf6ea"; g.fillRect(0, 0, w, h); const R = mulberry(seed); g.globalCompositeOperation = "multiply"; for (const [c, dx] of [["#7fc8c8", -mis], ["#f2a0a0", mis], ["#f5d27a", 0]]) { g.fillStyle = c; g.beginPath(); g.arc(128 + dx + (R() - 0.5) * 30, 130 + dx * 0.6, 70, 0, 7); g.fill(); } g.globalCompositeOperation = "source-over"; g.fillStyle = "#3b2a22"; g.fillRect(40, 248, 176, 14); g.fillRect(40, 274, 120, 10); });
  {
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 3.0, 4).rotateZ(Math.PI / 2), pm(P.ink, { flat: true }), SH, -1.6, 2.82, -1.6);
    [-2.55, -1.9, -1.25, -0.6].forEach((x, i) => {
      const geo = new THREE.PlaneGeometry(0.52, 0.7, 10, 10); geo.translate(0, -0.35, 0);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: printTex(30 + i, 6), bumpMap: grain().b, bumpScale: 1, roughness: 0.9, side: THREE.DoubleSide }));
      m.position.set(x, 2.8, -1.6); m.castShadow = true; SH.add(m);
      for (const px of [-0.17, 0.17]) pbox(0.04, 0.09, 0.03, P.goldD, SH, x + px, 2.8, -1.58);
      sheets.push({ m, geo, base: Float32Array.from(geo.attributes.position.array), i });
    });
  }
  // easel with the hero print (four ink layers that slide out of register)
  let L_C, L_M, L_Y;
  {
    const ea = new THREE.Group(); ea.position.set(0.75, 0, 0.15); ea.rotation.y = -0.28; SH.add(ea);
    for (const s of [-1, 1]) { const lg = pbox(0.07, 2.1, 0.07, P.brown, ea, s * 0.5, 1.02, 0); lg.rotation.z = s * -0.08; }
    pbox(0.07, 1.9, 0.07, P.brown, ea, 0, 0.9, -0.45).rotation.x = 0.25;
    pbox(1.25, 0.08, 0.2, P.brownL, ea, 0, 0.98, 0.06);
    const pg = new THREE.Group(); pg.position.set(0, 1.7, 0.08); ea.add(pg); pg.rotation.x = -0.06;
    card(1.08, 1.34, "#fbf6ea", pg, 0, 0, 0, 0.02);
    const disc = (c, r) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.9, transparent: true, opacity: 0.82, map: grain().a })); pg.add(m); return m; };
    L_Y = disc("#f5cf6a", 0.34); L_Y.position.set(0, 0.12, 0.013);
    L_C = disc("#78c3c4", 0.3); L_C.position.set(-0.06, 0.12, 0.016);
    L_M = disc("#ef8f86", 0.3); L_M.position.set(0.06, 0.12, 0.019);
    print(inkTex(256, 64, (g, w, h) => { g.fillStyle = "#3b2a22"; g.fillRect(10, 10, 236, 16); g.fillRect(10, 40, 150, 12); }), 0.8, 0.2, pg, 0, -0.45, 0.02);
    for (const [x, y] of [[-0.46, 0.58], [0.46, 0.58]]) { cut(ring(0.05, 0.035), P.ink, pg, x, y, 0.02, 0.01); }
  }
  // the 1902 machine: mint cabinet, coil window, side fan, gauges, paper bellows duct up to a vent over the sheets
  let maFan, coilM, needles = [];
  const MA = new THREE.Group(); MA.position.set(-1.95, 0, -0.45); SH.add(MA);
  {
    cut(S.rrect(1.0, 1.3, 0.1, 0, 0.67), P.mint, MA, 0, 0, 0, 0.72);
    cut(S.rrect(1.08, 0.1, 0.04, 0, 0.06), P.mintD, MA, 0, 0, 0, 0.8);
    cut(S.rrect(1.06, 0.08, 0.03, 0, 1.33), P.coralD, MA, 0, 0, 0, 0.78);
    cut(S.rrect(0.72, 0.58, 0.06, 0, 0.92), P.ivoryL, MA, 0, 0, 0.37, 0.02);
    coilM = pm(P.ice, { emi: P.iceD, ei: 0.0, unique: true });
    cut(S.rrect(0.62, 0.48, 0.05, 0, 0.92), P.ice, MA, 0, 0, 0.385, 0.01, { mat: coilM });
    const hel = []; for (let i = 0; i <= 120; i++) { const a = i / 120; hel.push(new THREE.Vector3(-0.24 + 0.48 * a, 0.92 + 0.17 * Math.sin(a * Math.PI * 9), 0.41 + 0.02 * Math.cos(a * Math.PI * 9))); }
    straw(MA, new THREE.CatmullRomCurve3(hel), 0.022, P.copper, "#e3a274", 40);
    const gtex = (lab) => inkTex(128, 128, (g, w) => { g.fillStyle = "#fbf6ea"; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = P.ink; g.stroke(); g.lineWidth = 10; g.strokeStyle = "#9dd1bb"; g.beginPath(); g.arc(64, 70, 40, Math.PI * 1.05, Math.PI * 1.5); g.stroke(); g.strokeStyle = "#e3806a"; g.beginPath(); g.arc(64, 70, 40, Math.PI * 1.5, Math.PI * 1.95); g.stroke(); txt(g, lab, 64, 100, `700 20px ${MONO}`, P.ink); });
    ["SUHU", "LEMBAP"].forEach((lab, i) => { const gx = -0.22 + i * 0.44; cut(S.circle(0.14), P.coralD, MA, gx, 0.38, 0.37, 0.03); print(gtex(lab), 0.25, 0.25, MA, gx, 0.38, 0.39); const nd = new THREE.Group(); nd.position.set(gx, 0.36, 0.395); MA.add(nd); card(0.012, 0.09, P.ink, nd, 0, 0.045, 0, 0.01); needles.push(nd); });
    maFan = new THREE.Group(); maFan.position.set(0.37, 0.92, 0); maFan.rotation.y = Math.PI / 2; MA.add(maFan);
    cut(ring(0.3, 0.26), P.goldD, MA, 0.375, 0.92, 0, 0.04).rotation.y = Math.PI / 2;
    for (let i = 0; i < 5; i++) { const b = cut(S.poly([[0, 0.02], [0.24, 0.07], [0.24, -0.04], [0, -0.02]]), P.goldL, maFan, 0, 0, 0.02, 0.02); b.rotation.z = (i / 5) * Math.PI * 2; }
    cut(S.circle(0.06), P.coralD, maFan, 0, 0, 0.04, 0.03);
    const dc = curve([[0, 1.32, -0.2], [0, 2.2, -0.35], [0, 2.95, -0.55], [0.2, 3.15, -0.95], [0.45, 3.05, -1.15]]);
    bellows(MA, dc, 26, 0.12, P.ivoryL, P.ivoryS);
    const vent = mesh(new THREE.CylinderGeometry(0.13, 0.24, 0.2, 24, 1, true), pm(P.coralD, { ds: true }), MA, 0.5, 2.96, -1.17); vent.rotation.z = 0.5;
  }
  // humid droplets drifting in the shop air (s2)
  const DG = dropGeo(0.05);
  const hum = new THREE.InstancedMesh(DG, pm("#bfe3ef", { rough: 0.6 }), 36); hum.frustumCulled = false; SH.add(hum);
  const humS = []; { const R = mulberry(77); for (let i = 0; i < 36; i++) humS.push([-3 + R() * 6, 0.9 + R() * 2.4, -1.4 + R() * 2.6, R() * 6.28, 0.5 + R(), 0.6 + R() * 0.7]); }
  // air ribbons: cool from the vent sweeping over the sheets, warm humid waves
  const shopCold = [0, 1, 2, 3].map((i) => ribbon(SH, wavy(curve([[-1.5, 2.95, -1.55 + 0.05 * i], [-2.0 + i * 0.5, 2.3, -1.3], [-2.8 + i * 0.8, 1.2, -0.6], [-3.0 + i * 0.9, 0.6, 0.4]]), 0.08, "z", 8, 2.5, i), { color: i % 2 ? P.mintL : P.mint, width: 0.11, len: 0.5, speed: 0.33, phase: i * 0.27 }));
  const shopWarm = [0, 1, 2].map((i) => ribbon(SH, wavy(curve([[-3.6, 0.8 + i * 0.7, 1.0], [-1.6, 1.4 + i * 0.6, 0.6], [0.4, 1.0 + i * 0.7, 0.9], [2.4, 1.6 + i * 0.5, 0.2]]), 0.25, "y", 7, 2.2, i * 2), { color: i % 2 ? P.coralL : P.coral, width: 0.13, len: 0.45, speed: 0.22, phase: i * 0.33 }));
  // Willis Carrier as a chibi paper figure (generic, no likeness)
  const wil = chibi({ coat: "#5a4a6e", coatD: "#3f3352", pants: "#3f3352", hair: P.brownD, hat: "#3b2a22", tie: P.coralD, man: true });
  wil.G.scale.setScalar(1.12); SH.add(wil.G);

  // ============ HOUSE today: cutaway bedroom, roof terrace with the outdoor unit ============
  const HO = new THREE.Group(); HO.position.x = HX; scene.add(HO);
  {
    // garden ground, hills, sky
    card(40, 30, "#b9dcb6", HO, 0, -0.03, -6, 0.05).rotation.x = -Math.PI / 2;
    print(inkTex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#fdf0da"); gr.addColorStop(1, "#f6d9b0"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), 44, 22, HO, 0, 8, -14, { emi: "#fff0d8", ei: 0.35 });
    const hills = [[-9, -11, 7, "#a9d3b4"], [2, -12, 9, "#9dcaa9"], [11, -11, 7, "#b8dcc0"], [-4, -9, 5, "#8fc3a0"], [7, -9.5, 5, "#a3d0ae"]];
    for (const [x, z, rr, c] of hills) { const hm = cut(S.arch(rr * 2, rr * 0.9, 0, -rr * 0.2), c, HO, x, 0, z, 0.1); }
    const sun = cut(S.circle(1.4), P.goldL, HO, -6.5, 9.5, -12.5, 0.08, { emi: "#ffd27a", ei: 0.6 });
    for (const [x, y, z, s] of [[-3, 8.2, -11, 1.3], [5.5, 9.3, -11.5, 1.1], [9, 6.8, -10, 0.9]]) cloud(HO, x, y, z, s);
    for (const [x, z, h] of [[-5.5, -4, 3.2], [6.8, -4.5, 3.6], [-7.5, -6, 2.6], [5.3, -2.6, 2.2]]) tree(HO, x, z, h, P.mintD, P.mint);
    const RB = mulberry(41); for (let i = 0; i < 9; i++) bush(HO, -6 + i * 1.6 + RB(), 2.6 + RB() * 0.8, 0.8 + RB() * 0.4, P.mintD, "#8cc6a4", 50 + i);
    // floor, walls
    mesh(new THREE.BoxGeometry(5.6, 0.25, 3.6), planksMat("#e3bd92", "rgba(110,72,46,.3)", [2, 1.3]), HO, -0.12, -0.12, -0.2);
    const bw = holes(S.rect(5.6, 3.6, 0, 1.8), S.arch(1.0, 1.7, -1.75, 1.15));
    cut(bw, "#f6d8bf", HO, -0.12, 0, -2.08, 0.16); creases(HO, 5.6, 3.6, 5, -0.12, 1.8, -1.995);
    card(5.6, 0.75, "#e9b39c", HO, -0.12, 0.375, -1.99, 0.02);
    cut(holes(S.arch(1.25, 1.95, 0, 1.0), S.arch(1.0, 1.7, 0, 1.15)), P.cobalt, HO, -1.75, 0, -1.98, 0.05);
    print(inkTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffe8b8"); gr.addColorStop(1, "#ffcf8a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#f6b04a"; g.beginPath(); g.arc(90, 90, 40, 0, 7); g.fill(); }), 1.0, 1.7, HO, -1.75, 2.0, -2.2, { emi: "#ffe0a0", ei: 0.8 });
    // right wall: cut section, cream inside, brick-coral outside
    pbox(0.26, 3.6, 3.6, "#f6d8bf", HO, 2.73, 1.8, -0.2);
    const ext = card(3.6, 3.6, "#e8a58f", HO, 2.87, 1.8, -0.2, 0.02); ext.rotation.y = Math.PI / 2;
    print(inkTex(256, 256, (g, w, h) => { g.strokeStyle = "rgba(160,80,60,.35)"; g.lineWidth = 3; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } }), 3.6, 3.6, HO, 2.885, 1.8, -0.2).rotation.y = Math.PI / 2;
    // left low wall
    const lw = card(2.2, 3.6, "#f1cdb0", HO, -2.97, 1.8, -1.0, 0.16); lw.rotation.y = Math.PI / 2;
    // roof terrace slab + low parapet
    mesh(new THREE.BoxGeometry(6.0, 0.26, 3.8), planksMat("#efd2b4", "rgba(150,90,60,.3)", [2.2, 1.4]), HO, -0.05, 3.73, -0.25);
    card(6.0, 0.06, P.coralD, HO, -0.05, 3.63, 1.66, 0.02);
    for (let i = 0; i < 9; i++) pbox(0.5, 0.18, 0.12, i % 2 ? "#e8a58f" : "#f2c4ae", HO, -2.75 + i * 0.67, 3.95, -2.05);
    // bed under the unit, rug, plant, shelf
    pbox(2.0, 0.34, 1.3, P.cobaltL, HO, 0.25, 0.17, -1.35); pbox(1.95, 0.14, 1.25, "#fbf3e4", HO, 0.25, 0.41, -1.35);
    cut(S.rrect(2.0, 0.9, 0.12, 0, 0.45), P.cobalt, HO, 0.25, 0, -2.0, 0.08);
    pbox(0.6, 0.14, 0.4, "#fffaf0", HO, -0.35, 0.53, -1.75).rotation.z = 0.05;
    const bl = card(1.3, 1.0, P.coral, HO, 0.6, 0.49, -1.2, 0.04); bl.rotation.x = -Math.PI / 2; creases(HO, 1.3, 1.0, 4, 0.6, 0.515, -1.2).rotation.x = -Math.PI / 2;
    const rug = cut(S.circle(0.9), P.goldL, HO, 0.4, 0.015, 0.45, 0.02); rug.rotation.x = -Math.PI / 2; const rug2 = cut(ring(0.7, 0.62), P.coralL, HO, 0.4, 0.03, 0.45, 0.01); rug2.rotation.x = -Math.PI / 2;
    const sh = new THREE.Group(); sh.position.set(-1.95, 2.05, -1.92); HO.add(sh); pbox(1.0, 0.06, 0.28, P.brownL, sh, 0, 0, 0);
    { const RBk = mulberry(21); for (let i = 0; i < 6; i++) { const bh = 0.24 + RBk() * 0.12; pbox(0.09, bh, 0.2, [P.coral, P.cobalt, P.gold, P.mintD][i % 4], sh, -0.38 + i * 0.12, 0.03 + bh / 2, 0).rotation.z = i === 5 ? -0.3 : 0; } }
    // indoor potted fern
    const fp = new THREE.Group(); fp.position.set(-2.4, 0, 0.6); HO.add(fp); pcyl(0.2, 0.15, 0.35, P.coralD, fp, 0, 0.17, 0); for (let i = 0; i < 7; i++) { const lf = cut(S.poly([[0, 0], [0.08, 0.35], [0, 0.7], [-0.08, 0.35]]), i % 2 ? P.mintD : P.mint, fp, 0, 0.33, 0, 0.02); lf.rotation.set(0, (i / 7) * Math.PI, (i % 2 ? 1 : -1) * 0.35); }
  }
  // ---- indoor split unit (local origin at its centre) ----
  const IU = new THREE.Group(); IU.position.set(0.3, 2.95, -1.78); HO.add(IU);
  let hinge, cff, louver, finM, frostL, led;
  {
    card(2.15, 0.82, P.mint, IU, 0.07, -0.06, -0.2, 0.03);
    cut(S.rrect(1.9, 0.66, 0.1), P.ivory, IU, 0, 0, -0.05, 0.34);
    for (const s of [-1, 1]) { const ch = cut(S.rrect(0.44, 0.66, 0.1), P.ivoryL, IU, s * 0.93, 0, 0.27, 0.06); ch.rotation.y = Math.PI / 2; }
    pbox(1.86, 0.05, 0.42, P.ivoryL, IU, 0, 0.305, 0.3);
    finM = pm("#9fcfe3", { emi: P.iceD, ei: 0, unique: true, rough: 0.7 });
    const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.36, 0.3), finM, 64); fins.castShadow = true;
    { const o = new THREE.Object3D(); for (let i = 0; i < 64; i++) { o.position.set(-0.84 + (i / 63) * 1.68, 0.08, 0.3); o.updateMatrix(); fins.setMatrixAt(i, o.matrix); } }
    IU.add(fins);
    for (const y of [-0.02, 0.08, 0.18]) { const tb = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.76, 14), strawMat(P.copper, "#e3a274", 14), IU, 0, y, 0.33); tb.rotation.z = Math.PI / 2; }
    for (const y of [0.03, 0.13]) { const ub = mesh(new THREE.TorusGeometry(0.05, 0.02, 10, 16, Math.PI), strawMat(P.copper, "#e3a274", 3), IU, 0.88, y, 0.33); ub.rotation.z = -Math.PI / 2; }
    pbox(1.8, 0.04, 0.34, P.cobaltL, IU, 0, -0.12, 0.3);
    cff = new THREE.Group(); cff.position.set(0, -0.21, 0.32); IU.add(cff);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const sl = pbox(1.7, 0.012, 0.04, P.ivoryS, cff, 0, Math.cos(a) * 0.065, Math.sin(a) * 0.065); sl.rotation.x = a; }
    louver = new THREE.Group(); louver.position.set(0, -0.29, 0.47); IU.add(louver);
    card(1.6, 0.07, P.ivoryS, louver, 0, -0.03, 0, 0.02);
    hinge = new THREE.Group(); hinge.position.set(0, 0.33, 0.5); IU.add(hinge);
    cut(S.rrect(1.9, 0.56, 0.08, 0, -0.28), P.ivoryL, hinge, 0, 0, 0, 0.04);
    card(1.7, 0.035, P.coral, hinge, 0, -0.47, 0.025, 0.01);
    creases(hinge, 1.86, 0.5, 4, 0, -0.27, 0.022, true);
    led = mesh(new THREE.CircleGeometry(0.018, 12), new THREE.MeshStandardMaterial({ color: 0x9dd1bb, emissive: 0x6ee0b0, emissiveIntensity: 1.2 }), hinge, 0.78, -0.47, 0.024);
    frostL = new THREE.PointLight(0xa8e6ff, 0, 3.2, 1.6); frostL.position.set(0, -0.2, 0.8); IU.add(frostL);
  }
  // condensation drops on the fins
  const iuDrops = new THREE.InstancedMesh(dropGeo(0.034), pm("#bfe8f5", { rough: 0.45, emi: "#9fd8ee", ei: 0.25 }), 26); iuDrops.frustumCulled = false; IU.add(iuDrops);
  const iuDS = []; { const R = mulberry(88); for (let i = 0; i < 26; i++) iuDS.push([-0.78 + R() * 1.56, R(), 1.8 + R() * 1.6, R() * 0.08]); }
  // room air ribbons
  const roomCold = [0, 1, 2, 3].map((i) => ribbon(HO, wavy(curve([[-0.4 + i * 0.4, 2.6, -1.25], [-0.6 + i * 0.5, 2.0, -0.4], [-0.9 + i * 0.6, 1.4, 0.6], [-1.0 + i * 0.7, 1.0, 1.6]]), 0.07, "x", 8, 2.6, i), { color: i % 2 ? P.mintL : P.mint, width: 0.12, len: 0.45, speed: 0.3, phase: i * 0.25 }));
  const roomWarm = [0, 1].map((i) => ribbon(HO, wavy(curve([[-1.2 + i * 1.4, 1.2, 1.4], [-0.8 + i * 1.3, 2.2, 0.4], [-0.2 + i * 0.9, 3.25, -0.9], [0.0 + i * 0.6, 3.32, -1.5]]), 0.12, "x", 7, 2.2, i), { color: i ? P.coralL : P.coral, width: 0.12, len: 0.45, speed: 0.28, phase: i * 0.4 }));
  // drain hose: bottom of the unit, through the wall, down the brick wall into a potted plant
  const hoseCv = curve([[1.12, 2.66, -1.62], [1.9, 2.62, -1.75], [2.6, 2.58, -1.78], [2.98, 2.45, -1.78], [3.0, 1.6, -1.72], [3.02, 0.95, -1.6], [3.2, 0.78, -1.4]]);
  bellows(HO, hoseCv, 70, 0.04, "#f3ead9", "#d9cdb5");
  const pot = new THREE.Group(); pot.position.set(3.45, 0, -1.25); HO.add(pot);
  pcyl(0.28, 0.21, 0.42, P.coral, pot, 0, 0.21, 0, 28); pcyl(0.3, 0.3, 0.06, P.coralD, pot, 0, 0.43, 0, 28); pcyl(0.26, 0.26, 0.02, P.brown, pot, 0, 0.42, 0, 24);
  for (let i = 0; i < 6; i++) { const lf = cut(S.poly([[0, 0], [0.1, 0.25], [0, 0.55], [-0.1, 0.25]]), i % 2 ? P.mintD : "#7dbb8f", pot, 0, 0.42, 0, 0.02); lf.rotation.set(0, (i / 6) * Math.PI + 0.3, (i % 2 ? 1 : -1) * 0.4); }
  const hoseDrops = new THREE.InstancedMesh(dropGeo(0.06), pm("#bfe8f5", { rough: 0.45, emi: "#9fd8ee", ei: 0.3 }), 4); hoseDrops.frustumCulled = false; HO.add(hoseDrops);
  const splash = cut(ring(0.12, 0.09), "#bfe8f5", HO, 3.42, 0.445, -1.3, 0.01); splash.rotation.x = -Math.PI / 2;
  // copper pipes (paper straws): unit -> through the wall -> up the outside -> roof unit
  const pipeA = curve([[1.0, 2.86, -1.9], [2.6, 2.86, -1.92], [3.0, 2.95, -1.9], [3.02, 3.6, -1.9], [3.02, 4.15, -1.85], [2.6, 4.32, -1.6], [2.05, 4.35, -1.2]]);
  const pipeB = curve([[1.0, 2.76, -1.95], [2.6, 2.76, -1.98], [3.08, 2.85, -1.98], [3.1, 3.6, -1.98], [3.1, 4.05, -1.95], [2.65, 4.2, -1.68], [2.05, 4.2, -1.2]]);
  straw(HO, pipeA, 0.04, P.copper, "#e8ab7c", 40); straw(HO, pipeB, 0.04, "#f3ead9", "#d9cdb5", 40);
  const arrHot = arrows(HO, pipeA, 10, P.coralD, 0.05), arrCold = arrows(HO, pipeB, 10, P.cobalt, 0.05);
  // ---- outdoor unit on the roof (local origin bottom centre, front +z) ----
  const OU = new THREE.Group(); OU.position.set(1.0, 3.86, -1.05); HO.add(OU);
  let ouFan, door, comp3, condM, dial, heatTag;
  {
    for (const x of [-0.6, 0.6]) pbox(0.12, 0.12, 0.72, P.cobaltD, OU, x, 0.06, 0);
    card(1.82, 1.32, P.cobaltL, OU, 0.09, 0.7, -0.36, 0.03);
    cut(S.rrect(1.08, 1.2, 0.1, -0.31, 0.72), P.ivory, OU, 0, 0, 0, 0.62);
    // right compartment: open box, compressor, condenser zig-zag
    pbox(0.62, 0.05, 0.62, P.ivory, OU, 0.53, 0.145, 0); pbox(0.62, 0.05, 0.62, P.ivory, OU, 0.53, 1.295, 0); pbox(0.05, 1.2, 0.62, P.ivory, OU, 0.83, 0.72, 0);
    card(0.62, 1.12, "#efd9bd", OU, 0.53, 0.72, -0.28, 0.02);
    const zz = []; for (let i = 0; i <= 140; i++) { const a = i / 140; zz.push(new THREE.Vector3(0.28 + 0.5 * (0.5 + 0.5 * Math.sin(a * Math.PI * 7.5)), 0.25 + a * 0.95, -0.22)); }
    condM = strawMat(P.copper, "#f0b58a", 30); straw(OU, new THREE.CatmullRomCurve3(zz), 0.018, P.copper, "#f0b58a", 30);
    comp3 = new THREE.Group(); comp3.position.set(0.52, 0.17, 0.02); OU.add(comp3);
    pcyl(0.16, 0.16, 0.5, P.gold, comp3, 0, 0.28, 0, 28); mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), pm(P.gold), comp3, 0, 0.53, 0); pcyl(0.17, 0.17, 0.04, P.goldD, comp3, 0, 0.12, 0, 28); pcyl(0.17, 0.17, 0.04, P.goldD, comp3, 0, 0.42, 0, 28);
    print(inkTex(512, 96, (g, w, h) => txt(g, "KOMPRESOR", w / 2, h / 2, `900 62px ${SANS}`, P.ink)), 0.3, 0.056, comp3, 0, 0.3, 0.165);
    door = new THREE.Group(); door.position.set(0.84, 0, 0.32); OU.add(door);
    cut(S.rrect(0.6, 1.16, 0.06, -0.3, 0.72), P.ivoryL, door, 0, 0, 0, 0.03); creases(door, 0.56, 1.1, 3, -0.3, 0.72, 0.017, false);
    const pl = new THREE.Group(); pl.position.set(-0.3, 1.12, 0.02); door.add(pl); cut(S.rrect(0.46, 0.15, 0.03), P.coralD, pl, 0, 0, 0, 0.015);
    print(inkTex(256, 80, (g, w, h) => txt(g, "AUDIRA", w / 2, h / 2 + 2, `900 60px ${SANS}`, "#fff8ec")), 0.42, 0.13, pl, 0, 0, 0.01);
    // fan opening, grille rings, blades
    cut(S.circle(0.46), "#7d6a5c", OU, -0.31, 0.72, 0.31, 0.01);
    ouFan = new THREE.Group(); ouFan.position.set(-0.31, 0.72, 0.33); OU.add(ouFan);
    for (let i = 0; i < 3; i++) { const b = cut(S.poly([[0.04, -0.06], [0.4, -0.13], [0.42, 0.08], [0.04, 0.06]]), P.coralL, ouFan, 0, 0, 0, 0.02); b.rotation.z = (i / 3) * Math.PI * 2; }
    cut(S.circle(0.08), P.coralD, ouFan, 0, 0, 0.02, 0.03);
    for (const ro of [0.47, 0.36, 0.25]) cut(ring(ro, ro - 0.025), P.cobalt, OU, -0.31, 0.72, 0.36, 0.02);
    for (const a of [0, Math.PI / 2]) { const sp = card(0.92, 0.025, P.cobalt, OU, -0.31, 0.72, 0.365, 0.02); sp.rotation.z = a; }
    // inverter dial standing on the lid
    dial = new THREE.Group(); dial.position.set(-0.3, 1.33, 0.05); OU.add(dial);
    const dg = new THREE.Shape(); dg.absarc(0, 0, 0.36, 0, Math.PI, false); dg.closePath();
    cut(dg, P.ivoryL, dial, 0, 0.04, 0, 0.03); card(0.08, 0.1, P.ivoryS, dial, 0, -0.01, 0, 0.03);
    print(inkTex(512, 256, (g, w, h) => { g.lineWidth = 34; const cs = ["#9dd1bb", "#f2d58e", "#f0a892", "#c4614f"]; for (let i = 0; i < 4; i++) { g.strokeStyle = cs[i]; g.beginPath(); g.arc(256, 250, 190, Math.PI + (i * Math.PI) / 4 + 0.03, Math.PI + ((i + 1) * Math.PI) / 4 - 0.03); g.stroke(); } txt(g, "KECEPATAN", 256, 205, `900 44px ${SANS}`, P.ink); }), 0.72, 0.36, dial, 0, 0.22, 0.018);
    heatTag = new THREE.Group(); dial.add(heatTag); heatTag.position.set(0, 0.04, 0.03);
    card(0.016, 0.3, P.ink, heatTag, 0, 0.15, 0, 0.012); cut(S.circle(0.03), P.coralD, heatTag, 0, 0, 0.01, 0.02);
  }
  const heatOut = [0, 1, 2, 3].map((i) => ribbon(OU, wavy(curve([[-0.31 + (i - 1.5) * 0.12, 0.72, 0.4], [-0.35 + (i - 1.5) * 0.25, 0.9 + i * 0.05, 1.2], [-0.4 + (i - 1.5) * 0.45, 1.4 + i * 0.12, 2.2], [-0.5 + (i - 1.5) * 0.6, 2.0 + i * 0.15, 3.0]]), 0.12, "y", 6, 3, i), { color: i % 2 ? P.coralL : P.orange, width: 0.13, len: 0.45, speed: 0.4, phase: i * 0.25 }));
  // the girl: our guide through every room
  const girl = chibi({ coat: P.coral, coatD: P.coralD, pants: P.cobalt, hair: "#6e4630", scarf: P.gold });
  scene.add(girl.G);

  // ============ CHART STAGE (s7): sunburst backdrop, paper block columns ============
  const ST = new THREE.Group(); ST.position.x = TX; scene.add(ST);
  let hBlocks = [], eBlock, tagPK, tagBTU, labHeat, labElec, multis = [], sunDisc;
  {
    mesh(new THREE.BoxGeometry(14, 0.3, 10), planksMat("#e2bb8f", "rgba(110,72,46,.3)", [4, 3]), ST, 0, -0.15, 0);
    const rays = new THREE.Group(); rays.position.set(0, 2.2, -3.4); ST.add(rays);
    for (let i = 0; i < 24; i++) { const a0 = (i / 24) * Math.PI * 2, a1 = ((i + 1) / 24) * Math.PI * 2; cut(S.poly([[0, 0], [Math.cos(a0) * 9, Math.sin(a0) * 9], [Math.cos(a1) * 9, Math.sin(a1) * 9]]), i % 2 ? "#f6c48c" : "#f2a98f", rays, 0, 0, (i % 2) * 0.04, 0.03); }
    sunDisc = cut(S.circle(1.05), "#fff1d2", rays, 0, 0, 0.1, 0.04, { emi: "#ffe6b0", ei: 0.25 });
    cut(ring(1.25, 1.05), P.goldL, rays, 0, 0, 0.09, 0.04);
    const glow = new THREE.PointLight(0xffd29a, 2.0, 9, 1.4); glow.position.set(0, 2.2, -2.6); ST.add(glow);
    // plinth
    cut(S.rrect(3.4, 0.6, 0.06, 0, 0.3), P.cobalt, ST, 0, 0, 0.2, 1.2); card(3.4, 0.05, P.goldL, ST, 0, 0.56, 0.82, 0.01); card(3.4, 0.05, P.goldL, ST, 0, 0.08, 0.82, 0.01);
    const BH = 0.45, B0 = 0.6;
    for (let i = 0; i < 4; i++) {
      const h = i < 3 ? BH : BH * 0.47, g = new THREE.Group(); g.position.set(1.0, B0 + i * BH, 0.2); ST.add(g);
      const inner = new THREE.Group(); g.add(inner);
      cut(S.rrect(1.0, h - 0.03, 0.04, 0, h / 2), i < 3 ? (i % 2 ? P.coral : "#e98f78") : P.coralL, inner, 0, 0, 0, 0.7);
      card(1.0, 0.025, edgeOf(P.coral), inner, 0, h - 0.015, 0.355, 0.01);
      if (i < 3) { const m = print(inkTex(256, 128, (g2, w, hh) => txt(g2, `${i + 1}×`, w / 2, hh / 2, `900 92px ${SANS}`, "#fff8ec")), 0.42, 0.21, inner, 0, h / 2, 0.36); multis.push(m); }
      hBlocks.push(g);
    }
    eBlock = new THREE.Group(); eBlock.position.set(-1.0, B0, 0.2); ST.add(eBlock);
    cut(S.rrect(1.0, BH - 0.03, 0.04, 0, BH / 2), P.gold, eBlock, 0, 0, 0, 0.7);
    cut(S.poly([[0.05, 0.22], [-0.1, -0.02], [0.0, -0.02], [-0.06, -0.22], [0.12, 0.05], [0.02, 0.05]]), "#fff8ec", eBlock, 0, BH / 2, 0.36, 0.015);
    const lab = (a, b, c) => { const g = new THREE.Group(); ST.add(g); g.scale.setScalar(0.92); cut(S.rrect(1.3, 0.62, 0.06), "#fbf3e4", g, 0, 0, 0, 0.03); cut(S.rrect(1.3, 0.62, 0.06), c, g, 0.05, -0.05, -0.025, 0.02); print(inkTex(512, 240, (g2, w, h) => { txt(g2, a, w / 2, 70, `900 70px ${SANS}`, c); txt(g2, b, w / 2, 170, `900 104px ${SERIF}`, P.ink); }), 1.25, 0.59, g, 0, 0, 0.02); return g; };
    labHeat = lab("PANAS", "2,6 kW", P.coralD); labHeat.position.set(1.0, 0, 0.3);
    labElec = lab("LISTRIK", "750 W", P.goldD); labElec.position.set(-1.0, 0, 0.3);
    // swinging hang tag: 1 PK, 9.000 BTU/jam
    tagPK = new THREE.Group(); tagPK.position.set(-1.0, 3.05, 0.25); tagPK.scale.setScalar(0.85); ST.add(tagPK);
    for (const s of [-1, 1]) { const st = mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.2, 4), pm(P.ink, { flat: true }), tagPK, s * 0.45, 0.25, 0); }
    cut(S.rrect(1.5, 0.78, 0.1, 0, -0.4), "#fbf3e4", tagPK, 0, 0, 0, 0.04); cut(S.rrect(1.5, 0.78, 0.1, 0, -0.4), P.cobalt, tagPK, 0.06, -0.06, -0.03, 0.02);
    print(inkTex(512, 160, (g, w, h) => txt(g, "1 PK", w / 2, h / 2 + 4, `900 130px ${SERIF}`, P.coralD)), 1.3, 0.4, tagPK, 0, -0.28, 0.025);
    tagBTU = print(inkTex(512, 96, (g, w, h) => txt(g, "9.000 BTU/jam", w / 2, h / 2, `700 64px ${MONO}`, P.ink)), 1.3, 0.24, tagPK, 0, -0.62, 0.025);
    print(inkTex(512, 96, (g, w, h) => txt(g, "AUDIRA · CARA KERJA BENDA", w / 2, h / 2, `700 40px ${MONO}`, P.ink)), 2.4, 0.45, ST, 0, 0.15, 0.81);
  }

  // ---------- paper fold over the lens between locations ----------
  scene.add(cam);
  const foldMat = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), map: grain().a, depthTest: false, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false, transparent: true });
  const foldA = new THREE.Group(), foldB = new THREE.Group(); foldA.position.set(-0.125, 0, -0.5); foldB.position.set(0.125, 0, -0.5); cam.add(foldA); cam.add(foldB);
  const fA = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.42).translate(0.125, 0, 0), foldMat(P.mintL)); fA.renderOrder = 60; foldA.add(fA);
  const fB = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.42).translate(-0.125, 0, 0), foldMat(P.mintL)); fB.renderOrder = 60; foldB.add(fB);
  const LTS = []; for (const [g, x] of [[foldA, 0.125], [foldB, -0.125]]) { const lt = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1).translate(x, 0.02, 0.001), new THREE.MeshBasicMaterial({ map: inkTex(512, 256, (g2, w, h) => { txt(g2, "1902 →", w / 2, 70, `900 96px ${SANS}`, P.coralD); txt(g2, "HARI INI", w / 2, 180, `900 96px ${SANS}`, P.ink); }), transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false, side: THREE.DoubleSide })); lt.renderOrder = 62; g.add(lt); LTS.push(lt); }
  const folds = [[K.s4, P.mintL, true], [K.s7, P.goldL, false], [K.s8, P.coralL, false]];

  // ---------- camera: continuous moves inside each location, paper fold between locations ----------
  const k = (t, ox, p, l) => [t, p[0] + ox, p[1], p[2], l[0] + ox, l[1], l[2]];
  const C1 = track([ // shop: hook low 3/4 -> wide establishing -> push to the print -> orbit to Carrier + machine
    k(0, SX, [1.4, 1.0, 5.3], [-1.45, 1.5, -0.7]),
    k(K.s1e, SX, [1.0, 1.05, 4.8], [-1.5, 1.5, -0.7]),
    k(A("s2:percetakan"), SX, [1.9, 2.0, 6.4], [0.1, 1.45, -0.9]),
    k(A("s2:masalah"), SX, [2.2, 1.95, 5.9], [0.45, 1.5, -0.6]),
    k(A("s2:Kertasnya"), SX, [1.75, 1.85, 4.6], [0.6, 1.6, 0.1]),
    k(K.s2e, SX, [1.55, 1.8, 4.1], [0.62, 1.62, 0.15]),
    k(A("s3:Willis"), SX, [0.0, 1.2, 4.9], [-1.4, 1.05, -0.1]),
    k(A("s3:mendinginkan"), SX, [-0.9, 1.25, 5.2], [-1.45, 1.1, -0.1]),
    k(K.s4 + 0.02, SX, [-1.9, 1.3, 5.0], [-1.5, 1.15, -0.1]),
  ]);
  const C2 = track([ // house: low angle up at the unit -> macro on the fins -> round the corner, down the hose -> crane up the pipes -> roof unit
    k(K.s4, HX, [0.0, 2.15, 5.3], [0.35, 2.45, -1.6]),
    k(A("s4:Kipas"), HX, [0.3, 2.25, 4.8], [0.35, 2.5, -1.6]),
    k(K.s5, HX, [0.5, 2.1, 2.9], [0.4, 2.55, -1.5]),
    k(A("s5:mengembun"), HX, [1.0, 2.4, 1.25], [0.45, 2.78, -1.45]),
    k(A("s5:ditampung"), HX, [1.2, 2.35, 1.1], [0.7, 2.75, -1.45]),
    k(A("s5:selang") + 0.3, HX, [2.6, 2.2, 2.9], [2.4, 2.0, -1.4]),
    k(A("s5:menetes") - 0.6, HX, [4.35, 1.5, 3.2], [3.75, 0.85, -1.2]),
    k(K.s5e, HX, [4.25, 1.4, 2.9], [3.75, 0.8, -1.2]),
    k(A("s6:refrigeran"), HX, [5.6, 2.9, 2.8], [2.95, 3.1, -1.8]),
    k(A("s6:luar"), HX, [4.6, 4.9, 4.2], [1.6, 4.4, -1.2]),
    k(A("s6:kondensor"), HX, [4.1, 5.0, 4.4], [1.15, 4.5, -1.0]),
    k(A("s6:inverter"), HX, [3.5, 5.0, 4.0], [1.0, 4.6, -1.0]),
    k(K.s7 + 0.02, HX, [3.3, 5.0, 4.3], [0.9, 4.7, -1.0]),
  ]);
  const C3 = track([ // chart stage: frontal, slow push
    k(K.s7, TX, [-0.5, 1.9, 10.2], [0.0, 1.8, 0.0]),
    k(A("s7:tujuh"), TX, [0.3, 1.85, 9.6], [0.05, 1.78, 0.0]),
    k(K.s8 + 0.02, TX, [0.1, 1.85, 9.2], [0.05, 1.78, 0.0]),
  ]);
  const C4 = track([ // house payoff: pull back to the whole cutaway
    k(K.s8, HX, [1.0, 2.6, 6.5], [0.5, 2.6, -1.0]),
    k(A("s8:AUDIRA"), HX, [2.4, 3.6, 12.0], [0.4, 2.8, -1.0]),
    k(K.dur, HX, [3.0, 4.0, 14.0], [0.4, 2.85, -1.0]),
  ]);
  const camAt = (t) => (t < K.s4 ? C1(t) : t < K.s7 ? C2(t) : t < K.s8 ? C3(t) : C4(t));
  const setX = (t) => (t < K.s4 ? SX : t < K.s7 || t >= K.s8 ? HX : TX);
  const look = new THREE.Vector3(), o3 = new THREE.Object3D();
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
  const face = (dx, dz) => Math.atan2(dx, dz);

  return (t) => {
    const c = camAt(t);
    const hx = 0.03 * Math.sin(t * 0.37), hy = 0.02 * Math.sin(t * 0.53 + 1);
    cam.position.set(c[0] + hx, c[1] + hy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    // fold
    { let tc = folds[0]; for (const f of folds) if (Math.abs(t - f[0]) < Math.abs(t - tc[0])) tc = f;
      const a = clamp01((t - (tc[0] - 0.42)) / 0.42), b = clamp01((t - tc[0]) / 0.42);
      foldA.visible = t > tc[0] - 0.42 && t < tc[0]; foldB.visible = t >= tc[0] && t < tc[0] + 0.42; LTS.forEach((m) => (m.visible = tc[2]));
      foldA.rotation.y = (Math.PI / 2) * (1 - eout(a)); fA.material.color.set(tc[1]).multiplyScalar(0.8 + 0.2 * eout(a));
      foldB.rotation.y = -(Math.PI / 2) * (b * b); fB.material.color.set(tc[1]).multiplyScalar(1 - 0.2 * b); }
    gradeP.uniforms.flash.value = 0;
    const sx = setX(t);
    key.position.set(sx - 6, 11, 9); key.target.position.set(sx, 0.5, -0.5);
    backL.position.set(sx + 3, 7, -10); backL.target.position.set(sx, 1, 0);
    fill.position.set(sx + 8, 4, 10); fill.target.position.set(sx, 1.5, 0);
    SH.visible = t < K.s4 + 0.05; HO.visible = (t > K.s4 - 0.05 && t < K.s7 + 0.05) || t > K.s8 - 0.05; ST.visible = t > K.s7 - 0.05 && t < K.s8 + 0.05;

    // ---------------- SHOP ----------------
    if (SH.visible) {
      const humid = t < K.s2 ? 0 : t < K.s3 ? ramp(t, A("s2:Udaranya") - 0.4, A("s2:lembap")) : 1 - ramp(t, A("s3:mendinginkan"), A("s3:mengatur") + 0.6);
      humS.forEach((d, i) => { o3.position.set(d[0] + 0.25 * Math.sin(t * 0.3 * d[5] + d[3]), d[1] + 0.2 * Math.sin(t * d[4] * 0.6 + d[3]), d[2]); o3.rotation.set(0, t * 0.4 + d[3], 0.25 * Math.sin(t + d[3])); o3.scale.setScalar(Math.max(0.0001, humid * d[5])); o3.updateMatrix(); hum.setMatrixAt(i, o3.matrix); });
      hum.instanceMatrix.needsUpdate = true;
      const sw = Math.max(t < K.s2 ? 0.35 : 0, humid);
      sheets.forEach(({ geo, base, i }) => { const p = geo.attributes.position.array; for (let v = 0; v < p.length; v += 3) { const x = base[v], y = base[v + 1]; p[v] = x * (1 + 0.07 * sw * Math.sin(t * 1.6 + i)); p[v + 1] = y * (1 + 0.05 * sw * Math.sin(t * 1.6 + i + 1)); p[v + 2] = (0.04 + 0.1 * sw) * Math.sin(x * 8 + t * 2.2 + i) * -y; } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); });
      const mis = t < K.s2 ? 0 : t < K.s3 ? ramp(t, A("s2:warna") - 0.3, A("s2:meleset") + 0.2) : 1 - ramp(t, A("s3:mengatur"), A("s3:mengatur") + 0.8);
      const wob = 1 + 0.12 * Math.sin(t * 2.0);
      L_C.position.x = -0.06 * (1 - mis) - 0.13 * mis * wob; L_C.position.y = 0.12 + 0.05 * mis; L_M.position.x = 0.06 * (1 - mis) + 0.12 * mis * wob; L_M.position.y = 0.12 - 0.06 * mis; L_Y.rotation.z = 0.2 * mis;
      const pr = t * 2.0; rollers[0].rotation.y = pr; rollers[1].rotation.y = -pr; rollers[2].rotation.y = pr; rollers[3].rotation.z = -pr * 0.5;
      const on = t < K.s2 ? 1 : t < K.s3 ? 0 : ramp(t, A("s3:mendinginkan") - 0.4, A("s3:mendinginkan") + 0.3);
      maFan.rotation.z = -t * 8 * (0.15 + 0.85 * on); coilM.emissiveIntensity = 0.55 * on;
      needles[0].rotation.z = 0.9 - 1.6 * on; needles[1].rotation.z = 0.9 - 1.7 * (t < K.s2 ? 1 : ramp(t, A("s3:mengatur"), A("s3:kelembapannya") + 0.4));
      shopCold.forEach((f) => f(t, on)); shopWarm.forEach((f) => f(t, humid * (t < K.s3 + 1.5 ? 1 : 0)));
      // girl: watches the machine (hook), walks to the print (s2), turns to Carrier (s3)
      const wk = ramp(t, A("s2:sebuah"), A("s2:Brooklyn") + 0.6);
      const gx = -0.3 + 0.2 * wk, gz = 0.95 + 0.4 * wk;
      girl.G.position.set(SX + gx, 0, gz);
      const tgt = t < K.s3 ? (wk < 0.02 ? [-1.95, -0.45] : [0.75, 0.15]) : [-1.0, 0.1];
      girl.G.rotation.y = face(tgt[0] - gx, tgt[1] - gz) + (t >= K.s3 ? 0 : 0);
      girl.G.position.y = 0;
      chibiPose(girl, { walk: wk > 0.02 && wk < 0.98 ? 1 : 0, ph: t * 7.5, hx: t < K.s2 ? -0.35 : -0.1, aR: t < K.s2 ? 0.2 : 0.12, fR: t < K.s2 ? -1.2 : 0, eR: t < K.s2 ? 0.3 : 0 });
      wil.G.position.set(-1.05, 0, 0.6); wil.G.rotation.y = 0.25;
      wil.G.visible = t > K.s3 - 0.3;
      const pt = ramp(t, A("s3:merancang") - 0.2, A("s3:merancang") + 0.4);
      chibiPose(wil, { aL: 0.12 + 0.9 * pt, fL: -0.9 * pt, eL: 0.2, aR: 0.15, fR: -0.4 * ramp(t, A("s3:Willis") - 0.2, A("s3:Willis") + 0.3) * (1 - pt), eR: 1.2 * (1 - pt), hz: 0.05 * Math.sin(t * 0.9), hy: -0.35 * pt });
    }

    // ---------------- HOUSE ----------------
    if (HO.visible) {
      const s8 = t >= K.s8 - 0.05;
      const open = s8 ? 1 : ramp(t, A("s4:unit") - 0.2, A("s4:unit") + 0.6);
      hinge.rotation.x = -1.15 * back(open, 0.8);
      const cold = s8 ? 1 : ramp(t, A("s4:evaporator") - 0.3, A("s4:dingin"));
      finM.emissiveIntensity = 0.12 * cold + 0.03 * cold * Math.sin(t * 3); frostL.intensity = 1.1 * cold * open;
      const fan = s8 ? 1 : ramp(t, A("s4:Kipas") - 0.4, A("s4:Kipas") + 0.3);
      cff.rotation.x = t * 14 * Math.max(0.15, fan); louver.rotation.x = 0.35 + 0.2 * Math.sin(t * 0.9) * fan;
      led.material.emissiveIntensity = 1.0 + 0.6 * Math.sin(t * 4);
      roomCold.forEach((f) => f(t, fan * (t > K.s5 + 0.5 && !s8 ? 0 : 1)));
      roomWarm.forEach((f) => f(t, s8 ? 0 : win(t, K.s4 + 0.3, A("s4:Kipas") - 0.6, 0.5)));
      const cond = s8 ? 1 : ramp(t, A("s5:menyentuh"), A("s5:mengembun") + 0.3);
      iuDS.forEach((d, i) => { const u = ((t / d[2] + d[1]) % 1); const grow = clamp01(u / 0.5), slide = clamp01((u - 0.5) / 0.42); o3.position.set(d[0], 0.24 - d[3] - 0.32 * slide * slide, 0.46); o3.rotation.set(0, 0, 0); const sc = (0.5 + 0.5 * grow) * (cond < 0.02 || u > 0.93 ? 0.0001 : cond); o3.scale.set(sc, sc * (1 + 0.4 * slide), sc); o3.updateMatrix(); iuDrops.setMatrixAt(i, o3.matrix); });
      iuDrops.instanceMatrix.needsUpdate = true;
      const drip = s8 || t > A("s5:selang") - 0.5;
      for (let i = 0; i < 4; i++) { const u = ((t * 0.8 + i / 4) % 1); o3.position.set(3.32, 0.74 - 0.3 * u * u, -1.36); const sc = drip ? (u < 0.12 ? u / 0.12 : 1) : 0.0001; o3.scale.setScalar(sc); o3.updateMatrix(); hoseDrops.setMatrixAt(i, o3.matrix); }
      hoseDrops.instanceMatrix.needsUpdate = true;
      { const u = (t * 0.8) % 0.25 / 0.25; splash.scale.setScalar(drip ? 0.6 + 1.2 * u : 0.001); splash.material[0].opacity = 1; }
      const ref = s8 ? 1 : ramp(t, A("s6:Panas") - 0.4, A("s6:refrigeran"));
      const inv = t > A("s6:inverter") - 0.3 && !s8;
      const spdf = (x) => 0.5 + 0.32 * Math.sin(x * 1.1) + 0.12 * Math.sin(x * 2.3 + 1);
      const spd = inv ? spdf(t) : 0.85;
      arrHot(t, ref, 0.08 + 0.08 * spd, 1); arrCold(t, ref, 0.08 + 0.08 * spd, -1);
      const fanAng = inv ? (0.5 * t - (0.32 / 1.1) * Math.cos(t * 1.1) - (0.12 / 2.3) * Math.cos(t * 2.3 + 1)) * 16 : t * 13.6;
      ouFan.rotation.z = -fanAng;
      comp3.position.x = 0.52 + 0.006 * Math.sin(t * 60) * spd * ref;
      door.rotation.y = 1.9 * back(s8 ? 1 : ramp(t, A("s6:kompresor") - 0.5, A("s6:kompresor") + 0.3), 0.9);
      const ho = s8 ? 1 : ramp(t, A("s6:kipasnya") - 0.5, A("s6:kipasnya") + 0.6);
      heatOut.forEach((f) => f(t, ho * (0.55 + 0.45 * spd)));
      heatTag.rotation.z = Math.PI / 2 - Math.PI * (0.08 + 0.84 * spd);
      // girl: on the bed under the unit (s4, s5 start), by the plant outside (s5 end, s6), waving in the room (s8)
      if (t < A("s5:selang")) { girl.G.position.set(-1.3, 0, 0.3); girl.G.rotation.y = 0.5; chibiPose(girl, { hx: -0.45, aL: 0.3, aR: 0.3 }); girl.G.position.y = 0; }
      else if (!s8) { girl.G.position.set(4.35, 0, -1.1); girl.G.rotation.y = face(3.45 - 4.2, -1.25 + 1.05) + 0.6; chibiPose(girl, { hx: 0.15, fL: -0.3, fR: -0.7 * win(t, A("s5:menetes"), A("s5:sendiri"), 0.4), eR: 0.4, aR: 0.2 }); girl.G.position.y = 0; }
      else { girl.G.position.set(0.95, 0, 0.35); girl.G.rotation.y = 0.15; const wv = ramp(t, A("s8:AUDIRA") - 0.4, A("s8:AUDIRA") + 0.2); chibiPose(girl, { aR: 0.15 + 2.2 * wv, eR: 0.5 * wv + 0.25 * wv * Math.sin(t * 9), aL: 0.2, hz: 0.08 * Math.sin(t * 1.2) }); girl.G.position.y = 0; }
    }

    // ---------------- CHART ----------------
    if (ST.visible) {
      const tq = A("s7:PK"), t9 = A("s7:sembilan"), t2 = A("s7:dua"), t7 = A("s7:tujuh"), t3 = A("s7:tiga");
      const drop = back(clamp01((t - tq + 0.2) / 0.55), 1.3);
      tagPK.position.y = 3.05 + 2.5 * (1 - drop); tagPK.rotation.z = 0.06 * Math.sin(t * 1.4) * drop;
      tagBTU.material.opacity = 0.35 + 0.65 * ramp(t, t9, t9 + 0.3);
      hBlocks.forEach((b, i) => { const p = back(clamp01((t - (t9 - 0.6) - i * 0.3) / 0.45), 1.3); b.scale.set(1, Math.max(0.001, p), 1); });
      labHeat.scale.setScalar(Math.max(0.001, back(clamp01((t - t2 + 0.15) / 0.4)))); labHeat.position.y = 0.6 + 0.45 * 3.47 + 0.44 + 0.03 * Math.sin(t * 1.3);
      eBlock.scale.set(1, Math.max(0.001, back(clamp01((t - t7 + 0.15) / 0.45), 1.3)), 1);
      labElec.scale.setScalar(Math.max(0.001, back(clamp01((t - t7 - 0.2) / 0.4)))); labElec.position.y = 0.6 + 0.45 + 0.44 + 0.03 * Math.sin(t * 1.3 + 1);
      multis.forEach((m, i) => { const p = ramp(t, t3 - 0.15 + i * 0.25, t3 + 0.1 + i * 0.25); m.material.opacity = 0.2 + 0.8 * p; m.scale.setScalar(0.8 + 0.2 * back(p)); });
      girl.G.position.set(TX + 0.05, 0.6, 0.45); girl.G.rotation.y = 0.15;
      const pnt = ramp(t, t3 - 0.4, t3 + 0.2);
      chibiPose(girl, { aL: 0.2, aR: 0.4 + 1.3 * Math.max(pnt, win(t, t9, t2, 0.4)), fR: -0.3, hy: -0.3 * (1 - pnt) + 0.3 * pnt, hx: -0.2 });
      girl.G.position.y = 0.6;
      girl.G.scale.setScalar(1.15);
    } else girl.G.scale.setScalar(1);
    comp.render();
  };
}
