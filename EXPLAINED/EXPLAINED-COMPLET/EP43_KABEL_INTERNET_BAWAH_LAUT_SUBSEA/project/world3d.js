// EP43 SUBSEA CABLE (ABYSSFORGE). One continuous ocean: the hook opens above a night sea on a satellite that gets crossed
// out, the camera dives through the surface (god-rays, marine snow, depth colour ramp teal -> ink) and lands on a cable
// lying on the seabed. Every visible photon down there is "living light": laser pulses in the cable, the repeater, ship
// lamps. An ROV-style lamp rides with the camera so the subject is always lit from the front.
//   x=0     landing spot + holographic globe of cable routes (s2)
//   x=-8    garden hose lying next to the deep-sea cable (s3)
//   x=-16..-46  shore slope: armoured cable, sand lumps bury it (s3), AUDIRA marker post
//   x=-40,y=15  floating cut-away cable specimen + phone sending blinking light into the fibres (s4)
//   x=30    repeater (shell opens: erbium coil, pump laser), second repeater at x=100 for the wide (s5, s6, s8)
//   x=50    fishing ship above, anchor dragged across the cable, shark passes (s7)
// Every value is a pure function of t (seeded, no accumulated state).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, smooth, canvasTex, track, stage, envStrips, pts } from "./lib3d.js";

const SURF = 40;
const COL = { night: new THREE.Color("#081428"), teal: new THREE.Color("#0e4a6b"), ink: new THREE.Color("#05162a") };
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Abyss grade: blue-lifted blacks (never pure black), cyan-teal mids, gentle contrast, surface-crossing flash.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=vec3(0.0,0.014,0.03)*(1.0-l);c=mix(vec3(l),c,1.1);c=(c-0.5)*1.06+0.5;
  c=mix(c,vec3(0.75,0.95,1.0),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const hShore = (x) => (x < -14 ? 12 * smooth((-14 - x) / 32) : 0);
const bump = (x, z) => 0.12 * Math.sin(x * 0.7 + z * 0.3) + 0.08 * Math.sin(x * 1.9 - z * 1.3) + 0.05 * Math.sin(z * 2.7 + x * 0.4);
const ground = (x, z) => hShore(x) + bump(x, z);
const cy = (x) => ground(x, 0) + 0.14;
const hash = (n) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));
const mod = (a, n) => ((a % n) + n) % n;

function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const std = (color, rough = 0.5, metal = 0, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...o });
const glow = (r, g, b, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), ...o });
function plate(text, sub, w, h) {
  return canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => {
    g.fillStyle = "#0b1f2e"; g.fillRect(0, 0, W, H); g.strokeStyle = "#5cf2ff"; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20);
    g.fillStyle = "#e8fbff"; g.font = `800 ${Math.round(H * 0.38)}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H * (sub ? 0.4 : 0.52));
    if (sub) { g.fillStyle = "#5cf2ff"; g.font = `700 ${Math.round(H * 0.17)}px 'Courier New', monospace`; g.fillText(sub, W / 2, H * 0.76); }
  });
}
const stripes = (base, line, n = 22) => canvasTex(512, 64, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H); g.strokeStyle = line; g.lineWidth = 9; for (let i = -4; i < n + 4; i++) { const x = i * W / n; g.beginPath(); g.moveTo(x, H + 4); g.lineTo(x + W / n * 1.6, -4); g.stroke(); } }, [1, 1]);
const curveOf = (fn, a, b, n) => new THREE.CatmullRomCurve3(Array.from({ length: n + 1 }, (_, i) => fn(a + (b - a) * i / n)));

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x05162a, fog: 0.022, exp: 1.15, bloom: [0.9, 0.5, 0.78], fov: 38 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  envStrips(r, scene, [[30, 6, 0x9fe8ff, 1.6, 0, 20, 10], [14, 30, 0x2f7fb0, 1.0, -22, 4, 6], [10, 30, 0x5cf2ff, 0.8, 22, 4, -8], [40, 4, 0x0e4a6b, 0.6, 0, -18, 0]], 0x020810);
  scene.environmentIntensity = 0.35;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0x3a7fa8, 0x04070b, 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0x8fdcff, 1.2); sun.position.set(-10, 80, 20); scene.add(sun);
  const rov = new THREE.SpotLight(0xd9f4ff, 160, 0, 0.55, 0.65, 2); rov.castShadow = true; rov.shadow.mapSize.set(1024, 1024); rov.shadow.bias = -0.0004;
  scene.add(rov, rov.target);
  const repL = new THREE.PointLight(0x5cf2ff, 0, 9, 2); repL.position.set(30, 1.2, 0.8); scene.add(repL);
  const warnL = new THREE.PointLight(0xff3b4a, 0, 8, 2); warnL.position.set(50, 1.0, 0.8); scene.add(warnL);

  // ---------- sky + surface ----------
  const moon = mesh(new THREE.SphereGeometry(7, 32, 16), glow(2.2, 2.3, 2.1, { fog: false }), scene, -70, 120, -220); moon.castShadow = false;
  const stars = pts(scene, 420, { size: 0.9, add: true });
  stars.m.fog = false;
  { const R = mulberry(43); for (let i = 0; i < 420; i++) { const a = R() * 6.283, e = 0.12 + R() * 1.2, d = 260; stars.pos.set([Math.cos(a) * Math.cos(e) * d, SURF + Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d - 60], i * 3); const b = 0.4 + R() * 1.4; stars.col.set([b, b, b * 1.1], i * 3); } stars.commit(); }
  const waveTex = canvasTex(256, 256, (g, W, H) => { const R = mulberry(5); g.fillStyle = "#808080"; g.fillRect(0, 0, W, H); for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(255,255,255,${0.05 + R() * 0.12})`; g.lineWidth = 1 + R() * 3; const x = R() * W, y = R() * H; g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 6, x + 20, y); g.stroke(); } }, [24, 24]);
  const surf = mesh(new THREE.PlaneGeometry(700, 700), std(0x0b2a40, 0.25, 0.4, { emissive: new THREE.Color(0x0e4a6b), emissiveIntensity: 0.4, map: waveTex, transparent: true, opacity: 0.92, side: THREE.DoubleSide }), scene, 0, SURF, 0);
  surf.rotation.x = -Math.PI / 2; surf.castShadow = false;
  const rayTex = canvasTex(32, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  const rays = [];
  { const R = mulberry(77); for (let i = 0; i < 6; i++) { const m = mesh(new THREE.CylinderGeometry(0.5, 3.2 + R() * 2, 34, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, map: rayTex, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), scene, -8 + i * 4 + R() * 2, SURF - 17, -6 - R() * 8); m.rotation.z = 0.18 + R() * 0.12; m.castShadow = m.receiveShadow = false; rays.push(m); } }

  // ---------- satellite (hook) ----------
  const sat = new THREE.Group(); sat.position.set(0, 53, -8); scene.add(sat);
  const panelTex = canvasTex(256, 96, (g, W, H) => { g.fillStyle = "#13305e"; g.fillRect(0, 0, W, H); g.strokeStyle = "#5f8fd8"; g.lineWidth = 2; for (let x = 0; x <= W; x += 21) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } });
  mesh(new THREE.BoxGeometry(1.6, 1.6, 2.2), std(0xc9a24a, 0.35, 0.85), sat);
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(4.2, 0.06, 1.4), std(0xffffff, 0.3, 0.6, { map: panelTex, emissive: new THREE.Color(0x0b2350), emissiveIntensity: 0.5 }), sat, s * 3.1, 0, 0); mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), std(0x9aa4ad, 0.4, 0.8), sat, s * 1.0, 0, 0).rotation.z = Math.PI / 2; }
  const dish = mesh(new THREE.ConeGeometry(0.7, 0.35, 24, 1, true), std(0xe7ecef, 0.35, 0.3, { side: THREE.DoubleSide }), sat, 0, -1.05, 0.2); dish.rotation.x = Math.PI;
  const satX = new THREE.Group(); satX.position.set(0, 53, -5.5); scene.add(satX);
  for (const s of [-1, 1]) { const b = mesh(new THREE.BoxGeometry(4.6, 0.42, 0.12), glow(2.6, 0.25, 0.32, { transparent: true, fog: false }), satX); b.rotation.z = s * Math.PI / 4; b.castShadow = false; }

  // ---------- seabed ----------
  const sandTex = canvasTex(256, 256, (g, W, H) => { const R = mulberry(11); g.fillStyle = "#5d6e78"; g.fillRect(0, 0, W, H); for (let i = 0; i < 2600; i++) { const v = 70 + R() * 70; g.fillStyle = `rgba(${v},${v + 12},${v + 22},0.35)`; g.fillRect(R() * W, R() * H, 1 + R() * 2.5, 1 + R() * 2.5); } }, [60, 30]);
  const gg = new THREE.PlaneGeometry(280, 120, 280, 120); gg.rotateX(-Math.PI / 2);
  { const p = gg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, ground(p.getX(i) + 30, p.getZ(i))); gg.computeVertexNormals(); }
  const seabed = mesh(gg, std(0x8fa3ae, 1, 0, { map: sandTex }), scene, -30, 0, 0); seabed.castShadow = false;
  { const R = mulberry(9); for (let i = 0; i < 60; i++) { const x = -50 + R() * 170, z = (R() < 0.5 ? -1 : 1) * (1.6 + R() * 12); const s = 0.15 + R() * R() * 0.9; const m = mesh(new THREE.DodecahedronGeometry(s, 0), std(0x46555e, 0.95), scene, x, ground(x, z) + s * 0.3, z); m.rotation.set(R() * 3, R() * 3, R() * 3); } }

  // ---------- cable, armour, burial ----------
  const cableC = curveOf((x) => new THREE.Vector3(x, cy(x), 0), -60, 140, 400);
  const cableM = std(0x10181e, 0.42, 0.1, { emissive: new THREE.Color(0xff8a2a), emissiveIntensity: 0 });
  mesh(new THREE.TubeGeometry(cableC, 1400, 0.15, 12), cableM, scene);
  const armM = std(0xffffff, 0.32, 0.9, { map: stripes("#8c979f", "#4d5860"), transparent: true, opacity: 0 });
  armM.map.repeat.set(220, 1); armM.map.wrapS = THREE.RepeatWrapping;
  mesh(new THREE.TubeGeometry(curveOf((x) => new THREE.Vector3(x, cy(x), 0), -60, -16, 120), 420, 0.23, 14), armM, scene);
  const lumps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 12, 8), std(0x7a8c96, 1, 0, { map: sandTex }), 64);
  lumps.frustumCulled = false; lumps.castShadow = lumps.receiveShadow = true; scene.add(lumps);
  const lumpX = Array.from({ length: 64 }, (_, i) => -17 - i * 0.45);
  // garden hose next to the deep-sea cable
  const hoseC = curveOf((x) => new THREE.Vector3(x, ground(x, 0.75) + 0.16, 0.75 + 0.12 * Math.sin(x * 1.3)), -11.5, -3.2, 40);
  mesh(new THREE.TubeGeometry(hoseC, 120, 0.16, 12), std(0x3fa34d, 0.45), scene);
  const noz = mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.5, 16), std(0xc9a24a, 0.3, 0.9), scene, -3.0, ground(-3, 0.75) + 0.17, 0.75 + 0.12 * Math.sin(-3.2 * 1.3)); noz.rotation.z = Math.PI / 2;
  // AUDIRA marker post on the shore slope
  { const x = -31, z = 1.8, y0 = ground(x, z); mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.4, 10), std(0xb8c2c8, 0.35, 0.8), scene, x, y0 + 1.2, z);
    const sg = mesh(new THREE.BoxGeometry(2.3, 0.85, 0.08, 1, 1, 1), std(0xffffff, 0.4, 0.2, { map: plate("AUDIRA SUBSEA", "KABEL DATA · JANGAN JANGKAR", 2.3, 0.85), emissive: new THREE.Color(0xffffff), emissiveMap: null, emissiveIntensity: 0 }), scene, x, y0 + 2.3, z); sg.rotation.y = 0.35; }

  // ---------- holographic globe (s2) ----------
  const globe = new THREE.Group(); globe.position.set(0, 8, -3); scene.add(globe);
  { const n = 900, gp = pts(globe, n, { size: 0.07, add: true }); for (let i = 0; i < n; i++) { const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), a = i * 2.39996; gp.pos.set([Math.cos(a) * rr * 2, y * 2, Math.sin(a) * rr * 2], i * 3); gp.col.set([0.25, 0.9, 1.1], i * 3); } gp.commit(); }
  mesh(new THREE.SphereGeometry(1.94, 40, 24), new THREE.MeshBasicMaterial({ color: 0x06304a, transparent: true, opacity: 0.55 }), globe);
  const arcs = [];
  { const R = mulberry(600); const rnd = () => { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u); return new THREE.Vector3(Math.cos(a) * s, u, Math.sin(a) * s); };
    for (let i = 0; i < 30; i++) { const a = rnd(), b = rnd(); if (a.angleTo(b) < 0.5) b.negate().lerp(a, 0.3).normalize(); const pts3 = []; for (let k = 0; k <= 32; k++) { const u = k / 32, v = a.clone().lerp(b, u).normalize(); pts3.push(v.multiplyScalar(2 * (1 + 0.18 * Math.sin(Math.PI * u)))); }
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 48, 0.022, 6);
      const m = mesh(geo, glow(...(i % 3 ? [0.3, 1.6, 2.0] : [1.9, 0.4, 1.7])), globe); m.castShadow = m.receiveShadow = false; arcs.push({ m, n: geo.index.count, d: R() }); } }

  // ---------- cut-away cable specimen + phone (s4) ----------
  const spec = new THREE.Group(); spec.position.set(-40, 15.2, 3); scene.add(spec);
  const layer = (rad, len, mat) => { const g = new THREE.CylinderGeometry(rad, rad, len, 48); g.rotateZ(Math.PI / 2); return mesh(g, mat, spec, -1.5 + len / 2, 0, 0); };
  layer(0.6, 1.8, std(0x0d1418, 0.4, 0.1));
  const stM = std(0xffffff, 0.3, 0.9, { map: stripes("#9aa5ad", "#56626a", 30) }); layer(0.5, 2.1, stM);
  layer(0.36, 2.4, std(0xc8743c, 0.28, 0.95));
  layer(0.24, 2.7, std(0xbfe9f5, 0.15, 0, { transparent: true, opacity: 0.45 }));
  const fibM = std(0xe8fbff, 0.1, 0, { emissive: new THREE.Color(0x5cf2ff), emissiveIntensity: 0.2 });
  for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; const g = new THREE.CylinderGeometry(0.022, 0.022, 3.0, 8); g.rotateZ(Math.PI / 2); mesh(g, fibM, spec, 0, 0.12 * Math.cos(a), 0.12 * Math.sin(a)); }
  const phone = new THREE.Group(); phone.position.set(-2.75, 0.05, 0.1); phone.rotation.y = 0.35; spec.add(phone);
  mesh(new THREE.BoxGeometry(0.66, 1.25, 0.07), std(0x1b2228, 0.35, 0.5), phone);
  const scrTex = canvasTex(256, 480, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0e4a6b"); gr.addColorStop(1, "#200a3a"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = "#e8fbff"; g.beginPath(); g.moveTo(100, 190); g.lineTo(100, 290); g.lineTo(180, 240); g.closePath(); g.fill(); g.fillStyle = "#5cf2ff"; g.fillRect(30, 400, 196, 10); g.fillStyle = "#ff4fd8"; g.fillRect(30, 400, 120, 10); });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 1.12), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: true })); scr.position.z = 0.04; phone.add(scr);

  // ---------- repeaters ----------
  const shellM = std(0xb9c4cb, 0.22, 0.95);
  function repeater(x, label) {
    const G = new THREE.Group(); G.position.set(x, cy(x) + 0.42, 0); scene.add(G);
    const half = (start) => { const H = new THREE.Group(); G.add(H);
      const parts = [new THREE.CylinderGeometry(0.55, 0.55, 2.6, 40, 1, true, start, Math.PI), new THREE.CylinderGeometry(0.2, 0.55, 0.7, 40, 1, true, start, Math.PI), new THREE.CylinderGeometry(0.55, 0.2, 0.7, 40, 1, true, start, Math.PI)];
      parts.forEach((g, i) => { g.rotateZ(Math.PI / 2); g.translate(i === 0 ? 0 : i === 1 ? 1.65 : -1.65, 0, 0); mesh(g, new THREE.MeshStandardMaterial({ color: 0xb9c4cb, roughness: 0.22, metalness: 0.95, side: THREE.DoubleSide }), H); });
      for (const s of [-1, 1]) { const ring = new THREE.TorusGeometry(0.555, 0.035, 8, 40, Math.PI); ring.rotateY(Math.PI / 2); if (start > 1) ring.rotateX(Math.PI); mesh(ring, std(0x5cf2ff, 0.3, 0.2, { emissive: new THREE.Color(0x5cf2ff), emissiveIntensity: 1.5 }), H, s * 0.9, 0, 0); }
      return H; };
    const top = half(0), bot = half(Math.PI);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.34), new THREE.MeshStandardMaterial({ map: plate("AUDIRA", label, 1.7, 0.34), roughness: 0.5, transparent: true }));
    lab.position.set(0, -0.26, 0.5); lab.rotation.x = -0.5; bot.add(lab);
    for (const s of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.35, 20), shellM, G, s * 2.1, -0.28, 0); c.rotation.z = Math.PI / 2; }
    const coilC = new THREE.CatmullRomCurve3(Array.from({ length: 241 }, (_, i) => { const u = i / 240, a = u * 16 * Math.PI; return new THREE.Vector3(-0.8 + 1.6 * u, 0.3 * Math.cos(a), 0.3 * Math.sin(a)); }));
    const coilM = glow(0.5, 0.12, 0.45); const coil = mesh(new THREE.TubeGeometry(coilC, 600, 0.028, 6), coilM, G); coil.castShadow = false;
    const pumpM = glow(0.4, 0.2, 0.05); mesh(new THREE.BoxGeometry(0.3, 0.18, 0.2), pumpM, G, 1.05, -0.2, 0.15).castShadow = false;
    mesh(new THREE.BoxGeometry(0.5, 0.12, 0.34), std(0x2a6b4a, 0.5, 0.2), G, 1.05, -0.33, 0.1);
    return { G, top, bot, coilM, pumpM };
  }
  const rep = repeater(30, "REPEATER 07"), rep2 = repeater(100, "REPEATER 08");

  // ---------- ship, anchor, shark (s7) ----------
  const ship = new THREE.Group(); ship.position.set(50, SURF - 0.7, -3); scene.add(ship);
  mesh(new THREE.BoxGeometry(11, 1.8, 3.2), std(0x111a22, 0.6, 0.3), ship);
  const keel = mesh(new THREE.CylinderGeometry(1.6, 1.6, 11, 16, 1, false, Math.PI / 2, Math.PI), std(0x0d141a, 0.6, 0.3), ship, 0, -0.9, 0); keel.rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) mesh(new THREE.SphereGeometry(0.16, 10, 8), glow(3.2, 2.2, 0.9, { fog: false }), ship, -4.5 + i * 1.8, -0.95, 1.55).castShadow = false;
  const anc = new THREE.Group(); scene.add(anc);
  const ancM = std(0x5a6066, 0.45, 0.85);
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 10), ancM, anc, 0, 0.7, 0);
  mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 20), ancM, anc, 0, 1.5, 0);
  { const arm = new THREE.TorusGeometry(0.6, 0.07, 8, 24, Math.PI); arm.rotateZ(Math.PI); mesh(arm, ancM, anc, 0, 0.55, 0); }
  for (const s of [-1, 1]) { const f = mesh(new THREE.ConeGeometry(0.16, 0.42, 4), ancM, anc, s * 0.6, 0.62, 0); f.rotation.z = -s * 0.5; }
  const chainG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const chain = new THREE.Line(chainG, new THREE.LineBasicMaterial({ color: 0x7c868e })); chain.frustumCulled = false; scene.add(chain);
  const shark = new THREE.Group(); scene.add(shark);
  { const sk = std(0x6b7f8c, 0.55, 0.05), belly = std(0xc9d3d9, 0.6);
    mesh(new THREE.SphereGeometry(1, 32, 16), sk, shark).scale.set(2.1, 0.5, 0.55);
    mesh(new THREE.SphereGeometry(1, 24, 12), belly, shark, 0.1, -0.12, 0).scale.set(1.8, 0.36, 0.48);
    const d = mesh(new THREE.ConeGeometry(0.32, 0.8, 4), sk, shark, 0.2, 0.62, 0); d.scale.z = 0.25; d.rotation.z = -0.35;
    for (const s of [-1, 1]) { const p = mesh(new THREE.ConeGeometry(0.22, 0.9, 4), sk, shark, 0.55, -0.25, s * 0.45); p.scale.z = 0.25; p.rotation.set(s * 1.1, 0, -0.9); }
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0x05080a, 0.2), shark, 1.55, 0.12, s * 0.28); }
  const tail = new THREE.Group(); tail.position.x = -1.9; shark.add(tail);
  for (const s of [-1, 1]) { const f = mesh(new THREE.ConeGeometry(0.28, 1.1, 4), std(0x6b7f8c, 0.55), tail, -0.35, s * 0.38, 0); f.scale.z = 0.22; f.rotation.z = Math.PI / 2 + s * 0.75; }

  // ---------- particles ----------
  const snow = pts(scene, 1400, { size: 0.06, add: false, opacity: 0.6 });
  const snowB = []; { const R = mulberry(2200); for (let i = 0; i < 1400; i++) { snowB.push([R() * 26, R() * 26, R() * 26, R()]); const b = 0.55 + R() * 0.35; snow.col.set([b * 0.85, b, b], i * 3); } }
  const NP = 110, cp = pts(scene, NP, { size: 0.32 });
  const fp = pts(scene, 48, { size: 0.12 });
  const hp = pts(scene, 14, { size: 0.55 });
  const pw = pts(scene, 40, { size: 0.3 });
  const sp = pts(scene, 40, { size: 0.12 });

  // ---------- camera ----------
  const k = (t, p, l) => [t, ...p, ...l];
  const CAM = track([
    k(0, [3, 44.5, 16], [0, 52, -8]),
    k(A("s1:satelit") - 0.25, [2.6, 45.4, 13.6], [0, 52.6, -8]),
    k(A("s1:kabel") - 0.2, [3.2, 21, 12], [0, 3.5, 0]),
    k(A("s1:dasar") + 0.5, [3.4, 2.3, 7], [0, 0.5, 0]),
    k(K.s2 + 0.3, [2.4, 5, 12], [0, 6.8, -3]),
    k(A("s2:enam"), [1, 8, 14], [0, 8, -3]),
    k(A("s2:kilometer") + 0.4, [-3.5, 8.6, 13], [0, 7.8, -3]),
    k(A("s3:selang") - 0.3, [-5.6, 1.7, 4.3], [-6.6, 0.25, 0.35]),
    k(A("s3:berbaring") + 0.3, [-8.2, 1.45, 3.7], [-8.6, 0.2, 0.3]),
    k(A("s3:pantai"), [-22, 6.8, 8.5], [-27, 4.4, 0]),
    k(A("s3:baja") + 0.2, [-26, 7.6, 6.6], [-29, 5.1, 0]),
    k(A("s3:dikubur") + 0.6, [-25, 10.2, 11.5], [-31, 6.4, 0]),
    k(K.s4 + 0.3, [-38.6, 16, 7], [-39.4, 15.2, 3]),
    k(A("s4:rambut") + 0.2, [-38.5, 15.6, 5.3], [-38.9, 15.2, 3]),
    k(A("s4:ponselmu"), [-40.6, 16.2, 9.6], [-41, 15.2, 3]),
    k(A("s4:melesat") + 0.2, [-39, 16, 9.2], [-39.5, 15.1, 3]),
    k(K.s5, [-36, 14.6, 10], [-37, 11.6, 0]),
    k(A("s5:jarak"), [-8, 4, 10], [-10, 0.4, 0]),
    k(A("s5:penguat"), [25, 2.6, 8.5], [29.5, 0.6, 0]),
    k(A("s5:repeater") + 0.3, [28, 2.2, 6.6], [30, 0.6, 0]),
    k(A("s6:dalam") + 0.3, [31.3, 2.5, 4.4], [30, 0.85, 0]),
    k(A("s6:erbium") + 0.3, [30.6, 1.95, 3.3], [30, 0.78, 0]),
    k(A("s6:terang") + 0.2, [32, 2.3, 4.7], [30.3, 0.7, 0]),
    k(A("s6:Listriknya"), [24, 3.6, 10], [22, 0.5, 0]),
    k(A("s6:penghantar") + 0.4, [20, 1.5, 4.6], [22, 0.3, 0]),
    k(K.s7 + 0.3, [45, 2.4, 9], [49, 0.8, 0]),
    k(A("s7:hiu") + 0.6, [46, 2.6, 10], [50, 1.8, 1.5]),
    k(A("s7:kapal"), [46.5, 1.8, 9], [50, 27, -3]),
    k(A("s7:jangkar") + 0.3, [46, 3.0, 9], [48, 2, -1]),
    k(A("s7:terseret") + 0.8, [47.6, 2.2, 6.6], [50, 0.4, 0]),
    k(A("s8:lancar") + 0.5, [20, 14, 34], [12, 1, 0]),
    k(A("s8:AUDIRA") - 0.4, [27.6, 2.4, 6.9], [30, 0.7, 0]),
    k(K.dur, [27.1, 2.65, 7.5], [30, 0.7, 0]),
  ]);
  const look = new THREE.Vector3(), bg = new THREE.Color();
  const pAt = (P, i, x, y, z, rr, g, b) => { P.pos[i * 3] = x; P.pos[i * 3 + 1] = y; P.pos[i * 3 + 2] = z; P.col[i * 3] = rr; P.col[i * 3 + 1] = g; P.col[i * 3 + 2] = b; };

  return (t) => {
    const c = CAM(t);
    const sway = 0.06 * Math.sin(t * 0.7), heave = 0.05 * Math.sin(t * 0.53 + 1);
    cam.position.set(c[0] + sway, c[1] + heave, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    const cy0 = cam.position.y, above = cy0 > SURF;
    // water column: depth is the clock
    if (above) { bg.copy(COL.night); scene.fog.density = 0.0015; }
    else { const f = Math.pow(clamp01(cy0 / SURF), 1.4); bg.copy(COL.ink).lerp(COL.teal, f); scene.fog.density = 0.022 - 0.01 * f; }
    scene.background.copy(bg); scene.fog.color.copy(bg);
    gradeP.uniforms.flash.value = 0.35 * Math.exp(-Math.pow((cy0 - SURF) / 1.3, 2));
    stars.P.visible = moon.visible = above; snow.P.visible = !above;
    sun.intensity = above ? 0.3 : 1.2 * Math.pow(clamp01(cy0 / SURF), 2) + 0.15;
    rays.forEach((m, i) => { m.material.opacity = above ? 0 : 0.1 * (0.6 + 0.4 * Math.sin(t * 0.6 + i * 1.7)); });
    waveTex.offset.set(t * 0.004, t * 0.002);
    rov.position.set(cam.position.x + 0.5, cam.position.y + 0.6, cam.position.z); rov.target.position.copy(look); rov.intensity = above ? 0 : 160;
    hemi.intensity = above ? 0.9 : 0.6;

    // satellite + red X
    sat.visible = satX.visible = cy0 > SURF - 4;
    sat.rotation.y = 0.4 + t * 0.12; sat.rotation.z = 0.08 * Math.sin(t * 0.5);
    { const s = A("s1:tidak"), p = back(clamp01((t - s + 0.05) / 0.3), 2); satX.scale.setScalar(1.6 - 0.6 * p); satX.children.forEach((b) => { b.material.opacity = 0.35 + 0.65 * p; }); }

    // marine snow, wrapped round the camera
    if (!above) {
      for (let i = 0; i < 1400; i++) { const b = snowB[i];
        const x = cam.position.x + mod(b[0] + 0.25 * Math.sin(t * 0.3 + b[3] * 6) - cam.position.x, 26) - 13;
        const y = cam.position.y + mod(b[1] - t * (0.08 + 0.1 * b[3]) - cam.position.y, 26) - 13;
        const z = cam.position.z + mod(b[2] + 0.2 * Math.cos(t * 0.25 + b[3] * 5) - cam.position.z, 26) - 13;
        snow.pos[i * 3] = x; snow.pos[i * 3 + 1] = y; snow.pos[i * 3 + 2] = z; }
      snow.commit();
    }

    // globe
    { const gin = back(clamp01((t - K.s2 + 0.4) / 0.8), 1.2), gout = 1 - ramp(t, A("s3:selang") - 0.6, A("s3:selang"));
      const s = Math.max(0.001, gin * gout); globe.scale.setScalar(s); globe.visible = s > 0.002; globe.rotation.y = 0.5 + t * 0.15;
      const ta = A("s2:enam") - 0.8, tb = A("s2:direncanakan"), km = ramp(t, A("s2:kilometer") - 0.2, A("s2:kilometer") + 0.3);
      arcs.forEach((a) => { const p = clamp01((t - ta - a.d * (tb - ta) * 0.7) / 0.9); const n = Math.floor(p * a.n / 36) * 36; a.m.geometry.setDrawRange(0, Math.max(0, n)); a.m.visible = n > 0; a.m.material.color.setScalar(1).multiplyScalar(1); a.m.scale.setScalar(1 + 0.03 * km); }); }

    // armour + burial
    armM.opacity = ramp(t, A("s3:baja") - 0.3, A("s3:baja") + 0.3);
    { const tb = A("s3:dikubur"), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
      for (let i = 0; i < 64; i++) { const x = lumpX[i], p = back(clamp01((t - tb + 0.2 - i * 0.025) / 0.35), 1.4);
        S.set(0.75 * p + 0.001, 0.45 * p + 0.001, 0.62 * p + 0.001); P.set(x, cy(x) + 0.05, 0.04 * Math.sin(i * 2.1)); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 0.7); M4.compose(P, q, S); lumps.setMatrixAt(i, M4); }
      lumps.instanceMatrix.needsUpdate = true; }

    // specimen + phone + blinking fibres
    spec.visible = t > K.s4 - 1.5 && t < K.s5 + 3;
    fibM.emissiveIntensity = 0.2 + 2.2 * ramp(t, A("s4:serat") - 0.2, A("s4:serat") + 0.3);
    phone.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s4:ponselmu") + 0.25) / 0.4), 1.5)));
    { const on = ramp(t, A("s4:kedipan") - 0.3, A("s4:kedipan")), t0 = A("s4:kedipan");
      for (let j = 0; j < 8; j++) for (let q = 0; q < 6; q++) { const i = j * 6 + q, a = j * Math.PI / 4;
        const lx = -2.3 + mod((t - t0) * 2.2 + q * 0.65 + j * 0.13, 3.9); const bit = hash(Math.floor(t * 7) + q * 13 + j * 7) > 0.35 ? 1 : 0.15;
        const b = on * bit * (lx < -1.5 ? 0.6 : 1) * 2.4; pAt(fp, i, spec.position.x + lx, spec.position.y + 0.12 * Math.cos(a), spec.position.z + 0.12 * Math.sin(a), 0.35 * b, 1.0 * b, 1.15 * b); } }
    fp.P.visible = spec.visible; fp.commit();

    // cable pulse stream: dims with distance after "redup", repeaters restore it after "terang"
    const tRed = A("s5:redup"), tTer = A("s6:terang"), tCut = A("s7:terseret") + 0.2;
    const streamOn = ramp(t, A("s1:kabel") - 0.6, A("s1:kabel") + 0.2), dimAmt = ramp(t, tRed - 0.3, tRed + 0.6), fix = ramp(t, tTer - 0.2, tTer + 0.4);
    const cut = t > tCut && t < K.s8;
    for (let i = 0; i < NP; i++) {
      const x = -46 + mod(i * 1.7 + (t - K.s1) * 9, 186);
      let since = x + 46; if (fix > 0 && x > 30) since = (x > 100 ? x - 100 : x - 30) * fix + (x + 46) * (1 - fix);
      let b = streamOn * (1.8 * (1 - dimAmt) + 2.0 * dimAmt * Math.max(0.05, Math.exp(-since / 28)));
      if (cut && x > 50) b *= 0.02;
      const blink = hash(Math.floor(t * 5) + i * 3) > 0.25 ? 1 : 0.3;
      pAt(cp, i, x, cy(x) + 0.17, 0.0, 0.3 * b * blink, 1.0 * b * blink, 1.2 * b * blink);
    }
    cp.commit();
    // hero pulse that the camera follows in s5
    { const p = ramp(t, K.s5 - 0.2, A("s5:penguat")); const x = -40 + 70 * p; const vis = t > K.s5 - 0.2 && t < A("s6:dalam");
      for (let i = 0; i < 14; i++) { const xi = x - i * 0.35; const b = vis ? (3.2 * Math.max(0.08, Math.exp(-(xi + 40) / 30))) * (1 - i / 14) : 0; pAt(hp, i, xi, cy(xi) + 0.2, 0.05, 0.4 * b, b, 1.2 * b); }
      hp.commit(); }

    // repeaters
    { const op = back(clamp01((t - A("s6:dalam") + 0.3) / 0.6), 0.9) * (1 - ramp(t, A("s6:Listriknya"), A("s6:Listriknya") + 0.8));
      rep.top.position.y = 1.15 * op; rep.top.rotation.x = -0.35 * op;
      const pump = ramp(t, A("s6:Laser") - 0.2, A("s6:Laser") + 0.2), en = ramp(t, A("s6:energi") - 0.2, A("s6:energi") + 0.5);
      const fl = 0.85 + 0.15 * Math.sin(t * 23);
      rep.pumpM.color.setRGB(0.4 + 2.6 * pump * fl, 0.2 + 0.9 * pump * fl, 0.05 + 0.2 * pump);
      rep.coilM.color.setRGB(0.5 + 2.0 * en, 0.12 + 0.3 * en, 0.45 + 1.8 * en);
      const live = ramp(t, A("s5:repeater") - 0.4, A("s5:repeater"));
      repL.intensity = 4 * live + 6 * en * (1 - ramp(t, K.s7 - 0.5, K.s7));
      rep2.coilM.color.setRGB(0.5 + 1.6 * fix, 0.12 + 0.2 * fix, 0.45 + 1.4 * fix); }

    // power from the shore station
    { const on = win(t, A("s6:Listriknya") - 0.2, K.s7 - 0.3, 0.4);
      for (let i = 0; i < 40; i++) { const x = -46 + mod(i * 1.9 + t * 14, 76); const b = on * (hash(i * 7.1) > 0.3 ? 2.2 : 1.2); pAt(pw, i, x, cy(x) + 0.2, 0.03, 2.4 * b * 0.5, 1.1 * b * 0.5, 0.2 * b * 0.5); }
      pw.commit(); pw.P.visible = on > 0.001;
      cableM.emissiveIntensity = 0.35 * ramp(t, A("s6:penghantar") - 0.3, A("s6:penghantar") + 0.2) * (1 - ramp(t, K.s7 - 0.4, K.s7)); }

    // s7: shark, ship, anchor, damage
    { const s7 = t > K.s7 - 1 && t < K.s8 + 0.5; ship.visible = s7; anc.visible = chain.visible = s7;
      const th = A("s7:hiu"), sx = 40 + 20 * clamp01((t - th + 2.2) / 5.0);
      shark.visible = t > th - 2.4 && t < th + 3.2; shark.position.set(sx, 2.3 + 0.15 * Math.sin(t * 1.3), 2.6); shark.rotation.y = 0.05 * Math.sin(t * 4); tail.rotation.y = 0.45 * Math.sin(t * 7);
      const tk = A("s7:kapal"), tj = A("s7:jangkar"), ts = A("s7:terseret");
      const down = smooth((t - tk) / Math.max(0.5, tj - tk)), drag = smooth((t - tj + 0.3) / Math.max(0.6, ts + 0.4 - tj));
      const ax = 42 + 8 * drag, az = -3 + 3 * drag, ay = (1 - down) * 22 + ground(ax, az) + 0.05;
      anc.position.set(ax, ay, az); anc.rotation.set(0, 0.3, -0.25 * drag);
      const cp0 = chain.geometry.attributes.position; cp0.setXYZ(0, ship.position.x + 4.5, SURF - 1.6, ship.position.z); cp0.setXYZ(1, ax, ay + 1.55, az); cp0.needsUpdate = true;
      ship.position.x = 50 + 2.0 * drag;
      const hit = win(t, ts + 0.2, K.s8, 0.2);
      warnL.intensity = hit * (5 + 4 * Math.sin(t * 14));
      for (let i = 0; i < 40; i++) { const u = clamp01((t - ts - 0.2) / 0.9), R = mulberry(i * 31 + 7); const dx = (R() - 0.5) * 2, dy = R() * 1.6, dz = (R() - 0.5) * 2;
        const b = t > ts + 0.2 ? 2.8 * (1 - u) : 0; pAt(sp, i, 50 + dx * u * 1.4, cy(50) + 0.2 + dy * u - 0.6 * u * u, dz * u * 1.4, 2.6 * b, 1.4 * b, 0.4 * b); }
      sp.commit(); }

    comp.render();
  };
}
