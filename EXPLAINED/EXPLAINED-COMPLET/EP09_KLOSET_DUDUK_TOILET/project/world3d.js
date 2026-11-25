// EP09 KLOSET DUDUK (INNERWORKS): a museum section model. Glazed white ceramic toilets sliced down the middle on a cut
// concrete floor block, in front of a deep-teal tiled bathroom wall, lit warm from the front and teal from behind.
//   WD    x=-3.4  washdown cutaway: wide short trap, an orange PUSH arrow
//   MAIN  x=0     siphonic cutaway with a frosted front half that peels off in the hook; tank with flapper, overflow
//                 tube, fill valve + orange float; the S-shaped trapway fills, siphons, gulps air and refills; sewer gas
//                 rising up the floor pipe stops at the water seal
//   STAGE x=3.4   three measuring beakers (13 L, 6 L, 4.8 L)
// Water: flat colour on the cut plane + a translucent volume behind it, both clipped by planes that are pure functions
// of t. Generic product, no brand marks except the AUDIRA wall plaque. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  glaze: "#f7f6f2", bisque: "#e6d6bd", navy: "#14202b", teal: "#0f6e73", tealD: "#163f45", tealL: "#7fd6e0",
  orange: "#f07b2d", orangeL: "#ffb46a", water: "#2f9fe0", waterD: "#0b4f80", gas: "#b9c95a", brass: "#c9a24a",
  concrete: "#8d8a84", pipe: "#b9c3c9", pipeIn: "#2a3238", floor: "#d6cfc3", ground: "#1b2a2e",
};
const SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";
const V2 = (x, y) => new THREE.Vector2(x, y);

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Teal-orange cinema grade: teal shadows, warm highlights, gentle contrast.
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.9,1.02,1.07),(1.0-l)*0.55);c=mix(c,c*vec3(1.06,1.0,0.92),l*0.45);
  c=(c-0.5)*1.06+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- helpers ----------
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y))); s.closePath(); return s; };
const spline = (ctrl, n = 24) => new THREE.SplineCurve(ctrl.map(([x, y]) => V2(x, y))).getPoints(n);
function offsetPath(pts, hw) {
  const L = [], R = [], n = pts.length;
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    L.push(V2(p.x + nx * hw, p.y + ny * hw)); R.push(V2(p.x - nx * hw, p.y - ny * hw));
  });
  return { L, R };
}
function extrude(shape, depth, z0, mats, parent) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
  g.translate(0, 0, z0);
  return mesh(g, mats, parent);
}
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, opacity: o.op ?? 1, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.renderOrder = o.ro ?? 5; if (parent) parent.add(m); return m;
}
// Callout card: navy card with an orange bar, white mono text. Returns a group scaled from 0 on its word.
function callout(text, w, parent, x, y, z) {
  const W = 512 * w, H = 128;
  const tex = canvasTex(W, H, (g) => {
    g.clearRect(0, 0, W, H); g.fillStyle = "rgba(20,32,43,0.94)"; g.beginPath(); g.roundRect(4, 8, W - 8, H - 16, 18); g.fill();
    g.fillStyle = P.orange; g.fillRect(4, 8, 18, H - 16);
    txt(g, text, (W + 18) / 2, H / 2 + 2, `900 54px ${SANS}`, "#ffffff");
  });
  const G = new THREE.Group(); G.position.set(x, y, z); parent.add(G);
  plane(tex, w * 0.5, 0.125, G, 0, 0, 0, { ro: 30 }).material.depthTest = false;
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x10262a, fog: 0.02, exp: 1.0, bloom: [0.22, 0.45, 0.9] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0; r.localClippingEnabled = true;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x2a3a3c);
    for (const [w, h, c, i, x, y, z] of [[6, 3, 0xfff0dc, 2.2, -3, 4, 4], [4, 4, 0xd9f3f6, 1.0, 5, 2, -2], [8, 1.5, 0xffffff, 1.4, 0, 6, 0], [8, 2, 0x6a5440, 0.5, 0, -3, 0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
  const WDX = -3.4, MX = 0, SX = 3.4;

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xcfe8ee, 0x3a2a20, 0.55));
  const key = new THREE.DirectionalLight(0xffd2a8, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -2, near: 1, far: 30 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0x7fd6e0, 1.6), fill = new THREE.DirectionalLight(0xffffff, 0.55);
  for (const l of [key, rim, fill]) { scene.add(l); scene.add(l.target); }

  // ---------- materials ----------
  const R = mulberry(909);
  const glaze = new THREE.MeshPhysicalMaterial({ color: P.glaze, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, metalness: 0 });
  const bisqTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,90,60,${0.03 + R() * 0.05})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
    g.strokeStyle = "rgba(110,80,50,0.07)"; g.lineWidth = 2;
    for (let i = -h; i < w; i += 22) { g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
  }, [3, 3]);
  const cutMat = new THREE.MeshPhysicalMaterial({ color: P.bisque, map: bisqTex, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const ghostMat = new THREE.MeshPhysicalMaterial({ color: P.glaze, roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0.32, depthWrite: false });
  const water = (planes, flat) => flat
    ? new THREE.MeshStandardMaterial({ color: P.water, emissive: P.waterD, emissiveIntensity: 0.45, roughness: 0.12, transparent: true, opacity: 0.86, clippingPlanes: planes, depthWrite: false })
    : new THREE.MeshPhysicalMaterial({ color: "#5cb8ea", roughness: 0.08, metalness: 0, transparent: true, opacity: 0.42, clippingPlanes: planes, depthWrite: false, side: THREE.DoubleSide });
  const plastic = (c, rough = 0.35) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.5 });
  const brass = new THREE.MeshStandardMaterial({ color: P.brass, metalness: 1, roughness: 0.28 });

  // ---------- room: tiled wall, cut floor block, dark ground ----------
  const tile = (base, grout, n, gloss) => canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = grout; g.fillRect(0, 0, w, h); const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const c = new THREE.Color(base).offsetHSL(0, 0, (R() - 0.5) * 0.04);
      g.fillStyle = "#" + c.getHexString(); g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
      if (gloss) { const gr = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s); gr.addColorStop(0, "rgba(255,255,255,0.10)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); }
    }
  }, [6, 3]);
  mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshStandardMaterial({ map: tile("#2f5d62", "#9fb6b3", 8, true), roughness: 0.3 }), scene, 0, 3.0, -1.5);
  const slabTop = new THREE.MeshStandardMaterial({ map: tile("#d6cfc3", "#a59c8f", 8, false), roughness: 0.55 });
  const concTex = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = P.concrete; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const v = 90 + R() * 80; g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.5)`; g.beginPath(); g.arc(R() * w, R() * h, 0.6 + R() * 2.4, 0, 6.3); g.fill(); } });
  const slabCut = new THREE.MeshStandardMaterial({ map: concTex, roughness: 0.85 });
  const slab = mesh(new THREE.BoxGeometry(11, 0.36, 1.5), [slabCut, slabCut, slabTop, slabCut, slabCut, slabCut], scene, 0, -0.18, -0.75);
  slab.material[2].map.repeat.set(5, 1);
  mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshStandardMaterial({ color: P.ground, roughness: 0.4, metalness: 0.1 }), scene, 0, -0.36, 13).rotation.x = -Math.PI / 2;
  // AUDIRA brass plaque on the wall
  const plq = mesh(new THREE.BoxGeometry(1.7, 0.42, 0.04), brass, scene, 0.1, 2.55, -1.47);
  plane(canvasTex(1024, 256, (g, w, h) => { txt(g, "AUDIRA", w / 2, 104, `900 132px ${SANS}`, "#2a2010"); txt(g, "LAB CARA KERJA BENDA", w / 2, 206, `700 48px ${MONO}`, "#3a2c14"); }), 1.6, 0.4, plq, 0, 0, 0.021, { ro: 3 });
  // plates on the cut face of the floor block
  const plate = (s, x, w = 1.3) => plane(canvasTex(1024, 160, (g, W, H) => { g.fillStyle = "rgba(20,32,43,0.9)"; g.beginPath(); g.roundRect(0, 0, W, H, 24); g.fill(); g.fillStyle = P.orange; g.fillRect(0, H - 14, W, 14); txt(g, s, W / 2, H / 2 - 4, `900 84px ${SANS}`, "#ffffff"); }), w, w * 0.156, scene, x, -0.17, 0.004, { ro: 4 });
  plate("WASHDOWN", WDX); plate("SIFONIK", 0.25); plate("SEKALI SIRAM", SX, 1.5);

  // ---------- toilet section model ----------
  // C: trapway centreline control points, hw: half width. Returns the cut-half group, ghost half, and water polygons.
  function toilet(ctrl, hw, x0, withGhost) {
    const G = new THREE.Group(); G.position.x = x0; scene.add(G);
    const C = new THREE.SplineCurve(ctrl.map(([x, y]) => V2(x, y))).getSpacedPoints(90);
    const { L, R: Rt } = offsetPath(C, hw);
    let ic = 0; C.forEach((p, i) => { if (p.y > C[ic].y && i > 10) ic = i; });
    const Bb = spline([[-0.50, 0.80], [-0.44, 0.62], [-0.32, 0.48], [Rt[0].x, Rt[0].y]]);
    const Bf = spline([[L[0].x, L[0].y], [0.12, 0.31], [0.45, 0.42], [0.72, 0.58], [0.88, 0.80]]);
    const front = spline([[0.88, 0.80], [0.93, 0.86], [0.99, 0.80], [0.95, 0.62], [0.78, 0.44], [0.52, 0.28], [0.36, 0.10], [0.32, 0.0]]);
    const end = L[L.length - 1];
    const frontPiece = poly([...Bf, ...front.slice(1), V2(0.32, -0.02), ...L.slice(1).reverse()]);
    const backOuter = spline([[-0.84, -0.02], [-0.86, 0.30], [-0.88, 0.62], [-0.96, 0.84], [-0.98, 0.90]], 12);
    const backPiece = poly([...Bb, ...Rt.slice(1), ...backOuter, V2(-0.42, 0.90), V2(-0.44, 0.84)]);
    const D = 0.5;
    for (const s of [frontPiece, backPiece]) {
      extrude(s, D, -D, [cutMat, glaze], G);
      if (withGhost) extrude(s, D, 0, [glaze, glaze], withGhost).material = ghostMat;
    }
    // seat ring (half torus) on the rim
    const seatG = (sgn) => { const g = new THREE.TorusGeometry(1, 0.05, 12, 48, Math.PI); g.rotateX(-sgn * Math.PI / 2); g.scale(0.7, 1, 0.42); return g; };
    mesh(seatG(1), glaze, G, 0.19, 0.91, 0);
    if (withGhost) mesh(seatG(-1), ghostMat, withGhost, 0.19, 0.91, 0);
    // tank shell, back panel, lid
    const tOut = poly([V2(-0.98, 0.90), V2(-0.40, 0.90), V2(-0.40, 1.62), V2(-0.98, 1.62)]);
    tOut.holes.push(new THREE.Path([V2(-0.935, 0.945), V2(-0.445, 0.945), V2(-0.445, 1.62), V2(-0.935, 1.62)]));
    extrude(tOut, 0.44, -0.44, [cutMat, glaze], G);
    mesh(new THREE.BoxGeometry(0.58, 0.72, 0.03), glaze, G, -0.69, 1.26, -0.43);
    mesh(new THREE.BoxGeometry(0.64, 0.05, 0.47), glaze, G, -0.69, 1.645, -0.225);
    if (withGhost) { extrude(tOut, 0.44, 0, [glaze, glaze], withGhost).material = ghostMat; mesh(new THREE.BoxGeometry(0.64, 0.05, 0.47), ghostMat, withGhost, -0.69, 1.645, 0.225); }
    // water: bowl+up-leg (level h), down-leg (fill band)
    const bowlS = poly([...Bb, ...Bf.slice(1)]);
    const upS = poly([...L.slice(0, ic + 1), ...Rt.slice(0, ic + 1).reverse()]);
    const dnS = poly([...L.slice(ic), ...Rt.slice(ic).reverse()]);
    const pH = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.585), pF = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.7), pT = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.7);
    const flatUp = water([pH], true), volUp = water([pH], false), flatDn = water([pF, pT], true), volDn = water([pF, pT], false);
    for (const [s, f, v] of [[bowlS, flatUp, volUp], [upS, flatUp, volUp], [dnS, flatDn, volDn]]) {
      const m = mesh(new THREE.ShapeGeometry(s), f, G, 0, 0, 0.003); m.renderOrder = 6; m.castShadow = false;
      const vm = extrude(s, D - 0.03, -D + 0.01, v, G); vm.renderOrder = 4; vm.castShadow = false;
    }
    // bowl surface sheet at level h
    const surf = mesh(new THREE.PlaneGeometry(1, D - 0.03).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#8fd3f5", roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false }), G, 0, 0.585, -D / 2);
    surf.castShadow = false;
    const wallX = (pts, h) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if ((a.y - h) * (b.y - h) <= 0 && a.y !== b.y) return a.x + ((h - a.y) / (b.y - a.y)) * (b.x - a.x); } return null; };
    const setLevel = (h, yf, yt) => {
      pH.constant = h; pF.constant = -yf; pT.constant = yt;
      const xb = wallX(Bb, h), xf = wallX(Bf, h);
      surf.visible = xb !== null && xf !== null && h > 0.32;
      if (surf.visible) { surf.position.set((xb + xf) / 2, h, -D / 2); surf.scale.x = Math.max(0.01, xf - xb); }
    };
    // pipe on the floor block face below the outlet
    return { G, C, ic, L, Rt, end, setLevel, crestY: C[ic].y };
  }

  // centre-line sampler along an array of Vector2
  const along = (pts, u, out) => { const f = clamp01(u) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i; out.set(pts[i].x + (pts[i + 1].x - pts[i].x) * k, pts[i].y + (pts[i + 1].y - pts[i].y) * k); return out; };

  const ghost = new THREE.Group(); scene.add(ghost);
  const M = toilet([[-0.14, 0.34], [-0.24, 0.24], [-0.40, 0.26], [-0.50, 0.42], [-0.52, 0.56], [-0.60, 0.64], [-0.70, 0.56], [-0.72, 0.36], [-0.68, 0.12], [-0.66, -0.02]], 0.055, MX, ghost);
  const W = toilet([[-0.14, 0.34], [-0.26, 0.26], [-0.40, 0.32], [-0.48, 0.44], [-0.56, 0.50], [-0.66, 0.42], [-0.70, 0.22], [-0.70, -0.02]], 0.085, WDX, null);
  W.setLevel(0.415, 0.6, 0.6);

  // floor pipes drawn on the cut face of the block
  const pipeStrip = (pts, hw, color, z, parent) => { const { L, R: Rr } = offsetPath(pts, hw); const m = mesh(new THREE.ShapeGeometry(poly([...L, ...Rr.reverse()])), new THREE.MeshStandardMaterial({ color, roughness: 0.4 }), parent, 0, 0, z); m.castShadow = false; m.renderOrder = 3; return m; };
  const gasPath = spline([[-1.95, -0.40], [-1.6, -0.25], [-0.85, -0.22], [-0.68, -0.12], [M.end.x - 0.055, -0.02]], 40);
  pipeStrip(gasPath, 0.075, P.pipe, 0.002, M.G); pipeStrip(gasPath, 0.05, P.pipeIn, 0.003, M.G);
  const wdPipe = spline([[-0.70, 0.0], [-0.70, -0.40]], 6);
  pipeStrip(wdPipe, 0.1, P.pipe, 0.002, W.G); pipeStrip(wdPipe, 0.075, P.pipeIn, 0.003, W.G);

  // ---------- tank internals (main) ----------
  const TG = new THREE.Group(); M.G.add(TG);
  const tw = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.45);
  const tFlat = mesh(new THREE.PlaneGeometry(0.49, 0.675), water([tw], true), TG, -0.69, 1.2825, 0.003); tFlat.castShadow = false; tFlat.renderOrder = 6;
  const tVol = mesh(new THREE.BoxGeometry(0.49, 0.675, 0.38), water([tw], false), TG, -0.69, 1.2825, -0.23); tVol.castShadow = false;
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.56, 16), plastic("#e8e4dc"), TG, -0.56, 1.24, -0.12); // overflow tube
  mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24), plastic("#e8e4dc"), TG, -0.56, 0.96, -0.12); // valve seat
  const flapH = new THREE.Group(); flapH.position.set(-0.64, 0.99, -0.12); TG.add(flapH);
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24), plastic("#e2402e", 0.5), flapH, 0.08, 0, 0);
  const rod = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8), brass, TG, -0.66, 1.31, -0.1);
  const btn = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 24), brass, M.G, -0.69, 1.69, -0.12);
  mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 12), plastic("#d8d4cc"), TG, -0.86, 1.25, -0.14); // fill valve
  const flo = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.11, 24), plastic(P.orange, 0.3), TG, -0.86, 1.4, -0.14);
  const tLevel = (t) => { const a = A("s4:terangkat"), b = A("s5:naik") + 0.6; if (t < a) return 1.45; if (t < A("s7:keran")) return 1.45 - 0.45 * ramp(t, a, b); return 1.0 + 0.45 * ramp(t, A("s7:keran"), A("s7:penuh") + 0.4); };
  // flush passage: glass pipe from the valve into the bowl, in front of the cut
  const passC = new THREE.CatmullRomCurve3([[-0.56, 0.95, 0.03], [-0.50, 0.88, 0.04], [-0.40, 0.84, 0.04], [-0.30, 0.74, 0.04]].map((p) => new THREE.Vector3(...p)));
  const passM = mesh(new THREE.TubeGeometry(passC, 24, 0.028, 12), new THREE.MeshPhysicalMaterial({ color: "#d9f3f6", roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false }), M.G);
  passM.castShadow = false;

  // ---------- particles ----------
  const dot = new THREE.SphereGeometry(1, 10, 8);
  const inst = (n, mat, parent) => { const m = new THREE.InstancedMesh(dot, mat, n); m.frustumCulled = false; m.castShadow = false; m.renderOrder = 8; parent.add(m); return m; };
  const flowP = inst(40, new THREE.MeshBasicMaterial({ color: "#dff6ff", toneMapped: false, transparent: true, opacity: 0.9 }), M.G);
  const passP = inst(14, new THREE.MeshBasicMaterial({ color: "#dff6ff", toneMapped: false }), M.G);
  const bub = inst(10, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.1, transparent: true, opacity: 0.85, emissive: "#9adfff", emissiveIntensity: 0.4 }), M.G);
  const gasP = inst(12, new THREE.MeshBasicMaterial({ color: P.gas, transparent: true, opacity: 0.55, toneMapped: false }), M.G);
  const refP = inst(10, new THREE.MeshBasicMaterial({ color: "#dff6ff", toneMapped: false }), M.G);
  const wdP = inst(30, new THREE.MeshBasicMaterial({ color: "#dff6ff", toneMapped: false }), W.G);
  const o3 = new THREE.Object3D(), v2 = V2(0, 0), NC = M.C.length - 1;
  const setI = (im, i, x, y, z, s) => { o3.position.set(x, y, z); o3.scale.setScalar(Math.max(0.0001, s)); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); };
  const passPts = passC.getSpacedPoints(30);

  // glowing flow ribbon along the main trapway (the "suck" path)
  const flowTube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(M.C.map((p) => new THREE.Vector3(p.x, p.y, 0.012))), 120, 0.012, 6), new THREE.MeshBasicMaterial({ color: P.orangeL, toneMapped: false, transparent: true, opacity: 0 }), M.G);
  flowTube.castShadow = false; flowTube.renderOrder = 9;

  // push arrows: hook (crossed) and washdown
  const arrow = (color) => { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.4 }); mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 16), m, g, 0, 0.17, 0); mesh(new THREE.ConeGeometry(0.11, 0.18, 24), m, g, 0, -0.07, 0).rotation.x = Math.PI; return g; };
  const hookArrow = arrow(P.orange); hookArrow.position.set(0.2, 1.25, 0.1); M.G.add(hookArrow);
  const cross = new THREE.Group(); hookArrow.add(cross);
  for (const s of [1, -1]) mesh(new THREE.BoxGeometry(0.42, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: "#e2402e", toneMapped: false }), cross, 0, 0.1, 0.06).rotation.z = s * 0.8;
  const wdArrow = arrow(P.orange); wdArrow.position.set(0.15, 1.2, 0.1); W.G.add(wdArrow);

  // ---------- world callouts ----------
  const cSif = callout("SALURAN SIFON", 1.0, M.G, -0.25, 0.86, 0.3);
  const cSeal = callout("SEKAT AIR", 0.8, M.G, -0.05, 0.12, 0.3);
  const cValve = callout("KATUP", 0.6, M.G, -0.25, 1.05, 0.3);
  const cFloat = callout("PELAMPUNG", 0.85, M.G, -1.25, 1.47, 0.3);
  const cGlu = plane(canvasTex(1024, 256, (g, w, h) => { txt(g, "GLUGUK!", w / 2 + 6, h / 2 + 6, `900 170px ${SANS}`, "rgba(20,32,43,0.8)"); txt(g, "GLUGUK!", w / 2, h / 2, `900 170px ${SANS}`, P.orangeL); }), 1.0, 0.25, M.G, 0.05, 0.98, 0.35, { ro: 31 });
  cGlu.material.depthTest = false;
  const cSuck = plane(canvasTex(1024, 256, (g, w, h) => { txt(g, "DISEDOT", w / 2 + 6, h / 2 + 6, `900 160px ${SANS}`, "rgba(20,32,43,0.8)"); txt(g, "DISEDOT", w / 2, h / 2, `900 160px ${SANS}`, P.orangeL); }), 0.95, 0.24, M.G, -0.95, 0.30, 0.35, { ro: 31 });
  cSuck.material.depthTest = false;

  // ---------- beakers (stage) ----------
  const ST = new THREE.Group(); ST.position.x = SX; scene.add(ST);
  mesh(new THREE.BoxGeometry(2.5, 0.16, 0.9), new THREE.MeshStandardMaterial({ color: P.navy, roughness: 0.35, metalness: 0.2 }), ST, 0, 0.08, -0.55);
  const glass = new THREE.MeshPhysicalMaterial({ color: "#e8f7fa", roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const beakers = [[13, "13 L+", "KLOSET TUA"], [6, "6 L", "BATAS AS 1994"], [4.8, "4,8 L", "MODEL HEMAT"]].map(([v, big, small], i) => {
    const x = (i - 1) * 0.78, G = new THREE.Group(); G.position.set(x, 0.16, -0.5); ST.add(G);
    const gm = mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.5, 40, 1, true), glass, G, 0, 0.75, 0); gm.castShadow = false;
    mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 40), glass, G, 0, 0.01, 0).castShadow = false;
    const liq = mesh(new THREE.CylinderGeometry(0.235, 0.235, 1, 40), new THREE.MeshPhysicalMaterial({ color: P.water, emissive: P.waterD, emissiveIntensity: 0.35, roughness: 0.1, transparent: true, opacity: 0.8 }), G, 0, 0.5, 0);
    liq.castShadow = false;
    plane(canvasTex(128, 512, (g, w, h) => { g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 3; for (let k = 0; k <= 15; k++) { const y = h - (k / 15) * h * 0.98; g.beginPath(); g.moveTo(0, y); g.lineTo(k % 5 ? 40 : 70, y); g.stroke(); } }), 0.12, 1.5, G, -0.17, 0.76, 0.252, { ro: 6 });
    const lab = plane(canvasTex(768, 320, (g, w, h) => { g.fillStyle = "rgba(20,32,43,0.92)"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 28); g.fill(); g.fillStyle = i === 2 ? P.orange : P.teal; g.fillRect(4, h - 26, w - 8, 22); txt(g, big, w / 2, 120, `900 150px ${SANS}`, i === 2 ? P.orangeL : "#ffffff"); txt(g, small, w / 2, 245, `700 56px ${MONO}`, "#cfe8ee"); }), 0.7, 0.29, G, 0, 1.78, 0.1, { ro: 20 });
    return { v, liq, lab };
  });

  // ---------- camera ----------
  const k = (t, p, l) => [t, ...p, ...l];
  const CAM = track([
    k(0, [1.5, 1.45, 7.0], [-0.05, 0.62, 0]),
    k(A("s1:menyedotnya"), [1.0, 1.2, 5.9], [-0.15, 0.55, 0]),
    k(K.s1e, [0.6, 1.25, 5.8], [-0.4, 0.55, 0]),
    k(A("s2:washdown"), [WDX + 1.0, 1.3, 6.4], [WDX, 0.6, 0]),
    k(A("s2:Eropa"), [WDX - 0.5, 1.35, 6.1], [WDX, 0.6, 0]),
    k(K.s3, [-1.0, 1.4, 7.4], [-0.6, 0.6, 0]),
    k(A("s3:melengkung"), [0.3, 1.1, 4.8], [-0.35, 0.5, 0]),
    k(A("s3:pembuangan"), [-0.1, 0.65, 4.5], [-0.55, 0.22, 0]),
    k(A("s4:sekat"), [-0.3, 0.75, 4.2], [-0.55, 0.32, 0]),
    k(A("s4:bau"), [-0.9, 0.45, 4.2], [-0.8, 0.12, 0]),
    k(A("s4:tombol"), [-0.25, 1.9, 4.7], [-0.62, 1.15, 0]),
    k(A("s4:terangkat"), [-0.45, 1.65, 4.0], [-0.6, 1.08, 0]),
    k(A("s4:menerjang"), [0.45, 1.35, 5.1], [-0.2, 0.72, 0]),
    k(K.s5, [0.6, 1.15, 4.9], [-0.1, 0.55, 0]),
    k(A("s5:puncak"), [-0.15, 1.0, 3.8], [-0.5, 0.52, 0]),
    k(A("s5:sempit"), [-0.55, 0.7, 3.6], [-0.62, 0.33, 0]),
    k(K.s6, [0.2, 0.95, 4.7], [-0.3, 0.45, 0]),
    k(A("s6:sedotan"), [0.95, 1.05, 5.7], [-0.1, 0.5, 0]),
    k(A("s6:habis"), [0.55, 1.45, 4.2], [0.1, 0.5, 0]),
    k(A("s6:udara"), [-0.2, 0.95, 3.6], [-0.3, 0.42, 0]),
    k(A("s6:khas"), [-0.05, 1.0, 4.1], [-0.25, 0.5, 0]),
    k(K.s7, [-0.4, 1.8, 4.3], [-0.68, 1.2, 0]),
    k(A("s7:penuh"), [-0.15, 1.7, 4.7], [-0.62, 1.18, 0]),
    k(A("s7:Kloset"), [SX + 0.4, 1.3, 6.2], [SX, 0.82, 0]),
    k(A("s7:hemat"), [SX - 0.35, 1.25, 5.8], [SX, 0.8, 0]),
    k(K.s8, [1.0, 1.8, 10.0], [0.0, 1.0, 0]),
    k(K.dur, [0.5, 2.0, 11.8], [0.0, 1.05, 0]),
  ]);
  const look = new THREE.Vector3();
  const setAt = (t) => (t < K.s3 ? (t < K.s2 - 0.3 ? MX : WDX) : t < A("s7:Kloset") - 0.5 ? MX : t < K.s8 ? SX : MX);

  return (t) => {
    const c = CAM(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.37), c[1] + 0.02 * Math.sin(t * 0.53 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    const sx = setAt(t);
    key.position.set(sx + 3, 5, 6); key.target.position.set(sx, 0.6, 0);
    rim.position.set(sx - 4, 4, -5); rim.target.position.set(sx, 0.8, 0);
    fill.position.set(sx, 2, 8); fill.target.position.set(sx, 0.8, 0);

    // ghost half peels away in the hook
    const pe = ramp(t, A("s1:menyedotnya") - 0.35, A("s1:menyedotnya") + 0.55);
    ghost.visible = pe < 0.999; ghost.position.set(0.15 * pe, 0.35 * pe, 1.1 * eout(pe)); ghost.rotation.x = -0.25 * pe; ghostMat.opacity = 0.32 * (1 - pe);
    // hook push arrow, crossed out
    const ha = t < K.s2 ? 1 - ramp(t, A("s1:menyedotnya") - 0.2, A("s1:menyedotnya") + 0.3) : 0;
    hookArrow.visible = ha > 0.01; hookArrow.scale.setScalar(Math.max(0.001, ha)); hookArrow.position.y = 1.25 + 0.04 * Math.sin(t * 6);
    cross.scale.setScalar(Math.max(0.001, back(ramp(t, A("s1:mendorong") - 0.1, A("s1:mendorong") + 0.25))));

    // ---- main water state ----
    const F0 = A("s4:menerjang") - 0.2, ov = A("s5:melimpah"), jt = A("s6:jatuh"), hb = A("s6:habis"), ud = A("s6:udara"), pu = A("s6:putus");
    let h = 0.585;
    if (t >= F0 && t < jt) h = 0.585 + 0.115 * ramp(t, F0, ov);
    else if (t >= jt && t < ud) h = 0.70 - 0.37 * ramp(t, jt, hb);
    else if (t >= ud && t < A("s7:keran")) h = 0.33 - 0.09 * ramp(t, ud, pu);
    else if (t >= A("s7:keran")) h = 0.24 + 0.345 * ramp(t, A("s7:keran"), A("s7:penuh") + 0.5);
    h += 0.004 * Math.sin(t * 5) * (t > F0 && t < hb ? 2 : 1);
    let yf = 0.7, yt = 0.7;
    if (t >= ov && t < pu) { yf = 0.7 - 0.75 * ramp(t, ov, A("s5:sempit")); yt = 0.71; }
    else if (t >= pu) { yf = -0.05; yt = 0.71 - 0.76 * ramp(t, pu, A("s6:khas") + 0.4); }
    M.setLevel(h, yf, yt);
    // tank
    const TL = tLevel(t); tw.constant = TL; flo.position.y = TL - 0.03;
    const lift = win(t, A("s4:terangkat") - 0.1, A("s5:naik") + 0.5, 0.25);
    flapH.rotation.z = 1.1 * lift; rod.position.y = 1.31 + 0.06 * lift;
    btn.position.y = 1.69 - 0.025 * win(t, A("s4:ditekan") - 0.05, A("s4:ditekan") + 0.35, 0.12);
    // flush through the glass passage
    const pf = win(t, A("s4:terangkat"), A("s5:naik") + 0.6, 0.2);
    for (let i = 0; i < 14; i++) { const u = (t * 1.4 + i / 14) % 1, p = passPts[Math.floor(u * (passPts.length - 1))]; setI(passP, i, p.x, p.y, p.z, 0.018 * pf); }
    passP.instanceMatrix.needsUpdate = true;
    // flow particles in the trapway: hook teaser, fill front, siphon
    const teaser = win(t, A("s1:menyedotnya"), K.s1e, 0.3);
    const siph = win(t, A("s6:penuh") - 0.3, pu, 0.4);
    const fillF = t >= ov && t < pu ? 1 : 0;
    for (let i = 0; i < 40; i++) {
      let u = ((t * (0.35 + 0.45 * siph) + i / 40) % 1), s = 0;
      if (siph > 0.01 || teaser > 0.01) s = Math.max(siph, teaser);
      else if (fillF) { const front = M.ic / NC + (1 - M.ic / NC) * ramp(t, ov, A("s5:sempit")); s = u < front ? 1 : 0; }
      along(M.C, u, v2); setI(flowP, i, v2.x, v2.y, 0.01, 0.014 * s);
    }
    flowP.instanceMatrix.needsUpdate = true;
    flowTube.material.opacity = 0.85 * Math.max(teaser, 0.6 * siph);
    // air bubbles when the bowl runs dry
    const ba = win(t, ud - 0.1, A("s6:khas") + 0.5, 0.3);
    for (let i = 0; i < 10; i++) { const u = ((t * 0.5 + i / 10) % 1) * (M.ic / NC) * 1.15; along(M.C, u, v2); setI(bub, i, v2.x + 0.01 * Math.sin(t * 9 + i), v2.y, 0.012, (0.016 + 0.01 * ((i * 7) % 3)) * ba); }
    bub.instanceMatrix.needsUpdate = true;
    // sewer gas rising up the floor pipe and the empty down leg, stopping at the seal
    const ga = win(t, K.s4 + 0.2, A("s4:tombol"), 0.4);
    const gpath = [...gasPath, ...M.C.slice(M.ic + 6).reverse()];
    for (let i = 0; i < 12; i++) { const u = (t * 0.22 + i / 12) % 1; along(gpath, u, v2); const fade = 1 - ramp(u, 0.86, 1); setI(gasP, i, v2.x + 0.015 * Math.sin(t * 3 + i), v2.y, 0.014, (0.022 + 0.012 * Math.sin(i)) * ga * fade); }
    gasP.instanceMatrix.needsUpdate = true;
    // refill jet from the fill valve
    const rf = win(t, A("s7:keran") - 0.1, A("s7:penuh") + 0.4, 0.2);
    for (let i = 0; i < 10; i++) { const u = (t * 1.6 + i / 10) % 1; setI(refP, i, -0.86 + 0.18 * u, 1.55 + 0.05 * Math.sin(u * 3.14) - 0.25 * u * u, -0.02, 0.012 * rf); }
    refP.instanceMatrix.needsUpdate = true;
    // washdown push
    const wp = win(t, A("s2:dorongan") - 0.3, K.s3 + 0.4, 0.3);
    wdArrow.scale.setScalar(Math.max(0.001, back(ramp(t, A("s2:dorongan") - 0.3, A("s2:dorongan") + 0.2)) * (1 - ramp(t, K.s3, K.s3 + 0.5))));
    wdArrow.position.y = 1.2 - 0.12 * ((t * 1.5) % 1) * wp;
    for (let i = 0; i < 30; i++) { const u = (t * 0.6 + i / 30) % 1; along(W.C, u, v2); setI(wdP, i, v2.x, v2.y, 0.01, 0.016 * wp); }
    wdP.instanceMatrix.needsUpdate = true;
    W.setLevel(0.415 + 0.06 * wp + 0.004 * Math.sin(t * 5), 0.6 - 0.65 * wp, 0.6);

    // callouts pop on their words
    const pop = (g, a, b) => { const s = back(ramp(t, a - 0.2, a + 0.2)) * (1 - ramp(t, b, b + 0.3)); g.visible = s > 0.01; g.scale.setScalar(Math.max(0.001, s)); };
    pop(cSif, A("s3:melengkung"), K.s4);
    pop(cSeal, A("s4:sekat"), A("s4:tombol"));
    pop(cValve, A("s4:katup"), K.s5);
    pop(cFloat, A("s7:pelampung"), A("s7:Kloset") - 0.6);
    pop(cSuck, A("s6:menarik"), A("s6:habis"));
    pop(cGlu, A("s6:gluguk"), K.s7);
    cGlu.rotation.z = 0.06 * Math.sin(t * 20) * win(t, A("s6:gluguk"), A("s6:gluguk") + 0.6, 0.1);

    // beakers fill on their words
    const bw = [A("s7:tiga"), A("s7:enam"), A("s7:empat#2")];
    beakers.forEach((b, i) => {
      const f = t >= K.s8 ? 1 : eout(ramp(t, bw[i] - 0.1, bw[i] + 0.9));
      const hh = Math.max(0.001, b.v * 0.1 * f); b.liq.scale.y = hh; b.liq.position.y = hh / 2 + 0.01;
      b.lab.material.opacity = 0.35 + 0.65 * (t >= K.s8 ? 1 : ramp(t, bw[i] - 0.1, bw[i] + 0.25));
    });
    comp.render();
  };
}
