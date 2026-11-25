// EP02 KULKAS (THERMALFORGE): one kitchen seen through a thermal camera. Every surface is shaded by its own
// temperature through an ironbow ramp (cold black -> deep violet -> magenta -> amber -> yellow, white only on tiny
// hotspots), with a little form shading so shapes still read. The fridge turns into a see-through cutaway for the
// refrigerant loop (compressor, condenser, expansion valve, evaporator), then the camera turns to a small history
// corner (Cullen's ether jar, a 1915 cabinet) and ends on the hot back of the fridge.
// Generic illustration only: no brands, no real likeness. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

// ---------- ironbow ----------
const STOPS = ["#0A0A10", "#310E68", "#9B1D8C", "#EA5E28", "#F7D038", "#FFFFFF"].map((h) => new THREE.Color(h));
const _c = new THREE.Color();
function ironbow(h, out = _c) {
  h = clamp01(h) * 5;
  const i = Math.min(4, Math.floor(h));
  return out.copy(STOPS[i]).lerp(STOPS[i + 1], h - i);
}

const VS = `attribute float aH;varying vec3 vW;varying vec3 vN;varying float vH;
void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vN=mat3(modelMatrix)*normal;vH=aH;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS = `uniform vec3 uS[6];uniform float uSpec,uTex,uTile,uHeat,uShade,uRim,uOp,uAttr,uNoise,uGrid,uGradY,uHotR,uHotA,uHotR2,uHotA2;uniform vec3 uHotP,uHotP2;
varying vec3 vW;varying vec3 vN;varying float vH;
vec3 ib(float h){h=clamp(h,0.0,1.0)*5.0;if(h<1.0)return mix(uS[0],uS[1],h);if(h<2.0)return mix(uS[1],uS[2],h-1.0);if(h<3.0)return mix(uS[2],uS[3],h-2.0);if(h<4.0)return mix(uS[3],uS[4],h-3.0);return mix(uS[4],uS[5],h-4.0);}
float hs(vec3 p){return fract(sin(dot(floor(p*40.0),vec3(12.9898,78.233,37.719)))*43758.5453);}
float h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 n=vN;float ln=length(n);n=ln>1e-5?n/ln:vec3(0.0,1.0,0.0);if(!gl_FrontFacing)n=-n;
vec3 v=cameraPosition-vW;float lv=length(v);v=lv>1e-5?v/lv:vec3(0.0,0.0,1.0);
float h=uHeat+uAttr*vH+uGradY*vW.y;
h+=uShade*(dot(n,normalize(vec3(0.35,0.85,0.4)))-0.35);
h+=uRim*pow(1.0-clamp(abs(dot(n,v)),0.0,1.0),2.5);
vec3 d=vW-uHotP;h+=uHotA*exp(-dot(d,d)/max(1e-4,uHotR*uHotR));
vec3 d2=vW-uHotP2;h+=uHotA2*exp(-dot(d2,d2)/max(1e-4,uHotR2*uHotR2));
if(uGrid>0.0){vec2 g=abs(fract(vW.xz/0.5)-0.5);h-=uGrid*smoothstep(0.455,0.5,max(g.x,g.y));}
h+=uNoise*(hs(vW)-0.5);
if(uTex>0.0)h+=uTex*((vn(vW*2.2)-0.5)+0.5*(vn(vW*9.0)-0.5));
if(uTile>0.0)h+=uTile*(h3(floor(vW.xzx/0.5))-0.5);
if(uSpec>0.0){vec3 rf=reflect(-v,n);h+=uSpec*pow(max(dot(rf,normalize(vec3(-0.4,0.9,-0.3))),0.0),28.0)+0.5*uSpec*pow(max(dot(rf,normalize(vec3(0.6,0.5,0.6))),0.0),40.0);}
gl_FragColor=vec4(ib(h),uOp);}`;
const MATS = [];
function tm(heat, o = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side: o.side ?? THREE.FrontSide, transparent: (o.op ?? 1) < 1 || !!o.ghost, depthWrite: o.depthWrite ?? true,
    uniforms: {
      uS: { value: STOPS }, uSpec: { value: o.spec ?? 0 }, uTex: { value: o.tex ?? 0 }, uTile: { value: o.tile ?? 0 }, uHeat: { value: heat }, uShade: { value: o.shade ?? 0.1 }, uRim: { value: o.rim ?? 0.04 }, uOp: { value: o.op ?? 1 },
      uAttr: { value: o.attr ?? 0 }, uNoise: { value: o.noise ?? 0.018 }, uGrid: { value: o.grid ?? 0 }, uGradY: { value: o.gradY ?? 0 },
      uHotP: { value: new THREE.Vector3(0, -50, 0) }, uHotR: { value: 1 }, uHotA: { value: 0 },
      uHotP2: { value: new THREE.Vector3(0, -50, 0) }, uHotR2: { value: 1 }, uHotA2: { value: 0 },
    },
  });
  m.defaultAttributeValues = { color: [1, 1, 1], uv: [0, 0], uv1: [0, 0], aH: [0] };
  MATS.push(m);
  return m;
}
const U = (m) => m.uniforms;

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Sensor grade: exposure, fine scanlines, a slow rolling refresh band, faint edge falloff.
const Grade = { uniforms: { tDiffuse: { value: null }, uExp: { value: 1 }, uT: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uExp,uT;varying vec2 vUv;
  void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*uExp;float y=vUv.y*1920.0;c*=0.92+0.08*step(1.0,mod(y,3.0));
  float band=fract(vUv.y*0.6-uT*0.11);c*=1.0+0.035*smoothstep(0.0,0.02,band)*smoothstep(0.06,0.02,band);
  vec2 q=(vUv-0.5)*vec2(1.0,0.75);c*=1.0-0.35*smoothstep(0.25,0.62,length(q));gl_FragColor=vec4(c,1.0);}` };

// ---------- geometry helpers ----------
function rbox(w, h, d, r = 0.02) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
  s.moveTo(x, y - r); s.lineTo(x + W, y - r); s.quadraticCurveTo(x + W + r, y - r, x + W + r, y); s.lineTo(x + W + r, y + H); s.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r);
  s.lineTo(x, y + H + r); s.quadraticCurveTo(x - r, y + H + r, x - r, y + H); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  return g;
}
const mesh = (geo, mat, x = 0, y = 0, z = 0, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (p) p.add(m); return m; };
const lathe = (p, seg = 28) => new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r, y)), seg);
function tubeAlong(points, r, mat, closed = false, segs = 200) {
  const cur = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  const g = new THREE.TubeGeometry(cur, segs, r, 10, closed);
  return { cur, g, m: new THREE.Mesh(g, mat) };
}

// HUD tag drawn in the world: dark plate, cyan rule, white mono text.
function tag(text, { w = 640, h = 120, size = 0.62 * w / 640, fg = "#ffffff", line = "#00E5FF", font = "700 58px Arial, sans-serif", bg = "rgba(8,6,18,0.86)" } = {}) {
  const tx = canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(4, 4, w - 8, h - 8);
    g.fillStyle = line; g.fillRect(4, 4, 12, h - 8); g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2 + 6, h / 2 + 3);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  m.renderOrder = 30; m.userData.pw = size;
  return m;
}

// Faceless thermal person: rounded head on a neck, shoulders wider than the waist, coat skirt, bent elbows/knees.
function person(H) {
  const G = new THREE.Group();
  const skin = tm(H.skin, { shade: 0.08, rim: -0.06 }), head = tm(H.head, { shade: 0.06, rim: -0.08 }), coat = tm(H.coat, { shade: 0.12, rim: -0.05 }), legs = tm(H.legs, { shade: 0.1, rim: -0.05 }), hair = tm(H.hair, { shade: 0.08 });
  const add = (geo, mat, x, y, z, p = G) => mesh(geo, mat, x, y, z, p);
  const leg = (x) => {
    const hip = new THREE.Group(); hip.position.set(x, 0.9, 0); G.add(hip);
    add(new THREE.CapsuleGeometry(0.075, 0.32, 6, 12), legs, 0, -0.2, 0, hip);
    const kn = new THREE.Group(); kn.position.y = -0.43; hip.add(kn);
    add(new THREE.CapsuleGeometry(0.06, 0.32, 6, 12), legs, 0, -0.2, 0, kn);
    add(new THREE.SphereGeometry(0.07, 12, 8), legs, 0, -0.43, 0.05, kn).scale.set(0.8, 0.5, 1.7);
    return { hip, kn };
  };
  const legL = leg(-0.1), legR = leg(0.1);
  add(lathe([[0.001, 0.84], [0.15, 0.86], [0.165, 0.97], [0.155, 1.04], [0.001, 1.04]]), legs, 0, 0, 0).scale.set(1.1, 1, 0.75);
  add(lathe([[0.001, 0.95], [0.15, 0.96], [0.155, 1.1], [0.18, 1.27], [0.205, 1.41], [0.19, 1.48], [0.12, 1.54], [0.055, 1.565], [0.001, 1.57]]), coat, 0, 0, 0).scale.set(1.38, 1, 0.74);
  const sk = add(lathe([[0.17, 1.12], [0.175, 0.95], [0.235, 0.7], [0.27, 0.5]]), tm(H.coat - 0.03, { shade: 0.1, side: THREE.DoubleSide }), 0, 0, 0); sk.scale.set(1.22, 1, 0.84);
  const hp = new THREE.Group(); hp.position.set(0, 1.56, 0); G.add(hp);
  add(new THREE.CylinderGeometry(0.044, 0.052, 0.1, 12), skin, 0, 0.03, 0, hp);
  add(new THREE.SphereGeometry(0.102, 20, 16), head, 0, 0.155, 0.01, hp).scale.set(0.88, 1.12, 0.98);
  add(new THREE.SphereGeometry(0.076, 16, 12), head, 0, 0.1, 0.03, hp).scale.set(0.95, 0.8, 1);
  // powdered wig of the period: cap + side rolls + short tail, cooler than the face
  add(new THREE.SphereGeometry(0.112, 18, 10, 0, 6.3, 0, 1.5), hair, 0, 0.17, -0.01, hp);
  for (const s of [-1, 1]) add(new THREE.CapsuleGeometry(0.028, 0.05, 4, 8), hair, s * 0.098, 0.12, -0.02, hp).rotation.z = Math.PI / 2;
  add(new THREE.CapsuleGeometry(0.022, 0.09, 4, 8), hair, 0, 0.06, -0.1, hp);
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.25, 1.44, 0); G.add(sh);
    add(new THREE.SphereGeometry(0.07, 12, 10), coat, 0, 0, 0, sh);
    add(new THREE.CapsuleGeometry(0.06, 0.22, 6, 12), coat, 0, -0.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    add(new THREE.CapsuleGeometry(0.052, 0.2, 6, 12), coat, 0, -0.13, 0, el);
    add(new THREE.SphereGeometry(0.046, 12, 10), skin, 0, -0.29, 0.01, el).scale.set(0.8, 1.15, 1);
    return { sh, el };
  };
  return { G, head: hp, legL, legR, armL: arm(-1), armR: arm(1) };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x07060d, exp: 1.0, bloom: [0.55, 0.45, 0.6], fov: 38, shadow: false });
  r.toneMapping = THREE.NoToneMapping;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = new ShaderPass(Grade); comp.insertPass(grade, comp.passes.length - 1);
  envStrips(r, scene, [[4, 2, 0xffffff, 1.2, -3, 3, -2], [2, 4, 0xffd0a0, 0.8, 4, 2, 3]], 0x05040a);
  scene.environmentIntensity = 0.55;
  const A = (k) => AT[k];
  const rnd = mulberry(1915);

  // ================= room =================
  const floorM = tm(0.33, { grid: 0.1, shade: 0, rim: 0, noise: 0.022, tex: 0.05, tile: 0.045, spec: 0.05 });
  const floor = mesh(new THREE.PlaneGeometry(40, 40), floorM, 2, 0, 0, scene); floor.rotation.x = -Math.PI / 2;
  U(floorM).uHotP.value.set(0.05, 0, -0.55); U(floorM).uHotR.value = 0.9; U(floorM).uHotA.value = 0.3;
  const wallM = tm(0.12, { shade: 0, rim: 0, gradY: 0.025, tex: 0.07 });
  const walls = [[-4.6, 0, Math.PI / 2], [11.5, 0, -Math.PI / 2]];
  for (const [x, z, ry] of walls) { const w = mesh(new THREE.PlaneGeometry(30, 9), wallM, x, 4.5, z, scene); w.rotation.y = ry; }
  mesh(new THREE.PlaneGeometry(30, 9), wallM, 3, 4.5, -5.6, scene);
  const wb = mesh(new THREE.PlaneGeometry(30, 9), wallM, 3, 4.5, 7.5, scene); wb.rotation.y = Math.PI;
  // skirting strips so the walls read as walls
  const skirtM = tm(0.26, { shade: 0.05 });
  mesh(new THREE.BoxGeometry(30, 0.1, 0.03), skirtM, 3, 0.05, -5.58, scene);
  const sk2 = mesh(new THREE.BoxGeometry(30, 0.1, 0.03), skirtM, -4.58, 0.05, 0, scene); sk2.rotation.y = Math.PI / 2;
  // window on the back wall: glass reads cold
  const winM = tm(0.09, { shade: 0, rim: 0 });
  mesh(new THREE.PlaneGeometry(1.6, 1.2), winM, -1.6, 1.9, -5.57, scene);
  for (const [w, h, x, y] of [[1.7, 0.06, -1.6, 2.5], [1.7, 0.06, -1.6, 1.3], [0.06, 1.25, -2.42, 1.9], [0.06, 1.25, -0.78, 1.9], [0.05, 1.2, -1.6, 1.9]]) mesh(new THREE.BoxGeometry(w, h, 0.05), skirtM, x, y, -5.55, scene);

  // kitchen counter run to the left of the fridge, upper cabinets, a warm kettle and a hot lamp
  const cabM = tm(0.3, { shade: 0.16, rim: 0.04, tex: 0.03, spec: 0.06 }), topM = tm(0.35, { shade: 0.1, tex: 0.05, spec: 0.08 }), handleM = tm(0.22, { shade: 0.1 });
  for (let i = 0; i < 4; i++) {
    const x = -0.85 - i * 0.62;
    mesh(rbox(0.6, 0.82, 0.6, 0.015), cabM, x, 0.47, -0.02, scene);
    mesh(new THREE.BoxGeometry(0.22, 0.025, 0.02), handleM, x, 0.78, 0.29, scene);
    mesh(rbox(0.6, 0.62, 0.34, 0.015), cabM, x, 1.95, -0.15, scene);
  }
  mesh(new THREE.BoxGeometry(0.62 * 4 + 0.04, 0.05, 0.64), topM, -0.85 - 1.5 * 0.62, 0.905, -0.02, scene);
  mesh(new THREE.BoxGeometry(0.62 * 4, 0.08, 0.6), tm(0.3, { shade: 0 }), -0.85 - 1.5 * 0.62, 0.04, -0.02, scene);
  const kettleM = tm(0.74, { shade: 0.1, rim: -0.1, spec: 0.15 });
  mesh(lathe([[0.001, 0], [0.1, 0.005], [0.115, 0.08], [0.1, 0.18], [0.06, 0.22], [0.001, 0.225]]), kettleM, -1.5, 0.93, 0.02, scene);
  const kh = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI), tm(0.55), -1.5, 1.15, 0.02, scene); kh.rotation.z = 0;
  mesh(rbox(0.26, 0.16, 0.16, 0.02), tm(0.5, { shade: 0.1 }), -2.4, 1.01, 0.0, scene); // toaster
  mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.8, 4), tm(0.3), -1.7, 2.9, 0.4, scene);
  mesh(new THREE.ConeGeometry(0.16, 0.14, 20, 1, true), tm(0.45, { side: THREE.DoubleSide }), -1.7, 2.48, 0.4, scene);
  mesh(new THREE.SphereGeometry(0.04, 12, 10), tm(0.97, { shade: 0, rim: 0 }), -1.7, 2.42, 0.4, scene);

  // ================= the fridge =================
  const FR = new THREE.Group(); scene.add(FR);
  const W = 0.72, D = 0.68, Hh = 1.8, z0 = D / 2;
  const shellM = tm(0.25, { shade: 0.17, rim: 0.05, ghost: true, spec: 0.1, tex: 0.025 }), linerM = tm(0.1, { shade: 0.06, rim: 0.02, ghost: true, side: THREE.DoubleSide });
  const gasketM = tm(0.48, { shade: 0.05, rim: 0, ghost: true });
  const panels = [];
  const pnl = (w, h, d, x, y, z, m = shellM) => { const p = mesh(rbox(w, h, d, 0.012), m, x, y, z, FR); panels.push(p); return p; };
  pnl(0.035, Hh, D, -W / 2 + 0.0175, Hh / 2 + 0.04, 0); // left side
  const sideR = pnl(0.035, Hh, D, W / 2 - 0.0175, Hh / 2 + 0.04, 0);
  pnl(W, 0.035, D, 0, Hh + 0.04 - 0.0175, 0);
  pnl(W, 0.06, D, 0, 0.07, 0);
  pnl(W, Hh, 0.03, 0, Hh / 2 + 0.04, -D / 2 + 0.015);
  // cold liner (inside), shelves and a crisper drawer
  const liner = mesh(new THREE.BoxGeometry(W - 0.08, Hh - 0.12, D - 0.06), linerM, 0, Hh / 2 + 0.04, 0.01, FR);
  const shelfM = tm(0.15, { shade: 0.05, rim: 0.06, ghost: true });
  for (const y of [0.52, 0.95, 1.3]) mesh(new THREE.BoxGeometry(W - 0.09, 0.012, D - 0.1), shelfM, 0, y, 0.0, FR);
  mesh(rbox(W - 0.12, 0.22, D - 0.14, 0.02), tm(0.18, { shade: 0.06, ghost: true }), 0, 0.24, 0.0, FR);
  // cold food on the shelves (violet), each a simple generic shape
  const foodM = [tm(0.17, { shade: 0.14, ghost: true }), tm(0.13, { shade: 0.14, ghost: true }), tm(0.2, { shade: 0.14, ghost: true })];
  const food = [];
  const fput = (geo, mi, x, y, z) => { const m = mesh(geo, foodM[mi], x, y, z, FR); food.push(m); return m; };
  fput(lathe([[0.001, 0], [0.04, 0.0], [0.04, 0.17], [0.018, 0.22], [0.016, 0.26], [0.001, 0.26]]), 0, -0.2, 0.53, -0.05);
  fput(lathe([[0.001, 0], [0.035, 0.0], [0.035, 0.15], [0.016, 0.2], [0.001, 0.21]]), 1, -0.1, 0.53, -0.12);
  fput(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 18), 2, 0.12, 0.58, -0.08);
  fput(new THREE.SphereGeometry(0.05, 16, 12), 0, 0.17, 1.0, 0.1);
  fput(new THREE.SphereGeometry(0.045, 16, 12), 2, 0.07, 0.995, 0.12);
  fput(rbox(0.2, 0.12, 0.16, 0.02), 1, -0.12, 1.02, -0.05);
  fput(new THREE.CylinderGeometry(0.05, 0.045, 0.14, 16), 0, -0.15, 1.38, 0.05);
  // the warm bowl that is put in at s4 and cools down
  const bowlM = tm(0.7, { shade: 0.1, rim: -0.1, spec: 0.14 });
  const bowl = new THREE.Group(); bowl.position.set(0.08, 1.31, 0.06); FR.add(bowl);
  mesh(lathe([[0.001, 0], [0.05, 0.002], [0.085, 0.03], [0.1, 0.075], [0.094, 0.078], [0.08, 0.034], [0.048, 0.008], [0.001, 0.008]]), bowlM, 0, 0, 0, bowl).material.side = THREE.DoubleSide;
  mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.012, 24), tm(0.78, { shade: 0.04, rim: -0.08 }), 0, 0.062, 0, bowl);
  const bowlTop = bowl.children[1].material;
  const rimM = tm(0.82, { shade: 0.04, rim: -0.04, spec: 0.2 });
  mesh(new THREE.TorusGeometry(0.097, 0.0045, 8, 40), rimM, 0, 0.077, 0, bowl).rotation.x = Math.PI / 2;

  // door: hinge on the left front edge, opens toward the viewer
  const door = new THREE.Group(); door.position.set(-W / 2, 0.04, z0); FR.add(door);
  const doorM = tm(0.26, { shade: 0.17, rim: 0.05, ghost: true, spec: 0.1, tex: 0.025 });
  const doorP = mesh(rbox(W, Hh, 0.06, 0.02), doorM, W / 2, Hh / 2, 0.03, door); panels.push(doorP);
  const doorIn = mesh(new THREE.BoxGeometry(W - 0.08, Hh - 0.1, 0.012), linerM, W / 2, Hh / 2, -0.004, door);
  for (const y of [0.45, 0.9, 1.35]) { const bin = mesh(new THREE.BoxGeometry(W - 0.14, 0.08, 0.07), shelfM, W / 2, y, -0.05, door); }
  // warm door gasket (real fridges warm the seal), drawn as a thin frame on the inner face
  for (const [w, h, x, y] of [[W - 0.02, 0.018, W / 2, 0.02], [W - 0.02, 0.018, W / 2, Hh - 0.02], [0.018, Hh - 0.02, 0.02, Hh / 2], [0.018, Hh - 0.02, W - 0.02, Hh / 2]]) mesh(new THREE.BoxGeometry(w, h, 0.02), gasketM, x, y, -0.012, door);
  mesh(rbox(0.03, 0.5, 0.04, 0.012), tm(0.38, { shade: 0.1 }), W - 0.05, 1.2, 0.085, door);
  const sealM = tm(0.52, { shade: 0.05, rim: 0, ghost: true });
  for (const [w, h, x, y] of [[W + 0.004, 0.012, 0, Hh + 0.035], [W + 0.004, 0.012, 0, 0.045], [0.012, Hh, -W / 2 - 0.002, Hh / 2 + 0.04], [0.012, Hh, W / 2 + 0.002, Hh / 2 + 0.04]]) { const sm = mesh(new THREE.BoxGeometry(w, h, 0.014), sealM, x, y, z0 + 0.006, FR); panels.push(sm); }
  // fridge magnet with AUDIRA (slightly warm, it is in the room air)
  const magT = canvasTex(256, 112, (g, w, h) => { g.fillStyle = "#EA5E28"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 22); g.fill(); g.fillStyle = "#1a0a2a"; g.font = "900 54px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 3); });
  const magnet = mesh(new THREE.PlaneGeometry(0.2, 0.0875), new THREE.MeshBasicMaterial({ map: magT, transparent: true, toneMapped: false }), W / 2 - 0.08, 1.48, 0.062, door);

  // ================= refrigerant loop (physical + schematic in one) =================
  const XE = 0.14;
  const P = [];
  // evaporator: serpentine rows inside the top of the cabinet
  const evRows = [1.7, 1.6, 1.5, 1.4];
  evRows.forEach((y, i) => { const a = i % 2 ? 0.22 : -0.22, b = i % 2 ? -0.22 : 0.22; P.push([XE, y, a], [XE, y, b]); });
  const iEvapEnd = P.length - 1;
  // suction line down the inside back to the compressor behind the cabinet
  P.push([0.2, 1.32, -0.27], [0.21, 0.5, -0.29], [0.21, 0.3, -0.4]);
  const iComp = P.length; P.push([0.2, 0.2, -0.52]);
  P.push([0.24, 0.3, -0.5]);
  // condenser: rows across the back, entering hot at the bottom
  const cRows = []; for (let y = 0.42; y <= 1.63; y += 0.11) cRows.push(+y.toFixed(3));
  const iCond = P.length;
  cRows.forEach((y, i) => { const a = i % 2 ? -0.27 : 0.27, b = i % 2 ? 0.27 : -0.27; P.push([a, y, -0.45], [b, y, -0.45]); });
  const iCondEnd = P.length - 1;
  const lastX = P[iCondEnd][0];
  P.push([lastX * 0.6, 1.74, -0.44]);
  const iValve = P.length; P.push([0.02, 1.775, -0.4]);
  P.push([0.08, 1.76, -0.3], [XE, 1.73, -0.25]);
  const NP = P.length;
  const loopPts = P.map((p) => new THREE.Vector3(...p));
  const SEGS = 900;
  const loopCur = new THREE.CatmullRomCurve3(loopPts, true, "centripetal");
  // parameter of each control point along the curve (CatmullRom t is uniform per control point)
  const tOf = (i) => i / NP;
  // heat along the loop: cold after the valve, absorbing in the evaporator, jump at the compressor, releasing in the condenser
  function heatAt(u) {
    u = ((u % 1) + 1) % 1;
    const tc = tOf(iComp), te = tOf(iEvapEnd), tcs = tOf(iCond), tce = tOf(iCondEnd), tv = tOf(iValve);
    if (u < te) return 0.12 + 0.16 * (u / te);
    if (u < tc - 0.006) return 0.28 + 0.04 * ((u - te) / (tc - 0.006 - te));
    if (u < tcs) return 0.32 + 0.54 * clamp01((u - tc + 0.006) / (tcs - tc + 0.006));
    if (u < tce) return 0.86 - 0.36 * ((u - tcs) / (tce - tcs));
    if (u < tv - 0.004) return 0.5;
    if (u < tv + 0.012) return 0.5 - 0.38 * clamp01((u - tv + 0.004) / 0.016);
    return 0.12;
  }
  const tubeG = new THREE.TubeGeometry(loopCur, SEGS, 0.013, 8, true);
  { const n = tubeG.attributes.position.count, aH = new Float32Array(n); for (let i = 0; i < n; i++) aH[i] = heatAt(Math.floor(i / 9) / SEGS); tubeG.setAttribute("aH", new THREE.BufferAttribute(aH, 1)); }
  const tubeM = tm(0, { attr: 1, shade: 0.08, rim: -0.05, spec: 0.16 });
  const tube = mesh(tubeG, tubeM, 0, 0, 0, FR);
  const segIdx = (u) => Math.round(u * SEGS) * 8 * 6;
  const physA = tOf(iComp) - 0.02, physB = tOf(iValve) + 0.01;
  // condenser grid wires (vertical), hot at the bottom where the hot gas enters
  const wireG = new THREE.CylinderGeometry(0.004, 0.004, 1.26, 4);
  { const n = wireG.attributes.position.count, aH = new Float32Array(n); for (let i = 0; i < n; i++) aH[i] = 0.82 - 0.3 * (wireG.attributes.position.getY(i) / 1.26 + 0.5); wireG.setAttribute("aH", new THREE.BufferAttribute(aH, 1)); }
  const wireM = tm(-0.04, { attr: 1, shade: 0.04, spec: 0.1 });
  for (let i = 0; i < 13; i++) mesh(wireG, wireM, -0.27 + i * 0.045, 1.03, -0.462, FR);
  // compressor: a domed canister on rubber feet with a small AUDIRA rating plate
  const compM = tm(0.6, { shade: 0.14, rim: -0.1, spec: 0.2 });
  const comp3 = new THREE.Group(); comp3.position.set(0.2, 0.06, -0.52); FR.add(comp3);
  const dome = mesh(lathe([[0.001, 0], [0.12, 0.0], [0.135, 0.05], [0.135, 0.16], [0.11, 0.24], [0.06, 0.275], [0.001, 0.28]]), compM, 0, 0, 0, comp3);
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.03, 10), tm(0.4), s * 0.09, -0.01, 0, comp3);
  const plateT = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#14082a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#00E5FF"; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = "#00E5FF"; g.font = "900 46px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 2); });
  const plate = mesh(new THREE.PlaneGeometry(0.15, 0.056), new THREE.MeshBasicMaterial({ map: plateT, toneMapped: false }), 0.0, 0.12, -0.137, comp3); plate.rotation.y = Math.PI;
  // expansion valve: a small block with a narrow throat
  const valveM = tm(0.45, { shade: 0.12, rim: 0.02, spec: 0.18 });
  const valve = new THREE.Group(); valve.position.copy(loopCur.getPoint(tOf(iValve))); FR.add(valve);
  mesh(rbox(0.07, 0.05, 0.05, 0.01), valveM, 0, 0, 0, valve);
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 12), valveM, 0, 0.045, 0, valve);
  const valveRing = mesh(new THREE.TorusGeometry(0.075, 0.006, 8, 40), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, depthTest: false, toneMapped: false }), 0, 0, 0, valve);
  valveRing.renderOrder = 25;

  // component tags (HUD-style, always on top), placed beside each part
  const tags = {
    comp: { m: tag("KOMPRESOR"), p: new THREE.Vector3(0.62, 0.42, -0.72), at: A("s3:kompresor") },
    cond: { m: tag("KONDENSOR"), p: new THREE.Vector3(0.3, 1.05, -0.95), at: A("s3:kondensor") },
    valve: { m: tag("KATUP EKSPANSI", { w: 820 }), p: new THREE.Vector3(0.25, 1.98, -0.55), at: A("s3:katup") },
    evap: { m: tag("EVAPORATOR"), p: new THREE.Vector3(0.6, 1.62, 0.35), at: A("s3:evaporator") },
  };
  Object.values(tags).forEach((g) => { g.m.scale.setScalar(0.85); scene.add(g.m); });
  const pTag = { hi: tag("TEKANAN TINGGI", { w: 820, line: "#F7D038" }), lo: tag("TEKANAN RENDAH", { w: 820, line: "#8A5CFF" }) };
  scene.add(pTag.hi, pTag.lo); pTag.hi.position.set(-0.45, 0.78, -0.75); pTag.lo.position.set(0.32, 1.95, -0.08); pTag.hi.userData.base = pTag.hi.position.clone(); pTag.lo.userData.base = pTag.lo.position.clone();

  // refrigerant particles: two sizes, liquid (dense, larger) and vapour (sparse, smaller)
  const NR = 520;
  const vap = pts(scene, NR, { size: 0.03, opacity: 0.95 }), liq = pts(scene, NR, { size: 0.045, opacity: 0.95 });
  vap.P.renderOrder = liq.P.renderOrder = 5;
  // speed along the loop: liquid crawls (dense), vapour rushes (sparse)
  const tce = tOf(iCondEnd), tv = tOf(iValve), tcs = tOf(iCond);
  const isLiquid = (u) => (u > tcs + (tce - tcs) * 0.62 && u < tv + 0.006);
  const speed = (u) => (isLiquid(u) ? 0.35 : 1.25);
  const CUM = new Float32Array(1001); { let s = 0; for (let i = 0; i <= 1000; i++) { CUM[i] = s; s += 1 / speed(i / 1000); } for (let i = 0; i <= 1000; i++) CUM[i] /= s; }
  const inv = (p) => { let lo = 0, hi = 1000; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CUM[m] < p) lo = m; else hi = m; } return (lo + (p - CUM[lo]) / Math.max(1e-6, CUM[hi] - CUM[lo])) / 1000; };
  const rSeed = Array.from({ length: NR }, () => [rnd(), rnd(), rnd()]);

  // heat-flow arrows (overlay): inside -> back -> room, cold violet becoming hot amber
  function arrow(points, r, h0, h1) {
    const cur = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const g = new THREE.TubeGeometry(cur, 120, r, 10, false);
    const n = g.attributes.position.count, aH = new Float32Array(n);
    for (let i = 0; i < n; i++) aH[i] = h0 + (h1 - h0) * (Math.floor(i / 11) / 120);
    g.setAttribute("aH", new THREE.BufferAttribute(aH, 1));
    const m = tm(0, { attr: 1, shade: 0.04, rim: 0 }); m.depthTest = false; m.transparent = true;
    const tube = mesh(g, m, 0, 0, 0, scene); tube.renderOrder = 20;
    const head = mesh(new THREE.ConeGeometry(r * 2.0, r * 5, 18), tm(h1 + 0.02, { shade: 0.04, rim: 0 }), 0, 0, 0, scene); head.material.depthTest = false; head.material.transparent = true; head.renderOrder = 21;
    return { cur, g, tube, head, m, set(f, op) {
      f = clamp01(f); tube.visible = head.visible = f > 0.003 && op > 0.01;
      g.setDrawRange(0, Math.floor(120 * f) * 10 * 6); U(m).uOp.value = op; U(head.material).uOp.value = op;
      const p = cur.getPointAt(Math.max(0.001, f)), tg = cur.getTangentAt(Math.max(0.001, f));
      head.position.copy(p); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
    } };
  }
  const arrIn = arrow([[0.02, 1.0, 0.26], [0.0, 1.08, 0.02], [0.0, 1.2, -0.36], [0.02, 1.55, -0.72], [0.04, 2.15, -0.95]], 0.034, 0.12, 0.8);
  const arrOut = [
    arrow([[0.0, 1.35, -0.5], [0.05, 1.5, -0.95], [0.1, 1.85, -1.45], [0.15, 2.35, -1.8]], 0.03, 0.62, 0.84),
    arrow([[0.18, 0.9, -0.5], [0.35, 1.0, -0.95], [0.6, 1.25, -1.45], [0.85, 1.6, -1.8]], 0.03, 0.62, 0.82),
    arrow([[-0.18, 0.9, -0.5], [-0.3, 1.02, -0.95], [-0.5, 1.3, -1.45], [-0.7, 1.7, -1.8]], 0.03, 0.62, 0.82),
  ];

  // frost crystals on the evaporator rows: tiny twinkling points
  const NF = 160;
  const frostP = pts(scene, NF, { size: 0.018, opacity: 1 });
  const fSeed = Array.from({ length: NF }, () => [rnd(), rnd(), rnd(), rnd()]);
  // warm air rising off the condenser into the room
  const NPL = 260;
  const plume = pts(scene, NPL, { size: 0.05, opacity: 0.55 });
  const plSeed = Array.from({ length: NPL }, () => [rnd(), rnd(), rnd(), rnd()]);
  // heat leaving the warm bowl toward the evaporator (s4)
  const NB = 120;
  const bst = pts(scene, NB, { size: 0.03, opacity: 0.9 });
  const bSeed = Array.from({ length: NB }, () => [rnd(), rnd(), rnd()]);

  // ================= hand (s2) =================
  const handG = new THREE.Group(); scene.add(handG);
  { const skin = tm(0.6, { shade: 0.08, rim: -0.08 }), sleeve = tm(0.43, { shade: 0.12, rim: -0.05 });
    const handIn = new THREE.Group(); handG.add(handIn); handG.userData.skin = skin;
    mesh(new THREE.CapsuleGeometry(0.03, 0.06, 6, 12), skin, 0, 0, 0, handIn).scale.set(1.45, 1, 0.55);
    const fl = [[-0.026, 0.07, 0.05], [-0.009, 0.078, 0.058], [0.009, 0.076, 0.055], [0.026, 0.068, 0.045]];
    fl.forEach(([x, y, l], i) => { const f = new THREE.Group(); f.position.set(x, y - 0.02, 0); f.rotation.z = (i - 1.5) * -0.07; handIn.add(f); mesh(new THREE.CapsuleGeometry(0.0085, l, 4, 8), skin, 0, l / 2 + 0.005, 0, f); f.rotation.x = 0.18; });
    const th = new THREE.Group(); th.position.set(0.036, 0.0, 0.004); th.rotation.z = -0.9; handIn.add(th); mesh(new THREE.CapsuleGeometry(0.01, 0.04, 4, 8), skin, 0, 0.025, 0, th);
    mesh(new THREE.CapsuleGeometry(0.03, 0.3, 6, 12), skin, 0, -0.2, 0, handIn).scale.set(1.1, 1, 0.8);
    mesh(new THREE.CapsuleGeometry(0.046, 0.5, 6, 12), sleeve, 0, -0.62, 0, handIn); }

  // ================= history corner (s7) =================
  const HI = new THREE.Group(); scene.add(HI);
  const HC = new THREE.Vector3(7.2, 0, -0.9), HB = new THREE.Vector3(6.0, 0, 0.0);
  const faceY = Math.atan2(-0.6, -0.8);
  const cul = new THREE.Group(); cul.position.copy(HC); cul.rotation.y = faceY; HI.add(cul);
  const woodM = tm(0.3, { shade: 0.12, rim: 0.03, tex: 0.06 });
  mesh(rbox(1.0, 0.05, 0.6, 0.01), woodM, 0, 0.8, 0, cul);
  for (const x of [-0.45, 0.45]) for (const z of [-0.25, 0.25]) mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.78, 8), woodM, x, 0.39, z, cul);
  const baseM = tm(0.4, { shade: 0.12 });
  mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 32), baseM, 0.12, 0.845, 0.02, cul);
  const frostM = tm(0.1, { shade: 0, rim: 0 }); frostM.transparent = true;
  const frost = mesh(new THREE.CircleGeometry(0.2, 40), frostM, 0.12, 0.868, 0.02, cul); frost.rotation.x = -Math.PI / 2;
  const flaskM = tm(0.42, { shade: 0.1, rim: 0.08 });
  const flask = mesh(lathe([[0.001, 0], [0.04, 0.005], [0.075, 0.04], [0.085, 0.085], [0.07, 0.13], [0.025, 0.16], [0.02, 0.26], [0.024, 0.27]]), flaskM, 0.12, 0.865, 0.02, cul);
  flask.material.side = THREE.DoubleSide;
  const jarM = tm(0.28, { shade: 0.0, rim: 0.3, op: 0.3, depthWrite: false, side: THREE.DoubleSide });
  mesh(lathe([[0.2, 0], [0.205, 0.25], [0.18, 0.38], [0.11, 0.45], [0.04, 0.47], [0.03, 0.52], [0.001, 0.53]]), jarM, 0.12, 0.865, 0.02, cul);
  // vacuum pump beside the jar
  mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.32, 14), tm(0.42, { shade: 0.12 }), -0.28, 1.0, 0.05, cul);
  mesh(new THREE.BoxGeometry(0.2, 0.02, 0.02), tm(0.4), -0.28, 1.18, 0.05, cul);
  mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), tm(0.38), -0.13, 0.88, 0.04, cul).rotation.z = Math.PI / 2;
  const bub = pts(scene, 70, { size: 0.016, opacity: 0.9 });
  const bubSeed = Array.from({ length: 70 }, () => [rnd(), rnd(), rnd()]);
  const fig = person({ skin: 0.62, head: 0.74, coat: 0.42, legs: 0.4, hair: 0.5 });
  fig.G.position.set(-0.32, 0, -0.55); fig.G.rotation.y = 0.35; cul.add(fig.G);
  fig.armR.sh.rotation.set(-0.7, 0, -0.25); fig.armR.el.rotation.x = -0.9;
  fig.armL.sh.rotation.set(-0.15, 0, 0.12); fig.armL.el.rotation.x = -0.5;
  fig.legL.kn.rotation.x = 0.08; fig.legR.kn.rotation.x = 0.12; fig.legL.hip.rotation.x = -0.04;
  const nameTag = tag("WILLIAM CULLEN", { w: 820 }); nameTag.scale.setScalar(0.9); scene.add(nameTag); nameTag.position.copy(HC).add(new THREE.Vector3(0, 1.95, 0));
  // 1915 home cabinet: wooden box on legs with the cooling machine on top
  const old = new THREE.Group(); old.position.copy(HB); old.rotation.y = faceY; HI.add(old);
  const oM = tm(0.3, { shade: 0.16, rim: 0.04, tex: 0.06 }), oIn = tm(0.22, { shade: 0.1 });
  mesh(rbox(0.66, 1.2, 0.55, 0.02), oM, 0, 0.78, 0, old);
  for (const x of [-0.29, 0.29]) for (const z of [-0.22, 0.22]) mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.18, 8), oM, x, 0.09, z, old);
  for (const [y, h] of [[1.08, 0.5], [0.52, 0.56]]) { mesh(rbox(0.56, h, 0.03, 0.01), oIn, 0, y, 0.28, old); mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), tm(0.4), 0.22, y, 0.31, old); }
  const machM = tm(0.6, { shade: 0.12, rim: -0.06, spec: 0.12 });
  mesh(rbox(0.5, 0.2, 0.4, 0.02), machM, 0, 1.49, 0, old);
  mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 18), tm(0.68, { shade: 0.1 }), 0, 1.66, 0, old).rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) mesh(new THREE.TorusGeometry(0.16, 0.008, 6, 30), tm(0.55, { shade: 0.05 }), 0, 1.62, -0.12 + i * 0.03, old).rotation.y = Math.PI / 2 * 0;
  const yearTag = tag("1915", { w: 360, line: "#F7D038", font: "900 72px Arial, sans-serif" }); yearTag.scale.setScalar(0.9); scene.add(yearTag); yearTag.position.copy(HB).add(new THREE.Vector3(0, 1.95, 0));

  // ================= blurred near foreground =================
  scene.add(cam);
  const fgT = canvasTex(256, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.filter = "blur(22px)"; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#9B1D8C"); gr.addColorStop(0.6, "#EA5E28"); gr.addColorStop(1, "#7a1870"); g.fillStyle = gr;
    g.beginPath(); g.roundRect(60, 120, 140, 360, 40); g.fill(); g.beginPath(); g.roundRect(95, 60, 70, 90, 20); g.fill(); });
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.15), new THREE.MeshBasicMaterial({ map: fgT, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false, toneMapped: false }));
  fg.renderOrder = 40; fg.position.set(-0.088, -0.03, -0.5); cam.add(fg);

  // ================= camera =================
  const s1p = A("s1:panas"), s2p = A("s2:pipa"), s2d = A("s2:dibuang");
  const CAM = track([
    [0, 4.3, 2.05, 1.9, -0.05, 0.98, -0.2],
    [s1p, 4.45, 2.1, 1.35, -0.05, 1.0, -0.25],
    [K.s2 + 0.2, 2.6, 1.5, -1.4, 0.03, 1.0, -0.4],
    [s2p, 1.05, 1.15, -2.4, 0.08, 1.02, -0.45],
    [s2d, 0.95, 1.12, -2.2, 0.08, 1.02, -0.45],
    [K.s3 + 0.5, 3.0, 3.6, -2.65, 0.05, 0.92, -0.15],
    [A("s3:evaporator"), 3.2, 3.75, -2.85, 0.05, 0.92, -0.15],
    [K.s4 + 0.7, 1.95, 1.68, -0.85, 0.06, 1.44, -0.04],
    [A("s4:makanan"), 1.8, 1.6, -0.72, 0.04, 1.38, 0.0],
    [K.s4e, 1.85, 1.58, -0.78, 0.04, 1.36, 0.0],
    [A("s5:kompresor"), 1.0, 0.12, -1.5, 0.16, 0.3, -0.5],
    [A("s5:panas"), 0.92, 0.12, -1.42, 0.16, 0.32, -0.5],
    [A("s5:kondensor"), 2.6, 1.45, -1.95, -0.05, 1.0, -0.65],
    [A("s5:mengembun"), 2.85, 1.5, -2.1, -0.05, 1.02, -0.7],
    [A("s6:katup"), 0.6, 1.92, -0.95, 0.03, 1.77, -0.4],
    [A("s6:turun"), 0.55, 1.9, -0.88, 0.03, 1.77, -0.39],
    [A("s6:turun") + 0.8, 2.3, 3.1, 1.3, 0.0, 0.95, -0.2],
    [A("s6:Siklus"), 2.45, 3.2, 1.45, 0.0, 0.95, -0.2],
    [K.s6e, 2.6, 3.25, 1.6, 0.0, 0.95, -0.2],
    [A("s7:William"), 4.4, 1.6, -4.6, 7.2, 1.15, -0.9],
    [A("s7:sekitarnya"), 4.6, 1.58, -4.35, 7.2, 1.15, -0.9],
    [A("s7:Kulkas"), 3.35, 1.75, -3.55, 6.0, 1.32, 0.0],
    [K.s7e, 3.25, 1.77, -3.7, 6.0, 1.32, 0.0],
    [K.s8 + 0.6, 4.3, 2.5, -4.4, -0.5, 1.0, -0.6],
    [K.end, 4.6, 2.65, -4.7, -0.5, 1.05, -0.6],
    [K.dur, 4.65, 2.67, -4.75, -0.5, 1.05, -0.6],
  ]);

  // ================= thermal markers (DOM) =================
  const root = canvas.parentElement;
  const mkCss = document.createElement("style");
  mkCss.textContent = `.tmk{position:absolute;left:0;top:0;width:0;height:0;z-index:9;pointer-events:none}
  .tmk .bx{position:absolute;left:-46px;top:-46px;width:92px;height:92px;background:
  linear-gradient(#00E5FF,#00E5FF) 0 0/24px 4px no-repeat,linear-gradient(#00E5FF,#00E5FF) 0 0/4px 24px no-repeat,
  linear-gradient(#00E5FF,#00E5FF) 100% 0/24px 4px no-repeat,linear-gradient(#00E5FF,#00E5FF) 100% 0/4px 24px no-repeat,
  linear-gradient(#00E5FF,#00E5FF) 0 100%/24px 4px no-repeat,linear-gradient(#00E5FF,#00E5FF) 0 100%/4px 24px no-repeat,
  linear-gradient(#00E5FF,#00E5FF) 100% 100%/24px 4px no-repeat,linear-gradient(#00E5FF,#00E5FF) 100% 100%/4px 24px no-repeat}
  .tmk .dot{position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 10px #fff}
  .tmk .lb{position:absolute;left:56px;top:-22px;font-family:'Share Tech Mono','Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:.06em;padding:4px 14px 2px;box-shadow:0 0 0 3px #0A0A10;color:#0A0A10;white-space:nowrap}`;
  root.appendChild(mkCss);
  const mk = (n) => Array.from({ length: n }, () => { const e = document.createElement("div"); e.className = "tmk"; e.innerHTML = '<div class="bx"></div><div class="dot"></div><div class="lb"></div>'; root.appendChild(e); return { e, lb: e.querySelector(".lb"), key: "" }; });
  const MK = mk(2);
  const sptr = document.querySelector("#sptr");
  const pv = new THREE.Vector3();
  function place(m, p, text, hot, op) {
    if (!p || op <= 0.01) { m.e.style.visibility = "hidden"; return; }
    pv.copy(p).project(cam);
    if (pv.z > 1 || pv.z < -1) { m.e.style.visibility = "hidden"; return; }
    const x = (pv.x * 0.5 + 0.5) * 1080, y = (-pv.y * 0.5 + 0.5) * 1920;
    m.e.style.visibility = "visible"; m.e.style.opacity = op.toFixed(3);
    m.e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    const k = text + hot; if (k !== m.key) { m.key = k; m.lb.textContent = text; m.lb.style.background = hot ? "#F7D038" : "#B9A2FF"; }
    if (x > 760) { m.lb.style.left = "auto"; m.lb.style.right = "56px"; } else { m.lb.style.left = "56px"; m.lb.style.right = "auto"; }
  }
  const W3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const pb = new THREE.Vector3();
  const band = (p) => { pb.copy(p).project(cam); if (pb.z > 1) return 0; const y = (-pb.y * 0.5 + 0.5) * 1920; return clamp01((y - 640) / 50) * clamp01((1180 - y) / 50); };
  // keeps a camera-facing tag (about 330 px wide) fully inside the frame by sliding it along the camera's right axis
  const camR = new THREE.Vector3();
  const keepIn = (m, base) => { m.position.copy(base); pb.copy(base).project(cam); const x = (pb.x * 0.5 + 0.5) * 1080, d = cam.position.distanceTo(base);
    const hw = Math.min(500, (m.userData.pw || 0.62) * m.scale.x / (0.387 * d) * 540) + 24; const cx = Math.min(1080 - hw - 110, Math.max(hw, x)); if (cx !== x) { camR.setFromMatrixColumn(cam.matrixWorld, 0); m.position.addScaledVector(camR, (cx - x) * 0.387 * d / 1080); } return m.position; };

  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Vector3();
  return function draw(t) {
    // ---------- camera ----------
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); cam.updateMatrixWorld();

    // ---------- door + cutaway ghost ----------
    const dOpen = 0;
    door.rotation.y = -1.95 * dOpen;
    const ghost = Math.max(0.62 * (1 - ramp(t, K.s2 - 0.2, K.s2 + 0.8)), ramp(t, A("s3:Kuncinya"), A("s3:Kuncinya") + 1.0) * (1 - ramp(t, K.s7 - 0.2, K.s7 + 0.6)));
    const sop = 1 - 0.84 * ghost;
    for (const m of [shellM, doorM, gasketM, sealM]) { U(m).uOp.value = sop; m.depthWrite = sop > 0.98; }
    U(linerM).uOp.value = 1 - 0.75 * ghost; linerM.depthWrite = ghost < 0.02;
    U(shelfM).uOp.value = 1 - 0.55 * ghost;
    for (const m of foodM) { U(m).uOp.value = 1 - 0.25 * ghost; }
    // in ghost mode the cabinet edges catch a cyan-ish rim so the outline stays readable
    U(shellM).uRim.value = 0.05 + 0.25 * ghost; U(doorM).uRim.value = 0.05 + 0.25 * ghost;

    // ---------- refrigerant loop reveal ----------
    const rv = ramp(t, A("s3:Kuncinya") + 0.3, A("s3:berputar"));
    const ua = physA * (1 - rv), ub = physB + (1 - physB) * rv;
    tubeG.setDrawRange(segIdx(ua), Math.max(0, segIdx(ub) - segIdx(ua)));
    const comps = { comp: A("s3:kompresor"), cond: A("s3:kondensor"), valve: A("s3:katup"), evap: A("s3:evaporator") };
    const loopOn = t > K.s3 - 0.2 && t < K.s7 + 0.2;
    // component highlight pulse on its name
    const pulse = (a) => (t > a ? Math.exp(-(t - a) * 2.2) : 0);
    U(tubeM).uHeat.value = 0.0 + 0.06 * Math.max(pulse(comps.cond), pulse(comps.evap));
    // compressor: runs all the time, works hard in s5
    const sq = ramp(t, A("s5:ditekan") - 0.2, A("s5:panas"));
    const pump = Math.sin(t * Math.PI * 2 * 3.0);
    dome.scale.set(1 + 0.012 * pump + 0.03 * sq * Math.max(0, pump), 1 - 0.02 * sq * Math.max(0, pump), 1 + 0.012 * pump);
    U(compM).uHeat.value = 0.58 + 0.2 * sq + 0.08 * pulse(comps.comp);
    U(valveM).uHeat.value = 0.45 + 0.1 * pulse(comps.valve);
    const vring = Math.max(pulse(comps.valve), ramp(t, A("s6:katup") - 0.2, A("s6:katup") + 0.2) * (1 - ramp(t, A("s6:turun") + 0.2, A("s6:turun") + 0.5)));
    valveRing.material.opacity = 0.85 * vring; valveRing.scale.setScalar(1 + 0.15 * Math.sin(t * 6)); valveRing.lookAt(cam.position);

    // tags
    for (const k in tags) {
      const g = tags[k]; const vis = ramp(t, g.at - 0.05, g.at + 0.3) * (1 - ramp(t, K.s7 - 0.4, K.s7));
      g.m.scale.setScalar(0.24 * cam.position.distanceTo(g.p) * (0.85 + 0.15 * eout((t - g.at) / 0.3)));
      const vb = vis * band(keepIn(g.m, g.p)); g.m.visible = vb > 0.01; g.m.material.opacity = vb; g.m.quaternion.copy(cam.quaternion);
    }
    // pressure tags (s5/s6)
    const ph = ramp(t, A("s5:bertekanan"), A("s5:bertekanan") + 0.3) * (1 - ramp(t, A("s6:katup") - 0.3, A("s6:katup")));
    pTag.hi.visible = ph > 0.01; pTag.hi.scale.setScalar(0.24 * cam.position.distanceTo(pTag.hi.userData.base)); pTag.hi.material.opacity = ph * band(keepIn(pTag.hi, pTag.hi.userData.base)); pTag.hi.quaternion.copy(cam.quaternion); 
    const pl = ramp(t, A("s6:Tekanannya"), A("s6:Tekanannya") + 0.3) * (1 - ramp(t, A("s6:Siklus") + 0.4, A("s6:Siklus") + 0.8));
    pTag.lo.visible = pl > 0.01; pTag.lo.scale.setScalar(0.24 * cam.position.distanceTo(pTag.lo.userData.base)); pTag.lo.material.opacity = pl * band(keepIn(pTag.lo, pTag.lo.userData.base)); pTag.lo.quaternion.copy(cam.quaternion); 

    // ---------- refrigerant particles ----------
    const flowA = ramp(t, A("s3:berputar") - 0.2, A("s3:berputar") + 0.6) * (1 - ramp(t, K.s7, K.s7 + 0.5));
    const run = Math.max(0, t - (A("s3:berputar") - 0.2));
    let nv = 0, nl = 0;
    for (let i = 0; i < NR; i++) {
      const s = rSeed[i];
      const u = inv(((i + s[0] * 0.6) / NR + run * 0.055) % 1);
      loopCur.getPoint(u, tmpV);
      const liqd = isLiquid(u);
      const spread = liqd ? 0.006 : 0.016;
      tmpV.x += (s[1] - 0.5) * spread; tmpV.y += (s[2] - 0.5) * spread; tmpV.z += (s[0] - 0.5) * spread;
      const h = heatAt(u) + 0.06;
      ironbow(h);
      const buf = liqd ? liq : vap; const j = liqd ? nl++ : nv++;
      buf.pos[j * 3] = tmpV.x; buf.pos[j * 3 + 1] = tmpV.y; buf.pos[j * 3 + 2] = tmpV.z;
      const a = flowA * (0.75 + 0.25 * h);
      buf.col[j * 3] = _c.r * a + 0.04 * a; buf.col[j * 3 + 1] = _c.g * a + 0.04 * a; buf.col[j * 3 + 2] = _c.b * a + 0.08 * a;
    }
    for (let j = nv; j < NR; j++) vap.pos[j * 3 + 1] = -100;
    for (let j = nl; j < NR; j++) liq.pos[j * 3 + 1] = -100;
    vap.P.visible = liq.P.visible = flowA > 0.01 && loopOn;
    vap.commit(); liq.commit();

    // ---------- heat arrows ----------
    const a1 = ramp(t, A("s1:memindahkan") - 0.1, A("s1:luar") + 0.2) + ramp(t, A("s8:Jadi"), A("s8:dingin")) * (t > K.s8 ? 1 : 0);
    const a1op = t < K.s8 ? 1 - ramp(t, K.s2 + 0.6, K.s2 + 1.2) : ramp(t, K.s8 - 0.1, K.s8 + 0.3);
    arrIn.set(t < K.s8 ? a1 : ramp(t, A("s8:Jadi"), A("s8:dingin")), a1op * 0.95);
    const ao = ramp(t, A("s8:pengangkut") - 0.2, A("s8:panas") + 0.4);
    const s2a = ramp(t, s2d - 0.1, s2d + 0.9) * (1 - ramp(t, K.s3 - 0.3, K.s3 + 0.2));
    arrOut.forEach((ar, i) => { const f = t > K.s8 - 0.2 ? clamp01(ao * 1.25 - i * 0.12) : clamp01(s2a * 1.2 - i * 0.12); ar.set(f, 0.92 * (t > K.s8 - 0.2 ? 1 : s2a > 0 ? 1 : 0)); });

    // ---------- warm air plume off the condenser ----------
    const plA = 0.55 + 0.45 * Math.max(ramp(t, s2d - 0.4, s2d + 0.4) * (1 - ramp(t, K.s3, K.s3 + 0.6)), ramp(t, A("s5:melepas") - 0.2, A("s5:melepas") + 0.4) * (1 - ramp(t, K.s6, K.s6 + 0.5)), ramp(t, K.s8, K.s8 + 0.6));
    for (let i = 0; i < NPL; i++) {
      const s = plSeed[i], life = 3.2 + s[3] * 1.5, u = ((t / life) + s[0]) % 1;
      const x = -0.28 + s[1] * 0.56, y = 0.45 + s[2] * 1.1 + u * 1.5, z = -0.5 - u * 0.55 - 0.08 * Math.sin(u * 5 + s[1] * 9);
      plume.pos[i * 3] = x + 0.06 * Math.sin(t * 0.9 + s[2] * 12 + u * 4); plume.pos[i * 3 + 1] = y; plume.pos[i * 3 + 2] = z;
      ironbow(0.78 - 0.4 * u);
      const a = plA * Math.sin(Math.PI * u) * 0.6;
      plume.col[i * 3] = _c.r * a; plume.col[i * 3 + 1] = _c.g * a; plume.col[i * 3 + 2] = _c.b * a;
    }
    plume.P.visible = t < K.s7 - 0.3 || t > K.s8 - 0.5;
    plume.commit();

    // ---------- frost sparkle ----------
    const fA = ramp(t, A("s3:evaporator") - 0.3, A("s3:evaporator") + 0.3) * (1 - ramp(t, K.s7 - 0.4, K.s7));
    for (let i = 0; i < NF; i++) {
      const s = fSeed[i], row = Math.floor(s[0] * 4), y = evRows[row];
      frostP.pos[i * 3] = XE + (s[3] - 0.5) * 0.03; frostP.pos[i * 3 + 1] = y + (s[2] - 0.5) * 0.03; frostP.pos[i * 3 + 2] = -0.22 + s[1] * 0.44;
      const tw = Math.pow(0.5 + 0.5 * Math.sin(t * (3 + s[2] * 5) + s[3] * 40), 6) * fA;
      frostP.col[i * 3] = 0.55 * tw; frostP.col[i * 3 + 1] = 0.6 * tw; frostP.col[i * 3 + 2] = 1.0 * tw;
    }
    frostP.P.visible = fA > 0.01; frostP.commit();

    // ---------- warm bowl cools (s4) ----------
    const bIn = ramp(t, K.s4 - 0.3, K.s4 + 0.4);
    const cool = ramp(t, A("s4:menyerap"), A("s4:dingin"));
    bowl.visible = t > K.s4 - 0.3 && t < K.s7;
    bowl.position.set(0.08, 1.31 + 0.05 * (1 - bIn), 0.06 + 0.25 * (1 - bIn));
    U(bowlM).uHeat.value = 0.7 - 0.48 * cool; U(rimM).uHeat.value = 0.8 - 0.5 * cool; U(bowlTop).uHeat.value = 0.8 - 0.56 * cool;
    const bA = ramp(t, A("s4:menyerap") - 0.3, A("s4:menyerap") + 0.3) * (1 - ramp(t, A("s4:Itulah"), K.s4e));
    for (let i = 0; i < NB; i++) {
      const s = bSeed[i], u = ((t * 0.55) + s[0]) % 1;
      const x = 0.08 + (s[1] - 0.5) * 0.12 * (1 - u) + (XE - 0.08) * u, y = 1.39 + u * 0.27, z = 0.06 + (s[2] - 0.5) * 0.14 + 0.05 * Math.sin(u * 6 + s[1] * 7);
      bst.pos[i * 3] = x; bst.pos[i * 3 + 1] = y; bst.pos[i * 3 + 2] = z;
      ironbow((0.72 - 0.45 * cool) - 0.45 * u);
      const a = bA * Math.sin(Math.PI * u);
      bst.col[i * 3] = _c.r * a; bst.col[i * 3 + 1] = _c.g * a; bst.col[i * 3 + 2] = _c.b * a;
    }
    bst.P.visible = bA > 0.01; bst.commit();
    // food gets a touch colder through s4
    U(foodM[0]).uHeat.value = 0.17 - 0.04 * cool; U(foodM[2]).uHeat.value = 0.2 - 0.05 * cool;

    // ---------- hand (s2) ----------
    const hIn = ramp(t, A("s2:dekatkan") - 0.2, s2p + 0.3), hOut = ramp(t, K.s2e - 0.4, K.s3 + 0.3);
    const hk = hIn * (1 - hOut);
    handG.visible = hk > 0.01 && t < K.s3 + 0.4;
    handG.position.set(0.02 + 1.1 * (1 - hk), 1.05 + 0.02 * Math.sin(t * 1.1), -0.6);
    handG.rotation.set(0.15, 0.0, 1.45 + 0.03 * Math.sin(t * 1.3));
    U(handG.userData.skin).uHeat.value = 0.58 + 0.1 * ramp(t, A("s2:hangat") - 0.4, A("s2:hangat") + 0.6);

    // ---------- history (s7) ----------
    HI.visible = t > K.s7 - 1.0 && t < K.s8 + 0.4;
    const boil = ramp(t, A("s7:mendidihkan"), A("s7:mendidihkan") + 0.4), absorb = ramp(t, A("s7:menyerap") - 0.2, A("s7:sekitarnya") + 0.6);
    U(flaskM).uHeat.value = 0.42 - 0.3 * absorb;
    frost.scale.setScalar(0.3 + 0.9 * absorb); U(frostM).uOp.value = 0.95 * absorb; U(frostM).uHeat.value = 0.1;
    const fl = flask.getWorldPosition(tmpQ);
    for (let i = 0; i < 70; i++) {
      const s = bubSeed[i], u = ((t * (0.9 + s[2])) + s[0]) % 1;
      const ang = s[1] * 6.283, rr = 0.05 * (1 - u * 0.6);
      bub.pos[i * 3] = fl.x + Math.cos(ang) * rr; bub.pos[i * 3 + 1] = fl.y + 0.02 + u * 0.11; bub.pos[i * 3 + 2] = fl.z + Math.sin(ang) * rr;
      ironbow(0.5 - 0.2 * absorb);
      const a = boil * Math.sin(Math.PI * u);
      bub.col[i * 3] = _c.r * a + 0.1 * a; bub.col[i * 3 + 1] = _c.g * a + 0.1 * a; bub.col[i * 3 + 2] = _c.b * a + 0.15 * a;
    }
    bub.P.visible = HI.visible && boil > 0.01; bub.commit();
    fig.head.rotation.set(0.25, 0.25 + 0.1 * Math.sin(t * 0.6), 0);
    const nt = ramp(t, A("s7:William") - 0.1, A("s7:William") + 0.3) * (1 - ramp(t, A("s7:Kulkas") - 0.4, A("s7:Kulkas")));
    nameTag.visible = nt > 0.01 && HI.visible; nameTag.material.opacity = nt * band(nameTag.position); nameTag.quaternion.copy(cam.quaternion); nameTag.scale.setScalar(0.24 * cam.position.distanceTo(nameTag.position));
    const yt = ramp(t, A("s7:Kulkas"), A("s7:Kulkas") + 0.4) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.2));
    yearTag.visible = yt > 0.01; yearTag.material.opacity = yt * band(yearTag.position); yearTag.scale.setScalar(0.22 * cam.position.distanceTo(yearTag.position)); yearTag.quaternion.copy(cam.quaternion);
    U(machM).uHeat.value = 0.55 + 0.1 * yt;

    // ---------- markers ----------
    const inside = W3(-0.05, 1.02, 0.0);
    if (t < K.s2 + 0.3) {
      place(MK[0], inside, "DINGIN", false, 1 - ramp(t, K.s2 - 0.1, K.s2 + 0.3));
      place(MK[1], W3(0.0, 0.85, -0.47), "PANAS", true, 1 - ramp(t, K.s2 - 0.1, K.s2 + 0.3));
    } else if (t < K.s3) {
      place(MK[0], W3(-0.06, 1.12, -0.46), A("s2:hangat") <= t ? "HANGAT" : "PANAS", true, ramp(t, s2p - 0.3, s2p + 0.2) * (1 - ramp(t, K.s2e - 0.3, K.s3)));
      place(MK[1], null);
    } else if (t < K.s4) { place(MK[0], null); place(MK[1], null); }
    else if (t < K.s5) {
      const bp3 = bowl.getWorldPosition(new THREE.Vector3()).add(W3(0, 0.06, 0));
      place(MK[0], bp3, t > A("s4:dingin") - 0.1 ? "DINGIN" : "HANGAT", t <= A("s4:dingin") - 0.1, ramp(t, K.s4 + 0.4, K.s4 + 0.8) * (1 - ramp(t, K.s4e - 0.3, K.s5)));
      place(MK[1], null);
    } else if (t < K.s6) {
      place(MK[0], W3(0.2, 0.3, -0.52), "PANAS", true, ramp(t, A("s5:panas") - 0.3, A("s5:panas")) * (1 - ramp(t, A("s5:bertekanan") - 0.3, A("s5:bertekanan"))));
      place(MK[1], null);
    } else if (t < K.s7) {
      place(MK[0], loopCur.getPoint(tOf(iValve) + 0.03, tmpV).clone(), "DINGIN", false, ramp(t, A("s6:Tekanannya"), A("s6:Tekanannya") + 0.3) * (1 - ramp(t, A("s6:turun") + 0.2, A("s6:turun") + 0.5)));
      place(MK[1], null);
    } else if (t < K.s8) {
      place(MK[0], fl.clone().add(W3(0, 0.07, 0)), "DINGIN", false, ramp(t, A("s7:menyerap"), A("s7:menyerap") + 0.3) * (1 - ramp(t, A("s7:Kulkas") - 0.4, A("s7:Kulkas"))));
      place(MK[1], null);
    } else {
      place(MK[0], W3(0.0, 1.2, -0.47), "PANAS", true, ramp(t, A("s8:pengangkut"), A("s8:pengangkut") + 0.3) * (1 - ramp(t, K.end - 0.2, K.outro)));
      place(MK[1], null);
    }
    // scale pointer follows the reading of the main marker
    if (sptr) {
      let hr = 0.5;
      if (t < K.s2) hr = 0.86; else if (t < K.s3) hr = 0.72; else if (t < K.s4) hr = 0.5; else if (t < K.s5) hr = 0.7 - 0.5 * cool; else if (t < A("s5:kondensor")) hr = 0.6 + 0.28 * sq; else if (t < K.s6) hr = 0.75; else if (t < K.s7) hr = 0.5 - 0.36 * ramp(t, A("s6:Tekanannya"), A("s6:turun")); else if (t < K.s8) hr = 0.42 - 0.3 * absorb; else hr = 0.84;
      sptr.style.transform = `translateY(${((1 - hr) * 760).toFixed(1)}px)`;
    }

    // ---------- foreground blur: swaps side per scene, slides with the move ----------
    const sc = [K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8].filter((k) => t >= k).length;
    const side = sc % 2 ? 1 : -1, ks = [0, K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8][sc], u = clamp01((t - ks) / 8);
    fg.position.set(side * (0.088 - 0.006 * u), -0.035 + 0.004 * Math.sin(t * 0.4), -0.5); fg.visible = t < K.outro;

    // ---------- grade ----------
    const coldShot = ramp(t, K.s4 - 0.2, K.s4 + 0.6) * (1 - ramp(t, K.s4e - 0.3, K.s5 + 0.3));
    grade.uniforms.uExp.value = 1.0 + 0.14 * coldShot;
    grade.uniforms.uT.value = t;
    comp.render();
  };
}
