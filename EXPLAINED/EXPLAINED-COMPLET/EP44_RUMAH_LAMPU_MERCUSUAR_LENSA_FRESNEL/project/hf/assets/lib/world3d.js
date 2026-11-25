// EP44 FRESNEL LENS (GLASSCRAFT). A night sea and one white lighthouse; everything optical is real transmissive glass
// (MeshPhysicalMaterial: transmission, IOR 1.5, thickness, clearcoat) with a coloured backplate behind it (the big amber
// moon disc, the lamp) and one crisp cool key light plus cyan/magenta rims, so glass reads as glass, never as a glowing panel.
//   L = (0,27.5,0)  lantern room: lamp that stays on, a rotating flash lens (4 bullseye panels + upper/lower prism rings),
//                   AUDIRA band on the gallery rail, keeper figure for scale (s7)
//   B = (-7,27,3)   frosted-glass bust on a plinth with a name card (generic silhouette, no likeness) (s2)
//   E = (8,27.5,3)  floating exhibit lens, axis +x, lamp at its focus: thick lens -> centre glows "removed" -> its
//                   curved surface collapses into thin stepped rings (morph targets), rays exit parallel (s3-s5)
//   far sea         two other lighthouses with different flash patterns, ships, a 30 km sight line (s7, s8)
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, smooth, canvasTex, track, stage, envStrips, pts } from "./lib3d.js";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Clean studio grade: neutral highlights, slightly cool shadows, crisp contrast, warm flash when a beam crosses the lens.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=vec3(0.0,0.008,0.022)*(1.0-l);c=(c-0.5)*1.08+0.5;
  c=mix(c,vec3(1.0,0.96,0.86),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const L = new THREE.Vector3(0, 27.5, 0), B = new THREE.Vector3(-7, 26.4, 3), E = new THREE.Vector3(8, 27.5, 3);
const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
const mod = (a, n) => ((a % n) + n) % n;
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const std = (color, rough = 0.5, metal = 0, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...o });
const glass = (tint = 0xf4fbff, rough = 0.04, o = {}) => new THREE.MeshPhysicalMaterial({ color: tint, transmission: 1, ior: 1.5, thickness: 0.4, roughness: rough, metalness: 0,
  clearcoat: 1, clearcoatRoughness: 0.04, specularIntensity: 1, attenuationColor: new THREE.Color(0xd8f6ff), attenuationDistance: 2.5, side: THREE.DoubleSide, ...o });
const glow = (r, g, b, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), ...o });
function seg(p, q, r, mat, parent) {
  const d = new THREE.Vector3().subVectors(q, p), len = d.length();
  const m = mesh(new THREE.CylinderGeometry(r, r, len, 8, 1, true), mat, parent);
  m.position.copy(p).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = m.receiveShadow = false; return m;
}
function card(text, sub, w, h, accent = "#5ee7ff") {
  return canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => {
    g.clearRect(0, 0, W, H); g.fillStyle = "rgba(240,250,255,0.16)"; g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, H * 0.22); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#ffffff"; g.font = `800 ${Math.round(H * (sub ? 0.36 : 0.5))}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H * (sub ? 0.4 : 0.53));
    if (sub) { g.fillStyle = accent; g.font = `700 ${Math.round(H * 0.18)}px 'Courier New', monospace`; g.fillText(sub, W / 2, H * 0.75); }
  });
}
const plane = (tex, w, h, parent, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })); m.position.set(x, y, z); if (parent) parent.add(m); return m; };

// Generic person: head on a neck, shoulders wider than the waist, bent elbows and knees, skin unlike the clothes. Feet at y=0.
function person(coat, pants, skin, hair) {
  const G = new THREE.Group();
  const C = std(coat, 0.7), P = std(pants, 0.75), S = std(skin, 0.6), H = std(hair, 0.8);
  mesh(new THREE.CylinderGeometry(0.25, 0.17, 0.6, 16), C, G, 0, 1.24, 0).scale.z = 0.62;
  mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.2, 14), P, G, 0, 0.93, 0).scale.z = 0.7;
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.1, 12, 8), C, G, s * 0.25, 1.49, 0);
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10), S, G, 0, 1.6, 0);
  mesh(new THREE.SphereGeometry(0.115, 18, 14), S, G, 0, 1.73, 0.01).scale.set(0.92, 1.08, 1);
  mesh(new THREE.SphereGeometry(0.12, 18, 10, 0, 6.3, 0, 1.4), H, G, 0, 1.76, -0.005);
  const limb = (x, y, l1, l2, r, m1, m2, bend, swing) => { const p = new THREE.Group(); p.position.set(x, y, 0); p.rotation.x = swing; G.add(p);
    mesh(new THREE.CylinderGeometry(r, r * 0.88, l1, 10), m1, p, 0, -l1 / 2, 0); const j = new THREE.Group(); j.position.y = -l1; j.rotation.x = bend; p.add(j);
    mesh(new THREE.SphereGeometry(r * 0.92, 10, 8), m1, j); mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.75, l2, 10), m2, j, 0, -l2 / 2, 0); return j; };
  for (const s of [-1, 1]) { const el = limb(s * 0.29, 1.47, 0.29, 0.27, 0.048, C, C, -0.45, 0.1); el.rotation.z = s * 0.05; mesh(new THREE.SphereGeometry(0.05, 10, 8), S, el, 0, -0.3, 0); }
  for (const s of [-1, 1]) { const kn = limb(s * 0.1, 0.9, 0.44, 0.42, 0.07, P, P, 0.12, -0.06); mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), std(0x1a1d22, 0.6), kn, 0, -0.45, 0.05); }
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x070b18, fog: 0.0026, exp: 1.0, bloom: [0.7, 0.45, 0.85], fov: 38 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  // high-key softbox strips for glass and clearcoat to reflect
  envStrips(r, scene, [[24, 5, 0xffffff, 2.2, 0, 22, 14], [5, 22, 0x5ee7ff, 1.4, -18, 6, 6], [5, 22, 0xff5fd2, 1.2, 18, 6, -6], [30, 3, 0xffd9a0, 1.2, 0, -10, -16], [8, 8, 0xffffff, 1.6, 10, 12, -14]], 0x05070d);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0x5a78b0, 0x05070d, 0.5));
  const key = new THREE.DirectionalLight(0xe6f3ff, 2.4); key.position.set(30, 60, 50); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 40, bottom: -5, near: 1, far: 160 }); key.shadow.bias = -0.0005;
  key.target.position.set(0, 18, 0); scene.add(key, key.target);
  const rimC = new THREE.PointLight(0x5ee7ff, 40, 30, 2); rimC.position.set(-6, 31, -5); scene.add(rimC);
  const rimM = new THREE.PointLight(0xff5fd2, 30, 30, 2); rimM.position.set(9, 30, -4); scene.add(rimM);
  const lampL = new THREE.PointLight(0xffe2b0, 30, 12, 2); lampL.position.copy(L); scene.add(lampL);
  const exL = new THREE.PointLight(0xffd29a, 0, 8, 2); scene.add(exL);

  // ---------- sky, moon backplate, sea ----------
  const moon = mesh(new THREE.CircleGeometry(16, 64), glow(1.5, 1.08, 0.62, { fog: false }), scene, 34, 32, -90); moon.castShadow = moon.receiveShadow = false;
  const halo = plane(canvasTex(256, 256, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, W * 0.2, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,200,140,0.5)"); gr.addColorStop(1, "rgba(255,200,140,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }), 70, 70, scene, 34, 32, -91);
  halo.material.fog = false;
  const stars = pts(scene, 380, { size: 0.9 }); stars.m.fog = false;
  { const R = mulberry(44); for (let i = 0; i < 380; i++) { const a = R() * 6.283, e = 0.05 + R() * 1.3, d = 320; stars.pos.set([Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d], i * 3); const b = 0.3 + R() * 1.3; stars.col.set([b, b, b * 1.15], i * 3); } stars.commit(); }
  const waveN = canvasTex(256, 256, (g, W, H) => { const R = mulberry(3); g.fillStyle = "#8080ff"; g.fillRect(0, 0, W, H); for (let i = 0; i < 220; i++) { g.strokeStyle = `rgba(${110 + R() * 40},${110 + R() * 40},255,0.45)`; g.lineWidth = 1 + R() * 3; const x = R() * W, y = R() * H; g.beginPath(); g.moveTo(x - 24, y); g.quadraticCurveTo(x, y - 7, x + 24, y); g.stroke(); } }, [90, 90]);
  waveN.colorSpace = THREE.NoColorSpace;
  const sea = mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshPhysicalMaterial({ color: 0x0a1426, roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1, normalMap: waveN, normalScale: new THREE.Vector2(0.6, 0.6) }), scene);
  sea.rotation.x = -Math.PI / 2; sea.castShadow = false;

  // ---------- island + tower ----------
  { const R = mulberry(12); const rk = std(0x2a2f38, 0.85, 0.05); for (let i = 0; i < 26; i++) { const a = R() * 6.283, d = R() * 6, s = 1.2 + R() * 2.4; const m = mesh(new THREE.DodecahedronGeometry(s, 1), rk, scene, Math.cos(a) * d, s * 0.3 - 0.4, Math.sin(a) * d); m.rotation.set(R() * 3, R() * 3, R() * 3); m.scale.y = 0.6 + R() * 0.5; } }
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf2f4f6, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  mesh(new THREE.CylinderGeometry(4.2, 4.6, 2, 48), std(0x9ba3ad, 0.7), scene, 0, 1.6, 0);
  mesh(new THREE.CylinderGeometry(1.9, 3.1, 23.4, 64), white, scene, 0, 14.3, 0);
  for (const y of [9, 16, 22]) { const w = mesh(new THREE.BoxGeometry(0.6, 1.0, 0.2), glass(0x9fe9ff, 0.1, { emissive: new THREE.Color(0xffc98a), emissiveIntensity: 0.6 }), scene, 0, y, 3.06 - (y - 2.6) * 0.051); w.castShadow = false; }
  mesh(new THREE.BoxGeometry(1.2, 2.0, 0.3), std(0x1d2a3a, 0.4, 0.6), scene, 0, 3.6, 3.05);
  const plaque = plane(card("AUDIRA", "MERCUSUAR · LENSA FRESNEL", 2.4, 0.7), 2.4, 0.7, scene, 0, 5.2, 3.0);
  mesh(new THREE.CylinderGeometry(3.3, 2.2, 0.5, 48), std(0x1f2731, 0.35, 0.8), scene, 0, 26.0, 0);
  mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.15, 48), std(0x2a3340, 0.4, 0.7), scene, 0, 26.25, 0);
  // gallery rail + AUDIRA band
  const rail = std(0x2a3340, 0.3, 0.9);
  mesh(new THREE.TorusGeometry(3.25, 0.05, 8, 96), rail, scene, 0, 27.15, 0).rotation.x = Math.PI / 2;
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6), rail, scene, Math.cos(a) * 3.25, 26.7, Math.sin(a) * 3.25); }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(3.27, 3.27, 0.34, 96, 1, true, -0.55, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 128, (g, W, H) => { g.clearRect(0, 0, W, H); g.fillStyle = "rgba(10,16,30,0.82)"; g.fillRect(0, 0, W, H); g.fillStyle = "#ffffff"; g.font = "800 84px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", W / 2, H / 2 + 4); g.fillStyle = "#5ee7ff"; g.fillRect(0, H - 8, W, 8); }), transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  band.position.set(0, 26.82, 0); band.rotation.y = 0; scene.add(band);
  // lantern: thin glass panes, bronze mullions, dark roof
  const pane = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  mesh(new THREE.CylinderGeometry(2.45, 2.45, 3.2, 10, 1, true), pane, scene, 0, 27.95, 0).castShadow = false;
  const bronze = std(0x8a6a3c, 0.32, 0.9);
  for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * 6.283; mesh(new THREE.BoxGeometry(0.07, 3.2, 0.07), bronze, scene, Math.cos(a) * 2.42, 27.95, Math.sin(a) * 2.42); }
  mesh(new THREE.ConeGeometry(2.8, 1.5, 48), std(0x1b222c, 0.35, 0.8), scene, 0, 30.3, 0);
  mesh(new THREE.SphereGeometry(0.28, 16, 12), bronze, scene, 0, 31.15, 0);

  // ---------- flash lens (rotates) ----------
  const lens = new THREE.Group(); lens.position.copy(L); scene.add(lens);
  const lensGlass = glass(0xf6fcff, 0.03, { thickness: 0.6 });
  const bull = (parent) => { // concentric stepped rings of a bullseye panel, facing +z
    const g = new THREE.Group(); parent.add(g);
    for (let i = 0; i < 6; i++) { const r0 = i * 0.1, r1 = r0 + 0.1, h = 0.03 + 0.07 * (1 - (i / 6) ** 2);
      const prof = [new THREE.Vector2(r0, 0), new THREE.Vector2(r1, 0), new THREE.Vector2(r1, 0.02), new THREE.Vector2(r0 + 0.01, h), new THREE.Vector2(r0, h), new THREE.Vector2(r0, 0)];
      const geo = new THREE.LatheGeometry(prof, 48); geo.rotateX(Math.PI / 2); mesh(geo, lensGlass, g); }
    return g; };
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const P = new THREE.Group(); P.rotation.y = a; lens.add(P);
    const b = bull(P); b.position.set(0, 0, 0.98); b.scale.setScalar(1.25);
    mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), bronze, P, 0, 0.78, 1.0); mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), bronze, P, 0, -0.78, 1.0); }
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * 6.283; mesh(new THREE.BoxGeometry(0.05, 2.5, 0.05), bronze, lens, Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1); }
  const prismRings = [];
  for (const s of [-1, 1]) for (let j = 0; j < 4; j++) { // catadioptric prisms: triangular rings above and below
    const y = s * (0.86 + j * 0.11), rr = 1.02 - j * 0.07;
    const prof = s > 0 ? [new THREE.Vector2(rr - 0.12, 0), new THREE.Vector2(rr, 0), new THREE.Vector2(rr - 0.03, 0.1), new THREE.Vector2(rr - 0.12, 0)]
      : [new THREE.Vector2(rr - 0.12, 0), new THREE.Vector2(rr - 0.03, -0.1), new THREE.Vector2(rr, 0), new THREE.Vector2(rr - 0.12, 0)];
    const m = mesh(new THREE.LatheGeometry(prof, 72), lensGlass, lens, 0, y, 0); prismRings.push(m); }
  mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.08, 48), bronze, lens, 0, -1.3, 0);
  mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.08, 48), bronze, lens, 0, 1.3, 0);
  const lamp = mesh(new THREE.SphereGeometry(0.17, 24, 16), glow(7, 5.6, 3.6), scene, L.x, L.y, L.z); lamp.castShadow = false;
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.2, 12), std(0x3a3f46, 0.4, 0.8), scene, L.x, L.y - 0.8, L.z);
  // beams: one per bullseye panel, children of the lens so they sweep with it
  const beamTex = canvasTex(32, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.35, "rgba(255,255,255,0.35)"); gr.addColorStop(0.97, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0.4)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  const beamM = new THREE.MeshBasicMaterial({ color: 0xfff1d6, map: beamTex, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 4; i++) { const g = new THREE.CylinderGeometry(9, 0.75, 120, 32, 1, true); g.translate(0, -60, 0); g.rotateX(-Math.PI / 2); g.rotateY(i * Math.PI / 2); const m = mesh(g, beamM, lens); m.castShadow = m.receiveShadow = false; }
  const seaSpot = new THREE.SpotLight(0xfff1d6, 9000, 0, 0.13, 0.7, 2); seaSpot.position.copy(L); scene.add(seaSpot, seaSpot.target);

  // ---------- bust of the inventor (generic silhouette) ----------
  const bust = new THREE.Group(); bust.position.copy(B); scene.add(bust);
  { const prof = [[0, 0], [0.62, 0], [0.6, 0.12], [0.5, 0.3], [0.22, 0.48], [0.14, 0.62], [0.13, 0.72], [0.2, 0.82], [0.24, 0.98], [0.22, 1.12], [0.14, 1.22], [0, 1.26]].map(([a, b]) => new THREE.Vector2(a, b));
    mesh(new THREE.LatheGeometry(prof, 64), glass(0xeaf6ff, 0.28, { thickness: 0.9 }), bust, 0, 0.45, 0).scale.z = 0.75;
    mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.45, 48), new THREE.MeshPhysicalMaterial({ color: 0x07090f, roughness: 0.08, metalness: 0.3, clearcoat: 1 }), bust, 0, 0.22, 0); }
  const nameCard = plane(card("AUGUSTIN FRESNEL", "FISIKAWAN · PRANCIS", 2.2, 0.5, "#ffb347"), 2.2, 0.5, bust, 0, -0.25, 0.9);
  const yearCard = plane(card("1823", "CORDOUAN, PRANCIS", 1.5, 0.62, "#ffb347"), 1.5, 0.62, bust, 1.45, 1.55, 0.2);
  const bustDisc = mesh(new THREE.CircleGeometry(1.5, 64), glow(0.45, 1.3, 1.6, { transparent: true, opacity: 0.55 }), bust, 0, 1.3, -1.2); bustDisc.castShadow = false;

  // ---------- exhibit lens: thick -> Fresnel (morph targets) ----------
  const ex = new THREE.Group(); ex.position.copy(E); scene.add(ex);
  const Rr = 1.5, AP = 1.2, BASE = 0.12, NZ = 6, cap = (x) => Math.sqrt(Rr * Rr - x * x) - Math.sqrt(Rr * Rr - AP * AP);
  const zoneProf = (i, m) => { const r0 = i * AP / NZ, r1 = (i + 1) * AP / NZ, top = (x) => BASE + cap(x) - m * cap(r1), pts2 = [new THREE.Vector2(r0, 0), new THREE.Vector2(r1, 0), new THREE.Vector2(r1, top(r1))];
    for (let k = 1; k <= 8; k++) { const x = r1 - (r1 - r0) * k / 8; pts2.push(new THREE.Vector2(x, top(x))); } pts2.push(new THREE.Vector2(r0, 0)); return pts2; };
  const exGlass = glass(0xf6fcff, 0.03, { thickness: 0.8 });
  const zones = [];
  for (let i = 0; i < NZ; i++) {
    const g0 = new THREE.LatheGeometry(zoneProf(i, 0), 72), g1 = new THREE.LatheGeometry(zoneProf(i, 1), 72);
    g0.rotateZ(-Math.PI / 2); g1.rotateZ(-Math.PI / 2); g0.computeVertexNormals(); g1.computeVertexNormals();
    g0.morphAttributes.position = [g1.attributes.position]; g0.morphAttributes.normal = [g1.attributes.normal];
    const m = mesh(g0, exGlass, ex); m.morphTargetInfluences = [0]; zones.push(m);
  }
  const ghostG = new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(AP, 0), ...Array.from({ length: 25 }, (_, k) => { const x = AP - AP * k / 24; return new THREE.Vector2(x, BASE + cap(x)); })], 72);
  ghostG.rotateZ(-Math.PI / 2);
  const ghostM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.75, 0.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const ghost = mesh(ghostG.clone().scale(0.98, 0.9, 0.9), ghostM, ex); ghost.castShadow = false;
  const skinG = new THREE.LatheGeometry(Array.from({ length: 25 }, (_, k) => { const x = AP - AP * k / 24; return new THREE.Vector2(x, BASE + cap(x) + 0.012); }), 72); skinG.rotateZ(-Math.PI / 2);
  const skinM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.6, 2.0), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  mesh(skinG, skinM, ex).castShadow = false;
  const exDisc = mesh(new THREE.CircleGeometry(2.1, 64), glow(1.3, 0.55, 1.25, { transparent: true, opacity: 0.6 }), ex, 0.6, 0, -2.6); exDisc.castShadow = false;
  const exLamp = mesh(new THREE.SphereGeometry(0.11, 16, 12), glow(6, 4.8, 3), ex, -2.0, 0, 0); exLamp.castShadow = false;
  const rayIn = glow(1.9, 1.5, 0.9, { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const rayOut = glow(1.9, 1.5, 0.9, { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = -3; i <= 3; i++) { const y = i * 0.34; seg(new THREE.Vector3(-2.0, 0, 0), new THREE.Vector3(0, y, 0), 0.012, rayIn, ex); seg(new THREE.Vector3(0, y, 0), new THREE.Vector3(5.5, y, 0), 0.014, rayOut, ex); }
  const lost = pts(ex, 60, { size: 0.09 });

  // ---------- prism ray diagram on the real lens (s6) ----------
  const diag = new THREE.Group(); diag.position.copy(L); scene.add(diag);
  const dMid = glow(1.8, 1.5, 1.0, { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const dPri = glow(0.5, 1.6, 2.0, { transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = -2; i <= 2; i++) { const y = i * 0.28; seg(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.0, y, 0), 0.01, dMid, diag); seg(new THREE.Vector3(1.0, y, 0), new THREE.Vector3(7, y * 0.2, 0), 0.012, dMid, diag); }
  for (const s of [-1, 1]) for (let j = 0; j < 4; j++) { const y = s * (0.86 + j * 0.11), x = 1.0 - j * 0.07; seg(new THREE.Vector3(0, 0, 0), new THREE.Vector3(x - 0.05, y, 0), 0.01, dPri, diag); seg(new THREE.Vector3(x - 0.05, y, 0), new THREE.Vector3(7, y * 0.25, 0), 0.012, dPri, diag); }

  // ---------- keeper for scale (s7) ----------
  const keeper = person(0x1f3a5f, 0x2a2f38, 0xd9a882, 0x2b1d14); keeper.position.set(1.55, 26.32, 1.15); keeper.rotation.y = -0.5; scene.add(keeper);
  const ruler = new THREE.Group(); ruler.position.set(-1.35, 26.32, 0.6); scene.add(ruler);
  mesh(new THREE.BoxGeometry(0.03, 2.5, 0.03), glow(0.4, 1.6, 2.0), ruler, 0, 1.25, 0).castShadow = false;
  for (const y of [0, 2.5]) mesh(new THREE.BoxGeometry(0.3, 0.03, 0.03), glow(0.4, 1.6, 2.0), ruler, 0, y, 0).castShadow = false;
  const rulerCard = plane(card("2,5 m", null, 0.9, 0.36), 0.9, 0.36, ruler, -0.6, 1.25, 0);

  // ---------- far sea: other lighthouses, ships, sight line ----------
  const farL = [[-110, -190, [[0, 0.25]], 2.0], [95, -240, [[0, 0.2], [0.55, 0.75]], 5.0]].map(([x, z, pat, per]) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    mesh(new THREE.CylinderGeometry(1.2, 2, 16, 24), white, G, 0, 8, 0); mesh(new THREE.DodecahedronGeometry(4, 0), std(0x2a2f38, 0.9), G, 0, -1.5, 0);
    const lp = mesh(new THREE.SphereGeometry(1.1, 16, 12), glow(1, 1, 1, { fog: false }), G, 0, 16.8, 0); lp.castShadow = false; return { lp, pat, per }; });
  const ship = (x, z, s) => { const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); scene.add(G);
    mesh(new THREE.BoxGeometry(6, 1.1, 2), std(0x1c2633, 0.5, 0.3), G, 0, 0.4, 0); mesh(new THREE.BoxGeometry(2, 1.2, 1.6), white, G, -1, 1.5, 0);
    mesh(new THREE.SphereGeometry(0.18, 8, 6), glow(3, 0.4, 0.3, { fog: false }), G, 3, 1.1, -0.8).castShadow = false; mesh(new THREE.SphereGeometry(0.18, 8, 6), glow(0.3, 3, 0.8, { fog: false }), G, 3, 1.1, 0.8).castShadow = false;
    mesh(new THREE.SphereGeometry(0.2, 8, 6), glow(3, 3, 2.6, { fog: false }), G, -1, 2.5, 0).castShadow = false; return G; };
  const ship1 = ship(-34, -55, 1), ship2 = ship(12, -300, 1.6), ship3 = ship(-60, 40, 1);
  const sight = pts(scene, 70, { size: 0.9 });
  const glint = pts(scene, 40, { size: 0.35 });

  // ---------- camera ----------
  const k = (t, p, l) => [t, ...p, ...l];
  const CAM = track([
    k(0, [14, 21, 36], [0, 25.2, 0]),
    k(A("s1:lampunya"), [7, 28.6, 12], [0, 27.4, 0]),
    k(A("s1:berputar") + 0.3, [3.3, 28.3, 5.4], [0, 27.6, 0]),
    k(K.s2 - 0.1, [0.5, 28.4, 7.5], [-3, 27.4, 1]),
    k(A("s2:Augustin"), [-5.4, 27.9, 8.6], [-7, 27.4, 3]),
    k(A("s2:Cordouan"), [-3.4, 28.4, 10.5], [-6.2, 27.6, 3]),
    k(K.s3 - 0.3, [3.5, 28.4, 13], [7.2, 27.5, 3]),
    k(A("s3:berat"), [8.6, 27.9, 13.6], [8, 27.4, 3]),
    k(A("s3:terserap") + 0.3, [9.1, 27.6, 11.2], [8.2, 27.5, 3]),
    k(A("s4:permukaan"), [9.8, 28.3, 9.6], [8.3, 27.6, 3]),
    k(A("s4:dibuang") + 0.3, [8.3, 28.0, 12], [8, 27.4, 3]),
    k(A("s5:bertingkat"), [11.2, 29, 11], [8.1, 27.4, 3]),
    k(A("s5:ringan"), [8.2, 28.1, 13], [8, 27.3, 3]),
    k(A("s5:sama") + 0.3, [9.6, 27.8, 14.6], [9.2, 27.4, 3]),
    k(K.s6 + 0.3, [2.8, 28, 11], [0.9, 27.6, 0]),
    k(A("s6:Prisma"), [1.9, 28.7, 7.6], [1, 28.1, 0]),
    k(A("s6:cakrawala"), [3.1, 27.7, 9], [2, 27.5, 0]),
    k(A("s6:tajam") + 0.3, [6, 28.4, 12.5], [4, 27.5, 0]),
    k(A("s7:menyapu"), [18, 34, 40], [0, 12, -20]),
    k(A("s7:Pola"), [10, 31, 32], [-10, 6, -150]),
    k(A("s7:kelas") - 0.3, [3.7, 27.9, 5.6], [0.6, 27.5, 0.4]),
    k(A("s7:setengah") + 0.4, [3.4, 27.6, 6.2], [0.4, 27.4, 0.4]),
    k(A("s7:tiga"), [22, 40, 58], [0, 6, -90]),
    k(A("s7:kilometer") + 0.6, [24, 42, 62], [4, 4, -150]),
    k(A("s8:lampu"), [-22, 14, 52], [0, 17, 0]),
    k(A("s8:AUDIRA") - 0.4, [3.2, 27.7, 8.6], [0, 26.9, 0]),
    k(K.dur, [3.0, 27.9, 9.4], [0, 27.0, 0]),
  ]);
  const look = new THREE.Vector3(), dir = new THREE.Vector3(), tmp = new THREE.Vector3();
  const pAt = (P, i, x, y, z, rr, g, b) => { P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z; P.col[i * 3] = rr; P.col[i * 3 + 1] = g; P.col[i * 3 + 2] = b; };

  return (t) => {
    const c = CAM(t);
    cam.position.set(c[0] + 0.05 * Math.sin(t * 0.6), c[1] + 0.04 * Math.sin(t * 0.47 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    waveN.offset.set(t * 0.003, -t * 0.006);

    // the lens turns all film long; the lamp never switches off
    const ang = t * 0.42; lens.rotation.y = ang;
    const dl = cam.position.distanceTo(L);
    beamM.opacity = 0.25 * clamp01((dl - 5) / 10);
    { const a = ang; dir.set(Math.sin(a) * 0, 0, 0); // beam i points along the lens' local +z rotated by i*90deg
      const bx = Math.sin(a), bz = Math.cos(a); seaSpot.target.position.set(L.x + bx * 60, 0, L.z + bz * 60);
      // flash when a beam lines up with the camera
      tmp.subVectors(cam.position, L); tmp.y = 0; const ca = Math.atan2(tmp.x, tmp.z); let f = 0;
      for (let i = 0; i < 4; i++) { const d = Math.atan2(Math.sin(ca - (a + i * Math.PI / 2)), Math.cos(ca - (a + i * Math.PI / 2))); f = Math.max(f, Math.exp(-Math.pow(d / 0.09, 2))); }
      gradeP.uniforms.flash.value = 0.38 * f * clamp01((dl - 10) / 15); }
    lampL.intensity = 30 + 2 * Math.sin(t * 3);

    // bust
    { const on = win(t, K.s2 - 0.4, K.s3 + 0.5, 0.5); bust.visible = on > 0.001; bust.scale.setScalar(Math.max(0.001, 0.85 + 0.15 * on)); bust.position.y = B.y + 0.15 * (1 - on);
      nameCard.material.opacity = ramp(t, A("s2:Augustin") - 0.2, A("s2:Augustin") + 0.2); yearCard.material.opacity = ramp(t, A("s2:seribu") - 0.2, A("s2:seribu") + 0.2); bustDisc.material.opacity = 0.55 * on; bust.rotation.y = 0.25 + 0.1 * Math.sin(t * 0.4); }

    // exhibit lens
    { const on = win(t, K.s3 - 0.8, K.s6 + 0.4, 0.6); ex.visible = on > 0.001; ex.scale.setScalar(Math.max(0.001, back(on, 1.1)));
      ex.rotation.y = -0.18 + 0.06 * Math.sin(t * 0.5); ex.position.y = E.y + 0.06 * Math.sin(t * 0.8);
      const m = smooth((t - A("s5:dipotong") + 0.2) / Math.max(0.8, A("s5:bertingkat") + 0.6 - A("s5:dipotong")));
      zones.forEach((z, i) => { z.morphTargetInfluences[0] = clamp01(m * 1.25 - i * 0.05); });
      const core = ramp(t, A("s4:tengahnya") - 0.3, A("s4:tengahnya") + 0.3);
      ghostM.opacity = 0.32 * core * (1 - m) + 0.12 * ramp(t, A("s3:terserap") - 0.3, A("s3:terserap")) * (1 - core) * (1 - m);
      ghost.position.y = -0.6 * ramp(t, A("s4:dibuang") - 0.1, A("s4:dibuang") + 0.6) * (1 - m);
      skinM.opacity = 0.55 * win(t, A("s4:permukaan") - 0.1, A("s5:dipotong"), 0.3);
      const thin = m, absorbed = ramp(t, A("s3:terserap") - 0.4, A("s3:terserap"));
      rayIn.opacity = 0.75 * ramp(t, K.s3 + 0.2, K.s3 + 0.9);
      rayOut.opacity = (0.75 - 0.5 * absorbed * (1 - thin)) * ramp(t, K.s3 + 0.5, K.s3 + 1.2);
      exL.position.set(E.x - 2.0, ex.position.y, E.z); exL.intensity = 6 * on;
      for (let i = 0; i < 60; i++) { const R = mulberry(i * 17 + 3), y = (R() - 0.5) * 2.0, x = R() * (BASE + cap(Math.min(AP, Math.abs(y)))); const life = mod(t * 0.8 + R(), 1);
        const b = 2.2 * absorbed * (1 - thin) * Math.sin(Math.PI * life); pAt(lost, i, x, y, (R() - 0.5) * 0.4, 1.6 * b, 0.7 * b, 0.15 * b); }
      lost.commit(); }

    // prism diagram (s6): lens stops in the diagram plane while it is explained
    { const on = win(t, A("s6:atas") - 0.3, K.s7 - 0.2, 0.4); diag.visible = on > 0.001; diag.rotation.y = -Math.atan2(cam.position.z - L.z, cam.position.x - L.x) * 0 ;
      dMid.opacity = 0.7 * on * ramp(t, K.s6 - 0.2, K.s6 + 0.4); dPri.opacity = 0.85 * on * ramp(t, A("s6:ditangkap") - 0.3, A("s6:ditangkap") + 0.2);
      prismRings.forEach((p, i) => { p.material.emissive = p.material.emissive || new THREE.Color(); });
      rimC.intensity = 40 + 60 * win(t, A("s6:Prisma") - 0.2, A("s6:cakrawala"), 0.4); }

    // keeper + ruler (s7)
    { const on = win(t, A("s7:kelas") - 0.8, A("s7:tiga") - 0.2, 0.4); keeper.visible = on > 0.001; ruler.visible = on > 0.001; ruler.scale.set(1, Math.max(0.001, ramp(t, A("s7:dua") - 0.2, A("s7:setengah") + 0.2)), 1); rulerCard.material.opacity = ramp(t, A("s7:setengah") - 0.1, A("s7:setengah") + 0.3); }

    // far lighthouses with their own flash patterns
    farL.forEach(({ lp, pat, per }) => { const ph = mod(t, per) / per; let on = 0.08; for (const [a, b] of pat) if (ph >= a / per * per / per && ph < a + (b - a)) on = 1; const v = 0.1 + 3.4 * on; lp.material.color.setRGB(v, v * 0.92, v * 0.75); });
    ship1.position.x = -34 + 0.6 * t; ship1.rotation.y = 0.04 * Math.sin(t * 0.7); ship3.position.z = 40 - 0.3 * t;
    // 30 km sight line from the lantern to the far ship
    { const on = ramp(t, A("s7:tiga") - 0.2, A("s7:kilometer") + 0.3) * (1 - ramp(t, K.s8 + 1, K.s8 + 2));
      for (let i = 0; i < 70; i++) { const u = i / 69, x = L.x + (ship2.position.x - L.x) * u, z = L.z + (ship2.position.z - L.z) * u, y = 0.4 + (L.y - 0.4) * (1 - u) * (1 - u);
        const b = on * (mod(i - t * 12, 6) < 2 ? 2.4 : 0.6) * clamp01((u * 69 - (1 - on) * 69)); pAt(sight, i, x, y + 0.2, z, 0.4 * b, 1.6 * b, 2.0 * b); } sight.commit(); }
    // sparkle on the sea where the beams land
    for (let i = 0; i < 40; i++) { const R = mulberry(i * 7 + 1), q = Math.floor(i / 10), a = ang + q * Math.PI / 2, d = 20 + R() * 70, sp = (R() - 0.5) * 0.12;
      const b = 1.4 * Math.pow(Math.max(0, Math.sin(t * (2 + R() * 3) + R() * 6)), 6); pAt(glint, i, L.x + Math.sin(a + sp) * d, 0.12, L.z + Math.cos(a + sp) * d, 1.6 * b, 1.5 * b, 1.3 * b); }
    glint.commit();

    comp.render();
  };
}
