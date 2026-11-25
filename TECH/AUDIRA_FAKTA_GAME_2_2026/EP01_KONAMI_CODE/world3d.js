// KONAMI CODE: a midnight arcade (ARCADECRT look). Phosphor CRT screens, a giant grey controller, original pixel ships.
// One long room; the camera walks station to station. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, std, box, cyl, stage, avatar, runPose, restPose, envStrips, pts } from "./lib3d.js";

const P = { room: 0x07060f, carpet: "#120F2A", cab: 0x141a3a, mag: "#FF2E88", cyan: "#2EF2FF", yel: "#FFD23F", org: "#FF8A1F", grn: "#5CFF7A", wht: "#F4F1FF", sky: "#120A33", vio: "#7A2DFF" };
const PX = "'Press Start 2P'", VT = "VT323";

// Canvas textures that repaint when a web font finishes loading (labels never keep a fallback face).
const texs = [];
function tex(w, h, draw, opt = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  if (opt.near) { tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false; } else tx.anisotropy = 8;
  if (opt.rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(opt.rep[0], opt.rep[1]); }
  const o = { paint() { const g = c.getContext("2d"); g.clearRect(0, 0, w, h); draw(g, w, h); tx.needsUpdate = true; } };
  o.paint(); texs.push(o); return tx;
}
let fkey = -1;
function fontsTick() {
  let n = 0;
  try { document.fonts.forEach((f) => { if (f.status === "loaded") n++; }); } catch (e) {}
  if (n !== fkey) { fkey = n; texs.forEach((o) => o.paint()); }
}

// CRT tube shader (barrel, RGB fringe, scanlines, grille, vignette, rolling band), after the kit's makeCrtMaterial.
const CRT_V = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const CRT_F = `uniform sampler2D uTex; uniform float uPower; uniform float uLines; uniform float uTime; uniform float uBoost; varying vec2 vUv;
vec2 barrel(vec2 uv){ vec2 c = uv * 2.0 - 1.0; c *= 1.0 + 0.07 * dot(c, c); return c * 0.5 + 0.5; }
void main(){
  vec2 uv = barrel(vUv);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  float ca = 0.004; vec3 col;
  col.r = texture2D(uTex, uv + vec2(ca, 0.0)).r; col.g = texture2D(uTex, uv).g; col.b = texture2D(uTex, uv - vec2(ca, 0.0)).b;
  col += (texture2D(uTex, uv + vec2(0.007, 0.0)).rgb + texture2D(uTex, uv - vec2(0.007, 0.0)).rgb) * 0.16;
  float scan = 0.6 + 0.4 * pow(abs(sin(uv.y * uLines * 3.14159)), 0.7);
  float grille = 0.9 + 0.1 * sin(gl_FragCoord.x * 2.094);
  col *= scan * grille;
  vec2 c = vUv * 2.0 - 1.0; col *= 1.0 - 0.42 * dot(c * vec2(0.9, 0.8), c * vec2(0.9, 0.8));
  col *= 1.0 + 0.07 * smoothstep(0.0, 0.06, abs(fract(uv.y * 0.6 - uTime * 0.35) - 0.5) - 0.44);
  float open = clamp(uPower * 1.15, 0.0, 1.0);
  col = mix(vec3(0.0), col, smoothstep(0.5 * open + 0.004, 0.5 * open - 0.004, abs(vUv.y - 0.5)));
  col += vec3(0.8, 0.95, 1.0) * (1.0 - smoothstep(0.0, 0.25, uPower)) * smoothstep(0.012, 0.0, abs(vUv.y - 0.5)) * step(0.02, uPower);
  gl_FragColor = vec4(col * uBoost, 1.0);
  #include <colorspace_fragment>
}`;
function screen(w, h, cw, ch, boost = 1.3) {
  const c = document.createElement("canvas"); c.width = cw; c.height = ch;
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;
  const m = new THREE.ShaderMaterial({ vertexShader: CRT_V, fragmentShader: CRT_F, uniforms: { uTex: { value: tx }, uPower: { value: 1 }, uLines: { value: ch }, uTime: { value: 0 }, uBoost: { value: boost } }, toneMapped: false });
  const geo = new THREE.PlaneGeometry(w, h, 16, 16); const ps = geo.attributes.position;
  for (let i = 0; i < ps.count; i++) { const x = ps.getX(i) / (w / 2), y = ps.getY(i) / (h / 2); ps.setZ(i, 0.04 * Math.max(w, h) * (1 - x * x) * (1 - y * y)); }
  const mesh = new THREE.Mesh(geo, m);
  return { mesh, g: c.getContext("2d"), cw, ch, set(t, power = 1) { tx.needsUpdate = true; m.uniforms.uTime.value = t; m.uniforms.uPower.value = power; } };
}

// Pixel helpers for screen rasters.
const SHIP = ["....WW......", "...WCCW.....", ".OOCCCCCCW..", "OYCCCWWCCCCW", ".OOCCCCCCW..", "...WCCW.....", "....WW......"];
const ENEMY = ["..MMMM..", ".MMMMMM.", "MMWMMWMM", "MMMMMMMM", ".M.MM.M.", "M......M"];
const BUG = ["G....G", ".GGGG.", "GGWWGG", ".GGGG.", "G.GG.G"];
const PCOL = { W: P.wht, C: P.cyan, O: P.org, Y: P.yel, M: P.mag, G: P.grn };
function spr(g, rows, x, y, s, tint) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const k = r[i]; if (k === ".") continue; g.fillStyle = tint || PCOL[k]; g.fillRect(Math.round(x + i * s), Math.round(y + j * s), s, s); } }); }
function txt(g, s, x, y, size, col, al = "center", font = PX) { g.font = `${size}px ${font}`; g.textAlign = al; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); }
// 8x8 arrow / letter glyphs for the code.
const SEQ = ["U", "U", "D", "D", "L", "R", "L", "R", "B", "A"];
function glyph(g, k, x, y, s, col) {
  g.fillStyle = col;
  if (k === "A" || k === "B") { txt(g, k, x + 4 * s, y + 4.4 * s, 7 * s, col); return; }
  const A = ["...##...", "..####..", ".######.", "########", "...##...", "...##...", "...##...", "...##..."];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    if (A[j][i] !== "#") continue;
    let u = i, v = j;
    if (k === "D") v = 7 - j; else if (k === "L") { u = j; v = i; } else if (k === "R") { u = 7 - j; v = i; }
    g.fillRect(x + u * s, y + v * s, s, s);
  }
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: P.room, fog: 0.0065, exp: 1.0, bloom: [0.55, 0.5, 0.74], shadow: false });
  envStrips(r, scene, [[30, 4, 0xff2e88, 2.2, -20, 10, 10], [30, 4, 0x2ef2ff, 2.2, 20, 12, 10], [40, 3, 0xffffff, 1.4, 0, 30, 0], [20, 20, 0x7a2dff, 0.6, 0, -10, -20]]);
  scene.add(new THREE.HemisphereLight(0x5a4cff, 0x0a0618, 0.55));
  const rnd = mulberry(1986);
  const ENV = 0.55;
  const mat = (c, rough = 0.42, metal = 0.1, ex = {}) => std(c, rough, metal, { envMapIntensity: ENV, ...ex });
  const lights = [];
  const plight = (c, i, x, y, z, d = 70) => { const l = new THREE.PointLight(c, i, d, 1.3); l.position.set(x, y, z); scene.add(l); lights.push(l); return l; };

  // ---------- the room: cosmic carpet, back wall with neon rails, rows of dim cabinets ----------
  const carpet = tex(512, 512, (g, w) => { const q = mulberry(66); g.fillStyle = P.carpet; g.fillRect(0, 0, w, w); const cs = [P.mag, P.cyan, P.yel, P.org, P.grn]; for (let i = 0; i < 46; i++) { g.strokeStyle = cs[i % 5]; g.lineWidth = 4; g.globalAlpha = 0.75; const x = q() * w, y = q() * w, k = q(); g.beginPath(); if (k < 0.4) { g.moveTo(x, y); for (let s = 1; s < 6; s++) g.lineTo(x + s * 9, y + (s % 2 ? 8 : -8)); } else if (k < 0.7) g.arc(x, y, 7 + q() * 9, 0, 7); else { for (let s = 0; s < 10; s++) { const a = (s / 10) * 6.283, rr = s % 2 ? 4 : 11; s ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); } g.stroke(); } g.globalAlpha = 1; }, { rep: [36, 9] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 105), new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.92, color: 0x9a90c0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(135, 0, 20); scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(420, 60), mat(0x0c0a1c, 0.8)); wall.position.set(135, 30, -34); scene.add(wall);
  const neonM = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2), toneMapped: false });
  box(420, 0.35, 0.3, neonM(P.mag), 135, 27, -33.6, scene); box(420, 0.25, 0.3, neonM(P.cyan), 135, 25.6, -33.6, scene); box(420, 0.2, 0.3, neonM(P.vio), 135, 0.4, -33.6, scene);

  // cabinet body profile (portrait screen slot), after the kit's extruded side profile
  const prof = new THREE.Shape(); [[-0.5, 0], [0.45, 0], [0.45, 0.78], [0.68, 0.88], [0.68, 0.96], [0.3, 1.04], [0.18, 2.1], [0.48, 2.2], [0.48, 2.56], [-0.5, 2.56]].forEach(([z, y], i) => (i ? prof.lineTo(z, y) : prof.moveTo(z, y))); prof.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(prof, { depth: 1.2, bevelEnabled: false }); cabGeo.rotateY(-Math.PI / 2); cabGeo.translate(0.6, 0, 0);
  const sideArt = tex(256, 512, (g) => { g.fillStyle = "#141A3A"; g.fillRect(0, 0, 256, 512); [P.yel, P.org, P.mag].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, 330 + i * 30); g.lineTo(256, 170 + i * 30); g.lineTo(256, 190 + i * 30); g.lineTo(0, 350 + i * 30); g.fill(); }); g.fillStyle = P.cyan; g.beginPath(); g.arc(170, 100, 40, 0, 7); g.fill(); g.strokeStyle = P.wht; g.lineWidth = 6; g.beginPath(); g.ellipse(170, 100, 72, 17, -0.3, 0, 7); g.stroke(); });
  sideArt.repeat.set(1 / 1.2, 1 / 2.6); sideArt.offset.set(0.5 / 1.2 + 0.03, 0);
  const sideM = new THREE.MeshStandardMaterial({ map: sideArt, roughness: 0.35, metalness: 0.1, envMapIntensity: ENV }), bodyM = mat(P.cab, 0.38, 0.15);
  const SCR = { y: 1.57, z: 0.24, tilt: Math.atan2(0.12, 1.06), w: 0.86, h: 1.0 };
  function cabinet(S, marqueeTxt, mcol, scr) {
    const G = new THREE.Group();
    const b = new THREE.Mesh(cabGeo, [sideM, bodyM]); b.scale.setScalar(S); G.add(b);
    const sg = new THREE.Group(); sg.position.set(0, SCR.y * S, SCR.z * S + 0.02); sg.rotation.x = -SCR.tilt; G.add(sg);
    box(1.08 * S, 1.06 * S, 0.02, mat(0x05050a, 0.25, 0.4), 0, 0, -0.03, sg);
    if (scr) { scr.mesh.position.z = 0.01; sg.add(scr.mesh); }
    const mq = tex(512, 128, (g) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "#2A0F5C"); gr.addColorStop(1, "#0D0626"); g.fillStyle = gr; g.fillRect(0, 0, 512, 128); g.font = `${marqueeTxt.length > 12 ? 30 : 40}px ${PX}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 8; g.strokeStyle = P.mag; g.strokeText(marqueeTxt, 256, 66); g.fillStyle = mcol; g.fillText(marqueeTxt, 256, 66); });
    const mqM = new THREE.Mesh(new THREE.PlaneGeometry(1.14 * S, 0.3 * S), new THREE.MeshBasicMaterial({ map: mq, toneMapped: false, color: 0xbbbbbb }));
    mqM.position.set(0, 2.38 * S, 0.485 * S); G.add(mqM);
    // control panel: stick + two buttons
    const cp = new THREE.Group(); cp.position.set(0, 0.97 * S, 0.5 * S); cp.rotation.x = 0.26; G.add(cp);
    cyl(0.025 * S, 0.025 * S, 0.16 * S, 8, mat(0x222222), -0.25 * S, 0.08 * S, 0, cp); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05 * S, 14, 10), mat(0xff2e88, 0.3)); ball.position.set(-0.25 * S, 0.17 * S, 0); cp.add(ball);
    [[0.12, P.cyan], [0.3, P.yel]].forEach(([x, c]) => cyl(0.05 * S, 0.05 * S, 0.04 * S, 14, std(c, 0.3, 0, { emissive: new THREE.Color(c), emissiveIntensity: 0.9 }), x * S, 0.02 * S, 0, cp));
    return { G, sg, mq: mqM };
  }

  // background cabinets: one instanced body + glowing screens along the back wall
  const bgPos = []; for (let x = -40; x <= 310; x += 8.5) bgPos.push([x, -24 - (Math.round(x) % 2) * 1.5]);
  const BS = 5.2;
  const IBC = new THREE.InstancedMesh(cabGeo, [sideM, bodyM], bgPos.length), IBS = new THREE.InstancedMesh(new THREE.PlaneGeometry(SCR.w * BS, SCR.h * BS), new THREE.MeshBasicMaterial({ toneMapped: false }), bgPos.length);
  IBC.frustumCulled = IBS.frustumCulled = false; scene.add(IBC, IBS);
  const dm = new THREE.Object3D(), bgCol = [P.cyan, P.mag, P.grn, P.yel, P.vio, P.org], bgPh = bgPos.map(() => rnd() * 6.28);
  bgPos.forEach(([x, z], i) => { dm.position.set(x, 0, z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(BS); dm.updateMatrix(); IBC.setMatrixAt(i, dm.matrix); dm.position.set(x, SCR.y * BS, z + SCR.z * BS + 0.05); dm.rotation.set(-SCR.tilt, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); IBS.setMatrixAt(i, dm.matrix); IBS.setColorAt(i, new THREE.Color(bgCol[i % 6]).multiplyScalar(0.5)); });
  for (let x = 0; x <= 300; x += 45) { plight(0xff2e88, 40, x - 14, 14, -16, 50); plight(0x2ef2ff, 40, x + 14, 14, -16, 50); }

  // dust motes in the dark
  const dust = pts(scene, 500, { color: 0x9fdcff, size: 0.22, opacity: 0.6 }); const dSeed = []; for (let i = 0; i < 500; i++) dSeed.push([rnd() * 340 - 30, rnd() * 26, rnd() * 50 - 25, rnd() * 6.28]);
  const dc = [new THREE.Color(P.cyan), new THREE.Color(P.mag), new THREE.Color(P.wht)]; for (let i = 0; i < 500; i++) { const c = dc[i % 3]; dust.col[i * 3] = c.r; dust.col[i * 3 + 1] = c.g; dust.col[i * 3 + 2] = c.b; }

  // ---------- giant grey controller (generic, no logo) ----------
  function controller() {
    const G = new THREE.Group();
    const rr = (w, h, rad) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + rad, -h / 2); s.lineTo(w / 2 - rad, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rad); s.lineTo(w / 2, h / 2 - rad); s.quadraticCurveTo(w / 2, h / 2, w / 2 - rad, h / 2); s.lineTo(-w / 2 + rad, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rad); s.lineTo(-w / 2, -h / 2 + rad); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rad, -h / 2); return s; };
    const bodyG = new THREE.ExtrudeGeometry(rr(16, 7, 1.4), { depth: 1.6, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 4, curveSegments: 10 });
    const body = new THREE.Mesh(bodyG, mat(0xb4b7bf, 0.48, 0.05)); G.add(body);
    const face = new THREE.Mesh(new THREE.ExtrudeGeometry(rr(14.6, 5.2, 0.8), { depth: 0.12, bevelEnabled: false }), mat(0x34363d, 0.5)); face.position.z = 2.0; G.add(face);
    const strip = new THREE.Mesh(new THREE.ExtrudeGeometry(rr(4.2, 3.6, 0.5), { depth: 0.1, bevelEnabled: false }), mat(0x8d9099, 0.45)); strip.position.set(-0.2, 0, 2.1); G.add(strip);
    const Z = 2.16;
    const glowM = (c) => std(0x111114, 0.35, 0, { emissive: new THREE.Color(c), emissiveIntensity: 0, envMapIntensity: ENV });
    const dp = new THREE.Group(); dp.position.set(-4.7, 0, Z); G.add(dp);
    box(1.35, 1.35, 0.5, mat(0x111114, 0.35), 0, 0, 0.25, dp);
    const arms = {};
    [["U", 0, 1.38], ["D", 0, -1.38], ["L", -1.38, 0], ["R", 1.38, 0]].forEach(([k, x, y]) => { arms[k] = box(1.35, 1.42, 0.5, glowM(P.cyan), x, y, 0.25, dp); });
    const btn = {};
    [["B", 3.1], ["A", 5.6]].forEach(([k, x]) => { const m = cyl(1.0, 1.0, 0.55, 28, std(0xd8283c, 0.3, 0, { emissive: new THREE.Color(P.mag), emissiveIntensity: 0, envMapIntensity: ENV }), x, -0.35, Z + 0.28, G); m.rotation.x = Math.PI / 2; btn[k] = m;
      const lb = tex(64, 64, (g) => txt(g, k, 32, 34, 34, "#d8283c")); const l = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: lb, transparent: true })); l.position.set(x + 0.9, -1.75, Z + 0.02); G.add(l); });
    [-1.2, 0.7].forEach((x) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 4, 10), mat(0x1b1c20, 0.4)); m.rotation.z = Math.PI / 2 - 0.35; m.position.set(x, -0.9, Z + 0.1); G.add(m); });
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3.7, 0.8), new THREE.Vector3(0.6, 6, 0.2), new THREE.Vector3(3.5, 7, -3), new THREE.Vector3(9, 5.5, -6)]), 40, 0.22, 8), mat(0x26272c, 0.5)); G.add(cable);
    return { G, arms, btn };
  }
  function pressAt(ctl, t, times, k0) {
    // light the d-pad arm / button of the input currently held; sink it a touch
    ["U", "D", "L", "R"].forEach((k) => { ctl.arms[k].material.emissiveIntensity = k0[k] || 0; ctl.arms[k].position.z = 0.25 - (k0[k] > 1.2 ? 0.15 : 0); });
    ["B", "A"].forEach((k) => { ctl.btn[k].material.emissiveIntensity = k0[k] || 0; ctl.btn[k].position.z = 2.44 - (k0[k] > 1.2 ? 0.2 : 0); });
  }
  const held = (t, times, base = 0) => { const k = { U: base, D: base, L: base, R: base, B: base, A: base }; times.forEach((tt, i) => { const u = t - tt; if (u >= -0.02 && u < 0.42) k[SEQ[i]] = Math.max(k[SEQ[i]], 3.2 * (1 - u / 0.42) + 0.6); }); return k; };

  // code strip: ten glyph tiles
  function strip(n = 10) {
    const G = new THREE.Group(), tiles = [];
    SEQ.forEach((k, i) => {
      const gt = tex(64, 64, (g) => { g.fillStyle = "#0a0a14"; g.fillRect(0, 0, 64, 64); glyph(g, k, 8, 8, 6, k === "A" || k === "B" ? P.yel : P.cyan); }, { near: true });
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.42, 1.42, 0.36), [0, 0, 0, 0, 0, 0].map((_, f) => (f === 4 ? new THREE.MeshStandardMaterial({ map: gt, emissiveMap: gt, emissive: 0xffffff, emissiveIntensity: 0.05, roughness: 0.4, envMapIntensity: ENV }) : mat(0x181830, 0.4))));
      m.position.set((i - 4.5) * 1.62, 0, 0); G.add(m); tiles.push(m);
    });
    return { G, tiles };
  }

  // ---------- station A (hook): controller on a pedestal under a big CRT ----------
  const XA = 0;
  const ctlA = controller(); ctlA.G.position.set(XA, 6.6, 0); ctlA.G.rotation.x = -0.42; ctlA.G.scale.setScalar(0.8); scene.add(ctlA.G);
  cyl(5, 6, 1.4, 40, mat(0x1a1638, 0.3, 0.3), XA, 0.7, -0.5, scene);
  const rimA = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.12, 8, 64), neonM(P.mag)); rimA.rotation.x = Math.PI / 2; rimA.position.set(XA, 1.42, -0.5); scene.add(rimA);
  const stA = strip(); stA.G.position.set(XA, 10.7, 1.5); scene.add(stA.G);
  const monA = screen(12.4, 9.3, 160, 120, 1.1); const monAG = new THREE.Group(); monAG.position.set(XA, 15.6, -9); scene.add(monAG); monAG.add(monA.mesh); box(14, 10.8, 3, mat(0x10101c, 0.3, 0.4), 0, 0, -1.6, monAG);
  plight(0x2ef2ff, 70, XA - 8, 10, 8, 40); plight(0xff2e88, 40, XA + 8, 8, 8, 40);
  const tIn = ["s1:Atas", "s1:atas", "s1:bawah#1", "s1:bawah#2", "s1:kiri#1", "s1:kanan#1", "s1:kiri#2", "s1:kanan#2", "s1:B", "s1:A"].map((k) => AT[k]);
  const tMax = tIn[9];
  const burst = pts(scene, 260, { color: 0xffd23f, size: 0.5 }); const bSeed = []; for (let i = 0; i < 260; i++) bSeed.push([rnd() * 6.283, rnd() * 2 - 0.6, 6 + rnd() * 14, rnd()]);
  const bc = [new THREE.Color(P.yel), new THREE.Color(P.mag), new THREE.Color(P.cyan)]; for (let i = 0; i < 260; i++) { const c = bc[i % 3]; burst.col[i * 3] = c.r; burst.col[i * 3 + 1] = c.g; burst.col[i * 3 + 2] = c.b; }

  // ---------- station B: workbench, name plate, arcade cabinet -> cartridge ----------
  const XB = 45;
  box(15, 0.5, 6, mat(0x241e3e, 0.5, 0.2), XB, 3.3, 0, scene);
  [[-7, -2.6], [7, -2.6], [-7, 2.6], [7, 2.6]].forEach(([x, z]) => box(0.4, 3.1, 0.4, mat(0x151229), XB + x, 1.55, z, scene));
  const plate = tex(640, 128, (g) => { g.fillStyle = "#0d0626"; g.fillRect(0, 0, 640, 128); g.strokeStyle = P.cyan; g.lineWidth = 6; g.strokeRect(6, 6, 628, 116); txt(g, "KAZUHISA HASHIMOTO", 320, 50, 30, P.yel); txt(g, "KONAMI", 320, 96, 22, P.cyan); });
  const plateM = new THREE.Mesh(new THREE.PlaneGeometry(10, 2), new THREE.MeshBasicMaterial({ map: plate, toneMapped: false, color: 0x777777 })); plateM.position.set(XB, 2.2, 3.05); scene.add(plateM);
  // dev kit: green board + chips + small monitor
  box(4.6, 0.25, 2.6, mat(0x1d6b3a, 0.5), XB - 3.4, 3.68, 0.9, scene); for (let i = 0; i < 6; i++) box(0.7, 0.25, 0.5, mat(0x111111, 0.4), XB - 4.8 + (i % 3) * 1.2, 3.9, 0.4 + Math.floor(i / 3) * 1.1, scene);
  const devS = screen(5.4, 4.05, 96, 72, 1.2); const devG = new THREE.Group(); devG.position.set(XB + 3.4, 6.3, -0.9); devG.rotation.y = -0.35; scene.add(devG); devG.add(devS.mesh); box(6.2, 4.8, 3.4, mat(0x1c1c2a, 0.35, 0.2), 0, 0, -1.8, devG); box(1.4, 0.9, 1.4, mat(0x1c1c2a), 0, -2.6, -1.4, devG);
  const gradS = screen(SCR.w * 4.4, SCR.h * 4.4, 60, 70, 1.2);
  const cabB = cabinet(4.4, "GRADIUS 1985", P.yel, gradS); cabB.G.position.set(XB - 6, 0, -6.5); cabB.G.rotation.y = 0.45; scene.add(cabB.G);
  // cartridge builder
  function cartridge(w, h, d, labelDraw) {
    const G = new THREE.Group();
    box(w, h, d, mat(0x8e929b, 0.5), 0, h / 2, 0, G);
    for (let i = 0; i < 5; i++) box(w * 0.86, 0.08 * h, d * 1.06, mat(0x7a7e87, 0.5), 0, h * (0.06 + i * 0.045), 0, G);
    const lt = tex(256, 256, labelDraw); const lb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.62), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.5, emissiveMap: lt, emissive: 0xffffff, emissiveIntensity: 0.12, envMapIntensity: ENV })); lb.position.set(0, h * 0.62, d / 2 + 0.01); G.add(lb);
    return G;
  }
  const cartB = cartridge(3.6, 4.4, 0.7, (g) => { g.fillStyle = "#111"; g.fillRect(0, 0, 256, 256); g.fillStyle = P.sky; g.fillRect(10, 10, 236, 150); spr(g, SHIP, 70, 50, 9); txt(g, "NES", 128, 205, 44, P.yel); });
  cartB.position.set(XB + 6, 3.55, 1.6); cartB.rotation.y = -0.3; scene.add(cartB);
  const flow = pts(scene, 60, { color: 0x2ef2ff, size: 0.55 });
  plight(0xffd23f, 70, XB, 10, 8, 35); plight(0x7a2dff, 60, XB - 10, 12, 4, 35);

  // ---------- station C: AUDIRA ARCADE cabinet (the test bench) + power-up column ----------
  const XC = 90, SC = 7.2;
  const mainS = screen(SCR.w * SC, SCR.h * SC, 120, 140, 1.35);
  const cabC = cabinet(SC, "AUDIRA ARCADE", P.yel, mainS); cabC.G.position.set(XC, 0, 0); scene.add(cabC.G);
  plight(0x2ef2ff, 60, XC - 2, 14, 10, 40); plight(0xff2e88, 80, XC + 7, 6, 8, 30);
  // voxel ship that flies out of the screen when the code lands
  function voxels(rows, s, glow = 0.35) {
    const cells = []; rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] !== ".") cells.push([i - row.length / 2 + 0.5, rows.length / 2 - j - 0.5, PCOL[row[i]]]); });
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(s * 0.94, s * 0.94, s * 0.94), new THREE.MeshStandardMaterial({ roughness: 0.35, emissive: 0xffffff, emissiveIntensity: 0, envMapIntensity: ENV }), cells.length * 2);
    const d = new THREE.Object3D();
    cells.forEach(([x, y, c], i) => { [0, 1].forEach((k) => { d.position.set(x * s, y * s, (k - 0.5) * s); d.updateMatrix(); m.setMatrixAt(i * 2 + k, d.matrix); m.setColorAt(i * 2 + k, new THREE.Color(c)); }); });
    m.material.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance = diffuseColor.rgb * " + glow.toFixed(2) + ";"); };
    m.frustumCulled = false; return m;
  }
  const shipC = voxels(SHIP, 0.4, 0.06); scene.add(shipC);
  const opts = [0, 1].map(() => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), std(0xff8a1f, 0.3, 0, { emissive: new THREE.Color(P.org), emissiveIntensity: 0.9 })); scene.add(o); return o; });
  const shield = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(P.cyan).multiplyScalar(0.9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, wireframe: true })); scene.add(shield);
  const caps = []; const capCol = [P.org, P.yel, P.grn, P.cyan, P.vio, P.mag];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.3, 6, 14), std(0x222233, 0.3, 0, { emissive: new THREE.Color(capCol[i]), emissiveIntensity: 0, envMapIntensity: ENV })); m.rotation.z = Math.PI / 2; m.position.set(XC + 7.2, 2.4 + i * 1.62, 2); scene.add(m); caps.push(m); }
  box(3.6, 11, 0.4, mat(0x10101c, 0.3, 0.4), XC + 7.2, 6.4, 1.2, scene);

  // ---------- engineer (generic tester; the name lives only on the plate) ----------
  const H = avatar({ skin: 0xd59a72, shirt: 0xe9e6f2, pants: 0x232a5c, make: (c) => mat(c, 0.5, 0.02) });
  scene.add(H.G);
  box(1.3, 0.28, 1.32, mat(0x2ef2ff, 0.4, 0, { emissive: new THREE.Color(P.cyan), emissiveIntensity: 0 }), 0, 1.25, -0.02, H.head); // cap
  box(1.4, 0.12, 0.5, mat(0x2ef2ff, 0.4), 0, 1.2, 0.75, H.head); // brim
  [-0.27, 0.27].forEach((x) => box(0.38, 0.28, 0.06, std(0x111111, 0.2, 0.6, { transparent: true, opacity: 0.85 }), x, 0.72, 0.66, H.head)); box(0.2, 0.06, 0.05, mat(0x111111), 0, 0.76, 0.66, H.head);
  box(0.5, 0.75, 0.08, mat(0x2ef2ff, 0.4), 0.55, 3.35, 0.53, H.G); // badge
  const smile = H.head.children.find((c) => c.material && c.material.map && c.geometry.type === "PlaneGeometry");
  const frownT = tex(128, 128, (g) => { g.fillStyle = "#111"; g.fillRect(34, 40, 18, 6); g.fillRect(76, 40, 18, 6); g.strokeStyle = "#111"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.arc(64, 106, 26, 3.6, 5.8); g.stroke(); });
  const frown = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: frownT, transparent: true })); frown.position.set(0, 0.6, 0.636); H.head.add(frown);
  const H2 = avatar({ skin: 0xb07850, shirt: 0xff8a1f, pants: 0x2a2440, make: (c) => mat(c, 0.5, 0.02) }); scene.add(H2.G); // a casual player in s5

  // ---------- station D: rhythm lane vs random mashing ----------
  const XD = 135;
  const padM = [], padsL = [], padsR = [];
  function pad(k, x, z) { const gt = tex(64, 64, (g) => { g.fillStyle = "#0a0a14"; g.fillRect(0, 0, 64, 64); glyph(g, k, 8, 8, 6, P.wht); }, { near: true }); const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 2.4), [0, 0, 1, 0, 0, 0].map((_, f) => (f === 2 ? new THREE.MeshStandardMaterial({ map: gt, emissiveMap: gt, emissive: 0xffffff, emissiveIntensity: 0.1, roughness: 0.4, color: 0x8888aa }) : mat(0x1a1830, 0.4)))); m.position.set(x, 0.18, z); scene.add(m); padM.push(m); return m; }
  SEQ.forEach((k, i) => padsL.push(pad(k, XD - 3.3, 9 - i * 2.75)));
  const RK = ["U", "R", "B", "L", "A", "D", "R", "U", "L", "B"];
  RK.forEach((k, i) => padsR.push(pad(k, XD + 3.3, 9 - i * 2.75)));
  // two locks at the far end
  function lock(x, z) { const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G); const bd = box(3, 2.6, 1, mat(0x30304a, 0.3, 0.6), 0, 6.2, 0, G); const sh = new THREE.Mesh(new THREE.TorusGeometry(1, 0.28, 10, 24, Math.PI), mat(0x9aa0b4, 0.25, 0.8)); sh.position.set(0, 7.5, 0); G.add(sh); const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ color: 0x444444, toneMapped: false })); lamp.position.set(0, 6.1, 0.52); G.add(lamp); box(0.3, 5, 0.3, mat(0x1a1830), 0, 2.5, 0, G); return { G, sh, lamp }; }
  const lockL = lock(XD - 3.3, -20), lockR = lock(XD + 3.3, -20);
  plight(0x5cff7a, 60, XD - 6, 9, 4, 35); plight(0xff2e88, 60, XD + 6, 9, 4, 35);
  const mashR = mulberry(4242), mashSeq = []; for (let i = 0; i < 40; i++) mashSeq.push([Math.floor(mashR() * 10), mashR()]);

  // ---------- station E: release checklist, conveyor of cartridges, the stamp ----------
  const XE = 180;
  const boardS = screen(13, 9.75, 192, 144, 1.25); const boardG = new THREE.Group(); boardG.position.set(XE + 1, 10.8, -3); scene.add(boardG); boardG.add(boardS.mesh); box(14.6, 11.2, 2, mat(0x10101c, 0.3, 0.4), 0, 0, -1.1, boardG); box(0.6, 7, 0.6, mat(0x1a1830), 0, -7.5, -1.2, boardG);
  box(30, 1.0, 3.2, mat(0x22223a, 0.4, 0.5), XE, 2.9, 5, scene);
  const belt = tex(64, 64, (g) => { g.fillStyle = "#0b0b12"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#2a2a3e"; g.fillRect(0, 0, 8, 64); }, { rep: [24, 1] });
  const beltM = new THREE.Mesh(new THREE.PlaneGeometry(30, 3), new THREE.MeshStandardMaterial({ map: belt, roughness: 0.7 })); beltM.rotation.x = -Math.PI / 2; beltM.position.set(XE, 3.42, 5); scene.add(beltM);
  for (let x = -14; x <= 14; x += 4) cyl(0.5, 0.5, 3.4, 14, mat(0x3a3a55, 0.3, 0.7), XE + x, 2.4, 5, scene).rotation.x = Math.PI / 2;
  const NC = 12, cartGeo = new THREE.BoxGeometry(1.6, 2, 0.4), cartIM = new THREE.InstancedMesh(cartGeo, mat(0x8e929b, 0.5), NC), cartLbl = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.25, 1.1), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, map: tex(64, 64, (g) => { g.fillStyle = P.sky; g.fillRect(0, 0, 64, 64); spr(g, SHIP, 8, 22, 4); g.fillStyle = P.yel; g.fillRect(0, 54, 64, 10); }, { near: true }) }), NC);
  cartIM.frustumCulled = cartLbl.frustumCulled = false; scene.add(cartIM, cartLbl);
  const stamp = new THREE.Group(); scene.add(stamp);
  box(4.2, 1.4, 1.2, mat(0x8a1020, 0.4), 0, 0, 0, stamp); cyl(0.4, 0.4, 3, 12, mat(0x3a2a1a, 0.6), 0, 2.2, 0, stamp); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), mat(0x3a2a1a, 0.6)); knob.position.y = 4.1; stamp.add(knob);
  const bugV = voxels(BUG, 0.32, 0.8); scene.add(bugV);
  plight(0xffd23f, 80, XE - 4, 12, 12, 35); plight(0x2ef2ff, 60, XE + 9, 6, 12, 30);

  // ---------- station F: 1986 cartridge, 30 lives, the code on many screens ----------
  const XF = 225;
  const cartF = cartridge(6, 7.4, 1.2, (g) => { g.fillStyle = "#0b0b12"; g.fillRect(0, 0, 256, 256); g.fillStyle = P.sky; g.fillRect(10, 10, 236, 130); spr(g, SHIP, 50, 40, 12); spr(g, ENEMY, 190, 30, 5); SEQ.forEach((k, i) => glyph(g, k, 12 + i * 23.4, 160, 2.6, k === "A" || k === "B" ? P.yel : P.cyan)); txt(g, "NES 1986", 128, 222, 28, P.yel); });
  cartF.position.set(XF, 0, 2); scene.add(cartF);
  const pedF = cyl(3.6, 4, 1.2, 32, mat(0x1a1638, 0.3, 0.3), XF, 0.6, 2, scene);
  const lives = []; for (let i = 0; i < 30; i++) { const v = voxels(SHIP, 0.12, 0.12); v.position.set(XF + 0.6 + (i % 5) * 1.75, 11.8 - Math.floor(i / 5) * 1.3, 2); scene.add(v); lives.push(v); }
  const livesSign = tex(512, 96, (g) => { g.fillStyle = "#0d0626"; g.fillRect(0, 0, 512, 96); g.strokeStyle = P.mag; g.lineWidth = 6; g.strokeRect(4, 4, 504, 88); txt(g, "CONTRA: 30 NYAWA", 256, 50, 28, P.yel); });
  const livesM = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 1.78), new THREE.MeshBasicMaterial({ map: livesSign, toneMapped: false, transparent: true, color: 0xcccccc })); livesM.position.set(XF + 4.1, 13.6, 2); scene.add(livesM);
  const iconS = screen(3.8, 2.85, 64, 48, 1.3);
  const wallPos = []; for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) wallPos.push([XF - 9 + i * 6 + (j % 2) * 1.2, 4.5 + j * 4.1, -14 + (i % 2) * 0.6]);
  const wallScr = wallPos.map(([x, y, z], i) => { const G = new THREE.Group(); G.position.set(x, y, z); box(4.6, 3.6, 2.4, mat(0x14142a, 0.3, 0.3), 0, 0, -1.3, G); const s = new THREE.Mesh(iconS.mesh.geometry, iconS.mesh.material); s.position.z = 0.02; G.add(s); scene.add(G); return { G, s, t: 0 }; });
  const bankS = screen(9.6, 6, 192, 120, 0.85); const bankG = new THREE.Group(); bankG.position.set(XF + 1, 11.5, -4); scene.add(bankG); bankG.add(bankS.mesh); box(10.6, 7, 1.4, mat(0x14142a, 0.3, 0.3), 0, 0, -0.8, bankG);
  plight(0xff2e88, 45, XF - 6, 10, 10, 40); plight(0x2ef2ff, 45, XF + 8, 12, 10, 40);

  // ---------- station G: tribute plate, controller glows, AUDIRA ARCADE marquee ----------
  const XG = 270;
  const ctlG = controller(); ctlG.G.position.set(XG, 10.6, 0); ctlG.G.rotation.x = -0.34; ctlG.G.scale.setScalar(0.82); scene.add(ctlG.G);
  box(13, 7.6, 6, mat(0x1a1638, 0.3, 0.3), XG, 3.8, 0, scene);
  const trib = tex(768, 160, (g) => { g.fillStyle = "#0d0626"; g.fillRect(0, 0, 768, 160); g.strokeStyle = P.yel; g.lineWidth = 6; g.strokeRect(8, 8, 752, 144); txt(g, "KAZUHISA HASHIMOTO", 384, 62, 38, P.wht); txt(g, "2020", 384, 118, 26, P.cyan); });
  const tribM = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.5), new THREE.MeshBasicMaterial({ map: trib, toneMapped: false, color: 0x888888 })); tribM.position.set(XG, 5.4, 3.03); scene.add(tribM);
  
  const sign = tex(1024, 220, (g) => { g.font = `92px ${PX}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 14; g.strokeStyle = P.mag; g.strokeText("AUDIRA", 512, 92); g.fillStyle = P.yel; g.fillText("AUDIRA", 512, 92); txt(g, "A R C A D E", 512, 184, 40, P.cyan); });
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.3), new THREE.MeshBasicMaterial({ map: sign, transparent: true, toneMapped: false, depthWrite: false })); signM.position.set(XG, 17.6, -9); scene.add(signM);
  const lG = plight(0xffd23f, 0, XG, 9, 8, 35); plight(0x7a2dff, 60, XG - 9, 14, 2, 35);

  // ---------- screen painters ----------
  function paintA(t) {
    const g = monA.g, W = 160, Hh = 120; g.fillStyle = "#06041a"; g.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 40; i++) { const x = (i * 37 + t * (10 + (i % 3) * 8)) % W; g.fillStyle = i % 4 ? "#3a3470" : "#8e88d0"; g.fillRect(W - x, (i * 53) % Hh, 1, 1); }
    const maxed = t >= tMax;
    if (!maxed) {
      txt(g, "PLAYER 1", 80, 18, 8, Math.floor(t * 3) % 2 ? P.yel : P.mag);
      txt(g, "MASUKKAN KODE", 80, 34, 8, P.cyan);
      let n = 0; tIn.forEach((x) => { if (t >= x) n++; });
      for (let i = 0; i < 10; i++) { g.fillStyle = "#1c1840"; g.fillRect(6 + i * 15, 56, 13, 13); if (i < n) glyph(g, SEQ[i], 7.5 + i * 15, 57.5, 1.25, SEQ[i] === "A" || SEQ[i] === "B" ? P.yel : P.cyan); }
      spr(g, SHIP, 62, 88, 3);
    } else {
      const u = t - tMax;
      if (u < 0.12) { g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, Hh); return; }
      const bl = Math.floor(u * 6) % 2 === 0 || u > 2.2;
      txt(g, "POWER-UP", 80, 28, 16, bl ? P.yel : P.mag);
      txt(g, "MAX", 80, 52, 22, bl ? P.mag : P.yel);
      for (let i = 0; i < 6; i++) { g.fillStyle = capCol[i]; g.fillRect(14 + i * 22.5, 74, 20, 10); }
      spr(g, SHIP, 52, 94, 4); g.fillStyle = P.org; g.fillRect(42, 100, 6, 6); g.fillRect(42, 112, 6, 6);
    }
  }
  function paintDev(t) {
    const g = devS.g; g.fillStyle = "#04140a"; g.fillRect(0, 0, 96, 72);
    const lines = ["PORT: ARKADE", "  -> NES", "LOAD STAGE", "TEST MODE", "CPU 8-BIT", "SPRITE OK", "SOUND OK"];
    const sc = Math.floor(t * 4);
    for (let i = 0; i < 6; i++) txt(g, lines[(i + sc) % lines.length], 4, 8 + i * 11, 7, i === 0 ? P.yel : P.grn, "left");
  }
  function paintGrad(t) {
    const g = gradS.g; g.fillStyle = "#06041a"; g.fillRect(0, 0, 60, 70);
    for (let i = 0; i < 20; i++) { const x = (i * 23 + t * 18) % 60; g.fillStyle = "#6a64b0"; g.fillRect(60 - x, (i * 31) % 70, 1, 1); }
    spr(g, SHIP, 8, 30 + Math.sin(t * 2) * 6, 2); spr(g, ENEMY, 40 - ((t * 9) % 12), 16, 2); spr(g, ENEMY, 44 - ((t * 7) % 10), 46, 2);
  }
  // main game: a side-scroller where the ship keeps dying
  const LOOP = 2.9;
  function paintMain(t) {
    const g = mainS.g, W = 120, Hh = 140; g.fillStyle = P.sky; g.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 50; i++) { const x = (i * 29 + t * (14 + (i % 3) * 10)) % W; g.fillStyle = i % 5 ? "#3a3470" : "#a8a2f0"; g.fillRect(W - x, (i * 41) % Hh, 1, 1); }
    // terrain
    g.fillStyle = P.vio; for (let x = 0; x < W; x += 4) { const hh = 14 + Math.round(6 * Math.sin((x + t * 30) * 0.08) + 4 * Math.sin((x + t * 30) * 0.21)); g.fillRect(x, Hh - hh, 4, hh); g.fillStyle = P.cyan; g.fillRect(x, Hh - hh, 4, 2); g.fillStyle = P.vio; }
    const pause = t >= AT["s4:kode"] - 0.3;
    const tf = pause ? AT["s4:kode"] - 0.3 : t;
    if (t < K.s3 - 0.2) {
      txt(g, "AUDIRA", 60, 30, 10, P.yel); txt(g, "ARCADE", 60, 44, 8, P.cyan);
      spr(g, SHIP, 42, 72 + Math.sin(t * 2) * 4, 3);
      if (Math.floor(t * 2) % 2) txt(g, "PRESS START", 60, 104, 7, P.org);
      return;
    }
    const u = ((tf - K.s3) % LOOP + LOOP) % LOOP;
    const sy = 64 + Math.sin(tf * 3) * 16;
    for (let k = 0; k < 4; k++) { const ex = W + 10 - ((u * 60 + k * 26) % 150); spr(g, ENEMY, ex, 22 + k * 24 + Math.sin(tf * 4 + k) * 6, 2); }
    for (let k = 0; k < 7; k++) { g.fillStyle = P.mag; g.fillRect(W - ((u * 90 + k * 20) % W), 30 + k * 13, 3, 3); }
    if (u < 1.75 || pause) spr(g, SHIP, 14, sy - 10, 2);
    if (!pause && u >= 1.75 && u < 2.15) { const e = (u - 1.75) / 0.4; for (let k = 0; k < 14; k++) { const a = k * 0.449; g.fillStyle = k % 2 ? P.org : P.yel; g.fillRect(24 + Math.cos(a) * e * 22, sy + Math.sin(a) * e * 22, 3, 3); } }
    if (!pause && u >= 2.15) { g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(0, 50, W, 34); txt(g, "GAME", 60, 60, 12, P.mag); txt(g, "OVER", 60, 76, 12, P.mag); }
    if (pause) {
      g.fillStyle = "rgba(4,2,16,.78)"; g.fillRect(0, 0, W, Hh);
      txt(g, "PAUSE", 60, 18, 12, Math.floor(t * 2.5) % 2 ? P.wht : P.yel);
      // code typed in across the pause
      const t0 = AT["s4:kode"] + 0.25, t1 = AT["s4:dijeda"] + 0.4;
      const n = Math.floor(clamp01((t - t0) / (t1 - t0)) * 10 + (t >= t1 ? 1 : 0));
      for (let i = 0; i < 10; i++) { const x = 6 + (i % 5) * 22, y = 34 + Math.floor(i / 5) * 18; g.fillStyle = "#1c1840"; g.fillRect(x, y, 18, 15); if (i < Math.min(10, n)) glyph(g, SEQ[i], x + 3, y + 2.5, 1.5, SEQ[i] === "A" || SEQ[i] === "B" ? P.yel : P.cyan); }
      // two meters: with the code (fills at once) vs normal play (one cell at a time)
      const fast = clamp01((t - AT["s4:semua"]) / 0.6), slow = clamp01((t - AT["s4:padahal"]) / (AT["s4:sedikit#2"] + 0.4 - AT["s4:padahal"]));
      txt(g, "KODE", 4, 82, 7, P.yel, "left"); txt(g, "NORMAL", 4, 108, 7, "#a8a2f0", "left");
      for (let i = 0; i < 6; i++) {
        g.fillStyle = "#1c1840"; g.fillRect(4 + i * 19, 88, 17, 10); g.fillRect(4 + i * 19, 114, 17, 10);
        if (fast * 6 > i + 0.5) { g.fillStyle = capCol[i]; g.fillRect(4 + i * 19, 88, 17, 10); }
        if (Math.floor(slow * 6 + 0.001) > i) { g.fillStyle = capCol[i]; g.fillRect(4 + i * 19, 114, 17, 10); }
      }
      if (fast >= 1 && Math.floor(t * 3) % 2) txt(g, "MAX!", 100, 82, 7, P.mag);
    }
  }
  function paintBoard(t) {
    const g = boardS.g, W = 192, Hh = 144; g.fillStyle = "#08061a"; g.fillRect(0, 0, W, Hh);
    txt(g, "SEBELUM RILIS", 96, 16, 10, P.yel); g.fillStyle = P.mag; g.fillRect(16, 27, 160, 2);
    txt(g, "HAPUS", 64, 50, 10, P.wht, "left"); txt(g, "KODE CHEAT", 64, 66, 10, P.wht, "left");
    g.strokeStyle = P.cyan; g.lineWidth = 2; g.strokeRect(26, 44, 24, 24);
    if (t >= AT["s6:terlewat"] && Math.floor(t * 3) % 2) { g.fillStyle = P.mag; g.fillRect(20, 80, 100, 18); txt(g, "TERLEWAT", 70, 90, 9, P.wht); }
    if (t >= AT["s6:diproduksi"] && t < AT["s6:membiarkannya"] + 0.25) txt(g, "PRODUKSI MASSAL >>", 96, 112, 8, P.org);
    const ts = AT["s6:membiarkannya"];
    if (t >= ts + 0.25) { g.save(); g.translate(96, 104); g.rotate(-0.12); g.strokeStyle = "#ff3b4e"; g.lineWidth = 3; g.strokeRect(-86, -22, 172, 44); txt(g, "BIARKAN", 0, -8, 12, "#ff3b4e"); txt(g, "RISIKO BUG BARU", 0, 11, 8, "#ff3b4e"); g.restore(); }
  }
  function paintIcon(t) {
    const g = iconS.g; g.fillStyle = "#0a0620"; g.fillRect(0, 0, 64, 48);
    const k = Math.floor(t * 5) % 12;
    SEQ.forEach((s, i) => { if (i <= k) glyph(g, s, 2 + (i % 5) * 12.5, 6 + Math.floor(i / 5) * 18, 1.25, s === "A" || s === "B" ? P.yel : P.cyan); });
    if (k >= 10) { g.fillStyle = P.mag; g.fillRect(0, 42, 64, 6); }
  }
  function paintBank(t) {
    const g = bankS.g, W = 192, Hh = 120; g.fillStyle = "#9a97b0"; g.fillRect(0, 0, W, Hh);
    g.fillStyle = "#1d2350"; g.fillRect(0, 0, W, 20); txt(g, "BANK OF CANADA", 96, 11, 8, "#ffffff");
    g.fillStyle = "#cfd3e6"; g.fillRect(14, 30, 164, 58); g.strokeStyle = "#5a6aa8"; g.lineWidth = 2; g.strokeRect(18, 34, 156, 50); g.beginPath(); g.arc(150, 59, 16, 0, 7); g.stroke();
    g.fillStyle = "#5a6aa8"; g.fillRect(28, 44, 70, 5); g.fillRect(28, 56, 50, 5); g.fillRect(28, 68, 60, 5);
    const n = Math.floor(clamp01((t - AT["s7:Bank"]) / 0.9) * 10);
    for (let i = 0; i < 10; i++) { g.fillStyle = "#1d2350"; g.fillRect(16 + i * 16.5, 96, 14, 16); if (i < n) glyph(g, SEQ[i], 17.5 + i * 16.5, 98.5, 1.4, SEQ[i] === "A" || SEQ[i] === "B" ? P.yel : P.cyan); }
  }

  // ---------- camera: px py pz lx ly lz ----------
  const s2w = AT["s2:memindahkan"], s4h = AT["s4:Hasilnya"];
  const c0 = track([
    [0, XA, 11, 53, XA, 11, 0], [tMax, XA + 0.6, 11, 50, XA, 11, 0], [K.s1e - 0.35, XA + 1.6, 11.2, 47, XA, 11.2, 0],
    [K.s2 + 0.35, XB - 2, 9.5, 40, XB, 7, 0], [s2w, XB + 1, 9.5, 38, XB + 0.5, 7, 0], [K.s2e - 0.4, XB + 2.5, 9.5, 39, XB + 1, 7, 0],
    [K.s3 + 0.4, XC - 8, 12, 42, XC - 1, 10, 0], [K.s3e - 0.3, XC - 5, 12, 38, XC - 0.5, 10, 0],
    [s4h - 0.2, XC - 3, 12, 37, XC, 10, 0], [s4h + 1.4, XC + 3, 12, 42, XC + 2, 10, 0], [K.s4e - 0.4, XC + 4, 12, 43, XC + 2.5, 10, 0],
    [K.s5 + 0.45, XD, 26, 33, XD, 2, -6], [K.s5e - 0.4, XD + 0.5, 25, 31, XD, 2, -6],
    [K.s6 + 0.45, XE - 3, 12, 40, XE - 2, 9, 0], [AT["s6:diproduksi"], XE + 2, 11, 37, XE, 8.5, 0], [K.s6e - 0.4, XE, 12, 35, XE - 0.5, 9, 0],
    [K.s7 + 0.45, XF + 0.5, 9, 30, XF + 0.5, 7.5, 0], [AT["s7:Amerika"], XF + 1.5, 9.5, 34, XF + 2.5, 9.5, 0], [AT["s7:nyawa"] + 0.5, XF + 2.5, 10.5, 36, XF + 2.5, 10, 0],
    [AT["s7:Sekarang"] + 0.6, XF + 1, 12.5, 40, XF + 1, 12, -6], [K.s7e - 0.4, XF + 1.5, 12.5, 37, XF + 1, 12, -6],
    [K.s8 + 0.45, XG, 12, 44, XG, 10, 0], [K.end, XG + 1, 12.5, 50, XG, 10.5, 0], [K.dur, XG + 1, 12.5, 51, XG, 10.5, 0],
  ]);

  const dummy = new THREE.Object3D(), tmpC = new THREE.Color();
  const capsEmi = (t, i) => {
    const fast = ramp(t, AT["s4:semua"] + i * 0.1, AT["s4:semua"] + i * 0.1 + 0.2);
    return fast;
  };

  return (t) => {
    fontsTick();
    const p = c0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);

    // dust
    for (let i = 0; i < 500; i++) { const s = dSeed[i]; dust.pos[i * 3] = s[0] + Math.sin(t * 0.3 + s[3]) * 1.2; dust.pos[i * 3 + 1] = s[1] + Math.sin(t * 0.21 + s[3] * 2) * 0.8; dust.pos[i * 3 + 2] = s[2]; }
    dust.commit();
    // background screens flicker (seeded by time slot)
    bgPos.forEach((_, i) => { const f = 0.35 + 0.25 * Math.sin(t * 2.3 + bgPh[i]) + (Math.floor(t * 9 + i * 7) % 23 === 0 ? 0.4 : 0); tmpC.set(bgCol[i % 6]).multiplyScalar(f); IBS.setColorAt(i, tmpC); });
    IBS.instanceColor.needsUpdate = true;

    // ---- A: inputs light up, POWER-UP MAX ----
    const near = (x) => Math.abs(p[0] - x) < 40;
    if (near(XA)) {
      pressAt(ctlA, t, tIn, held(t, tIn, t > tMax + 0.15 && t < K.s2 ? 0.7 + 0.5 * Math.sin(t * 10) : 0));
      stA.tiles.forEach((m, i) => { const u = clamp01((t - tIn[i]) / 0.18); m.material[4].emissiveIntensity = 0.05 + u * 1.1 + (t >= tMax && t < tMax + 0.7 ? 1.4 * (1 - (t - tMax) / 0.7) : 0); m.position.z = 1.5 * 0 + (u > 0 && u < 1 ? (1 - u) * 0.8 : 0); m.scale.setScalar(1 + (u > 0 && u < 1 ? Math.sin(u * 3.14) * 0.25 : 0)); });
      paintA(t); monA.set(t, ramp(t, -0.4, 0.25) * 0.9 + 0.1);
      const bu = clamp01((t - tMax) / 1.8);
      for (let i = 0; i < 260; i++) { const s = bSeed[i]; const rad = s[2] * eout(bu); burst.pos[i * 3] = XA + Math.cos(s[0]) * rad; burst.pos[i * 3 + 1] = 11 + s[1] * rad - 6 * bu * bu; burst.pos[i * 3 + 2] = 2 + Math.sin(s[0]) * rad * 0.5; }
      burst.m.opacity = bu > 0 && bu < 1 ? 1 - bu : 0; burst.commit();
      ctlA.G.rotation.y = Math.sin(t * 0.6) * 0.05; ctlA.G.position.y = 6.6 + (t >= tMax && t < tMax + 0.3 ? Math.sin((t - tMax) / 0.3 * 3.14) * 0.6 : 0);
    }

    // ---- B: workbench ----
    if (near(XB)) {
      paintDev(t); devS.set(t); paintGrad(t); gradS.set(t, ramp(t, AT["s2:Gradius"] - 0.6, AT["s2:Gradius"]) * 0.95 + 0.05);
      plateM.material.color.setScalar(0.45 + 0.55 * ramp(t, AT["s2:Kazuhisa"] - 0.2, AT["s2:Kazuhisa"] + 0.3));
      cabB.mq.material.color.setScalar(0.4 + 0.6 * ramp(t, AT["s2:Gradius"] - 0.2, AT["s2:Gradius"] + 0.2) + (t > AT["s2:1985"] && t < AT["s2:1985"] + 0.6 ? 0.5 : 0));
      const cu = back(clamp01((t - AT["s2:NES"] + 0.5) / 0.5), 2.4);
      cartB.scale.setScalar(0.4 + 0.6 * Math.max(0, cu)); cartB.position.y = 3.55 + (t > AT["s2:Nintendo"] ? Math.sin(t * 2) * 0.15 + 0.4 : 0);
      for (let i = 0; i < 60; i++) { const u = ((t - s2w) * 0.55 + i / 60) % 1; const on = t > s2w; const x0 = XB - 6.5, x1 = XB + 6; flow.pos[i * 3] = on ? x0 + (x1 - x0) * u : 0; flow.pos[i * 3 + 1] = on ? 8 - u * 1.5 + Math.sin(u * 3.14) * 4.5 : -50; flow.pos[i * 3 + 2] = on ? -3.5 + u * 5.5 : 0; }
      flow.commit();
    }

    // ---- C: ship keeps dying, then the pause code ----
    if (near(XC) || near(XB)) { paintMain(t); mainS.set(t, ramp(t, K.s3 - 1.2, K.s3 - 0.6) * 0.95 + 0.05); }
    if (near(XC)) {
      const fu = eout(clamp01((t - s4h) / 0.9));
      shipC.visible = t > s4h - 0.05;
      shipC.position.set(XC + fu * 3.5 + Math.sin(t * 1.4) * 0.2, 10.5 + fu * 3.2 + Math.sin(t * 2.1) * 0.25, 1.6 + fu * 4.5);
      shipC.scale.setScalar(0.3 + 0.7 * fu); shipC.rotation.set(Math.sin(t * 1.7) * 0.15, -0.35 + Math.sin(t) * 0.1, 0);
      const ou = clamp01((t - AT["s4:semua"] - 0.25) / 0.4);
      opts.forEach((o, i) => { o.visible = ou > 0 && t < K.s5; const a = t * 2.4 + i * 3.14; o.position.set(shipC.position.x - 2.6 * Math.cos(a) * ou - 1.5, shipC.position.y + 1.4 * Math.sin(a) * ou, shipC.position.z + 0.6 * Math.sin(a)); o.scale.setScalar(ou); });
      const su = ramp(t, AT["s4:langsung"], AT["s4:langsung"] + 0.4); shield.position.copy(shipC.position); shield.material.opacity = 0.12 * su; shield.rotation.y = t * 0.5; shield.scale.setScalar(0.6 + 0.4 * su);
      caps.forEach((m, i) => { const f = capsEmi(t, i); m.material.emissiveIntensity = 0.05 + f * 2.4; m.scale.setScalar(0.85 + 0.15 * back(f, 2)); });
    }

    // ---- D: rhythm vs mashing ----
    if (near(XD)) {
      const tA = K.s5 + 0.3, step = (AT["s5:penguji"] + 0.3 - tA) / 10;
      padsL.forEach((m, i) => { const ti = tA + i * step; const on = t >= ti; m.material[2].emissiveIntensity = on ? 0.4 + 1.6 * Math.max(0, 1 - (t - ti) / 0.4) + 0.35 : 0.08; m.material[2].color.set(on ? 0x5cff7a : 0x8888aa); m.position.y = 0.18 - (on && t - ti < 0.15 ? 0.12 : 0); });
      const okL = t > tA + 10 * step;
      lockL.sh.position.y = 7.5 + (okL ? eout(clamp01((t - tA - 10 * step) / 0.3)) * 1.1 : 0); lockL.lamp.material.color.set(okL ? 0x5cff7a : 0x444444);
      // engineer hops pad to pad in an even beat: lands on pad i at tA + i*step
      if (t > K.s5 - 0.6 && t < K.s6) {
        const zOf = (i) => (i < 0 ? 11.75 : 9 - Math.min(9, i) * 2.75);
        const f = clamp01((t - (tA - step)) / (step * 10)) * 10, i0 = Math.min(9, Math.floor(f)) - 1, fr = f >= 10 ? 1 : f % 1;
        const done = t >= tA + 9 * step + 0.05, moving = t > tA - step && !done;
        H.G.position.set(XD - 3.3, 0.36 + (moving ? Math.sin(fr * 3.14) * 1.3 : 0), zOf(i0) + (zOf(i0 + 1) - zOf(i0)) * eout(fr));
        H.G.rotation.set(0, Math.PI, 0); H.G.scale.setScalar(0.9);
        restPose(H); if (moving) runPose(H, fr * 6.28, 0.6); if (done) { H.armL.rotation.z = -2.6; H.armR.rotation.z = 2.6; H.G.rotation.y = 0.2; }
        smile.visible = true; frown.visible = false; H.head.rotation.set(0, 0, 0); H.G.visible = true;
      }
      const tB = AT["s5:sulit"] - 0.2;
      H2.G.visible = true; H2.G.scale.setScalar(0.9); restPose(H2);
      let hitI = -1;
      if (t >= tB) { const slot = Math.floor((t - tB) / 0.2), sf = ((t - tB) / 0.2) % 1; const cur = mashSeq[slot % 40], nx = mashSeq[(slot + 1) % 40]; hitI = cur[0]; const z0 = 9 - cur[0] * 2.75, z1 = 9 - nx[0] * 2.75; H2.G.position.set(XD + 3.3 + (cur[1] - 0.5) * 0.8, 0.36 + Math.sin(sf * 3.14) * 0.9, z0 + (z1 - z0) * eout(sf)); runPose(H2, t * 18, 1); H2.G.rotation.y = Math.PI + Math.sin(t * 9) * 0.8; }
      else H2.G.position.set(XD + 3.3, 0.36, 11.75), H2.G.rotation.y = 0.3;
      padsR.forEach((m, i) => { const on = i === hitI; m.material[2].emissiveIntensity = on ? 1.8 : 0.08; m.material[2].color.set(on ? 0xff2e88 : 0x8888aa); });
      const bad = t >= tB && Math.floor((t - tB) * 2.5) % 2 === 0; lockR.lamp.material.color.set(t >= tB ? (bad ? 0xff2e88 : 0x551020) : 0x444444); lockR.sh.position.y = 7.5;
    } else H2.G.visible = false;

    // ---- E: checklist, conveyor, stamp ----
    if (near(XE)) {
      paintBoard(t); boardS.set(t, ramp(t, K.s6 - 0.4, K.s6 + 0.2) * 0.95 + 0.05);
      const tp = AT["s6:diproduksi"], sp = 1.2 + 3.5 * ramp(t, tp - 0.3, tp + 0.8);
      const dist = 1.2 * (t - K.s6) + Math.max(0, t - tp) * 3.0;
      for (let i = 0; i < NC; i++) { const x = XE - 15 + (((dist + i * 2.6) % (NC * 2.6)) + NC * 2.6) % (NC * 2.6); const vis = x < XE + 15; dummy.position.set(vis ? x : 0, vis ? 4.45 : -50, 5); dummy.rotation.set(-0.15, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); cartIM.setMatrixAt(i, dummy.matrix); dummy.position.z += 0.21 * Math.cos(0.15); dummy.position.y += 0.15 + 0.03; dummy.updateMatrix(); cartLbl.setMatrixAt(i, dummy.matrix); }
      cartIM.instanceMatrix.needsUpdate = cartLbl.instanceMatrix.needsUpdate = true;
      beltM.material.map.offset.x = -dist / 30 * 24 / 24;
      const ts = AT["s6:membiarkannya"], su = t - ts;
      const zS = su < -0.45 ? 10 : su < 0 ? 10 - 11.76 * (1 - Math.pow(1 - clamp01((su + 0.45) / 0.45), 2)) : su < 0.15 ? -1.76 : -1.76 + 11 * ramp(t, ts + 0.5, ts + 1.1);
      stamp.position.set(XE + 2, 8.4, zS); stamp.rotation.set(Math.PI / 2, 0, -0.12); stamp.visible = t > ts - 0.5 && t < ts + 1.2;
      const tb = AT["s6:bug"];
      bugV.visible = t > tb - 0.1; bugV.position.set(XE - 3 + 3 * clamp01((t - tb) / 1.2) + Math.sin(t * 12) * 0.05, 7.0 + Math.abs(Math.sin(t * 10)) * 0.15, -1.6); bugV.scale.setScalar(back(clamp01((t - tb) / 0.3), 2));
    }

    // ---- F: 1986, 30 lives, code spreads ----
    if (near(XF)) {
      const cu = back(clamp01((t - K.s7 - 0.2) / 0.6), 1.8);
      const am = ramp(t, AT["s7:Amerika"] - 0.2, AT["s7:Amerika"] + 0.6), sk = ramp(t, AT["s7:Sekarang"] - 0.2, AT["s7:Sekarang"] + 0.7);
      cartF.position.set(XF - 2.5 * am, 1.2 + (1 - cu) * -8 + 0.2 * Math.sin(t * 1.5), 2 - 4 * sk); cartF.rotation.y = Math.sin(t * 0.7) * 0.15 - 0.25 * am; cartF.scale.setScalar(1 - 0.35 * am);
      pedF.position.set(XF - 2.5 * am, 0.6, 2 - 4 * sk);
      const tl3 = AT["s7:tiga"];
      lives.forEach((v, i) => { const u = back(clamp01((t - tl3 - i * 0.025) / 0.3), 2.2); v.visible = u > 0.001 && t < AT["s7:Sekarang"] + 0.6; v.scale.setScalar(Math.max(0.001, u) * (1 - sk)); v.rotation.y = Math.sin(t * 2 + i) * 0.4; });
      livesM.visible = t > AT["s7:Contra"] - 0.2 && t < AT["s7:Sekarang"] + 0.6; livesM.material.opacity = ramp(t, AT["s7:Contra"] - 0.2, AT["s7:Contra"] + 0.2) * (1 - sk);
      paintIcon(t); iconS.set(t);
      const tw = AT["s7:kejutan"];
      wallScr.forEach((w, i) => { const u = back(clamp01((t - tw - ((i * 7) % 20) * 0.08) / 0.35), 2); w.G.visible = t > AT["s7:Sekarang"] - 0.5; w.s.visible = u > 0.05; w.s.scale.set(1, Math.max(0.02, u), 1); });
      const tbk = AT["s7:Bank"];
      paintBank(t); bankS.set(t, ramp(t, tbk - 0.5, tbk - 0.1)); bankG.visible = t > tbk - 0.6; bankG.position.z = -4 + 5 * eout(clamp01((t - tbk + 0.6) / 0.5)); bankG.position.y = 11.5;
    }

    // ---- G: tribute ----
    if (near(XG)) {
      const tl0 = AT["s8:tapi"], live = ramp(t, tl0, tl0 + 1);
      const gl = 0.5 + 0.5 * Math.sin(t * 2.2);
      const tg = SEQ.map((_, i) => AT["s8:kodenya"] + i * 0.32); pressAt(ctlG, t, tg, held(t, tg, 0.15 + live * (0.3 + 0.3 * gl)));
      tribM.material.color.setScalar(0.5 + 0.5 * ramp(t, K.s8 - 0.2, K.s8 + 0.6));
      lG.intensity = 40 + 80 * live * gl;
      const ta = AT["s8:AUDIRA"]; signM.material.opacity = t < ta - 0.6 ? 0.25 : t < ta ? (Math.floor(t * 14) % 3 ? 0.9 : 0.2) : 1;
    }

    // ---- engineer staging per scene ----
    if (t < K.s5 - 0.6 || t >= K.s6 - 0.6) {
      H.G.visible = true; H.G.scale.setScalar(1); restPose(H); smile.visible = true; frown.visible = false; H.head.rotation.set(0, 0, 0); H.G.rotation.set(0, 0, 0);
      if (t < K.s2 - 0.4) H.G.visible = false;
      else if (t < K.s2e - 0.3) { H.G.position.set(XB - 1, 0, -2.6); H.G.rotation.y = 0.1; H.G.scale.setScalar(1.4); H.armL.rotation.x = -0.9; H.armR.rotation.x = -0.9 + Math.sin(t * 9) * 0.15; H.head.rotation.x = 0.25; if (t > AT["s2:Kazuhisa"] && t < AT["s2:Konami"] + 0.8) { H.head.rotation.x = 0; H.armR.rotation.set(0, 0, 2.5 + Math.sin(t * 8) * 0.3); } }
      else if (t < K.s5 - 0.6) {
        // at the cabinet, back to camera, playing; slumps at each GAME OVER
        H.G.position.set(XC - 5, 0, 6); H.G.rotation.y = Math.PI + 0.5; H.G.scale.setScalar(1.3);
        const u = ((t - K.s3) % LOOP + LOOP) % LOOP, over = t > K.s3 && t < AT["s4:kode"] - 0.3 && u > 2.15;
        H.armL.rotation.x = -1.25 + Math.sin(t * 14) * 0.08; H.armR.rotation.x = -1.25 + Math.cos(t * 13) * 0.1;
        if (over) { H.armL.rotation.set(-2.7, 0, -0.3); H.armR.rotation.set(-2.7, 0, 0.3); H.head.rotation.x = 0.4; smile.visible = false; frown.visible = true; }
        if (t > AT["s3:sanggup"] && t < K.s3e) { H.G.rotation.y = 0.5; H.armL.rotation.set(-2.6, 0, -0.4); H.armR.rotation.set(-2.6, 0, 0.4); H.head.rotation.x = 0.35; smile.visible = false; frown.visible = true; H.G.position.set(XC - 5.5, 0, 6.5); }
        if (t > s4h) { H.G.rotation.y = 0.6; H.armR.rotation.set(0, 0, 2.6 + Math.sin(t * 8) * 0.3); H.armL.rotation.set(0, 0, 0); smile.visible = true; frown.visible = false; H.head.rotation.x = -0.1; H.G.position.set(XC - 5.5, 0, 6.5); }
      } else if (t < K.s7 - 0.3) {
        H.G.position.set(XE - 5.5, 0, 3.5); H.G.rotation.y = 0.55; H.G.scale.setScalar(1.5);
        H.armR.rotation.set(-1.4, 0, 0.2);
        if (t > AT["s6:terlewat"]) { H.armR.rotation.set(-0.2, 0, 0); H.armL.rotation.set(0, 0, 0); H.head.rotation.z = Math.sin(t * 6) * 0.1; }
        if (t > AT["s6:membiarkannya"]) { H.armL.rotation.set(-0.4, 0, -0.9); H.armR.rotation.set(-0.4, 0, 0.9); H.head.rotation.z = 0.15; }
        if (t > AT["s6:bug"]) { smile.visible = false; frown.visible = true; }
      } else if (t < K.s8 - 0.3) {
        H.G.position.set(XF - 6.5, 0, 5); H.G.rotation.y = 0.6; H.G.scale.setScalar(1.3); H.armR.rotation.set(-1.6, 0, 0); if (t > AT["s7:Sekarang"]) { H.G.position.set(XF - 7, 0, 8); H.armR.rotation.set(0, 0, 2.6 + Math.sin(t * 7) * 0.25); }
      } else { H.G.position.set(XG - 8.5, 0, 4.5); H.G.rotation.y = 0.5; H.head.rotation.x = 0.15; H.G.scale.setScalar(1.3); }
    }
    comp.render();
  };
}
