// EP11 TERMOS AIR PANAS. THERMALFORGE: ironbow thermal-vision world.
// Two sets: THERMOS (z=0) cutaway thermos with heat gradients, vacuum gap, silver layer;
// TRANSFER (z=-60) three heat-transfer demos (conduction, convection, radiation).
// Ironbow palette: #1B0533 cool → #2D1B69 → #00A5CF cyan → #5BBA6F green → #E8A838 warm → #FF5722 hot → white-hot points.
// Run from project/: node build-video.mjs (this file is copied to hf/assets/lib/)
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { ShaderPass } from "./ShaderPass.js";
const { PI, sin, cos, abs, min, max, floor } = Math;
const TAU = PI * 2;
const clamp = (v, a = 0, b = 1) => min(max(v, a), b);
const lerp = (a, b, u) => a + (b - a) * u;
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const win = (t, a, b, f = 0.3) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));
const mix = (c1, c2, u) => c1.clone().lerp(c2, clamp(u));

function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let z = Math.imul(s ^ s >>> 15, 1 | s); z ^= z + Math.imul(z ^ z >>> 7, 61 | z); return ((z ^ z >>> 14) >>> 0) / 4294967296; }; }

const C = { void: new THREE.Color("#1B0533"), cool: new THREE.Color("#2D1B69"), cyan: new THREE.Color("#00A5CF"),
  green: new THREE.Color("#5BBA6F"), warm: new THREE.Color("#E8A838"), hot: new THREE.Color("#FF5722"),
  white: new THREE.Color("#FFF8E1"), silver: new THREE.Color("#C0C0C0"), steam: new THREE.Color("#FFE0B2") };

function ironbow(u) {
  u = clamp(u);
  if (u < 0.2) return mix(C.void, C.cool, u / 0.2);
  if (u < 0.4) return mix(C.cool, C.cyan, (u - 0.2) / 0.2);
  if (u < 0.6) return mix(C.cyan, C.green, (u - 0.4) / 0.2);
  if (u < 0.8) return mix(C.green, C.warm, (u - 0.6) / 0.2);
  return mix(C.warm, C.hot, (u - 0.8) / 0.2);
}

function ptsMat(size, blend) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: blend ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uSize: { value: size }, uAlpha: { value: 1 } },
    vertexShader: `attribute vec3 clr; varying vec3 vC; varying float vA; uniform float uSize;
      void main(){vC=clr;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=uSize*(300./-mv.z);gl_Position=projectionMatrix*mv;vA=1.;}`,
    fragmentShader: `varying vec3 vC;uniform float uAlpha;
      void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,uAlpha*(1.-d*2.)*0.9);}` });
}

function stage(scene, renderer) {
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  scene.fog = new THREE.FogExp2(0x1B0533, 0.012);
  scene.background = new THREE.Color(0x1B0533);
  scene.environmentIntensity = 0.55;
}

function track(cam, points, t) {
  const n = points.length - 1; const u = clamp(t) * n; const i = min(floor(u), n - 1); const f = u - i;
  const a = points[i], b = points[i + 1];
  cam.position.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
  cam.lookAt(lerp(a[3], b[3], f), lerp(a[4], b[4], f), lerp(a[5], b[5], f));
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const rng = mulberry(1892);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(1080, 1920); renderer.setPixelRatio(1);
  stage(scene, renderer);

  // NanGuard + Grade (laser-sweep wipe for THERMALFORGE)
  const comp = new EffectComposer(renderer);
  comp.addPass(new RenderPass(scene, camera));
  const nanFix = new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c)))c=vec4(0);gl_FragColor=c;}` });
  comp.addPass(nanFix);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1080, 1920), 0.4, 0.6, 0.7);
  comp.addPass(bloom);
  const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uVig: { value: 0.4 }, uGrain: { value: 0.04 }, uSeed: { value: 0 },
      uScan: { value: 0 }, uScanW: { value: 0.06 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uVig,uGrain,uSeed,uScan,uScanW;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453+uSeed);}
      void main(){vec4 c=texture2D(tDiffuse,vUv);float v=1.-uVig*pow(length(vUv-.5)*1.4,2.2);c.rgb*=v;
      c.rgb+=uGrain*(hash(vUv*900.)-.5);
      float sl=smoothstep(uScan-uScanW,uScan,vUv.y)*smoothstep(uScan+uScanW,uScan,vUv.y);
      c.rgb+=vec3(.15,.06,.0)*sl;
      gl_FragColor=c;}` });
  comp.addPass(grade);
  grade.material.uniforms.uVig.value = 0.4;

  // lights
  const amb = new THREE.AmbientLight(0x2D1B69, 0.3); scene.add(amb);
  const key = new THREE.DirectionalLight(0xFFE0B2, 0.6); key.position.set(3, 5, 4); scene.add(key);

  // ---- SET: THERMOS (z=0) ----
  const THERM = new THREE.Group(); scene.add(THERM);

  // outer shell (cylinder, thermal-cool)
  const outerGeo = new THREE.CylinderGeometry(0.7, 0.7, 3.2, 32, 1, true);
  const outerMat = new THREE.MeshStandardMaterial({ color: 0x2D1B69, metalness: 0.3, roughness: 0.7, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const outer = new THREE.Mesh(outerGeo, outerMat); outer.position.y = 1.6; THERM.add(outer);

  // inner flask (smaller, hot orange glow)
  const innerGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.8, 32, 1, true);
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xFF5722, emissive: 0xE8A838, emissiveIntensity: 0.5, metalness: 0.1, roughness: 0.5, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const inner = new THREE.Mesh(innerGeo, innerMat); inner.position.y = 1.6; THERM.add(inner);

  // vacuum gap ring (visible dark gap between walls)
  const gapGeo = new THREE.RingGeometry(0.5, 0.7, 32);
  const gapMat = new THREE.MeshBasicMaterial({ color: 0x0A0514, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const gapTop = new THREE.Mesh(gapGeo, gapMat); gapTop.rotation.x = -PI / 2; gapTop.position.y = 3.2; THERM.add(gapTop);
  const gapBot = new THREE.Mesh(gapGeo, gapMat.clone()); gapBot.rotation.x = -PI / 2; gapBot.position.y = 0; THERM.add(gapBot);

  // silver layer (reflective ring between walls)
  const silverGeo = new THREE.CylinderGeometry(0.58, 0.58, 2.6, 32, 1, true);
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const silver = new THREE.Mesh(silverGeo, silverMat); silver.position.y = 1.6; THERM.add(silver);

  // lid/cap
  const lidGeo = new THREE.CylinderGeometry(0.75, 0.72, 0.4, 32);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x2D1B69, metalness: 0.4, roughness: 0.6 });
  const lid = new THREE.Mesh(lidGeo, lidMat); lid.position.y = 3.5; THERM.add(lid);

  // neck connector (small bright ring where heat leaks)
  const neckGeo = new THREE.TorusGeometry(0.6, 0.04, 8, 32);
  const neckMat = new THREE.MeshBasicMaterial({ color: 0xE8A838 });
  const neck = new THREE.Mesh(neckGeo, neckMat); neck.rotation.x = PI / 2; neck.position.y = 3.15; THERM.add(neck);
  neck.visible = false;

  // hot liquid particles inside
  const NL = 200;
  const liqGeo = new THREE.BufferGeometry();
  const lpos = new Float32Array(NL * 3), lclr = new Float32Array(NL * 3);
  for (let i = 0; i < NL; i++) {
    const a = rng() * TAU, r = rng() * 0.42, y = 0.3 + rng() * 2.4;
    lpos[i * 3] = cos(a) * r; lpos[i * 3 + 1] = y; lpos[i * 3 + 2] = sin(a) * r;
    const c = ironbow(0.7 + rng() * 0.3); lclr[i * 3] = c.r; lclr[i * 3 + 1] = c.g; lclr[i * 3 + 2] = c.b;
  }
  liqGeo.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
  liqGeo.setAttribute("clr", new THREE.BufferAttribute(lclr, 3));
  const liqPts = new THREE.Points(liqGeo, ptsMat(4, true)); THERM.add(liqPts);

  // steam particles above thermos
  const NS = 80;
  const stmGeo = new THREE.BufferGeometry();
  const spos = new Float32Array(NS * 3), sclr = new Float32Array(NS * 3);
  for (let i = 0; i < NS; i++) {
    spos[i * 3] = (rng() - 0.5) * 0.6; spos[i * 3 + 1] = 3.6 + rng() * 1.5; spos[i * 3 + 2] = (rng() - 0.5) * 0.6;
    sclr[i * 3] = 1; sclr[i * 3 + 1] = 0.88; sclr[i * 3 + 2] = 0.7;
  }
  stmGeo.setAttribute("position", new THREE.BufferAttribute(spos, 3));
  stmGeo.setAttribute("clr", new THREE.BufferAttribute(sclr, 3));
  const steamPts = new THREE.Points(stmGeo, ptsMat(3, true)); THERM.add(steamPts);

  // heat arrows (3 types, shown in s4)
  function makeArrow(from, to, color) {
    const dir = new THREE.Vector3().subVectors(to, from); const len = dir.length();
    const arrowHelper = new THREE.ArrowHelper(dir.normalize(), from, len, color, 0.15, 0.08);
    arrowHelper.visible = false; THERM.add(arrowHelper); return arrowHelper;
  }
  const condArrow = makeArrow(new THREE.Vector3(-1.2, 1), new THREE.Vector3(-0.75, 1), 0xE8A838);
  const convArrow = makeArrow(new THREE.Vector3(0, 3.8), new THREE.Vector3(0.6, 4.5), 0xFF5722);
  const radArrow = makeArrow(new THREE.Vector3(0.8, 2), new THREE.Vector3(1.5, 2), 0xFF5722);

  // vacuum label particles (appear in s5)
  const NV = 60;
  const vacGeo = new THREE.BufferGeometry();
  const vpos = new Float32Array(NV * 3), vclr = new Float32Array(NV * 3);
  for (let i = 0; i < NV; i++) {
    const a = rng() * TAU, r = 0.52 + rng() * 0.16, y = 0.4 + rng() * 2.4;
    vpos[i * 3] = cos(a) * r; vpos[i * 3 + 1] = y; vpos[i * 3 + 2] = sin(a) * r;
    const c = C.void.clone(); vclr[i * 3] = c.r; vclr[i * 3 + 1] = c.g; vclr[i * 3 + 2] = c.b;
  }
  vacGeo.setAttribute("position", new THREE.BufferAttribute(vpos, 3));
  vacGeo.setAttribute("clr", new THREE.BufferAttribute(vclr, 3));
  const vacPts = new THREE.Points(vacGeo, ptsMat(3, false)); vacPts.visible = false; THERM.add(vacPts);

  // AUDIRA billboard
  const boardGeo = new THREE.PlaneGeometry(1.8, 0.3);
  const boardCvs = document.createElement("canvas"); boardCvs.width = 512; boardCvs.height = 80;
  const bctx = boardCvs.getContext("2d"); bctx.fillStyle = "#1B0533"; bctx.fillRect(0, 0, 512, 80);
  bctx.fillStyle = "#00A5CF"; bctx.font = "bold 48px monospace"; bctx.textAlign = "center"; bctx.fillText("AUDIRA", 256, 56);
  const boardTex = new THREE.CanvasTexture(boardCvs);
  const board = new THREE.Mesh(boardGeo, new THREE.MeshBasicMaterial({ map: boardTex, transparent: true }));
  board.position.set(0, -0.5, 1.2); board.visible = false; THERM.add(board);

  // ---- SET: TRANSFER DEMOS (z=-60) ----
  const XFER = new THREE.Group(); XFER.position.z = -60; scene.add(XFER);

  // Conduction demo: two blocks touching, heat flowing
  const blockHot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xFF5722, emissive: 0xE8A838, emissiveIntensity: 0.3 }));
  blockHot.position.set(-1.5, 0.4, 0); XFER.add(blockHot);
  const blockCold = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x2D1B69 }));
  blockCold.position.set(-0.7, 0.4, 0); XFER.add(blockCold);

  // Convection demo: heated air rising (particle column)
  const NC = 40;
  const convGeo = new THREE.BufferGeometry();
  const cpos = new Float32Array(NC * 3), cclr = new Float32Array(NC * 3);
  for (let i = 0; i < NC; i++) {
    cpos[i * 3] = (rng() - 0.5) * 0.3; cpos[i * 3 + 1] = rng() * 2.5; cpos[i * 3 + 2] = (rng() - 0.5) * 0.3;
    const c = ironbow(0.3 + (i / NC) * 0.5); cclr[i * 3] = c.r; cclr[i * 3 + 1] = c.g; cclr[i * 3 + 2] = c.b;
  }
  convGeo.setAttribute("position", new THREE.BufferAttribute(cpos, 3));
  convGeo.setAttribute("clr", new THREE.BufferAttribute(cclr, 3));
  const convPts = new THREE.Points(convGeo, ptsMat(5, true)); convPts.position.set(0, 0, 0); XFER.add(convPts);

  // Radiation demo: wavy IR lines
  const radGeo = new THREE.BufferGeometry();
  const NR = 50; const rpos = new Float32Array(NR * 3), rclr = new Float32Array(NR * 3);
  for (let i = 0; i < NR; i++) {
    rpos[i * 3] = 1.2 + (i / NR) * 2; rpos[i * 3 + 1] = 1; rpos[i * 3 + 2] = 0;
    const c = ironbow(0.8 - (i / NR) * 0.4); rclr[i * 3] = c.r; rclr[i * 3 + 1] = c.g; rclr[i * 3 + 2] = c.b;
  }
  radGeo.setAttribute("position", new THREE.BufferAttribute(rpos, 3));
  radGeo.setAttribute("clr", new THREE.BufferAttribute(rclr, 3));
  const radPts = new THREE.Points(radGeo, ptsMat(4, true)); XFER.add(radPts);

  // ---- SET: LAB (z=-120) — Dewar / nitrogen / Thermos brand ----
  const LAB = new THREE.Group(); LAB.position.z = -120; scene.add(LAB);

  // Dewar flask (nitrogen, cold blue)
  const dewGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 32, 1, true);
  const dewMat = new THREE.MeshStandardMaterial({ color: 0x00A5CF, emissive: 0x00A5CF, emissiveIntensity: 0.2, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const dewFlask = new THREE.Mesh(dewGeo, dewMat); dewFlask.position.y = 1.25; LAB.add(dewFlask);

  // cold vapour particles
  const NCV = 60;
  const cvGeo = new THREE.BufferGeometry();
  const cvpos = new Float32Array(NCV * 3), cvclr = new Float32Array(NCV * 3);
  for (let i = 0; i < NCV; i++) {
    cvpos[i * 3] = (rng() - 0.5) * 1; cvpos[i * 3 + 1] = 2.5 + rng() * 1.5; cvpos[i * 3 + 2] = (rng() - 0.5) * 1;
    cvclr[i * 3] = 0; cvclr[i * 3 + 1] = 0.65; cvclr[i * 3 + 2] = 0.81;
  }
  cvGeo.setAttribute("position", new THREE.BufferAttribute(cvpos, 3));
  cvGeo.setAttribute("clr", new THREE.BufferAttribute(cvclr, 3));
  const coldVapour = new THREE.Points(cvGeo, ptsMat(4, true)); LAB.add(coldVapour);

  // Thermos brand bottle (distinct shape, warm tone for "hot")
  const brandGeo = new THREE.CylinderGeometry(0.35, 0.4, 2, 16);
  const brandMat = new THREE.MeshStandardMaterial({ color: 0xE8A838, metalness: 0.5, roughness: 0.4 });
  const brandBottle = new THREE.Mesh(brandGeo, brandMat); brandBottle.position.set(2.5, 1, 0); brandBottle.visible = false; LAB.add(brandBottle);

  // cork box (old insulation method, s3)
  const boxGeo = new THREE.BoxGeometry(1.2, 0.8, 0.8);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.9 });
  const corkBox = new THREE.Mesh(boxGeo, boxMat); corkBox.position.set(-2, 0.4, 0); corkBox.visible = false; THERM.add(corkBox);

  // ---- CAMERA TRACKS ----
  const DUR = K.outro + 1.5;
  // thermos overview (s1-s3)
  const CT = [[4, 3, 5, 0, 1.6, 0], [3, 2.5, 4, 0, 1.6, 0], [2.5, 2, 3, 0, 1.5, 0], [2, 3, 3.5, 0, 2, 0]];
  // transfer demos (s4)
  const CX = [[4, 2, -57, 0, 1, -60], [3, 2, -56, 0, 0.8, -60], [2, 1.5, -58, 0, 1, -60]];
  // vacuum detail (s5)
  const CV = [[2, 2, 2, 0, 1.5, 0], [1.5, 1.8, 1.5, 0, 1.8, 0], [1.2, 2.2, 1.2, 0, 2, 0]];
  // silver + neck (s6)
  const CS = [[1.5, 3, 1.5, 0, 2.5, 0], [1.2, 3.2, 1, 0, 3, 0], [1, 2.8, 1.5, 0, 2.5, 0]];
  // lab nitrogen (s7)
  const CL = [[4, 2.5, -117, 0, 1.2, -120], [3, 2, -116, 0, 1, -120], [2, 2.5, -118, 0, 1.5, -120], [3.5, 2, -117, 1.5, 1, -120]];
  // back to thermos (s8)
  const C8 = [[3, 2.5, 4, 0, 1.6, 0], [3.5, 2, 4.5, 0, 1.5, 0]];

  // ---- RENDER LOOP ----
  return function render(t) {
    grade.material.uniforms.uSeed.value = t * 100;
    // scan-line sweep on scene transitions
    const scanT = [K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8].reduce((best, st) => abs(t - st) < abs(t - best) ? st : best, 999);
    const sd = t - scanT; grade.material.uniforms.uScan.value = sd > -0.3 && sd < 0.5 ? 1 - ramp(sd, -0.3, 0.5) : -0.5;

    // camera
    if (t < K.s4) { track(camera, CT, ramp(t, 0, K.s4)); }
    else if (t < K.s5) { track(camera, CX, ramp(t, K.s4, K.s5)); }
    else if (t < K.s6) { track(camera, CV, ramp(t, K.s5, K.s6)); }
    else if (t < K.s7) { track(camera, CS, ramp(t, K.s6, K.s7)); }
    else if (t < K.s8) { track(camera, CL, ramp(t, K.s7, K.s8)); }
    else { track(camera, C8, ramp(t, K.s8, DUR)); }

    // ---- THERMOS animations ----
    // cutaway: rotate thermos slowly to show interior
    THERM.rotation.y = 0.3 * sin(t * 0.15);

    // outer shell: thermal glow increases as we explain heat loss
    const heatLoss = t >= K.s6 ? ramp(t, A("s6:bocor") - 0.3, A("s6:bocor") + 0.5) * 0.3 : 0;
    outerMat.emissive = ironbow(0.15 + heatLoss); outerMat.emissiveIntensity = 0.15 + heatLoss * 0.5;

    // inner flask: liquid cools slightly over time (subtle)
    const cool = ramp(t, K.s1, K.s8) * 0.15;
    innerMat.emissiveIntensity = 0.5 - cool;

    // silver layer: fades in during s6
    const silverShow = win(t, A("s6:lapisan") - 0.3, K.s7, 0.4);
    silverMat.opacity = silverShow * 0.7;

    // neck: visible in s6 when talking about heat leaking through neck
    neck.visible = t >= A("s6:leher") - 0.3 && t < K.s7;
    neck.material.color = ironbow(0.7 + 0.2 * sin(t * 3));

    // cork box: visible in s3 before Dewar makes the bottle
    corkBox.visible = t >= K.s3 && t < A("s3:botol") - 0.2;

    // lid: thermal pulse when talking about heat escaping through lid
    if (t >= A("s6:tutupnya") - 0.3 && t < K.s7) {
      lidMat.emissive = ironbow(0.6); lidMat.emissiveIntensity = 0.4 * (0.5 + 0.5 * sin(t * 4));
    } else { lidMat.emissiveIntensity = 0; }

    // steam particles: rise and drift
    const sp = steamPts.geometry.attributes.position;
    for (let i = 0; i < NS; i++) {
      let y = sp.getY(i) + 0.02; if (y > 5.5) y = 3.6 + (y - 5.5);
      sp.setY(i, y); sp.setX(i, sp.getX(i) + sin(t * 2 + i) * 0.002);
    }
    sp.needsUpdate = true;
    steamPts.material.uniforms.uAlpha.value = t < K.s4 ? 0.5 : t < K.s8 ? 0.2 : 0.4;

    // liquid particles: gentle convection swirl
    const lp = liqPts.geometry.attributes.position;
    for (let i = 0; i < NL; i++) {
      const y0 = lp.getY(i); lp.setY(i, 0.3 + ((y0 - 0.3 + 0.005) % 2.4));
      lp.setX(i, lp.getX(i) + cos(t + i * 0.5) * 0.001);
    }
    lp.needsUpdate = true;

    // vacuum gap particles: visible in s5
    vacPts.visible = t >= A("s5:menyedot") - 0.3 && t < K.s7;
    if (vacPts.visible) {
      const vp = vacPts.geometry.attributes.position;
      const suck = ramp(t, A("s5:menyedot"), A("s5:dinding") + 0.5);
      for (let i = 0; i < NV; i++) {
        const a = (i / NV) * TAU, r = 0.52 + 0.16 * (1 - suck);
        vp.setX(i, cos(a + t * 0.3) * r); vp.setZ(i, sin(a + t * 0.3) * r);
      }
      vp.needsUpdate = true;
      vacPts.material.uniforms.uAlpha.value = (1 - suck) * 0.6;
    }

    // ---- TRANSFER DEMO animations (s4) ----
    const s4on = t >= K.s4 && t < K.s5;
    condArrow.visible = s4on && t >= A("s4:Konduksi") - 0.2;
    convArrow.visible = s4on && t >= A("s4:konveksi") - 0.2;
    radArrow.visible = s4on && t >= A("s4:radiasi") - 0.2;

    // conduction: cold block heats up
    if (s4on) {
      const ch = ramp(t, A("s4:Konduksi"), A("s4:konveksi"));
      blockCold.material.color = ironbow(ch * 0.5);
      blockCold.material.emissive = ironbow(ch * 0.4); blockCold.material.emissiveIntensity = ch * 0.3;
    }

    // convection: particles rise
    if (s4on) {
      const cp = convPts.geometry.attributes.position;
      for (let i = 0; i < NC; i++) {
        let y = cp.getY(i) + 0.03; if (y > 2.5) y = 0;
        cp.setY(i, y); cp.setX(i, cp.getX(i) + sin(t * 3 + i) * 0.003);
      }
      cp.needsUpdate = true;
    }

    // radiation: wavy sine motion
    if (s4on) {
      const rp = radPts.geometry.attributes.position;
      for (let i = 0; i < NR; i++) {
        rp.setY(i, 1 + 0.15 * sin(t * 5 + i * 0.5));
      }
      rp.needsUpdate = true;
    }

    // ---- LAB animations (s7) ----
    // cold vapour rises
    if (t >= K.s7 - 0.3) {
      const cvp = coldVapour.geometry.attributes.position;
      for (let i = 0; i < NCV; i++) {
        let y = cvp.getY(i) + 0.015; if (y > 4.5) y = 2.5;
        cvp.setY(i, y); cvp.setX(i, cvp.getX(i) + sin(t + i * 0.7) * 0.002);
      }
      cvp.needsUpdate = true;
    }

    // Thermos brand bottle appears when mentioned
    brandBottle.visible = t >= A("s7:Thermos") - 0.3;

    // AUDIRA billboard
    board.visible = t >= A("s8:AUDIRA") - 0.5;

    comp.render();
  };
}
