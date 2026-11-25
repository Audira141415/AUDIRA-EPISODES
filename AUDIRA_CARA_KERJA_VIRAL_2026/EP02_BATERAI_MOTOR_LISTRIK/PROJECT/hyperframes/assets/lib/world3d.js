// EP02 THE CHAIN. A parked e-scooter, its battery pack, one cell cut open, and a magnified electrode stack where ions move and heat builds.
// A thermal-camera pass maps scene brightness to an ironbow palette during the runaway chapters. Units: centimetres.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, box, cyl, std } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.5, 8000);
  const rnd = mulberry(2026);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    ctrl: A_("s2:kontrolernya", s.s2 + 3), bms2: A_("s2:BMS-nya", s.s2 + 5), masuk: A_("s2:masuk", s.s2 + 9),
    anoda: A_("s3:anoda", s.s3 + 4), katoda: A_("s3:katoda", s.s3 + 5), elek: A_("s3:elektrolit", s.s3 + 6), sekat: A_("s3:sekat", s.s3 + 8),
    dicas: A_("s4:dicas", s.s4 + 0.5), sekat4: A_("s4:Sekat", s.s4 + 4), bms: A_("s4:BMS", s.s4 + 7),
    lebih: A_("s5:berlebih", s.s5 + 1), d90: A_("s5:90", s.s5 + 6), d130: A_("s5:130", s.s5 + 10), temu: A_("s5:bertemu", s.s5 + 13),
    run: A_("s6:runaway", s.s6 + 1), oks: A_("s6:oksigen", s.s6 + 6), nyala: A_("s6:menyala", s.s6 + 8), d500: A_("s6:500", s.s6 + 10), sebelah: A_("s6:sebelahnya", s.s6 + 13),
    charger: A_("s7:charger", s.s7 + 1), gembung: A_("s7:menggembung", s.s7 + 5), pemadam: A_("s7:pemadam", s.s7 + 8),
  };
  const dm = new THREE.Object3D();

  // ================= A: street, night, parked scooter =================
  const A = new THREE.Scene();
  A.background = new THREE.Color(0x06070b);
  A.environment = skyEnv(r, 0x0c1424, 0x1a1c24, 0x050505, v3(0, 1, 0), 0xffffff, 0);
  A.environmentIntensity = 0.6;
  A.fog = new THREE.FogExp2(0x07080c, 0.0016);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), std(0x15171b, 0.55, 0.1));
  street.rotation.x = -Math.PI / 2; street.receiveShadow = true; A.add(street);
  // shop row: shutters and a lit sign band
  const shutM = new THREE.MeshStandardMaterial({ color: 0x5b6068, roughness: 0.5, metalness: 0.6 });
  for (let i = -3; i <= 3; i++) {
    box(300, 260, 6, shutM, i * 310, 130, -260, A);
    box(300, 40, 8, new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? 0.9 : 0.2, i % 2 ? 0.75 : 0.5, i % 2 ? 0.4 : 1.1) }), i * 310, 300, -254, A);
  }
  box(4000, 6, 60, std(0x2a2c30, 0.7), 0, 3, -200, A);
  const lamp = new THREE.SpotLight(0xffd7a8, 60000, 0, 0.7, 0.6, 1.6);
  lamp.position.set(-150, 520, 120); lamp.target.position.set(0, 0, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048);
  A.add(lamp, lamp.target);
  A.add(new THREE.HemisphereLight(0x3a4a6a, 0x0a0a0a, 0.5));

  // scooter, about 190 cm long
  const sc = new THREE.Group(); A.add(sc);
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xd9dde2, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.15 });
  const trim = std(0x1d2025, 0.5, 0.3), tyre = std(0x111214, 0.8), rimM = std(0x8a9099, 0.35, 0.9);
  const rounded = (w, h, d, rad, mat, x, y, z) => {
    const shp = new THREE.Shape(); const hw = w / 2 - rad, hh = h / 2 - rad;
    shp.absarc(hw, hh, rad, 0, Math.PI / 2); shp.absarc(-hw, hh, rad, Math.PI / 2, Math.PI); shp.absarc(-hw, -hh, rad, Math.PI, Math.PI * 1.5); shp.absarc(hw, -hh, rad, Math.PI * 1.5, Math.PI * 2);
    const g = new THREE.ExtrudeGeometry(shp, { depth: d, bevelEnabled: true, bevelSize: 3, bevelThickness: 3, bevelSegments: 3, curveSegments: 10 });
    g.translate(0, 0, -d / 2);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; sc.add(m); return m;
  };
  [[-62, 0], [64, 0]].forEach(([x]) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(24, 8, 14, 40), tyre); w.position.set(x, 32, 0); w.castShadow = true; sc.add(w);
    const rm = cyl(17, 17, 9, 24, rimM, x, 32, 0, sc); rm.rotation.x = Math.PI / 2;
  });
  rounded(120, 30, 46, 12, paint, -10, 62, 0);           // rear body with under-seat compartment
  rounded(70, 14, 40, 6, trim, 10, 40, 0);                // floorboard
  const front = rounded(10, 84, 40, 4, paint, 58, 84, 0); front.rotation.z = -0.52;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 22), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.1, 0.1) })); tail.position.set(-72, 66, 0); sc.add(tail);
  const fork = cyl(2.2, 2.2, 80, 10, rimM, 70, 70, 0, sc); fork.rotation.z = 0.32;
  const stem = cyl(3, 3, 30, 10, trim, 76, 118, 0, sc); stem.rotation.z = 0.3;
  rounded(28, 18, 30, 6, paint, 76, 112, 0);
  const fender = new THREE.Mesh(new THREE.TorusGeometry(31, 4, 8, 20, Math.PI * 0.8), paint); fender.position.set(64, 32, 0); fender.rotation.z = Math.PI * 0.1; sc.add(fender);
  const seatPivot = new THREE.Group(); seatPivot.position.set(42, 82, 0); sc.add(seatPivot);
  const seat = rounded(86, 12, 40, 6, std(0x16181b, 0.75), -48, 0, 0); sc.remove(seat); seatPivot.add(seat);
  const bar = cyl(2.4, 2.4, 72, 10, rimM, 84, 128, 0, sc); bar.rotation.x = Math.PI / 2;
  const head = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.2, 1.3) })); head.position.set(90, 112, 0); head.scale.set(0.5, 1, 1.4); sc.add(head);
  // compartment contents: battery pack and controller box
  const compartment = box(96, 26, 40, std(0x0a0b0d, 0.9), -12, 66, 0, sc);
  compartment.visible = false;
  const packBox = box(62, 16, 30, std(0x2b4a66, 0.4, 0.4), -20, 82, 0, sc);
  const ctrlBox = box(22, 10, 18, std(0x2a2a2a, 0.35, 0.8), 26, 80, 0, sc);
  const ctrlGlow = new THREE.Mesh(new THREE.BoxGeometry(23, 11, 19), new THREE.MeshBasicMaterial({ color: 0xff5a20, transparent: true, opacity: 0, depthWrite: false }));
  ctrlGlow.position.copy(ctrlBox.position); sc.add(ctrlGlow);
  const bmsBoard = box(30, 2, 14, new THREE.MeshStandardMaterial({ color: 0x0f5a3a, roughness: 0.5, emissive: 0x00ff88, emissiveIntensity: 0 }), -20, 91, 0, sc);
  const fireLight = new THREE.PointLight(0xff6a1a, 0, 0, 1.6); fireLight.position.set(-6, 95, 0); sc.add(fireLight);
  // smoke and flame particles from the compartment
  const NS = 520;
  const SD = [];
  for (let i = 0; i < NS; i++) SD.push({ tb: rnd() * 4, x: (rnd() - 0.5) * 70, z: (rnd() - 0.5) * 30, sp: 25 + rnd() * 30, dr: (rnd() - 0.5) * 14, k: rnd() });
  const smG = new THREE.BufferGeometry();
  const smP = new Float32Array(NS * 3), smS = new Float32Array(NS), smA = new Float32Array(NS), smC = new Float32Array(NS);
  smG.setAttribute("position", new THREE.BufferAttribute(smP, 3));
  smG.setAttribute("sz", new THREE.BufferAttribute(smS, 1)); smG.setAttribute("al", new THREE.BufferAttribute(smA, 1)); smG.setAttribute("hot", new THREE.BufferAttribute(smC, 1));
  const puffMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `attribute float sz,al,hot;varying float vA,vH;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*2790./max(1.,-mv.z);vA=al;vH=hot;}`,
    fragmentShader: `varying float vA,vH;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;vec3 c=mix(vec3(.09,.085,.08),vec3(3.2,1.1,.25),vH);gl_FragColor=vec4(c,vA*pow(1.-d,1.5));}`,
  });
  const smoke = new THREE.Points(smG, puffMat); smoke.frustumCulled = false; sc.add(smoke);
  // charger on the floor for the safety chapter
  const charger = box(18, 7, 11, std(0x1b1d21, 0.4, 0.3), -120, 3.5, 40, A);
  const chLed = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 2.5, 0.6) })); chLed.position.set(-112, 7.5, 40); A.add(chLed);
  const cablePts = [v3(-112, 4, 36), v3(-90, 1, 20), v3(-60, 1, 26), v3(-40, 30, 18), v3(-30, 60, 20)];
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 40, 0.9, 6), std(0x0d0d0f, 0.6)); A.add(cable);

  // ================= B: battery pack and the cut-open cell =================
  const B = new THREE.Scene();
  B.background = new THREE.Color(0x05060a);
  B.environment = skyEnv(r, 0x26344c, 0x10141c, 0x030303, v3(0.4, 1, 0.3), 0xffffff, 1);
  B.environmentIntensity = 0.8;
  const kB = new THREE.SpotLight(0xffffff, 26000, 0, 0.6, 0.5, 1.6); kB.position.set(-40, 140, 80); kB.castShadow = true; kB.shadow.mapSize.set(2048, 2048); B.add(kB, kB.target);
  const rimB = new THREE.DirectionalLight(0x6aa8ff, 1.6); rimB.position.set(60, 40, -80); B.add(rimB);
  const floorB = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), std(0x0b0d11, 0.4, 0.5)); floorB.rotation.x = -Math.PI / 2; floorB.receiveShadow = true; B.add(floorB);
  const tray = box(70, 3, 46, std(0x30353c, 0.5, 0.6), 0, 1.5, 0, B);
  const NXc = 8, NZc = 5, CR = 2.1, CH = 7;
  const cellGeo = new THREE.CylinderGeometry(CR, CR, CH, 28);
  const cellMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.2, emissive: 0xffffff, emissiveIntensity: 1 });
  const cells = new THREE.InstancedMesh(cellGeo, cellMat, NXc * NZc);
  cells.castShadow = cells.receiveShadow = true;
  const CP = [];
  for (let i = 0; i < NXc; i++) for (let j = 0; j < NZc; j++) {
    const p = v3((i - (NXc - 1) / 2) * 4.6, 3 + CH / 2, (j - (NZc - 1) / 2) * 4.6);
    CP.push(p);
    dm.position.copy(p); dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); cells.setMatrixAt(CP.length - 1, dm.matrix);
  }
  B.add(cells);
  for (let i = 0; i < NXc; i++) box(4, 0.4, 22, std(0xc9ccd0, 0.3, 0.9), (i - (NXc - 1) / 2) * 4.6, 3 + CH + 0.2, 0, B);
  // cut-open cell, enlarged: a 270 degree jelly roll of cathode / separator / anode / separator
  const big = new THREE.Group(); big.position.set(0, 30, 0); big.scale.setScalar(4); B.add(big);
  const LAY = [
    { c: 0x9aa1a8, m: 0.9, r: 0.35, n: "can" },
  ];
  const ringMats = {
    cat: new THREE.MeshStandardMaterial({ color: 0x3d4045, roughness: 0.55, metalness: 0.5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0 }),
    sep: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6, transparent: true, opacity: 0.85, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0 }),
    ano: new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.45, metalness: 0.2, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0 }),
  };
  const order = ["cat", "sep", "ano", "sep"];
  const rings = [];
  for (let k = 0; k < 16; k++) {
    const type = order[k % 4];
    const rr = 0.35 + k * 0.105;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, CH * 0.92, 48, 1, true, Math.PI * 0.5, Math.PI * 1.5), ringMats[type]);
    m.castShadow = true; big.add(m); rings.push({ m, type, k });
  }
  const can = new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, CH, 48, 1, true, Math.PI * 0.5, Math.PI * 1.5), std(0x2f7fb0, 0.35, 0.3, { side: THREE.DoubleSide }));
  big.add(can);
  const capT = cyl(CR, CR, 0.25, 48, std(0xb8bcc2, 0.3, 0.9), 0, CH / 2, 0, big);
  const capB = cyl(CR, CR, 0.25, 48, std(0xb8bcc2, 0.3, 0.9), 0, -CH / 2, 0, big);
  // electrolyte: faint blue glow filling the roll
  const elec = new THREE.Mesh(new THREE.CylinderGeometry(CR * 0.98, CR * 0.98, CH * 0.9, 48, 1, false, Math.PI * 0.5, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: 0x3fa9ff, transparent: true, opacity: 0, depthWrite: false }));
  big.add(elec);
  // vent jets for the runaway (particles from cell tops)
  const NJ = 900;
  const JD = [];
  for (let i = 0; i < NJ; i++) JD.push({ c: Math.floor(rnd() * CP.length), tb: rnd() * 1.4, a: rnd() * Math.PI * 2, sp: 30 + rnd() * 40, k: rnd() });
  const jG = new THREE.BufferGeometry();
  const jP = new Float32Array(NJ * 3), jS = new Float32Array(NJ), jA = new Float32Array(NJ), jH = new Float32Array(NJ);
  jG.setAttribute("position", new THREE.BufferAttribute(jP, 3)); jG.setAttribute("sz", new THREE.BufferAttribute(jS, 1)); jG.setAttribute("al", new THREE.BufferAttribute(jA, 1)); jG.setAttribute("hot", new THREE.BufferAttribute(jH, 1));
  const jets = new THREE.Points(jG, puffMat.clone()); jets.frustumCulled = false; B.add(jets);

  // ================= C: magnified electrode stack =================
  const C = new THREE.Scene();
  C.background = new THREE.Color(0x04050a);
  C.environment = B.environment;
  C.environmentIntensity = 0.8;
  const kC = new THREE.DirectionalLight(0xffffff, 2.4); kC.position.set(-20, 40, 50); C.add(kC);
  const rimC = new THREE.DirectionalLight(0x6aa8ff, 1.4); rimC.position.set(30, 10, -40); C.add(rimC);
  const catM = new THREE.MeshStandardMaterial({ color: 0x5a3f2c, roughness: 0.5, metalness: 0.4, emissive: 0xffffff, emissiveIntensity: 0 });
  const anoM = new THREE.MeshStandardMaterial({ color: 0x1a1b1f, roughness: 0.4, metalness: 0.3, emissive: 0xffffff, emissiveIntensity: 0 });
  const sepM = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.7, transparent: true, opacity: 0.6, emissive: 0xffffff, emissiveIntensity: 0, depthWrite: false });
  const cat = box(14, 40, 30, catM, -16, 0, 0, C);
  const ano = box(14, 40, 30, anoM, 16, 0, 0, C);
  // graphite layers on the anode face
  for (let k = 0; k < 14; k++) box(0.6, 40, 30, std(0x2a2c32, 0.35, 0.5), 9.4 + k * 0.9, 0, 0, C);
  const sep = box(1.4, 40, 30, sepM, 0, 0, 0, C);
  const sei = box(0.5, 40, 30, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 1.6, 0.9), transparent: true, opacity: 0.5 }), 8.8, 0, 0, C);
  box(1, 40, 30, std(0xb9bfc6, 0.3, 0.95), -23.5, 0, 0, C);   // aluminium foil
  box(1, 40, 30, std(0xc8763a, 0.3, 0.95), 23.5, 0, 0, C);    // copper foil
  const elC = box(16, 40, 30, new THREE.MeshBasicMaterial({ color: 0x2b7bd6, transparent: true, opacity: 0.12, depthWrite: false }), 0, 0, 0, C);
  const NI = 140;
  const ID = [];
  for (let i = 0; i < NI; i++) ID.push({ y: (rnd() - 0.5) * 36, z: (rnd() - 0.5) * 26, ph: rnd(), sp: 0.25 + rnd() * 0.25, w: rnd() * 6 });
  const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.2, 3.2) }), NI);
  ions.frustumCulled = false; C.add(ions);
  const spark = new THREE.PointLight(0xffffff, 0, 0, 1.5); spark.position.set(0, 0, 18); C.add(spark);
  const sparkM = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5, 3), transparent: true, opacity: 0 }));
  C.add(sparkM);

  // ================= post: bloom then optional ironbow thermal mapping =================
  const thermal = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uOn: { value: 0 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uOn;varying vec2 vUv;
      vec3 iron(float x){x=clamp(x,0.,1.);vec3 a=vec3(.02,.0,.08),b=vec3(.35,.02,.45),c=vec3(.85,.12,.25),d=vec3(1.,.55,.05),e=vec3(1.,.95,.75);
      return x<.25?mix(a,b,x/.25):x<.5?mix(b,c,(x-.25)/.25):x<.75?mix(c,d,(x-.5)/.25):mix(d,e,(x-.75)/.25);}
      void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.3,.45,.25));float h=1.-exp(-l*1.6);
      vec3 th=iron(h*1.05);vec2 g=vUv*vec2(1080.,1920.);th*=.93+.07*step(.5,fract(g.y/3.));
      gl_FragColor=vec4(mix(c.rgb,th,uOn),1.);}`,
  }));
  const mk = (scene) => {
    const c = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
    c.addPass(new RenderPass(scene, cam));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.5, 1.1));
    c.addPass(new OutputPass());
    c.addPass(thermal);
    return c;
  };
  const cA = mk(A), cB = mk(B), cC = mk(C);
  const look = (p, q) => { cam.position.copy(p); cam.lookAt(q); };
  const lv = (a, b, u) => a.clone().lerp(b, u);
  const heatCol = new THREE.Color();
  const tcol = (h) => heatCol.setRGB(0.08 + 3.2 * h * h, 0.25 + 0.9 * h * h * h, 0.55 * (1 - h) + 0.3 * h * h * h * h);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    let th = 0;
    // ---------- A: street (s1, s2, s7, s8) ----------
    if (t < s.s3 || t >= s.s7) {
      const burning = t < s.s2 + 2;
      const inS2 = t >= s.s2 && t < s.s3;
      const open = inS2 ? ramp(t, s.s2 + 1.2, s.s2 + 2.6) : 0;
      seatPivot.rotation.z = open * 1.15;
      packBox.visible = ctrlBox.visible = bmsBoard.visible = inS2;
      compartment.visible = false;
      ctrlGlow.material.opacity = inS2 ? 0.55 * ramp(t, E.ctrl - 0.2, E.ctrl + 0.3) * (0.7 + 0.3 * Math.sin(t * 9)) : 0;
      bmsBoard.material.emissiveIntensity = inS2 ? 0.35 * ramp(t, E.bms2 - 0.2, E.bms2 + 0.3) * (0.6 + 0.4 * Math.sin(t * 5)) : 0;
      const flame = burning ? ramp(t, 0.3, 1.6) * (1 - ramp(t, s.s2 + 0.5, s.s2 + 2)) : 0;
      fireLight.intensity = flame * (9000 + 4000 * Math.sin(t * 23) * Math.sin(t * 7.3));
      for (let i = 0; i < NS; i++) {
        const d = SD[i];
        const age = (t * 1.0 + d.tb) % 4;
        const on = flame > 0.01;
        const hot = d.k < 0.28 ? Math.max(0, 1 - age * 1.8) : 0;
        smP[i * 3] = -8 + d.x * (0.4 + age * 0.25) + d.dr * age;
        smP[i * 3 + 1] = 82 + age * d.sp * (hot > 0 ? 0.7 : 1);
        smP[i * 3 + 2] = d.z * (0.5 + age * 0.3);
        smS[i] = (hot > 0 ? 6 : 10) + age * (hot > 0 ? 2 : 16);
        smA[i] = on ? (hot > 0 ? 0.8 * hot : 0.5 * Math.min(1, age * 2) * (1 - age / 4)) * flame : 0;
        smC[i] = hot;
      }
      smG.attributes.position.needsUpdate = smG.attributes.sz.needsUpdate = smG.attributes.al.needsUpdate = smG.attributes.hot.needsUpdate = true;
      const calm = t >= s.s7;
      charger.visible = chLed.visible = cable.visible = calm;
      lamp.color.set(calm ? 0xe8f0ff : 0xffd7a8); lamp.intensity = calm ? 140000 : 60000;
      if (t < s.s2) {
        const u = t / s.s2;
        look(v3(-380 + 90 * u, 150 - 20 * u, 560 - 90 * u), v3(0, 66, 0));
      } else if (inS2) {
        const u = ramp(t, s.s2, E.masuk + 0.8);
        look(lv(v3(-300, 200, 380), v3(-90, 230, 150), u), lv(v3(0, 70, 0), v3(-2, 80, 0), u));
      } else if (t < s.s8) {
        const u = (t - s.s7) / (s.s8 - s.s7);
        look(v3(-460 + 60 * u, 130 + 10 * u, 470 - 40 * u), v3(-50, 45, 10));
      } else {
        const u = ramp(t, s.s8, s.dur);
        look(v3(-320 - 80 * u, 150 + 80 * u, 520 + 120 * u), v3(0, 70, 0));
      }
      thermal.uniforms.uOn.value = 0;
      cA.render();
      return;
    }
    // ---------- C: electrode stack (s4, s5) ----------
    if (t >= s.s4 && t < s.s6) {
      const charge = t < s.s5 ? ramp(t, E.dicas, E.dicas + 1) : 1;
      const heat = t >= s.s5 ? ramp(t, E.lebih, E.temu + 0.5) : 0;
      const seiBreak = ramp(t, E.d90, E.d90 + 1.2);
      const melt = ramp(t, E.d130, E.temu);
      const short = t >= E.temu ? ramp(t, E.temu - 0.1, E.temu + 0.2) : 0;
      // ions travel cathode -> anode through the separator while charging
      for (let i = 0; i < NI; i++) {
        const d = ID[i];
        const prog = ((t - s.s4) * d.sp + d.ph) % 1;
        let x = -18 + prog * 34;
        if (t >= s.s5) x = THREE.MathUtils.lerp(x, -6 + d.w * 2, melt);
        const jit = Math.sin(t * 7 + i) * 0.4 * (1 + heat * 3);
        dm.position.set(x, d.y + jit, d.z + Math.cos(t * 6 + i) * 0.4 * (1 + heat * 3));
        dm.scale.setScalar(charge * (x > -9 && x < 9 ? 1.3 : 0.9));
        dm.rotation.set(0, 0, 0); dm.updateMatrix(); ions.setMatrixAt(i, dm.matrix);
      }
      ions.instanceMatrix.needsUpdate = true;
      sei.material.opacity = 0.5 * (1 - seiBreak) + 0.5 * seiBreak * (0.5 + 0.5 * Math.sin(t * 30));
      sei.scale.y = 1 - seiBreak * 0.35 * (0.5 + 0.5 * Math.sin(t * 13));
      // separator shrinks and the electrodes slide together
      sep.scale.set(1 - melt * 0.7, 1 - melt * 0.5, 1 - melt * 0.4);
      sepM.opacity = 0.6 * (1 - melt * 0.8);
      cat.position.x = -16 + melt * 8.3; ano.position.x = 16 - melt * 8.3;
      elC.material.opacity = 0.12 * (1 - melt * 0.5);
      catM.emissiveIntensity = anoM.emissiveIntensity = heat * 0.18 + short * 0.8;
      catM.emissive.setRGB(1, 0.35, 0.1); anoM.emissive.setRGB(1, 0.3, 0.1);
      sparkM.material.opacity = short * (0.6 + 0.4 * Math.sin(t * 40));
      sparkM.scale.setScalar(2 + short * 4 * (0.7 + 0.3 * Math.sin(t * 31)));
      spark.intensity = short * 9000;
      const u = (t - s.s4) / (s.s6 - s.s4);
      look(v3(-34 + 20 * u, 22 - 6 * u, 92 - 18 * u - short * 10), v3(0, -2, 0));
      th = t >= s.s5 ? ramp(t, E.lebih, E.lebih + 1.2) * 0.85 : 0;
      thermal.uniforms.uOn.value = th;
      cC.render();
      return;
    }
    // ---------- B: pack and cell (s3, s6) ----------
    const inS3 = t < s.s4;
    big.visible = inS3;
    cells.visible = true;
    if (inS3) {
      const pop = ramp(t, s.s3 + 0.6, s.s3 + 2.2);
      big.position.set(0, 9 + 22 * pop, 0);
      big.rotation.y = -0.6 + 0.25 * (t - s.s3) / (s.s4 - s.s3);
      big.scale.setScalar(1 + 3 * pop);
      rings.forEach(({ m, type, k }) => {
        const hl = type === "ano" ? ramp(t, E.anoda - 0.1, E.anoda + 0.4) * (1 - ramp(t, E.katoda, E.katoda + 0.4))
          : type === "cat" ? ramp(t, E.katoda - 0.1, E.katoda + 0.4) * (1 - ramp(t, E.elek, E.elek + 0.4))
          : ramp(t, E.sekat - 0.1, E.sekat + 0.4);
        m.material.emissive.setRGB(type === "cat" ? 1 : type === "ano" ? 0.3 : 0.4, type === "cat" ? 0.5 : type === "ano" ? 0.9 : 0.9, type === "sep" ? 1.4 : 0.3);
        m.material.emissiveIntensity = hl * 0.7;
        m.position.y = 0;
      });
      elec.material.opacity = 0.22 * ramp(t, E.elek - 0.1, E.elek + 0.5) * (1 - ramp(t, E.sekat, E.sekat + 0.5) * 0.5);
      for (let i = 0; i < CP.length; i++) cells.setColorAt(i, heatCol.setRGB(0.15, 0.45, 0.75));
      cellMat.emissiveIntensity = 0.12;
      const u = (t - s.s3) / (s.s4 - s.s3);
      look(v3(-60 + 30 * u, 70 - 10 * u, 110 - 20 * u), v3(0, 22 * pop + 4, 0));
      jets.visible = false;
    } else {
      // runaway: cell 0 at the corner, heat spreads to neighbours one ring at a time
      const t0 = E.run;
      const step = Math.max(0.7, (E.sebelah + 2 - t0) / 9);
      for (let i = 0; i < CP.length; i++) {
        const ix = Math.floor(i / NZc), jz = i % NZc;
        const ring = Math.max(ix, jz);
        const start = i === 0 ? s.s6 - 0.5 : t >= E.sebelah - 0.5 ? E.sebelah - 0.5 + (ring - 1) * step : 9999;
        const h = clamp01((t - start) / 3.5) * (i === 0 ? 1 : 0.95);
        const h0 = i === 0 ? ramp(t, s.s6, E.d500 + 0.5) : h;
        cells.setColorAt(i, tcol(h0));
        dm.position.copy(CP[i]); dm.position.y += Math.sin(t * 40 + i) * 0.1 * h0;
        dm.scale.set(1 + 0.05 * h0, 1 + 0.03 * h0, 1 + 0.05 * h0); dm.rotation.set(0, 0, 0); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix);
      }
      cells.instanceMatrix.needsUpdate = true;
      cellMat.emissiveIntensity = 1.0;
      const vent = ramp(t, E.oks - 0.3, E.nyala);
      for (let i = 0; i < NJ; i++) {
        const d = JD[i];
        const ix = Math.floor(d.c / NZc), jz = d.c % NZc, ring = Math.max(ix, jz);
        const act = d.c === 0 ? vent : t >= E.sebelah ? clamp01((t - (E.sebelah + (ring - 1) * step + 1.5)) / 1) : 0;
        const age = (t * 1.3 + d.tb) % 1.4;
        const p = CP[d.c];
        jP[i * 3] = p.x + Math.cos(d.a) * age * 4;
        jP[i * 3 + 1] = p.y + CH / 2 + age * d.sp;
        jP[i * 3 + 2] = p.z + Math.sin(d.a) * age * 4;
        jS[i] = 2 + age * 8;
        jH[i] = Math.max(0, 1 - age * (t > E.nyala ? 0.8 : 2.5));
        jA[i] = act * (0.9 - age * 0.6);
      }
      jG.attributes.position.needsUpdate = jG.attributes.sz.needsUpdate = jG.attributes.al.needsUpdate = jG.attributes.hot.needsUpdate = true;
      jets.visible = true;
      const u = (t - s.s6) / (s.s7 - s.s6);
      const pull = ramp(t, E.sebelah - 0.5, E.sebelah + 2.5);
      look(lv(v3(-58, 46, 62), v3(-10, 120, 120), pull).add(v3(4 * u, 0, 0)), lv(CP[0].clone().add(v3(0, 4, 0)), v3(0, 6, 0), pull));
      th = ramp(t, s.s6, s.s6 + 1.0);
    }
    cells.instanceColor.needsUpdate = true;
    thermal.uniforms.uOn.value = th;
    cB.render();
  };
}
