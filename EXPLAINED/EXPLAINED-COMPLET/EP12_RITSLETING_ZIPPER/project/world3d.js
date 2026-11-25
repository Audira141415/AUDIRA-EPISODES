// EP12 RITSLETING (SULAMFORGE): a macro textile studio. Woven silk and linen under a low grazing key, brass teeth
// and an antique-brass slider that catch a studio environment, embroidered (satin-stitch) figures for the inventors.
//   HOOP  x=0    a beech embroidery hoop with linen; a big brass zipper sewn in the centre (crimson woven tapes),
//                slider with a cutaway top plate showing the Y channel and the wedge; a 1-inch sample strip (4 -> 10
//                teeth), a hero tooth (bump + cavity), a hero pair that nests like spoons, two steel spoons
//   HIST  x=-16  tambour frame on a songket runner: Judson (bowler hat) stitched in satin + a high boot with a row of
//                hook clasps that jam and pop open; Sundback (glasses) + a stitched patent card 1914 -> 1917
//   BOOT  x=16   a glossy rubber boot with its own zipper and an embroidered "ZIP" patch
// Generic products only, no brands. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  plum: "#4A0F24", maroon: "#6E1430", back: "#2a1219", linen: "#E4D6BC", linenS: "#CFC2A8", crimson: "#9E1B32", verm: "#D8432F",
  blush: "#F08A7E", leaf: "#3E7D4F", moss: "#24503A", saffron: "#F2B632", gold: "#E3A93E", goldD: "#A8792A", beech: "#D8B48A",
  brass: "#B88A3E", steel: "#D8DCE2", ink: "#2B1A14", skin: "#F0C9A8", cream: "#F7EADB", rubber: "#2a2424", navy: "#2C3E66",
};
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, sans-serif", MONO = "'Courier New', monospace";
const HX = 0, IX = -16, BX = 16;

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// warm documentary grade: lifted plum shadows, cream highlights
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.299,0.587,0.114));
  c+=vec3(0.03,0.012,0.018)*(1.0-l);c=mix(c,c*vec3(1.05,1.0,0.93),0.5*l);c=mix(vec3(l),c,1.1);c=(c-0.5)*1.06+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- textures ----------
function weave(base, line, rep, seed = 3, bump = false) {
  const R = mulberry(seed);
  const tx = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = bump ? "#808080" : base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) {
      const over = (i + j) % 2 === 0, x = i * 8, y = j * 8, a = 0.18 + R() * 0.12;
      g.fillStyle = bump ? (over ? `rgba(255,255,255,${a + 0.2})` : `rgba(0,0,0,${a + 0.15})`) : (over ? `rgba(255,255,255,${a * 0.5})` : line);
      if (over) g.fillRect(x + 1, y, 6, 8); else g.fillRect(x, y + 1, 8, 6);
    }
  }, rep);
  if (bump) tx.colorSpace = THREE.NoColorSpace;
  return tx;
}
function satinTex(seed) {
  const R = mulberry(seed);
  const tx = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, w, h); g.lineWidth = 3;
    for (let i = -h; i < w + h; i += 5) { g.strokeStyle = `rgba(255,255,255,${0.35 + R() * 0.4})`; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h * 0.6, h); g.stroke(); g.strokeStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.moveTo(i + 2.5, 0); g.lineTo(i + 2.5 + h * 0.6, h); g.stroke(); }
  }, [3, 3]);
  return tx;
}
const SAT = { map: null, bump: null };
function satinMat(color) {
  if (!SAT.map) { SAT.map = satinTex(11); SAT.bump = satinTex(11); SAT.bump.colorSpace = THREE.NoColorSpace; }
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), map: SAT.map, bumpMap: SAT.bump, bumpScale: 1.2, roughness: 0.42, sheen: 1, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.5), sheenRoughness: 0.35, clearcoat: 0.12 });
}
function fabric(base, line, rep, seed) { return new THREE.MeshStandardMaterial({ color: 0xffffff, map: weave(base, line, rep, seed), bumpMap: weave(base, line, rep, seed, true), bumpScale: 1.4, roughness: 0.88 }); }
function songketTex(rep) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = P.plum; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(226,176,74,.55)"; g.lineWidth = 5;
    for (let i = -8; i < 16; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 512, 512); g.stroke(); g.beginPath(); g.moveTo(i * 64 + 512, 0); g.lineTo(i * 64, 512); g.stroke(); }
    g.fillStyle = "rgba(242,182,50,.85)";
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const x = i * 64 + 32, y = j * 64; g.beginPath(); g.moveTo(x, y + 12); g.lineTo(x + 9, y + 32); g.lineTo(x, y + 52); g.lineTo(x - 9, y + 32); g.fill(); }
    g.fillStyle = "rgba(110,20,48,.6)"; for (let j = 0; j < 512; j += 4) g.fillRect(0, j, w, 1);
  }, rep);
}
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: o.rough ?? 0.85, depthWrite: false, emissive: o.emi ? new THREE.Color(o.emi) : new THREE.Color(0), emissiveMap: o.emi ? tex : null, emissiveIntensity: o.ei || 0 }));
  m.position.set(x, y, z); m.renderOrder = 2; if (parent) parent.add(m); return m;
}
// stitched lettering: thread strokes drawn as satin bands
function stitchText(s, w, h, color, font, outline = null) {
  return canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h); g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    if (outline) { g.lineWidth = 14; g.strokeStyle = outline; g.setLineDash([10, 6]); g.strokeText(s, w / 2, h / 2); g.setLineDash([]); }
    g.fillStyle = color; g.fillText(s, w / 2, h / 2);
    g.save(); g.globalCompositeOperation = "source-atop"; g.lineWidth = 2.2;
    for (let i = -h; i < w; i += 6) { g.strokeStyle = "rgba(255,255,255,.28)"; g.beginPath(); g.moveTo(i, h); g.lineTo(i + h * 0.5, 0); g.stroke(); g.strokeStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.moveTo(i + 3, h); g.lineTo(i + 3 + h * 0.5, 0); g.stroke(); }
    g.restore();
  });
}

// ---------- geometry ----------
const S = {
  rrect: (w, h, r, cx = 0, cy = 0) => { const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; },
  circle: (r, cx = 0, cy = 0) => { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; },
  poly: (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; },
};
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function ext(shape, mat, parent, x, y, z, d = 0.05, bevel = 0) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 24 }); geo.translate(0, 0, -d / 2);
  return mesh(geo, mat, parent, x, y, z);
}
const metal = (c, r = 0.25) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), metalness: 1, roughness: r });
function toothGeo() { return new THREE.ExtrudeGeometry(S.rrect(0.5, 0.19, 0.08), { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 10 }).translate(0, 0, -0.04); }
const bumpGeo = () => new THREE.SphereGeometry(0.06, 16, 10).scale(1, 1, 0.65);

// embroidered figure: satin patches (capsule limbs with bent joints), feet at y=0, ~3 tall
function capsule(parent, a, b, w, mat, z) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  const m = ext(S.rrect(L + w, w, w / 2), mat, parent, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z, 0.04); m.rotation.z = Math.atan2(dy, dx); return m;
}
function stitchedFigure(parent, { coat, pants, hat = false, glasses = false, pointR = false }) {
  const G = new THREE.Group(); parent.add(G); const parts = [];
  const mC = satinMat(coat), mP = satinMat(pants), mS = satinMat(P.skin), mH = satinMat(P.ink), mW = satinMat(P.cream);
  // legs (bent knees)
  for (const s of [-1, 1]) { parts.push(capsule(G, [s * 0.2, 1.15], [s * 0.27, 0.6], 0.2, mP, 0.0)); parts.push(capsule(G, [s * 0.27, 0.6], [s * 0.22, 0.08], 0.18, mP, 0.01)); parts.push(ext(S.rrect(0.32, 0.12, 0.05), mH, G, s * 0.28, 0.06, 0.02, 0.04)); }
  // torso: shoulders wider than waist, shirt + tie
  parts.push(ext(S.poly([[-0.55, 2.05], [0.55, 2.05], [0.34, 1.05], [-0.34, 1.05]]), mC, G, 0, 0, 0.0, 0.05));
  parts.push(ext(S.poly([[-0.12, 2.05], [0.12, 2.05], [0, 1.72]]), mW, G, 0, 0, 0.03, 0.03));
  parts.push(ext(S.poly([[-0.04, 1.98], [0.04, 1.98], [0.06, 1.6], [0, 1.52], [-0.06, 1.6]]), satinMat(P.verm), G, 0, 0, 0.04, 0.03));
  // arms: shoulder -> elbow -> hand, elbows bent
  const armR = pointR ? [[0.56, 1.98], [0.95, 1.6], [1.25, 1.85]] : [[0.56, 1.98], [0.7, 1.45], [0.5, 1.1]];
  for (const [arm, s] of [[[[-0.56, 1.98], [-0.72, 1.45], [-0.52, 1.08]], -1], [armR, 1]]) { parts.push(capsule(G, arm[0], arm[1], 0.19, mC, 0.02)); parts.push(capsule(G, arm[1], arm[2], 0.17, mC, 0.025)); parts.push(ext(S.circle(0.1), mS, G, arm[2][0], arm[2][1], 0.03, 0.04)); }
  parts.push(ext(S.rrect(0.18, 0.2, 0.05), mS, G, 0, 2.12, -0.01, 0.04));
  parts.push(ext(S.circle(0.3), mS, G, 0, 2.48, 0.0, 0.05));
  if (hat) { parts.push(ext(S.rrect(0.84, 0.08, 0.04), mH, G, 0, 2.74, 0.03, 0.04)); const d = new THREE.Shape(); d.absarc(0, 0, 0.27, 0, Math.PI, false); d.closePath(); parts.push(ext(d, mH, G, 0, 2.76, 0.03, 0.04)); }
  else { const hcap = new THREE.Shape(); hcap.absarc(0, 0, 0.32, 0.15, Math.PI - 0.15, false); hcap.closePath(); parts.push(ext(hcap, mH, G, 0, 2.52, 0.03, 0.04)); }
  if (glasses) for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.075, 0.016, 8, 20), metal(P.gold, 0.3), G, s * 0.12, 2.46, 0.06); parts.push(r); }
  // eyes + smile stitched
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshStandardMaterial({ color: P.ink }), G, s * 0.11, 2.47, 0.05);
  return { G, parts };
}

// ---------- the zipper: instanced brass teeth + woven tapes, all driven by slider position ----------
function makeZipper(parent, { n = 22, P0 = 0.4, y0 = -4.4, tape = P.crimson, wearable = true }) {
  const tg = toothGeo(), bm = metal(P.gold, 0.24);
  const teeth = new THREE.InstancedMesh(tg, bm, 2 * n), bumps = new THREE.InstancedMesh(bumpGeo(), bm, 2 * n);
  for (const im of [teeth, bumps]) { im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; parent.add(im); }
  const N = 90, yA = y0 - 0.3, yB = y0 + n * P0 + 0.5;
  const tm = fabric(tape, "rgba(60,8,20,.45)", [1, 10], 21);
  const strips = [-1, 1].map((s) => {
    const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) { uv.set([s < 0 ? 1 : 0, i / N, s < 0 ? 0 : 1, i / N], i * 4); if (i < N) { const a = 2 * i; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, tm); m.material.side = THREE.DoubleSide; m.frustumCulled = false; m.receiveShadow = true; parent.add(m); return { s, geo, pos };
  });
  const o = new THREE.Object3D(), bmx = new THREE.Matrix4().makeTranslation(0.13, 0, 0.065), mm = new THREE.Matrix4();
  // half-gap f(y): 0.15 = teeth interlocked, grows through the Y channel and above the slider
  const f = (y, sY, wear) => {
    const b = sY - 0.65, a = sY + 0.65;
    if (y < b) return 0.15 + wear * 0.42 * Math.exp(-(b - y) / 1.6);
    if (y <= a) { const u = (y - b) / 1.3; return 0.15 + wear * 0.42 * (1 - u) + 0.35 * u * u; }
    const d = y - a; return 0.5 + 0.22 * d + 0.04 * d * d;
  };
  const slope = (y, sY, wear) => (f(y + 0.01, sY, wear) - f(y - 0.01, sY, wear)) / 0.02;
  return {
    f,
    update(sY, wear = 0) {
      for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
        const y = y0 + i * P0 + (s > 0 ? P0 / 2 : 0), fx = f(y, sY, wear), sl = Math.atan(slope(y, sY, wear)), j = 2 * i + (s > 0 ? 1 : 0);
        o.position.set(s * fx, y, 0); o.rotation.set(0, 0, s < 0 ? sl : Math.PI - sl); o.scale.setScalar(1); o.updateMatrix();
        teeth.setMatrixAt(j, o.matrix); mm.multiplyMatrices(o.matrix, bmx); bumps.setMatrixAt(j, mm);
      }
      teeth.instanceMatrix.needsUpdate = bumps.instanceMatrix.needsUpdate = true;
      for (const st of strips) {
        for (let i = 0; i <= N; i++) { const y = yA + ((yB - yA) * i) / N, fx = f(y, sY, wear); st.pos.set([st.s * (fx + 0.04), y, -0.065, st.s * (fx + 0.9), y, -0.065], i * 6); }
        st.geo.attributes.position.needsUpdate = true; st.geo.computeVertexNormals();
      }
    },
  };
}
// slider: bottom plate, Y-channel walls, centre wedge, ghostable top plate, pull tab
function makeSlider(parent, f) {
  const G = new THREE.Group(); parent.add(G);
  const bm = metal(P.brass, 0.32), top = new THREE.MeshStandardMaterial({ color: new THREE.Color(P.brass), metalness: 1, roughness: 0.3, transparent: true, opacity: 1 });
  const glow = new THREE.MeshStandardMaterial({ color: new THREE.Color(P.brass), metalness: 0.8, roughness: 0.3, emissive: new THREE.Color(P.saffron), emissiveIntensity: 0 });
  ext(S.poly([[-0.62, 0.7], [0.62, 0.7], [0.48, -0.7], [-0.48, -0.7]]), bm, G, 0, 0, -0.2, 0.06, 0.02);
  for (const s of [-1, 1]) {
    const pts = [], M = 12; for (let i = 0; i <= M; i++) { const u = i / M, y = -0.65 + 1.3 * u, x = f(y, 0, 0) + 0.27; pts.push([s * x, y]); }
    for (let i = M; i >= 0; i--) { const u = i / M, y = -0.65 + 1.3 * u, x = f(y, 0, 0) + 0.35; pts.push([s * x, y]); }
    ext(S.poly(pts), glow, G, 0, 0, 0.01, 0.42);
  }
  const wedge = ext(S.poly([[-0.2, 0.66], [0.2, 0.66], [0, 0.12]]), glow, G, 0, 0, 0.01, 0.42);
  const tp = ext(S.poly([[-0.64, 0.72], [0.64, 0.72], [0.5, -0.72], [-0.5, -0.72]]), top, G, 0, 0, 0.24, 0.06, 0.02); tp.castShadow = false;
  const tab = new THREE.Group(); tab.position.set(0, -0.35, 0.33); G.add(tab);
  const ts = S.rrect(0.42, 1.25, 0.18, 0, -0.55); const hole = new THREE.Path(); hole.setFromPoints(S.rrect(0.18, 0.32, 0.08, 0, -0.95).getPoints(16)); ts.holes.push(hole);
  ext(ts, bm, tab, 0, 0, 0, 0.06, 0.015);
  ext(S.rrect(0.3, 0.16, 0.06), bm, tab, 0, 0.05, -0.04, 0.08);
  // press arrows (Y arms push teeth together) and split arrows (wedge pushes them apart)
  const am = new THREE.MeshStandardMaterial({ color: P.saffron, emissive: new THREE.Color(P.saffron), emissiveIntensity: 0.8 });
  const ar = (x, y, rz) => { const c = mesh(new THREE.ConeGeometry(0.07, 0.2, 12), am, G, x, y, 0.32); c.rotation.z = rz; return c; };
  const press = [ar(-0.78, 0.2, -Math.PI / 2), ar(0.78, 0.2, Math.PI / 2)], split = [ar(-0.32, 0.5, Math.PI / 2), ar(0.32, 0.5, -Math.PI / 2)];
  return { G, top, glow, tab, press, split, wedge };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x2a1219, fog: 0.012, exp: 0.9, bloom: [0.18, 0.5, 0.9] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  comp.insertPass(new ShaderPass(NanGuard), 1); comp.addPass(new ShaderPass(Grade));
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x3a2a24);
    for (const [w, h, c, i, x, y, z] of [[6, 3, 0xfff1dc, 2.2, -3, 4, 3], [4, 4, 0xe9eef6, 1.0, 4, 2, 2], [8, 2, 0x8a5a40, 0.7, 0, -3, 0], [3, 6, 0xffd9a6, 1.4, 0, 1, -4]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.95;
  scene.add(cam);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x3a1a22, 0.75));
  const key = new THREE.DirectionalLight(0xffe2c0, 3.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 60 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffb070, 2.0); scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0xdfe6f2, 0.6); scene.add(fill, fill.target);
  const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), new THREE.MeshStandardMaterial({ map: songketTex([10, 6]), roughness: 0.8, metalness: 0.2 }));
  bgPlane.position.set(0, 0, -6); bgPlane.receiveShadow = true; scene.add(bgPlane);

  // ============ HOOP ============
  const HO = new THREE.Group(); HO.position.x = HX; scene.add(HO);
  const lin = mesh(new THREE.CircleGeometry(5.5, 64), fabric(P.linen, "rgba(150,130,100,.35)", [16, 16], 5), HO, 0, 0, -0.14);
  for (const z of [-0.1, -0.22]) mesh(new THREE.TorusGeometry(5.6, 0.17, 18, 96), new THREE.MeshStandardMaterial({ color: P.beech, roughness: 0.55 }), HO, 0, 0, z);
  mesh(new THREE.BoxGeometry(0.5, 0.5, 0.6), metal(P.brass, 0.3), HO, 0, 5.75, -0.16);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16).rotateZ(Math.PI / 2), metal(P.steel, 0.3), HO, 0, 5.75, -0.16);
  // running stitches around the zipper (sewn in)
  { const dm = satinMat(P.saffron); for (const s of [-1, 1]) for (let i = 0; i < 26; i++) { const d = mesh(new THREE.CapsuleGeometry(0.025, 0.16, 4, 8), dm, HO, s * 1.06, -4.6 + i * 0.36, -0.05); } }
  const Z = makeZipper(HO, {});
  const SL = makeSlider(HO, Z.f);
  // woven label at the top of the tapes + embroidered signature on the linen (anti-reupload)
  ext(S.rrect(1.5, 0.5, 0.06), fabric(P.cream, "rgba(120,100,80,.3)", [3, 1], 9), HO, 0, 4.85, -0.02, 0.03);
  plane(stitchText("AUDIRA", 512, 160, P.crimson, `900 112px ${SANS}`), 1.4, 0.44, HO, 0, 4.85, 0.0);
  plane(stitchText("AUDIRA · CARA KERJA BENDA", 1024, 128, P.goldD, `900 64px ${SERIF}`), 4.2, 0.52, HO, 0, -4.95, -0.08);
  // sample strip: one inch, 4 teeth -> 10 teeth
  const SS = new THREE.Group(); SS.position.set(-3.0, 0.2, 0); HO.add(SS);
  ext(S.rrect(0.75, 2.6, 0.05), fabric(P.navy, "rgba(10,20,40,.4)", [1, 4], 17), SS, -0.25, 0, -0.06, 0.03);
  const rulerT = canvasTex(160, 512, (g, w, h) => { g.fillStyle = "#f4ead4"; g.fillRect(0, 0, w, h); g.fillStyle = P.ink; for (let i = 0; i <= 16; i++) { const y = 56 + (i * 400) / 16; g.fillRect(0, y - 2, i % 4 ? 36 : 70, 4); } txt(g, "1", 112, 50, `900 44px ${SANS}`, P.crimson); txt(g, "INCI", 112, 96, `900 30px ${SANS}`, P.ink); txt(g, "0", 112, 456, `900 44px ${SANS}`, P.crimson); });
  plane(rulerT, 0.55, 2.4, SS, 0.55, 0.2, -0.02, { rough: 0.9 });
  const sTeeth = new THREE.InstancedMesh(toothGeo(), metal(P.gold, 0.24), 10); sTeeth.frustumCulled = false; sTeeth.castShadow = true; SS.add(sTeeth);
  // hero tooth (bump on the front, cavity on the back) and its twin
  const toothHero = () => { const g = new THREE.Group(); const m = metal(P.gold, 0.22); mesh(toothGeo(), m, g); mesh(bumpGeo(), m, g, 0.13, 0, 0.065); mesh(new THREE.CylinderGeometry(0.058, 0.05, 0.03, 20).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.6, metalness: 0.4 }), g, 0.13, 0, -0.052); return g; };
  const HT = new THREE.Group(); HT.position.set(3.0, 0.6, 0.6); HO.add(HT);
  const hA = toothHero(); hA.scale.setScalar(3.2); HT.add(hA);
  const hB = toothHero(); hB.scale.setScalar(3.2); HT.add(hB);
  // two steel spoons that nest
  const spoon = () => { const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 0.5; pts.push(new THREE.Vector2(Math.sin(a) * 0.32 + 0.001, -Math.cos(a) * 0.12)); } const bowl = mesh(new THREE.LatheGeometry(pts, 32), new THREE.MeshStandardMaterial({ color: P.steel, metalness: 1, roughness: 0.18, side: THREE.DoubleSide }), g); bowl.scale.set(1, 1, 1.45); mesh(new THREE.BoxGeometry(0.09, 0.03, 1.1), metal(P.steel, 0.2), g, 0, 0.0, 0.95); g.rotation.x = Math.PI / 2 - 0.25; return g; };
  const SP = new THREE.Group(); SP.position.set(3.1, -2.3, 0.5); HO.add(SP);
  const sp1 = spoon(); SP.add(sp1); const sp2 = spoon(); SP.add(sp2);

  // ============ HISTORY ============
  const HI = new THREE.Group(); HI.position.x = IX; scene.add(HI);
  mesh(new THREE.BoxGeometry(12, 0.2, 7), new THREE.MeshStandardMaterial({ map: songketTex([4, 2]), roughness: 0.75, metalness: 0.25 }), HI, 0, -2.6, 0.5);
  ext(S.rrect(7.4, 5.0, 0.1), fabric(P.linen, "rgba(150,130,100,.35)", [10, 7], 7), HI, 0, 0.4, -1.3, 0.06);
  for (const [w, h, x, y] of [[7.8, 0.22, 0, 2.95], [7.8, 0.22, 0, -2.15], [0.22, 5.3, -3.85, 0.4], [0.22, 5.3, 3.85, 0.4]]) mesh(new THREE.BoxGeometry(w, h, 0.25), new THREE.MeshStandardMaterial({ color: P.beech, roughness: 0.55 }), HI, x, y, -1.22);
  const jud = stitchedFigure(HI, { coat: "#3B3550", pants: "#2a2638", hat: true, pointR: true }); jud.G.position.set(-2.1, -1.65, -1.2); jud.G.scale.setScalar(1.05);
  const sun = stitchedFigure(HI, { coat: "#5B6E5A", pants: "#38463a", glasses: true }); sun.G.position.set(1.7, -1.65, -1.2); sun.G.scale.setScalar(1.05);
  plane(stitchText("1893", 256, 96, P.saffron, `900 72px ${SERIF}`), 0.9, 0.34, HI, -2.1, 2.45, -1.2);
  plane(stitchText("1914–1917", 512, 96, P.saffron, `900 66px ${SERIF}`), 1.6, 0.3, HI, 1.7, 2.45, -1.2);
  // high boot with a row of hook clasps (clasp locker)
  const BO = new THREE.Group(); BO.position.set(-1.1, -2.5, 0.6); BO.rotation.y = 0.35; HI.add(BO);
  const bootShape = S.poly([[-0.9, 0], [1.1, 0], [1.28, 0.18], [1.05, 0.44], [0.5, 0.72], [0.38, 2.2], [0.38, 2.4], [-0.55, 2.4], [-0.62, 1.0], [-0.9, 0.35]]);
  ext(bootShape, new THREE.MeshStandardMaterial({ color: "#5a3a2a", roughness: 0.55, map: weave("#5a3a2a", "rgba(30,15,10,.4)", [3, 3], 4) }), BO, 0, 0, 0, 0.8, 0.05);
  const hooks = [];
  for (let i = 0; i < 6; i++) {
    const y = 0.95 + i * 0.24; mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), metal(P.steel, 0.3), BO, 0.42, y, 0.47);
    const h = new THREE.Group(); h.position.set(0.3, y, 0.48); BO.add(h);
    mesh(new THREE.BoxGeometry(0.2, 0.07, 0.04), metal(P.gold, 0.3), h, 0.06, 0, 0); mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 16, Math.PI), metal(P.gold, 0.3), h, 0.17, 0, 0.02);
    hooks.push(h);
  }
  // stitched patent card + wax seal
  const PC = new THREE.Group(); PC.position.set(1.9, -1.4, 0.7); PC.rotation.set(-0.25, -0.2, 0.04); HI.add(PC);
  ext(S.rrect(1.9, 2.3, 0.06), fabric(P.cream, "rgba(120,100,80,.25)", [4, 4], 13), PC, 0, 0, 0, 0.04);
  plane(canvasTex(512, 620, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = P.crimson; g.lineWidth = 8; g.setLineDash([18, 10]); g.strokeRect(22, 22, w - 44, h - 44); g.setLineDash([]); txt(g, "PATEN", w / 2, 110, `900 92px ${SERIF}`, P.ink); g.fillStyle = P.goldD; g.fillRect(90, 170, w - 180, 6); txt(g, "DIAJUKAN", w / 2, 250, `700 46px ${MONO}`, P.ink); txt(g, "1914", w / 2, 320, `900 80px ${SERIF}`, P.crimson); txt(g, "TERBIT", w / 2, 420, `700 46px ${MONO}`, P.ink); txt(g, "1917", w / 2, 490, `900 80px ${SERIF}`, P.crimson); }), 1.75, 2.12, PC, 0, 0, 0.025);
  const seal = mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.08, 28).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: P.verm, roughness: 0.4, emissive: new THREE.Color(P.crimson), emissiveIntensity: 0.15 }), PC, 0.62, -0.8, 0.07);

  // ============ BOOT ============
  const BT = new THREE.Group(); BT.position.x = BX; scene.add(BT);
  mesh(new THREE.BoxGeometry(12, 0.2, 7), new THREE.MeshStandardMaterial({ map: songketTex([4, 2]), roughness: 0.75, metalness: 0.25 }), BT, 0, -2.6, 0.5);
  const RB = new THREE.Group(); RB.position.set(-0.2, -2.5, 0.2); BT.add(RB);
  ext(S.poly([[-1.2, 0], [1.5, 0], [1.75, 0.3], [1.4, 0.75], [0.7, 1.0], [0.6, 3.6], [-0.9, 3.6], [-0.95, 1.2], [-1.25, 0.45]]), new THREE.MeshPhysicalMaterial({ color: P.rubber, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25 }), RB, 0, 0, 0, 1.1, 0.08);
  ext(S.rrect(3.0, 0.22, 0.05, 0.25, 0.11), new THREE.MeshStandardMaterial({ color: "#151212", roughness: 0.7 }), RB, 0, 0, 0, 1.2);
  const zb = new THREE.Group(); zb.position.set(-0.15, 2.15, 0.64); zb.scale.setScalar(0.32); RB.add(zb);
  const Z2 = makeZipper(zb, { n: 10, y0: -2.0, tape: "#3a3434" }); const SL2 = makeSlider(zb, Z2.f);
  plane(stitchText("AUDIRA", 384, 96, P.cream, `900 64px ${SANS}`), 0.9, 0.22, RB, 0.95, 0.42, 0.62);
  const zip = plane(stitchText("ZIP!", 768, 320, P.saffron, `900 250px ${SANS}`, P.crimson), 3.2, 1.33, BT, 0.4, 2.6, -1.0, { emi: P.saffron, ei: 0.25 });
  plane(stitchText("1923", 256, 96, P.cream, `900 72px ${SERIF}`), 1.0, 0.38, BT, -2.2, 1.6, -1.0);

  // ============ curtain wipe (songket cloth sweeps across the lens) ============
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.9), new THREE.MeshBasicMaterial({ map: songketTex([1.2, 1.8]), depthTest: false, depthWrite: false }));
  curtain.position.z = -0.6; curtain.renderOrder = 999; cam.add(curtain);
  const hem = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.9), new THREE.MeshBasicMaterial({ color: P.saffron, depthTest: false })); hem.renderOrder = 1000; hem.position.set(-0.31, 0, 0.001); curtain.add(hem);
  const cuts = [K.s2, K.s4, K.s7, K.s8];

  // ---------- slider schedule + wear ----------
  const sAt = (t) => {
    if (t < K.s2) return 0.4 + 1.2 * ramp(t, 0.6, K.s1e);
    if (t < K.s6) return 3.5;
    if (t < K.s7) {
      const down1 = ramp(t, A("s6:slider") - 0.2, A("s6:tarik") + 0.3), up = ramp(t, A("s6:atas") - 0.1, A("s6:mengunci") + 0.2), down2 = ramp(t, A("s6:bawah") - 0.1, A("s6:membelah") + 0.4);
      return 3.5 - 4.6 * down1 + 3.5 * up - 3.6 * down2;
    }
    return 1.0;
  };
  const wearAt = (t) => (t < K.s8 ? 0 : ramp(t, A("s8:aus") - 0.3, A("s8:aus") + 0.8));

  // ---------- camera ----------
  const k = (t, ox, p, l) => [t, p[0] + ox, p[1], p[2], l[0] + ox, l[1], l[2]];
  const C2 = track([
    k(K.s2, IX, [-1.8, 0.4, 8.2], [-1.6, -0.2, -0.4]),
    k(A("s2:sepatu"), IX, [-1.2, -0.4, 6.0], [-1.3, -0.9, 0.1]),
    k(A("s2:macet"), IX, [-0.7, -0.9, 4.4], [-0.9, -1.25, 0.6]),
    k(K.s2e, IX, [-0.5, -0.95, 4.1], [-0.85, -1.3, 0.6]),
    k(A("s3:memperbaikinya"), IX, [1.3, 0.45, 7.4], [1.5, -0.1, -0.4]),
    k(A("s3:diajukan"), IX, [2.0, -0.4, 5.0], [1.8, -1.1, 0.4]),
    k(K.s4 + 0.02, IX, [2.2, -0.45, 4.6], [1.9, -1.15, 0.5]),
  ]);
  const C4 = track([
    k(K.s4, HX, [-3.4, 0.6, 5.6], [-2.8, 0.2, 0]),
    k(A("s4:sepuluh"), HX, [-3.0, 0.5, 4.6], [-2.85, 0.2, 0]),
    k(A("s4:tonjolan") - 0.3, HX, [2.3, 1.2, 4.4], [3.0, 0.5, 0.5]),
    k(K.s5, HX, [3.6, 1.0, 4.0], [3.0, 0.5, 0.5]),
    k(A("s5:dirapatkan"), HX, [0.7, 0.6, 3.4], [0.0, 0.1, 0]),
    k(A("s5:masuk") - 0.2, HX, [1.0, 0.3, 3.2], [0.1, 0.0, 0]),
    k(A("s5:sendok"), HX, [3.7, -0.4, 4.4], [3.05, -0.9, 0.4]),
    k(A("s5:cukup"), HX, [1.9, 0.3, 7.2], [1.4, 0.0, 0]),
    k(K.s6, HX, [1.2, 2.9, 5.0], [0.2, 2.6, 0]),
  ]);
  const C7 = track([
    k(K.s7, BX, [-1.6, 0.8, 9.5], [0.0, 0.0, 0]),
    k(A("s7:bot"), BX, [-0.4, 0.5, 8.0], [0.1, -0.1, 0]),
    k(A("s7:Zip") - 0.4, BX, [0.3, 0.9, 6.4], [0.2, 0.6, 0]),
    k(K.s8 + 0.02, BX, [0.5, 1.0, 5.9], [0.25, 0.7, 0]),
  ]);
  const C8 = track([
    k(A("s8:AUDIRA") - 0.6, HX, [0.9, 0.5, 4.6], [0.0, 0.3, 0]),
    k(A("s8:Episode"), HX, [0.6, 0.0, 15.5], [0.0, 0.3, 0]),
    k(K.dur, HX, [0.4, -0.2, 18.5], [0.0, 0.3, 0]),
  ]);
  // follow the slider (hook, s6 and the start of s8)
  const follow = (t, sY, d, side) => [side + 0.25 * Math.sin(t * 0.4), sY + 0.55, d, 0, sY - 0.05, 0];
  const camAt = (t, sY) => {
    if (t < K.s2) return follow(t, sY, 3.9 - 0.5 * ramp(t, 0, K.s1e), 1.0);
    if (t < K.s4) return C2(t);
    if (t < K.s6) return C4(t);
    if (t < K.s7) { const f = follow(t, sY, 3.6, 0.9), c = C4(K.s6), m = ramp(t, K.s6, K.s6 + 1.2); return f.map((v, i) => c[i] + (v - c[i]) * m); }
    if (t < K.s8) return C7(t);
    const f = follow(t, sY, 3.8, 0.9), c = C8(t), m = ramp(t, A("s8:AUDIRA") - 0.6, A("s8:AUDIRA") + 0.4); return f.map((v, i) => v + (c[i] - v) * m);
  };
  const look = new THREE.Vector3(), o3 = new THREE.Object3D();
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
  const stX = (t) => (t >= K.s2 && t < K.s4 ? IX : t >= K.s7 && t < K.s8 ? BX : HX);

  return (t) => {
    const sY = sAt(t), wear = wearAt(t);
    const c = camAt(t, sY);
    cam.position.set(c[0] + 0.02 * Math.sin(t * 0.37), c[1] + 0.015 * Math.sin(t * 0.53 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    { let cc = cuts[0]; for (const x of cuts) if (Math.abs(t - x) < Math.abs(t - cc)) cc = x; const u = (t - cc) / 0.45; curtain.visible = Math.abs(u) < 1; curtain.position.x = -0.62 * u; }
    const sx = stX(t);
    key.position.set(sx - 9, 2.5, 6); key.target.position.set(sx, 0, 0);
    rim.position.set(sx + 6, 6, -6); rim.target.position.set(sx, 0.5, 0);
    fill.position.set(sx + 7, 3, 10); fill.target.position.set(sx, 0, 0);
    HO.visible = sx === HX || Math.abs(t - K.s2) < 0.05 || Math.abs(t - K.s8) < 0.05; HI.visible = sx === IX; BT.visible = sx === BX;

    if (HO.visible) {
      Z.update(sY, wear);
      SL.G.position.set(0, sY, 0);
      const cut = t < K.s2 ? ramp(t, A("s1:jalur") - 0.3, A("s1:Y")) : t < K.s6 ? 0 : t < K.s7 ? ramp(t, K.s6 - 0.2, A("s6:slider")) : 1 - ramp(t, A("s8:giginya"), A("s8:giginya") + 0.6);
      SL.top.opacity = 1 - 0.85 * cut; SL.top.depthWrite = cut < 0.5;
      const pr = Math.max(win(t, A("s6:menyatu"), A("s6:bawah") - 0.2, 0.25), t < K.s2 ? win(t, A("s1:Y"), K.s1e, 0.3) : 0), spv = win(t, A("s6:baji"), K.s6e, 0.25);
      SL.press.forEach((a, i) => { a.visible = pr > 0.02; a.scale.setScalar(Math.max(0.001, pr)); a.position.x = (i ? 1 : -1) * (0.78 - 0.06 * Math.sin(t * 9)); });
      SL.split.forEach((a, i) => { a.visible = spv > 0.02; a.scale.setScalar(Math.max(0.001, spv)); a.position.x = (i ? 1 : -1) * (0.32 + 0.05 * Math.sin(t * 9)); });
      const gl = Math.max(pr, spv, t < K.s2 ? cut * 0.6 : 0);
      SL.glow.emissive.set(wear > 0.05 ? P.verm : P.saffron); SL.glow.emissiveIntensity = 0.5 * gl + wear * (0.5 + 0.3 * Math.sin(t * 7));
      SL.tab.rotation.x = 0.25 + 0.15 * Math.sin(t * 1.3);
      // sample strip
      const m10 = ramp(t, A("s4:sepuluh") - 0.3, A("s4:sepuluh") + 0.5);
      for (let i = 0; i < 10; i++) { const y4 = -1.0 + (i + 0.5) * 0.5, y10 = -1.0 + (i + 0.5) * 0.2; o3.position.set(0, i < 4 ? y4 + (y10 - y4) * m10 : y10, 0); o3.rotation.set(0, 0, 0); o3.scale.setScalar(Math.max(0.0001, i < 4 ? 1.7 - 0.9 * m10 : 0.8 * back(clamp01((m10 - i * 0.05) * 1.6)))); o3.updateMatrix(); sTeeth.setMatrixAt(i, o3.matrix); }
      sTeeth.instanceMatrix.needsUpdate = true;
      // hero tooth: turns to show the bump, then flips to show the cavity; twin slides in and nests
      const flip = ramp(t, A("s4:cekungan") - 0.3, A("s4:cekungan") + 0.4) * (1 - ramp(t, K.s5, K.s5 + 0.6));
      hA.rotation.set(-0.5 + 0.1 * Math.sin(t * 0.8), Math.PI * flip + 0.3 * Math.sin(t * 0.5) * (1 - flip), 0);
      const nest = ramp(t, A("s5:masuk") - 0.4, A("s5:masuk") + 0.6), twin = ramp(t, K.s5 + 0.2, A("s5:dirapatkan"));
      hB.visible = t > K.s5;
      hB.position.set(0.85 - 0.42 * nest + 1.2 * (1 - twin), 0.0, 0.42 - 0.2 * nest); hB.rotation.set(-0.5, 0, Math.PI);
      const sn = ramp(t, A("s5:sendok") - 0.4, A("s5:sendok") + 0.5);
      sp2.position.set(0, 0.0, 0.08 + 0.9 * (1 - sn)); sp2.rotation.x = Math.PI / 2 - 0.25 - 0.3 * (1 - sn);
      SP.visible = t > K.s5 - 0.1 && t < K.s6 + 0.5;
    }
    if (HI.visible) {
      const jp = ramp(t, K.s2 - 0.2, A("s2:Judson") + 0.4), spn = ramp(t, A("s3:Gideon") - 0.5, A("s3:Gideon") + 0.6);
      jud.parts.forEach((m, i) => m.scale.setScalar(Math.max(0.001, back(clamp01(jp * 1.8 - i * 0.04)))));
      sun.parts.forEach((m, i) => m.scale.setScalar(Math.max(0.001, back(clamp01(spn * 1.8 - i * 0.04)))));
      const jam = win(t, A("s2:macet"), A("s2:terbuka"), 0.2), pop = ramp(t, A("s2:terbuka") - 0.1, A("s2:terbuka") + 0.5);
      hooks.forEach((h, i) => { const d = clamp01(pop * 1.6 - i * 0.12); h.rotation.z = -0.15 * jam * Math.sin(t * 40 + i) - 1.9 * back(d, 2.2); h.position.x = 0.3 + 0.12 * d; });
      const pt = ramp(t, A("s3:diajukan") - 0.4, A("s3:diajukan") + 0.4);
      PC.position.y = -1.4 - 2.2 * (1 - eout(clamp01((t - A("s3:memperbaikinya") + 0.6) / 0.8)));
      seal.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:terbit") + 0.1) / 0.35), 2.5))); seal.material.emissiveIntensity = 0.15 + 0.4 * pt * win(t, A("s3:terbit"), K.s3e, 0.3);
    }
    if (BT.visible) {
      const zp = ramp(t, A("s7:Zip") - 0.15, A("s7:Zip") + 0.25);
      Z2.update(-1.2 + 3.5 * zp + 0.6 * ramp(t, K.s7, A("s7:bot")) * (1 - zp), 0); SL2.G.position.set(0, -1.2 + 3.5 * zp + 0.6 * ramp(t, K.s7, A("s7:bot")) * (1 - zp), 0); SL2.top.opacity = 1;
      SL2.press.concat(SL2.split).forEach((a) => (a.visible = false));
      zip.scale.setScalar(Math.max(0.001, 0.25 + 0.75 * back(clamp01((t - A("s7:Zip") + 0.05) / 0.3), 2.4))); zip.material.opacity = ramp(t, A("s7:Zip") - 0.1, A("s7:Zip") + 0.1); zip.rotation.z = -0.06 + 0.02 * Math.sin(t * 3);
      RB.rotation.y = -0.35 + 0.15 * Math.sin(t * 0.35);
    }
    comp.render();
  };
}
