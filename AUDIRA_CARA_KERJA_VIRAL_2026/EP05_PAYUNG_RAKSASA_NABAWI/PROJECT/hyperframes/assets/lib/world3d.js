// EP05 THE BLOOM. A marble piazza with 250 convertible umbrellas in front of a generic mosque arcade (illustration, not a replica).
// Each umbrella: octagonal mast, four mosaic cladding panels that swing open, eight main arms, and a sand-coloured funnel membrane.
// Open heights alternate 14.4 m and 15.3 m so the edges overlap. 1 unit = 1 m.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, box, cyl, std, canvasTex, eout } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const SP = 25.5, HALF = 12.7, FOLD = 21.7;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.95;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.5, 9000);
  const rnd = mulberry(250);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    mekar: A_("s1:mekar", s.s1 + 4), dibahas: A_("s2:dibahas", s.s2 + 1), meter: A_("s2:meter", s.s2 + 10),
    terlipat: A_("s3:terlipat", s.s3 + 0.5), mozaik: A_("s3:mozaik", s.s3 + 8),
    perintah: A_("s4:perintah", s.s4 + 0.6), diag: A_("s4:diagonal", s.s4 + 5), tengah: A_("s4:tengah", s.s4 + 6.5), pend: A_("s4:pendukung", s.s4 + 8), kelopak: A_("s4:kelopak", s.s4 + 12),
    ptfe: A_("s5:PTFE", s.s5 + 0.4), pasir: A_("s5:pasir", s.s5 + 7),
    menumpuk: A_("s6:menumpuk", s.s6 + 6), atap: A_("s6:atap", s.s6 + 9),
    kontrol: A_("s7:kontrol", s.s7 + 6), kipas: A_("s7:kipas", s.s7 + 8), lampu: A_("s7:lampu", s.s7 + 9.5),
    menutup: A_("s8:Menutup", s.s8 + 1.5), buka: A_("s8:membukanya", s.s8 + 3.5),
  };

  const S = new THREE.Scene();
  const SUN = v3(0.5, 0.35, 0.55).normalize();
  const skyU = { uS: { value: SUN.clone() }, uDusk: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 uS;uniform float uDusk;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 day=mix(vec3(1.05,.86,.66),vec3(.32,.55,.9),pow(y,.45));vec3 dusk=mix(vec3(1.2,.55,.3),vec3(.12,.16,.35),pow(y,.4));
      vec3 c=mix(day,dusk,uDusk);float d=max(dot(n,normalize(uS)),0.);c+=vec3(1.,.75,.45)*(pow(d,900.)*22.+pow(d,10.)*.35);gl_FragColor=vec4(c,1.);}`,
  }));
  S.add(sky);
  S.environment = skyEnv(r, 0x6f9ad6, 0xf2d5ae, 0x8a7a66, SUN, 0xffd9a0, 3);
  S.environmentIntensity = 0.55;
  const sun = new THREE.DirectionalLight(0xffe2b8, 4.0);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;
  Object.assign(sun.shadow.camera, { left: -180, right: 180, top: 180, bottom: -180, near: 1, far: 900 });
  S.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xbcd4ff, 0xb59a78, 0.5); S.add(hemi);

  // marble floor with an eight-point star pattern
  const floorTex = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = "#e9e4da"; c.fillRect(0, 0, w, w);
    const R = mulberry(9);
    for (let i = 0; i < 2600; i++) { c.fillStyle = R() > 0.5 ? "rgba(160,150,135,.06)" : "rgba(255,255,255,.08)"; c.fillRect(R() * w, R() * w, 2 + R() * 30, 1 + R() * 3); }
    c.strokeStyle = "rgba(120,108,92,.55)"; c.lineWidth = 5;
    const star = (cx, cy, rr) => { c.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; const q = k % 2 ? rr * 0.55 : rr; c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } c.closePath(); c.stroke(); };
    star(w / 2, w / 2, w * 0.36); star(0, 0, w * 0.2); star(w, 0, w * 0.2); star(0, w, w * 0.2); star(w, w, w * 0.2);
    c.strokeRect(2, 2, w - 4, w - 4);
  }, [80, 80]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.35, metalness: 0.0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; S.add(floor);
  const desert = new THREE.Mesh(new THREE.RingGeometry(1000, 6000, 64), std(0xc9a77c, 0.95)); desert.rotation.x = -Math.PI / 2; desert.position.y = -0.05; S.add(desert);

  // generic mosque arcade and minarets behind the piazza
  const wallM = std(0xf1ece2, 0.6), stoneM = std(0xd9cfbf, 0.7);
  const ZB = -40;
  box(470, 22, 60, wallM, 0, 11, ZB - 30, S);
  const archShape = new THREE.Shape(); archShape.moveTo(-4.2, 0); archShape.lineTo(-4.2, 10); archShape.absarc(0, 10, 4.2, Math.PI, 0, true); archShape.lineTo(4.2, 0); archShape.closePath();
  const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 1, bevelEnabled: false, curveSegments: 16 });
  const archM = std(0x3e352b, 0.85);
  for (let i = -15; i <= 15; i++) { const m = new THREE.Mesh(archGeo, archM); m.position.set(i * 15, 0, ZB); S.add(m); }
  const minaret = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    cyl(4.5, 5, 30, 8, stoneM, 0, 15, 0, g); cyl(5.6, 5.6, 1.6, 8, wallM, 0, 31, 0, g);
    cyl(3.6, 4.0, 26, 8, stoneM, 0, 45, 0, g); cyl(4.6, 4.6, 1.4, 8, wallM, 0, 58.5, 0, g);
    cyl(2.8, 3.2, 22, 8, stoneM, 0, 70, 0, g); cyl(3.6, 3.6, 1.2, 8, wallM, 0, 81.5, 0, g);
    cyl(0.4, 2.8, 12, 8, std(0xcfa95a, 0.35, 0.8), 0, 88, 0, g);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  };
  [-225, -120, 120, 225].forEach((x) => minaret(x, ZB - 4));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), std(0x2f8a5e, 0.45, 0.2)); dome.position.set(-60, 22, ZB - 40); S.add(dome);

  // ---------- umbrellas ----------
  const pos = [];
  for (let row = 0; row < 17 && pos.length < 250; row++) for (let col = -7; col <= 7 && pos.length < 250; col++) {
    pos.push({ x: col * SP, z: SP / 2 + row * SP, hi: (row + col) % 2 === 0 });
  }
  const NU = pos.length;
  // membrane: square funnel with arched free edges between arm tips
  const memG = new THREE.PlaneGeometry(SP - 0.1, SP - 0.1, 48, 48);
  memG.rotateX(-Math.PI / 2);
  const pa = memG.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), z = pa.getZ(i);
    const d = Math.max(Math.abs(x), Math.abs(z)) / HALF, rr = Math.min(1, Math.hypot(x, z) / HALF);
    const along = Math.abs(x) > Math.abs(z) ? z : x;
    const frac = ((along / HALF) + 1) % 1;
    const arch = 1.4 * Math.sin(Math.PI * frac) * Math.pow(d, 5);
    pa.setY(i, -2.8 * Math.pow(1 - rr, 2) + arch);
  }
  memG.computeVertexNormals();
  const memTex = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = "#efe3cb"; c.fillRect(0, 0, w, w);
    c.strokeStyle = "rgba(52,92,150,.28)"; c.lineWidth = 5;
    for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(w / 2, w / 2, 70 + k * 70, 0, Math.PI * 2); c.stroke(); }
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; c.beginPath(); c.moveTo(w / 2, w / 2); c.lineTo(w / 2 + Math.cos(a) * w, w / 2 + Math.sin(a) * w); c.stroke(); }
  });
  const memM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: memTex, roughness: 0.75, side: THREE.DoubleSide, emissive: 0x3a2c18, emissiveIntensity: 0.25 });
  const mem = new THREE.InstancedMesh(memG, memM, NU); mem.castShadow = mem.receiveShadow = true; mem.frustumCulled = false; S.add(mem);
  const mastM = std(0xf4efe6, 0.45);
  const mast = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.55, 0.7, 1, 8), mastM, NU); mast.castShadow = true; mast.frustumCulled = false; S.add(mast);
  const capM = std(0xcfa95a, 0.35, 0.7);
  const cap = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.2, 0.6, 1.4, 8), capM, NU); cap.castShadow = true; cap.frustumCulled = false; S.add(cap);
  const mosaic = canvasTex(256, 1024, (c, w, h) => {
    const R = mulberry(4); const cols = ["#1f6b5a", "#c9a24f", "#2a4c8a", "#efe6d2", "#7a2f2a"];
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { c.fillStyle = cols[Math.floor(R() * cols.length)]; c.fillRect(x, y, 15, 15); }
    c.strokeStyle = "#c9a24f"; c.lineWidth = 8; for (let y = 64; y < h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w / 2, y - 48); c.lineTo(w, y); c.stroke(); }
  });
  const panelGeo = new THREE.BoxGeometry(1.9, 7.4, 0.18); panelGeo.translate(0, 3.7, 0);
  const panelM = new THREE.MeshStandardMaterial({ map: mosaic, roughness: 0.4, metalness: 0.2 });
  const panels = new THREE.InstancedMesh(panelGeo, panelM, NU * 4); panels.castShadow = true; panels.frustumCulled = false; S.add(panels);
  const armGeo = new THREE.BoxGeometry(0.22, 0.22, 1); armGeo.translate(0, 0, 0.5);
  const armM = std(0xe8e2d6, 0.4, 0.5);
  const arms = new THREE.InstancedMesh(armGeo, armM, NU * 8); arms.castShadow = true; arms.frustumCulled = false; S.add(arms);
  // mast lights and mist for the services chapter
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.3, 1.4) });
  const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 10, 8), lampM, NU * 2); lamps.frustumCulled = false; S.add(lamps);
  const NM = 900;
  const MD = []; for (let i = 0; i < NM; i++) MD.push({ u: Math.floor(rnd() * 40), a: rnd() * Math.PI * 2, tb: rnd() * 3, k: rnd() });
  const mG = new THREE.BufferGeometry(); const mP = new Float32Array(NM * 3), mS = new Float32Array(NM), mA = new Float32Array(NM);
  mG.setAttribute("position", new THREE.BufferAttribute(mP, 3)); mG.setAttribute("sz", new THREE.BufferAttribute(mS, 1)); mG.setAttribute("al", new THREE.BufferAttribute(mA, 1));
  const mist = new THREE.Points(mG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: `attribute float sz,al;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*2790./max(1.,-mv.z);vA=al;}`,
    fragmentShader: `varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(1.),vA*pow(1.-d,2.));}` }));
  mist.frustumCulled = false; S.add(mist);
  // worshippers as small white figures, scattered
  const NPp = 1400;
  const ppl = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.22, 1.1, 3, 6), std(0xf6f4ef, 0.8), NPp);
  const dm = new THREE.Object3D();
  for (let i = 0; i < NPp; i++) { dm.position.set((rnd() - 0.5) * 360, 0.77, 5 + rnd() * 420); dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); ppl.setMatrixAt(i, dm.matrix); }
  ppl.castShadow = true; S.add(ppl);

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.5, 1.3));
  comp.addPass(new OutputPass());

  const HERO = pos.findIndex((p) => p.x === 0 && p.z === SP / 2 + 2 * SP);
  const q = new THREE.Quaternion(), Z = v3(0, 0, 1);
  function setArm(i, a, b) {
    const d = b.clone().sub(a), L = d.length();
    dm.position.copy(a); q.setFromUnitVectors(Z, d.normalize()); dm.quaternion.copy(q); dm.scale.set(1, 1, Math.max(0.01, L)); dm.updateMatrix();
    arms.setMatrixAt(i, dm.matrix);
  }
  function openAt(t) {
    if (t < s.s2) return ramp(t, E.mekar - 0.6, E.mekar + 2.4);
    if (t < s.s3) return 1;
    if (t < s.s4) return 0;
    if (t < s.s5) return eout(ramp(t, E.perintah, E.kelopak + 0.6));
    if (t < s.s8) return 1;
    return 1 - ramp(t, E.menutup - 0.3, E.menutup + 2.2) + ramp(t, E.buka, E.buka + 2.6);
  }
  const look = (p, tg) => { cam.position.copy(p); cam.lookAt(tg); };
  const lv = (a, b, u) => a.clone().lerp(b, u);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const o = clamp01(openAt(t));
    // sun: dawn in the hook, high in the middle chapters, dusk for lights
    const dusk = t >= s.s7 && t < s.s8 ? ramp(t, E.kontrol - 1, E.lampu) : t >= s.s8 ? 0.4 : 0;
    const el = t < s.s2 ? 0.12 + 0.12 * ramp(t, 0, s.s2) : t < s.s3 ? 0.5 : t < s.s4 ? 0.14 : 0.62 - 0.5 * dusk;
    SUN.set(Math.cos(el) * 0.65, Math.sin(el), Math.cos(el) * 0.76).normalize();
    skyU.uS.value.copy(SUN); skyU.uDusk.value = dusk * 0.85 + (t >= s.s3 && t < s.s4 ? 0.35 : 0) + (t < s.s2 ? 0.3 * (1 - ramp(t, 0, s.s2)) : 0);
    sun.position.copy(SUN).multiplyScalar(400); sun.target.position.set(0, 0, 150);
    sun.color.setRGB(1, 0.78 + 0.12 * Math.sin(el), 0.55 + 0.3 * Math.sin(el));
    sun.intensity = 4.2 * (1 - 0.7 * dusk);
    hemi.intensity = 0.5 * (1 - 0.5 * dusk);
    lampM.color.setRGB(3, 2.3, 1.4).multiplyScalar(0.2 + 1.6 * dusk);
    // umbrellas
    const eo = eout(o);
    for (let i = 0; i < NU; i++) {
      const p = pos[i];
      const hOpen = p.hi ? 15.3 : 14.4;
      const top = THREE.MathUtils.lerp(FOLD, hOpen, eo);
      dm.position.set(p.x, top / 2, p.z); dm.quaternion.identity(); dm.scale.set(1, top, 1); dm.updateMatrix(); mast.setMatrixAt(i, dm.matrix);
      dm.position.set(p.x, top - 0.7, p.z); dm.scale.set(1, 1, 1); dm.updateMatrix(); cap.setMatrixAt(i, dm.matrix);
      // membrane folded inside the cladding when closed
      const sxz = 0.05 + 0.95 * eo;
      dm.position.set(p.x, THREE.MathUtils.lerp(FOLD - 1.5, hOpen + 2.6, eo), p.z);
      dm.scale.set(sxz, 1 + 1.6 * (1 - eo), sxz); dm.updateMatrix(); mem.setMatrixAt(i, dm.matrix);
      // cladding panels hinge outward from the closed column
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2;
        dm.position.set(p.x + Math.cos(a) * 0.75, top - 7.4 * (1 - eo) - 0.2, p.z + Math.sin(a) * 0.75);
        dm.quaternion.setFromEuler(new THREE.Euler(0, -a + Math.PI / 2, 0));
        dm.rotateX(-(1.2 + 0.35) * eo);
        dm.scale.set(1, 1 - 0.35 * eo, 1); dm.updateMatrix(); panels.setMatrixAt(i * 4 + k, dm.matrix);
      }
      // eight main arms: 4 diagonal to the corners, 4 middle to edge midpoints
      const base = v3(p.x, top - 1.2, p.z);
      for (let k = 0; k < 8; k++) {
        const diag = k < 4, a = diag ? Math.PI / 4 + k * Math.PI / 2 : (k - 4) * Math.PI / 2;
        const reach = (diag ? HALF * 1.414 : HALF) * sxz * 0.97;
        const tip = v3(p.x + Math.cos(a) * reach, THREE.MathUtils.lerp(FOLD - 0.4, hOpen + 2.6 + (diag ? 0 : 0.6), eo), p.z + Math.sin(a) * reach);
        setArm(i * 8 + k, base, tip);
      }
      dm.quaternion.identity(); dm.scale.setScalar(1);
      dm.position.set(p.x + 0.8, 4, p.z); dm.updateMatrix(); lamps.setMatrixAt(i * 2, dm.matrix);
      dm.position.set(p.x - 0.8, 4, p.z); dm.updateMatrix(); lamps.setMatrixAt(i * 2 + 1, dm.matrix);
    }
    mem.instanceMatrix.needsUpdate = mast.instanceMatrix.needsUpdate = cap.instanceMatrix.needsUpdate = panels.instanceMatrix.needsUpdate = arms.instanceMatrix.needsUpdate = lamps.instanceMatrix.needsUpdate = true;
    // highlight arm groups on their words in s4
    const hl = t >= s.s4 && t < s.s5;
    armM.emissive.setRGB(1, 0.62, 0.2);
    armM.emissiveIntensity = hl ? 0.6 * (ramp(t, E.diag - 0.2, E.diag + 0.3) * (1 - ramp(t, E.kelopak, E.kelopak + 0.6))) : 0;
    // mist from masts near the camera
    const mOn = t >= s.s7 && t < s.s8 ? ramp(t, E.kipas - 0.4, E.kipas + 0.6) : 0;
    for (let i = 0; i < NM; i++) {
      const d = MD[i], p = pos[d.u];
      const age = (t + d.tb) % 3;
      mP[i * 3] = p.x + Math.cos(d.a) * (1.5 + age * 2.2); mP[i * 3 + 1] = 11 - age * 1.6; mP[i * 3 + 2] = p.z + Math.sin(d.a) * (1.5 + age * 2.2);
      mS[i] = 0.6 + age * 1.4; mA[i] = mOn * 0.12 * (1 - age / 3);
    }
    mG.attributes.position.needsUpdate = mG.attributes.sz.needsUpdate = mG.attributes.al.needsUpdate = true;

    // cameras
    const hp = pos[HERO];
    if (t < s.s2) {
      const u = t / s.s2;
      look(v3(-120 + 40 * u, 150 - 20 * u, 480 - 40 * u), v3(0, 0, 170));
    } else if (t < s.s3) {
      const u = (t - s.s2) / (s.s3 - s.s2);
      look(v3(-180 + 300 * u, 70, 120 + 120 * u), v3(-40 + 160 * u, 8, 200));
    } else if (t < s.s4) {
      const u = (t - s.s3) / (s.s4 - s.s3);
      look(v3(hp.x - 14 + 4 * u, 3 + 6 * u, hp.z + 30 - 4 * u), v3(hp.x, 13 + 4 * u, hp.z));
    } else if (t < s.s5) {
      const u = (t - s.s4) / (s.s5 - s.s4);
      const a = 2.3 + 0.9 * u;
      look(v3(hp.x + Math.cos(a) * 34, 6 + 18 * u, hp.z + Math.sin(a) * 34), v3(hp.x, 15 + 1 * u, hp.z));
    } else if (t < s.s6) {
      const u = (t - s.s5) / (s.s6 - s.s5);
      look(v3(hp.x - 6 + 8 * u, 2.2, hp.z + 8 - 4 * u), v3(hp.x + 4, 16, hp.z - 6));
    } else if (t < s.s7) {
      const u = (t - s.s6) / (s.s7 - s.s6);
      look(v3(hp.x - 60 + 20 * u, 11 + 2 * u, hp.z + 9), v3(hp.x + 10, 15.5, hp.z + 4));
    } else if (t < s.s8) {
      const u = (t - s.s7) / (s.s8 - s.s7);
      look(v3(hp.x + 10 - 6 * u, 1.8, hp.z + 40 - 10 * u), v3(hp.x, 9, hp.z - 10));
    } else {
      const u = ramp(t, s.s8, s.dur);
      look(v3(60 - 100 * u, 60 + 60 * u, 420 + 60 * u), v3(0, 0, 150));
    }
    comp.render();
  };
}
