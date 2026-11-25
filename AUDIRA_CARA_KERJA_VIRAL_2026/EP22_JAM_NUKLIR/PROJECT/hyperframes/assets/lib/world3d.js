// EP22 JAM NUKLIR. GLASSCRAFT look: a black studio void with big saturated light discs (blue, amber, green, magenta)
// seen through frosted glass slabs, clear CaF2-like crystals, golden thorium nuclei, a stylised violet UV beam,
// and a dark reflective floor (real planar mirror pass, softly blurred). Cyan + magenta rim lights ride with the camera.
// Stations along +x, one continuous glide: hero clock (X0) -> oscillator ladder (XL) -> glass atom + energy ladder (XA, XE)
// -> feedback-locked crystal (XK) -> stability rail + pillars (XS) -> uses: dark-matter wave + globe (XU), s8 pulls back.
// Every value is a pure function of t (seeded PRNG only).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const X0 = 0, XL = 22, XA = 44, XE = 53, XK = 72, XS = 94, XU = 118;
const ZOOM = 1.65;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));

function rbox(w, h, d, r, seg = 4) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r * 0.98, bevelThickness: r, bevelSegments: seg, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
  return g;
}
function rcyl(rad, h, bev, seg = 48) {
  const pts = [new THREE.Vector2(0, -h / 2)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, -h / 2 + bev + Math.sin(a) * bev)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(rad - bev + Math.cos(a) * bev, h / 2 - bev + Math.sin(a) * bev)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, seg);
}
const dotTex = () => canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.22, "rgba(255,255,255,.6)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });
const FONT = '"Manrope", "Space Grotesk", "Segoe UI", Arial, sans-serif';

function textSprite(txt, color = "#ffffff", px = 64, sub = null) {
  const tex = canvasTex(640, 200, (c, w, h) => {
    c.fillStyle = "rgba(18,20,26,.62)"; c.beginPath(); c.roundRect(8, 24, w - 16, h - 48, 60); c.fill();
    c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = 2; c.stroke();
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = color;
    c.font = `800 ${px}px ${FONT}`; c.fillText(txt, w / 2, sub ? h / 2 - 16 : h / 2 + 2);
    if (sub) { c.font = `500 30px ${FONT}`; c.fillStyle = "rgba(230,236,245,.85)"; c.fillText(sub, w / 2, h / 2 + 34); }
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  sp.renderOrder = 30; sp.scale.set(2.4, 0.75, 1);
  return sp;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 600);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    reaktor: A_("s1:reaktor", 1.4), inti1: A_("s1:inti", 3.4),
    okt: A_("s2:Oktober", s.s2 + 0.4), wien: A_("s2:Wien", s.s2 + 3), mengoreksi: A_("s2:mengoreksi", s.s2 + 6), j24: A_("s2:24", s.s2 + 8), beijing: A_("s2:Beijing", s.s2 + 11),
    bandul: A_("s3:Bandul", s.s3 + 3.5), kuarsa: A_("s3:Kuarsa", s.s3 + 6), cesium: A_("s3:cesium", s.s3 + 11), atom3: A_("s3:atom", s.s3 + 10),
    elektron: A_("s4:elektron", s.s4 + 0.4), terganggu: A_("s4:terganggu", s.s4 + 2), inti4: A_("s4:Inti", s.s4 + 3), terlindung: A_("s4:terlindung", s.s4 + 6), gamma: A_("s4:gamma", s.s4 + 9), thorium4: A_("s4:Thorium", s.s4 + 10), uv: A_("s4:ultraviolet", s.s4 + 12),
    trili: A_("s5:Triliunan", s.s5), kristal: A_("s5:kristal", s.s5 + 2), menyerap: A_("s5:menyerap", s.s5 + 5), pas: A_("s5:pas", s.s5 + 7), meleng: A_("s5:Melenceng", s.s5 + 8), sensor: A_("s5:sensor", s.s5 + 9), didorong: A_("s5:didorong", s.s5 + 10.5), terkunci: A_("s5:terkunci", s.s5 + 12.5),
    detik6: A_("s6:detik", s.s6 + 2.5), juta: A_("s6:juta", s.s6 + 4), kestabilan: A_("s6:kestabilan", s.s6 + 5.5), optik: A_("s6:optik", s.s6 + 8), beijing6: A_("s6:Beijing", s.s6 + 10), stabil: A_("s6:stabil", s.s6 + 12),
    heboh: A_("s7:heboh", s.s7 + 0.6), peka: A_("s7:peka", s.s7 + 3), materi: A_("s7:materi", s.s7 + 6.5), belum: A_("s7:belum", s.s7 + 8), navigasi: A_("s7:navigasi", s.s7 + 10.5),
    detik8: A_("s8:Detik", s.s8), inti8: A_("s8:inti", s.s8 + 2.5),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(0x040406);
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.55;
  S.add(new THREE.AmbientLight(0x1a1d26, 1.2));
  const rig = new THREE.Group(); S.add(rig);
  const keyL = new THREE.DirectionalLight(0xffffff, 2.0); keyL.position.set(3, 8, 4); keyL.target.position.set(0, 0, -12); rig.add(keyL, keyL.target);
  const cyanL = new THREE.PointLight(0x38d6ff, 40, 30, 1.5); cyanL.position.set(-6, 2, -12); rig.add(cyanL);
  const magL = new THREE.PointLight(0xe07fe8, 34, 30, 1.5); magL.position.set(6, 1, -11); rig.add(magL);
  const dot = dotTex();

  // ---------- materials ----------
  const glass = (color = 0xeef5ff, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.04, metalness: 0, transmission: 1, thickness: 1.4, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.35, iridescenceIOR: 1.3, specularIntensity: 1, envMapIntensity: 1.2, ...o });
  const frost = (color = 0xe6ebf3, o = {}) => glass(color, { roughness: 0.42, thickness: 0.8, iridescence: 0.1, ...o });
  const obsid = (color = 0x14161b, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, ...o });
  const glowM = (color, op = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const MAT = {
    crystal: glass(0xffffff, { thickness: 0.9, roughness: 0.08, iridescence: 0.12, dispersion: 1.5, attenuationColor: new THREE.Color(0xe4e9ff), attenuationDistance: 30, envMapIntensity: 1.6 }),
    frost: frost(), frostDark: frost(0x9aa3b4, { roughness: 0.5 }), pedestal: obsid(),
    gold: new THREE.MeshPhysicalMaterial({ color: 0xf6b73c, roughness: 0.22, metalness: 0.55, clearcoat: 1, emissive: 0x6a3a00, emissiveIntensity: 0.5 }),
    pearl: new THREE.MeshPhysicalMaterial({ color: 0xe8ecf6, roughness: 0.25, metalness: 0.1, clearcoat: 1, emissive: 0x20242c }),
    quartz: glass(0xffd9e8, { attenuationColor: new THREE.Color(0xffb3cf), attenuationDistance: 2 }),
    amber: glass(0xffd27a, { attenuationColor: new THREE.Color(0xffb020), attenuationDistance: 1.2 }),
    tube: glass(0xffffff, { thickness: 0.3 }),
  };
  const glowSprite = (color, sc = 1, op = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.scale.setScalar(sc); return sp; };
  const ptsMat = (size) => new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false, sizeAttenuation: true });
  const mesh = (g, m, x = 0, y = 0, z = 0, parent = S) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o; };
  const label = (txt, color, x, y, z, sc = 1, sub = null, parent = S) => { const sp = textSprite(txt, color, 64, sub); sp.position.set(x, y, z); sp.scale.multiplyScalar(sc); parent.add(sp); return sp; };
  function pedestal(x, z, rad = 1.3, parent = S) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    mesh(rcyl(rad, 0.5, 0.12), MAT.pedestal, 0, 0.25, 0, g);
    const ring = mesh(new THREE.TorusGeometry(rad * 0.92, 0.022, 8, 96), glowM(0x9ad8ff, 0.8), 0, 0.51, 0, g); ring.rotation.x = Math.PI / 2;
    return g;
  }
  function nucleus(n, rr, seed, parent) {
    const g = new THREE.Group(); parent.add(g); const rnd = mulberry(seed); const geo = new THREE.SphereGeometry(rr, 20, 14);
    for (let i = 0; i < n; i++) { const y = 1 - (2 * (i + 0.5)) / n, rad = Math.sqrt(1 - y * y), a = i * 2.39996; const R = rr * 1.25 * Math.cbrt((i + 1) / n) * 1.6; mesh(geo, i % 2 ? MAT.pearl : MAT.gold, Math.cos(a) * rad * R + (rnd() - 0.5) * rr * 0.3, y * R, Math.sin(a) * rad * R, g); }
    const halo = glowSprite(0xffc04a, rr * 9, 0.35); halo.material.depthTest = false; halo.renderOrder = 11; g.add(halo); g.userData.halo = halo;
    return g;
  }
  // ---------- background light discs (the GLASSCRAFT cover signature), parallax with the camera ----------
  const discs = new THREE.Group(); S.add(discs);
  const DISC = [[0x2f8ff0, -7, 9, -30, 7.5], [0xe8c254, 8, 12, -34, 6.5], [0x22d36a, -9, 1.5, -26, 5], [0xd77be6, 9, 1, -28, 6.5], [0x2f8ff0, 16, 6, -36, 5], [0xe8c254, -17, 5, -34, 5.5]];
  DISC.forEach(([c, x, y, z, rad]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(rad, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.62), toneMapped: false })); m.position.set(x, y, z); discs.add(m); });

  // ---------- reflective floor (planar mirror pass) ----------
  const mirrorRT = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
  const vcam = new THREE.PerspectiveCamera();
  const floorU = { tM: { value: mirrorRT.texture }, tMat: { value: new THREE.Matrix4() }, uCam: { value: v3(0, 0, 0) } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(420, 160), new THREE.ShaderMaterial({
    uniforms: floorU,
    vertexShader: "uniform mat4 tMat;varying vec4 vP;varying vec3 vW;void main(){vP=tMat*vec4(position,1.);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform sampler2D tM;uniform vec3 uCam;varying vec4 vP;varying vec3 vW;
void main(){float w=abs(vP.w)<1e-4?1e-4:vP.w;vec2 uv=clamp(vP.xy/w,0.,1.);vec3 r=vec3(0.);float o=.0028;
for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++)r+=texture2D(tM,uv+vec2(float(i),float(j))*o).rgb;r=min(r/25.,vec3(3.));
float d=length(vW.xz-uCam.xz);float f=1.-smoothstep(12.,48.,d);
vec2 g=abs(fract(vW.xz*.5)-.5);float ln=(1.-smoothstep(.0,.02,min(g.x,g.y)))*.012*f;
gl_FragColor=vec4(vec3(.011,.012,.016)*(.5+.5*f)+r*.4*f+ln,1.);}`,
  }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(60, 0, -30); S.add(floor);

  // ================= X0 hero clock =================
  const hero = new THREE.Group(); S.add(hero);
  pedestal(X0, 0, 1.4, hero);
  const crystal = mesh(rbox(2.0, 2.0, 2.0, 0.2), MAT.crystal, X0, 2.35, 0, hero);
  const RN = mulberry(22);
  const mkNuclei = (n, half, seed, size, parent) => {
    const rn = mulberry(seed); const g = new THREE.BufferGeometry(); const P = new Float32Array(n * 3), C = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { P[i * 3] = (rn() - 0.5) * 2 * half; P[i * 3 + 1] = (rn() - 0.5) * 2 * half; P[i * 3 + 2] = (rn() - 0.5) * 2 * half; C[i * 3] = 1; C[i * 3 + 1] = 0.72; C[i * 3 + 2] = 0.25; }
    g.setAttribute("position", new THREE.BufferAttribute(P, 3)); g.setAttribute("color", new THREE.BufferAttribute(C, 3));
    const p = new THREE.Points(g, ptsMat(size)); p.frustumCulled = false; p.renderOrder = 12; parent.add(p); return p;
  };
  const heroNuc = mkNuclei(60, 0.72, 5, 0.26, crystal);
  const heroGlow = glowSprite(0xffb540, 4.5, 0); crystal.add(heroGlow); heroGlow.material.depthTest = false; heroGlow.renderOrder = 11;
  // laser + beam
  const laserBox = (x, y, z, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); mesh(rbox(1.5, 0.75, 0.75, 0.16), obsid(0x1b1e25), 0, 0, 0, g); const ap = mesh(new THREE.CircleGeometry(0.15, 32), glowM(0xa98bff, 1), 0.76, 0, 0, g); ap.rotation.y = Math.PI / 2; mesh(rbox(0.5, 0.06, 0.6, 0.02), glowM(0x8b6bff, 0.6), -0.2, 0.39, 0, g); return g; };
  laserBox(X0 - 4.4, 2.35, 0, hero);
  const beam = (len, parent) => { const g = new THREE.Group(); parent.add(g); const core = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 12), glowM(0xc9b6ff, 1), 0, 0, 0, g); const halo = mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 16), glowM(0x7c4dff, 0.28), 0, 0, 0, g); core.rotation.z = halo.rotation.z = Math.PI / 2; g.userData = { core, halo }; return g; };
  const setBeam = (b, x0, x1, y, z, k) => { b.position.set((x0 + x1) / 2, y, z); b.scale.set(Math.max(0.001, x1 - x0), 1, 1); b.visible = k > 0.01; b.userData.core.material.opacity = k; b.userData.halo.material.opacity = 0.28 * k; };
  const heroBeam = beam(1, hero);
  // AUDIRA etched plate (frosted slab, discs glow through it)
  const plateTex = canvasTex(1024, 512, (c, w, h) => {
    c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillStyle = "rgba(255,255,255,.9)";
    c.font = `800 150px ${FONT}`; c.fillText("AUDIRA", 70, 220);
    c.font = `600 44px ${FONT}`; c.fillStyle = "rgba(235,240,250,.8)"; c.fillText("THORIUM 229 · JAM NUKLIR", 74, 310);
    c.font = `500 34px "JetBrains Mono", monospace`; c.fillStyle = "rgba(200,210,230,.65)"; c.fillText("ILUSTRASI · audira.my.id", 74, 380);
    c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 3; c.beginPath(); c.moveTo(74, 250); c.lineTo(560, 250); c.stroke();
  });
  const mkPlate = (x, y, z, ry, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); mesh(rbox(4.8, 2.4, 0.14, 0.12), MAT.frost, 0, 0, 0, g); const t = mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: plateTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.92 }), 0, 0, 0.2, g); t.renderOrder = 5; return g; };
  mkPlate(X0 + 1.4, 4.1, -3.6, -0.18, hero);
  // a frosted slab low-left to give the discs something to blur through
  mesh(rbox(3.4, 4.2, 0.14, 0.14), MAT.frost, X0 - 3.6, 2.4, -5.2, hero).rotation.y = 0.35;
  // reactor ghost (the myth) that dissolves into the nucleus particles
  const TWX = X0 + 3.3, TWZ = -0.9;
  const towerPts = [];
  for (let i = 0; i <= 20; i++) { const y = (i / 20) * 3.4; towerPts.push(new THREE.Vector2(0.62 + 0.55 * Math.pow((y - 2.4) / 2.4, 2), y)); }
  const towerM = new THREE.MeshPhysicalMaterial({ color: 0xff8a8a, roughness: 0.3, transparent: true, opacity: 0.55, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const tower = mesh(new THREE.LatheGeometry(towerPts, 48), towerM, TWX, 0, TWZ, hero);
  const noRing = mesh(new THREE.TorusGeometry(1.5, 0.06, 10, 80), glowM(0xff4060, 0.9), TWX, 1.8, TWZ + 0.4, hero);
  const noBar = mesh(new THREE.BoxGeometry(3.0, 0.11, 0.05), glowM(0xff4060, 0.9), TWX, 1.8, TWZ + 0.4, hero); noBar.rotation.z = -Math.PI / 4;
  const NP = 220, tpSrc = [], tpDst = [];
  for (let i = 0; i < NP; i++) { const y = RN() * 3.4, a = RN() * 6.283, rr = 0.62 + 0.55 * Math.pow((y - 2.4) / 2.4, 2); tpSrc.push(v3(TWX + Math.cos(a) * rr, y, TWZ + Math.sin(a) * rr)); tpDst.push(v3(X0 + (RN() - 0.5) * 1.4, 2.35 + (RN() - 0.5) * 1.4, (RN() - 0.5) * 1.4)); }
  const tpG = new THREE.BufferGeometry(); tpG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NP * 3), 3)); tpG.setAttribute("color", new THREE.BufferAttribute(new Float32Array(NP * 3).fill(1), 3));
  const tpP = new THREE.Points(tpG, ptsMat(0.14)); tpP.frustumCulled = false; hero.add(tpP);
  // 24 h ring
  const ring24 = new THREE.Group(); ring24.position.set(X0, 2.35, 0); ring24.rotation.x = -0.32; hero.add(ring24);
  const ringT = mesh(new THREE.TorusGeometry(2.25, 0.03, 10, 160), MAT.tube, 0, 0, 0, ring24); ringT.rotation.x = Math.PI / 2;
  const ticks = []; const tickG = rbox(0.1, 0.1, 0.34, 0.04, 2);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const m = mesh(tickG, glowM(0x7fe7ff, 0.15), Math.sin(a) * 2.25, 0, -Math.cos(a) * 2.25, ring24); m.rotation.y = -a; ticks.push(m); }
  const hand = mesh(new THREE.BoxGeometry(0.05, 0.05, 2.1), glowM(0x7fe7ff, 0.9), 0, 0, 0, ring24); hand.geometry.translate(0, 0, -1.05);
  const tabW = mkTablet("WINA", "TU Wien + PTB", X0 - 2.75, 1.25, 1.5, 0.3), tabB = mkTablet("BEIJING", "hari yang sama", X0 + 2.75, 1.25, 1.5, -0.3);
  function mkTablet(t1, t2, x, y, z, ry) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; hero.add(g);
    mesh(rbox(2.3, 1.1, 0.12, 0.1), MAT.frostDark, 0, 0, 0, g);
    const tx = canvasTex(512, 256, (c, w, h) => { c.textAlign = "center"; c.fillStyle = "#fff"; c.font = `800 82px ${FONT}`; c.fillText(t1, w / 2, 120); c.font = `500 40px ${FONT}`; c.fillStyle = "rgba(225,232,245,.85)"; c.fillText(t2, w / 2, 190); });
    const p = mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0.2, g); p.renderOrder = 5;
    return g;
  }

  // ================= XL oscillator ladder =================
  const lad = new THREE.Group(); S.add(lad);
  const PX = XL - 4.4, QX = XL, CX = XL + 4.4;
  pedestal(PX, 0, 1.2, lad); pedestal(QX, 0, 1.0, lad); pedestal(CX, 0, 1.2, lad);
  // pendulum
  mesh(rcyl(0.07, 3.6, 0.03), MAT.tube, PX - 0.9, 2.3, 0, lad); mesh(rcyl(0.07, 3.6, 0.03), MAT.tube, PX + 0.9, 2.3, 0, lad);
  const bar = mesh(rbox(2.0, 0.14, 0.14, 0.06), MAT.tube, PX, 4.1, 0, lad);
  const pend = new THREE.Group(); pend.position.set(PX, 4.05, 0); lad.add(pend);
  mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 8), MAT.gold, 0, -1.2, 0, pend);
  mesh(new THREE.SphereGeometry(0.38, 40, 28), MAT.amber, 0, -2.55, 0, pend);
  const bobGlow = glowSprite(0xffb040, 1.6, 0.5); bobGlow.position.set(0, -2.55, 0); pend.add(bobGlow);
  // quartz tuning fork
  const fork = new THREE.Group(); fork.position.set(QX, 0.5, 0); lad.add(fork);
  mesh(rbox(1.1, 0.34, 0.34, 0.12), MAT.quartz, 0, 0.9, 0, fork); mesh(rbox(0.3, 0.8, 0.3, 0.1), MAT.quartz, 0, 0.4, 0, fork);
  const prL = mesh(rbox(0.3, 2.4, 0.3, 0.12), MAT.quartz, -0.4, 2.2, 0, fork), prR = mesh(rbox(0.3, 2.4, 0.3, 0.12), MAT.quartz, 0.4, 2.2, 0, fork);
  const ripples = [0, 1, 2].map(() => { const m = mesh(new THREE.TorusGeometry(1, 0.012, 6, 80), glowM(0xff9cc8, 0.5), 0, 2.6, 0, fork); m.rotation.x = Math.PI / 2; return m; });
  // cesium atom
  const cs = new THREE.Group(); cs.position.set(CX, 2.6, 0); lad.add(cs);
  nucleus(14, 0.11, 55, cs);
  const csOrb = [0, 1, 2].map((i) => { const g = new THREE.Group(); g.rotation.set(0.6 * i + 0.3, 0.9 * i, 0.4 * i); cs.add(g); const rr = 0.8 + i * 0.35; const ring = mesh(new THREE.TorusGeometry(rr, 0.012, 6, 120), glowM(0x7fe7ff, 0.35), 0, 0, 0, g); ring.rotation.x = Math.PI / 2; const e = mesh(new THREE.SphereGeometry(0.09, 16, 12), glowM(0x9ff0ff, 1), rr, 0, 0, g); const eg = glowSprite(0x38d6ff, 0.7, 0.9); e.add(eg); return { g, e, rr }; });
  const csShell = mesh(new THREE.SphereGeometry(1.75, 48, 32), frost(0xdff3ff, { roughness: 0.18, transparent: true, opacity: 0.4, transmission: 0.6, depthWrite: false }), 0, 0, 0, cs);
  const labP = label("1× / detik", "#FFD27A", PX, 5.0, 0.4, 0.8), labQ = label("32.768×", "#FFB3CF", QX, 5.0, 0.4, 0.8), labC = label("CESIUM", "#7FE7FF", CX, 5.0, 0.4, 0.8);

  // ================= XA glass atom + XE energy ladder =================
  const atomG = new THREE.Group(); S.add(atomG);
  pedestal(XA, 0, 1.3, atomG);
  const atom = new THREE.Group(); atom.position.set(XA, 3.1, 0); atomG.add(atom);
  const bigNuc = nucleus(26, 0.13, 77, atom);
  const shell = mesh(new THREE.SphereGeometry(2.5, 64, 40), glass(0xe4f2ff, { roughness: 0.12, thickness: 0.4, iridescence: 0.8 }), 0, 0, 0, atom);
  const aOrb = [0, 1, 2].map((i) => { const g = new THREE.Group(); g.rotation.set(1.1 * i + 0.2, 0.7 * i + 0.4, 0.3 * i); atom.add(g); const rr = 1.35 + 0.33 * i; const ring = mesh(new THREE.TorusGeometry(rr, 0.016, 6, 140), glowM(0x7fe7ff, 0.45), 0, 0, 0, g); ring.rotation.x = Math.PI / 2; const e = mesh(new THREE.SphereGeometry(0.12, 16, 12), glowM(0xbff6ff, 1), rr, 0, 0, g); e.add(glowSprite(0x38d6ff, 0.9, 0.9)); return { g, e, rr, ph: i * 2.1 }; });
  // stray field lines (disturbance)
  const fieldLines = [];
  for (let i = 0; i < 7; i++) {
    const pts = []; for (let k = 0; k <= 60; k++) { const x = -7 + (k / 60) * 14; pts.push(v3(x, Math.sin(x * 0.9 + i) * 0.35 + (i - 3) * 0.75, Math.cos(x * 0.6 + i * 1.7) * 0.6 + 0.4)); }
    const m = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.02, 6, false), glowM(i % 2 ? 0xff5a7a : 0x5aa8ff, 0.0), 0, 0, 0, atom); fieldLines.push(m);
  }
  const shieldGlow = glowSprite(0xffcf6a, 3.2, 0); atom.add(shieldGlow);
  const lab10k = label("10.000× lebih kecil", "#FFD27A", XA, 6.05, 0.6, 0.95);
  // energy ladder
  const ener = new THREE.Group(); S.add(ener);
  const colL = XE - 1.6, colR = XE + 1.6;
  mesh(rbox(1.5, 7.4, 0.3, 0.14), MAT.frost, colL, 3.9, -0.4, ener); mesh(rbox(1.5, 7.4, 0.3, 0.14), MAT.frost, colR, 3.9, -0.4, ener);
  const rung = (x, y, c) => mesh(rbox(1.2, 0.09, 0.09, 0.04, 2), glowM(c, 0.95), x, y, 0, ener);
  rung(colL, 0.8, 0xffd27a); rung(colL, 7.0, 0xffd27a); rung(colR, 0.8, 0xffd27a); rung(colR, 1.25, 0xffd27a);
  const boltPts = []; for (let k = 0; k <= 14; k++) boltPts.push(v3(colL + (k % 2 ? 0.28 : -0.28) * (k > 0 && k < 14 ? 1 : 0), 0.8 + (k / 14) * 6.2, 0.05));
  const bolt = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(boltPts, false, "catmullrom", 0.0), 80, 0.045, 6, false), glowM(0x9fe8ff, 0), 0, 0, 0, ener);
  const uvBridge = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12), glowM(0xb48cff, 0), colR, 1.025, 0.05, ener);
  const uvGlow = glowSprite(0x8b5cff, 1.4, 0); uvGlow.position.set(colR, 1.03, 0.2); ener.add(uvGlow);
  const labG = label("SINAR GAMMA", "#9FE8FF", colL, 4.0, 0.6, 0.75), labT = label("THORIUM 229", "#C9B6FF", colR, 2.15, 0.6, 0.8, "laser ultraviolet");

  // ================= XK feedback-locked crystal =================
  const lock = new THREE.Group(); S.add(lock);
  pedestal(XK, 0, 1.8, lock);
  const bigC = mesh(rbox(3.0, 3.0, 3.0, 0.26), MAT.crystal, XK, 2.75, 0, lock);
  { // faint lattice
    const n = 6, sp = 0.42, g = new THREE.SphereGeometry(0.035, 8, 6); const im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.5, toneMapped: false }), n * n * n); let k = 0; const d = new THREE.Object3D();
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) { d.position.set((a - 2.5) * sp, (b - 2.5) * sp, (c - 2.5) * sp); d.updateMatrix(); im.setMatrixAt(k++, d.matrix); }
    bigC.add(im);
  }
  const lockNuc = mkNuclei(46, 1.05, 9, 0.32, bigC);
  const lockGlow = glowSprite(0xffb540, 6.5, 0); bigC.add(lockGlow); lockGlow.material.depthTest = false; lockGlow.renderOrder = 11;
  const LZ = 0;
  laserBox(XK - 3.6, 2.75, LZ, lock);
  const sensor = new THREE.Group(); sensor.position.set(XK + 3.5, 2.75, LZ); lock.add(sensor);
  mesh(rbox(0.5, 1.4, 1.4, 0.16), obsid(0x1b1e25), 0.2, 0, 0, sensor);
  const sensRing = mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 64), glowM(0x7fe7ff, 1), -0.08, 0, 0, sensor); sensRing.rotation.y = Math.PI / 2;
  const kBeamIn = beam(1, lock), kBeamOut = beam(1, lock);
  const loopCurve = new THREE.CatmullRomCurve3([v3(XK + 3.6, 3.5, LZ), v3(XK + 3.3, 5.3, LZ), v3(XK, 6.1, LZ), v3(XK - 3.3, 5.3, LZ), v3(XK - 3.7, 3.4, LZ)]);
  const loopTube = mesh(new THREE.TubeGeometry(loopCurve, 120, 0.06, 10, false), MAT.tube, 0, 0, 0, lock);
  const arrowHead = mesh(new THREE.ConeGeometry(0.2, 0.45, 20), glowM(0x7fe7ff, 0.9), 0, 0, 0, lock);
  { const p = loopCurve.getPointAt(1), tg = loopCurve.getTangentAt(1); arrowHead.position.copy(p); arrowHead.quaternion.setFromUnitVectors(v3(0, 1, 0), tg); }
  const pulses = [0, 1, 2, 3, 4].map(() => { const g = glowSprite(0x7fe7ff, 0.55, 0); lock.add(g); return g; });
  // absorption plot on a frosted slab behind the crystal
  const plot = new THREE.Group(); plot.position.set(XK + 0.2, 6.2, -3.4); lock.add(plot);
  mesh(rbox(5.4, 2.2, 0.12, 0.12), MAT.frostDark, 0, 0, 0, plot);
  const plotTex = canvasTex(1024, 420, (c, w, h) => {
    c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 2; c.beginPath(); c.moveTo(60, 340); c.lineTo(w - 40, 340); c.stroke();
    c.shadowColor = "#ffcf6a"; c.shadowBlur = 16; c.strokeStyle = "#ffd27a"; c.lineWidth = 7; c.beginPath();
    for (let i = 0; i <= 200; i++) { const x = 60 + (i / 200) * (w - 100), u = (i / 200 - 0.5) / 0.08; const y = 340 - 250 / (1 + u * u); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.shadowBlur = 0; c.fillStyle = "rgba(230,236,248,.85)"; c.font = `600 34px ${FONT}`; c.textAlign = "left"; c.fillText("cahaya terserap", 70, 60); c.textAlign = "right"; c.fillText("frekuensi laser →", w - 50, 395);
    c.textAlign = "center"; c.fillStyle = "#ffd27a"; c.font = `800 38px ${FONT}`; c.fillText("PAS", w / 2 - 10, 60);
  });
  mesh(new THREE.PlaneGeometry(5.2, 2.13), new THREE.MeshBasicMaterial({ map: plotTex, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0.2, plot).renderOrder = 6;
  const needle = mesh(new THREE.BoxGeometry(0.05, 1.7, 0.02), glowM(0xb48cff, 1), 0, -0.05, 0.23, plot);
  const needleDot = glowSprite(0xb48cff, 0.5, 1); needleDot.position.set(0, 0, 0.25); plot.add(needleDot);
  const lockRing = mesh(new THREE.TorusGeometry(2.45, 0.04, 10, 140), glowM(0x4ade80, 0), XK, 2.75, 0, lock); lockRing.rotation.x = Math.PI / 2;
  const labLock = label("TERKUNCI", "#86EFAC", XK, 0.95, 2.3, 0.85);
  const labSens = label("SENSOR", "#7FE7FF", XK + 3.5, 1.6, 0.8, 0.7);

  // ================= XS stability =================
  const stab = new THREE.Group(); S.add(stab);
  const RX = XS - 2.5;
  mesh(rbox(0.7, 0.16, 64, 0.06, 2), MAT.frost, RX, 0.2, -26, stab);
  for (let i = 0; i < 30; i++) mesh(new THREE.BoxGeometry(0.9, 0.03, 0.06), glowM(0x9ad8ff, 0.5 * (1 - i / 34)), RX, 0.3, 4 - i * 2, stab);
  const sliver = mesh(new THREE.BoxGeometry(0.9, 0.06, 0.05), glowM(0xff4f7a, 1), RX, 0.34, 4.6, stab);
  const sliverG = glowSprite(0xff4f7a, 1.2, 0.9); sliverG.position.set(RX, 0.4, 4.6); stab.add(sliverG);
  const labSec = label("1 DETIK", "#FF8FA8", RX + 1.25, 1.0, 4.4, 0.65);
  const labYr = label("30 JUTA TAHUN", "#FFFFFF", RX, 4.5, -50, 8.5);
  const pil = [["WINA", 0.9, 0xc9b6ff, XS + 1.2], ["BEIJING", 5.4, 0x7fe7ff, XS + 3.4], ["OPTIK TERBAIK", 7.6, 0xffd27a, XS + 5.6]].map(([n, hgt, c, x], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, 0); stab.add(g);
    mesh(rcyl(0.55, 0.3, 0.1), MAT.pedestal, 0, 0.15, 0, g);
    mesh(rcyl(0.5, 8.0, 0.2), glass(0xf4f8ff, { thickness: 0.5, iridescence: 0.2 }), 0, 4.3, 0, g);
    const fill = mesh(rcyl(0.38, 1, 0.12), glowM(c, 0.6), 0, 0.3, 0, g); fill.geometry.translate(0, 0.5, 0);
    const cap = glowSprite(c, 1.4, 0.8); g.add(cap);
    const lb = label(n, "#" + new THREE.Color(c).getHexString(), 0, -0.4, 0.9, 0.62); lb.position.y = 0.0; g.add(lb); lb.position.set(0, 1.25, 0.9); lb.scale.multiplyScalar(1.15);
    return { g, fill, cap, hgt, lb, i };
  });
  const pilArrow = mesh(new THREE.ConeGeometry(0.32, 0.6, 24), glowM(0xffd27a, 0.9), XS + 5.6, 8.9, 0, stab);
  const labStab = label("KESTABILAN", "#FFFFFF", XS + 3.4, 9.4, 0, 0.8);

  // ================= XU uses =================
  const use = new THREE.Group(); S.add(use);
  pedestal(XU, 0, 1.3, use);
  const uC = mesh(rbox(1.9, 1.9, 1.9, 0.2), MAT.crystal, XU, 2.3, 0, use);
  mkNuclei(50, 0.68, 31, 0.24, uC);
  const uGlow = glowSprite(0xffb540, 4.2, 0.6); uC.add(uGlow); uGlow.material.depthTest = false; uGlow.renderOrder = 11;
  const flat = new THREE.Group(); flat.position.set(XU - 0.2, 4.6, -3.6); use.add(flat);
  mesh(rbox(6.0, 1.5, 0.12, 0.12), MAT.frostDark, 0, 0, 0, flat);
  const flatTex = canvasTex(1024, 256, (c, w, h) => { c.fillStyle = "rgba(230,236,248,.85)"; c.font = `600 36px ${FONT}`; c.textAlign = "left"; c.fillText("frekuensi inti", 40, 56); c.strokeStyle = "rgba(255,255,255,.12)"; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(40 + i * 118, 80); c.lineTo(40 + i * 118, 230); c.stroke(); } c.shadowColor = "#ffd27a"; c.shadowBlur = 14; c.strokeStyle = "#ffd27a"; c.lineWidth = 7; c.beginPath(); c.moveTo(40, 160); c.lineTo(w - 40, 160); c.stroke(); });
  mesh(new THREE.PlaneGeometry(5.8, 1.45), new THREE.MeshBasicMaterial({ map: flatTex, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0.2, flat).renderOrder = 6;
  const flatDot = glowSprite(0xffd27a, 0.6, 1); flat.add(flatDot);
  const waveG = new THREE.PlaneGeometry(9, 7, 48, 30); const waveBase = waveG.attributes.position.array.slice();
  const wave = mesh(waveG, new THREE.MeshBasicMaterial({ color: 0x6f5cff, wireframe: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), XU, 3.0, 0.6, use); wave.rotation.y = Math.PI / 2; wave.frustumCulled = false;
  const labDM = label("MATERI GELAP", "#B4A6FF", XU - 1.7, 0.95, 2.4, 0.75, "belum ketemu");
  const globe = new THREE.Group(); globe.position.set(XU + 4.3, 2.0, 0.6); use.add(globe);
  pedestal(XU + 4.3, 0.6, 0.9, use);
  mesh(new THREE.SphereGeometry(1.25, 48, 32), glass(0xe8f6ff, { roughness: 0.08, iridescence: 0.5 }), 0, 0.5, 0, globe);
  const grid = mesh(new THREE.SphereGeometry(1.27, 18, 12), new THREE.MeshBasicMaterial({ color: 0x7fe7ff, wireframe: true, transparent: true, opacity: 0.22, toneMapped: false }), 0, 0.5, 0, globe);
  const navRing = mesh(new THREE.TorusGeometry(1.7, 0.015, 6, 120), glowM(0x86efac, 0.6), 0, 0.5, 0, globe); navRing.rotation.x = Math.PI / 2 - 0.4;
  const navDot = glowSprite(0x86efac, 0.6, 1); globe.add(navDot);
  const labNav = label("NAVIGASI", "#86EFAC", XU + 4.3, 4.4, 1.0, 0.75, "kelak, mungkin");
  mkPlate(XU + 1.2, 3.4, -6.4, -0.1, use);
  mesh(rbox(3.2, 4.4, 0.14, 0.14), MAT.frost, XU + 5.8, 3.0, -4.0, use).rotation.y = -0.4;

  // ---------- post: NaN guard -> bloom -> output (Neutral) -> soft cool grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.6, 0.8);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uFlash: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uFlash;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));
      c=mix(vec3(l),c,1.08);c=(c-.5)*1.06+.5;c+=uFlash*vec3(.75,.65,1.);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  // ---------- camera: one track per station, glides blend between them ----------
  const camHero = track([
    [0, 1.3, 3.2, 10.6, 0.5, 3.15, 0],
    [E.reaktor, 2.2, 3.1, 10.2, 1.1, 3.0, 0],
    [E.inti1 + 0.3, 0.3, 3.0, 8.4, 0.1, 3.05, 0],
    [s.s2 + 0.8, -1.4, 3.4, 10.4, 0, 3.2, 0],
    [E.j24, 0.6, 5.6, 10.0, 0, 2.7, 0],
    [E.beijing, 0.8, 4.0, 12.4, 0.1, 3.75, 0],
    [s.s2e, 1.8, 3.6, 11.4, 0.4, 3.3, 0],
  ]);
  const camLad = track([
    [s.s3 - 0.2, PX + 0.2, 3.3, 10.0, PX + 1.0, 2.9, 0],
    [E.bandul + 0.5, PX + 0.6, 3.1, 9.0, PX + 1.0, 2.8, 0],
    [E.kuarsa + 0.3, QX - 0.2, 3.0, 8.6, QX, 2.7, 0],
    [E.cesium, CX - 0.2, 3.0, 8.4, CX, 2.75, 0],
    [s.s3e, CX + 0.8, 3.2, 9.0, CX + 0.3, 2.8, 0],
  ]);
  const camAtom = track([
    [s.s4 - 0.2, XA - 1.5, 3.8, 13.2, XA, 3.6, 0],
    [E.terganggu + 0.4, XA + 1.6, 3.6, 12.2, XA, 3.5, 0],
    [E.inti4 + 0.5, XA + 0.6, 3.3, 7.6, XA, 3.3, 0],
    [E.terlindung + 0.5, XA - 0.4, 3.3, 7.0, XA, 3.3, 0],
    [E.gamma - 1.1, XE - 0.6, 4.2, 13.4, XE, 4.4, 0],
    [E.gamma + 0.5, XE - 0.3, 6.0, 14.2, XE, 5.3, 0],
    [E.thorium4 + 0.6, XE + 0.8, 2.6, 10.8, XE + 0.6, 2.85, 0],
    [s.s4e, XE + 1.0, 2.5, 10.2, XE + 0.8, 2.75, 0],
  ]);
  const camLock = track([
    [s.s5 - 0.2, XK - 1.2, 3.8, 14.0, XK, 3.75, 0],
    [E.kristal + 0.4, XK + 0.2, 3.2, 9.6, XK, 3.25, 0],
    [E.menyerap, XK + 1.4, 3.8, 13.6, XK, 3.75, 0],
    [E.sensor, XK + 4.0, 4.4, 15.4, XK + 0.4, 4.15, 0],
    [E.didorong + 0.4, XK - 3.0, 4.6, 15.6, XK - 0.3, 4.2, 0],
    [E.terkunci + 0.3, XK - 0.2, 3.8, 13.0, XK, 3.6, 0],
    [s.s5e, XK + 0.6, 3.6, 12.4, XK, 3.5, 0],
  ]);
  const camStab = track([
    [s.s6 - 0.2, RX - 1.3, 1.5, 10.0, RX, 1.4, -14],
    [E.detik6 + 0.3, RX - 0.9, 1.3, 8.4, RX, 1.3, -18],
    [E.juta + 0.6, RX - 0.6, 2.4, 9.0, RX, 1.1, -40],
    [E.kestabilan - 0.4, XS + 1.4, 3.6, 13.4, XS + 2.8, 3.9, 0],
    [E.optik + 0.4, XS + 3.4, 4.9, 15.4, XS + 3.4, 4.7, 0],
    [E.beijing6 + 0.4, XS + 2.6, 4.2, 15.0, XS + 3.0, 4.3, 0],
    [s.s6e, XS + 3.0, 4.4, 15.2, XS + 3.3, 4.5, 0],
  ]);
  const camUse = track([
    [s.s7 - 0.2, XU - 1.6, 3.4, 11.6, XU, 3.15, 0],
    [E.peka, XU + 0.4, 3.1, 9.6, XU, 3.0, 0],
    [E.materi + 0.4, XU + 1.2, 3.8, 12.2, XU + 0.3, 3.55, 0],
    [E.navigasi + 0.6, XU + 3.6, 3.4, 10.8, XU + 3.6, 3.0, 0],
    [s.s7e, XU + 3.4, 3.6, 11.8, XU + 3.0, 3.2, 0],
    [s.s8 + 0.8, XU + 2.4, 4.2, 13.6, XU + 2.0, 3.6, 0],
    [s.end, XU + 2.0, 5.6, 17.4, XU + 2.0, 3.9, 0],
    [s.dur, XU + 2.0, 6.0, 18.4, XU + 2.0, 4.0, 0],
  ]);
  const SHOTS = [[camHero, s.s3, 0.55, 0.75, 1.4], [camLad, s.s4, 0.55, 0.75, 1.6], [camAtom, s.s5, 0.55, 0.75, 1.6], [camLock, s.s6, 0.55, 0.75, 1.4], [camStab, s.s7, 0.55, 0.75, 1.6], [camUse, 1e9, 0, 0, 0]];
  const pa = v3(0, 0, 0), pb = v3(0, 0, 0), la = v3(0, 0, 0), lb = v3(0, 0, 0);
  function camAt(t) {
    let i = 0; while (t > SHOTS[i][1] + SHOTS[i][3]) i++;
    const c = SHOTS[i][0](t); pa.set(c[0], c[1], c[2]); la.set(c[3], c[4], c[5]);
    let glide = 0;
    if (i > 0) { const [, T, w1, w2, lift] = SHOTS[i - 1]; if (t < T + w2) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c0 = SHOTS[i - 1][0](t); pb.set(c0[0], c0[1], c0[2]); lb.set(c0[3], c0[4], c0[5]); pa.lerpVectors(pb, pa, k); la.lerpVectors(lb, la, k); glide = Math.sin(Math.PI * u); pa.y += lift * glide; pa.z += 2.5 * glide; } }
    if (i < SHOTS.length - 1) { const [, T, w1, w2, lift] = SHOTS[i]; if (t > T - w1) { const u = clamp01((t - (T - w1)) / (w1 + w2)); const k = u * u * (3 - 2 * u); const c1 = SHOTS[i + 1][0](t); pb.set(c1[0], c1[1], c1[2]); lb.set(c1[3], c1[4], c1[5]); pa.lerp(pb, k); la.lerp(lb, k); glide = Math.sin(Math.PI * u); pa.y += lift * glide; pa.z += 2.5 * glide; } }
    return glide;
  }

  const tmpP = tpG.attributes.position, tmpC = tpG.attributes.color;
  // ================================================================ draw
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const glide = camAt(t);
    pa.sub(la).multiplyScalar(ZOOM).add(la);
    cam.position.copy(pa);
    cam.position.x += 0.05 * Math.sin(t * 0.37); cam.position.y += 0.04 * Math.sin(t * 0.29 + 1.1);
    cam.lookAt(la);
    cam.fov = 38 + 6 * glide; cam.updateProjectionMatrix();
    rig.position.copy(cam.position); rig.quaternion.copy(cam.quaternion);
    discs.position.set(cam.position.x * 0.92, 0, cam.position.z * 0.3 - 3);
    const cx = cam.position.x, near = (x, d = 24) => Math.abs(cx - x) < d;
    hero.visible = near(X0); lad.visible = near(XL); atomG.visible = near(XA, 20); ener.visible = near(XE, 20); lock.visible = near(XK); stab.visible = near(XS + 2, 26); use.visible = near(XU + 2);

    // ----- hero -----
    if (hero.visible) {
      crystal.rotation.set(0.12 + 0.04 * Math.sin(t * 0.5), 0.5 + t * 0.18, 0.05);
      crystal.position.y = 2.35 + 0.06 * Math.sin(t * 0.8);
      const dis = ramp(t, E.reaktor - 0.1, E.reaktor + 0.7);
      towerM.opacity = 0.55 * (1 - dis); tower.visible = dis < 0.99; tower.scale.set(1 + 0.08 * dis, 1 - 0.1 * dis, 1 + 0.08 * dis);
      const no = win(t, E.reaktor - 0.15, E.inti1 - 0.2, 0.15, 0.4);
      noRing.material.opacity = noBar.material.opacity = 0.9 * no; noRing.visible = noBar.visible = no > 0.01;
      const fly = ramp(t, E.reaktor + 0.1, E.inti1 + 0.35);
      tpP.visible = dis > 0.01 && fly < 0.999;
      if (tpP.visible) for (let i = 0; i < NP; i++) { const k = eout(clamp01(fly * 1.25 - (i % 9) * 0.03)); const a = tpSrc[i], b = tpDst[i]; tmpP.setXYZ(i, lerp(a.x, b.x, k), lerp(a.y, b.y, k) + Math.sin(k * Math.PI) * 1.2, lerp(a.z, b.z, k)); tmpC.setXYZ(i, 1, lerp(0.55, 0.75, k), lerp(0.55, 0.25, k)); }
      tmpP.needsUpdate = tmpC.needsUpdate = true;
      const lit = 0.25 + 0.75 * ramp(t, E.inti1 - 0.2, E.inti1 + 0.4);
      const pulse = 0.85 + 0.15 * Math.sin(t * 6.3);
      heroNuc.material.opacity = lit * pulse; heroNuc.material.size = 0.26 * (0.8 + 0.4 * lit);
      heroGlow.material.opacity = 0.65 * ramp(t, E.inti1 - 0.2, E.inti1 + 0.4) * pulse + 0.1;
      setBeam(heroBeam, X0 - 3.6, X0 - 0.2, crystal.position.y, 0, 0.35 + 0.65 * ramp(t, E.inti1 - 0.4, E.inti1 + 0.2));
      const r24 = ramp(t, E.mengoreksi - 0.6, E.mengoreksi + 0.3);
      ring24.visible = r24 > 0.01; ring24.scale.setScalar(0.6 + 0.4 * back(r24));
      const sweep = ramp(t, E.j24 - 0.6, E.j24 + 2.2);
      ticks.forEach((m, i) => { m.material.opacity = 0.15 + 0.85 * (sweep * 24 > i ? 1 : 0); });
      hand.rotation.y = -sweep * Math.PI * 2;
      const tw = back(ramp(t, E.wien - 0.3, E.wien + 0.5)), tb = back(ramp(t, E.beijing - 0.3, E.beijing + 0.5));
      tabW.visible = tw > 0.01; tabW.scale.setScalar(Math.max(0.001, tw)); tabW.position.y = 1.25 + 0.06 * Math.sin(t * 0.9);
      tabB.visible = tb > 0.01; tabB.scale.setScalar(Math.max(0.001, tb)); tabB.position.y = 1.25 + 0.06 * Math.sin(t * 0.9 + 2);
    }
    // ----- ladder -----
    if (lad.visible) {
      pend.rotation.z = 0.42 * Math.sin(Math.PI * (t - E.bandul + 0.5));
      bobGlow.material.opacity = 0.35 + 0.4 * win(t, E.bandul - 0.3, E.kuarsa, 0.3, 0.5);
      const qOn = ramp(t, E.kuarsa - 0.4, E.kuarsa + 0.2);
      const vib = 0.045 * qOn * Math.sin(t * 97);
      prL.position.x = -0.4 - vib; prR.position.x = 0.4 + vib;
      ripples.forEach((m, i) => { const u = (t * 0.9 + i / 3) % 1; m.scale.setScalar(0.4 + 2.2 * u); m.material.opacity = 0.55 * qOn * (1 - u); });
      const cOn = ramp(t, E.atom3 - 0.5, E.cesium);
      csOrb.forEach((o, i) => { o.e.position.set(Math.cos(t * (2.4 + i * 0.7) + i) * o.rr, 0, Math.sin(t * (2.4 + i * 0.7) + i) * o.rr); o.e.scale.setScalar(0.6 + 0.6 * cOn); });
      cs.rotation.y = t * 0.2;
      labP.visible = labQ.visible = labC.visible = false; // the s3 panel already carries these numbers
    }
    // ----- atom + energy ladder -----
    if (atomG.visible || ener.visible) {
      const dist = win(t, E.terganggu - 0.9, E.terlindung - 0.3, 0.5, 0.8);
      fieldLines.forEach((m, i) => { m.material.opacity = 0.75 * dist; m.position.x = Math.sin(t * 1.3 + i) * 0.6; m.visible = dist > 0.01; });
      aOrb.forEach((o, i) => {
        const wob = dist * (0.35 + 0.15 * i);
        o.g.rotation.set(1.1 * i + 0.2 + wob * Math.sin(t * 7.1 + i), 0.7 * i + 0.4 + wob * Math.sin(t * 5.3 + 2 * i), 0.3 * i + wob * 0.6 * Math.sin(t * 9 + i));
        const a = t * (1.6 + 0.4 * i) + o.ph; const rr = o.rr * (1 + 0.12 * dist * Math.sin(t * 11 + i));
        o.e.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
      });
      bigNuc.rotation.y = t * 0.15;
      const shield = ramp(t, E.inti4 - 0.2, E.inti4 + 0.6) * (1 - ramp(t, E.gamma - 1.5, E.gamma - 0.8));
      shieldGlow.material.opacity = 0.45 * shield; bigNuc.userData.halo.material.opacity = 0.35 + 0.5 * shield;
      lab10k.material.opacity = 0; lab10k.visible = false;
      const gb = win(t, E.gamma - 0.1, E.thorium4 + 0.4, 0.12, 0.4);
      bolt.material.opacity = gb * (0.65 + 0.35 * Math.sin(t * 40));
      gradeU.uFlash.value = 0.22 * win(t, E.gamma, E.gamma + 0.15, 0.05, 0.25);
      const ub = ramp(t, E.uv - 0.3, E.uv + 0.3);
      uvBridge.material.opacity = ub; uvGlow.material.opacity = ub * (0.8 + 0.2 * Math.sin(t * 9));
      labG.material.opacity = ramp(t, E.gamma - 0.3, E.gamma + 0.2); labT.material.opacity = ramp(t, E.thorium4 - 0.3, E.thorium4 + 0.2);
    } else gradeU.uFlash.value = 0;
    // ----- lock -----
    if (lock.visible) {
      bigC.rotation.set(0.08, 0.6 + 0.12 * Math.sin(t * 0.3), 0.02);
      // detune: steady near zero, drifts on "Melenceng", read by the sensor, pushed back on "didorong", tiny jitter when locked
      const drift = ramp(t, E.meleng - 0.2, E.meleng + 0.9) * (1 - ramp(t, E.didorong - 0.1, E.didorong + 0.9));
      const det = 0.62 * drift + 0.03 * Math.sin(t * 2.3) * (1 - ramp(t, E.terkunci - 0.4, E.terkunci + 0.2));
      const absb = Math.exp(-(det / 0.22) * (det / 0.22));
      const onN = ramp(t, E.trili - 0.3, E.trili + 0.8);
      const res = ramp(t, E.menyerap - 0.4, E.menyerap + 0.4);
      const glowK = onN * (0.3 + 0.7 * res * absb);
      lockNuc.material.opacity = glowK * (0.88 + 0.12 * Math.sin(t * 7)); lockGlow.material.opacity = 0.5 * glowK * res;
      const bIn = ramp(t, E.menyerap - 0.6, E.menyerap);
      setBeam(kBeamIn, XK - 2.85, XK - 1.0, 2.75, LZ, bIn);
      setBeam(kBeamOut, XK + 1.0, XK + 3.3, 2.75, LZ, bIn * (1 - 0.65 * res * absb));
      needle.position.x = det * 3.2 * 1.0; needleDot.position.set(needle.position.x, 0.82 - 1.6 * (1 - absb) * 0.9, 0.25);
      plot.visible = t > s.s5 - 0.5;
      const loopOn = ramp(t, E.sensor - 0.3, E.sensor + 0.3);
      loopTube.material.emissive = loopTube.material.emissive || new THREE.Color(0);
      arrowHead.material.opacity = 0.25 + 0.75 * loopOn;
      pulses.forEach((g, i) => { const u = ((t - E.sensor) * 0.55 + i / 5) % 1; const uu = u < 0 ? u + 1 : u; g.position.copy(loopCurve.getPointAt(uu)); g.material.opacity = loopOn * 0.95; });
      const warn = drift * (1 - absb);
      sensRing.material.color.setRGB(lerp(0.5, 1.0, warn), lerp(0.9, 0.35, warn), lerp(1.0, 0.45, warn));
      const lk = ramp(t, E.terkunci - 0.3, E.terkunci + 0.3);
      lockRing.material.opacity = 0.9 * lk * (0.8 + 0.2 * Math.sin(t * 5)); labLock.material.opacity = lk;
      labSens.material.opacity = win(t, E.sensor - 0.3, E.terkunci - 0.3, 0.3, 0.4);
    }
    // ----- stability -----
    if (stab.visible) {
      sliverG.material.opacity = 0.6 + 0.4 * Math.sin(t * 6);
      labSec.material.opacity = ramp(t, E.detik6 - 0.3, E.detik6 + 0.2) * (1 - ramp(t, E.kestabilan - 1, E.kestabilan - 0.6));
      labYr.material.opacity = ramp(t, E.juta - 0.3, E.juta + 0.4) * (1 - ramp(t, E.kestabilan - 1, E.kestabilan - 0.6));
      const grow = [ramp(t, E.kestabilan - 0.2, E.kestabilan + 0.8), ramp(t, E.beijing6 - 0.3, E.beijing6 + 0.9), ramp(t, E.optik - 0.3, E.optik + 1.0)];
      pil.forEach((p, i) => { const h = Math.max(0.01, p.hgt * eout(grow[i])); p.fill.scale.set(1, h, 1); p.cap.position.set(0, 0.3 + h, 0); p.cap.material.opacity = 0.8 * grow[i]; p.lb.material.opacity = 0.35 + 0.65 * grow[i]; });
      pilArrow.position.y = 8.6 + 0.25 * Math.sin(t * 3); pilArrow.material.opacity = 0.9 * grow[2];
      labStab.material.opacity = ramp(t, E.kestabilan - 0.3, E.kestabilan + 0.3);
    }
    // ----- uses -----
    if (use.visible) {
      uC.rotation.set(0.1, 0.4 + t * 0.2, 0.05); uC.position.y = 2.3 + 0.05 * Math.sin(t * 0.8);
      const pk = win(t, E.peka - 0.2, E.materi, 0.2, 0.5);
      uGlow.material.opacity = 0.45 + 0.4 * pk * (0.5 + 0.5 * Math.sin(t * 8));
      const wOn = win(t, E.materi - 0.4, E.navigasi + 0.2, 0.4, 0.6);
      wave.visible = wOn > 0.01; wave.material.opacity = 0.32 * wOn;
      wave.position.x = XU - 5 + 10 * ramp(t, E.materi - 0.6, E.navigasi + 0.6);
      if (wave.visible) { const P = waveG.attributes.position; for (let i = 0; i < P.count; i++) { const x = waveBase[i * 3], y = waveBase[i * 3 + 1]; P.setZ(i, 0.55 * Math.sin(x * 0.9 - t * 3.2) + 0.25 * Math.sin(y * 1.3 + t * 1.7)); } P.needsUpdate = true; }
      flatDot.position.set(-2.7 + 5.4 * ((t * 0.18) % 1), -0.11, 0.25);
      labDM.material.opacity = ramp(t, E.materi - 0.2, E.materi + 0.3) * (1 - ramp(t, s.s8 - 0.3, s.s8 + 0.2));
      globe.rotation.y = t * 0.25;
      const nv = ramp(t, E.navigasi - 0.3, E.navigasi + 0.3);
      navRing.material.opacity = 0.2 + 0.6 * nv; const na = t * 1.4; navDot.position.set(Math.cos(na) * 1.7, 0.5 + Math.sin(na) * 1.7 * Math.sin(0.4), Math.sin(na) * 1.7 * Math.cos(0.4)); navDot.material.opacity = nv;
      labNav.material.opacity = nv * (1 - ramp(t, s.s8 - 0.3, s.s8 + 0.2));
    }
    bloom.strength = 0.55 + 0.25 * glide;

    // ----- planar mirror for the floor -----
    cam.updateMatrixWorld();
    vcam.position.set(cam.position.x, -cam.position.y, cam.position.z);
    vcam.up.set(0, -1, 0);
    vcam.lookAt(la.x, -la.y, la.z);
    vcam.projectionMatrix.copy(cam.projectionMatrix); vcam.projectionMatrixInverse.copy(cam.projectionMatrixInverse);
    vcam.updateMatrixWorld();
    floor.updateMatrixWorld();
    floorU.tMat.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(vcam.projectionMatrix).multiply(vcam.matrixWorldInverse).multiply(floor.matrixWorld);
    floorU.uCam.value.copy(cam.position);
    floor.visible = false; discs.visible = true;
    r.setRenderTarget(mirrorRT); r.clear(); r.render(S, vcam); r.setRenderTarget(null);
    floor.visible = true;
    comp.render();
  };
}
