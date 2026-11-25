// EP54 ISOCRAFT: Kowloon Walled City as an isometric ink-comic see-through megablock. One plot (210 × 124 m, 2,6 ha)
// on one world, everything a pure function of t:
//   s1  hook: a cutaway tower (factory, school, dentist, homes) pulls back to the whole fused megablock; four football
//       pitches hover over the roofs (the plot is smaller than four); a jet skims the roofs toward Kai Tak
//   s2  the block rewinds into the ground, the 1847 stone fort rises; 1898: the land around turns into a pink lease
//       map, the fort stays a yellow hole stamped DIKECUALIKAN
//   s3  China inside British Hong Kong; WWII: the wall stones fly in arcs to Kai Tak and lengthen the runway
//   s4  refugees walk in, shacks appear and grow floor by floor until the 14-floor flight-path line; a jet descends
//   s5  ~300 buildings fused into one block, then the camera dives into a sunless alley (pipes, wires, bare bulbs)
//   s6  shadow icons of gangs on the alley wall, then the cutaway: small factory, school, unlicensed dentists
//   s7  demolition sweeps across floor by floor in dust (1993–94); a park grows in its place
//   s8  a cyan wireframe ghost of the block rises over the park (it lives on in sci-fi film and games)
// Ink: depth + normal edge pass (EP19 recipe). Toon shading, paper sky, pastel concrete with world-space window texture.
const FONTS = ['400 80px Anton', '800 80px Inter', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA DOKTER GIGI 14"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { RenderPass } from "./RenderPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";

const V3 = THREE.Vector3;
const INK = "#1C1E21", PAPER = "#F5F2EB", CORAL = "#E06D53", MINT = "#5FA084", BLUE = "#7A9BB8", YEL = "#F4C430", STEEL = "#D1D8E0";
const ANTON = 'Anton, Impact, sans-serif', INTER = 'Inter, Arial, sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';

function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

const INKPASS = {
  uniforms: { tDiffuse: { value: null }, tN: { value: null }, tD: { value: null }, px: { value: new THREE.Vector2(1 / 1080, 1 / 1920) }, near: { value: 1 }, far: { value: 6000 }, w: { value: 1.5 }, ink: { value: new THREE.Color(0x1c1e21) }, amt: { value: 0.92 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse,tN,tD;uniform vec2 px;uniform float near,far,w,amt;uniform vec3 ink;varying vec2 vUv;
float iz(vec2 uv){float d=texture2D(tD,uv).x;float z=d*2.-1.;return (far+near-z*(far-near))/(2.*near*far);}
void main(){vec4 c=texture2D(tDiffuse,vUv);vec4 n0=texture2D(tN,vUv);float w0=iz(vUv);float e=0.;
vec2 D[4];D[0]=vec2(1.,0.);D[1]=vec2(0.,1.);D[2]=vec2(.707,.707);D[3]=vec2(.707,-.707);
for(int i=0;i<4;i++){vec2 o=D[i]*px*w;float wa=iz(vUv+o),wb=iz(vUv-o);float lap=abs(wa+wb-2.*w0)/max(w0,1e-5);e=max(e,smoothstep(.010,.026,lap));
vec4 na=texture2D(tN,vUv+o),nb=texture2D(tN,vUv-o);e=max(e,max(abs(na.a-n0.a),abs(nb.a-n0.a)));
if(n0.a>.5&&na.a>.5){float k=1.-dot(normalize(n0.xyz*2.-1.),normalize(na.xyz*2.-1.));e=max(e,smoothstep(.18,.38,k));}}
gl_FragColor=vec4(mix(c.rgb,ink,clamp(e,0.,1.)*amt),c.a);}`,
};

// ---------------- plot layout (metres) ----------------
const PX = 105, PZ = 62, NC = 20, NR = 15, CW = 210 / NC, CD = 124 / NR;
const ROWGAP = 10, ZA = -PZ + ROWGAP * CD;          // the main east–west alley (z ≈ 20,7)
const COLGAP = 7;                                   // a narrow north–south crevice
const HERO = { c0: 12, c1: 13, r0: 13, r1: 14 };    // the cutaway tower (2 × 2 cells, south face)
const HX0 = -PX + HERO.c0 * CW, HX1 = -PX + (HERO.c1 + 1) * CW, HZ0 = -PZ + HERO.r0 * CD, HZ1 = PZ, HF = 12, FH = 3;
const HXC = (HX0 + HX1) / 2;

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xf1ece2, exp: 1.0, bloom: [0.04, 0.3, 0.98], fov: 24 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  cam.near = 1; cam.far = 6000; cam.updateProjectionMatrix();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  scene.background = null;
  const rtN = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType });
  rtN.depthTexture = new THREE.DepthTexture(1080, 1920); rtN.depthTexture.type = THREE.UnsignedIntType;
  const nMat = new THREE.MeshNormalMaterial();
  const inkP = new ShaderPass(INKPASS);
  inkP.uniforms.tN.value = rtN.texture; inkP.uniforms.tD.value = rtN.depthTexture;
  comp.insertPass(inkP, 1);
  const lscene = new THREE.Scene(); const lpass = new RenderPass(lscene, cam); lpass.clear = false; lpass.clearDepth = true; comp.insertPass(lpass, 2);
  const noInk = [];

  // ---------- sky ----------
  const skyU = { top: { value: new THREE.Color(0x9cc0d8) }, bot: { value: new THREE.Color(0xf7efe0) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,bot;varying vec3 vP;void main(){float h=clamp(normalize(vP).y*1.8+.1,0.,1.);gl_FragColor=vec4(mix(bot,top,h),1.);}" }));
  scene.add(sky); noInk.push(sky);

  // ---------- light (memory: stronger ambient + directional at exposure 1.0) ----------
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x8d8172, 1.35); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0da, 2.7);
  key.position.set(170, 260, 210); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -230, right: 230, top: 230, bottom: -230, near: 10, far: 900 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.05;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.55); fill.position.set(-200, 120, -60); scene.add(fill);

  // ---------- materials ----------
  const grad = new THREE.DataTexture(new Uint8Array([140, 140, 140, 255, 200, 200, 200, 255, 255, 255, 255, 255]), 3, 1);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const tc = {};
  const toon = (c, ex = {}) => { const k = c + JSON.stringify(ex); return tc[k] || (tc[k] = new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...ex })); };
  const glow = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const boxG = new THREE.BoxGeometry(1, 1, 1);
  const add = (m, p = scene) => { m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const B = (x0, y0, z0, w, h, d, mat, p) => { const m = new THREE.Mesh(boxG, typeof mat === "string" ? toon(mat) : mat); m.scale.set(w, h, d); m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2); return add(m, p); };
  const Bc = (x, y, z, w, h, d, mat, p) => B(x - w / 2, y, z - d / 2, w, h, d, mat, p);
  const C = (x, y, z, rt, rb, h, mat, p, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mat === "string" ? toon(mat) : mat); m.position.set(x, y + h / 2, z); return add(m, p); };

  // facade: world-space window texture (12 m × 12 m tile = 4 floors) over the instance colour
  const facT = canvasTex(512, 512, (g, w) => {
    g.clearRect(0, 0, w, w);
    const q = mulberry(54), fp = w / 4, mp = w / 12;
    for (let f = 0; f < 4; f++) {
      const y0 = f * fp;
      g.fillStyle = "rgba(28,30,33,.28)"; g.fillRect(0, y0 + fp - 3, w, 3);
      let x = 4 + q() * 10;
      while (x < w - 30) {
        const ww = mp * (0.8 + q() * 0.9), wh = fp * (0.42 + q() * 0.16), wy = y0 + fp * 0.22;
        const k = q();
        g.fillStyle = k < 0.18 ? "#F6D98A" : k < 0.3 ? "#9FB6C4" : "#33393F"; g.fillRect(x, wy, ww, wh);
        g.strokeStyle = "rgba(28,30,33,.9)"; g.lineWidth = 3; g.strokeRect(x, wy, ww, wh);
        if (q() < 0.55) { g.strokeStyle = "rgba(28,30,33,.75)"; g.lineWidth = 2; for (let gx = x + 6; gx < x + ww; gx += 7) { g.beginPath(); g.moveTo(gx, wy); g.lineTo(gx, wy + wh); g.stroke(); } }
        if (q() < 0.4) { g.fillStyle = "#E3E1DA"; g.fillRect(x + ww * 0.15, wy + wh + 3, ww * 0.55, fp * 0.16); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + ww * 0.15, wy + wh + 3, ww * 0.55, fp * 0.16); }
        if (q() < 0.35) { const cols = ["#E06D53", "#F4C430", "#7A9BB8", "#FFFFFF", "#5FA084"]; for (let j = 0; j < 4; j++) { g.fillStyle = cols[Math.floor(q() * 5)]; g.fillRect(x + j * ww / 4 + 2, wy - 8, ww / 4 - 4, 14); } }
        x += ww + mp * (0.25 + q() * 0.6);
      }
      for (let s = 0; s < 3; s++) { g.fillStyle = "rgba(60,48,36,.12)"; const sx = q() * w; g.fillRect(sx, y0, 4 + q() * 10, fp * (0.5 + q())); }
    }
  });
  facT.wrapS = facT.wrapT = THREE.RepeatWrapping;
  const roofT = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); const q = mulberry(9); for (let i = 0; i < 26; i++) { g.fillStyle = q() < 0.5 ? "rgba(60,58,54,.35)" : "rgba(255,255,255,.25)"; g.fillRect(q() * w, q() * w, 20 + q() * 50, 3 + q() * 4); } g.strokeStyle = "rgba(28,30,33,.25)"; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, w - 2); });
  roofT.wrapS = roofT.wrapT = THREE.RepeatWrapping;
  function facadeMat(tag) {
    const m = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.tFac = { value: facT }; sh.uniforms.tRoof = { value: roofT };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN; varying vec2 vOff;")
        .replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
  vec4 wp4 = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  wp4 = instanceMatrix * wp4; vOff = vec2(fract(instanceMatrix[3].x * 0.137 + instanceMatrix[3].z * 0.071), 0.0);
  #else
  vOff = vec2(0.0);
  #endif
  wp4 = modelMatrix * wp4; vWP = wp4.xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D tFac; uniform sampler2D tRoof; varying vec3 vWP; varying vec3 vWN; varying vec2 vOff;")
        .replace("#include <color_fragment>", `#include <color_fragment>
  { vec3 an = abs(vWN);
    if (an.y < 0.5) { float hz = an.x > 0.5 ? vWP.z : vWP.x; vec4 f = texture2D(tFac, vec2(hz / 12.0 + vOff.x, vWP.y / 12.0)); diffuseColor.rgb = mix(diffuseColor.rgb, f.rgb, f.a); }
    else { vec4 f = texture2D(tRoof, vWP.xz / 7.0); diffuseColor.rgb = mix(diffuseColor.rgb * 0.92, f.rgb, f.a); } }`);
    };
    m.customProgramCacheKey = () => "fac-" + tag;
    return m;
  }

  // ---------- billboard plates ----------
  const labels = [];
  function plate(text, { h = 10, color = INK, bg = "#ffffff", bd = INK, font = ANTON, weight = 400, rot = 0 } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.6);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${weight} ${fpx}px ${font}`;
    const tw = mc.measureText(text).width, CWd = Math.ceil(tw + CH * 0.8);
    const tex = canvasTex(CWd + 20, CH + 20, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      g.fillStyle = INK; g.fillRect(16, 16, w - 20, hh - 20);
      g.fillStyle = bg; g.fillRect(4, 4, w - 20, hh - 20);
      g.strokeStyle = bd; g.lineWidth = 8; g.strokeRect(4, 4, w - 20, hh - 20);
      g.font = `${weight} ${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(text, (w - 16) / 2, (hh - 16) / 2 + 5);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * (CWd + 20) / (CH + 20), h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    m.renderOrder = 9; m.visible = false; m.userData.rot = rot; lscene.add(m); labels.push(m); noInk.push(m);
    return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.rotateZ(m.userData.rot); m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(clamp01(k))))); };

  // ================= GROUND, SEA, HILLS =================
  const fieldT = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = "#B9C98A"; g.fillRect(0, 0, w, w); const q = mulberry(3);
    for (let i = 0; i < 90; i++) { g.fillStyle = ["#A9BD78", "#C8D59B", "#9DB46E", "#D4C995"][i % 4]; const x = q() * w, y = q() * w; g.fillRect(x, y, 60 + q() * 140, 40 + q() * 100); }
    for (let i = 0; i < 160; i++) { g.fillStyle = "rgba(70,90,50,.35)"; g.beginPath(); g.arc(q() * w, q() * w, 3 + q() * 5, 0, 7); g.fill(); }
  }, [6, 6]);
  const ground = add(new THREE.Mesh(new THREE.PlaneGeometry(2400, 4000), toon("#ffffff", { map: fieldT })));
  ground.rotation.x = -Math.PI / 2; ground.position.set(-1000, 0, 0); ground.castShadow = false;
  const cityT = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = "#C9C2B6"; g.fillRect(0, 0, w, w); const q = mulberry(5);
    for (let i = 0; i < 2000; i++) { g.fillStyle = q() < 0.5 ? "rgba(120,110,100,.18)" : "rgba(255,255,255,.18)"; g.fillRect(q() * w, q() * w, 3, 3); }
    g.strokeStyle = "rgba(28,30,33,.25)"; g.lineWidth = 2; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
  }, [40, 60]);
  const cityGM = toon("#ffffff", { map: cityT, transparent: true, opacity: 0 });
  const cityG = new THREE.Mesh(new THREE.PlaneGeometry(2400, 4000), cityGM); cityG.rotation.x = -Math.PI / 2; cityG.position.set(-1000, 0.04, 0); cityG.receiveShadow = true; scene.add(cityG); noInk.push(cityG);
  const seaT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#86AFC8"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4; const q = mulberry(7); for (let i = 0; i < 40; i++) { const x = q() * w, y = q() * w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 8, x + 28, y); g.stroke(); } }, [60, 60]);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), toon("#ffffff", { map: seaT })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.6; sea.receiveShadow = true; scene.add(sea);
  // hills (Kowloon ridge) north + west
  { const q = mulberry(11); for (let i = 0; i < 9; i++) { const rr = 260 + q() * 260, hh = 180 + q() * 260; const m = new THREE.Mesh(new THREE.ConeGeometry(rr, hh, 7, 1), toon(i % 2 ? "#8FA67A" : "#9DB088", { flatShading: true })); m.position.set(-1200 + i * 330 + q() * 100, hh / 2 - 2, -1300 - q() * 400); m.rotation.y = q() * 3; add(m); } }

  // ================= FORT 1847 =================
  const FX = 95, FZ = 55, stoneT = canvasTex(128, 128, (g, w) => { g.fillStyle = "#C9BBA0"; g.fillRect(0, 0, w, w); const q = mulberry(13); for (let i = 0; i < 60; i++) { g.fillStyle = q() < 0.5 ? "rgba(120,100,80,.25)" : "rgba(255,255,255,.2)"; g.fillRect(q() * w, q() * w, 6, 4); } });
  const stoneM = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: stoneT });
  const SPOS = [];
  for (let c = 0; c < 4; c++) {
    for (let x = -FX; x <= FX - 2; x += 2.2) for (const z of [-FZ, FZ]) { if (z > 0 && Math.abs(x) < 8) continue; SPOS.push([x + 1, c, z]); }
    for (let z = -FZ + 2.2; z <= FZ - 2.2; z += 2.2) for (const x of [-FX, FX]) SPOS.push([x, c, z + 1]);
  }
  const NS = SPOS.length;
  const STONES = new THREE.InstancedMesh(boxG, stoneM, NS); STONES.castShadow = STONES.receiveShadow = true; scene.add(STONES);
  const SDAT = SPOS.map((p, i) => ({ p: new V3(p[0], p[1] + 0.5, p[2]), c: p[1], f: hsh(i, 3), tx: 560 + hsh(i, 5) * 195, tz: (hsh(i, 6) - 0.5) * 54, ty: 0.9 + Math.floor(hsh(i, 7) * 2) * 1.0 }));
  const FORT = new THREE.Group(); scene.add(FORT);
  for (const [x, z] of [[-FX, -FZ], [FX, -FZ], [-FX, FZ], [FX, FZ]]) Bc(x, 0, z, 6, 6.5, 6, stoneM, FORT);
  Bc(0, 0, FZ, 14, 7, 4, stoneM, FORT); B(-3, 0, FZ - 2.2, 6, 4.2, 4.6, "#4A3B30", FORT);
  // yamen-like low houses inside the walls (generic)
  const roofTile = toon("#8C4A34");
  const house = (x, z, w, d, p) => { Bc(x, 0, z, w, 3.6, d, "#E8DCC4", p); const rf = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 2.6, 4, 1), roofTile); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.45, 1, d / Math.hypot(w, d) * 1.45); rf.position.set(x, 3.6 + 1.3, z); add(rf, p); };
  { const q = mulberry(17); for (let i = 0; i < 22; i++) house(-75 + (i % 6) * 30 + q() * 6, -38 + Math.floor(i / 6) * 26 + q() * 4, 10 + q() * 6, 7 + q() * 4, FORT); }

  // ================= LEASE MAP OVERLAY (1898) =================
  const hatch = (col, alpha) => canvasTex(256, 256, (g, w) => { g.fillStyle = col; g.globalAlpha = alpha; g.fillRect(0, 0, w, w); g.globalAlpha = 1; g.strokeStyle = "rgba(28,30,33,.35)"; g.lineWidth = 4; for (let k = -w; k < w * 2; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + w, w); g.stroke(); } }, [30, 30]);
  const leaseShape = new THREE.Shape([new THREE.Vector2(-1400, -1400), new THREE.Vector2(170, -1400), new THREE.Vector2(170, 1400), new THREE.Vector2(-1400, 1400)]);
  leaseShape.holes.push(new THREE.Path([new THREE.Vector2(-FX - 3, -FZ - 3), new THREE.Vector2(-FX - 3, FZ + 3), new THREE.Vector2(FX + 3, FZ + 3), new THREE.Vector2(FX + 3, -FZ - 3)]));
  const leaseG = new THREE.ShapeGeometry(leaseShape); { const uv = leaseG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 280, uv.getY(i) / 280); }
  const leaseM = new THREE.MeshBasicMaterial({ map: hatch("#E06D53", 1), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  leaseM.map.repeat.set(1, 1);
  const lease = new THREE.Mesh(leaseG, leaseM); lease.rotation.x = -Math.PI / 2; lease.position.y = 8; lease.renderOrder = 3; scene.add(lease); noInk.push(lease);
  const enclM = new THREE.MeshBasicMaterial({ map: hatch("#F4C430", 1), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  enclM.map.repeat.set(1, 1);
  const encl = new THREE.Mesh(new THREE.PlaneGeometry(2 * FX + 6, 2 * FZ + 6), enclM); encl.rotation.x = -Math.PI / 2; encl.position.y = 8.2; encl.renderOrder = 3; scene.add(encl); noInk.push(encl);
  // dashed ink border around the enclave
  const dashM = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0, toneMapped: false });
  const DASH = new THREE.Group(); scene.add(DASH); noInk.push(DASH);
  { const edge = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 10); for (let i = 0; i < n; i++) { const u = (i + 0.25) / n, m = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), dashM); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(z1 - z0, x1 - x0); m.position.set(x0 + (x1 - x0) * u, 8.4, z0 + (z1 - z0) * u); DASH.add(m); } };
    const X = FX + 3, Z = FZ + 3; edge(-X, -Z, X, -Z); edge(X, -Z, X, Z); edge(X, Z, -X, Z); edge(-X, Z, -X, -Z); }

  // ================= KAI TAK RUNWAY =================
  const rwT = canvasTex(1024, 128, (g, w, h) => { g.fillStyle = "#6E6C69"; g.fillRect(0, 0, w, h); g.fillStyle = "#F5F2EB"; for (let x = 20; x < w; x += 60) g.fillRect(x, h / 2 - 3, 32, 6); for (let k = 0; k < 6; k++) g.fillRect(6, 14 + k * 18, 40, 9); g.fillStyle = "rgba(0,0,0,.12)"; const q = mulberry(19); for (let i = 0; i < 300; i++) g.fillRect(q() * w, q() * h, 4, 2); });
  const rwM = toon("#ffffff", { map: rwT });
  B(170, -3, -30, 390, 3.5, 60, rwM);
  const rwExtT = rwT.clone(); rwExtT.needsUpdate = true;
  const RWX = B(560, -3, -30, 1, 3.4, 60, toon("#ffffff", { map: rwExtT }));
  B(150, 0, -60, 20, 6, 120, "#D9D2C3"); // terminal stub
  // airport shore / apron strip
  B(-30, -0.5, -40, 200, 0.6, 1, "#9A9286").visible = false;

  // ================= MEGABLOCK =================
  const blocks = [];
  { const q = mulberry(29);
    for (let c = 0; c < NC; c++) for (let rr = 0; rr < NR; rr++) {
      if (c >= HERO.c0 && c <= HERO.c1 && rr >= HERO.r0 && rr <= HERO.r1) continue;
      let x0 = -PX + c * CW, x1 = x0 + CW, z0 = -PZ + rr * CD, z1 = z0 + CD;
      if (rr === ROWGAP - 1) z1 -= 1.5; if (rr === ROWGAP) z0 += 1.5;
      if (c === COLGAP - 1 && rr > ROWGAP) x1 -= 1.0; if (c === COLGAP && rr > ROWGAP) x0 += 1.0;
      if (q() < 0.3) x1 -= 0.15 + q() * 0.3; if (q() < 0.3) z1 -= 0.15 + q() * 0.3;
      const edge = Math.min(c, NC - 1 - c, rr, NR - 1 - rr);
      const F = Math.min(14, 10 + Math.floor(q() * 3) + (edge > 2 ? Math.floor(q() * 3) : 0));
      blocks.push({ x0, x1, z0, z1, F, r1: q(), r2: q(), r3: q(), cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 });
    } }
  const NB = blocks.length;
  const PAL = ["#E9E1D0", "#DCD3C0", "#CFD8D2", "#E6CFC2", "#D3DCE4", "#E8DDB8", "#C9D3C0", "#E3D6CC", "#D9CFC7"].map((c) => new THREE.Color(c));
  const BLD = new THREE.InstancedMesh(boxG, facadeMat("blk"), NB); BLD.castShadow = BLD.receiveShadow = true; scene.add(BLD);
  blocks.forEach((b, i) => BLD.setColorAt(i, PAL[Math.floor(hsh(i, 9) * PAL.length)]));
  // rooftop clutter: water tanks, huts, antenna masts
  const TANK = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 12), toon("#9AA7B0"), NB); TANK.castShadow = true; scene.add(TANK);
  const HUT = new THREE.InstancedMesh(boxG, toon("#BDB3A3"), NB); HUT.castShadow = true; scene.add(HUT);
  const MAST = new THREE.InstancedMesh(boxG, toon("#3A3F44"), NB * 2); scene.add(MAST);
  // small colour signs on the outer south + east faces
  const signT = canvasTex(256, 64, (g, w, h) => { const cols = ["#E06D53", "#F4C430", "#5FA084", "#7A9BB8", "#FFFFFF", "#D84A3A", "#2F6F8F", "#F2A541"]; for (let i = 0; i < 8; i++) { g.fillStyle = cols[i]; g.fillRect(i * 32, 0, 32, h); g.fillStyle = "rgba(28,30,33,.85)"; for (let k = 0; k < 3; k++) g.fillRect(i * 32 + 7, 12 + k * 16, 18, 5); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(i * 32 + 2, 2, 28, h - 4); } });
  const SIGNS = [];
  { const q = mulberry(31); const sg = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < 70; i++) {
      const south = i < 44, k = Math.floor(q() * 8);
      const tx = signT.clone(); tx.needsUpdate = true; tx.repeat.set(1 / 8, 1); tx.offset.set(k / 8, 0);
      const m = new THREE.Mesh(sg, new THREE.MeshToonMaterial({ map: tx, gradientMap: grad, side: THREE.DoubleSide }));
      const w = 1.4 + q() * 1.6, h = 3 + q() * 5, y = 3 + q() * 22;
      if (south) { const x = -PX + 2 + q() * 206; if (x > HX0 - 2 && x < HX1 + 2) { continue; } m.position.set(x, y, PZ + 0.9 + q() * 1.2); m.rotation.y = Math.PI / 2; }
      else { const z = -PZ + 2 + q() * 120; m.position.set(PX + 0.9 + q() * 1.2, y, z); }
      m.scale.set(w, h, 1); m.castShadow = true; scene.add(m); SIGNS.push({ m, y, h });
    } }

  // ================= HERO CUTAWAY TOWER =================
  const HERO_G = new THREE.Group(); scene.add(HERO_G);
  const FLOORS = [];
  const heroFac = facadeMat("hero");
  const W = HX1 - HX0, D = HZ1 - HZ0;
  // person: head with face, shoulders wider than hips, bent elbows and knees, skin ≠ clothes
  const SKINS = ["#E8B894", "#D9A47E", "#C98E68", "#F0C7A6"], SHIRTS = ["#E06D53", "#5FA084", "#7A9BB8", "#F4C430", "#FFFFFF", "#8E6BB0", "#2F6F8F"], PANTS = ["#3A3F44", "#4F5B66", "#6B5A4A", "#2C3E50"];
  const PEOPLE = [];
  function person(p, x, y, z, ry, { s = 1, pose = "stand", seed = 1 } = {}) {
    const q = mulberry(seed * 13 + 7);
    const skin = toon(SKINS[Math.floor(q() * 4)]), shirt = toon(SHIRTS[Math.floor(q() * 7)]), pants = toon(PANTS[Math.floor(q() * 4)]), hair = toon("#2A2420"), eye = toon(INK);
    const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; G.scale.setScalar(s); p.add(G);
    const m = (geo, mat, px, py, pz, par = G) => { const o = new THREE.Mesh(geo, mat); o.position.set(px, py, pz); o.castShadow = true; par.add(o); return o; };
    const torso = m(new THREE.CylinderGeometry(0.21, 0.14, 0.52, 10), shirt, 0, 1.2, 0); torso.scale.z = 0.62;
    m(new THREE.BoxGeometry(0.3, 0.16, 0.19), pants, 0, 0.9, 0);
    m(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), skin, 0, 1.5, 0);
    const head = m(new THREE.SphereGeometry(0.125, 14, 12), skin, 0, 1.64, 0);
    m(new THREE.SphereGeometry(0.13, 14, 8, 0, 6.3, 0, 1.4), hair, 0, 1.665, -0.01);
    for (const sx of [-1, 1]) m(new THREE.SphereGeometry(0.018, 6, 6), eye, sx * 0.045, 1.655, 0.112);
    m(new THREE.BoxGeometry(0.05, 0.012, 0.01), eye, 0, 1.595, 0.118);
    const limb = (px, py, len, r0, mat1, mat2, foot) => {
      const piv = new THREE.Group(); piv.position.set(px, py, 0); G.add(piv);
      m(new THREE.CylinderGeometry(r0, r0 * 0.85, len, 8), mat1, 0, -len / 2, 0, piv);
      const j = new THREE.Group(); j.position.set(0, -len, 0); piv.add(j);
      m(new THREE.SphereGeometry(r0 * 0.9, 8, 6), mat1, 0, 0, 0, j);
      m(new THREE.CylinderGeometry(r0 * 0.85, r0 * 0.7, len * 0.95, 8), mat2, 0, -len * 0.47, 0, j);
      if (foot) m(new THREE.BoxGeometry(0.1, 0.06, 0.2), toon("#2A2420"), 0, -len * 0.95, 0.05, j);
      else m(new THREE.SphereGeometry(r0 * 0.8, 8, 6), skin, 0, -len * 0.95, 0, j);
      return { piv, j };
    };
    const aL = limb(-0.25, 1.42, 0.28, 0.05, shirt, skin), aR = limb(0.25, 1.42, 0.28, 0.05, shirt, skin);
    const lL = limb(-0.09, 0.84, 0.41, 0.065, pants, pants, true), lR = limb(0.09, 0.84, 0.41, 0.065, pants, pants, true);
    const P = { G, aL, aR, lL, lR, pose, base: y, ph: q() * 6 };
    PEOPLE.push(P); setPose(P, 0); return P;
  }
  function setPose(P, t) {
    const { aL, aR, lL, lR } = P;
    aL.piv.rotation.set(-0.2, 0, 0.12); aR.piv.rotation.set(-0.2, 0, -0.12); aL.j.rotation.x = -0.7; aR.j.rotation.x = -0.7;
    lL.piv.rotation.x = -0.12; lR.piv.rotation.x = -0.12; lL.j.rotation.x = 0.22; lR.j.rotation.x = 0.22;
    if (P.pose === "sit") { lL.piv.rotation.x = lR.piv.rotation.x = -1.45; lL.j.rotation.x = lR.j.rotation.x = 1.45; aL.piv.rotation.x = aR.piv.rotation.x = -0.5; aL.j.rotation.x = aR.j.rotation.x = -1.0; }
    if (P.pose === "work") { aL.piv.rotation.x = aR.piv.rotation.x = -0.75 + 0.12 * Math.sin(t * 5 + P.ph); aL.j.rotation.x = aR.j.rotation.x = -0.9; }
    if (P.pose === "walk") { const s = Math.sin(t * 5 + P.ph); lL.piv.rotation.x = -0.15 + 0.45 * s; lR.piv.rotation.x = -0.15 - 0.45 * s; lL.j.rotation.x = 0.25 + 0.35 * Math.max(0, -s); lR.j.rotation.x = 0.25 + 0.35 * Math.max(0, s); aL.piv.rotation.x = -0.3 - 0.35 * s; aR.piv.rotation.x = -0.3 + 0.35 * s; aL.j.rotation.x = -0.9; aR.j.rotation.x = -0.9; }
    if (P.pose === "point") { aR.piv.rotation.set(-1.3, 0, -0.2); aR.j.rotation.x = -0.3; }
  }
  // room kits (local coords: x 0..w, y 0..3, z 0..D, open to +z)
  const kits = {
    shop(g, w, s) { for (let i = 0; i < 3; i++) { B(0.6 + i * 3, 0, 0.6, 2.4, 2.2, 0.8, "#A57A52", g); for (let k = 0; k < 4; k++) B(0.7 + i * 3 + k * 0.55, 0.4 + (k % 2) * 0.9, 0.7, 0.45, 0.5, 0.5, ["#E06D53", "#F4C430", "#5FA084", "#FFFFFF"][k], g); } B(2, 0, D - 4, 4, 1.0, 1.2, "#8E6B48", g); person(g, 4, 0, D - 2.8, 0.2, { seed: s + 1 }); },
    pipes(g, w, s) { for (let i = 0; i < 7; i++) C(0.8 + i * 1.3, 0, 0.6 + (i % 2) * 0.5, 0.14, 0.14, 3, i % 3 ? "#7A9BB8" : "#B8B2A7", g, 8); for (let k = 0; k < 3; k++) { const m = C(0, 0.6 + k * 0.8, 1.2, 0.12, 0.12, w - 1, "#9AA7B0", g, 8); m.rotation.z = Math.PI / 2; m.position.set(w / 2, 0.6 + k * 0.8, 1.2); } for (let i = 0; i < 5; i++) B(1 + i * 1.8, 1.4, 0.3, 0.5, 0.6, 0.3, "#F5F2EB", g); person(g, w - 3, 0, D - 4, -0.6, { seed: s + 2, pose: "work" }); },
    factory(g, w, s) { for (let i = 0; i < 2; i++) { B(1 + i * 4.6, 0, 2, 3.2, 1.5, 2.2, "#7A9BB8", g); B(1.4 + i * 4.6, 1.5, 2.4, 2.4, 0.7, 1.4, "#D1D8E0", g); const rl = C(0, 1.2, 0, 0.3, 0.3, 3.4, "#3A3F44", g, 12); rl.rotation.z = Math.PI / 2; rl.position.set(2.6 + i * 4.6, 1.2, 4.4); } B(0.5, 0.8, 5.2, w - 1, 0.12, 1.1, "#3A3F44", g); for (let i = 0; i < 9; i++) B(0.8 + i * 1.05, 0.92, 5.4, 0.5, 0.3, 0.5, "#F4C430", g); for (let i = 0; i < 4; i++) Bc(w - 1.2, i * 0.5, 1.5 + (i % 2) * 0.6, 1, 0.5, 0.7, "#C9A97A", g); person(g, 2.6, 0, 7.2, Math.PI, { seed: s + 3, pose: "work" }); person(g, 7.2, 0, 7.2, Math.PI, { seed: s + 4, pose: "work" }); },
    school(g, w, s) { B(1.2, 0.9, 0.25, 7.5, 1.6, 0.12, "#2E5A48", g); const cb = plateTex("A B C  1 2 3", 512, 110, "#2E5A48", "#F5F2EB"); const bm = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.5), new THREE.MeshBasicMaterial({ map: cb, toneMapped: false })); bm.position.set(4.95, 1.7, 0.33); g.add(bm);
      for (let rr = 0; rr < 2; rr++) for (let i = 0; i < 4; i++) { const x = 1.6 + i * 2.2, z = 3.4 + rr * 2.6; B(x - 0.55, 0.62, z - 0.35, 1.1, 0.08, 0.7, "#C9A97A", g); for (const lx of [-0.45, 0.45]) B(x + lx - 0.04, 0, z - 0.04, 0.08, 0.62, 0.08, "#3A3F44", g); B(x - 0.3, 0.38, z + 0.4, 0.6, 0.06, 0.45, "#7A9BB8", g); person(g, x, 0.0, z + 0.62, Math.PI, { s: 0.72, pose: "sit", seed: s + i + rr * 5 }); }
      person(g, 8.8, 0, 1.6, -2.4, { seed: s + 20, pose: "point" }); },
    dentist(g, w, s) {
      const chair = new THREE.Group(); chair.position.set(4.5, 0, 4.6); chair.rotation.y = 0.6; g.add(chair);
      C(0, 0, 0, 0.35, 0.5, 0.5, "#D1D8E0", chair); B(-0.4, 0.5, -0.7, 0.8, 0.25, 1.3, "#5FA084", chair); const bk = B(-0.4, 0.75, -0.95, 0.8, 1.1, 0.22, "#5FA084", chair); bk.rotation.x = -0.45; bk.position.z -= 0.15;
      B(-0.25, 1.65, -1.35, 0.5, 0.25, 0.2, "#5FA084", chair); B(0.5, 0, 1.0, 0.22, 2.2, 0.22, "#D1D8E0", chair); B(0.2, 2.15, 0.1, 0.12, 0.12, 1.1, "#D1D8E0", chair); const lp = C(0.25, 1.95, -0.1, 0.3, 0.2, 0.18, glow("#FFF3C4"), chair); lp.castShadow = false;
      C(-1.1, 0, 0.4, 0.25, 0.2, 0.9, "#F5F2EB", chair);
      person(chair, 0, 0.45, -0.25, Math.PI, { pose: "sit", seed: s + 30 }); person(g, 6.3, 0, 4.0, -1.9, { seed: s + 31, pose: "work" });
      B(0.5, 0, 0.5, 1.6, 1.8, 0.6, "#F5F2EB", g); for (let i = 0; i < 3; i++) B(0.6 + i * 0.5, 1.82, 0.6, 0.3, 0.25, 0.3, ["#7A9BB8", "#E06D53", "#F4C430"][i], g);
      const cs = plateTex("GIGI", 256, 96, "#FFFFFF", "#D84A3A"); const pm2 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.68), new THREE.MeshBasicMaterial({ map: cs, toneMapped: false })); pm2.position.set(8, 2.1, 0.3); g.add(pm2); },
    home(g, w, s) { const q = mulberry(s); const left = q() < 0.5;
      B(left ? 0.4 : w - 4.4, 0, 0.5, 4, 0.5, 2, "#C9A97A", g); B(left ? 0.4 : w - 4.4, 0.5, 0.5, 4, 0.18, 2, ["#F5F2EB", "#E06D53", "#7A9BB8"][Math.floor(q() * 3)], g); B(left ? 0.4 : w - 4.4, 1.5, 0.5, 4, 0.12, 2, "#8E6B48", g);
      const tx = left ? w - 3.5 : 3; B(tx - 0.8, 0.7, 4.5, 1.6, 0.08, 1.0, "#A57A52", g); B(tx - 0.7, 0, 4.6, 0.08, 0.7, 0.08, "#3A3F44", g); B(tx + 0.62, 0, 5.32, 0.08, 0.7, 0.08, "#3A3F44", g);
      B(w / 2 - 0.6, 0.9, 0.35, 1.2, 0.8, 0.45, "#3A3F44", g); const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.62), glow(q() < 0.5 ? "#9FD3E8" : "#F6D98A")); sc.position.set(w / 2, 1.3, 0.59); g.add(sc);
      for (let i = 0; i < 6; i++) B(1 + i * 1.4, 2.25, D - 2.5, 0.7, 0.55, 0.05, SHIRTS[Math.floor(q() * 7)], g);
      if (q() < 0.85) person(g, tx + (q() - 0.5) * 2, 0, 6.2, Math.PI + (q() - 0.5) * 1.5, { seed: s + 40, pose: q() < 0.5 ? "stand" : "work" });
      if (q() < 0.5) { B(tx + 1.0, 0, 5.6, 0.5, 0.45, 0.5, "#8E6B48", g); person(g, tx + 1.25, 0.03, 5.85, -1.2, { seed: s + 41, pose: "sit" }); } },
  };
  function plateTex(text, w, h, bg, fg) { return canvasTex(w, h, (g, ww, hh) => { g.fillStyle = bg; g.fillRect(0, 0, ww, hh); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, ww - 8, hh - 8); g.font = `400 ${Math.round(hh * 0.62)}px ${ANTON}`; g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, ww / 2, hh / 2 + 3); }); }
  const BACKC = ["#F2E6CF", "#E4EEE8", "#F6E2D6", "#E3EAF1", "#F3EED8", "#EADFEA"];
  for (let f = 0; f < HF; f++) {
    const FG = new THREE.Group(); FG.position.set(0, f * FH, 0); HERO_G.add(FG);
    const ns = (m) => { m.castShadow = false; return m; };
    ns(B(HX0, 0, HZ0, W, 0.3, D, toon("#C9BFAE", { emissive: new THREE.Color("#3a3226") }), FG));
    ns(B(HX0, FH - 0.3, HZ0, W, 0.3, D, toon("#E7DFCF", { emissive: new THREE.Color("#5a5040") }), FG));
    B(HX0 - 0.01, 0, HZ0, 0.5, FH, D, heroFac, FG); B(HX1 - 0.49, 0, HZ0, 0.5, FH, D, heroFac, FG);
    ns(B(HX0, 0, HZ0, W, FH, 0.3, toon(BACKC[f % 6], { emissive: new THREE.Color(BACKC[f % 6]).multiplyScalar(0.45) }), FG));
    ns(B(HXC - 0.25, 0, HZ0, 0.5, FH, D, toon("#DCD3C0", { emissive: new THREE.Color("#4a4438") }), FG));
    const lampL = B(HX0 + 3, FH - 0.36, HZ0 + 4, 3, 0.06, 0.25, glow("#FFF1C8"), FG); lampL.castShadow = false;
    const lampR = B(HXC + 3, FH - 0.36, HZ0 + 4, 3, 0.06, 0.25, glow("#FFF1C8"), FG); lampR.castShadow = false;
    const roomL = new THREE.Group(); roomL.position.set(HX0 + 0.5, 0.3, HZ0 + 0.3); FG.add(roomL);
    const roomR = new THREE.Group(); roomR.position.set(HXC + 0.25, 0.3, HZ0 + 0.3); FG.add(roomR);
    const rw = W / 2 - 0.75;
    const plan = f === 0 ? ["shop", "pipes"] : f === 1 ? ["factory", "factory"] : f === 2 ? ["school", "school"] : f === 3 ? ["dentist", "dentist"] : ["home", "home"];
    kits[plan[0]](roomL, rw, f * 10 + 1); kits[plan[1]](roomR, rw, f * 10 + 5);
    // balcony rails on the open front
    B(HX0, 0.3, HZ1 - 0.15, W, 0.08, 0.1, "#3A3F44", FG);
    FLOORS.push(FG);
  }
  B(HX0, HF * FH, HZ0, W, 0.4, D, "#C9C2B6", HERO_G);
  const heroTank = C(HX0 + 4, HF * FH + 0.4, HZ0 + 4, 1.6, 1.6, 2.6, "#9AA7B0", HERO_G);
  B(HX1 - 3, HF * FH + 0.4, HZ0 + 2, 0.15, 7, 0.15, "#3A3F44", HERO_G);
  // projecting signs on the hero tower: DOKTER GIGI (floor 3), AUDIRA (floor 8)
  const signBoard = (text, w, h, bg, fg, x, y, z, ry) => { const tx = plateTex(text, 1024, Math.round(1024 * h / w), bg, fg); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.18), [toon(bg), toon(bg), toon(bg), toon(bg), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })]); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; HERO_G.add(m); B(x - 0.05, y + h / 2, z - 1.6, 0.1, 0.1, 1.6, "#3A3F44", HERO_G); return m; };
  signBoard("DOKTER GIGI", 6.4, 1.5, "#D84A3A", "#FFFFFF", HX0 + 1.2, 3 * FH + 2.0, HZ1 + 1.6, 0.35);
  signBoard("AUDIRA", 5.6, 1.7, "#0B3D2E", "#A3E635", HX1 - 2.4, 8 * FH + 1.6, HZ1 + 1.6, -0.3);
  signBoard("SEKOLAH", 4.6, 1.2, "#2F6F8F", "#FFFFFF", HX1 - 2.0, 2 * FH + 1.9, HZ1 + 1.6, -0.3);
  signBoard("PABRIK", 4.2, 1.2, "#F4C430", INK, HX0 + 1.4, 1 * FH + 1.9, HZ1 + 1.6, 0.35);

  // ================= ALLEY (pipes, wires, bulbs, gang shadows) =================
  const ALLEY = new THREE.Group(); scene.add(ALLEY);
  { const q = mulberry(37); const zN = ZA - 1.5, zS = ZA + 1.5;
    for (let i = 0; i < 16; i++) { const z = (i % 2 ? zN + 0.25 : zS - 0.25), y = 1.8 + q() * 12, m = C(0, 0, 0, 0.09 + q() * 0.08, 0.09 + q() * 0.08, 200, i % 3 ? "#7A9BB8" : "#9AA7B0", ALLEY, 8); m.rotation.z = Math.PI / 2; m.position.set(0, y, z); m.castShadow = false; }
    for (let i = 0; i < 60; i++) { const x = -100 + q() * 200, y = 3 + q() * 18, m = C(0, 0, 0, 0.035, 0.035, 3.2, "#1C1E21", ALLEY, 5); m.rotation.x = Math.PI / 2 + (q() - 0.5) * 0.5; m.position.set(x, y, ZA); m.castShadow = false; }
    for (let i = 0; i < 14; i++) { const x = 100 - i * 14; const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), glow("#FFE9A8")); b.position.set(x, 3.3, ZA + (i % 2 ? -1.2 : 1.2)); ALLEY.add(b); }
    for (let i = 0; i < 18; i++) { const x = 100 - q() * 200, s = new THREE.Mesh(new THREE.PlaneGeometry(0.9 + q(), 1.4 + q() * 1.6), new THREE.MeshToonMaterial({ color: SHIRTS[i % 7], gradientMap: grad })); s.position.set(x, 2.2 + q() * 4, i % 2 ? zN + 0.05 : zS - 0.05); s.rotation.y = i % 2 ? 0 : Math.PI; ALLEY.add(s); }
    const fl = B(-PX, 0.02, zN, 210, 0.05, 3, "#3E3B37", ALLEY); fl.castShadow = false;
  }
  // gang shadow icons on the alley wall (no violence: silhouettes + a red lantern)
  const shT = canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(20,14,16,.85)"; for (let i = 0; i < 3; i++) { const x = 90 + i * 160, s = i === 1 ? 1.15 : 1; g.beginPath(); g.ellipse(x, 70 * s + 10, 24 * s, 28 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 58 * s, h); g.lineTo(x - 50 * s, 120 * s); g.quadraticCurveTo(x, 92 * s, x + 50 * s, 120 * s); g.lineTo(x + 58 * s, h); g.fill(); } });
  const SHADOWS = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: shT, transparent: true, opacity: 0, depthWrite: false })); SHADOWS.position.set(20, 1.15, ZA); SHADOWS.rotation.y = Math.PI / 2; SHADOWS.scale.set(0.38, 0.55, 1); scene.add(SHADOWS); noInk.push(SHADOWS);
  const LANT = new THREE.Group(); scene.add(LANT); { const l = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), glow("#E8452F")); l.scale.y = 1.25; LANT.add(l); B(-0.3, 0.5, -0.3, 0.6, 0.12, 0.6, "#1C1E21", LANT); } LANT.position.set(12, 3.4, ZA + 1.0); LANT.scale.setScalar(0.5);

  // ================= SURROUNDING CITY (after the war) =================
  const ring = [];
  { const q = mulberry(41);
    for (let x = -700; x < 160; x += 34) for (let z = -700; z < 380; z += 30) {
      const north = z < -PZ - 18, west = x < -PX - 30;
      if (!(north || west)) continue;
      if (q() < 0.12) continue;
      ring.push({ x: x + 12, z: z + 10, w: 18 + q() * 10, d: 14 + q() * 10, h: 9 + Math.floor(q() * 7) * 3, r: q() });
    } }
  const RING = new THREE.InstancedMesh(boxG, facadeMat("ring"), ring.length); RING.castShadow = RING.receiveShadow = true; scene.add(RING);
  ring.forEach((b, i) => RING.setColorAt(i, new THREE.Color(PAL[i % PAL.length]).lerp(new THREE.Color("#B8B4AC"), 0.45)));

  // ================= PITCH OVERLAY (s1) + HEIGHT LINE (s4) =================
  const pitchT = canvasTex(1024, 1024 * 136 / 210, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x0 = i * w / 2, y0 = j * h / 2, pw = w / 2, ph = h / 2;
      g.fillStyle = (i + j) % 2 ? "rgba(95,160,132,.78)" : "rgba(120,178,140,.78)"; g.fillRect(x0 + 3, y0 + 3, pw - 6, ph - 6);
      g.strokeStyle = "#FFFFFF"; g.lineWidth = 6; g.strokeRect(x0 + 14, y0 + 14, pw - 28, ph - 28);
      g.beginPath(); g.moveTo(x0 + pw / 2, y0 + 14); g.lineTo(x0 + pw / 2, y0 + ph - 14); g.stroke();
      g.beginPath(); g.arc(x0 + pw / 2, y0 + ph / 2, ph * 0.13, 0, 7); g.stroke();
      g.strokeRect(x0 + 14, y0 + ph / 2 - ph * 0.3, pw * 0.15, ph * 0.6); g.strokeRect(x0 + pw - 14 - pw * 0.15, y0 + ph / 2 - ph * 0.3, pw * 0.15, ph * 0.6);
      g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(x0 + 3, y0 + 3, pw - 6, ph - 6);
    }
  });
  const PITCH = new THREE.Mesh(new THREE.PlaneGeometry(210, 136), new THREE.MeshBasicMaterial({ map: pitchT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  PITCH.rotation.x = -Math.PI / 2; PITCH.position.set(0, 47, 0); PITCH.renderOrder = 4; scene.add(PITCH); noInk.push(PITCH);
  const LINE = new THREE.Group(); scene.add(LINE); noInk.push(LINE);
  const lineM = new THREE.MeshBasicMaterial({ color: "#E06D53", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  { const pl = new THREE.Mesh(new THREE.PlaneGeometry(260, 170), lineM); pl.rotation.x = -Math.PI / 2; LINE.add(pl); }
  const lineEdgeM = new THREE.MeshBasicMaterial({ color: "#D84A3A", transparent: true, opacity: 0, toneMapped: false });
  for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.8), lineEdgeM); d.position.set(-127 + i * 10, 0, 85); LINE.add(d); const d2 = d.clone(); d2.rotation.y = Math.PI / 2; d2.position.set(130, 0, -85 + i * 6.6); LINE.add(d2); }
  LINE.position.y = HF * FH + 2 * FH + 0.5; // 14 floors = 42 m

  // ================= PLANE (generic jet) =================
  const PLANE = new THREE.Group(); scene.add(PLANE);
  { const body = toon("#F2F2EE"), dark = toon("#3A3F44"), stripe = toon("#7A9BB8");
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 44, 16), body); fus.rotation.z = Math.PI / 2; add(fus, PLANE);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), body); nose.scale.set(2.2, 1, 1); nose.position.x = 22; add(nose, PLANE);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(2.4, 9, 16), body); tail.rotation.z = Math.PI / 2; tail.position.x = -26; add(tail, PLANE);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 40, 16, 1, true, 1.2, 0.7), stripe); st.rotation.z = Math.PI / 2; add(st, PLANE);
    Bc(2, -0.8, 0, 9, 0.6, 44, body, PLANE); Bc(-24, 0.5, 0, 4.5, 0.4, 16, body, PLANE);
    const fin = B(-30, 1.5, -0.3, 6, 8, 0.6, stripe, PLANE); fin.rotation.z = -0.35;
    for (const z of [-9, 9]) { const e = C(0, 0, 0, 1.3, 1.3, 5, dark, PLANE, 12); e.rotation.z = Math.PI / 2; e.position.set(5, -2.2, z); }
    for (let i = 0; i < 14; i++) for (const z of [-2.35, 2.35]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.1), dark); w.position.set(-14 + i * 2.4, 0.8, z); PLANE.add(w); }
  }
  PLANE.visible = false;
  const planeAt = (t, tc) => { const x = -105 + (t - tc) * 72; const y = x < 260 ? 4 + (260 - x) * 0.33 : 3.5; return new V3(Math.min(x, 260 + (x - 260) * 0.45), y + 2, 0); };

  // ================= REFUGEES (s4) =================
  const REF = [];
  for (let i = 0; i < 26; i++) { const P = person(scene, 0, 0, 0, Math.PI, { s: 1.7, pose: "walk", seed: 300 + i }); const bag = B(-0.22, 1.0, -0.32, 0.44, 0.5, 0.3, i % 2 ? "#C9A97A" : "#E8DCC4", P.G); bag.castShadow = true; REF.push({ P, x: -20 + hsh(i, 1) * 90, z0: 200 + hsh(i, 2) * 70, d: hsh(i, 3) }); }

  // ================= DEMOLITION DUST + PARK + GHOST =================
  const DUST = pts(scene, 1400, { color: 0xcdbfa8, size: 7, add: false, opacity: 0.55 }); noInk.push(DUST.P);
  const PARK = new THREE.Group(); scene.add(PARK);
  const parkT = canvasTex(1024, 604, (g, w, h) => {
    g.fillStyle = "#8DBA74"; g.fillRect(0, 0, w, h); const q = mulberry(43);
    for (let i = 0; i < 300; i++) { g.fillStyle = q() < 0.5 ? "rgba(70,120,60,.25)" : "rgba(200,230,150,.25)"; g.beginPath(); g.arc(q() * w, q() * h, 6 + q() * 16, 0, 7); g.fill(); }
    g.strokeStyle = "#F1E6CC"; g.lineWidth = 22; g.lineCap = "round"; g.beginPath(); g.moveTo(0, h * 0.55); g.bezierCurveTo(w * 0.3, h * 0.2, w * 0.6, h * 0.9, w, h * 0.45); g.stroke(); g.beginPath(); g.moveTo(w * 0.5, 0); g.bezierCurveTo(w * 0.45, h * 0.4, w * 0.6, h * 0.6, w * 0.55, h); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#86AFC8"; g.beginPath(); g.ellipse(w * 0.22, h * 0.78, 90, 46, 0.2, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  });
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(210, 124), toon("#ffffff", { map: parkT })); grass.rotation.x = -Math.PI / 2; grass.position.y = 0.08; grass.receiveShadow = true; PARK.add(grass);
  const TREES = [];
  { const q = mulberry(47); for (let i = 0; i < 70; i++) { const g = new THREE.Group(); const x = -98 + q() * 196, z = -56 + q() * 112; if (Math.abs(x - 10) < 14 && Math.abs(z) < 12) continue; g.position.set(x, 0, z); C(0, 0, 0, 0.5, 0.7, 4, "#7A5A3E", g, 8); const cp = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2 + q() * 1.8, 0), toon(i % 3 ? "#5FA084" : "#7FB069", { flatShading: true })); cp.position.y = 6.2; add(cp, g); PARK.add(g); TREES.push({ g, d: q() }); } }
  { const pv = new THREE.Group(); pv.position.set(10, 0, 0); Bc(0, 0, 0, 14, 0.8, 10, "#E8DCC4", pv); for (const [x, z] of [[-5.5, -3.5], [5.5, -3.5], [-5.5, 3.5], [5.5, 3.5]]) Bc(x, 0.8, z, 0.7, 4.5, 0.7, "#B5463A", pv); const rf = new THREE.Mesh(new THREE.ConeGeometry(10.5, 4.5, 4, 1), toon("#3E6B5A")); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.72); rf.position.y = 7.5; add(rf, pv); PARK.add(pv); }
  PARK.visible = false;
  // ghost wireframe of the block (s8)
  const gpos = [];
  { const E = [[0, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 1], [1, 0, 1, 0, 0, 1], [0, 0, 1, 0, 0, 0], [0, 1, 0, 1, 1, 0], [1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 1, 1], [0, 1, 1, 0, 1, 0], [0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [1, 0, 1, 1, 1, 1], [0, 0, 1, 0, 1, 1]];
    const all = blocks.map((b) => [b.x0, b.x1, b.z0, b.z1, b.F * FH]).concat([[HX0, HX1, HZ0, HZ1, HF * FH]]);
    for (const [x0, x1, z0, z1, h] of all) for (const e of E) gpos.push(x0 + e[0] * (x1 - x0), e[1] * h, z0 + e[2] * (z1 - z0), x0 + e[3] * (x1 - x0), e[4] * h, z0 + e[5] * (z1 - z0)); }
  const ghG = new THREE.BufferGeometry(); ghG.setAttribute("position", new THREE.Float32BufferAttribute(gpos, 3));
  const ghM = new THREE.LineBasicMaterial({ color: 0x3fe0ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const GHOST = new THREE.LineSegments(ghG, ghM); GHOST.renderOrder = 5; scene.add(GHOST); noInk.push(GHOST);
  const gvM = new THREE.MeshBasicMaterial({ color: 0x3fe0ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const GVOL = new THREE.InstancedMesh(boxG, gvM, NB + 1); GVOL.renderOrder = 4; scene.add(GVOL); noInk.push(GVOL);
  blocks.concat([{ x0: HX0, x1: HX1, z0: HZ0, z1: HZ1, F: HF }]).forEach((b, i) => { const h = b.F * FH, o = new THREE.Object3D(); o.position.set((b.x0 + b.x1) / 2, h / 2, (b.z0 + b.z1) / 2); o.scale.set(b.x1 - b.x0, h, b.z1 - b.z0); o.updateMatrix(); GVOL.setMatrixAt(i, o.matrix); });

  // ================= LABELS =================
  const L = {
    name: plate("KOTA BERTEMBOK KOWLOON", { h: 22 }),
    fort: plate("BENTENG 1847", { h: 20, bg: YEL }),
    ing: plate("WILAYAH SEWAAN INGGRIS · 1898", { h: 32, bg: CORAL, color: "#fff" }),
    ch: plate("TANAH CHINA", { h: 50, bg: YEL }),
    dik: plate("DIKECUALIKAN", { h: 70, bg: "#D84A3A", color: "#fff", rot: -0.08 }),
    kai: plate("BANDARA KAI TAK", { h: 55, bg: "#fff" }),
    l14: plate("MAKS. 14 LANTAI", { h: 24, bg: "#D84A3A", color: "#fff" }),
    pitch: plate("< 4 LAPANGAN BOLA", { h: 26, bg: "#fff" }),
    park: plate("KINI: TAMAN", { h: 24, bg: MINT, color: "#fff" }),
    scifi: plate("FIKSI ILMIAH", { h: 26, bg: "#0E2A33", color: "#3FE0FF", bd: "#3FE0FF" }),
  };

  // ================= CAMERA =================
  const O = (az, el, d, tx, ty, tz) => [tx + d * Math.sin(az) * Math.cos(el), ty + d * Math.sin(el), tz + d * Math.cos(az) * Math.cos(el), tx, ty, tz];
  const tHook1 = A("s1:lahan") - 0.1, tFar = A("s1:lapangan") + 0.2;
  const CAMK = [
    [0, ...O(0.2, 0.12, 150, HXC, 13, HZ1)],
    [tHook1, ...O(0.26, 0.16, 172, HXC - 2, 14, HZ1 - 2)],
    [tFar, ...O(0.62, 0.56, 1020, 0, -26, 0)],
    [K.s2, ...O(0.7, 0.58, 1060, 0, -28, 0)],
    [A("s2:Awalnya"), ...O(0.76, 0.6, 1000, 0, -30, 0)],
    [A("s2:Tahun"), ...O(0.82, 0.68, 1150, 0, -40, 0)],
    [A("s2:Inggris"), ...O(0.86, 1.0, 2300, 0, -60, 0)],
    [A("s3:enggan"), ...O(0.95, 1.04, 2250, 0, -60, 0)],
    [A("s3:Perang"), ...O(-1.12, 0.5, 1900, 290, -170, 0)],
    [A("s3:Tak") + 0.2, ...O(-1.2, 0.46, 1850, 330, -170, 0)],
    [K.s4 + 0.1, ...O(0.12, 0.17, 300, 15, 4, 120)],
    [A("s4:berdatangan") + 0.4, ...O(0.2, 0.22, 330, 10, 4, 90)],
    [A("s4:membangun"), ...O(0.45, 0.4, 820, 0, -14, 10)],
    [A("s4:Tingginya"), ...O(0.95, 0.12, 1120, 30, 16, 0)],
    [A("s4:lantai"), ...O(1.0, 0.14, 1100, 20, 16, 0)],
    [K.s5, ...O(0.6, 0.56, 1050, 0, -26, 0)],
    [A("s5:Kepadatannya"), ...O(0.55, 0.5, 900, 0, -18, 0)],
    [A("s5:Lorong") - 0.5, 210, 70, ZA, 0, 12, ZA],
    [A("s5:hampir"), 108, 3.4, ZA, 0, 10, ZA],
    [A("s5:matahari") + 0.3, 66, 2.2, ZA, 0, 11, ZA],
    [A("s6:sini"), 40, 1.9, ZA + 0.3, 18, -0.3, ZA],
    [A("s6:Tapi") - 0.05, 37, 1.9, ZA + 0.3, 16, -0.3, ZA],
  ];
  // hard cut on "Tapi": alley -> cutaway framing (no interpolated keys through the block)
  const CAMK2 = [
    [A("s6:Tapi"), ...O(0.18, 0.13, 160, HXC, 16, HZ1)],
    [A("s6:hidup"), ...O(0.16, 0.13, 145, HXC, 15, HZ1)],
    [A("s6:pabrik"), ...O(0.2, 0.1, 82, HXC, 4.6, HZ1)],
    [A("s6:sekolah"), ...O(0.12, 0.09, 82, HXC, 7.6, HZ1)],
    [A("s6:dokter"), ...O(0.05, 0.08, 78, HXC, 10.6, HZ1)],
    [A("s6:izin") + 0.4, ...O(0.02, 0.08, 74, HXC, 10.8, HZ1)],
    [K.s7 + 0.4, ...O(0.5, 0.5, 1000, 0, -24, 0)],
    [A("s7:Antara"), ...O(0.58, 0.48, 940, 0, -20, 0)],
    [A("s7:diratakan"), ...O(0.66, 0.46, 880, 0, -18, 0)],
    [A("s7:taman"), ...O(0.75, 0.5, 800, 0, -22, 0)],
    [A("s8:bentuknya"), ...O(0.85, 0.42, 900, 0, -8, 0)],
    [A("s8:Sanggupkah"), ...O(1.0, 0.4, 960, 0, -10, 0)],
    [K.dur, ...O(1.15, 0.42, 1000, 0, -10, 0)],
  ];
  const CAMA = track(CAMK), CAMB = track(CAMK2), tCut = A("s6:Tapi");
  const CAM = (t) => (t < tCut ? CAMA(t) : CAMB(t));
  const look = new V3();

  const D0 = new THREE.Object3D();
  const tAw = A("s2:Awalnya"), tBuildA = A("s4:Mereka"), tBuildB = A("s4:belas"), tDemA = A("s7:Antara"), tDemB = A("s7:diratakan");
  function floorsAt(b, t) {
    if (t < tAw - 0.3) return b.F;
    if (t < tAw + 1.4) { const tc = tAw - 0.3 + b.r1 * 0.8; return Math.ceil(b.F * (1 - smooth((t - tc) / 0.7))); }
    if (t < tBuildA) return 0;
    let f;
    { const gs = tBuildA + b.r2 * (A("s4:insinyur") - tBuildA); if (t < gs) return 0; f = Math.max(1, Math.ceil(b.F * smooth((t - gs) / Math.max(0.5, tBuildB - gs)))); }
    if (t > tDemA - 0.2) { const td = tDemA + ((b.cx + PX) / 210) * (tDemB - tDemA - 1.2) + b.r3 * 0.6; f = Math.min(f, Math.ceil(b.F * (1 - smooth((t - td) / 1.3)))); }
    return f;
  }
  function heroFloors(t) {
    if (t < tAw - 0.3) return HF;
    if (t < tAw + 1.4) return Math.ceil(HF * (1 - smooth((t - tAw + 0.1) / 0.7)));
    if (t < tBuildA) return 0;
    const gs = tBuildA + 0.4 * (A("s4:insinyur") - tBuildA); if (t < gs) return 0;
    let f = Math.max(1, Math.ceil(HF * smooth((t - gs) / (tBuildB - gs))));
    if (t > tDemA - 0.2) { const td = tDemA + ((HXC + PX) / 210) * (tDemB - tDemA - 1.2) + 0.3; f = Math.min(f, Math.ceil(HF * (1 - smooth((t - td) / 1.3)))); }
    return f;
  }

  return function draw(t) {
    // sky tint per beat
    const alley = t > A("s5:Lorong") - 0.3 && t < A("s6:Tapi");
    const golden = clamp01((t - A("s7:kini")) / 2);
    skyU.top.value.set(0x9cc0d8).lerp(new THREE.Color(0xe7b58f), golden * 0.6);
    skyU.bot.value.set(0xf7efe0).lerp(new THREE.Color(0xffe2bf), golden * 0.7);
    hemi.intensity = alley ? 0.75 : 1.35; key.intensity = alley ? 1.6 : 2.7;
    key.color.set(0xfff0da).lerp(new THREE.Color(0xffd2a0), golden * 0.6);

    // ---------- megablock floors ----------
    let mastI = 0;
    for (let i = 0; i < NB; i++) {
      const b = blocks[i], f = floorsAt(b, t), h = f * FH;
      D0.position.set((b.x0 + b.x1) / 2, h / 2, (b.z0 + b.z1) / 2); D0.scale.set(b.x1 - b.x0, Math.max(0.001, h), b.z1 - b.z0); D0.rotation.set(0, 0, 0); D0.updateMatrix(); BLD.setMatrixAt(i, D0.matrix);
      const on = f >= 3 ? 1 : 0.0001;
      const rr = 1.1 + hsh(i, 21) * 0.9;
      D0.position.set(b.x0 + 2 + hsh(i, 22) * (b.x1 - b.x0 - 4), h + 1.3, b.z0 + 2 + hsh(i, 23) * (b.z1 - b.z0 - 4)); D0.scale.set(rr * on, 2.6 * on, rr * on); D0.updateMatrix(); TANK.setMatrixAt(i, D0.matrix);
      D0.position.set(b.cx + (hsh(i, 24) - 0.5) * 3, h + 1.2, b.cz + (hsh(i, 25) - 0.5) * 3); D0.scale.set(3 * on, 2.4 * on, 2.6 * on); D0.updateMatrix(); HUT.setMatrixAt(i, D0.matrix);
      for (let k = 0; k < 2; k++) { const mh = 4 + hsh(i, 26 + k) * 6; D0.position.set(b.x0 + 1 + hsh(i, 28 + k) * (b.x1 - b.x0 - 2), h + mh / 2, b.z0 + 1 + hsh(i, 30 + k) * (b.z1 - b.z0 - 2)); D0.scale.set(0.18 * on, mh * on, 0.18 * on); D0.updateMatrix(); MAST.setMatrixAt(mastI++, D0.matrix); }
    }
    BLD.instanceMatrix.needsUpdate = TANK.instanceMatrix.needsUpdate = HUT.instanceMatrix.needsUpdate = MAST.instanceMatrix.needsUpdate = true;
    const blockFull = floorsAt(blocks[0], t) > 0 || t < tAw + 1.4;
    for (const S of SIGNS) S.m.visible = (t < tAw - 0.2) || (t > A("s4:Tingginya") && t < tDemA + 1.2);
    // hero tower
    const hf = heroFloors(t);
    FLOORS.forEach((F, i) => { F.visible = i < hf; });
    HERO_G.children.forEach((c) => { if (!FLOORS.includes(c)) c.visible = hf >= HF; });
    // people idle motion
    for (const P of PEOPLE) if (P.pose !== "walk") setPose(P, t);
    ALLEY.visible = t > A("s4:Tingginya") && t < tDemA;

    // ---------- fort ----------
    const fortOn = t > tAw - 0.1 && t < A("s3:membongkar") + 8;
    FORT.visible = t > tAw + 0.3 && t < A("s3:membongkar") + 0.6;
    if (FORT.visible) FORT.position.y = -7 * (1 - smooth((t - tAw - 0.3) / 1.2)) - 8 * smooth((t - A("s3:membongkar") - 0.1) / 0.5);
    STONES.visible = fortOn;
    if (fortOn) {
      const tA = A("s3:membongkar") - 0.2, span = A("s3:Kai") - A("s3:membongkar") + 0.6;
      for (let i = 0; i < NS; i++) {
        const s = SDAT[i];
        const rise = smooth((t - tAw - 0.2 - s.c * 0.22) / 0.5);
        const tf = tA + s.f * span, u = clamp01((t - tf) / 1.5);
        if (u <= 0) { D0.position.copy(s.p); D0.position.y = s.p.y - (1 - rise) * 5; D0.scale.set(2.1, rise > 0.01 ? 1 : 0.001, 2.1); D0.rotation.set(0, 0, 0); }
        else { const e = smooth(u); D0.position.set(s.p.x + (s.tx - s.p.x) * e, s.p.y + (s.ty - s.p.y) * e + 130 * Math.sin(Math.PI * u), s.p.z + (s.tz - s.p.z) * e); D0.scale.set(3.4, 2, 3.4); D0.rotation.set(u * 6 * s.f, u * 4, u * 3); }
        D0.updateMatrix(); STONES.setMatrixAt(i, D0.matrix);
      }
      STONES.instanceMatrix.needsUpdate = true;
    }
    { const land = clamp01((t - A("s3:membongkar") - 1.0) / (A("s3:Kai") - A("s3:membongkar") + 0.6)); const L0 = 1 + 199 * smooth(land); RWX.scale.x = L0; RWX.position.x = 560 + L0 / 2; rwExtT.repeat.x = L0 / 390; }

    // ---------- lease overlay ----------
    const lk = win(t, A("s2:Tahun"), A("s3:Saat"), 0.6, 0.6);
    leaseM.opacity = 0.62 * smooth(clamp01((t - A("s2:Inggris") + 0.3) / 0.8)) * lk; enclM.opacity = 0.75 * smooth(clamp01((t - A("s2:benteng#2") + 0.2) / 0.6)) * lk;
    dashM.opacity = enclM.opacity > 0.05 ? 1 : 0; lease.visible = leaseM.opacity > 0.01; encl.visible = enclM.opacity > 0.01; DASH.visible = dashM.opacity > 0;

    // ---------- surrounding city ----------
    const rk = smooth((t - A("s4:Setelah")) / (A("s4:Tingginya") - A("s4:Setelah")));
    RING.visible = rk > 0.01;
    if (RING.visible) { ring.forEach((b, i) => { const k = smooth(clamp01((rk - b.r * 0.6) / 0.4)), h = Math.max(0.001, b.h * k); D0.position.set(b.x, h / 2, b.z); D0.scale.set(b.w, h, b.d); D0.rotation.set(0, 0, 0); D0.updateMatrix(); RING.setMatrixAt(i, D0.matrix); }); RING.instanceMatrix.needsUpdate = true; }
    cityGM.opacity = rk; cityG.visible = rk > 0.01;

    // ---------- pitches, height line, plane ----------
    const pk = win(t, A("s1:lapangan") - 0.1, A("s1:terpadat"), 0.5, 0.5);
    PITCH.material.opacity = pk * 0.95; PITCH.visible = pk > 0.01; PITCH.position.y = 47 + (1 - pk) * 30;
    const hk = win(t, A("s4:Tingginya") - 0.2, K.s5 + 0.8, 0.6, 0.5);
    lineM.opacity = 0.2 * hk; lineEdgeM.opacity = hk; LINE.visible = hk > 0.01;
    let pv = false;
    for (const tc of [A("s1:lapangan") + 0.3, A("s4:rendah") - 0.6]) {
      const dt = t - tc; if (dt < -9 || dt > 6) continue;
      const p = planeAt(t, tc), p2 = planeAt(t + 0.05, tc);
      const dx = p2.x - p.x, dy = p2.y - p.y, dz = p2.z - p.z;
      PLANE.position.copy(p); PLANE.rotation.set(0, Math.atan2(-dz, dx), Math.atan2(dy, Math.hypot(dx, dz) || 1)); pv = true;
    }
    PLANE.visible = pv;

    // ---------- refugees ----------
    for (const R of REF) {
      const on = t > A("s4:pengungsi") - 1.2 && t < A("s4:membangun") + 1.5;
      R.P.G.visible = on; if (!on) continue;
      const u = clamp01((t - A("s4:pengungsi") + 1.2 - R.d * 1.6) / 6.5);
      R.P.G.position.set(R.x, 0, R.z0 - u * (R.z0 - 30 - R.d * 50)); R.P.G.rotation.y = Math.PI; setPose(R.P, t);
    }

    // ---------- alley shadows ----------
    const gk = t < A("s6:Tapi") ? win(t, A("s6:Geng") - 0.1, A("s6:Tapi") + 1, 0.4, 0.3) : 0;
    SHADOWS.material.opacity = gk * 0.9; SHADOWS.visible = gk > 0.01; LANT.visible = t > A("s5:Lorong") && t < A("s6:Tapi");

    // ---------- demolition dust, park, ghost ----------
    { const on = t > tDemA - 0.3 && t < tDemB + 2.2;
      for (let i = 0; i < 1400; i++) {
        if (!on) { DUST.pos[i * 3 + 1] = -500; continue; }
        const b = blocks[i % NB], td = tDemA + ((b.cx + PX) / 210) * (tDemB - tDemA - 1.2) + b.r3 * 0.6, u = (t - td) / 2.4;
        if (u < 0 || u > 1) { DUST.pos[i * 3 + 1] = -500; continue; }
        const a = hsh(i, 51) * 6.28, rr = 4 + u * 16 * hsh(i, 52);
        DUST.pos[i * 3] = b.cx + Math.cos(a) * rr; DUST.pos[i * 3 + 1] = b.F * FH * (1 - smooth(u * 1.6)) * hsh(i, 53) + u * 10; DUST.pos[i * 3 + 2] = b.cz + Math.sin(a) * rr;
        const c = 1 - u * 0.4; DUST.col[i * 3] = 0.85 * c; DUST.col[i * 3 + 1] = 0.79 * c; DUST.col[i * 3 + 2] = 0.7 * c;
      }
      DUST.commit(); }
    const tk = smooth((t - A("s7:kini") + 0.6) / (A("s7:taman") - A("s7:kini") + 1.4));
    PARK.visible = t > A("s7:diratakan") - 0.6;
    for (const T of TREES) { const k = back(clamp01((tk - T.d * 0.6) / 0.4)); T.g.scale.setScalar(Math.max(0.001, k)); }
    grass.material.opacity = 1;
    const gh = smooth((t - A("s8:bentuknya") + 0.2) / 1.6);
    ghM.opacity = gh * (0.75 + 0.1 * Math.sin(t * 6)); GHOST.visible = gh > 0.01; GHOST.scale.y = Math.max(0.001, gh); gvM.opacity = gh * 0.07; GVOL.visible = GHOST.visible; GVOL.scale.y = GHOST.scale.y;

    // ---------- camera ----------
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    if (t > A("s1:terpadat") + 0.9 && t < A("s1:terpadat") + 1.9) { const d = t - A("s1:terpadat") - 0.9, s = 1.2 * (1 - d); cam.position.y += Math.sin(d * 50) * s; }

    // ---------- labels ----------
    showLab(L.fort, win(t, A("s2:benteng") + 0.3, A("s2:Tahun") + 0.2, 0.3, 0.3), new V3(0, 30, 70), 1);
    showLab(L.ing, win(t, A("s2:Inggris"), A("s3:Saat"), 0.3, 0.4), new V3(70, 30, 185), 1);
    showLab(L.ch, win(t, A("s3:sepotong"), A("s3:Saat"), 0.3, 0.4), new V3(0, 40, -10), 1);
    showLab(L.dik, win(t, A("s2:dikecualikan"), A("s3:sepotong") - 0.2, 0.2, 0.3), new V3(0, 40, 0), 1);
    showLab(L.park, win(t, A("s7:taman") - 0.2, K.s8 + 0.6, 0.3, 0.4), new V3(60, 12, 40), 1);
    showLab(L.scifi, win(t, A("s8:fiksi") - 0.2, A("s8:Sanggupkah") + 0.4, 0.3, 0.4), new V3(0, 62, 50), 1);

    // ---------- ink pre-pass + render ----------
    const hidden = noInk.map((o) => o.visible);
    noInk.forEach((o) => { o.visible = false; });
    scene.overrideMaterial = nMat;
    r.setRenderTarget(rtN); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, cam);
    r.setRenderTarget(null); scene.overrideMaterial = null;
    noInk.forEach((o, i) => { o.visible = hidden[i]; });
    comp.render();
  };
}
