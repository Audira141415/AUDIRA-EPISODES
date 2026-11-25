// EP12 GO-AROUND. WORLDFORGE look: a real-scale storm airport under a low cloud deck, low warm sun breaking
// under the clouds, rain streaks, wind drawn as streamlines. A generic twin-engine widebody (plain livery, no
// airline marks) with moving ailerons, flaps, rudder and retracting gear. Illustration, not footage. 1 unit = 1 m.
// Runway threshold at z=0, runway runs to z=-3400; aircraft approach from +z heading -z. Wind blows from +x.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, clamp01, smooth, eout, canvasTex, std, skyEnv } from "./lib3d.js";

const W = 1080, H = 1920, D2R = Math.PI / 180;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, u) => a + (b - a) * u;
const GS = Math.tan(3 * D2R);
const glide = (z) => 15 + GS * z;
const LEN = 3400, RW = 45, GEARH = 5.6;
const LE = (x) => -6 + (Math.abs(x) - 2.5) * Math.tan(31 * D2R);
const TE = (x) => 7 + (Math.abs(x) - 2.5) * (7.97 / 29.9);

function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
  return s;
}
// Bevelled box: rounded footprint plus bevelled top and bottom edges.
function rbox(w, h, d, r, mat) {
  const b = Math.min(r * 0.5, d / 2 - 0.01, w / 4, h / 4);
  const cr = Math.max(0.01, Math.min(r, (w - 2 * b) / 2.1, (h - 2 * b) / 2.1));
  const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, cr), { depth: Math.max(0.01, d - 2 * b), bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 5 });
  g.translate(0, 0, -(d - 2 * b) / 2);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
// Planform slab: 2D points (x, z) extruded to a thickness along y with rounded edges.
function slab(pts, th, bv) {
  const s = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
  const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelSize: bv, bevelThickness: bv, bevelSegments: 3, curveSegments: 2 });
  g.translate(0, 0, -th / 2);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
function labelTex(text, color, sub) {
  return canvasTex(1024, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.font = "800 92px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 14; c.strokeStyle = "rgba(6,10,16,.85)"; c.strokeText(text, w / 2, sub ? h * 0.38 : h / 2);
    c.fillStyle = color; c.fillText(text, w / 2, sub ? h * 0.38 : h / 2);
    if (sub) { c.font = "600 54px Arial, sans-serif"; c.lineWidth = 10; c.strokeText(sub, w / 2, h * 0.8); c.fillStyle = "#ffffff"; c.fillText(sub, w / 2, h * 0.8); }
  });
}
function sprite(tex, hgt) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false }));
  sp.scale.set(hgt * 4, hgt, 1);
  sp.renderOrder = 20;
  return sp;
}

// ---------------------------------------------------------------- aircraft
function buildAircraft(M) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const Lf = 66, R = 2.95, prof = [];
  for (let i = 0; i <= 72; i++) {
    const s = i / 72;
    let r;
    if (s < 0.3) r = R * (0.1 + 0.9 * Math.pow(Math.sin((s / 0.3) * Math.PI / 2), 0.85));
    else if (s < 0.85) r = R;
    else { const u = (s - 0.85) / 0.15; r = R * Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.4))); }
    prof.push(new THREE.Vector2(Math.max(r, 0.002), s * Lf));
  }
  const fg = new THREE.LatheGeometry(prof, 56);
  fg.rotateX(-Math.PI / 2); fg.translate(0, 0, Lf / 2);
  const fp = fg.attributes.position, col = new Float32Array(fp.count * 3);
  for (let i = 0; i < fp.count; i++) {
    const z = fp.getZ(i);
    let y = fp.getY(i);
    if (z > 8) { const u = (z - 8) / 25; y = y * (1 - 0.25 * u) + 2.0 * u * u; }
    if (z < -26) { const u = (-26 - z) / 7; y -= 0.45 * u * u; }
    fp.setY(i, y);
    const belly = smooth((-fp.getY(i) - 0.6) / 1.4);
    const c = 1 - 0.2 * belly;
    col[i * 3] = c; col[i * 3 + 1] = c; col[i * 3 + 2] = c * 1.01;
  }
  fg.setAttribute("color", new THREE.BufferAttribute(col, 3));
  fg.computeVertexNormals();
  const fus = new THREE.Mesh(fg, M.body); fus.castShadow = fus.receiveShadow = true; body.add(fus);
  // cabin windows and cockpit glazing
  const win = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.22, 3, 8), M.glass, 92);
  const dm = new THREE.Object3D(); let wi = 0;
  for (const sx of [-1, 1]) for (let k = 0; k < 46; k++) {
    const z = -24 + k * 1.02;
    dm.position.set(sx * (R - 0.02), 0.75, z); dm.rotation.set(0, 0, 0); dm.updateMatrix(); win.setMatrixAt(wi++, dm.matrix);
  }
  body.add(win);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) {
    const p = rbox(0.9, 0.55, 0.12, 0.12, M.glass);
    p.position.set(sx * (0.62 + k * 0.9), 0.98 - k * 0.12, -29.6 + k * 0.55);
    p.rotation.set(-0.55, sx * (0.35 + k * 0.5), 0);
    body.add(p);
  }
  // wing-body fairing
  const fair = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), M.body);
  fair.scale.set(3.4, 1.5, 15); fair.position.set(0, -1.9, 1.5); body.add(fair);

  // wings with control surfaces on hinge pivots
  const piv = { ail: [], flap: [], rud: null, gear: [], nose: null };
  const hinge = (parent, A, B, geo, mat) => {
    const p = new THREE.Group(); p.position.copy(A); parent.add(p);
    const m = new THREE.Mesh(geo, mat); m.position.copy(A).multiplyScalar(-1); m.castShadow = true; p.add(m);
    const ax = B.clone().sub(A).normalize(); if (ax.x < 0) ax.multiplyScalar(-1);
    return { p, ax, set(a) { p.quaternion.setFromAxisAngle(ax, a); } };
  };
  for (const sx of [1, -1]) {
    const wing = new THREE.Group(); wing.position.set(0, -1.5, 0); wing.rotation.z = sx * 5.5 * D2R; body.add(wing);
    const X = (x) => sx * x;
    const pts = [[X(2.5), -6], [X(32.4), LE(32.4)], [X(32.4), TE(32.4) - 1.6], [X(30.5), TE(30.5) - 1.6], [X(24), TE(24) - 1.6], [X(22), TE(22) - 2.2], [X(3), TE(3) - 2.2], [X(2.5), TE(2.5) - 2.2]];
    const wm = new THREE.Mesh(slab(pts, 0.55, 0.28), M.wing); wm.castShadow = wm.receiveShadow = true; wing.add(wm);
    // winglet
    const wl = slab([[0, LE(32.4) + 0.2], [0, TE(32.4) - 1.4], [4.4, TE(32.4) + 0.7], [4.4, TE(32.4) - 0.6]], 0.22, 0.1);
    wl.rotateZ(Math.PI / 2);
    const wlm = new THREE.Mesh(wl, M.wing); wlm.position.set(X(32.6), 0.1, 0); wlm.rotation.z = -sx * 0.25; wing.add(wlm);
    // aileron x 24..30.5
    {
      const A = v3(X(24), 0, TE(24) - 1.6), B = v3(X(30.5), 0, TE(30.5) - 1.6);
      const g = slab([[X(24.1), TE(24) - 1.55], [X(30.4), TE(30.5) - 1.55], [X(30.4), TE(30.5) + 0.1], [X(24.1), TE(24) + 0.1]], 0.26, 0.1);
      piv.ail.push(hinge(wing, A, B, g, M.wing));
    }
    // flaps x 3..22 (two panels)
    for (const [x0, x1] of [[3, 11], [11.2, 22]]) {
      const A = v3(X(x0), -0.05, TE(x0) - 2.2), B = v3(X(x1), -0.05, TE(x1) - 2.2);
      const g = slab([[X(x0 + 0.1), TE(x0) - 2.15], [X(x1 - 0.1), TE(x1) - 2.15], [X(x1 - 0.1), TE(x1) + 0.4], [X(x0 + 0.1), TE(x0) + 0.4]], 0.3, 0.12);
      piv.flap.push(hinge(wing, A, B, g, M.wing));
    }
    // nav light at the tip
    const nav = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), sx > 0 ? M.navG : M.navR); nav.position.set(X(32.5), 0.2, LE(32.4) + 0.6); wing.add(nav);
    const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), M.strobe); strobe.position.set(X(32.5), 0.25, TE(32.4) - 0.5); wing.add(strobe);
    // engine on a pylon
    const ex = 10.2, ey = -1.5 + Math.tan(5.5 * D2R) * ex - 2.55, ez = LE(ex) - 3.4;
    const np = [[1.6, 0], [1.98, 0.35], [2.12, 1.4], [2.08, 3.6], [1.82, 5.6], [1.35, 7.0], [1.1, 7.4]].map((p) => new THREE.Vector2(p[0], p[1]));
    const ng = new THREE.LatheGeometry(np, 48); ng.rotateX(Math.PI / 2);
    const nac = new THREE.Mesh(ng, M.nac); nac.material.side = THREE.DoubleSide; nac.position.set(X(ex), ey, ez); nac.castShadow = true; body.add(nac);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.17, 12, 48), M.metal); lip.position.set(X(ex), ey, ez + 0.08); body.add(lip);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), M.fan); fan.position.set(X(ex), ey, ez + 0.6); fan.rotation.y = Math.PI; body.add(fan);
    const spin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 24), M.metal); spin.rotation.x = -Math.PI / 2; spin.position.set(X(ex), ey, ez + 0.2); body.add(spin);
    const plug = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.4, 24), M.metal); plug.rotation.x = Math.PI / 2; plug.position.set(X(ex), ey, ez + 8.3); body.add(plug);
    const pyl = new THREE.Mesh(slab([[0, 0], [0, 7.5], [1.7, 9.5], [2.4, 3.6]], 0.6, 0.2).rotateZ(Math.PI / 2), M.wing);
    pyl.position.set(X(ex), ey + 1.4, ez - 0.4); body.add(pyl);
    // landing light at the wing root
    const ll = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), M.lamp); ll.position.set(X(4.4), -1.55, LE(4.4) + 0.25); body.add(ll);
  }
  // fin + rudder, tailplanes
  const finPts = [[0, 20.5], [11.5, 28.6], [11.5, 31.0], [0.4, 28.4]];
  const fin = new THREE.Mesh(slab(finPts, 0.5, 0.2).rotateZ(Math.PI / 2), M.tail); fin.position.set(0, 2.4, 0); fin.castShadow = true; body.add(fin);
  {
    const finG = new THREE.Group(); finG.position.set(0, 2.4, 0); body.add(finG);
    const rg = slab([[0.6, 28.5], [11.2, 31.0], [11.2, 32.4], [0.6, 31.4]], 0.34, 0.12).rotateZ(Math.PI / 2);
    piv.rud = hinge(finG, v3(0, 0.6, 28.5), v3(0, 11.2, 31.0), rg, M.tail);
  }
  for (const sx of [1, -1]) {
    const tp = new THREE.Mesh(slab([[sx * 0.8, 23.2], [sx * 11.4, 28.4], [sx * 11.4, 30.6], [sx * 0.8, 30.0]], 0.36, 0.15), M.wing);
    tp.position.set(0, 1.7, 0); tp.rotation.z = sx * 6 * D2R; tp.castShadow = true; body.add(tp);
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), M.beacon); beacon.position.set(0, R + 0.1, -2); body.add(beacon);
  // gear: two 4-wheel bogies and a twin nose wheel
  const wheel = new THREE.CylinderGeometry(0.66, 0.66, 0.42, 22); wheel.rotateZ(Math.PI / 2);
  for (const sx of [1, -1]) {
    const g = new THREE.Group(); g.position.set(sx * 5.4, -2.3, 3.2); body.add(g);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 2.9, 12), M.strut); leg.position.y = -1.45; g.add(leg);
    const bog = rbox(0.5, 0.4, 3.6, 0.18, M.strut); bog.position.set(0, -2.65, 0); g.add(bog);
    for (const dz of [-1.25, 1.25]) for (const dx of [-0.52, 0.52]) { const w = new THREE.Mesh(wheel, M.tyre); w.position.set(dx, -2.65, dz); w.castShadow = true; g.add(w); }
    piv.gear.push({ g, sx });
  }
  {
    const g = new THREE.Group(); g.position.set(0, -2.4, -25.5); body.add(g);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.6, 10), M.strut); leg.position.y = -1.3; g.add(leg);
    for (const dx of [-0.34, 0.34]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.32, 18).rotateZ(Math.PI / 2), M.tyre); w.position.set(dx, -2.55, 0); g.add(w); }
    const nl = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), M.lamp); nl.position.set(0, -1.6, -0.35); g.add(nl);
    piv.nose = g;
  }
  root.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return { root, piv };
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(36, W / H, 0.5, 60000);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    batal: A_("s1:batal", 3.9), kep: A_("s1:keputusan", 5.7),
    angin2: A_("s2:angin", s.s2 + 6), kru: A_("s2:Kru", s.s2 + 11),
    hanyut: A_("s3:hanyut", s.s3 + 3), moncong: A_("s3:moncong", s.s3 + 4.6), kepiting: A_("s3:kepiting", s.s3 + 8.6),
    rudder: A_("s4:rudder", s.s4 + 2.9), sayap: A_("s4:sayap", s.s4 + 3.7), terlalu: A_("s4:Terlalu", s.s4 + 5.9), padu: A_("s4:memadukan", s.s4 + 9.9),
    hemb: A_("s5:Hembusan", s.s5), seribu: A_("s5:seribu", s.s5 + 3.7), lima: A_("s5:lima", s.s5 + 5.3), kec: A_("s5:Kecepatan", s.s5 + 7.3),
    turun: A_("s5:turun", s.s5 + 8.4), konf: A_("s5:konfigurasi", s.s5 + 11.3), meleset: A_("s5:meleset", s.s5 + 13.4), batalkan: A_("s5:batalkan", s.s5 + 14),
    tiga: A_("s6:tiga", s.s6 + 4), padahal: A_("s6:Padahal", s.s6 + 7.8),
    toga: A_("s7:TOGA", s.s7 + 3.8), hidung: A_("s7:hidung", s.s7 + 5.1), flap: A_("s7:flap", s.s7 + 5.9), roda: A_("s7:roda", s.s7 + 7), satu: A_("s7:satu", s.s7 + 8.9),
    rencana: A_("s8:rencana", s.s8 + 2.4),
  };

  const S = new THREE.Scene();
  const SUN = v3(-0.42, 0.13, -0.9).normalize();
  const HOR = new THREE.Color(0x7d858d);
  S.fog = new THREE.FogExp2(HOR.clone(), 0.00017);
  S.environment = skyEnv(r, 0x2c3540, 0x8d9296, 0x3d4238, SUN, 0xffcf9a, 2.2);
  S.environmentIntensity = 0.75;
  const sun = new THREE.DirectionalLight(0xffc690, 3.2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.04;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 900 });
  S.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0x9fb0c2, 0x3b4032, 0.9); S.add(hemi);

  // sky dome: dark storm overhead, warm band under the cloud deck toward the sun
  const skyU = { uS: { value: SUN.clone() }, uSunny: { value: 0.6 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(30000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 uS;uniform float uSunny;void main(){vec3 n=normalize(v);float y=n.y;float mu=max(dot(n,normalize(uS)),0.);
      vec3 hor=vec3(.49,.52,.55),zen=vec3(.13,.16,.2);vec3 c=mix(hor,zen,pow(clamp(y,0.,1.),.42));
      float band=1.-smoothstep(-.02,.22,y);c+=vec3(1.,.66,.36)*(pow(mu,5.)*.85+pow(mu,40.)*1.4)*band*uSunny;
      c+=vec3(1.,.85,.6)*pow(mu,900.)*2.5*uSunny*band;
      c=mix(c,hor*.82,smoothstep(0.,-.12,y));gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; S.add(sky);

  // ground and wet runway
  const grassTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = "#56653f"; c.fillRect(0, 0, w, w);
    const R = mulberry(3);
    for (let i = 0; i < 9000; i++) { const g = 50 + R() * 40; c.fillStyle = `rgba(${g},${g + 22 + R() * 20},${g - 16},${0.25 + R() * 0.3})`; c.fillRect(R() * w, R() * w, 1 + R() * 3, 1 + R() * 6); }
  }, [900, 900]);
  // large-scale grass patches as vertex colours (an aoMap here produced NaN pixels that bloom spread over the frame)
  const gGeo = new THREE.PlaneGeometry(40000, 40000, 220, 220), gpA = gGeo.attributes.position, gCol = new Float32Array(gpA.count * 3);
  const vnz = (x, y) => Math.sin(x * 0.0021 + Math.sin(y * 0.0013) * 2) * Math.sin(y * 0.0017 + Math.sin(x * 0.0011) * 2) * 0.5 + Math.sin(x * 0.0071 + y * 0.0053) * 0.25;
  for (let i = 0; i < gpA.count; i++) { const k = 0.82 + 0.2 * vnz(gpA.getX(i), gpA.getY(i)); gCol[i * 3] = k * 0.98; gCol[i * 3 + 1] = k; gCol[i * 3 + 2] = k * 0.92; }
  gGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3));
  const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ map: grassTex, vertexColors: true, roughness: 0.82, color: 0xe8efd8, emissive: 0x161c10 }));
  ground.rotation.x = -Math.PI / 2; ground.position.z = -2000; ground.receiveShadow = true; S.add(ground);
  const rwTex = canvasTex(256, 8192, (c, w, h) => {
    const R = mulberry(11);
    c.fillStyle = "#2b2d30"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { const g = 30 + R() * 30; c.fillStyle = `rgba(${g},${g},${g + 3},.5)`; c.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 3); }
    const py = (m) => h - (m / LEN) * h, px = (m) => (m / RW + 0.5) * w, PX = w / RW, PY = h / LEN;
    // rubber deposits in the touchdown zone
    for (let i = 0; i < 260; i++) { const m = 280 + R() * 700, x = px((R() - 0.5) * 18); c.fillStyle = `rgba(8,8,8,${0.1 + R() * 0.2})`; c.fillRect(x, py(m), 2 + R() * 6, -(10 + R() * 60) * PY); }
    c.fillStyle = "rgba(235,235,230,.92)";
    c.fillRect(px(-22), 0, 0.9 * PX, h); c.fillRect(px(21.1), 0, 0.9 * PX, h);
    for (let k = 0; k < 16; k++) { const x = -20 + k * 2.55 + (k >= 8 ? 1.6 : 0); c.fillRect(px(x), py(36), 1.7 * PX, 30 * PY); c.fillRect(px(x), py(LEN - 6), 1.7 * PX, 30 * PY); }
    for (let m = 90; m < LEN - 90; m += 60) c.fillRect(px(-0.45), py(m + 36), 0.9 * PX, 36 * PY);
    c.fillRect(px(-13), py(445), 9 * PX, 45 * PY); c.fillRect(px(4), py(445), 9 * PX, 45 * PY);
    for (const m of [150, 300, 600, 750, 900]) for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) c.fillRect(px(sx * (5 + k * 2.2) - (sx < 0 ? 1.8 : 0)), py(m + 22), 1.6 * PX, 22 * PY);
  });
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(RW, LEN), new THREE.MeshStandardMaterial({ map: rwTex, roughness: 0.45, metalness: 0.0, envMapIntensity: 1.3 }));
  runway.rotation.x = -Math.PI / 2; runway.position.set(0, 0.06, -LEN / 2); runway.receiveShadow = true; S.add(runway);
  const asph = new THREE.MeshStandardMaterial({ color: 0x34363a, roughness: 0.5, envMapIntensity: 1.1 });
  const taxi = new THREE.Mesh(new THREE.PlaneGeometry(23, LEN - 200), asph); taxi.rotation.x = -Math.PI / 2; taxi.position.set(-190, 0.05, -LEN / 2); taxi.receiveShadow = true; S.add(taxi);
  for (const z of [-120, -900, -1700, -2500, -3300]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(170, 23), asph); c.rotation.x = -Math.PI / 2; c.position.set(-105, 0.045, z); c.receiveShadow = true; S.add(c); }
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(260, 1500), new THREE.MeshStandardMaterial({ color: 0x55575a, roughness: 0.55, envMapIntensity: 1.0 }));
  apron.rotation.x = -Math.PI / 2; apron.position.set(-400, 0.04, -1500); apron.receiveShadow = true; S.add(apron);

  // terminal with AUDIRA on the roof, tower, hangars
  const concrete = std(0xb9bcbd, 0.6, 0.05);
  const term = rbox(110, 22, 640, 4, concrete); term.position.set(-600, 11, -1500); term.rotation.x = -Math.PI / 2; S.add(term);
  const facadeTex = canvasTex(2048, 128, (c, w, h) => {
    c.fillStyle = "#1b2633"; c.fillRect(0, 0, w, h);
    const R = mulberry(21);
    for (let x = 0; x < w; x += 16) for (let y = 14; y < h - 10; y += 34) { const on = R() > 0.35; c.fillStyle = on ? `rgba(255,${200 + R() * 40},${130 + R() * 60},${0.5 + R() * 0.4})` : "rgba(60,80,100,.6)"; c.fillRect(x + 2, y, 12, 22); }
  });
  const fac = new THREE.Mesh(new THREE.PlaneGeometry(630, 16), new THREE.MeshStandardMaterial({ map: facadeTex, emissiveMap: facadeTex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.3 }));
  fac.rotation.y = Math.PI / 2; fac.position.set(-544.6, 10, -1500); S.add(fac);
  const brandTex = canvasTex(1024, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.font = "900 200px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#ffffff";
    c.fillText("AUDIRA", w / 2, h * 0.46);
    c.fillStyle = "#A3E635"; c.fillRect(w * 0.18, h * 0.86, w * 0.64, 14);
  });
  const brand = new THREE.Mesh(new THREE.PlaneGeometry(150, 37.5), new THREE.MeshBasicMaterial({ map: brandTex, transparent: true, color: new THREE.Color(2.2, 2.2, 2.2), fog: true, depthWrite: false }));
  brand.rotation.y = Math.PI / 2; brand.position.set(-560, 41, -1380); S.add(brand);
  const tower = new THREE.Group(); tower.position.set(-430, 0, -1050); S.add(tower);
  { const sh = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.6, 64, 24), concrete); sh.position.y = 32; sh.castShadow = true; tower.add(sh);
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(9, 7, 7, 24), new THREE.MeshStandardMaterial({ color: 0x18242f, roughness: 0.08, metalness: 0.8, emissive: 0x3a2a14, emissiveIntensity: 0.6 })); cab.position.y = 68; tower.add(cab);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 1.4, 24), concrete); roof.position.y = 72.2; tower.add(roof);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 10, 6), std(0x999999, 0.4, 0.8)); ant.position.y = 78; tower.add(ant); }
  for (let k = 0; k < 3; k++) {
    const hg = new THREE.Mesh(new THREE.CylinderGeometry(38, 38, 90, 32, 1, false, 0, Math.PI), std(0x8e969c, 0.45, 0.6));
    hg.rotation.z = Math.PI / 2; hg.rotation.y = 0; hg.position.set(-520 + 0, 0, -2450 - k * 110); hg.rotation.set(0, 0, Math.PI / 2); hg.rotateY(Math.PI / 2);
    hg.castShadow = hg.receiveShadow = true; S.add(hg);
  }
  // distant city skyline (fog does most of the work)
  {
    const N = 260, R = mulberry(31);
    const winTex = canvasTex(64, 256, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); const Q = mulberry(2); for (let y = 4; y < h; y += 10) for (let x = 3; x < w; x += 9) if (Q() > 0.55) { c.fillStyle = `rgba(255,${190 + Q() * 50},120,${0.4 + Q() * 0.6})`; c.fillRect(x, y, 5, 5); } }, [1, 3]);
    const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x40464d, roughness: 0.4, metalness: 0.4, emissiveMap: winTex, emissive: 0xffffff, emissiveIntensity: 0.7 }), N);
    for (let i = 0; i < N; i++) { const hh = 20 + Math.pow(R(), 2.4) * 210; dm0.position.set(-3200 - R() * 3400, hh / 2, -7000 - R() * 3000); dm0.scale.set(20 + R() * 40, hh, 20 + R() * 40); dm0.rotation.set(0, R() * 0.3, 0); dm0.updateMatrix(); city.setMatrixAt(i, dm0.matrix); }
    S.add(city);
  }

  // windsock near the threshold
  const sock = new THREE.Group(); sock.position.set(72, 9.5, -230); S.add(sock);
  { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9.5, 8), std(0xdddddd, 0.4, 0.6)); pole.position.set(72, 4.75, -230); S.add(pole);
    const stTex = canvasTex(256, 64, (c, w, h) => { for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? "#f4f4f0" : "#ff6a1a"; c.fillRect(k * w / 5, 0, w / 5 + 1, h); } });
    const sg = new THREE.CylinderGeometry(0.85, 0.32, 6.5, 20, 6, true); sg.rotateZ(Math.PI / 2); sg.translate(-3.25, 0, 0);
    const sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: stTex, side: THREE.DoubleSide, roughness: 0.7, emissive: 0x401800, emissiveIntensity: 0.4 }));
    sm.castShadow = true; sock.add(sm); }
  // taxiway location sign with AUDIRA
  const signTex = canvasTex(1024, 256, (c, w, h) => {
    c.fillStyle = "#0b0b0b"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#ffd21a"; c.lineWidth = 12; c.strokeRect(22, 22, w - 44, h - 44);
    c.font = "900 150px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#ffd21a"; c.fillText("AUDIRA", w / 2, h / 2 + 6);
  });
  const sign = new THREE.Group(); sign.position.set(-58, 0, -170); S.add(sign);
  { const b = rbox(7.2, 1.9, 0.6, 0.18, std(0x161616, 0.5, 0.2)); b.position.y = 1.35; sign.add(b);
    for (const f of [1, -1]) { const face = new THREE.Mesh(new THREE.PlaneGeometry(6.9, 1.72), new THREE.MeshBasicMaterial({ map: signTex, color: new THREE.Color(1.5, 1.5, 1.5) })); face.position.set(0, 1.35, f * 0.31); if (f < 0) face.rotation.y = Math.PI; sign.add(face); }
    for (const x of [-3, 3]) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 6), std(0x777777, 0.5, 0.7)); lg.position.set(x, 0.25, 0); sign.add(lg); } }

  // ---------- airport lights as one point cloud ----------
  const LP = [], LC = [], LS = [], LK = [];
  const addL = (x, y, z, c, sz, kind = 0) => { LP.push(x, y, z); LC.push(...c); LS.push(sz); LK.push(kind); };
  const WHT = [1.6, 1.45, 1.15], GRN = [0.3, 1.8, 0.7], RED = [2, 0.25, 0.15], BLU = [0.35, 0.55, 2], AMB = [2, 1.2, 0.4];
  for (let z = 0; z >= -LEN; z -= 60) for (const x of [-24, 24]) addL(x, 0.5, z, z < -LEN + 600 ? AMB : WHT, 1.5);
  for (let x = -22; x <= 22; x += 2.75) { addL(x, 0.4, 2, GRN, 1.6); addL(x, 0.4, -LEN - 2, RED, 1.6); }
  for (let z = 30; z <= 900; z += 30) for (let x = -6; x <= 6; x += 3) addL(x, 1 + z * 0.012, z, WHT, 1.7);
  for (let x = -15; x <= 15; x += 1.5) addL(x, 4.6, 300, WHT, 1.6);
  const RAB0 = LP.length / 3;
  for (let z = 900; z >= 330; z -= 30) addL(0, 2.5 + z * 0.012, z, [3, 3, 3.2], 3.2, 1);
  const RABN = LP.length / 3 - RAB0;
  for (let k = 0; k < 4; k++) addL(-40 - k * 3, 0.9, -320, k < 2 ? RED : WHT, 2.2);
  for (let z = -100; z >= -LEN + 100; z -= 60) for (const x of [-202, -178]) addL(x, 0.4, z, BLU, 1.3);
  { const R = mulberry(41); for (let i = 0; i < 70; i++) addL(-290 - R() * 220, 18, -780 - R() * 1450, [2, 1.3, 0.6], 2.4); for (let i = 0; i < 900; i++) addL(-2600 - R() * 4600, 4 + R() * 60, -6500 - R() * 4500, [1.6, 1.1, 0.6], 2.2); }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(LP, 3));
  lg.setAttribute("col", new THREE.Float32BufferAttribute(LC, 3));
  lg.setAttribute("sz", new THREE.Float32BufferAttribute(LS, 1));
  const lOn = new Float32Array(LS.length).fill(1);
  lg.setAttribute("on", new THREE.BufferAttribute(lOn, 1));
  const lightsU = { uK: { value: 1 } };
  const lights = new THREE.Points(lg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: lightsU,
    vertexShader: `attribute vec3 col;attribute float sz,on;varying vec3 vC;varying float vF;uniform float uK;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;
      gl_PointSize=clamp(sz*1400./max(d,1.),2.2,46.);vF=exp(-d*.00016)*on*uK*smoothstep(.5,4.,d);vC=col;}`,
    fragmentShader: `varying vec3 vC;varying float vF;void main(){vec2 q=gl_PointCoord-.5;float d=length(q)*2.;if(d>1.)discard;float core=smoothstep(.45,0.,d),halo=pow(1.-d,3.);gl_FragColor=vec4(vC*(core*1.6+halo*.5)*vF,1.);}`,
  }));
  lights.frustumCulled = false; S.add(lights);

  // ---------- cloud decks ----------
  const cloudFrag = `varying vec3 vW;uniform float uT,uCov,uOp,uSpd,uSc;uniform vec3 uSun,uCam,uHor,uBase,uTop;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.3);a*=.5;}return s;}
    void main(){vec2 p=vW.xz*uSc+vec2(uT*uSpd,uT*uSpd*.18);float f=fbm(p)*.75+fbm(p*2.7+vec2(-uT*uSpd*1.6,0.))*.35;
      float a=smoothstep(uCov,uCov+.28,f);float d=length(vW.xz-uCam.xz);float fade=exp(-d*.00012);
      vec3 rd=normalize(vW-uCam);float mu=max(dot(rd,uSun),0.);
      vec3 c=mix(uTop,uBase,smoothstep(.4,.95,f));c+=vec3(1.,.62,.32)*pow(mu,6.)*(1.-a*.7)*.45;
      c=mix(uHor,c,fade*.85+.15);gl_FragColor=vec4(c,a*uOp*smoothstep(0.,.05,fade+.02));}`;
  const cloudVert = "varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}";
  const mkDeck = (y, cov, op, spd, sc, base, top) => {
    const U = { uT: { value: 0 }, uCov: { value: cov }, uOp: { value: op }, uSpd: { value: spd }, uSc: { value: sc }, uSun: { value: SUN }, uCam: { value: v3(0, 0, 0) }, uHor: { value: HOR }, uBase: { value: new THREE.Color(base) }, uTop: { value: new THREE.Color(top) } };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: cloudVert, fragmentShader: cloudFrag }));
    m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 2; S.add(m);
    return U;
  };
  const deckHi = mkDeck(560, 0.3, 0.97, 0.0045, 0.00028, 0x2a3036, 0x6c7178);
  const deckLo = mkDeck(260, 0.5, 0.78, 0.016, 0.0011, 0x4b5258, 0x8d9296);
  // distant rain shafts
  const shaftTex = canvasTex(128, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.15, "rgba(255,255,255,.7)"); g.addColorStop(1, "rgba(255,255,255,.25)");
    const R = mulberry(8); c.fillStyle = g; for (let i = 0; i < 110; i++) { c.globalAlpha = 0.2 + R() * 0.5; c.fillRect(R() * w, 0, 1 + R() * 3, h); }
  });
  const shafts = [];
  { const R = mulberry(17); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(900 + R() * 900, 560), new THREE.MeshBasicMaterial({ map: shaftTex, color: 0x6d747b, transparent: true, opacity: 0.45, depthWrite: false, fog: false })); const a = R() * Math.PI * 2, d = 3500 + R() * 6000; m.position.set(Math.cos(a) * d, 280, -1500 + Math.sin(a) * d); m.renderOrder = 1; S.add(m); shafts.push(m); } }

  // ---------- hero aircraft ----------
  const M = {
    body: new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.28, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    wing: new THREE.MeshPhysicalMaterial({ color: 0xd6dadf, roughness: 0.35, metalness: 0.3, clearcoat: 0.5 }),
    nac: new THREE.MeshPhysicalMaterial({ color: 0xf2f3f4, roughness: 0.25, metalness: 0.1, clearcoat: 0.9 }),
    tail: new THREE.MeshPhysicalMaterial({ color: 0x24344c, roughness: 0.3, metalness: 0.2, clearcoat: 0.9 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.08, metalness: 0.9 }),
    metal: std(0xc9cdd2, 0.22, 1), fan: std(0x15171a, 0.5, 0.6), strut: std(0xaeb3b8, 0.3, 0.9), tyre: std(0x141414, 0.85),
    navR: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.3, 0.2) }), navG: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 4, 0.8) }),
    strobe: new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1) }), beacon: new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.2, 0.1) }),
    lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.8, 5.2) }),
  };
  const AC = buildAircraft(M);
  const plane = AC.root; S.add(plane);
  // parked aircraft at the terminal (shared geometry)
  for (let k = 0; k < 4; k++) { const c = plane.clone(true); c.position.set(-500, GEARH, -1180 - k * 150); c.rotation.set(0, Math.PI / 2, 0); S.add(c); }
  // landing-light beams in the rain
  const beamU = { uOn: { value: 1 } };
  const beamM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: beamU,
    vertexShader: "varying float vL,vE;void main(){vL=clamp(-position.z/170.,0.,1.);vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalMatrix*normal;vec3 v=-mv.xyz;vE=clamp(abs(dot(n,v))/max(length(n)*length(v),1e-3),0.,1.);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "varying float vL,vE;uniform float uOn;void main(){float e=clamp(vE,0.,1.);e*=e;gl_FragColor=vec4(vec3(1.,.96,.88)*(1.-vL)*(1.-vL)*.16*e*uOn,1.);}" });
  for (const sx of [1, -1]) {
    const cg = new THREE.ConeGeometry(16, 170, 28, 1, true); cg.rotateX(Math.PI / 2); cg.translate(0, 0, -85);
    const b = new THREE.Mesh(cg, beamM); b.position.set(sx * 4.4, -1.55, LE(4.4)); b.rotation.x = -5 * D2R; b.rotation.y = -sx * 2 * D2R; b.renderOrder = 5; plane.add(b);
  }
  // spray / vapour particles in aircraft space: engines, wingtips, wheels
  const NFX = 1800, FX = [];
  const fR = mulberry(77);
  const EM = [[10.2, -2.6, 4.5, 0], [-10.2, -2.6, 4.5, 0], [33, 2.8, 14.5, 1], [-33, 2.8, 14.5, 1], [5.4, -5.3, 4.5, 2], [-5.4, -5.3, 4.5, 2]];
  for (let i = 0; i < NFX; i++) { const e = i < 900 ? (i % 2) : i < 1300 ? 2 + (i % 2) : 4 + (i % 2); FX.push({ e, ph: fR(), a: fR() * 6.283, k: fR(), k2: fR() }); }
  const fxG = new THREE.BufferGeometry(); const fxP = new Float32Array(NFX * 3), fxS = new Float32Array(NFX), fxA = new Float32Array(NFX);
  fxG.setAttribute("position", new THREE.BufferAttribute(fxP, 3)); fxG.setAttribute("sz", new THREE.BufferAttribute(fxS, 1)); fxG.setAttribute("al", new THREE.BufferAttribute(fxA, 1));
  const fx = new THREE.Points(fxG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: "attribute float sz,al;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(sz*1500./max(1.,-mv.z),180.);vA=al;}",
    fragmentShader: "varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(.86,.89,.93),vA*pow(1.-d,1.6));}" }));
  fx.frustumCulled = false; plane.add(fx);

  // ---------- rain around the camera ----------
  const NR = 9000, RB = [70, 46, 70];
  const rR = mulberry(99), rainBase = new Float32Array(NR * 3);
  for (let i = 0; i < NR; i++) { rainBase[i * 3] = rR() * RB[0]; rainBase[i * 3 + 1] = rR() * RB[1]; rainBase[i * 3 + 2] = rR() * RB[2]; }
  const rainG = new THREE.BufferGeometry(); const rainP = new Float32Array(NR * 6);
  rainG.setAttribute("position", new THREE.BufferAttribute(rainP, 3));
  const rainM = new THREE.LineBasicMaterial({ color: 0xc8d4e0, transparent: true, opacity: 0.32, depthWrite: false, fog: false });
  const rain = new THREE.LineSegments(rainG, rainM); rain.frustumCulled = false; S.add(rain);

  // ---------- wind streamlines (shader-animated) ----------
  const NSL = 200, SEG = 30, slP = [], slU = [], slS = [];
  { const R = mulberry(61);
    for (let l = 0; l < NSL; l++) {
      const y0 = (R() - 0.5) * 70, z0 = (R() - 0.5) * 260, ph = R() * 6, sd = R(), amp = 1 + R() * 3;
      for (let k = 0; k < SEG; k++) for (const kk of [k, k + 1]) {
        const u = kk / SEG;
        slP.push(170 - 340 * u, y0 + amp * Math.sin(kk * 0.45 + ph), z0 + 2 * Math.sin(kk * 0.3 + ph)); slU.push(u); slS.push(sd);
      }
    } }
  const slG = new THREE.BufferGeometry();
  slG.setAttribute("position", new THREE.Float32BufferAttribute(slP, 3)); slG.setAttribute("u", new THREE.Float32BufferAttribute(slU, 1)); slG.setAttribute("sd", new THREE.Float32BufferAttribute(slS, 1));
  const slU_ = { uT: { value: 0 }, uOn: { value: 0 }, uSpd: { value: 0.5 } };
  const stream = new THREE.LineSegments(slG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: slU_, fog: false,
    vertexShader: "attribute float u,sd;varying float vU,vS;void main(){vU=u;vS=sd;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying float vU,vS;uniform float uT,uOn,uSpd;void main(){float f=fract(vU*1.4-uT*uSpd*(.8+.5*vS)+vS*7.);float a=smoothstep(0.,.25,f)*smoothstep(.55,.25,f);a*=smoothstep(0.,.12,vU)*smoothstep(1.,.85,vU);gl_FragColor=vec4(vec3(.55,.9,1.)*a*uOn*.9,1.);}" }));
  stream.frustumCulled = false; S.add(stream);

  // ---------- diagram layer: arrows, arc, bank indicator, gates, labels ----------
  const arrowGeo = (len, wd, hw, hl) => {
    const sh = new THREE.Shape(); sh.moveTo(-wd / 2, 0); sh.lineTo(wd / 2, 0); sh.lineTo(wd / 2, len - hl); sh.lineTo(hw / 2, len - hl); sh.lineTo(0, len); sh.lineTo(-hw / 2, len - hl); sh.lineTo(-wd / 2, len - hl); sh.closePath();
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); return g;
  };
  const hud = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const diag = new THREE.Group(); S.add(diag);
  const mHead = hud([2.2, 2.2, 2.2]), mTrack = hud([0.35, 2.2, 0.9]), mWind = hud([0.4, 1.6, 2.4]), mDrift = hud([2.4, 0.35, 0.3]), mArc = hud([2.4, 1.5, 0.4]);
  const aHead = new THREE.Mesh(arrowGeo(70, 1.4, 6, 9), mHead); aHead.position.y = -7; diag.add(aHead);
  const aTrack = new THREE.Mesh(arrowGeo(110, 1.4, 6, 9), mTrack); aTrack.position.y = -7.2; diag.add(aTrack);
  const aWind = new THREE.Mesh(arrowGeo(46, 2.4, 9, 11), mWind); aWind.position.set(95, -7, -40); aWind.rotation.y = Math.PI / 2; diag.add(aWind);
  const aDrift = new THREE.Mesh(arrowGeo(110, 1.4, 6, 9), mDrift); aDrift.position.y = -7.1; diag.add(aDrift);
  let arcMesh = new THREE.Mesh(new THREE.RingGeometry(44, 46.5, 32, 1, 0, 0.1), mArc); arcMesh.rotation.x = -Math.PI / 2; diag.add(arcMesh);
  [aHead, aTrack, aWind, aDrift, arcMesh].forEach((m) => (m.renderOrder = 15));
  const lbHead = sprite(labelTex("ARAH HIDUNG", "#ffffff"), 8), lbTrack = sprite(labelTex("JALUR", "#7dffb0"), 8), lbWind = sprite(labelTex("ANGIN", "#8fdcff"), 9), lbDrift = sprite(labelTex("HANYUT", "#ff7a6b"), 8);
  [lbHead, lbTrack, lbWind, lbDrift].forEach((l) => diag.add(l));
  // bank indicator billboard (s4)
  const bank = new THREE.Group(); S.add(bank);
  const mHor = hud([1.1, 1.1, 1.1]), mBank = hud([1.25, 0.8, 0.22]), mWarn = hud([2.2, 0.25, 0.2]);
  const horL = new THREE.Mesh(new THREE.PlaneGeometry(96, 0.35), mHor); bank.add(horL);
  const bankL = new THREE.Mesh(new THREE.PlaneGeometry(80, 0.6), mBank); bank.add(bankL);
  const gapL = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), mWarn); S.add(gapL);
  [horL, bankL, gapL].forEach((m) => (m.renderOrder = 15));
  const lbBank = sprite(labelTex("SAYAP TURUN", "#ffc46b"), 5); bank.add(lbBank);
  const lbGap = sprite(labelTex("DEKAT TANAH", "#ff6b5e"), 5); S.add(lbGap);
  // stabilised-approach gates and the glide path
  const gate = (z, txt) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1), transparent: true, opacity: 0, depthWrite: false, fog: false });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(48, 1.6, 12, 96), m); ring.position.set(0, glide(z), z); ring.renderOrder = 6; S.add(ring);
    const lb = sprite(labelTex(txt, "#ffffff"), 26); lb.position.set(0, glide(z) + 78, z); S.add(lb);
    return { ring, m, lb };
  };
  const G1 = gate(5534, "1.000 KAKI"), G2 = gate(2614, "500 KAKI");
  const gpN = 160, gpP = [];
  for (let i = 0; i < gpN; i++) { const z = 8000 - i * 50; gpP.push(0, glide(z), z); }
  const gpG = new THREE.BufferGeometry(); gpG.setAttribute("position", new THREE.Float32BufferAttribute(gpP, 3));
  const gpM = new THREE.PointsMaterial({ color: new THREE.Color(2.2, 1.4, 0.5), size: 7, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const gpath = new THREE.Points(gpG, gpM); gpath.frustumCulled = false; S.add(gpath);
  // s6: 100 unstable approaches as ribbons, 3 of them go around
  const ribM = (c) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uP: { value: 0 }, uA: { value: 0 }, uC: { value: new THREE.Color(...c) } },
    vertexShader: "attribute float u;varying float vU;void main(){vU=u;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying float vU;uniform float uP,uA;uniform vec3 uC;void main(){float a=smoothstep(uP,uP-.04,vU);gl_FragColor=vec4(uC*a*uA*(1.-.75*vU*vU),1.);}" });
  const ribRed = ribM([1.4, 0.32, 0.26]), ribGreen = ribM([0.4, 2.4, 1.0]);
  const ribbons = (list, mat) => {
    const P = [], U = [], I = [];
    let base = 0;
    for (const pts of list) {
      for (let k = 0; k < pts.length; k++) {
        const [x, y, z, w] = pts[k], u = k / (pts.length - 1);
        const nx = pts[Math.min(k + 1, pts.length - 1)], pv = pts[Math.max(k - 1, 0)];
        const dx = nx[0] - pv[0], dz = nx[2] - pv[2], dl = Math.hypot(dx, dz) || 1;
        const ox = (-dz / dl) * w, oz = (dx / dl) * w;
        P.push(x - ox, y, z - oz, x + ox, y, z + oz); U.push(u, u);
        if (k < pts.length - 1) { const a = base + k * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      base += pts.length * 2;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("u", new THREE.Float32BufferAttribute(U, 1)); g.setIndex(I);
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 12; S.add(m); return m;
  };
  const PR = mulberry(123), red = [], green = [];
  for (let i = 0; i < 100; i++) {
    const goA = i === 17 || i === 52 || i === 86;
    const x0 = (PR() - 0.5) * 1400, wob = 8 + PR() * 26, ph = PR() * 6, fq = 2 + PR() * 4, zg = 600 + PR() * 1600;
    const pts = [];
    for (let k = 0; k <= 60; k++) {
      const z = 9000 - k * 150, f = z / 9000;
      if (goA && z < zg) { const d = (zg - z) / 1600; pts.push([x0 * Math.pow(zg / 9000, 1.3) - 260 * d * d, glide(zg) + 420 * Math.pow(d, 1.2), z, 7]); continue; }
      pts.push([x0 * Math.pow(f, 1.3) + wob * Math.sin(k / fq + ph) * f, glide(z) + wob * 0.8 * Math.sin(k / (fq * 1.3) + ph * 2) * f, z, goA ? 7 : 3.2]);
    }
    (goA ? green : red).push(pts);
  }
  ribbons(red, ribRed); ribbons(green, ribGreen);

  // ---------- post ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.55, 0.92);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uWarm: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uWarm;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      vec3 sh=vec3(.9,.98,1.06),hi=mix(vec3(1.05,1.,.92),vec3(1.1,1.,.84),uWarm);c*=mix(sh,hi,smoothstep(.12,.7,l));c=mix(vec3(l),c,.92);c=(c-.5)*1.07+.5;gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ================================================================ choreography
  const gust = (t, a) => a * (Math.sin(t * 5.3) * Math.sin(t * 2.1 + 1) + 0.5 * Math.sin(t * 9.7 + 2));
  const climb = (dt, acc, vmax) => (dt <= 0 ? 0 : dt < vmax / (2 * acc) ? acc * dt * dt : acc * Math.pow(vmax / (2 * acc), 2) + vmax * (dt - vmax / (2 * acc)));
  const ST = (o) => Object.assign({ x: 0, y: 30, z: 0, yaw: 0, pitch: 2.5, roll: 0, flap: 1, gear: 1, ail: 0, rud: 0, thr: 0.35, vis: 1, gnd: 0 }, o);
  function s1(t) {
    const tb = E.batal, dt = t - tb;
    const zz = t < tb ? 230 - 62 * t : 230 - 62 * tb - 70 * dt - 2 * Math.max(0, dt) * Math.max(0, dt);
    const yb = glide(230 - 62 * Math.min(t, tb)) - 4 * ramp(Math.min(t, tb), 0, tb);
    const y = yb + climb(dt, 2.3, 16);
    const roll = 8 + 3.5 * ramp(t, 0, 1.6) - 11.5 * ramp(t, tb - 0.5, tb + 1.7) + gust(t, 1.0) * (1 - ramp(t, tb, tb + 2));
    return ST({ x: -1.5 * ramp(t, 0, tb), y, z: zz, yaw: 6 - 3 * ramp(t, tb, tb + 2), pitch: 2.5 + 11 * ramp(t, tb + 0.2, tb + 2.4), roll, flap: 1 - 0.45 * ramp(t, tb + 1.4, tb + 2.6), gear: 1 - ramp(t, tb + 2.8, tb + 5), ail: -roll * 0.6 + gust(t + 0.3, 6), rud: gust(t + 1, 5), thr: 0.35 + 0.65 * ramp(t, tb - 0.1, tb + 0.6) });
  }
  function s2(t) {
    const a = s1(s.s2), u = t - s.s2, tu = Math.max(0, u - 4.5);
    return ST({ x: a.x - 1.5 * tu * tu, y: a.y + 14 * u, z: a.z - 80 * u, yaw: a.yaw - 24 * ramp(u, 4.5, 11), pitch: 12, roll: -16 * ramp(u, 4.5, 7) * (1 - 0.3 * ramp(u, 11, 14)), flap: 0.55 - 0.35 * ramp(u, 6, 9), gear: 0, thr: 0.95 });
  }
  function s3(t) {
    const u = t - s.s3, z = 2600 - 72 * u;
    const drift = -1.3 * Math.pow(Math.min(u, E.moncong - s.s3 + 0.6), 2);
    const x = drift * (1 - smooth((t - E.moncong) / 4.5));
    const yaw = 8 * ramp(t, E.moncong - 0.2, E.moncong + 1.6);
    return ST({ x, y: glide(z) + gust(t, 1.5), z, yaw, roll: gust(t + 2, 1.2) + (t > E.moncong && t < E.moncong + 2 ? 2 * Math.sin((t - E.moncong) * Math.PI / 2) : 0), ail: gust(t + 2.3, 5), rud: 14 * (ramp(t, E.moncong - 0.2, E.moncong + 0.8) - ramp(t, E.moncong + 1.2, E.moncong + 2.2)), pitch: 2.5 });
  }
  function s4(t) {
    const u = t - s.s4, z = 140 - 30 * u;
    const yaw = 8 - 8 * ramp(t, E.rudder - 0.1, E.rudder + 1.3) + 4 * ramp(t, E.padu, E.padu + 1.4);
    const roll = 4.5 * ramp(t, E.sayap - 0.1, E.sayap + 1.2) + 6.5 * ramp(t, E.terlalu - 0.1, E.terlalu + 1.2) - 6 * ramp(t, E.padu, E.padu + 1.4) + gust(t, 0.5);
    const rud = -16 * ramp(t, E.rudder - 0.2, E.rudder + 0.8) + 8 * ramp(t, E.padu, E.padu + 1.4);
    return ST({ y: 6.5 + 13 * (1 - smooth(u / 11.5)), z, yaw, roll, ail: -roll * 1.6, rud, pitch: 2.5 + 1.5 * ramp(u, 6, 11) });
  }
  function zGate(t) {
    if (t < E.seribu) return L(6500, 5534, (t - s.s5) / (E.seribu - s.s5));
    if (t < E.meleset) return L(5534, 2614, (t - E.seribu) / (E.meleset - E.seribu));
    return 2614 - 300 * (t - E.meleset);
  }
  function s5(t) {
    const z = zGate(t), dt = t - E.batalkan, g = 1 + 2.5 * ramp(t, E.hemb, E.hemb + 0.5) * (1 - ramp(t, E.hemb + 2.5, E.hemb + 4)) + 2 * ramp(t, E.meleset - 0.5, E.meleset);
    return ST({ x: gust(t * 0.6, 4 * g), y: glide(z) + gust(t, 3 * g) + climb(dt, 6, 40), z, yaw: 5, roll: gust(t + 1.7, 2.5 * g), ail: gust(t + 2, 8), pitch: 2.5 + 10 * ramp(t, E.batalkan, E.batalkan + 1.2), thr: 0.35 + 0.65 * ramp(t, E.batalkan - 0.2, E.batalkan + 0.4) });
  }
  function s7(t) {
    const u = t - s.s7, z = 320 - 72 * u - 2 * Math.pow(Math.max(0, t - E.toga), 2);
    const dt = t - E.hidung;
    return ST({ y: glide(Math.max(z, 0)) - 2.5 * ramp(u, 0, 3.5) + climb(dt, 2.0, 14), z, yaw: 4 - 2 * ramp(t, E.toga, E.toga + 3), roll: gust(t, 1.4) * (1 - ramp(t, E.hidung, E.hidung + 2)) + 2, pitch: 2.5 + 12.5 * ramp(t, E.hidung - 0.2, E.hidung + 1.6), flap: 1 - 0.45 * ramp(t, E.flap - 0.1, E.flap + 1.1), gear: 1 - ramp(t, E.roda, E.roda + 2.4), ail: gust(t + 0.4, 6), rud: gust(t + 1.1, 4), thr: 0.35 + 0.65 * ramp(t, E.toga - 0.1, E.toga + 0.5) });
  }
  function s8(t) {
    const u = t - s.s8, z = 210 - 66 * u + 6 * Math.pow(Math.max(0, u - 4), 2), td = smooth(u / 4.2);
    return ST({ x: 0, y: GEARH + 0.2 + (glide(210) - GEARH) * (1 - td), z, yaw: 3 * (1 - ramp(u, 3.2, 4.2)), roll: 2.5 * (1 - ramp(u, 3.6, 4.6)), pitch: 2.5 + 2.5 * ramp(u, 2.6, 4) - 3.5 * ramp(u, 4.6, 6), ail: -3, gnd: ramp(u, 4.15, 4.35), thr: 0.3 });
  }
  function planeAt(t) {
    if (t < s.s2) return s1(t);
    if (t < s.s3) return s2(t);
    if (t < s.s4) return s3(t);
    if (t < s.s5) return s4(t);
    if (t < s.s6) return s5(t);
    if (t < s.s7) return ST({ vis: 0, z: 30000 });
    if (t < s.s8) return s7(t);
    return s8(t);
  }
  // cameras: one continuous move per scene, motivated by the subject
  const P = new THREE.Vector3();
  function camAt(t, st) {
    P.set(st.x, st.y, st.z);
    if (t < s.s2) {
      const tb = E.batal, cz = t < tb ? L(0, -170, smooth(t / tb) * 0.4 + (t / tb) * 0.6) : -170 - 40 * (t - tb);
      return { p: v3(52 - 2 * t, 3.2 + 0.6 * t, cz), tg: v3(P.x + 2, P.y + 2.5, P.z - 6), fov: 32 + 3 * ramp(t, tb, s.s2) };
    }
    if (t < s.s3) {
      const u = ramp(t, E.angin2 - 1.2, s.s3 + 0.5), u0 = ramp(t, s.s2, s.s3);
      const p = v3(L(96, 620, u), L(5.5 + 2 * u0, 190, u), L(-140 - 15 * u0, 520, u));
      const tg = v3(L(L(70, P.x, 0.35), -330, u), L(L(9, P.y, 0.35), 20, u), L(L(-222, P.z, 0.25), -1250, u));
      return { p, tg, fov: L(40, 44, u) };
    }
    if (t < s.s4) {
      const u = ramp(t, s.s3, s.s4);
      return { p: v3(P.x + L(55, 35, u), P.y + L(175, 140, u), P.z + L(190, 160, u)), tg: v3(P.x * 0.6, P.y - 4, P.z - 28), fov: 36 };
    }
    if (t < s.s5) {
      const u = ramp(t, s.s4, s.s5);
      return { p: v3(L(-34, -24, u), 3.2 + st.y * 0.4, st.z - L(200, 175, u)), tg: v3(P.x + 4, P.y + 1, P.z), fov: 42 };
    }
    if (t < s.s6) {
      const u = ramp(t, s.s5, s.s6);
      return { p: v3(P.x + 360 - 40 * u, P.y + 35, P.z - 20 - 40 * u), tg: v3(P.x, P.y - 6, P.z - 45), fov: 48 };
    }
    if (t < s.s7) {
      const u = ramp(t, s.s6, s.s7);
      return { p: v3(L(700, 420, u), L(1000, 860, u), L(-2700, -2300, u)), tg: v3(-120, 120, 3600), fov: 46 };
    }
    if (t < s.s8) {
      const u = ramp(t, s.s7, s.s8), w = ramp(t, E.toga, E.hidung + 2.5);
      const off = v3(L(-95, -235, w), L(-6, -22, w) - 25 * ramp(t, E.roda, s.s8), L(175, 50, w));
      return { p: P.clone().add(off), tg: v3(P.x, P.y + 1.5, P.z + 2 - 6 * u), fov: 36 };
    }
    const u = ramp(t, s.s8, s.dur);
    return { p: v3(-80 + 4 * u, 2.6 + 1.5 * u, -232 - 6 * u), tg: v3(L(P.x - 10, P.x, 0.5), L(P.y, 6, 0.4), P.z + 10), fov: 34 };
  }

  const dm = new THREE.Object3D();
  const camPrev = new THREE.Vector3(), camNow = new THREE.Vector3();
  const setAC = (st) => {
    plane.visible = st.vis > 0;
    plane.position.set(st.x, st.y, st.z);
    plane.rotation.set(st.pitch * D2R, -st.yaw * D2R, -st.roll * D2R, "YXZ");
    const P_ = AC.piv;
    P_.ail[0].set(st.ail * D2R); P_.ail[1].set(-st.ail * D2R);
    for (const f of P_.flap) f.set(st.flap * 30 * D2R);
    P_.rud.set(st.rud * D2R);
    for (const g of P_.gear) g.g.rotation.z = -g.sx * (1 - st.gear) * Math.PI / 2;
    P_.nose.rotation.x = (1 - st.gear) * Math.PI / 2;
  };

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const st = planeAt(t);
    setAC(st);
    const C = camAt(t, st);
    cam.position.copy(C.p); cam.fov = C.fov; cam.updateProjectionMatrix(); cam.lookAt(C.tg);
    camNow.copy(C.p);
    const tp = Math.max(0, t - 1 / 30), Cp = camAt(tp, planeAt(tp));
    camPrev.copy(Cp.p);
    const camVel = camNow.clone().sub(camPrev).multiplyScalar(30);
    if (camVel.length() > 400) camVel.set(0, 0, 0);
    sky.position.copy(cam.position);

    // weather by scene
    const sc = t < s.s2 ? 1 : t < s.s3 ? 2 : t < s.s4 ? 3 : t < s.s5 ? 4 : t < s.s6 ? 5 : t < s.s7 ? 6 : t < s.s8 ? 7 : 8;
    const rainAmt = [0, 1, 0.75, 0.7, 1, 0.22, 0.15, 1, 0.45][sc] * (sc === 8 ? 1 - 0.6 * ramp(t, s.s8, s.s8 + 6) : 1);
    const sunny = sc === 8 ? 0.6 + 0.6 * ramp(t, s.s8, s.s8 + 5) : sc === 2 ? 0.25 : 0.6;
    skyU.uSunny.value = sunny; gradeU.uWarm.value = sc === 8 ? ramp(t, s.s8, s.s8 + 5) : 0;
    sun.intensity = 2.6 + 1.6 * (sunny - 0.6);
    sun.position.copy(plane.visible ? plane.position : C.tg).addScaledVector(SUN, 500);
    sun.target.position.copy(plane.visible ? plane.position : C.tg);
    for (const D of [deckHi, deckLo]) { D.uT.value = t; D.uCam.value.copy(cam.position); }
    deckHi.uOp.value = sc === 6 ? 0.25 : 0.97; deckLo.uOp.value = sc === 6 ? 0.1 : sc === 8 ? 0.5 : 0.78;
    deckHi.uCov.value = sc === 8 ? 0.3 + 0.12 * ramp(t, s.s8, s.s8 + 6) : 0.3;
    for (const m of shafts) { m.lookAt(cam.position.x, m.position.y, cam.position.z); }
    lightsU.uK.value = sc === 6 ? 0.6 : 1;
    // approach strobes ("rabbit") run toward the threshold twice a second
    const ph = (t * 2) % 1;
    for (let k = 0; k < RABN; k++) { const d = ph - k / RABN; lOn[RAB0 + k] = Math.max(0, 1 - Math.abs(d) * RABN * 1.2) * 1.6; }
    lg.attributes.on.needsUpdate = true;
    // aircraft lights
    const strobe = (t % 1.1) < 0.06 || ((t % 1.1) > 0.14 && (t % 1.1) < 0.2) ? 5 : 0;
    M.strobe.color.setRGB(strobe, strobe, strobe);
    const bc = Math.max(0, Math.sin(t * 6.5)) ** 6 * 4; M.beacon.color.setRGB(bc, bc * 0.08, bc * 0.04);
    beamU.uOn.value = st.gear > 0.5 ? 1 : 0.3;
    // windsock streams downwind with flutter
    sock.rotation.set(0, Math.sin(t * 3.7) * 0.08 + Math.sin(t * 9.1) * 0.03, -0.06 + Math.sin(t * 5.2) * 0.04);
    // vapour, wingtip trails, wheel spray
    const emI = [st.thr > 0.6 ? (st.thr - 0.6) * 2.5 : 0.12, 0, (rainAmt > 0.3 ? 0.55 : 0.15) * (st.vis), 0, st.gnd];
    for (let i = 0; i < NFX; i++) {
      const f = FX[i], e = EM[f.e], type = e[3];
      const life = type === 0 ? 0.9 : type === 1 ? 1.4 : 1.1, age = ((t / life + f.ph) % 1) * life, k = age / life;
      let x = e[0], y = e[1], z = e[2], sz, al;
      if (type === 0) { const sp = 0.6 + age * 7; x += Math.cos(f.a) * sp * f.k; y += Math.sin(f.a) * sp * f.k - age * 2; z += age * 55; sz = 1.2 + age * 6; al = emI[0] * 0.22 * (1 - k); }
      else if (type === 1) { const sp = 0.3 + age * 1.2; x += Math.cos(f.a) * sp * 0.4 * f.k; y += Math.sin(f.a) * sp * 0.4 * f.k; z += age * 70; sz = 0.5 + age * 0.8; al = emI[2] * 0.35 * (1 - k); }
      else { const sp = 0.5 + age * 6; x += (f.k - 0.5) * sp * 2; y += age * 5 * f.k2 - age * age * 3; z += age * 45; sz = 1.5 + age * 7; al = emI[4] * 0.3 * (1 - k); }
      fxP[i * 3] = x; fxP[i * 3 + 1] = Math.max(y, -st.y + 0.3); fxP[i * 3 + 2] = z; fxS[i] = sz; fxA[i] = al;
    }
    fxG.attributes.position.needsUpdate = fxG.attributes.sz.needsUpdate = fxG.attributes.al.needsUpdate = true;

    // rain streaks around the camera; streak = relative velocity of drops to the camera
    const rv = v3(-9, -12, 0), rel = rv.clone().sub(camVel).multiplyScalar(0.028);
    if (rel.length() > 4) rel.setLength(4);
    const cx = cam.position.x - RB[0] / 2, cy = cam.position.y - RB[1] / 2, cz = cam.position.z - RB[2] / 2;
    const nOn = Math.floor(NR * rainAmt);
    for (let i = 0; i < NR; i++) {
      const o = i * 6;
      if (i >= nOn) { rainP.fill(0, o, o + 6); rainP[o + 1] = rainP[o + 4] = -9999; continue; }
      const bx = rainBase[i * 3] + rv.x * t, by = rainBase[i * 3 + 1] + rv.y * t, bz = rainBase[i * 3 + 2];
      const x = cx + (((bx - cx) % RB[0]) + RB[0]) % RB[0], y = cy + (((by - cy) % RB[1]) + RB[1]) % RB[1], z = cz + (((bz - cz) % RB[2]) + RB[2]) % RB[2];
      rainP[o] = x; rainP[o + 1] = y; rainP[o + 2] = z; rainP[o + 3] = x + rel.x; rainP[o + 4] = y + rel.y; rainP[o + 5] = z + rel.z;
    }
    rainG.attributes.position.needsUpdate = true;
    rainM.opacity = 0.3;

    // streamlines follow the aircraft region
    const slOn = sc === 2 ? 0.35 * ramp(t, E.angin2 - 0.5, E.angin2 + 1) : sc === 3 ? 0.55 : sc === 4 ? 0.45 : sc === 5 ? 0.15 + 0.4 * ramp(t, E.hemb - 0.3, E.hemb + 0.5) * (1 - ramp(t, E.hemb + 3, E.hemb + 4.5)) : 0;
    slU_.uT.value = t; slU_.uOn.value = slOn; slU_.uSpd.value = sc === 5 ? 0.9 : 0.55;
    stream.position.set(sc === 2 ? 70 : st.x, sc === 2 ? 8 : st.y, sc === 2 ? -230 : st.z);
    stream.scale.setScalar(sc === 2 ? 0.25 : sc === 5 ? 2 : 1);

    // diagram arrows (s3, early s4)
    const dOn = sc === 3 ? ramp(t, s.s3 + 0.3, s.s3 + 1.2) : 0;
    diag.position.set(st.x, st.y, st.z);
    aHead.rotation.y = -st.yaw * D2R; mHead.opacity = dOn * 0.95;
    mTrack.opacity = dOn * ramp(t, E.moncong + 0.6, E.moncong + 1.6) * 0.95;
    mWind.opacity = dOn * 0.95; aWind.position.set(70 + 6 * Math.sin(t * 4), -7, -30);
    const dr = sc === 3 ? ramp(t, E.hanyut - 0.8, E.hanyut) * (1 - ramp(t, E.moncong + 0.8, E.moncong + 1.8)) : 0;
    aDrift.rotation.y = 24 * D2R; mDrift.opacity = dr * 0.95;
    const yawR = Math.max(0.01, st.yaw * D2R);
    arcMesh.geometry.dispose(); arcMesh.geometry = new THREE.RingGeometry(44, 46.5, 24, 1, Math.PI / 2, yawR * -1);
    mArc.opacity = dOn * ramp(t, E.moncong + 0.8, E.moncong + 1.6) * 0.9;
    lbHead.position.set(-Math.sin(st.yaw * D2R) * 80 * -1, -2, -Math.cos(st.yaw * D2R) * 80); lbHead.material.opacity = mHead.opacity;
    lbTrack.position.set(-14, -2, -122); lbTrack.material.opacity = mTrack.opacity;
    lbWind.position.set(98, 5, -30); lbWind.material.opacity = mWind.opacity;
    lbDrift.position.set(-55, -2, -100); lbDrift.material.opacity = mDrift.opacity;
    // bank indicator (s4)
    const bOn = sc === 4 ? ramp(t, E.sayap - 0.2, E.sayap + 0.5) : 0;
    bank.position.set(st.x, st.y, st.z); bank.quaternion.copy(cam.quaternion);
    bankL.rotation.z = -st.roll * D2R; mHor.opacity = bOn * 0.7; mBank.opacity = bOn;
    lbBank.position.set(0, 17, 0); lbBank.material.opacity = bOn;
    const wOn = sc === 4 ? ramp(t, E.terlalu + 0.4, E.terlalu + 1.0) * (1 - ramp(t, E.padu + 0.5, E.padu + 1.5)) : 0;
    const tip = v3(32.6, -1.5 + Math.sin(5.5 * D2R) * 32.6, LE(32.4) + 1).applyEuler(plane.rotation).add(plane.position);
    gapL.position.set(tip.x, tip.y / 2, tip.z); gapL.scale.set(1, Math.max(0.1, tip.y), 1); gapL.quaternion.copy(cam.quaternion); mWarn.opacity = wOn;
    lbGap.position.set(tip.x + 9, Math.max(2, tip.y / 2), tip.z); lbGap.material.opacity = wOn;
    M.navG.color.setRGB(0.3 + 4 * wOn * (0.6 + 0.4 * Math.sin(t * 18)), 4 * (1 - wOn), 0.8 * (1 - wOn));
    // gates (s5)
    const g5 = sc === 5 ? ramp(t, s.s5 + 0.3, s.s5 + 1.2) : 0;
    const g1c = ramp(t, E.seribu - 0.2, E.seribu + 0.3), g2c = ramp(t, E.lima - 0.2, E.lima + 0.3), bad = ramp(t, E.meleset - 0.1, E.meleset + 0.2);
    G1.m.color.setRGB(L(1.4, 0.4, g1c), L(1.4, 2.4, g1c), L(1.4, 1.0, g1c)); G1.m.opacity = g5 * 0.9; G1.lb.material.opacity = g5 * (0.4 + 0.6 * g1c);
    const fl = 0.75 + 0.25 * Math.sin(t * 14);
    G2.m.color.setRGB(L(L(1.4, 0.4, g2c), 3 * fl, bad), L(L(1.4, 2.4, g2c), 0.3, bad), L(L(1.4, 1.0, g2c), 0.25, bad)); G2.m.opacity = g5 * 0.9; G2.lb.material.opacity = g5 * (0.4 + 0.6 * g2c);
    gpM.opacity = g5 * 0.8;
    // s6 ribbons
    const r6 = sc === 6 ? 1 : 0, prog = ramp(t, s.s6 + 0.2, s.s6 + 3.6);
    ribRed.uniforms.uP.value = prog * 1.05; ribGreen.uniforms.uP.value = prog * 1.05;
    ribRed.uniforms.uA.value = 0.45 * r6 * (0.7 - 0.35 * ramp(t, E.tiga - 0.3, E.tiga + 0.4) + 0.6 * ramp(t, E.padahal - 0.2, E.padahal + 0.6) * (0.75 + 0.25 * Math.sin(t * 9)));
    ribGreen.uniforms.uA.value = r6 * (0.6 + 1.0 * ramp(t, E.tiga - 0.3, E.tiga + 0.4));

    comp.render();
  };
}
const dm0 = new THREE.Object3D();
