// EP05 DOOM vs WINDOWS 95 (Y2KCHROME): an aqua/lilac Frutiger-aero sky with glossy clouds, iridescent bubbles and liquid-chrome
// late-90s hardware. Doom is only a chrome floppy labelled "DOOM"; Windows 95 is only a chrome CD labelled "Windows 95".
// Bill Gates is a trench-coat silhouette with a name plate in an abstract chrome corridor. Illustration only, no real logos, UI or game art.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const X = [0, 40, 80, 120, 160, 200, 240, 280];
const SANS = "'Segoe UI', Arial, sans-serif", BLACK = "'Arial Black', 'Segoe UI', Arial, sans-serif", MONO = "'Courier New', monospace";
const NAVY = "#06306E";

// NaN/Inf guard before bloom: one bad pixel otherwise spreads into black blocks.
const SafeShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0); gl_FragColor = clamp(c, 0.0, 64.0); }`,
};

function gradSphere(radius, stops) {
  const geo = new THREE.SphereGeometry(radius, 48, 32);
  const pos = geo.attributes.position, cols = [];
  const cs = stops.map(([k, c]) => [k, new THREE.Color(c)]);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / radius;
    let c = cs[0][1].clone();
    for (let s = 0; s < cs.length - 1; s++) if (y >= cs[s][0] && y <= cs[s + 1][0]) c = cs[s][1].clone().lerp(cs[s + 1][1], (y - cs[s][0]) / (cs[s + 1][0] - cs[s][0]));
    if (y > cs[cs.length - 1][0]) c = cs[cs.length - 1][1].clone();
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  return geo;
}
const SKY = [[-1, "#7A5CFF"], [-0.25, "#7F98FF"], [-0.06, "#4FD0E8"], [0.01, "#9EEAFF"], [0.08, "#2FB0FF"], [0.3, "#1E66E6"], [0.6, "#2B3CC8"], [1, "#4E2BB8"]];

function envFrom(r, build) {
  const s = new THREE.Scene(); build(s);
  const pm = new THREE.PMREMGenerator(r); const tex = pm.fromScene(s, 0.02).texture; pm.dispose(); return tex;
}
const panel = (s, w, h, color, pos, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };

// rounded box: extruded rounded rectangle with a bevel, centred
function rbox(w, h, d, r) {
  const b = Math.min(r, d * 0.45), iw = w - 2 * b, ih = h - 2 * b, rr = Math.min(r, iw / 2, ih / 2) * 0.6;
  const s = new THREE.Shape(), x = -iw / 2, y = -ih / 2;
  s.moveTo(x + rr, y); s.lineTo(x + iw - rr, y); s.quadraticCurveTo(x + iw, y, x + iw, y + rr); s.lineTo(x + iw, y + ih - rr); s.quadraticCurveTo(x + iw, y + ih, x + iw - rr, y + ih);
  s.lineTo(x + rr, y + ih); s.quadraticCurveTo(x, y + ih, x, y + ih - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -(d - 2 * b) / 2); g.computeVertexNormals(); return g;
}
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let key = null;
  return { tex, paint(k, fn) { if (k === key) return; key = k; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; } };
}
const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, ...o });
const plane = (w, h, map, o) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic(map, o));
// glossy aero pill label, text only
function pill(text, { w = 768, h = 160, fs = 76, ink = NAVY, font = BLACK, size = 4 } = {}) {
  const tx = canvasTex(w, h, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,.98)"); gr.addColorStop(0.48, "rgba(236,248,255,.92)"); gr.addColorStop(0.52, "rgba(190,232,255,.92)"); gr.addColorStop(1, "rgba(255,255,255,.97)");
    g.fillStyle = gr; rrect(g, 6, 6, w - 12, h - 12, (h - 12) / 2); g.fill(); g.lineWidth = 5; g.strokeStyle = "rgba(120,170,255,.9)"; g.stroke();
    g.fillStyle = ink; g.font = `900 ${fs}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 3);
  });
  return plane(size, (size * h) / w, tx);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x7fd0ff, exp: 0.86, bloom: [0.32, 0.45, 1.05], fov: 38, shadow: false });
  comp.insertPass(new ShaderPass(SafeShader), 1);
  const A = (k) => AT[k];

  // ---- environments: chrome gets hard softbox strips over dark navy bands; everything else a soft sky ----
  const envC = envFrom(r, (s) => {
    s.add(new THREE.Mesh(gradSphere(20, [[-1, "#060B2A"], [-0.45, "#0B1650"], [-0.22, "#2B3F9A"], [-0.12, "#0A1446"], [-0.02, "#1A2C78"], [0.0, "#EAF8FF"], [0.22, "#A8DCFF"], [0.6, "#4A8EF2"], [1, "#2E5FD8"]]), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    panel(s, 11, 3.2, "#FFFFFF", [0, 14, 7], 3.2);
    panel(s, 2.6, 12, "#FFFFFF", [-14, 3, 5], 2.6);
    panel(s, 2.2, 10, "#FFFFFF", [13, 2, -6], 2.2);
    panel(s, 14, 1.6, "#FFFFFF", [0, 5, -15], 2.0);
    panel(s, 1.6, 9, "#FFFFFF", [9, 4, 13], 2.0);
    panel(s, 18, 0.5, "#FF8AD8", [0, 1.2, -16], 1.6);
    panel(s, 18, 0.4, "#B8FF6A", [0, -1.5, 16], 1.2);
    panel(s, 0.5, 14, "#6AF5FF", [16, 0, 4], 1.6);
    panel(s, 0.45, 12, "#C9A6FF", [-15, 0, -7], 1.5);
  });
  const envS = envFrom(r, (s) => {
    s.add(new THREE.Mesh(gradSphere(20, SKY), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    panel(s, 14, 8, "#FFFFFF", [0, 14, 6], 1.1);
  });
  scene.environment = envS; scene.environmentIntensity = 0.45;

  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.55, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600], envMap: envC, envMapIntensity: 1 });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xffc95a, metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0.25, envMap: envC, envMapIntensity: 1 });
  const cdM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [250, 900], envMap: envC, envMapIntensity: 1 });
  const plastic = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, ...o });
  const pearl = plastic(0xf3efff, { iridescence: 0.35, iridescenceIOR: 1.4 });
  const aqua = plastic(0x8fdcff, { iridescence: 0.3, iridescenceIOR: 1.4 });
  const lilac = plastic(0xc4b0ff, { iridescence: 0.3, iridescenceIOR: 1.4 });
  const navyM = plastic(0x14205a, { roughness: 0.35 });
  const bubbleM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.3, iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 820], clearcoat: 1, depthWrite: false, envMap: envC, envMapIntensity: 1.6 });

  // ---- lights ----
  scene.add(new THREE.HemisphereLight(0xe6f6ff, 0xb9a6ff, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 3.1), rim = new THREE.DirectionalLight(0xd8b8ff, 2.4), fill = new THREE.DirectionalLight(0x9ff6ff, 0.8);
  scene.add(key, key.target, rim, rim.target, fill, fill.target);

  // ---- sky dome + clouds ----
  const sky = new THREE.Mesh(gradSphere(420, SKY), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); scene.add(sky);
  const rnd = mulberry(5195);
  const cloudPos = [];
  for (let x = -60; x <= 340; x += 9) {
    const n = 4 + Math.floor(rnd() * 4), cz = -8 - rnd() * 40, cy = -9 - rnd() * 5;
    for (let k = 0; k < n; k++) cloudPos.push([x + (rnd() - 0.5) * 14, cy + rnd() * 3, cz + (rnd() - 0.5) * 10, 3 + rnd() * 4.5]);
  }
  for (let x = -40; x <= 320; x += 13) for (let k = 0; k < 4; k++) cloudPos.push([x + (rnd() - 0.5) * 12, -8.5 - rnd() * 2, 6 + rnd() * 14, 2.6 + rnd() * 3]);
  const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0xbfd8ff, emissiveIntensity: 0.28 });
  const clouds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), cloudM, cloudPos.length);
  const mtx = new THREE.Matrix4(), qI = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  cloudPos.forEach(([x, y, z, s], i) => { clouds.setMatrixAt(i, mtx.compose(v3.set(x, y, z), qI, s3.set(s * 1.25, s * 0.8, s))); });
  scene.add(clouds);

  // pedestals: pearl discs with a chrome rim
  function pedestal(x, z, rad, h = 0.7, lbl, top = pearl) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.94, h, 72), top); c.position.y = -h / 2; G.add(c);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.09, 12, 120), chrome); ring.rotation.x = Math.PI / 2; ring.position.y = -0.02; G.add(ring);
    const under = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.94, rad * 0.5, 1.6, 64), lilac); under.position.y = -h - 0.8; G.add(under);
    if (lbl) { const l = lbl; l.position.set(0, -h / 2, rad + 0.03); G.add(l); }
    return G;
  }

  const shT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(14,20,70,.78)"); gr.addColorStop(0.45, "rgba(14,20,70,.4)"); gr.addColorStop(1, "rgba(14,20,70,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const shadow = (sx, sz, x, z, y = 0.015, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: shT, transparent: true, opacity: o, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; scene.add(m); return m; };
  [[5.4, 3.6, X[0] - 2.75, 0.4], [5.4, 3.6, X[0] + 2.75, -0.4], [7.2, 5.4, X[1] - 2.4, -0.4], [3.2, 2.4, X[1] + 3.9, -1.6], [3.6, 2.4, X[1] + 2.2, 0.8, 0.015, 0.55],
   [5.2, 3.4, X[2] - 2.3, 0.6, 0.015, 0.7], [5.2, 3.6, X[2] + 2.6, -0.2], [7.6, 2.4, X[3] - 2.0, -0.2], [2.6, 2.2, X[3] + 2.3, 0.9], [2.6, 2.2, X[3] + 4.0, 0.3],
   [4.6, 4.6, X[5] - 2.3, 0], [4.6, 4.6, X[5] + 2.3, -0.3], [3.4, 2.4, X[6], -12], [4.8, 3.4, X[7], 0.2, 0.015, 0.7]].forEach((a) => shadow(...a));
  // ---- reusable props ----
  function floppy(title, sub, body = aqua, stripe = "#3F8DF0") {
    const G = new THREE.Group();
    const b = new THREE.Mesh(rbox(3, 3.1, 0.16, 0.12), body); G.add(b);
    const sh = new THREE.Mesh(rbox(1.7, 1.05, 0.2, 0.05), chrome); sh.position.set(0.12, 0.98, 0); G.add(sh);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.62, 0.22), navyM); slot.position.set(0.42, 1.0, 0); G.add(slot);
    const tx = canvasTex(512, 352, (g, w, h) => {
      g.fillStyle = "#ffffff"; rrect(g, 0, 0, w, h, 26); g.fill();
      g.fillStyle = stripe; g.fillRect(0, 0, w, 48); g.fillStyle = "#ffffff"; g.font = `800 26px ${SANS}`; g.fillText("3.5\"  1.44 MB", 22, 34);
      g.strokeStyle = "#c9d6f0"; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(24, 250 + i * 26); g.lineTo(w - 24, 250 + i * 26); g.stroke(); }
      g.fillStyle = NAVY; g.textAlign = "center"; g.font = `900 132px ${BLACK}`; g.fillText(title, w / 2, 190);
      g.fillStyle = "#3a4b86"; g.font = `800 36px ${SANS}`; g.fillText(sub, w / 2, 300);
    });
    const lab = plane(2.5, 1.72, tx, { transparent: false }); lab.position.set(0, -0.56, 0.09); G.add(lab);
    return G;
  }
  function cd(text) {
    const G = new THREE.Group();
    const spin = new THREE.Group(); G.add(spin); G.userData.spin = spin;
    const d = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 96), cdM); spin.add(d);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.075, 48), plastic(0xeaf6ff)); spin.add(hub);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 32), navyM); spin.add(hole);
    const tx = canvasTex(512, 512, (g, w) => { g.fillStyle = NAVY; g.textAlign = "center"; g.font = `900 64px ${SANS}`; g.fillText(text, w / 2, 130); g.font = `700 30px ${SANS}`; g.fillStyle = "#3a4b86"; g.fillText("CD-ROM", w / 2, 410); });
    const l = plane(3.0, 3.0, tx); l.rotation.x = -Math.PI / 2; l.position.y = 0.04; G.add(l);
    return G;
  }
  function monitor(screenTex, bezel = "AUDIRA") {
    const G = new THREE.Group();
    const body = new THREE.Mesh(rbox(6, 4.9, 4.4, 0.7), aqua); body.position.set(0, 3.55, -0.2); G.add(body);
    const front = new THREE.Mesh(rbox(5.6, 4.5, 0.4, 0.25), pearl); front.position.set(0, 3.55, 2.0); G.add(front);
    const scr = plane(4.5, 3.35, screenTex, { transparent: false }); scr.position.set(0, 3.8, 2.22); G.add(scr);
    const bz = canvasTex(512, 96, (g, w, h) => { g.fillStyle = "#5a6aa6"; g.font = `900 52px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(bezel, w / 2, h / 2); });
    const bl = plane(1.9, 0.36, bz); bl.position.set(0, 1.82, 2.22); G.add(bl);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color: 0x7dff9a, toneMapped: false })); led.position.set(2.3, 1.82, 2.22); G.add(led);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 1.0, 32), chrome); neck.position.y = 0.6; G.add(neck);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.2, 64), chrome); base.position.y = 0.1; G.add(base);
    return G;
  }
  const sparkTex = canvasTex(256, 256, (g) => {
    const core = g.createRadialGradient(128, 128, 0, 128, 128, 60); core.addColorStop(0, "rgba(255,255,255,1)"); core.addColorStop(0.25, "rgba(220,245,255,.6)"); core.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = core; g.fillRect(0, 0, 256, 256);
    for (const hz of [true, false]) { const gr = hz ? g.createLinearGradient(0, 128, 256, 128) : g.createLinearGradient(128, 0, 128, 256); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; if (hz) g.fillRect(0, 124, 256, 8); else g.fillRect(124, 0, 8, 256); }
  });
  const sparkM = () => new THREE.SpriteMaterial({ map: sparkTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false });
  const sparks = [];
  const addSpark = (x, y, z, s, ph) => { const sp = new THREE.Sprite(sparkM()); sp.position.set(x, y, z); scene.add(sp); sparks.push({ sp, s, ph }); return sp; };

  // ================= s1: the install race on two chrome-era monitors =================
  pedestal(X[0], 0, 7.2);
  const scrD = dyn(512, 384), scrW = dyn(512, 384);
  const monD = monitor(scrD.tex), monW = monitor(scrW.tex);
  monD.scale.setScalar(0.74); monW.scale.setScalar(0.74);
  monD.position.set(X[0] - 2.75, 0, 0.4); monD.rotation.y = 0.16; monW.position.set(X[0] + 2.75, 0, -0.4); monW.rotation.y = -0.16;
  scene.add(monD, monW);
  const vs = pill("VS", { w: 256, h: 160, fs: 84, size: 1.5 }); vs.position.set(X[0], 2.25, 2.4); scene.add(vs);
  const d1 = floppy("DOOM", "SHAREWARE"); d1.scale.setScalar(0.5); d1.position.set(X[0] - 4.6, 5.0, 1.2); scene.add(d1);
  const c1 = cd("Windows 95"); c1.scale.setScalar(0.62); c1.position.set(X[0] + 4.7, 4.9, 0.4); scene.add(c1);
  addSpark(X[0] - 4.0, 6.0, 1.6, 1.4, 0.3);
  function raceScreen(dz, name, p, lead, sub) {
    dz.paint(name + Math.round(p * 80) + lead, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0E2A8A"); gr.addColorStop(1, "#2C7BE8"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,.75)"; g.font = `800 28px ${SANS}`; g.fillText(sub, 30, 50);
      g.fillStyle = "#fff"; g.font = `900 ${name.length > 5 ? 62 : 104}px ${BLACK}`; g.fillText(name, 30, 170);
      g.fillStyle = "rgba(255,255,255,.18)"; rrect(g, 30, 236, w - 60, 70, 35); g.fill();
      const bw = (w - 72) * p; const bg = g.createLinearGradient(0, 240, 0, 300); bg.addColorStop(0, lead ? "#C8FFF4" : "#E4D8FF"); bg.addColorStop(0.5, lead ? "#3FE8D0" : "#A88CFF"); bg.addColorStop(1, lead ? "#0FB8A8" : "#7C5CF0");
      g.fillStyle = bg; rrect(g, 36, 242, Math.max(58, bw), 58, 29); g.fill();
      g.fillStyle = "rgba(255,255,255,.6)"; rrect(g, 50, 248, Math.max(30, bw - 28), 14, 7); g.fill();
      if (lead) { g.fillStyle = "#FFE35A"; g.font = `900 30px ${SANS}`; g.fillText("\u2605 TERDEPAN", 30, 352); }
    });
  }

  // ================= s2: tiny studio, the floppy pops out =================
  pedestal(X[1], 0, 7.2);
  const bld = new THREE.Group(); bld.position.set(X[1] - 2.4, 0, -0.6); scene.add(bld);
  const bb = new THREE.Mesh(rbox(4.6, 3.2, 3.8, 0.35), pearl); bb.position.y = 1.6; bld.add(bb);
  const roof = new THREE.Mesh(rbox(5.0, 0.45, 4.2, 0.2), lilac); roof.position.y = 3.4; bld.add(roof);
  const winM = plastic(0x5fd8ff, { emissive: 0x3fb8ff, emissiveIntensity: 0.35 });
  for (let i = 0; i < 3; i++) { const wdw = new THREE.Mesh(rbox(1.0, 0.9, 0.2, 0.08), winM); wdw.position.set(-1.4 + i * 1.4, 1.95, 1.9); bld.add(wdw); }
  const door = new THREE.Mesh(rbox(0.9, 1.2, 0.2, 0.08), lilac); door.position.set(0, 0.6, 1.9); bld.add(door);
  const sign = pill("id Software", { w: 768, h: 160, fs: 74, font: SANS, size: 3.9 }); sign.position.set(0, 3.1, 2.25); bld.add(sign);
  const d2 = floppy("DOOM", "MS-DOS \u00b7 1993"); scene.add(d2);
  const scrDos = dyn(512, 384); const pc2 = monitor(scrDos.tex, "PC"); pc2.scale.setScalar(0.42); pc2.position.set(X[1] + 3.9, 0, -1.6); pc2.rotation.y = -0.3; scene.add(pc2);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false })); scene.add(ring2);

  // ================= s3: shareware: episode 1 copies itself, 2 and 3 locked =================
  pedestal(X[2], 0, 7.4);
  const e1 = floppy("DOOM", "EPISODE 1 \u00b7 GRATIS"); e1.position.set(X[2] - 2.3, 2.9, 0.8); e1.scale.setScalar(1.05); scene.add(e1);
  const COP = [[-4.3, 4.1, -2.2], [-4.6, 1.2, -1.4], [-1.5, 5.0, -3.0], [0.5, 4.6, -3.6], [-5.3, 2.7, -4.0], [-2.7, 0.5, -3.2]];
  const copies = COP.map(() => { const f = floppy("DOOM", "EPISODE 1 \u00b7 GRATIS"); f.scale.setScalar(0.62); scene.add(f); return f; });
  const caseM = new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, roughness: 0.04, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false, iridescence: 0.6 });
  const glass = new THREE.Mesh(rbox(3.6, 4.6, 2.4, 0.3), caseM); glass.position.set(X[2] + 2.6, 2.35, -0.2); glass.renderOrder = 3; scene.add(glass);
  const e2 = floppy("DOOM", "EPISODE 2", lilac, "#7C5CF0"); e2.scale.setScalar(0.7); e2.position.set(X[2] + 2.2, 3.1, -0.6); e2.rotation.z = 0.08; scene.add(e2);
  const e3 = floppy("DOOM", "EPISODE 3", lilac, "#7C5CF0"); e3.scale.setScalar(0.7); e3.position.set(X[2] + 3.0, 1.5, 0.1); e3.rotation.z = -0.06; scene.add(e3);
  const lock = new THREE.Group(); lock.position.set(X[2] + 2.6, 2.2, 1.25); scene.add(lock);
  const lb = new THREE.Mesh(rbox(1.15, 0.95, 0.42, 0.14), gold); lock.add(lb);
  const sk = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 12, 32, Math.PI), chrome); sk.position.y = 0.48; lock.add(sk);
  const kh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), navyM); kh.rotation.x = Math.PI / 2; kh.position.set(0, -0.05, 0.22); lock.add(kh);
  const tagT = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#FFE35A"; g.beginPath(); g.moveTo(70, 20); g.lineTo(w - 20, 20); g.lineTo(w - 20, h - 20); g.lineTo(70, h - 20); g.lineTo(10, h / 2); g.closePath(); g.fill();
    g.strokeStyle = NAVY; g.lineWidth = 6; g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(62, h / 2, 16, 0, 7); g.fill(); g.stroke();
    g.fillStyle = NAVY; g.font = `900 104px ${BLACK}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BELI", w / 2 + 40, h / 2 + 6);
  });
  const tag = plane(2.2, 1.1, tagT); scene.add(tag);
  addSpark(X[2] - 1.0, 4.6, 1.4, 1.2, 1.1);

  // ================= s4: 1 in 100 buys, money stacks up =================
  pedestal(X[3], 0, 7.2);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.21, 20, 14), plastic(0xd6ccff, { iridescence: 0.5 }), 100); dots.frustumCulled = false; scene.add(dots);
  const DOT = (i) => [X[3] - 2.0 + ((i % 10) - 4.5) * 0.52, 3.0 + (4.5 - Math.floor(i / 10)) * 0.52, 0];
  const SPECIAL = 27;
  const goldDot = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 20), gold); scene.add(goldDot);
  const frame4 = new THREE.Mesh(rbox(6.0, 6.0, 0.25, 0.4), pearl); frame4.position.set(X[3] - 2.0, 3.0, -0.4); scene.add(frame4);
  const COINS = 20, coinG = new THREE.CylinderGeometry(0.85, 0.85, 0.2, 48);
  const coinTop = canvasTex(256, 256, (g, w) => { g.strokeStyle = "rgba(120,70,0,.55)"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, w / 2, 100, 0, 7); g.stroke(); g.fillStyle = "rgba(120,70,0,.6)"; g.font = `900 140px ${BLACK}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", w / 2, w / 2 + 6); });
  const coins = Array.from({ length: COINS }, (_, i) => {
    const c = new THREE.Group(); c.add(new THREE.Mesh(coinG, gold)); const tp = plane(1.5, 1.5, coinTop); tp.rotation.x = -Math.PI / 2; tp.position.y = 0.105; c.add(tp); scene.add(c);
    const st = i < 11 ? 0 : 1; return { c, st, k: st ? i - 11 : i };
  });
  addSpark(X[3] + 3.2, 4.0, 1.2, 1.3, 2.2);

  // ================= s5: copies spread through a field of PCs =================
  pedestal(X[4], -1, 9.5, 0.7, null, plastic(0x4a46b8, { roughness: 0.28, iridescence: 0.4, iridescenceIOR: 1.5 }));
  const NG = 5, SP = 2.35, pcs = [];
  const miniBody = rbox(1.5, 1.2, 1.1, 0.22), miniFront = new THREE.PlaneGeometry(1.15, 0.82), miniBase = new THREE.CylinderGeometry(0.42, 0.5, 0.12, 24);
  const h5 = mulberry(1994);
  for (let zi = 0; zi < NG; zi++) for (let xi = 0; xi < NG; xi++) {
    const G = new THREE.Group(); G.position.set(X[4] + (xi - 2) * SP, 0, -1 + (zi - 2) * SP); scene.add(G);
    const b = new THREE.Mesh(miniBody, (xi + zi) % 2 ? aqua : pearl); b.position.y = 0.85; G.add(b);
    const sm = new THREE.MeshBasicMaterial({ color: 0x1a2560, toneMapped: false }); const s = new THREE.Mesh(miniFront, sm); s.position.set(0, 0.9, 0.56); G.add(s);
    const ba = new THREE.Mesh(miniBase, chrome); ba.position.y = 0.06; G.add(ba);
    G.rotation.set(-0.42, (h5() - 0.5) * 0.3, 0);
    const d = Math.abs(xi - 2) + Math.abs(zi - 2);
    pcs.push({ G, sm, xi, zi, d, j: h5() * 0.18 });
    shadow(2.0, 1.6, G.position.x, G.position.z + 0.1, 0.015, 0.75);
  }
  const idx = (xi, zi) => zi * NG + xi;
  const parentOf = (p) => { if (p.d === 0) return null; if (p.xi !== 2) return idx(p.xi + (p.xi < 2 ? 1 : -1), p.zi); return idx(p.xi, p.zi + (p.zi < 2 ? 1 : -1)); };
  const edges = [];
  for (let zi = 0; zi < NG; zi++) for (let xi = 0; xi < NG; xi++) {
    for (const [dx, dz] of [[1, 0], [0, 1]]) {
      const a = idx(xi, zi), xb = xi + dx, zb = zi + dz; if (xb >= NG || zb >= NG) continue; const b = idx(xb, zb);
      const pa = pcs[a].G.position, pb = pcs[b].G.position;
      const m = new THREE.Mesh(new THREE.BoxGeometry(dx ? SP - 1.0 : 0.09, 0.05, dz ? SP - 1.0 : 0.09), new THREE.MeshBasicMaterial({ color: 0x3a4aa0, toneMapped: false }));
      m.position.set((pa.x + pb.x) / 2, 0.06, (pa.z + pb.z) / 2); scene.add(m); edges.push({ m, a, b });
    }
  }
  const flyers = pcs.map(() => { const f = floppy("DOOM", "GRATIS"); f.scale.setScalar(0.17); scene.add(f); return f; });
  const cA = new THREE.Color(0x1a2560), cB = new THREE.Color(0x4ff8ff), eA = new THREE.Color(0x3a4aa0), eB = new THREE.Color(0xbff8ff);

  // ================= s6: the payoff race, two sculpted bars =================
  pedestal(X[5], 0, 7.4);
  const barG = new THREE.BoxGeometry(2.8, 1, 2.8); barG.translate(0, 0.5, 0);
  const barD = new THREE.Mesh(barG, aqua), barW = new THREE.Mesh(barG, lilac); barD.position.set(X[5] - 2.3, 0, 0); barW.position.set(X[5] + 2.3, 0, -0.3); scene.add(barD, barW);
  const capD = new THREE.Mesh(rbox(3.1, 0.3, 3.1, 0.12), chrome), capW = new THREE.Mesh(rbox(3.1, 0.3, 3.1, 0.12), chrome); scene.add(capD, capW);
  const lblT = (txt, fs) => canvasTex(512, 160, (g, w, h) => { g.fillStyle = NAVY; g.font = `900 ${fs}px ${BLACK}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4); });
  const lD = plane(2.6, 0.81, lblT("DOOM", 110)), lW = plane(2.6, 0.81, lblT("Windows 95", 70)); scene.add(lD, lW);
  const d6 = floppy("DOOM", "SHAREWARE"); d6.scale.setScalar(0.72); scene.add(d6);
  const c6 = cd("Windows 95"); c6.scale.setScalar(0.8); scene.add(c6);
  const est = pill("\u2248 diperkirakan", { w: 768, h: 150, fs: 64, font: SANS, size: 4.6 }); scene.add(est);
  const crown = addSpark(0, 0, 0, 2.2, 0);

  // ================= s7: the corridor and the trench-coat silhouette =================
  const corr = new THREE.Group(); corr.position.set(X[6], 0, 0); scene.add(corr);
  const floorT = canvasTex(1024, 2048, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E7DDFF"); gr.addColorStop(0.5, "#B9A2FF"); gr.addColorStop(1, "#8FE3F2"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo((i * w) / 8, 0); g.lineTo((i * w) / 8, h); g.stroke(); } for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(0, (i * h) / 16); g.lineTo(w, (i * h) / 16); g.stroke(); }
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 56), plastic(0xffffff, { map: floorT, roughness: 0.3, clearcoat: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -22); corr.add(floor);
  const wallT = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(160,200,255,.15)"); gr.addColorStop(1, "rgba(190,160,255,.55)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (const sd of [-1, 1]) { const wl = plane(56, 8.6, wallT, { side: THREE.DoubleSide, depthWrite: false }); wl.rotation.y = sd * Math.PI / 2; wl.position.set(sd * 5, 4.3, -22); corr.add(wl); }
  for (let i = 0; i < 9; i++) {
    const z = -i * 6 + 2, F = new THREE.Group(); F.position.z = z; corr.add(F);
    const bar = (w, h, x, y) => { const m = new THREE.Mesh(rbox(w, h, 0.45, 0.16), chrome); m.position.set(x, y, 0); F.add(m); };
    bar(0.42, 9, -5, 4.5); bar(0.42, 9, 5, 4.5);
  }
  const glowT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(230,215,255,.85)"); gr.addColorStop(1, "rgba(180,150,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const portal = plane(16, 16, glowT, { depthWrite: false }); portal.position.set(0, 4.4, -48); corr.add(portal);
  // big chrome bezel at the entrance: the "promo video" frame
  const bez = new THREE.Group(); bez.position.set(0, 0, 8); corr.add(bez);
  const bzBar = (w, h, x, y) => { const m = new THREE.Mesh(rbox(w, h, 0.9, 0.4), chrome); m.position.set(x, y, 0); bez.add(m); };
  bzBar(1.2, 15, -6.4, 6.6); bzBar(1.2, 15, 6.4, 6.6); bzBar(14, 1.2, 0, 14.2); bzBar(14, 1.6, 0, -0.4);
  const bzl = pill("VIDEO PROMOSI \u00b7 Windows 95", { w: 1024, h: 150, fs: 62, font: SANS, size: 6.2 }); bzl.position.set(0, -0.4, 0.5); bez.add(bzl);
  const recT = canvasTex(256, 96, (g) => { g.fillStyle = "#FF3D7F"; g.beginPath(); g.arc(40, 48, 24, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = `900 52px ${SANS}`; g.fillText("REC", 80, 68); });
  const rec = plane(2.0, 0.75, recT); rec.position.set(-4.6, -0.4, 0.6); rec.scale.setScalar(0.7); bez.add(rec);
  // trench-coat silhouette
  const man = new THREE.Group(); man.position.set(0, 0, -12); corr.add(man);
  const coatM = plastic(0x1b2150, { roughness: 0.45, clearcoat: 0.4, sheen: 1, sheenColor: new THREE.Color(0xb59cff), sheenRoughness: 0.4 });
  const prof = [[0.01, 0.75], [1.12, 0.75], [1.02, 1.6], [0.86, 2.6], [0.8, 3.1], [0.95, 3.8], [1.0, 4.25], [0.62, 4.55], [0.36, 4.62], [0.01, 4.64]].map(([x, y]) => new THREE.Vector2(x, y));
  const coat = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), coatM); coat.scale.set(1.0, 1, 0.62); man.add(coat);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.07, 8, 40), navyM); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.62, 1); belt.position.y = 2.95; man.add(belt);
  const collar = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 24, 1, true), coatM); collar.position.y = 4.7; collar.rotation.x = Math.PI; man.add(collar);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 20), coatM); head.position.y = 5.25; head.scale.set(0.95, 1.08, 1); man.add(head);
  for (const sd of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 2.3, 16), coatM); arm.position.set(sd * 1.05, 3.25, 0); arm.rotation.z = sd * 0.08; man.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.8, 14), navyM); leg.position.set(sd * 0.35, 0.4, 0); man.add(leg);
    const shoe = new THREE.Mesh(rbox(0.42, 0.22, 0.7, 0.1), navyM); shoe.position.set(sd * 0.35, 0.11, 0.12); man.add(shoe);
  }
  const plate7 = pill("Bill Gates", { w: 768, h: 170, fs: 86, font: SANS, size: 3.3 }); plate7.position.set(0, 0, 0); corr.add(plate7);
  const tele = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 8, 90), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false })); tele.rotation.x = Math.PI / 2; tele.position.set(0, 0.05, -12); corr.add(tele);
  const beamT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(200,180,255,0)"); gr.addColorStop(0.5, "rgba(240,235,255,.85)"); gr.addColorStop(1, "rgba(200,180,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beam = plane(3.6, 7, beamT, { depthWrite: false, blending: THREE.AdditiveBlending }); beam.position.set(0, 3.5, -11.8); corr.add(beam);

  // ================= s8: free copies drift furthest =================
  const audT = canvasTex(1024, 192, (g, w, h) => { g.fillStyle = NAVY; g.font = `900 120px ${BLACK}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 6); });
  pedestal(X[7], 0, 6.4, 1.4, plane(4.6, 0.86, audT));
  const d8 = floppy("DOOM", "DEMO GRATIS"); d8.scale.setScalar(1.4); scene.add(d8);
  const NB = 16, b8 = Array.from({ length: NB }, (_, i) => {
    const G = new THREE.Group(); const bl = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 20), bubbleM); bl.renderOrder = 4; G.add(bl);
    const f = floppy("DOOM", "GRATIS"); f.scale.setScalar(0.26); G.add(f); scene.add(G);
    return { G, f, a: (i / NB) * Math.PI * 2, el: Math.sin(i * 2.3) * 0.7, d: (i % 5) * 0.07 };
  });
  addSpark(X[7] + 1.6, 5.4, 1.4, 1.6, 0.8);

  // ---- free-floating bubbles along the whole path (some near the lens) ----
  const NBUB = 70, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 32, 20), bubbleM, NBUB); bub.frustumCulled = false; bub.renderOrder = 5; scene.add(bub);
  const rb = mulberry(95);
  const bubs = Array.from({ length: NBUB }, (_, i) => {
    const st = i % 8, near = i % 5 === 0;
    return { x: X[st] + (rb() - 0.5) * (near ? 14 : 26), y: near ? rb() * 9 - 1 : 1 + rb() * 12, z: near ? 12 + rb() * 8 : -4 - rb() * 14, s: near ? 0.5 + rb() * 1.0 : 0.3 + rb() * 0.9, ph: rb() * 6.28, sp: 0.3 + rb() * 0.5 };
  });
  for (let i = 0; i < 14; i++) { const st = i % 8; addSpark(X[st] + (rb() - 0.5) * 14, 2 + rb() * 6, -2 - rb() * 6, 0.7 + rb() * 0.8, rb() * 6.28); }

  // ---- camera: one glide through the sky, every key from scene/word anchors ----
  const st = (i, dx, dy, d, ty = 2.6, tx = 0, tz = 0) => [X[i] + dx, ty + dy, tz + d, X[i] + tx, ty, tz];
  const arrive = (s) => K[s] + 0.35, leave = (s) => K[s + "e"] - 0.45;
  const camT = track([
    [0, ...st(0, -2.2, 1.6, 33.5, 2.9)],
    [leave("s1"), ...st(0, 1.8, 0.6, 30, 2.9)],
    [arrive("s2"), ...st(1, -2.6, 1.6, 31.5, 3.2, 0.3)],
    [leave("s2"), ...st(1, 1.4, 0.4, 28.5, 3.2, 0.3)],
    [arrive("s3"), ...st(2, -3.2, 1.8, 35, 2.8, -0.9)],
    [leave("s3"), ...st(2, 0.8, 0.6, 32.5, 2.8, -0.9)],
    [arrive("s4"), ...st(3, -2.2, 1.4, 33, 3.0, 0.2)],
    [leave("s4"), ...st(3, 1.2, 0.3, 30.5, 3.0, 0.2)],
    [arrive("s5"), ...st(4, -3, 27, 31, -0.6, 0, -1.4)],
    [leave("s5"), ...st(4, 2.5, 23, 28, -0.4, 0, -1.4)],
    [arrive("s6"), ...st(5, -2.5, 1.5, 40, 5.6)],
    [leave("s6"), ...st(5, 2.0, 0.6, 36, 5.6)],
    [arrive("s7"), ...st(6, -1.2, 0.5, 34, 3.4, 0, -12)],
    [A("s7:Tapi"), ...st(6, 0.6, 0.0, 25, 3.3, 0, -12)],
    [leave("s7"), ...st(6, 1.0, 0.2, 22.5, 3.3, 0, -12)],
    [arrive("s8"), ...st(7, 2.0, 1.2, 24, 3.4)],
    [K.end, ...st(7, -1.6, 2.2, 31, 3.8)],
  ]);

  const q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3();
  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = camT(t);
    cam.position.set(px, py, pz); cam.lookAt(tx, ty, tz);
    sky.position.copy(cam.position);
    key.position.set(tx - 9, ty + 16, tz + 18); key.target.position.set(tx, ty, tz);
    rim.position.set(tx + 8, ty + 9, tz - 14); rim.target.position.set(tx, ty, tz);
    fill.position.set(tx + 12, ty + 2, tz + 6); fill.target.position.set(tx, ty, tz);

    // bubbles drift
    bubs.forEach((b, i) => {
      v3.set(b.x + Math.sin(t * b.sp + b.ph) * 0.8, b.y + Math.sin(t * b.sp * 0.7 + b.ph * 2) * 0.6 + ((t * 0.12 * b.sp) % 3), b.z);
      bub.setMatrixAt(i, mtx.compose(v3, qI, sc.setScalar(b.s * (1 + 0.04 * Math.sin(t * 3 + b.ph)))));
    });
    bub.instanceMatrix.needsUpdate = true;
    sparks.forEach((s) => { const k = Math.pow(0.5 + 0.5 * Math.sin(t * 2.1 + s.ph), 6); s.sp.scale.setScalar(s.s * (0.25 + 0.95 * k)); s.sp.material.opacity = 0.35 + 0.65 * k; });

    // ---- s1 ----
    {
      const lb1 = A("s1:lebih"), wn = A("s1:Windows");
      const pw = 0.34 + 0.4 * ramp(t, 0, lb1) + 0.04 * ramp(t, wn, K.s1e);
      const pd = 0.3 + 0.36 * ramp(t, 0, lb1) + 0.3 * ramp(t, lb1, wn + 0.4);
      raceScreen(scrD, "DOOM", Math.min(0.96, pd), pd > pw ? 1 : 0, "TERPASANG \u00b7 1995");
      raceScreen(scrW, "Windows 95", Math.min(0.96, pw), pw >= pd ? 1 : 0, "TERPASANG \u00b7 1995");
      d1.rotation.set(0.15 * Math.sin(t * 1.3), 0.4 * Math.sin(t * 0.9), 0.1); d1.position.y = 5.0 + 0.2 * Math.sin(t * 1.6);
      c1.rotation.set(1.15 + 0.1 * Math.sin(t), 0, 0.12 + 0.05 * Math.sin(t * 0.9)); c1.userData.spin.rotation.y = t * 2.2; c1.position.y = 4.9 + 0.2 * Math.sin(t * 1.4 + 1);
      vs.scale.setScalar(1 + 0.06 * Math.sin(t * 4));
    }

    // ---- s2 ----
    {
      const pop = A("s2:Doom") - 0.35, k = back(ramp(t, pop, pop + 0.7), 1.6);
      d2.position.set(X[1] - 2.4 + 4.6 * k, 2.6 + 2.6 * k + 0.15 * Math.sin(t * 1.5), -0.6 + 1.4 * k);
      d2.scale.setScalar(0.2 + 1.0 * k); d2.rotation.set(0.1 * Math.sin(t), -0.25 + 0.3 * Math.sin(t * 0.8) + (1 - k) * 3, 0.06);
      d2.visible = t > pop - 0.05;
      const rk = clamp01((t - pop - 0.3) / 0.7); ring2.position.set(X[1] - 2.4, 3.7, -0.6); ring2.rotation.x = Math.PI / 2; ring2.scale.setScalar(0.5 + rk * 4); ring2.material.opacity = (1 - rk) * (rk > 0 ? 1 : 0);
      const ty2 = A("s2:komputer"), nT = Math.floor(clamp01((t - ty2) / 0.6) * 4);
      scrDos.paint("d" + nT + (Math.floor(t * 2) % 2), (g, w, h) => {
        g.fillStyle = "#0B1650"; g.fillRect(0, 0, w, h); g.fillStyle = "#BFF8FF"; g.font = `700 60px ${MONO}`;
        g.fillText("C:\\>" + "DOOM".slice(0, nT) + (Math.floor(t * 2) % 2 ? "_" : ""), 30, 120);
        g.font = `700 40px ${MONO}`; g.fillStyle = "#7FA8FF"; g.fillText("MS-DOS", 30, 300);
      });
    }

    // ---- s3 ----
    {
      e1.rotation.set(0.08 * Math.sin(t * 1.2), 0.25 * Math.sin(t * 0.8), 0.04);
      const cp = A("s3:disalin");
      copies.forEach((f, i) => {
        const k = back(ramp(t, cp - 0.5 + i * 0.12, cp + 0.25 + i * 0.12), 1.4), [ox, oy, oz] = COP[i];
        f.position.set(X[2] - 2.3 * (1 - k) + ox * k, 2.9 + (oy - 2.9) * k + 0.12 * Math.sin(t * 1.4 + i), 0.8 + (oz - 0.8) * k);
        f.rotation.set(0.1 * Math.sin(t + i), 0.4 * Math.sin(t * 0.7 + i) + (1 - k) * 2, 0.08 * (i % 2 ? 1 : -1));
        f.visible = k > 0.02;
      });
      const lk = back(ramp(t, A("s3:Dua") - 0.1, A("s3:Dua") + 0.35), 2);
      lock.scale.setScalar(Math.max(0.001, lk)); lock.rotation.y = 0.15 * Math.sin(t * 2);
      const tk = back(ramp(t, A("s3:dibeli") - 0.15, A("s3:dibeli") + 0.25), 2);
      tag.position.set(X[2] + 3.6, 1.2, 1.5); tag.rotation.z = -0.25 + 0.06 * Math.sin(t * 2.4); tag.scale.setScalar(Math.max(0.001, tk));

    }

    // ---- s4 ----
    {
      const pe = A("s4:persen");
      for (let i = 0; i < 100; i++) {
        const [x, y, z] = DOT(i), k = back(ramp(t, K.s4 - 0.3 + i * 0.012, K.s4 + 0.1 + i * 0.012), 1.6);
        const dim = i === SPECIAL ? 0 : 1;
        dots.setMatrixAt(i, mtx.compose(v3.set(x, y, z + 0.06 * Math.sin(t * 2 + i)), qI, sc.setScalar(Math.max(0.001, k * dim * (t > pe ? 0.85 : 1)))));
      }
      dots.instanceMatrix.needsUpdate = true;
      const [gx, gy] = DOT(SPECIAL), gk = back(ramp(t, pe - 0.1, pe + 0.5), 1.8);
      goldDot.position.set(gx + 1.2 * gk, gy + 0.6 * gk, 2.2 * gk); goldDot.scale.setScalar(Math.max(0.001, back(ramp(t, K.s4 - 0.3, K.s4 + 0.4)) * (1 + 3.2 * gk)));
      const mh = A("s4:menghasilkan");
      coins.forEach(({ c, st: stk, k }) => {
        const a = mh + k * 0.11 + stk * 0.06, f = clamp01((t - a) / 0.35);
        c.visible = t > a;
        c.position.set(X[3] + 2.3 + stk * 1.7, 0.11 + k * 0.21 + (1 - eout(f)) * 3.5, 0.9 - stk * 0.6);
        c.rotation.set(0, k * 0.7, (1 - f) * 0.6);
      });
    }

    // ---- s5 ----
    {
      const t0 = A("s5:versi") - 0.6, t1 = A("s5:Setiap");
      const lit = (p) => t0 + p.d * 0.55 + p.j;
      pcs.forEach((p, i) => {
        const L1 = lit(p), k = clamp01((t - L1) / 0.3);
        const pulse = t > t1 ? 0.5 + 0.5 * Math.sin((t - t1) * 6 - p.d * 1.3) : 1;
        p.sm.color.copy(cA).lerp(cB, k * (0.75 + 0.25 * pulse));
        p.G.position.y = 0.12 * back(clamp01((t - L1) / 0.4)) * (1 - clamp01((t - L1 - 0.4) / 0.4));
        const par = parentOf(p), f = flyers[i];
        if (par === null) { f.visible = false; return; }
        const P0 = pcs[par].G.position, P1 = p.G.position, u = clamp01((t - (L1 - 0.5)) / 0.5);
        f.visible = u > 0 && u < 1;
        f.position.set(P0.x + (P1.x - P0.x) * u, 1.9 + Math.sin(u * Math.PI) * 1.4, P0.z + (P1.z - P0.z) * u);
        f.rotation.set(-0.5, t * 2 + i, 0);
      });
      edges.forEach(({ m, a, b }) => { const k = clamp01((t - Math.max(lit(pcs[a]), lit(pcs[b]))) / 0.3); m.material.color.copy(eA).lerp(eB, k); });
    }

    // ---- s6 ----
    {
      const lb6 = A("s6:lebih"), di = A("s6:diperkirakan");
      const hW = 0.2 + 4.8 * eout(clamp01((t - K.s6 - 0.2) / (lb6 - K.s6 - 0.2))) ;
      const hD = 0.2 + 3.6 * ramp(t, K.s6, lb6) + 3.2 * ramp(t, lb6, lb6 + 1.4);
      barD.scale.y = hD; barW.scale.y = hW;
      capD.position.set(X[5] - 2.3, hD + 0.15, 0); capW.position.set(X[5] + 2.3, hW + 0.15, -0.3);
      lD.position.set(X[5] - 2.3, hD - 0.65, 1.42); lW.position.set(X[5] + 2.3, hW - 0.65, 1.12);
      d6.position.set(X[5] - 2.3, hD + 1.75 + 0.1 * Math.sin(t * 1.6), 0.2); d6.rotation.set(0.05, 0.3 * Math.sin(t * 0.9), 0.05);
      c6.position.set(X[5] + 2.3, hW + 1.25 + 0.1 * Math.sin(t * 1.4), -0.3); c6.rotation.set(1.2, 0, 0.08); c6.userData.spin.rotation.y = t * 2.2;
      const ek = back(ramp(t, di - 0.1, di + 0.35), 1.8);
      est.position.set(X[5] + 2.3, hW + 3.4, 1.4); est.scale.setScalar(Math.max(0.001, ek));
      crown.position.set(X[5] - 3.2, hD + 3.0, 1.0); const ck = ramp(t, lb6 + 1.0, lb6 + 1.4); crown.material.opacity *= ck;
    }

    // ---- s7 ----
    {
      const bi = A("s7:Bill"), mk = ramp(t, bi - 0.2, bi + 0.6);
      man.visible = mk > 0.01; man.scale.set(1, Math.max(0.01, mk), 1);
      const ds = A("s7:disisipkan"), gl = t > ds && t < ds + 0.9 ? Math.floor(t * 18) % 2 : 0;
      man.position.x = gl ? 0.12 : 0;
      tele.scale.setScalar(0.6 + 2.2 * clamp01((t - bi + 0.2) / 1.1)); tele.material.opacity = (1 - clamp01((t - bi + 0.2) / 1.1)) * (t > bi - 0.2 ? 1 : 0);
      beam.material.opacity = Math.sin(Math.PI * clamp01((t - bi + 0.3) / 1.6)) * 0.9 + (gl ? 0.4 : 0);
      const pk = back(ramp(t, A("s7:Gates") - 0.05, A("s7:Gates") + 0.4), 1.8);
      plate7.position.set(2.9, 4.6, -10.6); plate7.scale.setScalar(Math.max(0.001, pk));
      rec.material.opacity = Math.floor(t * 1.6) % 2 ? 1 : 0.25;
    }

    // ---- s8 ----
    {
      const fr = A("s8:gratis"), ms = A("s8:menyebar");
      d8.position.set(X[7], 3.5 + 0.18 * Math.sin(t * 1.3), 0); d8.rotation.set(0.08 * Math.sin(t), 0.35 * Math.sin(t * 0.7), 0.04);
      b8.forEach((b, i) => {
        const em = back(ramp(t, fr - 0.2 + b.d, fr + 0.3 + b.d), 1.5), out = eout(clamp01((t - ms + 0.1 - b.d) / 3.6));
        const rad = 2.6 + 4.6 * out, a = b.a + (t - fr) * 0.25;
        b.G.position.set(X[7] + Math.cos(a) * rad, 3.5 + b.el * rad * 0.45 + Math.sin(t * 1.4 + i) * 0.2, Math.sin(a) * rad * 0.7 - out * 1.5);
        b.G.scale.setScalar(Math.max(0.001, em * (0.75 + 0.35 * out)));
        b.f.rotation.set(0.2, t * 1.4 + i, 0.1);
      });
    }

    comp.render();
  };
}
