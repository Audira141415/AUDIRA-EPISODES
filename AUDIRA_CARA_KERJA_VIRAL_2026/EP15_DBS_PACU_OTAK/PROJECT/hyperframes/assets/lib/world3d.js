// EP15 SAKLAR DI DADA. ANATOMIX imaging suite: a translucent hologram bust (not flesh) with a contour-lined brain,
// glowing deep nuclei (STN amber, GPi pale gold), a four-contact DBS lead, an extension wire behind the ear to a
// titanium pulse generator under the collarbone, a clinician tablet branded AUDIRA, and a patient's hand in the
// foreground whose rest tremor settles when stimulation turns on. 1 unit ~ 10 cm. Stylised educational model.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const HOLO = "#3FE0D0", HOLOS = "#9FF5EC", AMBER = "#FFB547", GOLD = "#FFE08A";

// ---------- shaders ----------
const holoVS = `varying vec3 vN;varying vec3 vV;varying vec3 vW;varying vec3 vP;
void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`;
const bustFS = `varying vec3 vN;varying vec3 vV;varying vec3 vW;varying vec3 vP;uniform float uT,uOp;uniform vec3 uC,uR;
void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));float fr=pow(f,2.4);
float sl=smoothstep(.86,1.,sin(vW.y*95.-uT*2.2));float lat=smoothstep(.93,1.,sin(vW.y*18.))*.5;
float sweep=exp(-pow((vW.y-(2.9-mod(uT*.55,3.3)))*7.,2.));
vec3 c=mix(uC,uR,fr);float a=.025+fr*.62+sl*.05+lat*.05+sweep*.18;gl_FragColor=vec4(c*a*uOp,1.);}`;
const brainFS = `varying vec3 vN;varying vec3 vV;varying vec3 vW;varying vec3 vP;uniform float uT,uOp,uSync;uniform vec3 uC,uR;
void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));float fr=pow(f,2.);
float q=sin(vP.x*36.+sin(vP.y*23.)*1.7+sin(vP.z*29.)*1.3)*sin(vP.z*31.+sin(vP.x*19.)*1.5+vP.y*9.);
float ln=smoothstep(.78,1.,1.-abs(q));
float pulse=.5+.5*sin(uT*6.283*1.6-vP.y*8.);
vec3 c=mix(uC,uR,fr);float a=.03+fr*.45+ln*(.16+.2*uSync*pulse);gl_FragColor=vec4(c*a*uOp,1.);}`;
const glowFS = `varying vec3 vN;varying vec3 vV;varying vec3 vW;varying vec3 vP;uniform vec3 uC;uniform float uA;
void main(){float f=abs(dot(normalize(vN),normalize(vV)));gl_FragColor=vec4(uC*pow(f,2.5)*uA,1.);}`;
const ptsVS = `attribute float sz;attribute float al;varying float vA;uniform float uPx;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*uPx/max(.05,-mv.z);vA=al;}`;
const ptsFS = `varying float vA;uniform vec3 uC;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(uC*vA*pow(1.-d,1.6),1.);}`;

function holoMat(fs, u) {
  return new THREE.ShaderMaterial({ vertexShader: holoVS, fragmentShader: fs, uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
}
function ptsMat(color, px) {
  return new THREE.ShaderMaterial({ vertexShader: ptsVS, fragmentShader: ptsFS, uniforms: { uC: { value: new THREE.Color(color) }, uPx: { value: px } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
}
function roundRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function slab(w, h, d, r, bev, mat) {
  const g = new THREE.ExtrudeGeometry(roundRect(w, h, r), { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -d / 2); g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
// soft studio environment (RoomEnvironment-like): emissive panels in a dark teal room, prefiltered with PMREM
function studioEnv(r) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x06222a, side: THREE.BackSide })));
  const panel = (w, h, c, x, y, z, ry, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
  panel(6, 2.2, new THREE.Color(4, 4, 4), 0, 5.5, 0, 0, Math.PI / 2);
  panel(3, 6, new THREE.Color(2.2, 2.6, 2.6), 9.5, 1, 2, -Math.PI / 2);
  panel(3, 6, new THREE.Color(0.4, 1.6, 1.5), -9.5, 1, -2, Math.PI / 2);
  panel(8, 1.2, new THREE.Color(1.2, 1.4, 1.5), 0, 0, -9.5, 0);
  const pm = new THREE.PMREMGenerator(r); const rt = pm.fromScene(s, 0.03); pm.dispose(); return rt.texture;
}
function glowTex() {
  return canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(255,255,255,.4)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.02, 200);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    hent: A_("s1:menghentikan", 2), detik: A_("s1:detik", 4), bag: A_("s1:Bagaimana", 5),
    jak: A_("s2:Jakarta", s.s2 + 3), pertama: A_("s2:pertama", s.s2 + 8), dekade: A_("s2:dekade", s.s2 + 12),
    mri: A_("s3:MRI", s.s3 + 1.5), stn: A_("s3:subtalamikus", s.s3 + 4), glob: A_("s3:globus", s.s3 + 5.5), elek: A_("s3:Elektroda", s.s3 + 6.5),
    cincin: A_("s3:cincin", s.s3 + 8), masuk: A_("s3:masuk", s.s3 + 9), sadar: A_("s3:sadar", s.s3 + 11), diuji: A_("s3:diuji", s.s3 + 13),
    kabel: A_("s4:Kabelnya", s.s4 + 0.2), telinga: A_("s4:telinga", s.s4 + 3), stim: A_("s4:stimulator", s.s4 + 4.5), inilah: A_("s4:Inilah", s.s4 + 6.5),
    nyala: A_("s5:dinyalakan", s.s5 + 0.6), n130: A_("s5:130", s.s5 + 4), n60: A_("s5:60", s.s5 + 7), tremor: A_("s5:Tremor", s.s5 + 8.5),
    kenapa: A_("s6:Kenapa", s.s6 + 0.2), serempak: A_("s6:serempak", s.s6 + 4), beta6: A_("s6:beta", s.s6 + 6), stimul6: A_("s6:Stimulasi", s.s6 + 11.5), caranya: A_("s6:caranya", s.s6 + 13),
    fda: A_("s7:FDA", s.s7 + 3), adaptif: A_("s7:adaptif", s.s7 + 4.5), dengar: A_("s7:mendengar", s.s7 + 6.5), atur: A_("s7:mengatur", s.s7 + 8.5), orang: A_("s7:orang", s.s7 + 11),
    bukan: A_("s8:Bukan", s.s8 + 0.2), kendali: A_("s8:pengendali", s.s8 + 2),
  };

  const S = new THREE.Scene();
  S.environment = studioEnv(r);
  S.environmentIntensity = 0.55;
  S.add(cam);
  const key = new THREE.DirectionalLight(0xe8fbff, 2.2); key.position.set(3, 5, 6); S.add(key);
  const rim = new THREE.DirectionalLight(0x3fe0d0, 1.6); rim.position.set(-4, 3, -5); S.add(rim);
  S.add(new THREE.HemisphereLight(0x6fd8d0, 0x061a20, 0.45));
  const GT = glowTex();

  // ---------- imaging suite ----------
  const back = canvasTex(1024, 512, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h * 0.52, 10, w / 2, h * 0.52, w * 0.55);
    g.addColorStop(0, "#0E4450"); g.addColorStop(0.5, "#07242C"); g.addColorStop(1, "#020F14");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(63,224,208,0.035)"; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1);
  });
  S.add(new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.MeshBasicMaterial({ map: back, side: THREE.BackSide })));
  const projT = canvasTex(1024, 1024, (c, w) => {
    c.translate(w / 2, w / 2);
    for (let rr = 80; rr < 500; rr += 46) { c.strokeStyle = `rgba(159,245,236,${rr % 92 === 80 ? 0.4 : 0.18})`; c.lineWidth = rr % 92 === 80 ? 5 : 2; c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.stroke(); }
    for (let a = 0; a < 120; a++) { const an = a / 120 * Math.PI * 2, l = a % 10 === 0 ? 46 : 18; c.strokeStyle = "rgba(159,245,236,.5)"; c.lineWidth = 3; c.beginPath(); c.moveTo(Math.cos(an) * (500 - l), Math.sin(an) * (500 - l)); c.lineTo(Math.cos(an) * 500, Math.sin(an) * 500); c.stroke(); }
  });
  const floorM = new THREE.MeshBasicMaterial({ map: projT, color: HOLO, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), floorM); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.04; S.add(floor);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.85, 0.16, 96), new THREE.MeshStandardMaterial({ color: 0x0b2228, metalness: 0.4, roughness: 0.55 })); plinth.position.y = -0.13; S.add(plinth);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.2, 1.0, 64, 1, true), new THREE.MeshBasicMaterial({ color: HOLO, transparent: true, opacity: 0.045, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); cone.position.y = 0.45; S.add(cone);
  const rings = [];
  [[1.25, 1.35, 0.2, 0.22], [1.42, 1.08, -0.35, -0.16], [1.6, 1.6, 0.15, 0.1]].forEach(([rad, rx, rz, sp], i) => {
    const g = new THREE.Group(); g.position.set(0, 1.9, 0); g.rotation.set(rx, 0, rz); S.add(g);
    const m = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.005, 6, 200, Math.PI * (1.35 + 0.2 * i)), new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLO).multiplyScalar(1.4), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(m); rings.push({ m, sp });
  });
  // dust motes
  const rnd = mulberry(1515);
  const NMO = 220, moP = new Float32Array(NMO * 3), moS = new Float32Array(NMO), moA = new Float32Array(NMO), MO = [];
  for (let i = 0; i < NMO; i++) { MO.push({ a: rnd() * 6.283, rad: 1.4 + rnd() * 4, y: -0.2 + rnd() * 4.2, ph: rnd() * 6.283 }); moS[i] = 0.01 + rnd() * 0.02; moA[i] = 0.25 + rnd() * 0.5; }
  const moG = new THREE.BufferGeometry(); moG.setAttribute("position", new THREE.BufferAttribute(moP, 3)); moG.setAttribute("sz", new THREE.BufferAttribute(moS, 1)); moG.setAttribute("al", new THREE.BufferAttribute(moA, 1));
  const motes = new THREE.Points(moG, ptsMat(HOLOS, 1100)); motes.frustumCulled = false; S.add(motes);

  // ---------- hologram bust ----------
  const bustU = { uT: { value: 0 }, uOp: { value: 1 }, uC: { value: new THREE.Color(HOLO) }, uR: { value: new THREE.Color(HOLOS) } };
  const bustM = holoMat(bustFS, bustU);
  const prof = [[0.0, 0], [0.86, 0], [0.95, 0.35], [1.0, 0.62], [0.96, 0.78], [0.78, 0.9], [0.45, 0.98], [0.27, 1.04], [0.25, 1.2], [0.25, 1.36], [0.0, 1.38]].map(([x, y]) => new THREE.Vector2(x, y));
  const torsoG = new THREE.LatheGeometry(prof, 72);
  { const p = torsoG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = THREE.MathUtils.smoothstep(y, 0.92, 1.08); p.setZ(i, p.getZ(i) * THREE.MathUtils.lerp(0.5, 1, k)); p.setX(i, p.getX(i) * THREE.MathUtils.lerp(1.08, 1, k)); } torsoG.computeVertexNormals(); }
  S.add(new THREE.Mesh(torsoG, bustM));
  const headG = new THREE.SphereGeometry(1, 96, 72);
  { const p = headG.attributes.position; for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const low = Math.max(0, -y);
    x *= 0.6 * (1 - 0.32 * low * low); z *= 0.72 * (1 - 0.12 * low) ; y *= 0.8;
    if (y < 0 && z > 0) z += 0.06 * low;
    const nose = Math.exp(-Math.pow(x / 0.07, 2) - Math.pow((y + 0.12) / 0.16, 2)) * (z > 0.5 ? 1 : 0); z += 0.16 * nose;
    const brow = Math.exp(-Math.pow((y - 0.14) / 0.06, 2)) * (z > 0.5 ? 1 : 0) * Math.exp(-Math.pow(x / 0.35, 2)); z += 0.03 * brow;
    const eye = Math.exp(-Math.pow((Math.abs(x) - 0.2) / 0.08, 2) - Math.pow((y - 0.04) / 0.06, 2)) * (z > 0.4 ? 1 : 0); z -= 0.045 * eye;
    p.setXYZ(i, x, y, z);
  } headG.computeVertexNormals(); }
  const head = new THREE.Mesh(headG, bustM); head.position.set(0, 1.86, 0); S.add(head);
  // ears
  [-1, 1].forEach((sx) => { const e = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), bustM); e.scale.set(0.05, 0.15, 0.1); e.position.set(sx * 0.6, 1.84, -0.04); S.add(e); });

  // ---------- brain ----------
  const brainU = { uT: { value: 0 }, uOp: { value: 1 }, uSync: { value: 0 }, uC: { value: new THREE.Color("#C99BFF") }, uR: { value: new THREE.Color("#FFC2E2") } };
  const brainM = holoMat(brainFS, brainU);
  const brainG = new THREE.SphereGeometry(1, 128, 96);
  { const p = brainG.attributes.position; for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 0.045 * Math.sin(x * 13 + Math.sin(y * 9) * 2) * Math.sin(z * 11 + Math.sin(x * 7) * 2) + 0.02 * Math.sin(y * 21 + z * 17);
    const fiss = y > -0.1 ? 0.12 * Math.exp(-Math.pow(x / 0.06, 2)) : 0;
    const k = 1 + n - fiss;
    x *= 0.53 * k; y *= 0.44 * k * (y < 0 ? 0.8 : 1); z *= 0.63 * k;
    p.setXYZ(i, x, y, z);
  } brainG.computeVertexNormals(); }
  const BC = v3(0, 2.1, -0.04);
  const brain = new THREE.Mesh(brainG, brainM); brain.position.copy(BC); S.add(brain);
  const cereb = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), brainM); cereb.scale.set(0.3, 0.16, 0.2); cereb.position.set(0, 1.66, -0.42); S.add(cereb);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.5, 24), brainM); stem.position.set(0, 1.5, -0.18); stem.rotation.x = 0.25; S.add(stem);

  // deep nuclei
  const STN = [v3(0.11, 1.8, 0.0), v3(-0.11, 1.8, 0.0)], GPI = [v3(0.21, 1.88, 0.06), v3(-0.21, 1.88, 0.06)];
  const nucM = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.05), transparent: true, opacity: 0.95 });
  const stnM = nucM(AMBER), gpiM = nucM(GOLD);
  const glows = [];
  const nucleus = (p, m, sc, col) => {
    const n = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), m); n.scale.set(sc[0], sc[1], sc[2]); n.position.copy(p); n.rotation.z = p.x > 0 ? -0.5 : 0.5; S.add(n);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 })); sp.position.copy(p); sp.scale.setScalar(0.16); S.add(sp);
    glows.push({ sp, n, p }); return n;
  };
  STN.forEach((p) => nucleus(p, stnM, [0.05, 0.028, 0.075], AMBER));
  GPI.forEach((p) => nucleus(p, gpiM, [0.03, 0.045, 0.068], GOLD));

  // ---------- DBS lead (right side) ----------
  const ENTRY = v3(0.22, 2.53, 0.28), TIP = STN[0].clone();
  const DIR = TIP.clone().sub(ENTRY).normalize(), LEN = TIP.distanceTo(ENTRY);
  const leadG = new THREE.Group(); S.add(leadG);
  const leadM = new THREE.MeshPhysicalMaterial({ color: 0xdfeaec, roughness: 0.35, clearcoat: 0.8, emissive: 0x3fe0d0, emissiveIntensity: 0.15 });
  const leadLen = LEN + 0.12;
  const leadMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, leadLen, 16), leadM); leadMesh.position.y = leadLen / 2; leadG.add(leadMesh);
  const tipCap = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 8), leadM); leadG.add(tipCap);
  const contactM = new THREE.MeshPhysicalMaterial({ color: 0xeef3f6, metalness: 1, roughness: 0.18, emissive: 0x3fe0d0, emissiveIntensity: 0 });
  const contacts = [];
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.022, 20), contactM); c.position.y = 0.018 + i * 0.036; leadG.add(c); contacts.push(c); }
  leadG.quaternion.setFromUnitVectors(v3(0, 1, 0), DIR.clone().negate());
  const burr = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 24), new THREE.MeshPhysicalMaterial({ color: 0xc8d2d8, metalness: 1, roughness: 0.3 }));
  burr.position.copy(ENTRY); burr.quaternion.setFromUnitVectors(v3(0, 1, 0), DIR.clone().negate()); S.add(burr);
  const field = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), holoMat(glowFS, { uC: { value: new THREE.Color(HOLOS) }, uA: { value: 0 } }));
  field.position.copy(TIP).addScaledVector(DIR, -0.06); field.scale.setScalar(0.11); S.add(field);

  // extension wire: entry -> over the skull -> behind the ear -> down the neck -> over the collarbone -> pulse generator
  const IPG = v3(0.5, 0.56, 0.4);
  const wireC = new THREE.CatmullRomCurve3([ENTRY.clone().add(v3(0, 0.03, 0)), v3(0.45, 2.5, 0.02), v3(0.62, 2.12, -0.3), v3(0.64, 1.72, -0.24), v3(0.42, 1.25, -0.18), v3(0.4, 1.0, 0.0), v3(0.5, 0.82, 0.24), v3(0.5, 0.64, 0.37)], false, "catmullrom", 0.5);
  const wireG = new THREE.TubeGeometry(wireC, 300, 0.014, 10, false);
  const wireM = new THREE.MeshPhysicalMaterial({ color: 0xdfeaec, roughness: 0.4, clearcoat: 0.6, emissive: 0x3fe0d0, emissiveIntensity: 0.35 });
  const wire = new THREE.Mesh(wireG, wireM); S.add(wire);
  const wireIdx = wireG.index.count;

  // pulse generator: rounded titanium can + clear connector header
  const ipgG = new THREE.Group(); ipgG.position.copy(IPG); ipgG.rotation.set(-0.15, 0.3, 0); S.add(ipgG);
  const tiM = new THREE.MeshPhysicalMaterial({ color: 0xb9c3cb, metalness: 1, roughness: 0.3, clearcoat: 0.4 });
  ipgG.add(slab(0.32, 0.25, 0.04, 0.1, 0.018, tiM));
  const hdr = slab(0.2, 0.06, 0.05, 0.025, 0.008, new THREE.MeshPhysicalMaterial({ color: 0xbff7f0, roughness: 0.1, transmission: 0.0, transparent: true, opacity: 0.55, emissive: 0x3fe0d0, emissiveIntensity: 0.2 }));
  hdr.position.set(0, 0.155, 0); ipgG.add(hdr);
  const ipgGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: HOLO, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  ipgGlow.scale.setScalar(0.9); ipgG.add(ipgGlow);
  const ipgRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.004, 6, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(HOLOS).multiplyScalar(1.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  ipgG.add(ipgRing);

  // pulse train path: generator -> wire -> entry -> along the lead to the tip
  const PATH = [];
  for (let i = 0; i <= 240; i++) PATH.push(wireC.getPointAt(1 - i / 240));
  for (let i = 1; i <= 60; i++) PATH.push(ENTRY.clone().addScaledVector(DIR, (LEN - 0.03) * i / 60));
  const CUM = [0]; for (let i = 1; i < PATH.length; i++) CUM.push(CUM[i - 1] + PATH[i].distanceTo(PATH[i - 1]));
  const PL = CUM[CUM.length - 1];
  const pathAt = (u, out) => { const d = clamp01(u) * PL; let lo = 0, hi = CUM.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CUM[m] < d) lo = m; else hi = m; } const f = (d - CUM[lo]) / Math.max(1e-6, CUM[hi] - CUM[lo]); return out.copy(PATH[lo]).lerp(PATH[hi], f); };
  const NPU = 70, puP = new Float32Array(NPU * 3), puS = new Float32Array(NPU), puA = new Float32Array(NPU);
  const puG = new THREE.BufferGeometry(); puG.setAttribute("position", new THREE.BufferAttribute(puP, 3)); puG.setAttribute("sz", new THREE.BufferAttribute(puS, 1)); puG.setAttribute("al", new THREE.BufferAttribute(puA, 1));
  const pulses = new THREE.Points(puG, ptsMat("#CFFFF8", 1100)); pulses.frustumCulled = false; S.add(pulses);

  // motor circuit loop inside the right hemisphere (cortex -> GPi -> STN -> thalamus -> cortex)
  const loopC = new THREE.CatmullRomCurve3([v3(0.3, 2.3, 0.12), v3(0.27, 2.02, 0.12), GPI[0].clone(), STN[0].clone(), v3(0.06, 1.95, -0.1), v3(0.2, 2.18, -0.18), v3(0.33, 2.34, -0.06)], true, "catmullrom", 0.5);
  const NLP = 260, lpP = new Float32Array(NLP * 3), lpS = new Float32Array(NLP), lpA = new Float32Array(NLP), LJ = [];
  for (let i = 0; i < NLP; i++) LJ.push({ b: i / NLP, j: rnd(), o: v3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.035) });
  const lpG = new THREE.BufferGeometry(); lpG.setAttribute("position", new THREE.BufferAttribute(lpP, 3)); lpG.setAttribute("sz", new THREE.BufferAttribute(lpS, 1)); lpG.setAttribute("al", new THREE.BufferAttribute(lpA, 1));
  const loopPts = new THREE.Points(lpG, ptsMat("#FFD6EC", 1100)); loopPts.frustumCulled = false; S.add(loopPts);
  const loopLine = new THREE.Mesh(new THREE.TubeGeometry(loopC, 200, 0.004, 6, true), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFC2E2").multiplyScalar(0.9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  S.add(loopLine);

  // MRI slices + targeting crosshair
  const sliceT = canvasTex(512, 512, (c, w) => {
    const R = mulberry(77); c.fillStyle = "rgba(0,0,0,1)"; c.fillRect(0, 0, w, w);
    const g = c.createRadialGradient(w / 2, w / 2, 20, w / 2, w / 2, w * 0.42); g.addColorStop(0, "rgba(150,200,205,.55)"); g.addColorStop(0.8, "rgba(110,160,170,.4)"); g.addColorStop(0.93, "rgba(220,250,250,.9)"); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.ellipse(w / 2, w / 2, w * 0.42, w * 0.47, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(230,255,255,.35)"; c.lineWidth = 2;
    for (let k = 0; k < 70; k++) { const a = R() * Math.PI * 2, rr = w * (0.25 + R() * 0.15); c.beginPath(); c.arc(w / 2 + Math.cos(a) * rr * 0.9, w / 2 + Math.sin(a) * rr, 10 + R() * 26, 0, Math.PI * (0.6 + R())); c.stroke(); }
    c.fillStyle = "rgba(255,181,71,.9)"; [[0.43, 0.56], [0.57, 0.56]].forEach(([x, y]) => { c.beginPath(); c.ellipse(w * x, w * y, 10, 6, 0, 0, Math.PI * 2); c.fill(); });
    c.strokeStyle = "rgba(63,224,208,.9)"; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, w - 8);
  });
  const slices = [];
  [[0, 0, 0], [Math.PI / 2, 0, 0], [0, Math.PI / 2, 0]].forEach((rot, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.35), new THREE.MeshBasicMaterial({ map: sliceT, color: HOLOS, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.set(rot[0], rot[1], rot[2]); S.add(m); slices.push(m);
  });
  const crossM = new THREE.LineBasicMaterial({ color: new THREE.Color(AMBER).multiplyScalar(1.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const crossG = new THREE.BufferGeometry().setFromPoints([v3(-1, 0, 0), v3(1, 0, 0), v3(0, -1, 0), v3(0, 1, 0), v3(0, 0, -1), v3(0, 0, 1)]);
  const cross = new THREE.LineSegments(crossG, crossM); S.add(cross);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.058, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(AMBER).multiplyScalar(1.6), transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  S.add(reticle);

  // ---------- clinician tablet (AUDIRA programmer) ----------
  const tabTex = (mode) => canvasTex(1024, 704, (c, w, h) => {
    c.fillStyle = "#031a20"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#3FE0D0"; c.fillRect(0, 0, w, 86);
    c.fillStyle = "#031a20"; c.font = "800 46px Arial"; c.fillText("AUDIRA", 34, 60); c.font = "600 30px Arial"; c.fillText("NEURO PROGRAMMER", 250, 58);
    c.fillStyle = "rgba(230,251,248,.6)"; c.font = "600 28px Arial"; c.fillText("STIMULASI", 40, 150);
    const on = mode !== "off";
    c.fillStyle = on ? "#3FE0D0" : "#24414a"; c.beginPath(); c.roundRect(40, 172, 300, 96, 48); c.fill();
    c.fillStyle = on ? "#031a20" : "#9fb3b8"; c.font = "800 56px Arial"; c.fillText(mode === "adapt" ? "ADAPTIF" : on ? "ON" : "OFF", mode === "adapt" ? 64 : 140, 240);
    c.fillStyle = "rgba(230,251,248,.6)"; c.font = "600 28px Arial"; c.fillText("FREKUENSI", 420, 150); c.fillText("LEBAR DENYUT", 720, 150);
    c.fillStyle = "#E6FBF8"; c.font = "800 84px Arial"; c.fillText("130", 420, 250); c.fillText("60", 720, 250);
    c.font = "700 36px Arial"; c.fillStyle = "#9FF5EC"; c.fillText("Hz", 580, 250); c.fillText("µs", 830, 250);
    c.strokeStyle = "rgba(63,224,208,.3)"; c.lineWidth = 2; c.strokeRect(40, 320, w - 80, 300);
    c.fillStyle = "rgba(230,251,248,.6)"; c.font = "600 26px Arial"; c.fillText("SINYAL BETA", 60, 360);
    c.strokeStyle = on ? "#9FF5EC" : "#FFB547"; c.lineWidth = 5; c.beginPath();
    for (let x = 0; x <= 860; x += 3) { const a = mode === "off" ? 1 : mode === "adapt" ? 0.45 + 0.35 * Math.sin(x * 0.012) : 0.2; const y = 480 + a * 90 * (Math.sin(x * 0.19) * 0.7 + Math.sin(x * 0.31 + 1) * 0.3); x ? c.lineTo(80 + x, y) : c.moveTo(80 + x, y); }
    c.stroke();
    c.fillStyle = "rgba(230,251,248,.45)"; c.font = "600 24px Arial"; c.fillText("ILUSTRASI · BUKAN SARAN MEDIS", 40, 670);
  });
  const TAB = { off: tabTex("off"), on: tabTex("on"), adapt: tabTex("adapt") };
  const tab = new THREE.Group(); tab.position.set(-1.05, 0.78, 1.15); tab.rotation.set(-0.35, 0.55, 0.06); S.add(tab);
  tab.add(slab(0.96, 0.68, 0.035, 0.06, 0.012, new THREE.MeshPhysicalMaterial({ color: 0x1a2a30, metalness: 0.6, roughness: 0.35, clearcoat: 1 })));
  const scrM = new THREE.MeshBasicMaterial({ map: TAB.off, toneMapped: false, color: 0xd8e8e8 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.605), scrM); scr.position.z = 0.031; tab.add(scr);

  // ---------- patient's hand (foreground, camera space) ----------
  const skin = new THREE.MeshPhysicalMaterial({ color: 0xd49c78, roughness: 0.55, sheen: 0.5, sheenColor: new THREE.Color(0xffd0b8), clearcoat: 0.08 });
  const nailM = new THREE.MeshPhysicalMaterial({ color: 0xf0cbb8, roughness: 0.25, clearcoat: 0.6 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2b4560, roughness: 0.92 });
  const hand = new THREE.Group(); cam.add(hand);
  const wristJ = new THREE.Group(); hand.add(wristJ);
  {
    const pg = new THREE.ExtrudeGeometry(roundRect(0.084, 0.092, 0.022), { depth: 0.018, bevelEnabled: true, bevelThickness: 0.009, bevelSize: 0.008, bevelSegments: 4, curveSegments: 8 });
    pg.translate(0, 0.046, -0.009);
    const p = pg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) * THREE.MathUtils.lerp(0.82, 1, clamp01(y / 0.07))); p.setZ(i, p.getZ(i) + 0.006 * Math.sin(clamp01(p.getX(i) / 0.05 + 0.5) * Math.PI)); }
    pg.computeVertexNormals();
    wristJ.add(new THREE.Mesh(pg, skin));
  }
  const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.04, 0.3, 24), skin); fore.scale.set(1.25, 1, 0.75); fore.position.y = -0.14; hand.add(fore);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.26, 28, 1, true), cloth); sleeve.scale.set(1.2, 1, 0.85); sleeve.position.y = -0.28; sleeve.material.side = THREE.DoubleSide; hand.add(sleeve);
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.007, 10, 40), cloth); cuff.rotation.x = Math.PI / 2; cuff.scale.set(1.2, 0.85, 1); cuff.position.y = -0.15; hand.add(cuff);
  const fingers = [];
  const FD = [[0.03, [0.044, 0.027, 0.021], 0.0088, -0.06], [0.01, [0.049, 0.03, 0.022], 0.0092, 0.0], [-0.01, [0.046, 0.028, 0.021], 0.0086, 0.04], [-0.03, [0.035, 0.021, 0.018], 0.0076, 0.1]];
  FD.forEach(([x, L, rad, splay], fi) => {
    let par = new THREE.Group(); par.position.set(x, 0.094 - Math.abs(x) * 0.25, 0); par.rotation.z = splay; wristJ.add(par);
    const joints = [];
    L.forEach((len, k) => {
      const j = k === 0 ? par : new THREE.Group(); if (k > 0) { j.position.y = L[k - 1]; par.add(j); }
      const rr = rad * (1 - k * 0.08);
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(rr, len * 0.8, 6, 12), skin); seg.position.y = len / 2; seg.scale.z = 0.86; j.add(seg);
      if (k === 0) { const kn = new THREE.Mesh(new THREE.SphereGeometry(rr * 1.15, 12, 8), skin); kn.position.set(0, 0, 0.004); j.add(kn); }
      if (k === 2) { const nl = new THREE.Mesh(new THREE.SphereGeometry(rr * 0.85, 12, 8), nailM); nl.scale.set(1, 1.3, 0.35); nl.position.set(0, len * 0.62, rr * 0.72); j.add(nl); }
      joints.push(j); par = j;
    });
    fingers.push({ joints, fi });
  });
  const thumb = []; {
    let par = new THREE.Group(); par.position.set(0.04, 0.022, -0.004); par.rotation.set(0.0, -0.5, -0.95); wristJ.add(par);
    [0.036, 0.03, 0.025].forEach((len, k) => {
      const j = k === 0 ? par : new THREE.Group(); if (k > 0) { j.position.y = [0.036, 0.03][k - 1]; par.add(j); }
      const rr = 0.0118 * (1 - k * 0.08);
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(rr, len * 0.8, 6, 12), skin); seg.position.y = len / 2; seg.scale.z = 0.88; j.add(seg);
      if (k === 2) { const nl = new THREE.Mesh(new THREE.SphereGeometry(rr * 0.85, 12, 8), nailM); nl.scale.set(1, 1.3, 0.35); nl.position.set(0, len * 0.6, rr * 0.72); j.add(nl); }
      thumb.push(j); par = j;
    });
  }
  const handLight = new THREE.PointLight(0xfff1e6, 0.9, 3, 1.5); handLight.position.set(-0.2, 0.25, 0.2); cam.add(handLight);

  // ---------- HUD overlay: projected anatomy labels ----------
  const root = canvas.parentElement;
  const hud = document.createElement("div");
  hud.style.cssText = "position:absolute;inset:0;z-index:9;pointer-events:none";
  hud.innerHTML = `<style>
.lb{position:absolute;width:330px;padding:12px 16px;background:rgba(3,20,26,.84);border:1px solid rgba(63,224,208,.35);border-radius:10px;font-family:'JetBrains Mono',monospace;color:#E6FBF8;opacity:0}
.lb b{display:block;font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:31px;line-height:1.05;letter-spacing:.02em}
.lb span{display:block;font-size:21px;color:#9FF5EC;margin-top:4px}
.lb.L{border-left:6px solid var(--c)}.lb.R{border-right:6px solid var(--c);text-align:right}
</style><svg width="1080" height="1920" style="position:absolute;inset:0" id="lbsvg"></svg>`;
  root.appendChild(hud);
  const svg = hud.querySelector("#lbsvg");
  const LBL = [
    { t: "NUKLEUS SUBTALAMIKUS", s: "target utama", p: STN[0], side: "R", y: 760, a: E.stn - 0.1, b: E.elek + 0.4, c: AMBER },
    { t: "GLOBUS PALIDUS", s: "target lain", p: GPI[1], side: "L", y: 900, a: E.glob - 0.1, b: E.elek + 0.4, c: GOLD },
    { t: "4 CINCIN KONTAK", s: "ujung elektroda", p: TIP.clone().addScaledVector(DIR, -0.06), side: "R", y: 930, a: E.cincin - 0.1, b: s.s4 - 0.2, c: HOLO },
    { t: "KABEL DI BAWAH KULIT", s: "lewat belakang telinga", p: wireC.getPointAt(0.42), side: "R", y: 720, a: E.telinga - 0.2, b: E.inilah + 1.2, c: HOLO },
    { t: "STIMULATOR", s: "di bawah tulang selangka", p: IPG, side: "L", y: 820, a: E.stim - 0.1, b: s.s5 - 0.2, c: HOLO },
    { t: "SIRKUIT GERAK", s: "berdenyut serempak", p: loopC.getPointAt(0.12), side: "L", y: 760, a: E.serempak - 0.1, b: E.stimul6 - 0.1, c: "#FFC2E2" },
    { t: "SIRKUIT GERAK", s: "tidak lagi serempak", p: loopC.getPointAt(0.12), side: "L", y: 760, a: E.stimul6, b: s.s7 - 0.2, c: HOLOS },
    { t: "SENSOR BETA", s: "elektroda ikut mendengar", p: TIP.clone().addScaledVector(DIR, -0.04), side: "R", y: 820, a: E.dengar - 0.1, b: s.s8 - 0.2, c: HOLO },
  ];
  LBL.forEach((L) => {
    L.el = document.createElement("div"); L.el.className = "lb " + L.side; L.el.style.setProperty("--c", L.c);
    L.el.innerHTML = `<b>${L.t}</b><span>${L.s}</span>`;
    L.el.style.left = (L.side === "L" ? 56 : 1080 - 110 - 330) + "px"; L.el.style.top = L.y + "px"; hud.appendChild(L.el);
    L.ln = document.createElementNS("http://www.w3.org/2000/svg", "polyline"); L.ln.setAttribute("fill", "none"); L.ln.setAttribute("stroke", L.c); L.ln.setAttribute("stroke-width", "2.5"); svg.appendChild(L.ln);
    L.dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); L.dot.setAttribute("r", "8"); L.dot.setAttribute("fill", "none"); L.dot.setAttribute("stroke", L.c); L.dot.setAttribute("stroke-width", "3"); svg.appendChild(L.dot);
  });
  const scopes = () => root.querySelectorAll(".scope polyline");
  const meters = () => root.querySelectorAll(".bmeter i");

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.45, 0.5, 0.78);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  // ---------- state functions (pure in t) ----------
  const ON_S1 = E.hent + 0.15;
  function stimLevel(t) {
    if (t < s.s2) return ramp(t, ON_S1 - 0.1, ON_S1 + 0.25);
    if (t < E.nyala) return 1 - ramp(t, s.s2, s.s2 + 0.5);
    if (t < s.s6) return ramp(t, E.nyala, E.nyala + 0.25);
    if (t < s.s7) return ramp(t, E.stimul6 - 0.1, E.stimul6 + 0.3);
    if (t < s.s8) return 0.55 + 0.4 * (0.5 + 0.5 * Math.sin((t - s.s7) * 1.9));
    return 1;
  }
  function tremorAmp(t) {
    if (t < s.s2) return 1 - ramp(t, ON_S1, ON_S1 + 1.4);
    if (t < E.nyala) return 1;
    return 1 - ramp(t, E.nyala + 0.1, E.nyala + 1.6);
  }
  function betaAmp(t) {
    if (t < s.s7) {
      const st = stimLevel(t);
      return 1 - 0.8 * (t >= s.s6 ? ramp(t, E.stimul6, E.stimul6 + 1.2) : st);
    }
    if (t < s.s8) return 0.25 + 0.4 * Math.pow(0.5 + 0.5 * Math.sin((t - s.s7) * 1.9 + 0.9), 2);
    return 0.2;
  }
  const handVis = (t) => {
    if (t < s.s2) return 1 - ramp(t, s.s2 - 0.6, s.s2);
    if (t >= E.sadar - 0.6 && t < s.s4 + 0.2) return ramp(t, E.sadar - 0.6, E.sadar) * (1 - ramp(t, s.s4 - 0.3, s.s4 + 0.2));
    if (t >= s.s5 - 0.3 && t < s.s6) return ramp(t, s.s5 - 0.3, s.s5 + 0.3) * (1 - ramp(t, s.s6 - 0.5, s.s6));
    return 0;
  };
  const beta = (tt, a) => a * (Math.sin(tt * 6.283 * 19) * 0.6 + Math.sin(tt * 6.283 * 24.3 + 1) * 0.28 + Math.sin(tt * 6.283 * 14.2 + 2) * 0.22) + 0.08 * Math.sin(tt * 6.283 * 61 + Math.sin(tt * 40));

  // ---------- camera ----------
  const T = (k, d) => k + d;
  const CAMK = [
    [0, 1.9, 1.55, 6.4, 0.05, 1.42, 0],
    [s.s2 - 0.4, 1.2, 1.75, 5.6, 0.05, 1.5, 0],
    [T(s.s2, 6), -2.6, 2.3, 5.2, 0, 1.6, 0],
    [s.s3, -4.3, 2.1, 2.2, 0, 1.75, 0],
    [E.stn, -2.1, 2.2, 1.9, 0.02, 1.95, 0],
    [E.masuk + 0.4, -1.55, 2.35, 1.75, 0.1, 2.05, 0.05],
    [E.sadar, -1.7, 2.0, 2.3, 0.05, 1.82, 0],
    [s.s4, 1.6, 2.35, 2.2, 0.35, 1.95, -0.05],
    [E.telinga + 0.4, 2.3, 1.75, 1.2, 0.45, 1.55, -0.1],
    [E.stim + 0.3, 2.0, 0.95, 2.6, 0.38, 0.95, 0.2],
    [s.s5, 1.7, 1.35, 4.3, 0.0, 1.32, 0.3],
    [E.tremor, 1.25, 1.5, 3.7, 0.0, 1.45, 0.3],
    [s.s6, 1.9, 2.25, 2.6, 0.1, 2.0, 0.0],
    [T(s.s6, 7), 1.2, 2.35, 2.5, 0.12, 1.98, 0.0],
    [s.s7, -0.6, 2.15, 2.0, 0.1, 1.98, 0.0],
    [T(s.s7, 5), -2.3, 1.6, 4.2, -0.35, 1.32, 0.3],
    [s.s8, -1.3, 1.8, 5.6, -0.2, 1.4, 0.2],
    [s.dur, 0.3, 2.3, 8.4, 0, 1.45, 0],
  ].sort((a, b) => a[0] - b[0]);
  const camT = track(CAMK);
  const tmp = new THREE.Vector3(), prj = new THREE.Vector3();

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const st = stimLevel(t), tr = tremorAmp(t), ba = betaAmp(t);
    bustU.uT.value = t; brainU.uT.value = t;
    // brain synchrony glow: strong in s6 before stimulation, gentle elsewhere
    const s6 = t >= s.s6 && t < s.s7;
    brainU.uSync.value = s6 ? 1 - ramp(t, E.stimul6, E.stimul6 + 1) : 0.25 * ba;
    rings.forEach((R, i) => { R.m.rotation.z = t * R.sp + i; });
    floor.rotation.z = t * 0.06;
    for (let i = 0; i < NMO; i++) { const d = MO[i], a = d.a + t * 0.035; moP[i * 3] = Math.cos(a) * d.rad; moP[i * 3 + 1] = d.y + Math.sin(t * 0.5 + d.ph) * 0.08; moP[i * 3 + 2] = Math.sin(a) * d.rad; }
    moG.attributes.position.needsUpdate = true;

    // nuclei pulse: targeting highlights in s3, beta throb otherwise
    const tgt = t >= s.s3 && t < s.s4;
    glows.forEach((g, i) => {
      const isSTN = i < 2;
      const hl = tgt ? (isSTN ? ramp(t, E.stn - 0.2, E.stn + 0.3) : ramp(t, E.glob - 0.2, E.glob + 0.3)) : 0;
      const throb = 0.5 + 0.5 * Math.sin(t * 6.283 * 1.2 + i);
      g.sp.material.opacity = 0.22 + 0.3 * hl + 0.14 * ba * throb;
      g.sp.scale.setScalar(0.1 + 0.08 * hl + 0.03 * ba * throb);
    });

    // lead insertion: slides down its trajectory during s3, stays implanted afterwards
    const ins = t < s.s3 ? 1 : t < s.s4 ? eout(ramp(t, E.elek + 0.2, E.masuk + 1.0)) : 1;
    const vis = t < s.s2 ? 1 : t < s.s3 ? 0 : ramp(t, E.elek - 0.3, E.elek + 0.1);
    leadG.visible = vis > 0.01;
    leadG.position.copy(TIP).addScaledVector(DIR, -(1 - ins) * 0.9);
    burr.visible = leadG.visible;
    contactM.emissiveIntensity = (t >= s.s3 && t < s.s4 ? 0.9 * ramp(t, E.cincin - 0.2, E.cincin + 0.3) : 0) + 1.6 * st * (0.75 + 0.25 * Math.sin(t * 6.283 * 8));
    field.material.uniforms.uA.value = 0.9 * st * (0.8 + 0.2 * Math.sin(t * 6.283 * 6));
    field.scale.setScalar(0.1 + 0.03 * st);

    // wire reveal in s4 (hidden while the lead is being placed in s2-s3)
    const wv = t < s.s2 ? 1 : t < s.s4 ? 0 : t < s.s5 ? ramp(t, E.kabel, E.stim + 0.2) : 1;
    wire.visible = wv > 0.001;
    wireG.setDrawRange(0, Math.floor(wireIdx * wv / 3) * 3);
    wireM.emissiveIntensity = 0.3 + 0.6 * st;
    const iv = t < s.s2 ? 1 : t < s.s4 ? 0 : t < s.s5 ? ramp(t, E.stim - 0.4, E.stim + 0.1) : 1;
    ipgG.visible = iv > 0.01; ipgG.scale.setScalar(0.6 + 0.4 * eout(iv));
    ipgGlow.material.opacity = 0.15 + 0.55 * st;
    const pr = (t * 1.3) % 1; ipgRing.scale.setScalar(0.8 + pr * 1.6); ipgRing.material.opacity = st * (1 - pr) * 0.8;

    // pulse train
    for (let i = 0; i < NPU; i++) {
      const u = ((i / NPU) + t * 0.55) % 1;
      pathAt(u, tmp); puP[i * 3] = tmp.x; puP[i * 3 + 1] = tmp.y; puP[i * 3 + 2] = tmp.z;
      puS[i] = 0.035; puA[i] = st * (i % 3 === 0 ? 1 : 0.45) * (wv > 0.99 ? 1 : 0);
    }
    puG.attributes.position.needsUpdate = puG.attributes.al.needsUpdate = puG.attributes.sz.needsUpdate = true;

    // motor circuit: bunched (synchronised) vs evenly spread
    const lpOn = s6 ? ramp(t, s.s6 - 0.2, s.s6 + 0.6) : t >= s.s7 && t < s.s8 ? 0.6 * (1 - ramp(t, s.s7 + 3, s.s7 + 5)) : 0;
    const syn = s6 ? 1 - ramp(t, E.stimul6, E.stimul6 + 1.2) : 0.3;
    for (let i = 0; i < NLP; i++) {
      const d = LJ[i];
      const bunched = (t * 0.32 + d.j * 0.06 + Math.floor(d.b * 3) / 3) % 1;
      const spread = (d.b + t * 0.08) % 1;
      const u = syn * bunched + (1 - syn) * spread;
      loopC.getPointAt(((u % 1) + 1) % 1, tmp).add(d.o);
      lpP[i * 3] = tmp.x; lpP[i * 3 + 1] = tmp.y; lpP[i * 3 + 2] = tmp.z;
      lpS[i] = 0.018 + 0.012 * syn; lpA[i] = lpOn * (0.4 + 0.6 * syn);
    }
    lpG.attributes.position.needsUpdate = lpG.attributes.al.needsUpdate = lpG.attributes.sz.needsUpdate = true;
    loopLine.material.opacity = lpOn * 0.35;

    // MRI slices and crosshair in s3
    const mriOn = t >= s.s3 - 0.2 && t < E.masuk + 1.5 ? ramp(t, E.mri - 0.3, E.mri + 0.5) * (1 - ramp(t, E.masuk, E.masuk + 1.2)) : 0;
    const scanSweep = t >= s.s2 && t < s.s3 ? ramp(t, s.s2 + 1, s.s3) : 1;
    slices.forEach((m, i) => {
      const k = ramp(t, E.mri - 0.2 + i * 0.35, E.mri + 0.4 + i * 0.35);
      m.material.opacity = mriOn * k * 0.3;
      const conv = ramp(t, E.mri + 1.2, E.stn);
      m.position.set(i === 2 ? THREE.MathUtils.lerp(0.4, STN[0].x, conv) : 0, i === 0 ? THREE.MathUtils.lerp(2.3, STN[0].y, conv) : 1.95, i === 1 ? THREE.MathUtils.lerp(0.4, STN[0].z, conv) : -0.03);
    });
    // scanning ring in s2 (MRI-like sweep over the head)
    crossM.opacity = mriOn * ramp(t, E.stn - 0.6, E.stn) * 0.9;
    cross.position.copy(STN[0]); cross.scale.setScalar(0.9 * (1 - 0.6 * ramp(t, E.stn - 0.6, E.stn + 0.6)));
    const retT = t < E.glob ? STN[0] : GPI[0];
    reticle.position.copy(retT); reticle.lookAt(cam.position);
    reticle.material.opacity = mriOn * ramp(t, E.stn - 0.3, E.stn + 0.2) * (0.7 + 0.3 * Math.sin(t * 9));
    reticle.scale.setScalar(1 + 0.5 * (1 - ramp(t, E.stn - 0.3, E.stn + 0.6)));
    void scanSweep;

    // tablet screen mode
    tab.visible = t < s.s2 - 0.2 || t >= s.s5;
    scrM.map = t >= s.s7 && t < s.s8 ? TAB.adapt : st > 0.5 ? TAB.on : TAB.off;

    // camera
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld();

    // hand: rest tremor ~5 Hz (pronation-supination + wrist flex + finger roll), settles with stimulation
    const hv = handVis(t);
    hand.visible = hv > 0.01;
    const inS3 = t >= s.s3 && t < s.s4;
    hand.position.set(0.118 + (1 - hv) * 0.12, inS3 ? -0.03 : -0.065, -0.95);
    hand.rotation.set(-0.15, 0.25, 0.5);
    hand.scale.setScalar(0.85);
    const w = t * 6.283 * 5.1;
    const ta = (inS3 ? 1 : tr) * (0.85 + 0.15 * Math.sin(t * 1.7));
    hand.rotateY(0.2 * ta * Math.sin(w));
    wristJ.rotation.set(0.12 * ta * Math.sin(w + 1.2) - 0.18, 0, 0.05 * ta * Math.sin(w + 2.1));
    fingers.forEach((f) => {
      const base = [-0.18, -0.3, -0.22].map((v) => v * (1 + f.fi * 0.22));
      f.joints.forEach((j, k) => { j.rotation.x = base[k] + 0.12 * ta * Math.sin(w + k * 0.6 + f.fi * 0.3); });
    });
    thumb.forEach((j, k) => { j.rotation.x = k === 0 ? 0 : -0.2 - 0.15 * ta * Math.sin(w + 0.8); });

    // HUD labels
    LBL.forEach((L) => {
      const o = ramp(t, L.a, L.a + 0.3) * (1 - ramp(t, L.b - 0.3, L.b));
      prj.copy(L.p).project(cam);
      const x = (prj.x + 1) / 2 * W, y = (1 - prj.y) / 2 * H;
      const okp = prj.z < 1 && x > 0 && x < W && y > 0 && y < H;
      const op = okp ? o : 0;
      L.el.style.opacity = op.toFixed(3);
      L.el.style.transform = `translateX(${(L.side === "L" ? -1 : 1) * 30 * (1 - o)}px)`;
      const cx = L.side === "L" ? 56 + 330 : 1080 - 110 - 330, cy = L.y + 36;
      const mx = L.side === "L" ? cx + 40 : cx - 40;
      L.ln.setAttribute("points", `${cx},${cy} ${mx},${cy} ${x.toFixed(1)},${y.toFixed(1)}`);
      L.ln.setAttribute("opacity", op.toFixed(3)); L.dot.setAttribute("opacity", op.toFixed(3));
      L.dot.setAttribute("cx", x.toFixed(1)); L.dot.setAttribute("cy", y.toFixed(1));
    });
    // oscilloscope traces in panels (.scope) and beta meters (.bmeter)
    const sc = scopes();
    if (sc.length) {
      let pts = "";
      for (let i = 0; i <= 220; i++) { const x = i / 220; const tt = t - 0.6 + x * 0.6; pts += `${(x * 600).toFixed(1)},${(60 - 46 * beta(tt, ba)).toFixed(1)} `; }
      sc.forEach((p) => p.setAttribute("points", pts));
    }
    meters().forEach((m) => { m.style.transform = `scaleX(${(0.08 + 0.92 * ba).toFixed(3)})`; });

    comp.render();
  };
}
